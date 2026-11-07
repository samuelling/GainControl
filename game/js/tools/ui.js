// GAIN CONTROL — Script Room: shared state, line rendering and editing.
import { PORTRAIT } from "../portraits.js";
import { readLocal, writeLocal } from "./overrides.js";

export const S = {
  acts: [], model: null, info: { speakers: [], rooms: {} }, file: {}, local: readLocal(),
  act: 1, view: "script", q: "", changedOnly: false, sel: null, caps: true, night: false, hidePassive: false,
  byUid: new Map(), onChange: () => {},
};
export const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const actName = (n) => ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || String(n);
export const KEYS = ["day", "morris", "night", "morning"];

/* ---------------- overrides ---------------- */
export const current = (e) => (e.key in S.local ? S.local[e.key] : e.key in S.file ? S.file[e.key] : e.orig);
export const isChanged = (e) => current(e) !== e.orig;
// the effective text as the revision history records it: null when the original shows
export const effVal = (e) => { const v = current(e); return v === e.orig ? null : v; };
// opts.log: false → not recorded in the history (the history's own reverts record themselves);
// opts.kind: the history entry's kind ("edit" by default, "reset" for a line's REVERT button);
// opts.quiet: skip S.onChange (batch operations call it once at the end).
export function setText(e, text, opts = {}) {
  const from = effVal(e);
  if (text === e.orig) { if (e.key in S.file) S.local[e.key] = text; else delete S.local[e.key]; }
  else S.local[e.key] = text;
  writeLocal(S.local); refreshLines(e);
  const to = effVal(e);
  if (opts.log !== false && from !== to && S.onEdit) S.onEdit(e, from, to, opts.kind || "edit");
  if (!opts.quiet) S.onChange(e);
}
export function allOverrides() { return { ...S.file, ...S.local }; }
export function changedCount() {
  let n = 0; const all = allOverrides();
  for (const [k, v] of Object.entries(all)) { const e = S.model.entries.get(k); if (!e || v !== e.orig) n++; }
  return n;
}

/* ---------------- speakers and colors ---------------- */
export function colorOfWho(who) {
  const w = who.trim().toUpperCase();
  const s = S.info.speakers.find(([k]) => w.startsWith(k)); if (s) return s[1];
  const p = Object.values(PORTRAIT).find(p => p.name && (w.startsWith(p.name) || p.name.split(" ").some(x => x.length > 2 && w.startsWith(x))));
  return p ? p.chip.slice(1) : "A";
}
export const portrait = (id) => PORTRAIT[id] || { name: String(id || "?").toUpperCase(), chip: "fW" };
export const sideSpeaker = (c, side) => side === "N" ? { name: "NARRATOR", c: "M" } : (() => { const p = portrait(c[side]); return { name: p.name, c: p.chip.slice(1) }; })();
export const whoChip = (name, c) => `<span class="who" style="background:var(--${c})">${esc(name)}</span>`;

function mark(html, q) {
  if (!q) return html;
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), "gi");
  return html.replace(/(<[^>]+>)|([^<]+)/g, (m, tag, txt) => tag || txt.replace(re, (x) => `<mark>${x}</mark>`));
}
// "WHO|line" strings as the writer means them: speaker chips at the start of any paragraph
const SPK = /^([A-Z][A-Z0-9 .'’()\-]{0,38})\|/;
export function sayHTML(text, q) {
  const parts = text.split(/\n\n/);
  let out = "", color = "W";
  parts.forEach((p, i) => {
    const m = SPK.exec(p); let body = p;
    if (m) { color = colorOfWho(m[1]); body = p.slice(m[0].length); }
    const seg = `${m ? whoChip(m[1], color) : ""}<span style="color:var(--${m ? color : "W"})">${mark(esc(body), q)}</span>`;
    out += i ? `<span class="seg2">${seg}</span>` : seg;
    if (!m) color = "W";
  });
  return out;
}
export function lineHTML(text, q) {
  const i = text.indexOf("|");
  if (i < 0) return mark(esc(text), q);
  return `${mark(esc(text.slice(0, i)), q)}<span class="sub">${mark(esc(text.slice(i + 1)), q)}</span>`;
}
// what the engine will actually do with the pipes
function lint(e, text) {
  const n = (text.match(/\|/g) || []).length;
  if (e.kind === "line" || e.kind === "choice") return n > 1 ? "Conversation lines split at the first | (text|subtitle). Everything after a second | is dropped in game." : "";
  if (e.kind !== "say" && !(e.kind === "lit" && e.hook !== "card" && e.hook !== "ui")) return "";
  if (e.frag) return "";
  if (!n) return "";
  const who = text.slice(0, text.indexOf("|"));
  const msgs = [];
  if (n > 1) msgs.push("say() splits at the first | only. Everything after the second | is dropped in game.");
  if (/\n/.test(who) || who.length > 40) msgs.push(`say() treats everything before the first | as the speaker, so the chip will read "${who.slice(0, 50).replace(/\n/g, " ")}…".`);
  return msgs.join(" ");
}

/* ---------------- one editable line ---------------- */
let uid = 0;
export function lnHTML(e, opts = {}) {
  if (!e) return "";
  if (e.uid == null) { e.uid = ++uid; S.byUid.set(e.uid, e); }
  const ro = e.hook === "card" || e.hook === "ui";
  const t = current(e), chg = isChanged(e);
  return `<div class="ln${chg ? " chg" : ""}${ro ? " ro" : ""}" data-u="${e.uid}"${opts.color ? ` data-c="${opts.color}"` : ""}>${inner(e, t, opts.color)}</div>`;
}
function inner(e, t, color, q = S.q) {
  const ro = e.hook === "card" || e.hook === "ui";
  const body = e.kind === "line" || e.kind === "choice" ? `<span style="color:var(--${color || "W"})">${lineHTML(t, q)}</span>` : e.kind === "title" || e.kind === "name" || e.kind === "label" ? mark(esc(t), q) : sayHTML(t, q);
  const tags = [];
  if (e.lit) {
    if (e.hook === "card") tags.push(`<span class="tag hook" title="Drawn on a title card with the stroke alphabet; it doesn't pass through say(), so it can't be overridden here.">CARD</span>`);
    else if (e.hook === "ui") tags.push(`<span class="tag hook" title="On-screen label (a chooser button or similar). Not passed through say(), so not editable here.">UI</span>`);
    else if (e.hook === "die") tags.push(`<span class="tag hook" title="A death screen. The override applies only if main.js die() passes its text through rewriteSay().">DEATH</span>`);
    if (e.frag) tags.push(`<span class="tag frag" title="Part of a longer line (joined with + or a template). Your edit replaces this piece wherever it appears in a line.">PART</span>`);
  }
  const w = lint(e, t); if (w) tags.push(`<span class="tag warn" title="${esc(w)}">⚠ PIPE</span>`);
  return `<div class="tx"${ro ? "" : ` title="Click to edit"`}>${body || "&nbsp;"}</div><div class="lnside">${tags.join("")}<span class="tag wasbtn" title="Show the original">WAS</span><button class="rev" title="Back to the original">REVERT</button></div><div class="was">${esc(e.orig)}</div>`;
}
export function refreshLines(e) {
  document.querySelectorAll(`.ln[data-u="${e.uid}"]`).forEach(el => {
    if (el.querySelector(".tx.editing")) return;
    el.classList.toggle("chg", isChanged(e)); el.innerHTML = inner(e, current(e), el.dataset.c);
  });
}
export function startEdit(tx) {
  const ln = tx.closest(".ln"), e = S.byUid.get(+ln.dataset.u); if (!e || ln.classList.contains("ro") || tx.classList.contains("editing")) return;
  tx.classList.add("editing"); tx.textContent = current(e);
  try { tx.contentEditable = "plaintext-only"; } catch (err) { tx.contentEditable = "true"; }
  if (tx.contentEditable !== "plaintext-only") tx.contentEditable = "true";
  tx.focus();
  const r = document.createRange(); r.selectNodeContents(tx); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  const done = (save) => {
    tx.removeEventListener("blur", onBlur); tx.removeEventListener("keydown", onKey);
    let v = tx.innerText.replace(/\r\n/g, "\n"); if (v.endsWith("\n") && !current(e).endsWith("\n")) v = v.replace(/\n$/, "");
    tx.contentEditable = "false"; tx.classList.remove("editing");
    if (save && v !== current(e)) setText(e, v); else refreshLines(e);
  };
  const onBlur = () => done(true);
  const onKey = (ev) => {
    if (ev.key === "Escape") { ev.preventDefault(); tx.textContent = current(e); tx.blur(); }
    else if (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); tx.blur(); }
  };
  tx.addEventListener("blur", onBlur); tx.addEventListener("keydown", onKey);
}

/* ---------------- effect chips ---------------- */
export function effChips(eff, act, { compact = false } = {}) {
  if (!eff) return "";
  const n = (k, cls, txt) => `<button class="ch ${cls}" data-node="${act}|${k}">${esc(txt)}</button>`;
  const o = [];
  for (const k of eff.writes) o.push(n("flag:" + k, "w", k));
  for (const [k, r] of eff.reads) o.push(n("flag:" + k, r.pos ? "r" : "g", k));
  for (const k of eff.gives) o.push(n("item:" + k, "i ig", k));
  for (const k of eff.takes) o.push(n("item:" + k, "i it", k));
  for (const k of eff.needs) if (!eff.takes.has(k)) o.push(n("item:" + k, "i in", k));
  for (const k of eff.convos) o.push(`<button class="ch c" data-convo="${act}|${esc(k)}">${esc(k)}</button>`);
  for (const r of eff.rooms) o.push(`<span class="ch rm">${esc(r.replace("@", " @"))}</span>`);
  for (const s of eff.shifts) if (s.mode || s.room) o.push(`<span class="ch s">SHIFT ${esc([s.mode, s.char, s.room].filter(Boolean).join(" · ").toUpperCase())}</span>`);
  if (eff.deaths.length) o.push(`<span class="ch d" title="${esc(eff.deaths[0])}">DEATH${eff.deaths.length > 1 ? " ×" + eff.deaths.length : ""}</span>`);
  if (eff.endAct) o.push(`<span class="ch e">END ACT</span>`);
  if (eff.dynamic) o.push(`<span class="ch dyn" title="Reads or writes a flag whose name is computed at run time; the graph can't see which.">DYNAMIC FLAG</span>`);
  if (!compact) for (const h of eff.helpers) o.push(`<span class="ch h">${esc(h)}()</span>`);
  return o.join("");
}

/* ---------------- links ---------------- */
export function playURL(act, key, room, { convo, flags } = {}) {
  const k = !key || key === "*" ? "day" : key;
  return `index.html#jump=${act}.${k}${room ? "." + room : ""}${convo ? "&convo=" + encodeURIComponent(convo) : ""}${flags && flags.length ? "&flags=" + flags.map(encodeURIComponent).join(",") : ""}`;
}
const PK = { day: "B", night: "G", morris: "K", morning: "R" };
export const playBtn = (act, key, room, label, extra) => `<a class="play" data-k="${key || "day"}" style="--pk:var(--${PK[key] || "G"})" target="_blank" href="${esc(playURL(act, key, room, extra))}" title="Open the game here in a new tab">${esc(label || "PLAY " + (key || "day").toUpperCase())}</a>`;
export function anchorOf(act, w) {
  if (!w) return "";
  if (Array.isArray(w)) {
    if (w[0] === "ITEMS") return `it-${w[1]}`;
    if (w[0] === "TITLE" || w[0] === "END") return `acttext-${act}`;
    if (w.length === 1) return `cv-${act}-${w[0]}`;
    return `hs-${act}-${w[0]}-${w[1]}`;
  }
  if (w.t === "hs" || w.t === "with") return `hs-${act}-${w.room}-${w.id}`;
  if (w.t === "convo") return `cv-${act}-${w.convo}`;
  if (w.t === "item") return `it-${w.item}`;
  if (w.t === "exp") return w.name === "check" ? `gates-${act}` : `acttext-${act}`;
  if (w.t === "helper") return `hp-${act}-${w.name}`;
  if (w.t === "other") return `ot-${act}-${w.unit}`;
  return "";
}
let toastT;
export function toast(t) { const el = document.getElementById("toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 1800); }
