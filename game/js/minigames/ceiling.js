// THE CEILING (Act III, Gus's desk; replaces the GRIM test). Table 1 of the Big Finding reports brain-behavior
// correlations: how well each layer's attention effect predicts each person's attention score, N = 19.
// They're astonishing (r = .94). Three steps, in the spirit of the 2009 "puzzlingly high correlations" critique:
//   1. RELIABILITY: in the supplement, find the two panels that measure a thing against ITSELF (test-retest for the
//      behaviour, odd vs even runs for the brain). A measure can't correlate with anything better than it agrees with itself.
//   2. THE CEILING: the most a true correlation can show is √(rel_brain × rel_behaviour) = √(.56 × .64) ≈ .60.
//      Mark every correlation in Table 1 that sits above it.
//   3. HOW: find the sentence in the methods that explains it. He picked the voxels BECAUSE they correlated with the
//      score, then reported how well they correlate with the score (non-independence, "double dipping").
//      Gus then runs the same procedure on pure noise, live, and gets a correlation nearly as pretty.
// PLAIN WORDS: the puzzle is written for players who aren't statisticians. No formulas or jargon on screen: "agrees with
// itself" for reliability, "the most it could be" for the ceiling, "matches" for correlation, and one everyday
// picture (a bathroom scale that can't give you the same weight twice) carries the idea. The numbers stay real.
// Each step has a hint ladder (a pointer after 2 misses, the answer lit amber after 4, or 3 in step 3). CLOSE keeps your
// place (G.flags.ceilProgress), and finding the sentence counts as done even if you skip the noise demo.
// Resolves { done, wrong }.
import { seg, segW, chip } from "../gfx.js";

export const N = 19;
export const REL = { beh: .64, brain: .56 };
export const CEIL = Math.sqrt(REL.beh * REL.brain);           // 0.599
export const ROWS = [
  ["V1", "SUPERFICIAL", .91], ["V1", "MIDDLE", .52], ["V1", "DEEP", .94],
  ["V2", "SUPERFICIAL", .47], ["V2", "DEEP", .88], ["PULVINAR", "WHOLE", .58],
];
export const above = (r) => r > CEIL;
// the supplement: two reliability panels and two decoys
export const PANELS = [
  { id: "beh", t: ["ATTENTION TEST", "TAKEN TWICE"], r: REL.beh, self: true, seed: 11 },
  { id: "motion", t: ["HEAD MOTION", "VS ATTENTION TEST"], r: .08, self: false, seed: 23 },
  { id: "brain", t: ["BRAIN SCAN", "RUN TWICE"], r: REL.brain, self: true, seed: 37 },
  { id: "pizza", t: ["BRAIN SIGNAL", "VS SLICES OF PIZZA"], r: .31, self: false, seed: 41 },
];
export const METHODS = [
  { id: "loc", t: "He drew each brain region on the person's anatomy before looking at any results." },
  { id: "z", t: "He averaged each person's two attention-test sessions into one score." },
  { id: "dip", t: "He searched thousands of brain spots and kept only the ones that already matched people's scores. Then he reported how well they matched." },
  { id: "n", t: "He tested nineteen people." },
];

const LINES = {
  intro: ["GUS", "Table 1 says his brain scans predict how well people pay attention at .94. Nearly perfect. That's like your bathroom scale predicting your shoe size, when it can't give you the same weight twice."],
  p1: ["GUS", "So first: how well does each measurement agree with ITSELF? Find the two panels that measure the same thing twice. Click them."],
  selfOk: ["GUS", "That's one. Same thing, measured twice. They only roughly agree."],
  selfBad: ["GUS", "That's two different things. I want one thing, measured twice."],
  p2: ["GUS", "The test agrees with itself .64. The scan, .56. A measurement can't agree with anything else better than it agrees with itself. So the most these two could ever match is about .60. Click every bar above that line."],
  barOk: ["GUS", "Above the line. Better than his own measurements could ever do. Impossible."],
  barUnder: ["GUS", "Under the line. That one's possible. I'm after the impossible ones."],
  barDone: ["NELL", "Three of six are impossible. So how did he get them?"],
  p3: ["GUS", "Here's what his methods say he did, in plain English. One of these is how you get a .94 out of measurements that top out at .60."],
  methBad: {
    loc: ["GUS", "Choosing his regions before looking. That's the honest way. Keep reading."],
    z: ["GUS", "Averaging two sessions makes a score steadier. Good, not magic."],
    n: ["GUS", "Nineteen is small, and that makes it worse. But it's not the trick."],
  },
  methOk: ["GUS", "There. He looked for the spots that happened to match the scores, kept those, then reported that they match the scores. That's painting the target around the arrow after it lands."],
  noise: ["GUS", "Watch. Five thousand brain spots of pure random noise, nineteen made-up people, his recipe. No brain at all."],
  // the hint ladder: a clear pointer after 2 misses in a step, the answer (lit amber) after 4 (3 in step 3, which only has 3 wrong sentences)
  hint1: ["GUS", "Read the labels under the panels. I want TAKEN TWICE or RUN TWICE: the same thing on both sides."],
  show1: ["GUS", "S2A and S2C. Attention score against itself, V1 against itself. The amber ones. Click them."],
  hint2: ["GUS", "The dashed amber line is .60, the most it could be. Only the dots poking above it. .58 doesn't count. Close isn't above."],
  show2: ["GUS", "V1 superficial .91, V1 deep .94, V2 deep .88. The amber ones. Click them."],
  hint3: ["GUS", "Look for the sentence where he picks his brain spots using the very scores he then compares them to."],
  show3: ["GUS", "The third one. He kept the spots that matched the scores, then reported that they match. Click it."],
};

// deterministic noise, so the drawing and the numbers never change between plays
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const gauss = (r) => () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const zs = (a) => { const m = a.reduce((s, x) => s + x, 0) / a.length, sd = Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length) || 1; return a.map(x => (x - m) / sd); };
export const pearson = (x, y) => { const a = zs(x), b = zs(y); return a.reduce((s, v, i) => s + v * b[i], 0) / a.length; };
// 19 points with a sample correlation of exactly r
export function pointsWithR(r, seed, n = N) {
  const g = gauss(rng(seed)), x = zs(Array.from({ length: n }, g)); let e = Array.from({ length: n }, g);
  const k = e.reduce((s, v, i) => s + v * x[i], 0) / n; e = zs(e.map((v, i) => v - k * x[i]));
  return x.map((v, i) => [v, r * v + Math.sqrt(1 - r * r) * e[i]]);
}
// the double dip on pure noise: 5000 voxels × 19 people, keep p < .001 (|r| > .693 at df 17), report the best
export function noiseDip(seed = 2009, vox = 5000) {
  const g = gauss(rng(seed)), beh = Array.from({ length: N }, g);
  let best = -1, bestY = null, kept = 0, sum = 0;
  for (let v = 0; v < vox; v++) { const y = Array.from({ length: N }, g), r = pearson(beh, y);
    if (r > .693) { kept++; sum += r; } if (r > best) { best = r; bestY = y; } }
  return { best, kept, mean: kept ? sum / kept : 0, pts: zs(beh).map((b, i) => [b, zs(bestY)[i]]) };
}

const MEMO = {};   // where progress lives when there is no game around (tests, previews)
const sfx = (n, o) => window.SFX && window.SFX.play(n, o);
const COL = { GUS: "B", NELL: "G" };

function scatter(pts, x, y, w, h, cls, dotCls = cls) {
  let s = `<rect class="hl ${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  const sx = (v) => x + w / 2 + v * w / 6.4, sy = (v) => y + h / 2 - v * h / 6.4;
  for (const [a, b] of pts) s += `<circle class="${dotCls}" style="stroke-width:.9" cx="${sx(a).toFixed(1)}" cy="${sy(b).toFixed(1)}" r="1.7"/>`;
  return s;
}

export function ceiling(el, { score = () => {} } = {}) {
  return new Promise(resolve => {
    let spoken = null, closed = false;
    const timers = [], later = (fn, ms) => timers.push(setTimeout(() => { if (!closed) fn(); }, ms));
    // progress survives CLOSE: reopening the desk resumes at the step you left, never back at step 1
    const F = (window.GC && window.GC.G && window.GC.G.flags) || MEMO;
    const saved = F.ceilProgress || null;
    const S = { phase: 1, picked: new Set(), marked: new Set(), meth: null, tried: new Set(), under: new Set(), wrong: 0, miss: 0,
      say: LINES.intro, done: false, drop: 0, noise: null, decoys: new Set() };
    // a step counts as finished the moment its last click lands, not when the next step slides in: closing the desk in
    // that second used to save a finished step with nothing left to click, and reopening it was a dead end
    const BARS = ROWS.filter(r => above(r[2])).length;
    const reached = (ph, picked, marked) => ph === 1 && picked >= 2 ? reached(2, picked, marked) : ph === 2 && marked >= BARS ? 3 : ph;
    if (saved) { S.phase = reached(saved.phase, (saved.picked || []).length, (saved.marked || []).length); S.picked = new Set(saved.picked); S.marked = new Set(saved.marked); S.wrong = saved.wrong || 0;
      S.drop = S.phase >= 2 ? 1 : 0; S.say = S.phase === 1 ? LINES.p1 : S.phase === 2 ? LINES.p2 : LINES.p3; }
    const save = () => { F.ceilProgress = S.done ? null : { phase: reached(S.phase, S.picked.size, S.marked.size), picked: [...S.picked], marked: [...S.marked], wrong: S.wrong }; };
    const P = PANELS.map(p => pointsWithR(p.r, p.seed));
    if (!saved) later(() => { if (S.phase === 1 && S.say === LINES.intro) { S.say = LINES.p1; draw(); } }, 3200);
    const showing = () => S.miss >= (S.phase === 3 ? 3 : 4);   // the answer is lit amber

    function phase1() {
      let s = seg("SUPPLEMENTARY FIGURE S2", 20, 8, 6, "sM", .8);
      PANELS.forEach((p, i) => { const x = 20 + i * 152, y = 26, on = S.picked.has(p.id), lit = !on && p.self && showing();
        const c = on ? "sG" : lit ? "sA" : S.decoys.has(p.id) ? "sM" : "sW";
        s += `<g data-panel="${p.id}" style="cursor:pointer">${scatter(P[i], x, y, 136, 112, c, c)}`;
        s += seg("S2" + "ABCD"[i], x, y + 120, 6, on ? "sG" : lit ? "sA" : "sM", .8);
        s += seg(p.t[0], x, y + 131, 6.5, on ? "sG" : lit ? "sA" : "sW", .9) + seg(p.t[1], x, y + 143, 6.5, on ? "sG" : lit ? "sA" : "sW", .9);
        if (on) { const t = "AGREES " + p.r.toFixed(2).replace(/^0/, ""); s += chip(t, x + 136 - chipW2(t, 5.5) - 4, y + 4, 5.5, "fG"); }
        if (S.decoys.has(p.id)) s += chip("NOT ITSELF", x + 136 - chipW2("NOT ITSELF", 4.6) - 4, y + 4, 4.6, "fR");
        s += `<rect x="${x}" y="${y}" width="136" height="150" fill="transparent"/></g>`; });
      return s;
    }
    function phase2() {
      const X0 = 300, Y0 = 186, H = 160, W = 320, yv = (r) => Y0 - r * H;
      let s = seg("HOW WELL EACH AGREES WITH ITSELF", 20, 8, 5, "sM", .8);
      s += seg("THE ATTENTION TEST", 20, 28, 6, "sW", .9) + seg(".64", 20, 40, 20, "sG", 1.4);
      s += seg("THE BRAIN SCAN", 20, 72, 6, "sW", .9) + seg(".56", 20, 84, 20, "sG", 1.4);
      s += seg("SO THE MOST THEY", 20, 116, 6, "sA", .9) + seg("COULD MATCH", 20, 126, 6, "sA", .9) + seg(S.drop ? "ABOUT .60" : "?", 20, 140, 16, "sA", 1.3);
      s += seg("CLICK EVERY DOT", 20, 172, 6, "sW", .9) + seg("ABOVE THE LINE", 20, 182, 6, "sW", .9);
      // axes: hairline grid at .2 steps
      for (let r = 0; r <= 1.001; r += .2) { s += `<path class="hl sD" d="M${X0},${yv(r)} L${X0 + W},${yv(r)}"/>` + seg(r.toFixed(1).replace(/^0/, ""), X0 - 18, yv(r) - 2.5, 5, "sM", .7); }
      s += seg("TABLE 1  HOW WELL THE BRAIN PREDICTS ATTENTION", X0, 8, 5.4, "sM", .8);
      ROWS.forEach(([roi, layer, r], i) => { const x = X0 + 28 + i * 52, m = S.marked.has(i), u = S.under.has(i), lit = !m && above(r) && showing();
        const c = m ? "sR" : lit ? "sA" : u ? "sM" : "sW";
        s += `<g data-bar="${i}" style="cursor:pointer"><path class="${c}" d="M${x},${Y0} L${x},${yv(r)}"/><circle class="${m ? "fR" : "k"} ${c}" cx="${x}" cy="${yv(r)}" r="3.2"/>`;
        s += seg(r.toFixed(2).replace(/^0/, ""), x - 7, yv(r) - 13, 6, c, .9) + seg(roi, x - segW(roi, 4) / 2, Y0 + 6, 4, "sW", .7) + seg(layer, x - segW(layer, 3.6) / 2, Y0 + 13, 3.6, "sM", .6);
        if (m) s += seg("ABOVE", x - segW("ABOVE", 3.6) / 2, Y0 + 20, 3.6, "sR", .6);
        else if (u) s += seg("UNDER", x - segW("UNDER", 3.6) / 2, Y0 + 20, 3.6, "sM", .6);
        s += `<rect x="${x - 20}" y="${yv(1)}" width="40" height="${H + 30}" fill="transparent"/></g>`; });
      const cy = yv(S.drop ? CEIL : 1.04);   // two poses: hanging at the top, then dropped onto .60
      s += `<path class="sA dash" d="M${X0 - 4},${cy} L${X0 + W},${cy}"/>` + chip("MOST IT COULD BE", X0 - 26 - chipW2("MOST IT COULD BE", 4.6), cy - 4, 4.6, "fA");
      return s;
    }
    const chipW2 = (t, h) => segW(t, h) + h * .9;
    function phase3() {
      let s = "";
      if (S.noise) { const n = S.noise, x = 330, y = 30;
        s += seg("PURE RANDOM NOISE", x, 8, 6, "sA", .8) + seg("5000 FAKE BRAIN SPOTS  19 MADE-UP PEOPLE  HIS RECIPE", x, 18, 4, "sM", .7);
        s += scatter(n.pts, x, y, 150, 130, "sA") + seg("BEST-MATCHING SPOT", x, y + 138, 4.4, "sW", .7) + seg("MATCH " + n.best.toFixed(2).replace(/^0/, ""), x, y + 148, 14, "sA", 1.2);
        s += seg("SPOTS HE'D KEEP", x + 170, y + 10, 4.4, "sW", .7) + seg(String(n.kept), x + 170, y + 20, 18, "sA", 1.3);
        s += seg("THEIR AVERAGE MATCH", x + 170, y + 60, 4.4, "sW", .7) + seg(n.mean.toFixed(2).replace(/^0/, ""), x + 170, y + 70, 18, "sA", 1.3);
        s += seg("HIS REAL RESULT", x + 170, y + 110, 4.4, "sR", .7) + seg(".94", x + 170, y + 120, 18, "sR", 1.3);
      }
      return s;
    }
    function draw() {
      if (closed) return;
      if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(S.say[0], true); }
      const head = ["THE CEILING", S.phase === 1 ? "STEP 1 OF 3  SAME THING TWICE" : S.phase === 2 ? "STEP 2 OF 3  THE MOST IT COULD BE" : "STEP 3 OF 3  HOW HE DID IT"];
      const lit3 = showing() && S.meth !== "dip";
      const body = S.phase === 1 ? `<svg class="t" viewBox="0 0 640 200">${phase1()}</svg>`
        : S.phase === 2 ? `<svg class="t" viewBox="0 0 640 210">${phase2()}</svg>`
        : `<div class="ceilmeth"><ol>${METHODS.map(m => `<li data-meth="${m.id}" class="${S.meth === "dip" && m.id === "dip" ? "hit" : S.tried.has(m.id) ? "miss" : ""}"${lit3 && m.id === "dip" ? ` style="color:var(--A)"` : ""}>${m.t}</li>`).join("")}</ol>
            <svg class="t" viewBox="320 0 320 200">${phase3()}</svg></div>`;
      const status = S.phase === 1 ? `CLICK THE TWO PANELS THAT MEASURE THE SAME THING TWICE · ${S.picked.size} / 2`
        : S.phase === 2 ? `CLICK EVERY RESULT ABOVE THE LINE · ${S.marked.size} / 3`
        : S.done ? "PROVEN" : S.meth === "dip" ? "NOW WATCH HIS RECIPE ON PURE NOISE" : "CLICK THE STEP THAT EXPLAINS IT";
      const c = COL[S.say[0]] || "W";
      el.innerHTML = `<div class="screen grim ceil">
        <svg class="t hd" viewBox="0 0 640 40">${seg(head[0], 16, 10, 18, "sW", 1.6)}${seg(head[1], 200, 17, 5.5, "sA", .8)}</svg>
        <div class="ceilbody">${body}</div>
        <div class="coachline"><span class="who" style="background:var(--${c})">${S.say[0]}</span> <span style="color:var(--${c})">${S.say[1]}</span></div>
        <div class="bar"><span class="status">${status}</span>
          ${S.phase === 3 && S.meth === "dip" && !S.noise ? `<button data-b="noise">RUN IT ON NOISE</button>` : ""}
          <button data-b="off" class="off">${S.done ? "DONE" : "CLOSE"}</button></div></div>`;
    }
    // a miss: the step's own counter drives the hint ladder; S.wrong (the score) counts each distinct mistake once
    function missed(key, line) {
      S.miss++;
      if (key) S.wrong++;
      const n = S.phase;
      S.say = showing() ? LINES["show" + n] : S.miss >= 2 ? LINES["hint" + n] : line;
      sfx("bad"); save(); draw();
    }
    function nextPhase(p, say) { S.phase = p; S.miss = 0; S.say = say; save(); draw(); }
    function pick(id) {
      const p = PANELS.find(q => q.id === id); if (!p || S.picked.has(id)) return;
      if (!p.self) { const fresh = !S.decoys.has(id); S.decoys.add(id); missed(fresh, LINES.selfBad); return; }
      S.picked.add(id); S.say = LINES.selfOk; sfx("good");
      if (S.picked.size === 2) { sfx("chime"); later(() => { nextPhase(2, LINES.p2);
        later(() => { S.drop = 1; sfx("stamp"); draw(); }, 700); }, 1100); }
      save(); draw();
    }
    function bar(i) {
      if (!S.drop || S.marked.has(i)) return;
      if (!above(ROWS[i][2])) { const fresh = !S.under.has(i); S.under.add(i); missed(fresh, LINES.barUnder); return; }
      S.marked.add(i); S.say = LINES.barOk; sfx("stamp");
      if (S.marked.size === BARS) { S.say = LINES.barDone; sfx("chime");
        later(() => nextPhase(3, LINES.p3), 1600); }
      save(); draw();
    }
    function meth(id) {
      if (S.meth === "dip") return;
      if (id !== "dip") { const fresh = !S.tried.has(id); S.tried.add(id); S.meth = id; missed(fresh, LINES.methBad[id]); return; }
      S.meth = "dip"; S.say = LINES.methOk; sfx("good"); draw();
      later(() => { if (!S.noise && !S.running) runNoise(); }, 4200);   // the payoff runs by itself if you just read
    }
    function runNoise() {
      if (S.running) return; S.running = true;
      S.say = LINES.noise; sfx("calc"); draw();
      later(() => { S.noise = noiseDip(); S.done = true; save();
        const f2 = (v) => v.toFixed(2).replace(/^0/, "");
        S.say = ["NELL", `No brain at all, and his recipe still finds a "match" of ${f2(S.noise.best)}. Pick the winners first and of course they win. His .94 isn't the brain; it's the picking. Ed Vul called these "puzzlingly high correlations" in 2009.`]; sfx("chime"); score("grim", Math.max(1, 4 - S.wrong)); draw(); }, 1200);
    }
    const onClick = (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const p = t.closest("[data-panel]"); if (p && S.phase === 1) { pick(p.dataset.panel); return; }
      const b = t.closest("[data-bar]"); if (b && S.phase === 2) { bar(+b.dataset.bar); return; }
      const m = t.closest("[data-meth]"); if (m && S.phase === 3) { meth(m.dataset.meth); return; }
      const k = t.closest("button[data-b]"); if (!k) return;
      if (k.dataset.b === "noise") runNoise(); else if (k.dataset.b === "off") finish();
    };
    const onKey = (e) => { if (e.key === "Escape") finish(); };
    function finish() {
      // the sentence is found: the proof stands even if you skip the noise demo
      if (!S.done && S.meth === "dip") { S.done = true; score("grim", Math.max(1, 4 - S.wrong)); }
      save(); closed = true; timers.forEach(clearTimeout); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey); el.classList.remove("show"); el.innerHTML = ""; resolve({ done: S.done, wrong: S.wrong }); }
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
  });
}
