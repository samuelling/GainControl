// ACT III cast, part A: Prof. Quorum, the six senior faculty, Gus seated, Iris seated.
// Drawn in the same sheet coordinates as figures.js (feet at about (160,187), standing head ≈ y 28–82),
// so seated heads come out the same size as standing heads at the same depth.
import { seg, arcs } from "../gfx.js";
import { AUD } from "../figures.js";
import { PORTRAIT } from "../portraits.js";

// ---- shared bits (local copies of the figures.js helpers, which aren't exported) ----
const eyes = (p, a, b, r = 1.6) => p
  ? `<g class="eyes-open"><circle class="fW" cx="${a[0]}" cy="${a[1]}" r="${r}"/><circle class="fW" cx="${b[0]}" cy="${b[1]}" r="${r}"/></g>
     <g class="eyes-closed"><path class="sW" d="M${a[0] - 3},${a[1] + .5} L${a[0] + 3},${a[1] + .5} M${b[0] - 3},${b[1] + .5} L${b[0] + 3},${b[1] + .5}"/></g>`
  : `<circle class="fW" cx="${a[0]}" cy="${a[1]}" r="${r}"/><circle class="fW" cx="${b[0]}" cy="${b[1]}" r="${r}"/>`;
const mouth = (p, a, b) => p ? `<g class="mouth-a">${a}</g><g class="mouth-b">${b}</g>` : a;
const jaw = `<path class="k sK" d="M140,52 C139,71 149,81 161,81 C173,81 182,71 181,52"/>`;
const ears = `<path class="sK" d="M140,56 C134,55 134,65 140,66 M181,56 C187,55 187,65 181,66"/>`;
const neck = `<path class="sK" d="M154,80 L154,87 M167,80 L167,87"/>`;
const nose = `<path class="sK" d="M160,60 C157,66 160,68 163,67"/>`;
const shoe = (x, y) => `<path class="k sW" d="M${x},${y} L${x + 18},${y} C${x + 22},${y} ${x + 22},${y + 5} ${x + 18},${y + 5} L${x},${y + 5} Z"/>`;
// place sheet-coordinate art with its feet at (x, y) and depth scale k; `drop` lowers the upper body into a seat
const at = (x, y, k, inner, drop = 0) => { const q = k * AUD;
  return `<g transform="translate(${(x - 160 * q).toFixed(1)},${(y - 187 * q).toFixed(1)}) scale(${q.toFixed(3)})">${drop ? `<g transform="translate(0,${drop})">${inner}</g>` : inner}</g>`; };
// the NRT insignia (a circle seated around a smaller circle), lit
export const insignia = (x, y, r = 2.4) => `<circle class="hl sX" cx="${x}" cy="${y}" r="${r}"/><circle class="fX" cx="${x}" cy="${y}" r="${(r * .42).toFixed(2)}"/>`;

/* ======================================================================
 *  PROF. QUORUM — Department Chair; secretly the Corresponding Author.
 *  White hair combed straight back, bushy white brows, jowls, a bow tie (BRASS: fifty years of gold),
 *  a dark suit (STRUCT), insignia cufflinks lit SIGNAL. "Officially 39 since 1979."
 * ====================================================================== */
export function quorumHead(p = false) {
  return `<g class="hd">${ears}${jaw}
    <path class="hl sK" d="M145,70 C146,75 149,79 152,80 M176,70 C175,75 172,79 169,80 M150,42 C156,40.5 165,40.5 171,42 M152,45.5 C157,44.5 164,44.5 169,45.5"/>
    <path class="k sW" d="M137,55 C132,36 143,22 160,21 C177,22 188,36 183,55 C182,47 180,42 176,38 C168,35 152,35 144,38 C140,42 138,47 137,55 Z"/>
    <path class="hl sW" d="M148,37 C149,30 153,25 158,23 M156,36 C157,29 161,25 166,24 M165,36 C167,30 171,27 175,28 M142,42 C142,36 145,31 149,28 M178,42 C178,37 176,32 172,29"/>
    <path class="sW" d="M144,50 C147,47 152,47 156,49 M165,49 C169,47 174,47 177,50"/><path class="hl sW" d="M144,50 L142,48.5 M177,50 L179,48.5"/>
    ${eyes(p, [151, 56], [170, 56], 1.5)}
    <path class="hl sK" d="M147,59.5 C149,61 153,61 155,59.5 M166,59.5 C168,61 172,61 174,59.5"/>
    <path class="sK" d="M160,57 C156,66 159,69 164,67"/>
    ${mouth(p, `<path class="sK" d="M152,73 C156,74.5 163,74.5 169,71"/>`, `<path class="k sK" d="M152,72.5 C156,72 163,72 169,71 C167,77 155,78 152,72.5 Z"/>`)}${neck}</g>`;
}
const quorumCollar = `
  <path class="sW" d="M152,86 L160,93 L168,86"/>
  <path class="k sA" d="M160,92 L150,87 L150,97 Z M160,92 L170,87 L170,97 Z"/><circle class="fA" cx="160" cy="92" r="1.6"/>`;
const quorumSuit = `
  <path class="k sM" d="M126,98 C130,89 144,85 152,86 L160,100 L168,86 C176,85 190,89 194,98 L196,140 L124,140 Z"/>
  <path class="sM" d="M152,86 L146,104 L160,124 M168,86 L174,104 L160,124"/>${quorumCollar}
`;
// the portrait: hands steepled in front, insignia cufflinks lit
export const quorumBust = () => `${quorumSuit}
  <path class="k sM" d="M138,140 L146,118 L157,118 L157,140 Z M182,140 L174,118 L163,118 L163,140 Z"/>
  <path class="k sW" d="M149,112 L157,112 L157,122 L147,122 Z M163,112 L171,112 L173,122 L163,122 Z"/>
  ${insignia(152.5, 117, 2.2)}${insignia(167.5, 117, 2.2)}
  <path class="k sK" d="M157,124 C157,112 159,104 160,100 C161,104 163,112 163,124 Z"/><path class="hl sK" d="M160,104 L160,124"/>
  ${quorumHead(true)}`;

// seated at the head of the table, facing the room: hands folded on the table (sheet y 140 = table top), cufflinks lit.
// dead: slumped face-down across the papers, arms out, one cufflink still lit.
export function quorumSeated(x, y, k, dead = false) {
  const chair = `<path class="k sD" d="M122,140 L122,28 C122,6 198,6 198,28 L198,140"/><path class="hl sD" d="M130,140 L130,32 C130,16 190,16 190,32 L190,140"/>`;
  if (!dead) return at(x, y, k, `${chair}${quorumSuit}${quorumHead()}
    <path class="sM" d="M128,100 L124,128 L146,138"/><path class="sM" d="M192,100 L196,128 L174,138"/>
    <path class="k sW" d="M140,133 L148,133 L148,141 L140,141 Z M172,133 L180,133 L180,141 L172,141 Z"/>${insignia(144, 137, 3.4)}${insignia(176, 137, 3.4)}
    <path class="k sK" d="M148,136 C150,133 172,133 172,136 C172,141 148,141 148,136 Z"/><path class="hl sK" d="M154,135 L154,140 M160,134.5 L160,140.5 M166,135 L166,140"/>`, 34);
  return at(x, y, k, `${chair}
    <path class="k sM" d="M128,118 C132,108 146,104 160,104 C174,104 188,108 192,118 L194,142 L126,142 Z"/>
    <path class="sM" d="M150,106 L160,124 L170,106"/>
    <path class="sM" d="M130,116 L106,134 L84,138"/><path class="sM" d="M190,116 L210,128 L232,132"/>
    ${insignia(88, 137, 3.4)}${insignia(228, 131.5, 3.4)}
    <path class="sK" d="M82,138 C78,140 74,140 72,138 M234,132 C238,134 242,134 244,131"/>
    <ellipse class="k sW" cx="160" cy="126" rx="23" ry="15"/>
    <path class="hl sW" d="M160,112 L160,140 M150,113 C147,120 147,132 150,139 M170,113 C173,120 173,132 170,139 M141,118 C139,124 140,132 143,136 M179,118 C181,124 180,132 177,136"/>
    <path class="sK" d="M137,126 C133,125 133,132 138,132 M183,126 C187,125 187,132 182,132"/>
    <path class="k sA" d="M156,140 L150,137 L150,142 Z M164,140 L170,137 L170,142 Z"/>`, 34);
}

/* ======================================================================
 *  THE SENIOR FACULTY — six heads, one mark each, cheated out toward the room.
 *  0 glasses · 1 beard · 2 bald · 3 bun · 4 bow tie · 5 turtleneck. Gray hair (STRUCT), skin lines, blank stare.
 *  facultyHead(i, down): down = the nod (head dropped, lids shut).
 * ====================================================================== */
export const FACULTY_MARKS = ["glasses", "beard", "bald", "bun", "bow tie", "turtleneck"];
const facHair = [
  // 0 glasses: side-parted gray
  `<path class="k sM" d="M137,56 C133,38 145,29 160,29 C176,29 187,38 183,56 C179,46 170,40 152,42 C146,44 140,49 137,56 Z"/>
   <rect class="sW" x="144" y="53" width="13" height="9" rx="4"/><rect class="sW" x="164" y="53" width="13" height="9" rx="4"/><path class="sW" d="M157,57 L164,57"/>`,
  // 1 beard
  `<path class="k sM" d="M138,54 C134,38 146,30 160,30 C175,30 186,38 182,54 C178,46 170,43 160,43 C150,43 142,46 138,54 Z"/>
   <path class="k sW" d="M140,60 C141,76 150,88 161,88 C172,88 181,76 181,60 C178,66 174,70 170,69 C166,67 156,67 151,69 C147,70 143,66 140,60 Z"/>
   <path class="hl sW" d="M150,76 C152,80 156,83 160,84 M171,76 C169,80 165,83 162,84"/>`,
  // 2 bald: dome in skin, a gray fringe
  `<path class="sK" d="M140,54 C138,38 148,30 160,30 C172,30 182,38 181,54"/><path class="hl sK" d="M150,36 C154,34 158,33.5 162,34"/>
   <path class="sM" d="M139,48 C136,52 136,58 139,62 M182,48 C185,52 185,58 182,62"/>`,
  // 3 bun
  `<circle class="k sM" cx="160" cy="24" r="8"/><path class="hl sM" d="M154,23 C158,21 162,21 166,23"/>
   <path class="k sM" d="M137,58 C133,39 145,30 160,30 C175,30 187,39 183,58 C179,47 171,42 160,42 C149,42 141,47 137,58 Z"/><path class="hl sM" d="M148,36 C153,34 158,33 160,33 M163,33 C169,34 174,36 177,40"/>`,
  // 4 bow tie (the hair is a combover)
  `<path class="k sM" d="M138,55 C135,40 146,31 160,31 C175,31 185,40 182,55 C180,47 177,43 172,42 C162,38 150,40 144,46 C141,49 139,52 138,55 Z"/><path class="hl sM" d="M146,42 C156,37 166,37 176,41"/>`,
  // 5 turtleneck: close-cropped gray
  `<path class="k sM" d="M138,54 C135,38 146,30 160,30 C174,30 185,38 182,54 C176,46 168,44 160,44 C152,44 144,46 138,54 Z"/><path class="hl sM" d="M146,38 L148,36 M154,36 L156,34 M164,34 L166,36 M172,36 L174,38"/>`,
];
export function facultyHead(i, down = false) {
  const d = down ? 7 : 0, ey = 58;
  const face = down
    ? `<path class="sW" d="M147,${ey + .5} C149,${ey + 2} 153,${ey + 2} 155,${ey + .5} M166,${ey + .5} C168,${ey + 2} 172,${ey + 2} 174,${ey + .5}"/>`
    : `<circle class="fW" cx="151" cy="${ey}" r="1.5"/><circle class="fW" cx="170" cy="${ey}" r="1.5"/>`;
  const brows = i === 0 || i === 2 ? `<path class="sM" d="M145,51 L156,51 M165,51 L176,51"/>` : `<path class="sM" d="M146,52 L156,51 M165,51 L175,52"/>`;
  const mth = i === 1 ? "" : `<path class="sK" d="M154,74 L167,74"/>`;
  return `<g class="hd"><g transform="translate(0,${d})">${ears}${jaw}${brows}${face}${nose}${mth}${facHair[i]}</g></g>`;
}
// the seated body for faculty member i: chair back behind, shoulders and the collar mark
export function facultyBody(i) {
  const collar = [
    `<path class="sW" d="M152,86 L160,96 L168,86"/>`,
    `<path class="sW" d="M152,88 L160,96 L168,88"/>`,
    `<path class="sW" d="M152,86 L160,96 L168,86"/><path class="sB" d="M160,96 L158,110"/>`,
    `<path class="sW" d="M150,88 C154,94 166,94 170,88"/>${[0, 1, 2, 3, 4].map(j => `<circle class="hl sW" cx="${150 + j * 5}" cy="${90 + Math.abs(j - 2) * -1 + 3}" r="1.3"/>`).join("")}`,
    `<path class="sW" d="M152,86 L160,93 L168,86"/><path class="k sA" d="M160,92 L149,86 L149,98 Z M160,92 L171,86 L171,98 Z"/>`,
    `<path class="k sB" d="M150,80 L150,92 C154,95 166,95 170,92 L170,80"/><path class="hl sB" d="M151,84 L169,84 M151,88 L169,88"/>`,
  ][i];
  const jacket = i === 5 ? "sB" : "sM";
  return `<path class="k sD" d="M124,148 L124,72 C124,60 196,60 196,72 L196,148 Z"/>
    <path class="k ${jacket}" d="M130,98 C134,89 146,86 152,86 L160,98 L168,86 C174,86 186,89 190,98 L192,140 L128,140 Z"/>
    ${i === 5 ? "" : `<path class="hl ${jacket}" d="M152,86 L148,104 L160,118 M168,86 L172,104 L160,118"/>`}${collar}
    <path class="sM" d="M131,100 L128,126 L146,134"/><path class="sM" d="M189,100 L192,126 L174,134"/>
    <circle class="sK" cx="149" cy="135" r="3"/><circle class="sK" cx="171" cy="135" r="3"/>
    <path class="hl sD" d="M128,148 L126,153 M192,148 L194,153"/>`;
}
// one faculty member placed in the room: body, then the two vote poses of the head
export function facultySeated(x, y, k, i) {
  return at(x, y, k, facultyBody(i), 34)
    + `<g class="pz on" data-g="vote" data-i="0">${at(x, y, k, facultyHead(i, false), 34)}</g>`
    + `<g class="pz" data-g="vote" data-i="1">${at(x, y, k, facultyHead(i, true), 34)}</g>`;
}

/* ======================================================================
 *  GUS, seated. At his lab desk facing the room (awake since Monday: bags under the eyes),
 *  and from behind in a chair (the conference room).
 * ====================================================================== */
function gusHead() {
  return `<g class="hd"><path class="sK" d="M154,76 L154,82 M166,76 L166,82"/>
    <path class="k sK" d="M137,47 C136,66 148,77 160,77 C172,77 184,66 183,47"/>
    <path class="sW" d="M137,50 C134,54 135,60 138,62 M183,50 C186,54 185,60 182,62"/>
    <path class="k sW" d="M136,50 C133,32 146,21 160,21 C175,21 187,32 184,50 C180,42 172,38 160,39 C150,38 141,42 136,50 Z"/>
    <path class="hl sW" d="M144,28 C147,25 151,26 151,30 M156,24 C159,21 164,22 164,26 M168,25 C172,23 176,26 175,30 M140,38 C143,35 147,37 146,40 M174,35 C177,34 180,37 178,40"/>
    <path class="sW" d="M146,49 L154,48 M166,48 L174,49"/><circle class="k sW" cx="150.5" cy="55" r="2.6"/><circle class="k sW" cx="169.5" cy="55" r="2.6"/>
    <circle class="fW" cx="150.5" cy="55.5" r="1.1"/><circle class="fW" cx="169.5" cy="55.5" r="1.1"/>
    <path class="hl sK" d="M146,59.5 C148,61.5 153,61.5 155,59.5 M165,59.5 C167,61.5 172,61.5 174,59.5"/>
    <path class="sK" d="M160,56 C156,63 159,66 164,64"/>
    <path class="k sW" d="M144,68 C150,62 157,65 160,67 C163,65 170,62 176,68 C170,72 163,70 160,70 C157,70 150,72 144,68 Z"/></g>`;
}
const gusTorso = `
  <path class="k sV" d="M135,88 C140,82 150,81 160,84 C170,81 180,82 185,88 L188,130 L132,130 Z"/>
  <path class="sW" d="M151,84 L160,100 L169,84"/><path class="hl sV" d="M153,86 L156,130 M167,86 L164,130"/>
  ${[108, 118].map(y => `<circle class="hl sV" cx="157" cy="${y}" r="1.4"/>`).join("")}
  <path class="sW" d="M143,84 C143,93 177,93 177,84"/><ellipse class="k sW" cx="141" cy="83" rx="4" ry="5.5"/><ellipse class="k sW" cx="179" cy="83" rx="4" ry="5.5"/>`;
// at a desk, facing the room, typing (forearms down to a keyboard the desk/laptop hides)
export function gusSeated(x, y, k) {
  return at(x, y, k, `<path class="hl sD" d="M124,150 L196,150 M126,150 L124,187 M194,150 L196,187"/>
    <path class="k sM" d="M134,138 L132,150 L150,150 L150,184 L162,184 L162,148 L164,148 L164,184 L176,184 L176,150 L188,150 L188,138 Z"/>${shoe(140, 184)}${shoe(162, 184)}
    <g transform="translate(0,20)">${gusTorso}
      <path class="sV" d="M136,92 L130,118 L146,128"/><circle class="sK" cx="149" cy="129" r="3"/>
      <path class="sV" d="M184,92 L190,118 L174,128"/><circle class="sK" cx="171" cy="129" r="3"/>${gusHead()}</g>`);
}
// from behind, in a chair at the table: the curls and the headphones are how you know him
export function gusBack(x, y, k) {
  return at(x, y, k, `
    <path class="k sV" d="M130,98 C134,90 146,86 160,86 C174,86 186,90 190,98 L192,124 L128,124 Z"/>
    <path class="sW" d="M141,86 C141,96 179,96 179,86"/><ellipse class="k sW" cx="139" cy="86" rx="4" ry="5.5"/><ellipse class="k sW" cx="181" cy="86" rx="4" ry="5.5"/>
    <path class="sK" d="M154,76 L154,86 M166,76 L166,86"/>
    <path class="sK" d="M137,48 C133,48 133,58 138,59 M183,48 C187,48 187,58 182,59"/>
    <path class="k sW" d="M137,58 C130,40 140,21 160,21 C180,21 190,40 183,58 C180,70 172,76 160,76 C148,76 140,70 137,58 Z"/>
    <path class="hl sW" d="M146,30 C149,27 153,28 153,32 M158,26 C161,23 166,24 166,28 M170,29 C174,27 178,30 177,34 M141,42 C144,39 148,41 147,44 M152,40 C155,37 159,39 158,42 M164,39 C167,36 171,38 170,41 M175,43 C178,41 182,43 180,47 M144,55 C147,52 151,54 150,57 M157,52 C160,49 164,51 163,54 M169,55 C172,52 176,54 175,57 M151,66 C154,63 158,65 157,68 M163,66 C166,63 170,65 169,68"/>
    <path class="k sD" d="M122,124 L122,96 C122,90 198,90 198,96 L198,124 Z"/><path class="hl sD" d="M126,124 L124,187 M194,124 L196,187 M122,150 L198,150"/>`);
}

/* ======================================================================
 *  PROF. EMERITA IRIS CANDOR, seated at her desk: the portrait drawing (bun, glasses on a chain,
 *  pearls, ROBE cardigan), hands on the blotter.
 * ====================================================================== */
const irisHead = () => `<g class="hd">
  <path class="sK" d="M153,84 L153,90 M167,84 L167,90"/>
  <path class="k sK" d="M139,50 C138,71 148,84 160,84 C172,84 182,71 181,50"/>
  <path class="k sW" d="M137,56 C134,37 146,29 160,29 C174,29 186,37 183,56 C178,46 168,42 160,42 C152,42 142,46 137,56 Z"/>
  <circle class="k sW" cx="160" cy="22" r="8"/><path class="sW" d="M154,20 C158,18 162,18 166,20 M150,36 C154,33 158,32 162,32"/>
  <circle class="fW" cx="151" cy="60" r="1.5"/><circle class="fW" cx="169" cy="60" r="1.5"/>
  <path class="sA" d="M143,57 L157,56 L156,63 L145,64 Z M163,56 L177,57 L175,64 L164,63 Z M157,58 L163,58"/>
  <path class="sA dash" d="M143,60 C134,72 136,88 146,96"/>
  <path class="sK" d="M160,63 C157,69 160,71 163,70 M146,70 L149,72.5 M174,70 L171,72.5"/>
  <path class="sK" d="M153,75 C157,77 163,77 167,74"/></g>`;
// legs: in a chair out in the room (THE REHEARSAL), not behind her desk: a tweed skirt to the knee, stockinged shins
// (a pink line, like all skin), sensible shoes on the floor. Seat at y 142 here (sheet 176), floor at 192.
const irisLegs = `<path class="k sM" d="M130,140 L192,140 L188,162 L132,162 Z"/><path class="hl sM" d="M160,142 L160,162"/>
  <path class="sK" d="M144,162 L145,186 M152,162 L151,186 M168,162 L169,186 M176,162 L175,186"/>
  <path class="k sW" d="M136,186 L152,186 C155,186 155,191 152,191 L136,191 Z M168,186 L184,186 C187,186 187,191 184,191 L168,191 Z"/>`;
export function irisSeated(x, y, k, { legs = false } = {}) {
  return at(x, y, k, `${legs ? irisLegs : ""}
    <path class="k sV" d="M128,98 C132,90 146,88 152,88 L160,100 L168,88 C174,88 188,90 192,98 L194,142 L126,142 Z"/>
    <path class="sV" d="M160,100 L160,142"/>${[112, 124].map(yy => `<circle class="sV" cx="165" cy="${yy}" r="1.4"/>`).join("")}
    ${[150, 155, 160, 165, 170].map((xx, i) => `<circle class="sW" cx="${xx}" cy="${96 - Math.abs(i - 2) * 1.2}" r="1.5"/>`).join("")}
    <path class="sV" d="M130,100 L126,126 L148,134"/><circle class="sK" cx="151" cy="135" r="3"/>
    <path class="sV" d="M190,100 L194,126 L172,134"/><circle class="sK" cx="169" cy="135" r="3"/>${irisHead()}`, 34);
}

/* ---- portraits for portraits.js (same shape as PORTRAIT entries) ----
 * Quorum's chip is BRASS: his fifty years of gold medals. Nobody else in Act III speaks in BRASS. */
export const PORTRAITS_A = {
  quorum: { name: "PROF. QUORUM", chip: "fR", vb: "112 10 96 118", svg: quorumBust },
  irisNamed: { ...PORTRAIT.iris, name: "PROF. IRIS CANDOR" },
};
