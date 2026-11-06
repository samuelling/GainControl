// THE PERCEPTION CONSOLE — the computer inside the Adline Lab's dark booth. A menu of bistable demos, a replication of
// Carrasco, Ling & Read (2004), and ports of the PS 327 MATLAB labs. Runs as a minigame in #panel (perceptionConsole)
// or on its own page (console.html).
//
// The console chrome follows the game's line language. The stimuli do not, on purpose: the booth's monitor shows real
// stimuli (Gabors, grey levels, coloured letters, dot fields) on a <canvas>, because they are the experiment.
//
// A module is { id, group, title, sub, blurb, run(ctx) → Promise }. ctx is the module's whole world:
//   ctx.g / ctx.W / ctx.H / ctx.ppd / ctx.cx / ctx.cy   the stimulus canvas (960×540, 36 px per degree)
//   ctx.say(text)                                       the console's line of instructions
//   ctx.key(keys, { buttons, timeout })                 wait for a key (or its on-screen button) → { key, rt }
//   ctx.choose(prompt, [[value, label], …])             a menu of buttons → value
//   ctx.number(prompt)                                  typed (or keypad) number → Number
//   ctx.frames(n) / ctx.wait(ms) / ctx.raf()            timing, in display frames
//   ctx.loop(draw(t, dt) → bool)                        run an animation until draw returns false or the run stops
//   ctx.plot(spec) / ctx.csv(name, header, rows)        results as a game-style chart, and a CSV download
//   ctx.clear(grey) / ctx.fix()                         helpers
import { seg, segW, chip } from "../gfx.js";
import { MODULES } from "./modules.js";

const CSS = `
.pc { padding: 0 1.2cqw !important; }
.pc .pcbody { flex: 1 1 0; min-height: 0; display: flex; gap: 1.2cqw; padding: .6cqw 0; }
.pc .menu { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: .8cqw 1.2cqw; align-content: start; overflow: auto; }
.pc .grp { font-size: 1.15cqw; color: var(--M); letter-spacing: .12em; border-bottom: .08cqw solid var(--D); padding-bottom: .2cqw; margin-bottom: .2cqw; }
.pc .col { display: flex; flex-direction: column; gap: .6cqw; }
.pc .tile { border: .12cqw solid var(--W); padding: .5cqw .7cqw; cursor: pointer; background: #000; }
.pc .tile:hover { border-color: var(--G); } .pc .tile:hover .tt { color: var(--G); }
.pc .tile .tt { font-size: 1.7cqw; font-weight: 600; line-height: 1.1; } .pc .tile .ts { font-size: 1.1cqw; color: var(--M); line-height: 1.2; margin-top: .2cqw; }
.pc .tile .tb { font-size: 1.05cqw; color: var(--A); letter-spacing: .08em; }
.pc .crt { flex: 1; position: relative; border: .12cqw solid var(--M); background: #000; min-width: 0; }
.pc .crt canvas, .pc .crt svg.res { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.pc .crt svg.res { display: none; } .pc .crt.showres svg.res { display: block; } .pc .crt.showres canvas { visibility: hidden; }
.pc .coachline { font-size: 1.55cqw !important; text-transform: none; min-height: 4.4cqw; }
.pc .coachline .txt { text-transform: uppercase; }
.pc .bar { flex-wrap: wrap; row-gap: .4cqw; }
.pc .bar button.k { background: #000; color: var(--W); border: .1cqw solid var(--W); }
.pc .bar button.k:hover { background: var(--G); color: #000; }
.pc .bar .kb { color: var(--M); font-size: 1.05cqw; margin-left: .3cqw; }
.pc .bar .entry { font: 600 1.8cqw "Saira Condensed", sans-serif; color: var(--A); min-width: 6cqw; border-bottom: .1cqw solid var(--A); text-align: right; padding: 0 .4cqw; }
`;
function css() { if (document.getElementById("css-console")) return; const s = document.createElement("style"); s.id = "css-console"; s.textContent = CSS; document.head.appendChild(s); }

export const W = 960, H = 540, PPD = 36;
const ABORT = new Error("abort");
const sfx = (n, o) => window.SFX && window.SFX.play(n, o);
const KEYNAME = { " ": "SPACE", ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT", Enter: "ENTER" };

export function perceptionConsole(el, { score = () => {}, standalone = false } = {}) {
  css();
  return new Promise(resolve => {
    let run = null, pending = null, lastRes = null, done = 0;
    el.classList.add("show");
    el.innerHTML = `<div class="screen pc">
      <svg class="t hd" viewBox="0 0 640 40">${seg("PERCEPTION CONSOLE", 16, 9, 16, "sW", 1.5)}${seg("BOOTH 114  ADLINE LAB", 236, 12, 5, "sM", .8)}<g id="pcmode"></g></svg>
      <div class="pcbody"></div>
      <div class="coachline"><span class="who" style="background:var(--G)">CONSOLE</span> <span class="txt" style="color:var(--G)"></span></div>
      <div class="bar"><span class="status"></span><span class="btns" style="display:flex;gap:.6cqw;flex-wrap:wrap;align-items:center"></span><button data-b="back" class="off">${standalone ? "MENU" : "CLOSE"}</button></div></div>`;
    const body = el.querySelector(".pcbody"), txt = el.querySelector(".coachline .txt"), btns = el.querySelector(".btns"), status = el.querySelector(".status"), backB = el.querySelector("[data-b=back]");
    const mode = (t) => { el.querySelector("#pcmode").innerHTML = t ? chip(t, 640 - segW(t, 5) - 18, 13, 5, "fA") : ""; };
    const say = (t) => { txt.textContent = t; };

    /* ---------------- the menu ---------------- */
    function menu() {
      run = null; mode(""); status.textContent = done ? `${done} RUN${done > 1 ? "S" : ""} THIS SESSION` : ""; btns.innerHTML = ""; backB.textContent = standalone ? "ABOUT" : "CLOSE";
      const groups = ["DEMOS", "CLASSICS", "PS 327 LABS"];
      body.innerHTML = `<div class="menu">${groups.map(g => `<div class="col"><div class="grp">${g}</div>${MODULES.filter(m => m.group === g).map(m =>
        `<div class="tile" data-mod="${m.id}">${m.tag ? `<div class="tb">${m.tag}</div>` : ""}<div class="tt">${m.title}</div><div class="ts">${m.sub}</div></div>`).join("")}</div>`).join("")}</div>`;
      say(standalone ? "Pick a demo, a classic experiment or a lab. Everything runs here; results can be saved as CSV." : "The booth's computer. Somebody left it logged in as PS327. Pick a demo, a classic experiment or a lab.");
    }

    /* ---------------- running a module ---------------- */
    async function start(m) {
      mode(m.title.length > 26 ? m.tag || m.group : m.title); backB.textContent = "MENU";
      body.innerHTML = `<div class="crt"><canvas width="${W}" height="${H}"></canvas><svg class="res t" viewBox="0 0 ${W} ${H}"></svg></div>`;
      const canvas = body.querySelector("canvas"), g = canvas.getContext("2d"), crt = body.querySelector(".crt"), res = body.querySelector("svg.res");
      const R = run = { stop: false };
      const chk = () => { if (R.stop) throw ABORT; };
      const ctx = {
        g, W, H, ppd: PPD, cx: W / 2, cy: H / 2, canvas,
        say, status: (t) => { status.textContent = t; },
        clear(grey = .5) { const v = Math.round(255 * grey); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, 0, W, H); },
        fix(col = "#fff", r = 3) { g.fillStyle = col; g.fillRect(W / 2 - r, H / 2 - r, 2 * r, 2 * r); },
        raf: () => new Promise(r => requestAnimationFrame(r)).then((t) => { chk(); return t; }),
        async frames(n) { for (let i = 0; i < n; i++) await ctx.raf(); },
        async wait(ms) { const t0 = performance.now(); while (performance.now() - t0 < ms - 8) await ctx.raf(); },
        ms2f: (ms) => Math.max(1, Math.round(ms / (1000 / 60))),
        async loop(fn) { let t0 = performance.now(), last = t0; for (;;) { const t = await ctx.raf(); const go = fn((t - t0) / 1000, (t - last) / 1000); last = t; if (go === false) return; } },
        key(keys, { buttons = null, timeout = 0, quiet = false } = {}) {
          chk();
          return new Promise((res, rej) => {
            const t0 = performance.now(); let tm = null;
            const finish = (k) => { cleanup(); if (!quiet) sfx("key"); res({ key: k, rt: performance.now() - t0 }); };
            const onK = (e) => { if (e.target.closest?.("input,textarea")) return; let k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
              if (keys.includes(k)) { e.preventDefault(); e.stopPropagation(); finish(k); } };
            const onB = (e) => { const b = e.target.closest?.("[data-k]"); if (b) finish(b.dataset.k); };
            const cleanup = () => { window.removeEventListener("keydown", onK, true); btns.removeEventListener("click", onB); clearTimeout(tm); pending = null; btns.innerHTML = ""; };
            window.addEventListener("keydown", onK, true); btns.addEventListener("click", onB);
            btns.innerHTML = (buttons || keys.map(k => [k, KEYNAME[k] || k.toUpperCase()])).map(([k, l]) =>
              `<button class="k" data-k="${k}">${l}</button>${k.length === 1 || KEYNAME[k] ? `<span class="kb">${KEYNAME[k] || k.toUpperCase()}</span>` : ""}`).join("");
            if (timeout) tm = setTimeout(() => { cleanup(); res({ key: null, rt: timeout }); }, timeout);
            pending = () => { cleanup(); rej(ABORT); };
          });
        },
        async choose(prompt, opts) { say(prompt); const r = await ctx.key(opts.map(o => o[0]), { buttons: opts }); btns.innerHTML = ""; return r.key; },
        number(prompt) {
          chk(); say(prompt);
          return new Promise((res, rej) => {
            let s = "";
            const draw = () => { btns.innerHTML = `<span class="entry">${s || "&nbsp;"}</span>` + ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."].map(d => `<button class="k" data-n="${d}">${d}</button>`).join("")
              + `<button class="k" data-n="del">DEL</button><button data-n="ok">ENTER</button>`; };
            const put = (k) => { if (k === "del") s = s.slice(0, -1); else if (k === "ok") { if (s && isFinite(+s)) { cleanup(); sfx("key"); res(+s); return; } } else if (s.length < 6) s += k; draw(); };
            const onK = (e) => { if (/^[0-9.]$/.test(e.key)) put(e.key); else if (e.key === "Backspace") put("del"); else if (e.key === "Enter") put("ok"); else return; e.preventDefault(); e.stopPropagation(); };
            const onB = (e) => { const b = e.target.closest?.("[data-n]"); if (b) put(b.dataset.n); };
            const cleanup = () => { window.removeEventListener("keydown", onK, true); btns.removeEventListener("click", onB); btns.innerHTML = ""; pending = null; };
            window.addEventListener("keydown", onK, true); btns.addEventListener("click", onB); draw();
            pending = () => { cleanup(); rej(ABORT); };
          });
        },
        plot(spec) { res.innerHTML = plotSVG(spec); crt.classList.add("showres"); },
        unplot() { crt.classList.remove("showres"); },
        csv(name, header, rows) {
          const text = [header, ...rows].map(r => r.map(v => typeof v === "number" ? +v.toFixed(5) : `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
          lastRes = { name, text };
        },
      };
      try {
        say(m.blurb); btns.innerHTML = `<button data-k="go">BEGIN</button><span class="kb">SPACE</span>`;
        ctx.clear(0); drawTitle(g, m);
        await ctx.key([" ", "go", "Enter"], { buttons: [["go", "BEGIN"]] });
        await m.run(ctx);
        done++; score("console", 1); sfx("chime");
        btns.innerHTML = (lastRes ? `<button data-b="csv">SAVE CSV</button>` : "") + `<button data-b="again" class="k">RUN AGAIN</button>`;
        btns.onclick = (e) => { const b = e.target.closest?.("[data-b]"); if (!b) return;
          if (b.dataset.b === "csv" && lastRes) download(lastRes.name, lastRes.text);
          if (b.dataset.b === "again") { btns.onclick = null; lastRes = null; start(m); } };
      } catch (e) { if (e !== ABORT) { console.error(e); say("Something went wrong in the booth: " + e.message); } }
    }

    function stopRun() { if (run) run.stop = true; if (pending) pending(); btns.onclick = null; lastRes = null; }
    const onClick = (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const m = t.closest("[data-mod]"); if (m && !run) { sfx("select"); start(MODULES.find(x => x.id === m.dataset.mod)); return; }
      const b = t.closest("[data-b=back]");
      if (b) { if (run) { stopRun(); sfx("cancel"); menu(); } else if (standalone) about(); else finish(); }
    };
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); if (run) { stopRun(); menu(); } else if (!standalone) finish(); } };
    function about() { say("Ported from the PS 327 Perception lab MATLAB code (magnitude estimation, Muller-Lyer, visual search, lightness, motion aftereffect), plus a replication of Carrasco, Ling & Read (2004), Nature Neuroscience 7:308. Stimuli assume a linear display; contrast and grey levels are nominal."); }
    function finish() { stopRun(); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey, true); el.classList.remove("show"); el.innerHTML = ""; resolve({ runs: done }); }
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey, true);
    menu();
  });
}

function download(name, text) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function drawTitle(g, m) {
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#7b7890"; g.font = "600 22px 'Saira Condensed', sans-serif"; g.textAlign = "center";
  g.fillText((m.tag || m.group).toUpperCase(), W / 2, H / 2 - 40);
  g.fillStyle = "#e9e6ff"; g.font = "600 44px 'Saira Condensed', sans-serif"; g.fillText(m.title.toUpperCase(), W / 2, H / 2 + 6);
  g.fillStyle = "#7b7890"; g.font = "500 20px 'Saira Condensed', sans-serif"; g.fillText("PRESS BEGIN", W / 2, H / 2 + 60);
}

/* ---------------- results, drawn in the game's line style ---------------- */
// spec: { title, x: { lo, hi, log, label, ticks }, y: { lo, hi, label, ticks }, series: [{ name, cls, pts: [[x, y, err?]], curve: (x) => y, line: bool }],
//         vlines: [{ x, cls, label }], hlines: [{ y, cls, label }], notes: [[text, cls]], bars: bool }
export function plotSVG(s) {
  const X0 = 110, X1 = 640, Y0 = 470, Y1 = 70;
  const lx = (v) => s.x.log ? Math.log(v) : v, xLo = lx(s.x.lo), xHi = lx(s.x.hi);
  const px = (v) => X0 + (lx(v) - xLo) / (xHi - xLo) * (X1 - X0), py = (v) => Y0 - (v - s.y.lo) / (s.y.hi - s.y.lo) * (Y0 - Y1);
  let o = seg(s.title, X0, 20, 20, "sW", 1.6);
  for (const t of s.y.ticks || []) o += `<path class="hl sD" d="M${X0},${py(t)} L${X1},${py(t)}"/>` + seg(fmt(t), X0 - 12 - segW(fmt(t), 13), py(t) - 6.5, 13, "sM", 1);
  for (const t of s.x.ticks || []) o += `<path class="hl sD" d="M${px(t)},${Y0} L${px(t)},${Y1}"/>` + seg(fmt(t), px(t) - segW(fmt(t), 13) / 2, Y0 + 10, 13, "sM", 1);
  o += `<path class="sM" d="M${X0},${Y1} L${X0},${Y0} L${X1},${Y0}"/>`;
  o += seg(s.x.label, X1 - segW(s.x.label, 12), Y0 + 34, 12, "sM", 1) + seg(s.y.label, X0 - 96, Y1 - 28, 12, "sM", 1);
  for (const v of s.vlines || []) if (isFinite(v.x) && v.x >= s.x.lo && v.x <= s.x.hi) o += `<path class="dash ${v.cls}" d="M${px(v.x)},${Y0} L${px(v.x)},${Y1}"/>` + (v.label ? seg(v.label, px(v.x) + 6, Y1 + (v.dy || 0), 12, v.cls, 1) : "");
  for (const h of s.hlines || []) o += `<path class="hl dash ${h.cls}" d="M${X0},${py(h.y)} L${X1},${py(h.y)}"/>` + (h.label ? seg(h.label, X1 - segW(h.label, 11), py(h.y) - 16, 11, h.cls, .9) : "");
  (s.series || []).forEach((sr, si) => {
    if (sr.curve) { const n = 80, pts = []; for (let i = 0; i <= n; i++) { const xv = s.x.log ? Math.exp(xLo + (xHi - xLo) * i / n) : s.x.lo + (s.x.hi - s.x.lo) * i / n;
        const yv = sr.curve(xv); if (isFinite(yv)) pts.push(`${px(xv).toFixed(1)},${Math.max(Y1 - 10, Math.min(Y0, py(yv))).toFixed(1)}`); }
      o += `<path class="${sr.cls}" style="stroke-width:1.6" d="M${pts.join(" L")}"/>`; }
    if (sr.line && sr.pts.length > 1) o += `<path class="hl ${sr.cls}" d="M${sr.pts.map(p => `${px(p[0]).toFixed(1)},${py(p[1]).toFixed(1)}`).join(" L")}"/>`;
    for (const [xv, yv, e] of sr.pts) { if (!isFinite(yv)) continue; const X = px(xv) + (s.bars ? (si - (s.series.length - 1) / 2) * 10 : 0), Y = py(yv);
      if (e) o += `<path class="hl ${sr.cls}" d="M${X},${py(yv - e)} L${X},${py(yv + e)}"/>`;
      o += `<circle class="k ${sr.cls}" style="stroke-width:1.6" cx="${X.toFixed(1)}" cy="${Y.toFixed(1)}" r="5"/>`; }
    o += chip(sr.name, 672, 76 + si * 34, 13, sr.cls.replace("s", "f"));
  });
  (s.notes || []).forEach(([t, c], i) => { o += seg(t, 672, 92 + (s.series || []).length * 34 + 16 + i * 30, 13, c || "sW", 1.1); });
  return o;
}
const fmt = (v) => { const a = Math.abs(v); return a >= 100 ? String(Math.round(v)) : a >= 10 ? String(+v.toFixed(0)) : a >= 1 ? String(+v.toFixed(1)) : String(+v.toFixed(2)).replace(/^0\./, "."); };
