// VISION BASICS: the standard measures of a vision lab, in versions that work on an uncalibrated screen. A SCREEN SIZE
// tile (a bank card held to the screen, and the viewing distance) turns the console's nominal 36 px per degree into real
// degrees for this shelf; luminance stays uncalibrated, so contrasts are nominal (8-bit grey levels on a gamma-encoded
// screen) and the results worth comparing are within a run: thresholds across conditions, shapes of curves.
// Thresholds are found with QUEST (Watson & Pelli, 1983): a Bayesian staircase over log threshold with a Weibull
// psychometric function, each trial placed at the posterior mean.
// Includes Lu & Dosher's equivalent-noise method (threshold vs external noise, fitted with the perceptual template model).
import { mean, median, nelderMead, linFit } from "./fit.js";
import { dichoptic, getView } from "./rivalry.js";

const GROUP = "VISION BASICS";
const FONT = "'Saira Condensed', sans-serif";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const f2 = (v, d = 2) => isFinite(v) ? v.toFixed(d) : "-";
const askLen = (ctx, prompt, q, f) => ctx.choose(prompt + " How long?", [["q", q], ["f", f]]).then(k => k === "q");
const label = (g, t, x, y, col = "#e9e6ff", size = 22) => { g.fillStyle = col; g.font = `600 ${size}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, x, y); };
const cross = (ctx, col = "#000") => { const g = ctx.g; g.fillStyle = col; g.fillRect(ctx.cx - 7, ctx.cy - 1, 14, 2); g.fillRect(ctx.cx - 1, ctx.cy - 7, 2, 14); };
const gamma = { "2afc": .5 };

/* ================= SCREEN SIZE: real degrees from a bank card and a tape measure ================= */
const SKEY = "gaincontrol.console.screen";
const CARD_MM = 85.6;                                       // ISO/IEC 7810 ID-1: a bank card is 85.60 × 53.98 mm
const getScreen = () => { try { return JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { return null; } };
const dispK = (ctx) => { const r = ctx.canvas.getBoundingClientRect(); return Math.min(r.width / ctx.W, r.height / ctx.H) || 1; };   // CSS px per canvas px
// pixels (of the stimulus canvas) per degree: measured if SCREEN SIZE has been run, else the console's nominal 36
export function ppdOf(ctx) {
  const s = getScreen(); if (!s || !s.cssPerMm || !s.cm) return { ppd: ctx.ppd, real: false };
  const pxPerMm = s.cssPerMm / dispK(ctx), mmPerDeg = 2 * s.cm * 10 * Math.tan(Math.PI / 360);
  return { ppd: pxPerMm * mmPerDeg, real: true };
}
const degNote = (P) => P.real ? "IN REAL DEGREES" : "NOMINAL DEGREES (RUN SCREEN SIZE)";
export const SCREEN_SIZE = { id: "screensize", group: GROUP, tag: "START HERE", title: "Screen size",
  sub: "A bank card and a tape measure: real degrees for this shelf.",
  ref: ["Li, Q., Joo, S. J., Yeatman, J. D., & Reinecke, K. (2020). Controlling for participants' viewing distance in large-scale, psychophysical online experiments using a virtual chinrest. Scientific Reports, 10, 904."],
  blurb: "Sizes in degrees need the screen's pixel size and your viewing distance. Hold any bank or ID card to the screen and match its outline, then type how far your eyes are from the screen. Kept on this device; redo it if you change screens or zoom.",
  instructions: { lines: ["Hold a bank card, library card or ID card (they're all the same size) flat against the screen, over the outline.", "Use < and > (or the arrow keys) until the outline matches the card's width exactly.", "Then sit the way you'll sit for the experiments, measure from your eyes to the screen, and type it in centimetres. 57 cm is the classic: there, 1 cm on the screen is 1 degree."], keys: [["< >", "SHRINK / GROW THE CARD"], ["ENTER", "IT MATCHES"]] },
  async run(ctx) {
    const g = ctx.g; let w = getScreen()?.cssPerMm ? getScreen().cssPerMm / dispK(ctx) * CARD_MM : 330;
    ctx.say("Hold a card to the screen. < and > until the outline matches its width; ENTER when it does.");
    for (;;) {
      ctx.clear(0); const h = w * 53.98 / CARD_MM, x = ctx.cx - w / 2, y = ctx.cy - h / 2;
      g.strokeStyle = "#e9e6ff"; g.lineWidth = 2; g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, w * .037) : g.rect(x, y, w, h); g.stroke();
      g.strokeStyle = "#7b7890"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + h + 18); g.lineTo(x + w, y + h + 18); g.stroke();
      label(g, "85.6 MM", ctx.cx, y + h + 34, "#7b7890", 16); ctx.status(`${Math.round(w)} PX`);
      const r = await ctx.key(["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Enter", "dn", "up", "ok", "dn5", "up5"], { buttons: [["dn5", "<<"], ["dn", "<"], ["up", ">"], ["up5", ">>"], ["ok", "MATCHES"]], quiet: true });
      if (r.key === "Enter" || r.key === "ok") break;
      w = clamp(w + ({ ArrowLeft: -1, dn: -1, ArrowRight: 1, up: 1, ArrowDown: -8, dn5: -8, ArrowUp: 8, up5: 8 }[r.key] || 0), 60, ctx.W - 20);
    }
    ctx.clear(0); ctx.status("");
    const cm = await ctx.number("Your eyes to the screen, in centimetres (57 is the classic).");
    const s = { cssPerMm: w * dispK(ctx) / CARD_MM, cm: clamp(cm, 15, 400), at: new Date().toISOString() };
    try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) { /* this run only */ }
    const P = ppdOf(ctx); ctx.clear(0);
    label(ctx.g, `${f2(P.ppd, 1)} PIXELS PER DEGREE`, ctx.cx, ctx.cy - 30, "#e9e6ff", 40);
    label(ctx.g, `THE CANVAS IS ${f2(ctx.W / P.ppd, 1)} × ${f2(ctx.H / P.ppd, 1)} DEGREES FROM ${s.cm} CM`, ctx.cx, ctx.cy + 26, "#7b7890", 22);
    ctx.say("Saved. Every tile on this shelf now sizes its stimuli in real degrees. Keep the window the same size, and sit at that distance.");
    ctx.csv("screen.csv", ["css_px_per_mm", "viewing_cm", "canvas_px_per_deg"], [[s.cssPerMm, s.cm, P.ppd]]);
  } };

/* ================= tools ================= */
// QUEST over log10(x): Weibull with slope beta, guess rate gam, lapse delta
export function quest({ lo, hi, guess, beta = 3.5, gam = .5, delta = .02, n = 240, sd = 1.2 }) {
  const T = Array.from({ length: n }, (_, i) => lo + (hi - lo) * i / (n - 1)), lp = T.map(t => -.5 * ((t - guess) / sd) ** 2);
  const P = (x, t) => delta * gam + (1 - delta) * (1 - (1 - gam) * Math.exp(-Math.pow(10, beta * (x - t))));
  const post = () => { const m = Math.max(...lp), w = lp.map(v => Math.exp(v - m)), s = w.reduce((a, b) => a + b, 0); return w.map(v => v / s); };
  return {
    next() { const w = post(); return clamp(T.reduce((a, t, i) => a + t * w[i], 0), lo, hi); },
    update(x, ok) { for (let i = 0; i < n; i++) { const p = clamp(P(x, T[i]), 1e-6, 1 - 1e-6); lp[i] += Math.log(ok ? p : 1 - p); } },
    mean() { const w = post(); return T.reduce((a, t, i) => a + t * w[i], 0); },
    sd() { const w = post(), m = this.mean(); return Math.sqrt(T.reduce((a, t, i) => a + (t - m) ** 2 * w[i], 0)); },
  };
}
// a Gabor on mid-grey, as a canvas (opaque; its edge is exactly the background)
const gcache = new Map();
export function gaborCanvas({ ppd, cpd, ori = 0, c = .5, sigma = .5, phase = 0, bg = .5 }) {
  const key = [ppd, cpd, ori, c, sigma, phase, bg].map(v => +(+v).toFixed(4)).join(); if (gcache.has(key)) return gcache.get(key);
  const sp = sigma * ppd, n = Math.ceil(sp * 3) * 2 + 1, cv = document.createElement("canvas"); cv.width = cv.height = n;
  const g = cv.getContext("2d"), im = g.createImageData(n, n), o = (n - 1) / 2, f = cpd / ppd * 2 * Math.PI, th = ori * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = x - o, dy = y - o, e = Math.exp(-(dx * dx + dy * dy) / (2 * sp * sp));
    // ori 0 = vertical stripes; positive = clockwise
    const v = bg * (1 + c * e * Math.sin((dx * cs + dy * sn) * f + phase)), i = (y * n + x) * 4, L = clamp(Math.round(255 * v + Math.random() - .5), 0, 255);   // dithered
    im.data[i] = im.data[i + 1] = im.data[i + 2] = L; im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); gcache.set(key, cv); if (gcache.size > 200) gcache.delete(gcache.keys().next().value); return cv;
}
const putC = (ctx, cv, x = ctx.cx, y = ctx.cy) => ctx.g.drawImage(cv, Math.round(x - cv.width / 2), Math.round(y - cv.height / 2));
// a 2IFC trial: two intervals with a tone-free blank between; draw(i) draws interval i's stimulus. → 0 or 1 (the interval chosen)
async function twoIFC(ctx, draw, { dur = 200, isi = 500, bg = .5, prompt = "Which interval? 1 or 2." } = {}) {
  for (let i = 0; i < 2; i++) {
    ctx.clear(bg); label(ctx.g, String(i + 1), ctx.cx, 40, "#000", 26); cross(ctx); await ctx.wait(isi);
    ctx.clear(bg); label(ctx.g, String(i + 1), ctx.cx, 40, "#000", 26); draw(i); await ctx.wait(dur);
    ctx.clear(bg); label(ctx.g, String(i + 1), ctx.cx, 40, "#000", 26); cross(ctx);
  }
  await ctx.wait(150); ctx.clear(bg); cross(ctx); ctx.say(prompt);
  const r = await ctx.key(["1", "2"], { buttons: [["1", "FIRST"], ["2", "SECOND"]] });
  return r.key === "1" ? 0 : 1;
}
const fb = async (ctx, ok, bg = .5) => { ctx.clear(bg); cross(ctx, ok ? "#1a7f4b" : "#a3263a"); await ctx.wait(250); };

/* ================= THE MEASURES ================= */

// ACUITY: the tumbling E, 4AFC, QUEST on log stroke width
function tumblingE(g, x, y, s, dir) {   // s = stroke width (px): the E is 5s × 5s; dir 0 right, 1 down, 2 left, 3 up (where the bars point)
  g.save(); g.translate(x, y); g.rotate(dir * Math.PI / 2); g.fillStyle = "#000";
  g.fillRect(-2.5 * s, -2.5 * s, s, 5 * s); for (const k of [0, 2, 4]) g.fillRect(-2.5 * s, -2.5 * s + k * s, 5 * s, s); g.restore();
}
export const ACUITY = { id: "acuity", group: GROUP, tag: "SNELLEN 1862", title: "Visual acuity",
  sub: "The tumbling E: which way does it point?",
  ref: ["Snellen, H. (1862). Probebuchstaben zur Bestimmung der Sehschärfe. Utrecht: Van de Weijer.", "Bailey, I. L., & Lovie, J. E. (1976). New design principles for visual acuity letter charts. American Journal of Optometry and Physiological Optics, 53(11), 740–745.",
    "Watson, A. B., & Pelli, D. G. (1983). QUEST: A Bayesian adaptive psychometric method. Perception & Psychophysics, 33(2), 113–120."],
  blurb: "Acuity is the smallest detail you can resolve. A tumbling E's bars and gaps are one stroke wide; 20/20 (logMAR 0) means resolving a stroke of 1 arcminute. Here QUEST finds the stroke size you get right 62.5% of the time, among four directions.",
  instructions: { lines: ["A black E appears in the middle, facing right, down, left or up (the way its three bars point). It gets smaller as you get them right.", "Press the arrow key for the way it faces. Guess when unsure: guessing is part of the method.", "Wear your usual glasses. Run SCREEN SIZE first for a real acuity; on a nominal screen the number is only relative. Screens limit the smallest E to about one pixel per stroke."], keys: [["ARROWS", "THE WAY THE E FACES"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Tumbling E.", "30 TRIALS", "60 TRIALS"), N = quick ? 30 : 60;
    const pxPerArcmin = P.ppd / 60, q = quest({ lo: Math.log10(1), hi: Math.log10(60), guess: Math.log10(Math.max(2, 2 * pxPerArcmin)), gam: .25 }), rows = [];
    const dirs = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    for (let t = 0; t < N; t++) {
      const s = Math.max(1, Math.round(Math.pow(10, q.next()))), dir = Math.floor(Math.random() * 4);
      ctx.clear(1); tumblingE(ctx.g, ctx.cx, ctx.cy, s, dir); ctx.say(`Trial ${t + 1} of ${N}: which way does the E face?`);
      const r = await ctx.key(dirs, { buttons: [["ArrowLeft", "LEFT"], ["ArrowUp", "UP"], ["ArrowDown", "DOWN"], ["ArrowRight", "RIGHT"]] });
      const ok = dirs.indexOf(r.key) === dir; q.update(Math.log10(s), ok); rows.push([t + 1, s, s / pxPerArcmin, ["right", "down", "left", "up"][dir], ok ? 1 : 0]);
      ctx.clear(1); await ctx.wait(200);
    }
    const sPx = Math.pow(10, q.mean()), mar = sPx / pxPerArcmin, logmar = Math.log10(mar), snellen = 20 * mar;
    ctx.clear(1); const g = ctx.g;
    label(g, `logMAR ${f2(logmar)}`, ctx.cx, ctx.cy - 60, "#000", 54); label(g, `about 20/${Math.round(snellen)}  ·  stroke ${f2(sPx, 1)} px = ${f2(mar)} arcmin`, ctx.cx, ctx.cy + 4, "#333", 26);
    label(g, P.real ? "measured in real degrees" : "nominal: run SCREEN SIZE for a real number", ctx.cx, ctx.cy + 50, "#555", 20);
    if (sPx < 1.6) label(g, "the screen's pixels may be the limit here: sit further back and run again", ctx.cx, ctx.cy + 86, "#a3263a", 20);
    ctx.say(`Threshold stroke ${f2(mar)} arcmin (logMAR ${f2(logmar)}). Normal adult vision is around logMAR 0 or a little better, and a screen measure tends to read a bit worse than a lit chart.`);
    ctx.csv("acuity.csv", ["trial", "stroke_px", "stroke_arcmin", "direction", "correct"], rows);
  } };

// LETTER CONTRAST: Sloan letters at falling contrast (Pelli-Robson's idea), QUEST on log contrast, 10AFC
const SLOAN = "CDHKNORSVZ".split("");
export const LETTERCS = { id: "lettercs", group: GROUP, tag: "PELLI ET AL. 1988", title: "Letter contrast sensitivity",
  sub: "Big letters, fainter and fainter.",
  ref: ["Pelli, D. G., Robson, J. G., & Wilkins, A. J. (1988). The design of a new letter chart for measuring contrast sensitivity. Clinical Vision Sciences, 2(3), 187–199."],
  blurb: "The Pelli-Robson chart measures how faint a large letter can be and still be read: contrast sensitivity at the low spatial frequencies that matter for faces and steps. Ten letters, all equally legible; QUEST hunts your threshold.",
  instructions: { lines: ["A large grey letter appears on white. Which letter is it? It gets fainter as you get them right.", "Pick it from the ten buttons (or type it). If you can't see one, guess: one in ten is chance."], keys: [["C D H K N O R S V Z", "THE LETTER"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Letters.", "30 TRIALS", "50 TRIALS"), N = quick ? 30 : 50, size = Math.round(clamp(2.8 * P.ppd, 60, 300));
    const q = quest({ lo: -2.6, hi: 0, guess: -1.6, gam: .1, beta: 3 }), rows = [], keys = SLOAN.map(l => l.toLowerCase());
    for (let t = 0; t < N; t++) {
      const lc = q.next(), c = Math.pow(10, lc), L = pick(SLOAN), g = ctx.g;
      ctx.clear(1); const v = Math.round(255 * (1 - c)); g.fillStyle = `rgb(${v},${v},${v})`; g.font = `700 ${size}px "Helvetica Neue", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(L, ctx.cx, ctx.cy);
      ctx.say(`Trial ${t + 1} of ${N}: which letter?`);
      const r = await ctx.key(keys, { buttons: SLOAN.map(l => [l.toLowerCase(), l]) });
      const ok = r.key.toUpperCase() === L; q.update(lc, ok); rows.push([t + 1, L, c, r.key.toUpperCase(), ok ? 1 : 0]);
      ctx.clear(1); await ctx.wait(150);
    }
    const lcs = -q.mean(); ctx.clear(1);
    label(ctx.g, `LOG CS ${f2(lcs)}`, ctx.cx, ctx.cy - 40, "#000", 54); label(ctx.g, `threshold contrast ${f2(100 * Math.pow(10, -lcs), 1)}% (Weber, nominal)`, ctx.cx, ctx.cy + 20, "#333", 26);
    ctx.say(`Log contrast sensitivity ${f2(lcs)}. On the printed chart, normal adults score about 1.65 to 1.95; an 8-bit screen bottoms out near 2.4 (one grey level), so very good eyes can hit the floor.`);
    ctx.csv("letter_contrast.csv", ["trial", "letter", "contrast", "response", "correct"], rows);
  } };

// ORIENTATION DISCRIMINATION: clockwise or anticlockwise of a reference, at vertical and at 45° (the oblique effect too)
export const ORIDISC = { id: "oridisc", group: GROUP, tag: "HEELEY & TIMNEY 1988", title: "Orientation discrimination",
  sub: "Tilted clockwise or anticlockwise? Thresholds at vertical and oblique.",
  ref: ["Heeley, D. W., & Timney, B. (1988). Meridional anisotropies of orientation discrimination for sine wave gratings. Vision Research, 28(2), 337–344.", "Appelle, S. (1972). Perception and discrimination as a function of stimulus orientation: The \"oblique effect\" in man and animals. Psychological Bulletin, 78(4), 266–278."],
  blurb: "How small a tilt can you tell? Around vertical, a degree or less; around 45°, two or three times more. QUEST measures both, interleaved.",
  instructions: { lines: ["A striped patch flashes in the middle. It's tilted slightly clockwise or anticlockwise, either from vertical or from a 45° diagonal (a guide tick at the top shows which reference).", "Press RIGHT for clockwise, LEFT for anticlockwise. Guess when unsure."], keys: [["LEFT", "ANTICLOCKWISE"], ["RIGHT", "CLOCKWISE"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Two references, interleaved.", "60 TRIALS", "120 TRIALS"), N = quick ? 60 : 120;
    const Q = { 0: quest({ lo: -1.3, hi: 1.3, guess: 0, gam: .5 }), 45: quest({ lo: -1.3, hi: 1.3, guess: .3, gam: .5 }) }, rows = [];
    for (let t = 0; t < N; t++) {
      const ref = t % 2 ? 45 : 0, d = Math.pow(10, Q[ref].next()), sgn = Math.random() < .5 ? -1 : 1, ori = ref + sgn * d;
      ctx.clear(.5); const g = ctx.g, a = ref * Math.PI / 180; g.strokeStyle = "#000"; g.lineWidth = 2; g.beginPath(); g.moveTo(ctx.cx + Math.sin(a) * 1.9 * P.ppd, ctx.cy - Math.cos(a) * 1.9 * P.ppd); g.lineTo(ctx.cx + Math.sin(a) * 2.3 * P.ppd, ctx.cy - Math.cos(a) * 2.3 * P.ppd); g.stroke();
      cross(ctx); await ctx.wait(400);
      putC(ctx, gaborCanvas({ ppd: P.ppd, cpd: 3, ori, c: .5, sigma: .5, phase: Math.random() * 6.28 })); await ctx.wait(200);
      ctx.clear(.5); cross(ctx); ctx.say(`Trial ${t + 1} of ${N}: clockwise (RIGHT) or anticlockwise (LEFT) of the tick?`);
      const r = await ctx.key(["ArrowLeft", "ArrowRight"], { buttons: [["ArrowLeft", "ANTICLOCKWISE"], ["ArrowRight", "CLOCKWISE"]] });
      const ok = (r.key === "ArrowRight") === (sgn > 0); Q[ref].update(Math.log10(d), ok); rows.push([t + 1, ref, sgn * d, r.key === "ArrowRight" ? "cw" : "acw", ok ? 1 : 0]);
      await fb(ctx, ok);
    }
    const tV = Math.pow(10, Q[0].mean()), tO = Math.pow(10, Q[45].mean());
    ctx.plot({ title: "ORIENTATION DISCRIMINATION", x: { lo: 0, hi: 3, label: "REFERENCE", ticks: [] }, y: { lo: 0, hi: Math.max(2, tV, tO) * 1.3, label: "THRESHOLD (DEG, 75%)", ticks: [0, 1, 2, 3, 4, 5, 6] },
      series: [{ name: "VERTICAL", cls: "sG", pts: [[1, tV]] }, { name: "OBLIQUE 45°", cls: "sA", pts: [[2, tO]] }], notes: [[`OBLIQUE / VERTICAL ${f2(tO / tV)}×`, "sW"]] });
    ctx.say(`Vertical ${f2(tV)}°, oblique ${f2(tO)}°: the oblique effect, about ${f2(tO / tV, 1)}×. Heeley and Timney found discrimination two to three times better at the cardinals.`);
    ctx.csv("orientation_discrimination.csv", ["trial", "reference_deg", "offset_deg", "response", "correct"], rows);
  } };

// SPATIAL FREQUENCY DISCRIMINATION: 2IFC, which interval had finer stripes? Weber fraction
export const SFDISC = { id: "sfdisc", group: GROUP, tag: "REGAN ET AL. 1982", title: "Spatial frequency discrimination",
  sub: "Which patch had finer stripes? A Weber fraction of a few percent.",
  ref: ["Regan, D., Bartol, S., Murray, T. J., & Beverley, K. I. (1982). Spatial-frequency discrimination in normal vision and in patients with multiple sclerosis. Brain, 105(4), 735–754.", "Campbell, F. W., Nachmias, J., & Jukes, J. (1970). Spatial-frequency discrimination in human vision. Journal of the Optical Society of America, 60(4), 555–559."],
  blurb: "Two striped patches, one after the other: which had the finer stripes? People can tell a change of 3 to 6 percent in spatial frequency, and the fraction stays roughly constant across frequencies, a Weber's law for stripes.",
  instructions: { lines: ["Two patches of stripes flash one after the other (numbered 1 and 2). Which one had the finer, more closely spaced stripes?", "Press 1 or 2. Ignore the size of the patch and the contrast: they vary on purpose."], keys: [["1", "FIRST WAS FINER"], ["2", "SECOND WAS FINER"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Two base frequencies, interleaved.", "50 TRIALS", "100 TRIALS"), N = quick ? 50 : 100;
    const bases = [2, 6], Q = Object.fromEntries(bases.map(b => [b, quest({ lo: -2.3, hi: -.3, guess: -1.3, gam: .5 })])), rows = [];
    for (let t = 0; t < N; t++) {
      const b = bases[t % 2], w = Math.pow(10, Q[b].next()), hiFirst = Math.random() < .5, j = rnd(-.05, .05);
      const f = [b * Math.pow(1 + w, .5) * (1 + j), b / Math.pow(1 + w, .5) * (1 + j)], order = hiFirst ? [0, 1] : [1, 0];
      const ans = await twoIFC(ctx, (i) => putC(ctx, gaborCanvas({ ppd: P.ppd, cpd: f[order[i]], ori: 0, c: rnd(.35, .5), sigma: rnd(.55, .75), phase: Math.random() * 6.28 })), { prompt: `Trial ${t + 1} of ${N}: which had finer stripes?` });
      const ok = ans === (hiFirst ? 0 : 1); Q[b].update(Math.log10(w), ok); rows.push([t + 1, b, w, hiFirst ? 1 : 2, ans + 1, ok ? 1 : 0]); await fb(ctx, ok);
    }
    const res = bases.map(b => [b, 100 * Math.pow(10, Q[b].mean())]);
    ctx.plot({ title: "SF DISCRIMINATION", x: { lo: 1.4, hi: 9, log: true, label: "BASE FREQUENCY (C/DEG)", ticks: bases }, y: { lo: 0, hi: Math.max(10, ...res.map(r => r[1])) * 1.3, label: "WEBER FRACTION (%)", ticks: [0, 5, 10, 15, 20, 30] },
      series: [{ name: "THRESHOLD", cls: "sA", pts: res, line: true }], notes: [[degNote(P), "sM"]] });
    ctx.say(`Weber fractions ${f2(res[0][1], 1)}% at ${bases[0]} c/deg and ${f2(res[1][1], 1)}% at ${bases[1]}. Regan and colleagues found about 3 to 6 percent, fairly flat across frequency.`);
    ctx.csv("sf_discrimination.csv", ["trial", "base_cpd", "weber_fraction", "finer_interval", "response", "correct"], rows);
  } };

// CONTRAST DISCRIMINATION: the dipper
export const DIPPER = { id: "dipper", group: GROUP, tag: "LEGGE & FOLEY 1980", title: "The dipper",
  sub: "Adding a little contrast to a pedestal: easier first, then harder.",
  ref: ["Legge, G. E., & Foley, J. M. (1980). Contrast masking in human vision. Journal of the Optical Society of America, 70(12), 1458–1471.", "Nachmias, J., & Sansbury, R. V. (1974). Grating contrast: Discrimination may be better than detection. Vision Research, 14(10), 1039–1042."],
  blurb: "How much contrast must you add to a grating to tell the difference? On a faint pedestal, less than you'd need to see the grating at all (the dip: facilitation); on strong pedestals, more and more (masking, roughly Weber's law). The shape is the signature of a nonlinear contrast response, the kind divisive normalization produces.",
  instructions: { lines: ["Two patches of stripes flash one after the other. Both have the same base contrast (sometimes zero); one has a little extra.", "Which one had MORE contrast: 1 or 2? Pedestals are interleaved, so the base changes from trial to trial."], keys: [["1", "FIRST HAD MORE"], ["2", "SECOND HAD MORE"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Five pedestals, interleaved.", "100 TRIALS", "200 TRIALS"), N = quick ? 100 : 200;
    const peds = [0, .01, .03, .1, .3], Q = peds.map(p => quest({ lo: -3, hi: -.3, guess: p ? Math.log10(Math.max(.006, p * .25)) : -2, gam: .5, beta: 3 })), rows = [];
    for (let t = 0; t < N; t++) {
      const k = t % peds.length, p = peds[k], dc = Math.pow(10, Q[k].next()), first = Math.random() < .5, ph = Math.random() * 6.28;
      const ans = await twoIFC(ctx, (i) => putC(ctx, gaborCanvas({ ppd: P.ppd, cpd: 3, ori: 0, c: p + ((i === 0) === first ? dc : 0), sigma: .6, phase: ph })), { prompt: `Trial ${t + 1} of ${N}: which had more contrast?` });
      const ok = ans === (first ? 0 : 1); Q[k].update(Math.log10(dc), ok); rows.push([t + 1, p, dc, first ? 1 : 2, ans + 1, ok ? 1 : 0]); await fb(ctx, ok);
    }
    const th = peds.map((p, k) => [p, Math.pow(10, Q[k].mean())]), det = th[0][1];
    ctx.plot({ title: "CONTRAST DISCRIMINATION", x: { lo: .003, hi: .5, log: true, label: "PEDESTAL CONTRAST (0 PLOTTED AT .004)", ticks: [.01, .03, .1, .3] }, y: { lo: 0, hi: Math.max(...th.map(r => r[1])) * 1.3, label: "INCREMENT THRESHOLD", ticks: [0, .01, .02, .05, .1] },
      series: [{ name: "THRESHOLD", cls: "sA", pts: th.map(([p, v]) => [p || .004, v]), line: true }], hlines: [{ y: det, cls: "sG", label: "DETECTION" }], notes: [["NOMINAL CONTRAST (8-BIT, UNCALIBRATED)", "sM"]] });
    ctx.say(`Detection ${f2(det, 3)}. ${th.slice(1).some(r => r[1] < det) ? "Somewhere below that line is the dip: a faint pedestal made the increment easier." : "No dip this time (it's small and easily lost on an 8-bit screen)."} At high pedestals thresholds rise roughly in proportion: masking.`);
    ctx.csv("dipper.csv", ["trial", "pedestal", "increment", "target_interval", "response", "correct"], rows);
  } };

// EQUIVALENT NOISE (Lu & Dosher): orientation identification of a Gabor in external noise, thresholds at two accuracy
// levels per noise level, fitted with the perceptual template model
export const EQNOISE = { id: "eqnoise", group: GROUP, tag: "LU & DOSHER 1998", title: "Equivalent noise",
  sub: "Add noise to the screen to measure the noise in you.",
  ref: ["Lu, Z.-L., & Dosher, B. A. (1998). External noise distinguishes attention mechanisms. Vision Research, 38(9), 1183–1198.",
    "Lu, Z.-L., & Dosher, B. A. (2008). Characterizing observers using external noise and observer models: Assessing internal representations with external noise. Psychological Review, 115(1), 44–82.",
    "Pelli, D. G., & Farell, B. (1999). Why use noise? Journal of the Optical Society of America A, 16(3), 647–653."],
  blurb: "Threshold contrast versus the contrast of noise added to the display: flat while your own internal noise dominates, then rising once the screen's noise takes over. The knee is your equivalent internal noise. Lu and Dosher's perceptual template model fits thresholds at two accuracy levels to separate additive noise, multiplicative noise, template gain and nonlinearity.",
  instructions: { lines: ["A small striped patch flashes in a burst of grainy noise, tilted LEFT or RIGHT of vertical by 12°. Some trials have no noise, some a lot.", "Press LEFT or RIGHT for its tilt. Guess when unsure.", "Two staircases per noise level aim at 71% and 79% correct, the two points the model needs."], keys: [["LEFT", "TILTED LEFT"], ["RIGHT", "TILTED RIGHT"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await ctx.choose("Eight noise levels, two staircases each. How long?", [["q", "QUICK (240 TRIALS)"], ["f", "FULL (480 TRIALS)"]]) === "q";
    const NE = [0, .02, .04, .08, .12, .16, .25, .33], per = quick ? 15 : 30;
    // staircases: 2-down/1-up (≈70.7%) and 3-down/1-up (≈79.4%) on log contrast
    const S = []; NE.forEach((n, i) => [2, 3].forEach(k => S.push({ i, n, k, lc: Math.log10(n ? Math.max(.15, n * 1.5) : .15), run: 0, last: 0, rev: [], trials: 0 })));
    const order = shuffle(S.flatMap(s => Array(per).fill(s))), rows = [];
    const sig = .35 * P.ppd / 2.5, gN = Math.ceil(sig * 3) * 2 + 1, el = 2;                     // Gabor sd; noise elements 2 × 2 px
    const noiseCv = document.createElement("canvas"); noiseCv.width = noiseCv.height = gN; const gn = noiseCv.getContext("2d"), nIm = gn.createImageData(gN, gN);
    const gauss = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
    const frame = (c, n, ori) => {   // one frame: Gabor (contrast c, or none) plus fresh Gaussian noise (sd n, clipped at ±.5)
      const o = (gN - 1) / 2, f = 2 / P.ppd * 2 * Math.PI, th = ori * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th);
      for (let by = 0; by < gN; by += el) for (let bx = 0; bx < gN; bx += el) { const nz = n ? clamp(n * gauss(), -.5, .5) : 0;
        for (let y = by; y < Math.min(gN, by + el); y++) for (let x = bx; x < Math.min(gN, bx + el); x++) {
          const dx = x - o, dy = y - o, r2 = dx * dx + dy * dy, e = Math.exp(-r2 / (2 * sig * sig)), w = r2 < o * o ? 1 : 0;
          const v = .5 * (1 + (c * e * Math.sin((dx * cs + dy * sn) * f) + nz) * w), i = (y * gN + x) * 4, L = clamp(Math.round(255 * v + Math.random() - .5), 0, 255);
          nIm.data[i] = nIm.data[i + 1] = nIm.data[i + 2] = L; nIm.data[i + 3] = 255; } }
      gn.putImageData(nIm, 0, 0); return noiseCv; };
    for (let t = 0; t < order.length; t++) {
      const s = order[t], c = Math.min(1, Math.pow(10, s.lc)), ori = Math.random() < .5 ? -12 : 12;
      ctx.clear(.5); cross(ctx); ctx.say(`Trial ${t + 1} of ${order.length}: tilted LEFT or RIGHT?`); await ctx.wait(350);
      // noise, noise, signal + noise, noise, noise: two display frames each (Lu & Dosher's temporal sandwich)
      for (const sig1 of [0, 0, 1, 0, 0]) { putC(ctx, frame(sig1 ? c : 0, s.n, ori)); await ctx.frames(2); }
      ctx.clear(.5); cross(ctx);
      const r = await ctx.key(["ArrowLeft", "ArrowRight"], { buttons: [["ArrowLeft", "LEFT"], ["ArrowRight", "RIGHT"]] });
      const ok = (r.key === "ArrowRight") === (ori > 0); rows.push([t + 1, s.n, s.k === 2 ? .707 : .794, c, ori, ok ? 1 : 0]);
      // k-down / 1-up in 0.1 log steps (0.05 after two reversals)
      const step = s.rev.length >= 2 ? .05 : .1; let dir = 0;
      if (ok) { if (++s.run >= s.k) { s.run = 0; dir = -1; } } else { s.run = 0; dir = 1; }
      if (dir) { if (s.last && dir !== s.last) s.rev.push(s.lc); s.last = dir; s.lc = clamp(s.lc + dir * step, -2.7, 0); }
      await fb(ctx, ok);
    }
    const thr = (s) => Math.pow(10, s.rev.length >= 3 ? mean(s.rev.slice(-Math.min(6, s.rev.length - (s.rev.length % 2)))) : s.lc);
    const T = { 2: NE.map((n, i) => thr(S.find(s => s.i === i && s.k === 2))), 3: NE.map((n, i) => thr(S.find(s => s.i === i && s.k === 3))) };
    // the perceptual template model: c(d') = [ ((1 + Nm²) Next^(2γ) + Na²) / (1/d'² − Nm²) ]^(1/(2γ)) / β
    const dp = { 2: Math.SQRT2 * 0.5449, 3: Math.SQRT2 * 0.8193 };                        // d' for 70.7% and 79.4% correct, 2AFC
    const ptm = ([lb, g, lnm, lna], n, d) => { const b = Math.exp(lb), Nm = Math.exp(lnm), Na = Math.exp(lna), den = 1 / (d * d) - Nm * Nm; if (den <= 0) return NaN;
      return Math.pow(((1 + Nm * Nm) * Math.pow(Math.max(n, 1e-4), 2 * g) + Na * Na) / den, 1 / (2 * g)) / b; };
    const loss = (p) => { let s = 0; for (const k of [2, 3]) NE.forEach((n, i) => { const m = ptm(p, n, dp[k]); s += isFinite(m) && m > 0 ? (Math.log10(m) - Math.log10(T[k][i])) ** 2 : 10; }); return s; };
    const fit = nelderMead(loss, [Math.log(2), 1.5, Math.log(.2), Math.log(.01)], { iters: 2000 }), [lb, g, lnm, lna] = fit;
    const xs = NE.map(n => n || .01);
    ctx.plot({ title: "THRESHOLD VS EXTERNAL NOISE", x: { lo: .008, hi: .45, log: true, label: "EXTERNAL NOISE SD (0 PLOTTED AT .01)", ticks: [.02, .04, .08, .16, .33] }, y: { lo: 0, hi: Math.max(...T[3]) * 1.3, label: "THRESHOLD CONTRAST", ticks: [0, .1, .2, .4, .6, .8, 1] },
      series: [{ name: "70.7%", cls: "sG", pts: xs.map((x, i) => [x, T[2][i]]) }, { name: "79.4%", cls: "sA", pts: xs.map((x, i) => [x, T[3][i]]) },
        { name: "PTM 70.7", cls: "sG", pts: [], curve: (x) => ptm(fit, x, dp[2]) }, { name: "PTM 79.4", cls: "sA", pts: [], curve: (x) => ptm(fit, x, dp[3]) }],
      notes: [[`BETA ${f2(Math.exp(lb))}  GAMMA ${f2(g)}`, "sW"], [`NM ${f2(Math.exp(lnm))}  NA ${f2(Math.exp(lna), 3)}`, "sW"], ["NOMINAL CONTRAST", "sM"]] });
    ctx.say(`The flat stretch on the left is your internal noise winning; the rise on the right is the screen's. The model puts your additive internal noise at about ${f2(Math.exp(lna), 3)} in these contrast units. Attention, practice and age move different parameters (Lu & Dosher).`);
    ctx.csv("equivalent_noise.csv", ["trial", "external_noise_sd", "target_accuracy", "contrast", "tilt_deg", "correct"], rows);
  } };

// FLICKER: temporal contrast sensitivity (de Lange curve), 2IFC, at frame-locked frequencies
export const FLICKER = { id: "tcsf", group: GROUP, tag: "DE LANGE 1958", title: "Flicker sensitivity",
  sub: "How faint a flicker can you see, at slow and fast rates?",
  ref: ["de Lange, H. (1958). Research into the dynamic nature of the human fovea–cortex systems with intermittent and modulated light. I. Attenuation characteristics with white and colored light. Journal of the Optical Society of America, 48(11), 777–784.", "Kelly, D. H. (1961). Visual responses to time-dependent stimuli. I. Amplitude sensitivity measurements. Journal of the Optical Society of America, 51(4), 422–429."],
  blurb: "The temporal cousin of the contrast sensitivity function: sensitivity to flicker rises from slow rates to a peak around 8 to 15 Hz, then falls steeply. A screen refreshing 60 times a second can show flicker up to 15 Hz cleanly; that's the range here.",
  instructions: { lines: ["A disc flickers faintly in one of two intervals. Which one: 1 or 2?", "Different rates are mixed. Keep your eyes on the cross."], keys: [["1", "FIRST FLICKERED"], ["2", "SECOND FLICKERED"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Five rates, interleaved.", "75 TRIALS", "150 TRIALS"), N = quick ? 75 : 150;
    // measure the refresh rate, then pick rates with a whole number of frames per cycle
    let t0 = performance.now(); await ctx.frames(30); const hz = Math.round(30000 / (performance.now() - t0));
    const rates = [...new Set([2, 4, 6, 10, 15].map(f => hz / Math.max(4, Math.round(hz / f))))].map(f => +f.toFixed(2));
    const Q = rates.map(() => quest({ lo: -2.5, hi: 0, guess: -1.5, gam: .5, beta: 3 })), rows = [], R = 2 * P.ppd;
    for (let t = 0; t < N; t++) {
      const k = t % rates.length, f = rates[k], c = Math.pow(10, Q[k].next()), first = Math.random() < .5, fpc = Math.round(hz / f);
      let ans = null;
      for (let i = 0; i < 2; i++) {
        ctx.clear(.5); label(ctx.g, String(i + 1), ctx.cx, 40, "#000", 26); cross(ctx); await ctx.wait(500);
        const on = (i === 0) === first, nf = Math.round(hz * .6);
        for (let fr = 0; fr < nf; fr++) { const env = Math.sin(Math.PI * fr / nf), v = .5 * (1 + (on ? c * env * Math.sin(2 * Math.PI * fr / fpc) : 0)), L = clamp(Math.round(255 * v), 0, 255);
          ctx.clear(.5); const g = ctx.g; g.fillStyle = `rgb(${L},${L},${L})`; g.beginPath(); g.arc(ctx.cx, ctx.cy, R, 0, Math.PI * 2); g.fill(); label(g, String(i + 1), ctx.cx, 40, "#000", 26); cross(ctx); await ctx.frames(1); }
      }
      ctx.clear(.5); cross(ctx); ctx.say(`Trial ${t + 1} of ${N}: which interval flickered?`);
      ans = (await ctx.key(["1", "2"], { buttons: [["1", "FIRST"], ["2", "SECOND"]] })).key === "1" ? 0 : 1;
      const ok = ans === (first ? 0 : 1); Q[k].update(Math.log10(c), ok); rows.push([t + 1, f, hz, c, ok ? 1 : 0]); await fb(ctx, ok);
    }
    const res = rates.map((f, k) => [f, 1 / Math.pow(10, Q[k].mean())]);
    ctx.plot({ title: "TEMPORAL SENSITIVITY", x: { lo: 1.5, hi: 20, log: true, label: "FLICKER RATE (HZ)", ticks: rates.map(r => Math.round(r)) }, y: { lo: 0, hi: Math.max(...res.map(r => r[1])) * 1.25, label: "SENSITIVITY (1 / CONTRAST)", ticks: [0, 10, 20, 50, 100, 200] },
      series: [{ name: "SENSITIVITY", cls: "sA", pts: res, line: true }], notes: [[`REFRESH ${hz} HZ`, "sM"], ["NOMINAL CONTRAST", "sM"]] });
    ctx.say("De Lange's curves rise from slow flicker to a peak near 8 to 15 Hz at bright light levels. A screen's limited brightness and refresh cut the curve short, so expect the rising part and maybe the peak.");
    ctx.csv("flicker_sensitivity.csv", ["trial", "rate_hz", "refresh_hz", "contrast", "correct"], rows);
  } };

// SPEED DISCRIMINATION: two drifting gratings, which was faster? (Weber fraction)
export const SPEED = { id: "speed", group: GROUP, tag: "MCKEE 1981", title: "Speed discrimination",
  sub: "Two drifting patches: which moved faster?",
  ref: ["McKee, S. P. (1981). A local mechanism for differential velocity detection. Vision Research, 21(4), 491–500.", "De Bruyn, B., & Orban, G. A. (1988). Human velocity and direction discrimination measured with random dot patterns. Vision Research, 28(12), 1323–1335."],
  blurb: "We can tell speeds apart by about 5 to 10 percent, over a wide range: another Weber's law. Durations and stripe spacing vary from trial to trial so that only speed tells them apart.",
  instructions: { lines: ["Two drifting striped patches, one after the other. Which moved FASTER: 1 or 2?", "Their duration and stripe spacing change randomly, so judge the speed itself."], keys: [["1", "FIRST WAS FASTER"], ["2", "SECOND WAS FASTER"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Two base speeds, interleaved.", "50 TRIALS", "100 TRIALS"), N = quick ? 50 : 100, bases = [2, 6];
    const Q = bases.map(() => quest({ lo: -2, hi: -.2, guess: -1, gam: .5 })), rows = [];
    for (let t = 0; t < N; t++) {
      const k = t % 2, b = bases[k], w = Math.pow(10, Q[k].next()), fastFirst = Math.random() < .5;
      const sp = [b * Math.sqrt(1 + w), b / Math.sqrt(1 + w)], order = fastFirst ? [0, 1] : [1, 0];
      for (let i = 0; i < 2; i++) {
        ctx.clear(.5); label(ctx.g, String(i + 1), ctx.cx, 40, "#000", 26); cross(ctx); await ctx.wait(500);
        const v = sp[order[i]], cpd = rnd(1.5, 2.5), dur = rnd(.3, .5), ph0 = Math.random() * 6.28, dir = Math.random() < .5 ? -1 : 1;
        await ctx.loop((tt) => { ctx.clear(.5); putC(ctx, gaborCanvas({ ppd: P.ppd, cpd: +cpd.toFixed(2), ori: 0, c: .5, sigma: .8, phase: +(ph0 + dir * 2 * Math.PI * cpd * v * tt).toFixed(2) })); label(ctx.g, String(i + 1), ctx.cx, 40, "#000", 26); return tt < dur; });
        ctx.clear(.5); cross(ctx);
      }
      ctx.say(`Trial ${t + 1} of ${N}: which moved faster?`);
      const r = await ctx.key(["1", "2"], { buttons: [["1", "FIRST"], ["2", "SECOND"]] }), ans = r.key === "1" ? 0 : 1;
      const ok = ans === (fastFirst ? 0 : 1); Q[k].update(Math.log10(w), ok); rows.push([t + 1, b, w, fastFirst ? 1 : 2, ans + 1, ok ? 1 : 0]); await fb(ctx, ok);
    }
    const res = bases.map((b, k) => [b, 100 * Math.pow(10, Q[k].mean())]);
    ctx.plot({ title: "SPEED DISCRIMINATION", x: { lo: 1.4, hi: 9, log: true, label: "BASE SPEED (DEG/S)", ticks: bases }, y: { lo: 0, hi: Math.max(15, ...res.map(r => r[1])) * 1.3, label: "WEBER FRACTION (%)", ticks: [0, 5, 10, 20, 30, 40] },
      series: [{ name: "THRESHOLD", cls: "sA", pts: res, line: true }], notes: [[degNote(P), "sM"]] });
    ctx.say(`Weber fractions ${f2(res[0][1], 1)}% and ${f2(res[1][1], 1)}%. McKee found about 5% across a wide range of speeds.`);
    ctx.csv("speed_discrimination.csv", ["trial", "base_deg_s", "weber_fraction", "faster_interval", "response", "correct"], rows);
  } };

// WEBER'S LAW FOR LIGHT: increment thresholds on backgrounds of different grey levels
export const WEBERLIGHT = { id: "weberlight", group: GROUP, tag: "WEBER 1834", title: "Weber's law for light",
  sub: "A brighter spot on a dim or bright background.",
  ref: ["Weber, E. H. (1834). De pulsu, resorptione, auditu et tactu: Annotationes anatomicae et physiologicae. Leipzig: Koehler.", "Barlow, H. B. (1957). Increment thresholds at low intensities considered as signal/noise discriminations. Journal of Physiology, 136(3), 469–488."],
  blurb: "On a brighter background you need a bigger increment to see a spot, and over a wide range the increment is a fixed fraction of the background: ΔI/I constant. The screen is uncalibrated, so this works in grey levels converted with a standard sRGB curve.",
  instructions: { lines: ["A faint spot, slightly brighter than the background, flashes in one of two intervals. Which one: 1 or 2?", "The background brightness changes between trials."], keys: [["1", "FIRST"], ["2", "SECOND"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Four backgrounds, interleaved.", "60 TRIALS", "120 TRIALS"), N = quick ? 60 : 120;
    const lin = (v) => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4), enc = (L) => L <= .0031308 ? 12.92 * L : 1.055 * Math.pow(L, 1 / 2.4) - .055;
    const bgs = [.08, .2, .45, .8].map(x => +x.toFixed(2)), Q = bgs.map(() => quest({ lo: -3, hi: 0, guess: -1.5, gam: .5, beta: 3 })), rows = [];
    for (let t = 0; t < N; t++) {
      const k = t % bgs.length, I = lin(bgs[k]), w = Math.pow(10, Q[k].next()), first = Math.random() < .5;
      const spot = enc(Math.min(1, I * (1 + w))), bg = bgs[k];
      const ans = await twoIFC(ctx, (i) => { if ((i === 0) === first) { const L = Math.round(255 * spot); ctx.g.fillStyle = `rgb(${L},${L},${L})`; ctx.g.beginPath(); ctx.g.arc(ctx.cx, ctx.cy - 1.2 * P.ppd, .5 * P.ppd, 0, Math.PI * 2); ctx.g.fill(); } },
        { bg, dur: 150, prompt: `Trial ${t + 1} of ${N}: which interval had the spot (above the cross)?` });
      const ok = ans === (first ? 0 : 1); Q[k].update(Math.log10(w), ok); rows.push([t + 1, bg, I, w, ok ? 1 : 0]); await fb(ctx, ok, bg);
    }
    const res = bgs.map((b, k) => [lin(b), Math.pow(10, Q[k].mean()) * lin(b)]);
    const fit = linFit(res.map(r => Math.log10(r[0])), res.map(r => Math.log10(r[1])));
    ctx.plot({ title: "INCREMENT THRESHOLDS", x: { lo: .004, hi: 1, log: true, label: "BACKGROUND (LINEAR, SRGB ESTIMATE)", ticks: [.01, .03, .1, .3, 1] }, y: { lo: 0, hi: Math.max(...res.map(r => r[1])) * 1.3, label: "INCREMENT THRESHOLD", ticks: [0, .01, .02, .05, .1] },
      series: [{ name: "INCREMENT", cls: "sA", pts: res, line: true }], notes: [[`LOG-LOG SLOPE ${f2(fit.m)}`, "sW"], ["1 = WEBER, 0.5 = DE VRIES-ROSE", "sM"]] });
    ctx.say(`A log-log slope of ${f2(fit.m)}. Weber's law is a slope of 1 (ΔI proportional to I); at dim levels vision drifts toward 0.5, the square-root law of quantum noise.`);
    ctx.csv("weber_light.csv", ["trial", "background_grey", "background_linear", "weber_fraction", "correct"], rows);
  } };

// STEREOACUITY: random-dot stereogram, which square is nearer? (uses the RIVALRY shelf's viewing setup)
export const STEREO = { id: "stereo", group: GROUP, tag: "JULESZ 1960", title: "Stereoacuity",
  sub: "Random dots, red/green glasses or a stereoscope: which square floats nearer?",
  ref: ["Julesz, B. (1960). Binocular depth perception of computer-generated patterns. Bell System Technical Journal, 39(5), 1125–1162.", "Westheimer, G. (1979). Cooperative neural processes involved in stereoscopic acuity. Experimental Brain Research, 36(4), 585–597."],
  blurb: "Two random-dot patterns, nearly identical, one per eye. A square region is shifted sideways in one eye: alone, each eye sees only noise; together, the square floats in depth. The smallest shift you can use is your stereoacuity, typically well under a minute of arc (here limited to whole pixels).",
  instructions: { lines: ["Uses the viewing setup from the RIVALRY shelf (red/green glasses or a stereoscope).", "Two squares hidden in the random dots, left and right. One of them floats NEARER than the other. Press LEFT or RIGHT for the nearer one.", "If you see no squares at all, the disparity is too small or the eyes aren't separated: guess, and the staircase will grow it."], keys: [["LEFT", "LEFT SQUARE NEARER"], ["RIGHT", "RIGHT SQUARE NEARER"]] },
  async run(ctx) {
    const v = getView(); if (!v.mode) { ctx.say("Run the VIEWING SETUP tile on the RIVALRY shelf first, so each eye gets its own image."); await ctx.key([" ", "Enter", "ok"], { buttons: [["ok", "OK"]] }); return; }
    const P = ppdOf(ctx), d = dichoptic(ctx, v), quick = await askLen(ctx, "Depth trials.", "30 TRIALS", "60 TRIALS"), N = quick ? 30 : 60, ES = 460, el = 3, rows = [];
    const scale = v.mode === "anaglyph" ? 1 : Math.min(1, (ctx.W / 2 - 10) / ES), arcPerPx = 60 / P.ppd / scale;   // arcmin per eye-canvas pixel
    let dis = 6, run = 0, last = 0; const rev = [];
    for (let t = 0; t < N; t++) {
      const near = Math.random() < .5 ? -1 : 1, n = Math.ceil(ES / el), dots = Array.from({ length: n * n }, () => Math.random() < .5);
      const sq = 120, cy = ES / 2, cxs = [ES / 2 - 110, ES / 2 + 110], D = Math.round(dis);
      const paint = (g, shiftFor) => { g.fillStyle = "#fff"; g.fillRect(0, 0, ES, ES); g.fillStyle = "#000";
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { let px = x * el, py = y * el;
          cxs.forEach((cx, si) => { if (px >= cx - sq / 2 && px < cx + sq / 2 && py >= cy - sq / 2 && py < cy + sq / 2) px += shiftFor(si); });
          if (dots[y * n + x]) g.fillRect(px, py, el, el); } };
      // crossed disparity (nearer): the left eye's copy shifts right, the right eye's left
      const sh = (eye) => (si) => { const isNear = (si === 0) === (near < 0); return isNear ? (eye === "L" ? D / 2 : -D / 2) : 0; };
      d.begin(1); paint(d.L, sh("L")); paint(d.R, sh("R")); d.lock(); d.show();
      ctx.say(`Trial ${t + 1} of ${N}: which square floats nearer?`);
      const r = await ctx.key(["ArrowLeft", "ArrowRight"], { buttons: [["ArrowLeft", "LEFT NEARER"], ["ArrowRight", "RIGHT NEARER"]] });
      const ok = (r.key === "ArrowLeft") === (near < 0); rows.push([t + 1, D, D * arcPerPx, near < 0 ? "left" : "right", ok ? 1 : 0]);
      let dir = 0; if (ok) { if (++run >= 2) { run = 0; dir = -1; } } else { run = 0; dir = 1; }
      if (dir) { if (last && dir !== last) rev.push(dis); last = dir; dis = clamp(dis * (dir < 0 ? .75 : 1.33), 2, 40); }
      d.begin(.5); d.lock(); d.show(); await ctx.wait(300);
    }
    const thrPx = rev.length >= 2 ? Math.exp(mean(rev.slice(-6).map(Math.log))) : dis, thr = thrPx * arcPerPx;
    ctx.plot({ title: "STEREOACUITY", x: { lo: 0, hi: N + 1, label: "TRIAL", ticks: [1, Math.round(N / 2), N] }, y: { lo: 0, hi: Math.max(...rows.map(r => r[2])) * 1.2, label: "DISPARITY (ARCMIN)", ticks: [0, 1, 2, 5, 10, 20, 40] },
      series: [{ name: "DISPARITY", cls: "sA", pts: rows.map(r => [r[0], r[2]]), line: true }], hlines: [{ y: thr, cls: "sG", label: "THRESHOLD" }],
      notes: [[`${f2(thr, 1)} ARCMIN = ${f2(thr * 60, 0)} ARCSEC`, "sW"], [`SMALLEST STEP: 2 PX = ${f2(2 * arcPerPx, 1)} ARCMIN`, "sM"], [degNote(P), "sM"]] });
    ctx.say(`Threshold about ${f2(thr * 60, 0)} arcseconds. Good stereo vision is 20 to 60 arcsec on clinical tests; here the screen's pixels set the floor at ${f2(2 * arcPerPx * 60, 0)} arcsec. A few people have little or no stereo vision at all.`);
    ctx.csv("stereoacuity.csv", ["trial", "disparity_px", "disparity_arcmin", "nearer", "correct"], rows);
  } };

// HUE ARRANGEMENT: a D-15-style cap test, drag to order; error score and confusion angle (Vingrys & King-Smith 1988)
const lab = (rgb) => { const lin = (v) => { v /= 255; return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  const [r, g, b] = rgb.map(lin), X = (r * .4124 + g * .3576 + b * .1805) / .95047, Y = r * .2126 + g * .7152 + b * .0722, Z = (r * .0193 + g * .1192 + b * .9505) / 1.08883;
  const f = (t) => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]; };
const fromLCh = (L, C, h) => { // CIELAB LCh → sRGB, clipped
  const a = C * Math.cos(h), b = C * Math.sin(h), fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200, inv = (t) => t ** 3 > .008856 ? t ** 3 : (t - 16 / 116) / 7.787;
  const X = inv(fx) * .95047, Y = inv(fy), Z = inv(fz) * 1.08883;
  const r = 3.2406 * X - 1.5372 * Y - .4986 * Z, g = -.9689 * X + 1.8758 * Y + .0415 * Z, bb = .0557 * X - .2040 * Y + 1.0570 * Z;
  const e = (v) => clamp(Math.round(255 * (v <= .0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - .055)), 0, 255); return [e(r), e(g), e(bb)]; };
export const HUES = { id: "hues", group: GROUP, tag: "FARNSWORTH 1947", title: "Hue arrangement",
  sub: "Put fifteen colour caps in order. A demonstration, not a diagnosis.",
  ref: ["Farnsworth, D. (1947). The Farnsworth Dichotomous Test for Color Blindness, Panel D-15. New York: Psychological Corporation.", "Vingrys, A. J., & King-Smith, P. E. (1988). A quantitative scoring technique for panel tests of color vision. Investigative Ophthalmology & Visual Science, 29(1), 50–63."],
  blurb: "Fifteen caps of equal lightness step round the hue circle. Arranging them in order is easy with normal colour vision; with a colour deficiency, caps across a confusion line get swapped, and the crossings line up at a telltale angle. Screen colours are uncalibrated, so treat this as a demonstration of the method, never a diagnosis.",
  instructions: { lines: ["A reference cap sits on the left. Below are fifteen loose caps in random order.", "Tap the cap that's closest in colour to the last one in the row, then the next closest, and so on, until the row is complete. UNDO takes the last one back.", "This screen isn't colour-calibrated: treat the result as a demonstration, not a test of your colour vision."], keys: [["TAP", "THE NEXT CLOSEST CAP"]] },
  async run(ctx) {
    const L = 60, C = 32, ref = fromLCh(L, C, 4.2), caps = Array.from({ length: 15 }, (_, i) => fromLCh(L, C, 4.2 - (i + 1) * 2 * Math.PI / 17));
    const loose = shuffle(caps.map((c, i) => ({ c, i }))), row = []; const g = ctx.g, R = 22;
    const pos = (k) => [70 + k * 54, 170], lpos = (k) => [70 + (k % 8) * 108 + (k >= 8 ? 54 : 0), 330 + (k >= 8 ? 90 : 0)];
    const draw = () => { ctx.clear(.12); label(g, "REFERENCE", 70, 120, "#7b7890", 16);
      const cap = (x, y, c, ring) => { g.fillStyle = `rgb(${c.join(",")})`; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill(); if (ring) { g.strokeStyle = "#e9e6ff"; g.lineWidth = 2; g.stroke(); } };
      cap(...pos(0), ref, true); row.forEach((o, k) => cap(...pos(k + 1), o.c));
      loose.forEach((o, k) => { if (!row.includes(o)) cap(...lpos(k), o.c); }); };
    ctx.say("Tap the cap closest to the last one in the row. UNDO takes one back.");
    for (;;) {
      draw(); if (row.length === 15) break;
      const p = await Promise.race([ctx.click(), ctx.key(["Backspace", "u"], { buttons: [["u", "UNDO"]], quiet: true }).then(() => "undo")]);
      if (p === "undo") { row.pop(); continue; }
      const k = loose.findIndex((o, j) => !row.includes(o) && Math.hypot(p.x - lpos(j)[0], p.y - lpos(j)[1]) < R + 6); if (k >= 0) { row.push(loose[k]); window.SFX && window.SFX.play("key"); }
    }
    // Vingrys & King-Smith: colour difference vectors between successive caps (incl. the reference) → moments of inertia
    const seq = [ref, ...row.map(o => o.c)].map(lab), vs = []; for (let i = 1; i < seq.length; i++) vs.push([seq[i][1] - seq[i - 1][1], seq[i][2] - seq[i - 1][2]]);
    const Sx = vs.reduce((a, [x]) => a + x * x, 0), Sy = vs.reduce((a, [, y]) => a + y * y, 0), Sxy = vs.reduce((a, [x, y]) => a + x * y, 0);
    const ang = .5 * Math.atan2(2 * Sxy, Sx - Sy), I0 = Sx * Math.cos(ang) ** 2 + Sy * Math.sin(ang) ** 2 + 2 * Sxy * Math.sin(ang) * Math.cos(ang), I1 = Sx + Sy - I0;
    const major = Math.sqrt(Math.max(I0, I1) / 15), minor = Math.sqrt(Math.min(I0, I1) / 15);
    const ideal = (() => { const s = [ref, ...caps].map(lab); let t = 0; for (let i = 1; i < s.length; i++) t += (s[i][1] - s[i - 1][1]) ** 2 + (s[i][2] - s[i - 1][2]) ** 2; return Math.sqrt(t / 15); })();
    const ci = major / ideal, crossings = row.reduce((a, o, k) => a + (k && Math.abs(o.i - row[k - 1].i) > 2 ? 1 : 0), 0);
    draw(); label(g, `CONFUSION INDEX ${f2(ci)}   ·   MAJOR CROSSINGS ${crossings}   ·   ANGLE ${f2(((I0 >= I1 ? ang : ang + Math.PI / 2) * 180 / Math.PI + 180) % 180 - 90, 0)}°`, ctx.cx, 250, "#e9e6ff", 22);
    ctx.say(ci < 1.6 ? "An orderly row: a confusion index near 1 means no systematic confusions. (Uncalibrated screen: a demonstration only.)" : "Several crossings. On a calibrated test, crossings lining up at one angle point to a type of colour deficiency; on an uncalibrated screen, colours can shift, so don't read anything into it.");
    ctx.csv("hue_arrangement.csv", ["position", "cap_number"], row.map((o, k) => [k + 1, o.i + 1]));
  } };

// AMSLER GRID: mark where the lines look wavy, blurred or missing
export const AMSLER = { id: "amsler", group: GROUP, tag: "AMSLER 1953", title: "Amsler grid",
  sub: "A grid of straight lines, one eye at a time. Mark anything that looks wrong.",
  ref: ["Amsler, M. (1953). Earliest symptoms of diseases of the macula. British Journal of Ophthalmology, 37(9), 521–537."],
  blurb: "The grid ophthalmologists hand out to check the central 10° of each eye: straight lines that should stay straight and complete while you look at the centre. A demonstration of the method; any real change in your vision is for an eye doctor, not this screen.",
  instructions: { lines: ["Cover one eye. Look only at the dot in the middle of the grid; don't move your eyes around.", "While looking at the dot, tap anywhere the lines look wavy, bent, blurred or missing. Tap DONE for that eye, then do the other.", "This is a demonstration of a clinical self-check, not a test: if you notice new distortion in your vision, see an eye doctor."], keys: [["TAP", "MARK A SPOT"], ["DONE", "NEXT EYE"]] },
  async run(ctx) {
    const P = ppdOf(ctx), side = Math.min(ctx.H - 40, 20 * P.ppd), cell = side / 20, x0 = ctx.cx - side / 2, y0 = ctx.cy - side / 2, rows = [];
    for (const eye of ["left", "right"]) {
      const marks = [];
      const draw = () => { ctx.clear(1); const g = ctx.g; g.strokeStyle = "#000"; g.lineWidth = 1.5;
        for (let i = 0; i <= 20; i++) { g.beginPath(); g.moveTo(x0 + i * cell, y0); g.lineTo(x0 + i * cell, y0 + side); g.moveTo(x0, y0 + i * cell); g.lineTo(x0 + side, y0 + i * cell); g.stroke(); }
        g.fillStyle = "#000"; g.beginPath(); g.arc(ctx.cx, ctx.cy, 5, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "#c2283f"; g.lineWidth = 2.5; for (const [mx, my] of marks) { g.beginPath(); g.arc(mx, my, 9, 0, Math.PI * 2); g.stroke(); } };
      ctx.say(`Cover your ${eye === "left" ? "RIGHT" : "LEFT"} eye; this is your ${eye.toUpperCase()} eye. Look at the dot, and tap anything that looks wrong. DONE when finished.`);
      for (;;) { draw(); const p = await Promise.race([ctx.click(), ctx.key(["Enter", "done"], { buttons: [["done", "DONE"]], quiet: true }).then(() => "done")]); if (p === "done") break;
        if (p.x >= x0 && p.x <= x0 + side && p.y >= y0 && p.y <= y0 + side) marks.push([p.x, p.y]); }
      for (const [mx, my] of marks) rows.push([eye, (mx - ctx.cx) / P.ppd, -(my - ctx.cy) / P.ppd]);
    }
    ctx.clear(1); label(ctx.g, rows.length ? `${rows.length} SPOT${rows.length > 1 ? "S" : ""} MARKED` : "NOTHING MARKED", ctx.cx, ctx.cy, "#000", 40);
    ctx.say(rows.length ? "Saved as positions in degrees from the centre (x right, y up). A demonstration only; if something in your vision has changed, an eye doctor is the person to see." : "Straight lines all round. (A demonstration of the method, not a test.)");
    ctx.csv("amsler.csv", ["eye", "x_deg", "y_deg"], rows);
  } };

// LINE BISECTION: pseudoneglect
export const BISECT = { id: "bisect", group: GROUP, tag: "JEWELL & MCCOURT 2000", title: "Line bisection",
  sub: "Tap the middle of each line. Most people miss slightly to the left.",
  ref: ["Jewell, G., & McCourt, M. E. (2000). Pseudoneglect: A review and meta-analysis of performance factors in line bisection tasks. Neuropsychologia, 38(1), 93–110.", "Bowers, D., & Heilman, K. M. (1980). Pseudo-neglect: Effects of hemispace on a tactile line bisection task. Neuropsychologia, 18(4–5), 491–498."],
  blurb: "Asked to mark the middle of a line, healthy people err slightly to the left on average: pseudoneglect, a small rightward bias of attention's opposite, attributed to the right hemisphere's role in spatial attention. Patients with right-hemisphere damage miss far to the right (neglect).",
  instructions: { lines: ["A horizontal line appears somewhere on the screen. Tap (or click) exactly where you think its middle is.", "Lines vary in length and position. Take your time; accuracy matters, not speed."], keys: [["TAP", "THE MIDDLE"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Line bisection.", "20 LINES", "40 LINES"), N = quick ? 20 : 40, rows = [];
    for (let t = 0; t < N; t++) {
      const len = rnd(200, 760), cx = ctx.cx + rnd(-60, 60), y = rnd(120, ctx.H - 120), g = ctx.g;
      ctx.clear(1); g.fillStyle = "#000"; g.fillRect(cx - len / 2, y - 2, len, 4); ctx.say(`Line ${t + 1} of ${N}: tap its middle.`);
      const p = await ctx.click(); const err = p.x - cx; rows.push([t + 1, len / P.ppd, err / P.ppd, 100 * err / len]);
      g.fillStyle = "#c2283f"; g.fillRect(p.x - 1, y - 14, 2, 28); await ctx.wait(250);
    }
    const errs = rows.map(r => r[3]), m = mean(errs), se = Math.sqrt(errs.reduce((a, v) => a + (v - m) ** 2, 0) / (errs.length - 1) / errs.length);
    ctx.plot({ title: "BISECTION ERROR", x: { lo: 0, hi: N + 1, label: "LINE", ticks: [1, Math.round(N / 2), N] }, y: { lo: Math.min(-6, ...errs) - 1, hi: Math.max(6, ...errs) + 1, label: "% OF LENGTH (+ RIGHT)", ticks: [-6, -3, 0, 3, 6] },
      series: [{ name: "ERROR", cls: "sA", pts: rows.map(r => [r[0], r[3]]) }], hlines: [{ y: 0, cls: "sM", label: "TRUE MIDDLE" }, { y: m, cls: "sG", label: "YOUR MEAN" }],
      notes: [[`MEAN ${f2(m)}% ± ${f2(se)}`, "sW"]] });
    ctx.say(`Mean error ${f2(m)}% of the line length (${m < 0 ? "left" : "right"}). The meta-analysis average is a small leftward error, about 1 to 2%.`);
    ctx.csv("line_bisection.csv", ["line", "length_deg", "error_deg", "error_pct"], rows);
  } };

// TILT AFTEREFFECT: adapt to a tilted grating, find the new subjective vertical
export const TAE = { id: "tae", group: GROUP, tag: "GIBSON & RADNER 1937", title: "Tilt aftereffect",
  sub: "Stare at a tilted grating; vertical tilts the other way.",
  ref: ["Gibson, J. J., & Radner, M. (1937). Adaptation, after-effect and contrast in the perception of tilted lines. I. Quantitative studies. Journal of Experimental Psychology, 20(5), 453–467.", "Clifford, C. W. G., Wenderoth, P., & Spehar, B. (2000). A functional angle on some after-effects in cortical vision. Proceedings of the Royal Society B, 267(1454), 1705–1710."],
  blurb: "After adapting to a grating tilted 15° clockwise, a vertical one looks tilted anticlockwise: orientation-tuned neurons near the adapter lose gain, shifting the population's vote. Measured here as the shift of your subjective vertical, adapted against unadapted.",
  instructions: { lines: ["First, quick judgements: is the grating tilted LEFT or RIGHT of vertical? That's your baseline.", "Then stare at the dot in the middle of a tilted grating for 30 seconds, and judge again (with short top-ups between).", "Press LEFT or RIGHT for the tilt you see."], keys: [["LEFT", "TILTED LEFT"], ["RIGHT", "TILTED RIGHT"]] },
  async run(ctx) {
    const P = ppdOf(ctx), quick = await askLen(ctx, "Baseline, then adapted.", "2 × 24 TESTS", "2 × 40 TESTS"), NT = quick ? 24 : 40, rows = [], res = {};
    const adapter = (ph) => gaborCanvas({ ppd: P.ppd, cpd: 1.5, ori: 15, c: .9, sigma: 1.4, phase: ph });
    for (const cond of ["baseline", "adapted"]) {
      if (cond === "adapted") { ctx.say("Adapting: keep your eyes on the dot for 30 seconds."); await ctx.loop((t) => { ctx.clear(.5); putC(ctx, adapter(Math.floor(t * 2) % 2 ? 0 : Math.PI)); cross(ctx); ctx.status(`ADAPTING ${Math.ceil(30 - t)} S`); return t < 30; }); ctx.status(""); }
      let tilt = cond === "adapted" ? 0 : 2, last = 0; const rev = [];
      for (let t = 0; t < NT; t++) {
        if (cond === "adapted") await ctx.loop((tt) => { ctx.clear(.5); putC(ctx, adapter(Math.floor(tt * 2) % 2 ? 0 : Math.PI)); cross(ctx); return tt < 4; });
        ctx.clear(.5); cross(ctx); await ctx.wait(250);
        putC(ctx, gaborCanvas({ ppd: P.ppd, cpd: 1.5, ori: tilt, c: .9, sigma: 1.4, phase: Math.random() * 6.28 })); cross(ctx); await ctx.wait(150);
        ctx.clear(.5); cross(ctx); ctx.say(`${cond === "adapted" ? "Adapted" : "Baseline"} ${t + 1} of ${NT}: tilted LEFT or RIGHT?`);
        const r = await ctx.key(["ArrowLeft", "ArrowRight"], { buttons: [["ArrowLeft", "LEFT"], ["ArrowRight", "RIGHT"]] }), right = r.key === "ArrowRight";
        rows.push([cond, t + 1, tilt, right ? "right" : "left"]);
        const dir = right ? -1 : 1; if (last && dir !== last) rev.push(tilt); last = dir; tilt = clamp(tilt + dir * (rev.length < 2 ? 1 : .5), -10, 10);
      }
      res[cond] = rev.length >= 2 ? mean(rev.slice(-6)) : tilt;
    }
    const tae = res.adapted - res.baseline;
    ctx.plot({ title: "TILT AFTEREFFECT", x: { lo: 0, hi: 3, label: "", ticks: [] }, y: { lo: Math.min(-1, res.baseline, res.adapted) - 1, hi: Math.max(4, res.baseline, res.adapted) + 1, label: "SUBJECTIVE VERTICAL (DEG CW)", ticks: [-2, 0, 2, 4, 6] },
      series: [{ name: "BASELINE", cls: "sG", pts: [[1, res.baseline]] }, { name: "AFTER 15° CW", cls: "sA", pts: [[2, res.adapted]] }], notes: [[`AFTEREFFECT ${f2(tae, 1)}°`, "sW"]] });
    ctx.say(`Subjective vertical moved ${f2(tae, 1)}° clockwise (toward the adapter's side means the test looked tilted away from it). Gibson and Radner's effect for a 15° adapter is typically 2 to 4°.`);
    ctx.csv("tilt_aftereffect.csv", ["block", "test", "tilt_deg_cw", "response"], rows);
  } };

export const BASICS = [SCREEN_SIZE, ACUITY, LETTERCS, ORIDISC, SFDISC, DIPPER, EQNOISE, FLICKER, SPEED, WEBERLIGHT, STEREO, HUES, AMSLER, BISECT, TAE];
