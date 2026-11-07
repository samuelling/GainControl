// GAIN CONTROL — Script Room: the revision history of every manual change made here.
//
// localStorage "gaincontrol.script.history" holds an array, oldest first (the last 500 are kept):
//   { id, t, kind, key, act, label, from, to }            one line
//   { id, t, kind, label, changes: [{ key, act, label, from, to }, …] }   a batch (revert all, import, restore…)
// from / to are the effective text before / after; null means "the original shows, no override".
// kind: edit | reset | delete | revert | restore | revert-all | import. Reverts carry ref: the id they undo.
import { S, esc, actName, effVal, setText, sideSpeaker, whoChip, anchorOf, toast } from "./ui.js";
import { writeLocal } from "./overrides.js";
import { locName } from "./analyze.js";

export const HSTORE = "gaincontrol.script.history";
export const HFORMAT = "gaincontrol.script.history";
const CAP = 500, OPEN = "gaincontrol.script.histopen";
const $ = (s, r = document) => r.querySelector(s);
let cb = { goto: () => {}, changed: () => {} }, panel = null;

/* ================================================================ *
 *  STORE
 * ================================================================ */
export function readHist() {
  try { const a = JSON.parse(localStorage.getItem(HSTORE) || "[]"); return Array.isArray(a) ? a.filter(valid) : []; } catch (e) { return []; }
}
function writeHist(a) {
  a = a.slice(-CAP);
  for (;;) {
    try { localStorage.setItem(HSTORE, JSON.stringify(a)); return a; }
    catch (e) { if (a.length <= 1) return a; a = a.slice(Math.ceil(a.length / 4)); }   // over quota: drop the oldest quarter
  }
}
const valid = (x) => x && typeof x === "object" && typeof x.id === "string" && typeof x.t === "string" &&
  (Array.isArray(x.changes) ? x.changes.every(c => c && typeof c.key === "string") : typeof x.key === "string");
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const changesOf = (h) => h.changes || [h];

function append(x) {
  const h = readHist(), ent = { id: newId(), t: new Date().toISOString(), ...x };
  h.push(ent); writeHist(h); renderPanel(); return ent;
}
// one line
export function record(kind, key, from, to, extra = {}) {
  if (from === to) return null;
  const e = S.model && S.model.entries.get(key);
  return append({ kind, key, act: e ? e.act : actOfKey(key), label: e ? labelOf(e) : key, from, to, ...extra });
}
// several lines at once; changes: [{ key, from, to }]
export function recordBatch(kind, label, changes, extra = {}) {
  const list = changes.filter(c => c.from !== c.to).map(c => {
    const e = S.model && S.model.entries.get(c.key);
    return { key: c.key, act: e ? e.act : actOfKey(c.key), label: e ? labelOf(e) : c.key, from: c.from, to: c.to };
  });
  if (!list.length) return null;
  return append({ kind, label, changes: list, ...extra });
}
export function mergeHistory(entries) {
  const h = readHist(), ids = new Set(h.map(x => x.id)); let n = 0;
  for (const x of entries) if (valid(x) && !ids.has(x.id)) { h.push(x); ids.add(x.id); n++; }
  h.sort((a, b) => a.t < b.t ? -1 : a.t > b.t ? 1 : 0);
  writeHist(h); renderPanel(); return n;
}
const actOfKey = (k) => { const n = parseInt(k, 10); return isNaN(n) ? null : n; };

/* ---------------- effective values ---------------- */
export function effOf(key) {
  const e = S.model.entries.get(key);
  if (e) return effVal(e);
  return key in S.local ? S.local[key] : key in S.file ? S.file[key] : null;
}
// put a key back to v (null = the original) without logging
function applyVal(key, v) {
  const e = S.model.entries.get(key);
  if (e) { setText(e, v == null ? e.orig : v, { log: false, quiet: true }); return; }
  if (v == null) delete S.local[key]; else S.local[key] = v;
  writeLocal(S.local);
}
const textOf = (key, v) => v != null ? v : ((S.model.entries.get(key) || {}).orig ?? "");

/* ---------------- a human-readable location ---------------- */
export function labelOf(e) {
  if (e.kind === "line" || e.kind === "choice") {
    const m = /\.lines\.(\d+)(?:\.choice\.(\d+)(?:\.(text|lines\.(\d+)))?)?/.exec(e.path || "");
    let at = m ? `line ${+m[1] + 1}` : "";
    if (m && m[2] != null) at += ` · choice ${+m[2] + 1}` + (m[4] != null ? ` · reply ${+m[4] + 1}` : "");
    return `convo ${e.convo}${at ? " · " + at : ""}`;
  }
  if (e.lit) { const w = (e.wheres || [])[0]; return (locName(w) || "string") + (w && w.key ? " · " + w.key : "") + ((e.wheres || []).length > 1 ? ` +${e.wheres.length - 1} more` : ""); }
  if (Array.isArray(e.where)) {
    if (e.where[0] === "ITEMS") return `item ${e.where.slice(1).join(" · ")}`;
    if (e.where[0] === "TITLE" || e.where[0] === "END") return e.path.replace(/\./g, " · ");
    return e.where.join(" · ");
  }
  return e.path || e.key;
}
function speakerOf(e) {
  if (!e || (e.kind !== "line" && e.kind !== "choice")) return null;
  for (const a of S.model.acts) { const C = a.convos.find(c => c.name === e.convo); if (C) return sideSpeaker(C, e.side); }
  return null;
}

/* ================================================================ *
 *  REVERT · RESTORE
 * ================================================================ */
const short = (t, n = 90) => { t = t == null ? "(the original)" : String(t).replace(/\s+/g, " "); return t.length > n ? t.slice(0, n) + "…" : t; };
const when = (h) => new Date(h.t).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });

export function revert(id) {
  const all = readHist(), h = all.find(x => x.id === id); if (!h) return;
  const ch = changesOf(h), clob = ch.filter(c => effOf(c.key) !== c.to);
  if (clob.length) {
    const msg = ch.length === 1
      ? `“${h.label}” has been changed since this entry.\n\nNow:  ${short(effOf(h.key))}\nRevert to:  ${short(h.from)}\n\nRevert anyway? The later edit is replaced (and logged, so it can be undone).`
      : `${clob.length} of the ${ch.length} lines in this entry have been changed since:\n\n${clob.slice(0, 6).map(c => "· " + c.label).join("\n")}${clob.length > 6 ? "\n· …" : ""}\n\nRevert anyway? Their later edits are replaced (and logged, so they can be undone).`;
    if (!confirm(msg)) return;
  }
  const out = [];
  for (const c of [...ch].reverse()) { const from = effOf(c.key); applyVal(c.key, c.from); out.push({ key: c.key, from, to: effOf(c.key) }); }
  const ref = { ref: h.id, refT: h.t, refKind: h.kind };
  const ent = ch.length === 1 && !h.changes ? record("revert", h.key, out[0].from, out[0].to, ref) : recordBatch("revert", `undo ${KIND[h.kind] || h.kind} · ${h.label}`, out, ref);
  cb.changed(); toast(ent ? "REVERTED" : "ALREADY LIKE THAT");
}
export function restoreTo(id) {
  const all = readHist(), i = all.findIndex(x => x.id === id); if (i < 0) return;
  const later = all.slice(i + 1); if (!later.length) { toast("NOTHING AFTER THIS"); return; }
  const target = new Map(), expect = new Map();
  for (const h of [...later].reverse()) for (const c of [...changesOf(h)].reverse()) { target.set(c.key, c.from); if (!expect.has(c.key)) expect.set(c.key, c.to); }
  const keys = [...target.keys()].filter(k => effOf(k) !== target.get(k));
  if (!keys.length) { toast("ALREADY LIKE THAT"); return; }
  const clob = [...expect].filter(([k, v]) => effOf(k) !== v);
  if (!confirm(`Undo the ${later.length} change${later.length > 1 ? "s" : ""} made after this one (${when(all[i])})? ${keys.length} line${keys.length > 1 ? "s" : ""} will change.` +
    (clob.length ? `\n\n${clob.length} line${clob.length > 1 ? "s were" : " was"} also changed outside this history; ${clob.length > 1 ? "those changes" : "that change"} will be lost too.` : "") +
    `\n\nThe restore is logged, so it can be undone.`)) return;
  const out = [];
  for (const k of keys) { const from = effOf(k); applyVal(k, target.get(k)); out.push({ key: k, from, to: effOf(k) }); }
  recordBatch("restore", `back to ${when(all[i])} · ${all[i].label}`, out, { ref: all[i].id, refT: all[i].t, refKind: all[i].kind });
  cb.changed(); toast(`RESTORED ${out.length} LINE${out.length > 1 ? "S" : ""}`);
}
function jump(key) {
  const e = S.model.entries.get(key); if (!e) { toast("THAT LINE IS NO LONGER IN THE SCRIPT"); return; }
  const w = e.lit ? (e.wheres || [])[0] : e.where;
  cb.goto(e.act, anchorOf(e.act, w));
  const ln = e.uid != null && ([...document.querySelectorAll(`#main .ln[data-u="${e.uid}"]`)][0]);
  if (ln) { ln.scrollIntoView({ block: "center" }); ln.classList.remove("flash"); void ln.offsetWidth; ln.classList.add("flash"); }
}
export function exportHistory() {
  const out = { format: HFORMAT, version: 1, exported: new Date().toISOString(), entries: readHist() };
  const blob = new Blob([JSON.stringify(out, null, 2) + "\n"], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "script-history.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast(`EXPORTED ${out.entries.length} HISTORY ENTRIES`);
}
// is this parsed JSON a script-history.json? returns its entries or null
export function historyEntriesOf(j) {
  if (j && j.format === HFORMAT && Array.isArray(j.entries)) return j.entries;
  if (Array.isArray(j) && j.length && j.every(valid)) return j;
  return null;
}

/* ================================================================ *
 *  THE PANEL
 * ================================================================ */
const KIND = { edit: "EDIT", reset: "RESET", delete: "DELETE", revert: "REVERT", restore: "RESTORE", "revert-all": "REVERT ALL", import: "IMPORT" };

// word-level diff: [[op, token]], op "=", "-" or "+"
function wdiff(a, b) {
  const A = a.match(/\s+|[^\s]+/g) || [], B = b.match(/\s+|[^\s]+/g) || [];
  let p = 0; while (p < A.length && p < B.length && A[p] === B[p]) p++;
  let s = 0; while (s < A.length - p && s < B.length - p && A[A.length - 1 - s] === B[B.length - 1 - s]) s++;
  const a2 = A.slice(p, A.length - s), b2 = B.slice(p, B.length - s), n = a2.length, m = b2.length;
  let mid = [];
  if (n * m > 160000) mid = [...a2.map(t => ["-", t]), ...b2.map(t => ["+", t])];
  else {
    const W = m + 1, L = new Uint16Array((n + 1) * W);
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i * W + j] = a2[i] === b2[j] ? L[(i + 1) * W + j + 1] + 1 : Math.max(L[(i + 1) * W + j], L[i * W + j + 1]);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a2[i] === b2[j]) { mid.push(["=", a2[i]]); i++; j++; }
      else if (L[(i + 1) * W + j] >= L[i * W + j + 1]) mid.push(["-", a2[i++]]);
      else mid.push(["+", b2[j++]]);
    }
    while (i < n) mid.push(["-", a2[i++]]); while (j < m) mid.push(["+", b2[j++]]);
  }
  return [...A.slice(0, p).map(t => ["=", t]), ...mid, ...A.slice(A.length - s).map(t => ["=", t])];
}
// one side of the diff; long unchanged stretches are elided
function side(ops, drop, mark) {
  const runs = [];
  for (const [op, t] of ops) {
    if (op === drop) continue;
    const o = op === "=" || !/\S/.test(t) ? "=" : op, r = runs[runs.length - 1], r2 = runs[runs.length - 2];
    // a space between two changed words joins them into one highlight
    if (o !== "=" && r && r2 && r2[0] === o && r[0] === "=" && !/\S/.test(r[1].join(""))) { runs.pop(); r2[1].push(...r[1], t); continue; }
    if (r && r[0] === o) r[1].push(t); else runs.push([o, [t]]);
  }
  return runs.map(([o, toks], i) => {
    if (o !== "=") return `<span class="${mark}">${esc(toks.join(""))}</span>`;
    const K = 14;
    if (toks.length > K * 2 + 2 && runs.length > 1) {
      if (i === 0) return `<span class="el">… </span>${esc(toks.slice(-K).join(""))}`;
      if (i === runs.length - 1) return `${esc(toks.slice(0, K).join(""))}<span class="el"> …</span>`;
      return `${esc(toks.slice(0, K).join(""))}<span class="el"> … </span>${esc(toks.slice(-K).join(""))}`;
    }
    return esc(toks.join(""));
  }).join("");
}
function diffHTML(c) {
  const a = textOf(c.key, c.from), b = textOf(c.key, c.to), ops = wdiff(a, b);
  const o = (v) => v == null ? `<span class="orig">${S.model.entries.has(c.key) ? "ORIGINAL" : "NO OVERRIDE"}</span>` : "";
  return `<div class="hdiff"><div class="hd-from"><span class="sg">−</span><span class="t">${o(c.from)}${side(ops, "+", "del") || "&nbsp;"}</span></div>` +
    `<div class="hd-to"><span class="sg">+</span><span class="t">${o(c.to)}${side(ops, "-", "ins") || "&nbsp;"}</span></div></div>`;
}
function locHTML(c) {
  const e = S.model.entries.get(c.key), sp = speakerOf(e);
  return `<span class="actc">${c.act != null ? "ACT " + actName(c.act) : "?"}</span>` +
    (e ? `<button class="hloc" data-hk="${esc(c.key)}" title="Show this line in the script">${esc(c.label)}</button>` : `<span class="hloc gone" title="${esc(c.key)}">${esc(c.label)} · NOT IN THE SCRIPT</span>`) +
    (sp ? whoChip(sp.name, sp.c) : "");
}
function entryHTML(h, newest) {
  const tm = new Date(h.t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const refT = h.refT ? new Date(h.refT).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
  const ref = h.ref ? `<span class="href">↶ ${esc(KIND[h.refKind] || h.refKind || "")} ${esc(refT)}</span>` : "";
  const acts = `<span class="tm">${esc(tm)}</span><span class="hk hk-${esc(h.kind)}">${esc(KIND[h.kind] || h.kind.toUpperCase())}</span>${ref}`;
  let body;
  if (h.changes) {
    const n = h.changes.length;
    body = `<div class="he-h">${acts}<span class="blabel">${esc(h.label)}</span><span class="cnt">${n} LINE${n > 1 ? "S" : ""}</span></div>
      <details class="hb"${n <= 2 ? " open" : ""}><summary>LINES</summary>${h.changes.map(c => `<div class="hbc"><div class="he-loc">${locHTML(c)}</div>${diffHTML(c)}</div>`).join("")}</details>`;
  } else body = `<div class="he-h">${acts}</div><div class="he-loc">${locHTML(h)}</div>${diffHTML(h)}`;
  return `<div class="hent" data-hid="${esc(h.id)}">${body}<div class="he-a"><button class="hrev" data-hrev="${esc(h.id)}" title="Put ${h.changes ? "these lines" : "this line"} back as before this change (logged, so it can be undone)">REVERT</button>${newest ? "" : `<button class="btn hres" data-hres="${esc(h.id)}" title="Undo every change made after this one">RESTORE TO HERE</button>`}</div></div>`;
}
function dayName(d) {
  const t = new Date(); t.setHours(0, 0, 0, 0); const x = new Date(d); x.setHours(0, 0, 0, 0);
  const diff = Math.round((t - x) / 864e5), ds = d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  return diff === 0 ? "TODAY · " + ds : diff === 1 ? "YESTERDAY · " + ds : ds + (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : "");
}
export function renderPanel() {
  const all = readHist(), nb = $("#nHist"); if (nb) nb.textContent = String(all.length).padStart(2, "0");
  if (!panel || !document.body.classList.contains("hist")) return;
  const list = [...all].reverse(); let html = "", day = "";
  list.forEach((h, i) => {
    const d = dayName(new Date(h.t)); if (d !== day) { if (day) html += `</div>`; html += `<div class="hday"><h4>${esc(d)}</h4>`; day = d; }
    html += entryHTML(h, i === 0);
  });
  if (day) html += `</div>`;
  const keepY = panel.querySelector(".hlist") ? panel.querySelector(".hlist").scrollTop : 0;
  panel.innerHTML = `<div class="hist-h"><h2>HISTORY</h2><span class="n">${all.length}</span><span class="l">${all.length >= CAP ? "THE LAST " + CAP : "CHANGES"}</span>
      <span class="sp"></span><button class="btn" data-hact="export" title="Download script-history.json to send with overrides.json">EXPORT HISTORY</button><button class="btn" data-hact="import" title="Merge a script-history.json (or load an overrides.json)">IMPORT</button><button class="btn hx" data-hact="close" title="Close">×</button></div>
    <div class="hlist">${html || `<div class="empty">NO CHANGES YET. EDITS, REVERTS AND IMPORTS MADE IN THE SCRIPT ROOM SHOW UP HERE.</div>`}</div>`;
  panel.querySelector(".hlist").scrollTop = keepY;
}
export function toggleHistory(on = !document.body.classList.contains("hist")) {
  document.body.classList.toggle("hist", on); $("#histBtn") && $("#histBtn").classList.toggle("on", on);
  try { localStorage.setItem(OPEN, on ? "1" : "0"); } catch (e) {}
  renderPanel();
}
export function initHistory(callbacks) {
  cb = { ...cb, ...callbacks };
  panel = document.createElement("aside"); panel.id = "hist"; document.body.appendChild(panel);
  S.onEdit = (e, from, to, kind) => record(kind, e.key, from, to);
  panel.addEventListener("click", (ev) => {
    const t = ev.target;
    const k = t.closest("[data-hk]"); if (k) { jump(k.dataset.hk); return; }
    const r = t.closest("[data-hrev]"); if (r) { revert(r.dataset.hrev); return; }
    const s = t.closest("[data-hres]"); if (s) { restoreTo(s.dataset.hres); return; }
    const a = t.closest("[data-hact]"); if (!a) return;
    if (a.dataset.hact === "close") toggleHistory(false);
    else if (a.dataset.hact === "export") exportHistory();
    else if (a.dataset.hact === "import") $("#importFile").click();
  });
  window.addEventListener("storage", (e) => { if (e.key === HSTORE) renderPanel(); });
  $("#histBtn").addEventListener("click", () => toggleHistory());
  let open = false; try { open = localStorage.getItem(OPEN) === "1"; } catch (e) {}
  toggleHistory(open);
}
