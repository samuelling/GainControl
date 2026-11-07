// THE METAMER (Act IV, the library). Six sentences of the Big Finding against the back issues. Each sentence is an older
// paper's claim in newer words: match by meaning, not by text. When all six are matched, the source labs light up (the
// same three feeder labs). Then CHECK THE REFERENCES: two of the eight citations aren't on any shelf.
// Every wrong pair says what each side claims. Hint ladder per sentence: 2 misses, Nell points at the idea to look for;
// 4, Morris lights the card. References: 2 wrong, how to check; 4, the two fakes are marked in brass.
// Everything here is fictional: papers, people, journals, labs. Resolves { done, wrong }.
import { seg } from "../gfx.js";

// the Big Finding: Valu et al., Nurture Neuroscience
export const SENTS = [
  "Attention is known to reach V1, the cortex's first stop for vision, yet how deep into its layers it arrives has never been resolved.",
  "Using a 7T scanner, we measured V1's blood-flow signal at six depths, from the brain's surface down to the white matter beneath.",
  "Attention boosted responses most in the top layer and the deep layers, where feedback from higher brain areas arrives.",
  "Layer 4, the input layer where signals from the eyes come in (via the thalamus), barely changed with attention.",
  "This U-shaped pattern, highest at both ends and lowest in the middle, is the signature of top-down gain control.",
  "These findings overturn decades of bottom-up thinking and call for sustained investment in layer research.",
];
// the shelf: s = the Big Finding sentence it was lifted into (−1: a decoy). lab: a feeder lab key, or null.
export const LABS = { hindex: ["THE HINDEX LAB", "A"], sinecure: ["SINECURE GROUP", "V"], quorum: ["QUORUM LAB", "R"] };
export const SRC = [
  { s: 2, yr: "1988", au: "SINECURE, A.", lab: "sinecure", j: "CORTEX & CONTEXT 7, 201-219",
    q: "Fibres returning from the higher areas end in the outermost lamina and in the lowest ones. It is there, and only there, that the animal's intent was felt." },
  { s: -1, yr: "1985", au: "STEADY, K.", lab: null, labName: "THE STEADY LAB", j: "J. COMP. CORTEX 14, 88-97",
    q: "Readings at every depth rose and fell together, as one blurred measurement must. We could not tell one lamina from another.",
    no: "Steady says the depths can't be told apart. Preston's sentence says they can. That's the opposite claim." },
  { s: 4, yr: "1996", au: "HINDEX, M. & SINECURE, A.", lab: "hindex", j: "TRENDS IN TRENDS 1, 1-4",
    q: "Two peaks of modulation flanking a quiet middle: the fingerprint of an instruction from above, a turning of the volume rather than of the picture." },
  { s: 0, yr: "1979", au: "QUORUM, R.", lab: "quorum", j: "ANN. REV. ATTN. 3, 1-19",
    q: "That the will to select reaches the striate cortex is granted. At what depth of that sheet it alights, no one has yet said." },
  { s: -1, yr: "1993", au: "FAIRWEATHER, J.", lab: null, labName: "FAIRWEATHER LAB", j: "VIS. NEUROPHYS. 24, 12-30",
    q: "Attention sharpened responses in the input lamina itself, contrary to every feedback account of the striate cortex.",
    no: "Fairweather has attention working in the input layer. The Big Finding says the input layer doesn't budge. Opposite." },
  { s: 5, yr: "1987", au: "LAUD, T. & SINECURE, A.", lab: "sinecure", j: "GRANT OFFICE Q. 9, 5",
    q: "Our results unseat the received, bottom-up view of the cortex, and require, at a minimum, a further decade of support." },
  { s: -1, yr: "2004", au: "DRAINER, L.", lab: null, labName: "THE DRAINER LAB", j: "J. COMP. CORTEX 33, 140-152",
    q: "Large veins on the surface carry the blood signal upward, so any depth profile measured from blood flow leans toward the surface.",
    no: "Drainer's about veins smearing the signal toward the surface. That's the warning label, not the claim." },
  { s: 1, yr: "1983", au: "LAUD, T. & HINDEX, M.", lab: "hindex", j: "J. COMP. CORTEX 12, 40-58",
    q: "The electrode was lowered by stages through the striate cortex, a reading taken at each, from the surface membrane to the white fibres beneath." },
  { s: -1, yr: "1999", au: "PLAIN, O.", lab: null, labName: "OPEN BENCH GROUP", j: "CORTEX & CONTEXT 18, 77-81",
    q: "Attention lifts the whole striate response. We find no depth at which it lifts more. We report it anyway, in full.",
    no: "That one's a null. Preston's paper doesn't do nulls.", nw: "MORRIS", nx: "That one's you in a past life, pal." },
  { s: 3, yr: "1991", au: "TENURE, B. & QUORUM, R.", lab: "quorum", j: "VIS. NEUROPHYS. 22, 310-327",
    q: "The geniculate-recipient lamina was indifferent to the task. It relays what arrives and asks no questions." },
];
// the reference list. src: the shelf card it points to, or null (it doesn't exist).
export const REFS = [
  { t: "QUORUM, R. (1979A). THE STRIATE QUESTION. ANN. REV. ATTN. 3, 1-19.", src: 3 },
  { t: "LAUD, T. & HINDEX, M. (1983). LAMINAR STAGES. J. COMP. CORTEX 12, 40-58.", src: 7 },
  { t: "SINECURE, A. (1988). WHERE THE FEEDBACK ENDS. CORTEX & CONTEXT 7, 201-219.", src: 0 },
  { t: "QUORUM, R. (1979B). ON THE DESCENDING INSTRUCTION. ANN. REV. ATTN. 3, 20-31.", src: null, id: "1979b" },
  { t: "TENURE, B. & QUORUM, R. (1991). AN INDIFFERENT LAMINA. VIS. NEUROPHYS. 22, 310-327.", src: 9 },
  { t: "HINDEX, M. & SINECURE, A. (1996). TWIN PEAKS. TRENDS IN TRENDS 1, 1-4.", src: 2 },
  { t: "LAUD, T. & SINECURE, A. (1987). A FURTHER DECADE. GRANT OFFICE Q. 9, 5.", src: 5 },
  { t: "VALU, P. & MICK, P. (2025). LAMINAR GAIN WITHOUT END. J. ENDLESS RES. 1, 1-∞.", src: null, id: "endless" },
];
const LINES = {
  // a metamer, in colour vision: two lights that look identical but are mixed from different wavelengths
  intro: ["NELL", "A metamer: two colours that look identical but are mixed from different lights. His paper's one. Every sentence is an older paper's claim in new words."],
  key: ["NELL", "Old papers talk funny. Striate cortex means V1. A lamina is a layer. The geniculate is the thalamus. Click one of his sentences to start."],
  how: ["NELL", "Now the back issue that makes the same claim in older words. Same meaning, not same words."],
  howC: ["NELL", "Now the sentence of his that says the same thing."],
  ok: [["MORRIS", "Same claim, fancier hat."], ["NELL", "Lifted. Re-spelled, re-dated, same idea."], ["MORRIS", "Old words, new suit, pal."],
    ["NELL", "That's the source. He didn't even change the order of the argument."], ["MORRIS", "That one's been through the wash a few times."]],
  near: ["NELL", "Same shelf, different claim. Read it again."],
  // a wrong pair, said plainly: what the card claims, and what the sentence claims
  mismatch: (c, s) => ["NELL", `That card is about ${GIST[SRC[c].s]}. Sentence ${s + 1} is about ${GIST[s]}. Different claims.`],
  // the ladder: two misses on a sentence, a pointer; four, the card itself
  hint: [
    ["NELL", "Sentence 1: attention gets to V1, but nobody knows at what depth. Look for an old card that grants the first part and says nobody's answered the second."],
    ["NELL", "Sentence 2 is the method: a reading at depth after depth, surface to white matter. Look for somebody lowering an electrode in stages."],
    ["NELL", "Sentence 3: feedback ends in the top layer and the deep ones. Look for fibres from the higher areas ending in the outermost and lowest laminae."],
    ["NELL", "Sentence 4: the input layer barely moves. 'Geniculate' is the thalamus, so the geniculate-recipient lamina is layer 4. Find the one that's 'indifferent.'"],
    ["NELL", "Sentence 5: a U, high at both ends with a quiet middle, called a signature. Look for 'two peaks' and a 'fingerprint.'"],
    ["NELL", "Sentence 6: overturn the old view, then ask for money. Look for the card that wants another decade of support."],
  ],
  show: (c) => ["MORRIS", `This one, pal. ${SRC[c].au} ${SRC[c].yr}. It's lit up. Click it.`],
  refHint: ["NELL", "Check each one against the shelf: authors, year, journal, pages. Two have no card at all."],
  refShow: ["MORRIS", "The two I've marked, pal. Look at the years and the journal. Nobody's shelving those."],
  labs: ["NELL", "Six sentences, six back issues, three labs. The Hindex Lab, the Sinecure Group, the Quorum Lab. Every single one."],
  labs2: ["MORRIS", "The feeder labs. Same names on every Rising Stars wall, pal."],
  refs: ["NELL", "Now his references: the papers he says he got it from. Eight. Every real one should be on this shelf."],
  real: (c) => ["NELL", `No, that one's real. It's right there on the shelf: ${SRC[c].au} ${SRC[c].yr}.`],
  "1979b": ["NELL", "Quorum, 1979b. There's only one Quorum paper from 1979 on this shelf. There is no b. Pages 20 to 31 are somebody's obituary."],
  endless: ["NELL", "Journal of Endless Research. Volume one, pages one to infinity. That's not a journal, that's a mission statement."],
  done: ["NELL", "It's a collage of the Table's own work. And its real author list is a partial membership roll."],
  done2: ["MORRIS", "So the paper's a family reunion. Who brought the potato salad?"],
};
const GIST = ["an open question: where in the cortex attention arrives", "the method: measuring at depth after depth", "feedback ending in the top and deep layers",
  "the input layer barely moving", "a U-shaped 'signature' of top-down gain", "overturning the old view, and asking for more money"];
const COL = { NELL: "G", MORRIS: "K", GUS: "B", PENNY: "B", NARRATOR: "W" };
const CSS = `
.metamer .mbody { flex: 1 1 0; min-height: 0; display: grid; grid-template-columns: 33% 1fr; gap: 1.4cqw; padding: .7cqw 0; }
.metamer .col { display: flex; flex-direction: column; gap: .45cqw; min-height: 0; }
.metamer .colhd { font-size: 1cqw; letter-spacing: .1em; color: var(--M); flex: none; }
.metamer .sent { flex: 1 1 0; display: flex; gap: .6cqw; align-items: flex-start; font-size: 1.36cqw; line-height: 1.13; padding: .3cqw .5cqw;
  border: .08cqw solid var(--D); cursor: pointer; color: var(--W); overflow: hidden; }
.metamer .sent:hover, .metamer .card:hover, .metamer .ref:hover { border-color: var(--W); }
.metamer .sent.sel, .metamer .card.sel { border-color: var(--A); color: var(--A); }
.metamer .sent.ok, .metamer .card.ok { border-color: var(--G); color: var(--G); cursor: default; }
.metamer .num { flex: none; display: inline-block; min-width: 1.5cqw; text-align: center; font-size: 1.05cqw; font-weight: 600; color: #000; background: var(--D); }
.metamer .ok .num { background: var(--G); }
.metamer .pool { flex: 1 1 0; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: .45cqw; }
.metamer .card { border: .08cqw solid var(--D); padding: .25cqw .5cqw; cursor: pointer; overflow: hidden; color: var(--W); min-height: 0; display: flex; flex-direction: column; }
.metamer .card .meta { display: flex; align-items: center; gap: .5cqw; font-size: .98cqw; line-height: 1.2; white-space: nowrap; }
.metamer .card svg.yr { position: relative; inset: auto; width: 3.2cqw; height: 1.15cqw; flex: none; }
.metamer .card .au { color: var(--B); overflow: hidden; text-overflow: ellipsis; }
.metamer .card .lab { margin-left: auto; color: var(--M); font-size: .9cqw; padding: 0 .3cqw; letter-spacing: .05em; }
.metamer .card .lab.lit { color: #000; font-weight: 600; }
.metamer .card .q { flex: 1 1 auto; font-size: 1.06cqw; line-height: 1.1; margin-top: .1cqw; }
.metamer .card .j { flex: none; font-size: .8cqw; line-height: 1.1; color: var(--M); letter-spacing: .05em; }
.metamer .card.ok .q { color: var(--G); }
.metamer .card.dim { opacity: .35; }
.metamer .card.flash { border-color: var(--G); outline: .12cqw solid var(--G); }
.metamer.stage2 .card { cursor: default; }
.metamer .ref { flex: 1 1 0; display: flex; gap: .6cqw; align-items: center; font-size: 1.22cqw; line-height: 1.12; padding: .2cqw .5cqw;
  border: .08cqw solid var(--D); cursor: pointer; color: var(--W); }
.metamer .ref.fake { border-color: var(--R); color: var(--R); cursor: default; }
.metamer .ref.fake .num { background: var(--R); }
.metamer .ref .flag { margin-left: auto; flex: none; font-size: .95cqw; font-weight: 600; color: #000; background: var(--R); padding: 0 .3cqw; }
`;
function injectStyle(id, css) { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); }

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function metamer(el, { score = () => {} } = {}) {
  injectStyle("mg-metamer", CSS);
  return new Promise(resolve => {
    const S = { stage: 1, sel: null, matched: SENTS.map(() => null), wrong: 0, say: LINES.intro, flagged: {}, done: false, okN: 0, flash: -1,
      miss: SENTS.map(() => 0), show: SENTS.map(() => false), refMiss: 0 };
    const timers = [];
    const later = (ms, fn) => timers.push(setTimeout(() => { fn(); draw(); }, ms));
    const cardOf = (s) => S.matched[s];                    // shelf index matched to sentence s
    const sentOf = (c) => S.matched.indexOf(c);
    const allMatched = () => S.matched.every(v => v !== null);
    let spoken = null;
    const coach = () => { const [w, t] = S.say; if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(w, true); } return `<span class="who" style="background:var(--${COL[w]})">${w}</span><span style="color:var(--${COL[w]})">${t}</span>`; };
    function card(c) {
      const x = SRC[c], s = sentOf(c), lit = S.stage === 2 || allMatched();
      const shown = S.stage === 1 && x.s >= 0 && s < 0 && S.show[x.s];   // the ladder's last rung: the card lights up
      const cls = ["card", s >= 0 ? "ok" : "", S.sel && S.sel.side === "c" && S.sel.i === c ? "sel" : "", lit && x.s < 0 ? "dim" : "", S.flash === c || shown ? "flash" : ""].join(" ");
      const lab = x.lab ? LABS[x.lab] : [x.labName, "M"];
      const labHtml = lit && x.lab ? `<span class="lab lit" style="background:var(--${lab[1]})">${lab[0]}</span>` : `<span class="lab">${lab[0]}</span>`;
      return `<div class="${cls}" data-c="${c}"><div class="meta">${s >= 0 ? `<span class="num">${s + 1}</span>` : ""}
        <svg class="t yr" viewBox="0 0 28 10">${seg(x.yr, 1, 2, 6.4, s >= 0 ? "sG" : "sA", 1)}</svg><span class="au">${x.au}</span>${labHtml}</div>
        <div class="q">${x.q}</div><div class="j">${x.j}</div></div>`;
    }
    function left() {
      if (S.stage === 1) return `<div class="colhd">THE BIG FINDING  ·  VALU ET AL.  ·  NURTURE NEUROSCIENCE</div>` + SENTS.map((t, i) => {
        const ok = cardOf(i) !== null, sel = S.sel && S.sel.side === "s" && S.sel.i === i;
        return `<div class="sent ${ok ? "ok" : ""} ${sel ? "sel" : ""}" data-s="${i}"><span class="num">${i + 1}</span><span>${t}</span></div>`;
      }).join("");
      return `<div class="colhd">REFERENCES  ·  CLICK THE ONES THAT DON'T EXIST</div>` + REFS.map((r, i) =>
        `<div class="ref ${S.flagged[i] ? "fake" : ""}" data-r="${i}"${S.refMiss >= 4 && r.src === null && !S.flagged[i] ? ` style="border-color:var(--A);color:var(--A)"` : ""}><span class="num">${i + 1}</span><span>${r.t}</span>${S.flagged[i] ? `<span class="flag">NOT ON ANY SHELF</span>` : ""}</div>`).join("");
    }
    function draw() {
      const nFake = Object.keys(S.flagged).length;
      const status = S.stage === 1 ? `${S.matched.filter(v => v !== null).length} / 6 MATCHED` : `${nFake} / 2 FOUND`;
      const hd = S.stage === 1
        ? seg("THE METAMER", 16, 10, 18, "sW", 1.6) + seg("CLICK A SENTENCE, THEN THE BACK ISSUE THAT MAKES THE SAME CLAIM", 196, 17, 5, "sM", .8)
        : seg("REFERENCES", 16, 10, 18, "sW", 1.6) + seg("EVERY REAL CITATION SHOULD BE ON THE SHELF", 182, 17, 5, "sM", .8);
      el.innerHTML = `<div class="screen metamer ${S.stage === 2 ? "stage2" : ""}">
        <svg class="t hd" viewBox="0 0 640 40">${hd}</svg>
        <div class="mbody"><div class="col">${left()}</div>
          <div class="col"><div class="colhd">THE BACK ISSUES  ·  LIBRARY 2F</div><div class="pool">${SRC.map((_, c) => card(c)).join("")}</div></div></div>
        <div class="coachline">${coach()}</div>
        <div class="bar"><span class="status">${status}</span>
          ${S.stage === 1 && allMatched() ? `<button data-b="refs">CHECK THE REFERENCES</button>` : ""}
          <button data-b="off" class="off">${S.done ? "DONE" : "CLOSE"}</button></div></div>`;
    }
    function tryPair(s, c) {
      S.sel = null;
      if (SRC[c].s === s) {
        S.matched[s] = c; S.say = LINES.ok[S.okN++ % LINES.ok.length]; sfx("good");
        if (allMatched()) { S.say = LINES.labs; sfx("chime"); later(2800, () => { if (S.stage === 1) S.say = LINES.labs2; }); }
      } else {
        S.wrong++; sfx("bad");
        const x = SRC[c], n = ++S.miss[s];
        if (n >= 4) { S.show[s] = true; S.say = LINES.show(SRC.findIndex(y => y.s === s)); }
        else if (n >= 2) S.say = LINES.hint[s];
        else if (x.s < 0) { S.say = ["NELL", x.no]; if (x.nw) later(2400, () => { if (S.say[1] === x.no) S.say = [x.nw, x.nx]; }); }
        else S.say = LINES.mismatch(c, s);
      }
    }
    function pick(side, i) {
      if (S.stage !== 1 || S.done) return;
      if (side === "s" && cardOf(i) !== null) return;
      if (side === "c" && sentOf(i) >= 0) return;
      if (S.sel && S.sel.side !== side) { side === "s" ? tryPair(i, S.sel.i) : tryPair(S.sel.i, i); draw(); return; }
      S.sel = S.sel && S.sel.side === side && S.sel.i === i ? null : { side, i }; sfx(S.sel ? "select" : "cancel");
      if (S.sel) S.say = side === "s" ? LINES.how : LINES.howC;
      draw();
    }
    function flag(i) {
      if (S.stage !== 2 || S.done || S.flagged[i]) return;
      const r = REFS[i];
      if (r.src === null) {
        S.flagged[i] = true; S.say = LINES[r.id]; sfx("stamp");
        if (Object.keys(S.flagged).length === 2) {
          S.done = true; score("metamer", S.wrong ? 3 : 5);
          later(3200, () => { S.say = LINES.done; }); later(7000, () => { S.say = LINES.done2; });
        }
      } else {
        S.wrong++; S.refMiss++; S.flash = r.src; sfx("bad");
        S.say = S.refMiss >= 4 ? LINES.refShow : S.refMiss >= 2 ? ["NELL", `${LINES.real(r.src)[1]} ${LINES.refHint[1]}`] : LINES.real(r.src);
        later(1400, () => { S.flash = -1; });
      }
      draw();
    }
    const onClick = (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const b = t.closest("button[data-b]");
      if (b && !b.disabled) {
        if (b.dataset.b === "off") { finish(); return; }
        if (b.dataset.b === "refs") { S.stage = 2; sfx("paper"); S.sel = null; S.say = LINES.refs; draw(); }
        return;
      }
      const s = t.closest("[data-s]"); if (s) { pick("s", +s.dataset.s); return; }
      const c = t.closest("[data-c]"); if (c) { pick("c", +c.dataset.c); return; }
      const r = t.closest("[data-r]"); if (r) flag(+r.dataset.r);
    };
    const onKey = (e) => { if (e.key === "Escape") finish(); };
    function finish() {
      timers.forEach(clearTimeout); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = ""; resolve({ done: S.done, wrong: S.wrong });
    }
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
    later(5200, () => { if (S.say === LINES.intro) S.say = LINES.key; });
  });
}
