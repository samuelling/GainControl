// THE ECHO (Act IV, THE REHEARSAL; Act V, THE INDUCTION). The Round Table's oldest ritual is a working-memory test.
// Phrases of peer-review boilerplate come around the table, one per turn: say SECONDED (S or SPACE) when the phrase is
// the one from two turns ago (three, once the Corresponding Author advances the Echo). One task, one answer. The seats
// still light as members speak, but only as staging: where something is said doesn't matter, only what.
// Silence is correct otherwise. Nobody ever calls it a dual 2-back.
//
//   echo(el, { mode: "rehearsal" | "induction", pace, seed, score, die, onSeat, onTurn, blip, morris })
//     rehearsal → { passed: true, dprime, hits, misses, fa, cr, restarts }  (Iris's office: one drill of phrases, can't fail)
//     induction → { passed: true, dprime, advanced, hits, misses, fa, cr, tries }  (B3: hoods turn; three = death)
//     either    → { passed: false, quit: true } if the player leaves with Esc, Esc.
//
// Structure. Each rehearsal drill is two LEGS with a short scene between them (sherry, the kettle, a toast); Iris
// changes the phrase set at a leg (peer review → grant panel → sherry toasts) and the tempo inside a leg (she speeds
// up, then slows down to taunt). The induction is three READINGS, each with its own camera (the wide ring, close on
// Quorum's end, an overhead isometric seating plan) and speaking order (round the table, clustered at the head,
// open floor), with interludes between them. Every leg or reading starts a fresh Echo: its first n turns can't match.
// CATCH EVENTS (the kettle, the telephone, the gavel, a lamp flickering…) happen between turns. They are noise
// trials: answering one is a false alarm on that stream; staying silent is a correct rejection. Interludes aren't
// scored and skip with Enter, Space or a click. opts.morris (opt-in): Morris's ear twitches in a vent above the
// table on some matches, and he may sneeze in the third reading.
import { seg, segC, segW, chip, chipW, arcs, star4, perspective, shell } from "../gfx.js";
import { AUD, morrisPeek } from "../figures.js";
import { irisSeated } from "../cast/act3a.js";
import { irisFigure } from "../cast/act5b.js";
import { hoodStanding } from "../cast/act5a.js";

/* ---------------- words ---------------- */
export const PHRASES = [
  "THE AUTHORS SHOULD CONSIDER…", "THE SAMPLE SIZE IS SMALL", "THE NOVELTY IS UNCLEAR", "PLEASE CITE THE RELEVANT WORK",
  "FURTHER RESEARCH IS NEEDED", "THE EFFECT MAY BE AN ARTIFACT", "THE DISCUSSION OVERREACHES", "THE FIGURES ARE HARD TO READ",
  "THE LIMITATIONS ARE NOT ADDRESSED", "THIS IS OUTSIDE THE SCOPE OF THE JOURNAL", "THE CONCLUSIONS DO NOT FOLLOW", "I REMAIN UNCONVINCED",
];
export const GRANT = [
  "THE APPROACH IS OVERLY AMBITIOUS", "THE AIMS ARE INTERDEPENDENT", "THE PRELIMINARY DATA ARE PRELIMINARY", "THE INNOVATION IS INCREMENTAL",
  "THE ENVIRONMENT IS SUPPORTIVE", "ENTHUSIASM WAS DAMPENED", "THE RIGOR IS NOT DESCRIBED", "THE BUDGET IS NOT JUSTIFIED",
  "THE SIGNIFICANCE IS UNCLEAR", "THE PITFALLS ARE NOT DISCUSSED", "ALTERNATIVE STRATEGIES ARE LACKING", "NOT DISCUSSED AT THE MEETING",
];
export const TOASTS = [
  "TO THE BOARD", "TO THE MINUTES", "TO 1962", "TO ABSENT FRIENDS", "TO THE SECOND REVIEWER", "TO TENURE, AND AFTER",
  "TO THE CORRESPONDING AUTHOR", "TO FURTHER RESEARCH", "TO THE IMPACT FACTOR", "TO THE OLD MAGNET", "TO NOVELTY, WHEREVER IT IS", "TO OUR HEALTH, SUCH AS IT IS",
];
const SETS = { PEER: ["PEER REVIEW", PHRASES], GRANT: ["GRANT PANEL", GRANT], TOAST: ["SHERRY TOASTS", TOASTS] };
const COL = { IRIS: "V", QUORUM: "R", NELL: "G", NARRATOR: "W", "A HOODED MEMBER": "V" };
const L = (who, text) => [who, text];
const R = {
  introA: [
    L("IRIS", "The Echo. Your lot call it a 2-back: Kirchner's memory test, 1958. We stole it in 1962 and added sherry."),
    L("IRIS", "Miss two and they look at you. Miss three and you're quarry."),
    L("IRIS", "I'll be the Board. When the same words come back from two turns ago, you say SECONDED. Press S. Otherwise you sit there and look tenured."),
    L("NELL", "And the staple gun?"),
    L("IRIS", "Motivation."),
  ],
  goA: L("IRIS", "Peer review. From the top."),
  again: [
    L("IRIS", "Again. In 1974 I did this hungover."),
    L("IRIS", "Again. Juggling, dear. One phrase lands, the oldest one drops. You only ever hold two."),
    L("IRIS", "Again. I have outlived three deans. I can outlive this."),
    L("IRIS", "Again. In 1974 I did this hungover. In 1975 I did it on purpose."),
  ],
  fa: [L("IRIS", "That one didn't come back around. That was you being eager."), L("IRIS", "Nothing came back. Eagerness gets you noticed."),
    L("IRIS", "No. Saying it every time catches everything and proves nothing.")],
  miss: [L("IRIS", "It came back and you let it walk right past you."), L("IRIS", "That was two back. You were somewhere else."),
    L("IRIS", "They'd have seen that. They see everything except their own data.")],
  hit: [L("IRIS", "Mm."), L("IRIS", "Correct. Don't look pleased, they hate that."), L("IRIS", "Good."), L("IRIS", "Yes. Like a man with a named chair.")],
  passA: [L("IRIS", "Fine. You'd pass for an associate professor. From the back of the room.")],
  introC: [
    L("IRIS", "Again. The grant panel, then the toasts. The Board ends every meeting with toasts; it's the only item anyone remembers."),
    L("IRIS", "Same rule. Same words as two turns ago: SECONDED. Faster, this time."),
  ],
  goC: L("IRIS", "Grant panel. Begin."),
  passC: [
    L("IRIS", "Their founders published that the Echo makes you smarter. 1979. Nobody has ever managed it again."),
    L("NELL", "Does it? Make you smarter?"),
    L("IRIS", "It makes you better at the Echo. And it makes them agree. Neither one is smart."),
    L("IRIS", "One more thing. If the man at the head of the table suspects someone, he 'advances the Echo.' Three back. Nobody likes that."),
    L("IRIS", "Wear the hood low. Answer late rather than wrong. And don't look at me if you see me."),
  ],
  // tempo: Iris hurries, then slows down to taunt
  fast: [L("IRIS", "Faster. The Board doesn't wait for you to find your glasses."), L("IRIS", "Keep up, dear. Quorum talks like this after his second sherry."),
    L("IRIS", "Quicker. Tenure is a marathon. This is the sprint at the end of it.")],
  slow: [L("IRIS", "Slower now. Savour it."), L("IRIS", "Let's... take... our... time."), L("IRIS", "I could do this all afternoon. In 1962, I did.")],
  // the anecdotes between legs
  yarn62: [L("IRIS", "1962. Sherry in teacups, so the Dean wouldn't notice. The Dean was the one pouring."),
    L("IRIS", "1962. A man from Chemistry seconded a sneeze. They still send him the minutes. He's been dead since 1970.")],
  yarn74: [L("IRIS", "1974. They ran it three back for an hour. Somebody's hood caught a candle. The motion carried anyway."),
    L("IRIS", "1974. I walked out halfway through the third reading. Nobody stopped me. They were all still counting.")],
  // catch events: things that make a noise and are not a motion
  evt: { kettle: "(THE KETTLE WHISTLES.)", phone: "(THE TELEPHONE RINGS.)", sneeze: "(SOMETHING IN THE FILING CABINET SNEEZES.)",
    canister: "(A CANISTER RATTLES IN THE WALL.)", misfire: "(THE STAPLE GUN GOES OFF BY ITSELF.)",
    gavel: "(THE GAVEL. TOK. TOK.)", flicker: "(THE LATE MEMBER'S LAMP FLICKERS.)", sneezeI: "(A SNEEZE, SOMEWHERE IN THE CEILING.)" },
  catchFA: { kettle: L("IRIS", "That was the kettle, dear. The kettle is not on the Board."), phone: L("IRIS", "That's the telephone. Nobody seconds the telephone."),
    sneeze: L("IRIS", "That was a rat. In my filing cabinet. We'll discuss it later. Don't second it."), canister: L("IRIS", "The wall doesn't get a vote."),
    misfire: L("IRIS", "The gun went off by itself. It does that. It isn't a motion.") },
  catchOK: [L("IRIS", "Good. Ignore it. They'll try worse than a kettle."), L("IRIS", "Mm. Not everything that makes a noise is a motion."), L("IRIS", "Good. Sit there and look tenured.")],
  introI: [
    L("NARRATOR", "Twelve lamps. Twelve hoods. A ring of iron the size of a carousel, and the faint smell of sherry."),
    L("QUORUM", "The Echo. As it was in 1962, and as it shall be."),
    L("NELL", "Same words as two back: SECONDED. Otherwise, silence. Otherwise, silence."),
  ],
  recapI: [L("NELL", "(Iris's office, in my head. Turn one: nothing to compare.)"), L("NELL", "(Turn two: nothing yet.)"),
    L("NELL", "(Turn three: the words came back from two turns ago. SECONDED.)"), L("NELL", "(Turn four: two back again. SECONDED.)"),
    L("NELL", "(Turn five: new words. Sit still.)"), L("NELL", "(Turn six: the same as ONE back, not two. The trap. Sit still.)")],
  retryI: [L("NARRATOR", "The lamps go dark. The Board settles its robes. Someone pours another sherry."), L("QUORUM", "The Echo. Again, from the beginning.")],
  turn: [L("NARRATOR", "A hood turns toward you."), L("NARRATOR", "That hood is looking straight at you now."), L("NARRATOR", "Another hood turns."),
    L("NARRATOR", "Two of them are looking at you now."), L("NARRATOR", "A third hood turns. Slowly."), L("NARRATOR", "Three hoods.")],
  relax: L("NARRATOR", "A hood turns back to the table. Someone coughs."),
  advance: L("QUORUM", "Let us advance the Echo."),
  advNell: L("NELL", "Three back. Juggle three. One lands, the oldest drops."),
  still: L("QUORUM", "The Echo remains advanced."),
  retreat: L("QUORUM", "The Echo returns to its customary depth."),
  passI: [L("QUORUM", "The motion carries."),
    L("NARRATOR", "The hoods face the table again. Out there it's a 2-back, a working-memory test, scored on hits and false alarms. In here it's tradition. You passed both.")],
  death: "The authors have failed to address the reviewers' concerns.",
};
const pick = (a, i) => a[i % a.length];

/* ---------------- sequences and scoring ---------------- */
// one item for turn i = s.length: a target (the item n back) about pT of the time, a lure (n-1 or n+1 back, never a
// target) about pL of the time, otherwise a fresh item that isn't the last one or the n-back one. `fresh(tgt, last)`
// (optional) chooses the fresh item instead, e.g. the next seat round the table; it must avoid tgt and last too.
export function nextItem(s, n, nItems, rnd, pT = .3, pL = .2, fresh = null) {
  const i = s.length, back = (k) => s[i - k], tgt = i >= n ? back(n) : -1, r = rnd();
  if (tgt >= 0 && r < pT) return tgt;
  if (r < pT + pL) {
    const lures = [n - 1, n + 1].filter(k => k >= 1 && i >= k).map(back).filter(x => x !== tgt);
    if (lures.length) return lures[Math.floor(rnd() * lures.length)];
  }
  if (fresh) return fresh(tgt, back(1));
  let k, g = 0; do k = Math.floor(rnd() * nItems); while ((k === tgt || k === back(1)) && ++g < 60);
  return k;
}
export const isTarget = (s, i, n) => i >= n && s[i] === s[i - n];
// a whole stream with a sensible target count (about 30% of the turns that can be targets)
export function makeStream(len, n, nItems, rnd) {
  for (let g = 0; ; g++) {
    const s = []; for (let i = 0; i < len; i++) s.push(nextItem(s, n, nItems, rnd));
    const t = s.filter((_, i) => isTarget(s, i, n)).length, base = len - n;
    if ((t >= Math.round(base * .24) && t <= Math.round(base * .38)) || g > 200) return s;
  }
}
function z(p) { // inverse normal CDF (Acklam)
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924],
    b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857],
    c = [-.00778489400243029, -.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878],
    d = [.00778469570904146, .32246712907004, 2.445134137143, 3.75440866190742], pl = .02425;
  if (p < pl) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - pl) return -z(1 - p);
  const q = p - .5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
// d′ with the log-linear correction (so a perfect run is finite)
export const dprime = (h, m, fa, cr) => z((h + .5) / (h + m + 1)) - z((fa + .5) / (fa + cr + 1));
const tally = () => ({ hits: 0, misses: 0, fa: 0, cr: 0 });
const addT = (a, b) => { for (const k in b) a[k] += b[k]; return a; };
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// where the catch events fall: after turn j (0-based within a run of `len`), never in the first two turns or on the
// last one, and at least three turns apart
function placeCatches(len, kinds, rnd, offset = 0) {
  const at = new Map(), ok = []; for (let j = 2; j < len - 1; j++) ok.push(j);
  for (const kind of kinds) {
    const free = ok.filter(j => [...at.keys()].every(u => Math.abs(u - offset - j) >= 3));
    if (free.length) at.set(offset + free[Math.floor(rnd() * free.length)], kind);
  }
  return at;
}

/* ---------------- the lessons: worked examples, one turn per click ---------------- */
// rows: [{ label, items: [...] }]; each step k shows turns 0..k, the current one lit, an arc back n turns (green when it
// matches) and the verdict; `trap` steps also show the one-back repeat that doesn't count.
const LESSON_P = ["THE SAMPLE SIZE IS SMALL", "THE NOVELTY IS UNCLEAR", "THE SAMPLE SIZE IS SMALL", "THE NOVELTY IS UNCLEAR", "FURTHER RESEARCH IS NEEDED", "FURTHER RESEARCH IS NEEDED"];
export const LESSONS = {
  phrase: { n: 2, rows: [{ label: "WHAT IS SAID", key: "S", verb: "SECONDED", items: LESSON_P }], lines: [
    L("IRIS", "Watch first. Turn one: a phrase. There's nothing two turns back yet, so you say nothing."),
    L("IRIS", "Turn two. Still nothing two turns back. Nothing."),
    L("IRIS", "Turn three. Look back TWO turns: the same phrase. That's the echo. Say SECONDED. Press S."),
    L("IRIS", "Turn four. Two back is 'the novelty is unclear'. Same again. SECONDED."),
    L("IRIS", "Turn five: 'further research is needed'. Two back was 'the sample size'. Different. Nothing."),
    L("IRIS", "Turn six: 'further research' again. But it matches ONE turn back, not two. That's the trap. Nothing."),
  ], after: [L("IRIS", "So: every turn, compare it with the turn before last. Keep the last two in your head. A new one comes in, the oldest drops out. Like juggling.")] },
  three: { n: 3, rows: [{ label: "WHAT IS SAID", key: "S", verb: "SECONDED", items: ["I REMAIN UNCONVINCED", "THE NOVELTY IS UNCLEAR", "THE SAMPLE SIZE IS SMALL", "I REMAIN UNCONVINCED", "THE SAMPLE SIZE IS SMALL"] }], lines: [
    L("IRIS", "If he advances the Echo, it's three back. Turn one."),
    L("IRIS", "Turn two."),
    L("IRIS", "Turn three. Still nothing three back."),
    L("IRIS", "Turn four: the same as THREE turns ago. SECONDED."),
    L("IRIS", "Turn five: matches two back, not three. Nothing. Juggle three now."),
  ], after: [] },
};
export function lessonSVG({ kind, step, recap }) {
  const Ls = LESSONS[kind], n = Ls.n, rows = Ls.rows, two = rows.length > 1, N = rows[0].items.length, cw = 94, gap = 8;
  const x0 = 320 - (N * cw + (N - 1) * gap) / 2, ys = two ? [70, 158] : [104], ch = two ? 46 : 56;
  let o = segC(recap ? "THE ECHO, ONCE MORE" : "HOW THE ECHO WORKS", 320, 8, 9, "sW", 1.2) + segC(n === 3 ? "COMPARE EACH TURN WITH THREE TURNS AGO" : "COMPARE EACH TURN WITH TWO TURNS AGO", 320, 22, 4.6, "sA", .7);
  const verdicts = [];
  rows.forEach((r, ri) => {
    const y = ys[ri], up = ri === 0;
    o += seg(r.label, x0, y - (up ? 32 : -ch - 8), 5, "sM", .7);
    for (let k = 0; k <= step; k++) {
      const x = x0 + k * (cw + gap), now = k === step, cls = now ? "sW" : "sM";
      o += `<rect class="k ${cls}" x="${x}" y="${y}" width="${cw}" height="${ch}" style="stroke-width:${now ? 1.4 : .8}"/>` + seg(`TURN ${k + 1}`, x + 5, y + 4, 4.2, now ? "sA" : "sD", .6);
      const words = r.items[k].split(" "), lines = []; let ln = "";
      for (const w of words) { if ((ln + " " + w).trim().length > 13) { lines.push(ln.trim()); ln = w; } else ln += " " + w; } lines.push(ln.trim());
      lines.slice(0, 3).forEach((t, j) => { o += seg(t, x + 5, y + 13 + j * (two ? 10 : 12), 5.6, now ? "sW" : "sM", .8); });
    }
    if (step >= n) {
      const k = step, x = x0 + k * (cw + gap) + cw / 2, xb = x0 + (k - n) * (cw + gap) + cw / 2, hit = r.items[k] === r.items[k - n];
      const ye = up ? y : y + ch, peak = up ? y - 22 : y + ch + 22;
      o += `<path class="${hit ? "sG" : "sD dash"}" d="M${x},${ye} Q${(x + xb) / 2},${peak + (up ? -10 : 10)} ${xb},${ye}"/><path class="${hit ? "sG" : "sD"}" d="M${xb - 4},${ye + (up ? -6 : 6)} L${xb},${ye} L${xb + 5},${ye + (up ? -5 : 5)}"/>`;
      o += seg(`${n} BACK`, (x + xb) / 2 - 10, peak + (up ? -18 : 10), 5, hit ? "sG" : "sD", .7);
      if (r.items[k] === r.items[k - 1] && !hit) o += `<path class="hl sR dash" d="M${x - 10},${ye} Q${x - (cw + gap) / 2 - 5},${peak + (up ? 2 : -2)} ${x - cw - gap + 10},${ye}"/>` + seg("ONE BACK DOESN'T COUNT", x - cw - gap - 4, up ? y + ch + 6 : y - 12, 5, "sR", .7);
      verdicts.push(hit ? r.verb + "  " + r.key : "");
    } else verdicts.push("");
  });
  const v = verdicts.filter(Boolean), vy = two ? 130 : 196;
  if (step >= n) o += v.length ? v.map((t, i) => chip(t, 320 - (v.length * 84) / 2 + i * 90, vy, 8, t.startsWith("SECONDED") ? "fG" : "fA")).join("") : chip("SAY NOTHING", 320 - chipW("SAY NOTHING", 8) / 2, vy, 8, "fW");
  return o;
}

/* ---------------- drawing: shared bits ---------------- */
const f1 = (v) => v.toFixed(1);
// a candle: wax stick, a flame that is ON (lit), leaning (gutter pose 1/2), or a curl of smoke (out)
function candle(x, y, h, state, pose = 0, s = 1) {
  const ty = y - h;
  let o = `<ellipse class="hl sA" cx="${f1(x)}" cy="${f1(y)}" rx="${f1(5 * s)}" ry="${f1(1.7 * s)}"/>
    <rect class="k sW" x="${f1(x - 1.7 * s)}" y="${f1(ty)}" width="${f1(3.4 * s)}" height="${f1(h)}"/>
    <path class="hl sW" d="M${f1(x - 1.7 * s)},${f1(ty + 2 * s)} L${f1(x - 1.7 * s)},${f1(ty + 5 * s)} M${f1(x + 1.7 * s)},${f1(ty + 1.5 * s)} L${f1(x + 1.7 * s)},${f1(ty + 3 * s)}"/>`;
  if (state === "out") return o + `<path class="hl sD" d="M${f1(x)},${f1(ty - 1)} C${f1(x - 2 * s)},${f1(ty - 4 * s)} ${f1(x + 2 * s)},${f1(ty - 6 * s)} ${f1(x)},${f1(ty - 9 * s)} C${f1(x - 2 * s)},${f1(ty - 12 * s)} ${f1(x + 1 * s)},${f1(ty - 14 * s)} ${f1(x)},${f1(ty - 17 * s)}"/>`;
  const lean = pose === 1 ? -3 : pose === 2 ? 3 : 0, fs = pose ? .7 * s : s;
  o += `<path class="fA" d="M${f1(x)},${f1(ty - 1)} C${f1(x - 2.6 * fs)},${f1(ty - 3 * fs)} ${f1(x - 1.4 * fs + lean * .5)},${f1(ty - 7 * fs)} ${f1(x + lean * fs)},${f1(ty - 11 * fs)} C${f1(x + 1.4 * fs + lean * .5)},${f1(ty - 7 * fs)} ${f1(x + 2.6 * fs)},${f1(ty - 3 * fs)} ${f1(x)},${f1(ty - 1)} Z"/>`;
  if (pose) o += `<path class="hl sA" d="M${f1(x - lean * 2)},${f1(ty - 6 * s)} L${f1(x - lean * 3.4)},${f1(ty - 6.5 * s)} M${f1(x - lean * 2)},${f1(ty - 9 * s)} L${f1(x - lean * 3.2)},${f1(ty - 9.5 * s)}"/>`;
  return o;
}
// the title card between readings and drills: big thin type, tiny label above
function cardSVG(c) {
  return `<path class="hl sD" d="M120,74 L520,74 M120,162 L520,162"/>` + segC(c.label, 320, 84, 5, "sM", .7)
    + segC(c.title, 320, 98, 30, "sW", 1.6) + (c.sub ? segC(c.sub, 320, 142, 6.5, "sV", .8) : "");
}
// Morris in the vent above (opt-in). tw: 0 still, 1 ear flicks, 2 ear back; sn: 1 "AH", 2 "CHOO"
function vent(x, y, tw, sn) {
  let s = `<rect class="k sM mech" x="${x - 24}" y="${y - 6}" width="48" height="10"/>`;
  for (let i = 1; i < 8; i++) s += `<path class="hl sM" d="M${x - 24 + i * 6},${y - 6} L${x - 24 + i * 6},${y + 4}"/>`;
  const ear = (ang) => `<g transform="rotate(${ang} ${x + 6} ${y + 4})"><path class="k sW" d="M${x + 2},${y + 4} C${x},${y + 13} ${x + 9},${y + 17} ${x + 12},${y + 4}"/><path class="hl sK" d="M${x + 4.5},${y + 5} C${x + 4},${y + 10} ${x + 8},${y + 12} ${x + 9.6},${y + 5}"/></g>`;
  s += ear(tw === 1 ? -28 : tw === 2 ? 14 : 0) + `<circle class="fG" cx="${x - 3}" cy="${y + 6}" r="1"/>`
    + `<path class="hl sW" d="M${x - 9},${y + 4} L${x - 13},${y + 11} M${x - 7},${y + 4} L${x - 8},${y + 12}"/>`;
  if (tw === 1) s += arcs(x + 16, y + 8, 1, "hl sW", 2, .45) + `<path class="hl sW" d="M${x + 15},${y + 16} L${x + 21},${y + 18} M${x + 13},${y + 19} L${x + 18},${y + 22}"/>`;
  if (sn) s += sn === 1 ? seg("AH...", x + 30, y - 2, 6, "sW", .8)
    : seg("CHOO", x + 30, y - 4, 10, "sW", 1.2) + star4(x - 6, y + 14, 5, "sW") + `<path class="hl sW" d="M${x - 10},${y + 16} L${x - 12},${y + 22} M${x - 4},${y + 18} L${x - 3},${y + 25} M${x + 2},${y + 16} L${x + 5},${y + 21}"/>`;
  return s;
}

/* ---------------- drawing: Iris's office ---------------- */
const VH = 250;                                    // the scene's native height (640 × 250 over the bar)
const OP = perspective(320, 92, .55, VH);
const oFloor = (k) => OP.P(0, VH, k)[1];
const CHAIRS = [["WINDOW", 120, .62], ["KETTLE", 468, .64], ["DESK", 236, .8], ["GUEST", 504, .86]]
  .map(([name, X, k]) => ({ name, X, k, x: OP.P(X, 0, k)[0], y: oFloor(k), q: k * AUD }));
// Iris on her feet: the walking figure (Act V's), without the staple gun (it lives on the desk in this scene)
const IRIS_FIG = irisFigure().replace(/<path class="k sR"[^>]*\/>|<path class="sR"[^>]*\/>|<circle class="fR"[^>]*\/>/g, "");
function irisStanding({ X, k, pose, flip }) {
  const x = OP.P(X, 0, k)[0], y = oFloor(k), q = k * AUD;
  const tf = flip > 0 ? `translate(${f1(x - 160 * q)},${f1(y - 187 * q)}) scale(${q.toFixed(3)})` : `translate(${f1(x + 160 * q)},${f1(y - 187 * q)}) scale(${(-q).toFixed(3)},${q.toFixed(3)})`;
  return `<g class="ip${pose}" transform="${tf}">${IRIS_FIG}</g>`;
}
const PHONE = (() => { const x = OP.P(-10, 0, .7)[0], q = .7 * AUD; return [x + 2, oFloor(.7) - 12 * 9 * q]; })();
function chair({ x, y, q }, cls) {
  const w = 24 * q, sh = 46 * q, d = 8 * q, bt = 104 * q;
  return `<path class="hl ${cls}" d="M${x - w + 4 * q},${y - sh - d} L${x - w + 5 * q},${y - 7 * q} M${x + w - 4 * q},${y - sh - d} L${x + w - 5 * q},${y - 7 * q}"/>
    <path class="k ${cls}" d="M${x - w + 4 * q},${y - sh - d} L${x - w + 4 * q},${y - bt + 6 * q} Q${x - w + 4 * q},${y - bt} ${x - w + 10 * q},${y - bt} L${x + w - 10 * q},${y - bt} Q${x + w - 4 * q},${y - bt} ${x + w - 4 * q},${y - bt + 6 * q} L${x + w - 4 * q},${y - sh - d} Z"/>
    <path class="hl ${cls}" d="M${x - w + 9 * q},${y - bt + 12 * q} L${x + w - 9 * q},${y - bt + 12 * q}"/>
    <polygon class="k ${cls}" points="${x - w},${y - sh} ${x + w},${y - sh} ${x + w - 4 * q},${y - sh - d} ${x - w + 4 * q},${y - sh - d}"/>
    <path class="${cls}" d="M${x - w},${y - sh} L${x - w},${y} M${x + w},${y - sh} L${x + w},${y}"/>`;
}
// a copita of sherry: the glass a hairline, the sherry a BRASS line
const glass = (x, y, s) => `<path class="hl sW" d="M${f1(x - 2.6 * s)},${f1(y - 9 * s)} C${f1(x - 3 * s)},${f1(y - 4 * s)} ${f1(x - 1.5 * s)},${f1(y - 2 * s)} ${f1(x)},${f1(y - 2 * s)} C${f1(x + 1.5 * s)},${f1(y - 2 * s)} ${f1(x + 3 * s)},${f1(y - 4 * s)} ${f1(x + 2.6 * s)},${f1(y - 9 * s)} M${f1(x)},${f1(y - 2 * s)} L${f1(x)},${f1(y + 3 * s)} M${f1(x - 2 * s)},${f1(y + 3 * s)} L${f1(x + 2 * s)},${f1(y + 3 * s)}"/>
  <path class="sA" d="M${f1(x - 2.5 * s)},${f1(y - 6 * s)} L${f1(x + 2.5 * s)},${f1(y - 6 * s)}"/>`;
function office(S) {
  let s = shell(OP, { rail: 0 });
  const fx = S.fx || {}, fk = fx.kind, fp = fx.pose || 0;
  // back wall: the window, the 1968 photo of the ring, the stopped clock; journal towers; the kettle on a cabinet
  s += `<rect class="k hl sD mech" x="176" y="64" width="58" height="56"/><path class="hl sD" d="M205,64 L205,120 M176,92 L234,92"/>
    <rect class="k hl sD mech" x="300" y="70" width="34" height="26"/><ellipse class="hl sD" cx="317" cy="83" rx="7" ry="8"/><ellipse class="hl sD" cx="317" cy="83" rx="3.5" ry="4"/>
    <circle class="hl sD" cx="378" cy="78" r="7"/><path class="hl sD" d="M378,78 L378,73 M378,78 L374,80"/>
    <rect class="k hl sD mech" x="440" y="136" width="30" height="${(oFloor(.55) - 136).toFixed(1)}"/><path class="hl sD" d="M445,146 L465,146 M445,158 L465,158"/>`;
  // the kettle: still, or whistling (steam curls in two poses, the lid jumping)
  const kw = fk === "kettle" && fp;
  s += `<path class="k hl ${kw ? "sW" : "sD"}" d="M447,136 L448,126 C448,121 458,121 458,126 L459,136 Z M448,129 L443,125"/>`;
  if (kw) {
    const up = fp % 2 ? 0 : -2;
    s += `<path class="hl sW" d="M450,${121 + up} L456,${121 + up}"/>`
      + `<path class="hl sW" d="M442,123 C437,${118 + up} 445,${113 + up} 439,${107 + up} C435,${102 + up} 441,${98 + up} 437,${93 + up} M446,120 C449,${114 - up} 444,${110 - up} 448,${104 - up}"/>`
      + arcs(463, 129, 1, "hl sW", 2, .5) + arcs(440, 131, -1, "hl sW", 2, .5) + seg(fp % 2 ? "WHEEE" : "WHEEEE", 400, 82 + up, 7, "sW", .9);
  }
  // the filing-cabinet drawer: shut, or open with a rat in it, sneezing
  if (fk === "sneeze" && fp) {
    s += `<path class="k sM mech" d="M436,141 L466,141 L470,150 L440,150 Z"/>` + morrisPeek(453, 143, .55)
      + (fp >= 2 ? seg("ACHOO", 392, 112, 9, "sW", 1.1) + star4(470, 136, 5, "sW") + `<path class="hl sW" d="M470,142 L476,146 M468,145 L471,151 M473,139 L479,139"/>` : seg("AH...", 396, 118, 6, "sW", .8));
  }
  // the telephone on top of the journals: quiet, or ringing (the handset jumps, ((( ))) )
  { const [x, y] = PHONE, ring = fk === "phone" && fp, cl = ring ? "sW" : "sD", hy = ring && fp % 2 ? -4 : 0;
    s += `<path class="k ${cl}" d="M${x - 9},${y} L${x + 9},${y} L${x + 6},${y - 7} L${x - 6},${y - 7} Z"/><circle class="hl ${cl}" cx="${x}" cy="${y - 3.5}" r="2.4"/>
      <path class="k ${cl}" d="M${x - 11},${y - 7 + hy} C${x - 11},${y - 13 + hy} ${x + 11},${y - 13 + hy} ${x + 11},${y - 7 + hy} L${x + 7},${y - 7 + hy} C${x + 5},${y - 10 + hy} ${x - 5},${y - 10 + hy} ${x - 7},${y - 7 + hy} Z"/>`;
    if (ring) s += arcs(x + 14, y - 8, 1, "hl sW", 3, .55) + arcs(x - 14, y - 8, -1, "hl sW", 3, .55) + seg("RING", x - 14, y - 34 + hy, 8, "sW", 1); }
  // the pneumatic tube on the right wall, and its hatch: a canister in it rattles
  { const rt = fk === "canister" && fp, cl = rt ? "sA" : "sD", P = (Y, k) => OP.P(640, Y, k);
    const a = P(140, .58), b = P(140, .63), c = P(175, .63), d = P(175, .58);
    s += `<path class="hl ${cl}" d="M511.5,${f1(OP.P(640, 0, .6)[1])} L511.5,${f1(a[1] + 2)} M515.5,${f1(OP.P(640, 0, .6)[1])} L515.5,${f1(a[1] + 2.4)}"/>
      <polygon class="k ${cl} mech" points="${[a, b, c, d].map(p => f1(p[0]) + "," + f1(p[1])).join(" ")}"/>`;
    if (rt) { const j = fp % 2 ? 1.6 : -1.6;
      s += `<rect class="k sA" x="${f1(508.5 + j)}" y="${f1(124 - j)}" width="10" height="16" rx="3"/><path class="hl sA" d="M${f1(508.5 + j)},${f1(129 - j)} L${f1(518.5 + j)},${f1(129 - j)}"/>`
        + arcs(526, 132, 1, "hl sA", 3, .6) + arcs(500, 132, -1, "hl sA", 3, .6) + seg("RATTLE", 528, 100, 7, "sA", .9); } }
  [[-30, .6, 9], [10, .58, 6], [-10, .7, 12]].forEach(([X, k, n]) => {
    const x = OP.P(X, 0, k)[0], y = oFloor(k), q = k * AUD;
    for (let i = 0; i < n; i++) s += `<rect class="k hl sD mech" x="${(x - 17 * q + ((i * 37) % 7 - 3) * q).toFixed(1)}" y="${(y - (i + 1) * 9 * q).toFixed(1)}" width="${(34 * q).toFixed(1)}" height="${(9 * q).toFixed(1)}"/>`;
  });
  // the chairs, back to front; Iris in whichever one she is in, or on her feet between them
  const drill = S.stage !== "A";
  let walked = !S.walk;
  CHAIRS.forEach((c, i) => {
    if (!walked && S.walk.k < c.k) { s += irisStanding(S.walk); walked = true; }
    const lit = drill && S.chair === i && S.speaking, ir = !S.walk && (S.stage === "A" ? i === 2 : S.chair === i);
    s += chair(c, lit ? "sV" : "sD");
    s += segC(c.name, c.x, c.y + 4, 4.2 * c.k / .7, lit ? "sV" : "sD", .6);
    if (ir) {
      const sy = c.y - 50 * c.q + 11 * c.q, q = c.q;
      s += irisSeated(c.x, sy, c.k);
      if (S.speaking) {
        s += arcs(c.x + 22 * q, sy - 104 * q, 1, "hl sV", 3, q * 1.4);
        // the tempo, drawn: speed dashes when she hurries, three slow dots when she taunts
        if (S.tempo <= .85) s += `<path class="hl sV" d="M${f1(c.x - 26 * q)},${f1(sy - 112 * q)} L${f1(c.x - 44 * q)},${f1(sy - 112 * q)} M${f1(c.x - 28 * q)},${f1(sy - 102 * q)} L${f1(c.x - 50 * q)},${f1(sy - 102 * q)} M${f1(c.x - 26 * q)},${f1(sy - 92 * q)} L${f1(c.x - 42 * q)},${f1(sy - 92 * q)}"/>`;
        if (S.tempo >= 1.3) for (let d = 0; d < 3; d++) s += `<circle class="hl sV" cx="${f1(c.x + (44 + d * 9) * q)}" cy="${f1(sy - 88 * q)}" r="${f1(1.6 * q)}"/>`;
      }
      // the sherry: at her hand, at her lips, or raised in a toast
      const gl = S.glass || (S.set === "TOAST" ? 1 : 0), toast = gl === 3 || (S.set === "TOAST" && S.speaking);
      if (gl) s += toast ? glass(c.x + 34 * q, sy - 116 * q, q * 2.4) + star4(c.x + 44 * q, sy - 144 * q, 4 * q, "hl sA")
        : gl === 2 ? glass(c.x + 9 * q, sy - 70 * q, q * 2.4) : glass(c.x + 14 * q, sy - 14 * q, q * 2.4);
    }
  });
  if (!walked) s += irisStanding(S.walk);
  return s + sleeve(S);
}
// the foreground: Nell's desk, seen over her shoulder. Her forearm lies on it, cuff toward us; Iris's staple gun lies on
// it beside her hand. Every miss, the gun hops over and staples the cuff to the desk (four and you start again).
const CUFF = [[76, 229], [78, 233], [80, 237], [82, 241]];   // where each staple lands, along the cuff's edge
function stapleGun(x, y, tilt = 0) {   // an Arrow-style staple gun in profile, nose left: body, squeeze lever, hinge, slot
  return `<g transform="rotate(${tilt} ${x + 24} ${y})"><path class="k sR" d="M${x},${y} L${x + 50},${y} L${x + 50},${y - 9} L${x + 6},${y - 9} L${x},${y - 5} Z"/>
    <path class="k sR" d="M${x + 46},${y - 9} L${x + 10},${y - 17} L${x + 8},${y - 13} L${x + 40},${y - 9}"/><circle class="k sR" cx="${x + 46}" cy="${y - 9}" r="2"/>
    <path class="hl sR" d="M${x + 2},${y - 2} L${x + 8},${y - 2}"/></g>`;
}
const staple = (x, y, cls = "sW") => `<path class="${cls}" d="M${x - 4},${y + 3} L${x - 4},${y} L${x + 4},${y} L${x + 4},${y + 3}"/>`;
function sleeve(S) {
  // the desk top: a slab whose back edge we see, running off the bottom of the frame
  let s = `<path class="k sM mech" d="M-2,206 L214,206 L238,252 L-2,252 Z"/><path class="hl sM" d="M-2,210 L216,210"/>`;
  // the forearm: green cuff at the bottom-left, a pink forearm lying flat, an open hand resting on the desk
  s += `<path class="k sG" d="M-4,252 L-4,228 L36,222 L50,232 L76,226 L84,240 L70,252 Z"/><path class="hl sG" d="M36,222 L50,252 M50,232 L58,252"/>
    <path class="sK" d="M74,227 L118,216 M82,239 L122,227"/>
    <path class="k sK" d="M118,215 C126,211 136,211 142,214 L142,226 C136,229 128,229 122,227 Z"/>
    <path class="hl sK" d="M142,216 L149,215 M142,219 L151,219 M142,222 L150,223 M141,225 L147,227 M126,213 L131,208"/>`;
  // the staples already in the cuff
  for (let i = 0; i < 4; i++) if (i < S.staples) s += staple(...CUFF[i], "sW");
  // the meter, top left like the TURN readout: tiny label above, four staples, what four means
  s += seg("STAPLES IN YOUR SLEEVE", 14, 8, 4.2, "sM", .6) + seg("4 AND YOU START AGAIN", 14, 30, 3.6, "sD", .6);
  for (let i = 0; i < 4; i++) s += `<path class="${i < S.staples ? "sR" : "hl sD"}" d="M${16 + i * 13},${26} L${16 + i * 13},${17} L${25 + i * 13},${17} L${25 + i * 13},${26}"/>`;
  // the staple gun: at rest beside her hand (pose 0); on a miss it hops onto the cuff and fires (pose 1);
  // on a misfire it jumps where it lies and a staple flies off into the room
  const mf = S.fx && S.fx.kind === "misfire" ? S.fx.pose : 0;
  if (S.click) {
    const [cx, cy] = CUFF[Math.max(0, Math.min(3, S.staples - 1))];
    s += stapleGun(cx - 4, cy - 2, -12) + star4(cx, cy + 1, 7, "sA") + arcs(cx + 52, cy - 14, 1, "hl sR", 3, .8) + arcs(cx - 10, cy - 14, -1, "hl sR", 3, .8)
      + `<path class="hl sR" d="M${160},${226} L${132},${222} M${158},${232} L${134},${230}"/>` + seg("CLICK", cx + 30, cy - 46, 12, "sR", 1.4);
  } else if (mf) {
    const jy = mf === 1 ? -8 : mf === 2 ? -3 : 0, st = [[150, 190], [176, 162], [204, 140], [222, 130]][Math.min(mf, 3)];
    s += stapleGun(158, 230 + jy) + staple(st[0], st[1]);
    if (mf <= 2) s += star4(156, 226 + jy, 6, "sA") + `<path class="hl sW" d="M${st[0] - 8},${st[1] + 7} L${st[0] - 18},${st[1] + 13} M${st[0] - 6},${st[1] + 11} L${st[0] - 14},${st[1] + 18}"/>` + seg("THUNK", 150, 112, 9, "sR", 1.1);
    s += arcs(214, 222 + jy, 1, "hl sR", 2, .6) + arcs(152, 222 + jy, -1, "hl sR", 2, .6);
  } else s += stapleGun(158, 230);
  return s;
}
const TEMPO = (m) => m <= .74 ? "PRESTO" : m <= .9 ? "ALLEGRO" : m <= 1.2 ? "MODERATO" : "LARGO";
function metronome(x, y, side) {
  return `<path class="k hl sM mech" d="M${x - 7},${y + 22} L${x + 7},${y + 22} L${x + 3},${y} L${x - 3},${y} Z"/>
    <path class="sW" d="M${x},${y + 19} L${x + side * 6},${y + 2}"/><rect class="k sW" x="${f1(x + side * 3.6 - 2)}" y="${y + 8}" width="4" height="3"/>`;
}

/* ---------------- drawing: the Round Table ---------------- */
const TC = [320, 176];                              // table centre
const N_SEATS = 12, QSEAT = 6, LATE = 10, SNIFF = 0, CLUSTER = [4, 5, 6, 7, 8];
const SEATS = Array.from({ length: N_SEATS }, (_, i) => {
  const th = (40 + i * 280 / 11) * Math.PI / 180, c = Math.cos(th), sn = Math.sin(th);
  return { th, c, x: TC[0] - 236 * sn, y: TC[1] + 58 * c, lx: TC[0] - 166 * sn, ly: TC[1] + 30 * c, k: .55 + .45 * (1 + c) / 2 };
});
const CANDLES = [[-118, -6], [-64, -17], [64, -17], [118, -6]];
const burnH = (S) => 15 * (1 - .5 * (S.burn || 0));
// a seated hood. notch 0: bowed over the table; 1: raised, turning; 2: facing you. Local origin = where it meets the table.
function hood(x, y, q, notch, cls, o = {}) {
  const t = (d) => `transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${q.toFixed(3)})"`;
  let s = `<path class="k ${cls}" d="M-23,26 L-22,0 C-22,-12 -17,-20 -10,-24 L10,-24 C17,-20 22,-12 22,0 L23,26 Z"/>
    <path class="hl ${cls}" d="M-11,-18 C-13,-4 -14,10 -15,26 M11,-18 C13,-4 14,10 15,26"/>`;
  if (notch === 0) s += `<path class="k ${cls}" d="M-12,-17 C-15,-28 -7,-41 2,-41 C10,-40 15,-29 12,-17 C6,-20 -6,-20 -12,-17 Z"/><path class="hl ${cls}" d="M-6,-19 C-2,-23 4,-23 8,-19"/>`;
  if (notch === 1) s += `<path class="k ${cls}" d="M-12,-21 C-14,-35 -7,-48 1,-50 C9,-48 15,-36 12,-21 C7,-24 -7,-24 -12,-21 Z"/>
    <path class="k hl ${cls}" d="M2,-25 C1,-34 4,-41 7,-42 C10,-38 11,-31 10,-25 Z"/><circle class="fW" cx="6.4" cy="-33" r="1"/>`;
  if (notch === 2) s += `<path class="k ${cls}" d="M-12,-21 C-14,-35 -8,-48 0,-50 C8,-48 14,-35 12,-21 C8,-24 -8,-24 -12,-21 Z"/>
    <path class="k hl ${cls}" d="M-7,-25 C-8,-34 -4,-42 0,-43 C4,-42 8,-34 7,-25 C3,-27 -3,-27 -7,-25 Z"/>
    <circle class="fR" cx="-2.6" cy="-33" r="1"/><circle class="fR" cx="2.6" cy="-33" r="1"/>`;
  s += `<circle class="hl sX" cx="9" cy="-10" r="2.4"/><circle class="fX" cx="9" cy="-10" r="1"/>`;
  if (o.medals) s += `<circle class="hl sA" cx="-8" cy="-8" r="2.2"/><circle class="hl sA" cx="-4" cy="-3" r="2.2"/><circle class="hl sA" cx="-9" cy="2" r="2.2"/>`;
  if (o.speak) s += arcs(16, -32, 1, "hl sA", 3, .9) + arcs(-16, -32, -1, "hl sA", 3, .9);
  return `<g ${t()}>${s}</g>`;
}
// the empty seat (the late member's, until he arrives): a tall chair back and nothing in it
function emptySeat(x, y, q) {
  return `<path class="hl sD" d="M${f1(x - 20 * q)},${f1(y + 26 * q)} L${f1(x - 20 * q)},${f1(y - 34 * q)} Q${f1(x)},${f1(y - 60 * q)} ${f1(x + 20 * q)},${f1(y - 34 * q)} L${f1(x + 20 * q)},${f1(y + 26 * q)}"/>`;
}
function lamp(x, y, k, on) {
  const f = (v) => v.toFixed(1), w = 4 * k, h = 10 * k;
  let s = `<path class="hl ${on ? "sA" : "sD"}" d="M${f(x - 3 * k)},${f(y)} L${f(x + 3 * k)},${f(y)} M${f(x)},${f(y)} L${f(x)},${f(y - h * .6)}"/>`;
  s += `<path class="${on ? "fA" : "k hl sD"}" d="M${f(x - w)},${f(y - h * .6)} L${f(x + w)},${f(y - h * .6)} L${f(x + w * .6)},${f(y - h)} L${f(x - w * .6)},${f(y - h)} Z"/>`;
  if (on) s += `<path class="hl sA" d="M${f(x - w * 1.3)},${f(y - h * .45)} L${f(x - w * 2.2)},${f(y + 1)} M${f(x + w * 1.3)},${f(y - h * .45)} L${f(x + w * 2.2)},${f(y + 1)} M${f(x)},${f(y - h * 1.3)} L${f(x)},${f(y - h * 1.9)}"/>`;
  return s;
}
// the late member's lamp, flickering: 1 on, 2 a dying spark
const flickLamp = (x, y, k, pose) => pose === 1 ? lamp(x, y, k, true)
  : lamp(x, y, k, false) + (pose === 2 ? star4(x, y - 10 * k, 4 * k, "hl sA") + `<path class="hl sA" d="M${f1(x + 5 * k)},${f1(y - 14 * k)} L${f1(x + 9 * k)},${f1(y - 18 * k)}"/>` : "");
// the skull gavel by Quorum's lamp: 0 resting, 1 raised, 2 struck (TOK)
function gavel(x, y, pose, k = 1) {
  if (pose === 1) return `<path class="sA" d="M${x + 14 * k},${y + 6 * k} L${x + 22 * k},${y - 10 * k}"/><rect class="k sA mech" x="${f1(x + 18 * k)}" y="${f1(y - 19 * k)}" width="${f1(9 * k)}" height="${f1(7 * k)}"/><circle class="k sW" cx="${f1(x + 22.5 * k)}" cy="${f1(y - 22 * k)}" r="${f1(3 * k)}"/>`;
  let s = `<path class="sA" d="M${x + 14 * k},${y + 6 * k} L${x + 28 * k},${y + 2 * k}"/><rect class="k sA mech" x="${f1(x + 26 * k)}" y="${f1(y - 3 * k)}" width="${f1(7 * k)}" height="${f1(9 * k)}"/><circle class="k sW" cx="${f1(x + 29.5 * k)}" cy="${f1(y - 6 * k)}" r="${f1(3 * k)}"/>`;
  if (pose === 2) s += star4(x + 30 * k, y + 8 * k, 5 * k, "sA") + arcs(x + 40 * k, y + 2 * k, 1, "hl sA", 3, .6 * k) + arcs(x + 18 * k, y + 2 * k, -1, "hl sA", 3, .6 * k) + seg("TOK", x + 34 * k, y - 24 * k, 9 * k, "sA", 1.1);
  return s;
}
const CP = perspective(320, 64, .4, VH);
// the ring room, as the wide camera sees it (the close camera crops and enlarges this same drawing)
function chamberWorld(S) {
  let s = "";
  for (let X = -320; X <= 960; X += 80) s += CP.ln([X, VH], CP.P(X, VH, CP.KB), "hl sN");
  [.5, .62, .78].forEach(k => s += CP.ln(CP.P(-200, VH, k), CP.P(840, VH, k), "hl sN"));
  // the old magnet: an iron ring on edge, wound with coil, bolted to a plinth
  const [rx, ry, ix, iy, cy] = [112, 104, 88, 80, 124], adv = S.n === 3;
  s += `<path class="k ${adv ? "sR" : "sM"}" fill-rule="evenodd" d="M${320 - rx},${cy} a${rx},${ry} 0 1 0 ${2 * rx},0 a${rx},${ry} 0 1 0 ${-2 * rx},0 Z M${320 - ix},${cy} a${ix},${iy} 0 1 0 ${2 * ix},0 a${ix},${iy} 0 1 0 ${-2 * ix},0 Z"/>`;
  for (let a = 0; a < 360; a += 7.5) {
    const r = a * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r);
    s += `<path class="hl ${adv ? "sR" : "sD"}" d="M${(320 + ix * c).toFixed(1)},${(cy + iy * sn).toFixed(1)} L${(320 + rx * c).toFixed(1)},${(cy + ry * sn).toFixed(1)}"/>`;
  }
  [[1, 0], [-1, 0]].forEach(([c, sn]) => s += `<rect class="k sM mech" x="${320 + (rx + 2) * c - 5}" y="${cy + (ry + 2) * sn - 5}" width="10" height="10"/>`);
  s += segC("1968", 320, cy - iy + 5, 4, "sD", .6);
  // the hum: ((( ))) off the ring, more of it as the night goes on (and red when the Echo is advanced)
  const hum = Math.min(4, (S.hum || 0) + (adv ? 1 : 0) + (S.humPulse || 0));
  if (hum) { const hc = adv || S.humPulse ? "hl sR" : "hl sM";
    s += arcs(320 + rx + 12, cy - 30, 1, hc, hum, 1.3) + arcs(320 - rx - 12, cy - 30, -1, hc, hum, 1.3); }
  // the Gain Controller on its plinth (back right), and Preston beside it, hooded, earbuds lit; he twitches (poses 1, 2)
  const tw = S.pTwitch || 0, px = 562 + (tw === 1 ? 4 : tw === 2 ? -3 : 0), needle = tw === 1 ? "L589,94" : tw === 2 ? "L599,93" : "L596.5,94";
  s += `<path class="k sM mech" d="M582,104 L618,104 L615,146 L585,146 Z"/><rect class="k sW mech" x="586" y="90" width="28" height="14"/>
    <circle class="hl sW" cx="594" cy="97" r="4"/><path class="hl sW" d="M594,97 ${needle}"/><rect class="fG" x="601" y="95" width="${tw ? 12 : 9}" height="3"/>`;
  s += hood(px, 118, .5, tw === 1 ? 1 : 2, "sV") + `<circle class="fG" cx="${px - 5}" cy="95.5" r="1.1"/><circle class="fG" cx="${px + 5}" cy="95.5" r="1.1"/>`
    + arcs(px - 9, 95, -1, "hl sG", 3, .45) + arcs(px + 9, 95, 1, "hl sG", 3, .45);
  if (tw) s += star4(px - 7, 90, 4, "sG") + star4(px + 8, 101, 3, "sG") + `<path class="hl sG" d="M${px - 16},86 L${px - 22},82 M${px + 15},88 L${px + 22},85"/>`;
  // seats behind the table's centre line, the table, its lamps, then the near seats
  const close = S.closing, pos = (i) => { const p = SEATS[i]; return close ? { ...p, x: 320 + (p.x - 320) * .78, y: p.y + 30, k: p.k * 1.5 } : p; };
  const notch = (i) => close ? 2 : i === QSEAT ? (S.n === 3 ? 2 : 0) : S.hoods[i] || 0;
  const seat = (i) => { const p = pos(i), lit = S.seat === i && !close;
    if (i === LATE && !S.late && !close) return emptySeat(p.x, p.y, p.k);
    const h = hood(p.x, p.y, p.k, notch(i), lit ? "sW" : "sV", { medals: i === QSEAT, speak: (lit && S.speaking) || (i === QSEAT && S.qSpeak) });
    if (i === SNIFF && S.sniff && !close) { // the neighbour leans in toward you and sniffs
      const a = S.sniff === 1 ? 12 : 22, dx = S.sniff === 1 ? 8 : 18;
      return `<g transform="translate(${dx},0) rotate(${a} ${f1(p.x)} ${f1(p.y + 26 * p.k)})">${h}</g>`
        + (S.sniff === 2 ? seg("SNIFF", p.x + 34, p.y - 72, 7, "sV", .9) + `<path class="hl sV" d="M${f1(p.x + 40)},${f1(p.y - 38)} L${f1(p.x + 50)},${f1(p.y - 34)} M${f1(p.x + 44)},${f1(p.y - 30)} L${f1(p.x + 54)},${f1(p.y - 25)} M${f1(p.x + 40)},${f1(p.y - 23)} L${f1(p.x + 49)},${f1(p.y - 17)}"/>` : "");
    }
    return h; };
  const order = SEATS.map((p, i) => i).sort((a, b) => SEATS[a].y - SEATS[b].y);
  order.filter(i => SEATS[i].c < 0).forEach(i => s += seat(i));
  s += `<g data-b="knock" style="cursor:pointer"><path class="k sW" d="M${TC[0] - 200},${TC[1]} L${TC[0] - 200},${TC[1] + 9} A200,40 0 0 0 ${TC[0] + 200},${TC[1] + 9} L${TC[0] + 200},${TC[1]} Z"/>
    <ellipse class="k sW" cx="${TC[0]}" cy="${TC[1]}" rx="200" ry="40"/><ellipse class="hl sD" cx="${TC[0]}" cy="${TC[1]}" rx="120" ry="22"/>
    <circle class="hl sX" cx="${TC[0]}" cy="${TC[1]}" r="9"/><circle class="fX" cx="${TC[0]}" cy="${TC[1]}" r="3.6"/></g>`;
  // the candles burn down as the night goes on; a draft makes them gutter, and some go out
  CANDLES.forEach(([dx, dy], i) => s += `<g style="pointer-events:none">${candle(TC[0] + dx, TC[1] + dy, burnH(S), S.candles[i], S.candles[i] === "lit" ? S.gutter || 0 : 0)}</g>`);
  // the skull gavel, by Quorum's lamp; the minutes, open in front of him
  { const p = SEATS[QSEAT]; s += gavel(p.lx, p.ly, S.fx && S.fx.kind === "gavel" ? S.fx.pose : 0);
    if (S.minutes) s += `<path class="k sW" d="M${p.lx - 30},${p.ly + 10} L${p.lx - 14},${p.ly + 12} L${p.lx - 14},${p.ly + 4} L${p.lx - 29},${p.ly + 2} Z M${p.lx - 14},${p.ly + 12} L${p.lx + 2},${p.ly + 10} L${p.lx + 1},${p.ly + 2} L${p.lx - 14},${p.ly + 4} Z"/>
      <path class="hl sD" d="M${p.lx - 27},${p.ly + 5} L${p.lx - 17},${p.ly + 6.5} M${p.lx - 27},${p.ly + 7.5} L${p.lx - 17},${p.ly + 9} M${p.lx - 11},${p.ly + 6.5} L${p.lx - 1},${p.ly + 5} M${p.lx - 11},${p.ly + 9} L${p.lx - 1},${p.ly + 7.5}"/>`; }
  const flick = S.fx && S.fx.kind === "flicker";
  SEATS.forEach((p, i) => s += i === LATE && flick ? "" : lamp(p.lx, p.ly, .6 + .5 * p.k, S.seat === i && !close));
  order.filter(i => SEATS[i].c >= 0).forEach(i => s += seat(i));
  // the late member's lamp flickers in front of everything: it's an event, and it wants to be seen
  if (flick) { const p = SEATS[LATE]; s += flickLamp(p.lx, p.ly, .6 + .5 * p.k, S.fx.pose) + (S.fx.pose ? arcs(p.lx + 10, p.ly - 8, 1, "hl sA", 2, .5) + arcs(p.lx - 10, p.ly - 8, -1, "hl sA", 2, .5) : ""); }
  if (close) SEATS.forEach((p, i) => s += `<path class="hl sR" d="M${pos(i).x},${pos(i).y - 60 * pos(i).k} L${(pos(i).x + (320 - pos(i).x) * .12).toFixed(1)},${(pos(i).y - 50 * pos(i).k).toFixed(1)}"/>`);
  // the late member, walking in behind you to his seat (two poses: step, and the bob between steps)
  if (S.lateWalk) { const w = S.lateWalk; s += hoodStanding(w.x, w.y, w.k) + (w.step ? `<path class="hl sV" d="M${f1(w.x + 30)},${f1(w.y - 2)} L${f1(w.x + 44)},${f1(w.y - 2)} M${f1(w.x + 32)},${f1(w.y - 8)} L${f1(w.x + 42)},${f1(w.y - 8)}"/>` : ""); }
  return s;
}
// Nell, in Gus's robe: two sleeves on the near rim; a knock is drawn. (Over every camera but the overhead.)
function nellLayer(S) {
  let s = `<path class="k sV" d="M262,252 L272,226 L292,224 L296,252 Z M378,252 L368,226 L348,224 L344,252 Z"/>`;
  if (S.knock) s += `<path class="k sK" d="M288,222 C288,214 300,212 304,218 C306,224 300,228 292,228 Z"/>` + arcs(310, 220, 1, "hl sW", 3, .7) + arcs(282, 220, -1, "hl sW", 3, .7) + seg("SAME SEAT", 254, 196, 10, "sA", 1.2);
  else s += `<path class="k sK" d="M286,224 C284,218 294,214 300,218 C303,221 300,226 292,226 Z"/>`;
  s += `<path class="k sK" d="M354,224 C356,218 346,214 340,218 C337,221 340,226 348,226 Z"/>`;
  if (S.seconded) s += chip("SECONDED", 330, 196, 8, "fG");
  return s;
}
// the close camera: the same drawing, cropped on Quorum's end and enlarged; .cz keeps the line weights apparent
const CZ = { x: 362, y: 126, z: 1.55 };
// the overhead camera: an isometric seating plan. Seats are cubes (a speaking seat's cube is lit), the hoods sit on top.
const OV = { cx: 320, cy: 146, RT: 80, RS: 118 };
const ovP = (X, Z, h = 0) => [OV.cx + 1.225 * X, OV.cy + .707 * Z - h];
const seatXZ = (th, r) => [-r * Math.sin(th), r * Math.cos(th)];
function cube(x, y, s, d, top, side = "sD") {
  const L = [x - s * .866, y], Rr = [x + s * .866, y], B = [x, y + s * .5], T = [x, y - s * .5], pp = (...a) => a.map(p => f1(p[0]) + "," + f1(p[1])).join(" ");
  return `<polygon class="k ${side} mech" points="${pp(L, B, [B[0], B[1] + d], [L[0], L[1] + d])}"/><polygon class="k ${side} mech" points="${pp(Rr, B, [B[0], B[1] + d], [Rr[0], Rr[1] + d])}"/>`
    + `<polygon class="${top} mech" points="${pp(T, Rr, B, L)}"/>`;
}
function overhead(S) {
  let s = "";
  // the floor: an isometric grid
  for (let t = -480; t <= 1120; t += 56) s += `<path class="hl sN" d="M${t},0 L${f1(t + 433)},250"/><path class="hl sN" d="M${t},0 L${f1(t - 433)},250"/>`;
  // the ring, seen from above: on edge, it's a bar of coil between its two plinths, behind the far seats
  { const adv = S.n === 3, cl = adv ? "sR" : "sM", [ax, ay] = ovP(-104, -142), [bx] = ovP(104, -142);
    s += `<path class="k ${cl} mech" d="M${f1(ax)},${f1(ay - 5)} L${f1(bx)},${f1(ay - 5)} L${f1(bx)},${f1(ay + 5)} L${f1(ax)},${f1(ay + 5)} Z"/>`;
    for (let x = ax + 5; x < bx; x += 5) s += `<path class="hl ${adv ? "sR" : "sD"}" d="M${f1(x)},${f1(ay - 5)} L${f1(x)},${f1(ay + 5)}"/>`;
    s += cube(ax - 6, ay + 2, 12, 8, "k sM", "sM") + cube(bx + 6, ay + 2, 12, 8, "k sM", "sM") + seg("1968", bx + 18, ay - 3, 4, "sD", .6);
    const hum = Math.min(4, (S.hum || 0) + (adv ? 1 : 0) + (S.humPulse || 0));
    if (hum) s += arcs(bx + 4, ay - 16, 1, `hl ${adv || S.humPulse ? "sR" : "sM"}`, hum, .9) + arcs(ax - 4, ay - 16, -1, `hl ${adv || S.humPulse ? "sR" : "sM"}`, hum, .9); }
  // things around the table, back to front: seats, the console and Preston, Nell; the table sits in the middle
  const items = [];
  SEATS.forEach((p, i) => { const [X, Z] = seatXZ(p.th, OV.RS), [x, y] = ovP(X, Z); items.push({ y, svg: () => {
    const lit = S.seat === i, empty = i === LATE && !S.late;
    let o = cube(x, y, 13, 8, lit ? "fA" : "k sD", lit ? "sA" : "sD") + (lit ? cube(x, y, 13, 0, "hl sA", "sA") : "");
    if (!empty) o += hood(x, y - 13, .4, i === QSEAT ? (S.n === 3 ? 2 : 0) : S.hoods[i] || 0, lit ? "sW" : "sV", { medals: i === QSEAT, speak: lit && S.speaking });
    return o; } }); });
  { const [x, y] = ovP(176, -118); items.push({ y, svg: () => {
    const tw = S.pTwitch || 0, px = x - 30 + (tw === 1 ? 3 : tw === 2 ? -2 : 0), py = y + 14;
    return cube(x, y, 20, 16, "k sW", "sM") + `<rect class="fG" x="${f1(x - 5)}" y="${f1(y - 1.5)}" width="${tw ? 12 : 9}" height="3"/>`
      + hood(px, py - 12, .4, tw === 1 ? 1 : 2, "sV") + `<circle class="fG" cx="${f1(px - 4)}" cy="${f1(py - 25)}" r="1"/><circle class="fG" cx="${f1(px + 4)}" cy="${f1(py - 25)}" r="1"/>`
      + arcs(px - 8, py - 25, -1, "hl sG", 3, .35) + arcs(px + 8, py - 25, 1, "hl sG", 3, .35) + (tw ? star4(px - 6, py - 30, 3, "sG") : ""); } }); }
  { const [x, y] = ovP(0, OV.RS); items.push({ y, svg: () => cube(x, y, 13, 8, "k hl sG", "sD")
    + `<g transform="translate(${f1(x)},${f1(y - 13)}) scale(.42)"><path class="k sV" d="M-23,26 L-22,0 C-22,-12 -17,-20 -10,-24 L10,-24 C17,-20 22,-12 22,0 L23,26 Z"/><path class="k sV" d="M-12,-21 C-14,-35 -8,-48 0,-50 C8,-48 14,-35 12,-21 C8,-24 -8,-24 -12,-21 Z"/><path class="hl sV" d="M0,-48 C-2,-36 -1,-28 0,-22"/></g>`
    + segC("YOU", x, y + 14, 4.4, "sG", .7)
    + (S.knock ? arcs(x + 20, y - 10, 1, "hl sW", 3, .7) + arcs(x - 20, y - 10, -1, "hl sW", 3, .7) + seg("SAME SEAT", x + 30, y - 30, 10, "sA", 1.2) : "") }); }
  const table = () => {
    const [x, y] = ovP(0, 0, 10), rx = 1.225 * OV.RT, ry = .707 * OV.RT;
    let o = `<g data-b="knock" style="cursor:pointer"><path class="k sW" d="M${f1(x - rx)},${f1(y)} L${f1(x - rx)},${f1(y + 7)} A${f1(rx)},${f1(ry)} 0 0 0 ${f1(x + rx)},${f1(y + 7)} L${f1(x + rx)},${f1(y)} Z"/>
      <ellipse class="k sW" cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}"/><ellipse class="hl sD" cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx * .6)}" ry="${f1(ry * .6)}"/>
      <circle class="hl sX" cx="${f1(x)}" cy="${f1(y)}" r="7"/><circle class="fX" cx="${f1(x)}" cy="${f1(y)}" r="2.8"/></g>`;
    CANDLES.forEach(([dx, dy], i) => { const [cx, cy] = ovP(dx * OV.RT / 200, dy * OV.RT / 40, 10); o += `<g style="pointer-events:none">${candle(cx, cy, burnH(S) * .7, S.candles[i], S.candles[i] === "lit" ? S.gutter || 0 : 0, .75)}</g>`; });
    SEATS.forEach((p, i) => { const [X, Z] = seatXZ(p.th, OV.RT * .82), [lx, ly] = ovP(X, Z, 10);
      o += i === LATE && S.fx && S.fx.kind === "flicker" ? flickLamp(lx, ly, .6, S.fx.pose) : lamp(lx, ly, .6, S.seat === i);
      if (i === QSEAT) o += gavel(lx + 4, ly + 2, S.fx && S.fx.kind === "gavel" ? S.fx.pose : 0, .7); });
    return o; };
  items.push({ y: OV.cy, svg: table });
  items.sort((a, b) => a.y - b.y).forEach(it => s += it.svg());
  if (S.seconded) s += chip("SECONDED", 344, 222, 8, "fG");
  return s;
}
const ADV = "THE ECHO IS ADVANCED  -  THREE BACK";
const readout = (label, val, x, y, cls, h = 15) => seg(label, x, y, 4.2, "sM", .6) + seg(val, x, y + 7, h, cls, 1.1);
const pad = (v) => String(v).padStart(2, "0");

/* ---------------- the shape of each run ---------------- */
// Rehearsal drills: legs (each a fresh Echo), the phrase set and tempo per turn, Iris's cue lines, the scene between
const DRILLS = {
  A: { name: ["THE DRILL", "THE PHRASES"], streams: { phrase: true, seat: false }, base: 1.25, catches: ["kettle", "phone"], between: ["sherry"],
    legs: [{ len: 7, set: "PEER", tempo: [1, 1, .9, .8, .72, .68, .68, 1.45], cue: { 3: "fast", 7: "slow" } },
      { len: 6, set: "GRANT", tempo: [1.45, 1.45, 1, .9, .78, .7, .7], cue: { 0: "slow", 4: "fast" } }] },
  B: { name: ["DRILL 2", "THE CHAIRS"], streams: { phrase: false, seat: true }, base: .9, catches: ["canister", "misfire"], between: ["kettle"],
    legs: [{ len: 7, tempo: [1, 1, .85, .75, .7, 1.4, 1.5], cue: { 3: "fast", 5: "slow" } },
      { len: 6, tempo: [1.3, 1, .82, .72, .7, 1], cue: { 2: "fast" } }] },
  C: { name: ["DRILL 2", "THE TOASTS"], streams: { phrase: true, seat: false }, base: 1.05, catches: ["sneeze", "phone", "kettle"], between: ["toast"],
    legs: [{ len: 6, set: "GRANT", tempo: [1, 1, .9, .82, .78, 1.35, 1.4], cue: { 3: "fast", 5: "slow" } },
      { len: 6, set: "TOAST", tempo: [1.2, 1, .9, .84, .8, .8, 1], cue: { 3: "fast" } }] },
};
// Induction readings: camera, speaking order, tempo, the catch events
const READINGS = [
  { cam: "wide", pattern: "round", len: 7, tempo: 1.15, name: "FIRST READING", sub: "ROUND THE TABLE", catches: ["gavel"] },
  { cam: "close", pattern: "cluster", len: 7, tempo: 1.1, name: "SECOND READING", sub: "THE HEAD OF THE TABLE", catches: ["flicker"] },
  { cam: "over", pattern: "open", len: 7, tempo: 1.05, name: "THIRD READING", sub: "THE FLOOR IS OPEN", catches: ["flicker", "gavel"] },
];
// the poses each catch event steps through (spread over most of a turn)
const FX_FRAMES = { kettle: [1, 2, 1, 2, 1, 2], phone: [1, 2, 1, 2, 0, 1, 2], sneeze: [1, 1, 2, 2, 2, 0], canister: [1, 2, 1, 2, 1, 2], misfire: [1, 2, 3, 3, 3],
  gavel: [1, 2, 1, 2, 0], flicker: [1, 2, 1, 0, 2, 1, 0], sneezeI: [0, 1, 1, 2, 2, 0] };

/* ---------------- styles ---------------- */
const CSS = `
.echo{position:absolute;inset:0;background:#000;color:var(--W);text-transform:uppercase;font-family:"Saira Condensed","Arial Narrow",sans-serif;cursor:default}
.echo svg.t.scene{position:absolute;left:0;top:0;width:100%;height:39.0625cqw}
.echo .ebar{position:absolute;left:0;right:0;top:39.0625cqw;bottom:0;border-top:.14cqw solid var(--W);padding:.7cqw 2.2cqw .9cqw;display:flex;flex-direction:column;gap:.3cqw;box-sizing:border-box}
.echo .eph{font-size:3cqw;line-height:1.12;min-height:3.5cqw;letter-spacing:.015em;flex:none;white-space:nowrap;overflow:hidden}
.echo .spk{display:inline-block;color:#000;font-weight:600;letter-spacing:.06em;font-size:1.4cqw;padding:0 .5cqw;margin-right:.8cqw;vertical-align:.55cqw;line-height:1.35}
.echo .eco{font-size:2.05cqw;line-height:1.2;flex:1 1 0;min-height:0;overflow:hidden}
.echo .eco.talk{font-size:2.5cqw;padding-top:.4cqw}
.echo .eco .spk{font-size:1.15cqw;vertical-align:.3cqw}
.echo .ectl{display:flex;gap:1.1cqw;align-items:center;flex:none;min-height:3cqw}
.echo .eb{font-weight:600;font-size:1.9cqw;letter-spacing:.06em;color:#000;background:var(--W);padding:.1cqw 1.4cqw;cursor:pointer;line-height:1.4}
.echo .eb small{font-size:.6em;margin-left:.5cqw;letter-spacing:.1em}
.echo .eb.s{background:var(--G)} .echo .eb.k{background:var(--A)} .echo .eb.go{background:#000;color:var(--W);box-shadow:inset 0 0 0 .12cqw var(--W)}
.echo .eb.used{background:var(--D);cursor:default} .echo .eb:not(.used):hover{background:var(--W);color:#000}
.echo .eb em{display:block;font-style:normal;font-weight:500;font-size:.55em;letter-spacing:.06em;line-height:1.1;margin-top:-.1cqw;opacity:.8}
.echo .erule{font-size:1.05cqw;color:var(--M);letter-spacing:.08em;line-height:1.15}
.echo .etl{margin-left:auto;font-size:1.2cqw;color:var(--M);letter-spacing:.06em;white-space:nowrap}
.echo .etl b{color:var(--W);font-weight:600}
.echo .edead{position:absolute;inset:0;background:#000;z-index:2}
.echo .edead .dt{position:absolute;left:14%;right:14%;top:30%;font-size:2.6cqw;line-height:1.18}
.echo .ip0 .ap1,.echo .ip0 .ap2,.echo .ip1 .ap0,.echo .ip1 .ap2,.echo .ip2 .ap0,.echo .ip2 .ap1{display:none}
.echo g.cz path,.echo g.cz circle,.echo g.cz rect,.echo g.cz ellipse,.echo g.cz polygon,.echo g.cz polyline{stroke-width:${(1.5 / CZ.z).toFixed(3)}}
.echo g.cz .hl{stroke-width:${(.75 / CZ.z).toFixed(3)}}
`;
function injectCSS() {
  if (document.getElementById("echo-css")) return;
  const st = document.createElement("style"); st.id = "echo-css"; st.textContent = CSS; document.head.appendChild(st);
}
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
// sound (game/js/sfx.js, when it's loaded): one-shots, and per-speaker voice ticks for each line
const sfx = (name, o) => { if (window.SFX) window.SFX.play(name, o); };
// what each catch event sounds like, frame by frame (f: this pose, pf: the last one)
const FX_SOUND = { kettle: (f, i) => i === 0 || i === 3 ? "echoKettle" : null, phone: (f, pf) => f === 1 && pf !== 1 ? "echoPhone" : null,
  canister: (f) => f === 1 ? "echoRattle" : null, misfire: (f, pf) => f === 1 && pf !== 1 ? "echoMisfire" : null,
  gavel: (f) => f === 2 ? "gavel" : null, flicker: (f) => f ? "echoLamp" : null };

/* ---------------- the minigame ---------------- */
export function echo(el, opts = {}) {
  injectCSS();
  const mode = opts.mode === "induction" ? "induction" : "rehearsal";
  const P = opts.pace || 2800, score = opts.score || (() => {}), blip = opts.blip || (() => {});
  const onSeat = opts.onSeat || (() => {}), onTurn = opts.onTurn || (() => {});
  let attemptSeed = 0;
  const rng = () => opts.seed != null ? mulberry(opts.seed * 7919 + (attemptSeed++) * 104729) : Math.random;
  const flair = opts.seed != null ? mulberry(opts.seed * 31 + 7) : Math.random;   // Morris's twitches, Iris's asides (never the sequence)

  return new Promise(resolve => {
    const S = { stage: mode === "induction" ? "I" : "A", n: 2, turn: 0, len: 0, phrase: null, who: "IRIS", chair: null, seat: null,
      speaking: false, staples: 0, click: false, knock: false, seconded: false, hoods: {}, susp: 0, closing: false,
      coach: null, go: null, paused: false, abort: false, streams: { phrase: false, seat: false },
      set: null, tempo: 1, walk: null, glass: 0, fx: null, inter: false, skip: false, card: null,
      cam: "wide", reading: 0, late: false, lateWalk: null, sniff: 0, pTwitch: 0, qSpeak: false, minutes: false, twitch: 0, sneeze: 0,
      hum: 0, humPulse: 0, gutter: 0, candles: ["lit", "lit", "lit", "lit"], burn: 0 };
    let T = { phrase: tally(), seat: tally() }, cur = null, alive = true, rnd = Math.random, lineN = 0;
    const timers = [], CANCEL = {};
    window.ECHO = { S, draw: () => draw() };   // for scripted tests
    const later = (f, ms) => timers.push(setTimeout(() => alive && f(), ms));
    // pausable, cancellable sleep; `until` (optional) ends it early (an interlude being skipped)
    const wait = (ms, until) => new Promise((res, rej) => {
      let left = ms, last = performance.now();
      const tick = () => { if (!alive) return rej(CANCEL); if (until && until()) return res(); const now = performance.now(); if (!S.paused) left -= now - last; last = now;
        if (left <= 0) res(); else timers.push(setTimeout(tick, Math.min(left, 40))); };
      tick();
    });
    const skipQ = () => S.skip;

    el.innerHTML = `<div class="echo" data-mode="${mode}"><svg class="t scene" viewBox="0 0 640 ${VH}"></svg>
      <div class="ebar"><div class="eph"></div><div class="eco"></div><div class="ectl"></div></div></div>`;
    const root = el.querySelector(".echo"), svg = root.querySelector("svg"), eph = root.querySelector(".eph"), eco = root.querySelector(".eco"), ectl = root.querySelector(".ectl");

    function draw() {
      if (!alive) return;
      const sum = addT(addT(tally(), T.phrase), T.seat);
      let hud = "", scene;
      if (S.lesson) svg.innerHTML = lessonSVG(S.lesson);
      else if (S.card) svg.innerHTML = cardSVG(S.card);
      else if (mode === "rehearsal") {
        const st = DRILLS[S.stage].name;
        hud = segC("THE REHEARSAL", 320, 8, 9, "sW", 1.2) + segC(`${st[0]}  -  ${st[1]}`, 320, 22, 4.4, "sM", .7)
          + readout("TURN", S.len ? `${pad(S.turn)}/${pad(S.len)}` : "--", 566, 8, "sW");
        if (S.set && S.streams.phrase) hud += segC(SETS[S.set][0], 320, 31, 4, "sV", .6);
        if (S.len) hud += readout("TEMPO", TEMPO(S.tempo), 18, 8, S.tempo <= .74 ? "sA" : "sW", 11) + metronome(18 + segW(TEMPO(S.tempo), 11) + 12, 7, S.turn % 2 ? 1 : -1);
        svg.innerHTML = office(S) + hud;
      } else {
        const turned = Object.values(S.hoods).filter(v => v >= 2).length, rd = READINGS[S.reading];
        hud = readout("TURN", S.len ? `${pad(S.turn)}/${pad(S.len)}` : "--", 18, 8, "sW")
          + readout("HOODS TURNED", `${turned}/3`, 566, 8, turned >= 2 ? "sR" : "sW")
          + (S.n === 3 ? chip(ADV, 320 - chipW(ADV, 6.6) / 2, 6, 6.6, "fR") : segC("THE ECHO  -  TWO BACK", 320, 10, 5, "sM", .7))
          + (S.len && !S.closing ? seg(rd.name, 18, 36, 4.4, "sW", .7) + seg(rd.sub, 18, 44, 3.6, "sM", .6) : "");
        const cam = S.closing ? "wide" : S.cam;
        if (cam === "over") scene = overhead(S);
        else if (cam === "close") scene = `<g class="cz" transform="translate(${f1(320 - CZ.x * CZ.z)},${f1(125 - CZ.y * CZ.z)}) scale(${CZ.z})">${chamberWorld(S)}</g>` + nellLayer(S);
        else scene = chamberWorld(S) + nellLayer(S);
        if (opts.morris) scene += cam === "over" ? vent(110, 70, S.twitch, S.sneeze) : vent(470, 30, S.twitch, S.sneeze);
        svg.innerHTML = scene + hud;
      }
      Object.assign(root.dataset, { n: S.n, turn: S.turn, stage: S.stage, seat: S.seat == null ? "" : S.seat, chair: S.chair == null ? "" : S.chair,
        cam: S.cam, reading: S.reading, set: S.set || "", event: S.fx && cur && cur.catch ? S.fx.kind : "", inter: S.inter ? "1" : "", walking: S.walk ? "1" : "" });
      const pc = COL[S.who] || "V";
      eph.innerHTML = S.fx && S.fx.label ? `<span style="color:var(--M)">${esc(S.fx.label)}</span>`
        : S.phrase != null ? `<span class="spk" style="background:var(--${pc})">${S.who}</span><span style="color:var(--${pc})" data-p="${S.phrase}">${esc(SETS[S.set || "PEER"][1][S.phrase])}</span>`
        : S.speaking && S.stage === "B" ? `<span class="spk" style="background:var(--V)">IRIS</span><span style="color:var(--M)">(SITS.)</span>` : "";
      if (S.paused) eco.innerHTML = `<span class="spk" style="background:var(--W)">PAUSED</span><span style="color:var(--W)">LEAVE ${mode === "induction" ? "THE TABLE" : "THE DRILL"}? ESC AGAIN TO LEAVE. ANY OTHER KEY TO STAY.</span>`;
      else if (S.coach) { const c = COL[S.coach[0]] || "W"; if (S.coach !== heard) { heard = S.coach; voice(S.coach[0], S.coach[1]); } eco.innerHTML = `<span class="spk" style="background:var(--${c})">${S.coach[0]}</span><span style="color:var(--${c})">${esc(S.coach[1])}</span>`; }
      else eco.innerHTML = "";
      eco.classList.toggle("talk", !!S.go || S.inter);
      let ctl = "";
      if (S.go) ctl = `<div class="eb go" data-b="go">GO ON <small>ENTER</small></div>`;
      else if (S.inter) ctl = `<div class="eb go" data-b="skip">SKIP <small>ENTER</small></div>`;
      else if (cur || S.len) {
        const back = S.n === 3 ? "3" : "2";
        if (S.streams.phrase) ctl += `<div class="eb s ${cur && cur.saidS ? "used" : ""}" data-b="s">SECONDED <small>S · SPACE</small><em>SAME WORDS AS ${back} TURNS AGO</em></div>`;
        ctl += `<span class="erule">OTHERWISE<br>SAY NOTHING</span>`;
      }
      ctl += `<span class="etl">HITS <b>${sum.hits}</b> · MISSES <b>${sum.misses}</b> · FALSE ALARMS <b>${sum.fa}</b> · SILENCES <b>${sum.cr}</b></span>`;
      ectl.innerHTML = ctl;
    }
    const say = (line) => { S.coach = line; draw(); };
    const voice = (who, text) => { if (!window.SFX || !who) return; const n = Math.min(24, Math.ceil(String(text).length / 2));
      for (let i = 0; i < n; i++) later(() => window.SFX && window.SFX.voice(who), i * 50); };
    let heard = null;   // the last coach line voiced
    // lines that wait for the player
    async function talk(lines) {
      for (const ln of lines) {
        S.coach = ln;
        await new Promise((res, rej) => { S.go = res; draw(); const chk = () => alive ? timers.push(setTimeout(chk, 200)) : rej(CANCEL); chk(); });
      }
      S.go = null; draw();
    }
    // an interlude: beats that play themselves (a line, a few poses), skipped as a whole with Enter, Space or a click.
    // Each beat's `end` always runs, so a skipped scene still leaves the room the way it would have.
    async function interlude(beats) {
      S.inter = true; S.skip = false; cur = null; S.coach = null; draw();
      for (const b of beats) {
        if (!S.skip) {
          if (b.line) S.coach = b.line;
          if (b.set) b.set();
          draw();
          if (b.walk != null) await walkTo(b.walk, skipQ);
          else if (b.frames) for (const [fn, ms] of b.frames) { if (S.skip) break; fn(); draw(); await wait(ms, skipQ); }
          else await wait(b.ms || 1800, skipQ);
        }
        if (b.end) b.end();
      }
      S.inter = false; S.skip = false; S.coach = null; S.card = null; draw();
    }
    async function lesson(kind, lines, recap = false) {
      const Ls = LESSONS[kind]; lines = lines || Ls.lines;
      S.lesson = { kind, step: 0, recap }; S.phrase = null;
      for (let k = 0; k < lines.length; k++) { S.lesson.step = k; if (k >= Ls.n) sfx(Ls.rows.some(r => r.items[k] === r.items[k - Ls.n]) ? "bell" : "echoTick"); await talk([lines[k]]); }
      if (Ls.after.length && !recap) await talk(Ls.after);
      S.lesson = null; draw();
    }
    const card = (label, title, sub) => ({ set: () => { S.card = { label, title, sub }; sfx("card"); }, ms: 1300, end: () => S.card = null });

    /* ---- responses ---- */
    function error(stream, kind) {
      cur.err++;
      if (mode === "rehearsal") {
        S.staples++; S.click = true; blip([180, 120]); sfx("staple"); later(() => { S.click = false; draw(); }, 520);
        const pool = kind === "fa" ? R.fa : R.miss;
        S.coach = kind === "catch" ? R.catchFA[cur.catch] : explain(pick(pool, lineN++), stream, kind);
        if (S.staples >= 4) S.abort = true;
      } else {
        S.susp++; blip([140]);
        const order = S.hoodOrder, j = Math.floor((S.susp - 1) / 2);
        if (j < order.length) { S.hoods[order[j]] = Math.min(2, (S.hoods[order[j]] || 0) + 1); sfx("echoSwish"); }
        S.coach = R.turn[Math.min(S.susp - 1, R.turn.length - 1)];
        if (S.susp >= 6) S.abort = true;
      }
      draw();
    }
    // Iris's line, plus what actually happened: the item now and the item n turns ago
    function explain(line, stream, kind) {
      const c = cur; if (!c || c.i == null) return line;
      if (c.i < c.n) return kind === "fa" ? [line[0], line[1] + ` Nothing has come round yet: there's no turn ${c.n === 3 ? "three" : "two"} back.`] : line;
      const name = (s, k) => stream === "phrase" ? `"${c.set[s[k]]}"` : `the ${CHAIRS[s[k]].name.toLowerCase()} chair`;
      const s = stream === "phrase" ? c.sP : c.sS; if (!s) return line;
      const now = name(s, c.i), then = name(s, c.i - c.n), ago = c.n === 3 ? "three" : "two";
      const why = kind === "miss" ? ` ${now[0].toUpperCase() + now.slice(1)}, and ${ago} turns ago, ${then} too.` : ` ${ago[0].toUpperCase() + ago.slice(1)} turns ago was ${then}. This was ${now}.`;
      return [line[0], line[1] + why];
    }
    function answer(which) {
      if (!cur || !cur.open || S.paused || S.go || S.inter) return;
      const stream = which === "s" ? "phrase" : "seat";
      if (!S.streams[stream]) return;
      if (which === "s") { if (cur.saidS) return; cur.saidS = true; S.seconded = true; sfx("bell"); later(() => { S.seconded = false; draw(); }, 600); }
      else { if (cur.saidK) return; cur.saidK = true; S.knock = true; blip([90]); sfx("knock"); later(() => { S.knock = false; draw(); }, 420); }
      const target = cur.catch ? false : stream === "phrase" ? cur.pT : cur.sT;
      if (target) { T[stream].hits++; if (mode === "rehearsal" && Math.random() < .35) S.coach = pick(R.hit, lineN++); draw(); }
      else { T[stream].fa++; error(stream, cur.catch ? "catch" : "fa"); }
    }

    /* ---- Iris on her feet: she gets up, crosses the room in steps, and sits ---- */
    const standAt = (c) => ({ X: CHAIRS[c].X + (c === 1 ? -18 : 18), k: CHAIRS[c].k + .035 });
    async function walkTo(c, until) {
      const from = S.chair == null ? 2 : S.chair;
      if (from === c) { // the same chair again: she stands, turns round, and sits back down
        S.chair = null; S.walk = { ...standAt(c), pose: 0, flip: 1 }; draw(); await wait(160, until);
        S.walk = { ...S.walk, flip: -1 }; draw(); await wait(160, until);
        S.walk = null; S.chair = c; draw(); return;
      }
      const a = standAt(from), b = standAt(c), flip = b.X >= a.X ? 1 : -1;
      const steps = Math.max(2, Math.min(8, Math.round(Math.hypot(b.X - a.X, (b.k - a.k) * 600) / 55)));
      S.chair = null; S.walk = { ...a, pose: 0, flip }; draw(); await wait(150, until);
      for (let i = 1; i <= steps; i++) {
        if (until && until()) break;
        const t = i / steps; S.walk = { X: a.X + (b.X - a.X) * t, k: a.k + (b.k - a.k) * t, pose: i === steps ? 0 : 1 + (i % 2), flip };
        sfx("step", { room: "iris" }); draw(); await wait(120, until);
      }
      S.walk = null; S.chair = c; draw();
    }

    /* ---- one turn ---- */
    async function turn(pace, sP, sS, i, fresh) {
      const n = S.n, set = SETS[S.set || "PEER"][1];
      if (sP) { if (sP.length <= i) sP.push(nextItem(sP, n, set.length, rnd)); }
      if (sS) { if (sS.length <= i) sS.push(nextItem(sS, n, mode === "induction" ? N_SEATS : CHAIRS.length, rnd, .3, .2, fresh)); }
      const pT = !!(sP && isTarget(sP, i, n)), sT = !!(sS && isTarget(sS, i, n));
      if (mode === "rehearsal" && sS) { cur = null; await walkTo(sS[i]); }
      cur = { pT, sT, saidS: false, saidK: false, open: true, err: 0, i, sP, sS, n, set };
      S.turn++;
      if (mode === "induction") { S.seat = sS[i]; S.phrase = sP[i]; S.who = S.seat === QSEAT ? "QUORUM" : "A HOODED MEMBER"; onSeat(S.seat); }
      else { S.who = "IRIS"; S.phrase = sP ? sP[i] : null; S.chair = sS ? sS[i] : 2; if (sS) onSeat(S.chair); }
      sfx("echoTick");
      if (mode === "induction") { sfx("echoLamp"); sfx("echoHum", { lvl: Math.min(1, S.reading * .25 + (n === 3 ? .25 : 0) + S.susp * .08) }); }
      if (S.phrase != null) voice(S.who, set[S.phrase]);
      S.speaking = true; onTurn({ turn: S.turn - 1, n, phrase: S.phrase, seat: mode === "induction" ? S.seat : S.chair, phraseMatch: pT, seatMatch: sT });
      draw();
      const win = pace * .78;
      // Morris (opt-in), in the vent: on some matches his ear twitches, early in the turn
      if (opts.morris && mode === "induction" && (pT || sT) && flair() < .6) {
        await wait(win * .18); S.twitch = 1; draw(); await wait(win * .16); S.twitch = 2; draw(); await wait(win * .14); S.twitch = 0; draw(); await wait(win * .52);
      } else await wait(win);
      if (S.abort) return cur;
      S.speaking = false; S.phrase = null; if (mode === "induction") { S.seat = null; onSeat(-1); }
      draw();
      await wait(pace * .34); if (S.abort) return cur;
      cur.open = false;
      if (sP) { if (pT && !cur.saidS) { T.phrase.misses++; error("phrase", "miss"); } else if (!pT && !cur.saidS) T.phrase.cr++; }
      if (S.abort) return cur;
      if (sS && S.streams.seat) { if (sT && !cur.saidK) { T.seat.misses++; error("seat", "miss"); } else if (!sT && !cur.saidK) T.seat.cr++; }
      draw();
      return cur;
    }
    // a catch event between turns: something makes a noise that isn't a motion. Answering it is a false alarm on that
    // stream; silence is a correct rejection on each stream in play. It doesn't count as a turn and isn't in the Echo.
    async function catchEvent(kind, pace) {
      cur = { catch: kind, open: true, saidS: false, saidK: false, err: 0 };
      const fr = FX_FRAMES[kind], step = pace * .8 / fr.length;
      S.fx = { kind, pose: fr[0], label: R.evt[kind] };
      if (kind === "sneezeI") S.sneeze = 0;
      blip([kind === "gavel" ? 70 : 60]);
      let pf = -1, fi = 0;
      for (const f of fr) { if (S.abort) break; S.fx.pose = f; if (kind === "sneezeI") S.sneeze = f;
        const snd = kind === "sneeze" || kind === "sneezeI" ? (f !== pf && f ? ["echoSneeze", { ah: f === 1 }] : null) : FX_SOUND[kind] && FX_SOUND[kind](f, kind === "kettle" ? fi : pf);
        if (snd) Array.isArray(snd) ? sfx(...snd) : sfx(snd);
        pf = f; fi++; draw(); await wait(step); }
      S.fx = null; S.sneeze = 0; draw();
      if (!S.abort) await wait(pace * .25);
      cur.open = false;
      if (!S.abort) {
        let quiet = true;
        for (const st of ["phrase", "seat"]) if (S.streams[st]) { if (st === "phrase" ? cur.saidS : cur.saidK) quiet = false; else T[st].cr++; }
        if (quiet && mode === "rehearsal" && flair() < .5) S.coach = pick(R.catchOK, lineN++);
      }
      draw();
      return cur;
    }

    /* ---- the rehearsal ---- */
    const kept = { phrase: tally(), seat: tally() };
    let restarts = 0;
    const SCENES = {
      sherry: (v) => [
        { line: L("NARRATOR", "Iris pours herself a sherry. It is ten in the morning."), frames: [[() => { S.glass = 1; sfx("drip"); }, 1400], [() => S.glass = 2, 700], [() => S.glass = 1, 500]] },
        { line: pick(R.yarn62, v), frames: [[() => S.glass = 2, 900], [() => S.glass = 1, 2100]] },
        { line: L("IRIS", "Grant panel now. Same rule, worse words."), set: () => S.set = "GRANT", ms: 1800, end: () => { S.glass = 0; S.set = "GRANT"; } },
      ],
      kettle: (v) => [
        { line: L("IRIS", "Hold on. The kettle."), walk: 1, end: () => { S.walk = null; S.chair = 1; } },
        { line: L("NARRATOR", "The kettle comes to the boil. Iris lets it."), frames: [[() => { S.fx = { kind: "kettle", pose: 1 }; sfx("echoKettle"); }, 380], [() => S.fx.pose = 2, 380], [() => S.fx.pose = 1, 380], [() => S.fx.pose = 2, 380], [() => S.fx = null, 400]], end: () => S.fx = null },
        { line: pick(R.yarn74, v), ms: 2800 },
        { line: L("IRIS", "Chairs again. My hip has opinions."), ms: 1500 },
      ],
      toast: (v) => [
        { line: L("NARRATOR", "A second sherry. For the toasts."), frames: [[() => S.glass = 1, 1000], [() => { S.glass = 3; sfx("bell"); }, 900]] },
        { line: L("IRIS", "Toasts, now. The Board ends every meeting this way. It's the only item anyone remembers."), ms: 2600 },
        { line: pick(R.yarn74, v + 1), ms: 2600 },
        { line: L("IRIS", "Same rule. What was said, and where I sat."), set: () => S.set = "TOAST", ms: 1500, end: () => { S.glass = 0; S.set = "TOAST"; } },
      ],
    };
    async function drill(id) {
      const D = DRILLS[id], total = D.legs.reduce((a, l) => a + l.len, 0);
      for (let a = 0; ; a++) {
        Object.assign(S, { stage: id, streams: D.streams, turn: 0, len: total, staples: 0, abort: false, chair: 2, walk: null, n: 2, set: D.legs[0].set || null, tempo: D.legs[0].tempo[0], glass: 0, fx: null });
        T = { phrase: tally(), seat: tally() }; rnd = rng(); cur = null;
        const catches = placeCatches(total, D.catches, rnd);
        say(a ? pick(R.again, a - 1) : R["go" + id]); await wait(1500);
        let g = 0;
        for (let l = 0; l < D.legs.length && !S.abort; l++) {
          const leg = D.legs[l];
          if (l > 0) { await interlude(SCENES[D.between[l - 1]](a + restarts)); S.fx = null; }
          S.set = leg.set || null;
          const sP = D.streams.phrase ? makeStream(leg.len, 2, SETS[leg.set][1].length, rnd) : null, sS = D.streams.seat ? makeStream(leg.len, 2, CHAIRS.length, rnd) : null;
          for (let i = 0; i < leg.len && !S.abort; i++, g++) {
            S.tempo = Math.max(.82, leg.tempo[i] || 1);   // she hurries, but not past what a person can follow
            if (leg.cue[i]) S.coach = pick(R[leg.cue[i]], lineN++);
            await turn(P * D.base * S.tempo, sP, sS, i);
            if (!S.abort && catches.has(g) && i < leg.len - 1) await catchEvent(catches.get(g), P * D.base);
          }
        }
        cur = null; S.speaking = false; S.phrase = null; S.fx = null;
        if (!S.abort) { addT(kept.phrase, T.phrase); addT(kept.seat, T.seat); draw(); return; }
        restarts++; S.walk = null; S.chair = 2; draw(); await wait(900);
      }
    }
    async function rehearsal() {
      Object.assign(S, { stage: "A", chair: 2, streams: { phrase: false, seat: false } }); draw();
      await talk(R.introA);
      await lesson("phrase");
      await interlude([card("THE REHEARSAL", "THE DRILL", "THE PHRASES")]);
      await drill("A");
      // one drill is enough (the toasts drill, C, stays defined but unused): straight on to what Iris knows
      score("echoPhrases", 2); score("echoBoth", 2); S.len = 0; await talk(R.passA);
      S.set = null; await walkTo(2); await talk(R.passC);
      await lesson("three");
      const t = addT(addT(tally(), kept.phrase), kept.seat);
      return { passed: true, dprime: +dprime(t.hits, t.misses, t.fa, t.cr).toFixed(2), ...t, restarts };
    }

    /* ---- the induction ---- */
    async function deathCard(text) {
      if (opts.die) return opts.die(text);
      const d = document.createElement("div"); d.className = "edead";
      d.innerHTML = `<svg class="t" viewBox="0 0 640 360">${segC("DESK REJECTED", 320, 40, 26, "sR", 1.8)}
        <g data-b="revise" style="cursor:pointer"><rect class="fW" x="240" y="300" width="160" height="26"/>${segC("REVISE & RESUBMIT", 320, 309, 7, "s0", 1.2)}</g></svg>
        <div class="dt">${esc(text)}</div>`;
      root.appendChild(d);
      await new Promise((res, rej) => { d.addEventListener("click", (e) => { if (e.target.closest("[data-b=revise]")) res(); });
        const chk = () => alive ? timers.push(setTimeout(chk, 200)) : rej(CANCEL); chk(); });
      d.remove();
    }
    // who gets the floor when the Echo doesn't call for a repeat: round the table, the head of the table, or anyone
    function seatOrder(pattern) {
      const pool = pattern === "cluster" ? CLUSTER : SEATS.map((_, i) => i).filter(i => S.late || i !== LATE);
      let ptr = pattern === "round" ? pool.indexOf(QSEAT) - 1 : -1;
      return (tgt, last) => {
        if (pattern === "round") for (let s = 1; s <= pool.length; s++) { const c = pool[(ptr + s + pool.length) % pool.length]; if (c !== tgt && c !== last) { ptr = pool.indexOf(c); return c; } }
        let k, g = 0; do k = pool[Math.floor(rnd() * pool.length)]; while ((k === tgt || k === last) && ++g < 60);
        return k;
      };
    }
    const gutter = (out) => [[() => { S.gutter = 1; sfx("echoSwish"); }, 200], [() => S.gutter = 2, 200], [() => S.gutter = 1, 200], [() => S.gutter = 2, 200],
      [() => { S.gutter = 0; S.candles[out] = "out"; }, 700]];
    function interludeBeats(r, tries) {
      if (r === 0) return [card("THE ECHO", "FIRST READING", "ROUND THE TABLE")];
      if (r === 1) { const p = SEATS[LATE], a = [700, p.y + 38], b = [p.x + 36, p.y + 32];
        return [
          { line: L("NARRATOR", tries > 1 ? "Footsteps behind you again. The late member is late again." : "Footsteps behind you. A late member, hood up, in no particular hurry."),
            frames: Array.from({ length: 10 }, (_, i) => [() => { const t = i / 9; S.lateWalk = { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t - (i % 2 ? 2 : 0), k: p.k, step: i % 2 }; sfx("step", { room: "chamber" }); }, 150]),
            end: () => { S.lateWalk = null; S.late = true; } },
          { line: L("QUORUM", "You are late, Brother."), ms: 1500 },
          { line: L("A HOODED MEMBER", "Parking."), ms: 1200 },
          { line: L("NARRATOR", "The draft from the door finds the candles. They gutter. One goes out."), frames: gutter(0), end: () => { S.gutter = 0; S.candles[0] = "out"; } },
          card("THE ECHO", "SECOND READING", "THE HEAD OF THE TABLE"),
        ]; }
      return [
        { set: () => { S.cam = "close"; S.minutes = true; }, line: L("QUORUM", "From the minutes. 'Item one. Approval of the minutes.' Approved. As in 1962."),
          frames: [[() => S.qSpeak = true, 700], [() => S.qSpeak = false, 300], [() => S.qSpeak = true, 700], [() => S.qSpeak = false, 300], [() => S.qSpeak = true, 700], [() => S.qSpeak = false, 300]], end: () => S.qSpeak = false },
        { line: L("QUORUM", "'Item two. Whether anyone at this table is not one of us.' Carried over."), frames: [[() => S.qSpeak = true, 900], [() => S.qSpeak = false, 1100]], end: () => { S.qSpeak = false; S.minutes = false; } },
        { set: () => S.cam = "wide", line: L("NARRATOR", "The hood beside you leans in. Closer. It sniffs."),
          frames: [[() => { S.sniff = 1; sfx("echoSwish"); }, 400], [() => { S.sniff = 2; sfx("echoSneeze", { ah: true }); }, 700], [() => S.sniff = 1, 250], [() => S.sniff = 2, 700]], end: () => { S.cam = "wide"; } },
        { line: L("A HOODED MEMBER", "...Sherry. Good."), frames: [[() => S.sniff = 1, 600], [() => S.sniff = 0, 700]], end: () => S.sniff = 0 },
        { line: L("NARRATOR", "The ring hums. By the Gain Controller, Preston twitches, like a man who has heard his name in another room."),
          frames: [[() => { S.humPulse = 1; sfx("echoHum", { lvl: 1 }); }, 300], [() => { S.humPulse = 2; S.pTwitch = 1; sfx("blank"); sfx("spark"); }, 300], [() => { S.humPulse = 1; S.pTwitch = 2; }, 300], [() => { S.humPulse = 2; S.pTwitch = 1; }, 300],
            [() => { S.humPulse = 0; S.pTwitch = 0; }, 500], ...gutter(3)], end: () => { S.humPulse = 0; S.pTwitch = 0; S.gutter = 0; S.candles[3] = "out"; } },
        card("THE ECHO", "THIRD READING", "THE FLOOR IS OPEN"),
      ];
    }
    async function induction() {
      const LEN = READINGS.reduce((a, r) => a + r.len, 0);
      for (let tries = 1; ; tries++) {
        rnd = rng();
        const others = SEATS.map((_, i) => i).filter(i => i !== QSEAT);
        for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
        Object.assign(S, { n: 2, turn: 0, len: 0, susp: 0, hoods: {}, hoodOrder: others.slice(0, 3), closing: false, abort: false, seat: null, phrase: null,
          streams: { phrase: true, seat: false }, cam: "wide", reading: 0, late: false, lateWalk: null, sniff: 0, pTwitch: 0, qSpeak: false, minutes: false,
          hum: 0, humPulse: 0, gutter: 0, candles: ["lit", "lit", "lit", "lit"], burn: 0, fx: null, twitch: 0, sneeze: 0 });
        T = { phrase: tally(), seat: tally() }; cur = null; draw();
        // the roll call: each lamp lights once, around the table
        for (let i = 0; i < N_SEATS; i++) { S.seat = i; sfx("echoLamp"); draw(); await wait(110); }
        S.seat = null; draw();
        await talk(tries === 1 ? R.introI : R.retryI);
        if (tries === 1) await lesson("phrase", R.recapI, true);
        let g = 0, streak = 0, clean = 0, deep = 0, advanced = false;
        // after every turn or catch: suspicion relaxes after three clean answers; three errors in a row advance the Echo
        const after = async (c, t, isTurn) => {
          if (c.err) { streak++; clean = 0; } else { streak = 0; if (++clean >= 3 && S.susp > 0) { clean = 0; relax(); say(R.relax); } }
          if (isTurn && deep > 0 && --deep === 0 && t < LEN - 1) { S.n = 2; say(R.retreat); draw(); await wait(1600); }
          if (streak >= 3 && t < LEN - 2) {
            streak = 0; deep = 6;
            if (S.n === 3) { say(R.still); sfx("echoAdvance"); await wait(1400); }
            else { S.n = 3; advanced = true; say(R.advance); blip([110, 90]); sfx("echoAdvance"); await wait(2200); say(R.advNell); await wait(1600); }
          }
        };
        for (let r = 0; r < READINGS.length && !S.abort; r++) {
          const rd = READINGS[r];
          await interlude(interludeBeats(r, tries));
          Object.assign(S, { reading: r, cam: rd.cam, hum: r, len: LEN }); draw(); await wait(r ? 500 : 900);
          const sP = [], sS = [], fresh = seatOrder(rd.pattern);
          const catches = placeCatches(rd.len, rd.catches.map(k => k === "gavel" && r === 2 && opts.morris ? "sneezeI" : k), rnd);
          for (let i = 0; i < rd.len; i++, g++) {
            const c = await turn((S.n === 3 ? P * 1.15 : P) * rd.tempo, sP, sS, i, fresh);
            S.burn = (g + 1) / LEN;
            if (S.abort) break;
            await after(c, g, true);
            if (catches.has(i)) { const k = await catchEvent(catches.get(i), P * rd.tempo); if (S.abort) break; await after(k, g, false); }
          }
        }
        cur = null; S.seat = null; S.phrase = null; S.speaking = false; S.fx = null;
        if (S.abort) {
          onSeat(-1); S.coach = null; draw(); await wait(500);
          S.closing = true; S.coach = L("NARRATOR", "The hoods close in."); draw(); blip([200, 150, 100]); sfx("echoClose"); await wait(1800);
          await deathCard(R.death);
          continue;
        }
        S.cam = "wide"; draw(); sfx("echoCarries"); await talk(R.passI);
        score("echoInduction", 5);
        const t = addT(addT(tally(), T.phrase), T.seat);
        return { passed: true, dprime: +dprime(t.hits, t.misses, t.fa, t.cr).toFixed(2), advanced, ...t, tries };
      }
    }
    function relax() { // the most recently turned hood turns back one notch
      S.susp--;
      const j = Math.floor(S.susp / 2), h = S.hoodOrder[j]; if (h != null) { S.hoods[h] = Math.max(0, (S.hoods[h] || 0) - 1); sfx("echoSwish"); }
    }

    /* ---- input and cleanup ---- */
    const onClick = (e) => {
      if (S.inter && !S.paused) { S.skip = true; return; }
      const b = e.target.closest && e.target.closest("[data-b]"); if (!b) return;
      const k = b.dataset.b;
      if (k === "go" && S.go) S.go(); else if (k === "s") answer("s"); else if (k === "k" || k === "knock") answer("k");
    };
    const onKey = (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (S.paused) { e.preventDefault(); if (k === "escape") finish({ passed: false, quit: true }); else { S.paused = false; draw(); } return; }
      if (k === "escape") { e.preventDefault(); S.paused = true; draw(); return; }
      if ((k === "enter" || k === " ") && S.go) { e.preventDefault(); S.go(); return; }
      if ((k === "enter" || k === " ") && S.inter) { e.preventDefault(); S.skip = true; return; }
      if (k === "s" || k === " ") { e.preventDefault(); answer("s"); }      // SECONDED
    };
    function finish(result) {
      if (!alive) return;
      alive = false; timers.forEach(clearTimeout); onSeat(-1);
      el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey, true);
      el.classList.remove("show"); el.innerHTML = "";
      resolve(result);
    }
    el.classList.add("show");
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey, true);
    (mode === "induction" ? induction() : rehearsal()).then(finish, (e) => { if (e !== CANCEL) { console.error(e); finish({ passed: false, error: String(e) }); } });
  });
}
