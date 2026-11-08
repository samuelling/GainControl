// MRI CONTROL, B1 — the window onto the 3T, Tess's console and calendar, the metal locker, Cody waiting with the clipboard.
// Morning (Act II): police tape across the window, Nell's thermos stuck to the face of the magnet, Det. Small and Gus.
import { seg, segC, segW, chip, chipW, perspective, shell, sideDoor, hit, arcs, wallPatch } from "../gfx.js";
import { tessAtConsole, tessFar, codySeated, smallFigure, gusFigure, standOnly, AUD } from "../figures.js";
import { gusInBore, smallHatInHand } from "../cast/act4b.js";

const pp = perspective(320, 130, 0.45);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];
// the patch of side wall behind a screen box x0..x1, y0..y1 (heights read at the box's middle depth), and a level line on it
const wallBox = (side, x0, x1, y0, y1) => { const k = (x) => Math.abs(x - pp.vpx) / Math.abs(side - pp.vpx), ka = k(x0), kb = k(x1), km = (ka + kb) / 2, Y = (y) => pp.vpy + (y - pp.vpy) / km;
  return wallPatch(pp, side, Math.min(ka, kb), Math.max(ka, kb), Y(y0), Y(y1)); };
const wallLine = (side, x0, x1, y, cls) => { const b = wallBox(side, x0, x1, y, y); return `<path class="${cls}" d="M${pp.pt(b.tl)} L${pp.pt(b.tr)}"/>`; };
// Friday morning (Act IV): no thermos, no tape. Gus is in the bore, and Det. Small has his hat in his hand
const friday = (G) => G.act >= 4 && G.mode === "morning";   // Friday morning (Act V opens on it)
let cur = null;   // the last state drawn (stand points that differ by act read it)

function back(G) {
  const morning = G.mode === "morning", alarm = !!G.flags.heliumAlarm && !morning;
  let s = shell(pp);
  // the magnet-room door (back wall, left): red-signed, Tess only
  s += `<g data-hs="magnetdoor"><rect class="k sW mech" x="182" y="108" width="40" height="94"/>
        ${chip("ZONE IV", 186, 116, 4.2, "fR")}<rect class="hl sR mech" x="188" y="132" width="28" height="22"/>
        <path class="hl sR" d="M193,149 C196,138 208,138 211,149 M197,149 C199,142 205,142 207,149"/><path class="sW" d="M214,160 L214,168"/>
        ${hit(180, 106, 44, 98)}</g>`;
  // the window into the magnet room: the Big Donut, the bed, glare
  s += `<g data-hs="window">
        <rect class="k sW mech" x="232" y="86" width="188" height="92"/><rect class="hl sW mech" x="236" y="90" width="180" height="84"/>
        <path class="hl sD" d="M236,160 L416,160 M262,174 L278,160 M326,174 L326,160 M390,174 L374,160"/>
        <rect class="k sW" x="282" y="94" width="88" height="70" rx="14"/>
        <circle class="k sW" cx="326" cy="128" r="30"/><circle class="k sM" cx="326" cy="128" r="16"/><path class="hl sM" d="M318,124 L334,124"/>
        <path class="k sW" d="M308,138 L344,138 L358,166 L294,166 Z"/><path class="hl sW" d="M300,152 L352,152"/>
        <path class="hl sM" d="M246,96 L262,90 M246,104 L274,92 M398,170 L412,164"/>
        ${hit(230, 84, 192, 96)}</g>`;
  // Tess through the window, fussing at the magnet (helium alarm)
  if (alarm) s += `<g data-hs="tessfar">${tessFar(262, 168, .4)}${hit(244, 112, 36, 58)}</g>`;
  // morning: the thermos on the face of the magnet, police tape over the glass
  if (friday(G)) s += `<g data-hs="gus">${gusInBore(326, 128)}<path class="hl sM" d="M246,96 L262,90 M246,104 L274,92 M398,170 L412,164"/>${hit(304, 108, 44, 60)}</g>`;
  else if (morning) s += `<g pointer-events="none"><g transform="rotate(-58 300 128)">
        <path class="k sA" d="M294,118 L306,118 L307,138 C307,141 293,141 293,138 Z"/>${seg("NELL", 295.5, 124, 4, "sA", .7)}</g>${arcs(284, 128, -1, "sA", 3, .6)}
        <g transform="rotate(-6 326 112)"><rect class="k sA" x="226" y="106" width="200" height="11"/>${seg("POLICE LINE  DO NOT CROSS", 236, 108.5, 6, "sA", .9)}</g>
        <g transform="rotate(7 326 146)"><rect class="k sA" x="226" y="140" width="200" height="11"/>${seg("DO NOT CROSS  POLICE LINE", 236, 142.5, 6, "sA", .9)}</g></g>`;
  // signs above the window: the rule, and the alarm (pose group "alarm")
  s += `<g data-hs="sign">${chip("THE MAGNET IS ALWAYS ON", 234, 74, 4.6, "fR")}${hit(232, 72, 104, 12)}</g>`;
  if (alarm) s += `<g pointer-events="none"><g class="pz on" data-g="alarm" data-i="0">${chip("HELIUM LOW", 352, 73, 5, "fR")}${arcs(404, 77, 1, "sR", 3, .7)}${arcs(348, 77, -1, "sR", 3, .7)}</g>
        <g class="pz" data-g="alarm" data-i="1"><rect class="hl sR" x="352" y="73" width="${chipW("HELIUM LOW", 5).toFixed(1)}" height="8.5"/>${seg("HELIUM LOW", 354.2, 74.7, 5, "sR", 1)}</g></g>`;
  // the scanner booking calendar, back wall right
  s += `<g data-hs="calendar"><rect class="k sB mech" x="428" y="94" width="32" height="44"/>${chip("3T", 430, 86, 4.2, "fB")}
        ${[0, 1, 2, 3, 4].map(i => `<path class="hl sB" d="M430,${104 + i * 7} L458,${104 + i * 7}"/>`).join("")}
        ${[0, 1, 2, 3].map(i => `<path class="hl sB" d="M${435 + i * 6},102 L${435 + i * 6},136"/>`).join("")}
        <path class="sB" d="M431,106 L434,110 M443,113 L446,117 M449,120 L452,124 M437,127 L440,131"/>${hit(426, 84, 36, 56)}</g>`;
  // left wall: the stairs door; the vent grille low on the wall
  const d = sideDoor(pp, 0, .56, .7, 104);
  s += `<g data-hs="door">${d.svg}${chip("STAIRS", d.a[0] - 2, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  const v = [P(0, 246, .84), P(0, 246, .9), P(0, 268, .9), P(0, 268, .84)];
  s += `<g data-hs="vent"><polygon class="k sW mech" points="${poly(...v)}"/>
        ${[0, 1, 2, 3].map(i => { const t = (i + 1) / 5; const a = [v[0][0] + (v[1][0] - v[0][0]) * t, v[0][1] + (v[1][1] - v[0][1]) * t], b = [v[3][0] + (v[2][0] - v[3][0]) * t, v[3][1] + (v[2][1] - v[3][1]) * t];
          return `<path class="hl sW" d="M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}"/>`; }).join("")}
        ${hit(Math.min(v[0][0], v[1][0]) - 6, v[0][1] - 6, Math.abs(v[1][0] - v[0][0]) + 12, v[2][1] - v[0][1] + 12)}</g>`;
  // right wall: the metal locker (ZONE III) — Nell's thermos inside once it's locked away
  const L = sideDoor(pp, 640, .6, .68, 132, "sW"), L2 = sideDoor(pp, 640, .68, .76, 132, "sD");
  const lc = [(L.a[0] + L.b[0]) / 2, (L.a[1] + L.c[1]) / 2];
  s += L2.svg.replace(/class="sD"/, 'class="hl sD"') + [0, 1, 2].map(i => { const t = (L2.a[1] + L2.c[1]) / 2 - 24 + i * 5; return wallLine(640, L2.a[0] + 6, L2.b[0] - 8, t, "hl sD"); }).join("");
  s += `<g data-hs="locker">${L.svg}
        ${[0, 1, 2, 3].map(i => wallLine(640, lc[0] - 6, lc[0] + 7, lc[1] - 26.75 + i * 5, "hl sW")).join("")}
        ${G.flags.thermosLocked && !morning ? `<polygon class="sA" points="${wallBox(640, lc[0] - 4, lc[0] + 4.5, lc[1] - 6.5, lc[1] + 8.5).pts}"/>${wallBox(640, lc[0] - 8, lc[0] - 8 + segW("NELL", 3.6), lc[1] + 12, lc[1] + 15.6).put(seg("NELL", 0, 0, 3.6, "sA", .7))}` : ""}
        ${wallBox(640, L.a[0] - 2, L.a[0] - 2 + chipW("ZONE III", 4.4), L.a[1] - 20, L.a[1] - 12.5).put(chip("ZONE III", 0, 0, 4.4, "fA"))}${wallBox(640, L.a[0] - 16, L.a[0] - 16 + segW("METAL IN LOCKER", 3.6), L.a[1] - 8, L.a[1] - 4.4).put(seg("METAL IN LOCKER", 0, 0, 3.6, "sA", .7))}
        ${hit(...L.box)}</g>`;
  return s;
}

// the console (center), Tess at its right end, swivelled to face the room; the wire bundle under it
function consoleRow(G) {
  const k = .64, y = floorY(k), yt = y - 24, x0 = P(170, 0, k)[0], x1 = P(470, 0, k)[0];
  const tess = !G.flags.heliumAlarm && G.mode !== "morning";
  const brain = (x, yy) => `<path class="hl sB" d="M${x + 8},${yy + 20} C${x + 6},${yy + 8} ${x + 14},${yy + 4} ${x + 22},${yy + 4} C${x + 32},${yy + 4} ${x + 38},${yy + 10} ${x + 37},${yy + 18} C${x + 36},${yy + 23} ${x + 30},${yy + 26} ${x + 24},${yy + 24} L${x + 22},${yy + 28} L${x + 18},${yy + 24} C${x + 13},${yy + 25} ${x + 9},${yy + 23} ${x + 8},${yy + 20} Z"/>`;
  let s = "";
  if (tess) s += `<g data-hs="tess">${tessAtConsole(424, floorY(.6), .6)}${hit(404, 160, 40, 46)}</g>`;
  s += `<g data-hs="console">
    <polygon class="k sW" points="${x0},${yt} ${x1},${yt} ${x1 - 10},${yt - 8} ${x0 + 10},${yt - 8}"/>
    <rect class="k sW mech" x="${x0}" y="${yt}" width="${x1 - x0}" height="${y - yt}"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<path class="hl sM" d="M${x0 + 14 + i * 12},${yt + 8} L${x0 + 20 + i * 12},${yt + 8}"/>`).join("")}
    <circle class="fG" cx="${x1 - 18}" cy="${yt + 9}" r="1.4"/>${G.flags.heliumAlarm && G.mode !== "morning" ? `<circle class="fR" cx="${x1 - 26}" cy="${yt + 9}" r="1.4"/>` : `<circle class="hl sR" cx="${x1 - 26}" cy="${yt + 9}" r="1.4"/>`}
    ${[0, 1, 2].map(i => { const mx = x0 + 18 + i * 52, my = yt - 46;
      return `<path class="hl sW" d="M${mx + 20},${yt - 8} L${mx + 20},${yt - 14}"/><rect class="k sW mech" x="${mx}" y="${my}" width="42" height="32"/>
        ${i === 0 ? brain(mx, my) : i === 1 ? `<ellipse class="hl sB" cx="${mx + 21}" cy="${my + 16}" rx="12" ry="10"/><path class="hl sB" d="M${mx + 21},${my + 6} L${mx + 21},${my + 26}"/>`
          : `<polyline class="hl sG" points="${mx + 4},${my + 22} ${mx + 10},${my + 22} ${mx + 13},${my + 10} ${mx + 17},${my + 26} ${mx + 21},${my + 16} ${mx + 38},${my + 16}"/>`}`; }).join("")}
    ${hit(x0, yt - 48, x1 - x0, y - yt + 50)}</g>`;
  // the wire bundle that runs from under the console into the floor (Morris's job)
  s += `<g data-hs="wires"><path class="hl sR" d="M${x1 - 4},${y - 2} C${x1 + 10},${y + 2} ${x1 + 6},${y + 10} ${x1 + 22},${y + 9}"/>
    <path class="hl sA" d="M${x1 - 4},${y - 5} C${x1 + 14},${y - 1} ${x1 + 10},${y + 7} ${x1 + 26},${y + 5}"/>
    <path class="hl sB" d="M${x1 - 4},${y - 8} C${x1 + 18},${y - 4} ${x1 + 14},${y + 4} ${x1 + 30},${y + 1}"/>
    <rect class="k sM mech" x="${x1 + 20}" y="${y - 1}" width="14" height="11"/>${hit(x1 - 8, y - 14, 46, 28)}</g>`;
  return s;
}

function cody(G) {
  if (G.mode === "morning") return "";
  const x = 92, y = 268, k = kAtY(y);
  return `<g data-hs="cody">${codySeated(x, y, k, !G.flags.gotClipboard)}${hit(x - 28, y - 110 * k * AUD, 56, 110 * k * AUD + 4)}</g>
    <path class="hl sD" d="${(() => { const q = k * AUD, cx = x + 64; return `M${cx - 40 * q},${y - 37 * q} L${cx + 40 * q},${y - 37 * q} M${cx - 36 * q},${y - 37 * q} L${cx - 38 * q},${y} M${cx + 36 * q},${y - 37 * q} L${cx + 38 * q},${y} M${cx - 42 * q},${y - 37 * q} L${cx - 42 * q},${y - 91 * q} L${cx + 42 * q},${y - 91 * q} L${cx + 42 * q},${y - 37 * q}`; })()}"/>`;
}

function standing(id, fig, x, y, dir) {
  const s = kAtY(y) * AUD;
  return `<g data-hs="${id}"><g transform="translate(${x},${y}) scale(${dir * s},${s}) translate(-160,-187)">${fig}</g>${hit(x - 22, y - 128 * s, 44, 128 * s + 4)}</g>`;
}

export default {
  id: "mri", name: "MRI CONTROL B1", pp,
  floor: { yMin: 238, yMax: 287, margin: 16 },
  entries: { fromStairs: [132, 242, 1], morning: [318, 272, 1] },
  draw(G) {
    const morning = G.mode === "morning", a4 = friday(G);
    cur = G;
    return { back: back(G), sortables: [
      { depth: floorY(.64), svg: consoleRow(G) },
      { depth: 268, svg: cody(G) },
      { depth: 264, svg: a4 ? `<g data-hs="small">${smallHatInHand(252, 264, kAtY(264))}${hit(230, 264 - 128 * kAtY(264) * AUD, 44, 128 * kAtY(264) * AUD + 4)}</g>`
        : morning ? standing("small", smallFigure(), 252, 264, 1) : "" },
      { depth: 262, svg: morning && !a4 ? standing("gus", standOnly(gusFigure()), 404, 262, -1) : "" },
    ] };
  },
  stand: { window: [318, 242], tess: [394, 244], tessfar: [300, 242], calendar: [432, 244], locker: [508, 246], sign: [290, 242],
    console: [320, 244], wires: [460, 238], vent: [64, 274], cody: [146, 272], door: [132, 242], magnetdoor: [204, 240],
    small: [296, 268], get gus() { return cur && friday(cur) ? [326, 242] : [366, 266]; } },
  labels: {
    day: { locker: { use: "PUT METAL IN" }, calendar: { use: "READ" }, door: { use: "GO UP", go: "GO UP" }, magnetdoor: { use: "OPEN" },
      window: { use: "KNOCK" }, console: { use: "PRESS" }, sign: { use: "READ" } },
    morris: { wires: { use: "CHEW" }, vent: { use: "CLIMB IN" }, door: { go: "SCURRY UP" }, console: { use: "CLIMB" }, locker: { use: "SQUEEZE IN" } },
    morning: { door: { use: "GO UP", go: "GO UP" }, window: { use: "LOOK CLOSER" }, locker: { use: "OPEN" } },
    night: { door: { use: "GO UP", go: "GO UP" } },
  },
};
