// The Impact Lab keypad, close up. Four keys are worn shiny. Resolves true when the code is right, false on cancel.
import { seg, segC, segW, chip } from "../gfx.js";

export function keypad(el, code, lit = []) {
  return new Promise(resolve => {
    let entry = "", flash = "";
    const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
    const X0 = 262, Y0 = 92, KW = 34, KH = 30, GAP = 8;
    function draw() {
      let s = `<rect width="640" height="360" fill="#000" opacity=".9"/>`;
      s += chip("IMPACT LAB 116", 320 - (segW("IMPACT LAB 116", 6) + 5.4) / 2, 22, 6, "fW");
      // brushed steel plate
      s += `<rect class="k sW" x="236" y="40" width="168" height="268" rx="6"/>`;
      for (let y = 46; y < 304; y += 6) s += `<path class="hl sD" d="M242,${y} L398,${y}"/>`;
      // display
      s += `<rect class="k sW" x="256" y="52" width="128" height="30"/>`;
      const shown = flash || entry.replace(/./g, "*").padEnd(6, "-");
      s += segC(shown, 320, 59, 14, flash === "OPEN" ? "sG" : flash ? "sR" : "sG", 1.4);
      KEYS.forEach((k, i) => {
        const x = X0 + (i % 3) * (KW + GAP) - 14, y = Y0 + Math.floor(i / 3) * (KH + GAP) + 6;
        const worn = lit.includes(k);
        s += `<g data-key="${k}" style="cursor:pointer"><rect class="k ${worn ? "sW" : "sM"}" x="${x}" y="${y}" width="${KW}" height="${KH}" rx="4"/>
          ${segC(k, x + KW / 2, y + 8, 12, worn ? "sW" : "sM", 1.3)}
          ${worn ? `<path class="hl sW" d="M${x + 4},${y + 5} L${x + 10},${y + 3} M${x + KW - 9},${y + KH - 4} L${x + KW - 4},${y + KH - 7}"/>` : ""}</g>`;
      });
      s += seg("FOUR KEYS WORN SHINY. SIX DIGITS.", 236, 316, 5, "sM", .9);
      s += `<g data-key="cancel" style="cursor:pointer"><rect class="k sW" x="420" y="276" width="90" height="24"/>${segC("STEP BACK", 465, 284, 6.5, "sW", 1.1)}</g>`;
      el.innerHTML = s;
    }
    function press(k) {
      if (flash) return;
      window.SFX && window.SFX.play("key");
      if (k === "cancel") return finish(false);
      if (k === "*" || k === "#") { entry = ""; draw(); return; }
      entry += k; draw();
      if (entry.length === code.length) {
        if (entry === code) { flash = "OPEN"; draw(); window.SFX && window.SFX.play("good"); setTimeout(() => finish(true), 700); }
        else { flash = "DENIED"; draw(); window.SFX && window.SFX.play("bad"); setTimeout(() => { flash = ""; entry = ""; draw(); }, 700); }
      }
    }
    const onClick = (e) => { const b = e.target.closest && e.target.closest("[data-key]"); if (b) press(b.dataset.key); };
    const onKey = (e) => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === "Escape") press("cancel"); else if (e.key === "Backspace") { entry = entry.slice(0, -1); draw(); } };
    function finish(ok) { el.removeEventListener("pointerdown", onClick); window.removeEventListener("keydown", onKey); el.classList.remove("show", "pick"); resolve(ok); }
    el.classList.add("show", "pick"); draw();
    el.addEventListener("pointerdown", onClick); window.addEventListener("keydown", onKey);
  });
}
