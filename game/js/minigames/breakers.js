// THE COLD START (Act V, B3 power plant; played by Iris). Page 14 of the 1968 operator's manual prints the cold-start
// steps in the engineer's order, which is wrong. Iris's pencil notes in the margin correct it. Throw the six breakers
// in the corrected order: each right one steps the supply needle up; a wrong one sparks and kicks itself back off (the
// ones already up stay up), and Iris says which pencil note it broke. After two wrong throws she reads out the note for
// the next breaker; after four, the next breaker lights green. Then the charge climbs. breakers(el, { score(key, n), onBreak(order) }) → Promise<{ done, tries, order }>
// onBreak is called with the current string of thrown breakers (e.g. "ACD") after each throw, and "" after a reset.
import { seg, segC, segW, star4, arcs, chip } from "../gfx.js";

export const ORDER = "ACDBEF";
const BRK = {
  A: { name: "CONTROL", step: "CONTROL POWER", how: "CLOSE 120 V CONTROL CIRCUIT. PILOT LAMPS LIGHT." },
  B: { name: "M-G SET", step: "M-G SET", how: "START MOTOR-GENERATOR. ALLOW 90 S TO REACH SPEED." },
  C: { name: "COOLING", step: "COOLING WATER", how: "OPEN COIL COOLING WATER. VERIFY FLOW." },
  D: { name: "DUMP RES.", step: "DUMP RESISTOR", how: "CONNECT DUMP RESISTOR ACROSS COILS." },
  E: { name: "GEN FIELD", step: "GENERATOR FIELD", how: "EXCITE GENERATOR FIELD. OBSERVE SUPPLY METER." },
  F: { name: "COIL BUS", step: "COIL BUS", how: "CLOSE MAIN BUS TO MAGNET COILS." },
};
const PRINTED = "ABEFCD";   // the engineer's order, as printed
const LINES = {
  intro: ["IRIS", "Page fourteen. Cold start. The printed order is the engineer's. He never ran it. I did."],
  intro2: ["IRIS", "The pencil in the margins is mine. Throw all six in my order, not his. Trust the pencil."],
  ok: {
    A: ["IRIS", "Control power. The pilot lamps still come on. So do I."],
    C: ["IRIS", "Water. Cool the coils before you ask anything of them. People too."],
    D: ["IRIS", "The dump resistor. Somewhere for the energy to go when it all goes wrong. Everyone should have one."],
    B: ["IRIS", "The motor-generator. Hear it whine? That's a 1968 whine. They don't make them like that."],
    E: ["IRIS", "Field on the generator. Watch the needle. It knows."],
    F: ["IRIS", "And the coil bus. Now it's a magnet again. Almost."],
  },
  // a wrong throw: why it was wrong (the pencil note it broke). The rest stay up.
  why: {
    early: ["IRIS", "Sparks. Control power first, dear: A. Nothing else lights without it. In 1968 we'd have called that a near miss and gone to lunch."],
    C: ["IRIS", "Sparks. The water goes RIGHT AFTER A. There's an arrow. I drew it in 1968 and it still points. Only that one dropped; the rest held."],
    B: ["IRIS", "Not yet. The note by B: water and dump first. That's the engineer's order, dear. He's dead. Of the order, I always assumed."],
    E: ["IRIS", "Sparks. E, ONLY ONCE B WHINES. Do you hear a whine? I don't. Only that one dropped."],
    F: ["IRIS", "Sparks. The coil bus goes last. Everything else first. My hands remember this panel. My hands are eighty-eight."],
  },
  // after two wrong throws: the note for the next breaker, read aloud
  hint: {
    A: ["IRIS", "Start with A, dear. Control power. That part the engineer got right."],
    C: ["IRIS", "After A: the arrow. RIGHT AFTER A! It points at C. The water."],
    D: ["IRIS", "Water's in. Next: D BEFORE ANYTHING SPINS. The dump resistor."],
    B: ["IRIS", "Water and dump are in. Now B, the M-G set. Let it whine."],
    E: ["IRIS", "B is whining. ONLY ONCE B WHINES: that's E's note. E."],
    F: ["IRIS", "Last one, dear. F. C is in, so F is allowed."],
  },
  show: (L) => ["IRIS", `This one, dear. ${L}. It's lit. My hands remember even when the rest of me doesn't.`],
  trap: ["IRIS", "Never F before C. I underlined it. Twice. In 1968. For exactly this evening. Only that one dropped; the rest held."],
  charging: ["IRIS", "Now the charge. It takes its time. So did I."],
  done: ["IRIS", "Supply's charged. The knife switch is upstairs, by the ring. Not yet. First, the stair."],
};

const CSS = `
.brk svg.brksvg { position: relative; width: 100%; flex: 1 1 0; min-height: 0; }
.brk [data-brk] { cursor: pointer; }
.brk.lock [data-brk] { cursor: default; }
.brk:not(.lock) [data-brk]:hover .hs { stroke: var(--G); }
.brk .coachline { font-size: 1.8cqw; line-height: 1.2; }
`;
function css() { if (document.getElementById("css-breakers")) return; const s = document.createElement("style"); s.id = "css-breakers"; s.textContent = CSS; document.head.appendChild(s); }

// handwriting: the stroke alphabet, slanted, thinner, a little uneven
function hand(str, x, y, h, rot = 0, cls = "sA") {
  return `<g transform="translate(${x},${y}) rotate(${rot}) skewX(-16)">${seg(str, 0, 0, h, cls, .85)}</g>`;
}

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function breakers(el, { score = () => {}, onBreak = () => {} } = {}) {
  css();
  return new Promise(resolve => {
    const S = { up: "", tries: 1, spark: null, sp: 0, lock: false, charge: 0, charging: false, done: false, say: LINES.intro, bad: 0 };
    const timers = []; let spoken = null;
    const later = (ms, f) => timers.push(setTimeout(f, ms));

    function page() {
      const x0 = 6, y0 = 4;
      let s = `<path class="hl sW" d="M${x0},${y0} L${x0 + 288},${y0} L${x0 + 300},${y0 + 12} L${x0 + 300},${y0 + 268} L${x0},${y0 + 268} Z M${x0 + 288},${y0} L${x0 + 288},${y0 + 12} L${x0 + 300},${y0 + 12}"/>`;
      s += seg("FECHNER HALL  PSYCHOPHYSICS ANNEX", x0 + 10, y0 + 9, 4, "sM", .7) + seg("MAGNET SUPPLY MS-68  OPERATOR'S MANUAL  P. 14", x0 + 10, y0 + 17, 4, "sM", .7);
      s += seg("COLD START PROCEDURE", x0 + 10, y0 + 29, 9, "sW", 1.2) + `<path class="hl sW" d="M${x0 + 10},${y0 + 42} L${x0 + 160},${y0 + 42}"/>`;
      [...PRINTED].forEach((L, i) => {
        const y = y0 + 54 + i * 35;
        s += seg(`${i + 1}.  ${L}   ${BRK[L].step}`, x0 + 10, y, 7, "sW", 1) + seg(BRK[L].how, x0 + 22, y + 11, 3.6, "sM", .65);
      });
      s += seg("FOLLOW ORDER EXACTLY.  - R. H. HALVERSON, P.E.", x0 + 10, y0 + 260, 3.6, "sM", .65);
      // Iris's pencil, 1968
      s += hand("WRONG ORDER! HE NEVER RAN IT.", x0 + 168, y0 + 22, 5, -4) + hand("- I.C.", x0 + 250, y0 + 31, 5, -4);
      // B: not yet
      s += hand("NOT YET -", x0 + 186, y0 + 86, 5.5, -3) + hand("WATER + DUMP FIRST", x0 + 186, y0 + 95, 5.5, -3)
        + `<path class="sA" d="M${x0 + 182},${y0 + 92} C${x0 + 166},${y0 + 92} ${x0 + 140},${y0 + 94} ${x0 + 112},${y0 + 93}"/>`;
      // E: once B whines
      s += hand("ONLY ONCE B WHINES", x0 + 186, y0 + 125, 5.5, -2);
      // F: the trap, boxed and underlined twice
      s += `<g transform="translate(${x0 + 168},${y0 + 152}) rotate(-3)"><path class="sA" d="M-4,-3 L118,-5 L119,22 L-3,23 Z"/>
        <g transform="skewX(-16)">${seg("NEVER F BEFORE C", 2, 1, 7, "sA", 1.1)}</g>${hand("- I.C. '68", 66, 12, 5, 0)}
        <path class="sA" d="M2,27 L114,25 M6,30 L110,28.5"/></g>`;
      // C: an arrow from C up to just after A
      s += `<path class="sA" d="M${x0 + 96},${y0 + 199} C${x0 + 150},${y0 + 196} ${x0 + 170},${y0 + 120} ${x0 + 150},${y0 + 82} C${x0 + 142},${y0 + 70} ${x0 + 120},${y0 + 72} ${x0 + 104},${y0 + 76}"/>
        <path class="sA" d="M${x0 + 110},${y0 + 71} L${x0 + 103},${y0 + 76} L${x0 + 111},${y0 + 80}"/>` + hand("RIGHT AFTER A!", x0 + 150, y0 + 206, 5.5, -2);
      s += `<path class="sA" d="M${x0 + 8},${y0 + 189} C${x0 + 2},${y0 + 194} ${x0 + 2},${y0 + 202} ${x0 + 8},${y0 + 206}"/>`;
      // D: before anything spins
      s += hand("D BEFORE ANYTHING SPINS.", x0 + 150, y0 + 236, 5.5, -2) + hand("ASK ME HOW I KNOW.", x0 + 168, y0 + 246, 4.5, -2);
      return s;
    }
    function meter() {
      const cx = 400, cy = 108, r = 66, ang = (k) => (-55 + 110 * k / 6) * Math.PI / 180;
      const P = (a, rr) => [cx + Math.sin(a) * rr, cy - Math.cos(a) * rr];
      let s = `<rect class="k sW mech" x="${cx - 82}" y="${cy - 92}" width="164" height="112"/><rect class="hl sD mech" x="${cx - 76}" y="${cy - 86}" width="152" height="100"/>`;
      const a0 = P(ang(0), r), a1 = P(ang(6), r);
      s += `<path class="sW" d="M${a0[0].toFixed(1)},${a0[1].toFixed(1)} A${r},${r} 0 0 1 ${a1[0].toFixed(1)},${a1[1].toFixed(1)}"/>`;
      const g0 = P(ang(5), r - 5), g1 = P(ang(6), r - 5);
      s += `<path class="sG" d="M${g0[0].toFixed(1)},${g0[1].toFixed(1)} A${r - 5},${r - 5} 0 0 1 ${g1[0].toFixed(1)},${g1[1].toFixed(1)}"/>`;
      for (let k = 0; k <= 24; k++) { const a = -55 * Math.PI / 180 + 110 * Math.PI / 180 * k / 24, p = P(a, r), q = P(a, r - (k % 4 ? 4 : 8));
        s += `<path class="${k % 4 ? "hl " : ""}sW" d="M${p[0].toFixed(1)},${p[1].toFixed(1)} L${q[0].toFixed(1)},${q[1].toFixed(1)}"/>`; }
      ["0", "25", "50", "75", "100"].forEach((t, i) => { const p = P(ang(i * 1.5), r + 8); s += segC(t, p[0], p[1] - 3, 4.5, "sM", .8); });
      s += segC("SUPPLY %", cx, cy - 40, 5, "sM", .8) + segC("MS-68", cx, cy + 4, 4, "sD", .7);
      // the needle jumps between fixed poses; while sparking it kicks hard and falls
      let k = S.up.length; if (S.spark) k = S.sp % 2 ? 6.2 : Math.max(0, k - 1.5);
      const n = P(ang(Math.min(6.3, k)), r - 10);
      s += `<path class="sR" d="M${cx},${cy} L${n[0].toFixed(1)},${n[1].toFixed(1)}"/><circle class="k sW" cx="${cx}" cy="${cy}" r="4"/>`;
      if (S.done) s += arcs(cx + 88, cy - 40, 1, "sG", 3, .8) + arcs(cx - 88, cy - 40, -1, "sG", 3, .8);
      return s;
    }
    function chargeBar() {
      const x = 510, y = 18;
      let s = seg("CHARGE", x, y, 4.5, "sM", .8) + seg(String(S.charge * 10).padStart(3, " ") + "%", x, y + 8, 16, S.done ? "sG" : "sW", 1.4);
      for (let k = 0; k < 10; k++) { const lit = S.charge > k, yy = y + 88 - k * 8;
        s += `<rect class="${lit ? "fG" : "hl sD"}" x="${x + 70}" y="${yy}" width="34" height="6"/>`; }
      s += seg("MAGNET", x, y + 40, 4.5, "sM", .8) + seg("B3 RING", x, y + 48, 7, "sW", 1);
      if (S.done) s += chip("SUPPLY READY", x, y + 70, 5, "fG");
      else if (S.charging) s += chip("CHARGING", x, y + 70, 5, "fA");
      return s;
    }
    function breaker(L, i) {
      const x = 322 + i * 52, cx = x + 22, y = 162, up = S.up.includes(L), sp = S.spark === L;
      const lit = !up && !sp && !S.done && !S.charging && S.bad >= 4 && ORDER[S.up.length] === L;   // the answer, after four wrong throws
      let s = `<g data-brk="${L}">` + segC(L, cx, y - 16, 11, up || lit ? "sG" : "sW", 1.4);
      s += `<rect class="k hs ${sp ? "sR" : lit ? "sG" : "sW"} mech" x="${x}" y="${y}" width="44" height="80"/>`;
      if (lit) s += arcs(x - 4, y + 40, -1, "sG", 2, .6) + arcs(x + 48, y + 40, 1, "sG", 2, .6);
      s += up ? `<circle class="fG" cx="${cx}" cy="${y + 9}" r="3.2"/>` : `<circle class="hl sD" cx="${cx}" cy="${y + 9}" r="3.2"/>`;
      s += `<rect class="hl sM mech" x="${cx - 5}" y="${y + 18}" width="10" height="54"/>`;
      const hy = up ? y + 20 : y + 54;
      s += `<path class="sW" d="M${cx},${y + 45} L${cx},${hy + 8}"/><rect class="k ${up ? "sG" : "sW"}" x="${cx - 15}" y="${hy}" width="30" height="16" rx="3"/><path class="hl sW" d="M${cx - 10},${hy + 8} L${cx + 10},${hy + 8}"/>`;
      s += segC(BRK[L].name, cx, y + 85, 3.8, "sM", .7);
      if (sp) {
        const a = S.sp % 2;
        s += star4(cx + (a ? 16 : -14), y + (a ? 28 : 50), a ? 7 : 5, "sA") + star4(cx + (a ? -18 : 18), y + (a ? 60 : 24), a ? 5 : 7, "sR")
          + arcs(cx - 26, y + 40, -1, "sR", 3, .7) + arcs(cx + 26, y + 40, 1, "sR", 3, .7)
          + `<path class="sA" d="M${cx},${y - 4} L${cx - 4},${y - 12} M${cx + 8},${y - 2} L${cx + 14},${y - 9} M${cx - 8},${y - 2} L${cx - 14},${y - 8}"/>`;
      }
      s += `<rect x="${x - 3}" y="${y - 20}" width="50" height="112" fill="transparent"/></g>`;
      return s;
    }
    function draw() {
      const col = "V";
      if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(S.say[0], true); }
      el.innerHTML = `<div class="screen brk ${S.lock || S.done || S.charging ? "lock" : ""}">
        <svg class="t hd" viewBox="0 0 640 40">${seg("THE COLD START", 16, 10, 18, "sW", 1.6)}${seg("B3  POWER PLANT  1968 MAGNET SUPPLY", 206, 17, 5, "sM", .8)}</svg>
        <svg class="t brksvg" viewBox="0 0 640 276">
          ${page()}
          ${meter()}${chargeBar()}
          <path class="hl sD" d="M316,130 L636,130"/>${seg("BREAKERS", 322, 134, 4, "sM", .7)}
          ${[..."ABCDEF"].map(breaker).join("")}
        </svg>
        <div class="coachline"><span class="who" style="background:var(--${col})">${S.say[0]}</span><span style="color:var(--${col})">${S.say[1]}</span></div>
        <div class="bar"><span class="status">${S.done ? "SUPPLY CHARGED" : S.charging ? "CHARGING" : `THROW ALL SIX IN THE PENCIL ORDER (CLICK, OR KEYS A-F)   ·   UP: ${S.up || "NONE"}`}</span>
          <button data-b="off" class="off">${S.done ? "DONE" : "CLOSE"}</button></div></div>`;
    }
    function throwIt(L) {
      if (S.lock || S.done || S.charging || S.up.includes(L)) return;
      const want = ORDER[S.up.length], before = S.up;
      S.up += L; onBreak(S.up); sfx("clunk");
      if (L === want) {
        S.say = LINES.ok[L]; draw(); if (L === "B") sfx("mgset");
        if (S.up.length === 6) charge();
        return;
      }
      // wrong: spark (poses), then that one breaker kicks back off; the ones already up stay up
      S.lock = true; S.spark = L; S.sp = 0; draw(); sfx("zap");
      const trap = L === "F" && !before.includes("C");
      const why = trap ? LINES.trap : !before ? LINES.why.early : want === "C" ? LINES.why.C : LINES.why[L];
      [1, 2, 3, 4].forEach(k => later(130 * k, () => { S.sp = k; draw(); if (k === 2) sfx("spark"); }));
      later(700, () => {
        S.spark = null; S.up = before; S.tries++; S.bad++; S.lock = false; onBreak(S.up); sfx("thud");
        S.say = why; draw();
        // the hint ladder: the next note read aloud after two wrong throws, the next breaker lit after four
        const next = ORDER[S.up.length], n = S.bad;
        if (n >= 2) later(2800, () => { if (!S.done && !S.lock && S.bad === n && ORDER[S.up.length] === next) { S.say = n >= 4 ? LINES.show(next) : LINES.hint[next]; draw(); } });
      });
    }
    function charge() {
      S.charging = true;
      later(900, () => { S.say = LINES.charging; draw(); sfx("whine"); });
      for (let k = 1; k <= 10; k++) later(900 + k * 260, () => { S.charge = k; draw(); sfx("cite"); });
      later(900 + 11 * 260, () => { S.charging = false; S.done = true; S.say = LINES.done; sfx("chime"); score("breakers", Math.max(1, 5 - S.tries)); draw(); });
    }
    const onClick = (e) => {
      const b = e.target.closest && e.target.closest("button[data-b]"); if (b) { finish(); return; }
      const k = e.target.closest && e.target.closest("[data-brk]"); if (k) throwIt(k.dataset.brk);
    };
    const onKey = (e) => {
      if (e.key === "Escape") finish();
      const L = e.key.toUpperCase(); if (L.length === 1 && "ABCDEF".includes(L)) throwIt(L);
    };
    function finish() {
      timers.forEach(clearTimeout);
      el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = "";
      resolve({ done: S.done, tries: S.tries, order: S.up });
    }
    el.classList.add("show"); draw();
    later(3600, () => { if (S.say === LINES.intro) { S.say = LINES.intro2; draw(); } });
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
  });
}
