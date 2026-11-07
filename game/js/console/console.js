// THE PERCEPTION CONSOLE — the computer inside the Adline Lab's dark booth. A library of perception experiments:
// bistable demos, illusions, classic replications (Carrasco, Ling & Read, 2004, and more) and ports of the PS 327
// MATLAB labs. Runs as a minigame in #panel (perceptionConsole) or on its own page (console.html).
//
// The menu is a library browser: a row of shelf tabs (one per group, found from MODULES and ordered by GROUPS in
// modules.js), a grid of tiles for the open shelf, each with its credit chip. Pointing at a tile (or one tap) puts its
// one-liner and citation on the console's line; a click, a second tap, START or ENTER runs it. Keys: arrows move,
// TAB / [ ] change shelf, 1-9 and 0 pick a tile, ENTER runs.
//
// The console chrome follows the game's line language. The stimuli do not, on purpose: the booth's monitor shows real
// stimuli (Gabors, grey levels, coloured letters, dot fields) on a <canvas>, because they are the experiment.
//
// A module is { id, group, tag, title, sub, blurb, ref, instructions: { lines, keys }, run(ctx) → Promise }; ref is a
// citation string, or a list of them. ctx is the module's whole world:
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
import { MODULES, groupsOf, refsOf } from "./modules.js";

const CSS = `
.pc { padding: 0 1.2cqw !important; }
/* the old CRT around it: the case is line art; the glass is the screen div, inset into the bezel with rounded tube corners */
#panel .crtwrap { position: absolute; inset: 0; transform-origin: 50% 46%; }
#panel .crtwrap.z0 { transform: scale(.08); } #panel .crtwrap.z1 { transform: scale(.26); } #panel .crtwrap.z2 { transform: scale(.6); }
#panel.zooming { background: rgba(0,0,0,.35); }
#panel .zoomdash { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; display: none; }
#panel .zoomdash.on { display: block; }
#panel .crtcase { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
#panel .screen.pc { left: 9.4%; right: 9.4%; top: 7.6%; bottom: 17.2%; border: .12cqw solid var(--M); border-radius: 2.6cqw / 3.6cqw; }
#panel .screen.pc::after { content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0; border-radius: inherit;
  background: repeating-linear-gradient(to bottom, transparent 0 .32cqw, rgba(233,230,255,.035) .32cqw .4cqw); }
#panel .screen.pc > * { position: relative; z-index: 1; }
#panel .screen.pc .crt { z-index: 2; }
#panel .screen.pc.off > * { visibility: hidden; }
#panel .screen.pc.p0 { transform: scale(.012, .006); background: var(--W); }
#panel .screen.pc.p1 { transform: scale(.9, .006); background: var(--W); }
#panel .screen.pc.p2 { transform: scale(1, .18); }
#panel .screen.pc.p3 { transform: scale(1, .7); }
.pc .pcbody { flex: 1 1 0; min-height: 0; display: flex; gap: 1.2cqw; padding: .6cqw 0; }
/* the library: shelf tabs, then the open shelf's tiles (scrolls when it's long) */
.pc .lib { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; gap: .7cqw; }
.pc .shelves { flex: none; display: flex; flex-wrap: wrap; gap: .45cqw; }
.pc .shelf { font-size: 1.4cqw; font-weight: 600; letter-spacing: .1em; line-height: 1.45; color: var(--W); border: .12cqw solid var(--M); padding: 0 .6cqw; cursor: pointer; white-space: nowrap; }
.pc .shelf .n { font-size: .78em; color: var(--M); margin-left: .4cqw; letter-spacing: 0; }
.pc .shelf:hover { border-color: var(--G); color: var(--G); }
.pc .shelf.on { background: var(--W); border-color: var(--W); color: #000; cursor: default; } .pc .shelf.on .n { color: #000; }
.pc .tiles { flex: 1 1 0; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .6cqw; align-content: start;
  padding: 0 .4cqw .2cqw 0; scrollbar-width: thin; scrollbar-color: var(--M) transparent; overscroll-behavior: contain; touch-action: pan-y; }
.pc .tile { border: .12cqw solid var(--W); padding: .4cqw .6cqw .5cqw; cursor: pointer; background: #000; min-width: 0; display: flex; flex-direction: column; gap: .35cqw; }
.pc .tile .tr { display: flex; align-items: flex-start; gap: .5cqw; min-width: 0; }
.pc .tile .tb { background: var(--A); color: #000; font-size: 1.1cqw; font-weight: 600; letter-spacing: .06em; line-height: 1.4; padding: 0 .35cqw; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc .tile .no { margin-left: auto; flex: none; font-size: 1.1cqw; line-height: 1.4; color: var(--M); }
.pc .tile .tt { font-size: 1.75cqw; font-weight: 600; line-height: 1.08; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pc .tile:hover { border-color: var(--G); } .pc .tile:hover .tt { color: var(--G); }
.pc .tile.sel { border-color: var(--G); outline: .12cqw solid var(--G); outline-offset: -.36cqw; } .pc .tile.sel .tt { color: var(--G); }
/* on the menu the console's line holds the pointed-at module's one-liner and its citation, at a fixed height so the grid never jumps */
#panel .pc .coachline.onmenu { height: 6.6cqw; overflow: hidden; box-sizing: border-box; }
#panel .pc .coachline.onmenu .txt { font-size: 1.45cqw; }
.pc .coachline .ref { font-size: 1.25cqw; line-height: 1.25; color: var(--M); margin-top: .2cqw; letter-spacing: .02em; text-transform: none;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pc .coachline .ref:empty { display: none; }
.pc .crt { flex: 1; position: relative; border: .12cqw solid var(--M); background: #000; min-width: 0; }
.pc .crt canvas, .pc .crt svg.res { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.pc .crt svg.res { display: none; } .pc .crt.showres svg.res { display: block; } .pc .crt.showres canvas { visibility: hidden; }
#panel .pc .coachline { font-size: 1.55cqw; text-transform: none; min-height: 2.4cqw; }
.pc .coachline .txt { text-transform: uppercase; }
.pc .bar { flex-wrap: wrap; row-gap: .4cqw; }
.pc .bar button.k { background: #000; color: var(--W); border: .1cqw solid var(--W); }
.pc .bar button.k:hover { background: var(--G); color: #000; }
.pc .bar .kb { color: var(--M); font-size: 1.05cqw; margin-left: .3cqw; }
.pc .bar .entry { font: 600 1.8cqw "Saira Condensed", sans-serif; color: var(--A); min-width: 6cqw; border-bottom: .1cqw solid var(--A); text-align: right; padding: 0 .4cqw; }
`;
function css() { if (document.getElementById("css-console")) return; const s = document.createElement("style"); s.id = "css-console"; s.textContent = CSS; document.head.appendChild(s); }

// speed dashes radiating from the middle, for the zoom (motion as drawn glyphs)
function zoomDashes() { let o = "";
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2 + (i % 2) * .09, r0 = 150 + (i % 3) * 22, r1 = r0 + 34 + (i % 4) * 10, c = Math.cos(a), sn = Math.sin(a) * .6;
    o += `<path class="sW" style="stroke-width:1.3" d="M${(320 + c * r0).toFixed(1)},${(166 + sn * r0).toFixed(1)} L${(320 + c * r1).toFixed(1)},${(166 + sn * r1).toFixed(1)}"/>`; }
  return o; }
// the monitor: a fat 1990s lab CRT drawn in the game's line language (case and bezel in line, knobs, a lit power LED, a foot)
function crtCase() {
  const gx0 = 60.2, gx1 = 579.8, gy0 = 27.4, gy1 = 298.1;               // the glass (= the screen div)
  const bx0 = 44, bx1 = 596, by0 = 15, by1 = 312;                         // the bezel's inner lip
  const cx0 = 20, cx1 = 620, cy0 = 4, cy1 = 340;                          // the case front
  let o = `<rect class="k sW" x="${cx0}" y="${cy0}" width="${cx1 - cx0}" height="${cy1 - cy0}" rx="16"/>`;
  o += `<rect class="hl sM" x="${cx0 + 5}" y="${cy0 + 5}" width="${cx1 - cx0 - 10}" height="${cy1 - cy0 - 10}" rx="12"/>`;
  o += `<rect class="k sW" x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" rx="22"/>`;
  // the bezel slopes in to the tube: hairlines from the lip's corners to the glass's
  for (const [x, y, X, Y] of [[bx0 + 8, by0 + 8, gx0 + 6, gy0 + 6], [bx1 - 8, by0 + 8, gx1 - 6, gy0 + 6], [bx0 + 8, by1 - 8, gx0 + 6, gy1 - 6], [bx1 - 8, by1 - 8, gx1 - 6, gy1 - 6]])
    o += `<path class="hl sM" d="M${x},${y} L${X},${Y}"/>`;
  // the control strip
  const sy = 322;
  o += seg("ADLINE", 44, sy - 4, 7, "sW", 1.1) + seg("VISION RESEARCH MONITOR  120 HZ", 44 + segW("ADLINE", 7) + 8, sy - 1, 4, "sM", .7);
  for (let i = 0; i < 9; i++) o += `<path class="hl sD" d="M${262 + i * 9},${sy - 4} L${262 + i * 9},${sy + 4}"/>`;
  for (const [x, lbl, a] of [[436, "BRT", -40], [470, "CONT", 30], [504, "DEGAUSS", null]]) {
    if (a === null) { o += `<rect class="k sW" x="${x - 7}" y="${sy - 5}" width="14" height="9" rx="2"/>`; }
    else { const t = a * Math.PI / 180; o += `<circle class="k sW" cx="${x}" cy="${sy}" r="6"/><path class="sW" style="stroke-width:1.1" d="M${x},${sy} L${(x + 5 * Math.sin(t)).toFixed(1)},${(sy - 5 * Math.cos(t)).toFixed(1)}"/>`; }
    o += seg(lbl, x - segW(lbl, 3) / 2, sy + 8, 3, "sM", .5);
  }
  o += `<circle class="k sW" cx="566" cy="${sy}" r="7"/><circle class="fG" cx="584" cy="${sy}" r="2.2"/>` + seg("PWR", 576, sy + 8, 3, "sM", .5);
  // the foot
  o += `<path class="sW" d="M250,${cy1} L232,355 L408,355 L390,${cy1}"/><path class="hl sM" d="M244,349 L396,349"/>`;
  return `<svg class="crtcase t" viewBox="0 0 640 360" preserveAspectRatio="none">${o}</svg>`;
}

export const W = 960, H = 540, PPD = 36;
const ABORT = new Error("abort");
const sfx = (n, o) => window.SFX && window.SFX.play(n, o);
const KEYNAME = { " ": "SPACE", ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT", Enter: "ENTER" };

export function perceptionConsole(el, { score = () => {}, standalone = false } = {}) {
  css();
  return new Promise(resolve => {
    let run = null, pending = null, lastRes = null, done = 0;
    el.classList.add("show");
    el.innerHTML = `<div class="crtwrap z0">${crtCase()}<div class="screen pc off p0">
      <svg class="t hd" viewBox="0 0 640 40">${seg("PERCEPTION CONSOLE", 16, 9, 16, "sW", 1.5)}${seg("BOOTH 114  ADLINE LAB", 236, 12, 5, "sM", .8)}<g id="pcmode"></g></svg>
      <div class="pcbody"></div>
      <div class="coachline"><span class="who" style="background:var(--G)">CONSOLE</span> <span class="txt" style="color:var(--G)"></span><div class="ref"></div></div>
      <div class="bar"><span class="status"></span><span class="btns" style="display:flex;gap:.6cqw;flex-wrap:wrap;align-items:center"></span><button data-b="back" class="off">${standalone ? "MENU" : "CLOSE"}</button></div></div></div><svg class="zoomdash t" viewBox="0 0 640 360">${zoomDashes()}</svg>`;
    const body = el.querySelector(".pcbody"), coach = el.querySelector(".coachline"), txt = coach.querySelector(".txt"), refE = coach.querySelector(".ref"), btns = el.querySelector(".btns"), status = el.querySelector(".status"), backB = el.querySelector("[data-b=back]");
    const mode = (t) => { el.querySelector("#pcmode").innerHTML = t ? chip(t, 640 - segW(t, 5) - 18, 13, 5, "fA") : ""; };
    const say = (t) => { txt.textContent = t; };

    /* ---------------- the menu: a library browser ---------------- */
    // shelf and selection survive a run, so MENU comes back to where you were
    let shelf = null, sel = null, ptr = "mouse";
    const greet = standalone ? "A library of perception experiments. Pick a shelf, then a tile: one tap says what it is and where it comes from, a second tap runs it."
      : "The booth's computer. Somebody left it logged in as PS327. Pick a shelf, then an experiment.";
    const byId = (id) => MODULES.find(x => x.id === id);
    const shelfMods = () => MODULES.filter(m => m.group === shelf);
    // the console line: the module's one-liner, and its citation(s) underneath
    const info = (m) => { if (!m) { say(greet); refE.textContent = ""; return; } say(`${m.title}: ${m.sub || ""}`); refE.textContent = refsOf(m).join("  \u00b7  "); };
    function menu() {
      run = null; mode(`LIBRARY ${MODULES.length}`); status.textContent = done ? `${done} RUN${done > 1 ? "S" : ""} THIS SESSION` : ""; btns.innerHTML = ""; backB.textContent = standalone ? "ABOUT" : "CLOSE";
      coach.classList.add("onmenu");
      const groups = groupsOf(MODULES); if (!groups.includes(shelf)) shelf = groups[0];
      const mods = shelfMods(); if (sel && !mods.some(m => m.id === sel)) sel = null;
      body.innerHTML = `<div class="lib"><div class="shelves">${groups.map(g => `<div class="shelf${g === shelf ? " on" : ""}" data-grp="${g}">${g}<span class="n">${MODULES.filter(m => m.group === g).length}</span></div>`).join("")}</div>
        <div class="tiles">${mods.map((m, i) => `<div class="tile" data-mod="${m.id}"><div class="tr"><span class="tb">${creditOf(m)}</span>${i < 10 ? `<span class="no">${(i + 1) % 10}</span>` : ""}</div><div class="tt">${m.title}</div></div>`).join("")}</div></div>`;
      // pointing at a tile shows it on the console line; leaving shows the selected one again (or the greeting)
      body.querySelectorAll(".tile").forEach(t => {
        t.addEventListener("pointerenter", () => { if (!run) info(byId(t.dataset.mod)); });
        t.addEventListener("pointerleave", () => { if (!run) info(sel && byId(sel)); }); });
      paint();
    }
    function paint(scroll = false) {
      body.querySelectorAll(".tile").forEach(t => t.classList.toggle("sel", t.dataset.mod === sel));
      btns.innerHTML = sel ? `<button data-b="start">START</button><span class="kb">ENTER</span>` : "";
      info(sel && byId(sel));
      if (scroll && sel) body.querySelector(`.tile[data-mod="${sel}"]`)?.scrollIntoView({ block: "nearest" });
    }
    function pick(id) { if (sel === id) return launch(id); sel = id; sfx("key"); paint(true); }
    function launch(id) { const m = byId(id); if (!m) return; sel = id; sfx("select"); start(m); }
    function toShelf(g) { if (g === shelf) return; shelf = g; sel = null; sfx("key"); menu(); }
    function menuKey(e) {
      const k = e.key, mods = shelfMods(), groups = groupsOf(MODULES), gi = groups.indexOf(shelf), i = mods.findIndex(m => m.id === sel);
      const grid = body.querySelector(".tiles"), cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 4;
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[k];
      if (k === "Tab" || k === "[" || k === "]" || k === "PageUp" || k === "PageDown") {
        const d = k === "[" || k === "PageUp" || (k === "Tab" && e.shiftKey) ? -1 : 1; toShelf(groups[(gi + d + groups.length) % groups.length]); }
      else if (step) { if (!mods.length) return true; sel = mods[i < 0 ? 0 : Math.max(0, Math.min(mods.length - 1, i + step))].id; sfx("key"); paint(true); }
      else if (k === "Enter" || k === " ") { if (sel) launch(sel); }
      else if (/^[0-9]$/.test(k)) { const m = mods[k === "0" ? 9 : +k - 1]; if (m) pick(m.id); }
      else return false;
      return true;
    }

    /* ---------------- running a module ---------------- */
    async function start(m) {
      coach.classList.remove("onmenu"); refE.textContent = "";
      mode(m.title.length > 26 ? m.tag || m.group : m.title); backB.textContent = "MENU";
      body.innerHTML = `<div class="crt"><canvas width="${W}" height="${H}"></canvas><svg class="res t" viewBox="0 0 ${W} ${H}"></svg></div>`;
      const canvas = body.querySelector("canvas"), g = canvas.getContext("2d"), crt = body.querySelector(".crt"), res = body.querySelector("svg.res");
      const R = run = { stop: false };
      const toCanvas = (e) => {   // the canvas is drawn object-fit: contain, so undo the letterbox
        const r = canvas.getBoundingClientRect(), k = Math.min(r.width / W, r.height / H), ox = r.left + (r.width - W * k) / 2, oy = r.top + (r.height - H * k) / 2;
        return { x: (e.clientX - ox) / k, y: (e.clientY - oy) / k }; };
      const PTR = { x: W / 2, y: H / 2, down: false };
      crt.addEventListener("pointermove", (e) => Object.assign(PTR, toCanvas(e)));
      crt.addEventListener("pointerdown", (e) => { Object.assign(PTR, toCanvas(e)); PTR.down = true; });
      window.addEventListener("pointerup", () => { PTR.down = false; });
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
        // the pointer, in stimulus-canvas pixels: pointer() is where it is now; click() waits for a press on the screen
        pointer() { return { ...PTR }; },
        click({ timeout = 0 } = {}) {
          chk();
          return new Promise((res, rej) => {
            const t0 = performance.now(); let tm = null;
            const f = (e) => { const p = toCanvas(e); cleanup(); res({ ...p, rt: performance.now() - t0 }); };
            const cleanup = () => { crt.removeEventListener("pointerdown", f); clearTimeout(tm); pending = null; };
            crt.addEventListener("pointerdown", f);
            if (timeout) tm = setTimeout(() => { cleanup(); res({ x: null, y: null, rt: timeout }); }, timeout);
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
        say("Read the instructions on the screen, then begin."); btns.innerHTML = `<button data-k="go">BEGIN</button><span class="kb">SPACE</span>`;
        ctx.clear(0); drawInstructions(g, m);
        if (document.fonts) document.fonts.load("500 30px 'Saira Condensed'").then(() => { if (run === R && !R.begun) drawInstructions(g, m); }).catch(() => {});
        await ctx.key([" ", "go", "Enter"], { buttons: [["go", "BEGIN"]] });
        R.begun = true;
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
      const sh = t.closest("[data-grp]"); if (sh && !run) { toShelf(sh.dataset.grp); return; }
      // a mouse click runs (pointing already showed what it is); a tap selects first, and a second tap runs
      const m = t.closest("[data-mod]"); if (m && !run) { if (ptr === "mouse") launch(m.dataset.mod); else pick(m.dataset.mod); return; }
      if (t.closest("[data-b=start]") && !run && sel) { launch(sel); return; }
      const b = t.closest("[data-b=back]");
      if (b) { if (run) { stopRun(); sfx("cancel"); menu(); } else if (standalone) about(); else finish(); }
    };
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); if (run) { stopRun(); menu(); } else if (!standalone) finish(); return; }
      if (!run && !leaving && !e.metaKey && !e.ctrlKey && !e.altKey && menuKey(e)) { e.preventDefault(); e.stopPropagation(); } };
    const onPtr = (e) => { ptr = e.pointerType || "mouse"; };
    function about() { sel = null; paint(); say("Classic perception experiments, each the simplest faithful version that runs on any screen, plus ports of the PS 327 Perception lab MATLAB code. Point at a tile for its source. Sizes in degrees and contrasts are nominal: the results worth comparing are the differences between conditions.");
      refE.textContent = "Carrasco, M., Ling, S., & Read, S. (2004). Attention alters appearance. Nature Neuroscience, 7(3), 308\u2013313."; }
    let leaving = false;
    function finish() {
      if (leaving) return; leaving = true;
      stopRun(); el.removeEventListener("click", onClick); el.removeEventListener("pointerdown", onPtr, true); window.removeEventListener("keydown", onKey, true);
      const wrapE = el.querySelector(".crtwrap"), scr = el.querySelector(".screen.pc"); sfx("cancel");
      const steps = [[() => { scr.className = "screen pc p2"; }, 0], [() => { scr.className = "screen pc off p1"; }, 60], [() => { scr.className = "screen pc off p0"; }, 130],
        [() => { scr.className = "screen pc off"; }, 200], [() => { el.classList.add("zooming"); wrapE.className = "crtwrap z2"; }, 300], [() => { wrapE.className = "crtwrap z1"; }, 360],
        [() => { wrapE.className = "crtwrap z0"; }, 420], [() => { el.classList.remove("show", "zooming"); el.innerHTML = ""; resolve({ runs: done }); }, 480]];
      for (const [fn, ms] of steps) setTimeout(fn, ms);
    }
    el.addEventListener("click", onClick); el.addEventListener("pointerdown", onPtr, true); window.addEventListener("keydown", onKey, true);
    menu();
    // ENTRY: the monitor rushes up out of the room (the case in four stepped sizes, speed dashes on the middle two),
    // then the tube warms up: a dot, a line, a band, the picture. Poses, not tweens.
    const wrapE = el.querySelector(".crtwrap"), scr = el.querySelector(".screen.pc"), dash = el.querySelector(".zoomdash");
    const poses = [["z0", 0], ["z1", 60], ["z2", 120], ["", 190]];
    if (!standalone) { el.classList.add("zooming"); sfx("select"); }
    else poses.splice(0, 3, ["", 0]);
    poses.forEach(([c, ms]) => setTimeout(() => { wrapE.className = `crtwrap ${c}`.trim(); dash.classList.toggle("on", c === "z1" || c === "z2"); if (!c) el.classList.remove("zooming"); }, ms));
    const t0 = standalone ? 0 : 230;
    setTimeout(() => sfx("blank"), t0);
    [["off p0", 0], ["off p1", 70], ["p2", 140], ["p3", 210], ["", 280]].forEach(([c, ms]) => setTimeout(() => { scr.className = `screen pc ${c}`.trim(); }, t0 + ms));
  });
}

// a tile's credit chip: the module's tag, or "FIRST AUTHOR YEAR" from its first citation
function creditOf(m) {
  if (m.tag) return m.tag;
  const r = refsOf(m)[0]; if (!r) return m.group;
  const y = (r.match(/\((?:c\. )?(\d{4})/) || [])[1] || "", who = r.slice(0, Math.max(0, r.search(/\s\((?:c\. )?\d{4}/))).replace(/&/g, "");
  const names = who.split(/,\s*/).map(x => x.trim()).filter(x => x && !/^([A-Z]\.\s*)+$/.test(x));
  const lead = names.length > 2 ? `${names[0]} ET AL.` : names.join(" & ");
  return `${lead} ${y}`.trim().toUpperCase();
}
function download(name, text) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
// THE INSTRUCTION SCREEN: what a participant reads before a run. m.instructions = { lines: [...], keys: [[cap, meaning], ...] };
// modules without one fall back to their blurb.
function wrap(g, text, maxW) { const out = []; let line = "";
  for (const w of text.split(/\s+/)) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out; }
function drawInstructions(g, m) {
  const I = m.instructions || { lines: [m.blurb], keys: [] }, F = "'Saira Condensed', sans-serif", keys = I.keys || [];
  const x0 = 64, maxW = W - 2 * x0, foot = H - 30, two = keys.length > 3, rows = two ? Math.ceil(keys.length / 2) : keys.length;
  // the largest type that fits: body, then the key caps, above the footer
  let fs = 32, wrapped;
  for (; fs > 18; fs -= 2) { g.font = `500 ${fs}px ${F}`; wrapped = I.lines.map(l => wrap(g, l.toUpperCase(), maxW));
    const h = 150 + wrapped.reduce((n, w) => n + w.length * fs * 1.2 + fs * .45, 0) + (rows ? 14 + rows * fs * 1.75 : 0);
    if (h < foot - 34) break; }
  g.fillStyle = "#000"; g.fillRect(0, 0, W, H); g.textAlign = "left"; g.textBaseline = "alphabetic";
  g.fillStyle = "#7b7890"; g.font = `600 20px ${F}`; g.fillText(`${(m.tag || m.group).toUpperCase()}   INSTRUCTIONS`, x0, 58);
  g.fillStyle = "#e9e6ff"; g.font = `600 48px ${F}`; g.fillText(m.title.toUpperCase(), x0, 104);
  g.strokeStyle = "#3a3842"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, 122); g.lineTo(W - x0, 122); g.stroke();
  let y = 150 + fs * .7; g.font = `500 ${fs}px ${F}`; g.fillStyle = "#e9e6ff";
  for (const para of wrapped) { for (const l of para) { g.fillText(l, x0, y); y += fs * 1.2; } y += fs * .45; }
  if (rows) {
    y += 14 - fs * .7; const colW = two ? maxW / 2 : maxW, kh = fs * 1.35;
    keys.forEach(([cap, what], i) => {
      const cx = x0 + (two ? Math.floor(i / rows) : 0) * colW, cy = y + (i % rows) * fs * 1.75;
      g.font = `600 ${fs * .85}px ${F}`; const cw = Math.max(kh * 1.15, g.measureText(cap).width + fs * .9);
      g.strokeStyle = "#e9e6ff"; g.lineWidth = 2; g.beginPath(); g.roundRect(cx, cy, cw, kh, 6); g.stroke();
      g.beginPath(); g.moveTo(cx + 5, cy + kh - 6); g.lineTo(cx + cw - 5, cy + kh - 6); g.strokeStyle = "#3a3842"; g.lineWidth = 1; g.stroke();
      g.fillStyle = "#e9e6ff"; g.textAlign = "center"; g.fillText(cap, cx + cw / 2, cy + kh * .68);
      g.textAlign = "left"; g.fillStyle = "#ffb547"; g.font = `500 ${fs * .85}px ${F}`; g.fillText(what.toUpperCase(), cx + cw + fs * .5, cy + kh * .68);
    });
  }
  g.fillStyle = "#00e39a"; g.font = `600 24px ${F}`; g.textAlign = "center"; g.fillText("PRESS SPACE OR BEGIN WHEN YOU ARE READY", W / 2, foot); g.textAlign = "left";
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
