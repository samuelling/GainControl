// CLASSICS, continued: five short, famous experiments, each the simplest faithful version that runs on a canvas.
//   Campbell & Robson (1968)   contrast sensitivity across spatial frequency (2IFC, interleaved 2-down-1-up staircases)
//   Posner (1980)              orienting of attention: valid, neutral and invalid central cues, detection RT
//   Cooper & Shepard (1973)    mental rotation of letters (the 2D cousin of Shepard & Metzler, 1971)
//   Bouma (1970)               crowding: letter identification at 6° against flanker spacing
//   Halberda et al. (2008)     the approximate number system: which side has more dots? Weber fraction w
// Display caveat (also on the About screen): 36 px per degree is nominal (it depends on screen size and viewing
// distance), and contrast assumes a linear display. Thresholds are for comparing conditions, not for publishing.
import { fitLogistic, logistic, mean, median, sem, shuffle, linFit, nelderMead } from "./fit.js";

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
// a Gabor or grating patch with random dithering, so contrasts below one grey level still average out right
function patch(g, x, y, { c, sf, ori = 0, ppd, size = 4, sd = .9, bg = .5 }) {
  const n = Math.round(size * ppd), img = g.createImageData(n, n), f = sf / ppd, th = ori * Math.PI / 180, ph = Math.random() * Math.PI * 2, s = sd * ppd;
  const ct = Math.cos(th), st = Math.sin(th);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const u = i - n / 2, v = j - n / 2, env = Math.exp(-(u * u + v * v) / (2 * s * s));
    const L = 255 * bg * (1 + c * env * Math.sin(2 * Math.PI * f * (u * ct + v * st) + ph)) + Math.random() - .5, k = (j * n + i) * 4;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = Math.max(0, Math.min(255, Math.round(L))); img.data[k + 3] = 255;
  }
  g.putImageData(img, Math.round(x - n / 2), Math.round(y - n / 2));
}
const Phi = (x) => .5 * (1 + erf(x / Math.SQRT2));
function erf(x) { const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + .3275911 * x);
  return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x)); }
const quick = (ctx, q, f) => ctx.choose("How long?", [["q", q], ["f", f]]).then(k => k === "q");

/* ---------------- Campbell & Robson (1968): the contrast sensitivity function ---------------- */
export const CSF = { id: "csf", group: "CLASSICS", tag: "CAMPBELL & ROBSON 1968", title: "Contrast sensitivity",
  sub: "How faint can a grating be before it disappears? Depends on how fine it is.",
  ref: "Campbell, F. W., & Robson, J. G. (1968). Application of Fourier analysis to the visibility of gratings. Journal of Physiology, 197(3), 551–566.",
  blurb: "Two intervals, each marked by a tick; a faint striped patch is in one of them. Press 1 or 2 for the interval that had it. Guess when you're unsure; the computer adjusts the contrast for each stripe width separately.",
  instructions: { lines: ["Each trial has two intervals, each marked by a tick. A faint striped patch appears in ONE of them, in the middle of the screen.", "Press 1 or 2 for the interval that had the patch. If you're not sure, guess: the computer makes it fainter when you're right and stronger when you're wrong."],
    keys: [["1", "PATCH IN INTERVAL 1"], ["2", "PATCH IN INTERVAL 2"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  4 FREQUENCIES × 24 TRIALS", "FULL  5 FREQUENCIES × 40 TRIALS");
    const SF = q ? [1, 2, 4, 8] : [.5, 1, 2, 4, 8], N = q ? 24 : 40;
    // one 2-down-1-up staircase per spatial frequency (converges on 70.7% correct), steps in log10 contrast
    const st = SF.map(sf => ({ sf, lc: Math.log10(.15), step: .2, run: 0, last: 0, rev: [], n: 0, hist: [] }));
    let order = []; for (let i = 0; i < N; i++) order.push(...shuffle(st.map((_, k) => k)));
    ctx.say("Eyes on the centre. Tick, interval one. Tick, interval two. Which one had the stripes?");
    for (let t = 0; t < order.length; t++) {
      const S = st[order[t]], c = Math.pow(10, S.lc), which = Math.random() < .5 ? 1 : 2;
      ctx.status(`TRIAL ${t + 1} / ${order.length}  ·  ${S.sf} CYCLES/DEG`);
      ctx.clear(.5); ctx.fix("#000", 3); await ctx.wait(500);
      for (const iv of [1, 2]) {
        window.SFX && window.SFX.play("tock");
        ctx.clear(.5); if (iv === which) patch(ctx.g, ctx.cx, ctx.cy, { c, sf: S.sf, ppd: ctx.ppd }); ctx.fix("#000", 2);
        ctx.g.fillStyle = "#000"; ctx.g.font = "600 20px 'Saira Condensed'"; ctx.g.textAlign = "center"; ctx.g.fillText(String(iv), ctx.cx, ctx.cy - 110);
        await ctx.wait(300); ctx.clear(.5); ctx.fix("#000", 3); await ctx.wait(500);
      }
      const r = await ctx.key(["1", "2"], { buttons: [["1", "INTERVAL 1"], ["2", "INTERVAL 2"]] });
      const ok = +r.key === which; S.n++; S.hist.push([c, ok]);
      // 2-down-1-up
      let dir = 0;
      if (ok) { S.run++; if (S.run === 2) { S.run = 0; dir = -1; } } else { S.run = 0; dir = 1; }
      if (dir) { if (S.last && dir !== S.last) { S.rev.push(S.lc); if (S.rev.length === 2) S.step = .1; } S.last = dir; S.lc = Math.min(0, S.lc + dir * S.step); }
    }
    const thr = st.map(S => { const r = S.rev.slice(2); const use = r.length >= 2 ? r : S.hist.slice(-8).map(h => Math.log10(h[0]));
      return { sf: S.sf, t: Math.pow(10, mean(use)), n: S.rev.length }; });
    const pts = thr.map(h => [h.sf, 1 / h.t]), yMax = Math.max(50, ...pts.map(p => p[1])) * 1.3;
    ctx.plot({ title: "CONTRAST SENSITIVITY FUNCTION", x: { lo: .4, hi: 10, log: true, label: "SPATIAL FREQUENCY  CYCLES/DEG", ticks: [.5, 1, 2, 4, 8] },
      y: { lo: 0, hi: yMax, label: "SENSITIVITY  1/THRESHOLD", ticks: [0, Math.round(yMax / 2), Math.round(yMax)] },
      series: [{ name: "YOU", cls: "sG", pts, line: true }], notes: thr.map(h => [`${h.sf} CPD  ${(h.t * 100).toFixed(2)}%`, "sW"]) });
    const peak = thr.reduce((a, b) => (1 / b.t > 1 / a.t ? b : a));
    ctx.say(`Most sensitive at ${peak.sf} cycles per degree, where you saw stripes at ${(peak.t * 100).toFixed(1)}% contrast. Sensitivity falls off for coarser stripes and, faster, for finer ones: the inverted U Campbell and Robson found.`);
    ctx.csv("contrast_sensitivity.csv", ["sf_cpd", "threshold_contrast", "sensitivity", "reversals"], thr.map(h => [h.sf, h.t, 1 / h.t, h.n]));
  } };

/* ---------------- Posner (1980): orienting of attention ---------------- */
export const POSNER = { id: "posner", group: "CLASSICS", tag: "POSNER 1980", title: "Orienting of attention",
  sub: "An arrow points left or right. It's usually right. What does it buy you?",
  ref: "Posner, M. I. (1980). Orienting of attention. Quarterly Journal of Experimental Psychology, 32(1), 3–25.",
  blurb: "Keep your eyes on the centre. An arrow (or a plus sign) appears, then a square flashes in one of the boxes. Press SPACE as soon as you see it. The arrow is right 80% of the time. On a few trials nothing comes: don't press.",
  instructions: { lines: ["Keep your eyes on the centre. Two boxes sit left and right of it.", "An arrow (or a plus sign) appears, then a small square flashes in one of the boxes. Press SPACE as fast as you can when you see it.", "The arrow points to the right box most of the time, but not always. On a few trials no square appears: then don't press anything."],
    keys: [["SPACE", "I SAW THE SQUARE"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  60 TRIALS", "FULL  150 TRIALS");
    const N = q ? 60 : 150, { g, cx, cy, ppd } = ctx, ecc = 7 * ppd, bs = 1.4 * ppd;
    const trials = [];
    for (let i = 0; i < N; i++) { const r = Math.random(), side = Math.random() < .5 ? -1 : 1;
      if (r < .1) trials.push({ kind: "catch", cue: rnd(["left", "right", "neutral"]), side: 0 });
      else if (r < .4) trials.push({ kind: "neutral", cue: "neutral", side });
      else trials.push({ kind: Math.random() < .8 ? "valid" : "invalid", cue: null, side }); }
    for (const t of trials) if (!t.cue) t.cue = (t.kind === "valid") === (t.side < 0) ? "left" : "right";
    const boxes = () => { ctx.clear(.12); g.strokeStyle = "#ccc"; g.lineWidth = 2; for (const s of [-1, 1]) g.strokeRect(cx + s * ecc - bs / 2, cy - bs / 2, bs, bs); };
    const cue = (c) => { g.strokeStyle = "#fff"; g.lineWidth = 3; g.beginPath();
      if (c === "neutral") { g.moveTo(cx - 14, cy); g.lineTo(cx + 14, cy); g.moveTo(cx, cy - 14); g.lineTo(cx, cy + 14); }
      else { const d = c === "left" ? -1 : 1; g.moveTo(cx - d * 16, cy); g.lineTo(cx + d * 16, cy); g.moveTo(cx + d * 6, cy - 9); g.lineTo(cx + d * 16, cy); g.lineTo(cx + d * 6, cy + 9); }
      g.stroke(); };
    const data = []; ctx.say("SPACE as soon as the square appears. Nothing on catch trials. Eyes on the centre.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i]; ctx.status(`TRIAL ${i + 1} / ${trials.length}`);
      boxes(); ctx.fix("#fff", 3); await ctx.wait(700);
      boxes(); cue(T.cue); const soa = 500 + Math.random() * 500; await ctx.wait(soa);
      if (T.kind !== "catch") { g.fillStyle = "#fff"; g.fillRect(cx + T.side * ecc - bs * .3, cy - bs * .3, bs * .6, bs * .6); }
      const r = await ctx.key([" "], { buttons: [[" ", "SEEN IT"]], timeout: 1200, quiet: true });
      const pressed = r.key === " ";
      data.push({ ...T, soa, rt: pressed ? r.rt : null, pressed });
      boxes();
      if (pressed && r.rt < 120) { ctx.say("Too fast: that was before the square could be seen. Wait for it."); await ctx.wait(900); }
      else if (T.kind === "catch" && pressed) { ctx.say("Nothing came that time. Don't press on catch trials."); await ctx.wait(900); }
      else ctx.say("SPACE as soon as the square appears. Nothing on catch trials. Eyes on the centre.");
      await ctx.wait(400);
    }
    const ok = (k) => data.filter(d => d.kind === k && d.pressed && d.rt >= 120).map(d => d.rt);
    const K = [["valid", "VALID", "sG"], ["neutral", "NEUTRAL", "sW"], ["invalid", "INVALID", "sR"]];
    const m = Object.fromEntries(K.map(([k]) => [k, mean(ok(k))]));
    const fa = data.filter(d => d.kind === "catch" && d.pressed).length, nc = data.filter(d => d.kind === "catch").length;
    const yLo = Math.floor(Math.min(...Object.values(m).filter(isFinite), 300) / 50) * 50 - 50, yHi = Math.ceil(Math.max(...Object.values(m).filter(isFinite), 400) / 50) * 50 + 50;
    ctx.plot({ title: "DETECTION RT BY CUE", x: { lo: 0, hi: 4, label: "CUE", ticks: [] }, y: { lo: yLo, hi: yHi, label: "MEAN RT MS", ticks: [yLo, Math.round((yLo + yHi) / 2), yHi] },
      series: K.map(([k, name, cls], i) => ({ name, cls, pts: [[i + 1, m[k], sem(ok(k))]] })),
      notes: [[`BENEFIT ${isFinite(m.neutral - m.valid) ? (m.neutral - m.valid).toFixed(0) : "-"} MS`, "sG"], [`COST ${isFinite(m.invalid - m.neutral) ? (m.invalid - m.neutral).toFixed(0) : "-"} MS`, "sR"], [`CATCH PRESSES ${fa} / ${nc}`, "sM"]] });
    ctx.say(!isFinite(m.valid - m.invalid) ? "Not enough usable trials in every condition. Wait for the square before pressing, and try again." : `A valid arrow saved you ${(m.neutral - m.valid).toFixed(0)} ms; an invalid one cost you ${(m.invalid - m.neutral).toFixed(0)} ms. Your eyes didn't move. Your attention did.`);
    ctx.csv("posner_cueing.csv", ["trial", "kind", "cue", "target_side", "soa_ms", "pressed", "rt_ms"], data.map((d, i) => [i + 1, d.kind, d.cue, d.side, d.soa, d.pressed ? 1 : 0, d.rt ?? ""]));
  } };

/* ---------------- Cooper & Shepard (1973): mental rotation ---------------- */
export const ROTATION = { id: "rotation", group: "CLASSICS", tag: "COOPER & SHEPARD 1973", title: "Mental rotation",
  sub: "Is the letter normal or mirror-reversed? The answer takes longer the further it's turned.",
  ref: "Cooper, L. A., & Shepard, R. N. (1973). Chronometric studies of the rotation of mental images. In W. G. Chase (Ed.), Visual information processing (pp. 75–176). New York: Academic Press.",
  blurb: "A letter appears, rotated. Is it the normal letter (N) or its mirror image (M)? As fast as you can without mistakes.",
  instructions: { lines: ["A letter appears in the middle of the screen, rotated by some angle.", "Decide whether it is the normal letter or its mirror image. Answer as fast as you can without making mistakes."],
    keys: [["N", "NORMAL"], ["M", "MIRROR IMAGE"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  48 TRIALS", "FULL  120 TRIALS");
    const ANG = [0, 60, 120, 180, 240, 300], LET = ["R", "F", "G", "J"], reps = q ? 4 : 10, { g, cx, cy } = ctx;
    let trials = []; for (let r = 0; r < reps; r++) for (const a of ANG) for (const mir of [0, 1]) trials.push({ a, mir, l: rnd(LET) });
    trials = shuffle(trials).slice(0, q ? 48 : 120);
    const data = []; ctx.say("Normal letter: N. Mirror image: M.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i]; ctx.status(`TRIAL ${i + 1} / ${trials.length}`);
      ctx.clear(0); ctx.fix("#fff", 3); await ctx.wait(500);
      ctx.clear(0); g.save(); g.translate(cx, cy); g.rotate(T.a * Math.PI / 180); if (T.mir) g.scale(-1, 1);
      g.fillStyle = "#e9e6ff"; g.font = "bold 150px Helvetica, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(T.l, 0, 0); g.restore();
      const r = await ctx.key(["n", "m"], { buttons: [["n", "NORMAL"], ["m", "MIRROR"]], quiet: true });
      data.push({ ...T, said: r.key === "m" ? 1 : 0, rt: r.rt }); ctx.clear(0); await ctx.wait(300);
    }
    const dep = (a) => Math.min(a, 360 - a), D = [0, 60, 120, 180];
    const ser = [[0, "NORMAL", "sG"], [1, "MIRROR", "sA"]].map(([mir, name, cls]) => ({ name, cls, line: true,
      pts: D.map(d => { const rts = data.filter(x => x.mir === mir && dep(x.a) === d && x.said === mir).map(x => x.rt); return [d, median(rts)]; }).filter(p => isFinite(p[1])) }));
    const fit = ser[0].pts.length > 1 ? linFit(ser[0].pts.map(p => p[0]), ser[0].pts.map(p => p[1])) : { m: NaN };
    const acc = data.filter(d => d.said === d.mir).length / data.length, yMax = Math.ceil(Math.max(1200, ...ser.flatMap(s => s.pts.map(p => p[1]))) / 200) * 200;
    ctx.plot({ title: "RT BY ROTATION", x: { lo: -15, hi: 195, label: "DEGREES FROM UPRIGHT", ticks: D }, y: { lo: 0, hi: yMax, label: "MEDIAN RT MS", ticks: [0, yMax / 2, yMax] },
      series: ser, notes: [[`SLOPE ${fit.m.toFixed(1)} MS/DEG`, "sG"], [isFinite(fit.m) && fit.m > .5 ? `ABOUT ${(1000 / fit.m).toFixed(0)} DEG/S` : "", "sW"], [`CORRECT ${(acc * 100).toFixed(0)}%`, "sM"]] });
    ctx.say(isFinite(fit.m) && fit.m > .5 ? `Every extra degree cost you about ${fit.m.toFixed(1)} ms: as if you turned the letter upright in your head, at roughly ${(1000 / fit.m).toFixed(0)} degrees a second.`
      : "No clear rotation cost this time. Try the full run, and don't guess.");
    ctx.csv("mental_rotation.csv", ["trial", "letter", "angle", "mirror", "said_mirror", "rt_ms"], data.map((d, i) => [i + 1, d.l, d.a, d.mir, d.said, d.rt]));
  } };

/* ---------------- Bouma (1970): crowding ---------------- */
export const CROWDING = { id: "crowding", group: "CLASSICS", tag: "BOUMA 1970", title: "Crowding",
  sub: "A letter you can read alone becomes unreadable between neighbours.",
  ref: "Bouma, H. (1970). Interaction effects in parafoveal letter recognition. Nature, 226(5241), 177–178.",
  blurb: "Keep your eyes on the centre dot. A letter flashes 6° to the side, sometimes with a letter on either side of it. Name the MIDDLE letter. Don't look at it; it's gone before your eyes could get there anyway.",
  instructions: { lines: ["Keep your eyes on the centre dot. Don't look to the side.", "A letter flashes 6° to one side, sometimes with another letter close on either side of it. It is gone before your eyes could get there.", "Type the MIDDLE letter. It is always one of D H K N R S V Z. Guess if you have to."],
    keys: [["D H K N R S V Z", "TYPE THE MIDDLE LETTER"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  70 TRIALS", "FULL  140 TRIALS");
    const LET = ["D", "H", "K", "N", "R", "S", "V", "Z"], SP = [0, .9, 1.5, 2.2, 3, 4.5], reps = q ? 10 : 20, { g, cx, cy, ppd } = ctx, ecc = 6 * ppd, size = .9 * ppd;
    let trials = []; for (let r = 0; r < reps; r++) for (const s of [...SP, Infinity]) trials.push({ s }); trials = shuffle(trials);
    const data = []; ctx.say("Eyes on the dot. Name the middle letter.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], side = Math.random() < .5 ? -1 : 1, tgt = rnd(LET), fl = shuffle(LET.filter(l => l !== tgt)).slice(0, 2);
      ctx.status(`TRIAL ${i + 1} / ${trials.length}`);
      ctx.clear(.5); ctx.fix("#000", 4); await ctx.wait(600);
      g.fillStyle = "#000"; g.font = `bold ${size}px Helvetica, Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
      const x = cx + side * ecc; g.fillText(tgt, x, cy);
      if (isFinite(T.s) && T.s > 0) { g.fillText(fl[0], x - T.s * ppd, cy); g.fillText(fl[1], x + T.s * ppd, cy); }
      await ctx.frames(ctx.ms2f(150)); ctx.clear(.5); ctx.fix("#000", 4);
      const r = await ctx.key(LET.map(l => l.toLowerCase()), { buttons: LET.map(l => [l.toLowerCase(), l]), quiet: true });
      data.push({ spacing: isFinite(T.s) ? T.s : "alone", side, tgt, said: r.key.toUpperCase(), ok: r.key.toUpperCase() === tgt });
    }
    const pc = (s) => { const d = data.filter(x => x.spacing === s); return d.length ? d.filter(x => x.ok).length / d.length : NaN; };
    const alone = pc("alone"), pts = SP.filter(s => s > 0).map(s => [s, pc(s)]);
    // critical spacing: where performance gets halfway between chance (1/8) and unflanked
    const half = (1 / 8 + alone) / 2; let crit = NaN;
    for (let i = 1; i < pts.length; i++) if (pts[i - 1][1] < half && pts[i][1] >= half) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; crit = x0 + (half - y0) / (y1 - y0) * (x1 - x0); break; }
    ctx.plot({ title: "CROWDING AT 6 DEG", x: { lo: 0, hi: 5, label: "FLANKER SPACING  DEG", ticks: [1, 2, 3, 4, 5] }, y: { lo: 0, hi: 1, label: "P(CORRECT)", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "FLANKED", cls: "sG", pts, line: true }], hlines: [{ y: alone, cls: "sW", label: "ALONE" }, { y: 1 / 8, cls: "sD", label: "CHANCE" }],
      vlines: [{ x: 3, cls: "sM", label: "BOUMA: HALF THE ECCENTRICITY", dy: -16 }, ...(isFinite(crit) ? [{ x: crit, cls: "sA", label: `YOURS ${crit.toFixed(1)}`, dy: 16 }] : [])],
      notes: [[`ALONE ${(alone * 100).toFixed(0)}%`, "sW"], [isFinite(crit) ? `CRITICAL SPACING ${crit.toFixed(1)} DEG` : "CRITICAL SPACING -", "sA"]] });
    ctx.say(isFinite(crit) ? `Alone, you named the letter ${(alone * 100).toFixed(0)}% of the time. With neighbours closer than about ${crit.toFixed(1)}° it fell apart. Bouma's rule of thumb: about half the eccentricity, so 3° here.`
      : "The curve didn't cross halfway. Try the full run, and keep your eyes on the dot.");
    ctx.csv("crowding.csv", ["trial", "spacing_deg", "side", "target", "response", "correct"], data.map((d, i) => [i + 1, d.spacing, d.side, d.tgt, d.said, d.ok ? 1 : 0]));
  } };

/* ---------------- Halberda, Mazzocco & Feigenson (2008): the approximate number system ---------------- */
export const NUMBER = { id: "number", group: "CLASSICS", tag: "HALBERDA, MAZZOCCO & FEIGENSON 2008", title: "Number sense",
  sub: "Which side has more dots? Too fast to count, and still you can tell.",
  ref: "Halberda, J., Mazzocco, M. M. M., & Feigenson, L. (2008). Individual differences in non-verbal number acuity correlate with maths achievement. Nature, 455(7213), 665–668.",
  blurb: "Two clouds of dots flash for a moment, yellow on the left, blue on the right. Which has more? Too fast to count. D for yellow, K for blue.",
  instructions: { lines: ["Two clouds of dots flash for a moment: yellow on the left, blue on the right.", "Which cloud had more dots? They're gone too fast to count, so go with your impression."],
    keys: [["D", "YELLOW HAD MORE"], ["K", "BLUE HAD MORE"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  60 TRIALS", "FULL  120 TRIALS");
    const RAT = [1.1, 1.2, 1.33, 1.5, 2], reps = q ? 12 : 24, { g, cx, cy, ppd } = ctx;
    let trials = []; for (let r = 0; r < reps; r++) for (const ratio of RAT) trials.push({ ratio }); trials = shuffle(trials);
    const cloud = (n, x0, col, sizeMode) => { const pts = [], R = 5 * ppd, rr = sizeMode ? 7 : 11 * Math.sqrt(10 / n);   // equal size or equal total area
      let tries = 0; while (pts.length < n && tries++ < 4000) { const a = Math.random() * Math.PI * 2, r = R * Math.sqrt(Math.random()), x = x0 + r * Math.cos(a), y = cy + r * Math.sin(a);
        if (pts.every(p => Math.hypot(p[0] - x, p[1] - y) > rr * 2.4)) pts.push([x, y]); }
      g.fillStyle = col; for (const [x, y] of pts) { g.beginPath(); g.arc(x, y, Math.max(3, rr), 0, Math.PI * 2); g.fill(); } };
    const data = []; ctx.say("D if yellow has more, K if blue has more.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], small = 6 + Math.floor(Math.random() * 9), big = Math.round(small * T.ratio), yellowMore = Math.random() < .5;
      const nY = yellowMore ? big : small, nB = yellowMore ? small : big, sizeMode = Math.random() < .5;
      ctx.status(`TRIAL ${i + 1} / ${trials.length}`);
      ctx.clear(.5); ctx.fix("#000", 3); await ctx.wait(500);
      ctx.clear(.5); cloud(nY, cx - 6.5 * ppd, "rgb(250,215,40)", sizeMode); cloud(nB, cx + 6.5 * ppd, "rgb(60,120,255)", sizeMode);
      await ctx.frames(ctx.ms2f(300)); ctx.clear(.5);
      const r = await ctx.key(["d", "k"], { buttons: [["d", "YELLOW MORE"], ["k", "BLUE MORE"]], quiet: true });
      data.push({ ratio: big / small, nY, nB, ok: (r.key === "d") === yellowMore, sizeMode });
    }
    // the model: P(correct) = Φ(|n1 − n2| / (w √(n1² + n2²))); w is the Weber fraction
    const nll = ([lw]) => { const w = Math.exp(lw); let L = 0; for (const d of data) { const p = Math.min(1 - 1e-6, Math.max(.5, Phi(Math.abs(d.nY - d.nB) / (w * Math.hypot(d.nY, d.nB)))));
      L -= d.ok ? Math.log(p) : Math.log(1 - p); } return L; };
    const w = Math.min(3, Math.max(.02, Math.exp(nelderMead(nll, [Math.log(.2)])[0])));
    const pts = RAT.map(ra => { const d = data.filter(x => Math.abs(x.ratio - ra) < .08); return [ra, d.length ? d.filter(x => x.ok).length / d.length : NaN]; });
    ctx.plot({ title: "WHICH HAS MORE", x: { lo: 1, hi: 2.1, label: "RATIO  BIGGER / SMALLER", ticks: [1.1, 1.2, 1.33, 1.5, 2] }, y: { lo: .4, hi: 1, label: "P(CORRECT)", ticks: [.5, .75, 1] },
      series: [{ name: "YOU", cls: "sA", pts, curve: (ra) => Phi((ra - 1) / (w * Math.hypot(ra, 1))) }], hlines: [{ y: .5, cls: "sD", label: "CHANCE" }],
      notes: [[`WEBER FRACTION w ${w.toFixed(2)}`, "sA"], [`CORRECT ${(data.filter(d => d.ok).length / data.length * 100).toFixed(0)}%`, "sW"]] });
    ctx.say(w >= 1.5 ? "Your answers look close to chance at every ratio, so there's no Weber fraction to fit. Try again, and go with your gut." : `Your Weber fraction is ${w.toFixed(2)}. Accuracy depends on the ratio, not the difference: telling 10 from 12 is as hard as telling 20 from 24. Adults are typically around 0.1 to 0.3; Halberda and colleagues found that it tracked children's maths scores.`);
    ctx.csv("number_sense.csv", ["trial", "n_yellow", "n_blue", "ratio", "equal_size_dots", "correct"], data.map((d, i) => [i + 1, d.nY, d.nB, d.ratio, d.sizeMode ? 1 : 0, d.ok ? 1 : 0]));
  } };
