// Characters in the scene. Drawn in "sheet" coordinates: feet at about (160,187), about 170 units tall.
// Walking figures carry three pose groups: .ap0 (stand), .ap1 and .ap2 (walk). The engine shows one at a time.
import { seg, arcs } from "./gfx.js";

export const AUD = 0.72;   // scale factor shared by walking figures and everything sized against them

const shoe = (x, y) => `<path class="k sW" d="M${x},${y} L${x + 18},${y} C${x + 22},${y} ${x + 22},${y + 5} ${x + 18},${y + 5} L${x},${y + 5} Z"/>`;

export function nedFigure() {
  const head = `
    <path class="k sK" d="M139,54 C138,72 149,82 161,82 C174,82 183,72 183,56"/>
    <path class="sK" d="M140,58 C134,57 133,67 140,68"/>
    <path class="k sR" d="M137,60 C132,41 143,30 156,31 L153,21 L162,28 L166,17 L172,28 L181,22 L180,33 C189,38 189,51 184,59 C180,49 172,45 164,47 C156,43 145,47 137,60 Z"/>
    <path class="sR" d="M149,38 L155,45 M164,33 L166,42 M174,36 L172,44"/>
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
  const mop = (hx, hy, mx, my, ang) => `<path class="sA mech" d="M${hx},${hy} L${mx},${my}"/>
    <g transform="translate(${mx},${my}) rotate(${ang})"><path class="k sW" d="M-12,0 L12,0 L14,4 L-14,4 Z"/>
    ${[-12, -7, -2, 3, 8, 12].map(x => `<path class="sW" d="M${x},4 L${x + (ang > 0 ? 2 : -2)},11"/>`).join("")}</g>`;
  const arms = (lx, ly, rx, ry) => `<path class="sV" d="M135,88 L${lx},${ly}"/><circle class="sK" cx="${lx}" cy="${ly + 3}" r="3.2"/>
    <path class="sV" d="M185,88 L${rx},${ry}"/><circle class="sK" cx="${rx}" cy="${ry + 3}" r="3.2"/>`;
  const body = `
    <path class="k sM" d="M134,128 L136,182 L157,182 L159,138 L161,138 L163,182 L184,182 L186,128 Z"/>
    <path class="k sW" d="M134,182 L158,182 L158,188 L130,188 C130,184 131,182 134,182 Z M162,182 L186,182 C189,182 190,184 190,188 L162,188 Z"/>
    <path class="k sV" d="M134,86 C140,80 150,80 160,84 C170,80 180,80 186,86 L189,130 L131,130 Z"/>
    <path class="hl sV" d="M140,94 L152,94 L152,104 L140,104 Z M160,86 L160,130"/>
    <ellipse class="k sR" cx="173" cy="99" rx="9" ry="5.5"/>${seg("GUS", 167.4, 97, 4, "sR", .9)}
    <circle class="sA" cx="140" cy="122" r="4"/><path class="sA" d="M138,126 L136,132 M141,126 L141,133"/>
    <path class="sK" d="M154,76 L154,83 M166,76 L166,83"/>
    <path class="k sK" d="M137,47 C136,66 148,77 160,77 C172,77 184,66 183,47"/>
    <path class="sW" d="M137,50 C134,54 135,60 138,62 M183,50 C186,54 185,60 182,62"/>
    <path class="k sB" d="M136,46 C135,30 147,22 160,22 C173,22 185,30 184,46 Z"/><path class="k sB" d="M156,46 L204,46 C206,48 204,51 200,51 L156,51 Z"/>
    <path class="sW" d="M146,52 L154,51 M166,51 L174,52"/><circle class="fW" cx="150.5" cy="56" r="1.5"/><circle class="fW" cx="169.5" cy="56" r="1.5"/>
    <path class="sK" d="M160,57 C156,64 159,67 164,65"/>
    <path class="k sW" d="M144,68 C150,62 157,65 160,67 C163,65 170,62 176,68 C170,72 163,70 160,70 C157,70 150,72 144,68 Z"/>`;
  return `<g class="ap1">${mop(150, 70, 102, 178, -14)}${arms(136, 108, 146, 104)}</g>
    <g class="ap0">${mop(160, 66, 160, 178, 0)}${arms(152, 110, 166, 100)}</g>
    <g class="ap2">${mop(170, 70, 218, 178, 14)}${arms(176, 104, 186, 108)}</g>${body}`;
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
