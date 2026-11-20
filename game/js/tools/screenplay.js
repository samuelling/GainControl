// GAIN CONTROL — Script Room: the SCREENPLAY view. One act read in playing order, like a shooting script:
// for each part of the walkthrough (js/walkthrough.js), a scene heading whenever the room (or the character) changes,
// a stage direction describing the room as it is at that point (js/tools/scenes.js), what the player can click there
// and the verbs each thing offers, then each step as an action line followed by the dialogue it plays.
// The lines shown are the same editable entries as in the SCRIPT view.
import { WALKTHROUGH } from "../walkthrough.js";
import { SCENES } from "./scenes.js";
import { S, esc, actName, current, lnHTML, playBtn } from "./ui.js";

const TIME = { day: "DAY", night: "NIGHT", morning: "MORNING" };
// the shift a walkthrough part is played in, from its name (a part that doesn't say keeps the one before)
const modeOf = (name, prev) => /NIGHT/.test(name) ? "night" : /MORNING/.test(name) ? "morning"
  : /\bDAY\b|AFTERNOON|\bPM\b|O'CLOCK/.test(name) ? "day" : prev;
// a step played as Morris: "SWITCH TO MORRIS: …" or "MORRIS: …" (until it says SWITCH TO NELL)
const asMorris = (t) => /^(SWITCH TO MORRIS|MORRIS:)/.test(t);

export function renderScreenplay(a, D) {
  const W = WALKTHROUGH[a.n];
  let h = `<h1 class="act"><svg class="seg" viewBox="0 0 412 40" style="width:412px">${D.seg("ACT " + actName(a.n), 0, 6, 28, "sW", 1.7)}</svg></h1>`;
  if (a.error) return h + `<div class="err-banner">act${a.n}.js didn't load:\n${esc(a.error)}</div>`;
  h += `<div class="actsub">${esc((a.title || []).map(e => e ? current(e) : "").join("  ·  "))}  ·  THE ACT IN PLAYING ORDER, FOLLOWING THE WALKTHROUGH</div>`;
  if (!W) return h + `<div class="empty">No walkthrough for this act yet, so there's no playing order to follow.</div>`;
  const ctx = { a, D, shownConvo: new Set(), shownFn: new Set(), mode: D.startKey(a) };
  const st = a.fns.find(f => f.name === "start");
  if (st) h += `<div class="sp-scene"><div class="sp-head">OPENING ${playBtn(a.n, ctx.mode, null, "PLAY")}</div>${D.fnBlock(st.r, a, true)}${convosOf(ctx, st.r)}</div>`;
  W.parts.forEach((p, pi) => {
    ctx.mode = modeOf(p.name, ctx.mode);
    h += `<div class="sp-part" id="sp-${a.n}-${pi}"><h2>${esc(p.name)}</h2></div>`;
    let cur = null;
    for (const s of p.steps) {
      const [room, hid] = s.hs ? s.hs[0].split(".") : [null, null];
      const key = asMorris(s.t) ? "morris" : ctx.mode;
      if (room && (!cur || cur.room !== room || cur.key !== key)) { h += scene(ctx, pi, room, key, cur && cur.room === room); cur = { room, key }; }
      h += action(s);
      if (room) h += response(ctx, room, hid, s, key);
      else if (s.flag) h += gateFor(ctx, s.flag);
    }
  });
  if (a.end.length) h += `<div class="sp-part"><h2>END OF ACT ${actName(a.n)}</h2></div>` + a.end.map(([k, e]) => `<div class="kv"><span class="k">END ${esc(k)}</span>${lnHTML(e)}</div>`).join("");
  return h;
}

/* ---------------- a scene: heading, stage direction, what's clickable ---------------- */
function scene(ctx, pi, room, key, sameRoom) {
  const { a, D } = ctx;
  const R = a.rooms.find(r => r.id === room);
  const time = TIME[key === "morris" ? ctx.mode : key] || "DAY";
  const desc = sameRoom ? "" : SCENES[`${a.n}.${pi}.${room}`];
  const who = key === "morris" ? `<span class="sp-who">AS MORRIS</span>` : "";
  return `<div class="sp-scene" id="sp-${a.n}-${pi}-${room}"><div class="sp-head">INT. ${esc(D.roomName(room))} — ${time}${who}
      <span class="sp-tools"><button class="btn" data-goto="${a.n}|room-${a.n}-${room}">ROOM IN SCRIPT</button>${playBtn(a.n, key, room)}</span></div>
    ${desc ? `<div class="sp-desc">${esc(desc)}</div>` : ""}
    ${R ? options(ctx, R, key) : ""}</div>`;
}
function options(ctx, R, key) {
  const labels = (ctx.D.info().rooms[R.id] || {}).labels || {};
  const L = labels[key] || labels[key === "morning" ? "day" : key] || {};
  const rows = R.hotspots.map(H => {
    const K = H.keys.find(k => k.key === key); if (!K) return "";
    const name = H.label ? current(H.label) : H.id;
    const verbs = K.verbs.map(V => verbLabel(L[H.id] || {}, V)).filter((v, i, all) => all.indexOf(v) === i);
    return `<span class="sp-opt"><b>${esc(String(name).toUpperCase())}</b>${verbs.map(v => `<i>${esc(v)}</i>`).join("")}</span>`;
  }).join("");
  return rows ? `<div class="sp-opts"><span class="lbl">ON STAGE</span>${rows}</div>` : "";
}
function verbLabel(L, V) {
  if (V.verb.startsWith("go:")) return L[V.verb.slice(3)] || "GO " + V.verb.slice(3).toUpperCase();
  return L[V.verb] || (V.verb === "go" ? L.use || "GO" : "") || V.verb.toUpperCase();
}

/* ---------------- a step: the action line, then what it plays ---------------- */
function action(s) {
  const kind = /^OPTIONAL:/.test(s.t) ? " opt" : /^AVOID:/.test(s.t) ? " avoid" : "";
  return `<div class="sp-action${kind}">${esc(s.t)}</div>`;
}
function response(ctx, room, hid, s, key) {
  const { a } = ctx;
  // USE X ON this hotspot
  const use = /USE (?:the |your |Gus's |Preston's )?(.+?) ON/i.exec(s.t);
  if (use) {
    const want = use[1].toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").trim();
    const V = a.withs.find(V => V.room === room && V.id === hid && itemMatches(V.item, want));
    if (V) return body(ctx, V, `USE ${itemName(V.item).toUpperCase()} ON`);
  }
  // the verb named in the step, on the step's hotspot
  const R = a.rooms.find(r => r.id === room), H = R && R.hotspots.find(x => x.id === hid);
  if (H) {
    const L = ((ctx.D.info().rooms[room] || {}).labels) || {};
    const order = [key, ctx.mode, ...H.keys.map(k => k.key)];
    let best = null;
    for (const k of order) {
      const K = H.keys.find(x => x.key === k); if (!K) continue;
      const LL = (L[k] || L[k === "morning" ? "day" : k] || {})[hid] || {};
      for (const V of K.verbs) {
        const lab = verbLabel(LL, V);
        if (new RegExp(`(^|[^A-Z])${lab.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Z]|$)`).test(s.t) && (!best || lab.length > best.lab.length)) best = { V, lab };
      }
      if (best) break;
    }
    if (best) return body(ctx, best.V, best.lab);
  }
  return s.flag ? gateFor(ctx, s.flag) : "";
}
function body(ctx, V, label) {
  const { a, D } = ctx;
  let inner = "";
  if (V.entry) inner = lnHTML(V.entry);
  else if (V.convo) inner = convo(ctx, V.convo);
  else if (V.nav) inner = `<div class="nav">→ ${esc(D.roomName(V.nav.split("@")[0]))}</div>`;
  else if (V.fn) {
    if (ctx.shownFn.has(V.fn)) inner = `<div class="via">SAME AS ABOVE</div>`;
    else { ctx.shownFn.add(V.fn); inner = D.fnBlock(V.fn, a, true) + convosOf(ctx, V.fn); }
  }
  return inner ? `<div class="sp-resp"><span class="sp-verb">${esc(label)}</span><div>${inner}</div></div>` : "";
}
// a check() milestone that sets this flag: the cutscene that plays on its own
function gateFor(ctx, flag) {
  const { a, D } = ctx;
  const g = a.gates.find(g => g.eff.writes.has(flag)); if (!g || ctx.shownFn.has(g)) return "";
  ctx.shownFn.add(g);
  const lits = g.lits.map(e => lnHTML(e)).join("");
  const cv = [...g.eff.convos].map(n => convo(ctx, n)).join("");
  return lits || cv ? `<div class="sp-resp"><span class="sp-verb">ON ITS OWN</span><div>${lits}${cv}</div></div>` : "";
}
function convosOf(ctx, r) { return r && r.eff ? [...r.eff.convos].map(n => convo(ctx, n)).join("") : ""; }
function convo(ctx, name) {
  if (ctx.shownConvo.has(name)) return `<div class="via">CONVERSATION <code>${esc(name)}</code> · AS ABOVE</div>`;
  ctx.shownConvo.add(name);
  for (const A of [ctx.a, ...S.model.acts]) { const C = A.convos.find(c => c.name === name); if (C) return ctx.D.convo(A, C); }
  return `<div class="via">CONVERSATION <code>${esc(name)}</code></div>`;
}

/* ---------------- items, by the name the walkthrough uses ---------------- */
function itemName(id) {
  for (const A of S.model.acts) { const I = A.items.find(i => i.id === id); if (I && I.name) return current(I.name); }
  return id;
}
function itemMatches(id, want) {
  const n = itemName(id).toLowerCase();
  return n === want || n.includes(want) || want.includes(n) || id.toLowerCase() === want.replace(/\s+/g, "");
}
