# The wiki branch's server

A Cloudflare Worker with one Durable Object (SQLite) that holds the **wiki branch**: a shared, public copy of the Gain Control script that anyone can change in the Script Room (`game/script.html?branch=wiki`) and play (`game/index.html?branch=wiki`). The real game never reads it.

- **State:** the wiki's overrides (the same `"<act>|<path>"` keys the Script Room writes), layered on top of `game/overrides.json`.
- **History:** every change is a revision (who, when, each line's before and after). Any revision can be undone, and RESTORE TO HERE rewinds everything after a point. Undos are revisions too.
- **Guard rails:** text only (no logic), no `<` or `>` (turned into ‹ ›), no prototype paths, 30 changes a minute per address, 4,000 characters a line, 600 lines a change.
- **Locking (optional):** set a secret `ADMIN_KEY` on the Worker, then `curl -X POST https://gaincontrol-wiki.samuelling.workers.dev/admin -H "x-admin-key: <key>" -d '{"lock":true}'` freezes the wiki (`false` reopens it).

## Deploying

Connected on 2026-11-20. Once, in the Cloudflare dashboard (already done): **Workers & Pages › Create › Import a repository › samuelling/GainControl**, and set the **root directory** to `wiki` (the name `gaincontrol-wiki` comes from `wrangler.toml`). After that, every push to `main` redeploys it. From a terminal it's `cd wiki && npx wrangler deploy`.

The game expects it at `https://gaincontrol-wiki.samuelling.workers.dev` (`game/js/tools/wiki.js`). To test against a local copy: `cd wiki && npx wrangler dev`, then open `script.html?branch=wiki&wiki=http://127.0.0.1:8787`.

## API

    GET  /state                 { rev, t, locked, edits }
    GET  /history?limit=&before= { revs: [{ id, t, who, kind, label, changes: [{ key, from, to }] }] }, newest first
    POST /commit                { who, kind, label?, ref?, changes: [{ key, to }] }  (to: text, or null for the game's own)
