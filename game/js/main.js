// GAIN CONTROL — engine. Rooms draw themselves from state; story.js decides what everything means.
import { seg, segW, chip, ICON } from "./gfx.js";
import { nellFigure, gusFigure, AUD } from "./figures.js";
import { PORTRAIT } from "./portraits.js";
import { ITEMS, START_INV, CONVOS, HS, WITH, check, NOTE, NOTE_CAPTION } from "./story.js";
import seminar from "./rooms/seminar.js";
import hall from "./rooms/hallway.js";
import lab from "./rooms/lab.js";

const ROOMS = { seminar, hall, lab };
const $ = (s, r = document) => r.querySelector(s);
const svg = $("#game"), frame = $("#frame"), hover = $("#hover"), msg = $("#msg");

/* ================================================================ *
 *  STATE
 * ================================================================ */
const G = {
  mode: "day", room: "seminar", flags: {}, inv: { day: [...START_INV.day], night: [...START_INV.night] },
  score: 0, scored: new Set(), min: 16 * 60 + 7, bodies: 0, status: "", statusT: 0,
  busy: false, chooser: null, using: null,
  actor: { x: 320, y: 280, dir: 1, tx: 320, ty: 280, walking: false, step: 0, cb: null },
  get clock() { const h = Math.floor(this.min / 60) % 24, m = this.min % 60; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); },
};
const R = () => ROOMS[G.room];
let checkpoint = null;
function snapshot() {
  checkpoint = JSON.stringify({ mode: G.mode, room: G.room, flags: G.flags, inv: G.inv, score: G.score, scored: [...G.scored], min: G.min,
    actor: { x: G.actor.x, y: G.actor.y, dir: G.actor.dir } });
}
function restore() {
  const s = JSON.parse(checkpoint);
  Object.assign(G, { mode: s.mode, room: s.room, flags: s.flags, inv: s.inv, score: s.score, scored: new Set(s.scored), min: s.min, using: null, status: "" });
  frame.classList.toggle("night", G.mode === "night");
  loadRoom(G.room, null, s.actor);
}

/* ================================================================ *
 *  RENDERING
 * ================================================================ */
function build() {
  const d = R().draw(G);
  svg.innerHTML = `<g id="roomBack">${d.back}</g><g id="sortables">
    ${d.sortables.filter(o => o.svg).map(o => `<g data-depth="${o.depth}">${o.svg}</g>`).join("")}
    <g data-depth="actor" id="actorWrap"><g id="actor" data-pose="0"></g></g></g><g id="hud"></g><g id="chooser"></g>`;
  $("#actor").innerHTML = G.mode === "night" ? gusFigure() : nellFigure();
  render(); hud();
}
function loadRoom(id, entry, pos) {
  G.room = id; G.chooser = null;
  const a = G.actor, e = pos ? [pos.x, pos.y, pos.dir] : (R().entries[entry] || Object.values(R().entries)[0]);
  Object.assign(a, { x: e[0], y: e[1], dir: e[2], tx: e[0], ty: e[1], walking: false, cb: null });
  build();
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

function hud() {
  const night = G.mode === "night", h = $("#hud"); if (!h) return;
  let s = `<rect x="0" y="291" width="640" height="69" fill="#000"/><path class="hl sD" d="M0,292 L640,292 M152,302 L152,350 M276,302 L276,350 M510,302 L510,350"/>`;
  s += chip(night ? "GUS IAN" : "NELL NULL", 14, 300, 6.5, night ? "fB" : "fG");
  if (G.using) {
    const t = "USE " + ITEMS[G.using].name.toUpperCase() + " ON";
    const hh = segW(t, 4.6) + 4 > 132 ? 3.6 : 4.6;
    s += chip(t, 14, 318, hh, "fA") + seg("RIGHT-CLICK TO CANCEL", 14, 334, 3.6, "sM", .7);
  } else {
    s += seg("CLICK FLOOR", 14, 320, 4.2, "sW", .8) + seg("WALK", 92, 320, 4.2, "sM", .8);
    s += seg("CLICK THINGS", 14, 331, 4.2, "sW", .8) + seg("CHOOSE", 92, 331, 4.2, "sM", .8);
  }
  s += seg("INVENTORY", 164, 300, 4.2, "sM", .8);
  G.inv[G.mode].forEach((id, i) => { const x = 174 + i * 30, y = 327;
    s += `<g data-item="${id}" style="cursor:pointer">${G.using === id ? `<rect class="hl sA" x="${x - 13}" y="${y - 15}" width="26" height="30"/>` : ""}${ITEMS[id].g(x, y)}<rect x="${x - 13}" y="${y - 15}" width="26" height="30" fill="transparent"/></g>`; });
  s += seg("DAY", 290, 300, 4.2, night ? "sG" : "sB", .8) + seg("MON", 290, 308, 20, night ? "sG" : "sB", 1.4);
  s += seg("TIME", 336, 300, 4.2, "sW", .8) + seg(G.clock, 336, 308, 20, "sW", 1.4);
  s += seg("H-INDEX", 410, 300, 4.2, "sA", .8) + seg(String(G.score).padStart(2, "0"), 410, 308, 20, "sA", 1.4) + seg("/50", 432, 322, 7, "sM", 1);
  s += seg("BODIES", 462, 300, 4.2, "sR", .8) + seg(String(G.bodies).padStart(2, "0"), 462, 308, 20, "sR", 1.4);
  s += chip(G.status || R().name, 522, 300, 5.5, G.status === "RECORDING" ? "fR" : night ? "fG" : "fB");
  s += seg("ACT I", 522, 324, 4.2, "sM", .8) + seg("SUBMISSION", 522, 333, 7, "sW", 1.1);
  h.innerHTML = s;
}

/* ================================================================ *
 *  TEXT: narration, conversations, sound
 * ================================================================ */
let actx;
function blip(fs = [880, 1320]) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t = actx.currentTime;
  fs.forEach((f, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = "square"; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t + i * .08); g.gain.exponentialRampToValueAtTime(.04, t + i * .08 + .01); g.gain.exponentialRampToValueAtTime(.0001, t + i * .08 + .1);
    o.connect(g).connect(actx.destination); o.start(t + i * .08); o.stop(t + i * .08 + .12); }); } catch (e) {} }
function addScore(key, n) { if (!key || G.scored.has(key)) return; G.scored.add(key); G.score += n; hud(); blip(); }
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");

function typeInto(el, html, speed, onTick) {
  return new Promise(resolve => {
    let i = 0, done = false; const tokens = html.match(/<[^>]+>|&[a-z]+;|[\s\S]/g) || [];
    el.innerHTML = "";
    const timer = setInterval(() => { if (i >= tokens.length) { finish(); return; } el.innerHTML += tokens[i++]; onTick && onTick(true); }, speed);
    function finish() { clearInterval(timer); el.innerHTML = html; done = true; onTick && onTick(false); }
    function click(e) { e.stopPropagation(); e.preventDefault(); if (!done) { finish(); return; } frame.removeEventListener("pointerdown", click, true); resolve(); }
    frame.addEventListener("pointerdown", click, true);
  });
}
// speaker colors for quoted one-liners ("WHO|text")
const SPEAKER = [["MORRIS", "K"], ["PRESTON", "R"], ["BRETT", "B"], ["THE OLD WOMAN", "V"], ["GUS", "B"], ["NELL", "G"]];
const colorOf = (who) => (SPEAKER.find(([k]) => who.startsWith(k)) || [0, "A"])[1];
async function say(text) {
  if (!text) return;
  G.busy = true; hover.classList.remove("show");
  let who = "", body = text; if (text.includes("|")) [who, body] = text.split("|");
  const c = who ? colorOf(who) : "W";
  msg.innerHTML = `${who ? `<span class="who" style="background:var(--${c})">${esc(who)}</span><br>` : ""}<span class="t" style="color:var(--${c})"></span><span class="more">CLICK ▸</span>`;
  msg.classList.add("show");
  await typeInto($(".t", msg), esc(body), G.mode === "night" ? 24 : 14);
  msg.classList.remove("show"); G.busy = false;
}

const convo = $("#convo"), dlg = $("#dlg"), PF = { L: $(".pf.left"), R: $(".pf.right") };
let blinkTimers = [];
function mount(side, id) {
  const p = PORTRAIT[id];
  PF[side].querySelector(".pv").innerHTML = `<svg class="t pt" viewBox="${p.vb}" preserveAspectRatio="xMidYMid meet">${p.svg()}</svg>`;
  const nm = PF[side].querySelector(".name"); nm.textContent = p.name; nm.style.background = `var(--${p.chip.slice(1)})`;
  const el = PF[side].querySelector("svg");
  const blink = () => { el.classList.add("bl"); setTimeout(() => el.classList.remove("bl"), 140); blinkTimers.push(setTimeout(blink, 1800 + Math.random() * 3000)); };
  blinkTimers.push(setTimeout(blink, 700 + Math.random() * 1500));
  return el;
}
async function speak(c, els, [side, raw, fx]) {
  PF.L.classList.toggle("speaking", side === "L"); PF.R.classList.toggle("speaking", side === "R");
  let text = raw, sub = ""; if (raw.includes("|")) [text, sub] = raw.split("|");
  const who = dlg.querySelector(".who"), txt = dlg.querySelector(".txt");
  dlg.querySelector(".more").style.display = "";
  if (side === "N") { who.textContent = "NARRATOR"; who.style.background = "var(--W)"; txt.style.color = "var(--W)"; }
  else { const p = PORTRAIT[c[side]]; who.textContent = p.name; who.style.background = `var(--${p.chip.slice(1)})`; txt.style.color = `var(--${p.chip.slice(1)})`; }
  const sp = side === "N" ? null : els[side];
  if (sp) sp.classList.toggle("blank", fx === "blank");
  const scene = $("#preston"); if (fx === "blank" && scene) scene.classList.add("blank");
  let flap = 0;
  await typeInto(txt, esc(text) + (sub ? `<em>${esc(sub)}</em>` : ""), G.mode === "night" ? 24 : 16,
    (on) => { if (!sp) return; if (on) { if (++flap % 3 === 0) sp.classList.toggle("mo"); } else sp.classList.remove("mo"); });
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
    function click(e) {
      const el = e.target.closest && e.target.closest(".choice"); e.stopPropagation(); e.preventDefault();
      if (!el) return; frame.removeEventListener("pointerdown", click, true); window.removeEventListener("keydown", key); resolve(choices[+el.dataset.i]);
    }
    function key(e) { const n = +e.key; if (n >= 1 && n <= choices.length) { frame.removeEventListener("pointerdown", click, true); window.removeEventListener("keydown", key); resolve(choices[n - 1]); } }
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
    }
  }
  blinkTimers.forEach(clearTimeout); blinkTimers = [];
  convo.classList.remove("show");
  if (c.score) addScore(...c.score);
  G.busy = false;
  if (c.after) c.after(api);
}

/* ================================================================ *
 *  OVERLAYS: cards, readouts, death
 * ================================================================ */
const card = $("#card"), readout = $("#readout");
function showCard(inner, { hold = 0, auto = 2600 } = {}) {
  return new Promise(resolve => {
    G.busy = true; card.innerHTML = `<rect width="640" height="360" fill="#000"/>${inner}`; card.classList.add("show");
    let done = false; const t0 = Date.now();
    const hide = () => { if (done || Date.now() - t0 < hold) return; done = true; card.classList.remove("show"); card.removeEventListener("pointerdown", hide); G.busy = false; resolve(); };
    card.addEventListener("pointerdown", hide); if (auto) setTimeout(() => { if (!done) { done = false; hide(); } }, auto);
  });
}
const centered = (t, y, h, cls, sw) => seg(t, 320 - segW(t, h) / 2, y, h, cls, sw);
const cchip = (t, y, h, f) => chip(t, 320 - (segW(t, h) + h * .9) / 2, y, h, f);
const dayCard = (t1, t2, t3, f) => `${centered(t1, 128, 42, "sW", 2)}${cchip(t2, 196, 8, f)}${centered(t3, 230, 6, "sM", 1)}`;

async function readNote() {
  if (G.flags.noteRead) return;
  G.busy = true;
  readout.innerHTML = `<rect width="640" height="360" fill="#000" opacity=".86"/>${NOTE()}`; readout.classList.add("show");
  await new Promise(r => { const f = (e) => { e.stopPropagation(); frame.removeEventListener("pointerdown", f, true); r(); }; setTimeout(() => frame.addEventListener("pointerdown", f, true), 250); });
  readout.classList.add("dim");
  await say(NOTE_CAPTION);
  readout.classList.remove("show", "dim");
  G.flags.noteRead = true; addScore("note", 2);
  await nightfall();
}
async function nightfall() {
  await showCard(dayCard("MONDAY NIGHT", "NIGHT SHIFT  GUS", "HALLWAY 1F  02:13", "fG"), { auto: 3200 });
  G.mode = "night"; G.min = 2 * 60 + 13; G.using = null; G.status = "";
  frame.classList.add("night");
  loadRoom("hall", "start");
  await say("Gus Ian. Fourth-year, Adline Lab, Nell's labmate. He scans at 2 AM because the 3T is cheapest when nobody sane wants it. Nobody notices a grad student at 2 AM. Grad students are furniture.\n\nNell has been texting him about journal club. And something has been rattling in the tube pipes all week.");
}
async function endAct() {
  await new Promise(r => setTimeout(r, 300));
  const sc = "H-INDEX " + String(G.score).padStart(2, "0");
  await showCard(`${centered("END OF ACT I", 96, 30, "sW", 1.8)}${cchip("SUBMISSION", 148, 7, "fA")}
    ${centered(sc, 186, 12, "sA", 1.3)}${centered("BODIES 00.  FOR NOW.", 212, 6, "sR", 1)}
    ${centered("NEXT: TUESDAY.  ACT II  UNDER REVIEW", 252, 6, "sM", 1)}${centered("CLICK TO CONTINUE", 300, 4.4, "sM", .8)}`, { hold: 1200, auto: 0 });
  await say("Down in the dark, below a basement that doesn't have a below, six canisters arrive at a round table.\n\nSomeone opens the first one. It contains a single index card: THE AUTHORS SHOULD CONSIDER…\n\nTo be continued.");
  await showCard(`${centered("GAIN CONTROL", 120, 34, "sW", 2)}${cchip("THANKS FOR PLAYING ACT I", 186, 7, "fG")}${centered("CLICK TO PLAY AGAIN", 232, 5, "sM", .9)}`, { hold: 800, auto: 0 });
  location.hash = ""; location.reload();
}
function die(text) {
  return new Promise(resolve => {
    G.busy = true; hover.classList.remove("show"); closeChooser();
    const d = $("#death");
    d.querySelector("svg").innerHTML = `${centered("DESK REJECTED", 26, 26, "sR", 1.8)}
      <g class="dbtn" data-b="revise"><rect class="fW" x="150" y="300" width="160" height="26"/>${seg("REVISE & RESUBMIT", 230 - segW("REVISE & RESUBMIT", 7) / 2, 309, 7, "s0", 1.2)}</g>
      <g class="dbtn" data-b="withdraw"><rect class="k sW" x="330" y="300" width="160" height="26"/>${seg("WITHDRAW MANUSCRIPT", 410 - segW("WITHDRAW MANUSCRIPT", 7) / 2, 309, 7, "sW", 1.2)}</g>`;
    d.querySelector(".dtxt").innerHTML = esc(text);
    d.classList.add("show"); blip([330, 220, 160]);
    d.onclick = (e) => { const b = e.target.closest(".dbtn"); if (!b) return;
      d.classList.remove("show"); d.onclick = null; G.busy = false;
      if (b.dataset.b === "revise") { restore(); say("Revised and resubmitted. Reviewer 2 is still out there."); } else location.reload();
      resolve(); };
  });
}

/* ================================================================ *
 *  STORY API — what story.js is allowed to touch
 * ================================================================ */
const api = {
  G,
  flag: (k, v) => { if (v === undefined) return !!G.flags[k]; G.flags[k] = v; },
  has: (id) => G.inv.day.includes(id) || G.inv.night.includes(id),
  give: (id) => { if (!G.inv[G.mode].includes(id)) G.inv[G.mode].push(id); hud(); },
  take: (id) => { for (const m of ["day", "night"]) G.inv[m] = G.inv[m].filter(x => x !== id); if (G.using === id) G.using = null; hud(); },
  score: addScore, refresh, say, die, readNote, endAct,
  status: (t, ms) => { G.status = t; hud(); clearTimeout(G.statusT); G.statusT = setTimeout(() => { G.status = ""; hud(); }, ms); },
  use: (id) => { const u = HS[G.room][id][G.mode].use; return typeof u === "function" ? u(api) : u; },
};
// a response: string | "c:convo" | "room@entry" handled elsewhere | function(api) → any of those, or a promise
async function respond(r) {
  if (typeof r === "function") r = r(api);
  if (r && typeof r.then === "function") { await r; return; }
  if (!r) return;
  if (r.startsWith("c:")) await runConvo(r.slice(2)); else await say(r);
}
async function afterAction() {
  G.min += 1; if (G.room === "seminar" && !G.busy) refresh(); else hud();   // the room clock is part of the drawing
  const t = check(api); if (t) await say(t);
}

/* ================================================================ *
 *  INPUT: the chooser
 * ================================================================ */
const chooserEl = () => $("#chooser");
function svgPoint(e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
function hsFrom(t) { const el = t.closest && t.closest("[data-hs]"); if (!el) return null; const id = el.dataset.hs, h = HS[G.room][id];
  return h && h[G.mode] ? id : null; }
const hsLabel = (id) => HS[G.room][id].label;
function optionsFor(t) {
  if (t.type === "item") { const it = ITEMS[t.id]; return [["look", "LOOK"], ["use", "USE ON"], ...(it.verbs ? it.verbs(api) : [])]; }
  const h = HS[G.room][t.id][G.mode], L = (R().labels[G.mode] || {})[t.id] || {}, o = [];
  if (h.look) o.push(["look", L.look || "LOOK"]);
  if (h.talk) o.push(["talk", L.talk || "TALK"]);
  if (h.use) o.push(["use", L.use || "USE"]);
  if (h.go) o.push(["go", L.go || L.use || "GO"]);
  return o;
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
    full += `<path class="hl sW" d="M${x + 8 * Math.cos(angles[i])},${y + 8 * Math.sin(angles[i])} L${bx - 11 * Math.cos(angles[i])},${by - 11 * Math.sin(angles[i])}"/>
      <g class="opt" data-opt="${v}"><circle class="k sW bg" cx="${bx}" cy="${by}" r="12"/>
        <g class="g" transform="translate(${bx},${by}) scale(.78)">${ICON[v](0, 0, "sW")}</g>
        <g class="lbl"><rect class="k" x="${lx - 2}" y="${ly - 1.5}" width="${lw + 4}" height="7.8"/>${seg(lbl, lx, ly, 4.8, "sW", .8)}</g>
        <circle cx="${bx}" cy="${by}" r="14" fill="transparent"/></g>`;
  });
  full += `</g>`;
  const ret = `<circle class="hl sW" cx="${x}" cy="${y}" r="5"/><path class="hl sW" d="M${x - 9},${y} L${x - 6},${y} M${x + 6},${y} L${x + 9},${y} M${x},${y - 9} L${x},${y - 6} M${x},${y + 6} L${x},${y + 9}"/>`;
  const pop = `<g class="pz on" data-g="ch" data-i="0"><circle class="hl dash sW" cx="${x}" cy="${y}" r="${RR - 12}"/></g>`;
  chooserEl().innerHTML = ret + pop + full;
  G.chooser = { t };
  setTimeout(() => { if (G.chooser) chooserEl().querySelectorAll('[data-g="ch"]').forEach(el => el.classList.toggle("on", el.dataset.i === "1")); }, 70);
  hover.classList.remove("show");
}
function closeChooser() { const c = chooserEl(); if (c) c.innerHTML = ""; G.chooser = null; }
function cancelAll() { closeChooser(); if (G.using) { G.using = null; hud(); } }

frame.addEventListener("pointermove", (e) => {
  if (G.busy || G.chooser) { hover.classList.remove("show"); return; }
  const id = hsFrom(e.target), item = e.target.closest && e.target.closest("[data-item]");
  let label = "";
  if (G.using) label = `Use ${ITEMS[G.using].name} on ${id ? hsLabel(id) : item ? ITEMS[item.dataset.item].name : "…"}`;
  else label = id ? hsLabel(id) : item ? ITEMS[item.dataset.item].name : "";
  if (!label) { hover.classList.remove("show"); return; }
  const r = frame.getBoundingClientRect();
  hover.textContent = label; hover.classList.add("show");
  let lx = e.clientX - r.left + 14; const w = hover.offsetWidth;
  if (lx + w > r.width - 6) lx = e.clientX - r.left - w - 14;
  hover.style.left = lx + "px"; hover.style.top = (e.clientY - r.top + 16) + "px";
});
frame.addEventListener("contextmenu", (e) => { e.preventDefault(); if (!G.busy) cancelAll(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !G.busy) cancelAll(); });

svg.addEventListener("click", (e) => {
  if (G.busy) return;
  const opt = e.target.closest(".opt");
  if (opt) { const t = G.chooser.t; closeChooser(); t.type === "item" ? itemAct(t.id, opt.dataset.opt) : act(t.id, opt.dataset.opt, t.x); return; }
  if (G.chooser) closeChooser();
  const it = e.target.closest("[data-item]");
  if (it) {
    const id = it.dataset.item;
    if (G.using && G.using !== id) { G.using = null; hud(); say("You hold them together. Nothing. They don't even seem to like each other."); return; }
    if (G.using === id) { G.using = null; hud(); return; }
    openChooser({ type: "item", id }, 174 + G.inv[G.mode].indexOf(id) * 30, 327); return;
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
  const h = HS[G.room][id][G.mode], sc = h.score || {};
  snapshot();
  if (v === "look") { face(cx ?? R().stand[id]?.[0] ?? G.actor.x);
    (async () => { await respond(h.look); if (sc.look) addScore(...sc.look); await afterAction(); })(); return; }
  if (v === "go") { goStand(id, () => { const [room, entry] = h.go.split("@"); loadRoom(room, entry); afterAction(); }); return; }
  goStand(id, async () => { await respond(h[v]); if (sc[v]) addScore(...sc[v]); await afterAction(); });
}
function itemAct(id, v) {
  const it = ITEMS[id];
  if (v === "look") { respond(typeof it.look === "function" ? it.look(api) : it.look); return; }
  if (v === "use") { G.using = id; hud(); return; }
  if (it[v]) respond(it[v]);
}
const NOPE = ["That doesn't work. Not even in theory.", "You try. Physics declines.", "No. Peer review would reject that too.", "Interesting hypothesis. Wrong, but interesting."];
function useItemOn(item, id, x) {
  snapshot();
  let r = (WITH[G.room + "." + id] || {})[item];
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
  const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), stepLen = 9 * R().pp.kAtY(a.y) + 3;
  if (d <= stepLen) { a.x = a.tx; a.y = a.ty; a.walking = false; render(); const cb = a.cb; a.cb = null; cb && cb(); return; }
  a.x += dx / d * stepLen; a.y += dy / d * stepLen; if (Math.abs(dx) > 1) a.dir = dx > 0 ? 1 : -1; a.step++; render();
}, 120);

/* ================================================================ *
 *  AMBIENT POSE CLOCKS
 * ================================================================ */
function poseSet(group, i) { document.querySelectorAll(`#game [data-g="${group}"]`).forEach(el => el.classList.toggle("on", +el.dataset.i === i)); }
const clocks = { nod: 800, tail: 650, parm: 1700, brett: 900, phone: 1100, saver: 1500, hum: 420 };
for (const [g, ms] of Object.entries(clocks)) { let i = 0; setInterval(() => poseSet(g, i ^= 1), ms); }
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
 *  START
 * ================================================================ */
window.GC = { G, api, act, itemAct, useItemOn, loadRoom, walkTo, runConvo };   // for testing
async function start() {
  if (location.hash === "#night") { G.flags = { recorded: true, officeHours: true, fedMorris: true, morrisMoved: true, noteReady: true, noteRead: true, pizzaGone: false };
    G.mode = "night"; G.min = 133; frame.classList.add("night"); loadRoom("hall", "start"); return; }
  loadRoom("seminar", "start");
  await showCard(`${centered("GAIN CONTROL", 112, 44, "sW", 2.2)}${cchip("A MURDER MYSTERY WITH ERROR BARS", 180, 7, "fR")}
    ${centered("ACT I  SUBMISSION", 222, 7, "sA", 1.1)}${centered("CLICK TO BEGIN", 290, 4.6, "sM", .8)}`, { auto: 0, hold: 300 });
  await showCard(dayCard("MONDAY", "ACT I  SUBMISSION", "JOURNAL CLUB  SEMINAR RM 101  16:07", "fA"), { auto: 2600 });
  await say("Nell Null. Fifth-year, Adline Lab. Eleven months of null results. Thesis defense on Friday.\n\nToday at journal club, Preston Valu is presenting the paper of the decade.\n\nOn a scanner the building doesn't have.");
}
start();
