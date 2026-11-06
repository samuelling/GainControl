// B3 · POWER PLANT (Act V, night) — the old supply for the 1960s magnet. Tall cabinets of analog meters (back left),
// the breaker panel with six big breakers A–F and the FIELD meter above them (back center), the giant knife switch
// (back right), conduit running off to the chamber, the operator's manual on a lectern (front left), the service stair
// up to the chamber (right wall) and the way back to the tunnels (left wall).
// G.flags.brk: the breakers thrown so far, in order (e.g. "CAD"): those are up, the rest down.
// G.flags.knife: the knife switch is closed. G.flags.magnetCharged: the field meter pegs and the conduit hums.
import { seg, segC, chip, perspective, sideDoor, hit, arcs, star4, wallPatch } from "../gfx.js";
import { AUD } from "../figures.js";

const pp = perspective(320, 130, 0.5);
const { P, poly, ln, kAtY, FY, KB } = pp;
const floorY = (k) => P(0, FY, k)[1];
const fx = (n) => n.toFixed(1);
const BW = { x0: P(0, 0, KB)[0], x1: P(640, 0, KB)[0], top: P(0, 0, KB)[1], fy: floorY(KB) };   // back wall: 160..480 × 65..210

function room() {
  let s = "";
  for (let X = -160; X <= 800; X += 80) s += ln([X, FY], P(X, FY, KB), "hl sN");
  [.6, .72, .86].forEach(k => s += ln(P(0, FY, k), P(640, FY, k), "hl sN"));
  const TL = P(0, 0, KB), TR = P(640, 0, KB), BL = P(0, FY, KB), BR = P(640, FY, KB);
  s += `<polyline class="sM" points="${poly([0, 0], TL, TR, [640, 0])}"/><polyline class="sM" points="${poly([0, FY], BL, BR, [640, FY])}"/>` + ln(TL, BL, "sM") + ln(TR, BR, "sM");
  // ceiling beams and two caged bulbs (atmosphere)
  [.6, .78].forEach(k => s += ln(P(0, 0, k), P(640, 0, k), "hl sD"));
  [[200, .7], [440, .7]].forEach(([X, k]) => { const c = P(X, 8, k), r = 4;
    s += `<path class="hl sA" d="M${fx(c[0])},${fx(c[1] - 8)} L${fx(c[0])},${fx(c[1])} M${fx(c[0] - r)},${fx(c[1])} C${fx(c[0] - r)},${fx(c[1] + 2.4 * r)} ${fx(c[0] + r)},${fx(c[1] + 2.4 * r)} ${fx(c[0] + r)},${fx(c[1])} Z M${fx(c[0])},${fx(c[1])} L${fx(c[0])},${fx(c[1] + 2 * r)}"/>`; });
  // conduit: from the panel and the knife switch up into the ceiling and off toward the chamber
  [[296, 290], [306, 300], [344, 360], [354, 370]].forEach(([x, X]) => s += ln([x, 80], [x, BW.top], "hl sD") + ln(P(X, 0, KB), P(X, 0, 1), "hl sD"));
  [[416, 520, .64], [428, 540, .6]].forEach(([x, X, k]) => s += ln([x, 86], [x, BW.top], "sM") + ln(P(X, 0, KB), P(X, 0, k), "sM") + ln(P(X, 0, k), P(640, 0, k), "sM"));
  // a stencil on the back wall
  s += seg("PSYCHOPHYSICS ANNEX · MAGNET SUPPLY", 172, 194, 3.4, "sD", .5);
  return s;
}

// a small rectangular meter face; the needle is jittered by the engine (class "needle", pivot data-cx/cy)
function meter(x, y, lbl) {
  const cx = x + 4, cy = y + 13;
  const ticks = [-1, -.7, -.4, -.1, .2, .4].map(a => `M${fx(cx + Math.cos(a) * 7)},${fx(cy + Math.sin(a) * 7)} L${fx(cx + Math.cos(a) * 9)},${fx(cy + Math.sin(a) * 9)}`).join(" ");
  return `<rect class="k sW mech" x="${x}" y="${y}" width="16" height="16"/><path class="hl sW" d="${ticks}"/>
    <path class="needle sR" data-cx="${cx}" data-cy="${cy}" d="M${cx},${cy} L${cx + 4},${cy - 3}"/><circle class="fW" cx="${cx}" cy="${cy}" r=".9"/>
    ${seg(lbl, x + 1, y - 4.5, 2.4, "sM", .4)}`;
}

// three tall supply cabinets of meters, back wall left
function cabinets() {
  let s = `<g data-hs="meters">`;
  const lbls = [["AMPS", "VOLTS"], ["COIL A", "COIL B"], ["TEMP", "KG"]];
  [0, 1, 2].forEach(i => {
    const x = 168 + i * 30;
    s += `<rect class="k sM mech" x="${x}" y="80" width="28" height="${BW.fy - 80}"/><path class="hl sM" d="M${x},166 L${x + 28},166"/>
      ${meter(x + 6, 92, lbls[i][0])}${meter(x + 6, 124, lbls[i][1])}
      ${[0, 1, 2].map(j => `<circle class="hl sW" cx="${x + 7 + j * 7}" cy="154" r="2"/>`).join("")}
      ${[0, 1, 2, 3].map(j => `<path class="hl sD" d="M${x + 5},${172 + j * 6} L${x + 23},${172 + j * 6}"/>`).join("")}`;
  });
  return s + `${hit(164, 76, 94, BW.fy - 74)}</g>`;
}

// the breaker panel: six big breakers A–F, each up if its letter is in G.flags.brk; the FIELD meter above
function panel(G) {
  const brk = typeof G.flags.brk === "string" ? G.flags.brk : "", n = Math.min(6, brk.length), charged = !!G.flags.magnetCharged;
  let s = `<g data-hs="panel"><rect class="k sW mech" x="262" y="78" width="116" height="110"/><rect class="hl sW mech" x="266" y="82" width="108" height="102"/>`;
  // FIELD meter: a half dial, its needle set by how many breakers are in
  const cx = 320, cy = 112, r = 17, a = Math.PI + (charged ? 1.06 : n / 6) * Math.PI;
  s += `<path class="sW" d="M${cx - r - 3},${cy} A${r + 3},${r + 3} 0 0 1 ${cx + r + 3},${cy} Z"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => { const t = Math.PI + i / 6 * Math.PI; return `<path class="hl sW" d="M${fx(cx + Math.cos(t) * (r - 3))},${fx(cy + Math.sin(t) * (r - 3))} L${fx(cx + Math.cos(t) * r)},${fx(cy + Math.sin(t) * r)}"/>`; }).join("")}
    <path class="hl sR" d="M${fx(cx + Math.cos(Math.PI * 1.84) * r)},${fx(cy + Math.sin(Math.PI * 1.84) * r)} A${r},${r} 0 0 1 ${cx + r},${cy}"/>
    <path class="${charged ? "sG" : "sR"}" d="M${cx},${cy} L${fx(cx + Math.cos(a) * (r - 1))},${fx(cy + Math.sin(a) * (r - 1))}"/><circle class="fW" cx="${cx}" cy="${cy}" r="1.3"/>
    ${segC("FIELD", cx, cy - 11, 2.6, "sM", .4)}${seg("0", cx - r - 2, cy + 2.5, 2.6, "sM", .4)}${seg("15 KG", cx + r - 6, cy + 2.5, 2.6, "sM", .4)}`;
  if (charged) s += arcs(cx + r + 8, cy - 8, 1, "sG", 2, .6) + arcs(cx - r - 8, cy - 8, -1, "sG", 2, .6);
  // the six breakers
  "ABCDEF".split("").forEach((L, i) => {
    const x = 270 + i * 17.5, up = brk.includes(L);
    s += `${segC(L, x + 5, 128, 5, "sW", .9)}<rect class="hl sW mech" x="${x}" y="136" width="10" height="34"/>
      <path class="hl sM" d="M${x + 5},139 L${x + 5},167"/>
      ${up ? `<path class="sW" d="M${x + 5},153 L${x + 5},142"/><rect class="k sW" x="${x - 1}" y="138" width="12" height="7" rx="1.5"/>`
           : `<path class="sW" d="M${x + 5},153 L${x + 5},164"/><rect class="k sW" x="${x - 1}" y="161" width="12" height="7" rx="1.5"/>`}
      ${up ? `<circle class="fG" cx="${x + 5}" cy="177" r="1.6"/>` : `<circle class="hl sD" cx="${x + 5}" cy="177" r="1.4"/>`}`;
  });
  return s + `${hit(258, 74, 124, 118)}</g>`;
}

// the giant knife switch on the back wall, right: hinge at the bottom, jaws at the top; open = blades swung out
function knife(G) {
  const closed = !!G.flags.knife, hx = 422, hy = 172, L = 64, jy = hy - L;
  const blades = (t) => `<g transform="rotate(${t} ${hx} ${hy})">
    <path class="k sA mech" d="M${hx - 13},${hy} L${hx - 13},${jy} L${hx - 8},${jy} L${hx - 8},${hy} Z M${hx + 8},${hy} L${hx + 8},${jy} L${hx + 13},${jy} L${hx + 13},${hy} Z"/>
    <path class="k sA mech" d="M${hx - 16},${jy + 6} L${hx + 16},${jy + 6} L${hx + 16},${jy + 11} L${hx - 16},${jy + 11} Z"/>
    <path class="k sW" d="M${hx - 4},${jy + 6} L${hx - 4},${jy - 12} C${hx - 4},${jy - 16} ${hx + 4},${jy - 16} ${hx + 4},${jy - 12} L${hx + 4},${jy + 6} Z"/>
    <path class="hl sW" d="M${hx - 4},${jy - 4} L${hx + 4},${jy - 4} M${hx - 4},${jy} L${hx + 4},${jy}"/></g>`;
  let s = `<g data-hs="knife"><rect class="k sM mech" x="${hx - 28}" y="${jy - 22}" width="56" height="${hy - jy + 34}"/>
    <rect class="hl sM mech" x="${hx - 24}" y="${jy - 18}" width="48" height="${hy - jy + 26}"/>
    ${[-10.5, 10.5].map(d => `<path class="sA mech" d="M${hx + d - 5},${jy + 10} L${hx + d - 5},${jy - 2} M${hx + d + 5},${jy + 10} L${hx + d + 5},${jy - 2}"/><path class="sA" d="M${hx + d - 5},${hy + 4} L${hx + d + 5},${hy + 4}"/><circle class="sA" cx="${hx + d}" cy="${hy}" r="2.5"/>`).join("")}
    ${chip("MAIN · 1968", hx - 24, hy + 14, 3, closed ? "fG" : "fW")}`;
  s += closed ? blades(0) + `${star4(hx - 18, jy + 2, 4, "sA")}${star4(hx + 19, jy - 2, 3, "sA")}${arcs(hx + 30, jy + 6, 1, "sA", 2, .7)}${arcs(hx - 30, jy + 6, -1, "sA", 2, .7)}`
              : blades(30) + seg("OFF", hx - 22, jy - 14, 3, "sM", .5);
  return s + `${hit(hx - 30, jy - 26, 90, hy - jy + 52)}</g>`;
}

// the service stair: an opening in the right wall with treads rising toward the back, a handrail
function stair() {
  const k1 = .6, k2 = .82, top = 92;
  const a = P(640, top, k1), b = P(640, top, k2), c = P(640, FY, k2), d = P(640, FY, k1);
  let s = `<g data-hs="stair"><polygon class="k sW mech" points="${poly(a, b, c, d)}"/>`;
  // the stair seen in profile through the opening, in the wall's plane: treads rising from the near jamb to the far one
  // (each tread runs back toward the vanishing point), a handrail above. Laid out in wall coordinates (depth k, height Y).
  const W = (k, Y) => P(640, Y, k), n = 8;
  const S = { z: 1 / (k2 - .016), Y: FY - 4.4 }, E = { z: 1 / (k1 + .016), Y: top + 43 };
  const at = (t) => ({ k: 1 / (S.z + (E.z - S.z) * t), Y: S.Y + (E.Y - S.Y) * t });       // even steps in depth
  const ptk = (k, Y) => { const p = W(k, Y); return `${fx(p[0])},${fx(p[1])}`; };
  let st = `M${ptk(at(0).k, S.Y)}`;
  for (let i = 0; i < n; i++) { const p = at((i + 1) / n), y0 = at(i / n).Y; st += ` L${ptk(p.k, y0)} L${ptk(p.k, p.Y)}`; }
  const R = 36, rail = (t) => { const p = at(t); return W(p.k, p.Y - R); };
  const post = (t) => { const p = at(t); return `M${ptk(p.k, p.Y - R)} L${ptk(p.k, p.Y - R + 22)}`; };
  const r0 = rail(0), r1 = rail(1);
  s += `<path class="hl sW" d="${st}"/><path class="sM" d="M${fx(r0[0])},${fx(r0[1])} L${fx(r1[0])},${fx(r1[1])}"/>
    <path class="hl sM" d="${post(.25)} ${post(.7)}"/>`;
  // UP, and its arrow, painted on the far jamb
  { const up = wallPatch(pp, 640, .623, .686, 104, 124);
    s += up.put(`${seg("UP", 2, 2.6, 4, "sW", .6)}<path class="hl sW" d="M11,8.6 l0,-6 l-2,2 M11,2.6 l2,2"/>`); }
  s += chip("SERVICE STAIR", a[0] - 48, a[1] - 14, 3.8, "fW");
  const xs = [a, b, c, d].map(p => p[0]), ys = [a, b, c, d].map(p => p[1]);
  return s + `${hit(Math.min(...xs) - 2, Math.min(...ys) - 16, Math.max(...xs) - Math.min(...xs) + 4, Math.max(...ys) - Math.min(...ys) + 18)}</g>`;
}

function tunnel() {
  const d = sideDoor(pp, 0, .8, .95, 120);
  return `<g data-hs="tunnel">${d.svg}${chip("TUNNELS", d.a[0] - 2, d.a[1] - 14, 4.2, "fW")}${hit(...d.box)}</g>`;
}

// the operator's manual, open on a lectern, front left: a fat COOL binder, dust, a margin full of handwriting
const LEC = { k: .78, X: 150 };
function manual(G) {
  const k = LEC.k, q = k * AUD, y = floorY(k), x = P(LEC.X, 0, k)[0], top = y - 92 * q;
  return `<g data-hs="manual">
    <path class="sM" d="M${fx(x)},${fx(y)} L${fx(x)},${fx(top + 7)} M${fx(x - 12)},${fx(y)} L${fx(x + 12)},${fx(y)}"/>
    <path class="k sM mech" d="M${fx(x - 18)},${fx(top + 9)} L${fx(x + 18)},${fx(top + 9)} L${fx(x + 15)},${fx(top)} L${fx(x - 15)},${fx(top)} Z"/>
    <path class="k sB" d="M${fx(x - 19)},${fx(top + 4)} L${fx(x)},${fx(top + 6)} L${fx(x + 19)},${fx(top + 4)} L${fx(x + 18)},${fx(top - 3)} L${fx(x)},${fx(top - 1)} L${fx(x - 18)},${fx(top - 3)} Z"/>
    <path class="k sW" d="M${fx(x - 16)},${fx(top + 2)} L${fx(x)},${fx(top + 3.5)} L${fx(x + 16)},${fx(top + 2)} L${fx(x + 15)},${fx(top - 6)} L${fx(x)},${fx(top - 4)} L${fx(x - 15)},${fx(top - 6)} Z"/>
    <path class="hl sW" d="M${fx(x)},${fx(top - 4)} L${fx(x)},${fx(top + 3.5)} M${fx(x - 12)},${fx(top - 3.5)} L${fx(x - 4)},${fx(top - 2.8)} M${fx(x - 12)},${fx(top - 1.5)} L${fx(x - 4)},${fx(top - .8)} M${fx(x - 12)},${fx(top + .5)} L${fx(x - 6)},${fx(top + 1)}"/>
    <path class="hl sV" d="M${fx(x + 3)},${fx(top - 3)} C${fx(x + 6)},${fx(top - 5)} ${fx(x + 8)},${fx(top - 1)} ${fx(x + 13)},${fx(top - 4)} M${fx(x + 3)},${fx(top)} C${fx(x + 6)},${fx(top - 2)} ${fx(x + 9)},${fx(top + 2)} ${fx(x + 12)},${fx(top - 1)}"/>
    <path class="hl sD" d="M${fx(x - 10)},${fx(top - 9)} L${fx(x - 9)},${fx(top - 9)} M${fx(x + 2)},${fx(top - 11)} L${fx(x + 3)},${fx(top - 11)} M${fx(x + 11)},${fx(top - 8)} L${fx(x + 12)},${fx(top - 8)}"/>
    ${chip("OPERATOR'S MANUAL", x - 22, top + 12, 2.8, "fB")}
    ${hit(x - 24, top - 14, 50, y - top + 16)}</g>`;
}

export default {
  id: "plant", name: "B3 · POWER PLANT", pp,
  floor: { yMin: 224, yMax: 287, margin: 16 },
  entries: { fromTunnels: [84, 276, 1], fromStair: [548, 262, -1] },
  draw(G) {
    return { back: room() + cabinets() + panel(G) + knife(G) + stair() + tunnel(), sortables: [{ depth: floorY(LEC.k), svg: manual(G) }] };
  },
  stand: { panel: [320, 230], meters: [214, 232], knife: [424, 232], manual: [218, 266], stair: [548, 262], tunnel: [84, 276] },
  labels: {
    night: { panel: { use: "THROW BREAKERS" }, manual: { look: "READ" }, knife: { use: "THROW IT" }, meters: { use: "TAP" },
      stair: { go: "CLIMB" }, tunnel: { go: "BACK" } },
    morris: { panel: { use: "CHEW A WIRE" }, manual: { look: "READ" }, knife: { use: "THROW IT" }, stair: { go: "SCURRY UP" }, tunnel: { go: "SCURRY BACK" } },
  },
};
