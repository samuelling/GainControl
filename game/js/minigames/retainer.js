// THE RETAINER (Act IV, Impact's office). Nell's own pilot scan (3T, sub-01: Nell, retainer in) has a ragged signal
// dropout over the palate, where the metal sits. Preston's Figure 2 is the same slice, "upscaled": smoothed, bigger, and with
// six neat cortical layers painted into the dropout, where there is no brain at all. Nudge and scale the figure over the
// scan until they register, then click the six layers inside the hole. Resolves { done }.
// Every nudge says which way is still off. Within one step of every setting it snaps into register. Hint ladder: two
// nudges the wrong way (or 20 moves), Nell counts out the presses left; four (or 30 moves), Morris lines it up. In the
// close-up a click anywhere in the hole marks the nearest unmarked layer.
import { seg, segC } from "../gfx.js";

/* ---------------- the slice (one midsagittal head, facing left, in a 200 × 200 box) ---------------- */
const CX = 108, CY = 96, RX = 64, RY = 52, FOLDS = 15;
const P = (x, y) => x.toFixed(1) + "," + y.toFixed(1);
const line = (pts) => "M" + pts.map(([x, y]) => P(x, y)).join(" L");
// the convexity's cortical ribbon: f = 0 is the pial surface, f = 1 the white-matter boundary. Every lamina follows the folds.
function ribbon(f) {
  const pts = [];
  for (let i = 0; i <= 300; i++) {
    const a = (200 - i * 220 / 300) * Math.PI / 180;
    const sul = Math.pow((1 - Math.cos(FOLDS * a + 0.5)) / 2, 3);          // narrow sulci between rounded gyri
    const r = 1 - 0.15 * sul - f * 0.095;
    pts.push([CX + RX * r * Math.cos(a), CY - RY * r * Math.sin(a)]);
  }
  return line(pts);
}
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
// the dropout, over the upper teeth and palate: a ragged hole (3T) and the same hole smoothed (the "upscaled" figure)
const HC = [49, 132], HR = [22, 15];
const HOLE = (() => { const r = rng(1205), n = 26, out = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 0.8 + 0.4 * r(); out.push([HC[0] + HR[0] * k * Math.cos(a), HC[1] + HR[1] * k * Math.sin(a)]); }
  return out; })();
const holeRagged = line(HOLE) + " Z";
const holeSmooth = (() => { const n = HOLE.length, m = (i) => { const a = HOLE[i % n], b = HOLE[(i + 1) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
  let d = "M" + P(...m(0)); for (let i = 1; i <= n; i++) d += " Q" + P(...HOLE[i % n]) + " " + P(...m(i)); return d + " Z"; })();
// six neat laminae, painted into the hole: a gyrus where the palate is
export const FAKE = Array.from({ length: 6 }, (_, i) => { const pts = [];
  for (let x = 20; x <= 80; x += 1.5) pts.push([x, 122.5 + i * 4.3 + 3.6 * (1 - i * 0.09) * Math.sin((x - 25) / 46 * Math.PI * 2)]);
  return line(pts); });

const SCALP = "M40.5,60 C46,42 80,30 108,30 C140,30 178,44 184,80 C188,110 176,136 153,150 L150,196"
  + " M40.5,60 C32,74 28,88 30,98 C30,102 26,104 24,106 L12,124 L22,128 C24,132 20,134 21,138 L28,141 L21,144 C20,150 22,156 25,160 C27,166 34,170 44,170 C52,172 58,180 60,196";
const SKULL = "M44,66 C52,48 82,37 108,37 C138,37 168,50 174,80 C178,104 170,122 156,134 M44,66 C38,80 36,96 40,108 L56,112";
const BASE = "M48,114 C54,122 66,121 76,118 C80,126 86,136 98,135 C110,134 116,126 122,123 C134,120 150,118 168,114";
const DEEP = "M78,92 C92,78 128,78 142,94 M84,96 C96,86 126,86 136,96"                        // corpus callosum
  + " M112,124 C114,142 116,162 118,186 M127,123 C127,142 129,162 131,186 M112,130 C104,136 106,148 114,152"     // brainstem, pons
  + " M26,128 C40,125 62,123 80,126 M30,141 C42,134 64,133 80,139 C87,144 88,152 84,158"                        // palate, tongue
  + " M140,122 C138,138 150,146 162,142 C172,138 174,126 168,118 M146,126 C150,134 158,136 164,132 M150,121 C153,128 160,129 166,125"; // cerebellum
const CEREB = "M140,122 C138,138 150,146 162,142 C172,138 174,126 168,118";
const PILEUP = "M20,118 C17,124 17,132 19,138 M66,121 C70,127 70,134 67,141 M38,113 C44,111 52,112 57,115";   // bright rim (susceptibility pile-up)

function voxelGrid(step) { let d = ""; for (let v = step; v < 200; v += step) d += `M${v},0 L${v},200 M0,${v} L200,${v} `; return `<path class="hl grid" d="${d}"/>`; }
// Nell's pilot: coarse, honest, with a hole
function nellScan() {
  return `<path d="${SCALP}"/><path class="hl" d="${SKULL}"/><path d="${ribbon(0)}"/><path class="hl" d="${ribbon(1)}"/><path d="${BASE}"/>
    <path class="hl" d="${DEEP}"/><path d="${CEREB}"/><path class="k mech hole" d="${holeRagged}"/><path class="hl" d="${PILEUP}"/>`;
}
// Preston's Figure 2: the same slice, smoothed, with laminae everywhere, including inside the hole
function figure2(clipId, hit) {
  const lam = [0.25, 0.5, 0.75].map(f => `<path class="hl lam" d="${ribbon(f)}"/>`).join("");
  return `<path d="${SCALP}"/><path class="hl" d="${SKULL}"/><path d="${ribbon(0)}"/>${lam}<path class="hl" d="${ribbon(1)}"/><path d="${BASE}"/>
    <path class="hl" d="${DEEP}"/><path d="${CEREB}"/><path class="k hl hole" d="${holeSmooth}"/>
    <g clip-path="url(#${clipId})">${FAKE.map((d, i) => `<g class="lay" ${hit ? `data-layer="${i}"` : ""}><path class="fake" data-l="${i}" d="${d}"/>${hit ? `<path class="hit" d="${d}"/>` : ""}</g>`).join("")}</g>`;
}

const START = { dx: 16, dy: -12, s: 1.25 }, STEP = 4, SSTEP = 0.05;
export const regScore = ({ dx, dy, s }) => Math.round(100 * Math.exp(-((dx / 14) ** 2 + (dy / 14) ** 2 + ((s - 1) / 0.12) ** 2)));
const tf = ({ dx, dy, s }) => `translate(${dx},${dy}) translate(100,100) scale(${s.toFixed(2)}) translate(-100,-100)`;
const LINES = {
  intro: ["NELL", "My practice scan from last spring. Subject 01 is me, retainer in. See the black hole by my mouth? Metal blanks out an MRI. No signal at all."],
  intro2: ["MORRIS", "Like a thumb over the lens, pal."],
  how: ["NELL", "His Figure 2 is 'upscaled.' Lay it over mine and nudge and resize it till the skulls match. Lining scans up is called registering them."],
  far: ["NELL", "Not yet. Line up the skull first."],
  close: ["NELL", "Closer. The folds are starting to line up."],
  // what's still off, biggest first, in the player's own buttons
  off: { L: "It's too far left. Nudge it →.", R: "It's too far right. Nudge it ←.", U: "It sits too high. Nudge it ↓.", D: "It sits too low. Nudge it ↑.",
    big: "His figure's bigger than my scan. SCALE −.", small: "Now it's smaller than my scan. SCALE +." },
  count: (t) => ["NELL", `From here: ${steps(t)}. Then they'll register.`],
  snap: ["MORRIS", "Gimme that, pal. ...There. Skull on skull."],
  inHole: ["NELL", "The stripes inside the black hole. Click each one."],
  match: ["NELL", "They register. Same skull, same folds, same hole in the same place."],
  zoom: ["NELL", "And in the hole, where there's no brain at all: six perfect layers. Upscaling invents what it never saw, like zooming a blurry photo into a face. Click every layer."],
  marks: { 1: ["NELL", "One. Painted on."], 3: ["MORRIS", "That's a lot of brain for a mouth, pal."], 5: ["NELL", "Five. He didn't even make them crooked."] },
  done: ["NELL", "That's not his data. That's my mouth."],
  done2: ["NELL", "His sub-01 had my null. Because his sub-01 is me."],
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
.retainer svg.rtsvg { position: relative; inset: auto; width: 100%; flex: 1 1 0; min-height: 0; }
.retainer .pB path { stroke: var(--B); } .retainer .pA path { stroke: var(--A); } .retainer .pG path { stroke: var(--G); }
.retainer .grid { stroke: var(--N); stroke-width: .5 !important; }
.retainer path.hole { fill: #000; }
.retainer .ov { opacity: .85; }
.retainer .pA .fake, .retainer .pG .fake { stroke: var(--A); }
.retainer .fake.mk { stroke: var(--R) !important; }
.retainer .w1 path { stroke-width: 1.76; } .retainer .w1 .hl { stroke-width: .88; }
.retainer .w2 path { stroke-width: 1.36; } .retainer .w2 .hl { stroke-width: .68; }
.retainer .w3 path { stroke-width: .52; } .retainer .w3 .hl { stroke-width: .26; }
.retainer .w3 .hit { stroke: transparent; stroke-width: 3.4; pointer-events: stroke; cursor: pointer; }
.retainer .lay:hover .fake { stroke: var(--W); }
.retainer .pG .hole { stroke: var(--W); }
.retainer button.nudge { min-width: 3.2cqw; }
`;
function injectStyle(id, css) { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); }

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function retainer(el, { score = () => {} } = {}) {
  injectStyle("mg-retainer", CSS);
  return new Promise(resolve => {
    const S = { t: { ...START }, moves: 0, say: LINES.intro, reg: false, zoom: false, marked: FAKE.map(() => false), done: false, away: 0, helped: false };
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
      const clip = `<defs><clipPath id="rtHoleA"><path d="${holeSmooth}"/></clipPath></defs>`;
      // the big view: the overlay, or (once registered) a close-up of the dropout
      const big = S.zoom
        ? panel(408, 8, 214, `<g class="${scan}">${nellScan()}</g><g class="${fig} ov">${marked(figure2("rtHoleA", true))}</g>`, "w3", "6 93 76 76")
        : panel(408, 8, 214, `<g class="${scan}">${nellScan()}</g><g class="${fig} ov" transform="${tf(S.t)}">${figure2("rtHoleA", false)}</g>`, "w2");
      const svg = `${clip}
        ${panel(18, 14, 168, `${voxelGrid(10)}<g class="pB">${nellScan()}</g>`, "w1")}
        ${panel(212, 14, 168, `<g class="pA" transform="${tf(START)}">${figure2("rtHoleA", false)}</g>`, "w1")}
        ${big}
        ${seg("MY SCAN  SUBJECT 01  N. NULL  3T", 18, 190, 5, "sB", .9)}${seg("HIS FIGURE 2  SUBJECT 01  7T", 212, 190, 5, "sA", .9)}
        ${S.zoom ? segC(`THE HOLE  ×3   LAYERS ${nMarked()}/6`, 515, 228, 6, nMarked() === 6 ? "sR" : "sW", 1)
                 : segC(m ? "LINED UP" : "OVERLAY", 515, 228, 6, m ? "sG" : "sW", 1)}
        ${seg("LINED UP  (REGISTRATION)", 18, 205, 4.2, "sM", .8)}${seg(String(pct).padStart(2, "0") + "%", 18, 213, 18, m ? "sG" : pct >= 60 ? "sA" : "sW", 1.4)}
        ${seg(`SIDEWAYS ${sgn(S.t.dx)}   UP/DOWN ${sgn(-S.t.dy)}   SIZE ${Math.round(S.t.s * 100)}%   MOVES ${S.moves}`, 96, 222, 4.6, "sM", .8)}`;
      const dis = m ? "disabled" : "";
      el.innerHTML = `<div class="screen retainer">
        <svg class="t hd" viewBox="0 0 640 40">${seg("THE RETAINER", 16, 10, 18, "sW", 1.6)}${seg("YOUR SCAN  ·  HIS FIGURE 2  ·  LAY HIS OVER YOURS", 214, 17, 5, "sM", .8)}</svg>
        <svg class="t rtsvg" viewBox="0 0 640 236">${svg}</svg>
        <div class="coachline">${coach()}</div>
        <div class="bar">
          <button class="nudge" data-b="L" ${dis}>←</button><button class="nudge" data-b="R" ${dis}>→</button><button class="nudge" data-b="U" ${dis}>↑</button><button class="nudge" data-b="D" ${dis}>↓</button>
          <button data-b="S-" ${dis}>SCALE −</button><button data-b="S+" ${dis}>SCALE +</button>
          <span class="status">${S.zoom ? `${nMarked()} / 6 LAYERS` : `LINED UP ${pct}%`}</span>
          <button data-b="off" class="off">${S.done ? "DONE" : "CLOSE"}</button></div></div>`;
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
      S.t = { dx: 0, dy: 0, s: 1 }; S.reg = true; sfx("chime"); if (!S.helped) score("retainerReg", 2);
      if (S.helped) later(2200, () => { S.say = LINES.match; }); else S.say = LINES.match;
      later(S.helped ? 4800 : 2600, () => { S.zoom = true; S.say = LINES.zoom; sfx("whoosh"); });
    }
    // a click in the close-up that missed the thin lines: mark the nearest unmarked layer, if it was inside the hole
    function nearest(e) {
      const sv = el.querySelector("svg.w3"); if (!sv || !S.zoom || S.done) return false;
      const m = sv.getScreenCTM(); if (!m) return false;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      if (p.x < 6 || p.x > 82 || p.y < 93 || p.y > 169) return false;          // outside the close-up
      const inHole = ((p.x - HC[0]) / (HR[0] * 1.25)) ** 2 + ((p.y - HC[1]) / (HR[1] * 1.25)) ** 2 <= 1;
      if (!inHole) { S.say = LINES.inHole; draw(); return true; }
      const yAt = (i) => 122.5 + i * 4.3 + 3.6 * (1 - i * 0.09) * Math.sin((p.x - 25) / 46 * Math.PI * 2);
      const free = FAKE.map((_, i) => i).filter(i => !S.marked[i]).sort((a, b) => Math.abs(yAt(a) - p.y) - Math.abs(yAt(b) - p.y));
      if (free.length) mark(free[0]);
      return true;
    }
    function mark(i) {
      if (!S.zoom || S.marked[i] || S.done) return;
      S.marked[i] = true; const n = nMarked(); sfx("layer", { n });
      if (n === 6) { S.done = true; S.say = LINES.done; sfx("stamp"); score("retainerLayers", 3); later(3400, () => { S.say = LINES.done2; }); }
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
      if (e.key === "Escape") { finish(); return; }
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
