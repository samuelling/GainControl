// GAIN CONTROL — the wiki branch: a shared, public copy of the script that anyone can change.
//
//   index.html?branch=wiki     the game, playing the wiki's version of the script (the real game is untouched)
//   script.html?branch=wiki    the Script Room, editing the wiki: every change is saved for everyone, as a revision
//
// The edits live on a small Cloudflare Worker (wiki/ at the top of the repo). They're the same override keys the
// Script Room writes to localStorage, layered on top of game/overrides.json. Text only: the game's logic isn't
// editable here. ?wiki=<url> points at another server (wrangler dev, for testing).
const Q = typeof location !== "undefined" ? new URLSearchParams(location.search) : new URLSearchParams();
export const WIKI = Q.get("branch") === "wiki";
export const WIKI_URL = (Q.get("wiki") || "https://gaincontrol-wiki.samuelling.workers.dev").replace(/\/$/, "");
export const WHO_KEY = "gaincontrol.wiki.who";

// keep links inside the branch (and on the same test server)
export function branchQS() { if (!WIKI) return ""; const q = new URLSearchParams({ branch: "wiki" }); if (Q.get("wiki")) q.set("wiki", Q.get("wiki")); return "?" + q; }

// text that comes from strangers: no markup, no prototype paths
const BAD_SEG = /(^|\.)(__proto__|prototype|constructor)(\.|$)/;
export function safeEdits(edits) {
  const out = {};
  for (const [k, v] of Object.entries(edits || {})) {
    if (typeof k !== "string" || typeof v !== "string") continue;
    const m = /^(\d{1,2})\|(.*)$/s.exec(k); if (!m) continue;
    if (!m[2].startsWith("LIT|") && BAD_SEG.test(m[2])) continue;
    out[k] = v.replace(/</g, "‹").replace(/>/g, "›");
  }
  return out;
}

async function call(path, body) {
  const r = await fetch(WIKI_URL + path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : { cache: "no-store" });
  let j = null; try { j = await r.json(); } catch (e) {}
  if (!r.ok) throw new Error((j && j.error) || `the wiki answered ${r.status}`);
  return j;
}
export async function wikiState() { const j = await call("/state"); return { ...j, edits: safeEdits(j.edits) }; }
export async function wikiHistory(limit = 400) { return (await call(`/history?limit=${limit}`)).revs || []; }
// changes: [{ key, to }] (to: text, or null for the game's own text)
export async function wikiCommit({ kind = "edit", label = "", ref, refT, refKind, changes }) {
  const j = await call("/commit", { who: whoAmI(), kind, label, ref, refT, refKind, changes });
  return { ...j, edits: safeEdits(j.edits) };
}

export function whoAmI() {
  try { let w = localStorage.getItem(WHO_KEY); if (!w) { w = "GUEST " + Math.floor(1000 + Math.random() * 9000); localStorage.setItem(WHO_KEY, w); } return w; } catch (e) { return "A GUEST"; }
}
export function setWho(w) { try { localStorage.setItem(WHO_KEY, String(w || "").replace(/[<>]/g, "").trim().slice(0, 32) || whoAmI()); } catch (e) {} }
