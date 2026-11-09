// THE KITCHEN REGULARS: grad students and postdocs who are sometimes lounging in the coffee kitchen, dispensing bad advice
// and good rumors. Unimportant people, so each is a few lines and one identifying mark: the SIXTH-YEAR's red beanie,
// the POSTDOC's dart, the FIRST-YEAR's headphones (on a beanbag, laptop on lap). At night: a postdoc asleep on the beanbag.
// Same sheet coordinates as figures.js: feet at about (160,187), standing head about y 28–82.
import { seg } from "../gfx.js";
import { AUD } from "../figures.js";

const shoe = (x, y, c = "sW") => `<path class="k ${c}" d="M${x},${y} L${x + 18},${y} C${x + 22},${y} ${x + 22},${y + 5} ${x + 18},${y + 5} L${x},${y + 5} Z"/>`;
const place = (x, y, k, inner, flip = 1) => { const q = k * AUD;
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(flip * q).toFixed(3)},${q.toFixed(3)}) translate(-160,-187)">${inner}</g>`; };
const jaw = `<path class="k sK" d="M140,52 C139,71 149,81 161,81 C173,81 182,71 181,52"/>`;
const ears = `<path class="sK" d="M140,56 C134,55 134,65 140,66 M181,56 C187,55 187,65 181,66"/>`;
const neck = `<path class="sK" d="M154,80 L154,87 M167,80 L167,87"/>`;
const nose = `<path class="sK" d="M160,60 C157,66 160,68 163,67"/>`;
const eyes = (shut) => shut ? `<path class="sW" d="M147,59 L154,60 M166,60 L173,59"/>` : `<circle class="fW" cx="151" cy="59" r="1.5"/><circle class="fW" cx="170" cy="59" r="1.5"/>`;

/* ---- the SIXTH-YEAR: grey hoodie, red beanie (the mark), a mug; leaning, ankles crossed ---- */
const sixthHead = () => `<g class="hd">${ears}${jaw}
  <path class="k sR" d="M137,54 C134,34 146,24 160,24 C174,24 186,34 183,54 Z"/><path class="hl sR" d="M137,50 L183,50 M142,30 L142,50 M152,26 L152,50 M168,26 L168,50 M178,30 L178,50"/>
  <circle class="k sR" cx="160" cy="20" r="4"/>${eyes(false)}<path class="hl sK" d="M146,63 C149,65 153,65 155,63 M166,63 C168,65 172,65 175,63"/>${nose}
  <path class="sK" d="M153,73 C157,74 163,74 168,72"/>${neck}</g>`;
export function sixthYear(x, y, k, flip = 1) {
  return place(x, y, k, `
    <path class="k sD" d="M138,130 L156,180 L172,180 L158,130 Z"/><path class="k sD" d="M162,130 L148,180 L164,180 L184,130 Z"/>${shoe(142, 180)}${shoe(160, 182)}
    <path class="k sM" d="M132,94 C138,87 148,85 160,85 C172,85 182,87 188,94 L191,134 L129,134 Z"/>
    <path class="sM" d="M146,86 C148,96 172,96 174,86"/><path class="hl sM" d="M156,96 L155,112 M164,96 L165,112 M142,118 L178,118 L176,130 L144,130 Z"/>
    <path class="sM" d="M133,96 L127,122 L137,130"/><path class="sM" d="M187,96 L194,116 L178,116"/><circle class="sK" cx="175" cy="115" r="3"/>
    <path class="k sW" d="M164,104 L175,104 L174,118 L165,118 Z"/><path class="sW" d="M164,107 C159,108 159,115 165,115"/>
    ${sixthHead()}`, flip);
}

/* ---- the POSTDOC: rolled sleeves, glasses, a lanyard; one hand up with a dart (the mark) ---- */
const postdocHead = (shut = false) => `<g class="hd">${ears}${jaw}
  <path class="k sM" d="M137,56 C134,38 146,29 160,29 C174,29 186,38 183,56 C178,44 170,40 160,41 C150,40 142,46 137,56 Z"/>
  <path class="sW" d="M144,55 L156,55 L156,63 L144,63 Z M164,55 L176,55 L176,63 L164,63 Z M156,58 L164,58"/>${eyes(shut)}${nose}
  <path class="sK" d="M153,73 L167,73"/>${neck}</g>`;
export function postdoc(x, y, k, flip = 1) {
  return place(x, y, k, `
    <path class="k sN" d="M140,130 L144,180 L158,180 L160,140 L162,180 L176,180 L180,130 Z"/>${shoe(140, 180)}${shoe(160, 180)}
    <path class="k sW" d="M133,92 C139,87 148,85 154,86 L160,95 L166,86 C172,85 181,87 187,92 L189,132 L131,132 Z"/>
    <path class="sW" d="M154,86 L150,93 L157,96 M166,86 L170,93 L163,96 M160,96 L160,132"/>
    <path class="sA" d="M151,88 L157,112 M169,88 L163,112"/><rect class="k sA" x="153" y="111" width="14" height="15"/>${seg("P", 157.5, 114, 8, "sA", 1)}
    <path class="sW" d="M134,96 L128,122 L140,130"/><path class="hl sK" d="M128,114 L134,116"/>
    <path class="sW" d="M186,95 L198,80 L196,66"/><circle class="sK" cx="196" cy="63" r="3"/>
    <path class="sW" d="M196,60 L196,46"/><path class="sR" d="M196,49 L192,44 M196,49 L200,44 M196,52 L192,47 M196,52 L200,47"/>
    ${postdocHead()}`, flip);
}

/* ---- the FIRST-YEAR, on a beanbag: blue hoodie, headphones round the neck (the mark), laptop on the knees ---- */
const beanbag = `<path class="k sD" d="M112,187 C104,168 118,140 138,134 C152,130 168,130 182,134 C202,140 216,168 208,187 Z"/><path class="hl sD" d="M126,150 C140,160 180,160 194,150"/>`;
const firstHead = () => `<g class="hd">${ears}${jaw}
  <path class="k sW" d="M137,56 C130,40 142,26 160,26 C178,26 190,40 183,56 C181,48 176,44 172,46 C170,40 164,40 160,44 C156,40 150,40 148,46 C144,44 139,48 137,56 Z"/>
  <path class="hl sW" d="M146,32 C149,29 153,30 153,34 M162,30 C165,27 170,28 170,32 M174,36 C177,34 180,37 179,40"/>${eyes(false)}${nose}
  <path class="sK" d="M152,72 C156,76 164,76 168,72"/>${neck}</g>`;
export function firstYear(x, y, k, flip = 1) {
  return place(x, y, k, `${beanbag}
    <g transform="translate(0,40)">
      <path class="k sN" d="M126,118 C128,110 192,110 194,118 L196,134 L124,134 Z"/><path class="hl sN" d="M160,116 L160,134 M134,124 C146,120 152,124 158,128 M186,124 C174,120 168,124 162,128"/>
      ${shoe(136, 130)}<path class="k sW" d="M184,130 L166,130 C162,130 162,135 166,135 L184,135 Z"/>
      <path class="k sB" d="M132,94 C138,87 148,85 160,85 C172,85 182,87 188,94 L190,128 L130,128 Z"/><path class="sB" d="M146,86 C148,96 172,96 174,86"/>
      <path class="sA" d="M140,88 C140,100 180,100 180,88"/><rect class="k sA" x="135" y="86" width="7" height="9" rx="3"/><rect class="k sA" x="178" y="86" width="7" height="9" rx="3"/>
      <path class="k sM" d="M134,104 L186,104 L182,118 L138,118 Z"/><path class="k sW" d="M138,104 L182,104 L186,84 L134,84 Z" transform="translate(0,-2)"/>
      <path class="sB" d="M132,98 L128,112 L138,112 M188,98 L192,112 L182,112"/>
      ${firstHead()}</g>`, flip);
}

/* ---- at night: a postdoc asleep on the beanbag, glasses pushed up, Z Z Z ---- */
export function sleeper(x, y, k) {
  return place(x, y, k, `${beanbag}
    <g transform="translate(0,46) rotate(-14 160 120)">
      <path class="k sN" d="M136,118 L112,124 L110,132 L140,130 Z M184,118 L208,124 L210,132 L180,130 Z"/>${shoe(96, 126)}${shoe(206, 126)}
      <path class="k sW" d="M133,92 C139,87 148,85 154,86 L160,95 L166,86 C172,85 181,87 187,92 L189,128 L131,128 Z"/><path class="sA" d="M151,88 L157,112 M169,88 L163,112"/>
      <path class="sW" d="M134,96 L132,120 L150,124 M186,96 L188,120 L170,124"/>
      ${postdocHead(true).replace('d="M144,55 L156,55 L156,63 L144,63 Z M164,55 L176,55 L176,63 L164,63 Z M156,58 L164,58"', 'd="M144,40 L156,40 L156,47 L144,47 Z M164,40 L176,40 L176,47 L164,47 Z M156,43 L164,43"')}</g>
    ${seg("Z", 198, 64, 10, "sM", 1)}${seg("Z", 212, 46, 8, "sM", .9)}${seg("Z", 224, 32, 6, "sM", .8)}`);
}
