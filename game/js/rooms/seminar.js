// SEMINAR ROOM 101 — journal club by day, the forgotten robe by night.
import { seg, chip, perspective, shell, hit, onQuad, wallPatch } from "../gfx.js";
import { prestonBust, sitter, chairBack } from "../figures.js";

const pp = perspective(320, 130, 0.42);
const { P, poly, kAtY, FY } = pp;
// the patch of side wall behind a screen box x0..x1, y0..y1 (heights read at the box's middle depth)
const wallBox = (side, x0, x1, y0, y1) => { const k = (x) => Math.abs(x - pp.vpx) / Math.abs(side - pp.vpx), ka = k(x0), kb = k(x1), km = (ka + kb) / 2, Y = (y) => pp.vpy + (y - pp.vpy) / km;
  return wallPatch(pp, side, Math.min(ka, kb), Math.max(ka, kb), Y(y0), Y(y1)); };
const ROWS = [0.56, 0.70, 0.86];
const SEATS = [90, 170, 250, 390, 470, 550];

function layers(cls6, pialCls, wmCls, probe = true) {
  const curve = (o) => `M222,${130 + o} C232,${120 + o} 250,${118 + o} 262,${128 + o} C274,${138 + o} 278,${156 + o * .35} 290,${156 + o * .35} C302,${156 + o * .35} 306,${138 + o} 316,${130 + o} C320,${127 + o} 324,${126 + o} 328,${126 + o}`;
  let s = `<path class="${pialCls}" d="${curve(0)}"/>`;
  cls6.forEach((c, i) => { s += `<path class="${c}" d="${curve(3 + i * 3)}"/>`; });
  s += `<path class="${wmCls}" d="${curve(22)}"/>`;
  if (probe) s += `<path class="hl sW mech" d="M243,114 L243,148"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path class="hl sW mech" d="M241,${120 + i * 3} L245,${120 + i * 3}"/>`).join("")}`;
  return s;
}
function slide() {
  let s = seg("LAMINAR FMRI AT 7T", 222, 94, 7, "sW", 1.1) + chip("7T", 404, 93, 6, "fR");
  s += seg("VALU + IMPACT 2026", 222, 105, 4, "sM", .7);
  s += layers(["hl sR", "hl sA", "hl sG", "hl sB", "hl sV", "hl sK"], "sW", "hl dash sM");
  s += seg("CSF", 282, 122, 4, "sM", .7) + seg("WM", 226, 164, 4, "sM", .7) + seg("DEPTH", 246, 150, 3.6, "sW", .6);
  s += `<path class="sW mech" d="M340,170 L416,170 M340,170 L340,112"/>`;
  [[348, 22, "sM"], [368, 44, "sR"], [388, 14, "sM"]].forEach(([x, h, c]) => {
    s += `<path class="${c} mech" d="M${x},170 L${x},${170 - h} L${x + 12},${170 - h} L${x + 12},170"/><path class="hl sW mech" d="M${x + 6},${168 - h} L${x + 6},${172 - h}"/>`; });
  return s + seg("P<.0000001", 360, 114, 5, "sW", .9);
}

function back(G) {
  let s = shell(pp);
  s += `<rect class="k sM mech" x="306" y="20" width="28" height="10"/><path class="sM" d="M320,0 L320,20"/>
        <g class="day-only"><path class="hl dash sM" d="M320,30 L214,88 M320,30 L426,88 M320,30 L214,178 M320,30 L426,178"/><circle class="fW" cx="320" cy="30" r="1.6"/></g>`;
  s += `<g data-hs="screen"><rect class="k sW mech" x="214" y="88" width="212" height="90"/>
        <g class="day-only">${slide()}</g>
        <g class="night-only">${layers(Array(6).fill("hl sD"), "hl sD", "hl sD", false)}</g>${hit(214, 88, 212, 90)}</g>`;
  s += `<path class="sM mech" d="M214,182 L426,182"/>`;
  s += `<g data-hs="clock"><path class="k sM mech" d="M476,58 L520,50 L520,70 L476,76 Z"/>${onQuad(seg(G.clock, 5, 4.5, 9, "sG", 1.2), 44, 18, [476, 58], [520, 50], [476, 76])}${hit(474, 48, 48, 30)}</g>`;
  const d1 = P(0, 120, .62), d2 = P(0, 120, .8), d3 = P(0, FY, .8), d4 = P(0, FY, .62);
  s += `<g data-hs="door"><polygon class="k sW mech" points="${poly(d1, d2, d3, d4)}"/>
        <path class="hl sW" d="M${(d1[0] + d2[0]) / 2 - 2},${d1[1] + 4} L${(d4[0] + d3[0]) / 2 - 2},${(d3[1] + d4[1]) / 2 - 4}"/>
        <path class="sW" d="M74,190 L74,198"/>${hit(58, 118, 70, 146)}</g>`;
  s += `<g data-hs="exit">${chip("EXIT", 70, 100, 7, "fX", "exitChip")}${hit(68, 98, 30, 16)}</g>`;
  const tx = P(640, 0, .86)[0], ty0 = P(640, 0, .86)[1], ty1 = P(640, FY, .86)[1];
  const b1 = P(640, 120, .8), b2 = P(640, 120, .9), b3 = P(640, 190, .9), b4 = P(640, 190, .8);
  s += `<g data-hs="tube">
    <path class="sW mech" d="M${tx - 4},${ty0} L${tx - 4},${ty1} M${tx + 4},${ty0} L${tx + 4},${ty1}"/>
    ${[0.1, 0.3, 0.75, 0.9].map(f => { const y = ty0 + (ty1 - ty0) * f; return `<path class="sW mech" d="M${tx - 7},${y} L${tx + 7},${y} M${tx - 7},${y + 2} L${tx + 7},${y + 2}"/>`; }).join("")}
    <polygon class="k sW" points="${poly(b1, b2, b3, b4)}"/>
    ${wallBox(640, tx - 6, tx + 6, 132, 144).put(`<circle class="k sW" cx="6" cy="6" r="6"/><circle class="fW" cx="6" cy="6" r="1.2"/><path class="needle sR" data-cx="6" data-cy="6" d="M6,6 L10,2"/>`)}
    <polygon class="hl sM mech" points="${wallBox(640, tx - 9, tx + 9, 150, 172).pts}"/>${wallBox(640, tx + 4, tx + 8, 174, 178).put(`<circle class="fG" cx="2" cy="2" r="1.4"/>`)}
    ${hit(tx - 16, ty0, 32, ty1 - ty0)}</g>`;
  s += `<g class="canister" data-x="${tx}" style="display:none"><rect class="fA" x="${tx - 2.6}" y="-6" width="5.2" height="12" rx="2.6"/>${seg("B3", tx + 8, -4, 6, "sA", 1)}</g>`;
  // Morris in the ceiling (by day until he heads for the drawer; always at night)
  const m1 = P(448, 0, .6), m2 = P(512, 0, .6), m3 = P(512, 0, .72), m4 = P(448, 0, .72);
  const ratHere = G.mode === "night" || !G.flags.morrisMoved;
  s += `<g ${ratHere ? `data-hs="morris"` : ""}><polygon class="k sM" points="${poly(m4, m3, m2, m1)}"/>
    <polygon class="k hl sM" points="${poly(m4, m3, [m3[0] + 4, m3[1] - 8], [m4[0] + 4, m4[1] - 8])}"/>
    ${ratHere ? `<circle class="fA" cx="412" cy="45" r="1.7"/><circle class="fA" cx="419" cy="45" r="1.7"/>
      <g class="pz on" data-g="tail" data-i="0"><path class="sK" d="M424,52 C428,60 420,66 426,74 C430,80 426,84 428,88"/></g>
      <g class="pz" data-g="tail" data-i="1"><path class="sK" d="M424,52 C420,60 428,66 422,74 C418,80 422,84 420,88"/></g>${hit(400, 34, 34, 58)}` : ""}</g>`;
  return s;
}

function rowGroup(ri, G) {
  const k = ROWS[ri], y = P(0, FY, k)[1], X = (Xf) => P(Xf, FY, k)[0];
  let people = "", chairs = "", robe = "";
  SEATS.forEach(Xf => { if (ri === 2 && Xf === 550) return; chairs += chairBack(X(Xf), y, k); });
  if (ri === 0) people += sitter(X(390), y, k, { hs: "quorum", cls: "day-only", head: "sK",
    extra: (x, y, q) => `<path class="sW" d="M${x - 16 * q},${y - 80 * q} Q${x},${y - 70 * q} ${x + 16 * q},${y - 80 * q}"/><circle class="fA" cx="${x + 27 * q}" cy="${y - 44 * q}" r="1.8"/>` });
  if (ri === 1) [250, 170, 90].forEach(Xf => {
    people += `<g class="day-only" data-hs="faculty"><g class="pz on" data-g="nod" data-i="0">${sitter(X(Xf), y, k)}</g>
      <g class="pz" data-g="nod" data-i="1">${sitter(X(Xf), y + 4 * k, k)}</g>${hit(X(Xf) - 18 * k, y - 80 * k, 36 * k, 80 * k)}</g>`; });
  if (ri === 2) {
    people += sitter(X(170), y, k, { hs: "iris", cls: "day-only", head: "sW",
      extra: (x, y, q) => `<circle class="k sW" cx="${x}" cy="${y - 106 * q}" r="${8 * q}"/><path class="hl sW" d="M${x - 10 * q},${y - 96 * q} C${x - 4 * q},${y - 100 * q} ${x + 4 * q},${y - 100 * q} ${x + 10 * q},${y - 96 * q}"/><path class="sV" d="M${x - 24 * q},${y - 66 * q} Q${x},${y - 72 * q} ${x + 24 * q},${y - 66 * q}"/>` });
    {
      const rx = X(390);
      robe = `<g class="night-only" data-hs="robe">
        <path class="k sV" d="M${rx - 22 * k},${y - 24 * k} L${rx - 18 * k},${y - 66 * k} Q${rx},${y - 90 * k} ${rx + 18 * k},${y - 66 * k} L${rx + 22 * k},${y - 24 * k} Z"/>
        <path class="k sV" d="M${rx - 10 * k},${y - 66 * k} Q${rx},${y - 76 * k} ${rx + 10 * k},${y - 66 * k} Q${rx},${y - 58 * k} ${rx - 10 * k},${y - 66 * k} Z"/>
        <path class="hl sV" d="M${rx - 8 * k},${y - 54 * k} L${rx - 10 * k},${y - 26 * k} M${rx + 8 * k},${y - 54 * k} L${rx + 10 * k},${y - 26 * k}"/>
        <circle class="hl sX" cx="${rx}" cy="${y - 44 * k}" r="${4.5 * k}"/><circle class="fX" cx="${rx}" cy="${y - 44 * k}" r="${1.9 * k}"/>
        ${hit(rx - 24 * k, y - 92 * k, 48 * k, 92 * k)}</g>`;
    }
  }
  return `<g>${people}<g style="pointer-events:none">${chairs}</g>${robe}</g>`;
}
function tableGroup(G) {
  const k = 0.82, y = P(0, FY, k)[1], x = P(580, FY, k)[0], w = 70;
  const slices = G.mode === "day" && !G.flags.pizzaGone;
  return `<g>
    <path class="hl sM" d="M${x - w / 2 + 4},${y - 24} L${x - w / 2 + 2},${y} M${x + w / 2 - 4},${y - 24} L${x + w / 2 - 2},${y}"/>
    <polygon class="k sM" points="${x - w / 2},${y - 24} ${x + w / 2},${y - 24} ${x + w / 2 - 6},${y - 34} ${x - w / 2 + 6},${y - 34}"/>
    <g data-hs="pizza">
      <polygon class="k sA" points="${x - 30},${y - 27} ${x + 6},${y - 27} ${x + 3},${y - 33} ${x - 27},${y - 33}"/>
      <polygon class="k sA" points="${x - 27},${y - 33} ${x + 3},${y - 33} ${x + 6},${y - 58} ${x - 30},${y - 58}"/>
      ${seg("PIZZA", x - 23, y - 51, 6, "sA", 1)}
      ${slices ? `<ellipse class="sR" cx="${x - 12}" cy="${y - 30}" rx="13" ry="2.4"/><path class="hl sR" d="M${x - 20},${y - 30} L${x - 4},${y - 30} M${x - 12},${y - 32} L${x - 12},${y - 28}"/>` : ""}
      ${hit(x - 32, y - 60, 40, 36)}</g>
    <g data-hs="coffee" class="day-only">
      <path class="k sK" d="M${x + 16},${y - 26} L${x + 14},${y - 38} L${x + 26},${y - 38} L${x + 24},${y - 26} Z"/>${hit(x + 12, y - 40, 16, 16)}</g>
  </g>`;
}
function lecternGroup() {
  const s = 0.5, sp = 0.40, ax = 192, ay = 208, top = ay - (190 - 124) * s;
  return `<g>
    <g class="day-only pt" id="preston" data-hs="preston"><g transform="translate(${ax - 160 * sp},${top + 6 - 130 * sp}) scale(${sp})">${prestonBust()}</g>
      ${hit(ax - 20, top - 50, 46, 50)}</g>
    <g data-hs="lectern" transform="translate(${ax - 160 * s},${ay - 190 * s}) scale(${s})">
      <path class="k sB mech" d="M114,124 L206,124 L202,131 L118,131 Z"/><path class="k sB mech" d="M118,131 L202,131 L196,190 L124,190 Z"/>
      <path class="sN mech" d="M132,140 L188,140 L184,180 L136,180 Z"/><path class="hl sN mech" d="M140,150 L180,150 M139,160 L181,160 M138,170 L182,170"/>
      <path class="sM" d="M194,124 C197,112 192,104 186,102"/><circle class="fG" cx="185" cy="101" r="2.2"/>${hit(114, 100, 92, 90)}</g>
  </g>`;
}

export default {
  id: "seminar", name: "SEMINAR RM 101", pp,
  floor: { yMin: 206, yMax: 287, margin: 16 },
  entries: { start: [320, 280, 1], fromHall: [118, 272, 1] },
  draw(G) {
    return { back: back(G), sortables: [
      { depth: 208, svg: lecternGroup() },
      { depth: P(0, FY, ROWS[0])[1], svg: rowGroup(0, G) },
      { depth: P(0, FY, ROWS[1])[1], svg: rowGroup(1, G) },
      { depth: P(0, FY, 0.82)[1] - 1, svg: tableGroup(G) },
      { depth: P(0, FY, ROWS[2])[1], svg: rowGroup(2, G) },
    ] };
  },
  stand: { preston: [256, 214], lectern: [256, 214], screen: [320, 212], iris: [214, 286], quorum: [362, 228],
    faculty: [300, 252], pizza: [500, 286], coffee: [520, 286], tube: [580, 286], morris: [420, 214], door: [104, 274], robe: [400, 286] },
  labels: {
    day: { pizza: { use: "TAKE SLICE" }, door: { use: "GO OUT" }, tube: { use: "OPEN HATCH" }, screen: { use: "TOUCH" }, lectern: { use: "TAP MIC" },
      coffee: { use: "SIP" }, quorum: { use: "TAP SHOULDER" }, iris: { use: "TAP SHOULDER" }, preston: { use: "SHAKE HAND" }, faculty: { use: "WAVE" }, exit: { use: "TAP" }, morris: { use: "REACH" } },
    night: { pizza: { use: "FOLD BOX" }, door: { use: "GO OUT" }, tube: { use: "LISTEN" }, screen: { use: "WIPE" }, lectern: { use: "TAKE CARD" },
      robe: { use: "PHOTOGRAPH" }, exit: { use: "TAP" }, morris: { use: "REACH" } },
  },
};
