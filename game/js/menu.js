/* ================================================================ *
 *  THE OPTIONS MENU (HUD: OPTIONS, or the O key). Pauses the game.
 *  Left: settings, each a tiny label over a big thin value (the HUD's readout style); click to flip.
 *  Right: CHEAT CODES. Type one (a hidden text field takes the keys, so phones get a keyboard), ENTER to try it.
 *  Codes that stay on show as chips; click a chip to switch it off. The count of codes found is kept.
 * ================================================================ */
import { seg, segW, chip, chipW } from "./gfx.js";
import { opt, setOpt, enterCode, activeCheats, codeById, setCheat, CODES } from "./options.js";
import { current, HOLIDAYS, nextHoliday, ORDER } from "./holidays.js";

const FKEY = "gaincontrol.codesFound";
const found = new Set((() => { try { return JSON.parse(localStorage.getItem(FKEY) || "[]"); } catch (e) { return []; } })());
const saveFound = () => { try { localStorage.setItem(FKEY, JSON.stringify([...found])); } catch (e) {} };

// wrap a caps line into rows that fit a width at a letter height
function wrap(t, w, h) { const out = []; let line = ""; for (const word of String(t).split(" ")) { const tryL = line ? line + " " + word : word; if (segW(tryL, h) > w && line) { out.push(line); line = word; } else line = tryL; } if (line) out.push(line); return out; }

export function installMenu({ G, sfx, FULL, GUIDE, onChange = () => {}, onCode = () => {} }) {
  const frame = document.getElementById("frame");
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.id = "menu"; el.setAttribute("class", "t"); el.setAttribute("viewBox", "0 0 640 360"); frame.appendChild(el);
  const inp = document.createElement("input");
  Object.assign(inp, { id: "codeInput", type: "text", maxLength: 16, autocomplete: "off", spellcheck: false });
  inp.setAttribute("autocapitalize", "characters"); inp.setAttribute("autocorrect", "off"); inp.setAttribute("aria-label", "cheat code");
  frame.appendChild(inp);
  let open = false, busyWas = false, msg = "", msgCls = "sM", blink = 0, blinkT = null;

  const code = () => inp.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  function row(y, label, value, on, sub, key) {
    return `<g data-row="${key}" style="cursor:pointer">${seg(label, 40, y, 4.2, "sM", .8)}
      ${seg(value, 40, y + 9, 15, on ? "sG" : "sD", 1.3)}${sub ? seg(sub, 40, y + 29, 3.8, "sM", .7) : ""}
      <rect x="34" y="${y - 6}" width="260" height="${sub ? 42 : 34}" fill="transparent"/></g>`;
  }
  function draw() {
    const cur = current(), forced = opt("forceHoliday");
    const season = cur.on.length ? cur.on.map(id => HOLIDAYS[id].name).join(" · ") : "NOTHING ON THE CALENDAR TODAY";
    let s = `<rect width="640" height="360" fill="#000" opacity=".94"/>
      ${seg("OPTIONS", 40, 22, 22, "sW", 1.4)}${chip("PAUSED", 40 + segW("OPTIONS", 22) + 12, 31, 6, "fA")}
      <path class="hl sD" d="M40,58 L600,58 M320,70 L320,300"/>`;
    s += row(74, "HOLIDAY DECORATIONS", opt("holidays") ? "ON" : "OFF", opt("holidays"), (forced ? "FORCED: " : "IN SEASON: ") + season, "holidays");
    s += row(126, "HINTS WHEN STUCK", opt("hints") ? "ON" : "OFF", opt("hints"), "A GLINT ON THE NEXT THING, THEN A WORD", "hints");
    s += row(178, "SOUND", sfx.muted ? "OFF" : "ON", !sfx.muted, "OR PRESS M", "sound");
    s += row(230, "FULLSCREEN", FULL.isFull() ? "ON" : "OFF", FULL.isFull(), "OR PRESS F", "full");
    // the codes
    const X = 340;
    s += seg("CHEAT CODES", X, 74, 4.2, "sA", .8) + seg("CODES FOUND", 540, 20, 4.2, "sM", .8) + seg(String(found.size).padStart(2, "0"), 540, 29, 20, "sA", 1.4) + seg("/" + CODES.length, 570, 43, 6, "sM", 1);
    const t = code();
    s += `<g data-code style="cursor:text"><rect class="hl sW" x="${X}" y="86" width="168" height="30"/>
      ${t ? seg(t, X + 8, 93, 15, "sW", 1.3) : seg("TYPE A CODE", X + 8, 97, 6, "sD", .9)}
      ${blink % 2 ? "" : `<path class="sA" d="M${X + 10 + (t ? segW(t, 15) + 3 : 0)},92 L${X + 10 + (t ? segW(t, 15) + 3 : 0)},110"/>`}</g>`;
    s += `<g data-enter style="cursor:pointer">${chip("ENTER", X + 176, 95, 6, t ? "fA" : "fD")}<rect x="${X + 172}" y="88" width="${chipW("ENTER", 6) + 10}" height="26" fill="transparent"/></g>`;
    wrap(msg, 260, 4.4).slice(0, 3).forEach((l, i) => s += seg(l, X, 126 + i * 9, 4.4, msgCls, .8));
    const on = activeCheats();
    s += seg("ON NOW", X, 162, 4.2, "sM", .8);
    if (!on.length) s += seg("NOTHING. THE BUILDING IS ITSELF.", X, 173, 4.2, "sD", .8);
    let cx = X, cy = 172;
    for (const id of on) { const c = codeById(id); if (!c) continue; const w = chipW(c.label, 4.6) + 14;
      if (cx + w > 620) { cx = X; cy += 16; }
      s += `<g data-off="${id}" style="cursor:pointer">${chip(c.label, cx, cy, 4.6, "fG")}${seg("X", cx + chipW(c.label, 4.6) + 4, cy + 1.5, 4.6, "sM", .8)}<rect x="${cx - 2}" y="${cy - 3}" width="${w}" height="15" fill="transparent"/></g>`;
      cx += w + 6; }
    s += seg("STUCK? TRY GUV.", X, 262, 4.4, "sM", .8) + seg("THE REST ARE AROUND, IF YOU LISTEN.", X, 272, 4.4, "sD", .8);
    s += `<g data-close style="cursor:pointer">${chip("BACK TO THE GAME", 40, 318, 7, "fW")}${seg("ESC", 40 + chipW("BACK TO THE GAME", 7) + 8, 321, 6, "sM", .9)}
      <rect x="36" y="312" width="200" height="24" fill="transparent"/></g>`;
    el.innerHTML = s;
  }
  function submit() {
    const t = code(); if (!t) return;
    const r = enterCode(t); inp.value = "";
    if (!r.ok) { msg = r.msg; msgCls = "sD"; sfx.play("cancel"); draw(); return; }
    if (r.code.id === "timewarp") {   // step to the next holiday round the year
      const cur = opt("forceHoliday") || current().on[0] || ORDER[ORDER.length - 1], nx = nextHoliday(cur);
      setOpt("forceHoliday", nx); if (!opt("holidays")) setOpt("holidays", true);
      msg = "THE CALENDAR JUMPS. IT'S " + HOLIDAYS[nx].name + " NOW. TYPE TODAY TO COME BACK.";
    } else msg = r.msg;
    msgCls = r.on ? "sA" : "sM";
    if (!found.has(r.code.id)) { found.add(r.code.id); saveFound(); }
    sfx.play(r.on ? "score" : "select");
    onChange(); onCode(r);
    if (r.code.id === "guv") { hide(); setTimeout(() => GUIDE.show(), 60); return; }
    draw();
  }
  function show() {
    if (open) return; open = true; busyWas = G.busy; G.busy = true; msg = ""; inp.value = "";
    el.classList.add("show"); inp.classList.add("show"); draw(); sfx.play("card");
    if (!matchMedia("(pointer: coarse)").matches) setTimeout(() => inp.focus({ preventScroll: true }), 30);
    blinkT = setInterval(() => { blink++; if (document.activeElement === inp) draw(); }, 450);
  }
  function hide() { if (!open) return; open = false; el.classList.remove("show"); inp.classList.remove("show"); inp.blur(); clearInterval(blinkT); G.busy = busyWas; onChange(); }
  const toggle = () => (open ? hide() : show());

  el.addEventListener("pointerdown", (e) => e.stopPropagation(), true);
  el.addEventListener("click", (e) => {
    const q = (s) => e.target.closest?.(s);
    if (q("[data-close]")) { hide(); return; }
    if (q("[data-enter]")) { submit(); return; }
    if (q("[data-code]")) { inp.focus({ preventScroll: true }); return; }
    const off = q("[data-off]"); if (off) { const c = codeById(off.dataset.off); setCheat(off.dataset.off, false); msg = c.off || ""; msgCls = "sM"; sfx.play("cancel"); onChange(); draw(); return; }
    const r = q("[data-row]"); if (!r) { inp.focus({ preventScroll: true }); return; }
    const k = r.dataset.row; sfx.play("select");
    if (k === "holidays") setOpt("holidays", !opt("holidays"));
    if (k === "hints") setOpt("hints", !opt("hints"));
    if (k === "sound") sfx.toggle();
    if (k === "full") FULL.toggle();
    onChange(); setTimeout(draw, k === "full" ? 300 : 0);
  });
  inp.addEventListener("input", () => { blink = 0; draw(); });
  inp.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "Escape") { e.preventDefault(); hide(); }
  });
  // O opens it; Esc closes it (when the code field doesn't have the keys)
  window.addEventListener("keydown", (e) => {
    if (e.target === inp || e.target.closest?.("input,textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (open) { e.stopPropagation(); if (e.key === "Escape" || e.key === "o" || e.key === "O") { e.preventDefault(); hide(); } else if (e.key.length === 1) { e.preventDefault(); inp.value = (inp.value + e.key).slice(0, 16); inp.focus({ preventScroll: true }); draw(); } return; }
    if ((e.key === "o" || e.key === "O") && !G.busy) { e.preventDefault(); e.stopPropagation(); show(); }
  }, true);
  return { show, hide, toggle, isOpen: () => open };
}
