// THE TITLE SCREEN: one big LED dot-matrix display (the Round Table appears on it only while it glitches), the way Teenage Engineering draws its hardware screens (OB-4,
// EP-133). The whole card is the panel: a 128 × 72 grid of LEDs at 5 px pitch. The unlit grid is a single SVG
// pattern; only lit dots are drawn (they're ON, so they're filled). On it, in dim dots: the Round Table (the iron ring,
// its seat lamps, hoods along the back). In bright dots: GAIN CONTROL (5×7 font) and the act menu (3×5 font).
// Every few seconds something tries to take the screen over: bands of rows slip sideways, a red ghost channel, stray
// LEDs firing, a scan line, and sometimes a takeover (the title and the menu rewritten in red, the seat lamps lit).
// Poses, not tweens: each glitch is a few fixed frames.
const P = 3.2, NC = 200, NR = 112;                 // pitch, columns, rows
const f = (v) => v.toFixed(1);

const BIG = {
  A: "01110 10001 10001 11111 10001 10001 10001", B: "11110 10001 10001 11110 10001 10001 11110", C: "01110 10001 10000 10000 10000 10001 01110",
  D: "11110 10001 10001 10001 10001 10001 11110", E: "11111 10000 10000 11110 10000 10000 11111", F: "11111 10000 10000 11110 10000 10000 10000",
  G: "01110 10001 10000 10111 10001 10001 01111", H: "10001 10001 10001 11111 10001 10001 10001", I: "01110 00100 00100 00100 00100 00100 01110",
  J: "00111 00010 00010 00010 00010 10010 01100", K: "10001 10010 10100 11000 10100 10010 10001", L: "10000 10000 10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10101 10001 10001 10001", N: "10001 10001 11001 10101 10011 10001 10001", O: "01110 10001 10001 10001 10001 10001 01110",
  P: "11110 10001 10001 11110 10000 10000 10000", Q: "01110 10001 10001 10001 10101 10010 01101", R: "11110 10001 10001 11110 10100 10010 10001",
  S: "01111 10000 10000 01110 00001 00001 11110", T: "11111 00100 00100 00100 00100 00100 00100", U: "10001 10001 10001 10001 10001 10001 01110",
  V: "10001 10001 10001 10001 10001 01010 00100", W: "10001 10001 10001 10101 10101 10101 01010", X: "10001 10001 01010 00100 01010 10001 10001",
  Y: "10001 10001 01010 00100 00100 00100 00100", Z: "11111 00001 00010 00100 01000 10000 11111", "0": "01110 10001 10011 10101 11001 10001 01110",
  "2": "01110 10001 00001 00010 00100 01000 11111", ":": "00000 01100 01100 00000 01100 01100 00000", "-": "00000 00000 00000 11111 00000 00000 00000",
  " ": "00000 00000 00000 00000 00000 00000 00000",
};
const SMALL = {
  A: "010 101 111 101 101", B: "110 101 110 101 110", C: "011 100 100 100 011", D: "110 101 101 101 110", E: "111 100 110 100 111",
  F: "111 100 110 100 100", G: "011 100 101 101 011", H: "101 101 111 101 101", I: "111 010 010 010 111", J: "001 001 001 101 010",
  K: "101 101 110 101 101", L: "100 100 100 100 111", M: "101 111 111 101 101", N: "111 101 101 101 101", O: "010 101 101 101 010",
  P: "110 101 110 100 100", Q: "010 101 101 110 011", R: "110 101 110 101 101", S: "011 100 010 001 110", T: "111 010 010 010 010",
  U: "101 101 101 101 111", V: "101 101 101 101 010", W: "101 101 111 111 101", X: "101 101 010 101 101", Y: "101 101 010 010 010",
  Z: "111 001 010 100 111", "0": "111 101 101 101 111", "1": "010 110 010 010 111", "2": "110 001 010 100 111", "3": "110 001 010 001 110",
  "4": "101 101 111 001 001", "5": "111 100 110 001 110", "6": "011 100 111 101 111", "7": "111 001 010 010 010", "8": "111 101 111 101 111", "9": "111 101 111 001 110", ":": "000 010 000 010 000", "-": "000 000 111 000 000", ".": "000 000 000 000 010",
  ",": "000 000 000 010 100", ">": "100 010 001 010 100", "'": "010 010 000 000 000", " ": "000 000 000 000 000",
};
// put text into a dot map at grid (c, r); returns its width in columns
// (sc: each font pixel becomes an sc × sc block of LEDs)
function text(map, str, c, r, cls, font = SMALL, sc = 1) {
  const w = font === BIG ? 5 : 3; let x = c;
  for (const ch of str.toUpperCase()) { const rows = (font[ch] || font[" "]).split(" ");
    rows.forEach((bits, j) => [...bits].forEach((b, i) => { if (b === "1") for (let u = 0; u < sc; u++) for (let v = 0; v < sc; v++) map.set(`${x + i * sc + u},${r + j * sc + v}`, cls); }));
    x += (w + 1) * sc; }
  return x - c - sc;
}
const textW = (str, font = SMALL, sc = 1) => (str.length * ((font === BIG ? 5 : 3) + 1) - 1) * sc;
const center = (str, font, sc = 1) => Math.round((NC - textW(str, font, sc)) / 2);

/* ---------------- the layers ---------------- */
// the Round Table, in dim LEDs: two ellipses for the ring, hoods behind it, a lamp at each seat
const RC = 100, RR = 29, RX = 92, RY = 18;
function table(map, lit) {
  const dim = "d";
  const ell = (rx, ry, from = 0, to = 360) => { for (let a = from; a < to; a += 1.2) { const t = a * Math.PI / 180; map.set(`${Math.round(RC + rx * Math.cos(t))},${Math.round(RR + ry * Math.sin(t))}`, dim); } };
  // hoods along the back arc (drawn first, so the ring sits in front of them)
  const HOOD = ["0011100", "0111110", "0110110", "0110110", "1111111", "1111111"];
  for (const a of [205, 233, 261, 279, 307, 335]) { const t = a * Math.PI / 180, x = Math.round(RC + (RX - 4) * Math.cos(t)) - 7, y = Math.round(RR + (RY - 1) * Math.sin(t)) - 12;
    HOOD.forEach((row, j) => [...row].forEach((b, i) => { if (b === "1") for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1]]) map.set(`${x + i * 2 + u},${y + j * 2 + v}`, dim); })); }
  ell(RX, RY); ell(RX - 9, RY - 5, 0, 180);
  for (let i = 0; i < 12; i++) { const t = (i * 30 + 15) * Math.PI / 180, x = Math.round(RC + (RX - 4.5) * Math.cos(t)), y = Math.round(RR + (RY - 2.5) * Math.sin(t));
    for (const [u, v] of [[0, 0], [1, 0], [0, 1], [1, 1]]) map.set(`${x + u},${y + v}`, lit && (i + lit) % 3 ? "r" : "m"); }
}
const ACTS = [["1", "I", "SUBMISSION"], ["2", "II", "UNDER REVIEW"], ["3", "III", "MAJOR REVISIONS"], ["4", "IV", "REBUTTAL"], ["5", "V", "DECISION"]];
const MENU0 = 64, MENU_DY = 8;
function screen({ unlocked = 1, title = "GAIN CONTROL", titleCls = "w", menuWord = null, lit = 0, full = true, showTable = false, sound = null } = {}) {
  const map = new Map(); if (showTable) table(map, lit);
  // browsers keep a page silent until it's clicked: say so, top right, until the music is running
  if (sound && !sound()) text(map, "CLICK FOR SOUND", NC - 6 - textW("CLICK FOR SOUND"), 6, "m");
  // clear a band behind the title so it reads, then the title, in the middle of the ring
  const tc = Math.max(1, center(title, BIG, 2));
  for (let r = 19; r < 40; r++) for (let c = tc - 3; c < tc + textW(title, BIG, 2) + 3; c++) map.delete(`${c},${r}`);
  text(map, title, tc, 22, titleCls, BIG, 2);
  text(map, "SELECT AN ACT", center("SELECT AN ACT"), MENU0 - 8, "m");
  const rows = ACTS.map(([id, n, name], i) => {
    const r = MENU0 + i * MENU_DY, label = `ACT ${n.padEnd(3, " ")} ${menuWord ? menuWord[i % menuWord.length] : name}`, c = 56;
    const m = new Map(); text(m, label, c, r, menuWord ? "r" : (unlocked >= +id || id === "1" ? "w" : "m"));
    return { id, r, c, m, w: textW(label) };
  });
  if (unlocked < 2) text(map, "START WITH ACT I, OR JUMP AHEAD", 6, NR - 9, "m");   // first visit only
  const fullRow = full ? (() => { const m = new Map(); text(m, "FULLSCREEN", NC - 6 - textW("FULLSCREEN"), NR - 9, "m"); return m; })() : null;
  return { map, rows, fullRow };
}

/* ---------------- drawing ---------------- */
const CLS = { w: "lw", m: "lm", d: "ld", r: "lr", g: "lg" };
// shift: row → column offset (bands slipping); ghost: draw a red copy one column left; noise: stray LEDs; scan: a lit row
function render(S, { shift = null, ghost = false, noise = 0, scan = -1 } = {}) {
  const dot = (c, r, k) => { c += shift ? (shift[r] || 0) : 0; if (c < 0 || c >= NC || r < 0 || r >= NR) return "";
    return `<circle class="${CLS[k]}" cx="${f(c * P + P / 2)}" cy="${f(r * P + P / 2)}" r="1.2"/>`; };
  const layer = (m) => { let o = ""; for (const [k, v] of m) { const [c, r] = k.split(",").map(Number); if (ghost) o += dot(c - 2, r, "r"); o += dot(c, r, v); } return o; };
  let s = `<defs><pattern id="ledgrid" width="${P}" height="${P}" patternUnits="userSpaceOnUse"><circle class="hl sN" cx="${P / 2}" cy="${P / 2}" r=".45" style="stroke-width:.4"/></pattern></defs>`
    + `<rect width="640" height="360" fill="url(#ledgrid)"/>`;
  s += layer(S.map);
  for (const R of S.rows) {
    s += `<g data-btn="${R.id}" class="ledbtn">${layer(R.m)}`
      + `<g class="cur">${dot(R.c - 6, R.r, "g")}${dot(R.c - 5, R.r + 1, "g")}${dot(R.c - 4, R.r + 2, "g")}${dot(R.c - 5, R.r + 3, "g")}${dot(R.c - 6, R.r + 4, "g")}</g>`
      + `<rect x="${(R.c - 8) * P}" y="${(R.r - 1.5) * P}" width="${(R.w + 12) * P}" height="${MENU_DY * P}" fill="transparent"/></g>`;
  }
  if (S.fullRow) s += `<g data-full class="ledbtn" style="cursor:pointer">${layer(S.fullRow)}<rect x="${(NC - 8 - textW("FULLSCREEN")) * P}" y="${(NR - 11) * P}" width="${(textW("FULLSCREEN") + 4) * P}" height="${9 * P}" fill="transparent"/></g>`;
  if (noise) for (let i = 0; i < NC * NR * noise; i++) s += dot(Math.floor(Math.random() * NC), Math.floor(Math.random() * NR), Math.random() < .3 ? "r" : "w");
  if (scan >= 0) for (let c = 0; c < NC; c++) s += dot(c, scan, "g");
  return s;
}
export const LED_CSS = `
#card .lw { fill: var(--W); } #card .lm { fill: var(--M); } #card .ld { fill: var(--N); } #card .lr { fill: var(--R); } #card .lg { fill: var(--G); }
#card .ledbtn { cursor: pointer; } #card .ledbtn .cur { display: none; }
#card .ledbtn:hover .lw, #card .ledbtn:hover .lm { fill: var(--G); } #card .ledbtn:hover .cur { display: inline; }
`;
function css() { if (document.getElementById("css-led")) return; const s = document.createElement("style"); s.id = "css-led"; s.textContent = LED_CSS; document.head.appendChild(s); }

export function titleArt(opts = {}) { css(); return `<g id="ttl">${render(screen(opts))}</g>`; }

// run the glitches while the title card is up; returns stop()
const WORDS = ["GAIN CONTROLLED", "GAIN: MAXIMUM", "FOG NEURO", "OBEY THE BOARD", "REVIEWER 2", "CONSCIENCE: 0", "FURTHER RESEARCH"];
const MENUW = [["OBEY", "OBEY", "OBEY", "OBEY", "OBEY"], ["DESK REJECT", "DESK REJECT", "MAJOR REVISIONS", "DESK REJECT", "DESK REJECT"],
  ["FURTHER RESEARCH", "IS NEEDED", "FURTHER RESEARCH", "IS NEEDED", "AGE 39"], ["SECONDED.", "SECONDED.", "SECONDED.", "SECONDED.", "SECONDED."]];
export function titleGlitch(root, { sfx = () => {}, ...opts } = {}) {
  let alive = true, t = null;
  const set = (svg) => { const e = root.querySelector("#ttl"); if (e) e.innerHTML = svg; };
  const r = (a) => a[Math.floor(Math.random() * a.length)];
  const bands = (n, amp) => { const s = {}; for (let k = 0; k < n; k++) { const r0 = Math.floor(Math.random() * NR), h = 3 + Math.floor(Math.random() * 10), d = (Math.random() < .5 ? -1 : 1) * (1 + Math.floor(Math.random() * amp * 1.6));
    for (let rr = r0; rr < r0 + h; rr++) s[rr] = d; } return s; };
  const base = () => screen(opts);
  async function run(big) {
    // at rest the title sits alone; the Round Table only flashes in while something is trying to take the screen
    const B = base(), Bt = screen({ ...opts, showTable: true });
    const frames = [[render(Bt, { shift: bands(4, 3) }), 70], [render(Bt, { ghost: true, shift: bands(2, 2) }), 60], [render(Bt, { noise: .02, shift: bands(6, 4) }), 60]];
    if (big) {
      const T = screen({ ...opts, title: r(WORDS), titleCls: "r", menuWord: r(MENUW), lit: 1, showTable: true });
      for (let sc = 0; sc < NR; sc += 14) frames.push([render(T, { scan: sc, shift: bands(3, 2) }), 45]);
      frames.push([render(T), 420], [render(T, { ghost: true, noise: .03 }), 70], [render(Bt, { shift: bands(8, 5), noise: .01 }), 70]);
      sfx();
    }
    frames.push([render(B), 0]);
    for (const [svg, ms] of frames) { if (!alive) return; set(svg); if (ms) await new Promise(res => (t = setTimeout(res, ms))); }
  }
  const loop = () => { if (!alive) return; t = setTimeout(async () => { await run(Math.random() < .45); loop(); }, 2400 + Math.random() * 3600); };
  loop();
  // the CLICK FOR SOUND hint goes the moment the sound comes on
  let heard = opts.sound ? opts.sound() : true;
  const watch = opts.sound ? setInterval(() => { const now = opts.sound(); if (now !== heard) { heard = now; if (alive) set(render(base())); } }, 300) : null;
  return () => { alive = false; clearTimeout(t); clearInterval(watch); };
}

// THE HANDOFF: the act you picked lights up, the takeover finally wins the screen, and the display collapses like a CRT
// switching off (squash to a line, the line to a dot, the dot out). Poses, not tweens: a fixed run of frames.
export async function titleExit(root, choice, { sfx = () => {}, ...opts } = {}) {
  const set = (svg) => { const e = root.querySelector("#ttl"); if (e) e.innerHTML = svg; };
  const wait = (ms) => new Promise(res => setTimeout(res, ms));
  const bands = (n, amp) => { const s = {}; for (let k = 0; k < n; k++) { const r0 = Math.floor(Math.random() * NR), h = 3 + Math.floor(Math.random() * 10), d = (Math.random() < .5 ? -1 : 1) * (1 + Math.floor(Math.random() * amp * 1.6));
    for (let rr = r0; rr < r0 + h; rr++) s[rr] = d; } return s; };
  const flat = (S, recolor = {}) => { const m = new Map(S.map); for (const R of S.rows) for (const [k, v] of R.m) m.set(k, recolor[R.id] || v); return { map: m, rows: [], fullRow: null }; };
  const B = screen(opts), pick = flat(B, { [choice]: "g" });
  const idx = Math.max(0, +choice - 1);
  const T = flat(screen({ ...opts, title: "GAIN CONTROLLED", titleCls: "r", menuWord: [0, 1, 2, 3, 4].map(i => (i === idx ? "ACCEPTED" : "OBEY")), lit: 1, showTable: true }));
  // 1. the choice blinks green twice
  for (const [S, ms] of [[pick, 90], [flat(B), 70], [pick, 90], [flat(B), 60], [pick, 140]]) { set(render(S)); await wait(ms); }
  // 2. the takeover wins: bands slip, a red ghost, the title turns, noise climbs
  sfx();
  const Bt = flat(screen({ ...opts, showTable: true }), { [choice]: "g" });
  const burst = [[Bt, { shift: bands(5, 3) }, 55], [Bt, { ghost: true, shift: bands(3, 2), noise: .01 }, 55], [T, { scan: 20, shift: bands(4, 3) }, 50],
    [T, { scan: 48, ghost: true, noise: .02 }, 50], [T, { scan: 76, shift: bands(7, 5), noise: .04 }, 50], [T, { ghost: true, noise: .06, shift: bands(9, 6) }, 60],
    [T, { noise: .09, shift: bands(12, 8) }, 60]];
  for (const [S, o, ms] of burst) { set(render(S, o)); await wait(ms); }
  // 3. CRT off: squash toward the middle row, then a line, then a dot
  const mid = Math.floor(NR / 2), all = T.map;
  for (const k of [.5, .22, .08]) {
    const m = new Map(); for (const [key, v] of all) { const [c, r] = key.split(",").map(Number); m.set(`${c},${Math.round(mid + (r - mid) * k)}`, v === "r" ? "r" : "w"); }
    set(render({ map: m, rows: [], fullRow: null }, { shift: bands(2, 2) })); await wait(55);
  }
  for (const half of [NC / 2, NC / 3, NC / 6, NC / 14, 3, 1]) {
    const m = new Map(); for (let c = Math.round(NC / 2 - half); c < Math.round(NC / 2 + half); c++) m.set(`${c},${mid}`, "g");
    set(render({ map: m, rows: [], fullRow: null })); await wait(half > 3 ? 45 : 90);
  }
  set(render({ map: new Map(), rows: [], fullRow: null })); await wait(260);
}
