// THE LASAGNA (Act IV, Impact's office). Last spring Nell ended her own pilot session (sub-01: Nell) with a phantom: her
// lunch, a six-layer lasagna, slid into the bore to test the laminar sequence on something with a known answer. Glass gives
// no MR signal, so the dish is invisible; what shows is the slab, the gap where she'd already cut a slice, the cheese on
// top, a pocket of ricotta, and six noodles. Preston's Figure 2 is run 9 of that session, "upscaled" by a model trained on
// brains: the noodles come out as textbook laminae I–VI, the cheese as the pial surface, the ricotta as a vein, the missing
// slice as a sulcus. Nudge and scale his figure over her scan until they register, then click the six layers.
// Resolves { done }.
// Every nudge says which way is still off. Within one step of every setting it snaps into register. Hint ladder: two
// nudges the wrong way (or 20 moves), Nell counts out the presses left; four (or 30 moves), Morris lines it up. In the
// close-up a click anywhere on the slab marks the nearest unmarked layer.
import { seg, segC } from "../gfx.js";
import { exitLabel, exitKey } from "./exit.js";

/* ---------------- the slab (a sagittal slice through a lasagna, in a 200 × 200 box) ---------------- */
const P = (x, y) => x.toFixed(1) + "," + y.toFixed(1);
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
// two pieces of slab: the big one, and the end piece past the slice Nell had already cut
const BLOCKS = [[26, 118], [146, 174]], TOP = 86, BOT = 156;
const Y0 = [94, 105, 116, 127, 138, 149];                       // the six noodles, top to bottom
const noodleY = (i, x) => Y0[i] + 2.2 * Math.sin((x + i * 13) / 6) + 1.1 * Math.sin((x + i * 7) / 2.3);   // ruffled edges
const cheeseY = (x) => TOP + 1.6 * Math.sin(x / 5) + 0.8 * Math.sin(x / 1.9);
// a 3T scan is coarse and noisy (big steps, jitter); the "upscaled" figure is the same thing, smooth
function trace(fn, x0, x1, step, jit) {
  const pts = []; for (let x = x0; x <= x1 + 1e-6; x += step) pts.push([x, fn(x) + (jit ? (jit() - .5) * 1.6 : 0)]);
  return "M" + pts.map(([x, y]) => P(x, y)).join(" L");
}
const layer = (i, step, jit) => BLOCKS.map(([a, b]) => trace(x => noodleY(i, x), a + 2, b - 2, step, jit)).join(" ");
// each piece: cheese on top, a ragged cut face, the dish's rounded corner at the outside bottom
function outline(jit) {
  const [[a0, a1], [b0, b1]] = BLOCKS, j = () => jit ? (jit() - .5) * 2 : 0;
  const top = (x0, x1) => { const o = []; for (let x = x0; x <= x1 + 1e-6; x += 4) o.push([x, cheeseY(x) + (jit ? (jit() - .5) * 1.6 : 0)]); return o; };
  const cut = (x, dir) => { const o = []; for (let y = TOP + 4; y <= BOT; y += 8) o.push([x + dir * ((y - TOP) % 16 ? 1.2 : -0.6) + j(), y]); return o; };
  const pts = (l) => l.map(q => P(...q)).join(" L");
  const A = [...top(a0 - 2, a1), ...cut(a1, 1), [a0 + 4, BOT]];
  const B = [...cut(b0, -1).reverse(), ...top(b0, b1 + 2), [b1 + 2, BOT - 8]];
  return `M${pts(A)} C${P(a0, BOT)} ${P(a0 - 2, BOT - 4)} ${P(a0 - 2, BOT - 8)} Z`
    + ` M${pts(B)} C${P(b1 + 2, BOT - 4)} ${P(b1, BOT)} ${P(b1 - 4, BOT)} L${P(b0 - 0.6, BOT)} Z`;
}
const RIC = [66, 110.5, 9, 3.4];                                // the ricotta, between noodles I and III
const BUBBLES = [[40, 83.5, 2], [88, 84, 1.6], [160, 83.5, 1.8], [104, 84.5, 1.2]];

function voxelGrid(step) { let d = ""; for (let v = step; v < 200; v += step) d += `M${v},0 L${v},200 M0,${v} L200,${v} `; return `<path class="hl grid" d="${d}"/>`; }
// Nell's run 9: coarse, honest, a lasagna
function nellScan() {
  const r = rng(1205);
  return `<path d="${outline(r)}"/>${Y0.map((_, i) => `<path class="hl" d="${layer(i, 4, r)}"/>`).join("")}
    <ellipse class="hl" cx="${RIC[0]}" cy="${RIC[1]}" rx="${RIC[2]}" ry="${RIC[3]}"/>${BUBBLES.map(([x, y, rr]) => `<circle class="hl" cx="${x}" cy="${y}" r="${rr}"/>`).join("")}`;
}
// Preston's Figure 2: the same slab, smoothed, relabelled as cortex
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
function figure2(hit) {
  return `<path d="${outline(null)}"/>
    ${Y0.map((_, i) => `<g class="lay" ${hit ? `data-layer="${i}"` : ""}><path class="fake" data-l="${i}" d="${layer(i, 1.5, null)}"/>${hit ? `<path class="hit" d="${layer(i, 1.5, null)}"/>` : ""}</g>`).join("")}
    <ellipse class="hl" cx="${RIC[0]}" cy="${RIC[1]}" rx="${RIC[2]}" ry="${RIC[3]}"/>
    <path class="hl probe" d="M44,72 L44,${BOT + 4}"/><circle class="probe" cx="44" cy="${BOT + 4}" r="1.4"/>
    <g class="lbl">${seg("PIAL", 12, 74, 4.4, "", .5)}${seg("WM", 13, BOT + 4, 4.4, "", .5)}${segC("SULCUS", 132, 74, 4, "", .5)}${seg("VEIN", 78, 100, 3.6, "", .5)}
    ${ROMAN.map((t, i) => seg(t, 14, Y0[i] - 2, 3.6, "", .5)).join("")}</g>`;
}

const START = { dx: 16, dy: -12, s: 1.25 }, STEP = 4, SSTEP = 0.05;
export const regScore = ({ dx, dy, s }) => Math.round(100 * Math.exp(-((dx / 14) ** 2 + (dy / 14) ** 2 + ((s - 1) / 0.12) ** 2)));
const tf = ({ dx, dy, s }) => `translate(${dx},${dy}) translate(100,100) scale(${s.toFixed(2)}) translate(-100,-100)`;
const LINES = {
  intro: ["NELL", "My practice session from last spring. Subject 01 is me. Run nine is my lunch: I slid a lasagna into the bore to test the layer scan. Six layers. A known answer."],
  intro2: ["MORRIS", "Best phantom in the building, pal. The glass dish doesn't even show up."],
  how: ["NELL", "His Figure 2 is 'upscaled.' Lay it over mine and nudge and resize it till the edges match. Lining scans up is called registering them."],
  // what's still off, biggest first, in the player's own buttons
  off: { L: "It's too far left. Nudge it →.", R: "It's too far right. Nudge it ←.", U: "It sits too high. Nudge it ↓.", D: "It sits too low. Nudge it ↑.",
    big: "His figure's bigger than my scan. SCALE −.", small: "Now it's smaller than my scan. SCALE +." },
  count: (t) => ["NELL", `From here: ${steps(t)}. Then they'll register.`],
  snap: ["MORRIS", "Gimme that, pal. ...There. Noodle on noodle."],
  onSlab: ["NELL", "The layers. On the slab. Click each one."],
  match: ["NELL", "They register. Same slab, same bubbles in the cheese, same gap where I cut myself a slice."],
  zoom: ["NELL", "His 'sulcus' is where I took a slice. His 'vein' is ricotta. A model trained on brains turns anything with stripes into cortex, like sharpening a blurry photo into a face. Click every layer."],
  marks: { 1: ["NELL", "One. Noodle."], 3: ["MORRIS", "That's a lot of brain for a casserole, pal."], 5: ["NELL", "Five. He labelled the cheese 'pial surface.'"] },
  done: ["NELL", "That's not cortex. That's my lunch."],
  done2: ["NELL", "Run nine of my session. Runs one to eight were my brain, and my null. His sub-01 had my null. Because his sub-01 is me."],
};
// the presses left to register, e.g. "← ×4, ↓ ×3, SCALE − ×5"
function steps({ dx, dy, s }) {
  const o = [], n = (v, st) => Math.round(Math.abs(v) / st);
  if (dx) o.push(`${dx > 0 ? "←" : "→"} ×${n(dx, STEP)}`); if (dy) o.push(`${dy > 0 ? "↑" : "↓"} ×${n(dy, STEP)}`);
  if (Math.abs(s - 1) > 1e-6) o.push(`SCALE ${s > 1 ? "−" : "+"} ×${n(s - 1, SSTEP)}`);
  return o.join(", ");
}
const err = ({ dx, dy, s }) => (dx / 14) ** 2 + (dy / 14) ** 2 + ((s - 1) / 0.12) ** 2;
const COL = { NELL: "G", MORRIS: "K", GUS: "B", PENNY: "B", NARRATOR: "W" };
const CSS = `
.lasagna svg.rtsvg { position: relative; inset: auto; width: 100%; flex: 1 1 0; min-height: 0; }
.lasagna .pB path, .lasagna .pB ellipse, .lasagna .pB circle { stroke: var(--B); }
.lasagna .pA path, .lasagna .pA ellipse, .lasagna .pA circle { stroke: var(--A); }
.lasagna .pG path, .lasagna .pG ellipse, .lasagna .pG circle { stroke: var(--G); }
.lasagna path, .lasagna ellipse, .lasagna circle { fill: none; }
.lasagna .grid { stroke: var(--N) !important; stroke-width: .5 !important; }
.lasagna .ov { opacity: .85; }
.lasagna .lbl path { stroke: var(--M) !important; }
.lasagna .probe { stroke: var(--B) !important; } .lasagna circle.probe { fill: var(--B); }
.lasagna .fake.mk { stroke: var(--R) !important; }
.lasagna .w1 path, .lasagna .w1 ellipse, .lasagna .w1 circle { stroke-width: 1.76; } .lasagna .w1 .hl { stroke-width: .88; }
.lasagna .w2 path, .lasagna .w2 ellipse, .lasagna .w2 circle { stroke-width: 1.36; } .lasagna .w2 .hl { stroke-width: .68; }
.lasagna .w3 path, .lasagna .w3 ellipse, .lasagna .w3 circle { stroke-width: .7; } .lasagna .w3 .hl { stroke-width: .35; }
.lasagna .w1 .lbl path, .lasagna .w2 .lbl path { stroke-width: .6; } .lasagna .w3 .lbl path { stroke-width: .4; }
.lasagna .w3 .hit { stroke: transparent !important; stroke-width: 3.4; pointer-events: stroke; cursor: pointer; }
.lasagna .lay:hover .fake { stroke: var(--W) !important; }
.lasagna button.nudge { min-width: 3.2cqw; }
`;
function injectStyle(id, css) { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); }

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);
const ZOOM = [56, 72, 96, 96];                                   // the close-up: the ricotta "vein", the cut "sulcus", all six layers

export function lasagna(el, { score = () => {} } = {}) {
  injectStyle("mg-lasagna", CSS);
  return new Promise(resolve => {
    const S = { t: { ...START }, moves: 0, say: LINES.intro, reg: false, zoom: false, marked: Y0.map(() => false), done: false, away: 0, helped: false };
    const timers = []; const later = (ms, fn) => timers.push(setTimeout(() => { fn(); draw(); }, ms));
    let spoken = null;
    const coach = () => { const [w, t] = S.say; if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(w, true); } return `<span class="who" style="background:var(--${COL[w]})">${w}</span><span style="color:var(--${COL[w]})">${t}</span>`; };
    const nMarked = () => S.marked.filter(Boolean).length;
    const sgn = (v) => (v > 0 ? "+" : v < 0 ? "-" : "") + Math.abs(v);
    function panel(x, y, w, inner, cls, vb = "0 0 200 200") {
      return `<rect class="hl sD" x="${x - 2}" y="${y - 2}" width="${w + 4}" height="${w + 4}"/><svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="${vb}" class="${cls}">${inner}</svg>`;
    }
    function draw() {
      const pct = regScore(S.t), m = S.reg, fig = m ? "pG" : "pA", scan = m ? "pG" : "pB";
      const marked = (s) => s.replace(/class="fake" data-l="(\d)"/g, (a, i) => S.marked[+i] ? `class="fake mk" data-l="${i}"` : a);
      // the big view: the overlay, or (once registered) a close-up of the cut
      const big = S.zoom
        ? panel(408, 8, 214, `<g class="${scan}">${nellScan()}</g><g class="${fig} ov">${marked(figure2(true))}</g>`, "w3", ZOOM.join(" "))
        : panel(408, 8, 214, `<g class="${scan}">${nellScan()}</g><g class="${fig} ov" transform="${tf(S.t)}">${figure2(false)}</g>`, "w2");
      const svg = `
        ${panel(18, 14, 168, `${voxelGrid(10)}<g class="pB">${nellScan()}</g>`, "w1")}
        ${panel(212, 14, 168, `<g class="pA" transform="${tf(START)}">${figure2(false)}</g>`, "w1")}
        ${big}
        ${seg("MY SCAN  SUB-01  RUN 09  3T", 18, 190, 5, "sB", .9)}${seg("HIS FIGURE 2  SUB-01  V1  7T", 212, 190, 5, "sA", .9)}
        ${S.zoom ? segC(`THE CUT  ×2   LAYERS ${nMarked()}/6`, 515, 228, 6, nMarked() === 6 ? "sR" : "sW", 1)
                 : segC(m ? "LINED UP" : "OVERLAY", 515, 228, 6, m ? "sG" : "sW", 1)}
        ${seg("LINED UP  (REGISTRATION)", 18, 205, 4.2, "sM", .8)}${seg(String(pct).padStart(2, "0") + "%", 18, 213, 18, m ? "sG" : pct >= 60 ? "sA" : "sW", 1.4)}
        ${seg(`SIDEWAYS ${sgn(S.t.dx)}   UP/DOWN ${sgn(-S.t.dy)}   SIZE ${Math.round(S.t.s * 100)}%   MOVES ${S.moves}`, 96, 222, 4.6, "sM", .8)}`;
      const dis = m ? "disabled" : "";
      el.innerHTML = `<div class="screen lasagna">
        <svg class="t hd" viewBox="0 0 640 40">${seg("THE LASAGNA", 16, 10, 18, "sW", 1.6)}${seg("YOUR SCAN  ·  HIS FIGURE 2  ·  LAY HIS OVER YOURS", 214, 17, 5, "sM", .8)}</svg>
        <svg class="t rtsvg" viewBox="0 0 640 236">${svg}</svg>
        <div class="coachline">${coach()}</div>
        <div class="bar">
          <button class="nudge" data-b="L" ${dis}>←</button><button class="nudge" data-b="R" ${dis}>→</button><button class="nudge" data-b="U" ${dis}>↑</button><button class="nudge" data-b="D" ${dis}>↓</button>
          <button data-b="S-" ${dis}>SCALE −</button><button data-b="S+" ${dis}>SCALE +</button>
          <span class="status">${S.zoom ? `${nMarked()} / 6 LAYERS` : `LINED UP ${pct}%`}</span>
          <button data-b="off" class="off">${exitLabel(S.done)}</button></div></div>`;
    }
    function move(b) {
      if (S.reg) return;
      const t = S.t;
      if (b === "L") t.dx -= STEP; else if (b === "R") t.dx += STEP; else if (b === "U") t.dy -= STEP; else if (b === "D") t.dy += STEP;
      else if (b === "S-") t.s = Math.max(0.6, +(t.s - SSTEP).toFixed(2)); else if (b === "S+") t.s = Math.min(1.6, +(t.s + SSTEP).toFixed(2));
      else return;
      S.moves++;
      if (b[0] === "S") sfx("scale", { up: b === "S+" }); else sfx("nudge", { f: 700 + 120 * "LRUD".indexOf(b) });
      if (err(t) > S.lastErr) S.away++;
      S.lastErr = err(t);
      // close enough on every setting: it snaps into register (registration software does that)
      if (Math.abs(t.dx) <= STEP && Math.abs(t.dy) <= STEP && Math.abs(t.s - 1) <= SSTEP + 1e-6) register();
      else if (S.away >= 4 || S.moves >= 30) { S.helped = true; S.say = LINES.snap; register(); }
      else if (S.away >= 2 || S.moves >= 20) S.say = LINES.count(t);
      else S.say = ["NELL", `${regScore(t) >= 50 ? "Closer." : "Not yet."} ${offBy(t)}`];
      draw();
    }
    function offBy(t) {
      const e = [["x", (t.dx / 14) ** 2], ["y", (t.dy / 14) ** 2], ["s", ((t.s - 1) / 0.12) ** 2]].sort((a, b) => b[1] - a[1])[0][0], o = LINES.off;
      return e === "x" ? (t.dx < 0 ? o.L : o.R) : e === "y" ? (t.dy < 0 ? o.U : o.D) : (t.s > 1 ? o.big : o.small);
    }
    function register() {
      S.t = { dx: 0, dy: 0, s: 1 }; S.reg = true; sfx("chime"); if (!S.helped) score("lasagnaReg", 2);
      if (S.helped) later(2200, () => { S.say = LINES.match; }); else S.say = LINES.match;
      later(S.helped ? 4800 : 2600, () => { S.zoom = true; S.say = LINES.zoom; sfx("whoosh"); });
    }
    // a click in the close-up that missed the thin lines: mark the nearest unmarked layer, if it was on the slab
    function nearest(e) {
      const sv = el.querySelector("svg.w3"); if (!sv || !S.zoom || S.done) return false;
      const m = sv.getScreenCTM(); if (!m) return false;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      const [zx, zy, zw, zh] = ZOOM;
      if (p.x < zx || p.x > zx + zw || p.y < zy || p.y > zy + zh) return false;   // outside the close-up
      const onSlab = BLOCKS.some(([a, b]) => p.x >= a - 2 && p.x <= b + 2) && p.y >= TOP && p.y <= BOT;
      if (!onSlab) { S.say = LINES.onSlab; draw(); return true; }
      const free = Y0.map((_, i) => i).filter(i => !S.marked[i]).sort((a, b) => Math.abs(noodleY(a, p.x) - p.y) - Math.abs(noodleY(b, p.x) - p.y));
      if (free.length) mark(free[0]);
      return true;
    }
    function mark(i) {
      if (!S.zoom || S.marked[i] || S.done) return;
      S.marked[i] = true; const n = nMarked(); sfx("layer", { n });
      if (n === 6) { S.done = true; S.say = LINES.done; sfx("stamp"); score("lasagnaLayers", 3); later(3400, () => { S.say = LINES.done2; }); }
      else if (LINES.marks[n]) S.say = LINES.marks[n];
      draw();
    }
    const onClick = (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const l = t.closest("[data-layer]"); if (l) { mark(+l.dataset.layer); return; }
      if (nearest(e)) return;
      const b = t.closest("button[data-b]"); if (!b || b.disabled) return;
      if (b.dataset.b === "off") finish(); else move(b.dataset.b);
    };
    const KEYS = { ArrowLeft: "L", ArrowRight: "R", ArrowUp: "U", ArrowDown: "D", "-": "S-", "_": "S-", "+": "S+", "=": "S+" };
    const onKey = (e) => {
      if (exitKey(e, S.done, finish)) return;
      if (KEYS[e.key]) { e.preventDefault(); move(KEYS[e.key]); }
    };
    function finish() {
      timers.forEach(clearTimeout); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = ""; resolve({ done: S.done });
    }
    S.lastErr = err(S.t);
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
    later(2800, () => { if (S.say === LINES.intro) S.say = LINES.intro2; });
    later(5600, () => { if (S.say === LINES.intro2) S.say = LINES.how; });
  });
}
