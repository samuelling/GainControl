// FIRST-FLOOR HALLWAY, FECHNER HALL — the Rising Stars wall, the Friday 2 PM collision, the Impact Lab door.
import { seg, chip, chipW, perspective, shell, sideDoor, hit, wallPatch, star4, arcs } from "../gfx.js";
import { smallFigure, AUD } from "../figures.js";
import { prestonStanding, danaStanding } from "../cast/act3b.js";
import { impactStanding, codyStanding } from "../cast/act4.js";
import { rexStanding } from "../cast/act3b.js";
import { hoodStanding } from "../cast/act5a.js";

const pp = perspective(320, 140, 0.6);
const { P, poly, FY, kAtY } = pp;
// the patch of side wall behind a screen box x0..x1, y0..y1 (heights read at the box's middle depth)
const wallBox = (side, x0, x1, y0, y1) => { const k = (x) => Math.abs(x - pp.vpx) / Math.abs(side - pp.vpx), ka = k(x0), kb = k(x1), km = (ka + kb) / 2, Y = (y) => pp.vpy + (y - pp.vpy) / km;
  return wallPatch(pp, side, Math.min(ka, kb), Math.max(ka, kb), Y(y0), Y(y1)); };
let ACT = 1;   // the act last drawn: the stairs labels depend on it (Act III has five exits)

function back(G) {
  let s = shell(pp, { rail: false });
  s += pp.ln(P(0, 200, .6), P(640, 200, .6), "hl sD");                       // wainscot
  // fluorescent panels; one flickers (two poses)
  [[256, 384, .7, .78], [256, 384, .86, .95]].forEach(([x1, x2, k1, k2], i) => {
    const q = poly(P(x1, 0, k1), P(x2, 0, k1), P(x2, 0, k2), P(x1, 0, k2));
    s += i === 1 ? `<g class="pz on" data-g="flicker" data-i="0"><polygon class="hl sW day-only" points="${q}"/><polygon class="hl sD night-only" points="${q}"/></g>
                    <g class="pz" data-g="flicker" data-i="1"><polygon class="hl sD" points="${q}"/></g>`
                 : `<polygon class="hl sW day-only" points="${q}"/><polygon class="hl sD night-only" points="${q}"/>`;
  });
  // door 101 (to the seminar room)
  s += `<g data-hs="door101"><rect class="k sW mech" x="146" y="120" width="50" height="110"/><rect class="hl sW mech" x="156" y="132" width="14" height="26"/>
        <path class="sW" d="M188,176 L188,184"/>${chip("101", 172, 124, 5, "fW")}${hit(144, 118, 54, 114)}</g>`;
  // water fountain
  s += `<g data-hs="fountain"><path class="k sW" d="M204,184 L224,184 L222,194 L206,194 Z"/><path class="sW" d="M214,194 L214,206 M210,206 L218,206"/>
        <path class="hl sB" d="M209,184 C210,179 214,178 216,181"/>${hit(200, 176, 28, 34)}</g>`;
  // Rising Stars wall
  s += `<g data-hs="stars">${seg("RISING STARS", 236, 64, 5, "sW", .9)}
        ${[[236, 78], [258, 78], [236, 110], [258, 110], [350, 78], [350, 110]].map(([x, y]) =>
          `<rect class="k hl sM mech" x="${x}" y="${y}" width="18" height="24"/><circle class="hl sM" cx="${x + 9}" cy="${y + 9}" r="4"/><path class="hl sM" d="M${x + 3},${y + 22} C${x + 5},${y + 15} ${x + 13},${y + 15} ${x + 15},${y + 22}"/>`).join("")}
        <rect class="k sA mech" x="284" y="70" width="58" height="72"/>
        <path class="k sA" d="M296,100 C294,86 304,79 314,79 C326,79 334,86 332,98 C328,92 322,90 316,91 C320,87 316,84 310,86 C304,89 300,93 296,100 Z"/>
        <path class="sK" d="M298,100 C298,113 305,121 313,121 C322,121 330,113 330,100"/>
        <circle class="fW" cx="307" cy="104" r="1.5"/><circle class="fW" cx="320" cy="104" r="1.5"/>
        <g class="day-only"><path class="k sW" d="M305,112 C309,117 318,117 322,112 C317,114 310,114 305,112 Z"/></g>
        <g class="night-only"><path class="k sW" d="M300,110 C307,120 320,120 328,110 C319,114 309,114 300,110 Z"/></g>
        <path class="sR" d="M298,136 C300,128 306,124 313,124 C320,124 326,128 328,136"/>
        ${chip("2026", 300, 144, 4, "fA")}${(G.act || 1) >= 2 ? seg("CITATIONS 147,794", 284, 153.5, 3.4, "sA", .6) : ""}${hit(232, 60, 140, 96)}</g>`;
  // bulletin board: the Friday 2 PM collision
  s += `<g data-hs="board"><rect class="k sM mech" x="236" y="164" width="132" height="44"/>
        <g transform="rotate(-3 270 186)"><rect class="k sG mech" x="246" y="168" width="48" height="36"/>${seg("DEFENSE", 250, 172, 5, "sG", .8)}${seg("N. NULL", 250, 181, 4.5, "sW", .7)}${seg("FRI 2PM", 250, 189, 4.5, "sW", .7)}${seg("RM 101", 250, 197, 4.5, "sM", .7)}</g>
        <g transform="rotate(2 334 186)"><rect class="k sR mech" x="310" y="168" width="50" height="36"/>${seg("JOB TALK", 314, 172, 5, "sR", .8)}${seg("P. VALU", 314, 181, 4.5, "sW", .7)}${seg("FRI 2PM", 314, 189, 4.5, "sW", .7)}${seg("RM 101", 314, 197, 4.5, "sM", .7)}</g>
        <circle class="fR" cx="270" cy="168" r="1.4"/><circle class="fR" cx="335" cy="168" r="1.4"/>${hit(234, 162, 136, 48)}</g>`;
  // Impact Lab 116: brushed steel, keypad, light under the door at night
  s += `<g data-hs="impact"><rect class="k sW mech" x="400" y="112" width="54" height="118"/>
        ${[124, 134, 144, 154, 164, 174, 184, 194, 204, 214].map(y => `<path class="hl sD mech" d="M404,${y} L450,${y}"/>`).join("")}
        <rect class="k sW mech" x="440" y="160" width="8" height="12"/>${(G.act || 1) >= 2 && G.mode === "night"
          ? [[442, 162], [444, 162], [446, 162], [442, 165], [444, 165], [446, 165], [442, 168], [444, 168], [446, 168], [444, 171]].map(([x, y], i) =>
              [0, 3, 6, 8].includes(i) ? `<circle class="fG" cx="${x}" cy="${y}" r=".75"/>` : `<circle class="fM" cx="${x}" cy="${y}" r=".35"/>`).join("")
          : `<circle class="fG" cx="444" cy="164" r="1"/><path class="hl sW" d="M442,168 L446,168"/>`}
        ${chip("IMPACT LAB 116", 402, 100, 4.6, "fW")}
        <g class="night-only"><g class="pz on" data-g="hum" data-i="0"><path class="sA" d="M402,229 L452,229"/></g><g class="pz" data-g="hum" data-i="1"><path class="hl sA" d="M402,229 L452,229"/></g></g>
        ${hit(398, 98, 58, 134)}</g>`;
  // a low vent grille on the back wall
  s += `<g data-hs="vent"><rect class="k sW mech" x="368" y="216" width="22" height="9"/>
        ${[0, 1, 2, 3].map(i => `<path class="hl sW" d="M${372 + i * 4.5},218 L${372 + i * 4.5},223"/>`).join("")}${hit(362, 210, 34, 20)}</g>`;
  // tube station on the back wall
  s += `<g data-hs="tube"><path class="sW mech" d="M486,56 L486,230 M494,56 L494,230"/>
        ${[70, 100, 190, 216].map(y => `<path class="sW mech" d="M483,${y} L497,${y} M483,${y + 2} L497,${y + 2}"/>`).join("")}
        <rect class="k sW" x="476" y="124" width="28" height="40"/><circle class="k sW" cx="490" cy="134" r="5"/><circle class="fW" cx="490" cy="134" r="1"/>
        <path class="needle sR" data-cx="490" data-cy="134" d="M490,134 L493,131"/><path class="hl sM mech" d="M482,144 L498,144 L498,158 L482,158 Z"/>${hit(474, 56, 32, 174)}</g>`;
  s += `<g class="canister" data-x="490" style="display:none"><rect class="fA" x="487.4" y="-6" width="5.2" height="12" rx="2.6"/>${seg("B3", 498, -4, 6, "sA", 1)}</g>`;
  // left wall: stairs (locked) + main office; EXIT chip
  const st = sideDoor(pp, 0, .64, .78, 108), of = sideDoor(pp, 0, .86, .98, 108);
  s += `<g data-hs="stairs">${st.svg}${chip("STAIRS", st.a[0] - 4, st.a[1] - 14, 4.4, "fW")}${hit(...st.box)}</g>`;
  s += `<g data-hs="exitH">${chip("EXIT", 78, 72, 6, "fX", "exitChip")}${hit(76, 70, 28, 14)}</g>`;
  s += `<g data-hs="office">${of.svg}${chip("MAIN OFFICE", of.a[0] - 2, of.a[1] - 14, 4.4, "fW")}
        ${wallBox(0, of.a[0] + 2, of.a[0] + 2 + chipW("BACK IN 5 MIN", 3.8), of.a[1] + 34, of.a[1] + 40.5).put(`<g transform="rotate(-4 14 3)">${chip("BACK IN 5 MIN", 0, 0, 3.8, "fA")}</g>`)}${hit(...of.box)}</g>`;
  // right wall: Adline Lab 114
  const lab = sideDoor(pp, 640, .64, .8, 108);
  s += `<g data-hs="lab">${lab.svg}${chip("114 ADLINE", lab.a[0] - 4, lab.a[1] - 14, 4.4, "fG")}${hit(...lab.box)}</g>`;
  s += coffeeDoor(G);   // the coffee kitchen, every act (Rex steps out of it in Act IV's chase)
  return s;
}

/* ---- the COFFEE door, on the right wall near the front ---- */
function coffeeDoor(G) {
  const kd = sideDoor(pp, 640, .86, .98, 108);
  return `<g data-hs="kitchen">${kd.svg}${chip("COFFEE", kd.a[0] - 30, kd.a[1] - 14, 4.4, "fA")}
    <path class="k sA" d="M${kd.a[0] - 4},${kd.a[1] - 13} L${kd.a[0] + 4},${kd.a[1] - 13} L${kd.a[0] + 3.4},${kd.a[1] - 5} L${kd.a[0] - 3.4},${kd.a[1] - 5} Z"/>
    <path class="hl sA" d="M${kd.a[0] + 4},${kd.a[1] - 11} C${kd.a[0] + 7},${kd.a[1] - 11} ${kd.a[0] + 7},${kd.a[1] - 7} ${kd.a[0] + 3.6},${kd.a[1] - 7} M${kd.a[0] - 1},${kd.a[1] - 15} C${kd.a[0] + 1},${kd.a[1] - 17} ${kd.a[0] - 2},${kd.a[1] - 19} ${kd.a[0]},${kd.a[1] - 21}"/>
    ${hit(...kd.box)}</g>`;
}
// a standing figure on the floor, scaled for its depth like the walkers, with a tight hit area
const fig = (svg, x, y, w = 30, h = 128) => { const q = kAtY(y) * AUD; return { q, hit: hit((x - w * q / 2 * 1.6).toFixed(1), (y - h * q).toFixed(1), (w * q * 1.6).toFixed(1), (h * q + 2).toFixed(1)) }; };
function bin(G, x, y) {
  const q = kAtY(y) * AUD, gone = !!G.flags.danaGone;
  const sneaker = (tx, ty, r) => `<g transform="translate(${tx},${ty}) rotate(${r})"><path class="k sB" d="M-5,0 L-5,-16 C-5,-21 4,-21 4,-16 L5,0 Z"/><path class="sW" d="M-6,-1 L6,-1"/><path class="hl sW" d="M-3,-11 L2,-11 M-3,-7 L2,-7"/></g>`;
  return `<g data-hs="bin"><g transform="translate(${x},${y}) scale(${q.toFixed(3)})">
    ${gone ? `<path class="k sM" d="M-12,-54 L-16,-78 L-6,-79 L-3,-54 Z"/><path class="k sM" d="M3,-54 L9,-80 L18,-77 L11,-54 Z"/>${sneaker(-11, -78, -8)}${sneaker(14, -78, 14)}` : ""}
    <path class="k sB mech" d="M-21,0 L21,0 L24,-52 L-24,-52 Z"/><rect class="k sB mech" x="-27" y="-58" width="54" height="7"/>
    <path class="hl sB" d="M-10,-40 L-4,-46 L2,-40 M6,-38 L3,-30 L-5,-30 M-12,-34 L-14,-28 L-8,-26"/>
    ${chip("EXCLUDED", -22, -18, 6, "fW")}
    ${gone ? `<g transform="rotate(-12)"><rect class="k sA" x="-34" y="-34" width="68" height="9"/>${seg("POLICE LINE", -26, -32, 5.4, "sA", 1)}</g>
      <g transform="rotate(10)"><rect class="k sA" x="-34" y="-24" width="68" height="9"/>${seg("DO NOT CROSS", -28, -22, 5.4, "sA", 1)}</g>` : ""}
    </g>${hit((x - 28 * q).toFixed(1), (y - (gone ? 100 : 60) * q).toFixed(1), (56 * q).toFixed(1), ((gone ? 100 : 60) * q + 2).toFixed(1))}</g>`;
}
function act3Sorts(G) {
  const day = G.mode !== "night", out = [];
  const BX = 188, BY = 282;
  out.push({ depth: BY, svg: bin(G, BX, BY) });
  if (day && !G.flags.prestonGone) { const x = 302, y = 250, f = fig("", x, y, 30, 172);
    out.push({ depth: y, svg: `<g class="pt" id="preston" data-hs="preston">${prestonStanding(x, y, kAtY(y))}${f.hit}</g>` }); }
  if (day && !G.flags.danaGone) { const x = 466, y = 252, f = fig("", x, y, 30, 176);
    out.push({ depth: y, svg: `<g data-hs="dana">${danaStanding(x, y, kAtY(y))}${f.hit}</g>` }); }
  if (G.flags.danaGone && !G.flags.danaClosed) { const x = 140, y = 276, f = fig("", x, y, 32, 160), q = f.q;
    out.push({ depth: y, svg: `<g data-hs="small"><g transform="translate(${x},${y}) scale(${q.toFixed(3)}) translate(-160,-187)">${smallFigure()}</g>${f.hit}</g>` }); }
  return out;
}
/* ---- Act IV: Prof. Impact by the Rising Stars wall (neck pillow, carry-on, phone) until both leads are done;
        Cody (no clipboard) by the tube station once Nell has Impact's card, until he goes. No bin, no Preston. ---- */
function act4Sorts(G) {
  const out = [], f = G.flags;
  if (f.ch) chaseSorts(f.ch, out);
  if (G.mode === "night") return out;
  if (!f.impactDead && (!f.impactMet || !f.clueHours || !f.clueMetamer)) { const x = 284, y = 252, q = kAtY(y) * AUD;
    out.push({ depth: y, svg: `<g data-hs="prof">${impactStanding(x, y, kAtY(y))}${hit((x - 70 * q).toFixed(1), (y - 172 * q).toFixed(1), (114 * q).toFixed(1), (172 * q + 2).toFixed(1))}</g>` }); }
  if (f.clueCard && !f.codyLeft) { const x = 474, y = 252, fg = fig("", x, y, 32, 176);
    out.push({ depth: y, svg: `<g data-hs="cody">${codyStanding(x, y, kAtY(y))}${fg.hit}</g>` }); }
  return out;
}
/* ---- Act IV, the chase (act4.js chase() moves it, G.flags.ch): Preston coming down the hall with his earbuds lit; Rex out of
        the COFFEE door; a hood behind him with a steel dewar; a stepped plume of liquid nitrogen; Rex on the floor, frosted;
        the ceiling vents hissing and the fog filling the hall in four poses. ---- */
const wisp = (x, y, w) => `M${x.toFixed(1)},${y.toFixed(1)} c${w / 6},-3 ${w / 3},3 ${w / 2},0 s${w / 3},-3 ${w / 2},0`;
const VENTS = [180, 300, 460];
function chaseSorts(ch, out) {
  if (ch.pre) { const [x, y] = ch.pre; out.push({ depth: y, svg: `<g class="pt blank">${prestonStanding(x, y, kAtY(y))}</g>` }); }
  if (ch.rex) { const [x, y, down] = ch.rex, k = kAtY(y), q = k * AUD;
    out.push({ depth: y, svg: down
      ? `<g transform="translate(${x},${y}) rotate(-84)">${rexStanding(0, 0, k)}</g>${star4(x - 20 * q, y - 12 * q, 5 * q, "sW")}${star4(x - 70 * q, y - 18 * q, 4 * q, "sW")}${star4(x - 120 * q, y - 8 * q, 6 * q, "sW")}`
      : rexStanding(x, y, k) }); }
  if (ch.hood) { const [x, y, up] = ch.hood, k = kAtY(y), q = k * AUD;
    // the dewar: a steel flask held up beside the hood, its nozzle pointing left (at Rex)
    const dw = `<g transform="translate(${x},${y}) scale(${q.toFixed(3)}) translate(-160,-187)">
      <path class="sV" d="M180,92 L${up ? "190,64" : "192,118"}"/>
      <g transform="translate(${up ? "0,-32" : "0,22"})"><rect class="k sW" x="184" y="56" width="20" height="40" rx="3"/><path class="hl sW" d="M188,62 L188,90 M184,64 L204,64"/>
      <path class="sW" d="M190,56 L190,50 L176,46"/><circle class="hl sW" cx="174" cy="45.6" r="1.6"/></g></g>`;
    out.push({ depth: y, svg: hoodStanding(x, y, k, true) + dw }); }
  if (ch.plume && ch.hood && ch.rex) {
    // the plume, stepped: puffs from the nozzle toward Rex's head, growing; the last pose is a cloud on him
    const [hx, hy] = ch.hood, hq = kAtY(hy) * AUD, nx = hx + (174 - 160) * hq, ny = hy + (45.6 - 32 - 187) * hq;
    const [rx, ry] = ch.rex, rq = kAtY(ry) * AUD, tx = rx, ty = ry - 140 * rq, n = ch.plume;
    let p = "";
    for (let i = 1; i <= Math.min(n, 4) * 2; i++) { const u = i / 8, x = nx + (tx - nx) * u, y = ny + (ty - ny) * u + Math.sin(i * 1.7) * 3, r = (3 + i * 2.2) * rq;
      p += `<circle class="hl sW" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"/>`; }
    if (n >= 4) for (let i = 0; i < 7; i++) p += `<circle class="hl sW" cx="${(tx + Math.cos(i * .9) * 26 * rq).toFixed(1)}" cy="${(ty + 30 * rq + Math.sin(i * 1.3) * 34 * rq).toFixed(1)}" r="${(14 * rq).toFixed(1)}"/>`;
    out.push({ depth: ry + 1, svg: p });
  }
  if (ch.fog) {
    // the vents hiss, the fog comes down in four poses: wisps under the vents, a falling sheet, a bank on the floor, the hall
    let s = "";
    for (const X of VENTS) { const [vx, vy] = P(X, 0, .72); s += `<rect class="k sW" x="${(vx - 9).toFixed(1)}" y="${vy.toFixed(1)}" width="18" height="4"/><path class="hl sW" d="M${vx - 7},${vy + 2} L${vx + 7},${vy + 2}"/>`;
      s += arcs(vx - 12, vy + 6, -1, "sW", 2, .5) + arcs(vx + 12, vy + 6, 1, "sW", 2, .5);
      for (let i = 0; i < ch.fog * 3; i++) s += `<path class="hl sW" opacity=".7" d="${wisp(vx - 22 + (i * 17) % 40, vy + 10 + i * 9, 26 + (i % 3) * 8)}"/>`; }
    if (ch.fog >= 3) for (let i = 0; i < (ch.fog - 2) * 22; i++) s += `<path class="hl sW" opacity=".6" d="${wisp((i * 61) % 660 - 20, 296 - (i % 6) * 9 - (ch.fog - 3) * 16, 40 + (i % 4) * 14)}"/>`;
    out.push({ depth: 999, svg: s });
  }
}
const STAIRS12 = { use: "OPEN", down: "GO DOWN", up: "GO UP" };
const STAIRS3 = { use: "OPEN", down: "B1 MRI", server: "B1 SERVERS", up: "2F INTEGRITY", meeting: "3F MEETING", emeritus: "4F EMERITUS" };
const STAIRS4 = { ...STAIRS3, library: "2F LIBRARY", impactoffice: "3F IMPACT", freezer: "B1 -80 ROOM", maze: "B1 ANIMALS", iris: "4F EMERITUS" };
const stairsL = () => ACT === 3 ? STAIRS3 : ACT === 4 ? STAIRS4 : STAIRS12;
const MSTAIRS12 = { down: "SCURRY DOWN", up: "SCURRY UP" };

export default {
  id: "hall", name: "HALLWAY 1F", pp,
  floor: { yMin: 240, yMax: 288, margin: 18 },
  entries: { start: [300, 262, 1], from101: [172, 244, 1], fromLab: [536, 256, -1], fromStairs: [112, 258, 1], fromOffice: [72, 280, 1], fromImpact: [426, 246, 1], fromKitchen: [568, 280, -1] },
  draw(G) { ACT = G.act || 1; return { back: back(G), sortables: G.act === 3 ? act3Sorts(G) : G.act === 4 ? act4Sorts(G) : [] }; },
  stand: { door101: [172, 242], fountain: [214, 244], stars: [312, 242], board: [300, 246], impact: [426, 242], tube: [490, 244],
    stairs: [104, 254], exitH: [104, 254], office: [52, 282], lab: [540, 256], vent: [378, 244],
    kitchen: [572, 282], preston: [270, 262], dana: [438, 262], bin: [222, 282], small: [164, 286],
    prof: [318, 262], cody: [444, 264] },
  labels: {
    day: { door101: { use: "GO IN" }, fountain: { use: "DRINK" }, stars: { use: "STRAIGHTEN" }, board: { use: "MOVE FLYER" }, impact: { use: "KEYPAD" },
      tube: { use: "OPEN HATCH" }, get stairs() { return stairsL(); }, office: { use: "KNOCK", go: "GO IN" }, lab: { use: "GO IN" }, exitH: { use: "TAP" },
      kitchen: { use: "GO IN", go: "GO IN" }, preston: { use: "SHAKE HAND" }, bin: { use: "LOOK INSIDE" },
      prof: { talk: "TALK", use: "SHAKE HAND" }, cody: { talk: "TALK" } },
    night: { door101: { use: "GO IN" }, fountain: { use: "DRINK" }, stars: { use: "STRAIGHTEN" }, board: { use: "TIDY" }, impact: { use: "TRY BADGE", go: "GO IN" },
      tube: { use: "LISTEN" }, get stairs() { return stairsL(); }, office: { use: "OPEN" }, lab: { use: "GO IN" }, exitH: { use: "TAP" },
      kitchen: { use: "GO IN", go: "GO IN" }, bin: { use: "LOOK INSIDE" } },
    morris: { vent: { use: "CLIMB IN" }, door101: { go: "SCURRY IN" }, lab: { go: "SCURRY IN" }, office: { go: "SCURRY IN" }, get stairs() { return ACT === 3 || ACT === 4 ? STAIRS3 : MSTAIRS12; }, kitchen: { go: "SCURRY IN" }, bin: { use: "CLIMB IN" },
      prof: { use: "SNIFF THE BAG" }, cody: { use: "SNIFF" },
      tube: { use: "SNIFF" }, fountain: { use: "DRINK" }, stars: { use: "GNAW FRAME" } },
  },
};
