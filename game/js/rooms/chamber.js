// B3 · THE ROUND TABLE — the centerpiece. The Table meets around a decommissioned 1960s research magnet: a giant iron
// ring wound with copper coil, lying at table height, with the round iron pole face inside it serving as the table top.
// Drawn as a true wireframe torus in one-point perspective (silhouettes and the visible half of every winding).
// Twelve hooded members around the far side, facing the room, each with a lamp on the ring (pose groups seat0…seat11,
// numbered left to right across the screen); Quorum at the head on a dais (hooded; unhooded with his gold when
// G.flags.unhooded); the skull gavel on the table; the Gain Controller on a plinth (front left) with Preston hooded
// beside it, earbuds lit; the knife switch on its iron stand by the service stair (front right).
// G.flags.finale: the ring is on. Windings lit, every small metal thing in the room flying to it.
// G.flags.quorumUp: Quorum rising toward the ring.
import { seg, segC, chip, perspective, hit, arcs, star4 } from "../gfx.js";
import { AUD } from "../figures.js";
import { insignia } from "../cast/act3a.js";
import { hoodSeated, hoodStanding, prestonHooded, quorumUnhooded } from "../cast/act5a.js";

/* ---- camera: eye height E above the floor, viewing distance D (k = D / z). Matches perspective(): kAtY(y) = D / z ---- */
const VPY = 90, E = 200, D = 420;
const pp = perspective(320, VPY, 0.32);
const { kAtY, FY } = pp;
const f = (n) => n.toFixed(1);
const W = (lat, h, z) => { const k = D / z; return [320 + lat * k, VPY + (E - h) * k]; };
const kz = (z) => D / z;
const line = (arr) => "M" + arr.map(p => f(p[0]) + "," + f(p[1])).join(" L");
const pts = (arr) => arr.map(p => f(p[0]) + "," + f(p[1])).join(" ");
const WALL = 420, ZB = D / .32;   // side walls at lateral ±420, back wall depth

/* ---- the magnet: a torus (ring radius RR, tube radius RT, centre height RH) around the pole face ---- */
const RZ = 800, RR = 230, RT = 22, RH = 40, TAU = Math.PI * 2;
const ring3 = (th, ph, R = RR) => { const rr = R + RT * Math.cos(ph); return [rr * Math.cos(th), RH + RT * Math.sin(ph), RZ + rr * Math.sin(th)]; };
const rs = (th, ph) => { const p = ring3(th, ph); return W(p[0], p[1], p[2]); };
const facing = (th, ph) => { const p = ring3(th, ph), c = Math.cos(ph);
  return c * Math.cos(th) * p[0] + Math.sin(ph) * (p[1] - E) + c * Math.sin(th) * p[2] < 0; };
const hidden = (ph) => Math.cos(ph) < -.02 && Math.sin(ph) < -.02;          // the inner underside, under the pole face
// silhouette angles of the tube cross-section at θ: [outer, inner]
function sil(th) {
  const a = RR + RZ * Math.sin(th), b = RH - E, R0 = Math.hypot(a, b), al = Math.atan2(b, a), c = Math.acos(Math.max(-1, Math.min(1, -RT / R0)));
  const p1 = al + c, p2 = al - c;
  return Math.cos(p1) > Math.cos(p2) ? [p1, p2] : [p2, p1];
}
const norm = (ph) => ((ph % TAU) + TAU) % TAU;
const innerPh = (th) => { const p = norm(sil(th)[1]); return p > 0 && p < Math.PI ? p : Math.PI; };   // inner edge: silhouette, or the pole face
const sweep = (a, b, n, fn) => { const o = []; for (let i = 0; i <= n; i++) o.push(fn(a + (b - a) * i / n)); return o; };

function ringHalf(front, on) {
  const [a, b] = front ? [Math.PI, TAU] : [0, Math.PI];
  const outer = sweep(a, b, 72, th => rs(th, sil(th)[0]));
  const inner = sweep(a, b, 72, th => rs(th, front ? innerPh(th) : Math.PI));
  let s = `<polygon class="k" points="${pts([...outer, ...inner.reverse()])}"/>`;
  // the copper windings: the visible part of each turn of the coil
  const N = 84, wc = on ? "hl sG" : "hl sA";
  for (let i = 0; i < N; i++) {
    const th = a + (b - a) * (i + .5) / N;
    let seg_ = [], out = "";
    for (let j = 0; j <= 36; j++) {
      const ph = j / 36 * TAU, ok = facing(th, ph) && !hidden(ph);
      if (ok) seg_.push(rs(th, ph)); else { if (seg_.length > 1) out += line(seg_) + " "; seg_ = []; }
    }
    if (seg_.length > 1) out += line(seg_);
    if (out) s += `<path class="${wc}" d="${out}"/>`;
  }
  // the iron: outer silhouette, the top line, the inner edge
  const oc = on ? "sW" : "sM";
  s += `<path class="${oc}" d="${line(outer)}"/><path class="${oc}" d="${line(inner)}"/>`;
  s += `<path class="hl ${oc}" d="${line(sweep(a, b, 72, th => rs(th, Math.PI / 2)).filter((p, i, arr) => true))}"/>`;
  return s;
}

/* ---- the table top: the magnet's iron pole face, inside the ring ---- */
const disc = (r, h = RH, n = 96) => sweep(0, TAU, n, th => W(r * Math.cos(th), h, RZ + r * Math.sin(th)));
function poleFace(G) {
  const rIn = RR - RT;
  let s = `<polygon class="k sW" points="${pts(disc(rIn))}"/>`;
  // twelve hairline wedges, one to each seat, and the insignia inlaid at the centre (a circle seated around a smaller circle)
  SEATS.forEach(th => { const a = W(40 * Math.cos(th), RH, RZ + 40 * Math.sin(th)), b = W(rIn * Math.cos(th), RH, RZ + rIn * Math.sin(th));
    s += `<path class="hl sD" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`; });
  s += `<polygon class="hl sX" points="${pts(disc(64))}"/><polygon class="hl sX" points="${pts(disc(40))}"/><polygon class="fX" points="${pts(disc(16, RH, 32))}"/>`;
  sweep(0, TAU * 11 / 12, 11, th => th).forEach(th => { const p = W(52 * Math.cos(th), RH, RZ + 52 * Math.sin(th)); s += `<circle class="fX" cx="${f(p[0])}" cy="${f(p[1])}" r=".7"/>`; });
  return s;
}

/* ---- seats: twelve, around the far side, left to right on screen (seat0 = nearest left … seat11 = nearest right) ---- */
const DEG = Math.PI / 180, RS = 300;
const SEATS = [181.5, 166, 150.5, 135, 119.5, 104, 76, 60.5, 45, 29.5, 14, -1.5].map(d => d * DEG);
const seatPos = (th) => { const lat = RS * Math.cos(th), z = RZ + RS * Math.sin(th); const p = W(lat, 0, z); return { x: p[0], y: p[1], k: kz(z), z, lat }; };
// hood pin (sheet 174, 98+34) in screen space, for the finale
const pinAt = (s) => { const q = s.k * AUD; return [s.x + 14 * q, s.y - 55 * q]; };

// a small gooseneck lamp standing on the ring top; lit = bulb on, light falling on the iron
function lamp(th, lit) {
  const p = ring3(th, Math.PI / 2), base = W(p[0], p[1], p[2]), k = kz(p[2]), s = k * 1.7;
  const dir = p[0] > 0 ? -1 : 1, [x, y] = base;
  // (s is the lamp's own scale: lamps are drawn a little large so twelve of them read at the back of the room)
  const tx = x + dir * 9 * s, ty = y - 30 * s;
  const shade = `M${f(tx - 6 * s)},${f(ty + 4 * s)} Q${f(tx)},${f(ty - 7 * s)} ${f(tx + 6 * s)},${f(ty + 4 * s)} Z`;
  const body = (c) => `<ellipse class="hl ${c}" cx="${f(x)}" cy="${f(y)}" rx="${f(6 * s)}" ry="${f(2 * s)}"/>
    <path class="hl ${c}" d="M${f(x)},${f(y)} L${f(x)},${f(y - 24 * s)} Q${f(x)},${f(ty - 3 * s)} ${f(tx)},${f(ty - 3 * s)}"/>`;
  return lit
    ? `${body("sA")}<path class="k sA" d="${shade}"/><circle class="fA" cx="${f(tx)}" cy="${f(ty + 4 * s)}" r="${f(2.2 * s)}"/>
       <path class="hl sA" d="M${f(tx - 4 * s)},${f(ty + 9 * s)} L${f(tx - 7 * s)},${f(ty + 15 * s)} M${f(tx)},${f(ty + 10 * s)} L${f(tx)},${f(ty + 17 * s)} M${f(tx + 4 * s)},${f(ty + 9 * s)} L${f(tx + 7 * s)},${f(ty + 15 * s)}"/>`
    : `${body("sM")}<path class="k sM" d="${shade}"/>`;
}

/* ---- the head of the table: a dais, the Corresponding Author's chair, Quorum ---- */
const HEAD = { z: RZ + 318, lat: 0, h: 26 };
let RISING = "";
function head(G) {
  RISING = "";
  const k = kz(HEAD.z), q = k * AUD;
  const c = (lat, h, z) => W(lat, h, z);
  // the dais: a low block, front face and top
  const z0 = HEAD.z - 34, z1 = HEAD.z + 34, w = 64;
  const fl = c(-w, 0, z0), fr = c(w, 0, z0), tl = c(-w, HEAD.h, z0), tr = c(w, HEAD.h, z0), bl = c(-w, HEAD.h, z1), br = c(w, HEAD.h, z1);
  let s = `<polygon class="k sD mech" points="${pts([tl, tr, br, bl])}"/><polygon class="k sD mech" points="${pts([tl, tr, fr, fl])}"/>`;
  // the throne: a tall pointed back with the insignia lit at its peak
  const [cx, cy] = c(0, HEAD.h, HEAD.z + 14), qk = kz(HEAD.z + 14) * AUD;
  s += `<g transform="translate(${f(cx - 160 * qk)},${f(cy - 187 * qk)}) scale(${qk.toFixed(3)})">
    <path class="k sD" d="M112,187 L112,24 Q112,-14 160,-34 Q208,-14 208,24 L208,187"/><path class="hl sD" d="M120,187 L120,28 Q120,-6 160,-24 Q200,-6 200,28 L200,187"/>
    ${insignia(160, -6, 7)}</g>`;
  const [fx_, fy_] = c(0, HEAD.h, HEAD.z);
  const box = hit(fx_ - 24 * q, fy_ - 176 * q, 48 * q, 176 * q);
  if (G.flags.unhooded && G.flags.quorumUp) {
    // lifted off the dais and drawn in over the back of the ring: two fixed positions, a notch apart, speed dashes trailing
    const up = (z, h) => { const [x, y] = W(0, h, z), kk = kz(z), qq = kk * AUD, bx = W(0, h + 30, z + 40);
      return `${quorumUnhooded(x, y, kk, true)}
      <path class="sW" d="${[-12, -4, 4, 12].map(dx => `M${f(x + dx * qq * 1.6)},${f(y + 4)} L${f(bx[0] + dx * qq * 1.6)},${f(bx[1] + 10)}`).join(" ")}"/>
      <path class="hl sW" d="${[-20, 20].map(dx => `M${f(x + dx * qq)},${f(y - 60 * qq)} L${f(x + dx * qq * 1.3)},${f(y - 60 * qq - 14)}`).join(" ")}"/>`; };
    // drawn over the ring (see draw: quorumRising), not here
    RISING = `<g data-hs="quorum"><g class="pz on" data-g="hum" data-i="0">${up(HEAD.z - 50, 112)}</g><g class="pz" data-g="hum" data-i="1">${up(HEAD.z - 80, 98)}</g>${hit(fx_ - 30 * q, fy_ - 120 - 190 * q, 60 * q, 190 * q + 80)}</g>`;
  } else if (G.flags.unhooded) s += `<g data-hs="quorum">${quorumUnhooded(fx_, fy_, kz(HEAD.z))}${box}</g>`;
  else s += `<g data-hs="quorum">${hoodStanding(fx_, fy_, kz(HEAD.z), !G.flags.finale, { trim: "sA" })}${box}</g>`;
  return s;
}

/* ---- the skull gavel on its sounding block, near the head ---- */
function gavel(G) {
  const z = RZ + 150, k = kz(z), [x, y] = W(-14, RH, z), s = k * 1.6;
  return `<g data-hs="gavel">
    <ellipse class="k sA" cx="${f(x + 10 * s)}" cy="${f(y)}" rx="${f(9 * s)}" ry="${f(2.6 * s)}"/>
    <path class="sA" d="M${f(x - 2 * s)},${f(y - 3 * s)} L${f(x + 22 * s)},${f(y - 6 * s)}"/>
    <path class="k sW" d="M${f(x - 7 * s)},${f(y - 3 * s)} C${f(x - 9 * s)},${f(y - 13 * s)} ${f(x + 5 * s)},${f(y - 14 * s)} ${f(x + 4 * s)},${f(y - 5 * s)} L${f(x + 2 * s)},${f(y - 1 * s)} L${f(x - 5 * s)},${f(y - 1 * s)} Z"/>
    <circle class="fW" cx="${f(x - 3.6 * s)}" cy="${f(y - 7 * s)}" r="${f(1.1 * s)}"/><circle class="fW" cx="${f(x + .6 * s)}" cy="${f(y - 7.4 * s)}" r="${f(1.1 * s)}"/>
    <path class="hl sW" d="M${f(x - 3.4 * s)},${f(y - 2 * s)} L${f(x - 3.4 * s)},${f(y - .6 * s)} M${f(x - 1.4 * s)},${f(y - 2 * s)} L${f(x - 1.4 * s)},${f(y - .6 * s)} M${f(x + .6 * s)},${f(y - 2 * s)} L${f(x + .6 * s)},${f(y - .6 * s)}"/>
    ${hit(x - 12 * s, y - 18 * s, 38 * s, 22 * s)}</g>`;
}

/* ---- the room: a dark vault, floor grid, the old annex lettering, the NRT motto, the door to the antechamber ---- */
function room(G) {
  let s = "";
  const zs = [440, 500, 580, 680, 800, 960, 1120, ZB];
  for (let lat = -WALL; lat <= WALL; lat += 70) { const a = W(lat, 0, 400), b = W(lat, 0, ZB); s += `<path class="hl sN" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`; }
  zs.forEach(z => { const a = W(-WALL, 0, z), b = W(WALL, 0, z); s += `<path class="hl sN" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`; });
  // back wall and corners
  const TL = W(-WALL, 290, ZB), TR = W(WALL, 290, ZB), BL = W(-WALL, 0, ZB), BR = W(WALL, 0, ZB);
  s += `<polygon class="sM" points="${pts([TL, TR, BR, BL])}"/>`;
  [[TL, W(-WALL, 290, 300)], [TR, W(WALL, 290, 300)], [BL, W(-WALL, 0, 300)], [BR, W(WALL, 0, 300)]].forEach(([a, b]) => s += `<path class="sM" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`);
  // vault ribs across the ceiling (dim)
  [560, 760, 1000].forEach(z => { const a = W(-WALL, 290, z), b = W(WALL, 290, z), c = W(0, 330, z);
    s += `<path class="hl sD" d="M${f(a[0])},${f(a[1])} Q${f(c[0])},${f(c[1] - (b[1] - c[1]) * .2)} ${f(b[0])},${f(b[1])}"/>`; });
  // the back wall: the original stencil, painted over by the Table's motto
  const bw = (lat, h) => W(lat, h, ZB);
  { const [x, y] = bw(-300, 250); s += seg("PSYCHOPHYSICS ANNEX  MAGNET 1  1968", x, y, 4.2, "sD", .7); }
  { const [x, y] = bw(0, 205); s += segC("RESEARCH WITHOUT END", x, y, 7.5, "sM", 1); }
  { const [x, y] = bw(0, 182); s += segC("EST. 1974", x, y, 4, "sD", .7); }
  // high on the back wall, the old field-strength dial (needle live in the finale)
  { const [x, y] = bw(250, 228), r = 9;
    s += `<circle class="k sM" cx="${f(x)}" cy="${f(y)}" r="${r}"/>${[0, 1, 2, 3, 4].map(i => { const a = Math.PI * (1 + i / 4); return `<path class="hl sM" d="M${f(x + Math.cos(a) * r * .7)},${f(y + Math.sin(a) * r * .7)} L${f(x + Math.cos(a) * r)},${f(y + Math.sin(a) * r)}"/>`; }).join("")}
      ${G.flags.finale ? `<path class="needle sR" data-cx="${f(x)}" data-cy="${f(y)}" d="M${f(x)},${f(y)} L${f(x + 5)},${f(y - 3)}"/>` : `<path class="sM" d="M${f(x)},${f(y)} L${f(x - 6)},${f(y - 1)}"/>`}
      ${seg("TESLA", x - 6, y + r + 2, 2.6, "sD", .5)}`; }
  // the field-safety line painted on the floor around the magnet
  s += `<polygon class="hl dash sA" points="${pts(sweep(0, TAU, 96, th => W(352 * Math.cos(th), 0, RZ + 352 * Math.sin(th))))}"/>`;
  { const [x, y] = W(150, 0, 452); s += seg("NO METAL BEYOND THIS LINE", x, y - 9, 3.6, "sA", .6); }
  // left wall: the arched door back to the antechamber, insignia over it
  const z0 = 640, z1 = 760, a = W(-WALL, 0, z0), b = W(-WALL, 150, z0), c = W(-WALL, 150, z1), d = W(-WALL, 0, z1), m = W(-WALL, 182, (z0 + z1) / 2);
  s += `<g data-hs="door"><path class="k sW mech" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])} Q${f(m[0])},${f(m[1])} ${f(c[0])},${f(c[1])} L${f(d[0])},${f(d[1])} Z"/>
    <path class="hl sW" d="${line([W(-WALL, 0, (z0 + z1) / 2), W(-WALL, 160, (z0 + z1) / 2)])}"/>
    ${insignia(m[0], m[1] - 10, 3.4)}${chip("ANTECHAMBER", Math.max(4, m[0] - 30), m[1] - 30, 3.8, "fW")}
    ${hit(Math.min(a[0], d[0]) - 4, m[1] - 26, Math.abs(a[0] - d[0]) + 30, a[1] - m[1] + 28)}</g>`;
  return s;
}

/* ---- the service stair: a doorway in the right wall, front right, steps going down to the plant ---- */
const STAIR = { z0: 600, z1: 720, h: 150 };
function stair(G) {
  const { z0, z1, h } = STAIR, c = (hh, z) => W(WALL, hh, z);
  const a = c(0, z0), b = c(h, z0), cc = c(h, z1), d = c(0, z1);
  let s = `<g data-hs="stair"><clipPath id="stairClip"><polygon points="${pts([a, b, cc, d])}"/></clipPath><polygon class="k sW mech" points="${pts([a, b, cc, d])}"/>`;
  // inside, the stair dropping away from the landing: a stepped stringer and its handrail, in the wall's plane
  const prof = [], n = 5, dz = (z1 - z0 - 24) / n;
  for (let i = 0; i < n; i++) { const z = z0 + 12 + i * dz, hh = 66 - i * 14; prof.push(W(WALL + 8, hh, z), W(WALL + 8, hh, z + dz)); prof.push(W(WALL + 8, hh - 14, z + dz)); }
  s += `<g clip-path="url(#stairClip)"><path class="sM" d="${line(prof)}"/><path class="hl sM" d="${line([W(WALL + 8, 112, z0 + 12), W(WALL + 8, 112 - 14 * n, z1 - 12)])}"/>
    <path class="hl sD" d="${line([W(WALL + 8, 66, z0 + 12), W(WALL + 8, 112, z0 + 12)])}"/></g>`;
  { const [x, y] = W(WALL, 128, (z0 + z1) / 2 - 10); s += `<path class="sW" d="M${f(x)},${f(y - 8)} L${f(x)},${f(y + 4)} M${f(x - 4)},${f(y)} L${f(x)},${f(y + 4)} L${f(x + 4)},${f(y)}"/>`; }
  s += `<path class="sW" d="${line([W(WALL - 2, 0, z0 - 4), W(WALL - 2, 70, z0 - 4), W(WALL - 2, 70, z0 + 30)])}"/>`;
  { const [x, y] = c(h + 26, (z0 + z1) / 2); s += chip("SERVICE STAIR", x - 40, y - 4, 3.6, "fW") + seg("DOWN · PLANT", x - 40, y + 4.4, 3, "sM", .5); }
  return s + hit(d[0] - 4, b[1] - 18, a[0] - d[0] + 8, a[1] - b[1] + 20) + `</g>`;
}

/* ---- the knife switch on its cast-iron stand by the stair: three blades and a crossbar; open = tipped out ---- */
const SW = { lat: 300, z: 610 };
function knifeSwitch(G) {
  const k = kz(SW.z), [x, y] = W(SW.lat, 0, SW.z), s = k;
  const thrown = !!G.flags.finale;
  const X = (dx) => x + dx * s, Y = (h) => y - h * s;
  let o = `<g data-hs="switch">
    <path class="sM mech" d="M${f(X(-6))},${f(Y(0))} L${f(X(-6))},${f(Y(70))} M${f(X(6))},${f(Y(0))} L${f(X(6))},${f(Y(70))}"/><path class="hl sM" d="M${f(X(-18))},${f(Y(0))} L${f(X(18))},${f(Y(0))}"/>
    <rect class="k sW mech" x="${f(X(-34))}" y="${f(Y(170))}" width="${f(68 * s)}" height="${f(100 * s)}"/>
    <rect class="hl sW mech" x="${f(X(-28))}" y="${f(Y(164))}" width="${f(56 * s)}" height="${f(88 * s)}"/>`;
  // jaws at the top, hinges low, for three blades. Lever down = off; thrown = up into the jaws.
  [-16, 0, 16].forEach(dx => { o += `<path class="sA mech" d="M${f(X(dx - 3))},${f(Y(154))} L${f(X(dx - 3))},${f(Y(142))} M${f(X(dx + 3))},${f(Y(154))} L${f(X(dx + 3))},${f(Y(142))}"/>
    <path class="hl sA" d="M${f(X(dx))},${f(Y(154))} L${f(X(dx))},${f(Y(166))}"/><circle class="k sA" cx="${f(X(dx))}" cy="${f(Y(108))}" r="${f(2.6 * s)}"/>`; });
  if (thrown) {
    [-16, 0, 16].forEach(dx => { o += `<path class="sA" d="M${f(X(dx))},${f(Y(108))} L${f(X(dx))},${f(Y(150))}"/>`; });
    o += `<path class="k sW" d="M${f(X(-24))},${f(Y(134))} L${f(X(24))},${f(Y(134))} L${f(X(24))},${f(Y(128))} L${f(X(-24))},${f(Y(128))} Z"/>
      <path class="k sW" d="M${f(X(-4))},${f(Y(128))} L${f(X(-4))},${f(Y(116))} L${f(X(4))},${f(Y(116))} L${f(X(4))},${f(Y(128))}"/>
      ${star4(X(-16), Y(152), 4 * s + 2, "sG")}${star4(X(16), Y(154), 3 * s + 2, "sG")}${arcs(X(30), Y(150), 1, "sG", 2, .7)}${arcs(X(-30), Y(150), -1, "sG", 2, .7)}`;
  } else {
    [-16, 0, 16].forEach(dx => { o += `<path class="sA" d="M${f(X(dx))},${f(Y(108))} L${f(X(dx * 1.1))},${f(Y(78))}"/>`; });
    o += `<path class="k sW" d="M${f(X(-26))},${f(Y(82))} L${f(X(26))},${f(Y(82))} L${f(X(26))},${f(Y(76))} L${f(X(-26))},${f(Y(76))} Z"/>
      <path class="k sW" d="M${f(X(-4))},${f(Y(76))} L${f(X(-4))},${f(Y(62))} L${f(X(4))},${f(Y(62))} L${f(X(4))},${f(Y(76))}"/>`;
  }
  o += seg("MAGNET 1", X(-26), Y(166) + 2, 3, "sW", .5);
  o += G.flags.magnetCharged || thrown ? chip("CHARGED", X(-14), Y(58), 3.4, "fG") : seg("COLD", X(-8), Y(58) + 1, 3.2, "sD", .5);
  o += chip("DANGER", X(-26), Y(194), 3.6, "fX");
  // busbars from the stand to the ring, along the floor
  return o + hit(X(-38), Y(200), 76 * s, 200 * s) + `</g>`;
}
function busbars(G) {
  const c = G.flags.finale ? "sG" : "sA";
  const a0 = W(SW.lat - 6, 0, SW.z), a1 = W(SW.lat - 6, 0, RZ - 10), a2 = W(RR + RT, 6, RZ - 10);
  const b0 = W(SW.lat + 6, 0, SW.z), b1 = W(SW.lat + 6, 0, RZ + 10), b2 = W(RR + RT, 6, RZ + 10);
  return `<path class="hl ${c}" d="${line([a0, a1, a2])} ${line([b0, b1, b2])}"/>`;
}

/* ---- the Gain Controller on its plinth (front left), Preston hooded beside it ---- */
const CON = { lat: -150, z: 560 }, PRE = { lat: -262, z: 590 };
function consoleGroup(G) {
  const k = kz(CON.z), c = (l, h, z) => W(l, h, z), w = 32, d = 26, ph = 64;
  const fl = c(CON.lat - w, 0, CON.z - d), fr = c(CON.lat + w, 0, CON.z - d), tl = c(CON.lat - w, ph, CON.z - d), tr = c(CON.lat + w, ph, CON.z - d);
  const bl = c(CON.lat - w, ph, CON.z + d), br = c(CON.lat + w, ph, CON.z + d);
  let s = `<g data-hs="console"><polygon class="k sM mech" points="${pts([tl, tr, br, bl])}"/><polygon class="k sM mech" points="${pts([tl, tr, fr, fl])}"/>
    <path class="hl sM" d="${line([c(CON.lat - w + 6, 8, CON.z - d), c(CON.lat + w - 6, 8, CON.z - d)])} ${line([c(CON.lat - w + 6, ph - 8, CON.z - d), c(CON.lat + w - 6, ph - 8, CON.z - d)])}"/>`;
  const [px, py] = c(CON.lat, ph, CON.z - 4), s2 = k;
  const box = (ox, oy, tilt = 0) => `<g transform="translate(${f(ox)},${f(oy)}) rotate(${tilt}) scale(${s2.toFixed(3)})">
      <path class="k sW mech" d="M-26,0 L26,0 L22,-34 L-22,-34 Z"/><path class="hl sW mech" d="M-22,-30 L22,-30"/>
      <circle class="k sW" cx="-8" cy="-16" r="9"/>${[0, 1, 2, 3, 4, 5, 6].map(i => { const a = Math.PI * (.8 + i * .24); return `<path class="hl sW" d="M${f(-8 + Math.cos(a) * 10.5)},${f(-16 + Math.sin(a) * 10.5)} L${f(-8 + Math.cos(a) * 12.5)},${f(-16 + Math.sin(a) * 12.5)}"/>`; }).join("")}
      <path class="sR" d="M-8,-16 L-1,-22"/><circle class="fW" cx="-8" cy="-16" r="1.4"/>
      <rect class="hl sG mech" x="6" y="-26" width="12" height="20"/><rect class="fG" x="8" y="-20" width="8" height="12"/>
      ${seg("GAIN", 4, -32, 4.2, "sW", .7)}${seg("MAX", -15, -5, 3.2, "sR", .6)}${insignia(0, -40, 3.4)}
      <path class="hl sG" d="M0,0 C4,10 -6,16 2,26"/></g>`;
  if (G.flags.finale) {
    // ripped off its console: torn leads and sparks on the plinth; the box itself is up on the ring (see finale)
    s += `<path class="sG" d="M${f(px - 6 * k)},${f(py)} L${f(px - 10 * k)},${f(py - 12 * k)} L${f(px - 4 * k)},${f(py - 18 * k)} M${f(px + 6 * k)},${f(py)} L${f(px + 12 * k)},${f(py - 14 * k)}"/>
      ${star4(px - 4 * k, py - 20 * k, 4, "sG")}${star4(px + 13 * k, py - 16 * k, 3, "sW")}`;
  } else s += box(px, py);
  const xs = [fl[0], fr[0]], top = py - 50 * k;
  s += `${seg("GAIN CONTROLLER", fl[0] + 2, fl[1] - ph * k * .62, 2.8, "sD", .5)}${hit(Math.min(...xs) - 4, top, Math.abs(fr[0] - fl[0]) + 8, fl[1] - top)}</g>`;
  return s;
}
function prestonGroup(G) {
  const [x, y] = W(PRE.lat, 0, PRE.z), k = kz(PRE.z), q = k * AUD;
  return `<g data-hs="preston">${prestonHooded(x, y, k, !!G.flags.finale)}${hit(x - 26 * q, y - 182 * q, 52 * q, 182 * q)}</g>`;
}

/* ---- Nell's place: a low stool at the foot of the table (members get thrones; guests get a stool) ---- */
const FOOT = { z: RZ - 290 };
function footSeat(G) {
  const [x, y] = W(0, 0, FOOT.z), k = kz(FOOT.z), r = 20, h = 46, c = (l, hh, z) => W(l, hh, z);
  const top = sweep(0, TAU, 24, th => c(r * Math.cos(th), h, FOOT.z + r * Math.sin(th)));
  const legs = [[-14, -8], [14, -8], [0, 14]].map(([l, dz]) => line([c(l * .7, h, FOOT.z + dz * .7), c(l, 0, FOOT.z + dz)])).join(" ");
  const [lx, ly] = c(0, h, FOOT.z - r);
  return `<g data-hs="table"><path class="sD" d="${legs}"/><polygon class="k sW" points="${pts(top)}"/>
    ${chip("GUEST", lx - 11, ly + 3, 3.6, "fW")}${hit(x - 26 * k, ly - 12, 52 * k, y - ly + 14)}</g>`;
}

/* ---- the finale: the ring is on. Things fly to it as speed dashes; what's arrived is stuck to the iron. ---- */
function flyer(from, to, t1, t2, glyph) {
  const at = (t) => [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
  const dash = (t) => { const a = at(Math.max(0, t - .32)), b = at(t - .08); return `<path class="hl sW" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>`; };
  const pose = (t) => { const p = at(t), dx = (to[0] - from[0]), dy = (to[1] - from[1]), n = Math.hypot(dx, dy) || 1, ox = -dy / n * 2.4, oy = dx / n * 2.4;
    return `${dash(t)}<path class="hl sW" d="M${f(at(t - .26)[0] + ox)},${f(at(t - .26)[1] + oy)} L${f(at(t - .1)[0] + ox)},${f(at(t - .1)[1] + oy)} M${f(at(t - .26)[0] - ox)},${f(at(t - .26)[1] - oy)} L${f(at(t - .1)[0] - ox)},${f(at(t - .1)[1] - oy)}"/>${glyph(p[0], p[1])}`; };
  return `<g class="pz on" data-g="hum" data-i="0">${pose(t1)}</g><g class="pz" data-g="hum" data-i="1">${pose(t2)}</g>`;
}
const bit = (cls, r = 1.6) => (x, y) => `<circle class="k ${cls}" cx="${f(x)}" cy="${f(y)}" r="${r}"/>`;
function finale(G) {
  let s = "";
  // what has already arrived: clasps, pins, cufflinks, medals, stuck all round the top of the iron
  for (let i = 0; i < 46; i++) {
    const th = (i * 137.5 % 360) * DEG, ph = Math.PI / 2 + ((i * 53) % 7 - 3) * .18;
    if (!facing(th, ph)) continue;
    const [x, y] = rs(th, ph), k = kz(ring3(th, ph)[2]);
    s += i % 5 === 0 ? `<circle class="k sA" cx="${f(x)}" cy="${f(y - 2 * k)}" r="${f(3.4 * k)}"/>` : `<circle class="${i % 3 ? "fW" : "fA"}" cx="${f(x)}" cy="${f(y)}" r="${f(1.6 * k + .3)}"/>`;
  }
  // in flight, from every seat
  SEATS.forEach((th, i) => {
    const sp = seatPos(th), from = pinAt(sp), to = rs(th, Math.PI * .6);
    s += flyer(from, to, .45 + (i % 3) * .08, .78, i % 2 ? bit("sX") : bit("sA"));
  });
  // Preston's earbuds, and the Gain Controller itself, off its console
  { const [x, y] = W(PRE.lat, 0, PRE.z), q = kz(PRE.z) * AUD, ear = [x - 17 * q, y - 127 * q], ear2 = [x + 17 * q, y - 127 * q];
    const to = rs(196 * DEG, Math.PI * .55), to2 = rs(188 * DEG, Math.PI * .5);
    s += flyer(ear, to, .4, .72, (a, b) => `<circle class="fG" cx="${f(a)}" cy="${f(b)}" r="1.8"/>`) + flyer(ear2, to2, .5, .82, (a, b) => `<circle class="fG" cx="${f(a)}" cy="${f(b)}" r="1.8"/>`); }
  { const k = kz(CON.z), [px, py] = W(CON.lat, 64, CON.z - 4), to = rs(206 * DEG, Math.PI * .5);
    const g = (x, y) => `<g transform="translate(${f(x)},${f(y)}) rotate(-24) scale(${(k * .9).toFixed(3)})"><path class="k sW mech" d="M-26,0 L26,0 L22,-34 L-22,-34 Z"/><circle class="k sW" cx="-8" cy="-16" r="9"/><rect class="fG" x="8" y="-20" width="8" height="12"/>${insignia(0, -40, 3.4)}</g>`;
    s += flyer([px, py - 20 * k], to, .42, .66, g); }
  // the medals on Quorum's robe strain at the ring
  // vibration: ((( ))) off both ends of the ring, two poses
  const L = rs(Math.PI, 0), R = rs(0, 0);
  s += `<g class="pz on" data-g="hum" data-i="0">${arcs(L[0] - 6, L[1], -1, "sG", 3, 1)}${arcs(R[0] + 6, R[1], 1, "sG", 3, 1)}</g>
    <g class="pz" data-g="hum" data-i="1">${arcs(L[0] - 10, L[1], -1, "sG", 2, 1.3)}${arcs(R[0] + 10, R[1], 1, "sG", 2, 1.3)}</g>`;
  return s;
}

function back(G) {
  const on = !!G.flags.finale;
  let s = room(G);
  // seats far to near (the ring's back half covers their laps), with the head of the table among them
  const order = SEATS.map((th, i) => ({ th, i, z: seatPos(th).z })).sort((a, b) => b.z - a.z);
  let seats = "";
  let headDone = false;
  order.forEach(({ th, i, z }) => {
    if (!headDone && z < HEAD.z) { seats += head(G); headDone = true; }
    const sp = seatPos(th);
    seats += hoodSeated(sp.x, sp.y, sp.k, !on);
  });
  if (!headDone) seats += head(G);
  s += busbars(G);
  s += seats + `<g data-hs="table">${ringHalf(false, on)}</g>`;
  s += `<g data-hs="table">${poleFace(G)}${hit(...tableBox())}</g>`;
  if (!(G.flags.gotGavel || G.flags.gavelTaken || (G.inv && Object.values(G.inv).some(l => Array.isArray(l) && l.includes("gavel"))))) s += gavel(G);
  s += `<g data-hs="table">${ringHalf(true, on)}</g>`;
  SEATS.forEach((th, i) => {
    s += `<g class="pz on" data-g="seat${i}" data-i="0">${lamp(th, false)}</g><g class="pz" data-g="seat${i}" data-i="1">${lamp(th, true)}</g>`;
  });
  return s;
}
function tableBox() {
  const o = sweep(0, TAU, 48, th => rs(th, 0)), xs = o.map(p => p[0]), ys = o.map(p => p[1]);
  const x0 = Math.min(...xs), y0 = (Math.min(...ys) + Math.max(...ys)) / 2 - 10;
  return [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0 + 10];
}

export default {
  id: "chamber", name: "B3 · THE ROUND TABLE", pp,
  floor: { yMin: 252, yMax: 287, margin: 16 },
  entries: { fromAntechamber: [72, 268, 1], fromStair: [572, 268, -1] },
  draw(G) {
    const yS = (z) => W(0, 0, z)[1];
    const b = back(G);
    return { back: b, sortables: [
      { depth: 0, svg: RISING },
      { depth: yS(PRE.z), svg: prestonGroup(G) },
      { depth: yS(CON.z - 26), svg: consoleGroup(G) },
      { depth: yS(SW.z), svg: knifeSwitch(G) },
      { depth: yS(STAIR.z1), svg: stair(G) },
      { depth: yS(FOOT.z), svg: footSeat(G) },
      { depth: 999, svg: G.flags.finale ? `<g style="pointer-events:none">${finale(G)}</g>` : "" },
    ] };
  },
  stand: { table: [320, 268], quorum: [300, 256], console: [236, 262], preston: [150, 262], gavel: [330, 256],
    switch: [486, 262], stair: [580, 266], door: [64, 266] },
  labels: {
    night: { table: { use: "TAKE YOUR SEAT" }, switch: { use: "THROW IT" }, gavel: { use: "TAKE" }, stair: { go: "GO DOWN" },
      door: { go: "GO OUT" }, console: { use: "TURN DOWN" }, preston: { use: "PULL HOOD" }, quorum: { use: "BOW" } },
    day: { table: { use: "TAKE YOUR SEAT" }, switch: { use: "THROW IT" }, gavel: { use: "TAKE" }, stair: { go: "GO DOWN" },
      door: { go: "GO OUT" }, console: { use: "TURN DOWN" }, preston: { use: "PULL HOOD" }, quorum: { use: "BOW" } },
    morris: { table: { use: "CLIMB ON" }, console: { use: "CHEW WIRES" }, gavel: { use: "SNIFF" }, stair: { go: "SCURRY DOWN" }, door: { go: "SCURRY OUT" } },
  },
};
