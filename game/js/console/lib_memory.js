// MEMORY and LEARNING: nine classic experiments on brief, short-term and long-term memory, and on learning
// without trying, each the simplest faithful version that runs on an uncalibrated screen.
//   Sperling (1960)                     partial vs whole report: iconic memory and its decay
//   Luck & Vogel (1997)                 change detection: visual working memory capacity, Cowan's K
//   Sternberg (1966)                    memory scanning: RT grows linearly with memory set size
//   Murdock (1962)                      free recall: the serial position curve (primacy and recency)
//   Corsi (1972) / Milner (1971)        block tapping: spatial span
//   Rensink, O'Regan & Clark (1997)     change blindness: the flicker paradigm
//   Roediger & McDermott (1995)         DRM: false recognition of a word never shown
//   Nissen & Bullemer (1987)            serial reaction time: implicit sequence learning
//   Chun & Jiang (1998)                 contextual cueing: repeated layouts are searched faster
// Every result is relative (a slope, a difference, a ratio, a capacity or a span), so screen size, viewing distance
// and gamma don't change the conclusion. Colours are categorical (red vs blue), never calibrated.
import { mean, median, sem, shuffle, linFit } from "./fit.js";

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const quick = (ctx, q, f) => ctx.choose("How long?", [["q", q], ["f", f]]).then(k => k === "q");
const SANS = "Helvetica, Arial, sans-serif", SAIRA = "'Saira Condensed', sans-serif";
const INK = "#e9e6ff", DIM = "#3a3842", MID = "#7b7890", GRN = "#00e39a", RED = "#ff5a5f", AMB = "#ffb547";
function text(g, s, x, y, size = 28, col = INK, { font = SAIRA, weight = 600, align = "center", base = "middle" } = {}) {
  g.font = `${weight} ${size}px ${font}`; g.fillStyle = col; g.textAlign = align; g.textBaseline = base; g.fillText(s, x, y); }
const pct = (v) => isFinite(v) ? `${Math.round(v * 100)}%` : "-";
const f0 = (v) => isFinite(v) ? v.toFixed(0) : "-";
const f1 = (v) => isFinite(v) ? v.toFixed(1) : "-";
const up = (v, step) => Math.ceil(v / step) * step, down = (v, step) => Math.floor(v / step) * step;
// a short sine tone (for Sperling's row cues); the BEGIN press has already unlocked audio
const audio = () => { try { const A = window.AudioContext || window.webkitAudioContext; return A ? new A() : null; } catch (e) { return null; } };
function tone(ac, f, ms = 100, vol = .16) {
  if (!ac) return; try { const o = ac.createOscillator(), gn = ac.createGain(), t = ac.currentTime, d = ms / 1000;
    o.frequency.value = f; o.connect(gn); gn.connect(ac.destination);
    gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + .006); gn.gain.setValueAtTime(vol, t + d - .012); gn.gain.linearRampToValueAtTime(0, t + d);
    o.start(t); o.stop(t + d + .02); } catch (e) { /* no sound is fine: the arrow is the cue too */ } }
// a big "press to go on" between blocks, on the canvas and as a button
async function pause(ctx, title, lines, label = "CONTINUE") {
  ctx.clear(0); text(ctx.g, title, ctx.cx, ctx.cy - 70, 46);
  lines.forEach((l, i) => text(ctx.g, l.toUpperCase(), ctx.cx, ctx.cy + i * 36, 26, MID, { weight: 500 }));
  ctx.say(lines.join(" "));
  await ctx.key([" ", "go", "Enter"], { buttons: [["go", label]] });
}

/* ---------------- Sperling (1960): partial vs whole report ---------------- */
const SP_ALPHA = "BCDFGHJKLMNPRSTX".split("");
export const SPERLING = { id: "sperling", group: "MEMORY", tag: "SPERLING 1960", title: "Partial report",
  sub: "You see more than you can say. A cue after the flash reveals how much, and how fast it fades.",
  blurb: "Twelve letters flash for 50 ms. In whole report you type every letter you can, which is usually about four. In partial report a tone and an arrow AFTER the flash pick one row. Three times your row score estimates how many letters were briefly available. That number falls back to the whole-report level as the cue comes later. Scores are corrected for guessing. The dark field after the flash matters: a bright, high-persistence screen lengthens the icon a little, but the drop with delay survives any display.",
  ref: "Sperling, G. (1960). The information available in brief visual presentations. Psychological Monographs: General and Applied, 74(11, Whole No. 498), 1–29.",
  instructions: { lines: ["Twelve letters, three rows of four, flash for a twentieth of a second. Keep your eyes on the centre dot.",
      "Block one: type every letter you saw, row by row. Block two: just after the flash, a tone and an arrow point at ONE row (high tone: top row, middle tone: middle, low tone: bottom). Type only that row.",
      "Type only letters you think you saw. Wrong letters count against you, so guessing doesn't help."],
    keys: [["LETTERS", "TYPE WHAT YOU SAW"], ["ENTER", "NEXT ROW, THEN DONE"], ["DEL", "DELETE A LETTER"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  6 WHOLE + 16 PARTIAL", "FULL  10 WHOLE + 40 PARTIAL");
    const DEL = q ? [0, 150, 300, 1000] : [0, 150, 300, 500, 1000], nWhole = q ? 6 : 10, reps = q ? 4 : 8;
    const { g, cx, cy } = ctx, X = [-1.5, -.5, .5, 1.5].map(i => cx + i * 80), Y = [-1, 0, 1].map(i => cy - 20 + i * 80), FREQ = [2500, 650, 250];
    // each row holds 4 of the 16 letters, so a pure guess is right 1 time in 4: subtract a third of a letter per wrong one
    const pG = 4 / SP_ALPHA.length, corr = pG / (1 - pG);
    const ac = audio(), data = []; if (ac && ac.resume) ac.resume().catch(() => {});
    const arrow = (r) => { g.strokeStyle = AMB; g.lineWidth = 5; g.beginPath(); const x = X[0] - 90, y = Y[r];
      g.moveTo(x - 46, y); g.lineTo(x, y); g.moveTo(x - 16, y - 14); g.lineTo(x, y); g.lineTo(x - 16, y + 14); g.stroke(); };
    const drawGrid = (ans, at, asked, cue) => {
      ctx.clear(0); if (cue !== null) arrow(cue);
      for (let r = 0; r < 3; r++) { const i = asked.indexOf(r);
        for (let c = 0; c < 4; c++) { const x = X[c], y = Y[r];
          if (i < 0) { g.strokeStyle = DIM; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.stroke(); continue; }
          g.strokeStyle = i === at ? INK : MID; g.lineWidth = i === at ? 2.5 : 1.5; g.strokeRect(x - 30, y - 32, 60, 64);
          if (ans[i][c]) text(g, ans[i][c], x, y + 2, 44, i === at ? INK : MID, { font: SANS, weight: "bold" }); } }
      text(g, cue === null ? `ROW ${at + 1} OF 3  ·  ENTER FOR THE NEXT ROW` : "THE CUED ROW  ·  ENTER WHEN DONE", cx, 40, 24, MID, { weight: 500 });
    };
    const typeRows = async (asked, cue) => {
      const ans = asked.map(() => []); let r = 0;
      const keys = [...SP_ALPHA.map(l => l.toLowerCase()), "Backspace", "Enter"];
      for (;;) {
        drawGrid(ans, r, asked, cue); const last = r === asked.length - 1;
        const buttons = [...SP_ALPHA.map(l => ["_" + l, l]), ["Backspace", "DEL"], ["Enter", last ? "DONE" : "NEXT ROW"]];
        const k = (await ctx.key(keys, { buttons })).key.replace(/^_/, "");
        if (k === "Enter") { if (last) return ans; r++; }
        else if (k === "Backspace") { if (ans[r].length) ans[r].pop(); else if (r > 0) { r--; ans[r].pop(); } }
        else { const L = k.toUpperCase(); if (ans[r].length < 4 && !ans[r].includes(L)) ans[r].push(L); if (ans[r].length === 4 && !last) r++; }
      }
    };
    const trial = async (cue, delay) => {
      const letters = shuffle(SP_ALPHA).slice(0, 12), rows = [0, 1, 2].map(r => letters.slice(r * 4, r * 4 + 4));
      ctx.clear(0); ctx.fix(INK, 3); await ctx.wait(700);
      ctx.clear(0); g.font = `bold 50px ${SANS}`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
      rows.forEach((row, r) => row.forEach((L, c) => g.fillText(L, X[c], Y[r])));
      await ctx.wait(50); ctx.clear(0);
      if (cue !== null) { await ctx.wait(delay); tone(ac, FREQ[cue], 100); arrow(cue); }
      const asked = cue === null ? [0, 1, 2] : [cue], ans = await typeRows(asked, cue);
      let hits = 0, errs = 0; asked.forEach((r, i) => { const h = ans[i].filter(L => rows[r].includes(L)).length; hits += h; errs += ans[i].length - h; });
      const score = hits - errs * corr;
      data.push({ mode: cue === null ? "whole" : "partial", delay: cue === null ? "" : delay, cue: cue === null ? "" : ["top", "middle", "bottom"][cue],
        letters: rows.map(r => r.join("")).join("/"), resp: ans.map(a => a.join("") || "-").join("/"), hits, errs, score, avail: cue === null ? score : score * 3 });
      ctx.clear(0); await ctx.wait(300);
    };
    try {
      ctx.say("Whole report: type every letter you saw, row by row. Leave a row short if you didn't see it.");
      for (let i = 0; i < nWhole; i++) { ctx.status(`WHOLE REPORT  ${i + 1} / ${nWhole}`); await trial(null, 0); }
      await pause(ctx, "PARTIAL REPORT", ["Now a tone and an arrow will pick ONE row after the flash.", "High tone: top. Middle tone: middle. Low tone: bottom. Type only that row."], "START");
      const tr = shuffle(DEL.flatMap(d => Array.from({ length: reps }, (_, i) => ({ d, cue: i % 3 }))));
      ctx.say("Partial report: type only the row the arrow points to.");
      for (let i = 0; i < tr.length; i++) { ctx.status(`PARTIAL REPORT  ${i + 1} / ${tr.length}`); await trial(tr[i].cue, tr[i].d); }
    } finally { if (ac) ac.close().catch(() => {}); }
    ctx.status("");
    const whole = mean(data.filter(d => d.mode === "whole").map(d => d.avail));
    const pts = DEL.map(d => { const a = data.filter(x => x.mode === "partial" && x.delay === d).map(x => x.avail); return [d, mean(a), sem(a)]; });
    const p0 = pts[0][1], pEnd = pts[pts.length - 1][1];
    ctx.plot({ title: "LETTERS AVAILABLE", x: { lo: -80, hi: 1080, label: "CUE DELAY  MS", ticks: DEL }, y: { lo: 0, hi: 12, label: "LETTERS OF 12", ticks: [0, 3, 6, 9, 12] },
      series: [{ name: "PARTIAL ×3", cls: "sG", pts, line: true }], hlines: [{ y: Math.max(0, whole), cls: "sA", label: "WHOLE REPORT" }],
      notes: [[`AT ONCE ${f1(p0)}`, "sG"], [`AT ${DEL[DEL.length - 1]} MS ${f1(pEnd)}`, "sG"], [`WHOLE REPORT ${f1(whole)}`, "sA"], ["SPERLING  ABOUT 9 VS 4.5", "sM"]] });
    ctx.say(!isFinite(p0) || !isFinite(whole) ? "Not enough trials to compare. Try again." : p0 > whole + .8
      ? `With the cue right after the flash, about ${f1(p0)} of the 12 letters were still available to you, against ${f1(whole)} in whole report. With a ${DEL[DEL.length - 1]} ms delay it was ${f1(pEnd)}. Sperling found about 9 available at once, falling to the whole-report level of about 4 to 5 within a second: a large, fast-fading visual store.`
      : `Partial report (${f1(p0)} letters) didn't beat whole report (${f1(whole)}) this time. Sperling found about 9 against 4 to 5. Keep your eyes on the dot, and try the full run.`);
    ctx.csv("sperling_partial_report.csv", ["trial", "mode", "cue_delay_ms", "cued_row", "letters", "response", "hits", "wrong", "guess_corrected", "letters_available"],
      data.map((d, i) => [i + 1, d.mode, d.delay, d.cue, d.letters, d.resp, d.hits, d.errs, d.score, d.avail]));
  } };

/* ---------------- Luck & Vogel (1997): visual working memory capacity ---------------- */
const LV_COL = ["#e8302a", "#2a5bff", "#a040ff", "#22c04a", "#f5e23a", "#000000", "#ffffff", "#20d8e8", "#ff8a1f"];
export const CHANGE = { id: "changedet", group: "MEMORY", tag: "LUCK & VOGEL 1997", title: "Visual working memory",
  sub: "How many coloured squares can you hold in mind at once? About four.",
  blurb: "Coloured squares flash for 100 ms. After almost a second, they come back with one of them ringed. Did the ringed square change colour? With two squares it's easy; with eight you're guessing on half of them. Cowan's K, the set size times (hits minus false alarms), estimates how many squares you really held. It levels off at three or four. Colours only need to be told apart, so the display doesn't need calibrating.",
  ref: ["Luck, S. J., & Vogel, E. K. (1997). The capacity of visual working memory for features and conjunctions. Nature, 390(6657), 279–281.",
    "Cowan, N. (2001). The magical number 4 in short-term memory: A reconsideration of mental storage capacity. Behavioral and Brain Sciences, 24(1), 87–114."],
  instructions: { lines: ["Keep your eyes on the centre. A set of coloured squares flashes, then disappears.", "After a moment the squares come back, with one of them ringed. Did the RINGED square change colour?", "Sometimes there are only a few squares, sometimes many. When you're not sure, guess."],
    keys: [["S", "SAME COLOUR"], ["D", "DIFFERENT COLOUR"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  4 SET SIZES × 12 TRIALS", "FULL  6 SET SIZES × 24 TRIALS");
    const NS = q ? [2, 4, 6, 8] : [1, 2, 3, 4, 6, 8], reps = q ? 12 : 24, { g, cx, cy } = ctx, sq = 34, minD = 82;
    const trials = shuffle(NS.flatMap(n => Array.from({ length: reps }, (_, i) => ({ n, change: i % 2 === 0 }))));
    const place = (n) => { for (let a = 0; a < 200; a++) { const pts = [];
        for (let t = 0; t < 4000 && pts.length < n; t++) { const x = cx + (Math.random() - .5) * 520, y = cy + (Math.random() - .5) * 380;
          if (Math.hypot(x - cx, y - cy) > 60 && pts.every(p => Math.hypot(p[0] - x, p[1] - y) > minD)) pts.push([x, y]); }
        if (pts.length === n) return pts; } return null; };
    const draw = (items, ring) => { ctx.clear(.5); ctx.fix("#000", 3);
      for (const it of items) { g.fillStyle = it.col; g.fillRect(it.x - sq / 2, it.y - sq / 2, sq, sq); }
      if (ring) { g.strokeStyle = "#000"; g.lineWidth = 2.5; g.strokeRect(ring.x - sq / 2 - 9, ring.y - sq / 2 - 9, sq + 18, sq + 18); } };
    const data = []; ctx.say("Did the ringed square change colour? S for same, D for different.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], cols = shuffle(LV_COL), pos = place(T.n), items = pos.map((p, k) => ({ x: p[0], y: p[1], col: cols[k] }));
      const pr = Math.floor(Math.random() * T.n), test = items.map(it => ({ ...it }));
      if (T.change) test[pr].col = cols[T.n + Math.floor(Math.random() * (cols.length - T.n))];     // a colour that wasn't in the display
      ctx.status(`TRIAL ${i + 1} / ${trials.length}  ·  ${T.n} SQUARE${T.n > 1 ? "S" : ""}`);
      ctx.clear(.5); ctx.fix("#000", 3); await ctx.wait(600);
      draw(items); await ctx.wait(100); ctx.clear(.5); ctx.fix("#000", 3); await ctx.wait(900);
      draw(test, test[pr]);
      const r = await ctx.key(["s", "d"], { buttons: [["s", "SAME"], ["d", "DIFFERENT"]] });
      data.push({ n: T.n, change: T.change, said: r.key === "d", rt: r.rt }); ctx.clear(.5); await ctx.wait(350);
    }
    ctx.status("");
    const stat = NS.map(n => { const d = data.filter(x => x.n === n), ch = d.filter(x => x.change), no = d.filter(x => !x.change);
      const H = ch.filter(x => x.said).length / ch.length, F = no.filter(x => x.said).length / no.length;
      return { n, H, F, K: n * (H - F), acc: d.filter(x => x.said === x.change).length / d.length }; });
    const big = stat.filter(s => s.n >= 4), Kmax = mean(big.map(s => s.K)), yHi = Math.max(5, up(Math.max(...stat.map(s => s.K)) + .5, 2));
    ctx.plot({ title: "VISUAL WORKING MEMORY", x: { lo: 0, hi: 9, label: "SET SIZE", ticks: NS }, y: { lo: 0, hi: yHi, label: "COWAN'S K", ticks: Array.from({ length: Math.floor(yHi / (yHi > 6 ? 2 : 1)) + 1 }, (_, i) => i * (yHi > 6 ? 2 : 1)) },
      series: [{ name: "YOUR K", cls: "sG", pts: stat.map(s => [s.n, s.K]), line: true }, { name: "PERFECT", cls: "sM", pts: [], curve: (x) => (x <= yHi ? x : NaN) }],
      hlines: [{ y: 4, cls: "sA", label: "ABOUT 4" }],
      notes: [[`CAPACITY ${f1(Kmax)}`, "sG"], ...stat.filter(s => s.n === Math.max(...NS) || s.n === Math.min(...NS)).map(s => [`${s.n} ITEMS  ${pct(s.acc)} RIGHT`, "sW"])] });
    ctx.say(!isFinite(Kmax) ? "Not enough trials. Try again." : `Your capacity levels off at about ${f1(Kmax)} squares: past that, more squares only add guesses. Luck and Vogel's observers held about 3 to 4 objects, the same "magical number 4" Cowan found across many tasks.`);
    ctx.csv("change_detection.csv", ["trial", "set_size", "change", "said_different", "rt_ms"], data.map((d, i) => [i + 1, d.n, d.change ? 1 : 0, d.said ? 1 : 0, d.rt]));
  } };

/* ---------------- Sternberg (1966): high-speed scanning in memory ---------------- */
export const STERNBERG = { id: "sternberg", group: "MEMORY", tag: "STERNBERG 1966", title: "Memory scanning",
  sub: "Was this digit in the list you just saw? Each extra item to search adds the same few milliseconds.",
  blurb: "A short list of digits appears one at a time; then a single probe digit. Was it in the list? Your reaction time climbs in a straight line with the length of the list, by about 38 ms per item in Sternberg's data, and at the same rate whether the answer is yes or no. That parallel says the search runs through the whole list, even after it finds a match.",
  ref: "Sternberg, S. (1966). High-speed scanning in human memory. Science, 153(3736), 652–654.",
  instructions: { lines: ["Between one and six digits appear one at a time. Remember them.", "Then a single digit appears in amber. Was it one of the digits in the list?", "Answer as fast as you can without making mistakes."],
    keys: [["J", "YES, IT WAS IN THE LIST"], ["F", "NO, IT WASN'T"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  4 LIST LENGTHS × 10", "FULL  6 LIST LENGTHS × 16");
    const NS = q ? [1, 2, 4, 6] : [1, 2, 3, 4, 5, 6], reps = q ? 10 : 16, on = q ? 650 : 1000, off = q ? 200 : 200, { g, cx, cy } = ctx;
    const trials = shuffle(NS.flatMap(n => Array.from({ length: reps }, (_, i) => ({ n, pos: i % 2 === 0 }))));
    const dig = (s, col) => { ctx.clear(0); text(g, s, cx, cy, 120, col, { font: SANS, weight: "bold" }); };
    const data = []; ctx.say("J if the amber digit was in the list, F if it wasn't.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], digits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]), set = digits.slice(0, T.n), probe = T.pos ? rnd(set) : rnd(digits.slice(T.n));
      ctx.status(`TRIAL ${i + 1} / ${trials.length}`);
      ctx.clear(0); ctx.fix(INK, 3); await ctx.wait(600);
      for (const d of set) { dig(String(d), INK); await ctx.wait(on); ctx.clear(0); await ctx.wait(off); }
      ctx.clear(0); ctx.fix(MID, 3); await ctx.wait(q ? 1000 : 1800);
      dig(String(probe), AMB);
      const r = await ctx.key(["j", "f"], { buttons: [["f", "NO"], ["j", "YES"]], quiet: true });
      const ok = (r.key === "j") === T.pos; data.push({ n: T.n, pos: T.pos, set: set.join(""), probe, ok, rt: r.rt });
      ctx.clear(0); if (!ok) text(g, "WRONG", cx, cy, 40, RED); await ctx.wait(ok ? 500 : 900);
    }
    ctx.status("");
    const good = (d) => d.ok && d.rt > 150 && d.rt < 3000;
    const ser = [[true, "YES", "sG"], [false, "NO", "sR"]].map(([pos, name, cls]) => ({ name, cls, line: true,
      pts: NS.map(n => { const rt = data.filter(d => d.n === n && d.pos === pos && good(d)).map(d => d.rt); return [n, mean(rt), sem(rt)]; }).filter(p => isFinite(p[1])) }));
    const all = NS.map(n => [n, mean(data.filter(d => d.n === n && good(d)).map(d => d.rt))]).filter(p => isFinite(p[1]));
    const fit = all.length > 1 ? linFit(all.map(p => p[0]), all.map(p => p[1])) : { m: NaN, c: NaN };
    const sy = ser.map(s => s.pts.length > 1 ? linFit(s.pts.map(p => p[0]), s.pts.map(p => p[1])).m : NaN);   // yes and no slopes: parallel = exhaustive
    const ys = ser.flatMap(s => s.pts.map(p => p[1])), yLo = Math.max(0, down(Math.min(...ys, 400) - 100, 100)), yHi = up(Math.max(...ys, 700) + 100, 100);
    const acc = data.filter(d => d.ok).length / data.length;
    ctx.plot({ title: "MEMORY SCANNING", x: { lo: 0, hi: 7, label: "LIST LENGTH", ticks: NS }, y: { lo: yLo, hi: yHi, label: "MEAN RT MS", ticks: [yLo, Math.round((yLo + yHi) / 200) * 100, yHi] },
      series: [...ser, ...(isFinite(fit.m) ? [{ name: "FIT", cls: "sA", pts: [], curve: (x) => fit.c + fit.m * x }] : [])],
      notes: [[`SLOPE ${f0(fit.m)} MS / ITEM`, "sA"], [`YES ${f0(sy[0])}  NO ${f0(sy[1])}`, "sW"], [`INTERCEPT ${f0(fit.c)} MS`, "sW"], [`CORRECT ${pct(acc)}`, "sM"], ["STERNBERG 38 MS / ITEM", "sM"]] });
    ctx.say(!isFinite(fit.m) ? "Not enough correct trials to fit a line. Try again." : fit.m > 8
      ? `Each extra digit in memory cost you about ${f0(fit.m)} ms, on top of ${f0(fit.c)} ms for everything else. Sternberg found 38 ms per item, with yes and no lines rising in parallel: an exhaustive search through memory at roughly 25 to 30 items a second.`
      : `Your times barely grew with list length (${f0(fit.m)} ms per item). Sternberg found 38. Try the full run, and answer as fast as you can.`);
    ctx.csv("sternberg.csv", ["trial", "set_size", "memory_set", "probe", "positive", "correct", "rt_ms"], data.map((d, i) => [i + 1, d.n, d.set, d.probe, d.pos ? 1 : 0, d.ok ? 1 : 0, d.rt]));
  } };

/* ---------------- Murdock (1962): the serial position curve ---------------- */
const WORDS = ("APPLE BANJO BASKET BEACH BELL BOTTLE BRIDGE BRUSH BUCKET CABIN CAMEL CANDLE CANOE CARPET CASTLE CHAIN CHEESE CHERRY CHURCH CLOCK " +
  "CLOUD COIN COMET COTTON CRAYON CROWN DAISY DESK DIAMOND DOLPHIN DONKEY DRAGON DRUM EAGLE ENGINE FEATHER FENCE FLAG FOREST FORK FROG GARDEN " +
  "GHOST GIRAFFE GLOVE GOAT GRAPE GUITAR HAMMER HARBOR HELMET HONEY HORSE ISLAND JACKET JEWEL KETTLE KITTEN LADDER LAMP LEMON LIBRARY LION " +
  "LOBSTER MAGNET MAP MARBLE MIRROR MONKEY MOTOR NAPKIN NEEDLE NEST OCEAN ONION ORANGE OWL PAINT PALACE PARROT PEACH PENCIL PEPPER PIANO " +
  "PILLOW PIRATE PLANET POCKET POTATO PUPPET RABBIT RADIO RIBBON RIVER ROBOT ROCKET SADDLE SALAD SHELL SHOVEL SILVER SKATE SNAKE SOCK SPOON " +
  "STAMP STATUE STOVE SUGAR SWORD TABLE TEAPOT TIGER TOMATO TOWEL TRACTOR TRAIN TRUMPET TULIP TURTLE VALLEY VIOLIN WAGON WALLET WHALE WINDOW " +
  "WIZARD ZEBRA BARREL BLANKET BUTTON CACTUS COFFEE FOSSIL LANTERN MEADOW").split(" ");
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length]; }
// a typed word matches a list word if it's the same, a plural, or one typo away (for words of 4+ letters)
const sameWord = (typed, w) => typed === w || typed === w + "S" || typed + "S" === w || (w.length >= 4 && lev(typed, w) <= 1);
// free recall needs real typing: a text box over the screen (the phone's own keyboard comes up), ENTER after each word
async function recall(ctx, secs, draw) {
  const crt = ctx.canvas.parentNode, inp = document.createElement("input"), got = []; let tick = null;
  Object.assign(inp, { type: "text", autocomplete: "off", spellcheck: false, placeholder: "TYPE A WORD, THEN ENTER" });
  inp.setAttribute("autocorrect", "off"); inp.setAttribute("autocapitalize", "characters"); inp.setAttribute("enterkeyhint", "next");
  inp.style.cssText = "position:absolute;left:50%;bottom:7%;transform:translateX(-50%);width:46%;z-index:3;background:#000;color:var(--A);border:0;" +
    "border-bottom:.18cqw solid var(--A);font:600 2.3cqw 'Saira Condensed',sans-serif;text-transform:uppercase;text-align:center;outline:none;padding:.2cqw .5cqw;letter-spacing:.06em;border-radius:0";
  const take = () => { for (const w of inp.value.split(/[\s,;]+/)) { const W = w.toUpperCase().replace(/[^A-Z]/g, ""); if (W && !got.includes(W)) got.push(W); } inp.value = ""; draw(got); };
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); take(); } });
  crt.appendChild(inp);
  try {
    draw(got); setTimeout(() => inp.focus(), 30);
    const t0 = performance.now(); tick = setInterval(() => ctx.status(`RECALL  ${Math.max(0, Math.ceil(secs - (performance.now() - t0) / 1000))} S LEFT`), 250);
    await ctx.key(["done"], { buttons: [["done", "DONE"]], timeout: secs * 1000 });
    take(); return got;
  } finally { clearInterval(tick); inp.remove(); }
}
export const SERIAL = { id: "serialpos", group: "MEMORY", tag: "MURDOCK 1962", title: "Serial position",
  sub: "Read a list, then recall it in any order. The first and last words survive best.",
  blurb: "Fifteen words appear one at a time (Murdock read his aloud). As soon as the list ends, type every word you remember, in any order. Averaged over lists, recall traces a U: the first few words (primacy, from extra rehearsal) and the last few (recency, still in short-term memory) beat the middle.",
  ref: "Murdock, B. B., Jr. (1962). The serial position effect of free recall. Journal of Experimental Psychology, 64(5), 482–488.",
  instructions: { lines: ["Fifteen words appear one at a time. Read each one; don't say them out loud.", "As soon as the list ends, type every word you can remember, in any order. Press ENTER after each word.", "Press DONE when you can't remember any more. Then the next list starts."],
    keys: [["A–Z", "TYPE A WORD"], ["ENTER", "ADD IT"], ["DONE", "FINISH THE LIST"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  3 LISTS OF 15", "FULL  8 LISTS OF 15");
    const L = 15, nL = q ? 3 : 8, secs = 60, { g, cx, cy } = ctx, pool = shuffle(WORDS), data = [];
    for (let li = 0; li < nL; li++) {
      const list = pool.slice(li * L, li * L + L);
      await pause(ctx, `LIST ${li + 1} OF ${nL}`, ["Fifteen words, one at a time.", "When the list ends, type all the words you remember."], "SHOW THE LIST");
      ctx.say("Read each word. Recall starts as soon as the list ends.");
      ctx.clear(0); ctx.fix(INK, 3); await ctx.wait(800);
      for (let i = 0; i < L; i++) { ctx.status(`LIST ${li + 1} / ${nL}  ·  WORD ${i + 1} / ${L}`); ctx.clear(0); text(g, list[i], cx, cy, 72, INK); await ctx.wait(1100); ctx.clear(0); await ctx.wait(300); }
      ctx.say("Type every word you remember, in any order. ENTER after each. DONE when you're out.");
      const got = await recall(ctx, secs, (w) => { ctx.clear(0); text(g, `RECALL  ·  ${w.length} WORD${w.length === 1 ? "" : "S"}`, cx, 46, 26, MID, { weight: 500 });
        w.forEach((x, i) => text(g, x, 160 + (i % 4) * 213, 110 + Math.floor(i / 4) * 52, 34, AMB)); });
      const hit = list.map(() => 0), order = list.map(() => ""); let intr = 0;
      got.forEach((t, k) => { const j = list.findIndex((w, i) => !hit[i] && sameWord(t, w)); if (j >= 0) { hit[j] = 1; order[j] = k + 1; } else intr++; });
      list.forEach((w, i) => data.push({ list: li + 1, pos: i + 1, word: w, recalled: hit[i], out: order[i] }));
      data.push({ list: li + 1, pos: "", word: `intrusions:${intr}`, recalled: "", out: "" });
      ctx.clear(0); text(g, `${hit.reduce((a, b) => a + b, 0)} OF ${L} RECALLED`, cx, cy, 46, INK); await ctx.wait(1000);
    }
    ctx.status("");
    const rows = data.filter(d => d.pos !== ""), P = (i) => mean(rows.filter(d => d.pos === i).map(d => d.recalled));
    const pts = Array.from({ length: L }, (_, i) => [i + 1, P(i + 1)]), part = (a, b) => mean(pts.filter(p => p[0] >= a && p[0] <= b).map(p => p[1]));
    const prim = part(1, 3), midd = part(6, 10), rec = part(13, 15);
    ctx.plot({ title: "SERIAL POSITION CURVE", x: { lo: 0, hi: 16, label: "POSITION IN LIST", ticks: [1, 5, 10, 15] }, y: { lo: 0, hi: 1, label: "P(RECALLED)", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "YOU", cls: "sG", pts, line: true }],
      notes: [[`FIRST 3  ${pct(prim)}`, "sA"], [`MIDDLE  ${pct(midd)}`, "sW"], [`LAST 3  ${pct(rec)}`, "sB"], [`${nL} LIST${nL > 1 ? "S" : ""}`, "sM"]] });
    ctx.say(prim > midd && rec > midd ? `You recalled ${pct(prim)} of the first three words and ${pct(rec)} of the last three, but only ${pct(midd)} from the middle: Murdock's U. Primacy comes from the extra rehearsal early words get; recency from words still held in short-term memory when recall begins.`
      : rec > midd ? `Strong recency (${pct(rec)} of the last three against ${pct(midd)} in the middle), but little primacy this time. Murdock found both; primacy grows when you rehearse the first words as the list goes on.`
      : `No clear U this time (first ${pct(prim)}, middle ${pct(midd)}, last ${pct(rec)}). A few lists are noisy; the full run averages eight. Start recall with the last words you saw.`);
    ctx.csv("serial_position.csv", ["list", "position", "word", "recalled", "output_order"], data.map(d => [d.list, d.pos, d.word, d.recalled, d.out]));
  } };

/* ---------------- Corsi (1972) / Milner (1971): block-tapping span ---------------- */
const CORSI_XY = [[178, 150], [432, 104], [712, 132], [300, 268], [566, 238], [812, 290], [150, 402], [452, 424], [696, 400]];
export const CORSI = { id: "corsi", group: "MEMORY", tag: "CORSI 1972", title: "Corsi blocks",
  sub: "Watch blocks light up in order, then tap the same path. How long a path can you hold?",
  blurb: "Nine blocks are scattered on the screen. Some light up one after another; tap them in the same order. The paths get longer until you miss two of the same length. Your span is the longest path you got right: the spatial cousin of digit span, usually about five or six in adults, a little shorter than for digits. Milner introduced Corsi's board to show that right temporal-lobe damage hurts spatial memory.",
  ref: ["Corsi, P. M. (1972). Human memory and the medial temporal region of the brain (Doctoral dissertation). McGill University, Montreal.",
    "Milner, B. (1971). Interhemispheric differences in the localization of psychological processes in man. British Medical Bulletin, 27(3), 272–277."],
  instructions: { lines: ["Nine blue blocks are on the screen. A few of them light up, one after another.", "When the screen says GO, tap (or click) the same blocks in the same order.", "The paths get longer. The test stops when you miss both paths of the same length."],
    keys: [["TAP", "TOUCH OR CLICK A BLOCK"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  FORWARD ONLY", "FULL  FORWARD, THEN BACKWARD");
    const { g, cx } = ctx, S = 70, dirs = q ? ["forward"] : ["forward", "backward"], data = [];
    const board = (lit = -1, col = AMB, head = "") => { ctx.clear(0);
      CORSI_XY.forEach(([x, y], i) => { g.fillStyle = i === lit ? col : "#24328a"; g.fillRect(x - S / 2, y - S / 2, S, S);
        g.strokeStyle = i === lit ? col : "#5a6ad8"; g.lineWidth = 2; g.strokeRect(x - S / 2, y - S / 2, S, S); });
      if (head) text(g, head, cx, 40, 28, head === "GO" || head.startsWith("GO") ? GRN : MID); };
    const hitBlock = (p) => CORSI_XY.findIndex(([x, y]) => Math.abs(p.x - x) < S / 2 + 10 && Math.abs(p.y - y) < S / 2 + 10);
    const span = {};
    for (const dir of dirs) {
      if (dir === "backward") await pause(ctx, "BACKWARD", ["Now tap the blocks in the REVERSE order:", "the last block that lit first, the first one last."], "START");
      ctx.say(dir === "forward" ? "Watch the blocks light up. At GO, tap them in the same order." : "Watch. At GO, tap them in REVERSE order.");
      let n = 2; span[dir] = 0;
      for (; n <= 9; n++) {
        let right = 0;
        for (let t = 0; t < 2; t++) {
          const seq = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, n);
          ctx.status(`${dir.toUpperCase()}  ·  ${n} BLOCKS  ·  TRY ${t + 1} OF 2`);
          board(-1, AMB, "WATCH"); await ctx.wait(900);
          for (const b of seq) { board(b, AMB, "WATCH"); await ctx.wait(700); board(-1, AMB, "WATCH"); await ctx.wait(300); }
          board(-1, AMB, dir === "forward" ? "GO" : "GO  ·  IN REVERSE");
          const taps = [], t0 = performance.now();
          while (taps.length < n) { const c = await ctx.click(); const b = hitBlock(c); if (b < 0) continue; taps.push(b); board(b, GRN, `${taps.length} / ${n}`); }
          const want = dir === "forward" ? seq : seq.slice().reverse(), ok = want.every((b, i) => taps[i] === b);
          data.push({ dir, n, seq: seq.map(b => b + 1).join("-"), taps: taps.map(b => b + 1).join("-"), ok, ms: performance.now() - t0 });
          if (ok) right++;
          await ctx.wait(250); ctx.clear(0); text(g, ok ? "RIGHT" : "NOT QUITE", cx, ctx.cy, 48, ok ? GRN : RED); await ctx.wait(800);
        }
        if (right) span[dir] = n; else break;
      }
    }
    ctx.status("");
    const ser = [["forward", "FORWARD", "sG"], ["backward", "BACKWARD", "sA"]].filter(([d]) => dirs.includes(d)).map(([d, name, cls]) => ({ name, cls, line: true,
      pts: [2, 3, 4, 5, 6, 7, 8, 9].map(n => { const x = data.filter(r => r.dir === d && r.n === n); return [n, x.length ? x.filter(r => r.ok).length / x.length : NaN]; }).filter(p => isFinite(p[1])) }));
    const tot = (d) => span[d] * data.filter(r => r.dir === d && r.ok).length;      // Kessels et al. (2000) total score: span × trials right
    ctx.plot({ title: "CORSI SPAN", x: { lo: 1, hi: 10, label: "BLOCKS IN THE PATH", ticks: [2, 3, 4, 5, 6, 7, 8, 9] }, y: { lo: 0, hi: 1, label: "P(PATH RIGHT)", ticks: [0, .5, 1] },
      series: ser, vlines: [{ x: span.forward, cls: "sG", label: `SPAN ${span.forward}` }, ...(span.backward !== undefined ? [{ x: span.backward + .08, cls: "sA", label: `BACK ${span.backward}`, dy: 18 }] : [])],
      notes: [[`FORWARD SPAN ${span.forward}`, "sG"], ...(span.backward !== undefined ? [[`BACKWARD SPAN ${span.backward}`, "sA"]] : []), [`TOTAL SCORE ${tot("forward")}`, "sW"], ["ADULTS  ABOUT 5 TO 6", "sM"]] });
    ctx.say(`Your forward Corsi span is ${span.forward}${span.backward !== undefined ? ` and your backward span ${span.backward}` : ""}. Healthy adults usually reach about 5 or 6 blocks, a little short of the 6 or 7 digits they can repeat back: spatial and verbal span are separate stores.`);
    ctx.csv("corsi.csv", ["trial", "direction", "length", "sequence", "taps", "correct", "ms"], data.map((d, i) => [i + 1, d.dir, d.n, d.seq, d.taps, d.ok ? 1 : 0, d.ms]));
  } };

/* ---------------- Rensink, O'Regan & Clark (1997): change blindness ---------------- */
const CB_COL = ["#e8302a", "#2a5bff", "#f5e23a", "#22c04a", "#ffffff", "#111111", "#ff8a1f"];
function cbShape(g, s) {
  const { x, y, r } = s; g.fillStyle = s.col; g.beginPath();
  if (s.k === 0) g.arc(x, y, r, 0, Math.PI * 2);
  else if (s.k === 1) g.rect(x - r * .85, y - r * .85, r * 1.7, r * 1.7);
  else if (s.k === 2) { g.moveTo(x, y - r); g.lineTo(x + r, y + r * .8); g.lineTo(x - r, y + r * .8); g.closePath(); }
  else if (s.k === 3) { g.moveTo(x, y - r * 1.1); g.lineTo(x + r * .8, y); g.lineTo(x, y + r * 1.1); g.lineTo(x - r * .8, y); g.closePath(); }
  else g.rect(x - r * 1.2, y - r * .38, r * 2.4, r * .76);
  g.fill();
}
export const FLICKER = { id: "flicker", group: "MEMORY", tag: "RENSINK, O'REGAN & CLARK 1997", title: "Change blindness",
  sub: "Two versions of a scene alternate. A big change is easy to see, until a blank flash hides it.",
  blurb: "Two versions of a busy scene alternate, differing in one shape: its colour, its place, or whether it's there at all. Press when you see the change, then tap where it was. Without a gap the change pops out at once. Put an 80 ms blank between the two and the change's own flicker is drowned by the whole screen's, so you have to check shape after shape: it takes many alternations. Shapes and colours are just labels here, so any screen works.",
  ref: "Rensink, R. A., O'Regan, J. K., & Clark, J. J. (1997). To see or not to see: The need for attention to perceive changes in scenes. Psychological Science, 8(5), 368–373.",
  instructions: { lines: ["Two versions of a scene of shapes flash back and forth. One shape differs: its colour, its place, or whether it's there at all.", "Press SPACE (or FOUND IT) as soon as you see what changes. Then tap or click where it was.", "Some trials have a blank flash between the two pictures; some don't. If you can't find it, the trial ends after a while."],
    keys: [["SPACE", "I SEE THE CHANGE"], ["TAP", "WHERE IT WAS"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  12 SCENES", "FULL  24 SCENES");
    const n = q ? 6 : 12, TO = q ? 30000 : 40000, { g } = ctx, BG = .45;
    const trials = shuffle([...Array(n).fill(0).map(() => ({ blank: true })), ...Array(n).fill(0).map(() => ({ blank: false }))])
      .map((t, i) => ({ ...t, kind: ["colour", "presence", "location"][i % 3] }));
    const scene = () => { const C = 9, R = 5, cw = 100, rh = 96, cells = shuffle(Array.from({ length: C * R }, (_, i) => i)), used = cells.slice(0, 30), free = cells.slice(30);
      const at = (c) => ({ x: 30 + (c % C) * cw + cw / 2 + (Math.random() - .5) * 30, y: 30 + Math.floor(c / C) * rh + rh / 2 + (Math.random() - .5) * 26 });
      return { shapes: used.map(c => ({ ...at(c), cell: c, r: 17 + Math.random() * 11, k: Math.floor(Math.random() * 5), col: rnd(CB_COL) })), free, at, C }; };
    const paint = (shapes) => { ctx.clear(BG); for (const s of shapes) cbShape(g, s); };
    const data = []; ctx.say("SPACE as soon as you see what changes. Then tap where it was.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], sc = scene(), A = sc.shapes, j = Math.floor(Math.random() * A.length), B = A.map(s => ({ ...s }));
      let where = [A[j]];
      if (T.kind === "colour") B[j].col = rnd(CB_COL.filter(c => c !== A[j].col));
      else if (T.kind === "presence") B.splice(j, 1);
      else { const near = sc.free.filter(c => Math.abs((c % sc.C) - (A[j].cell % sc.C)) <= 2 && Math.abs(Math.floor(c / sc.C) - Math.floor(A[j].cell / sc.C)) <= 1);
        const c = rnd(near.length ? near : sc.free); Object.assign(B[j], sc.at(c)); where = [A[j], B[j]]; }
      ctx.status(`SCENE ${i + 1} / ${trials.length}  ·  ${T.blank ? "WITH BLANK" : "NO BLANK"}`);
      ctx.clear(BG); ctx.fix("#000", 3); await ctx.wait(700);
      // A 240 ms, blank 80, A' 240, blank 80 (Rensink's timing); without the blank each picture stays 320 ms, so a cycle is the same length
      const phases = T.blank ? [[A, 240], [null, 80], [B, 240], [null, 80]] : [[A, 320], [B, 320]], cyc = phases.reduce((s, p) => s + p[1], 0);
      let got = null, last = -1; const t0 = performance.now();
      ctx.key([" "], { buttons: [[" ", "FOUND IT"]], timeout: TO }).then(r => { got = r; }).catch(() => {});
      await ctx.loop(() => { if (got) return false;
        let t = (performance.now() - t0) % cyc, ph = 0; while (t >= phases[ph][1]) { t -= phases[ph][1]; ph++; }
        if (ph !== last) { last = ph; if (phases[ph][0]) paint(phases[ph][0]); else ctx.clear(BG); } });
      const found = got.key !== null, secs = got.rt / 1000;
      let ok = false;
      if (found) {
        paint(A); ctx.say("Where was the change? Tap or click on it.");
        const c = await ctx.click({ timeout: 20000 });
        ok = c.x !== null && where.some(s => Math.hypot(c.x - s.x, c.y - s.y) < s.r + 34);
      }
      data.push({ blank: T.blank, kind: T.kind, found, ok, secs, alts: got.rt / (cyc / 2) });
      // show the answer: the two pictures, no blank, the change ringed
      for (let k = 0; k < 4; k++) { paint(k % 2 ? B : A); g.strokeStyle = ok ? GRN : RED; g.lineWidth = 3;
        for (const s of where) { g.beginPath(); g.arc(s.x, s.y, s.r + 18, 0, Math.PI * 2); g.stroke(); } await ctx.wait(380); }
      ctx.say(ok ? `Found in ${secs.toFixed(1)} s.` : found ? "Not there: the ring shows the change." : "Time's up: the ring shows the change.");
      ctx.clear(BG); await ctx.wait(500); ctx.say("SPACE as soon as you see what changes. Then tap where it was.");
    }
    // a missed or mislocated change counts as taking the whole time (a censored trial), so medians stay honest
    ctx.status("");
    const tm = (b) => median(data.filter(d => d.blank === b).map(d => d.ok ? d.secs : TO / 1000));
    const hitR = (b) => { const d = data.filter(x => x.blank === b); return d.filter(x => x.ok).length / d.length; };
    const nb = tm(false), wb = tm(true), yHi = up(Math.max(nb, wb, 4) * 1.15, 2);
    ctx.plot({ title: "TIME TO SEE THE CHANGE", x: { lo: 0, hi: 3, label: "", ticks: [] }, y: { lo: 0, hi: yHi, label: "MEDIAN SECONDS", ticks: [0, yHi / 2, yHi] },
      series: [{ name: "NO BLANK", cls: "sG", pts: [[1, nb]] }, { name: "WITH BLANK", cls: "sR", pts: [[2, wb]] }],
      notes: [[`NO BLANK  ${f1(nb)} S  FOUND ${pct(hitR(false))}`, "sG"], [`BLANK  ${f1(wb)} S  FOUND ${pct(hitR(true))}`, "sR"], [isFinite(wb / nb) ? `${(wb / nb).toFixed(1)} × LONGER` : "", "sW"], ["MISSES COUNT AS FULL TIME", "sM"]] });
    ctx.say(wb > nb * 1.5 ? `Without the blank you saw the change in ${f1(nb)} s; with an 80 ms blank it took ${f1(wb)} s, ${(wb / nb).toFixed(1)} times longer. Rensink, O'Regan and Clark found the same: the change is huge, but unless attention lands on the right object, nothing in memory catches it.`
      : `The blank didn't slow you much this time (${f1(nb)} s against ${f1(wb)} s). Rensink and colleagues found it costs many alternations. Try the full run.`);
    ctx.csv("change_blindness.csv", ["trial", "blank", "change", "pressed", "located", "seconds", "alternations"], data.map((d, i) => [i + 1, d.blank ? 1 : 0, d.kind, d.found ? 1 : 0, d.ok ? 1 : 0, d.secs, d.alts]));
  } };

/* ---------------- Roediger & McDermott (1995): the DRM false memory ---------------- */
// Deese–Roediger–McDermott lists: 15 associates each, strongest first, keyed by the critical word that is never shown.
// SLEEP is as printed in R&M (1995); the others are adapted from the published DRM lists (Stadler, Roediger & McDermott,
// 1999), with one word swapped so that no word belongs to two lists.
const DRM = {
  SLEEP: "BED REST AWAKE TIRED DREAM WAKE NIGHT BLANKET DOZE SLUMBER SNORE PILLOW PEACE YAWN DROWSY",
  CHAIR: "TABLE SIT LEGS SEAT COUCH DESK RECLINER SOFA WOOD CUSHION SWIVEL STOOL SITTING ROCKING BENCH",
  SWEET: "SOUR CANDY SUGAR BITTER GOOD TASTE TOOTH NICE HONEY SODA CHOCOLATE HEART CAKE TART PIE",
  MOUNTAIN: "HILL VALLEY CLIMB SUMMIT TOP MOLEHILL PEAK PLAIN GLACIER GOAT BIKE CLIMBER RANGE STEEP SKI",
  NEEDLE: "THREAD PIN EYE SEWING SHARP POINT PRICK THIMBLE HAYSTACK THORN HURT INJECTION SYRINGE CLOTH KNITTING",
  ROUGH: "SMOOTH BUMPY ROAD TOUGH SANDPAPER JAGGED READY COARSE UNEVEN RIDERS RUGGED SAND BOARDS GROUND GRAVEL",
  COLD: "HOT SNOW WARM WINTER ICE WET FRIGID CHILLY HEAT WEATHER FREEZE AIR SHIVER ARCTIC FROST",
  SOFT: "HARD LIGHT PLUSH LOUD COTTON FUR TOUCH FLUFFY FEATHER FURRY DOWNY KITTEN SKIN TENDER SILK",
  DOCTOR: "NURSE SICK LAWYER MEDICINE HEALTH HOSPITAL DENTIST PHYSICIAN ILL PATIENT OFFICE STETHOSCOPE SURGEON CLINIC CURE",
  MUSIC: "NOTE SOUND PIANO SING RADIO BAND MELODY HORN CONCERT INSTRUMENT SYMPHONY JAZZ ORCHESTRA ART RHYTHM",
  RIVER: "WATER STREAM LAKE MISSISSIPPI BOAT TIDE SWIM FLOW RUN BARGE CREEK BROOK FISH BRIDGE WINDING",
  BREAD: "BUTTER FOOD EAT SANDWICH RYE JAM MILK FLOUR JELLY DOUGH CRUST SLICE WINE LOAF TOAST",
  WINDOW: "DOOR GLASS PANE SHADE LEDGE SILL HOUSE OPEN CURTAIN FRAME VIEW BREEZE SASH SCREEN SHUTTER",
  SPIDER: "WEB INSECT BUG FRIGHT FLY ARACHNID CRAWL TARANTULA POISON BITE CREEPY ANIMAL UGLY FEELERS SMALL",
  KING: "QUEEN ENGLAND CROWN PRINCE GEORGE DICTATOR PALACE THRONE CHESS RULE SUBJECTS MONARCH ROYAL LEADER REIGN",
  SMELL: "NOSE BREATHE SNIFF AROMA HEAR SEE NOSTRIL WHIFF SCENT REEK STENCH FRAGRANCE PERFUME SALTS ROSE",
  FRUIT: "APPLE VEGETABLE ORANGE KIWI CITRUS RIPE PEAR BANANA BERRY CHERRY BASKET JUICE SALAD BOWL COCKTAIL",
  MAN: "WOMAN HUSBAND UNCLE LADY MOUSE MALE FATHER STRONG FRIEND BEARD PERSON HANDSOME MUSCLE SUIT OLD",
};
export const DRMFALSE = { id: "drm", group: "MEMORY", tag: "ROEDIGER & MCDERMOTT 1995", title: "False memory",
  sub: "Study lists of related words. Then 'remember' a word you never saw.",
  blurb: "You read lists of words, each made of associates of one word that is never shown: bed, rest, tired, dream… but never SLEEP. In the test you say OLD or NEW. People call those critical words OLD about as often as words they really saw, and far more often than unrelated new words. Memory rebuilds the gist; it doesn't replay a recording.",
  ref: "Roediger, H. L., III, & McDermott, K. B. (1995). Creating false memories: Remembering words not presented in lists. Journal of Experimental Psychology: Learning, Memory, and Cognition, 21(4), 803–814.",
  instructions: { lines: ["You'll read several lists of words, one word at a time. Try to remember them all; there will be a test.", "In the test, words appear one at a time. Say OLD if the word was in one of the lists, NEW if it wasn't.", "Some test words were in the lists and some weren't. Go with your memory."],
    keys: [["O", "OLD: IT WAS IN A LIST"], ["N", "NEW: IT WASN'T"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  6 LISTS OF 12", "FULL  10 LISTS OF 15");
    const nStudy = q ? 6 : 10, nNew = q ? 4 : 6, len = q ? 12 : 15, rk = !q, { g, cx, cy } = ctx;
    const keys = shuffle(Object.keys(DRM)), studied = keys.slice(0, nStudy), unstudied = keys.slice(nStudy, nStudy + nNew), W = (k) => DRM[k].split(" ");
    for (let li = 0; li < studied.length; li++) {
      ctx.status(`STUDY  ·  LIST ${li + 1} / ${studied.length}`); ctx.say("Read and remember each word.");
      ctx.clear(0); text(g, `LIST ${li + 1} OF ${studied.length}`, cx, cy, 40, MID); await ctx.wait(1200); ctx.clear(0); await ctx.wait(400);
      for (const w of W(studied[li]).slice(0, len)) { ctx.clear(0); text(g, w, cx, cy, 68, INK); await ctx.wait(1100); ctx.clear(0); await ctx.wait(250); }
    }
    await pause(ctx, "THE TEST", ["Words appear one at a time. OLD if it was in any list, NEW if not."], "START THE TEST");
    // R&M tested serial positions 1, 8 and 10 of each list, plus its critical word
    const items = [...studied.flatMap(k => [...[0, 7, 9].map(i => ({ w: W(k)[i], type: "studied" })), { w: k, type: "critical" }]),
      ...unstudied.flatMap(k => [...[0, 7, 9].map(i => ({ w: W(k)[i], type: "new" })), { w: k, type: "newcritical" }])];
    const test = shuffle(items), data = []; ctx.say("OLD if the word was in one of the lists, NEW if it wasn't.");
    for (let i = 0; i < test.length; i++) {
      const T = test[i]; ctx.status(`TEST  ${i + 1} / ${test.length}`);
      ctx.clear(0); await ctx.wait(350); text(g, T.w, cx, cy, 68, AMB);
      const r = await ctx.key(["o", "n"], { buttons: [["o", "OLD"], ["n", "NEW"]] });
      let rem = "";
      if (rk && r.key === "o") rem = await ctx.choose("Do you REMEMBER seeing it (you can recall the moment), or do you just KNOW it was there?", [["r", "REMEMBER"], ["k", "JUST KNOW"]]);
      data.push({ ...T, old: r.key === "o", rem, rt: r.rt });
      ctx.say("OLD if the word was in one of the lists, NEW if it wasn't.");
    }
    ctx.status("");
    const P = (t) => { const d = data.filter(x => x.type === t); return d.filter(x => x.old).length / d.length; };
    const C = [["studied", "STUDIED WORDS", "sG"], ["critical", "CRITICAL LURES", "sR"], ["new", "UNRELATED NEW", "sB"], ["newcritical", "UNSTUDIED LURES", "sM"]];
    const v = Object.fromEntries(C.map(([t]) => [t, P(t)]));
    const remC = data.filter(x => x.type === "critical" && x.old), remFrac = remC.length ? remC.filter(x => x.rem === "r").length / remC.length : NaN;
    ctx.plot({ title: "SAID 'OLD'", x: { lo: 0, hi: 5, label: "", ticks: [] }, y: { lo: 0, hi: 1, label: "P('OLD')", ticks: [0, .25, .5, .75, 1] },
      series: C.map(([t, name, cls], i) => ({ name, cls, pts: [[i + 1, v[t]]] })),
      notes: [[`STUDIED ${pct(v.studied)}  LURES ${pct(v.critical)}`, "sR"], [`UNRELATED ${pct(v.new)}`, "sB"], ...(rk && isFinite(remFrac) ? [[`LURES 'REMEMBERED' ${pct(remFrac)}`, "sA"]] : []), ["R&M  HITS .65  LURES AS HIGH  NEW .11", "sM"]] });
    ctx.say(v.critical > v.new + .15 ? `You said OLD to ${pct(v.critical)} of the critical words you never saw, against ${pct(v.studied)} of the words you did see and ${pct(v.new)} of unrelated new words.${rk && isFinite(remFrac) ? ` You even "remembered" seeing ${pct(remFrac)} of them.` : ""} Roediger and McDermott found false recognition of the critical word nearly as high as the hit rate (about .65) and unrelated false alarms near .11: you stored the gist, then rebuilt the list from it.`
      : `You weren't fooled much this time: ${pct(v.critical)} for the critical words against ${pct(v.studied)} for studied words. Roediger and McDermott's participants falsely recognised the critical word almost as often as real list words.`);
    ctx.csv("drm_false_memory.csv", ["trial", "word", "type", "said_old", "remember_know", "rt_ms"], data.map((d, i) => [i + 1, d.w, d.type, d.old ? 1 : 0, d.rem, d.rt]));
  } };

/* ---------------- Nissen & Bullemer (1987): serial reaction time ---------------- */
const NB_SEQ = [3, 1, 2, 0, 2, 1, 3, 2, 1, 0];      // D B C A C B D C B A, positions left to right A–D
export const SRT = { id: "srt", group: "LEARNING", tag: "NISSEN & BULLEMER 1987", title: "Sequence learning",
  sub: "Press the key under the light. Your fingers learn a hidden pattern your mind may never notice.",
  blurb: "A dot lights up in one of four boxes; press the key under it as fast as you can. Secretly, the dots follow a 10-step sequence that repeats. Responses speed up across blocks, and when the sequence is quietly swapped for random positions, they slow down again. That cost is what the sequence taught your hands, measured whether or not you noticed the pattern.",
  ref: "Nissen, M. J., & Bullemer, P. (1987). Attentional requirements of learning: Evidence from performance measures. Cognitive Psychology, 19(1), 1–32.",
  instructions: { lines: ["Four boxes sit in a row. A dot appears in one of them.", "Press the key for that box as fast as you can: D, F, J or K from left to right (or tap the buttons). The next dot follows right away.", "Rest your fingers on D F J K and keep going. There are short breaks between blocks."],
    keys: [["D", "LEFT BOX"], ["F", "SECOND BOX"], ["J", "THIRD BOX"], ["K", "RIGHT BOX"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  5 BLOCKS OF 50", "FULL  8 BLOCKS OF 100");
    const plan = q ? ["S", "S", "S", "R", "S"] : ["S", "S", "S", "S", "S", "S", "R", "S"], per = q ? 50 : 100, RSI = q ? 350 : 500, { g, cx, cy } = ctx;
    const K = ["d", "f", "j", "k"], BX = [-1.5, -.5, .5, 1.5].map(i => cx + i * 170);
    const draw = (lit) => { ctx.clear(0);
      BX.forEach((x, i) => { g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(x - 50, cy - 50, 100, 100); text(g, K[i].toUpperCase(), x, cy + 90, 26, MID, { weight: 500 });
        if (i === lit) { g.fillStyle = AMB; g.beginPath(); g.arc(x, cy, 26, 0, Math.PI * 2); g.fill(); } }); };
    const rand = (n) => { const o = []; let p = -1; while (o.length < n) { const v = Math.floor(Math.random() * 4); if (v !== p) { o.push(v); p = v; } } return o; };
    const data = [];
    for (let b = 0; b < plan.length; b++) {
      if (b) await pause(ctx, `BLOCK ${b + 1} OF ${plan.length}`, ["A short break. Fingers on D F J K."], "GO");
      const start = Math.floor(Math.random() * 10), seq = plan[b] === "S" ? Array.from({ length: per }, (_, i) => NB_SEQ[(start + i) % 10]) : rand(per);
      ctx.say("Press the key under the dot, as fast as you can."); draw(-1); await ctx.wait(800);
      for (let i = 0; i < per; i++) {
        ctx.status(`BLOCK ${b + 1} / ${plan.length}  ·  ${i + 1} / ${per}`);
        draw(seq[i]); const r = await ctx.key(K, { buttons: K.map((k, j) => [k, ["LEFT", "2ND", "3RD", "RIGHT"][j]]), quiet: true });
        const ok = r.key === K[seq[i]];
        if (!ok) { text(g, "×", BX[K.indexOf(r.key)], cy - 80, 40, RED); for (;;) { const r2 = await ctx.key(K, { buttons: K.map((k, j) => [k, ["LEFT", "2ND", "3RD", "RIGHT"][j]]), quiet: true }); if (r2.key === K[seq[i]]) break; } }
        data.push({ block: b + 1, kind: plan[b], pos: seq[i], ok, rt: r.rt });
        draw(-1); await ctx.wait(RSI);
      }
    }
    ctx.status("");
    const aware = await ctx.choose("One question: did the dots follow a repeating pattern?", [["y", "YES"], ["n", "NO"], ["u", "NOT SURE"]]);
    const bm = plan.map((k, b) => [b + 1, median(data.filter(d => d.block === b + 1 && d.ok && d.rt > 100 && d.rt < 2000).map(d => d.rt)), k]);
    const rb = plan.indexOf("R"), cost = bm[rb][1] - mean([bm[rb - 1][1], bm[rb + 1][1]]);
    const ys = bm.map(p => p[1]).filter(isFinite), yLo = Math.max(0, down(Math.min(...ys) - 60, 50)), yHi = up(Math.max(...ys) + 60, 50);
    const err = data.filter(d => !d.ok).length / data.length;
    ctx.plot({ title: "SERIAL REACTION TIME", x: { lo: 0, hi: plan.length + 1, label: "BLOCK", ticks: plan.map((_, i) => i + 1) }, y: { lo: yLo, hi: yHi, label: "MEDIAN RT MS", ticks: [yLo, Math.round((yLo + yHi) / 100) * 50, yHi] },
      series: [{ name: "SEQUENCE", cls: "sG", line: true, pts: bm.filter(p => p[2] === "S").map(p => [p[0], p[1]]) }, { name: "RANDOM", cls: "sR", pts: [[bm[rb][0], bm[rb][1]]] }],
      notes: [[`RANDOM COST ${f0(cost)} MS`, "sR"], [`FIRST TO LAST SEQ ${f0(bm[0][1] - bm[rb - 1][1])} MS`, "sG"], [`ERRORS ${pct(err)}`, "sM"], [`NOTICED: ${{ y: "YES", n: "NO", u: "NOT SURE" }[aware]}`, "sW"]] });
    ctx.say(!isFinite(cost) ? "Not enough correct responses to compare blocks. Try again." : cost > 15
      ? `When the dots quietly turned random in block ${rb + 1} you slowed by ${f0(cost)} ms, then sped up again when the sequence came back. That's what the 10-step pattern had taught your hands${aware === "y" ? "" : ", even though you didn't report noticing it"}. Nissen and Bullemer found the same learning, and showed it fails when attention is split by a second task.`
      : `Only ${f0(cost)} ms slower on the random block. Nissen and Bullemer's sequence effect grows with practice: try the full run.`);
    ctx.csv("serial_reaction_time.csv", ["trial", "block", "block_type", "position", "correct_first", "rt_ms", "noticed"], data.map((d, i) => [i + 1, d.block, d.kind === "S" ? "sequence" : "random", d.pos + 1, d.ok ? 1 : 0, d.rt, aware]));
  } };

/* ---------------- Chun & Jiang (1998): contextual cueing ---------------- */
export const CUEING = { id: "ctxcue", group: "LEARNING", tag: "CHUN & JIANG 1998", title: "Contextual cueing",
  sub: "Find the T among Ls. Some layouts repeat, and you get faster on those without knowing which.",
  blurb: "Find the rotated T among rotated Ls and say which way its stem points. Half the displays are new every time; the other half are the same few layouts, repeated (the T in the same place, though its direction changes). Over blocks, the repeated layouts are searched faster: the layout cues where to look. People typically can't tell repeated layouts from new ones afterwards, so the learning is implicit.",
  ref: "Chun, M. M., & Jiang, Y. (1998). Contextual cueing: Implicit learning and memory of visual context guides spatial attention. Cognitive Psychology, 36(1), 28–71.",
  instructions: { lines: ["Each screen has one T among many Ls. The T lies on its side: its stem points left or right.", "Find the T and press F if its stem points LEFT, J if it points RIGHT. As fast as you can without mistakes."],
    keys: [["F", "STEM POINTS LEFT"], ["J", "STEM POINTS RIGHT"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  10 BLOCKS OF 12", "FULL  20 BLOCKS OF 24 + MEMORY TEST");
    const NR = q ? 6 : 12, nB = q ? 10 : 20, perE = q ? 2 : 4, { g, cx, cy } = ctx, COLS = 8, ROWS = 6, cw = 92, rh = 78, s = 15, nItems = 12;
    const cellXY = (c) => [cx + (c % COLS - (COLS - 1) / 2) * cw, cy + 6 + (Math.floor(c / COLS) - (ROWS - 1) / 2) * rh];
    const cells = shuffle(Array.from({ length: COLS * ROWS }, (_, i) => i)), tOld = cells.slice(0, NR), tNew = cells.slice(NR, 2 * NR);
    const layout = (tc) => { const others = shuffle(Array.from({ length: COLS * ROWS }, (_, i) => i).filter(c => c !== tc)).slice(0, nItems - 1);
      const j = () => (Math.random() - .5) * 18;
      return { t: { c: tc, dx: j(), dy: j() }, d: others.map(c => ({ c, dx: j(), dy: j(), rot: Math.floor(Math.random() * 4) })) }; };
    const OLD = tOld.map(layout);
    const item = (x, y, T, rot) => { g.save(); g.translate(x, y); g.rotate(rot * Math.PI / 2); g.beginPath();
      if (T) { g.moveTo(-s, -s); g.lineTo(s, -s); g.moveTo(0, -s); g.lineTo(0, s); }
      else { g.moveTo(-s + 5, -s); g.lineTo(-s + 5, s); g.moveTo(-s, s); g.lineTo(s, s); }       // an L with its corner offset, so it looks T-ish
      g.stroke(); g.restore(); };
    const show = (L, tRot) => { ctx.clear(.3); g.strokeStyle = INK; g.lineWidth = 4; g.lineCap = "square";
      for (const d of L.d) { const [x, y] = cellXY(d.c); item(x + d.dx, y + d.dy, false, d.rot); }
      const [x, y] = cellXY(L.t.c); item(x + L.t.dx, y + L.t.dy, true, tRot); g.lineCap = "butt"; };
    const data = []; ctx.say("Find the T. F if its stem points left, J if right.");
    for (let b = 0; b < nB; b++) {
      if (b && b % perE === 0) await pause(ctx, `BLOCK ${b + 1} OF ${nB}`, ["A short break."], "GO");
      const newT = shuffle(tNew), tr = shuffle([...OLD.map((L, i) => ({ L, rep: true, id: i })), ...newT.map((c, i) => ({ L: layout(c), rep: false, id: i }))]);
      for (let i = 0; i < tr.length; i++) {
        const T = tr[i], left = Math.random() < .5;
        ctx.status(`BLOCK ${b + 1} / ${nB}  ·  ${i + 1} / ${tr.length}`);
        ctx.clear(.3); ctx.fix(INK, 4); await ctx.wait(450);
        show(T.L, left ? 1 : 3);       // a quarter turn clockwise puts the stem on the left
        const r = await ctx.key(["f", "j"], { buttons: [["f", "STEM LEFT"], ["j", "STEM RIGHT"]], quiet: true, timeout: 6000 });
        const ok = r.key !== null && (r.key === "f") === left;
        data.push({ block: b + 1, epoch: Math.floor(b / perE) + 1, rep: T.rep, id: T.id, tcell: T.L.t.c, ok, rt: r.rt });
        ctx.clear(.3); if (!ok) text(g, r.key === null ? "TOO SLOW" : "WRONG", cx, cy, 40, RED); await ctx.wait(ok ? 250 : 800);
      }
    }
    // the classic recognition test (full run): repeated layouts against new ones; implicit learning leaves it near chance
    let recog = null;
    if (!q) {
      await pause(ctx, "ONE LAST TEST", ["Some layouts appeared again and again. Did you see THIS layout before?", "Press Y for seen before, N for new."], "START");
      const it = shuffle([...OLD.map(L => ({ L, rep: true })), ...tNew.map(c => ({ L: layout(c), rep: false }))]); let hits = 0, fas = 0;
      for (const T of it) { show(T.L, Math.random() < .5 ? 1 : 3); const r = await ctx.key(["y", "n"], { buttons: [["y", "SEEN BEFORE"], ["n", "NEW"]] });
        if (r.key === "y") { if (T.rep) hits++; else fas++; } ctx.clear(.3); await ctx.wait(300); }
      recog = { H: hits / NR, F: fas / NR };
    }
    ctx.status("");
    const nE = nB / perE, rt = (rep, e) => median(data.filter(d => d.rep === rep && d.epoch === e && d.ok && d.rt > 150).map(d => d.rt));
    const ser = [[true, "REPEATED", "sG"], [false, "NEW", "sW"]].map(([rep, name, cls]) => ({ name, cls, line: true, pts: Array.from({ length: nE }, (_, e) => [e + 1, rt(rep, e + 1)]).filter(p => isFinite(p[1])) }));
    const late = Array.from({ length: nE }, (_, e) => e + 1).slice(-Math.max(2, Math.floor(nE / 2)));
    const effect = mean(late.map(e => rt(false, e) - rt(true, e))), first = rt(false, 1) - rt(true, 1);
    const ys = ser.flatMap(s => s.pts.map(p => p[1])), yLo = Math.max(0, down(Math.min(...ys) - 100, 100)), yHi = up(Math.max(...ys) + 100, 100);
    ctx.plot({ title: "CONTEXTUAL CUEING", x: { lo: .5, hi: nE + .5, label: "EPOCH", ticks: Array.from({ length: nE }, (_, e) => e + 1) }, y: { lo: yLo, hi: yHi, label: "MEDIAN RT MS", ticks: [yLo, Math.round((yLo + yHi) / 200) * 100, yHi] },
      series: ser, notes: [[`BENEFIT LATE ${f0(effect)} MS`, "sG"], [`BENEFIT EPOCH 1 ${f0(first)} MS`, "sW"], [`CORRECT ${pct(data.filter(d => d.ok).length / data.length)}`, "sM"],
        ...(recog ? [[`RECOGNISED ${pct(recog.H)} OLD  ${pct(recog.F)} NEW`, "sA"]] : [])] });
    ctx.say(!isFinite(effect) ? "Not enough correct trials. Try again." : effect > 25
      ? `By the later epochs you found the T ${f0(effect)} ms faster in repeated layouts than in new ones, though you were never told any repeated.${recog ? ` And you called ${pct(recog.H)} of the repeated layouts "seen before", against ${pct(recog.F)} of new ones.` : ""} Chun and Jiang found the same: the context guides attention to the target, and people can't say which layouts they learned.`
      : `Only ${f0(effect)} ms faster for repeated layouts. Chun and Jiang's benefit builds over several epochs: try the full run.`);
    ctx.csv("contextual_cueing.csv", ["trial", "block", "epoch", "repeated", "layout", "target_cell", "correct", "rt_ms"], data.map((d, i) => [i + 1, d.block, d.epoch, d.rep ? 1 : 0, d.id, d.tcell, d.ok ? 1 : 0, d.rt]));
  } };

export const LIB_MEMORY = [SPERLING, CHANGE, STERNBERG, SERIAL, CORSI, FLICKER, DRMFALSE, SRT, CUEING];
