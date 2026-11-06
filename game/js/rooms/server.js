// GPU SERVER ROOM B1 — racks blinking in the heat, the LTM rack standing apart (a tiny lit insignia sticker), a login terminal
// on a cart, the thermostat at 31, and the heavy MRI EQUIPMENT door where the chilled-water leak comes from at night.
import { seg, segC, chip, perspective, shell, sideDoor, hit, arcs } from "../gfx.js";

const pp = perspective(320, 130, 0.5);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];
const RB = floorY(.5);   // back-wall floor line (210)

function led(x, y, on, cls = "fG") { return on ? `<circle class="${cls}" cx="${x}" cy="${y}" r="1"/>` : `<circle class="hl sD" cx="${x}" cy="${y}" r=".8"/>`; }

function back(G) {
  const night = G.mode === "night";
  let s = shell(pp, { rail: false });
  // cable trays along the ceiling (atmosphere)
  [250, 390].forEach(X => { s += pp.ln(P(X, 0, .5), [X + (X - 320) * 1, 0], "hl sD") + pp.ln(P(X + 20, 0, .5), [X + 20 + (X + 20 - 320), 0], "hl sD"); });
  // the thermostat, back wall left: a readout
  s += `<g data-hs="thermostat"><rect class="k sW mech" x="170" y="104" width="32" height="34"/>${seg("TEMP C", 174, 108, 3, "sM", .5)}
        ${seg("31", 175, 115, 14, "sR", 1)}<path class="hl sR" d="M174,133 L198,133"/><rect class="fR" x="174" y="132" width="20" height="2"/>${hit(166, 100, 40, 42)}</g>`;
  // the cluster: four racks, LEDs in pose group "blink", heat shimmer above (pose group "hum")
  const rx = [214, 254, 294, 334], top = 74;
  s += `<g data-hs="racks">${rx.map((x, r) => `<rect class="k sW mech" x="${x}" y="${top}" width="36" height="${RB - top}"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect class="hl sM mech" x="${x + 3}" y="${top + 4 + i * 16}" width="30" height="13"/><path class="hl sD" d="M${x + 6},${top + 10.5 + i * 16} L${x + 18},${top + 10.5 + i * 16}"/>`).join("")}`).join("")}
        ${[0, 1].map(p => `<g class="pz${p ? "" : " on"}" data-g="blink" data-i="${p}">${rx.map((x, r) => [0, 1, 2, 3, 4, 5, 6, 7].map(i =>
          led(x + 24, top + 10.5 + i * 16, (i + r + p) % 2 === 0) + led(x + 29, top + 10.5 + i * 16, (i * 3 + r + p) % 3 === 0, "fA")).join("")).join("")}</g>`).join("")}
        <g class="pz on" data-g="hum" data-i="0">${rx.map(x => `<path class="hl sA" d="M${x + 8},${top - 4} C${x + 12},${top - 8} ${x + 6},${top - 12} ${x + 10},${top - 16} M${x + 24},${top - 4} C${x + 28},${top - 8} ${x + 22},${top - 12} ${x + 26},${top - 16}"/>`).join("")}</g>
        <g class="pz" data-g="hum" data-i="1">${rx.map(x => `<path class="hl sA" d="M${x + 10},${top - 4} C${x + 6},${top - 8} ${x + 12},${top - 12} ${x + 8},${top - 16} M${x + 26},${top - 4} C${x + 22},${top - 8} ${x + 28},${top - 12} ${x + 24},${top - 16}"/>`).join("")}</g>
        ${hit(210, top - 18, 164, RB - top + 18)}</g>`;
  // the LTM rack, standing apart; a tiny lit insignia sticker
  const lx = 408;
  s += `<g data-hs="ltm"><rect class="k sV mech" x="${lx}" y="${top + 6}" width="44" height="${RB - top - 6}"/>
        ${chip("LTM", lx + 4, top + 10, 5, "fV")}
        ${[0, 1, 2, 3, 4, 5].map(i => `<rect class="hl sV mech" x="${lx + 4}" y="${top + 24 + i * 16}" width="36" height="13"/>`).join("")}
        ${[0, 1].map(p => `<g class="pz${p ? "" : " on"}" data-g="blink" data-i="${p}">${[0, 1, 2, 3, 4, 5].map(i => led(lx + 34, top + 30.5 + i * 16, (i + p) % 2 === 1, "fV")).join("")}</g>`).join("")}
        ${[0, 1, 2, 3, 4, 5].map(i => `<path class="hl sV" d="M${lx + 8},${top + 30.5 + i * 16} L${lx + 26},${top + 30.5 + i * 16}"/>`).join("")}
        <circle class="hl sX" cx="${lx + 37}" cy="${top + 14}" r="2.6"/><circle class="fX" cx="${lx + 37}" cy="${top + 14}" r="1"/>
        ${hit(lx - 4, top + 2, 52, RB - top - 2)}</g>`;
  // left wall: the stairs door; the vent grille, low by the floor
  const d = sideDoor(pp, 0, .6, .76, 108);
  s += `<g data-hs="door">${d.svg}${chip("STAIRS", d.a[0] - 2, d.a[1] - 14, 4.4, "fW")}${hit(...d.box)}</g>`;
  const v = [P(0, 250, .84), P(0, 250, .92), P(0, 272, .92), P(0, 272, .84)];
  s += `<g data-hs="vent"><polygon class="k sW mech" points="${poly(...v)}"/>
        ${[1, 2, 3, 4].map(i => { const t = i / 5; const a = [v[0][0] + (v[1][0] - v[0][0]) * t, v[0][1] + (v[1][1] - v[0][1]) * t], b = [v[3][0] + (v[2][0] - v[3][0]) * t, v[3][1] + (v[2][1] - v[3][1]) * t];
          return `<path class="hl sW" d="M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}"/>`; }).join("")}
        ${hit(Math.min(v[0][0], v[1][0]) - 6, v[0][1] - 6, Math.abs(v[1][0] - v[0][0]) + 12, v[2][1] - v[0][1] + 12)}</g>`;
  // right wall: the heavy MRI EQUIPMENT door, the chilled-water pipes running into it, the leak at night
  const e = sideDoor(pp, 640, .6, .78, 100, "sB"), ec = [(e.a[0] + e.b[0]) / 2, (e.a[1] + e.d[1]) / 2];
  const pipe = (Y) => pp.ln(P(640, Y, .5), P(640, Y, .9), "sB");
  s += pipe(36) + pipe(44) + [.56, .7, .84].map(k => pp.ln(P(640, 32, k), P(640, 48, k), "hl sB")).join("") + pp.ln(P(640, 44, .66), P(640, 100, .66), "sB") + pp.ln(P(640, 44, .68), P(640, 100, .68), "sB");
  s += `<g data-hs="equip">${e.svg}
        ${[0, 1, 2].map(i => { const t = (i + 1) / 4; return `<path class="hl sB" d="M${(e.a[0] + (e.b[0] - e.a[0]) * t).toFixed(1)},${(e.a[1] + (e.b[1] - e.a[1]) * t + 6).toFixed(1)} L${(e.d[0] + (e.c[0] - e.d[0]) * t).toFixed(1)},${(e.d[1] + (e.c[1] - e.d[1]) * t - 6).toFixed(1)}"/>`; }).join("")}
        <path class="sB" d="M${ec[0] - 9},${ec[1] - 6} L${ec[0] - 9},${ec[1] + 8}"/>
        ${chip("MRI EQUIPMENT", e.a[0] - 26, e.a[1] - 22, 4.2, "fB")}${seg("CHILLED WATER", e.a[0] - 26, e.a[1] - 9, 3.4, "sB", .6)}
        ${night ? `<ellipse class="hl sB" cx="${ec[0] - 18}" cy="${e.d[1] + 6}" rx="26" ry="4"/><ellipse class="hl sB" cx="${ec[0] - 22}" cy="${e.d[1] + 6}" rx="12" ry="1.8"/>
          <path class="hl sB" d="M${e.a[0] + 4},${e.d[1] - 2} C${e.a[0] - 4},${e.d[1] + 2} ${e.a[0] - 10},${e.d[1] + 4} ${e.a[0] - 20},${e.d[1] + 5}"/>
          <g class="pz on" data-g="drip" data-i="0"><path class="sB" d="M${e.a[0] + 2},${e.a[1] + 4} L${e.a[0] + 2},${e.a[1] + 7}"/></g>
          <g class="pz" data-g="drip" data-i="1"><path class="sB" d="M${e.a[0] + 2},${e.a[1] + 26} L${e.a[0] + 2},${e.a[1] + 29}"/></g>` : ""}
        ${hit(...e.box)}</g>`;
  return s;
}

// the login terminal on a rolling cart, front left
function terminal(G) {
  const k = .74, y = floorY(k), x = 196, top = y - 40;
  return `<g data-hs="terminal">
    <path class="sW" d="M${x - 20},${top} L${x - 20},${y - 4} M${x + 20},${top} L${x + 20},${y - 4}"/><path class="sW mech" d="M${x - 24},${top} L${x + 24},${top} M${x - 22},${y - 14} L${x + 22},${y - 14}"/>
    <circle class="sW" cx="${x - 18}" cy="${y - 2}" r="2"/><circle class="sW" cx="${x + 18}" cy="${y - 2}" r="2"/>
    <rect class="k sW mech" x="${x - 18}" y="${top - 32}" width="36" height="26"/><path class="sW" d="M${x},${top - 6} L${x},${top}"/>
    ${seg("LOGIN", x - 14, top - 28, 3.6, "sG", .6)}<path class="hl sG" d="M${x - 14},${top - 18} L${x + 6},${top - 18}"/>${seg("PASS", x - 14, top - 15, 3.2, "sM", .5)}<path class="hl sG" d="M${x - 14},${top - 9} L${x + 6},${top - 9}"/>
    <g class="pz on" data-g="blink" data-i="0"><rect class="fG" x="${x + 8}" y="${top - 21}" width="2" height="3"/></g><g class="pz" data-g="blink" data-i="1"></g>
    <path class="hl sW" d="M${x - 16},${top - 3} L${x + 14},${top - 3}"/>
    <rect class="hl sM mech" x="${x - 14}" y="${y - 24}" width="28" height="9"/>
    ${hit(x - 26, top - 36, 52, y - top + 36)}</g>`;
}

export default {
  id: "server", name: "GPU SERVER ROOM B1", pp,
  floor: { yMin: 238, yMax: 287, margin: 16 },
  entries: { fromStairs: [116, 262, 1], fromTunnels: [522, 264, -1], night: [232, 266, -1] },
  draw(G) { return { back: back(G), sortables: [{ depth: floorY(.74), svg: terminal(G) }] }; },
  stand: { terminal: [232, 266], racks: [290, 244], ltm: [430, 244], thermostat: [190, 244], equip: [524, 262], door: [112, 262], vent: [60, 276] },
  labels: {
    day: { terminal: { use: "LOG IN" }, ltm: { use: "ASK IT TO WRITE YOUR DISSERTATION" }, thermostat: { use: "TURN DOWN" }, equip: { use: "OPEN" },
      door: { use: "GO OUT", go: "GO OUT" }, racks: { use: "TOUCH" } },
    night: { terminal: { use: "LOG IN" }, ltm: { use: "ASK IT TO WRITE YOUR DISSERTATION" }, thermostat: { use: "TURN DOWN" }, equip: { go: "FOLLOW THE LEAK", use: "OPEN" },
      door: { use: "GO OUT", go: "GO OUT" }, racks: { use: "TOUCH" } },
    morris: { vent: { use: "CLIMB IN" }, door: { go: "SCURRY OUT" }, racks: { use: "WARM PAWS" }, ltm: { use: "SNIFF" } },
  },
};
