// DEMOS, continued: nine classic illusions, each with one honest control or measurement.
//   Kanizsa (1955)                      illusory contours; shrink the inducers to find where the edges go
//   Hermann (1870), Schrauf et al. (1997), Geier et al. (2008)   the Hermann and scintillating grids, and the wavy grid that kills them
//   Bonneh, Cooperman & Sagi (2001)     motion-induced blindness, moving vs still mask
//   Troxler (1804)                      peripheral fading, blurred vs sharp edges
//   Hinton's lilac chaser (Bach 2005)   Troxler fading + a negative afterimage + apparent motion
//   Afterimage scene                    adapt to an inverted-colour picture, then see colour in a grey one
//   Anstis (2001)                       the stepping feet
//   Fraser & Wilcox (1979), Kitaoka & Ashida (2003)  peripheral drift, nulled with real rotation
//   Ebbinghaus / Titchener circles      size contrast, by adjustment
import { mean, shuffle } from "./fit.js";

const END = "GC_LIVE_END";
const sfx = (n) => window.SFX && window.SFX.play(n);
// answer key presses while an animation runs: buttons() → [[key, label]]; returns stop()
function live(ctx, buttons, onKey) {
  let on = true;
  (async () => { while (on) {
    const b = buttons(), r = await ctx.key([...b.map(x => x[0]), END], { buttons: b, quiet: true }).catch(() => null);
    if (!r || !on || r.key === END) return; sfx("key"); onKey(r.key); } })();
  return () => { on = false; window.dispatchEvent(new KeyboardEvent("keydown", { key: END })); };
}
// press-and-hold reporting: SPACE, or a finger / mouse held down on the screen
function holder(ctx) {
  const h = { down: false };
  const kd = (e) => { if (e.key === " ") { e.preventDefault(); h.down = true; } }, ku = (e) => { if (e.key === " ") { e.preventDefault(); h.down = false; } };
  const pd = () => { h.down = true; }, pu = () => { h.down = false; };
  window.addEventListener("keydown", kd, true); window.addEventListener("keyup", ku, true);
  ctx.canvas.addEventListener("pointerdown", pd); window.addEventListener("pointerup", pu); window.addEventListener("pointercancel", pu);
  h.off = () => { window.removeEventListener("keydown", kd, true); window.removeEventListener("keyup", ku, true);
    ctx.canvas.removeEventListener("pointerdown", pd); window.removeEventListener("pointerup", pu); window.removeEventListener("pointercancel", pu); };
  return h;
}
function timer(ctx, s) { const g = ctx.g; g.fillStyle = "#7b7890"; g.font = "500 16px 'Saira Condensed'"; g.textAlign = "right"; g.fillText(`${Math.max(0, Math.ceil(s))} S`, ctx.W - 16, 26); }
function label(ctx, t, x, y, col = "#7b7890") { const g = ctx.g; g.fillStyle = col; g.font = "500 16px 'Saira Condensed'"; g.textAlign = "center"; g.fillText(t, x, y); }
function cross(g, x, y, col = "#000", s = 7) { g.fillStyle = col; g.fillRect(x - s, y - 1, 2 * s, 2); g.fillRect(x - 1, y - s, 2, 2 * s); }
function blob(g, x, y, sd, [r, gg, b], peak = 1) {           // a Gaussian blob: alpha follows exp(-d²/2sd²) out to 3 sd
  const gr = g.createRadialGradient(x, y, 0, x, y, 3 * sd);
  for (let i = 0; i <= 12; i++) { const d = i / 12 * 3; gr.addColorStop(i / 12, `rgba(${r},${gg},${b},${(peak * Math.exp(-d * d / 2)).toFixed(4)})`); }
  g.fillStyle = gr; g.fillRect(x - 3 * sd, y - 3 * sd, 6 * sd, 6 * sd);
}
const disc = (g, x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const f2 = (v) => isFinite(v) ? v.toFixed(2) : "-", f1 = (v) => isFinite(v) ? v.toFixed(1) : "-";

/* ---------------- Kanizsa (1955) ---------------- */
export const KANIZSA = { id: "kanizsa", group: "ILLUSIONS", title: "Kanizsa triangle", sub: "A bright triangle with edges. None of it is on the screen.",
  blurb: "Three discs with bites taken out, and a white triangle that is whiter than white, with edges where there is no change in light at all. Shrink the discs until the edges go. (Kanizsa, 1955.)",
  instructions: { lines: ["You will see three black discs with bites taken out of them.", "Look for the edges of a white triangle between them.", "Make the discs smaller until the triangle's edges disappear, then press SPACE.", "Try turning the discs around, or flipping black and white, along the way."],
    keys: [["UP", "BIGGER DISCS"], ["DOWN", "SMALLER DISCS"], ["R", "TURN THE DISCS AROUND"], ["O", "OUTLINE TRIANGLE ON / OFF"], ["N", "NEGATIVE"], ["SPACE", "THE EDGES ARE GONE"]] },
  async run(ctx) {
    const { g, cx } = ctx, S = 300, R = S / Math.sqrt(3), cy = ctx.cy + 22;
    let r = 70, rot = false, outline = true, neg = false;
    const V = [0, 1, 2].map(i => { const a = -Math.PI / 2 + i * 2 * Math.PI / 3; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
    const O = [0, 1, 2].map(i => { const a = Math.PI / 2 + i * 2 * Math.PI / 3; return [cx + .95 * R * Math.cos(a), cy + .95 * R * Math.sin(a)]; });
    const poly = (P) => { g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
    const draw = () => {
      const fg = neg ? "#fff" : "#000", bg = neg ? 0 : 1; ctx.clear(bg);
      if (outline) { g.strokeStyle = fg; g.lineWidth = 3; g.lineJoin = "miter"; poly(O); g.stroke();
        if (!rot) { g.fillStyle = neg ? "#000" : "#fff"; poly(V); g.fill(); } }  // the occluder: background-coloured, so physically nothing
      g.fillStyle = fg;
      for (const [x, y] of V) { const d = Math.atan2(cy - y, cx - x) + (rot ? Math.PI : 0);
        g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, d + Math.PI / 6, d - Math.PI / 6 + Math.PI * 2); g.closePath(); g.fill(); }
      ctx.status(`SUPPORT RATIO ${(2 * r / S).toFixed(2)}${rot ? "  DISCS TURNED" : ""}${neg ? "  NEGATIVE" : ""}`);
    };
    ctx.say("Shrink the discs (DOWN) until the triangle's edges are gone. R turns them around, O hides the outline triangle, N flips black and white.");
    for (;;) {
      draw();
      const k = (await ctx.key(["ArrowUp", "ArrowDown", "r", "o", "n", " "], { quiet: true, buttons: [["ArrowUp", "BIGGER"], ["ArrowDown", "SMALLER"],
        ["r", rot ? "UN-TURN DISCS" : "TURN DISCS"], ["o", outline ? "HIDE OUTLINE" : "SHOW OUTLINE"], ["n", "NEGATIVE"], [" ", "EDGES GONE"]] })).key;
      if (k === " ") break;
      if (k === "ArrowUp") r = Math.min(100, r + 3); else if (k === "ArrowDown") r = Math.max(12, r - 3);
      else if (k === "r") rot = !rot; else if (k === "o") outline = !outline; else if (k === "n") neg = !neg;
    }
    const sr = 2 * r / S;
    ctx.say(`The edges went at a support ratio of ${sr.toFixed(2)} (real edge over total side length). Shipley & Kellman (1992) found illusory contour clarity grows with exactly that ratio, whatever the size. Turn the discs around and the triangle is gone at any ratio: the edges are an inference about occlusion, not a smear of contrast.`);
    ctx.csv("kanizsa.csv", ["disc_radius_px", "side_px", "support_ratio", "discs_turned", "outline", "negative"], [[r, S, sr, rot ? 1 : 0, outline ? 1 : 0, neg ? 1 : 0]]);
  } };

/* ---------------- the Hermann grid, the scintillating grid, and the wavy grid ---------------- */
export const GRIDS = { id: "grids", group: "ILLUSIONS", title: "Scintillating grids", sub: "Dark dots that are only where you're not looking.",
  blurb: "Grey smudges at the crossings of a Hermann grid (Hermann, 1870), black dots flashing in the white discs of a scintillating grid (Schrauf, Lingelbach & Wist, 1997). Then bend the streets (Geier et al., 2008) and watch a textbook explanation fall over.",
  instructions: { lines: ["You will see a grid of black squares with light streets between them.", "Look around the grid. Notice what appears at the crossings you are not looking at.", "Look straight at one crossing: is anything there?", "Then make the streets wavy and look again."],
    keys: [["H", "HERMANN GRID"], ["S", "SCINTILLATING GRID"], ["W", "STRAIGHT / WAVY STREETS"], ["SPACE", "DONE"]] },
  async run(ctx) {
    const { g, W, H } = ctx, P = 74, w = 14, A = 9, lam = 2 * P, ph = Math.PI / 2;
    let kind = "h", wavy = false;
    const ox = ((W / 2) % P), oy = ((H / 2) % P);                           // a crossing at the centre of the screen
    const yy = (y0, x) => y0 + (wavy ? A * Math.sin(2 * Math.PI * x / lam + ph) : 0), xx = (x0, y) => x0 + (wavy ? A * Math.sin(2 * Math.PI * y / lam + ph) : 0);
    const draw = () => {
      ctx.clear(0); g.strokeStyle = kind === "h" ? "#fff" : "rgb(120,120,120)"; g.lineWidth = w; g.lineCap = "butt";
      for (let y0 = oy - P; y0 < H + P; y0 += P) { g.beginPath(); for (let x = -10; x <= W + 10; x += 4) x < -9 ? g.moveTo(x, yy(y0, x)) : g.lineTo(x, yy(y0, x)); g.stroke(); }
      for (let x0 = ox - P; x0 < W + P; x0 += P) { g.beginPath(); for (let y = -10; y <= H + 10; y += 4) y < -9 ? g.moveTo(xx(x0, y), y) : g.lineTo(xx(x0, y), y); g.stroke(); }
      if (kind === "s") { g.fillStyle = "#fff";
        for (let y0 = oy - P; y0 < H + P; y0 += P) for (let x0 = ox - P; x0 < W + P; x0 += P) {
          let x = x0, y = y0; for (let i = 0; i < 12; i++) { x = xx(x0, y); y = yy(y0, x); }       // where the two curved streets cross
          disc(g, x, y, w * .62); } }
      ctx.status(`${kind === "h" ? "HERMANN" : "SCINTILLATING"} GRID  ${wavy ? "WAVY" : "STRAIGHT"} STREETS`);
    };
    ctx.say("Let your eyes wander. H Hermann grid, S scintillating grid, W bends the streets.");
    for (;;) {
      draw();
      const k = (await ctx.key(["h", "s", "w", " "], { quiet: true, buttons: [["h", "HERMANN"], ["s", "SCINTILLATING"], ["w", wavy ? "STRAIGHT" : "WAVY"], [" ", "DONE"]] })).key;
      if (k === " ") break; if (k === "w") wavy = !wavy; else kind = k;
    }
    ctx.say("The old story: an on-centre cell at a crossing has more light in its inhibitory surround than one in a street, so crossings look darker, and only in the periphery where receptive fields are big. But bend the streets and the dots mostly vanish, with the same local light at each crossing. Whatever does it cares about straight, aligned edges (Geier et al., 2008).");
  } };

/* ---------------- motion-induced blindness: Bonneh, Cooperman & Sagi (2001) ---------------- */
export const MIB = { id: "mib", group: "ILLUSIONS", title: "Motion-induced blindness", sub: "Three yellow dots. Bright, steady, and gone.",
  blurb: "Three bright yellow dots sit perfectly still while a blue pattern turns behind them. Keep your eyes on the centre and they vanish, one or two at a time, for seconds. (Bonneh, Cooperman & Sagi, 2001, Nature 411:798.)",
  instructions: { lines: ["Keep your eyes on the white dot in the centre the whole time.", "Three yellow dots sit still while a blue pattern moves behind them.", "Press and hold SPACE whenever at least one yellow dot has disappeared. Let go when they are all back.", "There are two runs: one with the blue pattern turning, one with it still."],
    keys: [["SPACE (HOLD)", "A YELLOW DOT IS GONE"]] },
  async run(ctx) {
    const { g, cx, cy } = ctx;
    const L = await ctx.choose("Two runs, a turning mask and a still one, in random order.", [["s", "2 × 20 SECONDS"], ["l", "2 × 40 SECONDS"]]);
    const T = L === "s" ? 20 : 40, res = {};
    const C = []; for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) if (Math.hypot(i, j) <= 5.2 && (i || j)) C.push([i * 44, j * 44]);
    const Y = [[cx - 160, cy - 95], [cx + 160, cy - 95], [cx, cy + 180]];
    for (const moving of shuffle([true, false])) {
      ctx.say(`${moving ? "Turning" : "Still"} mask. Eyes on the white dot. Hold SPACE (or press on the screen) while any yellow dot is gone.`);
      ctx.clear(0); ctx.fix("#fff", 3); await ctx.wait(1200);
      const h = holder(ctx); let down = false, t0 = 0, n = 0, tot = 0, last = 0;
      try {
        await ctx.loop((t) => {
          ctx.clear(0); const a = moving ? t * Math.PI * 2 * .3 : 0, c = Math.cos(a), s = Math.sin(a);
          g.strokeStyle = "rgb(40,90,255)"; g.lineWidth = 3; g.beginPath();
          for (const [x, y] of C) { const X = cx + x * c - y * s, Yy = cy + x * s + y * c; g.moveTo(X - 9, Yy); g.lineTo(X + 9, Yy); g.moveTo(X, Yy - 9); g.lineTo(X, Yy + 9); }
          g.stroke(); g.fillStyle = "rgb(255,230,0)"; for (const [x, y] of Y) disc(g, x, y, 6);
          g.fillStyle = "#fff"; g.fillRect(cx - 3, cy - 3, 6, 6); timer(ctx, T - t); last = Math.min(t, T);
          if (h.down !== down) { if (h.down) { n++; t0 = last; } else tot += last - t0; down = h.down; }
          ctx.status(down ? "SOMETHING'S GONE" : "ALL THREE THERE"); return t < T; });
      } finally { h.off(); }
      if (down) tot += T - t0;
      res[moving ? "m" : "s"] = { n, frac: tot / T, mean: n ? tot / n : NaN };
    }
    const { m, s } = res; ctx.status(""); const times = (n) => `${n} TIME${n === 1 ? "" : "S"}`;
    ctx.plot({ title: "MOTION-INDUCED BLINDNESS", x: { lo: .4, hi: 2.6, label: "MASK", ticks: [] }, y: { lo: 0, hi: 100, label: "% OF TIME A DOT WAS GONE", ticks: [0, 25, 50, 75, 100] },
      vlines: [{ x: 1, cls: "sD", label: "TURNING" }, { x: 2, cls: "sD", label: "STILL" }],
      series: [{ name: "TURNING MASK", cls: "sG", pts: [[1, 100 * m.frac]] }, { name: "STILL MASK", cls: "sA", pts: [[2, 100 * s.frac]] }],
      notes: [[`TURNING ${times(m.n)}, MEAN ${f1(m.mean)} S`, "sG"], [`STILL ${times(s.n)}, MEAN ${f1(s.mean)} S`, "sA"]] });
    ctx.say(m.n + s.n === 0 ? "Nothing vanished? Keep your eyes dead still on the centre; it usually takes a few seconds to start." :
      m.frac > s.frac ? `Gone ${Math.round(100 * m.frac)}% of the time with the mask turning, ${Math.round(100 * s.frac)}% with it still. Salient, unchanging targets drop out of awareness when motion competes for them, though they are still processed: their orientation still causes adaptation.`
        : `Gone ${Math.round(100 * m.frac)}% of the time turning, ${Math.round(100 * s.frac)}% still. Usually the turning mask wins by a lot; a still mask leaves mostly ordinary Troxler fading.`);
    ctx.csv("mib.csv", ["mask", "disappearances", "fraction_invisible", "mean_duration_s"], [["turning", m.n, m.frac, m.mean], ["still", s.n, s.frac, s.mean]]);
  } };

/* ---------------- Troxler (1804): peripheral fading ---------------- */
export const TROXLER = { id: "troxler", group: "ILLUSIONS", title: "Troxler fading", sub: "Hold still and the edge of the world fills in.",
  blurb: "A faint pink blob off to the side. Don't look at it. If your eyes hold still, it fades into the grey, because neurons stop signalling what doesn't change. Blurred versus sharp edges, timed. (Troxler, 1804.)",
  instructions: { lines: ["Keep your eyes on the black cross in the centre. Do not look at the pink blob.", "After a while the blob will fade into the grey background.", "Press SPACE the moment it is completely gone.", "If nothing happens after 20 seconds, the trial ends by itself."],
    keys: [["SPACE", "THE BLOB IS GONE"]] },
  async run(ctx) {
    const { g, cx, cy } = ctx, sd = 28, cap = 20000, data = [];
    const trials = shuffle([true, true, true, false, false, false]);
    for (let i = 0; i < trials.length; i++) {
      const blur = trials[i], a = [0, 180, 25, 155, 205, 335][Math.floor(Math.random() * 6)] * Math.PI / 180, x = cx + 270 * Math.cos(a), y = cy + 200 * Math.sin(a);
      ctx.status(`TRIAL ${i + 1} / ${trials.length}  ${blur ? "BLURRED" : "SHARP"}`);
      ctx.say("Eyes on the cross. SPACE when the pink blob has completely gone.");
      ctx.clear(.5); cross(g, cx, cy); await ctx.wait(800);
      if (blur) blob(g, x, y, sd, [205, 120, 160], .7); else { g.fillStyle = "rgb(182,122,150)"; disc(g, x, y, 1.6 * sd); }   // sharp: the blurred blob's peak colour
      cross(g, cx, cy);
      const r = await ctx.key([" "], { buttons: [[" ", "GONE"]], timeout: cap });
      data.push({ blur, t: r.key ? r.rt / 1000 : cap / 1000, gaveUp: !r.key });
      ctx.clear(.5); await ctx.wait(600);
    }
    ctx.status(""); const B = data.filter(d => d.blur).map(d => d.t), Sh = data.filter(d => !d.blur).map(d => d.t);
    ctx.plot({ title: "TIME TO FADE", x: { lo: .4, hi: 2.6, label: "EDGE", ticks: [] }, y: { lo: 0, hi: 22, label: "SECONDS", ticks: [0, 5, 10, 15, 20] },
      vlines: [{ x: 1, cls: "sD", label: "BLURRED" }, { x: 2, cls: "sD", label: "SHARP" }], hlines: [{ y: 20, cls: "sM", label: "GAVE UP" }],
      series: [{ name: "BLURRED", cls: "sG", pts: B.map((t, i) => [1 + (i - 1) * .08, t]) }, { name: "SHARP", cls: "sA", pts: Sh.map((t, i) => [2 + (i - 1) * .08, t]) }],
      notes: [[`MEAN BLURRED ${f1(mean(B))} S`, "sG"], [`MEAN SHARP ${f1(mean(Sh))} S`, "sA"]] });
    ctx.say(mean(B) < mean(Sh) ? `Blurred blobs faded in ${f1(mean(B))} s on average, sharp ones in ${f1(mean(Sh))} s. Tiny eye movements refresh a sharp edge; a blurred one barely changes under them, so it adapts away and the surround fills it in.`
      : `Blurred ${f1(mean(B))} s, sharp ${f1(mean(Sh))} s. Usually the blurred blob goes much sooner: small eye movements keep refreshing sharp edges. Every microsaccade resets the clock, so hold very still.`);
    ctx.csv("troxler.csv", ["edge", "seconds_to_fade", "gave_up"], data.map(d => [d.blur ? "blurred" : "sharp", d.t, d.gaveUp ? 1 : 0]));
  } };

/* ---------------- the lilac chaser (Jeremy Hinton; Bach, 2005) ---------------- */
export const LILAC = { id: "lilac", group: "ILLUSIONS", title: "Lilac chaser", sub: "Twelve lilac discs. A green one that isn't there.",
  blurb: "Twelve blurred lilac discs in a ring, one missing at a time, the gap running round. Fixate the cross: a green disc chases round and the lilac ones fade away. Three effects at once: Troxler fading, a negative afterimage and apparent motion. (Jeremy Hinton, after Bach, 2005.)",
  instructions: { lines: ["Keep your eyes on the black cross in the centre.", "Twelve lilac discs sit in a ring; one at a time goes missing.", "Watch what travels round the ring, and what happens to the lilac discs.", "Try sharp discs and a slower gap. At the end you will be asked what you saw."],
    keys: [["B", "BLURRED / SHARP DISCS"], ["S", "FAST / SLOW"], ["F", "CROSS ON / OFF"], ["SPACE", "DONE"]] },
  async run(ctx) {
    const { g, cx, cy } = ctx; let blur = true, slow = false, fix = true, done = false;
    ctx.say("Eyes on the cross and keep them there for 15 seconds or so. B sharp/blurred discs, S speed, F hides the cross. SPACE when you're done.");
    const stop = live(ctx, () => [["b", blur ? "SHARP DISCS" : "BLURRED DISCS"], ["s", slow ? "FASTER" : "SLOWER"], ["f", fix ? "HIDE CROSS" : "SHOW CROSS"], [" ", "DONE"]],
      (k) => { if (k === "b") blur = !blur; else if (k === "s") slow = !slow; else if (k === "f") fix = !fix; else done = true; });
    try {
      await ctx.loop((t) => {
        ctx.clear(.75); const miss = Math.floor(t / (slow ? .3 : .1)) % 12;
        for (let i = 0; i < 12; i++) { if (i === miss) continue; const a = i * Math.PI / 6 - Math.PI / 2, x = cx + 190 * Math.cos(a), y = cy + 190 * Math.sin(a);
          if (blur) blob(g, x, y, 16, [225, 110, 225]); else { g.fillStyle = "rgb(225,110,225)"; disc(g, x, y, 24); } }
        if (fix) cross(g, cx, cy, "#000", 9);
        ctx.status(`${blur ? "BLURRED" : "SHARP"}  ${slow ? "SLOW" : "FAST"}`); return !done; });
    } finally { stop(); }
    const seen = await ctx.choose("While you fixated, what went round the ring?", [["g", "A GREEN DISC"], ["h", "A GAP"], ["l", "LILAC DISCS"], ["n", "NOTHING MOVED"]]);
    ctx.say((seen === "g" ? "A green disc, which is nowhere on the screen. " : seen === "h" ? "A gap, which is what's actually there. Fixate harder and give it 10 seconds: it goes green. " : "Try again, eyes nailed to the cross. ")
      + "The lilac discs adapt their spot of retina and fade (Troxler); where one goes missing, the adapted spot shows its complement, green (afterimage); and the jumping gap is seen as one moving object (apparent motion). Sharp discs fade far less.");
  } };

/* ---------------- the colour afterimage scene ---------------- */
// natural colours; the adaptor keeps each region's luminance and flips (and boosts) its chroma; the test is the luminance alone
const SCENE = [["rect", [0, 0, 960, 330], [110, 170, 235]], ["circ", [780, 105, 55], [255, 215, 40]], ["rect", [0, 330, 960, 210], [70, 150, 60]],
  ["rect", [150, 250, 26, 110], [110, 70, 40]], ["circ", [163, 215, 62], [35, 125, 45]], ["rect", [340, 220, 260, 150], [200, 50, 45]],
  ["poly", [[318, 222], [470, 120], [622, 222]], [60, 60, 150]], ["rect", [445, 290, 50, 80], [240, 200, 110]], ["rect", [370, 250, 50, 40], [150, 220, 245]], ["rect", [520, 250, 50, 40], [150, 220, 245]]];
const luma = ([r, g, b]) => .299 * r + .587 * g + .114 * b;
const cl = (v) => Math.round(Math.max(0, Math.min(255, v)));
function scene(ctx, map) {
  const g = ctx.g;
  for (const [k, p, c] of SCENE) { const [r, gg, b] = map(c); g.fillStyle = `rgb(${r},${gg},${b})`; g.beginPath();
    if (k === "rect") g.rect(...p); else if (k === "circ") g.arc(p[0], p[1], p[2], 0, Math.PI * 2); else p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.fill(); }
}
const ADAPT = (c) => { const Y = luma(c); return c.map(v => cl(Y - 1.3 * (v - Y))); }, GREY = (c) => { const v = cl(128 + (luma(c) - 128) * .55); return [v, v, v]; };
export const AFTER = { id: "afterimage", group: "ILLUSIONS", title: "Colour afterimage", sub: "Stare at a wrong-coloured picture, then see a grey one in colour.",
  blurb: "A house in the wrong colours: orange sky, magenta grass, a cyan house. Stare at the dot on it, then the picture turns grey and fills with the right colours. Your cones and the colour-opponent cells after them have adapted, and the grey picture borrows their imbalance. Timed. (After Sadowski's Spanish castle.)",
  instructions: { lines: ["Keep your eyes on the small dot in the middle of the picture. Don't look around.", "After the countdown, the picture turns grey.", "Keep looking at the dot. Press SPACE when the colours you see in the grey picture have gone."],
    keys: [["SPACE", "THE COLOUR HAS GONE"]] },
  async run(ctx) {
    const { g, cx, cy } = ctx;
    const T = +(await ctx.choose("How long to stare?", [["15", "15 SECONDS"], ["30", "30 SECONDS"]]));
    const test = await ctx.choose("And then?", [["p", "A GREY PICTURE"], ["b", "A BLANK GREY SCREEN"]]);
    ctx.say("Eyes on the dot. Don't look around: the effect is stuck to your retina, so moving your eyes smears it.");
    await ctx.loop((t) => { ctx.clear(0); scene(ctx, ADAPT); ctx.fix("#000", 4); g.fillStyle = "#fff"; g.fillRect(cx - 1, cy - 1, 2, 2); timer(ctx, T - t); return t < T; });
    if (test === "p") scene(ctx, GREY); else ctx.clear(.5);
    ctx.fix("#000", 4);
    ctx.say("Keep looking at the dot. SPACE when the colour has gone.");
    const r = await ctx.key([" "], { buttons: [[" ", "COLOUR GONE"]], timeout: 60000 });
    const d = r.key ? r.rt / 1000 : 60;
    ctx.clear(0); scene(ctx, (c) => c); ctx.fix("#000", 4);
    ctx.say(`It lasted ${d.toFixed(1)} s after ${T} s of staring. This is the picture in its real colours: the ones your adapted visual system painted on the grey${test === "b" ? " (on a blank screen you get the inverted colours as blurry patches; the grey picture's edges give them somewhere to live)" : ""}.`);
    ctx.csv("afterimage.csv", ["adapt_s", "test", "duration_s"], [[T, test === "p" ? "grey_picture" : "blank", d]]);
  } };

/* ---------------- the stepping feet: Anstis (2001) ---------------- */
export const FEET = { id: "feet", group: "ILLUSIONS", title: "Stepping feet", sub: "Two bars glide side by side. Or do they walk?",
  blurb: "A yellow bar and a dark blue bar slide across stripes at exactly the same steady speed. They seem to take turns, step, step, like feet, because apparent speed goes with contrast and the stripes change each bar's contrast in opposite directions. (Anstis, 2001, Perception 30:785.)",
  instructions: { lines: ["A yellow bar and a blue bar move back and forth together, at a constant speed.", "Watch them, then look a little above them. Do they move smoothly, or take turns?", "Take the stripes away to see what they are really doing."],
    keys: [["S", "STRIPES ON / OFF"], ["P", "PAUSE"], ["SPACE", "DONE"]] },
  async run(ctx) {
    const { g, W, cy } = ctx, sw = 24, len = 2 * sw, v = 60; let stripes = true, paused = false, done = false, x = 120, dir = 1;
    ctx.say("Watch the bars, then look a little above them. S takes the stripes away, P pauses. SPACE when you're done.");
    const stop = live(ctx, () => [["s", stripes ? "NO STRIPES" : "STRIPES"], ["p", paused ? "GO" : "PAUSE"], [" ", "DONE"]],
      (k) => { if (k === "s") stripes = !stripes; else if (k === "p") paused = !paused; else done = true; });
    try {
      await ctx.loop((t, dt) => {
        if (!paused) { x += dir * v * Math.min(dt, .05); if (x > W - 120 - len) { x = W - 120 - len; dir = -1; } if (x < 120) { x = 120; dir = 1; } }
        ctx.clear(.5); if (stripes) { g.fillStyle = "#000"; for (let s = 0; s < W; s += 2 * sw) g.fillRect(s, cy - 120, sw, 240); g.fillStyle = "#fff"; for (let s = sw; s < W; s += 2 * sw) g.fillRect(s, cy - 120, sw, 240); }
        g.fillStyle = "rgb(255,235,40)"; g.fillRect(x, cy - 46, len, 22); g.fillStyle = "rgb(20,20,120)"; g.fillRect(x, cy + 24, len, 22);
        g.fillStyle = "#e9e6ff"; g.fillRect(W / 2 - 2, cy - 98, 4, 4);
        ctx.status(`${stripes ? "STRIPES" : "NO STRIPES"}${paused ? "  PAUSED" : ""}`); return !done; });
    } finally { stop(); }
    ctx.say("With no stripes they move in lockstep, as they always did. On the stripes, the yellow bar is high-contrast on black and nearly invisible on white; the blue one the reverse. Low contrast looks slow, so each bar seems to stall while the other one moves.");
  } };

/* ---------------- peripheral drift: Fraser & Wilcox (1979), Kitaoka & Ashida (2003) ---------------- */
export const DRIFT = { id: "drift", group: "ILLUSIONS", title: "Peripheral drift", sub: "Two still wheels that turn. Make them stop.",
  blurb: "Rings of black, dark grey, white and light grey. Nothing moves, yet out of the corner of your eye they turn, black towards dark grey, white towards light grey. Spin them the other way for real until they stand still. (Fraser & Wilcox, 1979; Kitaoka & Ashida's rotating snakes, 2003.)",
  instructions: { lines: ["Keep your eyes on the cross in the centre. The wheels are to the left and right.", "They may seem to turn, most of all just after a blink or a glance.", "Make them really turn the other way until, from the centre, they look still. Then press SPACE.", "The control wheels have no light-to-dark order and should not drift at all."],
    keys: [["LEFT", "TURN ANTICLOCKWISE"], ["RIGHT", "TURN CLOCKWISE"], ["C", "CONTROL WHEELS"], ["SPACE", "THEY LOOK STILL"]] },
  async run(ctx) {
    const { g, cx, cy } = ctx; let v = 0, ang = 0, control = false, done = false;
    const SAW = [0, .3, 1, .7], SYM = [0, .5, 1, .5];
    const wheel = (X, Y) => { const seq = control ? SYM : SAW;
      for (let k = 0; k < 5; k++) { const r0 = 26 + k * 26, n = 4 * Math.round(2 * Math.PI * (r0 + 13) / 72), da = Math.PI * 2 / n, off = ang + k * da * 1.5;
        for (let i = 0; i < n; i++) { const c = Math.round(255 * seq[i % 4]); g.fillStyle = `rgb(${c},${c},${c})`;
          g.beginPath(); g.arc(X, Y, r0 + 26, off + i * da, off + (i + 1) * da + .004); g.arc(X, Y, r0, off + (i + 1) * da + .004, off + i * da, true); g.closePath(); g.fill(); } } };
    ctx.say("Eyes on the cross. LEFT / RIGHT turn the wheels for real; set them so they look still. C swaps in control wheels. SPACE when still.");
    const stop = live(ctx, () => [["ArrowLeft", "ANTICLOCKWISE"], ["ArrowRight", "CLOCKWISE"], ["c", control ? "ILLUSION WHEELS" : "CONTROL WHEELS"], [" ", "LOOKS STILL"]],
      (k) => { if (k === "ArrowLeft") v -= .5; else if (k === "ArrowRight") v += .5; else if (k === "c") control = !control; else done = true; });
    try {
      await ctx.loop((t, dt) => { ang += v * Math.PI / 180 * Math.min(dt, .05); ctx.clear(.5); wheel(cx - 290, cy); wheel(cx + 290, cy); cross(g, cx, cy, "#e00", 8);
        ctx.status(`REAL ROTATION ${v === 0 ? "0" : `${Math.abs(v).toFixed(1)} DEG/S ${v > 0 ? "CLOCKWISE" : "ANTICLOCKWISE"}`}${control ? "  CONTROL" : ""}`); return !done; });
    } finally { stop(); }
    ctx.say((control ? "That was on the control wheels, which have no drift to cancel. " : "")
      + (v < 0 ? `You needed ${(-v).toFixed(1)} deg/s of real anticlockwise turn to cancel it: the illusion runs clockwise, black to dark grey, white to light grey. `
        : v > 0 ? `You set ${v.toFixed(1)} deg/s clockwise. The illusion should run clockwise here (black to dark grey), so a null usually needs anticlockwise turn. `
          : "No turn needed? Blink, or let your gaze wander near the cross: the drift comes in bursts. ")
      + "The leading idea: high-contrast edges are processed slightly faster than low-contrast ones, so each sawtooth step looks like a small motion signal in one direction.");
    ctx.csv("peripheral_drift.csv", ["null_speed_deg_per_s_clockwise", "control"], [[v, control ? 1 : 0]]);
  } };

/* ---------------- Ebbinghaus / Titchener circles ---------------- */
export const EBBING = { id: "ebbinghaus", group: "ILLUSIONS", title: "Ebbinghaus circles", sub: "Same orange circle. Big neighbours make it small.",
  blurb: "An orange circle ringed by big circles looks smaller than one ringed by little ones. Adjust one to match the other; then the same with no rings, to show you can do it. Six settings. (Ebbinghaus, popularised by Titchener, 1901.)",
  instructions: { lines: ["You will see two orange circles, each with its own ring of grey circles.", "Change the size of the adjustable orange circle until the two orange circles look the same size.", "Ignore the grey circles. Press SPACE when they match.", "There are six settings."],
    keys: [["UP", "BIGGER"], ["DOWN", "SMALLER"], ["SPACE", "THEY MATCH"]] },
  async run(ctx) {
    const { g, cx, cy } = ctx, R0 = 28, data = [];
    const ring = (x, y, kind) => { g.fillStyle = "rgb(150,150,150)";
      if (kind === "big") for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; disc(g, x + 108 * Math.cos(a), y + 108 * Math.sin(a), 44); }
      if (kind === "small") for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; disc(g, x + 58 * Math.cos(a), y + 58 * Math.sin(a), 10); } };
    const conds = shuffle([["big", "small"], ["big", "small"], ["small", "big"], ["small", "big"], ["none", "none"], ["none", "none"]]);
    ctx.say("UP / DOWN change the size of the circle marked ADJUST. SPACE when the two orange circles look the same size.");
    for (let i = 0; i < conds.length; i++) {
      const [refK, cmpK] = conds[i], left = Math.random() < .5, xr = cx + (left ? -230 : 230), xc = cx + (left ? 230 : -230);
      let rc = 16 + Math.random() * 26;
      ctx.status(`SETTING ${i + 1} / ${conds.length}`);
      for (;;) {
        ctx.clear(0); ring(xr, cy, refK); ring(xc, cy, cmpK); g.fillStyle = "rgb(240,140,40)"; disc(g, xr, cy, R0); disc(g, xc, cy, rc);
        label(ctx, "ADJUST", xc, cy + 175);
        const k = (await ctx.key(["ArrowUp", "ArrowDown", " "], { quiet: true, buttons: [["ArrowUp", "BIGGER"], ["ArrowDown", "SMALLER"], [" ", "MATCH"]] })).key;
        if (k === " ") break; rc = k === "ArrowUp" ? Math.min(44, rc + .5) : Math.max(12, rc - .5);
      }
      data.push({ ref: refK, ratio: rc / R0 });
    }
    const by = (k) => data.filter(d => d.ref === k).map(d => d.ratio), mB = mean(by("big")), mS = mean(by("small")), mN = mean(by("none"));
    ctx.plot({ title: "EBBINGHAUS MATCHES", x: { lo: .4, hi: 3.6, label: "REFERENCE CIRCLE'S RING", ticks: [] }, y: { lo: .6, hi: 1.4, label: "MATCH / TRUE SIZE", ticks: [.6, .8, 1, 1.2, 1.4] },
      vlines: [{ x: 1, cls: "sD", label: "BIG RING" }, { x: 2, cls: "sD", label: "SMALL RING" }, { x: 3, cls: "sD", label: "NO RINGS" }], hlines: [{ y: 1, cls: "sM", label: "TRUE SIZE" }],
      series: [{ name: "REF IN BIG RING", cls: "sG", pts: by("big").map((r, i) => [1 + (i - .5) * .12, r]) }, { name: "REF IN SMALL RING", cls: "sA", pts: by("small").map((r, i) => [2 + (i - .5) * .12, r]) },
        { name: "NO RINGS", cls: "sB", pts: by("none").map((r, i) => [3 + (i - .5) * .12, r]) }],
      notes: [[`BIG RING ${f2(mB)}`, "sG"], [`SMALL RING ${f2(mS)}`, "sA"], [`NO RINGS ${f2(mN)}`, "sB"]] });
    ctx.say(mB < mS ? `Next to big circles you matched it at ${f2(mB)} of its true size; next to small ones at ${f2(mS)}; alone, ${f2(mN)}. Size is judged relative to the neighbours. (Famously, a grasping hand is much less fooled than the eye: Aglioti et al., 1995.)`
      : `Big ring ${f2(mB)}, small ring ${f2(mS)}, no rings ${f2(mN)}. Most people set the circle in the big ring well under 1: size is judged relative to the neighbours.`);
    ctx.csv("ebbinghaus.csv", ["reference_ring", "match_over_true"], data.map(d => [d.ref, d.ratio]));
  } };

export const DEMOS2 = [KANIZSA, GRIDS, MIB, TROXLER, LILAC, AFTER, FEET, DRIFT, EBBING];
