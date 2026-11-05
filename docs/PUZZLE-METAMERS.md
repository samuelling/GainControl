# Night discovery: FOG NEURO (an in-game METAMERS)

**Act II — Tuesday night, Gus.** Built later. This is the plan.

Gus gets into Preston's computer on his night rounds and finds the program behind Preston's career: **FOG NEURO**, the paper mill's front end. Press GENERATE and it writes a brand-new paper on one of the Big Questions of cognitive neuroscience. Press it again and it's a different Big Question. Consciousness on Monday, free will by lunch, the neural basis of nostalgia by dinner. It's a playable toy inside the game, in the spirit of METAMERS (the Large Ling Model), and it explains how a third-year has "solved" half the field.

Gus doesn't understand it. He knows what it is anyway.
> GUS: "It writes science. Like a raccoon that ate a thesaurus. Every time I push the button, a new one. None of them were ever *done*."

---

## Fog Neuro (the NRT's name for it)

**Fog neuro** is the Table's private name for its discipline of endless research: a field that looks like cognitive neuroscience from a distance and has nothing solid inside. It never settles a question, because a settled question stops producing papers.

- **Preston has the whole field.** His CV reads like someone threw darts at an intro textbook. In one year: the seat of consciousness, the free will network, a grandmother cell for his actual grandmother, the neural basis of nostalgia, déjà vu (twice, which he considers a finding), why we yawn, where creativity lives, and a unified theory of the default mode network's weekend plans. Every one has fake data, a perfect blob and tiny error bars.
- **The slip.** When the Gain Controller has him, the NRT's word leaks out. He says "fog neuro," then corrects himself: *"That's what fog neuro is all about. Cog. Cog neuro."* It's planted in his first line in Act I and recurs every act, getting worse as the Controller's grip tightens. Nobody notices but the player (and, later, Morris, whose itch spikes on the word).
- **Straw men and staged feuds.** The Table's favorite way to stay prominent is to fight with itself in public. The mill writes a hypothesis nobody holds ("some have argued the hippocampus is decorative"), a Rising Star knocks it down, a second Rising Star "defends" it in a heated reply, and the field watches the two most famous young names in the building go at it. Commentaries, rebuttals, a symposium called *The Great Debate*, a podcast. Twice the citations for both sides, and a guaranteed future. Preston's sparring partner is **Dr. Polly Mick**, also on the Rising Stars wall. Their feud over whether memory is "stored" or "streamed" has run for three years. They've never met.
- **Why it matters for the case.** The feud is the cleanest proof of the mill: both sides of the fight were written by the same machine on the same night. See "The feud seed" below.

## Where it sits in the story

- **Gus finds it first, and doesn't know what it means.** He prints one generated paper ("it looked important") and leaves it in the lost-and-found box with his first note to Ned. That's the Act II turn, so the printout is the first thing the Ned/Gus alliance shares.
- **Ned decodes it in Act III.** The printout teaches Ned what the mill's seams look like, which sets up the metamer clue (7c): the Big Finding is the same machine fed the NRT Archive. The GPU logs then confirm the mill (`ltm_generate.py`).
- **The tell is on the printout.** The footer reads `LTM v0.9 · FOG NEURO · SEED 0412 · BYLINE: P. VALU`. Seed 0412 is the number of the robe Gus tagged in Act I.

## Getting in (Gus's puzzle)

Preston's workstation is in the Impact Lab (Room 116), the door Gus has no key for (Act I).
1. **The keypad.** Gus is the only person who ever cleans keypads. Wiping it with his spray reveals which four keys are worn shiny. The order comes from Preston's vanity: his own citation count, posted under his photo on the Rising Stars wall.
2. **The sticky note.** Gus cleans under keyboards. Nobody else does. There's a sticky note under Preston's, written in the coordinate cipher, so Gus can't read it; he copies it into his custodial log. (It decodes later, giving Ned a cipher lesson.) The PC isn't locked anyway: Preston never logs out. "Gotta network."
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
- **SOURCES** flips the page over: each sentence lists the fictional NRT papers it was stitched from, bylined to Table members and the Archive's dead and "retired." The same few names recur on every page, which is the point.
- **PRINT** (once per night) sends it to the lab printer. The printout is the clue.
- **After the game:** the generator unlocks from the title screen as an extra, FOG NEURO, endlessly replayable.

## The feud seed (a clue for Ned, Act III–IV)
Ned reads the famous Valu vs. Mick exchange in the library: paper, reply, reply to the reply. The two "rival" papers carry the same LTM footer seed, and SOURCES shows both sides built from the same three Archive papers. Overlay them in the notebook and the arguments line up point for point, mirror-imaged. It's a staged fight between two sock puppets with one hand inside both. Polly Mick goes on the list of members Ned can name at the Defense.

## Building it (for later)

- **No real papers, no real people.** The corpus is a hand-written list of about 200 Big Questions and fog-neuro building blocks: brain regions, mental faculties, everyday behaviors, methods, buzzwords, hedges and grant-bait closers. It covers consciousness, memory, attention, emotion, language, decisions, sleep, faces, reward, time, creativity, social brains and the rest of the textbook. Every name in the output (authors, sources, journals) is fictional. Nothing reproduces anyone's writing.
- **Grammar, not recombination.** Unlike METAMERS, which recombined Sam's own sentences, this one generates every sentence from templates over that list, so the output is always new and only *sounds* like the field. Templates follow the fog-neuro arc: straw man, knockdown, blob, sweeping claim, "further research is needed."
- **The real science is the mirror.** The Big Questions are real, and so are the regions and methods. What's fake is the pace, the certainty and the perfect blobs, which is the satire.
- **Module:** `game/js/minigames/fogneuro.js` plus `game/data/fogneuro.json`. Same overlay pattern as the sticky-note readout; PRINT sets a flag and gives Gus the printout item.

## Points and gags
- Get in: +2. Generate: +1. Read SOURCES: +2. FEUD: +1. Print it and leave it for Ned: +3.
- Generate 50 papers in one sitting and the citation count under Preston's Rising Stars photo goes up by 50 the next morning.
- The printer jams on the first try. It's the same jammed printer Ned uses to forge Cody's credit slip in Act II.
