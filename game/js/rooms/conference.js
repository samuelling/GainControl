// CONFERENCE ROOM 3F — the faculty meeting. The long table runs from the front of the stage to the back;
// Prof. Quorum presides at the head, three senior faculty down each side (heads in the "vote" groups),
// Ethel takes the minutes at a side desk, Gus and the empty student-rep chair sit at the foot.
import { seg, segC, chip, perspective, shell, sideDoor, hit, arcs } from "../gfx.js";
import { ethelAtDesk, chairBack, AUD } from "../figures.js";
import { quorumSeated, facultySeated, gusBack } from "../cast/act3a.js";

const pp = perspective(320, 130, 0.45);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];

// the table: X 170..470, depth k .48 (head) .. .80 (foot); top 40 world units above the floor
const T = { x0: 170, x1: 470, kb: .5, kf: .8, top: FY - 40 };
const SIDE = { L: 86, R: 554 }, SEATK = [.54, .645, .75];
const QK = .47;   // Quorum's chair, just behind the head of the table

function back(G) {
  let s = shell(pp);
  // back wall: past chairs of the department, three framed portraits; all the same man
  [[206, "1979"], [246, "1994"], [394, "2009"]].forEach(([x, yr]) => {
    s += `<rect class="hl sD mech" x="${x}" y="88" width="30" height="36"/>
      <path class="hl sD" d="M${x + 7},${108} C${x + 6},${96} ${x + 24},${96} ${x + 23},${108} M${x + 9},${100} C${x + 12},${95} ${x + 18},${95} ${x + 21},${100} M${x + 5},${124} C${x + 7},${115} ${x + 23},${115} ${x + 25},${124}"/>
      <path class="hl sD" d="M${x + 13},${116} L${x + 15},${118} L${x + 17},${116}"/>${seg(yr, x + 6, 127, 3.2, "sD", .5)}`; });
  s += seg("CHAIRS OF THE DEPARTMENT", 270, 80, 3.6, "sD", .6);
  // a wall clock: the meeting runs long
  s += `<circle class="hl sD" cx="320" cy="98" r="9"/><path class="hl sD" d="M320,98 L320,92 M320,98 L324,101"/>`;
  // the agenda easel, back left of the head of the table
  {
    const k = .46, y = floorY(k), x = P(129, 0, k)[0];
    s += `<g data-hs="agenda"><path class="sW" d="M${x - 12},${y} L${x - 4},${y - 60} M${x + 12},${y} L${x + 4},${y - 60} M${x},${y - 60} L${x},${y - 10}"/>
      <rect class="k sW mech" x="${x - 18}" y="${y - 62}" width="36" height="40"/><rect class="hl sW mech" x="${x - 18}" y="${y - 66}" width="36" height="4"/>
      ${chip("AGENDA", x - 15, y - 58, 3.8, "fW")}
      ${["1 MINUTES", "2 MOTION", "3 MOTION", "4 NEW BUS."].map((t, i) => seg(t, x - 15, y - 48 + i * 6, 3, i === 3 ? "sR" : "sM", .5)).join("")}
      ${hit(x - 20, y - 68, 40, 70)}</g>`;
  }
  s += urn(G);
  // left wall: the door back to the stairs
  const d = sideDoor(pp, 0, .7, .86, 112);
  s += `<g data-hs="door">${d.svg}${chip("STAIRS", d.a[0] - 4, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  // right wall: a window onto the quad
  const w = [P(640, 96, .52), P(640, 96, .64), P(640, 170, .64), P(640, 170, .52)];
  s += `<polygon class="k hl sD mech" points="${poly(...w)}"/><path class="hl sD" d="M${(w[0][0] + w[1][0]) / 2},${(w[0][1] + w[1][1]) / 2} L${(w[3][0] + w[2][0]) / 2},${(w[3][1] + w[2][1]) / 2}"/>`;

  // Quorum at the head: drawn after the table, his torso stops at its top and his forearms rest on it
  const qq = QK * AUD, qx = 320;
  const tyHead = P(0, T.top, T.kb)[1];
  const qFeet = tyHead + 13 * qq + 5;   // feet placed so sheet y 174 (forearms) lands on the table top
  // the table
  const a = P(T.x0, T.top, T.kb), b = P(T.x1, T.top, T.kb), c = P(T.x1, T.top, T.kf), e = P(T.x0, T.top, T.kf);
  const c2 = P(T.x1, T.top + 5, T.kf), e2 = P(T.x0, T.top + 5, T.kf);
  s += `<polygon class="k sW" points="${poly(a, b, c, e)}"/><polygon class="k sW mech" points="${poly(e, c, c2, e2)}"/>
    <path class="hl sM" d="M${P(T.x0 + 12, T.top + 5, T.kf)[0]},${e2[1]} L${P(T.x0 + 12, FY, T.kf)[0]},${floorY(T.kf)} M${P(T.x1 - 12, T.top + 5, T.kf)[0]},${c2[1]} L${P(T.x1 - 12, FY, T.kf)[0]},${floorY(T.kf)}"/>`;
  // papers and water glasses at each place
  SEATK.forEach(k => { [T.x0 + 34, T.x1 - 34].forEach(X => {
    s += `<polygon class="hl sD" points="${poly(P(X - 12, T.top, k - .025), P(X + 12, T.top, k - .025), P(X + 12, T.top, k + .025), P(X - 12, T.top, k + .025))}"/>`; }); });
  s += `<g data-hs="quorum">${quorumSeated(qx, qFeet, QK, !!G.flags.quorumDead)}${hit(qx - 22, qFeet - 168 * qq, 44, 168 * qq - 12)}</g>`;
  // the gavel by the Chair's place
  { const gy = P(0, T.top, .54)[1], g0 = P(384, 0, .54)[0], g1 = P(356, 0, .54)[0];
    s += `<path class="sA" d="M${g0},${gy - 1} L${g1},${gy - 3}"/><rect class="k sA" x="${g0 - 2}" y="${gy - 5}" width="8" height="5" rx="1"/>`; }

  // the six senior faculty, back to front, left side then right side
  let fac = "";
  SEATK.forEach((k, r) => {
    fac += facultySeated(P(SIDE.L, 0, k)[0], floorY(k), k, r);
    fac += facultySeated(P(SIDE.R, 0, k)[0], floorY(k), k, 3 + r);
  });
  const fh = SEATK.flatMap(k => [SIDE.L, SIDE.R].map(X => { const x = P(X, 0, k)[0], y = floorY(k), q = k * AUD; return hit(x - 24 * q, y - 136 * q, 48 * q, 112 * q); })).join("");
  s += `<g data-hs="faculty">${fac}${fh}</g>`;
  return s;
}

// the coffee urn on a credenza against the back wall, behind the head of the table (red herring)
function urn(G) {
  const k = .455, y = floorY(k), x = P(452, 0, k)[0];
  // drawn at full size around its own foot point, then scaled to its depth
  return `<g data-hs="urn"><g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${k})">
    <path class="hl sD" d="M-18,-40 L-18,0 M18,-40 L18,0"/>
    <polygon class="k sM" points="-22,-40 22,-40 19,-45 -19,-45"/>
    <path class="k sA" d="M-11,-45 L-12,-80 C-12,-87 12,-87 12,-80 L11,-45 Z"/>
    <path class="sA" d="M-4,-87 L4,-87 M0,-87 L0,-90 M11,-56 L16,-56 L16,-52"/>${seg("DECAF?", -9, -72, 3.6, "sA", .6)}
    <path class="sW" d="M-20,-45 L-20,-51 L-14,-51 L-14,-45"/></g>
    ${hit(x - 12, y - 44, 24, 46)}</g>`;
}

// Ethel at the minutes desk, front right
function ethel(G) {
  const k = .8, y = floorY(k), x = P(612, 0, k)[0], top = y - 24;
  return `<g>
    <g data-hs="ethel">${ethelAtDesk(x, floorY(.76) - 12, .76)}${hit(x - 24, top - 70, 48, 70)}</g>
    <polygon class="k sW" points="${x - 34},${top} ${x + 30},${top} ${x + 26},${top - 8} ${x - 30},${top - 8}"/>
    <rect class="k sM mech" x="${x - 34}" y="${top}" width="64" height="${y - top}"/>
    ${chip("MINUTES", x - 17, top + 7, 4, "fV")}
    <path class="hl sW" d="M${x - 22},${top - 3} L${x - 6},${top - 3} L${x - 4},${top - 7} L${x - 20},${top - 7} Z"/>
  </g>`;
}

// the foot of the table: Gus (once the meeting's on) and the empty student-rep chair
const FOOT = { k: .86, gus: 262, seat: 378 };
function foot(G) {
  const k = FOOT.k, y = floorY(k), q = k * AUD;
  const gx = P(FOOT.gus, 0, k)[0], sx = P(FOOT.seat, 0, k)[0];
  let s = "";
  if (G.flags.meeting) s += `<g data-hs="gus">${gusBack(gx, y, k)}${hit(gx - 26 * q, y - 170 * q, 52 * q, 170 * q)}</g>`;
  else s += `<g style="pointer-events:none">${chairBack(gx, y, k)}</g>`;
  s += `<g data-hs="seat">${chairBack(sx, y, k)}<rect class="k sW" x="${sx - 13}" y="${y - 58 * q}" width="26" height="7"/>${segC("STUDENT REP", sx, y - 56.6 * q, 3.4, "sW", .5)}
    ${hit(sx - 26 * q, y - 72 * q, 52 * q, 74 * q)}</g>`;
  return s;
}

export default {
  id: "conference", name: "CONFERENCE ROOM 3F", pp,
  floor: { yMin: 262, yMax: 287, margin: 16 },
  entries: { fromStairs: [104, 274, 1] },
  draw(G) {
    return { back: back(G), sortables: [
      { depth: floorY(.8), svg: ethel(G) },
      { depth: floorY(FOOT.k), svg: foot(G) },
    ] };
  },
  stand: { quorum: [320, 272], faculty: [200, 272], ethel: [520, 276], gus: [262, 282], agenda: [214, 266], seat: [378, 282],
    urn: [400, 266], door: [98, 276] },
  labels: {
    day: { seat: { use: "SIT DOWN" }, faculty: { look: "WATCH" }, agenda: { use: "READ" }, urn: { use: "POUR" }, quorum: { use: "TAKE PULSE" },
      door: { use: "GO OUT", go: "GO DOWN" } },
    morris: { door: { go: "SCURRY DOWN" }, urn: { use: "CLIMB" }, seat: { use: "SIT DOWN" } },
    night: { door: { use: "GO OUT", go: "GO DOWN" } },
  },
};
