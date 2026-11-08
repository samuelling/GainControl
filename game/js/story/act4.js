// ACT IV — Thursday: REBUTTAL. Impact in the −80, Reviewer 2 and the retainer, Cody in the maze, the chase through the fog;
// Gus's last night at the coat check (the act ends on his last text; Friday morning and THE REHEARSAL open Act V). Design: docs/ACT4.md.
import { seg, segC, chip, chipW } from "../gfx.js";
import { ITEMS, VIV, dendro } from "./act1.js";
import "./act3.js";
import { metamer } from "../minigames/metamer.js";
import { hours } from "../minigames/hours.js";
import { retainer } from "../minigames/retainer.js";
import { stairwell } from "../minigames/stairwell.js";
import { lift } from "../minigames/lift.js";
import { echo } from "../minigames/echo.js";
import { darkbooth } from "../minigames/darkbooth.js";
import { openConsole } from "../console/open.js";

/* ---------------- items ---------------- */
Object.assign(ITEMS, {
  receipts: { name: "expense receipts", look: "A stack of reimbursement receipts, all the same template: INVITED TALK. FRIDAY. DINNER, WINE, EVENING ENTERTAINMENT. No address.",
    g: (x, y) => `<path class="sW" d="M${x - 7},${y - 10} L${x + 7},${y - 10} L${x + 7},${y + 10} L${x + 4},${y + 8} L${x + 1},${y + 10} L${x - 2},${y + 8} L${x - 5},${y + 10} L${x - 7},${y + 8} Z"/><path class="hl sA" d="M${x - 4},${y - 5} L${x + 4},${y - 5} M${x - 4},${y - 1} L${x + 3},${y - 1}"/>` },
  robe: { name: "hooded robe", look: (api) => api.G.act >= 5 ? "Gus's robe. The one from his photo on Monday. The pin is still lit." : "A hooded robe, heavy, smelling of incense and toner. A small round pin on the collar, lit red. Inside the collar, a laundry tag: 0412.",
    g: (x, y) => `<path class="sV" d="M${x - 8},${y + 11} L${x - 5},${y - 4} C${x - 6},${y - 12} ${x + 6},${y - 12} ${x + 5},${y - 4} L${x + 8},${y + 11} Z"/><circle class="fR" cx="${x + 2}" cy="${y - 1}" r="1.4"/>` },
  reel: { name: "reel: PANEL SCORES 1983", look: "A reel-to-reel tape in a scuffed box: PANEL SCORES 1983. Somebody's grant review, forty years ago. Somebody's career.",
    g: (x, y) => `<circle class="sW" cx="${x}" cy="${y}" r="9"/><circle class="hl sW" cx="${x}" cy="${y}" r="3"/><path class="hl sW" d="M${x},${y - 9} L${x},${y - 3} M${x + 8},${y + 4} L${x + 3},${y + 1} M${x - 8},${y + 4} L${x - 3},${y + 1}"/>` },
  map: { name: "Gus's map", look: "A hand-drawn map of the steam tunnels, in pencil, B3 circled twice. On the back, in Gus's handwriting: 'Tomorrow. Bring the rat. —G.'",
    g: (x, y) => `<rect class="sW" x="${x - 9}" y="${y - 8}" width="18" height="16"/><path class="hl sW" d="M${x - 6},${y + 4} L${x - 2},${y - 2} L${x + 3},${y + 2} L${x + 6},${y - 4}"/><circle class="hl sR" cx="${x + 5}" cy="${y - 3}" r="2.6"/>` },
});
const wrap = (id, fn) => { const old = ITEMS[id].look; ITEMS[id].look = (api) => api.G.act === 4 ? fn(api) : (typeof old === "function" ? old(api) : old); };
const LEADS = ["clueMetamer", "clueHours", "clueDark"], OFFICE = ["clueReviewer2", "clueRetainer", "clueCard"];
const all = (api, ks) => ks.every(k => api.flag(k));
wrap("notebook", (api) => {
  const f = api.G.flags, t = (k, s) => `- ${f[k] ? "(done) " : ""}${s}`;
  if (api.G.mode === "morning") return "Your lab notebook. Gus's last text is taped inside the cover: 'robe's on your chair. check the tube. scanning now. it's fine.'\n\n"
    + [t("gotRobe", "The robe on your chair. (Lab.)"), t("gotMap", "The tube station. (Hallway.)"), t("rehearsed", "Then Iris, 4F. The induction is tonight.")].join("\n");
  const four = !f.fourOClock ? "" : !f.impactDead ? (f.impactMissing ? " Nobody answered. Penny says he went down to the −80 room, B1." : "")
    : !f.impactOpen ? " Locked. Three digits." + (f.sawHindex ? " His h-index was 112." : " His h-index? The library has a faculty directory.") : "";
  const L = [t("impactMet", "Impact is back. Talk to him (hallway)."),
    t("clueMetamer", "Library, 2F: the back issues. Where did his sentences come from?"), t("clueHours", "Penny's receipts: where does everyone go on Fridays?"),
    t("clueDark", "Morris says Preston's ears light up. Gus wants a measurement. (Talk to Gus.)"),
    t("fourOClock", "Four o'clock: Impact's office, 3F.") + four,
    t("clueCard", "What did Impact want to tell Ethel? (His desk drawer.)"), t("clueReviewer2", "Who wrote Reviewer 2?"), t("clueRetainer", "His Figure 2. Something about the dropout, the blank hole metal leaves in a scan.")];
  if (f.clueCard) L.push(t("codyLeft", "Cody's in the hallway, about to do something brave. Talk to him."));
  if (f.codyLeft) L.push(t("codyDead", "Cody took the back stairs, past the animal facility. You'd need booties. Morris wouldn't. (Click his name; the vents.)"));
  if (f.morrisPast) L.push(t("chased", "Tell Small. Now. (Hallway.)"));
  return "Your lab notebook. Thursday.\n\n" + L.join("\n");
});
wrap("printout", () => "The FOG NEURO printout. Gus's handwriting in the margin: 'every sentence is somebody else's.'");
wrap("phone", (api) => { const f = api.G.flags, t = (k, s) => `- ${f[k] ? "(done) " : ""}${s}`;
  return "Texts from Nell, 23:58:\n\nNELL: they killed cody. morris saw\nNELL: preston chased me down the stairwell in FOG. actual fog\nNELL: iris says don't go to the basement\nNELL: gus\nNELL: gus please\n\nGus's list:\n"
    + [t("gotRobe4", "A robe from that coat check. The one with the lit pin. She'll need to get in."), t("gotMap4", "The map on the rack."),
      t("robeLeft", "Leave Nell the robe where she'll see it first: her desk, her monitor. (Lab, upstairs.)"), t("mapSent", "Send her the map. Not on her desk, where anyone walks past. The hallway tube station goes up as well as down."), "- Scan at 2:30."].join("\n"); });

/* ---------------- readouts ---------------- */
const REVIEW = () => {
  let s = `<rect class="k sW" x="150" y="34" width="340" height="236"/>${seg("REVIEWER 2  MANUSCRIPT NN-114  NULL ET AL.", 166, 48, 6, "sW", 1)}`;
  const L = [["THE AUTHORS UTILIZE A 3T SCANNER.", "utilize"], ["ONE CANNOT STUDY A NUERON WITH 3T.", "nueron"], ["A NULL RESULT IS NOT A RESULT.", ""],
    ["THE AUTHORS SHOULD SIMPLY COLLECT MORE DATA.", ""], ["I WOULD UTILIZE THIER DATASET MYSELF.", "thier"], ["RECOMMENDATION: REJECT.", ""]];
  L.forEach(([t, bad], i) => { s += seg(t, 166, 76 + i * 26, 6, bad ? "sW" : "sM", 1); if (bad) s += `<path class="hl sR" d="M164,${86 + i * 26} L470,${86 + i * 26}"/>`; });
  return s + seg("TYPED ON P. VALU'S LAPTOP  SAVED IN IMPACT'S", 166, 248, 5, "sA", .8);
};
const CARD = () => `<rect class="k sW" x="210" y="60" width="220" height="140"/><circle class="hl sR" cx="244" cy="96" r="14"/><circle class="hl sR" cx="244" cy="96" r="5"/>
  ${seg("NEUROSCIENTIFIC ROUND TABLE", 268, 82, 5.4, "sW", .9)}${seg("MEMBER: M. IMPACT", 268, 98, 5.4, "sW", .9)}${seg("AGE: 41", 268, 114, 7, "sR", 1.1)}
  ${segC("EXPIRED", 320, 150, 14, "sR", 1.6)}${segC("RETIREMENT PENDING", 320, 178, 6, "sM", .9)}`;
const NOTE4 = () => `<rect class="k sW" x="220" y="70" width="200" height="140"/><circle class="hl sR" cx="320" cy="96" r="10"/><circle class="fR" cx="320" cy="96" r="3"/>
  ${segC("INDUCTION", 320, 126, 9, "sW", 1.3)}${segC("FRIDAY  00:00  B3", 320, 148, 9, "sW", 1.3)}${segC("BRING THE QUARRY.", 320, 178, 9, "sR", 1.3)}`;
const DIRECTORY = () => `<rect class="k sW" x="170" y="50" width="300" height="200"/>${seg("FACULTY DIRECTORY", 186, 64, 8, "sW", 1.2)}
  ${seg("IMPACT, MAXIMILIAN", 186, 96, 6.5, "sA", 1)}${seg("H-INDEX  112", 186, 116, 10, "sW", 1.3)}${seg("KEYNOTES  400+   OFFICE 3F", 186, 140, 5.5, "sM", .9)}
  ${seg("AREAS: EVERYTHING", 186, 156, 5.5, "sM", .9)}${seg("ADLINE, D.   H-INDEX 31   AFTER THE 15TH", 186, 190, 5.5, "sD", .9)}${seg("QUORUM, ?.   AGE 39   (CHAIR)", 186, 206, 5.5, "sD", .9)}`;

/* ---------------- conversations ---------------- */
export const CONVOS = {
  impactHall: { L: "nell", R: "impact", score: ["impactMet", 1], lines: [
    ["R", "Not now— oh. You're the null one. Nell. Listen. I've been in an airport since Monday. I read the news on the plane."],
    ["R", "Tess. Dana. Quorum. I'm forty-one, Nell. Do you know what happens at forty-one?"],
    ["L", "You retire?"],
    ["R", "Nobody retires. Four o'clock. My office, third floor. Come alone. Don't bring the rat."],
    ["L", "How do you know about the rat?"],
    ["R", "Everybody knows about the rat. Four o'clock."],
  ], after: (api) => { api.flag("impactMet", true); api.refresh(); } },

  // Gus's measurement: the Gain Controller leaks light, and only dark-adapted rods can see it
  gusDark: { L: "nell", R: "gus", score: ["gusDark", 1], lines: [
    ["R", "Morris says Preston's ears light up. Small says that's an anecdote from a rat. I want a measurement."],
    ["L", "Of what?"],
    ["R", "Of the earbuds. Anything that drives current through a coil leaks a little. Heat. And light. A few photons a second: single specks of light."],
    ["L", "Nobody can see a few photons a second."],
    ["R", "You can. Your rods, the night-vision cells in your eye, can catch single photons after twenty minutes in perfect dark. Hecht proved it in 1942: people saw flashes so dim that only about six photons landed."],
    ["L", "So I'd need Preston in the dark booth for twenty minutes."],
    ["R", "He's in there now. I told him you were piloting a rod study and needed a sub-01. Middle authorship."],
    ["L", "He said yes to middle author?"],
    ["R", "He said 'co-first?' I said 'we'll see.' He's been in there since nine, networking with the dark."],
    ["R", "Don't look straight at him in there. The center of your eye, the fovea, has no rods. Look beside him, the way you'd catch a faint star."],
  ], after: (api) => { api.flag("darkReady", true); api.refresh(); } },
  darkAfter: { L: "nell", R: "preston", score: ["darkAfter", 1], lines: [
    ["N", "The booth door opens. Preston steps out, blinking, delighted."],
    ["R", "Great paradigm, Nell! Very… dark. Very minimal. Put me down as co-first. We'll fix the order in revisions."],
    ["L", "Preston, how long have you had those earbuds?"],
    ["R", "These? Since my invitation. They help me focus. Everything's so much clearer. I don't even have to decide things anymore, I just…", "blank"],
    ["R", "…the authors should consider their position.", "blank"],
    ["R", "Ha! Long week. Coffee? The machine's broken. Ha!"],
    ["N", "He goes. His ears flicker green as he passes the door: two, one, two."],
  ], after: (api) => { api.flag("darkDone", true); } },

  pennyReceipts: { L: "nell", R: "penny", score: ["pennyReceipts4", 1], lines: [
    ["R", "Hon. Sit. I've decided something."],
    ["R", "I've approved those 'invited talk' receipts every fall for thirty-one years. Same template. Same six names. No address. I always thought it was a book club."],
    ["R", "Then Dana. And Quorum. I'm not approving any more forms today. Except this one."],
    ["R", "Take them. And their calendars. I keep everybody's calendar. Nobody knows that. It's a form."],
  ], after: (api) => { api.give("receipts"); api.flag("gotReceipts", true); } },

  smallFreezer: { L: "nell", R: "small", lines: [
    ["R", "Professor Maximilian Impact. Walk-in −80. The door closes from the outside."],
    ["L", "He was going to tell me something. At four."],
    ["R", "Three bodies, Ms. Null. Three. Still—"],
    ["R", "…"],
    ["R", "I'm going to stop saying that."],
    ["R", "His office is on three. It's locked. I don't have a warrant. You don't need one. I didn't say that."],
  ], after: (api) => api.flag("smallFreezerDone", true) },

  codyGoing: { L: "nell", R: "cody", score: ["codyGoing", 1], lines: [
    ["R", "Nell! I'm going to Detective Small. Right now. I'm telling him everything. The sign-in sheet, the slip, all of it."],
    ["R", "Preston said it was a pilot study. I didn't know what a pilot study was. I thought it was about planes."],
    ["L", "Cody, wait. Don't go alone."],
    ["R", "It's fine! I'm taking the back stairs past the animal facility. Nobody's ever down there."],
  ], after: (api) => { api.flag("codyLeft", true); api.refresh(); } },

  morrisPast: { L: "nell", R: "morris", score: ["morrisPast", 3], lines: [
    ["R", "Pal. I saw it. Through the vent. Preston, with his ears all lit up. And behind him, one of the robes. Holding a remote. Like a TV."],
    ["R", "And pal… I know that tank. I know that room."],
    ["L", "Morris?"],
    ["R", "The electrodes. The robes. The little dial. They'd turn it up and I'd swim faster. Turn it down and I'd forget why I was swimming."],
    ["R", "That's why I can talk. That's why my head itches. They tried it on me first."],
    ["L", "You were never a lab pet. You were a pilot."],
    ["R", "So were you, pal."],
    ["L", "…Subject one. I scanned myself first. Retainer and all."],
    ["R", "Takes one to know one."],
  ], after: (api) => api.flag("morrisPast", true) },

  irisThursday: { L: "nell", R: "irisNamed", lines: [
    ["R", "Shut the door. Sit. You're shaking. That's the fog; it's a cheap glycol. They bought it for a holiday party in 1983."],
    ["L", "There was a cage at the bottom of the stairs. It brought me straight up here."],
    ["R", "My magnet lift. I had it put in in 1968, to bring the coils down. After the Schism I had them fit a ratchet: up only. Nothing comes down it to them, and nothing of theirs comes up. It doesn't listen, either. It's too old to hear."],
    ["L", "He chased me. Preston. He didn't even look like himself."],
    ["R", "He wasn't himself. That's the point of the earbuds. Stay here tonight. I don't sleep anyway."],
    ["L", "Gus is going to the basement. He always does."],
    ["R", "Then tell your labmate to go home, dear."],
  ], after: (api) => api.flag("irisThursday", true) },

  smallGus: { L: "nell", R: "small", lines: [
    ["R", "…"],
    ["L", "Gus."],
    ["R", "The scan's still running. They had to let it finish. The tech says you can't stop a sequence halfway."],
    ["R", "Those aren't the scanner's headphones."],
    ["N", "Det. Sgt. Small takes off his hat. He doesn't say anything about sample size."],
  ], after: (api) => api.flag("smallGus", true) },

  irisPlan: { L: "nell", R: "irisNamed", score: ["irisPlan", 2], lines: [
    ["L", "They took Gus."],
    ["R", "I know, dear."],
    ["L", "I'm going to the induction. Tonight. In his robe. I'm going to get Preston out of those earbuds, and I'm going to take the Archive."],
    ["R", "They'll make you do the Echo. In front of the whole Board. They'll watch your seat and your mouth at the same time."],
    ["L", "Then teach me."],
    ["N", "Iris reaches into her desk drawer for the staple gun. She looks at it for a long time. Then she puts it on the desk, between them."],
    ["R", "Sit in that chair. We'll start with the phrases. Every time you miss, you'll hear this."],
    ["N", "Click."],
  ] },
};

/* ---------------- shared helpers ---------------- */
const VENTS = [["lab", "ADLINE LAB 114"], ["hall", "HALLWAY 1F"], ["office", "MAIN OFFICE 1F"], ["kitchen", "COFFEE KITCHEN 1F"], ["maze", "ANIMAL FACILITY B1"]];
async function vent(api) {
  const d = await api.chooseFrom("MORRIS TAKES THE VENTS. WHERE TO?", VENTS.filter(([id]) => id !== api.G.room));
  if (!d) return null;
  api.goRoom(d + "@vent"); api.blip([300, 500, 700]);
  if (d === "maze" && api.flag("codyLeft") && !api.flag("codyDead")) return codyFound(api);
  if (d === "maze" && !api.flag("mazeArrive")) { api.flag("mazeArrive", true); return "MORRIS|Pal. I don't like it in here. I don't know why I don't like it in here."; }
  return null;
}
const ventHS = { label: "vent", morris: { look: "A vent. Morris's highway.", use: vent }, day: { look: "A vent. Morris-sized." }, night: { look: "A vent." }, morning: { look: "A vent." } };
async function codyFound(api) {
  api.flag("codyDead", true); api.G.bodies = 4; api.refresh(); api.sfx("splash");
  await api.say("The animal facility. The water maze, lit from above.\n\nCody Credit is floating in it, face down, backwards cap still on. He did not locate the hidden platform.");
  return "MORRIS|…Pal. PAL. I saw them. I saw the end of it. I have to tell Nell.";
}

async function stairs(api) {
  const f = api.G.flags, o = [["library", "2F  LIBRARY"], ["impactoffice", "3F  PROF. IMPACT"], ["freezer", "B1  −80 ROOM"], ["maze", "B1  ANIMAL FACILITY"]];
  if (f.escaped || api.G.mode === "morning") o.push(["iris", "4F  EMERITUS OFFICE"]);
  if (api.G.mode === "morning") o.unshift(["mri", "B1  MRI SUITE"]);
  const d = await api.chooseFrom("THE STAIRWELL. WHERE TO?", o);
  if (!d) return null;
  if (d === "impactoffice") return impactDoor(api);
  if (d === "maze") {
    if (!f.bootiesWarned) { f.bootiesWarned = true; return "ANIMAL FACILITY. BOOTIES REQUIRED. You have no booties. You remember what happened to the last person who went in without booties. Nobody does. That's what happened."
      + (f.codyLeft && !f.codyDead ? "\n\nSomething smaller could get in there through the vents. Something that's never worn booties in its life." : ""); }
    return api.die("You go in without booties.\n\nA rack of transgenic mice looks up at you. Then the facility manager does.\n\nYou are now banned from all animal work, for life, in every institution, retroactively. Your thesis contains three mice. Your thesis is withdrawn.");
  }
  if (d === "mri" && !f.smallGus) { api.goRoom("mri@morning"); return null; }
  api.goRoom(d + "@fromStairs");
  if (d === "freezer" && (f.impactMissing || f.fourOClock) && !f.impactDead) { f.impactMissing = true; return impactFound(api); }   // no need to knock on 3F first
  return null;
}
async function impactFound(api) {
  api.flag("impactDead", true); api.G.bodies = 3; api.refresh(); api.sfx("sting"); api.sfx("hiss");
  await api.say("The −80 room, where the department keeps its samples at eighty below. The walk-in at the back is open, fog spilling out across the floor.\n\nProf. Maximilian Impact is inside it. Standing. Mid-stride. Neck pillow on. Frozen solid next to a box labeled DO NOT THAW.");
  return "c:smallFreezer";
}
async function impactDoor(api) {
  const f = api.G.flags;
  if (!f.fourOClock) return "PROF. M. IMPACT. A keypad on the door, three digits. He said four o'clock. It isn't four o'clock.";
  if (!f.impactDead) { f.impactMissing = true; return "You knock. Nothing. Down the hall, Penny's voice on the phone: '…no, he went down to B1 to check on a sample, twenty minutes ago. B1, hon. The −80 room. The big freezers.'"; }
  if (!f.impactOpen) {
    if (!f.sawHindex) return "The keypad wants three digits. Impact's password would be the number he loved most. His h-index: a professor's high score, built from how often other papers cite his. Which you'd have to look up. The library has a faculty directory.";
    const ok = await api.keypad("112", ["1", "2"]);
    if (!ok) return "Nell steps back from the keypad. His h-index. The directory said.";
    f.impactOpen = true; api.score("impactOpen", 2);
  }
  api.goRoom("impactoffice@fromStairs"); return null;
}

// count a failed attempt at a puzzle (stored in a flag); after a couple, the surrounding lines start giving real hints
const missed = (api, k) => (api.G.flags[k] = (api.G.flags[k] || 0) + 1);

// a death inside a minigame: Revise & Resubmit rolls the engine back to before the action, but the minigame keeps running,
// so keep this act's flags and stay busy until the minigame ends
const dieKeep = (api) => async (t) => { const keep = { ...api.G.flags }; await api.die(t); Object.assign(api.G.flags, keep); api.G.busy = true; return "revise"; };

/* ---------------- hotspots ---------------- */
const look = (t) => ({ look: t });
export const HS = {
  lab: {
    door: { label: "door to hallway", day: { look: "The hallway.", go: "hall@fromLab" }, morris: { look: "Door.", go: "hall@fromLab" }, night: { look: "The hallway.", go: "hall@fromLab" }, morning: { look: "The hallway.", go: "hall@fromLab" } },
    monitor: { label: "your monitor", day: { look: "Your monitor. Your defense slides, half done. Slide 1: NULL RESULTS: A DEFENSE. Slide 2: blank." }, morris: look("Morris sits on the space bar."),
      night: { look: (api) => "Nell's monitor. Her chair is pushed back, like she left in a hurry." + (api.has("robe") ? " Whatever he leaves here, it's the first thing she'll see in the morning." : "") }, morning: { look: "Your monitor. Your defense is today. Slide 2 is still blank." } },
    drawer: { label: "desk drawer", day: look("Your drawer. Morris's bed."), morris: { look: "Home.", use: "Morris naps for four seconds." }, night: look("Nell's drawer. Empty tonight. The rat's with her."), morning: look("Your drawer.") },
    whiteboard: { label: "whiteboard", day: look("IS ANY OF IT REAL? NO. And new, in your writing: WHO IS PULLING THE STRINGS?"), morris: look("Too high."),
      night: look("WHO IS PULLING THE STRINGS? Gus writes underneath: THE ARCHIVE. B3."), morning: look("WHO IS PULLING THE STRINGS? And under it, in Gus's handwriting: THE ARCHIVE. B3.") },
    adline: { label: "Prof. Adline's office", day: { look: "AFTER THE 15TH. Today the door is open a crack.", talk: "PROF. ADLINE|Nell. I heard. All of it. Your defense is still tomorrow. I'll be there. I'll be there, Nell." }, morris: look("Typing."), night: look("Dark."), morning: { look: "Prof. Adline's door, open. She's at her desk, not typing.", talk: "PROF. ADLINE|Two o'clock. I'll be there. Gus would have hated it if we postponed." } },
    booth: { label: "dark booth", day: { look: (api) => api.flag("clueDark") ? "The dark booth. Empty again. Gus's hoodie is still stuffed under the door."
        : api.flag("darkReady") ? "The dark booth. The ON lamp is lit. From inside, muffled: Preston, practising his elevator pitch to nobody. 'Synergy… no. SYNERGY.'" : "The dark booth.",
        use: doDark, go: openConsole },
      morris: look("MORRIS|No. I know what dark rooms are for in this building."), night: { look: "Dark.", go: openConsole }, morning: look("Dark.") },
    gusdesk: { label: "Gus's desk", day: look("Gus's desk. Cans. Notes. A map of the steam tunnels with B3 written on it and crossed out and written again."), morris: look("Morris sniffs. Cans."),
      night: look("His desk. He hasn't sat at it since Monday."), morning: look("Gus's desk. The mug that says I ♥ GAUSSIANS, still half full. His laptop is open to Dendroboard, logged in, a reply half-typed: 'honestly just give them time, they'll call when they're ready'.") },
    viv: VIV,
    gus: { label: "Gus", day: { look: () => `Gus, at his desk, "re-running your replication for the fourth time." The laptop says DENDROBOARD. Thread: ${dendro()}\n\nGUS|It's running in the background. The frogs are in the foreground. That's called multitasking.`, talk: (api) => gusHint(api) },
      morris: { look: "MORRIS|He scratched my ears this morning. Nobody does that." } },
    robe: { label: "the robe on your chair", morning: { look: "A hooded robe, draped over your chair. The pin from Gus's photo on Monday, lit. Folded into the hood: a reel of tape.",
      use: (api) => { api.give("robe"); if (api.flag("reelLeft")) api.give("reel"); api.flag("gotRobe", true); api.refresh(); api.score("gotRobe", 1);
        return "You take the robe. It still smells like his cardigan." + (api.flag("reelLeft") ? "\n\nInside the hood, a reel: PANEL SCORES 1983." : ""); } },
      night: { look: "Nell's chair.", use: "Gus could leave something here." } },
    vent: ventHS,
  },

  hall: {
    door101: { label: "Seminar Room 101", day: look("101. FRIDAY 2 PM: NELL NULL, DEFENSE."), morris: look("101."), night: look("101. Dark."), morning: look("101. Today. Two o'clock.") },
    fountain: { label: "water fountain", day: { look: "1962.", use: "You drink." }, night: look("Humming."), morning: look("1962.") },
    stars: { label: "Rising Stars wall", day: look("Preston's photo has been replaced with a bigger one. Impact's has a black ribbon on it already. Somebody is very efficient."), morris: look("Itch."),
      night: look("The Rising Stars in the dark."), morning: look("Gus was never on the Rising Stars wall. Nobody notices a grad student at 2 AM.") },
    board: { label: "bulletin board", day: look("NELL NULL, DEFENSE, FRIDAY 2 PM, 101. P. VALU, JOB TALK, FRIDAY 3 PM, 101. Somebody moved his to after yours. So he can watch."), night: look("The flyers."), morning: look("The flyers.") },
    impact: { label: "Impact Lab 116", day: { look: "116. Locked.", use: "123456." }, morris: look("116."), night: look("116."), morning: look("116.") },
    tube: { label: "tube station", day: look("Canisters, going down."), night: { look: (api) => "The tube station. A canister, empty, waiting in the hatch."
      + (api.has("map") ? " Room in it for something rolled up. The address card says: ANY ROOM. Up goes to people. Down goes to them." : "") },
      morning: { look: (api) => api.flag("gotMap") ? "Empty." : "A canister is sitting in the hatch, addressed by hand: N. NULL, ADLINE LAB.",
        use: (api) => { if (api.flag("gotMap")) return "Empty."; api.give("map"); api.flag("gotMap", true); api.score("gotMap", 1);
          return "Inside the canister: a hand-drawn map of the steam tunnels, B3 circled twice. On the back, in Gus's handwriting:\n\n'Tomorrow. Bring the rat. —G.'"; } } },
    stairs: { label: "stairwell", day: { look: "The stairwell.", go: stairs }, morris: look("Vents."), night: { look: "The stairwell.", go: "Gus has a scan at 2:30. And a feeling about the tunnels." }, morning: { look: "The stairwell.", go: stairs } },
    office: { label: "main office", day: { look: "The main office.", go: "office@fromHall" }, morris: look("Vent."), night: { look: "Dark.", go: "Locked." }, morning: { look: "The main office.", go: "Penny isn't in yet. Penny is always in." } },
    lab: { label: "Adline Lab 114", day: { look: "Your lab.", go: "lab@fromHall" }, morris: { look: "Home.", go: "lab@fromHall" }, night: { look: "The lab.", go: "lab@fromHall" }, morning: { look: "Your lab.", go: "lab@fromHall" } },
    kitchen: { label: "coffee kitchen", day: { look: "The kitchen.", go: "kitchen@fromHall" }, morris: { look: "Food.", go: "kitchen@fromHall" }, night: { look: "Dark.", go: "kitchen@fromHall" }, morning: look("The kitchen. Rex is in there. Rex is always in there.") },
    prof: { label: "Prof. Impact", day: { look: "Prof. Maximilian Impact, back from wherever he always is. Neck pillow, rolling bag, a phone he's not talking into. He looks every one of his forty-one years.",
        talk: (api) => api.flag("impactMet") ? "IMPACT|Four o'clock. My office. Please." : "c:impactHall" },
      morris: { look: "MORRIS|He smells like an airport and fear." } },
    cody: { label: "Cody", day: { look: "Cody, without his clipboard, rehearsing something under his breath.", talk: "c:codyGoing" }, morris: look("MORRIS|The kid's all right.") },
    vent: ventHS,
  },

  office: {
    penny: { label: "Penny Ledger", day: { look: "Penny. Not on any of her phones. That's how you know.", talk: (api) => api.flag("gotReceipts") ? (api.flag("clueHours") ? "PENNY|Same six names. Thirty-one years." : doHours(api)) : "c:pennyReceipts",
        use: (api) => api.flag("gotReceipts") && !api.flag("clueHours") ? doHours(api) : null }, morris: look("Penny looks at Morris. Penny nods at Morris. Penny has accepted Morris.") },
    forms: { label: "form rack", day: look("FORM D-1, BEREAVEMENT. The slot's empty.") }, mailboxes: { label: "mailboxes", day: look("Impact's mailbox is full of conference lanyards.") },
    cabinet: { label: "P.O. cabinet", day: look("Purchase orders. Still no coil.") }, printer: { label: "printer", day: look("PC LOAD LETTER.") }, sign: { label: "sign", day: look("BACK IN 5 MIN.") },
    door: { label: "door to hallway", day: { look: "The hallway.", go: "hall@fromOffice" }, morris: { look: "Door.", go: "hall@fromOffice" } },
    vent: ventHS,
  },

  kitchen: {
    rex: { label: "Dr. Rex Jected", day: { look: "Rex, with an espresso, which he now makes eleven times a day.", talk: "REX|I told you. Under forty. Nobody believes me. You believe me. That's worse, somehow." }, morris: look("REX|Rat.") },
    espresso: { label: "espresso machine", day: look("READY. It hums like it's proud of itself."), morris: look("READY.") },
    mugs: { label: "mug tree", day: look("WORLD'S OKAYEST PI is back on the tree. Rex washed it.") },
    fridge: { label: "fridge", day: look("DO NOT DRINK — SAMPLE.") }, board: { label: "corkboard", day: look("WHO KEEPS BOOKING THE OLD B-LEVEL ROOM ON FRIDAYS? Underneath, in Rex's writing: I KNOW.") },
    sink: { label: "sink", day: look("Clean. Rex has been busy.") },
    door: { label: "door to hallway", day: { look: "The hallway.", go: "hall@fromKitchen" }, morris: { look: "Door.", go: "hall@fromKitchen" }, night: { look: "The hallway.", go: "hall@fromKitchen" } },
    vent: ventHS,
  },

  library: {
    backissues: { label: "back issues", day: { look: "Fifty years of bound journals. Nurture Neuroscience, Cell-ebrity, Trends in Trends. Gus's printout taught you what a stitched paper looks like.", use: doMetamer } },
    table: { label: "reading table", day: { look: (api) => { if (!api.flag("clueFeud")) { api.flag("clueFeud", true); api.score("clueFeud", 2); }
        return "Two papers, laid out side by side on the reading table like a crossword: Valu (2024), \"Memory Is Streamed,\" and Mick (2024), \"No, Memory Is Stored: A Reply to Valu.\" The famous feud.\n\nThe footers. Both say LTM v0.9 · SEED 0412.\n\nThey weren't arguing. One machine wrote both sides on the same night."; } } },
    directory: { label: "faculty directory", day: { look: "A FACULTY DIRECTORY on a stand.", use: async (api) => { await api.readout(DIRECTORY(), "IMPACT, MAXIMILIAN. H-INDEX 112. Areas: everything."); api.flag("sawHindex", true); api.score("sawHindex", 1); return null; } } },
    catalog: { label: "card catalog", day: look("A card catalog. Every drawer is labeled MISC.") },
    atlas: { label: "1980s brain atlas", day: look("A fat brain atlas from 1983, out of reach on a high shelf. Its coordinates are all slightly off from the modern ones. Somebody's sticky-note threats would decode differently with this book. You file that away for tomorrow.") },
    librarian: { label: "librarian's desk", day: look("BACK AFTER TENURE.") },
    door: { label: "door to the stairs", day: { look: "The stairwell.", go: "hall@fromStairs" } },
  },

  freezer: {
    walkin: { label: "walk-in −80", day: { look: (api) => api.flag("impactDead") ? "The walk-in. Police tape across the doorway now." : "The walk-in −80. The door is heavy and wide open, fog rolling out over your shoes.",
        use: (api) => !api.flag("walkinWarned")
          ? (api.flag("walkinWarned", true), "You step into the walk-in for a closer look and reach for the door, to keep the cold in. Good lab practice.\n\nThen you notice there's no handle on the inside. You step back out, quickly, and leave the door exactly where it was.")
          : api.die("You step in to look and pull the door to behind you, to keep the cold in. Good lab practice.\n\nIt latches.\n\nYou have been archived at −80 °C. Your samples will be fine.") } },
    impact: { label: "Prof. Impact", day: look("Impact. Frozen mid-stride, one hand out, as if reaching for a lanyard. Frost on his neck pillow.") },
    box: { label: "box", day: look("A cardboard box at his feet. DO NOT THAW. Inside: forty years of keynote slides on floppy disks.") },
    freezers: { label: "freezers", day: look("A row of upright −80s, humming. Each one reads −80. One reads −79 and has a sticky note on it: SOMEONE OPENED ME.") },
    small: { label: "Det. Sgt. Small", day: { look: "Det. Sgt. Small. His notebook is closed.", talk: (api) => api.flag("smallFreezerDone") ? "SMALL|Third floor. I didn't say that." : "c:smallFreezer" } },
    door: { label: "door to the stairs", day: { look: "The stairwell.", go: "hall@fromStairs" } },
  },

  maze: {
    tank: { label: "water maze", day: look("The Morris water maze."), morris: { look: (api) => api.flag("codyDead") ? "The tank. Cody. The water is very still." : "A round tank of cloudy water. Morris's whiskers go flat.",
      talk: (api) => { if (api.flag("mazeRemember")) return "MORRIS|I don't want to look at it anymore, pal.";
        api.flag("mazeRemember", true); api.score("mazeRemember", 1);
        return "MORRIS|Star on that wall. Triangle on that one. Square. You swim until you find the platform, and then you remember where it was.\n\nMORRIS|I remember where it is. I've always remembered. They'd put the electrode in and I'd find it faster and faster and then one day I could tell them where it was.\n\nMORRIS|Out loud."; } } },
    cody: { label: "Cody", morris: look("Cody Credit. Unable to locate the hidden platform."), day: look("Cody.") },
    cues: { label: "wall cues", morris: look("A star, a triangle, a square. Morris knows them better than his own name. He doesn't have a last name."), day: look("Distal cues.") },
    camera: { label: "overhead camera", morris: look("The overhead tracking camera. Its light is on. Somebody watched."), day: look("A camera.") },
    cages: { label: "cages", morris: look("Rows of rats in cages. None of them talk. Morris checks."), day: look("Rats.") },
    vent: ventHS,
    door: { label: "door", morris: look("Door. Vents."), day: { look: "The stairwell.", go: "hall@fromStairs" } },
  },

  impactoffice: {
    desk: { label: "Impact's laptop", day: { look: "Impact's laptop, open. A folder: REVIEWS I DIDN'T WRITE.", use: async (api) => {
      await api.readout(REVIEW(), "Reviewer 2's report on your paper. Last spring. 'Nueron.' 'Utilize.' 'Thier.' Saved from P. VALU's laptop into Impact's folder.\n\nThe LTM, his paper-writing machine, never misspells anything. A person wrote this. Preston wrote this.");
      if (!api.flag("clueReviewer2")) { api.flag("clueReviewer2", true); api.score("clueReviewer2", 3); } return "NELL|The one thing he wrote himself was my rejection."; } } },
    figure: { label: "framed Figure 2", day: { look: "A framed print of the Big Finding's Figure 2 on the wall, signed by Preston: 'To the boss! Synergy!'", use: doRetainer } },
    drawer: { label: "desk drawer", day: { look: "The top drawer, not quite shut. The only thing in this office that isn't framed. Men like Impact keep the thing that matters closest to hand.", use: async (api) => {
      await api.readout(CARD(), "A membership card. NEUROSCIENTIFIC ROUND TABLE. M. IMPACT. AGE: 41. EXPIRED.");
      if (!api.flag("clueCard")) { api.flag("clueCard", true); api.score("clueCard", 3); api.refresh(); }
      return "Under the card, a draft letter on department letterhead, never sent:\n\n'Dear Ethel. I can no longer stay silent about the Table. I have reviewed my own student's papers for three years without reading them. I know where he goes on Friday nights, because I used to go. I am forty-one—'\n\nIt stops there."; } } },
    lanyards: { label: "lanyards", day: look("Framed lanyards from four hundred keynotes. In every photo he's mid-sentence.") },
    window: { label: "window", day: look("A plane goes over. Impact was always on one.") },
    chair: { label: "lounge chair", day: look("An airline-lounge recliner, still warm from nobody.") },
    door: { label: "door", day: { look: "The hallway.", go: "hall@fromStairs" } },
  },

  iris: {
    iris: { label: "Prof. Iris Candor", day: { look: "Iris.", talk: "c:irisThursday" }, morning: { look: "Iris, at her desk, the staple gun in her hand. She's been waiting for you.", talk: (api) => api.flag("rehearsed") ? "IRIS|Go home. Sleep. Come back at two." : (api.flag("gotRobe") && api.flag("gotMap")) ? rehearse(api) : "IRIS|Not yet, dear. Gus left you two things, and he told you where: your chair, and the tube. Go and get them." } },
    stacks: { label: "journals", day: look("1961 to now."), morning: look("1961 to now.") }, manual: { label: "magnet manual", day: look("SUPERCONDUCTING RING, 1968."), morning: look("Iris has put the manual by the door. 'I'll need that tonight,' she says, without looking up.") },
    photo: { label: "photograph", day: look("1968."), morning: look("1968.") }, letter: { label: "framed letter", day: look("1977."), morning: look("1977.") },
    stapler: { label: "staple gun", day: look("Loaded."), morning: look("In her hand.") }, kettle: { label: "kettle", day: look("Sherry, 1962."), morning: look("She's made tea. You don't drink it. She doesn't notice.") },
    chair: { label: "chair", morning: look("The chair opposite her desk. For you.") },
    door: { label: "door to the stairs", day: { look: "The stairwell.", go: "hall@fromStairs" }, morning: { look: "The stairwell.", go: "hall@fromStairs" } },
  },

  tunnels: {
    bricked: { label: "bricked-up doorway", night: { look: "The bricked door. Tonight there's a gap at the bottom, one brick wide, and light behind it.",
        use: (api) => api.has("robe") && !api.flag("peekWarned")
          ? (api.flag("peekWarned", true), "Gus crouches toward the gap with the robe in his arms. On the other side, very close: breathing. Someone is right there, waiting for a member to knock.\n\nGUS|Not with this thing on me. They'd take me for one of them. …They'd take me.")
          : api.has("robe") ? api.die("Gus pulls the robe over his head and puts his eye to the gap. A hooded face on the other side, very close.\n\n'Welcome, member. Your gain has been adjusted.'") : "Gus doesn't knock. Not this time." } },
    rack: { label: "coat check", night: { look: "A coat check, here, in a steam tunnel. A rack of hooded robes on numbered hooks. One has a small round pin, lit red: the robe from Gus's photo on Monday.",
        use: (api) => { if (api.has("robe") || api.flag("robeLeft")) return "One's enough."; api.sfx("cloth"); api.give("robe"); api.flag("gotRobe4", true); api.score("tookRobe", 2);
          return "Gus takes the robe with the pin. Inside the collar, a laundry tag: 0412.\n\nThe same seed as the paper mill. The Table does its laundry and its science on the same schedule."; } } },
    reel: { label: "reel", night: { look: "A reel-to-reel tape on a hook: PANEL SCORES 1983.", use: (api) => { api.give("reel"); api.flag("gotReel", true); api.refresh(); api.score("gotReel", 2); return "Gus takes the reel."; } } },
    map: { label: "map", night: { look: "A hand-drawn map pinned to the rack: the steam tunnels, with a room past the bricked door. B3. Circled.", use: (api) => { api.give("map"); api.flag("gotMap4", true); api.refresh(); api.score("gotMap4", 2); return "Gus takes the map. On the back, he writes: Tomorrow. Bring the rat. —G."; } } },
    tube: { label: "tube line", night: { look: "The tube line. Busy tonight.", use: (api) => { if (api.flag("canister4")) return "Quiet."; api.flag("canisterLive", true); api.refresh(); return "A rattle, coming."; } } },
    hatch: { label: "access hatch", night: { look: "The access hatch.", use: async (api) => {
      if (api.flag("canister4")) return "Empty.";
      if (!api.flag("canisterLive")) return "Empty. Wait for a rattle.";
      api.flag("canisterLive", false); api.flag("canister4", true); api.refresh();
      api.sfx("tube"); await api.readout(NOTE4(), "INDUCTION. FRIDAY. 00:00. B3. BRING THE QUARRY.");
      api.score("canister4", 2);
      return "GUS|Friday. Tomorrow.\n\nGUS|Bring the quarry. They mean Nell.\n\nGUS|Then I'll bring her first."; } } },
    pipes: { label: "pipes", night: look("The chilled-water line, tapped into the brick.") }, valve: { label: "big red valve", night: look("Don't.") },
    back: { label: "back to the server room", night: { look: "Back.", go: "server@fromTunnels" } },
  },
  server: {
    terminal: { label: "terminal", night: look("Nell's login is gone. Somebody changed the password to FURTHERRESEARCH.") }, racks: { label: "GPU cluster", night: look("Hot.") },
    ltm: { label: "LTM rack", night: look("Blinking. Two, one, two.") }, thermostat: { label: "thermostat", night: look("31°C.") },
    equip: { label: "equipment room door", night: { look: "The equipment room. The tunnels.", go: "tunnels@fromServer" } },
    door: { label: "door to the stairs", night: { look: "The stairwell.", go: "hall@fromStairs" } }, vent: ventHS,
  },
  mri: {
    window: { label: "magnet room window", morning: look("Through the glass: Gus, on the scanner bed, half in the bore. The scan is still running. Its little progress bar says 94%.") },
    gus: { label: "Gus", morning: look("Gus Ian. His eyes are open. His pupils are pinpoints. He's wearing earbuds that aren't the scanner's, and they're lit, softly, the color of a pin on a robe.") },
    small: { label: "Det. Sgt. Small", morning: { look: "Det. Sgt. Small, his hat in his hands.", talk: (api) => api.flag("smallGus") ? "SMALL|Go on, Ms. Null. I'll stay with him until the scan finishes." : "c:smallGus" } },
    console: { label: "console", morning: look("The console. 94%. 95%.") }, calendar: { label: "booking calendar", morning: look("GUS IAN, 2:30 AM. Every night this week.") },
    locker: { label: "locker", morning: look("The locker.") }, sign: { label: "sign", morning: look("THE MAGNET IS ALWAYS ON.") },
    door: { label: "door to the stairs", morning: { look: "The stairwell.", go: "hall@fromStairs" } }, magnetdoor: { label: "magnet room door", morning: look("Taped.") }, vent: ventHS,
  },
};

function gusHint(api) {
  const f = api.G.flags;
  if (!f.impactMet) return "GUS|Impact's back. He's in the hallway, looking like a man who knows what forty-one means.";
  if (!f.darkReady) return "c:gusDark";
  if (!f.clueMetamer) return "GUS|Take my printout to the library. Lay his sentences against the back issues. You'll see the stitches.";
  if (!f.clueHours) return "GUS|Penny has everyone's calendar. Nobody knows that. Ask her about the Friday receipts.";
  if (!f.clueDark) return "GUS|He's in the booth. Twenty minutes in the dark, Nell. Then look beside him, not at him.";
  if (!f.impactDead) return f.impactMissing ? "GUS|Penny said B1. The −80 room. Go." : "GUS|It's four. Impact's office, third floor.";
  if (!f.impactOpen) return "GUS|His office password's his h-index. His academic high score. Of course it is. The directory's in the library.";
  if (!f.clueCard) return "GUS|What's in his office? Men like Impact keep the thing that matters in the top drawer.";
  if (!f.codyLeft) return "GUS|Cody's in the hallway, rehearsing something under his breath. That's never good. Go talk to him.";
  if (!f.codyDead) return "GUS|Cody's taking the back stairs past the animal facility. Nobody goes down there, Nell. Except rats. Send the rat.";
  if (!all(api, OFFICE)) return "GUS|What else is in his office?";
  return "GUS|Go home tonight, Nell. I've got a scan. I'll be fine. I'm always fine at 2 AM.";
}
async function doDark(api) {
  if (api.flag("clueDark")) return "You've seen enough in there. You'll be seeing it for a while, in the dark, whether you want to or not.";
  if (!api.flag("darkReady")) return "You could sit in the dark booth and think. Everyone who does falls asleep. Today you can't afford to. (Gus has an idea; ask him.)";
  const r = await api.mini(darkbooth, { score: api.score });
  if (!r || !r.done) return missed(api, "darkFails") < 2 ? "GUS|Take your time. He's not going anywhere. He thinks he's being co-first."
    : "GUS|Kill the light first: the red ON lamp, your phone, the gap under the door. Then just wait. Don't check your phone; it resets your rods. Then look beside him, not at him.";
  api.flag("clueDark", true); api.score("clueDark", 3); api.refresh();
  await api.convo("darkAfter");
  return "GUS|A coil, the Table's insignia, and a dial at max. It's not a habit, Nell. It's a broadcast.\n\nNELL|Then somebody's broadcasting.";
}
async function doMetamer(api) {
  if (api.flag("clueMetamer")) return "Every sentence, somebody else's. Every somebody, from the same three labs.";
  const r = await api.mini(metamer, { score: api.score });
  if (!r || !r.done) return missed(api, "metamerFails") < 2 ? "Not yet. The stitches are there. You just have to line them up."
    : "Not yet. One sentence at a time: find the old paper each one was lifted from. Then the references. Two are wrong: a paper that was never written, and a journal called Endless.";
  api.flag("clueMetamer", true); api.score("clueMetamer", 3); return null;
}
async function doHours(api) {
  if (api.flag("clueHours")) return null;
  const r = await api.mini(hours, { score: api.score });
  if (!r || !r.done) return missed(api, "hoursFails") < 2 ? "PENNY|Take your time, hon. They've had fifty years."
    : "PENNY|Hon. All three calendars on first. Then each receipt goes under its own day. Then the CVs: whose labs keep turning up?";
  api.flag("clueHours", true); api.score("clueHours", 3); api.take("receipts");
  return "PENNY|Friday, eleven to three. Every week. For as long as I've had the calendars.\n\nNELL|And the same three labs on every CV.";
}
async function doRetainer(api) {
  if (api.flag("clueRetainer")) return "Your mouth. Six layers inside it.";
  const r = await api.mini(retainer, { score: api.score });
  if (!r || !r.done) return missed(api, "retainerFails") < 2 ? "The dropout is right there. Line them up."
    : "The dropout is right there. Slide your scan left and down until your retainer's shadow sits on his, shrink it a little, then mark every layer he painted inside it.";
  api.flag("clueRetainer", true); api.score("clueRetainer", 3); api.refresh(); return null;
}
async function chase(api) {
  const G = api.G, F = G.flags; F.chased = true;
  // shown, not told: the hall draws F.ch (rooms/hallway.js chaseSorts); every move is a stepped pose
  const step = async (ms) => { api.refresh(); await api.wait(ms); };
  await api.walk(214, 270);
  F.ch = { pre: [330, 244] }; api.sfx("sting"); await step(300);
  for (const p of [[318, 247], [306, 250], [294, 253]]) { F.ch.pre = p; await step(260); }
  await api.say("PRESTON (EARBUDS LIT)|The authors should consider withdrawing the manuscript.");
  // the COFFEE door bangs open
  api.sfx("clunk"); F.ch.rex = [574, 282]; await step(220); F.ch.rex = [548, 276]; await step(220);
  await api.say("REX|Preston, buddy! Have you met my coffee?");
  // a hood behind him, a steel dewar, a white plume
  F.ch.hood = [590, 286, false]; await step(380); F.ch.hood = [590, 286, true]; api.sfx("cloth"); await step(420);
  api.sfx("hiss"); for (let n = 1; n <= 4; n++) { F.ch.plume = n; await step(150); }
  F.ch.rex = [530, 280, true]; api.sfx("thud"); await step(500); F.ch.plume = 0; await step(200);
  await api.say("REX (FROM THE FLOOR, FROSTED)|I'm fine. Nine years of postdoc. I'm already frozen inside. RUN, NELL.");
  // the vents hiss; fog comes down the hall while Preston keeps coming and Nell runs for the stairs
  api.sfx("hiss"); for (let n = 1; n <= 2; n++) { F.ch.fog = n; await step(320); }
  const run = (async () => { for (const p of [[278, 256], [262, 259], [246, 262]]) { F.ch.pre = p; if (F.ch.fog < 4) F.ch.fog++; await step(300); } })();
  await Promise.all([run, api.walk(104, 254)]);
  F.ch = null; api.refresh();
  let r = null;
  do r = await api.mini(stairwell, { score: api.score, die: dieKeep(api) }, "glmwrap"); while (!r || !r.escaped);
  G.flags.escaped = true; api.score("escaped", 3);
  // shown, not told: the fog runs out at B3, at Iris's old magnet lift, and it only goes up (minigames/lift.js)
  await api.mini(lift, {}, "glmwrap");
  api.goRoom("iris@fromStairs");
  return "c:irisThursday";
}
async function rehearse(api) {
  await api.convo("irisPlan");
  let r; do r = await api.mini(echo, { mode: "rehearsal", score: api.score, blip: api.blip, die: dieKeep(api) }); while (!r || !r.passed);
  api.flag("rehearsed", true); api.score("rehearsed", 3);
  await api.say("IRIS|Good. Good enough. In 1974 I was worse, and I walked out of there.\n\nIRIS|Tonight I'm going down with you. Not through the front. Somebody has to turn on the magnet.\n\nNELL|The magnet?\n\nIRIS|I commissioned it, dear. In 1968. It's been waiting.");
  api.endAct(); return null;
}

export const WITH = {
  "library.backissues": { printout: doMetamer },
  "office.penny": { receipts: doHours },
  "impactoffice.figure": { notebook: doRetainer },
  "lab.monitor": { map: (api) => api.G.mode === "night" ? "GUS|Not on her desk. Anyone walks past her desk. Things in tubes, nobody checks. Not if they're going up." : null,
    robe: (api) => { if (api.G.mode !== "night") return null; api.take("robe"); api.flag("robeLeft", true); if (api.has("reel")) { api.take("reel"); api.flag("reelLeft", true); } api.score("robeLeft", 2);
    return "Gus drapes the robe over Nell's chair, pin facing out, so she'll see it first thing." + (api.flag("reelLeft") ? " He tucks the reel into the hood." : "") + "\n\nGUS|You'll need it more than me."; } },
  "lab.robe": { robe: (api) => WITH["lab.monitor"].robe(api) },
  "lab.drawer": { robe: (api) => api.G.mode === "night" ? "Gus starts folding the robe into Nell's drawer. It won't go. Ramen packets, rejection letters, a rat-shaped dent. Somewhere she'll see it first: her desk. Her monitor." : null },
  "lab.gusdesk": { robe: (api) => api.G.mode === "night" ? "GUS|My desk? She won't look at my desk. Nobody looks at a grad student's desk. Hers. By her monitor." : null,
    map: (api) => api.G.mode === "night" ? "GUS|Not here. If they come looking, they'll come looking here." : null },
  "tunnels.hatch": { map: "Gus holds the map over the hatch. Down this line, it goes through the brick, to them. He needs a station that sends things up." },
  "tunnels.bricked": { map: "Gus is not posting the map to the cult." },
  "hall.tube": { map: (api) => { if (api.G.mode !== "night") return null; api.take("map"); api.flag("mapSent", true); api.score("mapSent", 2);
    return "Gus rolls the map into a canister, addresses it by hand: N. NULL, ADLINE LAB, and drops it in. It goes up, not down. Good.\n\nGUS|Tomorrow. Bring the rat."; } },
  "hall.prof": { recorder: "IMPACT|Turn that off. Four o'clock." },
  "freezer.impact": { recorder: "You hold up the recorder to a frozen man. You're not sure what you hoped for." },
};

/* ---------------- shifts and act structure ---------------- */
async function nightfall(api) {
  await api.card("THURSDAY NIGHT", "NIGHT SHIFT  GUS", "STEAM TUNNELS  01:12", "fG", 3200);
  api.shift({ mode: "night", char: "gus", room: "tunnels", entry: "fromServer", min: 72, cast: ["gus"] });
  api.G.inv.gus = ["badge", "phone", "drink"];
  await api.say("Gus Ian, 1:12 AM. Nell texted him eleven times. He read them all. Then he came down here anyway.\n\nThe bricked door has a gap in it tonight. And beside it, where there was nothing yesterday: a coat check.");
}
export const MAXSCORE = 80;
export const TITLE = ["ACT IV", "REBUTTAL"];
// Act IV ends on Gus's last text; Friday morning (Gus found, the robe, the map, the rehearsal) opens Act V
export const END = { title: "END OF ACT IV", chip: "REBUTTAL", bodies: "BODIES 04.", next: "NEXT: FRIDAY.  ACT V  DECISION",
  epilogue: "Gus goes down to the 3T for his 2:30 scan. He texts Nell one more time from the control room: 'robe's on your chair. check the tube. scanning now. it's fine. it's always fine at 2am.'\n\nIt's the last text.",
  thanks: "THANKS FOR PLAYING ACTS I TO IV" };

export async function check(api) {
  const { G } = api, f = G.flags;
  if (G.mode === "day") {
    if (f.impactMet && all(api, LEADS) && !f.fourOClock) { f.fourOClock = true; f.impactMissing = true; G.min = 16 * 60; api.refresh();
      return "Four o'clock. Nell's phone buzzes: the main office.\n\nPENNY (PHONE)|Hon, if you're looking for Prof. Impact, he went down to B1 to check on a sample. Twenty minutes ago. The −80 room. He said to tell you he'd be right back.\n\nNELL|B1. The big freezers."; }
    // Morris doesn't wait to be switched to: he runs the vents straight back to Nell
    // (one beat first, so he can still look around the facility: the action that found Cody arms it, the next one goes)
    if (f.codyDead && !f.morrisPast && G.char === "morris") { if (!f.codyBeat) f.codyBeat = true; else { const b = G.busy; G.busy = false; api.switchTo("nell"); G.busy = b; } }
    if (f.codyDead && !f.morrisPast && G.char === "nell") { G.chars.morris = { room: G.room, x: G.actor.x + 30, y: G.actor.y + 6, dir: -1 }; api.refresh(); return "c:morrisPast"; }
    if (f.morrisPast && !f.chased && !f.escaped && G.room === "hall" && G.char === "nell") return chase(api);
    if (f.irisThursday && !f.nightDone) { f.nightDone = true; await nightfall(api); return null; }
  }
  if (G.mode === "night" && f.robeLeft && f.mapSent && !f.dawnDone) { f.dawnDone = true; api.endAct(); return null; }
  if (G.mode === "morning" && G.room === "mri" && !f.smallGus) return "c:smallGus";
  return null;
}
export function onSwitch(api, c) {
  if (c === "morris" && api.flag("codyLeft") && !api.flag("codyDead")) return "MORRIS|Pal. Something's wrong. The animal facility. I can smell it through the vents.";
  return null;
}
export async function start(api, { fresh, skipCard } = {}) {
  const G = api.G, keep = G.flags.printTitle;
  G.flags = { morrisJoined: true }; if (keep) G.flags.printTitle = keep;
  if (fresh) { G.score = 0; G.scored.clear(); }
  G.inv = { nell: ["recorder", "notebook", "printout"], gus: ["badge", "phone", "drink"], morris: [] };
  G.cast = ["nell", "morris"]; G.chars = { morris: { room: "lab", x: 222, y: 284, dir: 1 } }; G.bodies = 2;
  api.shift({ mode: "day", char: "nell", room: "lab", entry: "start", min: 9 * 60 + 15 });
  if (!skipCard) await api.card("THURSDAY", "ACT IV  REBUTTAL", "ADLINE LAB 114  09:15", "fR", 2800);
  await api.say("Thursday. Nell knows the paper is fake, and she knows there's a Table. What she doesn't know is who's turning the dial.\n\nGus is at his desk, re-running her replication for the fourth time. Through the lab door: a rolling suitcase, and a man saying 'no, I can't talk, I'm back' into a phone.");
}
export async function debugNight(api) {
  Object.assign(api.G.flags, { impactMet: true, clueMetamer: true, clueHours: true, fourOClock: true, impactDead: true, impactOpen: true, clueReviewer2: true, clueRetainer: true,
    clueCard: true, codyLeft: true, codyDead: true, morrisPast: true, chased: true, escaped: true, irisThursday: true, nightDone: true });
  api.G.bodies = 4; await nightfall(api);
}
