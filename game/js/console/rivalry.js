// BINOCULAR RIVALRY: a different image to each eye, and perception alternates between them. Two ways to get the images
// to the eyes, chosen once on the shelf's first tile (VIEWING SETUP) and kept on this device:
//   ANAGLYPH: red/green (or red/cyan) glasses. Each eye's image is drawn in grey, tinted red or green, and the two are
//     added; the glasses' filters split them again. A balance step matches the two eyes' brightness.
//   STEREOSCOPE: side by side, one half per eye, for a mirror or prism stereoscope (or free fusion). Fusion frames and
//     nonius lines set the separation; an option mirror-reverses the left half for single-mirror viewers.
// Each eye's image is drawn into its own 460 × 460 canvas (grey), at the console's nominal 36 px per degree.
// The replications lean on Randolph Blake's and Jan Brascamp's work: dominance statistics, Levelt's propositions as
// revised by Brascamp, Klink & Levelt (2015), suppression depth, adaptation during suppression (Blake & Fox, 1974),
// piecemeal rivalry and size (Blake, O'Shea & Mueller, 1992), travelling waves (Wilson, Blake & Lee, 2001),
// interocular grouping, flicker-and-swap, perceptual memory with intermittent presentation (Leopold et al., 2002;
// Brascamp et al., 2008), flash suppression and facilitation (Brascamp et al., 2007), and breaking CFS.
import { mean, median } from "./fit.js";

const KEY = "gaincontrol.console.dichoptic";
const DEF = { mode: null, redEye: "left", red: 1, green: .85, sep: 480, mirror: false };
export const getView = () => { try { return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) { return { ...DEF }; } };
const setView = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* kept for this run only */ } };
const ES = 460, PPD = 36;                                 // an eye's canvas, px; pixels per (nominal) degree
const FONT = "'Saira Condensed', sans-serif";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(1, a.length - 1)); };
const f2 = (v) => isFinite(v) ? v.toFixed(2) : "-";
const fS = (v) => isFinite(v) ? v.toFixed(1) + " S" : "-";
const ref = {
  levelt: "Levelt, W. J. M. (1965). On binocular rivalry. Soesterberg: Institute for Perception RVO-TNO.",
  primer: "Blake, R. (2001). A primer on binocular rivalry, including current controversies. Brain and Mind, 2(1), 5–38.",
  brascamp15: "Brascamp, J. W., Klink, P. C., & Levelt, W. J. M. (2015). The ‘laws’ of binocular rivalry: 50 years of Levelt’s propositions. Vision Research, 109, 20–37.",
  brascamp06: "Brascamp, J. W., van Ee, R., Noest, A. J., Jacobs, R. H. A. H., & van den Berg, A. V. (2006). The time course of binocular rivalry reveals a fundamental role of noise. Journal of Vision, 6(11), 8.",
};

/* ---------------- drawing an eye's image ---------------- */
const cache = new Map();
// a sine grating in a soft-edged circular (or annular) aperture, as a canvas: transparent outside
export function grating({ r = 54, r0 = 0, cpd = 3, ori = 45, c = .8, ph = 0, kind = "linear", edge = 3 } = {}) {
  const k = [r, r0, cpd, ori, c, ph, kind, edge].join(); if (cache.has(k)) return cache.get(k);
  const n = Math.ceil(r) * 2 + 2, cv = document.createElement("canvas"); cv.width = cv.height = n;
  const g = cv.getContext("2d"), im = g.createImageData(n, n), o = n / 2, f = cpd / PPD * 2 * Math.PI, th = ori * Math.PI / 180, cs = Math.cos(th), sn = Math.sin(th);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = x + .5 - o, dy = y + .5 - o, d = Math.hypot(dx, dy); if (d > r || d < r0) continue;
    const a = clamp(Math.min(r - d, r0 ? d - r0 : 1e9) / edge, 0, 1);
    const nRad = Math.max(4, Math.round(2 * Math.PI * (r + r0) / 2 / PPD * cpd));   // radial: whole cycles round the ring at its mean radius
    const phase = kind === "radial" ? Math.atan2(dy, dx) * nRad : kind === "concentric" ? d * f : (dx * cs + dy * sn) * f;
    const v = .5 + .5 * c * Math.sin(phase + ph), i = (y * n + x) * 4, L = Math.round(255 * v);
    im.data[i] = im.data[i + 1] = im.data[i + 2] = L; im.data[i + 3] = Math.round(255 * a);
  }
  g.putImageData(im, 0, 0); cache.set(k, cv); if (cache.size > 300) cache.delete(cache.keys().next().value); return cv;
}
const put = (g, img, x = ES / 2, y = ES / 2) => g.drawImage(img, Math.round(x - img.width / 2), Math.round(y - img.height / 2));
// what both eyes share, so the two images lock together: a frame of black and white squares round the edge, and a fixation dot
function fusionLock(g, fix = true) {
  const s = 12; for (let i = 0; i < ES / s; i++) for (const [x, y] of [[i * s, 0], [i * s, ES - s], [0, i * s], [ES - s, i * s]]) { g.fillStyle = (i % 2) ? "#000" : "#fff"; g.fillRect(x, y, s, s); }
  if (fix) { g.fillStyle = "#000"; g.fillRect(ES / 2 - 4, ES / 2 - 4, 8, 8); g.fillStyle = "#fff"; g.fillRect(ES / 2 - 2, ES / 2 - 2, 4, 4); }
}

/* ---------------- getting the two images to the two eyes ---------------- */
export function dichoptic(ctx, view = getView()) {
  const mk = () => { const c = document.createElement("canvas"); c.width = c.height = ES; return c; };
  const L = mk(), R = mk(), T = mk(), gl = L.getContext("2d"), gr = R.getContext("2d"), gt = T.getContext("2d");
  const tint = (src, rgb) => { gt.globalCompositeOperation = "copy"; gt.drawImage(src, 0, 0); gt.globalCompositeOperation = "multiply"; gt.fillStyle = rgb; gt.fillRect(0, 0, ES, ES); gt.globalCompositeOperation = "source-over"; return T; };
  return {
    L: gl, R: gr, view,
    // fresh eye canvases: grey background (bg), the fusion lock on top unless lock is false
    begin(bg = .5) { const v = Math.round(255 * bg); for (const g of [gl, gr]) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(0, 0, ES, ES); } },
    lock(fix = true) { fusionLock(gl, fix); fusionLock(gr, fix); },
    // put the two eyes' images on the screen
    show() {
      const g = ctx.g; ctx.clear(0);
      if (view.mode === "anaglyph") {
        const redL = view.redEye === "left", x = ctx.cx - ES / 2, y = ctx.cy - ES / 2;
        g.globalCompositeOperation = "lighter";
        g.drawImage(tint(redL ? L : R, `rgb(${Math.round(255 * view.red)},0,0)`), x, y);
        g.drawImage(tint(redL ? R : L, `rgb(0,${Math.round(255 * view.green)},0)`), x, y);
        g.globalCompositeOperation = "source-over";
      } else {
        const s = Math.min(1, (ctx.W / 2 - 10) / ES), w = ES * s, y = ctx.cy - w / 2, xl = ctx.cx - view.sep / 2 - w / 2, xr = ctx.cx + view.sep / 2 - w / 2;
        if (view.mirror) { g.save(); g.translate(xl + w, y); g.scale(-1, 1); g.drawImage(L, 0, 0, w, w); g.restore(); } else g.drawImage(L, xl, y, w, w);
        g.drawImage(R, xr, y, w, w);
      }
    },
  };
}

/* ---------------- VIEWING SETUP ---------------- */
async function setup(ctx, { quick = false } = {}) {
  const v = getView(), D = () => dichoptic(ctx, v);
  const mode = await ctx.choose("How will each eye get its own image?", [["anaglyph", "RED/GREEN GLASSES"], ["split", "STEREOSCOPE, SIDE BY SIDE"]]);
  v.mode = mode;
  if (mode === "anaglyph") {
    v.redEye = await ctx.choose("Which eye has the RED filter? (Red/cyan glasses usually have red on the left.)", [["left", "RED ON LEFT EYE"], ["right", "RED ON RIGHT EYE"]]);
    // which eye sees what: a word for each eye
    ctx.say("Glasses on. Each eye should get its own word: LEFT EYE for the left, RIGHT EYE for the right.");
    let d = D(); d.begin(0); for (const [g, t] of [[d.L, "LEFT EYE"], [d.R, "RIGHT EYE"]]) { g.fillStyle = "#fff"; g.font = `600 44px ${FONT}`; g.textAlign = "center"; g.fillText(t, ES / 2, t === "LEFT EYE" ? 170 : 300); }
    d.show(); await ctx.key([" ", "Enter", "ok"], { buttons: [["ok", "GOT IT"]] });
    ctx.say("Close one eye, then the other: each eye should see only its own word. A faint ghost of the other word means crosstalk: dim the room, or try the other colour order.");
    await ctx.key([" ", "Enter", "ok"], { buttons: [["ok", "NEXT"]] });
    // balance: each eye's half-disc, adjusted until they look equally bright through the glasses
    ctx.say("Balance. Both eyes open, glasses on. Make the two half-discs look equally bright: < dims the green one, > brightens it. ENTER when they match.");
    for (;;) {
      d = D(); d.begin(0);
      const half = (g, side) => { g.fillStyle = "#fff"; g.beginPath(); g.moveTo(ES / 2, ES / 2 - 120); g.arc(ES / 2, ES / 2, 120, -Math.PI / 2, Math.PI / 2, side < 0); g.closePath(); g.fill(); };
      const redL = v.redEye === "left"; half(redL ? d.L : d.R, -1); half(redL ? d.R : d.L, 1); d.show();
      ctx.status(`GREEN ${Math.round(v.green * 100)}%  RED ${Math.round(v.red * 100)}%`);
      const r = await ctx.key(["ArrowLeft", "ArrowRight", "Enter", "dn", "up", "ok"], { buttons: [["dn", "<"], ["up", ">"], ["ok", "MATCHED"]], quiet: true });
      if (r.key === "Enter" || r.key === "ok") break;
      const up = r.key === "ArrowRight" || r.key === "up";
      if (up) { if (v.green < 1) v.green = Math.min(1, v.green + .03); else v.red = Math.max(.3, v.red - .03); }
      else { if (v.red < 1) v.red = Math.min(1, v.red + .03); else v.green = Math.max(.3, v.green - .03); }
    }
  } else {
    v.mirror = (await ctx.choose("Does your stereoscope use one mirror (one image is seen reversed)?", [["n", "NO: TWO MIRRORS, PRISMS OR FREE FUSION"], ["y", "YES: FLIP THE LEFT IMAGE"]])) === "y";
    ctx.say("Look through the stereoscope. Move the two halves (< closer, > apart) until the square frames fuse into one and the two short lines meet in a straight vertical line. ENTER when they do.");
    for (;;) {
      const d = D(); d.begin(.5); d.lock(false);
      for (const [g, top] of [[d.L, true], [d.R, false]]) { g.fillStyle = "#000"; g.fillRect(ES / 2 - 2, top ? ES / 2 - 60 : ES / 2 + 6, 4, 54); g.fillRect(ES / 2 - 30, ES / 2 - 2, 60, 4); }
      d.show(); ctx.status(`SEPARATION ${v.sep} PX`);
      const r = await ctx.key(["ArrowLeft", "ArrowRight", "Enter", "dn", "up", "ok"], { buttons: [["dn", "<"], ["up", ">"], ["ok", "FUSED"]], quiet: true });
      if (r.key === "Enter" || r.key === "ok") break;
      v.sep = clamp(v.sep + (r.key === "ArrowRight" || r.key === "up" ? 8 : -8), ES * .6, ctx.W - 10);
    }
  }
  setView(v); ctx.status("");
  if (!quick) {
    const d = dichoptic(ctx, v); d.begin(.5); put(d.L, grating({ ori: 45 })); put(d.R, grating({ ori: -45 })); d.lock(); d.show();
    ctx.say("Done. Here's rivalry: one eye has a grating tilted left, the other tilted right. You should see one, then the other, rarely both. Saved for every tile on this shelf.");
    await ctx.key([" ", "Enter", "ok"], { buttons: [["ok", "DONE"]] });
  }
  return v;
}
// every experiment checks the viewing setup first (and offers to redo it)
async function ensure(ctx) {
  const v = getView();
  if (!v.mode) { ctx.say("First, the viewing setup: how your eyes will each get their own image."); await ctx.wait(900); return setup(ctx, { quick: true }); }
  const k = await ctx.choose(`Viewing: ${v.mode === "anaglyph" ? `red/green glasses (red on the ${v.redEye} eye)` : "stereoscope, side by side"}.`, [["go", "CONTINUE"], ["redo", "REDO SETUP"]]);
  return k === "redo" ? setup(ctx, { quick: true }) : v;
}

/* ---------------- tracking: press on every change ---------------- */
// keys: [[k, label, cls]] (2 or 3 percepts). draw(d, t) draws both eyes (d.begin … d.show is done for you).
// → { log: [{ p, t0, d, last }], full: completed percepts (the cut-off last one excluded) }
async function track(ctx, d, { keys, secs, draw, timer = true }) {
  const log = []; let cur = null, t0 = 0, ended = false, tStart = performance.now() / 1000;
  const listen = async () => { while (!ended) { const r = await ctx.key(keys.map(k => k[0]), { buttons: keys.map(k => [k[0], k[1]]), quiet: true }).catch(() => null); if (!r || ended) return;
      const t = performance.now() / 1000 - tStart; if (r.key !== cur) { if (cur) log.push({ p: cur, t0, d: t - t0 }); cur = r.key; t0 = t; ctx.status(`NOW: ${keys.find(k => k[0] === cur)[1]}`); } } };
  listen();
  await ctx.loop((t) => { draw(d, t); d.show(); if (timer) { const g = ctx.g; g.fillStyle = "#7b7890"; g.font = `500 16px ${FONT}`; g.textAlign = "right"; g.fillText(`${Math.max(0, Math.ceil(secs - t))} S`, ctx.W - 16, 26); } return t < secs; });
  ended = true; const tEnd = performance.now() / 1000 - tStart;
  if (cur) log.push({ p: cur, t0, d: tEnd - t0, last: true });
  ctx.status("");
  return { log, full: log.filter(l => !l.last && l.t0 > 0) };
}
const askLen = (ctx, prompt, q, f) => ctx.choose(prompt + " How long?", [["q", q], ["f", f]]).then(k => k === "q");
const durStats = (ds) => { const m = mean(ds), s = sd(ds); return { n: ds.length, m, sd: s, cv: s / m, k: m * m / (s * s), th: s * s / m }; };

/* ================= THE MODULES ================= */
const GROUP = "RIVALRY";
const VIEWKEYS = [["A", "LEFT-TILTED GRATING"], ["S", "A MIX OR PATCHWORK"], ["L", "RIGHT-TILTED GRATING"]];
const TRIKEYS = [["a", "LEFT TILT", "sG"], ["s", "MIXED", "sM"], ["l", "RIGHT TILT", "sA"]];

export const RIV_SETUP = { id: "rivsetup", group: GROUP, tag: "START HERE", title: "Viewing setup",
  sub: "Red/green glasses or a stereoscope: set it up once for the whole shelf.",
  ref: ["Wheatstone, C. (1838). Contributions to the physiology of vision. Part the first. On some remarkable, and hitherto unobserved, phenomena of binocular vision. Philosophical Transactions of the Royal Society of London, 128, 371–394.", ref.primer],
  blurb: "Rivalry needs a different image in each eye. Either wear red/green (or red/cyan) glasses, or view the two halves of the screen through a stereoscope. This sets it up, checks for crosstalk, and balances the eyes.",
  instructions: { lines: ["Binocular rivalry needs each eye to get its own picture. Two ways to do that here:", "RED/GREEN GLASSES: each eye's picture is drawn in one colour and the filters split them. Any red/cyan or red/green glasses work. You'll check for ghosts and match the brightness of the two eyes.",
    "STEREOSCOPE: one half of the screen per eye, through a mirror or prism stereoscope (or by free fusion, if you can). You'll line the halves up until they fuse.", "The setup is kept on this device for every experiment on this shelf. Redo it any time from this tile."], keys: [] },
  run: (ctx) => setup(ctx) };

// 1. dominance statistics: the basic phenomenon
export const RIV_BASIC = { id: "rivbasic", group: GROUP, tag: "BLAKE 2001", title: "Binocular rivalry",
  sub: "Two gratings, one per eye. Track which one you see.",
  ref: [ref.primer, ref.brascamp06, ref.levelt],
  blurb: "Different images in the two eyes don't blend: perception alternates between them every few seconds. Dominance durations are irregular, roughly gamma-distributed, and successive durations are nearly independent.",
  instructions: { lines: ["Each eye gets a grating: tilted left in one, tilted right in the other. Keep your eyes on the dot in the middle.", "Most of the time you'll see just one of them, then the other takes over. In between there can be a patchwork of both.",
    "Press the key for what you see as soon as it starts, and again every time it changes. Use MIXED for patchworks and blends."], keys: VIEWKEYS },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Rivalry tracking.", "60 SECONDS", "3 MINUTES"), T = quick ? 60 : 180;
    ctx.say("Report what you see, the whole time: A left tilt, S mixed, L right tilt. Press on every change.");
    const gA = grating({ ori: -45, c: .8 }), gB = grating({ ori: 45, c: .8 });
    const { full } = await track(ctx, d, { keys: TRIKEYS, secs: T, draw(d) { d.begin(); put(d.L, gA); put(d.R, gB); d.lock(); } });
    const ex = full.filter(l => l.p !== "s"), ds = ex.map(l => l.d), st = durStats(ds), mixT = full.filter(l => l.p === "s").reduce((a, l) => a + l.d, 0), totT = full.reduce((a, l) => a + l.d, 0);
    // successive exclusive durations: are they correlated? (lag-1 correlation)
    const lag = ds.length > 3 ? (() => { const a = ds.slice(0, -1), b = ds.slice(1), ma = mean(a), mb = mean(b); let num = 0, da = 0, db = 0; a.forEach((x, i) => { num += (x - ma) * (b[i] - mb); da += (x - ma) ** 2; db += (b[i] - mb) ** 2; }); return num / Math.sqrt(da * db); })() : NaN;
    const bins = 12, maxD = Math.max(4, Math.ceil(Math.max(0, ...ds))), w = maxD / bins;
    const hist = Array.from({ length: bins }, (_, i) => [i * w + w / 2, ds.filter(x => x >= i * w && x < (i + 1) * w).length / Math.max(1, ds.length) / w]);
    const gam = (x) => { const { k, th } = st; if (!(k > 0 && th > 0)) return NaN; const lg = (z) => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, .1208650973866179e-2, -.5395239384953e-5]; let y = z, t = z + 5.5; t -= (z + .5) * Math.log(t); let s = 1.000000000190015; for (const ci of c) s += ci / ++y; return -t + Math.log(2.5066282746310005 * s / z); };
      return Math.exp((k - 1) * Math.log(x) - x / th - k * Math.log(th) - lg(k)); };
    ctx.plot({ title: "DOMINANCE DURATIONS", x: { lo: 0, hi: maxD, label: "SECONDS", ticks: [0, maxD / 4, maxD / 2, 3 * maxD / 4, maxD].map(t => +t.toFixed(1)) },
      y: { lo: 0, hi: Math.max(.3, ...hist.map(h => h[1])) * 1.15, label: "DENSITY", ticks: [0] },
      series: [{ name: "EXCLUSIVE", cls: "sG", pts: hist, line: true }, { name: "GAMMA FIT", cls: "sA", pts: [], curve: gam }],
      notes: [[`N ${st.n}  MEAN ${fS(st.m)}`, "sW"], [`CV ${f2(st.cv)}  GAMMA SHAPE ${f2(st.k)}`, "sA"], [`LAG-1 CORRELATION ${f2(lag)}`, "sM"], [`MIXED ${totT ? Math.round(100 * mixT / totT) : 0}% OF THE TIME`, "sM"]] });
    ctx.say(st.n < 6 ? "Only a few switches: try a longer run, and press on every change." : `Typical rivalry: a skewed distribution (CV near 0.5, gamma shape a few), and successive durations nearly uncorrelated (yours ${f2(lag)}): each switch is close to a fresh roll of the dice, with noise doing much of the work.`);
    ctx.csv("rivalry.csv", ["percept", "onset_s", "duration_s"], full.map(l => [TRIKEYS.find(k => k[0] === l.p)[1], l.t0, l.d]));
  } };

// 2. Levelt's propositions, as Brascamp, Klink & Levelt (2015) restated them
export const RIV_LEVELT = { id: "rivlevelt", group: GROUP, tag: "BRASCAMP ET AL. 2015", title: "Levelt's propositions",
  sub: "Change one eye's contrast: whose dominance durations change?",
  ref: [ref.brascamp15, ref.levelt],
  blurb: "Levelt's second proposition, as Brascamp, Klink and Levelt restated it in 2015: making one eye's stimulus stronger mainly lengthens that stimulus's own dominance durations (the original wording said it shortens the other's). And making both stronger speeds up alternations (proposition IV).",
  instructions: { lines: ["Four short blocks of rivalry, the same tilted gratings, with different contrasts in the two eyes. Keep your eyes on the dot.", "In each block, press the key for the grating you see, and again every time it changes. MIXED for patchworks.",
    "Afterwards: the mean dominance duration of each eye's grating in each block. Which one changes when only one eye's contrast goes up?"], keys: VIEWKEYS },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Four blocks.", "4 × 40 SECONDS", "4 × 90 SECONDS"), T = quick ? 40 : 90;
    const conds = shuffle([[.25, .25], [.25, .5], [.25, 1], [1, 1]]), rows = [], res = [];
    for (let b = 0; b < conds.length; b++) {
      const [cL, cR] = conds[b]; ctx.say(`Block ${b + 1} of ${conds.length}. Press SPACE to start, then report: A left tilt, S mixed, L right tilt.`); await ctx.key([" ", "go"], { buttons: [["go", "START BLOCK"]] });
      const gA = grating({ ori: -45, c: cL }), gB = grating({ ori: 45, c: cR });
      const { full } = await track(ctx, d, { keys: TRIKEYS, secs: T, draw(d) { d.begin(); put(d.L, gA); put(d.R, gB); d.lock(); } });
      const by = (k) => full.filter(l => l.p === k).map(l => l.d);
      res.push({ cL, cR, mL: mean(by("a")), mR: mean(by("l")), n: full.filter(l => l.p !== "s").length, tot: full.reduce((a, l) => a + l.d, 0) });
      for (const l of full) rows.push([b + 1, cL, cR, TRIKEYS.find(k => k[0] === l.p)[1], l.t0, l.d]);
    }
    const order = [[.25, .25], [.25, .5], [.25, 1]].map(([a, c]) => res.find(r => r.cL === a && r.cR === c));
    const both = res.find(r => r.cL === 1 && r.cR === 1), low = order[0];
    ctx.plot({ title: "LEVELT II", x: { lo: .18, hi: 1.3, log: true, label: "RIGHT EYE CONTRAST (LEFT FIXED AT .25)", ticks: [.25, .5, 1] }, y: { lo: 0, hi: Math.max(4, ...order.flatMap(r => [r.mL, r.mR]).filter(isFinite)) * 1.2, label: "MEAN DOMINANCE (S)", ticks: [0, 1, 2, 3, 4, 6, 8].filter(t => t < 20) },
      series: [{ name: "LEFT EYE'S GRATING", cls: "sG", pts: order.map(r => [r.cR, r.mL]), line: true }, { name: "RIGHT EYE'S GRATING", cls: "sA", pts: order.map(r => [r.cR, r.mR]), line: true }],
      notes: [[`ALTERNATIONS / MIN, BOTH .25: ${f2(low.n / low.tot * 60)}`, "sW"], [`ALTERNATIONS / MIN, BOTH 1: ${f2(both.n / both.tot * 60)}`, "sW"], ["PROPOSITION IV: MORE CONTRAST IN BOTH EYES,", "sM"], ["FASTER ALTERNATION", "sM"]] });
    ctx.say("Revised proposition II predicts the right eye's line rises (its own durations lengthen as its contrast rises) while the left eye's stays flatter. Proposition IV: both eyes at full contrast should alternate faster than both at .25.");
    ctx.csv("levelt.csv", ["block", "contrast_left", "contrast_right", "percept", "onset_s", "duration_s"], rows);
  } };

// 3. suppression depth: a probe in the eye that's dominant, or suppressed
export const RIV_PROBE = { id: "rivprobe", group: GROUP, tag: "FOX & CHECK 1972", title: "Suppression depth",
  sub: "A probe is harder to see in the eye that's losing.",
  ref: ["Fox, R., & Check, R. (1972). Independence between binocular rivalry suppression duration and magnitude of suppression. Journal of Experimental Psychology, 92(2), 224–232.",
    "Nguyen, V. A., Freeman, A. W., & Alais, D. (2003). Increasing depth of binocular rivalry suppression along two visual pathways. Vision Research, 43(19), 2003–2008.", ref.primer],
  blurb: "During rivalry the suppressed eye isn't blind, just less sensitive. A small contrast pulse added to a grating is harder to detect while that grating is suppressed: the threshold ratio, suppressed over dominant, is the depth of suppression.",
  instructions: { lines: ["Rivalry between two tilted gratings. Watch the LEFT-TILTED one.", "When the left-tilted grating is clearly all you see, press A. When the right-tilted one has completely taken over, press L. Either way, a moment later a small bright spot may or may not flash on the left-tilted grating.",
    "Then say whether you saw the flash: Y yes, N no. Wait for clear moments; don't guess at mixtures."], keys: [["A", "LEFT-TILTED IS ALL I SEE"], ["L", "RIGHT-TILTED HAS TAKEN OVER"], ["Y / N", "SAW THE FLASH / DIDN'T"]] },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Probe trials.", "40 TRIALS", "80 TRIALS"), N = quick ? 40 : 80;
    const gA = grating({ ori: -45, c: .6 }), gB = grating({ ori: 45, c: .6 });
    const st = { dom: { c: .35, last: null, rev: [], streak: 0 }, sup: { c: .7, last: null, rev: [], streak: 0 } }, rows = [];
    let flash = null; const base = (d) => { d.begin(); put(d.L, gA); put(d.R, gB); d.lock(); if (flash) { const g = d.L, [x, y] = flash.at; g.globalAlpha = flash.c; g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; } };
    let stop = false; const anim = ctx.loop(() => { base(d); d.show(); return !stop; });
    try {
      for (let t = 0; t < N; t++) {
        ctx.say(`Trial ${t + 1} of ${N}. A when the left-tilted grating is all you see, L when the right-tilted has taken over.`);
        const r = await ctx.key(["a", "l"], { buttons: [["a", "LEFT-TILTED ONLY"], ["l", "RIGHT-TILTED ONLY"]] });
        const which = r.key === "a" ? "dom" : "sup", S = st[which], catchT = Math.random() < .2;
        await ctx.wait(rnd(150, 400));
        const ang = rnd(0, Math.PI * 2), rr = rnd(10, 36); flash = catchT ? null : { at: [ES / 2 + rr * Math.cos(ang), ES / 2 + rr * Math.sin(ang)], c: clamp(S.c, .02, 1) };
        await ctx.wait(160); flash = null;
        const y = await ctx.key(["y", "n"], { buttons: [["y", "SAW IT"], ["n", "DIDN'T"]] }), seen = y.key === "y";
        rows.push([t + 1, which === "dom" ? "dominant" : "suppressed", catchT ? 0 : S.c, catchT ? 1 : 0, seen ? 1 : 0]);
        if (catchT) continue;
        // 2-down 1-up on probe contrast (≈71% detection)
        let dir = 0;
        if (seen) { if (++S.streak >= 2) { S.streak = 0; dir = -1; } } else { S.streak = 0; dir = 1; }
        if (dir) { if (S.last && dir !== S.last) S.rev.push(S.c); S.last = dir; S.c = clamp(S.c * (dir < 0 ? .8 : 1.25), .02, 1); }
      }
    } finally { stop = true; await anim.catch(() => {}); }
    const thr = (S) => S.rev.length >= 2 ? Math.exp(mean(S.rev.slice(-6).map(Math.log))) : S.c;
    const tD = thr(st.dom), tS = thr(st.sup), depth = Math.log10(tS / tD), fa = rows.filter(r => r[3] === 1), faRate = fa.length ? mean(fa.map(r => r[4])) : NaN;
    ctx.plot({ title: "SUPPRESSION DEPTH", x: { lo: 0, hi: 3, label: "STATE OF THE PROBED GRATING", ticks: [] }, y: { lo: 0, hi: Math.max(.4, tS, tD) * 1.25, label: "PROBE THRESHOLD (ALPHA)", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "DOMINANT", cls: "sG", pts: [[1, tD]] }, { name: "SUPPRESSED", cls: "sR", pts: [[2, tS]] }],
      notes: [[`DEPTH ${f2(depth)} LOG UNITS`, "sW"], [`RATIO ${f2(tS / tD)}×`, "sW"], [`FALSE ALARMS ${isFinite(faRate) ? Math.round(faRate * 100) + "%" : "-"}`, "sM"]] });
    ctx.say(depth > .1 ? `Suppression costs you about ${f2(depth)} log units of sensitivity (×${f2(tS / tD)}): the losing eye still sees, just less. Classic values run around 0.3 to 0.5 log units.` : "Little difference here. Make sure you only press at clear moments, and that the glasses or stereoscope keep the eyes fully separate.");
    ctx.csv("suppression_depth.csv", ["trial", "state", "probe_alpha", "catch", "seen"], rows);
  } };

// 4. adaptation during suppression (tilt aftereffect)
export const RIV_ADAPT = { id: "rivadapt", group: GROUP, tag: "BLAKE & FOX 1974", title: "Adapting to the invisible",
  sub: "Does a grating you can't see still leave an aftereffect?",
  ref: ["Blake, R., & Fox, R. (1974). Adaptation to invisible gratings and the site of binocular rivalry suppression. Nature, 249, 488–490.",
    "Wade, N. J., & Wenderoth, P. (1978). The influence of colour and contour rivalry on the magnitude of the tilt after-effect. Vision Research, 18(7), 827–835."],
  blurb: "Blake and Fox adapted to gratings that were suppressed most of the time and found aftereffects as strong as from visible ones: adaptation happens before (or alongside) the site of rivalry. Here, a tilt aftereffect from an adapter that is visible, or mostly suppressed.",
  instructions: { lines: ["Two blocks. In each you'll adapt for a while: your LEFT eye sees a grating tilted clockwise; your right eye sees either nothing much (the grating stays visible) or a busy flickering pattern that hides it most of the time.",
    "While adapting, hold V (or the VISIBLE button) whenever you can see the tilted grating at all. Keep your eyes on the dot.", "Then quick tests: a nearly vertical grating flashes in the left eye. Was it tilted LEFT (A) or RIGHT (L) of vertical? After adapting to clockwise tilt, vertical tends to look tilted the other way."],
    keys: [["V", "HOLD WHILE THE GRATING IS VISIBLE"], ["A", "TEST TILTED LEFT"], ["L", "TEST TILTED RIGHT"]] },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Two blocks of adapting and testing.", "SHORT (30 S ADAPT, 24 TESTS)", "LONG (60 S ADAPT, 40 TESTS)");
    const AD = quick ? 30 : 60, NT = quick ? 24 : 40, TOP = 5;
    const adapter = grating({ ori: 90 + 15, c: .9, cpd: 2 }), rows = [], out = {};
    for (const cond of shuffle(["visible", "suppressed"])) {
      ctx.say(`${cond === "visible" ? "This block: the adapter stays visible." : "This block: a flickering pattern in the other eye hides the adapter most of the time."} Hold V while you can see the tilted grating. SPACE to start.`);
      await ctx.key([" ", "go"], { buttons: [["go", "START"]] });
      // the rival: dynamic noise squares (suppressed block) or a blank grey field
      let vis = 0, held = false;
      const down = (e) => { if (e.key === "v" || e.key === "V") held = true; }, up = (e) => { if (e.key === "v" || e.key === "V") held = false; };
      window.addEventListener("keydown", down); window.addEventListener("keyup", up);
      const bt = document.createElement("button"); bt.textContent = "VISIBLE (HOLD)"; bt.className = "k";
      const press = () => { held = true; }, rel = () => { held = false; };
      bt.addEventListener("pointerdown", press); window.addEventListener("pointerup", rel);
      const bar = ctx.canvas.closest(".pc")?.querySelector(".btns"); if (bar) { bar.innerHTML = ""; bar.appendChild(bt); }
      // the rival in the suppressed block: black and white squares, renewed ten times a second
      const nz = document.createElement("canvas"); nz.width = nz.height = ES; const gz = nz.getContext("2d"); let nzAt = -1;
      const noise = (g, t) => { const f = Math.floor(t * 10); if (f !== nzAt) { nzAt = f; gz.clearRect(0, 0, ES, ES);
          for (let i = 0; i < 70; i++) { const s = rnd(14, 60), c = Math.random() < .5 ? 0 : 255; gz.fillStyle = `rgb(${c},${c},${c})`; gz.fillRect(ES / 2 + rnd(-100, 100) - s / 2, ES / 2 + rnd(-100, 100) - s / 2, s, s); } }
        g.drawImage(nz, 0, 0); };
      try {
        await ctx.loop((t, dt) => { d.begin(); put(d.L, adapter); if (cond === "suppressed") noise(d.R, t);
          d.lock(); d.show(); if (held) vis += dt; ctx.status(`ADAPTING ${Math.max(0, Math.ceil(AD - t))} S`); return t < AD; });
      } finally { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); window.removeEventListener("pointerup", rel); if (bar) bar.innerHTML = ""; }
      // tests: a staircase on the test tilt (top-up adaptation between tests)
      let tilt = 3, lastDir = 0; const rev = [];
      for (let t = 0; t < NT; t++) {
        await ctx.loop((tt) => { d.begin(); put(d.L, adapter); if (cond === "suppressed") noise(d.R, tt); d.lock(); d.show(); return tt < TOP; });
        d.begin(); d.lock(); d.show(); await ctx.wait(250);
        const test = grating({ ori: 90 + tilt, c: .9, cpd: 2 });
        d.begin(); put(d.L, test); d.lock(); d.show(); await ctx.wait(200); d.begin(); d.lock(); d.show();
        const r = await ctx.key(["a", "l"], { buttons: [["a", "TILTED LEFT"], ["l", "TILTED RIGHT"]] });
        const right = r.key === "l"; rows.push([cond, t + 1, tilt, right ? "right" : "left"]);
        const dir = right ? -1 : 1; if (lastDir && dir !== lastDir) rev.push(tilt); lastDir = dir; tilt = clamp(tilt + dir * (rev.length < 2 ? 1 : .5), -10, 10);
      }
      out[cond] = { pse: rev.length >= 2 ? mean(rev.slice(-6)) : tilt, vis: vis / AD };
    }
    const V = out.visible, S = out.suppressed;
    ctx.plot({ title: "TILT AFTEREFFECT", x: { lo: 0, hi: 3, label: "ADAPTER", ticks: [] }, y: { lo: Math.min(-1, V.pse, S.pse) - 1, hi: Math.max(4, V.pse, S.pse) + 1, label: "VERTICAL PSE (DEG CW)", ticks: [-2, 0, 2, 4, 6] },
      series: [{ name: `VISIBLE ${Math.round(V.vis * 100)}%`, cls: "sG", pts: [[1, V.pse]] }, { name: `SUPPRESSED ${Math.round(S.vis * 100)}%`, cls: "sR", pts: [[2, S.pse]] }],
      hlines: [{ y: 0, cls: "sM", label: "NO AFTEREFFECT" }],
      notes: [["% = HOW LONG THE ADAPTER WAS VISIBLE", "sM"], [`RATIO ${f2(S.pse / V.pse)}`, "sW"]] });
    ctx.say(`A clockwise adapter pushes apparent vertical clockwise (positive PSE). Blake & Fox's result: about the same aftereffect whether the adapter was seen or suppressed. Yours: ${f2(V.pse)}° visible, ${f2(S.pse)}° suppressed.`);
    ctx.csv("adapt_invisible.csv", ["block", "test", "tilt_deg_cw", "response"], rows);
  } };

// 5. size and piecemeal rivalry
export const RIV_SIZE = { id: "rivsize", group: GROUP, tag: "BLAKE ET AL. 1992", title: "Size and piecemeal rivalry",
  sub: "Small patches rival as a whole; big ones break into a patchwork.",
  ref: ["Blake, R., O'Shea, R. P., & Mueller, T. J. (1992). Spatial zones of binocular rivalry in central and peripheral vision. Visual Neuroscience, 8(5), 469–478."],
  blurb: "Rivalry is local. Small patches alternate all-or-none; as they grow, you see more and more mosaics of the two. Blake, O'Shea and Mueller estimated the size of these zones, about a few tenths of a degree at the fovea and larger in the periphery.",
  instructions: { lines: ["Rivalry patches of different sizes, one size per short block. Keep your eyes on the dot in the middle of the patch.", "Report what you see: one grating whole (A or L), or a mixture or patchwork of both (S). Press on every change."], keys: VIEWKEYS },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Five sizes.", "5 × 20 SECONDS", "5 × 45 SECONDS"), T = quick ? 20 : 45;
    const sizes = shuffle([.5, 1, 2, 4, 8]), rows = [], res = [];
    for (let b = 0; b < sizes.length; b++) {
      const deg = sizes[b], r = deg * PPD / 2; ctx.say(`Block ${b + 1} of ${sizes.length}: a ${deg}° patch. SPACE to start; A, S or L on every change.`); await ctx.key([" ", "go"], { buttons: [["go", "START BLOCK"]] });
      const gA = grating({ ori: -45, c: .8, r, cpd: 4 }), gB = grating({ ori: 45, c: .8, r, cpd: 4 });
      const { full } = await track(ctx, d, { keys: TRIKEYS, secs: T, draw(d) { d.begin(); put(d.L, gA); put(d.R, gB); d.lock(); } });
      const tot = full.reduce((a, l) => a + l.d, 0), mix = full.filter(l => l.p === "s").reduce((a, l) => a + l.d, 0);
      res.push([deg, tot ? mix / tot : NaN]); for (const l of full) rows.push([deg, TRIKEYS.find(k => k[0] === l.p)[1], l.t0, l.d]);
    }
    res.sort((a, b) => a[0] - b[0]);
    ctx.plot({ title: "PIECEMEAL RIVALRY", x: { lo: .35, hi: 11, log: true, label: "PATCH DIAMETER (DEG, NOMINAL)", ticks: [.5, 1, 2, 4, 8] }, y: { lo: 0, hi: 1, label: "PROPORTION MIXED", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "MIXED", cls: "sA", pts: res, line: true }], notes: [["SIZES ASSUME 36 PX PER DEGREE", "sM"]] });
    ctx.say("Mixed percepts climb with size: rivalry happens in local zones, and a big patch holds several that can disagree. Where your curve crosses 0.5 is a rough zone size (scaled by how far you sit from this screen).");
    ctx.csv("rivalry_size.csv", ["diameter_deg", "percept", "onset_s", "duration_s"], rows);
  } };

// 6. travelling waves of dominance
export const RIV_WAVE = { id: "rivwave", group: GROUP, tag: "WILSON ET AL. 2001", title: "Travelling waves",
  sub: "Dominance spreads round a ring like a wave. Time it.",
  ref: ["Wilson, H. R., Blake, R., & Lee, S.-H. (2001). Dynamics of travelling waves in visual perception. Nature, 412, 907–910."],
  blurb: "In a rivalry ring, a switch starts at one spot and sweeps around. Triggering it at the top with a brief contrast pulse and timing when it reaches the bottom gives the wave's speed, which Wilson, Blake and Lee found was faster along contours (a ring of concentric stripes) than across them (radial).",
  instructions: { lines: ["Each eye gets a ring: low-contrast stripes in one eye, high-contrast stripes in the other. Keep your eyes on the dot in the middle.", "Wait until the LOW-contrast ring (the dim one) is all you see, then press SPACE. A moment later the top of the ring flashes: the other ring takes over there and sweeps round both sides.",
    "Press SPACE again the moment it reaches the marks at the bottom. If it never gets there, press X."], keys: [["SPACE", "DIM RING IS ALL I SEE / WAVE REACHED THE BOTTOM"], ["X", "THE WAVE NEVER ARRIVED"]] },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Timing waves.", "16 WAVES", "32 WAVES"), N = quick ? 16 : 32;
    const R1 = 150, R0 = 112, arc = Math.PI * (R0 + R1) / 2 / PPD;   // half the ring's mean circumference, in degrees (top to bottom)
    const kinds = shuffle(Array.from({ length: N }, (_, i) => i % 2 ? "concentric" : "radial")), rows = [];
    const low = (k) => grating({ r: R1, r0: R0, kind: k === "concentric" ? "radial" : "concentric", c: .25, cpd: 3 });
    for (let t = 0; t < N; t++) {
      const k = kinds[t], dom = low(k), hi = grating({ r: R1, r0: R0, kind: k, c: .95, cpd: 3 });
      let pulse = false;
      const draw = (d) => { d.begin(); put(d.L, dom); put(d.R, hi); if (pulse) { d.R.save(); d.R.beginPath(); d.R.rect(ES / 2 - 40, ES / 2 - R1 - 2, 80, R1 - R0 + 4); d.R.clip(); put(d.R, grating({ r: R1, r0: R0, kind: k, c: 1, cpd: 3 })); d.R.restore(); }
        for (const g of [d.L, d.R]) { g.fillStyle = "#000"; g.fillRect(ES / 2 - 46, ES / 2 + R1 + 6, 8, 18); g.fillRect(ES / 2 + 38, ES / 2 + R1 + 6, 8, 18); } d.lock(); };
      let go = true; const anim = ctx.loop(() => { draw(d); d.show(); return go; });
      try {
        ctx.say(`Wave ${t + 1} of ${N}. SPACE when the dim ring is all you see.`);
        await ctx.key([" ", "go"], { buttons: [["go", "DIM RING ONLY"]] });
        pulse = true; await ctx.wait(220); pulse = false; const t0 = performance.now();
        ctx.say("SPACE when the wave reaches the marks at the bottom. X if it never does.");
        const r = await ctx.key([" ", "x", "go"], { buttons: [["go", "ARRIVED"], ["x", "NEVER ARRIVED"]], timeout: 8000 });
        const secs = (performance.now() - t0) / 1000, ok = r.key === " " || r.key === "go";
        rows.push([t + 1, k, ok ? 1 : 0, ok ? secs : NaN, ok ? arc / secs : NaN]);
      } finally { go = false; await anim.catch(() => {}); }
      d.begin(); d.lock(); d.show(); await ctx.wait(700);
    }
    const sp = (k) => rows.filter(r => r[1] === k && r[2] && r[3] > .15).map(r => r[4]), mC = median(sp("concentric")), mR = median(sp("radial"));
    ctx.plot({ title: "WAVE SPEED", x: { lo: 0, hi: 3, label: "STRIPES OF THE INVADING RING", ticks: [] }, y: { lo: 0, hi: Math.max(4, mC || 0, mR || 0) * 1.3, label: "DEG / S (NOMINAL)", ticks: [0, 2, 4, 6, 8, 10, 12].filter(x => x < 30) },
      series: [{ name: "CONCENTRIC", cls: "sG", pts: [[1, mC]] }, { name: "RADIAL", cls: "sA", pts: [[2, mR]] }],
      notes: [[`ARC TOP TO BOTTOM ${f2(arc)} DEG`, "sM"], [`ARRIVED ${rows.filter(r => r[2]).length} OF ${rows.length}`, "sM"]] });
    ctx.say(`Medians: ${f2(mC)} deg/s along the stripes (concentric), ${f2(mR)} across them (radial). Wilson, Blake and Lee found waves a few degrees per second, faster when they could ride along collinear contours.`);
    ctx.csv("travelling_waves.csv", ["wave", "invading_stripes", "arrived", "seconds", "deg_per_s"], rows);
  } };

// 7. interocular grouping: patchwork stimuli, whole percepts
export const RIV_GROUP = { id: "rivgroup", group: GROUP, tag: "KOVÁCS ET AL. 1996", title: "Interocular grouping",
  sub: "Each eye gets half of each picture. You can still see whole ones.",
  ref: ["Kovács, I., Papathomas, T. V., Yang, M., & Fehér, Á. (1996). When the brain changes its mind: Interocular grouping during binocular rivalry. Proceedings of the National Academy of Sciences, 93(26), 15508–15511.",
    "Diaz-Caneja, E. (1928). Sur l'alternance binoculaire. Annales d'Oculistique, 165, 721–731."],
  blurb: "Give each eye a patchwork, half one pattern and half the other, complementary between the eyes. If rivalry were only a contest between eyes you'd see the patchworks; often you see a whole pattern instead, assembled from both eyes.",
  instructions: { lines: ["Two blocks. In one, each eye sees a whole grating (ordinary rivalry). In the other, each eye sees a patchwork: half left-tilted, half right-tilted, swapped between the eyes.", "Report what you see: an all-left-tilted disc (A), an all-right-tilted disc (L), or any patchwork or mixture (S). Press on every change."], keys: VIEWKEYS },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Two blocks.", "2 × 45 SECONDS", "2 × 90 SECONDS"), T = quick ? 45 : 90, rows = [], res = {};
    const gA = grating({ ori: -45, c: .8, r: 80 }), gB = grating({ ori: 45, c: .8, r: 80 });
    const half = (g, img, top) => { g.save(); g.beginPath(); g.rect(0, top ? 0 : ES / 2, ES, ES / 2); g.clip(); put(g, img); g.restore(); };
    for (const cond of shuffle(["conventional", "patchwork"])) {
      ctx.say(`${cond === "patchwork" ? "Patchwork block." : "Ordinary rivalry block."} SPACE to start; A all-left, S patchwork or mix, L all-right.`); await ctx.key([" ", "go"], { buttons: [["go", "START BLOCK"]] });
      const { full } = await track(ctx, d, { keys: TRIKEYS, secs: T, draw(d) { d.begin();
        if (cond === "conventional") { put(d.L, gA); put(d.R, gB); } else { half(d.L, gA, true); half(d.L, gB, false); half(d.R, gB, true); half(d.R, gA, false); } d.lock(); } });
      const tot = full.reduce((a, l) => a + l.d, 0), coh = full.filter(l => l.p !== "s").reduce((a, l) => a + l.d, 0);
      res[cond] = tot ? coh / tot : NaN; for (const l of full) rows.push([cond, TRIKEYS.find(k => k[0] === l.p)[1], l.t0, l.d]);
    }
    ctx.plot({ title: "WHOLE PERCEPTS", x: { lo: 0, hi: 3, label: "STIMULUS", ticks: [] }, y: { lo: 0, hi: 1, label: "PROPORTION WHOLE", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "ORDINARY", cls: "sG", pts: [[1, res.conventional]] }, { name: "PATCHWORK", cls: "sA", pts: [[2, res.patchwork]] }],
      notes: [["PATCHWORK: A WHOLE DISC NEEDS", "sM"], ["HALVES FROM BOTH EYES", "sM"]] });
    ctx.say(`Whole discs ${Math.round(100 * res.patchwork)}% of the time from patchworks (vs ${Math.round(100 * res.conventional)}% ordinary). Anything well above zero is interocular grouping: rivalry between patterns, not just between eyes.`);
    ctx.csv("interocular_grouping.csv", ["block", "percept", "onset_s", "duration_s"], rows);
  } };

// 8. flicker and swap: stimulus rivalry
export const RIV_SWAP = { id: "rivswap", group: GROUP, tag: "LOGOTHETIS ET AL. 1996", title: "Flicker and swap",
  sub: "The gratings trade eyes three times a second. Does your percept?",
  ref: ["Logothetis, N. K., Leopold, D. A., & Sheinberg, D. L. (1996). What is rivalling during binocular rivalry? Nature, 380, 621–624.",
    "Lee, S.-H., & Blake, R. (1999). Rival ideas about binocular rivalry. Vision Research, 39(8), 1447–1454."],
  blurb: "Swap the two gratings between the eyes every third of a second (and flicker them) and you might expect the percept to flip with every swap. Instead it can hold for seconds: the rivalry is between the patterns, not the eyes. Lee and Blake showed it depends on the flicker and the contrast.",
  instructions: { lines: ["Two blocks of rivalry. In one the gratings stay put. In the other they flicker fast and trade eyes three times a second.", "Report the grating you see: left tilt (A), right tilt (L), or a mixture (S). Press on every change, however fast."], keys: VIEWKEYS },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Two blocks.", "2 × 40 SECONDS", "2 × 90 SECONDS"), T = quick ? 40 : 90, rows = [], res = {};
    const gA = grating({ ori: -45, c: .8 }), gB = grating({ ori: 45, c: .8 });
    for (const cond of shuffle(["static", "swap"])) {
      ctx.say(`${cond === "swap" ? "Swapping block (flickering)." : "Steady block."} SPACE to start; A, S or L on every change.`); await ctx.key([" ", "go"], { buttons: [["go", "START BLOCK"]] });
      const { full } = await track(ctx, d, { keys: TRIKEYS, secs: T, draw(d, t) { d.begin();
        if (cond === "static") { put(d.L, gA); put(d.R, gB); }
        else { const sw = Math.floor(t * 3) % 2, on = Math.floor(t * 36) % 2 === 0; if (on) { put(d.L, sw ? gB : gA); put(d.R, sw ? gA : gB); } }
        d.lock(); } });
      const ex = full.filter(l => l.p !== "s").map(l => l.d); res[cond] = { m: mean(ex), long: ex.filter(x => x > 1 / 3 * 2).length / Math.max(1, ex.length) };
      for (const l of full) rows.push([cond, TRIKEYS.find(k => k[0] === l.p)[1], l.t0, l.d]);
    }
    ctx.plot({ title: "DOMINANCE WHILE SWAPPING", x: { lo: 0, hi: 3, label: "BLOCK", ticks: [] }, y: { lo: 0, hi: Math.max(2, res.static.m || 0, res.swap.m || 0) * 1.25, label: "MEAN DOMINANCE (S)", ticks: [0, .33, 1, 2, 3, 4] },
      series: [{ name: "STEADY", cls: "sG", pts: [[1, res.static.m]] }, { name: "SWAPPING", cls: "sA", pts: [[2, res.swap.m]] }],
      hlines: [{ y: 1 / 3, cls: "sR", label: "ONE SWAP" }], notes: [[`SWAP DURATIONS > 2 SWAPS: ${Math.round(100 * res.swap.long)}%`, "sW"]] });
    ctx.say(res.swap.m > .67 ? `Dominance outlasted the swaps (mean ${fS(res.swap.m)} against a swap every 0.33 s): stimulus rivalry, the pattern winning across eyes.` : "Your percepts mostly flipped with the swaps: eye rivalry. Lee and Blake found stimulus rivalry needs fast flicker and moderate contrast; screens and glasses vary.");
    ctx.csv("flicker_swap.csv", ["block", "percept", "onset_s", "duration_s"], rows);
  } };

// 9. intermittent presentation: perceptual memory
export const RIV_MEMORY = { id: "rivmemory", group: GROUP, tag: "LEOPOLD ET AL. 2002", title: "Rivalry with gaps",
  sub: "Blank the screen between looks and the same percept keeps coming back.",
  ref: ["Leopold, D. A., Wilke, M., Maier, A., & Logothetis, N. K. (2002). Stable perception of visually ambiguous patterns. Nature Neuroscience, 5(6), 605–609.",
    "Brascamp, J. W., Knapen, T. H. J., Kanai, R., Noest, A. J., van Ee, R., & van den Berg, A. V. (2008). Multi-timescale perceptual history resolves visual ambiguity. PLoS ONE, 3(1), e1497."],
  blurb: "Show a rivalry display in short bursts with blank gaps and it stops alternating: with gaps longer than about half a second, the same percept returns burst after burst. Brascamp and colleagues showed this memory builds up and decays over several timescales.",
  instructions: { lines: ["The rivalry gratings appear for a second at a time, with blank gaps of different lengths in between.", "Each time they appear, report the one you see FIRST: left tilt (A) or right tilt (L). Ignore any change during the second."], keys: [["A", "FIRST SAW LEFT TILT"], ["L", "FIRST SAW RIGHT TILT"]] },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Three gap lengths.", "3 × 20 SHOWINGS", "3 × 40 SHOWINGS"), N = quick ? 20 : 40, rows = [], res = [];
    const gA = grating({ ori: -45, c: .8 }), gB = grating({ ori: 45, c: .8 });
    for (const gap of shuffle([.1, .5, 2])) {
      ctx.say(`Gaps of ${gap} s this block. For each showing, A or L for the grating you see first. SPACE to start.`); await ctx.key([" ", "go"], { buttons: [["go", "START BLOCK"]] });
      let prev = null, same = 0, n = 0;
      for (let i = 0; i < N; i++) {
        d.begin(); d.lock(); d.show(); await ctx.wait(gap * 1000);
        const t0 = performance.now(); let resp = null;
        const r = ctx.key(["a", "l"], { buttons: [["a", "LEFT TILT"], ["l", "RIGHT TILT"]], quiet: true }).then(x => { resp = x; }); r.catch(() => {});
        await ctx.loop((t) => { d.begin(); put(d.L, gA); put(d.R, gB); d.lock(); d.show(); return t < 1 || (!resp && t < 4); });
        await r.catch(() => {}); const k = resp ? resp.key : null;
        if (k && prev) { n++; if (k === prev) same++; }
        rows.push([gap, i + 1, k === "a" ? "left" : k === "l" ? "right" : "", prev && k ? (k === prev ? 1 : 0) : ""]); if (k) prev = k;
      }
      res.push([gap, n ? same / n : NaN]);
    }
    res.sort((a, b) => a[0] - b[0]);
    ctx.plot({ title: "PERCEPTUAL MEMORY", x: { lo: .07, hi: 3, log: true, label: "BLANK GAP (S)", ticks: [.1, .5, 2] }, y: { lo: 0, hi: 1, label: "P(SAME AS LAST TIME)", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "REPEAT", cls: "sA", pts: res, line: true }], hlines: [{ y: .5, cls: "sM", label: "CHANCE" }] });
    ctx.say(`Short gaps behave like continuous viewing (repeats near or below 0.5). Long gaps freeze the percept: Leopold et al. saw repeats near 1 at gaps of a second or more. Yours at 2 s: ${f2(res[2][1])}.`);
    ctx.csv("intermittent_rivalry.csv", ["gap_s", "showing", "first_percept", "same_as_previous"], rows);
  } };

// 10. flash suppression and flash facilitation
export const RIV_FLASH = { id: "rivflash", group: GROUP, tag: "BRASCAMP ET AL. 2007", title: "Flash suppression and facilitation",
  sub: "Show one eye first: does the newcomer win, or lose?",
  ref: ["Brascamp, J. W., Knapen, T. H. J., Kanai, R., van Ee, R., & van den Berg, A. V. (2007). Flash suppression and flash facilitation in binocular rivalry. Journal of Vision, 7(12), 12.",
    "Wolfe, J. M. (1984). Reversing ocular dominance and suppression in a single flash. Vision Research, 24(5), 471–478."],
  blurb: "Show one eye its grating alone for a while, then add the rival in the other eye. After a long preview the newcomer wins (flash suppression, Wolfe 1984). After a short one, the previewed grating tends to win instead: flash facilitation, which Brascamp and colleagues found at short previews and low contrast.",
  instructions: { lines: ["One eye's grating appears alone for a moment (from a tenth of a second to a few seconds). Then the other eye's grating is added.", "Report which grating you see right after the second one arrives: left tilt (A) or right tilt (L)."], keys: [["A", "LEFT TILT WON"], ["L", "RIGHT TILT WON"]] },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Preview trials.", "40 TRIALS", "80 TRIALS"), N = quick ? 40 : 80, previews = [.1, .3, 1, 3], rows = [];
    const trials = shuffle(Array.from({ length: N }, (_, i) => ({ pv: previews[i % 4], first: (i >> 2) % 2 ? "L" : "R" })));
    const gA = grating({ ori: -45, c: .5 }), gB = grating({ ori: 45, c: .5 });
    for (let t = 0; t < N; t++) {
      const T = trials[t]; ctx.say(`Trial ${t + 1} of ${N}.`);
      d.begin(); d.lock(); d.show(); await ctx.wait(1200);
      await ctx.loop((tt) => { d.begin(); if (T.first === "L") put(d.L, gA); else put(d.R, gB); d.lock(); d.show(); return tt < T.pv; });
      const r = ctx.key(["a", "l"], { buttons: [["a", "LEFT TILT"], ["l", "RIGHT TILT"]], quiet: true }); let got = null; r.then(x => { got = x; }).catch(() => {});
      await ctx.loop((tt) => { d.begin(); put(d.L, gA); put(d.R, gB); d.lock(); d.show(); return !got && tt < 6; });
      const k = got ? got.key : (await r).key;
      const newcomerWon = (T.first === "L" && k === "l") || (T.first === "R" && k === "a");
      rows.push([t + 1, T.pv, T.first === "L" ? "left" : "right", k === "a" ? "left tilt" : "right tilt", newcomerWon ? 1 : 0]);
      d.begin(); d.lock(); d.show(); await ctx.wait(500);
    }
    const res = previews.map(p => { const rr = rows.filter(r => r[1] === p); return [p, mean(rr.map(r => r[4]))]; });
    ctx.plot({ title: "FLASH SUPPRESSION", x: { lo: .07, hi: 4.5, log: true, label: "PREVIEW (S)", ticks: previews }, y: { lo: 0, hi: 1, label: "P(NEWCOMER WINS)", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "NEWCOMER", cls: "sA", pts: res, line: true }], hlines: [{ y: .5, cls: "sM", label: "CHANCE" }],
      notes: [["BELOW .5: FLASH FACILITATION", "sG"], ["ABOVE .5: FLASH SUPPRESSION", "sR"]] });
    ctx.say(`Long previews hand the win to the newcomer (flash suppression); short ones can favour the previewed grating. Your newcomer win rate climbs from ${f2(res[0][1])} at 0.1 s to ${f2(res[3][1])} at 3 s.`);
    ctx.csv("flash_suppression.csv", ["trial", "preview_s", "first_eye", "seen", "newcomer_won"], rows);
  } };

// 11. breaking continuous flash suppression
function face(g, x, y, s, inv) {   // a schematic face, line drawn (an outline, eyes, brows, nose, mouth)
  g.save(); g.translate(x, y); if (inv) g.rotate(Math.PI); g.strokeStyle = "#fff"; g.fillStyle = "#fff"; g.lineWidth = s * .07; g.lineCap = "round";
  g.beginPath(); g.ellipse(0, 0, s * .42, s * .52, 0, 0, Math.PI * 2); g.stroke();
  for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * s * .16, -s * .1, s * .055, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(sx * s * .26, -s * .24); g.lineTo(sx * s * .07, -s * .21); g.stroke(); }
  g.beginPath(); g.moveTo(0, -s * .04); g.lineTo(-s * .04, s * .12); g.lineTo(s * .03, s * .13); g.stroke();
  g.beginPath(); g.arc(0, s * .14, s * .16, Math.PI * .2, Math.PI * .8); g.stroke(); g.restore();
}
export const RIV_CFS = { id: "rivcfs", group: GROUP, tag: "TSUCHIYA & KOCH 2005", title: "Breaking flash suppression",
  sub: "Flickering patterns in one eye hide the other for seconds. Upright faces break through first.",
  ref: ["Tsuchiya, N., & Koch, C. (2005). Continuous flash suppression reduces negative afterimages. Nature Neuroscience, 8(8), 1096–1101.",
    "Jiang, Y., Costello, P., & He, S. (2007). Processing of invisible stimuli: Advantage of upright faces and recognizable words in overcoming interocular suppression. Psychological Science, 18(4), 349–355."],
  blurb: "Flash a new random pattern into one eye ten times a second and a picture in the other eye can stay invisible for seconds: continuous flash suppression. How long it takes to break through is a measure of how strongly the picture pushes; Jiang, Costello and He found upright faces break through faster than inverted ones.",
  instructions: { lines: ["One eye sees a storm of flickering squares. The other eye gets a face that slowly fades in, left or right of the dot.", "As soon as you can see ANY part of the face, say which side it's on: A left, L right. Be fast, but don't guess."], keys: [["A", "SOMETHING ON THE LEFT"], ["L", "SOMETHING ON THE RIGHT"]] },
  async run(ctx) {
    const v = await ensure(ctx), d = dichoptic(ctx, v);
    const quick = await askLen(ctx, "Breakthrough trials.", "24 TRIALS", "48 TRIALS"), N = quick ? 24 : 48, rows = [];
    const trials = shuffle(Array.from({ length: N }, (_, i) => ({ inv: i % 2 === 1, side: (i >> 1) % 2 ? 1 : -1 })));
    const mondrian = document.createElement("canvas"); mondrian.width = mondrian.height = ES; const gm = mondrian.getContext("2d");
    const newMondrian = () => { gm.fillStyle = "#808080"; gm.fillRect(0, 0, ES, ES); for (let i = 0; i < 160; i++) { const w = rnd(18, 80), h = rnd(18, 80), c = Math.round(rnd(0, 255)); gm.fillStyle = `rgb(${c},${c},${c})`; gm.fillRect(rnd(20, ES - 20) - w / 2, rnd(20, ES - 20) - h / 2, w, h); } };
    const cfsEye = v.redEye === "left" ? "R" : "L";   // the flicker goes to one eye; the face to the other (fixed per run)
    for (let t = 0; t < N; t++) {
      const T = trials[t]; ctx.say(`Trial ${t + 1} of ${N}. Keep your eyes on the dot.`);
      d.begin(); d.lock(); d.show(); await ctx.wait(800);
      let got = null; const r = ctx.key(["a", "l"], { buttons: [["a", "LEFT"], ["l", "RIGHT"]], quiet: true }); r.then(x => { got = x; }).catch(() => {});
      let lastFlip = -1;
      await ctx.loop((tt) => { d.begin(); const f = Math.floor(tt * 10); if (f !== lastFlip) { newMondrian(); lastFlip = f; }
        const fe = cfsEye === "L" ? d.R : d.L, ce = cfsEye === "L" ? d.L : d.R; ce.drawImage(mondrian, 0, 0);
        fe.globalAlpha = clamp(tt / 6, 0, 1); face(fe, ES / 2 + T.side * 90, ES / 2, 110, T.inv); fe.globalAlpha = 1;
        d.lock(); d.show(); return !got && tt < 10; });
      const k = got ? got.key : null, rt = got ? got.rt / 1000 : NaN, correct = k ? (k === "l") === (T.side > 0) : false;
      rows.push([t + 1, T.inv ? "inverted" : "upright", T.side > 0 ? "right" : "left", k ? (k === "l" ? "right" : "left") : "none", correct ? 1 : 0, k ? rt : ""]);
      d.begin(); d.lock(); d.show(); await ctx.wait(600);
    }
    const rts = (inv) => rows.filter(r => r[1] === (inv ? "inverted" : "upright") && r[4] === 1).map(r => r[5]);
    const mU = median(rts(false)), mI = median(rts(true));
    ctx.plot({ title: "BREAKTHROUGH TIME", x: { lo: 0, hi: 3, label: "FACE", ticks: [] }, y: { lo: 0, hi: Math.max(3, mU || 0, mI || 0) * 1.25, label: "MEDIAN TIME TO SEE IT (S)", ticks: [0, 1, 2, 3, 4, 5, 6, 8] },
      series: [{ name: "UPRIGHT", cls: "sG", pts: [[1, mU]] }, { name: "INVERTED", cls: "sA", pts: [[2, mI]] }],
      notes: [[`ACCURACY ${Math.round(100 * mean(rows.map(r => r[4])))}%`, "sW"], ["CORRECT TRIALS ONLY", "sM"]] });
    ctx.say(`Upright ${fS(mU)}, inverted ${fS(mI)}. Jiang and colleagues found upright faces emerge sooner; a schematic face is a weaker test than a photograph, so the gap may be small.`);
    ctx.csv("bcfs.csv", ["trial", "face", "side", "response", "correct", "breakthrough_s"], rows);
  } };

export const RIVALRY = [RIV_SETUP, RIV_BASIC, RIV_LEVELT, RIV_PROBE, RIV_ADAPT, RIV_SIZE, RIV_WAVE, RIV_GROUP, RIV_SWAP, RIV_MEMORY, RIV_FLASH, RIV_CFS];
