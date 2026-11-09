// The Impact Lab keypad, close up. Some keys are worn shiny. Resolves true when the code is right, false on cancel.
// Wrong codes never cost anything here: the keypad says why it refused, and a hint ladder (after 2 and 4 wrong codes)
// points at the clue and then spells the code out, so nobody is stuck at a door.
import { seg, segC, segW, chip, chipW } from "../gfx.js";

// per-code hints, in the voice of whoever is at the door: [speaker, after 2 wrong, after 4 wrong (the answer)]
const HINTS = {
  "147794": ["GUS",
    "Preston doesn't pick numbers. He is one. Six digits of him are framed in the hallway, under his photo.",
    "The Rising Stars wall. CITATIONS 147,794. His password is his citation count. Of course it is. 1-4-7-7-9-4."],
  "112": ["NELL",
    "The number he loved most. His h-index. The faculty directory in the library had it.",
    "IMPACT, MAXIMILIAN. H-INDEX 112. Three digits. 1-1-2."],
};
const TRIES = {};   // wrong codes per door, kept across visits, so stepping back never resets the hints
const COL = { GUS: "B", NELL: "G", MORRIS: "A", IRIS: "V" };
const WORD = ["NO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];

// a dialogue line inside the SVG: speaker chip plus Saira Condensed caps in the speaker's color, wrapped
function line(who, text, y) {
  const c = COL[who] || "W", words = text.toUpperCase().split(" "), rows = [""];
  for (const w of words) { const r = rows[rows.length - 1]; if ((r + " " + w).length > 66) rows.push(w); else rows[rows.length - 1] = r ? r + " " + w : w; }
  let s = chip(who, 40, y - 9, 6, "f" + c);
  rows.forEach((r, i) => { s += `<text x="${48 + chipW(who, 6)}" y="${y + i * 15}" style="fill:var(--${c});font:500 14px 'Saira Condensed',sans-serif;letter-spacing:.02em">${r.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`; });
  return s;
}

export function keypad(el, code, lit = [], { hints } = {}) {
  return new Promise(resolve => {
    let entry = "", flash = "", wrong = TRIES[code] || 0, say = null, closed = false;
    const H = hints || HINTS[code] || ["GUS", "Only the worn keys. He presses every one of them, and nothing else.", `The wear says it all. ${code.split("").join("-")}.`];
    const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
    const X0 = 262, Y0 = 92, KW = 34, KH = 30, GAP = 8, L = code.length;
    const reveal = () => wrong >= 4;
    function draw() {
      let s = `<rect width="640" height="360" fill="#000" opacity=".9"/>`;
      s += chip("IMPACT LAB 116", 320 - (segW("IMPACT LAB 116", 6) + 5.4) / 2, 22, 6, "fW");
      // brushed steel plate
      s += `<rect class="k sW" x="236" y="40" width="168" height="252" rx="6"/>`;
      for (let y = 46; y < 288; y += 6) s += `<path class="hl sD" d="M242,${y} L398,${y}"/>`;
      // display: the digits typed so far, then a dash per digit still to go
      s += `<rect class="k sW" x="256" y="52" width="128" height="30"/>`;
      const shown = flash || entry.padEnd(L, "-");
      s += segC(shown, 320, 59, 14, flash === "OPEN" ? "sG" : flash ? "sR" : "sG", 1.4);
      // once the answer is out, the next key to press is outlined green
      const next = reveal() && !flash ? (code.startsWith(entry) ? code[entry.length] : "*") : null;
      KEYS.forEach((k, i) => {
        const x = X0 + (i % 3) * (KW + GAP) - 14, y = Y0 + Math.floor(i / 3) * (KH + GAP) + 6;
        const worn = lit.includes(k), cls = k === next ? "sG" : worn ? "sW" : "sM";
        s += `<g data-key="${k}" style="cursor:pointer"><rect class="k ${cls}" x="${x}" y="${y}" width="${KW}" height="${KH}" rx="4"/>
          ${segC(k, x + KW / 2, y + 8, 12, cls, 1.3)}
          ${worn ? `<path class="hl ${cls}" d="M${x + 4},${y + 5} L${x + 10},${y + 3} M${x + KW - 9},${y + KH - 4} L${x + KW - 4},${y + KH - 7}"/>` : ""}</g>`;
      });
      s += segC(`${WORD[lit.length] || lit.length} KEYS WORN SHINY. ${WORD[L] || L} DIGITS.`, 320, 298, 5, "sM", .9);
      s += segC("CLICK OR TYPE   * CLEARS   ESC STEPS BACK", 320, 309, 4, "sD", .8);
      s += `<g data-key="cancel" style="cursor:pointer"><rect class="k sW" x="420" y="262" width="90" height="24"/>${segC("CLOSE", 459, 270, 6.5, "sW", 1.1)}${seg("ESC", 482, 272, 3.8, "sM", .7)}</g>`;
      if (wrong) s += seg(`WRONG CODES ${wrong}`, 420, 246, 4.4, "sR", .8);
      if (say) s += line(say[0], say[1], 332);
      el.innerHTML = s;
    }
    function denied() {
      wrong++; TRIES[code] = wrong;
      const off = [...new Set(entry.split("").filter(d => !lit.includes(d)))];
      if (wrong >= 4) say = [H[0], H[2]];
      else if (wrong >= 2) say = [H[0], H[1]];
      else if (off.length) say = [H[0], `Not with a ${off.join(" or a ")}. Those keys are clean. He only ever presses the shiny ones.`];
      else say = [H[0], "Right keys, wrong order. The order has to mean something to him."];
    }
    function press(k) {
      if (flash || closed) return;
      window.SFX && window.SFX.play("key");
      if (k === "cancel") return finish(false);
      if (k === "*" || k === "#") { entry = ""; draw(); return; }
      entry += k; draw();
      if (entry.length === L) {
        if (entry === code) { flash = "OPEN"; say = null; draw(); window.SFX && window.SFX.play("good"); setTimeout(() => finish(true), 700); }
        else { flash = "DENIED"; denied(); draw(); window.SFX && window.SFX.play("bad"); setTimeout(() => { if (closed) return; flash = ""; entry = ""; draw(); }, 700); }
      }
    }
    const onClick = (e) => { const b = e.target.closest && e.target.closest("[data-key]"); if (b) press(b.dataset.key); };
    const onKey = (e) => {
      if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === "Escape") press("cancel");
      else if (e.key === "Backspace" && !flash) { entry = entry.slice(0, -1); draw(); }
    };
    function finish(ok) { closed = true; el.removeEventListener("pointerdown", onClick); window.removeEventListener("keydown", onKey); el.classList.remove("show", "pick"); resolve(ok); }
    if (wrong >= 2) say = [H[0], wrong >= 4 ? H[2] : H[1]];   // back at the door: the last hint is still on screen
    el.classList.add("show", "pick"); draw();
    el.addEventListener("pointerdown", onClick); window.addEventListener("keydown", onKey);
  });
}
