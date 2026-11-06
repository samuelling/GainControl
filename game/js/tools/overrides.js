// GAIN CONTROL — story overrides written in the Script Room (script.html).
//
//   { "<act>|<path>": "new text" }        e.g. "2|CONVOS.tess.lines.3.1", "1|HS.lab.monitor.day.look", "1|ITEMS.thermos.look"
//   { "<act>|LIT|<exact original>": "…" } a string literal inside a function; applied by rewriteSay() at display time
//
// Sources, later wins: game/overrides.json (committed, optional) → localStorage "gaincontrol.overrides" (this browser).

export const STORE = "gaincontrol.overrides";
const FILE = new URL("../../overrides.json", import.meta.url);

export function readLocal() {
  try { const o = JSON.parse(localStorage.getItem(STORE) || "{}"); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; }
}
export function writeLocal(o) { try { localStorage.setItem(STORE, JSON.stringify(o)); } catch (e) {} }
export async function readFile() {
  try {
    const r = await fetch(FILE, { cache: "no-cache" }); if (!r.ok) return {};
    const j = await r.json(); return j && typeof j === "object" && !Array.isArray(j) ? j : {};
  } catch (e) { return {}; }
}
export function splitKey(k) { const i = k.indexOf("|"); return i < 0 ? ["", k] : [k.slice(0, i), k.slice(i + 1)]; }

// Find { parent, key } for a dotted path. A segment may itself contain dots (WITH["lab.drawer"]), so segments are joined greedily.
export function locate(root, path) {
  const s = path.split("."); let o = root, i = 0;
  const has = (o, k) => o != null && (typeof o === "object" || typeof o === "function") && k in o;
  while (i < s.length) {
    let k = s[i], j = i;
    while (!has(o, k) && j + 1 < s.length) { j++; k += "." + s[j]; }
    if (!has(o, k)) return null;
    if (j === s.length - 1) return { parent: o, key: k };
    o = o[k]; i = j + 1;
  }
  return null;
}

/* ---------------- function literals: original text → override ---------------- */
const LIT = new Map();            // act → Map(original → replacement)
let ALL = new Map(), SORTED = new Map();   // union over acts; per-act lists sorted longest-first for substring replacement

function rebuild() {
  ALL = new Map(); SORTED = new Map();
  for (const [act, m] of LIT) { for (const [o, n] of m) if (!ALL.has(o)) ALL.set(o, n); SORTED.set(act, [...m].sort((a, b) => b[0].length - a[0].length)); }
  SORTED.set("*", [...ALL].sort((a, b) => b[0].length - a[0].length));
}

// Mutates the act modules' string data (HS, WITH, CONVOS, TITLE, END …) and the shared ITEMS in place.
// acts: { 1: A1, 2: A2 } or [A1, A2]. Returns the number of overrides applied.
export async function applyOverrides(acts, items) {
  const byAct = Array.isArray(acts) ? Object.fromEntries(acts.map((a, i) => [String(i + 1), a])) : acts;
  const all = { ...(await readFile()), ...readLocal() };
  LIT.clear(); let n = 0;
  for (const [k, v] of Object.entries(all)) {
    if (typeof v !== "string") continue;
    const [act, path] = splitKey(k);
    if (path.startsWith("LIT|")) {
      const orig = path.slice(4); if (orig === v) continue;
      if (!LIT.has(act)) LIT.set(act, new Map()); LIT.get(act).set(orig, v); n++; continue;
    }
    const mod = byAct[act] || byAct[+act];
    const root = path.startsWith("ITEMS.") ? { ITEMS: items || (mod && mod.ITEMS) } : mod;
    const loc = root && locate(root, path);
    if (!loc || loc.parent === mod || typeof loc.parent[loc.key] !== "string") continue;   // namespace bindings are read-only
    try { loc.parent[loc.key] = v; n++; } catch (e) {}
  }
  rebuild();
  return n;
}

// Map a line of text about to be shown (say / speak / die) to its override. Exact matches first, then
// literal fragments (template pieces, concatenations) are replaced wherever they appear.
export function rewriteSay(text) {
  if (typeof text !== "string" || !ALL.size) return text;
  const act = String((typeof window !== "undefined" && window.GC && window.GC.G && window.GC.G.act) || "");
  const mine = LIT.get(act);
  if (mine && mine.has(text)) return mine.get(text);
  if (ALL.has(text)) return ALL.get(text);
  const list = SORTED.get(act) || SORTED.get("*");
  for (const [o, n] of list) if (o.length >= 4 && text.includes(o)) text = text.split(o).join(n);
  return text;
}

/* ---------------- #jump=<act>.<mode>.<room>[&convo=name][&flags=a,b,!c] ---------------- */
// mode is a hotspot key: day | night | morning | morris. Starts the act quietly (no card, no intro),
// shifts to that mode and room, sets any flags, and optionally plays a conversation.
export async function jumpFromHash(hash = location.hash) {
  const m = /^#jump=([^&]+)(.*)$/.exec(hash || ""); if (!m) return false;
  const GC = window.GC; if (!GC) return false;
  const { G, api } = GC;
  const [n, key = "day", room] = decodeURIComponent(m[1]).split(".");
  const q = new URLSearchParams(m[2].replace(/^&/, ""));
  let A; try { A = await import(new URL(`../story/act${+n}.js`, import.meta.url).href); } catch (e) { console.warn("jump: no act", n, e); return false; }
  // start the act without its cards, intro text or intro conversation (a conversation's after() still runs, so its flags are set)
  const quiet = Object.assign(Object.create(api), { say: async () => {}, card: async () => {}, bigCard: async () => {}, readout: async () => {}, wait: async () => {},
    convo: async (k) => { const c = A.CONVOS && A.CONVOS[k]; if (c && c.after) await c.after(quiet); } });
  G.act = +n;
  try { await A.start(quiet, { fresh: true, skipCard: true }); } catch (e) { console.warn("jump: act start", e); }
  for (const f of (q.get("flags") || "").split(",").filter(Boolean)) G.flags[f.replace(/^!/, "")] = !f.startsWith("!");
  const mode = key === "morris" ? "day" : key, char = mode === "night" ? "gus" : "nell";
  const keepCast = mode === G.mode && G.cast.includes(char);
  api.shift({ mode, char, room: room || G.room, entry: mode === "morning" ? "morning" : "start", cast: keepCast ? undefined : [char], min: mode === "night" ? 2 * 60 + 13 : undefined });
  if (key === "morris") {
    Object.assign(G.flags, { morrisJoined: true, morrisInDrawer: false });
    if (!G.cast.includes("morris")) G.cast = [...G.cast, "morris"];
    G.chars.morris = { room: G.room, x: G.actor.x + 30, y: G.actor.y, dir: -1 };
    GC.switchTo("morris");
  }
  api.hud(); api.refresh();
  const c = q.get("convo"); if (c) await GC.runConvo(c);
  return true;
}
