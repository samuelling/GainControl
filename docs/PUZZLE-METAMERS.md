# Night discovery: LTM CLASSICS (an in-game METAMERS)

**Act II — Tuesday night, Gus.** Built later. This is the plan.

Gus gets into Preston's computer on his night rounds and finds a program Preston has been testing: **LTM CLASSICS**, the paper mill pointed at the most-cited papers in cognitive neuroscience. Press GENERATE and it writes a brand-new "landmark paper": title, abstract, figure, journal, a citation count it hasn't earned. It's a playable toy inside the game, in the spirit of METAMERS (the Large Ling Model), but its corpus is the field's top 200 most-cited cognitive neuroscience papers instead of one lab's life's work.

Gus doesn't understand it. He knows what it is anyway.
> GUS: "It writes science. Like a raccoon that ate a thesaurus. Every time I push the button, a new one. None of them were ever *done*."

---

## Where it sits in the story

- **The mill's ambition.** The LTM normally writes from the NRT Archive: members' own papers. CLASSICS is Preston's side project, trying to make the mill produce papers that sound like the field's *greatest hits*. That's the NRT's dream in one button: landmark findings on demand, no experiments needed.
- **Gus finds it first, and doesn't know what it means.** He prints one generated paper ("it looked important") and leaves it in the lost-and-found box with his first note to Ned. That's the Act II turn, so the printout is the first thing the Ned/Gus alliance shares.
- **Ned decodes it in Act III.** The printout feeds the metamer clue (7c): once Ned sees what the generator does to the classics, he recognizes the same seams in the Big Finding, which is built from the NRT's own corpus. The GPU logs then confirm the mill (`ltm_generate.py`).
- **The tell is on the printout.** The footer reads `LTM v0.9 · CORPUS: CLASSICS (200) · SEED 0412 · BYLINE: P. VALU`. Seed 0412 is the number of the robe Gus tagged in Act I.

## Getting in (Gus's puzzle)

Preston's workstation is in the Impact Lab (Room 116), the door Gus has no key for (Act I).
1. **The keypad.** Gus is the only person who ever cleans keypads. Wiping it with his spray reveals which four keys are worn shiny. With the order hinted by Preston's habits (his vanity: his own citation count, posted on the Rising Stars wall), Gus gets the six-digit code.
2. **The password.** Gus cleans under keyboards. Nobody else does. There's a sticky note under Preston's, in the coordinate cipher, so Gus can't read it; he copies it into his custodial log. (It decodes later, giving Ned a cipher lesson for free.) The PC isn't locked anyway: Preston never logs out. "Gotta network."
3. **Don't touch the other window.** The screen also shows a Gain Controller status panel. Clicking it is a Sierra death: *"Gus has adjusted the gain. Preston, three floors away, begins to recite the Methods section of every paper ever written. So does Gus."* Revise & Resubmit.

## The generator (the playable toy)

A full-screen app on Preston's monitor, in the house style: stroke-alphabet title, Saira Condensed body, thin lines on black.
- **GENERATE** builds one paper:
  - a title stitched from the canon's patterns ("A Domain-General Prediction Error Network for the Default Mode of Faces")
  - an abstract of 4–6 sentences
  - a one-panel figure in the house style (a brain wireframe with an implausibly perfect blob, or a bar chart with tiny error bars)
  - a journal, a year, and a fake citation count that ticks up while you watch
  - byline **P. Valu** (and sometimes "et al.", where "al." is a different Rising Star each time)
- **SOURCES** flips the page over: each sentence lists the real classic papers whose *ideas* it borrowed (title, first author, year, DOI). Seeing a famous paper's concept welded to another's is the joke and the lesson, the same seams Ned will find in the Big Finding.
- **PRINT** (once per night) sends it to the lab printer. That printout is the clue.
- **After the game:** the generator unlocks from the title screen as an extra, LTM CLASSICS, endlessly replayable.

## Building the corpus (for later)

- **The list:** the 200 most-cited cognitive neuroscience papers, pulled from an open citation index (OpenAlex metadata is CC0), filtered to cognitive neuroscience venues and topics, de-duplicated, and frozen as a JSON file: title, authors, year, journal, DOI, citation count.
- **The generator's material is ideas, not text.** For each paper we write short concept tags by hand (a finding, a method, a brain region, a buzzword) and generate new sentences from a grammar over those tags. Unlike METAMERS, which recombined Sam's own sentences, this version never reuses wording from other people's papers. That keeps it clear of reproducing copyrighted abstracts, and it's also funnier: the output only *sounds* like the classics.
- **Real people stay real.** Real authors appear only as accurate citations on the SOURCES side. Generated text is always bylined to fictional characters, and nothing suggests any real scientist is connected to the NRT. The canon is what the mill *imitates*, not who's in the society. The app's splash says so in-world: *"Corpus: public bibliographic data. No authors were consulted. That's the point."*
- **Module:** `game/js/minigames/ltm.js` plus `game/data/classics.json`. Same overlay pattern as the sticky-note readout; PRINT sets a flag and gives Gus the printout item.

## Points and gags
- Get in: +2. Generate: +1. Read SOURCES: +2. Print it and leave it for Ned: +3.
- Generate 50 papers in one sitting and the citation counter on Preston's Rising Stars photo (Act I hallway) goes up by 50 the next morning.
- The printer jams on the first try. It's the same jammed printer Ned uses to forge Cody's credit slip in Act II.
