// The small bridge to the Mac and iOS apps (../ios, ../macos). The apps show the game exactly as on the web,
// served from inside the app; this only adds what a page can't do there: haptics on iPhone and iPad on
// some of the sound effects (GameBridge.swift picks the feel), and errors printed to Xcode's console.
// On the web, NATIVE is false and none of this runs.
export const NATIVE = typeof window !== "undefined" && !!window.webkit?.messageHandlers?.gaincontrol;
export const APP = (typeof window !== "undefined" && window.GC_APP) || "";   // "ios", "mac" or ""

export function post(type, data = {}) {
  if (!NATIVE) return;
  try { window.webkit.messageHandlers.gaincontrol.postMessage(JSON.stringify({ type, ...data })); } catch (e) { /* not in the app */ }
}

// the effects that buzz (keep in step with Haptics in ios/GainControl/GameBridge.swift)
const BUZZ = new Set(["crash", "death", "fogSlam", "fogBam", "thud", "kick", "dart", "gavel", "stamp", "staple", "clunk", "door", "knock",
  "pickup", "card", "switch", "key", "toggle", "flip", "select", "pop", "tick", "score", "good", "bad", "alarm"]);

export function installNative(sfx) {
  if (!NATIVE) return;
  if (APP === "ios") {
    // a game screen, not a page: no pinch zoom, no long-press callouts
    document.querySelector('meta[name="viewport"]')?.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");
    document.documentElement.style.webkitTouchCallout = "none";
    const play = sfx.play.bind(sfx);
    sfx.play = (name, opts) => { if (BUZZ.has(name)) post("haptic", { kind: name }); return play(name, opts); };
  }
  const log = (e) => post("log", { msg: String((e && (e.stack || e.message)) || e).slice(0, 2000) });
  window.addEventListener("error", (ev) => log(ev.error || ev.message));
  window.addEventListener("unhandledrejection", (ev) => log(ev.reason));
}
