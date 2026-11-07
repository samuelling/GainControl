// ATTENTION and ACTION: ten classic reaction-time, tracking and pointing paradigms for the perception console.
//   Stroop (1935)                    colour-word interference, and its asymmetry (ink naming vs word reading)
//   Eriksen & Eriksen (1974)         flanker letters: response-incompatible noise slows you, less when spaced out
//   Simon & Rudell (1967)            the Simon effect: where a stimulus is matters even when it's irrelevant
//   Raymond, Shapiro & Arnell (1992) the attentional blink in RSVP, with lag-1 sparing
//   Pylyshyn & Storm (1988)          multiple-object tracking: accuracy and capacity against number of targets
//   Posner & Cohen (1984)            inhibition of return: peripheral cues help early, hurt late
//   Rogers & Monsell (1995)          task-switching cost in alternating runs, and how preparation time shrinks it
//   Navon (1977)                     global precedence: forest before trees
//   Hick (1952)                      choice RT grows with log2 of the number of alternatives
//   Fitts (1954)                     reciprocal tapping: movement time grows with log2(2A/W)
// Every result is a difference, a slope or an accuracy pattern, so none of it depends on screen size, viewing
// distance or display gamma. Brief durations are set in frames from the measured refresh rate, not an assumed 60 Hz.
import { mean, median, sem, shuffle, linFit } from "./fit.js";

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const SANS = "Helvetica, Arial, sans-serif", SAIRA = "'Saira Condensed', sans-serif";
const quick = (ctx, q, f) => ctx.choose("How long?", [["q", q], ["f", f]]).then(k => k === "q");
function txt(g, s, x, y, size, col, font = SANS, weight = "bold") {
  g.font = `${weight} ${size}px ${font}`; g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, x, y); }
function wrapText(g, text, maxW) { const out = []; let line = "";
  for (const w of text.split(/\s+/)) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out; }
// the display's real frame duration (ms), so brief exposures are right on 60, 90, 120 or 144 Hz screens
async function frameMs(ctx) { const ts = []; for (let i = 0; i < 24; i++) ts.push(await ctx.raf());
  const d = ts.slice(1).map((t, i) => t - ts[i]).filter(v => v > 2 && v < 60); return d.length ? median(d) : 1000 / 60; }
// a pause between blocks: a title and a line of instructions, then GO
async function interlude(ctx, title, line) {
  const { g, W, cx, cy } = ctx; ctx.clear(0);
  txt(g, title.toUpperCase(), cx, cy - 70, 46, "#e9e6ff", SAIRA, "600");
  g.font = `500 28px ${SAIRA}`; wrapText(g, line.toUpperCase(), W - 160).forEach((l, i) => txt(g, l, cx, cy - 10 + i * 36, 28, "#ffb547", SAIRA, "500"));
  ctx.say(line); await ctx.key([" ", "go"], { buttons: [["go", "GO"]] });
}
// error feedback, drawn on the stimulus background
async function oops(ctx, s, bg = 0, ms = 600) { ctx.clear(bg); txt(ctx.g, s, ctx.cx, ctx.cy, 40, "#ff5a5a", SAIRA, "600"); await ctx.wait(ms); }
// show a stimulus for ms (or until the response), then blank it, and return the response
async function timedKey(ctx, fms, ms, blank, keys, opts) {
  const p = ctx.key(keys, opts); let done = false; p.then(() => { done = true; }, () => {});
  const n = Math.max(1, Math.round(ms / fms)); for (let i = 0; i < n && !done; i++) await ctx.raf();
  if (!done) blank();
  return await p;
}
const okRT = (d, lo = 150, hi = 2500) => d.ok && d.rt >= lo && d.rt <= hi;
// a y axis for RTs: rounded to 100 ms, three ticks
function rtAxis(vals, step = 100) { const v = vals.filter(isFinite); if (!v.length) return { lo: 0, hi: 1000, ticks: [0, 500, 1000] };
  const lo = Math.max(0, Math.floor((Math.min(...v) - step * .6) / step) * step), hi = Math.ceil((Math.max(...v) + step * .6) / step) * step;
  return { lo, hi, ticks: [lo, Math.round((lo + hi) / 2), hi] }; }
// column headings for a categorical plot: a dashed separator just left of each cluster, its name on top
const heads = (names, dys = []) => names.map((n, i) => ({ x: i + .62, cls: "sM", label: n, dy: dys[i] || 0 }));
const ms = (v) => isFinite(v) ? `${v >= 0 ? "+" : ""}${v.toFixed(0)} MS` : "-";
// ctx.plot, minus any empty cells (a line through NaN breaks the SVG path)
const plotF = (ctx, spec) => ctx.plot({ ...spec, series: (spec.series || []).map(s => ({ ...s, pts: s.pts.filter(p => isFinite(p[1])) })),
  hlines: (spec.hlines || []).filter(h => isFinite(h.y)), vlines: (spec.vlines || []).filter(v => isFinite(v.x)) });
const pct = (v) => isFinite(v) ? `${(v * 100).toFixed(0)}%` : "-";

/* ---------------- Stroop (1935): colour-word interference ---------------- */
const INKS = [["r", "RED", "rgb(240,50,50)"], ["g", "GREEN", "rgb(40,200,70)"], ["b", "BLUE", "rgb(70,125,255)"], ["y", "YELLOW", "rgb(240,220,40)"]];
export const STROOP = { id: "stroop", group: "ATTENTION", tag: "STROOP 1935", title: "Stroop interference",
  sub: "Name the colour of the ink. Easy, unless the ink spells a different colour.",
  blurb: "Part 1: press the key for the INK colour of a colour word or a plain colour bar. Part 2: press the key for what the WORD says and ignore the ink. Stroop timed people naming 100 items off a card; here every item is timed. The four colours only have to be tellable apart, so any screen will do.",
  ref: "Stroop, J. R. (1935). Studies of interference in serial verbal reactions. Journal of Experimental Psychology, 18(6), 643–662.",
  instructions: { lines: ["Part 1: a word or a bar appears in coloured ink. Press the key for the colour of the INK, whatever the word says.", "Part 2: press the key for what the WORD says, whatever colour it is printed in.", "Be fast, but try not to make mistakes."],
    keys: [["R", "RED"], ["G", "GREEN"], ["B", "BLUE"], ["Y", "YELLOW"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  72 TRIALS", "FULL  144 TRIALS");
    const { g, cx, cy } = ctx, nI = q ? 16 : 32, nW = q ? 12 : 24, keys = INKS.map(c => c[0]), buttons = INKS.map(c => [c[0], c[1]]);
    const ink = [], word = [];
    for (const cond of ["neutral", "congruent", "incongruent"]) for (let i = 0; i < nI; i++) { const c = INKS[i % 4];
      ink.push({ task: "ink", cond, ink: c, word: cond === "neutral" ? null : cond === "congruent" ? c : rnd(INKS.filter(x => x !== c)), ans: c[0] }); }
    for (const cond of ["neutral", "incongruent"]) for (let i = 0; i < nW; i++) { const w = INKS[i % 4];
      word.push({ task: "word", cond, word: w, ink: cond === "neutral" ? ["w", "WHITE", "#eeeeee"] : rnd(INKS.filter(x => x !== w)), ans: w[0] }); }
    const data = [];
    const block = async (trials, line) => {
      ctx.say(line);
      for (let i = 0; i < trials.length; i++) {
        const T = trials[i]; ctx.status(`${T.task === "ink" ? "INK" : "WORD"}  ${i + 1} / ${trials.length}`);
        ctx.clear(0); ctx.fix("#888", 3); await ctx.wait(400); ctx.clear(0);
        if (T.word) txt(g, T.word[1], cx, cy, 88, T.ink[2]); else { g.fillStyle = T.ink[2]; g.fillRect(cx - 130, cy - 30, 260, 60); }
        const r = await ctx.key(keys, { buttons, timeout: 3000, quiet: true });
        const ok = r.key === T.ans; data.push({ ...T, said: r.key, ok, rt: r.rt });
        if (!r.key) await oops(ctx, "TOO SLOW"); else if (!ok) await oops(ctx, "WRONG");
        ctx.clear(0); await ctx.wait(250);
      }
    };
    await block(shuffle(ink), "Press the key for the colour of the INK. Ignore what the word says.");
    await interlude(ctx, "Part 2: read the word", "Now press the key for what the WORD says. Ignore the colour of the ink.");
    await block(shuffle(word), "Press the key for what the WORD says. Ignore the ink.");
    const m = (task, cond) => mean(data.filter(d => d.task === task && d.cond === cond && okRT(d, 200, 3000)).map(d => d.rt));
    const se = (task, cond) => sem(data.filter(d => d.task === task && d.cond === cond && okRT(d, 200, 3000)).map(d => d.rt));
    const C = [["neutral", "PLAIN", "sW"], ["congruent", "MATCHING", "sG"], ["incongruent", "CLASHING", "sR"]];
    const series = C.map(([c, name, cls]) => ({ name, cls, pts: [[1, m("ink", c), se("ink", c)], [2, m("word", c), se("word", c)]] }));
    const inkCost = m("ink", "incongruent") - m("ink", "neutral"), inkPct = inkCost / m("ink", "neutral") * 100, wordCost = m("word", "incongruent") - m("word", "neutral");
    const err = 1 - data.filter(d => d.ok).length / data.length;
    plotF(ctx, { title: "STROOP INTERFERENCE", x: { lo: .4, hi: 2.6, label: "TASK", ticks: [] }, y: { label: "MEAN RT MS", ...rtAxis(series.flatMap(s => s.pts.map(p => p[1]))) },
      bars: true, series, vlines: heads(["NAME THE INK", "READ THE WORD"]),
      notes: [[`INK COST ${ms(inkCost)}`, "sR"], [isFinite(inkPct) ? `  = ${inkPct.toFixed(0)}% SLOWER` : "", "sR"], [`WORD COST ${ms(wordCost)}`, "sW"], [`ERRORS ${pct(err)}`, "sM"]] });
    ctx.say(!isFinite(inkCost) ? "Not enough correct trials to compare. Try again, a little slower." : inkCost > 20 ?
      `A clashing word slowed your ink naming by ${inkCost.toFixed(0)} ms (${inkPct.toFixed(0)}%)${isFinite(wordCost) ? `; clashing ink changed your reading by ${wordCost.toFixed(0)} ms` : ""}. Stroop's readers were 74% slower naming the ink of colour words, and barely slowed reading them: reading is automatic.`
      : `Clashing words cost your ink naming only ${inkCost.toFixed(0)} ms this time. Most people lose 50 to 150 ms here, and Stroop's card readers were 74% slower. Try again at a steady pace.`);
    ctx.status("");
    ctx.csv("stroop.csv", ["trial", "task", "condition", "word", "ink", "response", "correct", "rt_ms"],
      data.map((d, i) => [i + 1, d.task, d.cond, d.word ? d.word[1] : "", d.ink[1], d.said ?? "", d.ok ? 1 : 0, d.rt]));
  } };

/* ---------------- Eriksen & Eriksen (1974): the flanker task ---------------- */
export const FLANKER = { id: "flanker", group: "ATTENTION", tag: "ERIKSEN & ERIKSEN 1974", title: "Flanker interference",
  sub: "Name the middle letter. The letters beside it shouldn't matter, but they do.",
  blurb: "A row of seven letters; only the middle one counts. H or K: press F. S or C: press J. Its neighbours are the same letter, a letter that needs the same key, or a letter that needs the other key, and they're either packed tight or spread out. Eriksen and Eriksen found the other-key neighbours slow you most when they're close.",
  ref: "Eriksen, B. A., & Eriksen, C. W. (1974). Effects of noise letters upon the identification of a target letter in a nonsearch task. Perception & Psychophysics, 16(1), 143–149.",
  instructions: { lines: ["A row of letters appears. Only the MIDDLE letter matters.", "If the middle letter is H or K, press F. If it is S or C, press J.", "Ignore the letters on either side of it. Be fast and accurate."],
    keys: [["F", "MIDDLE IS H OR K"], ["J", "MIDDLE IS S OR C"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  48 TRIALS", "FULL  120 TRIALS");
    const { g, cx, cy } = ctx, reps = q ? 8 : 20, fms = await frameMs(ctx);
    const SET = { f: ["H", "K"], j: ["S", "C"] }, NOISE = ["same", "compatible", "incompatible"], SP = { close: 26, wide: 64 };
    let trials = []; for (let r = 0; r < reps; r++) for (const noise of NOISE) for (const sp of ["close", "wide"]) trials.push({ noise, sp }); trials = shuffle(trials);
    const data = []; ctx.say("Middle letter H or K: F.  S or C: J.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], side = rnd(["f", "j"]), tgt = rnd(SET[side]), other = side === "f" ? "j" : "f";
      const fl = T.noise === "same" ? tgt : T.noise === "compatible" ? SET[side].find(l => l !== tgt) : rnd(SET[other]);
      ctx.status(`TRIAL ${i + 1} / ${trials.length}`);
      ctx.clear(0); ctx.fix("#888", 3); await ctx.wait(500); ctx.clear(0);
      for (let k = -3; k <= 3; k++) txt(g, k ? fl : tgt, cx + k * SP[T.sp], cy, 36, "#eeeeee");
      const r = await timedKey(ctx, fms, 1000, () => ctx.clear(0), ["f", "j"], { buttons: [["f", "H / K"], ["j", "S / C"]], timeout: 2500, quiet: true });
      const ok = r.key === side; data.push({ ...T, tgt, fl, said: r.key, ok, rt: r.rt });
      if (!r.key) await oops(ctx, "TOO SLOW"); else if (!ok) await oops(ctx, "WRONG");
      ctx.clear(0); await ctx.wait(300);
    }
    const cell = (n, s) => data.filter(d => d.noise === n && d.sp === s && okRT(d)).map(d => d.rt);
    const series = [["close", "CLOSE", "sA"], ["wide", "SPREAD", "sB"]].map(([s, name, cls]) => ({ name, cls, pts: NOISE.map((n, i) => [i + 1, mean(cell(n, s)), sem(cell(n, s))]) }));
    const eff = (s) => mean(cell("incompatible", s)) - mean(cell("same", s)), eC = eff("close"), eW = eff("wide");
    const err = (n) => { const d = data.filter(x => x.noise === n); return 1 - d.filter(x => x.ok).length / d.length; };
    plotF(ctx, { title: "FLANKER INTERFERENCE", x: { lo: .4, hi: 3.6, label: "NEIGHBOURS", ticks: [] }, y: { label: "MEAN RT MS", ...rtAxis(series.flatMap(s => s.pts.map(p => p[1]))) },
      bars: true, series, vlines: heads(["SAME", "SAME KEY", "OTHER KEY"]),
      notes: [[`CLOSE  ${ms(eC)}`, "sA"], [`SPREAD ${ms(eW)}`, "sB"], ["OTHER KEY MINUS SAME", "sM"], [`ERRORS ${pct(err("same"))} ${pct(err("compatible"))} ${pct(err("incompatible"))}`, "sM"]] });
    ctx.say(!isFinite(eC) ? "Not enough correct trials to compare. Try again." : eC > 15 ?
      `Other-key neighbours cost you ${eC.toFixed(0)} ms packed close${isFinite(eW) ? ` and ${eW.toFixed(0)} ms spread out` : ""}. Eriksen and Eriksen found the same: letters right beside the target can't be shut out, and the cost shrinks as they move away.`
      : `Other-key neighbours cost you only ${eC.toFixed(0)} ms this time, even packed close. Eriksen and Eriksen's close flankers cost tens of milliseconds; try again, as fast as you can.`);
    ctx.status("");
    ctx.csv("flanker.csv", ["trial", "noise", "spacing", "target", "flanker", "response", "correct", "rt_ms"], data.map((d, i) => [i + 1, d.noise, d.sp, d.tgt, d.fl, d.said ?? "", d.ok ? 1 : 0, d.rt]));
  } };

/* ---------------- Simon & Rudell (1967): the Simon effect ---------------- */
export const SIMON = { id: "simon", group: "ACTION", tag: "SIMON & RUDELL 1967", title: "The Simon effect",
  sub: "Answer by colour. Which side it appears on shouldn't matter. It does.",
  blurb: "A dot appears left or right of centre. Blue: press F (left). Yellow: press J (right). Its side tells you nothing, yet you're faster when it's on the side of the key. Simon and Rudell's listeners heard the words LEFT and RIGHT in one ear; the ear didn't matter, and still slowed them. With headphones you can run the auditory version: low or high tones in one ear.",
  ref: "Simon, J. R., & Rudell, A. P. (1967). Auditory S-R compatibility: The effect of an irrelevant cue on information processing. Journal of Applied Psychology, 51(3), 300–304.",
  instructions: { lines: ["A blue or yellow dot appears on the left or the right. Answer by its COLOUR only: blue is F, yellow is J.", "Which side it appears on doesn't matter. Keep your eyes on the centre.", "With headphones you can do it by ear instead: a low tone is F, a high tone is J, whichever ear it's in."],
    keys: [["F", "BLUE  (OR LOW TONE)"], ["J", "YELLOW  (OR HIGH TONE)"]] },
  async run(ctx) {
    let audio = (await ctx.choose("Screen or headphones?", [["s", "SCREEN  COLOURED DOTS"], ["h", "HEADPHONES  TONES"]])) === "h";
    const q = await quick(ctx, "QUICK  48 TRIALS", "FULL  120 TRIALS");
    const { g, cx, cy, ppd } = ctx, N = q ? 48 : 120;
    let ac = null;
    const tone = (f, pan, dur = .15) => { const o = ac.createOscillator(), gn = ac.createGain(), p = ac.createStereoPanner(), t = ac.currentTime + .005;
      o.type = "sine"; o.frequency.value = f; p.pan.value = pan; gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(.35, t + .008);
      gn.gain.setValueAtTime(.35, t + dur - .01); gn.gain.linearRampToValueAtTime(0, t + dur); o.connect(gn).connect(p).connect(ac.destination); o.start(t); o.stop(t + dur + .02); };
    try {
      if (audio) {
        ac = new (window.AudioContext || window.webkitAudioContext)(); await ac.resume();
        ctx.clear(0); txt(g, "HEADPHONE CHECK", cx, cy - 30, 40, "#e9e6ff", SAIRA, "600"); txt(g, "LEFT EAR, THEN RIGHT EAR", cx, cy + 20, 28, "#ffb547", SAIRA, "500");
        for (const pan of [-1, 1, -1, 1]) { tone(600, pan, .25); await ctx.wait(450); }
        const ok = await ctx.choose("Did the beeps go left, right, left, right?", [["y", "YES"], ["n", "NO"]]);
        if (ok === "n") { audio = false; ac.close(); ac = null; await interlude(ctx, "Using the screen", "No stereo, so we'll use coloured dots on the screen instead. Blue is F, yellow is J."); }
      }
      const COL = { f: "rgb(70,125,255)", j: "rgb(240,220,40)" }, keys = ["f", "j"];
      const buttons = audio ? [["f", "LOW"], ["j", "HIGH"]] : [["f", "BLUE"], ["j", "YELLOW"]];
      let trials = []; for (let i = 0; i < N; i++) trials.push({ ans: keys[i % 2], side: i % 4 < 2 ? -1 : 1 }); trials = shuffle(trials);
      const data = []; ctx.say(audio ? "Low tone: F. High tone: J. Ignore which ear." : "Blue: F. Yellow: J. Ignore which side.");
      if (audio) { ctx.clear(0); txt(g, "LOW", cx - 120, cy, 30, "#888", SAIRA, "600"); txt(g, "HIGH", cx + 120, cy, 30, "#888", SAIRA, "600"); tone(400, 0, .3); await ctx.wait(700); tone(1000, 0, .3); await ctx.wait(800); }
      for (let i = 0; i < trials.length; i++) {
        const T = trials[i]; ctx.status(`TRIAL ${i + 1} / ${trials.length}`);
        ctx.clear(0); ctx.fix("#888", 3); await ctx.wait(500 + Math.random() * 400);
        if (audio) tone(T.ans === "f" ? 400 : 1000, T.side);
        else { g.fillStyle = COL[T.ans]; g.beginPath(); g.arc(cx + T.side * 6 * ppd, cy, .9 * ppd, 0, Math.PI * 2); g.fill(); ctx.fix("#888", 3); }
        const r = await ctx.key(keys, { buttons, timeout: 2000, quiet: true });
        const corr = (T.side < 0) === (T.ans === "f"), ok = r.key === T.ans;
        data.push({ ...T, corr, said: r.key, ok, rt: r.rt });
        if (!r.key) await oops(ctx, "TOO SLOW"); else if (!ok) await oops(ctx, "WRONG");
        ctx.clear(0); await ctx.wait(250);
      }
      const rts = (c) => data.filter(d => d.corr === c && okRT(d)).map(d => d.rt), err = (c) => { const d = data.filter(x => x.corr === c); return 1 - d.filter(x => x.ok).length / d.length; };
      const mC = mean(rts(true)), mN = mean(rts(false)), eff = mN - mC;
      plotF(ctx, { title: audio ? "SIMON EFFECT  BY EAR" : "SIMON EFFECT  BY SIDE", x: { lo: .4, hi: 2.6, label: "STIMULUS SIDE VS KEY SIDE", ticks: [] }, y: { label: "MEAN RT MS", ...rtAxis([mC, mN]) },
        series: [{ name: "SAME SIDE", cls: "sG", pts: [[1, mC, sem(rts(true))]] }, { name: "OPPOSITE", cls: "sR", pts: [[2, mN, sem(rts(false))]] }],
        notes: [[`SIMON EFFECT ${ms(eff)}`, "sA"], [`ERRORS SAME ${pct(err(true))}`, "sG"], [`ERRORS OPPOSITE ${pct(err(false))}`, "sR"]] });
      ctx.say(!isFinite(eff) ? "Not enough correct trials to compare. Try again." : eff > 5 ?
        `You were ${eff.toFixed(0)} ms faster when the ${audio ? "tone was in the ear" : "dot was on the side"} of the key you needed, though its side told you nothing. Simon and Rudell found it with words in one ear; it's usually 20 to 40 ms.`
        : `Only ${eff.toFixed(0)} ms between same-side and opposite-side trials this time. The usual Simon effect is 20 to 40 ms, biggest for the fastest answers, so don't hold back.`);
      ctx.status("");
      ctx.csv("simon.csv", ["trial", "modality", "stimulus_side", "correct_key", "corresponding", "response", "correct", "rt_ms"],
        data.map((d, i) => [i + 1, audio ? "tone" : "colour", d.side < 0 ? "left" : "right", d.ans, d.corr ? 1 : 0, d.said ?? "", d.ok ? 1 : 0, d.rt]));
    } finally { if (ac) ac.close(); }
  } };

/* ---------------- Raymond, Shapiro & Arnell (1992): the attentional blink ---------------- */
const AB_T1 = ["B", "D", "F", "G", "K", "P", "R", "T"];
const AB_ALL = "ABCDEFGHJKLMNPQRSTUVWZ".split("");
export const BLINK = { id: "blink", group: "ATTENTION", tag: "RAYMOND, SHAPIRO & ARNELL 1992", title: "Attentional blink",
  sub: "Catch one letter in a fast stream, and you miss what comes just after it.",
  blurb: "Letters flash in one spot, ten a second. One is WHITE: remember it. Then: was there a black X after it? Right after you catch the white letter, an X is easy to miss for about half a second. An X in the very next slot often gets through anyway (lag-1 sparing). FULL adds the control: ignore the white letter and just look for the X.",
  ref: "Raymond, J. E., Shapiro, K. L., & Arnell, K. M. (1992). Temporary suppression of visual processing in an RSVP task: An attentional blink? Journal of Experimental Psychology: Human Perception and Performance, 18(3), 849–860.",
  instructions: { lines: ["Black letters flash very fast in the middle of the screen. Keep your eyes on that spot.", "One letter is WHITE. Remember it. Afterwards, tap which white letter you saw.", "Then say whether a black X appeared anywhere after the white letter. Often there is one; sometimes there isn't."],
    keys: [["B D F G K P R T", "THE WHITE LETTER"], ["Y / N", "WAS THERE AN X?"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  50 TRIALS", "FULL  150 TRIALS  WITH CONTROL");
    const { g, cx, cy } = ctx, fms = await frameMs(ctx);
    const soaF = Math.max(2, Math.round(100 / fms)), onF = Math.max(1, Math.round(soaF * .67)), offF = soaF - onF, SOA = soaF * fms;
    const LAGS = q ? [1, 2, 3, 5, 7] : [1, 2, 3, 4, 5, 6, 8];
    const mk = (dual, per, absent) => { const t = []; for (const lag of LAGS) for (let r = 0; r < per; r++) t.push({ dual, lag }); for (let r = 0; r < absent; r++) t.push({ dual, lag: 0 }); return shuffle(t); };
    const blocks = q ? [mk(true, 8, 10)] : [mk(true, 12, 16), mk(false, 6, 8)];
    const data = [];
    for (let b = 0; b < blocks.length; b++) {
      const dual = blocks[b][0].dual;
      if (b > 0) await interlude(ctx, "Part 2: only the X", "Same streams, but now ignore the white letter. Just say whether there was a black X after it.");
      ctx.say(dual ? "Remember the WHITE letter. Then: was there a black X after it?" : "Ignore the white letter. Was there a black X after it?");
      for (let i = 0; i < blocks[b].length; i++) {
        const T = blocks[b][i], t1 = rnd(AB_T1), nPre = 7 + Math.floor(Math.random() * 7), len = nPre + 1 + 9, t2 = T.lag ? nPre + T.lag : -1;
        const seq = []; for (let k = 0; k < len; k++) { let L; do { L = rnd(AB_ALL); } while (L === t1 || L === seq[k - 1]); seq.push(L); }
        seq[nPre] = t1; if (t2 >= 0) seq[t2] = "X";
        ctx.status(`${dual ? "" : "X ONLY  "}TRIAL ${i + 1} / ${blocks[b].length}`);
        ctx.clear(.5); txt(g, "+", cx, cy, 40, "#000"); await ctx.wait(700);
        const on = [];
        for (let k = 0; k < len; k++) {
          ctx.clear(.5); txt(g, seq[k], cx, cy, 52, k === nPre ? "#ffffff" : "#000000"); on.push(performance.now());
          await ctx.frames(onF); if (offF) { ctx.clear(.5); await ctx.frames(offF); }
        }
        ctx.clear(.5); await ctx.wait(300);
        let r1 = null;
        if (dual) { ctx.say("Which letter was WHITE?"); r1 = (await ctx.key(AB_T1.map(l => l.toLowerCase()), { buttons: AB_T1.map(l => [l.toLowerCase(), l]), quiet: true })).key.toUpperCase(); }
        ctx.say("Was there a black X after it?");
        const r2 = (await ctx.key(["y", "n"], { buttons: [["y", "YES, AN X"], ["n", "NO X"]], quiet: true })).key === "y";
        data.push({ dual, lag: T.lag, t1, r1, t1ok: dual ? r1 === t1 : true, xSaid: r2, soa: t2 >= 0 ? on[t2] - on[nPre] : null });
        ctx.say(dual ? "Remember the WHITE letter. Then: was there a black X after it?" : "Ignore the white letter. Was there a black X after it?");
        ctx.clear(.5); await ctx.wait(350);
      }
    }
    const hit = (dual, lag) => { const d = data.filter(x => x.dual === dual && x.lag === lag && x.t1ok); return d.length ? d.filter(x => x.xSaid).length / d.length : NaN; };
    const fa = (dual) => { const d = data.filter(x => x.dual === dual && x.lag === 0 && x.t1ok); return d.length ? d.filter(x => x.xSaid).length / d.length : NaN; };
    const lagMs = (L) => L * SOA, series = [{ name: "X AFTER T1", cls: "sG", line: true, pts: LAGS.map(L => [lagMs(L), hit(true, L)]) }];
    if (!q) series.push({ name: "X ONLY", cls: "sW", line: true, pts: LAGS.map(L => [lagMs(L), hit(false, L)]) });
    const t1acc = data.filter(d => d.dual).filter(d => d.t1ok).length / data.filter(d => d.dual).length;
    const blinkLags = LAGS.filter(L => L >= 2 && L <= 4), trough = Math.min(...blinkLags.map(L => hit(true, L)).filter(isFinite)), late = hit(true, LAGS[LAGS.length - 1]), lag1 = hit(true, 1);
    const xmax = lagMs(LAGS[LAGS.length - 1]) + SOA;
    plotF(ctx, { title: "ATTENTIONAL BLINK", x: { lo: 0, hi: xmax, label: "X AFTER WHITE LETTER  MS", ticks: LAGS.map(lagMs).map(v => Math.round(v / 10) * 10) },
      y: { lo: 0, hi: 1, label: "P(X SEEN)", ticks: [0, .25, .5, .75, 1] }, series,
      hlines: [{ y: fa(true), cls: "sR", label: "FALSE ALARMS" }],
      notes: [[`WHITE LETTER ${pct(t1acc)}`, "sM"], [`LAG 1  ${pct(lag1)}`, "sG"], [`LOW POINT ${pct(trough)}`, "sG"], [`LAST LAG ${pct(late)}`, "sG"], [`${SOA.toFixed(0)} MS PER LETTER`, "sM"]] });
    const blinked = isFinite(trough) && isFinite(late) && late - trough >= .15;
    ctx.say(!isFinite(trough) ? "Too few trials with the white letter right. Try again." : blinked ?
      `${Math.round(2 * SOA / 10) * 10}–${Math.round(4 * SOA / 10) * 10} ms after the white letter you caught the X ${pct(trough)} of the time, later ${pct(late)}${lag1 - trough >= .1 ? `; the very next slot was spared (${pct(lag1)})` : ""}. Raymond, Shapiro and Arnell's blink: attention busy with the first target lets the second slip by.`
      : `No clear dip this time (low point ${pct(trough)}, last lag ${pct(late)}). Most people miss the X far more often 200–500 ms after the white letter. Try the full run.`);
    ctx.status("");
    ctx.csv("attentional_blink.csv", ["trial", "dual_task", "lag", "t2_soa_ms", "t1", "t1_response", "t1_correct", "said_x"],
      data.map((d, i) => [i + 1, d.dual ? 1 : 0, d.lag, d.soa ?? "", d.t1, d.r1 ?? "", d.t1ok ? 1 : 0, d.xSaid ? 1 : 0]));
  } };

/* ---------------- Pylyshyn & Storm (1988): multiple-object tracking ---------------- */
export const MOT = { id: "mot", group: "ATTENTION", tag: "PYLYSHYN & STORM 1988", title: "Multiple-object tracking",
  sub: "Keep track of a few dots among identical ones. How many can you follow?",
  blurb: "Ten identical dots. A few flash green: those are your targets. Then they all wander around for a few seconds, and you tap the ones you were tracking. Accuracy falls as targets are added; the capacity estimate corrects for lucky guesses. Pylyshyn and Storm's observers could track up to five at once.",
  ref: "Pylyshyn, Z. W., & Storm, R. W. (1988). Tracking multiple independent targets: Evidence for a parallel tracking mechanism. Spatial Vision, 3(3), 179–197.",
  instructions: { lines: ["Ten white dots appear. Some of them flash green: those are your targets.", "Then all the dots move around for a few seconds. Follow the targets with your attention.", "When they stop, tap (or click) the dots you were tracking. Guess if you lost one."],
    keys: [["TAP", "SELECT A DOT"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  15 TRIALS", "FULL  36 TRIALS");
    const { g, W, H } = ctx, NI = 10, R = 13, X0 = 70, X1 = W - 70, Y0 = 50, Y1 = H - 50, SPD = 170, DUR = q ? 5 : 8;
    const NT = q ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6];
    let trials = []; for (let r = 0; r < (q ? 3 : 6); r++) for (const n of NT) trials.push(n); trials = shuffle(trials);
    const draw = (P, mark = {}) => { ctx.clear(.12); g.strokeStyle = "#444"; g.lineWidth = 1; g.strokeRect(X0 - R, Y0 - R, X1 - X0 + 2 * R, Y1 - Y0 + 2 * R);
      P.forEach((p, i) => { g.fillStyle = mark.fill?.[i] || "#eeeeee"; g.beginPath(); g.arc(p.x, p.y, R, 0, Math.PI * 2); g.fill();
        if (mark.ring?.[i]) { g.strokeStyle = mark.ring[i]; g.lineWidth = 4; g.beginPath(); g.arc(p.x, p.y, R + 8, 0, Math.PI * 2); g.stroke(); } }); };
    const data = [];
    for (let t = 0; t < trials.length; t++) {
      const n = trials[t]; ctx.status(`TRIAL ${t + 1} / ${trials.length}  ·  ${n} TARGET${n > 1 ? "S" : ""}`);
      const P = [];
      while (P.length < NI) { const x = X0 + Math.random() * (X1 - X0), y = Y0 + Math.random() * (Y1 - Y0);
        if (P.every(p => Math.hypot(p.x - x, p.y - y) > 70)) { const a = Math.random() * Math.PI * 2; P.push({ x, y, vx: SPD * Math.cos(a), vy: SPD * Math.sin(a) }); } }
      const tg = new Set(shuffle([...Array(NI).keys()]).slice(0, n));
      ctx.say(`Remember the ${n} green dot${n > 1 ? "s" : ""}.`);
      for (let k = 0; k < 8; k++) { draw(P, { fill: Object.fromEntries([...tg].map(i => [i, k % 2 ? "#eeeeee" : "rgb(0,227,154)"])) }); await ctx.wait(260); }
      draw(P); await ctx.wait(400);
      ctx.say("Track them.");
      await ctx.loop((time, dt) => {
        dt = Math.min(dt, .05);
        for (const p of P) { const a = (Math.random() - .5) * 4 * dt, c = Math.cos(a), s = Math.sin(a); [p.vx, p.vy] = [p.vx * c - p.vy * s, p.vx * s + p.vy * c];
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < X0) { p.x = X0; p.vx = Math.abs(p.vx); } if (p.x > X1) { p.x = X1; p.vx = -Math.abs(p.vx); }
          if (p.y < Y0) { p.y = Y0; p.vy = Math.abs(p.vy); } if (p.y > Y1) { p.y = Y1; p.vy = -Math.abs(p.vy); } }
        // dots bounce off each other (equal-mass elastic: swap the velocity components along the line between them)
        for (let i = 0; i < NI; i++) for (let j = i + 1; j < NI; j++) { const A = P[i], B = P[j], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
          if (d < 3.2 * R && d > 0) { const nx = dx / d, ny = dy / d, va = A.vx * nx + A.vy * ny, vb = B.vx * nx + B.vy * ny;
            if (va - vb > 0) { A.vx += (vb - va) * nx; A.vy += (vb - va) * ny; B.vx += (va - vb) * nx; B.vy += (va - vb) * ny; } } }
        for (const p of P) { const v = Math.hypot(p.vx, p.vy) || 1; p.vx *= SPD / v; p.vy *= SPD / v; }
        draw(P); return time < DUR;
      });
      ctx.say(`Tap the ${n} dot${n > 1 ? "s" : ""} you were tracking.`);
      const chosen = [], ring = {};
      while (chosen.length < n) {
        ctx.status(`TAP ${n - chosen.length} MORE`);
        const c = await ctx.click(); if (c.x === null) continue;
        let best = -1, bd = 48; P.forEach((p, i) => { const d = Math.hypot(p.x - c.x, p.y - c.y); if (!chosen.includes(i) && d < bd) { bd = d; best = i; } });
        if (best < 0) continue;
        chosen.push(best); ring[best] = "#ffb547"; draw(P, { ring }); window.SFX && window.SFX.play("key");
      }
      const correct = chosen.filter(i => tg.has(i)).length, rv = {}, fill = {};
      for (const i of tg) fill[i] = "rgb(0,227,154)"; for (const i of chosen) rv[i] = tg.has(i) ? "rgb(0,227,154)" : "#ff5a5a";
      draw(P, { ring: rv, fill }); ctx.say(`${correct} of ${n} right.`); await ctx.wait(1100);
      data.push({ n, correct });
    }
    // how many were really tracked? If you track m of n targets and guess the other n − m among the N − m untracked dots,
    // you expect m + (n − m)² / (N − m) correct. Solve for m from the mean.
    const capOf = (n, c) => { if (c >= n) return n; let lo = 0, hi = n; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2, e = m + (n - m) ** 2 / (NI - m); if (e < c) lo = m; else hi = m; } return (lo + hi) / 2; };
    const per = NT.map(n => { const d = data.filter(x => x.n === n), c = mean(d.map(x => x.correct)); return { n, p: c / n, se: sem(d.map(x => x.correct / n)), m: capOf(n, c) }; });
    const cap = Math.max(...per.map(r => r.m));
    plotF(ctx, { title: "TRACKING ACCURACY", x: { lo: .5, hi: NT.length + .5, label: "NUMBER OF TARGETS", ticks: NT }, y: { lo: 0, hi: 1, label: "P(TARGET FOUND)", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "YOU", cls: "sG", line: true, pts: per.map(r => [r.n, r.p, r.se]) }, { name: "GUESSING", cls: "sD", line: true, pts: NT.map(n => [n, n / NI]) }],
      notes: [[`CAPACITY ABOUT ${cap.toFixed(1)} DOTS`, "sA"], ...per.map(r => [`${r.n}  ${pct(r.p)}  K ${r.m.toFixed(1)}`, "sM"])] });
    ctx.say(`You tracked about ${cap.toFixed(1)} dots at once, after correcting for lucky guesses. Pylyshyn and Storm's observers followed up to five of ten identical dots, accuracy slipping as targets were added; most people manage about four.`);
    ctx.status("");
    ctx.csv("mot.csv", ["trial", "targets", "correct", "proportion"], data.map((d, i) => [i + 1, d.n, d.correct, d.correct / d.n]));
  } };

/* ---------------- Posner & Cohen (1984): inhibition of return ---------------- */
export const IOR = { id: "ior", group: "ATTENTION", tag: "POSNER & COHEN 1984", title: "Inhibition of return",
  sub: "A flash pulls attention to a box. Soon after, that box is faster. A bit later, slower.",
  blurb: "One of two boxes flashes, then a target appears in one of them. The flash predicts nothing. A target soon after the flash is caught faster in the flashed box; from about a third of a second on, it's caught SLOWER there. Attention, having left, is slow to go back.",
  ref: "Posner, M. I., & Cohen, Y. (1984). Components of visual orienting. In H. Bouma & D. G. Bouwhuis (Eds.), Attention and Performance X: Control of language processes (pp. 531–556). Hillsdale, NJ: Erlbaum.",
  instructions: { lines: ["Keep your eyes on the centre. Two boxes sit on either side.", "One box flashes. Then a white square appears in one of the boxes, either one. Press SPACE as soon as you see it.", "The flash doesn't tell you where the square will be. On a few trials no square comes: then don't press."],
    keys: [["SPACE", "I SAW THE SQUARE"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  72 TRIALS", "FULL  160 TRIALS");
    const { g, cx, cy, ppd } = ctx, fms = await frameMs(ctx), ecc = 7 * ppd, bs = 1.6 * ppd;
    const SOAS = q ? [100, 200, 400, 700] : [50, 100, 200, 300, 500, 800], reps = q ? 8 : 12;
    let trials = []; for (const soa of SOAS) for (const cued of [true, false]) for (let r = 0; r < reps; r++) trials.push({ soa, cued });
    for (let r = 0; r < (q ? 8 : 16); r++) trials.push({ soa: rnd(SOAS), cued: null }); trials = shuffle(trials);
    const boxes = (hi) => { ctx.clear(.1); for (const s of [-1, 1]) { g.strokeStyle = s === hi ? "#ffffff" : "#999999"; g.lineWidth = s === hi ? 7 : 2; g.strokeRect(cx + s * ecc - bs / 2, cy - bs / 2, bs, bs); } ctx.fix("#bbb", 3); };
    const fr = (t) => Math.max(1, Math.round(t / fms)), cueF = fr(100);
    const data = []; ctx.say("SPACE when the square appears. The flash means nothing. Eyes on the centre.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], cueSide = rnd([-1, 1]), side = T.cued === null ? 0 : T.cued ? cueSide : -cueSide;
      ctx.status(`TRIAL ${i + 1} / ${trials.length}`);
      boxes(0); await ctx.wait(800 + Math.random() * 500);
      // cue for 100 ms; the target comes at the SOA (inside the cue for SOAs under 100 ms)
      const soaF = fr(T.soa); boxes(cueSide);
      for (let f = 0; f < soaF; f++) { await ctx.raf(); if (f === cueF - 1) boxes(0); }
      if (side) { if (soaF < cueF) boxes(cueSide); g.fillStyle = "#fff"; g.fillRect(cx + side * ecc - bs * .28, cy - bs * .28, bs * .56, bs * .56); }
      const p = ctx.key([" "], { buttons: [[" ", "SEEN IT"]], timeout: 1200, quiet: true });
      if (side && soaF < cueF) { let done = false; p.then(() => { done = true; }, () => {}); for (let f = soaF; f < cueF && !done; f++) await ctx.raf();
        if (!done) { boxes(0); g.fillStyle = "#fff"; g.fillRect(cx + side * ecc - bs * .28, cy - bs * .28, bs * .56, bs * .56); } }
      const r = await p, pressed = r.key === " ";
      data.push({ ...T, cueSide, side, pressed, rt: pressed ? r.rt : null });
      boxes(0);
      if (pressed && r.rt < 100) { ctx.say("Too fast: wait for the square."); await ctx.wait(900); }
      else if (T.cued === null && pressed) { ctx.say("Nothing came that time. Don't press on those."); await ctx.wait(900); }
      else ctx.say("SPACE when the square appears. The flash means nothing. Eyes on the centre.");
      await ctx.wait(300);
    }
    const rts = (soa, cued) => data.filter(d => d.soa === soa && d.cued === cued && d.pressed && d.rt >= 100 && d.rt <= 1000).map(d => d.rt);
    const C = SOAS.map(s => mean(rts(s, true))), U = SOAS.map(s => mean(rts(s, false))), D = SOAS.map((s, i) => U[i] - C[i]);
    // the crossover: the last change from benefit to cost after which the cued box stays slower
    let cross = NaN; for (let i = 1; i < SOAS.length; i++) if (D[i - 1] > 0 && D.slice(i).every(d => d <= 0)) { cross = SOAS[i - 1] + D[i - 1] / (D[i - 1] - D[i]) * (SOAS[i] - SOAS[i - 1]); break; }
    const fa = data.filter(d => d.cued === null && d.pressed).length, nc = data.filter(d => d.cued === null).length;
    const xmax = SOAS[SOAS.length - 1] + 100;
    plotF(ctx, { title: "CUED VS UNCUED BOX", x: { lo: 0, hi: xmax, label: "FLASH TO TARGET  MS", ticks: SOAS }, y: { label: "MEAN RT MS", ...rtAxis([...C, ...U], 50) },
      series: [{ name: "FLASHED BOX", cls: "sG", line: true, pts: SOAS.map((s, i) => [s, C[i], sem(rts(s, true))]) }, { name: "OTHER BOX", cls: "sR", line: true, pts: SOAS.map((s, i) => [s, U[i], sem(rts(s, false))]) }],
      vlines: isFinite(cross) ? [{ x: cross, cls: "sA", label: `CROSSOVER ${cross.toFixed(0)}`, dy: 0 }] : [],
      notes: [...SOAS.map((s, i) => [`${s} MS  ${D[i] >= 0 ? "HELPS" : "HURTS"} ${isFinite(D[i]) ? Math.abs(D[i]).toFixed(0) : "-"}`, D[i] >= 0 ? "sG" : "sR"]), [`CATCH PRESSES ${fa} / ${nc}`, "sM"]] });
    const early = D[0], lateD = mean(D.filter((d, i) => SOAS[i] >= 400 && isFinite(d)));
    ctx.say(!isFinite(early) || !isFinite(lateD) ? "Not enough usable trials. Wait for the square, and try again." :
      `Right after the flash the flashed box was ${early >= 0 ? `${early.toFixed(0)} ms faster` : `${(-early).toFixed(0)} ms slower`}; from 400 ms on, ${lateD <= 0 ? `${(-lateD).toFixed(0)} ms slower` : `still ${lateD.toFixed(0)} ms faster`}. ${lateD < 0 ? "That's Posner and Cohen's inhibition of return: once attention leaves a place, it's slow to go back." : "Posner and Cohen found it turns into a cost from about 300 ms on. Try the full run."}`);
    ctx.status("");
    ctx.csv("inhibition_of_return.csv", ["trial", "soa_ms", "cue_side", "target_side", "cued", "pressed", "rt_ms"],
      data.map((d, i) => [i + 1, d.soa, d.cueSide, d.side, d.cued === null ? "catch" : d.cued ? 1 : 0, d.pressed ? 1 : 0, d.rt ?? ""]));
  } };

/* ---------------- Rogers & Monsell (1995): task switching in alternating runs ---------------- */
export const SWITCH = { id: "taskswitch", group: "ACTION", tag: "ROGERS & MONSELL 1995", title: "Task-switching cost",
  sub: "Two easy tasks, swapped every second trial. The swap costs time, even when you know it's coming.",
  blurb: "A letter and a digit appear in one quarter of a grid, moving clockwise. In the top row judge the letter (vowel or consonant); in the bottom row judge the digit (even or odd). So the task changes every second trial, predictably. Rogers and Monsell found switch trials slower than repeats; more time to prepare shrinks the cost, but never to zero.",
  ref: "Rogers, R. D., & Monsell, S. (1995). Costs of a predictable switch between simple cognitive tasks. Journal of Experimental Psychology: General, 124(2), 207–231.",
  instructions: { lines: ["A letter and a number appear together in one box of a 2 × 2 grid. Each trial they move one box clockwise.", "TOP row: judge the LETTER. Vowel: press F. Consonant: press J.", "BOTTOM row: judge the NUMBER. Even: press F. Odd: press J. Be quick and accurate."],
    keys: [["F", "VOWEL  /  EVEN"], ["J", "CONSONANT  /  ODD"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  2 BLOCKS × 40", "FULL  4 BLOCKS × 64");
    const { g, cx, cy } = ctx, RSIS = q ? shuffle([150, 1200]) : shuffle([150, 300, 600, 1200]), N = q ? 40 : 64;
    const VOW = ["A", "E", "I", "U"], CON = ["G", "K", "M", "R"], EVEN = ["2", "4", "6", "8"], ODD = ["3", "5", "7", "9"], NEU = ["#", "?", "*", "%"];
    const cw = 230, ch = 150, CELL = [[-1, -1], [1, -1], [1, 1], [-1, 1]];   // TL, TR, BR, BL: clockwise
    const grid = () => { ctx.clear(0); g.strokeStyle = "#9a97ab"; g.lineWidth = 2; g.strokeRect(cx - cw, cy - ch, 2 * cw, 2 * ch);
      g.beginPath(); g.moveTo(cx, cy - ch); g.lineTo(cx, cy + ch); g.moveTo(cx - cw, cy); g.lineTo(cx + cw, cy); g.stroke();
      txt(g, "LETTER", cx - cw - 70, cy - ch / 2, 24, "#7b7890", SAIRA, "600"); txt(g, "NUMBER", cx - cw - 70, cy + ch / 2, 24, "#7b7890", SAIRA, "600");
      txt(g, "VOWEL F · CONSONANT J", cx + cw + 10 + 95, cy - ch / 2, 18, "#7b7890", SAIRA, "500"); txt(g, "EVEN F · ODD J", cx + cw + 10 + 95, cy + ch / 2, 18, "#7b7890", SAIRA, "500"); };
    const data = [];
    for (let b = 0; b < RSIS.length; b++) {
      const rsi = RSIS[b];
      await interlude(ctx, `Block ${b + 1} of ${RSIS.length}`, `${rsi >= 600 ? "A longer" : "A short"} gap between trials this time (${rsi} ms). Top row: letter. Bottom row: number. F for vowel or even, J for consonant or odd.`);
      ctx.say("Top: vowel F, consonant J.  Bottom: even F, odd J.");
      let pos = Math.floor(Math.random() * 4), prevErr = false;
      grid(); await ctx.wait(800);
      for (let i = 0; i < N; i++) {
        const task = pos < 2 ? "letter" : "number", sw = i > 0 && (pos === 0 || pos === 2), ans = rnd(["f", "j"]);
        const tchar = task === "letter" ? rnd(ans === "f" ? VOW : CON) : rnd(ans === "f" ? EVEN : ODD);
        const neutral = Math.random() < 1 / 3, oAns = rnd(["f", "j"]);
        const ochar = neutral ? rnd(NEU) : task === "letter" ? rnd(oAns === "f" ? EVEN : ODD) : rnd(oAns === "f" ? VOW : CON);
        const pair = Math.random() < .5 ? tchar + ochar : ochar + tchar;
        ctx.status(`BLOCK ${b + 1}  RSI ${rsi}  ·  ${i + 1} / ${N}`);
        grid(); const [sx, sy] = CELL[pos]; txt(g, pair, cx + sx * cw / 2, cy + sy * ch / 2, 70, "#eeeeee");
        const r = await ctx.key(["f", "j"], { buttons: [["f", "VOWEL / EVEN"], ["j", "CONS. / ODD"]], timeout: 4000, quiet: true });
        const ok = r.key === ans;
        data.push({ block: b + 1, rsi, i, task, sw, pair, neutral, congruent: neutral ? null : oAns === ans, ok, rt: r.rt, said: r.key, afterErr: prevErr });
        grid();
        if (!ok) { txt(g, r.key ? "WRONG" : "TOO SLOW", cx, cy + ch + 40, 30, "#ff5a5a", SAIRA, "600"); await ctx.wait(600); grid(); }
        prevErr = !ok; pos = (pos + 1) % 4;
        await ctx.wait(rsi);
      }
    }
    const use = (d) => d.i >= 4 && !d.afterErr && okRT(d, 200, 3000);
    const RS = RSIS.slice().sort((a, b) => a - b);
    const cell = (rsi, sw) => data.filter(d => d.rsi === rsi && d.sw === sw && use(d)).map(d => d.rt);
    const S = RS.map(r => mean(cell(r, true))), Rp = RS.map(r => mean(cell(r, false))), cost = RS.map((r, i) => S[i] - Rp[i]);
    const err = (sw) => { const d = data.filter(x => x.i >= 4 && x.sw === sw); return 1 - d.filter(x => x.ok).length / d.length; };
    plotF(ctx, { title: "SWITCH VS REPEAT", x: { lo: 0, hi: 1350, label: "GAP BEFORE THE TRIAL  MS", ticks: RS }, y: { label: "MEAN RT MS", ...rtAxis([...S, ...Rp]) },
      series: [{ name: "SWITCH", cls: "sR", line: true, pts: RS.map((r, i) => [r, S[i], sem(cell(r, true))]) }, { name: "REPEAT", cls: "sG", line: true, pts: RS.map((r, i) => [r, Rp[i], sem(cell(r, false))]) }],
      notes: [...RS.map((r, i) => [`${r} MS  COST ${ms(cost[i])}`, "sA"]), [`ERRORS SWITCH ${pct(err(true))}`, "sR"], [`ERRORS REPEAT ${pct(err(false))}`, "sG"]] });
    const c0 = cost[0], c1 = cost[cost.length - 1];
    ctx.say(!isFinite(c0) || !isFinite(c1) ? "Not enough correct trials to compare. Try again, a little more carefully." : c0 > 20 ?
      `Switching task cost you ${c0.toFixed(0)} ms with a ${RS[0]} ms gap, ${c1.toFixed(0)} ms with ${RS[RS.length - 1]} ms to prepare. Rogers and Monsell: preparing shrinks the cost but never removes it; some of the switch waits for the stimulus.`
      : `Hardly any switch cost this time (${c0.toFixed(0)} ms at ${RS[0]} ms). Rogers and Monsell's switches cost well over 100 ms at short gaps. Try again, as fast as you can.`);
    ctx.status("");
    ctx.csv("task_switching.csv", ["trial", "block", "rsi_ms", "position_in_block", "task", "switch", "stimulus", "neutral_other", "congruent", "response", "correct", "after_error", "rt_ms"],
      data.map((d, k) => [k + 1, d.block, d.rsi, d.i + 1, d.task, d.sw ? 1 : 0, d.pair, d.neutral ? 1 : 0, d.congruent === null ? "" : d.congruent ? 1 : 0, d.said ?? "", d.ok ? 1 : 0, d.afterErr ? 1 : 0, d.rt]));
  } };

/* ---------------- Navon (1977): global precedence ---------------- */
const GLYPH = {
  H: ["X...X", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  S: [".XXXX", "X....", "X....", ".XXX.", "....X", "....X", "XXXX."],
  O: ["XXXXX", "X...X", "X...X", "X...X", "X...X", "X...X", "XXXXX"],   // the neutral global shape: a rectangle
};
export const NAVON = { id: "navon", group: "ATTENTION", tag: "NAVON 1977", title: "Forest before trees",
  sub: "A big letter made of small letters. The big one wins.",
  blurb: "A big H or S made of small H's or S's (or of plain boxes) flashes briefly. In one block name the BIG letter, in the other the SMALL ones. Navon found the big letter was named faster, and a clashing big letter slowed naming the small ones, but not the other way round.",
  ref: "Navon, D. (1977). Forest before trees: The precedence of global features in visual perception. Cognitive Psychology, 9(3), 353–383.",
  instructions: { lines: ["A big letter made of small letters flashes for a moment.", "In some blocks you name the BIG letter; in others you name the SMALL letters it's made of. The screen tells you which.", "The answer is always H or S. Be fast and accurate."],
    keys: [["H", "H"], ["S", "S"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  2 BLOCKS × 30", "FULL  4 BLOCKS × 36");
    const { g, cx, cy } = ctx, fms = await frameMs(ctx), per = q ? 10 : 12, pitch = 26;
    const first = rnd(["global", "local"]), other = first === "global" ? "local" : "global", order = q ? [first, other] : [first, other, other, first];
    const draw = (big, small, dx, dy) => { ctx.clear(0); const P = GLYPH[big];
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (P[r][c] === "X") { const x = cx + dx + (c - 2) * pitch, y = cy + dy + (r - 3) * pitch;
        if (small === "box") { g.strokeStyle = "#eeeeee"; g.lineWidth = 2.5; g.strokeRect(x - 8, y - 8, 16, 16); } else txt(g, small, x, y, 24, "#eeeeee"); } };
    const data = [];
    for (let b = 0; b < order.length; b++) {
      const lvl = order[b];
      await interlude(ctx, lvl === "global" ? "Name the BIG letter" : "Name the SMALL letters", lvl === "global" ? "Press H or S for the big letter. Ignore the small ones it's made of." : "Press H or S for the small letters. Ignore the big shape they make.");
      ctx.say(lvl === "global" ? "BIG letter: H or S." : "SMALL letters: H or S.");
      let trials = []; for (const cond of ["consistent", "neutral", "conflicting"]) for (let k = 0; k < per; k++) trials.push({ cond, tgt: k % 2 ? "H" : "S" });
      trials = [...shuffle(trials).slice(0, 2).map(t => ({ ...t, warm: true })), ...shuffle(trials)];
      for (let i = 0; i < trials.length; i++) {
        const T = trials[i], oth = T.tgt === "H" ? "S" : "H";
        const irr = T.cond === "consistent" ? T.tgt : T.cond === "conflicting" ? oth : null;
        const big = lvl === "global" ? T.tgt : irr || "O", small = lvl === "local" ? T.tgt : irr || "box";
        ctx.status(`${lvl === "global" ? "BIG" : "SMALL"}  ${i + 1} / ${trials.length}`);
        ctx.clear(0); ctx.fix("#888", 3); await ctx.wait(500);
        const dx = (Math.random() * 2 - 1) * 90, dy = (Math.random() * 2 - 1) * 50; draw(big, small, dx, dy);
        const r = await timedKey(ctx, fms, 150, () => ctx.clear(0), ["h", "s"], { buttons: [["h", "H"], ["s", "S"]], timeout: 2500, quiet: true });
        const ok = r.key === T.tgt.toLowerCase(); data.push({ lvl, ...T, big, small, said: r.key, ok, rt: r.rt, block: b + 1 });
        if (!r.key) await oops(ctx, "TOO SLOW"); else if (!ok) await oops(ctx, "WRONG");
        ctx.clear(0); await ctx.wait(300);
      }
    }
    const CND = ["consistent", "neutral", "conflicting"];
    const cell = (lvl, c) => data.filter(d => !d.warm && d.lvl === lvl && d.cond === c && okRT(d)).map(d => d.rt);
    const series = [["global", "BIG LETTER", "sB"], ["local", "SMALL LETTERS", "sA"]].map(([l, name, cls]) => ({ name, cls, pts: CND.map((c, i) => [i + 1, mean(cell(l, c)), sem(cell(l, c))]) }));
    const mG = mean(CND.flatMap(c => cell("global", c))), mL = mean(CND.flatMap(c => cell("local", c)));
    const iG = mean(cell("global", "conflicting")) - mean(cell("global", "consistent")), iL = mean(cell("local", "conflicting")) - mean(cell("local", "consistent"));
    plotF(ctx, { title: "GLOBAL PRECEDENCE", x: { lo: .4, hi: 3.6, label: "THE OTHER LEVEL", ticks: [] }, y: { label: "MEAN RT MS", ...rtAxis(series.flatMap(s => s.pts.map(p => p[1]))) },
      bars: true, series, vlines: heads(["SAME LETTER", "NEUTRAL", "CLASHING"]),
      notes: [[`BIG FASTER BY ${ms(mL - mG)}`, "sW"], [`CLASH COST BIG ${ms(iG)}`, "sB"], [`CLASH COST SMALL ${ms(iL)}`, "sA"]] });
    const prec = mL - mG > 10 && (!isFinite(iL - iG) || iL - iG > 10);
    ctx.say(!isFinite(mG - mL) ? "Not enough correct trials to compare. Try again." :
      `Big letter ${mL - mG >= 0 ? `${(mL - mG).toFixed(0)} ms faster` : `${(mG - mL).toFixed(0)} ms slower`} than small. A clashing big letter cost small answers ${isFinite(iL) ? iL.toFixed(0) : "-"} ms; clashing small letters cost big answers ${isFinite(iG) ? iG.toFixed(0) : "-"} ms. ${prec ? "Navon's forest before trees: the whole comes first, and gets in the way of the parts." : "Navon found the big letter first, and clashing big letters slowing the small ones, not the reverse. Try again."}`);
    ctx.status("");
    ctx.csv("navon.csv", ["trial", "block", "attend", "condition", "global", "local", "target", "warmup", "response", "correct", "rt_ms"],
      data.map((d, i) => [i + 1, d.block, d.lvl, d.cond, d.big, d.small, d.tgt, d.warm ? 1 : 0, d.said ?? "", d.ok ? 1 : 0, d.rt]));
  } };

/* ---------------- Hick (1952): choice reaction time and information ---------------- */
const HKEYS = ["a", "s", "d", "f", "j", "k", "l", ";"];
export const HICK = { id: "hick", group: "ACTION", tag: "HICK 1952", title: "Hick's law",
  sub: "More choices, slower answers. But only by a fixed amount per doubling.",
  blurb: "A row of lamps; one lights up; press its key. Blocks have 1, 2, 4 or 8 lamps. Reaction time grows in a straight line with the number of bits (log2 of the choices): each doubling adds the same time. Hick used log2(n + 1), counting the chance of no signal; with a fixed foreperiod the plain log2(n) fits as well.",
  ref: "Hick, W. E. (1952). On the rate of gain of information. Quarterly Journal of Experimental Psychology, 4(1), 11–26.",
  instructions: { lines: ["A row of lamps appears. After a moment, one of them lights up.", "Press the key (or tap the button) under that lamp as fast as you can. Rest your fingers on A S D F and J K L ; .", "Some blocks have one lamp, some two, four or eight."],
    keys: [["A S D F", "LEFT FOUR LAMPS"], ["J K L ;", "RIGHT FOUR LAMPS"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  4 BLOCKS × 18", "FULL  8 BLOCKS × 22");
    const { g, cx, cy } = ctx, NS = q ? [1, 2, 4, 8] : [1, 2, 4, 8, 8, 4, 2, 1], per = q ? 16 : 20;
    const ACT = { 1: [3], 2: [3, 4], 4: [2, 3, 4, 5], 8: [0, 1, 2, 3, 4, 5, 6, 7] };
    const lx = (i) => cx + (i - 3.5) * 104;
    const lamps = (n, lit = -1) => { ctx.clear(0); for (const i of ACT[n]) { g.beginPath(); g.arc(lx(i), cy, 34, 0, Math.PI * 2);
      if (i === lit) { g.fillStyle = "rgb(255,200,40)"; g.fill(); } g.strokeStyle = "#bbbbbb"; g.lineWidth = 3; g.stroke();
      txt(g, HKEYS[i].toUpperCase(), lx(i), cy + 70, 26, "#7b7890", SAIRA, "600"); } };
    const data = [];
    for (let b = 0; b < NS.length; b++) {
      const n = NS[b], act = ACT[n], keys = act.map(i => HKEYS[i]), buttons = act.map(i => [HKEYS[i], HKEYS[i].toUpperCase()]);
      await interlude(ctx, `${n} lamp${n > 1 ? "s" : ""}`, n === 1 ? "One lamp: press F the moment it lights. Don't jump the gun." : `${n} lamps: press the key under whichever one lights up.`);
      ctx.say(n === 1 ? "Press F as soon as the lamp lights." : "Press the key under the lamp that lights.");
      for (let i = 0; i < per + 2; i++) {
        ctx.status(`${n} LAMP${n > 1 ? "S" : ""}  ·  ${i + 1} / ${per + 2}`);
        lamps(n); const fp = 500 + Math.random() * 800;
        const early = await ctx.key(keys, { buttons, timeout: fp, quiet: true });
        if (early.key) { await oops(ctx, "TOO SOON"); i--; continue; }
        const lit = rnd(act); lamps(n, lit);
        const r = await ctx.key(keys, { buttons, timeout: 2500, quiet: true }), ok = r.key === HKEYS[lit];
        data.push({ block: b + 1, n, bits: Math.log2(n), lit, said: r.key, ok, rt: r.rt, warm: i < 2 });
        if (!r.key) await oops(ctx, "TOO SLOW"); else if (!ok) await oops(ctx, "WRONG");
        else if (r.rt < 100) await oops(ctx, "TOO SOON");
        lamps(n); await ctx.wait(350);
      }
    }
    const U = [1, 2, 4, 8], cell = (n) => data.filter(d => d.n === n && !d.warm && okRT(d, 100, 2000)).map(d => d.rt);
    const pts = U.map(n => [Math.log2(n), mean(cell(n)), sem(cell(n))]).filter(p => isFinite(p[1]));
    const fit = pts.length > 1 ? linFit(pts.map(p => p[0]), pts.map(p => p[1])) : { m: NaN, c: NaN };
    const err = 1 - data.filter(d => d.ok).length / data.length;
    plotF(ctx, { title: "CHOICE RT VS INFORMATION", x: { lo: -.3, hi: 3.3, label: "BITS  LOG2 CHOICES", ticks: [0, 1, 2, 3] }, y: { label: "MEAN RT MS", ...rtAxis(pts.map(p => p[1])) },
      series: [{ name: "YOU", cls: "sA", pts, curve: isFinite(fit.m) ? (x) => fit.c + fit.m * x : null }],
      notes: [[`SLOPE ${isFinite(fit.m) ? fit.m.toFixed(0) : "-"} MS PER BIT`, "sA"], [isFinite(fit.m) && fit.m > 5 ? `ABOUT ${(1000 / fit.m).toFixed(1)} BITS PER SECOND` : "", "sW"], [`ERRORS ${pct(err)}`, "sM"]] });
    ctx.say(!isFinite(fit.m) ? "Not enough correct trials to fit a line. Try again." : fit.m > 20 ?
      `Each doubling of the choices added about ${fit.m.toFixed(0)} ms: a straight line against bits, Hick's law. Hick read it as a channel taking in information at a fixed rate; yours is about ${(1000 / fit.m).toFixed(1)} bits a second.`
      : `Only ${fit.m.toFixed(0)} ms per doubling this time, almost flat. Hick found reaction time climbing steadily with each bit; respond as soon as the lamp lights, and try again.`);
    ctx.status("");
    ctx.csv("hick.csv", ["trial", "block", "n_choices", "bits", "lamp", "response", "correct", "warmup", "rt_ms"],
      data.map((d, i) => [i + 1, d.block, d.n, d.bits, d.lit + 1, d.said ?? "", d.ok ? 1 : 0, d.warm ? 1 : 0, d.rt]));
  } };

/* ---------------- Fitts (1954): reciprocal tapping ---------------- */
export const FITTS = { id: "fitts", group: "ACTION", tag: "FITTS 1954", title: "Fitts's law",
  sub: "Tap back and forth between two bars. Further and narrower takes longer, by a simple rule.",
  blurb: "Two bars; tap the lit one, then the other, back and forth, as fast as you can while staying on target. The bars change distance (A) and width (W) between runs. Movement time rises in a straight line with the index of difficulty, log2(2A/W), whatever the screen size, because only the ratio matters. Mouse, trackpad or finger all work.",
  ref: "Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. Journal of Experimental Psychology, 47(6), 381–391.",
  instructions: { lines: ["Two bars appear. Tap (or click) the lit one, then the other one, back and forth.", "Go as fast as you can while still landing inside the bars. A few misses are fine.", "Each run is 16 taps. The bars change size and distance between runs."],
    keys: [["TAP", "THE LIT BAR"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  5 SIZES × 2 RUNS", "FULL  9 SIZES × 2 RUNS");
    const { g, cx, cy } = ctx, TAPS = 16, HH = 150;
    const conds = q ? [[240, 120], [480, 90], [480, 45], [720, 45], [720, 22]] : [240, 480, 720].flatMap(A => [22, 45, 90].map(Wd => [A, Wd]));
    let runs = shuffle([...conds, ...conds]);
    const data = [];
    const draw = (A, Wd, next, mark) => { ctx.clear(0);
      for (const s of [-1, 1]) { const x = cx + s * A / 2 - Wd / 2;
        if (s === next) { g.fillStyle = "rgba(0,227,154,.35)"; g.fillRect(x, cy - HH, Wd, 2 * HH); }
        g.strokeStyle = s === next ? "rgb(0,227,154)" : "#888888"; g.lineWidth = 2; g.strokeRect(x, cy - HH, Wd, 2 * HH); }
      if (mark) { g.fillStyle = mark.hit ? "#ffffff" : "#ff5a5a"; g.beginPath(); g.arc(mark.x, mark.y, 4, 0, Math.PI * 2); g.fill(); } };
    for (let r = 0; r < runs.length; r++) {
      const [A, Wd] = runs[r], ID = Math.log2(2 * A / Wd);
      ctx.status(`RUN ${r + 1} / ${runs.length}  ·  ID ${ID.toFixed(1)} BITS`);
      ctx.say("Tap the lit LEFT bar to start the run.");
      draw(A, Wd, -1);
      for (;;) { const c = await ctx.click(); if (c.x !== null && Math.abs(c.x - (cx - A / 2)) <= Wd / 2 + 6) break; }
      ctx.say("Back and forth, as fast as you can while staying on the bars.");
      let side = 1, last = performance.now(); draw(A, Wd, side);
      for (let k = 0; k < TAPS; k++) {
        const c = await ctx.click(), now = performance.now(), tx = cx + side * A / 2;
        if (c.x === null) { k--; continue; }
        const hit = Math.abs(c.x - tx) <= Wd / 2;
        data.push({ run: r + 1, A, W: Wd, ID, tap: k + 1, mt: now - last, hit, dx: (c.x - tx) * side });
        last = now; side = -side; draw(A, Wd, side, { x: c.x, y: c.y, hit });
      }
      window.SFX && window.SFX.play("chime");
      ctx.clear(0); txt(g, "RUN DONE", cx, cy, 36, "#e9e6ff", SAIRA, "600"); await ctx.wait(700);
    }
    // per condition: mean movement time of the taps after the first two of each run; errors are taps outside the bar
    const per = conds.map(c => { const d = data.filter(x => x.A === c[0] && x.W === c[1] && x.tap > 2);
      return { A: c[0], W: c[1], ID: Math.log2(2 * c[0] / c[1]), mt: mean(d.map(x => x.mt)), se: sem(d.map(x => x.mt)), err: 1 - d.filter(x => x.hit).length / d.length }; }).filter(p => isFinite(p.mt));
    const fit = per.length > 1 ? linFit(per.map(p => p.ID), per.map(p => p.mt)) : { m: NaN, c: NaN };
    const my = mean(per.map(p => p.mt)), ssT = per.reduce((s, p) => s + (p.mt - my) ** 2, 0), ssE = per.reduce((s, p) => s + (p.mt - (fit.c + fit.m * p.ID)) ** 2, 0), r2 = 1 - ssE / ssT;
    const errAll = 1 - data.filter(d => d.tap > 2 && d.hit).length / data.filter(d => d.tap > 2).length;
    plotF(ctx, { title: "MOVEMENT TIME VS DIFFICULTY", x: { lo: 1.5, hi: 6.5, label: "INDEX OF DIFFICULTY  LOG2(2A/W) BITS", ticks: [2, 3, 4, 5, 6] }, y: { label: "MOVEMENT TIME MS", ...rtAxis(per.map(p => p.mt)) },
      series: [{ name: "YOU", cls: "sG", pts: per.map(p => [p.ID, p.mt, p.se]), curve: isFinite(fit.m) ? (x) => fit.c + fit.m * x : null }],
      notes: [[`SLOPE ${isFinite(fit.m) ? fit.m.toFixed(0) : "-"} MS PER BIT`, "sG"], [`INTERCEPT ${isFinite(fit.c) ? fit.c.toFixed(0) : "-"} MS`, "sW"], [`R2 ${isFinite(r2) ? r2.toFixed(2) : "-"}`, "sW"],
        [isFinite(fit.m) && fit.m > 5 ? `ABOUT ${(1000 / fit.m).toFixed(1)} BITS PER SECOND` : "", "sW"], [`MISSES ${pct(errAll)}`, "sM"]] });
    ctx.say(!isFinite(fit.m) ? "Not enough taps to fit a line. Try again." : fit.m > 20 ?
      `Each bit of difficulty (twice the distance, or half the width) added ${fit.m.toFixed(0)} ms a tap${isFinite(r2) ? `; the line explains ${(r2 * 100).toFixed(0)}% of it` : ""}. Fitts's law. His stylus tappers managed about 10 bits a second; you, ${(1000 / fit.m).toFixed(1)}.`
      : `Movement time barely changed with difficulty (${fit.m.toFixed(0)} ms per bit). Fitts found it rising in a straight line; go as fast as you can while staying on the bars.`);
    ctx.status("");
    ctx.csv("fitts.csv", ["run", "tap", "amplitude_px", "width_px", "id_bits", "movement_time_ms", "hit", "endpoint_error_px"],
      data.map(d => [d.run, d.tap, d.A, d.W, d.ID, d.mt, d.hit ? 1 : 0, d.dx]));
  } };

export const LIB_ATTENTION = [STROOP, FLANKER, BLINK, MOT, IOR, NAVON, SIMON, SWITCH, HICK, FITTS];
