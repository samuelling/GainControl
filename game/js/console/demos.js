// DEMOS: four bistable figures. Each runs as a perceptual-rivalry measurement: watch, and press one key while you see
// one interpretation and the other key when it switches. Dominance durations come out as a histogram (they are
// famously skewed, roughly gamma-distributed) with the mean per percept.
import { mean, median } from "./fit.js";

// a generic dominance run: draw(g, t) animates; keys [[k1, label1], [k2, label2]]
async function rivalry(ctx, { draw, keys, secs, intro }) {
  const { g } = ctx;
  const mode = await ctx.choose(intro + " How long?", [["s", "30 SECONDS"], ["l", "90 SECONDS"], ["w", "JUST WATCH"]]);
  const T = mode === "s" ? 30 : mode === "l" ? 90 : 0;
  const log = []; let cur = null, tStart = 0, ended = false;
  ctx.say(T ? `Report what you see, the whole time. Press ${keys[0][1]} (${keys[0][0].toUpperCase()}) or ${keys[1][1]} (${keys[1][0].toUpperCase()}) every time it changes.` : "Just watch. It will change on its own. Press MENU when you're done.");
  // the key listener runs alongside the animation
  const listen = async () => { while (!ended) { const r = await ctx.key(keys.map(k => k[0]), { buttons: keys, quiet: true }).catch(() => null); if (!r || ended) return;
      const t = performance.now() / 1000; if (r.key !== cur) { if (cur) log.push({ p: cur, d: t - tStart }); cur = r.key; tStart = t; ctx.status(`NOW: ${keys.find(k => k[0] === cur)[1]}`); } } };
  if (T) listen();
  await ctx.loop((t) => { draw(g, t); if (T) { g.fillStyle = "#7b7890"; g.font = "500 16px 'Saira Condensed'"; g.textAlign = "right"; g.fillText(`${Math.max(0, Math.ceil(T - t))} S`, ctx.W - 16, 26); }
    return !T || t < T; });
  ended = true;
  if (!T) return;
  if (cur) log.push({ p: cur, d: performance.now() / 1000 - tStart, last: true });
  const full = log.filter(l => !l.last);                 // the last percept was cut off by the timer: exclude it
  const by = (k) => full.filter(l => l.p === k).map(l => l.d);
  const all = full.map(l => l.d), bins = 12, maxD = Math.max(4, Math.ceil(Math.max(0, ...all)));
  const hist = (arr) => Array.from({ length: bins }, (_, i) => { const lo = i * maxD / bins, hi = lo + maxD / bins; return [lo + maxD / bins / 2, arr.filter(d => d >= lo && d < hi).length]; });
  const yMax = Math.max(3, ...hist(by(keys[0][0])).map(h => h[1]), ...hist(by(keys[1][0])).map(h => h[1]));
  ctx.plot({ title: "DOMINANCE DURATIONS", x: { lo: 0, hi: maxD, label: "SECONDS", ticks: Array.from({ length: 5 }, (_, i) => +(i * maxD / 4).toFixed(1)) },
    y: { lo: 0, hi: yMax + 1, label: "COUNT", ticks: [0, Math.ceil(yMax / 2), yMax] },
    series: [{ name: keys[0][1], cls: "sG", pts: hist(by(keys[0][0])), line: true }, { name: keys[1][1], cls: "sA", pts: hist(by(keys[1][0])), line: true }],
    notes: [[`SWITCHES ${full.length}`, "sW"], [`MEAN ${keys[0][1]} ${fmtS(mean(by(keys[0][0])))}`, "sG"], [`MEAN ${keys[1][1]} ${fmtS(mean(by(keys[1][0])))}`, "sA"], [`MEDIAN ALL ${fmtS(median(all))}`, "sM"]] });
  ctx.say(full.length < 3 ? "Hardly any switches. Try again and relax your gaze: the reversals come on their own, every few seconds." :
    "Dominance durations are skewed: lots of short ones, a long tail. Neither interpretation wins for long, because the winning one adapts.");
  ctx.csv("rivalry.csv", ["percept", "duration_s"], full.map(l => [keys.find(k => k[0] === l.p)[1], l.d]));
}
const fmtS = (v) => isFinite(v) ? v.toFixed(1) + " S" : "-";

export const NECKER = { id: "necker", group: "DEMOS", title: "Necker cube", sub: "One drawing, two cubes. Which face is in front?",
  blurb: "A wireframe cube with no depth cues. Your visual system has to pick a 3D interpretation, and it keeps changing its mind.",
  instructions: { lines: ["A wireframe cube appears. Keep your eyes on the small dot in its middle.", "Sooner or later the cube flips: the face that was in front jumps to the back. Don't try to make it happen. Just report what you see.", "Press the key for what you see as soon as the cube appears, and again every time it flips. Pick 30 or 90 seconds, or JUST WATCH."],
    keys: [["A", "LOWER-LEFT FACE IN FRONT"], ["L", "UPPER-RIGHT FACE IN FRONT"]] },
  run: (ctx) => rivalry(ctx, { secs: 30, intro: "Fix your eyes on the cube.", keys: [["a", "LOWER FACE FRONT"], ["l", "UPPER FACE FRONT"]],
    draw(g, t) { ctx.clear(0); const s = 150, o = 70, x = ctx.cx - (s + o) / 2, y = ctx.cy - (s - o) / 2;
      g.strokeStyle = "#e9e6ff"; g.lineWidth = 3; g.lineJoin = "round"; g.beginPath();
      g.rect(x, y, s, s); g.rect(x + o, y - o, s, s);
      for (const [a, b] of [[0, 0], [s, 0], [0, s], [s, s]]) { g.moveTo(x + a, y + b); g.lineTo(x + o + a, y - o + b); }
      g.stroke(); g.fillStyle = "#e9e6ff"; g.fillRect(ctx.cx - 2, ctx.cy - 2, 4, 4); } }) };

export const RUBIN = { id: "rubin", group: "DEMOS", title: "Rubin vase", sub: "A vase, or two faces in profile.",
  blurb: "Figure and ground: the same edge can belong to the vase or to the faces, never both at once.",
  instructions: { lines: ["A white shape on black. Look at the middle of the screen.", "It is either a vase, or two faces looking at each other. You'll see one, then the other, never both at once.", "Press the key for what you see now, and again every time it changes. Pick 30 or 90 seconds, or JUST WATCH."],
    keys: [["A", "VASE"], ["L", "FACES"]] },
  run: (ctx) => rivalry(ctx, { secs: 30, intro: "Look at the middle.", keys: [["a", "VASE"], ["l", "FACES"]],
    draw(g) { ctx.clear(0); g.fillStyle = "#e9e6ff"; const cx = ctx.cx, top = 70;
      // the vase's half-width down its height: its edge is the faces' profile (forehead, brow, nose, lips, chin, neck)
      const prof = [[0, 104], [30, 76], [80, 66], [110, 58], [126, 72], [158, 30], [178, 56], [194, 46], [204, 60], [216, 48], [238, 62], [256, 50], [288, 84], [340, 94], [380, 118], [400, 118]];
      g.beginPath(); prof.forEach(([y, w], i) => i ? g.lineTo(cx - w, top + y) : g.moveTo(cx - w, top + y));
      prof.slice().reverse().forEach(([y, w]) => g.lineTo(cx + w, top + y));
      g.closePath(); g.fill(); } }) };

export const QUARTET = { id: "quartet", group: "DEMOS", title: "Motion quartet", sub: "Four flashing dots: up-down or side to side?",
  blurb: "Two dots flash on one diagonal, then two on the other. You see motion, but whether it goes vertically or horizontally is up to your visual system.",
  instructions: { lines: ["Two dots flash on one diagonal, then two on the other, back and forth. Keep your eyes on the cross in the middle.", "You'll see the dots moving, either up and down or side to side. After a while it can switch.", "Press the key for the motion you see now, and again every time it switches. Pick 30 or 90 seconds, or JUST WATCH."],
    keys: [["A", "UP AND DOWN"], ["L", "SIDE TO SIDE"]] },
  run: (ctx) => rivalry(ctx, { secs: 30, intro: "Keep your eyes on the centre cross.", keys: [["a", "UP-DOWN"], ["l", "SIDE TO SIDE"]],
    draw(g, t) { ctx.clear(0); const w = 150, h = 150, ph = Math.floor(t * 3) % 2;           // 3 Hz alternation, square aspect
      g.fillStyle = "#e9e6ff"; const d = (x, y) => { g.beginPath(); g.arc(ctx.cx + x, ctx.cy + y, 14, 0, Math.PI * 2); g.fill(); };
      if (ph) { d(-w / 2, -h / 2); d(w / 2, h / 2); } else { d(w / 2, -h / 2); d(-w / 2, h / 2); }
      g.fillStyle = "#7b7890"; g.fillRect(ctx.cx - 6, ctx.cy - 1, 12, 2); g.fillRect(ctx.cx - 1, ctx.cy - 6, 2, 12); } }) };

export const SPHERE = { id: "sphere", group: "DEMOS", title: "Spinning sphere", sub: "Structure from motion: which way is it turning?",
  blurb: "Dots on a transparent sphere, rotating. Nothing tells you which dots are in front, so the direction of rotation flips.",
  instructions: { lines: ["A cloud of dots turns like a glass globe. Keep your eyes on the red square in the middle.", "Watch the dots that seem to be on the front of the globe. Which way are they moving? The direction will flip from time to time.", "Press the key for the direction you see now, and again every time it flips. Pick 30 or 90 seconds, or JUST WATCH."],
    keys: [["A", "FRONT MOVES LEFT"], ["L", "FRONT MOVES RIGHT"]] },
  run: (ctx) => { const N = 260, P = Array.from({ length: N }, () => { const z = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2; return [Math.sqrt(1 - z * z), a, z]; });
    return rivalry(ctx, { secs: 30, intro: "Look at the centre.", keys: [["a", "FRONT MOVES LEFT"], ["l", "FRONT MOVES RIGHT"]],
      draw(g, t) { ctx.clear(0); g.fillStyle = "#e9e6ff"; const R = 170, w = t * Math.PI * 2 * .2;
        for (const [r, a, z] of P) { const x = r * Math.cos(a + w); g.fillRect(ctx.cx + x * R - 2, ctx.cy + z * R - 2, 4, 4); }
        g.fillStyle = "#ff3b5c"; g.fillRect(ctx.cx - 3, ctx.cy - 3, 6, 6); } }); } };
