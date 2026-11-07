// MUSIC: one theme, arranged by the drama. Synthesized live with WebAudio, scheduled a step ahead (16th notes).
//
// THE TUNE. The theme (A) is eight bars in D minor (i–VI–III–VII, then i–VI–iv–V). There is a varied A (A': the same
// skeleton, displaced and ornamented, with an anticipation into bar 2) and a bridge (B) that lifts into the relative
// major and walks home (VI–III–iv–VII, VI–v–iv–V), with its own tune (rising arpeggios, falling sequences: the theme's
// opening turned upside down). A counter-melody (guide tones) answers in A' and B and at the ends of A's phrases.
// Every arrangement runs the same 40-bar form, A A' B A(handed to another voice) R(a breath: no tune, an arpeggio), so
// walking between rooms never jumps the harmony: only the band changes, at the next barline, and the tempo glides.
//
// HARMONY. Every melody note on a beat, and every sustained tone (pads, organ, bass, bells), is a chord tone of the
// chord under it. Off-beat passing tones may step, and are always played short. music.trace() logs every pitched
// note against its chord so a test can prove it (and /tmp/harm2.mjs checks the tables).
//
// THE BANDS. The main menu plays the OP-1 tune. The game opens on a Rhodes (Act I day): the tune on electric piano over syncopated Rhodes
// chords, a soft bass and a lazy, lightly swung beat. The OP-1 arrives in Act II: the square pluck and its arpeggios
// over a bossa (rim clave, shaker, marimba answers). Act III day is angular
// (muted brass with octave leaps, broken beat, woodblocks, brass stabs). Act IV day is restless (a sixteenth-note
// ostinato, driving hats, a pulsing bass). Act V day is a march. Nights are sparse: a music box and a ticking clock
// (I), vibes in a slow brushed shuffle (II), the FM bell over a heartbeat (III), the bell low with brass and the
// knock (IV, V). The morning is hazy: a breathy flute over organ swells. Rooms add a flavour (the kitchen's marimba
// and pots, the library's music box and hush, the MRI's gradient beeps, the server room's data blips, drips
// underground, Iris's music box, the ethics board's organ).
//
// DREAD (0–1) rises with the act, with night, with going underground, and at the climax. As it rises: the drums
// thin out, a dark detuned pad fades in and closes its filter, a throb arrives (the distant knock of the MRI, on the
// beat, then doubled), the pad sinks an octave and doubles its root, the tempo drags, and the tune drops an octave
// into the murk. Act V underground is the finale (a driving pulse, the MRI as the rhythm section).
// music.scene({ act, mode, room, flags, title }) retargets it; music.glitch() is a stab for the title screen.
import { sfx } from "./sfx.js";

const THEME = [   // 8 bars × 8 eighth notes (MIDI, null = rest)
  [74, null, 69, null, 65, 69, 74, 76], [77, null, 74, null, 70, null, 65, null], [72, null, 69, 65, 69, null, 72, 74], [76, null, null, 74, 72, null, 67, null],
  [74, null, 69, null, 65, 69, 74, 77], [79, null, 77, null, 74, null, 70, null], [67, null, 70, null, 74, null, 70, null], [73, null, 76, null, 69, null, null, null],
];
const ROOTS = [38, 46, 41, 36, 38, 46, 43, 45];                     // D2 Bb2 F2 C2 D2 Bb2 G2 A2
const CHORDS = [[62, 65, 69], [58, 62, 65], [60, 65, 69], [60, 64, 67], [62, 65, 69], [58, 62, 65, 67], [58, 62, 67], [57, 61, 64]];
// A': the theme varied (same chords): bar 1 anticipates bar 2's F, which then ties over; turns and neighbour notes
const THEME_V = [
  [74, 76, 74, 69, 65, null, 69, 77], [null, null, 74, 77, 70, null, 65, 67], [69, null, 72, 69, 65, 67, 69, 72], [76, 74, 72, null, 67, 69, 72, null],
  [77, 76, 74, null, 69, null, 74, 77], [79, null, 77, 79, 74, null, 70, 72], [70, null, 67, null, 70, 74, 79, null], [76, null, 73, null, 69, 71, 73, null],
];
// the counter-melody over A (guide tones, two a bar, with answers at the phrase ends)
const COUNTER_A = [
  [65, null, null, null, 62, null, null, null], [62, null, null, null, 65, null, null, null], [65, null, null, null, 60, null, null, null], [64, null, null, null, 60, 62, 64, null],
  [62, null, null, null, 65, null, null, null], [67, null, null, null, 65, null, null, null], [62, null, null, null, 58, null, null, null], [61, null, null, null, 64, 65, 64, 61],
];
// B, the bridge: Bb F Gm C | Bb Am Gm A (VI III iv VII | VI v iv V), the lift to the relative major and the walk home
const BRIDGE = [
  [65, null, null, 70, 74, null, 77, null], [77, null, null, 76, 72, null, 69, null], [67, null, null, 70, 74, null, 79, null], [79, null, null, 77, 76, null, 72, null],
  [74, null, 77, null, 82, null, null, 81], [81, null, null, 79, 76, null, 72, null], [74, null, null, 72, 70, null, 67, null], [69, null, 73, null, 76, null, 73, null],
];
const BROOTS = [46, 41, 43, 36, 46, 45, 43, 45];                    // Bb2 F2 G2 C2 Bb2 A2 G2 A2
const BCHORDS = [[58, 62, 65], [60, 65, 69], [58, 62, 67], [60, 64, 67], [58, 62, 65], [57, 60, 64], [58, 62, 67], [57, 61, 64]];
const COUNTER_B = [
  [62, null, null, null, 65, null, null, null], [60, null, null, null, 57, null, null, null], [58, null, null, null, 62, null, null, null], [64, null, null, null, 60, null, null, null],
  [62, null, null, null, 65, null, null, null], [64, null, null, null, 60, null, null, null], [62, null, null, null, 58, null, null, null], [61, null, null, null, 64, null, 61, null],
];
// the form, shared by every arrangement (so the harmony never jumps on a room change): 5 × 8 bars
const FORM = ["A", "V", "B", "A", "R"];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12), pc = (m) => ((m % 12) + 12) % 12;
const rnd = (s, k = 0) => (Math.imul(s * 7 + k * 131 + 17, 2654435761) >>> 0) / 4294967296;   // deterministic per step
// Act V underground: the finale arrangement (a driving pulse, the MRI as the rhythm section)
const FINALE = new Set(["tunnels", "antechamber", "chamber", "plant", "tubehub", "crawlspace"]);
const UNDER = new Set(["tunnels", "antechamber", "chamber", "plant", "tubehub", "crawlspace", "freezer", "maze", "server"]);

let C = null, bus = null, B = {}, delay = null, timer = null, step = 0, nextT = 0, buildStart = 0;
let S = null, pend = null, TR = null, cur = { s: 0, tones: new Set() };   // S: the band playing; pend: the next, at the barline
const P = { arr: "day", dread: 0, tempo: 104, target: 104, throb: 0, on: false, climax: false };

function init() {
  const a = sfx.audio && sfx.audio(); if (!a) return false;
  if (C) return true;
  C = a.ctx;
  bus = C.createGain(); bus.gain.value = .5; bus.connect(a.master);
  for (const k of ["mel", "bass", "drum", "pad", "throb", "arp", "ctr"]) { B[k] = C.createGain(); B[k].gain.value = 0; B[k].connect(bus); }
  // the melody's little delay (3/16), and some of the arpeggio and the counter-melody
  delay = C.createDelay(1); const fb = C.createGain(), wet = C.createGain(), lp = C.createBiquadFilter(), cs = C.createGain();
  delay.delayTime.value = .32; fb.gain.value = .32; wet.gain.value = .35; lp.type = "lowpass"; lp.frequency.value = 2400; cs.gain.value = .3;
  delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(wet); wet.connect(bus);
  B.mel.connect(delay); B.arp.connect(delay); B.ctr.connect(cs); cs.connect(delay);
  return true;
}

/* ---------------- instruments ---------------- */
// every pitched note reports itself to the harmony trace (sus: it sounds long enough to have to be a chord tone)
const tr = (m, sus) => { if (TR) TR.push([cur.s, m, !!sus, [...cur.tones]]); };
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
const osc = (type, f) => { const o = C.createOscillator(); o.type = type; o.frequency.value = f; return o; };
function pluck(m, t, v, out, dark = 0) {          // OP-1-ish: a square through a closing filter
  tr(m, false);
  const o = C.createOscillator(), f = C.createBiquadFilter(), g = C.createGain();
  o.type = "square"; o.frequency.value = hz(m); f.type = "lowpass"; f.Q.value = 3;
  f.frequency.setValueAtTime(3200 - 2400 * dark, t); f.frequency.exponentialRampToValueAtTime(500, t + .18);
  env(g, t, .003, v, .22); o.connect(f); f.connect(g); g.connect(out); o.start(t); o.stop(t + .3);
}
function bell(m, t, v, out, short = false) {        // a soft two-operator FM bell (an electric piano in a dark room)
  tr(m, !short);
  const car = C.createOscillator(), mod = C.createOscillator(), mg = C.createGain(), g = C.createGain(), d = short ? .3 : 1.6;
  car.frequency.value = hz(m); mod.frequency.value = hz(m) * 2; mg.gain.setValueAtTime(hz(m) * 1.4, t); mg.gain.exponentialRampToValueAtTime(hz(m) * .05, t + d * .75);
  mod.connect(mg); mg.connect(car.frequency); env(g, t, .006, v, d); car.connect(g); g.connect(out);
  car.start(t); mod.start(t); car.stop(t + d + .2); mod.stop(t + d + .2);
}
function marimba(m, t, v, out, x = {}) {           // a sine bar with its fourth-ish overtone knocked off quickly
  tr(m, false);
  const f = hz(m), a = osc("sine", f), b = osc("sine", f * 3.93), g = C.createGain(), gb = C.createGain();
  env(g, t, .002, v, x.short ? .16 : .42); env(gb, t, .001, v * .3, .05);
  a.connect(g); b.connect(gb); g.connect(out); gb.connect(out); a.start(t); b.start(t); a.stop(t + .5); b.stop(t + .1);
}
function vibes(m, t, v, out, x = {}) {             // sine + a soft fourth partial, with the motor's tremolo
  const d = x.short ? .28 : Math.max(.6, Math.min(1.8, (x.dur || 1.2) * 1.2)); tr(m, !x.short);
  const f = hz(m), a = osc("sine", f), b = osc("sine", f * 4), g = C.createGain(), gb = C.createGain(), tm = C.createGain(), lfo = osc("sine", 5.2), ld = C.createGain();
  env(g, t, .004, v, d); env(gb, t, .002, v * .16, .2); tm.gain.value = .78; ld.gain.value = .22;
  lfo.connect(ld); ld.connect(tm.gain); a.connect(g); b.connect(gb); g.connect(tm); gb.connect(tm); tm.connect(out);
  for (const o of [a, b, lfo]) { o.start(t); o.stop(t + d + .1); }
}
// a Rhodes (tine electric piano): an FM pair at 1:1 whose index starts high and falls (the bark of the tine), a quiet
// high tine ping on the strike, a long warm decay, and the suitcase amp's tremolo
function rhodes(m, t, v, out, x = {}) {
  const hold = x.short ? .2 : Math.max(.4, Math.min(3.2, (x.dur || 1) * 1.15)), rel = x.short ? .3 : .75, d = hold + rel; tr(m, !x.short);
  const f = hz(m), car = osc("sine", f), mod = osc("sine", f), mi = C.createGain(), g = C.createGain();
  const ping = osc("sine", f * 7.02), pg = C.createGain(), tm = C.createGain(), lfo = osc("sine", 4.6), ld = C.createGain(), lp = C.createBiquadFilter();
  const bark = f * (.9 + 1.1 * Math.min(1, v * 6));                  // harder notes bark more (gently: this is a relaxed Rhodes)
  mi.gain.setValueAtTime(bark, t); mi.gain.exponentialRampToValueAtTime(f * .16, t + .4);
  // legato: a soft 12 ms attack, the tone sagging slowly while held, then a gentle release
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(v * .45, t + .012 + hold); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  env(pg, t, .001, v * .035, .05);
  lp.type = "lowpass"; lp.frequency.value = 3200; tm.gain.value = .84; ld.gain.value = .16;
  mod.connect(mi); mi.connect(car.frequency); car.connect(g); ping.connect(pg); g.connect(lp); pg.connect(lp); lp.connect(tm); lfo.connect(ld); ld.connect(tm.gain); tm.connect(out);
  for (const o of [car, mod, lfo]) { o.start(t); o.stop(t + d + .1); } ping.start(t); ping.stop(t + .08);
}
function box(m, t, v, out, x = {}) {               // a music box: a high sine tine with a quick twelfth on the strike
  const f = hz(m + 12), d = x.short ? .14 : .9; tr(m + 12, !x.short);
  const a = osc("sine", f), b = osc("sine", f * 3), g = C.createGain(), gb = C.createGain();
  env(g, t, .002, v, d); env(gb, t, .001, v * .25, .06);
  a.connect(g); b.connect(gb); g.connect(out); gb.connect(out); a.start(t); b.start(t); a.stop(t + d + .05); b.stop(t + .1);
}
function brass(m, t, v, out, x = {}) {             // muted brass: two detuned saws, the filter blooms and closes
  const dur = x.short ? .1 : Math.max(.12, x.dur || .3), f = hz(m), top = 1500 - 700 * (x.dark || 0); tr(m, !x.short && dur > .25);
  const lp = C.createBiquadFilter(), g = C.createGain(); lp.type = "lowpass"; lp.Q.value = 1.5;
  lp.frequency.setValueAtTime(300, t); lp.frequency.linearRampToValueAtTime(top, t + .05); lp.frequency.exponentialRampToValueAtTime(Math.max(380, top * .45), t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .02); g.gain.linearRampToValueAtTime(v * .7, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .08);
  lp.connect(g); g.connect(out);
  for (const dt of [-7, 7]) { const o = osc("sawtooth", f); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + dur + .1); }
}
function organ(notes, t, dur, v, out, att = .01) {  // a soft drawbar organ (8', 4', a little 2 2/3')
  const g = C.createGain(), lp = C.createBiquadFilter(), hold = Math.max(att, dur); lp.type = "lowpass"; lp.frequency.value = 2400;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.setValueAtTime(v, t + hold); g.gain.linearRampToValueAtTime(0, t + hold + .12);
  lp.connect(g); g.connect(out);
  for (const m of notes) { tr(m, dur > .25); for (const [mul, a] of [[1, 1], [2, .4], [3, .12]]) { const o = osc("sine", hz(m) * mul), og = C.createGain(); og.gain.value = a; o.connect(og); og.connect(lp); o.start(t); o.stop(t + hold + .15); } }
}
function flute(m, t, v, out, x = {}) {             // breathy: a triangle with vibrato, a chiff of noise on the attack
  const dur = x.short ? .13 : Math.max(.2, x.dur || .5), f = hz(m), a = x.short ? .02 : .07; tr(m, !x.short);
  const o = osc("triangle", f), lfo = osc("sine", 5), ld = C.createGain(), lp = C.createBiquadFilter(), g = C.createGain();
  ld.gain.value = f * .006; lfo.connect(ld); ld.connect(o.frequency); lp.type = "lowpass"; lp.frequency.value = 2400;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.linearRampToValueAtTime(v * .8, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + .14);
  o.connect(lp); lp.connect(g); g.connect(out); o.start(t); lfo.start(t); o.stop(t + dur + .2); lfo.stop(t + dur + .2);
  noiseHit(t, f * 2, 2, v * .12, .05, out);
}
function bass(m, t, d, v, out) {
  tr(m, true);
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
const shaker = (t, v) => noiseHit(t, 6500, .7, v, .05, B.drum, "highpass");
const brush = (t, v, d = .16) => noiseHit(t, 2800, .5, v, d, B.drum);
const rim = (t, v) => { noiseHit(t, 2300, 8, v, .03, B.drum); wood(t, v * .5, 1700); };
function wood(t, v, f = 1000) {                     // a woodblock: a short knocked sine (percussion, not a note)
  const o = osc("sine", f), g = C.createGain(); o.frequency.exponentialRampToValueAtTime(f * .92, t + .04);
  env(g, t, .001, v, .045); o.connect(g); g.connect(B.drum); o.start(t); o.stop(t + .08);
}
function drip(m, t, v) {                            // a drip underground: a sine that chirps up onto a chord tone
  tr(m, false); const o = osc("sine", hz(m) * .75), g = C.createGain(); o.frequency.exponentialRampToValueAtTime(hz(m), t + .03);
  env(g, t, .001, v, .16); o.connect(g); g.connect(B.arp); o.start(t); o.stop(t + .2);
}
function blip(m, t, v) {                            // the server room: a tiny square data blip
  tr(m, false); const o = osc("square", hz(m)), g = C.createGain(), hp = C.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
  env(g, t, .001, v, .04); o.connect(hp); hp.connect(g); g.connect(B.arp); o.start(t); o.stop(t + .07);
}
// the distant knock of the MRI: a low thud, muffled, with a gradient click on top
function knock(t, v) {
  const o = C.createOscillator(), g = C.createGain(), lp = C.createBiquadFilter();
  o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(38, t + .14); lp.type = "lowpass"; lp.frequency.value = 220;
  env(g, t, .004, v, .22); o.connect(lp); lp.connect(g); g.connect(B.throb); o.start(t); o.stop(t + .3);
  noiseHit(t, 420, 6, v * .25, .05, B.throb);
}
// the finale's engine: a sixteenth-note saw bass through a snapping lowpass (dark, a little nasty)
function pulseBass(m, t, v, open = 0) {
  tr(m, false);
  const o = C.createOscillator(), q = C.createOscillator(), f = C.createBiquadFilter(), g = C.createGain();
  o.type = "sawtooth"; o.frequency.value = hz(m); q.type = "square"; q.frequency.value = hz(m) / 2;
  f.type = "lowpass"; f.Q.value = 7; f.frequency.setValueAtTime(700 + 900 * open, t); f.frequency.exponentialRampToValueAtTime(160, t + .11);
  env(g, t, .002, v, .13); o.connect(f); q.connect(f); f.connect(g); g.connect(B.bass); o.start(t); q.start(t); o.stop(t + .2); q.stop(t + .2);
}
// the scanner's gradients: a short square beep, the sound of an EPI sequence running
function beep(t, v, f0 = 1180) {
  tr(Math.round(69 + 12 * Math.log2(f0 / 440)), false);
  const o = C.createOscillator(), g = C.createGain(), hp = C.createBiquadFilter();
  o.type = "square"; o.frequency.value = f0; hp.type = "highpass"; hp.frequency.value = 700;
  env(g, t, .001, v, .028); o.connect(hp); hp.connect(g); g.connect(B.throb); o.start(t); o.stop(t + .05);
}
// a pad chord for a bar: two detuned saws per note through a lowpass that closes as the dread rises
function pad(notes, t, dur, v, cutoff) {
  const f = C.createBiquadFilter(), g = C.createGain(); f.type = "lowpass"; f.frequency.value = cutoff; f.Q.value = .7;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + Math.min(1.2, dur * .4)); g.gain.setValueAtTime(v, t + dur * .8); g.gain.linearRampToValueAtTime(0, t + dur + .6);
  f.connect(g); g.connect(B.pad);
  for (const m of notes) { tr(m, true); for (const dt of [-8, 7]) { const o = C.createOscillator(); o.type = "sawtooth"; o.frequency.value = hz(m); o.detune.value = dt; o.connect(f); o.start(t); o.stop(t + dur + .7); } }
}
// the lead voices, by name: f, a loudness trim (against the pluck), and where the tune sits for it
const INST = {
  pluck: { f: (m, t, v, o, x) => pluck(m, t, v, o, x.dark), v: 1, oct: 0 },
  bell: { f: (m, t, v, o, x) => bell(m, t, v, o, x.short), v: .9, oct: -12 },
  marimba: { f: marimba, v: 1.25, oct: 0 },
  vibes: { f: vibes, v: .85, oct: 0 },
  box: { f: box, v: .75, oct: -12 },                 // the box sounds an octave up, so this puts the tune where it was
  brass: { f: brass, v: .5, oct: -12 },
  organ: { f: (m, t, v, o, x) => organ([m], t, x.short ? .1 : x.dur || .35, v, o, x.short ? .008 : .03), v: .45, oct: -12 },
  flute: { f: flute, v: .62, oct: 0 },
  rhodes: { f: rhodes, v: 1.05, oct: -12 },          // the tune an octave down, in the electric piano's warm middle
};
// play a tune note: non-chord tones (only ever off the beat) are played short, as passing tones
function voice(name, m, t, v, out, x = {}) {
  const I = INST[name]; if (!x.raw) m += I.oct;
  I.f(m, t, v * I.v, out, { ...x, short: x.short || !cur.tones.has(pc(m)), dark: P.dread });
}
// how many eighths a tune note holds (to the next note; with q, to the next note on a beat)
const near = (m) => { for (const dd of [0, -1, 1, -2, 2, -3, 3]) if (cur.tones.has(pc(m + dd))) return m + dd; return m; };
function hold(arr, bar, k, q) { let n = 1; while (k + n < 8 && (arr[bar][k + n] == null || (q && (k + n) % 2))) n++; return n; }

/* ---------------- the bands ---------------- */
// lead (A), leadV (A'), leadB (bridge), ctr (counter-melody), hand (who takes the tune in the second A's last half),
// q (night: the tune on the beats only), bass / drums / comp patterns, compAll (comp under the tune too), swing,
// angular (octave leaps in the tune), fx (room extras), vel (tune loudness), tempo (at the act's own dread)
const BANDS = {
  // the main menu: the OP-1 tune (square pluck, bouncy bass, a small drum machine, marimba answers)
  title: null,   // set below: the title plays day 1's Rhodes band
  // the game itself opens on a Rhodes (Act I): the tune on electric piano, syncopated Rhodes chords, a soft bass, a lazy beat
  d1: { tempo: 92, lead: "rhodes", leadV: "rhodes", leadB: "flute", ctr: "vibes", hand: "vibes", bass: "two", drums: "soft", comp: "rhodes", compAll: true, swing: .2, build: true },
  // the OP-1 arrives in Act II: the square pluck and its arpeggios, over the bossa
  d2: { tempo: 100, lead: "pluck", leadV: "pluck", leadB: "marimba", ctr: "marimba", hand: "marimba", bass: "bossa", drums: "bossa", comp: "arp", compAll: true },
  d3: { tempo: 97, lead: "brass", leadV: "pluck", leadB: "organ", ctr: "marimba", hand: "marimba", bass: "angular", drums: "broken", comp: "bstab", compAll: true, angular: true, stacc: true },
  d4: { tempo: 96, lead: "vibes", leadV: "brass", leadB: "pluck", ctr: "organ", hand: "brass", bass: "pulse8", drums: "restless", comp: "ostinato", compAll: true },
  d5: { tempo: 92, lead: "brass", leadV: "bell", leadB: "organ", ctr: "brass", hand: "bell", bass: "pulse8", drums: "march", comp: "arp" },
  n1: { night: true, tempo: 74, lead: "box", leadB: "vibes", ctr: "vibes", hand: "vibes", q: true, bass: "long", drums: "clock", comp: "mbox" },
  n2: { night: true, tempo: 72, lead: "vibes", leadB: "flute", ctr: "organ", hand: "flute", q: true, swing: .3, bass: "two", drums: "brush", comp: "sparse" },
  n3: { night: true, tempo: 70, lead: "bell", leadV: "box", leadB: "flute", ctr: "brass", hand: "box", q: true, angular: true, bass: "long", drums: "heart", comp: "sparse" },
  n4: { night: true, tempo: 67, lead: "bell", leadV: "vibes", leadB: "organ", ctr: "brass", hand: "vibes", q: true, bass: "long", drums: "clock", comp: "sparse" },
  n5: { night: true, tempo: 64, lead: "bell", leadV: "box", leadB: "brass", ctr: "organ", hand: "vibes", q: true, bass: "long", drums: "heart", comp: "sparse" },
  morning: { night: true, tempo: 72, lead: "flute", leadV: "vibes", leadB: "flute", ctr: "vibes", hand: "vibes", bass: "two", drums: "hush", comp: "haze", compAll: true },
};
const DRIPS = { fx: ["drips"] };
const ROOMS = {   // flavours: instrument, register, a little extra; never a new key or a new form
  kitchen: (S) => S.night ? { lead: "marimba", fx: ["pots"] } : { lead: "marimba", leadV: "marimba", fx: ["pots"] },
  library: (S) => ({ lead: "box", leadV: "box", drums: S.night ? S.drums : "hush", vel: .85 }),
  mri: () => ({ lead: "bell", fx: ["beeps"] }),
  server: () => ({ leadV: "pluck", fx: ["blips"] }),
  booth: () => ({ lead: "vibes", leadV: "box", drums: "hush", comp: "sparse", compAll: false }),   // the dark booth, if it's ever passed as a room
  iris: () => ({ lead: "box", leadV: "box", ctr: "organ" }),
  office: () => ({ ctr: "organ" }), impactoffice: () => ({ ctr: "organ", hand: "brass" }),
  ethics: () => ({ lead: "organ", drums: "hush" }),
  conference: () => ({ lead: "brass" }), defense: () => ({ lead: "brass", leadB: "organ" }),
  tunnels: () => DRIPS, freezer: () => DRIPS, maze: () => DRIPS, crawlspace: () => DRIPS, tubehub: () => DRIPS, plant: () => DRIPS,
};
BANDS.title = { ...BANDS.d1 };
function band({ act, mode, room, title, arr }) {
  const name = arr === "finale" ? "finale" : title ? "title" : mode === "morning" ? "morning" : (mode === "night" ? "n" : "d") + Math.max(1, Math.min(5, act));
  const base = BANDS[name] || {}, S = { name, arr, ...base, ...(!title && arr !== "finale" && ROOMS[room] ? ROOMS[room](base) : {}) };
  S.key = JSON.stringify(S); return S;
}

/* ---------------- the sequencer ---------------- */
// THE FINALE (Act V, underground): same key, same chords, same tune, but driven. A sixteenth-note bass, the MRI knock
// fused with a four-on-the-floor kick, gradient beeps on the off-sixteenths, a backbeat clap, low pads; the theme on a
// deep bell, alternating with a pulsing arpeggio. Four 8-bar sections: engine only, theme, arpeggio, theme with hats.
// At the climax (hoods off) the tempo tightens, every section runs full and the beeps go to sixteenths.
function finaleStep(s, t) {
  const bar = Math.floor(s / 16) % 8, i = s % 16, hot = P.climax, sec = hot ? 1 + Math.floor(s / 128) % 3 : Math.floor(s / 128) % 4;
  const root = ROOTS[bar], ch = CHORDS[bar];
  cur = { s, tones: new Set([...ch, root].map(pc)) };
  // the engine: root on every sixteenth, the octave on the "and", accents on the beat; the filter opens on bar 8's turnaround
  pulseBass(root + (i % 4 === 2 ? 12 : 0), t, i % 4 === 0 ? .2 : .13, bar === 7 ? (i / 16) : 0);
  // kick + the MRI's knock, on every beat
  if (i % 4 === 0) { kick(t, .55); knock(t, .45); }
  // the scanner's gradients
  // (on the beat, at the climax, the beep takes the chord tone nearest its D so it never rubs against the chord)
  if (hot ? true : i % 2 === 1) beep(t, i % 4 === 3 ? .03 : .02, bar % 4 === 3 && i > 11 ? 1320 : i % 4 === 0 ? hz(near(86)) : 1180);
  // backbeat and hats once the section is up
  if (sec > 0 && (i === 4 || i === 12)) clap(t, .14);
  if ((sec === 3 || hot) && i % 4 === 2) hat(t, .07);
  // pads: a low dark chord a bar (in key: the chord, its root doubled below)
  if (i === 0) pad([...ch.map(m => m - 12), root], t, 60 / P.tempo * 4, .05, sec ? 900 : 600);
  // the theme, on the beat, a deep bell (every on-beat note is a chord tone)
  if ((sec === 1 || sec === 3) && i % 4 === 0) { const m = THEME[bar][i / 2]; if (m != null) bell(m - 12, t, .15, B.mel); }
  // the arpeggio section: chord tones in sixteenths, dark plucks
  if (sec === 2 || (hot && sec === 3)) pluck(ch[i % ch.length] + (i % 8 < 4 ? 0 : 12), t, .07, B.arp, .75);
}
function bassStep(name, i, root, t, spb) {
  const b = (m, len, v) => bass(m, t, spb * len, v, B.bass);
  switch (name) {
    case "bounce": if (i % 4 === 0 || i === 6 || i === 14) b(root + (i === 6 || i === 14 ? 12 : 0), 1.6, .22); break;
    case "bossa": if (i === 0) b(root, 5.5, .22); else if (i === 6) b(root + 7, 1.6, .17); else if (i === 8) b(root + 7, 5.5, .2); else if (i === 14) b(root, 1.6, .15); break;
    case "angular": { const n = { 0: [0, 1.2, .24], 3: [12, .8, .15], 6: [7, 1.2, .18], 10: [0, 1, .2], 11: [12, .8, .13], 14: [19, 1, .13] }[i]; if (n) b(root + n[0], n[1], n[2]); break; }
    case "pulse8": if (i % 2 === 0) b(root + (i % 8 === 4 ? 12 : 0), 1.3, i % 4 === 0 ? .2 : .14); break;
    case "two": if (i === 0) b(root, 7, .17); else if (i === 8) b(root + 7, 7, .13); break;
    case "title": if (i % 4 === 0) b(root, 2.5, .18); break;
    default: if (i === 0) b(root, 15, .16);          // "long": one held root a bar
  }
}
function drumStep(name, i, bar, sec, t) {
  const half = sec === "B", light = sec === "R", full = !half && !light;
  switch (name) {
    case "bounce":
      if (i === 0 || (full && (i === 8 || (i === 10 && bar % 2))) || (half && i === 10 && bar % 2)) kick(t, .4);
      if (i % 4 === 2) hat(t, .07);
      if ((full && i === 12 && bar % 2) || (half && i === 8)) clap(t, .1); break;
    case "bossa":
      if ((bar % 2 ? [4, 10] : [0, 6, 12]).includes(i)) rim(t, .06);
      if (i % 2 === 0) shaker(t, i % 4 === 2 ? .05 : .028);
      if (!light && (i === 0 || i === 8)) kick(t, .3); if (full && i === 6) kick(t, .16); break;
    case "broken":
      if (i === 0 || (!light && (i === 10 || (full && (i === 7 || (i === 14 && bar % 4 === 3)))))) kick(t, .38);
      if ((full && (i === 4 || i === 12)) || (half && i === 8)) clap(t, .1);
      if (full && i === 15 && bar % 2) clap(t, .04);
      if (i === 3 || i === 9 || i === 13) wood(t, .05, i === 9 ? 900 : 1250);
      if (i % 4 === 2 && i !== 6) hat(t, .06); break;
    case "restless":
      if (!light || i % 2 === 0) hat(t, i % 4 === 2 ? .06 : .026);
      if (i === 0 || (!light && (i === 8 || (full && (i === 6 || i === 11))))) kick(t, .36);
      if (!light && i === 12) clap(t, .09);
      if (full && bar % 8 === 7 && i > 12) clap(t, .03 + .02 * (i - 12)); break;
    case "march":
      if (i === 0 || i === 8) kick(t, .32);
      if (!light && (i === 4 || i === 12)) clap(t, .08);
      if (full && bar % 4 === 3 && i >= 13) clap(t, .04);
      if (i % 4 === 0) hat(t, .04); break;
    case "soft":                                            // laid back: kick on 1 and the and-of-3, rim on 2 and 4, quiet hats
      if (i === 0 || (!light && i === 10)) kick(t, .3);
      if (!light && (i === 4 || i === 12)) rim(t, .045);
      if (i % 2 === 0 && !light) hat(t, i % 4 === 2 ? .04 : .018);
      if (full && bar % 4 === 3 && i === 14) rim(t, .025); break;
    case "title":
      if (i === 0) kick(t, .3); if (i % 4 === 2) hat(t, .04); if (i === 12 && bar % 4 === 3) clap(t, .07); break;
    case "clock": if (i % 4 === 0) wood(t, .06, (i / 4) % 2 ? 1150 : 1500); break;   // tick, tock
    case "brush": if (i === 4 || i === 12) brush(t, .09); if (i % 4 === 2) brush(t, .035, .05); if (i === 0) kick(t, .16); break;
    case "heart": if (i === 0 || i === 8) kick(t, .24); if (i === 3 || i === 11) kick(t, .15); break;
    case "hush": if (i % 4 === 2) shaker(t, .03); break;
  }
}
// comping: chord tones only
function compStep(name, s, i, bar, ch, root, t, spb, g) {
  const n = ch.length, d = P.dread;
  switch (name) {
    case "arp": if (i % 2 === 0) pluck(ch[(i / 2) % n] + 12, t, .07 * g, B.arp, d); break;
    case "stab": if (i === 2 || i === 6 || i === 12) organ(ch, t, spb * 1.4, .026 * g, B.arp, .01); break;
    case "bstab": if (i === 3 || i === 11) for (const m of [ch[0], ch[n - 1]]) brass(m, t, .045 * g, B.arp, { short: true, dark: d }); break;
    case "ostinato": pluck(ch[[0, 1, 2, 1][i % 4] % n] + (i % 8 < 4 ? 0 : 12), t, .042 * g, B.arp, .6 + .3 * d); break;
    case "haze": if (i === 0) organ([...ch, root + 12], t, spb * 15, .02 * g, B.arp, 1.2); break;
    case "mbox": if (i % 4 === 0) box(ch[(i / 4) % n] + (i >= 8 ? 12 : 0), t, .07 * g, B.arp); break;
    case "sparse": if (i % 8 === 0) box(ch[(bar * 2 + i / 8) % n], t, .07 * g, B.arp); break;
    case "rhodes": {                                        // chord tones only, voiced in the middle; never on top of the tune
      const hit = { 0: [spb * 6, .05], 6: [spb * 1.2, .032], 10: [spb * 4, .04] }[i];
      if (hit) for (const m of ch) rhodes(m - 12, t, hit[1] * g, B.arp, { dur: hit[0], short: hit[0] < spb * 2 });
      if (i === 0) rhodes(root + 12, t, .03 * g, B.arp, { dur: spb * 8 }); break;
    }
  }
}
function fxStep(fx, s, i, ch, root, t) {
  for (const f of fx || []) {
    if (f === "beeps" && i % 2 === 1) beep(t, i % 4 === 3 ? .014 : .009, hz(root + 48));   // the gradients, on the chord's root
    else if (f === "blips" && i % 2 === 1 && rnd(s) < .5) blip(ch[Math.floor(rnd(s, 1) * ch.length)] + 24, t, .022);
    else if (f === "drips" && i % 2 === 0 && rnd(s, 2) < .07) drip(ch[Math.floor(rnd(s, 3) * ch.length)] + 24, t, .06);
    else if (f === "pots" && (i === 3 || i === 11 || (i === 14 && bar16(s) % 2))) wood(t, .04, i === 3 ? 760 : 980);
  }
}
const bar16 = (s) => Math.floor(s / 16);
function scheduleStep(s, t) {
  const i = s % 16;
  if (i === 0 && pend) { if (!(S && S.build && pend.build)) buildStart = s; S = pend; pend = null; P.arr = S.arr; }     // a new band comes in on the barline (a build carries on across title → day 1)
  if (P.arr === "finale") return finaleStep(s, t);
  const bar = bar16(s) % 8, slot = Math.floor(s / 128) % FORM.length, sec = FORM[slot], d = P.dread, spb = 60 / P.tempo / 4;
  const br = sec === "B", ch = (br ? BCHORDS : CHORDS)[bar], root = (br ? BROOTS : ROOTS)[bar];
  cur = { s, tones: new Set([...ch, root].map(pc)) };
  const tt = i % 4 === 2 && S.swing ? t + spb * S.swing : t, k = i >> 1, drop = d > .55 ? -12 : 0, vel = .16 * (S.vel || 1);
  // the tune (A, A', the bridge; the second A hands its last four bars to another voice; R breathes)
  if (i % 2 === 0 && sec !== "R") {
    let arr = THEME, who = S.lead, q = S.q;
    if (sec === "V") { arr = THEME_V; who = S.leadV || S.lead; q = false; }
    else if (br) { arr = BRIDGE; who = S.leadB || S.lead; }
    else if (slot === 3 && bar >= 4) who = S.hand || S.lead;
    let m = arr[bar][k];
    if (m != null && (!q || k % 2 === 0)) {
      if (S.angular && (bar + k) % 3 === 1) m += m >= 72 ? -12 : 12;   // angular: an octave leap, same note
      const len = S.stacc ? 1.5 : Math.min(8, hold(arr, bar, k, q) * 2) * .9;
      voice(who, m + drop, tt, vel, B.mel, { dur: spb * len });
    }
  }
  // the counter-melody: through A' and the bridge, and answering at the ends of the first A's phrases
  const L = S.build ? Math.floor((s - buildStart) / 128) : 9;   // build layers: 0 Rhodes alone, 1 + bass, 2 + drums and counter-melody
  if (S.ctr && L >= 2 && i % 2 === 0) {
    const arr = sec === "V" ? COUNTER_A : br ? COUNTER_B : sec === "A" && slot === 0 && bar % 4 === 3 && k >= 4 ? COUNTER_A : null, m = arr && arr[bar][k];
    if (m != null) voice(S.ctr, m, tt, S.night ? .1 : .085, B.ctr, { raw: true, dur: spb * Math.min(8, hold(arr, bar, k) * 2) });
  }
  // comping: the breath's arpeggio, or (compAll) under everything, quieter
  if (S.comp && (sec === "R" || S.compAll)) compStep(S.comp, s, i, bar, ch, root, tt, spb, sec === "R" ? 1 : .6);
  if (L >= 1) bassStep(S.bass, i, root, tt, spb);
  if (L >= 2) drumStep(S.drums, i, bar, sec, tt);
  fxStep(S.fx, s, i, ch, root, tt);
  // pad: one chord a bar; with real dread, the root doubled inside it and, later, the whole chord an octave down (dark, still in key)
  if (i === 0 && (S.night || d > .25)) {
    const c = ch.map(m => m - 12), extra = d > .6 ? [root + 12] : [], clu = d > .82 ? c.map(m => m - 12) : [];
    pad([...c, ...extra, ...clu], t, spb * 16, .045, 300 + 1700 * (1 - d));
  }
  // the throb: the MRI, two floors away, on the beat; doubled when it's close
  if (P.throb > 0 && i % 4 === 0) { knock(t, .5); if (d > .7) knock(t + spb * 1.5, .32); }
}
function tick() {
  if (!C || C.state !== "running") return;
  while (nextT < C.currentTime + .14) {
    scheduleStep(step, nextT); nextT += 60 / P.tempo / 4; step++;
    P.tempo += (P.target - P.tempo) * (P.arr === "finale" ? .08 : .035);   // glide, never lurch (about two bars)
  }
}

/* ---------------- scenes ---------------- */
function gains() {
  const d = P.dread, T = pend || S || {}, night = !!T.night;
  if (T.arr === "finale") return { mel: .7, arp: .6, bass: .72, drum: .7, pad: .7, throb: .6, ctr: .6 };   // ~3 dB over the rest of the score
  return { mel: night ? .8 : .9 - .3 * d, arp: .7, ctr: night ? .8 : .75 - .2 * d, bass: night ? .7 : .9, drum: night ? .35 : Math.max(0, .85 - 1.1 * d),
    pad: night ? .5 + .6 * d : Math.max(0, (d - .25) * 1.6), throb: P.throb };
}
function mix() {
  if (!C) return;
  const now = C.currentTime, G = gains();
  for (const k in G) B[k].gain.setTargetAtTime(G[k], now, (pend || S || {}).arr === "finale" ? .5 : 1.2);
}
// render a scene offline (for previews and tests): returns the AudioBuffer. from: the step to start at (16 a bar, 128 a section)
async function renderOffline(scene, secs = 30, rate = 22050, from = 0) {
  const O = new OfflineAudioContext(1, Math.round(secs * rate), rate), saved = { C, bus, B, delay, P: { ...P }, step, nextT, S, pend, cur };
  const nb = O.createBuffer(1, rate * 2, rate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const master = O.createGain(); master.gain.value = .7; const comp = O.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; master.connect(comp); comp.connect(O.destination);
  const realAudio = sfx.audio; sfx.audio = () => ({ ctx: O, master, noise: nb });
  C = null; B = {}; init(); S = null; pend = null; P.on = false; music.scene(scene);
  for (const k in B) B[k].gain.cancelScheduledValues(0);
  { const G = gains(); for (const k in G) B[k].gain.value = G[k]; }
  step = from; nextT = .05; while (nextT < secs) { scheduleStep(step, nextT); nextT += 60 / P.tempo / 4; step++; }
  const buf = await O.startRendering();
  sfx.audio = realAudio; ({ C, bus, B, delay, step, nextT, S, pend, cur } = saved); Object.assign(P, saved.P);
  return buf;
}
// the harmony trace (tests): run a scene's sequencer silently for some steps; every pitched note comes back as
// [step, midi, sustained, chord pitch classes]
function trace(scene, steps = 640, from = 0) {
  const fake = new Proxy(function () {}, { get: (o, k) => (k === Symbol.toPrimitive ? () => 0 : fake), apply: () => fake, set: () => true });
  const saved = { C, B, S, pend, cur, P: { ...P } }, realAudio = sfx.audio;
  C = fake; B = new Proxy({}, { get: () => fake }); sfx.audio = () => ({ ctx: fake, master: fake, noise: fake });
  S = null; pend = null; P.on = false; music.scene(scene); TR = [];
  try { for (let s = from; s < from + steps; s++) scheduleStep(s, 0); return { notes: TR, band: S.name, key: S.key, tempo: P.target }; }
  finally { TR = null; sfx.audio = realAudio; ({ C, B, S, pend, cur } = saved); Object.assign(P, saved.P); }
}
export const music = {
  renderOffline, trace,
  start() { if (!init() || P.on) return; P.on = true; if (pend) { S = pend; pend = null; P.arr = S.arr; } buildStart = step; P.tempo = P.target; nextT = C.currentTime + .1; timer = setInterval(tick, 25); mix(); },
  // where we are → band, dread, tempo, throb. The same scene twice changes nothing; a new band waits for the barline.
  scene({ act = 1, mode = "day", room = "", flags = {}, title = false } = {}) {
    let d = { 1: 0, 2: .12, 3: .3, 4: .48, 5: .62 }[act] || 0, arr = mode === "day" ? "day" : mode === "morning" ? "morning" : "night";
    if (title) { d = .32; arr = "day"; }
    if (mode === "night") d += .18;
    if (mode === "morning") d = Math.max(d, .45);
    const extra = (UNDER.has(room) ? .22 : 0) + (room === "mri" ? .1 : 0);
    d += extra;
    if (flags.climax) d = 1;
    d = Math.max(0, Math.min(1, d));
    if (act === 5 && mode === "night" && FINALE.has(room) && !title) arr = "finale";
    P.dread = d; P.climax = !!flags.climax;
    const nb = band({ act, mode, room, title, arr });
    if (!P.on || !S) { S = nb; pend = null; P.arr = arr; }
    else if (nb.key === S.key) pend = null; else if (!pend || pend.key !== nb.key) pend = nb;
    // the tempo: the band's own, dragged a little by the room's extra dread (so neighbouring rooms differ by a few bpm at most)
    P.target = arr === "finale" ? (P.climax ? 128 : 120) : nb.tempo - (nb.night ? 10 : 18) * extra;
    if (!P.on) P.tempo = P.target;
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
  // fade the score out (and back): for moments that need the room silent, like the coda's quote
  hush(on = true, sec = 1.4) { if (!C || !bus) return; const t = C.currentTime; bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t); bus.gain.linearRampToValueAtTime(on ? 0 : .5, t + sec); },
  get state() { return { ...P, band: S && S.name, lead: S && S.lead, fx: S && S.fx, pending: pend && pend.name, step }; },
};
window.MUSIC = music;
