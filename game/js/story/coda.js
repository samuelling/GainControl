// THE CODA: the last screens of the game, after the final act. From the real record, not the story.
// The 1977 letter's suggestion is paraphrased; only its short postscript is quoted.
// Both screens are the title's LED panel (title.js LED): the CRT dot opens out onto the first (the letter, in small
// dots), a click blinks it out and the postscript blinks on, dot by dot, in big dots, over a low dark hum with the score
// hushed; it holds, the tube switches off back down to the dot, a second of silence, and the credits roll.
import { LED } from "../title.js";

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

// the two screens, as dot maps
function letterMap() {
  const m = new Map(), { NC, text, center, textW } = LED, row = (t, r, cls) => text(m, t, center(t), r, cls);
  row("FROM THE REAL RECORD", 10, "g");
  row("IN 1977, A LETTER IN AMERICAN PSYCHOLOGIST", 24, "w"); row("DESCRIBED A REAL SECRET SOCIETY", 32, "w"); row("OF YOUNG PSYCHOLOGISTS.", 40, "w");
  row("ITS AUTHOR, CHARLES GROSS, SUGGESTED", 50, "x"); row("SOMEONE STUDY ITS ARCHIVES: WHAT ITS", 58, "x");
  row("MEMBERS WENT ON TO DO ON GRANT", 66, "x"); row("COMMITTEES AND EDITORIAL BOARDS.", 74, "x");
  row("IN THIS GAME, THAT IS NELL'S", 85, "a"); row("LAST PIECE OF EVIDENCE.", 93, "a");
  row("HE ADDED A POSTSCRIPT.", 104, "w");
  text(m, "CLICK >", NC - 6 - textW("CLICK >"), 104, "m");
  return m;
}
function postscriptMap() {
  const m = new Map(), { BIG, text, center } = LED, big = (t, r) => text(m, t, center(t, BIG, 2), r, "a", BIG, 2);
  // his words, in quotes (four lines: with the quote marks, the first line wouldn't fit as three)
  big('"I ALMOST', 10); big("FORGOT: THE", 30); big("GAVEL WAS A", 50); big('BRASS PENIS."', 70);
  text(m, "C. G. GROSS, AMERICAN PSYCHOLOGIST, 1977", center("C. G. GROSS, AMERICAN PSYCHOLOGIST, 1977"), 96, "w");
  return m;
}
// a fixed shuffle of a map's dots, so they come on (and go off) scattered, like a real board
function scattered(map, seed) {
  const e = [...map.entries()];
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = e.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [e[i], e[j]] = [e[j], e[i]]; }
  return (k) => LED.render(new Map(e.slice(0, Math.round(e.length * k))));
}

export async function coda(api) {
  LED.css();
  const wait = (ms) => api.wait(ms), tick = () => window.SFX && window.SFX.play("tick");
  window.MUSIC && window.MUSIC.hush && window.MUSIC.hush(true, 1.4);
  const stopHum = hum();
  // the tube warms up from the dot, onto the letter
  const scr = api.crt(), A = scattered(letterMap(), 1977);
  scr.set(A(1));
  await scr.click(1500);
  // the letter blinks out, dot by dot; a beat of dark; then the postscript blinks on
  for (const k of [.7, .45, .25, .1, 0]) { scr.set(A(k)); await wait(90); }
  await wait(600);
  const B = scattered(postscriptMap(), 412);
  for (const k of [.06, .16, .3, .48, .7, .9, 1]) { scr.set(B(k)); tick(); await wait(110); }
  for (const k of [0, 1, 0, 1]) { scr.set(B(k)); await wait(k ? 160 : 70); }   // the board settles: a flicker
  // it holds (a click moves on, after a moment), then the tube switches off
  await scr.click(1800, 6500);
  stopHum();
  await scr.close();
  // a second of silence, then the credits
  await wait(1200);
  window.MUSIC && window.MUSIC.hush && window.MUSIC.hush(false, .2);
}
