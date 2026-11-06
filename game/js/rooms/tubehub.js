// B3 · TUBE HUB (Act V, night) — where every pneumatic line in the building ends. A vaulted ceiling of brass tubes
// converges on a collar above the big brass destination dial (the insignia plate at its hub); canisters in a wall rack
// (left); an arch through to the Archive, shelves of reel-to-reel tapes; the LTM drive rack blinking beside the arch;
// and, low on the left wall, the open mouth of the pipe Morris came down.
// G.flags.archiveSent: the dial is left pointing at 2F · ETHEL BORD. G.flags.finale: the LTM drives are wiped (dark).
import { seg, segC, chip, perspective, hit, arcs } from "../gfx.js";
import { AUD } from "../figures.js";

const pp = perspective(320, 150, 0.5);
const { P, poly, ln, kAtY, FY, KB } = pp;
const floorY = (k) => P(0, FY, k)[1];
const fx = (n) => n.toFixed(1);
const BW = { x0: P(0, 0, KB)[0], x1: P(640, 0, KB)[0], top: P(0, 0, KB)[1], fy: floorY(KB) };   // back wall: 160..480 × 75..220
const DIAL = { x: 232, y: 140, r: 30 }, COLLAR = { x: 232, y: 80 };

// a tube drawn as two parallel lines from a to b, w apart
function tubeLine(a, b, w, cls) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d * w / 2, ny = dx / d * w / 2;
  return `<path class="${cls}" d="M${fx(a[0] + nx)},${fx(a[1] + ny)} L${fx(b[0] + nx)},${fx(b[1] + ny)} M${fx(a[0] - nx)},${fx(a[1] - ny)} L${fx(b[0] - nx)},${fx(b[1] - ny)}"/>`;
}

function room() {
  let s = "";
  for (let X = -160; X <= 800; X += 80) s += ln([X, FY], P(X, FY, KB), "hl sN");
  [.6, .72, .86].forEach(k => s += ln(P(0, FY, k), P(640, FY, k), "hl sN"));
  const TL = P(0, 0, KB), TR = P(640, 0, KB), BL = P(0, FY, KB), BR = P(640, FY, KB);
  s += `<polyline class="sM" points="${poly([0, FY], BL, BR, [640, FY])}"/>` + ln(TL, BL, "sM") + ln(TR, BR, "sM") + ln(TL, TR, "sM");
  // the vault: shallow arcs across the ceiling at each depth (atmosphere)
  [.5, .62, .76, .92].forEach(k => { const a = P(0, 0, k), b = P(640, 0, k), c = P(320, -50, k);
    s += `<path class="hl sD" d="M${fx(a[0])},${fx(a[1])} Q${fx(c[0])},${fx(2 * c[1] - a[1])} ${fx(b[0])},${fx(b[1])}"/>`; });
  s += ln([0, 0], TL, "hl sD") + ln([640, 0], TR, "hl sD");
  // the brass tubes: from every part of the ceiling down to the collar above the dial
  const from = [[-20, 60], [-10, 10], [40, 0], [95, 0], [150, 0], [205, 0], [262, 0], [320, 0], [380, 0], [440, 0], [500, 0], [570, 0], [650, 0], [660, 30]];
  from.forEach(([x, y], i) => {
    const t = (i + .5) / from.length, to = [COLLAR.x - 22 + 44 * t, COLLAR.y - 4];
    s += tubeLine([x, y], to, 4, "hl sA");
    // a bracket on each tube, a third of the way down
    const m = [x + (to[0] - x) * .35, y + (to[1] - y) * .35];
    s += `<circle class="hl sD" cx="${fx(m[0])}" cy="${fx(m[1])}" r="2.6"/>`;
  });
  // the collar where they all meet, and the trunk down into the dial
  s += `<rect class="k sA mech" x="${COLLAR.x - 26}" y="${COLLAR.y - 6}" width="52" height="8"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path class="hl sA" d="M${COLLAR.x - 22 + i * 6.3},${COLLAR.y - 6} L${COLLAR.x - 22 + i * 6.3},${COLLAR.y + 2}"/>`).join("")}
    <path class="sA" d="M${COLLAR.x - 9},${COLLAR.y + 2} L${COLLAR.x - 9},${DIAL.y - DIAL.r - 2} M${COLLAR.x + 9},${COLLAR.y + 2} L${COLLAR.x + 9},${DIAL.y - DIAL.r - 2}"/>`;
  s += seg("PNEUMATIC DESPATCH · 1962", 168, 210, 3.2, "sD", .5);
  return s;
}

// the destination dial: a brass ring of stations, a pointer, the insignia plate at the hub; a send lever below
function dial(G) {
  const { x, y, r } = DIAL, sent = !!G.flags.archiveSent;
  const st = ["B3", "B1", "1F", "2F ETHEL BORD", "3F", "4F", "DEAN", "REGISTRAR"];
  let s = `<g data-hs="dial"><circle class="k sA" cx="${x}" cy="${y}" r="${r}"/><circle class="hl sA" cx="${x}" cy="${y}" r="${r - 4}"/>`;
  st.forEach((t, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 4, tx = x + Math.cos(a) * (r - 1), ty = y + Math.sin(a) * (r - 1);
    s += `<path class="hl sA" d="M${fx(x + Math.cos(a) * (r - 4))},${fx(y + Math.sin(a) * (r - 4))} L${fx(x + Math.cos(a) * r)},${fx(y + Math.sin(a) * r)}"/>`;
    const lx = x + Math.cos(a) * (r + 5), ly = y + Math.sin(a) * (r + 5), h = i === 3 ? 3.2 : 2.8, w = t.length * h * .62;
    const ax = Math.cos(a) > .3 ? lx : Math.cos(a) < -.3 ? lx - w : lx - w / 2;
    s += seg(t, ax, ly - h / 2, h, i === 3 ? "sW" : "sA", .45);
  });
  // the pointer: left on B3, or on 2F once the Archive has gone up
  const pa = -Math.PI / 2 + (sent ? 3 : 0) * Math.PI / 4;
  s += `<path class="sW" d="M${fx(x - Math.cos(pa) * 6)},${fx(y - Math.sin(pa) * 6)} L${fx(x + Math.cos(pa) * (r - 6))},${fx(y + Math.sin(pa) * (r - 6))}"/>`;
  // the brass plate at the hub with the insignia, lit
  s += `<circle class="k sA" cx="${x}" cy="${y}" r="7.5"/><circle class="sX" cx="${x}" cy="${y}" r="4.6"/><circle class="fX" cx="${x}" cy="${y}" r="1.8"/>
    ${[0, 1, 2, 3, 4, 5].map(i => { const a = i * Math.PI / 3 - Math.PI / 2; return `<circle class="fX" cx="${fx(x + Math.cos(a) * 3.2)}" cy="${fx(y + Math.sin(a) * 3.2)}" r=".55"/>`; }).join("")}`;
  // the send box under the dial: a hatch for the canister, the SEND lever
  const by = y + r + 12;
  s += `<rect class="k sA mech" x="${x - 16}" y="${by}" width="32" height="22"/><rect class="hl sA mech" x="${x - 10}" y="${by + 5}" width="14" height="12"/>
    <path class="sA" d="M${x + 10},${by + 18} L${x + 14},${by + 4}"/><circle class="k sR" cx="${x + 14.5}" cy="${by + 2.5}" r="2.4"/>
    ${seg("SEND", x + 6, by + 24, 2.6, "sA", .45)}${sent ? arcs(x + 22, by + 8, 1, "sA", 2, .5) : ""}`;
  return s + `${hit(x - r - 22, y - r - 10, 2 * r + 46, by + 30 - (y - r - 10))}</g>`;
}

// the arch through to the Archive (the frame is "arch"; the shelves seen through it are "archive")
const ARCH = { x0: 304, x1: 400, top: 128 };
function arch() {
  const { x0, x1, top } = ARCH, fy = BW.fy, rr = (x1 - x0) / 2, xm = (x0 + x1) / 2;
  return `<g data-hs="arch"><path class="k sM mech" d="M${x0 - 8},${fy} L${x0 - 8},${top} A${rr + 8},${rr + 8} 0 0 1 ${x1 + 8},${top} L${x1 + 8},${fy} L${x1},${fy} L${x1},${top} A${rr},${rr} 0 0 0 ${x0},${top} L${x0},${fy} Z"/>
    ${[-.8, -.55, -.3, 0, .3, .55, .8].map(t => { const a = -Math.PI / 2 + t * Math.PI / 2; return `<path class="hl sM" d="M${fx(xm + Math.cos(a) * rr)},${fx(top + Math.sin(a) * rr)} L${fx(xm + Math.cos(a) * (rr + 8))},${fx(top + Math.sin(a) * (rr + 8))}"/>`; }).join("")}
    ${chip("ARCHIVE", xm - 15, top - rr - 22, 4, "fW")}
    ${hit(x0 - 10, top - rr - 24, 10, fy - top + rr + 24)}${hit(x1, top - rr - 24, 10, fy - top + rr + 24)}${hit(x0, top - rr - 24, x1 - x0, 24)}</g>`;
}
// the Archive: rows of shelves in a deeper perspective, reels of tape on edge
function archive(G) {
  const { x0, x1, top } = ARCH, fy = BW.fy, xm = (x0 + x1) / 2, rr = (x1 - x0) / 2;
  const vp = [xm, 156];
  let s = `<g data-hs="archive">`;
  // shelf uprights receding left and right of an aisle, shelf boards as hairlines
  const kk = [1, .78, .6, .46];
  const at = (x, y, k) => [vp[0] + (x - vp[0]) * k, vp[1] + (y - vp[1]) * k];
  [x0 + 2, x1 - 2].forEach(xx => { s += ln(at(xx, fy, 1), at(xx, fy, .46), "hl sD") + ln(at(xx, top - 12, 1), at(xx, top - 12, .46), "hl sD");
    [1, .78, .6, .46].forEach(k => s += ln(at(xx, top - 12, k), at(xx, fy, k), "hl sD"));
    [0, 1, 2, 3, 4].forEach(j => { const Y = top - 4 + j * 18; s += ln(at(xx, Y, 1), at(xx, Y, .46), "hl sM"); }); });
  // reels on the shelves: circles foreshortened, nearer ones bigger
  [x0 + 2, x1 - 2].forEach((xx, side) => [0, 1, 2, 3].forEach(j => [0, 1, 2].forEach(m => {
    const k = kk[m] - .1, Y = top - 4 + j * 18 - 7, c = at(xx + (side ? -6 : 6), Y, k), ry = 6 * k, rx = 2.4 * k;
    s += `<ellipse class="k hl sW" cx="${fx(c[0])}" cy="${fx(c[1])}" rx="${fx(rx)}" ry="${fx(ry)}"/><circle class="fW" cx="${fx(c[0])}" cy="${fx(c[1])}" r="${fx(.7 * k)}"/>`;
  })));
  // the far end of the aisle, and a tape labelled on a near shelf
  const fa = at(x0 + 2, top - 12, .46), fb = at(x1 - 2, fy, .46);
  s += `<rect class="hl sD" x="${fx(fa[0])}" y="${fx(fa[1])}" width="${fx(fb[0] - fa[0])}" height="${fx(fb[1] - fa[1])}"/>`;
  s += seg("1961-", xm - 10, fy - 26, 3, "sM", .45) + seg("2026", xm - 6, fy - 21, 3, "sM", .45);
  return s + `${hit(x0, top - rr + 4, x1 - x0, fy - top + rr - 4)}</g>`;
}

// the LTM drive rack beside the arch: violet units, LEDs blinking (pose group "blink"); dark once wiped
function ltm(G) {
  const x = 416, top = 104, h = BW.fy - top, wiped = !!G.flags.finale;
  const led = (cx, cy, on) => on ? `<circle class="fV" cx="${cx}" cy="${cy}" r="1"/>` : `<circle class="hl sD" cx="${cx}" cy="${cy}" r=".8"/>`;
  let s = `<g data-hs="ltm"><rect class="k sV mech" x="${x}" y="${top}" width="46" height="${h}"/>${chip("LTM", x + 4, top + 4, 5, "fV")}
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect class="hl sV mech" x="${x + 4}" y="${top + 18 + i * 16}" width="38" height="13"/><circle class="hl sV" cx="${x + 12}" cy="${top + 24.5 + i * 16}" r="4"/><circle class="hl sV" cx="${x + 23}" cy="${top + 24.5 + i * 16}" r="4"/>`).join("")}`;
  if (wiped) s += `<rect class="k sD mech" x="${x + 7}" y="${top + 66}" width="32" height="10"/>${segC("WIPED", x + 23, top + 68, 5, "sM", .7)}${[0, 1, 2, 3, 4, 5].map(i => led(x + 36, top + 24.5 + i * 16, false)).join("")}`;
  else s += [0, 1].map(p => `<g class="pz${p ? "" : " on"}" data-g="blink" data-i="${p}">${[0, 1, 2, 3, 4, 5].map(i => led(x + 36, top + 24.5 + i * 16, (i + p) % 2 === 1)).join("")}</g>`).join("")
    + `<circle class="hl sX" cx="${x + 40}" cy="${top + 8}" r="2.4"/><circle class="fX" cx="${x + 40}" cy="${top + 8}" r=".9"/>`;
  return s + `${hit(x - 3, top - 3, 52, h + 4)}</g>`;
}

// the canister rack on the left wall: brass canisters on pegs, a few empty pegs
function canisters() {
  const k1 = .6, k2 = .8, Y0 = 150, Y1 = 214;
  const a = P(0, Y0, k1), b = P(0, Y0, k2), c = P(0, Y1, k2), d = P(0, Y1, k1);
  let s = `<g data-hs="canisters"><polygon class="k sM mech" points="${poly(a, b, c, d)}"/>`;
  [0, 1].forEach(row => { const Y = Y0 + 10 + row * 30;
    s += ln(P(0, Y + 22, k1 + .01), P(0, Y + 22, k2 - .01), "hl sM");
    [0, 1, 2, 3, 4].forEach(j => { if (row === 1 && j === 3) return;
      const k = k1 + .025 + j * (k2 - k1 - .05) / 4.4, w = .028;
      s += `<polygon class="k sA" points="${poly(P(0, Y, k), P(0, Y, k + w), P(0, Y + 20, k + w), P(0, Y + 20, k))}"/>` + ln(P(0, Y + 4, k), P(0, Y + 4, k + w), "hl sA"); }); });
  s += chip("CANISTERS", a[0] - 4, a[1] - 14, 3.8, "fA");
  return s + `${hit(Math.min(a[0], b[0]) - 2, a[1] - 16, Math.abs(b[0] - a[0]) + 4, c[1] - a[1] + 18)}</g>`;
}

// DEAD LETTERS: a dented brass box low on the left wall, under the rack, with one dusty canister wedged in its slot
// (tag: THE OLD TABLE · DO NOT DELIVER · 1974). Small, dim and easy to miss on purpose. G.flags.brassGavel: opened.
function deadLetters(G) {
  const k1 = .64, k2 = .73, Y0 = 222, Y1 = 242;
  const a = P(0, Y0, k1), b = P(0, Y0, k2), c = P(0, Y1, k2), d = P(0, Y1, k1);
  const sa = P(0, Y0 + 7, k1 + .012), sb = P(0, Y0 + 7, k2 - .012);
  let s = `<g data-hs="deadletters"><polygon class="k sM mech" points="${poly(a, b, c, d)}"/>`;
  s += `<path class="hl sM" d="M${fx(sa[0])},${fx(sa[1])} L${fx(sb[0])},${fx(sb[1])}"/>`;
  // the canister, sticking out of the slot into the room (dusty: dim brass, a hairline cobweb to the rack above)
  const mx = (sa[0] + sb[0]) / 2, my = (sa[1] + sb[1]) / 2, out = G.flags.brassGavel ? 4 : 0;
  s += `<rect class="k sD" x="${fx(mx - 3)}" y="${fx(my - 3.5)}" width="${16 + out}" height="7" rx="3"/><path class="hl sD" d="M${fx(mx + 9 + out)},${fx(my - 3.5)} L${fx(mx + 9 + out)},${fx(my + 3.5)}"/>`;
  s += `<path class="hl sD" d="M${fx(b[0])},${fx(b[1])} Q${fx(mx + 6)},${fx(my - 10)} ${fx(mx + 13 + out)},${fx(my - 3.5)} M${fx(mx + 2)},${fx(my - 13)} L${fx(mx + 4)},${fx(my - 3.5)}"/>`;
  s += seg("DEAD LETTERS", d[0] + 1, d[1] + 3, 2.6, "sD", .5);
  return s + `${hit(Math.min(a[0], b[0]) - 2, a[1] - 4, Math.abs(b[0] - a[0]) + 24, d[1] - a[1] + 14)}</g>`;
}

// the pipe Morris came down: a brass tube running down the left wall to an open, flared mouth just above the floor
function pipe() {
  const k = .9, top = P(0, 0, k), m = P(0, 244, k), mouth = P(0, 262, k);
  return `<g data-hs="pipe">${tubeLine([top[0] + 4, top[1]], [m[0] + 4, m[1]], 10, "sA")}
    <ellipse class="k sA" cx="${fx(mouth[0] + 6)}" cy="${fx(mouth[1])}" rx="5" ry="13"/><ellipse class="hl sA" cx="${fx(mouth[0] + 6)}" cy="${fx(mouth[1])}" rx="2" ry="8"/>
    <path class="sA" d="M${fx(m[0] - 1)},${fx(m[1])} L${fx(mouth[0] + 3)},${fx(mouth[1] - 12)} M${fx(m[0] + 9)},${fx(m[1])} L${fx(mouth[0] + 9)},${fx(mouth[1] - 12)}"/>
    ${hit(fx(top[0] - 8), 40, 30, fx(mouth[1] + 16 - 40))}</g>`;
}

// the riser: a brass pipe standing on the floor by the right wall and going straight up through the vault, toward the 3T
function riser() {
  const x = 556, w = 12, top = 0, foot = 266, mouth = 236;
  return `<g data-hs="riser">${tubeLine([x, top], [x, mouth - 6], w, "sA")}
    ${[30, 90, 150].map(y => `<path class="hl sA" d="M${x - w / 2 - 2},${y} L${x + w / 2 + 2},${y}"/>`).join("")}
    <path class="hl sD" d="M${x + w / 2 + 2},90 L${x + 36},92 M${x + w / 2 + 2},30 L${x + 52},31"/>
    <path class="k sA mech" d="M${x - w / 2},${mouth - 6} L${x - w / 2},${foot - 4} L${x + w / 2},${foot - 4} L${x + w / 2},${mouth - 6} Z"/>
    <ellipse class="k sA" cx="${x}" cy="${foot - 2}" rx="${w}" ry="3"/>
    <rect class="k sA mech" x="${x - w / 2 - 3}" y="${mouth - 8}" width="${w + 6}" height="4"/>
    <ellipse class="k sA" cx="${x - w / 2 - 1}" cy="${mouth + 10}" rx="2" ry="7"/><ellipse class="hl sA" cx="${x - w / 2 - 1}" cy="${mouth + 10}" rx=".8" ry="4.4"/>
    <path class="sA" d="M${x - w / 2 - 1},${mouth + 3} L${x - w / 2 - 7},${mouth + 1} L${x - w / 2 - 7},${mouth + 17} L${x - w / 2 - 1},${mouth + 17}"/>
    <path class="sA" d="M${x},${top + 52} L${x},${top + 40} M${x - 4},${top + 44} L${x},${top + 40} L${x + 4},${top + 44}"/>
    ${chip("UP: 3T", x - 34, 58, 4, "fA")}
    ${hit(x - 40, 40, w + 50, foot - 36)}</g>`;
}

export default {
  id: "tubehub", name: "B3 · TUBE HUB", pp,
  floor: { yMin: 230, yMax: 287, margin: 16 },
  entries: { fromPipes: [64, 280, 1], fromRiser: [530, 272, -1] },
  draw(G) {
    return { back: room() + archive(G) + arch() + ltm(G) + dial(G) + canisters() + deadLetters(G) + pipe() + riser(), sortables: [] };
  },
  stand: { dial: [236, 240], canisters: [104, 262], deadletters: [92, 272], archive: [352, 236], arch: [352, 236], ltm: [438, 240], pipe: [64, 280], riser: [530, 272] },
  labels: {
    morris: { dial: { use: "SEND" }, archive: { use: "PICK REELS" }, ltm: { use: "CHEW" }, canisters: { use: "CLIMB IN" }, deadletters: { use: "OPEN IT" }, arch: { go: "GO THROUGH" },
      pipe: { go: "BACK UP THE PIPE" }, riser: { go: "UP TO THE 3T" } },
    night: { dial: { use: "SEND" }, archive: { use: "PICK REELS" }, ltm: { use: "CHEW" }, canisters: { use: "OPEN ONE" }, arch: { go: "GO THROUGH" },
      pipe: { go: "BACK" }, riser: { go: "UP TO THE 3T" } },
  },
};
