# Puzzle thread: THE ECHO (an n-back hidden in a ritual)

**Acts III, IV and V.** The NRT's oldest ritual is a working-memory test. Members speak a stream of peer-review phrases around the Round Table, and you answer only when a phrase **comes back around after exactly one other**. That's a 2-back. Nobody ever calls it that. Nell discovers it by watching a faculty meeting, rehearses it with Iris, and performs it under a hood in B3 with her life on the line.

> A working-memory task, never presented as one. The player is just trying to understand why the faculty nod, then trying not to get caught.

---

## Why the Table does it

- **It's how they spot outsiders.** Members have chanted the Echo since the old table's day. Do it for years and it's automatic. A newcomer has to think, and the hesitation shows.
- **It's how they keep the retired in line.** Members whose gain was turned to zero at 40 still run the Echo on autopilot. That's why the senior faculty nod in unison at meetings: they're answering the Echo. Nobody else in the building has noticed, because faculty meetings already look like that. *That explains a lot of faculty meetings.*
- **Fog neuro, in one ritual.** The Table's most-cited finding, a 1979 paper by its own founders, claims the Echo makes you smarter. It has never replicated. Iris: *"They think it makes them smarter. It makes them agree."*

## The rule (taught in story, never as instructions)

A phrase is spoken. Then another. When a phrase is the same as the one **two back**, you answer.

> MOTION TO APPROVE THE MINUTES.
> MOTION TO TABLE THE PARKING DISCUSSION.
> MOTION TO APPROVE THE MINUTES. ← *the faculty nod*

Plain-language version (Gus, at the meeting): "It's like juggling. Every new thing lands and the oldest thing drops. They're only ever holding two."

---

## 1. THE NOD (Act III, the faculty meeting)

**Setting:** Quorum's faculty meeting, the one he "dies" at. Nell is there to ask about Preston's scanner hours and is stuck waiting for New Business. Gus is in the next seat, whispering.

**Watch (discovery):** Quorum reads motions at a steady pace. Every so often the six senior faculty nod at once, perfectly in sync, then go still. Nell's notebook logs each motion as it's read (one line per motion, a small mark where they nodded). The player can scroll the log and look for the pattern. Gus offers guesses that are wrong in useful ways:
- "They nod at anything about money." (No: the third money motion gets nothing.)
- "They nod every third motion." (No: the log shows gaps of 2, 4 and 3.)
- "…They nod when it repeats? No, it repeated earlier and nobody moved." (Close: it repeated *three* back.)

**Predict (the test):** Once Nell has a theory, she whispers predictions to Gus: click **"NOW."** in the dialogue box right before a nod. The motions keep coming, one every couple of seconds. Get enough right, without calling nods that don't happen, and Gus goes pale:
> GUS: "They're not listening. They're *answering*."

That's the first time anyone sees the Table's control over the faculty, and it seeds the Act V ritual.

**Then Quorum dies.** He slumps mid-motion. Ethel Bord, who is taking the minutes, keeps reading the agenda, because nobody has moved to adjourn. The motions keep repeating, and the senior faculty keep nodding on schedule for forty minutes, around a dead chair. The player can keep calling the nods ("NOW." … "NOW.") as a dark little encore. This is the existing comic-horror peak, now with a mechanism.

**Scoring:** hits and false alarms are scored the way the real task is: signal detection. Nell's notebook afterwards: *"My d′ was 2.4. The faculty's was higher. The faculty aren't conscious."* (+3 for cracking the rule, +1 per correct call, up to +6.)

## 2. THE REHEARSAL (Act IV, Iris's office)

When Nell tells Iris the plan, Iris recognizes the nodding at once.
> IRIS: "The Echo. We did it in 1962 with sherry. You answer the phrase that comes back around after one other. Miss two and they look at you. Miss three and you're quarry."

**Practice with stakes but no death:** Iris runs the Echo herself, in peer-review boilerplate this time ("THE AUTHORS SHOULD CONSIDER…", "THE SAMPLE SIZE IS SMALL…", "THE AUTHORS SHOULD CONSIDER…"). Nell answers **"SECONDED."** at the right moments. Each miss or false alarm earns a click of Iris's staple gun near Nell's sleeve. Three clicks and Iris starts over: *"Again. In 1974 I did this hungover."*

**Iris also warns about the hard part:**
> IRIS: "At an induction, the Board watches *who* speaks, too. If the same seat speaks as two turns ago, you knock the table. Phrase and seat, both at once. And if the Corresponding Author suspects someone, he 'advances the Echo.' Three back. Nobody likes that."

She drills seats with her own office chairs: she moves between them as she speaks, and Nell knocks when she lands in the chair she used two turns earlier. Then both together. It's practice for a dual n-back, without anyone saying so. (+2 for passing each drill.)

## 3. THE INDUCTION (Act V, B3)

The real thing, under Gus's robe, at the Round Table: twelve hooded seats around the old magnet ring.
- **Phrase stream:** Board members speak peer-review boilerplate, one per turn. Answer **SECONDED** (key S, or the button in the dialogue box) when the phrase matches two back.
- **Seat stream:** each turn a different seat's lamp lights as its occupant speaks. Knock (key K, or click the table) when the seat matches two back.
- **Silence is correct** when neither matches. Most turns, the right answer is nothing.
- **Suspicion meter:** each miss or false alarm turns a hood toward Nell (drawn as poses: hoods swivel one notch at a time). Two errors in a row and Quorum leans in: *"Let us advance the Echo."* It becomes 3-back for the next stretch.
- **Three hoods turned:** death #16. *"The authors have failed to address the reviewers' concerns."* The hoods close in. Revise & Resubmit puts Nell back at the start of the Echo.
- **Pass:** the Board accepts her as one of their own. *"The motion carries."* The induction proceeds, which buys Morris and Iris the time they need.

**Morris helps, or doesn't:** if Morris is in the vent above the table, his itch spikes whenever the Gain Controller pulses, and the pulses fall on matches (the retired members are being cued). An observant player can use his ear-twitch as a hint. Morris can also sneeze at the worst possible moment.

---

## Why this works as science

| Concept | Plain-language version in the game | Where |
|---|---|---|
| Working memory (n-back) | "Juggling: every new thing lands and the oldest one drops. You only keep the last two in the air." | The Nod, the Rehearsal, the Induction |
| Load | "Three back is much harder than two. Every extra ball counts." | Quorum "advances the Echo" |
| Dual tasks | "Doing two at once (what was said and who said it) is harder than either alone." | Iris's chair drill; the Round Table seats |
| Signal detection | "Count your hits and your false alarms. Saying 'now' all the time catches everything and proves nothing." | Nell's d′ in the notebook |
| Brain training hype | "Getting better at the game doesn't make you smarter at everything else. People have claimed it does." | The Table's unreplicated 1979 paper |

## Building it

- **Engine:** an Echo is a conversation mode. `CONVOS` gets an `echo` block: `{ n, items, seats?, pace, onMiss, onPass }`. Lines stream at the given pace (about 2.4 s per phrase; slower with an accessibility setting). The response buttons appear in the dialogue box, drawn as chips, with keyboard shortcuts.
- **Sequences:** generated per run from a seed, with about 30% targets, plus lures (repeats at 1-back and 3-back) so guessing "it repeated" isn't enough. That's what makes Gus's "close" guess a trap.
- **Scoring:** hits, misses, false alarms and correct rejections, then d′ for the notebook joke.
- **Visuals:** the faculty nod is a two-pose swap on the chair-back heads; the Round Table seats are twelve lamps on an isometric ring; hoods turn one notch per error.

## Changes to the story

- Act III's faculty meeting gets THE NOD (Quorum's "death" now happens mid-Echo).
- Act IV: Iris's rehearsal is part of telling her the plan.
- Act V: "answer the ritual call-and-response" becomes the Induction Echo.
- Clue chain #20 and death #16 point here.
