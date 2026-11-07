// PS 327 LAB 04: lightness, Adelson's corrugated plaid. A port of plaid.m / plaidcommand / drawatest / drawacontrol:
// the TEST figure is a plaid folded in depth, so the upper test patch sits on a lit face and the lower one on a
// shadowed face; the CONTROL has the same local neighbours but no consistent 3D reading (rotated 90°). Adjust the
// lower patch until it matches the upper one in lightness. The match differs from the true value in the test figure,
// much less in the control: lightness depends on the perceived 3D layout, not just on neighbouring luminances.
import { mean, sem, shuffle, linFit } from "./fit.js";

const LUM = { BG: 1, L: .8, M: .55, D: .4, DD: .2 }, TESTS = [.2, .4, .6, .8];
const grey = (v) => { const c = Math.round(255 * Math.max(0, Math.min(1, v))); return `rgb(${c},${c},${c})`; };

// drawpolygons: one row of parallelograms, each column advancing by its width (top edge by the next column's width)
function row(g, top, bottom, tl, tr, br, bl, cols, widths, rot) {
  for (let i = 0; i < cols.length; i++) {
    const poly = [[tl, top], [tr, top], [br, bottom], [bl, bottom]].map(rot);
    g.fillStyle = grey(cols[i]); g.beginPath(); poly.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill();
    g.strokeStyle = grey(cols[i]); g.lineWidth = .8; g.stroke();          // hide hairline seams between neighbours
    if (i < cols.length - 1) { tl += widths[i]; tr += widths[i + 1]; br += widths[i + 1]; bl += widths[i]; }
  }
}
function plaid(ctx, UT, LT, control, s = 1.15) {
  const { g, W, H } = ctx, x = 100 * s, y = x / 1.5, z = x / 3, o1 = -z, o2 = z, { L, M, D, DD } = LUM;
  ctx.clear(LUM.BG);
  if (!control) {
    const rh = [x, y, y, y, x], cw = [y, y, y, y, y], T = (H - (2 * x + 3 * y)) / 2, Lf = (W - 5 * y) / 2, id = (p) => p;
    const C135 = [M, D, M, D, M], C2 = [L, M, UT, M, L], C4 = [D, DD, LT, DD, D];
    let t = T; row(g, t, t + rh[0], Lf, Lf + y, Lf + y, Lf, C135, cw, id); t += rh[0];
    row(g, t, t + rh[1], Lf, Lf + y, Lf + y + o1, Lf + o1, C2, cw, id); t += rh[1];
    row(g, t, t + rh[2], Lf + o1, Lf + y + o1, Lf + y + o1, Lf + o1, C135, cw, id); t += rh[2];
    row(g, t, t + rh[3], Lf + o1, Lf + o1 + y, Lf + o1 + y + o2, Lf, C4, cw, id); t += rh[3];
    row(g, t, t + rh[4], Lf, Lf + y, Lf + y, Lf, C135, cw, id);
  } else {
    // drawacontrol: the same rows on their side, rotated 90° about the screen centre
    const rh = [y, y, y, y, y], cw = [x, y, y, y, x], T = (H - 5 * y) / 2, Lf = (W - (2 * x + 3 * y)) / 2, cx = W / 2, cy = H / 2;
    const rot = ([px, py]) => [cx - (py - cy), cy + (px - cx)];
    const C1 = [M, L, M, D, M], C2 = [D, M, D, DD, D], C3 = [M, UT, M, LT, M];
    let t = T; row(g, t, t + rh[0], Lf, Lf + x, Lf + x, Lf, C1, cw, rot); t += rh[0];
    row(g, t, t + rh[1], Lf, Lf + x, Lf + x + o1, Lf + o1, C2, cw, rot); t += rh[1];
    row(g, t, t + rh[2], Lf + o1, Lf + x + o1, Lf + x + o1, Lf + o1, C3, cw, rot); t += rh[2];
    row(g, t, t + rh[3], Lf + o1, Lf + o1 + x, Lf + o1 + x + o2, Lf, C2, cw, rot); t += rh[3];
    row(g, t, t + rh[4], Lf, Lf + x, Lf + x, Lf, C1, cw, rot);
  }
}

export const ADELSON = { id: "adelson", group: "PS 327 LABS", tag: "LAB 04", title: "Adelson's corrugated plaid", sub: "Same grey, different lightness, depending on depth.",
  ref: "Adelson, E. H. (1993). Perceptual organization and the judgment of brightness. Science, 262(5142), 2042–2044.",
  blurb: "Two small patches in the middle of a folded plaid. Adjust the lower one until it looks the same shade of grey as the upper one. Then do it again on a control figure with the same neighbours but no fold.",
  instructions: { lines: ["A folded, chequered plaid with two small grey patches in the middle.", "Adjust the LOWER patch until it looks the same shade of grey as the UPPER patch. Go by what you see, not by what you think the paint is.", "Later you'll do the same on a control figure with no fold."],
    keys: [["UP", "LOWER PATCH LIGHTER"], ["DOWN", "LOWER PATCH DARKER"], ["LEFT RIGHT", "SMALLER / BIGGER STEPS"], ["SPACE", "THEY MATCH"]] },
  async run(ctx) {
    const full = (await ctx.choose("How many blocks?", [["q", "QUICK  1 BLOCK EACH"], ["f", "FULL  3 BLOCKS EACH (AS IN LAB)"]])) === "f";
    const nB = full ? 3 : 1, data = [];
    ctx.say("UP / DOWN make the lower patch lighter or darker. LEFT / RIGHT change the step size. SPACE when the two patches look the same.");
    for (const control of shuffle([false, true])) for (let b = 0; b < nB; b++) for (const UT of shuffle(TESTS)) {
      let LT = Math.floor(Math.random() * 101) / 100, step = .025;
      for (;;) {
        ctx.status(`${control ? "CONTROL" : "TEST"} FIGURE  BLOCK ${b + 1} / ${nB}  STEP ${step.toFixed(3)}`);
        plaid(ctx, UT, LT, control);
        const r = await ctx.key(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "], { buttons: [["ArrowUp", "LIGHTER"], ["ArrowDown", "DARKER"], ["ArrowLeft", "SMALLER STEP"], ["ArrowRight", "BIGGER STEP"], [" ", "MATCH"]], quiet: true });
        if (r.key === " ") break;
        if (r.key === "ArrowUp") LT = Math.min(1, LT + step); else if (r.key === "ArrowDown") LT = Math.max(0, LT - step);
        else if (r.key === "ArrowLeft") step = Math.max(.005, step - .005); else step = Math.min(.1, step + .005);
      }
      data.push({ control, block: b + 1, test: UT, match: LT });
    }
    const series = [[false, "TEST (FOLDED)", "sA"], [true, "CONTROL", "sB"]].map(([c, name, cls]) => {
      const pts = TESTS.map(t => { const m = data.filter(d => d.control === c && d.test === t).map(d => d.match); return [t, mean(m), sem(m)]; });
      const f = linFit(pts.map(p => p[0]), pts.map(p => p[1])); return { name, cls, pts, curve: (x) => f.m * x + f.c, f };
    });
    const bias = (c) => mean(data.filter(d => d.control === c).map(d => d.match - d.test));
    ctx.plot({ title: "LIGHTNESS MATCHES", x: { lo: 0, hi: 1, label: "UPPER PATCH LUMINANCE", ticks: [0, .2, .4, .6, .8, 1] }, y: { lo: 0, hi: 1, label: "LOWER PATCH SET TO", ticks: [0, .2, .4, .6, .8, 1] },
      series: [...series, { name: "PERFECT MATCH", cls: "sM", pts: [], curve: (x) => x }], notes: [[`TEST BIAS ${bias(false) >= 0 ? "+" : ""}${bias(false).toFixed(3)}`, "sA"], [`CONTROL BIAS ${bias(true) >= 0 ? "+" : ""}${bias(true).toFixed(3)}`, "sB"]] });
    ctx.say(`On the folded plaid you set the lower patch ${Math.abs(bias(false)).toFixed(2)} ${bias(false) < 0 ? "darker" : "lighter"} than the true value on average; on the control, ${Math.abs(bias(true)).toFixed(2)}. Same local contrast in both. The difference is the fold: the visual system discounts the shadow it infers.`);
    ctx.csv("adelson_plaid.csv", ["figure", "block", "upper_test_lum", "lower_match_lum"], data.map(d => [d.control ? "control" : "test", d.block, d.test, d.match]));
  } };
