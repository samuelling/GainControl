// THE FOG — the stairwell. A 2AFC contrast-detection staircase, one landing per trial, run as a chase.
// The mark's contrast is rendered for real on the player's screen (sRGB, with bit-stealing
// for sub-step luminance), so the threshold at the end is the player's own, uncalibrated.
// Exception to the palette rule: the stimulus and the fog are computed grays, not palette classes.
import { seg, segW, segC, chip, chipW, arcs } from "../gfx.js";
import { nellFigure } from "../figures.js";

const svg = document.getElementById("game"), frame = document.getElementById("frame");
const quipEl = document.getElementById("quip"), introEl = document.getElementById("intro");

/* ---------------- geometry (native 640×360) ---------------- */
const UP_Y = 92, FLOOR = 244, STEPS = 8, SX = 22, SY = 19, STAIR_X = 150;   // flight: (150,92) → (326,244)
const DOORS = { L: { x: 370, w: 74 }, R: { x: 500, w: 74 } }, DOOR_TOP = 112;
const MARK_Y = 160, R1 = 10, R2 = 4.2;
const NELL_S = 0.58;
const STAND = { L: DOORS.L.x + DOORS.L.w / 2, R: DOORS.R.x + DOORS.R.w / 2, mid: 472 };

/* ---------------- luminance, sRGB, bit-stealing ---------------- */
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const enc = (L) => 255 * (L <= 0.0031308 ? 12.92 * L : 1.055 * Math.pow(L, 1 / 2.4) - 0.055);
const Y = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
// nearest displayable luminance, using small per-channel offsets around neutral gray
function rgbFor(L) {
  const b0 = Math.floor(enc(L)); let best = null;
  for (let r = b0 - 1; r <= b0 + 2; r++) for (let g = b0 - 1; g <= b0 + 2; g++) for (let b = b0 - 1; b <= b0 + 2; b++) {
    if (Math.min(r, g, b) < 0 || Math.max(r, g, b) > 255 || Math.max(r, g, b) - Math.min(r, g, b) > 2) continue;
    const y = Y(r, g, b), e = Math.abs(y - L);
    if (!best || e < best.e) best = { e, r, g, b, y };
  }
  return best;
}
const css = (c) => `rgb(${c.r},${c.g},${c.b})`;

// fog level f (0 clear … 1 thick) follows the mark's contrast, as if the veil were what lowered it
const C_MAX = 0.4, C_MIN = 0.002;
const fogOf = (c) => Math.max(0, Math.min(1, (Math.log10(C_MAX) - Math.log10(c)) / 2));
function stimulus(c) {
  const f = fogOf(c), bgL = 0.012 + 0.24 * f;
  const bg = rgbFor(bgL), mk = rgbFor(bg.y * (1 + c));
  return { f, bg, mk, actual: (mk.y - bg.y) / bg.y, veil: rgbFor(bgL * 0.92), lineOp: 1 - 0.82 * f };
}

/* ---------------- the staircase: 1-down until the first miss, then 2-down-1-up ---------------- */
const REVERSALS = 6;
const ST = {
  logc: Math.log10(0.10), step: 0.25, run: 0, dir: 0, phase: "fast", reversals: [], trials: [],
  get c() { return Math.pow(10, this.logc); },
  update(correct) {
    let move = 0;
    if (correct) { this.run++; if (this.phase === "fast" || this.run >= 2) { move = -1; this.run = 0; } }
    else { this.run = 0; move = +1; this.phase = "main"; }
    if (!move) return 0;
    if (this.dir && move !== this.dir) { this.reversals.push(this.logc); if (this.reversals.length === 2) this.step /= 2; }
    this.dir = move;
    this.logc = Math.max(Math.log10(C_MIN), Math.min(Math.log10(C_MAX), this.logc + move * this.step));
    return move;
  },
  get done() { return this.reversals.length >= REVERSALS; },
  get threshold() { const r = this.reversals.slice(-4); return Math.pow(10, r.reduce((a, b) => a + b, 0) / r.length); },
};

/* ---------------- state ---------------- */
const GAP_MAX = 8, HESITATE_MS = 2200;
const S = { landing: 0, target: "L", phase: "intro", nell: { x: 60, y: UP_Y, dir: 1, pose: 0 }, open: null, dash: null,
  gap: 6, streak: 0, best: 0, score: 0, caught: 0, pop: null, t0: 0, arrived: 0, wisps: [], said: {} };

/* ---------------- drawing ---------------- */
function stairPath() {
  let d = `M0,${UP_Y} L${STAIR_X},${UP_Y}`;
  for (let i = 0; i < STEPS; i++) { const x = STAIR_X + i * SX, y = UP_Y + i * SY; d += ` L${x},${y + SY} L${x + SX},${y + SY}`; }
  return d + ` L640,${FLOOR}`;
}
function scenery() {
  let s = "";
  for (let y = 24; y < FLOOR; y += 22) s += `<path class="hl sD" d="M0,${y} L640,${y}"/>`;
  for (let y = 24, row = 0; y < FLOOR; y += 22, row++) for (let x = (row % 2) * 30; x < 640; x += 60) s += `<path class="hl sD" d="M${x},${y} L${x},${y + 22}"/>`;
  s += `<path class="k sW" d="${stairPath()} L640,290 L0,290 Z"/>`;
  for (let i = 0; i < STEPS; i++) { const x = STAIR_X + i * SX, y = UP_Y + i * SY; s += `<path class="hl sM" d="M${x + 3},${y + SY + 4} L${x + SX - 3},${y + SY + 4}"/>`; }
  s += `<path class="sM" d="M0,${UP_Y - 40} L${STAIR_X + 6},${UP_Y - 40} L${STAIR_X + STEPS * SX + 6},${FLOOR - 40} L640,${FLOOR - 40}"/>`;
  for (let i = 0; i <= STEPS; i += 2) { const x = STAIR_X + i * SX + 6, y = UP_Y + i * SY; s += `<path class="hl sM" d="M${x},${y} L${x},${y - 40}"/>`; }
  for (const x of [40, 100, 600]) { const y = x < 300 ? UP_Y : FLOOR; s += `<path class="hl sM" d="M${x},${y} L${x},${y - 40}"/>`; }
  s += `<path class="sW" d="M28,${UP_Y} L28,6 L92,6 L92,${UP_Y}"/>`;
  for (const k of ["L", "R"]) { const d = DOORS[k]; s += `<path class="sW" d="M${d.x - 4},${FLOOR} L${d.x - 4},${DOOR_TOP - 4} L${d.x + d.w + 4},${DOOR_TOP - 4} L${d.x + d.w + 4},${FLOOR}"/>`; }
  return s;
}
function wisp(x, y, w) { return `M${x},${y} c${w / 6},-3 ${w / 3},3 ${w / 2},0 s${w / 3},-3 ${w / 2},0`; }
function newWisps(f) {
  const n = Math.round(3 + f * 8), out = [];
  for (let i = 0; i < n; i++) {
    let x, y, tries = 0;
    do { x = Math.random() * 640; y = 10 + Math.random() * 230; tries++; }
    while (tries < 20 && y > MARK_Y - 34 && y < MARK_Y + 34);
    out.push({ x, y, w: 30 + Math.random() * 50, vx: (Math.random() < .5 ? -1 : 1) * (3 + Math.random() * 5) });
  }
  return out;
}
function nellSVG() {
  const n = S.nell;
  let dash = "";
  if (S.dash) { const [x0, y0, x1, y1] = S.dash; for (const o of [-46, -30, -14]) dash += `<path class="hl sW" d="M${x0 + (x1 - x0) * .2},${y0 + (y1 - y0) * .2 + o} L${x0 + (x1 - x0) * .7},${y0 + (y1 - y0) * .7 + o}"/>`; }
  return dash + `<g id="actor" data-pose="${n.pose}" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)}) scale(${n.dir * NELL_S},${NELL_S}) translate(-160,-187)">${nellFigure()}</g>`;
}
// Preston on the flight above: closer as the gap shrinks
function prestonSVG(st) {
  const i = GAP_MAX - Math.max(0, Math.min(GAP_MAX, S.gap));
  if (i <= 0) return "";
  const x = STAIR_X - 40 + i * SX * 0.95, y = UP_Y + Math.max(0, i - 1) * SY;
  // he's in the fog like everything else; only his lit earbuds cut through it
  return `<g transform="translate(${x},${y})">
    <g opacity="${st.lineOp.toFixed(3)}"><path class="sR" d="M-14,0 L-12,-34 C-12,-42 12,-42 12,-34 L14,0 M-5,-40 L0,-30 L5,-40"/>
      <path class="sK" d="M-8,-50 C-8,-41 8,-41 8,-50"/><path class="k sA" d="M-9,-50 C-10,-62 10,-62 9,-50 C5,-55 -5,-55 -9,-50 Z"/></g>
    <circle class="fG" cx="-9" cy="-48" r="1.9"/><circle class="fG" cx="9" cy="-48" r="1.9"/>
    ${arcs(14, -48, 1, "sG", 2, 0.7)}${arcs(-14, -48, -1, "sG", 2, 0.7)}</g>`;
}
function doorPanel(k, st) {
  const d = DOORS[k], open = S.open && S.open.side === k;
  if (open) {
    let z = `<rect class="k sW" x="${d.x}" y="${DOOR_TOP}" width="${d.w}" height="${FLOOR - DOOR_TOP}"/>`;
    for (let i = 0; i < 5; i++) {
      const x0 = d.x + 8 + i * 12, y0 = S.open.correct ? DOOR_TOP + 40 + i * 14 : FLOOR - 20 - i * 18;
      z += `<path class="hl ${S.open.correct ? "sG" : "sR"}" d="M${x0},${y0} L${x0 + 12},${y0} ${S.open.correct ? `L${x0 + 12},${y0 + 14}` : `L${x0 + 12},${y0 - 18}`}"/>`;
    }
    z += arcs(d.x - 8, DOOR_TOP + 60, -1, "sW", 3, 0.8) + arcs(d.x + d.w + 8, DOOR_TOP + 60, 1, "sW", 3, 0.8);
    return z + segC(S.open.correct ? "DOWN" : "UP", d.x + d.w / 2, DOOR_TOP + 10, 6, S.open.correct ? "sG" : "sR", 1.1);
  }
  let z = `<rect x="${d.x}" y="${DOOR_TOP}" width="${d.w}" height="${FLOOR - DOOR_TOP}" fill="${css(st.bg)}" stroke="none"/>`;
  z += `<g opacity="${st.lineOp.toFixed(3)}"><path class="sW" d="M${d.x + d.w - 12},${DOOR_TOP + 70} L${d.x + d.w - 12},${DOOR_TOP + 82}"/></g>`;
  if (S.target === k) {
    const cx = d.x + d.w / 2;
    z += `<circle cx="${cx}" cy="${MARK_Y}" r="${R1}" fill="none" stroke="${css(st.mk)}" stroke-width="1.5"/><circle cx="${cx}" cy="${MARK_Y}" r="${R2}" fill="none" stroke="${css(st.mk)}" stroke-width="1.5"/>`;
  }
  return z + `<rect x="${d.x}" y="${DOOR_TOP}" width="${d.w}" height="${FLOOR - DOOR_TOP}" fill="transparent" data-door="${k}" style="cursor:pointer"/>`;
}
const pts = (n) => String(Math.max(0, n)).padStart(4, "0");
function hud(st) {
  let s = `<rect x="0" y="291" width="640" height="69" fill="#000"/><path class="hl sD" d="M0,292 L640,292 M126,302 L126,350 M520,302 L520,350"/>`;
  s += chip("NELL NULL", 12, 300, 6.5, "fG");
  s += seg("LEFT / RIGHT", 12, 320, 4.2, "sW", .8) + seg("OR CLICK A DOOR", 12, 331, 4.2, "sM", .8);
  s += seg("LANDING", 138, 300, 4.2, "sB", .8) + seg(String(S.landing).padStart(2, "0"), 138, 308, 20, "sB", 1.4);
  s += seg("FOG", 196, 300, 4.2, "sW", .8) + seg(String(Math.round(st.f * 99)).padStart(2, "0"), 196, 308, 20, "sW", 1.4);
  s += seg("SCORE", 254, 300, 4.2, "sA", .8) + seg(pts(S.score), 254, 308, 20, "sA", 1.4);
  s += seg("STREAK", 350, 300, 4.2, "sG", .8) + seg("X" + S.streak, 350, 308, 20, "sG", 1.4);
  // Preston meter: lit cells are the distance you have left
  s += seg("PRESTON", 414, 300, 4.2, "sR", .8);
  for (let i = 0; i < GAP_MAX; i++) s += `<rect class="${i < S.gap ? "fG" : "hl sR"}" x="${414 + i * 12}" y="310" width="9" height="16"/>`;
  s += seg(`REVERSALS ${ST.reversals.length}/${REVERSALS}`, 414, 334, 4.2, "sM", .8);
  s += chip("STAIRWELL B", 532, 300, 5.5, "fB") + seg("THE FOG", 532, 322, 7, "sW", 1.1) + seg(clock(), 532, 336, 6, "sM", 1);
  return s;
}
const clock = () => { const t = S.t0 ? Math.floor((Date.now() - S.t0) / 1000) : 0; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
function draw() {
  const st = stimulus(ST.c);
  let s = `<rect x="0" y="0" width="640" height="290" fill="${css(st.bg)}"/>`;
  s += `<g opacity="${st.lineOp.toFixed(3)}">${scenery()}</g>`;
  s += doorPanel("L", st) + doorPanel("R", st);
  s += `<g opacity="${st.lineOp.toFixed(2)}">${segC("B2-" + String(S.landing).padStart(2, "0"), 472, 94, 6, "sW", 1)}</g>`;
  const wc = rgbFor(Math.min(0.9, st.bg.y * 1.5 + 0.01));
  s += S.wisps.map(w => `<path d="${wisp(w.x, w.y, w.w)}" stroke="${css(wc)}" stroke-width=".75" fill="none" opacity=".55"/>`).join("");
  s += prestonSVG(st) + nellSVG();
  if (S.pop) s += segC(S.pop.t, S.pop.x, S.pop.y, 9, S.pop.cls, 1.4);
  s += hud(st);
  if (S.phase === "caught") s += caughtCard();
  if (S.phase === "end") s += results();
  svg.innerHTML = s;
}

/* ---------------- quips ---------------- */
let quipT;
function quip(who, text, col) {
  quipEl.innerHTML = `<span class="who" style="background:var(--${col})">${who}</span> <span style="color:var(--${col})">${text}</span>`;
  quipEl.classList.add("show"); clearTimeout(quipT); quipT = setTimeout(() => quipEl.classList.remove("show"), 2400);
}
function once(key, fn) { if (!S.said[key]) { S.said[key] = true; fn(); } }

/* ---------------- motion: big Game & Watch jumps ---------------- */
const tick = (ms) => new Promise(r => setTimeout(r, ms));
async function jumpTo(x, y, ms) { S.dash = [S.nell.x, S.nell.y, x, y]; S.nell.dir = x >= S.nell.x ? 1 : -1; S.nell.pose = S.nell.pose === 1 ? 2 : 1; S.nell.x = x; S.nell.y = y; draw(); await tick(ms); }
async function descend() {
  S.nell = { x: 60, y: UP_Y, dir: 1, pose: 1 }; S.dash = null; draw(); await tick(70);
  await jumpTo(STAIR_X + SX * 2, UP_Y + SY * 2, 75);
  await jumpTo(STAIR_X + SX * 5, UP_Y + SY * 5, 75);
  await jumpTo(STAIR_X + SX * 8 + 30, FLOOR, 75);
  await jumpTo(STAND.mid, FLOOR, 60);
  S.dash = null; S.nell.pose = 0; S.nell.dir = 1; draw();
}

/* ---------------- a trial ---------------- */
async function trial() {
  S.target = Math.random() < 0.5 ? "L" : "R"; S.open = null; S.pop = null; S.wisps = newWisps(fogOf(ST.c));
  S.phase = "walk"; await descend();
  S.phase = "choose"; S.arrived = Date.now();
  if (ST.c < 0.02) once("cantsee", () => quip("MORRIS", "I CAN'T SEE ANYTHING, PAL.", "K"));
}
async function choose(side) {
  if (S.phase !== "choose") return;
  S.phase = "resolve";
  const correct = side === S.target, st = stimulus(ST.c), rt = Date.now() - S.arrived;
  ST.trials.push({ c: ST.c, actual: st.actual, side, target: S.target, correct, rt, landing: S.landing });
  await jumpTo(STAND[side], FLOOR, 70); S.dash = null;
  S.open = { side, correct }; S.nell.pose = 0;
  if (correct) {
    S.streak++; S.best = Math.max(S.best, S.streak);
    let gain = Math.round((10 + 90 * st.f) * (1 + 0.25 * Math.min(S.streak - 1, 8)));
    const quick = rt < 1200; if (quick) gain += 15;
    S.score += gain; S.gap = Math.min(GAP_MAX, S.gap + 1);
    S.pop = { t: "+" + gain + (quick ? " QUICK" : ""), x: STAND[side], y: DOOR_TOP - 26, cls: "sG" };
  } else {
    S.streak = 0; S.gap -= 2;
    S.pop = { t: "WRONG WAY", x: STAND[side], y: DOOR_TOP - 26, cls: "sR" };
  }
  draw(); await tick(correct ? 260 : 420);
  const move = ST.update(correct);
  S.landing += correct ? 1 : -1;
  if (!correct) once("wrongway", () => quip("MORRIS", "WRONG WAY, PAL. THAT'S UP.", "K"));
  else if (S.said.cantsee && !S.said.gut) once("gut", () => quip("NELL", "PICK ANYWAY. YOUR GUT'S BETTER THAN YOU THINK.", "G"));
  else if (move === -1 && ST.phase === "main") once("atmos", () => quip("VOICE BELOW", "SHE'S GETTING AWAY. MORE ATMOSPHERE.", "V"));
  else if (S.streak === 5) once("streak5", () => quip("MORRIS", "LOOK AT YOU GO, PAL.", "K"));
  svg.innerHTML = `<rect width="640" height="360" fill="#000"/>`; await tick(70);
  if (S.gap <= 0) { caught(); return; }
  if (ST.done) { finish(); return; }
  trial();
}

/* ---------------- Preston closes in while you hesitate ---------------- */
setInterval(() => {
  if (S.phase === "choose" && Date.now() - S.arrived > HESITATE_MS) {
    S.arrived = Date.now(); S.gap -= 1;
    if (S.gap === 2) once("close", () => quip("PRESTON (ABOVE)", "NELL! WAIT UP! LET'S NETWORK!", "R"));
    if (S.gap <= 0) { caught(); return; }
    draw();
  }
}, 100);
function caught() { S.phase = "caught"; S.caught++; S.streak = 0; S.score = Math.max(0, S.score - 100); draw(); }
function caughtCard() {
  return `<rect x="0" y="0" width="640" height="290" fill="#000" opacity=".92"/>
    ${segC("CAUGHT", 320, 60, 40, "sR", 2)}
    ${segC("PRESTON: LET'S GRAB COFFEE. ACTUALLY, LET'S GRAB SYNERGY.", 320, 128, 7, "sW", 1.1)}
    ${segC("-100", 320, 150, 9, "sA", 1.3)}
    <g data-revise="1" style="cursor:pointer"><rect class="fW" x="230" y="196" width="180" height="28"/>${segC("REVISE & RESUBMIT", 320, 205, 8, "s0", 1.3)}</g>
    ${segC("OR PRESS SPACE", 320, 236, 4.6, "sM", .8)}`;
}
function revise() { if (S.phase !== "caught") return; S.gap = 5; svg.innerHTML = `<rect width="640" height="360" fill="#000"/>`; setTimeout(trial, 120); }

/* ---------------- the end ---------------- */
function rank(t) {
  if (t < 0.008) return ["PHOTON COUNTER", "fG"];
  if (t < 0.015) return ["SHARP-EYED", "fG"];
  if (t < 0.03) return ["SOLID OBSERVER", "fA"];
  if (t < 0.06) return ["LOST IN THE FOG", "fA"];
  return ["FOG NEURO MATERIAL", "fR"];
}
function results() {
  const T = ST.trials, thr = ST.threshold, n = T.length, [rk, rf] = rank(thr);
  const px = (i) => 300 + (i / Math.max(1, n)) * 310, py = (c) => 120 + (Math.log10(0.4) - Math.log10(c)) / 2.4 * 150;
  let s = `<rect x="0" y="0" width="640" height="290" fill="#000"/>`;
  s += chip("B3 ANTECHAMBER", 20, 14, 6, "fV");
  s += seg("CONTRAST THRESHOLD", 20, 40, 4.6, "sA", .9) + seg((thr * 100).toFixed(1) + "%", 20, 50, 40, "sA", 2.2);
  s += chip(rk, 20, 104, 7, rf);
  s += seg("SCORE", 20, 134, 4.2, "sA", .8) + seg(pts(S.score), 20, 142, 18, "sA", 1.4);
  s += seg("TIME", 120, 134, 4.2, "sW", .8) + seg(clock(), 120, 142, 18, "sW", 1.4);
  s += seg("BEST STREAK", 20, 176, 4.2, "sG", .8) + seg("X" + S.best, 20, 184, 18, "sG", 1.4);
  s += seg("CAUGHT", 120, 176, 4.2, "sR", .8) + seg(String(S.caught), 120, 184, 18, "sR", 1.4);
  s += seg(`2AFC  2-DOWN-1-UP  ${REVERSALS} REVERSALS  ${n} LANDINGS`, 20, 222, 4.6, "sW", .8);
  s += seg("UNCALIBRATED SCREEN. DON'T PUT IT IN A PAPER.", 20, 236, 4.4, "sR", .8);
  // the run, drawn as stairs
  s += `<path class="hl sM" d="M294,114 L294,276 L616,276"/>` + seg("CONTRAST", 294, 104, 4.2, "sM", .8) + seg("LANDING", 580, 280, 4.2, "sM", .8);
  for (const c of [0.3, 0.1, 0.03, 0.01, 0.003]) { const y = py(c); if (y > 276) continue;
    s += `<path class="hl sD" d="M294,${y} L616,${y}"/>` + seg((c * 100 >= 1 ? Math.round(c * 100) : c * 100) + "%", 262, y - 3, 4.6, "sM", .8); }
  s += `<path class="hl dash sA" d="M294,${py(thr)} L616,${py(thr)}"/>`;
  let d = ""; T.forEach((t, i) => { const x0 = px(i), x1 = px(i + 1), y = py(t.c); d += (i ? ` L${x0},${y}` : `M${x0},${y}`) + ` L${x1},${y}`; });
  s += `<path class="sW" d="${d}"/>`;
  T.forEach((t, i) => { const x = (px(i) + px(i + 1)) / 2, y = py(t.c);
    s += t.correct ? `<circle class="fG" cx="${x}" cy="${y - 4}" r="2"/>` : `<circle class="k sR" cx="${x}" cy="${y - 4}" r="2"/>`; });
  s += `<g data-again="1" style="cursor:pointer"><rect class="fW" x="548" y="14" width="76" height="22"/>${segC("RUN AGAIN", 586, 21, 6.5, "s0", 1.2)}</g>`;
  return s;
}
async function finish() {
  S.phase = "end"; S.tEnd = clock(); draw();
  quip("NELL", "I JUST RAN A STAIRCASE IN A STAIRCASE.", "G");
  setTimeout(() => quip("MORRIS", "IS THAT A JOKE? IT FEELS LIKE A JOKE.", "K"), 2600);
}

/* ---------------- input ---------------- */
svg.addEventListener("click", (e) => {
  const t = e.target.closest ? e.target : null; if (!t) return;
  const door = t.closest("[data-door]"); if (door) { choose(door.dataset.door); return; }
  if (t.closest("[data-revise]")) { revise(); return; }
  if (t.closest("[data-again]")) location.reload();
});
window.addEventListener("keydown", (e) => {
  if (S.phase === "intro" && (e.key === "Enter" || e.key === " ")) { begin(); return; }
  if (S.phase === "caught" && (e.key === " " || e.key === "Enter")) { revise(); return; }
  if (e.key === "ArrowLeft" || e.key === "a") choose("L");
  if (e.key === "ArrowRight" || e.key === "d") choose("R");
});
// fog drifts in steps (poses), and the clock ticks
setInterval(() => {
  if (S.phase !== "choose") return;
  for (const w of S.wisps) { w.x += w.vx; if (w.x > 660) w.x = -60; if (w.x < -80) w.x = 640; }
  draw();
}, 140);

function begin() { if (S.phase !== "intro") return; introEl.classList.remove("show"); S.t0 = Date.now(); trial(); }
introEl.addEventListener("click", begin);

// testing hook
window.STAIR = { S, ST, stimulus, choose, rgbFor, revise };

draw();
