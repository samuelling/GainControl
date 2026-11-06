// PS 327 LAB 03: visual search. Ports of PopoutSearch / ConjunctionSearch (LetterSearchDrvr) and LineSearch
// (LineSearchDrvr): a fixation point, then a display that stays up until you answer, K = target present,
// D = absent. Reaction time against set size, for present and absent trials.
import { linFit, mean, median, shuffle } from "./fit.js";

const COND = {
  popout: { title: "COLOUR POP-OUT", what: "a red B among green As", items: { A: [["A", [0, 255, 0]]], B: [["A", [0, 255, 0]]] }, target: ["B", [255, 0, 0]], nA: [1, 2, 4, 8], nB: [1, 2, 4, 8], blocks: 10, fix: 500 },
  conj: { title: "CONJUNCTION", what: "a red B among green Bs and red As", items: { A: [["A", [0, 255, 0]], ["A", [255, 0, 0]]], B: [["B", [0, 255, 0]]] }, target: ["B", [255, 0, 0]], nA: [1, 2, 4, 8], nB: [1, 2, 4, 8], blocks: 10, fix: 500 },
  line: { title: "ORIENTATION", what: "a line tilted 15° among vertical lines", line: true, nA: [5, 10, 15, 20], nB: [0, 0, 0, 0], blocks: 3, fix: 250 },
};
const R = 200 * 1.2, ITEM = 30 * 1.2;   // display radius and item size (original px, ×1.2)

function positions(n, cx, cy) {
  const out = []; let tries = 0;
  while (out.length < n && tries++ < 5000) { const r = R * Math.sqrt(Math.random()), a = Math.random() * Math.PI * 2, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    if (Math.hypot(x - cx, y - cy) < ITEM && n > 1) continue;
    if (out.every(p => Math.hypot(p[0] - x, p[1] - y) > ITEM * 1.5)) out.push([x, y]); }
  return out;
}

export const SEARCH = { id: "search", group: "PS 327 LABS", tag: "LAB 03", title: "Visual search", sub: "Pop-out vs conjunction: does the target find you?",
  blurb: "Find the target as fast as you can. K if it's there, D if it isn't. Some targets pop out; others you have to hunt for, item by item.",
  instructions: { lines: ["A screen full of items appears. Somewhere among them there may be ONE target that is different from the rest.", "Decide as fast as you can whether the target is there. Try not to make mistakes.", "You'll pick the kind of search: colour pop-out, a colour-and-shape conjunction, or tilted lines."],
    keys: [["K", "TARGET PRESENT"], ["D", "TARGET ABSENT"]] },
  async run(ctx) {
    const which = await ctx.choose("Which search?", [["popout", "COLOUR POP-OUT"], ["conj", "CONJUNCTION"], ["line", "ORIENTATION (LINES)"]]);
    const C = COND[which], { g } = ctx;
    const quick = (await ctx.choose("How many blocks?", [["q", `QUICK  ${Math.max(2, C.blocks >> 2)} BLOCKS`], ["f", `FULL  ${C.blocks} BLOCKS (AS IN LAB)`]])) === "q";
    const nBlocks = quick ? Math.max(2, C.blocks >> 2) : C.blocks;
    const types = []; C.nA.forEach((a, i) => { for (const present of [0, 1]) types.push({ nA: a, nB: C.nB[i], n: a + C.nB[i], present }); });
    ctx.say(`Target: ${C.what}. K if it's there, D if it isn't. Fast, but don't make mistakes. Eyes on the dot between trials.`);
    const data = [];
    for (let b = 0; b < nBlocks; b++) { const order = shuffle(types);
      for (let i = 0; i < order.length; i++) {
        const T = order[i]; ctx.status(`BLOCK ${b + 1} / ${nBlocks}  TRIAL ${i + 1} / ${order.length}`);
        ctx.clear(0); ctx.fix("#fff", 3); await ctx.wait(C.fix);
        ctx.clear(0);
        const P = positions(T.n, ctx.cx, ctx.cy), tIdx = T.present ? Math.floor(Math.random() * T.n) : -1;
        P.forEach(([x, y], k) => {
          if (C.line) { const ang = (k === tIdx ? 75 : 90) * Math.PI / 180, L = 20 * 1.2;
            g.strokeStyle = "rgb(255,0,0)"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - L / 2 * Math.cos(ang), y - L / 2 * Math.sin(ang)); g.lineTo(x + L / 2 * Math.cos(ang), y + L / 2 * Math.sin(ang)); g.stroke(); return; }
          let ch, col;
          if (k === tIdx) [ch, col] = C.target;
          else { const pool = k < T.nA ? C.items.A : C.items.B; [ch, col] = pool[Math.floor(Math.random() * pool.length)]; }
          g.fillStyle = `rgb(${col})`; g.font = `bold ${ITEM}px Helvetica, Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, x, y);
        });
        const r = await ctx.key(["d", "k"], { buttons: [["d", "ABSENT"], ["k", "PRESENT"]], quiet: true });
        data.push({ block: b + 1, ...T, said: r.key === "k" ? 1 : 0, rt: r.rt });
        ctx.clear(0); await ctx.wait(C.line ? 500 : 400);
      } }
    const sizes = [...new Set(types.map(t => t.n))].sort((a, b) => a - b);
    const series = [[1, "PRESENT", "sG"], [0, "ABSENT", "sR"]].map(([pr, name, cls]) => {
      const pts = sizes.map(n => { const rts = data.filter(d => d.n === n && d.present === pr && d.said === pr).map(d => d.rt); return [n, median(rts)]; }).filter(p => isFinite(p[1]));
      const fit = pts.length > 1 ? linFit(pts.map(p => p[0]), pts.map(p => p[1])) : { m: 0, c: NaN };
      return { name, cls, pts, curve: (x) => fit.m * x + fit.c, fit };
    });
    const errs = data.filter(d => d.said !== d.present).length, yMax = Math.ceil(Math.max(800, ...series.flatMap(s => s.pts.map(p => p[1]))) / 200) * 200;
    ctx.plot({ title: `${C.title}  RT BY SET SIZE`, x: { lo: 0, hi: sizes[sizes.length - 1] + 2, label: "SET SIZE", ticks: sizes }, y: { lo: 0, hi: yMax, label: "MEDIAN RT MS", ticks: [0, yMax / 2, yMax] },
      series, notes: [[`SLOPE PRESENT ${series[0].fit.m.toFixed(1)} MS/ITEM`, "sG"], [`SLOPE ABSENT ${series[1].fit.m.toFixed(1)} MS/ITEM`, "sR"], [`ERRORS ${errs} / ${data.length}`, "sM"]] });
    const sp = series[0].fit.m;
    ctx.say(sp < 10 ? `Flat: about ${sp.toFixed(0)} ms per item. The target popped out; adding items barely mattered. Parallel search.`
      : `About ${sp.toFixed(0)} ms per item when it's there, ${series[1].fit.m.toFixed(0)} when it isn't. Serial search: you checked items one by one, and on absent trials you checked them all.`);
    ctx.csv(`search_${which}.csv`, ["block", "set_size", "n_a", "n_b", "present", "said_present", "rt_ms"], data.map(d => [d.block, d.n, d.nA, d.nB, d.present, d.said, d.rt]));
  } };
