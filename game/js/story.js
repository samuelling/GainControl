// ACT I — Monday: SUBMISSION. All the words and the logic that moves the story.
// A response can be: a string ("WHO|text" for a quoted line), "c:key" (a conversation),
// or a function(api) that does things and may return either of those.
import { seg } from "./gfx.js";

/* ---------------- inventory ---------------- */
export const ITEMS = {
  recorder: { name: "voice memo recorder",
    look: (api) => api.flag("recorded") ? "Your voice memo recorder. One memo saved: PRESTON, JOURNAL CLUB." : "Your voice memo recorder. Record what people say; play it back to someone else.",
    verbs: (api) => api.flag("recorded") ? [["play", "PLAY"]] : [],
    play: () => "PRESTON (RECORDED)|\"…Anyway! I ran every subject myself. Gotta network. Ciao!\"",
    g: (x, y) => `<rect class="sW" x="${x - 5}" y="${y - 10}" width="10" height="20" rx="2"/><circle class="fR" cx="${x}" cy="${y + 5}" r="1.8"/><path class="hl sW" d="M${x - 2},${y - 6} L${x + 2},${y - 6} M${x - 2},${y - 3} L${x + 2},${y - 3}"/>` },
  notebook: { name: "lab notebook",
    look: (api) => { const t = [];
      if (!api.flag("recorded")) t.push("Ask Preston how he got a 7T.");
      if (!api.flag("officeHours")) t.push("Office hours. Brett is waiting in the lab. Probably.");
      if (!api.flag("fedMorris")) t.push(api.flag("morrisMoved") ? "Bring Morris a slice of pizza. At the drawer." : "Find Morris. He's gone to journal club again.");
      return "Your lab notebook. Mostly null results. Today's list:\n\n" + (t.length ? t.map(x => "- " + x).join("\n") : "- Nothing left. Back to your desk. Stare at the monitor."); },
    g: (x, y) => `<rect class="sW" x="${x - 7}" y="${y - 10}" width="14" height="20"/><path class="hl sW" d="M${x - 3},${y - 5} L${x + 4},${y - 5} M${x - 3},${y - 1} L${x + 4},${y - 1} M${x - 3},${y + 3} L${x + 4},${y + 3}"/>` },
  thermos: { name: "thermos", look: "Your steel thermos, with NED written on it in marker. Keep it away from the MRI. (Foreshadowing.)",
    g: (x, y) => `<path class="sA" d="M${x - 5},${y - 9} L${x + 5},${y - 9} L${x + 6},${y + 9} C${x + 6},${y + 11} ${x - 6},${y + 11} ${x - 6},${y + 9} Z"/>${seg("NED", x - 4, y - 2, 3.4, "sA", .7)}` },
  slice: { name: "slice of pizza", look: "One slice of journal club pepperoni. Lukewarm. Structurally questionable. Morris will be thrilled.",
    g: (x, y) => `<path class="sA" d="M${x - 8},${y - 8} L${x + 8},${y - 8} L${x},${y + 10} Z"/><circle class="fR" cx="${x - 2}" cy="${y - 3}" r="1.6"/><circle class="fR" cx="${x + 3}" cy="${y - 4}" r="1.4"/><circle class="fR" cx="${x}" cy="${y + 2}" r="1.3"/>` },
  keys: { name: "keys",
    look: (api) => "Every key in Fechner Hall. Forty-one of them. Nobody suspects the janitor.\n\nTonight's rounds:\n- " + (api.flag("robeTagged") ? "(done) " : "") + "Lost and found, Seminar 101.\n- " + (api.flag("listened") ? "(done) " : "") + "Whatever's rattling in the tube pipes.",
    g: (x, y) => `<circle class="sW" cx="${x}" cy="${y - 4}" r="5"/>${[-4, 0, 4].map(dx => `<path class="sA" d="M${x + dx},${y} L${x + dx * 1.4},${y + 10}"/>`).join("")}` },
  flashlight: { name: "flashlight", look: "A flashlight with exactly one working battery. It's enough. Barely.",
    g: (x, y) => `<rect class="sW" x="${x - 3}" y="${y - 3}" width="6" height="13"/><path class="sW" d="M${x - 6},${y - 10} L${x + 6},${y - 10} L${x + 3},${y - 3} L${x - 3},${y - 3} Z"/><circle class="fA" cx="${x}" cy="${y - 10}" r="2"/>` },
  tag: { name: "lost & found tag", look: "A lost-and-found tag. Gus has filled out four hundred of these for hooded robes. He's never asked.",
    g: (x, y) => `<path class="sW" d="M${x - 7},${y - 8} L${x + 4},${y - 8} L${x + 8},${y} L${x + 4},${y + 8} L${x - 7},${y + 8} Z"/><circle class="fW" cx="${x + 3}" cy="${y}" r="1.5"/>` },
};
export const START_INV = { day: ["recorder", "notebook", "thermos"], night: ["keys", "flashlight", "tag"] };

/* ---------------- conversations ---------------- */
// lines: [side, text, fx]  side = L | R | N.   Choices: { choice: [{ text, lines, correct, score }] , retry: true }
export const CONVOS = {
  preston: { L: "ned", R: "preston", score: ["preston", 2], lines: [
    ["L", "Great talk, Preston. Quick question. When did we get a 7T?"],
    ["R", "Ned! Love the energy. Love it. Let's grab coffee. Actually, let's grab synergy."],
    ["L", "The building has a 3T."],
    ["R", "The authors thank the reviewer for their insightful comment.", "blank"],
    ["L", "…Preston?"],
    ["R", "Anyway! I ran every subject myself. Gotta network. Ciao!"],
    ["N", "Your voice memo recorder caught that. One (1) suspicious non-answer."],
  ], after: (api) => { api.flag("recorded", true); api.status("RECORDING", 3500); } },

  iris: { L: "ned", R: "iris", score: ["iris", 2], lines: [
    ["R", "Young man."], ["L", "Me?"], ["R", "Ask him who reviewed it."], ["L", "Who reviewed… his paper?"],
    ["R", "Mm. And while you're at it, ask yourself who reviewed yours."], ["N", "She goes back to her crossword. It's in pen."],
  ] },

  morrisCeiling: { L: "ned", R: "morris", score: ["morrisD", 1], lines: [
    ["R", "Psst. Pal. Up here."],
    ["L", "Morris! You're supposed to stay in the drawer."],
    ["R", "The drawer doesn't have pepperoni. Bring me a slice. At the drawer. I don't eat in public."],
    ["L", "Fine."],
    ["R", "Also, your boy at the podium? Every time he gets near, my head itches."],
    ["N", "Morris vanishes into the ceiling. Somewhere above you, something heads toward the lab."],
  ], after: (api) => { api.flag("morrisMoved", true); api.refresh(); } },

  morrisFed: { L: "ned", R: "morris", score: ["morrisFed", 2], lines: [
    ["R", "Pepperoni. You're a good man, Null. A bad scientist, but a good man."],
    ["L", "Thanks. What's this about an itch?"],
    ["R", "Every time Preston's near, my head itches. Right here, where the stitches are. Like a radio tuning in."],
    ["L", "Fleas?"],
    ["R", "Fleas don't pulse, pal."],
  ], after: (api) => { api.flag("fedMorris", true); api.take("slice"); } },

  morrisNight: { L: "gus", R: "morris", score: ["morrisN", 1], lines: [
    ["L", "Evening, rat."],
    ["R", "Squeak squeak. Squeak squeak squeak.|(The canisters are going down again. Six tonight.)"],
    ["L", "Those canisters again. Going down past the basement. Every night this week."],
    ["R", "SQUEAK.|(There IS something past the basement, you know.)"],
    ["L", "Yeah. I don't like it either."],
  ] },

  brett: { L: "ned", R: "brett", lines: [
    ["R", "Hey! Office hours, right? Quick one for the quiz."],
    ["L", "Shoot."],
    ["R", "Preston's paper keeps saying 7 Tesla. What's a Tesla?"],
    { retry: true, choice: [
      { text: "A car.", lines: [["R", "That's what I put! The TA marked it wrong."], ["L", "…The TA is me. Let me try again."]] },
      { text: "Something a billionaire owns.", lines: [["R", "Bro."], ["L", "Fair. Let me try again."]] },
      { text: "A unit of magnet strength. 7T is more than twice our 3T, strong enough to see the layers of cortex.", correct: true, score: ["brett", 3], lines: [
        ["R", "Oh! So a stronger magnet means finer detail. Like a better camera."],
        ["L", "Exactly."],
        ["R", "And our building only has a 3T, right?"],
        ["L", "…Right."],
        ["N", "Ned has a thought. It is not a comfortable one."],
      ] },
    ] },
    ["R", "Thanks! See you Thursday. Well. If the quiz doesn't kill me first."],
  ], after: (api) => { api.flag("officeHours", true); api.refresh(); } },
};

/* ---------------- hotspots, by room → id → shift ---------------- */
const tubeDay = { look: "The building's old pneumatic tube. A canister just went by, marked B3.\n\nThere is no B3.", use: "Empty. A sticker inside the hatch reads B3. There is no B3.", score: { look: ["tube", 1] } };
const tubeNight = { look: "The canisters are rattling. Going down. Past the basement.\n\nThere is no \"past the basement.\"",
  use: (api) => { api.flag("listened", true); return "Gus puts his ear to the pipe. Canister after canister, going down. Under the rattle, something like voices.\n\nChanting? No. Probably the boiler."; },
  score: { use: ["tubeN", 1] } };

export const HS = {
  seminar: {
    screen: { label: "projector screen",
      day: { look: "Preston's slide: a close-up of cortex, six layers, each one perfectly resolved. Error bars so small they'd embarrass a ruler. The methods say 7T.\n\nThe building has a 3T.", use: "You cannot use a slide. You can only envy it.", score: { look: ["screen", 1] } },
      night: { look: "Dark. The faint ghost of six cortical layers is burned into the screen.", use: "Gus wipes the screen. The ghost stays." } },
    preston: { label: "Preston", day: { look: "Preston \"P.\" Valu. Third-year. First author. Rising Star. Never takes his earbuds out, not even for pizza.", talk: "c:preston", use: "Hands off. He's networking." } },
    lectern: { label: "lectern", day: { look: "The lectern. Its microphone has been on since 2009.", use: "Preston is using it. Aggressively." },
      night: { look: "The lectern. Someone left one index card on it: THE AUTHORS SHOULD CONSIDER…", use: "Gus pockets the card. Thirty years, never asked." } },
    quorum: { label: "Prof. Quorum", day: { look: "Prof. Quorum, the Department Chair. Front row, as always. Round cufflinks. Expensive.", talk: "PROF. QUORUM|Not now, Mr. Null. We're about to lose quorum.", use: "Touching the Chair is a committee matter." } },
    faculty: { label: "senior faculty", day: { look: "The senior faculty, nodding in perfect unison.\n\nTenure does that to a person.", talk: "They nod. In unison.", use: "They nod. In unison." } },
    iris: { label: "old woman", day: { look: "An elderly woman in the back row: silver bun, cardigan, pearls. She has attended journal club since 1961. Nobody knows who she is.", talk: "c:iris", use: "She swats your hand away with surprising speed." } },
    pizza: { label: "pizza",
      day: { look: (api) => api.flag("pizzaGone") ? "Crumbs. A grease map of journal clubs past." : "Journal club pizza. Monday's is edible. By Thursday it is a biohazard.",
        use: (api) => { if (api.has("slice")) return "You already have a slice. Pace yourself."; if (api.flag("fedMorris")) return "You've had enough. Morris has had enough."; api.give("slice"); api.score("pizza", 1); return "You take a slice of pepperoni. It sags with the weight of its own expectations."; } },
      night: { look: "Empty. The rat got here first.", use: "Gus folds the box flat. It's what he does." } },
    coffee: { label: "coffee cup", day: { look: "Someone's abandoned coffee. Not a clue. Just sad.", use: "It's cold. Like the job market." } },
    tube: { label: "pneumatic tube", day: tubeDay, night: tubeNight },
    morris: { label: "ceiling tile", day: { look: "A ceiling tile is ajar. Two small eyes. A tail. Morris is attending journal club for the pizza.", talk: "c:morrisCeiling", use: "You can't reach. Morris can reach you, though." },
      night: { look: "Two small eyes in the ceiling. The rat is back.", talk: "c:morrisNight", use: "Gus can't reach. The rat seems fine with that." } },
    door: { label: "door to hallway", day: { look: "The door to the hallway.", go: "hall@from101" }, night: { look: "The door to the hallway.", go: "hall@from101" } },
    exit: { label: "exit sign", day: { look: "EXIT.", use: "It's a sign, not a door. Though it may be a sign." }, night: { look: "EXIT. The only warm color on three floors.", use: "Gus taps it. It hums back." } },
    clock: { label: "clock", day: { look: (api) => `${api.G.clock}. Journal club ends when the pizza does.` }, night: { look: (api) => `${api.G.clock}. The canisters always start around two.` } },
    robe: { label: "hooded robe", night: {
      look: "A hooded robe, draped over a chair. A small round pin on the chest: a circle around a smaller circle, lit red.\n\nSomeone forgot it. Again.",
      use: (api) => { api.flag("robeTagged", true); api.score("robe", 2); api.refresh(); return "Gus folds the robe and tags it for the lost and found. Number four hundred and twelve.\n\nHe's never asked."; } } },
  },

  hall: {
    door101: { label: "Seminar Room 101", day: { look: "Seminar Room 101. Journal club: pizza and ambition.", go: "seminar@fromHall" }, night: { look: "Seminar Room 101. Dark.", go: "seminar@fromHall" } },
    fountain: { label: "water fountain", day: { look: "A water fountain from 1962. The water tastes like 1962.", use: "You drink. Mineral notes of pipe." }, night: { look: "The fountain hums in the dark.", use: "Gus drinks. He's earned it." } },
    stars: { label: "Rising Stars wall",
      day: { look: "RISING STARS. Six photos of promising young researchers. Preston's is twice the size of the others. Somebody re-hung it this morning, slightly higher.", use: "You straighten Preston's photo. It immediately un-straightens.", score: { look: ["stars", 1] } },
      night: { look: "In the dark, Preston's smile looks wider.\n\nGus checks. It is wider.", use: "Gus does not touch the photo." } },
    board: { label: "bulletin board",
      day: { look: "Two flyers, side by side.\n\nDEFENSE: NED NULL. FRIDAY 2 PM. ROOM 101.\nJOB TALK: PRESTON VALU. FRIDAY 2 PM. ROOM 101.\n\nSame room, same time. Somebody in the main office has a sense of humor. Or a plan.", use: "You move your flyer above his. When you look back, it's below his again.", score: { look: ["board", 1] } },
      night: { look: "The two flyers. Gus has taken down a lot of flyers in thirty years. He leaves these two alone.", use: "Gus straightens the pins. Habit." } },
    impact: { label: "Impact Lab 116",
      day: { look: "IMPACT LAB, ROOM 116. Brushed steel, a keypad, no window. Nobody you know has ever been inside.", use: "The keypad wants six digits. You try 123456. The keypad sighs at you." },
      night: { look: "A strip of light under the Impact Lab door. A hum, like a lot of computers thinking at once.\n\nIt's 2 AM.", use: "Gus has a key for every door in Fechner Hall. Except this one. That's new.", score: { look: ["impactN", 1] } } },
    tube: { label: "tube station", day: tubeDay, night: tubeNight },
    stairs: { label: "stairwell", day: { look: "The stairwell. Upstairs is the second floor, and the second floor is Act II.", use: "Locked. Facilities says it's \"temporarily permanent.\"" },
      night: { look: "The stairwell.", use: "Gus is not mopping stairs at 2 AM. Nobody pays him enough for stairs." } },
    exitH: { label: "exit sign", day: { look: "EXIT.", use: "It's a sign." }, night: { look: "EXIT. Still red. Still humming.", use: "Gus taps it. It hums back." } },
    office: { label: "main office", day: { look: "The main office. A yellowed sign: BACK IN 5 MIN. It has said that since 1997.", use: "You knock. Somewhere inside, a form is being filled out about your knock." },
      night: { look: "The main office. Dark.", use: "Gus has the key. Some doors you don't open without a form." } },
    lab: { label: "Adline Lab 114", day: { look: "Adline Lab, Room 114. Your lab. Your desk. Your null results.", go: "lab@fromHall" }, night: { look: "The Adline Lab. A monitor glows inside.", go: "lab@fromHall" } },
  },

  lab: {
    door: { label: "door to hallway", day: { look: "Back to the hallway.", go: "hall@fromLab" }, night: { look: "Back to the hallway.", go: "hall@fromLab" } },
    monitor: { label: "your monitor",
      day: { look: (api) => api.flag("noteReady") && !api.flag("noteRead") ? api.readNote() : "Your experiment. A dialog box: RESULTS NOT SIGNIFICANT. MATLAB is getting judgmental.",
        use: (api) => api.flag("noteReady") && !api.flag("noteRead") ? api.readNote() : "You rerun the analysis. p = .48. Again." },
      night: { look: "Your screensaver: the letters N.S. bouncing gently around the screen, forever.", use: "Gus taps the space bar. N.S. goes back to bouncing." } },
    drawer: { label: "desk drawer",
      day: {
        look: (api) => !api.flag("morrisMoved") ? "Your bottom drawer. A nest of shredded rejection letters and two ramen cups. No rat. He's out." : !api.flag("fedMorris") ? "Morris, in the drawer, staring at you. Expectantly." : "Morris, curled in a ramen cup, full of pepperoni.",
        talk: (api) => !api.flag("morrisMoved") ? "Nobody's home." : !api.flag("fedMorris") ? "MORRIS|Pepperoni first. I don't do small talk on an empty stomach." : "MORRIS|Bring me more of those, pal, and I'll tell you anything.",
        use: (api) => !api.flag("morrisMoved") ? "Shredded rejection letters. You recognize a few." : "He bites you. Lightly. Professionally." },
      night: { look: "The rat is asleep in the drawer, twitching. Dreaming of mazes.", talk: "MORRIS|Squeak… (He's asleep.)", use: "Gus closes the drawer most of the way. Rats need air." } },
    whiteboard: { label: "whiteboard", day: { look: "Your whiteboard. Eleven months of results. p = .48. N.S. A circled WHY. And, in red: DEFENSE FRI 2PM!!", use: "You add a question mark to WHY. It doesn't help." },
      night: { look: "The whiteboard. Gus doesn't know what N.S. means, but he can tell it isn't good.", use: "Gus never erases a whiteboard. That's how custodians get fired." } },
    adline: { label: "Prof. Adline's office",
      day: { look: "Prof. Dee Adline's office. A sign: AFTER THE 15TH. Muffled phone voices: a grant deadline, in progress.", talk: "PROF. ADLINE (THROUGH THE DOOR)|Ned? Is it urgent? Can it wait until after the 15th?", use: "Locked. She's in there. She's always in there." },
      night: { look: "Prof. Adline's office. Still a light on. Still on the phone. It's 2 AM.", use: "Gus knocks. \"AFTER THE 15TH!\"" } },
    booth: { label: "dark booth",
      day: { look: "The dark-adapted psychophysics booth. Twenty minutes in there and your eyes can detect a single photon. Ten more and you're asleep.",
        use: (api) => api.die("You sit in the dark-adapted booth to think. Your eyes adjust. Your thoughts slow. Your eyelids lose the argument.\n\nYou wake up three years later. You are a 9th-year. Your committee has retired.") },
      night: { look: "The dark booth. Darker at night, somehow.", use: "Gus doesn't sit in the dark booth. Gus has seen things in there." } },
    brett: { label: "Brett", day: { look: "Brett, from your stats section. He has a question. He always has a question.", talk: "c:brett", use: "You offer Brett a high five. He wasn't expecting it. Neither were you." } },
  },
};

/* ---------------- USE <item> ON <hotspot> ---------------- */
export const WITH = {
  "seminar.preston": { recorder: "You hold up the recorder. Preston leans into it like it's a press junket.", thermos: "You offer Preston your thermos. He only drinks \"adaptogenic oat synergy.\"", slice: "Preston declines. \"Carbs are a construct.\"" },
  "seminar.iris": { recorder: (api) => api.flag("recorded") ? "THE OLD WOMAN|\"Every subject?\" She snorts. \"Ask him how many subjects. Then ask him where.\"" : null },
  "seminar.morris": { slice: "MORRIS|Not here, pal. People are watching. The drawer." },
  "seminar.tube": { thermos: "It almost fits. Something tells you not to send anything metal anywhere near the basement." },
  "seminar.pizza": { thermos: "You are not putting pizza in the thermos. You have standards. Barely." },
  "seminar.screen": { notebook: "You sketch the six layers. They're too clean even to draw." },
  "seminar.robe": { tag: (api) => api.use("robe") },
  "hall.tube": { thermos: "It almost fits. Something tells you not to send anything metal anywhere near the basement.", keys: "Gus opens the hatch. Empty. It smells faintly of incense. That's new." },
  "hall.impact": { keys: "Forty-one keys. None of them fit. Gus tries them all twice.", flashlight: "Gus shines the light at the gap under the door. The strip of light inside flickers, like something noticed." },
  "hall.stars": { notebook: "You trace Preston's photo in your notebook. Even the tracing looks smug." },
  "lab.drawer": { slice: (api) => api.flag("morrisMoved") ? "c:morrisFed" : "Nobody's home to eat it. Morris is still at journal club." },
  "lab.brett": { recorder: (api) => api.flag("recorded") ? "BRETT|\"Wait. He ran every subject himself? For a 7T study? In a building with a 3T?\" Brett goes back to his phone. Then looks up again." : null },
  "lab.monitor": { notebook: "You copy p = .48 into your notebook. It doesn't get any smaller." },
};

/* ---------------- the act's triggers ---------------- */
export function check(api) {
  const { G } = api;
  if (G.mode === "day" && G.room === "lab" && api.flag("recorded") && api.flag("officeHours") && api.flag("fedMorris") && !api.flag("noteReady")) {
    api.flag("noteReady", true); api.refresh();
    return "Something new is stuck to your monitor. You didn't put it there.";
  }
  if (G.mode === "night" && api.flag("robeTagged") && api.flag("listened") && !api.flag("actOver")) {
    api.flag("actOver", true); api.endAct();
  }
  return null;
}

// the sticky note close-up (an instrument-style readout)
export const NOTE = () => {
  const lines = ["-42  -58  14", "  6   18  48", "-30  -88   2", " 44  -62  30", "-12   54  -8"];
  let s = `<g transform="rotate(-4 320 170)"><rect class="k sA" x="214" y="56" width="212" height="212"/>
    <path class="hl sA" d="M214,72 L426,72"/>${seg("X    Y    Z", 236, 60, 7, "sM", .9)}`;
  lines.forEach((l, i) => { s += seg(l, 236, 84 + i * 34, 16, "sW", 1.4); });
  return s + `</g>${seg("STUCK TO YOUR MONITOR. NO SIGNATURE.", 320 - 104, 290, 7, "sM", 1)}`;
};
export const NOTE_CAPTION = "Five rows of numbers. Not grades. Not phone numbers.\n\nThey're brain coordinates: x, y, z, the way an fMRI paper reports where something lit up. Someone in this building is leaving you a message in neuroanatomy.\n\nYou'll need an atlas. Tomorrow.";
