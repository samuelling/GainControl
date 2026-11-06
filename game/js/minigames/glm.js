// THE REPLICATION — a playable GLM on Nell's monitor (Act III). Mounts into any container element.
// Real computations: boxcars ⊗ canonical double-gamma HRF, AR(1) noise + drift, least squares, a t contrast.
// glm(container, { die(text) → Promise<"revise"|"withdraw">, score(key, n), coach(who, text) }) → Promise<{ tells, score }>
import { seg, segC, segW, chip } from "../gfx.js";

/* ================================================================ *
 *  THE DATA (what actually happened in the scanner)
 * ================================================================ */
const TR = 2, NV = 128, DUMMY = 8;                         // 256 s of data after 8 s of discarded dummies
const LOG_ONSETS = [16, 48, 80, 112, 144, 176, 208, 240];   // Preston's log, in SCANNER time (ATT, IGN, ATT, …)
const TRUE_ONSETS = LOG_ONSETS.map(t => t - DUMMY);         // in data time
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const gamma = (n) => { let g = 1; for (let i = 2; i < n; i++) g *= i; return g; };   // Γ(n) for integer n
function hrf(t) { if (t <= 0) return 0; return Math.pow(t, 5) * Math.exp(-t) / gamma(6) - Math.pow(t, 15) * Math.exp(-t) / gamma(16) / 6; }
// predictor for a set of block onsets (seconds, data time), 16 s each, sampled at each TR
function predictor(onsets, convolve = true) {
  const dt = 0.1, T = NV * TR, n = Math.round(T / dt), box = new Float64Array(n);
  for (const o of onsets) for (let i = Math.max(0, Math.round(o / dt)); i < Math.min(n, Math.round((o + 16) / dt)); i++) box[i] = 1;
  const out = new Float64Array(NV);
  if (!convolve) { for (let v = 0; v < NV; v++) out[v] = box[Math.round(v * TR / dt)] || 0; return out; }
  const K = Math.round(32 / dt), h = new Float64Array(K); let hs = 0;
  for (let k = 0; k < K; k++) { h[k] = hrf(k * dt); hs += h[k]; }
  for (let v = 0; v < NV; v++) { const i = Math.round(v * TR / dt); let s = 0; for (let k = 0; k < K && k <= i; k++) s += box[i - k] * h[k]; out[v] = s / hs; }
  return out;
}
const XA = predictor(TRUE_ONSETS.filter((_, i) => i % 2 === 0)), XI = predictor(TRUE_ONSETS.filter((_, i) => i % 2 === 1));
function ols(y, xa, xi) {
  // normal equations for [xa, xi, 1]
  const X = [xa, xi, new Float64Array(NV).fill(1)], A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], b = [0, 0, 0];
  for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) for (let v = 0; v < NV; v++) A[i][j] += X[i][v] * X[j][v]; for (let v = 0; v < NV; v++) b[i] += X[i][v] * y[v]; }
  const inv = inv3(A), beta = [0, 1, 2].map(i => inv[i][0] * b[0] + inv[i][1] * b[1] + inv[i][2] * b[2]);
  const rss = RSS(y, xa, xi, beta);
  const s2 = rss / (NV - 3), c = [1, -1, 0];
  const vc = c.reduce((a, ci, i) => a + ci * c.reduce((s, cj, j) => s + inv[i][j] * cj, 0), 0);
  const se = Math.sqrt(s2 * vc), t = (beta[0] - beta[1]) / se;
  const seA = Math.sqrt(s2 * inv[0][0]), seI = Math.sqrt(s2 * inv[1][1]);
  return { beta, rss, t, se, seA, seI, p: 2 * (1 - Phi(Math.abs(t))) };
}
function inv3(m) {
  const [a, b, c] = m[0], [d, e, f] = m[1], [g, h, i] = m[2];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
  return [[A / det, -(b * i - c * h) / det, (b * f - c * e) / det], [B / det, (a * i - c * g) / det, -(a * f - c * d) / det], [C / det, -(a * h - b * g) / det, (a * e - b * d) / det]];
}
function RSS(y, xa, xi, [bA, bI, b0]) { let s = 0; for (let v = 0; v < NV; v++) { const r = y[v] - bA * xa[v] - bI * xi[v] - b0; s += r * r; } return s; }
function Phi(z) { const t = 1 / (1 + 0.2316419 * z), d = 0.3989423 * Math.exp(-z * z / 2); return 1 - d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); }
// Nell's sub-01: equal amplitudes, real-looking noise. Pick a seed where the attention effect really is ~nothing.
function makeData() {
  for (let seed = 412; ; seed++) {
    const r = rng(seed), gauss = () => { let u = 0; for (let k = 0; k < 6; k++) u += r(); return (u - 3) * Math.SQRT2; };
    const y = new Float64Array(NV); let e = 0;
    for (let v = 0; v < NV; v++) {
      e = 0.3 * e + 0.22 * gauss();
      y[v] = 1.0 * XA[v] + 1.0 * XI[v] + 0.15 + 0.18 * Math.sin(v / NV * Math.PI * 1.3 + 0.4) + e;
    }
    const f = ols(y, XA, XI);
    if (Math.abs(f.t) < 0.4 && Math.abs(f.beta[0] - 1) < 0.08) return { y, fit: f, seed };
  }
}

/* ================================================================ *
 *  THE SCREEN
 * ================================================================ */
const X0 = 46, X1 = 604, tx = (t) => X0 + (t / (NV * TR)) * (X1 - X0);
const STAGES = ["READ THE LOG", "LINE IT UP", "MAKE IT SLOW", "FIT BY HAND", "SOLVE", "CONTRAST", "LAYERS", "THE PAPER"];
const FORKS = ["NEW ROI: 'V1-ISH'", "DROP RUN 2", "MORE SMOOTHING", "EXCLUDE OUTLIERS", "ONE-TAILED, ACTUALLY", "ADD A COVARIATE: VIBES", "ONLY THE LEFT HEMISPHERE",
  "ONLY THE RIGHT HEMISPHERE", "CHANGE THE HRF", "REMOVE SUBJECT 'P. GAGE'", "SMALL-VOLUME CORRECTION", "TRIM THE LAST BLOCK", "RE-REFERENCE TO BASELINE 2", "REPORT THE PEAK VOXEL"];
const FORK_P = [.48, .31, .27, .19, .22, .14, .11, .09, .12, .08, .07, .06, .051, .049];

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function glm(root, opts = {}) {
  const die = opts.die || (async () => "revise");
  const score = opts.score || (() => {});
  const D = makeData();
  return new Promise(resolve => {
    const S = {
      stage: 0, blocks: { A: [], I: [] }, shift: 0, hrf: false, k: { A: 0.5, I: 0.5, B: 0 }, lampSeen: false, solved: false,
      showContrast: false, layerFit: false, tells: { clean: false, copy: false, veins: false }, forks: 0, coach: [], done: false, total: 0,
    };
    root.innerHTML = `<svg class="t glm" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg"></svg><div class="coach"></div>`;
    const svg = root.querySelector("svg"), coachEl = root.querySelector(".coach");
    const add = (key, n) => { score(key, n); S.total += n; };

    /* ---------- coach (Gus teaches, Nell reacts) ---------- */
    function coach(who, text) {
      const col = who === "GUS" ? "B" : who === "NELL" ? "G" : who === "MORRIS" ? "K" : "W";
      if (!S.coach.length || S.coach[0][1] !== text) window.SFX && window.SFX.voice(who, true);
      S.coach = [[who, text, col]];
      coachEl.innerHTML = `<span class="who" style="background:var(--${col})">${who}</span> <span style="color:var(--${col})">${text}</span>`;
      if (opts.coach) opts.coach(who, text);
    }

    /* ---------- current model ---------- */
    const onsetsOf = (row) => S.blocks[row].map(o => o + S.shift * TR);
    function model() {
      const xa = predictor(onsetsOf("A"), S.hrf), xi = predictor(onsetsOf("I"), S.hrf);
      return { xa, xi };
    }
    const aligned = () => {
      const a = onsetsOf("A").slice().sort((p, q) => p - q), i = onsetsOf("I").slice().sort((p, q) => p - q);
      return JSON.stringify(a) === JSON.stringify(TRUE_ONSETS.filter((_, j) => j % 2 === 0)) && JSON.stringify(i) === JSON.stringify(TRUE_ONSETS.filter((_, j) => j % 2 === 1));
    };
    const matchesLog = () => {
      const a = S.blocks.A.slice().sort((p, q) => p - q), i = S.blocks.I.slice().sort((p, q) => p - q);
      const LA = LOG_ONSETS.filter((_, j) => j % 2 === 0), LI = LOG_ONSETS.filter((_, j) => j % 2 === 1);
      const TA = TRUE_ONSETS.filter((_, j) => j % 2 === 0), TI = TRUE_ONSETS.filter((_, j) => j % 2 === 1);
      return (JSON.stringify(a) === JSON.stringify(LA) && JSON.stringify(i) === JSON.stringify(LI)) || (JSON.stringify(a) === JSON.stringify(TA) && JSON.stringify(i) === JSON.stringify(TI));
    };

    /* ---------- drawing helpers ---------- */
    const Y0 = 52, Y1 = 166, yv = (v) => Y1 - ((v + 0.9) / 3.2) * (Y1 - Y0);
    const line = (arr, cls, w = 1.5, extra = "") => `<path class="${cls}" stroke-width="${w}" ${extra} d="${[...arr].map((v, i) => `${i ? "L" : "M"}${tx(i * TR).toFixed(1)},${yv(v).toFixed(1)}`).join(" ")}"/>`;
    const btn = (id, label, x, y, w, kind = "w", h = 18) => {
      const fill = kind === "w" ? "fW" : kind === "g" ? "fG" : kind === "r" ? "fR" : "k sW";
      return `<g data-b="${id}" style="cursor:pointer"><rect class="${fill}" x="${x}" y="${y}" width="${w}" height="${h}"/>${segC(label, x + w / 2, y + (h - 6) / 2, 6, kind === "o" ? "sW" : "s0", 1.1)}</g>`;
    };
    function header() {
      let s = `<rect width="640" height="360" fill="#000"/>` + seg("GLM", 14, 10, 12, "sW", 1.5) + seg("SUB-01  V1  3T  TR 2 SEC", 50, 14, 5, "sM", .9);
      STAGES.forEach((n, i) => { const x = 196 + i * 54, on = i === S.stage, done = i < S.stage || (i === 7 && S.done);
        s += on ? chip(String(i + 1), x, 9, 5, "fA") : `<rect class="hl ${done ? "sG" : "sD"}" x="${x - 1}" y="8" width="11" height="12"/>${segC(String(i + 1), x + 4.5, 11, 5, done ? "sG" : "sM", .9)}`;
        if (on) s += seg(n, x + 13, 12, 4.4, "sA", .8); });
      if ((S.stage === 5 || S.stage === 6) && !S.done) s += btn("fork", "TRY ANOTHER ANALYSIS", 474, 28, 150, "r", 15);
      return s;
    }
    function plotFrame() {
      let s = `<path class="hl sD" d="M${X0},${Y0 - 6} L${X0},${Y1 + 4} L${X1},${Y1 + 4}"/>`;
      for (let t = 0; t <= 256; t += 32) s += `<path class="hl sD" d="M${tx(t)},${Y1 + 4} L${tx(t)},${Y1 + 7}"/>` + segC(`${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`, tx(t), Y1 + 9, 4, "sM", .7);
      s += seg("V1 SIGNAL", X0, Y0 - 16, 4.4, "sW", .8) + seg("% CHANGE", X0 + 48, Y0 - 16, 4.4, "sM", .8);
      s += `<path class="hl dash sD" d="M${X0},${yv(0)} L${X1},${yv(0)}"/>`;
      return s;
    }
    function dataLine() { return line(D.y, "sW", 1.1); }
    function sequencer(y) {
      let s = seg("ATTEND", 8, y + 3, 4.4, "sG", .8) + seg("IGNORE", 8, y + 21, 4.4, "sB", .8);
      for (let t = 0; t < 256; t += 8) {
        for (const [row, yy, cls] of [["A", y, "sG"], ["I", y + 18, "sB"]]) {
          const on = onsetsOf(row).some(o => t >= o && t < o + 16);
          s += `<rect class="${on ? "f" + cls.slice(1) : "hl sD"}" fill="${on ? "" : "transparent"}" x="${tx(t) + .8}" y="${yy}" width="${tx(8) - tx(0) - 1.6}" height="12" data-cell="${row}:${t}" style="cursor:${S.stage === 0 ? "pointer" : "default"}"/>`;
        }
      }
      return s;
    }
    function prestonLog(y) {
      // his handwriting: the stroke alphabet, slanted, in BRASS; a coffee ring; the insignia doodled in the margin
      let s = `<g transform="translate(46,${y}) skewX(-10)"><rect class="k sA" x="0" y="0" width="410" height="46"/>`;
      s += seg("RUN 1  SUB-01  'ATTN SYNERGY'   TR 2 SEC   BLOCKS 16 ON / 16 OFF", 10, 7, 5.5, "sA", .9);
      s += seg("ATT @ 0:16   IGN @ 0:48   ATT @ 1:20   IGN @ 1:52   ATT @ 2:24   IGN @ 2:56   ATT @ 3:28   IGN @ 4:00", 10, 20, 5.5, "sW", .9);
      s += seg("(NOTE TO SELF: DUMMIES??  ASK NELL)", 10, 33, 5, S.stage >= 1 ? "sR" : "sM", .9) + `</g>`;
      s += `<circle class="hl sA" cx="420" cy="${y + 30}" r="15"/><circle class="hl sA" cx="421" cy="${y + 31}" r="13"/>`;
      s += `<circle class="sX" cx="476" cy="${y + 22}" r="8"/><circle class="fX" cx="476" cy="${y + 22}" r="3"/>`;
      return s;
    }
    function knob(id, label, cls, x, y, v, lo, hi) {
      const a = (-135 + 270 * (v - lo) / (hi - lo)) * Math.PI / 180, r = 17;
      let s = `<g data-knob="${id}" style="cursor:ns-resize"><circle class="k ${cls}" cx="${x}" cy="${y}" r="${r}"/>`;
      for (let i = 0; i <= 10; i++) { const b = (-135 + 27 * i) * Math.PI / 180; s += `<path class="hl sD" d="M${x + (r + 3) * Math.sin(b)},${y - (r + 3) * Math.cos(b)} L${x + (r + 6) * Math.sin(b)},${y - (r + 6) * Math.cos(b)}"/>`; }
      s += `<path class="${cls}" d="M${x},${y} L${x + (r - 3) * Math.sin(a)},${y - (r - 3) * Math.cos(a)}"/><circle cx="${x}" cy="${y}" r="${r + 8}" fill="transparent"/></g>`;
      s += segC(label, x, y + 26, 4.4, cls, .8) + segC(v.toFixed(2), x, y + 34, 7, "sW", 1.1);
      s += btn(id + "-", "-", x - 30, y - 8, 10, "o", 14) + btn(id + "+", "+", x + 20, y - 8, 10, "o", 14);
      return s;
    }
    function meter(x, y, rss, best) {
      const ratio = rss / best, n = 24, lit = Math.max(0, Math.min(n, Math.round(n * (1 - Math.min(1, Math.log(ratio) / Math.log(12))))));
      let s = seg("LEFTOVERS", x, y - 12, 4.4, "sW", .8);
      for (let i = 0; i < n; i++) s += `<rect class="${i < n - lit ? (i < 8 ? "fR" : i < 16 ? "fA" : "fG") : "hl sD"}" x="${x + i * 7}" y="${y}" width="5" height="12"/>`;
      const on = ratio <= 1.02;
      s += `<circle class="${on ? "fG" : "hl sD"}" cx="${x + n * 7 + 14}" cy="${y + 6}" r="6"/>` + seg("FIT", x + n * 7 + 24, y + 3, 5, on ? "sG" : "sM", .9);
      return s;
    }

    /* ---------- the stages ---------- */
    function draw() {
      let s = header();
      if (S.done) { s += finale(); svg.innerHTML = s; return; }
      if (S.stage <= 5) {
        s += plotFrame() + dataLine();
        const { xa, xi } = (S.stage >= 1) ? model() : { xa: null, xi: null };
        if (S.stage >= 1 && S.stage <= 2) {
          // overlay the square waves (or the stamped humps) on the data, scaled to sit on it
          const sc = 1.0;
          s += line(xa.map(v => v * sc + 0.15), S.hrf ? "sG" : "hl sG", S.hrf ? 1.2 : .9) + line(xi.map(v => v * sc + 0.15), S.hrf ? "sB" : "hl sB", S.hrf ? 1.2 : .9);
        }
        if (S.stage >= 3) {
          const { A, I, B } = S.k, fit = xa.map((v, i) => A * v + I * xi[i] + B);
          for (let i = 0; i < NV; i += 1) s += `<path class="hl sR" opacity=".55" d="M${tx(i * TR).toFixed(1)},${yv(D.y[i]).toFixed(1)} L${tx(i * TR).toFixed(1)},${yv(fit[i]).toFixed(1)}"/>`;
          s += line(fit, "sA", 1.6);
        }
        s += sequencer(198);
        if (S.stage <= 2) s += prestonLog(242);
        s += stageControls();
      } else if (S.stage === 6) s += layers();
      else if (S.stage === 7) s += paper();
      svg.innerHTML = s;
    }
    function stageControls() {
      const st = S.stage;
      if (st === 0) return btn("clear", "CLEAR", 520, 246, 80, "o") + btn("check", "CHECK IT", 520, 270, 80, "w");
      if (st === 1) return btn("left", "< EARLIER", 496, 246, 64, "o") + btn("right", "LATER >", 564, 246, 64, "o") + btn("aligned", "LINED UP", 520, 270, 80, "w");
      if (st === 2) return `<g transform="translate(560,264)">${hrfIcon()}</g>` + btn("stamp", "STAMP THE HRF", 470, 246, 130, "w");
      const { xa, xi } = model(), rss = RSS(D.y, xa, xi, [S.k.A, S.k.I, S.k.B]);
      let s = knob("A", "ATTEND", "sG", 74, 262, S.k.A, 0, 2) + knob("I", "IGNORE", "sB", 164, 262, S.k.I, 0, 2) + knob("B", "BASELINE", "sW", 254, 262, S.k.B, -1, 1);
      if (st <= 4) s += meter(310, 262, rss, D.fit.rss);
      if (st === 3) s += btn("next4", "THAT'S THE FIT", 520, 270, 100, S.lampSeen ? "g" : "o");
      if (st === 4) s += btn("solve", S.lampSeen ? "SOLVE (YOU DIDN'T NEED ME)" : "SOLVE", 470, 270, 156, "w");
      if (st === 5) s += seesaw();
      return s;
    }
    function hrfIcon() {   // the thunderhead stamp: the canonical HRF, drawn small
      let d = ""; for (let t = 0; t <= 30; t += 0.5) d += `${t ? "L" : "M"}${t * 2.2},${-hrf(t) * 220}`;
      return `<path class="sA" d="${d}"/><path class="hl sD" d="M0,0 L68,0"/>${seg("HRF", 0, 6, 4, "sA", .7)}`;
    }
    function seesaw() {
      // ATTEND vs IGNORE as a balance; the tilt follows t, so it barely moves
      const f = D.fit, ang = Math.max(-18, Math.min(18, f.t * 6)), cx = 400, cy = 276;
      let s = `<g transform="rotate(${ang} ${cx} ${cy})"><path class="sW" d="M${cx - 66},${cy} L${cx + 66},${cy}"/>
        <rect class="hl sG" x="${cx - 64}" y="${cy - 2 - f.beta[0] * 26}" width="22" height="${f.beta[0] * 26}"/><rect class="hl sB" x="${cx + 42}" y="${cy - 2 - f.beta[1] * 26}" width="22" height="${f.beta[1] * 26}"/>
        <path class="sG" d="M${cx - 53},${cy - 2 - (f.beta[0] + 1.96 * f.seA) * 26} L${cx - 53},${cy - 2 - (f.beta[0] - 1.96 * f.seA) * 26}"/>
        <path class="sB" d="M${cx + 53},${cy - 2 - (f.beta[1] + 1.96 * f.seI) * 26} L${cx + 53},${cy - 2 - (f.beta[1] - 1.96 * f.seI) * 26}"/></g>`;
      s += `<path class="sW" d="M${cx - 7},${cy + 14} L${cx},${cy + 2} L${cx + 7},${cy + 14} Z"/>`;
      s += segC("ATTEND", cx - 53, cy + 18, 4.4, "sG", .8) + segC("IGNORE", cx + 53, cy + 18, 4.4, "sB", .8);
      s += seg("ATTEND - IGNORE", 492, 238, 4.4, "sM", .8) + seg((f.beta[0] - f.beta[1] >= 0 ? "+" : "") + (f.beta[0] - f.beta[1]).toFixed(2), 492, 246, 12, "sW", 1.3);
      s += seg(`T = ${f.t.toFixed(2)}`, 560, 246, 5.5, "sA", 1) + seg(`P = ${f.p.toFixed(2).replace("0.", ".")}`, 560, 257, 5.5, "sA", 1);
      if (S.stage === 5) s += btn("layers", "LOOK FOR LAYERS", 492, 276, 132, "w", 16);
      return s;
    }
    function layers() {
      // a fold of cortex at 1 mm = 24 px: pial surface, six layer lines, white-matter boundary, a depth probe, and the 3T voxel grid
      const mm = 24, thick = 2 * mm, pial = (x) => 120 + 46 * Math.sin((x - 60) / 82);
      let s = seg("V1, CLOSE UP", 20, 34, 6, "sW", 1) + seg("1 MM = 24 PX", 120, 36, 4.4, "sM", .8);
      const path = (off, x0 = 30, x1 = 610) => { let d = ""; for (let x = x0; x <= x1; x += 6) d += `${x === x0 ? "M" : "L"}${x},${(pial(x) + off).toFixed(1)}`; return d; };
      s += `<path class="sK" d="${path(0)}"/>` + [1, 2, 3, 4, 5].map(i => `<path class="hl sK" d="${path(i * thick / 6)}"/>`).join("") + `<path class="sW" d="${path(thick)}"/>`;
      s += seg("PIAL SURFACE", 470, pial(470) - 16, 4.4, "sK", .8) + seg("WHITE MATTER", 470, pial(470) + thick + 8, 4.4, "sW", .8);
      // voxel grid aligned so one 3 mm voxel holds the whole cortex at the probe
      const vox = 3 * mm, px = 300, top = pial(px) - (vox - thick) / 2, gy0 = top - vox * 2, gx0 = px - vox / 2 - vox * 4;
      const gTop = Math.max(46, gy0), gBot = gy0 + vox * 4;
      for (let x = gx0; x <= 640; x += vox) if (x >= 20) s += `<path class="hl dash sA" d="M${x},${gTop} L${x},${gBot}"/>`;
      for (let y = gy0; y <= gBot; y += vox) if (y >= 46) s += `<path class="hl dash sA" d="M${Math.max(20, gx0)},${y} L620,${y}"/>`;
      s += `<rect class="sA" x="${px - vox / 2}" y="${top}" width="${vox}" height="${vox}"/>`;
      s += seg("ONE 3T VOXEL", px + vox / 2 + 6, top + 4, 5, "sA", .9) + seg("3 MM", px + vox / 2 + 6, top + 14, 5, "sA", .9);
      // depth probe with six ticks
      const p0 = pial(px); s += `<path class="sW mech" d="M${px},${p0 - 6} L${px},${p0 + thick + 6}"/>`;
      for (let i = 0; i < 6; i++) s += `<path class="hl sW" d="M${px - 4},${p0 + (i + .5) * thick / 6} L${px + 4},${p0 + (i + .5) * thick / 6}"/>` + seg(String(i + 1), px - 14, p0 + (i + .5) * thick / 6 - 2.5, 4, "sM", .7);
      s += seg("CORTEX 2 MM", px - 92, p0 + thick / 2 - 3, 5, "sK", .9);
      if (S.layerFit) {
        s += `<rect class="k sW" x="40" y="236" width="400" height="54"/>` + seg("FIT PER LAYER", 52, 244, 5, "sW", .9);
        for (let i = 0; i < 6; i++) s += seg(`L${i + 1}`, 52 + i * 62, 258, 5, "sM", .9) + seg(D.fit.beta[0].toFixed(2), 52 + i * 62, 268, 8, "sA", 1.1);
        s += seg("SIX LAYERS. ONE VOXEL. THE SAME NUMBER SIX TIMES.", 52, 282, 4.4, "sR", .8);
        s += btn("paper", "COMPARE TO HIS PAPER", 470, 270, 150, "w");
      } else s += btn("perlayer", "FIT PER LAYER", 470, 270, 150, "w");
      return s;
    }
    function paper() {
      // Preston's Figure 3, in a journal frame. Three panels, three tells.
      let s = `<rect class="k sW" x="14" y="30" width="612" height="258"/>` + seg("VALU ET AL.  FIGURE 3   LAMINAR SYNERGY AT 7T", 24, 38, 5.5, "sW", .9);
      // (a) depth profile
      const bx = 30, by = 60, bw = 180, bh = 150, prof = { A: [1.6, 1.0, 1.0, 1.0, 1.6, 1.6], I: [1, 1, 1, 1, 1, 1] };
      const px = (i) => bx + 20 + i * 28, py = (v) => by + bh - 20 - (v - 0.6) * 70;
      s += `<g data-tell="veins" style="cursor:pointer"><rect class="hl ${S.tells.veins ? "sG" : "sD"}" x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="transparent"/>`;
      s += seg("A  DEPTH PROFILE", bx + 6, by + 6, 4.4, "sM", .8) + seg("PIAL", bx + 12, by + bh - 12, 4, "sM", .7) + seg("WM", bx + bw - 26, by + bh - 12, 4, "sM", .7);
      for (const [k, cls] of [["A", "sG"], ["I", "sB"]]) s += `<path class="${cls}" d="${prof[k].map((v, i) => `${i ? "L" : "M"}${px(i)},${py(v)}`).join(" ")}"/>` + prof[k].map((v, i) => `<path class="hl ${cls}" d="M${px(i) - 2},${py(v) - 1} L${px(i) + 2},${py(v) - 1} M${px(i) - 2},${py(v) + 1} L${px(i) + 2},${py(v) + 1}"/>`).join("");
      if (S.tells.veins) { const honest = [1.75, 1.5, 1.3, 1.15, 1.02, 0.92]; s += `<path class="sA dash" d="${honest.map((v, i) => `${i ? "L" : "M"}${px(i)},${py(v)}`).join(" ")}"/>` + seg("REAL GE-BOLD: LOUDEST AT THE SURFACE", bx + 6, by + 18, 3.8, "sA", .7); }
      s += `</g>`;
      // (b, d) layer time courses with copy-pasted noise
      const r = rng(7), noise = Array.from({ length: 64 }, () => (r() - .5) * 0.08), cx0 = 230, cw = 200;
      const course = (y0, amp) => noise.map((n, i) => { const t = i * 4; const on = (t % 64) < 32 ? 1 : 0; return `${i ? "L" : "M"}${cx0 + 10 + i * 2.9},${(y0 - (on * amp + n) * 40).toFixed(1)}`; }).join(" ");
      s += `<g data-tell="copy" style="cursor:pointer"><rect class="hl ${S.tells.copy ? "sG" : "sD"}" x="${cx0}" y="${by}" width="${cw}" height="${bh}" fill="transparent"/>`;
      s += seg("B  LAYER 2", cx0 + 6, by + 6, 4.4, "sM", .8) + `<path class="sG" d="${course(by + 66, 0.6)}"/>`;
      s += seg("D  LAYER 5", cx0 + 6, by + 80, 4.4, "sM", .8) + `<path class="sG" d="${course(by + 140, 1.0)}"/>`;
      if (S.tells.copy) s += `<path class="sA" d="${noise.map((n, i) => `${i ? "L" : "M"}${cx0 + 10 + i * 2.9},${(by + 104 - n * 160).toFixed(1)}`).join(" ")}"/>` + seg("SAME WIGGLES. SUBTRACT: 0.000", cx0 + 6, by + 92, 3.8, "sA", .7);
      s += `</g>`;
      // (c) the fit, and its leftovers
      const fx = 450, fw = 160;
      s += `<g data-tell="clean" style="cursor:pointer"><rect class="hl ${S.tells.clean ? "sG" : "sD"}" x="${fx}" y="${by}" width="${fw}" height="${bh}" fill="transparent"/>`;
      s += seg("C  MODEL FIT + RESIDUALS", fx + 6, by + 6, 4.4, "sM", .8);
      s += `<path class="sA" d="M${fx + 10},${by + 60} L${fx + 40},${by + 60} L${fx + 46},${by + 30} L${fx + 76},${by + 30} L${fx + 82},${by + 60} L${fx + 112},${by + 60} L${fx + 118},${by + 30} L${fx + 150},${by + 30}"/>`;
      s += `<path class="hl sR" d="M${fx + 10},${by + 100} L${fx + 150},${by + 100}"/>` + seg("RESIDUALS", fx + 10, by + 106, 3.8, "sR", .7);
      if (S.tells.clean) { let d = ""; for (let i = 0; i < 70; i++) d += `${i ? "L" : "M"}${fx + 10 + i * 2},${(by + 128 + (D.y[i] - D.fit.beta[0] * XA[i] - D.fit.beta[1] * XI[i] - D.fit.beta[2]) * 22).toFixed(1)}`;
        s += `<path class="sW" d="${d}"/>` + seg("YOURS. REAL DATA WOBBLE.", fx + 10, by + 140, 3.8, "sW", .7); }
      s += `</g>`;
      const found = Object.values(S.tells).filter(Boolean).length;
      s += seg("FIND THREE THINGS NO REAL DATA WOULD DO. CLICK A PANEL.", 30, 222, 5, "sW", .9);
      [["clean", "TOO CLEAN"], ["copy", "COPY-PASTE NOISE"], ["veins", "NO DRAINING VEINS"]].forEach(([k, l], i) => {
        s += S.tells[k] ? chip(l, 30 + i * 150, 240, 6, "fG") : `<rect class="hl sD" x="${29 + i * 150}" y="238.5" width="${segW(l, 6) + 8}" height="13"/>${seg("?", 32 + i * 150, 241, 6, "sM", 1)}`; });
      if (found === 3) s += btn("finish", "WRITE IT UP", 470, 262, 140, "g");
      return s;
    }
    function finale() {
      let s = chip("THE REPLICATION", 20, 40, 7, "fA");
      s += seg("ATTENTION EFFECT IN V1", 20, 70, 5, "sM", .9) + seg("NONE", 20, 80, 40, "sW", 2.2);
      s += seg(`ATTEND ${D.fit.beta[0].toFixed(2)}   IGNORE ${D.fit.beta[1].toFixed(2)}   T = ${D.fit.t.toFixed(2)}   P = ${D.fit.p.toFixed(2).replace("0.", ".")}`, 20, 134, 6, "sA", 1);
      s += seg("LAYERS RESOLVED AT 3T", 20, 160, 5, "sM", .9) + seg("ZERO", 20, 170, 24, "sR", 1.8);
      s += seg("TELLS IN HIS FIGURE", 220, 160, 5, "sM", .9) + seg("3/3", 220, 170, 24, "sG", 1.8);
      s += seg(`H-INDEX +${S.total}`, 20, 214, 9, "sA", 1.2);
      s += btn("close", "CLOSE", 520, 262, 100, "w");
      return s;
    }

    /* ---------- input ---------- */
    let drag = null;
    function cellClick(row, t) {
      if (S.stage !== 0) return;
      const list = S.blocks[row], hit = list.findIndex(o => t >= o && t < o + 16);
      if (hit >= 0) { list.splice(hit, 1); sfx("cancel"); }
      else { const other = row === "A" ? "I" : "A"; if (t + 16 > 256 || list.length >= 4) { sfx("nudge", { f: 300 }); return; }
        if ([...list, ...S.blocks[other]].some(o => t < o + 16 && o < t + 16)) { sfx("nudge", { f: 300 }); return; } list.push(t); sfx("select"); }
      draw();
    }
    const KR = { A: [0, 2], I: [0, 2], B: [-1, 1] };
    function nudge(id, d) { const [lo, hi] = KR[id], was = S.k[id]; S.k[id] = Math.round(Math.max(lo, Math.min(hi, S.k[id] + d * 0.05)) * 100) / 100;
      if (S.k[id] !== was) sfx("ktick", { v: (S.k[id] - lo) / (hi - lo) }); afterKnob(); }
    function afterKnob() {
      if (S.stage === 3) { const { xa, xi } = model(), rss = RSS(D.y, xa, xi, [S.k.A, S.k.I, S.k.B]);
        if (rss <= D.fit.rss * 1.02 && !S.lampSeen) { S.lampSeen = true; sfx("lamp"); add("fitByHand", 3); coach("GUS", "That's it. The leftovers can't get much smaller. You just ran a GLM by hand. Press THAT'S THE FIT."); } }
      draw();
    }
    async function press(id) {
      if (id === "clear") { S.blocks = { A: [], I: [] }; sfx("cancel"); draw(); return; }
      if (id === "check") {
        if (!matchesLog()) { sfx("bad"); coach("GUS", "That's not what the log says. Four ATTEND blocks, four IGNORE blocks, 16 seconds each. Read the times again."); return; }
        add("log", 2); S.stage = 1; sfx("good");
        if (aligned()) { add("timing", 2); add("timingBonus", 1); S.stage = 2; coach("NELL", "The log is in scanner time. The data start after four dummy scans, so I took eight seconds off every block before I entered them."); }
        else coach("GUS", "Now lay your blocks over the data. Look at where the signal rises, and where your blocks start.");
        draw(); return;
      }
      if (id === "left" || id === "right") { S.shift += id === "left" ? -1 : 1; sfx("nudge", { f: id === "left" ? 780 : 980 }); draw(); return; }
      if (id === "aligned") {
        if (!aligned()) { sfx("bad"); coach("GUS", S.shift === 0 ? "Look: the signal starts climbing before your blocks even begin. Every block is late by the same amount. Read the bottom of his log." : "Closer. Slide them until every block starts exactly where the stimulus did. Each click is one scan, two seconds."); return; }
        add("timing", 2); S.stage = 2; sfx("good");
        coach("NELL", "Dummies. The scanner throws away the first four volumes, eight seconds, and his log counts from the scanner start. The data clock and the scanner clock aren't the same clock.");
        draw(); return;
      }
      if (id === "stamp") {
        S.hrf = true; add("hrf", 2); S.stage = 3; sfx("stamp");
        coach("GUS", "Neurons answer instantly. Blood arrives about five seconds later, lingers, then dips. Lightning, then thunder. Now stretch each template until it lies on the data: turn the knobs.");
        draw(); return;
      }
      if (id === "next4") {
        if (!S.lampSeen) { sfx("cancel"); coach("GUS", "Not yet. Watch the leftovers: the red lines between the data and your fit. Make them as short as you can."); return; }
        S.stage = 4; sfx("select"); coach("GUS", "Now let MATLAB do it. It does exactly what you just did, but instantly. That's all 'running a GLM' means."); draw(); return;
      }
      if (id === "solve") {
        S.k = { A: +D.fit.beta[0].toFixed(2), I: +D.fit.beta[1].toFixed(2), B: +D.fit.beta[2].toFixed(2) }; S.solved = true; add("solve", 1); S.stage = 5; sfx("compute"); sfx("seesaw");
        coach("GUS", "Same picture in both blocks. The only difference is attention. So ATTEND minus IGNORE is the attention effect.");
        setTimeout(() => { coach("NELL", "It's not a small effect. It's no effect."); }, 2600);
        add("contrast", 2); draw(); return;
      }
      if (id === "layers") {
        S.stage = 6; sfx("whoosh"); coach("GUS", "His paper says six layers. V1 is about two millimeters thick. A 3T voxel is about three millimeters on a side. Like measuring the six layers of a cake with a spoon bigger than the cake.");
        draw(); return;
      }
      if (id === "perlayer") { S.layerFit = true; sfx("compute"); add("layers", 2); coach("NELL", "One voxel. One number. Six times. So where did his six layers come from?"); draw(); return; }
      if (id === "paper") { S.stage = 7; sfx("paper"); coach("GUS", "Here's his Figure 3. Real measurements wobble, drift and disagree. Find three things no real data would do."); draw(); return; }
      if (id === "finish") {
        S.done = true; add("replication", 2); sfx("chime");
        coach("MORRIS", "So the fancy layers?");
        setTimeout(() => coach("NELL", "Painted on."), 2200);
        draw(); return;
      }
      if (id === "close") { cleanup(); resolve({ tells: S.tells, score: S.total }); return; }
      if (id === "fork") {
        const i = S.forks++; sfx("compute");
        if (i === 0) coach("GUS", "Nell. That button is how this whole building got here.");
        else coach("NELL", `${FORKS[i]}…  P = ${String(FORK_P[i]).replace("0.", ".")}`);
        if (i === 13) {
          coach("NELL", "P = .049. It's… significant?");
          const r = await die("You found significance on the fourteenth try.\n\nA pneumatic canister lands on your desk: an invitation, sealed with a circle inside a circle. The Round Table has noticed your potential. Your earbuds arrive Friday.\n\nINDUCTED EARLY.");
          if (r === "revise") { S.forks = 0; coach("GUS", "Revised and resubmitted. One analysis. The one we planned."); draw(); }
          return;
        }
        draw(); return;
      }
    }
    function tell(k) {
      if (S.tells[k]) return;
      S.tells[k] = true; add("tell_" + k, 3); sfx("stamp");
      const L = { clean: "His leftovers are a flat line. Real fMRI noise drifts and wobbles every two seconds. Yours do. His don't.",
        copy: "Layer 2 and layer 5 have the same noise. Wiggle for wiggle. Six layers, one noise.",
        veins: "Real gradient-echo BOLD is loudest at the surface, because the blood drains outward into the veins up there. His profile has no slope at all. The top floor always gets the most water pressure. His building has no plumbing." };
      coach(k === "veins" ? "GUS" : "NELL", L[k]); draw();
    }
    const onDown = (e) => {
      const b = e.target.closest && e.target.closest("[data-b]");
      if (b) { const id = b.dataset.b; if (/^[AIB][+-]$/.test(id)) nudge(id[0], id[1] === "+" ? 1 : -1); else press(id); return; }
      const c = e.target.closest && e.target.closest("[data-cell]"); if (c) { const [row, t] = c.dataset.cell.split(":"); cellClick(row, +t); return; }
      const k = e.target.closest && e.target.closest("[data-knob]");
      if (k && S.stage === 3) { drag = { id: k.dataset.knob, y: e.clientY, acc: 0 }; e.preventDefault(); return; }
      const t = e.target.closest && e.target.closest("[data-tell]"); if (t && S.stage === 7) tell(t.dataset.tell);
    };
    const onMove = (e) => { if (!drag) return; const r = svg.getBoundingClientRect(), unit = r.height / 360 * 5;
      const steps = Math.trunc((drag.y - e.clientY) / unit); if (steps) { drag.y -= steps * unit; nudge(drag.id, steps); } };
    const onUp = () => { drag = null; };
    const onWheel = (e) => { const k = e.target.closest && e.target.closest("[data-knob]"); if (!k || S.stage !== 3) return; e.preventDefault(); nudge(k.dataset.knob, e.deltaY < 0 ? 1 : -1); };
    function cleanup() { svg.removeEventListener("pointerdown", onDown); window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); svg.removeEventListener("wheel", onWheel); root.innerHTML = ""; }
    svg.addEventListener("pointerdown", onDown); window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp);
    svg.addEventListener("wheel", onWheel, { passive: false });

    // test hook
    root.__glm = { S, D, press, tell, nudge, LOG_ONSETS, TRUE_ONSETS, cellClick };
    coach("GUS", "Preston's run log. Enter his blocks on the timeline: click a cell to start a 16-second block. Green row for ATTEND, blue for IGNORE. Then CHECK IT.");
    draw();
  });
}
