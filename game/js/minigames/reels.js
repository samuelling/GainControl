// THE ARCHIVE (Act V, B3 Tube Hub; played by Morris). Twelve reel-to-reel tapes on the Archive shelves: four that prove
// the network and eight that don't. Pick a reel, it goes into the canister; set the big brass destination dial; SEND.
// The magnet is ramping next door (a countdown): a decoy sent to Ethel wastes time; a wrong address loses the reel.
// reels(el, { seconds = 90, score(key, n) }) → Promise<{ sent, wrongSends, decoys, lost, timeLeft, done }>
import { seg, segC, segW, chip, arcs } from "../gfx.js";

export const REELS = [
  { t: ["MEMBERSHIP", "ROLLS 1974-"], good: true, look: "Membership rolls. Every hood since '74. Pal, this is the family tree." },
  { t: ["HOLIDAY ROAST", "1983"], look: "The '83 roast. I've heard bits through the vents. The gavel joke kills. Not evidence, though." },
  { t: ["SHERRY", "INVENTORY 1971-"], look: "Sherry inventory. Fifty-five years of sherry. Zero years of evidence." },
  { t: ["PANEL SCORES", "1983-"], good: true, look: "Panel scores. Who got funded, and who got triaged for not being family." },
  { t: ["GAVEL CARE", "& POLISHING"], look: "Gavel care. You polish a skull clockwise. Who knew. Not evidence." },
  { t: ["AGE", "VERIFICATIONS"], look: "Age verifications. Every one says 39. That's a running gag, pal, not a smoking gun." },
  { t: ["REVIEWER 2", "REPORTS"], good: true, look: "Reviewer 2. All of 'em. Fifty years of 'the authors should simply.'" },
  { t: ["MINUTES 1974-", "(NONE KEPT)"], look: "The minutes. It's blank tape. They're proud of it." },
  { t: ["HOOD DRY", "CLEANING"], look: "Dry-cleaning receipts. Hoods. So many hoods. Ethel doesn't need our laundry." },
  { t: ["EDITORIAL", "BOARDS"], good: true, look: "Editorial boards. Who sat in which chair. Same chairs, different decades. Same butts." },
  { t: ["AFTER-DINNER", "SLIDES"], look: "After-dinner slides. 'Must now be clean. Mostly.' Mostly not." },
  { t: ["39TH BIRTHDAYS", "1979-"], look: "Quorum's 39th birthday party. Forty-seven of 'em. Same cake." },
];
const DECOY_SENT = {
  1: "Ethel's about to hear forty minutes of tenure jokes. That's on me.",
  2: "Ethel now knows exactly how much sherry. Not helpful. Slightly helpful.",
  4: "Sent Ethel the skull-polishing guide. She'll file it under S.",
  5: "Ethel's getting a thousand 39s. She's gonna think it's a typo.",
  7: "I sent Ethel an hour of nothing. Felt good, though.",
  8: "Ethel's getting a laundry list. Literally.",
  10: "Ethel's getting the after-dinner slides. I'm so sorry, Ethel.",
  11: "Forty-seven birthday parties, express to Ethel. Happy birthday, Ethel.",
};
const GOOD_SENT = [
  "Fwoomp. Second floor, Ethel Bord, binders at the ready.",
  "Two. The Table built this tube to pass reviews. Now it's passing them a review.",
  "Three. My implant's sulking. That's how I know it's working.",
  "Four for four. That's the whole family tree, pal. Ethel's about to have the Friday of her life.",
];
export const DEST = [
  { t: "ETHEL BORD 2F", ok: true },
  { t: "REGISTRAR", n: "Delivered to the Registrar. The reel has been enrolled. It will graduate in five to seven years." },
  { t: "BINDER STORAGE", n: "Delivered to binder storage. Ethel will find it in a binder, in 2031." },
  { t: "PENNY LEDGER 1F", n: "Delivered to Penny Ledger. She'll need a form for that." },
  { t: "B3 (HERE)", here: true },
  { t: "RECYCLING", n: "Delivered to the recycling. Excluded." },
  { t: "PROVOST", n: "Delivered to the Provost. The Provost's office thanks you for your feedback." },
  { t: "CURRICULUM CMTE", n: "Delivered to the curriculum committee, who will discuss it at their next meeting, in 2029." },
];
const COL = { MORRIS: "K", NARRATOR: "W" };

const CSS = `
.rls svg.rlsvg { position: relative; width: 100%; flex: 1 1 0; min-height: 0; }
.rls [data-reel], .rls [data-dest], .rls [data-knob] { cursor: pointer; }
.rls.lock [data-reel], .rls.lock [data-dest], .rls.lock [data-knob] { cursor: default; }
.rls:not(.lock) [data-reel]:hover .rh { stroke: var(--G); }
.rls:not(.lock) [data-dest]:hover path { stroke: var(--G); }
.rls:not(.lock) [data-knob]:hover .kn { stroke: var(--G); }
.rls .coachline { font-size: 1.8cqw; line-height: 1.2; }
`;
function css() { if (document.getElementById("css-reels")) return; const s = document.createElement("style"); s.id = "css-reels"; s.textContent = CSS; document.head.appendChild(s); }

// a reel-to-reel spool: flange, tape pack, hub, three cut-outs
function reel(cx, cy, r, cls = "sW", tape = "sA", wiped = false) {
  let s = `<circle class="k ${cls}" cx="${cx}" cy="${cy}" r="${r}"/><circle class="hl ${wiped ? "sD" : tape}" cx="${cx}" cy="${cy}" r="${r * .72}"/><circle class="${cls}" cx="${cx}" cy="${cy}" r="${r * .2}"/>`;
  for (let k = 0; k < 3; k++) {
    const a = k * 2.094 - 1.571, a1 = a - .5, a2 = a + .5, r1 = r * .34, r2 = r * .6;
    const P = (aa, rr) => `${(cx + Math.cos(aa) * rr).toFixed(1)},${(cy + Math.sin(aa) * rr).toFixed(1)}`;
    s += `<path class="hl ${cls}" d="M${P(a1, r1)} L${P(a1, r2)} A${r2},${r2} 0 0 1 ${P(a2, r2)} L${P(a2, r1)} A${r1},${r1} 0 0 0 ${P(a1, r1)}"/>`;
  }
  if (wiped) s += `<path class="hl sD" d="M${cx - r * .6},${cy - r * .2} C${cx - r * .2},${cy + r * .3} ${cx + r * .2},${cy - r * .4} ${cx + r * .6},${cy + r * .1}"/>`;
  return s;
}

export function reels(el, { seconds = 90, score = () => {} } = {}) {
  css();
  return new Promise(resolve => {
    const S = { t: seconds, total: seconds, load: -1, dial: 1, gone: {}, sent: 0, wrong: 0, decoys: 0, lost: 0, anim: 0, pen: 0,
      over: false, done: false, say: ["MORRIS", "The Archive. Fifty years of the Table, on tape. And a magnet warming up next door."], q: [] };
    const timers = []; let tick = null, qT = null;
    const later = (ms, f) => timers.push(setTimeout(f, ms));

    // a short line queue; lines show for a beat each, the newest batch replaces what's waiting
    function say(...lines) { S.q = lines; clearTimeout(qT); nextLine(); }
    function nextLine() { if (!S.q.length) return; S.say = S.q.shift(); draw(); if (S.q.length) qT = setTimeout(nextLine, Math.max(2000, 45 * S.say[1].length)); }

    function shelves() {
      let s = seg("SHELVES 1-3", 8, 2, 5, "sM", .8) + seg("REEL-TO-REEL  PROPERTY OF THE TABLE  DO NOT DEGAUSS", 64, 2.5, 4, "sD", .7);
      for (let row = 0; row < 3; row++) {
        const y = 52 + row * 76;
        s += `<path class="sM" d="M4,${y + 44} L350,${y + 44}"/><path class="hl sD" d="M10,${y + 44} L10,${y + 52} M344,${y + 44} L344,${y + 52} M4,${y + 48} L350,${y + 48}"/>`;
        for (let c = 0; c < 4; c++) {
          const i = row * 4 + c, cx = 48 + c * 86, R = REELS[i];
          if (S.gone[i] || S.load === i) { s += `<circle class="hl sD dash" cx="${cx}" cy="${y - 2}" r="22"/>`; continue; }
          s += `<g data-reel="${i}">${reel(cx, y - 2, 22, S.over ? "sM" : "sW", "sA", S.over)}<rect class="hl rh ${S.over ? "sD" : "sW"}" x="${cx - 38}" y="${y + 23}" width="76" height="18"/>
            ${segC(R.t[0], cx, y + 26, 4.4, S.over ? "sD" : "sW", .8)}${segC(R.t[1], cx, y + 33.5, 4.4, S.over ? "sD" : "sW", .8)}
            <rect x="${cx - 40}" y="${y - 26}" width="80" height="70" fill="transparent"/></g>`;
        }
      }
      return s;
    }
    function tube() {
      const x = 386;
      let s = `<path class="sA" d="M${x - 10},0 L${x - 10},172 C${x - 10},180 ${x - 18},182 ${x - 20},188 M${x + 10},0 L${x + 10},172 C${x + 10},180 ${x + 18},182 ${x + 20},188"/>`;
      [20, 70, 120].forEach(y => s += `<rect class="k sA" x="${x - 13}" y="${y}" width="26" height="6"/>`);
      s += `<path class="hl sA" d="M${x - 20},188 L${x + 20},188"/>` + seg("TO", x + 16, 6, 4, "sM", .7) + seg("BUILDING", x + 16, 13, 4, "sM", .7);
      // the canister: in the mouth, or on its way up in fixed poses
      const cy = [212, 150, 96, 40, -40][S.anim];
      s += `<g><rect class="k sA" x="${x - 11}" y="${cy - 22}" width="22" height="44" rx="9"/><path class="hl sA" d="M${x - 11},${cy - 12} L${x + 11},${cy - 12} M${x - 11},${cy + 12} L${x + 11},${cy + 12}"/>`;
      if (S.load >= 0) s += reel(x, cy, 9, "sW", "sA");
      s += `</g>`;
      if (S.anim) s += `<path class="hl sW" d="M${x - 4},${cy + 30} L${x - 4},${cy + 46} M${x + 4},${cy + 34} L${x + 4},${cy + 54} M${x},${cy + 28} L${x},${cy + 40}"/>`;
      if (S.anim === 4) s += segC("THWUMP", x, 190, 6, "sA", 1);
      if (S.load >= 0 && !S.anim) s += segC(REELS[S.load].t[0], x, 240, 4.2, "sW", .8) + segC(REELS[S.load].t[1], x, 247, 4.2, "sW", .8);
      if (S.load < 0 && !S.anim) s += segC("EMPTY", x, 240, 4.2, "sD", .8);
      return s;
    }
    function dial() {
      const cx = 536, cy = 158, R = 40;
      let s = seg("DESTINATION", cx - segW("DESTINATION", 4.4) / 2, 76, 4.4, "sM", .8) + `<path class="hl sD" d="M${cx - 30},${84} L${cx + 30},${84}"/>`;
      s += `<circle class="k sA" cx="${cx}" cy="${cy}" r="${R}"/><circle class="hl sA" cx="${cx}" cy="${cy}" r="${R - 6}"/>`;
      DEST.forEach((d, i) => {
        const a = -Math.PI / 2 + i * Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a), sel = S.dial === i;
        s += `<path class="sA" d="M${(cx + ca * R).toFixed(1)},${(cy + sa * R).toFixed(1)} L${(cx + ca * (R + 5)).toFixed(1)},${(cy + sa * (R + 5)).toFixed(1)}"/>`;
        const h = 4.4, w = segW(d.t, h) + (sel ? h * .9 : 0), lx = ca > .3 ? cx + ca * (R + 9) : ca < -.3 ? cx + ca * (R + 9) - w : cx - w / 2;
        const ly = cy + sa * (R + 10) - (sa < -.3 ? h + 3 : sa > .3 ? -1 : h / 2 + 1);
        s += `<g data-dest="${i}">${sel ? chip(d.t, lx, ly - h * .35, h, "fA") : seg(d.t, lx, ly, h, "sW", .8)}<rect x="${lx - 3}" y="${ly - 4}" width="${w + 6}" height="${h + 8}" fill="transparent"/></g>`;
      });
      // pointer and knob (click the knob to turn one click clockwise)
      const a = -Math.PI / 2 + S.dial * Math.PI / 4, px = cx + Math.cos(a) * (R - 8), py = cy + Math.sin(a) * (R - 8);
      s += `<g data-knob="1"><circle class="k kn sA" cx="${cx}" cy="${cy}" r="13"/><path class="sA" d="M${cx},${cy} L${px.toFixed(1)},${py.toFixed(1)}"/>
        <circle class="fA" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.6"/><circle class="hl sA" cx="${cx}" cy="${cy}" r="4"/></g>`;
      return s;
    }
    function clock() {
      const x = 446, m = Math.floor(Math.max(0, S.t) / 60), sec = String(Math.max(0, S.t) % 60).padStart(2, "0"), hot = S.t <= 20 && !S.done;
      let s = seg("MAGNET RAMP", x, 2, 4.4, "sM", .8) + seg(`${m}:${sec}`, x, 10, 20, hot ? "sR" : "sW", 1.5);
      if (S.pen) s += seg("-" + S.pen, x + 58, 12, 8, "sR", 1.1);
      const f = 1 - Math.max(0, S.t) / S.total;
      for (let k = 0; k < 16; k++) s += `<rect class="${f * 16 > k ? "fR" : "hl sD"}" x="${x + 92 + k * 6.4}" y="16" width="4.6" height="14"/>`;
      s += seg("FIELD", x + 92, 2, 4.4, "sM", .8);
      if (S.over) s += arcs(x + 200, 22, 1, "sR", 3, .7);
      return s;
    }
    function tally() {
      const x = 446, y = 242;
      let s = seg("DELIVERED TO ETHEL BORD 2F", x, y, 4.4, "sM", .8);
      for (let k = 0; k < 4; k++) s += `<rect class="${S.sent > k ? "fG" : "hl sD"}" x="${x + k * 18}" y="${y + 9}" width="14" height="14"/>`;
      s += seg("WRONG SENDS " + S.wrong, x + 84, y + 13, 5, S.wrong ? "sR" : "sD", .9);
      return s;
    }
    function draw() {
      const lock = S.anim || S.over || S.done, col = COL[S.say[0]] || "W";
      el.innerHTML = `<div class="screen rls ${lock ? "lock" : ""}">
        <svg class="t hd" viewBox="0 0 640 40">${seg("THE ARCHIVE", 16, 10, 18, "sW", 1.6)}${seg("B3  TUBE HUB  EVERY LINE IN THE BUILDING ENDS HERE", 170, 17, 5, "sM", .8)}</svg>
        <svg class="t rlsvg" viewBox="0 0 640 276">
          ${shelves()}<path class="hl sD" d="M358,0 L358,276"/>${tube()}${dial()}<g class="rclk">${clock()}</g>${tally()}
        </svg>
        <div class="coachline"><span class="who" style="background:var(--${col})">${S.say[0]}</span><span style="color:var(--${col})">${S.say[1]}</span></div>
        <div class="bar"><button data-b="send" ${S.load >= 0 && !lock ? "" : "disabled"}>SEND</button><button data-b="out" ${S.load >= 0 && !lock ? "" : "disabled"}>UNLOAD</button>
          <span class="status">${S.done ? (S.sent === 4 ? "ALL FOUR DELIVERED" : S.sent + " OF 4 DELIVERED") : S.over ? "THE MAGNET IS AT FIELD" : S.load >= 0 ? "LOADED: " + REELS[S.load].t.join(" ") + "  →  " + DEST[S.dial].t : "PICK A REEL"}</span>
          <button data-b="off" class="off">${S.done || S.over ? "DONE" : "CLOSE"}</button></div></div>`;
    }

    function load(i) {
      if (S.anim || S.over || S.done || S.gone[i]) return;
      S.load = i; say(["MORRIS", REELS[i].look]);
    }
    function send() {
      if (S.load < 0 || S.anim || S.over || S.done) return;
      const i = S.load, R = REELS[i], D = DEST[S.dial];
      [1, 2, 3, 4].forEach(k => later(120 * k, () => { S.anim = k; draw(); }));
      later(120 * 5 + 200, () => {
        S.anim = 0;
        if (D.here) { say(["MORRIS", "Return to sender. The sender is me. Ow. Point the dial somewhere else, pal."]); return; }
        S.load = -1; S.gone[i] = true;
        if (D.ok && R.good) {
          S.sent++; say(["MORRIS", GOOD_SENT[S.sent - 1]]);
          if (S.sent === 4) { S.done = true; clearInterval(tick); score("reels", 4); draw(); }
          else checkLeft();
          return;
        }
        S.wrong++;
        if (D.ok) { S.decoys++; penalty(10); say(["MORRIS", DECOY_SENT[i] || "That one wasn't evidence, pal."], ["NARRATOR", "That cost ten seconds."]); return; }
        if (R.good) S.lost++;
        say(["NARRATOR", D.n], ["MORRIS", R.good ? "Aw, no. That was a good one, too." : "Eh. Nobody needed that one."]);
        if (R.good) checkLeft(true);
      });
    }
    // no damning reels left on the shelf: nothing more worth sending
    function checkLeft(afterLoss) {
      if (REELS.some((r, k) => r.good && !S.gone[k])) return;
      S.done = true; clearInterval(tick); score("reels", S.sent);
      const l = ["MORRIS", S.sent ? `That's every good reel, pal. ${S.sent} of 'em made it to Ethel. The rest are… elsewhere.` : "That's every good reel, pal. None of 'em made it to Ethel. I'm a rat, not a mailroom."];
      if (afterLoss) S.q.push(l); else say(l);
      draw();
    }
    function penalty(n) { S.t = Math.max(0, S.t - n); S.pen = n; later(1600, () => { S.pen = 0; const c = el.querySelector(".rls .rclk"); if (c) c.innerHTML = clock(); }); if (S.t <= 0) timeUp(); }
    function timeUp() {
      if (S.over || S.done) return;
      S.over = true; S.load = -1; clearInterval(tick); score("reels", S.sent);
      say(["MORRIS", "My itch just went through the roof. That's the field, pal."], ["NARRATOR", "Every reel left in the Archive is now a very long piece of brown ribbon."]);
    }
    const onClick = (e) => {
      const t = e.target;
      const b = t.closest && t.closest("button[data-b]");
      if (b) { if (b.disabled) return; const k = b.dataset.b;
        if (k === "send") send(); else if (k === "out") { S.load = -1; draw(); } else finish(); return; }
      if (S.anim || S.over || S.done) return;
      const r = t.closest && t.closest("[data-reel]"); if (r) { load(+r.dataset.reel); return; }
      const d = t.closest && t.closest("[data-dest]"); if (d) { S.dial = +d.dataset.dest; draw(); return; }
      const kn = t.closest && t.closest("[data-knob]"); if (kn) { S.dial = (S.dial + 1) % DEST.length; draw(); }
    };
    const onKey = (e) => { if (e.key === "Escape") finish(); };
    function finish() {
      timers.forEach(clearTimeout); clearInterval(tick); clearTimeout(qT);
      el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = "";
      if (!S.over && !S.done) score("reels", S.sent);
      resolve({ sent: S.sent, wrongSends: S.wrong, decoys: S.decoys, lost: S.lost, timeLeft: Math.max(0, S.t), done: S.done });
    }
    el.classList.add("show");
    say(S.say, ["MORRIS", "Magnets eat tape, pal. Good reels in the canister, dial to Ethel, whoosh. Before the field comes up."]);
    tick = setInterval(() => { if (S.over || S.done) return; S.t--; if (S.t <= 0) { timeUp(); return; }
      const c = el.querySelector(".rls .rclk"); if (c) c.innerHTML = clock(); }, 1000);
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
  });
}
