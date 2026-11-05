# GAIN CONTROL — Story Bible

> *A neuroscience murder mystery. The paper had no control condition. Now someone's trying to gain control.*

**Genre:** point-and-click comedy adventure
**Lineage:** Sierra structure and death screens (Laura Bow murder-mystery clock, Freddy Pharkas "day job" puzzles, Al Lowe narrator and puns), plus LucasArts flavor (Sam & Max deadpan duo, Day of the Tentacle character switching and cartoon logic), plus Gabriel Knight investigation (day structure, tape recorder, sketchbook, cipher, disguises)
**Look:** OP-1 screen aesthetic (see bottom)
**Rating target:** Al Lowe PG-13 — puns, innuendo, gross-out, cartoon murder

---

## The premise in one breath

Ned Null is a fifth-year grad student whose dissertation keeps coming up null. Across the hall, third-year golden boy Preston "P." Valu just published a dazzling 7T laminar fMRI paper in *Nurture Neuroscience*. The building has a 3T. As Ned starts asking questions, people who know too much start dying, Ned gets framed, and his only witness is an escaped lab rat that only he can hear. His thesis defense is on Friday.

## The secret (what really happened)

1. Last spring Ned submitted his pilot paper (3T data, modest effect, honest). Ned scanned himself as pilot subject #1, retainer and all.
2. The journal sent it to famous Prof. Maximilian Impact for review. Impact, as usual, handed it to his student Preston to ghost-review.
3. Preston, writing as **Reviewer 2**, rejected it ("the authors should simply collect more data"). Then he downloaded Ned's shared dataset.
4. He ran it through an AI super-resolution model on the department GPU cluster to upscale 3T into "7T laminar" data. The model hallucinated beautiful cortical layers everywhere, **including inside Ned's retainer artifact**.
5. He published it with fake participants, a backdated IRB protocol and imaginary scanner sessions. The job offers rolled in.
6. Now anyone who could connect the dots has to go. Preston kills the way he publishes: efficiently, and while framing someone else.

**So the answer to "AI or fabrication?" is both.** The data is real, but it's Ned's. The fake part is everything the AI added.

## Theme

Real data is noisy and fake data is too clean, and the same goes for alibis. Every clue in the game comes down to *noticing something too perfect*. Preston's alibis are spotless, his figures have no motion artifacts, and his participants never miss an appointment.

---

## Cast

| Character | Role | Comic engine |
|---|---|---|
| **Ned Null** | You. 5th-year grad, Adline Lab. | Larry Laffer energy, straight man to Morris. Wears the same conference T-shirt all week. |
| **Morris** | Second playable character. A rat who escaped the Morris water maze two years ago and lives in Ned's desk drawer on ramen. | The Max: gleeful, feral, chaos agent. Goes through vents, walls and ductwork. Only Ned can hear him talk, so nobody believes Ned's witness. |
| **Preston "P." Valu** | The rival and the killer. 3rd-year, Impact Lab. | Relentlessly charming and always networking. Turns every conversation into an elevator pitch. |
| **Prof. Maximilian Impact** | Preston's PI. | Always in an airport. Speaks only in keynote soundbites. Never read the paper with his name on it. |
| **Prof. Dee Adline** | Ned's PI. | Drowning in a grant deadline. Every conversation ends with "can we talk after the 15th?" |
| **Dr. Tess La** | MRI physicist. | Guards the scanner calendar like a dragon. Victim #1. |
| **Penny Ledger** | Department administrator. | The real power in the building. Has every key and every purchase order. Everything requires a form. |
| **Dr. Rex Jected** | Postdoc, year 9. | Bitter informant who works for coffee. So hardened by rejection that he survives his own murder. |
| **Gus Mopley** | Night custodian. | Sees everything at 3am. Speaks in mop-bucket proverbs. |
| **Cody Credit** | Undergrad RA. | "Ran" Preston's participants for course credit and never questioned it. Victim. |
| **Dana Outlier** | Grad student, Preston's labmate. | Noticed Preston never comes in before noon. Victim, found in a recycling bin labeled EXCLUDED. |
| **Prof. Quorum** | Department Chair. | Rules everything by procedure. Victim: dies at the faculty meeting, and nobody notices for 40 minutes. ("We've lost Quorum.") |
| **Ethel Bord** | Research Integrity Officer. | Has a binder for everything, including binders. |
| **Det. Sgt. Enn Small** | Campus police. | Refuses to call it a pattern until N is big enough. "Two bodies? Underpowered." |
| **Reviewer 2** | A hooded figure glimpsed at the edges of rooms. | Running gag all game. Revealed as Preston in Act IV. |
| **The Narrator** | Sardonic, Al Lowe voice. | Comments on the stipend, the coffee and your choices. |

---

## Setting: Fechner Hall, Charles River University

A fictional university building, 1960s brutalist with a 2020s "innovation atrium" bolted on.

- **Basement:** MRI suite ("The Big Donut", 3T), control room, Tess's office, animal facility with the water maze, cold room, liquid nitrogen fill station, -80 freezer room, GPU server room, Gus's closet.
- **1st floor:** innovation atrium with the "Rising Stars" photo wall (Preston's photo is twice as big as anyone's), seminar room (journal club, pizza), main office (Penny), mailroom, coffee kitchen with a broken espresso machine.
- **2nd floor:** Adline Lab (dark psychophysics booths, a cluttered desk with Morris's drawer), Impact Lab (gleaming, empty, and suspiciously free of equipment), the shared printer (always jammed).
- **3rd floor:** faculty offices (Impact, Adline, Quorum), the conference room, Ethel Bord's integrity office.
- **Throughout:** a 1960s **pneumatic mail tube** system that still works. This is the Chron-o-John: Ned and Morris use it to pass items between floors.

---

## Act structure: Defense Week

The Laura Bow clock: each act is one day, characters move around the building on schedules, and the act ends when a body drops.

### Act I — Monday: Journal Club
Preston presents his paper to applause and free pizza. Ned looks at the methods slide and asks, "Wait, when did we get a 7T?" The room goes quiet and Preston's smile freezes. Afterward, Morris (who was in the ceiling for the pizza) says Preston muttered something on his way out.

- **Teaches:** verbs, Ned/Morris switching, the pneumatic tube.
- **Clues:** the 7T claim; a printed copy of the paper.
- **Act ends:** a sticky note on Ned's monitor reads *"Curiosity killed the cat. Also grad students."*

### Act II — Tuesday: The Paper Trail
Ned investigates.

- **Clues:**
  - The scanner booking calendar shows Preston never booked a session (Tess's office).
  - No 7T or laminar coil was ever purchased (Penny's purchase orders).
  - The IRB protocol was approved *after* the data were collected (Ethel's binders).
  - The participant sign-in sheet includes *H. Molaison, P. Gage, S. M.* and *Totally Real Person* (Cody's clipboard).
- **Act ends:** Tess La is found dead in the magnet room, killed by a flying ferromagnetic thermos labeled **NED**. Ned is now the prime suspect, and Det. Sgt. Small arrives.

### Act III — Wednesday: Underpowered
Ned is under suspicion and investigates around Small's interrogations.

- **Clues:**
  - Table 1's means are mathematically impossible (the GRIM test, done on a calculator).
  - Figure 3b and 3d are the same panel, flipped (an overlay puzzle).
  - Preston used 4,000 GPU-hours on a job called `superres_laminar.py` (cluster logs, via Rex and coffee).
- **Deaths:**
  - Dana Outlier, who told Ned about Preston's hours, is found "excluded."
  - Cody Credit is found floating in the water maze, "unable to locate the hidden platform." Morris witnessed it from the vent but can't testify.
  - Prof. Quorum dies at the faculty meeting. The meeting continues for 40 minutes.
- **Act ends:** Det. Small: "Three more bodies. Still, I'd want a replication."

### Act IV — Thursday: The Ghost Reviewer
Prof. Impact flies in, tells Ned he'll "look into it," and is found frozen in the -80 next to a box labeled DO NOT THAW. Ned and Morris break into Impact's office (password: his h-index).

- **Two big reveals:**
  - **Reviewer 2's report on Ned's paper** is in Impact's files, written in Preston's unmistakable style (he spells it "nueron" and uses "utilize" constantly).
  - **The retainer.** Ned looks again at Preston's figure and sees his own retainer artifact. The AI has hallucinated six cortical layers inside it. *"That's not his data. That's my mouth."*
- **Act climax:** Preston knows Ned knows. A chase through the basement: cold room, LN2 station, animal facility. Rex is "killed" in the LN2 room and survives, because nine years of postdoc have made him impervious. Ned escapes with the evidence (unless he dies, a lot).

### Act V — Friday: The Defense
Ned's thesis defense is scheduled at the same time as Preston's job talk, across the hall. Ned turns his defense into the accusation. The committee is Adline, Ethel Bord, Det. Small and an empty chair for Quorum.

- **Mechanic:** a Laura Bow-style interrogation. Present your evidence in a convincing order and answer the committee's questions. Your score (h-index) decides the ending.
- **Finale:** Preston bolts into the MRI suite wearing his solid-gold "Rising Star" award medal. He finally rises to the top, straight into the bore.

### Endings
- **Accepted:** Preston arrested, paper retracted, Ned passes his defense, and Ned gets the job Preston was interviewing for.
- **Major Revisions:** Preston arrested, but Ned's defense is a mess. See you next semester.
- **Desk Reject:** Preston gets the job. Ned is appointed to the curriculum committee. THE END.

---

## Gameplay pillars

### 1. Sierra deaths with a LucasArts safety net
Every death gets an Al Lowe narrator joke, but the death screen has two buttons:
- **Revise & Resubmit:** rewinds to just before the death (LucasArts-friendly, so no lost progress).
- **Withdraw Manuscript:** quit.

This way you get Sierra's death jokes without its punishment.

### 2. Ned + Morris switching (the Day of the Tentacle engine)
- **Ned** can talk to people, use doors, sign forms and operate equipment. People take him semi-seriously.
- **Morris** goes through vents, ceilings and walls, steals small things, causes chaos, and eavesdrops. Nobody notices a rat (except the animal facility staff).
- **The pneumatic tube** passes items between them across floors.
- Many puzzles need both. *Example:* to get into Tess's office, Morris goes into the vent above the scanner control room and chews a wire, which sets off the "helium low" alarm. Tess runs out. Ned walks in.

### 3. Day job interludes (the Freddy Pharkas engine)
Ned is still a TA. Undergrads from his stats section show up at random with questions, just as Freddy's customers did. A correct answer earns points and sometimes an item or favor. The same stats skills (GRIM, distributions, outliers) are what crack the case later, so the day job trains you for the mystery.

### 4. Sam & Max texture
- Use/Look on *everything* gets a joke, especially Morris's lines.
- Deadpan, surreal side characters, and running gags that pay off in later acts.
- Morris's "solutions" are frequently violent and must be talked down.

### 5. Investigation tools (the Gabriel Knight engine)
- **Days, not rooms.** As in *Sins of the Fathers*, each day opens with a title card ("MONDAY — JOURNAL CLUB"). A day ends only when you've done its key things, and the clock moves the cast around the building.
- **Voice memo recorder:** Gabriel's tape recorder. Record what people say and play it back to someone else for a reaction. Play Preston's "I ran every subject myself" to Cody; play Penny's "nobody ordered a coil" to Prof. Impact. Recording Morris gets you nothing but squeaks.
- **Lab notebook:** Gabriel's sketchbook. Trace figure panels, signatures and artifact shapes, then compare them over other images. This is how the duplicated panel and the retainer reveal work.
- **The coordinate cipher:** the voodoo code. The killer's threatening notes are strings of MNI brain coordinates. Look each one up in the atlas on Ned's computer, and the region names' initials spell out the message. Ned learns the code a few symbols at a time, and in Act V he writes his *own* note in it to lure Preston into the trap.
- **Disguises:** the cat-hair mustache tradition. Ned gets into the faculty-only lounge as Prof. Impact, using a keynote lanyard, an airport neck pillow, and Morris on his head as the hair.
- **Archive research:** Ned can read old papers, Preston's CV and the department newsletter archive to look up what he needs (who had scanner access in which years, what "laminar" actually requires). These are real reading puzzles, the way Gabriel researched at the bookstore and library.

### 6. Score = h-index
Points are "citations." The status bar reads *h-index: 14 of 50*.

---

## Clue chain (story → puzzle)

| # | Clue | Where | Puzzle sketch |
|---|---|---|---|
| 1 | 7T claimed; building is 3T | Journal club | Look at the methods slide |
| 2 | No scanner bookings | Tess's office | Morris triggers the helium alarm; Ned grabs the calendar |
| 3 | No coil purchased | Penny's office | Penny requires Form PO-7 signed by a PI. Slip it into Adline's grant pile while she's signing in a panic |
| 4 | Backdated IRB | Ethel's office | Find the right binder (the binder of binders) |
| 5 | Fake participants | Cody's clipboard | Trade Cody a credit slip forged on the jammed printer |
| 6 | Impossible means | Calculator | GRIM test |
| 7 | Duplicated panel | Overlay screen | Rotate and flip panels to match (OP-1 visual mini-game) |
| 8 | GPU logs | Server room | Rex's password costs coffee; fix the espresso machine (multi-step) |
| 9 | Murder weapon | Kitchen / Gus | Gus saw who took the NED thermos, but only tells you after you mop for him |
| 10 | Reviewer 2 identity | Impact's office | Password = h-index (findable in his bio); match the writing quirks |
| 11 | The retainer | Ned's own pilot scan vs. the paper's figure | Overlay your scan on his: identical dropout, hallucinated layers |
| 12 | Witness | Morris | Get Morris's testimony admitted (a cartoon-logic puzzle in Act V) |
| 13 | Threat notes | Sticky notes, all week | Coordinate cipher. Decode each note in the brain atlas. In Act V, write your own note to lure Preston |
| 14 | Preston's lie on tape | Voice memo | Record "I ran every subject myself" in Act I; play it to Cody in Act II to get the clipboard |
| 15 | Faculty lounge | 3rd floor | Disguise as Impact (lanyard + neck pillow + Morris as hair) |

---

## Death list (draft)

1. Walk into the magnet room with your keys. *"You have become a ferromagnetic projectile. Your last thought is about the Lorentz force."*
2. Drink from the communal fridge (labeled DO NOT DRINK — SAMPLE).
3. Get cornered by the Chair. *"You have been appointed to the curriculum committee. Your research career is over."*
4. Pipette by mouth.
5. Look into the two-photon laser. *"Well, you wanted to see it."*
6. Put your hand into liquid nitrogen.
7. Shut yourself in the cold room.
8. Tell Preston you're onto him in Act I.
9. Answer "So, when are you defending?" honestly, followed by existential collapse.
10. Reply to Reviewer 2 point by point. *"Your response exceeded the word limit. Also, you died."*
11. Fall asleep in a dark-adapted psychophysics booth. Wake up a 9th-year.
12. Eat the journal club pizza on Thursday.
13. Enter the animal facility without booties.
14. Tell your PI you're thinking about industry.
15. Let Morris drive the floor buffer.

## Running gags
- The espresso machine (broken, then fixed, then the center of a murder).
- "So, when are you defending?"
- Reviewer 2 in the background of rooms.
- Det. Small's sample-size jokes as the body count climbs.
- The printer: PC LOAD LETTER.
- Preston's photo on the Rising Stars wall gets bigger each act.
- Ned's stipend, mentioned by the narrator.

---

## Visual direction: OP-1 screen
- Flat vector shapes on black, a limited palette (blue, green, white, orange, plus grey), and thin line work. Everything looks like a toy diagram.
- **The four OP-1 encoder colors are the four verbs:** blue = Walk, green = Look, white = Use, orange = Talk. Number keys or encoder clicks switch verbs.
- The scanner is a big white donut, brains are wobbly blobs, people are simple geometric figures with expressive eyes.
- The inventory lives on a tape-reel screen and the verb bar looks like the OP-1 mode row.
- Low internal resolution (OP-1 is 320×160; we could do 320×200 for Sierra feel), scaled up crisp.

---

## Open questions
- Is Ned fixed, or does the player get to name and customize the hero?
- Five acts or four? (Act III is packed.)
- Should the Day of the Tentacle switching expand to a third character (Gus on the night shift as a flashback act)?
- How much real neuroscience should the puzzles use? Real GRIM math and real artifact-spotting, or simplified?
- Engine: web (canvas, like the other games) or something else?
