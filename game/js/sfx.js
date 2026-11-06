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
  blank: () => { tone(4200, .5, { g: .025, a: .05 }); tone(4260, .5, { g: .025, a: .05 }); },
};

/* ---------------- dialogue: each speaker gets a little voice ---------------- */
const VOICE = { NELL: [520, "triangle"], MORRIS: [980, "square"], GUS: [300, "triangle"], PRESTON: [600, "sine"], IRIS: [420, "triangle"], "THE OLD WOMAN": [420, "triangle"],
  QUORUM: [180, "sawtooth"], "THE CORRESPONDING AUTHOR": [180, "sawtooth"], HOOD: [150, "sawtooth"], "A HOOD": [150, "sawtooth"], REX: [240, "square"], DANA: [560, "triangle"],
  TESS: [480, "square"], PENNY: [640, "triangle"], ETHEL: [400, "sine"], CODY: [700, "square"], SMALL: [260, "sine"], DET: [260, "sine"], IMPACT: [340, "sawtooth"],
  ADLINE: [460, "triangle"], "PROF. ADLINE": [460, "triangle"], BRETT: [620, "square"], NARRATOR: [0, ""] };
let vt = 0;
function voiceTick(who) {
  const key = Object.keys(VOICE).find(k => (who || "").toUpperCase().startsWith(k)); const v = VOICE[key || "NARRATOR"] || [0];
  if (!v[0]) { if ((vt++ & 3) === 0) noise(.012, { f: 2400, q: 3, g: .02 }); return; }
  if ((vt++ & 1) === 0) tone(v[0] * (1 + (Math.random() - .5) * .14), .045, { type: v[1], g: v[1] === "sine" ? .045 : .022 });
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
  voice(who) { if (muted || !ac() || ctx.state !== "running") return; try { voiceTick(who); } catch (e) {} },
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
