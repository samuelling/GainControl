// SOUND: every effect is synthesized with WebAudio at play time. No samples.
// The house sound is the visual language in audio: short, clean, a little lo-fi, Game & Watch / OP-1.
// sfx.play(name, opts) for one-shots, sfx.ambience(room, mode) for the room tone, sfx.voice(who) for dialogue ticks.
let ctx = null, master = null, ambBus = null, fxBus = null, noiseBuf = null;
let muted = false;
try { muted = localStorage.getItem("gaincontrol.mute") === "1"; } catch (e) {}

function ac() {
  if (ctx) return ctx;
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
  ctx = new C();
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.connect(ctx.destination);
  master = ctx.createGain(); master.gain.value = muted ? 0 : .7; master.connect(comp);
  fxBus = ctx.createGain(); fxBus.gain.value = .9; fxBus.connect(master);
  ambBus = ctx.createGain(); ambBus.gain.value = .55; ambBus.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}
const now = () => ctx.currentTime;
// an enveloped oscillator: f (Hz), dur (s), type, g (peak gain), glide (Hz to slide to), at (delay), a (attack)
function tone(f, dur, { type = "sine", g = .2, glide = 0, at = 0, a = .004, out = fxBus, vib = 0 } = {}) {
  const t = now() + at, o = ctx.createOscillator(), e = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, glide), t + dur);
  if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 6; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + .05); }
  e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + a); e.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(e); e.connect(out); o.start(t); o.stop(t + dur + .05);
}
// a filtered noise burst
function noise(dur, { f = 1200, q = 1, type = "bandpass", g = .2, at = 0, a = .003, sweep = 0, out = fxBus } = {}) {
  const t = now() + at, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), e = ctx.createGain();
  s.buffer = noiseBuf; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
  if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, t + dur);
  e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + a); e.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl); fl.connect(e); e.connect(out); s.start(t, Math.random()); s.stop(t + dur + .05);
}
// a struck metal object: inharmonic partials
function metal(f, dur, g = .12, at = 0) { [1, 2.76, 5.4, 8.93].forEach((m, i) => tone(f * m, dur / (1 + i * .6), { type: "sine", g: g / (1 + i), at })); noise(.03, { f: 4000, g: g * .8, at }); }

/* ---------------- the one-shots ---------------- */
let stepAlt = 0;
const SURF = { lab: "tile", hall: "tile", seminar: "carpet", office: "carpet", ethics: "carpet", impact: "tile", mri: "tile", kitchen: "tile", server: "metal",
  tunnels: "wet", conference: "carpet", iris: "wood", library: "carpet", impactoffice: "carpet", freezer: "tile", maze: "wet", defense: "carpet",
  antechamber: "stone", chamber: "stone", plant: "metal", tubehub: "metal", crawlspace: "wet" };
const S = {
  step: (o = {}) => { const s = SURF[o.room] || "tile", alt = (stepAlt ^= 1) ? 1 : .88;
    if (s === "carpet") noise(.05, { f: 380 * alt, q: .8, g: .09, type: "lowpass" });
    else if (s === "wood") { noise(.04, { f: 700 * alt, q: 2, g: .1 }); tone(140 * alt, .05, { g: .05 }); }
    else if (s === "metal") { noise(.03, { f: 2600 * alt, q: 4, g: .07 }); tone(520 * alt, .09, { type: "triangle", g: .025 }); }
    else if (s === "stone") { noise(.05, { f: 900 * alt, q: 1.4, g: .1 }); tone(90, .07, { g: .05 }); }
    else if (s === "wet") { noise(.05, { f: 1100 * alt, q: 1.2, g: .08 }); if (Math.random() < .3) tone(1400, .06, { glide: 2200, g: .03, at: .03 }); }
    else noise(.035, { f: 1500 * alt, q: 1.6, g: .08 }); },
  ratstep: () => { noise(.015, { f: 5200, q: 3, g: .05 }); },
  pop: () => { tone(660, .06, { type: "triangle", g: .07 }); tone(990, .08, { type: "triangle", g: .07, at: .045 }); },
  select: () => { tone(1180, .05, { type: "square", g: .035 }); noise(.012, { f: 6000, g: .03 }); },
  cancel: () => { tone(520, .06, { type: "triangle", g: .06, glide: 380 }); },
  door: () => { tone(80, .18, { g: .22, glide: 55 }); noise(.08, { f: 300, type: "lowpass", g: .12 }); noise(.02, { f: 3000, q: 6, g: .06, at: .16 }); },
  pickup: () => { [784, 988, 1319].forEach((f, i) => tone(f, .09, { type: "triangle", g: .07, at: i * .055 })); },
  score: () => { tone(1568, .12, { g: .06 }); tone(2093, .16, { g: .05, at: .07 }); },
  card: () => { noise(.5, { f: 300, sweep: 4000, q: .7, g: .07, a: .2 }); },
  switch: () => { tone(660, .07, { type: "square", g: .04 }); tone(990, .1, { type: "square", g: .04, at: .07 }); },
  death: () => { [392, 370, 349, 311].forEach((f, i) => tone(f, i === 3 ? .9 : .26, { type: "sawtooth", g: .06, at: i * .27, vib: i === 3 ? 8 : 0 })); tone(98, 1.4, { g: .12, at: .8 }); },
  revise: () => { for (let i = 0; i < 4; i++) noise(.06, { f: 2400 + i * 300, q: 1, g: .06, at: i * .07 }); tone(523, .12, { type: "triangle", g: .05, at: .3 }); tone(784, .16, { type: "triangle", g: .05, at: .38 }); },
  key: () => { tone(1240, .07, { type: "square", g: .04 }); },
  bad: () => { tone(110, .25, { type: "square", g: .06 }); tone(116, .25, { type: "square", g: .06 }); },
  good: () => { tone(1046, .08, { type: "triangle", g: .06 }); tone(1568, .14, { type: "triangle", g: .06, at: .08 }); },
  tube: () => { noise(.7, { f: 500, sweep: 2600, q: 2, g: .08, a: .15 }); for (let i = 0; i < 6; i++) noise(.02, { f: 3000, q: 5, g: .05, at: .2 + i * .07 }); tone(1800, .05, { g: .03, at: .75 }); },
  clang: () => metal(320, 1.2, .14),
  gavel: () => { tone(190, .12, { g: .22, glide: 120 }); noise(.03, { f: 1800, q: 2, g: .12 }); },
  knock: () => { [0, .18].forEach(at => { tone(150, .09, { g: .2, at, glide: 110 }); noise(.02, { f: 900, g: .08, at }); }); },
  staple: () => { noise(.015, { f: 5000, q: 4, g: .14 }); tone(260, .05, { type: "square", g: .05, at: .01 }); metal(1400, .15, .04, .02); },
  spark: () => { for (let i = 0; i < 7; i++) noise(.012, { f: 3000 + Math.random() * 5000, q: 6, g: .06, at: Math.random() * .25 }); },
  creak: () => { tone(70, 1.6, { type: "sawtooth", g: .05, glide: 52, a: .3 }); tone(74, 1.6, { type: "sawtooth", g: .04, glide: 49, a: .3, at: .1 }); noise(1.2, { f: 220, q: 3, g: .06, at: .2 }); },
  crash: () => { tone(60, 2.4, { g: .45, glide: 28 }); noise(1.8, { f: 2200, sweep: 160, type: "lowpass", g: .4, a: .005 }); metal(160, 2, .1, .05);
    for (let i = 0; i < 14; i++) noise(.05, { f: 600 + Math.random() * 2400, q: 2, g: .08, at: .2 + Math.random() * 1.4 }); },
  ramp: () => { tone(40, 3.2, { type: "sawtooth", g: .06, glide: 360, a: .6 }); tone(80, 3.2, { g: .08, glide: 720, a: .6 }); },
  alarm: () => { for (let i = 0; i < 4; i++) tone(i % 2 ? 660 : 880, .16, { type: "square", g: .04, at: i * .18 }); },
  espresso: () => { for (let i = 0; i < 12; i++) noise(.08, { f: 400 + Math.random() * 500, q: 4, g: .07, at: i * .09 }); noise(.9, { f: 3000, q: .5, g: .05, at: .9, a: .2 }); },
  hiss: () => { noise(1.4, { f: 5000, q: .5, g: .1, a: .1, type: "highpass" }); },
  nod: () => { tone(220, .05, { g: .05 }); noise(.02, { f: 800, g: .03 }); },
  bell: () => { metal(880, .8, .06); },
  splash: () => { noise(.4, { f: 1800, sweep: 500, q: .8, g: .1 }); tone(600, .1, { glide: 1400, g: .04, at: .05 }); },
  drip: () => { tone(1300 + Math.random() * 600, .07, { glide: 2600, g: .04 }); },
  thud: () => { tone(70, .3, { g: .3, glide: 45 }); noise(.08, { f: 400, type: "lowpass", g: .15 }); },
  zap: () => { tone(1800, .18, { type: "sawtooth", g: .05, glide: 200 }); S.spark(); },
  chant: () => { [110, 138.6, 164.8].forEach((f, i) => tone(f, 1.6, { type: "sawtooth", g: .025, a: .4, at: i * .02, vib: 2 })); },
  // story moments
  tape: () => { tone(1800, .05, { type: "square", g: .03 }); noise(.4, { f: 1200, q: .5, g: .02, at: .05, a: .05 }); tone(60, .4, { g: .03, at: .05 }); },
  shutter: () => { noise(.02, { f: 4000, q: 2, g: .12 }); noise(.03, { f: 2200, q: 3, g: .08, at: .06 }); tone(2600, .03, { type: "square", g: .02, at: .1 }); },
  buzz: () => { for (let i = 0; i < 3; i++) tone(170, .14, { type: "square", g: .03, at: i * .22 }); },
  scanner: () => { for (let i = 0; i < 10; i++) tone(i % 2 ? 620 : 840, .07, { type: "square", g: .035, at: i * .11 }); tone(42, 1.2, { g: .06, at: .1 }); },
  cloth: () => { noise(.35, { f: 900, sweep: 2400, q: .7, g: .07, a: .08 }); },
  blank: () => { tone(4200, .5, { g: .025, a: .05 }); tone(4260, .5, { g: .025, a: .05 }); },
  /* ---- minigames ---- */
  // shared
  chime: () => { [1046, 1318, 1568, 2093].forEach((f, i) => tone(f, .55, { g: .045, at: i * .07 })); },
  stamp: () => { tone(130, .1, { g: .16, glide: 70 }); noise(.04, { f: 900, q: 1, g: .12 }); noise(.015, { f: 3200, q: 3, g: .05, at: .02 }); },
  whoosh: () => { noise(.2, { f: 500, sweep: 2600, q: .9, g: .15, a: .06 }); },
  paper: () => { noise(.12, { f: 3200, q: .8, g: .06, a: .02 }); tone(170, .05, { g: .06, at: .1 }); },
  compute: () => { for (let i = 0; i < 6; i++) tone(500 + Math.random() * 1500, .04, { type: "square", g: .025, at: i * .045 }); },
  nudge: (o = {}) => { tone(o.f || 900, .03, { type: "square", g: .03 }); },
  // THE CEILING (formerly GRIM): the desk calculator
  calc: () => { tone(1900, .03, { type: "square", g: .028 }); noise(.008, { f: 7000, q: 3, g: .04 }); },
  // the overlay
  flip: () => { noise(.13, { f: 2200, sweep: 700, q: 1, g: .13, a: .02 }); tone(900, .06, { type: "triangle", g: .03, glide: 600, at: .09 }); },
  // the nod: six heads, one tock (with a hair of flam); the encore's dread
  tock: () => { [0, .012].forEach(at => { tone(380, .07, { type: "triangle", g: .08, glide: 300, at }); noise(.02, { f: 1400, q: 3, g: .04, at }); }); },
  whisper: () => { noise(.14, { f: 3600, q: 1.5, g: .05, a: .03 }); },
  dread: () => { [55, 58.3, 82.4].forEach((f, i) => tone(f, 1.9, { type: "sawtooth", g: .035, a: .7, at: i * .05 })); noise(1.6, { f: 220, q: 2, g: .04, a: .7 }); },
  // the GLM: knob detents (pitch follows the value), the fit lamp, the seesaw
  ktick: (o = {}) => { noise(.008, { f: 4200, q: 3, g: .08 }); tone(700 + 500 * (o.v || 0), .02, { type: "square", g: .012 }); },
  lamp: () => { noise(.01, { f: 2500, q: 4, g: .06 }); tone(1760, .45, { g: .06, at: .01 }); tone(2637, .3, { g: .025, at: .01 }); },
  seesaw: () => { tone(300, .22, { type: "triangle", g: .04, glide: 345, at: .25 }); tone(345, .22, { type: "triangle", g: .04, glide: 310, at: .47 });
    tone(110, .1, { g: .1, glide: 80, at: .7 }); noise(.03, { f: 600, q: 2, g: .06, at: .7 }); },
  // FOG NEURO: the printer, the citation counter
  printer: () => { for (let i = 0; i < 10; i++) noise(.03, { f: 1800 + (i % 2) * 700, q: 2, g: .12, at: i * .08 }); tone(200, .85, { type: "square", g: .012, a: .05 }); },
  cite: () => { tone(2600, .025, { type: "square", g: .016 }); },
  // the missing hours: calendar toggles
  toggle: (o = {}) => { noise(.012, { f: 2200, q: 4, g: .08 }); tone(o.on ? 720 : 480, .04, { type: "square", g: .03, at: .008 }); },
  // the retainer: scale steps and the layer clicks (each one higher)
  scale: (o = {}) => { tone(o.up ? 640 : 760, .07, { type: "triangle", g: .045, glide: o.up ? 880 : 520 }); },
  layer: (o = {}) => { tone(560 + (o.n || 1) * 130, .05, { type: "square", g: .035 }); noise(.01, { f: 5000, q: 4, g: .05 }); },
  // the defense: a card on the table, credibility, the committee
  deal: () => { noise(.06, { f: 2600, sweep: 1200, q: .8, g: .08 }); tone(200, .05, { g: .07, at: .05 }); },
  credup: () => { [784, 988, 1175].forEach((f, i) => tone(f, .08, { type: "triangle", g: .05, at: .1 + i * .05 })); },
  creddown: () => { [523, 440, 370].forEach((f, i) => tone(f, .1, { type: "triangle", g: .05, at: .1 + i * .07 })); },
  harrumph: () => { tone(150, .2, { type: "sawtooth", g: .04, glide: 105, at: .3 }); noise(.12, { f: 500, q: 1.5, g: .035, at: .3 }); },
  sting: () => { [196, 233, 294].forEach(f => tone(f, 1.1, { type: "sawtooth", g: .03 })); tone(98, 1.3, { g: .12 }); metal(392, .7, .04); },
  // the cold start: a heavy breaker, the needle dropping, the M-G set, the charge whine
  clunk: () => { tone(90, .16, { g: .2, glide: 60 }); noise(.05, { f: 700, q: 1, g: .15 }); metal(620, .25, .035, .01); },
  powerdown: () => { tone(420, .6, { type: "sawtooth", g: .04, glide: 60, a: .01 }); },
  mgset: () => { tone(110, 1.3, { type: "sawtooth", g: .025, glide: 440, a: .4 }); tone(220, 1.3, { g: .03, glide: 880, a: .4 }); },
  whine: () => { tone(220, 2.9, { type: "sawtooth", g: .025, glide: 1320, a: .4 }); tone(223, 2.9, { g: .035, glide: 1330, a: .4 }); },
  // the archive: a reel into the canister, the brass dial, the countdown (n ticks a second, hotter as it runs out)
  reel: () => { noise(.05, { f: 1500, q: 2, g: .08 }); tone(300, .08, { type: "triangle", g: .06, at: .04 }); metal(900, .12, .03, .05); },
  ratchet: (o = {}) => { const n = Math.max(1, Math.min(4, o.n || 1)); for (let i = 0; i < n * 2; i++) { noise(.012, { f: 3200, q: 3, g: .1, at: i * .035 }); tone(i % 2 ? 900 : 1100, .015, { type: "square", g: .012, at: i * .035 }); } },
  countdown: (o = {}) => { const n = o.n || 1, hot = !!o.hot; for (let i = 0; i < n; i++) { noise(.012, { f: hot ? 3600 : 2600, q: 3, g: hot ? .09 : .06, at: i / n });
    if (hot) tone(i % 2 ? 1400 : 1600, .025, { type: "square", g: .018, at: i / n }); } },
  // the supports: gnaw, kick, a bolt hitting concrete, creak and groan, the crack before the drop
  gnaw: () => { for (let i = 0; i < 3; i++) noise(.03, { f: 2200 + i * 500, q: 2, g: .11, at: i * .045 }); },
  kick: () => { tone(160, .08, { g: .13, glide: 90 }); noise(.03, { f: 1200, q: 1.5, g: .09 }); metal(1100, .1, .025); },
  bolt: () => { metal(2400, .16, .05); metal(2400, .08, .022, .1); },
  creak2: (o = {}) => { const m = Math.min(2.2, o.m || 0), g = .022 + m / 2.2 * .03; tone(120 - m * 15, .55, { type: "sawtooth", g, glide: 80, a: .12, vib: 4 }); noise(.45, { f: 650, q: 6, g: g * 1.1, a: .1 }); },
  groan: () => { tone(58, 1.2, { type: "sawtooth", g: .05, glide: 42, a: .25 }); tone(61, 1.2, { type: "sawtooth", g: .035, glide: 44, a: .25 }); noise(.9, { f: 170, q: 2, g: .06, a: .2 }); },
  crack: () => { noise(.08, { f: 3000, q: .7, g: .18 }); tone(80, .2, { g: .14, glide: 50 }); },
  // the cross-reference: a hairline drawn, and the step back to the brain
  pen: (o = {}) => { noise(.01, { f: 5200, q: 5, g: .04 }); tone(1100 + (o.k || 0) * 70, .02, { type: "triangle", g: .02 }); },
  swell: () => { [262, 330, 392, 523].forEach((f, i) => tone(f, 2.3, { type: "triangle", g: .035, a: .9, at: i * .12, vib: 3 })); noise(1.7, { f: 400, sweep: 3000, q: .7, g: .035, a: 1 }); },
  // THE ECHO (echo.js)
  echoTick: () => { tone(1760, .03, { type: "triangle", g: .03 }); noise(.01, { f: 5000, q: 4, g: .02 }); },
  echoLamp: () => { noise(.008, { f: 3200, q: 6, g: .05 }); tone(2400, .02, { type: "square", g: .015 }); },
  echoKettle: () => { tone(1850, .7, { g: .035, glide: 2100, a: .12, vib: 18 }); tone(1870, .7, { g: .02, glide: 2140, a: .12 }); noise(.7, { f: 6000, q: 2, g: .03, a: .1 }); },
  echoPhone: () => { for (let i = 0; i < 10; i++) metal(1250 + (i % 2) * 90, .05, .035, i * .045); },
  echoSneeze: (o = {}) => { if (o.ah) { tone(330, .3, { type: "triangle", g: .025, glide: 470, a: .08 }); return; } noise(.16, { f: 2600, q: .7, g: .14, a: .004, sweep: 900 }); tone(700, .08, { type: "square", g: .02, glide: 420 }); },
  echoRattle: () => { for (let i = 0; i < 5; i++) { noise(.018, { f: 2200 + Math.random() * 900, q: 5, g: .07, at: i * .055 }); metal(900 + Math.random() * 200, .05, .02, i * .055); } },
  echoMisfire: () => { S.staple(); tone(95, .14, { g: .16, glide: 60, at: .03 }); noise(.04, { f: 600, type: "lowpass", g: .1, at: .03 }); },
  echoHum: (o = {}) => { const l = o.lvl == null ? .5 : o.lvl; tone(55, 1.4, { type: "sawtooth", g: .012 + .03 * l, a: .5, vib: 1 + 2 * l }); tone(110.6, 1.4, { g: .01 + .02 * l, a: .5 }); },
  echoSwish: () => { noise(.32, { f: 900, sweep: 2600, q: .8, g: .06, a: .12 }); },
  echoAdvance: () => { [196, 185, 174.6].forEach((f, i) => tone(f, .5, { type: "sawtooth", g: .05, at: i * .16, vib: 4 })); tone(65.4, 1.2, { g: .14, at: .1 }); },
  echoCarries: () => { [261.6, 329.6, 392, 523.3].forEach((f, i) => tone(f, 1.6, { type: "triangle", g: .045, a: .06, at: i * .03 })); metal(1046, 1, .025, .05); },
  echoClose: () => { for (let i = 0; i < 4; i++) noise(.35, { f: 700 + i * 200, sweep: 2200, q: .8, g: .06, a: .12, at: i * .22 }); tone(73.4, 1.8, { type: "sawtooth", g: .06, a: .6, vib: 3 }); tone(77.8, 1.8, { type: "sawtooth", g: .05, a: .6 }); },
  // THE FOG (stairwell.js)
  fogPreston: (o = {}) => { const n = o.near == null ? .5 : o.near; tone(70 + 30 * n, .12, { g: .04 + .2 * n, glide: 45 }); noise(.05, { f: 500 + 700 * n, type: "lowpass", g: .03 + .1 * n }); },
  fogSlam: () => { tone(70, .3, { g: .3, glide: 40 }); noise(.12, { f: 500, type: "lowpass", g: .18 }); metal(150, .45, .05, .01); },
  fogGrab: () => { metal(620, .35, .07); noise(.18, { f: 1400, q: 1.5, g: .07, sweep: 700 }); },
  fogWhiff: () => { noise(.22, { f: 600, sweep: 3200, q: .8, g: .09, a: .05 }); },
  fogShove: () => { tone(95, .18, { g: .22, glide: 60 }); noise(.05, { f: 700, type: "lowpass", g: .12 }); metal(260 + Math.random() * 40, .25, .035, .01); },
  fogBam: () => { tone(55, .55, { g: .35, glide: 34 }); noise(.45, { f: 2400, sweep: 200, type: "lowpass", g: .25 }); metal(180, .9, .08, .02); },
  fogFlap: () => { for (let i = 0; i < 6; i++) noise(.03, { f: 2800 + Math.random() * 1600, q: 1.2, g: .05, at: i * .06 }); tone(120, .08, { g: .1, glide: 80, at: .42 }); noise(.04, { f: 900, type: "lowpass", g: .08, at: .42 }); },
  fogBuzz: () => { tone(120, .1, { type: "sawtooth", g: .05 }); tone(240, .1, { type: "square", g: .015 }); noise(.008, { f: 5000, q: 4, g: .04 }); },
  fogChain: () => { for (let i = 0; i < 6; i++) metal(1000 + Math.random() * 500, .09, .03, i * .045 + Math.random() * .02); noise(.3, { f: 3200, q: 2, g: .03 }); },
  fogHiss: () => { noise(1.1, { f: 3800, q: .6, g: .05, a: .25, type: "highpass" }); },
  fogSurge: () => { noise(.9, { f: 3000, sweep: 300, q: .7, g: .09, a: .02 }); tone(180, .7, { type: "sawtooth", g: .03, glide: 60 }); },
  fogZone: (o = {}) => { const b = 392 * Math.pow(2, -(o.z || 0) * 2 / 12); [1, .84, .75].forEach((m, i) => tone(b * m, .3, { type: "triangle", g: .06, at: i * .12 })); tone(b / 4, .9, { g: .1, at: .24 }); },
  fogCaught: () => { [0, 1, 2].forEach(i => tone(440 - i * 40, .12, { type: "square", g: .05, at: i * .05 })); noise(.15, { f: 900, q: 1, g: .1 }); },
  fogEscape: () => { [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, .3, { type: "triangle", g: .06, at: i * .1 })); metal(2093, .8, .02, .42); },
};

/* ---------------- dialogue: each speaker gets a little voice ---------------- */
const VOICE = { NELL: [520, "triangle"], MORRIS: [980, "square"], GUS: [300, "triangle"], PRESTON: [600, "sine"], IRIS: [420, "triangle"], "THE OLD WOMAN": [420, "triangle"],
  QUORUM: [180, "sawtooth"], "THE CORRESPONDING AUTHOR": [180, "sawtooth"], HOOD: [150, "sawtooth"], "A HOOD": [150, "sawtooth"], REX: [240, "square"], DANA: [560, "triangle"],
  TESS: [480, "square"], PENNY: [640, "triangle"], ETHEL: [400, "sine"], CODY: [700, "square"], SMALL: [260, "sine"], DET: [260, "sine"], IMPACT: [340, "sawtooth"],
  ADLINE: [460, "triangle"], "PROF. ADLINE": [460, "triangle"], BRETT: [620, "square"], NARRATOR: [0, ""] };
let vt = 0;
// force: tick now (one tick for a new coach line), instead of every other / every fourth letter while typing
function voiceTick(who, force) {
  const key = Object.keys(VOICE).find(k => (who || "").toUpperCase().startsWith(k)); const v = VOICE[key || "NARRATOR"] || [0];
  if (!v[0]) { if (force || (vt++ & 3) === 0) noise(.012, { f: 2400, q: 3, g: .02 }); return; }
  if (force || (vt++ & 1) === 0) tone(v[0] * (1 + (Math.random() - .5) * .14), .045, { type: v[1], g: v[1] === "sine" ? .045 : .022 });
}

/* ---------------- room tone ---------------- */
// each room: a drone (frequencies and level) and a periodic event; night is quieter
const AMB = {
  hall: { hum: [60, 120], lvl: .02, every: [9, 16], ev: "tubeFar" }, lab: { hum: [60, 120, 180], lvl: .016, every: [7, 14], ev: "tick" },
  seminar: { hum: [120], lvl: .012, every: [6, 12], ev: "murmur" }, office: { hum: [60, 120], lvl: .014, every: [5, 10], ev: "typing" },
  ethics: { hum: [60], lvl: .01, every: [12, 20], ev: "page" }, kitchen: { hum: [100, 200], lvl: .018, every: [6, 12], ev: "fridge" },
  impact: { hum: [50, 150], lvl: .018, every: [10, 18], ev: "blank" }, mri: { hum: [42, 84], lvl: .03, every: [1.2, 1.2], ev: "coldhead" },
  server: { fan: 900, lvl: .03, hum: [120], every: [8, 14], ev: "tick" }, tunnels: { hum: [38, 76], lvl: .03, fan: 300, every: [1.5, 4], ev: "drip" },
  conference: { hum: [60], lvl: .01, every: [7, 12], ev: "cough" }, iris: { hum: [], lvl: .0, every: [1, 1], ev: "clock" },
  library: { hum: [60], lvl: .008, every: [10, 18], ev: "page" }, impactoffice: { hum: [60], lvl: .01, every: [14, 24], ev: "plane" },
  freezer: { hum: [55, 110, 165], lvl: .035, fan: 400, every: [10, 16], ev: "tick" }, maze: { hum: [60], lvl: .012, every: [3, 7], ev: "drip" },
  defense: { hum: [120], lvl: .01, every: [6, 12], ev: "cough" }, antechamber: { hum: [55, 55.6], lvl: .03, every: [6, 10], ev: "chantFar" },
  chamber: { hum: [55, 55.7, 82.5], lvl: .04, every: [5, 9], ev: "chantFar" }, plant: { hum: [60, 120, 180, 240], lvl: .04, every: [4, 8], ev: "spark" },
  tubehub: { hum: [48], lvl: .02, every: [3, 6], ev: "tubeFar" }, crawlspace: { hum: [42, 84], lvl: .045, fan: 200, every: [1, 3], ev: "drip" },
};
const EV = {
  tubeFar: () => { noise(.6, { f: 400, sweep: 1400, q: 2, g: .025, a: .2, out: ambBus }); },
  tick: () => { noise(.01, { f: 3000, q: 4, g: .02, out: ambBus }); },
  murmur: () => { for (let i = 0; i < 5; i++) tone(180 + Math.random() * 120, .12, { type: "triangle", g: .008, at: i * .13, out: ambBus }); },
  typing: () => { for (let i = 0; i < 8; i++) noise(.012, { f: 2600, q: 3, g: .02, at: i * (.08 + Math.random() * .05), out: ambBus }); },
  page: () => { noise(.25, { f: 3500, q: .6, g: .02, a: .05, out: ambBus }); },
  fridge: () => { tone(98, 1.2, { type: "sawtooth", g: .01, a: .3, out: ambBus }); },
  blank: () => { tone(4200, .4, { g: .006, a: .05, out: ambBus }); },
  coldhead: () => { noise(.12, { f: 600, q: 2, g: .05, out: ambBus }); tone(52, .14, { g: .05, out: ambBus }); },
  drip: () => { tone(1200 + Math.random() * 900, .06, { glide: 2400, g: .03, out: ambBus }); },
  cough: () => { noise(.12, { f: 700, q: 1, g: .02, out: ambBus }); noise(.1, { f: 700, q: 1, g: .015, at: .18, out: ambBus }); },
  clock: () => { noise(.008, { f: 2000 + (stepAlt ^= 1) * 400, q: 8, g: .03, out: ambBus }); },
  plane: () => { noise(4, { f: 200, sweep: 500, q: 1, g: .012, a: 1.5, out: ambBus }); },
  chantFar: () => { [110, 138.6].forEach(f => tone(f, 2.2, { type: "sawtooth", g: .006, a: .8, out: ambBus })); },
  spark: () => { if (Math.random() < .5) for (let i = 0; i < 3; i++) noise(.01, { f: 4000 + Math.random() * 3000, q: 6, g: .02, at: Math.random() * .2, out: ambBus }); },
};
let ambNow = { key: "", nodes: [], timer: 0 };
function stopAmb() {
  clearTimeout(ambNow.timer);
  ambNow.nodes.forEach(n => { try { n.g.gain.setTargetAtTime(0, now(), .3); n.src.stop(now() + 1.5); } catch (e) {} });
  ambNow = { key: "", nodes: [], timer: 0 };
}
function startAmb(room, mode) {
  const A = AMB[room]; if (!A) return;
  const quiet = mode === "night" ? .6 : 1;
  for (const f of A.hum || []) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.value = 0;
    g.gain.setTargetAtTime(A.lvl * quiet / Math.max(1, (A.hum.length - 1) * .7), now(), .8); o.connect(g); g.connect(ambBus); o.start(); ambNow.nodes.push({ src: o, g }); }
  if (A.fan) { const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; s.loop = true; fl.type = "lowpass"; fl.frequency.value = A.fan;
    g.gain.value = 0; g.gain.setTargetAtTime(A.lvl * quiet * .8, now(), .8); s.connect(fl); fl.connect(g); g.connect(ambBus); s.start(); ambNow.nodes.push({ src: s, g }); }
  const next = () => { const [a, b] = A.every; ambNow.timer = setTimeout(() => { if (!muted && EV[A.ev]) EV[A.ev](); next(); }, (a + Math.random() * (b - a)) * 1000); };
  next();
}

export const sfx = {
  unlock() { if (!ac()) return; if (ctx.state === "suspended") ctx.resume().then(() => sfx.resumeAmbience()); else sfx.resumeAmbience(); },
  play(name, opts) { if (muted || !ac() || ctx.state !== "running") return; const f = S[name]; if (f) try { f(opts); } catch (e) {} },
  voice(who, force) { if (muted || !ac() || ctx.state !== "running") return; try { voiceTick(who, force); } catch (e) {} },
  blip(fs = [880, 1320]) { if (muted || !ac() || ctx.state !== "running") return; fs.forEach((f, i) => tone(f, .12, { type: "square", g: .035, at: i * .08 })); },
  ambience(room, mode) { const key = room + "/" + mode; if (!ac() || ambNow.key === key) return; stopAmb(); ambNow.key = key; if (ctx.state === "running" && !muted) startAmb(room, mode); else ambNow.pending = [room, mode]; },
  resumeAmbience() { if (ambNow.pending && ctx && ctx.state === "running" && !muted) { const [r, m] = ambNow.pending; delete ambNow.pending; startAmb(r, m); } },
  get muted() { return muted; },
  toggle() { muted = !muted; try { localStorage.setItem("gaincontrol.mute", muted ? "1" : "0"); } catch (e) {}
    if (ac()) master.gain.setTargetAtTime(muted ? 0 : .7, now(), .05);
    if (!muted && ambNow.key) { const [r, m] = ambNow.key.split("/"); ambNow.key = ""; sfx.ambience(r, m); }
    return muted; },
};
window.SFX = sfx;   // so minigames and test pages can reach it without importing
