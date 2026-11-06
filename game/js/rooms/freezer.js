// −80 ROOM B1 — a row of upright −80 freezers (readouts, frost), and at the back a walk-in −80 with its heavy door swung
// open and fog spilling out over the floor. After four o'clock (G.flags.impactDead): Prof. Impact inside, frozen mid-stride,
// a box at his feet labeled DO NOT THAW, police tape, and Det. Small beside the door, hat on. Act IV.
import { seg, segC, chip, perspective, shell, sideDoor, hit, arcs, star4 } from "../gfx.js";
import { smallFigure, AUD } from "../figures.js";
import { impactFrozen } from "../cast/act4.js";

const pp = perspective(320, 130, 0.5);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];
const f1 = (a) => a.map(v => v.toFixed(1)).join(",");

// the walk-in's opening on the back wall, in world units (X, Y), and the depth of its inner back wall
const BX0 = 200, BX1 = 440, BTOP = 50, KF = .6;   // the walk-in's box: world X, top, and the depth of its front face
const WX0 = 262, WX1 = 378, WY = 122, KIN = .5, KI = .56;   // its opening, its inner back wall, where Impact stands
const frost = (pts, cls = "hl sW") => pts.map(([x, y, dx, dy]) => `<path class="${cls}" d="M${x},${y} L${x + dx},${y + dy}"/>`).join("");

function back(G) {
  let s = shell(pp, { rail: false });
  // back wall left: an alarm panel and a sign-out clipboard (atmosphere)
  s += `<rect class="k sM mech" x="176" y="100" width="36" height="26"/>${seg("ALARM", 180, 103, 3, "sM", .5)}<circle class="fG" cx="206" cy="104.5" r="1.1"/>
        ${[0, 1, 2].map(i => `<path class="hl sM" d="M180,${112 + i * 4} L${200 - i * 4},${112 + i * 4}"/>`).join("")}
        <rect class="k sD mech" x="182" y="138" width="22" height="30"/><path class="hl sD" d="M186,146 L200,146 M186,151 L200,151 M186,156 L196,156"/><rect class="hl sD" x="189" y="135" width="8" height="4"/>`;

  // the walk-in −80: a stainless box standing out from the back wall (front face at depth KF), the readout, the opening
  const F0 = P(BX0, BTOP, KF), F1 = P(BX1, 290, KF), Lb = P(BX0, BTOP, .5), Rb = P(BX1, BTOP, .5);
  const o0 = P(WX0, WY, KF), o1 = P(WX1, 290, KF), i0 = P(WX0, WY, KIN), i1 = P(WX1, 290, KIN);
  s += `<g data-hs="walkin">
        <polygon class="k sM mech" points="${poly(Lb, F0, [F0[0], F1[1]], P(BX0, 290, .5))}"/><polygon class="k sM mech" points="${poly(Rb, [F1[0], F0[1]], F1, P(BX1, 290, .5))}"/>
        <polygon class="k sW mech" points="${poly(Lb, Rb, [F1[0], F0[1]], F0)}"/>
        <rect class="k sW mech" x="${F0[0]}" y="${F0[1]}" width="${F1[0] - F0[0]}" height="${F1[1] - F0[1]}"/>
        ${[.12, .24, .76, .88].map(t => { const x = F0[0] + (F1[0] - F0[0]) * t; return `<path class="hl sM mech" d="M${x},${F0[1] + 2} L${x},${F1[1] - 2}"/>`; }).join("")}
        <rect class="k sW mech" x="296" y="${F0[1] + 8}" width="48" height="26"/>${seg("TEMP C", 300, F0[1] + 11, 2.8, "sM", .45)}${seg("-80", 300, F0[1] + 16, 14, "sB", 1.1)}
        <rect class="k sB mech" x="${o0[0]}" y="${o0[1]}" width="${o1[0] - o0[0]}" height="${o1[1] - o0[1]}"/>
        <rect class="hl sD mech" x="${i0[0]}" y="${i0[1]}" width="${i1[0] - i0[0]}" height="${i1[1] - i0[1]}"/>
        <path class="hl sD" d="M${f1(o0)} L${f1(i0)} M${o1[0]},${o0[1]} L${i1[0]},${i0[1]} M${o0[0]},${o1[1]} L${i0[0]},${i1[1]} M${f1(o1)} L${f1(i1)}"/>
        ${[.3, .55].map(t => { const y = i0[1] + (i1[1] - i0[1]) * t; return `<path class="hl sD" d="M${i0[0]},${y} L${i1[0]},${y}"/>`; }).join("")}
        ${[[i0[0] + 4, .3], [i0[0] + 16, .3], [i1[0] - 14, .3], [i0[0] + 8, .55], [i1[0] - 18, .55]].map(([x, t]) => `<rect class="hl sD mech" x="${x}" y="${i0[1] + (i1[1] - i0[1]) * t - 7}" width="9" height="7"/>`).join("")}
        ${frost([[F0[0], F0[1], 3, 5], [F0[0] + 8, F0[1], 1, 7], [F0[0] + 18, F0[1], 2, 4], [F1[0] - 10, F0[1], -2, 6], [F1[0] - 3, F0[1], -1, 4],
          [o0[0] + 3, o0[1], 1, 6], [o0[0] + 12, o0[1], 0, 4], [o1[0] - 4, o0[1], -1, 7], [o1[0] - 14, o0[1], 0, 5]])}
        ${chip("WALK-IN -80", F0[0] + 2, F0[1] - 12, 4.2, "fB")}
        ${hit(F0[0] - 14, F0[1] - 14, F1[0] - F0[0] + 28, F1[1] - F0[1] + 16)}</g>`;
  // Impact, frozen just inside the opening
  const dead = !!G.flags.impactDead;
  if (dead) {
    const ix = P(326, 290, KI)[0], iy = floorY(KI), q = KI * AUD;
    s += `<g data-hs="impact">${impactFrozen(ix, iy, KI)}${hit(ix - 36 * q * 1.6, iy - 160 * q, 72 * q * 1.6, 160 * q + 2)}</g>`;
  }
  // the box at the threshold: DO NOT THAW
  const bx = P(266, 290, KF + .01);
  s += `<g data-hs="box"><path class="k sW mech" d="M${bx[0]},${bx[1]} L${bx[0] + 30},${bx[1]} L${bx[0] + 30},${bx[1] - 16} L${bx[0]},${bx[1] - 16} Z"/>
        <path class="hl sW" d="M${bx[0]},${bx[1] - 16} L${bx[0] + 4},${bx[1] - 19} L${bx[0] + 34},${bx[1] - 19} L${bx[0] + 30},${bx[1] - 16} M${bx[0] + 34},${bx[1] - 19} L${bx[0] + 34},${bx[1] - 3} L${bx[0] + 30},${bx[1]}"/>
        ${chip("DO NOT", bx[0] + 2.5, bx[1] - 14, 3.2, "fR")}${chip("THAW", bx[0] + 2.5, bx[1] - 7.6, 3.2, "fR")}
        ${frost([[bx[0] + 6, bx[1] - 19, 0, -3], [bx[0] + 18, bx[1] - 19, 1, -3]])}${hit(bx[0] - 3, bx[1] - 23, 40, 25)}</g>`;
  // police tape across the opening
  if (dead) {
    const t0 = [o0[0] - 8, o0[1] + 76], t1 = [o1[0] + 10, o0[1] + 62];
    s += `<g style="pointer-events:none"><path class="k sA" d="M${t0[0]},${t0[1]} L${t1[0]},${t1[1]} L${t1[0]},${t1[1] + 6} L${t0[0]},${t0[1] + 6} Z"/>
          <g transform="rotate(${(Math.atan2(t1[1] - t0[1], t1[0] - t0[0]) * 180 / Math.PI).toFixed(2)} ${t0[0]} ${t0[1]})">${seg("POLICE LINE  DO NOT CROSS", t0[0] + 6, t0[1] + 1.4, 3.2, "sA", .6)}</g></g>`;
  }
  // the heavy door, swung out toward you on its hinges at the right of the opening (a thick slab, a lever handle, frost)
  const a = P(WX1, WY, KF), d = P(WX1, 290, KF), b = P(WX1 + 50, WY, KF + .1), c = P(WX1 + 50, 290, KF + .1);
  const b2 = P(WX1 + 58, WY, KF + .095), c2 = P(WX1 + 58, 290, KF + .095);
  const mid = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const h1 = mid(mid(a, d, .5), mid(b, c, .5), .82);
  s += `<polygon class="k sW mech" points="${poly(b, b2, c2, c)}"/><polygon class="k sW mech" points="${poly(a, b, c, d)}"/>
        <polygon class="hl sM" points="${poly(mid(mid(a, b, .12), mid(d, c, .12), .05), mid(mid(a, b, .88), mid(d, c, .88), .05), mid(mid(a, b, .88), mid(d, c, .88), .95), mid(mid(a, b, .12), mid(d, c, .12), .95))}"/>
        <path class="sW" d="M${h1[0]},${h1[1] - 7} L${h1[0]},${h1[1] + 9} M${h1[0]},${h1[1] - 7} L${h1[0] + 8},${h1[1] - 10}"/>
        ${frost([[a[0] + 3, a[1] + 4, 2, 5], [b[0] - 5, b[1] + 4, 1, 6], [d[0] + 3, d[1] - 9, 2, 4], [c[0] - 5, c[1] - 12, 1, 5]])}${star4(b[0] - 8, b[1] + 18, 2.8, "sW")}`;
  // fog spilling over the threshold and across the floor (pose group "hum")
  const fog = (p) => [0, 1, 2, 3].map(i => { const y = 214 + i * 7 + p * 2, w = 60 + i * 26, cx = 312 + (p ? 6 : -4) * (i % 2 ? 1 : -1);
    return `<path class="hl sW" d="M${cx - w / 2},${y} C${cx - w / 4},${y - 4} ${cx - w / 8},${y + 3} ${cx},${y} C${cx + w / 8},${y - 3} ${cx + w / 4},${y + 4} ${cx + w / 2},${y}"/>`; }).join("");
  s += `<g style="pointer-events:none"><g class="pz on" data-g="hum" data-i="0">${fog(0)}</g><g class="pz" data-g="hum" data-i="1">${fog(1)}</g></g>`;

  // the upright freezers: two on the back wall right, four down the right wall
  const unit = (x, y, w, h, n) => `<rect class="k sW mech" x="${x}" y="${y}" width="${w}" height="${h}"/><path class="hl sW mech" d="M${x + 3},${y + 22} L${x + w - 3},${y + 22}"/>
      <rect class="hl sM mech" x="${x + 4}" y="${y + 4}" width="${w - 8}" height="14"/>${seg("-80", x + 6, y + 6.5, 9, "sB", .9)}
      <path class="sW" d="M${x + w - 6},${y + 30} L${x + w - 6},${y + 50}"/>${frost([[x, y, 2, 4], [x + w, y, -2, 5], [x + 4, y + h - 2, 1, -5]])}`;
  let fz = "";
  for (let i = 0; i < 5; i++) {
    const k1 = .52 + i * .09, k2 = k1 + .082, A = P(640, 112, k1), B = P(640, 112, k2), C = P(640, 290, k2), D = P(640, 290, k1);
    const r = P(640, 126, (k1 + k2) / 2), hdl = P(640, 160, k1 + .015);
    fz += `<polygon class="k sW mech" points="${poly(A, B, C, D)}"/><path class="hl sW" d="M${f1(P(640, 150, k1))} L${f1(P(640, 150, k2))}"/>
      ${segC("-80", r[0], r[1] - 4, 6.4 + i * 1.4, "sB", .9)}<path class="sW" d="M${hdl[0]},${hdl[1]} L${hdl[0]},${hdl[1] + 18 + i * 3}"/>
      ${frost([[A[0] + 1, A[1] + 2, 2, 5], [B[0] - 2, B[1] + 2, -1, 6]])}`;
  }
  const rw0 = P(640, 112, .52), rw1 = P(640, 290, .962);
  s += `<g data-hs="freezers">${fz}${chip("-80 FREEZERS", rw0[0] - 4, rw0[1] - 12, 3.8, "fW")}${hit(rw0[0] - 2, rw0[1] - 2, rw1[0] - rw0[0] + 4, rw1[1] - rw0[1] + 4)}</g>`;

  // left wall: the stairs door
  const dd = sideDoor(pp, 0, .6, .76, 112);
  s += `<g data-hs="door">${dd.svg}${chip("STAIRS", dd.a[0] - 4, dd.a[1] - 14, 4.4, "fW")}${hit(...dd.box)}</g>`;
  return s;
}

// Det. Small, hat on, beside the walk-in
const fedora = `<path class="k sM" d="M128,44 C140,38 180,38 192,44 C182,47 138,47 128,44 Z"/><path class="k sM" d="M141,42 L144,24 C150,20 154,26 160,22 C166,26 170,20 176,24 L179,42 Z"/><path class="sA" d="M142,37 L178,37"/>`;
function small(G) {
  if (!G.flags.impactDead) return "";
  const x = 452, y = 252, q = kAtY(y) * AUD;
  return `<g data-hs="small"><g transform="translate(${x},${y}) scale(${q.toFixed(3)}) translate(-160,-187)">${smallFigure()}${fedora}</g>
    ${hit((x - 30 * q).toFixed(1), (y - 168 * q).toFixed(1), (60 * q).toFixed(1), (168 * q + 2).toFixed(1))}</g>`;
}

export default {
  id: "freezer", name: "-80 ROOM B1", pp,
  floor: { yMin: 240, yMax: 287, margin: 16 },
  entries: { fromStairs: [112, 264, 1] },
  draw(G) { return { back: back(G), sortables: [{ depth: 252, svg: small(G) }] }; },
  stand: { walkin: [314, 246], impact: [334, 246], box: [284, 248], freezers: [520, 268], small: [420, 262], door: [106, 266] },
  labels: {
    day: { walkin: { use: "CLOSE THE DOOR" }, impact: { use: "CHECK PULSE" }, box: { use: "OPEN" }, freezers: { use: "OPEN" },
      door: { use: "GO OUT", go: "GO OUT" } },
    night: { walkin: { use: "CLOSE THE DOOR" }, box: { use: "OPEN" }, freezers: { use: "OPEN" }, door: { use: "GO OUT", go: "GO OUT" } },
    morris: { walkin: { use: "SCURRY IN" }, impact: { use: "SNIFF" }, box: { use: "GNAW" }, freezers: { use: "WARM PAWS" }, door: { go: "SCURRY OUT" } },
  },
};
