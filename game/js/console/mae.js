// PS 327 LAB 05: the motion aftereffect, with dots. A port of MotionAfterDots / MotionDotDrvr / DoADotTrial: adapt to
// 1000 dots streaming radially through an annulus (1–7°) for 20 s (2 s top-ups between trials), then a 0.5 s test in
// which a fraction of the dots (the "correlation", 0–1) move outward and the rest inward. Report D = inward,
// K = outward. After adapting to expansion, a test needs more outward dots to look outward: the PSE shifts up.
import { fitLogistic, logistic, shuffle } from "./fit.js";

const P = { nDots: 1000, size: 5, speed: 6, ecc: [1, 7], tests: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1], test: .5, adapt0: 20, topUp: 2, gap: .5,
  adaptCol: "rgb(0,255,0)", testCol: "rgb(255,0,0)" };

function dotField(ctx, corr) {
  const { ppd } = ctx, rmin = P.ecc[0] * ppd, rmax = P.ecc[1] * ppd, n = P.nDots;
  const r = new Float32Array(n), t = new Float32Array(n), dir = new Int8Array(n);
  const place = (i, anywhere) => { r[i] = anywhere ? rmin + Math.random() * (rmax - rmin) : rmax * Math.sqrt(Math.random()); if (r[i] < rmin) r[i] = rmin + Math.random() * (rmax - rmin); t[i] = Math.random() * Math.PI * 2; };
  for (let i = 0; i < n; i++) { place(i, true); dir[i] = Math.random() < corr ? 1 : -1; }
  return { step(dt) { const d = P.speed * ppd * dt; for (let i = 0; i < n; i++) { r[i] += dir[i] * d; if (r[i] > rmax || r[i] < rmin) place(i, false); } },
    draw(col) { const g = ctx.g; g.fillStyle = col; const s = P.size, h = s / 2;
      for (let i = 0; i < n; i++) g.fillRect(ctx.cx + r[i] * Math.cos(t[i]) - h, ctx.cy + r[i] * Math.sin(t[i]) - h, s, s); } };
}
async function play(ctx, corr, secs, col) {
  const f = dotField(ctx, corr);
  await ctx.loop((tt, dt) => { ctx.clear(0); f.step(Math.min(dt, .05)); f.draw(col); ctx.fix("#fff", 4); return tt < secs; });
  ctx.clear(0); ctx.fix("#fff", 4);
}

export const MAE = { id: "mae", group: "PS 327 LABS", tag: "LAB 05", title: "Motion aftereffect", sub: "Stare at expanding dots, then watch still-ish ones contract.",
  ref: [
    "Addams, R. (1834). An account of a peculiar optical phænomenon seen after having looked at a moving body. London and Edinburgh Philosophical Magazine and Journal of Science, 5(29), 373–374.",
    "Blake, R., & Hiris, E. (1993). Another means for measuring the motion aftereffect. Vision Research, 33(11), 1589–1592."],
  blurb: "Keep your eyes on the centre dot the whole time. Green dots stream for a while (adaptation); then red dots flash for half a second, some moving out, some in. Say which way the red ones went overall: D inward, K outward.",
  instructions: { lines: ["Keep your eyes on the centre dot for the whole run, even while the dots are moving.", "First, green dots stream for a while: that's the adaptation. Then red dots flash for half a second, some moving in and some moving out.", "Report which way the red dots went overall."],
    keys: [["D", "INWARD"], ["K", "OUTWARD"]] },
  async run(ctx) {
    const ad = await ctx.choose("Adapt to what?", [["1", "EXPANSION (ALL OUT)"], ["0", "CONTRACTION (ALL IN)"], ["0.5", "NO NET MOTION (CONTROL)"]]);
    const adaptCorr = +ad, full = (await ctx.choose("How many blocks?", [["q", "QUICK  3 BLOCKS"], ["f", "FULL  10 BLOCKS (AS IN LAB)"]])) === "f";
    const nB = full ? 10 : 3, data = [];
    ctx.say("Initial adaptation: 20 seconds. Eyes on the centre dot. Don't follow the dots.");
    await play(ctx, adaptCorr, P.adapt0, P.adaptCol);
    for (let b = 0; b < nB; b++) { const order = shuffle(P.tests);
      for (let i = 0; i < order.length; i++) {
        const c = order[i]; ctx.status(`BLOCK ${b + 1} / ${nB}  TRIAL ${i + 1} / ${order.length}`);
        ctx.clear(0); ctx.fix("#fff", 4); await ctx.wait(P.gap * 1000);
        await play(ctx, c, P.test, P.testCol);
        ctx.say("Which way did the red dots move, overall?");
        const r = await ctx.key(["d", "k"], { buttons: [["d", "INWARD"], ["k", "OUTWARD"]] });
        data.push({ block: b + 1, corr: c, out: r.key === "k" ? 1 : 0 });
        ctx.say("Top-up adaptation. Eyes on the dot.");
        await play(ctx, adaptCorr, P.topUp, P.adaptCol);
      } }
    const pts = P.tests.map(c => { const d = data.filter(x => x.corr === c); return { x: c, k: d.filter(x => x.out).length, n: d.length }; });
    const fit = fitLogistic(pts);
    const name = adaptCorr === 1 ? "AFTER EXPANSION" : adaptCorr === 0 ? "AFTER CONTRACTION" : "NO NET ADAPTATION";
    ctx.plot({ title: "MOTION AFTEREFFECT", x: { lo: 0, hi: 1, label: "PROPORTION OF DOTS MOVING OUT", ticks: [0, .25, .5, .75, 1] }, y: { lo: 0, hi: 1, label: "P(SAID OUTWARD)", ticks: [0, .25, .5, .75, 1] },
      series: [{ name, cls: "sG", pts: pts.map(p => [p.x, p.n ? p.k / p.n : NaN]), curve: fit ? (x) => logistic(x, fit.a, fit.b) : null }], hlines: [{ y: .5, cls: "sD" }],
      vlines: [{ x: .5, cls: "sM", label: "NO NET MOTION", dy: -16 }, ...(fit ? [{ x: fit.pse, cls: "sA", label: `PSE ${fit.pse.toFixed(2)}`, dy: 16 }] : [])],
      notes: fit ? [[`PSE ${fit.pse.toFixed(2)}`, "sA"], [`SHIFT ${(fit.pse - .5 >= 0 ? "+" : "")}${(fit.pse - .5).toFixed(2)}`, "sW"], [`THRESHOLD ${fit.t75.toFixed(2)}`, "sM"]] : [] });
    ctx.say(!fit ? "Couldn't fit a curve. Too few trials, or every answer the same." : adaptCorr === .5 ? `PSE ${fit.pse.toFixed(2)}: with no net adaptation it should sit near 0.5.`
      : ((adaptCorr === 1) === (fit.pse > .5) && Math.abs(fit.pse - .5) > .03)
        ? `PSE ${fit.pse.toFixed(2)}. ${adaptCorr === 1 ? "After expansion, the test needed more outward dots to look outward" : "After contraction, the test needed fewer outward dots to look outward"}: the adapted motion detectors were turned down, and the balance tipped the other way. That's the motion aftereffect.`
        : `PSE ${fit.pse.toFixed(2)}: little or no aftereffect this run. Keep your eyes on the centre dot during adaptation, and try the full run.`);
    ctx.csv("motion_aftereffect.csv", ["adapt_corr", "block", "test_corr", "said_outward"], data.map(d => [adaptCorr, d.block, d.corr, d.out]));
  } };
