// EMERITUS OFFICE 4F — the forgotten office at the end of the hall. Towers of journals from 1961 on, a window,
// Iris Candor behind her desk, the 1968 photo of the ring magnet, the framed 1977 letter, the staple gun, the kettle and the sherry.
import { seg, segC, chip, perspective, shell, sideDoor, hit, arcs } from "../gfx.js";
import { AUD } from "../figures.js";
import { irisSeated } from "../cast/act3a.js";

// cramped: a near back wall
const pp = perspective(320, 130, 0.56);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];

// a tower of bound journals standing on the floor at (X, k): n volumes, spines alternating hairline
function tower(X, k, n, cls, label) {
  const x = P(X, 0, k)[0], y = floorY(k), q = k * AUD, w = 34 * q, h = 9 * q;
  let s = "";
  for (let i = 0; i < n; i++) {
    const off = ((i * 37) % 7 - 3) * q, yy = y - (i + 1) * h;
    s += `<rect class="k ${i % 3 ? "hl " : ""}${cls} mech" x="${(x - w / 2 + off).toFixed(1)}" y="${yy.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"/>`;
  }
  if (label) s += seg(label, x - w / 2 + 2 * q, y - h * n + 1.6 * q, 5 * q, cls, .5);
  return s;
}

function back(G) {
  let s = shell(pp, { rail: 0 });
  // the window (back wall, left): rooftops, a chimney, the campus water tower
  s += `<rect class="k sW mech" x="196" y="82" width="74" height="76"/><path class="hl sW" d="M233,82 L233,158 M196,120 L270,120"/>
    <path class="hl sD" d="M198,150 L212,142 L224,148 L232,140 L246,146 L256,138 L268,144 M240,140 L240,128 L246,128 L246,143 M206,108 L206,98 C206,92 218,92 218,98 L218,108 M212,108 L212,118"/>
    <path class="sW" d="M192,160 L274,160"/>`;
  // a radiator under the window
  s += `<path class="hl sD" d="M200,166 L266,166 L266,190 L200,190 Z"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<path class="hl sD" d="M${206 + i * 9},168 L${206 + i * 9},188"/>`).join("")}`;
  // the 1968 photo: a young woman beside a giant ring magnet, as a wireframe
  s += `<g data-hs="photo"><rect class="k sA mech" x="300" y="88" width="42" height="32"/><rect class="hl sA mech" x="303" y="91" width="36" height="26"/>
    <ellipse class="hl sW" cx="326" cy="104" rx="10" ry="11"/><ellipse class="hl sW" cx="326" cy="104" rx="5" ry="5.5"/>
    <path class="hl sW" d="M316,104 L336,104 M326,93 L326,115 M318,96 L334,112 M334,96 L318,112"/><path class="hl sD" d="M305,115 L337,115"/>
    <circle class="hl sK" cx="310" cy="102" r="2"/><path class="hl sV" d="M310,104 L310,111 M307,107 L313,107 M308,115 L310,111 L312,115"/>
    ${seg("1968", 304, 122, 3.4, "sA", .6)}${hit(298, 86, 46, 42)}</g>`;
  // the framed letter, 1977
  s += `<g data-hs="letter"><rect class="k sW mech" x="356" y="84" width="34" height="44"/><rect class="hl sW mech" x="359" y="87" width="28" height="38"/>
    ${seg("LETTER", 362, 90, 3, "sW", .5)}${[0, 1, 2, 3, 4, 5].map(i => `<path class="hl sM" d="M362,${98 + i * 4} L${384 - (i % 3) * 3},${98 + i * 4}"/>`).join("")}
    <path class="hl sW" d="M375,120 C377,117 380,122 383,118"/>${seg("1977", 364, 131, 3.4, "sW", .6)}${hit(354, 82, 38, 56)}</g>`;
  // an old wall clock that stopped (it is always 1977 in here)
  s += `<circle class="hl sD" cx="420" cy="96" r="8"/><path class="hl sD" d="M420,96 L420,90 M420,96 L415,99"/>`;
  // right wall: the door back to the stairs
  const d = sideDoor(pp, 640, .68, .84, 112);
  s += `<g data-hs="door">${d.svg}${chip("STAIRS", d.a[0] - 4, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  // the towers of journals along the left: 1961 at the back, the rest piling forward
  let st = "";
  [[40, .6, 15, "sM", ""], [92, .58, 11, "sD", ""], [146, .57, 9, "sW", "1961"], [40, .7, 18, "sD", ""], [104, .66, 12, "sW", "1974"],
    [30, .8, 14, "sM", ""], [92, .76, 9, "sW", "1977"]].forEach(([X, k, n, c, l]) => st += tower(X, k, n, c, l));
  s += `<g data-hs="stacks">${st}${hit(72, 158, 162, 102)}</g>`;
  // (the real record, hidden) one issue sticks out of the 1977 tower, and a toy rocking chair sits on the window sill
  {
    const k = .76, x = P(92, 0, k)[0], y = floorY(k), q = k * AUD, w = 34 * q, h = 9 * q, yy = y - 5 * h + h * .2;
    s += `<g data-hs="ap1977"><rect class="hl sA mech" x="${(x + w / 2 - 1).toFixed(1)}" y="${yy.toFixed(1)}" width="${(5 * q).toFixed(1)}" height="${(h * .55).toFixed(1)}"/>${hit(x + w / 2 - 2, yy - 2, 5 * q + 4, h * .55 + 4)}</g>`;
  }
  s += `<g data-hs="rocker"><path class="hl sM" d="M257,159.4 C259,160.6 265,160.6 267,159.4 M259,159.8 L260,154 M265,159.8 L264,154 M259.6,156 L264.6,156 M264,154 L265,149.5 M260,154 L261,149.5 M261,150.5 L265,150.5"/>${hit(254, 147, 16, 15)}</g>`;
  // the kettle and the sherry, on a filing cabinet against the back wall, right
  {
    const k = .58, y = floorY(k), x = P(516, 0, k)[0], top = y - 40;
    s += `<rect class="k sM mech" x="${x - 18}" y="${top}" width="36" height="${y - top}"/>${[0, 1, 2].map(i => `<path class="hl sM" d="M${x - 15},${top + 4 + i * 12} L${x + 15},${top + 4 + i * 12} M${x - 4},${top + 9 + i * 12} L${x + 4},${top + 9 + i * 12}"/>`).join("")}
      <g data-hs="kettle"><path class="k sW" d="M${x - 14},${top} L${x - 13},${top - 16} C${x - 13},${top - 22} ${x - 1},${top - 22} ${x - 1},${top - 16} L${x},${top} Z"/>
      <path class="sW" d="M${x - 13},${top - 13} L${x - 18},${top - 18} M${x - 1},${top - 14} C${x + 3},${top - 14} ${x + 3},${top - 6} ${x},${top - 6}"/><circle class="fR" cx="${x - 7}" cy="${top - 3}" r="1"/>
      <path class="k sR" d="M${x + 6},${top} L${x + 6},${top - 14} C${x + 6},${top - 17} ${x + 8},${top - 18} ${x + 8},${top - 21} L${x + 8},${top - 25} L${x + 11},${top - 25} L${x + 11},${top - 21} C${x + 11},${top - 18} ${x + 13},${top - 17} ${x + 13},${top - 14} L${x + 13},${top} Z"/>
      <path class="hl sR" d="M${x + 7},${top - 10} L${x + 12},${top - 10} M${x + 7},${top - 5} L${x + 12},${top - 5}"/>
      <path class="sW" d="M${x + 15},${top} L${x + 16},${top - 5} L${x + 20},${top - 5} L${x + 21},${top} M${x + 18},${top - 5} L${x + 18},${top - 8} M${x + 15.5},${top - 9} L${x + 20.5},${top - 9} L${x + 18},${top - 5}"/>
      ${hit(x - 20, top - 27, 44, 28)}</g>`;
  }
  return s;
}

// Iris at her desk (center), the manual and the staple gun on it
function desk(G) {
  const k = .74, y = floorY(k), x0 = P(214, 0, k)[0], x1 = P(426, 0, k)[0], top = y - 24, cx = (x0 + x1) / 2;
  let s = `<g data-hs="iris">${irisSeated(cx + 4, floorY(.68) - 8, .68)}${hit(cx - 18, top - 66, 44, 58)}</g>`;
  s += `<polygon class="k sW" points="${x0},${top} ${x1},${top} ${x1 - 8},${top - 9} ${x0 + 8},${top - 9}"/>
    <rect class="k sM mech" x="${x0}" y="${top}" width="${x1 - x0}" height="${y - top}"/><path class="hl sM" d="M${x0 + 4},${top + 4} L${x0 + 4},${y} M${x1 - 4},${top + 4} L${x1 - 4},${y} M${x1 - 46},${top + 4} L${x1 - 46},${y} M${x1 - 42},${top + 14} L${x1 - 8},${top + 14}"/>
    <path class="hl sW" d="M${cx - 8},${top - 3} L${cx + 26},${top - 3} L${cx + 22},${top - 8} L${cx - 4},${top - 8} Z"/>
    ${chip("EMERITA", x0 + 10, top + 8, 4, "fV")}`;
  // the 1960s magnet manual: a fat binder, flagged with notes
  s += `<g data-hs="manual"><path class="k sB" d="M${x0 + 16},${top - 4} L${x0 + 40},${top - 4} L${x0 + 40},${top - 12} L${x0 + 16},${top - 12} Z"/>
    <path class="hl sB" d="M${x0 + 16},${top - 7} L${x0 + 40},${top - 7} M${x0 + 16},${top - 9.5} L${x0 + 40},${top - 9.5}"/>
    <path class="sA" d="M${x0 + 21},${top - 12} L${x0 + 21},${top - 16} M${x0 + 27},${top - 12} L${x0 + 28},${top - 15} M${x0 + 35},${top - 12} L${x0 + 34},${top - 17}"/>
    ${hit(x0 + 10, top - 20, 36, 18)}</g>`;
  // the staple gun, loaded
  const sx = x1 - 40;
  s += `<g data-hs="stapler"><path class="k sR" d="M${sx},${top - 4} L${sx + 16},${top - 4} L${sx + 16},${top - 7} L${sx + 13},${top - 7} L${sx + 12},${top - 10} L${sx + 2},${top - 10} L${sx},${top - 7} Z"/>
    <path class="sR" d="M${sx + 3},${top - 10} L${sx + 9},${top - 14} L${sx + 12},${top - 10}"/><circle class="fR" cx="${sx + 14.5}" cy="${top - 5.5}" r=".8"/>
    ${hit(sx - 6, top - 18, 28, 16)}</g>`;
  return s;
}

export default {
  id: "iris", name: "EMERITUS OFFICE 4F", pp,
  floor: { yMin: 252, yMax: 287, margin: 16 },
  entries: { fromStairs: [548, 274, -1] },
  draw(G) {
    return { back: back(G), sortables: [{ depth: floorY(.74), svg: desk(G) }] };
  },
  stand: { iris: [326, 262], stacks: [150, 270], manual: [266, 262], photo: [318, 262], letter: [372, 262], stapler: [384, 262],
    kettle: [470, 258], door: [552, 272] },
  labels: {
    day: { iris: { use: "SHAKE HAND" }, stacks: { use: "PULL A VOLUME" }, manual: { use: "LEAF THROUGH" }, stapler: { use: "PICK UP" },
      kettle: { use: "POUR" }, letter: { use: "READ" }, photo: { use: "LOOK CLOSER" }, door: { use: "GO OUT", go: "GO DOWN" } },
    morris: { stacks: { use: "CLIMB" }, kettle: { use: "SNIFF" }, door: { go: "SCURRY DOWN" } },
    night: { door: { use: "GO OUT", go: "GO DOWN" } },
  },
};
