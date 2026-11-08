// SEMINAR 101 · DEFENSE — Friday, 14:00. Room 101 set up for Nell's thesis defense: the committee table at the front left
// (Prof. Adline, Ethel Bord, Det. Small and an empty chair with a QUORUM placard), Nell's lectern at the front right,
// the screen reading NULL RESULTS, A DEFENSE. In the audience (chair backs): Preston in the front row, waiting for
// his job talk in the same room, next slot (earbuds dark; they flare: #preston blank-only); Iris in the back row,
// where she has sat since 1961. After G.flags.defenseDone, Preston's seat is empty.
import { seg, segC, chip, perspective, shell, hit, arcs, onQuad, stapler } from "../gfx.js";
import { chairBack, ethelAtDesk, AUD } from "../figures.js";
import { adlineSeated, smallSeated } from "../cast/act5a.js";

const pp = perspective(320, 130, 0.42);
const { P, poly, kAtY, FY } = pp;
const floorY = (k) => P(0, FY, k)[1];
const fx = (n) => n.toFixed(1);

// the committee table: X 10..250, depth .56 (back edge) .. .60 (front edge), top 40 above the floor
const T = { x0: 10, x1: 250, kb: .56, kf: .6, top: FY - 40 };
const CK = .55;                                   // the committee's chairs, just behind the table
const COMMITTEE = [["adline", 40], ["ethel", 100], ["quorumchair", 160], ["small", 220]];
const ROWS = [.68, .8, .92];
const SEATS = [[330, 410, 490], [90, 170, 250, 400, 480, 560], [90, 170, 250, 400, 480, 560]];
const PRESTON = { row: 0, X: 410 }, IRIS = { row: 2, X: 480 };

/* ---- the screen: the title slide, and the only null result in the building anyone has drawn honestly ---- */
const SCR = { x: 282, y: 86, w: 164, h: 84 };
function slide() {
  const { x, y } = SCR;
  let s = seg("NULL RESULTS,", x + 8, y + 8, 9, "sW", 1.2) + seg("A DEFENSE", x + 8, y + 21, 9, "sW", 1.2);
  s += seg("N. NULL · ADLINE LAB", x + 8, y + 35, 4, "sM", .7) + chip("PHD", x + 132, y + 8, 5, "fG");
  // the result: two conditions, the same height, overlapping error bars. n.s.
  const bx = x + 14, by = y + 76;
  s += `<path class="sW mech" d="M${bx},${by} L${bx + 70},${by} M${bx},${by} L${bx},${by - 30}"/>`;
  [[bx + 12, "sB"], [bx + 40, "sG"]].forEach(([xx, c]) => {
    s += `<path class="${c} mech" d="M${xx},${by} L${xx},${by - 18} L${xx + 16},${by - 18} L${xx + 16},${by}"/><path class="hl sW mech" d="M${xx + 8},${by - 24} L${xx + 8},${by - 12} M${xx + 5},${by - 24} L${xx + 11},${by - 24} M${xx + 5},${by - 12} L${xx + 11},${by - 12}"/>`; });
  s += `<path class="hl dash sM" d="M${bx + 4},${by - 18} L${bx + 68},${by - 18}"/>`;
  s += seg("N.S.", bx + 30, by - 34, 5, "sG", .9);
  s += seg("P = .41", x + 100, y + 50, 6, "sW", .9) + seg("N = 212", x + 100, y + 60, 4.4, "sM", .7) + seg("POWER .95", x + 100, y + 68, 4.4, "sM", .7);
  return s;
}

function back(G) {
  let s = shell(pp);
  // projector, beam to the screen (day)
  const cx = SCR.x + SCR.w / 2;
  s += `<rect class="k sM mech" x="${cx - 14}" y="20" width="28" height="10"/><path class="sM" d="M${cx},0 L${cx},20"/>
        <g class="day-only"><path class="hl dash sM" d="M${cx},30 L${SCR.x},${SCR.y} M${cx},30 L${SCR.x + SCR.w},${SCR.y} M${cx},30 L${SCR.x},${SCR.y + SCR.h} M${cx},30 L${SCR.x + SCR.w},${SCR.y + SCR.h}"/><circle class="fW" cx="${cx}" cy="30" r="1.6"/></g>`;
  s += `<g data-hs="screen"><rect class="k sW mech" x="${SCR.x}" y="${SCR.y}" width="${SCR.w}" height="${SCR.h}"/>
        <g class="day-only">${slide()}</g>
        <g class="night-only">${seg("NULL RESULTS,", SCR.x + 8, SCR.y + 8, 9, "sD", 1)}${seg("A DEFENSE", SCR.x + 8, SCR.y + 21, 9, "sD", 1)}</g>
        ${hit(SCR.x, SCR.y, SCR.w, SCR.h)}</g>`;
  s += `<path class="sM mech" d="M${SCR.x},${SCR.y + SCR.h + 4} L${SCR.x + SCR.w},${SCR.y + SCR.h + 4}"/>`;
  // the wall clock on the right wall (as in Room 101), and a sign taped under it
  s += `<path class="k sM mech" d="M476,58 L520,50 L520,70 L476,76 Z"/>${onQuad(seg(G.clock || "14:00", 5, 4.5, 9, "sG", 1.2), 44, 18, [476, 58], [520, 50], [476, 76])}`;
  s += `<path class="k hl sW mech" d="M478,84 L520,78 L520,94 L478,99 Z"/>${onQuad(seg("DEFENSE 14:00", 3, 2.5, 3.2, "sW", .55) + seg("JOB TALK 15:00", 3, 8.5, 3.2, "sR", .55), 42, 15, [478, 84], [520, 78], [478, 99])}`;
  // left wall: the door out, the EXIT sign
  const d1 = P(0, 120, .64), d2 = P(0, 120, .82), d3 = P(0, FY, .82), d4 = P(0, FY, .64);
  s += `<g data-hs="door"><polygon class="k sW mech" points="${poly(d1, d2, d3, d4)}"/>
        <path class="hl sW" d="M${fx((d1[0] + d2[0]) / 2 - 2)},${fx(d1[1] + 4)} L${fx((d4[0] + d3[0]) / 2 - 2)},${fx((d3[1] + d4[1]) / 2 - 4)}"/>
        <path class="sW" d="M${fx(d2[0] - 8)},190 L${fx(d2[0] - 8)},198"/>${hit(Math.min(d1[0], d2[0]) - 2, d2[1] - 2, Math.abs(d2[0] - d1[0]) + 4, d3[1] - d2[1] + 4)}</g>`;
  s += chip("EXIT", d1[0] - 4, d1[1] - 18, 7, "fX", "exitChip");
  // right wall: the pneumatic tube line (quiet today)
  const tx = P(640, 0, .86)[0], ty0 = P(640, 0, .86)[1], ty1 = P(640, FY, .86)[1];
  const b1 = P(640, 120, .8), b2 = P(640, 120, .9), b3 = P(640, 190, .9), b4 = P(640, 190, .8);
  s += `<path class="sM mech" d="M${tx - 4},${ty0} L${tx - 4},${ty1} M${tx + 4},${ty0} L${tx + 4},${ty1}"/>
    ${[0.1, 0.3, 0.75, 0.9].map(f => { const y = ty0 + (ty1 - ty0) * f; return `<path class="sM mech" d="M${tx - 7},${fx(y)} L${tx + 7},${fx(y)} M${tx - 7},${fx(y + 2)} L${tx + 7},${fx(y + 2)}"/>`; }).join("")}
    <polygon class="k sM" points="${poly(b1, b2, b3, b4)}"/><circle class="k sM" cx="${tx}" cy="138" r="6"/>`;
  return s;
}

/* ---- the committee: chairs, people, then the table in front of them ---- */
function committee(G) {
  const q = CK * AUD;
  const tyB = P(0, T.top, T.kb)[1];
  const feet = tyB + 13 * q + 5;                  // sheet y 174 (forearms) lands on the table top
  let s = "";
  const chairAt = (x, tall) => `<g transform="translate(${fx(x - 160 * q)},${fx(feet - 187 * q)}) scale(${q.toFixed(3)})"><g transform="translate(0,34)">${tall
    ? `<path class="k sD" d="M122,140 L122,28 C122,6 198,6 198,28 L198,140"/><path class="hl sD" d="M130,140 L130,32 C130,16 190,16 190,32 L190,140"/>`
    : `<path class="k sD" d="M124,140 L124,56 C124,44 196,44 196,56 L196,140"/>`}</g></g>`;
  COMMITTEE.forEach(([id, X]) => {
    const x = P(X, 0, CK)[0], box = hit(x - 26 * q, feet - 160 * q, 52 * q, 160 * q - 13 * q);
    if (id === "quorumchair") return;
    s += chairAt(x, false);
    if (id === "adline") s += `<g data-hs="adline">${adlineSeated(x, feet, CK)}${box}</g>`;
    if (id === "ethel") s += `<g data-hs="ethel">${ethelAtDesk(x, feet, CK)}${box}</g>`;
    if (id === "small") s += `<g data-hs="small">${smallSeated(x, feet, CK)}${box}</g>`;
  });
  // the table top and its front panel
  const a = P(T.x0, T.top, T.kb), b = P(T.x1, T.top, T.kb), c = P(T.x1, T.top, T.kf), e = P(T.x0, T.top, T.kf);
  const c2 = P(T.x1, FY - 6, T.kf), e2 = P(T.x0, FY - 6, T.kf);
  const top = `<polygon class="k sW" points="${poly(a, b, c, e)}"/>`;
  // papers, water glasses, the thesis (a brick)
  let things = "";
  [40, 100, 220].forEach((X, i) => {
    const p0 = P(X - 14, T.top, .575), p1 = P(X + 10, T.top, .575);
    things += `<path class="hl sW" d="M${fx(p0[0])},${fx(p0[1])} L${fx(p1[0])},${fx(p1[1])} L${fx(p1[0] + 2)},${fx(p1[1] - 2)} L${fx(p0[0] + 2)},${fx(p0[1] - 2)} Z"/>`;
    const g = P(X + 18, T.top, .57); things += `<path class="hl sB" d="M${fx(g[0] - 2)},${fx(g[1] - 6)} L${fx(g[0] - 1.6)},${fx(g[1])} L${fx(g[0] + 1.6)},${fx(g[1])} L${fx(g[0] + 2)},${fx(g[1] - 6)}"/>`;
    if (i === 0) { const t = P(X - 6, T.top, .58); things += `<rect class="k sG mech" x="${fx(t[0] - 9)}" y="${fx(t[1] - 6)}" width="16" height="5"/><path class="hl sG" d="M${fx(t[0] - 7)},${fx(t[1] - 3.5)} L${fx(t[0] + 5)},${fx(t[1] - 3.5)}"/>`; }
  });
  // the empty chair: tall-backed, the chair of the department's chair; an untouched glass of water
  const qx = P(160, 0, CK)[0];
  const qp = P(160, T.top, T.kf);
  const quorum = `<g data-hs="quorumchair">${chairAt(qx, true)}
    ${(() => { const g = P(176, T.top, .57); return `<path class="hl sB" d="M${fx(g[0] - 2)},${fx(g[1] - 6)} L${fx(g[0] - 1.6)},${fx(g[1])} L${fx(g[0] + 1.6)},${fx(g[1])} L${fx(g[0] + 2)},${fx(g[1] - 6)}"/><path class="hl sB" d="M${fx(g[0] - 1.8)},${fx(g[1] - 4)} L${fx(g[0] + 1.8)},${fx(g[1] - 4)}"/>`; })()}
    ${hit(qx - 26 * q, feet - 172 * q, 52 * q, 159 * q)}</g>`;
  // the front panel, with the name placards standing on the front edge
  const panel = `<g data-hs="committee"><polygon class="k sM mech" points="${poly(e, c, c2, e2)}"/>
    <path class="hl sM" d="M${fx(e[0] + 4)},${fx(e[1] + 6)} L${fx(c[0] - 4)},${fx(c[1] + 6)}"/>
    ${hit(e[0], e[1] - 2, c[0] - e[0], e2[1] - e[1] + 2)}</g>`;
  const placards = COMMITTEE.map(([id, X]) => {
    const name = { adline: "ADLINE", ethel: "BORD", quorumchair: "QUORUM", small: "SMALL" }[id];
    const p = P(X, T.top, T.kf), w = 30, h = 8;
    const sign = `<path class="k sW mech" d="M${fx(p[0] - w / 2)},${fx(p[1])} L${fx(p[0] - w / 2 + 1)},${fx(p[1] - h)} L${fx(p[0] + w / 2 - 1)},${fx(p[1] - h)} L${fx(p[0] + w / 2)},${fx(p[1])} Z"/>
      ${segC(name, p[0], p[1] - h + 2, 4, id === "quorumchair" ? "sA" : "sW", .7)}`;
    return id === "quorumchair" ? `<g data-hs="quorumchair">${sign}${hit(p[0] - w / 2, p[1] - h - 1, w, h + 2)}</g>` : sign;
  }).join("");
  return `<g>${s}${quorum}${top}${things}${panel}${placards}</g>`;
}

/* ---- the lectern: Nell's, front right. A gooseneck mic with its live LED. ---- */
function lectern() {
  const ay = floorY(.555), ax = P(530, 0, .555)[0], s = kAtY(ay);
  return `<g data-hs="lectern"><g transform="translate(${fx(ax - 160 * s)},${fx(ay - 190 * s)}) scale(${s.toFixed(3)})">
      <path class="k sB mech" d="M114,124 L206,124 L202,131 L118,131 Z"/><path class="k sB mech" d="M118,131 L202,131 L196,190 L124,190 Z"/>
      <path class="sN mech" d="M132,140 L188,140 L184,180 L136,180 Z"/>${seg("N. NULL", 141, 150, 9, "sW", 1.1)}<path class="hl sN mech" d="M139,168 L181,168 M138,174 L182,174"/>
      <path class="sM" d="M194,124 C197,112 192,104 186,102"/><circle class="fG" cx="185" cy="101" r="2.2"/>
      <path class="hl sW" d="M128,124 L150,119 L152,122 L130,127 Z"/>${hit(114, 98, 92, 92)}</g></g>`;
}

/* ---- the audience: chair backs. Preston (front row) from behind: BRASS hair, SIGNAL suit, earbuds.
        Iris (back row): INK bun, ROBE cardigan, the SIGNAL stapler resting on her shoulder. ---- */
const atQ = (x, y, k, inner, drop = 0) => { const q = k * AUD; return `<g transform="translate(${fx(x - 160 * q)},${fx(y - 187 * q)}) scale(${q.toFixed(3)})"><g transform="translate(0,${drop})">${inner}</g></g>`; };
function prestonBack(x, y, k) {
  return atQ(x, y, k, `
    <path class="k sR" d="M132,124 C134,112 144,106 160,106 C176,106 186,112 188,124 L188,128 L132,128 Z"/>
    <path class="sR" d="M160,108 L160,128"/><path class="sW" d="M150,106 C152,111 168,111 170,106"/>
    <path class="sK" d="M152,96 L152,107 M168,96 L168,107"/>
    <path class="sK" d="M135,70 C129,69 129,80 135,81 M185,70 C191,69 191,80 185,81"/>
    <path class="k sA" d="M134,76 C128,52 140,36 160,35 C180,36 192,52 186,76 C184,90 174,98 160,98 C146,98 136,90 134,76 Z"/>
    <path class="sA" d="M142,48 C150,42 168,41 178,46 M138,62 C146,56 154,54 160,56 M162,56 C170,54 178,58 182,64"/><path class="hl sA" d="M150,70 L149,80 M160,68 L160,80 M170,70 L171,80 M154,94 L155,98 M160,94 L160,99 M166,94 L165,98"/>
    <g class="normal-only"><circle class="k sW" cx="131" cy="76" r="2.6"/><circle class="k sW" cx="189" cy="76" r="2.6"/></g>
    <g class="blank-only"><circle class="fG" cx="131" cy="76" r="3.2"/><circle class="fG" cx="189" cy="76" r="3.2"/>${arcs(124, 76, -1, "sG", 3, 1)}${arcs(196, 76, 1, "sG", 3, 1)}</g>`, 22);
}
function irisBack(x, y, k) {
  return atQ(x, y, k, `
    <path class="k sV" d="M134,100 C137,90 146,86 160,86 C174,86 183,90 186,100 L186,114 L134,114 Z"/><path class="hl sV" d="M144,90 C150,94 170,94 176,90"/>
    <path class="sK" d="M153,76 L153,88 M167,76 L167,88"/>
    <path class="sA dash" d="M139,60 C134,72 138,84 148,90 M181,60 C186,72 182,84 172,90"/>
    <path class="sK" d="M139,56 C134,56 134,64 139,65 M181,56 C186,56 186,64 181,65"/>
    <path class="k sW" d="M138,60 C135,44 146,34 160,34 C174,34 185,44 182,60 C181,72 172,80 160,80 C148,80 139,72 138,60 Z"/>
    <path class="hl sW" d="M146,42 C149,54 150,66 152,76 M160,36 L160,79 M174,42 C171,54 170,66 168,76"/>
    <circle class="k sW" cx="160" cy="28" r="8"/><path class="hl sW" d="M154,26 C157,23 163,23 166,26 M155,31 C158,33 162,33 165,31"/>`, 34);
}
// the stapler, saving the seat beside her: resting on top of that chair's back
function stapleGun(x, y, k) {
  const q = k * AUD, t = y - 68 * q, w = 34 * q;
  return `<g class="mech">${stapler(x - w / 2, t, w)}</g>`;
}
function row(ri, G) {
  const k = ROWS[ri], y = floorY(k), X = (Xf) => P(Xf, FY, k)[0];
  let people = "", chairs = "";
  SEATS[ri].forEach(Xf => {
    chairs += chairBack(X(Xf), y, k);
    if (ri === PRESTON.row && Xf === PRESTON.X) {
      const q = k * AUD, cx = X(Xf);
      chairs += `<rect class="k sW" x="${fx(cx - 13 * q * 1.6)}" y="${fx(y - 58 * q)}" width="${fx(26 * q * 1.6)}" height="${fx(10 * q)}"/>${segC("RESERVED: VALU", cx, y - 56.4 * q, 3.6 * q * 1.6 / 1.15, "sR", .45)}`;
    }
  });
  const q = k * AUD;
  if (ri === PRESTON.row && !G.flags.defenseDone) {
    const x = X(PRESTON.X);
    people += `<g class="pt" id="preston" data-hs="preston">${prestonBack(x, y, k)}${hit(x - 26 * q, y - 156 * q, 52 * q, 156 * q)}</g>`;
  }
  if (ri === IRIS.row) {
    const x = X(IRIS.X);
    const gx = X(IRIS.X + 80);
    people += `<g data-hs="iris">${irisBack(x, y, k)}${hit(x - 26 * q, y - 128 * q, 52 * q, 128 * q)}</g>`;
    chairs += `<g data-hs="iris" style="pointer-events:auto">${stapleGun(gx, y, k)}${hit(gx - 20 * q, y - 86 * q, 40 * q, 20 * q)}</g>`;
  }
  return `<g>${people}<g style="pointer-events:none">${chairs}</g></g>`;
}

export default {
  id: "defense", name: "SEMINAR 101 · DEFENSE", pp,
  floor: { yMin: 230, yMax: 287, margin: 16 },
  entries: { start: [320, 280, 1] },
  draw(G) {
    return { back: back(G), sortables: [
      { depth: floorY(T.kf), svg: committee(G) },
      { depth: floorY(.555), svg: lectern() },
      ...ROWS.map((k, i) => ({ depth: floorY(k), svg: row(i, G) })),
    ] };
  },
  stand: { committee: [212, 236], adline: [166, 236], ethel: [196, 236], quorumchair: [228, 236], small: [262, 236],
    lectern: [434, 234], screen: [364, 232], preston: [330, 250], iris: [430, 286], door: [104, 274] },
  labels: {
    day: { lectern: { use: "BEGIN THE DEFENSE" }, screen: { use: "NEXT SLIDE" }, committee: { use: "HAND OUT COPIES" },
      adline: { use: "WAVE" }, ethel: { use: "WAVE" }, small: { use: "SALUTE" }, quorumchair: { use: "PULL OUT" },
      preston: { use: "TAP SHOULDER" }, iris: { use: "TAP SHOULDER" }, door: { use: "GO OUT", go: "GO OUT" } },
    night: { lectern: { use: "BEGIN THE DEFENSE" }, screen: { use: "WIPE" }, quorumchair: { use: "PULL OUT" }, door: { use: "GO OUT", go: "GO OUT" } },
    morris: { quorumchair: { use: "SIT" }, committee: { use: "CLIMB" }, door: { go: "SCURRY OUT" } },
  },
};
