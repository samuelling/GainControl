// NUDGES: what to do when the player is stuck. The engine keeps a clock of how long it has been since the last bit of
// progress (score or a flag changing). The next step comes from the walkthrough (the same rule as the GUV sheet: the
// first critical-path step not done yet), and two optional fields on that step drive the help:
//   hs:    ["room.id", ...]  the target hotspot first, then the exits leading to it. The first entry in the current
//          room gets a glint: a stepped four-point sparkle with ((( ))) arcs, three poses, every few seconds.
//   nudge: ["WHO|line", ...] said in voice, one at a time, getting plainer.
// Only while the game is idle: no conversation, card, minigame, chooser, GUV sheet, or walk in progress.
import { WALKTHROUGH } from "./walkthrough.js";
import { star4, arcs } from "./gfx.js";

export function nextStep(G) {
  const W = WALKTHROUGH[G.act || 1]; if (!W) return null;
  for (const p of W.parts) for (const s of p.steps) {
    if (/^(OPTIONAL|AVOID)/.test(s.t)) continue;
    if (s.flag && G.flags && G.flags[s.flag]) continue;
    return s;
  }
  return null;
}

export function installNudge({ G, svg, say, idle }) {
  const T = { glint: 35, every: 7, first: 95, again: 110 };   // seconds
  let sig = "", idleS = 0, spoken = 0, playing = false;
  const signature = () => `${G.act}|${G.score}|${Object.keys(G.flags || {}).filter(k => G.flags[k]).length}`;

  function target(st) {
    for (const k of (st && st.hs) || []) {
      const i = k.indexOf("."), room = k.slice(0, i), id = k.slice(i + 1);
      if (room !== G.room) continue;
      const el = svg.querySelector(`[data-hs="${id}"]`);
      if (el) return el;
    }
    return null;
  }
  // the hotspot's box in scene units (it may sit inside transformed groups)
  function box(el) {
    const r = el.getBoundingClientRect(), m = svg.getScreenCTM(); if (!m || !r.width) return null;
    const inv = m.inverse(), p = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; return q.matrixTransform(inv); };
    const a = p(r.left, r.top), b = p(r.right, r.bottom);
    return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y };
  }
  function layer() {
    let g = svg.querySelector("#glint");
    if (!g) { g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.id = "glint"; g.setAttribute("pointer-events", "none");
      svg.insertBefore(g, svg.querySelector("#hud")); }
    return g;
  }
  const POSES = [
    (sx, sy, cy, l, r) => star4(sx, sy, 2.5, "sA"),
    (sx, sy, cy, l, r) => star4(sx, sy, 6, "sA") + arcs(r, cy, 1, "sA", 1, .8) + arcs(l, cy, -1, "sA", 1, .8),
    (sx, sy, cy, l, r) => star4(sx, sy, 3.5, "sA") + star4(sx - 7, sy + 6, 1.8, "sA") + arcs(r, cy, 1, "sA", 3, .8) + arcs(l, cy, -1, "sA", 3, .8),
    (sx, sy, cy, l, r) => star4(sx - 7, sy + 6, 1.2, "sA") + arcs(r + 6, cy, 1, "sA", 1, .8) + arcs(l - 6, cy, -1, "sA", 1, .8),
  ];
  async function glint(el) {
    const b = box(el); if (!b || playing) return; playing = true;
    const sx = Math.min(630, b.x + b.w - 2), sy = Math.max(8, b.y + 2), cy = b.y + b.h / 2, l = Math.max(6, b.x - 3), r = Math.min(634, b.x + b.w + 3);
    try {
      for (const i of [0, 1, 2, 1, 2, 3]) { const f = POSES[i]; if (!idle()) break; layer().innerHTML = f(sx, sy, cy, l, r); await new Promise(res => setTimeout(res, 130)); }
    } finally { const g = svg.querySelector("#glint"); if (g) g.innerHTML = ""; playing = false; }
  }

  // a playable character only speaks if it's the one you're playing or is standing in this room (texts and voices
  // in your head, "GUS (TEXT)|", "IRIS (IN YOUR HEAD)|", always get through)
  function canSay(line) {
    const who = (String(line).match(/^([^|]*)\|/) || [])[1], c = who && who.toLowerCase();
    if (!c || !["nell", "gus", "morris", "iris"].includes(c) || c === G.char) return true;
    const p = G.chars && G.chars[c]; return !!(p && p.room === G.room && (G.cast || []).includes(c));
  }
  async function tick() {
    const s = signature(); if (s !== sig) { sig = s; idleS = 0; spoken = 0; }
    if (!idle()) return;
    idleS++;
    const st = nextStep(G); if (!st) return;
    if (idleS >= T.glint && (idleS - T.glint) % T.every === 0) { const el = target(st); if (el) glint(el); }
    const lines = st.nudge || [];
    if (spoken < lines.length && idleS >= T.first + spoken * T.again) { spoken++; const l = lines[spoken - 1]; if (canSay(l)) await say(l); }
  }
  setInterval(tick, 1000);
  return { T, tick, next: () => nextStep(G), target: () => target(nextStep(G)), glint: () => { const el = target(nextStep(G)); return el && glint(el); },
    get idle() { return idleS; }, set idle(v) { idleS = v; }, get spoken() { return spoken; } };
}
