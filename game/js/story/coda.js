// THE CODA: the last screens of the game, after the final act. From the real record, not the story.
// The 1977 letter's suggestion is paraphrased; only its short postscript is quoted.
// The postscript blinks on, dot by dot, in an LED board (the lamps are drawn ON, like every lit thing in the game), over a
// low dark hum with the score hushed; it holds, blinks out the same way, and the credits roll.
import { segC } from "../gfx.js";

// a 5×7 dot font, just the letters the postscript needs (and a few spares)
const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"], D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"], F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"], H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"], L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"], N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"], P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"], S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"], V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"], Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"], ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};
const LINES = ["I ALMOST FORGOT:", "THE GAVEL WAS", "A BRASS PENIS."];

// the board: every dot position, and which of them the text lights
function board() {
  const wide = Math.max(...LINES.map(l => l.length)), cols = wide * 6 - 1 + 6, rows = LINES.length * 9 - 2 + 6, P = 6;
  const x0 = 320 - (cols - 1) * P / 2, y0 = 168 - (rows - 1) * P / 2, lit = [];
  LINES.forEach((ln, li) => {
    const off = 3 + Math.floor((wide - ln.length) * 6 / 2);
    [...ln].forEach((ch, ci) => (FONT[ch] || FONT[" "]).forEach((row, r) => [...row].forEach((b, c) => {
      if (b === "1") lit.push([x0 + (off + ci * 6 + c) * P, y0 + (3 + li * 9 + r) * P]); })));
  });
  // a fixed shuffle, so the dots come on in a scattered order
  let seed = 1977; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = lit.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [lit[i], lit[j]] = [lit[j], lit[i]]; }
  let grid = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) grid += `<circle class="fD" cx="${x0 + c * P}" cy="${y0 + r * P}" r=".9"/>`;
  return { lit, grid, frame: `<rect class="hl sD" x="${x0 - P}" y="${y0 - P}" width="${(cols + 1) * P}" height="${(rows + 1) * P}"/>`, y1: y0 + rows * P };
}
const dots = (pts) => pts.map(([x, y]) => `<circle class="fA" cx="${x}" cy="${y}" r="2.3"/>`).join("");

// the hum: two low sines a fifth-and-octave apart, a slow beat between them, and a breath of filtered noise
function hum() {
  const A = window.SFX && window.SFX.audio && window.SFX.audio(); if (!A || A.ctx.state !== "running" || window.SFX.muted) return () => {};
  const { ctx, master, noise } = A, t = ctx.currentTime, out = ctx.createGain(); out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.16, t + 1.6); out.connect(master);
  const src = [];
  for (const [f, g] of [[41.2, .6], [61.7, .25], [82.6, .18]]) { const o = ctx.createOscillator(), gg = ctx.createGain(); o.frequency.value = f; gg.gain.value = g; o.connect(gg); gg.connect(out); o.start(t); src.push(o); }
  const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .35; lg.gain.value = .05; lfo.connect(lg); lg.connect(out.gain); lfo.start(t); src.push(lfo);
  if (noise) { const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain(); n.buffer = noise; n.loop = true; bp.type = "lowpass"; bp.frequency.value = 180; ng.gain.value = .25;
    n.connect(bp); bp.connect(ng); ng.connect(out); n.start(t); src.push(n); }
  return () => { const e = ctx.currentTime; out.gain.cancelScheduledValues(e); out.gain.setValueAtTime(out.gain.value, e); out.gain.linearRampToValueAtTime(0, e + 1.2);
    setTimeout(() => { src.forEach(s => { try { s.stop(); } catch (er) {} }); out.disconnect(); }, 1400); };
}

export async function coda(api) {
  const { bigCard, centered, cchip } = api;
  await bigCard(`${cchip("FROM THE REAL RECORD", 70, 7, "fW")}
    ${centered("IN 1977, A LETTER IN AMERICAN PSYCHOLOGIST", 118, 7, "sW", 1.1)}
    ${centered("DESCRIBED A REAL SECRET SOCIETY OF YOUNG PSYCHOLOGISTS.", 136, 7, "sW", 1.1)}
    ${centered("ITS AUTHOR, CHARLES GROSS, SUGGESTED SOMEONE STUDY ITS ARCHIVES:", 166, 7, "sM", 1.1)}
    ${centered("WHAT ITS MEMBERS WENT ON TO DO ON GRANT", 184, 7, "sM", 1.1)}
    ${centered("COMMITTEES AND EDITORIAL BOARDS.", 202, 7, "sM", 1.1)}
    ${centered("IN THIS GAME, THAT IS NELL'S LAST PIECE OF EVIDENCE.", 236, 7, "sA", 1.1)}
    ${centered("HE ADDED A POSTSCRIPT.", 280, 6, "sM", 1)}`, { hold: 1500, auto: 0 });

  // the postscript, on the LED board
  const B = board(), id = "led" + Math.floor(Math.random() * 1e6), n = B.lit.length;
  const IN = [.06, .16, .3, .48, .7, .9, 1], OUT = [.75, .5, .3, .14, .04, 0];
  const t = { in: IN.length * 110 + 3 * 120, hold: 6200, out: OUT.length * 110 + 500 };
  window.MUSIC && window.MUSIC.hush && window.MUSIC.hush(true, 1.4);
  const stopHum = hum();
  const shown = bigCard(`${B.frame}<g>${B.grid}</g><g id="${id}"></g><g id="${id}c" style="visibility:hidden">${segC("C. G. GROSS, AMERICAN PSYCHOLOGIST, 1977", 320, B.y1 + 24, 5.6, "sA", .9)}</g>`,
    { auto: t.in + t.hold + t.out, hold: t.in + t.hold + t.out });
  const set = (k) => { const g = document.getElementById(id); if (g) g.innerHTML = dots(B.lit.slice(0, Math.round(n * k))); };
  (async () => {
    await api.wait(700);
    for (const k of IN) { set(k); window.SFX && window.SFX.play("tick"); await api.wait(110); }
    for (const k of [0, 1, 0, 1]) { set(k); await api.wait(k ? 160 : 70); }   // the board settles: a flicker
    const c = document.getElementById(id + "c"); if (c) c.style.visibility = "visible";
    await api.wait(t.hold - 700);
    if (c) c.style.visibility = "hidden";
    for (const k of OUT) { set(k); await api.wait(110); }
    stopHum();
  })();
  await shown;
  window.MUSIC && window.MUSIC.hush && window.MUSIC.hush(false, 2);
}
