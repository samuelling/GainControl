// MUSIC: one theme, arranged by the drama. Synthesized live with WebAudio, scheduled a step ahead (16th notes).
//
// The theme is eight bars in D minor (i–VI–III–VII, then i–VI–iv–V). Like Gabriel Knight's bookstore theme, the day
// arrangement is the light version of it: an OP-1-ish square pluck with a little delay, a bouncy triangle bass, a
// small drum machine, and breathing room (every third pass drops the tune for a quiet arpeggio). Night is the same
// tune, slower, on a soft FM bell, over a pad, no drums, a clock ticking.
//
// DREAD (0–1) rises with the act, with night, with going underground, and at the climax. As it rises: the drums
// thin out, a dark detuned pad fades in and closes its filter, a throb arrives (the distant knock of the MRI, on the
// beat, then doubled), a tritone drone sits under the root, the tempo drags, and the tune drops an octave into the
// murk. music.scene({ act, mode, room, flags, title }) retargets it; music.glitch() is a stab for the title screen.
import { sfx } from "./sfx.js";

const THEME = [   // 8 bars × 8 eighth notes (MIDI, null = rest)
  [74, null, 69, null, 65, 69, 74, 76], [77, null, 74, null, 70, null, 69, null], [72, null, 69, 65, 69, null, 72, 74], [76, null, null, 74, 72, null, 67, null],
  [74, null, 69, null, 65, 69, 74, 77], [79, null, 77, null, 74, null, 70, null], [69, null, 67, null, 70, null, 74, null], [73, null, 76, null, 69, null, null, null],
];
const ROOTS = [38, 46, 41, 36, 38, 46, 43, 45];                     // D2 Bb2 F2 C2 D2 Bb2 G2 A2
const CHORDS = [[62, 65, 69], [58, 62, 65], [60, 65, 69], [60, 64, 67], [62, 65, 69], [58, 62, 65], [58, 62, 67], [57, 61, 64]];
const NIGHT_ROOTS = [38, 46, 43, 45, 38, 46, 43, 45], NIGHT_CHORDS = [CHORDS[0], CHORDS[1], CHORDS[6], CHORDS[7], CHORDS[0], CHORDS[1], CHORDS[6], CHORDS[7]];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const UNDER = new Set(["tunnels", "antechamber", "chamber", "plant", "tubehub", "crawlspace", "freezer", "maze", "server"]);

let C = null, bus = null, B = {}, delay = null, timer = null, step = 0, nextT = 0, pass = 0;
const P = { arr: "day", dread: 0, tempo: 104, throb: 0, on: false };

function init() {
  const a = sfx.audio && sfx.audio(); if (!a) return false;
  if (C) return true;
  C = a.ctx;
  bus = C.createGain(); bus.gain.value = .5; bus.connect(a.master);
  for (const k of ["mel", "bass", "drum", "pad", "throb", "arp"]) { B[k] = C.createGain(); B[k].gain.value = 0; B[k].connect(bus); }
  // the melody's little delay (3/16), and some of the arpeggio
  delay = C.createDelay(1); const fb = C.createGain(), wet = C.createGain(), lp = C.createBiquadFilter();
  delay.delayTime.value = .32; fb.gain.value = .32; wet.gain.value = .35; lp.type = "lowpass"; lp.frequency.value = 2400;
  delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(wet); wet.connect(bus);
  B.mel.connect(delay); B.arp.connect(delay);
  return true;
}

/* ---------------- instruments ---------------- */
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
function pluck(m, t, v, out, dark = 0) {          // OP-1-ish: a square through a closing filter
  const o = C.createOscillator(), f = C.createBiquadFilter(), g = C.createGain();
  o.type = "square"; o.frequency.value = hz(m); f.type = "lowpass"; f.Q.value = 3;
  f.frequency.setValueAtTime(3200 - 2400 * dark, t); f.frequency.exponentialRampToValueAtTime(500, t + .18);
  env(g, t, .003, v, .22); o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + .3);
}
function bell(m, t, v, out) {                       // a soft two-operator FM bell (an electric piano in a dark room)
  const car = C.createOscillator(), mod = C.createOscillator(), mg = C.createGain(), g = C.createGain();
  car.frequency.value = hz(m); mod.frequency.value = hz(m) * 2; mg.gain.setValueAtTime(hz(m) * 1.4, t); mg.gain.exponentialRampToValueAtTime(hz(m) * .05, t + 1.2);
  mod.connect(mg); mg.connect(car.frequency); env(g, t, .006, v, 1.6); car.connect(g); g.connect(out);
  car.start(t); mod.start(t); car.stop(t + 1.8); mod.stop(t + 1.8);
}
function bass(m, t, d, v, out) {
  const o = C.createOscillator(), s = C.createOscillator(), g = C.createGain();
  o.type = "triangle"; o.frequency.value = hz(m); s.type = "sine"; s.frequency.value = hz(m) / 2;
  env(g, t, .005, v, d); o.connect(g); s.connect(g); g.connect(out); o.start(t); s.start(t); o.stop(t + d + .1); s.stop(t + d + .1);
}
function noiseHit(t, f, q, v, d, out, type = "bandpass") {
  const a = sfx.audio(); const s = C.createBufferSource(), fl = C.createBiquadFilter(), g = C.createGain();
  s.buffer = a.noise; fl.type = type; fl.frequency.value = f; fl.Q.value = q; env(g, t, .001, v, d);
  s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + d + .05);
}
function kick(t, v) { const o = C.createOscillator(), g = C.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
  env(g, t, .002, v, .18); o.connect(g); g.connect(B.drum); o.start(t); o.stop(t + .25); }
const hat = (t, v) => noiseHit(t, 8000, 1.2, v, .035, B.drum, "highpass");
const clap = (t, v) => noiseHit(t, 1500, 1.5, v, .09, B.drum);
// the distant knock of the MRI: a low thud, muffled, with a gradient click on top
function knock(t, v) {
  const o = C.createOscillator(), g = C.createGain(), lp = C.createBiquadFilter();
  o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(38, t + .14); lp.type = "lowpass"; lp.frequency.value = 220;
  env(g, t, .004, v, .22); o.connect(lp); lp.connect(g); g.connect(B.throb); o.start(t); o.stop(t + .3);
  noiseHit(t, 420, 6, v * .25, .05, B.throb);
}
// a pad chord for a bar: two detuned saws per note through a lowpass that closes as the dread rises
function pad(notes, t, dur, v, cutoff) {
  const f = C.createBiquadFilter(), g = C.createGain(); f.type = "lowpass"; f.frequency.value = cutoff; f.Q.value = .7;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + Math.min(1.2, dur * .4)); g.gain.setValueAtTime(v, t + dur * .8); g.gain.linearRampToValueAtTime(0, t + dur + .6);
  f.connect(g); g.connect(B.pad);
  for (const m of notes) for (const dt of [-8, 7]) { const o = C.createOscillator(); o.type = "sawtooth"; o.frequency.value = hz(m); o.detune.value = dt; o.connect(f); o.start(t); o.stop(t + dur + .7); }
}

/* ---------------- the sequencer ---------------- */
function scheduleStep(s, t) {
  const bar = Math.floor(s / 16) % 8, i = s % 16, night = P.arr !== "day", d = P.dread, spb = 60 / P.tempo / 4;
  const roots = night ? NIGHT_ROOTS : ROOTS, chords = night ? NIGHT_CHORDS : CHORDS;
  const section = Math.floor(s / 128) % 3;            // two passes with the tune, one breathing
  // melody (eighths), one octave down and murkier as the dread rises
  if (i % 2 === 0) {
    const m = THEME[bar][i / 2];
    if (m != null) {
      const oct = d > .55 ? -12 : 0;
      if (!night && section < 2) pluck(m + oct, t, .16, B.mel, d);
      if (night && i % 4 === 0 && (section !== 1 || bar < 4)) bell(m - 12 + oct, t, .14, B.mel);
    }
  }
  // the breathing pass: a quiet arpeggio of the chord instead of the tune
  if (!night && section === 2 && i % 2 === 0) { const ch = chords[bar]; pluck(ch[(i / 2) % 3] + 12, t, .07, B.arp, d); }
  // bass
  if (!night) { if (i % 4 === 0 || i === 6 || i === 14) bass(roots[bar] + (i === 6 || i === 14 ? 12 : 0), t, spb * 1.6, .22, B.bass); }
  else if (i === 0) bass(roots[bar], t, spb * 15, .16, B.bass);
  // drums (day only, thinning out with the dread)
  if (!night) {
    if (i === 0 || i === 8 || (i === 10 && bar % 2)) kick(t, .4);
    if (i % 4 === 2) hat(t, .07); if (i === 12 && bar % 2) clap(t, .1);
  } else if (i % 4 === 0) hat(t, .03);                 // night: a clock ticking
  // pad: one chord a bar; with real dread, a tritone under the root and, later, a cluster
  if (i === 0 && (night || d > .25)) {
    const ch = chords[bar].map(m => m - 12), extra = d > .6 ? [roots[bar] + 6] : [], clu = d > .82 ? [ch[0] + 1] : [];
    pad([...ch, ...extra, ...clu], t, spb * 16, .045, 300 + 1700 * (1 - d));
  }
  // the throb: the MRI, two floors away, on the beat; doubled when it's close
  if (P.throb > 0 && i % 4 === 0) { knock(t, .5); if (d > .7) knock(t + spb * 1.5, .32); }
}
function tick() {
  if (!C || C.state !== "running") return;
  while (nextT < C.currentTime + .14) { scheduleStep(step, nextT); nextT += 60 / P.tempo / 4; step++; }
}

/* ---------------- scenes ---------------- */
function mix() {
  if (!C) return;
  const now = C.currentTime, d = P.dread, night = P.arr !== "day", to = (k, v) => B[k].gain.setTargetAtTime(v, now, 1.2);
  to("mel", night ? .8 : .9 - .3 * d); to("arp", .7); to("bass", night ? .7 : .9);
  to("drum", night ? .35 : Math.max(0, .85 - 1.1 * d));
  to("pad", night ? .5 + .6 * d : Math.max(0, (d - .25) * 1.6));
  to("throb", P.throb);
}
// render a scene offline (for previews and tests): returns the AudioBuffer
async function renderOffline(scene, secs = 30, rate = 22050) {
  const O = new OfflineAudioContext(1, Math.round(secs * rate), rate), saved = { C, bus, B, delay, P: { ...P }, step, nextT };
  const nb = O.createBuffer(1, rate * 2, rate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const master = O.createGain(); master.gain.value = .7; const comp = O.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; master.connect(comp); comp.connect(O.destination);
  const realAudio = sfx.audio; sfx.audio = () => ({ ctx: O, master, noise: nb });
  C = null; B = {}; init(); music.scene(scene);
  for (const k in B) B[k].gain.cancelScheduledValues(0);
  { const dd = P.dread, night = P.arr !== "day"; B.mel.gain.value = night ? .8 : .9 - .3 * dd; B.arp.gain.value = .7; B.bass.gain.value = night ? .7 : .9;
    B.drum.gain.value = night ? .35 : Math.max(0, .85 - 1.1 * dd); B.pad.gain.value = night ? .5 + .6 * dd : Math.max(0, (dd - .25) * 1.6); B.throb.gain.value = P.throb; }
  step = 0; nextT = .05; while (nextT < secs) { scheduleStep(step, nextT); nextT += 60 / P.tempo / 4; step++; }
  const buf = await O.startRendering();
  sfx.audio = realAudio; ({ C, bus, B, delay, step, nextT } = saved); Object.assign(P, saved.P);
  return buf;
}
export const music = {
  renderOffline,
  start() { if (!init() || P.on) return; P.on = true; nextT = C.currentTime + .1; timer = setInterval(tick, 25); mix(); },
  // where we are → arrangement, dread, tempo, throb
  scene({ act = 1, mode = "day", room = "", flags = {}, title = false } = {}) {
    let d = { 1: 0, 2: .12, 3: .3, 4: .48, 5: .62 }[act] || 0, arr = mode === "day" ? "day" : "night";
    if (title) { d = .32; arr = "day"; }
    if (mode === "night") d += .18;
    if (mode === "morning") { arr = "night"; d = Math.max(d, .45); }
    if (UNDER.has(room)) d += .22;
    if (room === "mri") d += .1;
    if (flags.climax) d = 1;
    d = Math.max(0, Math.min(1, d));
    P.arr = arr; P.dread = d;
    P.tempo = arr === "day" ? 104 - 22 * d : 74 - 10 * d;
    P.throb = room === "mri" || room === "crawlspace" ? .6 + .4 * d : d > .38 ? (d - .38) * 1.3 : 0;
    mix();
  },
  // the title screen's takeover: a dissonant stab and a lurch
  glitch() {
    if (!C || C.state !== "running") return; const t = C.currentTime + .01;
    for (const m of [38, 44, 51]) { const o = C.createOscillator(), g = C.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(hz(m), t); o.frequency.exponentialRampToValueAtTime(hz(m - 5), t + .45);
      env(g, t, .01, .05, .45); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .5); }
    bus.gain.setValueAtTime(.5, t); bus.gain.linearRampToValueAtTime(.15, t + .05); bus.gain.linearRampToValueAtTime(.5, t + .5);
  },
  get state() { return { ...P, step }; },
};
window.MUSIC = music;
