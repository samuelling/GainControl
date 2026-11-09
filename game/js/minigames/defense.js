// THE DEFENSE (Act V, Seminar 101). A Laura Bow interrogation: the committee asks five questions and Nell answers each
// by playing evidence cards from her week. Strong cards raise credibility; anything else costs a little and earns a
// committee reaction. A question closes on two strong cards or one decisive card (or MOVE ON, at a cost). The fifth
// can't be won: "Extraordinary claims, Ms. Null." The module ends the moment Nell names Preston.
// defense(el, { evidence: [ids], score(key, n) }) → Promise<{ credibility (0–100), order: [ids played], answered }>
import { seg, segC, segW, chip, star4 } from "../gfx.js";
import { PORTRAIT } from "../portraits.js";
import { exitLabel, exitKey } from "./exit.js";

/* ---------------- the cards ---------------- */
// t: title, s: subtitle (both stroke alphabet), d: the hover description, k: material color, ic: icon
const CARDS = {
  calendar: { t: "SCANNER CALENDAR", s: "NO BOOKINGS. ANY MAGNET.", k: "sW", d: "Tess's scanner calendar. Twelve months, not one booking for the Big Finding." },
  po: { t: "PURCHASE ORDERS", s: "NO 7T. NO COIL.", k: "sW", d: "Penny's purchase orders, via Form PO-7. Nobody ever bought a laminar coil." },
  irb: { t: "ETHICS APPROVAL", s: "APPROVED AFTER THE DATA", k: "sW", d: "The ethics board approved the study after the data were 'collected'." },
  clipboard: { t: "SIGN-IN SHEET", s: "H. MOLAISON, P. GAGE ...", k: "sW", d: "Cody's sign-in sheet: H. Molaison, P. Gage and Totally Real Person." },
  recorder: { t: "THE RECORDER", s: "I RAN EVERY SUBJECT MYSELF", k: "sW", d: "Monday's voice memo, from journal club: 'I ran every subject myself.'" },
  grim: { t: "TABLE 1  CEILING", s: "3 OF 6 BEAT THE MOST POSSIBLE", k: "sB", d: "Three of Table 1's matches beat the most his own measurements allow." },
  overlay: { t: "FIGURE 3B = 3D", s: "ONE BRAIN, MIRRORED", k: "sB", d: "Figure 3d is Figure 3b, rotated and flipped. Two participants, one brain." },
  logs: { t: "GPU LOGS", s: "4,000 HRS OF INVENTED DETAIL", k: "sB", d: "4,000 hours of a program that sharpens blurry scans by inventing detail." },
  glm: { t: "THE REPLICATION", s: "SAME IN EVERY LAYER", k: "sB", d: "His own analysis, redone by hand on his own data. The layers are painted on." },
  retainer: { t: "THE RETAINER", s: "SIX LAYERS IN MY MOUTH", k: "sB", d: "My practice scan over his Figure 2: the same retainer hole, six layers painted in." },
  reviewer2: { t: "REVIEWER 2 REPORT", s: "NUERON. UTILIZE.", k: "sR", d: "Reviewer 2's report on my paper, from Impact's laptop. Human typos." },
  invite: { t: "THE INVITATION", s: "CREAM PAPER. REPLY W/ DOB", k: "sV", d: "An invitation to the Table. Friday dinner. Reply with your date of birth." },
  hours: { t: "THE MISSING HOURS", s: "EVERY FRIDAY. SAME GAP.", k: "sV", d: "Three men, one Friday-night gap in every expense report, the same feeder labs." },
  metamer: { t: "THE METAMER", s: "EVERY SENTENCE BORROWED", k: "sV", d: "The Big Finding: every sentence lifted from older papers by the same few labs." },
  card: { t: "IMPACT'S NRT CARD", s: "EXPIRED. AGE 41.", k: "sV", d: "Prof. Impact's Round Table membership card. Expired at 41." },
  dark: { t: "THE DARK BOOTH", s: "HIS EARBUDS GLOW. DIAL AT MAX", k: "sG", d: "In the dark booth, his earbuds glow: a coil, the Table's insignia, a dial at max." },
  feud: { t: "THE FEUD SEED", s: "TWO RIVALS. ONE SEED.", k: "sV", d: "The famous feud with Dr. Polly Mick: both sides, written by the same machine." },
};
const ALL = Object.keys(CARDS);

// little line icons, centered on (x, y), about 30 × 20
const IC = {
  calendar: (x, y, c) => `<rect class="${c}" x="${x - 12}" y="${y - 9}" width="24" height="18"/><path class="hl ${c}" d="M${x - 12},${y - 4} L${x + 12},${y - 4} M${x - 4},${y - 4} L${x - 4},${y + 9} M${x + 4},${y - 4} L${x + 4},${y + 9} M${x - 12},${y + 2.5} L${x + 12},${y + 2.5}"/><path class="${c}" d="M${x - 6},${y - 11} L${x - 6},${y - 7} M${x + 6},${y - 11} L${x + 6},${y - 7}"/>`,
  po: (x, y, c) => `<path class="${c}" d="M${x - 8},${y - 10} L${x + 5},${y - 10} L${x + 9},${y - 6} L${x + 9},${y + 10} L${x - 8},${y + 10} Z"/><path class="hl ${c}" d="M${x - 5},${y + 1} L${x + 6},${y + 1} M${x - 5},${y + 4.5} L${x + 6},${y + 4.5} M${x - 5},${y + 8} L${x + 2},${y + 8}"/>${seg("PO-7", x - 6, y - 7, 4.5, c, .8)}`,
  irb: (x, y, c) => `<path class="${c}" d="M${x - 10},${y - 10} L${x + 6},${y - 10} L${x + 6},${y + 10} L${x - 10},${y + 10} Z"/><path class="hl ${c}" d="M${x - 7},${y - 6} L${x + 3},${y - 6} M${x - 7},${y - 3} L${x + 3},${y - 3}"/><circle class="sR" cx="${x + 5}" cy="${y + 4}" r="6.5" transform="rotate(-12 ${x + 5} ${y + 4})"/>${seg("IRB", x + 1.2, y + 2, 3.6, "sR", .7)}`,
  clipboard: (x, y, c) => `<rect class="${c}" x="${x - 9}" y="${y - 9}" width="18" height="20"/><path class="${c}" d="M${x - 4},${y - 9} L${x - 4},${y - 12} L${x + 4},${y - 12} L${x + 4},${y - 9}"/><path class="hl ${c}" d="M${x - 6},${y - 4} C${x - 4},${y - 6} ${x - 2},${y - 2} ${x},${y - 4} M${x - 6},${y + 1} L${x + 6},${y + 1} M${x - 6},${y + 5} C${x - 3},${y + 3} ${x},${y + 7} ${x + 5},${y + 5}"/>`,
  recorder: (x, y, c) => `<rect class="${c}" x="${x - 12}" y="${y - 8}" width="24" height="16"/><circle class="${c}" cx="${x - 5}" cy="${y}" r="3.5"/><circle class="${c}" cx="${x + 5}" cy="${y}" r="3.5"/><path class="hl ${c}" d="M${x - 5},${y - 3.5} L${x + 5},${y - 3.5}"/><circle class="fR" cx="${x + 9}" cy="${y - 5}" r="1.2"/>`,
  grim: (x, y, c) => `<rect class="${c}" x="${x - 12}" y="${y - 8}" width="24" height="16"/><path class="hl ${c}" d="M${x - 12},${y} L${x + 12},${y} M${x - 4},${y - 8} L${x - 4},${y + 8} M${x + 4},${y - 8} L${x + 4},${y + 8}"/><path class="sR" d="M${x + 5.5},${y + 1.5} L${x + 10.5},${y + 6.5} M${x + 10.5},${y + 1.5} L${x + 5.5},${y + 6.5}"/>`,
  overlay: (x, y, c) => `<rect class="hl ${c}" x="${x - 13}" y="${y - 8}" width="14" height="14"/><rect class="hl ${c}" x="${x - 1}" y="${y - 6}" width="14" height="14"/><path class="${c}" d="M${x - 11},${y + 3} C${x - 8},${y - 6} ${x - 4},${y - 6} ${x - 2},${y - 1}"/><path class="${c}" d="M${x + 11},${y + 5} C${x + 8},${y - 4} ${x + 4},${y - 4} ${x + 2},${y + 1}"/>`,
  logs: (x, y, c) => `<rect class="${c}" x="${x - 12}" y="${y - 9}" width="24" height="18"/><path class="${c}" d="M${x - 9},${y - 5} L${x - 6},${y - 3} L${x - 9},${y - 1}"/><path class="hl ${c}" d="M${x - 4},${y - 3} L${x + 8},${y - 3} M${x - 9},${y + 2} L${x + 6},${y + 2} M${x - 9},${y + 5.5} L${x + 2},${y + 5.5}"/>`,
  glm: (x, y, c) => `<path class="hl ${c}" d="M${x - 13},${y + 8} L${x + 13},${y + 8}"/><path class="${c}" d="M${x - 10},${y + 8} L${x - 10},${y - 4} L${x - 3},${y - 4} L${x - 3},${y + 8} M${x + 3},${y + 8} L${x + 3},${y - 4} L${x + 10},${y - 4} L${x + 10},${y + 8}"/><path class="${c}" d="M${x - 2},${y - 9} L${x + 2},${y - 9} M${x - 2},${y - 7} L${x + 2},${y - 7}"/>`,
  retainer: (x, y, c) => `<path class="${c}" d="M${x - 11},${y + 8} C${x - 12},${y - 6} ${x - 6},${y - 10} ${x},${y - 10} C${x + 6},${y - 10} ${x + 12},${y - 6} ${x + 11},${y + 8}"/><path class="hl ${c}" d="M${x - 7},${y + 7} C${x - 8},${y - 3} ${x - 4},${y - 6} ${x},${y - 6} C${x + 4},${y - 6} ${x + 8},${y - 3} ${x + 7},${y + 7}"/><path class="hl sK" d="M${x - 9},${y + 2} L${x - 5},${y + 1} M${x - 8},${y - 3} L${x - 5},${y - 2} M${x + 9},${y + 2} L${x + 5},${y + 1} M${x + 8},${y - 3} L${x + 5},${y - 2}"/>`,
  reviewer2: (x, y, c) => `<path class="sW" d="M${x - 10},${y - 10} L${x + 10},${y - 10} L${x + 10},${y + 10} L${x - 10},${y + 10} Z"/>${seg("2", x - 4, y - 7, 10, c, 1.2)}<path class="hl ${c}" d="M${x - 8},${y + 7} C${x - 5},${y + 5} ${x - 2},${y + 9} ${x + 1},${y + 7} C${x + 4},${y + 5} ${x + 6},${y + 9} ${x + 8},${y + 7}"/>`,
  invite: (x, y, c) => `<rect class="${c}" x="${x - 12}" y="${y - 8}" width="24" height="16"/><path class="${c}" d="M${x - 12},${y - 8} L${x},${y + 2} L${x + 12},${y - 8}"/><circle class="k sR" cx="${x}" cy="${y + 2}" r="3"/>`,
  hours: (x, y, c) => `<circle class="${c}" cx="${x}" cy="${y}" r="10"/><path class="${c}" d="M${x},${y} L${x},${y - 6} M${x},${y} L${x + 4},${y + 2}"/><path class="hl sR" d="M${x + 7},${y - 7} A10,10 0 0 1 ${x + 10},${y}"/>`,
  metamer: (x, y, c) => `<circle class="${c}" cx="${x - 5}" cy="${y}" r="8"/><circle class="${c}" cx="${x + 5}" cy="${y}" r="8"/><path class="hl ${c}" d="M${x - 2},${y - 2} L${x + 2},${y - 2} M${x - 2},${y + 2} L${x + 2},${y + 2}"/>`,
  card: (x, y, c) => `<rect class="${c}" x="${x - 13}" y="${y - 8}" width="26" height="16" rx="1.5"/><circle class="${c}" cx="${x - 6}" cy="${y}" r="4.5"/><circle class="fR" cx="${x - 6}" cy="${y}" r="1.6"/>${seg("41", x + 1, y - 3, 6, c, .9)}`,
  dark: (x, y, c) => `<circle class="hl ${c}" cx="${x}" cy="${y}" r="8"/><circle class="hl ${c}" cx="${x}" cy="${y}" r="3.2"/>${[[-11, -6], [10, -8], [-6, 9], [12, 5], [0, -12], [-13, 3], [7, 11]].map(([a, b]) => `<circle class="fW" cx="${x + a}" cy="${y + b}" r=".9"/>`).join("")}`,
  feud: (x, y, c) => `<path class="${c}" d="M${x - 13},${y} L${x - 3},${y} M${x - 7},${y - 4} L${x - 3},${y} L${x - 7},${y + 4} M${x + 13},${y} L${x + 3},${y} M${x + 7},${y - 4} L${x + 3},${y} L${x + 7},${y + 4}"/><path class="hl ${c}" d="M${x - 8},${y - 10} L${x},${y - 6} L${x + 8},${y - 10} M${x},${y - 6} L${x},${y - 2}"/>`,
};

/* ---------------- the questions ---------------- */
// w: card → weight (2 decisive, 1 strong). ask: the question's lines. ok: lines when it's answered.
const Q = [
  { key: "RUN", who: "SMALL", q: "WAS THE STUDY RUN?", w: { calendar: 1, po: 1, irb: 1, clipboard: 1, recorder: 1 },
    ask: [["SMALL", "Question one, from the detective. The fancy study. The 7T one. Was it run? Walk me through it."]],
    ok: [["SMALL", "No bookings, no coil, no permission, no living participants. Fine. The study wasn't run."], ["SMALL", "I'm writing that down. First thing I've written all year that isn't a sample size."]] },
  { key: "REAL", who: "ETHEL", q: "ARE THE DATA REAL?", w: { grim: 1, overlay: 1, logs: 1, glm: 1 },
    ask: [["ETHEL", "Question two. Something was published, Ms. Null. It has numbers in it. Are the data real?"]],
    ok: [["ETHEL", "Impossible numbers. A recycled picture. A result that isn't there."], ["ETHEL", "I'm opening a new binder. That hasn't happened since 2009."]] },
  { key: "WHOSE", who: "ADLINE", q: "WHOSE DATA ARE THEY?", w: { retainer: 2, glm: 1, logs: 1 },
    ask: [["ADLINE", "Then whose data are they, Nell? Data come from somewhere. Mine come from my lab. Slowly."]],
    ok: [["ADLINE", "That's your pilot. That's… our pilot. That came out of my lab."], ["ADLINE", "Okay. That one does not wait until after the 15th."]] },
  { key: "REVIEW", who: "ADLINE", q: "WHO WROTE THE REVIEW?", w: { reviewer2: 2 },
    ask: [["ADLINE", "Your paper went out from my lab last spring and came back from Reviewer 2. Who wrote the review?"]],
    ok: [["SMALL", "A typo is a fingerprint. That one I believe."], ["ADLINE", "Impact's student. Nell, there's only one. Are you going to say a name?"], ["NELL", "At the end. It's a defense. You save the result for the end."]] },
  { key: "WHY", who: "SMALL", q: "WHY WOULD ANYONE DO THIS?", w: { invite: 1, hours: 1, metamer: 1, card: 1, feud: 1, logs: 1, dark: 1 }, last: true,
    ask: [["SMALL", "Okay. Fraud, theft, a grudge review, and people keep dying near it. Why? Nobody does all that for one paper."]],
    ok: [] },
];

// Nell's statement when a card lands. Per-question overrides use "q:id".
const NELL = {
  calendar: ["Tess's scanner calendar. Twelve months, not one booking for the Big Finding. Not on our 3T, and not on the 7T, which we also don't have."],
  po: ["Purchase orders, courtesy of Penny and Form PO-7. Nobody bought a 7T. Nobody bought a laminar coil. Somebody bought forty pizzas."],
  irb: ["The ethics protocol. Approved in March. The data were 'collected' in January. You need permission before you test people, not after."],
  clipboard: ["The participant sign-in sheet. H. Molaison. P. Gage. S.M. And my favorite participant, Totally Real Person."],
  recorder: [["PRESTON", "(RECORDED) I ran every subject myself."], ["NELL", "He ran every subject himself. Into a magnet the building doesn't have."]],
  grim: ["Table 1. His attention test agrees with itself at .64, his scan at .56. Two wobbly rulers can't match better than about .60. Three of his hit .88: he kept only the brain spots that already matched."],
  overlay: ["Figure 3b is participant 7. Figure 3d is participant 12. Turn 3d and flip it, and every speck lands on 3b. Two people, one brain, mirrored."],
  logs: ["The GPU logs. Four thousand hours of a program that sharpens blurry scans by inventing the detail. Nobody invents detail they actually collected."],
  glm: ["His analysis, on his own data: attention turns the brain up the same at every depth. At 3T one voxel is bigger than all six layers. A spoon bigger than the cake. The layers are painted on."],
  "WHOSE:glm": ["Subject one in his shared data shows no difference between layers at all. A very familiar nothing. Mine."],
  "WHOSE:logs": ["The super-resolution job's input folder is /data/null/pilot. That's not a figure of speech. That's my folder."],
  retainer: ["My pilot scan. My retainer punches a hole in the image, like a thumb over the lens. His Figure 2 has the same hole, with six neat layers painted inside it. That's not his brain. That's my mouth."],
  reviewer2: ["Reviewer 2's report on my paper, from Impact's laptop. Impact never reviews anything; his student does. 'Nueron.' 'Utilize.' The machine that writes his papers never misspells. A person wrote this one."],
  invite: ["An invitation. Cream paper, warm, jokey. A Friday dinner for neuroscientists under forty, no minutes, never on your CV. To accept, reply with your date of birth."],
  hours: ["The missing hours. The first author, his PI and our late Chair: the same blank every Friday night, in every expense report, for decades. The same three feeder labs on every CV."],
  metamer: ["The Big Finding is a metamer: different parts, same look, like two lights your eye sees as one colour. Every sentence is lifted from an older paper by the same few labs. The author list is a membership roll."],
  card: ["Professor Impact's membership card. The Neuroscientific Round Table. It expired when he turned forty-one. So did he."],
  dark: ["Thursday, in our dark booth, after twenty minutes for my eyes to adjust: Preston's earbuds glow. A few photons a second. A coil. The Table's insignia. And a dial at maximum. Someone is turning him up."],
  feud: ["The famous feud with Dr. Mick. Both sides written by the same model, with the same seed, on the same Friday nights. Two puppets, one hand."],
  "WHY:logs": ["The second job in the logs runs every Friday at midnight: a language model trained on /mnt/B3/archive. There is no B3. There's a B3."],
};

// committee reactions to a card that doesn't answer the question
const REACT = {
  SMALL: [(n) => `Irrelevant. That's N equals ${n}. I'm starting to see a pattern, and it's you.`,
    (n) => `One document, wrong question. N equals ${n} wrong questions. That's underpowered, but it's trending.`,
    (n) => `I've been counting. That's ${n}. I count everything, Ms. Null. It's a condition.`],
  ETHEL: [() => "Is there a binder for that? There should be a binder for that. It shouldn't be this binder.",
    () => "Noted. Filed. Filed under 'no.'", () => "I'm going to need that tabbed, indexed, and relevant. Two out of three won't do."],
  ADLINE: [() => "Nell, can this wait until after the 15th?", () => "Is that in the thesis? It's not in the thesis. Can we talk about it after the 15th?",
    () => "I have a grant due in nine days. Relevant things only, please."],
};
const SPECIAL = {
  "RUN:grim": ["SMALL", "Correlations. I like correlations. Not yet, though. First: did anybody sit in a scanner?"],
  "RUN:retainer": ["ADLINE", "Nell. Is that your retainer? Why is your retainer an exhibit?"],
  "RUN:feud": ["ADLINE", "Valu versus Mick? I reviewed for that. Both of them cited me. Huh. Not the question."],
  "REAL:clipboard": ["ETHEL", "Dead neurologists signing in is about whether the study ran. We've settled that. I have it tabbed."],
  "REAL:calendar": ["ETHEL", "We've established that nobody booked a scanner. We're past booking. We're on numbers."],
  "REAL:recorder": ["ETHEL", "A man saying he did something is testimony. I asked about data. Data don't say things. Usually."],
  "WHOSE:reviewer2": ["ADLINE", "Who wrote the review is the next question. I wrote it down. On my hand."],
  "REVIEW:recorder": ["SMALL", "A man saying he did something. I hear that a lot. Usually it's 'I didn't.'"],
  "REVIEW:invite": ["ADLINE", "That's a dinner invitation, Nell. I asked about a review. Although… cream paper. Nice."],
  "WHY:calendar": ["ETHEL", "That establishes nobody booked a scanner. It doesn't establish a motive. Unless the motive is scheduling."],
  "WHY:grim": ["SMALL", "We know the numbers are fake. I asked why. A correlation doesn't have a why. I've tried asking."],
};
const LATE = ["SMALL", "We did that one. Keep up, Ms. Null."];
const COL = { NELL: "G", ADLINE: "W", ETHEL: "V", SMALL: "W", NARRATOR: "W", PRESTON: "R" };
const NAME = { NELL: "NELL", ADLINE: "PROF. ADLINE", ETHEL: "ETHEL BORD", SMALL: "DET. SMALL", NARRATOR: "NARRATOR", PRESTON: "PRESTON" };

/* ---------------- portraits ---------------- */
// Prof. Adline, in case the cast hasn't drawn her yet: a frizzy INK bob, round glasses, a BRASS scarf, a COOL cardigan.
// Same sheet coordinates as the other busts (head ≈ y 28–82), with eyes-open/closed and mouth-a/b poses.
const ADLINE_FALLBACK = { name: "PROF. ADLINE", chip: "fW", vb: "112 12 96 118", svg: () => `
  <path class="k sB" d="M128,140 C126,104 132,92 152,87 L160,96 L168,87 C188,92 194,104 192,140 Z"/>
  <path class="hl sB" d="M140,104 C142,116 142,128 140,138 M180,104 C178,116 178,128 180,138 M160,104 L160,140"/>
  <path class="sA" d="M150,86 C152,96 168,96 170,86 M154,92 L148,112 M158,93 L156,114"/>
  <path class="sK" d="M154,80 L154,87 M167,80 L167,87"/>
  <path class="k sK" d="M140,52 C139,71 149,81 161,81 C173,81 182,71 181,52"/>
  <path class="sK" d="M140,56 C134,55 134,65 140,66 M181,56 C187,55 187,65 181,66"/>
  <path class="k sW" d="M133,76 C122,58 126,28 160,26 C194,28 198,58 187,76 C186,64 184,54 180,48 C170,44 150,44 140,48 C136,54 134,64 133,76 Z"/>
  <path class="hl sW" d="M131,60 C127,58 127,52 130,50 M189,60 C193,58 193,52 190,50 M142,34 C146,30 150,31 151,34 M163,30 C167,28 171,30 171,33 M176,36 C180,34 184,37 183,41"/>
  <path class="sW" d="M146,51 L155,50 M166,50 L175,51"/>
  <circle class="sW" cx="151" cy="58" r="5.5"/><circle class="sW" cx="170" cy="58" r="5.5"/><path class="sW" d="M156.5,58 L164.5,58"/>
  <g class="eyes-open"><circle class="fW" cx="151" cy="58.5" r="1.5"/><circle class="fW" cx="170" cy="58.5" r="1.5"/></g>
  <g class="eyes-closed"><path class="sW" d="M148,59 L154,59 M167,59 L173,59"/></g>
  <path class="hl sM" d="M146,65 C149,67 153,67 156,65 M165,65 C168,67 172,67 175,65"/>
  <path class="sK" d="M160,61 C157,67 160,69 163,68"/>
  <g class="mouth-a"><path class="sK" d="M154,74 C158,72.5 163,72.5 167,74"/></g>
  <g class="mouth-b"><path class="k sK" d="M154,73.5 C158,72.5 163,72.5 167,73.5 C165,78 156,78 154,73.5 Z"/></g>` };
const PT = () => ({ ADLINE: PORTRAIT.adline || ADLINE_FALLBACK, ETHEL: PORTRAIT.ethel, SMALL: PORTRAIT.small, NELL: PORTRAIT.nell });

// readable on a phone: stroke-alphabet text at size h, shrunk only if it would overflow width w
const fit = (t, h, w) => Math.min(h, w / Math.max(1, segW(t, 1)));

/* ---------------- style (once) ---------------- */
const CSS = `
.dfn svg.dfsvg { position: relative; width: 100%; flex: 1 1 0; min-height: 0; }
.dfn [data-card] { cursor: pointer; } .dfn.busy [data-card] { cursor: default; }
.dfn:not(.busy) [data-card]:hover .cb { stroke: var(--G); }
.dfn:not(.busy) [data-card]:hover .ct path { stroke: var(--G); }
.dfn .pdim { opacity: .45; }
#panel .screen.dfn { left: 2%; right: 2%; top: 2%; bottom: 2%; }
/* a fixed box: three lines at full size, never taller or shorter, so nothing else on the screen moves */
#panel .dfn .coachline { font-size: 3cqw; line-height: 1.08; cursor: pointer; box-sizing: border-box; height: 12.4cqw; min-height: 0; flex: none; overflow: hidden;
  position: relative; border: .16cqw solid var(--D); padding: .7cqw 1.2cqw 1.7cqw; margin: .5cqw 0 .3cqw; text-transform: uppercase; }
#panel .dfn .coachline .who { font-size: 1.8cqw; vertical-align: .25em; margin-right: .5cqw; }
.dfn .coachline .rest { visibility: hidden; }
.dfn .coachline .nx { position: absolute; right: .8cqw; bottom: .3cqw; font-size: 1.3cqw; color: var(--M); letter-spacing: .1em; }
#panel .dfn .bar { flex-wrap: nowrap; flex: none; }
#panel .dfn .status { color: var(--M); font-size: 1.7cqw; max-width: 70%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.dfn .status b { color: var(--W); font-weight: 600; }
`;
function css() { if (document.getElementById("css-defense")) return; const s = document.createElement("style"); s.id = "css-defense"; s.textContent = CSS; document.head.appendChild(s); }

/* ---------------- the module ---------------- */
const sfx = (n, o) => window.SFX && window.SFX.play(n, o);

export function defense(el, { evidence = ALL, score = () => {} } = {}) {
  css();
  const hand = ALL.filter(id => (evidence || []).includes(id));
  return new Promise(resolve => {
    const S = { qi: 0, cred: 20, delta: 0, got: 0, order: [], used: {}, ex: 0, tried: {}, wrongN: 0, rx: { SMALL: 0, ETHEL: 0, ADLINE: 0 },
      q: [], say: null, busy: false, end: false, answered: 0, named: false, flash: null, hover: "" };
    let T = null, flapT = null, typeT = null, talkUntil = 0;
    const clamp = (v) => Math.max(0, Math.min(100, v));

    /* --- the line queue: [who, text] or a function; lines advance on a timer or a click --- */
    function queue(...items) { S.q.push(...items); if (!S.busy) next(); }
    function next() {
      clearTimeout(T);
      while (S.q.length && typeof S.q[0] === "function") S.q.shift()();
      if (!S.q.length) { S.busy = false; draw(); return; }
      S.busy = true; S.say = S.q.shift(); S.shown = 0; S.typing = true; S.fs = 3;
      talkUntil = Infinity;
      draw();
      { const box = el.querySelector(".coachline");   // a long line steps down a size or two rather than grow the box
        for (const f of [3, 2.65, 2.35, 2.1]) { S.fs = f; box.style.fontSize = f + "cqw"; if (box.scrollHeight <= box.clientHeight + 1) break; } }
      const len = S.say[1].length;
      clearInterval(typeT);
      typeT = setInterval(() => {
        if (++S.shown >= len) { doneTyping(); return; }
        const a = el.querySelector(".coachline .shown"), b = el.querySelector(".coachline .rest");
        if (a && b) { a.textContent = S.say[1].slice(0, S.shown); b.textContent = S.say[1].slice(S.shown); }
      }, 22);
    }
    function doneTyping() {
      clearInterval(typeT); S.shown = S.say ? S.say[1].length : 0; S.typing = false; talkUntil = 0; draw();
      clearTimeout(T); T = setTimeout(next, Math.max(1300, 30 * (S.say ? S.say[1].length : 0)));
    }
    function skip() { if (!S.busy) return; if (S.typing) doneTyping(); else next(); }

    /* --- drawing --- */
    function frame(who, x, y, w, h) {
      const p = PT()[who], talking = S.say && S.say[0] === who, dim = !talking && !(who === Q[S.qi]?.who && !S.end);
      return `<g class="${dim ? "pdim" : ""}"><rect class="k ${talking ? "sW" : "sD"} hl" x="${x}" y="${y}" width="${w}" height="${h}"/>
        <svg class="pt" data-pt="${who}" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${p.vb}" preserveAspectRatio="xMidYMid slice">${p.svg()}</svg></g>
        ${chip(p === PORTRAIT.nell ? "NELL NULL" : p.name, x, y + h + 2, fit(p === PORTRAIT.nell ? "NELL NULL" : p.name, 6, w - 6), p.chip)}`;
    }
    function quorumChair(x, y, w, h) {
      const cx = x + w / 2;
      return `<g class="pdim"><rect class="k sD hl" x="${x}" y="${y}" width="${w}" height="${h}"/>
        <path class="sM" d="M${cx - 16},${y + 62} L${cx - 16},${y + 22} C${cx - 16},${y + 12} ${cx + 16},${y + 12} ${cx + 16},${y + 22} L${cx + 16},${y + 62}"/>
        <path class="hl sM" d="M${cx - 12},${y + 24} L${cx + 12},${y + 24} M${cx - 12},${y + 30} L${cx + 12},${y + 30}"/>
        <rect class="k sA" x="${cx - 18}" y="${y + 56}" width="36" height="12"/>${segC("QUORUM", cx, y + 59, 5.5, "sA", .9)}</g>
        ${seg("(ABSENT)", x + 2, y + h + 3.5, 6, "sM", .9)}`;
    }
    function card(id, i) {
      // two rows, as many columns as the hand needs (8 for 16 cards, 9 for 17–18)
      const cols = Math.max(8, Math.ceil(hand.length / 2)), pitch = 640 / cols, cw = pitch - 4;
      const c = CARDS[id], x = 2 + (i % cols) * pitch, y = 140 + Math.floor(i / cols) * 70, cx = x + cw / 2;
      if (S.used[id]) return `<rect class="hl sD dash" x="${x}" y="${y}" width="${cw}" height="64"/>${segC("EXHIBIT " + S.used[id], cx, y + 28, 6.5, "sD", .9)}`;
      const tried = S.tried[id], fl = S.flash === id;
      return `<g data-card="${id}"><rect class="k cb ${fl ? "sR" : c.k}" x="${x}" y="${y}" width="${cw}" height="64"/>
        ${IC[id](cx, y + 18, tried ? "sD" : c.k)}<g class="ct">${segC(c.t, cx, y + 35, fit(c.t, 7, cw - 6), tried ? "sM" : "sW", 1.15)}</g>${segC(c.s, cx, y + 50, fit(c.s, 5, cw - 5), "sM", .8)}
        ${tried ? `<path class="sR" d="M${x + cw - 10},${y + 4} L${x + cw - 4},${y + 10} M${x + cw - 4},${y + 4} L${x + cw - 10},${y + 10}"/>` : ""}
        ${fl ? star4(x + cw - 6, y + 6, 6, "sR") : ""}</g>`;
    }
    function meter() {
      let s = seg("CREDIBILITY", 4, 102, 5.2, "sM", .8) + seg(String(Math.round(S.cred)).padStart(2, "0"), 4, 111, 15, "sW", 1.4);
      if (S.delta) s += seg((S.delta > 0 ? "+" : "") + S.delta, 34, 111, 7, S.delta > 0 ? "sG" : "sR", 1.1);
      for (let k = 0; k < 25; k++) { const x = 60 + k * 13, lit = S.cred >= (k + 1) * 4;
        s += `<rect class="${lit ? "fG" : "hl sD"}" x="${x}" y="${lit ? 112 : 112}" width="10" height="14"/>`; }
      Q.forEach((q, k) => {
        const x = 410 + k * 46, done = k < S.qi, cur = k === S.qi && !S.end;
        const lab = "Q" + (k + 1) + " " + q.key;
        if (q.last && S.end) s += chip(lab, x, 110, QH, "fR");
        else if (done) s += chip(lab, x, 110, QH, S.skipped?.[k] ? "fM" : "fG");
        else if (cur) s += chip(lab, x, 110, QH, "fA");
        else s += `<rect class="hl sD" x="${x}" y="110" width="${chipW(lab)}" height="${QH * 1.7}"/>${seg(lab, x + QH * .45, 110 + QH * .35, QH, "sM", .9)}`;
      });
      return s;
    }
    const QH = 6.4, chipW = (t) => segW(t, QH) + QH * .9;
    function screen() {
      const x = 270, w = 292, q = Q[S.qi];
      let s = `<rect class="hl sW" x="${x}" y="4" width="${w}" height="88"/>`;
      if (S.named) {
        s += seg("CONCLUSION", x + 8, 9, 6.5, "sM", .9) + segC("PRESTON VALU", x + w / 2, 34, 22, "sR", 1.7);
        return s;
      }
      if (!q) return s;
      s += seg(`QUESTION ${S.qi + 1} OF 5`, x + 8, 9, 6.5, "sM", .9) + seg(`ASKED BY ${NAME[q.who]}`, x + w - 8 - segW(`ASKED BY ${NAME[q.who]}`, 6.5), 9, 6.5, "sA", .9);
      { const h = fit(q.q, 19, w - 16); s += segC(q.q, x + w / 2, 22 + (19 - h) / 2, h, S.end ? "sM" : "sW", 1.9); }
      // exhibits answering this question
      const ex = Object.keys(S.used).filter(id => S.used[id] && S.usedQ[id] === S.qi);
      s += seg("EXHIBITS", x + 8, 50, 5.2, "sM", .8);
      ex.forEach((id, k) => { const ex0 = x + 12 + k * 46; s += `<rect class="k ${CARDS[id].k}" x="${ex0}" y="${60}" width="40" height="26"/>${IC[id](ex0 + 20, 73, CARDS[id].k)}`; });
      if (q.last && S.end) s += segC("EXTRAORDINARY CLAIMS", x + w / 2 + 50, 68, 9, "sR", 1.2);
      return s;
    }
    function draw() {
      const say = S.say, col = say ? (COL[say[0]] || "W") : "M";
      const hint = S.end ? "" : S.busy ? "" : `PLAY A CARD TO ANSWER: <b>${Q[S.qi].q}</b>`;
      el.innerHTML = `<div class="screen dfn ${S.busy ? "busy" : ""}">
        <svg class="t hd" viewBox="0 0 640 40">${seg("THE DEFENSE", 16, 10, 18, "sW", 1.6)}${seg("SEMINAR 101   NULL RESULTS: A DEFENSE   N. NULL   14:00", 186, 17, 5, "sM", .8)}</svg>
        <svg class="t dfsvg" viewBox="0 0 640 276">
          ${frame("ADLINE", 4, 4, 60, 74)}${frame("ETHEL", 70, 4, 60, 74)}${frame("SMALL", 136, 4, 60, 74)}${quorumChair(202, 4, 60, 74)}
          ${screen()}${frame("NELL", 572, 4, 60, 74)}
          ${meter()}
          <path class="hl sD" d="M0,134 L640,134"/>
          ${hand.map(card).join("")}
          ${hand.length ? "" : segC("NO EVIDENCE. JUST CONFIDENCE.", 320, 200, 10, "sM", 1.1)}
        </svg>
        <div class="coachline" style="font-size:${S.fs || 3}cqw;${say ? `border-color:var(--${col})` : ""}">${say ? `<span class="who" style="background:var(--${col})">${NAME[say[0]] || say[0]}</span><span class="shown" style="color:var(--${col})">${say[1].slice(0, S.shown)}</span><span class="rest">${say[1].slice(S.shown)}</span>` : ""}${S.busy && !S.typing ? `<span class="nx">CLICK ▸</span>` : ""}</div>
        <div class="bar"><span class="status">${S.hover || hint}</span>
          ${S.end ? `<button data-b="off" class="off">${exitLabel(true)}</button>` : `<button data-b="skip" class="off" ${S.busy ? "disabled" : ""}>NO FURTHER EVIDENCE</button>`}</div></div>`;
    }
    // mouths flap in poses while someone speaks; portraits blink now and then
    function flap() {
      const who = S.say && S.say[0], talking = Date.now() < talkUntil;
      if (talking && who) window.SFX && window.SFX.voice(who);
      el.querySelectorAll("svg.pt").forEach(p => {
        if (p.dataset.pt === who && talking) p.classList.toggle("mo"); else p.classList.remove("mo");
        if (Math.random() < .03) { p.classList.add("bl"); setTimeout(() => p.classList.remove("bl"), 140); }
      });
    }

    /* --- the rules --- */
    S.usedQ = {}; S.skipped = {};
    function bump(d) { S.cred = clamp(S.cred + d); S.delta = d; }
    function nellLines(id) {
      const q = Q[S.qi], L = NELL[q.key + ":" + id] || NELL[id];
      return L.map(l => typeof l === "string" ? ["NELL", l] : l);
    }
    function play(id) {
      if (S.busy || S.end || S.used[id]) return;
      const q = Q[S.qi], w = q.w[id] || 0;
      S.order.push(id);
      if (w > 0) {
        S.used[id] = ++S.ex; S.usedQ[id] = S.qi; S.got += w;
        bump(w * 8); sfx("deal"); sfx("credup");
        queue(...nellLines(id));
        if (S.got >= 2) solve();
      } else {
        S.tried[id] = true; S.wrongN++; bump(-6); S.flash = id; sfx("deal"); sfx("creddown"); sfx("harrumph");
        const answeredBefore = Q.slice(0, S.qi).some(qq => qq.w[id]);
        let r = SPECIAL[q.key + ":" + id];
        if (!r && answeredBefore) r = LATE;
        if (!r) { const pool = REACT[q.who], k = S.rx[q.who]++ % pool.length; r = [q.who, pool[k](S.wrongN)]; }
        queue(r, () => { S.flash = null; });
      }
    }
    function solve() {
      const q = Q[S.qi];
      if (q.last) { finale(); return; }
      S.answered++;
      queue(...q.ok, () => { S.qi++; S.got = 0; S.tried = {}; S.delta = 0; sfx("gavel"); }, ...Q[S.qi + 1].ask);
    }
    function moveOn() {
      if (S.busy || S.end) return;
      const q = Q[S.qi];
      if (q.last) { finale(); return; }
      bump(S.got ? -4 : -10); S.skipped[S.qi] = true; sfx("creddown"); sfx("harrumph");
      queue([q.who, S.got ? "Partially supported. The committee notes it. The committee is not thrilled." : "Unsupported. The committee notes that. In pen."],
        () => { S.qi++; S.got = 0; S.tried = {}; S.delta = 0; sfx("gavel"); }, ...Q[S.qi + 1].ask);
    }
    function finale() {
      S.end = true; S.answered = Math.min(S.answered, 4);
      queue(["ETHEL", "A secret dinner club. Hooded reviewers. A language model in a sub-basement this building doesn't have."],
        ["ETHEL", "Extraordinary claims, Ms. Null."],
        ["SMALL", "Show me N. That's how many, Ms. Null."],
        ["NELL", "Then I'll give you one ordinary claim. The paper, the review and the theft have one author."],
        () => { S.named = true; S.delta = 0; sfx("sting"); score("defense", Math.round(S.cred / 10)); },
        ["NELL", "Preston Valu."]);
    }

    /* --- input --- */
    const onClick = (e) => {
      const t = e.target.closest ? e.target : e.target.parentNode;
      const b = t.closest("button[data-b]");
      if (b) { if (b.disabled) return; if (b.dataset.b === "off") { if (!S.busy) finish(); else skip(); return; } if (b.dataset.b === "skip") moveOn(); return; }
      if (S.busy) { skip(); return; }
      const c = t.closest("[data-card]"); if (c) play(c.dataset.card);
    };
    const onOver = (e) => {
      const c = e.target.closest && e.target.closest("[data-card]"); const h = c ? `<b>${CARDS[c.dataset.card].t}</b>  ${CARDS[c.dataset.card].d}` : "";
      if (h !== S.hover) { S.hover = h; const st = el.querySelector(".dfn .status"); if (st) st.innerHTML = h || (S.end || S.busy ? "" : `PLAY A CARD TO ANSWER: <b>${Q[S.qi].q}</b>`); }
    };
    const onKey = (e) => {
      if (e.key === " " || e.key === "Enter" || e.key === "Escape") { e.preventDefault(); if (S.busy) skip(); else if (S.end && e.key !== "Escape") finish(); }
    };
    function finish() {
      clearTimeout(T); clearInterval(flapT); clearInterval(typeT);
      el.removeEventListener("click", onClick); el.removeEventListener("mouseover", onOver); window.removeEventListener("keydown", onKey);
      el.classList.remove("show"); el.innerHTML = "";
      resolve({ credibility: Math.round(S.cred), order: S.order.slice(), answered: S.answered });
    }
    el.classList.add("show");
    el.addEventListener("click", onClick); el.addEventListener("mouseover", onOver); window.addEventListener("keydown", onKey);
    flapT = setInterval(flap, 130); sfx("gavel");
    queue(["ADLINE", "Nell. I've read the abstract. Twice. Which is twice more than I've read anything since the 1st."],
      ["ETHEL", "The committee will evaluate evidence, Ms. Null. Exhibits only. I've prepared a binder for the binder."],
      ["SMALL", "I'm here because the Chair died. Allegedly. Don't mind me. I'm just counting."],
      ...Q[0].ask);
  });
}
