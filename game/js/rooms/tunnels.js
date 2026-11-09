// STEAM TUNNELS (night) — a one-point corridor of pipes running away under the campus. In the left wall, a bricked-over doorway
// with the NRT insignia scratched into it (chanting through the brick); along the ceiling, a pneumatic tube line with an access
// hatch at reachable height; a leaking pipe joint; a big valve wheel (red herring); the door back to the server room.
import { seg, chip, perspective, hit, arcs } from "../gfx.js";
import { robeOnHook } from "../cast/act4b.js";

const pp = perspective(320, 150, 0.16);
const { P, poly, ln, kAtY, FY, KB } = pp;
const D = [.19, .23, .28, .34, .42, .52, .64, .8];        // depth rings (cross-ties)

const fx = (n) => n.toFixed(1);
const quad = (side, Y1, Y2, k1, k2) => [P(side, Y1, k1), P(side, Y1, k2), P(side, Y2, k2), P(side, Y2, k1)];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function corridor() {
  let s = "";
  // floor: rails to the vanishing point, cross-ties stepping toward you
  for (let X = -160; X <= 800; X += 80) s += ln([X, FY], P(X, FY, KB), "hl sN");
  D.forEach(k => s += ln(P(0, FY, k), P(640, FY, k), "hl sN"));
  // ceiling and wall ribs (concrete arches): dim
  D.forEach(k => s += `<polyline class="hl sD" points="${poly(P(0, FY, k), P(0, 0, k), P(640, 0, k), P(640, FY, k))}"/>`);
  // corners and the dark far end
  const TL = P(0, 0, KB), TR = P(640, 0, KB), BL = P(0, FY, KB), BR = P(640, FY, KB);
  s += ln([0, 0], TL, "sM") + ln([640, 0], TR, "sM") + ln([0, FY], BL, "sM") + ln([640, FY], BR, "sM");
  s += `<polygon class="k sD" points="${poly(TL, TR, BR, BL)}"/>`;
  // caged bulbs on the ceiling, every other rib
  [.28, .42, .64].forEach(k => { const c = P(320, 6, k), r = 5 * k;
    s += `<path class="hl sA" d="M${fx(c[0] - r)},${fx(c[1])} C${fx(c[0] - r)},${fx(c[1] + 2.4 * r)} ${fx(c[0] + r)},${fx(c[1] + 2.4 * r)} ${fx(c[0] + r)},${fx(c[1])} M${fx(c[0])},${fx(c[1])} L${fx(c[0])},${fx(c[1] + 1.8 * r)}"/>`; });
  // pipes along the left wall (atmosphere), with brackets
  [[40, 48], [66, 74]].forEach(([a, b]) => { s += ln(P(0, a, 1), P(0, a, KB), "sM") + ln(P(0, b, 1), P(0, b, KB), "sM"); });
  D.forEach(k => s += ln(P(0, 34, k), P(0, 80, k), "hl sM"));
  // a low pipe along the right wall (atmosphere)
  s += ln(P(640, 236, 1), P(640, 236, KB), "sD") + ln(P(640, 244, 1), P(640, 244, KB), "sD");
  return s;
}

// the bricked-over doorway in the left wall, the insignia scratched into it; chanting through the brick
function bricked(G) {
  const k1 = .44, k2 = .6, Y0 = 108;
  const fr = quad(0, Y0, FY, k1, k2);
  let s = `<g data-hs="bricked"><polygon class="k sW mech" points="${poly(...fr)}"/>`;
  // brick courses following the wall, staggered joints
  for (let Y = Y0 + 14, r = 0; Y < FY; Y += 14, r++) {
    s += ln(P(0, Y, k1), P(0, Y, k2), "hl sM");
    for (let j = 0; j < 4; j++) { const t = (j + (r % 2 ? .5 : 0)) / 4; if (t <= 0 || t >= 1) continue;
      const k = k1 + (k2 - k1) * t; s += ln(P(0, Y - 14, k), P(0, Y, k), "hl sM"); }
  }
  // the insignia: a circle seated around a smaller circle (a round table), foreshortened on the wall
  const c = P(0, 176, .52), rx = 6.5, ry = 15;
  s += `<rect class="k" x="${fx(c[0] - rx - 2)}" y="${fx(c[1] - ry - 2)}" width="${fx(2 * rx + 4)}" height="${fx(2 * ry + 4)}" stroke="none"/>
    <ellipse class="sX" cx="${fx(c[0])}" cy="${fx(c[1])}" rx="${rx}" ry="${ry}" transform="rotate(-6 ${fx(c[0])} ${fx(c[1])})"/>
    <ellipse class="sX" cx="${fx(c[0])}" cy="${fx(c[1])}" rx="2.4" ry="5.6" transform="rotate(-6 ${fx(c[0])} ${fx(c[1])})"/>
    ${[0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3 + .5; return `<circle class="hl sX" cx="${fx(c[0] + Math.cos(a) * 4.2)}" cy="${fx(c[1] + Math.sin(a) * 9.8)}" r=".6"/>`; }).join("")}
    <path class="hl sX" d="M${fx(c[0] - 4)},${fx(c[1] + ry + 4)} L${fx(c[0] - 2)},${fx(c[1] + ry + 10)} M${fx(c[0] + 3)},${fx(c[1] + ry + 3)} L${fx(c[0] + 3)},${fx(c[1] + ry + 8)}"/>`;
  if (G.flags.chanting) {
    const m = lerp(fr[0], fr[3], .45), n = lerp(fr[1], fr[2], .45);
    s += `<g class="pz on" data-g="chant" data-i="0">${arcs(m[0] + 8, m[1], 1, "sR", 2, .9)}${arcs(n[0] - 6, n[1], -1, "sR", 2, .9)}${seg("THE AUTHORS SHOULD CONSIDER", 196, 150, 3.4, "sM", .5)}</g>
      <g class="pz" data-g="chant" data-i="1">${arcs(m[0] + 8, m[1], 1, "sR", 3, 1.1)}${arcs(n[0] - 6, n[1], -1, "sR", 3, 1.1)}${seg("THE AUTHORS SHOULD CONSIDER", 200, 158, 3.4, "sM", .5)}</g>`;
  }
  if (G.act === 4) s += gap();
  const xs = fr.map(p => p[0]), ys = fr.map(p => p[1]);
  return s + hit(Math.min(...xs) - 2, Math.min(...ys) - 2, Math.max(...xs) - Math.min(...xs) + 4, Math.max(...ys) - Math.min(...ys) + 4) + `</g>`;
}

// Act IV: someone has pulled bricks out of the bottom of the doorway (a stepped gap, two loose bricks on the floor)
function gap() {
  const st = [[.53, FY], [.53, 248], [.545, 248], [.545, 234], [.555, 234], [.555, 220], [.575, 220], [.575, 234], [.585, 234], [.585, FY]];
  const g = st.map(([k, Y]) => P(0, Y, k));
  const brick = (X, k, w) => { const a = P(X, FY, k), b = P(X + w, FY, k), c = P(X + w, FY - 12, k), d = P(X, FY - 12, k);
    return `<polygon class="k sM mech" points="${poly(a, b, c, d)}"/>`; };
  return `<polygon class="k sM mech" points="${poly(...g)}"/>${ln(P(0, 226, .565), P(0, FY - 2, .565), "hl sD")}${brick(30, .62, 24)}${brick(70, .66, 24)}`;
}

// Act IV: the Table's coat check, free-standing on the floor beside the bricked door. A rail of hooks with robes
// (one wearing the lit pin from Gus's Act I photo), a reel-to-reel tape on a hook at the right end (PANEL SCORES 1983),
// and a hand-drawn tunnel map pinned to the left upright, B3 circled.
const RK = .6, RX = [112, 282], RBAR = 182;
function coatCheck(G) {
  const y0 = P(0, FY, RK)[1], [xl, xr] = RX.map(X => P(X, 0, RK)[0]), yb = P(0, RBAR, RK)[1], L = (FY - 10 - RBAR) * RK;
  let s = `<g data-hs="rack">
    ${ln([xl, yb - 4], [xl, y0], "sW")}${ln([xr, yb - 4], [xr, y0], "sW")}${ln([xl - 2, yb], [xr + 16, yb], "sW")}
    <path class="hl sW" d="M${fx(xl - 8)},${fx(y0)} L${fx(xl + 8)},${fx(y0)} M${fx(xr - 8)},${fx(y0)} L${fx(xr + 8)},${fx(y0)}"/>
    <circle class="hl sW" cx="${fx(xl)}" cy="${fx(yb - 6)}" r="1.6"/><circle class="hl sW" cx="${fx(xr)}" cy="${fx(yb - 6)}" r="1.6"/>`;
  const n = 4, step = (xr - xl) / (n + .2);
  for (let i = 0; i < n; i++) s += robeOnHook(xl + step * (i + .6), yb, L, i === 2);
  s += hit(fx(xl - 4), fx(yb - 10), fx(xr - xl + 8), fx(y0 - yb + 14)) + `</g>`;
  // the reel, on a hook off the end of the rail
  if (!G.flags.gotReel) {
    const rx = xr + 12, ry = yb + 12, r = 8;
    s += `<g data-hs="reel"><path class="sW" d="M${fx(rx)},${fx(yb)} L${fx(rx)},${fx(ry - r - 1)}"/>
      <circle class="k sB" cx="${fx(rx)}" cy="${fx(ry)}" r="${r}"/><circle class="hl sB" cx="${fx(rx)}" cy="${fx(ry)}" r="${r - 2.4}"/><circle class="hl sB" cx="${fx(rx)}" cy="${fx(ry)}" r="1.4"/>
      ${[0, 1, 2].map(i => { const a = i * 2.094 - 1.571; return `<circle class="hl sB" cx="${fx(rx + Math.cos(a) * 3.6)}" cy="${fx(ry + Math.sin(a) * 3.6)}" r="1.3"/>`; }).join("")}
      <path class="hl sW" d="M${fx(rx + r - 1)},${fx(ry + 2)} L${fx(rx + r + 3)},${fx(ry + 7)}"/>
      <rect class="k sW" x="${fx(rx - 3)}" y="${fx(ry + r + 3)}" width="22" height="13"/>
      ${seg("PANEL SCORES", rx - 1.4, ry + r + 4.6, 2, "sW", .45)}${seg("1983", rx - 1.4, ry + r + 8.4, 5.4, "sW", .9)}
      ${hit(fx(rx - r - 3), fx(yb - 2), fx(2 * r + 18), fx(r * 2 + 30))}</g>`;
  }
  // the map, pinned to the left upright: hand-drawn tunnels, B3 circled
  if (!G.flags.gotMap) {
    const mx = xl - 7, my = yb + 14;
    s += `<g data-hs="map"><g transform="rotate(-6 ${fx(mx + 11)} ${fx(my + 9)})"><rect class="k sW" x="${fx(mx)}" y="${fx(my)}" width="22" height="18"/>
      <path class="hl sW" d="M${fx(mx + 3)},${fx(my + 5)} C${fx(mx + 7)},${fx(my + 4)} ${fx(mx + 10)},${fx(my + 6)} ${fx(mx + 13)},${fx(my + 5)} L${fx(mx + 13)},${fx(my + 13)} C${fx(mx + 9)},${fx(my + 14)} ${fx(mx + 6)},${fx(my + 12)} ${fx(mx + 3)},${fx(my + 13)}
        M${fx(mx + 8)},${fx(my + 5)} L${fx(mx + 8.5)},${fx(my + 13)} M${fx(mx + 13)},${fx(my + 9)} C${fx(mx + 15)},${fx(my + 10)} ${fx(mx + 16)},${fx(my + 12)} ${fx(mx + 15.5)},${fx(my + 14)}"/>
      ${seg("B3", mx + 14.2, my + 12.6, 2.6, "sW", .5)}<ellipse class="hl sR" cx="${fx(mx + 16)}" cy="${fx(my + 13.9)}" rx="3.6" ry="2.8" transform="rotate(-12 ${fx(mx + 16)} ${fx(my + 13.9)})"/>
      <path class="hl sR" d="M${fx(mx + 4)},${fx(my + 9)} L${fx(mx + 6)},${fx(my + 9)} M${fx(mx + 9)},${fx(my + 9.5)} L${fx(mx + 11)},${fx(my + 9.5)} M${fx(mx + 13.5)},${fx(my + 11)} L${fx(mx + 14)},${fx(my + 11.5)}"/></g>
      <circle class="fA" cx="${fx(mx + 11)}" cy="${fx(my + 1.5)}" r="1.2"/>
      ${hit(fx(mx - 3), fx(my - 3), 28, 26)}</g>`;
  }
  return s;
}

// the pneumatic tube line along the ceiling; a canister rattling along it (pose group "tube") while canisterLive
const TX = 430, TY1 = 14, TY2 = 22;
function tube(G) {
  let s = `<g data-hs="tube">${ln(P(TX, TY1, 1), P(TX, TY1, KB), "sW")}${ln(P(TX, TY2, 1), P(TX, TY2, KB), "sW")}
    ${D.map(k => ln(P(TX - 6, 0, k), P(TX - 6, TY2 + 3, k), "hl sM") + ln(P(TX - 6, TY2 + 3, k), P(TX + 6, TY2 + 3, k), "hl sM")).join("")}`;
  if (G.flags.canisterLive) {
    const can = (k) => `<polygon class="fA" points="${poly(P(TX, TY1 + 1, k), P(TX, TY1 + 1, k + .07), P(TX, TY2 - 1, k + .07), P(TX, TY2 - 1, k))}"/>`;
    s += `<g class="pz on" data-g="tube" data-i="0">${can(.38)}${arcs(P(TX, 18, .38)[0] + 6, P(TX, 18, .38)[1], 1, "sA", 2, .35)}</g>
      <g class="pz" data-g="tube" data-i="1">${can(.62)}${arcs(P(TX, 18, .62)[0] + 9, P(TX, 18, .62)[1], 1, "sA", 2, .5)}</g>`;
  }
  // a loud run going past (Act III: something's coming down tonight): vibration arcs all along the line
  if (G.flags.rattleNow && !G.flags.canisterLive) s += [.3, .5, .72].map(k => { const [x, y] = P(TX, 18, k); return arcs(x + 4, y, 1, "sA", 3, .3 + k * .4) + arcs(x - 4, y, -1, "sA", 3, .3 + k * .4); }).join("");
  const a = P(TX, TY1, .9), b = P(TX, TY2, .26);
  return s + hit(fx(b[0] - 8), fx(a[1] - 6), fx(a[0] - b[0] + 16), fx(b[1] - a[1] + 10)) + `</g>`;
}

// the access hatch: the tube drops down the right wall to a junction box at reachable height
function hatch(G) {
  const k1 = .71, k2 = .81, km = (k1 + k2) / 2;
  // the tube's run across to the right wall and down to the box is still the tube (LISTEN anywhere along it): only the box is the hatch
  const r1 = P(TX, TY1, km - .015), r2 = P(640, TY2, km + .015), d1 = P(640, TY1, km - .015), d2 = P(640, 150, km + .015);
  let s = `<g data-hs="tube">${ln(P(TX, TY1, km - .015), P(640, TY1, km - .015), "sW")}${ln(P(TX, TY2, km + .015), P(640, TY2, km + .015), "sW")}
    ${ln(P(640, TY1, km - .015), P(640, 150, km - .015), "sW")}${ln(P(640, TY2, km + .015), P(640, 150, km + .015), "sW")}
    ${hit(fx(Math.min(r1[0], r2[0]) - 4), fx(Math.min(r1[1], r2[1]) - 6), fx(Math.abs(r2[0] - r1[0]) + 8), fx(Math.abs(r2[1] - r1[1]) + 12))}
    ${hit(fx(Math.min(d1[0], d2[0]) - 6), fx(d1[1]), fx(Math.abs(d2[0] - d1[0]) + 12), fx(d2[1] - d1[1] - 2))}</g><g data-hs="hatch">`;
  const box = quad(640, 150, 196, k1, k2), pnl = quad(640, 156, 190, k1 + .015, k2 - .015);
  s += `<polygon class="k sW mech" points="${poly(...box)}"/>${chip("TUBE", box[0][0] - 2, box[0][1] - 11, 3.6, "fW")}`;
  if (G.flags.hatchOpen) {
    // the panel swings out into the corridor on its near hinge
    const h1 = pnl[0], h2 = pnl[3], out = [h1[0] - 18, h1[1] + 3], out2 = [h2[0] - 18, h2[1] - 1];
    s += `<polygon class="k sD mech" points="${poly(...pnl)}"/><path class="hl sD" d="M${fx(pnl[0][0] + 3)},${fx(pnl[0][1] + 8)} L${fx(pnl[1][0] - 3)},${fx(pnl[1][1] + 8)}"/>
      <polygon class="k sW mech" points="${poly(h1, out, out2, h2)}"/><path class="sW" d="M${fx(out[0] + 3)},${fx((out[1] + out2[1]) / 2 - 3)} L${fx(out[0] + 3)},${fx((out[1] + out2[1]) / 2 + 3)}"/>`;
  } else {
    s += `<polygon class="hl sW mech" points="${poly(...pnl)}"/><path class="sW" d="M${fx(pnl[0][0] + 4)},${fx((pnl[0][1] + pnl[3][1]) / 2 - 3)} L${fx(pnl[0][0] + 4)},${fx((pnl[0][1] + pnl[3][1]) / 2 + 3)}"/>`;
  }
  const xs = box.map(p => p[0]);
  return s + hit(Math.min(...xs) - 24, box[0][1] - 14, Math.max(...xs) - Math.min(...xs) + 28, box[2][1] - box[0][1] + 18) + `</g>`;
}

// the leaking joint on the right-wall pipes: steam drips (pose group "drip")
function pipes() {
  const Ys = [92, 100, 116, 124], kf = .5;
  let s = `<g data-hs="pipes">${Ys.map(Y => ln(P(640, Y, 1), P(640, Y, KB), "sB")).join("")}
    ${[.42, .5, .58].map(k => ln(P(640, 86, k), P(640, 130, k), k === kf ? "sB" : "hl sB")).join("")}`;
  const j = P(640, 126, kf), f = P(640, FY, kf);
  s += `<g class="pz on" data-g="drip" data-i="0"><path class="sB" d="M${fx(j[0] - 2)},${fx(j[1] + 6)} L${fx(j[0] - 2)},${fx(j[1] + 9)}"/>
      <path class="hl sW" d="M${fx(j[0] - 6)},${fx(j[1] - 6)} C${fx(j[0] - 10)},${fx(j[1] - 10)} ${fx(j[0] - 4)},${fx(j[1] - 14)} ${fx(j[0] - 9)},${fx(j[1] - 19)}"/></g>
    <g class="pz" data-g="drip" data-i="1"><path class="sB" d="M${fx(j[0] - 2)},${fx((j[1] + f[1]) / 2)} L${fx(j[0] - 2)},${fx((j[1] + f[1]) / 2 + 3)}"/>
      <path class="hl sW" d="M${fx(j[0] - 8)},${fx(j[1] - 8)} C${fx(j[0] - 4)},${fx(j[1] - 12)} ${fx(j[0] - 11)},${fx(j[1] - 16)} ${fx(j[0] - 7)},${fx(j[1] - 22)}"/></g>
    <ellipse class="hl sB" cx="${fx(f[0] - 6)}" cy="${fx(f[1] + 2)}" rx="8" ry="1.6"/>`;
  const a = P(640, 84, .4), b = P(640, 132, .6);
  return s + hit(fx(a[0] - 14), fx(a[1] - 22), fx(b[0] - a[0] + 18), fx(f[1] - a[1] + 26)) + `</g>`;
}

// the valve: a big red wheel on a riser, front left (red herring)
function valve() {
  const k = .9, top = P(0, 74, k), bot = P(0, FY, k), c = P(0, 170, k);
  const sp = [0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3; return `M${fx(c[0])},${fx(c[1])} L${fx(c[0] + Math.cos(a) * 6)},${fx(c[1] + Math.sin(a) * 15)}`; }).join(" ");
  return `<g data-hs="valve">${ln(top, bot, "sM")}${ln([top[0] + 5, top[1] + 2], [bot[0] + 5, bot[1] - 2], "sM")}
    <ellipse class="k sR" cx="${fx(c[0] + 12)}" cy="${fx(c[1])}" rx="7" ry="17"/><ellipse class="hl sR" cx="${fx(c[0] + 12)}" cy="${fx(c[1])}" rx="2" ry="4.5"/>
    <g transform="translate(12,0)"><path class="hl sR" d="${sp}"/></g><path class="sR" d="M${fx(c[0] + 2)},${fx(c[1])} L${fx(c[0] + 10)},${fx(c[1])}"/>
    ${hit(fx(c[0] - 4), fx(c[1] - 22), 28, 44)}</g>`;
}

// the way back: a steel door in the right wall, nearest you
function backDoor() {
  const q = quad(640, 110, FY, .87, .98), xs = q.map(p => p[0]), ys = q.map(p => p[1]);
  return `<g data-hs="back"><polygon class="k sW mech" points="${poly(...q)}"/>
    <path class="sW" d="M${fx(q[0][0] + 6)},${fx((q[0][1] + q[3][1]) / 2)} L${fx(q[0][0] + 6)},${fx((q[0][1] + q[3][1]) / 2 + 8)}"/>
    ${chip("B1 SERVERS", 586, 100, 4.2, "fW")}${hit(Math.min(...xs) - 2, Math.min(...ys) - 2, Math.max(...xs) - Math.min(...xs) + 4, Math.max(...ys) - Math.min(...ys) + 4)}</g>`;
}

export default {
  id: "tunnels", name: "STEAM TUNNELS", pp,
  floor: { yMin: 236, yMax: 287, margin: 16 },
  entries: { fromServer: [578, 280, -1] },
  draw(G) { return { back: corridor() + pipes() + bricked(G) + (G.act === 4 ? coatCheck(G) : "") + tube(G) + hatch(G) + valve() + backDoor(), sortables: [] }; },
  stand: { bricked: [152, 244], tube: [452, 254], hatch: [522, 262], pipes: [440, 246], valve: [96, 282], back: [578, 280],
    rack: [246, 246], reel: [290, 246], map: [200, 248] },
  labels: {
    night: { bricked: { use: "KNOCK", talk: "LISTEN" }, hatch: { use: "OPEN" }, back: { go: "BACK", use: "BACK" }, valve: { use: "TURN" }, pipes: { use: "TOUCH" }, tube: { use: "LISTEN" },
      rack: { use: "PUT ONE ON" }, reel: { use: "TAKE" }, map: { use: "TAKE" } },
    day: { bricked: { use: "KNOCK", talk: "LISTEN" }, hatch: { use: "OPEN" }, back: { go: "BACK", use: "BACK" }, valve: { use: "TURN" }, pipes: { use: "TOUCH" }, tube: { use: "LISTEN" } },
    morris: { bricked: { use: "SNIFF" }, back: { go: "SCURRY BACK" }, pipes: { use: "LICK" } },
  },
};
