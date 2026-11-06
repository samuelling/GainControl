// ACT V — Friday: DECISION. The Defense (Laura Bow), then the Induction in B3 (Nell, Iris and Morris), the magnet, the endings.
// Design: docs/ACT5.md.
import { seg, segC, chip, chipW } from "../gfx.js";
import { ITEMS } from "./act1.js";
import "./act4.js";
import { defense } from "../minigames/defense.js";
import { echo } from "../minigames/echo.js";
import { breakers } from "../minigames/breakers.js";
import { reels } from "../minigames/reels.js";
import { crossref } from "../minigames/crossref.js";
import { supports } from "../minigames/supports.js";

/* ---------------- items ---------------- */
Object.assign(ITEMS, {
  idcard: { name: "Iris's old member card", look: "NEUROSCIENTIFIC ROUND TABLE. MEMBER: I. CANDOR. BORN 1938. Someone has scratched out the 3 with a staple and written 1987. Iris's handwriting has always been very convincing.",
    g: (x, y) => `<rect class="sW" x="${x - 9}" y="${y - 6}" width="18" height="12"/><circle class="hl sR" cx="${x - 4}" cy="${y}" r="3"/><path class="hl sW" d="M${x},${y - 2} L${x + 6},${y - 2} M${x},${y + 2} L${x + 5},${y + 2}"/>` },
  stapler: { name: "staple gun", look: "Iris's staple gun. Loaded since 1974.",
    g: (x, y) => `<path class="sR" d="M${x - 9},${y - 4} L${x + 8},${y - 4} L${x + 8},${y} L${x - 9},${y} Z M${x - 5},${y} L${x - 7},${y + 9} M${x + 2},${y} L${x + 4},${y + 6}"/>` },
});
ITEMS.robe.verbs = (api) => api.G.act === 5 && api.G.char === "nell" && !api.flag("robeOn") ? [["wear", "PUT ON"]] : [];
ITEMS.robe.wear = (api) => { api.flag("robeOn", true); api.take("robe"); api.score("robeOn", 1); api.refresh();
  return "You pull Gus's robe over your head. It's warm from the tunnel, and too long in the sleeves. The pin on the collar glows.\n\nFrom the inside of a hood, everyone looks like a reviewer."; };
const wrap = (id, fn) => { const old = ITEMS[id].look; ITEMS[id].look = (api) => api.G.act === 5 ? fn(api) : (typeof old === "function" ? old(api) : old); };
wrap("notebook", (api) => {
  const f = api.G.flags, t = (k, s) => `- ${f[k] ? "(done) " : ""}${s}`;
  if (api.G.mode === "day") return "Your lab notebook. Today's page says DEFENSE, 2 PM, and nothing else. Everything else is on the slides.";
  return "Your lab notebook, by phone light. Tonight:\n\n" + [t("passOK", "NELL: get past the doorkeeper (the robe, the phrase, Iris's card)."), t("echoPassed", "NELL: take a seat at the Round Table. Answer the Echo."),
    t("magnetCharged", "IRIS: cold-start the 1968 magnet (the power plant)."), t("archiveSent", "MORRIS: the Archive, up the tube, to Ethel."), t("supportsOut", "MORRIS: then up the riser, to the floor under the 3T. (Click a name, or Tab, to switch.)")].join("\n");
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
const EVIDENCE = ["calendar", "po", "irb", "clipboard", "grim", "overlay", "logs", "glm", "retainer", "reviewer2", "invite", "hours", "metamer", "card", "feud", "recorder"];
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
  if (api.flag("echoPassed")) return ready(api) ? climax(api) : "The Board waits for its Chair to finish reading the minutes. You have a few minutes. Somebody should be turning on a magnet.";
  if (!api.flag("passOK")) return "You're not in yet.";
  await api.say("You take an empty seat at the Round Table, inside the iron ring. Twelve hoods. At the head of the table, a hood that sits very straight, like a man who was declared dead on Wednesday.\n\nA gavel. Then the Echo begins.");
  const r = await api.mini(echo, { mode: "induction", score: api.score, blip: api.blip, die: dieKeep(api),
    onSeat: (i) => { for (let k = 0; k < 12; k++) api.pose("seat" + k, k === i ? 1 : 0); } }, "glmwrap");
  for (let k = 0; k < 12; k++) api.pose("seat" + k, 0);
  if (!r || !r.passed) return "You stand up from the table, slowly, as if to stretch. Nobody stops you. Nobody has to. The seat will wait.";
  api.flag("echoPassed", true); api.score("echoPassed", 4);
  await api.say("THE CORRESPONDING AUTHOR|The motion carries.\n\nTwelve hoods nod, as one.");
  if (ready(api)) return climax(api);
  return "THE CORRESPONDING AUTHOR|We will pause for the reading of the minutes.\n\nA hood begins reading fifty years of minutes, aloud. You have time. Somebody has to start a magnet. (Switch to Iris.)";
}
async function doSupports(api) {
  if (api.flag("supportsOut")) return "MORRIS|It's up there on nothing but habit, pal. Somebody tell the lady with the switch.";
  const r = await api.mini(supports, { score: api.score, die: dieKeep(api), onBolts: (b) => { api.G.flags.bolts = b; } });
  if (!r || !r.done) return "MORRIS|Breather. Then back to the bolts.";
  api.flag("supportsOut", true); api.score("supportsOut", 4); api.refresh();
  return "MORRIS|Done, pal. When that lady throws her switch, that whole thing's coming down to say hello." + (api.flag("echoPassed") && api.flag("magnetCharged") ? "\n\nMORRIS|Iris! Go!" : "");
}
async function doBreakers(api) {
  if (api.flag("magnetCharged")) return "The needles are in the green. The ring upstairs is drinking current.";
  const r = await api.mini(breakers, { score: api.score, onBreak: (o) => { api.G.flags.brk = o; } });
  if (!r || !r.done) return "IRIS|Again. The manual is wrong. I'm not.";
  api.flag("magnetCharged", true); api.score("magnetCharged", 4); api.refresh();
  return "The meters climb. Somewhere above, iron starts to hum.\n\nIRIS|Fifty-eight years. Still starts on the first try. Mostly." + (api.flag("echoPassed") ? "\n\nIRIS|The girl is seated. Up the stair." : "\n\nIRIS|Now we wait for the girl to take her seat.");
}
async function doReels(api) {
  if (api.flag("reelsDone")) return "MORRIS|Sent what I could, pal.";
  const r = await api.mini(reels, { score: api.score, seconds: 90 });
  api.flag("reelsDone", true);
  const n = (r && r.sent) || 0; api.flag("reelsSent", n);
  if (n >= 3) { api.flag("archiveSent", true); api.score("archiveSent", 5); return "MORRIS|Membership. Panels. Reviews. Boards. All going up, pal. Second floor. Ethel's going to need a bigger binder."; }
  return n ? "MORRIS|Got some of it up the tube, pal. Not all. Not enough." : "MORRIS|I sent the sherry inventory. Twice. I panicked.";
}

/* ---------------- the climax and the endings ---------------- */
async function climax(api) {
  const G = api.G; if (G.flags.climax) return null; G.flags.climax = true;
  if (G.char !== "nell") api.switchTo("nell");
  G.cast = ["nell"];
  if (G.room !== "chamber") api.goRoom("chamber@fromAntechamber");
  api.sfx("gavel"); await api.say("The minutes end. A gavel: brass, with a small skull set into the head.\n\nTHE CORRESPONDING AUTHOR|Before the induction, the Hunt.\n\nThe hood at the head of the table goes back.");
  G.flags.unhooded = true; api.refresh();
  await api.say("Professor Quorum. Not dead. Never dead. A little pale, as if he spent Wednesday afternoon face down on an agenda. A chain of gold medals around his neck, fifty years of them.\n\nQUORUM|Thirty-nine. Still.");
  await api.convo("quorumOffer");
  const c = await api.chooseFrom("QUORUM'S OFFER", [["yes", "\"YES.\""], ["maybe", "\"CAN I THINK ABOUT IT?\""], ["no", "\"NO.\""]]);
  if (c === "yes") return ending(api, "inducted");
  if (c === "maybe" || !c) return ending(api, "deskreject");
  await api.say("NELL|No.\n\nNELL|And give him back. Preston. Take them out of his ears.\n\nQUORUM|Ms. Null. You're in a sealed room, under a building, inside a magnet that hasn't been switched on since 1971.");
  await api.say("A voice from the service stair:\n\nIRIS|1968, Pembroke. I commissioned it. Do keep up.");
  G.flags.irisHere = true; api.refresh();
  api.sfx("staple"); await api.say("Iris Candor comes up the last step at eighty-eight years old and exactly the right speed.\n\nIRIS|I told you in 1974.\n\nQuorum stands. Iris crosses the floor, raises the staple gun, and staples the hem of his robe to the Round Table. Twice. Three times, for 1974.");
  await api.say("IRIS|I've waited a long time to turn it back on.\n\nShe throws the knife switch.");
  G.flags.finale = true; api.refresh(); api.sfx("ramp"); api.sfx("zap");
  await api.wait(900);
  await api.say("The ring wakes up.\n\nHood clasps first: a sound like hail going the wrong way. Cufflinks. Belt buckles. Every earbud in the room. The Gain Controller tears off its console and hits the ring with a noise the building will remember.\n\nPreston's earbuds leave his ears like two small birds.");
  await api.say("PRESTON|…Nell?\n\nPRESTON|Nell, I— what did I— I stole your data. I wrote the review. I don't think I've had a thought of my own in three years.\n\nNELL|I know. Later. You're going to write a confession. Your first paper in years.");
  G.flags.creak = true; api.refresh(); api.sfx("creak");
  await api.say("Above the Round Table, the ceiling makes a sound like a ship.\n\nThe ring has found something. Two floors up, on a pad held up by nothing but habit, sits a magnet that has never once been turned off.\n\nDust. Then water, Gus's leak, raining onto the Table. A crack runs across the ceiling and keeps going.");
  await api.say("MORRIS (FROM THE PIPES)|Pal! PAL! It's coming! I'd move!\n\nIRIS|Door. Now.\n\nNell grabs Preston by the hood and runs. Iris is already in the doorway, which at eighty-eight is the most impressive thing anyone has ever seen.");
  G.flags.crash = true; G.flags.quorumUp = true; api.refresh(); api.sfx("crash");
  await api.wait(700);
  await api.say("The 3T comes through the ceiling.\n\nSix tonnes of superconductor, still humming, lands on the Round Table. The Table splits. The Gain Controller is a coin. The gavel is never found.\n\nGus's scanner. His 2:30 slot.");
  await api.say("Quorum is still stapled to his chair, and he's wearing fifty years of gold.\n\nQUORUM|Fifty years of honors.\n\nQUORUM|All of them ferromagnetic.\n\nThe staples give. The medals go. Quorum goes with them, feet first, straight into the bore.\n\nAfter fifty years on the Table, he's finally been scanned.");
  await api.say("Through the arch, the LTM's drives sit in the field of two magnets at once. Their lights go out one by one. The mill forgets everything it ever learned.\n\nWhat isn't gone is on paper, in a canister, on the second floor.\n\nMORRIS (LOOKING DOWN THROUGH THE HOLE)|…Did I do that? I did that.");
  return ending(api, G.flags.archiveSent ? "accepted" : "major");
}
const ENDINGS = {
  accepted: { title: "ACCEPTED", chip: "THE BEST ENDING", bodies: "BODIES 05.  ONE QUORUM, ARRESTED.", next: "THE TABLE IS DISSOLVED.",
    epilogue: "Monday. Ethel Bord's office. The reels, transcribed: fifty years of membership rolls. Iris brings the panel rosters. 'This is the part they never thought anyone would do,' she says. 'It's just matching.'" },
  major: { title: "MAJOR REVISIONS", chip: "THE TABLE IS STOPPED. THE ARCHIVE IS GONE.", bodies: "BODIES 05.", next: "NO PROOF.  NOT YET.",
    epilogue: "The Table is stopped. Quorum is pulled out of the bore of a 3T, and then into custody. But the magnet took the Archive with the mill, and without the rolls, it's a story.\n\nNell passes her defense, with major revisions.\n\nThe last shot: Gus's empty desk. His laptop is still on, still running a GLM. Somewhere in the walls, a canister rattles." },
  inducted: { title: "INDUCTED", chip: "CONGRATULATIONS ON YOUR R01", bodies: "BODIES 05.  YOURS, SPIRITUALLY.", next: "THE END.",
    epilogue: "NELL|Yes.\n\nTwelve hoods applaud, softly, like a grant panel. Someone hands Nell a small velvet box. Inside: a pair of earbuds.\n\nThey fit perfectly. Everything does, now.\n\nCongratulations on your R01." },
  deskreject: { title: "DESK REJECT", chip: "THE INDUCTION SUCCEEDED", bodies: "BODIES 05.", next: "THE END.",
    epilogue: "QUORUM|Of course. Take all the time you need.\n\nQUORUM|You'll have plenty of it on the Curriculum Committee.\n\nPreston gets the job. Nell is appointed to the curriculum committee, effective immediately, for life. She is still on it." },
};
async function ending(api, which) {
  Object.assign(END, ENDINGS[which]);
  api.flag("ending", which);
  if (which === "accepted") {
    await api.say(END.epilogue);
    await api.mini(crossref, { score: api.score });
    END.epilogue = "Nell lays the membership rolls next to fifty years of grant panels and editorial boards, and the pattern is undeniable.\n\nThe NRT is exposed and dissolved. Quorum is arrested, at thirty-nine; the charge sheet is amended. Half a century of Reviewer 2 reports are unsealed.\n\nPreston confesses to stealing Nell's data and to running the mill. All 31 of his papers are retracted; the retraction notices are the first thing he's written himself in years.\n\nNell's original paper, null and all, is published. It's dedicated to Gus Ian, with a methods section he would have called 'fine.'\n\nNell passes her defense. She gets the job.\n\nIris watches it on the news, puts down the staple gun, and finally retires.";
  }
  api.endAct(); return null;
}

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
    iris: { label: "Iris", day: { look: "Iris, back row, where she's sat since 1961. She's brought the manual and the staple gun.", talk: "IRIS|Don't look at me, dear. Look at them." } },
    door: { label: "door", day: { look: "The hallway.", go: "Not now. You have a defense." } },
  },
  antechamber: {
    rack: { label: "robe rack", night: look("Robes on numbered hooks. Hook 0412 is empty. It's on you, or it should be.") },
    portraits: { label: "portraits", night: look("Portraits of members, in robes, hoods back. Every plaque says AGE 39. Some of the faces are seventy. Some are dead. One is Quorum, three times: 1979, 1994, 2009.") },
    book: { label: "guest book", night: look("A guest book. Every entry, in the same hand: WELCOMED, WITH REGRETS. The last page has a column for this year's quarry. It says N. NULL.") },
    doorkeeper: { label: "the doorkeeper", night: { look: "A hood, beside the inner door. It hasn't moved since you came in. It's waiting for something.", talk: doorkeeper } },
    inner: { label: "inner door", night: { look: "The inner door, with the insignia.", go: (api) => api.flag("passOK") ? "chamber@fromAntechamber" : "The doorkeeper's hood turns, one notch, toward you." } },
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
    knife: { label: "knife switch", night: { look: "The plant's own knife switch. MAIN SUPPLY.", use: (api) => api.flag("magnetCharged") ? "IRIS|Not this one, dear. The one that matters is upstairs by the ring." : api.die("Iris throws the main switch before the breakers are set.\n\nThe 1968 supply comes on at once. So does every light in Boston, briefly. Then none of them.\n\nIRIS: Well. That's never happened before. Except once.") } },
    stair: { label: "service stair", night: { look: "Up to the chamber.", go: (api) => !api.flag("magnetCharged") ? "IRIS|Not until the magnet's charged." : !api.flag("echoPassed") ? "IRIS|Not until the girl's in her seat." : !api.flag("supportsOut") ? "IRIS|Not until the rat's done with the floor. He knows what I mean." : climax(api) } },
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
    ltm: { label: "LTM drives", morris: { look: "The LTM's drive racks, blinking. Two, one, two.", use: "Morris chews through a cable. The lights stutter. Somewhere, a paper loses one sentence and gets better." } },
    pipe: { label: "pipe", morris: look("The pipe Morris came down. It goes up to every room in the building.") },
    riser: { label: "riser pipe", morris: { look: "A riser pipe going straight up, wet on the outside. UP: 3T. It's the chilled-water line. It's been leaking down here for fifty years.",
      go: (api) => api.flag("reelsDone") ? "crawlspace@fromHub" : "MORRIS|Archive first, pal. Ethel needs her reading." } },
    arch: { label: "arch", morris: look("An arch, with the insignia carved in the keystone.") },
  },
};

async function doorkeeper(api) {
  const f = api.G.flags;
  if (f.passOK) return "The doorkeeper doesn't move. It doesn't need to.";
  if (!f.robeOn) return "The doorkeeper doesn't look at you. You're not dressed for it. (Gus's robe.)";
  await api.say("A HOOD|The authors should consider…");
  const p = await api.chooseFrom("THE AUTHORS SHOULD CONSIDER…", [["a", "…FURTHER RESEARCH."], ["b", "…ADDITIONAL CONTROLS."], ["c", "…A CAREER IN INDUSTRY."]]);
  if (!p) return null;
  if (p === "c") return api.die("NELL: …a career in industry.\n\nSilence. Then, from every hood at once: 'Desk reject.'\n\nYour application has been forwarded to industry. Industry did not ask for it.");
  if (p === "b") return "A HOOD|…\n\nThe hood tilts, very slightly. Not wrong. Not right. It waits.";
  await api.say("A HOOD|Further research is needed.\n\nA HOOD|Your date of birth.");
  const d = await api.chooseFrom("YOUR DATE OF BIRTH.", [["card", "SHOW IRIS'S CARD (BORN 1987)"], ["truth", "TELL THE TRUTH"]]);
  if (!d) return null;
  if (d === "truth") return api.die("You tell the truth. The doorkeeper does the arithmetic.\n\nA HOOD: Wizened.\n\nThe hoods turn, all of them. You are retired on the spot. Your gain is set to zero. You will nod in faculty meetings for the rest of your career.");
  f.passOK = true; api.take("idcard"); api.score("passOK", 3);
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
  await api.say("They go down together, Gus's map in Nell's hand. At the bricked door the tunnel splits three ways, the way Iris said it would.\n\nIRIS|I take the old service corridor to the plant. You take the front door, dear. Here: my card. I fixed the year.\n\nMORRIS|And I take the pipes. Obviously.\n\nThe antechamber is warm, and smells of incense and toner.");
  await api.say("Three of you now. Click a name, or press Tab, to switch.\n\nNELL: the front door, the doorkeeper, the Echo.  IRIS: the power plant, the magnet.  MORRIS: the tube hub, the Archive.");
}
export const MAXSCORE = 90;
export const TITLE = ["ACT V", "DECISION"];
export const END = { title: "THE END", chip: "DECISION", bodies: "", next: "", epilogue: "", thanks: "THANKS FOR PLAYING GAIN CONTROL" };

export async function check(api) {
  const { G } = api, f = G.flags;
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
  G.flags = { morrisJoined: true };
  if (fresh) { G.score = 0; G.scored.clear(); }
  G.inv = { nell: ["notebook", "recorder", "robe", "map", "reel"], gus: [], morris: [], iris: [] };
  G.cast = ["nell"]; G.chars = {}; G.bodies = 5;
  api.shift({ mode: "day", char: "nell", room: "defense", entry: "start", min: 14 * 60 });
  if (!skipCard) await api.card("FRIDAY", "ACT V  DECISION", "SEMINAR 101  14:00", "fG", 2800);
  await api.say("Friday. Two o'clock. Seminar 101.\n\nNell Null's thesis defense. The committee is seated. Preston Valu is in the front row, waiting for his job talk at three. Iris is in the back row.\n\nThe lectern is waiting.");
}
export async function debugNight(api) { api.G.flags.defenseDone = true; await nightfall(api); }
