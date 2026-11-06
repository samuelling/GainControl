// THE FOG — the stairwell. A 2AFC contrast-detection staircase, one landing per trial, run as a chase.
// The mark's contrast is rendered for real on the player's screen (sRGB, with bit-stealing
// for sub-step luminance), so the threshold at the end is the player's own, uncalibrated.
// Exception to the palette rule: the stimulus and the fog are computed grays, not palette classes.
// stairwell(el, { die, score, chip }) → Promise<{ escaped, threshold }>. If Preston catches Nell, await die(text) (the game's
// death screen; resolves on REVISE & RESUBMIT), then she runs on from the same landing with her staircase data intact.
//
// The descent runs through five zones (2F offices → 1F atrium → B1 MRI → B2 steam tunnels → B3 the 1960s annex), each with
// its own wall, signage, door frames and stair geometry. Every few trials a short EVENT interrupts the run (a hand on the rail,
// a robe in a doorway, a jammed fire door, a dropped notebook, a fog surge, a voice from a vent, a flicker, a chained door,
// a breather). Events never touch the staircase: no level change, nothing logged as a trial. The fog surge is a REMINDER
// trial (an easy, high-contrast landing that real staircases use to catch lapses): logged separately, out of the threshold.
// Scenery stays outside the door panels, which carry the stimulus exactly as before.
// Kept forgiving on purpose: five reversals (not six), events every three to five landings, a wrong door costs one flight
// (not two), Preston waits longer on each landing, a HE'S RIGHT BEHIND YOU warning shows before he can catch you, and two
// misses in a row get a "just guess" nudge. The staircase itself is the hint ladder: every miss makes the next mark
// clearer. A catch costs nothing but the death card (Revise & Resubmit picks up on the same landing, data intact).
// Esc does nothing once the run has started (the caller reopens THE FOG from scratch on a close).
import { seg, segW, segC, chip, chipW, arcs, star4 } from "../gfx.js";
import { nellFigure, morrisPeek, robedFigure } from "../figures.js";
import { rexHead } from "../cast/act3b.js";

/* ---------------- geometry (native 640×360) ---------------- */
const UP_Y = 92, FLOOR = 244, STEPS = 8, SX = 22, SY = 19, STAIR_X = 150;   // the classic flight: (150,92) → (326,244)
const DOORS = { L: { x: 370, w: 74 }, R: { x: 500, w: 74 } }, DOOR_TOP = 112;
const MARK_Y = 160, R1 = 10, R2 = 4.2;
const NELL_S = 0.58;
const STAND = { L: DOORS.L.x + DOORS.L.w / 2, R: DOORS.R.x + DOORS.R.w / 2, mid: 472 };
const other = (k) => k === "L" ? "R" : "L";
// Stair geometries. Every front flight lands on the floor at x ≤ 326, so the doors never move.
//   flight: the classic.  long: one long straight flight from high up.  switch: a switchback (the flight above comes
//   down right-to-left behind, onto a mid landing).  window: the classic, with a tall window over the flight.
const GEOS = {
  flight: { id: "flight", top: UP_Y, x0: STAIR_X, n: STEPS, sx: SX, sy: SY, entry: "door", slot: [176, 6] },
  long:   { id: "long", top: 70, x0: 62, n: 11, sx: 24, sy: 174 / 11, entry: "open", slot: [196, 8] },
  switch: { id: "switch", top: 124, x0: 130, n: 6, sx: 30, sy: 20, entry: "back", back: { x1: 312, y1: 60, x2: 96, n: 6 }, slot: [8, 18] },
  window: { id: "window", top: UP_Y, x0: STAIR_X, n: STEPS, sx: SX, sy: SY, entry: "door", window: true, slot: null },
};
const xEnd = (g) => g.x0 + g.n * g.sx;
const tread = (g, k) => ({ x: g.x0 + k * g.sx, y: g.top + k * g.sy });
const backPt = (g, j) => { const b = g.back, bsx = (b.x1 - b.x2) / b.n, bsy = (g.top - b.y1) / b.n; return { x: b.x1 - j * bsx, y: b.y1 + j * bsy }; };

/* ---------------- the five zones ---------------- */
const ZONES = [
  { fl: "2F", name: "FACULTY OFFICES", short: "OFFICES", f: "fA", s: "sA", geos: ["flight", "long"] },
  { fl: "1F", name: "ATRIUM SIDE", short: "ATRIUM", f: "fB", s: "sB", geos: ["window", "flight"] },
  { fl: "B1", name: "MRI SUITE", short: "MRI SUITE", f: "fR", s: "sR", geos: ["switch", "flight"] },
  { fl: "B2", name: "STEAM TUNNELS", short: "TUNNELS", f: "fW", s: "sW", geos: ["long", "switch"] },
  { fl: "B3", name: "PSYCHOPHYSICS ANNEX", short: "ANNEX 1961", f: "fV", s: "sV", geos: ["switch", "long", "flight"] },
];
const NAMES = ["PROF. IMPACT", "PROF. QUORUM", "DR. BORD", "EMERITUS", "VACANT", "ADJUNCT", "DR. VALU (SOON)", "SABBATICAL", "DEAN-ISH"];

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
// the reminder landing (fog surge): clearly above anyone's threshold
const C_SURGE = 0.25;

/* ---------------- the staircase: 1-down until the first miss, then 2-down-1-up ---------------- */
const REVERSALS = 5, MAX_TRIALS = 36;   // the run also ends after 36 counted landings, whatever the reversals
const makeST = () => ({
  logc: Math.log10(0.10), step: 0.25, run: 0, dir: 0, phase: "fast", reversals: [], trials: [], reminders: [],
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
  get done() { return this.reversals.length >= REVERSALS || this.trials.length >= MAX_TRIALS; },
  get threshold() { const r = this.reversals.length >= 2 ? this.reversals.slice(-4) : [this.logc]; return Math.pow(10, r.reduce((a, b) => a + b, 0) / r.length); },
});

const GAP_MAX = 8;
// the time Preston gives you on a landing depends on how far back he is
const hesitateMs = (gap) => 2000 + 250 * Math.max(1, Math.min(GAP_MAX, gap));
const DEATH = "Preston catches you on the landing. His earbuds are glowing. \"Nell! Let's grab coffee. Actually, let's grab synergy.\"\n\nYou have been added to his network.";
const EV_TYPES = ["hand", "hood", "jam", "notebook", "surge", "vent", "flicker", "detour", "breather"];
const CSS = `
.fogmini { position: absolute; inset: 0; background: #000; }
.fogmini .fogactor { pointer-events: none; }
.fogmini .fogactor[data-pose="0"] .ap1, .fogmini .fogactor[data-pose="0"] .ap2,
.fogmini .fogactor[data-pose="1"] .ap0, .fogmini .fogactor[data-pose="1"] .ap2,
.fogmini .fogactor[data-pose="2"] .ap0, .fogmini .fogactor[data-pose="2"] .ap1 { display: none; }
.fogmini .fogquip { position: absolute; left: 3%; top: 3%; max-width: 70%; font-size: 2.1cqw; line-height: 1.15; text-transform: uppercase;
  background: #000; padding: .5cqw .9cqw; opacity: 0; transition: opacity .2s; pointer-events: none; z-index: 5; }
.fogmini .fogquip.show { opacity: 1; }
.fogmini .fogquip .qwho { display: inline-block; color: #000; font-weight: 600; letter-spacing: .06em; padding: 0 .5cqw; line-height: 1.35;
  font-size: 1.3cqw; margin: 0 .4cqw 0 0; vertical-align: .2cqw; }
.fogmini .fogintro { position: absolute; inset: 0; background: #000; z-index: 8; display: none; cursor: pointer; }
.fogmini .fogintro.show { display: block; }
.fogmini .fogintro .lines { position: absolute; left: 12%; right: 12%; top: 40%; font-size: 2.2cqw; line-height: 1.25; text-transform: uppercase; color: var(--W); }
.fogmini .fogintro .lines p { margin: 0 0 1.1cqw; }
.fogmini .fogintro .g { color: var(--G); } .fogmini .fogintro .m { color: var(--M); } .fogmini .fogintro .a { color: var(--A); } .fogmini .fogintro .r { color: var(--R); }
`;
function injectStyle(id, css) { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); }
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
// sound (game/js/sfx.js, when it's loaded): footsteps per zone surface
const sfx = (n, o) => { if (window.SFX) window.SFX.play(n, o); };
const STEP_ROOM = ["lab", "hall", "server", "tunnels", "chamber"];

export function stairwell(el, opts = {}) {
  const { score = () => {}, chip: chipText = "ACT IV   STAIRWELL B" } = opts;
  const ownDie = typeof opts.die !== "function";
  injectStyle("mg-stairwell", CSS);
  el.innerHTML = `<div class="fogmini"><svg class="t" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"></svg>
    <div class="fogquip"></div>
    <div class="fogintro show"><svg class="t" viewBox="0 0 640 360">${segC("THE FOG", 320, 40, 44, "sW", 2.2) + chip(chipText, 320 - (segW(chipText, 6.5) + 6.5 * .9) / 2, 104, 6.5, "fV")}</svg>
      <div class="lines">
        <p class="r">Preston is one flight behind you. The NRT has filled the stairwell with fog. Five floors down to B3.</p>
        <p class="a">On every landing, one door is marked with a faint circle inside a circle. That's the way down. The other goes back up.</p>
        <p class="g">Pick it: ← / → or click. Can't see it? Guess: a guess is data. Hesitate and he gains on you. When something else happens, do what the bottom left of the screen says.</p>
        <p class="m">Screen bright, room dim. A minute or two. Click to run.</p>
      </div></div></div>`;
  el.classList.add("show");
  const svg = el.querySelector(".fogmini > svg"), quipEl = el.querySelector(".fogquip"), introEl = el.querySelector(".fogintro");
  const ST = makeST();
  // without a die() from the game, the old caught card stands in for the death screen
  let pendingRevise = null;
  const die = ownDie ? () => new Promise(r => { pendingRevise = r; }) : opts.die;
  const reviseNow = () => { if (ownDie && pendingRevise) { const r = pendingRevise; pendingRevise = null; r(); } };
  return new Promise(resolve => {
    /* ---------------- state ---------------- */
    const S = { landing: 0, target: "L", phase: "intro", nell: { x: 60, y: UP_Y, dir: 1, pose: 0, s: NELL_S }, open: null, dash: null,
      gap: 6, streak: 0, missRun: 0, best: 0, score: 0, caught: 0, pop: null, t0: 0, arrived: 0, wisps: [], said: {},
      // scenery and pacing
      zone: 0, zoneLandings: 0, geoI: 0, geo: GEOS.flight, names: ["PROF. IMPACT", "PROF. QUORUM"], tick: 0, card: null,
      // events
      ev: null, onEv: null, evCancel: null, evAt: 2 + Math.floor(Math.random() * 2), lastGapN: 0, lastEv: null, bag: [], evQueue: [],
      events: [], surge: false, surgeDone: null, dark: false, gapFx: null, notes: null };

    /* ---------------- scenery: zones, walls, stairs ---------------- */
    function stairPath(g) {
      let d = `M0,${g.top} L${g.x0},${g.top}`;
      for (let i = 0; i < g.n; i++) { const x = g.x0 + i * g.sx, y = g.top + i * g.sy; d += ` L${x},${y + g.sy} L${x + g.sx},${y + g.sy}`; }
      return d + ` L640,${FLOOR}`;
    }
    // the flight above, coming down right-to-left behind the front flight onto the mid landing
    function backFlight(g) {
      const b = g.back, bsx = (b.x1 - b.x2) / b.n, bsy = (g.top - b.y1) / b.n;
      let d = `M338,${b.y1} L${b.x1},${b.y1}`;
      for (let i = 0; i < b.n; i++) { const x = b.x1 - i * bsx, y = b.y1 + i * bsy; d += ` L${x},${y + bsy} L${x - bsx},${y + bsy}`; }
      let s = `<path class="k sM" d="${d} L${b.x2 + 14},${g.top + 14} L338,${b.y1 + 14} Z"/>`;
      for (let i = 1; i <= b.n; i++) { const p = backPt(g, i); s += `<path class="hl sD" d="M${p.x + 3},${p.y + 3} L${p.x + bsx - 3},${p.y + 3}"/>`; }
      // its rail, and the newel at the turn
      s += `<path class="hl sM" d="M338,${b.y1 - 32} L${b.x1 - 4},${b.y1 - 32} L${b.x2 - 4},${g.top - 32}"/>`;
      for (let i = 0; i <= b.n; i += 2) { const p = backPt(g, i); s += `<path class="hl sD" d="M${p.x - 4},${p.y} L${p.x - 4},${p.y - 32}"/>`; }
      return s;
    }
    function wall(z) {
      let s = "";
      if (z === 0) {   // painted block and a chair rail
        for (let y = 24; y < FLOOR; y += 22) s += `<path class="hl sD" d="M0,${y} L640,${y}"/>`;
        for (let y = 24, row = 0; y < FLOOR; y += 22, row++) for (let x = (row % 2) * 30; x < 640; x += 60) s += `<path class="hl sD" d="M${x},${y} L${x},${y + 22}"/>`;
      } else if (z === 1) {   // atrium side: smooth plaster, tall panel joints, a picture rail
        for (let x = 40; x < 640; x += 120) s += `<path class="hl sD" d="M${x},0 L${x},${FLOOR}"/>`;
        s += `<path class="hl sD" d="M0,96 L640,96"/>`;
      } else if (z === 2) {   // MRI suite: RF-shielded panels, seams and rivet dots
        for (let x = 0; x < 640; x += 80) s += `<path class="hl sD" d="M${x},0 L${x},${FLOOR}"/>`;
        for (const y of [64, 176]) s += `<path class="hl sD" d="M0,${y} L640,${y}"/>`;
        for (let x = 0; x < 640; x += 80) for (const y of [64, 176]) s += `<circle class="hl sD" cx="${x}" cy="${y}" r="1.4"/>`;
      } else if (z === 3) {   // tunnels: board-formed concrete, form-tie holes, cracks
        for (let y = 30; y < FLOOR; y += 48) s += `<path class="hl sD" d="M0,${y} L640,${y}"/>`;
        for (let y = 54; y < FLOOR; y += 48) for (let x = 20; x < 640; x += 80) s += `<circle class="hl sD" cx="${x}" cy="${y}" r="1.6"/>`;
        s += `<path class="hl sD" d="M300,30 L292,52 L298,64 L288,88 M20,200 L36,214 L34,232"/>`;
      } else {   // B3: small old brick
        for (let y = 12; y < FLOOR; y += 11) s += `<path class="hl sD" d="M0,${y} L640,${y}"/>`;
        for (let y = 12, row = 0; y < FLOOR; y += 11, row++) for (let x = (row % 2) * 15; x < 640; x += 30) s += `<path class="hl sD" d="M${x},${y} L${x},${y + 11}"/>`;
      }
      return s;
    }
    // the big painted floor number (the stencil on every stairwell wall) and the zone's name under it
    function floorMark(z) {
      const Z = ZONES[z];
      return seg(Z.fl, 352, 10, 40, "sW", 2.4) + seg(Z.name, 352, 58, 4, Z.s, .8);
    }
    // the zone's door frames: always outside the panel (the panel itself is the stimulus)
    function frame(k, z) {
      const d = DOORS[k], x0 = d.x, x1 = d.x + d.w, t = DOOR_TOP, cx = x0 + d.w / 2;
      const box = (o, cls) => `<path class="${cls}" d="M${x0 - o},${FLOOR} L${x0 - o},${t - o} L${x1 + o},${t - o} L${x1 + o},${FLOOR}"/>`;
      let s = box(4, "sW");
      if (z === 0) {   // wooden architrave, head casing, a nameplate
        s += box(9, "hl sA") + `<path class="sA" d="M${x0 - 13},${t - 13} L${x1 + 13},${t - 13}"/>`;
        const nm = S.names[k === "L" ? 0 : 1], w = segW(nm, 3.6) + 8;
        s += `<rect class="k sA" x="${cx - w / 2}" y="${t - 30}" width="${w}" height="11"/>` + segC(nm, cx, t - 26.6, 3.6, "sW", .7);
      } else if (z === 1) {   // aluminium storefront frame with a glass transom
        s += box(8, "hl sB") + `<rect class="hl sB" x="${x0 - 8}" y="${t - 30}" width="${d.w + 16}" height="18"/><path class="hl sB" d="M${cx},${t - 30} L${cx},${t - 12} M${x0 - 2},${t - 26} L${x0 + 8},${t - 16}"/>`;
      } else if (z === 2) {   // RF-shielded: a copper frame with finger-stock
        s += box(10, "sA");
        for (let y = t - 6; y < FLOOR; y += 8) s += `<path class="hl sA" d="M${x0 - 10},${y} L${x0 - 5},${y + 3} M${x1 + 10},${y} L${x1 + 5},${y + 3}"/>`;
        for (let x = x0 - 4; x < x1 + 6; x += 8) s += `<path class="hl sA" d="M${x},${t - 10} L${x + 3},${t - 5}"/>`;
      } else if (z === 3) {   // riveted steel
        s += box(9, "sM");
        for (let y = t; y < FLOOR; y += 16) s += `<circle class="hl sM" cx="${x0 - 6.5}" cy="${y}" r="1.1"/><circle class="hl sM" cx="${x1 + 6.5}" cy="${y}" r="1.1"/>`;
        for (let x = x0; x <= x1; x += 16) s += `<circle class="hl sM" cx="${x}" cy="${t - 6.5}" r="1.1"/>`;
      } else {   // old wood in a brick arch
        s += box(7, "hl sA");
        const r = d.w / 2 + 14, cy = t - 4;
        s += `<path class="sR" d="M${cx - r},${cy} A${r},${r * .42} 0 0 1 ${cx + r},${cy}"/>`;
        for (let i = 0; i <= 10; i++) { const a = Math.PI * (1 - i / 10), c = Math.cos(a), sn = Math.sin(a);
          s += `<path class="hl sR" d="M${cx + (r - 11) * c},${cy - (r - 11) * .42 * sn} L${cx + r * c},${cy - r * .42 * sn}"/>`; }
      }
      return s;
    }
    // the zone's signage in the top band (x 410…636, y 4…84) and the strip right of the doors (x 588…640)
    function zoneDecor(z) {
      let s = "";
      if (z === 0) {
        // wall clock, a sign, the fire extinguisher
        s += `<circle class="k sW" cx="436" cy="36" r="15"/><path class="sW" d="M436,36 L436,26 M436,36 L443,40"/>`;
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; s += `<path class="hl sM" d="M${436 + Math.cos(a) * 12},${36 + Math.sin(a) * 12} L${436 + Math.cos(a) * 14},${36 + Math.sin(a) * 14}"/>`; }
        s += seg("QUIET PLEASE", 470, 24, 6, "sM", 1) + seg("FACULTY THINKING", 470, 36, 4, "sD", .8) + seg("OFFICE HOURS: BY APPT", 470, 46, 4, "sD", .8);
        s += seg("FIRE", 598, 160, 5, "sR", 1);
        s += `<path class="sM" d="M602,178 L622,178"/><path class="k sR" d="M603,186 C603,180 619,180 619,186 L619,236 L603,236 Z"/>
          <path class="sW" d="M607,182 L607,176 L615,176 L615,182 M615,177 L625,182 L626,200"/><path class="hl sR" d="M606,200 L616,200 M606,204 L616,204"/>
          <rect class="k sW" x="606" y="210" width="10" height="12"/>`;
      } else if (z === 1) {
        // RISING STARS: six heads, Preston's twice the size and hung slightly higher
        s += `<rect class="k sW" x="474" y="4" width="112" height="78"/>` + seg("RISING STARS", 480, 9, 5, "sA", .9);
        const head = (x, y, k, hair) => `<path class="sK" d="M${x - 6 * k},${y} C${x - 6 * k},${y + 7 * k} ${x + 6 * k},${y + 7 * k} ${x + 6 * k},${y}"/><path class="${hair}" d="M${x - 7 * k},${y + 1} C${x - 7 * k},${y - 9 * k} ${x + 7 * k},${y - 9 * k} ${x + 7 * k},${y + 1}"/>`;
        [[488, 36], [512, 36], [488, 62], [512, 62], [536, 64]].forEach(([x, y]) => s += `<rect class="hl sM" x="${x - 10}" y="${y - 14}" width="20" height="22"/>` + head(x, y, .9, "hl sM"));
        s += `<rect class="sA" x="530" y="18" width="48" height="40"/>` + head(554, 40, 1.9, "sA") + `<circle class="fG" cx="541" cy="40" r="1.4"/><circle class="fG" cx="567" cy="40" r="1.4"/>`;
        s += seg("147,794", 538, 60, 3.4, "sA", .7);
        s += seg("ATRIUM", 414, 24, 6, "sB", 1) + `<path class="sB" d="M414,38 L448,38 M442,33 L448,38 L442,43"/>`;
        // EXIT, pointing up. Toward Preston.
        s += chip("EXIT", 596, 144, 5, "fX") + `<path class="sX" d="M608,174 L608,158 M603,163 L608,158 L613,163"/>`;
      } else if (z === 2) {
        s += chip("ZONE III", 414, 8, 4.4, "fA") + chip("ZONE IV", 460, 8, 4.4, "fR");
        // cryogen lines: two lagged pipes along the top band, frosted, then down the far wall
        for (const y of [30, 42]) s += `<path class="sB" d="M410,${y} L624,${y} Q632,${y} 632,${y + 8} L632,${FLOOR}" transform="translate(${y === 42 ? -8 : 0},0)"/>`;
        for (let x = 420; x < 600; x += 26) s += star4(x, 36, 2.6, "hl sW");
        s += `<rect class="k sB" x="560" y="26" width="10" height="20"/>` + seg("LHE", 596, 52, 4, "sB", .8) + seg("QUENCH", 586, 62, 3.4, "sM", .7);
        s += chip("THE MAGNET IS ALWAYS ON", 414, 66, 4.2, "fR");
      } else if (z === 3) {
        // steam mains with brackets and flanges, a gauge, a valve wheel, a drip
        for (const [y, r] of [[14, 4], [30, 5], [48, 3]]) {
          s += `<path class="sB" d="M410,${y - r} L640,${y - r} M410,${y + r} L640,${y + r}"/>`;
          for (let x = 440; x < 640; x += 64) s += `<path class="hl sB" d="M${x},${y - r - 2} L${x},${y + r + 2} M${x + 4},${y - r - 2} L${x + 4},${y + r + 2}"/>`;
        }
        s += `<path class="hl sM" d="M470,4 L470,${48 + 5} M600,4 L600,${48 + 5}"/>`;
        s += chip("STEAM. DO NOT TOUCH.", 414, 62, 4.4, "fA");
        s += `<circle class="k sR" cx="612" cy="166" r="13"/><circle class="hl sR" cx="612" cy="166" r="3"/><path class="hl sR" d="M612,153 L612,179 M599,166 L625,166 M603,157 L621,175 M621,157 L603,175"/>`;
        s += `<path class="sB" d="M612,56 L612,152"/>`;
        // the drip, three poses
        const dy = [70, 120, 180][S.tick % 3];
        s += `<path class="sB" d="M630,${dy} C628,${dy + 4} 632,${dy + 4} 630,${dy}"/><path class="hl sB" d="M630,53 L630,58"/>`;
      } else {
        // old enamel sign, a fallout shelter sign, DARK ADAPTATION
        s += `<rect class="k sW" x="412" y="8" width="176" height="40"/><rect class="hl sW" x="415" y="11" width="170" height="34"/>`;
        s += segC("PSYCHOPHYSICS ANNEX", 500, 16, 6.4, "sW", 1.1) + segC("FECHNER HALL   EST. 1961", 500, 30, 4.2, "sM", .8);
        s += `<rect class="k sA" x="592" y="140" width="40" height="44"/><circle class="sA" cx="612" cy="157" r="10"/>`;
        for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 3, p = (r, da) => [612 + Math.cos(a + da) * r, 157 + Math.sin(a + da) * r];
          const [ax, ay] = p(2.5, 0), [bx, by] = p(9, -.42), [cx, cy] = p(9, .42); s += `<path class="k sA" d="M${ax},${ay} L${bx},${by} L${cx},${cy} Z"/>`; }
        s += segC("FALLOUT", 612, 170, 3.2, "sA", .7) + segC("SHELTER", 612, 176, 3.2, "sA", .7);
        s += seg("DARK ROOM", 414, 58, 5, "sR", 1) + seg("ADAPT 30 MIN BEFORE ENTRY", 414, 68, 3.6, "sM", .7);
      }
      return s;
    }
    // one wall item for the zone, in the slot the stair geometry leaves free
    function slotItem(z, g) {
      if (!g.slot) return "";
      const [x, y] = g.slot;
      if (z === 0) {   // corkboard
        return `<rect class="k sA" x="${x}" y="${y}" width="84" height="54"/>
          <rect class="hl sW" x="${x + 6}" y="${y + 6}" width="26" height="30" transform="rotate(-4 ${x + 19} ${y + 21})"/>${seg("TENURE", x + 8, y + 10, 3.4, "sW", .6)}${seg("PARTY", x + 8, y + 16, 3.4, "sW", .6)}<path class="hl sR" d="M${x + 7},${y + 30} L${x + 30},${y + 17}"/>
          <rect class="hl sW" x="${x + 38}" y="${y + 5}" width="38" height="22"/>${seg("LOST RAT", x + 41, y + 9, 3.4, "sK", .6)}${seg("ANSWERS TO", x + 41, y + 15, 2.6, "sM", .5)}${seg("PAL", x + 41, y + 20, 2.6, "sM", .5)}
          <rect class="hl sW" x="${x + 40}" y="${y + 31}" width="34" height="18"/>${seg("PIZZA 4PM", x + 42, y + 35, 3, "sA", .6)}
          <circle class="fR" cx="${x + 19}" cy="${y + 7}" r="1.3"/><circle class="fG" cx="${x + 57}" cy="${y + 6}" r="1.3"/><circle class="fA" cx="${x + 57}" cy="${y + 32}" r="1.3"/>`;
      }
      if (z === 1) {   // the building directory
        let s = `<rect class="k sW" x="${x}" y="${y}" width="70" height="52"/>` + seg("DIRECTORY", x + 5, y + 5, 4, "sB", .8);
        ["4F IRIS (EMER.)", "3F IMPACT", "2F FACULTY", "1F ATRIUM", "B1 MRI", "B2 TUNNELS", "B3 ---"].forEach((t, i) => s += seg(t, x + 5, y + 13 + i * 5.4, 3, i === 6 ? "sR" : "sM", .55));
        return s;
      }
      if (z === 2) {   // the magnet warning, with a horseshoe
        return `<path class="sR" d="M${x + 10},${y + 4} L${x + 10},${y + 22} C${x + 10},${y + 36} ${x + 34},${y + 36} ${x + 34},${y + 22} L${x + 34},${y + 4} M${x + 18},${y + 4} L${x + 18},${y + 22} C${x + 18},${y + 28} ${x + 26},${y + 28} ${x + 26},${y + 22} L${x + 26},${y + 4}"/>
          <path class="hl sR" d="M${x + 6},${y + 4} L${x + 22},${y + 4} M${x + 22},${y + 4} L${x + 38},${y + 4}"/>${arcs(x + 40, y + 20, 1, "hl sR", 2, .6)}
          ${seg("STRONG", x + 2, y + 42, 4, "sR", .8)}${seg("MAGNETIC FIELD", x + 2, y + 49, 3, "sM", .6)}`;
      }
      if (z === 3) {   // a pressure gauge on a riser
        return `<path class="sB" d="M${x + 30},${y} L${x + 30},${y + 20} M${x + 36},${y} L${x + 36},${y + 20}"/><circle class="k sW" cx="${x + 33}" cy="${y + 34}" r="14"/>
          <path class="sR" d="M${x + 33},${y + 34} L${x + 43},${y + 27}"/><path class="hl sM" d="M${x + 22},${y + 41} A12,12 0 1 1 ${x + 44},${y + 41}"/><path class="hl sR" d="M${x + 40},${y + 25} A12,12 0 0 1 ${x + 44},${y + 41}"/>
          ${seg("PSI", x + 28, y + 38, 3, "sM", .6)}${seg("STEAM MAIN 7", x, y + 52, 3.6, "sB", .7)}`;
      }
      // B3: the insignia, scratched into the brick, and a tally
      return `<circle class="hl sV" cx="${x + 30}" cy="${y + 26}" r="17"/><circle class="hl sV" cx="${x + 30}" cy="${y + 26}" r="7"/>
        <path class="hl sV" d="M${x + 11},${y + 20} L${x + 15},${y + 22} M${x + 46},${y + 31} L${x + 51},${y + 30} M${x + 27},${y + 6} L${x + 29},${y + 10} M${x + 33},${y + 44} L${x + 31},${y + 48}"/>
        ${seg("1974", x + 14, y + 50, 6, "hl sV", .75)}<path class="hl sM" d="M${x + 58},${y + 8} L${x + 58},${y + 22} M${x + 62},${y + 8} L${x + 62},${y + 22} M${x + 66},${y + 8} L${x + 66},${y + 22} M${x + 70},${y + 8} L${x + 70},${y + 22} M${x + 55},${y + 18} L${x + 73},${y + 12}"/>`;
    }
    // the atrium window over the flight: mullions, the far balcony rails, the hanging banner
    function atriumWindow() {
      const x = 176, y = 6, w = 120, h = 58;
      let s = `<rect class="k sB" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
      for (const yy of [y + 22, y + 44]) s += `<path class="hl sD" d="M${x},${yy} L${x + w},${yy}"/>`;
      for (let xx = x + 6; xx < x + w; xx += 9) s += `<path class="hl sD" d="M${xx},${y + 22} L${xx},${y + 16} M${xx},${y + 44} L${xx},${y + 38}"/>`;
      s += `<path class="hl sV" d="M${x + 70},${y} L${x + 70},${y + 6} M${x + 98},${y} L${x + 98},${y + 6}"/><rect class="hl sV" x="${x + 68}" y="${y + 6}" width="32" height="40"/>`;
      s += seg("FECHNER", x + 72, y + 12, 3.4, "sV", .6) + seg("HALL", x + 76, y + 19, 3.4, "sV", .6) + `<circle class="hl sV" cx="${x + 84}" cy="${y + 34}" r="6"/><circle class="hl sV" cx="${x + 84}" cy="${y + 34}" r="2.4"/>`;
      s += `<path class="sB" d="M${x + w / 2},${y} L${x + w / 2},${y + h} M${x},${y + h / 2} L${x + 4},${y + h / 2} M${x + w - 4},${y + h / 2} L${x + w},${y + h / 2}"/>`;
      s += `<path class="hl sW" d="M${x + 8},${y + 8} L${x + 16},${y + 2} M${x + 8},${y + 16} L${x + 26},${y + 3}"/>`;
      return s;
    }
    function floorDetail(z) {
      if (z === 2) return `<path class="hl dash sR" d="M340,264 L640,264"/>` + seg("5 GAUSS LINE", 560, 268, 3.6, "sR", .7);
      if (z === 3) return `<path class="hl sB" d="M596,254 C604,251 612,257 620,254 S636,251 640,254 M604,260 C610,258 616,262 622,260"/>`;
      return "";
    }
    function scenery() {
      const g = S.geo, z = S.zone;
      let s = wall(z);
      if (g.window) s += atriumWindow();
      s += slotItem(z, g);
      if (g.back) s += backFlight(g);
      s += `<path class="k sW" d="${stairPath(g)} L640,290 L0,290 Z"/>`;
      for (let i = 0; i < g.n; i++) { const x = g.x0 + i * g.sx, y = g.top + i * g.sy; s += `<path class="hl sM" d="M${x + 3},${y + g.sy + 4} L${x + g.sx - 3},${y + g.sy + 4}"/>`; }
      s += `<path class="sM" d="M0,${g.top - 40} L${g.x0 + 6},${g.top - 40} L${xEnd(g) + 6},${FLOOR - 40} L640,${FLOOR - 40}"/>`;
      for (let i = 0; i <= g.n; i += 2) { const x = g.x0 + i * g.sx + 6, y = g.top + i * g.sy; s += `<path class="hl sM" d="M${x},${y} L${x},${y - 40}"/>`; }
      for (const x of [40, 100, 600]) { if (x < 300 && x > g.x0) continue; const y = x < 300 ? g.top : FLOOR; s += `<path class="hl sM" d="M${x},${y} L${x},${y - 40}"/>`; }
      if (g.entry === "door") s += `<path class="sW" d="M28,${g.top} L28,6 L92,6 L92,${g.top}"/>`;
      s += floorDetail(z) + floorMark(z) + zoneDecor(z);
      for (const k of ["L", "R"]) s += frame(k, z);
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
      const n = S.nell, s = n.s || NELL_S;
      let dash = "";
      if (S.dash) { const [x0, y0, x1, y1] = S.dash; for (const o of [-46, -30, -14].map(v => v * s / NELL_S)) dash += `<path class="hl sW" d="M${x0 + (x1 - x0) * .2},${y0 + (y1 - y0) * .2 + o} L${x0 + (x1 - x0) * .7},${y0 + (y1 - y0) * .7 + o}"/>`; }
      // ducking is its own pose: knees bent (drawn squat), head down
      const sy = n.duck ? s * 0.72 : s;
      return dash + `<g class="fogactor" data-pose="${n.pose}" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)}) scale(${n.dir * s},${sy}) translate(-160,-187)">${nellFigure()}</g>`
        + (n.duck ? `<path class="hl sW" d="M${n.x - 22},${n.y - 70} L${n.x - 8},${n.y - 70} M${n.x + 8},${n.y - 70} L${n.x + 22},${n.y - 70}"/>` : "");
    }
    // where Preston stands on the flight for distance i (1 = just in view … GAP_MAX-1 = right behind her)
    function prestonAt(i) {
      const g = S.geo;
      if (g.back) {
        const seq = [[backPt(g, 0), .8], [backPt(g, 2), .82], [backPt(g, 4), .86], [{ x: 70, y: g.top }, 1], [tread(g, 1), 1], [tread(g, 3), 1], [tread(g, 4), 1]];
        const [p, k] = seq[Math.max(0, Math.min(seq.length - 1, i - 1))];
        return { x: p.x + 2, y: p.y, k };
      }
      if (i <= 1) return { x: g.x0 - 19, y: g.top, k: 1 };
      const kk = Math.round((i - 1) * (g.n - 2) / (GAP_MAX - 2));
      return { x: g.x0 + kk * g.sx + 1.8, y: g.top + kk * g.sy, k: 1 };
    }
    // Preston on the flight above: closer as the gap shrinks
    function prestonSVG(st) {
      const i = GAP_MAX - Math.max(0, Math.min(GAP_MAX, S.gap));
      if (i <= 0) return "";
      const p = prestonAt(i);
      const glow = `<circle class="fG" cx="-9" cy="-48" r="1.9"/><circle class="fG" cx="9" cy="-48" r="1.9"/>${arcs(14, -48, 1, "sG", 2, 0.7)}${arcs(-14, -48, -1, "sG", 2, 0.7)}`;
      if (S.dark) return `<g transform="translate(${p.x},${p.y}) scale(${p.k})">${glow}</g>`;
      const busy = S.ev && S.ev.type === "breather" ? `<rect class="k sW" x="10" y="-52" width="6" height="10"/><path class="hl sW" d="M20,-56 L24,-60 M21,-50 L26,-50"/>${segC(S.tick % 2 ? "..." : "..", 0, -72, 5, "sR", .9)}` : "";
      // he's in the fog like everything else; only his lit earbuds cut through it
      return `<g transform="translate(${p.x},${p.y}) scale(${p.k})">
        <g opacity="${st.lineOp.toFixed(3)}"><path class="sR" d="M-14,0 L-12,-34 C-12,-42 12,-42 12,-34 L14,0 M-5,-40 L0,-30 L5,-40"/>
          <path class="sK" d="M-8,-50 C-8,-41 8,-41 8,-50"/><path class="k sA" d="M-9,-50 C-10,-62 10,-62 9,-50 C5,-55 -5,-55 -9,-50 Z"/>${busy}</g>
        ${glow}</g>`;
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
        return z + segC(S.open.label || (S.open.correct ? "DOWN" : "UP"), d.x + d.w / 2, DOOR_TOP + 10, 6, S.open.correct ? "sG" : "sR", 1.1);
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
      const hint = S.phase === "event" && S.ev && S.ev.hint ? S.ev.hint : ["LEFT / RIGHT", "OR CLICK A DOOR"];
      s += seg(hint[0], 12, 320, 4.2, "sW", .8) + seg(hint[1], 12, 331, 4.2, "sM", .8);
      s += seg("LANDING", 138, 300, 4.2, "sB", .8) + seg(String(Math.max(0, S.landing)).padStart(2, "0"), 138, 308, 20, "sB", 1.4);
      s += seg("FOG", 196, 300, 4.2, "sW", .8) + seg(String(Math.round(st.f * 99)).padStart(2, "0"), 196, 308, 20, "sW", 1.4);
      s += seg("SCORE", 254, 300, 4.2, "sA", .8) + seg(pts(S.score), 254, 308, 20, "sA", 1.4);
      s += seg("STREAK", 350, 300, 4.2, "sG", .8) + seg("X" + S.streak, 350, 308, 20, "sG", 1.4);
      // Preston meter: lit cells are the distance you have left; it blinks and shows the change after an event
      const fx = S.gapFx && Date.now() - S.gapFx.t < 1400 ? S.gapFx : null;
      s += seg("PRESTON", 414, 300, 4.2, "sR", .8);
      for (let i = 0; i < GAP_MAX; i++) {
        const lit = i < S.gap, changed = fx && (fx.d > 0 ? i >= S.gap - fx.d && i < S.gap : i >= S.gap && i < S.gap - fx.d);
        const blink = changed && Math.floor((Date.now() - fx.t) / 180) % 2;
        s += `<rect class="${lit && !blink ? "fG" : blink ? "hl sW" : "hl sR"}" x="${414 + i * 12}" y="310" width="9" height="16"/>`;
      }
      if (fx) s += chip((fx.d > 0 ? "+" : "") + fx.d, 414 + GAP_MAX * 12 + 2, 312, 5, fx.d > 0 ? "fG" : "fR");
      s += seg(`REVERSALS ${ST.reversals.length}/${REVERSALS}`, 414, 334, 4.2, "sM", .8);
      const Z = ZONES[S.zone];
      s += chip(`${Z.fl} ${Z.short}`, 532, 300, 5.5, Z.f) + seg("THE FOG", 532, 322, 7, "sW", 1.1) + seg(clock(), 532, 336, 6, "sM", 1);
      return s;
    }
    const clock = () => { const t = S.t0 ? Math.floor((Date.now() - S.t0) / 1000) : 0; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
    const curC = () => S.surge ? C_SURGE : ST.c;
    function draw() {
      if (S.closed) return;
      const st = stimulus(curC());
      if (S.phase === "card" && S.card) { svg.innerHTML = cardSVG(st) + hud(st); return; }
      if (S.dark) { svg.innerHTML = darkSVG(st) + hud(st); return; }
      let s = `<rect x="0" y="0" width="640" height="290" fill="${css(st.bg)}"/>`;
      s += `<g opacity="${st.lineOp.toFixed(3)}">${scenery()}</g>`;
      s += doorPanel("L", st) + doorPanel("R", st);
      s += `<g opacity="${st.lineOp.toFixed(2)}">${segC(ZONES[S.zone].fl + "-" + String(Math.max(0, S.landing)).padStart(2, "0"), 472, 94, 6, "sW", 1)}</g>`;
      const wc = rgbFor(Math.min(0.9, st.bg.y * 1.5 + 0.01));
      s += S.wisps.map(w => `<path d="${wisp(w.x, w.y, w.w)}" stroke="${css(wc)}" stroke-width=".75" fill="none" opacity=".55"/>`).join("");
      s += evUnder(st);
      s += prestonSVG(st) + nellSVG();
      s += evOver(st);
      if (S.pop) s += segC(S.pop.t, S.pop.x, S.pop.y, 9, S.pop.cls, 1.4);
      if (S.gap <= 2 && S.gap > 0 && (S.phase === "choose" || S.phase === "event")) {   // the warning before a catch
        const w = S.gap === 1 ? "HE'S RIGHT BEHIND YOU" : "HE'S CLOSE", sub = S.phase === "choose" ? "PICK A DOOR. ANY DOOR." : "";
        s += chip(w, 472 - chipW(w, 6) / 2, 270, 6, S.tick % 2 ? "fR" : "fA");
        if (sub && S.tick % 2) s += segC(sub, 160, 274, 4.6, "sR", .9);
      }
      s += hud(st);
      if (S.phase === "caught" && ownDie) s += caughtCard();
      if (S.phase === "end") s += results();
      svg.innerHTML = s;
    }
    // entering a zone: the floor number, big, over the same fog gray (so the eye stays adapted)
    function cardSVG(st) {
      const Z = ZONES[S.zone], p = S.card.pose;
      let s = `<rect x="0" y="0" width="640" height="290" fill="${css(st.bg)}"/>`;
      s += `<path class="hl sD" d="M120,62 L520,62 M120,226 L520,226"/>`;
      s += segC(Z.fl, 320, 76, 120, p ? "sW" : "hl sW", p ? 3.2 : .75);
      if (p) {
        s += chip(Z.name, 320 - chipW(Z.name, 8) / 2, 34, 8, Z.f);
        s += segC(`STAIRWELL B   LEVEL ${S.zone + 1} OF 5   ${S.zone === 4 ? "ALMOST THERE" : "KEEP GOING"}`, 320, 236, 5, "sW", .9);
        s += `<path class="sW" d="M300,262 L320,276 L340,262"/><path class="hl sW" d="M306,252 L320,262 L334,252"/>`;
      }
      return s;
    }
    // the lights are out: only lit things show (his earbuds, her lenses)
    function darkSVG(st) {
      let s = `<rect x="0" y="0" width="640" height="290" fill="#000"/>`;
      // in the dark he's always somewhere above: two green dots, looking
      if (S.gap >= GAP_MAX) { const p = prestonAt(1); s += `<g transform="translate(${p.x},${p.y}) scale(${p.k})"><circle class="fG" cx="-9" cy="-48" r="1.9"/><circle class="fG" cx="9" cy="-48" r="1.9"/>${arcs(S.tick % 2 ? 14 : -14, -48, S.tick % 2 ? 1 : -1, "sG", 2, 0.7)}</g>`; }
      s += prestonSVG(st);
      const n = S.nell, hx = n.x, hy = n.y - 125 * (n.s || NELL_S);
      s += `<circle class="fW" cx="${hx - 5}" cy="${hy}" r="1"/><circle class="fW" cx="${hx + 6}" cy="${hy}" r="1"/>`;
      s += `<path class="hl sM" d="M462,4 L482,4 L478,14 L466,14 Z"/>`;
      return s;
    }

    /* ---------------- quips ---------------- */
    let quipT;
    function quip(who, text, col) {
      quipEl.innerHTML = `<span class="qwho" style="background:var(--${col})">${who}</span> <span style="color:var(--${col})">${text}</span>`;
      if (window.SFX) for (let i = 0; i < 4; i++) setTimeout(() => window.SFX && !S.closed && window.SFX.voice(who.replace(" (ABOVE)", "").replace("THE ROBE", "HOOD"), true), i * 85);
      quipEl.classList.add("show"); clearTimeout(quipT); quipT = setTimeout(() => quipEl.classList.remove("show"), 2400);
    }
    function once(key, fn) { if (!S.said[key]) { S.said[key] = true; fn(); } }

    /* ---------------- motion: big Game & Watch jumps ---------------- */
    const tick = (ms) => new Promise(r => setTimeout(r, ms));
    async function jumpTo(x, y, ms, s, dir) {
      S.dash = [S.nell.x, S.nell.y, x, y]; S.nell.dir = dir || (x >= S.nell.x ? 1 : -1); S.nell.pose = S.nell.pose === 1 ? 2 : 1;
      S.nell.x = x; S.nell.y = y; if (s) S.nell.s = s; sfx("step", { room: STEP_ROOM[S.zone] }); draw(); await tick(ms);
    }
    // Nell's route down the current geometry: a few big jumps, then the floor and the spot between the doors
    function route() {
      const g = S.geo, r = [];
      if (g.back) {
        r.push({ x: 336, y: g.back.y1, s: .4, dir: -1 }, { x: backPt(g, 3).x, y: backPt(g, 3).y, s: .48, dir: -1 }, { x: 58, y: g.top, s: NELL_S, dir: 1 }, { ...tread(g, 3), s: NELL_S, dir: 1 });
      } else if (g.id === "long") {
        for (const k of [2, 5, 8]) r.push({ ...tread(g, k), s: NELL_S, dir: 1 });
      } else {
        r.push({ x: 60, y: g.top, s: NELL_S, dir: 1 }, { ...tread(g, 2), s: NELL_S, dir: 1 }, { ...tread(g, 5), s: NELL_S, dir: 1 });
      }
      r.push({ x: xEnd(g) + 30, y: FLOOR, s: NELL_S, dir: 1 }, { x: STAND.mid, y: FLOOR, s: NELL_S, dir: 1 });
      return r;
    }
    async function descend() {
      const r = route();
      S.nell = { ...r[0], pose: 1 }; S.dash = null; draw(); await tick(70);
      for (let i = 1; i < r.length; i++) await jumpTo(r[i].x, r[i].y, i === r.length - 1 ? 60 : 75, r[i].s, r[i].dir);
      S.dash = null; S.nell.pose = 0; S.nell.dir = 1; draw();
    }
    async function ascend() {
      const r = route().reverse();
      for (let i = 1; i < r.length; i++) await jumpTo(r[i].x, r[i].y, 80, r[i].s, -r[i].dir);
      S.dash = null;
    }
    // a new landing: pick the zone's next stair geometry and the names on the doors
    function newLanding() {
      const Z = ZONES[S.zone];
      S.geo = GEOS[Z.geos[S.geoI++ % Z.geos.length]];
      const a = pick(NAMES); let b = pick(NAMES); while (b === a) b = pick(NAMES);
      S.names = [a, b]; S.open = null; S.pop = null; S.ev = null; S.target = null;
      S.zoneLandings++;
    }

    /* ---------------- a trial ---------------- */
    async function trial() {
      newLanding();
      S.target = Math.random() < 0.5 ? "L" : "R"; S.wisps = newWisps(fogOf(curC()));
      S.phase = "walk"; await descend();
      if (S.closed) return;
      S.phase = "choose"; S.arrived = Date.now();
      if (ST.c < 0.02 && !S.surge) once("cantsee", () => quip("MORRIS", "I CAN'T SEE ANYTHING, PAL.", "K"));
    }
    async function choose(side) {
      if (S.phase !== "choose") return;
      S.phase = "resolve";
      const correct = side === S.target, st = stimulus(curC()), rt = Date.now() - S.arrived;
      // the reminder landing (fog surge) is logged on its own and never moves the staircase
      if (S.surge) ST.reminders.push({ c: C_SURGE, actual: st.actual, side, target: S.target, correct, rt, landing: S.landing });
      else ST.trials.push({ c: ST.c, actual: st.actual, side, target: S.target, correct, rt, landing: S.landing });
      await jumpTo(STAND[side], FLOOR, 70); S.dash = null;
      S.open = { side, correct }; S.nell.pose = 0;
      if (correct) sfx("door"); else { sfx("fogSlam"); sfx("bad"); }
      if (S.surge) {
        if (correct) { S.score += 10; gapAdd(+1); S.pop = { t: "+10 EASY ONE", x: STAND[side], y: DOOR_TOP - 26, cls: "sG" }; }
        else { gapAdd(-1); S.pop = { t: "LAPSE", x: STAND[side], y: DOOR_TOP - 26, cls: "sR" }; quip("MORRIS", "PAL. THAT ONE WAS EASY. EYES OPEN.", "K"); }
        draw(); await tick(correct ? 260 : 420);
        S.landing += correct ? 1 : -1;
        svg.innerHTML = `<rect width="640" height="360" fill="#000"/>`; await tick(70);
        const r = S.surgeDone; S.surgeDone = null; S.surge = false; if (r) r();
        return;
      }
      if (correct) {
        S.streak++; S.best = Math.max(S.best, S.streak);
        let gain = Math.round((10 + 90 * st.f) * (1 + 0.25 * Math.min(S.streak - 1, 8)));
        const quick = rt < 1200; if (quick) gain += 15;
        S.score += gain; S.gap = Math.min(GAP_MAX, S.gap + 1);
        S.pop = { t: "+" + gain + (quick ? " QUICK" : ""), x: STAND[side], y: DOOR_TOP - 26, cls: "sG" };
      } else {
        S.streak = 0; S.gap -= 1; S.gapFx = { d: -1, t: Date.now() };
        S.pop = { t: "WRONG WAY", x: STAND[side], y: DOOR_TOP - 26, cls: "sR" };
      }
      S.missRun = correct ? 0 : S.missRun + 1;
      draw(); await tick(correct ? 260 : 420);
      const move = ST.update(correct);
      if (move === -1) sfx("fogHiss");
      S.landing += correct ? 1 : -1;
      if (!correct && S.missRun === 2) quip("MORRIS", "CAN'T SEE IT? JUST GUESS, PAL. EVERY MISS MAKES THE NEXT ONE CLEARER.", "K");
      else if (!correct) once("wrongway", () => quip("MORRIS", "WRONG WAY, PAL. THAT'S UP. THE NEXT MARK WILL BE EASIER.", "K"));
      else if (S.said.cantsee && !S.said.gut) once("gut", () => quip("NELL", "PICK ANYWAY. YOUR GUT'S BETTER THAN YOU THINK.", "G"));
      else if (move === -1 && ST.phase === "main") once("atmos", () => quip("VOICE BELOW", "SHE'S GETTING AWAY. MORE ATMOSPHERE.", "V"));
      else if (S.streak === 5) once("streak5", () => quip("MORRIS", "LOOK AT YOU GO, PAL.", "K"));
      svg.innerHTML = `<rect width="640" height="360" fill="#000"/>`; await tick(70);
      next();
    }

    /* ---------------- the run: zones, events, trials ---------------- */
    // the zone follows progress (landings run and turning points reached); one zone at a time, at least three landings each
    const REVZ = [0, 1, 2, 3, 3, 4, 4];
    async function maybeZone() {
      const target = Math.min(4, Math.max(Math.floor(ST.trials.length / 5), REVZ[ST.reversals.length]));
      if (target > S.zone && S.zoneLandings >= 3) { S.zone++; S.zoneLandings = 0; S.geoI = 0; await zoneCard(); }
    }
    async function zoneCard(ms = 900) {
      S.phase = "card"; S.card = { pose: 0 }; sfx("fogZone", { z: S.zone }); draw(); await tick(260);
      S.card.pose = 1; draw(); await tick(ms);
      S.card = null;
      const lines = [null, ["NELL", "ATRIUM. PEOPLE. NOBODY LOOKS UP FROM THEIR PHONES.", "G"], ["MORRIS", "MRI FLOOR. TAKE YOUR KEYS OUT, PAL. I'M SERIOUS.", "K"],
        ["NELL", "STEAM TUNNELS. THE FOG'S EVEN DAMPER DOWN HERE.", "G"], ["NELL", "1961. NOBODY'S PAINTED THIS SINCE THE SCHISM.", "G"]][S.zone];
      if (lines) quip(...lines);
    }
    function nextEventType() {
      if (S.evQueue.length) return S.evQueue.shift();
      for (let tries = 0; tries < 24; tries++) {
        if (!S.bag.length) { S.bag = shuffle(EV_TYPES.slice()); if (S.bag[0] === S.lastEv) S.bag.push(S.bag.shift()); }
        const t = S.bag.shift();
        // a surge only makes sense when the fog is actually thick
        if (t === "surge" && ST.c > 0.1) { S.bag.push(t); continue; }
        if (t === S.lastEv) { S.bag.push(t); continue; }
        return t;
      }
      return "breather";
    }
    // events come every 2–4 trials; the spacing never repeats twice running
    function scheduleNext() { let k; do { k = 3 + Math.floor(Math.random() * 3); } while (k === S.lastGapN); S.lastGapN = k; S.evAt = ST.trials.length + k; }
    async function next() {
      if (S.closed) return;
      if (S.gap <= 0) { caught(); return; }
      if (ST.done) { await finalRun(); if (!S.closed) finish(); return; }
      await maybeZone();
      if (S.closed) return;
      if (ST.trials.length >= S.evAt) {
        scheduleNext();
        const t = nextEventType(); S.lastEv = t;
        const snap = { logc: ST.logc, n: ST.trials.length, rev: ST.reversals.length, run: ST.run, dir: ST.dir, step: ST.step };
        await runEvent(t);
        if (S.closed) return;
        // events never touch the staircase
        console.assert(snap.logc === ST.logc && snap.n === ST.trials.length && snap.rev === ST.reversals.length && snap.run === ST.run && snap.dir === ST.dir && snap.step === ST.step, "event changed the staircase");
        if (S.gap <= 0) { caught(); return; }
        await maybeZone();
        if (S.closed) return;
      }
      trial();
    }
    // the measurement can converge before B3: then there are no more doors, just stairs
    async function finalRun() {
      if (S.zone >= 4) return;
      quip("NELL", "NO MORE DOORS. JUST STAIRS. GO GO GO.", "G");
      while (S.zone < 4 && !S.closed) { S.zone++; S.geoI = 0; await zoneCard(420); }
    }

    /* ---------------- events: short beats between trials ---------------- */
    function gapAdd(d) { S.gap = Math.min(GAP_MAX, S.gap + d); S.gapFx = { d, t: Date.now() }; }
    // wait for an input the event accepts, or a timeout (resolves null)
    function evWait(ms, accept = () => true) {
      return new Promise(res => {
        let done = false, to = 0;
        const fin = (v) => { if (done) return; done = true; S.onEv = null; S.evCancel = null; clearTimeout(to); res(v); };
        S.onEv = (k) => { if (accept(k)) fin(k); };
        S.evCancel = () => fin(null);
        if (ms) to = setTimeout(() => fin(null), ms);
      });
    }
    function evPop(t, cls, x = STAND.mid, y = DOOR_TOP - 26) { S.pop = { t, x, y, cls }; }
    async function runEvent(type) {
      newLanding();
      S.wisps = newWisps(fogOf(ST.c)); S.phase = "event";
      S.ev = { type, pose: 0, hint: ["", ""] };
      const rec = { type, landing: S.landing, trial: ST.trials.length, gap0: S.gap };
      S.events.push(rec);
      if (type === "surge") { await EV.surge(rec); rec.gap1 = S.gap; return; }
      if (type === "detour") { await EV.detour(rec); rec.gap1 = S.gap; S.ev = null; S.pop = null; return; }
      await descend();
      if (S.closed) return;
      S.ev.live = true;
      await EV[type](rec);
      rec.gap1 = S.gap;
      if (S.closed) return;
      S.landing += 1;
      S.ev = null; S.nell.duck = false;
      svg.innerHTML = `<rect width="640" height="360" fill="#000"/>`; await tick(70);
    }
    const EV = {
      // Preston's hand comes over the rail above. Duck.
      async hand(rec) {
        S.ev.hint = ["DUCK: SPACE, DOWN", "OR CLICK"];
        quip("PRESTON (ABOVE)", "NELL! YOU'VE GOT SOMETHING IN YOUR HAIR!", "R"); sfx("fogGrab"); draw();
        const t0 = Date.now(), WIN = 1700;
        const lunge = setTimeout(() => { if (S.ev && S.ev.type === "hand") { S.ev.pose = 1; sfx("fogWhiff"); draw(); } }, 850);
        const k = await evWait(WIN, () => true);
        if (k) { S.nell.duck = true; S.nell.pose = 0; sfx("select"); draw(); await tick(Math.max(0, WIN - (Date.now() - t0))); }
        clearTimeout(lunge);
        if (S.closed) return;
        rec.ok = !!k;
        if (k) { S.ev.pose = 2; sfx("good"); S.score += 25; evPop("+25 DUCKED", "sG"); draw(); await tick(650); S.nell.duck = false; quip("NELL", "MISSED ME. MISSED MY PENCIL, TOO.", "G"); }
        else { S.ev.pose = 3; sfx("fogCaught"); sfx("spark"); gapAdd(-1); evPop("GRABBED", "sR"); draw(); await tick(650); quip("PRESTON (ABOVE)", "GOT YOUR PENCIL! I'LL RETURN IT AFTER I CITE IT.", "R"); }
        draw(); await tick(350);
      },
      // a robe steps out of one door: go through the other. Not a trial.
      async hood(rec) {
        const b = Math.random() < .5 ? "L" : "R", o = other(b);
        S.ev.side = b; S.ev.hint = [`GO ${o === "L" ? "LEFT" : "RIGHT"}`, "OR CLICK THE OTHER DOOR"];
        sfx("door"); draw(); await tick(240); S.ev.pose = 1; sfx("step", { room: STEP_ROOM[S.zone] }); draw(); await tick(240); S.ev.pose = 2; sfx("step", { room: STEP_ROOM[S.zone] }); draw();
        quip("NELL", "A ROBE. NOPE. OTHER DOOR.", "G");
        rec.tries = 0;
        for (;;) {
          const k = await evWait(hesitateMs(S.gap), (k) => k === "L" || k === "R");
          if (S.closed) return;
          if (k === null) { gapAdd(-1); draw(); if (S.gap <= 0) return; continue; }
          if (k === b) { rec.tries++; S.ev.pose = 3; sfx("bad"); gapAdd(-1); quip("THE ROBE", "THIS DOOR IS FOR MEMBERS.", "V"); draw(); await tick(420); S.ev.pose = 2; draw(); if (S.gap <= 0) return; continue; }
          break;
        }
        await jumpTo(STAND[o], FLOOR, 70); S.dash = null; S.nell.pose = 0;
        S.open = { side: o, correct: true }; sfx("door"); evPop(rec.tries ? "THROUGH" : "+20 SIDESTEP", "sG", STAND[o]); if (!rec.tries) S.score += 20;
        draw(); await tick(380);
      },
      // a jammed fire door: shoulder it open
      async jam(rec) {
        const d = Math.random() < .5 ? "L" : "R";
        S.ev.side = d; S.ev.p = 0; S.ev.hint = ["MASH SPACE", "OR CLICK, FAST"];
        quip("NELL", "FIRE DOOR. JAMMED. OF COURSE IT'S JAMMED.", "G");
        await jumpTo(STAND[d] + (d === "L" ? 26 : -26), FLOOR, 80); S.dash = null; S.nell.pose = 0; S.nell.dir = d === "L" ? -1 : 1; draw();
        const t0 = Date.now(); let lastPen = t0;
        while (S.ev.p < 6 && !S.closed) {
          const k = await evWait(300, (k) => k !== "up");
          if (S.closed) return;
          if (k) { sfx("fogShove"); S.ev.p++; S.ev.pose = S.ev.pose === 1 ? 2 : 1; S.nell.pose = S.ev.pose; S.nell.x += (S.nell.dir) * (S.ev.pose === 1 ? 4 : -4); }
          if (Date.now() - lastPen > 2000) { lastPen = Date.now(); gapAdd(-1); quip("PRESTON (ABOVE)", "NEED A HAND WITH THAT DOOR, NELL?", "R"); if (S.gap <= 0) { draw(); return; } }
          if (Date.now() - t0 > 6000) S.ev.p = 6;   // it gives, eventually
          draw();
        }
        const secs = (Date.now() - t0) / 1000; rec.secs = secs;
        S.ev.pose = 3; sfx("fogBam"); S.open = { side: d, correct: true, label: "BAM" }; S.nell.pose = 1;
        const bonus = Math.max(0, Math.round(60 - secs * 15)); S.score += bonus; evPop(bonus ? `+${bonus} BAM` : "BAM", "sG", STAND[d]);
        draw(); await tick(420);
      },
      // Nell drops her notebook on the stairs. Grab it, or leave it.
      async notebook(rec) {
        const g = S.geo, nb = tread(g, g.n - 2);
        S.ev.hint = ["LEFT: GRAB IT", "RIGHT: LEAVE IT"];
        const path = [[452, 176, 0], [410, 140, 60], [360, 150, 130], [nb.x + 8, nb.y - 4, 200]]; sfx("fogFlap");
        for (const [x, y, a] of path) { S.ev.nb = { x, y, a }; draw(); await tick(110); }
        quip("NELL", "MY NOTEBOOK! FIVE YEARS OF NULLS!", "G");
        S.ev.pose = 1; S.ev.cd = 6; draw();
        let k = null;
        for (let i = 6; i > 0 && !k; i--) { S.ev.cd = i; draw(); k = await evWait(550, (k) => k === "L" || k === "R"); if (S.closed) return; }
        S.ev.pose = 2;
        if (k === "L") {
          rec.choice = "grab"; S.notes = "KEPT";
          await jumpTo(nb.x + 10, nb.y, 110, NELL_S, -1); S.ev.nb = null; S.nell.pose = 0; sfx("pickup"); draw(); await tick(160);
          await jumpTo(STAND.mid, FLOOR, 90, NELL_S, 1); S.dash = null; S.nell.pose = 0;
          gapAdd(-1); S.score += 60; evPop("+60 NOTES SAVED", "sG"); draw(); await tick(500);
          quip("PRESTON (ABOVE)", "NELL! I SEE YOU! I SEE YOUR WHOLE DATA SET!", "R");
        } else {
          rec.choice = "leave"; S.notes = "LOST";
          gapAdd(+1); S.score = Math.max(0, S.score - 40); evPop("-40 SCOOPED", "sR"); draw(); await tick(500);
          quip("PRESTON (ABOVE)", "OOH, UNPUBLISHED DATA. I'LL CITE THIS AS 'IN PREP.'", "R");
        }
        draw(); await tick(300);
      },
      // the fog machine runs dry for a moment: one easy landing (a reminder trial, logged separately)
      async surge(rec) {
        S.surge = true; S.ev = { type: "surge", pose: 0, live: true }; sfx("fogSurge");
        quip("VOICE BELOW", "THE FOG MACHINE'S REFILLING! GIVE IT TEN SECONDS!", "V");
        S.target = Math.random() < 0.5 ? "L" : "R"; S.wisps = newWisps(fogOf(C_SURGE));
        S.phase = "walk"; await descend();
        if (S.closed) return;
        S.ev = null;
        const done = new Promise(r => { S.surgeDone = r; });
        S.phase = "choose"; S.arrived = Date.now(); draw();
        await done;
        const last = ST.reminders[ST.reminders.length - 1]; rec.correct = last && last.correct;
      },
      // a voice from a vent: Morris or Rex, helpful or not
      async vent(rec) {
        const who = S.said.ventWho === "MORRIS" ? "REX" : S.said.ventWho === "REX" ? "MORRIS" : pick(["MORRIS", "REX"]);
        S.said.ventWho = who; const good = Math.random() < .55; rec.who = who; rec.good = good;
        S.ev.who = who; S.ev.hint = ["", ""];
        S.ev.pose = 0; sfx("fogChain"); draw(); await tick(380); S.ev.pose = 1; sfx("clang"); draw(); await tick(220); S.ev.pose = 2; draw();
        if (who === "MORRIS" && good) { quip("MORRIS", "PAL! I CHEWED THROUGH HIS SHOELACES. HE'S TIED TO THE RAIL.", "K"); await tick(700); gapAdd(+2); evPop("+2 FLIGHTS", "sG"); draw(); await tick(900); }
        else if (who === "MORRIS") { quip("MORRIS", "PAL. PAL. PAL! ...I FORGOT WHAT I WAS GOING TO SAY.", "K"); await tick(1500); }
        else if (good) { quip("REX", "I LEFT MY COFFEE ON THE STAIRS. HE'LL STOP TO TRY IT. EVERYONE DOES.", "M"); await tick(700); gapAdd(+1); evPop("+1 COFFEE BREAK", "sG"); draw(); await tick(900); }
        else {
          quip("REX", "NELL! NELL'S DOWN HERE! SHE'S ON THIS LANDING!", "M");
          S.ev.pose = 3; S.ev.hint = ["SHUSH HIM: SPACE", "OR CLICK"]; draw();
          const k = await evWait(1400, () => true); if (S.closed) return;
          rec.shushed = !!k;
          if (k) { S.ev.pose = 4; sfx("good"); S.score += 20; evPop("+20 SHH", "sG"); draw(); quip("REX", "...SORRY. STILL THAWING. NINE YEARS OF POSTDOC.", "M"); await tick(900); }
          else { gapAdd(-1); evPop("HEARD YOU", "sR"); draw(); quip("PRESTON (ABOVE)", "THANKS, REX! LOVE THE ENERGY!", "R"); await tick(900); }
        }
      },
      // the lights flicker. Hold still: he tracks motion.
      async flicker(rec) {
        S.ev.hint = ["HOLD STILL", "DON'T PRESS ANYTHING"];
        quip("NELL", "LIGHTS. DON'T MOVE. HE TRACKS MOTION.", "G"); S.ev.pose = 0; draw();
        await tick(800); if (S.closed) return;
        let moved = false; S.onEv = () => { if (!moved) { moved = true; S.ev.moved = true; } };
        const frames = shuffle([110, 160, 220, 90, 260, 140, 180, 120]);
        for (let i = 0; i < frames.length && !S.closed; i++) { S.dark = i % 2 === 0; S.ev.pose = i % 2; S.tick++; sfx("fogBuzz"); draw(); await tick(frames[i]); }
        S.dark = false; S.onEv = null; rec.moved = moved;
        if (S.closed) return;
        if (moved) { gapAdd(-2); sfx("bad"); evPop("SPOTTED", "sR"); quip("PRESTON (ABOVE)", "THERE YOU ARE! I SAW YOUR LENSES!", "R"); }
        else { gapAdd(+1); sfx("good"); S.score += 30; evPop("+30 STILL", "sG"); quip("PRESTON (ABOVE)", "NELL? ...WHO TURNED OFF THE NETWORKING?", "R"); }
        S.ev.pose = 2; draw(); await tick(800);
      },
      // both doors chained: back up one flight, across, and down the other stair
      async detour(rec) {
        S.wisps = newWisps(fogOf(ST.c)); S.phase = "event";
        await descend(); if (S.closed) return;
        S.ev = { type: "detour", pose: 0, live: true, hint: ["UP: BACK UPSTAIRS", "OR CLICK"] }; sfx("fogChain");
        quip("NELL", "CHAINED. BOTH OF THEM. THE NRT BUYS PADLOCKS IN BULK.", "G"); draw();
        await evWait(1800, () => true); if (S.closed) return;
        // up the flight, toward him: the landing numbers run backwards
        S.ev.pose = 1; S.ev.hint = ["", ""]; gapAdd(-1); draw();
        await ascend(); if (S.closed) return;
        S.landing -= 1;
        svg.innerHTML = `<rect width="640" height="360" fill="#000"/>`; await tick(70);
        // the landing above: the crossover to stair A
        S.ev.pose = 2; S.open = { side: "L", correct: true, label: "STAIR A" }; sfx("door");
        S.nell = { x: 610, y: FLOOR, dir: -1, pose: 1, s: NELL_S }; draw(); await tick(110);
        quip("MORRIS", "CROSSOVER, PAL! STAIR A! THE OTHER STAIR!", "K");
        await jumpTo(530, FLOOR, 90, NELL_S, -1); await jumpTo(STAND.L, FLOOR, 90, NELL_S, -1); S.dash = null; S.nell.pose = 0; draw(); await tick(320);
        S.landing += 1; S.zoneLandings++;
        svg.innerHTML = `<rect width="640" height="360" fill="#000"/>`; await tick(70);
      },
      // a breather: Preston stops for something more important
      async breather(rec) {
        S.ev.hint = ["CATCH YOUR BREATH", "ANY KEY TO RUN ON"];
        quip("PRESTON (ABOVE)", pick(["HOLD ON, NELL. I HAVE TO TAKE THIS. IT'S MY H-INDEX.", "ONE SEC. I'M BEING CITED.", "WAIT UP. I'M LIVE-POSTING THIS."]), "R");
        for (let i = 0; i < 7 && !S.closed; i++) {
          S.ev.pose = i % 2; S.tick++; if (i === 1 || i === 3) gapAdd(+1); draw();
          const k = await evWait(330, () => true); if (k && i >= 3) break;
        }
        if (!S.closed) quip("NELL", "OKAY. OKAY. DOWN.", "G");
      },
    };
    // event drawings that sit behind the actors (on the doors and walls)
    function evUnder(st) {
      const e = S.ev; if (!e || !e.live) return "";
      let s = "";
      if (e.type === "hood") {
        const d = DOORS[e.side], cx = d.x + d.w / 2;
        s += `<rect class="k sW" x="${d.x}" y="${DOOR_TOP}" width="${d.w}" height="${FLOOR - DOOR_TOP}"/>`;
        if (e.pose === 0) s += `<circle class="fX" cx="${cx + 8}" cy="${MARK_Y + 10}" r="1.6"/>`;
        else {
          const y = e.pose === 1 ? FLOOR - 4 : FLOOR + 6, p = e.pose === 1 ? 1 : e.pose === 3 ? 2 : 0;
          s += `<g class="fogactor" data-pose="${p}" transform="translate(${cx},${y}) scale(${NELL_S * (e.side === "L" ? 1 : -1)},${NELL_S}) translate(-160,-187)">${robedFigure()}</g>`;
          if (e.pose >= 2) s += chip("MEMBERS ONLY", cx - chipW("MEMBERS ONLY", 4.4) / 2, DOOR_TOP - 24, 4.4, "fV");
          if (e.pose === 3) s += arcs(cx - 30, MARK_Y + 20, -1, "sV", 3, .9) + arcs(cx + 30, MARK_Y + 20, 1, "sV", 3, .9) + segC("NO.", cx, DOOR_TOP - 40, 8, "sV", 1.3);
          if (e.pose === 1) s += `<path class="hl sV" d="M${cx - 30},${FLOOR - 50} L${cx - 44},${FLOOR - 50} M${cx - 30},${FLOOR - 36} L${cx - 48},${FLOOR - 36}"/>`;
        }
        const od = DOORS[other(e.side)], ocx = od.x + od.w / 2;
        if (e.pose >= 2) s += `<path class="sG" d="M${ocx - 10},${DOOR_TOP - 22} L${ocx},${DOOR_TOP - 12} L${ocx + 10},${DOOR_TOP - 22}"/>` + segC("THIS WAY", ocx, DOOR_TOP - 34, 5, "sG", 1);
      }
      if (e.type === "jam" && e.pose !== 3) {
        const d = DOORS[e.side], hingeX = e.side === "L" ? d.x : d.x + d.w, o = DOORS[other(e.side)];
        // the fire door: red frame, push bar, a crack of black opening at the far edge
        s += `<path class="sR" d="M${d.x - 7},${FLOOR} L${d.x - 7},${DOOR_TOP - 7} L${d.x + d.w + 7},${DOOR_TOP - 7} L${d.x + d.w + 7},${FLOOR}"/>`;
        s += `<path class="sW" d="M${d.x + 8},186 L${d.x + d.w - 8},186 M${d.x + 10},182 L${d.x + 10},190 M${d.x + d.w - 10},182 L${d.x + d.w - 10},190"/>`;
        const gap = e.p * 2.9, ex = e.side === "L" ? d.x + d.w : d.x;
        if (gap > 0) s += `<path class="k sW" d="M${ex},${DOOR_TOP} L${ex + (e.side === "L" ? -gap : gap)},${DOOR_TOP + 4} L${ex + (e.side === "L" ? -gap : gap)},${FLOOR - 4} L${ex},${FLOOR} Z"/>`;
        s += chip("FIRE DOOR", d.x + d.w / 2 - chipW("FIRE DOOR", 4.6) / 2, DOOR_TOP - 26, 4.6, "fR");
        if (e.p > 0) s += arcs(e.side === "L" ? d.x - 12 : d.x + d.w + 12, 150 + (e.pose === 1 ? 0 : 8), e.side === "L" ? -1 : 1, "sW", 3, .8);
        if (e.pose === 1) s += star4(hingeX === d.x ? d.x + d.w + 4 : d.x - 4, 168, 5, "sA") + star4(hingeX === d.x ? d.x + d.w + 10 : d.x - 10, 156, 3, "sA");
        // the other door: chained shut
        s += chain(o);
        // the shove meter
        const mx = d.x + d.w / 2 - 50;
        s += seg("SHOVE", mx, 256, 4.2, "sW", .8);
        for (let i = 0; i < 6; i++) s += `<rect class="${i < e.p ? "fG" : "k sW"}" x="${mx + 28 + i * 9}" y="253" width="6" height="10"/>`;
      }
      if (e.type === "detour" && e.pose === 0) { s += chain(DOORS.L) + chain(DOORS.R); s += chip("CHAINED", 472 - chipW("CHAINED", 5) / 2, 252, 5, "fR"); }
      if (e.type === "detour" && e.pose === 2) s += chip("CROSSOVER", 407 - chipW("CROSSOVER", 4.6) / 2, DOOR_TOP - 26, 4.6, "fG") + chain(DOORS.R);
      if (e.type === "vent") {
        const vx = 588, vy = 102;
        s += `<rect class="k sM" x="${vx}" y="${vy}" width="36" height="22"/>`;
        const grille = (x, y, rot) => `<g transform="rotate(${rot} ${x + 18} ${y + 11})"><rect class="k sW" x="${x}" y="${y}" width="36" height="22"/>${[4, 9, 14, 19].map(o => `<path class="hl sW" d="M${x + 3},${y + o} L${x + 33},${y + o}"/>`).join("")}</g>`;
        if (e.pose === 0) s += grille(vx, vy, 0) + arcs(vx - 4, vy + 11, -1, "sW", 2, .7) + arcs(vx + 40, vy + 11, 1, "sW", 2, .7);
        else if (e.pose === 1) s += grille(vx + 2, vy + 46, 24) + segC("CLANG", vx + 18, vy + 30, 5, "sW", 1);
        else {
          s += grille(vx + 4, FLOOR - 12, 4);
          if (e.who === "MORRIS") s += morrisPeek(vx + 18, vy + 22, .7);
          else s += `<g transform="translate(${vx + 18},${vy + 13}) scale(.3) translate(-160,-56)">${rexHead()}</g>`;
          s += arcs(vx - 4, vy + 11, -1, e.who === "MORRIS" ? "sK" : "sM", 3, .8);
          if (e.pose === 3) s += segC("!", vx - 24, vy - 4, 10, "sM", 1.4);
          if (e.pose === 4) s += segC("SHH", vx - 26, vy - 4, 6, "sG", 1);
        }
      }
      if (e.type === "flicker") {
        // the cage lamp in the ceiling, buzzing
        s += `<path class="sM" d="M472,0 L472,4"/><path class="k sW" d="M462,4 L482,4 L478,14 L466,14 Z"/><path class="hl sW" d="M465,9 L479,9"/>`;
        s += arcs(456, 9, -1, "sA", 2, .6) + arcs(488, 9, 1, "sA", 2, .6);
        if (e.pose === 2 && !e.moved) s += segC("...", 472, 70, 6, "sM", 1);
      }
      if (e.type === "breather") {
        s += chip("BREATHER", 472 - chipW("BREATHER", 5) / 2, 252, 5, "fG");
      }
      return s;
    }
    // event drawings in front of the actors (hands, flying notebooks, gusts, prompts)
    function evOver(st) {
      const e = S.ev; if (!e || !e.live) return "";
      let s = "";
      if (e.type === "hand") {
        // the flight above's rail, across the top
        s += `<path class="sM" d="M380,22 L640,22"/>` + [400, 440, 520, 560, 600].map(x => `<path class="hl sM" d="M${x},0 L${x},22"/>`).join("");
        if (e.pose === 0) {
          s += `<path class="sR" d="M492,0 L494,16 M508,0 L506,16"/><path class="sK" d="M490,24 C490,16 496,16 496,24 M496,24 C496,15 502,15 502,24 M502,24 C502,16 508,16 508,24 M486,20 C486,15 492,15 492,22"/>`;
          s += arcs(480, 20, -1, "sR", 2, .7) + arcs(516, 20, 1, "sR", 2, .7);
          s += chip("DUCK!", 472 - chipW("DUCK!", 7) / 2, 40, 7, "fR");
        } else if (e.pose === 1) {
          s += `<path class="sR" d="M520,0 L492,112 M534,0 L504,116"/><path class="hl sW" d="M540,10 L516,96 M550,14 L528,90 M528,4 L506,84"/>`;
          s += `<path class="sK" d="M494,116 L482,134 M498,118 L490,138 M503,119 L499,140 M507,118 L508,138 M492,112 L478,118"/>`;
          if (!S.nell.duck) s += chip("DUCK!", 472 - chipW("DUCK!", 7) / 2, 40, 7, "fR");
        } else if (e.pose === 2) {
          s += `<path class="sR" d="M520,0 L494,112 M534,0 L506,116"/><path class="k sK" d="M490,116 C486,126 504,132 508,120 C506,112 494,110 490,116 Z"/>`;
          s += `<path class="hl sW" d="M440,122 L470,122 M436,130 L462,130 M514,122 L544,122"/>` + segC("WHIFF", 560, 100, 7, "sW", 1.1);
        } else {
          s += `<path class="sR" d="M520,0 L504,60 M534,0 L516,64"/><path class="k sK" d="M502,64 C498,74 516,80 520,68 C518,60 506,58 502,64 Z"/><path class="sA" d="M492,82 L524,62"/>`;
          s += star4(470, 140, 5, "sA") + star4(484, 128, 3, "sA") + segC("YOINK", 560, 70, 7, "sR", 1.1);
          s += `<path class="hl sW" d="M500,90 L500,104 M510,92 L510,106"/>`;
        }
      }
      if (e.type === "notebook" && e.nb) {
        const { x, y, a } = e.nb;
        s += `<g transform="rotate(${a} ${x} ${y})"><rect class="k sW" x="${x - 8}" y="${y - 6}" width="16" height="11"/><path class="hl sW" d="M${x - 5},${y - 6} L${x - 5},${y + 5}"/>${[-3, 0, 3].map(o => `<circle class="hl sW" cx="${x - 8}" cy="${y + o}" r="1"/>`).join("")}<path class="hl sB" d="M${x - 2},${y - 2} L${x + 6},${y - 2} M${x - 2},${y + 1} L${x + 5},${y + 1}"/></g>`;
        if (e.pose === 0) s += `<path class="hl sW" d="M${x + 14},${y - 2} L${x + 30},${y + 2} M${x + 14},${y + 4} L${x + 26},${y + 8}"/>`;
        if (e.pose === 1) {
          s += `<g data-ev="L" style="cursor:pointer">${chip("< GRAB IT", 352, 252, 6, "fG")}</g><g data-ev="R" style="cursor:pointer">${chip("LEAVE IT >", 532, 252, 6, "fR")}</g>`;
          s += seg("+60  HE GAINS", 352, 267, 3.6, "sG", .7) + seg("-40  HE STOPS TO READ", 532, 267, 3.6, "sR", .7);
          for (let i = 0; i < 6; i++) s += `<rect class="${i < e.cd ? "fW" : "k sD"}" x="${451 + i * 7}" y="253" width="4" height="9"/>`;
          s += arcs(x + 14, y, 1, "sW", 2, .6);
        }
      }
      if (e.type === "surge") {
        // the gust: speed dashes, and the wisps torn sideways
        for (const [y, w] of [[30, 120], [56, 80], [210, 140], [232, 90], [100, 60]]) s += `<path class="hl sW" d="M${640 - w - (y * 3) % 200},${y} L${640 - (y * 3) % 200},${y}"/>`;
        s += chip("FOG SURGE", 472 - chipW("FOG SURGE", 5) / 2, 252, 5, "fB");
      }
      if (e.type === "breather") {
        const n = S.nell, hx = n.x + 12, hy = n.y - 80;
        s += e.pose ? `<path class="hl sW" d="M${hx},${hy} C${hx + 4},${hy - 3} ${hx + 8},${hy + 3} ${hx + 12},${hy}"/>` : `<path class="hl sW" d="M${hx + 2},${hy + 4} C${hx + 6},${hy + 1} ${hx + 10},${hy + 7} ${hx + 14},${hy + 4} M${hx + 6},${hy - 4} C${hx + 9},${hy - 6} ${hx + 12},${hy - 2} ${hx + 15},${hy - 4}"/>`;
        s += `<path class="hl sK" d="M${n.x - 14},${n.y - 92} L${n.x - 15},${n.y - 88}"/>`;
      }
      if (e.type === "detour" && e.pose === 1) {
        s += `<path class="sW" d="M300,60 L300,30 M290,40 L300,30 L310,40"/>` + segC("UP", 300, 66, 6, "sW", 1);
      }
      if (e.type === "detour" && e.pose === 2) {
        s += `<path class="hl sW" d="M560,200 L600,200 M550,214 L596,214 M560,228 L604,228"/>`;
      }
      return s;
    }
    // a chain across a door, X-wise, with a padlock
    function chain(d) {
      let s = "";
      const links = (x0, y0, x1, y1) => { let o = ""; const n = 9; for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
        o += `<ellipse class="k sM" cx="${x}" cy="${y}" rx="${i % 2 ? 2 : 4.4}" ry="${i % 2 ? 4.4 : 2}" transform="rotate(${Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI} ${x} ${y})"/>`; } return o; };
      s += links(d.x + 4, DOOR_TOP + 30, d.x + d.w - 4, FLOOR - 40) + links(d.x + d.w - 4, DOOR_TOP + 30, d.x + 4, FLOOR - 40);
      const cx = d.x + d.w / 2, cy = (DOOR_TOP + 30 + FLOOR - 40) / 2;
      s += `<path class="sA" d="M${cx - 5},${cy} L${cx - 5},${cy - 6} C${cx - 5},${cy - 12} ${cx + 5},${cy - 12} ${cx + 5},${cy - 6} L${cx + 5},${cy}"/><rect class="k sA" x="${cx - 8}" y="${cy}" width="16" height="13"/><circle class="hl sA" cx="${cx}" cy="${cy + 6}" r="1.6"/>`;
      return s;
    }

    /* ---------------- Preston's footsteps: faster and louder as the gap shrinks ---------------- */
    let stepT = 0;
    function prestonSteps() {
      if (S.closed) return;
      const near = Math.max(0, Math.min(1, (GAP_MAX - S.gap) / (GAP_MAX - 1)));
      if (S.gap < GAP_MAX && !S.dark && (S.phase === "choose" || S.phase === "walk" || S.phase === "event") && !(S.ev && S.ev.type === "breather")) sfx("fogPreston", { near });
      stepT = setTimeout(prestonSteps, 220 + 110 * Math.max(1, S.gap));
    }

    /* ---------------- Preston closes in while you hesitate ---------------- */
    const iv1 = setInterval(() => {
      if (S.phase === "choose" && Date.now() - S.arrived > hesitateMs(S.gap)) {
        S.arrived = Date.now(); S.gap -= 1; S.gapFx = { d: -1, t: Date.now() };
        if (S.gap === 2) once("close", () => quip("PRESTON (ABOVE)", "NELL! WAIT UP! LET'S NETWORK!", "R"));
        if (S.gap <= 0) { caught(); return; }
        draw();
      }
    }, 100);
    async function caught() {
      sfx("fogCaught"); S.phase = "caught"; S.caught++; S.streak = 0; S.score = Math.max(0, S.score - 100); S.ev = null; S.dark = false; draw();
      await die(DEATH);
      if (S.closed) return;
      revise();
    }
    function caughtCard() {
      return `<rect x="0" y="0" width="640" height="290" fill="#000" opacity=".92"/>
        ${segC("CAUGHT", 320, 60, 40, "sR", 2)}
        ${segC("PRESTON: LET'S GRAB COFFEE. ACTUALLY, LET'S GRAB SYNERGY.", 320, 128, 7, "sW", 1.1)}
        ${segC("-100", 320, 150, 9, "sA", 1.3)}
        <g data-revise="1" style="cursor:pointer"><rect class="fW" x="230" y="196" width="180" height="28"/>${segC("REVISE & RESUBMIT", 320, 205, 8, "s0", 1.3)}</g>
        ${segC("OR PRESS SPACE", 320, 236, 4.6, "sM", .8)}`;
    }
    function revise() {
      if (S.phase !== "caught" || S.closed) return;
      S.gap = 6; S.missRun = 0; S.surge = false; S.surgeDone = null; S.ev = null; S.onEv = null; S.nell.duck = false;
      svg.innerHTML = `<rect width="640" height="360" fill="#000"/>`; setTimeout(trial, 120);
    }

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
      s += seg("SCORE", 20, 130, 4.2, "sA", .8) + seg(pts(S.score), 20, 138, 18, "sA", 1.4);
      s += seg("TIME", 120, 130, 4.2, "sW", .8) + seg(S.tEnd || clock(), 120, 138, 18, "sW", 1.4);
      s += seg("BEST STREAK", 20, 166, 4.2, "sG", .8) + seg("X" + S.best, 20, 174, 18, "sG", 1.4);
      s += seg("CAUGHT", 120, 166, 4.2, "sR", .8) + seg(String(S.caught), 120, 174, 18, "sR", 1.4);
      if (S.notes) s += seg("NOTEBOOK", 186, 166, 4.2, S.notes === "KEPT" ? "sG" : "sR", .8) + seg(S.notes, 186, 174, 12, S.notes === "KEPT" ? "sG" : "sR", 1.2);
      // what the number means, and what was left out of it
      const R = ST.reminders, rOk = R.filter(r => r.correct).length;
      s += seg("THE FOG SETTLED WHERE YOU PICK THE RIGHT DOOR", 20, 204, 4.4, "sW", .8);
      s += seg("ABOUT 71% OF THE TIME. THAT CONTRAST IS YOUR THRESHOLD.", 20, 213, 4.4, "sW", .8);
      s += seg(`2AFC  2-DOWN-1-UP  ${ST.reversals.length} REVERSALS  ${n} LANDINGS COUNTED`, 20, 228, 4.2, "sM", .8);
      s += seg(`NOT COUNTED: ${S.events.length - R.length} EVENTS${R.length ? `, ${R.length} EASY REMINDER${R.length > 1 ? "S" : ""} (${rOk}/${R.length} RIGHT)` : ""}`, 20, 238, 4.2, "sM", .8);
      s += seg("UNCALIBRATED SCREEN. DON'T PUT IT IN A PAPER.", 20, 252, 4.4, "sR", .8);
      // the run, drawn as stairs
      s += `<path class="hl sM" d="M294,114 L294,276 L616,276"/>` + seg("CONTRAST", 294, 104, 4.2, "sM", .8) + seg("LANDING", 580, 280, 4.2, "sM", .8);
      for (const c of [0.3, 0.1, 0.03, 0.01, 0.003]) { const y = py(c); if (y > 276) continue;
        s += `<path class="hl sD" d="M294,${y} L616,${y}"/>` + seg((c * 100 >= 1 ? Math.round(c * 100) : c * 100) + "%", 262, y - 3, 4.6, "sM", .8); }
      s += `<path class="hl dash sA" d="M294,${py(thr)} L616,${py(thr)}"/>`;
      let d = ""; T.forEach((t, i) => { const x0 = px(i), x1 = px(i + 1), y = py(t.c); d += (i ? ` L${x0},${y}` : `M${x0},${y}`) + ` L${x1},${y}`; });
      s += `<path class="sW" d="${d}"/>`;
      T.forEach((t, i) => { const x = (px(i) + px(i + 1)) / 2, y = py(t.c);
        s += t.correct ? `<circle class="fG" cx="${x}" cy="${y - 4}" r="2"/>` : `<circle class="k sR" cx="${x}" cy="${y - 4}" r="2"/>`; });
      s += `<g data-cont="1" style="cursor:pointer"><rect class="fW" x="548" y="14" width="76" height="22"/>${segC("CONTINUE", 586, 21, 6.5, "s0", 1.2)}</g>`;
      return s;
    }
    async function finish() {
      S.phase = "end"; S.tEnd = clock(); sfx("fogEscape"); draw(); score("fog", S.caught ? 3 : 5);
      quip("NELL", "I JUST RAN A STAIRCASE IN A STAIRCASE.", "G");
      setTimeout(() => quip("MORRIS", "IS THAT A JOKE? IT FEELS LIKE A JOKE.", "K"), 2600);
    }

    /* ---------------- input ---------------- */
    const evIn = (k) => { if (S.phase === "event" && S.onEv) S.onEv(k); };
    const onClick = (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const evb = t.closest("[data-ev]"); if (evb) { evIn(evb.dataset.ev); return; }
      const door = t.closest("[data-door]"); if (door) { if (S.phase === "event") evIn(door.dataset.door); else choose(door.dataset.door); return; }
      if (t.closest("[data-revise]")) { reviseNow(); return; }
      if (t.closest("[data-cont]")) { close(true); return; }
      if (S.phase === "event") evIn(S.ev && S.ev.type === "detour" ? "up" : "act");
    };
    const onKey = (e) => {
      if (e.key === "Escape") { if (S.phase === "intro") close(false); return; }
      if (S.phase === "intro" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); begin(); return; }
      if (S.phase === "caught" && (e.key === " " || e.key === "Enter")) { e.preventDefault(); reviseNow(); return; }
      if (S.phase === "event") {
        if (e.repeat) return;
        const k = { ArrowLeft: "L", a: "L", ArrowRight: "R", d: "R", ArrowUp: "up", w: "up", ArrowDown: "down", s: "down", " ": "act", Enter: "act" }[e.key];
        if (k) { e.preventDefault(); evIn(k); }
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "a") choose("L");
      if (e.key === "ArrowRight" || e.key === "d") choose("R");
    };
    svg.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
    // fog drifts in steps (poses), drips drip, and the clock ticks
    const iv2 = setInterval(() => {
      if (S.phase !== "choose" && !(S.phase === "event" && !S.dark)) return;
      S.tick++;
      if (S.zone === 3 && S.tick % 3 === 2) sfx("drip");
      for (const w of S.wisps) { w.x += w.vx; if (w.x > 660) w.x = -60; if (w.x < -80) w.x = 640; }
      draw();
    }, 140);

    async function begin() {
      if (S.phase !== "intro") return; introEl.classList.remove("show"); S.t0 = Date.now();
      if (window.SFX && window.SFX.unlock) window.SFX.unlock();
      prestonSteps();
      await zoneCard(); if (S.closed) return;
      quip("NELL", "SECOND FLOOR. FACULTY OFFICES. NOBODY'S IN THEM ANYWAY.", "G");
      trial();
    }
    introEl.addEventListener("click", begin);

    function close(escaped) {
      if (S.closed) return; S.closed = true;
      clearInterval(iv1); clearInterval(iv2); clearTimeout(quipT); clearTimeout(stepT);
      if (S.evCancel) S.evCancel();
      svg.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey); introEl.removeEventListener("click", begin);
      if (window.STAIR && window.STAIR.S === S) delete window.STAIR;
      el.classList.remove("show"); el.innerHTML = "";
      resolve({ escaped: !!escaped, threshold: escaped ? ST.threshold : null });
    }

    // testing hook (S.evQueue forces the next event types; S.evAt is the trial count at which the next event fires)
    window.STAIR = { S, ST, stimulus, choose, rgbFor, revise, ZONES, GEOS, EV_TYPES, DOORS, draw };

    draw();
  });
}
