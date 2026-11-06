// THE NOD (Act III, the faculty meeting). Quorum reads motions; the six senior faculty nod in unison whenever the motion
// matches the one from two motions ago (a 2-back). WATCH: twelve scripted motions while Gus guesses wrong in useful ways.
// PREDICT: whisper NOW before they nod; hits and false alarms, scored like the real task. Then Quorum slumps, and the
// meeting carries on. Drawn as a bar over the room; the room's faculty heads are posed through onPose(0 | 1).
// Resolves { hits, misses, fa, cr, dprime, tries }.
const M = {
  A: "TO APPROVE THE MINUTES", B: "TO FUND THE ESPRESSO MACHINE", C: "TO FORM A COMMITTEE ON COMMITTEES", D: "TO RENAME THE ATRIUM",
  E: "TO RATIFY THE BUDGET", F: "TO TABLE THE PREVIOUS MOTION", G: "TO DEFER NEW BUSINESS", H: "TO EXTEND JOURNAL CLUB BY TEN MINUTES",
  I: "TO RECOGNIZE DR. VALU'S ACHIEVEMENT", J: "TO PURCHASE A NEW GAVEL", K: "TO KEEP NO MINUTES OF THIS MEETING", L: "TO WELCOME THIS YEAR'S INVITEES",
};
// watch phase: nods at 3, 7, 9, 12 (gaps of 4, 2, 3); money motions (B, E, J) mostly get nothing; E repeats at 8 with no nod
export const WATCH = "ABAECFCECJGJ".split("");
const WATCH_LINES = {
  3: ["NELL", "They nodded. All six. Same frame."],
  4: ["GUS", "Right after the espresso money. They nod at money."],
  8: ["NELL", "The budget came back. Nothing. So it's not money, and it's not repeats."],
  9: ["GUS", "Every third motion?"],
  10: ["NELL", "Gaps of four, then two. There's no rhythm."],
};
const SOLVED = ["NELL", "Wait. Every time, the motion came back after exactly one other. They're answering the motion from two ago."];
export function makeSeq(len = 16, rnd = Math.random) {
  const keys = Object.keys(M), s = [];
  const any = (bad) => { let k; do k = keys[Math.floor(rnd() * keys.length)]; while (bad.includes(k)); return k; };
  for (let i = 0; i < len; i++) {
    const r = rnd();
    if (i >= 2 && r < .32 && s[i - 2] !== s[i - 1]) s.push(s[i - 2]);                                   // target
    else if (i >= 3 && r < .45 && s[i - 3] !== s[i - 1] && s[i - 3] !== s[i - 2]) s.push(s[i - 3]);      // 3-back lure
    else s.push(any([s[i - 1], s[i - 2]].filter(Boolean)));
  }
  return s;
}
const isT = (s, i) => i >= 2 && s[i] === s[i - 2];
// d' with a log-linear correction
function z(p) { // inverse normal CDF (Acklam's approximation, enough for a notebook joke)
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924],
    b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857],
    c = [-.00778489400243029, -.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878],
    d = [.00778469570904146, .32246712907004, 2.445134137143, 3.75440866190742], pl = .02425;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - pl) return -z(1 - p);
  const q = p - .5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
export const dprime = (h, m, fa, cr) => z((h + .5) / (h + m + 1)) - z((fa + .5) / (fa + cr + 1));

export function nod(el, { onPose = () => {}, onQuorum = () => {}, score = () => {}, pace = 2600, seed } = {}) {
  return new Promise(resolve => {
    let reader = "QUORUM", phase = "watch", log = [], coach = ["GUS", "Six of them. Watch their heads, not his mouth."], timers = [], nowArmed = false, cur = null;
    const T = { hits: 0, misses: 0, fa: 0, cr: 0, tries: 0 };
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    function draw() {
      const col = (w) => w === "GUS" ? "B" : w === "NELL" ? "G" : "W";
      el.innerHTML = `<div class="nodbar">
        <div class="motion">${cur ? `<span class="who" style="background:var(--${reader === "QUORUM" ? "R" : "V"})">${reader}</span>
          <span class="mn">MOTION ${cur.n}:</span> ${esc(M[cur.k])}` : ""}</div>
        <div class="coachline"><span class="who" style="background:var(--${col(coach[0])})">${coach[0]}</span> <span style="color:var(--${col(coach[0])})">${esc(coach[1])}</span></div>
        <div class="nlog"><div class="lt">NELL'S NOTES</div>${log.slice(-6).map(l => `<div class="${l.nod ? "y" : ""}">${l.n}. ${esc(M[l.k].replace(/^TO /, ""))}${l.nod ? " <b>NOD</b>" : ""}</div>`).join("")}</div>
        <div class="ctl">${phase === "predict" || phase === "encore" ? `<button data-b="now" ${nowArmed ? "" : "disabled"}>NOW. <small>(SPACE)</small></button>` : ""}
          ${phase === "predict" ? `<span class="tally">HITS ${T.hits} · MISSES ${T.misses} · FALSE ALARMS ${T.fa}</span>` : ""}
          ${phase === "done" ? `<button data-b="end">ADJOURN?</button>` : ""}</div></div>`;
    }
    // play one motion: show it, nod (if a 2-back match) partway through, then log it
    function motion(seq, i, n, onEnd, lines) {
      const k = seq[i], target = isT(seq, i); cur = { k, n, target, called: false, nodded: false };
      nowArmed = phase !== "watch"; if (lines && lines[i]) coach = lines[i]; draw();
      if (target) later(() => { cur.nodded = true; nowArmed = phase === "encore"; onPose(1); later(() => onPose(0), 520); draw(); }, pace * .62);
      later(() => {
        if (phase === "predict") { if (target) cur.called ? 0 : T.misses++; else if (!cur.called) T.cr++; }
        log.push({ k, n, nod: target }); onEnd();
      }, pace);
    }
    function run(seq, phaseName, startN, lines, done) {
      phase = phaseName; let i = 0;
      const step = () => { if (i >= seq.length) { done(); return; } motion(seq, i, startN + i, () => { i++; step(); }, lines); };
      step();
    }
    function now() {
      if (!cur || !nowArmed) return;
      nowArmed = false;
      if (phase === "encore") { coach = ["GUS", cur.target ? "…and they nodded." : "Nothing. He's dead and they're still right."]; draw(); return; }
      cur.called = true;
      if (cur.target && !cur.nodded) { T.hits++; coach = ["GUS", ["Called it.", "Yes.", "Again. Called it.", "Nell, that's not a coincidence."][Math.min(T.hits - 1, 3)]]; }
      else if (cur.target) coach = ["GUS", "That's not a prediction, that's a reaction. Before they move."];
      else { T.fa++; coach = ["GUS", "No. Nothing came back after one other. Don't guess."]; }
      draw();
    }
    function predict() {
      T.tries++; Object.assign(T, { hits: 0, misses: 0, fa: 0, cr: 0 });
      const seq = makeSeq(14, seed ? mulberry(seed + T.tries) : Math.random), targets = seq.filter((_, i) => isT(seq, i)).length;
      coach = ["GUS", "Prove it. Whisper NOW right before they nod. Only then."]; draw();
      later(() => run(seq, "predict", 13, null, () => {
        if (T.hits >= Math.max(3, targets - 1) && T.fa <= 1) {
          score("nodCrack", 3); score("nodCalls", Math.min(6, T.hits));
          coach = ["GUS", "They're not listening. They're answering."]; phase = "post"; cur = null; draw();
          later(quorum, 2600);
        } else { coach = ["GUS", `${T.hits} of ${targets}, ${T.fa} wrong. Again. Slower.`]; phase = "post"; cur = null; draw(); later(predict, 2600); }
      }), 2200);
    }
    function quorum() {
      onQuorum(); reader = "ETHEL"; coach = ["NELL", "Gus. Quorum isn't moving."]; draw();
      later(() => { coach = ["GUS", "Nobody's moved to adjourn. So she's reading the next motion."]; draw();
        later(() => run(makeSeq(6), "encore", 27 + Math.floor(Math.random() * 3), null, () => {
          phase = "done"; cur = null; coach = ["NARRATOR", "The meeting continues for forty minutes. The faculty never miss a nod."]; draw();
        }), 2600); }, 2600);
    }
    function finish() {
      timers.forEach(clearTimeout); onPose(0);
      el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey);
      el.classList.remove("show", "nodmode"); el.innerHTML = "";
      resolve({ ...T, dprime: dprime(T.hits, T.misses, T.fa, T.cr) });
    }
    const onClick = (e) => { const b = e.target.closest && e.target.closest("button[data-b]"); if (!b || b.disabled) return;
      if (b.dataset.b === "now") now(); if (b.dataset.b === "end") finish(); };
    const onKey = (e) => { if (e.code === "Space" || e.key === "n" || e.key === "N") { e.preventDefault(); now(); } };
    el.classList.add("show", "nodmode"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
    later(() => run(WATCH, "watch", 1, WATCH_LINES, () => { cur = null; coach = SOLVED; phase = "post"; draw(); later(predict, 4200); }), 1600);
  });
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
