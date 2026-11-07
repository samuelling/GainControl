/* ================================================================ *
 *  WHIMSY: what the cheat codes draw and play. Cosmetic only.
 *  fxLayer(G) → the SVG for #fx (over the room, under the HUD): cicadas in the lecture hall, snow indoors.
 *  confetti(svg) → a stepped burst for the SIGNIFICANT code. installWhimsy() runs the clocks: snow steps,
 *  the disco hue wheel (stepped, never tweened), the cicadas' buzz, helium voices.
 * ================================================================ */
import { arcs, chip } from "./gfx.js";
import { cheatOn, onChange } from "./options.js";

const f1 = (n) => +n.toFixed(1);
const UNDER = new Set(["tunnels", "tubehub", "antechamber", "chamber", "crawlspace"]);

// a cicada seen from above: black body, clear wings (hairlines), red eyes, and sometimes its buzz arcs
const cicada = (x, y, r = 0, s = 1, buzz = false) => `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})">
  <path class="hl sW" d="M-1.5,-1 C-6,1 -7,7 -3,10 L-.5,3 M1.5,-1 C6,1 7,7 3,10 L.5,3"/>
  <path class="k sM" d="M0,-4 C-2.5,-4 -2.5,-1 -2,3 C-1.5,6 1.5,6 2,3 C2.5,-1 2.5,-4 0,-4 Z"/>
  <circle class="fR" cx="-2" cy="-3.2" r=".9"/><circle class="fR" cx="2" cy="-3.2" r=".9"/></g>
  ${buzz ? `<g class="pz on" data-g="buzz" data-i="${buzz - 1}">${arcs(x - 6, y, -1, "sG", 2, .45)}${arcs(x + 6, y, 1, "sG", 2, .45)}</g>` : ""}`;
// where they've landed in Seminar 101 (and the same room dressed for the defense): the screen, the walls, the
// lectern, the ceiling tiles, the chair backs. [x, y, rotation, scale, buzz pose]
const SWARM = [[210, 92, 20, .9, 1], [258, 84, -30, .8, 0], [436, 100, 80, .9, 2], [450, 150, 170, .8, 0], [300, 182, -10, .9, 1],
  [168, 150, 60, 1.1, 2], [100, 120, -70, 1.3, 0], [520, 120, 100, 1.2, 1], [560, 200, -20, 1.3, 0], [330, 52, 180, 1.1, 2],
  [420, 40, 150, 1.2, 0], [240, 230, 15, 1.3, 1], [395, 236, -40, 1.3, 0], [470, 250, 30, 1.4, 2], [150, 255, -15, 1.4, 0]];

// snow: flakes on a 70-unit tile, stepped down 7 units a tick (ten poses round the loop)
const FLAKES = [...Array(18)].map((_, i) => [((i * 97 + 31) % 640), ((i * 53 + 11) % 70), 1 + (i % 3) * .35]);
const flake = (x, y, r) => `<path class="hl sW" d="M${f1(x - r)},${f1(y)} L${f1(x + r)},${f1(y)} M${f1(x - r * .5)},${f1(y - r * .87)} L${f1(x + r * .5)},${f1(y + r * .87)} M${f1(x - r * .5)},${f1(y + r * .87)} L${f1(x + r * .5)},${f1(y - r * .87)}"/>`;
function snowLayer() {
  let tile = ""; FLAKES.forEach(([x, y, r]) => tile += flake(x, y, r));
  let rows = ""; for (let y = -70; y < 300; y += 70) rows += `<g transform="translate(0,${y})">${tile}</g>`;
  return `<clipPath id="snowclip"><rect x="0" y="0" width="640" height="290"/></clipPath><g clip-path="url(#snowclip)"><g class="snowfall" data-step="0">${rows}</g></g>`;
}

export function fxLayer(G) {
  let s = "";
  if (cheatOn("cicadas") && (G.room === "seminar" || G.room === "defense")) SWARM.forEach(([x, y, r, k, b]) => s += cicada(x, y, r, k, b));
  if (cheatOn("snow") && !UNDER.has(G.room)) s += snowLayer();
  return s;
}

// confetti for a point scored with SIGNIFICANT on: bits of paper jump down in six fixed steps, and a p < .05 chip
export function confetti(svg) {
  if (!svg || !cheatOn("significant")) return;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("pointer-events", "none");
  const cols = ["sR", "sG", "sA", "sB", "sV", "sK"], bits = [...Array(34)].map((_, i) => [(i * 71 + 17) % 600 + 20, (i * 37) % 60 - 40, cols[i % 6], (i * 47) % 180]);
  const frame = (k) => bits.map(([x, y, c, r]) => `<path class="${c}" transform="translate(${x + (k % 2 ? 2 : -2)},${y + k * 46}) rotate(${r + k * 40})" d="M-2,0 L2,0"/>`).join("") + chip("P < .05", 404, 280, 5, "fA");
  svg.appendChild(g); let k = 0;
  const t = setInterval(() => { if (k > 6) { clearInterval(t); g.remove(); return; } g.innerHTML = frame(k++); }, 110);
}

// the brood, heard: a swell of filtered noise pulsing at about 50 Hz
function buzz(sfx) {
  const a = sfx.audio && sfx.audio(); if (!a || sfx.muted || a.ctx.state !== "running") return;
  const { ctx, master, noise } = a, t = ctx.currentTime;
  const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 4200 + Math.random() * 900; bp.Q.value = 6;
  const am = ctx.createGain(); am.gain.value = 0;
  const lfo = ctx.createOscillator(); lfo.type = "square"; lfo.frequency.value = 46 + Math.random() * 10;
  const lg = ctx.createGain(); lg.gain.value = .5; lfo.connect(lg); lg.connect(am.gain);
  const env = ctx.createGain(); env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(.05, t + .7); env.gain.setValueAtTime(.05, t + 1.9); env.gain.linearRampToValueAtTime(0, t + 2.8);
  src.connect(bp); bp.connect(am); am.connect(env); env.connect(master);
  src.start(t); lfo.start(t); src.stop(t + 3); lfo.stop(t + 3);
}

export function installWhimsy({ G, sfx, poseSet }) {
  const body = document.body;
  // snow steps (poses: the whole fall jumps 7 units, ten steps round the tile)
  let sn = 0; setInterval(() => { const g = document.querySelector("#game .snowfall"); if (g) g.setAttribute("transform", `translate(${(sn % 2) * 1.5},${(sn = (sn + 1) % 10) * 7})`); }, 200);
  // the disco wheel: four fixed hues
  let dh = 0; setInterval(() => { if (body.classList.contains("c-disco")) body.style.setProperty("--disco", (dh = (dh + 90) % 360) + "deg"); }, 480);
  // cicadas: the buzz arcs swap, and now and then the whole hall swells
  let bz = 0; setInterval(() => poseSet("buzz", bz ^= 1), 140);
  (function brood() { if (cheatOn("cicadas") && (G.room === "seminar" || G.room === "defense") && !document.hidden) buzz(sfx);
    setTimeout(brood, 4500 + Math.random() * 6500); })();
  const sync = () => { sfx.pitch = cheatOn("helium") ? 1.6 : 1; };
  onChange(sync); sync();
}
