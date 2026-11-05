# Set piece: THE FOG (a contrast-threshold puzzle)

**Act IV — Thursday: REBUTTAL, the basement chase.** The NRT floods the basement corridors with fog from the ceremonial fog machines they use at inductions. ("Atmosphere," says the manual. Members call it *fog neuro*, and they think that's hilarious.) Preston is somewhere in it, coming after Nell. She has to reach the right rooms, in order, through a run of hallways that get foggier each time, while the doors and their markers fade toward invisible.

The puzzle is real visual psychophysics: fog lowers contrast, small fine detail vanishes first, big coarse shapes survive, walking closer helps twice over, your own flashlight makes it worse, and the last stretch is a literal staircase procedure in a literal stairwell.

---

## The science, in the order the game teaches it

| Idea | What's true | Plain-language version (said first, by Gus by phone or Morris from the vent) |
|---|---|---|
| **Fog lowers contrast** | Fog adds a veil of scattered light over everything, so light parts and dark parts get closer together. Contrast = (bright − dark) / (bright + dark), and a veil adds to both. | "Fog doesn't hide things. It washes them out. Everything drifts toward the same gray." |
| **Distance makes it worse, fast** | Apparent contrast falls off exponentially with distance in fog. | "Every step away costs you more than the last one." |
| **Fine detail goes first** | Contrast sensitivity depends on spatial frequency. It peaks for medium-sized patterns and drops steeply for fine ones, so small print falls below threshold long before big shapes do. | "Big and blurry survives fog. Small and sharp goes first." |
| **Getting closer helps twice** | Closer means less fog in the way, *and* the marker covers more of your eye, so its detail moves toward the sizes you see best. | "Walk up to it. It gets clearer and bigger at the same time." |
| **Near threshold is a coin flip** | At threshold you see something some of the time, not all or nothing (the psychometric function). | "If you only half see it, you're right at the edge. Get a step closer." |
| **Light makes fog worse** | A light near your eyes lights up the fog in front of you and adds to the veil (backscatter: why you don't use high beams in fog). | "Like high beams in fog. Put the phone light down." |
| **Hybrid images** | One sign can carry two messages: a coarse one you read from far away or in fog, and a fine one you only see up close. | "Read it up close. What it says from far away might not be what it says." |
| **Staircases** | Thresholds are measured adaptively: make it harder after correct answers, easier after a mistake. A 2-down-1-up rule settles where you're right about 71% of the time. | (Nobody explains this one in advance. The vision scientists in the audience will get it.) |

---

## How it plays

The basement is a chain of five short corridors (one-point perspective, like the hallway in Act I), each one foggier than the last. Each corridor has four to six doors. Nell has to reach a specific door in each, and the instruction for which door comes from Morris (through the vent) or Gus (by phone; this is his last day). Some instructions name fine features ("B-14"), some name coarse ones ("the big door with the yellow stripe"), so the player learns what fog leaves behind.

**Drawing the fog (in the house style).** No gradients or blur. Fog is a flat veil: the background lifts from black toward a dim gray and every line's color moves toward that same gray, by an amount that grows with its distance from Nell. A few wisps drift past as hairline glyphs, swapped in poses. Near threshold, a marker's strokes **flicker in and out**: each stroke is visible on a given frame with a probability set by its contrast and size. You literally watch the psychometric function happen, one stroke at a time.

### Corridor 1 — light fog (learn the rule)
Room numbers are readable from halfway down the hall. The target is the **cold room**, to hide from Preston. Easy, except that the fog visibly thickens with distance: the far doors are already gray. *Morris: "Things far away are getting shy, pal."*

### Corridor 2 — coarse beats fine
From the far end, numbers are gone, but each door's big features survive: a wide hazard stripe, the size and shape of the door window, a big biohazard trefoil. Morris says "the yellow stripe," and that's enough. Then the next instruction is a number only. Nell has to walk door to door and read each one up close, and the number sharpens and grows as she approaches.

### Corridor 3 — the flashlight
It's dark down here, and Nell's phone has a light. **USE PHONE LIGHT** makes the fog glow and the markers *less* legible: the veil gets brighter in front of her. The fix: hold it low and to the side (a separate verb, **SHINE LOW**), or turn it off and let the exit sign do the work. Preston's earbuds glow ON-green in the fog, the most visible thing in the corridor: two green dots with `((( )))` arcs. You can always tell where he is, as long as you don't light up the air.

### Corridor 4 — the decoys
The NRT has re-signed some doors with **hybrid signs**. From the fog, a door reads **EXIT** in big coarse letters. Up close, the fine print over it says **−80 FREEZER**, the freezer Impact was found in. Players who trust the coarse message walk in (death below). Players who learned "walk up to it" read the fine print. One honest door's sign does the opposite: its coarse shape says nothing, but up close it's the stairwell.

### Corridor 5 — the staircase (in the stairwell)
The basement stairwell goes down past B2 toward B3, landing by landing. Each landing has two doors, and only one leads on. This stretch is **adaptive**:
- Two correct doors in a row, and the NRT turns the fog up a notch. ("She's getting away. More atmosphere.")
- One wrong door, and it opens onto the stairs back up a flight, where the fog is thinner.
- The run ends after **eight reversals**, the way a real staircase does, and Nell reaches the bottom at a fog level pinned to her own threshold. A player who's good at it gets a harder final landing, and a struggling one gets an easier one. Everyone finishes; nobody is stuck.

At the bottom, Nell's notebook (and the HUD) shows the readout, in the stroke alphabet:
> **CONTRAST THRESHOLD 2.1%**  *(2-down-1-up, 8 reversals, ~71% correct)*
> NELL: "I just ran a staircase in a staircase."
> MORRIS: "Is that a joke? It feels like a joke."

---

## Deaths and gags

- **The decoy (Sierra death):** walk into the −80 FREEZER under the coarse EXIT. *"You have been archived at −80 °C. Your samples will be stable for decades. You won't."* Revise & Resubmit puts Nell back at the start of corridor 4.
- **High beams:** shine the phone light straight ahead three times while Preston is in the corridor. The fog lights up like a stage, with Nell in the middle. *"You have successfully made yourself the brightest thing in the basement."* Preston catches her.
- **Rex's threshold:** Rex, "killed" in the LN2 room, staggers out of the fog. *"Nine percent. My threshold's nine percent. It's the coffee."* He survives, as always.
- **The fog machine's label:** FOG NEURO 3000, property of the Round Table, CHECK OUT FROM B3. One more piece of evidence that B3 exists.

## Building it (for later)

- **Fog model:** each drawn element gets an apparent contrast C = C₀ · e^(−β·d) · V, where d is its distance from Nell along the corridor, β is that corridor's fog density, and V < 1 when the phone light is on (veil). Each element also has a size class (fine, medium, coarse) with its own threshold. Visibility per frame = a Weibull psychometric function of C / threshold. Strokes are shown or hidden per frame (poses), never faded with gradients.
- **Colors:** fog moves stroke colors toward the fog gray through the CSS palette variables, so it works in both day and night palettes.
- **Staircase:** a standard 2-down-1-up on β, with a step size that halves after the first two reversals, ending at eight reversals. The threshold readout averages the last six.
- **Rooms:** `game/js/rooms/basement.js`, a corridor generator (doors, markers, hybrid signs) driven by a per-corridor spec in `story.js`.

## Changes to the story

- Act IV "The chase" now runs through THE FOG.
- New science rows and two new deaths in STORY.md.
- The FOG NEURO 3000 label joins the evidence that B3 exists.
