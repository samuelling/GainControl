// ACT V cast, part B: Iris Candor walking (playable in Part 2) and the hooded doorkeeper of B3.
// Same sheet coordinates as figures.js: feet at about (160,187), centered on x 160, facing right.
import { AUD } from "../figures.js";

// a small low-heeled shoe (Iris), toe to the right
const pump = (x, y) => `<path class="k sW" d="M${x},${y} L${x + 13},${y} C${x + 17},${y} ${x + 17},${y + 4.5} ${x + 13},${y + 4.5} L${x},${y + 4.5} Z"/>`;

// her head (the portrait's: INK bun, BRASS glasses on a chain, SKIN jaw), bowed forward on the neck
const irisHead = `
  <path class="sK" d="M153,84 L153,90 M167,84 L167,90"/>
  <path class="k sK" d="M139,50 C138,71 148,84 160,84 C172,84 182,71 181,50"/>
  <path class="sK" d="M139,56 C134,55 134,65 139,66"/>
  <path class="k sW" d="M137,56 C134,37 146,29 160,29 C174,29 186,37 183,56 C178,46 168,42 160,42 C152,42 142,46 137,56 Z"/>
  <circle class="k sW" cx="160" cy="22" r="8"/><path class="sW" d="M154,20 C158,18 162,18 166,20 M150,36 C154,33 158,32 162,32"/>
  <path class="hl sW" d="M144,40 C150,36 156,35 160,35 M170,36 C175,37 179,40 181,44"/>
  <circle class="fW" cx="151" cy="60" r="1.5"/><circle class="fW" cx="169" cy="60" r="1.5"/>
  <path class="sA" d="M143,57 L157,56 L156,63 L145,64 Z M163,56 L177,57 L175,64 L164,63 Z M157,58 L163,58"/>
  <path class="sA dash" d="M143,60 C134,72 136,88 146,96"/>
  <path class="sK" d="M160,63 C157,69 160,71 163,70 M146,70 L149,72.5 M174,70 L171,72.5"/>
  <path class="sK" d="M153,75 C157,77 163,77 167,74"/>`;

/* ---- Prof. Iris Candor, 88, walking: a slight stoop (shoulders rounded, head bowed forward), cardigan ROBE over a
 *  DIM skirt, short steps, and the SIGNAL staple gun held out in her right hand like a sidearm. ---- */
export function irisFigure() {
  // the upper body sits lower and leans forward: shoulders ~12 units below Nell's, head pitched 12 degrees
  const up = (inner) => `<g transform="translate(5,13)">${inner}</g>`;
  const cardigan = `
    <path class="k sV" d="M130,104 C125,92 138,86 152,88 L160,100 L168,88 C176,88 186,92 189,100 L192,142 L128,142 Z"/>
    <path class="sV" d="M160,100 L160,142"/>${[110, 121, 132].map(y => `<circle class="sV" cx="165" cy="${y}" r="1.4"/>`).join("")}
    <path class="hl sV" d="M131,96 C136,90 144,88 150,89 M137,112 C140,120 140,130 137,138 M184,108 C181,118 182,128 185,136"/>
    ${[150, 155, 160, 165, 170].map((x, i) => `<circle class="sW" cx="${x}" cy="${96 - Math.abs(i - 2) * 1.2}" r="1.5"/>`).join("")}
    <path class="hl sV" d="M129,138 L159,138 M161,138 L191,138"/>`;
  // the right arm, held out with the staple gun (the same in every pose)
  const gunArm = `
    <path class="sV" d="M187,98 L192,120 L201,124"/>
    <path class="k sR" d="M199,129 L225,129 L225,123 L222,123 L221,120 L203,120 L199,123 Z"/>
    <path class="sR" d="M202,120 L212,113 L218,120"/><circle class="fR" cx="222.5" cy="126" r=".9"/><circle class="k sK" cx="206" cy="122" r="3"/>`;
  const skirt = `<path class="k sM" d="M135,150 L132,166 L189,166 L186,150 Z"/><path class="hl sM" d="M150,152 L148,165 M172,152 L174,165"/>`;
  const stand = `<g class="ap0">
    <path class="sK" d="M152,166 L152,182 M170,166 L170,182"/>${pump(148, 182)}${pump(166, 182)}
    ${up(`<path class="sV" d="M130,100 L121,122"/><circle class="sK" cx="120" cy="126" r="3"/>`)}</g>`;
  const walkA = `<g class="ap1">
    <path class="sK" d="M152,166 L145,182 M170,166 L177,182"/>${pump(141, 182)}${pump(173, 182)}
    ${up(`<path class="sV" d="M130,100 L125,123"/><circle class="sK" cx="125" cy="127" r="3"/>`)}</g>`;
  const walkB = `<g class="ap2">
    <path class="sK" d="M154,166 L157,182 M168,166 L164,182"/>${pump(152, 182)}${pump(160, 182)}
    ${up(`<path class="sV" d="M130,100 L116,119"/><circle class="sK" cx="114" cy="122" r="3"/>`)}</g>`;
  return stand + walkA + walkB + skirt + up(cardigan + gunArm + `<g transform="translate(4,0) rotate(14 160 90)">${irisHead}</g>`);
}

/* ---- The doorkeeper: a member of the Round Table standing guard, hood up, hands folded into the sleeves, the
 *  insignia pin lit. No face: a black opening. Pose group "dk": 0 upright, 1 hood tilted (a doubtful answer).
 *  Placed with its feet at (x, y) at depth scale k. ---- */
export function doorkeeper(x, y, k) {
  const q = k * AUD;
  const hood = (t) => `<g transform="rotate(${t} 160 74)">
    <path class="k sV" d="M138,76 C133,46 146,20 160,16 C174,20 187,46 182,76 C176,71 168,69 160,69 C152,69 144,71 138,76 Z"/>
    <path class="k hl sV" d="M148,64 C147,44 153,33 160,31 C167,33 173,44 172,64 C166,68 154,68 148,64 Z"/>
    <path class="hl sV" d="M160,16 C156,24 154,30 154,34"/></g>`;
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${q.toFixed(3)}) translate(-160,-187)">
    <path class="k sD" d="M140,182 L156,182 L156,186 L140,186 Z M164,182 L180,182 L180,186 L164,186 Z"/>
    <path class="k sV" d="M141,72 C128,96 124,140 120,183 L200,183 C196,140 192,96 179,72 Z"/>
    <path class="hl sV" d="M148,128 C146,150 144,166 142,181 M172,128 C174,150 176,166 178,181 M160,130 L160,181"/>
    <path class="k sV" d="M134,104 C140,118 146,124 160,126 C174,124 180,118 186,104 L188,120 C180,130 170,132 160,132 C150,132 140,130 132,120 Z"/>
    <path class="hl sV" d="M152,126 L152,131 M168,126 L168,131"/>
    <circle class="sX" cx="173" cy="96" r="4.2"/><circle class="fX" cx="173" cy="96" r="1.7"/>
    <g class="pz on" data-g="dk" data-i="0">${hood(0)}</g>
    <g class="pz" data-g="dk" data-i="1">${hood(-14)}</g></g>`;
}
