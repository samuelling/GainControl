# Night discovery: FOG NEURO (an in-game METAMERS)

**Act II — Tuesday night, Gus.** Built: `game/js/minigames/fogneuro.js` + `game/js/data/classics.js`.

On his way back from a 2 AM scan, Gus gets into Preston's computer and finds the program behind Preston's career: **FOG NEURO**, the paper mill's front end. Press GENERATE and it writes a brand-new paper on one of the Big Questions of cognitive neuroscience. Press it again and it's a different Big Question. Consciousness on Monday, free will by lunch, the neural basis of nostalgia by dinner. It's a playable toy inside the game, in the spirit of METAMERS (the Large Ling Model), and it explains how a third-year has "solved" half the field.

Gus understands it immediately, which is worse.
> GUS: "It writes science. Like a raccoon that ate a thesaurus. Every time I push the button, a new one. None of them were ever *done*."

---

## Fog Neuro (the NRT's name for it)

**Fog neuro** is the Table's private name for its discipline of endless research: a field that looks like cognitive neuroscience from a distance and has nothing solid inside. It never settles a question, because a settled question stops producing papers.

- **Preston has the whole field.** His CV reads like someone threw darts at an intro textbook. In one year: the seat of consciousness, the free will network, a grandmother cell for his actual grandmother, the neural basis of nostalgia, déjà vu (twice, which he considers a finding), why we yawn, where creativity lives, and a unified theory of the default mode network's weekend plans. Every one has fake data, a perfect blob and tiny error bars.
- **The slip.** When the Gain Controller has him, the NRT's word leaks out. He says "fog neuro," then corrects himself: *"That's what fog neuro is all about. Cog. Cog neuro."* It's planted in his first line in Act I and recurs every act, getting worse as the Controller's grip tightens. Nobody notices but the player (and, later, Morris, whose itch spikes on the word).
- **Straw men and staged feuds.** The Table's favorite way to stay prominent is to fight with itself in public. The mill writes a hypothesis nobody holds ("some have argued the hippocampus is decorative"), a Rising Star knocks it down, a second Rising Star "defends" it in a heated reply, and the field watches the two most famous young names in the building go at it. Commentaries, rebuttals, a symposium called *The Great Debate*, a podcast. Twice the citations for both sides, and a guaranteed future. Preston's sparring partner is **Dr. Polly Mick**, also on the Rising Stars wall. Their feud over whether memory is "stored" or "streamed" has run for three years. They've never met.
- **Why it matters for the case.** The feud is the cleanest proof of the mill: both sides of the fight were written by the same machine on the same night. See "The feud seed" below.

## Where it sits in the story

- **Gus finds it first.** He prints one generated paper ("it looked important") and brings it to Nell in the morning, along with what he saw at 2 AM. That's the Act II turn: the printout is the first piece of evidence the two labmates work on together, and Gus is the one who says it out loud: "Nell, this is foul play."
- **Nell decodes it in Act III.** The printout teaches Nell what the mill's seams look like, which sets up the metamer clue (7c): the Big Finding is the same machine fed the NRT Archive. The GPU logs then confirm the mill (`ltm_generate.py`).
- **The tell is on the printout.** The footer reads `LTM v0.9 · FOG NEURO · SEED 0412 · BYLINE: P. VALU`. Seed 0412 matches the laundry tag inside the robe's collar in Gus's Act I photo.

## Getting in (Gus's puzzle)

Preston's workstation is in the Impact Lab (Room 116), the one door on the floor Gus's badge doesn't open (Act I).
1. **The keypad.** Four of its keys are worn shiny; the code is six digits. Gus does the combinatorics on the spot: *"Four keys, six digits. That's 1,560 possibilities. Preston's vanity makes it one."* The answer is Preston's own citation count, posted under his photo on the Rising Stars wall.
2. **The sticky note.** Gus checks under the keyboard, because that's where every grad student keeps their passwords. There's a sticky note there in the coordinate cipher, so he can't read it yet; he photographs it. (It decodes later, giving Nell a cipher lesson.) The PC isn't locked anyway: Preston never logs out. "Gotta network."
3. **Don't touch the other window.** The screen also shows a Gain Controller status panel. Clicking it is a Sierra death: *"Gus has adjusted the gain. Preston, three floors away, begins to recite the Methods section of every paper ever written. So does Gus."* Revise & Resubmit.

## The generator (the playable toy)

A full-screen app on Preston's monitor, in the house style: stroke-alphabet title, Saira Condensed body, thin lines on black. The splash reads **FOG NEURO** for one frame, then corrects itself to **COG NEURO**.
- **GENERATE** builds one paper on a random Big Question:
  - a title stitched from fog-neuro patterns ("The Hippocampus Predicts Free Will Before You Do")
  - an abstract of 4–6 sentences: the straw man ("It has long been assumed…"), the knockdown, a sweeping claim, and a call for more funding
  - a one-panel figure in the house style (a brain wireframe with an implausibly perfect blob, or a bar chart with tiny error bars)
  - a journal (*Nurture Neuroscience*, *Cell-ebrity*, *Trends in Trends*), a year, and a citation count that ticks up while you watch
  - byline **P. Valu**, sometimes "et al.", where "al." is a different Rising Star each time
- **FEUD** generates a paper *and* its furious reply: Valu vs. Polly Mick, same topic, opposite claims, both ending in "further research is needed."
- **SOURCES** flips the page over: under each sentence is its lineage. Sentences 1 and 2 show "THE ESSENCE OF A 1990s MEMORY CLASSIC: PLACE CELLS" and "MASHED WITH…", the region is "LIFTED FROM THE SAME CLASSIC", and the sweeping claim and the faculty it "predicts" show **NONE. PURE FOG.** The last line traces to THE GRANT OFFICE. The mill can only recombine what the field already found; everything new in a paper is the fog.
- **PRINT** (once per night) sends it to the lab printer. The printout is the clue.
- **After the game:** the generator unlocks from the title screen as an extra, FOG NEURO, endlessly replayable.

## The feud seed (a clue for Nell, Act III–IV)
Nell reads the famous Valu vs. Mick exchange in the library: paper, reply, reply to the reply. The two "rival" papers carry the same LTM footer seed, and SOURCES shows both sides built from the same three Archive papers. Overlay them in the notebook and the arguments line up point for point, mirror-imaged. It's a staged fight between two sock puppets with one hand inside both. Polly Mick goes on the list of members Nell can name at the Defense.

## How it's built: resynthesis from the classics

- **The corpus is the field's most-cited work, reduced to its essence.** `game/js/data/classics.js` holds about 140 landmark ideas in cognitive neuroscience. They were chosen from bibliometric lists of the most-cited papers, plus well-known landmarks from the textbook canon. Each entry is a single row: Big Question, decade, a short topic name, the essence of the idea paraphrased in one clause, its regions, and its method. For example: `["memory", "2000s", "grid cells", "neurons tile space with a triangular grid, like graph paper in the head", "entorhinal cortex", "single-neuron recording"]`.
- **No titles, no authors, no copied text.** Each essence is written fresh in our own words, as you'd summarize the idea to a first-year. Nothing on screen names a real person or a real paper. The bylines, journals and feud rivals are all fictional.
- **Resynthesis.** GENERATE takes two classics from *different* Big Questions (X and Y) and runs them through the fog-neuro arc:
  1. Straw man: "It has long been assumed that ⟨X's essence⟩."
  2. Knockdown: "Using ⟨Y's method⟩ in n participants, we show that ⟨X⟩ and ⟨Y⟩ are the same thing."
  3. The blob: "Both live in ⟨a region taken from Y⟩, which predicted ⟨an absurd faculty⟩ with near-perfect accuracy."
  4. Sweeping claim: "These findings overturn ⟨decades since X⟩ decades of ⟨X's field⟩ research and suggest that ⟨an everyday behavior⟩ is, at heart, ⟨Y⟩."
  5. "Further research is needed, and funded."
  
  The title templates use the same mash-up ("Rethinking the Salience Network in the Age of Common-Currency Value").
- **FEUD** brings in a third classic, Z. P. Mick's reply says X is really Z, located in Z's region, "as it always has" been.
- **The joke is the mirror.** The real findings are real, and recognizably so to anyone in the field. What's fake is the welding: two unrelated landmarks declared identical, a region borrowed from the wrong paper, and a faculty nobody measured.

### Where the corpus came from (selection only; nothing is quoted)
- Yeung, Goto & Leung (2017), *Frontiers in Human Neuroscience* (PMC5520389): a bibliometric analysis of the 100 most-cited neuroscience articles. The cognitive and imaging entries were used.
- Kim et al. (2016), *NeuroImage*: a bibliometric analysis of the 100 most-cited articles in neuroimaging.
- Most-cited article lists for *Trends in Cognitive Sciences* and *Journal of Cognitive Neuroscience* (exaly.com).
- Textbook-canon landmarks (place and grid cells, the two visual streams, prediction error, the default mode, the replication-crisis methods papers, and others).

## Points and gags
- Get in: +2. Generate: +1. Read SOURCES: +2. FEUD: +1. Print it and leave it for Nell: +3.
- Generate 50 papers in one sitting and the citation count under Preston's Rising Stars photo goes up by 50 the next morning.
- The printer jams on the first try. It's the same jammed printer Nell uses to forge Cody's credit slip in Act II.
