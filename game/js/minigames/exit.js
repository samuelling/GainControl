// THE ONE WAY OUT of a minigame (every panel game uses it, so they all read the same):
// the exit button says CLOSE (Esc) until the job's done, then DONE (Enter, or Esc). Leaving early keeps your progress
// unless the game says otherwise; when it would lose something, the first Esc asks and the second leaves.
export const exitLabel = (done, word) => done ? `DONE <small>ENTER</small>` : `${word || "CLOSE"} <small>ESC</small>`;
// keys: Enter finishes once done; Esc finishes (or leaves). Returns true if it handled the key.
export function exitKey(e, done, finish) {
  if (e.key === "Enter" && done) { e.preventDefault(); finish(); return true; }
  if (e.key === "Escape") { e.preventDefault(); finish(); return true; }
  return false;
}
