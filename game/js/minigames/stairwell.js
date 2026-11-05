// THE FOG — the stairwell. A 2AFC contrast-detection staircase, one landing per trial.
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
const ST = {
  logc: Math.log10(0.25), step: 0.2, run: 0, dir: 0, phase: "fast", reversals: [], trials: [],
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
  get done() { return this.reversals.length >= 8; },
  get threshold() { const r = this.reversals.slice(-6); return Math.pow(10, r.reduce((a, b) => a + b, 0) / r.length); },
};

/* ---------------- state ---------------- */
const S = { landing: 0, target: "L", phase: "intro", nell: { x: 0, y: 0, dir: 1, pose: 0 }, open: null, danger: 0, wisps: [], said: {} };

/* ---------------- drawing ---------------- */
function stairPath() {
  let d = `M0,${UP_Y} L${STAIR_X},${UP_Y}`;
  for (let i = 0; i < STEPS; i++) { const x = STAIR_X + i * SX, y = UP_Y + i * SY; d += ` L${x},${y + SY} L${x + SX},${y + SY}`; }
  return d + ` L640,${FLOOR}`;
}
function scenery() {
  let s = "";
  // cinderblock wall, dim
  for (let y = 24; y < FLOOR; y += 22) s += `<path class="hl sD" d="M0,${y} L640,${y}"/>`;
  for (let y = 24, row = 0; y < FLOOR; y += 22, row++) for (let x = (row % 2) * 30; x < 640; x += 60) s += `<path class="hl sD" d="M${x},${y} L${x},${y + 22}"/>`;
  // (door interiors are painted over with the exact fog color in draw(), so the stimulus background is clean)
  // the shaft's edge and the flight above (where Nell came from)
  s += `<path class="k sW" d="${stairPath()} L640,290 L0,290 Z"/>`;
  for (let i = 0; i < STEPS; i++) { const x = STAIR_X + i * SX, y = UP_Y + i * SY; s += `<path class="hl sM" d="M${x + 3},${y + SY + 4} L${x + SX - 3},${y + SY + 4}"/>`; }
  // handrail with posts
  const rail = `M0,${UP_Y - 40} L${STAIR_X + 6},${UP_Y - 40} L${STAIR_X + STEPS * SX + 6},${FLOOR - 40} L640,${FLOOR - 40}`;
  s += `<path class="sM" d="${rail}"/>`;
  for (let i = 0; i <= STEPS; i += 2) { const x = STAIR_X + i * SX + 6, y = UP_Y + i * SY; s += `<path class="hl sM" d="M${x},${y} L${x},${y - 40}"/>`; }
  for (const x of [40, 100, 600]) { const y = x < 300 ? UP_Y : FLOOR; s += `<path class="hl sM" d="M${x},${y} L${x},${y - 40}"/>`; }
  // the door Nell came through, upper landing (cut off by the frame)
  s += `<path class="sW" d="M28,${UP_Y} L28,6 L92,6 L92,${UP_Y}"/><path class="hl sW" d="M84,52 L84,58"/>`;
  // door frames on the landing
  for (const k of ["L", "R"]) { const d = DOORS[k]; s += `<path class="sW" d="M${d.x - 4},${FLOOR} L${d.x - 4},${DOOR_TOP - 4} L${d.x + d.w + 4},${DOOR_TOP - 4} L${d.x + d.w + 4},${FLOOR}"/>`; }
  return s;
}
function wisp(x, y, w) { return `M${x},${y} c${w / 6},-3 ${w / 3},3 ${w / 2},0 s${w / 3},-3 ${w / 2},0`; }
function newWisps(f) {
  const n = Math.round(2 + f * 7), out = [];
  for (let i = 0; i < n; i++) {
    let x, y, tries = 0;
    do { x = Math.random() * 600; y = 10 + Math.random() * 230; tries++; }
    while (tries < 20 && y > MARK_Y - 34 && y < MARK_Y + 34 && x > DOORS.L.x - 40 && x < DOORS.R.x + DOORS.R.w + 10);
    out.push([x, y, 30 + Math.random() * 50]);
  }
  return out;
}
function nellSVG() {
  const n = S.nell;
  return `<g id="actor" data-pose="${n.pose}" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)}) scale(${n.dir * NELL_S},${NELL_S}) translate(-160,-187)">${nellFigure()}</g>`;
}
function doorPanel(k, st) {
  const d = DOORS[k], open = S.open && S.open.side === k;
  if (open) {
    // through the door: the stairs continue down (right door) or back up (wrong door)
    let z = `<rect class="k sW" x="${d.x}" y="${DOOR_TOP}" width="${d.w}" height="${FLOOR - DOOR_TOP}"/>`;
    for (let i = 0; i < 5; i++) {
      const x0 = d.x + 8 + i * 12, y0 = S.open.correct ? DOOR_TOP + 40 + i * 14 : FLOOR - 20 - i * 18;
      z += `<path class="hl ${S.open.correct ? "sG" : "sR"}" d="M${x0},${y0} L${x0 + 12},${y0} ${S.open.correct ? `L${x0 + 12},${y0 + 14}` : `L${x0 + 12},${y0 - 18}`}"/>`;
    }
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
function hud(st) {
  let s = `<rect x="0" y="291" width="640" height="69" fill="#000"/><path class="hl sD" d="M0,292 L640,292 M152,302 L152,350 M420,302 L420,350"/>`;
  s += chip("NELL NULL", 14, 300, 6.5, "fG");
  s += seg("PICK THE MARKED DOOR", 14, 320, 4.2, "sW", .8) + seg("CLICK OR", 14, 331, 4.2, "sM", .8) + seg("LEFT / RIGHT", 62, 331, 4.2, "sW", .8);
  s += seg("LANDING", 166, 300, 4.2, "sB", .8) + seg(String(S.landing).padStart(2, "0"), 166, 308, 20, "sB", 1.4);
  s += seg("FOG", 230, 300, 4.2, "sW", .8) + seg(String(Math.round(st.f * 99)).padStart(2, "0"), 230, 308, 20, "sW", 1.4);
  s += seg("REVERSALS", 296, 300, 4.2, "sA", .8) + seg(String(ST.reversals.length), 296, 308, 20, "sA", 1.4) + seg("/8", 312, 322, 7, "sM", 1);
  s += seg("TRIALS", 362, 300, 4.2, "sM", .8) + seg(String(ST.trials.length).padStart(2, "0"), 362, 308, 20, "sM", 1.4);
  s += chip("STAIRWELL B", 432, 300, 5.5, "fB") + seg("THE FOG", 432, 322, 7, "sW", 1.1) + seg("TEST BUILD", 432, 335, 4.2, "sM", .8);
  return s;
}
function draw() {
  const st = stimulus(ST.c);
  // the fog is the backdrop; everything drawn in it fades toward it (flat, no gradient)
  let s = `<rect x="0" y="0" width="640" height="290" fill="${css(st.bg)}"/>`;
  s += `<g opacity="${st.lineOp.toFixed(3)}">${scenery()}</g>`;
  s += doorPanel("L", st) + doorPanel("R", st);
  // landing plate on the wall, between the doors
  s += `<g opacity="${st.lineOp.toFixed(2)}">${segC("B2-" + String(S.landing).padStart(2, "0"), 472, 94, 6, "sW", 1)}</g>`;
  // wisps (poses)
  const wc = rgbFor(Math.min(0.9, st.bg.y * 1.5 + 0.01));
  s += S.wisps.map(([x, y, w]) => `<path d="${wisp(x, y, w)}" stroke="${css(wc)}" stroke-width=".75" fill="none" opacity=".55"/>`).join("");
  // Preston, somewhere above: footsteps as drawn arcs on the rail
  if (S.danger > 0) s += arcs(118, UP_Y - 52, -1, "sR", S.danger, 0.9) + (S.danger >= 3 ? `<circle class="fG" cx="70" cy="40" r="1.6"/><circle class="fG" cx="78" cy="40" r="1.6"/>` : "");
  s += nellSVG();
  s += hud(st);
  if (S.phase === "end") s += results();
  svg.innerHTML = s;
}

/* ---------------- quips ---------------- */
let quipT;
function quip(who, text, col) {
  quipEl.innerHTML = `<span class="who" style="background:var(--${col})">${who}</span> <span style="color:var(--${col})">${text}</span>`;
  quipEl.classList.add("show"); clearTimeout(quipT); quipT = setTimeout(() => quipEl.classList.remove("show"), 2800);
}
function once(key, fn) { if (!S.said[key]) { S.said[key] = true; fn(); } }

/* ---------------- motion (Game & Watch steps) ---------------- */
const tick = (ms) => new Promise(r => setTimeout(r, ms));
async function stepTo(x, y, ms = 110) { S.nell.dir = x >= S.nell.x ? 1 : -1; S.nell.pose = S.nell.pose === 1 ? 2 : 1; S.nell.x = x; S.nell.y = y; draw(); await tick(ms); }
async function descend() {
  const ms = ST.trials.length > 12 ? 80 : 110;
  S.nell = { x: 60, y: UP_Y, dir: 1, pose: 0 }; draw(); await tick(ms);
  await stepTo(STAIR_X - 10, UP_Y, ms);
  for (let i = 1; i <= STEPS; i++) await stepTo(STAIR_X - 10 + i * SX, UP_Y + i * SY, ms);
  await stepTo(400, FLOOR, ms); await stepTo(STAND.mid, FLOOR, ms);
  S.nell.pose = 0; S.nell.dir = 1; draw();
}

/* ---------------- a trial ---------------- */
async function trial() {
  S.target = Math.random() < 0.5 ? "L" : "R"; S.open = null; S.wisps = newWisps(fogOf(ST.c));
  S.phase = "walk"; await descend(); S.phase = "choose";
  if (ST.c < 0.02) once("cantsee", () => quip("MORRIS", "I CAN'T SEE ANYTHING, PAL.", "K"));
}
async function choose(side) {
  if (S.phase !== "choose") return;
  S.phase = "resolve";
  const correct = side === S.target, st = stimulus(ST.c);
  ST.trials.push({ c: ST.c, actual: st.actual, side, target: S.target, correct, landing: S.landing });
  await stepTo((STAND.mid + STAND[side]) / 2, FLOOR, 90); await stepTo(STAND[side], FLOOR, 90);
  S.open = { side, correct }; S.nell.pose = 0; draw(); await tick(520);
  const move = ST.update(correct);
  S.landing += correct ? 1 : -1;
  if (correct) { if (move === -1) S.danger = Math.max(0, S.danger - 1); }
  else S.danger = Math.min(3, S.danger + 1);
  // a few lines, never in the way
  if (!correct) once("wrongway", () => quip("MORRIS", "WRONG WAY, PAL. THAT'S UP.", "K"));
  else if (S.said.cantsee && !S.said.gut) once("gut", () => quip("NELL", "PICK ANYWAY. YOUR GUT'S BETTER THAN YOU THINK.", "G"));
  else if (move === -1 && ST.phase === "main") once("atmos", () => quip("VOICE BELOW", "SHE'S GETTING AWAY. MORE ATMOSPHERE.", "V"));
  if (S.danger >= 3) once("coffee", () => quip("PRESTON (ABOVE)", "NELL! LET'S GRAB COFFEE!", "R"));
  // cut to black for one frame, then the next flight
  svg.innerHTML = `<rect width="640" height="360" fill="#000"/>`; await tick(140);
  if (ST.done) { finish(); return; }
  trial();
}

/* ---------------- the end: the staircase plot is the staircase ---------------- */
function results() {
  const T = ST.trials, thr = ST.threshold, n = T.length;
  const px = (i) => 70 + (i / Math.max(1, n)) * 530, py = (c) => 140 + (Math.log10(0.4) - Math.log10(c)) / 2.4 * 130;
  let s = `<rect x="0" y="0" width="640" height="290" fill="#000"/>`;
  s += chip("B3 ANTECHAMBER", 20, 14, 6, "fV");
  s += seg("CONTRAST THRESHOLD", 20, 38, 4.6, "sA", .9) + seg((thr * 100).toFixed(thr < 0.1 ? 1 : 0) + "%", 20, 48, 34, "sA", 2);
  s += seg("2AFC   2-DOWN-1-UP   8 REVERSALS   ABOUT 71% CORRECT", 200, 44, 5, "sW", .9);
  const pc = Math.round(100 * T.filter(t => t.correct).length / n);
  s += seg(`${n} LANDINGS   ${pc}% RIGHT DOORS`, 200, 58, 5, "sM", .9);
  s += seg("UNCALIBRATED SCREEN. DON'T PUT IT IN A PAPER.", 200, 72, 4.4, "sR", .8);
  // axes
  s += `<path class="hl sM" d="M64,134 L64,276 L606,276"/>`;
  for (const c of [0.3, 0.1, 0.03, 0.01, 0.003]) { const y = py(c); if (y > 276) continue;
    s += `<path class="hl sD" d="M64,${y} L606,${y}"/>` + seg((c * 100 >= 1 ? Math.round(c * 100) : c * 100) + "%", 22, y - 3, 5, "sM", .8); }
  s += seg("CONTRAST", 20, 124, 4.2, "sM", .8) + seg("LANDING", 560, 280, 4.2, "sM", .8);
  // threshold line
  s += `<path class="hl dash sA" d="M64,${py(thr)} L606,${py(thr)}"/>`;
  // the run, drawn as stairs: flat for a landing, then a riser to the next
  let d = "";
  T.forEach((t, i) => { const x0 = px(i), x1 = px(i + 1), y = py(t.c); d += (i ? ` L${x0},${y}` : `M${x0},${y}`) + ` L${x1},${y}`; });
  s += `<path class="sW" d="${d}"/>`;
  T.forEach((t, i) => { const x = (px(i) + px(i + 1)) / 2, y = py(t.c);
    s += t.correct ? `<circle class="fG" cx="${x}" cy="${y - 4}" r="2.2"/>` : `<circle class="k sR" cx="${x}" cy="${y - 4}" r="2.2"/>`; });
  // again
  s += `<g data-again="1" style="cursor:pointer"><rect class="fW" x="560" y="14" width="64" height="20"/>${segC("AGAIN", 592, 20, 7, "s0", 1.2)}</g>`;
  return s;
}
async function finish() {
  S.phase = "end"; draw();
  quip("NELL", "I JUST RAN A STAIRCASE IN A STAIRCASE.", "G");
  setTimeout(() => quip("MORRIS", "IS THAT A JOKE? IT FEELS LIKE A JOKE.", "K"), 3000);
}

/* ---------------- input ---------------- */
svg.addEventListener("click", (e) => {
  const door = e.target.closest && e.target.closest("[data-door]");
  if (door) { choose(door.dataset.door); return; }
  if (e.target.closest && e.target.closest("[data-again]")) location.reload();
});
window.addEventListener("keydown", (e) => {
  if (S.phase === "intro" && (e.key === "Enter" || e.key === " ")) { begin(); return; }
  if (e.key === "ArrowLeft" || e.key === "a") choose("L");
  if (e.key === "ArrowRight" || e.key === "d") choose("R");
});
setInterval(() => { if (S.phase === "choose" || S.phase === "walk") { S.wisps = newWisps(fogOf(ST.c)); if (S.phase === "choose") draw(); } }, 650);

function begin() { if (S.phase !== "intro") return; introEl.classList.remove("show"); S.phase = "walk"; trial(); }
introEl.addEventListener("click", begin);

// testing hook
window.STAIR = { S, ST, stimulus, choose, rgbFor };

S.nell = { x: 60, y: UP_Y, dir: 1, pose: 0 }; draw();
