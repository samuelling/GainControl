// FOG NEURO: the paper mill's front end, on Preston's computer. Every name in it is fictional.
// Resolves { generated, sources, feud, printed } when Gus logs off.
import { seg, segC, segW, chip } from "../gfx.js";

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const cap = (s) => s.replace(/\b\w/g, c => c.toUpperCase());
const W = {
  region: ["hippocampus", "amygdala", "insula", "precuneus", "cerebellum", "default mode network", "anterior cingulate", "fusiform gyrus",
    "orbitofrontal cortex", "claustrum", "thalamus", "angular gyrus", "temporoparietal junction", "locus coeruleus", "visual cortex", "brainstem"],
  faculty: ["free will", "consciousness", "nostalgia", "déjà vu", "creativity", "boredom", "the self", "intuition", "regret", "vibes",
    "moral judgment", "humor", "awe", "procrastination", "trust", "the sense of time", "small talk", "ambition"],
  behavior: ["yawning", "doomscrolling", "brunch", "reply-all", "forgetting why you walked into a room", "networking", "humming", "clapping on 1 and 3",
    "naming a sourdough starter", "laughing at your own jokes", "parallel parking"],
  method: ["7T laminar fMRI", "whole-brain hyperscanning", "a 12-minute questionnaire", "deep-learning decoding", "a single heroic participant",
    "resting-state vibes analysis", "machine-learned connectomics", "a wearable EEG headband from an airport"],
  journal: ["NURTURE NEUROSCIENCE", "CELL-EBRITY", "TRENDS IN TRENDS", "J. ENDLESS RES.", "BRAIN & BRAND", "NEURO-HYPE", "SCIENCE-ADJACENT"],
  src: ["QUORUM, A. (1979)", "QUORUM, A. (1979B)", "MICK, P. (2024)", "VALU, P. (2025)", "HINDEX, H. (1983)", "TENURE, T. (1991)",
    "GRANT, E. R. (1974)", "LAUD, R. (2008)", "SINECURE, S. (1966)", "IMPACT, F. (2019)"],
  coauthor: ["MICK", "HINDEX", "LAUD", "TENURE", "SINECURE"],
};
function paper(feudWith) {
  const A = pick(W.region); let B = pick(W.region); while (B === A) B = pick(W.region);
  const f = pick(W.faculty), b = pick(W.behavior), m = pick(W.method), n = pick([1, 6, 12, 19, 24, 40]);
  const titles = [
    `The ${cap(B)} Predicts ${cap(f)} Before You Do`, `${cap(f)} Is Not Where You Think: Evidence from the ${cap(B)}`,
    `A Domain-General ${cap(B)} Network for ${cap(f)}`, `The Neural Basis of ${cap(b)}`, `Toward a Unified Theory of ${cap(f)} and ${cap(b)}`];
  const p = {
    title: feudWith ? `${cap(f)} Is Still in the ${cap(feudWith.A)}: A Reply to Valu et al.` : pick(titles),
    by: feudWith ? "P. MICK" : (Math.random() < .5 ? "P. VALU" : `P. VALU, ${pick(W.coauthor)} ET AL.`),
    journal: pick(W.journal), year: 2024 + Math.floor(Math.random() * 3), cites: 40 + Math.floor(Math.random() * 400),
    A: feudWith ? feudWith.A : A, B, f, sources: [pick(W.src), pick(W.src), pick(W.src)],
  };
  p.abs = feudWith ? [
    `Valu et al. recently claimed that ${f} lives in the ${feudWith.B}.`,
    `They are wrong.`,
    `Using ${feudWith.m}, in the same ${feudWith.n} participants, we find the opposite: ${f} lives in the ${feudWith.A}, as it always has.`,
    `We look forward to the authors' reply.`, `Further research is needed.`]
  : [
    `It has long been assumed that ${f} lives in the ${A}.`,
    `Here, using ${m} in ${n} participant${n === 1 ? "" : "s"}, we show that it is in fact the ${B}.`,
    `Activity in the ${B} predicted ${f} with near-perfect accuracy (p < .000${1 + Math.floor(Math.random() * 9)}).`,
    `These findings overturn decades of research and suggest that ${b} is, at heart, ${f}.`,
    `Further research is needed, and funded.`];
  p.m = m; p.n = n;
  return p;
}
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
          ? p.abs.map((s, i) => `<p>${esc(s)}<br><span class="src">↳ ${p.sources[i % 3]}</span></p>`).join("")
          : p.abs.map(s => esc(s)).join(" ")}</div></div></div>`;
    }
    function draw() {
      const head = splash > 0 ? "FOG NEURO" : "COG NEURO";
      let h = `<div class="screen"><svg class="t hd" viewBox="0 0 640 40">${seg(head, 16, 10, 18, splash > 0 ? "sR" : "sW", 1.6)}
        ${seg("LTM V0.9   BYLINE P. VALU   CORPUS: THE ARCHIVE", 250, 17, 5, "sM", .8)}</svg>`;
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
