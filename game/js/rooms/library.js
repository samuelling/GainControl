// LIBRARY 2F — tall stacks receding down both walls, the bound back issues (THE METAMER), the reading table with the
// Valu vs. Mick papers laid side by side, the FACULTY DIRECTORY on its stand, the card catalog (red herring), a fat 1980s
// BRAIN ATLAS on a high shelf, and the circulation desk: BACK AFTER TENURE. Act IV.
import { seg, segC, chip, perspective, shell, sideDoor, hit } from "../gfx.js";
import { AUD } from "../figures.js";

const pp = perspective(320, 130, 0.5);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];
const f1 = (a) => a.map(v => v.toFixed(1)).join(",");
// a deterministic scatter for book spines
const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// tall shelving on a side wall between depths k1..k2 (atmosphere: STRUCT frame, DIM spines)
function stacks(side, k1, k2, top = 30) {
  const bands = [top, top + 40, top + 80, top + 120, top + 160, top + 200, FY - 14];
  let s = `<polygon class="k sM mech" points="${poly(P(side, top, k1), P(side, top, k2), P(side, FY, k2), P(side, FY, k1))}"/>`;
  bands.forEach(Y => s += pp.ln(P(side, Y, k1), P(side, Y, k2), "hl sM"));
  const n = Math.round((k2 - k1) / .08);
  for (let i = 1; i < n; i++) { const k = k1 + (k2 - k1) * i / n; s += pp.ln(P(side, top, k), P(side, FY, k), "hl sM"); }
  for (let b = 0; b < bands.length - 1; b++) {
    for (let k = k1 + .006, j = 0; k < k2 - .004; k += .0075 + rnd(b * 97 + j) * .006, j++) {
      if (rnd(b * 31 + j * 7) < .18) continue;
      const lean = rnd(j + b) < .08 ? 4 : 0;
      const a = P(side, bands[b] + 6 + rnd(j * 3 + b) * 8, k), c = P(side, bands[b + 1], k + (lean ? .004 : 0));
      s += `<path class="hl sD" d="M${f1(a)} L${f1(c)}"/>`;
    }
  }
  return s;
}

function back(G) {
  let s = shell(pp, { rail: false });
  // the stacks: right wall all the way down, left wall in front of the stairs door
  s += stacks(640, .5, 1.02) + stacks(0, .82, 1.02);
  s += `${chip("QA–QP", P(640, 22, .6)[0] - 10, P(640, 22, .6)[1] - 4, 3.8, "fW")}`;
  // left wall: the stairs
  const d = sideDoor(pp, 0, .62, .78, 118);
  s += `<g data-hs="door">${d.svg}${chip("STAIRS", d.a[0] - 4, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  s += `<g transform="rotate(-6 ${d.a[0] + 14} ${d.a[1] + 30})">${chip("SHH", d.a[0] + 4, d.a[1] + 24, 4, "fA")}</g>`;

  // back wall left: the bound back issues. Four shelves of journals by year: the metamer's sources.
  const BX = 168, BW = 94, rows = [80, 112, 144, 176], cols = ["sA", "sB", "sR", "sG", "sV", "sW"];
  s += `<g data-hs="backissues"><rect class="k sW mech" x="${BX}" y="74" width="${BW}" height="136"/>
        ${chip("BACK ISSUES", BX + 2, 66, 4.2, "fW")}
        ${rows.map((y, r) => { let o = `<path class="sW mech" d="M${BX},${y + 30} L${BX + BW},${y + 30}"/>`, x = BX + 3, i = 0;
          while (x < BX + BW - 8) { const w = 6 + Math.round(rnd(r * 13 + i) * 4), c = cols[(r * 2 + i) % cols.length];
            o += `<rect class="hl ${c} mech" x="${x}" y="${y + 3}" width="${w}" height="27"/><path class="hl ${c}" d="M${x + 1.5},${y + 8} L${x + w - 1.5},${y + 8} M${x + 1.5},${y + 24} L${x + w - 1.5},${y + 24}"/>`;
            x += w + 1; i++; }
          return o + seg(String(79 + r * 3) + "-" + String(81 + r * 3), BX + BW - 22, y + 13, 3.2, "sM", .5); }).join("")}
        ${hit(BX - 2, 62, BW + 4, 150)}</g>`;

  // back wall centre: a tall window over the reading table (atmosphere)
  s += `<rect class="k sM mech" x="280" y="74" width="80" height="84"/><path class="hl sM mech" d="M320,74 L320,158 M280,116 L360,116"/>
        <g class="day-only"><path class="hl sD" d="M288,96 C292,90 300,90 302,95 C306,92 312,94 311,99 M330,134 C334,129 342,129 344,133 C348,131 352,134 350,138"/></g>
        <g class="night-only"><path class="hl sW" d="M346,86 C338,88 336,100 344,104 C338,104 334,96 338,90 C340,87 343,86 346,86 Z"/></g>
        <path class="sM" d="M276,160 L364,160"/>`;

  // back wall right, high: a shelf of old reference books and the fat 1980s BRAIN ATLAS lying on top
  s += `<path class="sM mech" d="M376,108 L474,108"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect class="hl sD mech" x="${430 + i * 6}" y="${86 + (i % 3)}" width="5" height="${22 - (i % 3)}"/>`).join("")}
        <g data-hs="atlas"><rect class="k sA mech" x="380" y="94" width="46" height="13"/><path class="hl sA" d="M383,97 L383,104 M423,97 L423,104"/>
        ${seg("BRAIN ATLAS", 386, 96, 3.2, "sA", .55)}${seg("1983", 397, 101.5, 2.6, "sM", .45)}
        <path class="hl sA" d="M382,94 L388,88 L432,88 L426,94"/>${hit(376, 84, 54, 26)}</g>`;
  // back wall right, low: the card catalog (the red herring: a hundred little drawers, brass pulls)
  const CX = 384, CY = 128, cw = 16, ch = 13;
  s += `<g data-hs="catalog"><rect class="k sW mech" x="${CX}" y="${CY}" width="88" height="82"/>
        ${[0, 1, 2, 3, 4].map(r => [0, 1, 2, 3, 4].map(c => { const x = CX + 3 + c * 17, y = CY + 4 + r * 15;
          return r === 2 && c === 3 ? "" : `<rect class="hl sW mech" x="${x}" y="${y}" width="${cw}" height="${ch}"/><rect class="hl sA" x="${x + 5}" y="${y + 3}" width="6" height="3"/><circle class="fA" cx="${x + 8}" cy="${y + 9}" r=".9"/>`; }).join("")).join("")}
        <rect class="k sW mech" x="${CX + 54}" y="${CY + 36}" width="${cw + 6}" height="${ch + 6}"/><rect class="hl sA" x="${CX + 61}" y="${CY + 39}" width="7" height="3"/><circle class="fA" cx="${CX + 65}" cy="${CY + 50}" r="1"/>
        <path class="hl sW" d="M${CX + 56},${CY + 36} L${CX + 57},${CY + 30} M${CX + 60},${CY + 36} L${CX + 61},${CY + 29} M${CX + 64},${CY + 36} L${CX + 65},${CY + 30} M${CX + 68},${CY + 36} L${CX + 69},${CY + 31}"/>
        ${hit(CX - 2, CY - 2, 92, 84)}</g>`;
  return s;
}

// the long reading table: a green banker's lamp (lit), and the two papers laid out side by side
function table(G) {
  const k1 = .58, k2 = .74, H = 238, X0 = 200, X1 = 440;
  const A = P(X0, H, k2), B = P(X1, H, k2), C = P(X1, H, k1), D = P(X0, H, k1);
  const legs = [[X0 + 10, k2], [X1 - 10, k2]].map(([X, k]) => pp.ln(P(X, H + 6, k), P(X, FY, k), "sW")).join("")
    + [[X0 + 10, k1], [X1 - 10, k1]].map(([X, k]) => pp.ln(P(X, H + 6, k), P(X, FY, k), "hl sM")).join("");
  const top = `<polygon class="k sW" points="${poly(A, B, C, D)}"/><polygon class="k sW mech" points="${poly(A, B, P(X1, H + 6, k2), P(X0, H + 6, k2))}"/>`;
  // a paper lying flat: a small parallelogram, its title in the stroke alphabet
  const paper = (X, who, cls, rot) => { const a = P(X - 30, H, k2 - .02), b = P(X + 30, H, k2 - .02), c = P(X + 28, H, k1 + .02), d = P(X - 32, H, k1 + .02);
    return `<g transform="rotate(${rot} ${a[0] + 20} ${a[1] - 4})"><polygon class="k sW" points="${poly(a, b, c, d)}"/>
      ${seg(who, d[0] + 4, d[1] + 1.5, 3.4, cls, .6)}<path class="hl sM" d="M${d[0] + 3},${d[1] + 7} L${c[0] - 4},${c[1] + 7} M${a[0] + 3},${a[1] - 2} L${b[0] - 14},${b[1] - 2}"/>
      ${chip("SEED 0451", d[0] + 4, d[1] + 8.4, 2.8, "fV")}</g>`; };
  // the banker's lamp, left end
  const L = P(222, H, .69);
  const lamp = `<path class="sW" d="M${L[0] - 8},${L[1]} L${L[0] + 8},${L[1]} M${L[0]},${L[1]} L${L[0]},${L[1] - 18}"/>
    <path class="k sG" d="M${L[0] - 13},${L[1] - 16} L${L[0] + 13},${L[1] - 16} L${L[0] + 10},${L[1] - 23} L${L[0] - 10},${L[1] - 23} Z"/>
    <path class="fA" d="M${L[0] - 7},${L[1] - 15.5} L${L[0] + 7},${L[1] - 15.5} L${L[0] + 4},${L[1] - 13} L${L[0] - 4},${L[1] - 13} Z"/>
    <path class="hl sA" d="M${L[0] - 10},${L[1] - 11} L${L[0] - 14},${L[1] - 5} M${L[0] + 10},${L[1] - 11} L${L[0] + 14},${L[1] - 5}"/>`;
  const hb = [D[0] - 2, D[1] - 6, B[0] - D[0] + 4, A[1] - D[1] + 14];
  return `${legs}${top}${lamp}
    <g data-hs="table">${paper(292, "VALU 2024", "sR", -2)}${paper(372, "MICK 2025", "sB", 3)}
      ${hit(P(254, H, k2)[0], hb[1], P(412, H, k2)[0] - P(254, H, k2)[0], hb[3])}</g>`;
}

// the FACULTY DIRECTORY, open on a stand, front left
function directory(G) {
  const k = .88, y = floorY(k), x = P(130, 0, k)[0], q = k * AUD;
  const t = y - 96 * q;
  return `<g data-hs="directory">
    <path class="sW" d="M${x},${y} L${x},${t + 6} M${x - 12},${y} L${x + 12},${y}"/>
    <path class="k sW" d="M${x - 24},${t + 8} L${x + 24},${t + 8} L${x + 20},${t - 6} L${x - 20},${t - 6} Z"/>
    <path class="k sB" d="M${x - 20},${t + 6} L${x - 1},${t + 6} L${x - 2},${t - 12} L${x - 17},${t - 12} Z M${x + 1},${t + 6} L${x + 20},${t + 6} L${x + 17},${t - 12} L${x + 2},${t - 12} Z"/>
    <path class="hl sW" d="M${x - 15},${t - 7} L${x - 5},${t - 7} M${x - 16},${t - 3} L${x - 4},${t - 3} M${x - 16},${t + 1} L${x - 6},${t + 1} M${x + 5},${t - 7} L${x + 15},${t - 7} M${x + 4},${t - 3} L${x + 16},${t - 3}"/>
    <circle class="hl sR" cx="${x + 10}" cy="${t + 1}" r="3.4"/>
    ${chip("FACULTY DIRECTORY", x - 30, t - 24, 3.6, "fB")}
    ${hit(x - 32, t - 28, 64, y - t + 30)}</g>`;
}

// the circulation desk, front right: a bell, an empty chair, BACK AFTER TENURE
function circulation(G) {
  const k = .88, y = floorY(k), H = 222, X0 = 470, X1 = 600, q = k * AUD;
  const a = P(X0, H, k), b = P(X1, H, k), a2 = P(X0 + 6, H, k - .05), b2 = P(X1 - 6, H, k - .05);
    const bx = a[0] + 18, by = a[1];
  return `<g data-hs="librarian">
    <polygon class="k sW" points="${poly(a, b, b2, a2)}"/>
    <rect class="k sM mech" x="${a[0]}" y="${a[1]}" width="${b[0] - a[0]}" height="${y - a[1]}"/>
    ${[1, 2, 3].map(i => `<path class="hl sD" d="M${a[0] + i * (b[0] - a[0]) / 4},${a[1] + 3} L${a[0] + i * (b[0] - a[0]) / 4},${y - 2}"/>`).join("")}
    ${segC("CIRCULATION", (a[0] + b[0]) / 2, a[1] + 10, 4.2, "sM", .7)}
    <path class="k sA" d="M${bx - 6},${by - 1} C${bx - 6},${by - 9} ${bx + 6},${by - 9} ${bx + 6},${by - 1} Z"/><path class="sA" d="M${bx},${by - 9} L${bx},${by - 11.5} M${bx - 8},${by - 1} L${bx + 8},${by - 1}"/>
    <g transform="rotate(4 ${bx + 50} ${by - 10})"><path class="k sA" d="M${bx + 26},${by - 1} L${bx + 30},${by - 20} L${bx + 82},${by - 20} L${bx + 78},${by - 1} Z"/>
      ${seg("BACK AFTER", bx + 32, by - 17.5, 3.8, "sA", .7)}${seg("TENURE", bx + 31, by - 10.5, 3.8, "sA", .7)}</g>
    ${hit(a[0] - 2, a[1] - 26, b[0] - a[0] + 4, y - a[1] + 28)}</g>`;
}

export default {
  id: "library", name: "LIBRARY 2F", pp,
  floor: { yMin: 252, yMax: 287, margin: 16 },
  entries: { fromStairs: [118, 262, 1] },
  draw(G) {
    return { back: back(G), sortables: [
      { depth: floorY(.74), svg: table(G) },
      { depth: floorY(.88), svg: directory(G) },
      { depth: floorY(.88), svg: circulation(G) },
    ] };
  },
  stand: { backissues: [214, 256], table: [330, 258], directory: [176, 278], catalog: [428, 256], atlas: [400, 256],
    librarian: [452, 284], door: [112, 264] },
  labels: {
    day: { backissues: { use: "COMPARE" }, table: { use: "COMPARE" }, directory: { use: "READ" }, catalog: { use: "OPEN A DRAWER" },
      atlas: { use: "REACH" }, librarian: { use: "RING BELL" }, door: { use: "GO OUT", go: "GO OUT" } },
    night: { backissues: { use: "COMPARE" }, table: { use: "COMPARE" }, directory: { use: "READ" }, catalog: { use: "OPEN A DRAWER" },
      atlas: { use: "REACH" }, librarian: { use: "RING BELL" }, door: { use: "GO OUT", go: "GO OUT" } },
    morris: { door: { go: "SCURRY OUT" }, catalog: { use: "CLIMB IN" }, atlas: { use: "CLIMB UP" }, table: { use: "CLIMB UP" },
      librarian: { use: "RING BELL" }, backissues: { use: "GNAW" } },
  },
};
