// THE GUV SHEET: a literal walkthrough, as a reference sheet over the game. Type G, U, V (anywhere, any time) to open
// or close it. It opens on the act you're playing, ticks off the steps already done (from G.flags), and points at the
// next one. Named for the Midwestern society the Round Table can't stop mocking: the walkthrough is the one thing they
// would never write down.
import { seg, segW, chip } from "./gfx.js";
import { WALKTHROUGH } from "./walkthrough.js";

const CSS = `
#guide { position: absolute; inset: 0; z-index: 40; display: none; background: rgba(0,0,0,.94); }
#guide.show { display: block; }
#guide .gs { position: absolute; left: 4%; right: 4%; top: 4%; bottom: 4%; border: .16cqw solid var(--A); background: #000; display: flex; flex-direction: column;
  color: var(--W); text-transform: uppercase; font-family: "Saira Condensed", sans-serif; }
#guide .ghd { flex: none; padding: .6cqw 1.4cqw 0; }
#guide .ghd svg { position: relative; inset: auto; width: 100%; height: auto; display: block; pointer-events: none; }
#guide .gtabs { display: flex; gap: .6cqw; padding: .5cqw 1.4cqw; border-bottom: .1cqw solid var(--D); flex: none; flex-wrap: wrap; }
#guide .gtab { font: 600 1.45cqw "Saira Condensed", sans-serif; letter-spacing: .06em; padding: .15cqw .9cqw; border: .1cqw solid var(--M); color: var(--M); cursor: pointer; background: #000; }
#guide .gtab.on { background: var(--A); border-color: var(--A); color: #000; } #guide .gtab:hover:not(.on) { color: var(--W); border-color: var(--W); }
#guide .gbody { flex: 1 1 0; overflow-y: auto; padding: .4cqw 1.4cqw 1.4cqw; scrollbar-color: var(--M) #000; }
#guide .gpart { font: 600 1.25cqw "Saira Condensed", sans-serif; letter-spacing: .12em; color: var(--A); margin: 1.1cqw 0 .3cqw; border-bottom: .08cqw solid var(--D); padding-bottom: .2cqw; }
#guide ol { list-style: none; margin: 0; padding: 0; counter-reset: s; }
#guide li { counter-increment: s; display: grid; grid-template-columns: 3.2cqw 1fr; gap: .5cqw; font-size: 1.55cqw; line-height: 1.28; padding: .25cqw 0; }
#guide li::before { content: counter(s); color: var(--M); text-align: right; font-variant-numeric: tabular-nums; }
#guide li.done { color: var(--D); } #guide li.done::before { content: "✓"; color: var(--G); }
#guide li.next { color: var(--A); } #guide li.next::before { content: "▸"; color: var(--A); }
#guide li .opt { color: var(--V); } #guide li .avoid { color: var(--R); }
#guide .gft { flex: none; display: flex; justify-content: space-between; align-items: center; padding: .5cqw 1.4cqw .6cqw; border-top: .1cqw solid var(--D);
  font-size: 1.15cqw; color: var(--M); letter-spacing: .08em; }
#guide .gft button { font: 600 1.4cqw "Saira Condensed", sans-serif; background: #000; color: var(--W); border: .1cqw solid var(--W); padding: .15cqw 1cqw; cursor: pointer; }
#guide .gft button:hover { background: var(--W); color: #000; }
`;

export function installGuide({ G, frame = document.getElementById("frame"), onOpen = () => {}, onClose = () => {} }) {
  if (!document.getElementById("css-guide")) { const s = document.createElement("style"); s.id = "css-guide"; s.textContent = CSS; document.head.appendChild(s); }
  const el = document.createElement("div"); el.id = "guide"; frame.appendChild(el);
  let open = false, tab = 1, typed = "", busyWas = false;
  const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  function draw() {
    const W = WALKTHROUGH[tab] || { title: "", parts: [] }, mine = tab === (G.act || 1), flags = mine ? (G.flags || {}) : {};
    let nextMarked = false;
    const parts = W.parts.map(p => `<div class="gpart">${esc(p.name)}</div><ol>${p.steps.map(s => {
      const done = mine && s.flag && flags[s.flag];
      let cls = done ? "done" : "";
      if (mine && !done && !nextMarked && !/^(OPTIONAL|AVOID)/.test(s.t)) { cls = "next"; nextMarked = true; }
      const txt = esc(s.t).replace(/^OPTIONAL:/, '<span class="opt">OPTIONAL:</span>').replace(/^AVOID:/, '<span class="avoid">AVOID:</span>');
      return `<li class="${cls}"><span>${txt}</span></li>`; }).join("")}</ol>`).join("");
    const title = W.title || "";
    el.innerHTML = `<div class="gs">
      <div class="ghd"><svg class="t" viewBox="0 0 640 30">${seg("WALKTHROUGH", 2, 6, 15, "sW", 1.4)}${chip("GUV", 168, 9, 6, "fA")}${seg(title, 640 - segW(title, 6) - 4, 12, 6, "sM", .8)}</svg></div>
      <div class="gtabs">${[1, 2, 3, 4, 5].map(n => `<div class="gtab ${n === tab ? "on" : ""}" data-tab="${n}">ACT ${["I", "II", "III", "IV", "V"][n - 1]}</div>`).join("")}</div>
      <div class="gbody">${parts || "<p>Nothing here yet.</p>"}</div>
      <div class="gft"><span>${mine ? "✓ DONE · ▸ NEXT · " : ""}TYPE G U V OR PRESS ESC TO CLOSE · SPOILERS, OBVIOUSLY</span><button data-close>CLOSE</button></div></div>`;
    const nx = el.querySelector("li.next"); if (nx) nx.scrollIntoView({ block: "center" });
  }
  function show() { if (open) return; open = true; tab = G.act || 1; busyWas = G.busy; G.busy = true; el.classList.add("show"); draw(); onOpen(); window.SFX && window.SFX.play("card"); }
  function hide() { if (!open) return; open = false; el.classList.remove("show"); G.busy = busyWas; onClose(); }
  const toggle = () => (open ? hide() : show());

  el.addEventListener("pointerdown", (e) => e.stopPropagation(), true);
  el.addEventListener("click", (e) => { const t = e.target.closest?.("[data-tab]"); if (t) { tab = +t.dataset.tab; draw(); return; }
    if (e.target.closest?.("[data-close]")) hide(); });
  // G, U, V typed in a row (within a couple of seconds) toggles the sheet; Esc closes it
  window.addEventListener("keydown", (e) => {
    if (open && e.key === "Escape") { e.preventDefault(); e.stopPropagation(); hide(); return; }
    if (!e.target.closest?.("input,textarea") && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1) {
      typed = (typed + e.key.toLowerCase()).slice(-3);
      clearTimeout(show.t); show.t = setTimeout(() => (typed = ""), 2000);
      if (typed === "guv") { typed = ""; e.preventDefault(); e.stopPropagation(); toggle(); return; }
    }
    if (open) e.stopPropagation();          // while the sheet is up, the game doesn't hear the keyboard
  }, true);
  return { show, hide, toggle, isOpen: () => open };
}
