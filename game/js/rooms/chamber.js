// B3 · THE ROUND TABLE — the centerpiece. The Table meets around a decommissioned 1960s research magnet: a giant iron
// ring wound with copper coil, lying at table height, with the round iron pole face inside it serving as the table top.
// Drawn as a true wireframe torus in one-point perspective (silhouettes and the visible half of every winding).
// Twelve hooded members around the far side, facing the room, each with a lamp on the ring (pose groups seat0…seat11,
// numbered left to right across the screen); Quorum at the head on a dais (hooded; unhooded with his gold when
// G.flags.unhooded); the skull gavel on the table; the Gain Controller on a plinth (front left) with Preston hooded
// beside it, earbuds lit; the knife switch on its iron stand by the service stair (front right).
// G.flags.finale: the ring is on. Windings lit, every small metal thing in the room flying to it.
// G.flags.quorumUp: Quorum rising toward the ring.
// G.flags.creak: the 3T in B1 is coming down. Cracks spread across the ceiling over the table round the curved belly of
// something enormous bulging through it; dust and water fall (pose group "drip"), ((( ))) (pose group "hum").
// G.flags.crash (wins over creak): the 3T lies smashed into the Round Table under a ragged hole in the ceiling (bent rebar,
// dangling conduit, the chilled water pouring), the table split, the ring dented, the console crushed, the hoods knocked
// over, Quorum's feet and a few gold medals sticking out of the bore, Morris peeking down over the edge of the hole.
import { seg, segC, chip, perspective, hit, arcs, star4 } from "../gfx.js";
import { AUD, morrisPeek } from "../figures.js";
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
// crash: where the 3T came down on the ring, [angle, depth]; the iron is pressed down and squashed out there
let DENTS = [];
const dentAt = (th) => DENTS.reduce((s, [t, d]) => { const a = Math.atan2(Math.sin(th - t), Math.cos(th - t)); return s + d * Math.exp(-((a / .3) ** 2)); }, 0);
const ring3 = (th, ph, R = RR) => { const dn = DENTS.length ? dentAt(th) : 0, rr = R + RT * Math.cos(ph) * (1 + dn / 50);
  return [rr * Math.cos(th), RH + RT * Math.sin(ph) - dn * (.55 + .45 * Math.sin(ph)), RZ + rr * Math.sin(th)]; };
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
  if (G.flags.crash) return s;   // the head of the table is empty: Quorum is in the bore (see scanner)
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
  if (G.flags.crash) {
    s = `<g data-hs="console">` + crushedConsole(G);
    return s + `${hit(Math.min(fl[0], fr[0]) - 6, fl[1] - 60 * k, Math.abs(fr[0] - fl[0]) + 12, 60 * k + 4)}</g>`;
  }
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
  if (!G.flags.crash) { const k = kz(CON.z), [px, py] = W(CON.lat, 64, CON.z - 4), to = rs(206 * DEG, Math.PI * .5);
    const g = (x, y) => `<g transform="translate(${f(x)},${f(y)}) rotate(-24) scale(${(k * .9).toFixed(3)})"><path class="k sW mech" d="M-26,0 L26,0 L22,-34 L-22,-34 Z"/><circle class="k sW" cx="-8" cy="-16" r="9"/><rect class="fG" x="8" y="-20" width="8" height="12"/>${insignia(0, -40, 3.4)}</g>`;
    s += flyer([px, py - 20 * k], to, .42, .66, g); }
  // the medals on Quorum's robe strain at the ring
  // vibration: ((( ))) off both ends of the ring, two poses
  const L = rs(Math.PI, 0), R = rs(0, 0);
  s += `<g class="pz on" data-g="hum" data-i="0">${arcs(L[0] - 6, L[1], -1, "sG", 3, 1)}${arcs(R[0] + 6, R[1], 1, "sG", 3, 1)}</g>
    <g class="pz" data-g="hum" data-i="1">${arcs(L[0] - 10, L[1], -1, "sG", 2, 1.3)}${arcs(R[0] + 10, R[1], 1, "sG", 2, 1.3)}</g>`;
  return s;
}

/* ======================================================================
 *  THE DROP. Shared bits: a zigzag crack through screen points; the ceiling over the table, centred above it.
 * ====================================================================== */
const CH = 316, HC = { lat: 10, z: 800 };
const cw = (lat, h, z) => W(HC.lat + lat, h, HC.z + z);
function jag(pts, cls = "sW", amp = 1.4, seed = 1) {
  const o = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, m = Math.max(2, Math.round(d / 6));
    for (let j = 1; j < m; j++) { const t = j / m, z = (((i * 7 + j * 13 + seed * 5) % 5) - 2) * amp; o.push([a[0] + dx * t + nx * z, a[1] + dy * t + ny * z]); }
    o.push(b);
  }
  return `<path class="${cls}" d="${line(o)}"/>`;
}
// a chunk of concrete: a jagged black lump with a crack, size r (screen units)
function chunk(x, y, r, seed = 0, cls = "sM") {
  const p = sweep(0, 6, 6, i => { const a = i / 7 * TAU + seed, rr = r * (.7 + ((i * 5 + seed * 3) % 4) * .12); return [x + Math.cos(a) * rr * 1.3, y - r * .55 + Math.sin(a) * rr * .8]; });
  return `<polygon class="k ${cls}" points="${pts(p.slice(0, 7))}"/><path class="hl ${cls}" d="M${f(x - r * .4)},${f(y - r * .9)} L${f(x)},${f(y - r * .5)} L${f(x + r * .2)},${f(y - r * .1)}"/>`;
}

/* ---- creak: the 3T's belly is coming through the ceiling over the table: a huge cylinder lying front to back (its
 *      end toward us), pressed down through the plaster. Cracks run out from where it's tearing loose. ---- */
const BR = 300, BDp = 82, BZ0 = -150, BZ1 = 165, BHALF = Math.sqrt(BR * BR - (BR - BDp) ** 2);
const bellyH = (x) => CH + BR - BDp - Math.sqrt(Math.max(0, BR * BR - x * x));
const bellyArc = (z, x0 = -BHALF, x1 = BHALF, n = 36) => sweep(x0, x1, n, x => cw(x, bellyH(x), z));
function creakCeiling() {
  let s = "";
  // cracks running out across the vault from where it's tearing through
  const foot = (t) => { const x = Math.cos(t) * (BHALF + 10), z = t < Math.PI ? BZ1 + 10 : BZ0 - 10; return [x, z]; };
  [[.15, 1.7], [.7, 1.5], [1.2, 1.6], [1.9, 1.5], [2.5, 1.6], [3.0, 1.7], [3.5, 1.5], [4.2, 1.45], [5.0, 1.5], [5.6, 1.6], [6.1, 1.5]].forEach(([t, m], i) => {
    const [x, z] = foot(t), P0 = (mm, dt = 0) => cw(x * mm + dt * 40, CH, z * (1 + (mm - 1) * .6));
    s += jag([P0(1), P0((1 + m) / 2, i % 2 ? .4 : -.4), P0(m, i % 2 ? -.2 : .3)], "sW", 1.2, i);
    s += jag([P0((1 + m) / 2, i % 2 ? .4 : -.4), P0(m * .92, i % 2 ? 1 : -1)], "hl sW", 1, i + 3);
  });
  // the belly: the near end (a flat cap, the flare ring of its cover) and the underside running back, banded
  const front = bellyArc(BZ0), back = bellyArc(BZ1);
  s += `<polygon class="k sW" points="${pts([...front, cw(BHALF, CH, BZ1), ...back.slice().reverse(), cw(-BHALF, CH, BZ1)])}"/>`;
  [-.6, -.2, .2, .6].forEach(t => { const z = (BZ0 + BZ1) / 2 + t * (BZ1 - BZ0) / 2; s += `<path class="hl ${Math.abs(t) < .3 ? "sW" : "sM"}" d="${line(bellyArc(z, -BHALF * .98, BHALF * .98))}"/>`; });
  [-120, -60, 0, 60, 120].forEach(x => s += `<path class="hl sM" d="${line([cw(x, bellyH(x), BZ0), cw(x, bellyH(x), BZ1)])}"/>`);
  s += `<polygon class="k sW" points="${pts([...front, cw(BHALF, CH, BZ0), cw(-BHALF, CH, BZ0)])}"/>`;
  { const ch = CH + BR - BDp, ring = (r) => { const h0 = Math.sqrt(Math.max(0, r * r - (ch - CH) ** 2)); return sweep(-h0, h0, 28, x => cw(x, ch - Math.sqrt(Math.max(0, r * r - x * x)), BZ0 - 1)); };
    s += `<path class="hl sW" d="${line(ring(BR - 16))}"/><path class="hl sM" d="${line(ring(BR - 30))}"/>`; }
  { const [x, y] = cw(-60, bellyH(-60), (BZ0 + BZ1) / 2 - 20); s += chip("ZONE IV", +f(x - 12), +f(y - 3), 4, "fR"); }
  // the plaster it's coming through: torn edges, flaps hanging off both sides and the front
  s += jag([cw(-BHALF - 6, CH, BZ1), cw(-BHALF - 6, CH, BZ0 - 6), cw(BHALF + 6, CH, BZ0 - 6), cw(BHALF + 6, CH, BZ1)], "sW", 1.6, 2);
  [[-BHALF - 4, BZ0 + 40, -1], [BHALF + 4, BZ0 + 70, 1], [-50, BZ0 - 4, 0], [70, BZ0 - 4, 0]].forEach(([x, z, sd], i) => {
    const a = cw(x, CH, z), b = cw(x + (sd ? sd * 4 : 26), CH, z + (sd ? 40 : 0)), c = [b[0] + sd * 3, b[1] + 9 + i * 2], d = [a[0] + sd * 4 + 4, a[1] + 12];
    s += `<polygon class="k sM" points="${pts([a, b, c, d])}"/><path class="hl sM" d="M${f((a[0] + d[0]) / 2)},${f((a[1] + d[1]) / 2)} L${f((b[0] + c[0]) / 2)},${f((b[1] + c[1]) / 2)}"/>`;
  });
  // ((( ))) off both sides: the ceiling is singing
  const L0 = cw(-BHALF - 40, CH - 30, BZ0), R0 = cw(BHALF + 40, CH - 30, BZ0);
  s += `<g class="pz on" data-g="hum" data-i="0">${arcs(L0[0], L0[1], -1, "sW", 3, .9)}${arcs(R0[0], R0[1], 1, "sW", 3, .9)}</g>
    <g class="pz" data-g="hum" data-i="1">${arcs(L0[0] - 5, L0[1], -1, "sW", 2, 1.2)}${arcs(R0[0] + 5, R0[1], 1, "sW", 2, 1.2)}</g>`;
  return s;
}
// what falls from it, over everything: water and dust from the split down onto the Table, two poses
function creakFall() {
  const cols = [-110, -55, 0, 50, 105, 150, -150];
  const pose = (p) => cols.map((x, i) => {
    const top = cw(x, bellyH(x) - 1, BZ1 - 10 - (i % 3) * 30), bot = W(HC.lat + x * .9, RH, HC.z + (i % 3 - 1) * 60), at = (t) => [top[0] + (bot[0] - top[0]) * t, top[1] + (bot[1] - top[1]) * t];
    return [.12, .42, .72].map((t0, j) => { const t = t0 + p * .15 + (i % 2) * .05, [x_, y_] = at(t);
      return (i + j) % 2 ? `<path class="sB" d="M${f(x_)},${f(y_)} L${f(x_)},${f(y_ + 3.4)}"/>`
        : `<circle class="fM" cx="${f(x_ - 1.5)}" cy="${f(y_)}" r=".8"/><circle class="fM" cx="${f(x_ + 1.2)}" cy="${f(y_ + 3)}" r=".6"/><path class="hl sM" d="M${f(x_)},${f(y_ - 4)} L${f(x_)},${f(y_ - 1)}"/>`; }).join("")
      + (p ? `<path class="hl sB" d="M${f(bot[0] - 4)},${f(bot[1] - 1)} L${f(bot[0] - 6)},${f(bot[1] - 4)} M${f(bot[0] + 4)},${f(bot[1] - 1)} L${f(bot[0] + 6)},${f(bot[1] - 4)}"/>` : "");
  }).join("");
  return `<g style="pointer-events:none"><g class="pz on" data-g="drip" data-i="0">${pose(0)}</g><g class="pz" data-g="drip" data-i="1">${pose(1)}</g></g>`;
}

/* ---- crash: the hole it came through ---- */
const HOLE = { r: 250, rz: 205, top: 44 };
function holeRim(h, sc = 1) {
  return sweep(0, TAU * 47 / 48, 47, t => { const i = Math.round(t / TAU * 48), j = sc * (i % 2 ? .91 : 1.05) * (1 + .1 * Math.sin(3 * t + .5) + .06 * Math.sin(11 * t));
    return cw(HOLE.r * j * Math.cos(t), h, HOLE.rz * j * Math.sin(t)); });
}
function hole(G) {
  const rim = holeRim(CH), top = holeRim(CH + HOLE.top, 1.04);
  let s = `<g style="pointer-events:none"><polygon class="k sW" points="${pts(rim)}"/>`;
  // the far side's broken face, seen through the hole: the slab's thickness, fractured
  const far = rim.map((p, i) => ({ p, q: top[i], i })).filter(({ i }) => i > 1 && i < 23);
  s += `<polygon class="k sM" points="${pts([...far.map(o => o.p), ...far.map(o => o.q).reverse()])}"/>`;
  far.forEach(({ p, q, i }) => { if (i % 3 === 0) s += `<path class="hl sD" d="M${f(p[0])},${f(p[1])} L${f(q[0] + 2)},${f(q[1] + 1)}"/>`; });
  // up through it: the crawlspace, a kicked-out jack post lolling over the far edge, the B1 floor's own torn edge above
  s += `<path class="hl sD" d="${line(sweep(-1, 1, 12, t => cw(t * 210, CH + 150, 120 + 30 * Math.abs(t))))}"/>`;
  { const a = cw(-150, CH + HOLE.top, 150), b = cw(-60, CH + 120, 40), n = [b[1] - a[1], a[0] - b[0]], d = Math.hypot(...n), w = 4.5;
    const o = [n[0] / d * w, n[1] / d * w];
    s += `<polygon class="k sW" points="${pts([[a[0] - o[0], a[1] - o[1]], [a[0] + o[0], a[1] + o[1]], [b[0] + o[0], b[1] + o[1]], [b[0] - o[0], b[1] - o[1]]])}"/>
      <path class="sW mech" d="M${f(a[0] - o[0] * 2.6)},${f(a[1] - o[1] * 2.6)} L${f(a[0] + o[0] * 2.6)},${f(a[1] + o[1] * 2.6)}"/>${seg("SE", (a[0] + b[0]) / 2 - 3, (a[1] + b[1]) / 2 - 2, 3.4, "sM", .5)}
      <path class="hl sA" d="M${f(a[0] + 2)},${f(a[1] - 4)} L${f(a[0] + 5)},${f(a[1] - 12)}"/>`; }
  // Morris, peeking down over the far edge
  { const q = top[14]; s += morrisPeek(f(q[0]), f(q[1] + 1), .8); }
  // the broken chilled-water line, pouring (two poses)
  { const a = cw(150, CH + HOLE.top + 6, 120), b = cw(120, CH - 6, 70), w = 3;
    s += `<path class="sB" d="M${f(a[0] - w)},${f(a[1])} L${f(b[0] - w)},${f(b[1])} M${f(a[0] + w)},${f(a[1])} L${f(b[0] + w)},${f(b[1])}"/><ellipse class="k sB" cx="${f(b[0])}" cy="${f(b[1])}" rx="${w + 1}" ry="1.6"/>`;
    const fall = (p) => [0, 1, 2, 3, 4, 5].map(j => { const y = b[1] + 6 + j * 16 + p * 8; return `<path class="sB" d="M${f(b[0] - 1.5)},${f(y)} L${f(b[0] - 1.5)},${f(y + 6)} M${f(b[0] + 1.5)},${f(y + 3)} L${f(b[0] + 1.5)},${f(y + 9)}"/>`; }).join("");
    s += `<g class="pz on" data-g="drip" data-i="0">${fall(0)}</g><g class="pz" data-g="drip" data-i="1">${fall(1)}</g>`; }
  // bent rebar, curling down out of the edge all round
  rim.forEach((p, i) => { if (i % 3) return; const t = i / 48 * TAU, j = i % 2 ? .97 : 1.02, sgn = i % 4 ? 1 : -1;
    const q = cw(HOLE.r * j * Math.cos(t), CH - 16 - (i % 5) * 3, HOLE.rz * j * Math.sin(t)), r = cw(HOLE.r * (j - .07 * sgn) * Math.cos(t + .03), CH - 24 - (i % 5) * 4, HOLE.rz * (j - .07 * sgn) * Math.sin(t + .03));
    s += `<path class="${i % 2 ? "hl sW" : "sW"}" d="M${f(p[0])},${f(p[1])} L${f(q[0])},${f(q[1])} Q${f(r[0])},${f(q[1] + 3)} ${f(r[0])},${f(r[1])}"/>`; });
  // the edge itself, ragged, and spalled cracks running away from it across the vault
  s += `<polygon class="sW" points="${pts(rim)}"/>`;
  [3, 9, 15, 21, 27, 33, 39, 45].forEach((i, n) => { const t = i / 48 * TAU, P0 = (m, dt = 0) => cw(HOLE.r * m * Math.cos(t + dt), CH, HOLE.rz * m * Math.sin(t + dt));
    s += jag([rim[i], P0(1.25, .05), P0(1.5, -.03)], "hl sW", 1.2, n); });
  // dangling conduit with its wires, frayed and sparking (two poses), and a torn sheet of the grating
  [[30, 0], [36, 1], [41, 2]].forEach(([i, n]) => {
    const a = rim[i], len = 60 + n * 18, sw = (n % 2 ? 1 : -1) * 10;
    const b = [a[0] + sw, a[1] + len * .55], c = [a[0] - sw * .4, a[1] + len];
    s += `<path class="${n === 1 ? "sA" : "sM"}" d="M${f(a[0])},${f(a[1])} C${f(a[0] + sw)},${f(a[1] + len * .2)} ${f(b[0])},${f(b[1])} ${f(c[0])},${f(c[1])}"/>
      <path class="hl ${["sR", "sB", "sW"][n]}" d="M${f(c[0])},${f(c[1])} L${f(c[0] - 3)},${f(c[1] + 5)} M${f(c[0])},${f(c[1])} L${f(c[0] + 2)},${f(c[1] + 6)} M${f(c[0])},${f(c[1])} L${f(c[0] + 4)},${f(c[1] + 3)}"/>
      <g class="pz${n % 2 ? "" : " on"}" data-g="hum" data-i="0">${star4(+f(c[0] + 1), +f(c[1] + 7), 3.2, "sG")}</g><g class="pz${n % 2 ? " on" : ""}" data-g="hum" data-i="1">${star4(+f(c[0] - 2), +f(c[1] + 5), 2.2, "sG")}<path class="hl sG" d="M${f(c[0] - 5)},${f(c[1] + 8)} L${f(c[0] - 8)},${f(c[1] + 11)}"/></g>`;
  });
  { const a = rim[5], g = `<g transform="translate(${f(a[0])},${f(a[1])}) rotate(28)"><rect class="k sW" x="-3" y="0" width="34" height="22"/>${[6, 12, 18, 24].map(x => `<path class="hl sW" d="M${x - 3},0 L${x - 3},22"/>`).join("")}${[7, 14].map(y => `<path class="hl sW" d="M-3,${y} L31,${y}"/>`).join("")}</g>`;
    s += g; }
  // falling bits, jumping between fixed positions (two poses)
  const bits = (p) => [[-80, .3], [40, .5], [170, .25]].map(([x, t], i) => { const a = cw(x, CH - 10, -40 + i * 30), y = a[1] + (t + p * .25) * 90; return chunk(a[0], y, 2.6 + i * .6, i); }).join("");
  s += `<g class="pz on" data-g="drip" data-i="0">${bits(0)}</g><g class="pz" data-g="drip" data-i="1">${bits(1)}</g>`;
  return s + `</g>`;
}

/* ---- crash: the 3T itself. The MRI CONTROL scanner (a rounded-box cover, the round face, the bore, the bed), in true
 *      3D wireframe, lying where it fell: yawed, nose-down, rolled. Quorum's feet out of the bore. ---- */
const T3 = { lat: -16, z: 790, yaw: 42 * DEG, pitch: -7 * DEG, roll: 8 * DEG, HW: 124, HH: 98, CR: 24, L: 176, RF: 84, RB: 42, sink: 22 };
const v3 = { add: (a, b, m = 1) => [a[0] + b[0] * m, a[1] + b[1] * m, a[2] + b[2] * m], dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] };
function frame3() {
  const { yaw, pitch, roll } = T3, cr = Math.cos(roll), sr = Math.sin(roll);
  const a = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
  const u0 = [Math.cos(yaw), 0, Math.sin(yaw)], v0 = [u0[1] * a[2] - u0[2] * a[1], u0[2] * a[0] - u0[0] * a[2], u0[0] * a[1] - u0[1] * a[0]];
  const u = [u0[0] * cr + v0[0] * sr, u0[1] * cr + v0[1] * sr, u0[2] * cr + v0[2] * sr], v = [v0[0] * cr - u0[0] * sr, v0[1] * cr - u0[1] * sr, v0[2] * cr - u0[2] * sr];
  const c = [T3.lat, RH - T3.sink + T3.HH, T3.z];
  const P3 = (U, V, Wd) => v3.add(v3.add(v3.add(c, u, U), v, V), a, Wd);
  const S = (U, V, Wd) => { const p = P3(U, V, Wd); return W(p[0], p[1], p[2]); };
  const facing = (n, p) => v3.dot(n, [p[0], p[1] - E, p[2]]) < 0;
  return { a, u, v, c, P3, S, facing };
}
// the cover's cross-section: a rounded rectangle, counter-clockwise, with outward normals
function xsec(sc = 1) {
  const { HW, HH, CR } = T3, o = [];
  [[1, 1, 0], [-1, 1, 1], [-1, -1, 2], [1, -1, 3]].forEach(([sx, sy, q]) => { for (let i = 0; i <= 6; i++) { const t = (q + i / 6) * Math.PI / 2;
    o.push({ U: (sx * (HW - CR) + Math.cos(t) * CR) * sc, V: (sy * (HH - CR) + Math.sin(t) * CR) * sc, nU: Math.cos(t), nV: Math.sin(t) }); } });
  return o;
}
function hull(P) {
  const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function scanner(G) {
  const F = frame3(), { S, P3, u, v, a, facing } = F, { L, RF, RB, HW, HH } = T3, L2 = L / 2;
  const nrm = (nU, nV) => [u[0] * nU + v[0] * nV, u[1] * nU + v[1] * nV, u[2] * nU + v[2] * nV];
  const xs = xsec(), k = kz(T3.z);
  const circ = (r, w, a0 = 0, a1 = TAU, n = 64) => sweep(a0, a1, n, t => S(Math.cos(t) * r, Math.sin(t) * r, w));
  let s = `<g data-hs="scanner">`;
  // the speed of its arrival: dashes from the hole down to its back
  { const tops = [-90, -20, 50].map(U => S(U, HH, -L2 * .3));
    s += tops.map(([x, y], i) => `<path class="hl sW" d="M${f(x)},${f(y - 30 - i * 4)} L${f(x)},${f(y - 8)} M${f(x + 5)},${f(y - 40)} L${f(x + 5)},${f(y - 20)}"/>`).join(""); }
  // the housing: silhouette, visible panel seams, the corner edges
  const front = xs.map(o => S(o.U, o.V, L2)), back = xs.map(o => S(o.U, o.V, -L2));
  s += `<polygon class="k sW mech" points="${pts(hull([...front, ...back]))}"/>`;
  [-L2, -L2 * .45, L2 * .2].forEach((w, j) => {
    let d = "";
    for (let i = 0; i < xs.length - 1; i++) { const A = xs[i], B = xs[i + 1], n = nrm(A.nU + B.nU, A.nV + B.nV);
      if (facing(n, P3((A.U + B.U) / 2, (A.V + B.V) / 2, w))) { const p = S(A.U, A.V, w), q = S(B.U, B.V, w); d += `M${f(p[0])},${f(p[1])} L${f(q[0])},${f(q[1])} `; } }
    if (d) s += `<path class="${j ? "hl sW" : "sW"}" d="${d}"/>`;
  });
  [3, 10, 17, 24].forEach(i => { const o = xs[i]; if (facing(nrm(o.nU, o.nV), P3(o.U, o.V, 0))) s += `<path class="hl sW" d="${line([S(o.U, o.V, L2), S(o.U, o.V, -L2)])}"/>`; });
  // stickers on the visible side panel, and the crumple where it hit
  const side = facing(nrm(-1, 0), P3(-HW, 0, 0)) ? -1 : 1;
  const ang = (p, q) => Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
  { const p = S(side * HW, 10, -10), q = S(side * HW, 10, -40); const r = ang(q, p);
    s += `<g transform="rotate(${f(r)} ${f(p[0])} ${f(p[1])})">${chip("ZONE IV", +f(p[0] - 18), +f(p[1] - 4), 4.2, "fR")}</g>`;
    const p2 = S(side * HW, -36, -50); s += `<g transform="rotate(${f(r)} ${f(p2[0])} ${f(p2[1])})">${chip("THE MAGNET IS ALWAYS ON", +f(p2[0] - 30), +f(p2[1] - 3), 3, "fR")}</g>`; }
  s += jag([S(side * HW, HH - 10, L2 - 10), S(side * HW, HH - 40, L2 - 30), S(side * HW, HH - 30, L2 - 60)], "hl sW", 1.3, 2);
  // the quench: the vent on top has sheared off and the helium is going (two poses)
  { const b0 = S(-40, HH, -L2 * .5), b1 = S(-40, HH + 22, -L2 * .5), b2 = S(-28, HH + 30, -L2 * .5);
    s += `<path class="sW" d="M${f(b0[0] - 4)},${f(b0[1])} L${f(b1[0] - 4)},${f(b1[1])} M${f(b0[0] + 4)},${f(b0[1])} L${f(b1[0] + 4)},${f(b1[1])}"/><path class="sW" d="M${f(b1[0] - 5)},${f(b1[1] + 1)} L${f(b1[0] + 5)},${f(b1[1] - 2)}"/>`;
    const plume = (p) => [0, 1, 2].map(i => { const x = b1[0] + (i - 1) * 7, y = b1[1] - 4 - p * 6;
      return `<path class="hl sW" d="M${f(x)},${f(y)} C${f(x - 6)},${f(y - 10)} ${f(x + 6)},${f(y - 16)} ${f(x + (i - 1) * 4)},${f(y - 26)} C${f(x - 8)},${f(y - 34)} ${f(x + 4)},${f(y - 40)} ${f(x + (i - 1) * 9)},${f(y - 48 - p * 6)}"/>`; }).join("");
    s += `<g class="pz on" data-g="hum" data-i="0">${plume(0)}</g><g class="pz" data-g="hum" data-i="1">${plume(1)}</g>`; }
  // the front: the cover, its seam, the round face with its flare, the bore
  s += `<polygon class="k sW mech" points="${pts(front)}"/><polygon class="hl sW" points="${pts(xsec(.9).map(o => S(o.U, o.V, L2 + 1)))}"/>`;
  s += `<polygon class="k sW" points="${pts(circ(RF, L2 + 4))}"/><polygon class="hl sW" points="${pts(circ(RF * .8, L2 + 6))}"/>`;
  { const p = S(-HW + 22, HH - 26, L2 + 1), q = S(-HW + 60, HH - 26, L2 + 1); s += `<g transform="rotate(${f(ang(p, q))} ${f(p[0])} ${f(p[1])})">${seg("3T", p[0], p[1], 14 * k, "sW", 1.2)}</g>`;
    const z = S(HW - 70, -HH + 18, L2 + 1); s += `<g transform="rotate(${f(ang(p, q))} ${f(z[0])} ${f(z[1])})">${chip("ZONE IV", +f(z[0]), +f(z[1]), 4.2, "fR")}</g>`; }
  s += jag([S(RF + 6, -40, L2 + 1), S(HW - 20, -60, L2 + 1), S(HW - 6, -90, L2 + 1)], "hl sW", 1.4, 4) + jag([S(-RF - 4, 30, L2 + 1), S(-HW + 12, 46, L2 + 1)], "hl sW", 1.2, 5);
  // the bore: black, its lining running back to the far opening, Quorum inside it to the shins
  const bore = circ(RB, L2 + 6);
  s += `<clipPath id="boreClip"><polygon points="${pts(bore)}"/></clipPath><polygon class="k sM" points="${pts(bore)}"/><g clip-path="url(#boreClip)">
    <polygon class="hl sD" points="${pts(circ(RB, -L2))}"/>${sweep(0, TAU * 7 / 8, 7, t => t).map(t => `<path class="hl sD" d="${line([S(Math.cos(t) * RB, Math.sin(t) * RB, L2 + 6), S(Math.cos(t) * RB, Math.sin(t) * RB, -L2)])}"/>`).join("")}
    <polygon class="k sD" points="${pts([S(-RB * .8, -RB * .5, L2 + 6), S(RB * .8, -RB * .5, L2 + 6), S(RB * .6, -RB * .5, -L2 * .2), S(-RB * .6, -RB * .5, -L2 * .2)])}"/>
    <polygon class="k sV" points="${pts([S(-RB * .7, -RB * .3, L2 + 6), S(RB * .7, -RB * .3, L2 + 6), S(RB * .5, -RB * .3, -L2 * .1), S(-RB * .5, -RB * .3, -L2 * .1)])}"/>
    <path class="hl sV" d="${line([S(-RB * .2, -RB * .3, L2 + 6), S(-RB * .15, -RB * .3, -L2 * .1)])} ${line([S(RB * .25, -RB * .3, L2 + 6), S(RB * .2, -RB * .3, -L2 * .1)])}"/></g>`;
  // the bed: out of the bore and buckled, its pedestal crushed
  const bv = -RB + 4, bw = 30, b1 = L2 + 6, b2 = L2 + 110;
  { const ped = [S(-22, bv - 6, b2 - 10), S(22, bv - 6, b2 - 10), S(30, -HH - 6, b2 - 2), S(-30, -HH - 6, b2 - 2)];
    s += `<polygon class="k sW mech" points="${pts(ped)}"/>${jag([S(-26, bv - 30, b2 - 6), S(26, bv - 40, b2 - 6)], "hl sW", 1.2, 6)}<path class="hl sW" d="${line([S(-26, -HH + 10, b2 - 4), S(26, -HH + 10, b2 - 4)])}"/>`;
    const top = [S(-bw, bv, b1), S(bw, bv, b1), S(bw, bv - 4, b2), S(-bw, bv - 4, b2)], edge = [S(-bw, bv, b1), S(bw, bv, b1), S(bw, bv - 4, b2), S(bw, bv - 12, b2), S(-bw, bv - 12, b2), S(-bw, bv - 4, b2)];
    s += `<polygon class="k sW mech" points="${pts(edge)}"/><polygon class="k sW mech" points="${pts(top)}"/><path class="hl sW" d="${line([S(-bw + 4, bv, b1 + 20), S(bw - 4, bv, b1 + 20)])}"/>`; }
  // Quorum: robe bunched at the mouth, trouser legs along the bed, shoes toes-up, and his gold, stuck to the iron round the bore
  let q = `<g data-hs="quorum">`;
  q += `<polygon class="k sV" points="${pts([S(-RB * .8, bv + 2, L2 + 4), S(-RB * .5, bv + 30, L2 + 6), S(RB * .5, bv + 32, L2 + 6), S(RB * .85, bv + 2, L2 + 4), S(RB * .55, bv + 2, L2 + 22), S(-RB * .5, bv + 2, L2 + 20)])}"/>
    <path class="hl sV" d="${line([S(-RB * .3, bv + 22, L2 + 7), S(-RB * .2, bv + 2, L2 + 18)])} ${line([S(RB * .2, bv + 24, L2 + 7), S(RB * .25, bv + 2, L2 + 18)])}"/>`;
  // (drawn a size up: they're the punchline) shins out of the robe, a band of sock, shoes standing up off the heels
  const LG = 78;
  [-13, 13].forEach((U, i) => {
    const t = (w, V, dU = 0) => S(U + dU, bv + V, L2 + w);
    q += `<polygon class="k sM" points="${pts([t(14, 4, -8), t(14, 4, 8), t(LG - 8, 8, 7), t(LG - 8, 8, -7)])}"/>
      <path class="hl sM" d="${line([t(18, 6, 0), t(LG - 10, 9, 0)])}"/>
      <polygon class="k sK" points="${pts([t(LG - 8, 6, -7), t(LG - 8, 6, 7), t(LG - 2, 7, 7), t(LG - 2, 7, -7)])}"/>
      <polygon class="k sW" points="${pts([t(LG - 4, 0, -10), t(LG - 4, 0, 10), t(LG + 3, 40, 12), t(LG + 2, 44, 0), t(LG + 3, 40, -11)])}"/>
      <path class="hl sW" d="${line([t(LG - 2, 12, -10), t(LG - 2, 12, 10)])} ${line([t(LG, 26, -6), t(LG + 2, 34, 0), t(LG, 26, 6)])}"/>`;
  });
  const fp = [S(-12, bv + 20, L2 + LG), S(12, bv + 20, L2 + LG)];
  q += `<g class="pz on" data-g="hum" data-i="0">${arcs(fp[0][0] - 9 * k * 2, fp[0][1], -1, "sW", 2, .5)}</g><g class="pz" data-g="hum" data-i="1">${arcs(fp[1][0] + 9 * k * 2, fp[1][1] - 2, 1, "sW", 2, .5)}</g>`;
  sweep(.3, TAU - .3, 7, t => t).forEach((t, i) => { if (i === 2 || i === 5) return; const r = RB - 4, p = S(Math.cos(t) * r, Math.sin(t) * r, L2 + 7), c = S(Math.cos(t) * (r - 9), Math.sin(t) * (r - 9), L2 + 7);
    q += `<path class="hl sA" d="M${f(p[0])},${f(p[1])} L${f(c[0])},${f(c[1])}"/><circle class="k sA" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(3.6 * k * 1.6)}"/><circle class="fA" cx="${f(p[0])}" cy="${f(p[1])}" r="${f(1.1 * k * 1.6)}"/>`; });
  { const m = S(RB * .55, bv + 4, L2 + 26), m2 = S(-RB * .35, bv + 3, L2 + 30);
    q += `<path class="hl sA" d="M${f(m[0])},${f(m[1] - 6)} L${f(m[0])},${f(m[1])}"/><circle class="k sA" cx="${f(m[0])}" cy="${f(m[1] + 2.5)}" r="${f(3.4 * k * 1.6)}"/>
      <path class="hl sA" d="M${f(m2[0])},${f(m2[1] - 6)} L${f(m2[0])},${f(m2[1])}"/><circle class="k sA" cx="${f(m2[0])}" cy="${f(m2[1] + 2.5)}" r="${f(3.4 * k * 1.6)}"/>`; }
  { const hs = [...bore, ...fp]; const xs_ = hs.map(p => p[0]), ys_ = hs.map(p => p[1]);
    q += hit(f(Math.min(...xs_) - 6), f(Math.min(...ys_) - 4), f(Math.max(...xs_) - Math.min(...xs_) + 12), f(Math.max(...ys_) - Math.min(...ys_) + 14)); }
  s += q + `</g>`;
  // impact: ((( ))) off the sides, sparks where the cover met the ring
  { const L0 = S(-HW - 10, -HH * .4, 0), R0 = S(HW + 10, -HH * .4, L2 * .5);
    s += `<g class="pz on" data-g="hum" data-i="0">${arcs(L0[0] - 4, L0[1], -1, "sW", 3, 1.1)}${arcs(R0[0] + 4, R0[1], 1, "sW", 3, 1.1)}</g>
      <g class="pz" data-g="hum" data-i="1">${arcs(L0[0] - 8, L0[1], -1, "sW", 2, 1.4)}${arcs(R0[0] + 8, R0[1], 1, "sW", 2, 1.4)}</g>`;
    const sp = S(HW - 30, -HH, L2 - 10); s += star4(+f(sp[0]), +f(sp[1]), 5, "sW") + star4(+f(sp[0] + 12), +f(sp[1] - 8), 3, "sA"); }
  return s + `</g>`;
}

/* ---- crash: the Table split under it, rubble, dust (two poses) ---- */
function wreck(G) {
  let s = `<g style="pointer-events:none">`;
  // the pole face, split from under the 3T to the near edge, the halves heaved
  const crackPts = [W(40, RH, 700), W(30, RH, 660), W(52, RH, 640), W(36, RH, 610), W(48, RH, RZ - RR + RT + 4)];
  s += `<path class="k sW" d="${line(crackPts)} ${line(crackPts.slice().reverse().map(([x, y]) => [x + 3.5, y + .8]))}"/>` + jag(crackPts, "sW", 1.2, 3);
  s += jag([W(-60, RH, 640), W(-110, RH, 610), W(-150, RH, 640)], "hl sW", 1, 1) + jag([W(140, RH, 700), W(175, RH, 650)], "hl sW", 1, 2);
  // rubble on the table and the floor
  [[-150, RH, 700, 9], [170, RH, 660, 8], [-60, RH, 630, 6], [100, RH, 615, 5], [-300, 0, 600, 10], [260, 0, 540, 8], [70, 0, 500, 6], [-200, 0, 520, 7],
   [350, 0, 760, 9], [-370, 0, 860, 9], [-120, 0, 470, 5], [190, 0, 470, 4], [0, 0, 545, 6], [-250, 0, 700, 6]]
    .forEach(([l, h, z, r], i) => { const [x, y] = W(l, h, z); s += chunk(x, y, r * kz(z) * 1.8, i); if (i % 4 === 1) s += `<path class="hl sW" d="M${f(x)},${f(y - r)} Q${f(x + 4)},${f(y - r - 6)} ${f(x + 8)},${f(y - r - 4)}"/>`; });
  // dust boiling out from under it (two poses)
  const puff = (x, y, r) => `<path class="hl sM" d="M${f(x - r)},${f(y)} A${f(r * .5)},${f(r * .5)} 0 0 1 ${f(x)},${f(y - r * .4)} A${f(r * .5)},${f(r * .5)} 0 0 1 ${f(x + r)},${f(y)}"/>`;
  const base = [[-230, 690], [-190, 610], [200, 620], [240, 700], [-90, 580], [120, 575]];
  const pose = (p) => base.map(([l, z], i) => { const [x, y] = W(l, RH, z), r = (8 + p * 5) * kz(z) * 1.6; return puff(x - p * (l < 0 ? 6 : -6), y - 4 - p * 6, r) + puff(x + (l < 0 ? -r : r), y - 2 - p * 9, r * .7); }).join("");
  s += `<g class="pz on" data-g="drip" data-i="0">${pose(0)}</g><g class="pz" data-g="drip" data-i="1">${pose(1)}</g>`;
  return s + `</g>`;
}

/* ---- crash: the console under a slab of ceiling, the Gain Controller flattened ---- */
function crushedConsole(G) {
  const k = kz(CON.z), c = (l, h, z) => W(l, h, z), w = 32, d = 26, ph = 30;
  const fl = c(CON.lat - w, 0, CON.z - d), fr = c(CON.lat + w, 0, CON.z - d), tl = c(CON.lat - w - 4, ph, CON.z - d), tr = c(CON.lat + w + 3, ph - 6, CON.z - d);
  const bl = c(CON.lat - w - 4, ph, CON.z + d), br = c(CON.lat + w + 3, ph - 6, CON.z + d);
  let s = `<polygon class="k sM mech" points="${pts([tl, tr, br, bl])}"/><polygon class="k sM mech" points="${pts([tl, [tl[0] + 10 * k, tl[1] + 8 * k], tr, fr, fl])}"/>`;
  s += jag([c(CON.lat - w + 4, ph - 6, CON.z - d), c(CON.lat + w - 6, 6, CON.z - d)], "hl sM", 1, 7) + seg("GAIN CONTROLLER", fl[0] + 2, fl[1] - 12 * k, 2.8, "sD", .5);
  // the box itself, flat as a form letter, the dial popped out and rolled away, the green bar dead
  const [px, py] = c(CON.lat, ph - 2, CON.z - 4);
  s += `<g transform="translate(${f(px)},${f(py)}) rotate(-6) scale(${(k).toFixed(3)})">
    <path class="k sW mech" d="M-34,0 L30,0 L26,-7 L-30,-8 Z"/><path class="hl sW" d="M-26,-4 L-10,-5 L-4,-2 L14,-5"/><path class="hl sG" d="M8,-1 L12,-6 M14,-1 L16,-6 M18,-2 L22,-6"/>${insignia(-18, -12, 3)}</g>`;
  // the slab that did it, rebar and all
  { const [x, y] = c(CON.lat + 4, ph + 2, CON.z), r = 30 * k;
    s += `<polygon class="k sM" points="${pts([[x - r * 1.4, y - 2], [x - r * 1.1, y - r * .9], [x + r * .2, y - r * 1.3], [x + r * 1.3, y - r * .7], [x + r * 1.5, y - 4]])}"/>
      <path class="hl sM" d="M${f(x - r * .6)},${f(y - r)} L${f(x - r * .2)},${f(y - r * .5)} L${f(x - r * .5)},${f(y - 3)} M${f(x + r * .5)},${f(y - r * 1.1)} L${f(x + r * .7)},${f(y - r * .4)}"/>
      <path class="sW" d="M${f(x + r * .3)},${f(y - r * 1.25)} Q${f(x + r * .5)},${f(y - r * 2)} ${f(x + r * 1.1)},${f(y - r * 1.9)} M${f(x - r * .7)},${f(y - r)} L${f(x - r * 1.1)},${f(y - r * 1.7)}"/>`; }
  // the dial, on the floor in front, needle pinned at MAX; sparks (two poses)
  { const [x, y] = c(CON.lat + 46, 0, CON.z - 50), r = 8 * k;
    s += `<ellipse class="k sW" cx="${f(x)}" cy="${f(y - r * .4)}" rx="${f(r)}" ry="${f(r * .5)}"/><path class="sR" d="M${f(x)},${f(y - r * .4)} L${f(x + r * .7)},${f(y - r * .6)}"/>${seg("MAX", x - r, y + 1, 2.6, "sR", .45)}`;
    s += `<g class="pz on" data-g="hum" data-i="0">${star4(+f(px + 22 * k), +f(py - 10 * k), 4, "sG")}${star4(+f(px - 30 * k), +f(py - 6 * k), 2.6, "sG")}</g>
      <g class="pz" data-g="hum" data-i="1">${star4(+f(px + 26 * k), +f(py - 14 * k), 2.6, "sG")}<path class="hl sG" d="M${f(px + 18 * k)},${f(py - 4 * k)} L${f(px + 30 * k)},${f(py - 16 * k)}"/></g>`; }
  return s;
}

/* ---- crash: the members, knocked over in their chairs, scattered outward ---- */
const KNOCK = [-82, 74, 0, -70, 86, 0, -12, -88, 70, 0, -76, 84];
function knocked(sp, i) {
  const a = KNOCK[i], out = sp.lat < 0 ? -1 : 1, x = sp.x + out * (a ? 14 : 6) * sp.k, y = sp.y + (a ? 4 * sp.k : 0);
  return `<g transform="rotate(${a} ${f(x)} ${f(y)})">${hoodSeated(x, y, sp.k, false)}</g>`;
}

function back(G) {
  const on = !!G.flags.finale, crash = !!G.flags.crash, creak = !crash && !!G.flags.creak;
  DENTS = crash ? [[-62 * DEG, 30], [208 * DEG, 26], [100 * DEG, 12]] : [];
  let s = room(G);
  if (creak) s += creakCeiling();
  if (crash) s += hole(G);
  // seats far to near (the ring's back half covers their laps), with the head of the table among them
  const order = SEATS.map((th, i) => ({ th, i, z: seatPos(th).z })).sort((a, b) => b.z - a.z);
  let seats = "";
  let headDone = false;
  order.forEach(({ th, i, z }) => {
    if (!headDone && z < HEAD.z) { seats += head(G); headDone = true; }
    const sp = seatPos(th);
    seats += crash ? knocked(sp, i) : hoodSeated(sp.x, sp.y, sp.k, !on);
  });
  if (!headDone) seats += head(G);
  s += busbars(G);
  s += seats + `<g data-hs="table">${ringHalf(false, on)}</g>`;
  s += `<g data-hs="table">${poleFace(G)}${hit(...tableBox())}</g>`;
  if (!crash && !(G.flags.gotGavel || G.flags.gavelTaken || (G.inv && Object.values(G.inv).some(l => Array.isArray(l) && l.includes("gavel"))))) s += gavel(G);
  s += `<g data-hs="table">${ringHalf(true, on)}</g>`;
  SEATS.forEach((th, i) => {
    s += `<g class="pz on" data-g="seat${i}" data-i="0">${lamp(th, false)}</g><g class="pz" data-g="seat${i}" data-i="1">${lamp(th, true)}</g>`;
  });
  if (crash) s += wreck(G) + scanner(G);
  if (creak) s += creakFall();
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
