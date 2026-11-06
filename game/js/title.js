// THE TITLE SCREEN: GAIN CONTROL, on an LED dot-matrix panel, alone in the dark. Every few seconds something tries to take
// the title over (the Gain Controller, on a carrier wave): the letters slice and split, and for those frames only the
// Round Table flashes in behind it; on the big ones its seat lamps light and the title says something else. Then it
// snaps back and the Table is gone. Poses, not tweens: each glitch is a few fixed frames.
import { seg, arcs } from "./gfx.js";

const CX = 320, CY = 150, RX = 272, RY = 62, TY = 92;
const at = (deg, rx = RX, ry = RY) => { const a = deg * Math.PI / 180; return [CX + rx * Math.cos(a), CY + ry * Math.sin(a)]; };
const f = (v) => v.toFixed(1);

// a hood at a seat: shoulders, cowl, the dark face opening; s scales by depth
const hood = (x, y, s, cls = "sD") => `<path class="k ${cls}" style="stroke-width:${f(1.1 * s)}" d="M${f(x - 15 * s)},${f(y)} C${f(x - 15 * s)},${f(y - 10 * s)} ${f(x - 9 * s)},${f(y - 12 * s)} ${f(x - 8 * s)},${f(y - 20 * s)} C${f(x - 7 * s)},${f(y - 34 * s)} ${f(x + 7 * s)},${f(y - 34 * s)} ${f(x + 8 * s)},${f(y - 20 * s)} C${f(x + 9 * s)},${f(y - 12 * s)} ${f(x + 15 * s)},${f(y - 10 * s)} ${f(x + 15 * s)},${f(y)}"/>`
  + `<path class="k ${cls}" style="stroke-width:${f(.8 * s)}" d="M${f(x - 4 * s)},${f(y - 16 * s)} C${f(x - 4 * s)},${f(y - 26 * s)} ${f(x + 4 * s)},${f(y - 26 * s)} ${f(x + 4 * s)},${f(y - 16 * s)} Z"/>`;

// the Round Table: the old magnet's iron ring, seen from the foot of the table, twelve hoods round it, a lamp at each seat
export function titleTable(lit = 0) {
  let s = "";
  // the floor grid under it, receding (atmosphere)
  [236, 270, 320].forEach(y => s += `<path class="hl sN" d="M0,${y} L640,${y}"/>`);
  for (let i = -4; i <= 4; i++) s += `<path class="hl sN" d="M${CX + i * 120},${CY + RY + 14} L${CX + i * 260},360"/>`;
  // back half of the seats: hoods behind the ring (smaller, dimmer)
  const seats = Array.from({ length: 12 }, (_, i) => 180 + 15 + i * 30);   // angles round the ellipse
  const back = seats.filter(a => a < 360), front = seats.filter(a => a >= 360).map(a => a - 360);
  for (const a of back) { const [x, y] = at(a, RX - 4, RY + 2), d = 1 - .25 * Math.abs(Math.cos(a * Math.PI / 180)); s += hood(x, y + 2, d * 1.9); }
  // the ring: two ellipses and the winding hatches between them
  s += `<ellipse class="sM" cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" style="stroke-width:1.2"/><ellipse class="hl sM" cx="${CX}" cy="${CY + 7}" rx="${RX - 26}" ry="${RY - 9}"/>`;
  for (let a = 0; a < 360; a += 7.5) { const [x1, y1] = at(a), [x2, y2] = at(a, RX - 26, RY - 9); s += `<path class="hl sN" d="M${f(x1)},${f(y1)} L${f(x2)},${f(y2 + 7)}"/>`; }
  // the seat lamps on the ring: dark, or lit when something is broadcasting
  seats.forEach((a, i) => { const [x, y] = at(a % 360, RX - 13, RY - 4); s += lit && (i * 7 + lit) % 3 !== 0 ? `<circle class="fR" cx="${f(x)}" cy="${f(y + 3)}" r="2.2"/>` : `<circle class="hl sD" cx="${f(x)}" cy="${f(y + 3)}" r="2.2"/>`; });
  // the front seats: chair backs only (the hoods' heads are below the frame)
  for (const a of front) { const [x, y] = at(a, RX + 34, RY + 22); s += `<path class="k sD" d="M${f(x - 18)},${f(y + 40)} L${f(x - 16)},${f(y)} C${f(x - 10)},${f(y - 8)} ${f(x + 10)},${f(y - 8)} ${f(x + 16)},${f(y)} L${f(x + 18)},${f(y + 40)}"/>`; }
  // the insignia, in the middle of the table, under the title
  s += `<circle class="hl sD" cx="${CX}" cy="${CY + 8}" r="16"/><circle class="${lit ? "fR" : "hl sD"}" cx="${CX}" cy="${CY + 8}" r="6"/>`;
  return s;
}

// THE TITLE TYPE: an LED dot-matrix display, the way Teenage Engineering's hardware screens draw letters (OB-4,
// EP-133): a 5×7 grid per character, lit dots filled (they're ON), unlit dots as faint hairline rings, all inside a
// thin display window. Sixteen characters wide, so the takeover words fit the same panel.
const FONT = {
  A: "01110 10001 10001 11111 10001 10001 10001", B: "11110 10001 10001 11110 10001 10001 11110", C: "01110 10001 10000 10000 10000 10001 01110",
  D: "11110 10001 10001 10001 10001 10001 11110", E: "11111 10000 10000 11110 10000 10000 11111", F: "11111 10000 10000 11110 10000 10000 10000",
  G: "01110 10001 10000 10111 10001 10001 01111", H: "10001 10001 10001 11111 10001 10001 10001", I: "01110 00100 00100 00100 00100 00100 01110",
  J: "00111 00010 00010 00010 00010 10010 01100", K: "10001 10010 10100 11000 10100 10010 10001", L: "10000 10000 10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10101 10001 10001 10001", N: "10001 10001 11001 10101 10011 10001 10001", O: "01110 10001 10001 10001 10001 10001 01110",
  P: "11110 10001 10001 11110 10000 10000 10000", Q: "01110 10001 10001 10001 10101 10010 01101", R: "11110 10001 10001 11110 10100 10010 10001",
  S: "01111 10000 10000 01110 00001 00001 11110", T: "11111 00100 00100 00100 00100 00100 00100", U: "10001 10001 10001 10001 10001 10001 01110",
  V: "10001 10001 10001 10001 10001 01010 00100", W: "10001 10001 10001 10101 10101 10101 01010", X: "10001 10001 01010 00100 01010 10001 10001",
  Y: "10001 10001 01010 00100 00100 00100 00100", Z: "11111 00001 00010 00100 01000 10000 11111", "0": "01110 10001 10011 10101 11001 10001 01110",
  ":": "00000 01100 01100 00000 01100 01100 00000", "-": "00000 00000 00000 11111 00000 00000 00000", " ": "00000 00000 00000 00000 00000 00000 00000",
};
const COLS = 16, P = 5.2, DR = 1.9;                       // characters in the window, dot pitch, lit dot radius
const WX = CX - (COLS * 6 - 1) * P / 2, WY = TY + 2;      // window origin (top-left dot)
// which dots are lit for a word, centred in the window: a Set of "c,r"
function litDots(word) {
  const on = new Set(), w = word.toUpperCase(), c0 = Math.floor((COLS - w.length) / 2) * 6 + (((COLS - w.length) % 2) ? 3 : 0);
  [...w].forEach((ch, k) => { const rows = (FONT[ch] || FONT[" "]).split(" ");
    rows.forEach((bits, r) => [...bits].forEach((b, c) => { if (b === "1") on.add(`${c0 + k * 6 + c},${r}`); })); });
  return on;
}
// draw the display: unlit grid, lit dots; opts: cls for lit dots, dx per row (row slices), noise (stray lit dots), shift
function display(on, { cls = "fW", dx = [], noise = 0, ghost = null } = {}) {
  let s = `<rect class="k sM" style="stroke-width:.8" x="${f(WX - 9)}" y="${f(WY - 9)}" width="${f((COLS * 6 - 1) * P + 18)}" height="${f(6 * P + 18)}" rx="4"/>`;
  s += seg("GAIN", WX - 8, WY - 17, 3.6, "sM", .6) + seg("CONTROL", WX + 14, WY - 17, 3.6, "sM", .6) + `<circle class="fR" cx="${f(WX + (COLS * 6 - 1) * P + 4)}" cy="${f(WY - 14)}" r="1.4"/>`;
  for (let r = 0; r < 7; r++) for (let c = 0; c < COLS * 6 - 1; c++) {
    const x = WX + c * P + (dx[Math.floor(r / 2.4)] || 0), y = WY + r * P, k = `${c},${r}`;
    if (ghost && ghost.has(k)) s += `<circle class="fR" cx="${f(x - 1.6)}" cy="${f(y)}" r="${DR * .8}"/>`;
    if (on.has(k) || Math.random() < noise) s += `<circle class="${cls}" cx="${f(x)}" cy="${f(y)}" r="${DR}"/>`;
    else s += `<circle class="hl sN" cx="${f(WX + c * P)}" cy="${f(y)}" r=".7"/>`;
  }
  return s;
}
const TITLE = litDots("GAIN CONTROL");
const plain = () => display(TITLE);
// glitch poses, in dots: rows shoved sideways, a red ghost beside the white, a takeover word in red, random dots firing
const sliced = (dx) => display(TITLE, { dx: dx.map(v => Math.round(v / P) * P) });
const split = (d) => display(TITLE, { ghost: TITLE, dx: [d, -d, d] });
const WORDS = ["GAIN CONTROLLED", "GAIN: MAXIMUM", "FOG NEURO", "OBEY THE BOARD", "FURTHER RESEARCH", "AUTHORS SHOULD", "CONSCIENCE: 0", "REVIEWER 2"];
const takeover = (w) => display(litDots(w), { cls: "fR" }) + arcs(WX - 18, WY + 15, -1, "sG", 3, .9) + arcs(WX + (COLS * 6 - 1) * P + 18, WY + 15, 1, "sG", 3, .9);
const scan = () => display(TITLE, { noise: .18 });
export const titleDefs = () => "";
export const titleArt = () => `<g id="ttable"></g><g id="ttl">${plain()}</g>`;   // the Table is only there while the title glitches

// run the glitches while the title card is up; returns stop()
export function titleGlitch(root, { sfx = () => {} } = {}) {
  let alive = true, t = null;
  const ttl = () => root.querySelector("#ttl"), tab = () => root.querySelector("#ttable");
  // lit: null hides the Table, 0 shows it dark, >0 lights its lamps
  const set = (svg, lit) => { const e = ttl(); if (e) e.innerHTML = svg; const b = tab(); if (b) b.innerHTML = lit === null ? "" : titleTable(lit); };
  const r = (a) => a[Math.floor(Math.random() * a.length)], j = (n) => Math.round((Math.random() * 2 - 1) * n);
  async function run(big) {
    const frames = [[sliced([j(10), j(14), j(8)]), 70, 0], [split(3), 60, 0], [sliced([j(16), j(6), j(18)]), 60, 0]];
    if (big) { const w = r(WORDS); frames.push([takeover(w), 90, 1], [scan(), 60, 2], [takeover(w), 380, 3], [split(5), 60, 2], [sliced([j(20), j(20), j(20)]), 70, 1]); sfx(); }
    frames.push([plain(), 0, null]);
    for (const [svg, ms, lit] of frames) { if (!alive) return; set(svg, lit); if (ms) await new Promise(res => (t = setTimeout(res, ms))); }
  }
  const loop = () => { if (!alive) return; t = setTimeout(async () => { await run(Math.random() < .5); loop(); }, 2200 + Math.random() * 3800); };
  loop();
  return () => { alive = false; clearTimeout(t); set(plain(), null); };
}
