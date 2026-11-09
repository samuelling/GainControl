// THE METAMER (Act IV, the library), on the library's microfiche terminal: NOW (his paper, blue ribbons) against THEN
// (the back issues, amber index cards), under a banner that says what a metamer is and lights one box per sentence.
// THE METAMER (Act IV, the library). Four sentences of the Big Finding against six back issues (two decoys). Each sentence is an older
// paper's claim in newer words: match by meaning, not by text. When all six are matched, the source labs light up (the
// same three feeder labs). Then CHECK THE REFERENCES: two of the eight citations aren't on any shelf.
// Every wrong pair says what each side claims. Each sentence and each card carries a small figure of its gist (NOW crisp, THEN hand-drawn): a sentence and its
// original draw the same shape. Hint ladder per sentence: 2 misses, Nell points at the idea to look for;
// 4, Morris lights the card. References: 2 wrong, how to check; 4, the two fakes are marked in brass.
// Everything here is fictional: papers, people, journals, labs. Resolves { done, wrong }.
import { seg } from "../gfx.js";
import { exitLabel, exitKey } from "./exit.js";

// the Big Finding: Valu et al., Nurture Neuroscience (four sentences, each lifted from one back issue)
export const SENTS = [
  "Attention is known to reach V1, the cortex's first stop for vision, yet how deep into its layers it arrives has never been resolved.",
  "Feedback from higher brain areas arrives in the top layer and the deep layers, not in layer 4, where the eyes' input comes in.",
  "Responses were highest at both ends and lowest in the middle: this U-shaped profile is the signature of top-down gain control.",
  "These findings overturn decades of bottom-up thinking and call for sustained investment in layer research.",
];
// the shelf: s = the Big Finding sentence it was lifted into (−1: a decoy). lab: a feeder lab key, or null.
// fig: the old figure on the card (see FIG_OLD); every sentence has a new one (FIG_NEW). Same gist, different century.
export const LABS = { hindex: ["THE HINDEX LAB", "A"], sinecure: ["SINECURE GROUP", "V"], quorum: ["QUORUM LAB", "R"] };
export const SRC = [
  { s: 1, yr: "1988", au: "SINECURE, A.", lab: "sinecure", j: "CORTEX & CONTEXT 7, 201-219", fig: "fibres",
    q: "Fibres returning from the higher areas end in the outermost lamina and in the lowest ones, and pass the middle by." },
  { s: -1, yr: "1993", au: "FAIRWEATHER, J.", lab: null, labName: "FAIRWEATHER LAB", j: "VIS. NEUROPHYS. 24, 12-30", fig: "hump",
    q: "Attention lifted the middle lamina most, where the input arrives, and the outer laminae least.",
    no: "Fairweather has attention peaking in the middle, the input layer. Look at the figure: a hump, not a U. Opposite claim." },
  { s: 2, yr: "1996", au: "HINDEX, M. & SINECURE, A.", lab: "hindex", j: "TRENDS IN TRENDS 1, 1-4", fig: "peaks",
    q: "Two peaks of modulation flanking a quiet middle: the fingerprint of an instruction from above." },
  { s: 0, yr: "1979", au: "QUORUM, R.", lab: "quorum", j: "ANN. REV. ATTN. 3, 1-19", fig: "query",
    q: "That the will to select reaches the striate cortex is granted. At what depth of that sheet it alights, no one has yet said." },
  { s: -1, yr: "2004", au: "DRAINER, L.", lab: null, labName: "THE DRAINER LAB", j: "J. COMP. CORTEX 33, 140-152", fig: "veins",
    q: "Large veins on the surface carry the blood signal upward, so any depth profile measured from blood flow leans toward the surface.",
    no: "Drainer's about veins smearing the signal toward the surface. See the slope? That's the warning label, not the claim." },
  { s: 3, yr: "1987", au: "LAUD, T. & SINECURE, A.", lab: "sinecure", j: "GRANT OFFICE Q. 9, 5", fig: "support",
    q: "Our results unseat the received, bottom-up view of the cortex, and require, at a minimum, a further decade of support." },
];
// the reference list. src: the shelf card it points to, or null (it doesn't exist).
export const REFS = [
  { t: "QUORUM, R. (1979A). THE STRIATE QUESTION. ANN. REV. ATTN. 3, 1-19.", src: 3 },
  { t: "SINECURE, A. (1988). WHERE THE FEEDBACK ENDS. CORTEX & CONTEXT 7, 201-219.", src: 0 },
  { t: "QUORUM, R. (1979B). ON THE DESCENDING INSTRUCTION. ANN. REV. ATTN. 3, 20-31.", src: null, id: "1979b" },
  { t: "HINDEX, M. & SINECURE, A. (1996). TWIN PEAKS. TRENDS IN TRENDS 1, 1-4.", src: 2 },
  { t: "LAUD, T. & SINECURE, A. (1987). A FURTHER DECADE. GRANT OFFICE Q. 9, 5.", src: 5 },
  { t: "VALU, P. & MICK, P. (2025). LAMINAR GAIN WITHOUT END. J. ENDLESS RES. 1, 1-∞.", src: null, id: "endless" },
];

/* ---- the figures: the gist of each, drawn twice. NOW (2025): crisp, blue, filled data points, error bars, sans labels.
   THEN (the back issues): amber hairline, dashed curves, hatching under them, roman numerals, FIG. N. Same shape, different
   century: a sentence and its original draw the same picture, which is the point. ---- */
const F = (n) => +n.toFixed(1);
const hatch = (pts, base, c = "sA") => { let h = ""; for (let x = pts[0][0] + 2; x < pts[pts.length - 1][0]; x += 2.4) { let y = base;
    for (let k = 1; k < pts.length; k++) if (x <= pts[k][0]) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k]; y = y0 + (y1 - y0) * (x - x0) / (x1 - x0); break; }
    h += `M${F(x)},${base} L${F(x + 1.6)},${F(Math.max(y, base - (base - y)))} `; } return `<path class="hl ${c}" opacity=".55" d="${h}"/>`; };
const curve = (pts) => "M" + pts.map(([x, y]) => `${F(x)},${F(y)}`).join(" L");
const oldAxes = (cap) => `<path class="hl sA" d="M8,34 L60,34 M8,34 L8,4 M58,32 L60,34 L58,36 M6,6 L8,4 L10,6"/>${seg(cap, 40, 1, 3.2, "sA", .5)}`;
const newAxes = (xl, yl) => `<path class="hl sM" d="M8,34 L60,34 M8,34 L8,4"/>${[16, 24, 32, 40, 48, 56].map(x => `<path class="hl sM" d="M${x},34 L${x},35.6"/>`).join("")}
  ${seg(xl, 22, 36.4, 2.6, "sM", .45)}${yl ? `<g transform="translate(3.4,30) rotate(-90)">${seg(yl, 0, 0, 2.6, "sM", .45)}</g>` : ""}`;
const U = [[14, 8], [22, 20], [30, 27], [38, 26], [46, 18], [54, 9]], HUMP = [[14, 28], [22, 20], [30, 9], [38, 10], [46, 21], [54, 29]], SLOPE = [[14, 7], [22, 13], [30, 18], [38, 22], [46, 26], [54, 29]];
const dots = (pts, c = "fB") => pts.map(([x, y]) => `<path class="hl sB" d="M${x},${y - 3} L${x},${y + 3} M${x - 1},${y - 3} L${x + 1},${y - 3} M${x - 1},${y + 3} L${x + 1},${y + 3}"/><circle class="${c}" cx="${x}" cy="${y}" r="1.5"/>`).join("");
const layers = (cls, x0 = 10, x1 = 46) => [6, 11, 16, 21, 26, 31].map(y => `<path class="hl ${cls}" d="M${x0},${y} L${x1},${y}"/>`).join("");
const wavy = (y, x0 = 10, x1 = 46) => { let d = `M${x0},${y}`; for (let x = x0; x < x1; x += 6) d += ` Q${x + 1.5},${y - 1.2} ${x + 3},${y} Q${x + 4.5},${y + 1.2} ${x + 6},${y}`; return `<path class="hl sA" d="${d}"/>`; };
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
export const FIG_NEW = [
  // where does attention land? a column of six layers, attention coming down, a question mark at depth
  () => `${layers("sM")}${[1, 6].map((n, k) => seg(String(n), 3.5, k ? 29 : 4, 3, "sM", .5)).join("")}
    <path class="sG" d="M28,0 L28,8 M25.5,5.5 L28,8.5 L30.5,5.5"/>${seg("ATTN", 31, 0, 3, "sG", .5)}${seg("?", 50, 9, 18, "sG", 1.2)}<path class="hl sG" stroke-dasharray="1.5 1.5" d="M28,10 L28,30"/>`,
  // feedback from above ends in layer 1 and layers 5–6; the input comes up from below into layer 4
  () => `${layers("sM")}<rect class="hl sV" x="48" y="0" width="13" height="7"/>${seg("V2", 51.5, 1.6, 3.4, "sV", .5)}
    <path class="sV" d="M50,7 C44,10 36,6 30,6"/><circle class="fV" cx="30" cy="6" r="1.6"/><path class="sV" d="M54,7 C56,22 44,28 34,28"/><circle class="fV" cx="34" cy="28" r="1.6"/>
    <path class="hl sB" d="M20,40 L20,19"/><circle class="fB" cx="20" cy="18.5" r="1.4"/>${seg("4", 3.5, 16.5, 3, "sM", .5)}${seg("IN", 22, 34, 3, "sB", .5)}`,
  // the U: effect of attention by depth, highest at the surface and the deep end
  () => `${newAxes("SURFACE → DEEP", "ATTN")}<path class="sB" d="${curve(U)}"/>${dots(U)}`,
  // overturn, then fund: a bar chart of money, the last bar off the top
  () => `${newAxes("YEAR →", "$")}${[[14, 28], [24, 22], [34, 15], [44, 8]].map(([x, y]) => `<rect class="hl sB" x="${x}" y="${y}" width="7" height="${34 - y}"/>`).join("")}
    <path class="sG" d="M54,34 L54,2 M51.5,4.5 L54,1.5 L56.5,4.5"/>${seg("MORE", 46, 26, 3, "sG", .5)}`,
];
export const FIG_OLD = {
  // the striate cortex in section, laminae I–VI wavy, a hand-lettered query
  query: () => `${[6, 11, 16, 21, 26, 31].map(y => wavy(y)).join("")}${[0, 5].map(k => seg(ROMAN[k], 1, [3.5, 28.5][k / 5], 3, "sA", .5)).join("")}
    ${seg("?", 50, 8, 16, "sA", .9)}${seg("FIG. 1", 47, 34, 3.2, "sA", .5)}`,
  // camera lucida: fibres coming down from above, branching in lamina I and V–VI, passing IV by
  fibres: () => `${[6, 16, 21, 31].map(y => wavy(y)).join("")}${seg("I", 1, 3.5, 3, "sA", .5)}${seg("IV", 0, 18.5, 3, "sA", .5)}${seg("VI", 0, 28.5, 3, "sA", .5)}
    ${[18, 28, 38].map(x => `<path class="hl sA" d="M${x},0 C${x + 2},10 ${x - 2},20 ${x + 1},31 M${x},6 L${x - 4},8 M${x},6 L${x + 4},9 M${x + 1},28 L${x - 4},31 M${x + 1},28 L${x + 4},32"/>`).join("")}
    ${seg("FIG. 4", 47, 33, 3.2, "sA", .5)}`,
  // two peaks flanking a quiet middle, dashed, hatched beneath
  peaks: () => `${oldAxes("FIG. 2")}<path class="hl sA" stroke-dasharray="2 1.4" d="${curve(U)}"/>${hatch(U, 34)}${seg("A", 12, 2, 3, "sA", .5)}${seg("B", 53, 2, 3, "sA", .5)}`,
  // the decoy: one hump, in the middle
  hump: () => `${oldAxes("FIG. 3")}<path class="hl sA" stroke-dasharray="2 1.4" d="${curve(HUMP)}"/>${hatch(HUMP, 34)}`,
  // the decoy: the veins, and a profile that leans to the surface
  veins: () => `${oldAxes("FIG. 5")}<path class="hl sA" stroke-dasharray="2 1.4" d="${curve(SLOPE)}"/>${hatch(SLOPE, 34)}
    <path class="hl sR" d="M12,3 C16,5 18,1 22,3 C26,5 28,1 32,3"/>${seg("VEINS", 34, 1, 3, "sR", .5)}`,
  // a further decade of support: a line that leaves the top of the page
  support: () => `${oldAxes("FIG. 9")}<path class="hl sA" stroke-dasharray="2 1.4" d="M10,30 L20,27 L30,22 L40,14 L50,6 L56,0"/>${seg("SUPPORT", 12, 6, 3, "sA", .5)}${seg("$", 44, 22, 7, "sA", .7)}`,
};
const LINES = {
  // a metamer, in colour vision: two lights that look identical but are mixed from different wavelengths
  intro: ["NELL", "A metamer: two colours that look identical but are mixed from different lights. His paper's one. Every sentence is an older paper's claim in new words."],
  key: ["NELL", "Old papers talk funny. Striate cortex means V1. A lamina is a layer. The geniculate is the thalamus. Click one of his sentences to start."],
  how: ["NELL", "Now the back issue that makes the same claim in older words. Same meaning, not same words."],
  howC: ["NELL", "Now the sentence of his that says the same thing."],
  ok: [["MORRIS", "Same claim, fancier hat."], ["NELL", "Lifted. Re-spelled, re-dated, same idea."], ["MORRIS", "Old words, new suit, pal."],
    ["NELL", "That's the source. He didn't even change the order of the argument."], ["MORRIS", "That one's been through the wash a few times."]],
  near: ["NELL", "Same shelf, different claim. Read it again."],
  // a wrong pair, said plainly: what the card claims, and what the sentence claims
  mismatch: (c, s) => ["NELL", `That card is about ${GIST[SRC[c].s]}. Sentence ${s + 1} is about ${GIST[s]}. Different claims.`],
  // the ladder: two misses on a sentence, a pointer; four, the card itself
  hint: [
    ["NELL", "Sentence 1: attention gets to V1, but nobody knows at what depth. His figure's a question mark at depth. Find the old one asking the same thing."],
    ["NELL", "Sentence 2: feedback ends in the top layer and the deep ones, and skips the middle. Look for fibres from above branching in lamina I and in V and VI."],
    ["NELL", "Sentence 3: a U, high at both ends, a quiet middle, called a signature. Find the old figure that makes a U. Not the hump: that's the opposite."],
    ["NELL", "Sentence 4: overturn the old view, then ask for money. His figure's a bar chart of funding. Find the old graph of 'support' going off the top of the page."],
  ],
  show: (c) => ["MORRIS", `This one, pal. ${SRC[c].au} ${SRC[c].yr}. It's lit up. Click it.`],
  refHint: ["NELL", "Click a reference to look for it. Authors, year, journal, pages: if it's real, its card is up here. Two have nothing behind them."],
  refs2: ["MORRIS", "So a reference is an IOU, pal. 'This paper exists, go look.' Go look."],
  labs: ["NELL", "Four sentences, four back issues, three labs. The Hindex Lab, the Sinecure Group, the Quorum Lab. Every single one."],
  labs2: ["MORRIS", "The feeder labs. Same names on every Rising Stars wall, pal."],
  refs: ["NELL", "His reference list: the six papers he says he built on. A real paper is a real thing on a real shelf. Click each one and look for it."],
  real: (c) => ["NELL", `${SRC[c].au} ${SRC[c].yr}, ${SRC[c].j.replace(/ (\d+), /, " volume $1, pages ")}. There it is, on the shelf. That one's real.`],
  again: (c) => ["NELL", `Already checked: ${SRC[c].au} ${SRC[c].yr}. Real. Keep going.`],
  "1979b": ["NELL", "Quorum, 1979b. There's only one Quorum paper from 1979 on this shelf. There is no b. Pages 20 to 31 are somebody's obituary."],
  endless: ["NELL", "Journal of Endless Research. Volume one, pages one to infinity. That's not a journal, that's a mission statement."],
  done: ["NELL", "It's a collage of the Table's own work. And its real author list is a partial membership roll."],
  done2: ["MORRIS", "So the paper's a family reunion. Who brought the potato salad?"],
};
const GIST = ["an open question: where in the cortex attention arrives", "where feedback ends: the top and deep layers, not the middle",
  "a U-shaped 'signature' of top-down gain", "overturning the old view, and asking for more money"];
const COL = { NELL: "G", MORRIS: "K", GUS: "B", PENNY: "B", NARRATOR: "W" };
const CSS = `
.metamer .mbody { flex: 1 1 0; min-height: 0; display: grid; grid-template-columns: 33% 1fr; gap: 1.4cqw; padding: .7cqw 0; }
.metamer .col { display: flex; flex-direction: column; gap: .45cqw; min-height: 0; }
.metamer .colhd { font-size: 1cqw; letter-spacing: .1em; color: var(--M); flex: none; }
.metamer .sent { flex: 1 1 0; display: flex; gap: .6cqw; align-items: flex-start; font-size: 1.36cqw; line-height: 1.13; padding: .3cqw .5cqw;
  border: .08cqw solid var(--D); cursor: pointer; color: var(--W); overflow: hidden; }
.metamer .sent:hover, .metamer .card:hover, .metamer .ref:hover { border-color: var(--W); }
.metamer .sent.sel, .metamer .card.sel { border-color: var(--A); color: var(--A); }
.metamer .sent.ok, .metamer .card.ok { border-color: var(--G); color: var(--G); cursor: default; }
.metamer .num { flex: none; display: inline-block; min-width: 1.5cqw; text-align: center; font-size: 1.05cqw; font-weight: 600; color: #000; background: var(--D); }
.metamer .ok .num { background: var(--G); }
.metamer .pool { flex: 1 1 0; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: .45cqw; }
.metamer .card { border: .08cqw solid var(--D); padding: .25cqw .5cqw; cursor: pointer; overflow: hidden; color: var(--W); min-height: 0; display: flex; flex-direction: column; }
.metamer .card .meta { display: flex; align-items: center; gap: .5cqw; font-size: .98cqw; line-height: 1.2; white-space: nowrap; }
.metamer .card svg.yr { position: relative; inset: auto; width: 3.2cqw; height: 1.15cqw; flex: none; }
.metamer .card .au { color: var(--B); overflow: hidden; text-overflow: ellipsis; }
.metamer .card .lab { margin-left: auto; color: var(--M); font-size: .9cqw; padding: 0 .3cqw; letter-spacing: .05em; }
.metamer .card .lab.lit { color: #000; font-weight: 600; }
.metamer .card .q { flex: 1 1 auto; font-size: .96cqw; line-height: 1.06; margin-top: .1cqw; }
.metamer .card .j { flex: none; font-size: .8cqw; line-height: 1.1; color: var(--M); letter-spacing: .05em; }
.metamer .card.ok .q { color: var(--G); }
.metamer .card.dim { opacity: .35; }
.metamer .card.flash { border-color: var(--G); outline: .12cqw solid var(--G); }
.metamer.stage2 .card { cursor: default; }
.metamer .ref { flex: 1 1 0; display: flex; gap: .6cqw; align-items: center; font-size: 1.22cqw; line-height: 1.12; padding: .2cqw .5cqw;
  border: .08cqw solid var(--D); cursor: pointer; color: var(--W); }
.metamer .ref.fake { border-color: var(--R); color: var(--R); cursor: default; }
.metamer .ref.fake .num { background: var(--R); }
.metamer .ref .flag { margin-left: auto; flex: none; font-size: .95cqw; font-weight: 600; color: #000; background: var(--R); padding: 0 .3cqw; }
/* the library's terminal: a line-art monitor round the screen (the bezel is an SVG behind it), faint scanlines on the glass */
#panel .mmbezel { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
#panel .screen.metamer { left: 4.2%; right: 4.2%; top: 3.9%; bottom: 12.2%; border: 0; border-radius: .6cqw; padding: 0 1.2cqw; }
.metamer .sent { font-size: 1.24cqw !important; line-height: 1.1 !important; }
#panel .metamer .coachline { min-height: 3.4cqw; }
.metamer .ref { border-left: .45cqw solid var(--B) !important; } .metamer .ref .num { background: var(--B); } .metamer .ref.fake { border-left-color: var(--R) !important; } .metamer .ref.fake .num { background: var(--R); }
.metamer .sent { align-items: center !important; } .metamer .sent .stx { flex: 1 1 auto; }
.metamer svg.mfig { position: relative; inset: auto; flex: none; width: 8cqw; height: 5cqw; }
.metamer .card .cb { flex: 1 1 auto; display: flex; gap: .6cqw; align-items: flex-start; min-height: 0; }
.metamer .card svg.mfig.old { width: 8.4cqw; height: 5.25cqw; margin-top: .2cqw; }
.metamer .card .cb .q { flex: 1 1 0; }
.metamer .pool { grid-template-rows: repeat(3, 1fr); }
.metamer .ref.real { border-color: var(--G); color: var(--G); } .metamer .ref.real .num { background: var(--G); }
.metamer .ref .flag.okf { background: var(--G); }
.metamer .card .refn { flex: none; color: #000; background: var(--G); font-weight: 600; font-size: .9cqw; padding: 0 .3cqw; }
#panel .mmscan { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: .32; }
.metamer svg.hd { height: 4.6cqw !important; margin-top: .4cqw !important; }
/* two bins: NOW (Preston's paper, cool, a solid ribbon down each sentence) and THEN (the back issues: amber index cards) */
.metamer .bin { display: inline-block; color: #000; font-weight: 700; padding: 0 .45cqw; margin-right: .5cqw; letter-spacing: .08em; }
.metamer .bin.now { background: var(--B); } .metamer .bin.then { background: var(--A); }
.metamer .colhd.now { color: var(--B); } .metamer .colhd.then { color: var(--A); }
.metamer .sent { border-left: .45cqw solid var(--B) !important; }
.metamer .sent .num { background: var(--B); }
.metamer .sent .orig { display: inline-block; margin-left: .4cqw; color: #000; background: var(--A); font-size: .9cqw; font-weight: 600; padding: 0 .3cqw; white-space: nowrap; vertical-align: .1cqw; }
.metamer .card { border-style: dashed !important; border-color: var(--A) !important; position: relative; padding-left: 1.3cqw !important; }
.metamer .card::before { content: ""; position: absolute; left: .35cqw; top: .45cqw; width: .55cqw; height: .55cqw; border: .08cqw solid var(--A); border-radius: 50%; }
.metamer .card .q, .metamer .card .au { color: var(--A); }
.metamer .card .j { color: var(--A); opacity: .7; }
.metamer .sent.sel, .metamer .card.sel { border-color: var(--W) !important; color: var(--W); outline: .14cqw solid var(--W); }
.metamer .card.sel .q { color: var(--W); }
.metamer .card.ok, .metamer .sent.ok { border-color: var(--G) !important; border-style: solid !important; }
.metamer .card.ok .q, .metamer .card.ok .au { color: var(--G); } .metamer .card.ok::before { border-color: var(--G); }
.metamer .card.dim { opacity: .3; }
`;
// the monitor: bezel, a brand plate, a lit power LED, two knobs, a neck and a foot (viewBox = the whole frame)
const BEZEL = `<svg class="t mmbezel" viewBox="0 0 640 360" preserveAspectRatio="none">
  <rect class="k sW" x="14" y="5" width="612" height="329" rx="10"/>
  <rect class="sM" x="27" y="14" width="586" height="302" rx="5"/>
  <path class="hl sD" d="M20,11 L33,20 M620,11 L607,20 M20,328 L33,310 M620,328 L607,310"/>
  ${seg("FECHNER LIBRARY · MICROFICHE TERMINAL · 2F", 248, 321, 4.2, "sM", .7)}
  <circle class="hl sM" cx="44" cy="324" r="3.6"/><path class="hl sM" d="M44,324 L46,321"/><circle class="hl sM" cx="58" cy="324" r="3.6"/><path class="hl sM" d="M58,324 L55,321"/>
  <circle class="fG" cx="598" cy="324" r="2.2"/>${seg("PWR", 578, 321.5, 3.4, "sM", .6)}
  <path class="sW" d="M300,334 L296,349 M340,334 L344,349"/><path class="k sW" d="M250,355 C250,347 390,347 390,355 Z"/>
</svg>`;
// faint scanlines on the glass (a hairline every three units)
const SCAN = `<svg class="t mmscan" viewBox="0 0 586 302" preserveAspectRatio="none">${[...Array(100)].map((_, i) => `<path class="hl sD" d="M0,${i * 3 + 1} L586,${i * 3 + 1}"/>`).join("")}</svg>`;
function injectStyle(id, css) { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); }

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function metamer(el, { score = () => {} } = {}) {
  injectStyle("mg-metamer", CSS);
  return new Promise(resolve => {
    const S = { checked: {}, stage: 1, sel: null, matched: SENTS.map(() => null), wrong: 0, say: LINES.intro, flagged: {}, done: false, okN: 0, flash: -1,
      miss: SENTS.map(() => 0), show: SENTS.map(() => false), refMiss: 0 };
    const timers = [];
    const later = (ms, fn) => timers.push(setTimeout(() => { fn(); draw(); }, ms));
    const cardOf = (s) => S.matched[s];                    // shelf index matched to sentence s
    const sentOf = (c) => S.matched.indexOf(c);
    const allMatched = () => S.matched.every(v => v !== null);
    let spoken = null;
    const coach = () => { const [w, t] = S.say; if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(w, true); } return `<span class="who" style="background:var(--${COL[w]})">${w}</span><span style="color:var(--${COL[w]})">${t}</span>`; };
    function card(c) {
      const x = SRC[c], s = sentOf(c), lit = S.stage === 2 || allMatched();
      const shown = S.stage === 1 && x.s >= 0 && s < 0 && S.show[x.s];   // the ladder's last rung: the card lights up
      const cls = ["card", s >= 0 ? "ok" : "", S.sel && S.sel.side === "c" && S.sel.i === c ? "sel" : "", lit && x.s < 0 ? "dim" : "", S.flash === c || shown ? "flash" : ""].join(" ");
      const lab = x.lab ? LABS[x.lab] : [x.labName, "M"];
      const labHtml = lit && x.lab ? `<span class="lab lit" style="background:var(--${lab[1]})">${lab[0]}</span>` : `<span class="lab">${lab[0]}</span>`;
      const refN = S.stage === 2 ? REFS.findIndex((r, i) => r.src === c && S.checked[i]) : -1;
      return `<div class="${cls}" data-c="${c}"><div class="meta">${refN >= 0 ? `<span class="refn">REF ${refN + 1} ✓</span>` : s >= 0 ? `<span class="num">${s + 1}</span>` : ""}
        <svg class="t yr" viewBox="0 0 28 10">${seg(x.yr, 1, 2, 6.4, s >= 0 ? "sG" : "sA", 1)}</svg><span class="au">${x.au}</span>${labHtml}</div>
        <div class="cb"><svg class="t mfig old" viewBox="0 0 64 40">${FIG_OLD[x.fig]()}</svg><div class="q">${x.q}</div></div><div class="j">${x.j}</div></div>`;
    }
    function left() {
      if (S.stage === 1) return `<div class="colhd now"><span class="bin now">NOW</span>PRESTON'S PAPER  ·  VALU ET AL. 2025</div>` + SENTS.map((t, i) => {
        const ok = cardOf(i) !== null, sel = S.sel && S.sel.side === "s" && S.sel.i === i, src = ok ? SRC[cardOf(i)] : null;
        return `<div class="sent ${ok ? "ok" : ""} ${sel ? "sel" : ""}" data-s="${i}"><span class="num">${i + 1}</span><span class="stx">${t}${src ? `<span class="orig">= ${src.au.replace(/, [A-Z]\./g, "").replace(/\.$/, "")} ${src.yr}</span>` : ""}</span><svg class="t mfig" viewBox="0 0 64 40">${FIG_NEW[i]()}</svg></div>`;
      }).join("");
      return `<div class="colhd now"><span class="bin now">NOW</span>HIS REFERENCES  ·  CLICK ONE TO CHECK IT</div>` + REFS.map((r, i) =>
        `<div class="ref ${S.flagged[i] ? "fake" : ""} ${S.checked[i] ? "real" : ""}" data-r="${i}"><span class="num">${i + 1}</span><span>${r.t}</span>${S.flagged[i] ? `<span class="flag">NOT ON ANY SHELF</span>` : S.checked[i] ? `<span class="flag okf">✓ ON THE SHELF</span>` : ""}</div>`).join("");
    }
    function draw() {
      const nFake = Object.keys(S.flagged).length;
      const status = S.stage === 1 ? `${S.matched.filter(v => v !== null).length} / ${SENTS.length} MATCHED` : `${Object.keys(S.checked).length} REAL  ·  ${nFake} / 2 GHOSTS`;
      const hd = S.stage === 1 ? goal() : goalRefs(nFake);
      el.innerHTML = `${BEZEL}<div class="screen metamer ${S.stage === 2 ? "stage2" : ""}">${SCAN}
        <svg class="t hd" viewBox="0 0 640 46">${hd}</svg>
        <div class="mbody"><div class="col">${left()}</div>
          <div class="col"><div class="colhd then"><span class="bin then">THEN</span>THE BACK ISSUES  ·  1979–2004  ·  ON THE SHELF</div><div class="pool">${SRC.map((_, c) => card(c)).join("")}</div></div></div>
        <div class="coachline">${coach()}</div>
        <div class="bar"><span class="status">${status}</span>
          ${S.stage === 1 && allMatched() ? `<button data-b="refs">CHECK THE REFERENCES</button>` : ""}
          <button data-b="off" class="off">${exitLabel(S.done)}</button></div></div>`;
    }
    // the goal, drawn: a metamer is two colours that match but are mixed from different light; his sentences are the
    // same trick done with words. Six lights to put on, one per sentence unmasked.
    function goal() {
      const n = S.matched.filter(v => v !== null).length;
      const spec = (x, peaks) => `<path class="hl sM" d="M${x},38 L${x + 26},38"/><path class="hl sW" d="M${x},38 ${peaks.map(([c, h]) => `C${x + c - 4},38 ${x + c - 2},${38 - h} ${x + c},${38 - h} C${x + c + 2},${38 - h} ${x + c + 4},38 ${x + c + 6},38`).join(" ")}"/>`;
      let g = seg("SPOT THE METAMER", 2, 6, 15, "sW", 1.5);
      // two identical swatches, two different spectra
      g += `<rect class="fV" x="186" y="4" width="20" height="14"/><rect class="fV" x="212" y="4" width="20" height="14"/>${spec(183, [[10, 12]])}${spec(209, [[4, 8], [16, 9]])}
        ${seg("SAME COLOUR, DIFFERENT LIGHT.", 242, 6, 6, "sV", .9)}${seg("SAME CLAIM, DIFFERENT WORDS.", 242, 18, 6, "sW", .9)}${seg("(WORDS ARE CHEAPER THAN LIGHT.)", 242, 30, 5, "sM", .8)}`;
      g += seg("OLD PAPER, NEW SUIT. UNMASK ALL FOUR:", 410, 4, 6, "sA", .9);
      for (let i = 0; i < SENTS.length; i++) { const on = cardOf(i) !== null, x = 410 + i * 22;
        g += on ? `<rect class="fG" x="${x}" y="16" width="18" height="16"/>${seg(String(i + 1), x + 6, 19, 10, "s0", 1.3)}` : `<rect class="hl sD" x="${x}" y="16" width="18" height="16"/>${seg(String(i + 1), x + 6, 19, 10, "sD", 1)}`; }
      g += seg(n === SENTS.length ? "ALL FOUR. HE WROTE NONE OF IT." : `${n} OF ${SENTS.length}`, 502, 22, 6, n === SENTS.length ? "sG" : "sM", .9);
      return g;
    }
    function goalRefs(n) {
      let g = seg("CITATIONS FROM NOWHERE", 2, 6, 15, "sW", 1.5);
      // a reference points at a paper: on the shelf, it's real; nothing there, it's a ghost
      const ref = (x, y) => `<rect class="hl sB" x="${x}" y="${y}" width="16" height="10"/><path class="hl sB" d="M${x + 3},${y + 3.5} L${x + 13},${y + 3.5} M${x + 3},${y + 6.5} L${x + 10},${y + 6.5}"/>`;
      g += `${ref(214, 4)}<path class="hl sM" d="M232,9 L246,9 M243,6.5 L246,9 L243,11.5"/><rect class="hl sA" stroke-dasharray="2 1" x="249" y="3" width="16" height="12"/><path class="sG" d="M252,9 L255,12 L262,5"/>
        ${seg("ON THE SHELF: REAL.", 270, 5, 5.4, "sG", .9)}
        ${ref(214, 22)}<path class="hl sM" d="M232,27 L246,27 M243,24.5 L246,27 L243,29.5"/><rect class="hl sD" stroke-dasharray="1.5 1.5" x="249" y="21" width="16" height="12"/>${seg("?", 254, 23, 8, "sR", 1)}
        ${seg("NOTHING THERE: A GHOST.", 270, 23, 5.4, "sR", .9)}`;
      g += seg("CLICK EACH REFERENCE TO LOOK FOR IT.", 400, 4, 5.4, "sW", .9) + seg("FIND THE TWO GHOSTS:", 400, 15, 5.4, "sR", .9);
      for (let i = 0; i < 2; i++) { const on = i < n, x = 400 + i * 22;
        g += on ? `<rect class="fR" x="${x}" y="26" width="18" height="16"/>${seg("?", x + 6, 29, 10, "s0", 1.3)}` : `<rect class="hl sD" x="${x}" y="26" width="18" height="16"/>${seg("?", x + 6, 29, 10, "sD", 1)}`; }
      g += seg(n === 2 ? "TWO GHOSTS. CASE MADE." : `${n} OF 2`, 450, 31, 5.4, n === 2 ? "sR" : "sM", .9);
      return g;
    }
    function tryPair(s, c) {
      S.sel = null;
      if (SRC[c].s === s) {
        S.matched[s] = c; S.say = LINES.ok[S.okN++ % LINES.ok.length]; sfx("good");
        if (allMatched()) { S.say = LINES.labs; sfx("chime"); later(2800, () => { if (S.stage === 1) S.say = LINES.labs2; }); }
      } else {
        S.wrong++; sfx("bad");
        const x = SRC[c], n = ++S.miss[s];
        if (n >= 4) { S.show[s] = true; S.say = LINES.show(SRC.findIndex(y => y.s === s)); }
        else if (n >= 2) S.say = LINES.hint[s];
        else if (x.s < 0) { S.say = ["NELL", x.no]; if (x.nw) later(2400, () => { if (S.say[1] === x.no) S.say = [x.nw, x.nx]; }); }
        else S.say = LINES.mismatch(c, s);
      }
    }
    function pick(side, i) {
      if (S.stage !== 1 || S.done) return;
      if (side === "s" && cardOf(i) !== null) return;
      if (side === "c" && sentOf(i) >= 0) return;
      if (S.sel && S.sel.side !== side) { side === "s" ? tryPair(i, S.sel.i) : tryPair(S.sel.i, i); draw(); return; }
      S.sel = S.sel && S.sel.side === side && S.sel.i === i ? null : { side, i }; sfx(S.sel ? "select" : "cancel");
      if (S.sel) S.say = side === "s" ? LINES.how : LINES.howC;
      draw();
    }
    function flag(i) {
      if (S.stage !== 2 || S.done || S.flagged[i]) return;
      const r = REFS[i];
      if (r.src === null) {
        S.flagged[i] = true; S.say = LINES[r.id]; sfx("stamp");
        if (Object.keys(S.flagged).length === 2) {
          S.done = true; score("metamer", S.wrong ? 3 : 5);
          later(3200, () => { S.say = LINES.done; }); later(7000, () => { S.say = LINES.done2; });
        }
      } else {
        // a real one: found, its card lights up and wears the reference number. Checking costs nothing.
        S.flash = r.src; sfx(S.checked[i] ? "select" : "good"); S.say = S.checked[i] ? LINES.again(r.src) : LINES.real(r.src); S.checked[i] = true;
        later(1400, () => { S.flash = -1; });
      }
      draw();
    }
    const onClick = (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const b = t.closest("button[data-b]");
      if (b && !b.disabled) {
        if (b.dataset.b === "off") { finish(); return; }
        if (b.dataset.b === "refs") { S.stage = 2; sfx("paper"); S.sel = null; S.say = LINES.refs; later(6500, () => { if (S.say === LINES.refs) S.say = LINES.refs2; }); draw(); }
        return;
      }
      const s = t.closest("[data-s]"); if (s) { pick("s", +s.dataset.s); return; }
      const c = t.closest("[data-c]"); if (c) { pick("c", +c.dataset.c); return; }
      const r = t.closest("[data-r]"); if (r) flag(+r.dataset.r);
    };
    const onKey = (e) => { exitKey(e, S.done, finish); };
    function finish() {
      timers.forEach(clearTimeout); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = ""; resolve({ done: S.done, wrong: S.wrong });
    }
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
    later(5200, () => { if (S.say === LINES.intro) S.say = LINES.key; });
  });
}
