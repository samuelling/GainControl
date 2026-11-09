import { megazineRoll } from "../megazine.js";
import { CLASSICS_REFS_SORTED } from "../data/classics_refs.js";
import * as CONSOLE from "../console/modules.js";
// THE AFTERMATH and THE CREDITS. Show, don't tell: what happens after the climax is a montage of short animated cards
// (stepped poses, like everything else), not paragraphs. Then the credits roll, cast first, in portraits.
import { seg, segC, segW, chip, chipW, arcs, star4, stapler } from "../gfx.js";
import { PORTRAIT } from "../portraits.js";

const f = (n) => (+n).toFixed(1);
const cc = (t, cx, y, h, cls) => chip(t, cx - chipW(t, h) / 2, y, h, cls);

// play a list of frames: each is { n, ms, hold, draw(i) → svg, sfx(i) }; a click moves on early
async function montage(api, frames) {
  for (let k = 0; k < frames.length; k++) {
    const fr = frames[k], id = "aft" + k + "_" + Math.floor(Math.random() * 1e6);
    const shown = api.bigCard(`<g id="${id}">${fr.draw(0)}</g>`, { auto: (fr.n - 1) * fr.ms + (fr.hold || 2400), hold: 300 });
    if (fr.sfx) fr.sfx(0);
    (async () => { for (let i = 1; i < fr.n; i++) { await api.wait(fr.ms); const g = document.getElementById(id); if (!g) return; g.innerHTML = fr.draw(i); if (fr.sfx) fr.sfx(i); } })();
    await shown;
  }
}

/* ---------------- the frames ---------------- */
// a newspaper spinning in, in four poses; the headline lands
const paper = (head1, head2, sub) => ({ n: 5, ms: 110, hold: 2600, sfx: (i) => i === 4 && window.SFX && window.SFX.play("thud"),
  draw: (i) => {
    const sc = [.12, .3, .55, .82, 1][i], rot = [540, 300, 160, 40, -3][i];
    let p = `<rect class="k sW" x="-150" y="-100" width="300" height="200"/>${chip("THE DAILY STIMULUS", -140, -92, 7, "fW")}${seg("FRIDAY EXTRA · 25¢", 64, -88, 4, "sM", .7)}
      <path class="sW" d="M-140,-74 L140,-74"/>${segC(head1, 0, -64, 15, "sW", 1.7)}${segC(head2, 0, -42, 15, "sW", 1.7)}${segC(sub, 0, -16, 6, "sA", 1)}
      <rect class="hl sM" x="-140" y="0" width="120" height="88"/>${[6, 18, 30, 42, 54, 66, 78].map(y => `<path class="hl sD" d="M0,${y} L140,${y}"/>`).join("")}
      <circle class="hl sM" cx="-80" cy="40" r="26"/><path class="hl sM" d="M-80,14 L-80,66 M-106,40 L-54,40"/>`;
    return `<g transform="translate(320,176) rotate(${rot}) scale(${sc})">${p}</g>` + (i === 4 ? arcs(160, 176, -1, "sW", 3, 1.4) + arcs(480, 176, 1, "sW", 3, 1.4) : "");
  } });
// a booking photo: height chart, a flash, the placard
const mugshot = (name, line2, chipTxt) => ({ n: 3, ms: 140, hold: 2600, sfx: (i) => i === 1 && window.SFX && window.SFX.play("flash"),
  draw: (i) => {
    if (i === 1) return `<rect x="0" y="0" width="640" height="360" class="fW"/>`;
    let s = "";
    for (let h = 0; h <= 8; h++) { const y = 300 - h * 30; s += `<path class="hl sM" d="M180,${y} L460,${y}"/>${seg(`${4 + Math.floor(h / 2)}'${h % 2 ? 6 : 0}"`, 150, y - 4, 5, "sD", .7)}`; }
    // a head and shoulders in silhouette lines, gold chain still on
    s += `<path class="k sW" d="M262,300 C262,250 284,232 320,232 C356,232 378,250 378,300"/><path class="k sK" d="M296,170 C292,200 304,222 320,222 C336,222 348,200 344,170"/>
      <path class="sW" d="M292,168 C292,140 348,140 348,168"/><circle class="fW" cx="309" cy="186" r="1.6"/><circle class="fW" cx="331" cy="186" r="1.6"/>
      <path class="sA" d="M290,236 C300,262 340,262 350,236"/>${[0, 1, 2, 3, 4].map(j => `<circle class="k sA" cx="${300 + j * 10}" cy="${254 + Math.abs(j - 2) * -3}" r="3"/>`).join("")}`;
    s += `<rect class="k sW" x="250" y="262" width="140" height="40"/>${segC(name, 320, 270, 9, "sW", 1.2)}${segC(line2, 320, 286, 7, "sA", 1)}`;
    return s + cc(chipTxt, 320, 40, 8, "fR");
  } });
// a counter climbing in steps
const counter = (who, label, to, tail) => ({ n: 12, ms: 110, hold: 2600, sfx: (i) => window.SFX && window.SFX.play(i === 11 ? "chime" : "tick"),
  draw: (i) => {
    const v = Math.round(to * Math.min(1, i / 10));
    return `${segC(who, 320, 70, 12, "sW", 1.4)}${segC(label, 320, 104, 6, "sM", 1)}${segC(String(v).padStart(2, "0"), 320, 130, 70, v === to ? "sR" : "sW", 3)}
      ${i >= 11 ? cc(tail, 320, 262, 7, "fA") : ""}`;
  } });
// envelopes coming open, one after another
const envelopes = (title, sub) => ({ n: 7, ms: 150, hold: 2400, sfx: (i) => i && window.SFX && window.SFX.play("paper"),
  draw: (i) => {
    let s = segC(title, 320, 54, 12, "sW", 1.4);
    for (let j = 0; j < 6; j++) { const x = 92 + j * 80, y = 150, open = j < i;
      s += `<rect class="k sW" x="${x}" y="${y}" width="66" height="44"/><path class="sW" d="M${x},${y} L${x + 33},${open ? y - 26 : y + 22} L${x + 66},${y}"/>${seg("R2", x + 4, y + 34, 5, open ? "sR" : "sD", .8)}`;
      if (open) s += `<rect class="hl sW" x="${x + 8}" y="${y - 18}" width="50" height="22"/>${[0, 1, 2].map(r => `<path class="hl sM" d="M${x + 12},${y - 13 + r * 6} L${x + 52},${y - 13 + r * 6}"/>`).join("")}`; }
    return s + (i >= 6 ? cc(sub, 320, 248, 7, "fW") : "");
  } });
// a journal cover, then the ACCEPTED stamp comes down
const stamp = (journal, title, dedic, word = "ACCEPTED") => ({ n: 3, ms: 260, hold: 2800, sfx: (i) => i === 2 && window.SFX && window.SFX.play("stamp"),
  draw: (i) => {
    let s = `<rect class="k sW" x="220" y="40" width="200" height="270"/>${segC(journal, 320, 54, 8, "sW", 1.1)}<path class="sW" d="M232,72 L408,72"/>
      ${segC(title, 320, 96, 12, "sW", 1.4)}${segC("N. NULL", 320, 120, 6, "sM", 1)}
      <path class="hl sM" d="M250,170 L390,170 L390,240 L250,240 Z M250,236 L276,200 L300,226 L330,190 L360,232 L390,206"/>
      ${segC(dedic, 320, 262, 5, "sA", .8)}`;
    if (i === 1) s += `<g transform="translate(330,110) rotate(-12)"><rect class="k sR" x="-70" y="-120" width="140" height="44"/>${segC(word, 0, -112, word.length > 10 ? 10 : 16, "sR", 1.8)}</g>`;
    if (i === 2) s += `<g transform="translate(330,190) rotate(-12)"><rect class="sR" x="-80" y="-24" width="160" height="48"/>${segC(word, 0, -15, word.length > 10 ? 12 : 20, "sR", 2.2)}</g>${arcs(226, 190, -1, "sR", 3, 1.2)}${arcs(424, 190, 1, "sR", 3, 1.2)}`;
    return s;
  } });
// Alpha the dart frog on Nell's desk; the clock turns nine and the mister comes on
const frog = (line) => ({ n: 6, ms: 300, hold: 2400, sfx: (i) => i === 2 && window.SFX && window.SFX.play("hiss"),
  draw: (i) => {
    const t = i < 2 ? "08:59" : "09:00", mist = i >= 2;
    let s = `<path class="sM" d="M120,276 L520,276"/><rect class="k sW" x="220" y="132" width="200" height="144"/><path class="hl sW" d="M226,138 L414,138"/>
      <path class="sG" d="M234,276 C246,236 256,226 270,214 M262,276 C268,244 282,226 300,222 M392,276 C388,240 376,224 360,216"/>
      <rect class="k sM" x="300" y="112" width="40" height="20"/>${seg(t, 452, 132, 14, mist ? "sG" : "sW", 1.4)}${seg("NELL'S DESK", 452, 116, 4, "sM", .7)}
      <g transform="translate(330,${i % 2 ? 252 : 254})"><path class="k sB" d="M-16,10 C-18,-6 -6,-12 0,-12 C8,-12 18,-6 16,10 Z"/>
      <circle class="k sB" cx="-7" cy="-11" r="4"/><circle class="k sB" cx="7" cy="-11" r="4"/><circle class="fK" cx="-7" cy="-11" r="1.5"/><circle class="fK" cx="7" cy="-11" r="1.5"/>
      <path class="sB" d="M-16,8 L-24,14 M16,8 L24,14 M-10,10 L-14,18 M10,10 L14,18"/><circle class="fK" cx="-4" cy="2" r="2"/><circle class="fK" cx="6" cy="-2" r="1.6"/></g>
      ${seg("ALPHA", 316, 286, 6, "sB", 1)}`;
    if (mist) for (let j = 0; j < 14; j++) { const x = 228 + (j * 53 % 186), y = 142 + ((j * 31 + i * 23) % 120); s += `<circle class="fB" cx="${x}" cy="${y}" r="1.2"/>`; }
    if (mist) s += arcs(316, 122, -1, "sB", 2, .8) + arcs(324, 122, 1, "sB", 2, .8);
    return s + segC(line, 320, 40, 8, "sW", 1.1);
  } });
// Iris sets the stapler down, for good
const retire = (line, chipTxt) => ({ n: 4, ms: 300, hold: 2600, sfx: (i) => i === 3 && window.SFX && window.SFX.play("clunk"),
  draw: (i) => {
    const y = [150, 190, 226, 246][i], rot = [-30, -16, -6, 0][i];
    return `<path class="sM" d="M140,276 L500,276"/><rect class="hl sD" x="200" y="60" width="240" height="140"/>${segC("THE NEWS", 320, 70, 5, "sD", .8)}
      <g transform="translate(320,${y}) rotate(${rot})">${stapler(-60, 30, 120)}</g>
      ${i === 3 ? `${cc(chipTxt, 320, 296, 7, "fV")}${segC(line, 320, 24, 8, "sW", 1.1)}` : ""}`;
  } });
// Gus's desk: the laptop still running a GLM; Dendroboard, one unread reply; a canister rattles in the wall
const gusDesk = () => ({ n: 6, ms: 280, hold: 3200, sfx: (i) => i === 4 && window.SFX && window.SFX.play("rattle"),
  draw: (i) => {
    const bar = Math.min(100, 40 + i * 12);
    let s = `<path class="sM" d="M100,280 L540,280"/><path class="k sW" d="M200,280 L440,280 L420,268 L220,268 Z"/><rect class="k sW" x="226" y="120" width="188" height="146"/>
      ${seg("GLM  RUNNING", 236, 130, 6, "sW", 1)}<rect class="hl sW" x="236" y="146" width="80" height="8"/><rect class="fG" x="238" y="148" width="${f(76 * bar / 100)}" height="4"/>
      <rect class="k sM" x="322" y="140" width="84" height="110"/>${seg("DENDROBOARD", 326, 146, 4, "sG", .8)}${[0, 1, 2, 3].map(r => `<path class="hl sD" d="M326,${162 + r * 12} L400,${162 + r * 12}"/>`).join("")}
      ${i >= 2 ? chip("1 UNREAD", 330, 218, 5, i % 2 ? "fA" : "fW") : ""}${seg("GUS IAN", 236, 240, 6, "sB", 1)}`;
    if (i >= 4) s += `<path class="sD" d="M560,40 L560,300"/>${arcs(548, 160 + (i % 2) * 6, -1, "sM", 3, 1)}${seg("RATTLE", 476, 210, 6, "sM", 1)}`;
    return s + segC("THE LAST SHOT", 320, 40, 8, "sW", 1.1);
  } });

// the lost and found, B1: the robes go in a box, one by one, and nobody comes back for them
const lostFound = (line, chipTxt) => ({ n: 6, ms: 260, hold: 2800, sfx: (i) => i && window.SFX && window.SFX.play("cloth"),
  draw: (i) => {
    const hood = (x, y, r, c) => `<g transform="translate(${x},${y}) rotate(${r})"><path class="k ${c}" d="M-14,12 C-16,-2 -8,-16 0,-22 C8,-16 16,-2 14,12 Z"/><path class="hl ${c}" d="M-7,8 C-8,-2 -3,-8 0,-10 C3,-8 8,-2 7,8"/></g>`;
    let s = `<path class="sM" d="M110,280 L530,280"/>${cc("LOST & FOUND  B1", 320, 70, 7, "fW")}
      <path class="k sA" d="M240,280 L240,190 L400,190 L400,280 Z"/><path class="hl sA" d="M240,190 L222,170 M400,190 L418,170 M240,206 L400,206"/>
      ${segC("ROBES  (12)", 320, 226, 9, "sA", 1.2)}${segC("UNCLAIMED", 320, 248, 6, "sM", .9)}`;
    [[268, 182, -20, "sM"], [300, 176, 8, "sD"], [334, 180, -6, "sM"], [366, 178, 18, "sD"], [318, 160, -30, "sM"]].slice(0, i).forEach(([x, y, r, c]) => s += hood(x, y, r, c));
    if (i >= 5) s += `${segC(line, 320, 30, 8, "sW", 1.1)}${cc(chipTxt, 320, 300, 6, "fM")}`;
    return s;
  } });

export async function aftermath(api, which) {
  if (which === "accepted") return montage(api, [
    paper("SECRET SOCIETY RAN THE", "FIELD FOR FIFTY YEARS", "THE NEUROSCIENTIFIC ROUND TABLE · DISSOLVED"),
    mugshot("QUORUM", "AGE 39", "ARRESTED · CHARGE SHEET AMENDED"),
    lostFound("NOBODY CAME BACK FOR THE ROBES.", "THE FRIDAY DINNER IS CANCELLED"),
    counter("PRESTON VALU", "PAPERS RETRACTED", 31, "THE NOTICES ARE THE FIRST THING HE'S WRITTEN HIMSELF IN YEARS"),
    envelopes("FIFTY YEARS OF REVIEWER 2", "UNSEALED"),
    stamp("J. NEUROSCI. NULLS", "NULL RESULTS", "FOR GUS IAN. METHODS: FINE."),
    frog("NELL PASSED. SHE GOT THE JOB."),
    retire("IRIS WATCHED IT ON THE NEWS.", "PROF. IRIS CANDOR · RETIRED"),
  ]);
  if (which === "major") return montage(api, [
    paper("PROFESSOR PULLED FROM", "BORE OF 3T SCANNER", "THE TABLE IS STOPPED · THE ARCHIVE IS GONE"),
    mugshot("QUORUM", "AGE 39", "IN CUSTODY · NO PROOF, NOT YET"),
    lostFound("NOBODY CAME BACK FOR THE ROBES.", "THE FRIDAY DINNER IS CANCELLED"),
    stamp("J. NEUROSCI. NULLS", "NULL RESULTS", "RESUBMIT WITH THE ROLLS", "MAJOR REVISIONS"),
    gusDesk(),
  ]);
}

/* ---------------- THE CREDITS: they roll, in steps ---------------- */
const CAST = [
  ["nell", "NELL NULL", "THE NULL HYPOTHESIS"], ["preston", "PRESTON VALU", "THE P-VALUE"], ["gus", "GUS IAN", "THE GAUSSIAN"],
  ["morris", "MORRIS", "THE WATER MAZE"], ["iris", "PROF. IRIS CANDOR", "THE OLD WOMAN"], ["tess", "DR. TESS LA", "THE TESLA"],
  ["penny", "PENNY LEDGER", "THE BOOKS"], ["ethel", "ETHEL BORD", "THE ETHICS BOARD"], ["cody", "CODY CREDIT", "COURSE CREDIT"],
  ["small", "DET. SGT. SMALL", "THE SMALL EFFECT"], ["impact", "PROF. IMPACT", "THE IMPACT FACTOR"], ["adline", "PROF. ADLINE", "THE DEADLINE"],
  ["rex", "DR. REX JECTED", "REJECTED"], ["dana", "DANA OUTLIER", "THE OUTLIER"], ["quorum", "PROF. QUORUM", "THE CORRESPONDING AUTHOR"],
];
export async function credits(api, { score = 0 } = {}) {
  let y = 380, s = "";
  const line = (t, h, cls, gap = 10, sw) => { s += segC(t, 320, y, h, cls, sw || Math.max(.8, h / 9)); y += h * 1.6 + gap; };
  const pair = (role, who) => { s += seg(role, 320 - 14 - segW(role, 6), y, 6, "sM", .9) + seg(who, 334, y, 6, "sW", .9); y += 18; };
  line("GAIN CONTROL", 30, "sW", 14, 2);
  line("A GAME BY SAM LING", 8, "sA", 46);
  line("CAST", 10, "sG", 16);
  for (const [k, name, role] of CAST) {
    const P = PORTRAIT[k], G = { act: 5, flags: {} };
    if (P) s += `<svg x="226" y="${y - 6}" width="40" height="46" viewBox="${P.vb}" preserveAspectRatio="xMidYMid meet">${P.svg(G)}</svg>`;
    s += chip(name, 276, y + 4, 6, P ? P.chip : "fW") + seg("AS " + role, 278, y + 20, 4.6, "sM", .8);
    y += 56;
  }
  y += 10;
  pair("REVIEWER 2", "HIMSELF"); pair("THE ROUND TABLE", "TWELVE HOODS AND A GAVEL"); pair("ALPHA", "A DART FROG"); y += 30;
  line("SCORE, SOUND AND PICTURES", 6, "sG", 8);
  line("DRAWN AND SYNTHESIZED LIVE IN YOUR BROWSER", 6, "sW", 16);
  line("THE ORGAN", 6, "sG", 8);
  line("MATT CRUMP'S TONEWHEEL, FROM SYNTHLAND (CRUMPLAB)", 6, "sW", 4);
  line("PARED DOWN FOR MEGAJAM, AND PLAYED HERE", 4.6, "sM", 30);
  line("THE REAL RECORD", 6, "sG", 8);
  line("C. G. GROSS, AMERICAN PSYCHOLOGIST, 1977", 6, "sW", 30);
  // the real papers: what FOG NEURO's mill was fed (paraphrased, unnamed, in the game) and what the booth's console replicates
  const plain = (t) => t.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Ø/g, "O").replace(/Β/g, "B").replace(/[–—]/g, "-").replace(/[‘’`´]/g, "'").replace(/[“”"]/g, "'");
  const refs = (title, sub, list) => {
    if (!list.length) return;
    line(title, 6, "sG", 4); line(sub, 4.4, "sM", 12);
    for (const r of list.map(plain)) {
      const parts = []; let cur = "";
      for (const w of r.split(" ")) { if ((cur + " " + w).length > 200 && cur) { parts.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; }
      parts.push(cur);
      parts.forEach((t, i) => line(t, 4, "sW", i === parts.length - 1 ? 5 : 2, .7));
    }
    y += 24;
  };
  refs("THE CLASSICS IN THE MILL", "FOG NEURO RESYNTHESIZES THE IDEAS OF THESE PAPERS. IN THE GAME THEY ARE PARAPHRASED AND UNNAMED.", CLASSICS_REFS_SORTED);
  refs("THE PERCEPTION CONSOLE", "EVERY DEMO AND EXPERIMENT IN BOOTH 114, AND THE PAPERS THEY REPLICATE.", CONSOLE.CONSOLE_REFS ? CONSOLE.CONSOLE_REFS() : []);
  // after all those names: who was probably at dinner
  line("ODDS ARE A HEALTHY CHUNK OF THE AUTHORS ABOVE", 6, "sA", 4);
  line("SAT AT THE PSYCHOLOGICAL ROUND TABLE, OR AT GUV.", 6, "sA", 8);
  line("THE REAL ONES. AS FAR AS ANYONE KNOWS, THEY MOSTLY HAD DINNER.", 4.6, "sM", 30);
  line("WITH APOLOGIES TO EVERY SIERRA DEATH SCENE", 6, "sM", 6);
  line("AND EVERY REVIEWER 2 WHO EVER LIVED", 6, "sM", 34);
  line("NO RATS WERE HARMED IN THE MAKING OF THIS GAME.", 6, "sW", 6);
  line("MORRIS WAS HARMED A LITTLE. HE ASKED FOR IT.", 6, "sW", 34);
  line("IN MEMORY OF GUS IAN, WHOSE GLM WAS FINE.", 7, "sB", 40);
  line(`H-INDEX ${String(score).padStart(2, "0")}  ·  BODIES 05`, 8, "sA", 30);
  line("THE MAGNET IS ALWAYS ON.", 10, "sW", 26);
  line("THANKS FOR PLAYING.", 7, "sG", 0);
  // the credits roll up and off the top; the megaZINE masthead comes up after the last line, as part of the same roll,
  // and stops in the middle while everything above it rolls away. A click during the roll skips to the end of it.
  const H = y + 40, MZ = H + 90;                  // the masthead's centre: about 40 units below the last line, so it parks while the last lines are still rolling off above it
  if (window.MUSIC) window.MUSIC.endTheme();   // the end theme: the sparse opening, then propelled into the finale
  const id = "roll" + Math.floor(Math.random() * 1e6), STEP = 3, MS = 74;   // 3 px every 74 ms: about 40 px a second
  const stepsC = Math.ceil(H / STEP), stepsM = Math.ceil((MZ - 180) / STEP), steps = Math.max(stepsC, stepsM);
  api.bigCard(`<g id="${id}">${s}</g>`, { auto: 0, hold: 1e9, mark: false });   // stays up: the page reloads after
  const mz = megazineRoll(document.getElementById("card").parentElement, "CLICK TO RETURN TO THE TITLE");
  let i = 0, skip = false;
  const place = () => { const g = document.getElementById(id); if (g) g.setAttribute("transform", `translate(0 ${-Math.min(i, stepsC) * STEP})`); mz.at(Math.max(180, MZ - i * STEP)); };
  place();
  mz.onSkip(() => { skip = true; });
  while (i < steps && !skip) { await api.wait(MS); i++; place(); }
  i = steps; place();
  await mz.done();
}
