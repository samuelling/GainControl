// Gain Control — shared drawing language: stroke alphabet, chips, glyphs, perspective helpers.
// Every color is a CSS class (sW sR …), never hex, so day/night palettes swap via CSS variables.

const GL = {
  A:[[0,6,0,1,1,0,3,0,4,1,4,6],[0,3,4,3]], B:[[0,0,0,6],[0,6,3,6,4,5,4,4,3,3,0,3],[0,0,3,0,4,1,4,2,3,3]],
  C:[[4,0,0,0,0,6,4,6]], D:[[0,0,0,6],[0,6,3,6,4,5,4,1,3,0,0,0]], E:[[4,0,0,0,0,6,4,6],[0,3,3,3]], F:[[4,0,0,0,0,6],[0,3,3,3]],
  G:[[4,0,0,0,0,6,4,6,4,3,2,3]], H:[[0,0,0,6],[4,0,4,6],[0,3,4,3]], I:[[1,0,3,0],[2,0,2,6],[1,6,3,6]], J:[[4,0,4,6,0,6,0,4]],
  K:[[0,0,0,6],[4,0,0,3,4,6]], L:[[0,0,0,6,4,6]], M:[[0,6,0,0,2,3,4,0,4,6]], N:[[0,6,0,0,4,6,4,0]],
  O:[[0,0,4,0,4,6,0,6,0,0]], P:[[0,6,0,0],[0,0,4,0,4,3,0,3]], Q:[[0,0,4,0,4,6,0,6,0,0],[2,4,4,6]], R:[[0,6,0,0],[0,0,4,0,4,3,0,3],[1.6,3,4,6]],
  S:[[4,0,0,0,0,3,4,3,4,6,0,6]], T:[[0,0,4,0],[2,0,2,6]], U:[[0,0,0,6,4,6,4,0]], V:[[0,0,2,6,4,0]],
  W:[[0,0,1,6,2,3,3,6,4,0]], X:[[0,0,4,6],[4,0,0,6]], Y:[[0,0,2,3,4,0],[2,3,2,6]], Z:[[0,0,4,0,0,6,4,6]],
  "0":[[0,0,4,0,4,6,0,6,0,0]], "1":[[1,1,2,0,2,6]], "2":[[0,0,4,0,4,3,0,3,0,6,4,6]], "3":[[0,0,4,0,4,6,0,6],[1,3,4,3]],
  "4":[[0,0,0,3,4,3],[4,0,4,6]], "5":[[4,0,0,0,0,3,4,3,4,6,0,6]], "6":[[4,0,0,0,0,6,4,6,4,3,0,3]], "7":[[0,0,4,0,1.4,6]],
  "8":[[0,0,4,0,4,6,0,6,0,0],[0,3,4,3]], "9":[[4,3,0,3,0,0,4,0,4,6,0,6]], "-":[[1,3,3,3]], ".":[[2,6,2,5.6]], ",":[[2,5.4,1.4,7]],
  ":":[[2,1.5,2,1.9],[2,4.5,2,4.9]], "/":[[0,6,4,0]], "!":[[2,0,2,4],[2,5.8,2,6]], "?":[[0,0,4,0,4,3,2,3,2,4],[2,5.8,2,6]],
  "+":[[2,1,2,5],[0,3,4,3]], "=":[[0,2,4,2],[0,4,4,4]], "×":[[0.6,1.6,3.4,4.4],[3.4,1.6,0.6,4.4]], "÷":[[0,3,4,3],[2,1,2,1.4],[2,4.6,2,5]], ">":[[0,0,4,3,0,6]], "<":[[4,0,0,3,4,6]], "'":[[2,0,2,1.5]], "#":[[1,0,1,6],[3,0,3,6],[0,2,4,2],[0,4,4,4]],
  "@":[[4,6,0,6,0,0,4,0,4,4,2,4,2,2,4,2]], "&":[[4,6,0,2,0,0,2,0,2,2,0,4,0,6,2,6,4,4]], "(":[[3,0,1,2,1,4,3,6]], ")":[[1,0,3,2,3,4,1,6]], "*":[[2,1,2,5],[0.4,2,3.6,4],[0.4,4,3.6,2]], "%":[[0,6,4,0],[0,0,1.4,0,1.4,1.6,0,1.6,0,0],[2.6,4.4,4,4.4,4,6,2.6,6,2.6,4.4]],
};
export function rpath(pts, r) {
  const closed = pts.length > 2 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
  if (closed) { const m = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2]; pts = [m, ...pts.slice(1), m]; }
  const f = (q) => q[0].toFixed(2) + "," + q[1].toFixed(2);
  let d = "M" + f(pts[0]);
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], c = pts[i], b = pts[i + 1];
    const d1 = Math.hypot(c[0] - a[0], c[1] - a[1]), d2 = Math.hypot(b[0] - c[0], b[1] - c[1]);
    if (!d1 || !d2) continue;
    const rr = Math.min(r, d1 * .5, d2 * .5);
    d += "L" + f([c[0] - (c[0] - a[0]) / d1 * rr, c[1] - (c[1] - a[1]) / d1 * rr]) + "Q" + f(c) + " " + f([c[0] + (b[0] - c[0]) / d2 * rr, c[1] + (b[1] - c[1]) / d2 * rr]);
  }
  return d + "L" + f(pts[pts.length - 1]);
}
const CXR = 0.62;   // condensed: horizontal unit = 0.62 × vertical unit
export function seg(str, x, y, h, cls, sw = 1.5) {
  const u = h / 6, ux = u * CXR; let out = "", cx = x;
  for (const ch of String(str).toUpperCase()) {
    if (ch === " ") { cx += ux * 3.2; continue; }
    const g = GL[ch]; if (!g) { cx += ux * 5.8; continue; }
    for (const pl of g) { const pts = []; for (let i = 0; i < pl.length; i += 2) pts.push([cx + pl[i] * ux, y + pl[i + 1] * u]);
      out += `<path d="${rpath(pts, u * 1.1)}" class="${cls}" style="stroke-width:${sw}"/>`; }
    cx += ux * 5.8;
  }
  return out;
}
export const segW = (str, h) => { const ux = h / 6 * CXR; let w = 0; for (const ch of String(str)) w += ch === " " ? ux * 3.2 : ux * 5.8; return w - ux * 1.8; };
export const segC = (str, cx, y, h, cls, sw) => seg(str, cx - segW(str, h) / 2, y, h, cls, sw);
export const chip = (txt, x, y, h, fcls, id = "") =>
  `<g ${id ? `id="${id}"` : ""}><rect class="${fcls}" x="${x}" y="${y}" width="${(segW(txt, h) + h * .9).toFixed(1)}" height="${(h * 1.7).toFixed(1)}"/>${seg(txt, x + h * .45, y + h * .35, h, "s0", 1.2)}</g>`;
export const chipW = (txt, h) => segW(txt, h) + h * .9;
export const arcs = (x, y, dir, cls, n = 3, s = 1) => { let o = ""; for (let i = 0; i < n; i++) { const r = (5 + i * 4) * s, xx = x + dir * i * 4 * s;
  o += `<path class="${cls}" d="M${xx},${y - r} C${xx + dir * r * .6},${y - r * .4} ${xx + dir * r * .6},${y + r * .4} ${xx},${y + r}"/>`; } return o; };
export const star4 = (x, y, r, cls) => `<path class="${cls}" d="M${x},${y - r}C${x + 1},${y - 1} ${x + 1},${y - 1} ${x + r},${y}C${x + 1},${y + 1} ${x + 1},${y + 1} ${x},${y + r}C${x - 1},${y + 1} ${x - 1},${y + 1} ${x - r},${y}C${x - 1},${y - 1} ${x - 1},${y - 1} ${x},${y - r}Z"/>`;
export const hit = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent"/>`;

// glyphs for the chooser
export const ICON = {
  look: (x, y, c) => `<path class="${c}" d="M${x - 9},${y} Q${x},${y - 8} ${x + 9},${y} Q${x},${y + 8} ${x - 9},${y} Z"/><circle class="${c.replace("s", "f")}" cx="${x}" cy="${y}" r="2.4"/>`,
  use: (x, y, c) => `<path class="${c}" d="M${x - 5},${y + 7} L${x - 5},${y - 2} M${x - 2},${y + 1} L${x - 2},${y - 7} M${x + 1},${y + 1} L${x + 1},${y - 8} M${x + 4},${y + 1} L${x + 4},${y - 6} M${x - 6},${y + 7} L${x + 6},${y + 7} L${x + 6},${y}"/>`,
  talk: (x, y, c) => `<path class="${c}" d="M${x - 9},${y - 6} L${x + 9},${y - 6} L${x + 9},${y + 4} L${x - 2},${y + 4} L${x - 6},${y + 8} L${x - 6},${y + 4} L${x - 9},${y + 4} Z"/>`,
  play: (x, y, c) => `<path class="${c}" d="M${x - 4},${y - 6} L${x + 6},${y} L${x - 4},${y + 6} Z"/>`,
  go: (x, y, c) => `<path class="${c}" d="M${x - 7},${y} L${x + 6},${y} M${x + 1},${y - 5} L${x + 6},${y} L${x + 1},${y + 5}"/>`,
};

// one-point perspective room: VP, back-wall depth KB, floor line FY (picture plane)
export function perspective(vpx, vpy, KB, FY = 290) {
  const P = (X, Y, k) => [vpx + (X - vpx) * k, vpy + (Y - vpy) * k];
  const kAtY = (y) => (y - vpy) / (FY - vpy);
  const pt = (a) => a[0].toFixed(1) + "," + a[1].toFixed(1);
  const poly = (...a) => a.map(pt).join(" ");
  const ln = (a, b, cls) => `<path class="${cls}" d="M${pt(a)} L${pt(b)}"/>`;
  return { P, kAtY, pt, poly, ln, vpx, vpy, KB, FY };
}
// the shared shell of a perspective room: floor grid, ceiling tiles, edges
export function shell(pp, { tiles = true, floorStep = 80, rail = 170 } = {}) {
  const { P, ln, poly, KB, FY } = pp;
  const TL = P(0, 0, KB), TR = P(640, 0, KB), BL = P(0, FY, KB), BR = P(640, FY, KB);
  let s = "";
  for (let X = -160; X <= 800; X += floorStep) s += ln([X, FY], P(X, FY, KB), "hl sN");
  [0.5, 0.6, 0.72, 0.86].filter(k => k > KB).forEach(k => s += ln(P(0, FY, k), P(640, FY, k), "hl sN"));
  if (tiles) {
    for (let X = 0; X <= 640; X += 64) s += ln([X, 0], P(X, 0, KB), "hl sD");
    [0.5, 0.6, 0.72, 0.86].filter(k => k > KB).forEach(k => s += ln(P(0, 0, k), P(640, 0, k), "hl sD"));
  }
  s += `<polyline class="sM" points="${poly([0, 0], TL, TR, [640, 0])}"/><polyline class="sM" points="${poly([0, FY], BL, BR, [640, FY])}"/>`;
  s += ln(TL, BL, "sM") + ln(TR, BR, "sM");
  if (rail) s += ln(P(0, rail, KB), P(640, rail, KB), "hl sD");
  return s;
}
// Flat things on a receding surface (a clock or sign on a side wall, a label on a desk top): draw the content upright in a
// local box (0,0)-(w,h), then map it onto the surface's quad from three screen corners tl, tr, bl (affine; exact enough
// for anything sign-sized). Pick w and h near the quad's on-screen size so strokes keep their weight.
export const onQuad = (inner, w, h, tl, tr, bl) => {
  const a = (tr[0] - tl[0]) / w, b = (tr[1] - tl[1]) / w, c = (bl[0] - tl[0]) / h, d = (bl[1] - tl[1]) / h, n = (v) => +v.toFixed(4);
  return `<g transform="matrix(${n(a)},${n(b)},${n(c)},${n(d)},${n(tl[0])},${n(tl[1])})">${inner}</g>`;
};
// a patch of side wall (side 0 = left, 640 = right) between depths k0 (far) and k1 (near) and heights Y0..Y1, in room
// coordinates. Returns its corners, a polygon string, a natural local size, and put(inner) to lay content on it.
export function wallPatch(pp, side, k0, k1, Y0, Y1) {
  const { P, poly } = pp;
  // left wall: far edge is on the right of the screen, so read the patch left-to-right from the near edge
  const [ka, kb] = side === 0 ? [k1, k0] : [k0, k1];
  const tl = P(side, Y0, ka), tr = P(side, Y0, kb), br = P(side, Y1, kb), bl = P(side, Y1, ka);
  const w = Math.abs(tr[0] - tl[0]), h = ((bl[1] - tl[1]) + (br[1] - tr[1])) / 2;
  return { tl, tr, br, bl, w, h, pts: poly(tl, tr, br, bl), put: (inner) => onQuad(inner, w, h, tl, tr, bl) };
}
// a door drawn on a side wall between depths k1..k2 (side: 0 = left wall, 640 = right wall)
export function sideDoor(pp, side, k1, k2, top = 120, cls = "sW") {
  const { P, poly, FY } = pp;
  const a = P(side, top, k1), b = P(side, top, k2), c = P(side, FY, k2), d = P(side, FY, k1);
  const hx = side === 0 ? (a[0] + b[0]) / 2 + (b[0] - a[0]) * .3 : (a[0] + b[0]) / 2 - (b[0] - a[0]) * .3;
  return { svg: `<polygon class="k ${cls} mech" points="${poly(a, b, c, d)}"/><path class="${cls}" d="M${hx},${(a[1] + d[1]) / 2} L${hx},${(a[1] + d[1]) / 2 + 8}"/>`,
    box: [Math.min(a[0], b[0]) - 2, Math.min(a[1], b[1]) - 2, Math.abs(b[0] - a[0]) + 4, Math.max(c[1], d[1]) - Math.min(a[1], b[1]) + 4],
    a, b, c, d };
}
