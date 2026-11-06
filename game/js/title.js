// THE TITLE SCREEN: GAIN CONTROL over the Round Table. Every few seconds something tries to take the title over (the
// Gain Controller, on a carrier wave): the letters slice and split, the seat lamps round the ring light, and for a
// moment the title says something else. Then it snaps back. Poses, not tweens: each glitch is a few fixed frames.
import { seg, segC, segW, arcs } from "./gfx.js";

const CX = 320, CY = 150, RX = 272, RY = 62, TY = 92, TS = 44;
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

// the title, normally
const plain = () => segC("GAIN CONTROL", CX, TY, TS, "sW", 2.2);
// glitch poses: horizontal slices shoved sideways, a split into channels, a takeover word, scanlines
const sliced = (dx) => [[TY - 2, TY + 14], [TY + 14, TY + 30], [TY + 30, TY + TS + 4]].map(([a, b], i) =>
  `<g clip-path="url(#tclip${i})"><g transform="translate(${dx[i]},0)">${plain()}</g></g>`).join("");
const split = (d) => `<g transform="translate(${-d},0)">${segC("GAIN CONTROL", CX, TY, TS, "sR", 2.2)}</g><g transform="translate(${d},1)">${segC("GAIN CONTROL", CX, TY, TS, "sG", 2.2)}</g>${segC("GAIN CONTROL", CX, TY, TS, "sW", 1.2)}`;
const WORDS = ["GAIN CONTROLLED", "GAIN: MAXIMUM", "FOG NEURO", "OBEY THE BOARD", "FURTHER RESEARCH", "THE AUTHORS SHOULD", "CONSCIENCE: 0"];
const takeover = (w) => segC(w, CX, TY, Math.min(TS, 560 / (segW(w, 1) || 1)), "sR", 2.2)
  + arcs(CX - segW(w, Math.min(TS, 560 / segW(w, 1))) / 2 - 14, TY + 22, -1, "sG", 3, .9) + arcs(CX + segW(w, Math.min(TS, 560 / segW(w, 1))) / 2 + 14, TY + 22, 1, "sG", 3, .9);
const scan = () => plain() + Array.from({ length: 16 }, (_, i) => `<path class="hl sG" d="M${CX - 170},${TY + i * 3} L${CX + 170},${TY + i * 3}"/>`).join("");

export const titleDefs = () => `<defs>${[[TY - 2, TY + 14], [TY + 14, TY + 30], [TY + 30, TY + TS + 4]].map(([a, b], i) =>
  `<clipPath id="tclip${i}"><rect x="0" y="${a}" width="640" height="${b - a}"/></clipPath>`).join("")}</defs>`;
export const titleArt = () => `${titleDefs()}<g id="ttable">${titleTable(0)}</g><g id="ttl">${plain()}</g>`;

// run the glitches while the title card is up; returns stop()
export function titleGlitch(root, { sfx = () => {} } = {}) {
  let alive = true, t = null;
  const ttl = () => root.querySelector("#ttl"), tab = () => root.querySelector("#ttable");
  const set = (svg, lit) => { const e = ttl(); if (e) e.innerHTML = svg; const b = tab(); if (b && lit !== undefined) b.innerHTML = titleTable(lit); };
  const r = (a) => a[Math.floor(Math.random() * a.length)], j = (n) => Math.round((Math.random() * 2 - 1) * n);
  async function run(big) {
    const frames = [[sliced([j(10), j(14), j(8)]), 70], [split(3), 60], [sliced([j(16), j(6), j(18)]), 60]];
    if (big) { const w = r(WORDS); frames.push([takeover(w), 90, 1], [scan(), 60, 2], [takeover(w), 380, 3], [split(5), 60, 2], [sliced([j(20), j(20), j(20)]), 70, 1]); sfx(); }
    frames.push([plain(), 0, 0]);
    for (const [svg, ms, lit] of frames) { if (!alive) return; set(svg, lit === undefined ? undefined : lit); if (ms) await new Promise(res => (t = setTimeout(res, ms))); }
  }
  const loop = () => { if (!alive) return; t = setTimeout(async () => { await run(Math.random() < .5); loop(); }, 2200 + Math.random() * 3800); };
  loop();
  return () => { alive = false; clearTimeout(t); set(plain(), 0); };
}
