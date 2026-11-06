// ADLINE LAB 114 — Nell's desk and drawer, the null-results whiteboard, Prof. Adline's door, the dark booth, Brett.
import { seg, chip, perspective, shell, sideDoor, hit, arcs } from "../gfx.js";
import { brettFigure, morrisPeek, smallFigure, AUD } from "../figures.js";
import { gusSeated } from "../cast/act3a.js";

const pp = perspective(320, 130, 0.45);
const { P, poly, kAtY, FY } = pp;
const act3day = (G) => G.act === 3 && G.mode === "day";
let cur = null;   // the last state drawn (labels that differ by act read it)

function back(G) {
  let s = shell(pp);
  // whiteboard of null results
  s += `<g data-hs="whiteboard"><rect class="k sW mech" x="192" y="86" width="140" height="66"/>
        <path class="hl sM mech" d="M200,140 L262,140 M200,140 L200,98"/>
        <polyline class="sW" points="202,121 208,118 214,124 220,119 226,123 232,117 238,124 244,120 250,122 256,119 262,121"/>
        ${[208, 220, 232, 244, 256].map(x => `<path class="hl sM mech" d="M${x},112 L${x},130"/>`).join("")}
        ${seg("P = .48", 270, 96, 7, "sR", 1)}${seg("N.S.", 270, 110, 6, "sM", .9)}
        ${seg("WHY", 296, 110, 6, "sW", .9)}<ellipse class="hl sW" cx="301" cy="113" rx="10" ry="7"/>
        ${seg("DEFENSE FRI 2PM!!", 270, 136, 4.4, "sR", .8)}<path class="sM" d="M196,152 L328,152"/>${hit(190, 84, 144, 70)}</g>`;
  // a low vent grille under the whiteboard (Morris's front door)
  s += `<g data-hs="vent"><rect class="k sW mech" x="300" y="188" width="26" height="11"/>
        ${[0, 1, 2, 3, 4].map(i => `<path class="hl sW" d="M${304 + i * 4.5},190 L${304 + i * 4.5},197"/>`).join("")}${hit(294, 182, 38, 22)}</g>`;
  // Prof. Adline's door: sign, light under the door, a phone call that never ends
  s += `<g data-hs="adline"><rect class="k sW mech" x="352" y="104" width="54" height="98"/>
        ${chip("PROF. D. ADLINE", 354, 92, 4.4, "fW")}${chip("AFTER THE 15TH", 357, 122, 4.2, "fR")}
        <path class="sW" d="M398,150 L398,158"/><path class="hl sA" d="M354,201 L404,201"/>
        <g class="pz on" data-g="phone" data-i="0"></g><g class="pz" data-g="phone" data-i="1">${arcs(412, 150, 1, "sA", 2, .7)}</g>
        ${hit(350, 90, 60, 114)}</g>`;
  // left wall: back to the hallway
  const d = sideDoor(pp, 0, .62, .8, 120);
  s += `<g data-hs="door">${d.svg}${chip("HALL", d.a[0] + 2, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  // right wall: the dark-adapted psychophysics booth
  const b = sideDoor(pp, 640, .58, .82, 84, "sV");
  const cx = (b.a[0] + b.b[0]) / 2;
  s += `<g data-hs="booth">${b.svg}
        ${[0, 1, 2, 3, 4].map(i => { const k = .6 + i * .045; const t = P(640, 92, k), u = P(640, FY, k); return `<path class="hl sV" d="M${t[0]},${t[1]} C${t[0] + 3},${(t[1] + u[1]) / 2 - 20} ${t[0] - 3},${(t[1] + u[1]) / 2 + 20} ${u[0]},${u[1]}"/>`; }).join("")}
        ${chip("DARK BOOTH", cx - 22, b.a[1] - 16, 4.4, "fV")}<circle class="hl sR" cx="${b.b[0] - 8}" cy="${b.b[1] + 10}" r="2.2"/>${hit(...b.box)}</g>`;
  return s;
}

// Nell's desk, front left: monitor, keyboard, drawer (Morris), ramen cup, sticky note when it arrives
function desk(G) {
  const k = .82, y = P(0, FY, k)[1], x = P(170, FY, k)[0];
  const act1 = !G.act || G.act === 1;
  const day = act1 ? G.mode === "day" : G.mode !== "night";
  const rat = act1 ? ((day && G.flags.morrisMoved) || !day) : !!G.flags.morrisInDrawer;
  return `<g>
    <path class="hl sM" d="M${x - 46},${y - 30} L${x - 48},${y} M${x - 10},${y - 30} L${x - 10},${y}"/>
    <polygon class="k sW" points="${x - 50},${y - 30} ${x + 50},${y - 30} ${x + 44},${y - 40} ${x - 44},${y - 40}"/>
    <g data-hs="monitor">
      <path class="sW" d="M${x - 6},${y - 40} L${x - 6},${y - 46} M${x - 14},${y - 40} L${x + 2},${y - 40}"/>
      <rect class="k sW mech" x="${x - 30}" y="${y - 76}" width="48" height="30"/>
      <g class="day-only">${seg("MATLAB", x - 26, y - 72, 3.8, "sM", .6)}${seg("ERROR:", x - 26, y - 64, 4.4, "sR", .7)}${seg("N.S.", x - 26, y - 56, 4.4, "sG", .7)}</g>
      <g class="night-only"><g class="pz on" data-g="saver" data-i="0">${seg("N.S.", x - 24, y - 70, 5, "sG", .8)}</g><g class="pz" data-g="saver" data-i="1">${seg("N.S.", x - 4, y - 58, 5, "sG", .8)}</g></g>
      ${act1 && G.flags.noteReady && !G.flags.noteRead ? `<g transform="rotate(8 ${x + 16} ${y - 70})"><rect class="k sA" x="${x + 8}" y="${y - 80}" width="16" height="16"/>
        <path class="hl sA" d="M${x + 11},${y - 75} L${x + 21},${y - 75} M${x + 11},${y - 71} L${x + 21},${y - 71} M${x + 11},${y - 67} L${x + 19},${y - 67}"/></g>` : ""}
      <path class="hl sW" d="M${x - 34},${y - 36} L${x + 10},${y - 36} L${x + 14},${y - 32} L${x - 38},${y - 32} Z"/>
      ${hit(x - 40, y - 82, 70, 50)}</g>
    <g data-hs="drawer">
      <rect class="k sW mech" x="${x + 8}" y="${y - 30}" width="38" height="14"/><path class="sW" d="M${x + 22},${y - 22} L${x + 32},${y - 22}"/>
      <rect class="k sW mech" x="${x + 10}" y="${y - 16}" width="34" height="14"/><path class="sW" d="M${x + 22},${y - 8} L${x + 32},${y - 8}"/>
      <path class="sA" d="M${x + 34},${y - 40} L${x + 36},${y - 48} L${x + 44},${y - 48} L${x + 46},${y - 40}"/>
      ${rat ? (day ? morrisPeek(x + 27, y - 30, .9) : `<g transform="translate(${x + 27},${y - 30})"><path class="k sW" d="M-10,0 C-10,-6 10,-6 10,0 Z"/><path class="hl sW" d="M-4,-3 L-1,-3 M3,-3 L6,-3"/>${seg("Z", 10, -14, 4, "sM", .7)}${seg("Z", 15, -20, 3, "sM", .6)}</g>`) : ""}
      ${hit(x + 6, y - 50, 44, 50)}</g>
  </g>`;
}
// Gus's desk, front right: closed laptop, headphones, the Gaussian mug, a sticky note
function otherDesk(G) {
  const k = .78, y = P(0, FY, k)[1], x = P(470, FY, k)[0];
  if (!G.act || G.act === 1) return `<g><path class="hl sD" d="M${x - 40},${y - 28} L${x - 42},${y} M${x + 40},${y - 28} L${x + 42},${y}"/>
    <polygon class="k sD" points="${x - 44},${y - 28} ${x + 44},${y - 28} ${x + 38},${y - 37} ${x - 38},${y - 37}"/>
    <rect class="k sD mech" x="${x - 18}" y="${y - 64}" width="38" height="24"/><path class="hl sD" d="M${x},${y - 40} L${x},${y - 37}"/></g>`;
  const t = y - 37;
  if (act3day(G)) return gusDesk3(G, x, y, t);
  return `<g data-hs="gusdesk"><path class="hl sM" d="M${x - 40},${y - 28} L${x - 42},${y} M${x + 40},${y - 28} L${x + 42},${y}"/>
    <polygon class="k sW" points="${x - 44},${y - 28} ${x + 44},${y - 28} ${x + 38},${t} ${x - 38},${t}"/>
    <polygon class="k sV" points="${x - 26},${t + 4} ${x + 6},${t + 4} ${x + 2},${t - 1} ${x - 22},${t - 1}"/><path class="hl sV" d="M${x - 22},${t + 1.5} L${x + 2},${t + 1.5}"/>
    <rect class="k sA" x="${x - 18}" y="${t - 7}" width="8" height="6" transform="rotate(-8 ${x - 14} ${t - 4})"/>
    <path class="sW" d="M${x + 10},${t + 1} C${x + 10},${t - 12} ${x + 30},${t - 12} ${x + 30},${t + 1}"/><ellipse class="k sW" cx="${x + 10}" cy="${t}" rx="3" ry="4"/><ellipse class="k sW" cx="${x + 30}" cy="${t}" rx="3" ry="4"/>
    <path class="k sA" d="M${x + 34},${t + 2} L${x + 34},${t - 10} L${x + 44},${t - 10} L${x + 44},${t + 2} Z M${x + 44},${t - 7} C${x + 49},${t - 7} ${x + 49},${t - 1} ${x + 44},${t - 1}"/>
    <path class="hl sA" d="M${x + 35.5},${t - 2} C${x + 37.5},${t - 2} ${x + 38},${t - 8} ${x + 39},${t - 8} C${x + 40},${t - 8} ${x + 40.5},${t - 2} ${x + 42.5},${t - 2}"/>
    ${hit(x - 46, t - 16, 98, y - t + 16)}</g>`;
}
// Act III day: the laptop is open (the Big Finding on it), an energy drink, the Gaussian mug; Gus wears his headphones
function gusDesk3(G, x, y, t) {
  const lx = x - 24;
  return `<g data-hs="gusdesk"><path class="hl sM" d="M${x - 40},${y - 28} L${x - 42},${y} M${x + 40},${y - 28} L${x + 42},${y}"/>
    <polygon class="k sW" points="${x - 44},${y - 28} ${x + 44},${y - 28} ${x + 38},${t} ${x - 38},${t}"/>
    <path class="k sA" d="M${x + 34},${t + 2} L${x + 34},${t - 10} L${x + 44},${t - 10} L${x + 44},${t + 2} Z M${x + 44},${t - 7} C${x + 49},${t - 7} ${x + 49},${t - 1} ${x + 44},${t - 1}"/>
    <path class="hl sA" d="M${x + 35.5},${t - 2} C${x + 37.5},${t - 2} ${x + 38},${t - 8} ${x + 39},${t - 8} C${x + 40},${t - 8} ${x + 40.5},${t - 2} ${x + 42.5},${t - 2}"/>
    ${G.flags.gotDrink ? "" : `<path class="k sG" d="M${x + 22},${t + 2} L${x + 22},${t - 13} L${x + 29},${t - 13} L${x + 29},${t + 2} Z"/><path class="hl sG" d="M${x + 22},${t - 10} L${x + 29},${t - 10} M${x + 23.5},${t - 6} L${x + 27.5},${t - 4}"/>`}
    <rect class="k sA" x="${x - 40}" y="${t - 7}" width="8" height="6" transform="rotate(-8 ${x - 36} ${t - 4})"/>
    ${hit(x - 46, t - 2, 98, y - t + 2)}</g>
    <g data-hs="${G.flags.meeting ? "gusdesk" : "gus"}"><polygon class="k sV" points="${lx - 14},${t + 2} ${lx + 14},${t + 2} ${lx + 13},${t - 15} ${lx - 13},${t - 15}"/>
    <circle class="hl sV" cx="${lx}" cy="${t - 7}" r="3"/><path class="hl sV" d="M${lx - 2},${t - 7} C${lx - 1},${t - 10} ${lx + 1},${t - 10} ${lx + 2},${t - 7}"/>
    <path class="sV" d="M${lx - 16},${t + 2} L${lx + 16},${t + 2}"/>${hit(lx - 16, t - 17, 32, 19)}</g>`;
}
// Act III day: Gus at his desk (until he leaves for the faculty meeting), and Det. Sgt. Small waiting by the door
function gus3(G) {
  if (!act3day(G) || G.flags.meeting) return "";
  const k = .72, y = P(0, FY, k)[1], x = P(470, FY, .78)[0] - 22;
  return `<g data-hs="gus">${gusSeated(x, y, k)}${hit(x - 20, y - 132 * k * AUD, 40, 132 * k * AUD - 40)}</g>`;
}
function small3(G) {
  if (!act3day(G) || G.flags.smallLab) return "";
  const y = 256, x = 100, s = kAtY(y) * AUD;
  return `<g data-hs="small"><g transform="translate(${x},${y}) scale(${s},${s}) translate(-160,-187)">${smallFigure()}</g>${hit(x - 22, y - 128 * s, 44, 128 * s + 4)}</g>`;
}
function brett(G) {
  if ((G.act && G.act !== 1) || G.mode !== "day" || G.flags.officeHours) return "";
  const y = 250, x = 300, s = kAtY(y) * AUD;
  return `<g data-hs="brett"><g transform="translate(${x},${y}) scale(${-s},${s}) translate(-160,-187)">${brettFigure()}</g>${hit(x - 24, y - 120 * s, 48, 120 * s + 4)}</g>`;
}

export default {
  id: "lab", name: "ADLINE LAB 114", pp,
  floor: { yMin: 206, yMax: 287, margin: 16 },
  entries: { fromHall: [112, 272, 1], start: [262, 272, 1] },
  draw(G) {
    cur = G;
    return { back: back(G), sortables: [
      { depth: 250, svg: brett(G) },
      { depth: 256, svg: small3(G) },
      { depth: P(0, FY, .72)[1], svg: gus3(G) },
      { depth: P(0, FY, .78)[1], svg: otherDesk(G) },
      { depth: P(0, FY, .82)[1], svg: desk(G) },
    ] };
  },
  stand: { monitor: [246, 284], drawer: [246, 284], whiteboard: [262, 212], adline: [380, 212], door: [106, 274], booth: [520, 252], brett: [262, 262], vent: [314, 210], gusdesk: [414, 268],
    gus: [372, 268], small: [150, 268] },
  labels: {
    day: { get monitor() { return cur && cur.act === 3 ? { use: "WORK" } : { use: "RERUN" }; },
      gus: { talk: "TALK", use: "TABLE 1" }, small: { talk: "TALK" }, drawer: { use: "OPEN" }, whiteboard: { use: "ERASE" }, adline: { use: "KNOCK" }, door: { use: "GO OUT" }, booth: { use: "SIT IN" }, brett: { use: "HIGH FIVE" },
      gusdesk: { use: "SNOOP" } },
    morris: { vent: { use: "CLIMB IN" }, drawer: { use: "HIDE IN" }, door: { go: "SCURRY OUT" }, gusdesk: { use: "RAID" }, monitor: { use: "WALK ON KEYS" } },
    night: { monitor: { use: "TAP KEY" }, drawer: { use: "OPEN" }, whiteboard: { use: "ERASE" }, adline: { use: "KNOCK" }, door: { use: "GO OUT" }, booth: { use: "SIT IN" } },
  },
};
