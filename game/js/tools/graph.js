// GAIN CONTROL — Script Room: the logic graph (actions/convos/gates ↔ flags/items/shifts) and the plain list.
import { layout, chain, upstreamFlags, locName } from "./analyze.js";
import { S, esc, actName, lnHTML, effChips, playBtn, anchorOf, portrait } from "./ui.js";
import { gateText, convoOpeners, goto } from "./script.js";

const KCOL = { action: "W", start: "G", exp: "M", convo: "V", gate: "X", flag: "A", item: "B", mode: "G" };
const KEYCOL = { day: "B", night: "G", morris: "K", morning: "R" };
const ECOL = { write: ["A", ""], read: ["W", ""], guard: ["M", "4 3"], give: ["B", ""], take: ["B", ""], need: ["B", "2 3"], open: ["V", ""], mode: ["G", "6 4"], shift: ["G", "1 4"] };
let V = null;   // the live graph view: { a, L, k, x, y, byId }

/* ---------------- node text ---------------- */
function title(n) {
  if (n.kind === "flag") return n.label;
  if (n.kind === "item") return "◆ " + n.label;
  if (n.kind === "mode") return "→ " + n.label;
  if (n.kind === "gate") return n.label;
  if (n.kind === "start") return "ACT START";
  if (n.kind === "convo") return "CONVO · " + n.label;
  const l = n.locs && n.locs[0];
  if (!l) return n.label;
  if (l.t === "hs") return `${l.room} · ${l.id}`;
  if (l.t === "with") return `USE ${l.item}`;
  if (l.t === "item") return `ITEM ${l.item}`;
  if (l.t === "exp") return l.name + "()";
  return n.label;
}
function sub(n) {
  const e = n.eff, ic = [];
  if (e) { if (e.deaths.length) ic.push("DEATH"); if (e.endAct) ic.push("END ACT"); if (e.shifts.some(s => s.mode)) ic.push("SHIFT"); }
  if (n.kind === "gate") return gateText(n);
  if (n.kind === "convo") return [portrait(n.convo ? n.convo.R : "").name, ...ic].join(" · ");
  if (n.kind === "start") return ["start()", ...ic].join(" · ");
  const l = n.locs && n.locs[0];
  if (!l) return ic.join(" · ");
  const more = n.locs.length > 1 ? `+${n.locs.length - 1}` : "";
  if (l.t === "hs") return [l.verb.replace("go:", "go ").toUpperCase(), l.key && l.key !== "*" ? l.key.toUpperCase() : "", more, ...ic].filter(Boolean).join(" · ");
  if (l.t === "with") return [`ON ${l.room} · ${l.id}`, ...ic].join(" · ");
  if (l.t === "item") return [l.verb.toUpperCase(), ...ic].join(" · ");
  return ic.join(" · ");
}
const dims = (n) => n.kind === "flag" || n.kind === "item" || n.kind === "mode" ? { w: Math.min(230, 26 + title(n).length * 7.4), h: 24 } : { w: 224, h: n.kind === "gate" ? 42 : 38 };
const fit = (t, w, px) => { const max = Math.floor((w - 16) / px); return t.length > max ? t.slice(0, max - 1) + "…" : t; };
const nodeKey = (n) => n.locs && n.locs[0] && n.locs[0].key && n.locs[0].key !== "*" ? n.locs[0].key : n.kind === "convo" && n.modes && n.modes[0] ? n.modes[0] : n.locs && n.locs[0] && n.locs[0].t === "with" ? "with" : null;

function nodeSVG(n, p) {
  const { w, h } = dims(n), x = p.x, y = p.y + 18 - h / 2, c = KCOL[n.kind] || "W";
  const t = esc(fit(title(n), w, n.kind === "flag" || n.kind === "item" || n.kind === "mode" ? 7.4 : 8));
  if (n.kind === "flag" || n.kind === "item" || n.kind === "mode")
    return `<g class="gn" data-id="${esc(n.id)}"><rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="11" style="stroke:var(--${c})${n.kind === "mode" ? ";stroke-dasharray:5 3" : ""}"/>
      <text x="${x + 12}" y="${y + 16.5}" style="fill:var(--${c})${n.kind === "flag" ? ";font-family:ui-monospace,Menlo,monospace;font-size:12.5px" : ""}">${t}</text></g>`;
  const k = nodeKey(n), kc = k === "with" ? "A" : KEYCOL[k];
  const stripe = n.kind === "convo" ? portrait(n.convo ? n.convo.R : "").chip.slice(1) : kc;
  return `<g class="gn" data-id="${esc(n.id)}"><rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" style="stroke:var(--${c});${n.kind === "action" || n.kind === "exp" ? "stroke-opacity:.55" : ""}"/>
    ${n.kind === "gate" ? `<rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" style="stroke:var(--X);stroke-width:.6;fill:none"/>` : ""}
    ${stripe ? `<rect x="${x}" y="${y}" width="5" height="${h}" style="fill:var(--${stripe});stroke:none"/>` : ""}
    <text x="${x + 12}" y="${y + 16}" style="${n.kind === "gate" ? "fill:var(--X);font-weight:600;letter-spacing:.12em" : n.kind === "convo" ? "fill:var(--V)" : ""}">${t.toUpperCase()}</text>
    <text class="sm" x="${x + 12}" y="${y + h - 7}">${esc(fit(sub(n), w, 6.3)).toUpperCase()}</text>
    ${n.eff && n.eff.deaths.length ? `<rect x="${x + w - 9}" y="${y + 4}" width="5" height="5" style="fill:var(--R);stroke:none"/>` : ""}</g>`;
}
function edgeSVG(e, L) {
  const A = L.P.get(e.from), B = L.P.get(e.to); if (!A || !B) return "";
  const na = V.byId.get(e.from), nb = V.byId.get(e.to), wa = dims(na).w;
  const x1 = A.x + wa, y1 = A.y + 18, x2 = B.x, y2 = B.y + 18;
  const [c, dash] = ECOL[e.kind] || ["W", ""];
  let d;
  if (x2 > x1 + 4) { const dx = Math.max(30, (x2 - x1) / 2); d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`; }
  else { const drop = 40 + Math.abs(x1 - x2) * .08; d = `M${x1},${y1} C${x1 + 70},${y1 + drop} ${x2 - 70},${y2 + drop} ${x2},${y2}`; }
  return `<path class="ge" data-f="${esc(e.from)}" data-t="${esc(e.to)}" d="${d}" style="stroke:var(--${c});${e.kind === "read" ? "stroke-opacity:.45;" : e.kind === "shift" ? "stroke-opacity:.3;" : ""}${dash ? `stroke-dasharray:${dash};` : ""}" marker-end="url(#m-${c})"/>`;
}

/* ---------------- the view ---------------- */
export function renderLogic(main, a) {
  if (a.error) { main.className = ""; main.innerHTML = `<div class="err-banner">act${a.n}.js didn't load:\n${esc(a.error)}</div>`; return; }
  const L = layout(a.graph, { hidePassive: S.hidePassive, dims });
  V = { a, L, k: 1, x: 0, y: 0, byId: new Map(a.graph.nodes.map(n => [n.id, n])) };
  const markers = [...new Set(Object.values(ECOL).map(x => x[0]))].map(c => `<marker id="m-${c}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0.8 L7,4 L0,7.2" style="fill:none;stroke:var(--${c});stroke-width:1.2"/></marker>`).join("");
  const gates = a.gates.map(g => `<button class="gatechip" data-gate="${esc(g.id)}" title="${esc(g.src)}"><b>${esc(g.label)}</b>${esc(gateText(g))}</button>`).join("");
  main.innerHTML = `<div class="logic-wrap"><div class="logic-bar"><span class="lbl">MILESTONES</span>${gates || `<span class="none">none found in check()</span>`}
      <button class="btn${S.hidePassive ? " on" : ""}" id="passive" title="Hide LOOK and label functions that only read flags">HIDE PASSIVE LOOKS</button>
      <span class="legend"><span><i style="border-color:var(--A)"></i>SETS</span><span><i style="border-color:var(--W);opacity:.6"></i>NEEDS</span><span><i style="border-color:var(--M);border-top-style:dashed"></i>ONLY IF NOT</span><span><i style="border-color:var(--B)"></i>ITEM</span><span><i style="border-color:var(--V)"></i>OPENS</span><span><i style="border-color:var(--G);border-top-style:dashed"></i>SHIFT</span></span></div>
    <div id="canvas"><svg><defs>${markers}</defs><g id="vp">
      ${L.looseY != null ? `<text x="40" y="${L.looseY}" style="fill:var(--M);font-size:12px;letter-spacing:.16em">NOT CONNECTED TO ANYTHING ELSE</text><path d="M40,${L.looseY + 8} L${L.width - 40},${L.looseY + 8}" style="stroke:var(--D);stroke-width:1"/>` : ""}
      <g class="edges">${L.edges.map(e => edgeSVG(e, L)).join("")}</g>
      <g class="nodes">${L.nodes.map(n => nodeSVG(n, L.P.get(n.id))).join("")}</g></g></svg>
      <div class="zoomer"><button data-z="in" title="Zoom in">+</button><button data-z="out" title="Zoom out">−</button><button data-z="all" title="Show everything">◻</button></div></div>
    <div id="detail"></div></div>`;
  wire(main);
  fitView();
  if (S.sel && V.byId.has(S.sel)) selectNode(S.sel, true); else { S.sel = null; detail(null); }
}
function apply() { const g = document.getElementById("vp"); if (g) g.setAttribute("transform", `translate(${V.x},${V.y}) scale(${V.k})`); }
function fitView() {
  const c = document.getElementById("canvas"), r = c.getBoundingClientRect();
  // fit if that stays readable; otherwise start at a legible zoom from the left edge (pan to see the rest)
  V.k = Math.max(.62, Math.min(1, (r.width - 20) / V.L.width, (r.height - 20) / V.L.height));
  V.x = Math.max(10, (r.width - V.L.width * V.k) / 2); V.y = Math.max(6, (r.height - V.L.height * V.k) / 2 - 20); apply();
}
function zoomAt(f, mx, my) { const k = Math.max(.2, Math.min(2.5, V.k * f)); V.x = mx - (mx - V.x) * k / V.k; V.y = my - (my - V.y) * k / V.k; V.k = k; apply(); }
function wire(main) {
  const c = document.getElementById("canvas");
  c.addEventListener("wheel", (e) => { e.preventDefault(); const r = c.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey || e.altKey) zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0016)), e.clientX - r.left, e.clientY - r.top);   // pinch / ctrl+wheel
    else { V.x -= e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX; V.y -= e.shiftKey && !e.deltaX ? 0 : e.deltaY; apply(); } }, { passive: false });
  let drag = null;
  c.addEventListener("pointerdown", (e) => { if (e.target.closest(".zoomer")) return; drag = { x: e.clientX, y: e.clientY, vx: V.x, vy: V.y, moved: false }; c.setPointerCapture(e.pointerId); });
  c.addEventListener("pointermove", (e) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return; drag.moved = true; c.classList.add("drag"); V.x = drag.vx + dx; V.y = drag.vy + dy; apply(); });
  c.addEventListener("pointerup", (e) => {
    const d = drag; drag = null; c.classList.remove("drag"); if (!d || d.moved) return;
    const el = document.elementFromPoint(e.clientX, e.clientY), g = el && el.closest(".gn");
    if (g) selectNode(g.dataset.id); else { S.sel = null; highlight(null); detail(null); }
  });
  c.addEventListener("dblclick", (e) => { const el = document.elementFromPoint(e.clientX, e.clientY), g = el && el.closest(".gn"); const n = g && V.byId.get(g.dataset.id); const an = n && scriptAnchor(n); if (an) goto(V.a.n, an); });
  main.querySelector(".zoomer").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; const r = c.getBoundingClientRect();
    if (b.dataset.z === "all") { V.k = Math.max(.15, Math.min(1, (r.width - 20) / V.L.width, (r.height - 20) / V.L.height)); V.x = (r.width - V.L.width * V.k) / 2; V.y = 10; apply(); } else zoomAt(b.dataset.z === "in" ? 1.25 : .8, r.width / 2, r.height / 2); });
  main.querySelectorAll("[data-gate]").forEach(b => b.addEventListener("click", () => selectNode(b.dataset.gate, true)));
  main.querySelector("#passive").addEventListener("click", () => { S.hidePassive = !S.hidePassive; renderLogic(main, V.a); });
}
const scriptAnchor = (n) => n.kind === "convo" ? `cv-${V.a.n}-${n.label}` : n.kind === "gate" ? `gates-${V.a.n}` : n.locs ? anchorOf(V.a.n, n.locs[0]) : n.kind === "start" ? `acttext-${V.a.n}` : "";

export function selectNode(id, center) {
  if (!V || !V.byId.has(id)) return;
  S.sel = id; highlight(id); detail(V.byId.get(id));
  document.querySelectorAll(".gatechip").forEach(b => b.classList.toggle("on", b.dataset.gate === id));
  if (center) {
    const p = V.L.P.get(id); if (!p) return;
    const r = document.getElementById("canvas").getBoundingClientRect();
    if (V.k < .7) V.k = .85;
    V.x = r.width / 2 - (p.x + 100) * V.k; V.y = r.height / 2 - (p.y + 18) * V.k; apply();
  }
}
function highlight(id) {
  const svg = document.querySelector("#canvas svg"); if (!svg) return;
  if (!id) { svg.querySelectorAll(".dim, .hi, .sel").forEach(el => el.classList.remove("dim", "hi", "sel")); return; }
  const { up, down } = chain(V.a.graph, id);
  svg.querySelectorAll(".gn").forEach(g => { const i = g.dataset.id; g.classList.toggle("dim", !up.has(i) && !down.has(i)); g.classList.toggle("sel", i === id); });
  svg.querySelectorAll(".ge").forEach(p => { const f = p.dataset.f, t = p.dataset.t, on = (up.has(f) && up.has(t)) || (down.has(f) && down.has(t));
    p.classList.toggle("dim", !on); p.classList.toggle("hi", on); });
}

/* ---------------- the side panel ---------------- */
export const nodeLink = (a, n) => n ? `<button class="nodeln ${n.kind === "flag" ? "flag" : n.kind === "item" ? "item" : ""}" data-node="${a.n}|${esc(n.id)}">${esc(title(n))}${n.kind !== "flag" && n.kind !== "item" && sub(n) ? ` <span style="color:var(--M)">${esc(sub(n))}</span>` : ""}</button>` : "";
const links = (a, ids) => ids.length ? ids.map(id => nodeLink(a, a.graph.nodes.find(n => n.id === id))).join("") : `<span class="none">—</span>`;
const ins = (a, n, kinds) => a.graph.edges.filter(e => e.to === n.id && kinds.includes(e.kind)).map(e => e.from);
const outs = (a, n, kinds) => a.graph.edges.filter(e => e.from === n.id && kinds.includes(e.kind)).map(e => e.to);
function linesOf(a, rec) {
  if (!rec) return "";
  const hs = [...rec.eff.helpers].map(name => (S.model.acts.find(x => x.n === (rec.S ? rec.S.act : a.n)) || a).helpers.find(h => h.name === name)).filter(h => h && h.lits.length);
  return rec.lits.map(e => lnHTML(e)).join("") + hs.map(h => `<div class="via">VIA <code>${esc(h.name)}()</code></div>` + h.lits.map(e => lnHTML(e)).join("")).join("");
}
function detail(n) {
  const el = document.getElementById("detail"); if (!el) return;
  const a = V.a;
  if (!n) {
    el.innerHTML = `<div class="ttl">ACT ${actName(a.n)} LOGIC</div>
      <p class="hint">Every action that reads or changes state, laid out left to right in dependency order: what sets a flag sits to the left of what needs it. Click a node to light up everything upstream and downstream of it; double-click to open it in the script. Drag or scroll to pan; pinch or ctrl-scroll to zoom.</p>
      <h5>MILESTONES (check())</h5>${a.gates.map(g => `<div class="loc">${nodeLink(a, g)}</div>`).join("") || `<span class="none">—</span>`}
      <h5>COUNTS</h5><p class="hint">${["action", "convo", "flag", "item"].map(k => `${a.graph.nodes.filter(x => x.kind === k).length} ${k === "action" ? "actions" : k + "s"}`).join(" · ")} · ${a.graph.edges.length} links</p>
      <h5>KEY</h5><p class="hint"><span style="color:var(--B)">▌</span>day <span style="color:var(--K)">▌</span>Morris <span style="color:var(--G)">▌</span>night <span style="color:var(--R)">▌</span>morning <span style="color:var(--A)">▌</span>use-item-on. A red corner marks a death.</p>`;
    return;
  }
  const kc = KCOL[n.kind] || "W";
  let h = `<span class="kind" style="background:var(--${kc})">${n.kind === "action" ? "ACTION" : n.kind.toUpperCase()}</span><div class="ttl">${esc(title(n))}</div>`;
  if (n.kind === "flag") {
    const set = ins(a, n, ["write"]), need = outs(a, n, ["read"]), guard = outs(a, n, ["guard"]);
    h += `<h5>SET BY</h5>${links(a, set)}${!set.length ? `<p class="hint" style="color:var(--R)">Nothing in this act sets it. It may come from an earlier act, or the analysis can't see the code that does.</p>` : ""}
      <h5>NEEDED BY</h5>${links(a, need)}<h5>ONLY WHILE NOT SET</h5>${links(a, guard)}`;
  } else if (n.kind === "item") {
    h += `<h5>GIVEN BY</h5>${links(a, ins(a, n, ["give"]))}<h5>NEEDED BY</h5>${links(a, outs(a, n, ["need"]))}<h5>USED UP BY</h5>${links(a, outs(a, n, ["take"]))}`;
  } else if (n.kind === "mode") {
    h += `<h5>STARTED BY</h5>${links(a, ins(a, n, ["mode"]))}<h5>OPENS UP</h5>${links(a, outs(a, n, ["shift"]))}`;
  } else {
    const locs = n.locs || [];
    if (n.kind === "gate") h += `<h5>CONDITION</h5><pre>${esc(n.src)}</pre>${n.latch.length ? `<p class="hint">Fires once: it sets ${n.latch.map(k => `<code>${esc(k)}</code>`).join(", ")} so it can't fire again.</p>` : ""}`;
    if (n.kind === "convo") {
      const op = convoOpeners(a, n.label), p1 = op.find(o => o.loc && o.loc.key && o.loc.room);
      h += `<div class="loc">${p1 ? playBtn(a.n, p1.loc.key, p1.loc.room, "PLAY THIS", { convo: n.label }) : ""}<button class="btn" data-goto="${a.n}|cv-${a.n}-${esc(n.label)}">SCRIPT</button></div>`;
      h += `<h5>OPENED BY</h5>${op.length ? op.map(o => `<div class="loc"><span class="lt">${esc(o.name)}</span></div>`).join("") : `<span class="none">—</span>`}`;
    }
    if (locs.length) h += `<h5>WHERE</h5>` + locs.map(l => `<div class="loc">${l.room && l.t === "hs" ? playBtn(a.n, l.key, l.room, "PLAY") : ""}<button class="btn" data-goto="${a.n}|${anchorOf(a.n, l)}">SCRIPT</button><span class="lt">${esc(locName(l))}${l.key && l.key !== "*" ? " · " + l.key : ""}</span></div>`).join("");
    else if (n.kind === "start") h += `<div class="loc">${playBtn(a.n, a.graph.startMode, null, "PLAY")}<button class="btn" data-goto="${a.n}|acttext-${a.n}">SCRIPT</button></div>`;
    const up = upstreamFlags(a.graph, n.id), l0 = locs.find(l => l.room && l.t === "hs") || (n.kind === "convo" && convoOpeners(a, n.label).map(o => o.loc).find(l => l && l.room));
    if (up.length && l0) h += `<div class="loc" style="margin-top:8px">${playBtn(a.n, l0.key, l0.room, "PLAY WITH UPSTREAM FLAGS", { flags: up, convo: n.kind === "convo" ? n.label : undefined })}</div><p class="hint" style="font-size:12px">Turns on: ${up.map(esc).join(", ")}</p>`;
    const e = n.eff;
    if (e) {
      const reads = [...e.reads].filter(([k]) => !(n.latch || []).includes(k));
      const sec = (t, body) => body ? `<h5>${t}</h5><div class="row">${body}</div>` : "";
      h += sec("READS", reads.filter(([, r]) => r.pos).map(([k]) => `<button class="ch r" data-node="${a.n}|flag:${esc(k)}">${esc(k)}</button>`).join(""));
      h += sec("ONLY WHILE NOT SET", reads.filter(([, r]) => r.neg && !r.pos).map(([k]) => `<button class="ch g" data-node="${a.n}|flag:${esc(k)}">${esc(k)}</button>`).join(""));
      h += sec("SETS", [...e.writes].map(k => `<button class="ch w" data-node="${a.n}|flag:${esc(k)}">${esc(k)}</button>`).join(""));
      h += sec("ITEMS", effChips({ ...e, reads: new Map(), writes: new Set(), convos: new Set(), rooms: new Set(), shifts: [], deaths: [], endAct: false, helpers: new Set(), dynamic: false }, a.n));
      h += sec("OPENS", [...e.convos].map(k => `<button class="ch c" data-node="${a.n}|convo:${esc(k)}">${esc(k)}</button>`).join(""));
      h += sec("MOVES TO", [...e.rooms].map(r => `<span class="ch rm">${esc(r)}</span>`).join(""));
      h += sec("SHIFT", e.shifts.filter(s => s.mode || s.room).map(s => `<span class="ch s">${esc([s.mode, s.char, s.room].filter(Boolean).join(" · ").toUpperCase())}</span>`).join(""));
      if (e.endAct) h += `<h5>ENDS THE ACT</h5>`;
      if (e.dynamic) h += `<p class="hint" style="color:var(--A)">Also touches flags by a computed name. Those links aren't shown.</p>`;
      if (e.deaths.length) h += `<h5>DEATH</h5>` + e.deaths.map(d => `<div class="death">${esc(d)}</div>`).join("");
    }
    const rec = n.kind === "convo" ? n.rec : n.rec;
    const lits = n.kind === "gate" ? n.lits.map(x => lnHTML(x)).join("") + [...n.eff.helpers].map(name => { const hp = a.helpers.find(x => x.name === name); return hp && hp.lits.length ? `<div class="via">VIA <code>${esc(name)}()</code></div>` + hp.lits.map(x => lnHTML(x)).join("") : ""; }).join("") : linesOf(a, rec);
    if (lits) h += `<h5>LINES</h5>${lits}`;
    if (n.kind === "convo" && n.convo) h += `<h5>FIRST LINES</h5>` + n.convo.lines.filter(l => !l.choice).slice(0, 3).map(l => lnHTML(l.entry)).join("");
  }
  el.innerHTML = h;
}

/* ================================================================ *
 *  LIST
 * ================================================================ */
export function renderList(a) {
  if (a.error) return `<div class="err-banner">act${a.n}.js didn't load:\n${esc(a.error)}</div>`;
  const G = a.graph, N = (id) => G.nodes.find(n => n.id === id);
  const by = (n, dir, kinds) => G.edges.filter(e => (dir === "in" ? e.to : e.from) === n.id && kinds.includes(e.kind)).map(e => dir === "in" ? e.from : e.to);
  const L = (ids) => ids.length ? ids.map(id => nodeLink(a, N(id))).join("") : `<span class="none">—</span>`;
  let h = `<h1 class="act" style="font-size:30px;font-weight:400;letter-spacing:.08em">ACT ${actName(a.n)} · LOGIC LIST</h1><div class="actsub">WHAT SETS EACH FLAG, AND WHAT NEEDS IT. CLICK ANY NAME TO SEE IT IN THE GRAPH.</div>`;
  h += `<div class="sec"><h2>MILESTONES · check()</h2></div><table class="lt"><tr><th>GATE</th><th>WHEN</th><th>NEEDS</th><th>THEN</th></tr>${a.gates.map(g => `<tr><td>${nodeLink(a, g)}</td>
    <td>${esc(g.conds.map(c => c[0] + " " + c[1]).join(", ")) || "any time"}</td>
    <td>${g.cond.filter(([k]) => !g.latch.includes(k)).map(([k, r]) => (r.pos ? "" : "NOT ") + nodeLink(a, N("flag:" + k))).join("") || `<span class="none">—</span>`}</td>
    <td>${effChips({ ...g.eff, reads: new Map() }, a.n)}</td></tr>`).join("")}</table>`;
  const flags = G.nodes.filter(n => n.kind === "flag").sort((x, y) => x.label.localeCompare(y.label));
  h += `<div class="sec"><h2>FLAGS · ${flags.length}</h2></div><table class="lt"><tr><th>FLAG</th><th>SET BY</th><th>NEEDED BY</th><th>ONLY WHILE NOT SET</th></tr>${flags.map(n => {
    const set = by(n, "in", ["write"]), need = by(n, "out", ["read"]), guard = by(n, "out", ["guard"]);
    return `<tr><td>${nodeLink(a, n)}${!set.length ? ` <span class="tag warn" title="Nothing in this act sets it (an earlier act may)">NEVER SET HERE</span>` : ""}${!need.length && !guard.length ? ` <span class="tag" title="Nothing in this act reads it">UNREAD</span>` : ""}</td><td>${L(set)}</td><td>${L(need)}</td><td>${L(guard)}</td></tr>`;
  }).join("")}</table>`;
  const items = G.nodes.filter(n => n.kind === "item");
  h += `<div class="sec"><h2>ITEMS</h2></div><table class="lt"><tr><th>ITEM</th><th>GIVEN BY</th><th>NEEDED BY</th><th>USED UP BY</th></tr>${items.map(n => `<tr><td>${nodeLink(a, n)}</td><td>${L(by(n, "in", ["give"]))}</td><td>${L(by(n, "out", ["need"]))}</td><td>${L(by(n, "out", ["take"]))}</td></tr>`).join("")}</table>`;
  const convos = G.nodes.filter(n => n.kind === "convo");
  h += `<div class="sec"><h2>CONVERSATIONS</h2></div><table class="lt"><tr><th>CONVERSATION</th><th>OPENED BY</th><th>DOES</th></tr>${convos.map(n => `<tr><td>${nodeLink(a, n)}</td>
    <td>${convoOpeners(a, n.label).map(o => `<button class="nodeln" data-goto="${a.n}|${o.anchor}">${esc(o.name)}</button>`).join("") || `<span class="none">—</span>`}</td><td>${effChips(n.eff, a.n, { compact: true })}</td></tr>`).join("")}</table>`;
  const deaths = G.nodes.filter(n => n.eff && n.eff.deaths.length);
  h += `<div class="sec"><h2>DEATHS · ${deaths.reduce((t, n) => t + n.eff.deaths.length, 0)}</h2></div><table class="lt"><tr><th>WHERE</th><th>DESK REJECTED</th></tr>${deaths.map(n => `<tr><td>${nodeLink(a, n)}</td><td>${n.eff.deaths.map(d => `<div class="death" style="color:var(--R);white-space:pre-wrap;margin-bottom:6px">${esc(d)}</div>`).join("")}</td></tr>`).join("")}</table>`;
  const dyn = G.nodes.filter(n => n.eff && n.eff.dynamic);
  if (dyn.length) h += `<div class="sec"><h2>COMPUTED FLAG NAMES</h2></div><p class="hint" style="color:var(--M)">These read or write flags by a name built at run time (api.flag(k), flags[k]). Their links may be missing from the graph.</p>${dyn.map(n => nodeLink(a, n)).join("")}`;
  return h;
}
