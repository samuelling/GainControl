// MY RESULTS: every finished run's CSV, kept on this device (localStorage) so you can save them later, one at a time
// or all together as a zip. Newest first. If storage fills up, the oldest runs go first.
const KEY = "gaincontrol.console.results", MAX = 300;
export function allResults() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
function put(list) {
  for (;;) { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { if (!list.length) return false; list.pop(); } }
}
export function addResult(r) { const list = allResults(); list.unshift(r); put(list.slice(0, MAX)); }
export function removeResult(i) { const list = allResults(); list.splice(i, 1); put(list); }
export function clearResults() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing kept */ } }
