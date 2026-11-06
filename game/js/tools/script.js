// GAIN CONTROL — Script Room. The whole story bible, read live from js/story/actN.js, editable as overrides.
import { seg, chip } from "../gfx.js";
import { loadActs, loadEngineInfo, loadRoom, buildModel, locName } from "./analyze.js";
import { readFile, writeLocal } from "./overrides.js";
import { S, esc, actName, KEYS, current, isChanged, changedCount, allOverrides, lnHTML, startEdit, setText, effChips, playBtn, anchorOf,
  sideSpeaker, whoChip, portrait, toast } from "./ui.js";
import { renderLogic, renderList, selectNode } from "./graph.js";

const $ = (s, r = document) => r.querySelector(s);
const main = $("#main"), side = $("#side");

/* ================================================================ *
 *  BOOT
 * ================================================================ */
async function boot() {
  applyPalette();
  $("#logo").innerHTML = seg("GAIN CONTROL", 0, 7, 13, "sW", 1.4) + chip("SCRIPT ROOM", 128, 5, 9.5, "fA");
  const [acts, info, file] = await Promise.all([loadActs(), loadEngineInfo(), readFile()]);
  S.acts = acts; S.info = info; S.file = file;
  const ITEMS = (acts.find(a => a.mod && a.mod.ITEMS) || {}).mod?.ITEMS || {};
  S.model = buildModel(acts, ITEMS);
  for (const a of S.model.acts) for (const R of a.rooms) await loadRoom(R.id, info);
  readHash();
  S.caps = localStorage.getItem("gaincontrol.script.caps") !== "0";
  document.body.classList.toggle("caps", S.caps);
  S.onChange = () => { updateCount(); renderSide(); };
  updateCount(); render();
}
function readHash() {
  const h = /^#(\d+)?(?:\.(\w+))?/.exec(location.hash);
  if (h && h[1] && S.model.acts.some(a => a.n === +h[1])) S.act = +h[1];
  if (h && h[2] && ["script", "logic", "list"].includes(h[2])) S.view = h[2];
}
window.addEventListener("hashchange", () => { if (!S.model) return; readHash(); S.q = ""; S.changedOnly = false; $("#search").value = ""; render(); window.scrollTo(0, 0); });
async function applyPalette() {
  try {
    const css = await (await fetch(new URL("../../css/game.css", import.meta.url))).text();
    const block = (re) => { const m = re.exec(css); const o = {}; if (m) for (const v of m[1].matchAll(/--(\w+):\s*([^;]+);/g)) o[v[1]] = v[2].trim(); return o; };
    S.palette = { day: block(/#frame\s*\{([^}]*)\}/), night: block(/#frame\.night\s*\{([^}]*)\}/) };
    setPalette();
  } catch (e) {}
}
function setPalette() {
  const p = S.palette && S.palette[S.night ? "night" : "day"]; if (!p) return;
  for (const [k, v] of Object.entries(p)) document.documentElement.style.setProperty("--" + k, v);
  $("#palette").textContent = S.night ? "DAY" : "NIGHT";
}
function updateCount() { const n = changedCount(); $("#nEdits").textContent = String(n).padStart(2, "0"); }
const actOf = (n = S.act) => S.model.acts.find(a => a.n === n);

/* ================================================================ *
 *  RENDER
 * ================================================================ */
function render() {
  document.querySelectorAll("#views button").forEach(b => b.classList.toggle("on", b.dataset.view === S.view && !S.q && !S.changedOnly));
  $("#changed").classList.toggle("on", S.changedOnly);
  main.className = ""; renderSide();
  if (S.q || S.changedOnly) { renderResults(); return; }
  const a = actOf(); if (!a) { main.innerHTML = `<div class="empty">NO ACTS FOUND.</div>`; return; }
  if (S.view === "logic") { main.className = "logic"; renderLogic(main, a); return; }
  if (S.view === "list") { main.innerHTML = renderList(a); return; }
  main.innerHTML = renderScript(a);
}

/* ---------------- sidebar ---------------- */
function renderSide() {
  const tabs = S.model.acts.map(a => {
    const t = a.title ? a.title.map(e => e ? current(e) : "").join(" ") : "";
    return `<button class="acttab${a.n === S.act ? " on" : ""}${a.error ? " err" : ""}" data-act="${a.n}" title="${esc(a.error || t)}"><span class="n">ACT ${actName(a.n)}</span><span class="t">${esc(a.error ? "LOAD ERROR" : (a.title && a.title[1] ? current(a.title[1]) : ""))}</span></button>`;
  }).join("");
  const a = actOf(); let toc = "";
  if (a && !a.error) {
    const dot = (pred) => pred ? `<span class="dot"></span>` : "";
    const ch = (list) => list.some(e => e && isChanged(e));
    const roomEntries = (R) => R.hotspots.flatMap(H => [H.label, ...H.keys.flatMap(K => K.verbs.flatMap(V => [V.entry, ...(V.fn ? V.fn.lits : [])]))]).concat(a.withs.filter(V => V.room === R.id).flatMap(V => [V.entry, ...(V.fn ? V.fn.lits : [])]));
    const convEntries = (C) => C.lines.flatMap(l => l.choice ? l.choice.flatMap(o => [o.text, ...o.lines.map(x => x.entry)]) : [l.entry]).concat(C.after ? C.after.lits : []);
    if (S.view === "script") {
      toc += `<div class="toc"><h4>THE ACT</h4><a href="#" data-goto="${a.n}|acttext-${a.n}">TITLE, OPENING, ENDING</a><a href="#" data-goto="${a.n}|gates-${a.n}">MILESTONES <small>${a.gates.length}</small></a>`;
      toc += `<h4>ROOMS</h4>` + a.rooms.map(R => `<a href="#" data-goto="${a.n}|room-${a.n}-${R.id}">${esc(roomName(R.id))}${dot(ch(roomEntries(R)))}<small>${R.hotspots.length}</small></a>`).join("");
      toc += `<h4>CONVERSATIONS</h4>` + a.convos.map(C => `<a href="#" class="sub" data-goto="${a.n}|cv-${a.n}-${C.name}">${esc(C.name)} <small>${esc(portrait(C.R).name)}</small>${dot(ch(convEntries(C)))}</a>`).join("");
      toc += `<h4>ITEMS</h4>` + a.items.map(I => `<a href="#" class="sub" data-goto="${a.n}|it-${I.id}">${esc(I.name ? current(I.name) : I.id)}</a>`).join("");
      if (a.helpers.length || a.other.length) toc += `<h4>HELPERS & OTHER STRINGS</h4>` + a.helpers.filter(h => h.lits.length).map(h => `<a href="#" class="sub" data-goto="${a.n}|hp-${a.n}-${h.name}">${esc(h.name)}()</a>`).join("");
      toc += `</div>`;
    } else {
      toc += `<div class="toc"><h4>MILESTONES</h4>` + a.gates.map(g => `<a href="#" data-node="${a.n}|${g.id}">${esc(g.label)} <small>${esc(gateText(g))}</small></a>`).join("");
      const flags = a.graph.nodes.filter(n => n.kind === "flag").sort((x, y) => x.label.localeCompare(y.label));
      toc += `<h4>FLAGS <small>${flags.length}</small></h4>` + flags.map(n => `<a href="#" class="sub" data-node="${a.n}|${n.id}">${esc(n.label)}</a>`).join("");
      const items = a.graph.nodes.filter(n => n.kind === "item");
      toc += `<h4>ITEMS</h4>` + items.map(n => `<a href="#" class="sub" data-node="${a.n}|${n.id}">${esc(n.label)}</a>`).join("");
      toc += `<h4>CONVERSATIONS</h4>` + a.graph.nodes.filter(n => n.kind === "convo").map(n => `<a href="#" class="sub" data-node="${a.n}|${n.id}">${esc(n.label)}</a>`).join("") + `</div>`;
    }
  }
  side.innerHTML = `<div class="acttabs">${tabs}</div>${toc}`;
}
const roomName = (id) => (S.info.rooms[id] && S.info.rooms[id].name) || id.toUpperCase();
export const gateText = (g) => [...g.conds.map(c => (c[0] === "mode" ? "" : c[0] + " ") + c[1].replace(/^=/, "")), ...g.cond.filter(([k]) => !g.latch.includes(k)).map(([k, r]) => (r.pos ? "" : "not ") + k)].join(" · ");

/* ---------------- the script ---------------- */
function renderScript(a) {
  let h = `<h1 class="act"><svg class="seg" viewBox="0 0 ${12 + 400} 40" style="width:412px">${seg("ACT " + actName(a.n), 0, 6, 28, "sW", 1.7)}</svg></h1>`;
  if (a.error) return h + `<div class="err-banner">act${a.n}.js didn't load:\n${esc(a.error)}\n\nIt's probably mid-edit. Reload when it's saved.</div>`;
  h += `<div class="actsub">${esc((a.title || []).map(e => e ? current(e) : "").join("  ·  "))}  ·  ${a.rooms.length} ROOMS  ·  ${a.convos.length} CONVERSATIONS  ·  js/story/act${a.n}.js</div>`;
  h += actText(a) + gates(a);
  h += `<div class="sec"><h2>ROOMS</h2></div>` + a.rooms.map(R => room(a, R)).join("");
  h += `<div class="sec"><h2>CONVERSATIONS</h2></div>` + a.convos.map(C => convo(a, C)).join("");
  h += `<div class="sec"><h2>ITEMS</h2></div>` + a.items.map(I => item(a, I)).join("") + otherActItems(a);
  h += helpers(a);
  return h;
}
function actText(a) {
  const st = a.fns.find(f => f.name === "start"), sw = a.fns.find(f => f.name === "onSwitch");
  let h = `<div class="sec" id="acttext-${a.n}"><h2>TITLE · OPENING · ENDING</h2></div>`;
  if (a.title) h += a.title.map((e, i) => e ? `<div class="kv"><span class="k">TITLE ${i + 1}</span>${lnHTML(e)}</div>` : "").join("");
  if (st) h += `<div class="kv"><span class="k">OPENING<br>${playBtn(a.n, startKey(a), null, "PLAY")}</span>${fnBlock(st.r, a)}</div>`;
  if (sw) h += `<div class="kv"><span class="k">ON SWITCH</span>${fnBlock(sw.r, a)}</div>`;
  h += a.end.map(([k, e]) => `<div class="kv"><span class="k">END ${esc(k)}</span>${lnHTML(e)}</div>`).join("");
  return h;
}
const startKey = (a) => a.graph.startMode || "day";
function gates(a) {
  let h = `<div class="sec" id="gates-${a.n}"><h2>MILESTONES · check()</h2></div>`;
  if (!a.gates.length) return h + `<div class="empty">No if() gates found in check().</div>`;
  return h + a.gates.map(g => `<div class="gatebox"><div class="gh"><b>${esc(g.label)}</b>${g.conds.map(c => `<span class="ch">${esc(c[0].toUpperCase() + " " + c[1])}</span>`).join("")}
    ${g.cond.filter(([k]) => !g.latch.includes(k)).map(([k, r]) => `<button class="ch ${r.pos ? "r" : "g"}" data-node="${a.n}|flag:${esc(k)}">${esc(k)}</button>`).join("")}
    <span class="nav">→</span>${effChips({ ...g.eff, reads: new Map() }, a.n)}<button class="btn" data-node="${a.n}|${g.id}" style="margin-left:auto">SHOW IN GRAPH</button></div>
    ${g.lits.map(e => lnHTML(e)).join("")}${[...g.eff.helpers].map(n => viaHelper(a, n)).join("")}</div>`).join("");
}
function room(a, R) {
  const keys = KEYS.filter(k => R.hotspots.some(H => H.keys.some(K => K.key === k)));
  const withs = a.withs.filter(V => V.room === R.id);
  const orphanW = withs.filter(V => !R.hotspots.some(H => H.id === V.id));
  return `<div class="room" id="room-${a.n}-${R.id}"><h3><svg class="seg" viewBox="0 0 400 20" style="width:400px">${seg(roomName(R.id), 0, 3, 14, "sW", 1.3)}</svg><code>${esc(R.id)}</code>
    <span style="margin-left:auto;display:flex;gap:4px">${keys.map(k => playBtn(a.n, k, R.id)).join("")}</span></h3>
    ${R.hotspots.map(H => hotspot(a, R, H, withs.filter(V => V.id === H.id))).join("")}
    ${orphanW.length ? `<div class="hs"><div class="hs-h"><span class="hs-name">OTHER USE-ONS</span></div><div class="keys">${withRow(a, orphanW, true)}</div></div>` : ""}</div>`;
}
function hotspot(a, R, H, withs) {
  shown = new Set(); try { return hotspotHTML(a, R, H, withs); } finally { shown = null; }
}
function hotspotHTML(a, R, H, withs) {
  const name = H.label ? lnHTML(H.label) : H.labelFn ? `<span class="hs-name">${esc(H.id)}</span>${fnBlock(H.labelFn, a, true)}` : `<span class="hs-name">${esc(H.id)}</span>`;
  const labels = (S.info.rooms[R.id] || {}).labels || {};
  const rows = H.keys.map(K => {
    const L = (labels[K.key] || labels[K.key === "morning" ? "day" : K.key] || {})[H.id] || {};
    return `<div class="krow"><span class="kchip k-${K.key}">${esc(K.key.toUpperCase())}</span><div class="verbs">
      ${K.shared ? `<span class="shared">Shared with <code>${esc(K.shared)}</code>. Edits change both.</span>` : ""}
      ${K.verbs.map(V => {
        const vb = V.verb.startsWith("go:") ? (L[V.verb.slice(3)] || "GO " + V.verb.slice(3).toUpperCase()) : (L[V.verb] || (V.verb === "go" ? L.use : "") || V.verb.toUpperCase());
        const pts = K.score && K.score[V.verb] ? `<span class="pts">+${K.score[V.verb][1]}</span>` : "";
        return `<div class="vrow"><span class="verb">${esc(vb)}${pts}</span><div>${verbBody(a, V, K.key, R.id)}</div></div>`;
      }).join("")}</div></div>`;
  }).join("") + (withs.length ? withRow(a, withs) : "");
  return `<div class="hs" id="hs-${a.n}-${R.id}-${H.id}"><div class="hs-h">${H.label ? `<div class="hs-name">${lnHTML(H.label)}</div>` : name}<code>${esc(H.id)}</code></div><div class="keys">${rows}</div></div>`;
}
function withRow(a, withs, showHs) {
  return `<div class="krow"><span class="kchip k-with">USE ON</span><div class="verbs">${withs.map(V =>
    `<div class="vrow"><span class="verb" style="color:var(--B)">${esc(V.item)}${showHs ? " → " + esc(V.id) : ""}</span><div>${verbBody(a, V, null, V.room)}</div></div>`).join("")}</div></div>`;
}
function verbBody(a, V, key, room) {
  if (V.entry) return lnHTML(V.entry);
  if (V.convo) return `<div class="link">→ <button data-convo="${a.n}|${esc(V.convo)}">CONVERSATION: ${esc(V.convo)}</button> ${key ? playBtn(a.n, key, room, "PLAY", { convo: V.convo }) : ""}</div>`;
  if (V.nav) return `<div class="nav">→ ${esc(roomName(V.nav.split("@")[0]))} <code>${esc(V.nav)}</code></div>`;
  if (V.fn) return fnBlock(V.fn, a);
  return "";
}
function fnBlock(r, a, compact) {
  const helpersHtml = [...r.eff.helpers].map(n => viaHelper(a, n, r.S && r.S.act)).join("");
  return `<div class="fn"><div class="fx"><span class="f" title="A function: its logic isn't editable here, but its lines are">ƒ</span>${effChips(r.eff, a.n)}</div>
    ${r.lits.map(e => lnHTML(e)).join("")}${helpersHtml}
    ${compact ? "" : `<details class="src"><summary>SOURCE</summary><pre>${esc(r.fn.toString())}</pre></details>`}</div>`;
}
let shown = null;    // helpers already printed in this hotspot (look and use often share one)
function viaHelper(a, name, actN = a.n) {
  const A = actOf(actN) || a, h = A.helpers.find(x => x.name === name);
  if (!h || !h.lits.length) return "";
  if (shown) { if (shown.has(name)) return `<div class="via">VIA <code>${esc(name)}()</code> · SAME LINES AS ABOVE</div>`; shown.add(name); }
  return `<div class="via">VIA <code>${esc(name)}()</code></div>${h.lits.map(e => lnHTML(e)).join("")}`;
}
function convo(a, C) {
  const n = a.graph.nodes.find(x => x.id === "convo:" + C.name) || { openers: [] };
  const openers = convoOpeners(a, C.name);
  const p1 = openers.find(o => o.loc && o.loc.key && o.loc.room);
  const L = sideSpeaker(C, "L"), Rr = sideSpeaker(C, "R");
  const line = (l, sub) => {
    const sp = sideSpeaker(C, l.side);
    return `<div class="cl${l.side === "N" ? " n" : ""}"><div class="cue">${l.side === "N" ? `<span class="who" style="background:var(--D);color:var(--W)">NARRATOR</span>` : whoChip(sp.name, sp.c)}${l.fx ? `<span class="fxtag">${esc(String(l.fx).toUpperCase())}</span>` : ""}</div>${lnHTML(l.entry, { color: l.side === "N" ? "M" : sp.c })}</div>`;
  };
  const body = C.lines.map(l => l.choice ? `<div class="choice"><div class="hd">${esc(L.name)} CHOOSES${l.retry ? " · WRONG ANSWERS LOOP BACK" : ""}</div>${l.choice.map((o, i) =>
    `<div class="opt${o.correct ? " ok" : ""}"><div class="opt-h"><b>${i + 1}</b>${lnHTML(o.text, { color: L.c })}</div>${o.correct || o.score ? `<div class="ok-tag">${o.correct ? "CORRECT" : ""}${o.score ? ` +${o.score[1]}` : ""}</div>` : ""}
      ${o.lines.length ? `<div class="sub-lines">${o.lines.map(x => line(x)).join("")}</div>` : ""}</div>`).join("")}</div>` : line(l)).join("");
  return `<div class="convo" id="cv-${a.n}-${C.name}"><div class="convo-h"><span class="nm">${esc(C.name)}</span>${whoChip(L.name, L.c)}<span class="nav">×</span>${whoChip(Rr.name, Rr.c)}
    ${C.score ? `<span class="pts">+${C.score[1]} H-INDEX</span>` : ""}<span style="margin-left:auto;display:flex;gap:4px">${p1 ? playBtn(a.n, p1.loc.key, p1.loc.room, "PLAY", { convo: C.name }) : ""}<button class="btn" data-node="${a.n}|convo:${esc(C.name)}">GRAPH</button></span></div>
    <div class="convo-meta"><span class="lbl">OPENED BY</span>${openers.length ? openers.map(o => `<button class="opener" data-goto="${a.n}|${o.anchor}">${esc(o.name)}</button>`).join("") : `<span class="none">nothing found (opened from another act or by code the analysis can't see)</span>`}
    ${C.after ? `<span class="lbl" style="margin-left:10px">AFTER</span>${effChips(C.after.eff, a.n)}` : ""}</div>
    ${C.after && C.after.lits.length ? `<div style="padding:4px 12px 0">${C.after.lits.map(e => lnHTML(e)).join("")}</div>` : ""}
    <div class="lines">${body}</div></div>`;
}
export function convoOpeners(a, name) {
  const out = [], n = a.graph.nodes.find(x => x.id === "convo:" + name);
  if (n) for (const l of n.openers) out.push({ loc: l, name: locName(l) + (l.key ? " · " + l.key : ""), anchor: anchorOf(a.n, l) });
  for (const e of a.graph.edges) if (e.to === "convo:" + name && e.kind === "open") {
    const src = a.graph.nodes.find(x => x.id === e.from);
    if (src && src.locs) for (const l of src.locs) out.push({ loc: l, name: locName(l) + (l.key ? " · " + l.key : ""), anchor: anchorOf(a.n, l) });
    else if (src) out.push({ loc: null, name: src.label, anchor: src.kind === "gate" ? `gates-${a.n}` : "" });
  }
  return out;
}
function item(a, I) {
  return `<div class="item" id="it-${I.id}"><div class="hs-h">${I.name ? `<div class="hs-name">${lnHTML(I.name)}</div>` : ""}<code>${esc(I.id)}</code></div><div class="verbs">
    ${I.verbs.map(V => `<div class="vrow"><span class="verb">${esc(V.verb.toUpperCase())}</span><div>${V.entry ? lnHTML(V.entry) : V.fn ? (isWrapper(V.fn, I.id) ? wrapperNote(V.fn) : fnBlock(V.fn, a)) : ""}</div></div>`).join("")}
    ${itemVariants(I.id)}</div></div>`;
}
// a later act replaced this look with a function that picks a version by act
const isWrapper = (r, id) => !r.lits.length && !r.eff.reads.size && !r.eff.writes.size && S.model.acts.some(A => A.other.some(o => itemOf(o) === id));
const wrapperNote = (r) => `<div class="fn"><div class="fx"><span class="f">ƒ</span><span class="hint" style="color:var(--M);font-size:14px">Chooses one of the versions below by act.</span></div><details class="src"><summary>SOURCE</summary><pre>${esc(r.fn.toString())}</pre></details></div>`;
// the same item's text as other acts wrote it (wrapLook / earlier versions replaced by a wrapper)
function itemOf(o) {
  const own = S.model.itemOwner;
  if (o.unit.kind === "expr" && o.unit.arg && own[o.unit.arg] != null) return o.unit.arg;
  if (o.keyPath[1] && own[o.keyPath[1]] != null && (o.keyPath[0] === "ITEMS" || o.unit.callee === "Object")) return o.keyPath[1];
  return null;
}
function itemVariants(id) {
  return S.model.acts.map(A => {
    const lits = A.other.filter(o => itemOf(o) === id).map(o => o.entry);
    if (!lits.length) return "";
    const uniq = [...new Set(lits)];
    return `<div class="vrow"><span class="verb">LOOK<br><span style="color:var(--M);font-weight:400">ACT ${actName(A.n)} TEXT</span></span><div class="fn"><div class="fx"><span class="f">ƒ</span><span class="ch h">${esc(A.other.find(o => itemOf(o) === id).unit.name)}</span></div>${uniq.map(e => lnHTML(e)).join("")}</div></div>`;
  }).join("");
}
function otherActItems(a) {
  // items owned by another act but re-described here are shown with their owner; point to them
  const ids = [...new Set(a.other.map(itemOf).filter(id => id && S.model.itemOwner[id] !== a.n))];
  if (!ids.length) return "";
  return `<div class="kv"><span class="k">ALSO REWRITTEN</span><div>${ids.map(id => `<button class="ch" data-goto="${S.model.itemOwner[id]}|it-${id}">${esc(id)} (ACT ${actName(S.model.itemOwner[id])})</button>`).join(" ")}
    <span class="hint" style="color:var(--M);font-size:13px">This act changes how these look. The text is listed with each item, under the act that first defines it.</span></div></div>`;
}
function helpers(a) {
  const hs = a.helpers.filter(h => h.lits.length);
  const others = a.other.filter(o => !itemOf(o));
  if (!hs.length && !others.length) return "";
  let h = `<div class="sec"><h2>HELPERS & OTHER STRINGS</h2></div>`;
  h += hs.map(x => `<div class="helper" id="hp-${a.n}-${x.name}"><div class="hh"><code>${esc(x.name)}()</code><span class="nav">used by</span>${usersOf(a, x.name)}</div>${x.lits.map(e => lnHTML(e)).join("")}</div>`).join("");
  const byUnit = new Map(); for (const o of others) { if (!byUnit.has(o.unit.name)) byUnit.set(o.unit.name, []); byUnit.get(o.unit.name).push(o); }
  for (const [u, list] of byUnit) h += `<div class="helper" id="ot-${a.n}-${u}"><div class="hh"><code>${esc(u)}</code></div>${[...new Set(list.map(o => o.entry))].map(e => lnHTML(e)).join("")}</div>`;
  return h;
}
function usersOf(a, name) {
  const users = [...S.model.fnRecs.values()].filter(r => r.act === a.n && r.eff.helpers.has(name));
  return users.map(r => r.locs[0]).map(l => `<button class="ch" data-goto="${a.n}|${anchorOf(a.n, l)}">${esc(locName(l))}</button>`).join("") || `<span class="none">—</span>`;
}

/* ---------------- search & changed ---------------- */
function crumb(e) {
  const a = e.act, w = e.lit ? (e.wheres || [])[0] : e.where;
  let label = "";
  if (e.lit) label = locName(w) + (w && w.key ? " · " + w.key : "") + ((e.wheres || []).length > 1 ? `  +${e.wheres.length - 1} MORE` : "");
  else if (Array.isArray(w)) label = w.length === 1 ? "conversation · " + w[0] : w.join(" · ");
  return `<div class="crumb"><span class="actc">ACT ${actName(a)}</span><button data-goto="${a}|${anchorOf(a, w)}">${esc(label)}</button></div>`;
}
function renderResults() {
  const q = S.q.toLowerCase();
  const entries = [...S.model.entries.values()].filter(e => {
    if (S.changedOnly && !isChanged(e)) return false;
    if (!q) return true;
    const t = current(e).toLowerCase(), o = e.orig.toLowerCase();
    return t.includes(q) || o.includes(q) || (e.path && e.path.toLowerCase().includes(q) && !e.lit);
  });
  let hits = "";
  if (q) {
    const ns = [];
    for (const a of S.model.acts) for (const n of (a.graph ? a.graph.nodes : [])) if ((n.kind === "flag" || n.kind === "item" || n.kind === "convo") && n.label.toLowerCase().includes(q)) ns.push([a, n]);
    hits = ns.slice(0, 40).map(([a, n]) => `<button class="ch ${n.kind === "flag" ? "w" : n.kind === "item" ? "i" : "c"}" data-node="${a.n}|${esc(n.id)}" title="Show in the logic graph">${n.kind.toUpperCase()} ${esc(n.label)} · ${actName(a.n)}</button>`).join("");
  }
  const orphans = S.changedOnly ? Object.entries(allOverrides()).filter(([k]) => !S.model.entries.has(k)) : [];
  const shown = entries.slice(0, 400);
  main.innerHTML = `<div class="results-h"><span class="n">${entries.length}</span><span class="l">${S.changedOnly ? "CHANGED LINES" : "LINES MATCH"} ${q ? `“${esc(S.q.toUpperCase())}”` : ""}${entries.length > shown.length ? " · SHOWING 400" : ""}</span>
    ${S.changedOnly ? `<button class="btn" id="revertAll" style="margin-left:auto">REVERT ALL LOCAL EDITS</button>` : ""}</div>
    ${hits ? `<div class="reshits">${hits}</div>` : ""}
    ${shown.map(e => `<div class="res">${crumb(e)}${lnHTML(e, { color: e.kind === "line" || e.kind === "choice" ? lineColor(e) : null })}</div>`).join("") || (orphans.length ? "" : `<div class="empty">NOTHING ${S.changedOnly ? "CHANGED YET" : "FOUND"}.</div>`)}
    ${orphans.length ? `<div class="sec"><h2>ORPHANED OVERRIDES</h2></div><div class="hint" style="color:var(--M);margin-bottom:8px">These edits point at text that no longer exists in the source (the line was rewritten or removed). They do nothing in game.</div>
      ${orphans.map(([k, v]) => `<div class="res"><div class="crumb"><code>${esc(k.length > 120 ? k.slice(0, 120) + "…" : k)}</code><button class="btn" data-drop="${esc(k)}">DELETE</button></div><div class="tx" style="cursor:default">${esc(v)}</div></div>`).join("")}` : ""}`;
}
function lineColor(e) {
  for (const a of S.model.acts) { const C = a.convos.find(c => c.name === e.convo); if (C) return e.side === "N" ? "M" : sideSpeaker(C, e.side).c; }
  return "W";
}

/* ================================================================ *
 *  NAVIGATION & EVENTS
 * ================================================================ */
export function goto(act, anchor) {
  S.q = ""; $("#search").value = ""; S.changedOnly = false;
  const re = S.act !== act || S.view !== "script" || !document.getElementById(anchor);
  S.act = act; S.view = "script"; if (re) render(); else renderSide();
  history.replaceState(null, "", `#${act}.script`);
  const el = anchor && document.getElementById(anchor);
  if (el) { el.scrollIntoView({ block: "start" }); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }
}
export function gotoNode(act, id) {
  S.q = ""; $("#search").value = ""; S.changedOnly = false;
  S.act = act; S.sel = id;
  if (S.view !== "logic") { S.view = "logic"; render(); } else { renderSide(); selectNode(id, true); }
  history.replaceState(null, "", `#${act}.logic`);
}
document.addEventListener("click", (ev) => {
  const t = ev.target;
  const tx = t.closest(".tx"); if (tx && tx.closest(".ln") && !tx.classList.contains("editing") && !t.closest("button, a")) { startEdit(tx); return; }
  const rev = t.closest(".rev"); if (rev) { const e = S.byUid.get(+rev.closest(".ln").dataset.u); if (e) { setText(e, e.orig); toast("REVERTED"); } return; }
  const was = t.closest(".wasbtn"); if (was) { was.closest(".ln").classList.toggle("showwas"); return; }
  const actb = t.closest("[data-act]"); if (actb) { S.act = +actb.dataset.act; S.sel = null; S.q = ""; $("#search").value = ""; S.changedOnly = false; history.replaceState(null, "", `#${S.act}.${S.view}`); render(); main.scrollTop = 0; window.scrollTo(0, 0); return; }
  const vb = t.closest("#views button"); if (vb) { S.view = vb.dataset.view; S.q = ""; $("#search").value = ""; S.changedOnly = false; history.replaceState(null, "", `#${S.act}.${S.view}`); render(); window.scrollTo(0, 0); return; }
  const g = t.closest("[data-goto]"); if (g) { ev.preventDefault(); const [a, an] = splitOnce(g.dataset.goto); goto(+a, an); return; }
  const nd = t.closest("[data-node]"); if (nd) { ev.preventDefault(); const [a, id] = splitOnce(nd.dataset.node); gotoNode(+a, id); return; }
  const cv = t.closest("[data-convo]"); if (cv) { const [a, name] = splitOnce(cv.dataset.convo); const act = S.model.convoAct[name] && !actOf(+a).convos.some(c => c.name === name) ? S.model.convoAct[name] : +a; goto(act, `cv-${act}-${name}`); return; }
  const dr = t.closest("[data-drop]"); if (dr) { delete S.local[dr.dataset.drop]; writeLocal(S.local); if (dr.dataset.drop in S.file) toast("STILL IN overrides.json"); updateCount(); render(); return; }
  if (t.closest("#revertAll")) { if (confirm("Revert every edit saved in this browser? (overrides.json is untouched.)")) { S.local = {}; writeLocal(S.local); updateCount(); render(); toast("ALL LOCAL EDITS REVERTED"); } return; }
});
const splitOnce = (s) => { const i = s.indexOf("|"); return [s.slice(0, i), s.slice(i + 1)]; };

let qT;
$("#search").addEventListener("input", (e) => { clearTimeout(qT); qT = setTimeout(() => { S.q = e.target.value.trim(); render(); window.scrollTo(0, 0); }, 140); });
$("#search").addEventListener("keydown", (e) => { if (e.key === "Escape") { e.target.value = ""; S.q = ""; render(); } });
$("#changed").addEventListener("click", () => { S.changedOnly = !S.changedOnly; render(); window.scrollTo(0, 0); });
$("#palette").addEventListener("click", () => { S.night = !S.night; setPalette(); });
$("#caseBtn").addEventListener("click", () => { S.caps = !S.caps; document.body.classList.toggle("caps", S.caps); localStorage.setItem("gaincontrol.script.caps", S.caps ? "1" : "0"); });
$("#export").addEventListener("click", () => {
  const out = {};
  for (const [k, v] of Object.entries(allOverrides())) { const e = S.model.entries.get(k); if (!e || v !== e.orig) out[k] = v; }
  const blob = new Blob([JSON.stringify(out, null, 2) + "\n"], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "overrides.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(`EXPORTED ${Object.keys(out).length} OVERRIDES`);
});
$("#import").addEventListener("click", () => $("#importFile").click());
$("#importFile").addEventListener("change", async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text()); if (!j || typeof j !== "object" || Array.isArray(j)) throw new Error("not an object");
    let n = 0; for (const [k, v] of Object.entries(j)) if (typeof v === "string" && k.includes("|")) { S.local[k] = v; n++; }
    writeLocal(S.local); updateCount(); render(); toast(`IMPORTED ${n} OVERRIDES`);
  } catch (err) { toast("THAT FILE ISN'T AN OVERRIDES.JSON"); }
  e.target.value = "";
});
window.addEventListener("storage", (e) => { if (e.key === "gaincontrol.overrides") { try { S.local = JSON.parse(e.newValue || "{}"); } catch (x) {} updateCount(); render(); } });

boot().catch(e => { main.innerHTML = `<div class="err-banner">The Script Room failed to start:\n${esc(e && e.stack || e)}</div>`; console.error(e); });
