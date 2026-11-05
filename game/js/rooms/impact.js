// IMPACT LAB 116 (night) — brushed steel, no window, server lights. Preston's PC is logged in, running FOG NEURO.
// The second monitor is the Gain Controller status panel (clicking it is a death).
import { seg, segC, chip, perspective, shell, sideDoor, hit, arcs } from "../gfx.js";

const pp = perspective(320, 130, 0.5);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];

function back(G) {
  let s = shell(pp, { rail: false });
  // brushed steel: tight hairlines across the back wall
  for (let y = 70; y < 210; y += 6) s += `<path class="hl sD" d="M160,${y} L480,${y}"/>`;
  // a server rack, back wall right, LEDs blinking (pose group "hum")
  s += `<rect class="k sM mech" x="422" y="74" width="50" height="136"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect class="hl sM mech" x="426" y="${78 + i * 16}" width="42" height="13"/>`).join("")}
    <g class="pz on" data-g="hum" data-i="0">${[0, 2, 4, 6].map(i => `<circle class="fG" cx="${460}" cy="${84 + i * 16}" r="1.3"/>`).join("")}${[1, 5].map(i => `<circle class="fA" cx="${454}" cy="${84 + i * 16}" r="1.3"/>`).join("")}</g>
    <g class="pz" data-g="hum" data-i="1">${[1, 3, 5, 7].map(i => `<circle class="fG" cx="${460}" cy="${84 + i * 16}" r="1.3"/>`).join("")}${[2, 6].map(i => `<circle class="fA" cx="${454}" cy="${84 + i * 16}" r="1.3"/>`).join("")}</g>`;
  // the motivational poster, back wall left
  s += `<g data-hs="poster"><rect class="k sW mech" x="176" y="86" width="56" height="70"/>
    <path class="hl sB" d="M182,134 L196,112 L204,122 L214,104 L226,134 Z"/><circle class="hl sA" cx="216" cy="98" r="4"/>
    ${segC("SYNERGY", 204, 140, 6, "sA", 1)}${segC("ALONE WE ARE N", 204, 149.5, 2.8, "sM", .5)}${hit(174, 84, 60, 74)}</g>`;
  // left wall: back to the hallway
  const d = sideDoor(pp, 0, .56, .7, 108);
  s += `<g data-hs="door">${d.svg}${chip("HALL", d.a[0], d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  // the floor glows faintly under the desk: a strip light, like under the door outside
  return s;
}

// Preston's desk: the PC (FOG NEURO), the Gain Controller panel, a carton of oat synergy
function desk(G) {
  const k = .66, y = floorY(k), top = y - 30, x0 = P(150, 0, k)[0], x1 = P(490, 0, k)[0];
  let s = `<path class="hl sM" d="M${x0 + 6},${top} L${x0 + 4},${y} M${x1 - 6},${top} L${x1 - 4},${y}"/>
    <polygon class="k sW" points="${x0},${top} ${x1},${top} ${x1 - 10},${top - 9} ${x0 + 10},${top - 9}"/>
    <path class="hl sA" d="M${x0 + 8},${y - 1} L${x1 - 8},${y - 1}"/>`;
  // the main monitor
  const mx = 236, my = top - 62;
  s += `<g data-hs="pc"><path class="sW" d="M${mx + 44},${top - 9} L${mx + 44},${top - 16} M${mx + 32},${top - 9} L${mx + 56},${top - 9}"/>
    <rect class="k sW mech" x="${mx}" y="${my}" width="88" height="46"/>
    ${segC("FOG NEURO", mx + 44, my + 8, 9, "sG", 1.3)}
    <path class="hl sG" d="M${mx + 14},${my + 22} L${mx + 74},${my + 22}"/>
    ${chip("GENERATE", mx + 22, my + 28, 4.6, "fG")}<path class="hl sM" d="M${mx + 64},${my + 30} L${mx + 80},${my + 30} M${mx + 64},${my + 34} L${mx + 76},${my + 34}"/>
    <path class="hl sW" d="M${mx + 8},${top - 5} L${mx + 70},${top - 5} L${mx + 74},${top - 2} L${mx + 4},${top - 2} Z"/>
    ${hit(mx - 4, my - 4, 96, top - my + 6)}</g>`;
  // the Gain Controller status panel
  const gx = 340, gy = top - 52;
  s += `<g data-hs="gainpanel"><path class="sW" d="M${gx + 26},${top - 9} L${gx + 26},${top - 14}"/>
    <rect class="k sW mech" x="${gx}" y="${gy}" width="52" height="38"/>
    ${seg("GAIN", gx + 4, gy + 4, 4, "sW", .7)}${seg("P. VALU", gx + 4, gy + 10, 3.4, "sR", .6)}
    <path class="sW" d="M${gx + 30},${gy + 22} A10,10 0 0 1 ${gx + 50},${gy + 22}"/><path class="hl sW" d="M${gx + 30},${gy + 22} L${gx + 50},${gy + 22}"/>
    <path class="sR" d="M${gx + 40},${gy + 22} L${gx + 47},${gy + 15}"/>
    <rect class="hl sG" x="${gx + 4}" y="${gy + 28}" width="44" height="5"/><rect class="fG" x="${gx + 4}" y="${gy + 28}" width="34" height="5"/>
    ${hit(gx - 4, gy - 4, 60, top - gy)}</g>`;
  // adaptogenic oat synergy
  const ox = 410;
  s += `<g data-hs="oat"><path class="k sA" d="M${ox},${top - 9} L${ox},${top - 30} L${ox + 5},${top - 36} L${ox + 11},${top - 30} L${ox + 11},${top - 9} Z"/>
    <path class="hl sA" d="M${ox},${top - 30} L${ox + 11},${top - 30}"/>${seg("OAT", ox + 1.5, top - 26, 3.4, "sA", .6)}${hit(ox - 6, top - 40, 24, 34)}</g>`;
  return s;
}

// a sleek printer on a side table, front left
function printer(G) {
  const k = .8, y = floorY(k), x = P(110, 0, k)[0], top = y - 30;
  return `<g data-hs="printer"><path class="hl sD" d="M${x - 20},${top} L${x - 22},${y} M${x + 20},${top} L${x + 22},${y}"/>
    <polygon class="k sW" points="${x - 24},${top} ${x + 24},${top} ${x + 20},${top - 5} ${x - 20},${top - 5}"/>
    <rect class="k sW mech" x="${x - 18}" y="${top - 16}" width="36" height="11" rx="3"/><path class="hl sW" d="M${x - 12},${top - 9} L${x + 8},${top - 9}"/>
    <circle class="fG" cx="${x + 13}" cy="${top - 10.5}" r="1.3"/>${hit(x - 28, top - 22, 56, y - top + 22)}</g>`;
}

export default {
  id: "impact", name: "IMPACT LAB 116", pp,
  floor: { yMin: 240, yMax: 287, margin: 16 },
  entries: { fromHall: [140, 248, 1] },
  draw(G) {
    return { back: back(G), sortables: [
      { depth: floorY(.66), svg: desk(G) },
      { depth: floorY(.8), svg: printer(G) },
    ] };
  },
  stand: { pc: [282, 246], gainpanel: [366, 246], printer: [150, 268], oat: [410, 248], poster: [210, 246], door: [140, 248] },
  labels: {
    night: { pc: { use: "USE" }, gainpanel: { use: "TOUCH" }, printer: { use: "PRINT" }, oat: { use: "DRINK" }, poster: { use: "STRAIGHTEN" },
      door: { use: "GO OUT", go: "GO OUT" } },
  },
};
