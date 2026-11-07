/* ================================================================ *
 *  HOLIDAYS: the department decorates, badly, for whatever's on the real calendar.
 *  holidaysOn(date) → the holidays in season (first = the one that owns the walls). decor(room, G) → an SVG layer
 *  drawn over the room's back (no hit areas, nothing to click): a pennant banner with crooked letters, a garland
 *  sagging between thumbtacks, paper cutouts taped to the walls, things hung from the ceiling tiles on thread, and a
 *  prop or two on a desk (the pipette-tip-box tree, the nitrile-glove turkey, a menorah with tonight's candles lit).
 *  Off in the options menu, and never below ground: the Round Table doesn't do holidays.
 *  Testing: ?date=2026-12-20 or ?holiday=winter on the URL; the TIMEWARP code steps through them.
 * ================================================================ */
import { seg, segW, star4, arcs } from "./gfx.js";
import { opt } from "./options.js";

/* ---------------- the calendar ---------------- */
const D = (y, m, d) => new Date(y, m - 1, d);
const day = 864e5;
const nthDow = (y, m, dow, n) => { const f = D(y, m, 1), off = (dow - f.getDay() + 7) % 7; return D(y, m, 1 + off + 7 * (n - 1)); };
// moving feasts, looked up (first evening of Hanukkah; Diwali; Lunar New Year)
const HANUKKAH = { 2025: [12, 14], 2026: [12, 4], 2027: [12, 24], 2028: [12, 12], 2029: [12, 1], 2030: [12, 20], 2031: [12, 9], 2032: [11, 27] };
const DIWALI = { 2025: [10, 20], 2026: [11, 8], 2027: [10, 29], 2028: [10, 17], 2029: [11, 5], 2030: [10, 26], 2031: [11, 14], 2032: [11, 2] };
const LUNAR = { 2025: [1, 29, "SNAKE"], 2026: [2, 17, "HORSE"], 2027: [2, 6, "GOAT"], 2028: [1, 26, "MONKEY"], 2029: [2, 13, "ROOSTER"], 2030: [2, 3, "DOG"], 2031: [1, 23, "PIG"], 2032: [2, 11, "RAT"] };
const within = (t, a, b) => t >= a.getTime() && t < b.getTime() + day;

export const HOLIDAYS = {
  newyear: { name: "NEW YEAR" }, valentine: { name: "VALENTINE'S" }, lunar: { name: "LUNAR NEW YEAR" }, pi: { name: "PI DAY" },
  stpat: { name: "ST PATRICK'S" }, brainweek: { name: "BRAIN AWARENESS WEEK" }, fools: { name: "APRIL FOOLS" }, grads: { name: "COMMENCEMENT" },
  july4: { name: "FOURTH OF JULY" }, halloween: { name: "HALLOWEEN" }, thanksgiving: { name: "THANKSGIVING" }, winter: { name: "THE HOLIDAYS" },
  hanukkah: { name: "HANUKKAH" }, diwali: { name: "DIWALI" },
};
export const ORDER = Object.keys(HOLIDAYS);   // also the priority: the first in season owns the walls

// Each holiday goes up two days before and comes down after its day (a multi-day one, after its last day).
// The exception is the lab's Christmas lights: up all December (lights: true), whatever else is on.
export function holidaysOn(date = new Date()) {
  const y = date.getFullYear(), t = D(y, date.getMonth() + 1, date.getDate()).getTime(), on = [], info = {};
  const add = (id, d0, extra, last = d0) => { if (within(t, new Date(+d0 - 2 * day), last)) { on.push(id); if (extra) info[id] = extra; } };
  add("newyear", D(y, 1, 1), { year: y }); add("newyear", D(y + 1, 1, 1), { year: y + 1 });
  add("valentine", D(y, 2, 14));
  const ln = LUNAR[y]; if (ln) add("lunar", D(y, ln[0], ln[1]), { animal: ln[2] });
  add("pi", D(y, 3, 14)); add("stpat", D(y, 3, 17));
  const baw = nthDow(y, 3, 1, 2); add("brainweek", baw, null, new Date(+baw + 4 * day));   // the week of outreach, Mon–Fri
  add("fools", D(y, 4, 1)); add("grads", nthDow(y, 5, 0, 3)); add("july4", D(y, 7, 4));
  add("halloween", D(y, 10, 31)); add("thanksgiving", nthDow(y, 11, 4, 4)); add("winter", D(y, 12, 25));
  for (const yy of [y, y - 1]) { const h = HANUKKAH[yy]; if (!h) continue; const d0 = D(yy, h[0], h[1]);
    if (within(t, new Date(+d0 - 2 * day), new Date(+d0 + 7 * day))) { on.push("hanukkah"); info.hanukkah = { night: Math.max(0, Math.round((t - d0) / day) + 1) }; } }
  const dw = DIWALI[y]; if (dw) add("diwali", D(y, dw[0], dw[1]));
  return { on: [...new Set(on)].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)), info, date, lights: date.getMonth() === 11 };
}

// what's showing now: the URL (?holiday= / ?date=), a forced holiday from the TIMEWARP code, or today
function urlParam(k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
export function current() {
  const f = urlParam("holiday") || opt("forceHoliday");
  if (f && HOLIDAYS[f]) { const r = { on: [f], info: { hanukkah: { night: 5 }, newyear: { year: new Date().getFullYear() + 1 }, lunar: { animal: "HORSE" } } };
    if (f === "winter") r.on.push("hanukkah"); if (f === "thanksgiving") r.on.push("diwali"); r.lights = f === "winter"; return r; }
  const d = urlParam("date"); return holidaysOn(d ? new Date(d + "T12:00") : new Date());
}
// the next one round the year, for TIMEWARP (returns its id)
export function nextHoliday(fromId) { const i = ORDER.indexOf(fromId); return ORDER[(i + 1) % ORDER.length]; }

/* ---------------- the kit: paper, tape, tinsel ---------------- */
const f1 = (n) => +n.toFixed(1);
const T = (x, y, s, inner, r = 0) => `<g transform="translate(${f1(x)},${f1(y)})${r ? ` rotate(${r})` : ""} scale(${+s.toFixed(3)})">${inner}</g>`;
const tape = (x, y, r = 0) => `<path class="hl sM" d="M${x - 2.5},${y - 1} L${x + 2.5},${y + 1}" transform="rotate(${r} ${x} ${y})"/>`;

// small things, drawn about 20 units tall around their own origin (centre, or the bottom for things that stand)
const ART = {
  bat: (c = "sV") => `<path class="k ${c}" d="M-11,0 Q-7,-6 -3,-1.5 Q0,-5 3,-1.5 Q7,-6 11,0 Q7,-1.5 5,3 Q3,1 1.5,4 L0,2.5 L-1.5,4 Q-3,1 -5,3 Q-7,-1.5 -11,0 Z"/><path class="hl ${c}" d="M-1.5,-4.5 L-1,-2.5 M1.5,-4.5 L1,-2.5"/>`,
  ghost: () => `<path class="k sW" d="M-7,8 L-7,-3 C-7,-11 7,-11 7,-3 L7,8 L4.5,5.5 L2,8 L0,5.5 L-2,8 L-4.5,5.5 Z"/><circle class="hl sW" cx="-2.5" cy="-2" r="1.3"/><circle class="hl sW" cx="2.5" cy="-2" r="1.3"/><path class="hl sW" d="M-1.5,2 C-0.5,3 0.5,3 1.5,2"/>`,
  // a jack-o'-lantern carved as a brain: gyri for a face, a candle inside (lit)
  pumpkin: () => `<path class="k sA" d="M0,-14 C-10,-15 -14,-9 -14,-6 C-14,-1 -9,0 0,0 C9,0 14,-1 14,-6 C14,-9 10,-15 0,-14 Z"/>
    <path class="hl sA" d="M-6,-14 C-9,-10 -9,-3 -6,0 M6,-14 C9,-10 9,-3 6,0"/><path class="sG" d="M0,-14 L1,-18 L3,-18"/>
    <path class="fA" d="M-6,-8 C-6,-11 -2,-11 -1,-9 C0,-11 4,-11 4,-8 C5,-6 2,-5 0,-6 C-2,-4 -6,-5 -6,-8 Z"/><path class="s0 hl" d="M-4,-8 C-3,-9 -2,-7 -1,-8 M1,-8 C2,-9 3,-7 3,-8"/>`,
  cobweb: (dir = 1) => { let s = ""; for (let i = 0; i <= 4; i++) { const a = i / 4 * Math.PI / 2; s += `M0,0 L${f1(dir * Math.cos(a) * 26)},${f1(Math.sin(a) * 26)} `; }
    for (const r of [8, 15, 22]) { s += "M" + [0, 1, 2, 3, 4].map(i => { const a = i / 4 * Math.PI / 2, rr = r - (i % 2) * 2; return `${f1(dir * Math.cos(a) * rr)},${f1(Math.sin(a) * rr)}`; }).join(" L"); s += " "; }
    return `<path class="hl sM" d="${s}"/><path class="hl sW" d="M${dir * 14},10 L${dir * 14},20"/><circle class="k sW" cx="${dir * 14}" cy="21.5" r="1.6"/>`; },
  // a hand traced round on construction paper: four finger feathers in four colours, the thumb is the head
  handturkey: () => `<path class="sR" d="M-5,0 C-9,-6 -11,-13 -9,-16 C-7,-18 -5,-14 -3,-6"/><path class="sA" d="M-2,-4 C-3,-12 -3,-19 0,-20 C3,-19 2,-12 1.5,-4"/>
    <path class="sG" d="M3,-4 C5,-12 7,-18 9,-17 C11,-15 8,-9 5,-2"/><path class="sB" d="M6,0 C10,-5 14,-9 15,-7 C16,-4 12,0 8,3"/>
    <path class="k sA" d="M-7,1 C-9,6 -3,11 3,10 C9,9 10,4 7,0 C4,-3 -4,-3 -7,1 Z"/><path class="k sA" d="M-7,2 C-12,1 -15,-2 -14,-5 C-12,-7 -9,-4 -6,-1"/>
    <circle class="fW" cx="-12" cy="-3.5" r=".8"/><path class="sR" d="M-15,-3 L-17,-2 L-15,-1.5 M-13,-1.5 C-13,1 -12,2 -11.5,1"/><path class="hl sA" d="M-2,10 L-3,14 M3,10 L4,14"/>`,
  // the nitrile glove, inflated and knotted, fingers up for feathers, a face on the thumb in Sharpie
  gloveturkey: () => `<path class="k sV" d="M-8,0 C-12,-4 -11,-10 -8,-12 L-9,-22 C-9,-25 -5,-25 -5,-22 L-4,-15 L-3,-26 C-3,-29 1,-29 1,-26 L1,-15 L3,-25 C3,-28 7,-28 7,-25 L6,-14 L8,-21 C8,-24 12,-24 11,-21 L9,-9 C9,-4 6,0 2,0 Z"/>
    <path class="k sV" d="M-8,-8 C-13,-9 -16,-13 -15,-16 C-13,-18 -10,-16 -8,-12"/><circle class="fW" cx="-12.5" cy="-14" r=".8"/><path class="sR" d="M-15.5,-14 L-17.5,-13 L-15.5,-12.5 M-14,-11.5 C-14,-9 -13,-8.5 -12.5,-9"/>
    <path class="hl sV" d="M-4,0 L-3,3 L-5,6 M-1,0 L-2,3 L0,6"/>`,
  leaf: (c = "sA") => `<path class="k ${c}" d="M0,9 C-6,4 -8,-3 -6,-7 L-3,-5 L0,-11 L3,-5 L6,-7 C8,-3 6,4 0,9 Z"/><path class="hl ${c}" d="M0,9 L0,-6 M0,1 L-4,-2 M0,3 L4,0"/>`,
  snowflake: () => { let s = ""; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, c = Math.cos(a), sn = Math.sin(a), q = (r, d) => `${f1(c * r - sn * d)},${f1(sn * r + c * d)}`;
    s += `M0,0 L${q(10, 0)} M${q(5, 0)} L${q(7.5, 3)} M${q(5, 0)} L${q(7.5, -3)} `; } return `<path class="hl sW" d="${s}"/>`; },
  star: (c = "sA", lit = false) => { const p = [...Array(10)].map((_, i) => { const r = i % 2 ? 4 : 10, a = -Math.PI / 2 + i * Math.PI / 5; return `${f1(Math.cos(a) * r)},${f1(Math.sin(a) * r)}`; }).join(" ");
    return `<polygon class="${lit ? c.replace("s", "f") : "k " + c}" points="${p}"/>`; },
  heart: (c = "sR") => `<path class="k ${c}" d="M0,8 C-4,4 -10,0 -10,-4 C-10,-9 -3,-10 0,-5 C3,-10 10,-9 10,-4 C10,0 4,4 0,8 Z"/>`,
  shamrock: () => `<g class="sG">${[0, 120, 240].map(r => `<path class="k sG" transform="rotate(${r})" d="M0,0 C-6,-3 -7,-9 -3.5,-10 C-1.5,-10.5 0,-8.5 0,-7 C0,-8.5 1.5,-10.5 3.5,-10 C7,-9 6,-3 0,0 Z"/>`).join("")}<path class="sG" d="M0,0 C1,5 3,8 6,10"/></g>`,
  diya: () => `<path class="k sA" d="M-8,0 C-8,-4 8,-4 8,0 C6,3 -6,3 -8,0 Z M8,-1 L11,-3"/><path class="hl sA" d="M-5,0 L5,0"/><path class="fA" d="M11,-3.5 C9,-6 10,-9 11.5,-11 C12.5,-9 13.5,-6 11,-3.5 Z"/>`,
  lantern: (c = "sR") => `<path class="sA" d="M0,-13 L0,-10"/><path class="k ${c}" d="M-4,-10 L4,-10 C10,-7 10,5 4,8 L-4,8 C-10,5 -10,-7 -4,-10 Z"/><path class="hl ${c}" d="M0,-10 L0,8 M-4,-10 C-7,-5 -7,3 -4,8 M4,-10 C7,-5 7,3 4,8"/><path class="sA" d="M-4,-10 L4,-10 M-4,8 L4,8 M0,8 L0,12 M-1.5,12 L-1.5,16 M0,12 L0,17 M1.5,12 L1.5,16"/>`,
  kandil: () => `${ART.star("sA")}<circle class="fA" cx="0" cy="0" r="1.8"/><path class="hl sR" d="M-2,10 L-2,17 M0,4 L0,18 M2,10 L2,17"/>`,
  dreidel: () => `<path class="k sB" d="M-5,-8 L5,-8 L5,2 L0,8 L-5,2 Z"/><path class="sB" d="M0,-8 L0,-12"/>${seg("N", -2, -5, 5, "sW", .7)}`,
  // a paper menorah taped up: nine branches, the shamash in the middle taller; tonight's candles lit (on)
  menorah: (night = 5) => { let s = `<path class="sA" d="M0,0 L0,-12 M-5,0 L5,0"/>`;
    for (let i = 1; i <= 4; i++) s += `<path class="sA" d="M${-i * 3},-12 C${-i * 3},${-12 + i * 2.2} 0,${-6 + i * .6} 0,${-4 + i * .2} M${i * 3},-12 C${i * 3},${-12 + i * 2.2} 0,${-6 + i * .6} 0,${-4 + i * .2}"/>`;
    s += `<path class="sA" d="M-12,-12 L12,-12"/>`;
    const xs = [-12, -9, -6, -3, 3, 6, 9, 12];
    xs.forEach((x, i) => { s += `<path class="hl sW" d="M${x},-12 L${x},-16"/>`; if (8 - i <= night) s += `<path class="fA" d="M${x},-16.5 C${x - 1.3},-17.8 ${x - .5},-19.5 ${x},-20.5 C${x + .5},-19.5 ${x + 1.3},-17.8 ${x},-16.5 Z"/>`; });
    return s + `<path class="sA" d="M0,-12 L0,-17"/><path class="hl sW" d="M0,-17 L0,-21"/>${night < 1 ? "" : `<path class="fA" d="M0,-21.5 C-1.3,-22.8 -.5,-24.5 0,-25.5 C.5,-24.5 1.3,-22.8 0,-21.5 Z"/>`}`; },
  balloon: (c = "sB") => `<path class="k ${c}" d="M0,4 C-7,1 -8,-10 0,-12 C8,-10 7,1 0,4 Z"/><path class="${c}" d="M-1,5 L1,5 L0,4 Z"/><path class="hl sM" d="M0,5 C2,9 -2,12 0,17"/>`,
  flag: () => `<path class="sM" d="M0,10 L0,-12"/><rect class="k sW" x="0" y="-12" width="13" height="8"/><path class="hl sR" d="M5,-10.5 L13,-10.5 M5,-8 L13,-8 M0,-5.5 L13,-5.5"/><rect class="hl sB" x="0" y="-12" width="5" height="4.5"/>`,
  mortarboard: () => `<path class="k sW" d="M-11,-4 L0,-9 L11,-4 L0,1 Z"/><path class="sW" d="M-6,-1.5 L-6,4 C-3,6 3,6 6,4 L6,-1.5"/><path class="sA" d="M0,-4 L8,-2 L8,5"/><path class="hl sA" d="M7,5 L9,5 L8.5,8 L7.5,8 Z"/>`,
  sticky: (c = "sA", r = 0) => `<g transform="rotate(${r})"><rect class="k ${c}" x="-6" y="-6" width="12" height="12"/><path class="hl ${c}" d="M-4,-2 L4,-2 M-4,1 L2,1"/></g>`,
  googly: () => `<circle class="k sW" cx="0" cy="0" r="3.2"/><circle class="fW" cx="1" cy="1.2" r="1.4"/>`,
  neuron: () => `<circle class="k sK" cx="0" cy="0" r="3.4"/><path class="sK" d="M-3,-2 L-8,-6 L-11,-5 M-8,-6 L-8,-10 M-3,2 L-9,4 L-11,8 M3,-2 L6,-7 L9,-8 M3.4,0 L14,1 M14,1 L17,-1 M14,1 L17,3"/><path class="hl sK" d="M7,0 L7,1.5 M10,.5 L10,2"/>`,
  // the foam brain from the outreach table, pink line, a few gyri
  brain: () => `<path class="k sK" d="M-10,2 C-14,-2 -12,-9 -6,-10 C-3,-14 4,-13 6,-10 C11,-10 14,-5 11,0 C12,4 8,6 5,5 C3,8 -3,8 -5,5 C-8,6 -11,5 -10,2 Z"/>
    <path class="hl sK" d="M-6,-10 C-5,-6 -8,-4 -6,-1 M1,-12 C-1,-8 2,-6 0,-2 M6,-10 C5,-6 8,-4 6,-1 M-8,2 C-4,0 0,3 4,1 C6,0 8,2 10,1"/><path class="sK" d="M2,6 L3,11"/>`,
  pie: () => `<path class="k sA" d="M-11,0 L11,0 L9,4 L-9,4 Z"/><path class="k sA" d="M-11,0 C-11,-5 11,-5 11,0"/><path class="hl sA" d="M-6,-3 L-3,-1 M0,-4 L0,-1 M6,-3 L3,-1"/>${seg("PI", -3.5, -11, 4.5, "sW", .7)}`,
  orange: () => `<circle class="k sA" cx="0" cy="-5" r="5"/><path class="sG" d="M0,-10 C2,-13 5,-12 5,-11 C4,-10 2,-10 0,-10 Z"/>`,
  hat: (c = "sV") => `<path class="k ${c}" d="M-6,0 L0,-16 L6,0 Z"/><path class="hl ${c}" d="M-4,-5 L4,-5 M-2,-10 L2,-10"/>${star4(0, -17, 2.5, "sA")}`,
  couplet: () => `<rect class="k sR" x="-3.5" y="-16" width="7" height="32"/>${[-11, -4, 3, 10].map(y => `<path class="hl sA" d="M-1.5,${y} L1.5,${y} M0,${y - 1.5} L0,${y + 1.5}"/>`).join("")}`,
  // the department's tree: a pyramid of pipette-tip boxes (blue and yellow racks), a paper star on top, a tinsel wrap
  tiptree: () => { let s = ""; const box = (x, y, c) => `<rect class="k ${c}" x="${x - 8}" y="${y - 7}" width="16" height="7"/><path class="hl ${c}" d="M${x - 6},${y - 4.5} L${x + 6},${y - 4.5} M${x - 6},${y - 2} L${x + 6},${y - 2}"/>`;
    [[-17, 0, "sB"], [0, 0, "sA"], [17, 0, "sB"], [-8.5, -7, "sA"], [8.5, -7, "sB"], [0, -14, "sA"]].forEach(([x, y, c]) => s += box(x, y, c));
    return s + `<path class="hl sG" d="M-22,-3 C-10,-8 4,1 22,-4 M-14,-10 C-4,-14 6,-8 14,-11"/>${T(0, -27, .55, ART.star("sA", true))}`; },
  candy: () => `<path class="k sW" d="M-8,0 C-8,-6 8,-6 8,0 Z"/>${[-4, 0, 4].map((x, i) => `<circle class="${["fR", "fK", "fA"][i]}" cx="${x}" cy="-2.5" r="1.5"/>`).join("")}`,
};

// a string sagging between thumbtacks from a to b, n scallops, dipping d: returns points along it (for hanging things)
function sag(a, b, n, d, steps = 6) {
  const pts = [];
  for (let i = 0; i < n; i++) for (let j = 0; j <= steps; j++) { if (i && !j) continue;
    const u = (i + j / steps) / n, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u + Math.sin(j / steps * Math.PI) * d; pts.push([x, y]); }
  return pts;
}
const poly = (pts) => pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ");
const tacks = (a, b, n) => [...Array(n + 1)].map((_, i) => { const x = a[0] + (b[0] - a[0]) * i / n, y = a[1] + (b[1] - a[1]) * i / n; return `<circle class="fM" cx="${f1(x)}" cy="${f1(y)}" r=".9"/>`; }).join("");

const GARLAND = {
  // tinsel: a zigzag of hairlines along the sag, two colours, one scallop given up and hanging loose
  tinsel: (a, b, n, d, cols = ["sG", "sR"]) => { const p = sag(a, b, n, d, 14); let z = "";
    p.forEach(([x, y], i) => { z += `${i ? "L" : "M"}${f1(x)},${f1(y + (i % 2 ? 1.6 : -1.6))} `; });
    const loose = p[p.length - 1];
    return `<path class="hl ${cols[0]}" d="${z}"/><polyline class="hl ${cols[1]}" fill="none" points="${poly(p)}"/><path class="hl ${cols[0]}" d="M${f1(loose[0])},${f1(loose[1])} L${f1(loose[0] - 2)},${f1(loose[1] + 14)}"/>${tacks(a, b, n - 1)}`; },
  // string lights: the wire, and bulbs in two sets that take turns (pose group "hol")
  lights: (a, b, n, d, cols = ["fR", "fG", "fA", "fB"]) => { const p = sag(a, b, n, d, 8); let s = `<polyline class="hl sD" fill="none" points="${poly(p)}"/>`, on = ["", ""];
    p.forEach(([x, y], i) => { if (i % 2) return; const c = cols[(i / 2) % cols.length], k = (i / 2) % 2;
      s += `<path class="hl sD" d="M${f1(x)},${f1(y)} L${f1(x)},${f1(y + 2)}"/><circle class="k sD" cx="${f1(x)}" cy="${f1(y + 3.4)}" r="1.5"/>`;
      on[k] += `<circle class="${c}" cx="${f1(x)}" cy="${f1(y + 3.4)}" r="1.5"/>`; });
    return s + `<g class="pz on" data-g="hol" data-i="0">${on[0]}</g><g class="pz" data-g="hol" data-i="1">${on[1]}</g>${tacks(a, b, n - 1)}`; },
  // things hung along the string: leaves, hearts, paper chain links
  things: (a, b, n, d, art, every = 2, s = .38) => { const p = sag(a, b, n, d, 6); let o = `<polyline class="hl sM" fill="none" points="${poly(p)}"/>`;
    p.forEach(([x, y], i) => { if (i % every) return; o += T(x, y + 3, s, art(i)); }); return o + tacks(a, b, n - 1); },
  chain: (a, b, n, d, cols = ["sR", "sG", "sA", "sB"]) => { const p = sag(a, b, n, d, 12); let o = "";
    p.forEach(([x, y], i) => { o += `<ellipse class="hl ${cols[i % cols.length]}" cx="${f1(x)}" cy="${f1(y)}" rx="${i % 2 ? 1.2 : 2.8}" ry="${i % 2 ? 2.4 : 1.4}"/>`; }); return o + tacks(a, b, n - 1); },
};

// a pennant banner, one crooked letter per flag (ragtag: one has come untaped and hangs by a corner)
function pennants(text, cx, y, h, cols, fall = -1) {
  const chars = [...text], w = h * 1.3, gap = h * .45, tot = chars.length * (w + gap) - gap, x0 = cx - tot / 2;
  const a = [x0 - 4, y], b = [x0 + tot + 4, y];
  let s = `<path class="hl sM" d="M${f1(a[0])},${f1(a[1])} Q${f1(cx)},${f1(y + h * .35)} ${f1(b[0])},${f1(b[1])}"/>`;
  chars.forEach((ch, i) => { if (ch === " ") return;
    const x = x0 + i * (w + gap), u = (x + w / 2 - a[0]) / (b[0] - a[0]), yy = y + 4 * u * (1 - u) * h * .175 * 2;
    const r = i === fall ? 38 : ((i * 37) % 7 - 3) * .8, c = cols[i % cols.length];
    const flag = `<path class="k ${c}" d="M0,0 L${f1(w)},0 L${f1(w / 2)},${f1(h * 1.75)} Z"/>${seg(ch, w / 2 - segW(ch, h * .6) / 2, h * .18, h * .6, "sW", .75)}`;
    s += `<g transform="translate(${f1(x)},${f1(yy)}) rotate(${r} ${i === fall ? 0 : f1(w / 2)} 0)">${flag}</g>`; });
  return s;
}

// THE LAB'S CHRISTMAS LIGHTS (December into the new year), megaZINE style: someone tacked a string of big C9 bulbs up
// wherever there was something to tack it to. It sags, loops over the door, and the far end gives up and dangles.
// Each lit bulb is a palette outline with a megaZINE ink pass printed a hair out of register; two of them are dead,
// one flickers, the rest chase in two sets (pose group "hol").
function drapeLights() {
  // the wire, through hand-placed points (lab coordinates): corner, a tack on the whiteboard frame, a deep sag, a tack,
  // a loop that hangs down by Adline's door, over the door, a tack at the far corner, the loose end hanging down
  const W = [[178, 75], [192, 88], [207, 79], [224, 94], [244, 101], [262, 84], [290, 92], [318, 88], [336, 96], [341, 112], [335, 119],
    [345, 116], [350, 100], [378, 107], [406, 99], [426, 84], [446, 78], [460, 75], [462, 88], [459, 106], [455, 122]];
  const tacks = [[178, 75], [207, 79], [262, 84], [318, 88], [350, 100], [406, 99], [446, 78]];
  // Catmull-Rom through the points, sampled finely so the bulbs can sit along it by arc length
  const pts = [];
  for (let i = 0; i < W.length - 1; i++) { const p0 = W[i - 1] || W[i], p1 = W[i], p2 = W[i + 1], p3 = W[i + 2] || W[i + 1];
    for (let t = 0; t < 1; t += .1) { const t2 = t * t, t3 = t2 * t, c = (a, b, c1, d) => .5 * (2 * b + (-a + c1) * t + (2 * a - 5 * b + 4 * c1 - d) * t2 + (-a + 3 * b - 3 * c1 + d) * t3);
      pts.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]); } }
  pts.push(W[W.length - 1]);
  let s = `<polyline class="hl sD" fill="none" points="${poly(pts)}"/>` + tacks.map(([x, y]) => `<circle class="fM" cx="${x}" cy="${y}" r="1"/>`).join("");
  // bulbs every ~11 units along the wire
  const outl = ["sR", "sB", "sA", "sG"], ink = ["fZP", "fZB", "fZG", "fZP", "fZB", "fG"], sets = ["", ""];
  let acc = 0, n = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; acc += Math.hypot(x1 - x0, y1 - y0);
    if (acc < 11) continue; acc = 0;
    const r = ((n * 41) % 31) - 15 + (n % 2 ? 8 : -8), bulb = "M0,1.6 C-2.3,2.6 -2.6,5.6 0,7.6 C2.6,5.6 2.3,2.6 0,1.6 Z";
    const g = (inner) => `<g transform="translate(${f1(x1)},${f1(y1)}) rotate(${r})">${inner}</g>`;
    const dead = n === 5 || n === 19, o = outl[n % 4];
    s += g(`<rect class="hl sD" x="-1" y="0" width="2" height="1.8"/><path class="k ${dead ? "sD" : o}" d="${bulb}"/>`);
    if (!dead) { const lit = g(`<path class="${ink[n % 6]} mis" transform="translate(.9,.6) rotate(-4)" d="${bulb}"/><path class="hl ${o}" d="${bulb}"/>`);
      if (n === 11) s += `<g class="pz on" data-g="flicker" data-i="0">${lit}</g>`; else sets[n % 2] += lit; }
    n++;
  }
  return s + `<g class="pz on" data-g="hol" data-i="0">${sets[0]}</g><g class="pz" data-g="hol" data-i="1">${sets[1]}</g>`;
}

/* ---------------- what each holiday puts up ---------------- */
// garland: [kind, …args]; banner: text (or fn of info); cut: art for the walls; hang: art for the ceiling; props: art for desks
const KIT = {
  halloween: { garland: ["things", (i) => ART.bat(i % 4 ? "sV" : "sM"), 2, .32], banner: "HAPPY HALLOWEEN", cols: ["sA", "sV"], cut: () => ART.ghost(), hang: (i) => ART.bat(i % 2 ? "sV" : "sM"), props: [() => ART.pumpkin(), () => ART.candy()], corner: true, floorProp: true },
  thanksgiving: { garland: ["things", (i) => ART.leaf(["sA", "sR", "sA", "sG"][i % 4]), 2, .34], banner: "GIVE THANKS", cols: ["sA", "sR", "sA"], cut: () => ART.handturkey(), props: [() => ART.gloveturkey(), () => ART.pie()] },
  winter: { garland: ["tinsel"], lights: true, banner: "HAPPY HOLIDAYS", fall: 13, cols: ["sR", "sG", "sW"], cut: () => ART.snowflake(), hang: () => ART.snowflake(), props: [() => ART.tiptree(), () => ART.candy()], floorProp: true },
  hanukkah: { banner: "HAPPY HANUKKAH", cols: ["sB", "sW"], cut: () => ART.dreidel(), props: [(info) => ART.menorah((info.hanukkah || {}).night ?? 5), () => ART.dreidel()] },
  diwali: { lights: true, lightCols: ["fA", "fA", "fR", "fA"], banner: "HAPPY DIWALI", cols: ["sA", "sR", "sV"], hang: () => ART.kandil(), props: [() => `${T(-9, 0, .7, ART.diya())}${T(7, 0, .7, ART.diya())}`] },
  newyear: { garland: ["chain", ["sA", "sW", "sB"]], banner: (info) => "HAPPY " + ((info.newyear || {}).year || ""), cols: ["sA", "sW"], hang: (i) => ART.balloon(["sB", "sA", "sV", "sR"][i % 4]), props: [() => ART.hat(), () => ART.hat("sA")] },
  lunar: { banner: (info) => "YEAR OF THE " + ((info.lunar || {}).animal || "HORSE"), cols: ["sR", "sA"], hang: () => ART.lantern(), cut: () => ART.couplet(), props: [() => `${T(-5, 0, .7, ART.orange())}${T(5, 0, .7, ART.orange())}${T(0, -6, .7, ART.orange())}`] },
  valentine: { garland: ["things", (i) => ART.heart(i % 3 ? "sR" : "sK"), 2, .3], banner: "YOU ARE MY P < .05", cols: ["sR", "sK", "sW"], cut: () => ART.heart(), props: [() => ART.candy()] },
  pi: { banner: "HAPPY PI DAY  3.14159", cols: ["sA", "sW"], props: [() => ART.pie()] },
  stpat: { garland: ["chain", ["sG", "sW", "sG", "sA"]], banner: "ST PATRICK'S", cols: ["sG", "sW"], cut: () => ART.shamrock(), props: [() => ART.shamrock()] },
  brainweek: { garland: ["things", () => ART.neuron(), 3, .35], banner: "BRAIN AWARENESS WEEK", cols: ["sK", "sV", "sB"], cut: () => ART.neuron(), props: [() => ART.brain()] },
  fools: { cut: (i) => ART.sticky(["sA", "sK", "sG"][i % 3], (i * 23) % 17 - 8), googly: true, props: [() => `${T(-4, -5, 1, ART.googly())}${T(4, -5, 1, ART.googly())}`] },
  grads: { garland: ["chain", ["sB", "sW", "sA"]], banner: "CONGRATULATIONS DOCTORS", cols: ["sB", "sA", "sW"], hang: () => ART.mortarboard(), props: [() => ART.mortarboard()] },
  july4: { garland: ["chain", ["sR", "sW", "sB"]], cols: ["sR", "sW", "sB"], cut: () => ART.flag(), props: [() => ART.flag()] },
};

/* ---------------- where things go, room by room ---------------- */
// Restraint: a real department doesn't decorate every room. Penny does the main office (banner, a cutout, a desk
// thing); someone strings something across the lab and the kitchen; the hall gets the banner; a few rooms get one
// small thing; the MRI suite (metal), the ethics office (disapproves), Impact and the plant rooms get nothing.
// use: which pieces this room gets: banner, garland (or the holiday's lights), lights (only if the holiday has them),
// cut (one wall cutout, at cut[0]), hang (two things on thread), prop (one desk prop, at props[0]), corner (cobweb).
// banner: [world X, world Y, max width]; cut: [side (0/640, or "b" for the back wall), k or X, Y]; props: [x, y, scale].
const ROOMS = {
  lab: { use: ["garland", "cut", "prop", "corner"], cut: [[640, .5, 112]], props: [[232, 206, .6]], floor: [282, 203, .75] },
  kitchen: { use: ["garland", "hang", "prop"], props: [[238, 181, .5]] },
  office: { use: ["banner", "cut", "prop"], banner: [180, 26], cut: [[640, .56, 120]], props: [[440, 184, .5]] },
  hall: { use: ["banner", "lights"], banner: [180, 26] },
  seminar: { use: ["cut"], cut: [[640, .5, 100]] },
  conference: { use: ["prop"], props: [[380, 205, .5]] },
  library: { use: ["cut"], cut: [["b", 330, 150]] },
  iris: { use: ["prop"], props: [[392, 214, .45]] },
  freezer: { use: ["cut"], cut: [["b", 70, 110]] },
};

export function decorFor(roomId, pp, info, ids, lights = false) {
  const spec = ROOMS[roomId]; if (!spec) return "";
  if (!ids.length) return roomId === "lab" && lights ? drapeLights() : "";
  const has = (k) => spec.use.includes(k);
  const prime = ids[0], K = KIT[prime], { P, KB } = pp;
  const TL = P(0, 0, KB), TR = P(640, 0, KB);
  const span = (y0) => [[TL[0] + 6, TL[1] + y0], [TR[0] - 6, TR[1] + y0]];
  const scal = Math.max(3, Math.round((TR[0] - TL[0]) / 70));
  let s = "";
  // one string across the back wall: the holiday's garland, or its lights if that's all it has
  if (roomId === "lab" && lights) s += drapeLights();
  else if (has("garland") && K.garland) s += garland(K, ...span(4), scal);
  else if ((has("garland") || has("lights")) && (K.lights || ids.slice(1).some(i => KIT[i].lights))) {
    const L = K.lights ? K : KIT[ids.find(i => KIT[i].lights)]; s += GARLAND.lights(...span(4), scal, 4, L.lightCols); }
  // the banner
  const bt = typeof K.banner === "function" ? K.banner(info) : K.banner;
  if (has("banner") && bt && spec.banner) { const p = P(spec.banner[0], spec.banner[1], KB), wall = spec.banner[2] || (TR[0] - TL[0] - 16);
    let h = 6.4; while ((bt.length * h * 1.75) > wall && h > 3.6) h -= .4;
    const cx = Math.max(TL[0] + 8 + bt.length * h * .88, Math.min(TR[0] - 8 - bt.length * h * .88, p[0]));
    s += pennants(bt, cx, p[1], h, K.cols || ["sW"], K.fall ?? -1); }
  // one cutout taped up (on April 1st, a pair of googly eyes instead, on the nearest thing that holds still)
  const cutArt = K.cut || ids.slice(1).map(i => KIT[i].cut).find(Boolean);
  if (has("cut") && cutArt && spec.cut) spec.cut.slice(0, 1).forEach(([side, kx, Y], i) => {
    const p = side === "b" ? P(kx, Y, KB) : P(side, Y, kx), sc = (side === "b" ? KB : kx) * 1.15;
    if (K.googly) { s += T(p[0] - 3.5 * sc, p[1], sc, ART.googly()) + T(p[0] + 3.5 * sc, p[1] + .5, sc, ART.googly()); return; }
    s += T(p[0], p[1], sc, cutArt(i), side === "b" ? -4 : 0) + tape(p[0] - 4 * sc, p[1] - 9 * sc, -20) + tape(p[0] + 4 * sc, p[1] - 9 * sc, 20); });
  if (has("corner") && K.corner) s += T(TR[0], TR[1], .9, ART.cobweb(-1));
  // two things on thread from the ceiling tiles
  const hangArt = K.hang || ids.slice(1).map(i => KIT[i].hang).find(Boolean);
  if (has("hang") && hangArt) [200, 440].forEach((X, i) => { const k = KB + .06, top = P(X, 0, k), len = (12 + i * 8) * k * 1.6, end = [top[0], top[1] + len];
    s += `<path class="hl sM" d="M${f1(top[0])},${f1(top[1])} L${f1(end[0])},${f1(end[1])}"/>` + T(end[0], end[1] + 6 * k, k * .9, hangArt(i)); });
  // one desk prop: the first in-season holiday that has one (so Hanukkah's menorah shows up in December)
  if (has("prop") && spec.props) { const own = (KIT[prime].props || [])[0], also = ids.slice(1).map(i => (KIT[i].props || [])[0]).find(Boolean);
    // the kitchen gets the second holiday's thing (diyas by the coffee, the menorah on the counter)
    const a = roomId === "kitchen" && also ? also : own || also;
    const [x, y, sc] = (a === own && K.floorProp && spec.floor) || spec.props[0]; if (a) s += T(x, y, sc, a(info)); }
  return s;
}
function garland(K, a, b, n) {
  const [kind, ...args] = K.garland;
  if (kind === "things") return GARLAND.things(a, b, n, 4, args[0], args[1], args[2]);
  if (kind === "chain") return GARLAND.chain(a, b, n, 4, args[0]);
  if (kind === "tinsel") return GARLAND.tinsel(a, b, n, 4);
  return GARLAND.lights(a, b, n, 4);
}

// the layer for the room on screen (empty when the decorations are off, or underground)
export function decor(room, G) {
  if (!opt("holidays") || !room || !room.pp) return "";
  const cur = current(); if (!cur.on.length && !cur.lights) return "";
  return `<g class="decor" pointer-events="none">${decorFor(room.id, room.pp, cur.info, cur.on, cur.lights)}</g>`;
}
export const ART_FOR_TEST = ART;
