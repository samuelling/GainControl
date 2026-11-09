// DARTS, in the coffee kitchen: a little game you can play any time, not a puzzle. Three rounds of three darts on a real
// board layout (20 at the top, doubles and trebles). Point to aim: the reticle sits exactly where you point. Click (or
// Enter) throws. What you can't see is your own motor system: each time you step up to the board, your release gets a
// hidden BIAS (a constant offset, any direction, sometimes nearly none) and a hidden SPREAD (Gaussian scatter, sd
// unknown). The only outward sign of the spread is the reticle's own small jitter, in proportion to it (a steady hand
// today, or a shaky one). The bias you learn only from where the darts land against where you aimed (a faint × marks
// each aim, for the round), and the more darts, the better. After each game the postdoc reports the running estimate
// (mean miss ± its standard error, and the spread) over all N so far. Walk away and come back: a new hand.
// The reticle jitters in steps and the dart flies in four fixed poses (Game & Watch, not tweens). Best score is kept.
// Resolves { best, total } when you leave.
import { seg, segC } from "../gfx.js";
import { exitLabel, exitKey } from "./exit.js";

const CX = 320, CY = 146, R = 112;                       // the board: centre and outer double radius, in a 640 × 290 view
const RING = { bull: .037, outer: .094, t0: .582, t1: .629, d0: .953, d1: 1 };
const SEQ = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const STEP = 70;                                         // ms per pose of the hand
const BEST_KEY = "gaincontrol.darts.best";
const P = (r, a) => [CX + r * Math.sin(a), CY - r * Math.cos(a)];
const f1 = (v) => v.toFixed(1);
// a segment of the board between radii r0..r1 and angles a0..a1, as a closed path
const wedge = (r0, r1, a0, a1) => { const p = [P(r0, a0), P(r1, a0), P(r1, a1), P(r0, a1)];
  return `M${f1(p[0][0])},${f1(p[0][1])} L${f1(p[1][0])},${f1(p[1][1])} A${r1},${r1} 0 0 1 ${f1(p[2][0])},${f1(p[2][1])} L${f1(p[3][0])},${f1(p[3][1])} A${r0},${r0} 0 0 0 ${f1(p[0][0])},${f1(p[0][1])} Z`; };

export function score(x, y) {
  const dx = x - CX, dy = y - CY, r = Math.hypot(dx, dy) / R;
  if (r <= RING.bull) return { pts: 50, label: "BULLSEYE", ring: "bull" };
  if (r <= RING.outer) return { pts: 25, label: "OUTER BULL", ring: "outer" };
  if (r > RING.d1) return { pts: 0, label: "THE WALL", ring: "miss" };
  const a = (Math.atan2(dx, -dy) * 180 / Math.PI + 360 + 9) % 360, i = Math.floor(a / 18), n = SEQ[i];
  if (r >= RING.d0) return { pts: 2 * n, label: `DOUBLE ${n}`, ring: "double", i };
  if (r >= RING.t0 && r <= RING.t1) return { pts: 3 * n, label: `TREBLE ${n}`, ring: "treble", i };
  return { pts: n, label: `SINGLE ${n}`, ring: r < RING.t0 ? "inner" : "outerS", i };
}

function board(lit) {
  let s = `<circle class="k sD" cx="${CX}" cy="${CY}" r="${R * 1.16}"/>`;
  for (let i = 0; i < 20; i++) {
    const a0 = (i * 18 - 9) * Math.PI / 180, a1 = (i * 18 + 9) * Math.PI / 180, c = i % 2 ? "sG" : "sR";
    s += `<path class="hl sM" d="${wedge(RING.outer * R, RING.d1 * R, a0, a1)}"/>`;
    s += `<path class="hl ${c}" d="${wedge(RING.t0 * R, RING.t1 * R, a0, a1)}"/><path class="hl ${c}" d="${wedge(RING.d0 * R, RING.d1 * R, a0, a1)}"/>`;
    const [nx, ny] = P(R * 1.08, i * 18 * Math.PI / 180);
    s += segC(String(SEQ[i]), nx, ny - 3.2, 6.4, "sW", .8);
  }
  s += `<circle class="hl sG" cx="${CX}" cy="${CY}" r="${RING.outer * R}"/><circle class="hl sR" cx="${CX}" cy="${CY}" r="${RING.bull * R}"/>`;
  s += `<circle class="sW" cx="${CX}" cy="${CY}" r="${R}"/>`;
  // the segment just hit lights up (it's ON)
  if (lit) {
    if (lit.ring === "bull") s += `<circle class="fR" cx="${CX}" cy="${CY}" r="${RING.bull * R}"/>`;
    else if (lit.ring === "outer") s += `<circle class="hl sG" cx="${CX}" cy="${CY}" r="${RING.outer * R - 1}" style="stroke-width:2.4"/>`;
    else if (lit.i !== undefined) { const a0 = (lit.i * 18 - 9) * Math.PI / 180, a1 = (lit.i * 18 + 9) * Math.PI / 180;
      const [r0, r1] = lit.ring === "double" ? [RING.d0, RING.d1] : lit.ring === "treble" ? [RING.t0, RING.t1] : lit.ring === "inner" ? [RING.outer, RING.t0] : [RING.t1, RING.d0];
      s += `<path class="${lit.i % 2 ? "fG" : "fR"}" d="${wedge(r0 * R, r1 * R, a0, a1)}"/>`; }
  }
  return s;
}
// a dart stuck in the board (or the wall): barrel and flights, pointing up and away
const dart = (x, y, c = "sW", k = 1) => `<g transform="translate(${f1(x)},${f1(y)}) scale(${k})"><path class="${c}" d="M0,0 L7,-11"/><path class="k ${c}" d="M5,-8 L9,-14 L8,-15 L4,-9 Z"/>
  <path class="${c}" d="M8,-14 L14,-16 M8,-14 L10,-20"/><circle class="f${c.slice(1)}" cx="0" cy="0" r="1"/></g>`;

const COL = { "A POSTDOC": "W", NELL: "G", GUS: "B", IRIS: "V", MORRIS: "K" };
const LINES = {
  intro: ["A POSTDOC", "Three darts, three rounds. Point, then click. You'll throw exactly where you point. Except you won't: today's hand has a bias and a spread nobody can see. That little wobble is the only clue. Throw enough and you'll learn yours."],
  bull: ["A POSTDOC", "Bullseye. Who ARE you?"], t20: ["A POSTDOC", "Treble twenty. That's sixty. I've been here nine years and I've done that twice."],
  treble: ["A POSTDOC", "A treble. Respectable. Publishable, even."], double: ["A POSTDOC", "On the double ring. Living dangerously."],
  wall: ["A POSTDOC", "That's the wall. The wall has been hit before. The wall understands."],
  ok: ["A POSTDOC", "On the board. That's more than most grant applications."],
  shaky: ["A POSTDOC", "Look at that reticle shake. Big spread today. Aim for the fat part of the board and let the average do the work."],
  steady: ["A POSTDOC", "Steady hands today. Whatever's off now is bias, not noise. Watch where they land against your marks."],
  round: (n, t) => ["A POSTDOC", `Round ${n}: ${t}. Pull them out. Again.`],
  end: (t, best, nb, est) => ["A POSTDOC", (nb ? `${t}. A new kitchen record. It's going on the corkboard. Nobody reads the corkboard.` : `${t}. The kitchen record's ${best}. The record is always somebody else's.`) + " " + est],
};
const CSS = `
.darts svg.dsvg { position: relative; inset: auto; width: 100%; flex: 1 1 0; min-height: 0; cursor: none; }
.darts svg.dsvg path, .darts svg.dsvg circle { fill: none; }
.darts svg.dsvg .k { fill: #000; }
.darts svg.dsvg .fR { fill: var(--R); } .darts svg.dsvg .fG { fill: var(--G); } .darts svg.dsvg .fW { fill: var(--W); } .darts svg.dsvg .fA { fill: var(--A); }
`;
function injectStyle(id, css) { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); }
const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function darts(el, opts = {}) {
  injectStyle("mg-darts", CSS);
  return new Promise(resolve => {
    let best = 0; try { best = +(localStorage.getItem(BEST_KEY) || 0); } catch (e) { /* no storage: no record */ }
    // the hidden part of your throw, for as long as the board is open: a bias (offset) and a spread (Gaussian sd), in board units (R = 112)
    const HID = (() => { const a = Math.random() * 2 * Math.PI, m = 22 * Math.sqrt(Math.random()); return { bx: m * Math.cos(a), by: m * Math.sin(a), sd: 5 + 11 * Math.random() }; })();
    const gauss = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
    const errs = [];                                      // every throw this visit: where it landed minus where you aimed
    window.DARTS_HIDDEN = HID;                            // for scripted tests only; the game never shows it
    const S = { round: 1, aims: [], inRound: 0, total: 0, roundPts: 0, stuck: [], aim: [CX, CY + 40], jit: [0, 0],
      flying: null, lit: null, done: false, say: LINES.intro, last: "", newBest: false, toldHand: false };

    el.innerHTML = `<div class="screen darts">
      <svg class="t hd" viewBox="0 0 640 40">${seg("DARTS", 16, 10, 18, "sW", 1.6)}${seg("THE COFFEE KITCHEN  ·  NOT A PUZZLE. JUST DARTS.", 120, 17, 5, "sM", .8)}<g id="dhud"></g></svg>
      <svg class="t dsvg" viewBox="0 0 640 290"></svg>
      <div class="coachline"></div>
      <div class="bar"><button data-b="throw">THROW <small>CLICK</small></button><span class="status"></span>
        <button data-b="again" style="display:none">AGAIN</button><button data-b="off" class="off">${exitLabel(false)}</button></div></div>`;
    el.classList.add("show");
    const svg = el.querySelector("svg.dsvg"), hudE = el.querySelector("#dhud"), coachE = el.querySelector(".coachline"), statusE = el.querySelector(".status");
    const againB = el.querySelector("[data-b=again]"), offB = el.querySelector("[data-b=off]");
    let spoken = null;
    function coach() { const [w, t] = S.say, c = COL[w] || "W"; if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice && window.SFX.voice(w, true); }
      coachE.innerHTML = `<span class="who" style="background:var(--${c})">${w}</span> <span style="color:var(--${c})">${t}</span>`; }
    function draw() {
      const [rx, ry] = [S.aim[0] + S.jit[0], S.aim[1] + S.jit[1]];
      let s = `<rect width="640" height="290" fill="#000"/>` + board(S.lit);
      // the oche, a strip of tape at the bottom; the darts already thrown this round
      s += `<path class="hl dash sA" d="M120,284 L520,284"/>${seg("OCHE", 296, 274, 5, "sA", .7)}`;
      // a faint × where each of this round's darts was aimed: the gap to the dart is your bias plus your spread
      for (const [ax, ay] of S.aims) s += `<path class="hl sM" d="M${f1(ax - 3)},${f1(ay - 3)} L${f1(ax + 3)},${f1(ay + 3)} M${f1(ax + 3)},${f1(ay - 3)} L${f1(ax - 3)},${f1(ay + 3)}"/>`;
      for (const d of S.stuck) s += dart(d[0], d[1], d[2] ? "sW" : "sM");
      // in flight: four fixed poses from the hand to the board, shrinking as it goes
      if (S.flying) { const { from, to, pose } = S.flying, u = (pose + 1) / 4, x = from[0] + (to[0] - from[0]) * u, y = from[1] + (to[1] - from[1]) * u - Math.sin(u * Math.PI) * 30;
        s += dart(x, y, "sA", 2.2 - pose * .35) + (pose < 3 ? `<path class="hl sA dash" d="M${f1(x + 12)},${f1(y + 10)} L${f1(x + 26)},${f1(y + 22)}"/>` : ""); }
      // the reticle: exactly where you point, give or take its jitter (drawn as poses: a ring and a cross)
      if (!S.done && !S.flying) { const c = "sA";
        s += `<circle class="${c}" cx="${f1(rx)}" cy="${f1(ry)}" r="7"/><path class="hl ${c}" d="M${f1(rx - 12)},${f1(ry)} L${f1(rx - 3)},${f1(ry)} M${f1(rx + 3)},${f1(ry)} L${f1(rx + 12)},${f1(ry)} M${f1(rx)},${f1(ry - 12)} L${f1(rx)},${f1(ry - 3)} M${f1(rx)},${f1(ry + 3)} L${f1(rx)},${f1(ry + 12)}"/>`; }
      if (S.last) { const [lab, pts] = S.last.split("|"); s += segC(lab, 548, 112, 6, "sM", .9) + (pts ? segC(pts, 548, 124, 22, S.lit && S.lit.pts >= 50 ? "sR" : "sW", 1.8) : ""); }
      svg.innerHTML = s;
      hudE.innerHTML = `${seg("ROUND", 400, 6, 4.4, "sM", .8)}${seg(`${S.round}/3`, 400, 14, 10, "sW", 1.2)}${seg("DART", 450, 6, 4.4, "sM", .8)}${seg(`${Math.min(3, S.inRound + 1)}/3`, 450, 14, 10, "sW", 1.2)}`
        + `${seg("SCORE", 500, 6, 4.4, "sM", .8)}${seg(String(S.total).padStart(3, "0"), 500, 14, 10, "sA", 1.2)}${seg("BEST", 566, 6, 4.4, "sM", .8)}${seg(String(Math.max(best, 0)).padStart(3, "0"), 566, 14, 10, "sG", 1.2)}`;
      statusE.textContent = S.done ? `${S.total} POINTS` : `ROUND ${S.round}: ${S.roundPts}`;
      el.querySelector("[data-b=throw]").disabled = S.done || !!S.flying;
      againB.style.display = S.done ? "" : "none"; offB.innerHTML = exitLabel(S.done);
      coach();
    }
    // the hand: the reticle shakes in small steps, in proportion to today's hidden spread (the only outward sign of it).
    // It's a picture of the noise, not the noise: the dart leaves from where you point, then bias and spread take over.
    const JIT = .28 * HID.sd;
    const tick = setInterval(() => {
      if (S.done || S.flying) return;
      S.jit = [JIT * gauss(), JIT * gauss()];
      draw();
    }, STEP);
    const toView = (e) => { const m = svg.getScreenCTM(); if (!m) return null; const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); return [p.x, p.y]; };
    function throwDart() {
      if (S.done || S.flying) return;
      const [rx, ry] = S.aim, to = [rx + HID.bx + HID.sd * gauss(), ry + HID.by + HID.sd * gauss()];
      S.aims.push([rx, ry]); errs.push([to[0] - rx, to[1] - ry]);
      S.flying = { from: [S.aim[0] + 60, 300], to, pose: 0 }; sfx("whoosh");
      const fly = setInterval(() => {
        S.flying.pose++; draw();
        if (S.flying.pose >= 3) { clearInterval(fly); land(to); }
      }, 60);
    }
    function land(to) {
      const sc = score(to[0], to[1]); S.flying = null; S.lit = sc.pts ? sc : null; S.last = sc.pts ? `${sc.label}|${sc.pts}` : "THE WALL|0";
      S.stuck.push([to[0], to[1], sc.pts > 0]); S.total += sc.pts; S.roundPts += sc.pts; S.inRound++;
      sfx(sc.pts ? "dart" : "knock");
      S.say = sc.ring === "bull" ? LINES.bull : sc.label === "TREBLE 20" ? LINES.t20 : sc.ring === "treble" ? LINES.treble : sc.ring === "double" ? LINES.double : sc.pts ? LINES.ok : LINES.wall;
      // after the first dart, a word on today's hand (only the very shaky or the very steady get one)
      if (!S.toldHand && sc.ring !== "bull") { S.toldHand = true; if (HID.sd > 12.5) S.say = LINES.shaky; else if (HID.sd < 7) S.say = LINES.steady; }
      if (S.inRound >= 3) {
        if (S.round >= 3) return finishGame();
        S.say = LINES.round(S.round, S.roundPts);
        setTimeout(() => { S.round++; S.inRound = 0; S.roundPts = 0; S.stuck = []; S.aims = []; S.lit = null; S.last = ""; sfx("cloth"); draw(); }, 1100);
      }
      draw();
    }
    function finishGame() {
      S.done = true; S.newBest = S.total > best;
      if (S.newBest) { best = S.total; try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) { /* fine */ } sfx("chime"); }
      S.say = LINES.end(S.total, best, S.newBest, estimate()); draw();
    }
    // the postdoc's read on your throw so far: mean miss (± standard error), and the spread. More N, smaller error bars.
    function estimate() {
      // in millimetres on a real board (outer double ring: 170 mm from the centre)
      const MM = 170 / R, n = errs.length, m = [0, 1].map(k => errs.reduce((a, e) => a + e[k], 0) / n * MM);
      const sd = Math.sqrt(errs.reduce((a, e) => a + (e[0] * MM - m[0]) ** 2 + (e[1] * MM - m[1]) ** 2, 0) / Math.max(1, 2 * (n - 1))), se = sd / Math.sqrt(n);
      const dir = (v, pos, neg) => Math.abs(v) < 2 ? "" : `${Math.round(Math.abs(v))} mm ${v > 0 ? pos : neg}`;
      const off = [dir(m[0], "right", "left"), dir(m[1], "low", "high")].filter(Boolean).join(" and ");
      const real = Math.hypot(m[0], m[1]) > 2 * se;
      return `N = ${n}. ` + (real && off ? `You land ${off} of where you aim, give or take ${Math.max(1, Math.round(se))} mm.` : `No bias I can see yet, give or take ${Math.max(1, Math.round(se))} mm.`)
        + ` Your spread's about ${Math.round(sd)} mm.` + (n < 18 ? " Throw more. Error bars shrink with the square root of N." : " Aim off by that much and see.");
    }
    function again() { Object.assign(S, { round: 1, inRound: 0, total: 0, roundPts: 0, stuck: [], aims: [], lit: null, last: "", done: false, say: LINES.intro }); sfx("select"); draw(); }
    const onMove = (e) => { const p = toView(e); if (p) S.aim = [Math.max(10, Math.min(630, p[0])), Math.max(8, Math.min(282, p[1]))]; };
    const onDown = (e) => {
      const b = e.target.closest && e.target.closest("button[data-b]");
      if (b) { const id = b.dataset.b;
        if (id === "off") finish(); else if (id === "again") again(); else if (id === "throw") throwDart();
        return; }
      if (e.target.closest && e.target.closest("svg.dsvg")) { onMove(e); throwDart(); }
    };
    const onKey = (e) => {
      if (exitKey(e, S.done, finish)) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (S.done) finish(); else throwDart(); }
    };
    function finish() {
      clearInterval(tick); window.removeEventListener("pointermove", onMove); el.removeEventListener("pointerdown", onDown);;
      window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = ""; resolve({ best, total: S.total });
    }
    window.addEventListener("pointermove", onMove); el.addEventListener("pointerdown", onDown);;
    window.addEventListener("keydown", onKey);
    draw();
    window.DARTS = { S, throwDart, score };   // for scripted tests
  });
}
