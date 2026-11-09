// THE KITCHEN REGULARS and THE DARTBOARD. Some visits to the coffee kitchen, a sixth-year, a postdoc and/or a first-year
// are lounging there (who's in is rolled per visit: rooms.kitchen draws regulars(G)). TALK gets grad-school advice, all of
// it bad, and every other time a rumor about whatever the act still needs doing (a hint in someone else's mouth). At night,
// sometimes a postdoc asleep on the beanbag, who talks in his sleep. The dartboard (minigames/darts.js) is always there.
// Each act's kitchen hotspots spread in LOUNGE_HS.
import { darts } from "../minigames/darts.js";

function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
export const SPOTS = { sixth: [170, 252, 1], postdoc: [566, 268, 1], first: [470, 288, 1], sleeper: [470, 288, 1] };
// who's in, this visit (G.visit counts room entries, so it changes each time you come back)
export function regulars(G) {
  if ((G.act || 1) >= 5 || G.char === "morris" && G.mode === "night") return [];
  const r = rng(1 + (G.visit || 0) * 7919 + (G.act || 1) * 131); r(); r();
  if (G.mode === "night") return r() < .5 ? ["sleeper"] : [];
  if (G.mode === "morning") return r() < .5 ? ["sixth"] : [];
  return ["sixth", "postdoc", "first"].filter((_, i) => r() < [.55, .5, .45][i]);
}

const WHO = { sixth: "A SIXTH-YEAR", postdoc: "A POSTDOC", first: "A FIRST-YEAR", sleeper: "A POSTDOC, ASLEEP" };
// grad school advice, every word of it wrong
const ADVICE = {
  sixth: ["Never read a paper before you cite it. It biases you.", "I'm not stuck. I'm deepening my analysis. Year six of deepening.",
    "I'm going into data science. Google. Same regressions, ten times the money, and nobody makes you say 'cortex' out loud.",
    "If the data don't fit the model, collect more data until they get tired.", "Write the discussion first. Then you know which results to get.",
    "Your committee doesn't read your thesis. They read the acknowledgments to see if they're in it.", "Sleep is a confound. Control for it by not doing it.",
    "Name your files after your feelings. thesis_final_REAL_v3_why. You'll always know where you were.", "Email your PI at 2 AM. They think you're working. Email at 2 PM, they think you have a life.",
    "The best time to start writing was three years ago. The second best time is after this coffee. And the next one.",
    "My exit plan: a LinkedIn that says 'translates complex data into actionable insights.' I've translated one complex data. Into a null."],
  postdoc: ["A p of .06 is just a .05 that hasn't found itself yet.", "If Reviewer 2 asks for more experiments, send the same ones in a new font.",
    "Don't publish null results. Publish them as positive results about a different question.", "Every figure looks better with a colorbar that goes to eleven.",
    "My contract renews itself out of pity now. It's very low-maintenance.", "Cite yourself early and often. Nobody else will.",
    "Darts is the only thing in this building with a fair review process. You hit it or you don't.", "The h-index is like your weight. Everyone lies about it, and it only goes up.",
    "Never ask a postdoc for their five-year plan. This kitchen is their five-year plan.",
    "Three of my cohort work at Google now. They send me pictures of the free lunch. It's a kind of review."],
  first: ["I'm going to finish in four years. …Why is everyone laughing?", "I color-coded my Gantt chart. It's mostly red. Is red good?",
    "My plan is a PhD, then data science at Google. My advisor says that's not a plan, that's a LinkedIn headline. Same thing?",
    "My advisor hasn't said my name yet. But he looked at my poster. Near it.", "I go to every talk with free food. Science follows calories, right?",
    "I learned MATLAB this summer. Then they told me nobody uses MATLAB. Then they told me everybody does.", "Is it normal to cry in the cold room? It's quieter in there.",
    "If you nod at the right moments in a faculty meeting, they put you on a committee. I nodded once. I'm on three.", "I put a QR code on my poster. Nobody scanned it. I scanned it. It works."],
  sleeper: ["…reviewer two… no… I'll add the control… I'll add all the controls…", "…the tenure clock… it's ticking backwards…", "…five more minutes… five more years…"],
};
// rumors: [flag that's still false, what they've heard]. The first few unfinished ones, in the act's order, rotate.
const RUMORS = {
  1: { day: [["recorded", "Preston's holding court at journal club. If he says something dumb, get it on tape. Nobody believes you otherwise."],
      ["fedMorris", "Something's living in the ceiling of 101. It only comes down for pepperoni. Don't ask how I know."],
      ["officeHours", "Brett's office hours are today. He asks everyone what a Tesla is. It is not the car."],
      ["noteRead", "Somebody's been leaving sticky notes on monitors. Numbers. Not phone numbers."]],
    night: [["robePhoto", "…somebody left a bathrobe in 101… a cult bathrobe… take a picture, nobody'll believe it…"], ["listened", "…the tubes… two in the morning… rattling… every night…"]] },
  2: { day: [["clueCalendar", "Tess won't let anything metal near the magnet. She made me put my earrings in the locker. Twice. And her calendar's the only record of who scanned."],
      ["clueCoil", "If a 7T was ever bought, there's a purchase order. Penny in the main office has every form since the Nixon administration."],
      ["clueIRB", "Ethel on two keeps every ethics approval since 1971. The red shelf's too high. Everyone uses the step stool."],
      ["clueClipboard", "Cody, the RA in the MRI suite, keeps the sign-in sheets. He's scared of Preston. Play him what Preston says about him."],
      ["printerFixed", "The main office printer's been jammed since Tuesday. Something small could fix it from the inside. Smaller than me."]],
    night: [["impactOpen", "…one… four… seven… nine… the keys are worn… his citations…"], ["printed", "…his computer writes papers by itself… press print…"]],
    morning: [["smallDone", "I saw two people in bathrobes go down the stairs at six. Is that a wellness thing?"]] },
  3: { day: [["proofGrim", "Gus says Table 1's correlations are too good to be true. He keeps saying it. To the table."],
      ["proofOverlay", "Have you looked at Figure 3 in the Big Finding? Flip one of the brains. I'm just saying."],
      ["rexAsked", "Rex knows who's been hogging the GPU cluster. He'll tell anyone who brings him a real coffee. Nobody can make a real coffee."],
      ["descaled", "That machine needs descaling. Descaler is just acid. Gus drinks battery acid in a can. Do the math."],
      ["proofGLM", "Preston's stimulus log is in the Impact Lab. Nobody can get in there. Nobody with thumbs."],
      ["meeting", "There's a faculty meeting at three and they need a student rep. It's a 2-back, basically. Second whatever was moved two motions ago."]],
    night: [["hatchOpen", "…the tunnels… chanting… put your ear to the pipe… the hatch…"]] },
  4: { day: [["impactMet", "Impact's back. He's in the hallway with his neck pillow, looking for somebody to tell something to."],
      ["clueMetamer", "Every sentence in the Big Finding sounds familiar. The library has back issues. Nobody's opened them since microfiche."],
      ["clueHours", "Penny keeps everyone's expense receipts. Every Friday night, the same gap. Ask her about Fridays."],
      ["clueDark", "Preston naps in the dark booth. Twenty minutes in the dark and you see things you can't see in the light. Look beside him, not at him."],
      ["impactOpen", "Impact's office code is his h-index. Everyone knows. It's in the faculty directory, in the library."],
      ["officeDone", "Impact never wrote his own reviews. He kept a folder of the ones he didn't write. On his laptop. Of course he did."],
      ["codyLeft", "Cody's been rehearsing a speech in the hallway all afternoon. Something about Ethel. He looks terrified."]],
    night: [["gotRobe4", "…robes… a coat check… nobody gets in without one…"], ["mapSent", "…the main tube station… the only one that goes back up…"]] },
};
function line(api, id) {
  const G = api.G, L = (G.lounge ||= { n: {}, a: {}, r: 0 }), n = (L.n[id] = (L.n[id] || 0) + 1), f = G.flags;
  const R = (RUMORS[G.act] || {})[G.mode === "morning" ? "morning" : G.mode] || [];
  const open = R.filter(([k]) => !f[k]).slice(0, 3);
  // every other line is a rumor, if anything's left to hint at (the sleeper only talks rumors); the rest is advice, in turn
  if (open.length && (n % 2 === 0 || id === "sleeper" && n % 3 !== 1)) { const t = open[L.r++ % open.length][1]; return `${WHO[id]}|${id === "sleeper" ? t : "I heard: " + t}`; }
  const A = ADVICE[id], i = (L.a[id] = (L.a[id] ?? -1) + 1); return `${WHO[id]}|${A[i % A.length]}`;
}
const MORRIS = { sixth: "A SIXTH-YEAR|A rat. I'm too tired to scream. Hi, rat.", postdoc: "A POSTDOC|Don't tell the animal committee you saw me. I won't tell them I saw you.",
  first: "A FIRST-YEAR|Is that a lab rat? Is it supposed to be out? Is there a form?", sleeper: "Morris sniffs the sleeping postdoc. The postdoc says 'five more years' and rolls over." };
const LOOKS = { sixth: "A sixth-year in a red beanie, leaning on the counter with a mug. Their thesis has been 'nearly done' since the last chair.",
  postdoc: "A postdoc at the dartboard, one dart up, eyes narrowed, like it's a resubmission.",
  first: "A first-year on the beanbag, laptop on their knees, headphones round their neck, still hopeful.",
  sleeper: "A postdoc, asleep on the beanbag, glasses pushed up, a pen still in hand. Breathing in iambs." };
const person = (id) => ({ label: WHO[id].replace(", ASLEEP", "").toLowerCase(),
  day: { look: LOOKS[id], talk: (api) => line(api, id) }, morning: { look: LOOKS[id], talk: (api) => line(api, id) },
  night: { look: LOOKS[id], talk: (api) => line(api, id) }, morris: { look: MORRIS[id] } });
const playDarts = async (api) => { await api.mini(darts, { who: api.G.char }); return null; };
export const LOUNGE_HS = {
  sixth: person("sixth"), postdoc: person("postdoc"), first: person("first"), sleeper: person("sleeper"),
  darts: { label: "dartboard",
    day: { look: "A dartboard on the wall, under a sign: OCHE (THIS MEANS YOU). The wall around it has been hit more than the board.", use: playDarts },
    morning: { look: "The dartboard. Somebody's three darts, all in the wall.", use: playDarts },
    night: { look: "The dartboard, in the dark. The best time to play: nobody can see you miss.", use: playDarts },
    morris: { look: "The dartboard. Morris can't lift a dart. He can, however, judge." } },
};
