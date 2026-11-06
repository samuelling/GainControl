// ACT III — Wednesday: MAJOR REVISIONS. Four proofs (Nell + Morris, Gus at his desk), Dana, the faculty meeting
// (THE NOD, and Quorum "dies"), Iris; then Gus in the steam tunnels. Design: docs/ACT3.md.
import { seg, segC, chip, chipW } from "../gfx.js";
import { ITEMS } from "./act1.js";
import "./act2.js";   // Act II's items (printout, …) and look-wrappers
import { grim } from "../minigames/grim.js";
import { overlay } from "../minigames/overlay.js";
import { nod } from "../minigames/nod.js";
import { glm } from "../minigames/glm.js";

/* ---------------- items ---------------- */
Object.assign(ITEMS, {
  can: { name: "energy drink (Gus's)", look: "A can of NULL HYPOTHESIS, from Gus's emergency stash. The label says pH 2.4. That's not a drink. That's a cleaning product with a marketing budget.",
    g: (x, y) => `<rect class="sW" x="${x - 5}" y="${y - 10}" width="10" height="20"/><path class="hl sW" d="M${x - 5},${y - 6} L${x + 5},${y - 6}"/>${seg("H0", x - 4, y - 1, 3.4, "sG", .6)}` },
  mug: { name: "mug", look: "A department mug: WORLD'S OKAYEST PI. Clean, by kitchen standards. Which is to say, not.",
    g: (x, y) => `<path class="sW" d="M${x - 7},${y - 8} L${x + 5},${y - 8} L${x + 4},${y + 9} L${x - 6},${y + 9} Z M${x + 5},${y - 4} C${x + 10},${y - 4} ${x + 10},${y + 4} ${x + 4},${y + 4}"/>` },
  coffee: { name: "coffee", look: "An actual espresso, from the actual machine, for the first time since 2012. It smells faintly of citrus and electrolytes.",
    g: (x, y) => `<path class="sW" d="M${x - 7},${y - 6} L${x + 5},${y - 6} L${x + 4},${y + 9} L${x - 6},${y + 9} Z M${x + 5},${y - 2} C${x + 10},${y - 2} ${x + 10},${y + 5} ${x + 4},${y + 5}"/><path class="hl sA" d="M${x - 3},${y - 9} C${x - 5},${y - 12} ${x - 1},${y - 13} ${x - 3},${y - 16} M${x + 1},${y - 9} C${x - 1},${y - 12} ${x + 3},${y - 13} ${x + 1},${y - 16}"/>` },
  login: { name: "Rex's login", look: "A sticky note in Rex's handwriting: rjected / Rejected9!  And underneath, smaller: 'they made me add the !'",
    g: (x, y) => `<rect class="sA" x="${x - 8}" y="${y - 8}" width="16" height="16"/><path class="hl sA" d="M${x - 5},${y - 3} L${x + 5},${y - 3} M${x - 5},${y + 1} L${x + 3},${y + 1}"/>` },
  log: { name: "Preston's stimulus log", look: "Preston's run log for the Big Finding: one subject, sub-01, two conditions, ATTEND and IGNORE, blocks of 16 seconds. Handwritten. The handwriting is very confident.",
    g: (x, y) => `<rect class="sR" x="${x - 8}" y="${y - 10}" width="16" height="21"/><path class="hl sW" d="M${x - 5},${y - 5} L${x + 5},${y - 5} M${x - 5},${y - 1} L${x + 5},${y - 1} M${x - 5},${y + 3} L${x + 2},${y + 3}"/>` },
});
const wrap = (id, fn) => { const old = ITEMS[id].look; ITEMS[id].look = (api) => api.G.act >= 3 ? fn(api) : (typeof old === "function" ? old(api) : old); };
const PROOFS = ["proofGrim", "proofOverlay", "proofLogs", "proofGLM"];
const proofs = (api) => PROOFS.filter(k => api.flag(k)).length;
wrap("notebook", (api) => {
  const f = api.G.flags, t = (k, s) => `- ${f[k] ? "(done) " : ""}${s}`;
  if (f.quorumDead) return "Your lab notebook. Today's last line, in handwriting you don't recognize as your own:\n\nTHE FACULTY ANSWER THE MOTION FROM TWO AGO. QUORUM IS DEAD. NOBODY MOVED TO ADJOURN.\n\nAnd under it: the old woman on four.";
  return "Your lab notebook. Today: prove the Big Finding is fake. Not suspicious. Fake.\n\n"
    + [t("proofGrim", "Table 1: Gus says the means look wrong. (His desk.)"), t("proofOverlay", "Figure 3: the two participants look… familiar. (Your monitor.)"),
      t("proofLogs", "Who used the GPU cluster? Rex knows. Rex wants coffee. (Kitchen.)"),
      t("proofGLM", "Replicate it. Need Preston's stimulus log, which is in the Impact Lab. Nell can't get in." + (f.morrisHint3 ? " Morris can." : ""))].join("\n")
    + (proofs(api) === 4 && !f.meetingOpen ? "\n\nAll four. Take it to Ethel Bord, Research Integrity, 2F." : "")
    + (f.meetingOpen && !f.quorumDead ? "\n\nFaculty meeting, 3F. New Business." : "");
});
wrap("recorder", (api) => "Your voice memo recorder. Memo 1, PRESTON: \"I ran every subject myself.\" Memo 2, PENNY: \"Nobody ordered a coil.\""
  + (api.flag("taped") ? "\n\nMemo 3, PRESTON, THIS MORNING: \"…that's what fog neuro is all— Cog. Cog neuro.\"" : ""));
wrap("printout", (api) => `Gus's printout from Preston's computer: "${api.G.flags.printTitle || "Untitled"}." Footer: LTM v0.9 · FOG NEURO · SEED 0412.\n\nOne machine, one seed, one byline. Every sentence welded from somebody else's finding.`);
wrap("drink", () => "A can of NULL HYPOTHESIS. Gus's fourth tonight. His hands have a gentle vibrato.");
wrap("phone", (api) => "Texts from Nell, 11:58 PM:\n\nNELL: dana's dead. quorum's dead. the old woman says I'm the QUARRY\nNELL: please go home\nNELL: you're not going home are you\n\nGus's list:\n- Find where the chilled water's going. It's leaking into the scan.");

/* ---------------- readouts ---------------- */
const JOBS = () => {
  let s = `<rect class="k sW" x="60" y="34" width="520" height="236"/>${seg("GPU CLUSTER  JOB HISTORY  USER: PVALU", 76, 46, 7, "sG", 1.1)}`;
  const rows = [["SUPERRES_LAMINAR.PY", "4,012 GPU-H", "SUB-01  3T > 7T", "sR"], ["SUPERRES_LAMINAR.PY", "  216 GPU-H", "LAYERS: 6", "sR"],
    ["LTM_GENERATE.PY", "FRI 00:00", "WEEKLY", "sA"], ["  --CORPUS /MNT/B3/ARCHIVE", "", "", "sA"], ["  --BYLINE \"P. VALU\"", "", "", "sA"],
    ["OUTPUT QUEUE: 40 DRAFTS", "", "DATED 2027", "sW"], ["  VALU ET AL. 2027", "", "", "sW"], ["  \"THE NULL RESULT OF N. NULL", "", "", "sW"], ["   IS AN ARTIFACT\"", "", "", "sW"]];
  rows.forEach(([a, b, c, k], i) => { s += seg(a, 76, 70 + i * 20, 6, k, 1) + seg(b, 330, 70 + i * 20, 6, "sW", 1) + seg(c, 450, 70 + i * 20, 6, "sM", .9); });
  return s;
};
const NOTE = () => `<rect class="k sW" x="220" y="70" width="200" height="140"/><circle class="hl sR" cx="320" cy="96" r="10"/><circle class="fR" cx="320" cy="96" r="3"/>
  ${segC("THE GRAD STUDENT", 320, 130, 9, "sW", 1.3)}${segC("AND HER LABMATE.", 320, 150, 9, "sW", 1.3)}${segC("BEFORE FRIDAY.", 320, 178, 9, "sR", 1.3)}`;

const INVITE = () => `<rect class="k sW" x="170" y="34" width="300" height="236"/><circle class="hl sR" cx="320" cy="64" r="13"/><circle class="hl sR" cx="320" cy="64" r="5"/><circle class="fR" cx="320" cy="64" r="2"/>
  ${segC("THE NEUROSCIENTIFIC ROUND TABLE", 320, 90, 6.5, "sW", 1)}${segC("IT IS OUR PRIVILEGE TO INVITE YOU", 320, 112, 5.2, "sM", .9)}${segC("TO TAKE A SEAT AT THE TABLE", 320, 124, 5.2, "sM", .9)}
  ${segC("A REVELATION  10 MIN  UNPUBLISHED", 320, 150, 5.2, "sA", .9)}${segC("NO MINUTES  NO PROGRAM  NOT ON YOUR CV", 320, 166, 5.2, "sA", .9)}
  ${segC("MEMBERS RETIRE AT 40", 320, 182, 5.2, "sR", .9)}${segC("REPLY WITH YOUR DATE OF BIRTH", 320, 206, 6, "sW", 1)}
  ${segC("DINNER FRIDAY  WINE  ENTERTAINMENT  B3", 320, 232, 5, "sM", .8)}${segC("ON BEHALF OF THE EDITORIAL BOARD", 320, 252, 4.6, "sD", .8)}`;
const INVITE_TEXT = [
  "\"Dear Colleague. It is our privilege to invite you to take a seat at the Table: a yearly ritual we think you'll find enlightening, entertaining, and unlike any meeting you've ever attended. Some of us have been watching your work for a long time.\"",
  "\"The Table was founded by rebellious young scientists who wanted to speak freely, without the supervision of the Establishment. We have since become the Establishment, which has made speaking freely much easier.\"",
  "\"Each new member gives a REVELATION: ten minutes of your unpublished work, for a room of people who may later review it. We keep no minutes and print no program. Membership is never listed on a CV. Members retire at forty, the empirically determined age at which a scientist comes to prefer quiet agreement to awkward questions.\"",
  "\"In the enlightened spirit of finally stopping something that went on for far too long, slides at the after-dinner roast must now be clean. Mostly. We can provide a receipt describing your attendance as an 'invited talk,' for reimbursement purposes.\"",
  "\"TO ACCEPT: reply with (A) your intention to attend and (B) your date of birth, so we can make sure you aren't wizened. Dinner Friday. Wine. Evening entertainment. On behalf of the Editorial Board, a small and benevolent minority.\"",
];
async function invite(api) {
  await api.readout(INVITE(), "Preston's printer tray. On top of a stack of FOG NEURO drafts: a letter on heavy cream paper, folded twice. The fold lines are soft. He's read it a lot.");
  for (const t of INVITE_TEXT) await api.say(t);
  if (!api.flag("invite")) { api.flag("invite", true); api.score("invite", 3); }
  return "MORRIS|Pal. They asked for his BIRTHDAY.\n\nMORRIS|You know who checks your age before they let you in? Bouncers. And labs that run on rats.";
}

/* ---------------- THE REAL RECORD: three hidden objects that are not fiction ---------------- */
// Not part of the story. Factual notes on the real societies the NRT parodies, in our own words, with sources.
// No private individuals: the 2018 invitation is shown with its sender removed.
const REAL = {
  ap1977: { year: "1977", title: "PSYCHOLOGICAL ROUND TABLE", glyph: (x, y) => `<rect class="sA" x="${x - 18}" y="${y - 24}" width="36" height="48"/><path class="hl sA" d="M${x - 12},${y - 14} L${x + 12},${y - 14} M${x - 12},${y - 8} L${x + 8},${y - 8}"/>`,
    lines: [
      "THE REAL RECORD|This one isn't part of the game. In 1977, American Psychologist printed a letter by the neuroscientist Charles Gross, \"Psychological Round Table in the 1960s,\" about a real society of young experimental psychologists.",
      "THE REAL RECORD|It began in 1936, when young East Coast psychologists started meeting without the supervision of their elders. In the 1950s, a young psychologist could look forward to an invitation as his first important professional honor. Members were men, under forty, from Eastern universities. They met once a year over a weekend to present their research to one another, and they left at forty.",
      "THE REAL RECORD|The Neuroscientific Round Table is invented. The Psychological Round Table is not.\n\nSources: C. G. Gross, American Psychologist (1977); J. Shanteau et al. (eds.), Decision Science and Technology (Kluwer, 1999).",
    ] },
  rocker: { year: "1960s", title: "GUV", glyph: (x, y) => `<path class="sA" d="M${x - 20},${y + 18} C${x - 8},${y + 26} ${x + 8},${y + 26} ${x + 20},${y + 18} M${x - 10},${y + 21} L${x - 8},${y - 2} M${x + 10},${y + 21} L${x + 8},${y - 2} M${x - 9},${y + 4} L${x + 9},${y + 4} M${x + 8},${y - 2} L${x + 10},${y - 24} M${x - 8},${y - 2} L${x - 6},${y - 24} M${x - 6},${y - 20} L${x + 10},${y - 20}"/>`,
    lines: [
      "THE REAL RECORD|Also real. In the early 1960s, Round Table alumni in the Midwest, among them the decision scientist Ward Edwards, founded a version of their own: GUV, the Gesellschaft für Unendliche Versuche. One account calls it \"bad German for 'Society for Endless Research.'\"",
      "THE REAL RECORD|Unlike the East Coast original, GUV admitted women. Members still aged out at forty. One founder was given a miniature wooden rocking chair marked GUV on his fortieth birthday, and decades later was invited back once, as a golden oldie.",
      "THE REAL RECORD|In this game, the Table's creed is endless research. That joke is sixty years old.\n\nSource: J. Shanteau et al. (eds.), Decision Science and Technology: Reflections on the Contributions of Ward Edwards (Kluwer, 1999).",
    ] },
  invite2018: { year: "2018", title: "AN INVITATION", glyph: (x, y) => `<rect class="sW" x="${x - 26}" y="${y - 17}" width="52" height="34"/><path class="sW" d="M${x - 26},${y - 17} L${x},${y + 3} L${x + 26},${y - 17}"/>`,
    lines: [
      "THE REAL RECORD|Real, with the sender's name removed. In 2018, the person who made this game got an emailed invitation to the Psychological Round Table. It still meets every year, and women attend now.",
      "THE REAL RECORD|It explained that everyone is \"unceremoniously ushered out\" at forty, and that new members give \"Revelations\": short talks on unpublished work. No programs are printed, no minutes are kept, and membership is traditionally left off CVs. Crass images, it noted, were \"now verboten.\" A receipt could be provided for reimbursement.",
      "THE REAL RECORD|To accept, you emailed back two things: that you wanted to come, and your date of birth, so they could make sure you weren't \"wizened and aged.\"\n\nSource: a private email, 2018. Quoted in part; sender withheld.",
    ] },
};
async function realRecord(api, id) {
  const r = REAL[id];
  await api.readout(`<rect class="k sW" x="190" y="60" width="260" height="190"/>${chip("FROM THE REAL RECORD", 320 - chipW("FROM THE REAL RECORD", 6) / 2, 74, 6, "fW")}${r.glyph(320, 140)}
    ${segC(r.title, 320, 196, 10, "sW", 1.4)}${segC(r.year, 320, 222, 7, "sA", 1)}`, "THE REAL RECORD|You've found something that isn't fiction.");
  for (const t of r.lines) await api.say(t);
  if (!api.flag("real_" + id)) { api.flag("real_" + id, true); api.score("real_" + id, 1); }
  const n = Object.keys(REAL).filter(k => api.flag("real_" + k)).length;
  return n === 3 ? "THE REAL RECORD|3 OF 3. That's all of it. Everything else in Fechner Hall is made up. Mostly." : `THE REAL RECORD|${n} OF 3.`;
}

/* ---------------- conversations ---------------- */
export const CONVOS = {
  smallLab: { L: "nell", R: "small", lines: [
    ["R", "Ms. Null. Quick chat. Your thermos was found stuck to a magnet with a dead physicist next to it."],
    ["L", "I locked it in the locker. Tess made me. Anyone could have taken it out."],
    ["R", "Anyone could have. That's the problem with anyone. N equals everybody."],
    ["R", "One body, one thermos. Underpowered. I don't arrest people on an N of one."],
    ["L", "Thank you?"],
    ["R", "Don't thank me. I'm collecting data. Don't leave the building."],
  ], after: (api) => { api.flag("smallLab", true); api.refresh(); } },

  gusPlan: { L: "nell", R: "gus", score: ["gusPlan", 1], lines: [
    ["R", "I've been up since Monday. I've read his paper eleven times. It gets worse every time, like a horoscope."],
    ["L", "Gus. Small thinks I did it."],
    ["R", "Then we prove the paper's fake, and the rest follows. Not suspicious. Fake. The kind of fake Ethel Bord can file."],
    { choice: [
      { text: "Where do we start?", lines: [["R", "Table 1. The means are wrong. Not 'surprising', arithmetically wrong. Click me and pick TABLE 1."]] },
      { text: "His figures look too clean.", lines: [["R", "Figure 3. Two participants. Put them side by side on your monitor and tell me they're two people."]] },
      { text: "Where did the layers come from?", lines: [["R", "Somebody burned a lot of GPU. Rex watches the cluster logs like a soap opera. Rex works for coffee. The machine's been broken since 2012."]] },
      { text: "Can we just replicate it?", lines: [["R", "He deposited his raw data. We need his stimulus log, the timing. It's in 116."], ["L", "I can't get into 116."], ["R", "No. But something in your drawer can."]] },
    ], retry: true },
    ["R", "Four things. Then Ethel. Then nobody can say it's a grudge."],
  ], after: (api) => { api.flag("gusPlanned", true); api.flag("morrisHint3", true); } },

  rexFirst: { L: "nell", R: "rex", score: ["rexTalk", 1], lines: [
    ["R", "Ninth year. Do you know what a ninth-year postdoc is? It's a grad student with a mortgage."],
    ["L", "Rex, I need to know who's been using the GPU cluster."],
    ["R", "Oh, I know. I watch the job queue the way other people watch birds. I could tell you things."],
    ["R", "For a coffee. A real one. From that."],
    ["L", "That machine says DESCALE."],
    ["R", "It has said DESCALE since 2012. I've watched three chairs and two coups. It'll say DESCALE at my funeral."],
  ], after: (api) => api.flag("rexAsked", true) },

  rexCoffee: { L: "nell", R: "rex", score: ["rexCoffee", 2], lines: [
    ["R", "Is that… is that from the machine?"],
    ["L", "Descaled. With an energy drink."],
    ["R", "pH 2.4. Of course. Nine years. Nine years and the answer was in a grad student's backpack."],
    ["R", "Here. My login. Look up PVALU. Look at what runs Fridays at midnight."],
    ["R", "And Nell? There's a secret society in this building. Under forty. I applied at thirty-nine and eleven months."],
    ["L", "What happened?"],
    ["R", "They sent me a letter. Lovely letter. Cream paper. 'Reply with your date of birth.' So I did."],
    ["R", "They wrote back one word. 'Wizened.' I was thirty-nine and eleven months. Nobody believes me. Enjoy your coffee. My coffee."],
  ], after: (api) => { api.take("coffee"); api.give("login"); api.flag("rexLogin", true); } },

  dana: { L: "nell", R: "dana", score: ["danaTalk", 1], lines: [
    ["R", "You're Nell. You asked about the 7T. That was the best thing that's happened in this lab in three years."],
    ["L", "You work with Preston."],
    ["R", "I work near Preston. He's never in before noon. And every Friday he leaves at 11:40 PM with a garment bag."],
    ["R", "I followed him once. He took the elevator down. The elevator doesn't go down that far, Nell. I checked. It goes to B1."],
    ["L", "So where—"],
    ["R", "That's what I'm going to find out. This Friday."],
  ], after: (api) => api.flag("danaTalked", true) },

  smallDana: { L: "nell", R: "small", lines: [
    ["R", "Dana Outlier. Preston's labmate. Found in the recycling. The bin says EXCLUDED."],
    ["L", "She was going to follow him. On Friday. She told me this morning."],
    ["R", "Then you were the last person she talked to. That's two bodies, Ms. Null, and you're adjacent to both."],
    ["R", "Two bodies. Still underpowered."],
    ["R", "But I'm not stopping data collection."],
  ], after: (api) => { api.flag("danaClosed", true); api.refresh(); } },

  prestonHall: { L: "nell", R: "preston", score: ["prestonBlank", 2], lines: [
    ["R", "Nell! So sorry about your thermos. Thermoses! Am I right? Listen, I've just solved free will."],
    ["L", "Since yesterday?"],
    ["R", "Since lunch. It's in the angular gyrus. Nature Neuro has it. Well, Nurture. Same thing."],
    ["L", "Preston, where do you go on Friday nights?"],
    ["R", "Friday I'm giving a Revelation. It's like a talk, but nobody writes it down. That's what makes it so…", "blank"],
    ["R", "…for endless research. That's what fog neuro is all—", "blank"],
    ["R", "Cog. Cog neuro. Ha! Long week. Let's grab coffee. The machine's broken. Ha!"],
  ], after: (api) => { api.flag("prestonTalked", true); if (api.has("recorder")) api.flag("taped", true); } },

  ethelEarly: { L: "nell", R: "ethel", lines: [
    ["R", "Shh. If you have an integrity concern, you'll need evidence. Not feelings. Evidence."],
    ["L", "How much evidence?"],
    ["R", "Enough that I can file it. In a binder. Binders don't have feelings either."],
  ] },
  ethelNew: { L: "nell", R: "ethel", score: ["ethelFile", 2], lines: [
    ["L", "Impossible means in Table 1. Figure 3b and 3d are the same panel, flipped. Four thousand GPU-hours of 'super-resolution'. And the replication: attention does nothing in V1."],
    ["R", "…"],
    ["R", "That's a binder. That's a whole binder."],
    ["R", "Misconduct in this department is raised at the faculty meeting, under New Business. Today. Three o'clock. Third floor."],
    ["L", "I'm a grad student."],
    ["R", "Then you're the student representative. As of now. I'm taking the minutes. Sit near the door."],
  ], after: (api) => { api.flag("meetingOpen", true); } },
  ethelAfter: { L: "nell", R: "ethel", lines: [
    ["R", "Forty minutes. Nobody moved to adjourn. I read the agenda twice."],
    ["L", "Ethel, they were nodding at a dead man."],
    ["R", "They've been nodding at him for thirty years. I just never had the minutes to prove it."],
    ["R", "Go to the fourth floor. The office at the end of the hall, past the broken light. There's a woman there who has been saying this since 1977."],
  ], after: (api) => { api.flag("irisOpen", true); } },

  irisMeet: { L: "nell", R: "iris", lines: [
    ["R", "You took the stairs. Good. The elevator listens."],
    ["L", "You're the woman from journal club. Back row. 'And who reviewed it?'"],
    ["R", "Since 1961. Nobody ever answers. Sit down. Not that chair, that's for the staple gun."],
    ["R", "Iris Candor. Professor Emerita. I helped build the magnet under this building, and then I helped some people leave the table that was sitting around it."],
  ], after: (api) => { api.flag("irisNamed", true); } },
  irisTruth: { L: "nell", R: "irisNamed", score: ["irisTruth", 3], lines: [
    ["L", "What table?"],
    ["R", "The Neuroscientific Round Table. Under forty, officially. Six on the Board; they call themselves the Editorial Board, and the members call them the Secret Six."],
    ["R", "Members review each other kindly and everyone else as Reviewer 2. They never write it on a CV. They never tell anyone where they go on Fridays."],
    ["R", "At forty, you retire. Not from the job. From the table. They turn your gain to zero, and you sit in faculty meetings nodding for the rest of your career."],
    ["L", "The nodding. Two back."],
    ["R", "The Echo. We did it in 1962 with sherry."],
    ["R", "My invitation came on cream paper, too. They wanted my date of birth, to make sure I wasn't 'wizened.' And a Revelation: ten minutes of my unpublished work, read to a room of men who would review it the following spring."],
    ["R", "No minutes. No program. Never on your CV. They call that informality. It's the opposite of a record. It's how you make sure nothing ever happened."],
    ["L", "The invitation Morris found says women have always been welcome."],
    ["R", "'As long as anyone can remember.' I remember, dear. It was 1974. I was the reason."],
    ["R", "And it's not only here. There's a chapter in the Midwest that gave itself a German name: the Society for Endless Experiments. In German it sounds like a learned society instead of a drinking club. That's the trick, every time."],
    { choice: [
      { text: "Why are they killing people?", lines: [["R", "Because people noticed. Tess saw the power draw. Dana was going to follow him. Quorum isn't dead, by the way. Nobody checked his pulse for forty minutes."]] },
      { text: "What does this have to do with me?", correct: true, lines: [
        ["R", "Every year they choose a quarry. Someone promising. Unconnected. Then they close ranks: Reviewer 2, triaged grants, job searches that go cold."],
        ["R", "Your paper was sent to Impact. Impact gave it to his student. That was the student's test."],
        ["R", "You're this year's quarry, dear. Your paper didn't get rejected."],
        ["R", "You got selected."],
      ] },
    ], retry: true },
    ["L", "…"],
    ["R", "Go home. Lock your door. And tell that labmate of yours to stop wandering around the basement at night."],
  ], after: (api) => { api.flag("irisDone", true); } },
};

/* ---------------- vents (Morris) ---------------- */
const VENTS = [["lab", "ADLINE LAB 114"], ["hall", "HALLWAY 1F"], ["office", "MAIN OFFICE 1F"], ["kitchen", "COFFEE KITCHEN 1F"], ["impact", "IMPACT LAB 116"]];
const ARRIVE = {
  kitchen: "REX|A rat. Great. Even the rats in this building have tenure.",
  impact: "MORRIS|Pal, this place smells like incense and money. And my head itches like crazy.",
};
async function vent(api) {
  const d = await api.chooseFrom("MORRIS TAKES THE VENTS. WHERE TO?", VENTS.filter(([id]) => id !== api.G.room));
  if (!d) return null;
  api.goRoom(d + "@vent"); api.blip([300, 500, 700]);
  const k = "arrive3_" + d; if (ARRIVE[d] && !api.flag(k)) { api.flag(k, true); return ARRIVE[d]; }
  return null;
}
const ventHS = { label: "vent", morris: { look: "A vent. Morris's highway.", use: vent }, day: { look: "A low vent grille. Morris-sized." },
  night: { look: "A vent. Somewhere in it, faintly: chanting. Gus decides that's the pipes." } };

/* ---------------- the stairwell ---------------- */
async function stairs(api) {
  const f = api.G.flags, night = api.G.mode === "night";
  const o = [["server", "B1  GPU SERVER ROOM"]];
  if (!night) {
    o.push(["ethics", "2F  RESEARCH INTEGRITY"]);
    if (f.meetingOpen) o.push(["conference", "3F  FACULTY MEETING"]);
    if (f.irisOpen) o.push(["iris", "4F  EMERITUS OFFICE"]);
  }
  o.push(["mri", "B1  MRI SUITE"]);
  const d = await api.chooseFrom("THE STAIRWELL. WHERE TO?", o);
  if (!d) return null;
  if (d === "mri") return night ? "Gus won't go back in there tonight. Not where Tess was." : "Police tape across the MRI suite. DET. SGT. SMALL has drawn a little power curve on it.";
  if (d === "conference" && f.quorumDead) return "The meeting's still going. You can hear the motions through the stairwell door. You can't hear the nodding, but you can feel it.";
  api.goRoom(d + "@fromStairs"); return null;
}

/* ---------------- minigames ---------------- */
async function doGrim(api) {
  if (api.flag("proofGrim")) return "GUS|Three impossible means out of six. I'd frame it, but frames are evidence too.";
  const r = await api.mini(grim, { score: api.score });
  if (!r.done) return "GUS|Take your time. Table 1 isn't going anywhere. It can't. It's impossible.";
  api.flag("proofGrim", true); api.score("proofGrim", 2);
  return "GUS|Nineteen people, whole numbers. Those three means can't exist. This is called a GRIM test, Nell. Granularity. Nobody checks. That's why it works.";
}
async function doOverlay(api) {
  if (api.flag("proofOverlay")) return "Participant 7 and participant 12. One brain, two names.";
  const r = await api.mini(overlay, { score: api.score });
  if (!r.matched) return "Not yet. They're the same. You can feel it. You need to see it.";
  api.flag("proofOverlay", true); api.score("proofOverlay", 2); return null;
}
async function doGLM(api) {
  if (api.flag("proofGLM")) return "ATTEND = IGNORE. You don't need to run it again. You'll run it again tonight anyway.";
  if (!api.has("log")) return "GUS|We need his timing. The stimulus log. It's in 116.";
  await api.say("Gus rolls his chair over. He has the raw data. You have Preston's log. Time to replicate the Big Finding.");
  await api.mini(glm, { score: api.score, die: async (t) => { await api.die(t); return "revise"; } }, "glmwrap");
  api.flag("proofGLM", true); api.score("proofGLM", 2); api.take("log");
  return "GUS|It's not a small effect. It's no effect.\n\nNELL|So the fancy layers?\n\nGUS|Painted on.";
}
async function monitor(api) {
  const o = [["fig", "FIGURE 3: TWO PARTICIPANTS"]];
  if (api.has("log") || api.flag("proofGLM")) o.push(["glm", "THE REPLICATION"]);
  const d = o.length === 1 ? "fig" : await api.chooseFrom("NELL'S MONITOR", o);
  if (!d) return null;
  return d === "fig" ? doOverlay(api) : doGLM(api);
}
async function meeting(api) {
  if (api.flag("quorumDead")) return "The meeting goes on without a chair. Or with one. It's hard to tell.";
  await api.say("You sit. Gus slides in beside you. Quorum raps the table, once.\n\nQUORUM|We'll take New Business at the end. As always. Ethel, the first motion.");
  const r = await api.mini(nod, { score: api.score, onPose: (i) => api.pose("vote", i), onQuorum: () => { api.flag("quorumDead", true); api.G.bodies = 3; api.refresh(); } }, "nodmode");
  api.flag("nodDone", true);
  await api.say(`NELL|My d′ was ${r.dprime.toFixed(1)}. Theirs was higher. They weren't even listening.\n\nGUS|They weren't conscious, Nell.`);
  await api.convo("ethelAfter");
  return null;
}

/* ---------------- hotspots ---------------- */
const officeFlavor = (t) => ({ day: { look: t }, morris: { look: t } });
export const HS = {
  lab: {
    door: { label: "door to hallway", day: { look: "The hallway.", go: "hall@fromLab" }, morris: { look: "A door.", go: "hall@fromLab" }, night: { look: "The hallway.", go: "hall@fromLab" } },
    monitor: { label: "your monitor", day: { look: "Your monitor. Figure 3 of the Big Finding is open, and has been since 6 AM.", use: monitor },
      morris: { look: "Morris walks across the keyboard. Figure 3 rotates. Morris looks at you like he did it on purpose." },
      night: { look: "Nell's monitor, still on: ATTEND = IGNORE, in her handwriting, on a sticky note." } },
    drawer: { label: "desk drawer", day: { look: "Your drawer. Morris's bedding, a ramen packet, and Preston's Rising Stars headshot with the eyes cut out. That was Morris." },
      morris: { look: "Home.", use: "Morris naps for four seconds. Refreshed." }, night: { look: "Nell's drawer. Something in it is snoring." } },
    whiteboard: { label: "whiteboard", day: { look: "DID HE RUN ANYONE? has been crossed out. Underneath, bigger: IS ANY OF IT REAL?" }, morris: { look: "Morris judges it from below." },
      night: { look: "IS ANY OF IT REAL? And under it, in Gus's hand: NO." } },
    adline: { label: "Prof. Adline's office", day: { look: "AFTER THE 15TH.", talk: "PROF. ADLINE (THROUGH THE DOOR)|Nell! I heard about the thermos! Can it wait until after the fifteenth?" },
      morris: { look: "Scribbling, inside." }, night: { look: "Dark. Even grant panic sleeps." } },
    booth: { label: "dark booth", day: { look: "The dark booth.", use: (api) => api.die("You sit in the dark booth, just to think for a minute.\n\nYou wake up a ninth-year postdoc. Rex brings you a coffee. He seems pleased.") },
      morris: { look: "MORRIS|No." }, night: { look: "The dark booth. Gus doesn't need it to be dark. Gus is dark." } },
    gusdesk: { label: "Gus's desk", day: { look: "Gus's desk. Four empty cans of NULL HYPOTHESIS and one full one, his emergency can.",
        use: (api) => { if (api.has("can") || api.flag("descaled")) return "GUS|That's my last one. Don't make it weird."; api.give("can"); api.flag("gotDrink", true); api.refresh(); api.score("can", 1);
          return "You take Gus's emergency can.\n\nGUS|That's my emergency can.\n\nNELL|This is an emergency.\n\nGUS|…pH 2.4. Don't drink it. Nobody should drink it. I drink it."; } },
      morris: { look: "Morris sniffs the cans. His whiskers curl." }, night: { look: "His own desk. He hasn't sat at it since Monday." } },
    gus: { label: "Gus", day: { look: "Gus Ian. Awake since Monday. Same cardigan. His eyes have the steady, unblinking calm of a man who has seen the raw data.",
        talk: (api) => api.flag("gusPlanned") ? gusHint(api) : "c:gusPlan", use: doGrim },
      morris: { look: "MORRIS|This guy's all right, pal. He doesn't scream when he sees me. He just nods and says 'rat.'" } },
    small: { label: "Det. Sgt. Small", day: { look: "Det. Sgt. Small, by the door, doing a power calculation in his notebook.", talk: "c:smallLab" } },
    vent: ventHS,
  },

  hall: {
    door101: { label: "Seminar Room 101", day: { look: "Seminar 101. A sign on the door: FRIDAY 2 PM: NELL NULL, DEFENSE. Under it: FRIDAY 2 PM: P. VALU, JOB TALK. Same room.", go: "Locked." },
      morris: { look: "No pizza today." }, night: { look: "101. Dark.", go: "Locked." } },
    fountain: { label: "water fountain", day: { look: "1962.", use: "You drink. It tastes like a decade." }, morris: { look: "Too high." }, night: { look: "Humming.", use: "Gus drinks." } },
    stars: { label: "Rising Stars wall", day: { look: "Preston's photo is bigger again. CITATIONS 147,794. Every face on this wall is under forty. You've never noticed that before. Nobody over forty has ever been a Rising Star. Where do they set?", score: { look: ["stars3", 1] } },
      morris: { look: "MORRIS|My head itches just looking at it." }, night: { look: "Preston's photo, smiling in the dark." } },
    board: { label: "bulletin board", day: { look: "A new flyer: FACULTY MEETING, WEDNESDAY 3 PM, 3F. NEW BUSINESS (IF TIME)." }, night: { look: "The flyers, in the dark." } },
    impact: { label: "Impact Lab 116", day: { look: "IMPACT LAB 116. Locked. Preston isn't in it; he's out here, networking at nobody. Under the door, a gap. A vent beside it.", use: "123456. The keypad sighs, again." },
      morris: { look: "MORRIS|Vent's my door, pal." }, night: { look: "116. Locked. Gus already knows what's inside.", go: "Not tonight. The keypad knows his face now." } },
    tube: { label: "tube station", day: { look: "Canisters going down. More of them today. One goes by with a black band on it, like a mourning armband." },
      night: { look: "A canister goes down. Then another. Then a rattle, very far below, like a gavel." } },
    stairs: { label: "stairwell", day: { look: "The stairwell. B1, 2F, 3F, 4F.", go: stairs }, morris: { look: "Morris does vents." },
      night: { look: "The stairwell. The server room is down.", go: stairs } },
    office: { label: "main office", day: { look: "The main office. BACK IN 5 MIN.", go: "office@fromHall" }, morris: { look: "Vent." }, night: { look: "Dark.", go: "Locked." } },
    lab: { label: "Adline Lab 114", day: { look: "Your lab.", go: "lab@fromHall" }, morris: { look: "Home.", go: "lab@fromHall" }, night: { look: "The Adline Lab.", go: "lab@fromHall" } },
    kitchen: { label: "coffee kitchen", day: { look: "The coffee kitchen. Someone in there is sighing at an appliance.", go: "kitchen@fromHall" }, morris: { look: "Food smells. Vent.", go: "kitchen@fromHall" },
      night: { look: "The kitchen. Dark.", go: "kitchen@fromHall" } },
    dana: { label: "Dana Outlier", day: { look: "Dana Outlier, Preston's labmate. One strand of hair stands straight up, defying every model. She's watching 116 like it owes her a thesis.", talk: "c:dana" },
      morris: { look: "MORRIS|She smells like a bike. I like her." } },
    bin: { label: (api) => api.flag("danaGone") ? "recycling bin (EXCLUDED)" : "recycling bin", day: { look: (api) => api.flag("danaGone")
        ? "The recycling bin, labeled EXCLUDED. A pair of sneakers sticks out of it. Police tape. Dana followed Preston a day early." : "A recycling bin, labeled EXCLUDED. Mostly rejected drafts." },
      morris: { look: "Morris won't go near it." }, night: { look: "The bin, taped off. Gus doesn't look at it." } },
    small: { label: "Det. Sgt. Small", day: { look: "Det. Sgt. Small, by the bin. He's recalculating.", talk: "c:smallDana" } },
    preston: { label: "Preston Valu", day: { look: "Preston, by his own photo, networking with no one. His earbuds glow. Every few seconds his smile goes out like a bad bulb, then comes back on.", talk: "c:prestonHall" },
      morris: { look: "MORRIS|Pal. PAL. My head. It's him. It's coming from his ears.", score: { look: ["itchPreston", 2] } } },
    vent: ventHS,
  },

  office: {
    penny: { label: "Penny Ledger", day: { look: "Penny, on three phones. One is about Dana.", talk: (api) => api.flag("pennyReceipts") ? "PENNY|Not now, hon. I'm on the condolence cards with the boat."
        : (api.flag("pennyReceipts", true), "PENNY|Not now, hon. Two in two days. I'm out of the good condolence cards.\n\nPENNY|And it's reimbursement season. Every fall, the same six faculty file an 'invited talk' at a venue with no address. Friday dinner, wine, 'evening entertainment.' The receipt is always the same template. I approve them. It's a form.") } , morris: { look: "Penny sees Morris. Penny sighs. Penny files something." } },
    forms: { label: "form rack", ...officeFlavor("Forms. There's a new one: FORM D-1, BEREAVEMENT (COLLEAGUE). The slot's half empty already.") },
    mailboxes: { label: "mailboxes", ...officeFlavor("Preston's mailbox is overflowing. Dana's is empty. Someone already cleaned it out.") },
    cabinet: { label: "P.O. cabinet", ...officeFlavor("Purchase orders. Still no coil.") },
    printer: { label: "printer", ...officeFlavor("PC LOAD LETTER. Morris's repair didn't last. Nothing does.") },
    sign: { label: "sign", ...officeFlavor("BACK IN 5 MIN.") },
    door: { label: "door to hallway", day: { look: "The hallway.", go: "hall@fromOffice" }, morris: { look: "Door.", go: "hall@fromOffice" } },
    vent: ventHS,
  },

  ethics: {
    ethel: { label: "Ethel Bord", day: { look: "Ethel Bord, among her binders. Today she has a black one.", talk: (api) => proofs(api) === 4 ? (api.flag("meetingOpen") ? "ETHEL|Three o'clock. Third floor. New Business. Sit near the door." : "c:ethelNew") : "c:ethelEarly" } },
    index: { label: "Binder of Binders", day: { look: "The Binder of Binders. There's now an entry for VALU, P.: SEE ALSO: CONCERNS (PENDING)." } },
    shelfA: { label: "shelf A", day: { look: "Binders A to F." } }, shelfB: { label: "shelf B", day: { look: "Binders G to M." } }, shelfC: { label: "shelf C", day: { look: "Binders N to Q." } },
    shelfR: { label: "shelf R", day: { look: "RISING STARS (SPECIAL). R-12's gap is still there." } },
    stool: { label: "step stool", day: { look: "The step stool. It's seen things." } },
    window: { label: "window", day: { look: "The quad. Two campus police cars, parked at an angle that suggests a small sample size." } },
    door: { label: "door to the stairs", day: { look: "The stairwell.", go: "hall@fromStairs" } },
  },

  impact: {
    log: { label: "stimulus log", day: { look: "A binder on Preston's desk: STIMULUS LOG, BIG FINDING. Locked room, open binder." },
      morris: { look: "The binder Gus wants. It's bigger than Morris. Most things are.",
        use: (api) => { api.flag("gotLog", true); api.give("log", "nell"); api.score("gotLog", 2); api.refresh();
          return "Morris gets his teeth into the binder's spine and backs into the vent.\n\nForty feet of ductwork later, it drops into Nell's desk drawer with a thump.\n\nMORRIS|Delivered, pal. Tell Gus I want co-authorship."; } } },
    pc: { label: "Preston's PC", day: { look: "Preston's PC. Logged in, as always. FOG NEURO is minimized. The taskbar shows 41 papers in progress." },
      morris: { look: "MORRIS|Gus already did the computer. I do binders.", use: "Morris walks across the keyboard. A paper on the neural basis of brunch appears. Morris backs away." } },
    gainpanel: { label: "second monitor", day: { look: "The second monitor. A dial and a green bar. The bar pulses." },
      morris: { look: "Morris's head itches so hard his ear folds over. The green bar pulses in time with it.", use: (api) => api.die("Morris paws the dial.\n\nSomewhere in the building, Preston recites the Methods section of every paper ever written. So does Morris. He's still going.") } },
    printer: { label: "printer", day: { look: "Preston's printer. It works. Of course it works." },
      morris: { look: "Preston's printer. The output tray has a stack of drafts, and on top, something on heavy cream paper.", use: invite } },
    oat: { label: "oat synergy", day: { look: "Adaptogenic oat synergy." }, morris: { look: "MORRIS|I'm not drinking that, pal. I eat garbage. I have standards." } },
    poster: { label: "poster", day: { look: "SYNERGY." }, morris: { look: "SYNERGY. Morris doesn't know what it means. Neither does anyone." } },
    door: { label: "door", morris: { look: "Locked from the inside. Morris could open it, if he had thumbs or ambition." } },
    vent: ventHS,
  },

  kitchen: {
    rex: { label: "Dr. Rex Jected", day: { look: "Dr. Rex Jected, ninth-year postdoc, leaning on the counter with an empty mug, staring at the espresso machine like it's a grant he didn't get.",
        talk: (api) => api.has("coffee") ? "c:rexCoffee" : api.flag("rexLogin") ? "REX|There's a society, Nell. Under forty. Nobody believes me." : api.flag("rexAsked") ? "REX|Coffee. From the machine. Then we talk." : "c:rexFirst" },
      morris: { look: "REX|Don't. Don't even, rat." } },
    espresso: { label: "espresso machine", day: { look: (api) => api.flag("descaled") ? "The espresso machine. READY. A green light nobody in this building has ever seen." : "The espresso machine. A blinking chip: DESCALE. Rex says it's said that since 2012.",
        use: (api) => api.flag("descaled") ? (api.has("mug") ? brew(api) : "It's ready. You need a mug.") : "DESCALE. It won't do anything else. It's been waiting for someone to listen." },
      morris: { look: "MORRIS|There's fourteen years of limescale in there, pal. I can hear it." }, night: { look: "The espresso machine, READY in the dark." } },
    mugs: { label: "mug tree", day: { look: "The mug tree. WORLD'S OKAYEST PI. I ♥ P < .05. A mug shaped like a brain that nobody uses.",
        use: (api) => { if (api.has("mug") || api.has("coffee") || api.flag("rexLogin")) return "One mug at a time. Kitchen rules."; api.give("mug"); api.flag("gotMug", true); api.refresh(); return "You take WORLD'S OKAYEST PI."; } },
      morris: { look: "Morris can't reach." } },
    fridge: { label: "fridge", day: { look: "The fridge. A note: DO NOT DRINK — SAMPLE. On a carton of oat milk.", use: (api) => api.die("You drink the oat milk. It wasn't oat milk.\n\nYou are now part of somebody's control group. Your data will be excluded.") },
      morris: { look: "MORRIS|I've been in there. Don't." } },
    board: { label: "corkboard", day: { look: "WHO TOOK MY OAT SYNERGY. CLEAN YOUR MUG (THIS MEANS YOU, P.V.). And a typed card: WHO KEEPS BOOKING THE OLD B-LEVEL ROOM ON FRIDAYS? Nobody's answered." },
      morris: { look: "Too high." } },
    invite2018: { label: "a folded card", day: { look: (api) => realRecord(api, "invite2018") }, morris: { look: (api) => realRecord(api, "invite2018") },
      night: { look: (api) => realRecord(api, "invite2018") } },
    sink: { label: "sink", day: { look: "The sink. A geological record of mugs." }, morris: { look: "Morris drinks from the drip. Morris is fine." } },
    door: { label: "door to hallway", day: { look: "The hallway.", go: "hall@fromKitchen" }, morris: { look: "Door.", go: "hall@fromKitchen" }, night: { look: "The hallway.", go: "hall@fromKitchen" } },
    vent: ventHS,
  },

  server: {
    terminal: { label: "terminal", day: { look: "A terminal on a cart. LOGIN:", use: (api) => logs(api) },
      morris: { look: "Morris can't type. He's tried." }, night: { look: "The terminal. Nell left Rex's login stuck to it. Gus peels it off and eats it. Operational security." } },
    racks: { label: "GPU cluster", day: { look: "The department GPU cluster. 31 degrees in here. The fans sound like a stadium." },
      night: { look: "The cluster, working hard at 2 AM on a Wednesday. Somebody's running something big. It's not Friday yet." } },
    ltm: { label: "rack marked LTM", day: { look: "One rack apart from the others, labeled LTM. A tiny sticker on it: a circle seated around a smaller circle.",
        use: (api) => api.die("You type: WRITE MY DISSERTATION.\n\nIt's beautiful. 300 pages. 412 references. It thanks your advisor by name.\n\nYour committee looks up reference 1. It's by Quorum, 1979b. It doesn't exist.\n\nYour thesis has been retracted before it was submitted.") },
      night: { look: "The LTM rack. Its lights blink in a slow pattern. Gus counts them. Two, then one, then two." } },
    thermostat: { label: "thermostat", day: { look: "31°C. Someone has written GPUS LIKE IT HOT on the wall next to it." }, night: { look: "31°C." } },
    equip: { label: "equipment room door", day: { look: "MRI EQUIPMENT · CHILLED WATER. Authorized personnel. Gus is authorized. Gus is asleep at his desk.", go: "Locked. Gus has the badge." },
      night: { look: "MRI EQUIPMENT · CHILLED WATER. A puddle seeps under the door. That's the leak in Gus's scan. It's running somewhere it shouldn't.", go: "tunnels@fromServer" } },
    door: { label: "door to the stairs", day: { look: "The stairwell.", go: "hall@fromStairs" }, night: { look: "The stairwell.", go: "hall@fromStairs" } },
    vent: ventHS,
  },

  tunnels: {
    bricked: { label: "bricked-up doorway", night: { look: "A doorway, bricked up. Scratched into the bricks: a circle seated around a smaller circle. Through the mortar, voices, all together: THE AUTHORS SHOULD CONSIDER… THE AUTHORS SHOULD CONSIDER…",
        use: (api) => api.die("Gus knocks.\n\nThe chanting stops.\n\nA brick slides out. A hooded face. A voice, kindly: 'The authors are invited to resubmit. In person.'\n\nGus is never seen at 2 AM again.") } },
    tube: { label: "tube line", night: { look: "The pneumatic tube line along the ceiling. It runs toward the bricked door and through it.",
        use: (api) => { if (api.flag("canisterLive")) return "Rattling. Closer. Get the hatch."; api.flag("canisterLive", true); api.refresh();
          return "Gus puts his ear to the tube. Silence. Then, very far away and getting closer: a rattle.\n\nSomething's coming down."; } } },
    hatch: { label: "access hatch", night: { look: "An access hatch on the tube, at shoulder height. Stenciled: 1962.",
        use: async (api) => {
          if (!api.flag("canisterLive")) return "Gus opens the hatch. Empty tube. He closes it. Better to wait for a rattle.";
          api.flag("hatchOpen", true); api.flag("canisterLive", false); api.refresh();
          await api.say("Gus throws the hatch open and gets his hand in the tube just as the rattle arrives.\n\nA canister, warm from the run. Black band. Inside, an index card, typed.");
          await api.readout(NOTE(), "THE GRAD STUDENT AND HER LABMATE. BEFORE FRIDAY.");
          api.score("canister", 3);
          await api.say("GUS|…\n\nGUS|Labmate.\n\nGus puts the card in his cardigan, closes the hatch very gently, and walks back the way he came, not quickly, the way you walk past a dog.");
          await api.say("Nell's phone buzzes at 2:31 AM. A photo of an index card. Then:\n\nGUS: don't come in early\nGUS: actually don't come in\nGUS: I'll be at my desk");
          api.endAct(); return null; } } },
    pipes: { label: "pipes", night: { look: "Steam pipes, chilled-water pipes, and one pipe nobody can identify. The chilled-water line has been tapped. It runs into the brick." } },
    valve: { label: "big red valve", night: { look: "A huge red valve wheel. Nothing on it is labeled. Everything about it says: don't.", use: "Gus turns it a quarter. Somewhere above, a radiator in the faculty lounge begins to scream. He turns it back." } },
    back: { label: "back to the server room", night: { look: "Back to the server room.", go: "server@fromTunnels" } },
  },

  conference: {
    quorum: { label: "Prof. Quorum", day: { look: (api) => api.flag("quorumDead") ? "Prof. Quorum, face down on the agenda. His cufflinks are still lit." : "Prof. Quorum, Department Chair. Bow tie. White hair. Officially thirty-nine. His cufflinks are small round tables.",
        talk: (api) => api.flag("quorumDead") ? "He doesn't answer. Nobody else notices." : api.die("QUORUM|Ms. Null! Just the person. We need a student on the Curriculum Committee.\n\nYou open your mouth. The motion carries.\n\nYou have been appointed to the Curriculum Committee. Your research career is over.") } },
    faculty: { label: "senior faculty", day: { look: (api) => api.flag("quorumDead") ? "Six senior faculty, nodding on schedule around a dead chair." : "Six senior faculty. They nod in perfect unison, every so often, then go still. Tenure does that to a person. Something does." } },
    ethel: { label: "Ethel Bord", day: { look: "Ethel, taking the minutes. In a binder.", talk: (api) => api.flag("quorumDead") ? "c:ethelAfter" : "ETHEL|Shh. Sit near the door." } },
    gus: { label: "Gus", day: { look: "Gus, in a borrowed tie, already watching the faculty.", talk: "GUS|Watch their heads, not his mouth." } },
    agenda: { label: "agenda", day: { look: "AGENDA. 1-14: MOTIONS. 15: NEW BUSINESS (IF TIME). There's never time." } },
    seat: { label: "student rep chair", day: { look: "The student representative's chair. It has never been sat in.", use: meeting } },
    urn: { label: "coffee urn", day: { look: "A coffee urn. Faculty coffee. Nobody drinks it, which is the only reason everyone's still alive.", use: "It's empty. It has always been empty." } },
    door: { label: "door to the stairs", day: { look: "The stairwell.", go: "hall@fromStairs" } },
  },

  iris: {
    iris: { label: (api) => api.flag("irisNamed") ? "Prof. Iris Candor" : "the old woman", day: { look: (api) => api.flag("irisNamed") ? "Iris Candor, 88. Her staple gun is never more than a foot from her hand." : "The old woman from journal club. Back row, since 1961.",
        talk: (api) => api.flag("irisDone") ? "IRIS|Go home, dear. Lock your door." : api.flag("irisNamed") ? "c:irisTruth" : "c:irisMeet" } },
    stacks: { label: "journals", day: { look: "Towers of journals from 1961 on. Every issue. Some of the reviewer names are underlined. Some are circled. A few are crossed out." } },
    manual: { label: "magnet manual", day: { look: "A fat manual: SUPERCONDUCTING RING, OPERATOR'S GUIDE, 1968. The margins are full of handwriting. Hers.", score: { look: ["manual", 1] } } },
    photo: { label: "photograph", day: { look: "1968. A young woman in safety goggles next to a ring magnet as big as a room, grinning like she's just won an argument.", score: { look: ["photo68", 1] } } },
    letter: { label: "framed letter", day: { look: (api) => "A framed letter, 1977, from a journal's correspondence section. About secret societies in science, in very careful language. Signed: I. Candor. Nobody answered it."
      + (api.flag("irisDone") ? "\n\nTucked behind the frame, yellowed: a cream-colored invitation. Reply with your date of birth." : "") } },
    stapler: { label: "staple gun", day: { look: "A staple gun. Loaded.", use: "IRIS|Don't." } },
    ap1977: { label: "one issue, sticking out", day: { look: (api) => realRecord(api, "ap1977") }, morris: { look: (api) => realRecord(api, "ap1977") } },
    rocker: { label: "something small on the sill", day: { look: (api) => realRecord(api, "rocker") }, morris: { look: (api) => realRecord(api, "rocker") } },
    kettle: { label: "kettle and sherry", day: { look: "An electric kettle, and a sherry bottle labeled 1962." } },
    door: { label: "door to the stairs", day: { look: "The stairwell.", go: "hall@fromStairs" } },
  },
};

function gusHint(api) {
  const f = api.G.flags;
  if (!f.proofGrim) return "GUS|Table 1 first. Click me, TABLE 1.";
  if (!f.proofOverlay) return "GUS|Figure 3. Your monitor. Make the two participants agree.";
  if (!f.proofLogs) return f.rexLogin ? "GUS|You have Rex's login. Server room, B1." : "GUS|Rex. Kitchen. Coffee. My can is for emergencies." + (f.descaled ? "" : " This is an emergency.");
  if (!f.proofGLM) return api.has("log") ? "GUS|You have the log. Your monitor." : "GUS|The log's in 116. Your drawer has a rat. I'm just saying.";
  return "GUS|That's four. Ethel. Second floor.";
}
function brew(api) {
  api.take("mug"); api.give("coffee"); api.score("brewed", 1);
  return "You put WORLD'S OKAYEST PI under the spout and press the button.\n\nThe machine thinks about it. Then, for the first time since 2012, it makes an espresso.\n\nREX|…Oh.\n\nREX|Oh, that's beautiful.";
}
async function logs(api) {
  if (api.flag("proofLogs")) { await api.readout(JOBS(), "PVALU. 4,012 GPU-hours of super-resolution on one subject. And every Friday at midnight: ltm_generate.py, reading from /mnt/B3/archive."); return null; }
  if (!api.has("login")) return "LOGIN: _\n\nYou try 'admin.' You try 'password.' You try 'preston.' The cursor waits, like a reviewer.";
  await api.readout(JOBS(), "USER: PVALU. 4,012 GPU-hours of superres_laminar.py, all on one subject, sub-01: 3T in, 7T out, six layers.\n\nAnd a job that runs every Friday at 00:00: ltm_generate.py --corpus /mnt/B3/archive --byline \"P. Valu.\" Forty drafts in the queue, dated next year. One is called \"The Null Result of N. Null Is an Artifact.\"");
  api.flag("proofLogs", true); api.score("proofLogs", 3); api.take("login");
  return "NELL|B3. There's no B3.\n\nNELL|And he's already written the paper that says I'm wrong. For next year.";
}

export const WITH = {
  "kitchen.espresso": {
    can: (api) => { api.take("can"); api.flag("descaled", true); api.score("descaled", 2); api.refresh();
      return "You pour Gus's NULL HYPOTHESIS into the water tank.\n\nThe machine gurgles. It fizzes. It makes a sound like a dial-up modem having a breakthrough. Fourteen years of limescale let go at once.\n\nThe DESCALE light goes out. A green one comes on: READY.\n\nREX|…I've been here nine years."; },
    mug: (api) => { if (api.flag("descaled")) return brew(api);
      if (!api.flag("limeWarned")) { api.flag("limeWarned", true); return "REX|Don't. It's been on DESCALE since 2012. Whatever comes out of there is load-bearing."; }
      return api.die("You brew anyway. The machine coughs out one tablespoon of something gray, with a texture.\n\nYou drink it. You have consumed fourteen years of limescale. You are now load-bearing.\n\nREX: I said don't."); },
    drink: "Gus's drink is in his hand. Nell needs the one on his desk.",
  },
  "kitchen.rex": { coffee: "c:rexCoffee", mug: "REX|An empty mug. Wow. You get me.", can: "REX|I don't drink that. I've seen what it does to Gus." },
  "server.terminal": { login: (api) => logs(api) },
  "lab.monitor": { log: doGLM, printout: "You hold the FOG NEURO printout up to Figure 3. The same confident voice. The same perfect blob." },
  "lab.gus": { printout: "GUS|I read it at 2 AM. It made sense at 2 AM. That's the scariest part.", log: "GUS|Your monitor. Let's replicate it." },
  "hall.preston": { recorder: (api) => api.flag("prestonTalked") ? "You already have it on tape." : "You hold up the recorder. Preston leans in, delighted. PRESTON: Is this for a podcast?" },
  "hall.small": { printout: "SMALL|A printout. N of one." },
  "ethics.ethel": { printout: "ETHEL|A printout of a paper by a computer. I'll need the other four things." },
  "conference.quorum": { recorder: "Better not. His cufflinks are watching." },
  "iris.iris": { printout: "IRIS|They've finally automated it. In 1974 they still had to write their own nonsense." },
  "tunnels.bricked": { phone: (api) => { if (api.flag("chantTaped")) return "He's got it."; api.flag("chantTaped", true); api.score("chantTaped", 2);
    return "Gus holds his phone to the brick and records forty seconds of THE AUTHORS SHOULD CONSIDER.\n\nOn playback you can hear a gavel. And one voice, half a beat late, that sounds a lot like Preston."; } },
};

/* ---------------- shifts and act structure ---------------- */
async function nightfall(api) {
  await api.say("Nell goes home. She locks the door. She texts Gus everything, in lowercase.\n\nGus reads it at his desk, finishes his can, and goes down to the basement. The chilled water has been leaking into his scan all week, and he's paying by the hour.");
  await api.card("WEDNESDAY NIGHT", "NIGHT SHIFT  GUS", "GPU SERVER ROOM B1  01:51", "fG", 3200);
  api.shift({ mode: "night", char: "gus", room: "server", entry: "night", min: 111, cast: ["gus"] });
  await api.say("Gus Ian, 1:51 AM. The puddle under the equipment-room door has grown since last night. It's running the wrong way. Downhill, but toward somewhere that shouldn't be there.");
}
export const TITLE = ["ACT III", "MAJOR REVISIONS"];
export const END = { title: "END OF ACT III", chip: "MAJOR REVISIONS", bodies: "BODIES 02.  PLUS ONE CHAIR.", next: "NEXT: THURSDAY.  ACT IV  REBUTTAL",
  epilogue: "Nell isn't chasing a cheater anymore.\n\nShe's being hunted.\n\nDET. SGT. SMALL (TO NOBODY, IN HIS CAR): Two more bodies. Still underpowered.\n\nTo be continued.",
  thanks: "THANKS FOR PLAYING ACTS I TO III" };

export async function check(api) {
  const { G } = api, f = G.flags;
  if (G.mode !== "day") {
    if (G.room === "tunnels" && !f.chanting) { f.chanting = true; api.refresh();
      return "The tunnels. Pipes in every direction, sweating. The leak runs along the floor and under a doorway in the left wall.\n\nThe doorway has been bricked up. Through the bricks: voices. Many voices. Together."; }
    return null;
  }
  if (G.room === "hall" && G.char === "nell" && proofs(api) >= 2 && !f.danaGone) {
    f.danaGone = true; G.bodies = 2; api.refresh();
    await api.say("The hallway is full of people who aren't doing anything. Det. Sgt. Small is standing by the recycling bin.\n\nA pair of sneakers is sticking out of it. One has a bike clip.");
    return f.danaClosed ? null : "c:smallDana";
  }
  if (proofs(api) === 4 && !f.proofsDone) { f.proofsDone = true;
    return "NELL|Impossible means. One brain, two names. Four thousand GPU-hours. And when you actually run it: nothing.\n\nNELL|That's not a sloppy paper. That's a fake one.\n\nGUS|Ethel. Second floor. Before anyone else ends up in a bin."; }
  if (G.room === "conference" && !f.meeting) { f.meeting = true; api.refresh();
    return "The faculty meeting. Prof. Quorum presides. Six senior faculty, three to a side. Ethel takes the minutes.\n\nGus slips in behind you in a borrowed tie and sits down. The student representative's chair, by the door, is empty."; }
  if (f.irisDone && !f.dayDone) { f.dayDone = true; await nightfall(api); return null; }
  return null;
}
export function onSwitch(api, c) {
  if (c === "morris" && !api.flag("morrisHint3x")) { api.flag("morrisHint3x", true); api.flag("morrisHint3", true); return "MORRIS|Preston's lab has a vent, pal. Just saying. I could just say it."; }
  return null;
}
export async function start(api, { fresh, skipCard } = {}) {
  const G = api.G, keep = G.flags.printTitle;
  G.flags = { morrisJoined: true }; if (keep) G.flags.printTitle = keep;
  if (fresh) { G.score = 0; G.scored.clear(); }
  G.inv = { nell: ["recorder", "notebook", "printout"], gus: ["badge", "phone", "drink"], morris: [] };
  G.cast = ["nell", "morris"]; G.chars = { morris: { room: "lab", x: 222, y: 284, dir: 1 } }; G.bodies = 1;
  api.shift({ mode: "day", char: "nell", room: "lab", entry: "start", min: 10 * 60 + 12 });
  if (!skipCard) await api.card("WEDNESDAY", "ACT III  MAJOR REVISIONS", "ADLINE LAB 114  10:12", "fV", 2800);
  await api.say("Wednesday. Tess is dead, Nell's thermos did it, and a detective is waiting by her door.\n\nGus hasn't gone home. He's at his desk with the Big Finding open, and the expression of a man who has found something wrong in Table 1.");
  await api.convo("smallLab");
}
export async function debugNight(api) {
  Object.assign(api.G.flags, { proofGrim: true, proofOverlay: true, proofLogs: true, proofGLM: true, proofsDone: true, danaGone: true, danaClosed: true,
    meetingOpen: true, meeting: true, quorumDead: true, irisOpen: true, irisNamed: true, irisDone: true, dayDone: true });
  await nightfall(api);
}
