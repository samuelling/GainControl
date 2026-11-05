// FIRST-FLOOR HALLWAY, FECHNER HALL — the Rising Stars wall, the Friday 2 PM collision, the Impact Lab door.
import { seg, chip, chipW, perspective, shell, sideDoor, hit } from "../gfx.js";

const pp = perspective(320, 140, 0.6);
const { P, poly, FY } = pp;

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
        ${chip("2026", 300, 144, 4, "fA")}${hit(232, 60, 140, 96)}</g>`;
  // bulletin board: the Friday 2 PM collision
  s += `<g data-hs="board"><rect class="k sM mech" x="236" y="164" width="132" height="44"/>
        <g transform="rotate(-3 270 186)"><rect class="k sG mech" x="246" y="168" width="48" height="36"/>${seg("DEFENSE", 250, 172, 5, "sG", .8)}${seg("N. NULL", 250, 181, 4.5, "sW", .7)}${seg("FRI 2PM", 250, 189, 4.5, "sW", .7)}${seg("RM 101", 250, 197, 4.5, "sM", .7)}</g>
        <g transform="rotate(2 334 186)"><rect class="k sR mech" x="310" y="168" width="50" height="36"/>${seg("JOB TALK", 314, 172, 5, "sR", .8)}${seg("P. VALU", 314, 181, 4.5, "sW", .7)}${seg("FRI 2PM", 314, 189, 4.5, "sW", .7)}${seg("RM 101", 314, 197, 4.5, "sM", .7)}</g>
        <circle class="fR" cx="270" cy="168" r="1.4"/><circle class="fR" cx="335" cy="168" r="1.4"/>${hit(234, 162, 136, 48)}</g>`;
  // Impact Lab 116: brushed steel, keypad, light under the door at night
  s += `<g data-hs="impact"><rect class="k sW mech" x="400" y="112" width="54" height="118"/>
        ${[124, 134, 144, 154, 164, 174, 184, 194, 204, 214].map(y => `<path class="hl sD mech" d="M404,${y} L450,${y}"/>`).join("")}
        <rect class="k sW mech" x="440" y="160" width="8" height="12"/><circle class="fG" cx="444" cy="164" r="1"/><path class="hl sW" d="M442,168 L446,168"/>
        ${chip("IMPACT LAB 116", 402, 100, 4.6, "fW")}
        <g class="night-only"><g class="pz on" data-g="hum" data-i="0"><path class="sA" d="M402,229 L452,229"/></g><g class="pz" data-g="hum" data-i="1"><path class="hl sA" d="M402,229 L452,229"/></g></g>
        ${hit(398, 98, 58, 134)}</g>`;
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
        <g transform="rotate(-8 ${of.a[0] + 10} ${of.a[1] + 40})">${chip("BACK IN 5 MIN", of.a[0] + 2, of.a[1] + 34, 3.8, "fA")}</g>${hit(...of.box)}</g>`;
  // right wall: Adline Lab 114
  const lab = sideDoor(pp, 640, .64, .8, 108);
  s += `<g data-hs="lab">${lab.svg}${chip("114 ADLINE", lab.a[0] - 4, lab.a[1] - 14, 4.4, "fG")}${hit(...lab.box)}</g>`;
  return s;
}

export default {
  id: "hall", name: "HALLWAY 1F", pp,
  floor: { yMin: 240, yMax: 288, margin: 18 },
  entries: { start: [300, 262, 1], from101: [172, 244, 1], fromLab: [536, 256, -1] },
  draw(G) { return { back: back(G), sortables: [] }; },
  stand: { door101: [172, 242], fountain: [214, 244], stars: [312, 242], board: [300, 246], impact: [426, 242], tube: [490, 244],
    stairs: [104, 254], exitH: [104, 254], office: [52, 282], lab: [540, 256] },
  labels: {
    day: { door101: { use: "GO IN" }, fountain: { use: "DRINK" }, stars: { use: "STRAIGHTEN" }, board: { use: "MOVE FLYER" }, impact: { use: "KEYPAD" },
      tube: { use: "OPEN HATCH" }, stairs: { use: "OPEN" }, office: { use: "KNOCK" }, lab: { use: "GO IN" }, exitH: { use: "TAP" } },
    night: { door101: { use: "GO IN" }, fountain: { use: "DRINK" }, stars: { use: "STRAIGHTEN" }, board: { use: "TIDY" }, impact: { use: "TRY BADGE" },
      tube: { use: "LISTEN" }, stairs: { use: "OPEN" }, office: { use: "OPEN" }, lab: { use: "GO IN" }, exitH: { use: "TAP" } },
  },
};
