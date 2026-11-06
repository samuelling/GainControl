/* ================================================================ *
 *  FULLSCREEN — the Fullscreen API where it exists (desktop, Android,
 *  iPad), and on iPhone (which has no element fullscreen) a hint to
 *  Add to Home Screen, which launches the game with no browser chrome.
 *  Any element marked [data-full] toggles it; F does too.
 * ================================================================ */
import { seg, segW, chip } from "./gfx.js";

const doc = document, root = doc.documentElement;
export const standalone = () => matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches || navigator.standalone === true;
export const supported = () => !!(root.requestFullscreen || root.webkitRequestFullscreen) && (doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled ?? true);
export const isFull = () => !!(doc.fullscreenElement || doc.webkitFullscreenElement) || standalone();
const isIOS = () => /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

let toastT;
function toast(lines, ms = 6500) {
  let el = doc.getElementById("toast");
  if (!el) { el = doc.createElementNS("http://www.w3.org/2000/svg", "svg"); el.id = "toast"; el.setAttribute("class", "t"); el.setAttribute("viewBox", "0 0 640 360");
    doc.getElementById("frame").appendChild(el); el.addEventListener("pointerdown", (e) => { e.stopPropagation(); el.classList.remove("show"); }, true); }
  const w = Math.max(...lines.map(([t, h]) => segW(t, h))) + 28, x = 320 - w / 2;
  let y = 16, body = "";
  for (const [t, h, cls] of lines) { body += cls === "chip" ? chip(t, 320 - (segW(t, h) + h * .9) / 2, y, h, "fA") : seg(t, 320 - segW(t, h) / 2, y + 2, h, cls || "sW", .9); y += h * (cls === "chip" ? 1.7 : 1) + 7; }
  el.innerHTML = `<rect class="k sW" x="${x}" y="8" width="${w}" height="${y - 2}"/>${body}`;
  el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), ms);
}

export function hint() {
  if (isIOS()) toast([["FULLSCREEN", 6, "chip"], ["IPHONE SAFARI WILL NOT HIDE ITS BARS FOR A WEB PAGE", 4.6, "sW"],
    ["TAP SHARE, THEN ADD TO HOME SCREEN, THEN OPEN GAIN CONTROL FROM THE ICON", 4.6, "sA"], ["IT RUNS EDGE TO EDGE, NO ADDRESS BAR. TURN THE PHONE SIDEWAYS", 4.6, "sM"]], 9000);
  else toast([["FULLSCREEN", 6, "chip"], ["THIS BROWSER WILL NOT GO FULLSCREEN. TRY ITS OWN VIEW MENU", 4.6, "sW"]]);
}

export async function toggle() {
  if (doc.fullscreenElement || doc.webkitFullscreenElement) { (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc); return; }
  if (standalone()) return;
  if (!supported()) { hint(); return; }
  try {
    const p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root, { navigationUI: "hide" });
    if (p && p.then) await p;
    try { await screen.orientation?.lock?.("landscape"); } catch {}
  } catch { hint(); }
}

// wire it once: [data-full] anywhere in the frame (HUD, title card), and the F key
export function install(onChange) {
  const frame = doc.getElementById("frame");
  // swallow the press so it neither walks Nell nor closes a card; toggle on click (the gesture Safari honours)
  frame.addEventListener("pointerdown", (e) => { if (e.target.closest?.("[data-full]")) e.stopPropagation(); }, true);
  frame.addEventListener("click", (e) => { if (e.target.closest?.("[data-full]")) { e.stopPropagation(); toggle(); } }, true);
  window.addEventListener("keydown", (e) => { if ((e.key === "f" || e.key === "F") && !e.metaKey && !e.ctrlKey && !e.target.closest?.("input,textarea")) toggle(); });
  for (const ev of ["fullscreenchange", "webkitfullscreenchange"]) doc.addEventListener(ev, () => onChange?.());
  matchMedia("(display-mode: standalone)").addEventListener?.("change", () => onChange?.());
}

// the HUD line: FULL  F / EXIT FULL  F; hidden when launched from the home screen
export function hudChip(x, y) {
  if (standalone()) return "";
  const t = (doc.fullscreenElement || doc.webkitFullscreenElement) ? "EXIT FULL  F" : "FULLSCREEN  F";
  return `<g data-full style="cursor:pointer">${seg(t, x, y, 3.6, "sM", .7)}<rect x="${x - 4}" y="${y - 4}" width="${segW(t, 3.6) + 8}" height="12" fill="transparent"/></g>`;
}
// a title-card button, drawn like the act buttons but outlined
export function cardButton(x, y, w) {
  if (standalone()) return "";
  const label = "FULLSCREEN";
  return `<g data-full style="cursor:pointer"><rect class="k sM" x="${x}" y="${y}" width="${w}" height="18"/>${seg(label, x + w / 2 - segW(label, 5) / 2, y + 6.5, 5, "sM", 1)}</g>`;
}
