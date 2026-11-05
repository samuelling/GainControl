// RESEARCH INTEGRITY, 2F — Ethel Bord's office: a wall of binders, the Binder of Binders, the step stool, shelf R up top.
import { seg, segC, chip, perspective, shell, sideDoor, hit } from "../gfx.js";
import { ethelAtDesk, AUD } from "../figures.js";

const pp = perspective(320, 130, 0.45);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];

// a row of binder spines
function spines(x0, x1, y, h, cls, every = 7, thin = false) {
  let s = "";
  for (let x = x0; x + every - 1 <= x1; x += every) s += `<rect class="k ${thin ? "hl " : ""}${cls} mech" x="${x}" y="${y}" width="${every - 1.5}" height="${h}"/>${thin ? "" : `<path class="hl ${cls}" d="M${x + 1.2},${y + h * .55} L${x + every - 2.7},${y + h * .55}"/>`}`;
  return s;
}

function back(G) {
  let s = shell(pp);
  // shelf R, high and red: RISING STARS (SPECIAL)
  s += `<g data-hs="shelfR"><path class="sR" d="M196,100 L444,100"/>${spines(198, 442, 82, 17, "sR")}
        ${chip("R", 300, 74, 4.2, "fR")}${seg("RISING STARS (SPECIAL)", 310, 75.5, 3.6, "sR", .6)}${hit(194, 72, 252, 30)}</g>`;
  // three low sections: A, B, C (each three shelves)
  [["shelfA", "A", 196, 276, "sB", "fB"], ["shelfB", "B", 282, 360, "sA", "fA"], ["shelfC", "C", 366, 444, "sG", "fG"]].forEach(([id, L, x0, x1, c, f]) => {
    s += `<g data-hs="${id}">${chip(L, (x0 + x1) / 2 - 3, 106, 4.4, f)}
      ${[118, 146, 174].map(y => `<path class="${c}" d="M${x0},${y + 22} L${x1},${y + 22}"/>${spines(x0 + 2, x1 - 2, y, 21, c, 6.5, true)}`).join("")}
      ${hit(x0 - 2, 104, x1 - x0 + 4, 96)}</g>`;
  });
  // left wall: the window, then the door to the stairs
  const w = [P(0, 96, .5), P(0, 96, .62), P(0, 180, .62), P(0, 180, .5)];
  s += `<g data-hs="window"><polygon class="k sW mech" points="${poly(...w)}"/>
        <path class="hl sW" d="M${(w[0][0] + w[1][0]) / 2},${(w[0][1] + w[1][1]) / 2} L${(w[3][0] + w[2][0]) / 2},${(w[3][1] + w[2][1]) / 2}"/>
        <path class="hl sW" d="M${w[0][0]},${(w[0][1] + w[3][1]) / 2} L${w[1][0]},${(w[1][1] + w[2][1]) / 2}"/>
        <path class="hl sB" d="M${w[0][0] + 4},${w[0][1] + 18} L${w[1][0] - 4},${w[1][1] + 30}"/>
        ${hit(Math.min(w[0][0], w[1][0]) - 2, w[1][1] - 2, Math.abs(w[1][0] - w[0][0]) + 4, w[2][1] - w[1][1] + 4)}</g>`;
  const d = sideDoor(pp, 0, .7, .86, 112);
  s += `<g data-hs="door">${d.svg}${chip("STAIRS", d.b[0] + 4, d.b[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  // a framed motto, right wall
  const m = [P(640, 110, .55), P(640, 110, .66), P(640, 150, .66), P(640, 150, .55)];
  s += `<polygon class="k hl sD mech" points="${poly(...m)}"/>${seg("FILE IT", m[0][0] + 6, (m[0][1] + m[3][1]) / 2 - 4, 4.2, "sD", .7)}`;
  return s;
}

// the Binder of Binders on its stand
function index(G) {
  const k = .7, y = floorY(k), x = P(200, 0, k)[0];
  return `<g data-hs="index">
    <path class="sW" d="M${x},${y} L${x},${y - 46} M${x - 12},${y} L${x + 12},${y}"/>
    <polygon class="k sW" points="${x - 26},${y - 46} ${x + 26},${y - 46} ${x + 20},${y - 58} ${x - 20},${y - 58}"/>
    <path class="k sA" d="M${x - 24},${y - 50} C${x - 14},${y - 56} ${x - 4},${y - 56} ${x},${y - 52} C${x + 4},${y - 56} ${x + 14},${y - 56} ${x + 24},${y - 50} L${x + 24},${y - 66} C${x + 14},${y - 72} ${x + 4},${y - 72} ${x},${y - 68} C${x - 4},${y - 72} ${x - 14},${y - 72} ${x - 24},${y - 66} Z"/>
    <path class="hl sA" d="M${x},${y - 68} L${x},${y - 52} M${x - 20},${y - 64} L${x - 5},${y - 66} M${x - 20},${y - 60} L${x - 5},${y - 62} M${x + 5},${y - 66} L${x + 20},${y - 64} M${x + 5},${y - 62} L${x + 20},${y - 60}"/>
    ${chip("INDEX", x - 12, y - 84, 4.4, "fA")}${hit(x - 30, y - 88, 60, 90)}</g>`;
}

// Ethel at her desk, front right
function ethel(G) {
  const k = .76, y = floorY(k), x = P(500, 0, k)[0], top = y - 22;
  return `<g>
    <g data-hs="ethel">${ethelAtDesk(x, floorY(.73) - 12, .73)}${hit(x - 28, top - 72, 56, 72)}</g>
    <polygon class="k sW" points="${x - 50},${top} ${x + 50},${top} ${x + 44},${top - 9} ${x - 44},${top - 9}"/>
    <rect class="k sM mech" x="${x - 50}" y="${top}" width="100" height="${y - top}"/>
    ${chip("INTEGRITY", x - 22, top + 8, 4.4, "fV")}
    ${[0, 1, 2].map(i => `<rect class="k sM mech" x="${x + 22}" y="${top - 13 - i * 5}" width="22" height="5"/>`).join("")}
  </g>`;
}

// the step stool: by the desk, or under shelf R
function stool(G) {
  const placed = !!G.flags.stoolPlaced;
  const [x, y, k] = placed ? [320, floorY(.5), .5] : [P(420, 0, .82)[0], floorY(.82), .82];
  const q = k * AUD;
  const p = (a, b) => `${(x + a * q).toFixed(1)},${(y - b * q).toFixed(1)}`;
  return `<g data-hs="stool">
    <path class="k sA" d="M${p(-20, 0)} L${p(-16, 44)} L${p(16, 44)} L${p(20, 0)}"/>
    <path class="sA" d="M${p(-18, 22)} L${p(18, 22)} M${p(-17, 44)} L${p(17, 44)}"/>
    ${hit(x - 26 * q - 4, y - 50 * q - 4, 52 * q + 8, 50 * q + 8)}</g>`;
}

export default {
  id: "ethics", name: "RESEARCH INTEGRITY 2F", pp,
  floor: { yMin: 210, yMax: 287, margin: 16 },
  entries: { fromStairs: [84, 266, 1] },
  draw(G) {
    return { back: back(G), sortables: [
      { depth: floorY(.5), svg: G.flags.stoolPlaced ? stool(G) : "" },
      { depth: floorY(.7), svg: index(G) },
      { depth: floorY(.76), svg: ethel(G) },
      { depth: floorY(.82), svg: G.flags.stoolPlaced ? "" : stool(G) },
    ] };
  },
  stand: { ethel: [440, 262], index: [234, 248], shelfA: [236, 214], shelfB: [322, 214], shelfC: [404, 214], shelfR: [304, 216],
    stool: [370, 266], window: [120, 238], door: [84, 266] },
  labels: {
    day: { shelfA: { use: "PULL A BINDER" }, shelfB: { use: "PULL A BINDER" }, shelfC: { use: "PULL A BINDER" }, shelfR: { use: "PULL R-12" },
      stool: { use: "MOVE IT" }, index: { use: "LOOK UP VALU" }, door: { use: "GO OUT", go: "GO DOWN" }, window: { use: "OPEN" } },
    night: { door: { use: "GO OUT", go: "GO DOWN" } },
  },
};
