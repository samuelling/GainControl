/* ================================================================ *
 *  REMARKS: people notice. Now and then, walking into a room with a code on (or the decorations up), someone says
 *  something about it: whoever's in the room, or the character you're playing. Never more than one every minute
 *  or so, and each line only once until the pool runs dry. Nothing here changes the game.
 *  remark({ G, topics, present }) → "WHO|line" | narration | null
 * ================================================================ */

// topic → speaker → lines. Speakers: the playable ones (NELL, GUS, IRIS; MORRIS gets narration), and anyone whose
// hotspot is in the room (PENNY, TESS, ETHEL, CODY, REX, DANA, SMALL, BRETT).
const L = {
  pinhead: {
    NELL: ["Is it me, or are everyone's heads smaller today? Don't answer that. Especially not you, with your tiny head.",
      "Everyone's head is the size of a grape. Mine too, presumably. That explains the last three committee meetings."],
    GUS: ["My hat doesn't fit. My HEAD doesn't fit. Nell, how big is my head? Be honest. Use a ruler."],
    IRIS: ["In 1962 we'd have written this up. Small heads, normal function. Very embarrassing for the cortex people."],
    PENNY: ["Hon, have you done something with your head? It's very... efficient."],
    TESS: ["Your head's too small for the coil now. Good news is, it's too small for the coil now."],
    REX: ["Bro. Your head. It's like, travel size."],
    MORRIS: ["Morris considers your new head size. Morris approves. Finally, a head in proportion to a rat."],
  },
  bighead: {
    NELL: ["My head is enormous. Is this what tenure feels like?", "Everyone's head has tripled. So it's a normal faculty meeting."],
    GUS: ["I can't fit through the door with this head. I've never related to Preston more."],
    IRIS: ["Ah. Big heads. I've seen this before. It's called a search committee."],
    PENNY: ["Your head's gotten big, hon. I'll put in a work order for wider doors. Six to eight weeks."],
    TESS: ["Nobody's head fits the coil today. Wonderful. It's a whole department of Prestons."],
    ETHEL: ["The file says your head is the normal size. The file is never wrong. Please shrink."],
    MORRIS: ["Morris looks up at the enormous heads and decides to stay in the vents a while."],
  },
  cicadas: {
    NELL: ["There are cicadas in the lecture hall. Hundreds. Seventeen years underground, and they chose a job talk.",
      "The cicadas are louder than the speaker. That's not a complaint."],
    GUS: ["A cicada landed on my laptop and nobody believes me that it's why my code doesn't run.", "They hum at about 4 kilohertz. I'd measure it but one's sitting on my microphone."],
    IRIS: ["Brood X. I remember the last three. They've never once asked a good question in seminar either."],
    PENNY: ["Someone left the seminar room window open in 2009 and now look. I'm not doing the paperwork for cicadas."],
    TESS: ["Keep the cicadas out of Zone IV. I don't know what a 7-tesla field does to a cicada and I don't want to write the incident report."],
    REX: ["The cicadas are such a vibe though. Like, they're literally just chilling and screaming. Relatable."],
    MORRIS: ["Morris eats a cicada. Crunchy. Seventeen years of waiting, and this is how it ends."],
    elsewhere: ["You can hear the cicadas from here. Seminar 101 sounds like a dial-up modem."],
  },
  snow: {
    NELL: ["It's snowing indoors. I'll add it to the list of things facilities says isn't happening."],
    GUS: ["Is the snow coming from the ceiling tiles? Don't tell me it's asbestos. Tell me it's snow."],
    IRIS: ["It snowed indoors in 1978 too. The ventilation was better then. More snow."],
    PENNY: ["Indoor snow is not covered by the building's insurance, hon. I checked. I've been asked before."],
    TESS: ["Condensation off the helium lines. Probably. I'm choosing to call it snow."],
    MORRIS: ["Morris catches a snowflake on his nose. Then another. Then he sneezes, and the implant blinks."],
  },
  afterimage: {
    NELL: ["Everything's the wrong colour. I've been staring at the red EXIT sign too long. Opponent process. Classic."],
    GUS: ["The whole building's gone complementary. If I stare at a white wall, will it go back? ...It didn't go back."],
    IRIS: ["Hering was right, of course. Nobody ever believes it until the walls go green."],
    TESS: ["Something's wrong with the colours. Or with my L-cones. Either way, I'm not booking a scan."],
  },
  disco: {
    NELL: ["The colours keep changing. Either the building's having a party or I'm having a stroke. Either way, nobody invited me."],
    GUS: ["Is this a lilac chaser? Are we inside the lilac chaser? Nell. NELL. Are we the dots?"],
    PENNY: ["I don't know who put the lights on the disco setting, hon, but it's coming out of somebody's indirect costs."],
    REX: ["Okay, the lights are SO good right now. Is this a rave? Is there oat milk?"],
  },
  helium: {
    NELL: ["Why does everyone sound like that? Who opened the helium?", "My voice is an octave up. My opinions are the same."],
    GUS: ["Okay, the formants shift up because sound travels faster in helium. My pitch doesn't actually change. I still sound like a chipmunk."],
    TESS: ["Who opened the helium?! That's for the magnet! That's a thousand dollars of SQUEAKING!"],
    PENNY: ["You sound funny, hon. Did you get into the MRI's helium? There's a form for that."],
  },
  significant: {
    NELL: ["Confetti every time I make progress. This is how p-hacking feels from the inside. It's nice. That's the problem."],
    GUS: ["Every result's significant now. I've never felt so powerful. Or so worried."],
  },
  halloween: {
    NELL: ["Someone carved a pumpkin like a brain and left it in the lab. It's anatomically wrong. It's also the best thing in the building."],
    GUS: ["The paper bats are from 2014. Every October someone strings them up again. Nobody admits to being the someone."],
    PENNY: ["Don't touch the cobweb in the lab, hon. It might be a decoration. It might not. Nobody knows anymore."],
    IRIS: ["Halloween. The one night a year the undergraduates look the way I feel."],
  },
  thanksgiving: {
    NELL: ["Hand turkeys. Somebody traced their hand on construction paper. In a neuroscience department. It's the most honest thing on these walls.",
      "There's a turkey made out of an inflated nitrile glove. Someone drew a face on the thumb. It's watching me."],
    GUS: ["The potluck sign-up has fourteen names under DESSERT and nobody under MAIN. Every year. It's like a natural law.", "The glove turkey's my work. Medium nitrile. Don't tell Tess I took it from Zone II."],
    PENNY: ["The potluck's Thursday before the break, hon. You're down for napkins. You're always down for napkins."],
    TESS: ["Someone took a glove from Zone II for that turkey. I counted. I always count."],
    IRIS: ["They've been tracing their hands for turkeys since before you were born. It's still the best thing we publish."],
    MORRIS: ["Morris sniffs the glove turkey. Nitrile. He was hoping for actual turkey."],
  },
  diwali: {
    NELL: ["Someone put diyas out by the kitchen sink. Little lit lamps, the only warm light in this building."],
    GUS: ["Someone brought sweets for Diwali. I've had four. I'm going to have a fifth. Nobody's counting. Tess is counting."],
    PENNY: ["The paper lanterns are lovely, hon, but I've told facilities they're not a fire hazard and I'd like that to stay true."],
  },
  winter: {
    NELL: ["The tree's made of pipette tip boxes. Blue ones and yellow ones. With a paper star. It's somehow both sad and perfect."],
    GUS: ["Secret Santa again. Last year I got a stress ball shaped like a brain. I squeezed it so hard the cerebellum came off."],
    PENNY: ["One of the S's fell off HAPPY HOLIDAYS. I've emailed about it. Twice."],
    TESS: ["The lights in the hall are on the same circuit as my coffee machine. If they trip it, they come down."],
    IRIS: ["The tip-box tree. We had one in 1979. Glass pipettes. Several people went to the hospital."],
  },
  xmaslights: {
    NELL: ["Somebody strung Christmas lights across the lab with six thumbtacks and no plan. Two bulbs are dead. One is thinking about it."],
    GUS: ["The lab lights went up December first. They come down in March. Nobody decides it. It just happens, like grant deadlines."],
    TESS: ["Those lights in the lab are on the same circuit as my coffee machine. If they trip it, they come down."],
    MORRIS: ["Morris eyes the loose end of the Christmas lights, dangling just within reach. Morris has questions about the lights."],
  },
  hanukkah: {
    NELL: ["The paper menorah has the right number of candles lit tonight. Someone's updating it every day. I respect that."],
    GUS: ["I made latkes for the lab. Tess asked me to fill in an ethics form for the oil."],
  },
  newyear: {
    NELL: ["New year. Same p-values.", "There's a party hat by the kitchen sink. It's been there since midnight. Nobody will claim it."],
    GUS: ["My resolution is to stop checking Google Scholar. I checked it twice writing that down."],
    PENNY: ["Happy new year, hon. Your annual report's due Friday. Happy new year."],
  },
  lunar: {
    NELL: ["Red paper lanterns, and somebody's left a pile of oranges out. The only fruit in the building that isn't moldy."],
    GUS: ["Who brought the oranges? They're for luck, apparently. I've eaten three. Lucky so far."],
  },
  valentine: {
    NELL: ["YOU ARE MY P < .05. Someone thought that was romantic. Someone may be right."],
    GUS: ["There's a candy dish of conversation hearts. Mine says REVISE AND RESUBMIT. That's not one of the real ones, is it."],
    PENNY: ["The paper hearts go down on the fifteenth, hon. Not the sixteenth. I've seen what happens on the sixteenth."],
  },
  brainweek: {
    NELL: ["Brain Awareness Week. The outreach table has a foam brain on it. It's had a bite taken out of it."],
    GUS: ["I explained neurons to forty fourth-graders today. They asked better questions than Reviewer 2."],
  },
  // codes, let slip: no code needs to be on for these
  codes: {
    GUS: ["Brood X comes out every seventeen years. BROODX. Write it down, it always comes up. Not the cicadas. The question.",
      "Stare at a red light for thirty seconds, then look at a white wall. AFTERIMAGE. Free psychedelics, courtesy of your cones.",
      "The lilac chaser's my favourite illusion. One day I'm putting the whole building on DISCO and seeing who notices."],
    NELL: ["If I see one more p-hacked figure I'm throwing confetti at it. SIGNIFICANT confetti.", "If facilities ever gives us a SNOWDAY I'm not going home. I'll stay here. It'll be quieter."],
    IRIS: ["We had a chairman we called PINHEAD. Not to his face. His face was too small to say it to."],
    PENNY: ["Last time somebody got TENURE in this building, hon, we had to widen the doors.", "Half the year the calendar on my wall's wrong, hon. I just call it a TIMEWARP and carry on."],
    TESS: ["Never open the HELIUM. You'll sound like a chipmunk for a week and I'll have to write it up."],
    REX: ["Bro, there's a code for everything. Like, life has cheat codes. GUV is one. Don't ask me what it does. It saved my thesis."],
  },
  pi: { NELL: ["There's a pie in the kitchen with PI written on it. Not a pie chart. A pie. The department's having a good day."] },
  stpat: { GUS: ["Shamrocks on the walls. Three leaves. Someone asked if it's significant. It's three."] },
  fools: { NELL: ["Someone's put googly eyes on everything that holds still. It's April first. I'm not falling for— the stapler's looking at me."] },
  grads: { NELL: ["CONGRATULATIONS DOCTORS. One day that banner's going to be for me. Stop laughing, building."] },
  july4: { GUS: ["Little paper flags on the bench. Somebody's very patriotic about the -80 freezer."] },
};
const CHAR = { nell: "NELL", gus: "GUS", iris: "IRIS", morris: "MORRIS" };
const NPC = { penny: "PENNY", tess: "TESS", ethel: "ETHEL", cody: "CODY", rex: "REX", dana: "DANA", small: "SMALL", brett: "BRETT" };
const used = new Set();
let last = 0;
export const COOLDOWN = 70000;

// topics: what's on (code ids and holiday ids). present: hotspot ids in the room. room: where we are.
export function remark({ G, topics, present = [], room, chance = .4, now = Date.now() }) {
  if (now - last < COOLDOWN || Math.random() > chance) return null;
  const me = CHAR[G.char] || "NELL";
  const here = present.map(id => NPC[id]).filter(Boolean);
  const pool = [];
  for (const t of topics) {
    const T = L[t]; if (!T) continue;
    // cicadas live in the lecture hall; anywhere else you only hear them
    if (t === "cicadas" && !["seminar", "defense"].includes(room)) { (T.elsewhere || []).forEach(l => pool.push([t, "", l, me])); continue; }
    for (const who of [...here, me]) for (const l of (T[who] || [])) pool.push([t, who, l]);
  }
  let fresh = pool.filter(([t, w, l]) => !used.has(l));
  if (!fresh.length) { pool.forEach(([, , l]) => used.delete(l)); fresh = pool; }
  if (!fresh.length) return null;
  // whoever's in the room gets first say
  const npc = fresh.filter(([, w]) => here.includes(w)), set = npc.length && Math.random() < .6 ? npc : fresh;
  const pick = set[Math.floor(Math.random() * set.length)];
  if (!pick) return null;
  used.add(pick[2]); last = now;
  const [, who, line] = pick;
  if (!who || who === "MORRIS") return line;    // Morris doesn't do words: narration
  return who + "|" + line;
}
export const REMARKS_FOR_TEST = L;
