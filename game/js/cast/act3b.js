// ACT III cast, part B: Dr. Rex Jected, Dana Outlier, Preston standing (the hallway).
// Same sheet coordinates as figures.js: feet at about (160,187), standing head about y 28–82.
// head(p): in portraits (p = true) both eyes-open/eyes-closed and mouth-a/mouth-b poses are emitted.
import { seg, arcs } from "../gfx.js";
import { AUD } from "../figures.js";

const eyes = (p, a, b, r = 1.6) => p
  ? `<g class="eyes-open"><circle class="fW" cx="${a[0]}" cy="${a[1]}" r="${r}"/><circle class="fW" cx="${b[0]}" cy="${b[1]}" r="${r}"/></g>
     <g class="eyes-closed"><path class="sW" d="M${a[0] - 3},${a[1] + .5} L${a[0] + 3},${a[1] + .5} M${b[0] - 3},${b[1] + .5} L${b[0] + 3},${b[1] + .5}"/></g>`
  : `<circle class="fW" cx="${a[0]}" cy="${a[1]}" r="${r}"/><circle class="fW" cx="${b[0]}" cy="${b[1]}" r="${r}"/>`;
const mouth = (p, a, b) => p ? `<g class="mouth-a">${a}</g><g class="mouth-b">${b}</g>` : a;
const jaw = `<path class="k sK" d="M140,52 C139,71 149,81 161,81 C173,81 182,71 181,52"/>`;
const ears = `<path class="sK" d="M140,56 C134,55 134,65 140,66 M181,56 C187,55 187,65 181,66"/>`;
const neck = `<path class="sK" d="M154,80 L154,87 M167,80 L167,87"/>`;
const nose = `<path class="sK" d="M160,60 C157,66 160,68 163,67"/>`;
const shoe = (x, y, c = "sW") => `<path class="k ${c}" d="M${x},${y} L${x + 18},${y} C${x + 22},${y} ${x + 22},${y + 5} ${x + 18},${y + 5} L${x},${y + 5} Z"/>`;
// place a sheet-coordinate drawing so its feet land on (x, y) at depth scale k
const place = (x, y, k, inner, flip = 1) => { const q = k * AUD;
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(flip * q).toFixed(3)},${q.toFixed(3)}) translate(-160,-187)">${inner}</g>`; };

/* ---- Dr. Rex Jected: postdoc, year 9. Receding gray hair, stubble, bags, a loosened tie, a lanyard badge "9", an empty mug. ---- */
export function rexHead(p = false) {
  return `<g class="hd">${ears}${jaw}
    <path class="k sM" d="M137,58 C133,40 144,30 160,30 C176,30 187,40 183,58 C181,50 179,45 175,43 C171,46 167,41 162,44 C157,40 152,45 147,42 C142,45 139,50 137,58 Z"/>
    <path class="hl sM" d="M150,34 C154,31 158,31 161,33 M166,32 C170,32 174,34 176,37 M158,30 L156,25 L161,29"/>
    <path class="sM" d="M145,53.5 L156,51.5 M165,51.5 L176,53.5"/>
    ${p ? `<g class="eyes-open"><path class="sW" d="M147.5,57 L155.5,57 M165.5,57 L173.5,57"/><circle class="fW" cx="151.5" cy="58.6" r="1.3"/><circle class="fW" cx="169.5" cy="58.6" r="1.3"/></g>
      <g class="eyes-closed"><path class="sW" d="M147.5,58.5 L155.5,58.5 M165.5,58.5 L173.5,58.5"/></g>`
      : `<path class="sW" d="M147.5,57 L155.5,57 M165.5,57 L173.5,57"/><circle class="fW" cx="151.5" cy="58.6" r="1.3"/><circle class="fW" cx="169.5" cy="58.6" r="1.3"/>`}
    <path class="hl sK" d="M147,62 C150,64.5 154,64.5 156,62.5 M165,62.5 C167,64.5 171,64.5 174,62 M148,65 C151,67 154,66.5 155,65.5 M166,65.5 C167,66.5 170,67 173,65"/>
    ${nose}
    <path class="hl sM dash" d="M143,67 C146,77 153,80.5 160.5,80.5 C168,80.5 175,77 178,67"/><path class="hl sM dash" d="M151,77 C155,78.5 166,78.5 170,77"/>
    ${mouth(p, `<path class="sK" d="M154,73.5 C158,72.5 163,72.5 167,75"/>`, `<path class="k sK" d="M154,73 C158,72 163,72 167,74 C165,77.5 156,77.5 154,73 Z"/>`)}${neck}</g>`;
}
const rexShirt = `
  <path class="k sW" d="M133,92 C139,87 148,85 154,86 L160,95 L166,86 C172,85 181,87 187,92 L190,131 L178,133 L170,130 L160,132 L130,131 Z"/>
  <path class="sW" d="M154,86 L150,93 L157,96 M166,86 L170,93 L163,96"/>
  <path class="hl sW" d="M140,104 C143,108 142,114 140,118 M182,100 C179,106 181,112 184,116 M146,124 L152,126"/>
  <path class="k sM" d="M157.5,97 L162.5,97 L161.5,101 L158.5,101 Z"/><path class="sM" d="M159,101 L156,119 L159,123 L162,118 L161,101"/>
  <path class="sB" d="M150,88 L155,112 M170,88 L163,112"/>
  <rect class="k sA" x="152" y="111" width="13" height="16"/>${seg("9", 156.3, 114, 9, "sA", 1.1)}`;
export const rexBust = () => rexShirt + rexHead(true);
// standing lean: ankles crossed, one hand in a pocket, the empty mug at his chest
export function rexStanding(x, y, k, flip = 1) {
  return place(x, y, k, `
    <path class="k sM" d="M136,130 L158,180 L174,180 L158,130 Z"/><path class="k sM" d="M162,130 L146,180 L162,180 L186,130 Z"/>
    <path class="hl sM" d="M150,146 L162,174 M174,146 L156,174"/>${shoe(142, 180, "sW")}${shoe(160, 182, "sW")}
    ${rexShirt}
    <path class="sW" d="M134,94 L129,118 L139,127"/><path class="hl sW" d="M130,112 L135,114"/>
    <path class="sW" d="M186,94 L193,114 L178,114"/><circle class="sK" cx="175" cy="113" r="3"/>
    <path class="k sW" d="M164,102 L175,102 L174,117 L165,117 Z"/><path class="sW" d="M164,105 C159,106 159,113 165,113"/><path class="hl sM" d="M166,104 L173,104"/>
    ${rexHead()}`, flip);
}

/* ---- Dana Outlier: Preston's labmate. Dark ponytail with one strand standing straight up, a brass rain jacket, a messenger bag
        with a bike helmet clipped to it, cool sneakers. ---- */
export function danaHead(p = false) {
  return `<g class="hd"><path class="k sW" d="M181,44 C192,44 198,56 195,72 C193,66 189,59 183,55 Z"/><path class="hl sW" d="M186,50 C190,56 192,62 193,67"/>
    ${ears}${jaw}
    <path class="k sW" d="M137,58 C133,38 146,28 160,28 C175,28 187,38 183,58 C180,49 173,43 166,42 C163,45 156,44 154,42 C147,43 140,49 137,58 Z"/>
    <path class="hl sW" d="M148,34 C153,31 158,31 160,33 M166,31 C172,32 177,35 179,40"/>
    <path class="sW" d="M163,29 L164,11"/>
    <path class="sW" d="M146,50.5 C149,48 153,48 156,50 M165,52 L175,52.5"/>
    ${eyes(p, [151, 57.5], [170, 58])}${nose}
    ${mouth(p, `<path class="sK" d="M154,74 C158,74 163,73.5 167,72"/>`, `<path class="k sK" d="M154,73 C158,72 163,72 167,72 C165,77 156,77 154,73 Z"/>`)}${neck}</g>`;
}
const danaJacket = `
  <path class="k sA" d="M132,94 C137,88 146,86 153,86 L160,90 L167,86 C174,86 183,88 188,94 L191,134 L129,134 Z"/>
  <path class="sA" d="M146,86 C147,80 173,80 174,86 M153,86 C155,92 165,92 167,86"/><path class="hl sA" d="M160,91 L160,134 M136,126 L184,126"/>
  <path class="sM" d="M150,88 L186,128"/><path class="hl sM" d="M154,88 L188,124"/>`;
const danaHelmet = (x, y) => `<path class="k sB" d="M${x},${y} C${x},${y - 14} ${x + 22},${y - 14} ${x + 22},${y} Z"/>
  <path class="hl sB" d="M${x + 5},${y - 1} L${x + 7},${y - 9} M${x + 11},${y - 1} L${x + 11},${y - 10} M${x + 17},${y - 1} L${x + 15},${y - 9}"/>`;
export const danaBust = () => `${danaJacket}<path class="sM" d="M186,128 L194,132"/>${danaHelmet(186, 140)}` + danaHead(true);
export function danaStanding(x, y, k, flip = 1) {
  return place(x, y, k, `
    <path class="k sM" d="M136,132 L139,182 L156,182 L159,140 L161,140 L164,182 L181,182 L184,132 Z"/><path class="hl sM" d="M148,144 L149,178 M172,144 L171,178"/>
    ${shoe(138, 182, "sB")}${shoe(163, 182, "sB")}<path class="hl sW" d="M140,185 L156,185 M165,185 L181,185"/>
    ${danaJacket}
    <rect class="k sM" x="180" y="122" width="22" height="18"/><path class="hl sM" d="M180,127 L202,127"/>
    <path class="sM" d="M196,140 L198,146"/>${danaHelmet(187, 158)}
    <path class="sA" d="M133,96 L127,122 L133,132"/><circle class="sK" cx="134" cy="135" r="3"/>
    <path class="sA" d="M187,96 L190,116 L182,124"/><circle class="sK" cx="180" cy="126" r="3"/>
    ${danaHead()}`, flip);
}

/* ---- Preston, standing: same head as his portrait and seminar bust. Blazer SIGNAL, hair BRASS, earbuds ON.
        Wrap the result in <g class="pt" id="preston"> so the engine's blank-out (normal-only / blank-only) works. ---- */
function prestonHead() {
  return `<g class="hd"><path class="sK" d="M152,84 L152,92 M168,84 L168,92"/>
    <path class="k sK" d="M132,50 C131,72 145,86 160,86 C175,86 189,72 188,50"/>
    <path class="sK" d="M133,56 C127,55 127,66 133,66 M187,56 C193,55 193,66 187,66"/>
    <path class="k sA" d="M129,56 C124,34 138,19 158,17 C179,15 196,26 193,46 C192,50 190,54 188,56 C184,45 176,41 167,43 C173,36 168,30 159,33 C148,37 139,45 129,56 Z"/>
    <path class="sA" d="M141,30 C151,23 166,21 179,25 M137,42 C143,37 150,34 156,33"/>
    <path class="sK" d="M160,61 C157,68 160,70 163,69"/>
    <g class="normal-only">
      <path class="k sW" d="M143,60 C146,56 152,56 156,60 C152,64 147,64 143,60 Z"/><circle class="fB" cx="150.5" cy="60" r="2"/>
      <path class="k sW" d="M164,60 C168,56 174,56 177,60 C173,64 168,64 164,60 Z"/><circle class="fB" cx="171.5" cy="60" r="2"/>
      <path class="sA" d="M142,53 C146,49 152,49 157,51 M163,51 C168,49 174,49 178,53"/>
      <path class="k sW" d="M146,72 C152,81 168,81 174,72 C166,75 154,75 146,72 Z"/>
      <circle class="fG" cx="129.5" cy="62" r="2.4"/><circle class="fG" cx="190.5" cy="62" r="2.4"/></g>
    <g class="blank-only">
      <circle class="k sW" cx="150" cy="60" r="4.2"/><circle class="fW" cx="150" cy="60" r=".9"/><circle class="k sW" cx="170" cy="60" r="4.2"/><circle class="fW" cx="170" cy="60" r=".9"/>
      <path class="sA" d="M143,52 L157,52 M163,52 L177,52"/><path class="sK" d="M150,75 L170,75"/>
      <circle class="fG" cx="129.5" cy="62" r="3.2"/><circle class="fG" cx="190.5" cy="62" r="3.2"/>${arcs(124, 62, -1, "sG")}${arcs(196, 62, 1, "sG")}</g></g>`;
}
export function prestonStanding(x, y, k, flip = 1) {
  return place(x, y, k, `
    <path class="k sM" d="M135,134 L138,182 L156,182 L159,142 L161,142 L164,182 L182,182 L185,134 Z"/><path class="hl sM" d="M147,146 L148,178 M173,146 L172,178"/>
    ${shoe(137, 182)}${shoe(164, 182)}<path class="hl sW" d="M146,183 L150,183 M173,183 L177,183"/>
    <path class="k sR" d="M131,100 C135,94 144,92 151,92 L160,106 L169,92 C176,92 185,94 189,100 L192,138 L128,138 Z"/>
    <path class="sR" d="M151,92 L155,116 L160,106 M169,92 L165,116 L160,106"/><path class="sW" d="M154,94 L160,104 L166,94"/>
    <path class="hl sW" d="M174,108 L182,106 L181,111 Z"/><circle class="hl sR" cx="160" cy="124" r="1.4"/>
    <path class="sR" d="M132,102 L127,126 L131,136"/><circle class="sK" cx="132" cy="139" r="3"/>
    <g class="pz on" data-g="parm" data-i="0"><path class="sR" d="M188,102 L198,118 L212,110"/><path class="sK" d="M213,109 L220,104 M214,111 L221,108 M214,113 L220,113"/></g>
    <g class="pz" data-g="parm" data-i="1"><path class="sR" d="M188,102 L200,96 L210,80"/><circle class="sK" cx="211" cy="77" r="3"/><path class="sK" d="M212,74 L214,67"/></g>
    ${prestonHead()}`, flip);
}

/* ---- talking portraits (same shape as PORTRAIT in portraits.js) ---- */
export const PORTRAITS_B = {
  rex: { name: "DR. REX JECTED", chip: "fM", vb: "112 14 96 118", svg: rexBust },
  dana: { name: "DANA OUTLIER", chip: "fA", vb: "112 6 96 118", svg: danaBust },
};
