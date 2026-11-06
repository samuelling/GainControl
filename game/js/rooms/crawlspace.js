// UNDER THE 3T (Act V, night, Morris only) — the crawlspace between B1 and B3. Morris-scale: the camera sits low, the
// underside of the magnet's concrete pad hangs right overhead, and the steel is drawn big against a rat. Steel I-beams
// cross under the pad; overhead, a grating shows the bottom of the 3T (the cryostat's curve, THE MAGNET IS ALWAYS ON);
// four rust-streaked jack posts (NW NE SW SE) hold the beams, three bolts each on the base plate, drawn from
// G.flags.bolts (a 4-char string of bolts left per post, "3321"; default "3333"); the chilled-water line along the
// right with the Table's crude tap (insignia tag) and a hose running down through the floor to B3; drips (pose group
// "drip"); the riser pipe Morris came up, back down to the tube hub.
// Every bolt out tips the pad toward that post (its base kicks out, the beam drops there). G.flags.supportsOut: every
// bolt gone, the posts kicked out, the pad bowing, cracks, dust, ((( ))) (pose groups "drip" and "hum").
import { seg, segW, segC, chip, chipW, perspective, hit, arcs, star4, onQuad } from "../gfx.js";
import { insignia } from "../cast/act3a.js";

const VPY = 186, CY = 124, BD = 24;          // eye low (rat's-eye), pad underside at screen Y 124 on the picture plane, beam depth
const pp = perspective(320, VPY, 0.32);
const { P, poly, ln, KB, FY } = pp;
const fx = (n) => n.toFixed(1);
const pt = (p) => fx(p[0]) + "," + fx(p[1]);
const L = (arr) => "M" + arr.map(pt).join(" L");
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sweep = (a, b, n, fn) => { const o = []; for (let i = 0; i <= n; i++) o.push(fn(a + (b - a) * i / n)); return o; };

/* ---- the posts and the pad's tilt ---- */
const POSTS = [{ id: "NW", X: 210, k: .6 }, { id: "NE", X: 430, k: .6 }, { id: "SW", X: 150, k: .9 }, { id: "SE", X: 490, k: .9 }];
let S = null;   // the state of the current draw
function state(G) {
  const out = !!G.flags.supportsOut, b = typeof G.flags.bolts === "string" ? G.flags.bolts : "3333";
  const n = [0, 1, 2, 3].map(i => { const v = parseInt(b[i], 10); return out ? 0 : isNaN(v) ? 3 : clamp(v, 0, 3); });
  const drop = n.map(v => out ? 7 : (3 - v) * 1.8);
  return { out, n, drop };
}
// how far the pad has dropped (world Y units) at (X, k): the four posts' drops, bilinear, plus the bow once it's all out
function sag(X, k) {
  const { drop, out } = S, tx = clamp((X - 180) / 280), tk = clamp((k - .6) / .3);
  const back = drop[0] + (drop[1] - drop[0]) * tx, front = drop[2] + (drop[3] - drop[2]) * tx;
  let d = back + (front - back) * tk;
  if (out) d += 15 * Math.sin(Math.PI * clamp(X / 640)) * (.55 + .45 * Math.exp(-(((k - 1.1) / .9) ** 2)));
  return d;
}
const C = (X, k, dy = 0) => P(X, CY + dy + sag(X, k), k);   // a point on (or hanging under) the pad
const along = (k, x0, x1, dy = 0, n = 24) => sweep(x0, x1, n, X => C(X, k, dy));
const deep = (X, k0, k1, dy = 0, n = 16) => sweep(k0, k1, n, k => C(X, k, dy));

/* ---- the room: floor grid, low block walls, the pad's underside (board seams as a grid) ---- */
function room() {
  let s = "";
  for (let X = -160; X <= 800; X += 80) s += ln([X, FY], P(X, FY, KB), "hl sN");
  [.42, .52, .64, .78].forEach(k => s += ln(P(0, FY, k), P(640, FY, k), "hl sN"));
  // the side walls and back wall: poured foundation, block courses (dim)
  const TL = C(0, KB), TR = C(640, KB), BL = P(0, FY, KB), BR = P(640, FY, KB);
  s += `<polygon class="k sD" points="${poly(TL, TR, BR, BL)}"/>`;
  for (let Y = CY + 18; Y < FY; Y += 18) s += ln(P(0, Y, KB), P(640, Y, KB), "hl sD") + ln(P(0, Y, 1.2), P(0, Y, KB), "hl sD") + ln(P(640, Y, 1.2), P(640, Y, KB), "hl sD");
  s += ln([0, FY], BL, "sM") + ln([640, FY], BR, "sM") + ln(BL, BR, "sM") + `<path class="sM" d="${L(deep(0, 1.6, KB))} ${L(deep(640, 1.6, KB))}"/>`;
  // a black crawl-hole in the back wall: the crawlspace goes on
  const h = [P(250, 226, KB), P(330, 226, KB), P(330, FY, KB), P(250, FY, KB)];
  s += `<polygon class="k sD" points="${poly(...h)}"/>`;
  // the pad underside: board seams across, and lengthwise
  [3.2, 2.5, 2.0, 1.62, 1.1, .78, .5, .4].forEach(k => s += `<path class="hl sD" d="${L(along(k, 0, 640))}"/>`);
  for (let X = 0; X <= 640; X += 64) s += `<path class="hl sD" d="${L(deep(X, 3.4, KB))}"/>`;
  s += `<path class="sM" d="${L(along(KB, 0, 640))}"/>`;
  return s;
}

/* ---- the grating overhead, and the bottom of the 3T through it ---- */
const GR = { x0: 200, x1: 440, k0: 1.04, k1: 2.5 };
function grating(G) {
  const { x0, x1, k0, k1 } = GR;
  const edge = [...along(k0, x0, x1, 0, 16), ...deep(x1, k0, k1, 0, 8), ...along(k1, x1, x0, 0, 16), ...deep(x0, k1, k0, 0, 8)];
  const ys = edge.map(p => p[1]), xs = edge.map(p => p[0]);
  let s = `<g data-hs="grating"><clipPath id="grClip"><polygon points="${edge.map(pt).join(" ")}"/></clipPath>
    <polygon class="k" points="${edge.map(pt).join(" ")}" stroke="none"/><g clip-path="url(#grClip)">`;
  // the 3T above: a cylinder lying front-to-back, its front face a true circle; we see its underside and the rim of the face
  const R = 120, KC = 1.45, Yc = CY - 22 - R, d3 = (k) => sag(320, k) * .9;
  const cen = (k) => P(320, Yc + d3(k), k), circ = (k, r, a0 = 0, a1 = Math.PI) => { const [cx, cy] = cen(k); return sweep(a0, a1, 48, a => [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]); };
  s += `<path class="k sW" d="${L(circ(KC, R, 0, Math.PI))}"/>`;
  // ribs of the cryostat shell (constant depth), and its long seams running back
  [1.25, 1.08, .92].forEach((k, i) => s += `<path class="hl ${i === 0 ? "sW" : "sM"}" d="${L(circ(k, R, .1, Math.PI - .1))}"/>`);
  [60, 75, 90, 105, 120].forEach(a => { const r = a * Math.PI / 180, [ax, ay] = cen(KC), [bx, by] = cen(.6);
    s += `<path class="hl sM" d="M${fx(ax + Math.cos(r) * R * KC)},${fx(ay + Math.sin(r) * R * KC)} L${fx(bx + Math.cos(r) * R * .6)},${fx(by + Math.sin(r) * R * .6)}"/>`; });
  // the front face: the flare of the housing and a hint of the bore, above the rim
  s += `<path class="hl sW" d="${L(circ(KC, R * .9, .3, Math.PI - .3))}"/><path class="hl sW" d="${L(circ(KC, R * .8, .5, Math.PI - .5))}"/>`;
  // the sticker on its belly, and the always-on hum
  { const [cx, cy] = cen(1.16), y = cy + R * 1.16 + 3, t = "THE MAGNET IS ALWAYS ON", h = 4.2;
    s += `<g transform="rotate(180 ${fx(cx)} ${fx(y + h * .85)})">${chip(t, +(cx - chipW(t, h) / 2).toFixed(1), +y.toFixed(1), h, "fR")}</g>`;   // upside down, from here
    s += `<g class="pz on" data-g="hum" data-i="0">${arcs(cx - 46, y + 3, -1, "sB", 2, .5)}${arcs(cx + 46, y + 3, 1, "sB", 2, .5)}</g>
      <g class="pz" data-g="hum" data-i="1">${arcs(cx - 48, y + 3, -1, "sB", 3, .5)}${arcs(cx + 48, y + 3, 1, "sB", 3, .5)}</g>`; }
  // the bars of the grating, over all of it
  for (let X = x0 + 30; X < x1; X += 30) s += `<path class="hl sW" d="${L(deep(X, k0, k1, 0, 6))}"/>`;
  [1.18, 1.36, 1.6, 1.95].forEach(k => { s += `<path class="hl sW" d="${L(along(k, x0, x1, 0, 10))}"/>`; });
  s += `</g><polygon class="sW mech" points="${edge.map(pt).join(" ")}"/>`;
  // the frame's angle-iron lip, and the bolt-heads holding it
  const lip = [...along(k0, x0 - 6, x1 + 6, 3, 16), ...deep(x1 + 6, k0, k1, 3, 8).slice(1), ...along(k1, x1 + 6, x0 - 6, 3, 16).slice(1), ...deep(x0 - 6, k1, k0, 3, 8).slice(1)];
  s += `<polygon class="hl sW" points="${lip.map(pt).join(" ")}"/>`;
  [[x0 - 3, k0], [x1 + 3, k0], [x0 - 3, k1], [x1 + 3, k1], [320, k0], [x0 - 3, 1.5], [x1 + 3, 1.5]].forEach(([X, k]) => { const p = C(X, k, 2); s += `<circle class="k sW" cx="${fx(p[0])}" cy="${fx(p[1])}" r="${fx(1.4 * k)}"/>`; });
  return s + `${hit(Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))}</g>`;
}

/* ---- the I-beams under the pad, running wall to wall ---- */
function beam(kc, w, label) {
  const k1 = kc + w, k2 = kc - w, n = 32;
  const top = along(k1, -40, 680, 0, n), bot = along(k1, -40, 680, BD, n), under = along(k2, -40, 680, BD, n);
  let s = `<polygon class="k sM mech" points="${[...top, ...bot.slice().reverse()].map(pt).join(" ")}"/>
    <polygon class="k sM mech" points="${[...bot, ...under.slice().reverse()].map(pt).join(" ")}"/>`;
  // flange edges, the web between them
  s += `<path class="hl sM" d="${L(along(k1, -40, 680, 4, n))} ${L(along(k1, -40, 680, BD - 5, n))}"/>`;
  // stiffener plates at intervals, and rust bleeding from the bottom flange
  for (let X = 40; X < 640; X += 120) s += `<path class="hl sM" d="${L([C(X, k1, 4), C(X, k1, BD - 5)])}"/>`;
  [90, 300, 470, 560].forEach((X, i) => { const a = C(X, k1, BD - 5), b = C(X + 3, k1, BD), c = C(X + 8, k1, BD - 3);
    s += `<path class="hl sA" d="M${pt(a)} C${fx(a[0] - 2)},${fx(a[1] + 2)} ${fx(b[0] + 1)},${fx(b[1] - 3)} ${pt(b)} M${pt(c)} L${fx(c[0])},${fx(c[1] + 3 * kc)}"/>`; });
  // the stencil on the web follows the beam as the pad tips and bows
  if (label) { const h = 5.2 * kc, w = segW(label[1], h), X0 = label[0];
    s += onQuad(seg(label[1], 0, 0, h, "sD", .7), w, h, C(X0, k1, 7), C(X0 + w / k1, k1, 7), C(X0, k1, 7 + h / k1)); }
  return s;
}

/* ---- a jack post: top plate under the beam, screw, collar, tube, base plate with three bolts ---- */
const NUTS = [[-17, .012], [17, .012], [0, .024]];
function post(i) {
  const { X, k, id } = POSTS[i], n = S.n[i], out = S.out;
  const lean = (out ? 12 : (3 - n) * 2.4) * (X < 320 ? -1 : 1);
  const s_ = k, top = C(X, k, BD), bx = X + lean;
  const [tx, ty] = top, base = P(bx, FY - 4, k), [bxS, byS] = base;
  const at = (t) => [tx + (bxS - tx) * t, ty + (byS - ty) * t];            // along the column, top (0) to base (1)
  const len = byS - ty, Y = (h) => (h * s_) / len;                         // fraction for a distance down from the top
  const side = (t, w) => { const p = at(t); return [p[0] + w * s_, p[1]]; };
  let s = `<g data-hs="posts">`;
  // base plate: top face and front edge, on the floor
  const pl = (dx, dk, h) => P(bx + dx, FY - h, k + dk);
  s += `<polygon class="k sW mech" points="${poly(pl(-28, -.03, 4), pl(28, -.03, 4), pl(28, .03, 4), pl(-28, .03, 4))}"/>
    <polygon class="k sW mech" points="${poly(pl(-28, .03, 4), pl(28, .03, 4), pl(28, .03, 0), pl(-28, .03, 0))}"/>`;
  // the tube (drawn from the collar down), the collar, the screw, the top plate
  const tA = Y(40), tB = 1;
  s += `<polygon class="k sW" points="${poly(side(tA, -9), side(tA, 9), side(tB, 9), side(tB, -9))}"/>
    <path class="hl sW" d="M${pt(side(tA, -5))} L${pt(side(tB, -5))}"/>`;
  s += `<polygon class="k sW" points="${poly(side(Y(10), -5), side(Y(10), 5), side(Y(32), 5), side(Y(32), -5))}"/>`;
  for (let h = 12; h < 31; h += 3) s += `<path class="hl sW" d="M${pt(side(Y(h), -5))} L${pt(side(Y(h + 2), 5))}"/>`;
  s += `<polygon class="k sW mech" points="${poly(side(Y(31), -12), side(Y(31), 12), side(Y(40), 12), side(Y(40), -12))}"/>
    <path class="hl sW" d="M${pt(side(Y(31), -4))} L${pt(side(Y(40), -4))} M${pt(side(Y(31), 4))} L${pt(side(Y(40), 4))}"/>
    <path class="hl sW" d="M${pt(side(Y(36), 13))} L${pt(side(Y(36), 22))}"/>`;      // the collar's tommy-bar hole
  s += `<polygon class="k sW mech" points="${poly([tx - 26 * s_, ty], [tx + 26 * s_, ty], [tx + 26 * s_, ty + 6 * s_], [tx - 26 * s_, ty + 6 * s_])}"/>`;
  [-19, 19].forEach(dx => s += `<path class="k sW mech" d="M${fx(tx + (dx - 3) * s_)},${fx(ty + 6 * s_)} L${fx(tx + (dx + 3) * s_)},${fx(ty + 6 * s_)} L${fx(tx + (dx + 3) * s_)},${fx(ty + 9 * s_)} L${fx(tx + (dx - 3) * s_)},${fx(ty + 9 * s_)} Z"/>`);
  // rust: streaks from the top plate and the collar, a bloom round the base
  const streak = (t0, dx, l, w) => { const a = side(t0, dx), b = side(Math.min(1, t0 + Y(l)), dx + w);
    return `<path class="hl sA" d="M${pt(a)} C${fx(a[0] + 2 * s_)},${fx(a[1] + (b[1] - a[1]) * .3)} ${fx(b[0] - 2 * s_)},${fx(a[1] + (b[1] - a[1]) * .7)} ${pt(b)}"/>`; };
  s += streak(Y(6), -18, 10 + i * 3, 1) + streak(Y(6), 16, 14, -1) + streak(Y(41), -6, 40 + i * 9, 1) + streak(Y(41), 3, 70 - i * 8, 0) + streak(Y(41), 7, 24, 1);
  s += `<path class="hl sA" d="M${pt(pl(-30, .036, 0))} C${pt(pl(-36, .05, 0))} ${pt(pl(-20, .06, 0))} ${pt(pl(-6, .05, 0))} M${pt(pl(14, .04, 0))} C${pt(pl(24, .055, 0))} ${pt(pl(34, .05, 0))} ${pt(pl(32, .036, 0))}"/>`;
  // the stencil: which post
  { const p = side(Y(70), -6), h = 6 * s_, w = segW(id, h), ax = bxS - tx, ay = byS - ty, al = Math.hypot(ax, ay), ux = ax / al, uy = ay / al;
    // stencilled down the tube: it leans with the post
    s += onQuad(seg(id, 0, 0, h, "s0", 1.1) + seg(id, 0, 0, h, "sM", .5), w, h, p, [p[0] + uy * w, p[1] - ux * w], [p[0] + ux * h, p[1] + uy * h]); }
  // three bolts on the base plate: a hex nut on a threaded stud, or an empty hole and the nut lying where Morris kicked it
  NUTS.forEach(([dx, dk], j) => {
    const c = pl(dx, dk, 4), w = 6 * s_, h = 4 * s_;
    if (j < n) {
      s += `<path class="k sW mech" d="M${fx(c[0] - w)},${fx(c[1])} L${fx(c[0] - w)},${fx(c[1] - h)} L${fx(c[0] - w * .5)},${fx(c[1] - h - 1.6 * s_)} L${fx(c[0] + w * .5)},${fx(c[1] - h - 1.6 * s_)} L${fx(c[0] + w)},${fx(c[1] - h)} L${fx(c[0] + w)},${fx(c[1])} Z"/>
        <path class="hl sW" d="M${fx(c[0] - w)},${fx(c[1] - h)} L${fx(c[0] + w)},${fx(c[1] - h)} M${fx(c[0])},${fx(c[1] - h)} L${fx(c[0])},${fx(c[1])}"/>
        <path class="sW" d="M${fx(c[0])},${fx(c[1] - h - 1)} L${fx(c[0])},${fx(c[1] - h - 4.5 * s_)}"/>
        <path class="hl sA" d="M${fx(c[0] + w * .6)},${fx(c[1])} L${fx(c[0] + w * .8)},${fx(c[1] + 2.5 * s_)}"/>`;
    } else {
      s += `<ellipse class="k hl sW" cx="${fx(c[0])}" cy="${fx(c[1])}" rx="${fx(3.2 * s_)}" ry="${fx(1.2 * s_)}"/><path class="hl sA" d="M${fx(c[0] - 4 * s_)},${fx(c[1] + .6)} L${fx(c[0] + 4 * s_)},${fx(c[1] + .6)}"/>`;
      // the nut, lying on its side on the floor in front
      const off = [[-30, .07], [26, .08], [6, .1]][j], q = P(bx + off[0] + (X < 320 ? -1 : 1) * 4, FY, k + off[1]), r = 4.6 * s_;
      const hex = sweep(0, 5, 5, m => [q[0] + Math.cos(m * Math.PI / 3 + .3) * r, q[1] - r + Math.sin(m * Math.PI / 3 + .3) * r * .9]);
      s += `<polygon class="k sW mech" points="${hex.map(pt).join(" ")}"/><circle class="hl sW" cx="${fx(q[0])}" cy="${fx(q[1] - r)}" r="${fx(r * .45)}"/>`;
    }
  });
  // a post with nothing left holding it hums under the load; once they're all out, the whole thing groans
  if (n === 0) {
    const p = [tx, ty + 4 * s_];
    s += `<g class="pz on" data-g="hum" data-i="0">${arcs(p[0] - 30 * s_, p[1], -1, "sW", 2, .6 * s_)}${arcs(p[0] + 30 * s_, p[1], 1, "sW", 2, .6 * s_)}</g>
      <g class="pz" data-g="hum" data-i="1">${arcs(p[0] - 32 * s_, p[1], -1, "sW", 3, .6 * s_)}${arcs(p[0] + 32 * s_, p[1], 1, "sW", 3, .6 * s_)}</g>`;
    // the base has skidded: scrape marks back to where it stood
    const o = P(X, FY, k + .03), m = P(bx, FY, k + .03);
    s += `<path class="hl sM" d="M${pt(o)} L${pt(m)} M${fx(o[0])},${fx(o[1] - 2 * s_)} L${fx(m[0])},${fx(m[1] - 2 * s_)}"/>`;
  }
  const xs = [tx - 28 * s_, tx + 28 * s_, P(bx - 30, FY, k)[0], P(bx + 30, FY, k)[0]];
  return s + `${hit(fx(Math.min(...xs)), fx(ty - 2), fx(Math.max(...xs) - Math.min(...xs)), fx(P(0, FY, k + .03)[1] - ty + 4))}</g>`;
}

/* ---- the chilled-water line along the right, the Table's tap, the hose down through the floor ---- */
const CW = { X: 610, k: .78, hole: [584, .7] };
function chillerLine() {
  // the pipe itself is atmosphere (no hotspot): it runs front to back under the pad and into the back wall
  const top = deep(CW.X, 3.4, KB, 30, 24), bot = deep(CW.X, 3.4, KB, 40, 24);
  let s = `<polygon class="k sB" points="${[...top, ...bot.slice().reverse()].map(pt).join(" ")}"/>`;
  [2.6, 2.0, 1.5, 1.15, .9, .66, .5, .38].forEach(k => s += `<path class="hl sB" d="${L([C(CW.X, k, 30), C(CW.X, k, 40)])}"/><path class="hl sM" d="${L([C(CW.X, k + .02, k > .95 || (k < .87 && k > .63) || k < .57 ? 0 : BD), C(CW.X, k + .02, 30)])}"/>`);
  // stencilled along the underside of the pipe, receding with it
  { const t = "CHW SUPPLY 3T", h = 4.4, w = segW(t, h), x0 = C(CW.X, 1.0, 40)[0] - 50, kAt = (x) => (x - 320) / (CW.X - 320);
    const kf = kAt(x0), kn = kAt(x0 + w), km = (kf + kn) / 2, d0 = 40 + 3 / km, d1 = d0 + h / km;
    s += onQuad(seg(t, 0, 0, h, "sB", .6), w, h, C(CW.X, kf, d0), C(CW.X, kn, d0), C(CW.X, kf, d1)); }
  return s;
}
function chiller(G) {
  const { X, k } = CW, [hX, hk] = CW.hole, s_ = k;
  const t0 = C(X, k, 40), t1 = C(X, k, 50), v = C(X, k, 50);
  let s = `<g data-hs="chiller">`;
  // the tap: a saddle clamp on the pipe, a stub down, a crude brass valve with its wheel, a hose barb
  s += `<path class="k sB mech" d="M${fx(t0[0] - 7 * s_)},${fx(t0[1] - 11 * s_)} L${fx(t0[0] + 7 * s_)},${fx(t0[1] - 11 * s_)} L${fx(t0[0] + 7 * s_)},${fx(t0[1] + 1)} L${fx(t0[0] - 7 * s_)},${fx(t0[1] + 1)} Z"/>
    <path class="hl sB" d="M${fx(t0[0] - 9 * s_)},${fx(t0[1] - 6 * s_)} L${fx(t0[0] + 9 * s_)},${fx(t0[1] - 6 * s_)}"/>
    <path class="sB" d="M${fx(t0[0] - 2.5 * s_)},${fx(t0[1] + 1)} L${fx(t1[0] - 2.5 * s_)},${fx(t1[1])} M${fx(t0[0] + 2.5 * s_)},${fx(t0[1] + 1)} L${fx(t1[0] + 2.5 * s_)},${fx(t1[1])}"/>
    <path class="k sA mech" d="M${fx(v[0] - 6 * s_)},${fx(v[1])} L${fx(v[0] + 6 * s_)},${fx(v[1])} L${fx(v[0] + 4 * s_)},${fx(v[1] + 10 * s_)} L${fx(v[0] - 4 * s_)},${fx(v[1] + 10 * s_)} Z"/>
    <ellipse class="k sA" cx="${fx(v[0] - 13 * s_)}" cy="${fx(v[1] + 5 * s_)}" rx="${fx(2.4 * s_)}" ry="${fx(6 * s_)}"/><path class="hl sA" d="M${fx(v[0] - 13 * s_)},${fx(v[1] - 1 * s_)} L${fx(v[0] - 13 * s_)},${fx(v[1] + 11 * s_)} M${fx(v[0] - 11 * s_)},${fx(v[1] + 5 * s_)} L${fx(v[0] - 6 * s_)},${fx(v[1] + 5 * s_)}"/>
    <path class="hl sM" d="M${fx(v[0] - 6 * s_)},${fx(v[1] + 3 * s_)} L${fx(v[0] + 6 * s_)},${fx(v[1] + 4 * s_)} M${fx(v[0] - 5 * s_)},${fx(v[1] + 7 * s_)} L${fx(v[0] + 5 * s_)},${fx(v[1] + 6 * s_)}"/>`;  // the electrical tape
  // the tag on a wire: the insignia, lit
  { const wx = v[0] + 5 * s_, wy = v[1] + 6 * s_, gx = wx + 6 * s_, gy = wy + 9 * s_;
    s += `<path class="hl sW" d="M${fx(wx)},${fx(wy)} L${fx(gx)},${fx(gy)}"/><path class="k sX mech" d="M${fx(gx - 4.5 * s_)},${fx(gy)} L${fx(gx + 4.5 * s_)},${fx(gy)} L${fx(gx + 4.5 * s_)},${fx(gy + 12 * s_)} L${fx(gx - 4.5 * s_)},${fx(gy + 12 * s_)} Z"/>
      ${insignia(+gx.toFixed(1), +(gy + 6 * s_).toFixed(1), +(2.6 * s_).toFixed(2))}`; }
  // the hose: a black rubber line (two strokes) sagging from the barb down into a hole broken in the floor
  const a = [v[0], v[1] + 12 * s_], hole = P(hX, FY, hk), m1 = [a[0] + 4, a[1] + 40], m2 = [hole[0] + 22, hole[1] - 36];
  const hose = (o) => `M${fx(a[0] + o)},${fx(a[1])} C${fx(m1[0] + o)},${fx(m1[1])} ${fx(m2[0] + o)},${fx(m2[1])} ${fx(hole[0] + o)},${fx(hole[1] - 1)}`;
  // the hole: broken concrete, ragged, black; the floor's rebar showing
  const rag = sweep(0, 11, 11, i => { const t = i / 12 * Math.PI * 2, r = 1 + ((i * 37) % 5 - 2) * .08; return [hole[0] + Math.cos(t) * 13 * hk * r, hole[1] + Math.sin(t) * 3.6 * hk * r]; });
  s += `<polygon class="k sM" points="${rag.map(pt).join(" ")}"/><path class="hl sA" d="M${fx(hole[0] - 12 * hk)},${fx(hole[1] - 1)} L${fx(hole[0] - 6 * hk)},${fx(hole[1] + 2)} M${fx(hole[0] + 7 * hk)},${fx(hole[1] - 2)} L${fx(hole[0] + 13 * hk)},${fx(hole[1] + 1)}"/>`;
  s += `<path class="sB" d="${hose(-1.4)}"/><path class="sB" d="${hose(1.4)}"/><path class="hl sB" d="M${fx(a[0] - 3)},${fx(a[1] + 3)} L${fx(a[0] + 3)},${fx(a[1] + 3)}"/>`;
  { const [x, y] = hole; s += seg("B3", x - 26, y - 8, 4.2, "sM", .5) + `<path class="hl sM" d="M${fx(x - 15)},${fx(y - 5.5)} L${fx(x - 8)},${fx(y - 2)} M${fx(x - 11)},${fx(y - 2.4)} L${fx(x - 8)},${fx(y - 2)} L${fx(x - 9)},${fx(y - 5)}"/>`; }
  // drips: from the valve and the clamp, and the puddle under it
  const pud = P(X - 6, FY, k + .02);
  s += `<ellipse class="hl sB" cx="${fx(pud[0])}" cy="${fx(pud[1])}" rx="${fx(16 * s_)}" ry="${fx(2.4 * s_)}"/><ellipse class="hl sB" cx="${fx(pud[0] + 3)}" cy="${fx(pud[1])}" rx="${fx(7 * s_)}" ry="${fx(1 * s_)}"/>`;
  const drop = (x, y) => `<path class="sB" d="M${fx(x)},${fx(y)} L${fx(x)},${fx(y + 3)}"/>`;
  s += `<g class="pz on" data-g="drip" data-i="0">${drop(v[0] + 2, v[1] + 13 * s_)}${drop(t0[0] + 7 * s_, t0[1] + 4)}${drop(pud[0] + 2, pud[1] - 50)}</g>
    <g class="pz" data-g="drip" data-i="1">${drop(v[0] + 2, v[1] + 30 * s_)}${drop(t0[0] + 7 * s_, t0[1] + 22)}<path class="hl sB" d="M${fx(pud[0] - 4)},${fx(pud[1] - 3)} L${fx(pud[0] - 6)},${fx(pud[1] - 6)} M${fx(pud[0] + 4)},${fx(pud[1] - 3)} L${fx(pud[0] + 6)},${fx(pud[1] - 6)}"/></g>`;
  const x0 = Math.min(hole[0] - 16, v[0] - 18), y0 = t0[1] - 14;
  return s + `${hit(fx(x0), fx(y0), fx(Math.max(v[0], t0[0]) + 16 - x0), fx(hole[1] + 6 - y0))}</g>`;
}

/* ---- water off the beams: rust drips onto the post bases, puddles where the steel stands ---- */
function wet() {
  let s = "";
  const drops0 = [], drops1 = [];
  POSTS.forEach((p, i) => {
    const kk = p.k + .03, c = P(p.X + (i % 2 ? 22 : -24), FY, kk + .02);
    s += `<ellipse class="hl sB" cx="${fx(c[0])}" cy="${fx(c[1])}" rx="${fx(18 * p.k)}" ry="${fx(2.4 * p.k)}"/>`;
    const src = C(p.X + (i % 2 ? 22 : -24), p.k + .03, BD);
    drops0.push([src[0], src[1] + 4]); drops1.push([src[0], src[1] + (c[1] - src[1]) * .55]);
  });
  const d = (arr) => arr.map(([x, y]) => `<path class="sB" d="M${fx(x)},${fx(y)} L${fx(x)},${fx(y + 3)}"/>`).join("");
  return s + `<g class="pz on" data-g="drip" data-i="0">${d(drops0)}</g><g class="pz" data-g="drip" data-i="1">${d(drops1)}</g>`;
}

/* ---- the riser Morris came up: a brass pipe standing out of the floor, open-mouthed ---- */
function riser() {
  const X = 44, k = .95, s_ = k, f0 = P(X, FY, k), m = P(X, FY - 40, k);
  const hw = 9 * s_;
  let s = `<g data-hs="riser">
    <ellipse class="k sA" cx="${fx(f0[0])}" cy="${fx(f0[1])}" rx="${fx(15 * s_)}" ry="${fx(3 * s_)}"/>
    <polygon class="k sA" points="${poly([f0[0] - hw, f0[1]], [f0[0] + hw, f0[1]], [m[0] + hw, m[1] + 4], [m[0] - hw, m[1] + 4])}"/>
    <path class="hl sA" d="M${fx(f0[0] - hw)},${fx(f0[1] - 14 * s_)} L${fx(f0[0] + hw)},${fx(f0[1] - 14 * s_)}"/>
    <path class="k sA" d="M${fx(m[0] - hw)},${fx(m[1] + 4)} L${fx(m[0] - hw - 3 * s_)},${fx(m[1])} L${fx(m[0] + hw + 3 * s_)},${fx(m[1])} L${fx(m[0] + hw)},${fx(m[1] + 4)} Z"/>
    <ellipse class="k sA" cx="${fx(m[0])}" cy="${fx(m[1])}" rx="${fx(hw + 3 * s_)}" ry="${fx(3.2 * s_)}"/><ellipse class="hl sA" cx="${fx(m[0])}" cy="${fx(m[1])}" rx="${fx(hw - 1)}" ry="${fx(2 * s_)}"/>
    ${chip("DOWN: HUB", +(m[0] - 18).toFixed(1), +(m[1] - 18).toFixed(1), 4, "fA")}`;
  return s + `${hit(fx(m[0] - 22), fx(m[1] - 20), 48, fx(f0[1] - m[1] + 24))}</g>`;
}

/* ---- supportsOut: cracks, spalled chunks, dust, ((( ))) ---- */
// a crack: the waypoints, zigzagged (deterministically) between them
function crack(pts, w = "sW") {
  const o = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const m = Math.max(2, Math.round(d / 7));
    for (let j = 1; j < m; j++) { const t = j / m, z = ((i * 7 + j * 13) % 5 - 2) * 1.3; o.push([a[0] + dx * t + nx * z, a[1] + dy * t + ny * z]); }
    o.push(b);
  }
  return `<path class="${w}" d="${L(o)}"/>`;
}
function giving() {
  let s = "";
  // cracks across the pad underside, out of the grating's corners and along the beams
  const c = (X, k) => C(X, k, 0);
  s += crack([c(GR.x0, GR.k0), c(196, 1.02), c(184, .99), c(150, .97), c(120, .955)]);
  s += crack([c(GR.x1, GR.k0), c(446, 1.0), c(470, .985), c(500, .96)]);
  s += crack([c(GR.x0, GR.k1), c(180, 1.8), c(150, 1.85), c(110, 2.05)], "hl sW");
  s += crack([c(GR.x1, GR.k1), c(462, 1.75), c(500, 1.9), c(540, 1.95)], "hl sW");
  s += crack([c(GR.x0 + 40, GR.k1), c(250, 2.75), c(236, 2.95), c(262, 3.3)]) + crack([c(250, 2.75), c(210, 2.9), c(170, 2.88)], "hl sW");
  s += crack([c(GR.x1 - 70, GR.k1), c(380, 2.8), c(400, 3.0), c(392, 3.4)]) + crack([c(380, 2.8), c(430, 2.95)], "hl sW");
  s += crack([c(320, GR.k0), c(330, .98), c(322, .95)], "hl sW");
  s += crack([c(300, .82), c(312, .76), c(296, .7), c(318, .66), c(306, .62)]);
  s += crack([c(184, .99), c(176, 1.06), c(168, 1.08)], "hl sW") + crack([c(470, .985), c(476, 1.08), c(490, 1.12)], "hl sW");
  s += crack([c(380, .8), c(400, .74), c(392, .7)], "hl sW") + crack([c(240, .55), c(260, .5), c(252, .46)], "hl sW");
  // a spalled slab of concrete hanging by its rebar over the middle
  { const a = c(250, .84), b = c(286, .84), r = [a[0] + 4, a[1] + 14], q = [b[0] - 2, b[1] + 10];
    s += `<polygon class="k sM" points="${poly(a, b, q, r)}"/><path class="hl sA" d="M${pt(a)} C${fx(a[0] + 2)},${fx(a[1] + 6)} ${fx(r[0] - 4)},${fx(r[1] - 4)} ${pt(r)}"/>`; }
  // dust sifting down from the cracks (two poses), and a fallen chunk on the floor
  const dust = (p) => [[150, .97], [470, .985], [306, .7], [268, .84], [196, 1.02]].map(([X, k], i) => { const a = c(X, k), y = a[1] + 6 + p * 22 + i * 3;
    return `<circle class="fM" cx="${fx(a[0] - 2)}" cy="${fx(y)}" r=".9"/><circle class="fM" cx="${fx(a[0] + 2)}" cy="${fx(y + 7)}" r=".7"/><circle class="fM" cx="${fx(a[0])}" cy="${fx(y + 14 + p * 6)}" r=".6"/><path class="hl sM" d="M${fx(a[0] - 3)},${fx(y - 2)} L${fx(a[0] - 3)},${fx(y + 3)} M${fx(a[0] + 3)},${fx(y + 4)} L${fx(a[0] + 3)},${fx(y + 9)}"/>`; }).join("");
  s += `<g class="pz on" data-g="drip" data-i="0">${dust(0)}</g><g class="pz" data-g="drip" data-i="1">${dust(1)}</g>`;
  { const f = P(300, FY, .74); s += `<polygon class="k sM" points="${poly([f[0] - 9, f[1]], [f[0] - 6, f[1] - 6], [f[0] + 2, f[1] - 8], [f[0] + 8, f[1] - 2], [f[0] + 6, f[1]])}"/>
    <polygon class="k sM" points="${poly([f[0] + 14, f[1] + 1], [f[0] + 15, f[1] - 3], [f[0] + 20, f[1] - 3], [f[0] + 20, f[1] + 1])}"/><circle class="fM" cx="${fx(f[0] - 14)}" cy="${fx(f[1])}" r=".8"/>`; }
  // the whole pad groaning: ((( ))) off both ends of the near beam and the grating
  const lA = C(60, .93, BD * .5), rA = C(580, .93, BD * .5), g0 = c(GR.x0 - 10, 1.3), g1 = c(GR.x1 + 10, 1.3);
  s += `<g class="pz on" data-g="hum" data-i="0">${arcs(lA[0], lA[1], -1, "sW", 3, 1)}${arcs(rA[0], rA[1], 1, "sW", 3, 1)}${arcs(g0[0], g0[1], -1, "sW", 2, .8)}${arcs(g1[0], g1[1], 1, "sW", 2, .8)}</g>
    <g class="pz" data-g="hum" data-i="1">${arcs(lA[0] - 4, lA[1], -1, "sW", 2, 1.3)}${arcs(rA[0] + 4, rA[1], 1, "sW", 2, 1.3)}${arcs(g0[0] - 3, g0[1], -1, "sW", 3, .8)}${arcs(g1[0] + 3, g1[1], 1, "sW", 3, .8)}</g>`;
  s += star4(+C(150, .9, BD)[0].toFixed(1), +(C(150, .9, BD)[1] + 2).toFixed(1), 4, "sW") + star4(+C(490, .9, BD)[0].toFixed(1), +(C(490, .9, BD)[1] + 2).toFixed(1), 3.4, "sW");
  return s;
}

export default {
  id: "crawlspace", name: "UNDER THE 3T", pp,
  floor: { yMin: 246, yMax: 287, margin: 16 },
  entries: { fromHub: [92, 282, 1] },
  draw(G) {
    S = state(G);
    let back = room() + grating(G) + beam(.6, .03) + beam(.9, .03, [212, "3T PAD · MAX LOAD 6 T"]) + chillerLine() + wet();
    if (S.out) back += giving();
    const yP = (i) => P(0, FY, POSTS[i].k + .03)[1];
    return { back, sortables: [
      ...POSTS.map((p, i) => ({ depth: yP(i), svg: post(i) })),
      { depth: P(0, FY, CW.hole[1])[1], svg: chiller(G) },
      { depth: P(0, FY, .95)[1], svg: riser() },
    ] };
  },
  stand: { posts: [216, 282], grating: [320, 266], chiller: [538, 270], riser: [92, 282] },
  labels: {
    morris: { posts: { use: "LOOSEN THE BOLTS" }, grating: { look: "LOOK UP" }, chiller: { use: "CHEW THE HOSE" }, riser: { go: "BACK DOWN" } },
    night: { posts: { use: "LOOSEN THE BOLTS" }, grating: { look: "LOOK UP" }, chiller: { use: "CHEW THE HOSE" }, riser: { go: "BACK DOWN" } },
  },
};
