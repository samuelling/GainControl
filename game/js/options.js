/* ================================================================ *
 *  OPTIONS and CHEAT CODES
 *  Settings kept in this browser (localStorage "gaincontrol.opts"), and the codes typed into the options menu
 *  (js/menu.js). Codes are cosmetic: none of them touch flags, items or score. Each one that stays on is a
 *  body class "c-<id>" (so CSS can do the work) and a key in "gaincontrol.cheats"; typing a code again turns it off.
 * ================================================================ */

const OKEY = "gaincontrol.opts", CKEY = "gaincontrol.cheats";
const DEFAULTS = { holidays: true, hints: true };
const load = (k, d) => { try { const o = JSON.parse(localStorage.getItem(k) || "null"); return o && typeof o === "object" ? o : d; } catch (e) { return d; } };
const OPTS = { ...DEFAULTS, ...load(OKEY, {}) };
const ON = new Set(Array.isArray(load(CKEY, [])) ? load(CKEY, []) : []);
const subs = new Set();
const changed = () => { try { localStorage.setItem(OKEY, JSON.stringify(OPTS)); localStorage.setItem(CKEY, JSON.stringify([...ON])); } catch (e) {} paint(); subs.forEach(f => f()); };

export const opt = (k) => OPTS[k];
export function setOpt(k, v) { OPTS[k] = v; changed(); }
export const onChange = (f) => subs.add(f);
export const cheatOn = (id) => ON.has(id);
export const activeCheats = () => [...ON];

// the codes. kind "toggle" stays on until typed again; "once" just does something.
//   say: what's said when it switches on (and off). Everyone in the building notices eventually (remarks.js).
export const CODES = [
  { id: "guv", words: ["GUV"], kind: "once", label: "THE WALKTHROUGH", on: "THE GUV SHEET. NO SHAME. G U V OPENS IT ANY TIME." },
  { id: "pinhead", words: ["PINHEAD", "MICROCEPHALY"], label: "SMALL HEADS", on: "EVERYONE'S HEAD SHRINKS TO THE SIZE OF A GRAPE.", off: "HEADS BACK TO NORMAL. MORE OR LESS.", clash: ["bighead"] },
  { id: "bighead", words: ["BIGHEAD", "TENURE", "EGO"], label: "BIG HEADS", on: "BIG HEAD MODE. SOMEONE GOT TENURE.", off: "HEADS DEFLATE.", clash: ["pinhead"] },
  { id: "cicadas", words: ["CICADAS", "CICADA", "BROODX", "BROOD"], label: "CICADAS IN THE LECTURE HALL", on: "SEVENTEEN YEARS UNDERGROUND. THEY CHOSE SEMINAR 101.", off: "THE CICADAS GO BACK UNDER FOR ANOTHER SEVENTEEN YEARS." },
  { id: "snow", words: ["SNOWDAY", "LETITSNOW"], label: "SNOW INDOORS", on: "IT IS SNOWING INSIDE. FACILITIES HAS BEEN EMAILED.", off: "THE SNOW STOPS. NOBODY ASKS WHERE IT WENT." },
  { id: "afterimage", words: ["AFTERIMAGE", "OPPONENT"], label: "COMPLEMENTARY COLOURS", on: "YOU STARED AT SOMETHING TOO LONG. EVERY COLOUR IS ITS OPPONENT NOW.", off: "YOUR CONES RECOVER." },
  { id: "disco", words: ["DISCO", "LILAC"], label: "DISCO", on: "THE HUE WHEEL TURNS. NOBODY CAN STOP IT.", off: "THE PARTY'S OVER." },
  { id: "significant", words: ["SIGNIFICANT", "PHACK", "PHACKING"], label: "CONFETTI ON EVERY POINT", on: "EVERY POINT YOU SCORE IS NOW P < .05. CONFETTI.", off: "BACK TO NULL RESULTS." },
  { id: "helium", words: ["HELIUM", "CHIPMUNK"], label: "HELIUM VOICES", on: "SOMEONE OPENED THE HELIUM FOR THE MRI. EVERYONE SOUNDS LIKE IT.", off: "VOICES DROP BACK DOWN." },
  { id: "timewarp", words: ["TIMEWARP", "HOLIDAY"], kind: "once", label: "NEXT HOLIDAY", on: "" },
  { id: "realtime", words: ["REALTIME", "TODAY"], kind: "once", label: "BACK TO TODAY", on: "THE DECORATIONS FOLLOW THE CALENDAR AGAIN." },
  { id: "nocheats", words: ["NOCHEATS", "RESET", "CLEAR"], kind: "once", label: "ALL CODES OFF", on: "ALL CODES OFF. THE BUILDING IS ITSELF AGAIN." },
];
const BY_WORD = new Map(CODES.flatMap(c => c.words.map(w => [w, c])));
export const codeById = (id) => CODES.find(c => c.id === id);

// type a code. Returns { ok, code, on, msg } (msg in caps, for the menu's readout); the caller acts on kind "once".
export function enterCode(raw) {
  const w = String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const c = BY_WORD.get(w);
  if (!c) return { ok: false, msg: w ? "NOTHING HAPPENS." : "" };
  if (c.kind === "once") {
    if (c.id === "nocheats") { ON.clear(); OPTS.forceHoliday = null; changed(); }
    if (c.id === "realtime") { OPTS.forceHoliday = null; changed(); }
    return { ok: true, code: c, on: true, msg: c.on };
  }
  const on = !ON.has(c.id);
  if (on) { ON.add(c.id); (c.clash || []).forEach(x => ON.delete(x)); } else ON.delete(c.id);
  changed();
  return { ok: true, code: c, on, msg: on ? c.on : c.off };
}
export function setCheat(id, on) { if (on) { ON.add(id); (codeById(id).clash || []).forEach(x => ON.delete(x)); } else ON.delete(id); changed(); }

// body classes: c-<id> for every code that's on, plus no-holidays when the decorations are off
function paint() {
  const b = document.body; if (!b) return;
  for (const c of CODES) b.classList.toggle("c-" + c.id, ON.has(c.id));
  b.classList.toggle("no-holidays", !OPTS.holidays);
}
if (typeof document !== "undefined") { if (document.body) paint(); else document.addEventListener("DOMContentLoaded", paint); }
