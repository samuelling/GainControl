// The lab versions: each console experiment rewritten as a standalone PsychoPy (Python) script and a Psychtoolbox-3
// (MATLAB) function, in game/experiments/psychopy/gc_<id>.py and game/experiments/ptb/gc_<id>.m. Same design, trials and
// CSV columns as the console's version, but in real degrees (set the screen's width and the viewing distance at the top)
// and with the lab's own timing. List an id here once both files exist; the console then shows its export buttons.
export const SCRIPT_KINDS = { psychopy: "PsychoPy", ptb: "Psychtoolbox" };
export const SCRIPTED = new Set([
  "hv", "ml", "search", "adelson", "mae",                                   // PS 327 LABS
  "carrasco", "csf", "posner", "rotation", "crowding", "number",            // CLASSICS
  "necker", "rubin", "quartet", "sphere", "dancer",                         // AMBIGUOUS
  "acuity", "lettercs", "oridisc", "sfdisc", "dipper", "eqnoise", "tcsf",   // VISION BASICS
  "speed", "weberlight", "stereo", "hues", "amsler", "bisect", "tae",
]);
export const hasScript = (id, kind) => SCRIPTED.has(id) && kind in SCRIPT_KINDS;
export const scriptFile = (id, kind) => kind === "ptb" ? `gc_${id}.m` : `gc_${id}.py`;
const base = new URL("../../experiments/", import.meta.url);
export async function fetchScript(id, kind) {
  const url = kind === "readme" ? new URL("README.md", base) : new URL(`${kind}/${scriptFile(id, kind)}`, base);
  const r = await fetch(url, { cache: "no-cache" }); if (!r.ok) throw new Error(r.status); return r.text();
}
