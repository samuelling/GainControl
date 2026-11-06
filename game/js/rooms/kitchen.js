// COFFEE KITCHEN 1F — the broken espresso machine (DESCALE), Dr. Rex Jected leaning beside it, the mug tree,
// the fridge nobody should drink from, the corkboard, the sink. Act III.
import { seg, segC, chip, chipW, perspective, shell, sideDoor, hit, arcs } from "../gfx.js";
import { rexStanding } from "../cast/act3b.js";

const pp = perspective(320, 130, 0.5);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];

// the back counter runs along the back wall; its front edge sits at depth CK
const CK = .56, CY = floorY(CK), CT = CY - 36;          // floor line under the counter, counter top (front edge)

function back(G) {
  let s = shell(pp);
  // wall cabinets (atmosphere)
  s += `<rect class="k sD mech" x="250" y="82" width="140" height="44"/>${[0, 1, 2, 3].map(i => `<rect class="hl sD mech" x="${253 + i * 34.5}" y="85" width="32" height="38"/><path class="hl sD" d="M${(i % 2 ? 256 : 282) + i * 34.5},100 L${(i % 2 ? 256 : 282) + i * 34.5},108"/>`).join("")}`;
  // the corkboard, back wall left: the Friday question nobody answers
  s += `<g data-hs="board"><rect class="k sA mech" x="176" y="84" width="64" height="58"/>
        <g transform="rotate(-4 196 104)"><rect class="k sW mech" x="181" y="90" width="34" height="26"/>${seg("WHO KEEPS", 183.5, 93, 3, "sW", .5)}${seg("BOOKING THE", 183.5, 98.5, 3, "sW", .5)}${seg("OLD B-LEVEL", 183.5, 104, 3, "sW", .5)}${seg("ROOM ON FRI?", 183.5, 109.5, 3, "sR", .5)}</g>
        <rect class="hl sM mech" x="218" y="90" width="17" height="14"/><path class="hl sM" d="M221,94 L232,94 M221,98 L230,98"/>
        <rect class="hl sG mech" x="200" y="122" width="22" height="14"/><path class="hl sG" d="M203,126 L219,126 M203,130 L214,130"/>
        <rect class="hl sM mech" x="226" y="112" width="11" height="22"/>
        <circle class="fR" cx="197" cy="91" r="1.2"/><circle class="fA" cx="211" cy="123" r="1.1"/><circle class="fB" cx="226" cy="91" r="1.1"/>${hit(174, 82, 68, 62)}</g>`;
  // the fridge, standing in the back-right corner
  const fx = 418, fy0 = 106, fy1 = floorY(.54);
  s += `<g data-hs="fridge"><rect class="k sW mech" x="${fx}" y="${fy0}" width="46" height="${fy1 - fy0}"/><path class="sW mech" d="M${fx},${fy0 + 34} L${fx + 46},${fy0 + 34}"/>
        <path class="sW" d="M${fx + 6},${fy0 + 20} L${fx + 6},${fy0 + 30} M${fx + 6},${fy0 + 40} L${fx + 6},${fy0 + 56}"/>
        <g transform="rotate(3 ${fx + 26} ${fy0 + 56})"><rect class="k sR mech" x="${fx + 11}" y="${fy0 + 44}" width="32" height="22"/>${seg("DO NOT", fx + 14, fy0 + 47, 4, "sR", .7)}${seg("DRINK", fx + 14, fy0 + 53, 4, "sR", .7)}${seg("SAMPLE", fx + 14, fy0 + 59.5, 3.4, "sW", .6)}</g>
        <circle class="hl sB" cx="${fx + 34}" cy="${fy0 + 14}" r="3"/><path class="hl sB" d="M${fx + 31},${fy0 + 14} L${fx + 37},${fy0 + 14}"/>
        ${hit(fx - 2, fy0 - 2, 50, fy1 - fy0 + 4)}</g>`;
  // the back counter (sink, mug tree and machine sit on it)
  const x0 = 172, x1 = 412;
  s += `<polygon class="k sW" points="${x0},${CT} ${x1},${CT} ${x1 - 6},${CT - 7} ${x0 + 6},${CT - 7}"/>
        <rect class="k sM mech" x="${x0}" y="${CT}" width="${x1 - x0}" height="${CY - CT}"/>
        ${[1, 2, 3, 4, 5].map(i => `<path class="hl sD" d="M${x0 + i * 40},${CT + 3} L${x0 + i * 40},${CY - 2}"/>`).join("")}
        ${[0, 1, 2, 3, 4, 5].map(i => `<path class="hl sD" d="M${x0 + 16 + i * 40},${CT + 8} L${x0 + 24 + i * 40},${CT + 8}"/>`).join("")}`;
  // the sink, with a dripping tap (pose group "drip")
  s += `<g data-hs="sink"><path class="hl sW" d="M188,${CT - 2} L232,${CT - 2} L228,${CT - 6} L192,${CT - 6} Z"/>
        <path class="sW" d="M210,${CT - 6} L210,${CT - 18} C210,${CT - 22} 218,${CT - 22} 218,${CT - 17}"/><path class="sW" d="M206,${CT - 8} L206,${CT - 11} M214,${CT - 8} L214,${CT - 11}"/>
        <g class="pz on" data-g="drip" data-i="0"><path class="sB" d="M218,${CT - 14} L218,${CT - 12.5}"/></g><g class="pz" data-g="drip" data-i="1"><path class="sB" d="M218,${CT - 9} L218,${CT - 7.5}"/></g>
        <path class="hl sM" d="M196,${CT - 4} C199,${CT - 12} 203,${CT - 12} 204,${CT - 6}"/>${hit(184, CT - 24, 52, 26)}</g>`;
  // the mug tree: four hooks, one empty once Nell takes a mug
  const mx = 262, mt = CT - 40;
  const mug = (x, y, d) => `<path class="k sW" d="M${x - 4},${y} L${x + 4},${y} L${x + 3.5},${y + 9} L${x - 3.5},${y + 9} Z"/><path class="sW" d="M${x + d * 4},${y + 2} C${x + d * 8},${y + 2} ${x + d * 8},${y + 7} ${x + d * 3.6},${y + 7}"/>`;
  const hooks = [[-1, mt + 10], [1, mt + 14], [-1, mt + 22], [1, mt + 26]];
  s += `<g data-hs="mugs"><path class="sW" d="M${mx},${CT - 2} L${mx},${mt} M${mx - 9},${CT - 2} L${mx + 9},${CT - 2}"/><circle class="sW" cx="${mx}" cy="${mt - 2}" r="2"/>
        ${hooks.map(([d, y], i) => `<path class="hl sW" d="M${mx},${y - 3} L${mx + d * 7},${y - 1}"/>${i === 1 && G.flags.gotMug ? "" : mug(mx + d * 12, y - 1, -d)}`).join("")}
        ${hit(mx - 22, mt - 6, 44, CT - mt + 6)}</g>`;
  // the vent, low on the left wall
  const v = [P(0, 250, .84), P(0, 250, .92), P(0, 272, .92), P(0, 272, .84)];
  s += `<g data-hs="vent"><polygon class="k sW mech" points="${poly(...v)}"/>
        ${[1, 2, 3, 4].map(i => { const t = i / 5; const a = [v[0][0] + (v[1][0] - v[0][0]) * t, v[0][1] + (v[1][1] - v[0][1]) * t], b = [v[3][0] + (v[2][0] - v[3][0]) * t, v[3][1] + (v[2][1] - v[3][1]) * t];
          return `<path class="hl sW" d="M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}"/>`; }).join("")}
        ${hit(Math.min(v[0][0], v[1][0]) - 6, v[0][1] - 6, Math.abs(v[1][0] - v[0][0]) + 12, v[2][1] - v[0][1] + 12)}</g>`;
  // left wall: back to the hallway
  const d = sideDoor(pp, 0, .6, .76, 108);
  s += `<g data-hs="door">${d.svg}${chip("HALL", d.a[0] + 2, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  // right wall: a window onto the parking lot (atmosphere), a coffee-rota sheet
  const w = [P(640, 110, .62), P(640, 110, .8), P(640, 190, .8), P(640, 190, .62)];
  s += `<polygon class="k sD mech" points="${poly(...w)}"/><path class="hl sD" d="M${((w[0][0] + w[1][0]) / 2).toFixed(1)},${((w[0][1] + w[1][1]) / 2).toFixed(1)} L${((w[3][0] + w[2][0]) / 2).toFixed(1)},${((w[3][1] + w[2][1]) / 2).toFixed(1)}"/>`;
  return s;
}

// the espresso machine, on the counter: gauge in the red, DESCALE blinking, drips; descaled: READY lit, a curl of steam
function espresso(G) {
  const x = 300, b = CT - 2, t = b - 50, ok = !!G.flags.descaled;
  let s = `<g data-hs="espresso">
    ${[0, 1, 2, 3, 4, 5].map(i => `<path class="hl sM mech" d="M${x + 4 + i * 7},${t - 5} L${x + 4 + i * 7},${t}"/>`).join("")}<path class="hl sM mech" d="M${x + 2},${t - 5} L${x + 44},${t - 5}"/>
    <rect class="k sW mech" x="${x}" y="${t}" width="46" height="${b - t}"/><path class="sW mech" d="M${x},${t + 8} L${x + 46},${t + 8}"/>
    <circle class="k sW" cx="${x + 35}" cy="${t + 18}" r="6"/><path class="hl sW" d="M${x + 31},${t + 22} L${x + 32},${t + 21} M${x + 39},${t + 22} L${x + 38},${t + 21} M${x + 35},${t + 13} L${x + 35},${t + 14}"/>
    <path class="sR" d="M${x + 35},${t + 18} ${ok ? `L${x + 32},${t + 14}` : `L${x + 39.5},${t + 15}`}"/>
    <path class="k sW mech" d="M${x + 8},${t + 24} L${x + 24},${t + 24} L${x + 22},${t + 29} L${x + 10},${t + 29} Z"/><path class="sB mech" d="M${x + 24},${t + 26} L${x + 34},${t + 28}"/><circle class="hl sB" cx="${x + 35.5}" cy="${t + 28.5}" r="1.4"/>
    <path class="hl sM mech" d="M${x + 4},${b - 5} L${x + 30},${b - 5}"/>
    <circle class="${ok ? "fG" : "hl sG"}" cx="${x + 41}" cy="${t + 4}" r="1.3"/>`;
  if (ok) s += `${seg("READY", x + 4, t + 2, 3.4, "sG", .6)}
    <g class="pz on" data-g="drip" data-i="0"><path class="hl sW" d="M${x + 38},${t - 7} C${x + 42},${t - 11} ${x + 35},${t - 15} ${x + 39},${t - 21}"/></g>
    <g class="pz" data-g="drip" data-i="1"><path class="hl sW" d="M${x + 39},${t - 8} C${x + 35},${t - 13} ${x + 42},${t - 17} ${x + 37},${t - 24}"/></g>`;
  else s += `${seg("OUT OF ORDER", x + 4, t + 2, 3, "sR", .5)}
    <g class="pz on" data-g="jam" data-i="0">${chip("DESCALE", x + 4, t - 18, 4.6, "fR")}${arcs(x + 48, t - 14, 1, "sR", 2, .5)}${arcs(x - 2, t - 14, -1, "sR", 2, .5)}</g>
    <g class="pz" data-g="jam" data-i="1"><rect class="hl sR" x="${x + 4}" y="${t - 18}" width="${chipW("DESCALE", 4.6).toFixed(1)}" height="7.8"/>${seg("DESCALE", x + 6.1, t - 16.4, 4.6, "sR", .9)}</g>
    <g class="pz on" data-g="drip" data-i="0"><circle class="fK" cx="${x + 16}" cy="${t + 32}" r="1"/></g>
    <g class="pz" data-g="drip" data-i="1"><circle class="fK" cx="${x + 16}" cy="${t + 38}" r="1"/></g>
    <path class="hl sK" d="M${x + 12},${b - 6} C${x + 14},${b - 8} ${x + 18},${b - 8} ${x + 20},${b - 6}"/>`;
  return s + hit(x - 4, t - 22, 54, b - t + 24) + `</g>`;
}

export default {
  id: "kitchen", name: "COFFEE KITCHEN 1F", pp,
  floor: { yMin: 236, yMax: 287, margin: 16 },
  entries: { fromHall: [116, 260, 1] },
  draw(G) {
    const rex = G.mode !== "night", ry = 240, rx = 372, rk = kAtY(ry);
    return { back: back(G) + espresso(G), sortables: [
      { depth: ry, svg: rex ? `<g data-hs="rex">${rexStanding(rx, ry, rk)}${hit(rx - 16, ry - 124 * rk * .72, 34, 124 * rk * .72 + 2)}</g>` : "" },
    ] };
  },
  stand: { rex: [340, 252], espresso: [322, 244], mugs: [266, 244], fridge: [440, 248], board: [208, 246], sink: [212, 244],
    vent: [60, 276], door: [112, 262] },
  labels: {
    day: { espresso: { use: "BREW" }, mugs: { use: "TAKE A MUG" }, sink: { use: "RINSE" }, fridge: { use: "OPEN" }, board: { use: "READ" },
      door: { use: "GO OUT", go: "GO OUT" }, rex: { use: "GIVE" } },
    night: { espresso: { use: "BREW" }, mugs: { use: "TAKE A MUG" }, sink: { use: "RINSE" }, fridge: { use: "OPEN" }, board: { use: "READ" },
      door: { use: "GO OUT", go: "GO OUT" } },
    morris: { vent: { use: "CLIMB IN" }, door: { go: "SCURRY OUT" }, espresso: { use: "LICK DRIP" }, fridge: { use: "SNIFF" }, mugs: { use: "CLIMB" } },
  },
};
