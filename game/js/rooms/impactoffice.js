// PROF. IMPACT 3F — a corner office, too big. A framed print of the Big Finding's Figure 2 (THE LASAGNA), a frame of keynote
// lanyards, a filing cabinet, a corner window with a plane crossing it, an executive desk with a laptop open on
// Reviewer 2's report and a drawer (the NRT card, the draft letter), and a first-class airline seat. Act IV.
import { seg, segC, chip, perspective, shell, sideDoor, hit, arcs } from "../gfx.js";
import { AUD } from "../figures.js";

const pp = perspective(320, 130, 0.5);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];
const f1 = (a) => a.map(v => v.toFixed(1)).join(",");
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// Figure 2, as printed: a close-up of folded cortex (pial surface, six layer lines following the fold, the white-matter
// boundary) with a depth probe, and a sulcus with walls too straight to be real
function figure2(x, y, w, h) {
  // gyri are broad crowns, sulci narrow and deep; the layers thin at the crowns' flanks and bunch in the fundus
  const fold = (t) => { const pts = []; for (let i = 0; i <= 48; i++) { const u = i / 48;
    const g = Math.pow(Math.abs(Math.sin(Math.PI * (u * 1.6 + .2))), .7);
    pts.push([x + 6 + u * (w - 12), y + 12 + (1 - g) * h * .5 + t * h * .2 * (1 + .6 * (1 - g))]); }
    return "M" + pts.map(f1).join(" L"); };
  let s = `<rect class="k sW mech" x="${x}" y="${y}" width="${w}" height="${h}"/><rect class="hl sM mech" x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}"/>`;
  s += `<path class="sK" d="${fold(0)}"/>`;
  for (let i = 1; i <= 5; i++) s += `<path class="hl sR" d="${fold(i / 6)}"/>`;
  s += `<path class="sW" d="${fold(1)}"/>`;
  // the "sulcus": a gap with dead-straight walls, where somebody cut a slice (Figure 2 is a lasagna; see minigames/lasagna.js)
  const gx = x + w * .6, gw = w * .11;
  s += `<rect class="k" style="stroke:none" x="${gx}" y="${y + 6}" width="${gw}" height="${h - 20}"/><path class="sM" d="M${gx},${y + 6} L${gx},${y + h - 14} M${gx + gw},${y + 6} L${gx + gw},${y + h - 14}"/>`
        + `<path class="sB" d="M${x + w * .3},${y + 10} L${x + w * .34},${y + h - 14}"/><circle class="fB" cx="${x + w * .34}" cy="${y + h - 14}" r="1.2"/>`;
  s += chip("FIG. 2", x + 4, y + h - 10, 3.4, "fW") + seg("VALU ET AL.", x + w - 34, y + h - 9, 3, "sM", .5);
  return s;
}

function back(G) {
  let s = shell(pp, { rail: false });
  // a skirting of carpet: the office is too big; a rug in perspective (atmosphere)
  s += `<polygon class="hl sD" points="${poly(P(150, FY, .56), P(500, FY, .56), P(500, FY, .94), P(150, FY, .94))}"/>`;
  // back wall left: Figure 2, framed, lit by a picture light
  s += `<g data-hs="figure">${figure2(176, 80, 92, 72)}<path class="sA" d="M200,74 L244,74 M222,74 L222,79"/>${hit(172, 70, 100, 86)}</g>`;
  // back wall right: a shadow box of keynote lanyards
  const LX = 300, LY = 78;
  s += `<g data-hs="lanyards"><rect class="k sW mech" x="${LX}" y="${LY}" width="88" height="62"/><rect class="hl sM mech" x="${LX + 3}" y="${LY + 3}" width="82" height="56"/>
        ${[0, 1, 2, 3, 4].map(i => { const cx = LX + 12 + i * 16, cls = ["sA", "sB", "sV", "sA", "sG"][i];
          return `<path class="hl ${cls}" d="M${cx - 5},${LY + 6} L${cx},${LY + 30} L${cx + 5},${LY + 6}"/><rect class="k ${cls}" x="${cx - 6}" y="${LY + 30}" width="12" height="15"/>
            ${seg("KEY", cx - 4.2, LY + 33, 2.6, cls, .45)}<path class="hl ${cls}" d="M${cx - 4},${LY + 40} L${cx + 4},${LY + 40}"/>`; }).join("")}
        ${segC("KEYNOTES 1998-2026", LX + 44, LY + 51, 3, "sM", .5)}${hit(LX - 2, LY - 2, 92, 66)}</g>`;
  // back wall, right corner: a filing cabinet (atmosphere), a dying ficus
  s += `<rect class="k sM mech" x="420" y="140" width="40" height="70"/>${[0, 1, 2].map(i => `<rect class="hl sM mech" x="423" y="${143 + i * 22}" width="34" height="19"/><path class="hl sM" d="M434,${150 + i * 22} L446,${150 + i * 22}"/>`).join("")}
        <path class="hl sD" d="M402,210 L398,196 L414,196 L410,210 M406,196 L406,170 M406,180 C400,176 396,178 394,182 M406,174 C412,168 418,170 418,174 M406,186 C412,184 414,188 412,192"/>`;
  // left wall: the door (the keypad is on the far side)
  const d = sideDoor(pp, 0, .58, .74, 112);
  s += `<g data-hs="door">${d.svg}${chip("STAIRS", d.a[0] - 4, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  // right wall: the corner window, floor to ceiling, a plane crossing it (pose group "drip": it jumps between two positions)
  const w = [P(640, 40, .56), P(640, 40, .9), P(640, 220, .9), P(640, 220, .56)];
  const at = (u, v) => lerp(lerp(w[0], w[1], u), lerp(w[3], w[2], u), v);
  const plane = (u, v) => { const [x, y] = at(u, v); return `<path class="sW" d="M${x - 9},${y + 1} L${x + 9},${y - 1} M${x - 1},${y} L${x + 4},${y - 6} M${x - 1},${y} L${x + 3},${y + 5} M${x - 8},${y + 1} L${x - 10},${y - 3}"/>
      <path class="hl sW dash" d="M${x - 12},${y + 1.4} L${x - 40},${y + 4}"/>`; };
  s += `<g data-hs="window"><polygon class="k sW mech" points="${poly(...w)}"/>
        ${[.33, .66].map(u => `<path class="hl sW mech" d="M${f1(at(u, 0))} L${f1(at(u, 1))}"/>`).join("")}<path class="hl sW mech" d="M${f1(at(0, .7))} L${f1(at(1, .7))}"/>
        <g class="day-only"><path class="hl sD" d="M${f1(at(.1, .3))} C${f1(at(.14, .24))} ${f1(at(.24, .24))} ${f1(at(.26, .3))} M${f1(at(.6, .5))} C${f1(at(.64, .44))} ${f1(at(.74, .44))} ${f1(at(.76, .5))}"/></g>
        <g class="pz on" data-g="drip" data-i="0">${plane(.42, .2)}</g><g class="pz" data-g="drip" data-i="1">${plane(.62, .16)}</g>
        ${[.08, .2, .38, .55, .72, .9].map((u, i) => { const a = at(u, 1); return `<path class="hl sM mech" d="M${f1(a)} L${f1([a[0], a[1] - 8 - (i % 3) * 7])}"/>`; }).join("")}
        ${hit(Math.min(w[0][0], w[1][0]) - 2, w[1][1] - 2, Math.abs(w[1][0] - w[0][0]) + 4, w[2][1] - w[1][1] + 4)}</g>`;
  return s;
}

// the executive desk, front-centre-left: laptop (Reviewer 2's report), a drawer in the pedestal facing you
function desk(G) {
  const k1 = .64, k2 = .76, H = 236, X0 = 170, X1 = 400;
  const A = P(X0, H, k2), B = P(X1, H, k2), C = P(X1, H, k1), D = P(X0, H, k1), yb = floorY(k2);
  let s = `<polygon class="k sW" points="${poly(A, B, C, D)}"/>
    <rect class="k sM mech" x="${A[0]}" y="${A[1]}" width="${B[0] - A[0]}" height="${yb - A[1]}"/>
    <path class="hl sD" d="M${A[0] + 4},${A[1] + 6} L${B[0] - 4},${A[1] + 6}"/>`;
  // a desk set: a nameplate and a model plane on a stand
  const n = P(340, H, .72);
  s += `<path class="k sW" d="M${n[0] - 18},${n[1]} L${n[0] + 18},${n[1]} L${n[0] + 16},${n[1] - 7} L${n[0] - 16},${n[1] - 7} Z"/>${segC("M. IMPACT", n[0], n[1] - 5.6, 3, "sA", .5)}`;
  const m = P(386, H, .68);
  s += `<path class="hl sM" d="M${m[0]},${m[1]} L${m[0]},${m[1] - 12} M${m[0] - 4},${m[1]} L${m[0] + 4},${m[1]}"/><path class="sW" d="M${m[0] - 10},${m[1] - 13} L${m[0] + 10},${m[1] - 15} M${m[0] - 1},${m[1] - 14} L${m[0] + 3},${m[1] - 21} M${m[0] - 1},${m[1] - 14} L${m[0] + 2},${m[1] - 8}"/>`;
  // the laptop, open: REVIEWER 2
  const L = P(250, H, .71), lw = 44;
  s += `<g data-hs="desk"><path class="k sW" d="M${L[0] - lw / 2},${L[1]} L${L[0] + lw / 2},${L[1]} L${L[0] + lw / 2 - 4},${L[1] - 6} L${L[0] - lw / 2 + 4},${L[1] - 6} Z"/>
    <rect class="k sW mech" x="${L[0] - lw / 2 + 4}" y="${L[1] - 36}" width="${lw - 8}" height="30"/>
    ${chip("REVIEWER 2", L[0] - 16, L[1] - 33, 3, "fR")}${[0, 1, 2, 3].map(i => `<path class="hl sW" d="M${L[0] - 15},${L[1] - 22 + i * 4} L${L[0] + (i === 3 ? 4 : 14)},${L[1] - 22 + i * 4}"/>`).join("")}
    ${seg("NUERON", L[0] - 15, L[1] - 13.8, 2.4, "sR", .4)}
    ${hit(L[0] - lw / 2 - 2, L[1] - 40, lw + 4, 44)}</g>`;
  // the pedestal drawer, facing you
  const dx = A[0] + 12, dy = A[1] + 12, dw = 46, dh = 16;
  s += `<g data-hs="drawer"><rect class="k sW mech" x="${dx}" y="${dy}" width="${dw}" height="${dh}"/><path class="sW" d="M${dx + dw / 2 - 8},${dy + 8} L${dx + dw / 2 + 8},${dy + 8}"/>
    <circle class="hl sA" cx="${dx + dw - 6}" cy="${dy + 5}" r="1.6"/>
    <rect class="hl sM mech" x="${dx}" y="${dy + dh + 3}" width="${dw}" height="${yb - dy - dh - 6}"/>${hit(dx - 2, dy - 2, dw + 4, dh + 4)}</g>`;
  return s;
}

// the first-class airline seat, front right, angled toward the window: headrest cover, seatbelt, reading light, a tray table
function seat(G) {
  const k = .8, y = floorY(k), x = P(520, 0, k)[0], q = k * AUD;
  const u = (a, b) => `${(x + a * q).toFixed(1)},${(y + b * q).toFixed(1)}`;
  return `<g data-hs="chair">
    <path class="hl sM" d="M${u(-30, 0)} L${u(-30, -16)} M${u(30, 0)} L${u(30, -16)} M${u(-36, 0)} L${u(36, 0)}"/>
    <path class="k sB" d="M${u(-34, -16)} L${u(34, -16)} L${u(36, -40)} L${u(-36, -40)} Z"/>
    <path class="k sB" d="M${u(-28, -40)} L${u(-34, -118)} C${u(-34, -130)} ${u(34, -130)} ${u(34, -118)} L${u(28, -40)} Z"/>
    <path class="k sW" d="M${u(-24, -104)} L${u(24, -104)} L${u(26, -124)} L${u(-26, -124)} Z"/>${segC("FIRST", x, y - 120 * q, 9 * q, "sB", .7)}
    <path class="hl sB" d="M${u(-26, -60)} L${u(26, -60)} M${u(-24, -80)} L${u(24, -80)}"/>
    <path class="k sB" d="M${u(-48, -40)} L${u(-34, -40)} L${u(-34, -58)} L${u(-48, -58)} Z M${u(34, -40)} L${u(48, -40)} L${u(48, -58)} L${u(34, -58)} Z"/>
    <path class="sA" d="M${u(-30, -30)} L${u(-6, -26)} M${u(30, -30)} L${u(6, -26)}"/><rect class="k sA" x="${(x - 6 * q).toFixed(1)}" y="${(y - 30 * q).toFixed(1)}" width="${(12 * q).toFixed(1)}" height="${(7 * q).toFixed(1)}"/>
    <path class="hl sM" d="M${u(40, -58)} L${u(44, -136)} L${u(30, -142)}"/><circle class="fA" cx="${(x + 28 * q).toFixed(1)}" cy="${(y - 142 * q).toFixed(1)}" r="1.4"/>
    ${hit(x - 50 * q, y - 146 * q, 100 * q, 148 * q)}</g>`;
}

export default {
  id: "impactoffice", name: "PROF. IMPACT 3F", pp,
  floor: { yMin: 252, yMax: 287, margin: 16 },
  entries: { fromStairs: [110, 262, 1] },
  draw(G) {
    return { back: back(G), sortables: [
      { depth: floorY(.76), svg: desk(G) },
      { depth: floorY(.8), svg: seat(G) },
    ] };
  },
  stand: { desk: [250, 256], drawer: [214, 260], figure: [222, 254], lanyards: [344, 254], window: [560, 270], chair: [456, 268],
    door: [104, 266] },
  labels: {
    day: { desk: { use: "READ THE REVIEW" }, figure: { use: "OVERLAY YOUR SCAN" }, drawer: { use: "OPEN" }, lanyards: { use: "TRY ONE ON" },
      window: { use: "WAVE AT THE PLANE" }, chair: { use: "SIT", }, door: { use: "GO OUT", go: "GO OUT" } },
    night: { desk: { use: "READ THE REVIEW" }, figure: { use: "OVERLAY YOUR SCAN" }, drawer: { use: "OPEN" }, lanyards: { use: "TRY ONE ON" },
      window: { use: "WAVE AT THE PLANE" }, chair: { use: "SIT" }, door: { use: "GO OUT", go: "GO OUT" } },
    morris: { desk: { use: "WALK ON THE KEYS" }, drawer: { use: "SQUEEZE IN" }, chair: { use: "RECLINE" }, lanyards: { use: "CLIMB" },
      door: { go: "SCURRY OUT" } },
  },
};
