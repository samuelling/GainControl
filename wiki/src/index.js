// GAIN CONTROL — the wiki branch's server. Anyone can change the script; every change is a revision, and any
// revision can be undone. The real game never reads this: only index.html?branch=wiki and script.html?branch=wiki do.
//
//   GET  /state                     { rev, t, locked, edits: { key: text } }   the wiki branch's overrides, now
//   GET  /history?limit=&before=    { revs: [ { id, t, who, kind, label, ref?, refT?, refKind?, changes: [{ key, from, to }] } ] }, newest first
//   POST /commit  { who, kind, label?, ref?, refT?, refKind?, changes: [{ key, to }] }   to: text, or null (back to the game's own)
//                                   → { rev, t, edits }   (from is filled in here, from the state as it was)
//   POST /admin   { lock: true|false }  with header x-admin-key (the ADMIN_KEY secret, if one is set): freeze or reopen
//
// Keys are the Script Room's override keys ("<act>|<path>" or "<act>|LIT|<original text>"). Text can't hold < or >
// (turned into ‹ ›), so nothing typed here can become markup in someone else's browser.
const KINDS = new Set(["edit", "reset", "delete", "revert", "restore", "revert-all", "import"]);
const MAX_KEY = 1500, MAX_VAL = 4000, MAX_CHANGES = 600, MAX_KEYS = 6000, PER_MIN = 30;
const BAD_SEG = /(^|\.)(__proto__|prototype|constructor)(\.|$)/;
const cors = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type, x-admin-key", "access-control-max-age": "86400" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...cors } });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    if (url.pathname === "/") return json({ service: "gaincontrol-wiki", see: "https://linglab.org/gaincontrol/game/script.html?branch=wiki" });
    const stub = env.WIKI.get(env.WIKI.idFromName("main"));
    return stub.fetch(request);
  },
};

const clean = (s, n) => String(s ?? "").replace(/</g, "‹").replace(/>/g, "›").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, n);
function badKey(k) {
  if (typeof k !== "string" || !k || k.length > MAX_KEY) return "bad key";
  const m = /^(\d{1,2})\|(.*)$/s.exec(k); if (!m) return "bad key";
  if (!m[2].startsWith("LIT|") && BAD_SEG.test(m[2])) return "bad key";
  return "";
}

export class Wiki {
  constructor(state, env) {
    this.env = env; this.storage = state.storage; this.sql = state.storage.sql; this.hits = new Map();
    this.sql.exec("CREATE TABLE IF NOT EXISTS state (key TEXT PRIMARY KEY, val TEXT NOT NULL)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS revs (id INTEGER PRIMARY KEY AUTOINCREMENT, t TEXT NOT NULL, who TEXT, kind TEXT, label TEXT, ref TEXT, refT TEXT, refKind TEXT, changes TEXT NOT NULL, ip TEXT)");
    this.sql.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT)");
  }
  meta(k) { const r = [...this.sql.exec("SELECT v FROM meta WHERE k = ?", k)][0]; return r ? r.v : null; }
  setMeta(k, v) { this.sql.exec("INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v", k, v); }
  head() { const r = [...this.sql.exec("SELECT id, t FROM revs ORDER BY id DESC LIMIT 1")][0]; return r ? { rev: r.id, t: r.t } : { rev: 0, t: null }; }
  edits() { const o = {}; for (const r of this.sql.exec("SELECT key, val FROM state")) o[r.key] = r.val; return o; }

  async fetch(request) {
    const url = new URL(request.url), p = url.pathname;
    try {
      if (request.method === "GET" && p === "/state") return json({ ...this.head(), locked: this.meta("locked") === "1", edits: this.edits() });
      if (request.method === "GET" && p === "/history") {
        const limit = Math.max(1, Math.min(1000, +url.searchParams.get("limit") || 300)), before = +url.searchParams.get("before") || 1e15;
        const revs = [...this.sql.exec("SELECT id, t, who, kind, label, ref, refT, refKind, changes FROM revs WHERE id < ? ORDER BY id DESC LIMIT ?", before, limit)]
          .map(r => ({ id: String(r.id), t: r.t, who: r.who, kind: r.kind, label: r.label, ...(r.ref ? { ref: r.ref, refT: r.refT, refKind: r.refKind } : {}), changes: JSON.parse(r.changes) }));
        return json({ revs });
      }
      if (request.method === "POST" && p === "/commit") return this.commit(request);
      if (request.method === "POST" && p === "/admin") return this.admin(request);
      return json({ error: "not found" }, 404);
    } catch (e) { return json({ error: "server error: " + (e && e.message || e) }, 500); }
  }

  async commit(request) {
    if (this.meta("locked") === "1") return json({ error: "The wiki is locked for now. Try again later." }, 423);
    const ip = request.headers.get("cf-connecting-ip") || "?";
    const now = Date.now(), h = (this.hits.get(ip) || []).filter(x => now - x < 60000);
    if (h.length >= PER_MIN) return json({ error: "Slow down: too many changes in a minute." }, 429);
    h.push(now); this.hits.set(ip, h);
    let b; try { b = await request.json(); } catch (e) { return json({ error: "bad request" }, 400); }
    const kind = KINDS.has(b && b.kind) ? b.kind : "edit";
    const list = Array.isArray(b && b.changes) ? b.changes : [];
    if (!list.length) return json({ error: "no changes" }, 400);
    if (list.length > MAX_CHANGES) return json({ error: "too many changes at once" }, 413);
    const cur = this.edits(), out = [];
    for (const c of list) {
      const err = badKey(c && c.key); if (err) return json({ error: err }, 400);
      const to = c.to == null ? null : clean(c.to, MAX_VAL), from = c.key in cur ? cur[c.key] : null;
      if (from === to) continue;
      out.push({ key: c.key, from, to });
      if (to == null) delete cur[c.key]; else cur[c.key] = to;
    }
    if (!out.length) return json({ ...this.head(), edits: cur, unchanged: true });
    if (Object.keys(cur).length > MAX_KEYS) return json({ error: "the wiki is full" }, 413);
    const t = new Date().toISOString();
    this.storage.transactionSync(() => {
      for (const c of out) {
        if (c.to == null) this.sql.exec("DELETE FROM state WHERE key = ?", c.key);
        else this.sql.exec("INSERT INTO state (key, val) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET val = excluded.val", c.key, c.to);
      }
      this.sql.exec("INSERT INTO revs (t, who, kind, label, ref, refT, refKind, changes, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        t, clean(b.who, 32) || "A GUEST", kind, clean(b.label, 200), b.ref ? clean(b.ref, 24) : null, b.refT ? clean(b.refT, 40) : null, b.refKind ? clean(b.refKind, 20) : null, JSON.stringify(out), ip);
    });
    return json({ ...this.head(), edits: cur });
  }

  async admin(request) {
    const key = this.env.ADMIN_KEY;
    if (!key || request.headers.get("x-admin-key") !== key) return json({ error: "forbidden" }, 403);
    const b = await request.json().catch(() => ({}));
    if (typeof b.lock === "boolean") this.setMeta("locked", b.lock ? "1" : "0");
    return json({ locked: this.meta("locked") === "1" });
  }
}
