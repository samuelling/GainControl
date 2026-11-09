// THE MISSING HOURS (Act IV, the main office). A case-file banner asks the question (where do three men who never have a
// free minute all go at once?) and lights its three steps as they're done; solved, it shows the answer.
// THE MISSING HOURS (Act IV, the main office). Penny's "invited talk" receipts and three calendars: Preston's, Impact's,
// Quorum's. Lay the calendars over each other and the one block all three leave empty, FRI 23:00–03:00, lights up.
// File the receipts on their days: every receipt from that night is the same INVITED TALK template. Then the CVs side
// by side: click the labs all three share. Resolves { done }.
// Only the three receipts from the free block have to be filed (the rest are optional jokes). A wrong day names the right
// column; a second wrong try on the same receipt files it for you. CVs: 2 wrong clicks, Penny says how to read them;
// 4, the shared labs are marked in brass.
import { seg, segC, chip } from "../gfx.js";
import { exitLabel, exitKey } from "./exit.js";

const DAYS = ["MON 26", "TUE 27", "WED 28", "THU 29", "FRI 30", "SAT 31", "SUN 1"];
// calendars: blocks [day, start hour, hours, label key]. Together they leave exactly FRI 23 – SAT 03 free.
export const CALS = {
  P: { name: "PRESTON", col: "R", pat: "M-1,1 L1,-1 M0,6 L6,0 M5,7 L7,5", labels: { s: "SLEEP (OPTIMIZED)", c: "COFFEE", n: "NETWORKING", l: "LAB", w: "WORKOUT", t: "TALK PREP", b: "BRUNCH" },
    blocks: [[0,0,6,"s"],[0,7,2,"c"],[0,9,4,"n"],[0,14,4,"l"],[0,19,3,"n"],[1,1,5,"s"],[1,7,2,"w"],[1,10,3,"c"],[1,13,5,"l"],[1,20,4,"n"],
      [2,0,6,"s"],[2,7,2,"c"],[2,9,4,"n"],[2,14,4,"l"],[2,19,3,"t"],[3,1,5,"s"],[3,7,2,"w"],[3,10,3,"c"],[3,13,5,"l"],[3,20,4,"n"],
      [4,0,6,"s"],[4,7,2,"c"],[4,9,5,"n"],[4,15,3,"l"],[5,4,6,"s"],[5,11,3,"b"],[5,15,4,"n"],[6,0,9,"s"],[6,11,3,"b"],[6,15,3,"t"],[6,20,3,"n"]] },
  I: { name: "IMPACT", col: "A", pat: "M-1,5 L1,7 M0,0 L6,6 M5,-1 L7,1", labels: { f: "FLIGHT", k: "KEYNOTE", d: "DONOR DINNER", l: "LOUNGE", p: "PANEL", r: "REVIEWING" },
    blocks: [[0,4,4,"f"],[0,12,3,"k"],[0,17,3,"d"],[1,3,4,"l"],[1,16,4,"p"],[2,4,3,"r"],[2,12,2,"k"],[2,17,3,"d"],
      [3,5,2,"f"],[3,16,4,"p"],[4,5,3,"f"],[4,13,3,"k"],[5,9,3,"r"],[5,17,3,"d"],[6,13,2,"k"],[6,17,4,"f"]] },
  Q: { name: "QUORUM", col: "V", pat: "M0,3 L6,3", labels: { c: "COMMITTEE", m: "FACULTY MTG", s: "SLEEP", o: "OFFICE HRS", d: "DINNER", g: "GOLF" },
    blocks: [[0,8,4,"c"],[0,14,3,"m"],[0,21,3,"s"],[1,0,5,"s"],[1,9,3,"o"],[1,13,4,"c"],[1,21,3,"s"],[2,0,5,"s"],[2,8,4,"c"],[2,15,3,"m"],[2,21,3,"s"],
      [3,0,5,"s"],[3,9,3,"o"],[3,13,4,"c"],[3,21,3,"s"],[4,0,5,"s"],[4,8,3,"c"],[4,18,5,"d"],[5,3,7,"s"],[5,11,4,"g"],[5,20,4,"s"],[6,0,7,"s"],[6,9,4,"g"],[6,21,3,"s"]] },
};
const TALK = "INVITED TALK  ·  VENUE: —  ·  DINNER, WINE, EVENING ENTERTAINMNET";
export const RECEIPTS = [
  { who: "P", day: 0, t: "08:15", item: "COFFEE ×14 (NETWORKING)", amt: "61.60", line: ["PENNY", "Fourteen coffees before nine. He doesn't drink them, hon. He hands them out."] },
  { who: "I", day: 1, t: "03:30", item: "LOUNGE ACCESS, ZURICH", amt: "89.00", line: ["PENNY", "Zurich at three-thirty in the morning. That man lives in lounges."] },
  { who: "P", day: 4, t: "23:10", item: TALK, amt: "212.40", talk: true },
  { who: "Q", day: 3, t: "14:00", item: "GAVEL, REPLACEMENT (1)", amt: "340.00", line: ["PENNY", "A replacement gavel. Third one this year. I don't ask what happens to them."] },
  { who: "I", day: 5, t: "00:40", item: TALK, amt: "212.40", talk: true },
  { who: "Q", day: 5, t: "01:30", item: TALK, amt: "212.40", talk: true },
];
const DATES = ["OCT 26", "OCT 27", "OCT 28", "OCT 29", "OCT 30", "OCT 31", "NOV 1"];
export const CVS = [
  { who: "P", name: "PRESTON \"P.\" VALU", role: "3RD-YEAR  ·  IMPACT LAB", rows: [["2017", "SUMMER INTERN", "sinecure"], ["2019", "RESEARCH ASSISTANT", "hindex"], ["2020", "ROTATION", "fair"],
    ["2021", "VISITING STUDENT", "quorum"], ["2023", "PHD STUDENT", "impact"], ["2025", "RISING STAR  ·  31 FIRST-AUTHOR PAPERS", null]] },
  { who: "I", name: "MAXIMILIAN IMPACT", role: "PROFESSOR  ·  3F", rows: [["2012", "PHD", "quorum"], ["2014", "POSTDOC", "hindex"], ["2016", "VISITING FELLOW", "steady"],
    ["2017", "FOUNDED", "impact"], ["2021", "SABBATICAL", "sinecure"], ["", "KEYNOTES: 212", null]] },
  { who: "Q", name: "R. QUORUM", role: "CHAIR  ·  AGE 39", rows: [["1962", "PHD", "sinecure"], ["1965", "POSTDOC", "hindex"], ["1967", "VISITING", "steady"],
    ["1969", "FOUNDED", "quorum"], ["1979", "CHAIR. STILL 39", null], ["", "INVITED TALKS: 2,400+", null]] },
];
const LABN = { hindex: "THE HINDEX LAB", sinecure: "SINECURE GROUP", quorum: "QUORUM LAB", impact: "IMPACT LAB", fair: "FAIRWEATHER LAB", steady: "THE STEADY LAB" };
const SHARED = ["hindex", "sinecure", "quorum"];
const LINES = {
  intro: ["PENNY", "Three men who never have a free minute, hon. And every Friday night, all three go missing at once, and I get receipts for 'invited talks' with no venue."],
  how: ["NELL", "So: where do they go? Step one. Stack their calendars with the buttons down there, and find the hours none of them booked."],
  one: { P: ["NELL", "Preston books everything. Even sleep. 'Optimized.'"], I: ["NELL", "Impact lives on planes."], Q: ["NELL", "Quorum. Committees, then bed by nine."] },
  two: (n) => ["NELL", `Two calendars. ${n} hours a week they're both free. Add the third.`],
  three: ["NELL", "One hole. Friday, eleven at night to three in the morning. All three of them, empty. Step two: file the receipts and see what fills it."],
  three2: ["PENNY", "Every week, hon. Quorum's calendar has that hole back to 1979."],
  pick: ["PENNY", "Put it on its day, hon."],
  wrongDay: (r) => ["PENNY", `Read the date, hon. That one's ${DATES[r.day]}: the ${DAYS[r.day]} column.`],
  filedFor: (r) => ["PENNY", `Here, hon. ${DATES[r.day]} goes under ${DAYS[r.day]}. I've been filing these for thirty years.`],
  needCals: ["NELL", "Those three are all from Friday night. Now turn on all three calendars: when are all three of them free?"],
  cvHint: ["PENNY", "Read across, hon. Each CV lists its labs in blue. You want the ones that turn up on all three, whatever the year."],
  cvShow: ["PENNY", "I've marked them for you, hon. The ones on every CV. Click them."],
  talk: ["NELL", "Invited talk. No venue. Friday night."],
  night: ["NELL", "Every receipt from that night says INVITED TALK. Same template, same total, same typo. 'Entertainmnet.'"],
  night2: ["PENNY", "And I approved every one. So they're together, hon, but who are they? Step three: their CVs. I printed those too."],
  cv: ["PENNY", "A CV is every job you've ever had, in order, hon. If they meet now, they met somewhere first. Click the labs that turn up on all three."],
  found: { hindex: ["PENNY", "The Hindex Lab. Their alumni all file the same receipt."], sinecure: ["NELL", "Sinecure Group. All three. Different decades."],
    quorum: ["PENNY", "Quorum's own lab. Well. Of course it is."] },
  miss: (k, who) => ["NELL", `${LABN[k]} is only on ${who}. It has to be on all three.`],
  done: ["NELL", "One empty block every Friday night, and the same three labs on every CV. That's not a coincidence. That's a membership."],
  done2: ["PENNY", "I'm filing this somewhere they'll never look, hon. Under 'Integrity.'"],
};
const COL = { NELL: "G", PENNY: "B", MORRIS: "K", GUS: "B", NARRATOR: "W" };
const CSS = `
.hours .hbody { flex: 1 1 0; min-height: 0; display: flex; gap: 1.2cqw; padding: .6cqw 0; }
.hours svg.week { position: relative; inset: auto; flex: 1 1 0; min-width: 0; height: 100%; }
.hours .rcol { flex: none; width: 27%; display: flex; flex-direction: column; gap: .45cqw; min-height: 0; }
.hours .colhd { font-size: 1cqw; letter-spacing: .1em; color: var(--M); flex: none; }
.hours .rcpt { flex: 1 1 0; border: .08cqw dashed var(--D); padding: .2cqw .5cqw; cursor: pointer; overflow: hidden; font-size: 1.05cqw; line-height: 1.12; color: var(--W); }
.hours .rcpt:hover { border-color: var(--W); }
.hours .rcpt.sel { border: .08cqw solid var(--A); }
.hours .rcpt.placed { cursor: default; opacity: .55; }
.hours .rcpt.talk.lit { opacity: 1; border: .08cqw solid var(--G); color: var(--G); }
.hours .rcpt .rh { display: flex; gap: .5cqw; align-items: center; font-size: .95cqw; }
.hours .rcpt .wch { color: #000; font-weight: 600; padding: 0 .3cqw; }
.hours .rcpt .dt { color: var(--A); } .hours .rcpt .amt { margin-left: auto; color: var(--W); }
.hours .rcpt .fl { font-size: .85cqw; color: var(--M); }
.hours .cvs { flex: 1 1 0; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.2cqw; min-height: 0; }
.hours .cv { border: .08cqw solid var(--D); padding: .6cqw .8cqw; display: flex; flex-direction: column; gap: .2cqw; min-height: 0; }
.hours .cv .nm { font-size: 2cqw; font-weight: 600; line-height: 1.1; }
.hours .cv .rl { font-size: 1cqw; color: var(--M); letter-spacing: .08em; margin-bottom: .4cqw; }
.hours .cv .row { font-size: 1.35cqw; line-height: 1.25; display: flex; gap: .7cqw; border-top: .08cqw solid var(--D); padding: .35cqw 0; }
.hours .cv .yr { color: var(--A); min-width: 3cqw; flex: none; }
.hours .cv .lab { cursor: pointer; color: var(--B); border-bottom: .08cqw dotted var(--B); }
.hours .cv .lab:hover { color: var(--W); border-color: var(--W); }
.hours .cv .lab.found { color: #000; background: var(--G); border: 0; padding: 0 .3cqw; cursor: default; font-weight: 600; }
.hours .cv .lab.nope { color: var(--R); border-color: var(--R); }
.hours button.cal { min-width: 7cqw; }
.hours .callbl { font-size: 1cqw; letter-spacing: .1em; color: var(--A); }
.hours svg.hd { height: 5cqw !important; margin-top: .3cqw !important; }
.hours rect[data-day]:hover { stroke: var(--A); stroke-width: .8; }
.hours .gp1, .hours.p1 .gp0 { display: none; } .hours.p1 .gp1 { display: inline; }
`;
function injectStyle(id, css) { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = css; document.head.appendChild(s); }

// grid geometry (native units of the week svg)
const X0 = 30, CW = 62, Y0 = 26, RH = 11, W = X0 + 7 * CW + 6, H = Y0 + 24 * RH + 4;
export const freeHours = (keys) => { const out = []; for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++)
  if (!keys.some(k => CALS[k].blocks.some(([bd, s, l]) => bd === d && h >= s && h < s + l))) out.push([d, h]); return out; };

const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function hours(el, { score = () => {} } = {}) {
  injectStyle("mg-hours", CSS);
  return new Promise(resolve => {
    const S = { on: { P: false, I: false, Q: false }, placed: RECEIPTS.map(() => false), sel: -1, say: LINES.intro, stage: "cal", night: false,
      found: {}, nope: null, done: false, pose: 0, saidThree: false, dayMiss: RECEIPTS.map(() => 0), cvMiss: 0 };
    const timers = []; const later = (ms, fn) => timers.push(setTimeout(() => { fn(); draw(); }, ms));
    const onKeys = () => Object.keys(S.on).filter(k => S.on[k]);
    const allOn = () => onKeys().length === 3;
    let spoken = null;
    const coach = () => { const [w, t] = S.say; if (S.say !== spoken) { spoken = S.say; window.SFX && window.SFX.voice(w, true); } return `<span class="who" style="background:var(--${COL[w]})">${w}</span><span style="color:var(--${COL[w]})">${t}</span>`; };
    function week() {
      let s = `<defs>${Object.entries(CALS).map(([k, c]) => `<pattern id="hrs${k}" width="6" height="6" patternUnits="userSpaceOnUse"><path class="hl s${c.col}" d="${c.pat}"/></pattern>`).join("")}</defs>`;
      for (let h = 0; h <= 24; h++) s += `<path class="hl ${h % 6 ? "sN" : "sD"}" d="M${X0},${Y0 + h * RH} L${X0 + 7 * CW},${Y0 + h * RH}"/>`;
      for (let d = 0; d <= 7; d++) s += `<path class="hl sD" d="M${X0 + d * CW},${Y0 - 4} L${X0 + d * CW},${Y0 + 24 * RH}"/>`;
      for (let h = 0; h < 24; h += 3) s += seg(String(h).padStart(2, "0"), 8, Y0 + h * RH - 2, 4.4, "sM", .7);
      DAYS.forEach((t, d) => { s += segC(t, X0 + d * CW + CW / 2, 8, 5.5, d === 4 || d === 5 ? "sW" : "sM", .9); });
      const on = onKeys(), single = on.length === 1;
      for (const k of ["Q", "I", "P"]) {
        if (!S.on[k]) continue;
        const c = CALS[k];
        s += `<g opacity=".8">`;
        for (const [d, h0, l, lab] of c.blocks) {
          const x = X0 + d * CW + 1.5, y = Y0 + h0 * RH + 1.5, w = CW - 3, hh = l * RH - 3;
          s += `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="url(#hrs${k})" class="hl s${c.col}"/>`;
          if (single && l >= 2) { const t = c.labels[lab]; s += `<rect class="k" x="${x + 2}" y="${y + 2}" width="${Math.min(w - 4, t.length * 2.35 + 3)}" height="6.6"/>` + seg(t, x + 3.2, y + 3.2, 4, "s" + c.col, .7); }
        }
        s += `</g>`;
      }
      if (allOn()) {
        // two poses of the lit block, swapped by the root's p1 class (no redraw, no tween)
        const blk = (d, h0, l, o) => `<rect class="sG" x="${X0 + d * CW + o}" y="${Y0 + h0 * RH + o}" width="${CW - 2 * o}" height="${l * RH - 2 * o}"/>`;
        const inner = (d, h0, l) => `<rect class="hl sG" x="${X0 + d * CW + 4}" y="${Y0 + h0 * RH + 3}" width="${CW - 8}" height="${l * RH - 6}"/>`;
        s += `<g class="gp0">${blk(4, 23, 1, 1) + blk(5, 0, 3, 1)}</g><g class="gp1">${blk(4, 23, 1, -1.5) + blk(5, 0, 3, -1.5)}</g>` + inner(4, 23, 1) + inner(5, 0, 3);
        s += chip("ALL THREE FREE", X0 + 4 * CW + 4, Y0 + 20.4 * RH, 5, "fG") + chip("FRI 23:00-03:00", X0 + 5 * CW + 4, Y0 + 3.5 * RH, 5, "fG");
      }
      // nothing on yet: the grid says what to do, and points at the buttons
      if (!on.length) s += segC("TURN ON THEIR CALENDARS", X0 + 3.5 * CW, Y0 + 9 * RH, 12, "sA", 1.2) + segC("STACK ALL THREE. LOOK FOR THE HOLE.", X0 + 3.5 * CW, Y0 + 12 * RH, 7, "sM", .9)
        + `<path class="sA" d="M${X0 + 3.5 * CW},${Y0 + 15 * RH} L${X0 + 3.5 * CW},${Y0 + 22 * RH} M${X0 + 3.5 * CW - 6},${Y0 + 22 * RH - 7} L${X0 + 3.5 * CW},${Y0 + 22 * RH} L${X0 + 3.5 * CW + 6},${Y0 + 22 * RH - 7}"/>`;
      // receipts filed on the calendar
      RECEIPTS.forEach((r, i) => {
        if (!S.placed[i]) return;
        const h = +r.t.slice(0, 2), x = X0 + r.day * CW + CW - 14, y = Y0 + h * RH - 1;
        const c = CALS[r.who].col, lit = S.night && r.talk;
        s += `<path class="k ${lit ? "sG" : "s" + c}" d="M${x},${y} L${x + 10},${y} L${x + 10},${y + 11} L${x + 8},${y + 9.5} L${x + 6},${y + 11} L${x + 4},${y + 9.5} L${x + 2},${y + 11} L${x},${y + 9.5} Z"/>`
          + `<path class="hl ${lit ? "sG" : "s" + c}" d="M${x + 2},${y + 3} L${x + 8},${y + 3} M${x + 2},${y + 5.5} L${x + 7},${y + 5.5}"/>`;
      });
      // click targets: one per day column, while a receipt is in hand
      if (S.sel >= 0) for (let d = 0; d < 7; d++) s += `<rect data-day="${d}" x="${X0 + d * CW}" y="${Y0 - 6}" width="${CW}" height="${24 * RH + 6}" fill="transparent" style="cursor:pointer"/>`;
      // after a wrong day, the right column is outlined
      if (S.sel >= 0 && S.dayMiss[S.sel]) { const d = RECEIPTS[S.sel].day; s += `<rect class="hl dash sA" x="${X0 + d * CW + .5}" y="${Y0 - 5.5}" width="${CW - 1}" height="${24 * RH + 5}" fill="none" pointer-events="none"/>`; }
      return s;
    }
    function receipts() {
      return `<div class="colhd">EXPENSE REPORTS  ·  CLICK ONE, THEN ITS DAY</div>` + RECEIPTS.map((r, i) => {
        const c = CALS[r.who], cls = ["rcpt", r.talk ? "talk" : "", S.placed[i] ? "placed" : "", S.sel === i ? "sel" : "", S.night && r.talk ? "lit" : ""].join(" ");
        return `<div class="${cls}" data-r="${i}"><div class="rh"><span class="wch" style="background:var(--${c.col})">${c.name}</span>
          <span class="dt">${DATES[r.day]}  ·  ${r.t}</span><span class="amt">$${r.amt}</span></div><div>${r.item}</div>
          ${S.placed[i] ? `<div class="fl">FILED  ·  ${DAYS[r.day]}</div>` : ""}</div>`;
      }).join("");
    }
    function cvs() {
      return `<div class="cvs">${CVS.map(cv => { const c = CALS[cv.who];
        return `<div class="cv"><div class="nm" style="color:var(--${c.col})">${cv.name}</div><div class="rl">${cv.role}</div>
          ${cv.rows.map(([y, t, lab]) => `<div class="row"><span class="yr">${y}</span><span>${t}${lab ? `, <span class="lab ${S.found[lab] ? "found" : ""} ${S.nope === lab ? "nope" : ""}" data-lab="${lab}"${S.cvMiss >= 4 && SHARED.includes(lab) && !S.found[lab] ? ` style="color:var(--A);border-color:var(--A)"` : ""}>${LABN[lab]}</span>` : ""}</span></div>`).join("")}</div>`; }).join("")}</div>`;
    }
    function draw() {
      const nPlaced = S.placed.filter(Boolean).length, nFound = Object.keys(S.found).length;
      const hd = banner();
      const body = S.stage === "cal"
        ? `<svg class="t week" viewBox="0 0 ${W} ${H}">${week()}</svg><div class="rcol">${receipts()}</div>`
        : cvs();
      const toggles = S.stage === "cal" ? Object.entries(CALS).map(([k, c]) =>
        `<button class="cal" data-b="${k}" style="${S.on[k] ? `background:var(--${c.col});color:#000` : `background:#000;color:var(--${c.col});box-shadow:inset 0 0 0 .1cqw var(--${c.col})`}">${c.name}</button>`).join("") : "";
      const status = S.stage === "cal" ? `${nPlaced} / ${RECEIPTS.length} FILED` : `${nFound} / 3 SHARED LABS`;
      el.innerHTML = `<div class="screen hours ${S.pose ? "p1" : ""}">
        <svg class="t hd" viewBox="0 0 640 34">${hd}</svg>
        <div class="hbody">${body}</div>
        <div class="coachline">${coach()}</div>
        <div class="bar">${S.stage === "cal" ? `<span class="callbl">CALENDARS</span>` : ""}${toggles}<span class="status">${status}</span>
          ${S.stage === "cal" && S.night ? `<button data-b="cv">COMPARE CVS</button>` : ""}
          <button data-b="off" class="off">${exitLabel(S.done)}</button></div></div>`;
    }
    // the case file: the question, and the three steps that answer it (each lights when it's done; the next is brass)
    function banner() {
      const done = [allOn() || S.night || S.stage === "cv", S.night, S.done], cur = done.indexOf(false);
      const steps = [["STACK THE CALENDARS", "FIND THE HOURS NOBODY BOOKED"], ["FILE THE RECEIPTS", "WHAT FILLS THOSE HOURS?"], ["LINE UP THE CVS", "WHAT DO ALL THREE SHARE?"]];
      let g = seg("THE MISSING HOURS", 2, 6, 15, "sW", 1.5);
      g += S.done ? seg("TOGETHER. FRIDAYS, 23:00 TO 03:00. THE SAME THREE LABS. A MEMBERSHIP.", 206, 2, 6, "sG", .9)
        : seg("THREE MEN WHO NEVER HAVE A FREE MINUTE. WHERE DO THEY ALL GO AT ONCE?", 206, 2, 6, "sA", .9);
      steps.forEach(([a, b], i) => { const x = 206 + i * 146, st = done[i] ? "done" : i === cur ? "now" : "later";
        g += st === "done" ? `<rect class="fG" x="${x}" y="15" width="13" height="13"/>${seg(String(i + 1), x + 4, 17.5, 8, "s0", 1.2)}`
          : `<rect class="hl ${st === "now" ? "sA" : "sD"}" x="${x}" y="15" width="13" height="13"/>${seg(String(i + 1), x + 4, 17.5, 8, st === "now" ? "sA" : "sD", 1)}`;
        g += seg(a, x + 17, 14.5, 6, st === "done" ? "sG" : st === "now" ? "sW" : "sD", 1) + seg(b, x + 17, 24.5, 5, st === "done" ? "sG" : st === "now" ? "sM" : "sD", .8); });
      return g;
    }
    // the night only needs the receipts that fall in the free block; the others are optional
    const talksFiled = () => RECEIPTS.every((r, i) => !r.talk || S.placed[i]);
    function checkNight(fromFile) {
      if (S.night || !talksFiled()) return;
      if (!allOn()) { if (fromFile) S.say = LINES.needCals; return; }
      S.night = true; sfx("stamp");
      // if the third calendar just went on, let "one hole" (and Penny's 1979) be read first
      const first = S.say === LINES.three ? 6000 : 0, go = () => { S.say = LINES.night; later(3600, () => { if (S.stage === "cal" && S.say === LINES.night) S.say = LINES.night2; }); };
      if (first) later(first, go); else go();
    }
    function toggle(k) {
      S.on[k] = !S.on[k]; sfx("toggle", { on: S.on[k] });
      const on = onKeys();
      if (on.length === 1) S.say = LINES.one[on[0]];
      else if (on.length === 2) S.say = LINES.two(freeHours(on).length);
      else if (on.length === 3) { S.say = LINES.three; if (!S.saidThree) { S.saidThree = true; sfx("chime"); later(3000, () => { if (S.say === LINES.three) S.say = LINES.three2; }); } }
      else S.say = LINES.how;
      checkNight();
    }
    function file(d) {
      const r = RECEIPTS[S.sel];
      if (d !== r.day) {
        sfx("bad");
        if (++S.dayMiss[S.sel] < 2) { S.say = LINES.wrongDay(r); return; }
        S.placed[S.sel] = true; S.sel = -1; S.say = LINES.filedFor(r); sfx("paper"); checkNight(true); return;
      }
      S.placed[S.sel] = true; S.sel = -1; S.say = r.talk ? LINES.talk : r.line; sfx("paper");
      checkNight(true);
    }
    function labClick(k) {
      if (S.found[k] || S.done) return;
      if (SHARED.includes(k)) {
        S.found[k] = true; S.say = LINES.found[k]; sfx("good");
        if (Object.keys(S.found).length === 3) { S.done = true; score("hours", 4); later(2600, () => { S.say = LINES.done; }); later(7000, () => { S.say = LINES.done2; }); }
      } else {
        const who = CVS.filter(cv => cv.rows.some(r => r[2] === k)).map(cv => CALS[cv.who].name[0] + CALS[cv.who].name.slice(1).toLowerCase());
        const n = ++S.cvMiss, where = who.join(" and ");
        S.say = n >= 4 ? LINES.cvShow : n >= 2 ? ["PENNY", `${LABN[k]} is only on ${where}. ${LINES.cvHint[1]}`] : LINES.miss(k, where);
        S.nope = k; sfx("bad"); later(1200, () => { S.nope = null; });
      }
    }
    const onClick = (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const b = t.closest("button[data-b]");
      if (b && !b.disabled) {
        const k = b.dataset.b;
        if (k === "off") { finish(); return; }
        if (k === "cv") { S.stage = "cv"; S.say = LINES.cv; sfx("paper"); draw(); return; }
        if (CALS[k]) { toggle(k); draw(); }
        return;
      }
      const d = t.closest("[data-day]"); if (d && S.sel >= 0) { file(+d.dataset.day); draw(); return; }
      const r = t.closest("[data-r]");
      if (r) { const i = +r.dataset.r; if (S.placed[i]) return; S.sel = S.sel === i ? -1 : i; sfx(S.sel >= 0 ? "select" : "cancel"); if (S.sel >= 0) S.say = LINES.pick; draw(); return; }
      const l = t.closest("[data-lab]"); if (l) { labClick(l.dataset.lab); draw(); }
    };
    const onKey = (e) => { exitKey(e, S.done, finish); };
    // the free block blinks between two poses while all three calendars are on
    const blink = setInterval(() => { S.pose ^= 1; const r = el.querySelector(".hours"); if (r) r.classList.toggle("p1", !!S.pose); }, 600);
    function finish() {
      clearInterval(blink); timers.forEach(clearTimeout); el.removeEventListener("click", onClick); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = ""; resolve({ done: S.done });
    }
    el.classList.add("show"); draw();
    el.addEventListener("click", onClick); window.addEventListener("keydown", onKey);
    later(3000, () => { if (S.say === LINES.intro) S.say = LINES.how; });
  });
}
