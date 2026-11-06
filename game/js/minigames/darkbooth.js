// THE DARK (Act IV, the dark booth in the Adline Lab). Gus's idea: anything driving current through a coil next to
// living tissue leaks a little light. The Gain Controller's earbuds emit a few trace photons a second, far too few to
// see in a lit room, but a fully dark-adapted rod can catch single photons. Preston is in the booth (Gus told him it
// was a rod study: middle authorship). Three steps:
//   1. DARK: kill every light leak (the booth's ON LED, Nell's phone, the gap under the door).
//   2. ADAPT: sit in the dark while the dark-adaptation curve falls: the cone branch flattens at ~8 min, the rod-cone
//      break, then the rods take over until threshold drops below the emission at ~20 min (about six seconds of
//      play). CHECK PHONE warns first; pressed again, it bleaches your rhodopsin and sends you back to the start.
//   3. LOOK: photons arrive in sparse bursts in the shape of the emitter, among the dark noise of your own rods. The
//      cursor is your gaze, and the fovea has no rods, so dots right where you look vanish: look beside it
//      (averted vision). Name the shape, three times, each fainter: a ring (a coil), the Table's insignia (a circle
//      seated round a smaller circle), and a gain dial pinned at MAX. Hint ladder per shape: after two wrong answers
//      Gus describes it; after four he traces it in green and lights the right button.
// Resolves { done, wrong }.
import { seg, segW, chip } from "../gfx.js";

const CX = 320, CY = 118;                       // Preston's head, in the dark (never drawn)
const FOVEA = 40;                               // rod-free zone around the gaze, in viewBox units
// shapes as polylines around (0,0)
const circ = (r, cx = 0, cy = 0, a0 = 0, a1 = Math.PI * 2, n = 48) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
const dialArc = circ(66, 0, 22, Math.PI * 1.1, Math.PI * 1.9, 36);
const needle = (ang) => [[0, 22], [58 * Math.cos(ang), 22 + 58 * Math.sin(ang)]];
const ticks = [1.1, 1.3, 1.5, 1.7, 1.9].map(t => { const a = Math.PI * t; return [[66 * Math.cos(a), 22 + 66 * Math.sin(a)], [54 * Math.cos(a), 22 + 54 * Math.sin(a)]]; });
export const SHAPES = {
  ring: { name: "RING", lines: [circ(54)] },
  square: { name: "SQUARE", lines: [[[-46, -46], [46, -46], [46, 46], [-46, 46], [-46, -46]]] },
  triangle: { name: "TRIANGLE", lines: [[[0, -56], [52, 40], [-52, 40], [0, -56]]] },
  cross: { name: "CROSS", lines: [[[-52, 0], [52, 0]], [[0, -52], [0, 52]]] },
  twin: { name: "TWO RINGS", lines: [circ(30, -40), circ(30, 40)] },
  insignia: { name: "RING IN RING", lines: [circ(62), circ(24)] },
  spiral: { name: "SPIRAL", lines: [Array.from({ length: 80 }, (_, i) => { const a = i / 79 * Math.PI * 4, r = 8 + i / 79 * 52; return [r * Math.cos(a), r * Math.sin(a)]; })] },
  dot: { name: "DOT", lines: [circ(10)] },
  dialOff: { name: "DIAL: OFF", lines: [dialArc, ...ticks, needle(Math.PI * 1.15)] },
  dialMid: { name: "DIAL: HALF", lines: [dialArc, ...ticks, needle(Math.PI * 1.5)] },
  dialMax: { name: "DIAL: MAX", lines: [dialArc, ...ticks, needle(Math.PI * 1.85)] },
  dialNone: { name: "NO NEEDLE", lines: [dialArc, ...ticks] },
};
// signal photons per burst fall trial by trial; the dark noise of your own rods rises in proportion
export const TRIALS = [
  { answer: "ring", opts: ["square", "ring", "triangle", "cross"], sig: 6, noise: 4 },
  { answer: "insignia", opts: ["twin", "spiral", "insignia", "ring"], sig: 6, noise: 5 },
  { answer: "dialMax", opts: ["dialOff", "dialMid", "dialMax", "dialNone"], sig: 7, noise: 5, needleBoost: true },
];
const LINES = {
  prep: ["GUS", "Perfect dark means perfect. Kill every light in there: the booth's ON lamp, your phone, the gap under the door."],
  leak: { led: ["GUS", "Tape on the lamp. It's the brightest thing in the room, which says a lot about the room."], phone: ["GUS", "Phone face down, screen off. Notifications bleach rhodopsin. That's not science, that's just true."],
    door: ["GUS", "Hoodie under the door. Mine. You can keep it. It's seen worse."] },
  adapt: ["GUS", "Now we wait. Cones give up first, around eight minutes. That kink is the rod-cone break. Then the rods take over, slowly."],
  break: ["GUS", "There's the break. Rods now. Nobody's ever seen anything with their cones in here. Just wait."],
  phone: ["GUS", "You checked your phone. Your rods are bleached. Twenty minutes, from the top. Everybody does it once."],
  ready: ["NELL", "Twenty minutes. I can see the dark, Gus. It's not black. It's grey, and it moves."],
  look: ["GUS", "That grey is your own rods misfiring. Dark noise. Now: don't look straight at him. Your fovea has no rods. Look just beside where you think it is."],
  ok: [["GUS", "A ring. That's a coil, Nell. Current going round and round, right at his ear."],
    ["NELL", "A circle, seated around a smaller circle. Gus, that's the Table."],
    ["GUS", "Gain at maximum. Somebody has him turned all the way up."]],
  next: [["GUS", "Again. It'll be fainter. It changes when his earbuds pulse. Two, one, two."], ["GUS", "Last one. Fainter still. There's a needle in there."]],
  bad: ["GUS", "Not that. Wait for a few more bursts, and look beside it, not at it."],
  bad2: ["GUS", "Nope. Let it build up for a second or two. Keep the pointer off his head."],
  hint: [["GUS", "It's one loop, Nell. Round. A coil is just a wire going round and round."],
    ["GUS", "Two circles, but one is INSIDE the other. Not side by side. Small in the middle, big around it."],
    ["GUS", "It's a dial, every time. The question is the needle. Watch where the dots pile up: far right. All the way up."]],
  show: ["GUS", "Okay. I'm tracing it for you. Green line, green button. Rods are hard; nobody's grading this. Except me. Kind of."],
  phoneWarn: ["GUS", "Don't. One look at that screen bleaches your rods and we're back to minute zero. Press it again if you really have to."],
  stare: ["GUS", "You're staring right at it. No rods there. Look a little to the side."],
};

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);
const COL = { GUS: "B", NELL: "G", PRESTON: "R" };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// a point uniformly along a shape's total stroke length; the needle can be favoured so the last trial stays fair
function sampler(shape, needleBoost) {
  const segs = []; let tot = 0;
  shape.lines.forEach((l, li) => { const w = needleBoost && li === shape.lines.length - 1 && l.length === 2 ? 3 : 1;
    for (let i = 1; i < l.length; i++) { const d = Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]) * w; segs.push([l[i - 1], l[i], d]); tot += d; } });
  return (r) => { let t = r() * tot; for (const [a, b, d] of segs) { if (t <= d) { const u = t / d; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; } t -= d; } return segs[0][0]; };
}
// the dark-adaptation curve, log threshold vs minutes: the cone branch, then the rod branch (the rod-cone break ~8 min)
export const cone = (m) => 2.6 + 1.6 * Math.exp(-m / 2);           // fast, and stuck at a plateau
export const rod = (m) => 0.4 + 8.3 * Math.exp(-m / 6);             // slow, and far more sensitive in the end
export const thresh = (m) => Math.min(cone(m), rod(m));              // the two branches cross at ~8 min
export const EMIT = 0.8;                         // the earbuds' emission, on the same log scale: rods get there at ~18 min                              // the earbuds' emission, on the same log scale

// a small icon of a shape for the answer buttons
function icon(id, x, y, s, cls) {
  return SHAPES[id].lines.map(l => `<path class="${cls}" style="stroke-width:1" d="M${l.map(([a, b]) => `${(x + a * s).toFixed(1)},${(y + b * s).toFixed(1)}`).join(" L")}"/>`).join("");
}

export function darkbooth(el, { score = () => {} } = {}) {
  return new Promise(resolve => {
    let spoken = null, timer = null, tick = null;
    const S = { phase: "prep", leaks: new Set(), min: 0, broke: false, trial: 0, dots: [], gaze: [CX + 70, CY], wrong: 0, tw: 0, phoneWarned: false, say: LINES.prep, done: false, stareT: 0 };
    const R = rng(1942);
    function svgBody() {
      if (S.phase === "prep") {
        // the booth, from inside: the chair, the screen (off), the ON lamp, a phone on the desk, light under the door
        const on = (k) => !S.leaks.has(k);
        let s = seg("THE BOOTH  FROM INSIDE", 20, 8, 5.5, "sM", .8);
        s += `<path class="sV mech" d="M150,30 L490,30 L490,210 L150,210 Z"/><path class="hl sD" d="M150,210 L110,246 M490,210 L530,246 M150,30 L110,0 M490,30 L530,0"/>`;
        s += `<rect class="k sM" x="262" y="62" width="116" height="70"/>${seg("SCREEN OFF", 296, 92, 4, "sD", .6)}<path class="hl sD" d="M300,150 L340,150 M308,150 L308,138 M332,150 L332,138 M312,138 C316,132 324,132 328,138 M320,150 L320,200 M292,200 L348,200"/>${seg("CHIN REST", 344, 140, 3.6, "sD", .5)}`;
        s += `<g data-leak="led" style="cursor:pointer"><circle class="${on("led") ? "fR" : "k sD"}" cx="466" cy="52" r="4"/>${on("led") ? `<path class="hl sR" d="M474,52 L482,52 M466,40 L466,44 M472,45 L476,41"/>` : `<path class="sM" d="M458,46 L474,58 M458,58 L474,46"/>`}${seg("ON", 458, 62, 4, on("led") ? "sR" : "sD", .7)}<rect x="450" y="36" width="34" height="34" fill="transparent"/></g>`;
        s += `<g data-leak="phone" style="cursor:pointer"><rect class="k ${on("phone") ? "sW" : "sD"}" x="190" y="176" width="20" height="34" rx="3"/>${on("phone") ? `<rect class="fB" x="193" y="180" width="14" height="24"/>${seg("12", 195, 186, 5, "s0", .8)}` : ""}<rect x="180" y="170" width="40" height="46" fill="transparent"/></g>`;
        s += `<g data-leak="door" style="cursor:pointer"><path class="sM" d="M520,40 L520,222 M600,26 L600,236"/>${seg("DOOR", 548, 120, 4.4, "sD", .6)}${on("door") ? `<path class="sA" d="M522,224 L598,234"/><path class="hl sA dash" d="M522,228 L594,238 M540,232 L590,240"/>` : `<path class="sG" d="M522,222 C540,216 560,230 598,232"/>${seg("HOODIE", 542, 208, 4, "sM", .6)}`}<rect x="512" y="24" width="94" height="216" fill="transparent"/></g>`;
        s += seg("LIGHT LEAKS", 20, 200, 4.4, "sW", .7) + seg(`${3 - S.leaks.size} LEFT`, 20, 209, 6, S.leaks.size === 3 ? "sG" : "sA", .9);
        return s;
      }
      if (S.phase === "adapt") {
        // dark-adaptation curve: x = minutes 0..25, y = log threshold 0..4.5 (up = brighter needed)
        const X0 = 120, Y0 = 220, W = 440, H = 180, xm = (m) => X0 + m / 25 * W, yv = (v) => Y0 - v / 4.5 * H;
        let s = seg("DARK ADAPTATION", 20, 8, 5.5, "sM", .8) + seg("LOG THRESHOLD", X0 + 6, Y0 - H - 8, 4, "sM", .6) + seg("MINUTES IN THE DARK", X0 + W - 92, Y0 + 10, 4, "sM", .6);
        for (let m = 0; m <= 25; m += 5) s += `<path class="hl sD" d="M${xm(m)},${Y0} L${xm(m)},${Y0 - H}"/>` + seg(String(m), xm(m) - 3, Y0 + 3, 4.4, "sM", .6);
        s += `<path class="sM" d="M${X0},${Y0 - H} L${X0},${Y0} L${X0 + W},${Y0}"/>`;
        s += `<path class="sG dash" d="M${X0},${yv(EMIT)} L${X0 + W},${yv(EMIT)}"/>` + chip("HIS EARBUDS", X0 + W - 60, yv(EMIT) - 12, 4.4, "fG");
        const pts = []; for (let m = 0; m <= S.min + 1e-6; m += .25) pts.push(`${xm(m).toFixed(1)},${yv(thresh(m)).toFixed(1)}`);
        if (pts.length > 1) s += `<path class="sW" d="M${pts.join(" L")}"/>`;
        s += `<circle class="fW" cx="${xm(S.min)}" cy="${yv(thresh(S.min))}" r="2.6"/>`;
        if (S.broke) s += seg("CONES", xm(1.2), yv(3.1) - 12, 4.6, "sA", .7) + seg("ROD-CONE BREAK", xm(7.6) + 6, yv(thresh(7.6)) - 14, 4.4, "sA", .7);
        if (S.min > 12) s += seg("RODS", xm(14), yv(thresh(14)) + 6, 4.6, "sB", .7);
        s += seg(String(Math.floor(S.min)).padStart(2, "0"), 20, 60, 22, "sW", 1.3) + seg("MINUTES", 20, 50, 4.4, "sM", .7);
        return s;
      }
      // LOOK: the dark. Only photons, and a faint mark where your rods aren't
      const t = TRIALS[S.trial]; const now = performance.now();
      let s = seg(`TRIAL ${S.trial + 1} OF 3`, 20, 8, 5.5, "sM", .8);
      for (const d of S.dots) { const age = now - d.t; if (age > 1500) continue;
        if (Math.hypot(d.x - S.gaze[0], d.y - S.gaze[1]) < FOVEA) continue;          // fovea: no rods, nothing seen
        s += `<circle class="${age < 450 ? "fW" : "fM"}" cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${age < 450 ? 1.5 : 1.1}"/>`; }
      if (S.done || S.tw >= 4) s += icon(t.answer, CX, CY, 1, "hl sG");
      if (S.trial === 0) s += `<circle class="hl sD dash" cx="${S.gaze[0]}" cy="${S.gaze[1]}" r="${FOVEA}"/>` + seg("FOVEA  NO RODS", S.gaze[0] - 22, S.gaze[1] + FOVEA + 3, 3.6, "sD", .6);
      // the answers, in a row along the bottom
      t.opts.forEach((id, i) => { const x = 110 + i * 140, y = 228, lit = !S.done && S.tw >= 4 && id === t.answer, c = lit ? "sG" : "sW";
        s += `<g data-opt="${id}" style="cursor:pointer"><rect class="k ${lit ? "sG" : "sM"}" x="${x - 52}" y="${y - 18}" width="104" height="36"/>${icon(id, x - 30, y, .22, c)}${seg(SHAPES[id].name, x - 12, y - 3, 4.4, c, .7)}<rect x="${x - 52}" y="${y - 18}" width="104" height="36" fill="transparent"/></g>`; });
      return s;
    }
    function draw() {
      if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(S.say[0], true); }
      const c = COL[S.say[0]] || "W";
      const step = S.phase === "prep" ? "STEP 1  MAKE IT DARK" : S.phase === "adapt" ? "STEP 2  ADAPT" : "STEP 3  LOOK BESIDE IT";
      el.innerHTML = `<div class="screen grim dark">
        <svg class="t hd" viewBox="0 0 640 40">${seg("THE DARK", 16, 10, 18, "sW", 1.6)}${seg(step, 150, 17, 5.5, "sA", .8)}</svg>
        <div class="ceilbody"><svg class="t" id="darkfield" viewBox="0 0 640 250">${svgBody()}</svg></div>
        <div class="coachline"><span class="who" style="background:var(--${c})">${S.say[0]}</span> <span style="color:var(--${c})">${S.say[1]}</span></div>
        <div class="bar"><span class="status">${S.phase === "look" ? (S.done ? "3 / 3 NAMED" : `${S.trial} / 3 NAMED  ·  KEEP THE POINTER BESIDE HIM, THEN CLICK THE SHAPE YOU SEE`) : S.phase === "adapt" ? (thresh(S.min) < EMIT ? "BELOW THE EMISSION" : "WAITING  ·  JUST WAIT, IT TAKES A FEW SECONDS") : `${S.leaks.size} / 3 SEALED  ·  CLICK EACH LIGHT LEAK`}</span>
          ${S.phase === "adapt" && !S.done ? `<button data-b="phone" class="red">CHECK PHONE</button>` : ""}
          <button data-b="off" class="off">${S.done ? "DONE" : "CLOSE"}</button></div></div>`;
    }
    function drawField() { const f = el.querySelector("#darkfield"); if (f) f.innerHTML = svgBody(); else draw(); }
    function startAdapt() {
      S.phase = "adapt"; S.min = 0; S.broke = false; S.say = LINES.adapt; draw(); clearInterval(tick);
      tick = setInterval(() => { S.min += .25;                                    // 20 minutes in about six seconds
        if (!S.broke && S.min >= 7.75) { S.broke = true; S.say = LINES.break; sfx("tock"); draw(); }
        if (S.min >= 20) { clearInterval(tick); S.say = LINES.ready; sfx("chime"); draw(); timer = setTimeout(startLook, 2200); return; }
        drawField(); el.querySelector(".status") && (el.querySelector(".status").textContent = thresh(S.min) < EMIT ? "BELOW THE EMISSION" : "WAITING  ·  JUST WAIT, IT TAKES A FEW SECONDS"); }, 75);
    }
    function startLook() {
      S.phase = "look"; S.trial = 0; S.dots = []; S.say = LINES.look; draw(); clearInterval(tick);
      let beat = 0;
      tick = setInterval(() => {                                                   // earbud pulses: two, one, two
        const t = TRIALS[S.trial], now = performance.now(); beat++;
        const pulse = [1, 1, 0, 1, 0, 1, 1, 0][beat % 8];
        if (pulse) { const smp = sampler(SHAPES[t.answer], t.needleBoost), n = Math.max(1, Math.round(t.sig * (.6 + R() * .8)));
          for (let i = 0; i < n; i++) { const [x, y] = smp(R); S.dots.push({ x: CX + x + (R() - .5) * 4, y: CY + y + (R() - .5) * 4, t: now + R() * 120 }); }
          sfx("ktick"); }
        for (let i = 0; i < t.noise; i++) S.dots.push({ x: 40 + R() * 560, y: 20 + R() * 180, t: now + R() * 300 });
        S.dots = S.dots.filter(d => now - d.t < 1600);
        drawField();
      }, 220);
    }
    function answer(id) {
      const t = TRIALS[S.trial]; if (!t || S.done) return;
      if (id !== t.answer) { S.wrong++; S.tw++; sfx("bad");
        S.say = S.tw >= 4 ? LINES.show : S.tw >= 2 ? LINES.hint[S.trial] : S.tw % 2 ? LINES.bad : LINES.bad2; draw(); return; }
      S.say = LINES.ok[S.trial]; S.tw = 0;
      if (S.trial === TRIALS.length - 1) { clearInterval(tick); S.done = true; sfx("chime"); score("dark", Math.max(1, 4 - S.wrong)); draw(); return; }
      sfx("good"); S.trial++; S.dots = [];
      draw(); timer = setTimeout(() => { if (S.phase === "look") { S.say = LINES.next[S.trial - 1]; draw(); } }, 2600);
    }
    const onClick = (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const lk = t.closest("[data-leak]"); if (lk && S.phase === "prep") { if (!S.leaks.has(lk.dataset.leak)) { S.leaks.add(lk.dataset.leak); S.say = LINES.leak[lk.dataset.leak]; sfx("toggle"); draw();
          if (S.leaks.size === 3) timer = setTimeout(startAdapt, 1800); } return; }
      const o = t.closest("[data-opt]"); if (o && S.phase === "look" && !S.done) { answer(o.dataset.opt); return; }
      const k = t.closest("button[data-b]"); if (!k) return;
      if (k.dataset.b === "phone") {
        if (!S.phoneWarned) { S.phoneWarned = true; sfx("select"); S.say = LINES.phoneWarn; draw(); return; }
        sfx("bad"); clearInterval(tick); S.phoneWarned = false; S.say = LINES.phone; draw(); timer = setTimeout(startAdapt, 2200); }
      else if (k.dataset.b === "off") finish();
    };
    // gaze follows the pointer over the dark field (mouse or finger)
    const onMove = (e) => { if (S.phase !== "look") return; const f = el.querySelector("#darkfield"); if (!f) return;
      const r = f.getBoundingClientRect(), vb = 640 / r.width; S.gaze = [(e.clientX - r.left) * vb, (e.clientY - r.top) * (250 / r.height)];
      // staring dead-on at his head for a while gets a nudge
      if (Math.hypot(S.gaze[0] - CX, S.gaze[1] - CY) < 22) { S.stareT++; if (S.stareT === 40 && !S.done) { S.say = LINES.stare; draw(); } } else S.stareT = 0; };
    const onKey = (e) => { if (e.key === "Escape") finish(); };
    function finish() { clearInterval(tick); clearTimeout(timer); el.removeEventListener("click", onClick); el.removeEventListener("pointermove", onMove); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = ""; resolve({ done: S.done, wrong: S.wrong }); }
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); el.addEventListener("pointermove", onMove); window.addEventListener("keydown", onKey);
  });
}
