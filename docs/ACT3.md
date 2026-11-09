# Act III — Wednesday: MAJOR REVISIONS (playable: design and build spec)

*Story logic: `game/js/story/act3.js`. New rooms: `kitchen.js`, `server.js`, `tunnels.js`, `conference.js`, `iris.js`, plus additions to `lab.js`, `hallway.js` and `impact.js`. New minigames: `ceiling.js`, `overlay.js`, `nod.js`; the existing `glm.js` is wired onto Nell's monitor.*

**Question:** Why?
**Day (Nell + Morris, switchable; Gus at his desk as Nell's methods partner):** prove the fraud four ways, lose Dana, sit through the faculty meeting where Quorum "dies", and meet Iris. **Night (Gus):** the steam tunnels, the bricked door and the canister. **Turn:** Nell isn't chasing a cheater. She's being hunted.

This file is both the design and the contract between the art (rooms, figures, portraits) and the story code. Ids, flags and stand points here are the interface.

---

## Flow

1. **Card:** WEDNESDAY · ACT III MAJOR REVISIONS · ADLINE LAB 114 · 10:12. Nell and Morris in the lab; Gus at his desk, awake since Monday. Det. Sgt. Small is waiting by the door for a "quick chat" (convo `smallLab`: the thermos, sample sizes, "don't leave the building").
2. **Four proofs, any order.** Each is a notebook line, points, and a beat with Gus.
3. **Dana.** After the second proof, the next time Nell walks into the hallway Dana is gone and her sneakers are sticking out of the recycling bin labeled EXCLUDED. Small: "Two bodies. Still underpowered."
4. **The faculty meeting.** With all four proofs, Ethel comes to Nell (Gus emailed her) and says misconduct can only be raised under New Business at today's faculty meeting; the scene cuts straight to 3F at three o'clock, and afterwards Ethel walks Nell up to Iris (no stairwell errands). Inside: **THE NOD** (a 2-back the faculty answer by nodding). Then Quorum slumps mid-motion and the meeting carries on for forty minutes.
5. **Iris.** Ethel, shaken, points Nell to "the old woman on four. She's been saying this since 1977." The old woman introduces herself as **Prof. Emerita Iris Candor**: the Secret Six, the rule of silence, retirement at 40, the Hunt. *"You're this year's quarry, dear. Your paper didn't get rejected. You got selected."*
6. **Card:** WEDNESDAY NIGHT · NIGHT SHIFT GUS · GPU SERVER ROOM B1 · 01:51.
7. **Night (Gus):** the chilled-water leak leads from the server room through the equipment door into the steam tunnels. The bricked door with the insignia; chanting in peer-review boilerplate through the brick. A canister rattles down the tube line overhead; Gus opens the access hatch and catches it: **"THE GRAD STUDENT AND HER LABMATE. BEFORE FRIDAY."** END OF ACT III.

## The four proofs

| # | Proof | Where | How |
|---|---|---|---|
| 6 | **Above the noise ceiling (THE CEILING)** | Gus's desk (lab) | Table 1 reports brain-behaviour correlations across N = 19: how well each layer's attention effect predicts each person's attention score (up to r = .94). Three steps. (1) RELIABILITY: in Supplementary Figure S2, pick the two panels that plot a measure against itself (attention score session 1 vs 2, r = .64; V1 effect odd vs even runs, r = .56), not the decoys (head motion, pizza). (2) THE CEILING: Gus drops the noise ceiling, √(.64 × .56) ≈ .60, onto Table 1; mark every correlation above it (3 of 6; .58 sits just under). (3) HOW: in the methods, find the sentence that selects voxels *because* they correlate with the score and then reports that correlation (non-independence, the 2009 "puzzlingly high correlations" critique). RUN IT ON NOISE: the same recipe on 5,000 voxels of pure noise gives r ≈ .8. Minigame `ceiling.js`. Flag stays `proofGrim`. |
| 7 | **Duplicated panel** | Nell's monitor (lab), after THE CEILING | Figure 3b and 3d are "two different participants". Rotate and flip 3d (ROTATE, FLIP ↔, FLIP ↕) until it lies exactly on 3b. The overlay goes from a tangle to one clean line. Minigame `overlay.js`. |
| 8 | **GPU logs** | Kitchen (1F) → server room (B1) | Rex lives by the broken espresso machine (DESCALE). He'll trade his login for a coffee. He has pressed its button every morning since 2012; nobody else ever has. Nell presses it (BREW): it descales itself with a dial-up-modem noise and fills the mug Rex has been holding out, and Rex trades his login (a sticky note). (Trimmed for pacing: the energy-drink descale and the mug fetch are gone; the can survives as an easter egg: SNOOP Gus's desk for his emergency NULL HYPOTHESIS, pH 2.4, and USE it ON the machine to descale and brew the same coffee, +2 optional.) In the server room, LOG IN: 4,000 GPU-hours of `superres_laminar.py`, and a job that runs every Friday at 00:00: `ltm_generate.py --corpus /mnt/B3/archive --byline "P. Valu"`. The output queue holds *Valu et al. (2027): "The Null Result of N. Null Is an Artifact."* |
| 7b | **The replication** | Impact Lab (Morris) → Nell's monitor | Preston's stimulus log is on his desk in the (day, empty) Impact Lab, which Nell can't open. **Morris** goes through the vent and drags it out. Nell USEs the log ON her monitor: THE REPLICATION (`glm.js`). ATTEND = IGNORE. "It's not a small effect. It's no effect." |

**Seeds and side scenes:**
- **Preston in the hallway** (day, by the Rising Stars wall), networking at no one. TALK: he's solved a new Big Question since yesterday; mid-pitch his earbuds pulse and his face goes blank ("fog neuro… Cog. Cog neuro."). If Morris is in the room, his itch spikes. (+2, `prestonBlank`.)
- **Dana Outlier** (day, in the hallway by the Impact Lab door, before she's "excluded"): Preston never comes in before noon, leaves at 23:40 on Fridays, and the elevator "doesn't go down that far." (+1, `danaTalk`.)
- **Rex's legend** (kitchen, once he has his coffee): "There's a secret society. Under forty. I applied at 39 and 11 months. They said my CV was *too old*."
- **The invitation** (Impact Lab, Morris: USE the printer). Preston's NRT invitation on cream paper: a Revelation of unpublished work, no minutes, never on a CV, retire at forty, a receipt that calls it an "invited talk", and RSVP with your date of birth so they can check you aren't "wizened." (+3, `invite`.) It echoes through Rex (he sent his DOB; the reply was one word), Iris ("It was 1974. I was the reason."), Penny (the same six faculty file the same "invited talk" receipt every fall) and Preston ("a Revelation… nobody writes it down").
- **Kitchen corkboard:** "WHO KEEPS BOOKING THE OLD B-LEVEL ROOM ON FRIDAYS" (no reply).

**Through the brick (tunnels, Gus: LISTEN on the bricked door).** The chanting stops for the after-dinner portion. Item four, Correspondence: the Midwest has written again. The hoods roast their Midwestern imitators. Why German, when the most German thing for a hundred miles is a bratwurst? *Versuche* means attempts, so it's the Society for Endless Attempts, named after their grant success rate. They left the umlaut off the letterhead ("the Society of Fur"). They hand out a little rocking chair at forty ("When ours turn forty, we give them a faculty position and a nod. Nobody has to dust anything."). They let women in back in the sixties ("Imagine the paperwork"). The joint-meeting request is answered: reply with our regrets, and ask for their birth dates. SECONDED. Gus: "They're jealous of a rocking chair." The voice running the meeting is the Chair, who died at three o'clock. (+2, `overheard`.)

**The real record (secret, unhinted).** Three tiny objects that aren't fiction. Each opens a FROM THE REAL RECORD card with factual notes in our own words, with sources (+1 each, once per game; the notebook never mentions them). They're in Act III, and stay findable in Acts IV and V wherever those rooms can be visited (`story/realrecord.js`):
- `iris.ap1977`: one issue sticking out of the 1977 tower of journals. The real Psychological Round Table (1936): young, male, Eastern, out at forty. Gross's 1977 letter in *American Psychologist*.
- `iris.rocker`: a toy rocking chair on the window sill. GUV, the *Gesellschaft für Unendliche Versuche*, the Midwestern spin-off of the early 1960s ("bad German for 'Society for Endless Research'"): it admitted women, and gave a miniature rocking chair at forty. Source: Shanteau et al. (eds.), *Decision Science and Technology* (1999).
- `kitchen.invite2018`: a small folded card half behind the corkboard frame. A real 2018 invitation, with the sender's name removed: out at forty, Revelations, no minutes, not on CVs, RSVP with your date of birth.

**Deaths (Act III):**
- Ask the LTM rack to write your dissertation (death 21).
- TALK to Quorum before the meeting starts: appointed to the curriculum committee (death 3).
- In the tunnels, knock on the bricked door: the chanting stops. *"The authors are invited to resubmit. In person."*
- GLM: TRY ANOTHER ANALYSIS fourteen times (death 20, already in `glm.js`).

---

## Build spec (the interface)

### Stairs (story-owned)
The hallway's `stairs` hotspot gets a multi-exit `go` in Act III: `{ down: "mri@fromStairs", server: "server@fromStairs", up: "ethics@fromStairs", meeting: "conference@fromStairs", emeritus: "iris@fromStairs" }`, only the reachable ones each time. Hallway `labels.day.stairs` and `labels.night.stairs` must define all five: `down: "B1 MRI"`, `server: "B1 SERVERS"`, `up: "2F INTEGRITY"`, `meeting: "3F MEETING"`, `emeritus: "4F EMERITUS"`. Rooms reached from the stairs have a `door` hotspot that goes back to `hall@fromStairs`.

### Pose groups
- Existing ambient clocks: `nod` (800 ms), `alarm`, `wave`, `type`, `jam`, `hum`, `phone`, `saver`.
- New ambient clocks (add to `clocks` in main.js): `blink` (300 ms: server LEDs), `drip` (600 ms: pipes, the espresso machine), `tube` (a canister zipping along a tube line, groups with data-i 0/1; 450 ms), `chant` (700 ms: `((( )))` around the bricked door).
- `vote`: **not** a clock. The faculty heads in the conference room are drawn twice, `<g class="pz on" data-g="vote" data-i="0">` (heads up) and `<g class="pz" data-g="vote" data-i="1">` (heads down: nodded). `nod.js` drives it.

### Rooms (all export `{ id, name, pp, floor, entries, draw(G) → { back, sortables }, stand, labels }`, like `office.js`)

**kitchen** (new) "COFFEE KITCHEN 1F". Hotspots: `rex` (Dr. Rex Jected leaning by the machine, day only), `espresso` (the machine; a blinking DESCALE chip in `jam` and drips in `drip` unless `G.flags.descaled`; when descaled, a lit READY LED and a curl of steam), `mugs` (a mug tree; one hook empty when `G.flags.gotMug`), `fridge` (DO NOT DRINK — SAMPLE), `board` (corkboard with notes), `sink`, `vent`, `door` (to hall). Entries `fromHall`. Stand points for every hotspot plus `stand.vent`. Labels day: `espresso {use:"BREW"}`, `mugs {use:"TAKE A MUG"}`.

**server** (new) "GPU SERVER ROOM B1". Racks of servers with LEDs in `blink`; one rack apart labeled LTM with a tiny lit insignia sticker. Hotspots: `terminal` (a console on a cart: login screen), `racks` (the cluster: heat shimmer arcs), `ltm` (the LTM rack), `thermostat` (31 °C), `equip` (a heavy door: MRI EQUIPMENT · CHILLED WATER; a puddle under it at night), `door` (to the stairs), `vent`. Entries `fromStairs`, `fromTunnels`, `night` (by the terminal). Labels: `terminal {use:"LOG IN"}`, `ltm {use:"ASK IT TO WRITE YOUR DISSERTATION"}`, night `equip {go:"FOLLOW THE LEAK"}`.

**tunnels** (new, night) "STEAM TUNNELS". A one-point perspective corridor of pipes receding to the vanishing point (perspective grid on the floor), dim. Hotspots: `bricked` (the bricked-over doorway in the left wall with the NRT insignia scratched into it; while `G.flags.chanting`, `((( )))` arcs in `chant` and a faint `THE AUTHORS SHOULD CONSIDER` in hairline DIM), `tube` (the pneumatic tube line along the ceiling; a canister jumps between positions in `tube` while `G.flags.canisterLive`), `hatch` (an access hatch on the tube at reachable height; open when `G.flags.hatchOpen`), `pipes` (steam drips in `drip`), `valve` (a big red wheel: red herring), `back` (door to the server room). Entries `fromServer`. Labels night: `bricked {use:"KNOCK"}`, `hatch {use:"OPEN"}`, `back {go:"BACK"}`.

**conference** (new) "CONFERENCE ROOM 3F". One-point, front-facing: the long table runs from the front of the stage to the back. **Quorum** at the head (center back), cufflinks lit SIGNAL; slumped forward on the table when `G.flags.quorumDead` (cufflink still lit). Six senior faculty, three per side, as chair backs with heads (one identifying mark each); their heads use the `vote` groups above. **Ethel** at a small side desk taking minutes. **Gus** seated near the front-left when `G.flags.meeting`. An empty chair (Nell's, the student rep seat) front-right. An easel: AGENDA. Hotspots: `quorum`, `faculty` (all six as one), `ethel`, `gus`, `agenda`, `seat` (the empty chair), `urn` (coffee urn: red herring), `door`. Entry `fromStairs`, stand for each. Labels day: `seat {use:"SIT DOWN"}`, `faculty {look:"WATCH"}`.

**iris** (new) "EMERITUS OFFICE 4F". Cramped, stage-like: towers of journals from 1961 on, a window, a desk with Iris behind it, a framed letter, a 1968 photo. Hotspots: `iris` (Iris seated at the desk), `stacks`, `manual` (a fat 1960s magnet manual, handwritten margin notes), `photo` (1968: a young woman beside a giant ring magnet, drawn as a wireframe photo), `letter` (a framed 1977 letter), `stapler` (the stapler on the desk), `kettle` (an electric kettle and a sherry bottle), `door`. Entry `fromStairs`.

**lab** (edit). In Act III day: `gus` hotspot, Gus seated at his desk (gusdesk), laptop open, awake; `small` hotspot, Det. Sgt. Small standing by the door while `!G.flags.smallLab`. Nell's `monitor` keeps its id. Entry `start` already exists. Gus is not drawn at night in Act III (he's the active character).

**hall** (edit). `kitchen`: a new door (COFFEE). `dana`: Dana Outlier standing by the Impact Lab door, day, Act III, while `!G.flags.danaGone`. `bin`: a recycling bin labeled EXCLUDED (Act III only); when `G.flags.danaGone`, a pair of sneakers sticks out of it and police tape crosses it. `small`: Det. Sgt. Small standing by the bin while `G.flags.danaGone && !G.flags.danaClosed`. `preston`: Preston standing by the Rising Stars wall, day, Act III, while `!G.flags.prestonGone`; earbuds lit; give his group `id="preston"` and use the `normal-only` / `blank-only` classes so the engine's blank-out works (see Room 101). Entries add `fromKitchen`. Stairs labels as above.

**impact** (edit). Day state (when `G.mode === "day"`): lights on, the room empty, Preston's desk with a binder `log` (STIMULUS LOG, drawn while `!G.flags.gotLog`), and a `vent` hotspot (low grille) with `stand.vent` and entry `vent`. Night stays as it is.

### Figures and portraits
- **Rex** (Dr. Rex Jected, postdoc year 9): standing lean, five-o'clock shadow, bags under the eyes, a lanyard with a badge reading "9", an empty mug. Portrait `rex` "DR. REX JECTED".
- **Dana Outlier**: standing, a single strand of hair sticking straight up (the outlier), a bike helmet clipped to her bag. Portrait `dana` "DANA OUTLIER".
- **Preston standing** (full figure for the hall), same look as his portrait and seminar bust: hair BRASS, blazer SIGNAL, earbuds ON.
- **Quorum**: white hair combed back, bow tie, cufflinks with the insignia lit. Seated at the head; a slumped variant. Portrait `quorum` "PROF. QUORUM".
- **Six faculty heads**, one mark each (glasses, beard, bald, bun, bow tie, turtleneck), heads-up and heads-down variants.
- **Gus seated** (at his lab desk and in the conference room); **Iris seated** at her desk.
- Portrait `irisNamed`: the same drawing as `iris` but named "PROF. IRIS CANDOR".
- Pick color keys that don't collide (see STORY.md → Character color keys) and add them there.
