// THE ADJUSTMENT LIBRARY: fourteen classics measured by matching, nulling or constant stimuli, so every result is a
// relative number (a ratio, a nulling angle, a grey-level difference, a PSE, a slope or a Weber fraction) that survives
// an uncalibrated laptop or phone at an unknown viewing distance.
//   ILLUSIONS        Ponzo (1912) · Poggendorff (in Zöllner, 1860) · Zöllner (1860) · Gregory & Heard (1979) café wall
//                    Delboeuf (1865)
//   LIGHT & COLOUR   Heinemann (1955) simultaneous contrast · White (1979) · Cornsweet (1970) · Pinna, Brelstaff &
//                    Spillmann (2001) watercolour
//   HEARING          Schouten (1940) missing fundamental · Shepard (1964) circular pitch · van Noorden (1975) streaming
//   TIME             Jazayeri & Shadlen (2010) interval reproduction · Getty (1975) Weber's law for duration
// Grey levels are nominal pixel values (no gamma correction): the lightness modules report differences between
// conditions, which survive a monotonic display nonlinearity. Sounds are synthesised with WebAudio at a modest level.
import { fitLogistic, logistic, mean, median, sem, shuffle, linFit } from "./fit.js";

const FONT = "'Saira Condensed', sans-serif";
const uni = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const grey = (v) => { const c = Math.round(255 * clamp(v, 0, 1)); return `rgb(${c},${c},${c})`; };
const quick = (ctx, q, f) => ctx.choose("How long?", [["q", q], ["f", f]]).then(k => k === "q");
const f2 = (v, d = 2) => isFinite(v) ? v.toFixed(d) : "-";
const sgn = (v, d = 2) => isFinite(v) ? `${v >= 0 ? "+" : ""}${v.toFixed(d)}` : "-";
const pc = (v) => isFinite(v) ? `${v >= 0 ? "+" : ""}${(v * 100).toFixed(1)}%` : "-";
const label = (g, t, x, y, col = "#fff", size = 22) => { g.fillStyle = col; g.font = `600 ${size}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, x, y); };
const line = (g, x0, y0, x1, y1) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
const ADJ_KEYS = [["UP / DOWN", "SMALL STEP"], ["RIGHT / LEFT", "BIG STEP"], ["SPACE", "IT MATCHES"]];

// THE METHOD OF ADJUSTMENT: draw(v), wait for a key; DOWN/UP are small steps, LEFT/RIGHT big ones, SPACE accepts.
// Every key has an on-screen button, so it runs on a phone.
async function adjust(ctx, { v, lo, hi, small, big, draw, less = "LESS", more = "MORE", extra = [], onExtra = null }) {
  for (;;) {
    draw(v);
    const r = await ctx.key(["ArrowLeft", "ArrowDown", "ArrowUp", "ArrowRight", " ", ...extra.map(e => e[0])], { quiet: true,
      buttons: [["ArrowLeft", `${less} ++`], ["ArrowDown", less], ["ArrowUp", more], ["ArrowRight", `${more} ++`], ...extra, [" ", "MATCH"]] });
    if (r.key === " ") return v;
    if (r.key === "ArrowLeft") v -= big; else if (r.key === "ArrowDown") v -= small; else if (r.key === "ArrowUp") v += small;
    else if (r.key === "ArrowRight") v += big; else if (onExtra) await onExtra(r.key, v);
    v = clamp(v, lo, hi);
  }
}
// a category plot: one mean ± SEM per condition, a reference line, labels on the category lines
function catPlot(ctx, { title, ylabel, cats, ref = 0, refLabel = "", notes = [], pad = .2, minSpan = .1 }) {
  const ms = cats.map(c => mean(c.vals)), es = cats.map(c => sem(c.vals));
  const all = [ref, ...ms.map((m, i) => m + es[i]), ...ms.map((m, i) => m - es[i]), ...cats.flatMap(c => c.vals)].filter(isFinite);
  let lo = Math.min(...all), hi = Math.max(...all); const span = Math.max(minSpan, hi - lo); lo -= span * pad; hi += span * pad;
  const ticks = [lo + (hi - lo) * .1, ref, lo + (hi - lo) * .9].map(t => +t.toPrecision(2)).sort((a, b) => a - b).filter((t, i, a) => i === 0 || Math.abs(t - a[i - 1]) > (hi - lo) * .12);
  ctx.plot({ title, x: { lo: .4, hi: cats.length + .6, label: "CONDITION", ticks: [] }, y: { lo, hi, label: ylabel, ticks },
    vlines: cats.map((c, i) => ({ x: i + 1, cls: "sD", label: c.name, dy: (i % 2) * 16 })), hlines: [{ y: ref, cls: "sM", label: refLabel }],
    series: cats.map((c, i) => ({ name: c.name, cls: c.cls, pts: [[i + 1, ms[i], es[i]]] })), notes });
  return ms;
}

/* ================================================================= ILLUSIONS ================================================================ */

/* ---------------- Ponzo (1912): converging rails ---------------- */
export const PONZO = { id: "ponzo", group: "ILLUSIONS", tag: "PONZO 1912", title: "Ponzo illusion",
  sub: "Two equal bars between converging rails. The one near the point looks longer.",
  blurb: "Two horizontal bars between two lines that converge like railway tracks. Stretch one bar until both look the same length, then do it again with no rails. The bar nearer the apex looks longer. Measured as a ratio of lengths, so screen size doesn't matter. Ponzo himself took the figure from Sanford's 1898 textbook.",
  ref: "Ponzo, M. (1912). Rapports entre quelques illusions visuelles de contraste angulaire et l'appréciation de grandeur des astres à l'horizon. Archives Italiennes de Biologie, 58, 327–329.",
  instructions: { lines: ["Two horizontal bars. Sometimes two slanted lines run past them like railway tracks going off into the distance.", "Change the length of the bar marked with the little arrow until the two bars look the same length. Ignore the slanted lines.", "Press SPACE when they match."],
    keys: ADJ_KEYS },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  8 SETTINGS", "FULL  16 SETTINGS");
    const reps = q ? 2 : 4, S = 120, { g, cx } = ctx, data = [];
    let trials = []; for (let r = 0; r < reps; r++) for (const rails of [true, false]) for (const adj of ["near", "far"]) trials.push({ rails, adj });
    trials = shuffle(trials);
    ctx.say("Make the two bars the same length. The arrow marks the one that changes. SPACE when they match.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], up = Math.random() < .5, yA = up ? 22 : ctx.H - 22, dir = up ? 1 : -1, tn = Math.tan(25 * Math.PI / 180);
      const yN = yA + dir * 150, yF = yA + dir * 420, xN = cx + uni(-18, 18), xF = cx + uni(-18, 18);
      ctx.status(`SETTING ${i + 1} / ${trials.length}`);
      const L = await adjust(ctx, { v: S * uni(.7, 1.3), lo: 40, hi: 220, small: 1, big: 6, less: "SHORTER", more: "LONGER", draw: (v) => {
        ctx.clear(0); g.lineCap = "round"; g.strokeStyle = "#e9e6ff"; g.lineWidth = 4;
        if (T.rails) for (const s of [-1, 1]) line(g, cx, yA, cx + s * 495 * tn, yA + dir * 495);
        const ln = T.adj === "near" ? v : S, lf = T.adj === "far" ? v : S;
        line(g, xN - ln / 2, yN, xN + ln / 2, yN); line(g, xF - lf / 2, yF, xF + lf / 2, yF);
        const ya = T.adj === "near" ? yN : yF; g.fillStyle = "#ffb547"; g.beginPath(); g.moveTo(90, ya); g.lineTo(70, ya - 10); g.lineTo(70, ya + 10); g.closePath(); g.fill(); } });
      // how much longer the near bar looked than the far one
      const ratio = T.adj === "far" ? L / S : S / L;
      data.push({ ...T, apex: up ? "top" : "bottom", set: L, ratio });
    }
    const by = (r) => data.filter(d => d.rails === r).map(d => d.ratio);
    const [mR, mN] = catPlot(ctx, { title: "PONZO MATCHES", ylabel: "NEAR BAR / FAR BAR", ref: 1, refLabel: "EQUAL", cats: [{ name: "RAILS", cls: "sA", vals: by(true) }, { name: "NO RAILS", cls: "sB", vals: by(false) }],
      notes: [[`RAILS ${pc(mean(by(true)) - 1)}`, "sA"], [`NO RAILS ${pc(mean(by(false)) - 1)}`, "sB"]] });
    const eff = mR - mN;
    ctx.say(eff > .01 ? `Between the rails, the bar near the apex looked ${(eff * 100).toFixed(0)}% longer than the far one, compared with no rails. The rails read as depth, and a bar that is "further away" but the same size on the retina must be bigger.`
      : `Rails ${pc(mR - 1)}, no rails ${pc(mN - 1)}: little Ponzo effect this run. Most people see the near-apex bar several percent longer. Try the full run.`);
    ctx.csv("ponzo.csv", ["setting", "rails", "apex", "adjusted_bar", "standard_px", "set_px", "near_over_far"], data.map((d, i) => [i + 1, d.rails ? 1 : 0, d.apex, d.adj, S, d.set, d.ratio]));
  } };

/* ---------------- Poggendorff (reported by Zöllner, 1860): the broken diagonal ---------------- */
export const POGGENDORFF = { id: "poggendorff", group: "ILLUSIONS", tag: "POGGENDORFF 1860", title: "Poggendorff illusion",
  sub: "A diagonal passes behind a bar. Its two halves don't seem to line up, even when they do.",
  blurb: "A slanted line disappears behind a pair of verticals and comes out the other side. Slide the right-hand piece up or down until it looks like the continuation of the left-hand piece. Most people set it too flat. The error is measured as a fraction of the gap, at three slants, and once with no verticals. Poggendorff, the editor of Annalen der Physik, spotted it in a figure Zöllner sent in; Zöllner's 1860 paper is where it first appears.",
  ref: "Zöllner, F. (1860). Ueber eine neue Art von Pseudoskopie und ihre Beziehungen zu den von Plateau und Oppel beschriebenen Bewegungsphaenomenen. Annalen der Physik und Chemie, 186(7), 500–525. (Poggendorff's figure.)",
  instructions: { lines: ["A slanted line goes behind two upright lines and comes out the other side.", "Move the right-hand piece up or down until it lines up exactly with the left-hand piece, as if it were one straight line.", "Press SPACE when it looks straight."],
    keys: [["UP / DOWN", "MOVE IT, SMALL STEP"], ["RIGHT / LEFT", "UP / DOWN, BIG STEP"], ["SPACE", "IT LINES UP"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  8 SETTINGS", "FULL  16 SETTINGS");
    const reps = q ? 2 : 4, { g, cx, cy } = ctx, w = 90, seg = 150, data = [];
    let trials = []; for (let r = 0; r < reps; r++) { for (const th of [30, 45, 60]) trials.push({ th, par: true }); trials.push({ th: 45, par: false }); }
    trials = shuffle(trials);
    ctx.say("Move the right-hand piece until the two pieces make one straight line. SPACE when it does.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], m = Math.random() < .5 ? 1 : -1, t = Math.tan(T.th * Math.PI / 180), yc = cy + uni(-30, 30), c = Math.cos(T.th * Math.PI / 180);
      const yL = yc + m * t * w / 2, yTrue = yc - m * t * w / 2;           // where the line meets the left and right verticals
      ctx.status(`SETTING ${i + 1} / ${trials.length}`);
      const v = await adjust(ctx, { v: uni(-40, 40), lo: -160, hi: 160, small: 1, big: 6, less: "DOWN", more: "UP", draw: (v) => {
        ctx.clear(0); g.lineCap = "butt"; g.lineWidth = 3;
        if (T.par) { g.strokeStyle = "#9a97b0"; line(g, cx - w / 2, cy - 230, cx - w / 2, cy + 230); line(g, cx + w / 2, cy - 230, cx + w / 2, cy + 230); }
        g.strokeStyle = "#e9e6ff"; const yR = yTrue - v;
        line(g, cx - w / 2 - seg * c, yL + m * t * seg * c, cx - w / 2, yL); line(g, cx + w / 2, yR, cx + w / 2 + seg * c, yR - m * t * seg * c); } });
      // classic error: the right piece set too flat (less rise across the gap than the true continuation), as a fraction of the gap
      const off = -v, err = off * m / w;
      data.push({ ...T, dir: m > 0 ? "rising" : "falling", offPx: off, err });
    }
    const pts = [30, 45, 60].map(th => { const e = data.filter(d => d.par && d.th === th).map(d => d.err); return [90 - th, mean(e) * 100, sem(e) * 100]; }).sort((a, b) => a[0] - b[0]);
    const np = data.filter(d => !d.par).map(d => d.err), mNP = mean(np) * 100, all = [...pts.map(p => p[1] + p[2]), ...pts.map(p => p[1] - p[2]), mNP, 0].filter(isFinite);
    const lo = Math.floor(Math.min(...all) / 5) * 5 - 5, hi = Math.ceil(Math.max(...all) / 5) * 5 + 5;
    ctx.plot({ title: "POGGENDORFF ERRORS", x: { lo: 20, hi: 70, label: "ANGLE BETWEEN LINE AND VERTICALS  DEG", ticks: [30, 45, 60] }, y: { lo, hi, label: "TOO FLAT  % OF GAP", ticks: [lo, 0, hi] },
      series: [{ name: "WITH VERTICALS", cls: "sA", pts, line: true }, { name: "NO VERTICALS", cls: "sB", pts: [[45, mNP, sem(np) * 100]] }], hlines: [{ y: 0, cls: "sM", label: "TRULY STRAIGHT" }],
      notes: pts.map(p => [`${p[0]} DEG  ${sgn(p[1], 1)}%`, "sA"]).concat([[`NO VERTICALS ${sgn(mNP, 1)}%`, "sB"]]) });
    const mP = mean(data.filter(d => d.par).map(d => d.err)) * 100, acute = pts[0], wide = pts[pts.length - 1];
    const grows = acute[1] > wide[1];
    ctx.say(mP > 1 ? `With the verticals in place you set the far piece ${mP.toFixed(0)}% of the gap too flat (${acute[1].toFixed(0)}% at the sharpest angle, ${wide[1].toFixed(0)}% at the widest), and ${mNP.toFixed(0)}% with no verticals. The classic Poggendorff error, as if acute angles were seen as larger than they are${grows ? "; like most people, yours grew as the angle got sharper." : ". It usually grows as the angle gets sharper; more settings will show whether yours does."}`
      : `Average error ${sgn(mP, 1)}% of the gap: little Poggendorff effect this run. Most people set the far piece too flat, more so at sharp angles.`);
    ctx.csv("poggendorff.csv", ["setting", "line_angle_from_horizontal", "verticals", "direction", "offset_px_classic_positive", "gap_px", "error_fraction_of_gap"], data.map((d, i) => [i + 1, d.th, d.par ? 1 : 0, d.dir, d.offPx * (d.dir === "rising" ? 1 : -1), w, d.err]));
  } };

/* ---------------- Zöllner (1860): hatched parallels ---------------- */
function hatched(g, x, y, ang, len, hatch) {
  const a = ang * Math.PI / 180, ux = Math.cos(a), uy = -Math.sin(a);
  g.lineWidth = 3; line(g, x - ux * len / 2, y - uy * len / 2, x + ux * len / 2, y + uy * len / 2);
  if (hatch === null) return;
  const h = hatch * Math.PI / 180, hx = Math.cos(h) * 15, hy = -Math.sin(h) * 15; g.lineWidth = 2.5;
  for (let s = -len / 2 + 22; s <= len / 2 - 22; s += 30) line(g, x + ux * s - hx, y + uy * s - hy, x + ux * s + hx, y + uy * s + hy);
}
export const ZOLLNER = { id: "zollner", group: "ILLUSIONS", tag: "ZÖLLNER 1860", title: "Zöllner illusion",
  sub: "Two parallel lines with short cross-hatching. They look tilted toward each other.",
  blurb: "Two long diagonal lines: one cross-hatched with short horizontal strokes, the other with vertical ones. Rotate one line until the pair look parallel. The hatching makes them seem to splay, so you set them non-parallel. Each setting is repeated with the hatching swapped, which flips the illusion, so the difference cancels any bias; a run with no hatching is the baseline. Angles are measured in degrees of rotation, which don't depend on screen size.",
  ref: "Zöllner, F. (1860). Ueber eine neue Art von Pseudoskopie und ihre Beziehungen zu den von Plateau und Oppel beschriebenen Bewegungsphaenomenen. Annalen der Physik und Chemie, 186(7), 500–525.",
  instructions: { lines: ["Two long slanted lines, often covered in short cross-strokes.", "Turn the line with the orange dot until the two long lines look exactly parallel. Ignore the short strokes.", "Press SPACE when they look parallel."],
    keys: [["UP / DOWN", "TURN IT, SMALL STEP"], ["RIGHT / LEFT", "TURN IT, BIG STEP"], ["SPACE", "THEY'RE PARALLEL"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  8 SETTINGS", "FULL  16 SETTINGS");
    const nH = q ? 3 : 6, nC = q ? 2 : 4, { g, cx, cy } = ctx, data = [];
    let trials = []; for (let r = 0; r < nH; r++) trials.push({ cfg: 1 }, { cfg: 2 }); for (let r = 0; r < nC; r++) trials.push({ cfg: 0 });
    trials = shuffle(trials);
    // a line at φ with hatches at h looks rotated away from the hatches (acute angles are overestimated)
    const away = (phi, h) => (((phi - h) % 180 + 180) % 180) < 90 ? 1 : -1;
    ctx.say("Turn the line with the orange dot until the two long lines look parallel. SPACE when they do.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], phi = Math.random() < .5 ? 45 : 135, a = phi * Math.PI / 180, nx = Math.sin(a) * 80, ny = Math.cos(a) * 80;
      const bSide = Math.random() < .5 ? 1 : -1, cfg = T.cfg || (Math.random() < .5 ? 1 : 2), hA = cfg === 1 ? 0 : 90, hB = cfg === 1 ? 90 : 0;
      const pred = (away(phi, hA) - away(phi, hB)) / 2;                    // which way B must turn to look parallel to A
      ctx.status(`SETTING ${i + 1} / ${trials.length}`);
      const v = await adjust(ctx, { v: (Math.random() < .5 ? -1 : 1) * uni(1, 4), lo: -15, hi: 15, small: .1, big: .5, less: "TURN ONE WAY", more: "TURN OTHER WAY", draw: (v) => {
        ctx.clear(0); g.strokeStyle = "#e9e6ff"; g.lineCap = "butt";
        const ax = cx - bSide * nx, ay = cy - bSide * ny, bx = cx + bSide * nx, by = cy + bSide * ny;
        hatched(g, ax, ay, phi, 400, T.cfg ? hA : null); hatched(g, bx, by, phi + v, 400, T.cfg ? hB : null);
        const b = (phi + v) * Math.PI / 180; g.fillStyle = "#ffb547"; g.beginPath(); g.arc(bx + Math.cos(b) * 215, by - Math.sin(b) * 215, 6, 0, Math.PI * 2); g.fill(); } });
      data.push({ hatched: !!T.cfg, cfg: T.cfg, phi, set: v, illusion: v * pred });
    }
    const H = data.filter(d => d.hatched).map(d => d.illusion), C = data.filter(d => !d.hatched).map(d => d.illusion);
    const [mH, mC] = catPlot(ctx, { title: "ZÖLLNER SETTINGS", ylabel: "TURN TO LOOK PARALLEL  DEG", ref: 0, refLabel: "TRULY PARALLEL", minSpan: 2,
      cats: [{ name: "HATCHED", cls: "sA", vals: H }, { name: "NO HATCHES", cls: "sB", vals: C }], notes: [[`HATCHED ${sgn(mean(H), 1)} DEG`, "sA"], [`NO HATCHES ${sgn(mean(C), 1)} DEG`, "sB"]] });
    ctx.say(mH - mC > .3 ? `To look parallel, the hatched lines had to be set ${(mH - mC).toFixed(1)}° apart, against the hatching. Each line seems tilted away from its cross-strokes: the angle between them is seen as bigger than it is.`
      : `Hatched ${sgn(mH, 1)}°, plain ${sgn(mC, 1)}°: little Zöllner effect this run. Most people need a clear counter-rotation, against the hatching. Try the full run.`);
    ctx.csv("zollner.csv", ["setting", "hatched", "config", "main_angle", "set_rotation_deg", "illusion_deg_classic_positive"], data.map((d, i) => [i + 1, d.hatched ? 1 : 0, d.cfg, d.phi, d.set, d.illusion]));
  } };

/* ---------------- Gregory & Heard (1979): the café wall ---------------- */
// Rows of black and white tiles, every other row shifted half a tile, with mortar lines between. The mortar lines
// look like alternating wedges. Nulling: tilt each mortar line against its predicted tilt by α until they look level.
// (Predicted directions checked with a difference-of-Gaussians model of this exact layout, after Morgan & Moulden 1986.)
function cafeWall(ctx, alpha, mortar, mirror) {
  const { g, W, H } = ctx, T = 56, M = 5, R = 5, cols = 14, w = cols * T, h = R * T + (R - 1) * M, x0 = (W - w) / 2, y0 = (H - h) / 2, xc = W / 2;
  ctx.clear(.5); g.save();
  if (mirror) { g.translate(W, 0); g.scale(-1, 1); }
  g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  g.fillStyle = grey(mortar); g.fillRect(x0, y0, w, h);
  // mortar i (between rows i and i+1) appears to rise to the right for even i, fall for odd i; physical tilt is the opposite
  const my = (i, x) => { const yc = y0 + (i + 1) * T + i * M + M / 2, th = -(i % 2 ? -1 : 1) * alpha * Math.PI / 180; return yc - Math.tan(th) * (x - xc); };
  for (let r = 0; r < R; r++) {
    const top = (x) => r === 0 ? y0 : my(r - 1, x) + M / 2, bot = (x) => r === R - 1 ? y0 + h : my(r, x) - M / 2, sh = (r % 2) * T / 2;
    for (let k = -1; k <= cols; k++) {
      const xa = Math.max(x0, x0 + sh + k * T), xb = Math.min(x0 + w, x0 + sh + (k + 1) * T); if (xb <= xa) continue;
      g.fillStyle = (k % 2 + 2) % 2 === 0 ? "#000" : "#fff";
      g.beginPath(); g.moveTo(xa, top(xa)); g.lineTo(xb, top(xb)); g.lineTo(xb, bot(xb)); g.lineTo(xa, bot(xa)); g.closePath(); g.fill();
    }
  }
  g.restore();
}
export const CAFEWALL = { id: "cafewall", group: "ILLUSIONS", tag: "GREGORY & HEARD 1979", title: "Café wall",
  sub: "Straight rows of tiles that look like wedges, as long as the mortar is grey.",
  blurb: "Rows of black and white tiles, every other row shifted by half a tile, with thin mortar lines between them. The mortar lines are level but look tilted, alternately up and down. Bend them the other way until they look level: the bend you need is the illusion, in degrees. With black mortar the illusion should all but vanish (Gregory & Heard's border-locking result). Half the settings are mirror images, which cancels any bias in how you set it.",
  ref: "Gregory, R. L., & Heard, P. (1979). Border locking and the Café Wall illusion. Perception, 8(4), 365–380.",
  instructions: { lines: ["A wall of black and white tiles with thin lines of mortar between the rows.", "The mortar lines may look as if they slope. Use the buttons to bend them until every mortar line looks perfectly level and parallel.", "Press SPACE when they all look level."],
    keys: [["UP / DOWN", "BEND, SMALL STEP"], ["RIGHT / LEFT", "BEND, BIG STEP"], ["SPACE", "THEY LOOK LEVEL"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  8 SETTINGS", "FULL  16 SETTINGS");
    const reps = q ? 2 : 4, data = [];
    let trials = []; for (let r = 0; r < reps; r++) for (const mortar of [.5, 0]) for (const mirror of [false, true]) trials.push({ mortar, mirror });
    trials = shuffle(trials);
    ctx.say("Bend the mortar lines until they all look level and parallel. SPACE when they do.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i]; ctx.status(`SETTING ${i + 1} / ${trials.length}`);
      const a = await adjust(ctx, { v: (Math.random() < .5 ? -1 : 1) * uni(.4, 1.6), lo: -4, hi: 4, small: .05, big: .25, less: "BEND ONE WAY", more: "BEND OTHER WAY",
        draw: (v) => cafeWall(ctx, v, T.mortar, T.mirror) });
      data.push({ ...T, alpha: a });
    }
    const G = data.filter(d => d.mortar > 0).map(d => d.alpha), K = data.filter(d => d.mortar === 0).map(d => d.alpha);
    const [mG, mK] = catPlot(ctx, { title: "CAFÉ WALL NULLING", ylabel: "COUNTER-TILT  DEG", ref: 0, refLabel: "NO ILLUSION", minSpan: .8,
      cats: [{ name: "GREY MORTAR", cls: "sA", vals: G }, { name: "BLACK MORTAR", cls: "sB", vals: K }], notes: [[`GREY ${sgn(mean(G))} DEG`, "sA"], [`BLACK ${sgn(mean(K))} DEG`, "sB"]] });
    ctx.say(mG - mK > .15 ? `With grey mortar you had to tilt each line ${mG.toFixed(2)}° against the illusion to make it look level; with black mortar, ${mK.toFixed(2)}°. Gregory and Heard showed the wedges need mortar between the tile shades: small-scale filtering turns each tile corner into a short tilted segment.`
      : `Grey mortar ${sgn(mG)}°, black ${sgn(mK)}°. Most people need a clear counter-tilt with grey mortar and almost none with black. Try the full run.`);
    ctx.csv("cafe_wall.csv", ["setting", "mortar_grey", "mirrored", "null_tilt_deg_classic_positive"], data.map((d, i) => [i + 1, d.mortar, d.mirror ? 1 : 0, d.alpha]));
  } };

/* ---------------- Delboeuf (1865): concentric circles ---------------- */
export const DELBOEUF = { id: "delboeuf", group: "ILLUSIONS", tag: "DELBOEUF 1865", title: "Delboeuf illusion",
  sub: "A ring just outside a circle makes it look bigger; a ring far away makes it look smaller.",
  blurb: "A circle sits inside a concentric ring. Resize a lone circle on the other side until it matches. A ring that hugs the circle makes it look bigger; as the ring moves out the boost fades and can turn into shrinkage. Measured as a ratio of diameters, and the circle's size changes from setting to setting, so screen size doesn't matter.",
  ref: "Delboeuf, J. L. R. (1865). Note sur certaines illusions d'optique: Essai d'une théorie psychophysique de la manière dont l'œil apprécie les distances et les angles. Bulletins de l'Académie Royale des Sciences, des Lettres et des Beaux-Arts de Belgique, 2e série, 19, 195–216.",
  instructions: { lines: ["On one side, a circle with a ring around it. On the other side, a circle on its own.", "Change the size of the lone circle until it looks the same size as the INNER circle on the other side. Ignore the ring.", "Press SPACE when they match."],
    keys: [["UP / DOWN", "BIGGER / SMALLER, SMALL STEP"], ["RIGHT / LEFT", "BIGGER / SMALLER, BIG STEP"], ["SPACE", "THEY MATCH"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  10 SETTINGS", "FULL  20 SETTINGS");
    const K = [1.25, 1.5, 2, 3, 0], reps = q ? 2 : 4, { g, cx, cy } = ctx, data = [];
    let trials = []; for (let r = 0; r < reps; r++) for (const k of K) trials.push({ k }); trials = shuffle(trials);
    const circ = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); };
    ctx.say("Make the lone circle the same size as the inner circle. SPACE when they match.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], r0 = uni(32, 42), side = Math.random() < .5 ? -1 : 1, xt = cx + side * 220, xc = cx - side * 220, yt = cy + uni(-20, 20), yc = cy + uni(-20, 20);
      ctx.status(`SETTING ${i + 1} / ${trials.length}`);
      const rc = await adjust(ctx, { v: r0 * uni(.7, 1.3), lo: 10, hi: 90, small: .5, big: 3, less: "SMALLER", more: "BIGGER", draw: (v) => {
        ctx.clear(0); g.strokeStyle = "#e9e6ff"; g.lineWidth = 2.5; circ(xt, yt, r0); if (T.k) circ(xt, yt, r0 * T.k); circ(xc, yc, v); } });
      data.push({ k: T.k, r0, rc, ratio: rc / r0 });
    }
    const pts = K.filter(k => k).map(k => { const v = data.filter(d => d.k === k).map(d => d.ratio); return [k, mean(v), sem(v)]; });
    const none = data.filter(d => !d.k).map(d => d.ratio), mN = mean(none), all = [...pts.flatMap(p => [p[1] + p[2], p[1] - p[2]]), mN, 1].filter(isFinite);
    const lo = Math.floor((Math.min(...all) - .03) * 20) / 20, hi = Math.ceil((Math.max(...all) + .03) * 20) / 20;
    ctx.plot({ title: "DELBOEUF MATCHES", x: { lo: 1, hi: 3.2, label: "RING / CIRCLE DIAMETER", ticks: [1.25, 1.5, 2, 3] }, y: { lo, hi, label: "MATCH / TRUE SIZE", ticks: [lo, 1, hi] },
      series: [{ name: "WITH RING", cls: "sA", pts, line: true }], hlines: [{ y: mN, cls: "sB", label: "NO RING" }, { y: 1, cls: "sM", label: "" }],
      notes: pts.map(p => [`${p[0]}×  ${pc(p[1] - 1)}`, "sA"]).concat([[`NO RING ${pc(mN - 1)}`, "sB"]]) });
    const best = pts.reduce((a, b) => (b[1] > a[1] ? b : a)), far = pts[pts.length - 1];
    ctx.say(best[1] - mN > .02 ? `The inner circle looked biggest with the ring at ${best[0]}× its diameter (${pc(best[1] - mN)} against no ring)${best === far ? "" : `; with the ring at 3× it came out at ${pc(far[1] - mN)}`}. ${far[1] < best[1] - .02 ? "A close ring is absorbed into the circle; a distant one becomes a big neighbour that it's compared against." : "Usually the boost fades as the ring moves out; more settings will show whether yours does."}`
      : `Peak ${pc(best[1] - mN)} against no ring, at ${best[0]}×. Most people see the inner circle a few percent bigger when the ring is close (around 1.5×). Try the full run.`);
    ctx.csv("delboeuf.csv", ["setting", "ring_over_circle", "circle_radius_px", "match_radius_px", "match_over_true"], data.map((d, i) => [i + 1, d.k || "none", d.r0, d.rc, d.ratio]));
  } };

/* ============================================================== LIGHT & COLOUR ============================================================= */

/* ---------------- Heinemann (1955): simultaneous brightness contrast ---------------- */
export const SIMCONTRAST = { id: "simcontrast", group: "LIGHT & COLOUR", tag: "HEINEMANN 1955", title: "Simultaneous contrast",
  sub: "The same grey looks darker on white and lighter on black.",
  blurb: "A grey square sits in a surround that ranges from near black to near white. Set a comparison square on the plain background until it matches. The match drifts the opposite way to the surround: induction. Heinemann measured it by brightness matching, as here. Grey levels are nominal (your screen isn't gamma-corrected), so read the slope and the direction, not the exact values.",
  ref: "Heinemann, E. G. (1955). Simultaneous brightness induction as a function of inducing- and test-field luminances. Journal of Experimental Psychology, 50(2), 89–96.",
  instructions: { lines: ["Two small grey squares. One sits in the middle of a big square that may be dark or light; the other sits on the plain background.", "Make the plain-background square LIGHTER or DARKER until the two small squares look the same shade of grey.", "Press SPACE when they match."],
    keys: [["UP / DOWN", "LIGHTER / DARKER, SMALL STEP"], ["RIGHT / LEFT", "LIGHTER / DARKER, BIG STEP"], ["SPACE", "THEY MATCH"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  10 SETTINGS", "FULL  20 SETTINGS");
    const SUR = [.1, .3, .5, .7, .9], TEST = .5, reps = q ? 2 : 4, { g, cx, cy } = ctx, data = [];
    let trials = []; for (let r = 0; r < reps; r++) for (const s of SUR) trials.push({ s }); trials = shuffle(trials);
    ctx.say("Make the two small squares the same shade. SPACE when they match.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], side = Math.random() < .5 ? -1 : 1, xt = cx + side * 210, xc = cx - side * 210;
      ctx.status(`SETTING ${i + 1} / ${trials.length}`);
      const m = await adjust(ctx, { v: uni(.25, .75), lo: 0, hi: 1, small: .01, big: .04, less: "DARKER", more: "LIGHTER", draw: (v) => {
        ctx.clear(.5); g.fillStyle = grey(T.s); g.fillRect(xt - 130, cy - 130, 260, 260); g.fillStyle = grey(TEST); g.fillRect(xt - 35, cy - 35, 70, 70);
        g.fillStyle = grey(v); g.fillRect(xc - 35, cy - 35, 70, 70); } });
      data.push({ s: T.s, match: m });
    }
    const pts = SUR.map(s => { const v = data.filter(d => d.s === s).map(d => d.match); return [s, mean(v), sem(v)]; }), f = linFit(data.map(d => d.s), data.map(d => d.match));
    const all = pts.flatMap(p => [p[1] + p[2], p[1] - p[2]]), lo = Math.max(0, Math.floor((Math.min(...all, TEST) - .08) * 10) / 10), hi = Math.min(1, Math.ceil((Math.max(...all, TEST) + .08) * 10) / 10);
    ctx.plot({ title: "BRIGHTNESS MATCHES", x: { lo: 0, hi: 1, label: "SURROUND GREY LEVEL", ticks: SUR }, y: { lo, hi, label: "MATCH GREY LEVEL", ticks: [lo, TEST, hi] },
      series: [{ name: "MATCHES", cls: "sA", pts, curve: (x) => f.m * x + f.c }], hlines: [{ y: TEST, cls: "sM", label: "TRUE GREY" }],
      notes: [[`SLOPE ${sgn(f.m)}`, "sA"], [`DARK SURROUND ${sgn(pts[0][1] - TEST)}`, "sW"], [`LIGHT SURROUND ${sgn(pts[4][1] - TEST)}`, "sW"]] });
    ctx.say(f.m < -.03 ? `The same grey matched ${f2(pts[0][1])} on the darkest surround and ${f2(pts[4][1])} on the lightest: a slope of ${f2(f.m)}. Brightness is set by contrast with the surround, not by the light from the patch alone. Heinemann found the push is strongest when the surround is brighter than the patch.`
      : `Slope ${sgn(f.m)}: little induction this run. Most people's matches fall as the surround gets lighter. Try the full run.`);
    ctx.csv("simultaneous_contrast.csv", ["setting", "surround_grey", "test_grey", "match_grey"], data.map((d, i) => [i + 1, d.s, TEST, d.match]));
  } };

/* ---------------- White (1979): White's illusion ---------------- */
export const WHITES = { id: "whites", group: "LIGHT & COLOUR", tag: "WHITE 1979", title: "White's illusion",
  sub: "Grey on the black stripes looks lighter, though it touches more white.",
  blurb: "Black and white stripes, with a grey bar set into a black stripe on one side and into a white stripe on the other. The grey on the black stripe looks lighter, even though most of its border is with white: the opposite of what simple edge contrast predicts. Match them, adjusting one side or the other. A plain-grey version measures any bias in your settings. Grey levels are nominal; the difference between conditions is the result.",
  ref: "White, M. (1979). A new effect of pattern on perceived lightness. Perception, 8(4), 413–416.",
  instructions: { lines: ["Two striped squares, each with a short grey bar set into its stripes. Sometimes the squares are plain grey instead.", "Make the grey bar marked with the arrow LIGHTER or DARKER until the two grey bars look the same shade.", "Press SPACE when they match."],
    keys: [["UP / DOWN", "LIGHTER / DARKER, SMALL STEP"], ["RIGHT / LEFT", "LIGHTER / DARKER, BIG STEP"], ["SPACE", "THEY MATCH"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  6 SETTINGS", "FULL  12 SETTINGS");
    const reps = q ? 1 : 2, { g, cx, cy } = ctx, P = .5, bh = 26, n = 11, data = [];
    let trials = []; for (let r = 0; r < reps; r++) { trials.push({ kind: "white", adj: "onBlack" }, { kind: "white", adj: "onWhite" }, { kind: "white", adj: "onBlack" }, { kind: "white", adj: "onWhite" }, { kind: "plain", adj: "onBlack" }, { kind: "plain", adj: "onWhite" }); }
    trials = shuffle(trials);
    // panel: n stripes; the grey bar replaces the middle part of stripe 5. phase 0 → stripe 5 is black
    const panel = (x, phase, gv, kind) => { const y0 = cy - n * bh / 2, w = 260;
      for (let k = 0; k < n; k++) { g.fillStyle = kind === "plain" ? grey(.5) : ((k + phase) % 2 === 1 ? "#fff" : "#000"); g.fillRect(x - w / 2, y0 + k * bh, w, bh); }
      g.fillStyle = grey(gv); g.fillRect(x - 32, y0 + 5 * bh, 64, bh); return y0 + 5.5 * bh; };
    ctx.say("Make the two grey bars the same shade. The arrow marks the one that changes. SPACE when they match.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], blackLeft = Math.random() < .5, xB = cx + (blackLeft ? -200 : 200), xW = cx + (blackLeft ? 200 : -200);
      ctx.status(`SETTING ${i + 1} / ${trials.length}`);
      const m = await adjust(ctx, { v: uni(.3, .7), lo: 0, hi: 1, small: .01, big: .04, less: "DARKER", more: "LIGHTER", draw: (v) => {
        ctx.clear(.5);
        const yb = panel(xB, 1, T.adj === "onBlack" ? v : P, T.kind), _ = panel(xW, 0, T.adj === "onWhite" ? v : P, T.kind), xa = T.adj === "onBlack" ? xB : xW;
        g.fillStyle = "#ffb547"; g.beginPath(); g.moveTo(xa, yb + 6 * bh + 4); g.lineTo(xa - 10, yb + 6 * bh + 22); g.lineTo(xa + 10, yb + 6 * bh + 22); g.closePath(); g.fill(); } });
      // E: how much lighter the bar on the black stripe looks than the one on the white stripe, in grey levels
      const E = T.adj === "onWhite" ? m - P : P - m;
      data.push({ ...T, match: m, E });
    }
    const Wv = data.filter(d => d.kind === "white").map(d => d.E), Pv = data.filter(d => d.kind === "plain").map(d => d.E);
    const [mW, mP] = catPlot(ctx, { title: "WHITE'S ILLUSION", ylabel: "ON-BLACK LOOKS LIGHTER BY", ref: 0, refLabel: "NO DIFFERENCE", minSpan: .08,
      cats: [{ name: "STRIPES", cls: "sA", vals: Wv }, { name: "PLAIN GREY", cls: "sB", vals: Pv }], notes: [[`STRIPES ${sgn(mean(Wv))}`, "sA"], [`PLAIN ${sgn(mean(Pv))}`, "sB"], ["GREY LEVELS  0 TO 1", "sM"]] });
    ctx.say(mW - mP > .02 ? `The grey bar on the black stripe looked ${f2(mW - mP)} lighter (on a 0 to 1 scale) than the identical bar on the white stripe. Simple edge contrast predicts the opposite, because the bar on the black stripe shares its long edges with white. Lightness follows which stripe the bar seems to belong to.`
      : `Stripes ${sgn(mW)}, plain ${sgn(mP)}: little White effect this run. Most people see the bar on the black stripe clearly lighter. Try the full run.`);
    ctx.csv("whites_illusion.csv", ["setting", "display", "adjusted", "fixed_grey", "match_grey", "on_black_lighter_by"], data.map((d, i) => [i + 1, d.kind, d.adj, P, d.match, d.E]));
  } };

/* ---------------- Cornsweet (1970): the Craik–O'Brien–Cornsweet edge ---------------- */
export const CORNSWEET = { id: "cornsweet", group: "LIGHT & COLOUR", tag: "CORNSWEET 1970", title: "Cornsweet edge",
  sub: "Two identical greys with a special edge between them. One side looks lighter all over.",
  blurb: "Both halves of the panel are the same grey, except for a light-to-dark ramp right at the border. The whole of the side with the light ramp looks lighter. Null it: add a real, uniform step the other way until the halves look the same. The step you need, as a fraction of the edge's own jump, is how much of a real edge the ramp is worth. A panel with no ramp measures your bias. (Craik and O'Brien described it before Cornsweet's book made it famous.)",
  ref: "Cornsweet, T. N. (1970). Visual Perception. New York: Academic Press.",
  instructions: { lines: ["A wide panel split down the middle. Look at each half as a whole, not just at the middle line.", "Make one half lighter than the other until the two halves look the SAME overall shade.", "Press SPACE when the halves match."],
    keys: [["UP / DOWN", "RIGHT / LEFT LIGHTER, SMALL STEP"], ["RIGHT / LEFT", "RIGHT / LEFT LIGHTER, BIG STEP"], ["SPACE", "HALVES MATCH"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  6 SETTINGS", "FULL  12 SETTINGS");
    const reps = q ? 2 : 4, A = .12, lam = 36, { g, W, cx, cy } = ctx, pw = 760, ph = 280, x0 = cx - pw / 2, data = [];
    let trials = []; for (let r = 0; r < reps; r++) trials.push({ p: 1, A }, { p: -1, A }, { p: Math.random() < .5 ? 1 : -1, A: 0 }); trials = shuffle(trials);
    ctx.say("Make the two halves look the same overall shade. SPACE when they do.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i]; ctx.status(`SETTING ${i + 1} / ${trials.length}`);
      // u = right minus left, as a real uniform step. p = +1: the light ramp is on the left
      const u = await adjust(ctx, { v: uni(-.06, .06), lo: -.3, hi: .3, small: .004, big: .02, less: "LEFT LIGHTER", more: "RIGHT LIGHTER", draw: (u) => {
        ctx.clear(.15);
        for (let x = 0; x < pw; x++) { const d = x + .5 - pw / 2, s = d < 0 ? 1 : -1;
          g.fillStyle = grey(.5 + s * T.p * T.A * Math.exp(-Math.abs(d) / lam) - s * u / 2); g.fillRect(x0 + x, cy - ph / 2, 1, ph); } } });
      data.push({ ...T, u, eff: u * T.p / (2 * A) });
    }
    const E = data.filter(d => d.A > 0).map(d => d.eff), C = data.filter(d => !d.A).map(d => d.eff);
    const [mE, mC] = catPlot(ctx, { title: "CORNSWEET NULLING", ylabel: "STEP NEEDED / EDGE JUMP", ref: 0, refLabel: "NO EFFECT", minSpan: .3,
      cats: [{ name: "RAMP EDGE", cls: "sA", vals: E }, { name: "NO EDGE", cls: "sB", vals: C }], notes: [[`RAMP EDGE ${sgn(mean(E))}`, "sA"], [`NO EDGE ${sgn(mean(C))}`, "sB"]] });
    ctx.say(mE - mC > .05 ? `To cancel the ramp you needed a real step ${f2(mE - mC)} the size of the ramp's own jump, the other way. A thin edge sets the brightness of the whole region behind it: the visual system mostly reports edges and fills in the rest.`
      : `Ramp ${sgn(mE)}, no edge ${sgn(mC)}: little Cornsweet effect this run. Look at each half as a whole and try the full run.`);
    ctx.csv("cornsweet.csv", ["setting", "ramp_amplitude", "light_ramp_side", "null_step_right_minus_left", "effect_fraction_of_edge"], data.map((d, i) => [i + 1, d.A, d.p > 0 ? "left" : "right", d.u, d.eff]));
  } };

/* ---------------- Pinna, Brelstaff & Spillmann (2001): the watercolour effect ---------------- */
const ORANGE = [250, 150, 30], PURPLE = [120, 40, 170];
const tint = (t) => { const c = t >= 0 ? ORANGE : PURPLE, a = Math.min(1, Math.abs(t)); return `rgb(${c.map(v => Math.round(255 + a * (v - 255))).join(",")})`; };
export const WATERCOLOUR = { id: "watercolour", group: "LIGHT & COLOUR", tag: "PINNA ET AL 2001", title: "Watercolour effect",
  sub: "A white shape outlined in purple and orange fills with a faint orange wash.",
  blurb: "A wiggly white shape drawn with a purple line just outside an orange one. The white inside takes on a pale orange tint that isn't there. Match it with a tinted disc. Swap the lines (orange outside) or make them grey and the tint should go. This is a relative colour match on the same screen, so calibration doesn't matter much.",
  ref: "Pinna, B., Brelstaff, G., & Spillmann, L. (2001). Surface color from boundaries: A new 'watercolor' illusion. Vision Research, 41(20), 2669–2676.",
  instructions: { lines: ["A wiggly shape drawn with coloured lines, and a plain disc next to it.", "Look at the white INSIDE the wiggly shape. Tint the disc more orange or more purple until it looks the same colour as the inside of the shape.", "If the inside looks plain white, make the disc plain white. Press SPACE when they match."],
    keys: [["UP / DOWN", "MORE ORANGE / PURPLE, SMALL"], ["RIGHT / LEFT", "MORE ORANGE / PURPLE, BIG"], ["SPACE", "THEY MATCH"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  6 SETTINGS", "FULL  12 SETTINGS");
    const reps = q ? 2 : 4, { g, W, H, cx, cy } = ctx, data = [];
    const K = { in: ["ORANGE INSIDE", "sA"], out: ["ORANGE OUTSIDE", "sV"], grey: ["GREY LINES", "sB"] };
    let trials = []; for (let r = 0; r < reps; r++) for (const k of Object.keys(K)) trials.push({ k }); trials = shuffle(trials);
    const shape = (x, y, ph) => { g.beginPath(); for (let i = 0; i <= 240; i++) { const a = i / 240 * Math.PI * 2, r = 135 * (1 + .1 * Math.sin(6 * a + ph) + .05 * Math.sin(11 * a + 1 + ph));
      const px = x + r * Math.cos(a), py = y + r * Math.sin(a) * .95; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); };
    ctx.say("Tint the disc to match the colour of the white inside the wiggly shape. SPACE when they match.");
    for (let i = 0; i < trials.length; i++) {
      const T = trials[i], side = Math.random() < .5 ? -1 : 1, xs = cx + side * 220, xd = cx - side * 230, ph = uni(0, 6.28);
      const [outer, inner] = T.k === "in" ? [PURPLE, ORANGE] : T.k === "out" ? [ORANGE, PURPLE] : [[110, 110, 110], [175, 175, 175]];
      ctx.status(`SETTING ${i + 1} / ${trials.length}`);
      const t = await adjust(ctx, { v: uni(-.12, .12), lo: -.5, hi: .5, small: .005, big: .025, less: "MORE PURPLE", more: "MORE ORANGE", draw: (t) => {
        g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); g.lineJoin = "round";
        // one wide stroke in the outer colour, then the same stroke in the inner colour clipped to the inside: two touching lines
        shape(xs, cy, ph); g.lineWidth = 14; g.strokeStyle = `rgb(${outer.join(",")})`; g.stroke();
        g.save(); shape(xs, cy, ph); g.clip(); shape(xs, cy, ph); g.strokeStyle = `rgb(${inner.join(",")})`; g.stroke(); g.restore();
        g.fillStyle = tint(t); g.beginPath(); g.arc(xd, cy, 95, 0, Math.PI * 2); g.fill(); } });
      data.push({ k: T.k, t });
    }
    const by = (k) => data.filter(d => d.k === k).map(d => d.t * 100);
    const [mI, mO, mG] = catPlot(ctx, { title: "WATERCOLOUR MATCHES", ylabel: "TINT  + ORANGE  − PURPLE  %", ref: 0, refLabel: "PLAIN WHITE", minSpan: 6,
      cats: Object.keys(K).map(k => ({ name: K[k][0], cls: K[k][1], vals: by(k) })), notes: Object.keys(K).map(k => [`${K[k][0]} ${sgn(mean(by(k)), 1)}%`, K[k][1]]) });
    ctx.say(mI - mG > 1.5 ? `Inside the purple-orange outline you matched a ${mI.toFixed(1)}% orange tint, against ${mG.toFixed(1)}% with grey lines and ${mO.toFixed(1)}% with the colours swapped. The orange spreads from the inner line across the whole white area: colour filled in from a boundary.`
      : `Orange inside ${sgn(mI, 1)}%, swapped ${sgn(mO, 1)}%, grey ${sgn(mG, 1)}%: little spreading this run. The tint is faint; look at the middle of the shape, and try the full run.`);
    ctx.csv("watercolour.csv", ["setting", "lines", "matched_tint_orange_positive"], data.map((d, i) => [i + 1, d.k, d.t]));
  } };

/* ================================================================= HEARING ================================================================= */

// a small WebAudio kit: modest master level, short ramps, and a way to silence everything still playing
function audio() {
  const ac = new (window.AudioContext || window.webkitAudioContext)();
  const out = ac.createGain(); out.gain.value = .22; out.connect(ac.destination);
  let live = [];
  const A = {
    ac, now: () => ac.currentTime,
    // partials: [[freq, amp]] (amps should sum to ≤ 1)
    tone(partials, t0, dur, ramp = .01) {
      const env = ac.createGain(); env.gain.setValueAtTime(0, t0); env.gain.linearRampToValueAtTime(1, t0 + ramp);
      env.gain.setValueAtTime(1, t0 + dur - ramp); env.gain.linearRampToValueAtTime(0, t0 + dur); env.connect(out);
      for (const [f, a] of partials) { const o = ac.createOscillator(), ga = ac.createGain(); o.frequency.value = f; ga.gain.value = a; o.connect(ga); ga.connect(env);
        o.start(t0); o.stop(t0 + dur + .02); live.push(o); o.onended = () => { live = live.filter(x => x !== o); }; }
      return t0 + dur;
    },
    hush() { for (const o of live) { try { o.stop(); } catch (e) { /* already stopped */ } } live = []; },
    close() { A.hush(); try { ac.close(); } catch (e) { /* closed */ } },
  };
  if (ac.state === "suspended") ac.resume();
  return A;
}
const HEADPHONES = "Use headphones or speakers at a comfortable, low volume.";
// a plain listening screen: a title and up to two lit boxes
function earScreen(ctx, title, boxes = [], lit = -1) {
  const { g, W, cy } = ctx; ctx.clear(0); label(g, title, W / 2, 80, "#7b7890", 26);
  boxes.forEach((b, i) => { const x = W / 2 + (i - (boxes.length - 1) / 2) * 260;
    g.strokeStyle = i === lit ? "#00e39a" : "#3a3842"; g.lineWidth = 3; g.beginPath(); g.roundRect(x - 100, cy - 60, 200, 120, 10); g.stroke();
    label(g, b, x, cy, i === lit ? "#00e39a" : "#7b7890", 30); });
}

/* ---------------- Schouten (1940): the missing fundamental ---------------- */
export const MISSINGF0 = { id: "missingf0", group: "HEARING", tag: "SCHOUTEN 1940", title: "The missing fundamental",
  sub: "A chord of high harmonics has a low pitch, at a frequency that isn't in the sound.",
  blurb: "A complex tone made only of harmonics 3 to 6 of some frequency f0, with nothing at f0 itself. Tune a pure tone until it has the same pitch. Most people land on f0 (or an octave of it): the pitch is computed from the spacing of the harmonics, Schouten's 'residue'. Tones that do contain f0 are mixed in for comparison. Small speakers can't play f0 well, which is exactly why this works on a phone; headphones are better. Keep the volume low: loud playback can create a faint distortion tone at f0.",
  ref: "Schouten, J. F. (1940). The residue and the mechanism of hearing. Proceedings of the Koninklijke Nederlandse Akademie van Wetenschappen, 43, 991–999.",
  instructions: { lines: [HEADPHONES, "You'll hear a buzzy tone, then a pure whistle-like tone.", "Tune the pure tone UP or DOWN until it has the same PITCH as the buzzy one, the note you'd hum. Ignore the difference in sound quality.", "R replays both. SPACE when the pitches match."],
    keys: [["UP / DOWN", "HIGHER / LOWER, SMALL STEP"], ["RIGHT / LEFT", "HIGHER / LOWER, BIG STEP"], ["R", "REPLAY BOTH"], ["SPACE", "SAME PITCH"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  6 MATCHES", "FULL  12 MATCHES");
    const A = audio(), data = [];
    try {
      const F0 = [300, 370, 440];
      let trials = []; for (const f0 of F0) for (const missing of [true, false]) trials.push({ f0, missing }); if (!q) trials = trials.concat(trials.map(t => ({ ...t })));
      trials = shuffle(trials);
      const complex = (f0, missing) => { const hs = missing ? [3, 4, 5, 6] : [1, 2, 3, 4, 5, 6]; return hs.map(h => [f0 * h * uni(.999, 1.001), .8 / hs.length]); };
      for (let i = 0; i < trials.length; i++) {
        const T = trials[i], parts = complex(T.f0, T.missing), sineAmp = Math.min(.8, .8 / Math.sqrt(parts.length));
        ctx.status(`MATCH ${i + 1} / ${trials.length}`);
        // the complex, then (on every adjustment) the pure tone at the current setting; the screen lights the one playing
        let tm = null;
        const playTone = async () => { clearTimeout(tm); A.hush(); earScreen(ctx, "LISTEN", ["TONE", "YOURS"], 0); A.tone(parts, A.now() + .05, .7); await ctx.wait(800); };
        const playMine = (lv) => { clearTimeout(tm); A.hush(); earScreen(ctx, "LISTEN", ["TONE", "YOURS"], 1); A.tone([[T.f0 * 2 ** lv, sineAmp]], A.now() + .05, .7);
          tm = setTimeout(() => earScreen(ctx, "TUNE YOURS", ["TONE", "YOURS"]), 800); };
        ctx.say("Tune your pure tone to the same pitch as the buzzy tone. R replays both. SPACE when they match.");
        await playTone(); await ctx.wait(250);
        // v is log2(match / f0), adjusted in quarter-semitone and quarter-octave steps
        const lv = await adjust(ctx, { v: uni(-.7, 2), lo: -1.6, hi: 3.2, small: 1 / 48, big: 1 / 4, less: "LOWER", more: "HIGHER", extra: [["r", "REPLAY BOTH"]],
          draw: playMine, onExtra: async () => { await playTone(); await ctx.wait(250); } });
        clearTimeout(tm);
        A.hush();
        data.push({ ...T, match: T.f0 * 2 ** lv, oct: lv });
        await ctx.wait(300);
      }
    } finally { A.close(); }
    const near = (o, t) => Math.abs(o - t) < 1.5 / 12;
    const cls = (d) => near(d.oct, 0) || near(d.oct, -1) ? "f0" : near(d.oct, 1) ? "octave" : d.missing && near(d.oct, Math.log2(3)) ? "lowest" : "other";
    const M = data.filter(d => d.missing), Fd = data.filter(d => !d.missing);
    const jit = (arr, x) => arr.map((d, i) => [x + (i - (arr.length - 1) / 2) * .08, d.oct]);
    ctx.plot({ title: "PITCH MATCHES", x: { lo: .4, hi: 2.6, label: "COMPLEX TONE", ticks: [] }, y: { lo: -1.5, hi: 3, label: "MATCH  OCTAVES ABOVE F0", ticks: [-1, 0, 1, 2, 3] },
      vlines: [{ x: 1, cls: "sD", label: "WITH F0" }, { x: 2, cls: "sD", label: "F0 MISSING" }],
      hlines: [{ y: 0, cls: "sG", label: "F0" }, { y: 1, cls: "sM", label: "OCTAVE" }, { y: Math.log2(3), cls: "sR", label: "LOWEST PARTIAL WHEN MISSING" }],
      series: [{ name: "WITH F0", cls: "sB", pts: jit(Fd, 1) }, { name: "F0 MISSING", cls: "sA", pts: jit(M, 2) }],
      notes: [[`MISSING  AT F0 ${M.filter(d => cls(d) === "f0").length} / ${M.length}`, "sA"], [`MISSING  OCTAVE ${M.filter(d => cls(d) === "octave").length}`, "sA"], [`MISSING  LOWEST PARTIAL ${M.filter(d => cls(d) === "lowest").length}`, "sR"], [`WITH F0  AT F0 ${Fd.filter(d => cls(d) === "f0").length} / ${Fd.length}`, "sB"]] });
    const hitM = M.filter(d => cls(d) === "f0" || cls(d) === "octave").length, medM = median(M.map(d => d.oct));
    ctx.say(hitM >= Math.ceil(M.length / 2) ? `For tones with nothing at f0, ${hitM} of ${M.length} matches landed on f0 or an octave of it (median ${sgn(medM * 12, 1)} semitones from f0). You heard a pitch at a frequency that wasn't in the sound: the brain infers it from the harmonics' spacing.`
      : `Only ${hitM} of ${M.length} matches to the f0-missing tones were near f0 or its octave (median ${sgn(medM * 12, 1)} semitones). Some listeners follow the lowest harmonic instead ("spectral" listeners); headphones help.`);
    ctx.csv("missing_fundamental.csv", ["match", "f0_hz", "f0_missing", "match_hz", "octaves_from_f0", "class"], data.map((d, i) => [i + 1, d.f0, d.missing ? 1 : 0, d.match, d.oct, cls(d)]));
  } };

/* ---------------- Shepard (1964): circularity of pitch ---------------- */
function shepardTone(A, pcl, t0, dur, amp = .5) {
  const parts = [], base = 16.3516 * 2 ** (pcl / 12);
  for (let k = 0; k < 11; k++) { const f = base * 2 ** k; if (f < 30 || f > 10000) continue; const z = Math.log2(f / 440); parts.push([f, Math.exp(-z * z / 2)]); }
  const s = parts.reduce((a, p) => a + p[1], 0); return A.tone(parts.map(([f, a]) => [f, amp * a / s]), t0, dur, .02);
}
export const SHEPARD = { id: "shepard", group: "HEARING", tag: "SHEPARD 1964", title: "Shepard tones",
  sub: "Tones with no octave. Up or down depends only on which way round is shorter.",
  blurb: "Each Shepard tone is a stack of octaves under a fixed bell-shaped loudness envelope, so it has a note name but no octave. Two tones play: did the pitch go up or down? Shepard found the answer follows the shorter way round the circle of notes: up for steps of 1 to 5 semitones, down for 7 to 11. At 6, the half-way point, it's a coin toss for the circle, but individuals are often consistent (Deutsch's tritone paradox).",
  ref: "Shepard, R. N. (1964). Circularity in judgments of relative pitch. Journal of the Acoustical Society of America, 36(12), 2346–2353.",
  instructions: { lines: [HEADPHONES, "You'll hear two tones, one after the other.", "Did the second tone go UP or DOWN in pitch? Go with your first impression; there are no wrong answers."],
    keys: [["UP", "IT WENT UP"], ["DOWN", "IT WENT DOWN"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  44 PAIRS", "FULL  88 PAIRS");
    const demo = await ctx.choose("First, hear the endless staircase?", [["p", "PLAY IT"], ["s", "SKIP"]]);
    const A = audio(), data = [];
    try {
      if (demo === "p") { ctx.say("Twenty-four steps, each a semitone up. Does it ever get higher?"); earScreen(ctx, "THE ENDLESS STAIRCASE");
        const t0 = A.now() + .1; for (let i = 0; i < 24; i++) shepardTone(A, i % 12, t0 + i * .3, .27);
        await ctx.wait(7400); }
      const reps = q ? 4 : 8; let trials = []; for (let r = 0; r < reps; r++) for (let k = 1; k <= 11; k++) trials.push({ k, p1: Math.floor(Math.random() * 12) });
      trials = shuffle(trials);
      ctx.say("Up or down?");
      for (let i = 0; i < trials.length; i++) {
        const T = trials[i]; ctx.status(`PAIR ${i + 1} / ${trials.length}`);
        earScreen(ctx, "LISTEN", ["1", "2"], 0); const t0 = A.now() + .05; shepardTone(A, T.p1, t0, .5); shepardTone(A, (T.p1 + T.k) % 12, t0 + .75, .5);
        await ctx.wait(800); earScreen(ctx, "LISTEN", ["1", "2"], 1); await ctx.wait(500); earScreen(ctx, "UP OR DOWN?", ["1", "2"]);
        const r = await ctx.key(["ArrowUp", "ArrowDown"], { buttons: [["ArrowUp", "UP"], ["ArrowDown", "DOWN"]], quiet: true });
        data.push({ ...T, up: r.key === "ArrowUp" ? 1 : 0 }); await ctx.wait(350);
      }
    } finally { A.close(); }
    const K = Array.from({ length: 11 }, (_, i) => i + 1), pts = K.map(k => { const d = data.filter(x => x.k === k); return { x: k, k: d.filter(x => !x.up).length, n: d.length }; });
    const fit = fitLogistic(pts), pUp = (k) => { const p = pts[k - 1]; return 1 - p.k / p.n; };
    ctx.plot({ title: "UP OR DOWN", x: { lo: 0, hi: 12, label: "STEP UP THE CIRCLE  SEMITONES", ticks: [1, 3, 6, 9, 11] }, y: { lo: 0, hi: 1, label: "P(HEARD UP)", ticks: [0, .25, .5, .75, 1] },
      series: [{ name: "YOU", cls: "sA", pts: K.map(k => [k, pUp(k)]), curve: fit ? (x) => 1 - logistic(x, fit.a, fit.b) : null }], hlines: [{ y: .5, cls: "sD" }],
      vlines: [{ x: 6, cls: "sM", label: "TRITONE", dy: 16 }, ...(fit ? [{ x: fit.pse, cls: "sA", label: `CROSSOVER ${fit.pse.toFixed(1)}` }] : [])],
      notes: [[fit ? `CROSSOVER ${fit.pse.toFixed(1)} SEMITONES` : "NO CROSSOVER FIT", "sA"], [`P(UP) AT 1-5  ${f2(mean([1, 2, 3, 4, 5].map(pUp)))}`, "sW"], [`P(UP) AT 7-11  ${f2(mean([7, 8, 9, 10, 11].map(pUp)))}`, "sW"], [`TRITONE P(UP) ${f2(pUp(6))}`, "sM"]] });
    const swing = mean([1, 2, 3, 4, 5].map(pUp)) - mean([7, 8, 9, 10, 11].map(pUp));
    ctx.say(fit && fit.pse > 3 && fit.pse < 9 && swing > .3 ? `Your judgements flipped from up to down at about ${fit.pse.toFixed(1)} semitones, near the half-way point of 6. With the octave removed, 'up' just means 'the shorter way round', so pitch is a circle, not a line. At exactly 6 you said up ${Math.round(pUp(6) * 100)}% of the time.`
      : "Your answers didn't show a clean flip from up to down. Most people hear small steps up the circle as up and large ones as down, flipping near 6 semitones. Headphones help.");
    ctx.csv("shepard_tones.csv", ["pair", "first_pitch_class", "step_semitones", "heard_up"], data.map((d, i) => [i + 1, d.p1, d.k, d.up]));
  } };

/* ---------------- van Noorden (1975): auditory streaming ---------------- */
export const STREAMING = { id: "streaming", group: "HEARING", tag: "VAN NOORDEN 1975", title: "Auditory streaming",
  sub: "High-low-high, pause: one galloping rhythm, or two separate beeping streams?",
  blurb: "Tones go A B A, pause, A B A, pause. When A and B are close in pitch you hear one galloping rhythm; far apart, they split into two streams, a fast one and a slow one, and the gallop is gone. The split happens at a smaller pitch gap when the tones come faster: van Noorden's temporal coherence. The result is the pitch gap where you switch, at two tempos.",
  ref: "van Noorden, L. P. A. S. (1975). Temporal coherence in the perception of tone sequences (Doctoral dissertation). Eindhoven University of Technology, Eindhoven, The Netherlands.",
  instructions: { lines: [HEADPHONES, "You'll hear a few seconds of beeps in a repeating pattern: high-low-high, pause.", "At the END, did it sound like ONE galloping rhythm (da-di-da, da-di-da), or TWO separate streams of beeps, one high and one low, each steady?", "There are no right answers. Report what you hear at the end."],
    keys: [["1", "ONE GALLOPING RHYTHM"], ["2", "TWO SEPARATE STREAMS"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  24 SEQUENCES", "FULL  48 SEQUENCES");
    const DF = [1, 3, 5, 7, 9, 12], TRT = { fast: .1, slow: .2 }, reps = q ? 2 : 4, A = audio(), data = [];
    try {
      let trials = []; for (let r = 0; r < reps; r++) for (const df of DF) for (const tp of ["fast", "slow"]) trials.push({ df, tp }); trials = shuffle(trials);
      ctx.say("Listen to the end. One gallop, or two streams?");
      for (let i = 0; i < trials.length; i++) {
        const T = trials[i], trt = TRT[T.tp], fA = 500 * 2 ** (uni(-2, 2) / 12), fB = fA * 2 ** (T.df / 12), nTrip = Math.round(4.8 / (4 * trt)), t0 = A.now() + .1;
        ctx.status(`SEQUENCE ${i + 1} / ${trials.length}`);
        // fB above fA: the B tone is high. Classic ABA- with the A tones low
        for (let k = 0; k < nTrip; k++) { const t = t0 + k * 4 * trt; A.tone([[fA, .45]], t, .04, .005); A.tone([[fB, .45]], t + trt, .04, .005); A.tone([[fA, .45]], t + 2 * trt, .04, .005); }
        const dur = nTrip * 4 * trt * 1000;
        await ctx.loop((tt) => { const { g, W, cy } = ctx; earScreen(ctx, "LISTEN TO THE END");
          g.strokeStyle = "#3a3842"; g.lineWidth = 2; g.strokeRect(W / 2 - 200, cy + 100, 400, 14); g.fillStyle = "#7b7890"; g.fillRect(W / 2 - 200, cy + 100, 400 * Math.min(1, tt * 1000 / dur), 14);
          return tt * 1000 < dur + 150; });
        earScreen(ctx, "AT THE END: ONE OR TWO?");
        const r = await ctx.key(["1", "2"], { buttons: [["1", "ONE GALLOP"], ["2", "TWO STREAMS"]], quiet: true });
        data.push({ ...T, fA, two: r.key === "2" ? 1 : 0 }); await ctx.wait(500);
      }
    } finally { A.close(); }
    const fits = {}, ser = [["fast", "FAST  100 MS", "sA"], ["slow", "SLOW  200 MS", "sB"]].map(([tp, name, cls]) => {
      const pts = DF.map(df => { const d = data.filter(x => x.tp === tp && x.df === df); return { x: df, k: d.filter(x => x.two).length, n: d.length }; });
      const fit = fitLogistic(pts); fits[tp] = fit;
      return { name, cls, pts: pts.map(p => [p.x, p.k / p.n]), curve: fit ? (x) => logistic(x, fit.a, fit.b) : null }; });
    const b = (tp) => fits[tp] ? clamp(fits[tp].pse, 0, 14) : NaN;
    ctx.plot({ title: "TWO STREAMS OR ONE", x: { lo: 0, hi: 13, label: "PITCH GAP  SEMITONES", ticks: DF }, y: { lo: 0, hi: 1, label: "P(TWO STREAMS)", ticks: [0, .25, .5, .75, 1] },
      series: ser, hlines: [{ y: .5, cls: "sD" }], vlines: [{ x: b("fast"), cls: "sA", label: `FAST ${f2(b("fast"), 1)}` }, { x: b("slow"), cls: "sB", label: `SLOW ${f2(b("slow"), 1)}`, dy: 16 }],
      notes: [[`FAST SPLITS AT ${f2(b("fast"), 1)} ST`, "sA"], [`SLOW SPLITS AT ${f2(b("slow"), 1)} ST`, "sB"]] });
    ctx.say(isFinite(b("fast")) && isFinite(b("slow")) && b("fast") < b("slow") ? `At the fast tempo the sequence split into two streams at about ${b("fast").toFixed(1)} semitones; at the slow tempo it took ${b("slow").toFixed(1)}. The faster the tones, the smaller the pitch gap the auditory system will bridge: van Noorden's temporal coherence boundary.`
      : `Switch points: fast ${f2(b("fast"), 1)}, slow ${f2(b("slow"), 1)} semitones. Most people split the fast sequence at a smaller pitch gap than the slow one. Try the full run, and judge the end of each sequence.`);
    ctx.csv("auditory_streaming.csv", ["sequence", "tempo", "tone_repetition_ms", "gap_semitones", "a_hz", "heard_two_streams"], data.map((d, i) => [i + 1, d.tp, TRT[d.tp] * 1000, d.df, d.fA, d.two]));
  } };

/* =================================================================== TIME ================================================================== */

/* ---------------- Jazayeri & Shadlen (2010): ready, set, go ---------------- */
export const READYSETGO = { id: "readysetgo", group: "TIME", tag: "JAZAYERI & SHADLEN 2010", title: "Ready, set, go",
  sub: "Reproduce a time interval. Your answers drift toward the middle of what you've been given.",
  blurb: "Two flashes, READY and SET, mark out an interval. Press GO when the same interval has passed again. Intervals come from a short range in one block and a long range in the other. Reproductions are pulled toward the middle of each range, so the slope against the true interval is under 1, and the 847 ms interval common to both ranges comes out shorter in the short block than in the long one. That's Bayesian timing: the brain blends a noisy measurement with what it expects. Keyboard and screen delays add a constant, which doesn't change the slope or the difference.",
  ref: "Jazayeri, M., & Shadlen, M. N. (2010). Temporal context calibrates interval timing. Nature Neuroscience, 13(8), 1020–1026.",
  instructions: { lines: ["Look at the dot in the middle. A flash on the LEFT means READY; a flash on the RIGHT means SET.", "Press GO (or SPACE) when the time since SET equals the time between READY and SET.", "A line tells you how close you were. The dot's colour shows which block you're in."],
    keys: [["SPACE", "GO"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  2 × 20 TRIALS", "FULL  2 × 40 TRIALS");
    const PRI = { short: [494, 582, 671, 759, 847], long: [847, 935, 1024, 1112, 1200] }, COL = { short: "#ffb547", long: "#4fa3ff" }, reps = q ? 4 : 8, { g, cx, cy } = ctx, data = [];
    const scene = (pr, ready, set) => { ctx.clear(.08); g.fillStyle = COL[pr]; g.beginPath(); g.arc(cx, cy, 7, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#333"; g.lineWidth = 3; for (const x of [cx - 170, cx + 170]) { g.beginPath(); g.arc(x, cy, 26, 0, Math.PI * 2); g.stroke(); }
      g.fillStyle = "#fff"; if (ready) { g.beginPath(); g.arc(cx - 170, cy, 26, 0, Math.PI * 2); g.fill(); } if (set) { g.beginPath(); g.arc(cx + 170, cy, 26, 0, Math.PI * 2); g.fill(); } };
    let n = 0;
    for (const pr of shuffle(["short", "long"])) {
      ctx.say(`${n ? "New block. " : ""}The dot is ${pr === "short" ? "ORANGE" : "BLUE"}: intervals come from the ${pr.toUpperCase()} range. Press GO when the same time has passed again after SET.`);
      scene(pr); await ctx.key([" ", "go"], { buttons: [["go", "START BLOCK"]] });
      let trials = []; for (let r = 0; r < reps; r++) trials.push(...PRI[pr]); trials = shuffle(trials);
      for (let i = 0; i < trials.length; i++) {
        const ts = trials[i]; ctx.status(`${pr.toUpperCase()} BLOCK  TRIAL ${i + 1} / ${trials.length}`);
        scene(pr); await ctx.wait(uni(500, 1100));
        scene(pr, true, false); const tR = await ctx.raf(); let t = tR, on = true, dt = 16.7;
        // draw SET on the frame that lands nearest the sample interval (dt tracks the real frame rate)
        while (t - tR + 1.5 * dt < ts) { const t2 = await ctx.raf(); dt = clamp(t2 - t, 4, 50); t = t2; if (on && t - tR >= 100) { scene(pr); on = false; } }
        scene(pr, false, true); const tS = await ctx.raf();
        const off = setTimeout(() => scene(pr), 100), tCall = performance.now();
        const r = await ctx.key([" ", "go"], { buttons: [["go", "GO"]], timeout: ts * 2.5 + 800, quiet: true }); clearTimeout(off);
        const tsA = tS - tR, tp = r.key ? tCall + r.rt - tS : NaN, ok = isFinite(tp) && tp > 150 && tp < 2.5 * ts;
        data.push({ prior: pr, ts, tsActual: tsA, tp, ok });
        // feedback: a line from SET, with the target and your press marked
        scene(pr); const sc = .18, x0 = cx - 150, y = cy + 110; g.strokeStyle = "#3a3842"; g.lineWidth = 2; line(g, x0, y, x0 + 2000 * sc, y);
        g.strokeStyle = "#e9e6ff"; line(g, x0 + ts * sc, y - 16, x0 + ts * sc, y + 16);
        const good = ok && Math.abs(tp - ts) < .12 * ts;
        if (isFinite(tp)) { g.strokeStyle = good ? "#00e39a" : "#ffb547"; g.lineWidth = 4; line(g, x0 + Math.min(tp, 2000) * sc, y - 22, x0 + Math.min(tp, 2000) * sc, y + 22); }
        label(g, !isFinite(tp) ? "TOO SLOW" : !ok ? "TOO EARLY" : good ? "GOOD" : tp < ts ? `EARLY ${Math.round(ts - tp)} MS` : `LATE ${Math.round(tp - ts)} MS`, cx, y + 50, good ? "#00e39a" : "#ffb547", 24);
        await ctx.wait(700);
      }
      n++;
    }
    const ser = [["short", "SHORT RANGE", "sA"], ["long", "LONG RANGE", "sB"]].map(([pr, name, cls]) => {
      const ok = data.filter(d => d.prior === pr && d.ok), f = ok.length > 2 ? linFit(ok.map(d => d.ts), ok.map(d => d.tp)) : { m: NaN, c: NaN };
      return { pr, name, cls, f, pts: PRI[pr].map(ts => { const v = ok.filter(d => d.ts === ts).map(d => d.tp); return [ts, mean(v), sem(v)]; }), curve: (x) => f.m * x + f.c, line: false }; });
    const at847 = (pr) => mean(data.filter(d => d.prior === pr && d.ok && d.ts === 847).map(d => d.tp));
    const all = ser.flatMap(s => s.pts.map(p => p[1])).filter(isFinite), lo = Math.floor(Math.min(400, ...all) / 100) * 100, hi = Math.ceil(Math.max(1300, ...all) / 100) * 100;
    ctx.plot({ title: "INTERVAL REPRODUCTION", x: { lo: 400, hi: 1300, label: "SAMPLE INTERVAL  MS", ticks: [494, 847, 1200] }, y: { lo, hi, label: "YOUR INTERVAL  MS", ticks: [lo, Math.round((lo + hi) / 200) * 100, hi] },
      series: [...ser.map(s => ({ name: s.name, cls: s.cls, pts: s.pts, curve: isFinite(s.f.m) ? s.curve : null })), { name: "PERFECT", cls: "sM", pts: [], curve: (x) => x }],
      notes: [[`SHORT SLOPE ${f2(ser[0].f.m)}`, "sA"], [`LONG SLOPE ${f2(ser[1].f.m)}`, "sB"], [`847 MS  SHORT ${isFinite(at847("short")) ? Math.round(at847("short")) : "-"}  LONG ${isFinite(at847("long")) ? Math.round(at847("long")) : "-"}`, "sW"]] });
    const d847 = at847("long") - at847("short");
    ctx.say(ser.every(s => s.f.m > .1 && s.f.m < .9) ? `Your slopes were ${f2(ser[0].f.m)} (short range) and ${f2(ser[1].f.m)} (long range), both under 1: short intervals stretched and long ones shrank toward the middle of their range. ${isFinite(d847) ? (d847 > 0 ? `The same 847 ms came out ${Math.round(d847)} ms longer in the long block than in the short one. ` : `The 847 ms interval, common to both ranges, didn't come out longer in the long block this time (it usually does). `) : ""}Jazayeri and Shadlen's participants were pulled toward the middle the same way, as a Bayesian observer would be.`
      : `Slopes ${f2(ser[0].f.m)} and ${f2(ser[1].f.m)}: not the classic pattern this run (a slope near 1 means no pull toward the middle; near 0 or below, the timing was too noisy to read). Most people show slopes clearly under 1, and the 847 ms interval comes out longer in the long block.`);
    ctx.csv("ready_set_go.csv", ["trial", "range", "sample_ms", "sample_measured_ms", "produced_ms", "used"], data.map((d, i) => [i + 1, d.prior, d.ts, d.tsActual, isFinite(d.tp) ? d.tp : "", d.ok ? 1 : 0]));
  } };

/* ---------------- Getty (1975): Weber's law for duration ---------------- */
export const DURWEBER = { id: "durweber", group: "TIME", tag: "GETTY 1975", title: "Weber's law for time",
  sub: "Which of two silent gaps was longer? The difference you can hear grows with the gap.",
  blurb: "Two empty intervals, each marked by a pair of clicks. Which was longer? A short standard (400 ms) and a long one (1200 ms) are interleaved. The just-noticeable difference grows in proportion to the duration, so the Weber fraction (JND divided by duration) comes out about the same for both: the scalar property of timing. Getty (1975) found it flat, at about 0.05 for practised listeners, from roughly 0.4 to 2 s. Click timing is scheduled by the audio clock, so screen refresh doesn't matter.",
  ref: "Getty, D. J. (1975). Discrimination of short temporal intervals: A comparison of two models. Perception & Psychophysics, 18(1), 1–8.",
  instructions: { lines: [HEADPHONES, "You'll hear two clicks, a pause, then two more clicks. Each pair of clicks marks out a silent gap.", "Which GAP was longer, the first or the second? Guess if you're not sure."],
    keys: [["1", "FIRST GAP LONGER"], ["2", "SECOND GAP LONGER"]] },
  async run(ctx) {
    const q = await quick(ctx, "QUICK  60 TRIALS", "FULL  120 TRIALS");
    const STD = [400, 1200], LR = [-.27, -.17, -.08, .08, .17, .27], reps = q ? 5 : 10, A = audio(), data = [];
    try {
      let trials = []; for (let r = 0; r < reps; r++) for (const s of STD) for (const lr of LR) trials.push({ s, lr, cFirst: Math.random() < .5 }); trials = shuffle(trials);
      const click = (t) => A.tone([[1000, .7]], t, .012, .003);
      ctx.say("Which gap was longer, the first or the second?");
      for (let i = 0; i < trials.length; i++) {
        const T = trials[i], c = T.s * Math.exp(T.lr), [d1, d2] = T.cFirst ? [c, T.s] : [T.s, c];
        ctx.status(`TRIAL ${i + 1} / ${trials.length}`);
        const t0 = A.now() + .15, t2 = t0 + d1 / 1000 + .7; click(t0); click(t0 + d1 / 1000); click(t2); click(t2 + d2 / 1000);
        earScreen(ctx, "LISTEN", ["1", "2"], 0); await ctx.wait(150 + d1 + 350); earScreen(ctx, "LISTEN", ["1", "2"]); await ctx.wait(350);
        earScreen(ctx, "LISTEN", ["1", "2"], 1); await ctx.wait(d2 + 150); earScreen(ctx, "WHICH GAP WAS LONGER?", ["1", "2"]);
        const r = await ctx.key(["1", "2"], { buttons: [["1", "FIRST"], ["2", "SECOND"]], quiet: true });
        data.push({ ...T, comp: c, compLonger: (r.key === "1") === T.cFirst ? 1 : 0 }); await ctx.wait(400);
      }
    } finally { A.close(); }
    // P(comparison judged longer) against log(comparison / standard); Weber fraction as a normal-equivalent σ / T
    const res = STD.map(s => { const pts = LR.map(lr => { const d = data.filter(x => x.s === s && x.lr === lr); return { x: lr, k: d.filter(x => x.compLonger).length, n: d.length }; });
      const fit = fitLogistic(pts); return { s, pts, fit, wf: fit && fit.t75 > .006 ? fit.t75 / .6745 : NaN }; });
    ctx.plot({ title: "DURATION DISCRIMINATION", x: { lo: -.32, hi: .32, label: "COMPARISON VS STANDARD  LOG RATIO", ticks: [-.27, 0, .27] }, y: { lo: 0, hi: 1, label: "P(COMPARISON LONGER)", ticks: [0, .25, .5, .75, 1] },
      series: res.map((r, i) => ({ name: `${r.s} MS`, cls: i ? "sB" : "sA", pts: r.pts.map(p => [p.x, p.k / p.n]), curve: r.fit ? (x) => logistic(x, r.fit.a, r.fit.b) : null })), hlines: [{ y: .5, cls: "sD" }],
      notes: res.map((r, i) => [`${r.s} MS  WEBER ${f2(r.wf)}`, i ? "sB" : "sA"]).concat([[`RATIO ${f2(res[1].wf / res[0].wf)}`, "sW"]]) });
    const [a, b] = res.map(r => r.wf), ratio = b / a;
    ctx.say(isFinite(ratio) && a < 1 && b < 1 ? `Your Weber fractions: ${f2(a)} at 400 ms and ${f2(b)} at 1200 ms${ratio > .6 && ratio < 1.6 ? ", about the same, even though the long gap is three times longer. The JND scales with duration: Weber's law for time." : ". They differ more than Weber's law predicts; more trials will tighten them."} Getty's practised listeners reached about 0.05; untrained listeners are typically a few times higher.`
      : "Couldn't fit both psychometric functions (too many errors, or none at all). Try the full run; listen for the silent gap between each pair of clicks.");
    ctx.csv("duration_weber.csv", ["trial", "standard_ms", "comparison_ms", "log_ratio", "comparison_first", "comparison_judged_longer"], data.map((d, i) => [i + 1, d.s, d.comp, d.lr, d.cFirst ? 1 : 0, d.compLonger]));
  } };

export const LIB_ADJUST = [PONZO, POGGENDORFF, ZOLLNER, CAFEWALL, DELBOEUF, SIMCONTRAST, WHITES, CORNSWEET, WATERCOLOUR, MISSINGF0, SHEPARD, STREAMING, READYSETGO, DURWEBER];
