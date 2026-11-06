// ANIMAL FACILITY B1 — the Morris water maze: a round tank drawn as a wireframe cylinder, distal cues on the walls
// (a star, a triangle, a square), an overhead tracking camera, rat cages along the back wall, a vent high on the left
// wall (where Morris watched from). After G.flags.codyDead: Cody face down in the tank, "unable to locate the hidden
// platform", the platform a faint hairline square just under the surface. Act IV.
import { seg, segC, chip, perspective, shell, sideDoor, hit, arcs, star4 } from "../gfx.js";
import { AUD } from "../figures.js";
import { codyFloating } from "../cast/act4.js";

const pp = perspective(320, 130, 0.5);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];
const f1 = (a) => a.map(v => v.toFixed(1)).join(",");

// the tank, in screen units: rim ellipse centre (TX, RY), radii RX × RRY, wall height WH
const TX = 326, RY = 208, RX = 86, RRY = 21, WH = 28, WY = RY + 4;
const TK = (RY + WH - 130) / 160;          // depth of the tank's centre on the floor
const ell = (cx, cy, rx, ry, from, to) => { const pts = []; for (let i = 0; i <= 40; i++) { const t = from + (to - from) * i / 40; pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); }
  return "M" + pts.map(f1).join(" L"); };

function back(G) {
  let s = shell(pp, { rail: false });
  // the distal cues, big and bold: a star (back wall left), a triangle (back wall right), a square (right wall)
  const sq = [P(640, 54, .62), P(640, 54, .76), P(640, 134, .76), P(640, 134, .62)];
  const star = (cx, cy, r) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .42 : r; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    return `<polygon class="k sA" points="${pts.map(f1).join(" ")}"/>`; };
  s += `<g data-hs="cues">${star(196, 104, 26)}<polygon class="k sB" points="444,80 470,126 418,126"/>
        <polygon class="k sR" points="${poly(...sq)}"/>${hit(168, 76, 56, 54)}${hit(414, 76, 60, 54)}${hit(sq[0][0] - 2, sq[1][1] - 2, sq[1][0] - sq[0][0] + 4, sq[2][1] - sq[1][1] + 4)}</g>`;
  // the colony rack along the back wall: three rows of cages, water bottles, cage cards, a few rats
  const CX = 246, CY = 96, cw = 30, ch = 26;
  let cages = "";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const x = CX + c * (cw + 2), y = CY + r * (ch + 4);
    cages += `<rect class="hl sW mech" x="${x}" y="${y}" width="${cw}" height="${ch}"/>${[1, 2, 3, 4, 5].map(i => `<path class="hl sM" d="M${x + i * 5},${y + 2} L${x + i * 5},${y + ch - 2}"/>`).join("")}
      <rect class="k sA" x="${x + 2}" y="${y + 2}" width="8" height="5"/><path class="hl sB" d="M${x + cw - 6},${y - 2} L${x + cw - 6},${y + 8} L${x + cw - 4},${y + 12}"/>`;
    if ((r * 5 + c) % 3 === 1) cages += `<path class="k sW" d="M${x + 8},${y + ch - 2} C${x + 8},${y + ch - 9} ${x + 14},${y + ch - 11} ${x + 20},${y + ch - 8} L${x + 23},${y + ch - 5} L${x + 20},${y + ch - 2} Z"/><circle class="fW" cx="${x + 19}" cy="${y + ch - 7}" r=".8"/>
      <path class="hl sK" d="M${x + 8},${y + ch - 3} C${x + 4},${y + ch - 3} ${x + 3},${y + ch - 6} ${x + 1},${y + ch - 5}"/>`;
  }
  s += `<g data-hs="cages"><rect class="k sM mech" x="${CX - 4}" y="${CY - 4}" width="${5 * (cw + 2) + 6}" height="${3 * (ch + 4) + 4}"/>${cages}
        ${chip("COLONY", CX - 2, CY - 13, 4, "fW")}${hit(CX - 6, CY - 16, 5 * (cw + 2) + 10, 3 * (ch + 4) + 22)}</g>`;
  // left wall: a vent high up (Morris's balcony), the stairs door below and in front
  const v = [P(0, 30, .55), P(0, 30, .65), P(0, 58, .65), P(0, 58, .55)];
  s += `<g data-hs="vent"><polygon class="k sW mech" points="${poly(...v)}"/>
        ${[1, 2, 3, 4].map(i => { const t = i / 5; const a = [v[0][0] + (v[1][0] - v[0][0]) * t, v[0][1] + (v[1][1] - v[0][1]) * t], b = [v[3][0] + (v[2][0] - v[3][0]) * t, v[3][1] + (v[2][1] - v[3][1]) * t];
          return `<path class="hl sW" d="M${f1(a)} L${f1(b)}"/>`; }).join("")}
        ${hit(Math.min(v[0][0], v[1][0]) - 6, v[1][1] - 6, Math.abs(v[1][0] - v[0][0]) + 12, v[3][1] - v[1][1] + 12)}</g>`;
  const d = sideDoor(pp, 0, .7, .84, 118);
  s += `<g data-hs="door">${d.svg}${chip("STAIRS", d.a[0] - 2, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  // the overhead tracking camera, on a drop pole above the tank; its cable runs back along the ceiling
  const c0 = P(TX, 0, TK), cy = c0[1] + 26;
  s += `<path class="hl sD" d="M${f1(c0)} L${f1(P(TX, 0, .5))} L${P(TX, 0, .5)[0]},70"/>
        <g data-hs="camera"><path class="sW" d="M${c0[0]},${c0[1]} L${c0[0]},${cy - 6}"/><rect class="k sW mech" x="${c0[0] - 9}" y="${cy - 6}" width="18" height="11"/>
        <path class="k sW" d="M${c0[0] - 5},${cy + 5} L${c0[0] + 5},${cy + 5} L${c0[0] + 4},${cy + 10} L${c0[0] - 4},${cy + 10} Z"/>
        <g class="pz on" data-g="blink" data-i="0"><circle class="fR" cx="${c0[0] + 6}" cy="${cy - 2}" r="1.3"/></g><g class="pz" data-g="blink" data-i="1"><circle class="hl sR" cx="${c0[0] + 6}" cy="${cy - 2}" r="1.1"/></g>
        ${seg("REC", c0[0] + 12, cy - 4, 3.4, "sR", .6)}
        <path class="hl sW dash" d="M${c0[0] - 4},${cy + 11} L${TX - RX * .7},${RY + 2} M${c0[0] + 4},${cy + 11} L${TX + RX * .7},${RY + 2}"/>
        ${hit(c0[0] - 14, c0[1] - 2, 40, cy - c0[1] + 16)}</g>`;
  return s;
}

// the tank: a wireframe cylinder; inside, the water surface; after the death, the platform and Cody
function tank(G) {
  const dead = !!G.flags.codyDead, by = RY + WH;
  let s = `<g data-hs="tank">
    <path class="k sW" d="${ell(TX, RY, RX, RRY, 0, 2 * Math.PI)} Z"/>
    <path class="hl sM" d="${ell(TX, RY + 3, RX - 2, RRY - 2, Math.PI, 2 * Math.PI)}"/>
    <path class="hl sB" d="${ell(TX, WY, RX - 4, RRY - 3, 0, 2 * Math.PI)}"/>
    <path class="hl sB" d="M${TX - 40},${WY - 6} C${TX - 30},${WY - 8} ${TX - 20},${WY - 8} ${TX - 10},${WY - 6} M${TX + 22},${WY + 5} C${TX + 32},${WY + 3} ${TX + 42},${WY + 3} ${TX + 52},${WY + 5}"/>`;
  if (dead) {
    // the hidden platform: a faint square, just under the surface, where he never found it
    const px = TX + 50, py = WY - 6;
    s += `<polygon class="hl sB dash" points="${f1([px - 12, py + 3])} ${f1([px + 10, py + 3])} ${f1([px + 7, py - 3])} ${f1([px - 9, py - 3])}"/>`;
    s += `<g data-hs="cody">${codyFloating(TX - 14, WY, TK)}${hit(TX - 54, WY - 18, 80, 36)}</g>`;
  }
  // the front of the wall, filled black so the water and anything behind sit inside it
  s += `<path class="k sW" d="${ell(TX, RY, RX, RRY, 0, Math.PI)} L${TX - RX},${by} ${ell(TX, by, RX, RRY, Math.PI, 0).slice(1)} Z"/>
    <path class="sW" d="${ell(TX, RY, RX, RRY, Math.PI, 2 * Math.PI)}"/>
    ${[-.6, -.2, .2, .6].map(t => { const x = TX + RX * t, dy = RRY * Math.sqrt(1 - t * t); return `<path class="hl sM" d="M${x.toFixed(1)},${(RY + dy).toFixed(1)} L${x.toFixed(1)},${(by + dy).toFixed(1)}"/>`; }).join("")}
    ${segC("WATER MAZE", TX, RY + RRY + 8, 4, "sM", .7)}${seg("22 C", TX + RX - 24, RY + RRY + 2, 3.2, "sB", .55)}
    ${hit(TX - RX - 2, RY - RRY - 4, RX * 2 + 4, WH + RRY * 2 + 6)}</g>`;
  return s;
}

// a stereotaxic frame on a cart, front right (atmosphere: the electrodes Morris remembers)
function cart(G) {
  const k = .9, y = floorY(k), x = P(560, 0, k)[0], q = k * AUD;
  const u = (a, b) => `${(x + a * q).toFixed(1)},${(y + b * q).toFixed(1)}`;
  return `<g style="pointer-events:none"><path class="hl sD" d="M${u(-34, -2)} L${u(-34, -60)} M${u(34, -2)} L${u(34, -60)} M${u(-38, -60)} L${u(38, -60)} M${u(-36, -24)} L${u(36, -24)}"/>
    <circle class="hl sD" cx="${(x - 30 * q).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="2"/><circle class="hl sD" cx="${(x + 30 * q).toFixed(1)}" cy="${(y - 2).toFixed(1)}" r="2"/>
    <path class="hl sM" d="M${u(-20, -60)} L${u(-20, -96)} L${u(20, -96)} L${u(20, -60)} M${u(-20, -82)} L${u(20, -82)} M${u(0, -96)} L${u(0, -108)} M${u(-6, -108)} L${u(6, -108)}"/>
    <path class="hl sM" d="M${u(0, -96)} L${u(0, -84)}"/><circle class="hl sM" cx="${x.toFixed(1)}" cy="${(y - 76 * q).toFixed(1)}" r="${(5 * q).toFixed(1)}"/></g>`;
}

export default {
  id: "maze", name: "ANIMAL FACILITY B1", pp,
  floor: { yMin: 262, yMax: 287, margin: 16 },
  entries: { fromStairs: [96, 274, 1], vent: [126, 266, 1] },
  draw(G) {
    return { back: back(G), sortables: [{ depth: RY + WH + RRY, svg: tank(G) }, { depth: floorY(.9), svg: cart(G) }] };
  },
  stand: { tank: [326, 268], cody: [300, 268], cues: [420, 270], camera: [350, 268], cages: [260, 266], vent: [126, 266], door: [92, 276] },
  labels: {
    day: { tank: { use: "FEEL FOR THE PLATFORM" }, cody: { use: "PULL HIM OUT" }, cues: { use: "STRAIGHTEN" }, camera: { use: "REWIND" },
      cages: { use: "OPEN" }, vent: { use: "LOOK IN" }, door: { use: "GO OUT", go: "GO OUT" } },
    night: { tank: { use: "FEEL FOR THE PLATFORM" }, cues: { use: "STRAIGHTEN" }, camera: { use: "REWIND" },
      cages: { use: "OPEN" }, vent: { use: "LOOK IN" }, door: { use: "GO OUT", go: "GO OUT" } },
    morris: { tank: { talk: "REMEMBER", use: "SWIM" }, cody: { use: "NUDGE" }, cues: { use: "LOOK UP" }, camera: { use: "HIDE FROM" },
      cages: { use: "VISIT" }, vent: { use: "CLIMB IN" }, door: { go: "SCURRY OUT" } },
  },
};
