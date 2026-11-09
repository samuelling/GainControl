// ACT V — Friday: DECISION. The Defense (Laura Bow), then the Induction in B3 (Nell, Iris and Morris), the magnet, the endings.
// Design: docs/ACT5.md.
import { seg, segC, chip, chipW, stapler } from "../gfx.js";
import { LED } from "../title.js";
import { LOUNGE_HS } from "./lounge.js";
import { realHS } from "./realrecord.js";
import { ITEMS } from "./act1.js";
import "./act4.js";
import { defense } from "../minigames/defense.js";
import { echo } from "../minigames/echo.js";
import { breakers } from "../minigames/breakers.js";
import { reels } from "../minigames/reels.js";
import { crossref } from "../minigames/crossref.js";
import { supports } from "../minigames/supports.js";
import { aftermath } from "./aftermath.js";

/* ---------------- items ---------------- */
Object.assign(ITEMS, {
  idcard: { name: "Iris's old member card", look: "NEUROSCIENTIFIC ROUND TABLE. MEMBER: I. CANDOR. BORN 1938. Someone has scratched out the 3 with a staple and written 1987. Iris's handwriting has always been very convincing.",
    g: (x, y) => `<rect class="sW" x="${x - 9}" y="${y - 6}" width="18" height="12"/><circle class="hl sR" cx="${x - 4}" cy="${y}" r="3"/><path class="hl sW" d="M${x},${y - 2} L${x + 6},${y - 2} M${x},${y + 2} L${x + 5},${y + 2}"/>` },
  stapler: { name: "stapler", look: "Iris's stapler. Loaded since 1974.",
    g: (x, y) => stapler(x - 11, y + 5, 22) },
});
ITEMS.robe.verbs = (api) => api.G.act === 5 && api.G.char === "nell" && !api.flag("robeOn") ? [["wear", "PUT ON"]] : [];
ITEMS.robe.wear = (api) => { api.sfx("cloth"); api.flag("robeOn", true); api.take("robe"); api.score("robeOn", 1); api.refresh();
  return "You pull Gus's robe over your head. It's warm from the tunnel, and too long in the sleeves. The pin on the collar glows.\n\nFrom the inside of a hood, everyone looks like a reviewer."; };
const wrap = (id, fn) => { const old = ITEMS[id].look; ITEMS[id].look = (api) => api.G.act === 5 ? fn(api) : (typeof old === "function" ? old(api) : old); };
wrap("notebook", (api) => {
  const f = api.G.flags, t = (k, s) => `- ${f[k] ? "(done) " : ""}${s}`;
  if (api.G.mode === "morning") return "Your lab notebook. Gus's last text is taped inside the cover: 'robe's on your chair. check the tube. scanning now. it's fine.'\n\n"
    + [t("gotRobe", "The robe on your chair. (Lab.)"), t("gotMap", "The tube station. (Hallway.)"), t("rehearsed", "Then Iris, 4F. The induction is tonight.")].join("\n");
  if (api.G.mode === "day") return "Your lab notebook. Today's page says DEFENSE, 2 PM, and nothing else. Everything else is on the slides.";
  return "Your lab notebook, by phone light. Tonight:\n\n" + [t("passOK", "NELL: get past the doorkeeper (the robe, the phrase, Iris's card)."), t("echoPassed", "NELL: take a seat at the Round Table. Answer the Echo."),
    t("magnetCharged", "IRIS: cold-start the 1968 magnet (the power plant)."),
    t("archiveSent", "MORRIS: the Archive, up the tube, to Ethel." + (f.reelsDone && !f.archiveSent ? " Not enough got through. He can go again." : "")),
    t("supportsOut", "MORRIS: then up the riser, to the floor under the 3T. (Click a name, or Tab, to switch.)")].join("\n")
    + (ready(api) && !f.climax ? "\n\nEveryone's in place. IRIS: up the service stair." : "");
});

/* ---------------- conversations ---------------- */
export const CONVOS = {
  committee: { L: "nell", R: "adline", lines: [
    ["R", "Before we begin. The committee would like to note that one of its members could not be here today."],
    ["R", "Professor Quorum. And— we'd like to note Gus Ian. Who should have been in the front row."],
    ["N", "In the front row, Preston Valu sits with his legs crossed, in a better suit than anyone has ever worn to a defense. His job talk is next. His earbuds are dark."],
    ["R", "Ms. Null. Whenever you're ready."],
  ] },
  turn: { L: "nell", R: "preston", lines: [
    ["N", "Preston's earbuds light up. Green, then brighter. The room hears a faint (((   ))) like a tuning fork."],
    ["R", "The authors thank the reviewers for their insightful comments.", "blank"],
    ["N", "He stands. He doesn't look at anyone. He walks out of Seminar 101 and turns toward the basement stairs."],
  ] },
  verdict: { L: "nell", R: "adline", score: ["verdict", 2], lines: [
    ["R", "The committee is persuaded the paper is fraudulent. Unanimously. Ethel has a binder."],
    ["R", "A secret society, though. Under forty. Murder by earbud. Ms. Null, the committee needs more than a pattern."],
    ["N", "From the back row, where she's sat since 1961:"],
    ["L", "…"],
  ], after: async (api) => { await api.say("IRIS|Then she'll bring you the Archive, Dee. Tonight. Come along, Nell. Bring the rat."); } },
  quorumOffer: { L: "nell", R: "quorumUnhooded", lines: [
    ["R", "Ms. Null. You've done very well. You've been the best quarry we've had in years."],
    ["R", "The Hunt has one last tradition. Before the quarry is… retired, we make an offer."],
    ["R", "Join us. A seat at the Table. Kind reviews for life. Panels that like you. A Rising Star photo twice the size of his."],
    ["R", "Think of your funding odds."],
  ] },
};

/* ---------------- minigame wrappers ---------------- */
const EVIDENCE = ["calendar", "po", "irb", "clipboard", "grim", "overlay", "logs", "glm", "lasagna", "reviewer2", "invite", "hours", "metamer", "card", "feud", "dark", "recorder"];
async function doDefense(api) {
  if (api.flag("defenseDone")) return "It's done. Whatever it was.";
  await api.convo("committee");
  const r = await api.mini(defense, { evidence: EVIDENCE, score: api.score });
  api.flag("credibility", (r && r.credibility) || 0); api.flag("defenseDone", true);
  await api.convo("turn");
  api.refresh();
  await api.convo("verdict");
  await nightfall(api); return null;
}
const ready = (api) => api.flag("echoPassed") && api.flag("magnetCharged") && api.flag("supportsOut");
async function doEcho(api) {
  if (api.flag("echoPassed")) return ready(api) ? (!api.flag("archiveSent") && !api.flag("archiveNudged")
      ? (api.flag("archiveNudged", true), "You could sit back down now. But Morris hasn't got enough of the Archive up to Ethel, and without it, all of this is just a story. He could make another run. (Or sit down again and go on.)")
      : climax(api)) : "The Board waits for its Chair to finish reading the minutes. You have a few minutes. Somebody should be turning on a magnet.";
  if (!api.flag("passOK")) return "You're not in yet.";
  await api.say("You take an empty seat at the Round Table, inside the iron ring. Twelve hoods. At the head of the table, a hood that sits very straight, like a man who was declared dead on Wednesday.\n\nA gavel. Then the Echo begins.");
  const r = await api.mini(echo, { mode: "induction", morris: true, score: api.score, blip: api.blip, die: dieKeep(api),
    onSeat: (i) => { for (let k = 0; k < 12; k++) api.pose("seat" + k, k === i ? 1 : 0); } }, "glmwrap");
  for (let k = 0; k < 12; k++) api.pose("seat" + k, 0);
  if (!r || !r.passed) return "You stand up from the table, slowly, as if to stretch. Nobody stops you. Nobody has to. The seat will wait."
    + (missed(api, "echoFails") < 2 ? "" : "\n\nIRIS (IN YOUR HEAD)|Two back, dear. SECONDED only when the phrase matches the one two turns ago. Who says it doesn't matter. Ignore the gavel. And if he advances the Echo, count three until he brings it back.");
  api.flag("echoPassed", true); api.score("echoPassed", 4);
  await api.say("THE CORRESPONDING AUTHOR|The motion carries.\n\nTwelve hoods nod, as one.");
  if (ready(api)) return climax(api);
  return "THE CORRESPONDING AUTHOR|We will pause for the reading of the minutes.\n\nA hood begins reading fifty years of minutes, aloud. You have time. Somebody has to start a magnet. (Switch to Iris.)";
}
async function doSupports(api) {
  if (api.flag("supportsOut")) return "MORRIS|It's up there on nothing but habit, pal. Somebody tell the lady with the switch.";
  const r = await api.mini(supports, { score: api.score, die: dieKeep(api), onBolts: (b) => { api.G.flags.bolts = b; } });
  if (!r || !r.done) return missed(api, "supportsFails") < 2 ? "MORRIS|Breather. Then back to the bolts."
    : "MORRIS|Breather. Note to self: opposite corners, pal. Northwest, southeast, northeast, southwest, and round again. If it leans, the green ones bring it back.";
  api.flag("supportsOut", true); api.score("supportsOut", 4); api.refresh();
  return "MORRIS|Done, pal. When that lady throws her switch, that whole thing's coming down to say hello." + (api.flag("echoPassed") && api.flag("magnetCharged") ? "\n\nMORRIS|Iris! Go!" : "");
}
async function doBreakers(api) {
  if (api.flag("magnetCharged")) return "The needles are in the green. The ring upstairs is drinking current.";
  const r = await api.mini(breakers, { score: api.score, onBreak: (o) => { api.G.flags.brk = o; } });
  if (!r || !r.done) return missed(api, "breakerFails") < 2 ? "IRIS|Again. The manual is wrong. I'm not."
    : "IRIS|Again. My pencil, dear, in the margin: A, C, D, B, E, F. Then wait for the charge. You don't rush a 1968 magnet.";
  api.flag("magnetCharged", true); api.score("magnetCharged", 4); api.refresh();
  return "The meters climb. Somewhere above, iron starts to hum.\n\nIRIS|Fifty-eight years. Still starts on the first try. Mostly." + (api.flag("echoPassed") ? "\n\nIRIS|The girl is seated. Up the stair." : "\n\nIRIS|Now we wait for the girl to take her seat.");
}
async function doReels(api) {
  if (api.flag("archiveSent")) return "MORRIS|Sent what I could, pal. Ethel's got her reading.";
  // a short run isn't final: Morris can go back to the shelves until enough of the Archive reaches Ethel
  if (api.flag("reelsDone")) await api.say("MORRIS|Not enough got to Ethel, pal. There's more on the shelves. One more run. Dial first: ETHEL BORD, 2F.");
  const r = await api.mini(reels, { score: api.score, seconds: 90 });
  api.flag("reelsDone", true);
  const n = (r && r.sent) || 0; api.G.flags.reelsSent = Math.max(n, api.G.flags.reelsSent || 0);
  if (n >= 3) { api.flag("archiveSent", true); api.score("archiveSent", 5); return "MORRIS|Membership. Panels. Reviews. Boards. All going up, pal. Second floor. Ethel's going to need a bigger binder." + (api.flag("supportsOut") ? "" : "\n\nMORRIS|Now the riser. Up to the 3T. The lady said bolts."); }
  return (n ? "MORRIS|Got some of it up the tube, pal. Not all. Not enough." : "MORRIS|I sent the sherry inventory. Twice. I panicked.")
    + "\n\nMORRIS|I could go again. Or I could go up the riser and do the floor. Ethel's best ending needs three reels, minimum.";
}

/* ---------------- the climax and the endings ---------------- */
// THE CLIMAX, shown rather than told: every event happens on screen in stepped poses (see chamber.js), with short
// captions between them. Iris climbs out of the service stair and crosses the floor; three staples; she walks back and
// throws the switch in three poses; the ring wakes; the ceiling gives; Preston bolts, Nell runs, Iris holds the door;
// the 3T comes through in three drops; the medals take Quorum into the bore.
async function climax(api) {
  const G = api.G, F = G.flags; if (F.climax) return null; F.climax = true;
  if (G.char !== "nell") api.switchTo("nell");
  G.cast = ["nell"];
  if (G.room !== "chamber") api.goRoom("chamber@fromAntechamber");
  const frame = async (k, i, ms) => { F.fx = { k, i }; api.refresh(); await api.wait(ms); };
  const endFx = () => { F.fx = null; api.refresh(); };
  const shake = async (n = 4, px = 6) => { const el = document.getElementById("frame"); if (!el) return;
    for (let i = 0; i < n; i++) { el.style.transform = `translate(${i % 2 ? -px : px}px, ${i % 3 === 1 ? px / 2 : -px / 2}px)`; await api.wait(55); } el.style.transform = ""; };
  const walkIris = async (path, ms = 150) => { for (let n = 0; n < path.length; n++) { F.irisAt = [...path[n], n === path.length - 1 ? 0 : 1 + n % 2]; api.refresh(); if (n % 2) api.sfx("step", { room: "chamber" }); await api.wait(ms); } };

  // the gavel, twice
  await api.say("The minutes end.");
  for (const i of [0, 1, 0, 1]) { await frame("gavel", i, i ? 380 : 260); if (i) { api.sfx("gavel"); shake(2, 3); } }
  endFx();
  await api.say("THE CORRESPONDING AUTHOR|Before the induction, the Hunt.\n\nThe hood at the head of the table goes back.");
  F.unhooded = true; api.refresh(); api.sfx("cloth"); api.sfx("sting");
  await api.say("Professor Quorum. Not dead. Never dead. A chain of gold medals round his neck, fifty years of them.\n\nQUORUM|Thirty-nine. Still.");
  await api.convo("quorumOffer");
  const bad = await offer(api);
  if (bad) return ending(api, bad, { shown: true });
  await api.say("NELL|No.\n\nNELL|And give him back. Preston. Take them out of his ears.\n\nQUORUM|Ms. Null. You're in a sealed room, under a building, inside a magnet that hasn't been switched on since 1971.");
  await api.say("IRIS (FROM THE STAIR)|1968, Pembroke. I commissioned it. Do keep up.");
  // Iris comes up the service stair and crosses the room to the head of the table, at exactly the right speed
  F.irisHere = true;
  await walkIris([[380, 640], [360, 700], [335, 770], [310, 845], [285, 920], [250, 990], [205, 1040], [150, 1070], [95, 1088], [60, 1092]], 210);
  await api.say("IRIS|I told you in 1974.");
  for (const i of [0, 1, 2]) { api.sfx("staple"); await frame("staple", i, 420); }
  endFx();
  await api.say("Three staples through the hem of his robe, into the Round Table. One for 1974.\n\nIRIS|I've waited a long time to turn it back on.");
  // back across the room to the knife switch
  await walkIris([[95, 1088], [170, 1062], [235, 1010], [285, 940], [300, 860], [290, 780], [270, 710], [240, 640], [230, 604]], 170);
  F.swPose = 1; api.refresh(); api.sfx("clunk"); await api.wait(380);
  F.finale = true; F.swPose = 0; api.refresh(); api.sfx("ramp"); api.sfx("zap"); await shake(6, 7);
  await api.wait(700);
  await api.say("The ring wakes up. Hood clasps, cufflinks, every earbud in the room: all of it, to the iron.\n\nPreston's earbuds leave his ears like two small birds.");
  await api.say("PRESTON|…Nell? I stole your data. I wrote the review. I don't think I've had a thought of my own in three years.\n\nNELL|I know. Later. You're going to write a confession. Your first paper in years.");
  // the ceiling gives
  F.creak = true; api.refresh(); api.sfx("creak"); await shake(5, 4); await api.wait(500); api.sfx("creak"); await shake(4, 5);
  await api.say("Above the Table, something enormous is coming through the ceiling.\n\nMORRIS (FROM THE PIPES)|Pal! PAL! It's coming! I'd move!\n\nIRIS|Door. Now.");
  // everyone runs: Preston for the door, Iris already there, Nell after them
  F.irisAt = [-385, 612, 0];
  const run = (async () => { for (const p of [[-300, 600], [-345, 604], [-385, 600]]) { F.preAt = p; api.refresh(); await api.wait(160); } F.preAt = "gone"; api.refresh(); })();
  await Promise.all([run, api.walk(122, 276)]);   // beside Iris in the doorway, not on top of her
  // the 3T comes through
  for (const i of [0, 1]) { await frame("fall", i, 170); api.sfx(i ? "crash" : "creak"); }
  F.crash = true; F.quorumUp = true; F.creak = false; await frame("fall", 2, 120); await shake(8, 9); await api.wait(500);
  endFx();
  await api.say("Six tonnes of superconductor, still humming, on the Round Table. The Table splits. The Gain Controller is a coin.\n\nGus's scanner. His 2:30 slot.");
  await api.say("QUORUM|Fifty years of honors.\n\nQUORUM|All of them ferromagnetic.");
  F.quorumOff = true;
  for (const i of [0, 1, 2]) { await frame("bore", i, 240); if (i === 2) api.sfx("crash"); }
  F.quorumIn = true; endFx(); await shake(3, 3);
  await api.say("After fifty years on the Table, he's finally been scanned.\n\nMORRIS (LOOKING DOWN THROUGH THE HOLE)|…Did I do that? I did that.");
  // the verdict, whatever else is true: under the hoods, a lunch table for people who never got invited to one
  await api.say("In the dust, the members get up. Their clasps are still stuck to the ring, so the hoods just slide off.\n\nUnder them: a study section regular. An associate dean. The man who reviewed Nell's fellowship. A lanyard from a 2009 conference. They stand there in their robes, blinking, holding them shut.");
  await api.say("IRIS|Look at them, Nell. Fifty years of passwords and candles and a skull gavel. Do you know what this is?\n\nIRIS|A sorority. For people who spent every Friday night of their lives in a library and never got the letter. Then somebody finally sent them one, on cream paper, and they couldn't say no.");
  await api.say("NELL|They ran grant panels. They ended careers. They killed Gus.\n\nIRIS|Some of them did. Some of it's true. And if none of it were true, this still would be: grown scientists, who should know better, in matching robes, toasting a schism nobody remembers.\n\nNELL|That's sad.\n\nIRIS|It's sad. It's also pathetic. You're allowed both, dear.");
  await api.say("A MEMBER (UNHOODED, VERY QUIETLY)|…Is there still dinner on Friday?");
  return ending(api, F.archiveSent ? "accepted" : "major");
}
const ENDINGS = {
  accepted: { title: "ACCEPTED", chip: "THE BEST ENDING", bodies: "BODIES 05.  ONE QUORUM, ARRESTED.", next: "THE TABLE IS DISSOLVED.",
    epilogue: "Monday. Ethel Bord's office. The reels, transcribed: fifty years of membership rolls. Iris brings the panel rosters. 'This is the part they never thought anyone would do,' she says. 'It's just matching.'" },
  major: { title: "MAJOR REVISIONS", chip: "THE TABLE IS STOPPED. THE ARCHIVE IS GONE.", bodies: "BODIES 05.", next: "NO PROOF.  NOT YET.",
    epilogue: "The Table is stopped. Quorum is pulled out of the bore of a 3T, and then into custody. But the magnet took the Archive with the mill, and without the rolls, it's a story.\n\nNell passes her defense, with major revisions.\n\nThe last shot: Gus's empty desk. His laptop is still on, still running the replication. In the other window, Dendroboard: one unread reply to his last thread. Somewhere in the walls, a canister rattles." },
  inducted: { title: "INDUCTED", chip: "CONGRATULATIONS ON YOUR R01", bodies: "BODIES 05.  YOURS, SPIRITUALLY.", next: "THE END.",
    epilogue: "NELL|Yes.\n\nTwelve hoods applaud, softly, like a grant panel. Someone hands Nell a small velvet box. Inside: a pair of earbuds.\n\nThey fit perfectly. Everything does, now.\n\nThe Friday dinner is in the back room of a chain restaurant. The same eleven people tell the same story about a reviewer from 1998. Nobody leaves early. Nobody has anywhere else to be.\n\nCongratulations on your R01, the big grant everyone wants." },
  deskreject: { title: "DESK REJECT", chip: "THE INDUCTION SUCCEEDED", bodies: "BODIES 05.", next: "THE END.",
    epilogue: "QUORUM|Of course. Take all the time you need.\n\nQUORUM|You'll have plenty of it on the Curriculum Committee.\n\nPreston gets the job. Nell is appointed to the curriculum committee, effective immediately, for life. She is still on it." },
};
// Quorum's offer. NEVER MIND isn't an answer (he waits). YES and CAN I THINK ABOUT IT? play their endings, then offer
// Revise & Resubmit back to the offer, like any death, so a bad answer doesn't cost the player all of Act V.
async function offer(api) {
  for (;;) {
    let c; do c = await api.chooseFrom("QUORUM'S OFFER", [["yes", "\"YES.\""], ["maybe", "\"CAN I THINK ABOUT IT?\""], ["no", "\"NO.\""]]); while (!c);
    if (c === "no") return null;
    const which = c === "yes" ? "inducted" : "deskreject";
    await api.say(ENDINGS[which].epilogue);
    let k; do k = await api.chooseFrom(ENDINGS[which].title + ". IS THAT YOUR DECISION?", [["end", "THE END"], ["revise", "REVISE & RESUBMIT"]]); while (!k);
    if (k === "end") return which;
    api.sfx("revise");
    await api.say("Revised and resubmitted. Reviewer 2 is still out there.\n\nQuorum is still smiling, with his hand out.\n\nQUORUM|Well, Ms. Null?");
  }
}
async function ending(api, which, { shown = false } = {}) {
  Object.assign(END, ENDINGS[which]);
  if (shown) END.epilogue = "";   // already played, before the choice to revise
  api.flag("ending", which);
  if (which === "accepted" || which === "major") await api.blackout();   // the room goes dark; what follows plays over black
  if (which === "accepted") {
    await api.say("Monday. Ethel Bord's office. The reels, transcribed: fifty years of membership rolls.\n\nIRIS|This is the part they never thought anyone would do. It's just matching.");
    await api.mini(crossref, { score: api.score });
  }
  // what happened next, shown as a montage of short animated cards rather than told
  if (which === "accepted" || which === "major") { await aftermath(api, which); END.epilogue = ""; }
  // INDUCTED: after the epilogue, one word on the LED panel, in giant red dots
  if (which === "inducted" || which === "deskreject") { if (!shown) { await api.say(END.epilogue); END.epilogue = ""; } await verdict(api, which); }
  api.endAct(); return null;
}
// the verdict on the LED panel, in giant red dots. And at the end of the credits, a door out of the game: the career it
// sentences you to, as somebody else's game. INDUCTED → ChairQuest (a lifetime in the chair); DESK REJECT → Advisor Quest.
const VERDICTS = {
  inducted: { word: "SELLOUT.", sc: 4, nudge: 6, seed: 39, out: ["LIVE IT OUT IN CHAIRQUEST", "https://www.crumplab.com/ChairQuest/"] },
  deskreject: { word: "DESK REJECT", sc: 3, nudge: 0, seed: 41, out: ["LIVE IT OUT IN ADVISOR QUEST", "https://crumplabsandbox.github.io/advisor-quest/"] },
};
// INDUCTED: the screen fills, faster and faster, with everything saying yes gets you (amber, green, white, a ding each);
// it holds; then SELLOUT. takes it over, row by row, in giant red letters repeated edge to edge, and the tube shuts down
// to a red dot. SMALL font only for the rewards: A-Z 0-9 : - . , > ' and space.
const REWARDS = ["R01 FUNDED", "R01 FUNDED", "R01 RENEWED", "R01 FUNDED  1ST PERCENTILE", "NSF CAREER AWARD", "NSF FUNDED", "NIH STUDY SECTION",
  "NIH STUDY SECTION CHAIR", "NSF PANEL", "NSF PANEL", "ERC PANEL", "SFN COUNCIL", "VSS PRESIDENT", "CNS PRESIDENT", "SOCIETY FELLOW",
  "INVITED TALK  KYOTO", "INVITED TALK  OXFORD", "KEYNOTE  VIENNA", "PLENARY  BERLIN", "INVITED TALK  SYDNEY", "INVITED TALK  PARIS",
  "ENDOWED CHAIR", "DISTINGUISHED PROFESSOR", "EDITOR-IN-CHIEF", "ASSOCIATE EDITOR X3", "EDITORIAL BOARD", "NAS MEMBER",
  "AMERICAN ACADEMY", "CENTER DIRECTOR", "INSTITUTE DIRECTOR", "DEPARTMENT CHAIR", "NAMED LECTURE", "LIFETIME ACHIEVEMENT",
  "U54 CENTER GRANT", "T32 DIRECTOR", "NEW 7T. YOURS.", "OFFICE WITH A WINDOW", "A PARKING SPACE", "A BRASS GAVEL",
  "KEYNOTE  SINGAPORE", "R01 FUNDED", "NAMED CHAIR", "PROVOST'S MEDAL", "INVITED TALK  ZURICH", "STUDY SECTION, AGAIN", "BEST PAPER AWARD"];
async function sellout(api) {
  const NC = LED.NC, NR = LED.NR, cls = ["a", "g", "w", "a", "w"];
  const bands = (n, amp) => { const s = {}; for (let k = 0; k < n; k++) { const r0 = Math.floor(Math.random() * NR), h = 2 + Math.floor(Math.random() * 8), d = (Math.random() < .5 ? -1 : 1) * (1 + Math.floor(Math.random() * amp));
    for (let r = r0; r < r0 + h; r++) s[r] = d; } return s; };
  const scr = api.crt(); scr.set(LED.render(new Map())); await api.wait(900);
  // 1. the rewards pour in, anywhere there's room
  const m = new Map(), used = new Set();
  const box = (c, r, w, f) => { for (let y = r - 1; y < r + 6; y++) for (let x = c - 2; x < c + w + 2; x++) if (f(`${x},${y}`)) return true; return false; };
  const pool = [...REWARDS].sort(() => Math.random() - .5);
  for (let i = 0; i < pool.length; i++) {
    const t = pool[i], w = LED.textW(t);
    for (let tries = 0; tries < 160; tries++) { const c = 2 + Math.floor(Math.random() * (NC - w - 4)), r = 2 + Math.floor(Math.random() * (NR - 9));
      if (!box(c, r, w, k => used.has(k))) { LED.text(m, t, c, r, cls[i % cls.length]); box(c, r, w, k => { used.add(k); }); break; } }
    api.sfx("score"); scr.set(LED.render(m)); await api.wait(Math.max(55, 260 - i * 11));
  }
  await scr.click(900, 2200);
  // 2. SELLOUT. takes over: giant red rows (BIG font ×3), each repeated across the width and staggered, slamming in one
  //    by one over the rewards, with the picture slipping and ghosting as it goes
  const W0 = "SELLOUT. ", sc = 3, rowH = 7 * sc + 2, wW = LED.textW(W0, LED.BIG, sc) + 2 * sc, rows = Math.ceil(NR / rowH);
  const order = Array.from({ length: rows }, (_, i) => i).sort(() => Math.random() - .5);
  for (let n = 0; n < order.length; n++) {
    const i = order[n], r0 = i * rowH;
    for (let r = r0; r < r0 + rowH; r++) for (let c = 0; c < NC; c++) m.delete(`${c},${r}`);
    const off = -((i * 47) % wW); for (let c = off; c < NC; c += wW) LED.text(m, W0, c, r0 + 1, "x", LED.BIG, sc);
    api.sfx("blank"); scr.set(LED.render(m, { shift: bands(3 + n, 2 + n), ghost: true })); await api.wait(70);
    scr.set(LED.render(m)); await api.wait(Math.max(120, 300 - n * 35));
  }
  // nothing left but the word
  for (const k of [...m.keys()]) if (m.get(k) !== "x") m.delete(k);
  scr.set(LED.render(m)); await api.wait(700);
  for (let i = 0; i < 6; i++) { api.sfx("blank"); scr.set(LED.render(m, { shift: bands(4 + i * 2, 3 + i), ghost: true, noise: .003 * i, scan: Math.floor(Math.random() * NR) })); await api.wait(80); scr.set(LED.render(m)); await api.wait(110 - i * 10); }
  await scr.click(1200, 3000);
  // 3. off, down to a red dot
  await scr.close({ tint: "X", hold: 1100 }); await api.wait(500);
}
async function verdict(api, which) {
  const V = VERDICTS[which]; LED.css();
  if (which === "inducted") { await sellout(api); END.out = V.out; return; }
  const m = new Map(), top = V.sc === 4 ? 30 : 34;
  LED.text(m, V.word, LED.center(V.word, LED.BIG, V.sc) + V.nudge, top, "x", LED.BIG, V.sc);   // x: red in every palette (the night one turns R violet)
  const e = [...m.entries()]; let seed = V.seed; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = e.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [e[i], e[j]] = [e[j], e[i]]; }
  const at = (k, rows = []) => LED.renderRows(new Map(e.slice(0, Math.round(e.length * k))), rows);
  const scr = api.crt(); scr.set(at(0)); await api.wait(700);
  for (const k of [.08, .2, .4, .65, .85, 1]) { scr.set(at(k)); api.sfx("tick"); await api.wait(100); }
  for (const k of [0, 1, 0, 1]) { scr.set(at(k)); await api.wait(k ? 160 : 70); }
  await scr.click(1200, 4200);
  await scr.close(); await api.wait(500);
  END.out = V.out;   // the credits end on the way out: your punishment, as somebody else's game
}

// count a failed attempt at a puzzle (stored in a flag); after a couple, the surrounding lines start giving real hints
const missed = (api, k) => (api.G.flags[k] = (api.G.flags[k] || 0) + 1);

// a death inside a minigame: Revise & Resubmit rolls the engine back to before the action, but the minigame keeps running,
// so keep this act's flags and stay busy until the minigame ends
const dieKeep = (api) => async (t) => { const keep = { ...api.G.flags }; await api.die(t); Object.assign(api.G.flags, keep); api.G.busy = true; return "revise"; };

/* ---------------- hotspots ---------------- */
const look = (t) => ({ look: t });
export const HS = {
  defense: {
    lectern: { label: "your lectern", day: { look: "The lectern. Your slides are up: NULL RESULTS: A DEFENSE.", use: doDefense } },
    committee: { label: "the committee", day: look("Your committee: Prof. Adline, Ethel Bord (Research Integrity, with a binder), Det. Sgt. Small (\"I asked to be on it. Nobody said no. Nobody ever says no to me.\"), and an empty chair with a placard: QUORUM.") },
    adline: { label: "Prof. Adline", day: { look: "Prof. Adline. It's after the fifteenth. She's here.", talk: "PROF. ADLINE|Whenever you're ready, Nell. Take your time. I have all day. I've cleared all day. I've never said that before." } },
    ethel: { label: "Ethel Bord", day: { look: "Ethel, with a new binder, labeled NULL.", talk: "ETHEL|Shh. It's your defense." } },
    small: { label: "Det. Sgt. Small", day: { look: "Det. Sgt. Small, notebook open. He's drawn a little power curve and crossed it out.", talk: "SMALL|I'm here as a committee member. And as a detective. Mostly the second." } },
    quorumchair: { label: "Quorum's chair", day: look("An empty chair with a placard: PROF. QUORUM (CHAIR). Nobody has moved it. Nobody has moved to.") },
    screen: { label: "screen", day: look("NULL RESULTS: A DEFENSE. N. NULL. And in small type at the bottom of the title slide: FOR GUS.") },
    preston: { label: "Preston Valu", day: { look: (api) => api.flag("defenseDone") ? "His seat is empty." : "Preston, front row, in a beautiful suit, waiting for his job talk at three. He smiles at you. It's almost the old smile.",
      talk: "PRESTON|Break a leg, Nell! I mean that. I think I mean that." } },
    iris: { label: "Iris", day: { look: "Iris, back row, where she's sat since 1961. She's brought the manual and the stapler.", talk: "IRIS|Don't look at me, dear. Look at them." } },
    door: { label: "door", day: { look: "The hallway.", go: "Not now. You have a defense." } },
  },
  antechamber: {
    rack: { label: "robe rack", night: look("Robes on numbered hooks. Hook 0412 is empty. It's on you, or it should be.") },
    portraits: { label: "portraits", night: look("Portraits of members, in robes, hoods back. Every plaque says AGE 39. Some of the faces are seventy. Some are dead. One is Quorum, three times: 1979, 1994, 2009.") },
    book: { label: "guest book", night: look("A guest book. Every entry, in the same hand: WELCOMED, WITH REGRETS. The last page has a column for this year's quarry. It says N. NULL.") },
    doorkeeper: { label: "the doorkeeper", night: { look: "A hood, beside the inner door. It hasn't moved since you came in. It's waiting for something.", talk: doorkeeper } },
    inner: { label: "inner door", night: { look: "The inner door, with the insignia. Carved in the lintel, worn smooth by fifty years of hoods: FURTHER RESEARCH IS NEEDED.", go: (api) => api.flag("passOK") ? "chamber@fromAntechamber" : "The doorkeeper's hood turns, one notch, toward you." } },
    tunnel: { label: "back to the tunnels", night: { look: "The tunnel.", go: "Not now." } },
  },
  chamber: {
    table: { label: "the Round Table", night: { look: "The Round Table, inside the iron ring. Twelve seats; one is empty. It's for you.", use: doEcho } },
    quorum: { label: (api) => api.flag("crash") ? "Quorum's feet" : "the hood at the head", night: { look: (api) => api.flag("crash") ? "Two shoes, toes up, sticking out of the bore of the 3T. A few gold medals stuck to the rim. He's still thirty-nine." : api.flag("unhooded") ? "Quorum. Thirty-nine. Still." : "A hood at the head of the table, sitting very straight." } },
    console: { label: "Gain Controller", night: look("The Gain Controller, on its plinth. A dial, and a green bar. The bar is at maximum. Next to it, Preston, hooded, very still.") },
    preston: { label: "Preston", night: look("Preston, under a hood, earbuds glowing through the fabric. He's looking at the console the way a dog looks at a door.") },
    scanner: { label: "the 3T", night: look("The 3T, on the Round Table, still humming. THE MAGNET IS ALWAYS ON. Its bed is buckled. Gus's scanner. His 2:30 slot.") },
    gavel: { label: "gavel", night: look("The gavel. Brass, with a small skull set into the head. You decide not to think about whose.") },
    switch: { label: "knife switch", night: look("A big knife switch on the wall by the service stair. A brass plate: OPERATOR. 1968. In marker, small, underneath: I.C.") },
    stair: { label: "service stair", night: look("A service stair, going down. Iris is down there somewhere.") },
    door: { label: "door", night: { look: "The antechamber.", go: "antechamber@fromChamber" } },
  },
  plant: {
    panel: { label: "breaker panel", night: { look: "Six breakers, A to F, the size of loaves of bread.", use: doBreakers } },
    manual: { label: "manual", night: look("SUPERCONDUCTING RING, OPERATOR'S GUIDE, 1968. The printed procedure is wrong. The margins aren't.") },
    meters: { label: "meters", night: look("Analog meters. Their needles are trembling, like they remember.") },
    knife: { label: "knife switch", night: { look: "The plant's own knife switch. MAIN SUPPLY.", use: (api) => api.flag("magnetCharged") ? "IRIS|Not this one, dear. The one that matters is upstairs by the ring."
        : !api.flag("knifeWarned") ? (api.flag("knifeWarned", true), "Iris puts her hand on the main switch, and stops.\n\nIRIS|No. Breakers first, or I black out the Eastern Seaboard. Again. The panel, Iris.")
        : api.die("Iris throws the main switch before the breakers are set.\n\nThe 1968 supply comes on at once. So does every light in Boston, briefly. Then none of them.\n\nIRIS: Well. That's never happened before. Except once.") } },
    stair: { label: "service stair", night: { look: "Up to the chamber.", go: (api) => !api.flag("magnetCharged") ? "IRIS|Not until the magnet's charged." : !api.flag("echoPassed") ? "IRIS|Not until the girl's in her seat." : !api.flag("supportsOut") ? "IRIS|Not until the rat's done with the floor. He knows what I mean."
        : !api.flag("archiveSent") && !api.flag("archiveNudged") ? (api.flag("archiveNudged", true), "IRIS|One thing, dear, before I climb. Without the Archive on Ethel's desk, all of this is just a story. The rat could make another run. Or we go now.")
        : climax(api) } },
    tunnel: { label: "tunnel", night: look("The way she came. Iris doesn't go back.") },
  },
  crawlspace: {
    posts: { label: "jack posts", morris: { look: (api) => api.flag("supportsOut") ? "Four posts, no bolts. The pad's up there on nothing but habit." : "Four steel jack posts holding up the 3T's pad. Rust everywhere, streaked downhill from the leak. Three bolts each. Gus would have called this a structural finding.", use: doSupports } },
    grating: { label: "grating", morris: look("Through the grating: the curved underside of the 3T, and a sticker, upside down from here: THE MAGNET IS ALWAYS ON. Morris's implant hums like a tuning fork.") },
    chiller: { label: "chilled-water line", morris: { look: "The 3T's chilled-water line, tapped with a crude brass valve. A hose runs from it down through the floor. A tag on the valve: a circle seated around a smaller circle.", use: "Morris chews the hose. Water sprays everywhere. Fifty years of leak, now honest about it." } },
    riser: { label: "riser pipe", morris: { look: "Back down to the tube hub.", go: "tubehub@fromRiser" } },
  },
  tubehub: {
    archive: { label: "the Archive", morris: { look: "Shelves of reel-to-reel tapes, floor to ceiling, through the arch. Fifty years of the Table.", use: doReels } },
    dial: { label: "brass dial", morris: { look: "A brass destination dial: every room in the building. One says ETHEL BORD 2F.", use: doReels } },
    canisters: { label: "canisters", morris: { look: "Canisters in a rack, ready.", use: "MORRIS|I'm not riding one, pal. I've seen what happens. Registrar." } },
    deadletters: { label: "dead letters", morris: { look: "Under the rack, a dented brass box: DEAD LETTERS. One canister is wedged in the slot, furred with fifty years of dust. The tag, in fountain pen: THE OLD TABLE. DO NOT DELIVER. 1974.",
      use: brassGavel } },
    ltm: { label: "LTM drives", morris: { look: "The LTM's drive racks, blinking. Two, one, two.", use: "Morris chews through a cable. The lights stutter. Somewhere, a paper loses one sentence and gets better." } },
    pipe: { label: "pipe", morris: look("The pipe Morris came down. It goes up to every room in the building.") },
    riser: { label: "riser pipe", morris: { look: "A riser pipe going straight up, wet on the outside. UP: 3T. It's the chilled-water line. It's been leaking down here for fifty years, onto whatever holds that scanner up.",
      go: (api) => api.flag("reelsDone") ? "crawlspace@fromHub" : "MORRIS|Archive first, pal. Ethel needs her reading." } },
    arch: { label: "arch", morris: look("An arch, with the insignia carved in the keystone.") },
  },
};

// the old table's gavel, taken in the Schism and never used again. The coda's postscript, found in-world first.
function brassGavel(api) {
  if (api.flag("brassGavel")) return "MORRIS|Nope. Once is peer review. Twice is a replication, and I'm not funded for it.";
  api.flag("brassGavel", true); api.score("brassGavel", 2); api.sfx("gavel"); api.refresh();
  return "Morris works the canister loose and unscrews the cap. Inside, wrapped in the sports section of a 1974 newspaper: a gavel. Brass. Heavy.\n\nHe unwraps a little more.\n\nIt is shaped like a gavel the way a grant budget is shaped like what the money was for.\n\nMORRIS|Pal.\n\nMORRIS|PAL.\n\nA card is tucked in the newspaper: SPOILS OF THE SCHISM. NOT FOR CEREMONIAL USE.\n\nMORRIS|So when they walked out on the old table, they took the archive, the room and… this. And then they made a new gavel. Out of a skull. And that was the classy upgrade.\n\nMORRIS|I live in a drawer, pal. I eat ramen out of the packet. And I have never once been this embarrassed for a building.\n\nMorris wraps it back up, the way you rewrap a gift you intend to regift, and slides it home. History will want it. History can come and get it.";
}

async function doorkeeper(api) {
  const f = api.G.flags;
  if (f.passOK) return "The doorkeeper doesn't move. It doesn't need to.";
  if (!f.robeOn) return "The doorkeeper doesn't look at you. You're not dressed for it.\n\nGus's robe is in your bag. (Click it: PUT ON.)";
  await api.say("A HOOD|The authors should consider…");
  const p = await api.chooseFrom("THE AUTHORS SHOULD CONSIDER…", [["a", "…FURTHER RESEARCH."], ["b", "…ADDITIONAL CONTROLS."], ["c", "…A CAREER IN INDUSTRY."]]);
  if (!p) return null;
  if (p === "c") return api.die("NELL: …a career in industry.\n\nSilence. Then, from every hood at once: 'Desk reject.' Rejected unread, straight off the editor's desk.\n\nYour application has been forwarded to industry. Industry did not ask for it.");
  if (p === "b") return "A HOOD|…\n\nThe hood tilts, very slightly. Not wrong. Not right. It waits, the way a reviewer waits for the last line of every report.";
  await api.say("A HOOD|Further research is needed.\n\nA HOOD|Your date of birth.");
  let d = await api.chooseFrom("YOUR DATE OF BIRTH.", [["card", "SHOW IRIS'S CARD (BORN 1987)"], ["truth", "TELL THE TRUTH"]]);
  if (d === "truth" && !f.truthWarned) { f.truthWarned = true;
    await api.say("You open your mouth to tell the truth. Iris's card is in your pocket, warm. She fixed the year for a reason. In this room, the truth gets checked against a table.\n\nA HOOD|…Your date of birth.");
    d = await api.chooseFrom("YOUR DATE OF BIRTH.", [["card", "SHOW IRIS'S CARD (BORN 1987)"], ["truth", "TELL THE TRUTH"]]); }
  if (!d) return null;
  if (d === "truth") return api.die("You tell the truth. The doorkeeper does the arithmetic.\n\nA HOOD: Wizened.\n\nThe hoods turn, all of them. You are retired on the spot. Your gain is set to zero. You will nod in faculty meetings for the rest of your career.");
  f.passOK = true; api.take("idcard"); api.score("passOK", 3); api.sfx("door");
  return "The doorkeeper reads the card for a long time. 1987. Thirty-nine.\n\nA HOOD|Welcome, member. You're late.\n\nThe inner door opens.";
}

export const WITH = {
  "antechamber.doorkeeper": { idcard: "A HOOD|The phrase first.", robe: "Put it on, don't show it." },
  "chamber.console": { recorder: "Not now." },
};

/* ---------------- shifts and act structure ---------------- */
async function nightfall(api) {
  await api.card("FRIDAY NIGHT", "THE INDUCTION", "B3  23:40", "fV", 3400);
  const G = api.G;
  G.inv.nell = G.inv.nell.filter(x => x !== "idcard"); G.inv.nell.push("idcard");
  G.inv.iris = ["stapler"]; G.inv.morris = [];
  G.chars = { iris: { room: "plant", x: 300, y: 270, dir: 1 }, morris: { room: "tubehub", x: 320, y: 280, dir: 1 } };
  api.shift({ mode: "night", char: "nell", room: "antechamber", entry: "fromTunnels", min: 23 * 60 + 40, cast: ["nell", "iris", "morris"] });
  await api.say("They go down together, Gus's map in Nell's hand. At the bricked door the tunnel splits three ways, the way Iris said it would.\n\nIRIS|I take the old service corridor to the plant. You take the front door, dear. Here: my card. I fixed the year. And when the doorkeeper starts a sentence, finish it the way every review in the world ends. Never with a career.\n\nMORRIS|And I take the pipes. Obviously.\n\nIRIS|Rat. Every tube ends in the hub, and so does the Archive: send it up to Ethel. Then the riser. Gus's 3T sits right over their Table, on four posts that have stood in fifty years of leak. Loosen the bolts. When I wake the ring, it will do the rest.\n\nMORRIS|You want me to take the bolts out from under six tonnes of magnet. …Lady, I think I love you.\n\nThe antechamber is warm, and smells of incense and toner.");
  await api.say("Three of you now. Click a name, or press Tab, to switch.\n\nNELL: the front door, the doorkeeper, the Echo.  IRIS: the power plant, the magnet.  MORRIS: the tube hub, the Archive, then up the riser to the 3T.");
}
export const MAXSCORE = 100;
export const TITLE = ["ACT V", "DECISION"];
export const END = { title: "THE END", chip: "DECISION", bodies: "", next: "", epilogue: "", thanks: "THANKS FOR PLAYING GAIN CONTROL" };

export async function check(api) {
  const { G } = api, f = G.flags;
  if (G.mode === "morning") {
    if (G.room === "mri" && !f.smallGus) return "c:smallGus";
    if (f.gotRobe && f.gotMap && !f.toIris) { f.toIris = true; return "NELL|His robe. His map. Now Iris. Fourth floor: the stairs are at the far end of the hall."; }
    return null;
  }
  if (G.mode === "night" && f.echoPassed && f.magnetCharged && f.supportsOut && G.char === "iris" && !f.climax && !f.irisReady) { f.irisReady = true;
    return "IRIS|The girl's seated, and the ring's charged. Up the service stair."; }
  return null;
}
export function onSwitch(api, c) {
  if (c === "iris" && !api.flag("irisHint")) { api.flag("irisHint", true); return "IRIS|The power plant. My old friend. The breakers first; the manual's wrong; my notes aren't."; }
  if (c === "morris" && !api.flag("morrisHint5")) { api.flag("morrisHint5", true); return "MORRIS|Every tube in the building ends here, pal. And through that arch: the Archive. Ethel's on two."; }
  return null;
}
export async function start(api, { fresh, skipCard } = {}) {
  const G = api.G;
  // Friday morning: Gus is found, the robe and the map he left, Iris's rehearsal. Then two o'clock: the defense.
  G.flags = { morrisJoined: true, reelLeft: true };
  if (fresh) { G.score = 0; G.scored.clear(); }
  G.inv = { nell: ["notebook", "recorder"], gus: [], morris: [], iris: [] };
  G.cast = ["nell"]; G.chars = {}; G.bodies = 5; api.sfx("scanner");
  api.shift({ mode: "morning", char: "nell", room: "mri", entry: "morning", min: 400, cast: ["nell"] });
  if (!skipCard) await api.card("FRIDAY", "ACT V  DECISION", "MRI CONTROL  B1  06:40", "fR", 2800);
  await api.say("Gus Ian was found at 6:15 by the morning tech.\n\nHe is in the 3T. The scan is still running.");
  await api.convo("smallGus");
  // then the thing Gus left her, shown: his last text, and the morning's three errands
  await api.readout(GUSTEXT(), "Gus's last text. 2:31 AM, from this room.\n\nNELL|My chair. And the tube station in the hall. He left me something.\n\nNELL|Then Iris. Fourth floor.");
  return null;
}
const GUSTEXT = () => {
  const x = 230, y = 40, w = 180, h = 270;
  let s = `<rect class="k sW" x="${x}" y="${y}" width="${w}" height="${h}" rx="18"/><path class="hl sW" d="M${x + 70},${y + 12} L${x + w - 70},${y + 12}"/>
    <rect class="hl sD" x="${x + 10}" y="${y + 24}" width="${w - 20}" height="${h - 50}" rx="4"/>${chip("GUS", x + 18, y + 32, 6, "fB")}${seg("02 31 AM", x + w - 66, y + 34, 5, "sM", .7)}`;
  const bubbles = [["ROBE'S ON YOUR CHAIR."], ["CHECK THE TUBE", "STATION. HALLWAY."], ["SCANNING NOW.", "IT'S FINE."], ["IT'S ALWAYS FINE", "AT 2AM."]];
  let by = y + 56;
  for (const b of bubbles) {
    const bh = 10 + b.length * 13;
    s += `<rect class="k sB" x="${x + 18}" y="${by}" width="${w - 44}" height="${bh}" rx="5"/>`;
    b.forEach((t, i) => s += seg(t, x + 26, by + 6 + i * 13, 7, "sB", 1));
    by += bh + 8;
  }
  return s + seg("DELIVERED", x + w - 70, by, 4, "sM", .6) + seg("NO NEW MESSAGES", x + 46, y + h - 18, 5, "sD", .7);
};
async function rehearseV(api) {
  await api.convo("irisPlan");
  let r; do r = await api.mini(echo, { mode: "rehearsal", score: api.score, blip: api.blip, die: dieKeep(api) }); while (!r || !r.passed);
  api.flag("rehearsed", true); api.score("rehearsed", 3);
  await api.say("IRIS|Good. Good enough. In 1974 I was worse, and I walked out of there.\n\nIRIS|Tonight I'm going down with you. Not through the front. Somebody has to turn on the magnet.\n\nNELL|The magnet?\n\nIRIS|I commissioned it, dear. In 1968. It's been waiting.\n\nIRIS|Now go and defend your thesis. Two o'clock. I'll be in the back row.");
  await defenseStart(api);
  return null;
}
async function defenseStart(api, { skipCard } = {}) {
  const G = api.G;
  for (const it of ["robe", "map", "reel"]) if (!api.has(it)) G.inv.nell.push(it);   // #act5defense arrives with them
  api.shift({ mode: "day", char: "nell", room: "defense", entry: "start", min: 14 * 60, cast: ["nell"] });
  if (!skipCard) await api.card("FRIDAY", "THE DEFENSE", "SEMINAR 101  14:00", "fG", 2800);
  await api.say("Friday. Two o'clock. Seminar 101.\n\nNell Null's thesis defense. The committee is seated. Preston Valu is in the front row, waiting for his job talk at three. Iris is in the back row.\n\nThe lectern is waiting.");
}
// #accepted / #major: straight to an ending, as if the night had just been won (the montage, the coda, the credits)
export async function debugEnding(api, which = "accepted") {
  Object.assign(api.G.flags, { defenseDone: true, robeOn: true, passOK: true, echoPassed: true, magnetCharged: true, supportsOut: true, climax: true,
    reelsSent: which === "accepted", archiveSent: which === "accepted" });
  api.shift({ mode: "night", char: "nell", room: "chamber", entry: "fromAntechamber", min: 23 * 60 + 58, cast: ["nell"] });
  api.G.bodies = 5; await ending(api, which);
}
export async function debugNight(api) { for (const it of ["robe", "map", "reel"]) if (!api.has(it)) api.G.inv.nell.push(it); api.G.flags.defenseDone = true; await nightfall(api); }
export async function debugDefense(api) { Object.assign(api.G.flags, { smallGus: true, gotRobe: true, gotMap: true, rehearsed: true }); await defenseStart(api, { skipCard: true }); }

/* ---------------- Friday morning (moved here from act4.js when it became Act V's opening) ----------------
 *  Gus found in the 3T, the robe on Nell's chair, the map in the tube, and Iris's rehearsal. Merged into HS below
 *  (an extra "morning" key on each hotspot), so the Script Room lists it under Act V. */
const MORNING = {
  lab: {
    door: { label: "door to hallway", morning: { look: "The hallway.", go: "hall@fromLab" } },
    monitor: { label: "your monitor", morning: { look: "Your monitor. Your defense is today. Slide 2 is still blank." } },
    drawer: { label: "desk drawer", morning: look("Your drawer.") },
    whiteboard: { label: "whiteboard", morning: look("WHO IS PULLING THE STRINGS? And under it, in Gus's handwriting: THE ARCHIVE. B3.") },
    adline: { label: "Prof. Adline's office", morning: { look: "Prof. Adline's door, open. She's at her desk, not typing.", talk: "PROF. ADLINE|Two o'clock. I'll be there. Gus would have hated it if we postponed." } },
    booth: { label: "dark booth", morning: look("Dark.") },
    gusdesk: { label: "Gus's desk", morning: look("Gus's desk. The mug that says I ♥ GAUSSIANS, still half full. His laptop is open to Dendroboard, logged in, a reply half-typed: 'honestly just give them time, they'll call when they're ready'.") },
    robe: { label: "the robe on your chair", morning: { look: "A hooded robe, draped over your chair. The pin from Gus's photo on Monday, lit. Folded into the hood: a reel of tape.",
      use: (api) => { api.give("robe"); if (api.flag("reelLeft")) api.give("reel"); api.flag("gotRobe", true); api.refresh(); api.score("gotRobe", 1);
        return "You take the robe. It still smells like his cardigan." + (api.flag("reelLeft") ? "\n\nInside the hood, a reel: PANEL SCORES 1983." : ""); } } },
    vent: { label: "vent", morning: { look: "A vent." } },
  },
  hall: {
    door101: { label: "Seminar Room 101", morning: look("101. Today. Two o'clock.") },
    fountain: { label: "water fountain", morning: look("1962.") },
    stars: { label: "Rising Stars wall", morning: look("Gus was never on the Rising Stars wall. Nobody notices a grad student at 2 AM.") },
    board: { label: "bulletin board", morning: look("The flyers.") },
    impact: { label: "Impact Lab 116", morning: look("116.") },
    tube: { label: "main tube station", morning: { look: (api) => api.flag("gotMap") ? "Empty." : "A canister is sitting in the hatch, addressed by hand: N. NULL, ADLINE LAB.",
        use: (api) => { if (api.flag("gotMap")) return "Empty."; api.give("map"); api.flag("gotMap", true); api.score("gotMap", 1);
          return "Inside the canister: a hand-drawn map of the steam tunnels, B3 circled twice. On the back, in Gus's handwriting:\n\n'Tomorrow. Bring the rat. —G.'"; } } },
    stairs: { label: "stairwell", morning: { look: "The stairwell.", go: stairsMorning } },
    office: { label: "main office", morning: { look: "The main office.", go: "Penny isn't in yet. Penny is always in." } },
    lab: { label: "Adline Lab 114", morning: { look: "Your lab.", go: "lab@fromHall" } },
    kitchen: { label: "coffee kitchen", morning: { look: "The kitchen. Rex is in there. Rex is always in there.", go: "kitchen@fromHall" } },
    vent: { label: "vent", morning: { look: "A vent." } },
  },
  // the coffee kitchen, Friday morning: Rex has heard
  kitchen: {
    ...LOUNGE_HS,   // the regulars and the dartboard (story/lounge.js)
    rex: { label: "Dr. Rex Jected", morning: { look: "Rex, with two espressos. He's heard about Gus. He hasn't touched the second one.",
        talk: "REX|He used to come in here at 2 AM, just to press the button. Said it was the only thing in the building that never changed its result.\n\nREX|Then you fixed it. He was annoyed for a whole day." } },
    espresso: { label: "espresso machine", morning: look("READY. It doesn't know what day it is.") },
    mugs: { label: "mug tree", morning: look("One hook empty. Rex is holding Gus's mug. It says NULL & VOID.") },
    fridge: { label: "fridge", morning: look("DO NOT DRINK — SAMPLE. Some things in this building outlive everybody.") },
    board: { label: "corkboard", morning: look("WHO KEEPS BOOKING THE OLD B-LEVEL ROOM ON FRIDAYS? Under it, in Rex's writing: I KNOW. Under that, in Gus's: ME TOO.") },
    invite2018: realHS("invite2018", "a folded card"),
    sink: { label: "sink", morning: look("Clean. Rex cleans when he's sad.") },
    door: { label: "door to hallway", morning: { look: "The hallway.", go: "hall@fromKitchen" } },
  },
  iris: {
    iris: { label: "Prof. Iris Candor", morning: { look: "Iris, at her desk, the stapler in her hand. She's been waiting for you.",
        talk: (api) => api.flag("rehearsed") ? "IRIS|Two o'clock, dear. Go." : (api.flag("gotRobe") && api.flag("gotMap")) ? rehearseV(api)
          : "IRIS|Not yet, dear. Gus left you two things, and he told you where: your chair, and the tube. Go and get them." } },
    stacks: { label: "journals", morning: look("1961 to now.") },
    manual: { label: "magnet manual", morning: look("Iris has put the manual by the door. 'I'll need that tonight,' she says, without looking up.") },
    photo: { label: "photograph", morning: look("1968.") },
    letter: { label: "framed letter", morning: look("1977.") },
    stapler: { label: "stapler", morning: look("In her hand.") },
    kettle: { label: "kettle", morning: look("She's made tea. You don't drink it. She doesn't notice.") },
    ap1977: realHS("ap1977", "one issue, sticking out"), rocker: realHS("rocker", "something small on the sill"),
    chair: { label: "chair", morning: look("The chair opposite her desk. For you.") },
    door: { label: "stairs down to the hallway", morning: { look: "The stairwell.", go: "hall@fromStairs" } },
  },
  mri: {
    window: { label: "magnet room window", morning: look("Through the glass: Gus, on the scanner bed, half in the bore. The scan is still running. Its little progress bar says 94%.") },
    gus: { label: "Gus", morning: look("Gus Ian. His eyes are open. His pupils are pinpoints. He's wearing earbuds that aren't the scanner's, and they're lit, softly, the color of a pin on a robe.") },
    small: { label: "Det. Sgt. Small", morning: { look: "Det. Sgt. Small, his hat in his hands.", talk: (api) => api.flag("smallGus") ? "SMALL|Go on, Ms. Null. I'll stay with him until the scan finishes." : "c:smallGus" } },
    console: { label: "console", morning: look("The console. 94%. 95%.") },
    calendar: { label: "booking calendar", morning: look("GUS IAN, 2:30 AM. Every night this week.") },
    locker: { label: "locker", morning: look("The locker.") },
    sign: { label: "sign", morning: look("THE MAGNET IS ALWAYS ON.") },
    door: { label: "stairs up to the hallway", morning: { look: "The stairwell.", go: "hall@fromStairs" } },
    magnetdoor: { label: "magnet room door", morning: look("Taped.") },
    vent: { label: "vent", morning: { look: "A vent." } },
  },
};
for (const [room, spots] of Object.entries(MORNING)) for (const [id, h] of Object.entries(spots)) {
  const mine = ((HS[room] ||= {})[id] ||= { label: h.label });
  if (!mine.label) mine.label = h.label;
  mine.morning = h.morning;
}
// the stairwell on Friday morning: only the two places the morning needs (the other floors have no morning exits)
async function stairsMorning(api) {
  const d = await api.chooseFrom("THE STAIRWELL. WHERE TO?", [["mri", "B1  MRI SUITE"], ["iris", "4F  EMERITUS OFFICE"]]);
  if (!d) return null;
  api.goRoom(d === "mri" && !api.flag("smallGus") ? "mri@morning" : d + "@fromStairs");
  return null;
}
Object.assign(CONVOS, {
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
    ["N", "Iris reaches into her desk drawer for the stapler. She looks at it for a long time. Then she puts it on the desk, between them."],
    ["R", "Sit in that chair. We'll start with the phrases. Every time you miss, you'll hear this."],
    ["N", "Click."],
  ] },
});
