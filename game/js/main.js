// GAIN CONTROL — engine. Rooms draw themselves from state; the act files (story/actN.js) decide what everything means.
import { seg, segW, chip, ICON } from "./gfx.js";
import * as FIG from "./figures.js";
import { PORTRAIT } from "./portraits.js";
import * as A1 from "./story/act1.js";
import * as A2 from "./story/act2.js";
import * as A3 from "./story/act3.js";
import * as A4 from "./story/act4.js";
import * as A5 from "./story/act5.js";
import { PORTRAITS_4 } from "./cast/act4.js";
import { PORTRAITS_5A } from "./cast/act5a.js";
import { irisFigure } from "./cast/act5b.js";
import { coda } from "./story/coda.js";
import { credits } from "./story/aftermath.js";
import { PORTRAITS_A } from "./cast/act3a.js";
import { PORTRAITS_B } from "./cast/act3b.js";
import { keypad } from "./minigames/keypad.js";
import { fogNeuro } from "./minigames/fogneuro.js";
import { sfx } from "./sfx.js";
import * as FULL from "./fullscreen.js";
import { installNative } from "./native.js";
import { titleArt, titleGlitch, titleExit } from "./title.js";
import { installGuide } from "./guide.js";
import { installNudge } from "./nudge.js";
import { music } from "./music.js";
import { decor, current as holidaysNow } from "./holidays.js";
import { opt, onChange as onOptions, activeCheats, cheatOn } from "./options.js";
import { installMenu } from "./menu.js";
import { remark } from "./remarks.js";
import { fxLayer, confetti, installWhimsy } from "./whimsy.js";
import { applyOverrides, rewriteSay, jumpFromHash } from "./tools/overrides.js";
import seminar from "./rooms/seminar.js";
import hall from "./rooms/hallway.js";
import lab from "./rooms/lab.js";
import mri from "./rooms/mri.js";
import office from "./rooms/office.js";
import ethics from "./rooms/ethics.js";
import impact from "./rooms/impact.js";
import kitchen from "./rooms/kitchen.js";
import server from "./rooms/server.js";
import tunnels from "./rooms/tunnels.js";
import conference from "./rooms/conference.js";
import iris from "./rooms/iris.js";
import library from "./rooms/library.js";
import impactoffice from "./rooms/impactoffice.js";
import freezer from "./rooms/freezer.js";
import maze from "./rooms/maze.js";
import defense from "./rooms/defense.js";
import antechamber from "./rooms/antechamber.js";
import chamber from "./rooms/chamber.js";
import plant from "./rooms/plant.js";
import tubehub from "./rooms/tubehub.js";
import crawlspace from "./rooms/crawlspace.js";

const ROOMS = { seminar, hall, lab, mri, office, ethics, impact, kitchen, server, tunnels, conference, iris,
  library, impactoffice, freezer, maze, defense, antechamber, chamber, plant, tubehub, crawlspace };
Object.assign(PORTRAIT, PORTRAITS_A, PORTRAITS_B, PORTRAITS_4, PORTRAITS_5A);
const ACTS = { 1: A1, 2: A2, 3: A3, 4: A4, 5: A5 };
const ITEMS = A1.ITEMS;                                   // shared; later acts add to it
const CONVOS = Object.assign({}, A1.CONVOS, A2.CONVOS, A3.CONVOS, A4.CONVOS, A5.CONVOS);
const AUD = FIG.AUD;
const $ = (s, r = document) => r.querySelector(s);
const svg = $("#game"), frame = $("#frame"), hover = $("#hover"), msg = $("#msg");

/* ================================================================ *
 *  STATE
 * ================================================================ */
const G = {
  act: 1, mode: "day", char: "nell", room: "seminar", flags: {},
  inv: { nell: [...A1.START_INV.day], gus: [...A1.START_INV.night], morris: [] },
  chars: {},                                               // inactive characters: { morris: { room, x, y, dir } }
  cast: ["nell"],                                          // who the player can switch between right now
  score: 0, scored: new Set(), min: 16 * 60 + 7, bodies: 0, status: "", statusT: 0,
  busy: false, chooser: null, using: null, extras: [],
  actor: { x: 320, y: 280, dir: 1, tx: 320, ty: 280, walking: false, step: 0, cb: null },
  get clock() { const h = Math.floor(this.min / 60) % 24, m = this.min % 60; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); },
};
const R = () => ROOMS[G.room];
// the inventory lives between the HUD's dividers (x 152 and 276): slots shrink to fit, and past six items it takes two rows
function invPos(i, n) {
  const L = 158, W = 112, rows = n > 6 ? 2 : 1, per = Math.ceil(n / rows), r = Math.floor(i / per), c = i % per;
  const slot = Math.min(30, W / per), sc = Math.min(1, slot / 29, rows > 1 ? .62 : 1);
  const used = slot * per, x0 = L + (W - used) / 2;
  return { x: x0 + slot * (c + .5), y: rows > 1 ? 316 + r * 22 : 327, sc };
}
const ACT = () => ACTS[G.act];
const HS = () => ACT().HS;
const KEY = () => (G.char === "morris" ? "morris" : G.mode);          // which version of a hotspot applies
const DAYNAMES = { 1: "MON", 2: "TUE", 3: "WED", 4: "THU", 5: "FRI", 6: "SAT" };
const FIGURE = { nell: () => (G.act === 5 && G.flags && G.flags.robeOn ? FIG.nellRobed() : FIG.nellFigure()), gus: () => FIG.gusFigure(), morris: () => (FIG.morrisFigure ? FIG.morrisFigure() : FIG.nellFigure()), iris: () => irisFigure() };
const CHIP = { nell: ["NELL", "fG"], gus: ["GUS", "fB"], morris: ["MORRIS", "fK"], iris: ["IRIS", "fV"] };

let checkpoint = null;
const SAVE_KEYS = ["act", "mode", "char", "room", "flags", "inv", "chars", "cast", "score", "min", "bodies"];
function snapshot() {
  const o = {}; SAVE_KEYS.forEach(k => o[k] = G[k]);
  checkpoint = JSON.stringify({ ...o, scored: [...G.scored], actor: { x: G.actor.x, y: G.actor.y, dir: G.actor.dir } });
}
function restore() {
  const s = JSON.parse(checkpoint);
  SAVE_KEYS.forEach(k => G[k] = s[k]); G.scored = new Set(s.scored); G.using = null; G.status = "";
  frame.classList.toggle("night", G.mode === "night");
  sfx.play("revise");
  loadRoom(G.room, null, s.actor);
}

/* ================================================================ *
 *  RENDERING
 * ================================================================ */
function idleFigures() {   // the other playable character, if they're standing in this room
  return Object.entries(G.chars).filter(([c, p]) => c !== G.char && p.room === G.room && G.cast.includes(c)).map(([c, p]) => {
    const s = R().pp.kAtY(p.y) * AUD;
    // two characters who came in through the same door would stand inside each other: the idle one steps aside (and stays there)
    const taken = [G.actor, ...Object.entries(G.chars).filter(([o, q]) => o !== c && o !== G.char && q.room === G.room).map(([, q]) => q)];
    for (let n = 0; n < 3 && taken.some(q => Math.abs(p.x - q.x) < 70 * s && Math.abs(p.y - q.y) < 30); n++) p.x += (p.x < 320 ? 1 : -1) * 80 * s;
    return { depth: p.y, svg: `<g data-pose="0" class="idle fp0" transform="translate(${p.x},${p.y}) scale(${p.dir * s},${s}) translate(-160,-187)">${FIGURE[c]()}</g>` };
  });
}
function build() {
  const d = R().draw(G);
  // depth order, back to front: render() slots the walker in front of everything shallower than her feet, which only
  // works if the list is sorted (rooms list their things in drawing order, and the idle character comes last)
  const sorts = [...d.sortables.filter(o => o.svg), ...idleFigures()].map((o, i) => [o, i]).sort((a, b) => (a[0].depth - b[0].depth) || (a[1] - b[1])).map(x => x[0]);
  svg.innerHTML = `<g id="roomBack">${d.back}</g>${decor(R(), G)}<g id="sortables">
    ${sorts.map(o => `<g data-depth="${o.depth}">${o.svg}</g>`).join("")}
    <g data-depth="actor" id="actorWrap"><g id="actor" data-pose="0"></g></g></g><g id="extras"></g><g id="fx" pointer-events="none">${fxLayer(G)}</g><g id="hud"></g><g id="chooser"></g>`;
  $("#actor").innerHTML = FIGURE[G.char]();
  render(); hud(); drawExtras();
}
function entryPos(entry) {
  if (entry === "vent" && R().stand.vent) { const [x, y] = R().stand.vent; return [x, y, 1]; }
  return R().entries[entry] || Object.values(R().entries)[0];
}
// the score follows the drama: act, day or night, where we are, and the climax
let musicKey = "", onTitle = false;
function musicScene(force) {
  const k = onTitle ? "title" : `${G.act}/${G.mode}/${G.room}/${G.flags && G.flags.climax ? 1 : 0}`;
  if (!force && k === musicKey) return; musicKey = k;
  music.scene(onTitle ? { title: true } : { act: G.act, mode: G.mode, room: G.room, flags: G.flags || {} });
}
// THE SWIPE between rooms: the old room is pushed off one side while the new one comes in from the other, in ten
// fixed steps (poses, not tweens), with a lit seam and speed dashes at the join. The new room comes in from the
// side you walked out of. The HUD doesn't move.
let wipeT = null;
function swipe(dir) {
  const W = $("#wipe"); if (!W) return;
  const old = ["#roomBack", "#game > .decor", "#sortables", "#extras", "#fx"].map(q => svg.querySelector(q)).filter(Boolean).map(e => e.outerHTML).join("")
    .replace(/ id="[^"]*"/g, "").replace(/ data-hs="[^"]*"/g, "");
  return () => {   // call after the new room is built
    clearInterval(wipeT);
    const live = ["#roomBack", "#game > .decor", "#sortables", "#extras", "#fx"].map(q => svg.querySelector(q)).filter(Boolean);
    const N = 10; let k = 0;
    const frameAt = () => {
      const p = k / N, xo = dir * 640 * p, xn = -dir * 640 * (1 - p), seam = dir > 0 ? 640 * p : 640 * (1 - p);
      live.forEach(e => e.setAttribute("transform", k < N ? `translate(${xn.toFixed(1)},0)` : ""));
      W.innerHTML = k < N ? `<defs><clipPath id="wipeclip"><rect x="0" y="0" width="640" height="291"/></clipPath></defs>
        <g clip-path="url(#wipeclip)"><rect x="${(xo).toFixed(1)}" y="0" width="640" height="291" fill="#000"/><g transform="translate(${xo.toFixed(1)},0)">${old}</g>
        <path class="sW" d="M${seam.toFixed(1)},0 L${seam.toFixed(1)},291"/>
        ${[40, 96, 150, 205, 252].map((y, i) => `<path class="hl sW" d="M${(seam - dir * (10 + (i % 2) * 8)).toFixed(1)},${y} L${(seam - dir * (34 + (i % 3) * 10)).toFixed(1)},${y}"/>`).join("")}</g>` : "";
      if (k++ >= N) clearInterval(wipeT);
    };
    frameAt(); wipeT = setInterval(frameAt, 40);
  };
}
function loadRoom(id, entry, pos) {
  const moving = G.room && G.room !== id && entry && entry !== "start";
  const finishSwipe = moving ? swipe(G.actor && G.actor.x < 320 ? 1 : -1) : null;
  if (G.room !== id && entry && entry !== "start") sfx.play(entry === "vent" ? "ratstep" : "door");
  if (G.room !== id) G.visit = (G.visit || 0) + 1;   // room entries (the kitchen's regulars come and go per visit)
  G.room = id; G.chooser = null;
  sfx.ambience(id, G.mode); musicScene();
  const a = G.actor, e = pos ? [pos.x, pos.y, pos.dir] : entryPos(entry);
  Object.assign(a, { x: e[0], y: e[1], dir: e[2], tx: e[0], ty: e[1], walking: false, cb: null });
  build();
  if (finishSwipe) finishSwipe();
  if (moving) pendingRemark = true;
}
// someone notices the decorations, or the codes (js/remarks.js): a moment after you come in, if nothing else is happening
let pendingRemark = false;
function maybeRemark() {
  // "codes": now and then someone lets one slip (the menu promises they're around, if you listen)
  const topics = [...activeCheats(), ...(opt("holidays") ? (h => [...h.on, ...(h.lights ? ["xmaslights"] : [])])(holidaysNow()) : []), ...(Math.random() < .35 ? ["codes"] : [])]; if (!topics.length) return;
  const room = G.room;
  // never mid-walk: a remark waits for the character to stop (and gives up if they leave or something else starts)
  const t0 = Date.now(), tryNow = () => {
    if (G.room !== room || G.busy || G.chooser || G.using || onTitle || $("#panel").innerHTML) return;
    if (G.actor.walking) { if (Date.now() - t0 < 8000) setTimeout(tryNow, 300); return; }
    const present = [...new Set([...svg.querySelectorAll("#sortables [data-hs], #roomBack [data-hs]")].map(e => e.dataset.hs))];
    const line = remark({ G, topics, present, room }); if (line) say(line);
  };
  setTimeout(tryNow, 1400);
}
const refresh = () => build();

function render() {
  const a = G.actor, el = $("#actor"), wrap = $("#actorWrap"), sort = $("#sortables"); if (!el) return;
  const s = R().pp.kAtY(a.y) * AUD;
  el.setAttribute("transform", `translate(${a.x.toFixed(1)},${a.y.toFixed(1)}) scale(${(a.dir * s).toFixed(3)},${s.toFixed(3)}) translate(-160,-187)`);
  el.setAttribute("data-pose", a.walking ? (a.step % 2 ? 2 : 1) : 0);
  const after = [...sort.children].find(c => c !== wrap && parseFloat(c.dataset.depth) > a.y);
  if (wrap.nextSibling !== after) sort.insertBefore(wrap, after || null);
}
// scripted walkers (the robed figures), stepped by the act: depth-sorted with everyone else (they used to be drawn over
// the whole room, so someone standing in front of the procession was covered by it), each on one pose (fpN)
function drawExtras() {
  const sort = $("#sortables"); if (!sort) return;
  sort.querySelectorAll(":scope > .xtra").forEach(e => e.remove());
  for (const x of G.extras) {
    const s = R().pp.kAtY(x.y) * AUD, g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "xtra"); g.setAttribute("data-depth", x.y);
    g.innerHTML = `<g class="fp${x.pose | 0}" transform="translate(${x.x},${x.y}) scale(${x.dir * s},${s}) translate(-160,-187)">${x.fig()}</g>`;
    const before = [...sort.children].find(c => c.id !== "actorWrap" && parseFloat(c.dataset.depth) > x.y);
    sort.insertBefore(g, before || null);
  }
  render();
}

function hud() { musicScene();
  const night = G.mode === "night", h = $("#hud"); if (!h) return;
  let s = `<rect x="0" y="291" width="640" height="69" fill="#000"/><path class="hl sD" d="M0,292 L640,292 M152,302 L152,350 M276,302 L276,350 M510,302 L510,350"/>`;
  // the cast: the active character is a solid chip; the others are outlined and clickable
  let cx = 14;
  for (const c of G.cast) {
    const [nm, f] = CHIP[c], w = segW(nm, 6.5) + 6.5 * .9 + 2;
    s += c === G.char ? chip(nm, cx, 300, 6.5, f)
      : `<g data-char="${c}" class="charchip" style="cursor:pointer"><rect class="hl sW" fill="#000" x="${cx - 1}" y="${298.5}" width="${w}" height="${6.5 * 1.7 + 3}"/>${seg(nm, cx + 2, 301, 6.5, "s" + f.slice(1), .9)}
          <rect x="${cx - 6}" y="292" width="${w + 10}" height="${6.5 * 1.7 + 14}" fill="transparent"/></g>`;
    cx += w + 6;
  }
  if (G.using) {
    const t = "USE " + ITEMS[G.using].name.toUpperCase() + " ON";
    const hh = segW(t, 4.6) + 4 > 132 ? 3.6 : 4.6;
    s += chip(t, 14, 318, hh, "fA") + seg("RIGHT-CLICK TO CANCEL", 14, 334, 3.6, "sM", .7);
  } else if (G.cast.length > 1) {
    s += seg("CLICK A NAME", 14, 320, 4.2, "sW", .8) + seg("SWITCH", 92, 320, 4.2, "sM", .8);
    s += seg("CLICK THINGS", 14, 331, 4.2, "sW", .8) + seg("CHOOSE", 92, 331, 4.2, "sM", .8);
  } else {
    s += seg("CLICK FLOOR", 14, 320, 4.2, "sW", .8) + seg("WALK", 92, 320, 4.2, "sM", .8);
    s += seg("CLICK THINGS", 14, 331, 4.2, "sW", .8) + seg("CHOOSE", 92, 331, 4.2, "sM", .8);
  }
  s += seg("INVENTORY", 164, 300, 4.2, "sM", .8);
  const inv = G.inv[G.char] || [];
  if (!inv.length && G.char === "morris") s += seg("CHEEKS FULL OF PEPPERONI", 164, 324, 3.8, "sM", .8);
  inv.forEach((id, i) => { const { x, y, sc } = invPos(i, inv.length), w = 26 * sc, h = 30 * sc;
    s += `<g data-item="${id}" style="cursor:pointer">${G.using === id ? `<rect class="hl sA" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}"/>` : ""}<g transform="translate(${x},${y}) scale(${sc}) translate(${-x},${-y})">${ITEMS[id].g(x, y)}</g><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" fill="transparent"/></g>`; });
  const day = DAYNAMES[G.mode === "morning" && G.act < 5 ? G.act + 1 : G.act];   // a morning is the next act's day, except Act V, which opens on one
  s += seg("DAY", 290, 300, 4.2, night ? "sG" : "sB", .8) + seg(day, 290, 308, 20, night ? "sG" : "sB", 1.4);
  s += seg("TIME", 336, 300, 4.2, "sW", .8) + seg(G.clock, 336, 308, 20, "sW", 1.4);
  s += seg("H-INDEX", 410, 300, 4.2, "sA", .8) + seg(String(G.score).padStart(2, "0"), 410, 308, 20, "sA", 1.4) + seg("/" + (ACT().MAXSCORE || 50), 432, 322, 7, "sM", 1);
  s += seg("BODIES", 462, 300, 4.2, "sR", .8) + seg(String(G.bodies).padStart(2, "0"), 462, 308, 20, "sR", 1.4);
  s += chip(G.status || R().name, 522, 300, 5.5, G.status === "RECORDING" ? "fR" : night ? "fG" : "fB");
  s += seg(ACT().TITLE[0], 522, 324, 4.2, "sM", .8) + seg(ACT().TITLE[1], 522, 333, 7, "sW", 1.1);
  { const ow = segW("OPTIONS", 4.6) + 4.6 * .9;
    s += `<g data-options style="cursor:pointer">${chip("OPTIONS", 522, 342.5, 4.6, "fW")}${seg("O", 522 + ow + 4, 345.5, 3.6, "sM", .7)}<rect x="518" y="338" width="${ow + 14}" height="17" fill="transparent"/></g>`;
    s += `<g data-mute style="cursor:pointer">${seg(sfx.muted ? "MUTED" : "SOUND", 522 + ow + 16, 345.5, 3.6, sfx.muted ? "sD" : "sM", .7)}<rect x="${522 + ow + 12}" y="341" width="28" height="13" fill="transparent"/></g>`;
    s += FULL.hudChip(522 + ow + 48, 345.5); }
  h.innerHTML = s;
}

/* ================================================================ *
 *  TEXT: narration, conversations, sound
 * ================================================================ */
let actx;
function blip(fs = [880, 1320]) { sfx.blip(fs); }
function addScore(key, n) { if (!key || G.scored.has(key)) return; G.scored.add(key); G.score += n; hud(); sfx.play("score"); confetti(svg); }
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");

// a box that closes on pointerdown must also eat the click that follows it, or the room acts on that click (walks Nell
// there, opens a hotspot's verbs) the moment the game stops being busy
function swallowNextClick() {
  const eat = (e) => { e.stopPropagation(); e.preventDefault(); off(); };
  const off = () => { frame.removeEventListener("click", eat, true); clearTimeout(tm); };
  const tm = setTimeout(off, 600);
  frame.addEventListener("click", eat, true);
}
// THE ONE WAY TO CONTINUE: a click anywhere, or Enter, or Space. advanceKey(fn) listens for the keys until it's removed.
const isAdvance = (e) => (e.key === "Enter" || e.key === " ") && !(e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName));
function advanceKey(fn) { const k = (e) => { if (!isAdvance(e)) return; e.preventDefault(); e.stopPropagation(); fn(e); }; window.addEventListener("keydown", k, true); return () => window.removeEventListener("keydown", k, true); }
// the "continue" mark drawn on SVG screens (cards, clue close-ups), matching the text boxes' CLICK ▸
const moreMark = (x = 600, y = 342) => `<g class="moremark">${seg("CLICK", x - 34, y - 3, 4.4, "sM", .7)}<path class="fM" d="M${x - 6},${y - 3.5} L${x},${y} L${x - 6},${y + 3.5} Z"/></g>`;
function typeInto(el, html, speed, onTick) {
  return new Promise(resolve => {
    let i = 0, done = false; const tokens = html.match(/<[^>]+>|&[a-z]+;|[\s\S]/g) || [];
    el.innerHTML = "";
    const timer = setInterval(() => { if (i >= tokens.length) { finish(); return; } el.innerHTML += tokens[i++]; onTick && onTick(true); }, speed);
    function finish() { clearInterval(timer); el.innerHTML = html; done = true; onTick && onTick(false); }
    function click(e) { e.stopPropagation(); e.preventDefault(); if (!done) { finish(); return; } frame.removeEventListener("pointerdown", click, true); offKey(); if (e.type === "pointerdown") swallowNextClick(); resolve(); }
    frame.addEventListener("pointerdown", click, true);
    const offKey = advanceKey(click);
  });
}
// speaker colors for quoted one-liners ("WHO|text")
const SPEAKER = [["MORRIS", "K"], ["PRESTON", "R"], ["BRETT", "B"], ["THE OLD WOMAN", "V"], ["GUS", "B"], ["NELL", "G"], ["TESS", "A"], ["PENNY", "B"],
  ["ETHEL", "V"], ["CODY", "R"], ["DET", "W"], ["SMALL", "W"], ["PROF. ADLINE", "W"],
  ["THE CORRESPONDING AUTHOR", "R"], ["A SIXTH-YEAR", "A"], ["A POSTDOC", "W"], ["A FIRST-YEAR", "K"], ["A HOOD", "V"], ["ANOTHER HOOD", "V"], ["A THIRD HOOD", "V"], ["A YOUNGER HOOD", "A"], ["THE REAL RECORD", "A"],
  ["IMPACT", PORTRAITS_4.impact.chip.slice(1)], ["REX", PORTRAITS_B.rex.chip.slice(1)], ["DANA", PORTRAITS_B.dana.chip.slice(1)], ["QUORUM", PORTRAITS_A.quorum.chip.slice(1)], ["IRIS", "V"]];
const colorOf = (who) => (SPEAKER.find(([k]) => who.startsWith(k)) || [0, "A"])[1];
// a response may hold several paragraphs, each optionally "WHO|…": each speaker gets their own box
async function say(text) {
  if (!text) return;
  text = rewriteSay(text);
  const chunks = [];
  for (const para of String(text).split("\n\n")) {
    const m = para.match(/^([A-Z][A-Z0-9 .,'()\-]*)\|([\s\S]*)$/), who = m ? m[1] : "", body = m ? m[2] : para;
    const last = chunks[chunks.length - 1];
    if (last && last.who === who && !m) last.body += "\n\n" + body; else chunks.push({ who, body });
  }
  for (const c of chunks) await sayOne(c.who, c.body);
}
async function sayOne(who, body) {
  G.busy = true; hover.classList.remove("show");
  const c = who ? colorOf(who) : "W";
  msg.innerHTML = `${who ? `<span class="who" style="background:var(--${c})">${esc(who)}</span><br>` : ""}<span class="t" style="color:var(--${c})"></span><span class="more">CLICK ▸</span>`;
  msg.classList.add("show");
  await typeInto($(".t", msg), esc(body), G.mode === "night" ? 24 : 14, (on) => { if (on) sfx.voice(who || "NARRATOR"); });
  msg.classList.remove("show"); G.busy = false;
}

const convo = $("#convo"), dlg = $("#dlg"), PF = { L: $(".pf.left"), R: $(".pf.right") };
let blinkTimers = [];
function mount(side, id) {
  const p = PORTRAIT[id] || PORTRAIT.nell;
  PF[side].querySelector(".pv").innerHTML = `<svg class="t pt" viewBox="${p.vb}" preserveAspectRatio="xMidYMid meet">${p.svg(G)}</svg>`;
  const nm = PF[side].querySelector(".name"); nm.textContent = p.name; nm.style.background = `var(--${p.chip.slice(1)})`;
  const el = PF[side].querySelector("svg");
  const blink = () => { el.classList.add("bl"); setTimeout(() => el.classList.remove("bl"), 140); blinkTimers.push(setTimeout(blink, 1800 + Math.random() * 3000)); };
  blinkTimers.push(setTimeout(blink, 700 + Math.random() * 1500));
  return el;
}
async function speak(c, els, [side, raw, fx]) {
  raw = rewriteSay(raw);
  PF.L.classList.toggle("speaking", side === "L"); PF.R.classList.toggle("speaking", side === "R");
  let text = raw, sub = ""; if (raw.includes("|")) [text, sub] = raw.split("|");
  const who = dlg.querySelector(".who"), txt = dlg.querySelector(".txt");
  dlg.querySelector(".more").style.display = "";
  if (side === "N") { who.textContent = "NARRATOR"; who.style.background = "var(--W)"; txt.style.color = "var(--W)"; }
  else { const p = PORTRAIT[c[side]] || PORTRAIT.nell; who.textContent = p.name; who.style.background = `var(--${p.chip.slice(1)})`; txt.style.color = `var(--${p.chip.slice(1)})`; }
  const sp = side === "N" ? null : els[side];
  if (sp) sp.classList.toggle("blank", fx === "blank");
  if (fx === "blank") sfx.play("blank");
  const scene = $("#preston"); if (fx === "blank" && scene) scene.classList.add("blank");
  let flap = 0;
  await typeInto(txt, esc(text) + (sub ? `<em>${esc(sub)}</em>` : ""), G.mode === "night" ? 24 : 16,
    (on) => { if (on) sfx.voice(side === "N" ? "NARRATOR" : (PORTRAIT[c[side]] || PORTRAIT.nell).name); if (!sp) return; if (on) { if (++flap % 3 === 0) sp.classList.toggle("mo"); } else sp.classList.remove("mo"); });
  if (sp) { sp.classList.remove("mo"); sp.classList.remove("blank"); }
  if (scene) scene.classList.remove("blank");
}
// a dialogue choice (Gabriel Knight topic list): click one line
function pick(c, choices) {
  return new Promise(resolve => {
    PF.L.classList.add("speaking"); PF.R.classList.remove("speaking");
    const p = PORTRAIT[c.L], who = dlg.querySelector(".who"), txt = dlg.querySelector(".txt");
    who.textContent = p.name + "  CHOOSE"; who.style.background = `var(--${p.chip.slice(1)})`;
    dlg.querySelector(".more").style.display = "none";
    txt.style.color = "var(--W)";
    txt.innerHTML = choices.map((ch, i) => `<div class="choice" data-i="${i}"><b>${i + 1}</b>${esc(ch.text)}</div>`).join("");
    function done(ch) { frame.removeEventListener("pointerdown", click, true); window.removeEventListener("keydown", key); resolve(ch); }
    function click(e) { const el = e.target.closest && e.target.closest(".choice"); e.stopPropagation(); e.preventDefault(); if (el) done(choices[+el.dataset.i]); }
    function key(e) { const n = +e.key; if (n >= 1 && n <= choices.length) done(choices[n - 1]); }
    frame.addEventListener("pointerdown", click, true); window.addEventListener("keydown", key);
  });
}
async function runConvo(key) {
  const c = CONVOS[key]; G.busy = true; hover.classList.remove("show");
  const els = { L: mount("L", c.L), R: mount("R", c.R) };
  convo.classList.add("show");
  for (const line of c.lines) {
    if (Array.isArray(line)) { await speak(c, els, line); continue; }
    let left = [...line.choice];
    for (;;) {
      const ch = await pick(c, left);
      await speak(c, els, ["L", ch.text]);
      for (const l of ch.lines || []) await speak(c, els, l);
      if (ch.score) addScore(...ch.score);
      if (ch.correct || !line.retry) break;
      left = left.filter(x => x !== ch);
      if (!left.length) break;
    }
  }
  blinkTimers.forEach(clearTimeout); blinkTimers = [];
  convo.classList.remove("show");
  if (c.score) addScore(...c.score);
  G.busy = false;
  if (c.after) await c.after(api);
}

/* ================================================================ *
 *  OVERLAYS: cards, readouts, choices, death
 * ================================================================ */
const card = $("#card"), readout = $("#readout");
// crt: the card powers on like a CRT, the shut-off in reverse: a white dot, a line, a thin band, the picture.
// Poses, not tweens; the card's fade is switched off so the dot appears on black at once.
const CRT_POSES = [
  [0, 0, `<circle class="fW" cx="320" cy="180" r="1.6"/>`, 70],
  [0, 0, `<circle class="fW" cx="320" cy="180" r="3"/>`, 60],
  [0, 0, `<path class="sW" style="stroke-width:1.5" d="M290,180 L350,180"/>`, 50],
  [0, 0, `<path class="sW" style="stroke-width:1.5" d="M120,180 L520,180"/>`, 50],
  [0, 0, `<path class="sW" style="stroke-width:2" d="M0,180 L640,180"/>`, 55],
  [1, .07, `<path class="hl sW" d="M0,${180 - 12.6} L640,${180 - 12.6} M0,${180 + 12.6} L640,${180 + 12.6}"/>`, 55],
  [1, .35, "", 55],
  [1, .8, "", 50],
  [1, 1, "", 0],
];
function crtOn() {
  const g = card.querySelector("#crtg"), fx = card.querySelector("#crtfx"); if (!g || !fx) return;
  card.style.transition = "none";
  let i = 0;
  const step = () => {
    const [vis, sy, glyph, ms] = CRT_POSES[i];
    g.setAttribute("visibility", vis ? "visible" : "hidden");
    g.setAttribute("transform", `translate(0 180) scale(1 ${sy || .001}) translate(0 -180)`);
    fx.innerHTML = glyph;
    if (++i < CRT_POSES.length) setTimeout(step, ms); else { g.removeAttribute("transform"); setTimeout(() => { card.style.transition = ""; }, 50); }
  };
  step();
}
// ... and the shut-off: the picture squashes to a band, a line, a dot, and goes dark (poses, as above)
const CRT_OFF = [[1, .8, "", 50], [1, .35, "", 50], [1, .07, "", 55], [0, 0, `<path class="sW" style="stroke-width:2" d="M0,180 L640,180"/>`, 60],
  [0, 0, `<path class="sW" style="stroke-width:1.5" d="M200,180 L440,180"/>`, 60], [0, 0, `<circle class="fW" cx="320" cy="180" r="3"/>`, 90],
  [0, 0, `<circle class="fW" cx="320" cy="180" r="1.6"/>`, 260], [0, 0, "", 0]];
// a screen the story drives itself (the coda): it opens on the CRT dot, the caller sets what's on it, and it closes back
// down to the dot. set(svg) replaces the picture; click() waits for a click / Enter / Space; close() powers it off.
function crtScreen() {
  G.busy = true; sfx.play("card");
  card.innerHTML = `<rect width="640" height="360" fill="#000"/><g id="crtg" visibility="hidden"></g><g id="crtfx"></g>`;
  card.style.transition = "none"; card.classList.add("show"); crtOn();
  return {
    set: (inner) => { const e = card.querySelector("#crtg"); if (e) e.innerHTML = inner; },
    // click(min, ms): resolves on a click / Enter / Space after min ms, or by itself after ms (if given)
    click: (min = 600, ms = 0) => new Promise(r => { const t0 = Date.now(); let tm = 0;
      const end = () => { clearTimeout(tm); card.removeEventListener("pointerdown", f); off(); r(); };
      const f = (e) => { if (e && Date.now() - t0 < min) return; if (e && e.type === "pointerdown") swallowNextClick(); end(); };
      card.addEventListener("pointerdown", f); const off = advanceKey(f); if (ms) tm = setTimeout(end, ms); }),
    // choose(ids): resolves with the data-btn of a clicked button on the screen, or the nth id for number key n
    choose: (ids) => new Promise(r => {
      const end = (v) => { card.removeEventListener("pointerdown", f); window.removeEventListener("keydown", k, true); r(v); };
      const f = (e) => { const b = e.target.closest && e.target.closest("[data-btn]"); if (!b) return; e.preventDefault(); swallowNextClick(); end(b.dataset.btn); };
      const k = (e) => { const n = +e.key; if (n >= 1 && n <= ids.length) { e.preventDefault(); e.stopPropagation(); end(ids[n - 1]); } };
      card.addEventListener("pointerdown", f); window.addEventListener("keydown", k, true); }),
    // close({ tint: "X", hold }): the line and dot drawn in another colour class (X: always red), the dot held longer
    close: ({ tint = "W", hold = 0 } = {}) => new Promise(r => { const g = card.querySelector("#crtg"), fx = card.querySelector("#crtfx"); card.style.transition = "none"; sfx.play("powerdown");
      let i = 0; const step = () => { let [vis, sy, glyph, ms] = CRT_OFF[i];
        if (g) { g.setAttribute("visibility", vis ? "visible" : "hidden"); g.setAttribute("transform", `translate(0 180) scale(1 ${sy || .001}) translate(0 -180)`); }
        if (tint !== "W") glyph = glyph.replace(/\b([sf])W\b/g, `$1${tint}`);
        if (hold && i === CRT_OFF.length - 2) ms += hold;
        if (fx) fx.innerHTML = glyph;
        if (++i < CRT_OFF.length) setTimeout(step, ms); else { card.classList.remove("show"); card.innerHTML = ""; setTimeout(() => { card.style.transition = ""; }, 50); G.busy = false; r(); } };
      step(); }),
  };
}
function showCard(inner, { hold = 0, auto = 2600, buttons = false, crt = false, mark = !buttons } = {}) {
  sfx.play("card"); hold = Math.max(hold, 600);
  return new Promise(resolve => {
    G.busy = true;
    if (mark) inner += moreMark();
    card.innerHTML = crt ? `<rect width="640" height="360" fill="#000"/><g id="crtg" visibility="hidden">${inner}</g><g id="crtfx"></g>` : `<rect width="640" height="360" fill="#000"/>${inner}`;
    if (crt) crtOn();
    card.classList.add("show");
    let done = false; const t0 = Date.now();
    const hide = (e) => {
      if (done || Date.now() - t0 < hold) return;
      let val = true;
      if (buttons) { const b = e && e.target.closest && e.target.closest("[data-btn]"); if (!b) return; val = b.dataset.btn; }
      done = true; card.classList.remove("show"); card.removeEventListener("pointerdown", hide); offKey(); if (e && e.type === "pointerdown") swallowNextClick(); G.busy = false; resolve(val);
    };
    card.addEventListener("pointerdown", hide); if (auto && !buttons) setTimeout(() => hide(), auto);
    const offKey = buttons ? () => {} : advanceKey(hide);
  });
}
const centered = (t, y, h, cls, sw) => seg(t, 320 - segW(t, h) / 2, y, h, cls, sw);
const cchip = (t, y, h, f) => chip(t, 320 - (segW(t, h) + h * .9) / 2, y, h, f);
const dayCard = (t1, t2, t3, f) => `${centered(t1, 128, 42, "sW", 2)}${cchip(t2, 196, 8, f)}${centered(t3, 230, 6, "sM", 1)}`;
const button = (id, label, x, y, w, primary) => `<g data-btn="${id}" class="cbtn" style="cursor:pointer"><rect class="${primary ? "fW" : "k sW"}" x="${x}" y="${y}" width="${w}" height="26"/>${seg(label, x + w / 2 - segW(label, 7) / 2, y + 9, 7, primary ? "s0" : "sW", 1.2)}</g>`;

// a clue close-up: wait for a click, then dim it under a caption
async function showReadout(inner, caption) {
  G.busy = true;
  readout.innerHTML = `<rect width="640" height="360" fill="#000" opacity=".86"/>${inner}${moreMark(600, 282)}`; readout.classList.add("show");
  await new Promise(r => { const t0 = Date.now();
    const f = (e) => { e.stopPropagation(); e.preventDefault(); if (Date.now() - t0 < 300) return; frame.removeEventListener("pointerdown", f, true); offKey(); if (e.type === "pointerdown") swallowNextClick(); r(); };
    frame.addEventListener("pointerdown", f, true); const offKey = advanceKey(f); });
  if (caption) { readout.classList.add("dim"); await say(caption); }
  readout.classList.remove("show", "dim"); G.busy = false;
}
// pick one of several labeled chips (vent destinations, etc.)
function chooseFrom(title, opts) {
  const w = 150, x0 = 320 - w / 2, y0 = 150 - opts.length * 17;
  let s = `<rect width="640" height="290" fill="#000" opacity=".8"/>${cchip(title, y0 - 30, 7, "fK")}`;
  opts.forEach(([id, lbl], i) => { s += button(id, lbl, x0, y0 + i * 34, w, false) + seg(String(i + 1), x0 - 12, y0 + i * 34 + 9, 7, "sM", 1); });
  s += button("cancel", "NEVER MIND", x0, y0 + opts.length * 34 + 6, w, true) + seg("ESC", x0 + w + 8, y0 + opts.length * 34 + 15, 4.4, "sM", .7);
  return new Promise(resolve => {
    G.busy = true; readout.innerHTML = s; readout.classList.add("show", "pick");
    const end = (id) => { readout.removeEventListener("pointerdown", f); window.removeEventListener("keydown", k, true); readout.classList.remove("show", "pick"); swallowNextClick(); G.busy = false; resolve(id === "cancel" ? null : id); };
    const f = (e) => { const b = e.target.closest && e.target.closest("[data-btn]"); if (b) end(b.dataset.btn); };
    const k = (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); end("cancel"); return; }
      const n = +e.key; if (n >= 1 && n <= opts.length) { e.preventDefault(); e.stopPropagation(); end(opts[n - 1][0]); } };
    readout.addEventListener("pointerdown", f); window.addEventListener("keydown", k, true);
  });
}
function die(text) {
  text = rewriteSay(text);
  return new Promise(resolve => {
    G.busy = true; hover.classList.remove("show"); closeChooser();
    const d = $("#death");
    d.querySelector("svg").innerHTML = `${centered("DESK REJECTED", 26, 26, "sR", 1.8)}
      <g class="dbtn" data-b="revise"><rect class="fW" x="150" y="300" width="160" height="26"/>${seg("REVISE & RESUBMIT", 230 - segW("REVISE & RESUBMIT", 7) / 2, 309, 7, "s0", 1.2)}</g>
      <g class="dbtn" data-b="withdraw"><rect class="k sW" x="330" y="300" width="160" height="26"/>${seg("WITHDRAW MANUSCRIPT", 410 - segW("WITHDRAW MANUSCRIPT", 7) / 2, 309, 7, "sW", 1.2)}</g>`;
    d.querySelector(".dtxt").innerHTML = esc(text);
    d.classList.add("show"); sfx.play("death");
    const go = (which) => { d.classList.remove("show"); d.onpointerdown = null; offKey(); swallowNextClick(); G.busy = false;
      if (which === "revise") { restore(); say("Revised and resubmitted. Reviewer 2 is still out there."); } else { location.hash = ""; location.reload(); }
      resolve(); };
    d.onpointerdown = (e) => { const b = e.target.closest(".dbtn"); if (b) go(b.dataset.b); };
    const offKey = advanceKey(() => go("revise"));   // Enter or Space: REVISE & RESUBMIT (withdrawing needs the click)
  });
}

/* ================================================================ *
 *  SHIFTS, CHARACTERS, ACTS
 * ================================================================ */
// change who/when: { mode, char, room, entry, min, cast }
function shift({ mode, char, room, entry, min, cast }) {
  if (mode) G.mode = mode;
  if (min != null) G.min = min;
  if (cast) G.cast = cast;
  G.using = null; G.status = ""; G.extras = [];
  frame.classList.toggle("night", G.mode === "night");
  if (char) { G.char = char; delete G.chars[char]; }
  loadRoom(room, entry);
}
function switchTo(c) {
  if (c === G.char || G.busy || !G.cast.includes(c)) return;
  const a = G.actor;
  G.chars[G.char] = { room: G.room, x: a.x, y: a.y, dir: a.dir };
  const p = G.chars[c]; delete G.chars[c];
  G.char = c; G.using = null; closeChooser();
  loadRoom(p.room, null, p);
  sfx.play("switch");
  const t = ACT().onSwitch && ACT().onSwitch(api, c); if (t) say(t);
}
function saveProgress() { try { localStorage.setItem("gaincontrol.act", String(Math.max(G.act, +(localStorage.getItem("gaincontrol.act") || 1)))); } catch (e) {} }
async function startAct(n, { fresh = false } = {}) {
  G.act = n; saveProgress();
  await ACTS[n].start(api, { fresh });
}
// the room switches off like an old TV, in poses: squash, a line, a dot, dark. Cards after it play over black.
async function blackout(on = true) {
  const wipe = $("#wipe");
  if (!on) { svg.style.visibility = ""; svg.style.transform = ""; wipe.innerHTML = ""; return; }
  if (svg.style.visibility === "hidden") return;
  svg.style.transition = "none"; svg.style.transformOrigin = "50% 50%"; sfx.play("powerdown");
  const P = [[.35, ""], [.07, ""], [0, `<path class="sW" style="stroke-width:2" d="M0,180 L640,180"/>`], [0, `<path class="sW" style="stroke-width:1.5" d="M220,180 L420,180"/>`],
    [0, `<circle class="fW" cx="320" cy="180" r="2.6"/>`], [0, `<circle class="fW" cx="320" cy="180" r="1.2"/>`], [0, ""]];
  for (const [sy, g] of P) { svg.style.transform = sy ? `scaleY(${sy})` : ""; svg.style.visibility = sy ? "visible" : "hidden"; wipe.innerHTML = g; await new Promise(r => setTimeout(r, 70)); }
}
async function endAct() {
  const E = ACT().END;
  await new Promise(r => setTimeout(r, 300));
  await blackout();                                        // the room switches off; the epilogue happens somewhere else
  if (E.epilogue) await say(E.epilogue);                   // the act's last beat, then the card that closes it (and names the next day)
  const sc = "H-INDEX " + String(G.score).padStart(2, "0");
  await showCard(`${centered(E.title, 96, 30, "sW", 1.8)}${cchip(E.chip, 148, 7, "fA")}
    ${centered(sc, 186, 12, "sA", 1.3)}${centered(E.bodies, 212, 6, "sR", 1)}
    ${centered(E.next, 252, 6, "sM", 1)}`, { hold: 1200, auto: 0 });
  if (ACTS[G.act + 1]) { await blackout(false); await startAct(G.act + 1); return; }
  await coda(api);                                         // the real record, after the last act
  await credits(api, { score: G.score, out: E.out });      // the credits roll, and close on the megaZINE masthead (and, after a bad ending, your punishment)
  location.hash = ""; location.reload();
}

/* ================================================================ *
 *  STORY API — what the act files are allowed to touch
 * ================================================================ */
const api = {
  G, ITEMS,
  flag: (k, v) => { if (v === undefined) return !!G.flags[k]; G.flags[k] = v; },
  has: (id) => Object.values(G.inv).some(l => l.includes(id)),
  give: (id, who = G.char) => { (G.inv[who] ||= []); if (!G.inv[who].includes(id)) { G.inv[who].push(id); sfx.play("pickup"); } hud(); },
  sfx: (name, o) => sfx.play(name, o),
  take: (id) => { for (const m in G.inv) G.inv[m] = G.inv[m].filter(x => x !== id); if (G.using === id) G.using = null; hud(); },
  score: addScore, refresh, say, die, endAct, shift, switchTo, chooseFrom, blip, blackout,
  convo: runConvo,
  card: (t1, t2, t3, f, ms = 2800) => showCard(dayCard(t1, t2, t3, f), { auto: ms + 500, crt: true }),
  bigCard: (inner, opts) => showCard(inner, opts), centered, cchip, button, crt: () => crtScreen(),
  readout: showReadout,
  keypad: (code, lit) => { G.busy = true; return keypad(readout, code, lit).finally(() => { G.busy = false; }); },
  fogNeuro: (opts) => { G.busy = true; return fogNeuro($("#panel"), opts).finally(() => { G.busy = false; }); },
  goRoom: (spec) => { const [room, entry] = spec.split("@"); loadRoom(room, entry); },
  walk: (x, y) => new Promise(r => walkTo(x, y, r)),
  wait: (ms) => new Promise(r => setTimeout(r, ms)),
  extras: (list) => { G.extras = list; drawExtras(); },
  status: (t, ms) => { G.status = t; hud(); clearTimeout(G.statusT); G.statusT = setTimeout(() => { G.status = ""; hud(); }, ms); },
  use: (id) => { const u = HS()[G.room][id][KEY()].use; return typeof u === "function" ? u(api) : u; },
  hud: () => hud(),
  pose: (g, i) => poseSet(g, i),
  // a full-screen minigame in #panel: fn(el, opts) → Promise; cls adds layout classes (e.g. "glmwrap", "nodmode")
  mini: async (fn, opts = {}, cls = "") => {
    const p = $("#panel"); G.busy = true; hover.classList.remove("show"); closeChooser();
    if (cls) p.classList.add(...cls.split(" ")); p.classList.add("show");
    try { return await fn(p, opts); } finally { p.className = ""; p.innerHTML = ""; G.busy = false; }
  },
};
// a response: string | "c:convo" | function(api) → any of those, or a promise
async function respond(r) {
  if (typeof r === "function") r = r(api);
  if (r && typeof r.then === "function") r = await r;
  if (!r || typeof r !== "string") return;
  if (r.startsWith("c:")) await runConvo(r.slice(2)); else await say(r);
}
async function afterAction() {
  G.min += 1; if (G.room === "seminar" && !G.busy) refresh(); else hud();   // the room clock is part of the drawing
  const t = await ACT().check(api); if (t) await respond(t);
  if (pendingRemark) { pendingRemark = false; if (!t) maybeRemark(); }   // a room change with nothing else going on
}

/* ================================================================ *
 *  INPUT: the chooser
 * ================================================================ */
const chooserEl = () => $("#chooser");
function svgPoint(e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
const hsOf = (id) => (HS()[G.room] || {})[id];
function hsFrom(t) { const el = t.closest && t.closest("[data-hs]"); if (!el) return null; const id = el.dataset.hs, h = hsOf(id);
  return h && h[KEY()] ? id : null; }
const hsLabel = (id) => { const h = hsOf(id); return (typeof h.label === "function" ? h.label(api) : h.label); };
function optionsFor(t) {
  if (t.type === "item") { const it = ITEMS[t.id]; return [["look", "LOOK"], ["use", "USE ON"], ...(it.verbs ? it.verbs(api) : [])]; }
  const h = hsOf(t.id)[KEY()], L = (R().labels[KEY()] || R().labels[G.mode === "morning" ? "day" : G.mode] || {})[t.id] || {}, o = [];
  if (h.look) o.push(["look", L.look || "LOOK"]);
  if (h.talk) o.push(["talk", L.talk || "TALK"]);
  if (h.use) o.push(["use", L.use || "USE"]);
  if (typeof h.go === "string" || typeof h.go === "function") o.push(["go", L.go || L.use || "GO"]);
  else if (h.go) for (const k of Object.keys(h.go)) o.push(["go:" + k, L[k] || ("GO " + k.toUpperCase())]);
  return o.slice(0, 4);
}
function openChooser(t, x, y) {
  const opts = optionsFor(t); if (!opts.length) return;
  const name = (t.type === "item" ? ITEMS[t.id].name : hsLabel(t.id)).toUpperCase();
  const RR = 34, up = y > 110;
  x = Math.max(56, Math.min(584, x));
  const spreads = { 1: [-90], 2: [-128, -52], 3: [-150, -90, -30], 4: [-165, -115, -65, -15] };
  const angles = spreads[opts.length].map(a => (up ? a : -a) * Math.PI / 180);
  const ch = 7, cw = segW(name, ch) + ch * .9, cy = up ? y - RR - 42 : y + RR + 26;
  const cx = Math.max(cw / 2 + 4, Math.min(636 - cw / 2, x));
  let full = `<g class="pz" data-g="ch" data-i="1"><rect class="k" x="${cx - cw / 2 - 2}" y="${cy - 2}" width="${cw + 4}" height="${ch * 1.7 + 4}"/>${chip(name, cx - cw / 2, cy, ch, "fW")}`;
  opts.forEach(([v, lbl], i) => {
    const bx = x + RR * Math.cos(angles[i]), by = y + RR * Math.sin(angles[i]), lw = segW(lbl, 4.8);
    const lx = Math.max(2, Math.min(638 - lw, bx - lw / 2)), ly = up ? by - 23 : by + 15;
    const icon = ICON[v.split(":")[0]] || ICON.use;
    full += `<path class="hl sW" d="M${x + 8 * Math.cos(angles[i])},${y + 8 * Math.sin(angles[i])} L${bx - 11 * Math.cos(angles[i])},${by - 11 * Math.sin(angles[i])}"/>
      <g class="opt" data-opt="${v}"><circle class="k sW bg" cx="${bx}" cy="${by}" r="12"/>
        <g class="g" transform="translate(${bx},${by}) scale(.78)">${icon(0, 0, "sW")}</g>
        <g class="lbl"><rect class="k" x="${lx - 2}" y="${ly - 1.5}" width="${lw + 4}" height="7.8"/>${seg(lbl, lx, ly, 4.8, "sW", .8)}</g>
        <circle cx="${bx}" cy="${by}" r="14" fill="transparent"/></g>`;
  });
  full += `</g>`;
  const ret = `<circle class="hl sW" cx="${x}" cy="${y}" r="5"/><path class="hl sW" d="M${x - 9},${y} L${x - 6},${y} M${x + 6},${y} L${x + 9},${y} M${x},${y - 9} L${x},${y - 6} M${x},${y + 6} L${x},${y + 9}"/>`;
  const pop = `<g class="pz on" data-g="ch" data-i="0"><circle class="hl dash sW" cx="${x}" cy="${y}" r="${RR - 12}"/></g>`;
  chooserEl().innerHTML = ret + pop + full; sfx.play("pop");
  G.chooser = { t };
  setTimeout(() => { if (G.chooser) chooserEl().querySelectorAll('[data-g="ch"]').forEach(el => el.classList.toggle("on", el.dataset.i === "1")); }, 70);
  hover.classList.remove("show");
}
function closeChooser() { const c = chooserEl(); if (c) c.innerHTML = ""; G.chooser = null; }
function cancelAll() { if (G.chooser || G.using) sfx.play("cancel"); closeChooser(); if (G.using) { G.using = null; hud(); } }

frame.addEventListener("pointermove", (e) => {
  if (G.busy || G.chooser || e.pointerType === "touch") { hover.classList.remove("show"); return; }   // a finger has no hover: the chooser names things
  const id = hsFrom(e.target), item = e.target.closest && e.target.closest("[data-item]"), ch = e.target.closest && e.target.closest("[data-char]");
  let label = "";
  if (G.using) label = `Use ${ITEMS[G.using].name} on ${id ? hsLabel(id) : item ? ITEMS[item.dataset.item].name : "…"}`;
  else label = id ? hsLabel(id) : item ? ITEMS[item.dataset.item].name : ch ? `Switch to ${CHIP[ch.dataset.char][0]}` : "";
  if (!label) { hover.classList.remove("show"); return; }
  const r = frame.getBoundingClientRect();
  hover.textContent = label; hover.classList.add("show");
  let lx = e.clientX - r.left + 14; const w = hover.offsetWidth;
  if (lx + w > r.width - 6) lx = e.clientX - r.left - w - 14;
  hover.style.left = lx + "px"; hover.style.top = (e.clientY - r.top + 16) + "px";
});
frame.addEventListener("contextmenu", (e) => { e.preventDefault(); if (!G.busy) cancelAll(); });
// sound: the audio context can only start after a user gesture; M toggles it
const unlockAudio = () => { if (sfx.running && music.state.on) return; sfx.unlock(); music.start(); musicScene(true); };
for (const ev of ["pointerdown", "pointerup", "touchend", "click", "keydown"]) window.addEventListener(ev, unlockAudio, true);
// (after iOS suspends or interrupts the audio, e.g. coming back to the home-screen app, the next tap wakes it again)
window.addEventListener("keydown", (e) => { if ((e.key === "m" || e.key === "M") && !e.target.closest?.("input,textarea")) { sfx.toggle(); hud(); } });
FULL.install(() => hud());
installNative(sfx);   // the Mac and iOS apps (js/native.js); nothing on the web
const GUIDE = installGuide({ G });
// stuck? after a while without progress, a glint on the next thing, then a line said in voice (js/nudge.js)
const NUDGE = installNudge({ G, svg, say, idle: () => !onTitle && !G.busy && !G.chooser && !G.using && !G.actor.walking && !!G.room
  && opt("hints") && document.visibilityState === "visible" && !$("#panel").innerHTML && !$("#card").classList.contains("show") && !(window.GC && window.GC.noNudge) });
frame.addEventListener("pointerdown", (e) => { if (e.target.closest && e.target.closest("[data-mute]")) { e.stopPropagation(); sfx.toggle(); hud(); } }, true);
// the options menu (js/menu.js): HUD chip or O. Settings and codes redraw the room when they change.
const MENU = installMenu({ G, sfx, FULL, GUIDE, onChange: () => { if (G.room && !onTitle) build(); } });
frame.addEventListener("pointerdown", (e) => { if (e.target.closest && e.target.closest("[data-options]")) { e.stopPropagation(); if (!G.busy) MENU.show(); } }, true);
onOptions(() => { if (G.room && !onTitle && !MENU.isOpen()) build(); });
window.addEventListener("keydown", (e) => {
  if (G.busy) return;
  if (e.key === "Escape") cancelAll();
  if (e.key === "Tab" && G.cast.length > 1) { e.preventDefault(); switchTo(G.cast[(G.cast.indexOf(G.char) + 1) % G.cast.length]); }
});

svg.addEventListener("click", (e) => {
  if (G.busy) return;
  const opt = e.target.closest(".opt"); if (opt) sfx.play("select");
  if (opt) { const t = G.chooser.t; closeChooser(); t.type === "item" ? itemAct(t.id, opt.dataset.opt) : act(t.id, opt.dataset.opt, t.x); return; }
  if (G.chooser) closeChooser();
  const ch = e.target.closest("[data-char]"); if (ch) { switchTo(ch.dataset.char); return; }
  const it = e.target.closest("[data-item]");
  if (it) {
    const id = it.dataset.item;
    if (G.using && G.using !== id) { G.using = null; hud(); say("You hold them together. Nothing. They don't even seem to like each other."); return; }
    if (G.using === id) { G.using = null; hud(); return; }
    { const q = invPos(G.inv[G.char].indexOf(id), G.inv[G.char].length); openChooser({ type: "item", id }, q.x, q.y); } return;
  }
  const p = svgPoint(e); if (p.y > 290) return;
  const id = hsFrom(e.target);
  if (G.using) { const item = G.using; G.using = null; hud(); if (id) useItemOn(item, id, p.x); else walkTo(p.x, p.y); return; }
  if (id) { openChooser({ type: "hs", id, x: p.x }, p.x, p.y); return; }
  walkTo(p.x, p.y);
});

const face = (x) => { if (Math.abs(x - G.actor.x) > 6) { G.actor.dir = x > G.actor.x ? 1 : -1; render(); } };
function goStand(id, fn) { const s = R().stand[id]; if (s) walkTo(s[0], s[1], fn); else fn(); }
function act(id, v, cx) {
  const h = hsOf(id)[KEY()], sc = h.score || {};
  snapshot();
  if (v === "look") { face(cx ?? R().stand[id]?.[0] ?? G.actor.x);
    (async () => { await respond(h.look); if (sc.look) addScore(...sc.look); await afterAction(); })(); return; }
  if (v === "go" || v.startsWith("go:")) {
    let dest = v === "go" ? h.go : h.go[v.slice(3)];
    goStand(id, async () => {
      if (typeof dest === "function") dest = await dest(api);
      if (!dest) { await afterAction(); return; }
      if (!dest.includes("@")) { await respond(dest); await afterAction(); return; }    // a refusal ("Locked."), a line or "c:convo"
      api.goRoom(dest); await afterAction();
    });
    return;
  }
  goStand(id, async () => { await respond(h[v]); if (sc[v]) addScore(...sc[v]); await afterAction(); });
}
function itemAct(id, v) {
  const it = ITEMS[id];
  if (v === "look") { respond(typeof it.look === "function" ? it.look(api) : it.look); return; }
  if (v === "use") { G.using = id; hud(); return; }
  if (it[v]) respond(it[v]);
}
const NOPE = ["That doesn't work. Not even in theory.", "You try. Physics declines.", "No. Peer review would reject that too.", "Interesting hypothesis. Wrong, but interesting."];
function useItemOn(item, id) {
  snapshot();
  const W = ACT().WITH || {};
  let r = (W[G.room + "." + id] || {})[item];
  if (typeof r === "function") r = r(api);
  if (!r && item === "recorder" && !G.flags.recorded) r = "Your recorder is empty. Talk to someone worth recording first.";
  if (!r) r = NOPE[Math.floor(Math.random() * NOPE.length)];
  goStand(id, async () => { await respond(r); await afterAction(); });
}

/* ================================================================ *
 *  STEPPED (GAME & WATCH) MOVEMENT
 * ================================================================ */
function clampFloor(x, y) {
  const f = R().floor, pp = R().pp; y = Math.max(f.yMin, Math.min(f.yMax, y));
  const k = pp.kAtY(y), lo = pp.vpx - pp.vpx * k + f.margin, hi = pp.vpx + (640 - pp.vpx) * k - f.margin;
  return [Math.max(lo, Math.min(hi, x)), y];
}
function walkTo(x, y, cb) { const a = G.actor; [a.tx, a.ty] = clampFloor(x, y); a.cb = cb || null; a.walking = true; }
setInterval(() => {
  const a = G.actor; if (!a.walking) return;
  const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), stepLen = (G.char === "morris" ? 11 : 9) * R().pp.kAtY(a.y) + 3;
  if (d <= stepLen) { a.x = a.tx; a.y = a.ty; a.walking = false; render(); const cb = a.cb; a.cb = null; cb && cb(); return; }
  a.x += dx / d * stepLen; a.y += dy / d * stepLen; if (Math.abs(dx) > 1) a.dir = dx > 0 ? 1 : -1; a.step++; sfx.play(G.char === "morris" ? "ratstep" : "step", { room: G.room }); render();
}, 120);

/* ================================================================ *
 *  AMBIENT POSE CLOCKS
 * ================================================================ */
function poseSet(group, i) { document.querySelectorAll(`#game [data-g="${group}"]`).forEach(el => el.classList.toggle("on", +el.dataset.i === i)); }
const clocks = { blink: 300, drip: 600, tube: 450, chant: 700, nod: 800, tail: 650, parm: 1700, brett: 900, phone: 1100, saver: 1500, hum: 420, alarm: 380, wave: 520, type: 260, jam: 700, hol: 700 };
for (const [g, ms] of Object.entries(clocks)) { let i = 0; setInterval(() => poseSet(g, i ^= 1), ms); }
installWhimsy({ G, sfx, poseSet });
(function flicker() { poseSet("flicker", Math.random() < .25 ? 1 : 0); setTimeout(flicker, 90 + Math.random() * 600); })();
(function blank() { const p = $("#preston"); if (p && G.mode === "day" && !G.busy) { p.classList.add("blank"); setTimeout(() => p.classList.remove("blank"), 700); }
  setTimeout(blank, 5500 + Math.random() * 4000); })();
(function drop() {   // canisters fall in fixed positions, then vanish past the floor
  const can = $("#game .canister");
  if (can) { const ys = [24, 48, 72, 100, 128, 200, 226, 252, 276]; let i = 0; can.style.display = "inline";
    const t = setInterval(() => { if (i >= ys.length || !can.isConnected) { clearInterval(t); can.style.display = "none"; return; } can.setAttribute("transform", `translate(0,${ys[i++]})`); }, 110); }
  setTimeout(drop, G.mode === "night" ? 3000 + Math.random() * 2400 : 8000 + Math.random() * 5000);
})();
setInterval(() => document.querySelectorAll("#game .needle").forEach(n => { const cx = +n.dataset.cx, cy = +n.dataset.cy, a = Math.random() * 1.2 - .9;
  n.setAttribute("d", `M${cx},${cy} L${(cx + 5 * Math.cos(a)).toFixed(1)},${(cy + 5 * Math.sin(a)).toFixed(1)}`); }), 300);

/* ================================================================ *
 *  START: title and chapter select
 * ================================================================ */
window.GC = { G, api, FULL, GUIDE, MENU, render, get NUDGE() { return NUDGE; }, act, itemAct, useItemOn, loadRoom, walkTo, runConvo, switchTo, startAct };   // for testing
async function start() {
  await applyOverrides(ACTS, ITEMS);
  // a PLAY link from the Script Room lands straight in a scene. Browsers won't make a sound until the page has been
  // tapped, so it gets the tap the title screen would have given it: a card, then the scene, with sound from the start.
  const jm = /^#jump=([^&]+)/.exec(location.hash);
  if (jm && !sfx.running) {
    const [n, key = "day", room = ""] = decodeURIComponent(jm[1]).split(".");
    const where = `ACT ${["", "I", "II", "III", "IV", "V"][+n] || n}  ${key.toUpperCase()}${room ? "  " + room.toUpperCase() : ""}`;
    await showCard(`${centered("FROM THE SCRIPT ROOM", 118, 8, "sM", .9)}${centered(where, 146, 22, "sW", 1.6)}${cchip("TAP TO PLAY", 206, 8, "fG")}`, { auto: 0 });
  }
  if (await jumpFromHash()) return;
  const h = location.hash;
  if (h === "#night") { G.flags = { recorded: true, officeHours: true, fedMorris: true, morrisMoved: true, noteReady: true, noteRead: true };
    shift({ mode: "night", char: "gus", room: "hall", entry: "start", min: 133 }); return; }
  if (h === "#act2") { await startAct(2, { fresh: true, skipCard: true }); return; }
  if (h === "#act2night") { await startAct(2, { fresh: true }); await A2.debugNight(api); return; }
  if (h === "#act3") { await startAct(3, { fresh: true, skipCard: true }); return; }
  if (h === "#act3night") { await startAct(3, { fresh: true, skipCard: true }); await A3.debugNight(api); return; }
  if (h === "#act4") { await startAct(4, { fresh: true, skipCard: true }); return; }
  if (h === "#act4night") { await startAct(4, { fresh: true, skipCard: true }); await A4.debugNight(api); return; }
  if (h === "#act4morning" || h === "#act5morning") { await startAct(5, { fresh: true, skipCard: true }); return; }   // Friday morning opens Act V now
  if (h === "#act5") { await startAct(5, { fresh: true, skipCard: true }); return; }
  if (h === "#act5defense") { await startAct(5, { fresh: true, skipCard: true }); await A5.debugDefense(api); return; }
  // straight to an ending: #accepted (alias #ending, the best), #major, #inducted (said yes), #deskreject (asked to think about it)
  const ENDS = { "#accepted": ["accepted", "ACCEPTED", "THE BEST ENDING  TAP TO PLAY"], "#ending": ["accepted", "ACCEPTED", "THE BEST ENDING  TAP TO PLAY"],
    "#major": ["major", "MAJOR REVISIONS", "TAP TO PLAY"], "#inducted": ["inducted", "INDUCTED", "YOU SAID YES  TAP TO PLAY"], "#deskreject": ["deskreject", "DESK REJECT", "YOU ASKED TO THINK  TAP TO PLAY"] };
  if (ENDS[h]) { const [which, title, sub] = ENDS[h];
    await showCard(`${centered("GAIN CONTROL", 118, 8, "sM", .9)}${centered(title, 146, 22, "sW", 1.6)}${cchip(sub, 206, 8, "fG")}`, { auto: 0 });
    G.act = 5; await A5.debugEnding(api, which); return; }
  if (h === "#credits") { await showCard(`${centered("GAIN CONTROL", 118, 8, "sM", .9)}${centered("THE END CREDITS", 146, 22, "sW", 1.6)}${cchip("TAP TO PLAY", 206, 8, "fG")}`, { auto: 0 });
    G.act = 5; await credits(api, { score: G.score }); location.hash = ""; location.reload(); return; }   // straight to the end credits
  if (h === "#act5night") { await startAct(5, { fresh: true, skipCard: true }); await A5.debugNight(api); return; }
  loadRoom("seminar", "start");
  const unlocked = +(localStorage.getItem("gaincontrol.act") || 1);
  onTitle = true; musicScene(true);
  // CLICK TO START: browsers keep a page silent until it's clicked, so the game begins on a dark screen with the CRT's
  // standby dot. That click turns the sound on (the menu's tune starts), and the dot opens out into the title screen.
  if (!(sfx.running && music.state.on)) {
    let n = 0;   // on most of the time, a short blink off (like a standby light)
    const blink = setInterval(() => { const e = document.getElementById("cts"); if (e) e.setAttribute("visibility", ++n % 4 === 3 ? "hidden" : "visible"); }, 300);
    await showCard(`<circle class="fW" cx="320" cy="180" r="1.6"/><g id="cts">${centered("CLICK TO START", 204, 8, "sW", 1.1)}</g>`, { auto: 0 });
    clearInterval(blink);
  }
  const tOpts = { unlocked, allActs: cheatOn("allacts"), full: !FULL.standalone(), sound: () => sfx.running && music.state.on };
  const titleP = showCard(titleArt(tOpts), { buttons: true, crt: true });
  const stopGlitch = titleGlitch(card, { sfx: () => { sfx.play("blank"); music.glitch(); }, ...tOpts });
  const choice = await titleP; stopGlitch();
  // keep the LED screen up for the handoff glitch, then let the act's day card take over the black
  card.classList.add("show"); G.busy = true; card.style.cursor = "default";
  await titleExit(card, choice, { sfx: () => { sfx.play("blank"); music.glitch(); }, ...tOpts });
  card.style.cursor = ""; onTitle = false;
  if (["2", "3", "4", "5"].includes(choice)) { await startAct(+choice, { fresh: true }); return; }
  await startAct(1, { fresh: true });
}
start();
