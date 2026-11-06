// THE NOD (Act III, the faculty meeting). Quorum reads motions; the six senior faculty nod in unison whenever the motion
// matches the one from two motions ago (a 2-back). WATCH: ten scripted motions while Gus guesses wrong in useful ways,
// then Nell states the rule and Gus states the controls. PREDICT: runs of eight motions (three repeats), slower, with
// the nod late in each motion; whisper NOW before they nod. Pass: all but one repeat, at most one wrong call. Every
// mistake is explained; the hint ladder (2 mistakes: "TWO AGO" underlined in the notes; 4: Gus elbows you on each
// repeat; 3 failed runs: Gus waves it through, without nodCrack). Then Quorum slumps, and the meeting carries on
// (ADJOURN? any time). Drawn as a bar over the room; the room's faculty heads are posed through onPose(0 | 1).
// Resolves { hits, misses, fa, cr, dprime, tries }.
const M = {
  A: "TO APPROVE THE MINUTES", B: "TO FUND THE ESPRESSO MACHINE", C: "TO FORM A COMMITTEE ON COMMITTEES", D: "TO RENAME THE ATRIUM",
  E: "TO RATIFY THE BUDGET", F: "TO TABLE THE PREVIOUS MOTION", G: "TO DEFER NEW BUSINESS", H: "TO EXTEND JOURNAL CLUB BY TEN MINUTES",
  I: "TO RECOGNIZE DR. VALU'S ACHIEVEMENT", J: "TO PURCHASE A NEW GAVEL", K: "TO KEEP NO MINUTES OF THIS MEETING", L: "TO WELCOME THIS YEAR'S INVITEES",
};
// watch phase: nods at 3, 7, 9 (gaps of 4, 2); money motions (B, E, J) get nothing; E repeats at 8 with no nod
export const WATCH = "ABAECFCECJ".split("");
const WATCH_LINES = {
  3: ["NELL", "They nodded. All six. Same frame."],
  4: ["GUS", "Right after the espresso money. They nod at money."],
  8: ["NELL", "The budget came back. Nothing. So it's not money, and it's not repeats."],
  9: ["NELL", "Gaps of four, then two. There's no rhythm. So what are they nodding at?"],
};
const SOLVED = [["NELL", "Wait. Every time, the motion came back after exactly one other. They're answering the motion from two ago."],
  ["GUS", "Then prove it. When the motion is the same as the one TWO before it, hit NOW (or SPACE) before the heads move. Otherwise, nothing."]];
// one practice run: eight motions, three of them repeats of the motion two before, one a three-back lure. The positions
// rotate between tries so nobody can learn them, but every run is continuous with the notes on screen (the motion two
// ago may be the last one of the previous run), so what you see is what counts.
const PLANS = [{ t: [2, 4, 7], lure: [6] }, { t: [3, 5, 6], lure: [2] }, { t: [2, 5, 7], lure: [4] }, { t: [3, 4, 7], lure: [6] }];
export function planSeq(prev, plan, rnd = Math.random) {
  const keys = Object.keys(M), s = [], len = 8;
  for (let i = 0; i < len; i++) {
    const f = [...prev, ...s], j = f.length, b1 = f[j - 1], b2 = f[j - 2], b3 = f[j - 3];
    if (plan.t.includes(i) && b2) { s.push(b2); continue; }
    if (plan.lure.includes(i) && b3 && b3 !== b2 && b3 !== b1) { s.push(b3); continue; }
    let k; do k = keys[Math.floor(rnd() * keys.length)]; while (k === b1 || k === b2 || k === b3); s.push(k);
  }
  return s;
}
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

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function nod(el, { onPose = () => {}, onQuorum = () => {}, score = () => {}, pace = 2600, seed } = {}) {
  return new Promise(resolve => {
    // the practice runs go slower than the watching, and the heads move late in each motion, so there's time to compare
    const PACE_P = Math.round(pace * 1.3), NOD_AT = .72;
    let reader = "QUORUM", phase = "watch", log = [], coach = ["GUS", "Six of them. Watch their heads, not his mouth."], timers = [], nowArmed = false, cur = null;
    const T = { hits: 0, misses: 0, fa: 0, cr: 0, tries: 0 };
    let errs = 0, fails = 0, mark = false, elbow = false;    // the hint ladder: mistakes across runs, failed runs
    const later = (f, ms) => timers.push(setTimeout(f, ms));
    const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const short = (k) => M[k].replace(/^TO /, "");
    const twoAgo = () => log.length >= 2 ? log[log.length - 2].k : null;
    let spoken = null, read = null;
    function draw() {
      // a voice tick for each new coach line, and one for the reader as each motion goes up
      if (coach !== spoken) { spoken = coach; window.SFX && window.SFX.voice(coach[0], true); }
      if (cur && cur !== read) { read = cur; window.SFX && window.SFX.voice(reader, true); }
      const col = (w) => w === "GUS" ? "B" : w === "NELL" ? "G" : "W";
      // hint: once Nell has slipped twice, Gus underlines the motion from two ago in her notes
      const shown = log.slice(-6), markAt = mark && cur && phase === "predict" ? shown.length - 2 : -1;
      el.innerHTML = `<div class="nodbar">
        <div class="motion">${cur ? `<span class="who" style="background:var(--${reader === "QUORUM" ? "R" : "V"})">${reader}</span>
          <span class="mn">MOTION ${cur.n}:</span> ${esc(M[cur.k])}` : ""}</div>
        <div class="coachline"><span class="who" style="background:var(--${col(coach[0])})">${coach[0]}</span> <span style="color:var(--${col(coach[0])})">${esc(coach[1])}</span></div>
        <div class="nlog"><div class="lt">NELL'S NOTES</div>${shown.map((l, j) => `<div class="${l.nod ? "y" : ""}"${j === markAt ? ` style="color:var(--A)"` : ""}>${l.n}. ${esc(short(l.k))}${l.nod ? " <b>NOD</b>" : ""}${j === markAt ? " ← TWO AGO" : ""}</div>`).join("")}</div>
        <div class="ctl">${phase === "predict" || phase === "encore" ? `<button data-b="now" ${nowArmed ? "" : "disabled"}>NOW. <small>(SPACE)</small></button>` : ""}
          ${phase === "predict" ? `<span class="tally">SAME AS TWO AGO? NOW. · CALLED ${T.hits} · MISSED ${T.misses} · WRONG ${T.fa}</span>` : ""}
          ${phase === "encore" || phase === "done" ? `<button data-b="end">ADJOURN?</button>` : ""}</div></div>`;
    }
    // play one motion: show it, nod (if it repeats the motion two ago) partway through, then log it. Targets are
    // judged against the notes on screen, so a run picks up where the last one left off.
    function motion(seq, i, n, onEnd, lines, P) {
      const k = seq[i], prev = twoAgo(), target = k === prev; cur = { k, n, target, prev, called: false, nodded: false, late: false };
      nowArmed = phase !== "watch"; if (lines && lines[i]) coach = lines[i]; draw();
      const me = cur;
      if (target && elbow && phase === "predict") later(() => { if (cur === me && !me.called) { coach = ["GUS", `(Elbow.) "${short(k)}". Same as two ago. NOW.`]; draw(); } }, P * .25);
      if (target) later(() => { me.nodded = true; onPose(1); sfx("tock"); later(() => onPose(0), 520); draw(); }, P * NOD_AT);
      later(() => {
        if (phase === "predict") {
          if (target && !me.called) { T.misses++; slip(["GUS", `They nodded. "${short(k)}" was two ago, too. That one was a NOW.`]); }
          else if (target && me.late) T.misses++;
          else if (!target && !me.called) T.cr++;
        }
        log.push({ k, n, nod: target }); onEnd();
      }, P);
    }
    function run(seq, phaseName, startN, lines, done, P = pace) {
      phase = phaseName; let i = 0;
      const step = () => { if (i >= seq.length) { done(); return; } motion(seq, i, startN + i, () => { i++; step(); }, lines, P); };
      step();
    }
    // a mistake: say why, then climb the hint ladder (2: underline two-ago in the notes; 4: Gus elbows you on each one)
    function slip(line) {
      errs++; sfx("bad"); coach = line;
      // the ladder's announcement waits until the mistake has been read, and never talks over a newer line
      const then = (l) => later(() => { if (coach === line) { coach = l; draw(); } }, 1700);
      if (errs === 2 && !mark) { mark = true; then(["GUS", "Here. I've underlined the motion from two ago in your notes. Just compare the new one with that."]); }
      else if (errs === 4 && !elbow) { elbow = true; then(["GUS", "Okay. I'll elbow you when it's one. You say NOW. Nobody here will notice. Nobody here notices anything."]); }
      draw();
    }
    function now() {
      if (!cur || !nowArmed) return;
      if (phase === "encore") { nowArmed = false; sfx("whisper"); coach = ["GUS", cur.target ? "…and they nodded." : "Nothing. He's dead and they're still right."]; draw(); return; }
      if (phase !== "predict" || cur.called) return;
      cur.called = true; nowArmed = false; sfx("whisper");
      if (cur.target && !cur.nodded) { T.hits++; sfx("good"); coach = ["GUS", ["Called it.", "Yes. Before they moved.", "Again. Called it.", "Nell, that's not a coincidence."][Math.min(T.hits - 1, 3)]]; draw(); }
      else if (cur.target) { cur.late = true; slip(["GUS", "Right motion, but they'd already nodded. That's a reaction, not a prediction. Say it before the heads move."]); }
      else { T.fa++; const k3 = log.length >= 3 ? log[log.length - 3].k : null;
        slip(["GUS", cur.k === k3 ? `No. "${short(cur.k)}" came back after TWO others. Three ago doesn't count. Only two.`
          : `No. Two ago was "${short(cur.prev || cur.k)}". This one's "${short(cur.k)}". Different motion: say nothing.`]); }
    }
    function predict() {
      T.tries++; Object.assign(T, { hits: 0, misses: 0, fa: 0, cr: 0 });
      const rnd = seed ? mulberry(seed + T.tries) : Math.random, plan = PLANS[(T.tries - 1) % PLANS.length];
      const prev = log.slice(-2).map(l => l.k), seq = planSeq(prev, plan, rnd), targets = plan.t.length, need = targets - 1;
      phase = "post"; cur = null;
      coach = T.tries === 1 ? ["GUS", `Eight motions. Call at least ${need} of the repeats before they nod, with at most one wrong call.`]
        : ["GUS", `Again. Eight more. ${need} of ${targets} before they nod, one wrong call at most. Watch the note from two ago.`];
      draw();
      later(() => run(seq, "predict", log.length + 1, null, () => {
        phase = "post"; cur = null;
        if (T.hits >= need && T.fa <= 1) {
          score("nodCrack", 3); score("nodCalls", Math.min(6, 2 * T.hits));   // three repeats a round now; each call counts double, so the max stays 6
          sfx("chime"); coach = ["GUS", `${T.hits} of ${targets}. They're not listening. They're answering.`]; draw();
          later(quorum, 2800);
        } else if (++fails >= 3) {
          // nobody gets stuck in a faculty meeting forever (except the faculty)
          sfx("cancel"); coach = ["GUS", "Close enough. You've seen it: same motion as two ago, six nods. Every time. Nobody's that agreeable awake."]; draw();
          later(quorum, 3400);
        } else {
          sfx("bad"); mark = true;
          coach = ["GUS", `${T.hits} of ${targets} called, ${T.fa} wrong. Need ${need}, and one wrong at most. ${T.misses ? "You let some go by." : "You called some that weren't."} Again.`]; draw();
          later(predict, 3400);
        }
      }, PACE_P), 3000);
    }
    function quorum() {
      onQuorum(); sfx("dread"); reader = "ETHEL"; coach = ["NELL", "Gus. Quorum isn't moving."]; cur = null; draw();
      later(() => { coach = ["GUS", "Nobody's moved to adjourn. So she's reading the next motion."]; draw();
        const prev = log.slice(-2).map(l => l.k), seq = planSeq(prev, { t: [2, 4], lure: [] }).slice(0, 5);
        later(() => run(seq, "encore", log.length + 1, null, () => {
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
    later(() => run(WATCH, "watch", 1, WATCH_LINES, () => {
      cur = null; coach = SOLVED[0]; phase = "post"; draw();
      later(() => { coach = SOLVED[1]; draw(); later(predict, 3800); }, 3400);
    }), 1600);
    // test hook
    el.__nod = { T, get log() { return log; }, get cur() { return cur; }, get phase() { return phase; }, now, get hints() { return { errs, fails, mark, elbow }; } };
  });
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
