// Characters in the scene. Drawn in "sheet" coordinates: feet at about (160,187), about 170 units tall.
// Walking figures carry three pose groups: .ap0 (stand), .ap1 and .ap2 (walk). The engine shows one at a time.
import { seg, arcs, star4 } from "./gfx.js";

export const AUD = 0.72;   // scale factor shared by walking figures and everything sized against them

const shoe = (x, y) => `<path class="k sW" d="M${x},${y} L${x + 18},${y} C${x + 22},${y} ${x + 22},${y + 5} ${x + 18},${y + 5} L${x},${y + 5} Z"/>`;

export function nellFigure() {
  const head = `
    <path class="k sK" d="M139,54 C138,72 149,82 161,82 C174,82 183,72 183,56"/>
    <path class="sK" d="M140,58 C134,57 133,67 140,68"/>
    <path class="k sR" d="M137,62 C133,46 139,35 150,32 C148,24 153,16 161,16 C169,16 174,23 171,32 C181,35 188,44 185,60 C181,50 172,45 163,46 C155,44 146,50 137,62 Z"/>
    <path class="sR" d="M156,23 C158,20 164,20 166,25 M150,37 C154,40 157,43 159,46 M138,61 C135,67 136,74 139,79 M184,61 C187,67 186,74 183,79"/><path class="sA" d="M145,13 L177,28"/><path class="sK" d="M145,13 L142,11.5"/>
    <rect class="sW" x="146.5" y="56" width="13" height="10" rx="3"/><rect class="sW" x="166" y="56" width="13" height="10" rx="3"/>
    <path class="sW" d="M159.5,60 L166,60 M146.5,59 L141,58"/>
    <circle class="fW" cx="155" cy="61.5" r="1.6"/><circle class="fW" cx="174.5" cy="61.5" r="1.6"/>
    <path class="sK" d="M168,66 C165,71 168,73 171,72 M162,76 C166,74 170,75 173,77"/>
    <path class="sK" d="M154,80 L154,87 M167,80 L167,87"/>`;
  const torso = `
    <path class="k sG" d="M136,92 C140,87 148,85 153,86 L160,92 L167,86 C172,85 180,87 184,92 L187,128 L133,128 Z"/>
    <path class="sG" d="M153,86 C156,91 164,91 167,86"/><circle class="sG" cx="170" cy="106" r="5"/><path class="sG" d="M168,104 L172,108"/>
    <path class="hl sG" d="M142,100 C145,108 145,117 142,125 M180,98 C178,106 179,115 182,123"/>`;
  const stand = `<g class="ap0">
    <path class="k sB" d="M134,128 L137,182 L156,182 L159,136 L161,136 L164,182 L183,182 L186,128 Z"/>${shoe(136, 182)}${shoe(164, 182)}
    <path class="hl sB" d="M147,140 L148,178 M173,140 L172,178"/>
    <path class="sG" d="M136,93 L128,114"/><path class="sK" d="M128,114 L125,124"/><circle class="sK" cx="124.5" cy="127" r="3"/>
    <path class="sG" d="M184,93 L192,114"/><path class="sK" d="M192,114 L195,124"/><circle class="sK" cx="195.5" cy="127" r="3"/></g>`;
  const walkA = `<g class="ap1">
    <path class="k sB" d="M137,128 L120,176 L137,182 L158,134 Z"/><path class="k sB" d="M162,132 L178,182 L196,178 L184,128 Z"/>${shoe(118, 177)}${shoe(180, 179)}
    <path class="sG" d="M136,93 L142,114"/><path class="sK" d="M142,114 L148,123"/><circle class="sK" cx="150" cy="126" r="3"/>
    <path class="sG" d="M184,93 L178,112"/><path class="sK" d="M178,112 L170,120"/><circle class="sK" cx="168" cy="123" r="3"/></g>`;
  const walkB = `<g class="ap2">
    <path class="k sB" d="M134,128 L146,180 L162,182 L157,130 Z"/><path class="k sB" d="M163,130 L160,182 L177,180 L186,128 Z"/>${shoe(146, 181)}${shoe(160, 181)}
    <path class="sG" d="M136,93 L124,110"/><path class="sK" d="M124,110 L116,118"/><circle class="sK" cx="114" cy="121" r="3"/>
    <path class="sG" d="M184,93 L196,110"/><path class="sK" d="M196,110 L204,117"/><circle class="sK" cx="206" cy="120" r="3"/></g>`;
  return stand + walkA + walkB + torso + head;
}

export function gusFigure() {
  // Gus Ian: Nell's labmate. Curly hair, mustache, headphones round the neck, cardigan, laptop under his arm.
  const legs = (a, b) => `<path class="k sM" d="${a}"/><path class="k sM" d="${b}"/>`;
  const stand = `<g class="ap0"><path class="k sM" d="M134,128 L137,182 L156,182 L159,136 L161,136 L164,182 L183,182 L186,128 Z"/>${shoe(136, 182)}${shoe(164, 182)}
    <path class="hl sM" d="M147,140 L148,178 M173,140 L172,178"/>
    <path class="sV" d="M184,92 L190,114"/><circle class="sK" cx="191" cy="118" r="3"/></g>`;
  const walkA = `<g class="ap1">${legs("M137,128 L120,176 L137,182 L158,134 Z", "M162,132 L178,182 L196,178 L184,128 Z")}${shoe(118, 177)}${shoe(180, 179)}
    <path class="sV" d="M184,92 L178,112"/><circle class="sK" cx="176" cy="116" r="3"/></g>`;
  const walkB = `<g class="ap2">${legs("M134,128 L146,180 L162,182 L157,130 Z", "M163,130 L160,182 L177,180 L186,128 Z")}${shoe(146, 181)}${shoe(160, 181)}
    <path class="sV" d="M184,92 L196,110"/><circle class="sK" cx="198" cy="114" r="3"/></g>`;
  const body = `
    <path class="k sV" d="M135,88 C140,82 150,81 160,84 C170,81 180,82 185,88 L188,130 L132,130 Z"/>
    <path class="sW" d="M151,84 L160,100 L169,84"/><path class="hl sV" d="M153,86 L156,130 M167,86 L164,130"/>
    ${[108, 118].map(y => `<circle class="hl sV" cx="157" cy="${y}" r="1.4"/>`).join("")}
    <path class="sV" d="M136,92 L128,112"/><circle class="sK" cx="127" cy="116" r="3"/>
    <path class="k sW" d="M114,104 L136,98 L140,120 L118,126 Z"/><path class="hl sW" d="M118,108 L134,104"/>
    <path class="sW" d="M143,84 C143,93 177,93 177,84"/><ellipse class="k sW" cx="141" cy="83" rx="4" ry="5.5"/><ellipse class="k sW" cx="179" cy="83" rx="4" ry="5.5"/>
    <path class="sK" d="M154,76 L154,82 M166,76 L166,82"/>
    <path class="k sK" d="M137,47 C136,66 148,77 160,77 C172,77 184,66 183,47"/>
    <path class="sW" d="M137,50 C134,54 135,60 138,62 M183,50 C186,54 185,60 182,62"/>
    <path class="k sW" d="M136,50 C133,32 146,21 160,21 C175,21 187,32 184,50 C180,42 172,38 160,39 C150,38 141,42 136,50 Z"/>
    <path class="hl sW" d="M144,28 C147,25 151,26 151,30 M156,24 C159,21 164,22 164,26 M168,25 C172,23 176,26 175,30 M140,38 C143,35 147,37 146,40 M174,35 C177,34 180,37 178,40"/>
    <path class="sW" d="M146,50 L154,49 M166,49 L174,50"/><circle class="fW" cx="150.5" cy="55" r="1.5"/><circle class="fW" cx="169.5" cy="55" r="1.5"/>
    <path class="sK" d="M160,56 C156,63 159,66 164,64"/>
    <path class="k sW" d="M144,68 C150,62 157,65 160,67 C163,65 170,62 176,68 C170,72 163,70 160,70 C157,70 150,72 144,68 Z"/>`;
  return stand + walkA + walkB + body;
}

// Brett: the office-hours undergrad. Hoodie, fringe, backpack strap, phone. Two idle poses.
export function brettFigure() {
  return `
    <path class="k sM" d="M136,128 L138,182 L157,182 L159,138 L161,138 L163,182 L182,182 L184,128 Z"/>${shoe(138, 182)}${shoe(163, 182)}
    <path class="hl sM" d="M148,140 L149,178 M172,140 L171,178"/>
    <path class="k sB" d="M134,90 C140,84 150,83 160,86 C170,83 180,84 186,90 L190,130 L130,130 Z"/>
    <path class="sB" d="M142,86 C146,96 174,96 178,86"/><path class="hl sB" d="M154,94 L153,106 M166,94 L167,106 M140,118 L180,118"/>
    <path class="sV" d="M180,88 L168,128"/><path class="hl sV" d="M184,94 L186,128"/>
    <g class="pz on" data-g="brett" data-i="0">
      <path class="sB" d="M136,92 L130,116"/><circle class="sK" cx="129" cy="120" r="3"/>
      <path class="sB" d="M184,92 L178,108 L168,110"/><rect class="k sW" x="160" y="104" width="8" height="12" rx="1.5"/><circle class="fB" cx="164" cy="110" r="1"/>
    </g>
    <g class="pz" data-g="brett" data-i="1">
      <path class="sB" d="M136,92 L126,100 L132,82"/><circle class="sK" cx="133" cy="79" r="3"/>${arcs(124, 70, -1, "sA", 2, .6)}
      <path class="sB" d="M184,92 L178,108 L168,110"/><rect class="k sW" x="160" y="104" width="8" height="12" rx="1.5"/><circle class="fB" cx="164" cy="110" r="1"/>
    </g>
    <path class="sK" d="M155,80 L155,87 M166,80 L166,87"/>
    <path class="k sK" d="M140,54 C139,72 149,82 161,82 C173,82 182,72 181,56"/>
    <path class="sK" d="M140,58 C134,57 134,67 140,68 M181,58 C187,57 187,67 181,68"/>
    <path class="k sA" d="M137,58 C134,40 146,30 160,30 C174,30 186,40 183,58 C180,50 176,46 170,48 L166,42 L160,49 L154,42 L148,49 C143,48 139,52 137,58 Z"/>
    <circle class="fW" cx="152" cy="61" r="1.7"/><circle class="fW" cx="170" cy="61" r="1.7"/>
    <path class="sA" d="M147,55 L156,54 M166,54 L175,55"/>
    <path class="sK" d="M161,63 C158,69 161,71 164,70 M154,75 C158,78 164,78 168,75"/>`;
}

export function prestonBust() {
  const base = `
    <path class="k sR" d="M116,130 C116,106 126,95 150,92 L160,106 L170,92 C194,95 204,106 204,130 Z"/>
    <path class="sR" d="M150,92 L155,114 M170,92 L165,114"/><path class="sW" d="M154,94 L160,104 L166,94"/>
    <path class="sK" d="M152,84 L152,92 M168,84 L168,92"/>
    <path class="k sK" d="M132,50 C131,72 145,86 160,86 C175,86 189,72 188,50"/>
    <path class="sK" d="M133,56 C127,55 127,66 133,66 M187,56 C193,55 193,66 187,66"/>
    <path class="k sA" d="M129,56 C124,34 138,19 158,17 C179,15 196,26 193,46 C192,50 190,54 188,56 C184,45 176,41 167,43 C173,36 168,30 159,33 C148,37 139,45 129,56 Z"/>
    <path class="sA" d="M141,30 C151,23 166,21 179,25 M137,42 C143,37 150,34 156,33"/>
    <path class="sK" d="M160,61 C157,68 160,70 163,69"/>`;
  const on = `<g class="normal-only">
    <path class="k sW" d="M143,60 C146,56 152,56 156,60 C152,64 147,64 143,60 Z"/><circle class="fB" cx="150.5" cy="60" r="2"/>
    <path class="k sW" d="M164,60 C168,56 174,56 177,60 C173,64 168,64 164,60 Z"/><circle class="fB" cx="171.5" cy="60" r="2"/>
    <path class="sA" d="M142,53 C146,49 152,49 157,51 M163,51 C168,49 174,49 178,53"/>
    <path class="k sW" d="M146,72 C152,81 168,81 174,72 C166,75 154,75 146,72 Z"/>
    <circle class="sW" cx="129.5" cy="62" r="2.5"/><circle class="sW" cx="190.5" cy="62" r="2.5"/></g>`;
  const blank = `<g class="blank-only">
    <circle class="k sW" cx="150" cy="60" r="4.2"/><circle class="fW" cx="150" cy="60" r=".9"/><circle class="k sW" cx="170" cy="60" r="4.2"/><circle class="fW" cx="170" cy="60" r=".9"/>
    <path class="sA" d="M143,52 L157,52 M163,52 L177,52"/><path class="sK" d="M150,75 L170,75"/>
    <circle class="fG" cx="129.5" cy="62" r="3"/><circle class="fG" cx="190.5" cy="62" r="3"/>${arcs(124, 62, -1, "sG")}${arcs(196, 62, 1, "sG")}</g>`;
  const armUp = `<g class="pz on" data-g="parm" data-i="0"><path class="sR" d="M200,108 L213,85"/><circle class="sK" cx="215" cy="81" r="4"/><path class="sK" d="M217,77 L221,69"/></g>`;
  const armDn = `<g class="pz" data-g="parm" data-i="1"><path class="sR" d="M201,110 L208,121"/><path class="k sK" d="M204,122 C204,118 214,118 214,122 C214,125 204,125 204,122 Z"/></g>`;
  return base + on + blank + armUp + armDn;
}

// seated, seen from behind: a head above a tall chair back
export function sitter(x, y, k, o = {}) {
  const q = k * AUD, head = o.head || "sD";
  return `<g class="${o.cls || ""}" ${o.hs ? `data-hs="${o.hs}"` : ""}>
    <circle class="k ${head}" cx="${x}" cy="${y - 84 * q}" r="${17 * q}"/>${o.extra ? o.extra(x, y, q) : ""}
    ${o.hs ? `<rect x="${x - 24 * q}" y="${y - 104 * q}" width="${48 * q}" height="${104 * q}" fill="transparent"/>` : ""}</g>`;
}
export function chairBack(x, y, k) {
  const q = k * AUD;
  return `<path class="k sD" d="M${x - 24 * q},${y - 34 * q} L${x - 24 * q},${y - 62 * q} Q${x - 24 * q},${y - 68 * q} ${x - 18 * q},${y - 68 * q} L${x + 18 * q},${y - 68 * q} Q${x + 24 * q},${y - 68 * q} ${x + 24 * q},${y - 62 * q} L${x + 24 * q},${y - 34 * q} Z"/>
    <path class="hl sD" d="M${x - 20 * q},${y - 34 * q} L${x - 21 * q},${y} M${x + 20 * q},${y - 34 * q} L${x + 21 * q},${y}"/>`;
}

// Morris, small: head and paws over a drawer edge (local origin = drawer lip centre)
export function morrisPeek(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <circle class="k sW" cx="-9" cy="-15" r="5"/><circle class="hl sK" cx="-9" cy="-15" r="2.6"/>
    <circle class="k sW" cx="9" cy="-16" r="5"/><circle class="hl sK" cx="9" cy="-16" r="2.6"/>
    <path class="k sW" d="M-12,0 C-14,-10 -8,-17 0,-17 C8,-17 13,-10 12,-4 C17,-3 20,-1 20,1 L-12,1 Z"/>
    <circle class="fK" cx="20" cy="0" r="1.4"/><circle class="fW" cx="-2" cy="-9" r="1.6"/><circle class="fW" cx="6" cy="-9" r="1.5"/>
    <circle class="fG" cx="2" cy="-16" r="1"/>
    <path class="hl sW" d="M16,-1 L24,-3 M16,1 L24,2"/><path class="sW" d="M-8,1 L-8,4 M4,1 L4,4"/></g>`;
}

/* ======================================================================
 *  ACT II CAST
 *  Heads are drawn once in sheet coordinates (standing head ≈ y 28–82) and shared
 *  with portraits.js. eyes(p)/mouth(p): in portraits (p = true) both poses are emitted.
 * ====================================================================== */
const eyes = (p, a, b, r = 1.6) => p
  ? `<g class="eyes-open"><circle class="fW" cx="${a[0]}" cy="${a[1]}" r="${r}"/><circle class="fW" cx="${b[0]}" cy="${b[1]}" r="${r}"/></g>
     <g class="eyes-closed"><path class="sW" d="M${a[0] - 3},${a[1] + .5} L${a[0] + 3},${a[1] + .5} M${b[0] - 3},${b[1] + .5} L${b[0] + 3},${b[1] + .5}"/></g>`
  : `<circle class="fW" cx="${a[0]}" cy="${a[1]}" r="${r}"/><circle class="fW" cx="${b[0]}" cy="${b[1]}" r="${r}"/>`;
const mouth = (p, a, b) => p ? `<g class="mouth-a">${a}</g><g class="mouth-b">${b}</g>` : a;
const jaw = `<path class="k sK" d="M140,52 C139,71 149,81 161,81 C173,81 182,71 181,52"/>`;
const ears = `<path class="sK" d="M140,56 C134,55 134,65 140,66 M181,56 C187,55 187,65 181,66"/>`;
const neck = `<path class="sK" d="M154,80 L154,87 M167,80 L167,87"/>`;
const nose = `<path class="sK" d="M160,60 C157,66 160,68 163,67"/>`;
// local helper: a figure shown standing still outside the engine (drop the walk poses)
export const standOnly = (svg) => svg.replace(/<g class="ap[12]">[\s\S]*?<\/g>/g, "");
const seated = (x, y, k, inner) => { const q = k * AUD; return `<g transform="translate(${(x - 160 * q).toFixed(1)},${(y - 187 * q).toFixed(1)}) scale(${q.toFixed(3)})"><g transform="translate(0,34)">${inner}</g></g>`; };

/* ---- Dr. Tess La: MRI physicist. Black bob, safety glasses up on her head, ear defenders round her neck, lab coat. ---- */
export function tessHead(p = false) {
  return `${ears}${jaw}
    <path class="k sW" d="M135,68 C129,44 140,28 160,28 C181,28 191,44 185,68 C183,58 181,50 177,45 C166,48 152,46 143,42 C139,49 137,58 135,68 Z"/>
    <path class="hl sW" d="M150,32 C146,36 144,40 143,42 M170,31 C176,36 178,41 177,45"/>
    <path class="sA" d="M145,35 L157,34 L156,40 L146,41 Z M163,34 L175,35 L174,41 L164,40 Z M157,37 L163,37"/>
    <path class="sW" d="M147,53 L156,51.5 M165,51.5 L174,53"/>
    ${eyes(p, [152, 58], [169, 58])}${nose}
    ${mouth(p, `<path class="sK" d="M154,73 L167,73"/>`, `<path class="k sK" d="M154,72 C158,71 163,71 167,72 C165,76.5 156,76.5 154,72 Z"/>`)}${neck}`;
}
const tessBody = `
  <path class="k sW" d="M130,94 C136,87 147,85 154,86 L160,100 L166,86 C173,85 184,87 190,94 L194,140 L126,140 Z"/>
  <path class="sW" d="M154,86 L150,100 L160,114 M166,86 L170,100 L160,114"/><path class="sB" d="M156,90 L160,98 L164,90"/>
  <path class="hl sW" d="M170,112 L183,112 L183,124 L170,124 Z"/><path class="sR" d="M174,106 L174,113"/>
  <path class="sB" d="M143,86 C143,97 177,97 177,86"/><ellipse class="k sB" cx="141" cy="88" rx="5" ry="7"/><ellipse class="k sB" cx="179" cy="88" rx="5" ry="7"/>`;
export const tessBust = () => tessBody + tessHead(true);
// at the console, swivelled round to face the room (guarding the calendar)
export function tessAtConsole(x, y, k) {
  return seated(x, y, k, `${tessBody}
    <path class="sW" d="M132,98 L126,124 L146,132"/><circle class="sK" cx="149" cy="133" r="3"/>
    <path class="sW" d="M188,98 L194,124 L176,132"/><circle class="sK" cx="173" cy="133" r="3"/>${tessHead()}`);
}
// seen through the window, at the magnet, arms waving (pose group "wave")
export function tessFar(x, y, k) {
  const q = k * AUD;
  return `<g transform="translate(${(x - 160 * q).toFixed(1)},${(y - 187 * q).toFixed(1)}) scale(${q.toFixed(3)})">
    <path class="k sM" d="M140,150 L142,184 L156,184 L159,156 L161,156 L164,184 L178,184 L180,150 Z"/>
    <path class="k sW" d="M130,94 C136,87 147,85 154,86 L160,100 L166,86 C173,85 184,87 190,94 L196,160 L124,160 Z"/>
    <path class="sB" d="M143,86 C143,97 177,97 177,86"/>
    <g class="pz on" data-g="wave" data-i="0"><path class="sW" d="M132,96 L116,70 M188,96 L204,70"/><circle class="sK" cx="114" cy="66" r="3.5"/><circle class="sK" cx="206" cy="66" r="3.5"/>${arcs(206, 50, 1, "sR", 2, .7)}</g>
    <g class="pz" data-g="wave" data-i="1"><path class="sW" d="M132,96 L108,92 M188,96 L212,92"/><circle class="sK" cx="104" cy="91" r="3.5"/><circle class="sK" cx="216" cy="91" r="3.5"/>${arcs(114, 74, -1, "sR", 2, .7)}</g>
    ${tessHead()}</g>`;
}

/* ---- Penny Ledger: department administrator. Silver bouffant, headset, glasses on a chain, pencil behind her ear, brass cardigan. ---- */
export function pennyHead(p = false) {
  return `${ears}${jaw}
    <path class="k sW" d="M134,62 C125,40 138,21 160,21 C183,21 195,40 186,62 C183,53 178,46 171,44 C162,40 150,42 145,46 C140,49 136,55 134,62 Z"/>
    <path class="hl sW" d="M140,34 C144,29 150,29 152,33 M156,26 C160,23 166,24 167,28 M171,30 C176,28 181,31 181,36 M146,40 C150,37 155,38 156,41"/>
    <path class="sM" d="M136,52 C133,26 187,26 184,52"/><circle class="k sM" cx="137" cy="60" r="4.5"/>
    <path class="sW" d="M136,64 C138,73 144,77 151,77"/><circle class="fW" cx="152" cy="77" r="1.6"/>
    <path class="sA" d="M182,46 L192,61"/><path class="sK" d="M192,61 L193.5,63.5"/>
    <path class="sW" d="M146,54 C149,52 153,52 156,53 M165,53 C168,52 172,52 175,54"/>
    ${eyes(p, [151, 58], [170, 58], 1.5)}
    <path class="sA" d="M145,61 L157,61 L156,66 L146,66 Z M164,61 L176,61 L175,66 L165,66 Z M157,62.5 L164,62.5"/>
    <path class="sV dash" d="M145,63 C138,76 140,90 150,98 M176,63 C183,76 181,90 171,98"/>
    <path class="sK" d="M160,64 C158,68 160,70 163,69"/>
    ${mouth(p, `<path class="sK" d="M155,74 C158,73 163,73 166,74.5"/>`, `<path class="k sK" d="M155,73 C158,72 163,72 166,73 C164,77 157,77 155,73 Z"/>`)}${neck}`;
}
const pennyBody = `
  <path class="k sA" d="M130,94 C136,87 148,85 154,86 L160,92 L166,86 C172,85 184,87 190,94 L193,140 L127,140 Z"/>
  <path class="sW" d="M152,86 C152,93 159,94 160,89 C161,94 168,93 168,86"/>
  <path class="hl sA" d="M157,94 L156,140 M163,94 L164,140"/>${[104, 116, 128].map(y => `<circle class="hl sA" cx="160" cy="${y}" r="1.4"/>`).join("")}`;
export const pennyBust = () => pennyBody + pennyHead(true);
// typing: hands swap between two poses (pose group "type")
export function pennyAtDesk(x, y, k) {
  return seated(x, y, k, `${pennyBody}
    <g class="pz on" data-g="type" data-i="0"><path class="sA" d="M132,98 L130,124 L148,134"/><circle class="sK" cx="151" cy="135" r="3"/><path class="sA" d="M188,98 L190,124 L176,130"/><circle class="sK" cx="173" cy="131" r="3"/></g>
    <g class="pz" data-g="type" data-i="1"><path class="sA" d="M132,98 L130,124 L144,130"/><circle class="sK" cx="147" cy="131" r="3"/><path class="sA" d="M188,98 L190,124 L172,134"/><circle class="sK" cx="169" cy="135" r="3"/></g>
    ${pennyHead()}`);
}

/* ---- Ethel Bord: Research Integrity Officer. Tall bun, half-moon glasses, a lanyard of badges, gray blazer with shoulder pads. ---- */
export function ethelHead(p = false) {
  return `${ears}${jaw}
    <path class="k sW" d="M150,32 C148,15 153,7 160,7 C167,7 172,15 170,32"/><path class="hl sW" d="M151,24 C156,21 164,21 169,24 M152,15 C156,13 164,13 168,15"/>
    <path class="k sW" d="M138,58 C134,40 144,30 160,30 C176,30 186,40 182,58 C178,46 170,42 160,42 C150,42 142,46 138,58 Z"/>
    <path class="hl sW" d="M146,38 C151,35 156,34 160,34 M165,34 C171,35 176,38 178,42"/>
    <path class="sW" d="M146,52 L155,53 M166,53 L175,52"/>
    ${eyes(p, [151, 57], [170, 57], 1.4)}
    <path class="sA" d="M145,61 C145,66 155,66 156,61 Z M165,61 C166,66 176,66 176,61 Z M156,61.5 L165,61.5"/>
    <path class="sK" d="M160,63 C158,68 160,70 163,69"/>
    ${mouth(p, `<path class="sK" d="M156,75 L165,75 M156,73.5 L156,75 M165,73.5 L165,75"/>`, `<path class="k sK" d="M156,74 C158,73 163,73 165,74 C164,77 157,77 156,74 Z"/>`)}${neck}`;
}
const ethelBody = `
  <path class="k sM" d="M124,98 C127,88 145,85 152,86 L160,98 L168,86 C175,85 193,88 196,98 L195,140 L125,140 Z"/>
  <path class="sM" d="M152,86 L148,104 L160,118 M168,86 L172,104 L160,118"/><path class="sW" d="M154,88 L160,96 L166,88"/>
  <path class="sB" d="M150,88 L156,114 M170,88 L164,114"/>
  <rect class="k sB" x="151" y="114" width="14" height="17"/><path class="hl sB" d="M154,119 L162,119 M154,123 L160,123"/>
  <g transform="rotate(14 168 118)"><rect class="k sB" x="161" y="111" width="12" height="15"/><circle class="hl sB" cx="167" cy="116" r="2.5"/></g>`;
export const ethelBust = () => ethelBody + ethelHead(true);
export function ethelAtDesk(x, y, k) {
  return seated(x, y, k, `${ethelBody}
    <path class="sM" d="M126,100 L130,124 L148,130"/><circle class="sK" cx="151" cy="131" r="3"/>
    <path class="sM" d="M194,100 L190,124 L172,130"/><circle class="sK" cx="169" cy="131" r="3"/>${ethelHead()}`);
}

/* ---- Cody Credit: undergrad RA. Backwards red cap, brass PSY 101 tee, the sign-in clipboard on his lap. ---- */
export function codyHead(p = false) {
  return `${ears}${jaw}
    <path class="k sR" d="M137,54 C135,35 147,26 160,26 C173,26 185,35 183,54 C177,47 169,45 160,45 C151,45 143,47 137,54 Z"/>
    <path class="hl sR" d="M151,45 C154,41 166,41 169,45 M160,26 L160,45"/><circle class="fR" cx="160" cy="27" r="1.4"/>
    <path class="sW" d="M153,46 L155,42 L157,46 L160,41 L162,46 L165,42 L167,46"/>
    <path class="sW" d="M146,52 C149,50 153,50 156,51 M165,51 C168,50 172,50 175,52"/>
    ${p ? `<g class="eyes-open"><circle class="k sW" cx="151" cy="58" r="3"/><circle class="k sW" cx="170" cy="58" r="3"/><circle class="fW" cx="151.5" cy="58.5" r="1.3"/><circle class="fW" cx="170.5" cy="58.5" r="1.3"/></g>
      <g class="eyes-closed"><path class="sW" d="M147,58.5 L155,58.5 M166,58.5 L174,58.5"/></g>`
      : `<circle class="k sW" cx="151" cy="58" r="3"/><circle class="k sW" cx="170" cy="58" r="3"/><circle class="fW" cx="151.5" cy="58.5" r="1.3"/><circle class="fW" cx="170.5" cy="58.5" r="1.3"/>`}
    ${nose}<path class="hl sK" d="M146,66 L148,67 M150,67 L152,68 M171,67 L173,66 M175,67 L177,66"/>
    ${mouth(p, `<path class="sK" d="M153,73 C157,77 164,77 168,73"/>`, `<path class="k sK" d="M153,72 C157,71 164,71 168,72 C166,78 155,78 153,72 Z"/>`)}${neck}`;
}
const codyBody = `
  <path class="k sA" d="M131,94 C137,88 148,86 153,87 C156,92 165,92 168,87 C173,86 184,88 190,94 L192,140 L128,140 Z"/>
  <path class="sA" d="M153,87 C156,92 165,92 168,87"/>${seg("PSY 101", 147, 104, 4.4, "sA", .8)}`;
export const codyBust = () => codyBody + codyHead(true);
export function codySeated(x, y, k, hasClipboard = true) {
  const chair = `<path class="hl sD" d="M120,150 L200,150 M124,150 L122,187 M196,150 L198,187 M118,96 L118,150 M202,96 L202,150 M118,96 L202,96"/>`;
  const legs = `<path class="k sM" d="M134,140 L132,150 L150,150 L150,184 L162,184 L162,148 L164,148 L164,184 L176,184 L176,150 L186,150 L186,140 Z"/>${shoe(140, 184)}${shoe(162, 184)}`;
  const board = hasClipboard
    ? `<rect class="k sW" x="142" y="118" width="38" height="28"/><path class="sA" d="M154,116 L168,116 L168,121 L154,121 Z"/><path class="hl sW" d="M147,127 L175,127 M147,132 L175,132 M147,137 L169,137"/>
       <path class="sA" d="M131,98 L134,124 L144,128"/><circle class="sK" cx="146" cy="129" r="3"/><path class="sA" d="M189,98 L186,124 L178,128"/><circle class="sK" cx="176" cy="129" r="3"/>`
    : `<path class="sA" d="M131,98 L132,126 L150,136"/><circle class="sK" cx="153" cy="137" r="3"/><path class="sA" d="M189,98 L188,126 L170,136"/><circle class="sK" cx="167" cy="137" r="3"/>`;
  const q = k * AUD;
  return `<g transform="translate(${(x - 160 * q).toFixed(1)},${(y - 187 * q).toFixed(1)}) scale(${q.toFixed(3)})">
    ${chair}${legs}<g transform="translate(0,22)">${codyBody}${board}${codyHead()}</g></g>`;
}

/* ---- Det. Sgt. Enn Small: campus police detective. Brass trench coat, short hair, notebook. ---- */
export function smallHead(p = false) {
  return `${ears}${jaw}
    <path class="k sW" d="M137,56 C134,38 145,30 160,30 C176,30 187,38 183,56 C180,48 174,44 166,45 C158,42 148,44 143,48 C140,50 138,53 137,56 Z"/>
    <path class="hl sW" d="M146,37 C152,33 160,33 166,35"/>
    <path class="sW" d="M146,53 L155,52 M166,52 L175,53"/>
    ${eyes(p, [151, 58], [170, 58], 1.5)}${nose}<path class="hl sK" d="M147,61.5 L154,61.5 M167,61.5 L174,61.5"/>
    ${mouth(p, `<path class="sK" d="M154,74 L167,74"/>`, `<path class="k sK" d="M154,73 C158,72 163,72 167,73 C165,77 156,77 154,73 Z"/>`)}${neck}`;
}
const smallCoat = `
  <path class="k sA" d="M130,94 C136,87 147,85 154,86 L160,96 L166,86 C173,85 184,87 190,94 L194,160 L126,160 Z"/>
  <path class="sA" d="M146,86 L152,104 L160,96 M174,86 L168,104 L160,96 M150,86 L144,90 M170,86 L176,90"/><path class="sR" d="M160,96 L158,112 L160,118 L162,112 Z"/>
  <path class="sA" d="M127,128 L193,128 M160,128 L160,160"/><rect class="hl sA" x="154" y="125" width="12" height="6"/>`;
export const smallBust = () => smallCoat + smallHead(true);
export function smallFigure() {
  return `<g class="ap0">
    <path class="k sM" d="M138,156 L140,182 L157,182 L158,160 L162,160 L163,182 L180,182 L182,156 Z"/>${shoe(138, 182)}${shoe(163, 182)}
    ${smallCoat}
    <path class="sA" d="M132,96 L126,124 L132,138"/><circle class="sK" cx="133" cy="141" r="3"/>
    <path class="sA" d="M188,96 L190,116 L176,122"/><rect class="k sW" x="166" y="114" width="12" height="16"/><path class="hl sW" d="M169,119 L176,119 M169,123 L176,123"/><circle class="sK" cx="176" cy="122" r="3"/>
    ${star4(180, 136, 4, "sA")}${smallHead()}</g>`;
}

/* ---- Morris, walking: side view, facing right, ~44 units long, feet on y 187 ---- */
export function morrisFigure() {
  const body = `
    <path class="k sW" d="M140,186 C136,176 144,166 158,165 C170,164 178,168 183,174 C190,175 196,179 198,184 C196,186 190,186 188,186 Z"/>
    <circle class="k sW" cx="178" cy="166" r="5.5"/><circle class="hl sK" cx="178" cy="166" r="2.8"/>
    <circle class="fW" cx="187" cy="176" r="1.5"/><circle class="fK" cx="198" cy="183.5" r="1.6"/>
    <path class="hl sW" d="M193,181 L203,178 M193,183 L204,184"/>
    <path class="hl sW" d="M165,166 L171,165 M167,163 L167,168 M170,163 L170,167"/><circle class="fG" cx="173" cy="165.5" r="1.4"/>`;
  return `<g class="ap0"><path class="sK" d="M140,182 C126,180 118,172 112,176"/><path class="sK" d="M148,186 L148,187 M180,186 L181,187"/></g>
    <g class="ap1"><path class="sK" d="M140,182 C126,182 116,178 110,182"/><path class="sK" d="M146,185 L142,187 M152,185 L156,187 M178,185 L174,187 M184,185 L188,187"/></g>
    <g class="ap2"><path class="sK" d="M140,182 C128,176 120,168 113,170"/><path class="sK" d="M148,185 L148,187 M180,185 L180,187"/></g>${body}`;
}

/* ---- A member of the Round Table, walking: hood, robe, the lit insignia pin. No face. ---- */
export function robedFigure() {
  const top = `
    <path class="k sV" d="M141,72 C128,96 124,140 120,182 L200,182 C196,140 192,96 179,72 Z"/>
    <path class="hl sV" d="M150,90 C146,120 144,150 142,180 M170,90 C174,120 176,150 178,180"/>
    <path class="sV" d="M140,86 C132,110 146,126 160,126 C174,126 188,110 180,86"/><path class="hl sV" d="M150,124 L170,124"/>
    <path class="k sV" d="M138,74 C134,46 146,22 160,18 C174,22 186,46 182,74 C176,70 168,68 160,68 C152,68 144,70 138,74 Z"/>
    <path class="k hl sV" d="M148,62 C147,44 153,34 160,32 C167,34 173,44 172,62 C166,66 154,66 148,62 Z"/>
    <circle class="sX" cx="173" cy="98" r="4.2"/><circle class="fX" cx="173" cy="98" r="1.7"/>`;
  return `<g class="ap0"><path class="k sD" d="M140,182 L156,182 L156,186 L140,186 Z M164,182 L180,182 L180,186 L164,186 Z"/></g>
    <g class="ap1"><path class="k sD" d="M126,182 L142,180 L143,185 L127,187 Z M170,182 L188,181 L188,186 L170,186 Z"/></g>
    <g class="ap2"><path class="k sD" d="M146,182 L162,182 L162,186 L146,186 Z M158,181 L174,183 L173,187 L157,186 Z"/></g>${top}`;
}
