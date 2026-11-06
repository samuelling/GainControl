// THE ECHO (Act IV, THE REHEARSAL; Act V, THE INDUCTION). The Round Table's oldest ritual is a working-memory test.
// Phrases of peer-review boilerplate come around the table, one per turn: answer SECONDED (S) when the phrase is the
// one from two turns ago. Seats speak in turn: KNOCK (K) when the seat that speaks is the one from two turns ago.
// Silence is correct otherwise. Nobody ever calls it a dual 2-back.
//
//   echo(el, { mode: "rehearsal" | "induction", pace, seed, score, die, onSeat, onTurn, blip })
//     rehearsal → { passed: true, dprime, hits, misses, fa, cr, restarts }  (Iris's office: three drills, can't fail)
//     induction → { passed: true, dprime, advanced, hits, misses, fa, cr, tries }  (B3: hoods turn; three = death)
//     either    → { passed: false, quit: true } if the player leaves with Esc, Esc.
import { seg, segC, chip, chipW, arcs, star4, perspective, shell } from "../gfx.js";
import { AUD } from "../figures.js";
import { irisSeated } from "../cast/act3a.js";

/* ---------------- words ---------------- */
export const PHRASES = [
  "THE AUTHORS SHOULD CONSIDER…", "THE SAMPLE SIZE IS SMALL", "THE NOVELTY IS UNCLEAR", "PLEASE CITE THE RELEVANT WORK",
  "FURTHER RESEARCH IS NEEDED", "THE EFFECT MAY BE AN ARTIFACT", "THE DISCUSSION OVERREACHES", "THE FIGURES ARE HARD TO READ",
  "THE LIMITATIONS ARE NOT ADDRESSED", "THIS IS OUTSIDE THE SCOPE OF THE JOURNAL", "THE CONCLUSIONS DO NOT FOLLOW", "I REMAIN UNCONVINCED",
];
const COL = { IRIS: "V", QUORUM: "R", NELL: "G", NARRATOR: "W", "A HOODED MEMBER": "V" };
const L = (who, text) => [who, text];
const R = {
  introA: [
    L("IRIS", "The Echo. We did it in 1962 with sherry. You answer the phrase that comes back around after one other."),
    L("IRIS", "Miss two and they look at you. Miss three and you're quarry."),
    L("IRIS", "I'll be the Board. When a phrase comes back after one other, you say SECONDED. Otherwise you sit there and look tenured."),
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
  introB: [
    L("IRIS", "At an induction, the Board watches who speaks, too. If the same seat speaks as two turns ago, you knock the table."),
    L("IRIS", "These are my chairs. Knock when I sit where I sat two turns ago. My knees have one more drill in them."),
    L("NELL", "That one's the staple gun's chair."),
    L("IRIS", "Today it's the kettle's. Watch the chairs, not my face."),
  ],
  goB: L("IRIS", "Watch where I land."),
  faB: [L("IRIS", "I didn't sit there two turns ago. I'd remember. I'm the one with the hip."), L("IRIS", "Wrong chair, dear.")],
  missB: [L("IRIS", "Same chair as two ago. You sat there like furniture."), L("IRIS", "I came back to that chair. You didn't notice. They would.")],
  passB: [L("IRIS", "Good. My hip says that's enough chairs for one century.")],
  introC: [
    L("IRIS", "Now both. What was said, and who said it. Phrase and seat, both at once."),
    L("IRIS", "Two things at once is harder than either one alone. That isn't a theory. That's every faculty meeting since 1961."),
  ],
  goC: L("IRIS", "Both. Begin."),
  passC: [
    L("IRIS", "There. Their founders published that the Echo makes you smarter. 1979. Nobody has ever replicated it."),
    L("NELL", "Does it? Make you smarter?"),
    L("IRIS", "It makes them agree. That isn't the same thing. It isn't even close."),
    L("IRIS", "One more thing. If he suspects someone, the Corresponding Author 'advances the Echo.' Three back. Nobody likes that."),
    L("IRIS", "Wear the hood low. Answer late rather than wrong. And don't look at me if you see me."),
  ],
  introI: [
    L("NARRATOR", "Twelve lamps. Twelve hoods. A ring of iron the size of a carousel, and the faint smell of sherry."),
    L("QUORUM", "The Echo. As it was in 1962, and as it shall be."),
    L("NELL", "Phrase back around: seconded. Seat back around: knock. Otherwise, silence. Otherwise, silence."),
  ],
  retryI: [L("NARRATOR", "The lamps go dark. The Board settles its robes. Someone pours another sherry."), L("QUORUM", "The Echo. Again, from the beginning.")],
  turn: [L("NARRATOR", "A hood turns toward you."), L("NARRATOR", "That hood is looking straight at you now."), L("NARRATOR", "Another hood turns."),
    L("NARRATOR", "Two of them are looking at you now."), L("NARRATOR", "A third hood turns. Slowly."), L("NARRATOR", "Three hoods.")],
  relax: L("NARRATOR", "A hood turns back to the table. Someone coughs."),
  advance: L("QUORUM", "Let us advance the Echo."),
  advNell: L("NELL", "Three back. Juggle three. One lands, the oldest drops."),
  still: L("QUORUM", "The Echo remains advanced."),
  retreat: L("QUORUM", "The Echo returns to its customary depth."),
  passI: [L("QUORUM", "The motion carries."),
    L("NARRATOR", "The hoods face the table again. Nobody in this room has heard of signal detection theory, and you have just passed theirs.")],
  death: "The authors have failed to address the reviewers' concerns.",
};
const pick = (a, i) => a[i % a.length];

/* ---------------- sequences and scoring ---------------- */
// one item for turn i = s.length: a target (the item n back) about pT of the time, a lure (n-1 or n+1 back, never a
// target) about pL of the time, otherwise a fresh item that isn't the last one or the n-back one.
export function nextItem(s, n, nItems, rnd, pT = .3, pL = .2) {
  const i = s.length, back = (k) => s[i - k], tgt = i >= n ? back(n) : -1, r = rnd();
  if (tgt >= 0 && r < pT) return tgt;
  if (r < pT + pL) {
    const lures = [n - 1, n + 1].filter(k => k >= 1 && i >= k).map(back).filter(x => x !== tgt);
    if (lures.length) return lures[Math.floor(rnd() * lures.length)];
  }
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

/* ---------------- drawing: Iris's office ---------------- */
const VH = 250;                                    // the scene's native height (640 × 250 over the bar)
const OP = perspective(320, 92, .55, VH);
const oFloor = (k) => OP.P(0, VH, k)[1];
const CHAIRS = [["WINDOW", 120, .62], ["KETTLE", 468, .64], ["DESK", 236, .8], ["GUEST", 504, .86]]
  .map(([name, X, k]) => ({ name, k, x: OP.P(X, 0, k)[0], y: oFloor(k), q: k * AUD }));
function chair({ x, y, q }, cls) {
  const w = 24 * q, sh = 46 * q, d = 8 * q, bt = 104 * q;
  return `<path class="hl ${cls}" d="M${x - w + 4 * q},${y - sh - d} L${x - w + 5 * q},${y - 7 * q} M${x + w - 4 * q},${y - sh - d} L${x + w - 5 * q},${y - 7 * q}"/>
    <path class="k ${cls}" d="M${x - w + 4 * q},${y - sh - d} L${x - w + 4 * q},${y - bt + 6 * q} Q${x - w + 4 * q},${y - bt} ${x - w + 10 * q},${y - bt} L${x + w - 10 * q},${y - bt} Q${x + w - 4 * q},${y - bt} ${x + w - 4 * q},${y - bt + 6 * q} L${x + w - 4 * q},${y - sh - d} Z"/>
    <path class="hl ${cls}" d="M${x - w + 9 * q},${y - bt + 12 * q} L${x + w - 9 * q},${y - bt + 12 * q}"/>
    <polygon class="k ${cls}" points="${x - w},${y - sh} ${x + w},${y - sh} ${x + w - 4 * q},${y - sh - d} ${x - w + 4 * q},${y - sh - d}"/>
    <path class="${cls}" d="M${x - w},${y - sh} L${x - w},${y} M${x + w},${y - sh} L${x + w},${y}"/>`;
}
function office(S) {
  let s = shell(OP, { rail: 0 });
  // back wall: the window, the 1968 photo of the ring, the stopped clock; journal towers; the kettle on a cabinet
  s += `<rect class="k hl sD mech" x="176" y="64" width="58" height="56"/><path class="hl sD" d="M205,64 L205,120 M176,92 L234,92"/>
    <rect class="k hl sD mech" x="300" y="70" width="34" height="26"/><ellipse class="hl sD" cx="317" cy="83" rx="7" ry="8"/><ellipse class="hl sD" cx="317" cy="83" rx="3.5" ry="4"/>
    <circle class="hl sD" cx="378" cy="78" r="7"/><path class="hl sD" d="M378,78 L378,73 M378,78 L374,80"/>
    <rect class="k hl sD mech" x="440" y="136" width="30" height="${(oFloor(.55) - 136).toFixed(1)}"/><path class="hl sD" d="M445,146 L465,146 M445,158 L465,158"/>
    <path class="k hl sD" d="M447,136 L448,126 C448,121 458,121 458,126 L459,136 Z M448,129 L443,125"/>`;
  [[-30, .6, 9], [10, .58, 6], [-10, .7, 12]].forEach(([X, k, n]) => {
    const x = OP.P(X, 0, k)[0], y = oFloor(k), q = k * AUD;
    for (let i = 0; i < n; i++) s += `<rect class="k hl sD mech" x="${(x - 17 * q + ((i * 37) % 7 - 3) * q).toFixed(1)}" y="${(y - (i + 1) * 9 * q).toFixed(1)}" width="${(34 * q).toFixed(1)}" height="${(9 * q).toFixed(1)}"/>`;
  });
  // the chairs, back to front; Iris in whichever one she is in
  const drill = S.stage !== "A";
  CHAIRS.forEach((c, i) => {
    const lit = drill && S.chair === i && S.speaking, ir = S.stage === "A" ? i === 2 : S.chair === i;
    s += chair(c, lit ? "sV" : "sD");
    s += segC(c.name, c.x, c.y + 4, 4.2 * c.k / .7, lit ? "sV" : "sD", .6);
    if (ir) {
      const sy = c.y - 50 * c.q + 11 * c.q;
      s += irisSeated(c.x, sy, c.k);
      if (S.speaking) s += arcs(c.x + 22 * c.q, sy - 104 * c.q, 1, "hl sV", 3, c.q * 1.4);
    }
  });
  return s + sleeve(S);
}
// the foreground: Nell's arm on the desk, three staples' worth of sleeve, and Iris's staple gun
function sleeve(S) {
  let s = `<path class="k sM mech" d="M-2,214 L190,214 L190,252 L-2,252 Z"/><path class="hl sM" d="M-2,219 L190,219"/>
    <path class="k sG" d="M-4,252 L4,226 L44,214 L58,238 L46,252 Z"/><path class="hl sG" d="M40,216 L54,240"/>
    <path class="sK" d="M52,222 L104,208 M57,236 L106,219"/><path class="k sK" d="M103,207 C111,203 120,206 120,212 C120,218 113,220 106,219"/>
    <path class="sK" d="M110,206 L112,203 M115,206 L117,203"/>`;
  for (let i = 0; i < 3; i++) {
    const x = 14 + i * 11, y = 238 - i * 4;
    if (i < S.staples) s += `<path class="sW" d="M${x},${y + 4} L${x},${y} L${x + 7},${y - 2} L${x + 7},${y + 2}"/>`;
  }
  // the meter: tiny label above, three staples
  s += seg("STAPLES", 134, 224, 4, "sM", .6);
  for (let i = 0; i < 3; i++) s += `<path class="${i < S.staples ? "sR" : "hl sD"}" d="M${136 + i * 12},${241} L${136 + i * 12},${234} L${144 + i * 12},${234} L${144 + i * 12},${241}"/>`;
  // the staple gun: resting (pose 0) or fired at the sleeve (pose 1)
  const gun = (x, y) => `<path class="k sR" d="M${x},${y} L${x + 44},${y} L${x + 46},${y + 8} L${x + 4},${y + 8} Z"/>
    <path class="k sR" d="M${x + 12},${y + 8} L${x + 8},${y + 24} L${x + 19},${y + 24} L${x + 24},${y + 8}"/><path class="hl sR" d="M${x + 4},${y + 4} L${x + 40},${y + 4}"/>`;
  if (S.click) s += gun(22, 192) + star4(28, 222, 7, "sA") + arcs(60, 214, 1, "hl sR", 3, .8) + arcs(10, 214, -1, "hl sR", 3, .8) + seg("CLICK", 56, 172, 12, "sR", 1.4);
  else s += gun(30, 150);
  return s;
}

/* ---------------- drawing: the Round Table ---------------- */
const TC = [320, 176];                              // table centre
const N_SEATS = 12, QSEAT = 6;
const SEATS = Array.from({ length: N_SEATS }, (_, i) => {
  const th = (40 + i * 280 / 11) * Math.PI / 180, c = Math.cos(th), sn = Math.sin(th);
  return { th, c, x: TC[0] - 236 * sn, y: TC[1] + 58 * c, lx: TC[0] - 166 * sn, ly: TC[1] + 30 * c, k: .55 + .45 * (1 + c) / 2 };
});
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
function lamp(x, y, k, on) {
  const f = (v) => v.toFixed(1), w = 4 * k, h = 10 * k;
  let s = `<path class="hl ${on ? "sA" : "sD"}" d="M${f(x - 3 * k)},${f(y)} L${f(x + 3 * k)},${f(y)} M${f(x)},${f(y)} L${f(x)},${f(y - h * .6)}"/>`;
  s += `<path class="${on ? "fA" : "k hl sD"}" d="M${f(x - w)},${f(y - h * .6)} L${f(x + w)},${f(y - h * .6)} L${f(x + w * .6)},${f(y - h)} L${f(x - w * .6)},${f(y - h)} Z"/>`;
  if (on) s += `<path class="hl sA" d="M${f(x - w * 1.3)},${f(y - h * .45)} L${f(x - w * 2.2)},${f(y + 1)} M${f(x + w * 1.3)},${f(y - h * .45)} L${f(x + w * 2.2)},${f(y + 1)} M${f(x)},${f(y - h * 1.3)} L${f(x)},${f(y - h * 1.9)}"/>`;
  return s;
}
const CP = perspective(320, 64, .4, VH);
function chamber(S) {
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
  // the Gain Controller on its plinth (back right), and Preston beside it, hooded, earbuds lit
  s += `<path class="k sM mech" d="M582,104 L618,104 L615,146 L585,146 Z"/><rect class="k sW mech" x="586" y="90" width="28" height="14"/>
    <circle class="hl sW" cx="594" cy="97" r="4"/><path class="hl sW" d="M594,97 L596.5,94"/><rect class="fG" x="601" y="95" width="9" height="3"/>`;
  s += hood(562, 118, .5, 2, "sV") + `<circle class="fG" cx="557" cy="95.5" r="1.1"/><circle class="fG" cx="567" cy="95.5" r="1.1"/>`
    + arcs(553, 95, -1, "hl sG", 3, .45) + arcs(571, 95, 1, "hl sG", 3, .45);
  // seats behind the table's centre line, the table, its lamps, then the near seats
  const close = S.closing, pos = (i) => { const p = SEATS[i]; return close ? { ...p, x: 320 + (p.x - 320) * .78, y: p.y + 30, k: p.k * 1.5 } : p; };
  const notch = (i) => close ? 2 : i === QSEAT ? (S.n === 3 ? 2 : 0) : S.hoods[i] || 0;
  const seat = (i) => { const p = pos(i), lit = S.seat === i && !close;
    return hood(p.x, p.y, p.k, notch(i), lit ? "sW" : "sV", { medals: i === QSEAT, speak: lit && S.speaking }); };
  const order = SEATS.map((p, i) => i).sort((a, b) => SEATS[a].y - SEATS[b].y);
  order.filter(i => SEATS[i].c < 0).forEach(i => s += seat(i));
  s += `<g data-b="knock" style="cursor:pointer"><path class="k sW" d="M${TC[0] - 200},${TC[1]} L${TC[0] - 200},${TC[1] + 9} A200,40 0 0 0 ${TC[0] + 200},${TC[1] + 9} L${TC[0] + 200},${TC[1]} Z"/>
    <ellipse class="k sW" cx="${TC[0]}" cy="${TC[1]}" rx="200" ry="40"/><ellipse class="hl sD" cx="${TC[0]}" cy="${TC[1]}" rx="120" ry="22"/>
    <circle class="hl sX" cx="${TC[0]}" cy="${TC[1]}" r="9"/><circle class="fX" cx="${TC[0]}" cy="${TC[1]}" r="3.6"/></g>`;
  // the skull gavel, by Quorum's lamp
  { const p = SEATS[QSEAT]; s += `<path class="sA" d="M${p.lx + 14},${p.ly + 6} L${p.lx + 28},${p.ly + 2}"/><rect class="k sA mech" x="${p.lx + 26}" y="${p.ly - 3}" width="7" height="9"/><circle class="k sW" cx="${p.lx + 29.5}" cy="${p.ly - 6}" r="3"/>`; }
  SEATS.forEach((p, i) => s += lamp(p.lx, p.ly, .6 + .5 * p.k, S.seat === i && !close));
  order.filter(i => SEATS[i].c >= 0).forEach(i => s += seat(i));
  if (close) SEATS.forEach((p, i) => s += `<path class="hl sR" d="M${pos(i).x},${pos(i).y - 60 * pos(i).k} L${(pos(i).x + (320 - pos(i).x) * .12).toFixed(1)},${(pos(i).y - 50 * pos(i).k).toFixed(1)}"/>`);
  // Nell, in Gus's robe: two sleeves on the near rim; a knock is drawn
  s += `<path class="k sV" d="M262,252 L272,226 L292,224 L296,252 Z M378,252 L368,226 L348,224 L344,252 Z"/>`;
  if (S.knock) s += `<path class="k sK" d="M288,222 C288,214 300,212 304,218 C306,224 300,228 292,228 Z"/>` + arcs(310, 220, 1, "hl sW", 3, .7) + arcs(282, 220, -1, "hl sW", 3, .7) + seg("KNOCK", 270, 196, 10, "sA", 1.2);
  else s += `<path class="k sK" d="M286,224 C284,218 294,214 300,218 C303,221 300,226 292,226 Z"/>`;
  s += `<path class="k sK" d="M354,224 C356,218 346,214 340,218 C337,221 340,226 348,226 Z"/>`;
  if (S.seconded) s += chip("SECONDED", 330, 196, 8, "fG");
  return s;
}
const ADV = "THE ECHO IS ADVANCED  -  THREE BACK";
const readout = (label, val, x, y, cls, h = 15) => seg(label, x, y, 4.2, "sM", .6) + seg(val, x, y + 7, h, cls, 1.1);
const pad = (v) => String(v).padStart(2, "0");

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
.echo .etl{margin-left:auto;font-size:1.2cqw;color:var(--M);letter-spacing:.06em;white-space:nowrap}
.echo .etl b{color:var(--W);font-weight:600}
.echo .edead{position:absolute;inset:0;background:#000;z-index:2}
.echo .edead .dt{position:absolute;left:14%;right:14%;top:30%;font-size:2.6cqw;line-height:1.18}
`;
function injectCSS() {
  if (document.getElementById("echo-css")) return;
  const st = document.createElement("style"); st.id = "echo-css"; st.textContent = CSS; document.head.appendChild(st);
}
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* ---------------- the minigame ---------------- */
export function echo(el, opts = {}) {
  injectCSS();
  const mode = opts.mode === "induction" ? "induction" : "rehearsal";
  const P = opts.pace || 2400, score = opts.score || (() => {}), blip = opts.blip || (() => {});
  const onSeat = opts.onSeat || (() => {}), onTurn = opts.onTurn || (() => {});
  let attemptSeed = 0;
  const rng = () => opts.seed != null ? mulberry(opts.seed * 7919 + (attemptSeed++) * 104729) : Math.random;

  return new Promise(resolve => {
    const S = { stage: mode === "induction" ? "I" : "A", n: 2, turn: 0, len: 0, phrase: null, who: "IRIS", chair: null, seat: null,
      speaking: false, staples: 0, click: false, knock: false, seconded: false, hoods: {}, susp: 0, closing: false,
      coach: null, go: null, paused: false, abort: false, streams: { phrase: false, seat: false } };
    let T = { phrase: tally(), seat: tally() }, cur = null, alive = true, rnd = Math.random, lineN = 0;
    const timers = [], CANCEL = {};
    const later = (f, ms) => timers.push(setTimeout(() => alive && f(), ms));
    // pausable, cancellable sleep
    const wait = (ms) => new Promise((res, rej) => {
      let left = ms, last = performance.now();
      const tick = () => { if (!alive) return rej(CANCEL); const now = performance.now(); if (!S.paused) left -= now - last; last = now;
        if (left <= 0) res(); else timers.push(setTimeout(tick, Math.min(left, 40))); };
      tick();
    });

    el.innerHTML = `<div class="echo" data-mode="${mode}"><svg class="t scene" viewBox="0 0 640 ${VH}"></svg>
      <div class="ebar"><div class="eph"></div><div class="eco"></div><div class="ectl"></div></div></div>`;
    const root = el.querySelector(".echo"), svg = root.querySelector("svg"), eph = root.querySelector(".eph"), eco = root.querySelector(".eco"), ectl = root.querySelector(".ectl");

    function draw() {
      if (!alive) return;
      const sum = addT(addT(tally(), T.phrase), T.seat);
      let hud = "";
      if (mode === "rehearsal") {
        const st = { A: ["DRILL 1", "THE PHRASES"], B: ["DRILL 2", "THE CHAIRS"], C: ["DRILL 3", "BOTH AT ONCE"] }[S.stage];
        hud = segC("THE REHEARSAL", 320, 8, 9, "sW", 1.2) + segC(`${st[0]}  -  ${st[1]}`, 320, 22, 4.4, "sM", .7)
          + readout("TURN", S.len ? `${pad(S.turn)}/${pad(S.len)}` : "--", 566, 8, "sW");
        svg.innerHTML = office(S) + hud;
      } else {
        const turned = Object.values(S.hoods).filter(v => v >= 2).length;
        hud = readout("TURN", S.len ? `${pad(S.turn)}/${pad(S.len)}` : "--", 18, 8, "sW")
          + readout("HOODS TURNED", `${turned}/3`, 566, 8, turned >= 2 ? "sR" : "sW")
          + (S.n === 3 ? chip(ADV, 320 - chipW(ADV, 6.6) / 2, 6, 6.6, "fR") : segC("THE ECHO  -  TWO BACK", 320, 10, 5, "sM", .7));
        svg.innerHTML = chamber(S) + hud;
      }
      root.dataset.n = S.n; root.dataset.turn = S.turn; root.dataset.stage = S.stage;
      root.dataset.seat = S.seat == null ? "" : S.seat; root.dataset.chair = S.chair == null ? "" : S.chair;
      const pc = COL[S.who] || "V";
      eph.innerHTML = S.phrase != null ? `<span class="spk" style="background:var(--${pc})">${S.who}</span><span style="color:var(--${pc})" data-p="${S.phrase}">${esc(PHRASES[S.phrase])}</span>`
        : S.speaking && S.stage === "B" ? `<span class="spk" style="background:var(--V)">IRIS</span><span style="color:var(--M)">(SITS.)</span>` : "";
      if (S.paused) eco.innerHTML = `<span class="spk" style="background:var(--W)">PAUSED</span><span style="color:var(--W)">LEAVE ${mode === "induction" ? "THE TABLE" : "THE DRILL"}? ESC AGAIN TO LEAVE. ANY OTHER KEY TO STAY.</span>`;
      else if (S.coach) { const c = COL[S.coach[0]] || "W"; eco.innerHTML = `<span class="spk" style="background:var(--${c})">${S.coach[0]}</span><span style="color:var(--${c})">${esc(S.coach[1])}</span>`; }
      else eco.innerHTML = "";
      eco.classList.toggle("talk", !!S.go);
      let ctl = "";
      if (S.go) ctl = `<div class="eb go" data-b="go">GO ON <small>ENTER</small></div>`;
      else if (cur || S.len) {
        if (S.streams.phrase) ctl += `<div class="eb s ${cur && cur.saidS ? "used" : ""}" data-b="s">SECONDED. <small>S</small></div>`;
        if (S.streams.seat) ctl += `<div class="eb k ${cur && cur.saidK ? "used" : ""}" data-b="k">KNOCK <small>K</small></div>`;
      }
      ctl += `<span class="etl">HITS <b>${sum.hits}</b> · MISSES <b>${sum.misses}</b> · FALSE ALARMS <b>${sum.fa}</b> · SILENCES <b>${sum.cr}</b></span>`;
      ectl.innerHTML = ctl;
    }
    const say = (line) => { S.coach = line; draw(); };
    // lines that wait for the player
    async function talk(lines) {
      for (const ln of lines) {
        S.coach = ln;
        await new Promise((res, rej) => { S.go = res; draw(); const chk = () => alive ? timers.push(setTimeout(chk, 200)) : rej(CANCEL); chk(); });
      }
      S.go = null; draw();
    }

    /* ---- responses ---- */
    function error(stream, kind) {
      cur.err++;
      if (mode === "rehearsal") {
        S.staples++; S.click = true; blip([180, 120]); later(() => { S.click = false; draw(); }, 520);
        const pool = S.stage === "B" || (S.stage === "C" && stream === "seat") ? (kind === "fa" ? R.faB : R.missB) : (kind === "fa" ? R.fa : R.miss);
        S.coach = pick(pool, lineN++);
        if (S.staples >= 3) S.abort = true;
      } else {
        S.susp++; blip([140]);
        const order = S.hoodOrder, j = Math.floor((S.susp - 1) / 2);
        if (j < order.length) S.hoods[order[j]] = Math.min(2, (S.hoods[order[j]] || 0) + 1);
        S.coach = R.turn[Math.min(S.susp - 1, R.turn.length - 1)];
        if (S.susp >= 6) S.abort = true;
      }
      draw();
    }
    function answer(which) {
      if (!cur || !cur.open || S.paused || S.go) return;
      const stream = which === "s" ? "phrase" : "seat";
      if (!S.streams[stream]) return;
      if (which === "s") { if (cur.saidS) return; cur.saidS = true; S.seconded = true; later(() => { S.seconded = false; draw(); }, 600); }
      else { if (cur.saidK) return; cur.saidK = true; S.knock = true; blip([90]); later(() => { S.knock = false; draw(); }, 420); }
      const target = stream === "phrase" ? cur.pT : cur.sT;
      if (target) { T[stream].hits++; if (mode === "rehearsal" && Math.random() < .35) S.coach = pick(R.hit, lineN++); draw(); }
      else { T[stream].fa++; error(stream, "fa"); }
    }

    /* ---- one turn ---- */
    async function turn(pace, sP, sS) {
      const i = S.turn, n = S.n;
      if (sP) { if (sP.length <= i) sP.push(nextItem(sP, n, PHRASES.length, rnd)); }
      if (sS) { if (sS.length <= i) sS.push(nextItem(sS, n, mode === "induction" ? N_SEATS : CHAIRS.length, rnd)); }
      const pT = !!(sP && isTarget(sP, i, n)), sT = !!(sS && isTarget(sS, i, n));
      cur = { pT, sT, saidS: false, saidK: false, open: true, err: 0 };
      S.turn = i + 1;
      if (mode === "induction") { S.seat = sS[i]; S.phrase = sP[i]; S.who = S.seat === QSEAT ? "QUORUM" : "A HOODED MEMBER"; onSeat(S.seat); }
      else { S.who = "IRIS"; S.phrase = sP ? sP[i] : null; S.chair = sS ? sS[i] : 2; if (sS) onSeat(S.chair); }
      S.speaking = true; onTurn({ turn: i, n, phrase: S.phrase, seat: mode === "induction" ? S.seat : S.chair, phraseMatch: pT, seatMatch: sT });
      draw();
      await wait(pace * .78); if (S.abort) return cur;
      S.speaking = false; S.phrase = null; if (mode === "induction") { S.seat = null; onSeat(-1); } else if (sS) S.chair = null;
      draw();
      await wait(pace * .22); if (S.abort) return cur;
      cur.open = false;
      if (sP) { if (pT && !cur.saidS) { T.phrase.misses++; error("phrase", "miss"); } else if (!pT && !cur.saidS) T.phrase.cr++; }
      if (S.abort) return cur;
      if (sS) { if (sT && !cur.saidK) { T.seat.misses++; error("seat", "miss"); } else if (!sT && !cur.saidK) T.seat.cr++; }
      draw();
      return cur;
    }

    /* ---- the rehearsal ---- */
    const kept = { phrase: tally(), seat: tally() };
    let restarts = 0;
    async function stage(id, streams, len, pace, go) {
      for (let a = 0; ; a++) {
        Object.assign(S, { stage: id, streams, turn: 0, len, staples: 0, abort: false, chair: id === "A" ? 2 : null, n: 2 });
        T = { phrase: tally(), seat: tally() }; rnd = rng(); cur = null;
        const sP = streams.phrase ? makeStream(len, 2, PHRASES.length, rnd) : null, sS = streams.seat ? makeStream(len, 2, CHAIRS.length, rnd) : null;
        say(a ? pick(R.again, a - 1) : go); await wait(1500);
        for (let i = 0; i < len && !S.abort; i++) await turn(pace, sP, sS);
        cur = null; S.speaking = false; S.phrase = null;
        if (!S.abort) { addT(kept.phrase, T.phrase); addT(kept.seat, T.seat); draw(); return; }
        restarts++; S.chair = id === "A" ? 2 : null; draw(); await wait(900);
      }
    }
    async function rehearsal() {
      Object.assign(S, { stage: "A", chair: 2, streams: { phrase: false, seat: false } }); draw();
      await talk(R.introA);
      await stage("A", { phrase: true, seat: false }, 14, P * 1.25, R.goA);
      score("echoPhrases", 2); S.len = 0; await talk(R.passA);
      S.stage = "B"; S.chair = 2; await talk(R.introB);
      await stage("B", { phrase: false, seat: true }, 12, P, R.goB);
      score("echoChairs", 2); S.len = 0; await talk(R.passB);
      S.stage = "C"; S.chair = 2; await talk(R.introC);
      await stage("C", { phrase: true, seat: true }, 14, P * 1.15, R.goC);
      score("echoBoth", 2); S.len = 0; S.chair = 2; await talk(R.passC);
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
    async function induction() {
      const LEN = 24;
      for (let tries = 1; ; tries++) {
        rnd = rng();
        const others = SEATS.map((_, i) => i).filter(i => i !== QSEAT);
        for (let i = others.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [others[i], others[j]] = [others[j], others[i]]; }
        Object.assign(S, { n: 2, turn: 0, len: 0, susp: 0, hoods: {}, hoodOrder: others.slice(0, 3), closing: false, abort: false, seat: null, phrase: null,
          streams: { phrase: true, seat: true } });
        T = { phrase: tally(), seat: tally() }; cur = null; draw();
        // the roll call: each lamp lights once, around the table
        for (let i = 0; i < N_SEATS; i++) { S.seat = i; draw(); await wait(110); }
        S.seat = null; draw();
        await talk(tries === 1 ? R.introI : R.retryI);
        S.len = LEN; draw(); await wait(900);
        const sP = [], sS = []; let streak = 0, clean = 0, stretch = 0, advanced = false;
        for (let t = 0; t < LEN; t++) {
          const c = await turn(S.n === 3 ? P * 1.15 : P, sP, sS);
          if (S.abort) break;
          if (c.err) { streak++; clean = 0; } else { streak = 0; if (++clean >= 5 && S.susp > 0) { clean = 0; relax(); say(R.relax); } }
          if (stretch > 0 && --stretch === 0 && t < LEN - 1) { S.n = 2; say(R.retreat); draw(); await wait(1600); }
          if (streak >= 2 && t < LEN - 2) {
            streak = 0; stretch = 8;
            if (S.n === 3) { say(R.still); await wait(1400); }
            else { S.n = 3; advanced = true; say(R.advance); blip([110, 90]); await wait(2200); say(R.advNell); await wait(1600); }
          }
        }
        cur = null; S.seat = null; S.phrase = null; S.speaking = false;
        if (S.abort) {
          onSeat(-1); S.coach = null; draw(); await wait(500);
          S.closing = true; S.coach = L("NARRATOR", "The hoods close in."); draw(); blip([200, 150, 100]); await wait(1800);
          await deathCard(R.death);
          continue;
        }
        draw(); await talk(R.passI);
        score("echoInduction", 5);
        const t = addT(addT(tally(), T.phrase), T.seat);
        return { passed: true, dprime: +dprime(t.hits, t.misses, t.fa, t.cr).toFixed(2), advanced, ...t, tries };
      }
    }
    function relax() { // the most recently turned hood turns back one notch
      S.susp--;
      const j = Math.floor(S.susp / 2), h = S.hoodOrder[j]; if (h != null) S.hoods[h] = Math.max(0, (S.hoods[h] || 0) - 1);
    }

    /* ---- input and cleanup ---- */
    const onClick = (e) => {
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
      if (k === "s") { e.preventDefault(); answer("s"); }
      if (k === "k") { e.preventDefault(); answer("k"); }
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
