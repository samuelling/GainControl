// B3 · ANTECHAMBER (Act V, night) — a low barrel-vaulted room under Fechner Hall. A rack of hooded robes on the left
// (one hook empty), a wall of member portraits at the back (old men, every plaque AGE 39), the inner door with the lit
// insignia at the back right and a hooded doorkeeper beside it, a lectern with the guest book, and the tunnel doorway
// on the left wall (the way in).
import { seg, segC, chip, perspective, hit } from "../gfx.js";
import { AUD } from "../figures.js";
import { doorkeeper } from "../cast/act5b.js";

const pp = perspective(320, 140, 0.45);
const { P, poly, ln, kAtY, FY, KB } = pp;
const floorY = (k) => P(0, FY, k)[1];
const fx = (n) => n.toFixed(1);
const SPRING = 72, CROWN = -40;   // the vault springs from the walls at Y 72 and peaks above the frame

// one rib of the barrel vault at depth k (a quadratic through the crown)
function rib(k, cls) {
  const a = P(0, SPRING, k), b = P(640, SPRING, k), c = P(320, CROWN, k);
  const cy = 2 * c[1] - a[1];
  return `<path class="${cls}" d="M${fx(a[0])},${fx(a[1])} Q${fx(c[0])},${fx(cy)} ${fx(b[0])},${fx(b[1])}"/>`;
}

// the insignia: a ring seated around a smaller ring (the Round Table), six seat dots; lit
function insignia(x, y, r) {
  return `<circle class="k sX" cx="${x}" cy="${y}" r="${r}"/><circle class="fX" cx="${x}" cy="${y}" r="${fx(r * .38)}"/>
    ${[0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3 - Math.PI / 2; return `<circle class="fX" cx="${fx(x + Math.cos(a) * r * .7)}" cy="${fx(y + Math.sin(a) * r * .7)}" r="${fx(r * .12)}"/>`; }).join("")}`;
}

function room() {
  let s = "";
  // floor grid
  for (let X = -160; X <= 800; X += 80) s += ln([X, FY], P(X, FY, KB), "hl sN");
  [.55, .66, .8].forEach(k => s += ln(P(0, FY, k), P(640, FY, k), "hl sN"));
  // a runner from the front to the inner door (atmosphere)
  s += ln(P(420, FY, 1), P(420, FY, KB), "hl sD") + ln(P(530, FY, 1), P(530, FY, KB), "hl sD");
  // walls and the vault: ribs at each depth, the crown line running to the back
  const BL = P(0, FY, KB), BR = P(640, FY, KB), SL = P(0, SPRING, KB), SR = P(640, SPRING, KB);
  s += ln([0, FY], BL, "sM") + ln([640, FY], BR, "sM") + ln(BL, BR, "sM") + ln(BL, SL, "sM") + ln(BR, SR, "sM");
  s += ln(P(0, SPRING, 1), SL, "hl sD") + ln(P(640, SPRING, 1), SR, "hl sD") + ln(P(320, CROWN, 1), P(320, CROWN, KB), "hl sD");
  [.55, .66, .8, .96].forEach(k => s += rib(k, "hl sD"));
  s += rib(KB, "sM");
  // stone courses on the back wall (atmosphere)
  [150, 176].forEach(y => s += `<path class="hl sD" d="M${fx(BL[0])},${y} L${fx(BR[0])},${y}"/>`);
  return s;
}

// sconces on the back wall: a bracket and a small lit flame (pose group "flicker")
function sconce(x, y) {
  return `<path class="hl sD" d="M${x},${y + 10} L${x},${y + 4} M${x - 4},${y + 4} L${x + 4},${y + 4} M${x},${y + 10} L${x - 3},${y + 14}"/>
    <g class="pz on" data-g="flicker" data-i="0"><path class="fA" d="M${x},${y - 5} C${x + 2.6},${y - 1} ${x + 2},${y + 3} ${x},${y + 3} C${x - 2},${y + 3} ${x - 2.6},${y - 1} ${x},${y - 5} Z"/></g>
    <g class="pz" data-g="flicker" data-i="1"><path class="fA" d="M${x + .6},${y - 3} C${x + 2.2},${y} ${x + 1.6},${y + 3} ${x},${y + 3} C${x - 1.6},${y + 3} ${x - 2},${y} ${x + .6},${y - 3} Z"/></g>`;
}

// the portraits of members: gilt frames, old faces (wrinkles, jowls, a beard), each plaque AGE 39
function portraits() {
  const faces = [
    // bald, deep forehead lines
    `<path class="hl sW" d="M-6,-2 C-7,-12 7,-12 6,-2 M-4,-7 L4,-7 M-4,-9 L4,-9 M-3,3 L3,3 M-5,0 C-6,6 6,6 5,0"/>`,
    // swept-back hair, jowls
    `<path class="hl sW" d="M-6,-3 C-6,-12 6,-12 6,-3 M-6,-6 C-2,-10 2,-10 6,-6 M-6,1 C-7,6 -3,7 -1,7 M6,1 C7,6 3,7 1,7 M-2,2 L2,2"/>`,
    // beard
    `<path class="hl sW" d="M-6,-2 C-6,-11 6,-11 6,-2 M-6,-1 C-6,8 6,8 6,-1 M-3,-4 L-1,-4 M1,-4 L3,-4 M-2,3 L2,3 M-4,5 L-3,7 M0,6 L0,8 M4,5 L3,7"/>`,
    // spectacles, crow's feet
    `<path class="hl sW" d="M-6,-3 C-6,-12 6,-12 6,-3 M-6,-3 C-6,6 6,6 6,-3 M-5,-4 L-1,-4 L-1,-1 L-5,-1 Z M1,-4 L5,-4 L5,-1 L1,-1 Z M-7,-2 L-8,-1 M7,-2 L8,-1 M-2,3 L2,3"/>`,
    // comb-over, bow tie below
    `<path class="hl sW" d="M-6,-2 C-6,-11 6,-11 6,-2 M-7,-6 C-2,-9 3,-9 7,-8 M-6,-2 C-6,7 6,7 6,-2 M-2,2 L2,2 M-3,10 L3,13 L3,10 L-3,13 Z"/>`,
  ];
  const yrs = ["1962", "1974", "1983", "1997", "2011"];
  let s = `<g data-hs="portraits">`;
  faces.forEach((f, i) => {
    const x = 198 + i * 30, y = 112;
    s += `<rect class="k sA mech" x="${x - 11}" y="${y}" width="22" height="28"/><rect class="hl sA mech" x="${x - 9}" y="${y + 2}" width="18" height="24"/>
      <g transform="translate(${x},${y + 13})">${f}</g>
      <path class="hl sW" d="M${x - 7},${y + 26} C${x - 6},${y + 21} ${x + 6},${y + 21} ${x + 7},${y + 26}"/>
      <rect class="k hl sA mech" x="${x - 9}" y="${y + 31}" width="18" height="10"/>${segC("AGE 39", x, y + 33, 2.6, "sA", .45)}${segC(yrs[i], x, y + 37.2, 2, "sM", .4)}`;
  });
  return s + `${seg("MEMBERS IN GOOD STANDING", 192, 100, 3.2, "sM", .5)}${hit(184, 96, 148, 48)}</g>`;
}

// the inner door: arched double doors at the back right, the insignia lit above the join
function inner(G) {
  const x0 = P(430, 0, KB)[0], x1 = P(530, 0, KB)[0], top = P(0, 116, KB)[1], fy = floorY(KB), xm = (x0 + x1) / 2, r = (x1 - x0) / 2;
  const arch = `M${fx(x0)},${fx(fy)} L${fx(x0)},${fx(top)} A${fx(r)},${fx(r)} 0 0 1 ${fx(x1)},${fx(top)} L${fx(x1)},${fx(fy)}`;
  return `<g data-hs="inner"><path class="k sW mech" d="${arch} Z"/>
    <path class="hl sW" d="M${fx(xm)},${fx(top - r + 2)} L${fx(xm)},${fx(fy)} M${fx(x0 + 3)},${fx(fy)} L${fx(x0 + 3)},${fx(top)} A${fx(r - 3)},${fx(r - 3)} 0 0 1 ${fx(x1 - 3)},${fx(top)} L${fx(x1 - 3)},${fx(fy)}"/>
    ${[0, 1, 2].map(i => `<path class="hl sW" d="M${fx(x0 + 3)},${fx(top + 20 + i * 22)} L${fx(x1 - 3)},${fx(top + 20 + i * 22)}"/>`).join("")}
    <path class="sW" d="M${fx(xm - 3)},${fx(top + 40)} L${fx(xm - 3)},${fx(top + 47)} M${fx(xm + 3)},${fx(top + 40)} L${fx(xm + 3)},${fx(top + 47)}"/>
    ${insignia(xm, top + 4, 6.5)}
    ${hit(x0 - 2, top - r - 2, x1 - x0 + 4, fy - top + r + 4)}</g>`;
}

// the tunnel doorway in the left wall, nearest you: an open arch onto the steam tunnels
function tunnel() {
  const k1 = .76, k2 = .94, Y0 = 124;
  const a = P(0, Y0, k1), b = P(0, Y0, k2), c = P(0, FY, k2), d = P(0, FY, k1), m = P(0, Y0 - 34, (k1 + k2) / 2);
  const ia = P(0, Y0 + 14, k1 + .03), ib = P(0, Y0 + 14, k2 - .03), im = P(0, Y0 - 14, (k1 + k2) / 2);
  return `<g data-hs="tunnel">
    <path class="k sW mech" d="M${fx(d[0])},${fx(d[1])} L${fx(a[0])},${fx(a[1])} Q${fx(m[0])},${fx(2 * m[1] - (a[1] + b[1]) / 2)} ${fx(b[0])},${fx(b[1])} L${fx(c[0])},${fx(c[1])}"/>
    <path class="hl sD" d="M${fx(ia[0])},${fx(d[1] - 6)} L${fx(ia[0])},${fx(ia[1])} Q${fx(im[0])},${fx(2 * im[1] - (ia[1] + ib[1]) / 2)} ${fx(ib[0])},${fx(ib[1])} L${fx(ib[0])},${fx(c[1] - 10)}"/>
    <path class="hl sN" d="M${fx(ia[0])},${fx(d[1] - 6)} L${fx(ib[0])},${fx(c[1] - 10)} M${fx(ia[0] + (ib[0] - ia[0]) * .5)},${fx(ia[1] + 6)} L${fx(ia[0] + (ib[0] - ia[0]) * .5)},${fx((d[1] + c[1]) / 2 - 8)}"/>
    ${chip("TUNNELS", a[0] - 6, a[1] - 34, 4.2, "fW")}
    ${hit(Math.min(a[0], b[0]) - 2, a[1] - 36, Math.abs(b[0] - a[0]) + 4, c[1] - a[1] + 38)}</g>`;
}

// the robe rack, left: a rail on two uprights, five hooks, four hooded robes (the fifth hook is empty)
const RACK = { k: .62, X0: 30, X1: 214 };
function rack(G) {
  const k = RACK.k, q = k * AUD, y = floorY(k), x0 = P(RACK.X0, 0, k)[0], x1 = P(RACK.X1, 0, k)[0], top = y - 150 * q;
  let s = `<g data-hs="rack">
    <path class="sM" d="M${fx(x0)},${fx(y)} L${fx(x0)},${fx(top)} L${fx(x1)},${fx(top)} L${fx(x1)},${fx(y)} M${fx(x0 - 8)},${fx(y)} L${fx(x0 + 8)},${fx(y)} M${fx(x1 - 8)},${fx(y)} L${fx(x1 + 8)},${fx(y)}"/>`;
  const n = 5, gap = (x1 - x0) / (n + .2);
  for (let i = n - 1; i >= 0; i--) {
    const cx = x0 + gap * (i + .6), ht = top + 4;
    s += `<path class="hl sM" d="M${fx(cx)},${fx(top)} L${fx(cx)},${fx(ht)}"/>`;
    if (i === 1) { s += `<path class="hl sM" d="M${fx(cx - 7)},${fx(ht + 3)} L${fx(cx)},${fx(ht)} L${fx(cx + 7)},${fx(ht + 3)}"/>`; continue; }   // Gus's hook: empty
    const w = 20 * q * 2.1, h = 118 * q, hb = ht + 18 * q * 2;
    s += `<path class="k sV" d="M${fx(cx - w * .32)},${fx(hb)} C${fx(cx - w * .7)},${fx(hb + h * .4)} ${fx(cx - w * .62)},${fx(ht + h * .8)} ${fx(cx - w * .58)},${fx(ht + h)} L${fx(cx + w * .58)},${fx(ht + h)} C${fx(cx + w * .62)},${fx(ht + h * .8)} ${fx(cx + w * .7)},${fx(hb + h * .4)} ${fx(cx + w * .32)},${fx(hb)} Z"/>
      <path class="k sV" d="M${fx(cx - w * .34)},${fx(hb + 2)} C${fx(cx - w * .4)},${fx(ht + 6)} ${fx(cx - w * .14)},${fx(ht)} ${fx(cx)},${fx(ht)} C${fx(cx + w * .14)},${fx(ht)} ${fx(cx + w * .4)},${fx(ht + 6)} ${fx(cx + w * .34)},${fx(hb + 2)} Z"/>
      <path class="hl sV" d="M${fx(cx - w * .16)},${fx(hb + 6)} L${fx(cx - w * .26)},${fx(ht + h - 2)} M${fx(cx + w * .16)},${fx(hb + 6)} L${fx(cx + w * .26)},${fx(ht + h - 2)}"/>
      <circle class="hl sD" cx="${fx(cx + w * .2)}" cy="${fx(hb + 10)}" r="1.4"/>`;
  }
  s += `${chip("COAT CHECK", x0 + 4, top - 12, 3.6, "fV")}${hit(x0 - 10, top - 14, x1 - x0 + 20, y - top + 16)}</g>`;
  return s;
}

// the lectern with the guest book, front right of center
const LEC = { k: .7, X: 352 };
function lectern(G) {
  const k = LEC.k, q = k * AUD, y = floorY(k), x = P(LEC.X, 0, k)[0], top = y - 66 * q * 1.4;
  return `<g data-hs="book">
    <path class="sM" d="M${fx(x)},${fx(y)} L${fx(x)},${fx(top + 6)} M${fx(x - 12)},${fx(y)} L${fx(x + 12)},${fx(y)}"/>
    <path class="k sM mech" d="M${fx(x - 16)},${fx(top + 8)} L${fx(x + 16)},${fx(top + 8)} L${fx(x + 13)},${fx(top)} L${fx(x - 13)},${fx(top)} Z"/>
    <path class="k sW" d="M${fx(x - 14)},${fx(top + 2)} L${fx(x)},${fx(top + 4)} L${fx(x + 14)},${fx(top + 2)} L${fx(x + 13)},${fx(top - 4)} L${fx(x)},${fx(top - 2)} L${fx(x - 13)},${fx(top - 4)} Z"/>
    <path class="hl sW" d="M${fx(x)},${fx(top - 2)} L${fx(x)},${fx(top + 4)} M${fx(x - 11)},${fx(top - 1.5)} C${fx(x - 8)},${fx(top - 3)} ${fx(x - 6)},${fx(top)} ${fx(x - 3)},${fx(top - 1)} M${fx(x - 11)},${fx(top + 1)} C${fx(x - 9)},${fx(top - .5)} ${fx(x - 6)},${fx(top + 2)} ${fx(x - 3)},${fx(top + 1)} M${fx(x + 3)},${fx(top - 1)} C${fx(x + 6)},${fx(top - 2.5)} ${fx(x + 8)},${fx(top)} ${fx(x + 11)},${fx(top - 1)}"/>
    <path class="sA" d="M${fx(x + 9)},${fx(top + 1)} L${fx(x + 18)},${fx(top - 9)}"/>
    ${chip("GUEST BOOK", x - 15, top + 11, 3, "fW")}
    ${hit(x - 18, top - 12, 38, y - top + 14)}</g>`;
}

const DK = { k: .53, X: 566 };
function keeper(G) {
  const k = DK.k, q = k * AUD, y = floorY(k), x = P(DK.X, 0, k)[0];
  return `<g data-hs="doorkeeper">${doorkeeper(x, y, k)}${hit(x - 30 * q, y - 172 * q, 60 * q, 174 * q)}</g>`;
}

export default {
  id: "antechamber", name: "B3 · ANTECHAMBER", pp,
  floor: { yMin: 228, yMax: 287, margin: 16 },
  entries: { fromTunnels: [72, 274, 1], fromChamber: [404, 232, -1] },
  draw(G) {
    const back = room() + sconce(184, 120) + sconce(352, 118) + portraits() + inner(G) + tunnel();
    return { back, sortables: [
      { depth: floorY(DK.k), svg: keeper(G) },
      { depth: floorY(RACK.k), svg: rack(G) },
      { depth: floorY(LEC.k), svg: lectern(G) },
    ] };
  },
  stand: { rack: [190, 250], portraits: [262, 232], book: [318, 256], doorkeeper: [420, 232], inner: [396, 230], tunnel: [70, 274] },
  labels: {
    night: { doorkeeper: { talk: "ANSWER" }, inner: { go: "GO IN" }, portraits: { look: "READ THE PLAQUES" }, rack: { use: "BROWSE" },
      book: { look: "READ", use: "SIGN" }, tunnel: { go: "BACK" } },
    morris: { doorkeeper: { use: "SNIFF" }, inner: { go: "SLIP IN" }, tunnel: { go: "SCURRY BACK" }, rack: { use: "CLIMB" } },
  },
};
