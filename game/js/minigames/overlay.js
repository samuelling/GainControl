// THE OVERLAY (Act III, Nell's monitor). Figure 3b ("sub-07") and Figure 3d ("sub-12") are one panel, rotated and mirrored.
// Turn and flip 3d until it lies on 3b. The overlay goes from two tangles to one clean line.
// The state is an element of the square's symmetry group: (r, f) = flip horizontally if f, then rotate r × 90°.
// Feedback after each move says whether 3d is still mirrored or only turned; after 5 moves a hint, after 9 the next move is lit.
// Keys: R rotates, H and V flip. Resolves { matched, moves }.
import { seg, segC } from "../gfx.js";

// the panel: a fold of cortex (pial surface, three layer lines, white-matter boundary), a blob and some noise
const PANEL = `<path class="sK" d="M8,70 C20,30 40,20 50,40 C58,56 66,30 80,22 C88,18 94,30 92,48"/>
  <path class="hl" d="M10,75 C22,38 40,30 50,46 C58,61 67,37 81,30 C88,27 93,36 92,51"/>
  <path class="hl" d="M12,79 C24,45 40,37 50,52 C58,66 68,44 82,37 C89,35 93,43 92,55"/>
  <path class="hl" d="M13,82 C25,49 40,41 50,56 C58,70 69,48 83,41 C89,39 93,48 92,58"/>
  <path class="sK" d="M14,86 C26,53 40,46 50,61 C58,75 70,53 84,45 C90,43 94,54 92,63"/>
  <path class="blob" d="M60,30 C66,24 76,26 75,33 C74,39 68,38 64,41 C59,43 56,35 60,30 Z"/>
  <circle class="dot" cx="24" cy="58" r="1.4"/><circle class="dot" cx="31" cy="73" r="1.1"/><circle class="dot" cx="77" cy="60" r="1.3"/>
  <circle class="dot" cx="41" cy="31" r="1"/><circle class="dot" cx="86" cy="30" r="1.2"/>
  <path class="hl" d="M40,12 L46,44 M44,40 L46,44 L48,40"/>`;
const tf = ([r, f]) => `rotate(${r * 90} 50 50)${f ? " translate(100,0) scale(-1,1)" : ""}`;
const ROT = ([r, f]) => [(r + 1) % 4, f];
const FLIPH = ([r, f]) => [(4 - r) % 4, !f];
const FLIPV = ([r, f]) => [(6 - r) % 4, !f];
const MOVES = { rot: ROT, h: FLIPH, v: FLIPV };
// the shortest way home from any state (8 states, so a breadth-first search is instant): the first move to make
function nextMove(t) {
  const key = ([r, f]) => r + (f ? "f" : ""), seen = new Set([key(t)]), q = [[t, null]];
  while (q.length) { const [u, first] = q.shift(); if (u[0] === 0 && !u[1]) return first;
    for (const m in MOVES) { const v = MOVES[m](u); if (!seen.has(key(v))) { seen.add(key(v)); q.push([v, first || m]); } } }
  return null;
}
const LINES = {
  intro: ["GUS", "3b is person 7 and 3d is person 12, he says. Brains fold like fingerprints: no two alike. Turn and flip 3d until it sits on 3b. If they're different people, it never will."],
  mirror: ["GUS", "Still mirrored. The fold runs the wrong way round. A flip fixes that."],
  turn: ["GUS", "Not mirrored any more. Now it just needs turning. Closer."],
  hint: ["GUS", "Watch the blob. On 3b it sits top right, tucked in the second hump. Flip once if 3d is mirrored, then turn until its blob's top right too."],
  show: ["GUS", "Here. Press the amber button. Then the next amber one. I've done this before. On other people's figures."],
  match: ["NELL", "Every dot. Every fold. Person 12 is person 7 in a mirror."],
  after: ["GUS", "Two subjects, one brain, flipped. That's not a mistake, Nell. That's a choice."],
};
const HINT_AT = 5, SHOW_AT = 9;   // moves without a match before the hint, then the answer

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function overlay(el, { score = () => {} } = {}) {
  return new Promise(resolve => {
    let spoken = null, closed = false, after = 0;
    const S = { t: [1, true], moves: 0, say: LINES.intro, matched: false };
    const same = () => S.t[0] === 0 && !S.t[1];
    function fig(x, cls, t, label, col) {
      return `<g transform="translate(${x},52)"><rect class="hl sD" x="-4" y="-4" width="108" height="108"/>
        <g class="${cls}" transform="${t}">${PANEL}</g>${seg(label, 0, 112, 6, col, .9)}</g>`;
    }
    function draw() {
      if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(S.say[0], true); }
      if (closed) return;
      const m = same(), lit = !m && S.moves >= SHOW_AT ? nextMove(S.t) : null;
      el.innerHTML = `<div class="screen ovl">
        <svg class="t hd" viewBox="0 0 640 40">${seg("FIGURE 3", 16, 10, 18, "sW", 1.6)}${seg("LAYER BY LAYER  TWO DIFFERENT PEOPLE, HE SAYS", 170, 17, 5, "sM", .8)}</svg>
        <svg class="t ovsvg" viewBox="0 0 640 230">
          ${fig(40, "pB", "", "3B  PERSON 7", "sB")}
          ${fig(190, "pA", tf(S.t), "3D  PERSON 12", "sA")}
          <g transform="translate(410,22) scale(1.5)"><rect class="hl sD" x="-4" y="-4" width="108" height="108"/>
            <g class="${m ? "pG" : "pB"}">${PANEL}</g><g class="${m ? "pG" : "pA"} ov" transform="${tf(S.t)}">${PANEL}</g></g>
          ${segC(m ? "IDENTICAL. EVERY DOT." : "OVERLAY", 485, 196, 8, m ? "sG" : "sW", 1.2)}
          ${seg("MOVES " + S.moves, 410, 214, 5, "sM", .8)}
        </svg>
        <div class="coachline"><span class="who" style="background:var(--${S.say[0] === "GUS" ? "B" : "G"})">${S.say[0]}</span>
          <span style="color:var(--${S.say[0] === "GUS" ? "B" : "G"})">${S.say[1]}</span></div>
        <div class="bar">
          ${["rot", "h", "v"].map(b => `<button data-b="${b}" ${m ? "disabled" : ""}${b === lit ? ` style="background:var(--A)"` : ""}>${{ rot: "ROTATE 90°", h: "FLIP ↔", v: "FLIP ↕" }[b]}</button>`).join("")}
          <span class="status">${m ? "MATCHED" : "TURN AND FLIP 3D UNTIL IT LIES ON 3B · KEYS R H V"}</span>
          <button data-b="off" class="off">${S.matched ? "DONE" : "CLOSE"}</button></div></div>`;
    }
    function act(b) {
      if (b === "off") { finish(); return; }
      if (S.matched) return;
      S.t = b === "rot" ? ROT(S.t) : b === "h" ? FLIPH(S.t) : FLIPV(S.t); S.moves++; sfx(b === "rot" ? "whoosh" : "flip");
      if (same()) { S.matched = true; S.say = LINES.match; sfx("chime"); score("overlay", 3); after = setTimeout(() => { S.say = LINES.after; draw(); }, 2200); }
      else S.say = S.moves >= SHOW_AT ? LINES.show : S.moves >= HINT_AT ? LINES.hint : S.t[1] ? LINES.mirror : LINES.turn;
      draw();
    }
    const onClick = (e) => { const b = e.target.closest && e.target.closest("button[data-b]"); if (b && !b.disabled) act(b.dataset.b); };
    const onKey = (e) => { if (e.key === "Escape") finish(); else { const b = { r: "rot", h: "h", v: "v" }[e.key.toLowerCase()]; if (b && !same()) act(b); } };
    function finish() { closed = true; clearTimeout(after); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey); el.classList.remove("show"); el.innerHTML = ""; resolve({ matched: S.matched, moves: S.moves }); }
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
  });
}
