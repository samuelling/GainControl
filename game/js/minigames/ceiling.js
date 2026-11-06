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
  { id: "beh", t: ["ATTENTION SCORE", "SESSION 1 VS SESSION 2"], r: REL.beh, self: true, seed: 11 },
  { id: "motion", t: ["HEAD MOTION", "VS ATTENTION SCORE"], r: .08, self: false, seed: 23 },
  { id: "brain", t: ["V1 ATTENTION EFFECT", "ODD RUNS VS EVEN RUNS"], r: REL.brain, self: true, seed: 37 },
  { id: "pizza", t: ["V1 SIGNAL", "VS SLICES OF PIZZA"], r: .31, self: false, seed: 41 },
];
export const METHODS = [
  { id: "loc", t: "Layer ROIs were defined anatomically from each participant's T1, before any functional data were examined." },
  { id: "z", t: "Attention scores (cue validity effect, ms) were z-scored within session and averaged across the two sessions." },
  { id: "dip", t: "Within each ROI, voxels whose attention effect correlated with attention score (p < .001) were selected; Table 1 reports the mean correlation across selected voxels." },
  { id: "n", t: "All correlations are Pearson's r across participants (N = 19)." },
];

const LINES = {
  intro: ["GUS", "Table 1. How well each layer's attention effect predicts how well each person attends. Point nine four. Nobody's brain predicts anything at point nine four."],
  p1: ["GUS", "Before I trust a correlation, I ask how well each measure agrees with ITSELF. Find me those two panels in his supplement. Click them."],
  selfOk: ["GUS", "That's one. Same thing, measured twice. That's reliability."],
  selfBad: ["GUS", "That's two different things against each other. I want one thing against itself. Twice."],
  p2: ["GUS", "Two wobbly rulers can only agree as well as they're steady. Ceiling: square root of the two reliabilities multiplied. Root of .64 times .56. About .60. Mark everything in Table 1 above it."],
  barOk: ["GUS", "Above the ceiling. That's a correlation better than his own measurements could ever produce."],
  barUnder: ["GUS", "Under the ceiling. Could be real, could be noise. Not proof. Find the ones that can't be."],
  barDone: ["NELL", "Three of six. Above the ceiling. So how did he get them?"],
  p3: ["GUS", "Read his methods. One of these sentences is how you get a .94 out of rulers that top out at .60."],
  methBad: {
    loc: ["GUS", "Anatomical ROIs, chosen before looking. That's the honest way. Keep reading."],
    z: ["GUS", "Boring. Good boring. Averaging sessions makes a score steadier, not magic."],
    n: ["GUS", "Nineteen is small, and small makes it worse. But it's not the trick. Keep going."],
  },
  methOk: ["GUS", "There. He searched every voxel for the ones that happened to correlate with the score, then reported how well they correlate with the score. That's grading your own exam with the answer key."],
  noise: ["GUS", "Watch. Five thousand voxels of pure noise, nineteen made-up people, same recipe. Not a single real brain."],
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
    let spoken = null, timer = null;
    const S = { phase: 1, picked: new Set(), marked: new Set(), meth: null, wrong: 0, say: LINES.intro, done: false, drop: 0, noise: null };
    const P = PANELS.map(p => pointsWithR(p.r, p.seed));
    setTimeout(() => { if (S.phase === 1 && S.say === LINES.intro) { S.say = LINES.p1; draw(); } }, 3200);

    function phase1() {
      let s = seg("SUPPLEMENTARY FIGURE S2", 20, 8, 6, "sM", .8);
      PANELS.forEach((p, i) => { const x = 20 + i * 152, y = 26, on = S.picked.has(p.id);
        s += `<g data-panel="${p.id}" style="cursor:pointer">${scatter(P[i], x, y, 136, 112, on ? "sG" : "sW", on ? "sG" : "sW")}`;
        s += seg("S2" + "ABCD"[i], x, y + 120, 6, on ? "sG" : "sM", .8);
        s += seg(p.t[0], x, y + 132, 4.4, on ? "sG" : "sW", .7) + seg(p.t[1], x, y + 141, 4.4, on ? "sG" : "sM", .7);
        if (on) s += chip("R = " + p.r.toFixed(2).replace(/^0/, ""), x + 136 - segW("R = .64", 5.5) - 6, y + 4, 5.5, "fG");
        s += `<rect x="${x}" y="${y}" width="136" height="150" fill="transparent"/></g>`; });
      return s;
    }
    function phase2() {
      const X0 = 300, Y0 = 186, H = 160, W = 320, yv = (r) => Y0 - r * H;
      let s = seg("RELIABILITY", 20, 8, 6, "sM", .8);
      s += seg("BEHAVIOUR WITH ITSELF", 20, 30, 4.4, "sW", .7) + seg(".64", 20, 40, 20, "sG", 1.4);
      s += seg("BRAIN WITH ITSELF", 20, 74, 4.4, "sW", .7) + seg(".56", 20, 84, 20, "sG", 1.4);
      s += seg("CEILING", 20, 120, 4.4, "sA", .7) + seg("ROOT .64 X .56", 20, 130, 7, "sM", .9) + seg(S.drop ? ".60" : "?", 20, 144, 20, "sA", 1.4);
      // axes: hairline grid at .2 steps
      for (let r = 0; r <= 1.001; r += .2) { s += `<path class="hl sD" d="M${X0},${yv(r)} L${X0 + W},${yv(r)}"/>` + seg(r.toFixed(1).replace(/^0/, ""), X0 - 18, yv(r) - 2.5, 5, "sM", .7); }
      s += seg("TABLE 1  BRAIN-BEHAVIOUR R  N = 19", X0, 8, 6, "sM", .8);
      ROWS.forEach(([roi, layer, r], i) => { const x = X0 + 28 + i * 52, m = S.marked.has(i), c = m ? "sR" : "sW";
        s += `<g data-bar="${i}" style="cursor:pointer"><path class="${c}" d="M${x},${Y0} L${x},${yv(r)}"/><circle class="${m ? "fR" : "k"} ${c}" cx="${x}" cy="${yv(r)}" r="3.2"/>`;
        s += seg(r.toFixed(2).replace(/^0/, ""), x - 7, yv(r) - 13, 6, c, .9) + seg(roi, x - segW(roi, 4) / 2, Y0 + 6, 4, "sW", .7) + seg(layer, x - segW(layer, 3.6) / 2, Y0 + 13, 3.6, "sM", .6);
        if (m) s += seg("ABOVE", x - segW("ABOVE", 3.6) / 2, Y0 + 20, 3.6, "sR", .6);
        s += `<rect x="${x - 20}" y="${yv(1)}" width="40" height="${H + 30}" fill="transparent"/></g>`; });
      const cy = yv(S.drop ? CEIL : 1.04);   // two poses: hanging at the top, then dropped onto .60
      s += `<path class="sA dash" d="M${X0 - 4},${cy} L${X0 + W},${cy}"/>` + chip("NOISE CEILING", X0 - 26 - chipW2("NOISE CEILING", 4.6), cy - 4, 4.6, "fA");
      return s;
    }
    const chipW2 = (t, h) => segW(t, h) + h * .9;
    function phase3() {
      let s = "";
      if (S.noise) { const n = S.noise, x = 330, y = 30;
        s += seg("PURE NOISE", x, 8, 6, "sA", .8) + seg("5000 VOXELS  19 PEOPLE  SAME RECIPE", x, 18, 4.2, "sM", .7);
        s += scatter(n.pts, x, y, 150, 130, "sA") + seg("BEST VOXEL", x, y + 138, 4.4, "sW", .7) + seg("R = " + n.best.toFixed(2).replace(/^0/, ""), x, y + 148, 14, "sA", 1.2);
        s += seg("VOXELS KEPT", x + 170, y + 10, 4.4, "sW", .7) + seg(String(n.kept), x + 170, y + 20, 18, "sA", 1.3);
        s += seg("MEAN OF KEPT", x + 170, y + 60, 4.4, "sW", .7) + seg(n.mean.toFixed(2).replace(/^0/, ""), x + 170, y + 70, 18, "sA", 1.3);
        s += seg("HIS V1 DEEP", x + 170, y + 110, 4.4, "sR", .7) + seg(".94", x + 170, y + 120, 18, "sR", 1.3);
      }
      return s;
    }
    function draw() {
      if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(S.say[0], true); }
      const head = ["THE CEILING", S.phase === 1 ? "STEP 1  RELIABILITY" : S.phase === 2 ? "STEP 2  THE NOISE CEILING" : "STEP 3  HOW"];
      const body = S.phase === 1 ? `<svg class="t" viewBox="0 0 640 200">${phase1()}</svg>`
        : S.phase === 2 ? `<svg class="t" viewBox="0 0 640 210">${phase2()}</svg>`
        : `<div class="ceilmeth"><ol>${METHODS.map(m => `<li data-meth="${m.id}" class="${S.meth === m.id ? (m.id === "dip" ? "hit" : "miss") : ""}">${m.t}</li>`).join("")}</ol>
            <svg class="t" viewBox="320 0 320 200">${phase3()}</svg></div>`;
      const status = S.phase === 1 ? `${S.picked.size} / 2 FOUND` : S.phase === 2 ? `${S.marked.size} / 3 MARKED` : S.done ? "PROVEN" : "FIND THE SENTENCE";
      const c = COL[S.say[0]] || "W";
      el.innerHTML = `<div class="screen grim ceil">
        <svg class="t hd" viewBox="0 0 640 40">${seg(head[0], 16, 10, 18, "sW", 1.6)}${seg(head[1], 200, 17, 5.5, "sA", .8)}</svg>
        <div class="ceilbody">${body}</div>
        <div class="coachline"><span class="who" style="background:var(--${c})">${S.say[0]}</span> <span style="color:var(--${c})">${S.say[1]}</span></div>
        <div class="bar"><span class="status">${status}</span>
          ${S.phase === 3 && S.meth === "dip" && !S.noise ? `<button data-b="noise">RUN IT ON NOISE</button>` : ""}
          <button data-b="off" class="off">${S.done ? "DONE" : "CLOSE"}</button></div></div>`;
    }
    function pick(id) {
      const p = PANELS.find(q => q.id === id); if (!p || S.picked.has(id)) return;
      if (!p.self) { S.wrong++; S.say = LINES.selfBad; sfx("bad"); draw(); return; }
      S.picked.add(id); S.say = LINES.selfOk; sfx("good");
      if (S.picked.size === 2) { sfx("chime"); timer = setTimeout(() => { S.phase = 2; S.say = LINES.p2; draw();
        timer = setTimeout(() => { S.drop = 1; sfx("stamp"); draw(); }, 700); }, 1100); }
      draw();
    }
    function bar(i) {
      if (!S.drop || S.marked.has(i)) return;
      if (!above(ROWS[i][2])) { S.wrong++; S.say = LINES.barUnder; sfx("bad"); draw(); return; }
      S.marked.add(i); S.say = LINES.barOk; sfx("stamp");
      if (S.marked.size === ROWS.filter(r => above(r[2])).length) { S.say = LINES.barDone; sfx("chime");
        timer = setTimeout(() => { S.phase = 3; S.say = LINES.p3; draw(); }, 1600); }
      draw();
    }
    function meth(id) {
      if (S.meth === "dip") return;
      S.meth = id;
      if (id !== "dip") { S.wrong++; S.say = LINES.methBad[id]; sfx("bad"); }
      else { S.say = LINES.methOk; sfx("good"); }
      draw();
    }
    function runNoise() {
      S.say = LINES.noise; sfx("calc"); draw();
      timer = setTimeout(() => { S.noise = noiseDip(); S.done = true;
        const f2 = (v) => v.toFixed(2).replace(/^0/, "");
        S.say = ["NELL", `Pure noise, and the best voxel correlates at ${f2(S.noise.best)}. Keep the ${S.noise.kept} that pass and average them: ${f2(S.noise.mean)}. His layers are the selection, not the brain. A 2009 paper called these puzzlingly high correlations.`]; sfx("chime"); score("grim", Math.max(1, 4 - S.wrong)); draw(); }, 1200);
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
    function finish() { clearTimeout(timer); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey); el.classList.remove("show"); el.innerHTML = ""; resolve({ done: S.done, wrong: S.wrong }); }
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
  });
}
