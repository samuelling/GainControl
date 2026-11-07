// THE VISION LIBRARY: thirteen classic paradigms in form, motion and number, each the simplest faithful version that
// runs on an uncalibrated screen at an unknown viewing distance. Every result is relative (a ratio, a PSE, a slope,
// an accuracy pattern or a time), so it survives a phone in someone's hand as well as a booth monitor.
//   FORM    Mariotte (1668) blind spot · Westheimer & McKee (1977) vernier vs gap · Appelle (1972) oblique effect
//           Glass (1969) patterns · Field, Hayes & Hess (1993) contour integration · Beck (1966) texture segregation
//   MOTION  Newsome & Paré (1988) motion coherence · Johansson (1973) point-light walker · Nijhawan (1994) flash-lag
//           Ternus (1926) / Pantle & Picciano (1976) element vs group motion
//   NUMBER  Ariely (2001) ensemble mean size · Kaufman et al. (1949) subitizing · Burr & Ross (2008) number adaptation
import { fitLogistic, logistic, mean, median, shuffle, nelderMead } from "./fit.js";

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const uni = (a, b) => a + Math.random() * (b - a);
const quick = (ctx, q, f) => ctx.choose("How long?", [["q", q], ["f", f]]).then(k => k === "q");
const FONT = "'Saira Condensed', sans-serif";
const pct = (v) => isFinite(v) ? `${Math.round(v * 100)}%` : "-";
const f1 = (v, d = 1) => isFinite(v) ? v.toFixed(d) : "-";
const LR = { buttons: [["ArrowLeft", "LEFT"], ["ArrowRight", "RIGHT"]] };
const label = (g, t, x, y, col = "#fff", size = 22) => { g.fillStyle = col; g.font = `600 ${size}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, x, y); };

// a 2-down-1-up staircase in log10 units (converges near 71% correct)
function stair(x0, { step = .2, fine = .1, lo = -3, hi = 3 } = {}) {
  return { lx: Math.log10(x0), step, run: 0, last: 0, rev: [], hist: [],
    get x() { return Math.pow(10, this.lx); },
    update(ok) { this.hist.push({ x: this.x, ok });
      let d = 0; if (ok) { if (++this.run === 2) { this.run = 0; d = -1; } } else { this.run = 0; d = 1; }
      if (d) { if (this.last && d !== this.last) { this.rev.push(this.lx); if (this.rev.length === 2) this.step = fine; } this.last = d; this.lx = Math.max(lo, Math.min(hi, this.lx + d * this.step)); } },
    thr() { const r = this.rev.slice(2); return Math.pow(10, mean(r.length >= 2 ? r : this.hist.slice(-8).map(h => Math.log10(h.x)))); } };
}
// a 2AFC Weibull by maximum likelihood: P = .5 + .48 (1 − exp(−(x/a)^b)); a is the ~80%-correct threshold
function weibull2(trials) {
  trials = trials.filter(t => t.x > 0); if (trials.length < 8) return null;
  const xs = trials.map(t => t.x), lo = Math.min(...xs), hi = Math.max(...xs);
  const P = (x, a, b) => .5 + .48 * (1 - Math.exp(-Math.pow(x / a, b)));
  const nll = ([la, lb]) => { const a = Math.exp(la), b = Math.exp(lb); let L = 0;
    for (const t of trials) { const p = Math.min(1 - 1e-6, Math.max(1e-6, P(t.x, a, b))); L -= t.ok ? Math.log(p) : Math.log(1 - p); }
    return L + .05 * (lb - Math.log(2)) ** 2; };
  const [la, lb] = nelderMead(nll, [Math.log(Math.sqrt(lo * hi)), Math.log(2)]);
  const a = Math.exp(la), b = Math.exp(lb);
  if (!isFinite(a) || a < lo / 3 || a > hi * 3) return null;
  return { a, b, p: (x) => P(x, a, b) };
}
// proportion correct in log-spaced bins (for plotting staircase data)
function bins(trials, w = .2, minN = 3) {
  const m = new Map(); for (const t of trials) { const k = Math.round(Math.log10(t.x) / w); const b = m.get(k) || { n: 0, k: 0, lx: 0 }; b.n++; b.k += t.ok ? 1 : 0; b.lx += Math.log10(t.x); m.set(k, b); }
  return [...m.values()].filter(b => b.n >= minN).map(b => [Math.pow(10, b.lx / b.n), b.k / b.n]).sort((a, b) => a[0] - b[0]);
}
const propOK = (d) => d.length ? d.filter(x => x.ok).length / d.length : NaN;
// random points in a disc with a minimum spacing
function scatter(n, x0, y0, R, minD, tries = 6000) {
  const pts = []; let t = 0;
  while (pts.length < n && t++ < tries) { const a = Math.random() * Math.PI * 2, r = R * Math.sqrt(Math.random()), x = x0 + r * Math.cos(a), y = y0 + r * Math.sin(a);
    if (pts.every(p => (p[0] - x) ** 2 + (p[1] - y) ** 2 > minD * minD)) pts.push([x, y]); }
  return pts;
}
const disc = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
// a Gabor patch by putImageData. ori is the stripes' tilt, clockwise from vertical
function gabor(g, x, y, { ori, lam = 12, sd = 16, c = .6, bg = .5, size = 112 }) {
  const n = size, img = g.createImageData(n, n), th = ori * Math.PI / 180, nx = Math.cos(th), ny = Math.sin(th), ph = Math.random() * Math.PI * 2;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const u = i - n / 2 + .5, v = j - n / 2 + .5, env = Math.exp(-(u * u + v * v) / (2 * sd * sd));
    const L = 255 * bg * (1 + c * env * Math.sin(2 * Math.PI * (u * nx + v * ny) / lam + ph)) + Math.random() - .5, k = (j * n + i) * 4;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = Math.max(0, Math.min(255, Math.round(L))); img.data[k + 3] = 255;
  }
  g.putImageData(img, Math.round(x - n / 2), Math.round(y - n / 2));
}
// white axis-aligned rectangles on black, drawn by exact pixel coverage (so sub-pixel offsets and gaps are rendered
// faithfully, without the canvas's anti-aliasing compositing seams). rects: [x0, y0, x1, y1] relative to (ox, oy)
function coverRects(g, ox, oy, w, h, rects) {
  const img = g.createImageData(w, h), cov = new Float32Array(w * h);
  for (const [a, b, c, d] of rects) for (let j = Math.max(0, Math.floor(b)); j < Math.min(h, Math.ceil(d)); j++) {
    const cy = Math.min(d, j + 1) - Math.max(b, j); if (cy <= 0) continue;
    for (let i = Math.max(0, Math.floor(a)); i < Math.min(w, Math.ceil(c)); i++) { const cx = Math.min(c, i + 1) - Math.max(a, i); if (cx > 0) cov[j * w + i] += cx * cy; } }
  for (let p = 0; p < w * h; p++) { const v = Math.round(255 * Math.min(1, cov[p])); img.data[p * 4] = img.data[p * 4 + 1] = img.data[p * 4 + 2] = v; img.data[p * 4 + 3] = 255; }
  g.putImageData(img, ox, oy);
}
// least squares by normal equations (small problems only)
function lsq(X, y) {
  const p = X[0].length, A = Array.from({ length: p }, () => Array(p + 1).fill(0));
  X.forEach((r, n) => { for (let i = 0; i < p; i++) { for (let j = 0; j < p; j++) A[i][j] += r[i] * r[j]; A[i][p] += r[i] * y[n]; } });
  for (let i = 0; i < p; i++) { let m = i; for (let k = i + 1; k < p; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k; [A[i], A[m]] = [A[m], A[i]];
    if (Math.abs(A[i][i]) < 1e-12) return null; for (let k = 0; k < p; k++) if (k !== i) { const f = A[k][i] / A[i][i]; for (let j = i; j <= p; j++) A[k][j] -= f * A[i][j]; } }
  return A.map((r, i) => r[p] / r[i]);
}

/* =====================================================================================================================
   FORM
   ===================================================================================================================== */

/* ---------------- Mariotte (1668): the blind spot ---------------- */
export const BLINDSPOT = { id: "blindspot", group: "FORM", tag: "MARIOTTE 1668", title: "The blind spot",
  sub: "Every eye has a hole where the optic nerve leaves. Find yours and map it.",
  ref: "Mariotte, E. (1668). A new discovery touching vision. Philosophical Transactions of the Royal Society of London, 3, 668–671.",
  blurb: "Close one eye and stare at the cross. A dot sweeps slowly across the screen; tap when it vanishes and again when it comes back. Sweeps in both directions (to cancel your reaction time) and up and down map the hole in screen pixels. The result is a shape, not a size: how wide the hole is relative to its distance from the cross, and how tall relative to wide, which doesn't depend on how far away you sit. The hole's distance even tells you how far from the screen you are.",
  instructions: { lines: ["Make the window as big as you can. Close one eye (you'll choose which) and keep the other on the cross for the whole run. Don't move your head.", "A black dot sweeps slowly across the screen. Press when it VANISHES, and again when it COMES BACK.", "If it never vanishes, sit a bit closer and run it again."],
    keys: [["SPACE", "IT VANISHED / IT CAME BACK"]] },
  async run(ctx) {
    const eye = await ctx.choose("Which eye will you close?", [["l", "I'LL CLOSE MY LEFT EYE"], ["r", "I'LL CLOSE MY RIGHT EYE"]]);
    const q = await quick(ctx, "QUICK  2 SWEEPS EACH WAY", "FULL  4 SWEEPS EACH WAY");
    const { g, W, H } = ctx, s = eye === "l" ? 1 : -1, fx = s > 0 ? 64 : W - 64, fy = ctx.cy, n = q ? 2 : 4;
    const scene = (dx, dy) => { ctx.clear(.86); g.strokeStyle = "#000"; g.lineWidth = 3; g.beginPath(); g.moveTo(fx - 12, fy); g.lineTo(fx + 12, fy); g.moveTo(fx, fy - 12); g.lineTo(fx, fy + 12); g.stroke();
      if (dx !== null) { g.fillStyle = "#000"; disc(g, dx, dy, 9); } };
    // one sweep: the dot moves from a to b along one axis; every press logs where the dot was
    const sweep = async (horiz, a, b, other, speed) => {
      scene(horiz ? a : other, horiz ? other : a);
      ctx.say(`Close your ${eye === "l" ? "LEFT" : "RIGHT"} eye. Stare at the cross. Press READY, then press when the dot vanishes and when it comes back.`);
      await ctx.key([" ", "Enter"], { buttons: [[" ", "READY"]] });
      const dist = Math.abs(b - a), dir = Math.sign(b - a), dur = dist / speed * 1000, hits = []; let pos = a, done = false;
      const t0 = performance.now();
      const anim = ctx.loop(() => { const e = performance.now() - t0; pos = a + dir * Math.min(dist, e * speed / 1000); scene(horiz ? pos : other, horiz ? other : pos); return e < dur; });
      anim.then(() => { done = true; }, () => { done = true; });
      ctx.say("Eye on the cross. Press when the dot vanishes, and again when it's back.");
      while (!done) { const left = dur - (performance.now() - t0); if (left < 40) break;
        const r = await ctx.key([" "], { buttons: [[" ", hits.length % 2 ? "IT'S BACK" : "IT VANISHED"]], timeout: left, quiet: true }); if (r.key) hits.push(pos); }
      await anim; return hits;
    };
    const near0 = fx + s * 70, far0 = s > 0 ? W - 16 : 16, H0 = [], V0 = [];
    for (let i = 0; i < n; i++) for (const out of [true, false]) {
      ctx.status(`HORIZONTAL SWEEP ${H0.length + 1} / ${2 * n}`);
      const h = await sweep(true, out ? near0 : far0, out ? far0 : near0, fy, 120); H0.push({ out, h });
    }
    // edges: outward sweeps give near then far; inward ones far then near. Averaging the two directions cancels reaction time
    const pick = (arr, out, i) => arr.filter(r => r.out === out && r.h.length >= 2).map(r => r.h[i]);
    const nearE = mean([...pick(H0, true, 0), ...pick(H0, false, 1)]), farE = mean([...pick(H0, true, 1), ...pick(H0, false, 0)]);
    const bx = isFinite(nearE + farE) ? (nearE + farE) / 2 : fx + s * 0.6 * Math.abs(far0 - fx);
    for (let i = 0; i < n; i++) for (const down of [true, false]) {
      ctx.status(`VERTICAL SWEEP ${V0.length + 1} / ${2 * n}`);
      const h = await sweep(false, down ? 14 : H - 14, down ? H - 14 : 14, bx, 100); V0.push({ out: down, h });
    }
    const topE = mean([...pick(V0, true, 0), ...pick(V0, false, 1)]), botE = mean([...pick(V0, true, 1), ...pick(V0, false, 0)]);
    // in "eccentricity" units: distance from the cross along the hole's side, and up = positive
    const X = (x) => (x - fx) * s, Y = (y) => fy - y;
    const xN = X(nearE), xF = X(farE), yT = Y(topE), yB = Y(botE), cxB = (xN + xF) / 2, cyB = (yT + yB) / 2, w = xF - xN, h = yT - yB;
    const okH = isFinite(w) && w > 0, okV = isFinite(h) && h > 0;
    // the textbook blind spot: centred about 15.5° from fixation and 1.5° below it, about 5.5° wide and 7.5° tall
    const tan = (d) => Math.tan(d * Math.PI / 180), D = okH ? cxB / tan(15.5) : NaN;
    const tb = okH ? { n: D * tan(12.75), f: D * tan(18.25), t: -D * tan(1.5) + D * tan(3.75), b: -D * tan(1.5) - D * tan(3.75) } : null;
    const xmax = 900, yspan = xmax * 400 / 530;
    const fin = (p) => p.filter(q => isFinite(q[0]) && isFinite(q[1]));
    const series = [{ name: "FIXATION", cls: "sW", pts: [[0, 0]] }];
    if (okH) series.push({ name: "YOUR BLIND SPOT", cls: "sG", line: true, pts: fin([[xN, okV ? cyB : 0], [cxB, yT], [xF, okV ? cyB : 0], [cxB, yB], [xN, okV ? cyB : 0]]) });
    if (tb) series.push({ name: "TEXTBOOK SHAPE", cls: "sM", line: true, pts: [[tb.n, (tb.t + tb.b) / 2], [(tb.n + tb.f) / 2, tb.t], [tb.f, (tb.t + tb.b) / 2], [(tb.n + tb.f) / 2, tb.b], [tb.n, (tb.t + tb.b) / 2]] });
    ctx.status(""); ctx.plot({ title: "BLIND SPOT MAP", x: { lo: 0, hi: xmax, label: "PX FROM THE CROSS", ticks: [0, 300, 600, 900] }, y: { lo: -yspan / 2, hi: yspan / 2, label: "PX UP", ticks: [-300, 0, 300] }, series,
      notes: okH ? [[`CENTRE ${Math.round(cxB)} PX OUT`, "sG"], [`WIDTH / DISTANCE ${f1(w / cxB, 2)}  (ABOUT .37)`, "sW"], [okV ? `HEIGHT / WIDTH ${f1(h / w, 2)}  (ABOUT 1.4)` : "HEIGHT NOT MAPPED", "sW"],
        [okV ? `${cyB < 0 ? "BELOW" : "ABOVE"} THE CROSS BY ${Math.abs(Math.round(cyB))} PX` : "", "sM"], [`EYE ${f1(D / ctx.W, 1)} SCREEN WIDTHS AWAY`, "sA"]] : [["NO BLIND SPOT FOUND", "sR"]] });
    ctx.say(!okH ? "The dot never vanished and came back in a usable way. Sit closer (or farther), keep one eye shut and the other on the cross, and try again."
      : `Your blind spot sits ${Math.round(cxB)} px from the cross and is ${f1(w / cxB, 2)} times as wide as it is far out${okV ? `, ${f1(h / w, 2)} times as tall as wide` : ""}. A textbook blind spot is 15° out, about 5.5° wide and 7.5° tall: 0.37 and 1.4. You never notice it because the brain fills it in.`);
    ctx.csv("blind_spot.csv", ["sweep", "axis", "direction", "press1_px", "press2_px"],
      [...H0.map((r, i) => [i + 1, "horizontal", r.out ? "outward" : "inward", r.h[0] ?? "", r.h[1] ?? ""]), ...V0.map((r, i) => [i + 1, "vertical", r.out ? "down" : "up", r.h[0] ?? "", r.h[1] ?? ""]),
        ["summary", "fixation_x", fx, "edges_near_far_top_bottom", [nearE, farE, topE, botE].map(v => isFinite(v) ? v.toFixed(1) : "").join(" ")]]);
  } };

/* ---------------- Westheimer & McKee (1977): vernier hyperacuity vs a gap ---------------- */
export const VERNIER = { id: "vernier", group: "FORM", tag: "WESTHEIMER & MCKEE 1977", title: "Hyperacuity",
  sub: "You can see two lines are misaligned by less than you can see a gap.",
  ref: "Westheimer, G., & McKee, S. P. (1977). Spatial configurations for visual hyperacuity. Vision Research, 17(8), 941–947.",
  blurb: "Two kinds of trial, in alternating blocks. VERNIER: is the lower line shifted left or right of the upper one? GAP: is the break in the line in its top half or its bottom half? Staircases find the smallest offset and the smallest gap you can see, in screen pixels, drawn with sub-pixel precision. Both scale with viewing distance in the same way, so their ratio is the result: vernier thresholds are several times finer than the gap (and finer than the spacing of your cones).",
  instructions: { lines: ["Short flashes of thin white lines. Sit normally and don't lean in.", "VERNIER blocks: two lines, one above the other. Is the LOWER line shifted LEFT or RIGHT?", "GAP blocks: one line with a tiny break. Is the break in the TOP half or the BOTTOM half? Guess when you can't see it."],
    keys: [["LEFT / RIGHT", "LOWER LINE SHIFTED"], ["UP / DOWN", "BREAK IN TOP / BOTTOM"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  6 BLOCKS OF 10", "FULL  10 BLOCKS OF 10");
    const nB = q ? 6 : 10, { g, cx, cy } = ctx, S = { vernier: stair(3, { step: .25, fine: .1, lo: -1.7, hi: 1.2 }), gap: stair(4, { step: .25, fine: .1, lo: -1.7, hi: 1.2 }) };
    const data = [];
    for (let b = 0; b < nB; b++) {
      const kind = b % 2 ? "gap" : "vernier";
      ctx.say(kind === "vernier" ? "VERNIER: is the lower line shifted LEFT or RIGHT of the upper one?" : "GAP: is the break in the TOP half or the BOTTOM half of the line?");
      ctx.clear(0); label(g, kind === "vernier" ? "VERNIER BLOCK" : "GAP BLOCK", cx, cy, "#7b7890", 30); await ctx.wait(1100);
      for (let i = 0; i < 10; i++) {
        const St = S[kind], size = St.x, sgn = Math.random() < .5 ? -1 : 1;
        ctx.status(`BLOCK ${b + 1} / ${nB}  ·  TRIAL ${i + 1} / 10`);
        ctx.clear(0); ctx.fix("#555", 2); await ctx.wait(450);
        const ox = Math.round(cx - 40 + uni(-14, 14)), oy = Math.round(cy - 85 + uni(-10, 10)), x0 = 39 + Math.random();   // whole-pixel and sub-pixel jitter
        ctx.clear(0);
        if (kind === "vernier") coverRects(g, ox, oy, 80, 170, [[x0, 10, x0 + 2, 80], [x0 + sgn * size, 90, x0 + 2 + sgn * size, 160]]);
        else { const gc = 85 + sgn * 30 + uni(-6, 6); coverRects(g, ox, oy, 80, 170, [[x0, 10, x0 + 2, gc - size / 2], [x0, gc + size / 2, x0 + 2, 160]]); }
        await ctx.wait(350); ctx.clear(0);
        const r = kind === "vernier" ? await ctx.key(["ArrowLeft", "ArrowRight"], LR) : await ctx.key(["ArrowUp", "ArrowDown"], { buttons: [["ArrowUp", "TOP HALF"], ["ArrowDown", "BOTTOM HALF"]] });
        const ok = kind === "vernier" ? (r.key === "ArrowRight") === (sgn > 0) : (r.key === "ArrowDown") === (sgn > 0);
        St.update(ok); data.push({ kind, x: size, ok });
      }
    }
    const fit = {}, thr = {};
    for (const k of ["vernier", "gap"]) { fit[k] = weibull2(data.filter(d => d.kind === k)); thr[k] = fit[k] ? fit[k].a : S[k].thr(); }
    const ratio = thr.gap / thr.vernier;
    ctx.status(""); ctx.plot({ title: "VERNIER VS GAP", x: { lo: .02, hi: 16, log: true, label: "SIZE  SCREEN PX", ticks: [.05, .1, .25, .5, 1, 2, 4, 8] }, y: { lo: 0, hi: 1, label: "P(CORRECT)", ticks: [0, .5, .75, 1] },
      series: [{ name: "VERNIER OFFSET", cls: "sG", pts: bins(data.filter(d => d.kind === "vernier")), curve: fit.vernier ? fit.vernier.p : null },
        { name: "GAP", cls: "sA", pts: bins(data.filter(d => d.kind === "gap")), curve: fit.gap ? fit.gap.p : null }],
      hlines: [{ y: .5, cls: "sD", label: "CHANCE" }], vlines: [{ x: thr.vernier, cls: "sG" }, { x: thr.gap, cls: "sA" }, { x: 1, cls: "sM", label: "ONE PIXEL", dy: -16 }],
      notes: [[`VERNIER ${f1(thr.vernier, 2)} PX`, "sG"], [`GAP ${f1(thr.gap, 2)} PX`, "sA"], [`RATIO ${f1(ratio, 1)}`, "sW"]] });
    ctx.say(propOK(data) < .6 ? "Your answers were close to chance overall, so these thresholds mean little. Look at the centre, take your time between trials, and try again." : !isFinite(ratio) ? "Not enough data for both thresholds. Try the full run."
      : ratio > 1.3 ? `You saw a vernier offset of ${f1(thr.vernier, 2)} px, ${f1(ratio, 1)} times finer than the smallest gap (${f1(thr.gap, 2)} px)${thr.vernier < 1 ? ", and less than one pixel" : ""}. Westheimer and McKee measured vernier thresholds of a few seconds of arc, finer than the spacing of the cones: the brain locates a line by pooling many receptors.`
      : `Vernier ${f1(thr.vernier, 2)} px and gap ${f1(thr.gap, 2)} px: no hyperacuity advantage this run. Usually vernier wins by a factor of several. Sit back (the display's pixels may have been the limit) and try the full run.`);
    ctx.csv("vernier_vs_gap.csv", ["trial", "task", "size_px", "correct"], data.map((d, i) => [i + 1, d.kind, d.x, d.ok ? 1 : 0]));
  } };

/* ---------------- Appelle (1972): the oblique effect ---------------- */
export const OBLIQUE = { id: "oblique", group: "FORM", tag: "APPELLE 1972", title: "The oblique effect",
  sub: "Small tilts are easier to see around vertical and horizontal than around diagonals.",
  ref: "Appelle, S. (1972). Perception and discrimination as a function of stimulus orientation: The \"oblique effect\" in man and animals. Psychological Bulletin, 78(4), 266–278.",
  blurb: "Two striped patches flash one after the other. Was the second turned clockwise or anticlockwise from the first? Staircases find the smallest turn you can see around vertical, horizontal and the diagonals. Angles are the same on any screen at any distance, so the result is the threshold in degrees and the oblique/cardinal ratio, usually about two.",
  instructions: { lines: ["Two striped patches flash in the middle of the screen, one after the other.", "Was the SECOND one turned CLOCKWISE or ANTICLOCKWISE compared with the first? Think of the hands of a clock.", "The turns get small. Guess when you're not sure."],
    keys: [["LEFT", "ANTICLOCKWISE"], ["RIGHT", "CLOCKWISE"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  VERTICAL + DIAGONAL  60 TRIALS", "FULL  4 ORIENTATIONS  128 TRIALS");
    const REF = q ? [0, 45] : [0, 45, 90, 135], N = q ? 30 : 32, { cx, cy } = ctx;
    const st = Object.fromEntries(REF.map(r => [r, stair(6, { step: .2, fine: .1, lo: -.7, hi: 1.4 })]));
    let order = []; for (let i = 0; i < N; i++) order.push(...shuffle(REF));
    const data = []; ctx.say("Second patch turned anticlockwise (LEFT) or clockwise (RIGHT)?");
    for (let t = 0; t < order.length; t++) {
      const ref = order[t], S = st[ref], d = S.x, sgn = Math.random() < .5 ? -1 : 1;
      ctx.status(`TRIAL ${t + 1} / ${order.length}`);
      ctx.clear(.5); ctx.fix("#000", 2); await ctx.wait(400);
      ctx.clear(.5); gabor(ctx.g, cx, cy, { ori: ref }); await ctx.wait(250);
      ctx.clear(.5); ctx.fix("#000", 2); await ctx.wait(450);
      ctx.clear(.5); gabor(ctx.g, cx, cy, { ori: ref + sgn * d }); await ctx.wait(250);
      ctx.clear(.5);
      const r = await ctx.key(["ArrowLeft", "ArrowRight"], { buttons: [["ArrowLeft", "ANTICLOCKWISE"], ["ArrowRight", "CLOCKWISE"]] });
      const ok = (r.key === "ArrowRight") === (sgn > 0); S.update(ok); data.push({ ref, x: d, ok });
    }
    const thrOf = (refs) => { const f = weibull2(data.filter(x => refs.includes(x.ref))); return f ? f.a : Math.exp(mean(refs.map(r => Math.log(st[r].thr())))); };
    const per = REF.map(r => [r, thrOf([r])]), card = thrOf(REF.filter(r => r % 90 === 0)), obl = thrOf(REF.filter(r => r % 90 !== 0)), ratio = obl / card;
    const yHi = Math.max(4, ...per.map(p => p[1]).filter(isFinite)) * 1.25;
    ctx.status(""); ctx.plot({ title: "ORIENTATION THRESHOLD", x: { lo: -20, hi: 155, label: "REFERENCE  DEG FROM VERTICAL", ticks: [0, 45, 90, 135] }, y: { lo: 0, hi: yHi, label: "THRESHOLD  DEG", ticks: [0, +(yHi / 2).toFixed(1), +yHi.toFixed(1)] },
      series: [{ name: "CARDINAL", cls: "sG", pts: per.filter(p => p[0] % 90 === 0) }, { name: "OBLIQUE", cls: "sA", pts: per.filter(p => p[0] % 90 !== 0) }],
      notes: [[`CARDINAL ${f1(card, 2)} DEG`, "sG"], [`OBLIQUE ${f1(obl, 2)} DEG`, "sA"], [`RATIO ${f1(ratio, 2)}`, "sW"]] });
    ctx.say(propOK(data) < .6 ? "Your answers were close to chance overall, so these thresholds mean little. Look at the centre, take your time between trials, and try again." : !isFinite(ratio) ? "Not enough data. Try again." : ratio > 1.2 ? `Around the diagonal you needed ${f1(obl, 1)}° of turn; around vertical only ${f1(card, 1)}°: ${f1(ratio, 1)} times worse. That's the oblique effect; Appelle's review found it in people, cats, monkeys and octopuses, and V1 has more neurons tuned to vertical and horizontal.`
      : `Cardinal ${f1(card, 1)}°, oblique ${f1(obl, 1)}°: no clear oblique effect this run (the usual ratio is about two). Try the full run.`);
    ctx.csv("oblique_effect.csv", ["trial", "reference_deg", "tilt_deg", "correct"], data.map((d, i) => [i + 1, d.ref, d.x, d.ok ? 1 : 0]));
  } };

/* ---------------- Glass (1969): Glass patterns ---------------- */
export const GLASS = { id: "glasspat", group: "FORM", tag: "GLASS 1969", title: "Glass patterns",
  sub: "Random dots in pairs. Line the pairs up and a swirl appears out of nowhere.",
  ref: "Glass, L. (1969). Moiré effect from random dots. Nature, 223(5206), 578–580.",
  blurb: "Two flashes of dot pairs; in one of them some of the pairs are lined up (in circles, or all parallel) and the rest point anywhere. Which flash had the pattern? Staircases find the fraction of lined-up pairs you need, for circles and for parallel lines. The fraction doesn't depend on the screen. Wilson, Wilkinson and Asaad (1997) found circles need fewer; Dakin and Bex (2002) traced part of that to the round window, so either result is honest.",
  instructions: { lines: ["Two quick flashes of white dots. The dots come in pairs.", "In ONE flash, some of the pairs line up into a pattern: circles, or parallel streaks. In the other they point every which way.", "Which flash had the pattern? Guess when you can't tell."],
    keys: [["1", "PATTERN IN FLASH 1"], ["2", "PATTERN IN FLASH 2"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  2 × 26 TRIALS", "FULL  2 × 44 TRIALS");
    const N = q ? 26 : 44, { g, cx, cy } = ctx, R = 225, ND = 260, SEP = 11;
    const st = { concentric: stair(.5, { step: .15, fine: .08, lo: -1.8, hi: 0 }), translational: stair(.5, { step: .15, fine: .08, lo: -1.8, hi: 0 }) };
    const draw = (coh, type) => { ctx.clear(0); g.fillStyle = "#fff"; const th0 = Math.random() * Math.PI, nS = Math.round(coh * ND);
      for (let i = 0; i < ND; i++) { const a = Math.random() * Math.PI * 2, r = (R - SEP) * Math.sqrt(Math.random()), x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        const o = i < nS ? (type === "concentric" ? a + Math.PI / 2 : th0) : Math.random() * Math.PI, dx = Math.cos(o) * SEP / 2, dy = Math.sin(o) * SEP / 2;
        g.fillRect(x - dx - 1.5, y - dy - 1.5, 3, 3); g.fillRect(x + dx - 1.5, y + dy - 1.5, 3, 3); }
      ctx.fix("#f44", 2); };
    let order = []; for (let i = 0; i < N; i++) order.push(...shuffle(["concentric", "translational"]));
    const data = []; ctx.say("Which flash had the pattern: 1 or 2?");
    for (let t = 0; t < order.length; t++) {
      const type = order[t], S = st[type], c = Math.min(1, S.x), which = Math.random() < .5 ? 1 : 2;
      ctx.status(`TRIAL ${t + 1} / ${order.length}`);
      ctx.clear(0); ctx.fix("#f44", 2); await ctx.wait(400);
      for (const iv of [1, 2]) { draw(iv === which ? c : 0, type); label(g, String(iv), cx, cy - R - 20, "#7b7890"); await ctx.wait(500); ctx.clear(0); ctx.fix("#f44", 2); await ctx.wait(iv === 1 ? 450 : 50); }
      const r = await ctx.key(["1", "2"], { buttons: [["1", "FLASH 1"], ["2", "FLASH 2"]] });
      const ok = +r.key === which; S.update(ok); data.push({ type, x: c, ok });
    }
    const fit = {}, thr = {};
    for (const k of ["concentric", "translational"]) { fit[k] = weibull2(data.filter(d => d.type === k)); thr[k] = Math.min(1, fit[k] ? fit[k].a : st[k].thr()); }
    const ratio = thr.translational / thr.concentric;
    ctx.status(""); ctx.plot({ title: "GLASS PATTERN DETECTION", x: { lo: .02, hi: 1, log: true, label: "FRACTION OF PAIRS LINED UP", ticks: [.03, .1, .3, 1] }, y: { lo: 0, hi: 1, label: "P(CORRECT)", ticks: [0, .5, .75, 1] },
      series: [{ name: "CONCENTRIC", cls: "sG", pts: bins(data.filter(d => d.type === "concentric"), .15), curve: fit.concentric ? fit.concentric.p : null },
        { name: "TRANSLATIONAL", cls: "sA", pts: bins(data.filter(d => d.type === "translational"), .15), curve: fit.translational ? fit.translational.p : null }],
      hlines: [{ y: .5, cls: "sD", label: "CHANCE" }], vlines: [{ x: thr.concentric, cls: "sG" }, { x: thr.translational, cls: "sA" }],
      notes: [[`CONCENTRIC ${pct(thr.concentric)}`, "sG"], [`TRANSLATIONAL ${pct(thr.translational)}`, "sA"], [`RATIO ${f1(ratio, 2)}`, "sW"]] });
    ctx.say(propOK(data) < .6 ? "Your answers were close to chance overall, so these thresholds mean little. Look at the centre, take your time between trials, and try again." : !isFinite(ratio) ? "Not enough data. Try again."
      : `You needed ${pct(thr.concentric)} of pairs lined up to see circles and ${pct(thr.translational)} for parallel streaks${ratio > 1.15 ? `: circles were ${f1(ratio, 1)} times easier, the advantage Wilson and colleagues reported` : ratio < .87 ? ": parallel streaks were easier for you, closer to what Dakin and Bex found once aperture edges were controlled" : ": about the same for both"}. Each pair is a local orientation; seeing the pattern means pooling them across the whole field.`);
    ctx.csv("glass_patterns.csv", ["trial", "type", "coherence", "correct"], data.map((d, i) => [i + 1, d.type, d.x, d.ok ? 1 : 0]));
  } };

/* ---------------- Field, Hayes & Hess (1993): contour integration ---------------- */
// Gabor elements accumulated into one float buffer, so neighbours add rather than clip
function gaborField(g, cx, cy, R, els, { lam = 12, sd = 4.2, c = .9 } = {}) {
  const pad = 16, n = 2 * (R + pad), buf = new Float32Array(n * n), rr = 14;
  for (const e of els) { const ex = e.x - cx + n / 2, ey = e.y - cy + n / 2, nx = -Math.sin(e.o), ny = Math.cos(e.o), pol = e.pol;
    for (let j = Math.max(0, Math.floor(ey - rr)); j <= Math.min(n - 1, Math.ceil(ey + rr)); j++) for (let i = Math.max(0, Math.floor(ex - rr)); i <= Math.min(n - 1, Math.ceil(ex + rr)); i++) {
      const u = i - ex, v = j - ey, d2 = u * u + v * v; if (d2 > rr * rr) continue;
      buf[j * n + i] += pol * Math.exp(-d2 / (2 * sd * sd)) * Math.cos(2 * Math.PI * (u * nx + v * ny) / lam); } }
  const img = g.createImageData(n, n);
  for (let p = 0; p < n * n; p++) { const v = Math.max(0, Math.min(255, Math.round(127.5 * (1 + c * buf[p]) + Math.random() - .5))); img.data[p * 4] = img.data[p * 4 + 1] = img.data[p * 4 + 2] = v; img.data[p * 4 + 3] = 255; }
  g.putImageData(img, Math.round(cx - n / 2), Math.round(cy - n / 2));
}
// a path of 10 elements (turning ±beta at each step) hidden in a field of randomly oriented ones at the same spacing.
// pathOrient false: the same positions, but the path's elements get random orientations (the comparison display)
function contourDisplay(cx, cy, R, { jitter, beta = 15, pathOrient = true }) {
  const SP = 32, n = 10, rad = Math.PI / 180, els = [];
  let d = Math.random() * Math.PI * 2, p = [0, 0]; const raw = [];
  for (let i = 0; i < n; i++) { d += (Math.random() < .5 ? -1 : 1) * beta * rad; const np = [p[0] + SP * Math.cos(d), p[1] + SP * Math.sin(d)]; raw.push({ x: (p[0] + np[0]) / 2, y: (p[1] + np[1]) / 2, o: d }); p = np; }
  const mx = mean(raw.map(e => e.x)), my = mean(raw.map(e => e.y)), a = Math.random() * Math.PI * 2, off = Math.random() * 70;
  for (const e of raw) els.push({ x: e.x - mx + cx + off * Math.cos(a), y: e.y - my + cy + off * Math.sin(a), path: true,
    o: pathOrient ? e.o + uni(-jitter, jitter) * rad : Math.random() * Math.PI, pol: Math.random() < .5 ? -1 : 1 });
  let tries = 0; const minD = SP * .88;
  while (tries++ < 5000) { const t = Math.random() * Math.PI * 2, r = (R - 8) * Math.sqrt(Math.random()), x = cx + r * Math.cos(t), y = cy + r * Math.sin(t);
    if (els.every(e => (e.x - x) ** 2 + (e.y - y) ** 2 > minD * minD)) els.push({ x, y, o: Math.random() * Math.PI, pol: Math.random() < .5 ? -1 : 1 }); }
  return els;
}
export const CONTOUR = { id: "contour", group: "FORM", tag: "FIELD, HAYES & HESS 1993", title: "Contour integration",
  sub: "A snake of aligned patches pops out of a jumble. Jitter their angles and it sinks.",
  ref: "Field, D. J., Hayes, A., & Hess, R. F. (1993). Contour integration by the human visual system: Evidence for a local \"association field\". Vision Research, 33(2), 173–193.",
  blurb: "Two flashes of small striped patches. In one, ten of them form a wiggly path, each patch lined up along it; in the other, the same positions hold randomly turned patches. Which had the path? The patches' alignment is jittered by up to ±0°, 15°, 30°, 45°, or fully at random. The measure is accuracy against jitter: the path is found because neighbouring detectors that line up link together, so jumbling their angles breaks it.",
  instructions: { lines: ["Two quick flashes of small striped patches.", "In ONE flash, about ten patches line up into a smooth, wiggly path, like a snake. Which flash had the snake?", "Sometimes the snake's patches are crooked and hard to see. Guess when you can't tell."],
    keys: [["1", "SNAKE IN FLASH 1"], ["2", "SNAKE IN FLASH 2"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  50 TRIALS", "FULL  100 TRIALS");
    const J = [0, 15, 30, 45, 90], reps = q ? 10 : 20, { g, cx, cy } = ctx, R = 240;
    let trials = []; for (let r = 0; r < reps; r++) for (const j of J) trials.push(j); trials = shuffle(trials);
    const data = []; ctx.say("Which flash had the snake: 1 or 2?");
    for (let t = 0; t < trials.length; t++) {
      const jit = trials[t], which = Math.random() < .5 ? 1 : 2; ctx.status(`TRIAL ${t + 1} / ${trials.length}`);
      const disp = [1, 2].map(iv => contourDisplay(cx, cy, R, { jitter: jit, pathOrient: iv === which }));
      ctx.clear(.5); ctx.fix("#000", 2); await ctx.wait(400);
      for (const iv of [1, 2]) { ctx.clear(.5); gaborField(g, cx, cy, R, disp[iv - 1]); label(g, String(iv), cx - R - 40, cy - R + 10, "#333"); await ctx.wait(700);
        ctx.clear(.5); ctx.fix("#000", 2); await ctx.wait(iv === 1 ? 500 : 50); }
      const r = await ctx.key(["1", "2"], { buttons: [["1", "FLASH 1"], ["2", "FLASH 2"]] });
      data.push({ jit, ok: +r.key === which });
    }
    const pts = J.map(j => [j, propOK(data.filter(d => d.jit === j))]), p0 = pts[0][1], pR = pts[pts.length - 1][1];
    ctx.status(""); ctx.plot({ title: "FINDING THE SNAKE", x: { lo: -8, hi: 98, label: "ORIENTATION JITTER  +/- DEG", ticks: [0, 15, 30, 45, 90] }, y: { lo: 0, hi: 1, label: "P(CORRECT)", ticks: [0, .5, .75, 1] },
      series: [{ name: "PATH FOUND", cls: "sG", pts, line: true }], hlines: [{ y: .5, cls: "sD", label: "CHANCE" }],
      vlines: [{ x: 90, cls: "sM", label: "RANDOM", dy: -16 }], notes: [[`ALIGNED ${pct(p0)}`, "sG"], [`RANDOM ${pct(pR)}`, "sR"]] });
    ctx.say(!isFinite(p0 - pR) ? "Not enough data. Try again." : p0 - pR > .15 ? `Aligned, you found the snake ${pct(p0)} of the time; with its patches turned at random, ${pct(pR)}, about chance. Same positions, same spacing: only the alignment changed. Field, Hayes and Hess called the linking rule an "association field".`
      : `Aligned ${pct(p0)}, random ${pct(pR)}: not the usual big drop. Keep your eyes in the middle and try the full run.`);
    ctx.csv("contour_integration.csv", ["trial", "jitter_deg", "correct"], data.map((d, i) => [i + 1, d.jit, d.ok ? 1 : 0]));
  } };

/* ---------------- Beck (1966): texture segregation ---------------- */
function glyph(g, x, y, type, rot, s = 13) {
  g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 180); g.beginPath();
  if (type === "T") { g.moveTo(-s, -s); g.lineTo(s, -s); g.moveTo(0, -s); g.lineTo(0, s); }
  else { g.moveTo(-s, -s); g.lineTo(-s, s); g.lineTo(s, s); }
  g.stroke(); g.restore();
}
export const TEXTURE = { id: "texseg", group: "FORM", tag: "BECK 1966", title: "Texture segregation",
  sub: "Tilted Ts split off from upright Ts at a glance; Ls, made of the same lines, don't.",
  ref: "Beck, J. (1966). Effect of orientation and of shape similarity on perceptual grouping. Perception & Psychophysics, 1(5), 300–302.",
  blurb: "A field of upright Ts flashes and is masked. Hidden in it is a patch of different shapes, above, below, left or right of the centre: either TILTED Ts (the same shape, turned) or Ls (the same two lines, rearranged). Where was the patch? One at a glance, the other only with scrutiny: the early visual system groups by line orientation, not by how lines are put together. Accuracy against flash length is the result.",
  instructions: { lines: ["A screen full of Ts flashes for a moment, then a scramble covers it.", "Somewhere in the Ts is a patch of different shapes, ABOVE, BELOW, LEFT or RIGHT of the centre.", "Press the arrow pointing to where the patch was. Guess if you have to."],
    keys: [["ARROWS", "WHERE THE ODD PATCH WAS"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  48 TRIALS", "FULL  96 TRIALS");
    const reps = q ? 12 : 24, DUR = [100, 250], { g, cx, cy } = ctx, SPC = 56, COLS = 15, ROWS = 9, x0 = cx - (COLS - 1) / 2 * SPC, y0 = cy - (ROWS - 1) / 2 * SPC;
    const WHERE = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -3], ArrowDown: [0, 3] };
    let trials = []; for (let r = 0; r < reps; r++) for (const cond of ["tilt", "L"]) for (const dur of DUR) trials.push({ cond, dur }); trials = shuffle(trials);
    const data = []; ctx.say("Where was the odd patch? Use the arrows.");
    for (let t = 0; t < trials.length; t++) {
      const T = trials[t], loc = rnd(Object.keys(WHERE)), [dc, dr] = WHERE[loc], c0 = (COLS - 1) / 2 + dc, r0 = (ROWS - 1) / 2 + dr;
      ctx.status(`TRIAL ${t + 1} / ${trials.length}`);
      ctx.clear(.12); ctx.fix("#fff", 3); await ctx.wait(500);
      ctx.clear(.12); g.strokeStyle = "#eee"; g.lineWidth = 3; g.lineCap = "round";
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const odd = Math.abs(c - c0) <= 1 && Math.abs(r - r0) <= 1, x = x0 + c * SPC + uni(-5, 5), y = y0 + r * SPC + uni(-5, 5);
        if (r === (ROWS - 1) / 2 && c === (COLS - 1) / 2) continue;   // keep the centre clear for the fixation point
        if (!odd) glyph(g, x, y, "T", 0); else if (T.cond === "tilt") glyph(g, x, y, "T", 45); else glyph(g, x, y, "L", 0);
      }
      await ctx.wait(T.dur);
      ctx.clear(.12); g.strokeStyle = "#eee"; g.lineWidth = 3;   // the mask: every element's strokes at once
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const x = x0 + c * SPC, y = y0 + r * SPC; for (const [ty, ro] of [["T", 0], ["T", 45], ["L", 0], ["L", 180]]) glyph(g, x + uni(-4, 4), y + uni(-4, 4), ty, ro); }
      await ctx.wait(300); ctx.clear(.12);
      const r = await ctx.key(Object.keys(WHERE), { buttons: [["ArrowLeft", "LEFT"], ["ArrowUp", "ABOVE"], ["ArrowDown", "BELOW"], ["ArrowRight", "RIGHT"]] });
      data.push({ ...T, loc, said: r.key, ok: r.key === loc });
    }
    const ser = [["tilt", "TILTED TS", "sG"], ["L", "LS", "sA"]].map(([c, name, cls]) => ({ name, cls, line: true, pts: DUR.map(d => [d, propOK(data.filter(x => x.cond === c && x.dur === d))]) }));
    const pt = ser[0].pts[0][1], pl = ser[1].pts[0][1];
    ctx.status(""); ctx.plot({ title: "WHERE WAS THE PATCH", x: { lo: 50, hi: 300, label: "FLASH  MS", ticks: DUR }, y: { lo: 0, hi: 1, label: "P(CORRECT)", ticks: [0, .25, .5, .75, 1] }, series: ser,
      hlines: [{ y: .25, cls: "sD", label: "CHANCE" }], notes: [[`TILTED AT ${DUR[0]} MS ${pct(pt)}`, "sG"], [`LS AT ${DUR[0]} MS ${pct(pl)}`, "sA"]] });
    ctx.say(!isFinite(pt - pl) ? "Not enough data. Try again." : pt - pl > .1 ? `In a ${DUR[0]} ms flash you found the tilted Ts ${pct(pt)} of the time and the Ls ${pct(pl)}. Seen one at a time, a tilted T looks more like a T than an L does, yet the Ls hide in the texture. Beck's point: grouping runs on simple features like line orientation, not on shape.`
      : `Tilted ${pct(pt)}, Ls ${pct(pl)} in the short flash: not the usual gap. Keep your eyes on the centre and try the full run.`);
    ctx.csv("texture_segregation.csv", ["trial", "patch", "flash_ms", "location", "response", "correct"], data.map((d, i) => [i + 1, d.cond, d.dur, d.loc, d.said, d.ok ? 1 : 0]));
  } };

/* =====================================================================================================================
   MOTION
   ===================================================================================================================== */

/* ---------------- Newsome & Paré (1988): motion coherence ---------------- */
export const COHERENCE = { id: "rdkcoh", group: "MOTION", tag: "NEWSOME & PARÉ 1988", title: "Motion coherence",
  sub: "A snowstorm of dots, a few drifting together. How few can you follow?",
  ref: "Newsome, W. T., & Paré, E. B. (1988). A selective impairment of motion perception following lesions of the middle temporal visual area (MT). Journal of Neuroscience, 8(6), 2201–2211.",
  blurb: "A random-dot kinematogram: on every frame some dots step left or right together and the rest jump somewhere new. Which way was the drift? The percentage of coherent dots you need is the threshold. It is a proportion, so it travels across screens; monkeys with lesions of area MT needed many times more.",
  instructions: { lines: ["A patch of flickering dots appears for just over half a second. Keep your eyes on the red dot.", "Some of the dots drift together, LEFT or RIGHT; the rest jump around at random.", "Which way did they drift? Sometimes almost none do: then guess."],
    keys: [["LEFT", "DRIFT LEFT"], ["RIGHT", "DRIFT RIGHT"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  50 TRIALS", "FULL  120 TRIALS");
    const C = q ? [.03, .06, .12, .25, .5] : [.02, .04, .08, .16, .32, .64], reps = q ? 10 : 20, { g, cx, cy, ppd } = ctx;
    const R = 5 * ppd, ND = 160, SPD = 6 * ppd, DT = 1 / 60;
    let trials = []; for (let r = 0; r < reps; r++) for (const c of C) trials.push(c); trials = shuffle(trials);
    const place = () => { const a = Math.random() * Math.PI * 2, r = R * Math.sqrt(Math.random()); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const data = []; ctx.say("Which way did the dots drift?");
    for (let t = 0; t < trials.length; t++) {
      const c = trials[t], dir = Math.random() < .5 ? -1 : 1; ctx.status(`TRIAL ${t + 1} / ${trials.length}`);
      ctx.clear(0); ctx.fix("#f33", 3); await ctx.wait(400);
      const dots = Array.from({ length: ND }, place); let acc = 0;
      // dots update at 60 Hz whatever the display's rate: signal dots step, noise dots are replotted
      await ctx.loop((tt, dt) => { acc += Math.min(dt, .1);
        while (acc >= DT) { acc -= DT; for (let i = 0; i < ND; i++) { if (Math.random() < c) { dots[i][0] += dir * SPD * DT; if (Math.hypot(dots[i][0] - cx, dots[i][1] - cy) > R) { dots[i][0] -= dir * 2 * Math.sqrt(Math.max(0, R * R - (dots[i][1] - cy) ** 2)); } } else dots[i] = place(); } }
        ctx.clear(0); g.fillStyle = "#fff"; for (const [x, y] of dots) g.fillRect(x - 2, y - 2, 4, 4); ctx.fix("#f33", 3); return tt < .6; });
      ctx.clear(0); ctx.fix("#f33", 3);
      const r = await ctx.key(["ArrowLeft", "ArrowRight"], LR);
      data.push({ x: c, dir, ok: (r.key === "ArrowRight") === (dir > 0) });
    }
    const fit = weibull2(data), thr = fit ? fit.a : NaN;
    const pts = C.map(c => [c, propOK(data.filter(d => d.x === c))]);
    ctx.status(""); ctx.plot({ title: "MOTION COHERENCE", x: { lo: .015, hi: .8, log: true, label: "COHERENT DOTS", ticks: [.02, .05, .1, .2, .5] }, y: { lo: 0, hi: 1, label: "P(CORRECT)", ticks: [0, .5, .75, 1] },
      series: [{ name: "YOU", cls: "sG", pts, curve: fit ? fit.p : null }], hlines: [{ y: .5, cls: "sD", label: "CHANCE" }], vlines: fit ? [{ x: thr, cls: "sA", label: `THRESHOLD ${pct(thr)}`, dy: 16 }] : [],
      notes: [[`THRESHOLD ${pct(thr)}`, "sA"], [`CORRECT ${pct(propOK(data))}`, "sW"]] });
    ctx.say(!fit ? "Couldn't fit a threshold: the answers were flat. Try the full run." : `You could tell the direction (80% correct) with ${pct(thr)} of the dots moving together. Healthy observers usually land somewhere from a few percent to about 15% with displays this short. Newsome and Paré's monkeys needed many times more after lesions of area MT, while seeing contrast as well as ever.`);
    ctx.csv("motion_coherence.csv", ["trial", "coherence", "direction", "correct"], data.map((d, i) => [i + 1, d.x, d.dir > 0 ? "right" : "left", d.ok ? 1 : 0]));
  } };

/* ---------------- Johansson (1973): the point-light walker ---------------- */
// a hand-built gait cycle: hip, knee, shoulder and elbow angles as phase-shifted sinusoids; 13 joints, facing +x,
// y up, origin at the hips. ph is the gait phase in radians, h the body height.
function walkerJoints(ph, h) {
  const bob = .018 * h * Math.cos(2 * ph), out = [[.02 * h, .43 * h + bob]];
  const sh = [], el = [], wr = [], hp = [], kn = [], an = [];
  for (const side of [0, 1]) {
    const p = ph + side * Math.PI, dz = side ? -.012 * h : .012 * h;
    const a = .42 * Math.sin(p), k = .12 + .95 * Math.max(0, Math.cos(p + .3)) ** 2;
    const hip = [dz, bob], knee = [hip[0] + .245 * h * Math.sin(a), hip[1] - .245 * h * Math.cos(a)], ank = [knee[0] + .25 * h * Math.sin(a - k), knee[1] - .25 * h * Math.cos(a - k)];
    const b = -.35 * Math.sin(p), e = .3 + .35 * Math.max(0, -Math.sin(p)), s = [dz * 1.5, .3 * h + bob];
    const elb = [s[0] + .17 * h * Math.sin(b), s[1] - .17 * h * Math.cos(b)], wri = [elb[0] + .16 * h * Math.sin(b + e), elb[1] - .16 * h * Math.cos(b + e)];
    sh.push(s); el.push(elb); wr.push(wri); hp.push(hip); kn.push(knee); an.push(ank);
  }
  return out.concat(sh, el, wr, hp, kn, an);
}
const JMEAN = (() => { const m = Array.from({ length: 13 }, () => [0, 0]); for (let i = 0; i < 64; i++) walkerJoints(i / 64 * Math.PI * 2, 1).forEach((p, j) => { m[j][0] += p[0] / 64; m[j][1] += p[1] / 64; }); return m; })();
export const BIOMOTION = { id: "biowalk", group: "MOTION", tag: "JOHANSSON 1973", title: "Point-light walker",
  sub: "Thirteen dots, and you see a person walking. Upside down, much less so.",
  ref: "Johansson, G. (1973). Visual perception of biological motion and a model for its analysis. Perception & Psychophysics, 14(2), 201–211.",
  blurb: "Thirteen moving dots at a walker's joints, walking on the spot, facing left or right, hidden among extra dots that each copy one joint's motion. Which way is the walker facing? Accuracy falls as masking dots are added, and falls further when the walker is upside down (Sumi, 1984): the brain's walker detector is tuned to bodies the right way up.",
  instructions: { lines: ["A cluster of moving white dots appears for about a second. Some of the dots are a person walking on the spot; the others are camouflage.", "Which way is the walker FACING: LEFT or RIGHT?", "Sometimes the walker is upside down. Still say which way it faces."],
    keys: [["LEFT", "FACING LEFT"], ["RIGHT", "FACING RIGHT"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  48 TRIALS", "FULL  96 TRIALS");
    const M = [0, 25, 50, 100], reps = q ? 6 : 12, { g, cx, cy } = ctx, hgt = 190, AW = 170, AH = 120;
    let trials = []; for (let r = 0; r < reps; r++) for (const m of M) for (const inv of [0, 1]) trials.push({ m, inv }); trials = shuffle(trials);
    const data = []; ctx.say("Which way is the walker facing?");
    for (let t = 0; t < trials.length; t++) {
      const T = trials[t], face = Math.random() < .5 ? -1 : 1, ph0 = Math.random() * Math.PI * 2, ox = cx + uni(-30, 30), oy = cy + uni(-20, 20), vs = T.inv ? 1 : -1;
      ctx.status(`TRIAL ${t + 1} / ${trials.length}`);
      const mask = Array.from({ length: T.m }, () => ({ j: Math.floor(Math.random() * 13), f: Math.random() < .5 ? -1 : 1, ph: Math.random() * Math.PI * 2, x: cx + uni(-AW, AW), y: cy + uni(-AH, AH) }));
      ctx.clear(0); ctx.fix("#888", 2); await ctx.wait(400);
      await ctx.loop((tt) => { const ph = ph0 + tt / 1.0 * Math.PI * 2, J = walkerJoints(ph, hgt);
        ctx.clear(0); g.fillStyle = "#fff";
        for (const [x, y] of J) disc(g, ox + face * x, oy + vs * y, 3.5);
        for (const d of mask) { const p = walkerJoints(d.ph + ph, hgt)[d.j], m = JMEAN[d.j]; disc(g, d.x + d.f * (p[0] - m[0] * hgt), d.y + vs * (p[1] - m[1] * hgt), 3.5); }
        return tt < 1.2; });
      ctx.clear(0);
      const r = await ctx.key(["ArrowLeft", "ArrowRight"], LR);
      data.push({ ...T, face, ok: (r.key === "ArrowRight") === (face > 0) });
    }
    const ser = [[0, "UPRIGHT", "sG"], [1, "UPSIDE DOWN", "sA"]].map(([inv, name, cls]) => ({ name, cls, line: true, pts: M.map(m => [m, propOK(data.filter(d => d.inv === inv && d.m === m))]) }));
    const up = propOK(data.filter(d => !d.inv && d.m > 0)), dn = propOK(data.filter(d => d.inv && d.m > 0));
    ctx.status(""); ctx.plot({ title: "WHICH WAY IS IT FACING", x: { lo: -10, hi: 110, label: "MASKING DOTS", ticks: M }, y: { lo: 0, hi: 1, label: "P(CORRECT)", ticks: [0, .5, .75, 1] }, series: ser,
      hlines: [{ y: .5, cls: "sD", label: "CHANCE" }], notes: [[`UPRIGHT IN MASK ${pct(up)}`, "sG"], [`INVERTED IN MASK ${pct(dn)}`, "sA"]] });
    ctx.say(!isFinite(up - dn) ? "Not enough data. Try again." : `Hidden in camouflage, you got the upright walker's direction ${pct(up)} of the time and the upside-down one's ${pct(dn)}${up - dn > .05 ? ": same dots, same motions, but inverted they stop being a person" : ": little inversion cost this run"}. Johansson showed a dozen moving dots are enough to see a body; they are useless as a still frame.`);
    ctx.csv("point_light_walker.csv", ["trial", "mask_dots", "inverted", "facing", "correct"], data.map((d, i) => [i + 1, d.m, d.inv, d.face > 0 ? "right" : "left", d.ok ? 1 : 0]));
  } };

/* ---------------- Nijhawan (1994): the flash-lag effect ---------------- */
export const FLASHLAG = { id: "flashlag", group: "MOTION", tag: "NIJHAWAN 1994", title: "Flash-lag",
  sub: "A flash lined up with a moving bar looks like it fell behind.",
  ref: "Nijhawan, R. (1994). Motion extrapolation in catching. Nature, 370(6487), 256–257.",
  blurb: "A bar glides across the screen; another flashes for an instant just above it. Was the flash left or right of the moving bar? At true alignment the flash looks behind. The flash's offset is set in milliseconds of the bar's travel, so the point of subjective alignment comes out in ms, the same on any screen, and should stay about the same in ms at two speeds (while doubling in pixels).",
  instructions: { lines: ["Keep your eyes on the grey dot. A white bar slides across the screen below it.", "At some moment a second bar flashes briefly above the moving one.", "Was the FLASH to the LEFT or to the RIGHT of the moving bar at that moment?"],
    keys: [["LEFT", "FLASH WAS LEFT OF IT"], ["RIGHT", "FLASH WAS RIGHT OF IT"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  48 TRIALS", "FULL  96 TRIALS");
    const OFF = [-60, -20, 20, 60, 100, 140], SPD = [10, 20], reps = q ? 4 : 8, { g, cx, cy, ppd } = ctx;
    let trials = []; for (let r = 0; r < reps; r++) for (const o of OFF) for (const s of SPD) trials.push({ off: o, spd: s }); trials = shuffle(trials);
    const bar = (x, y) => g.fillRect(x - 4, y - 28, 8, 56);
    const data = []; ctx.say("Was the flash LEFT or RIGHT of the moving bar?");
    for (let t = 0; t < trials.length; t++) {
      const T = trials[t], dir = Math.random() < .5 ? -1 : 1, v = T.spd * ppd, tf = uni(.55, .75), xc = cx + uni(-50, 50), x0 = xc - dir * v * tf;
      ctx.status(`TRIAL ${t + 1} / ${trials.length}`);
      ctx.clear(0); g.fillStyle = "#888"; disc(g, cx, cy, 4); await ctx.wait(400);
      let fa = null, fx = 0;
      await ctx.loop((tt) => { const x = x0 + dir * v * tt; ctx.clear(0); g.fillStyle = "#888"; disc(g, cx, cy, 4); g.fillStyle = "#fff"; bar(x, cy + 40);
        if (fa === null && tt >= tf) { fa = tt; fx = x + dir * v * T.off / 1000; }   // aligned to the bar as drawn on this very frame
        if (fa !== null && tt - fa < .016) bar(fx, cy - 40);
        return tt < tf + .45; });
      ctx.clear(0);
      const r = await ctx.key(["ArrowLeft", "ArrowRight"], LR);
      data.push({ ...T, dir, ahead: (r.key === "ArrowRight") === (dir > 0) ? 1 : 0 });
    }
    const fits = SPD.map(s => { const pts = OFF.map(o => { const d = data.filter(x => x.spd === s && x.off === o); return { x: o, k: d.filter(x => x.ahead).length, n: d.length }; });
      let fit = fitLogistic(pts); if (fit && !(fit.t75 > 0 && fit.t75 < 150)) fit = null; return { s, pts, fit }; });
    const lag = fits.map(f => f.fit ? f.fit.pse : NaN);
    ctx.status(""); ctx.plot({ title: "FLASH-LAG", x: { lo: -80, hi: 160, label: "FLASH AHEAD OF BAR  MS OF TRAVEL", ticks: [-60, -20, 20, 60, 100, 140] }, y: { lo: 0, hi: 1, label: "P(FLASH LOOKED AHEAD)", ticks: [0, .25, .5, .75, 1] },
      series: fits.map((f, i) => ({ name: `${f.s} DEG/S`, cls: i ? "sA" : "sG", pts: f.pts.map(p => [p.x, p.n ? p.k / p.n : NaN]), curve: f.fit ? (x) => logistic(x, f.fit.a, f.fit.b) : null })),
      hlines: [{ y: .5, cls: "sD" }], vlines: [{ x: 0, cls: "sM", label: "TRULY ALIGNED", dy: -16 }, ...fits.map((f, i) => f.fit ? { x: f.fit.pse, cls: i ? "sA" : "sG" } : null).filter(Boolean)],
      notes: fits.map((f, i) => [`${f.s} DEG/S  LAG ${f.fit ? Math.round(f.fit.pse) + " MS" : "-"}`, i ? "sA" : "sG"]).concat([[isFinite(lag[0] + lag[1]) ? `IN PX ${Math.round(lag[0] * SPD[0] * ppd / 1000)} AND ${Math.round(lag[1] * SPD[1] * ppd / 1000)}` : "", "sM"]]) });
    const L = mean(lag.filter(isFinite));
    ctx.say(!isFinite(L) ? "Couldn't fit the curves. Try the full run." : L > 10 ? `The flash had to lead the bar by about ${Math.round(L)} ms of its travel to look lined up: the moving bar is seen ahead of where it really is. Nijhawan read that as the brain extrapolating motion to cancel its own delays; others argue for faster processing of moving things. Typical lags are tens of milliseconds.`
      : `Lag about ${Math.round(L)} ms: little flash-lag this run (it's usually tens of milliseconds). Keep your eyes on the grey dot, not on the bar.`);
    ctx.csv("flash_lag.csv", ["trial", "speed_deg_s", "offset_ms", "direction", "said_flash_ahead"], data.map((d, i) => [i + 1, d.spd, d.off, d.dir > 0 ? "right" : "left", d.ahead]));
  } };

/* ---------------- Ternus (1926) / Pantle & Picciano (1976): element vs group motion ---------------- */
export const TERNUS = { id: "ternus", group: "MOTION", tag: "TERNUS 1926", title: "The Ternus display",
  sub: "Three dots step over. Does one dot jump the others, or do all three move?",
  ref: ["Ternus, J. (1926). Experimentelle Untersuchungen über phänomenale Identität. Psychologische Forschung, 7, 81–136.",
    "Pantle, A., & Picciano, L. (1976). A multistable movement display: Evidence for two separate motion systems in human vision. Science, 193(4252), 500–502."],
  blurb: "Three dots, then the same three shifted by one place, back and forth. With no gap between the frames, the end dot seems to hop over two dots that stay put (element motion); with a longer blank gap, all three move together (group motion). The blank gap where the percept flips is the result, in milliseconds, which needs no calibration.",
  instructions: { lines: ["Three white dots flick back and forth for a couple of seconds.", "Either ONE dot seems to jump from end to end while the middle two stay still, or ALL THREE seem to move together as a group.", "Say which you saw. Both are right answers: it's about what it looked like."],
    keys: [["E", "ONE DOT JUMPS (ELEMENT)"], ["G", "ALL MOVE TOGETHER (GROUP)"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  42 TRIALS", "FULL  84 TRIALS");
    const ISI = [0, 17, 33, 50, 67, 100, 150], reps = q ? 6 : 12, { g, cx, cy } = ctx, SP = 64, FR = .2;
    let trials = []; for (let r = 0; r < reps; r++) for (const i of ISI) trials.push(i); trials = shuffle(trials);
    const data = []; ctx.say("One dot jumping (E), or all three moving together (G)?");
    for (let t = 0; t < trials.length; t++) {
      const isi = trials[t] / 1000, cyc = 2 * (FR + isi), oy = cy + uni(-30, 30); ctx.status(`TRIAL ${t + 1} / ${trials.length}`);
      ctx.clear(0); await ctx.wait(400);
      await ctx.loop((tt) => { const p = tt % cyc; ctx.clear(0); g.fillStyle = "#fff";
        const fr = p < FR ? 0 : (p >= FR + isi && p < 2 * FR + isi) ? 1 : -1;
        if (fr >= 0) for (let k = 0; k < 3; k++) disc(g, cx + (k - 1.5 + fr) * SP, oy, 13);
        return tt < 3 * cyc; });
      ctx.clear(0);
      const r = await ctx.key(["e", "g"], { buttons: [["e", "ONE DOT JUMPS"], ["g", "ALL MOVE TOGETHER"]] });
      data.push({ isi: trials[t], group: r.key === "g" ? 1 : 0 });
    }
    const pts = ISI.map(i => { const d = data.filter(x => x.isi === i); return { x: i, k: d.filter(x => x.group).length, n: d.length }; });
    let fit = fitLogistic(pts); if (fit && !(fit.t75 > 0 && fit.t75 < 120)) fit = null;
    ctx.status(""); ctx.plot({ title: "ELEMENT OR GROUP", x: { lo: -10, hi: 160, label: "BLANK GAP BETWEEN FRAMES  MS", ticks: ISI }, y: { lo: 0, hi: 1, label: "P(GROUP MOTION)", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "YOU", cls: "sG", pts: pts.map(p => [p.x, p.n ? p.k / p.n : NaN]), curve: fit ? (x) => logistic(x, fit.a, fit.b) : null }], hlines: [{ y: .5, cls: "sD" }],
      vlines: fit ? [{ x: fit.pse, cls: "sA", label: `SWITCH ${Math.round(fit.pse)} MS`, dy: 16 }] : [], notes: [[fit ? `SWITCH AT ${Math.round(fit.pse)} MS` : "NO SWITCH FOUND", "sA"]] });
    const g0 = pts[0].n ? pts[0].k / pts[0].n : NaN, gN = pts[pts.length - 1].n ? pts[pts.length - 1].k / pts[pts.length - 1].n : NaN;
    ctx.say(fit && gN > g0 + .2 ? `Below about ${Math.round(fit.pse)} ms of blank you saw one dot hop; above it, the whole row moved. Pantle and Picciano took the switch as two motion systems: a short-range one that matches each dot to the dot in the same place, and a long-range one that matches whole shapes.`
      : `No clean switch this run (group ${pct(g0)} with no gap, ${pct(gN)} at ${ISI[ISI.length - 1]} ms). Usually short gaps give element motion and long ones group motion. Try the full run.`);
    ctx.csv("ternus.csv", ["trial", "isi_ms", "said_group"], data.map((d, i) => [i + 1, d.isi, d.group]));
  } };

/* =====================================================================================================================
   NUMBER
   ===================================================================================================================== */

/* ---------------- Ariely (2001): seeing sets ---------------- */
export const ENSEMBLE = { id: "ensemble", group: "NUMBER", tag: "ARIELY 2001", title: "Seeing the average",
  sub: "You can't say which circles were there, but you know their average size.",
  ref: "Ariely, D. (2001). Seeing sets: Representation by statistical properties. Psychological Science, 12(2), 157–162.",
  blurb: "Eight circles of four sizes flash, then one test circle appears. First block: was it one of the eight? Second block: is it bigger or smaller than their average? The comparison is relative to each display's own circles, so the screen doesn't matter. Ariely found people accept a never-shown circle of the mean size as often as real members, yet judge the mean finely.",
  instructions: { lines: ["Eight circles flash for half a second. Then a single test circle appears.", "First block: was the test circle EXACTLY one of the sizes you just saw? YES or NO.", "Second block: is the test circle BIGGER or SMALLER than the AVERAGE of the eight?"],
    keys: [["Y / N", "WAS IT IN THE SET"], ["UP / DOWN", "BIGGER / SMALLER THAN AVERAGE"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  24 + 28 TRIALS", "FULL  48 + 56 TRIALS");
    const { g, cx, cy } = ctx, DEL = [-.2, -.12, -.06, 0, .06, .12, .2];
    const showSet = async () => {
      const base = uni(36, 64), fac = [uni(.66, .76), uni(.8, .9), uni(1.1, 1.2), uni(1.24, 1.34)], dia = fac.flatMap(f => [f * base, f * base]), m = mean(dia);
      const cells = shuffle(Array.from({ length: 12 }, (_, i) => i)).slice(0, 8);
      ctx.clear(.25); ctx.fix("#fff", 3); await ctx.wait(500); ctx.clear(.25); g.fillStyle = "#e9e6ff";
      cells.forEach((c, i) => disc(g, cx + ((c % 4) - 1.5) * 150 + uni(-18, 18), cy + (Math.floor(c / 4) - 1) * 140 + uni(-14, 14), dia[i] / 2));
      await ctx.wait(500); ctx.clear(.25); await ctx.wait(400);
      return { dia, sizes: fac.map(f => f * base), m };
    };
    const probe = (d) => { ctx.clear(.25); g.fillStyle = "#e9e6ff"; disc(g, cx + uni(-20, 20), cy + uni(-20, 20), d / 2); };
    const mem = [], avg = [];
    let kinds = []; for (let i = 0; i < (q ? 6 : 12); i++) kinds.push("member", "member", "mean", "outside"); kinds = shuffle(kinds);
    ctx.say("Block 1: was the test circle EXACTLY one of the sizes in the set?");
    for (let t = 0; t < kinds.length; t++) {
      ctx.status(`MEMBER BLOCK  ${t + 1} / ${kinds.length}`); const S = await showSet(), k = kinds[t];
      const d = k === "member" ? rnd(S.sizes) : k === "mean" ? S.m : S.m * (Math.random() < .5 ? .52 : 1.5);
      probe(d); const r = await ctx.key(["y", "n"], { buttons: [["y", "YES, IT WAS THERE"], ["n", "NO"]] });
      mem.push({ kind: k, rel: d / S.m - 1, yes: r.key === "y" ? 1 : 0 });
    }
    ctx.clear(.25); label(g, "NOW: BIGGER OR SMALLER THAN THE AVERAGE?", cx, cy, "#ffb547", 30);
    ctx.say("Block 2: is the test circle BIGGER or SMALLER than the average of the set?");
    await ctx.key([" ", "Enter"], { buttons: [[" ", "GOT IT"]] });
    let dl = []; for (let i = 0; i < (q ? 4 : 8); i++) dl.push(...DEL); dl = shuffle(dl);
    for (let t = 0; t < dl.length; t++) {
      ctx.status(`AVERAGE BLOCK  ${t + 1} / ${dl.length}`); const S = await showSet();
      probe(S.m * (1 + dl[t])); const r = await ctx.key(["ArrowUp", "ArrowDown"], { buttons: [["ArrowDown", "SMALLER"], ["ArrowUp", "BIGGER"]] });
      avg.push({ rel: dl[t], big: r.key === "ArrowUp" ? 1 : 0 });
    }
    const pts = DEL.map(d => { const x = avg.filter(a => a.rel === d); return { x: d * 100, k: x.filter(a => a.big).length, n: x.length }; });
    let fit = fitLogistic(pts); if (fit && !(fit.t75 > 0 && fit.t75 < 40)) fit = null;   // a flat or reversed curve has no JND
    const yes = (k) => { const x = mem.filter(m => m.kind === k); return x.length ? mean(x.map(m => m.yes)) : NaN; };
    const pM = yes("member"), pA = yes("mean"), pO = yes("outside");
    const memPts = [[-25, mem.filter(m => m.kind === "member" && m.rel < 0)], [25, mem.filter(m => m.kind === "member" && m.rel > 0)]].map(([x, a]) => [x, a.length ? mean(a.map(m => m.yes)) : NaN]);
    ctx.status(""); ctx.plot({ title: "MEMBERS VS THE MEAN", x: { lo: -55, hi: 55, label: "TEST SIZE VS SET MEAN  %", ticks: [-50, -25, 0, 25, 50] }, y: { lo: 0, hi: 1, label: "PROPORTION", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "P(BIGGER THAN MEAN)", cls: "sA", pts: pts.map(p => [p.x, p.n ? p.k / p.n : NaN]), curve: fit ? (x) => logistic(x, fit.a, fit.b) : null },
        { name: "SAID MEMBER: REAL ONES", cls: "sG", pts: memPts },
        { name: "SAID MEMBER: NEW ONES", cls: "sR", pts: [[0, pA], ...[[-48, (m) => m.rel < 0], [50, (m) => m.rel > 0]].map(([x, f]) => { const a = mem.filter(m => m.kind === "outside" && f(m)); return [x, a.length ? mean(a.map(m => m.yes)) : NaN]; })] }],
      notes: [[`REAL MEMBERS ${pct(pM)} YES`, "sG"], [`NEW AT THE MEAN ${pct(pA)} YES`, "sR"], [`NEW OUT OF RANGE ${pct(pO)} YES`, "sM"], [fit ? `MEAN JND ${f1(fit.t75, 1)}%` : "", "sA"]] });
    ctx.say(!isFinite(pM - pA) ? "Not enough data. Try again." : `You said "yes, it was there" to ${pct(pM)} of real members and ${pct(pA)} of mean-sized circles that were never shown${fit ? `, but you could tell the test from the average with about ${f1(fit.t75, 0)}% difference` : ""}. Ariely's finding: the individual circles are lost; the set's average is kept.`);
    ctx.csv("ensemble_mean.csv", ["block", "trial", "probe", "size_vs_mean", "response"], [...mem.map((m, i) => ["member", i + 1, m.kind, m.rel, m.yes ? "yes" : "no"]), ...avg.map((a, i) => ["average", i + 1, "delta", a.rel, a.big ? "bigger" : "smaller"])]);
  } };

/* ---------------- Kaufman, Lord, Reese & Volkmann (1949): subitizing ---------------- */
export const SUBITIZE = { id: "subitize", group: "NUMBER", tag: "KAUFMAN ET AL. 1949", title: "Subitizing",
  sub: "Up to about four, you just see how many. After that you have to count or guess.",
  ref: "Kaufman, E. L., Lord, M. W., Reese, T. W., & Volkmann, J. (1949). The discrimination of visual number. American Journal of Psychology, 62(4), 498–525.",
  blurb: "One to eight dots flash for a fifth of a second. Type how many. Reaction time and accuracy against the number of dots are flat-ish then bend: the elbow is the edge of subitizing. A two-line fit finds it; reaction-time differences and accuracy need no calibration.",
  instructions: { lines: ["Some white dots flash for a moment.", "Type how many there were, from 1 to 8, as fast as you can while staying accurate.", "With many dots there isn't time to count: give your best guess."],
    keys: [["1 TO 8", "HOW MANY DOTS"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  48 TRIALS", "FULL  96 TRIALS");
    const NS = [1, 2, 3, 4, 5, 6, 7, 8], reps = q ? 6 : 12, { g, cx, cy } = ctx;
    let trials = []; for (let r = 0; r < reps; r++) trials.push(...NS); trials = shuffle(trials);
    const data = []; ctx.say("How many dots? Fast but accurate.");
    for (let t = 0; t < trials.length; t++) {
      const n = trials[t]; ctx.status(`TRIAL ${t + 1} / ${trials.length}`);
      ctx.clear(0); ctx.fix("#888", 3); await ctx.wait(500);
      let pts = scatter(n, cx, cy, 170, 34); while (pts.length < n) pts = scatter(n, cx, cy, 170, 30);
      ctx.clear(0); g.fillStyle = "#fff"; for (const [x, y] of pts) disc(g, x, y, uni(6, 11));
      const t0 = performance.now(); await ctx.wait(200); ctx.clear(0);
      const tk = performance.now(), r = await ctx.key(NS.map(String), { quiet: true }), rt = tk - t0 + r.rt;   // from the dots' onset
      data.push({ n, said: +r.key, ok: +r.key === n, rt });
    }
    const acc = NS.map(n => propOK(data.filter(d => d.n === n)));
    const rts = NS.map(n => { const ok = data.filter(d => d.n === n && d.ok).map(d => d.rt); return median(ok.length >= 2 ? ok : data.filter(d => d.n === n).map(d => d.rt)); });
    // two straight lines joined at an elbow k: RT = a + b1·min(n, k) + b2·max(0, n − k); k by grid search
    let best = null;
    for (let k = 2; k <= 7.001; k += .1) { const X = NS.map(n => [1, Math.min(n, k), Math.max(0, n - k)]), b = lsq(X, rts); if (!b) continue;
      const sse = NS.reduce((s, n, i) => s + (b[0] + b[1] * X[i][1] + b[2] * X[i][2] - rts[i]) ** 2, 0); if (!best || sse < best.sse) best = { k, b, sse }; }
    let span = 0; for (let i = 0; i < NS.length && acc[i] >= .9; i++) span = NS[i];
    const yMax = Math.ceil(Math.max(1200, ...rts.filter(isFinite)) / 200) * 200;
    ctx.status(""); ctx.plot({ title: "HOW MANY", x: { lo: .5, hi: 8.5, label: "DOTS", ticks: NS }, y: { lo: 0, hi: yMax, label: "MEDIAN RT  MS", ticks: [0, yMax / 2, yMax] },
      series: [{ name: "RT", cls: "sG", pts: NS.map((n, i) => [n, rts[i]]), curve: best ? (n) => best.b[0] + best.b[1] * Math.min(n, best.k) + best.b[2] * Math.max(0, n - best.k) : null },
        { name: "ACCURACY  X 1000", cls: "sA", pts: NS.map((n, i) => [n, acc[i] * 1000]), line: true }],
      vlines: best ? [{ x: best.k, cls: "sM", label: `ELBOW ${f1(best.k, 1)}`, dy: -16 }] : [],
      notes: best ? [[`ELBOW AT ${f1(best.k, 1)} DOTS`, "sW"], [`BELOW ${Math.round(best.b[1])} MS PER DOT`, "sG"], [`ABOVE ${Math.round(best.b[2])} MS PER DOT`, "sG"], [span ? `90% RIGHT UP TO ${span}` : "", "sA"]] : [] });
    ctx.say(!best ? "Not enough data. Try again." : best.b[2] < best.b[1] + 40 ? `No clear elbow this run: your times rose about ${Math.round(best.b[1])} ms per dot before ${f1(best.k, 1)} dots and ${Math.round(best.b[2])} after. Usually the line is nearly flat up to about four dots, then climbs steeply. Try the full run, and answer as fast as you can.`
      : `Your times rose ${Math.round(best.b[1])} ms per dot up to about ${f1(best.k, 1)} dots, then ${Math.round(best.b[2])} ms per dot after${span ? `, and you were at least 90% right up to ${span}` : ""}. Kaufman and colleagues named the fast, confident range "subitizing"; it usually ends at about four.`);
    ctx.csv("subitizing.csv", ["trial", "n_dots", "response", "correct", "rt_ms"], data.map((d, i) => [i + 1, d.n, d.said, d.ok ? 1 : 0, d.rt]));
  } };

/* ---------------- Burr & Ross (2008): adaptation to number ---------------- */
export const NUMADAPT = { id: "numadapt", group: "NUMBER", tag: "BURR & ROSS 2008", title: "Number adaptation",
  sub: "Stare at a crowd of dots, and the next handful looks like fewer.",
  ref: "Burr, D., & Ross, J. (2008). A visual sense of number. Current Biology, 18(6), 425–428.",
  blurb: "Two dot patches flash, left and right of the centre: which has more? First without adaptation, then after staring past a dense, flickering patch of 400 dots on one side. The reference patch on the adapted side has 30 dots; the matching number on the other side (the PSE) drops after adaptation. The ratio of the two PSEs is the result; Burr and Ross found it about halved.",
  instructions: { lines: ["Keep your eyes on the centre cross for the whole run, even when a busy patch of dots is flickering to one side.", "Two patches of dots flash, one LEFT and one RIGHT of the cross. Which patch had MORE dots?", "Go with your impression; there's no time to count."],
    keys: [["LEFT", "LEFT HAD MORE"], ["RIGHT", "RIGHT HAD MORE"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  14 + 21 TRIALS", "FULL  28 + 42 TRIALS");
    const LV = [9, 12, 16, 21, 28, 37, 48], REF = 30, { g, cx, cy, ppd } = ctx, ECC = 7 * ppd, R = 4 * ppd, side = Math.random() < .5 ? -1 : 1;
    const A0 = q ? 15 : 30, TOP = q ? 3 : 6;
    const patch = (x, n) => { const pts = scatter(n, x, cy, R - 4, n > 100 ? 7 : 14); pts.forEach(([px, py], i) => { g.fillStyle = i % 2 ? "#000" : "#fff"; disc(g, px, py, 3); }); };
    const cross = () => { g.strokeStyle = "#000"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx - 9, cy); g.lineTo(cx + 9, cy); g.moveTo(cx, cy - 9); g.lineTo(cx, cy + 9); g.stroke(); };
    const adapt = async (secs) => { let last = -1; await ctx.loop((tt) => { const fr = Math.floor(tt * 4); if (fr !== last) { last = fr; ctx.clear(.5); patch(cx + side * ECC, 400); cross(); } return tt < secs; }); };
    const data = [];
    const block = async (adapted, reps) => {
      let tr = []; for (let r = 0; r < reps; r++) tr.push(...LV); tr = shuffle(tr);
      if (adapted) { ctx.say(`Adaptation: ${A0} seconds. Eyes on the cross; don't look at the dots.`); await adapt(A0); }
      for (let t = 0; t < tr.length; t++) {
        ctx.status(`${adapted ? "ADAPTED" : "BASELINE"}  ${t + 1} / ${tr.length}`);
        if (adapted && t > 0) { ctx.say("Top-up. Eyes on the cross."); await adapt(TOP); }
        ctx.clear(.5); cross(); await ctx.wait(400);
        ctx.clear(.5); patch(cx + side * ECC, REF); patch(cx - side * ECC, tr[t]); cross(); await ctx.wait(400);
        ctx.clear(.5); cross(); ctx.say("Which side had MORE dots?");
        const r = await ctx.key(["ArrowLeft", "ArrowRight"], LR);
        data.push({ adapted, probe: tr[t], probeMore: (r.key === "ArrowRight") === (side < 0) ? 1 : 0 });
      }
    };
    ctx.say("First, a baseline with no adaptation. Eyes on the cross.");
    await block(false, q ? 2 : 4);
    ctx.clear(.5); label(g, "NOW THE ADAPTATION BLOCK", cx, cy - 40, "#000", 30); label(g, "KEEP YOUR EYES ON THE CROSS", cx, cy + 10, "#000", 24);
    await ctx.key([" ", "Enter"], { buttons: [[" ", "START ADAPTING"]] });
    await block(true, q ? 3 : 6);
    const res = [false, true].map(ad => { const pts = LV.map(n => { const d = data.filter(x => x.adapted === ad && x.probe === n); return { x: Math.log(n), k: d.filter(x => x.probeMore).length, n: d.length }; });
      let fit = fitLogistic(pts); if (fit && !(fit.t75 > 0 && fit.t75 < 1.2)) fit = null; return { pts, fit, pse: fit ? Math.exp(fit.pse) : NaN }; });
    const ratio = res[0].pse / res[1].pse;
    ctx.status(""); ctx.plot({ title: "NUMBER ADAPTATION", x: { lo: 8, hi: 54, log: true, label: "DOTS ON THE UNADAPTED SIDE", ticks: [10, 15, 20, 30, 45] }, y: { lo: 0, hi: 1, label: "P(THAT SIDE LOOKED MORE)", ticks: [0, .25, .5, .75, 1] },
      series: res.map((r, i) => ({ name: i ? "AFTER ADAPTING" : "BASELINE", cls: i ? "sA" : "sG", pts: r.pts.map(p => [Math.exp(p.x), p.n ? p.k / p.n : NaN]), curve: r.fit ? (x) => logistic(Math.log(x), r.fit.a, r.fit.b) : null })),
      hlines: [{ y: .5, cls: "sD" }], vlines: [{ x: REF, cls: "sM", label: "30 DOTS", dy: -16 }, ...res.map((r, i) => isFinite(r.pse) ? { x: r.pse, cls: i ? "sA" : "sG" } : null).filter(Boolean)],
      notes: [[`BASELINE MATCH ${f1(res[0].pse, 0)}`, "sG"], [`ADAPTED MATCH ${f1(res[1].pse, 0)}`, "sA"], [`RATIO ${f1(ratio, 2)}`, "sW"]] });
    ctx.say(!isFinite(ratio) ? "Couldn't fit both curves. Try the full run." : ratio > 1.15 ? `Before adapting, 30 dots matched ${f1(res[0].pse, 0)}; after, they matched only ${f1(res[1].pse, 0)}: ${f1(ratio, 1)} times fewer. Burr and Ross found adaptation roughly halves apparent number, and argued number is a primary visual property, like colour or motion.`
      : `Baseline match ${f1(res[0].pse, 0)}, adapted ${f1(res[1].pse, 0)}: little adaptation this run. Keep your eyes on the cross during adaptation, and try the full run.`);
    ctx.csv("number_adaptation.csv", ["trial", "block", "adapted_side", "reference_dots", "probe_dots", "probe_judged_more"], data.map((d, i) => [i + 1, d.adapted ? "adapted" : "baseline", side > 0 ? "right" : "left", REF, d.probe, d.probeMore]));
  } };

export const LIB_VISION = [BLINDSPOT, VERNIER, OBLIQUE, GLASS, CONTOUR, TEXTURE, COHERENCE, BIOMOTION, FLASHLAG, TERNUS, ENSEMBLE, SUBITIZE, NUMADAPT];
