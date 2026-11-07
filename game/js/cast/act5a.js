// ACT V cast, part A: the hooded members of the Round Table, Preston hooded, Quorum unhooded (fifty years of gold),
// and the defense committee seated (Prof. Adline, Det. Small; Ethel is ethelAtDesk in figures.js).
// Same sheet coordinates as figures.js: feet at about (160,187), standing head about y 28–82; seated drawings drop 34.
import { seg, arcs } from "../gfx.js";
import { AUD, smallHead } from "../figures.js";
import { quorumHead, insignia, PORTRAITS_A } from "./act3a.js";

const eyes = (p, a, b, r = 1.6) => p
  ? `<g class="eyes-open"><circle class="fW" cx="${a[0]}" cy="${a[1]}" r="${r}"/><circle class="fW" cx="${b[0]}" cy="${b[1]}" r="${r}"/></g>
     <g class="eyes-closed"><path class="sW" d="M${a[0] - 3},${a[1] + .5} L${a[0] + 3},${a[1] + .5} M${b[0] - 3},${b[1] + .5} L${b[0] + 3},${b[1] + .5}"/></g>`
  : `<circle class="fW" cx="${a[0]}" cy="${a[1]}" r="${r}"/><circle class="fW" cx="${b[0]}" cy="${b[1]}" r="${r}"/>`;
const mouth = (p, a, b) => p ? `<g class="mouth-a">${a}</g><g class="mouth-b">${b}</g>` : a;
const jaw = `<path class="k sK" d="M140,52 C139,71 149,81 161,81 C173,81 182,71 181,52"/>`;
const ears = `<path class="sK" d="M140,56 C134,55 134,65 140,66 M181,56 C187,55 187,65 181,66"/>`;
const neck = `<path class="sK" d="M154,80 L154,87 M167,80 L167,87"/>`;
const nose = `<path class="sK" d="M160,60 C157,66 160,68 163,67"/>`;
// place sheet-coordinate art with its feet at (x, y) and depth scale k; `drop` lowers the upper body into a seat
const at = (x, y, k, inner, drop = 0) => { const q = k * AUD;
  return `<g transform="translate(${(x - 160 * q).toFixed(1)},${(y - 187 * q).toFixed(1)}) scale(${q.toFixed(3)})">${drop ? `<g transform="translate(0,${drop})">${inner}</g>` : inner}</g>`; };
const pin = (x, y, r = 4.2) => `<circle class="sX" cx="${x}" cy="${y}" r="${r}"/><circle class="fX" cx="${x}" cy="${y}" r="${(r * .4).toFixed(2)}"/>`;

/* ======================================================================
 *  A HOODED MEMBER. ROBE all over, a black opening for a face, the insignia pin lit SIGNAL.
 *  Members are deliberately interchangeable: no face, no mark. That's the point of them.
 * ====================================================================== */
const HOOD = `M138,74 C134,46 146,22 160,18 C174,22 186,46 182,74 C176,70 168,68 160,68 C152,68 144,70 138,74 Z`;
const OPENING = `M148,62 C147,44 153,34 160,32 C167,34 173,44 172,62 C166,66 154,66 148,62 Z`;
const COWL = `<path class="sV" d="M140,86 C132,110 146,126 160,126 C174,126 188,110 180,86"/><path class="hl sV" d="M150,124 L170,124"/>`;
// the tall, pointed chair every member sits in
const throneBack = (cls = "sD") => `<path class="k ${cls}" d="M120,150 L120,34 Q120,10 160,-4 Q200,10 200,34 L200,150"/><path class="hl ${cls}" d="M128,150 L128,38 Q128,18 160,6 Q192,18 192,38 L192,150"/>`;

// seated at the Round Table. lit: the insignia pin is on (false in the finale: every clasp and pin has flown to the ring).
// back: seen from behind (the near side of the table), the chair back in front of the robe.
export function hoodSeated(x, y, k, lit = true, back = false) {
  if (back) return at(x, y, k, `
    <path class="k sV" d="M126,140 C126,104 136,82 150,78 L170,78 C184,82 194,104 194,140 Z"/>
    <path class="k sV" d="M137,82 C132,50 146,22 160,17 C174,22 188,50 183,82 C176,88 144,88 137,82 Z"/>
    <path class="hl sV" d="M160,20 C158,40 159,64 160,86 M146,40 C143,52 142,66 143,80 M174,40 C177,52 178,66 177,80"/>
    <path class="hl sV" d="M134,110 C140,116 150,118 160,118 C170,118 180,116 186,110"/>
    <path class="k sD" d="M120,150 L120,104 Q120,96 128,96 L192,96 Q200,96 200,104 L200,150 Z"/><path class="hl sD" d="M126,150 L124,187 M194,150 L196,187 M120,124 L200,124"/>`, 34);
  return at(x, y, k, `${throneBack()}
    <path class="k sV" d="M128,140 C128,104 138,84 150,80 L170,80 C182,84 192,104 192,140 Z"/>
    <path class="hl sV" d="M150,96 C146,112 145,126 146,140 M170,96 C174,112 175,126 174,140"/>
    <path class="k sV" d="${HOOD}"/><path class="k hl sV" d="${OPENING}"/>${COWL}
    <path class="sV" d="M131,102 L127,128 L148,136"/><path class="sV" d="M189,102 L193,128 L172,136"/>
    <path class="k sK" d="M148,136 C150,132 170,132 172,136 C172,141 148,141 148,136 Z"/><path class="hl sK" d="M156,134 L156,140 M164,134 L164,140"/>
    ${lit ? pin(174, 98) : `<path class="hl sV" d="M172,96 L176,100"/>`}`, 34);
}

// standing: the doorkeeper, and Quorum at the head of the table (o.trim: the Corresponding Author's brass-edged hood).
export function hoodStanding(x, y, k, lit = true, o = {}) {
  const trim = o.trim ? `<path class="hl ${o.trim}" d="M140,72 C136,46 147,24 160,20 C173,24 184,46 180,72 M149,61 C148,45 154,36 160,34 C166,36 172,45 171,61"/>` : "";
  return at(x, y, k, `
    <path class="k sD" d="M140,182 L156,182 L156,186 L140,186 Z M164,182 L180,182 L180,186 L164,186 Z"/>
    <path class="k sV" d="M141,72 C128,96 124,140 120,182 L200,182 C196,140 192,96 179,72 Z"/>
    <path class="hl sV" d="M150,90 C146,120 144,150 142,180 M170,90 C174,120 176,150 178,180"/>
    ${COWL}
    <path class="sV" d="M136,90 L128,124 L146,140"/><path class="sV" d="M184,90 L192,124 L174,140"/>
    <path class="k sK" d="M146,140 C148,134 172,134 174,140 C174,146 146,146 146,140 Z"/>
    <path class="k sV" d="${HOOD}"/><path class="k hl sV" d="${OPENING}"/>${trim}
    ${lit ? pin(173, 98) : `<path class="hl sV" d="M171,96 L175,100"/>`}`);
}

/* ======================================================================
 *  PRESTON, HOODED. The hood is up, but his face is in it: pinpoint pupils, the earbuds lit ON with ((( ))),
 *  a strand of BRASS hair and the SIGNAL blazer collar under the robe. free: the finale. The hood has fallen back,
 *  the earbuds are gone (flown to the ring), the eyes are COOL and his own again.
 * ====================================================================== */
const prestonFace = (free) => `
  <path class="k sK" d="M140,52 C139,70 149,80 160,80 C171,80 181,70 180,52"/>
  <path class="sK" d="M160,59 C157,65 160,67 163,66"/>
  ${free
    ? `<path class="k sW" d="M144,57 C147,53 152,53 155,57 C152,60 147,60 144,57 Z"/><circle class="fB" cx="150" cy="57" r="1.8"/>
       <path class="k sW" d="M165,57 C168,53 173,53 176,57 C173,60 168,60 165,57 Z"/><circle class="fB" cx="170.5" cy="57" r="1.8"/>
       <path class="sA" d="M143,50 C147,47 152,47 156,49 M164,49 C168,47 173,47 177,50"/>
       <path class="sK" d="M153,72 C157,70 163,70 167,72"/><path class="hl sK" d="M141,62 L144,63 M179,62 L176,63"/>`
    : `<circle class="k sW" cx="150" cy="57" r="3.8"/><circle class="fW" cx="150" cy="57" r=".8"/><circle class="k sW" cx="170" cy="57" r="3.8"/><circle class="fW" cx="170" cy="57" r=".8"/>
       <path class="sA" d="M144,50 L156,50 M164,50 L176,50"/><path class="sK" d="M152,72 L168,72"/>`}`;
export function prestonHooded(x, y, k, free = false) {
  const robe = `
    <path class="k sD" d="M140,182 L156,182 L156,186 L140,186 Z M164,182 L180,182 L180,186 L164,186 Z"/>
    <path class="k sV" d="M141,74 C128,98 124,140 120,182 L200,182 C196,140 192,98 179,74 Z"/>
    <path class="hl sV" d="M150,92 C146,120 144,150 142,180 M170,92 C174,120 176,150 178,180"/>
    <path class="k sR" d="M150,82 L160,98 L170,82 Z"/><path class="sW" d="M154,84 L160,94 L166,84"/>
    <path class="sV" d="M136,92 L128,124 L144,140"/><circle class="sK" cx="145" cy="142" r="3"/>
    <path class="sV" d="M184,92 L192,124 L176,140"/><circle class="sK" cx="175" cy="142" r="3"/>`;
  if (free) return at(x, y, k, `${robe}
    <path class="k sV" d="M130,92 C124,74 132,56 146,52 L174,52 C188,56 196,74 190,92 C180,84 140,84 130,92 Z"/>
    <path class="hl sV" d="M136,80 C146,74 174,74 184,80"/>
    <path class="sK" d="M153,78 L153,86 M167,78 L167,86"/>${prestonFace(true)}
    <path class="sK" d="M140,55 C134,54 134,64 140,64 M180,55 C186,54 186,64 180,64"/><circle class="hl sK" cx="137.5" cy="59" r="1.4"/><circle class="hl sK" cx="182.5" cy="59" r="1.4"/>
    <path class="k sA" d="M137,56 C133,36 145,22 160,21 C177,20 189,32 184,52 C181,44 174,40 167,41 C171,35 167,30 160,32 C151,35 143,44 137,56 Z"/>
    <path class="sA" d="M146,31 C153,26 165,25 175,28"/>`);
  return at(x, y, k, `${robe}
    <path class="k sV" d="M136,78 C131,48 145,20 160,15 C175,20 189,48 184,78 C176,74 168,72 160,72 C152,72 144,74 136,78 Z"/>
    <path class="k hl sV" d="M143,70 C141,46 150,30 160,27 C170,30 179,46 177,70 C170,74 150,74 143,70 Z"/>
    ${prestonFace(false)}
    <path class="sA" d="M150,36 C154,32 160,31 166,34 M147,42 C150,37 154,35 158,35"/>
    <circle class="fG" cx="143" cy="60" r="2.6"/><circle class="fG" cx="177" cy="60" r="2.6"/>
    ${arcs(134, 60, -1, "sG", 3, .8)}${arcs(186, 60, 1, "sG", 3, .8)}
    ${pin(173, 100)}`);
}

/* ======================================================================
 *  PROF. QUORUM, UNHOODED: the hood pushed back over his shoulders, the bow tie, and fifty years of gold
 *  medals (BRASS) pinned in rows down the robe, plus a chain of office. Insignia cufflinks lit SIGNAL.
 *  up: the finale. The medals point at the ring, ribbons and all, and so does he.
 * ====================================================================== */
const MEDALS = [[142, 104], [151, 104], [169, 104], [178, 104], [140, 118], [149, 118], [171, 118], [180, 118], [143, 132], [152, 132], [168, 132], [177, 132], [146, 146], [174, 146]];
const medals = (up = false) => MEDALS.map(([x, y]) => up
  ? `<path class="hl sA" d="M${x - 2},${y} L${x},${y - 5} L${x + 2},${y}"/><circle class="k sA" cx="${x}" cy="${y - 8}" r="3.2"/><path class="hl sA" d="M${x},${y - 10} L${x},${y - 6}"/>`
  : `<path class="hl sA" d="M${x - 2},${y - 6} L${x},${y - 1} L${x + 2},${y - 6}"/><circle class="k sA" cx="${x}" cy="${y + 2}" r="3.2"/><path class="hl sA" d="M${x},${y} L${x},${y + 4}"/>`).join("");
const quorumCollar = `<path class="sW" d="M152,86 L160,93 L168,86"/>
  <path class="k sA" d="M160,92 L150,87 L150,97 Z M160,92 L170,87 L170,97 Z"/><circle class="fA" cx="160" cy="92" r="1.6"/>`;
const chainOfOffice = (up = false) => up
  ? `<path class="sA dash" d="M146,88 C146,76 152,66 160,60 C168,66 174,76 174,88"/><circle class="k sA" cx="160" cy="56" r="5"/>${insignia(160, 56, 2.6)}`
  : `<path class="sA dash" d="M144,88 C144,104 152,112 160,114 C168,112 176,104 176,88"/><circle class="k sA" cx="160" cy="118" r="5"/>${insignia(160, 118, 2.6)}`;
// the hood, pushed back: a bunched cowl behind the head and shoulders
const hoodBack = `<path class="k sV" d="M126,96 C118,72 128,46 146,40 L174,40 C192,46 202,72 194,96 C182,86 138,86 126,96 Z"/><path class="hl sV" d="M132,84 C142,76 178,76 188,84 M136,70 C146,60 174,60 184,70"/>`;
export function quorumUnhooded(x, y, k, up = false) {
  const robe = `
    <path class="k sV" d="M140,86 C128,100 124,140 120,182 L200,182 C196,140 192,100 180,86 Z"/>
    <path class="k sM" d="M152,86 L160,100 L168,86 L166,160 L154,160 Z"/>${quorumCollar}
    <path class="hl sV" d="M150,96 C146,124 144,152 142,180 M170,96 C174,124 176,152 178,180"/>`;
  if (up) return at(x, y, k, `${hoodBack}${robe}
    <path class="sV" d="M138,92 L128,62 L124,36"/><path class="sV" d="M182,92 L192,62 L196,36"/>
    <circle class="sK" cx="123" cy="32" r="3"/><circle class="sK" cx="197" cy="32" r="3"/>${insignia(126, 42, 3)}${insignia(194, 42, 3)}
    <path class="k sD" d="M146,182 L150,194 L156,182 Z M164,182 L170,194 L174,182 Z"/>
    ${medals(true)}${chainOfOffice(true)}${quorumHead()}
    <path class="sW" d="M144,46 L140,40 M176,46 L180,40"/>`);
  return at(x, y, k, `${hoodBack}${robe}
    <path class="k sD" d="M140,182 L156,182 L156,186 L140,186 Z M164,182 L180,182 L180,186 L164,186 Z"/>
    <path class="sV" d="M136,94 L128,126 L146,140"/><path class="sV" d="M184,94 L192,126 L174,140"/>
    <path class="k sK" d="M146,140 C148,134 172,134 174,140 C174,146 146,146 146,140 Z"/>${insignia(144, 138, 3)}${insignia(176, 138, 3)}
    ${medals()}${chainOfOffice()}${quorumHead()}`);
}

/* ======================================================================
 *  THE COMMITTEE, seated behind a table facing the room (the table hides the lap; sheet y 140 = table top).
 *  Prof. Dee Adline: reading glasses pushed up on her head, the grant deadline in her eyes (bags, a wide stare),
 *  three pens in her breast pocket, a COOL blazer. Det. Small: the BRASS trench coat and his notebook.
 * ====================================================================== */
export function adlineHead(p = false) {
  return `<g class="hd">${ears}${jaw}
    <path class="k sM" d="M136,64 C130,38 144,27 160,27 C176,27 190,38 184,64 C182,74 186,82 190,86 C182,86 178,80 180,70 C178,54 170,44 160,44 C152,44 144,50 140,58 C140,70 138,80 130,86 C134,80 136,72 136,64 Z"/>
    <path class="hl sM" d="M146,34 C152,31 160,31 164,33 M168,32 C174,34 178,38 180,44 M156,27 L153,21 M163,27 L166,20 M171,29 L176,24"/>
    <rect class="sW" x="143" y="35" width="13" height="7" rx="3"/><rect class="sW" x="164" y="35" width="13" height="7" rx="3"/><path class="sW" d="M156,38 L164,38"/>
    <path class="sM" d="M145,51 C148,49 153,49 156,51 M165,51 C168,49 173,49 176,51"/>
    ${p ? `<g class="eyes-open"><circle class="sW" cx="150.5" cy="57.5" r="3.4"/><circle class="sW" cx="170.5" cy="57.5" r="3.4"/><circle class="fW" cx="150.5" cy="57.5" r="1.3"/><circle class="fW" cx="170.5" cy="57.5" r="1.3"/></g>
      <g class="eyes-closed"><path class="sW" d="M147,58 L154,58 M167,58 L174,58"/></g>`
      : `<circle class="sW" cx="150.5" cy="57.5" r="3.4"/><circle class="sW" cx="170.5" cy="57.5" r="3.4"/><circle class="fW" cx="150.5" cy="57.5" r="1.3"/><circle class="fW" cx="170.5" cy="57.5" r="1.3"/>`}
    <path class="hl sK" d="M146,63 C148,65 153,65 155,63 M166,63 C168,65 173,65 175,63 M147,65.5 C149,67 152,67 154,66 M167,66 C169,67 172,67 174,65.5"/>
    ${nose}
    ${mouth(p, `<path class="sK" d="M154,74 C158,72.5 163,72.5 167,74"/>`, `<path class="k sK" d="M154,73 C158,72 163,72 167,73 C165,77.5 156,77.5 154,73 Z"/>`)}${neck}</g>`;
}
const adlineBody = `
  <path class="k sB" d="M126,98 C130,89 145,86 152,86 L160,98 L168,86 C175,86 190,89 194,98 L195,140 L125,140 Z"/>
  <path class="sB" d="M152,86 L147,104 L160,120 M168,86 L173,104 L160,120"/><path class="sW" d="M153,88 C156,94 164,94 167,88"/>
  <path class="hl sB" d="M168,108 L182,108"/>
  <path class="sR" d="M171,108 L171,99"/><path class="sG" d="M175,108 L174,98"/><path class="sA" d="M179,108 L180,100"/>`;
export const adlineBust = () => adlineBody + adlineHead(true);
export function adlineSeated(x, y, k) {
  return at(x, y, k, `${adlineBody}
    <path class="sB" d="M127,100 L130,124 L148,132"/><circle class="sK" cx="151" cy="133" r="3"/>
    <path class="sB" d="M193,100 L190,124 L172,132"/><circle class="sK" cx="169" cy="133" r="3"/>
    <path class="hl sW" d="M144,138 L168,134 L172,140 L148,144 Z"/>${adlineHead()}`, 34);
}
const smallCoatSeated = `
  <path class="k sA" d="M128,96 C134,88 147,85 154,86 L160,96 L166,86 C173,85 186,88 192,96 L194,140 L126,140 Z"/>
  <path class="sA" d="M146,86 L152,104 L160,96 M174,86 L168,104 L160,96 M150,86 L144,90 M170,86 L176,90"/><path class="sR" d="M160,96 L158,112 L160,118 L162,112 Z"/>
  <path class="sA" d="M128,128 L192,128"/>`;
export function smallSeated(x, y, k) {
  return at(x, y, k, `${smallCoatSeated}
    <path class="sA" d="M130,98 L130,124 L148,132"/><circle class="sK" cx="151" cy="133" r="3"/>
    <path class="sA" d="M190,98 L192,120 L176,124"/><rect class="k sW" x="166" y="114" width="12" height="16"/><path class="hl sW" d="M169,119 L176,119 M169,123 L176,123"/><circle class="sK" cx="176" cy="124" r="3"/>
    ${smallHead()}`, 34);
}

/* ---- talking portraits (same shape as PORTRAIT in portraits.js) ----
 * The hood has no eyes: two faint glints in the opening blink (eyes-open / eyes-closed), and the lower edge of the
 * opening sways when it speaks (mouth-a / mouth-b). The insignia pin is lit on the chest. */
const hoodBust = () => `
  <path class="k sV" d="M104,142 C106,110 122,92 146,86 L174,86 C198,92 214,110 216,142 Z"/>
  <path class="hl sV" d="M140,98 C134,112 132,128 132,142 M180,98 C186,112 188,128 188,142"/>
  <path class="sV" d="M130,90 C124,112 140,128 160,128 C180,128 196,112 190,90"/><path class="hl sV" d="M146,126 L174,126"/>
  ${pin(182, 106, 5)}
  <path class="k sV" d="M128,92 C122,56 140,18 160,12 C180,18 198,56 192,92 C182,86 170,84 160,84 C150,84 138,86 128,92 Z"/>
  <path class="hl sV" d="M160,14 C152,24 146,36 142,50 M160,14 C168,24 174,36 178,50"/>
  <path class="k sV" d="M141,78 C138,52 148,34 160,30 C172,34 182,52 179,78"/>
  <g class="mouth-a"><path class="sV" d="M141,78 C150,83 170,83 179,78"/></g>
  <g class="mouth-b"><path class="sV" d="M141,78 C150,88 170,88 179,78"/></g>
  <g class="eyes-open"><circle class="fM" cx="152" cy="58" r=".9"/><circle class="fM" cx="168" cy="58" r=".9"/><path class="hl sD" d="M150,58 L154,58 M166,58 L170,58"/></g>
  <g class="eyes-closed"><path class="hl sD" d="M150,58.5 L154,58.5 M166,58.5 L170,58.5"/></g>`;
const quorumUnhoodedBust = () => `${hoodBack}
  <path class="k sV" d="M106,142 C108,110 124,94 146,88 L152,86 L160,100 L168,86 L174,88 C196,94 212,110 214,142 Z"/>
  <path class="k sM" d="M152,86 L160,100 L168,86 L166,142 L154,142 Z"/>${quorumCollar}
  ${[[132, 104], [141, 104], [179, 104], [188, 104], [130, 118], [139, 118], [181, 118], [190, 118], [133, 132], [186, 132]].map(([x, y]) =>
    `<path class="hl sA" d="M${x - 2},${y - 6} L${x},${y - 1} L${x + 2},${y - 6}"/><circle class="k sA" cx="${x}" cy="${y + 2}" r="3.4"/><path class="hl sA" d="M${x},${y} L${x},${y + 4}"/>`).join("")}
  <path class="sA dash" d="M146,88 C146,104 152,114 160,117 C168,114 174,104 174,88"/><circle class="k sA" cx="160" cy="122" r="5.5"/>${insignia(160, 122, 2.8)}
  ${quorumHead(true)}`;
export const PORTRAITS_5A = {
  hood: { name: "A HOODED MEMBER", chip: "fV", vb: "112 6 96 118", svg: hoodBust },
  quorumUnhooded: { name: "PROF. QUORUM", chip: PORTRAITS_A.quorum.chip, vb: "112 10 96 118", svg: quorumUnhoodedBust },
};
