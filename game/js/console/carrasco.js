// CLASSICS: Carrasco, Ling & Read (2004), "Attention alters appearance", Nature Neuroscience 7:308–313, Experiment 2.
// Two Gabors (2° × 2°, 2 or 4 cpd, each tilted 45° left or right) at 4° left and right of fixation. A small black dot
// (0.3°) flashes 1.5° above one of them (a peripheral, uninformative cue) or at fixation (neutral), 67 ms; 53 ms later
// the Gabors appear for 40 ms. One is the standard (22% contrast), the other the test (6–79%). Task: report the tilt of
// the Gabor that looks HIGHER IN CONTRAST (left patch: Z / X, right patch: . / /). Reporting the orientation, not the
// side, keeps the judgement about appearance rather than about which side was cued.
// Result: P(chose test) against test contrast, one psychometric function per cue. Cueing the test moves its PSE down
// (a cued 16% test looks like a 22% standard); cueing the standard moves it up.
import { fitLogistic, logistic, logspace, shuffle } from "./fit.js";

const STD = .22;
export function gabor(g, x, y, { c, sf, ori, ppd, size = 2, sd = .4, bg = .5 }) {
  const n = Math.round(size * ppd), img = g.createImageData(n, n), f = sf / ppd, th = ori * Math.PI / 180, ph = Math.random() * Math.PI * 2;
  const s = sd * ppd, ct = Math.cos(th), st = Math.sin(th);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const u = i - n / 2, v = j - n / 2, env = Math.exp(-(u * u + v * v) / (2 * s * s));
    const L = bg * (1 + c * env * Math.sin(2 * Math.PI * f * (u * ct + v * st) + ph)), k = (j * n + i) * 4;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = Math.round(255 * Math.max(0, Math.min(1, L))); img.data[k + 3] = 255;
  }
  g.putImageData(img, Math.round(x - n / 2), Math.round(y - n / 2));
}

export const CARRASCO = { id: "carrasco", group: "CLASSICS", tag: "CARRASCO, LING & READ 2004", title: "Attention alters appearance",
  sub: "Does a flicker of attention make a stimulus look higher in contrast?",
  blurb: "Keep your eyes on the centre. A dot will flash, then two striped patches. Report the tilt of the patch that looks HIGHER IN CONTRAST: left patch Z (tilts left) or X (tilts right); right patch . (left) or / (right). Ignore the dot. It tells you nothing.",
  instructions: { lines: ["Keep your eyes on the small square in the centre for the whole trial. Don't look at the patches.", "A dot flashes briefly, then two striped patches flash at once, one left and one right. Each patch is tilted left or right.", "Decide which patch looked HIGHER IN CONTRAST (the stripes more vivid), then report the tilt of that patch. The dot tells you nothing about the answer."],
    keys: [["Z", "LEFT PATCH TILTS LEFT"], ["X", "LEFT PATCH TILTS RIGHT"], [".", "RIGHT PATCH TILTS LEFT"], ["/", "RIGHT PATCH TILTS RIGHT"]] },
  async run(ctx) {
    const { g, ppd, cx, cy } = ctx;
    const len = await ctx.choose("How many trials?", [["q", "QUICK  7 LEVELS × 3 CUES × 4"], ["f", "FULL  9 LEVELS × 3 CUES × 10"]]);
    const levels = len === "q" ? logspace(.06, .79, 7) : logspace(.06, .79, 9), reps = len === "q" ? 4 : 10;
    const CUES = ["neutral", "test", "standard"];
    let trials = []; for (let r = 0; r < reps; r++) for (const c of levels) for (const cue of CUES) trials.push({ c, cue });
    trials = shuffle(trials);
    const ecc = 4 * ppd, F = (ms) => ctx.ms2f(ms);
    const data = [];
    ctx.say("Eyes on the centre square. Which patch looks higher in contrast? Report its tilt.");
    for (let t = 0; t < trials.length; t++) {
      const T = trials[t], testLeft = Math.random() < .5, sf = Math.random() < .5 ? 2 : 4;
      const oriL = Math.random() < .5 ? -45 : 45, oriR = Math.random() < .5 ? -45 : 45;
      const cL = testLeft ? T.c : STD, cR = testLeft ? STD : T.c;
      ctx.status(`TRIAL ${t + 1} / ${trials.length}`);
      // fixation 500 ms
      ctx.clear(.5); ctx.fix("#000", 3); await ctx.frames(F(500));
      // cue 67 ms: 0.3° black dot 1.5° above a location, or at fixation
      ctx.clear(.5); ctx.fix("#000", 3);
      const cueSide = T.cue === "neutral" ? 0 : ((T.cue === "test") === testLeft ? -1 : 1), cr = .15 * ppd;
      g.fillStyle = "#000"; g.beginPath(); g.arc(cx + cueSide * ecc, cy - (cueSide ? 1.5 * ppd : 0) - (cueSide ? 0 : 0), cr, 0, Math.PI * 2); g.fill();
      await ctx.frames(F(67));
      // ISI 53 ms
      ctx.clear(.5); ctx.fix("#000", 3); await ctx.frames(F(53));
      // the two Gabors, 40 ms
      gabor(g, cx - ecc, cy, { c: cL, sf, ori: oriL, ppd }); gabor(g, cx + ecc, cy, { c: cR, sf, ori: oriR, ppd });
      await ctx.frames(F(40));
      ctx.clear(.5); ctx.fix("#000", 3);
      const r = await ctx.key(["z", "x", ".", "/"], { buttons: [["z", "LEFT ONE: \\"], ["x", "LEFT ONE: /"], [".", "RIGHT ONE: \\"], ["/", "RIGHT ONE: /"]] });
      const choseLeft = r.key === "z" || r.key === "x", choseTest = choseLeft === testLeft;
      const saidOri = (r.key === "z" || r.key === ".") ? -45 : 45, trueOri = choseLeft ? oriL : oriR;
      data.push({ ...T, testLeft, sf, choseTest, oriCorrect: saidOri === trueOri, rt: r.rt });
    }
    // fits in log contrast, one per cue
    const COL = { neutral: "sW", test: "sG", standard: "sA" }, NAME = { neutral: "NEUTRAL CUE", test: "TEST CUED", standard: "STANDARD CUED" };
    const series = [], notes = [], fits = {};
    for (const cue of CUES) {
      const pts = levels.map(c => { const d = data.filter(x => x.cue === cue && x.c === c); return { x: Math.log(c), c, k: d.filter(x => x.choseTest).length, n: d.length }; });
      const fit = fitLogistic(pts); fits[cue] = fit;
      series.push({ name: NAME[cue], cls: COL[cue], pts: pts.map(p => [p.c * 100, p.n ? p.k / p.n : NaN]), curve: fit ? (x) => logistic(Math.log(x / 100), fit.a, fit.b) : null });
      notes.push([`PSE ${NAME[cue].split(" ")[0]} ${fit ? (Math.exp(fit.pse) * 100).toFixed(1) + "%" : "-"}`, COL[cue]]);
    }
    const acc = data.filter(d => d.oriCorrect).length / data.length;
    notes.push([`TILT CORRECT ${(acc * 100).toFixed(0)}%`, "sM"]);
    ctx.plot({ title: "P(CHOSE TEST) BY CUE", x: { lo: 5, hi: 90, log: true, label: "TEST CONTRAST %", ticks: [6, 10, 22, 40, 79] },
      y: { lo: 0, hi: 1, label: "P(TEST HIGHER)", ticks: [0, .25, .5, .75, 1] }, series, hlines: [{ y: .5, cls: "sD" }],
      vlines: [{ x: 22, cls: "sM", label: "STANDARD 22%", dy: -16 }], notes });
    const pt = fits.test && Math.exp(fits.test.pse) * 100, ps = fits.standard && Math.exp(fits.standard.pse) * 100;
    ctx.say(pt && ps ? `When the test was cued, a ${pt.toFixed(0)}% test looked like the 22% standard. When the standard was cued, the test needed ${ps.toFixed(0)}%. In the paper: 16% and 28%. Attention raised apparent contrast.`
      : "Not enough data in every condition to fit all three curves. Try the full run.");
    ctx.csv("attention_alters_appearance.csv", ["trial", "cue", "test_contrast", "test_left", "sf_cpd", "chose_test", "tilt_correct", "rt_ms"],
      data.map((d, i) => [i + 1, d.cue, d.c, d.testLeft ? 1 : 0, d.sf, d.choseTest ? 1 : 0, d.oriCorrect ? 1 : 0, d.rt]));
  },
};
