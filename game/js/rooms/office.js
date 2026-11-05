// MAIN OFFICE, 1F — Penny Ledger behind the counter, the purchase-order cabinet, the form rack, the mailboxes, the jammed printer.
import { seg, segC, chip, perspective, shell, sideDoor, hit, arcs } from "../gfx.js";
import { pennyAtDesk, AUD } from "../figures.js";

const pp = perspective(320, 130, 0.5);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];

function back(G) {
  let s = shell(pp);
  // form rack (back wall, left): pigeonholes of forms; PO-7 is the one that matters
  const forms = ["PO-7", "IRB-3", "TR-9", "LV-2", "PO-6", "RX-1", "AB-4", "PO-8", "CF-11"];
  s += `<g data-hs="forms"><rect class="k sW mech" x="172" y="90" width="64" height="74"/>
        ${[0, 1, 2].map(r => [0, 1, 2].map(c => { const x = 176 + c * 20, y = 94 + r * 22, f = forms[r * 3 + c];
          return `<rect class="hl sW mech" x="${x}" y="${y}" width="18" height="20"/><path class="hl sM" d="M${x + 3},${y + 14} L${x + 15},${y + 12} M${x + 3},${y + 17} L${x + 15},${y + 15}"/>
            ${f === "PO-7" ? chip(f, x + 1, y + 2, 3.6, "fA") : seg(f, x + 2, y + 3, 3.2, "sM", .6)}`; }).join("")).join("")}
        ${seg("FORMS", 176, 168, 4.4, "sW", .8)}${hit(170, 88, 68, 88)}</g>`;
  // mailboxes (back wall, center): one slot overflowing
  s += `<g data-hs="mailboxes"><rect class="k sW mech" x="250" y="84" width="96" height="64"/>
        ${[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4, 5].map(c => { const x = 252 + c * 15.5, y = 86 + r * 15;
          return `<rect class="hl sM mech" x="${x}" y="${y}" width="14" height="13"/>`; }).join("")).join("")}
        <rect class="hl sR mech" x="314.5" y="101" width="14" height="13"/>${seg("VALU", 315.5, 115, 2.6, "sR", .5)}
        <path class="sR" d="M316,104 L330,98 M317,108 L333,104 M318,112 L330,118 M320,110 L338,112"/><path class="hl sW" d="M326,120 L336,128 L344,124 L334,116 Z"/>
        ${seg("MAIL", 252, 152, 4.4, "sW", .8)}${hit(248, 82, 100, 78)}</g>`;
  // purchase-order filing cabinet (back wall, right)
  s += `<g data-hs="cabinet"><rect class="k sW mech" x="396" y="118" width="48" height="92"/>
        ${[0, 1, 2, 3].map(i => `<rect class="hl sW mech" x="400" y="${122 + i * 22}" width="40" height="19"/><path class="sW" d="M414,${131 + i * 22} L426,${131 + i * 22}"/>`).join("")}
        ${chip("P.O.", 402, 108, 4.4, "fW")}${seg("1987-", 422, 109.5, 4, "sM", .7)}
        <rect class="hl sA mech" x="404" y="124" width="10" height="5"/>${hit(394, 104, 52, 108)}</g>`;
  // a clock that is, for once, correct
  s += `<circle class="hl sD" cx="372" cy="98" r="9"/><path class="hl sD" d="M372,98 L372,92 M372,98 L376,100"/>`;
  // left wall: back to the hallway
  const d = sideDoor(pp, 0, .62, .78, 108);
  s += `<g data-hs="door">${d.svg}${chip("HALL", d.a[0] + 2, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  // left wall, by the floor: a low vent grille
  const v = [P(0, 250, .86), P(0, 250, .94), P(0, 274, .94), P(0, 274, .86)];
  s += `<g data-hs="vent"><polygon class="k sW mech" points="${poly(...v)}"/>
        ${[1, 2, 3, 4].map(i => { const t = i / 5; const a = [v[0][0] + (v[1][0] - v[0][0]) * t, v[0][1] + (v[1][1] - v[0][1]) * t], b = [v[3][0] + (v[2][0] - v[3][0]) * t, v[3][1] + (v[2][1] - v[3][1]) * t];
          return `<path class="hl sW" d="M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}"/>`; }).join("")}
        ${hit(Math.min(v[0][0], v[1][0]) - 6, v[0][1] - 6, Math.abs(v[1][0] - v[0][0]) + 12, v[2][1] - v[0][1] + 12)}</g>`;
  // Penny, behind the counter, typing (pose group "type")
  // (on a tall office chair: drawn a little higher than a desk sitter so she clears the counter)
  const pk = .645;
  s += `<g data-hs="penny">${pennyAtDesk(320, floorY(pk) - 14, pk)}${hit(294, 150, 52, 62)}</g>`;
  // the counter: Penny's desk is the counter
  const ck = .66, cy = floorY(ck), ct = cy - 26, cx0 = P(110, 0, ck)[0], cx1 = P(530, 0, ck)[0];
  s += `<polygon class="k sW" points="${cx0},${ct} ${cx1},${ct} ${cx1 - 8},${ct - 7} ${cx0 + 8},${ct - 7}"/>
        <rect class="k sM mech" x="${cx0}" y="${ct}" width="${cx1 - cx0}" height="${cy - ct}"/>
        ${[1, 2, 3, 4, 5].map(i => `<path class="hl sD" d="M${cx0 + i * (cx1 - cx0) / 6},${ct + 3} L${cx0 + i * (cx1 - cx0) / 6},${cy - 2}"/>`).join("")}`;
  // on the counter: her keyboard (clatter in pose group "type"), a nameplate, a bell (red herring)
  s += `<path class="hl sW" d="M300,${ct - 4} L340,${ct - 4} L343,${ct - 1} L297,${ct - 1} Z"/>
        <g class="pz on" data-g="type" data-i="0">${arcs(294, ct - 8, -1, "sM", 2, .45)}</g><g class="pz" data-g="type" data-i="1">${arcs(346, ct - 8, 1, "sM", 2, .45)}</g>
        ${chip("P. LEDGER", 352, ct + 6, 4, "fB")}
        <path class="sA" d="M270,${ct - 1} C270,${ct - 9} 282,${ct - 9} 282,${ct - 1} Z M276,${ct - 9} L276,${ct - 11}"/>`;
  // the sign on the counter: BACK IN 5 MIN (she's right there)
  s += `<g data-hs="sign"><path class="k sA" d="M206,${ct - 1} L214,${ct - 15} L250,${ct - 15} L242,${ct - 1} Z"/>
        <g transform="translate(0,0)">${seg("BACK IN", 214, ct - 13, 3.8, "sA", .7)}${seg("5 MIN", 214, ct - 7.5, 3.8, "sA", .7)}</g>${hit(202, ct - 18, 52, 20)}</g>`;
  return s;
}

// the printer on its stand, front right: jammed since August
function printer(G) {
  const k = .84, y = floorY(k), x = P(560, 0, k)[0], top = y - 32;
  const fixed = !!G.flags.printerFixed;
  return `<g data-hs="printer">
    <path class="hl sD" d="M${x - 22},${top} L${x - 24},${y} M${x + 22},${top} L${x + 24},${y}"/>
    <polygon class="k sW" points="${x - 26},${top} ${x + 26},${top} ${x + 22},${top - 5} ${x - 22},${top - 5}"/>
    <rect class="k sW mech" x="${x - 20}" y="${top - 24}" width="40" height="19"/><path class="hl sW" d="M${x - 16},${top - 16} L${x + 10},${top - 16}"/>
    <path class="sW" d="M${x - 14},${top - 24} L${x - 12},${top - 34} L${x + 12},${top - 34} L${x + 14},${top - 24}"/>
    ${fixed ? `<circle class="fG" cx="${x + 15}" cy="${top - 10}" r="1.6"/>${seg("READY", x - 14, top - 11, 3.4, "sG", .6)}`
      : `<path class="sR" d="M${x - 8},${top - 6} L${x - 2},${top - 2} L${x + 4},${top - 7} L${x + 9},${top - 1}"/>
        <g class="pz on" data-g="jam" data-i="0">${chip("JAM", x - 10, top - 46, 4.6, "fR")}${arcs(x + 22, top - 15, 1, "sR", 3, .55)}${arcs(x - 22, top - 15, -1, "sR", 3, .55)}</g>
        <g class="pz" data-g="jam" data-i="1">${chip("JAM", x - 10, top - 46, 4.6, "fR")}</g>`}
    ${hit(x - 30, top - 50, 60, y - top + 50)}</g>`;
}

export default {
  id: "office", name: "MAIN OFFICE 1F", pp,
  floor: { yMin: 242, yMax: 287, margin: 16 },
  entries: { fromHall: [118, 262, 1] },
  draw(G) {
    return { back: back(G), sortables: [{ depth: floorY(.84), svg: printer(G) }] };
  },
  stand: { penny: [316, 248], cabinet: [420, 248], forms: [204, 248], printer: [480, 270], mailboxes: [296, 248], sign: [224, 250],
    vent: [52, 278], door: [112, 264] },
  labels: {
    day: { printer: { use: "PRINT" }, cabinet: { use: "OPEN" }, forms: { use: "TAKE FORM" }, mailboxes: { use: "RUMMAGE" }, sign: { use: "FLIP" },
      door: { use: "GO OUT", go: "GO OUT" }, penny: { use: "RING BELL" } },
    morris: { printer: { use: "CRAWL IN" }, vent: { use: "CLIMB IN" }, door: { go: "SCURRY OUT" }, mailboxes: { use: "NEST" }, cabinet: { use: "GNAW" } },
    night: { door: { use: "GO OUT", go: "GO OUT" } },
  },
};
