// ACT II — Tuesday: UNDER REVIEW. The paper trail (Nell + Morris), Preston's computer (Gus), and the first body.
import { seg, segC } from "../gfx.js";
import * as FIG from "../figures.js";
import { ITEMS, VIV, dendro, boothNap } from "./act1.js";
import { openConsole } from "../console/open.js";
import { realHS } from "./realrecord.js";

/* ---------------- new items, and act-aware versions of old ones ---------------- */
Object.assign(ITEMS, {
  po7: { name: "Form PO-7", look: "Form PO-7: REQUEST FOR DISCLOSURE OF PURCHASE ORDERS. Pink. Needs a signature from a PI. Your PI signs nothing until after the 15th. Allegedly.",
    g: (x, y) => `<rect class="sK" x="${x - 7}" y="${y - 10}" width="14" height="20"/><path class="hl sK" d="M${x - 4},${y - 5} L${x + 4},${y - 5} M${x - 4},${y - 1} L${x + 4},${y - 1}"/>${seg("PO7", x - 5, y + 3, 3.2, "sK", .6)}` },
  po7s: { name: "signed Form PO-7", look: "Form PO-7, signed by Prof. D. Adline in a grant-deadline scrawl. Penny will have to honor it. Penny honors forms.",
    g: (x, y) => `<rect class="sK" x="${x - 7}" y="${y - 10}" width="14" height="20"/><path class="hl sK" d="M${x - 4},${y - 5} L${x + 4},${y - 5}"/><path class="sB" d="M${x - 5},${y + 6} C${x - 2},${y + 1} ${x + 1},${y + 9} ${x + 5},${y + 3}"/>` },
  slip: { name: "credit slip", look: "A research participation credit slip, already signed: P. VALU. The signature is in a font. Nobody has ever actually signed one of these.",
    g: (x, y) => `<rect class="sW" x="${x - 9}" y="${y - 6}" width="18" height="12"/><path class="hl sA" d="M${x - 6},${y + 2} L${x + 6},${y + 2}"/>${seg("1CR", x - 5, y - 4, 3.2, "sG", .6)}` },
  clipboard: { name: "sign-in clipboard", look: (api) => api.readout(SIGNIN(), "Four participants. H. Molaison and P. Gage: two of the most famous patients in the history of neuroscience, both long dead. S.M.: a famous patient who can't feel fear, and who has certainly never been to this building. And Totally Real Person.\n\nPreston didn't run anybody."),
    g: (x, y) => `<rect class="sW" x="${x - 8}" y="${y - 10}" width="16" height="21"/><rect class="k sA" x="${x - 4}" y="${y - 12}" width="8" height="4"/><path class="hl sW" d="M${x - 5},${y - 3} L${x + 5},${y - 3} M${x - 5},${y + 1} L${x + 5},${y + 1} M${x - 5},${y + 5} L${x + 2},${y + 5}"/>` },
  printout: { name: "printout", look: (api) => `A paper, printed from Preston's computer: "${api.G.flags.printTitle || "Untitled"}." By P. Valu. Footer: LTM v0.9 · FOG NEURO · SEED 0412.\n\n0412. Where has Gus seen that number before?`,
    g: (x, y) => `<path class="sW" d="M${x - 7},${y - 10} L${x + 4},${y - 10} L${x + 7},${y - 7} L${x + 7},${y + 10} L${x - 7},${y + 10} Z"/><path class="hl sW" d="M${x - 4},${y - 5} L${x + 4},${y - 5} M${x - 4},${y - 1} L${x + 4},${y - 1}"/><circle class="fR" cx="${x}" cy="${y + 5}" r="1.6"/>` },
});
const wrapLook = (id, fn) => { const old = ITEMS[id].look; ITEMS[id].look = (api) => api.G.act >= 2 ? fn(api) : (typeof old === "function" ? old(api) : old); };
wrapLook("notebook", (api) => {
  const f = api.G.flags, t = (k, s, next) => `- ${f[k] ? "(done) " : ""}${s}${f[k] || !next ? "" : " " + next}`;
  // each line carries a nudge toward its next step, so a stalled player can always find one
  const cal = !f.thermosLocked && api.has("thermos") ? "Tess won't let anything metal near her magnet. (The locker.)"
    : !f.heliumAlarm ? "Tess never leaves her console. Something would have to call her away. Something small, behind it, with teeth." : "Tess is in the magnet room. Read it now.";
  const coil = api.has("po7s") ? "It's signed. Back to Penny." : api.has("po7") ? "Form PO-7 needs a PI's signature. Yours signs anything slid under her door during a deadline."
    : "Penny will want a form. Penny always wants a form.";
  const irb = !f.sawIndex ? "Ethel files everything through the Binder of Binders. Don't pull binders at random." : !f.stoolPlaced ? "Shelf R, binder 12. The top shelf. You'll need a step up." : "Shelf R, binder 12. Pull it.";
  const clip = !f.codyTalked ? "" : !f.codyShaken ? "He'd have to hear Preston say it. (USE the recorder ON Cody.)"
    : api.has("slip") ? "Give Cody his credit slip." : !f.printerFixed ? "He wants the credit slip Preston promised. Slips print in the main office, and the printer's jammed. Something small could clear it."
    : "He wants his credit slip. The main office printer works now.";
  return "Your lab notebook. Today: prove Preston never ran the study. Find the paper trail.\n\n"
    + (f.morrisJoined ? "" : "- Morris is in your drawer, giving you a look. (Talk to him.)\n")
    + [t("clueCalendar", "Scanner calendar: Tess, MRI control, B1.", cal), t("clueCoil", "Purchase orders: Penny, main office.", coil),
      t("clueIRB", "Ethics protocol: Ethel, 2nd floor.", irb), t("clueClipboard", "Participant sign-in sheet: Cody, MRI control, B1.", clip)].join("\n")
    + (f.morrisJoined ? "\n\nMorris fits through vents. Click his name to switch." : "");
});
wrapLook("recorder", (api) => "Your voice memo recorder. Memo 1, PRESTON, JOURNAL CLUB: \"I ran every subject myself.\" Anyone who worked on his study would want to hear that."
  + (api.flag("pennyMemo") ? "\n\nMemo 2, PENNY: \"Nobody ordered a coil.\"" : ""));
wrapLook("phone", (api) => "Texts from Nell, 11:40 PM:\n\nNELL: preston never booked the scanner. never bought a coil. ethics approved AFTER. his participants are H.M. and phineas gage\nNELL: he's in 116 every afternoon. what is IN there\n\nGus's list:\n- "
  + (api.flag("impactOpen") ? "(done) " : "") + "Get into 116. The keypad has to give something away. (Six digits. Preston's vanity.)\n- "
  + (api.flag("printed") ? "(done) " : "") + "Bring Nell something from in there she can hold.\n- Scan at 2:30.");
wrapLook("thermos", () => "Your steel thermos, NELL in marker. Keep it away from the MRI.");

const SIGNIN = () => {
  let s = `<rect class="k sW" x="200" y="40" width="240" height="250"/><rect class="k sA" x="290" y="30" width="60" height="18"/>`;
  s += seg("PARTICIPANT SIGN-IN   VALU STUDY", 214, 58, 6, "sW", 1);
  [["H. MOLAISON", "MAR 2"], ["P. GAGE", "MAR 2"], ["S.M.", "MAR 9"], ["TOTALLY REAL PERSON", "MAR 9"]].forEach(([n, d], i) => {
    const y = 90 + i * 44; s += `<path class="hl sM" d="M214,${y + 22} L426,${y + 22}"/>` + seg(n, 216, y + 4, 9, "sB", 1.3) + seg(d, 386, y + 8, 6, "sM", 1);
  });
  return s + seg("CHECKED IN BY: CODY (AT VENDING MACHINE)", 214, 270, 5, "sM", .9);
};
// the 3T's booking sheet, as Tess's console shows it: this week's bookings, then six months of totals, then a search
const CALENDAR = () => {
  let s = `<rect class="k sW" x="96" y="22" width="448" height="300"/>` + seg("3T SCANNER BOOKINGS", 112, 34, 9, "sW", 1.3) + seg("WEEK OF OCT 26", 400, 36, 6, "sM", 1)
    + `<path class="hl sW" d="M112,52 L528,52"/>`;
  const wk = [["MON-SUN 02:30", "G. IAN", "NIGHT SESSION. EVERY NIGHT.", "sB"],
    ["MON 07:00", "T. LA", "QA: PHANTOM, SNR, GHOSTING", "sA"],
    ["MON 14:00", "ADLINE LAB", "RETINOTOPY, 3 SUBJECTS", "sG"],
    ["WED 10:00", "ADLINE LAB", "ATTENTION AND CONTRAST", "sG"],
    ["THU 06:30", "T. LA", "HELIUM TOP-UP. DO NOT BOOK.", "sA"],
    ["FRI 23:59", "(NO NAME)", "MOCK CALIBRATION. 4 HRS.", "sM"]];
  wk.forEach(([when, who, what, c], k) => { const y = 62 + k * 20;
    s += seg(when, 112, y, 6, "sW", 1) + seg(who, 222, y, 6, c, 1) + seg(what, 310, y, 6, k === 5 ? "sM" : "sW", .9); });
  s += `<path class="hl sM" d="M112,186 L528,186"/>` + seg("JAN - JUN  SESSIONS", 112, 194, 5, "sM", .8);
  // six months: Gus every night, Tess's QA twice a week, the mock calibration every Friday, Adline's lab now and then
  const tot = [["G. IAN", 181, "sB"], ["T. LA (QA)", 52, "sA"], ["MOCK CAL.", 26, "sM"], ["ADLINE LAB", 34, "sG"], ["P. VALU", 0, "sR"]];
  tot.forEach(([who, n, c], k) => { const y = 208 + k * 15;
    s += seg(who, 112, y, 5.5, c, .9) + seg(String(n).padStart(2, "0"), 196, y, 5.5, c, .9);
    if (n) s += `<rect class="hl ${c}" x="224" y="${y}" width="${(n / 181 * 300).toFixed(1)}" height="6"/>`; else s += seg("NONE. NOT ONE SESSION.", 224, y, 5.5, "sR", 1); });
  return s + `<rect class="hl sR" x="380" y="270" width="148" height="40"/>` + seg("SEARCH: VALU", 388, 278, 5.5, "sW", .9) + seg("0 RESULTS", 388, 294, 8, "sR", 1.3);
};
const INDEX = () => {
  let s = `<rect class="k sW" x="160" y="34" width="320" height="262"/>` + seg("THE BINDER OF BINDERS", 180, 48, 9, "sW", 1.3);
  [["TESLA, N.", "SHELF B, BINDER 3"], ["UNDERWOOD, J.", "SHELF A, BINDER 40"], ["VALU, P.", "SEE: RISING STARS (SPECIAL)"],
   ["VALENTINE, R.", "SHELF C, BINDER 7"], ["RISING STARS (SPECIAL)", "SHELF R, BINDER 12"]].forEach(([a, b], i) => {
    const y = 84 + i * 38; s += seg(a, 180, y, 6.5, a.startsWith("VALU") || a.startsWith("RISING") ? "sA" : "sM", 1) + seg(b, 300, y, 5.5, a.startsWith("VALU") || a.startsWith("RISING") ? "sW" : "sM", .9);
  });
  return s;
};
const PROTOCOL = () => {
  let s = `<rect class="k sV" x="150" y="40" width="340" height="250"/>` + seg("IRB PROTOCOL 2024-0412", 170, 56, 9, "sW", 1.3);
  s += seg("PI: P. VALU     LAMINAR SYNERGY AT 7T", 170, 82, 6, "sM", 1);
  s += seg("APPROVED", 170, 120, 6, "sM", 1) + seg("JUNE 3", 170, 132, 22, "sR", 1.8);
  s += seg("HIS PAPER: DATA COLLECTED", 330, 120, 5, "sM", .9) + seg("JAN - MAR", 330, 132, 22, "sB", 1.8);
  return s + seg("RISING STARS (SPECIAL): EXPEDITED. NO CONTINUING REVIEW.", 170, 262, 5, "sA", .9);
};

/* ---------------- conversations ---------------- */
export const CONVOS = {
  morrisJoin: { L: "nell", R: "morris", score: ["morrisJoin", 1], lines: [
    ["R", "Pal. Psst. Drawer."],
    ["L", "Morris. I need Tess's scanner calendar, Penny's purchase orders, Ethel's binders and Cody's clipboard. Today."],
    ["R", "You need someone who fits through walls."],
    ["L", "I need someone who doesn't bite people."],
    ["R", "Pick one."],
    ["N", "MORRIS JOINS. Click a name in the corner (or press Tab) to switch. Morris travels through the vents."],
  ], after: (api) => { const G = api.G; G.flags.morrisJoined = true; G.flags.morrisInDrawer = false; G.cast = ["nell", "morris"];
    G.chars.morris = { room: "lab", x: 222, y: 284, dir: 1 }; api.refresh(); } },

  tess: { L: "nell", R: "tess", score: ["tessTalk", 1], lines: [
    ["R", "Zone III. Metal in the locker. Keys, coins, thermos, ambition."],
    ["L", "Tess, I just need to look at the scanner calendar."],
    ["R", "The calendar is a sacred trust. Scanner time is the only fair thing in this building."],
    ["L", "Did Preston Valu ever book the 3T?"],
    ["R", "Who's asking?"], ["L", "His… fan club."],
    ["R", "Nobody sees the calendar. And nobody touches the old B-level breaker, either. Something pulls power down there every Friday at midnight. Facilities calls it 'heritage load.'"],
    ["N", "Tess turns back to her console. She guards the calendar like a dragon guards a hoard, if the hoard were half-hour blocks."],
  ] },

  // after the calendar: Tess stops guarding it and starts agreeing with Nell, out loud, which is why she dies tonight
  tessTurn: { L: "nell", R: "tess", score: ["tessTurn", 1], lines: [
    ["N", "Tess stomps back in from the magnet room."],
    ["R", "Rats. A building full of scientists and it's overrun with rats. Who chewed my wire?"],
    ["R", "…You looked."],
    ["L", "He never booked it, Tess. Not once."],
    ["R", "I know. I keep the calendar. I know who's in my building. I'm down here twelve hours a day, and in three years I've seen Preston Valu four times."],
    ["R", "All four, there was pizza."],
    ["R", "Then the paper comes out. Seven tesla. Layers. From my three. I've run QA on this magnet every morning since 2011. It doesn't do layers. Some mornings it barely does Tuesday."],
    ["L", "So you think something's off."],
    ["R", "I think something's off. I said so at the faculty lunch. To the Chair. He said 'interesting' and wrote it down. Nobody in this building writes anything down."],
    ["R", "So tonight I'm pulling the console's raw logs. Every session since January, every sequence, every coil. If there's one seven tesla protocol in there, I'll eat my ear defenders."],
    ["R", "Then it goes to Ethel Bord. In writing. With a cover sheet."],
    ["L", "Tess, maybe don't do that alone."],
    ["R", "Alone is how I do everything. The magnet is always on, Nell. So am I."],
    ["N", "Somewhere behind the wall, a pneumatic canister drops toward the basement. Then another."],
    ["N", "A note from your narrator: in a comedy, the character who announces she'll do something brave, tonight, by herself, should be watched closely."],
  ] },

  penny: { L: "nell", R: "penny", score: ["pennyTalk", 1], lines: [
    ["R", "Main office. Take a number."], ["L", "There's nobody else here."], ["R", "Take a number anyway. It's policy."],
    ["L", "I need to see a purchase order. For a 7T. Or a laminar coil: the antenna helmet you'd need to scan brain layers. Anything Preston Valu bought."],
    ["R", "Purchase orders are confidential, hon. File Form PO-7, signed by a PI."],
    ["L", "My PI is unavailable until after the 15th."],
    ["R", "Everyone important is unavailable. Friday nights, it's every single one of them. Every Friday. For decades. I've stopped asking where."],
    ["R", "Form PO-7. Pink. Here."],
  ], after: (api) => { api.flag("gotPO7", true); api.give("po7"); } },

  pennyPO: { L: "nell", R: "penny", score: ["clueCoil", 3], lines: [
    ["R", "Signed by a PI. In ink, even. Well, well."],
    ["R", "Valu, Preston. Purchase orders: fourteen boxes of espresso pods. One ring light. A 'synergy consultant,' two days."],
    ["L", "A 7T? A laminar coil? A head coil of any kind?"],
    ["R", "Nobody ordered a coil. Not ever. Not one coil in thirty years, hon. You can't buy a 7T on the department credit card."],
    ["N", "\"Nobody ordered a coil\" is exactly the kind of sentence worth having on tape."],
  ], after: (api) => { api.flag("clueCoil", true); api.take("po7s"); } },

  ethel: { L: "nell", R: "ethel", score: ["ethelTalk", 1], lines: [
    ["R", "Research Integrity. Whisper."],
    ["L", "I'd like to see an ethics protocol. Preston Valu's."],
    ["R", "Protocols are public record. No study touches a single human being until one is approved. Find it yourself. Everything is filed by the Binder of Binders."],
    ["R", "And do not pull binders at random. The shelves are load-bearing."],
  ] },

  cody: { L: "nell", R: "cody", score: ["codyTalk", 1], lines: [
    ["R", "Hi! Are you here for the study? Sign in! Wait. You're the stats TA."],
    ["L", "Cody. You ran Preston's participants?"],
    ["R", "I checked them in! On the clipboard. Well. They checked themselves in. I was at the vending machine a lot."],
    ["L", "Can I see the clipboard?"],
    ["R", "It's confidential! I think? Preston said so. He also said he'd sign my credit slip. That was in March."],
    ["L", "Cody, Preston says he ran every single subject himself."],
    ["R", "Himself? He told ME I was running them. He wouldn't say that. I'd have to hear him say it."],
    ["N", "Nell's voice memo recorder caught Preston saying exactly that, at journal club. Cody can hear it for himself: USE the recorder ON Cody."],
  ], after: (api) => api.flag("codyTalked", true) },

  codyMemo: { L: "nell", R: "cody", score: ["codyMemo", 2], lines: [
    ["N", "PRESTON (RECORDED): \"…I ran every subject myself.\""],
    ["R", "Himself? But… I ran them. Well. I sat there."],
    ["R", "Did I ever actually see a participant?"],
    ["R", "Huh. I never saw a participant."],
  ], after: (api) => api.flag("codyShaken", true) },

  codySlip: { L: "nell", R: "cody", score: ["clueClipboard", 3], lines: [
    ["R", "My credit slip! Signed and everything!"],
    ["R", "Wait. 'P. Valu' is in a font."],
    ["L", "The clipboard, Cody."],
    ["R", "Right. Fair trade. Honestly, I don't want it anymore."],
  ], after: (api) => { api.take("slip"); api.give("clipboard"); api.flag("gotClipboard", true); api.flag("clueClipboard", true); api.refresh(); } },

  smallMorning: { L: "nell", R: "small", lines: [
    ["R", "Detective Sergeant Small. Campus police."],
    ["R", "One body. That's a small sample. I don't like to generalize from one body."],
    ["L", "Tess."],
    ["R", "Found at 7:40 by the overnight tech. Struck by a thermos traveling at roughly forty miles an hour. The magnet did the throwing."],
    ["R", "The thermos says NELL."],
    ["L", "It was in the locker. Tess made me put it there. Yesterday."],
    ["R", "Then who took it out?"],
    ["L", "…"],
    ["L", "She was pulling the console logs last night. Every session since January. She told me she was going to prove Preston never scanned."],
    ["R", "The console was wiped at 2:14 AM. Logs, calendar backups, QA history. Factory settings."],
    ["R", "Your fingerprints are on the console, Ms. Null. Hers are on the logs she never got to print."],
    ["R", "Don't leave the building, Ms. Null. Well. Do. Just come back."],
  ], after: (api) => api.flag("smallDone", true) },

  gusMorning: { L: "nell", R: "gus", lines: [
    ["R", "Nell."],
    ["L", "Gus? You look like you slept in the scanner."],
    ["R", "Next to it. I fell asleep in the lab around four. I was here all night."],
    ["R", "Wasn't you. Saw robes."],
    ["R", "Two of them, around two. Hooded. One had a little red pin, lit up. They went down the stairwell, past the basement. There isn't a past the basement."],
    ["R", "Also this."],
    ["N", "Gus hands Nell the printout from Preston's computer. A paper about the neural basis of something that doesn't have one."],
    ["R", "Nell, this is foul play."],
    ["L", "Then we work it together."],
    ["R", "I'll get coffee. The good coffee. The kind with a methods section."],
  ], after: (api) => { api.flag("gusDone", true); api.endAct(); } },
};

/* ---------------- Morris and the vents ---------------- */
const VENTS = [["lab", "ADLINE LAB 114"], ["hall", "HALLWAY 1F"], ["mri", "MRI CONTROL B1"], ["office", "MAIN OFFICE 1F"], ["kitchen", "COFFEE KITCHEN 1F"]];
const ARRIVE = {
  mri: "MORRIS|Pal. This room is pulling on my head. Like a magnet. Because it is one.",
  office: "PENNY|RAT! RAT! …Oh. It's just a rat. For a second I thought it was the Provost.",
  kitchen: "REX|A rat. Great. Even the rats in this building have tenure.",
};
async function vent(api) {
  const d = await api.chooseFrom("MORRIS TAKES THE VENTS. WHERE TO?", VENTS.filter(([id]) => id !== api.G.room));
  if (!d) return null;
  api.goRoom(d + "@vent"); api.blip([300, 500, 700]);
  const k = "arrive_" + d; if (ARRIVE[d] && !api.flag(k)) { api.flag(k, true); return ARRIVE[d]; }
  return null;
}
const ventHS = { label: "vent", morris: { look: "A vent. Morris's highway. It smells like every room in the building at once.", use: vent },
  day: { look: "A low vent grille. Morris could fit through it. You could not." } };

/* ---------------- hotspots ---------------- */
export const HS = {
  // the coffee kitchen, Tuesday
  kitchen: {
    rex: { label: "Dr. Rex Jected", day: { look: "Rex, at the counter, with the empty mug. Same spot as yesterday. Possibly the same breath.",
        talk: "REX|A physicist died in the magnet room and they still haven't fixed this machine. That tells you everything about priorities.\n\nREX|DESCALE. Day 5,000-something." },
      morning: { look: "Rex, already here. Nobody has ever arrived before Rex.", talk: "REX|Morning. It says DESCALE. I'll let you know if that changes." },
      morris: { look: "REX|Don't. Don't even, rat." } },
    espresso: { label: "espresso machine", day: { look: "DESCALE. A sticker on the side: DESCALE WITH ANY MILD ACID. Under it, in Sharpie: WE HAVE NO ACID. —R", use: "REX|That's my button." },
      morning: { look: "DESCALE, blinking, on schedule." }, night: { look: "DESCALE, in the dark. Gus respects its consistency." },
      morris: { look: "MORRIS|There's fourteen years of limescale in there, pal. I can hear it." } },
    mugs: { label: "mug tree", day: { look: "The mug tree. WORLD'S OKAYEST PI. I ♥ P < .05. The brain mug, unused." }, morris: { look: "Morris can't reach." } },
    fridge: { label: "fridge", day: { look: "The fridge. DO NOT DRINK — SAMPLE, on the oat milk. Your lasagna, N.N., untouched since Monday. Murder is bad for lunch." },
      morris: { look: "MORRIS|I've been in there. Don't." }, night: { look: "The fridge hums." } },
    board: { label: "corkboard", day: { look: "WHO TOOK MY OAT SYNERGY. CLEAN YOUR MUG (THIS MEANS YOU, P.V.). And a typed card: WHO KEEPS BOOKING THE OLD B-LEVEL ROOM ON FRIDAYS? Nobody's answered." },
      morning: { look: "WHO KEEPS BOOKING THE OLD B-LEVEL ROOM ON FRIDAYS? Still nobody's answered." }, morris: { look: "Too high." } },
    invite2018: realHS("invite2018", "a folded card"),
    sink: { label: "sink", day: { look: "The sink. A geological record of mugs." }, morris: { look: "Morris drinks from the drip. Morris is fine." } },
    door: { label: "door to hallway", day: { look: "The hallway.", go: "hall@fromKitchen" }, morris: { look: "Door.", go: "hall@fromKitchen" },
      night: { look: "The hallway.", go: "hall@fromKitchen" }, morning: { look: "The hallway.", go: "hall@fromKitchen" } },
    vent: ventHS,
  },

  lab: {
    door: { label: "door to hallway", day: { look: "The hallway.", go: "hall@fromLab" }, morris: { look: "A door. Morris prefers vents.", go: "hall@fromLab" },
      night: { look: "The hallway.", go: "hall@fromLab" } },
    monitor: { label: "your monitor",
      day: { look: "MATLAB: RESULTS NOT SIGNIFICANT. And a new email: DEFENSE ROOM CONFIRMED: 101, FRIDAY 2 PM. Also confirmed: P. VALU, JOB TALK, 101, FRIDAY 2 PM.", use: "You rerun the analysis. p = .48. Consistency is a kind of rigor." },
      morris: { look: "Morris walks across the keyboard. MATLAB opens fourteen windows. All of them say N.S.", use: "Morris sits on the space bar. p = .48." },
      night: { look: "Nell's screensaver. N.S., bouncing.", use: "Gus nudges the mouse. A sticky on the monitor: GUS, WEIRD DAY. TELL YOU TONIGHT. —N" } },
    drawer: { label: (api) => api.flag("morrisInDrawer") ? "Morris" : "desk drawer",
      day: { look: (api) => api.flag("morrisInDrawer") ? "Morris, in the drawer, looking at you with the expression of a rat who has a plan." : "Your drawer. Shredded rejection letters. A rat-shaped dent.",
        talk: (api) => !api.flag("morrisJoined") ? "c:morrisJoin" : "Morris isn't in the drawer. Click his name to switch to him.",
        use: "Shredded rejection letters. You recognize a few." },
      morris: { look: "Home. Shredded rejection letters. Smells like Nell.", use: "Morris naps for four seconds. Refreshed." } },
    whiteboard: { label: "whiteboard", day: { look: "p = .48. N.S. WHY. DEFENSE FRI 2PM!! And, new this morning, in Nell's writing: DID HE RUN ANYONE?", use: "You underline DID HE RUN ANYONE. Twice." },
      morris: { look: "Morris can't reach the whiteboard. He judges it from below." } },
    adline: { label: "Prof. Adline's office",
      day: { look: "AFTER THE 15TH. Through the door: frantic typing, three phones, and the sound of someone signing things very fast.", talk: "PROF. ADLINE (THROUGH THE DOOR)|Nell? Is it urgent? AFTER THE FIFTEENTH!", use: "Locked. She's signing things in there. Anything that slides under the door, probably." },
      morris: { look: "Morris listens at the door. 'She's signing stuff, pal. Anything that moves.'" } },
    booth: { label: "dark booth",
      day: { look: "The dark-adapted psychophysics booth. Still dark. Still tempting.", use: boothNap("You sit in the dark booth just for a minute, to think. Your eyes adapt. Your thoughts slow. Your eyelids file a formal complaint and win.\n\nYou wake up on Saturday. Your defense was yesterday. Preston gave a lovely job talk in your slot."), go: openConsole },
      morris: { look: "MORRIS|I've seen what the dark does to grad students, pal. No." } },
    viv: VIV,
    gusdesk: { label: "Gus's desk",
      day: { look: "Gus's desk. Closed laptop, headphones, a mug that says I ♥ GAUSSIANS, a vivarium with one very blue frog in it. A sticky note: '2:30a scan. If I'm not here, I'm in the scanner. Don't wake me.'",
        use: (api) => { api.flag("noteForGus", true); return "You stick a note on Gus's laptop: WEIRD DAY. TELL YOU TONIGHT. He'll see it at 2 AM."; } },
      morris: { look: "Morris sniffs the mug. 'This guy's all right, pal.'" },
      night: { look: "Gus's own desk. His laptop, his mug, and a sticky note from Nell: WEIRD DAY. TELL YOU TONIGHT." } },
    vent: ventHS,
  },

  hall: {
    door101: { label: "Seminar Room 101", day: { look: "Seminar Room 101. Dark on Tuesdays.", go: "Locked. Journal club is Mondays." },
      morris: { look: "101. Morris checks under the door for pizza. None." }, night: { look: "101. Dark.", go: "Locked." } },
    fountain: { label: "water fountain", day: { look: "The fountain from 1962.", use: "Still tastes like 1962." }, morris: { look: "Morris can't reach. Morris has never been able to reach." },
      night: { look: "The fountain hums.", use: "Gus drinks." } },
    stars: { label: "Rising Stars wall",
      day: { look: "RISING STARS. Preston's photo is bigger again, and there's a new line under it: CITATIONS 147,794. That's how many times other papers have cited his. Most professors retire with a few thousand. He's a third-year.", use: "You straighten the photo. It un-straightens.", score: { look: ["starsCites", 1] } },
      morris: { look: "Morris looks up at Preston's photo. His head itches." },
      night: { look: "Preston's photo, smiling in the dark. CITATIONS 147,794. Six digits.\n\nGus files that away.", score: { look: ["starsNight", 1] } } },
    board: { label: "bulletin board", day: { look: "The two flyers. DEFENSE: NELL NULL. JOB TALK: PRESTON VALU. Same room, same hour. Someone has drawn a heart on his." },
      night: { look: "The two flyers, in the dark." } },
    impact: { label: "Impact Lab 116",
      day: { look: "IMPACT LAB 116. Brushed steel, no window. Preston is in there every afternoon, 'networking.' The keypad wants six digits.", use: "You try 123456. The keypad sighs." },
      morris: { look: "Morris sniffs the gap under 116. 'Incense, pal. And money.'" },
      night: { look: "IMPACT LAB 116. Under the night lights, four of the keypad's keys are worn shiny: 1, 4, 7 and 9. Six digits to enter.",
        use: async (api) => {
          if (!api.flag("impactOpen")) {
            if (!api.flag("keypadLine")) { api.flag("keypadLine", true); await api.say("GUS|Four keys, six digits. That's 1,560 possibilities. Preston's vanity makes it one."); }
            const ok = await api.keypad("147794", ["1", "4", "7", "9"]);
            if (!ok) { api.G.flags.keypadFails = (api.G.flags.keypadFails || 0) + 1;
              return api.G.flags.keypadFails < 2 ? "Gus steps back from the keypad. Something about Preston is six digits long."
                : "Gus steps back from the keypad. Something about Preston is six digits long.\n\nGUS|Six digits. All of them 1, 4, 7 or 9. And a man who re-hangs his own photo every morning. The Rising Stars wall is ten feet away."; }
            api.flag("impactOpen", true); api.score("keypad", 3);
          }
          api.goRoom("impact@fromHall"); return null;
        } } },
    tube: { label: "tube station", day: { look: "The pneumatic tube. A canister rattles past, going down.", use: "Empty. It smells faintly of incense." },
      night: { look: "Canisters, going down. Lots of them tonight.", use: "Gus listens. Rattling. Then, faintly, something like a gavel." } },
    stairs: { label: "stairwell",
      day: { look: "The stairwell. Down: the basement, the MRI suite. Up: the second floor, Research Integrity.", go: { down: "mri@fromStairs", up: "ethics@fromStairs" } },
      morris: { look: "Stairs. Morris doesn't do stairs. Morris does vents." },
      night: { look: (api) => api.flag("robesSeen") ? "The robes went down here. Down past the basement." : "The stairwell. Gus's scan is in the basement at 2:30.",
        go: { down: async (api) => {
          if (!api.flag("robesSeen")) return "Not yet. Gus's scan isn't until 2:30, and he has a feeling about 116.";
          api.sfx("buzz"); await api.say("Gus takes the stairs two at a time. The robes are just below him, then just below that, then gone.\n\nHis phone buzzes. SCANNER: GRADIENT FAULT. SESSION PAUSED. BILLING CONTINUES.\n\nGUS: Not now…");
          await api.say("He runs to the control room, resets the gradients in four minutes flat, and comes back. The stairwell is empty. Whatever went down went further down than the basement goes.");
          api.score("followed", 1); await morning(api); return null; },
          up: "Nothing good is upstairs at 2 AM." } } },
    kitchen: { label: "coffee kitchen", day: { look: "The coffee kitchen. Rex is in there. Rex is always in there.", go: "kitchen@fromHall" },
      morris: { look: "Food smells.", go: "kitchen@fromHall" }, night: { look: "The coffee kitchen. Dark.", go: "kitchen@fromHall" },
      morning: { look: "The coffee kitchen.", go: "kitchen@fromHall" } },
    exitH: { label: "exit sign", day: { look: "EXIT." }, night: { look: "EXIT. Red. Humming." } },
    office: { label: "main office", day: { look: "The main office. BACK IN 5 MIN. Someone is plainly in there.", go: "office@fromHall" },
      morris: { look: "The main office. Morris uses the vent. Doors are for people with hands." }, night: { look: "Dark. Locked.", go: "Locked." } },
    lab: { label: "Adline Lab 114", day: { look: "Your lab.", go: "lab@fromHall" }, morris: { look: "Home.", go: "lab@fromHall" }, night: { look: "The Adline Lab.", go: "lab@fromHall" } },
    vent: ventHS,
  },

  mri: {
    window: { label: "magnet room window",
      day: { look: "The magnet room. The 3T sits in its bore like a giant donut that never turns off. Nothing metal goes in there. Not twice.", score: { look: ["magnetLook", 1] } },
      morris: { look: "Morris presses his nose to the glass. His implant hums. MORRIS: Pal, this thing is pulling on my head.", score: { look: ["implantSeed", 1] } },
      morning: { look: "Police tape across the glass. Inside, stuck to the face of the magnet, a steel thermos. NELL, in marker, facing out." } },
    tess: { label: "Dr. Tess La",
      day: { look: "Dr. Tess La, MRI physicist. Ear defenders around her neck. She has not left this console since 2011.", talk: "c:tess", use: "Zone III rules apply to touching Tess." },
      morris: { look: "Tess hasn't noticed Morris. She's watching the helium readout like it owes her money." } },
    tessfar: { label: "Tess, in the magnet room", day: { look: "Through the glass: Tess, fussing at the magnet's helium readout. She'll be a while." },
      morris: { look: "Tess, in the magnet room, yelling at the helium. Morris feels mildly guilty. Mildly." } },
    calendar: { label: "scanner calendar",
      day: { look: (api) => calendar(api), use: (api) => calendar(api) },
      morris: { look: "Morris can't read. He could chew the calendar. Professional courtesy says no." } },
    locker: { label: "metal locker",
      day: { look: (api) => "ZONE III: everything magnetic goes in here before you go near the magnet." + (api.flag("thermosLocked") ? " Your thermos is in there. NELL faces out through the vents." : ""),
        use: (api) => { if (!api.has("thermos")) return "Nothing metal on you. The locker seems disappointed.";
          api.take("thermos"); api.flag("thermosLocked", true); api.score("locker", 1); api.refresh();
          return "You put your thermos in the locker. NELL, in marker, faces out through the vents.\n\nTESS|Good. The magnet is always on."; } },
      morning: { look: "The locker door hangs open. Empty." } },
    sign: { label: "sign", day: { look: "THE MAGNET IS ALWAYS ON. Underlined three times." }, morning: { look: "THE MAGNET IS ALWAYS ON. Someone forgot." } },
    console: { label: "scanner console",
      day: { look: "The scanner console: three screens, a helium gauge, and a big red button labeled QUENCH. It boils off all the helium and kills the magnet in under a minute. Nobody presses QUENCH.", use: (api) => api.flag("heliumAlarm") ? "You don't touch the console. You came for the calendar." : "TESS|Hands off my console." },
      morris: { look: "Behind the console: warm wires. Morris's favorite kind." } },
    wires: { label: "wires",
      morris: { look: "A bundle of warm wires behind the console. One is labeled HE LEVEL SENSOR: helium, the liquid that keeps the magnet cold. Tess loves her helium more than people.",
        use: (api) => { if (api.flag("heliumAlarm")) return "Already chewed. Morris has standards.";
          if (api.flag("clueCalendar")) return "Morris has done enough damage here. Probably.";
          api.flag("heliumAlarm", true); api.score("wires", 2); api.refresh(); api.sfx("alarm");
          return "Morris chews. A spark. Alarms: ((( HELIUM LOW )))\n\nTESS|MY HELIUM!\n\nTess sprints into the magnet room. The calendar sits unguarded. Now switch back to Nell."; } } },
    vent: ventHS,
    cody: { label: "Cody",
      day: { look: (api) => "Cody Credit, undergrad RA. " + (api.flag("gotClipboard") ? "He's lighter without the clipboard. Spiritually." : "He's been waiting with the sign-in clipboard since March."),
        talk: (api) => !api.flag("codyTalked") ? "c:cody"
          : api.flag("gotClipboard") ? "CODY|I'm going to go find a participant. Any participant. Just to see one."
          : api.flag("codyShaken") && api.has("slip") ? "c:codySlip"
          : !api.flag("codyShaken") ? "CODY|Preston ran every subject himself? I'd have to hear him say it.\n\n(Your recorder has him saying it. USE the recorder ON Cody.)"
          : "CODY|I'd trade the clipboard for my credit slip. Preston promised. In March. Credit slips print in the main office, if the printer ever works." },
      morris: { look: "Cody sees Morris and waves. Cody waves at everything." } },
    door: { label: "stairs up", day: { look: "Back up the stairs.", go: "hall@fromStairs" }, morris: { look: "Stairs. Vent." }, morning: { look: "The stairs.", go: "Det. Small would like you to stay." } },
    magnetdoor: { label: "magnet room door",
      day: { look: "The magnet room door. A red sign, a red line on the floor. The field never sleeps.",
        use: (api) => api.has("thermos") && !api.flag("magnetWarned")
          ? (api.flag("magnetWarned", true), "You reach for the magnet room door. Your bag lurches toward it on its own. Something steel in there would very much like to meet the magnet.\n\nTESS|METAL. LOCKER. NOW.")
          : api.has("thermos")
          ? api.die("You step over the red line with a steel thermos in your bag.\n\nThe magnet introduces itself. The thermos leaves your bag at forty miles an hour, and so, briefly, do you.\n\nTESS: The magnet is ALWAYS ON.")
          : (api.flag("heliumAlarm") ? "TESS (FROM INSIDE)|OUT! Helium emergency!" : "TESS|Nobody goes in my magnet room. Not today.") },
      morris: { look: "MORRIS|Not a chance, pal. My head's got hardware in it." },
      morning: { look: "Police tape. Det. Small's orders." } },
    small: { label: "Det. Sgt. Small", morning: { look: "Detective Sergeant Small, campus police. A notebook full of power calculations.", talk: "c:smallMorning" } },
    gus: { label: "Gus",
      morning: { look: "Gus, in yesterday's cardigan, holding a printout like it's evidence. It is.", talk: (api) => api.flag("smallDone") ? "c:gusMorning" : "GUS|Talk to the detective first. Trust me." } },
  },

  office: {
    penny: { label: "Penny Ledger",
      day: { look: "Penny Ledger, department administrator. Headset, reading glasses on a chain, the only key to everything. The real power in the building.",
        talk: (api) => api.flag("clueCoil") ? "PENNY|Nobody ordered a coil, hon. I'd remember. I remember everything." : api.has("po7s") ? "c:pennyPO"
          : api.flag("gotPO7") ? "PENNY|Form PO-7. Signed. By a PI. Your PI's the one behind the door that says AFTER THE 15TH, hon? Slide it under. During a deadline they sign anything." : "c:penny",
        use: "Nobody touches Penny." },
      morris: { look: "Penny is standing on her chair. She has not stopped saying RAT." } },
    cabinet: { label: "purchase order cabinet", day: { look: "PURCHASE ORDERS 1968–PRESENT. Locked. Penny has the key, and Penny has rules.", use: "PENNY|Form PO-7, hon." },
      morris: { look: "Morris could get in the back of the cabinet. Morris can't read purchase orders. A rat has limits." } },
    forms: { label: "form rack", day: { look: "Forms in every color. PO-7 is pink. There's a form for requesting forms.",
      use: (api) => { if (api.has("po7") || api.has("po7s") || api.flag("clueCoil")) return "You have the form you need. Don't get greedy."; api.give("po7"); api.flag("gotPO7", true); return "You take a Form PO-7. Pink. PENNY|I saw that. It's fine. It's a form."; } } },
    printer: { label: "printer",
      day: { look: (api) => api.flag("printerFixed") ? "The office printer, working. Penny regards it with suspicion." : "The office printer. A red JAM light. A sticky note: JAMMED SINCE AUGUST. DO NOT OPEN.",
        use: (api) => {
          if (!api.flag("printerFixed")) return "The printer whirs, considers it, and declines. JAM. Something small could get in there, maybe.";
          if (api.has("slip") || api.flag("gotClipboard")) return "The printer has done its part.";
          api.give("slip"); api.score("slip", 1);
          return "You print a research credit slip. It comes out pre-signed: P. VALU, in a font. Nobody has ever actually signed one of these."; } },
      morris: { look: (api) => api.flag("printerFixed") ? "The printer, fixed. Morris takes a bow." : "A printer, jammed. Morris can see the jam from here: a crumpled flyer, deep inside.",
        use: (api) => { if (api.flag("printerFixed")) return "Morris has done enough printer work for one career.";
          api.flag("printerFixed", true); api.score("printer", 2); api.refresh(); api.sfx("printer");
          return "Morris crawls into the printer. Grinding. Squeaking. A crumpled 2019 holiday party flyer shoots out, followed by Morris.\n\nThe JAM light goes off.\n\nPENNY|…It works? Nobody touch anything."; } } },
    mailboxes: { label: "mailboxes",
      day: { look: "Pigeonholes. Preston's is overflowing: award letters, speaking invitations, and an envelope sealed with round red wax. A circle inside a circle.", use: "You don't take other people's mail.", score: { look: ["waxSeal", 1] } },
      morris: { look: "Morris sniffs the wax-sealed envelope. MORRIS: Incense and old money, pal." } },
    sign: { label: "sign", day: { look: "BACK IN 5 MIN. Penny is right there. The sign isn't a status. It's a lifestyle." } },
    door: { label: "door to hallway", day: { look: "The hallway.", go: "hall@fromOffice" }, morris: { look: "A door. Vent." } },
    vent: ventHS,
  },

  ethics: {
    ethel: { label: "Ethel Bord",
      day: { look: "Ethel Bord, Research Integrity Officer. Half-moon glasses, three lanyards, and a 'shh' older than the building.", talk: (api) => api.flag("ethelTalked") ? "ETHEL|Shh." : (api.flag("ethelTalked", true), "c:ethel") } },
    index: { label: "the Binder of Binders",
      day: { look: (api) => readIndex(api), use: (api) => readIndex(api) } },
    shelfA: { label: "binders (shelf A)", day: { look: "Shelf A: amendments, 1970s and 80s.", use: (api) => avalanche(api) } },
    shelfB: { label: "binders (shelf B)", day: { look: "Shelf B: continuing review, 1990s. Each binder weighs as much as a small dog.", use: (api) => avalanche(api) } },
    shelfC: { label: "binders (shelf C)", day: { look: "Shelf C: adverse events. Mostly papercuts from shelf B.", use: (api) => avalanche(api) } },
    shelfR: { label: "red shelf (R)",
      day: { look: "The top shelf: red binders, RISING STARS (SPECIAL). Out of reach.",
        use: async (api) => {
          if (!api.flag("stoolPlaced")) return "Too high, even on tiptoe. There's a step stool by Ethel's desk.";
          if (!api.flag("sawIndex")) return "Forty red binders. Which one? Pulling at random is how people end up under Shelf B.";
          if (api.flag("clueIRB")) return "You already have what you need from R-12.";
          await api.readout(PROTOCOL(), "The IRB, the ethics board, approved it June 3. His paper says the data were collected January through March.\n\nEthics approval, three months after the fact. 'Expedited,' says the binder. 'No continuing review.' Rising Stars don't get reviewed. They get filed.");
          api.flag("clueIRB", true); api.score("clueIRB", 3); return null; } } },
    stool: { label: "step stool", day: { look: (api) => api.flag("stoolPlaced") ? "The step stool, under the red shelf." : "A step stool by Ethel's desk. Sturdy. Beige.",
      use: (api) => { if (api.flag("stoolPlaced")) return "It's where it needs to be."; api.flag("stoolPlaced", true); api.score("stool", 1); api.refresh(); return "You drag the step stool under the red shelf.\n\nETHEL|Shh. (She means the stool.)"; } } },
    window: { label: "window", day: { look: "The parking lot. Prof. Quorum's car takes up two spaces. Both are labeled QUORUM." } },
    door: { label: "stairs down", day: { look: "Back down.", go: "hall@fromStairs" } },
  },

  impact: {
    pc: { label: "Preston's computer",
      night: { look: "Preston's computer, still logged in. For a split second the screen says FOG NEURO, then corrects itself: COG NEURO.",
        use: async (api) => {
          const out = await api.fogNeuro({ canPrint: !api.flag("printed") });
          if (out.generated) api.score("fogGen", 1);
          if (out.sources) api.score("fogSources", 2);
          if (out.feud) api.score("fogFeud", 1);
          if (out.printed && !api.flag("printed")) { api.flag("printed", true); api.flag("printTitle", out.paper.title); api.give("printout"); api.score("printed", 2);
            return "Gus takes the printout off the printer. He doesn't fully know what it is. It looked important.\n\nGUS|Every press, a new paper. Consciousness. Nostalgia. Brunch. None of it was ever done."; }
          if (!api.flag("printed")) return "Gus logs off without printing anything.\n\nGUS|Nell's going to want something she can hold. GENERATE, then PRINT. Then get out.";
          return out.generated ? "Gus logs off. The machine is still warm. It writes papers. It writes Preston." : null; } } },
    gainpanel: { label: "second monitor",
      night: { look: "A second monitor. GAIN CONTROLLER · SUBJECT: P.V. · STATUS: LISTENING. A dial, and a green bar rising and falling like breathing.",
        use: (api) => !api.flag("dialWarned") ? (api.flag("dialWarned", true), "Gus reaches for the dial. The green bar stops rising and falling, and holds, as if it's waiting to see what he'll do.\n\nGUS|…Nope. Not turning a dial labeled SUBJECT: P.V. Not yet, anyway.") : api.die("Gus turns the dial, just a little.\n\nThree floors away, Preston sits bolt upright and begins to recite the Methods section of every paper ever written. So, it turns out, does Gus.\n\nSecurity finds you both at 6 AM, on page 14,000 of Statistical Analysis.") } },
    printer: { label: "printer", night: { look: "A sleek printer that has never once jammed. Preston's whole life, in one object." } },
    oat: { label: "carton", night: { look: "ADAPTOGENIC OAT SYNERGY. Ingredients: oats, synergy.", use: "Gus does not drink the synergy." } },
    poster: { label: "poster", night: { look: "A motivational poster: a rowing team at sunrise. SYNERGY. Someone has drawn a tiny circle inside a circle on the coxswain's hat.", score: { look: ["posterSeal", 1] } } },
    door: { label: "door", night: { look: "Back to the hallway.", go: "hall@fromImpact" } },
  },
};

/* ---------------- USE <item> ON <hotspot> ---------------- */
export const WITH = {
  "lab.adline": { po7: (api) => { api.take("po7"); api.give("po7s"); api.score("signed", 2);
    return "You slide Form PO-7 under the door, between pages 9 and 10 of her grant.\n\nScribbling. Muttering. Sign, sign, sign. It slides back out, signed. So does a parking permit, a request to rename the lab, and somebody's divorce papers.\n\nPROF. ADLINE (THROUGH THE DOOR): AFTER THE FIFTEENTH!"; } },
  "office.penny": { po7: "PENNY|That's not signed, hon. By a PI.", po7s: "c:pennyPO", slip: "PENNY|That's a credit slip, hon. It's Cody's. He's been waiting for it since March.",
    recorder: (api) => { if (!api.flag("clueCoil")) return "PENNY|Are you recording me? Fill out Form R-2."; if (api.flag("pennyMemo")) return "You already have it.";
      api.flag("pennyMemo", true); api.score("pennyMemo", 1); return "You hold up the recorder.\n\nPENNY|Nobody ordered a coil. Not ever.\n\nShe says it again, louder, for the tape. Penny likes a paper trail."; } },
  "office.printer": { thermos: "The printer doesn't need coffee. It needs a rat." },
  "mri.cody": { recorder: (api) => api.flag("recorded") ? "c:codyMemo" : null,
    slip: (api) => api.flag("codyShaken") ? "c:codySlip" : "CODY|My slip! But I still can't show you the clipboard. Preston said it's confidential, and Preston ran everything himself, so it's his call. Right?" },
  "mri.tess": { recorder: "TESS|Recording in my control room? Zone III applies to gossip.", thermos: "TESS|In. The. Locker." },
  "mri.locker": { thermos: (api) => api.use("locker") },
  "mri.magnetdoor": { thermos: "You consider throwing the thermos into the magnet room to see what happens. You know what happens. Everyone knows what happens." },
  "ethics.ethel": { recorder: "ETHEL|Shh.", po7: "ETHEL|Shh. Purchase orders are Penny's. Signatures are a PI's. Integrity is binders.", po7s: "ETHEL|Shh. Purchase orders are Penny's." },
  "hall.impact": { badge: "Gus taps his badge. The keypad blinks red. It wants six digits." },
  "impact.pc": { drink: "Gus considers pouring NULL HYPOTHESIS into Preston's keyboard. He's a scientist. He doesn't destroy evidence." },
};

/* ---------------- helpers for the puzzles ---------------- */
async function calendar(api) {
  if (api.flag("clueCalendar")) return "Preston Valu: zero sessions. You've seen enough.";
  if (!api.flag("heliumAlarm")) return api.flag("morrisJoined")
    ? "TESS|Eyes off the calendar.\n\nTess won't leave this console for anything short of an emergency. Behind it, a bundle of warm wires. Morris likes warm wires."
    : "TESS|Eyes off the calendar.";
  if (api.has("thermos")) return "As you lean over the console, the thermos in your bag tugs toward the magnet room.\n\nTESS (FROM INSIDE)|METAL! IN! THE! LOCKER!";
  await api.readout(CALENDAR(), "Six months of bookings. Tess's QA. Gus, 2:30 AM, every night. The Adline Lab. A 'mock calibration' every Friday at 23:59, booked by nobody.\n\nAnd Preston Valu: never. Not once. Not one session.");
  api.flag("clueCalendar", true); api.flag("heliumAlarm", false); api.score("clueCalendar", 3); api.refresh();
  return "c:tessTurn";
}
async function readIndex(api) {
  await api.readout(INDEX(), "VALU, P. — see RISING STARS (SPECIAL). And RISING STARS (SPECIAL) is filed on Shelf R, binder 12: the red shelf at the top.");
  api.flag("sawIndex", true); api.score("index", 1); return null;
}
function avalanche(api) {
  if (!api.flag("binderWarned")) { api.flag("binderWarned", true);
    return "You hook a finger on a binder. The shelf groans. The whole wall leans an inch toward you, thinks about it, and leans back.\n\nETHEL|Shh! Not at random. The shelves are load-bearing. Look it up in the Binder of Binders."; }
  return api.die("You pull a binder at random. The shelf holds a brief meeting and votes to let go.\n\nForty years of continuing review come down on you. You are found three days later under the minutes of a 1987 amendment.\n\nETHEL: Shh.");
}

/* ---------------- shifts ---------------- */
async function nightfall(api) {
  await api.say("NELL|No scanner bookings. No coil. Ethics approval three months after the data. And his participants are H.M., Phineas Gage and Totally Real Person.\n\nNELL|Preston didn't run anything. So what IS that paper?");
  await api.card("TUESDAY NIGHT", "NIGHT SHIFT  GUS", "HALLWAY 1F  01:58", "fG", 3200);
  api.shift({ mode: "night", char: "gus", room: "hall", entry: "start", min: 118, cast: ["gus"] });
  await api.say("Gus Ian, 1:58 AM. Nell's been texting all evening, in lowercase, which means it's serious.\n\nPreston spends every afternoon in Impact Lab 116. Gus has never been inside. Tonight, under the night lights, the keypad looks different.");
}
async function robes(api) {
  const fig = FIG.robedFigure || FIG.gusFigure;
  const W = [{ x: 610, y: 262, dir: -1, pose: 0, fig }, { x: 640, y: 272, dir: -1, pose: 0, fig }];
  api.G.busy = true;
  await api.wait(300);
  for (let i = 0; i < 26; i++) {
    for (const w of W) { w.x -= 20; w.pose = i % 2 ? 1 : 2; } if (i % 2) api.sfx("step", { room: "antechamber" });
    api.extras(W.filter(w => w.x > 70)); await api.wait(140);
  }
  api.extras([]); api.G.busy = false;
  api.score("robes", 2);
}
async function morning(api) {
  await api.card("WEDNESDAY", "08:52", "MRI CONTROL  B1", "fR", 3000);
  api.G.bodies = 1;
  api.shift({ mode: "morning", char: "nell", room: "mri", entry: "morning", min: 532, cast: ["nell"] });
  api.sfx("clang");
  await api.say("Dr. Tess La is dead.\n\nShe was found in the magnet room at 7:40 this morning. The murder weapon is still in there, stuck to the magnet.\n\nIt says NELL.");
}

/* ---------------- act structure ---------------- */
export const TITLE = ["ACT II", "UNDER REVIEW"];
export const END = { title: "END OF ACT II", chip: "UNDER REVIEW", bodies: "BODIES 01.", next: "NEXT: WEDNESDAY.  ACT III  MAJOR REVISIONS",
  epilogue: "Below the basement, a canister arrives at a round table. Inside: an index card, typed.\n\nQUARRY: N. NULL. STATUS: UNDER REVIEW.\n\nTo be continued.",
  thanks: "THANKS FOR PLAYING ACTS I AND II" };

export async function check(api) {
  const { G } = api, f = G.flags;
  if (G.mode === "day" && f.clueCalendar && f.clueCoil && f.clueIRB && f.clueClipboard && !f.dayDone) { f.dayDone = true; await nightfall(api); return null; }
  if (G.mode === "night" && G.room === "hall" && f.printed && !f.robesSeen) {
    f.robesSeen = true; await robes(api);
    return "Two figures in hooded robes cross the hallway without a sound and turn down the stairwell. One wears a small round pin, lit red. The other carries a steel thermos, the way you carry something that isn't yours.\n\nThe stairwell goes down to B1. The only light on in B1 tonight is MRI control. Tess, working late.\n\nGUS|…Nope.\n\nGUS|…Yep. Following.";
  }
  return null;
}
export function onSwitch(api, c) {
  if (c === "morris" && !api.flag("morrisHint")) { api.flag("morrisHint", true); return "MORRIS|Vents, pal. Click a vent and I'm anywhere in the building."; }
  return null;
}

export async function start(api, { fresh, skipCard } = {}) {
  const G = api.G;
  if (fresh) {
    G.flags = { recorded: true }; G.score = 0; G.scored.clear();
    G.inv = { nell: ["recorder", "notebook", "thermos"], gus: ["badge", "phone", "drink"], morris: [] };
  }
  if (!G.inv.nell.includes("thermos")) G.inv.nell.push("thermos");
  G.flags.morrisInDrawer = true; G.cast = ["nell"]; G.chars = {}; G.bodies = 0;
  api.shift({ mode: "day", char: "nell", room: "lab", entry: "start", min: 9 * 60 + 4 });
  if (!skipCard) await api.card("TUESDAY", "ACT II  UNDER REVIEW", "ADLINE LAB 114  09:04", "fA", 2800);
  await api.say("Tuesday. Nell has a recording of Preston lying, a thermos, and a theory: he never ran the study at all.\n\nIf that's true, the building will know. Scanners keep calendars. Offices keep purchase orders. Ethics keeps binders. Somebody kept a sign-in sheet.\n\nAnd Morris is in the drawer, looking at her.");
}
export async function debugNight(api) {
  Object.assign(api.G.flags, { clueCalendar: true, clueCoil: true, clueIRB: true, clueClipboard: true, morrisJoined: true, thermosLocked: true, dayDone: true });
  api.G.inv.nell = api.G.inv.nell.filter(x => x !== "thermos");
  await nightfall(api);
}
