// PS 327 LABS 01–02: line length. Ports of the magnitude-estimation code (MagnitudeEstDrvr, PrecomputeLineME,
// DoATrialME), the Muller-Lyer method of adjustment (LineAdjustDrvr, DoAnAdjustTrialME) and the Muller-Lyer
// constant-stimulus PSE (LinePSEDrvr, DoAPSETrialME). Lengths are the original pixel values, drawn at ×2 on the
// console's 960-wide canvas.
import { fitLogistic, logistic, linFit, mean, sem, shuffle } from "./fit.js";

const SC = 2;   // original pixels → console pixels
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
// PrecomputeLineME: a line of length L at angle A (deg re horizontal), centred, with arrowheads of length aL at aA
// (deg re inward; 0 = no arrows; 45 = fins point back over the line, "<-->"; 135 = fins point away, ">--<")
function lineInfo(L, A, aL, aA, hOff = 0, cx, cy) {
  const r = Math.PI / 180, hl = L / 2 * Math.cos(A * r) * SC, vl = L / 2 * Math.sin(A * r) * SC;
  const f = [cx - hl + hOff, cy - vl], t = [cx + hl + hOff, cy + vl], a = aL * SC;
  if (!aA) return { f, t, fins: [] };
  const p = (o, ang) => [o[0] + a * Math.cos(ang * r), o[1] + a * Math.sin(ang * r)];
  return { f, t, fins: [[f, p(f, A + aA)], [f, p(f, A - aA)], [t, p(t, A + 180 - aA)], [t, p(t, A + 180 + aA)]] };
}
function drawLine(g, li, pen, lineCol, arrowCol) {
  g.lineCap = "butt"; g.lineWidth = pen * SC / 1.5;
  g.strokeStyle = rgb(lineCol); g.beginPath(); g.moveTo(...li.f); g.lineTo(...li.t); g.stroke();
  g.strokeStyle = rgb(arrowCol); g.beginPath(); for (const [a, b] of li.fins) { g.moveTo(...a); g.lineTo(...b); } g.stroke();
}
const fill = (ctx, c) => { ctx.g.setTransform(1, 0, 0, 1, 0, 0); ctx.g.fillStyle = rgb(c); ctx.g.fillRect(0, 0, ctx.W, ctx.H); };

// magnitude estimation, shared by labs 01 and 02
async function magEst(ctx, P) {
  const blocks = (await ctx.choose("How many blocks?", [["q", `QUICK  ${Math.max(1, P.nBlocks >> 1)} BLOCK${P.nBlocks >> 1 > 1 ? "S" : ""}`], ["f", `FULL  ${P.nBlocks} BLOCKS (AS IN LAB)`]])) === "q" ? Math.max(1, P.nBlocks >> 1) : P.nBlocks;
  const conds = []; for (const aA of P.arrowAngles) for (const A of P.stimAngles) for (const L of P.stimLengths) for (let cc = 0; cc < P.colors.length; cc++) conds.push({ L, A, aA, cc });
  const std = lineInfo(P.standardLength, 0, 0, 0, 0, ctx.cx, ctx.cy);
  const showStd = async () => { fill(ctx, [0, 0, 0]); drawLine(ctx.g, std, P.penSize, [255, 255, 255], [255, 255, 255]);
    ctx.say("The standard below is 100. Give every line a number in proportion: twice as long is 200, half as long is 50."); await ctx.key([" ", "go"], { buttons: [["go", "GOT IT"]] }); };
  await showStd();
  const data = [];
  for (let b = 0; b < blocks; b++) {
    const order = shuffle(conds);
    for (let i = 0; i < order.length; i++) {
      const c = order[i], col = P.colors[c.cc]; ctx.status(`BLOCK ${b + 1} / ${blocks}  TRIAL ${i + 1} / ${order.length}`);
      fill(ctx, col.bg); drawLine(ctx.g, lineInfo(c.L, c.A, P.arrowLength, c.aA, 0, ctx.cx, ctx.cy), P.penSize, col.line, col.arrow);
      await ctx.wait(P.trialDuration); fill(ctx, [0, 0, 0]); await ctx.wait(P.blankDuration);
      const est = await ctx.number("Your estimate? (The standard is 100.)");
      data.push({ block: b + 1, ...c, est });
    }
    if (b < blocks - 1) await showStd();
  }
  return data;
}

export const HV = { id: "hv", group: "PS 327 LABS", tag: "LAB 01", title: "Horizontal-vertical illusion", sub: "Magnitude estimation of line length, horizontal vs vertical.",
  blurb: "Lines flash for a second, horizontal or vertical, 70 to 130 pixels long. After each one, type a number for how long it looked, where the standard line is 100.",
  instructions: { lines: ["A line flashes for a second, either horizontal or vertical. Lengths vary.", "First you'll see the standard line, which counts as 100. After each line, type a number for how long it looked compared with the standard: twice as long is 200, half as long is 50.", "Use the number keys, then ENTER."],
    keys: [["0-9 .", "TYPE THE LENGTH"], ["ENTER", "SUBMIT"], ["BKSP", "DELETE"]] },
  async run(ctx) {
    const P = { standardLength: 100, stimLengths: [70, 80, 90, 100, 110, 120, 130], stimAngles: [0, 90], arrowLength: 20, arrowAngles: [0], nBlocks: 4, penSize: 4,
      trialDuration: 1000, blankDuration: 1000, colors: [{ bg: [0, 0, 0], line: [255, 255, 255], arrow: [255, 255, 255] }] };
    const data = await magEst(ctx, P);
    const series = [[0, "HORIZONTAL", "sB"], [90, "VERTICAL", "sA"]].map(([A, name, cls]) => {
      const pts = P.stimLengths.map(L => { const e = data.filter(d => d.A === A && d.L === L).map(d => d.est); return [L, mean(e), sem(e)]; });
      const fit = linFit(pts.map(p => p[0]), pts.map(p => p[1])); return { name, cls, pts, curve: (x) => fit.m * x + fit.c, fit };
    });
    const at100 = series.map(s => s.fit.m * 100 + s.fit.c), over = (at100[1] / at100[0] - 1) * 100;
    const yMax = Math.ceil(Math.max(160, ...series.flatMap(s => s.pts.map(p => p[1] + p[2]))) / 20) * 20;
    ctx.plot({ title: "MAGNITUDE ESTIMATES", x: { lo: 60, hi: 140, label: "LINE LENGTH PX", ticks: [70, 100, 130] }, y: { lo: 0, hi: yMax, label: "ESTIMATE", ticks: [0, 50, 100, 150].filter(v => v <= yMax) },
      series, notes: [[`AT 100 PX  H ${at100[0].toFixed(0)}  V ${at100[1].toFixed(0)}`, "sW"], [`VERTICAL ${over >= 0 ? "+" : ""}${over.toFixed(0)}%`, over > 0 ? "sA" : "sM"]] });
    ctx.say(over > 0 ? `Vertical lines looked ${over.toFixed(0)}% longer than horizontal ones of the same length. That's the horizontal-vertical illusion.` : "No vertical overestimation this time. The effect is usually 5 to 15%; more blocks will tighten the estimate.");
    ctx.csv("horizontal_vertical.csv", ["block", "line_length", "line_angle", "estimate"], data.map(d => [d.block, d.L, d.A, d.est]));
  } };

export const ML = { id: "ml", group: "PS 327 LABS", tag: "LAB 02", title: "Muller-Lyer illusion", sub: "Fins in, fins out: three ways to measure it.",
  blurb: "The same line looks shorter between arrowheads and longer between tails. Measure it by magnitude estimation, by adjustment, or with constant stimuli and a psychometric function.",
  instructions: { lines: ["Lines with arrowheads (fins in) or tails (fins out) at their ends. The fins change how long the line looks.", "You'll choose a method. MAGNITUDE ESTIMATION: type a number for each line's length, where the standard is 100. ADJUSTMENT: stretch one line until it matches the other. CONSTANT STIMULI: say which of two lines is longer.", "Judge the line itself, not the fins."],
    keys: [["0-9 ENTER", "ESTIMATION: TYPE A NUMBER"], ["UP DOWN", "ADJUSTMENT: LONGER / SHORTER"], ["SPACE", "ADJUSTMENT: IT MATCHES"], ["D / K", "PSE: LEFT / RIGHT LONGER"]] },
  async run(ctx) {
    const method = await ctx.choose("Which method?", [["e", "MAGNITUDE ESTIMATION"], ["a", "ADJUSTMENT"], ["p", "CONSTANT STIMULI (PSE)"]]);
    if (method === "e") return mlEstimate(ctx);
    if (method === "a") return mlAdjust(ctx);
    return mlPSE(ctx);
  } };

async function mlEstimate(ctx) {
  // MullerLyerExp: oblique (45°) lines, fins-in (45) and fins-out (135), two colour conditions
  const P = { standardLength: 100, stimLengths: [70, 80, 90, 100, 110, 120, 130], stimAngles: [45], arrowLength: 30, arrowAngles: [45, 135], nBlocks: 4, penSize: 4,
    trialDuration: 1000, blankDuration: 1000,
    colors: [{ bg: [64, 64, 64], line: [255, 255, 255], arrow: [255, 255, 64] }, { bg: [128, 128, 0], line: [255, 255, 64], arrow: [255, 255, 255] }] };
  const data = await magEst(ctx, P);
  const series = [[45, "FINS IN <->", "sB"], [135, "FINS OUT >-<", "sA"]].map(([aA, name, cls]) => {
    const pts = P.stimLengths.map(L => { const e = data.filter(d => d.aA === aA && d.L === L).map(d => d.est); return [L, mean(e), sem(e)]; });
    const fit = linFit(pts.map(p => p[0]), pts.map(p => p[1])); return { name, cls, pts, curve: (x) => fit.m * x + fit.c, fit };
  });
  const a = series.map(s => s.fit.m * 100 + s.fit.c);
  ctx.plot({ title: "MULLER-LYER  MAGNITUDE", x: { lo: 60, hi: 140, label: "LINE LENGTH PX", ticks: [70, 100, 130] }, y: { lo: 0, hi: 180, label: "ESTIMATE", ticks: [0, 50, 100, 150] },
    series, notes: [[`AT 100 PX  IN ${a[0].toFixed(0)}  OUT ${a[1].toFixed(0)}`, "sW"], [`DIFFERENCE ${(a[1] - a[0]).toFixed(0)}`, "sA"]] });
  ctx.say(`Fins out looked ${(a[1] - a[0]).toFixed(0)} units longer than fins in, at the same physical length.`);
  ctx.csv("muller_lyer_magnitude.csv", ["block", "line_length", "arrow_angle", "color_cond", "estimate"], data.map(d => [d.block, d.L, d.aA, d.cc + 1, d.est]));
}

async function mlAdjust(ctx) {
  // LineAdjust: standard (fins out, left) vs adjustable test (fins in, right), vertical, start 80/100/120, 3 blocks
  const P = { standardLength: 100, sAL: 30, sAA: 135, starts: [80, 100, 120], tAL: 30, tAA: 45, nBlocks: 3, penSize: 4, off: 100, jitter: 100 };
  const lineCol = [0, 255, 0], arrowCol = [255, 255, 255], data = [];
  ctx.say("Make the right-hand line look the same length as the left-hand one. UP / DOWN change it; LEFT / RIGHT switch between fine (1 px) and coarse (5 px) steps; SPACE accepts.");
  for (let b = 0; b < P.nBlocks; b++) for (const L0 of shuffle(P.starts)) {
    let L = L0, step = 5; const jit = (Math.random() * 2 - 1) * P.jitter;
    ctx.status(`BLOCK ${b + 1} / ${P.nBlocks}`);
    for (;;) {
      fill(ctx, [0, 0, 0]);
      drawLine(ctx.g, lineInfo(P.standardLength, 90, P.sAL, P.sAA, -P.off * SC / 2 + jit, ctx.cx, ctx.cy), P.penSize, lineCol, arrowCol);
      drawLine(ctx.g, lineInfo(L, 90, P.tAL, P.tAA, P.off * SC / 2 + jit, ctx.cx, ctx.cy), P.penSize, lineCol, arrowCol);
      const r = await ctx.key(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "], { buttons: [["ArrowUp", "LONGER"], ["ArrowDown", "SHORTER"], ["ArrowLeft", "FINE"], ["ArrowRight", "COARSE"], [" ", "ACCEPT"]], quiet: true });
      if (r.key === " ") break;
      if (r.key === "ArrowUp") L += step; else if (r.key === "ArrowDown") L = Math.max(10, L - step); else if (r.key === "ArrowLeft") step = 1; else step = 5;
      ctx.status(`BLOCK ${b + 1} / ${P.nBlocks}   STEP ${step} PX`);
    }
    data.push({ block: b + 1, start: L0, match: L });
  }
  const pts = P.starts.map(s => { const m = data.filter(d => d.start === s).map(d => d.match); return [s, mean(m), sem(m)]; });
  const all = mean(data.map(d => d.match));
  ctx.plot({ title: "MULLER-LYER  ADJUSTMENT", x: { lo: 70, hi: 130, label: "STARTING LENGTH PX", ticks: [80, 100, 120] }, y: { lo: 60, hi: 160, label: "MATCH PX", ticks: [80, 100, 120, 140] },
    series: [{ name: "MATCHES", cls: "sG", pts }], hlines: [{ y: 100, cls: "sM", label: "STANDARD 100" }], notes: [[`MEAN MATCH ${all.toFixed(1)} PX`, "sW"], [`ILLUSION ${(all - 100).toFixed(1)} PX`, "sA"]] });
  ctx.say(`To look equal to a 100-pixel line with tails, a line with arrowheads had to be ${all.toFixed(0)} pixels.`);
  ctx.csv("muller_lyer_adjust.csv", ["block", "start_length", "match_length"], data.map(d => [d.block, d.start, d.match]));
}

async function mlPSE(ctx) {
  // LinePSE: test lengths 100–140 (fins in, right) vs standard 100 (fins out, left); 'd' left longer, 'k' right longer
  const full = (await ctx.choose("How many blocks?", [["q", "QUICK  4 BLOCKS"], ["f", "FULL  8 BLOCKS (AS IN LAB)"]])) === "f";
  const lens = [100, 105, 110, 115, 120, 125, 130, 135, 140], nB = full ? 8 : 4, lineCol = [0, 255, 0], arrowCol = [255, 255, 255], data = [];
  ctx.say("Which line looks longer? D for the left one, K for the right one.");
  for (let b = 0; b < nB; b++) { const order = shuffle(lens); for (let i = 0; i < order.length; i++) {
      const L = order[i], jit = (Math.random() * 2 - 1) * 100; ctx.status(`BLOCK ${b + 1} / ${nB}  TRIAL ${i + 1} / ${lens.length}`);
      fill(ctx, [0, 0, 0]);
      drawLine(ctx.g, lineInfo(100, 90, 30, 135, -50 * SC + jit, ctx.cx, ctx.cy), 4, lineCol, arrowCol);
      drawLine(ctx.g, lineInfo(L, 90, 30, 45, 50 * SC + jit, ctx.cx, ctx.cy), 4, lineCol, arrowCol);
      const r = await ctx.key(["d", "k"], { buttons: [["d", "LEFT LONGER"], ["k", "RIGHT LONGER"]] });
      data.push({ block: b + 1, L, right: r.key === "k" ? 1 : 0 }); fill(ctx, [0, 0, 0]); await ctx.wait(100); } }
  const pts = lens.map(L => { const d = data.filter(x => x.L === L); return { x: L, k: d.filter(x => x.right).length, n: d.length }; });
  const fit = fitLogistic(pts);
  ctx.plot({ title: "MULLER-LYER  PSE", x: { lo: 95, hi: 145, label: "TEST LENGTH PX  FINS IN", ticks: [100, 110, 120, 130, 140] }, y: { lo: 0, hi: 1, label: "P(TEST LONGER)", ticks: [0, .25, .5, .75, 1] },
    series: [{ name: "DATA", cls: "sG", pts: pts.map(p => [p.x, p.k / p.n]), curve: fit ? (x) => logistic(x, fit.a, fit.b) : null }], hlines: [{ y: .5, cls: "sD" }],
    vlines: fit ? [{ x: fit.pse, cls: "sA", label: `PSE ${fit.pse.toFixed(1)}` }] : [], notes: fit ? [[`PSE ${fit.pse.toFixed(1)} PX`, "sA"], [`ILLUSION ${(fit.pse - 100).toFixed(1)} PX`, "sW"], [`THRESHOLD ${fit.t75.toFixed(1)} PX`, "sM"]] : [] });
  ctx.say(fit ? `The fins-in line had to be ${fit.pse.toFixed(0)} pixels to look as long as the 100-pixel standard: an illusion of ${(fit.pse - 100).toFixed(0)} pixels.` : "Couldn't fit a curve. Too few trials, or every answer the same.");
  ctx.csv("muller_lyer_pse.csv", ["block", "test_length", "test_longer"], data.map(d => [d.block, d.L, d.right]));
}
