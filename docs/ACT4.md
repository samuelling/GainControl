# Act IV — Thursday: REBUTTAL (design and build spec)

*Story logic: `game/js/story/act4.js`. New rooms: `library.js`, `impactoffice.js`, `freezer.js`, `maze.js`; Act IV states for `hallway.js`, `lab.js`, `tunnels.js`, `mri.js`, `iris.js`. Minigames: `metamer.js`, `hours.js`, `retainer.js`, `stairwell.js` (THE FOG, refactored into a callable minigame), `echo.js` (THE REHEARSAL).*

**Question:** Who's pulling Preston's strings?
**Day (Nell + Morris; Gus awake at his desk):** Impact flies in and agrees to talk at 4. He's found frozen in the −80. His office gives up Reviewer 2 and the retainer. Cody is killed in the water maze, and Morris saw who did it. Preston comes after Nell through the fog. **Night (Gus):** the coat check, the map, the date. **Friday dawn:** Gus in the 3T. **Then:** Nell tells Iris the plan, and THE REHEARSAL.

This file is the contract between art, minigames and story. The ids, flags and stand points are the interface.

---

## Flow

1. **Card:** THURSDAY · ACT IV REBUTTAL · ADLINE LAB 114 · 09:15. Nell and Morris in the lab, Gus at his desk.
2. **Impact** is in the hallway with a neck pillow and a rolling bag, rattled, on the phone. TALK: he'll meet Nell "at four, my office, third floor. Come alone. Don't bring the rat." (flag `impactMet`.)
3. **Three leads, any order:**
   - **The library (2F, via the stairs):** THE METAMER. Nell lays the Big Finding's sentences against the back issues, the way Gus's FOG NEURO printout taught her. Each sentence is lifted from an older paper, and every source author comes from the same three feeder labs. Two references don't exist (Quorum 1979b; *J. Endless Res.*). (`clueMetamer`.) Also on the reading table, the Valu vs. Mick feud: same LTM seed on both papers (LOOK, `clueFeud`, +2). And the **faculty directory**, which gives Impact's h-index: **112** (`sawHindex`).
   - **The dark booth (Adline Lab, via Gus):** THE DARK (`darkbooth.js`). Gus wants a measurement, not a rat's anecdote: anything that drives current through a coil next to living tissue leaks a little light, and the Gain Controller's earbuds emit a few **trace photons** a second. Only fully dark-adapted rods can catch them (Hecht, Shlaer & Pirenne, 1942: a flash of about a hundred photons at the eye, a handful absorbed, is seen). Gus has already put Preston in the booth ("a rod study; middle authorship." "Co-first?" "We'll see."). Three steps: (1) MAKE IT DARK: tape the ON lamp, turn the phone face down, stuff Gus's hoodie under the door; (2) ADAPT: the dark-adaptation curve plays out over 20 compressed minutes, with the cone plateau, the rod-cone break at ~8 min and the rod branch dropping below the emission line. CHECK PHONE bleaches you back to zero. (3) LOOK BESIDE IT: sparse photon bursts (two, one, two, with the earbud pulse) among the rods' own dark noise. The cursor is the gaze and the fovea has no rods, so dots right where you look vanish (averted vision). Name the shape three times, each fainter: a ring (a coil), the Table's insignia (a circle seated round a smaller circle), and a gain dial pinned at MAX. Afterwards Preston comes out ("Put me down as co-first") and blanks mid-sentence. Flags `darkReady` (Gus's convo `gusDark`), `clueDark` (+3); a defense card, THE DARK BOOTH, answers WHY.
   - **The missing hours (main office):** Penny hands over the "invited talk" receipts from yesterday (she's decided she's angry). THE HOURS: overlay Preston's, Impact's and Quorum's calendars and expense reports. They share one empty block, Friday 23:00–03:00, every week for decades, and the same three feeder labs on their CVs. (`clueHours`.)
4. **Four o'clock.** When both leads are done, the clock jumps to 16:00 and Impact isn't in his office. Penny: "He went down to B1 to check on a sample." The **−80 room (B1):** Impact, frozen solid inside the walk-in −80 next to a box labeled DO NOT THAW. Det. Small, hat on. "Three bodies. Still—" He doesn't finish. (`impactDead`, bodies 3; Quorum doesn't count, officially.)
5. **Impact's office (3F, stairs):** the door keypad wants his h-index, 1-1-2. Inside:
   - **Reviewer 2's report** on Nell's paper: "nueron," "utilize." Preston's writing, not the LTM's. (`clueReviewer2`.)
   - **THE RETAINER:** Nell lays her own pilot scan over Preston's Figure 2. They have the same signal dropout at the same spot: her retainer. Inside it, six beautiful hallucinated cortical layers. *"That's not his data. That's my mouth."* … *"His sub-01 had my null. Because his sub-01 is me."* (`clueRetainer`.)
   - **Impact's NRT card** (EXPIRED, age 41) and a draft letter to Ethel Bord: *"I can no longer stay silent about the Table."* (`clueCard`.)
6. **Cody.** Back in the hallway, Cody (no clipboard) is going to tell Det. Small everything. TALK, then he's gone. Morris (switch): "Pal. Something's wrong. Animal facility." Morris vents into the **animal facility (B1)**: Cody floating in the water maze, "unable to locate the hidden platform." Morris saw the end of it from the vent: Preston, earbuds glowing, and behind him a robed figure holding a remote. (`codyDead`, bodies 4.) **Morris's beat** (TALK to the maze as Morris): he remembers the maze, the electrodes, the robes. *"You were never a lab pet. You were a pilot." / "So were you, pal."* (`morrisPast`.)
7. **The chase.** Nell walks into the hallway and Preston is at the far end, flat-voiced, walking toward her. Rex steps out of the kitchen ("Preston, buddy, have you met my coffee?") and takes a face full of liquid nitrogen from the robed figure behind Preston. Rex survives: "Nine years of postdoc. I'm already frozen inside." The NRT's fog machines flood the corridor. Nell runs down the stairwell: **THE FOG** (`stairwell.js`). If caught: death, Revise & Resubmit restarts the stairwell. If she escapes: she comes out at the top of the building, at Iris's door (`escaped`).
8. **Night (Gus):** card THURSDAY NIGHT · NIGHT SHIFT GUS · STEAM TUNNELS · 01:12. The coat check is now beside the bricked door: a rack of robes (including the one with the pin from Gus's Act I photo), a reel labeled PANEL SCORES 1983, and a hand-drawn tunnel map with **B3** circled. Take the robe, the reel and the map. A canister rattles down: catch it at the hatch. INDUCTION. FRIDAY. 00:00. B3. BRING THE QUARRY. Then Gus goes up to the lab, leaves the robe on Nell's chair, and sends the map up the pneumatic tube in the hall with a note: *"Tomorrow. Bring the rat. —G."* Then he goes to run his 2 AM scan.
9. **Card:** FRIDAY · 06:40 · MRI CONTROL B1 (mode `morning`). Gus in the 3T. The scan is still running. Pinpoint pupils; NRT earbuds where the scanner headphones should be. Det. Small takes off his hat and says nothing. (bodies 5.) No joke.
10. **Iris (4F, morning).** Nell tells her the plan: walk in, save Preston, take the Archive. Iris reaches for the staple gun, then puts it down. **THE REHEARSAL** (`echo.js`, mode `rehearsal`): two drills, the phrases and then both at once; the chairs are taught by example in between. Then END OF ACT IV.

## Deaths (Act IV)
- In the −80 room, close the walk-in door behind you: *"You have been archived at −80 °C. Your samples will be fine."*
- Tell Impact you're onto Preston *before* four o'clock, in the hallway: the Table hears everything through the tube. *"You have been desk rejected."*
- In Impact's office, guess the keypad three times wrong: the office locks you in until after the 15th.
- In THE FOG: caught (handled by the minigame).
- At the coat check, put on a robe and walk through the bricked door's new gap (Gus): *"Welcome, member. Your gain has been adjusted."*

---

## Build spec

### Rooms (all export `{ id, name, pp, floor, entries, draw(G) → { back, sortables }, stand, labels }`, like `office.js`)

**library** (new) "LIBRARY 2F". Tall stacks receding (one-point), a long reading table front-center with a lamp, a microfiche/back-issues cabinet, a card catalog, a window. Hotspots: `backissues` (bound journals shelf; the metamer), `table` (reading table with two papers laid out: the Valu vs. Mick feud), `directory` (a FACULTY DIRECTORY binder on a stand), `catalog` (card catalog: red herring), `atlas` (a fat 1980s BRAIN ATLAS on a high shelf; it is the "old atlas" from the bible; in Act IV it's a look), `librarian` (an empty desk with a bell and a sign BACK AFTER TENURE), `door` (to the stairs). Entry `fromStairs`.

**impactoffice** (new) "PROF. IMPACT 3F". Corner office, too big: a desk with a laptop, airline-lounge chair, framed keynote lanyards on the wall, a window with a plane in the sky, a filing cabinet. The office's door is on the left wall. Hotspots: `desk` (the laptop; Reviewer 2's report), `figure` (a framed print of the Big Finding's Figure 2 on the wall: the retainer), `drawer` (desk drawer; NRT card + draft letter), `lanyards`, `window`, `chair`, `door`. Entry `fromStairs`. (The keypad is on the hallway side and is a story puzzle, not drawn here.)

**freezer** (new) "−80 ROOM B1". A row of upright −80 freezers with digital readouts (−80), frost, and a walk-in −80 at the back with its heavy door open, fog spilling out. When `G.flags.impactDead`: Impact inside the walk-in, frozen mid-stride, frost on his neck pillow, a box at his feet labeled DO NOT THAW, police tape; Det. Small standing beside it (hotspot `small`). Hotspots: `walkin`, `impact` (only when dead), `box`, `freezers`, `small`, `door`. Entry `fromStairs`.

**maze** (new) "ANIMAL FACILITY B1". A round water tank (the Morris water maze) drawn as a wireframe ellipse front-center, with distal cues on the walls (a star, a triangle, a square), an overhead camera, rat cages along the back wall, a vent high on the left wall. When `G.flags.codyDead`: Cody floating face down in the tank (backwards cap), the hidden platform drawn as a faint hairline square just under the surface. Hotspots: `tank`, `cody` (when dead), `cues`, `camera`, `cages`, `vent`, `door`. Entries `fromStairs`, `vent`.

**hallway** (edit, Act IV only, `G.act === 4`): `impact` figure standing by the Rising Stars wall (neck pillow, rolling bag, phone) while `!G.flags.impactMet || !G.flags.clueHours || !G.flags.clueMetamer` (he leaves when both leads are done); hotspot id `prof` (the room's existing `impact` id is the Impact Lab door). `cody` standing by the tube station while `G.flags.clueCard && !G.flags.codyLeft`. In Act IV, Dana's bin is gone; Preston isn't drawn.

**lab** (edit, Act IV): Gus at his desk by day (as in Act III, reuse). In `morning` mode Gus isn't there, and a hooded robe is draped over Nell's chair (hotspot `robe`).

**tunnels** (edit, Act IV night): a coat-check rack beside the bricked door (right of it on the left wall, or free-standing on the floor near it): hotspots `rack` (robes; one with a lit pin), `reel` (a reel-to-reel tape on a hook, PANEL SCORES 1983; drawn while `!G.flags.gotReel`), `map` (a hand-drawn map pinned to the rack, B3 circled; drawn while `!G.flags.gotMap`). The canister/hatch stay.

**mri** (edit, Act IV morning, `G.act === 4 && G.mode === "morning"`): no thermos, no police tape on the window; through the window, Gus lying on the scanner bed half in the bore, NRT earbuds lit; Det. Small standing in the control room, hat in hand (hotspot `small`); hotspot `gus` on the figure in the bore.

**iris** (edit, Act IV `morning`): same office, a second chair set opposite Iris's desk (for the rehearsal), the staple gun in Iris's hand.

### Cast and portraits
- **Prof. Maximilian Impact:** silver hair swept back, tan, airline neck pillow (ROBE), lanyard of keynote badges, rolling carry-on. Standing figure (hall), frozen variant (freezer, frost glyphs). Portrait `impact` "PROF. IMPACT".
- **Cody standing** (backwards cap, no clipboard), floating variant (maze).
- **Gus in the bore** (lying on the scanner bed), earbuds lit, pinpoint pupils.
- Portrait `adline` "PROF. ADLINE" (Nell's PI; for the Act V committee): reading glasses on her head, a grant deadline in her eyes, three pens.

### Minigames (each `fn(el, opts) → Promise<result>`, mounted with `api.mini(fn, opts, cls)`, styled in the house style)
- **metamer.js** — THE METAMER: six sentences of the Big Finding on the left; a pool of back-issue snippets (paraphrased, all fictional) on the right, each with year, authors and lab. Match each sentence to its source. When all six are matched, the authors' labs light up: the same three feeder labs. Then CHECK THE REFERENCES: two of eight references don't exist (Quorum 1979b; Valu, *J. Endless Res.*). Resolves `{ done, wrong }`.
- **hours.js** — THE MISSING HOURS: a week grid (Mon–Sun × 24h) with three translucent calendars (Preston, Impact, Quorum) you toggle on and off; expense receipts you drag onto days. The shared empty block, Friday 23:00–03:00, glows when all three overlap, and every receipt that night says "invited talk." Then their CVs side by side: click the lab names they share. Resolves `{ done }`.
- **retainer.js** — THE RETAINER: Nell's pilot scan (a sagittal-ish slice with a dropout where the retainer is) and Preston's Figure 2 (the same slice, upscaled, with six neat layers drawn inside the dropout). Drag/nudge and scale one over the other until they register; the dropouts coincide; then click the six layers inside the dropout. Resolves `{ done }`.
- **stairwell.js** — refactor the existing THE FOG page into `export function stairwell(el, { die, score }) → Promise<{ escaped, threshold }>` while keeping `stairwell.html` working.
- **echo.js** — THE ECHO, one module for the Rehearsal (Act IV) and the Induction (Act V). Rehearsal mode: Iris speaks peer-review boilerplate; answer SECONDED (S) on 2-back phrase matches; errors are staple-gun clicks (three and she starts over); then the chair drill (KNOCK (K) when Iris sits in the chair she used two turns ago); then both together. See docs/PUZZLE-NBACK.md.
