// ACT IV cast, part B: the figures for the Act IV states of the lab, the steam tunnels, MRI control and Iris's office.
// Gus on the scanner bed (seen through the control-room window), Det. Sgt. Small with his hat in his hand,
// Nell's desk chair with the robe draped over it, a robe hanging on a coat-check hook, Iris's visitor chair
// and her hand on the staple gun. Sheet-coordinate drawings use the figures.js frame (feet at about (160,187));
// the window and coat-check pieces are drawn natively, in room pixels, because they are too small to scale.
import { seg, arcs } from "../gfx.js";
import { AUD, smallHead } from "../figures.js";

const shoe = (x, y) => `<path class="k sW" d="M${x},${y} L${x + 18},${y} C${x + 22},${y} ${x + 22},${y + 5} ${x + 18},${y + 5} L${x},${y + 5} Z"/>`;
// place sheet-coordinate art with its feet at (x, y) and depth scale k; `drop` lowers it into a seat; flip mirrors it
const at = (x, y, k, inner, { drop = 0, flip = 1 } = {}) => { const q = k * AUD;
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(flip * q).toFixed(3)},${q.toFixed(3)}) translate(-160,-187)">${drop ? `<g transform="translate(0,${drop})">${inner}</g>` : inner}</g>`; };
const pin = (x, y, r = 3.4) => `<circle class="k sX" cx="${x}" cy="${y}" r="${r}"/><circle class="fX" cx="${x}" cy="${y}" r="${(r * .42).toFixed(2)}"/>`;

/* ======================================================================
 *  GUS IN THE BORE (Friday 06:40). Through the window: on the scanner bed, head first in the 3T,
 *  feet toward us. Pinpoint pupils; NRT earbuds lit ON where the scanner headphones should be,
 *  with ((( ))) arcs (pose group "hum"). Native pixels, centred on the bore at (cx, cy); the bed's top edge is cy + 10.
 * ====================================================================== */
export function gusInBore(cx = 326, cy = 128) {
  const h = (dx, dy) => `${cx + dx},${cy + dy}`;
  const bud = (dx) => `<circle class="fG" cx="${cx + dx}" cy="${cy}" r="1.5"/>`;
  return `
    <path class="k sV" d="M${h(-8, 5)} L${h(8, 5)} L${h(10.5, 13)} L${h(-10.5, 13)} Z"/>
    <path class="sW" d="M${h(-3, 5)} L${h(0, 9)} L${h(3, 5)}"/><path class="hl sV" d="M${h(-2.5, 8)} L${h(-3, 13)} M${h(2.5, 8)} L${h(3, 13)}"/>
    <path class="sV" d="M${h(-8.5, 6)} L${h(-12.5, 13)}"/><circle class="hl sK" cx="${cx - 13.5}" cy="${cy + 15}" r="1.5"/>
    <path class="sV" d="M${h(8.5, 6)} L${h(12.5, 13)}"/><circle class="hl sK" cx="${cx + 13.5}" cy="${cy + 15}" r="1.5"/>
    <path class="k sM" d="M${h(-10, 13)} L${h(-1, 13)} L${h(-3, 22)} L${h(-13, 22)} Z"/><path class="k sM" d="M${h(1, 13)} L${h(10, 13)} L${h(13, 22)} L${h(3, 22)} Z"/>
    <path class="hl sM" d="M${h(-5.5, 14.5)} L${h(-7.5, 21)} M${h(5.5, 14.5)} L${h(7.5, 21)}"/>
    <rect class="k sW" x="${cx - 14.5}" y="${cy + 19}" width="8.5" height="9.5" rx="3.5"/><rect class="k sW" x="${cx + 6}" y="${cy + 19}" width="8.5" height="9.5" rx="3.5"/>
    <path class="hl sW" d="M${h(-12.5, 25.5)} L${h(-8, 25.5)} M${h(8, 25.5)} L${h(12.5, 25.5)}"/>
    <path class="k sK" d="M${h(-7, -3)} C${h(-7, 4)} ${h(-3.5, 7)} ${h(0, 7)} C${h(3.5, 7)} ${h(7, 4)} ${h(7, -3)}"/>
    <path class="k sW" d="M${h(-7.5, -2)} C${h(-9, -10)} ${h(-4, -14)} ${h(0, -14)} C${h(4, -14)} ${h(9, -10)} ${h(7.5, -2)} C${h(6, -6)} ${h(3, -7.5)} ${h(0, -7)} C${h(-3, -7.5)} ${h(-6, -6)} ${h(-7.5, -2)} Z"/>
    <path class="hl sW" d="M${h(-5, -10)} C${h(-4, -12)} ${h(-2, -12)} ${h(-2, -10)} M${h(1, -11)} C${h(2, -13)} ${h(4, -12.5)} ${h(4, -10.5)}"/>
    <circle class="hl sW" cx="${cx - 3.2}" cy="${cy - 1.5}" r="1.9"/><circle class="hl sW" cx="${cx + 3.2}" cy="${cy - 1.5}" r="1.9"/>
    <circle class="fW" cx="${cx - 3.2}" cy="${cy - 1.5}" r=".5"/><circle class="fW" cx="${cx + 3.2}" cy="${cy - 1.5}" r=".5"/>
    <path class="hl sW" d="M${h(-3.5, 3)} C${h(-1.5, 1.6)} ${h(-.5, 2.2)} ${h(0, 2.6)} C${h(.5, 2.2)} ${h(1.5, 1.6)} ${h(3.5, 3)}"/>
    ${bud(-7.8)}${bud(7.8)}
    <g class="pz on" data-g="hum" data-i="0">${arcs(cx - 10, cy, -1, "sG", 2, .42)}${arcs(cx + 10, cy, 1, "sG", 2, .42)}</g>
    <g class="pz" data-g="hum" data-i="1">${arcs(cx - 10, cy, -1, "sG", 3, .48)}${arcs(cx + 10, cy, 1, "sG", 3, .48)}</g>`;
}

/* ======================================================================
 *  DET. SGT. SMALL, hat in hand. The trench coat (BRASS), the hat held in both hands at his belt,
 *  eyes down. Standing, sheet coordinates; place with smallHatInHand(x, y, k, flip).
 * ====================================================================== */
const smallCoat = `
  <path class="k sA" d="M130,94 C136,87 147,85 154,86 L160,96 L166,86 C173,85 184,87 190,94 L194,160 L126,160 Z"/>
  <path class="sA" d="M146,86 L152,104 L160,96 M174,86 L168,104 L160,96 M150,86 L144,90 M170,86 L176,90"/><path class="sR" d="M160,96 L158,112 L160,118 L162,112 Z"/>
  <path class="sA" d="M127,140 L193,140 M160,140 L160,160"/>`;
// eyes down: the open eyes of smallHead() become lowered lids
const eyesDown = (svg) => svg
  .replace(/<circle class="fW" cx="151" cy="58" r="1.5"\/>/, `<path class="sW" d="M147.5,58 C149.5,59.5 152.5,59.5 154.5,58"/><circle class="fW" cx="151" cy="60" r="1.1"/>`)
  .replace(/<circle class="fW" cx="170" cy="58" r="1.5"\/>/, `<path class="sW" d="M166.5,58 C168.5,59.5 171.5,59.5 173.5,58"/><circle class="fW" cx="170" cy="60" r="1.1"/>`);
// the fedora, crown toward us, held by the brim
const hat = `
  <path class="k sA" d="M138,134 C138,128 146,126 160,126 C174,126 182,128 182,134 C182,138 174,140 160,140 C146,140 138,138 138,134 Z"/>
  <path class="k sA" d="M146,131 L148,112 C148,108 154,106 160,108 C166,106 172,108 172,112 L174,131 C168,133 152,133 146,131 Z"/>
  <path class="hl sA" d="M160,108 L160,116 M147.4,124 C154,126 166,126 172.6,124"/><path class="sA" d="M146.8,127 C154,129.4 166,129.4 173.2,127"/>`;
export function smallHatInHand(x, y, k, flip = 1) {
  return at(x, y, k, `
    <path class="k sM" d="M138,156 L140,182 L157,182 L158,160 L162,160 L163,182 L180,182 L182,156 Z"/>${shoe(138, 182)}${shoe(163, 182)}
    ${smallCoat}
    <path class="sA" d="M132,96 L128,120 L138,132"/><path class="sA" d="M188,96 L192,120 L182,132"/>
    ${hat}<circle class="k sK" cx="139" cy="134" r="3"/><circle class="k sK" cx="181" cy="134" r="3"/>
    <g transform="translate(0,2)">${eyesDown(smallHead())}</g>`, { flip });
}

/* ======================================================================
 *  NELL'S DESK CHAIR (lab, Act IV): a swivel chair pulled out from the desk, seen from behind.
 *  robe = true: the Table's hooded robe (ROBE) draped over its back, hood hanging toward us,
 *  the small round insignia pin lit SIGNAL. Sheet coordinates; feet (casters) on y 187.
 * ====================================================================== */
const swivel = `
  <path class="hl sD" d="M160,176 L128,182 M160,176 L192,182 M160,176 L146,186 M160,176 L174,186"/>
  <circle class="hl sD" cx="127" cy="184" r="2.4"/><circle class="hl sD" cx="193" cy="184" r="2.4"/><circle class="hl sD" cx="145" cy="187" r="2.4"/><circle class="hl sD" cx="175" cy="187" r="2.4"/>
  <path class="sD" d="M157,146 L157,176 M163,146 L163,176"/>
  <path class="k sD" d="M122,146 L198,146 L194,154 L126,154 Z"/>
  <path class="sD" d="M153,140 L153,146 M167,140 L167,146"/>
  <path class="k sD" d="M126,138 L126,104 C126,96 132,92 140,92 L180,92 C188,92 194,96 194,104 L194,138 C194,142 190,144 186,144 L134,144 C130,144 126,142 126,138 Z"/>`;
const robeOverBack = `
  <path class="sV" d="M124,98 C114,110 110,134 108,162 L118,166 C118,144 120,124 126,108"/><path class="hl sV" d="M108,162 L118,166"/>
  <path class="sV" d="M196,98 C206,110 210,134 212,162 L202,166 C202,144 200,124 194,108"/><path class="hl sV" d="M212,162 L202,166"/>
  <path class="k sV" d="M122,100 C124,92 136,88 160,88 C184,88 196,92 198,100 L200,152 C192,156 186,150 178,154 C170,158 166,152 158,156 C150,160 144,152 136,156 C130,158 124,154 120,152 Z"/>
  <path class="hl sV" d="M131,104 C130,120 129,136 128,150 M189,104 C190,120 191,136 192,150 M150,128 C149,138 148,146 147,154 M170,128 C171,138 172,146 173,154"/>
  <path class="k sV" d="M140,90 C140,86 180,86 180,90 L176,112 C172,124 166,130 160,132 C154,130 148,124 144,112 Z"/>
  <path class="hl sV" d="M146,92 C146,90 174,90 174,92 L171,110 C168,119 164,124 160,125 C156,124 152,119 149,110 Z"/>
  ${pin(185, 112)}`;
export function nellChair(x, y, k, robe = false) {
  return at(x, y, k, swivel + (robe ? robeOverBack : ""));
}

/* ======================================================================
 *  A ROBE ON A COAT-CHECK HOOK (steam tunnels). Native pixels: the hook at (x, y), hanging length L.
 *  Hood hanging flat at the top, shoulders, sleeves, a ragged hem; `lit` adds the insignia pin.
 *  A brass check tag on the hook reads 39 (every member is 39).
 * ====================================================================== */
export function robeOnHook(x, y, L, lit = false, tag = true) {
  const w = L * .2, W = L * .25, f = (n) => n.toFixed(1);
  const sh = y + L * .2, hem = y + L;
  return `
    <path class="sW" d="M${f(x)},${f(y - 4)} L${f(x)},${f(y + 1)} C${f(x)},${f(y + 3)} ${f(x + 2.5)},${f(y + 3)} ${f(x + 2.5)},${f(y + 1)}"/>
    <path class="k sV" d="M${f(x - w)},${f(sh)} C${f(x - w * .6)},${f(y + 2)} ${f(x + w * .6)},${f(y + 2)} ${f(x + w)},${f(sh)} L${f(x + W)},${f(hem)}
      L${f(x + W * .5)},${f(hem - 2)} L${f(x)},${f(hem)} L${f(x - W * .5)},${f(hem - 2)} L${f(x - W)},${f(hem)} Z"/>
    <path class="hl sV" d="M${f(x - w * .7)},${f(sh + 2)} L${f(x - W * .55)},${f(hem - 3)} M${f(x + w * .7)},${f(sh + 2)} L${f(x + W * .55)},${f(hem - 3)} M${f(x)},${f(y + L * .42)} L${f(x)},${f(hem - 2)}"/>
    <path class="k sV" d="M${f(x - w * .75)},${f(y + 3)} C${f(x - w * .75)},${f(y + 1)} ${f(x + w * .75)},${f(y + 1)} ${f(x + w * .75)},${f(y + 3)} L${f(x + w * .55)},${f(y + L * .3)} C${f(x + w * .3)},${f(y + L * .38)} ${f(x - w * .3)},${f(y + L * .38)} ${f(x - w * .55)},${f(y + L * .3)} Z"/>
    <path class="hl sV" d="M${f(x - w * .4)},${f(y + 5)} L${f(x - w * .2)},${f(y + L * .28)} C${f(x)},${f(y + L * .31)} ${f(x)},${f(y + L * .31)} ${f(x + w * .2)},${f(y + L * .28)} L${f(x + w * .4)},${f(y + 5)}"/>
    ${lit ? pin(x + w * .9, sh + L * .1, 2.1) : ""}
    ${tag ? `<rect class="k sA" x="${f(x + 2)}" y="${f(y - 2.4)}" width="6.4" height="5.2"/>${seg("39", x + 3.4, y - 1.2, 2.8, "sA", .5)}` : ""}`;
}

/* ======================================================================
 *  IRIS'S OFFICE (Act IV morning): the visitor chair set opposite her desk, seen from behind,
 *  and Iris's hand closed on the staple gun (an overlay for irisSeated(x, y, k), drawn after the desk).
 * ====================================================================== */
export function visitorChair(x, y, k) {
  return at(x, y, k, `
    <path class="sW" d="M130,146 L128,187 M190,146 L192,187 M136,146 L137,178 M184,146 L183,178"/><path class="hl sW" d="M137,168 L183,168"/>
    <path class="k sW" d="M122,140 L198,140 L195,148 L125,148 Z"/>
    <path class="sW" d="M132,140 L131,100 M188,140 L189,100"/>
    <path class="k sW" d="M126,96 C140,92 180,92 194,96 L194,108 C180,105 140,105 126,108 Z"/><path class="k sW" d="M131,120 L189,120 L189,126 L131,126 Z"/>
    <path class="hl sW" d="M150,106 L150,120 M170,106 L170,120"/>`);
}
// the staple gun in Iris's right hand (our right), lifted off the blotter and held across her chest
export function irisStapleGun(x, y, k) {
  return at(x, y, k, `
    <path class="sV" d="M194,126 L189,114"/>
    <path class="k sR" d="M154,112 L192,112 L192,105 L187,105 L185,98 L162,98 L156,105 Z"/>
    <path class="sR" d="M164,98 L177,89 L185,98"/><path class="hl sR" d="M158,109 L187,109"/><circle class="fR" cx="155" cy="110" r="1.5"/>
    <circle class="k sK" cx="188" cy="111" r="4.6"/>`, { drop: 34 });
}
