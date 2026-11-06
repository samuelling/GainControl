// GAIN CONTROL — Script Room analysis. Reads the act modules live (data + source text) and builds:
//   entries: every editable string (data paths and function literals)
//   graph:   per act, actions/convos/gates ↔ flags/items/modes, by static analysis of the source.

/* ================================================================ *
 *  LOADING
 * ================================================================ */
export async function loadActs() {
  const acts = [];
  for (let n = 1; n < 40; n++) {
    const url = new URL(`../story/act${n}.js`, import.meta.url);
    let src;
    try { const r = await fetch(url, { cache: "no-cache" }); if (!r.ok) break; src = await r.text(); } catch (e) { break; }
    try { acts.push({ n, mod: await import(url.href), src }); }
    catch (e) { acts.push({ n, mod: null, src, error: String((e && e.message) || e) }); }
  }
  return acts;
}
// main.js tells us the room names and the speaker colors for "WHO|line" strings
export async function loadEngineInfo() {
  const info = { speakers: [], rooms: {} };
  let src = "";
  try { src = await (await fetch(new URL("../main.js", import.meta.url), { cache: "no-cache" })).text(); } catch (e) {}
  const sp = /const SPEAKER\s*=\s*\[([\s\S]*?)\];/.exec(src);
  if (sp) for (const m of sp[1].matchAll(/\[\s*"([^"]+)"\s*,\s*"(\w)"\s*\]/g)) info.speakers.push([m[1], m[2]]);
  // portraits that main.js merges in (Object.assign(PORTRAIT, PORTRAITS_A, …)), imported the same way
  const pa = /Object\.assign\(\s*PORTRAIT\s*,([^)]*)\)/.exec(src);
  if (pa) {
    const { PORTRAIT } = await import(new URL("../portraits.js", import.meta.url).href);
    const from = {}; for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*"(\.\/[^"]+)"/g)) for (const n of m[1].split(",")) from[n.trim().split(/\s+as\s+/).pop()] = m[2];
    for (const name of pa[1].split(",").map(x => x.trim()).filter(Boolean)) {
      try { const mod = await import(new URL("." + from[name], import.meta.url).href); if (mod[name]) Object.assign(PORTRAIT, mod[name]); } catch (e) {}
    }
  }
  const files = {}; for (const m of src.matchAll(/import\s+(\w+)\s+from\s+"\.\/rooms\/([\w-]+)\.js"/g)) files[m[1]] = m[2];
  const files2 = new Set(Object.values(files));
  await Promise.all([...files2].map(async (f) => {
    try { const r = (await import(new URL(`../rooms/${f}.js`, import.meta.url).href)).default; if (r && r.id) info.rooms[r.id] = { name: r.name, entries: r.entries, labels: r.labels || {} }; } catch (e) {}
  }));
  return info;
}
// rooms that exist on disk but aren't wired into main.js yet (act III in progress): best effort by id
export async function loadRoom(id, info) {
  if (info.rooms[id]) return info.rooms[id];
  for (const f of [id, id + "way"]) {
    try { const r = (await import(new URL(`../rooms/${f}.js`, import.meta.url).href)).default; if (r && r.id === id) return (info.rooms[id] = { name: r.name, entries: r.entries, labels: r.labels || {} }); } catch (e) {}
  }
  return (info.rooms[id] = { name: id.toUpperCase(), entries: {}, labels: {} });
}

/* ================================================================ *
 *  TOKENIZER (enough JS for story files: strings, templates, regexes, comments)
 * ================================================================ */
const PUNCT = ["...", "===", "!==", "**=", ">>>", "=>", "==", "!=", "<=", ">=", "&&", "||", "??", "?.", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "**"];
const REKW = new Set(["return", "typeof", "instanceof", "in", "of", "new", "delete", "void", "throw", "case", "do", "else", "yield", "await"]);
const unescape = (s) => s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r?\n|[\s\S])/g, (m, e) => {
  if (e[0] === "u" && e.length > 1) return String.fromCodePoint(parseInt(e[1] === "{" ? e.slice(2, -1) : e.slice(1), 16));
  if (e[0] === "x" && e.length > 1) return String.fromCharCode(parseInt(e.slice(1), 16));
  if (e[0] === "\n" || e[0] === "\r") return "";
  return { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", 0: "\0" }[e] ?? e;
});

export function tokenize(src) {
  const T = [], n = src.length, tpl = []; let i = 0, depth = 0;
  const push = (t, v, s, e, x) => T.push(Object.assign({ t, v, s, e }, x));
  const regexOK = () => { const p = T[T.length - 1]; if (!p) return true; if (p.t === "p") return !(p.v === ")" || p.v === "]" || p.v === "}"); if (p.t === "id") return REKW.has(p.v); return false; };
  function tplScan(start) {
    let j = start;
    while (j < n) {
      const c = src[j];
      if (c === "\\") { j += 2; continue; }
      if (c === "`") { push("str", unescape(src.slice(start, j)), start, j, { tpl: true }); return j + 1; }
      if (c === "$" && src[j + 1] === "{") { push("str", unescape(src.slice(start, j)), start, j, { tpl: true }); push("p", "${", j, j + 2); tpl.push(depth); depth++; return j + 2; }
      j++;
    }
    return j;
  }
  while (i < n) {
    const c = src[i];
    if (c === " " || c === "\n" || c === "\t" || c === "\r") { i++; continue; }
    if (c === "/" && src[i + 1] === "/") { const j = src.indexOf("\n", i); i = j < 0 ? n : j; continue; }
    if (c === "/" && src[i + 1] === "*") { const j = src.indexOf("*/", i + 2); i = j < 0 ? n : j + 2; continue; }
    if (c === '"' || c === "'") { let j = i + 1; while (j < n && src[j] !== c) { if (src[j] === "\\") j++; j++; } push("str", unescape(src.slice(i + 1, j)), i, j + 1); i = j + 1; continue; }
    if (c === "`") { i = tplScan(i + 1); continue; }
    if (/[A-Za-z_$]/.test(c)) { let j = i + 1; while (j < n && /[\w$]/.test(src[j])) j++; push("id", src.slice(i, j), i, j); i = j; continue; }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1]))) { let j = i + 1; while (j < n && /[\w.]/.test(src[j])) j++; push("num", src.slice(i, j), i, j); i = j; continue; }
    if (c === "/" && regexOK()) {
      let j = i + 1, cls = false;
      while (j < n) { const d = src[j]; if (d === "\\") { j += 2; continue; } if (d === "[") cls = true; else if (d === "]") cls = false; else if ((d === "/" && !cls) || d === "\n") break; j++; }
      j++; while (j < n && /[a-z]/.test(src[j])) j++; push("re", src.slice(i, j), i, j); i = j; continue;
    }
    if (c === "}" && tpl.length && depth - 1 === tpl[tpl.length - 1]) { tpl.pop(); depth--; push("p", "}", i, i + 1); i = tplScan(i + 1); continue; }
    const p = PUNCT.find(x => src.startsWith(x, i)) || c;
    if (p === "{") depth++; else if (p === "}") depth--;
    push("p", p, i, i + p.length); i += p.length;
  }
  // bracket matching + object-key paths for every token
  const OPEN = { "(": ")", "[": "]", "{": "}", "${": "}" }, st = [], frames = [];
  T.forEach((t, k) => {
    t.path = frames.filter(f => f.v === "{").map(f => f.key).filter(Boolean);
    if (t.t === "p" && OPEN[t.v]) { st.push(k); frames.push({ v: t.v, key: null }); }
    else if (t.t === "p" && (t.v === ")" || t.v === "]" || t.v === "}")) { const o = st.pop(); if (o != null) { T[o].m = k; t.m = o; } frames.pop(); }
    else if ((t.t === "id" || t.t === "str" || t.t === "num") && T[k + 1] && T[k + 1].v === ":" && T[k - 1] && (T[k - 1].v === "{" || T[k - 1].v === ",")) {
      const f = frames[frames.length - 1]; if (f && f.v === "{") { f.key = t.v; t.isKey = true; }
    }
  });
  return T;
}
const tokAt = (T, off) => { let lo = 0, hi = T.length; while (lo < hi) { const m = (lo + hi) >> 1; if (T[m].s < off) lo = m + 1; else hi = m; } return lo; };

/* ================================================================ *
 *  SOURCE: top-level units (helpers, consts, statements)
 * ================================================================ */
function units(src, T) {
  const U = []; let i = 0;
  const nl = (a, b) => /\n/.test(src.slice(a.e, b.s));
  const START = new Set(["export", "const", "let", "var", "function", "async", "import", "class"]);
  function stmtEnd(k, start) {
    while (k < T.length) {
      const t = T[k];
      if (t.m != null && t.m > k) { k = t.m + 1; continue; }
      if (t.v === ";") return k + 1;
      if (k > start + 1 && t.t === "id" && START.has(t.v) && nl(T[k - 1], t) && !(T[k - 1].t === "p" && /[=,(+?:]$/.test(T[k - 1].v))) return k;
      k++;
    }
    return k;
  }
  while (i < T.length) {
    const a = i; let exported = false;
    if (T[i].v === "import") { i = stmtEnd(i, a); continue; }
    if (T[i].v === "export") { exported = true; i++; if (T[i] && T[i].v === "default") i++; }
    let k = i;
    if (T[k] && T[k].v === "async") k++;
    if (T[k] && T[k].v === "function") {
      const name = T[k + 1] && T[k + 1].t === "id" ? T[k + 1].v : "(anon)";
      let p = k + 1; while (p < T.length && T[p].v !== "(") p++;
      const body = T[p].m + 1, end = T[body] && T[body].m != null ? T[body].m + 1 : stmtEnd(k, a);
      U.push({ name, kind: "fn", a, b: end, exported }); i = end; continue;
    }
    if (T[k] && (T[k].v === "const" || T[k].v === "let" || T[k].v === "var")) {
      const name = T[k + 1] && T[k + 1].t === "id" ? T[k + 1].v : "(pattern)";
      const end = stmtEnd(k, a), r = k + 3, t = T[r];
      let kind = "data";
      if (t && (t.v === "async" || t.v === "function")) kind = "fn";
      else if (t && t.v === "(" && T[t.m + 1] && T[t.m + 1].v === "=>") kind = "fn";
      else if (t && t.t === "id" && T[r + 1] && T[r + 1].v === "=>") kind = "fn";
      let strs = null;   // a const array of plain strings, e.g. PROOFS = ["proofGrim", …]
      if (t && t.v === "[" && t.m != null) { const inner = T.slice(r + 1, t.m).filter(x => x.v !== ","); if (inner.length && inner.every(x => x.t === "str")) strs = inner.map(x => x.v); }
      U.push({ name, kind, a, b: end, exported, strs }); i = end; continue;
    }
    const end = Math.max(stmtEnd(i, a), i + 1);
    const callee = T[i].t === "id" ? T[i].v : "";
    const firstStr = T.slice(i, Math.min(end, i + 6)).find(x => x.t === "str");
    U.push({ name: callee ? `${callee}(${firstStr ? JSON.stringify(firstStr.v) : "…"})` : "(statement)", kind: "expr", a, b: end, callee, arg: firstStr && firstStr.v });
    i = end;
  }
  U.forEach(u => { u.s = T[u.a] ? T[u.a].s : 0; u.e = T[u.b - 1] ? T[u.b - 1].e : 0; });
  return U;
}

/* ================================================================ *
 *  EFFECTS of a token range: flags read/written, items, convos, rooms, deaths …
 * ================================================================ */
const newEff = () => ({ reads: new Map(), writes: new Set(), gives: new Set(), takes: new Set(), needs: new Set(), convos: new Set(), rooms: new Set(),
  deaths: [], endAct: false, shifts: [], cast: [], scores: [], helpers: new Set(), uses: new Set(), conds: [], dynamic: false });
function addRead(E, k, neg) { const r = E.reads.get(k) || { pos: false, neg: false }; r[neg ? "neg" : "pos"] = true; E.reads.set(k, r); }
export function mergeEff(E, F) {
  for (const [k, r] of F.reads) { if (r.pos) addRead(E, k, false); if (r.neg) addRead(E, k, true); }
  for (const s of ["writes", "gives", "takes", "needs", "convos", "rooms", "helpers", "uses"]) F[s].forEach(x => E[s].add(x));
  E.deaths.push(...F.deaths); E.shifts.push(...F.shifts); E.cast.push(...F.cast); E.scores.push(...F.scores); E.conds.push(...F.conds);
  E.endAct = E.endAct || F.endAct; E.dynamic = E.dynamic || F.dynamic;
  return E;
}
export const hasEff = (E) => !!(E.reads.size || E.writes.size || E.gives.size || E.takes.size || E.needs.size || E.convos.size || E.rooms.size
  || E.deaths.length || E.endAct || E.shifts.length || E.cast.length || E.uses.size);

function chainStart(T, i) { let j = i; while (T[j - 1] && (T[j - 1].v === "." || T[j - 1].v === "?.") && T[j - 2] && T[j - 2].t === "id") j -= 2; return j; }
const negBefore = (T, i) => { const j = chainStart(T, i); return !!(T[j - 1] && T[j - 1].v === "!"); };
const ASSIGN = new Set(["=", "+=", "-=", "||=", "&&=", "??="]);
function objStrings(T, open) { const o = {}; if (!T[open] || T[open].m == null) return o;
  for (let k = open + 1; k < T[open].m; k++) {
    const t = T[k]; if (t.m != null && t.m > k && t.v !== "[") { k = t.m; continue; }
    if ((t.t === "id" || t.t === "str") && T[k + 1] && T[k + 1].v === ":") {
      const v = T[k + 2];
      if (v && v.t === "str") o[t.v] = v.v;
      else if (v && v.v === "[" && v.m != null) o[t.v] = T.slice(k + 3, v.m).filter(x => x.t === "str").map(x => x.v);
      else if (v && (v.v === "true" || v.v === "false" || v.t === "num")) o[t.v] = v.v;
    }
  }
  return o;
}

function findAliases(T, a, b) {   // const f = G.flags  /  f = api.G.flags
  const s = new Set();
  for (let i = a; i < b; i++) if (T[i].v === "flags" && T[i + 1] && (T[i + 1].v === "," || T[i + 1].v === ";" || T[i + 1].v === ")")) {
    const j = chainStart(T, i); if (T[j - 1] && T[j - 1].v === "=" && T[j - 2] && T[j - 2].t === "id") s.add(T[j - 2].v);
  }
  return s;
}
function effects(S, a, b, seen) {
  const T = S.toks, E = newEff(), u = S.units.find(u => a >= u.a && a < u.b), aliases = findAliases(T, u ? u.a : a, b);
  const flagMember = (i, name) => {        // X.flags.name / alias.name
    const op = T[i + 1];
    if (op && ASSIGN.has(op.v)) E.writes.add(name); else addRead(E, name, negBefore(T, i - 2));
  };
  for (let i = a; i < b; i++) {
    const t = T[i], prev = T[i - 1], next = T[i + 1];
    if (t.t === "str") {
      let m;
      if ((m = /^c:(\w+)$/.exec(t.v))) E.convos.add(m[1]);
      else if ((m = /^(\w+)@(\w+)$/.exec(t.v))) E.rooms.add(t.v);
      continue;
    }
    if (t.t !== "id") continue;
    const member = prev && (prev.v === "." || prev.v === "?.");
    // conditions on state (for gates): G.mode === "day", G.room === "lab", G.char === "gus"
    if (member && (t.v === "mode" || t.v === "room" || t.v === "char") && next && (next.v === "===" || next.v === "!==") && T[i + 2] && T[i + 2].t === "str")
      E.conds.push([t.v, (next.v === "!==" ? "≠" : "=") + T[i + 2].v]);
    if (member && next && next.v === "(") {
      const arg = T[i + 2], arg2 = T[i + 3], s = arg && arg.t === "str" ? arg.v : null, close = next.m;
      switch (t.v) {
        case "flag": if (s == null) { E.dynamic = true; break; } if (arg2 && arg2.v === ",") E.writes.add(s); else addRead(E, s, negBefore(T, i)); break;
        case "give": if (s) E.gives.add(s); break;
        case "take": if (s) E.takes.add(s); break;
        case "has": if (s) E.needs.add(s); break;
        case "convo": case "runConvo": if (s) E.convos.add(s); break;
        case "goRoom": E.rooms.add(s || "?@?"); break;
        case "die": { const lit = T.slice(i + 2, close).find(x => x.t === "str"); E.deaths.push(lit ? lit.v : "(death)"); break; }
        case "endAct": E.endAct = true; break;
        case "score": if (s) E.scores.push([s, arg2 && arg2.v === "," && T[i + 4] ? T[i + 4].v : ""]); break;
        case "shift": if (arg && arg.v === "{") { const o = objStrings(T, i + 2); E.shifts.push(o); if (Array.isArray(o.cast)) E.cast.push(...o.cast); } break;
        case "use": if (s && prev && T[i - 2] && T[i - 2].v === "api") E.uses.add(s); break;
      }
    }
    if (t.v === "flags") {
      if (next && next.v === "." && T[i + 2] && T[i + 2].t === "id") { flagMember(i + 2, T[i + 2].v); continue; }
      if (next && next.v === "[") { E.dynamic = true; continue; }
      if (next && next.v === "=" && T[i + 2] && T[i + 2].v === "{") { Object.keys(objStrings(T, i + 2)).forEach(k => E.writes.add(k)); continue; }
      if (next && next.v === "," && T[i + 2] && T[i + 2].v === "{") { Object.keys(objStrings(T, i + 2)).forEach(k => E.writes.add(k)); continue; }
      if (next && (next.v === "," || next.v === ";" || next.v === ")")) { const j = chainStart(T, i); if (T[j - 1] && T[j - 1].v === "=" && T[j - 2] && T[j - 2].t === "id") aliases.add(T[j - 2].v); }
      continue;
    }
    if (!member && aliases.has(t.v) && next) {
      if (next.v === "." && T[i + 2] && T[i + 2].t === "id") flagMember(i + 2, T[i + 2].v);
      else if (next.v === "[") E.dynamic = true;
      continue;
    }
    if (t.v === "cast" && next && (next.v === "=" || next.v === ":") && T[i + 2] && T[i + 2].v === "[" && T[i + 2].m != null)
      E.cast.push(...T.slice(i + 3, T[i + 2].m).filter(x => x.t === "str").map(x => x.v));
    // a call to a module helper: fold its effects in
    if (!member && next && next.v === "(" && !(prev && prev.v === "function")) {
      const h = S.helpers.get(t.v);
      if (h && !seen.has(t.v)) { E.helpers.add(t.v); mergeEff(E, effects(S, h.a, h.b, new Set([...seen, t.v]))); }
    }
  }
  if (E.dynamic) for (let i = a; i < b; i++) { const t = T[i]; if (t.t === "id" && S.strArrays.has(t.v)) S.strArrays.get(t.v).forEach(k => addRead(E, k, false)); }
  return E;
}

/* ================================================================ *
 *  STRING LITERALS inside functions
 * ================================================================ */
const DENY = new Set(["flag", "give", "take", "has", "score", "goRoom", "convo", "runConvo", "status", "use", "keypad", "seg", "segC", "segW", "chip", "chipW",
  "cchip", "centered", "button", "rpath", "querySelector", "querySelectorAll", "setAttribute", "getItem", "setItem", "includes", "startsWith", "endsWith",
  "split", "replace", "padStart", "padEnd", "import", "fetch", "poseSet", "toggle", "add", "remove", "extras", "blip", "pose", "mini", "fogNeuro", "indexOf",
  "has", "get", "set", "test", "exec", "match", "hit", "arcs", "perspective", "shell", "sideDoor", "Error", "log", "warn", "error"]);
const isProse = (t) => { const s = t.trim(); return s.length >= 2 && /[A-Za-z]/.test(s) && (/\s/.test(s) || /[.!?…"')\]]$/.test(s))
  && !/<\/?[a-z]+[\s/>]/i.test(s) && !/="|\/>/.test(s) && !/^c:\w+$/.test(s) && !/^\w+@\w+$/.test(s) && !/^[\w.-]+\.(js|html|css|json)$/.test(s); };
const DRAWING = /\bseg\(|\bsegC\(|<(rect|path|circle|g|text|line)\b/;
function callCtx(T, i) {
  let d = 0;
  for (let j = i - 1; j >= 0; j--) {
    const t = T[j];
    if (t.t !== "p") continue;
    if (t.v === ")" || t.v === "]" || t.v === "}") { d++; continue; }
    if (t.v === "(" || t.v === "[" || t.v === "{" || t.v === "${") {
      if (d > 0) { d--; continue; }
      const p = T[j - 1];
      if (t.v === "(" && p && p.t === "id" && !["if", "while", "for", "switch", "return", "typeof", "catch", "await"].includes(p.v)) return p.v;
      if (t.v === "{" && p && (p.v === "=>" || p.v === ")" || p.v === "else" || p.v === "try")) return "";
    }
  }
  return "";
}

/* ================================================================ *
 *  THE MODEL
 * ================================================================ */
// entry: { key, act, path, orig, kind, where, ... } — kind: say | line | choice | label | name | title | lit
// fn record: { id, act, fn, locs: [loc], range: {src, a, b}, eff, lits: [entry], helpers }
export function buildModel(acts, ITEMS) {
  const model = { acts: [], entries: new Map(), litsByText: new Map(), items: {}, itemOwner: {}, convoAct: {} };
  const srcs = acts.filter(a => a.src).map(a => {
    const toks = tokenize(a.src), U = units(a.src, toks);
    const helpers = new Map(U.filter(u => u.kind === "fn").map(u => [u.name, u]));
    const strArrays = new Map(U.filter(u => u.strs).map(u => [u.name, u.strs]));
    return { act: a.n, src: a.src, toks, units: U, helpers, strArrays };
  });
  const S = (n) => srcs.find(s => s.act === n);
  const addEntry = (e) => { if (!model.entries.has(e.key)) model.entries.set(e.key, e); return model.entries.get(e.key); };

  // which act defines each item (its "id: { name:" lives in that act's source)
  for (const id of Object.keys(ITEMS || {})) {
    const re = new RegExp(`(^|[\\s{,])${id.replace(/\W/g, "")}\\s*:\\s*\\{\\s*name\\s*:`);
    const owner = srcs.find(s => re.test(s.src)); model.itemOwner[id] = owner ? owner.act : 1;
  }
  const fnRecs = new Map();     // fn → record
  const rec = (fn, act, loc) => {
    let r = fnRecs.get(fn);
    if (!r) { r = { id: "f" + fnRecs.size, act, fn, locs: [], lits: [], eff: newEff() }; fnRecs.set(fn, r); }
    r.locs.push(loc); return r;
  };

  for (const A of acts) {
    const a = { n: A.n, error: A.error, rooms: [], convos: [], items: [], title: null, end: [], fns: [], gates: [], other: [], helpers: [], dataTexts: new Set() };
    model.acts.push(a);
    const M = A.mod; if (!M) continue;
    const put = (path, text, x) => { a.dataTexts.add(text); return addEntry({ key: `${A.n}|${path}`, act: A.n, path, orig: text, ...x }); };
    // HS
    const seen = new Map();
    for (const [room, hsAll] of Object.entries(M.HS || {})) {
      const R = { id: room, hotspots: [] }; a.rooms.push(R);
      for (const [id, h] of Object.entries(hsAll)) {
        const H = { id, label: null, keys: [] }; R.hotspots.push(H);
        if (typeof h.label === "string") H.label = put(`HS.${room}.${id}.label`, h.label, { kind: "label", where: [room, id, "label"] });
        else if (typeof h.label === "function") H.labelFn = rec(h.label, A.n, { t: "hs", room, id, key: "*", verb: "label" });
        for (const [key, v] of Object.entries(h)) {
          if (key === "label" || !v || typeof v !== "object") continue;
          const canon = seen.get(v); const base = canon || `HS.${room}.${id}.${key}`; if (!canon) seen.set(v, base);
          const K = { key, shared: canon || null, verbs: [], score: v.score || null }; H.keys.push(K);
          for (const [verb, val] of Object.entries(v)) {
            if (verb === "score") continue;
            const loc = { t: "hs", room, id, key, verb };
            if (verb === "go" && val && typeof val === "object") {
              for (const [ex, gv] of Object.entries(val)) K.verbs.push(verbOf(`${base}.go.${ex}`, gv, { ...loc, verb: "go:" + ex }));
            } else K.verbs.push(verbOf(`${base}.${verb}`, val, loc));
          }
        }
      }
    }
    function verbOf(path, val, loc) {
      const V = { verb: loc.verb, loc };
      if (typeof val === "string") {
        if (/^c:\w+$/.test(val)) V.convo = val.slice(2);
        else if (/^\w+@\w+$/.test(val)) V.nav = val;
        else V.entry = put(path, val, { kind: "say", where: [loc.room, loc.id, loc.key, loc.verb] });
      } else if (typeof val === "function") V.fn = rec(val, A.n, loc);
      return V;
    }
    // WITH
    a.withs = [];
    for (const [rid, items] of Object.entries(M.WITH || {})) for (const [item, val] of Object.entries(items)) {
      const [room, id] = rid.split(".");
      const loc = { t: "with", room, id, item, verb: "with:" + item };
      const V = { verb: "USE " + item, loc, item, room, id };
      if (typeof val === "string") { if (/^c:\w+$/.test(val)) V.convo = val.slice(2); else V.entry = put(`WITH.${rid}.${item}`, val, { kind: "say", where: [room, id, "use " + item] }); }
      else if (typeof val === "function") V.fn = rec(val, A.n, loc);
      a.withs.push(V);
    }
    // CONVOS
    for (const [name, c] of Object.entries(M.CONVOS || {})) {
      model.convoAct[name] = model.convoAct[name] || A.n;
      const C = { name, L: c.L, R: c.R, score: c.score, lines: [], retry: false };
      const lineEntry = (path, l, depth) => ({ side: l[0], fx: l[2], depth, entry: put(path, l[1], { kind: "line", side: l[0], convo: name, where: [name] }) });
      (c.lines || []).forEach((l, i) => {
        if (Array.isArray(l)) C.lines.push(lineEntry(`CONVOS.${name}.lines.${i}.1`, l, 0));
        else if (l && l.choice) C.lines.push({ choice: l.choice.map((ch, j) => ({
          text: put(`CONVOS.${name}.lines.${i}.choice.${j}.text`, ch.text, { kind: "choice", side: "L", convo: name, where: [name] }),
          correct: ch.correct, score: ch.score,
          lines: (ch.lines || []).map((cl, k) => lineEntry(`CONVOS.${name}.lines.${i}.choice.${j}.lines.${k}.1`, cl, 1)) })), retry: !!l.retry });
      });
      if (typeof c.after === "function") C.after = rec(c.after, A.n, { t: "convo", convo: name, verb: "after" });
      a.convos.push(C);
    }
    // TITLE / END
    if (Array.isArray(M.TITLE)) a.title = M.TITLE.map((t, i) => typeof t === "string" ? put(`TITLE.${i}`, t, { kind: "title", where: ["TITLE"] }) : null);
    if (M.END && typeof M.END === "object") for (const [k, v] of Object.entries(M.END)) if (typeof v === "string") a.end.push([k, put(`END.${k}`, v, { kind: k === "epilogue" ? "say" : "title", where: ["END", k] })]);
    // exported functions: start, check, onSwitch, debug…
    for (const [k, v] of Object.entries(M)) if (typeof v === "function" && /^[a-z]/.test(k)) a.fns.push({ name: k, r: rec(v, A.n, { t: "exp", name: k, verb: k }) });
  }
  // ITEMS (shared): attribute to the act that defines them
  for (const [id, it] of Object.entries(ITEMS || {})) {
    const n = model.itemOwner[id], a = model.acts.find(x => x.n === n) || model.acts[0];
    const I = { id, name: null, verbs: [] }; a.items.push(I);
    const put = (path, text, x) => { a.dataTexts.add(text); return addEntry({ key: `${n}|${path}`, act: n, path, orig: text, ...x }); };
    if (typeof it.name === "string") I.name = put(`ITEMS.${id}.name`, it.name, { kind: "name", where: ["ITEMS", id, "name"] });
    for (const [k, v] of Object.entries(it)) {
      if (k === "name" || k === "g") continue;
      const loc = { t: "item", item: id, verb: k };
      if (typeof v === "string") I.verbs.push({ verb: k, loc, entry: put(`ITEMS.${id}.${k}`, v, { kind: "say", where: ["ITEMS", id, k] }) });
      else if (typeof v === "function") I.verbs.push({ verb: k, loc, fn: rec(v, n, loc) });
    }
  }

  // locate every function in source, analyze it, and attach its literals
  for (const r of fnRecs.values()) {
    const text = r.fn.toString();
    let s = S(r.act), off = s ? s.src.indexOf(text) : -1;
    if (off < 0) for (const o of srcs) { off = o.src.indexOf(text); if (off >= 0) { s = o; break; } }
    if (off < 0) continue;
    r.S = s; r.a = tokAt(s.toks, off); r.b = tokAt(s.toks, off + text.length); r.s = off; r.e = off + text.length;
    r.eff = effects(s, r.a, r.b, new Set());
    r.drawing = DRAWING.test(text);
  }
  // api.use("id") → fold in that hotspot's use
  for (const r of fnRecs.values()) for (const id of r.eff.uses) {
    const room = r.locs[0] && r.locs[0].room, M = (acts.find(x => x.n === r.act) || {}).mod;
    const h = M && M.HS && M.HS[room] && M.HS[room][id];
    const u = h && Object.values(h).map(v => v && v.use).find(f => typeof f === "function");
    const ur = u && fnRecs.get(u); if (ur && ur !== r) mergeEff(r.eff, ur.eff);
  }

  // literals
  for (const s of srcs) {
    const a = model.acts.find(x => x.n === s.act);
    const recs = [...fnRecs.values()].filter(r => r.S === s).sort((x, y) => (x.e - x.s) - (y.e - y.s));
    const helperLits = new Map();
    s.toks.forEach((t, i) => {
      if (t.t !== "str" || t.isKey || !isProse(t.v)) return;
      const ctx = callCtx(s.toks, i); if (DENY.has(ctx)) return;
      const frag = !!t.tpl || (s.toks[i - 1] && s.toks[i - 1].v === "+") || (s.toks[i + 1] && s.toks[i + 1].v === "+");
      const hook = ctx === "card" ? "card" : ctx === "chooseFrom" || (!/[a-z]/.test(t.v) && !t.v.includes("|")) ? "ui" : ctx === "die" ? "die" : "say";
      const r = recs.find(r => t.s >= r.s && t.e <= r.e);
      const u = s.units.find(u => t.s >= u.s && t.e <= u.e);
      if (r) { if (r.drawing) return; const e = litEntry(s.act, t.v, { hook, frag, where: r.locs[0] }); if (!r.lits.includes(e)) r.lits.push(e); (r.litOff ||= new Map()).set(e.key, t.s); return; }
      if (!u) return;
      if (u.kind === "fn") {
        const text = s.src.slice(u.s, u.e); if (DRAWING.test(text)) return;
        if (!helperLits.has(u.name)) helperLits.set(u.name, []);
        helperLits.get(u.name).push(litEntry(s.act, t.v, { hook, frag, where: { t: "helper", name: u.name } })); return;
      }
      if (a.dataTexts.has(t.v) || [...model.entries.values()].some(e => e.orig === t.v && !e.lit)) return;   // plain data, edited by path
      const keyPath = [u.kind === "expr" ? u.name : u.name, ...t.path.filter(k => k !== u.name)];
      a.other.push({ unit: u, keyPath, entry: litEntry(s.act, t.v, { hook, frag, where: { t: "other", unit: u.name, path: keyPath } }) });
    });
    for (const [name, lits] of helperLits) a.helpers.push({ name, lits, unit: s.units.find(u => u.name === name) });
    a.S = s;
  }
  function litEntry(act, text, x) {
    const key = `${act}|LIT|${text}`;
    const e = addEntry({ key, act, path: "LIT|" + text, orig: text, kind: "lit", lit: true, ...x });
    (e.wheres ||= []).push(x.where);
    return e;
  }
  model.fnRecs = fnRecs;
  for (const a of model.acts) buildGraph(model, a, [...fnRecs.values()].filter(r => r.act === a.n));
  return model;
}

/* ================================================================ *
 *  THE LOGIC GRAPH (per act)
 * ================================================================ */
export function locName(l) {
  if (!l) return "";
  if (l.t === "hs") return `${l.room} · ${l.id} · ${l.verb === "label" ? "label" : l.verb.toUpperCase()}`;
  if (l.t === "with") return `USE ${l.item} ON ${l.room} · ${l.id}`;
  if (l.t === "convo") return `convo ${l.convo} · after`;
  if (l.t === "item") return `item ${l.item} · ${l.verb.toUpperCase()}`;
  if (l.t === "exp") return `${l.name}()`;
  if (l.t === "helper") return `${l.name}()`;
  if (l.t === "other") return l.path.join(" · ");
  return "";
}
function buildGraph(model, a, recs) {
  const N = new Map(), E = [];
  const node = (id, x) => { if (!N.has(id)) N.set(id, { id, act: a.n, ...x, in: [], out: [] }); return N.get(id); };
  const edge = (from, to, kind) => { if (from === to) return; if (E.some(e => e.from === from && e.to === to && e.kind === kind)) return; E.push({ from, to, kind }); };
  const flagN = (k) => node("flag:" + k, { kind: "flag", label: k });
  const itemN = (k) => node("item:" + k, { kind: "item", label: k });
  const convoN = (k) => node("convo:" + k, { kind: "convo", label: k, openers: [], eff: newEff() });
  const modeN = (k) => node("mode:" + k, { kind: "mode", label: k.toUpperCase() });
  const startMode = (() => { const st = recs.find(r => r.locs.some(l => l.t === "exp" && l.name === "start")); const sh = st && st.eff.shifts.find(s => s.mode); return sh ? sh.mode : "day"; })();
  const wire = (id, eff) => {
    for (const [k, r] of eff.reads) { flagN(k); edge("flag:" + k, id, r.pos ? "read" : "guard"); }
    for (const k of eff.writes) { flagN(k); edge(id, "flag:" + k, "write"); }
    for (const k of eff.gives) { itemN(k); edge(id, "item:" + k, "give"); }
    for (const k of new Set([...eff.takes, ...eff.needs])) { itemN(k); edge("item:" + k, id, eff.takes.has(k) ? "take" : "need"); }
    for (const k of eff.convos) { convoN(k); edge(id, "convo:" + k, "open"); }
    if (N.get(id).kind !== "start") for (const s of eff.shifts) if (s.mode) { modeN(s.mode); edge(id, "mode:" + s.mode, "mode"); }
    if (eff.cast.includes("morris")) { modeN("morris"); edge(id, "mode:morris", "mode"); }
  };
  const modesOf = (r) => [...new Set(r.locs.map(l => l.key).filter(k => k && k !== "*"))];
  // actions
  for (const r of recs) {
    const l0 = r.locs[0];
    if (l0.t === "exp" && /^debug/.test(l0.name)) continue;
    if (l0.t === "exp" && l0.name === "check") continue;      // split into gates below
    if (l0.t === "convo") continue;                          // folded into the convo node
    if (!hasEff(r.eff)) continue;
    const id = "fn:" + r.id;
    node(id, { kind: l0.t === "exp" ? (l0.name === "start" ? "start" : "exp") : "action", label: locName(l0), rec: r, locs: r.locs, eff: r.eff, modes: modesOf(r) });
  }
  // conversations: their after(), choice scores, and who opens them
  for (const C of a.convos) {
    const n = convoN(C.name); n.convo = C;
    if (C.after) { n.rec = C.after; n.eff = C.after.eff; }
  }
  // plain-string openers ("c:name") and plain WITH conversations
  for (const R of a.rooms) for (const H of R.hotspots) for (const K of H.keys) for (const V of K.verbs) if (V.convo) { const c = convoN(V.convo); c.openers.push(V.loc); }
  for (const V of a.withs) if (V.convo) { const c = convoN(V.convo); c.openers.push(V.loc); itemN(V.item); edge("item:" + V.item, "convo:" + V.convo, "need"); }
  for (const V of a.withs) if (V.fn && N.has("fn:" + V.fn.id)) { itemN(V.item); edge("item:" + V.item, "fn:" + V.fn.id, "need"); }
  // gates: each if() at the top of check()
  const chk = recs.find(r => r.locs.some(l => l.t === "exp" && l.name === "check"));
  if (chk && chk.S) {
    const T = chk.S.toks; let body = chk.a; while (body < chk.b && T[body].v !== "{") body++;
    const bodyEnd = T[body] && T[body].m != null ? T[body].m : chk.b;
    let g = 0;
    for (let i = body + 1; i < bodyEnd; i++) {
      const t = T[i];
      if (t.m != null && t.m > i && !(t.v === "(" && T[i - 1] && T[i - 1].v === "if")) { i = t.m; continue; }
      if (t.v !== "if" || !T[i + 1] || T[i + 1].v !== "(") continue;
      const c0 = i + 1, c1 = T[c0].m; let b0 = c1 + 1, b1;
      if (T[b0] && T[b0].v === "{") b1 = T[b0].m; else { b1 = b0; while (b1 < bodyEnd && T[b1].v !== ";") { if (T[b1].m != null && T[b1].m > b1) b1 = T[b1].m; b1++; } }
      const cond = effects(chk.S, c0, c1 + 1, new Set()), act = effects(chk.S, b0, b1 + 1, new Set());
      // a write inside the body of a flag the condition requires to be off = the gate's once-only latch
      const latch = [...cond.reads].filter(([k, r]) => r.neg && !r.pos && act.writes.has(k)).map(([k]) => k);
      const eff = mergeEff(newEff(), act); for (const [k, r] of cond.reads) if (!latch.includes(k)) { if (r.pos) addRead(eff, k, false); if (r.neg) addRead(eff, k, true); }
      const lits = chk.lits.filter(e => { const o = chk.litOff && chk.litOff.get(e.key); return o != null && o >= T[b0].s && o <= (T[b1] || T[bodyEnd]).e; });
      g++;
      node("gate:" + g, { kind: "gate", label: "GATE " + g, rec: chk, eff, conds: cond.conds, latch,
        modes: cond.conds.filter(c => c[0] === "mode" && c[1][0] === "=").map(c => c[1].slice(1)), cond: [...cond.reads], src: chk.S.src.slice(T[c0].s, T[c1].e), lits });
      i = b1;
    }
    a.gates = [...N.values()].filter(n => n.kind === "gate");
  }
  // top-level statements that do things (e.g. wrapLook("notebook", …) re-writing an item's look)
  if (a.S) for (const u of a.S.units) {
    if (u.kind !== "expr") continue;
    if (recs.some(r => r.S === a.S && r.s >= u.s && r.e <= u.e)) continue;
    const eff = effects(a.S, u.a, u.b, new Set()); if (!hasEff(eff)) continue;
    node("expr:" + u.name, { kind: "action", label: u.arg && model.itemOwner[u.arg] != null ? `item ${u.arg} · LOOK (act ${a.n})` : u.name, eff, modes: [], unit: u });
  }
  for (const n of [...N.values()]) if (n.eff) wire(n.id, n.eff);
  // which shifts each node can happen in: hotspot keys; USE-ON takes its hotspot's keys; conversations their openers'
  const hsKeys = (room, id) => { const R = a.rooms.find(r => r.id === room), H = R && R.hotspots.find(h => h.id === id); return H ? H.keys.map(k => k.key) : []; };
  for (const n of N.values()) {
    if (n.kind === "convo") n.modes = [...new Set(n.openers.flatMap(l => l.key ? [l.key] : hsKeys(l.room, l.id)))];
    else if (n.locs && n.locs.some(l => l.t === "with")) n.modes = [...new Set(n.locs.flatMap(l => l.t === "with" ? hsKeys(l.room, l.id) : l.key ? [l.key] : []))];
  }
  for (const e of E) { N.get(e.from).out.push(e); N.get(e.to).in.push(e); }
  // things that only happen in a later shift hang off that shift (Morris, night, morning)
  for (const n of [...N.values()]) {
    if (!n.modes || !n.modes.length || n.modes.includes(startMode) || n.kind === "gate") continue;
    const m = n.modes.find(k => N.has("mode:" + k)); if (!m) continue;
    const e = { from: "mode:" + m, to: n.id, kind: "shift" }; E.push(e); N.get(e.from).out.push(e); n.in.push(e);
  }
  a.graph = { nodes: [...N.values()], edges: E, startMode };
}

/* ================================================================ *
 *  LAYOUT: longest-path layers (cycles broken by DFS), barycenter ordering
 * ================================================================ */
export function layout(graph, { hidePassive = false, dims = null } = {}) {
  let nodes = graph.nodes;
  if (hidePassive) nodes = nodes.filter(n => !(n.kind === "action" && n.eff && !n.eff.writes.size && !n.eff.gives.size && !n.eff.convos.size && !n.eff.deaths.length
    && !n.eff.shifts.length && !n.eff.endAct && !n.eff.takes.size && !n.eff.rooms.size && n.locs && n.locs.every(l => l.verb === "look" || l.verb === "label")));
  const ids = new Set(nodes.map(n => n.id));
  const edges = graph.edges.filter(e => ids.has(e.from) && ids.has(e.to));
  const out = new Map(nodes.map(n => [n.id, []])), inn = new Map(nodes.map(n => [n.id, []]));
  edges.forEach(e => { out.get(e.from).push(e); inn.get(e.to).push(e); });
  const linked = nodes.filter(n => out.get(n.id).length || inn.get(n.id).length);
  const loose = nodes.filter(n => !out.get(n.id).length && !inn.get(n.id).length);
  // break cycles: inside a strongly connected loop, cut flag reads first (they're usually refusals:
  // "if (fedMorris) return 'enough pizza'"), then anything left over by DFS from the roots
  const back = new Set();
  const sccOf = (E) => {
    const idx = new Map(), low = new Map(), on = new Set(), st = [], comp = new Map(); let i = 0, c = 0;
    const adj = new Map(linked.map(n => [n.id, []])); E.forEach(e => adj.get(e.from) && adj.get(e.from).push(e.to));
    const visit = (v) => { idx.set(v, i); low.set(v, i); i++; st.push(v); on.add(v);
      for (const w of adj.get(v)) { if (!idx.has(w)) { visit(w); low.set(v, Math.min(low.get(v), low.get(w))); } else if (on.has(w)) low.set(v, Math.min(low.get(v), idx.get(w))); }
      if (low.get(v) === idx.get(v)) { let w; do { w = st.pop(); on.delete(w); comp.set(w, c); } while (w !== v); c++; } };
    linked.forEach(n => idx.has(n.id) || visit(n.id));
    return comp;
  };
  for (const kinds of [["guard"], ["read"]]) {
    const live = edges.filter(e => !back.has(e)), comp = sccOf(live);
    live.forEach(e => { if (kinds.includes(e.kind) && comp.get(e.from) === comp.get(e.to)) back.add(e); });
  }
  const rank = (n) => n.kind === "start" ? 0 : n.kind === "mode" ? 3 : n.kind === "convo" ? 1 : 2;
  const roots = linked.filter(n => !inn.get(n.id).length).sort((a, b) => rank(a) - rank(b));
  const state = new Map();
  const dfs = (id) => { state.set(id, 1); for (const e of out.get(id)) { if (back.has(e)) continue; const s = state.get(e.to); if (s === 1) back.add(e); else if (!s) dfs(e.to); } state.set(id, 2); };
  roots.forEach(n => state.get(n.id) || dfs(n.id)); linked.forEach(n => state.get(n.id) || dfs(n.id));
  const fwd = edges.filter(e => !back.has(e));
  const fout = new Map(linked.map(n => [n.id, []])), fin = new Map(linked.map(n => [n.id, []]));
  fwd.forEach(e => { fout.get(e.from).push(e.to); fin.get(e.to).push(e.from); });
  // longest path from sources
  const L = new Map(), order = [];
  const indeg = new Map(linked.map(n => [n.id, fin.get(n.id).length]));
  const q = linked.filter(n => !indeg.get(n.id)).map(n => n.id);
  while (q.length) { const id = q.shift(); order.push(id); L.set(id, Math.max(0, ...fin.get(id).map(p => L.get(p) + 1))); for (const c of fout.get(id)) { indeg.set(c, indeg.get(c) - 1); if (!indeg.get(c)) q.push(c); } }
  // sources slide right to sit just before their first consumer
  for (let pass = 0; pass < 3; pass++) for (const id of [...order].reverse()) {
    if (fin.get(id).length || !fout.get(id).length) continue;
    L.set(id, Math.max(0, Math.min(...fout.get(id).map(c => L.get(c))) - 1));
  }
  const nL = Math.max(0, ...L.values()) + 1, cols = Array.from({ length: nL }, () => []);
  linked.forEach(n => cols[L.get(n.id)].push(n.id));
  const pos = new Map();
  const idx = () => cols.forEach(c => c.forEach((id, i) => pos.set(id, i)));
  const kindOrder = { start: 0, gate: 1, convo: 2, action: 3, exp: 3, mode: 4, flag: 5, item: 6 };
  cols.forEach(c => c.sort((a, b) => (kindOrder[graph.nodes.find(n => n.id === a).kind] - kindOrder[graph.nodes.find(n => n.id === b).kind])));
  idx();
  const nbrs = (id, dir) => dir > 0 ? fin.get(id) : fout.get(id);
  for (let s = 0; s < 8; s++) {
    const dir = s % 2 ? -1 : 1;
    const seq = dir > 0 ? cols.slice(1) : cols.slice(0, -1).reverse();
    for (const c of seq) {
      const bc = new Map(c.map(id => { const ns = nbrs(id, dir); return [id, ns.length ? ns.reduce((t, x) => t + pos.get(x), 0) / ns.length : pos.get(id)]; }));
      c.sort((a, b) => bc.get(a) - bc.get(b)); c.forEach((id, i) => pos.set(id, i));
    }
  }
  // coordinates: each column is as wide as its widest node, plus room for the edges
  const W = (id) => (dims ? dims(graph.nodes.find(n => n.id === id)).w : 200);
  const RH = 54, GAP = 70, maxN = Math.max(1, ...cols.map(c => c.length));
  const P = new Map(); let cx = 40;
  cols.forEach((c) => { const cw = Math.max(80, ...c.map(W)), off = (maxN - c.length) * RH / 2; c.forEach((id, i) => P.set(id, { x: cx, y: 50 + off + i * RH })); cx += cw + GAP; });
  const H = 50 + maxN * RH, CW = 236;
  // loose nodes (no connections): a strip below
  const perRow = Math.max(4, Math.floor((cx - 40) / CW));
  loose.forEach((n, i) => P.set(n.id, { x: 40 + (i % perRow) * CW, y: H + 70 + Math.floor(i / perRow) * RH, loose: true }));
  const height = H + (loose.length ? 90 + Math.ceil(loose.length / perRow) * RH : 0);
  return { nodes, edges, back, P, width: Math.max(cx, loose.length ? 40 + perRow * CW : 0), height, looseY: loose.length ? H + 30 : null };
}

// every node upstream / downstream of one
export function chain(graph, id) {
  const up = new Set([id]), down = new Set([id]);
  const go = (set, key, other) => { const st = [id]; while (st.length) { const x = st.pop(); for (const e of graph.edges) if (e[key] === x && !set.has(e[other])) { set.add(e[other]); st.push(e[other]); } } };
  go(up, "to", "from"); go(down, "from", "to");
  return { up, down };
}
// flags that must be on for a node (transitively, positive reads only): for "play with upstream flags"
export function upstreamFlags(graph, id) {
  const { up } = chain(graph, id);
  return [...up].filter(x => x.startsWith("flag:")).map(x => x.slice(5))
    .filter(k => graph.edges.some(e => e.from === "flag:" + k && up.has(e.to) && e.kind === "read") && graph.edges.some(e => e.to === "flag:" + k));
}
