// THE CROSS-REFERENCE (epilogue, Ethel Bord's office; ACCEPTED ending only). Iris's method: the membership rolls on the
// left, fifty years of grant panels and editorial boards on the right. Click a member: hairlines run to every row where
// the name turns up again. Trace enough of them and the view steps back: the web is a brain (a midsagittal view, the
// rolls along the corpus callosum, the rosters along the cortex). Every name here is fictional.
// crossref(el, { score(key, n) }) → Promise<{ done }>
import { seg, segC, segW, chip } from "../gfx.js";

/* ---------------- the records ---------------- */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const MEMBERS = [
  ["QUORUM A.", 1974, 9], ["LAUD G.", 1976, 6], ["TENURE B.", 1978, 6], ["SINECURE H.", 1981, 6], ["PLENARY O.", 1984, 5],
  ["PEDIGREE C.", 1988, 5], ["KEYNOTE F.", 1992, 5], ["OVERHEAD R.", 1997, 4], ["LAUREL S.", 2003, 4], ["IMPACT M.", 2009, 5],
  ["HINDEX J.", 2012, 4], ["ACCOLADE T.", 2016, 3], ["MICK P.", 2021, 2], ["VALU P.", 2026, 1],
];
const OUTSIDERS = [["CANDOR I.", 1976], ["ROWE K.", 1989], ["DUARTE M.", 1995], ["OKAFOR N.", 2001], ["LINDQVIST E.", 2008], ["LA T.", 2014], ["ADLINE D.", 2019]];
const BODIES = ["STUDY SECT.", "ED. BD. J ENDLESS RES", "ED. BD. NURTURE NEURO", "PRIZE CMTE", "SEARCH CMTE", "COUNCIL", "PROGRAM CMTE", "ED. BD. CELL-EBRITY"];
export const ROWS = (() => {
  const r = rng(1974), rows = [];
  MEMBERS.forEach(([n, j, c], m) => {
    const y0 = Math.min(2026, j + 2), y1 = Math.min(2023 + Math.floor(r() * 3), j + 46);
    for (let k = 0; k < c; k++) {
      const y = c === 1 ? 2026 : Math.round(y0 + (y1 - y0) * k / (c - 1) + (r() - .5) * 2);
      rows.push({ y: Math.max(1976, Math.min(2026, Math.max(j, y))), b: BODIES[Math.floor(r() * BODIES.length)], n, m });
    }
  });
  OUTSIDERS.forEach(([n, y]) => rows.push({ y, b: n === "CANDOR I." ? "STUDY SECT." : BODIES[Math.floor(r() * BODIES.length)], n, m: -1 }));
  rows.sort((a, b) => a.y - b.y || a.n.localeCompare(b.n));
  return rows;
})();
const ENOUGH = 8;

/* ---------------- the brain (midsagittal; frontal pole left) ---------------- */
const CEREBRUM = [[150, 140], [148, 112], [158, 84], [178, 60], [206, 42], [240, 30], [280, 23], [322, 21], [362, 26], [398, 38], [428, 58], [452, 84], [466, 112],
  [470, 138], [462, 160], [444, 176], [420, 182], [396, 180], [372, 176], [350, 180], [326, 184], [300, 184], [272, 186], [246, 190], [220, 190], [196, 184], [176, 172], [160, 158]];
const CC = [[236, 132], [226, 118], [234, 104], [258, 93], [296, 87], [336, 87], [370, 93], [396, 105], [406, 120], [398, 130]];
function catmull(pts, closed, n = 12) {
  const out = [], N = pts.length, P = (i) => pts[closed ? (i + N) % N : Math.max(0, Math.min(N - 1, i))];
  for (let i = 0; i < (closed ? N : N - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); }
  }
  if (!closed) out.push(pts[N - 1]);
  return out;
}
function resample(poly, n, closed) {
  const pts = closed ? [...poly, poly[0]] : poly, cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = cum[cum.length - 1], out = []; let j = 0;
  for (let k = 0; k < n; k++) {
    const s = closed ? L * k / n : L * k / (n - 1);
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const f = (s - cum[j]) / ((cum[j + 1] - cum[j]) || 1), a = pts[j], b = pts[j + 1];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(b[1] - a[1], b[0] - a[0])]);
  }
  return out;
}
const CORTEX = catmull(CEREBRUM, true);
// the pial surface, folded: a wiggle along the outline's normal reads as gyri and sulci
const GYRI = resample(CORTEX, 360, true).map(([x, y, a], i) => { const w = 3.4 * Math.sin(i / 360 * Math.PI * 2 * 30); return [x + Math.sin(a) * w, y - Math.cos(a) * w]; });
const pathOf = (pts, close) => "M" + pts.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L") + (close ? " Z" : "");
const NROW = 72, NCB = 10;
const BRAIN_OUT = (() => {   // node positions for the 72 roster rows: 62 along the cortex, 10 on the cerebellum
  const c = resample(CORTEX, NROW - NCB, true).map(([x, y, a]) => [x - Math.sin(a) * 3, y + Math.cos(a) * 3]);
  const cb = []; for (let k = 0; k < NCB; k++) { const t = Math.PI * (.05 + .9 * k / (NCB - 1)); cb.push([420 + Math.cos(t) * 42, 206 + Math.sin(t) * 22]); }
  const all = [...c, ...cb], r = rng(39), idx = all.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx.map(i => all[i]);
})();
const BRAIN_IN = resample(catmull(CC, false, 8), MEMBERS.length, false).map(([x, y]) => [x, y]);

/* ---------------- layout of the table ---------------- */
const LX = 148, COLX = [232, 368, 504];
const leftPos = (m) => [LX, 32 + m * 17.2];
const rowPos = (i) => [COLX[Math.floor(i / 24)] - 4, 32 + (i % 24) * 10];
const COL = { NELL: "G", ETHEL: "V", IRIS: "V", NARRATOR: "W" };

const CSS = `
.xr svg.xrsvg { position: relative; width: 100%; flex: 1 1 0; min-height: 0; }
.xr [data-m] { cursor: pointer; }
.xr [data-m]:hover path { stroke: var(--G); }
.xr .coachline { font-size: 1.8cqw; line-height: 1.2; }
`;
function css() { if (document.getElementById("css-crossref")) return; const s = document.createElement("style"); s.id = "css-crossref"; s.textContent = CSS; document.head.appendChild(s); }

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function crossref(el, { score = () => {} } = {}) {
  css();
  return new Promise(resolve => {
    const S = { tr: {}, prog: {}, last: -1, n: 0, zoom: 0, revealed: false, say: ["ETHEL", "The reels, transcribed. I've been up since four. I had to buy new binders. Plural."], q: [], auto: false };
    const timers = []; let qT = null, spoken = null;
    const later = (ms, f) => timers.push(setTimeout(f, ms));
    function say(...lines) { S.q = lines; clearTimeout(qT); nextLine(); }
    function nextLine() { qT = null; if (!S.q.length) return; S.say = S.q.shift(); renderCoach(); qT = setTimeout(nextLine, Math.max(2400, 48 * S.say[1].length)); }
    const matches = (m) => ROWS.map((r, i) => r.m === m ? i : -1).filter(i => i >= 0);

    /* --- the table view --- */
    function names() {
      return MEMBERS.map(([n, j], m) => {
        const [x, y] = leftPos(m), t = S.tr[m] !== undefined, c = m === S.last ? "sA" : t ? "sV" : "sW";
        return `<g data-m="${m}">${seg(n, 8, y - 3, 6.5, c, 1)}${seg(String(j), 108, y - 1.5, 4.4, "sM", .7)}
          <circle class="${t ? "fA" : "hl sW"}" cx="${x}" cy="${y}" r="1.8"/><rect x="4" y="${y - 7}" width="${x}" height="15" fill="transparent"/></g>`;
      }).join("");
    }
    function rowsText() {
      return ROWS.map((r, i) => { const [x, y] = rowPos(i);
        return seg(`${r.y}  ${r.b}  ${r.n}`, x + 4, y - 2.2, 4.4, r.m < 0 ? "sM" : "sW", .7); }).join("");
    }
    function lines() {
      let s = "";
      for (const m in S.tr) {
        const ms = matches(+m).slice(0, S.prog[m] || 0), [x0, y0] = leftPos(+m), cl = +m === S.last ? "sA" : "sV";
        ms.forEach(i => { const [x1, y1] = rowPos(i); s += `<path class="hl ${cl}" d="M${x0},${y0} L${x1},${y1}"/><circle class="fA" cx="${x1}" cy="${y1}" r="1.5"/>`; });
      }
      return s;
    }
    function table() {
      return `${seg("MEMBERSHIP ROLLS 1974-", 8, 4, 5, "sA", .9)}${seg("JOINED", 104, 14, 3.6, "sM", .6)}
        ${seg("GRANT PANELS + EDITORIAL BOARDS  1976-2026", COLX[0], 4, 5, "sA", .9)}
        <path class="hl sD" d="M4,20 L170,20 M${COLX[0] - 6},20 L636,20"/>
        <g class="xrows">${rowsText()}</g><g class="xl">${lines()}</g><g class="xn">${names()}</g>`;
    }
    /* --- the step back: fixed poses from the table to the brain --- */
    function zoomed(p) {
      const t = [0, 0, .25, .5, .75, 1, 1][p], sc = p === 0 ? 1 : .86, cx = 320, cy = 140;
      const z = ([x, y]) => [cx + (x - cx) * sc, cy + (y - cy) * sc], L = (a, b) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      const inP = MEMBERS.map((_, m) => L(z(leftPos(m)), BRAIN_IN[m])), outP = ROWS.map((_, i) => L(z(rowPos(i)), BRAIN_OUT[i]));
      let s = "";
      if (p >= 6) s += anatomy();
      MEMBERS.forEach((_, m) => matches(m).forEach(i => s += `<path class="hl sV" d="M${inP[m][0].toFixed(1)},${inP[m][1].toFixed(1)} L${outP[i][0].toFixed(1)},${outP[i][1].toFixed(1)}"/>`));
      outP.forEach((q, i) => s += `<circle class="${ROWS[i].m < 0 ? "hl sM" : "fA"}" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="1.4"/>`);
      inP.forEach(q => s += `<circle class="fA" cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="2"/>`);
      if (p >= 6) s += seg("FIG. 1", 486, 30, 7, "sW", 1) + seg("FIFTY YEARS OF REVIEW", 486, 42, 4.6, "sM", .8) + seg("MIDSAGITTAL VIEW", 486, 50, 4.6, "sM", .8)
        + seg("A ANTERIOR", 150, 258, 4, "sD", .7) + seg("P POSTERIOR", 430, 258, 4, "sD", .7);
      return s;
    }
    function anatomy() {
      const cc = catmull(CC, false, 8), cc2 = cc.map(([x, y], i) => { const k = Math.sin(Math.PI * i / (cc.length - 1)); return [x + (x - 316) * .0, y - 5 - 3 * k]; });
      return `<path class="sW" d="${pathOf(GYRI, true)}"/>
        <path class="hl sW" d="${pathOf(cc, false)}"/><path class="hl sW" d="${pathOf(cc2, false)}"/>
        <path class="hl sD" d="M222,120 C214,92 250,66 300,62 C350,60 400,72 420,104"/>
        <path class="hl sD" d="M318,22 C314,40 306,58 296,72"/><path class="hl sD" d="M430,58 C424,80 414,104 404,124"/><path class="hl sD" d="M404,124 C426,128 448,136 468,140"/>
        <ellipse class="hl sD" cx="334" cy="140" rx="22" ry="12"/>
        <path class="sW" d="M374,190 C376,176 410,178 440,182 C466,186 470,212 452,224 C430,236 392,232 378,218 C370,210 372,198 374,190"/>
        <path class="hl sW" d="M384,200 C404,194 436,196 458,206 M382,210 C404,206 432,208 454,216 M390,222 C408,220 428,222 444,226"/>
        <path class="sW" d="M330,186 C328,196 318,204 318,216 C318,230 330,236 334,246 C337,252 338,258 338,264 M362,184 C364,200 366,222 362,240 C360,250 358,256 358,264"/><path class="hl sW" d="M320,206 C334,210 350,210 364,206 M330,234 C340,238 352,238 362,236"/>`;
    }
    function draw() {
      const body = S.zoom ? zoomed(S.zoom) : table();
      const n = Object.keys(S.tr).length, mt = Object.keys(S.tr).reduce((a, m) => a + matches(+m).length, 0);
      el.innerHTML = `<div class="screen xr">
        <svg class="t hd" viewBox="0 0 640 40">${seg("THE CROSS-REFERENCE", 16, 10, 18, "sW", 1.6)}${seg("ETHEL BORD  RESEARCH INTEGRITY  3F  THE REELS, TRANSCRIBED", 260, 17, 5, "sM", .8)}</svg>
        <svg class="t xrsvg" viewBox="0 0 640 276">${body}</svg>
        <div class="coachline"></div>
        <div class="bar"><span class="status">${S.revealed ? "ONE NETWORK. FIFTY YEARS." : `MEMBERS TRACED ${n} / ${MEMBERS.length}   ·   MATCHES ${mt}`}</span>
          <button data-b="off" class="off">${S.revealed ? "DONE" : "CLOSE"}</button></div></div>`;
      renderCoach();
    }
    function renderCoach() {
      const c = el.querySelector(".xr .coachline"); if (!c) return; const col = COL[S.say[0]] || "W";
      if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(S.say[0], true); }
      c.innerHTML = `<span class="who" style="background:var(--${col})">${S.say[0]}</span><span style="color:var(--${col})">${S.say[1]}</span>`;
    }
    const layer = (cls, html) => { const g = el.querySelector(".xr ." + cls); if (g) g.innerHTML = html; };
    function status() { const st = el.querySelector(".xr .status"); if (!st) return; const n = Object.keys(S.tr).length, mt = Object.keys(S.tr).reduce((a, m) => a + matches(+m).length, 0); st.textContent = `MEMBERS TRACED ${n} / ${MEMBERS.length}   ·   MATCHES ${mt}`; }

    function trace(m, fast = false) {
      if (S.tr[m] !== undefined || S.zoom) return;
      S.tr[m] = S.n++; S.last = m; S.prog[m] = 0; if (!fast) sfx("select");
      const ms = matches(m);
      layer("xn", names()); status();
      ms.forEach((_, k) => later((fast ? 25 : 70) * (k + 1), () => { S.prog[m] = k + 1; layer("xl", lines()); if (!fast) sfx("pen", { k }); }));
      if (fast) return;
      const n = S.n;
      if (n === 1) say(["NELL", m === 0 ? "Quorum. Eight rows. Fifty years of panels, from a man who's been thirty-nine since 1979." : "Every time the name comes up again, a line."]);
      if (n === 3) say(["ETHEL", "That is a great many lines for a coincidence."]);
      if (n === 5) say(["IRIS", "It's just matching, dear. That's all it ever was. Nobody ever bothered to match."]);
      if (n === 6) say(["NELL", "Every panel. Every board. The same names, decade after decade, reviewing each other."]);
      if (n === ENOUGH) later(70 * ms.length + 900, stepBack);
    }
    function stepBack() {
      say(["NELL", "Wait. Step back."]);
      MEMBERS.forEach((_, m) => { if (S.tr[m] === undefined) trace(m, true); });
      layer("xn", names()); status();
      [1, 2, 3, 4, 5, 6].forEach(p => later(1100 + p * 320, () => { S.zoom = p; draw(); if (p === 4) sfx("swell"); }));
      later(1100 + 7 * 320, () => {
        S.revealed = true; score("crossref", 3); sfx("chime"); draw();
        say(["NELL", "It's a brain. Fifty years of peer review, and it's one brain."],
          ["IRIS", "One brain, thinking one thought, for fifty years. The rolls along the middle. Every panel on the surface."],
          ["IRIS", "I'm on there once, you know. 1976. They never asked me back."],
          ["ETHEL", "I'm going to need a much bigger binder."]);
      });
    }
    const onClick = (e) => {
      const b = e.target.closest && e.target.closest("button[data-b]"); if (b) { finish(); return; }
      const m = e.target.closest && e.target.closest("[data-m]"); if (m) trace(+m.dataset.m);
    };
    const onKey = (e) => { if (e.key === "Escape") finish(); };
    function finish() {
      timers.forEach(clearTimeout); clearTimeout(qT);
      el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = "";
      resolve({ done: S.revealed });
    }
    el.classList.add("show"); draw();
    qT = setTimeout(nextLine, 2600);
    S.q.push(["IRIS", "Membership on the left. Fifty years of panels and boards on the right. Click a member, and draw a line wherever the name turns up again."]);
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
  });
}
