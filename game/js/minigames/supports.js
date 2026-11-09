// THE SUPPORTS (Act V, the crawlspace under the 3T; played by Morris). The magnet's concrete pad sits on four
// rust-rotted steel jack posts (NW, NE, SW, SE), three bolts each. Click a bolt: Morris goes to it and gnaws or kicks
// it out. Every bolt out tips the pad toward its post; a bullseye spirit level shows the tilt (the bubble rides to the
// high side). Tilt is a 2D vector: the sum over posts of (bolts out) × (post direction). All bolts are equal.
// Kept simple on purpose: past the yellow ring it warns AND the bolts that would level it light up green; a bolt that
// would tip it past the red ring, Morris refuses ("not that one, pal") and names the post to take instead. No early
// drop, no randomness. Taking opposite corners in turn (NW then SE, NE then SW) never even reaches the yellow.
// supports(el, { die(text) → Promise, score(key, n), onBolts(str) }) → Promise<{ done, tries }>
// onBolts gets the bolts still in, per post, as a 4-char string in the order NW NE SW SE (e.g. "3321"), after each change.
import { seg, segC, segW, chip, arcs, star4 } from "../gfx.js";
import { exitLabel, exitKey } from "./exit.js";

const A = Math.SQRT1_2;
export const POSTS = ["NW", "NE", "SW", "SE"];
export const DIR = [[-A, -A], [A, -A], [-A, A], [A, A]];      // (east, south) unit vectors
export const OPP = [3, 2, 1, 0];
export const YELLOW = 1.3, RED = 2.2;                         // |tilt| in bolt units; one sound bolt = 1
export const ROT = [1.8, .9, .3], SOUND = [1, 1, 1];          // load given up by the 1st, 2nd, 3rd bolt out of a post
const DEG = .5;                                               // degrees of tilt per bolt unit, for the readout
export function tiltOf(out, rot) {                            // out[p] = bolts removed from post p
  let e = 0, s = 0;
  out.forEach((n, p) => { const w = (p === rot ? ROT : SOUND).slice(0, n).reduce((a, b) => a + b, 0); e += w * DIR[p][0]; s += w * DIR[p][1]; });
  return [e, s];
}
const DEATH = "Morris has been archived under six tonnes of superconductor. So has the induction. So, unfortunately, has Nell.";

const LINES = {
  intro: [["MORRIS", "Under the 3T, the big scanner. Six tonnes of magnet on four rusty sticks. Pal, I have been waiting my whole life for this."],
    ["NARRATOR", "Four jack posts, three bolts each, rotten with fifty years of the Table's stolen chilled water. Every bolt out tips the pad toward that corner."],
    ["IRIS", "Kssh. Morris, dear. Bolts out, but keep the bubble in the middle. Opposite corners, one then the other. It comes down when I throw the switch, not before. Kssh."]],
  quips: [
    "This is the most fun I've had since the water maze. That's not saying much.",
    "Tastes like 1968. Iron, mostly. Little hint of indirect costs.",
    "Ptoo. Bolt. Next!",
    "Six years they ran me through mazes, pal. Now I'm the maze.",
    "My implant itches when there's a big magnet nearby. It is itching like crazy. Best day of my life.",
    "Lefty loosey. I don't know which way is lefty. I'm a rat.",
    "Hi-yah! Learned that kick from a postdoc. Different context.",
    "Listen to it creak. That's fifty years of tenure settling.",
  ],
  refuse: (post) => ["MORRIS", `Not that one, pal. One more from that corner and it comes down on the girl. Take one from ${post}.`],
  yellow: [["NARRATOR", "The bubble is past the yellow ring. The pad is listening."],
    ["MORRIS", "Leaning, pal. The bolts lit up green are the ones that bring it back."]],
  groan: [
    "Hear that groan? That's the building asking for a sabbatical.",
    "Dust in my whiskers. Concrete dust. Delicious.",
    "Couple more. It's holding on out of spite. I respect that.",
  ],
  after: [
    ["IRIS", "Kssh. Opposite corners, dear. One, then its partner across the pad. Like a two-step. Kssh."],
    ["IRIS", "Kssh. Watch the weeping post. It gives all at once, then hardly at all. Kssh."],
    ["MORRIS", "I'm back. I'm flat, but I'm back. The bolts are all in again. Who put them back? Don't answer that."],
  ],
  done: [["MORRIS", "Pal… it's up there on nothing but habit. Somebody tell the lady with the switch."]],
};
const COL = { MORRIS: "K", NARRATOR: "W", IRIS: "V" };

const CSS = `
.sup svg.supsvg { position: relative; width: 100%; flex: 1 1 0; min-height: 0; }
.sup [data-bolt] { cursor: pointer; }
.sup.lock [data-bolt] { cursor: default; }
.sup:not(.lock) [data-bolt]:hover .bh { stroke: var(--G); }
.sup .coachline { font-size: 1.8cqw; line-height: 1.2; }
.sup .coachline .who { margin-right: .6cqw; }
`;
function css() { if (document.getElementById("css-supports")) return; const s = document.createElement("style"); s.id = "css-supports"; s.textContent = CSS; document.head.appendChild(s); }

// ---- the close-up: one-point perspective, a rat's-eye view looking north ----
const VX = 215, VY = 118, PADY = 40, FLOOR = 262, G = 3;
const PX = [70, 360, 70, 360], PK = [.58, .58, .95, .95];      // post X and depth, NW NE SW SE
const BOLTY = [146, 163, 180];
const P = (X, Y, k) => [VX + (X - VX) * k, VY + (Y - VY) * k];
const f1 = (n) => n.toFixed(1);
const pt = (a) => f1(a[0]) + "," + f1(a[1]);

// Morris, small, side view facing right; origin mid-body, ~60 units nose to tail tip
function rat(x, y, s, face, pose) {
  const body = `<path class="k sW" d="M-28,8 C-32,-2 -24,-12 -10,-13 C2,-14 10,-10 15,-4 C22,-3 28,1 30,6 C28,8 22,8 20,8 Z"/>
    <circle class="k sW" cx="10" cy="-12" r="5.5"/><circle class="hl sK" cx="10" cy="-12" r="2.8"/>
    <circle class="fW" cx="19" cy="-2" r="1.5"/><circle class="fK" cx="30" cy="5.5" r="1.6"/>
    <path class="hl sW" d="M25,3 L35,0 M25,5 L36,6"/>
    <path class="hl sW" d="M-3,-12 L3,-13 M-1,-15 L-1,-10 M2,-15 L2,-11"/><circle class="fG" cx="5" cy="-12.5" r="1.4"/>`;
  const P0 = {
    walk0: `<path class="sK" d="M-28,4 C-42,2 -50,-6 -56,-2"/><path class="sK" d="M-20,8 L-20,9 M12,8 L13,9"/>`,
    walk1: `<path class="sK" d="M-28,4 C-42,4 -52,0 -58,4"/><path class="sK" d="M-22,7 L-26,9 M-16,7 L-12,9 M10,7 L6,9 M16,7 L20,9"/>`,
    sit: `<path class="sK" d="M-28,6 C-40,10 -50,10 -54,4"/><path class="sK" d="M-20,8 L-20,9 M12,8 L13,9"/>`,
    gnaw0: `<path class="sK" d="M-28,4 C-40,0 -46,-8 -52,-6"/><path class="sK" d="M-20,8 L-22,10 M12,8 L14,10"/><path class="sW" d="M28,8 L28,11"/>`,
    gnaw1: `<path class="sK" d="M-28,4 C-40,-2 -44,-12 -50,-12"/><path class="sK" d="M-20,8 L-22,10 M12,8 L14,10"/>
      <path class="sW" d="M27,8 L25,12 M30,8 L32,12"/>${star4(35, 9, 3, "sA")}`,
    kick0: `<path class="sK" d="M-28,4 C-38,-6 -36,-16 -42,-20"/><path class="sK" d="M-22,8 L-24,12 L-20,13 M12,8 L14,10"/>`,
    kick1: `<path class="sK" d="M-28,4 C-36,-8 -30,-18 -34,-24"/><path class="sK" d="M-24,6 L-44,6 M12,8 L14,10"/>
      <path class="hl sW" d="M-30,-2 L-40,-2 M-30,12 L-40,12"/>`,
    flat: "",
  };
  return `<g transform="translate(${f1(x)},${f1(y)}) scale(${f1(s * face * 100) / 100},${f1(s * 100) / 100})">${P0[pose] || ""}${body}</g>`;
}
// local points on Morris that touch the bolt: nose (gnaw) and hind foot extended (kick)
const NOSE = [32, 6], FOOT = [-46, 6], RS = .68;

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function supports(el, { die, score = () => {}, onBolts = () => {} } = {}) {
  css();
  return new Promise(resolve => {
    const rot = -1;                                   // (an older version rotted one post at random; cut as too fiddly)
    const S = { bolts: POSTS.map(() => [1, 1, 1]), out: [0, 0, 0, 0], tries: 1, n: 0, lock: false, dying: false, closed: false,
      morris: { x: VX, y: P(VX, FLOOR, .82)[1], k: .82, face: 1, pose: "sit" }, drop: null, floor: [], creak: null, groan: false,
      fall: 0, amb: 0, yellowed: false, rotSeen: false, quip: 0, groanQ: 0, after: 0, done: false, say: LINES.intro[0], q: [] };
    const timers = []; let qT = null, amb = null, spoken = null;
    const later = (ms, f) => timers.push(setTimeout(() => { if (!S.closed) f(); }, ms));
    const wait = (ms) => new Promise(r => later(ms, r));

    function say(...lines) { S.q = lines; clearTimeout(qT); nextLine(); }
    function nextLine() { if (!S.q.length || S.closed) return; S.say = S.q.shift(); drawCoach(); if (S.q.length) qT = setTimeout(nextLine, Math.max(2200, 48 * S.say[1].length)); }
    const tilt = () => tiltOf(S.out, rot);
    const mag = () => Math.hypot(...tilt());
    const bstr = () => S.out.map(n => 3 - n).join("");
    const magIf = (q) => { const o = S.out.slice(); o[q]++; return Math.hypot(...tiltOf(o, rot)); };
    const open = (q) => S.out[q] < 3;
    const best = () => [0, 1, 2, 3].filter(open).sort((a, b) => magIf(a) - magIf(b))[0];
    // once it leans past the yellow ring: the posts whose next bolt brings it back toward level
    const helps = () => mag() < YELLOW ? [] : [0, 1, 2, 3].filter(q => open(q) && magIf(q) < mag() - .2);

    // the pad plane: world Y offset for a point (X, k), tipping down toward the tilt vector
    function dY(X, k, T = tilt(), gain = G) { const u = (X - VX) / 145, v = (k - .765) / .185; return gain * (T[0] * u + T[1] * v); }
    function padY(X, k) {
      const d = S.drop;
      if (!d) return PADY + dY(X, k);
      return PADY + [0, 0, 70, 196][d.stage] + dY(X, k, d.T, [G, G * 3.4, G * 4.5, G * .6][d.stage]);
    }

    function room() {
      let s = "";
      const K = [1, .86, .72, .6, .5];
      for (let X = -200; X <= 640; X += 60) s += `<path class="hl sN" d="M${pt(P(X, FLOOR, 1))} L${pt(P(X, FLOOR, .5))}"/>`;
      K.forEach(k => s += `<path class="hl sN" d="M${pt(P(-200, FLOOR, k))} L${pt(P(640, FLOOR, k))}"/>`);
      // back wall (B1 footing): dim, with the Table's chilled-water tap and its hose running down through the floor
      const bl = P(-200, FLOOR, .5), br = P(640, FLOOR, .5);
      s += `<path class="hl sD" d="M${pt(bl)} L${pt(P(-200, 96, .5))} M${pt(br)} L${pt(P(640, 96, .5))}"/>`;
      const p1 = P(-200, 150, .5), p2 = P(640, 150, .5), tap = P(250, 150, .5);
      s += `<path class="hl sB" d="M${pt(p1)} L${pt(p2)} M${f1(p1[0])},${f1(p1[1] + 5)} L${f1(p2[0])},${f1(p2[1] + 5)}"/>`;
      s += `<path class="hl sB" d="M${f1(tap[0])},${f1(tap[1] + 5)} L${f1(tap[0])},${f1(tap[1] + 12)} C${f1(tap[0])},${f1(tap[1] + 22)} ${f1(tap[0] + 10)},${f1(tap[1] + 20)} ${f1(tap[0] + 12)},${f1(br[1])}"/>
        <rect class="k hl sB" x="${f1(tap[0] - 3)}" y="${f1(tap[1] + 6)}" width="6" height="4"/>`;
      s += seg("CHILLED WATER  3T", p1[0] + 160, p1[1] - 7, 3, "sD", .6);
      if (S.amb % 2) s += `<path class="hl sB" d="M${f1(tap[0])},${f1(tap[1] + 15)} L${f1(tap[0])},${f1(tap[1] + 17)}"/>`;
      else s += `<path class="hl sB" d="M${f1(tap[0])},${f1(tap[1] + 24)} L${f1(tap[0])},${f1(tap[1] + 26)}"/>`;
      // steel I-beams running back, just under the pad's edges
      [-30, 460].forEach(X => { const a = P(X, 26, 1), b = P(X, 26, .5), c = P(X, 36, 1), d = P(X, 36, .5);
        s += `<path class="hl sM" d="M${pt(a)} L${pt(b)} M${pt(c)} L${pt(d)}"/>`; });
      return s;
    }
    function pad() {
      const c = [[20, 1], [410, 1], [410, .5], [20, .5]].map(([X, k]) => P(X, padY(X, k), k));
      const top = [[20, 1], [410, 1]].map(([X, k]) => P(X, padY(X, k) - 30, k));
      let s = `<polygon class="k sW mech" points="${c.map(pt).join(" ")}"/>`;
      // formwork seams on the underside
      for (let i = 1; i < 6; i++) { const X = 20 + i * 65; s += `<path class="hl sD" d="M${pt(P(X, padY(X, 1), 1))} L${pt(P(X, padY(X, .5), .5))}"/>`; }
      [.86, .72, .6].forEach(k => s += `<path class="hl sD" d="M${pt(P(20, padY(20, k), k))} L${pt(P(410, padY(410, k), k))}"/>`);
      // the grating, with the bottom of the 3T's cryostat showing through
      const g = [[160, .82], [270, .82], [270, .62], [160, .62]].map(([X, k]) => P(X, padY(X, k), k));
      s += `<polygon class="k hl sM mech" points="${g.map(pt).join(" ")}"/>`;
      for (let i = 1; i < 8; i++) { const X = 160 + i * 13.75; s += `<path class="hl sM" d="M${pt(P(X, padY(X, .82), .82))} L${pt(P(X, padY(X, .62), .62))}"/>`; }
      const m = P(215, padY(215, .72), .72);
      s += `<path class="hl sW" d="M${f1(g[3][0] + 4)},${f1(g[3][1] + 2)} Q${f1(m[0])},${f1(m[1] - 3)} ${f1(g[2][0] - 4)},${f1(g[2][1] + 2)}"/>`;
      // the front face of the slab
      s += `<polygon class="k sW mech" points="${[top[0], top[1], c[1], c[0]].map(pt).join(" ")}"/>`;
      const fx = top[0][0], fy = top[0][1];
      const ang = Math.atan2(c[1][1] - c[0][1], c[1][0] - c[0][0]) * 180 / Math.PI;
      s += `<g transform="translate(${f1(fx)},${f1(fy)}) rotate(${ang.toFixed(2)})">
        ${seg("3T SCANNER PAD  B1  6 TONNES", 14, 9, 7, "sM", .9)}${chip("THE MAGNET IS ALWAYS ON", 240, 7, 5, "fA")}</g>`;
      return s;
    }
    function post(p) {
      const X = PX[p], k = PK[p], ty = padY(X, k), w = 9, sw = 13;
      const d = S.drop, buckled = d && d.stage >= 2;
      const L = (Y) => P(X - w, Y, k), R = (Y) => P(X + w, Y, k);
      let s = "";
      // base plate, stencilled name
      const b0 = P(X - 16, FLOOR, k), b1 = P(X + 16, FLOOR, k);
      s += `<rect class="k sM mech" x="${f1(b0[0])}" y="${f1(b0[1] - 3 * k)}" width="${f1(b1[0] - b0[0])}" height="${f1(3 * k)}"/>`;
      s += segC(POSTS[p], P(X, 0, k)[0], b0[1] + 3 * k, 6 * k, "sM", .8);
      if (buckled) {   // folded like a deck chair
        const top = P(X, Math.min(ty, FLOOR - 8), k), bot = P(X, FLOOR - 3, k), mid = P(X + (p % 2 ? -26 : 26), (Math.min(ty, FLOOR) + FLOOR) / 2, k);
        return s + `<path class="sM" d="M${pt(bot)} L${pt(mid)} L${pt(top)}"/><path class="hl sA" d="M${pt(mid)} L${f1(mid[0] + 4)},${f1(mid[1] + 6)}"/>`;
      }
      // upper screw section and jack head under the pad
      const h0 = P(X - 15, ty, k), h1 = P(X + 15, ty + 4, k);
      s += `<rect class="k sM mech" x="${f1(h0[0])}" y="${f1(h0[1])}" width="${f1(h1[0] - h0[0])}" height="${f1(h1[1] - h0[1])}"/>`;
      const s0 = P(X - 5, ty + 4, k), s1 = P(X + 5, 128, k);
      s += `<rect class="k sM mech" x="${f1(s0[0])}" y="${f1(s0[1])}" width="${f1(s1[0] - s0[0])}" height="${f1(Math.max(1, s1[1] - s0[1]))}"/>`;
      for (let Y = ty + 10; Y < 126; Y += 6) s += `<path class="hl sM" d="M${pt(P(X - 5, Y, k))} L${pt(P(X + 5, Y + 2, k))}"/>`;
      // lower tube (with every bolt out, it has slumped away from the screw: the post holds nothing)
      const free = S.out[p] === 3, sag = free ? 14 : 0;
      s += `<polygon class="k sM mech" points="${[L(128 + sag), R(128 + sag), R(FLOOR - 3), L(FLOOR - 3)].map(pt).join(" ")}"/>`;
      if (free) s += `<path class="hl sW dash" d="M${pt(P(X - 12, 131, k))} L${pt(P(X + 12, 131, k))}"/>`;
      s += `<path class="hl sD" d="M${pt(P(X + 5, 130, k))} L${pt(P(X + 5, FLOOR - 4, k))}"/>`;
      // rust: streaks from each bolt; the rotted post weeps, flakes and drips
      const rotted = p === rot;
      for (let i = 0; i < 3; i++) { const by = BOLTY[i];
        s += `<path class="hl sA" d="M${pt(P(X - 4 + i * 3, by + 6, k))} L${pt(P(X - 4 + i * 3, by + (rotted ? 60 : 22 + i * 6), k))}"/>`; }
      if (rotted) {
        s += `<path class="hl sA" d="M${pt(P(X - 8, 200, k))} L${pt(P(X - 7, 248, k))} M${pt(P(X + 7, 196, k))} L${pt(P(X + 6, 240, k))} M${pt(P(X + 1, 210, k))} L${pt(P(X + 1, 256, k))}"/>`;
        s += `<path class="sA" d="M${pt(L(212))} L${pt(P(X - 12, 216, k))} L${pt(L(220))} L${pt(P(X - 11, 226, k))} L${pt(L(232))}"/>`;
        s += `<path class="hl sA" d="M${pt(P(X - 3, 222, k))} C${pt(P(X + 2, 218, k))} ${pt(P(X + 4, 228, k))} ${pt(P(X - 1, 230, k))} Z"/>`;
        const a = S.amb % 3, dy = [0, 12, 24][a];
        [[-6, 2], [3, 9], [7, 17]].forEach(([dx, o]) => { const Y = 200 + dy + o; if (Y < FLOOR - 6) s += `<path class="sA" d="M${pt(P(X + dx, Y, k))} L${pt(P(X + dx, Y + 3, k))}"/>`; });
        const pud = P(X + 22, FLOOR, k + .02);
        s += `<path class="hl sA" d="M${f1(pud[0] - 10 * k)},${f1(pud[1])} Q${f1(pud[0])},${f1(pud[1] - 3 * k)} ${f1(pud[0] + 12 * k)},${f1(pud[1])}"/>`;
      }
      // the splice plate and its three bolts
      const q0 = P(X - sw, 136 + sag, k), q1 = P(X + sw, 190 + sag, k);
      s += `<rect class="k sW mech" x="${f1(q0[0])}" y="${f1(q0[1])}" width="${f1(q1[0] - q0[0])}" height="${f1(q1[1] - q0[1])}"/>`;
      for (let i = 0; i < 3; i++) {
        const c = P(X, BOLTY[i] + sag, k), r = 4.4 * k;
        if (!S.bolts[p][i] || (S.fall && S.fall.p === p && S.fall.i === i)) { s += `<circle class="hl sD" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r * .55)}"/>`; continue; }
        const hx = [0, 1, 2, 3, 4, 5].map(j => [c[0] + Math.cos(j * Math.PI / 3) * r, c[1] + Math.sin(j * Math.PI / 3) * r]);
        const hr = Math.max(9, 17 * k), hint = !S.done && !S.drop && helps().includes(p), bc = hint ? "sG" : "sW";
        if (hint && i === BOLTY.findIndex((_, j) => S.bolts[p][j])) s += arcs(c[0] - 12 * k, c[1], -1, "sG", 2, k * .8) + arcs(c[0] + 12 * k, c[1], 1, "sG", 2, k * .8);
        s += `<g data-bolt="${p}${i}"><polygon class="k bh ${bc}" points="${hx.map(pt).join(" ")}"/><circle class="hl bh ${bc}" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r * .45)}"/>
          <rect x="${f1(c[0] - hr)}" y="${f1(c[1] - 8.5 * k - 1)}" width="${f1(hr * 2)}" height="${f1(17 * k + 2)}" fill="transparent"/></g>`;
      }
      return s;
    }
    function boltGlyph(x, y, s, a) {
      return `<g transform="translate(${f1(x)},${f1(y)}) rotate(${a}) scale(${s})"><rect class="k sW" x="-3.5" y="-3" width="7" height="4"/><path class="hl sW" d="M0,1 L0,9 M-1.4,3 L1.4,4 M-1.4,5.5 L1.4,6.5"/></g>`;
    }
    function effects() {
      let s = "";
      if (!(S.drop && S.drop.stage >= 3)) S.floor.forEach(b => s += boltGlyph(b.x, b.y, b.k * 1.25, (b.a > 0 ? 90 : -90) + b.a));
      if (S.fall) { const { x, y, k, step, fx, fy } = S.fall, t = [0, .3, .7][step];
        if (step < 3) s += boltGlyph(x + (fx - x) * t, y + (fy - y) * t * t * 1.4, k * .9, step * 70) + (step ? `<path class="hl sW" d="M${f1(x + (fx - x) * t)},${f1(y + (fy - y) * t * t * 1.4 - 8)} L${f1(x + (fx - x) * t)},${f1(y + (fy - y) * t * t * 1.4 - 18)}"/>` : ""); }
      if (S.work) { const { x, y, k } = S.work; s += arcs(x - 9 * k, y, -1, "sW", 2, k * .7) + arcs(x + 9 * k, y, 1, "sW", 2, k * .7); }
      if (S.creak) { const { p } = S.creak, X = PX[p], k = PK[p], c = P(X, padY(X, k) + 4, k);
        s += arcs(c[0] - 18 * k, c[1] + 6, -1, "sW", 3, k * 1.1) + arcs(c[0] + 18 * k, c[1] + 6, 1, "sW", 3, k * 1.1);
        s += segC(S.groan ? "GROAN" : "CREAK", c[0], c[1] + 24 * k, 6 * k + 2, S.groan ? "sA" : "sM", .9); }
      if (S.groan || S.done) {   // dust sifting down from the underside, two poses
        const o = S.amb % 2 ? 0 : 9;
        [[100, .9], [300, .8], [190, .66], [380, .7], [40, .75], [250, .92]].forEach(([X, k], j) => {
          const c = P(X, padY(X, k) + 8 + o + (j % 3) * 7, k);
          s += `<path class="hl sM" d="M${f1(c[0])},${f1(c[1])} L${f1(c[0])},${f1(c[1] + 3)}"/>`; });
      }
      if (S.done) {
        const l = P(20, padY(20, .8), .8), r = P(410, padY(410, .8), .8);
        s += arcs(l[0] - 6, l[1] + 10, -1, "sW", 3, 1) + arcs(r[0] + 6, r[1] + 10, 1, "sW", 3, 1);
        s += chip("HELD UP BY HABIT", VX - chipFor("HELD UP BY HABIT", 6) / 2, 92, 6, "fW");
      }
      if (S.drop) {
        const st = S.drop.stage;
        if (st === 1) { const c = P(VX, padY(VX, .75), .75);
          s += arcs(c[0] - 110, c[1] + 8, -1, "sR", 3, 1.4) + arcs(c[0] + 110, c[1] + 8, 1, "sR", 3, 1.4) + segC("CRACK", c[0], c[1] + 18, 10, "sR", 1.3); }
        if (st === 2) for (let X = 0; X <= 420; X += 30) s += `<path class="hl sW" d="M${X + 4},${20 + (X % 60)} L${X + 4},${50 + (X % 60)}"/>`;
        if (st === 3) { s += segC("WHUMP", VX, 120, 22, "sR", 1.8);
          [[-1, 30], [1, 400]].forEach(([dir, x]) => s += arcs(x, 236, dir, "sM", 3, 1.6));
          const tail = P(VX + 46, FLOOR, 1);
          s += `<path class="sK" d="M${f1(tail[0])},${f1(tail[1] - 4)} C${f1(tail[0] + 8)},${f1(tail[1] - 8)} ${f1(tail[0] + 14)},${f1(tail[1] - 2)} ${f1(tail[0] + 22)},${f1(tail[1] - 6)}"/>`; }
      }
      return s;
    }
    const chipFor = (t, h) => segW(t, h) + h * .9;
    function morris() {
      if (S.drop && S.drop.stage >= 2) return "";
      const m = S.morris;
      return rat(m.x, m.y, m.k * RS, m.face, m.pose);
    }

    // ---- the bullseye spirit level ----
    function level() {
      const cx = 540, cy = 132, sc = 32, R = 84, T = tilt(), M = mag();
      const bx = cx - T[0] * sc, by = cy - T[1] * sc;      // the bubble floats to the high side
      const dropping = !!S.drop;
      let s = `<circle class="k sW" cx="${cx}" cy="${cy}" r="${R}"/><circle class="hl sD" cx="${cx}" cy="${cy}" r="${R - 5}"/>`;
      s += `<path class="hl sD" d="M${cx - R + 5},${cy} L${cx + R - 5},${cy} M${cx},${cy - R + 5} L${cx},${cy + R - 5}"/>`;
      s += `<path class="hl sD dash" d="M${f1(cx - (R - 5) * A)},${f1(cy - (R - 5) * A)} L${f1(cx + (R - 5) * A)},${f1(cy + (R - 5) * A)} M${f1(cx + (R - 5) * A)},${f1(cy - (R - 5) * A)} L${f1(cx - (R - 5) * A)},${f1(cy + (R - 5) * A)}"/>`;
      s += `<circle class="sR" cx="${cx}" cy="${cy}" r="${RED * sc}"/><circle class="sA" cx="${cx}" cy="${cy}" r="${YELLOW * sc}"/>`;
      s += `<circle class="hl ${S.done ? "sG" : "sW"}" cx="${cx}" cy="${cy}" r="13"/>`;
      ["N", "E", "S", "W"].forEach((t, i) => { const a = i * Math.PI / 2; s += segC(t, cx + Math.sin(a) * (R + 8), cy - Math.cos(a) * (R + 8) - 2.5, 5, "sM", .8); });
      // posts at the diagonals: name and bolts still in
      POSTS.forEach((t, p) => { const x = cx + DIR[p][0] * (R + 16), y = cy + DIR[p][1] * (R + 16);
        s += segC(t, x, y - 9, 4.4, "sM", .8);
        for (let i = 0; i < 3; i++) s += `<rect class="${S.bolts[p][i] ? "fW" : "hl sD"}" x="${f1(x - 9 + i * 7)}" y="${f1(y - 1)}" width="4" height="4"/>`; });
      // the bubble: an open ring, with a highlight
      const bc = dropping || M >= RED ? "sR" : M >= YELLOW ? "sA" : S.done ? "sG" : "sW";
      const BX = dropping ? cx - S.drop.T[0] / Math.hypot(...S.drop.T) * (R - 16) : bx, BY = dropping ? cy - S.drop.T[1] / Math.hypot(...S.drop.T) * (R - 16) : by;
      s += `<circle class="${bc}" cx="${f1(BX)}" cy="${f1(BY)}" r="11"/><path class="hl ${bc}" d="M${f1(BX - 6)},${f1(BY - 3)} Q${f1(BX - 5)},${f1(BY - 7)} ${f1(BX - 1)},${f1(BY - 7)}"/>`;
      // readouts
      const deg = dropping ? "----" : (M * DEG).toFixed(2);
      s += seg("TILT  DEG", 446, 12, 4.4, "sM", .8) + seg(deg, 446, 20, 16, M >= RED || dropping ? "sR" : M >= YELLOW ? "sA" : "sW", 1.4);
      const outN = S.out.reduce((a, b) => a + b, 0);
      s += seg("BOLTS OUT", 584, 12, 4.4, "sM", .8) + seg(String(outN).padStart(2, "0"), 584, 20, 16, "sW", 1.4) + seg("/12", 610, 30, 6, "sM", .9);
      if (S.done) s += chip("LEVEL", cx - chipFor("LEVEL", 6) / 2, 236, 6, "fG");
      else if (dropping) s += chip("DROPPING", cx - chipFor("DROPPING", 6) / 2, 236, 6, "fR");
      else if (M >= YELLOW) s += chip("CAREFUL", cx - chipFor("CAREFUL", 6) / 2, 236, 6, "fA");
      s += seg("THE BUBBLE FLOATS TO THE HIGH SIDE", cx - segW("THE BUBBLE FLOATS TO THE HIGH SIDE", 4) / 2, 256, 4, "sD", .7);
      return s;
    }

    function scene() { return `<defs><clipPath id="supclip"><rect x="0" y="0" width="432" height="276"/></clipPath></defs><g clip-path="url(#supclip)">${room()}<g>${[0, 1].map(post).join("")}</g>${pad()}<g>${[2, 3].map(post).join("")}</g>${morris()}<g class="fx">${effects()}</g></g>
      <path class="hl sD" d="M432,0 L432,276"/>${level()}`; }
    function draw() {
      if (S.closed) return;
      const lock = S.lock || S.done || S.dying;
      el.innerHTML = `<div class="screen sup ${lock ? "lock" : ""}">
        <svg class="t hd" viewBox="0 0 640 40">${seg("THE SUPPORTS", 16, 10, 18, "sW", 1.6)}${seg("UNDER THE 3T  CRAWLSPACE B1-B3  FOUR JACK POSTS  THREE BOLTS EACH", 196, 17, 5, "sM", .8)}</svg>
        <svg class="t supsvg" viewBox="0 0 640 276">${scene()}</svg>
        <div class="coachline"></div>
        <div class="bar"><span class="status">${S.done ? "ALL TWELVE OUT  ·  LEVEL" : S.dying ? "THE PAD IS COMING DOWN" : `${POSTS.map((t, p) => t + " " + (3 - S.out[p])).join("  ")}   ·   KEEP THE BUBBLE IN THE MIDDLE`}</span>
          <button data-b="off" class="off">${exitLabel(S.done)}</button></div></div>`;
      drawCoach();
    }
    function redrawScene() { const sv = el.querySelector(".sup svg.supsvg"); if (sv) sv.innerHTML = scene(); }
    function drawCoach() {
      const c = el.querySelector(".sup .coachline"); if (!c) return;
      const col = COL[S.say[0]] || "W";
      if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(S.say[0], true); }
      c.innerHTML = `<span class="who" style="background:var(--${col})">${S.say[0]}</span><span style="color:var(--${col})">${S.say[1]}</span>`;
    }
    const setLock = (v) => { S.lock = v; const r = el.querySelector(".sup"); if (r) r.classList.toggle("lock", v || S.done || S.dying); };

    // where Morris stands to work a bolt, and what he does to it
    function spotFor(p, i) {
      const X = PX[p], k = PK[p], b = P(X, BOLTY[i], k), s = k * RS, kick = S.n % 2 === 1;
      const face = (p % 2 === 0 ? -1 : 1) * (kick ? -1 : 1);   // gnaw: face the post from the inside; kick: rear to it
      const L = kick ? FOOT : NOSE;
      return { x: b[0] - face * L[0] * s, y: b[1] - L[1] * s, k, face, kick };
    }
    async function pull(p, i) {
      if (S.lock || S.done || S.dying || !S.bolts[p][i]) return;
      if (magIf(p) >= RED) {            // Morris won't: it would come down on Nell. He says which corner instead.
        S.yellowed = true; say(LINES.refuse(POSTS[best()])); sfx("creak2", { m: RED }); S.creak = { p }; redrawScene(); later(700, () => { S.creak = null; redrawScene(); });
        return;
      }
      setLock(true);
      const m = S.morris, to = spotFor(p, i), from = { ...m };
      // hop over in fixed steps
      for (let h = 1; h <= 3; h++) {
        Object.assign(m, { x: from.x + (to.x - from.x) * h / 3, y: from.y + (to.y - from.y) * h / 3 - (h < 3 ? 8 : 0), k: from.k + (to.k - from.k) * h / 3,
          face: to.x >= from.x ? 1 : -1, pose: h % 2 ? "walk1" : "walk0" });
        redrawScene(); sfx("ratstep"); await wait(110);
      }
      // gnaw or kick: two poses, ~0.6 s
      m.face = to.face; const a = to.kick ? "kick" : "gnaw";
      const bp = P(PX[p], BOLTY[i], PK[p]);
      for (let j = 0; j < 4; j++) { m.pose = a + (j % 2); S.work = j % 2 ? { x: bp[0], y: bp[1], k: PK[p] } : null; redrawScene(); if (j % 2) sfx(a); await wait(150); }
      m.pose = a + "0"; S.work = null;
      // the bolt drops through fixed positions to the floor
      const X = PX[p], k = PK[p], b = P(X, BOLTY[i], k), fl = P(X + (p % 2 ? -1 : 1) * (18 + i * 13), FLOOR, Math.min(1, k + .03 + (i % 2) * .03));
      S.fall = { p, i, x: b[0], y: b[1], k, fx: fl[0], fy: fl[1] - 2, step: 0 };
      S.bolts[p][i] = 0;
      for (let st = 0; st < 3; st++) { S.fall.step = st; redrawScene(); await wait(90); }
      S.floor.push({ x: fl[0], y: fl[1] - 2, k, a: (i * 37 + p * 11) % 30 - 15 }); S.fall = null; sfx("bolt");
      S.out[p]++; S.n++; onBolts(bstr());
      const M = mag(), total = S.out.reduce((x, y) => x + y, 0);
      S.groan = total >= 9; S.creak = { p };
      if (M >= RED) { await dropEarly(); return; }
      sfx(M >= YELLOW && !S.yellowed ? "creak" : S.groan ? "groan" : "creak2", { m: M });
      draw();
      later(900, () => { S.creak = null; redrawScene(); });
      if (total === 12) { finishRun(); return; }
      // say something
      if (M >= YELLOW && !S.yellowed) { S.yellowed = true; say(...LINES.yellow); }
      else if (S.groan) say(["MORRIS", LINES.groan[S.groanQ++ % LINES.groan.length]]);
      else say(["MORRIS", LINES.quips[S.quip++ % LINES.quips.length]]);
      setLock(false);
    }
    async function dropEarly() {
      S.dying = true; S.creak = null; S.drop = { stage: 0, T: tilt() };
      say(["MORRIS", "Uh-oh. Pal? PAL?"]);
      for (const st of [1, 2, 3]) { S.drop.stage = st; draw(); if (st === 1) sfx("crack"); if (st === 3) sfx("crash"); await wait(st === 1 ? 520 : 260); }
      await wait(500);
      if (S.closed) return;
      if (die) await die(DEATH); else await wait(1200);
      if (S.closed) return;
      // Revise & Resubmit: every bolt back in, Morris back on the floor
      S.tries++; S.bolts = POSTS.map(() => [1, 1, 1]); S.out = [0, 0, 0, 0]; S.n = 0; S.floor = []; S.drop = null; S.dying = false; S.groan = false; S.yellowed = false;
      Object.assign(S.morris, { x: VX, y: P(VX, FLOOR, .82)[1], k: .82, face: 1, pose: "sit" });
      onBolts(bstr());
      S.lock = false; draw();
      say(LINES.after[(S.after++) % LINES.after.length], ...(S.after === 1 ? [LINES.after[1]] : []));
    }
    function finishRun() {
      S.done = true; S.lock = false;
      Object.assign(S.morris, { x: VX, y: P(VX, FLOOR, .82)[1], k: .82, face: 1, pose: "sit" });
      score("supports", S.yellowed ? 3 : 4);   // full marks for never letting it lean into the yellow sfx("chime");
      draw(); say(...LINES.done);
    }

    const onDown = (e) => {
      if (S.closed || S.lock || S.done || S.dying) return;
      const b = e.target.closest && e.target.closest("[data-bolt]");
      if (b) { const [p, i] = b.dataset.bolt.split("").map(Number); pull(p, i); }
    };
    const onClick = (e) => { const b = e.target.closest && e.target.closest("button[data-b]"); if (b && !S.dying) finish(); };
    const onKey = (e) => { if (!S.dying) exitKey(e, S.done, finish); };
    function finish() {
      if (S.closed) return;
      S.closed = true;
      timers.forEach(clearTimeout); clearTimeout(qT); clearInterval(amb);
      el.removeEventListener("pointerdown", onDown); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = "";
      resolve({ done: S.done, tries: S.tries });
    }
    el.classList.add("show"); draw(); say(...LINES.intro);
    amb = setInterval(() => { S.amb++; if (!S.lock && !S.dying) redrawScene(); }, 420);
    el.addEventListener("pointerdown", onDown); el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
  });
}
