// FOG NEURO: the paper mill's front end, on Preston's computer.
// The LTM resynthesizes the ESSENCE of the field's most-cited classics (data/classics.js: paraphrased ideas,
// no titles, no authors, no wording from any paper) into new straw-man papers. Every name on screen is fictional.
// Resolves { generated, sources, feud, printed, paper } when Gus logs off.
import { seg, segC, segW, chip } from "../gfx.js";
import { CLASSICS } from "../data/classics.js";

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const SMALL = new Set(["a", "an", "and", "the", "of", "in", "on", "for", "to", "as", "at", "by", "or", "vs", "et", "al."]);
const tc = (s) => s.split(" ").map((w, i) => (i && SMALL.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const bare = (t) => t.replace(/^the /, "");
const W = {
  // fog neuro's own contributions: the absurd end of the Big Questions
  faculty: ["free will", "nostalgia", "déjà vu", "creativity", "boredom", "intuition", "regret", "vibes", "humor", "awe",
    "procrastination", "trust", "small talk", "ambition", "taste in music", "the urge to check your phone"],
  behavior: ["yawning", "doomscrolling", "brunch", "reply-all", "forgetting why you walked into a room", "networking", "humming",
    "clapping on 1 and 3", "naming a sourdough starter", "laughing at your own jokes", "parallel parking", "saying 'you too' to a waiter"],
  method: ["7T laminar fMRI", "whole-brain hyperscanning", "a 12-minute questionnaire", "a single heroic participant",
    "resting-state vibes analysis", "a wearable EEG headband from an airport", "deep learning"],
  region: ["precuneus", "claustrum", "insula", "angular gyrus", "cerebellum", "thalamus"],
  join: ["are the same thing", "are two sides of one coin", "both reduce to a single process", "were never separate in the first place"],
  journal: ["NURTURE NEUROSCIENCE", "CELL-EBRITY", "TRENDS IN TRENDS", "J. ENDLESS RES.", "BRAIN & BRAND", "NEURO-HYPE", "SCIENCE-ADJACENT"],
  coauthor: ["MICK", "HINDEX", "LAUD", "TENURE", "SINECURE"],
};
const RENAME = { "V1": "primary visual cortex", "midbrain dopamine neurons": "midbrain", "white matter": "corpus callosum" };
const GENERIC = /whole brain|any region|cortex-wide|brain-wide|connectome|^cortex$/;
function region(c) {
  const r = pick(c[4].split("|"));
  return GENERIC.test(r) ? pick(W.region) : (RENAME[r] || r);
}
const NUM = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const decades = (era) => NUM[Math.max(1, Math.round((2026 - parseInt(era)) / 10))] || "many";
const lineage = (c, what) => `${what} A ${c[1]} ${c[0].toUpperCase()} CLASSIC: ${c[2].toUpperCase()}`;
function two() {
  const X = pick(CLASSICS); let Y = pick(CLASSICS);
  while (Y === X || Y[0] === X[0]) Y = pick(CLASSICS);
  return [X, Y];
}
function paper(feudWith) {
  if (feudWith) {
    let Z = pick(CLASSICS); while (Z === feudWith.X || Z === feudWith.Y) Z = pick(CLASSICS);
    const R = region(Z);
    const p = {
      title: tc(`no, ${feudWith.X[2]} is not ${feudWith.Y[2]}: a reply to Valu et al.`),
      by: "P. MICK", journal: pick(W.journal), year: 2024 + Math.floor(Math.random() * 3), cites: 40 + Math.floor(Math.random() * 400),
      X: feudWith.X, Y: Z, B: R, f: feudWith.f, m: Z[5], n: feudWith.n,
    };
    p.abs = [
      `Valu et al. recently claimed that ${feudWith.X[2]} and ${feudWith.Y[2]} ${pick(W.join)}.`,
      `They are wrong.`,
      `Using ${Z[5]}, in the same ${feudWith.n} participant${feudWith.n === 1 ? "" : "s"}, we show the opposite: ${feudWith.X[2]} is really ${Z[2]}, and it lives in the ${R}, as it always has.`,
      `We look forward to the authors' reply.`, `Further research is needed.`];
    p.sources = [`THEIR PAPER. ALL OF IT.`, `NONE.`, lineage(Z, "THE ESSENCE OF"), `NONE. PURE FOG.`, `THE GRANT OFFICE.`];
    return p;
  }
  const [X, Y] = two();
  const R = region(Y), f = pick(W.faculty), b = pick(W.behavior), n = pick([1, 6, 12, 19, 24, 40]);
  const m = Math.random() < .5 ? Y[5] : `${Y[5]} and ${pick(W.method)}`;
  const titles = [
    `${X[2]} is ${Y[2]}: evidence from the ${R}`,
    `beyond ${X[2]}: a ${R} account of ${b}`,
    `the ${R} predicts ${f} before you do`,
    `rethinking ${X[2]} in the age of ${Y[2]}`,
    `a unified theory of ${X[2]}, ${Y[2]} and ${b}`,
    `what ${X[2]} can tell us about ${f}`,
  ];
  const p = {
    title: tc(pick(titles)),
    by: Math.random() < .5 ? "P. VALU" : `P. VALU, ${pick(W.coauthor)} ET AL.`,
    journal: pick(W.journal), year: 2024 + Math.floor(Math.random() * 3), cites: 40 + Math.floor(Math.random() * 400),
    X, Y, B: R, f, m, n,
  };
  p.abs = [
    `It has long been assumed that ${X[3]}.`,
    `Here, using ${m} in ${n} participant${n === 1 ? "" : "s"}, we show that ${X[2]} and ${Y[2]} ${pick(W.join)}.`,
    `Both live in the ${R}, whose activity predicted ${f} with near-perfect accuracy (p < .000${1 + Math.floor(Math.random() * 9)}).`,
    `These findings overturn ${decades(X[1])} decades of ${X[0]} research and suggest that ${b} is, at heart, ${Y[2]}.`,
    `Further research is needed, and funded.`];
  p.sources = [lineage(X, "THE ESSENCE OF"), lineage(Y, "MASHED WITH"), `REGION LIFTED FROM THE SAME ${Y[0].toUpperCase()} CLASSIC. ${f.toUpperCase()}: NONE.`,
    `NONE. PURE FOG.`, `THE GRANT OFFICE.`];
  return p;
}
export const _paper = paper; // for tests
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function fogNeuro(el, { canPrint = true } = {}) {
  return new Promise(resolve => {
    const out = { generated: 0, sources: false, feud: false, printed: false };
    let cur = null, rival = null, showSources = false, status = "", splash = 0, cites = 0;
    function figure(p) {
      // a sagittal brain in line, with an implausibly perfect blob
      const bx = 60 + (p.B.length * 7) % 60, by = 46 + (p.f.length * 5) % 26;
      return `<svg class="t fig" viewBox="0 0 200 130"><path class="sK" d="M30,86 C18,62 30,26 70,20 C100,10 150,18 170,46 C184,66 176,92 150,98 C140,110 120,104 112,96 C96,106 70,104 58,94 C44,98 34,94 30,86 Z"/>
        <path class="hl sK" d="M70,32 C80,44 74,58 90,64 M120,26 C116,42 132,50 128,66 M58,70 C76,72 86,84 104,80"/>
        <path class="sM" d="M150,98 C152,108 150,118 144,124"/><circle class="fR" cx="${bx}" cy="${by}" r="9"/><circle class="hl sW" cx="${bx}" cy="${by}" r="13"/>
        ${seg("P < .0001", 120, 112, 6, "sA", .9)}</svg>`;
    }
    function paperHTML(p, label) {
      return `<div class="paper">${label ? `<div class="tag">${label}</div>` : ""}<div class="ttl">${esc(p.title)}</div>
        <div class="by">${esc(p.by)} · ${p.journal} ${p.year} · <span class="cites">CITED BY ${p.cites + cites}</span></div>
        <div class="body">${figure(p)}<div class="abs">${showSources
          ? p.abs.map((s, i) => `<p>${esc(s)}<br><span class="src">↳ ${esc(p.sources[i])}</span></p>`).join("")
          : p.abs.map(s => esc(s)).join(" ")}</div></div></div>`;
    }
    function draw() {
      const head = splash > 0 ? "FOG NEURO" : "COG NEURO";
      let h = `<div class="screen"><svg class="t hd" viewBox="0 0 640 40">${seg(head, 16, 10, 18, splash > 0 ? "sR" : "sW", 1.6)}
        ${seg("LTM V0.9   BYLINE P. VALU   CORPUS: THE CLASSICS", 250, 17, 5, "sM", .8)}</svg>`;
      if (!cur) h += `<div class="empty">PRESS GENERATE.<br><em>The machine is warm. It has been waiting.</em></div>`;
      else h += paperHTML(cur, rival ? "THE PAPER" : "") + (rival ? paperHTML(rival, "THE FURIOUS REPLY") : "");
      h += `<div class="bar">
        <button data-b="gen">GENERATE</button><button data-b="feud" ${cur ? "" : "disabled"}>FEUD</button>
        <button data-b="src" ${cur ? "" : "disabled"}>${showSources ? "HIDE SOURCES" : "SOURCES"}</button>
        <button data-b="print" ${cur && canPrint && !out.printed ? "" : "disabled"}>PRINT</button>
        <span class="status">${status}</span><button data-b="off" class="off">LOG OFF</button></div>
        <div class="foot">LTM v0.9 · FOG NEURO · SEED 0412 · BYLINE: P. VALU</div></div>`;
      el.innerHTML = h;
    }
    function act(b) {
      if (b === "gen") { cur = paper(); rival = null; out.generated++; showSources = false; status = ""; cites = 0; splash = 1; }
      if (b === "feud" && cur) { rival = paper(cur); out.feud = true; }
      if (b === "src" && cur) { showSources = !showSources; out.sources = out.sources || showSources; }
      if (b === "print" && cur && !out.printed) { status = "PRINTING ((( )))"; draw(); setTimeout(() => { out.printed = true; out.paper = cur; status = "PRINTED."; draw(); }, 900); return; }
      if (b === "off") { finish(); return; }
      draw();
    }
    const tick = setInterval(() => { if (cur) { cites += 1 + Math.floor(Math.random() * 3); const c = el.querySelectorAll(".cites");
      c.forEach((x, i) => x.textContent = "CITED BY " + ((i ? rival : cur).cites + cites)); }
      if (splash > 0) { splash--; draw(); } }, 600);
    const onClick = (e) => { const b = e.target.closest && e.target.closest("button[data-b]"); if (b && !b.disabled) act(b.dataset.b); };
    const onKey = (e) => { if (e.key === "Escape") finish(); };
    function finish() { clearInterval(tick); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey); el.classList.remove("show"); el.innerHTML = ""; resolve(out); }
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
  });
}
