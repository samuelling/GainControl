// ACT IV cast: Prof. Maximilian Impact (standing in the hall, frozen in the -80), Cody standing and floating,
// Prof. Dee Adline (portrait, for the Act V committee).
// Same sheet coordinates as figures.js: feet at about (160,187), standing head about y 28–82.
// head(p): in portraits (p = true) both eyes-open/eyes-closed and mouth-a/mouth-b poses are emitted.
import { seg, arcs, star4 } from "../gfx.js";
import { AUD, codyHead } from "../figures.js";

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

/* ======================================================================
 *  PROF. MAXIMILIAN IMPACT — Preston's PI. Always in an airport.
 *  Silver hair swept back (INK), the keynote grin, a tan (crow's feet from smiling at podiums),
 *  an airline neck pillow (ROBE), a lanyard of keynote badges (BRASS on COOL), a suit (STRUCT),
 *  a rolling carry-on. In Act IV he is rattled: a bead of sweat at the temple.
 * ====================================================================== */
const impactHair = `
  <path class="k sW" d="M136,57 C130,38 141,22 161,20 C179,19 191,29 187,47 C186,51 185,54 183,57 C182,49 179,44 175,42 C165,37 150,39 143,45 C139,48 137,52 136,57 Z"/>
  <path class="hl sW" d="M145,43 C151,32 164,27 181,29 M151,39 C158,31 170,28 185,34 M158,39 C166,34 176,34 186,41 M141,49 C142,40 148,32 156,28"/>`;
export function impactHead(p = false, frozen = false) {
  const fz = frozen;
  return `<g class="hd">${ears}${jaw}${impactHair}
    <path class="hl sK" d="M141,57 L138,56 M141,60 L138,61 M180,57 L183,56 M180,60 L183,61"/>
    <path class="sW" d="M145,51 C148,49 153,49 156,50.5 M165,50.5 C168,49 173,49 176,51"/>
    ${fz ? `<circle class="k sW" cx="151" cy="57" r="3"/><circle class="k sW" cx="170" cy="57" r="3"/><circle class="fW" cx="151" cy="57" r=".9"/><circle class="fW" cx="170" cy="57" r=".9"/>`
      : eyes(p, [151, 57], [170, 57], 1.6)}
    ${nose}<path class="hl sK" d="M148,66 C150,68 151,70 150,72 M173,66 C171,68 170,70 171,72"/>
    ${fz ? `<path class="k sK" d="M155,72 C155,68 166,68 166,72 C166,77 155,77 155,72 Z"/>`
      : mouth(p, `<path class="k sW" d="M148,71 C153,78.5 168,78.5 173,71 C166,73.5 155,73.5 148,71 Z"/><path class="hl sK" d="M153,74 L153,75.5 M160,74.3 L160,76.3 M167,74 L167,75.5"/>`,
        `<path class="k sK" d="M149,71 C154,70 167,70 172,71 C170,80 151,80 149,71 Z"/><path class="sW" d="M150.5,71.6 L170.5,71.6"/>`)}
    ${fz ? "" : `<path class="hl sB" d="M185,46 C183,49 183,51 185,52 C187,51 187,49 185,46 Z"/>`}
    <path class="sK" d="M155,80 L155,84 M166,80 L166,84"/></g>`;
}
const impactSuit = `
  <path class="k sM" d="M130,96 C135,90 145,88 152,88 L160,104 L168,88 C175,88 185,90 190,96 L193,138 L127,138 Z"/>
  <path class="sM" d="M152,88 L156,114 L160,104 M168,88 L164,114 L160,104"/><path class="sW" d="M154,92 L160,102 L166,92"/>
  <path class="hl sA" d="M176,108 L184,106 L183,111 Z"/><circle class="hl sM" cx="160" cy="124" r="1.4"/>`;
// a lanyard of keynote badges: the front one says KEY(NOTE); two more fan out behind it
const lanyard = (swing = 0) => `
  <path class="sB" d="M150,90 L156,116 M170,90 L164,116"/>
  <g transform="rotate(${-18 + swing} 160 116)"><rect class="k sV" x="153" y="116" width="13" height="16"/><path class="hl sV" d="M156,121 L163,121 M156,125 L161,125"/></g>
  <g transform="rotate(${16 + swing} 160 116)"><rect class="k sB" x="154" y="116" width="13" height="16"/><path class="hl sB" d="M157,121 L164,121 M157,125 L162,125"/></g>
  <g transform="rotate(${swing} 160 116)"><rect class="k sA" x="153" y="116" width="14" height="17"/>${seg("KEY", 155.2, 119, 3.6, "sA", .6)}<path class="hl sA" d="M156,127 L164,127 M156,130 L162,130"/></g>`;
// the neck pillow, a fat U round the neck; frost ticks when frozen
const pillow = (frozen = false) => `
  <path class="k sV" d="M135,81 C130,104 190,104 185,81 L175,83 C176,95 144,95 145,83 Z"/>
  <path class="hl sV dash" d="M139,86 C141,98 179,98 181,86"/>
  ${frozen ? `<path class="hl sB" d="M137,84 L134,82 M140,93 L136,94 M150,99 L149,103 M160,100 L160,104 M170,99 L171,103 M180,93 L184,94 M183,84 L186,82"/>${star4(144, 92, 3, "sW")}${star4(178, 88, 2.4, "sW")}` : ""}`;
export const impactBust = () => impactSuit + lanyard() + pillow() + impactHead(true);
// the rolling carry-on (sheet coordinates, left of the figure; the telescoping handle comes up to his hand)
const carryOn = `
  <path class="sM mech" d="M103,132 L103,118 M117,132 L117,118 M101,118 L119,118"/>
  <rect class="k sM mech" x="94" y="132" width="32" height="50"/><path class="hl sM" d="M98,136 L98,178 M122,136 L122,178 M94,146 L126,146"/>
  <path class="hl sA" d="M110,152 L116,156 L114,166 L108,162 Z M110,152 L106,148"/>
  <circle class="k sW" cx="99" cy="184" r="3"/><circle class="k sW" cx="121" cy="184" r="3"/>`;
// standing in the hallway: on the phone, one hand on the carry-on (pose group "phone": the call crackles)
export function impactStanding(x, y, k, flip = 1) {
  return place(x, y, k, `${carryOn}
    <path class="k sM" d="M135,134 L138,182 L156,182 L159,142 L161,142 L164,182 L182,182 L185,134 Z"/><path class="hl sM" d="M147,146 L148,178 M173,146 L172,178"/>
    ${shoe(137, 182)}${shoe(164, 182)}
    ${impactSuit}${lanyard()}
    <path class="sM" d="M132,100 L124,114 L118,118"/><circle class="sK" cx="117" cy="119" r="3"/>
    <path class="sM" d="M188,100 L200,110 L192,80"/>
    <rect class="k sW" x="185" y="56" width="7" height="16" rx="1.5" transform="rotate(14 188 64)"/><circle class="sK" cx="191" cy="76" r="3"/>
    <g class="pz on" data-g="phone" data-i="0">${arcs(197, 60, 1, "sA", 2, .6)}</g><g class="pz" data-g="phone" data-i="1">${arcs(197, 60, 1, "sA", 3, .6)}</g>
    ${pillow()}${impactHead()}`, flip);
}
// frozen mid-stride inside the walk-in: one leg forward, an arm reaching for a door that closed,
// the badges stuck mid-swing, icicles, frost sparkles
export function impactFrozen(x, y, k) {
  const icicle = (x0, y0, l) => `<path class="hl sB" d="M${x0 - 1.6},${y0} L${x0},${y0 + l} L${x0 + 1.6},${y0}"/>`;
  return place(x, y, k, `
    <path class="k sM" d="M137,128 L120,176 L137,182 L158,134 Z"/><path class="k sM" d="M162,132 L178,182 L196,178 L184,128 Z"/>${shoe(118, 177)}${shoe(180, 179)}
    ${impactSuit}${lanyard(-34)}
    <path class="sM" d="M132,98 L118,100 L102,92"/><circle class="sK" cx="99" cy="91" r="3"/>
    <path class="sM" d="M188,98 L198,114 L208,124"/><rect class="k sW" x="207" y="120" width="7" height="14" rx="1.5" transform="rotate(-30 210 127)"/>
    ${pillow(true)}${impactHead(false, true)}
    <path class="hl sB" d="M141,42 L139,48 M150,37 L149,43 M180,40 L182,46 M120,104 L121,110 M110,97 L110,103"/>
    ${icicle(150, 79, 5)}${icicle(158, 81, 7)}${icicle(166, 80, 5)}${icicle(140, 66, 4)}${icicle(181, 66, 4)}
    ${icicle(130, 138, 6)}${icicle(146, 138, 4)}${icicle(176, 138, 6)}${icicle(190, 138, 4)}${icicle(104, 95, 5)}${icicle(201, 118, 5)}
    ${star4(132, 34, 4, "sW")}${star4(194, 50, 3, "sW")}${star4(116, 150, 3.4, "sW")}${star4(200, 160, 3, "sW")}${star4(164, 108, 2.6, "sW")}`);
}

/* ======================================================================
 *  CODY CREDIT — standing (Act IV: no clipboard, a hand at the back of his neck), and floating.
 * ====================================================================== */
const codyTee = `
  <path class="k sA" d="M131,94 C137,88 148,86 153,87 C156,92 165,92 168,87 C173,86 184,88 190,94 L192,134 L128,134 Z"/>
  <path class="sA" d="M153,87 C156,92 165,92 168,87"/>${seg("PSY 101", 147, 104, 4.4, "sA", .8)}`;
export function codyStanding(x, y, k, flip = 1) {
  return place(x, y, k, `
    <path class="k sM" d="M136,130 L138,182 L157,182 L159,140 L161,140 L163,182 L182,182 L184,130 Z"/><path class="hl sM" d="M148,142 L149,178 M172,142 L171,178"/>
    ${shoe(137, 182)}${shoe(163, 182)}<path class="hl sR" d="M140,185 L156,185 M166,185 L182,185"/>
    ${codyTee}
    <path class="sA" d="M132,96 L128,112"/><path class="sK" d="M128,112 L126,122"/><circle class="sK" cx="126" cy="125" r="3"/>
    <path class="sA" d="M188,96 L198,106"/><path class="sK" d="M198,106 L188,84"/><circle class="sK" cx="186" cy="81" r="3"/>
    ${codyHead()}`, flip);
}
// face down in the tank, seen from above at the room's angle (local (0,0) = the middle of his back on the water surface;
// +x toward his feet, +y toward you). The backwards cap (brim over the nape), the tee's back, arms and legs spread like a
// starfish; what's under the surface is dashed. Ripple arcs around him.
export function codyFloating(x, y, k) {
  const q = k * AUD;
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${q.toFixed(3)})">
    <path class="hl sB" d="M-118,-6 C-110,-12 -100,-12 -92,-8 M-124,4 C-114,-3 -102,-3 -94,2 M118,-4 C124,-9 132,-9 138,-5 M112,8 C120,2 132,2 140,7 M-20,26 C-6,21 8,21 22,26 M-10,-27 C2,-31 14,-31 26,-27"/>
    <path class="sA" d="M-30,-13 L-52,-25"/><path class="sK" d="M-52,-25 L-60,-27"/><path class="hl sK dash" d="M-60,-27 L-70,-28"/><circle class="hl sK dash" cx="-74" cy="-28" r="3.4"/>
    <path class="sA" d="M-30,13 L-50,25"/><path class="hl sK dash" d="M-50,25 L-66,32"/><circle class="hl sK dash" cx="-70" cy="33" r="3.4"/>
    <path class="k sM" d="M26,-11 L52,-15 L58,-6 L34,0 L58,7 L52,16 L26,12 Z"/><path class="hl sM" d="M28,0 L34,0"/>
    <path class="hl sM dash" d="M55,-11 L92,-20 M56,12 L92,22"/><path class="hl sW dash" d="M92,-20 L104,-23 M92,22 L104,25"/>
    <path class="k sA" d="M-36,-9 C-36,-15 -28,-16 -18,-15 L20,-13 C28,-12 30,-7 30,0 C30,7 28,12 20,13 L-18,15 C-28,16 -36,15 -36,9 Z"/>
    <path class="hl sA" d="M-30,0 L24,0 M-14,-12 C-10,-8 -4,-7 4,-8 M-12,12 C-6,9 0,9 6,10"/>
    <path class="sK" d="M-42,-4 L-37,-4 M-42,4 L-37,4"/>
    <path class="sK" d="M-55,-13 C-58,-17 -52,-18 -51,-14 M-55,13 C-58,17 -52,18 -51,14"/>
    <path class="k sR" d="M-68,0 C-68,-10 -61,-14 -54,-14 C-47,-14 -42,-9 -42,0 C-42,9 -47,14 -54,14 C-61,14 -68,10 -68,0 Z"/>
    <path class="hl sR" d="M-54,0 L-66,-5 M-54,0 L-66,5 M-54,0 L-54,-13 M-54,0 L-54,13"/><circle class="fR" cx="-54" cy="0" r="1.8"/>
    <path class="k sR" d="M-45,-8 L-34,-9 L-33,9 L-45,8 Z"/><path class="sW" d="M-44,-6 L-41,-4 L-44,-1 L-41,2 L-44,5"/>
    <path class="sB" d="M-74,-12 L-66,-12 M-76,10 L-68,12 M60,-6 L70,-7 M60,8 L72,9"/>
  </g>`;
}

/* ======================================================================
 *  PROF. DEE ADLINE — Nell's PI. Drowning in a grant deadline. Hair INK in a messy bun skewered by
 *  three pens (SIGNAL, COOL, ON), reading glasses COOL pushed up on her head, worried brows, wide eyes
 *  with bags under them, a cardigan COOL, and a sticky note on her shoulder: 15.
 * ====================================================================== */
export function adlineHead(p = false) {
  const open = `<circle class="k sW" cx="151" cy="58" r="3.2"/><circle class="k sW" cx="170" cy="58" r="3.2"/><circle class="fW" cx="151" cy="58" r="1.1"/><circle class="fW" cx="170" cy="58" r="1.1"/>
    <path class="hl sR" d="M147.9,57 L149.6,57.6 M173.1,57 L171.4,57.6"/>`;
  return `<g class="hd">${ears}${jaw}
    <path class="sR" d="M146,6 L172,30"/><path class="sB" d="M174,8 L150,30"/><path class="sG" d="M160,4 L161,30"/>
    <path class="k sW" d="M149,30 C144,20 150,12 160,12 C170,12 176,20 171,30 Z"/><path class="hl sW" d="M151,24 C154,18 162,16 168,20 M154,28 C158,23 164,22 168,25"/>
    <path class="sR" d="M146,6 L144,4"/><path class="sB" d="M174,8 L176,6"/><path class="sG" d="M160,4 L160,1"/>
    <path class="k sW" d="M136,60 C131,40 143,29 160,29 C177,29 189,40 184,60 C182,52 178,46 172,44 C164,40 154,41 148,44 C142,47 138,53 136,60 Z"/>
    <path class="hl sW" d="M146,36 C152,32 160,32 164,34 M168,34 C174,36 179,40 181,46 M137,62 C136,68 138,73 141,76 M183,62 C185,68 183,73 180,76"/>
    <path class="sB" d="M142,38 L156,36 L156,42 L144,43 Z M164,36 L178,38 L176,43 L164,42 Z M156,38.5 L164,38.5"/>
    <path class="sW" d="M146,52 L156,49.5 M165,49.5 L175,52"/>
    ${p ? `<g class="eyes-open">${open}</g><g class="eyes-closed"><path class="sW" d="M147,58.5 L155,58.5 M166,58.5 L174,58.5"/></g>` : open}
    <path class="hl sK" d="M147,63 C149,64.5 153,64.5 155,63 M166,63 C168,64.5 172,64.5 174,63 M148,65.5 C150,67 152,67 154,66 M167,66 C169,67 171,67 173,65.5"/>
    ${nose}
    ${mouth(p, `<path class="sK" d="M154,74 C156,73 158,74.5 160.5,73.5 C163,74.5 165,73 167,74"/>`, `<path class="k sK" d="M154,73 C158,72 163,72 167,73 C165,78 156,78 154,73 Z"/>`)}${neck}</g>`;
}
const adlineCardigan = `
  <path class="k sB" d="M130,94 C136,87 147,85 153,86 L160,104 L167,86 C173,85 184,87 190,94 L193,140 L127,140 Z"/>
  <path class="sW" d="M153,86 C155,93 165,93 167,86"/><path class="sB" d="M153,86 L160,104 L167,86"/><path class="hl sB" d="M160,104 L160,140"/>
  ${[112, 124].map(yy => `<circle class="hl sB" cx="163" cy="${yy}" r="1.4"/>`).join("")}
  <g transform="rotate(-8 140 96)"><rect class="k sA" x="133" y="92" width="14" height="13"/>${seg("15", 136, 95, 6.6, "sA", .9)}</g>`;
export const adlineBust = () => adlineCardigan + adlineHead(true);

/* ---- talking portraits (same shape as PORTRAIT in portraits.js) ----
 * Impact speaks in BRASS (gold keynote badges; Tess and Dana, who share it, are gone by Act IV).
 * Adline speaks in COOL (her cardigan; Gus, who shares it, is gone by Act V). */
export const PORTRAITS_4 = {
  impact: { name: "PROF. IMPACT", chip: "fA", vb: "112 14 96 118", svg: impactBust },
  adline: { name: "PROF. ADLINE", chip: "fB", vb: "112 0 96 118", svg: adlineBust },
};
