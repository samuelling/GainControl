// THE GRIM TEST (Act III, Gus's desk). Table 1 of the Big Finding reports mean ratings (whole numbers, 1–7) for N = 19.
// A mean of whole numbers must be some whole total divided by N. Multiply by N, round, divide back: if the mean
// doesn't survive the round trip, nobody could have produced it. Resolves { done, wrong } when the table is marked.
import { seg, segW } from "../gfx.js";

export const N = 19;
export const ROWS = [
  ["ATTEND", "SUPERFICIAL", 5.26], ["ATTEND", "MIDDLE", 4.37], ["ATTEND", "DEEP", 6.12],
  ["IGNORE", "SUPERFICIAL", 3.94], ["IGNORE", "MIDDLE", 4.00], ["IGNORE", "DEEP", 2.85],
];
export const possible = (m, n = N) => { const k = Math.round(m * n); return (Math.round(k / n * 100) / 100).toFixed(2) === m.toFixed(2); };
const LINES = {
  intro: ["GUS", "Table 1. Nineteen people rated how hard they attended, one to seven, whole numbers. So every mean is some whole total over nineteen."],
  how: ["GUS", "Pick a row. Times nineteen, round to a whole total, divide back. If the mean doesn't come back, nobody could have produced it."],
  ok: ["GUS", "Comes back. That one's possible. Doesn't make it real, just possible."],
  bad: ["GUS", "Doesn't come back. No nineteen whole numbers average to that. That number was typed, not measured."],
  wrongOk: ["GUS", "Look at the last line again. It came back to the same mean. That one's possible."],
  wrongBad: ["GUS", "Look again: it came back as a different mean. That's the tell."],
  skip: ["GUS", "Do the arithmetic first. I've been fooled by my own eyes before. Monday, mostly."],
  done: ["NELL", "Three of six means are impossible. In Table 1. Of a paper in Nurture Neuroscience."],
};

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function grim(el, { score = () => {} } = {}) {
  return new Promise(resolve => {
    let spoken = null;
    const S = { row: -1, step: 0, verdict: ROWS.map(() => null), wrong: 0, say: LINES.intro, done: false };
    const calc = () => {
      if (S.row < 0) return [];
      const m = ROWS[S.row][2], p = m * N, k = Math.round(p), back = k / N, out = [];
      out.push(`${m.toFixed(2)} × ${N} = ${p.toFixed(2)}`);
      if (S.step >= 2) out.push(`ROUND → ${k}`);
      if (S.step >= 3) out.push(`${k} ÷ ${N} = ${back.toFixed(3)}… → ${back.toFixed(2)}`);
      return out;
    };
    function draw() {
      if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(S.say[0], true); }
      const rows = ROWS.map(([c, d, m], i) => {
        const v = S.verdict[i];
        return `<tr data-row="${i}" class="${i === S.row ? "sel" : ""}"><td>${c}</td><td>${d}</td><td>${N}</td><td class="num">${m.toFixed(2)}</td>
          <td class="mark">${v === null ? "" : v ? `<span class="okc">POSSIBLE</span>` : `<span class="badc">IMPOSSIBLE</span>`}</td></tr>`;
      }).join("");
      const c = calc(), m = S.row >= 0 ? ROWS[S.row][2] : 0;
      const lines = c.map((t, i) => seg(t.replace(/→/g, ">").replace(/…/g, ""), 18, 14 + i * 26, 13, i === 2 ? (possible(m) ? "sG" : "sR") : "sW", 1.3)).join("");
      el.innerHTML = `<div class="screen grim">
        <svg class="t hd" viewBox="0 0 640 40">${seg("TABLE 1", 16, 10, 18, "sW", 1.6)}${seg("MEAN ATTENTION RATING  1-7  WHOLE NUMBERS  N = 19 PER CELL", 150, 17, 5, "sM", .8)}</svg>
        <div class="grimbody">
          <table><tr><th>CONDITION</th><th>LAYER</th><th>N</th><th class="num">MEAN</th><th></th></tr>${rows}</table>
          <div class="calc"><svg class="t" viewBox="0 0 330 96">${lines || seg("PICK A ROW", 18, 40, 13, "sD", 1.2)}</svg>
            <div class="keys">
              <button data-b="mul" ${S.row >= 0 && S.step === 0 ? "" : "disabled"}>× 19</button>
              <button data-b="round" ${S.step === 1 ? "" : "disabled"}>ROUND</button>
              <button data-b="div" ${S.step === 2 ? "" : "disabled"}>÷ 19</button>
              <span class="gap"></span>
              <button data-b="ok" ${S.row >= 0 ? "" : "disabled"}>POSSIBLE</button>
              <button data-b="bad" class="red" ${S.row >= 0 ? "" : "disabled"}>IMPOSSIBLE</button>
            </div></div>
        </div>
        <div class="coachline"><span class="who" style="background:var(--${S.say[0] === "GUS" ? "B" : "G"})">${S.say[0]}</span>
          <span style="color:var(--${S.say[0] === "GUS" ? "B" : "G"})">${S.say[1]}</span></div>
        <div class="bar"><span class="status">${S.verdict.filter(v => v !== null).length} / 6 MARKED</span>
          <button data-b="off" class="off">${S.done ? "DONE" : "CLOSE"}</button></div></div>`;
    }
    function act(b, row) {
      if (row !== undefined) { S.row = row; S.step = 0; S.say = LINES.how; sfx("select"); }
      else if (b === "mul") { S.step = 1; sfx("calc"); }
      else if (b === "round") { S.step = 2; sfx("calc"); }
      else if (b === "div") { S.step = 3; sfx("calc"); }
      else if (b === "ok" || b === "bad") {
        if (S.step < 3) { S.say = LINES.skip; sfx("cancel"); }
        else {
          const truth = possible(ROWS[S.row][2]), said = b === "ok";
          if (said !== truth) { S.wrong++; S.say = truth ? LINES.wrongOk : LINES.wrongBad; sfx("bad"); }
          else { S.verdict[S.row] = truth; S.say = truth ? LINES.ok : LINES.bad; sfx(truth ? "good" : "stamp");
            if (S.verdict.every(v => v !== null)) { S.done = true; S.say = LINES.done; sfx("chime"); score("grim", Math.max(1, 4 - S.wrong)); } }
        }
      } else if (b === "off") { finish(); return; }
      draw();
    }
    const onClick = (e) => {
      const r = e.target.closest && e.target.closest("tr[data-row]"); if (r) { act(null, +r.dataset.row); return; }
      const b = e.target.closest && e.target.closest("button[data-b]"); if (b && !b.disabled) act(b.dataset.b);
    };
    const onKey = (e) => { if (e.key === "Escape") finish(); };
    function finish() { el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey); el.classList.remove("show"); el.innerHTML = ""; resolve({ done: S.done, wrong: S.wrong }); }
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
  });
}
