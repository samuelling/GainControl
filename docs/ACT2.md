# Act II — Tuesday: UNDER REVIEW (playable: design and build spec)

*Built and playable from the title screen. Story logic: `game/js/story/act2.js`. Rooms: `mri.js`, `office.js`, `ethics.js`, `impact.js`, plus additions to `lab.js` and `hallway.js`.*

**Question:** Who's killing people?
**Day (Nell + Morris, switchable):** the paper trail. Four clues, any order. **Night (Gus):** Preston's computer and the robes. **Morning:** Tess is dead, the murder weapon is Nell's thermos, and Gus believes her.

This file is both the design and the contract between the art (rooms, figures, portraits) and the engine/story code. Ids, flags and stand points here are the interface.

---

## Flow

1. **Card:** TUESDAY · ACT II UNDER REVIEW · ADLINE LAB 114 · 09:04. Nell starts in the lab. Her Act I inventory carries over (recorder with Preston's memo, notebook, thermos).
2. **Morris joins.** Talking to the drawer: *"Pal. You need someone who fits through walls."* From now on the HUD shows two character chips, **NELL** and **MORRIS**; click the other chip to switch (Day of the Tentacle). Each keeps their own room and position.
3. **Four clues, any order** (below). Each clue is a notebook line and points.
4. When all four are in: Nell sums it up, then card **TUESDAY NIGHT · NIGHT SHIFT GUS · HALLWAY 1F 01:58**.
5. **Night (Gus):** the keypad, Preston's computer (FOG NEURO), PRINT, the robed figures, the gradient fault.
6. Card **WEDNESDAY · 08:52 · MRI CONTROL B1**. Tess is dead. Det. Sgt. Small. The thermos. Gus: "Wasn't you. Saw robes." **END OF ACT II.**

## The four day clues

| # | Clue | Where | How |
|---|---|---|---|
| 2 | **No scanner bookings** | MRI control room (B1) | Tess guards the booking calendar. She makes Nell put metal in the locker (the **thermos** goes in: that's the murder weapon). Switch to **Morris**: vent from the lab to the MRI control room, CHEW the wires behind the console. The HELIUM LOW alarm sends Tess running into the magnet room. Switch back to Nell, walk down, READ the calendar: Preston never booked a single session. Tess comes back and, instead of throwing Nell out, **turns** (convo `tessTurn`): she's seen Preston four times in three years, her 3T "doesn't do layers," she told the Chair at faculty lunch, and tonight she'll pull the console's raw logs for Ethel, alone. This is why she dies. |
| 3 | **No coil purchased** | Main office (1F) | Penny: purchase orders need **Form PO-7 signed by a PI**. Prof. Adline signs anything slid under her door while she's in grant panic. Signed PO-7 to Penny: no 7T, no laminar coil, nothing, ever. ("Nobody ordered a coil." Record it.) |
| 4 | **Backdated IRB** | Research Integrity (2F) | Ethel: protocols are public, find it yourself. The Binder of Binders (index) says Valu's protocol is filed under "RISING STARS (SPECIAL)", shelf R, binder 12: the high red shelf. Move the step stool, pull R-12. Approved June 3. The paper says data were collected January through March. Pulling a binder at random is a death (binder avalanche). |
| 5 | **Fake participants** | MRI control room (Cody) | Cody, the RA, waits with the sign-in clipboard. He won't hand it over. Play him Preston's memo ("I ran every subject myself") and he wobbles. He wants the credit slip Preston promised in March. The main office printer has been jammed since August: **Morris** crawls in and frees it, then **Nell** prints a slip, pre-signed "P. VALU" in a font. Give it to Cody: the clipboard lists H. Molaison, P. Gage, S.M. and Totally Real Person. |

**Seeds:** Penny: everyone important is "unreachable on Friday nights. Every Friday. For decades." Tess: something draws power from the old B-level circuit at midnight on Fridays. Morris near the magnet: "Pal, this thing is pulling on my head." (His implant.)

## Night (Gus)

- **The keypad (Impact Lab 116):** at night four keys are worn shiny: 1, 4, 7, 9. Six digits. Gus: *"Four keys, six digits. That's 1,560 possibilities. Preston's vanity makes it one."* Preston's Rising Stars photo now shows CITATIONS 147,794. The code is 147794 (entered on a keypad close-up).
- **Inside:** Preston's PC is logged in, running FOG NEURO (a small playable version: GENERATE, SOURCES, PRINT). A second monitor shows the Gain Controller status panel: clicking it is a death. PRINT gives Gus the printout.
- **The robes:** back in the hallway, two robed figures cross from the stairwell toward the basement. Gus follows to the stairs; his phone buzzes (GRADIENT FAULT, he's paying by the hour). By the time he's back, they're gone.

## Morning
MRI control room, police tape on the magnet-room window. Through it, the thermos labeled NELL is stuck to the face of the magnet. Det. Sgt. Small is there, and so is Gus, still in yesterday's cardigan. A short scene: Small asks about the thermos, Nell has no answer, Gus steps in. END OF ACT II card.

---

## Build spec (the interface)

### Engine (main.js / story)
- `G.act` (1 or 2). `G.char` is "nell", "gus" or "morris". Hotspot responses are looked up by **key** = `"morris"` when Morris is active, otherwise `G.mode` ("day", "night" or "morning").
- `G.chars = { nell: {room,x,y,dir}, morris: {room,x,y,dir} }`. Switching stores the active position and loads the other character's room. An idle character in the same room is drawn by the engine as an extra sortable.
- `HS[room][id][key].go` may be a string (`"room@entry"`) or an object (`{ down: "mri@fromStairs", up: "ethics@fromStairs" }`), and each key becomes a chooser button labeled from `labels[key][id][goKey]`.
- `G.mode === "morning"` uses the day palette.

### Rooms (art), all export `{ id, name, pp, floor, entries, draw(G) → { back, sortables }, stand, labels }`
Room drawings read only these flags: `G.act`, `G.mode`, `G.char`, `G.flags.*` listed per room. Act I-only things (Brett, the sticky note, the Act I Morris rules) must be gated on `G.act === 1`.

**lab** (edit): add `vent` (low wall grille near the desks) and `gusdesk` (the other desk becomes Gus's: closed laptop, headphones, a mug, a sticky note). Drawer shows Morris (morrisPeek) when `G.act === 1 ? (existing rule) : G.flags.morrisInDrawer`. Brett and the sticky note only in Act I. Add entry `start: [262, 272, 1]`. Stand points for `vent`, `gusdesk`.

**hall** (edit): `vent` hotspot (low grille). Stairs keep id `stairs`. The main office door keeps id `office`. Preston's Rising Stars photo gets a line under it, CITATIONS 147,794, when `G.act >= 2`. At night in Act II, the Impact keypad shows four lit keys (1 4 7 9). Entries add `fromStairs` (by the stairwell), `fromOffice` (by the office door), `fromImpact` (by 116). Labels: stairs day `{ down: "GO DOWN", up: "GO UP" }`.

**mri** (new) "MRI CONTROL B1": one-point control room. Back wall: a big window into the magnet room showing the 3T bore and bed. Console desk with screens. Hotspots:
`window`, `tess` (at console; drawn when `!G.flags.heliumAlarm && G.mode !== "morning"`), `tessfar` (Tess seen through the window fussing at the magnet, pose group `wave`; drawn when `G.flags.heliumAlarm`), `calendar` (scanner booking calendar on the wall by the console), `locker` (metal locker, ZONE III sign; when `G.flags.thermosLocked` a NELL thermos is visible through its vents, except in morning), `sign` (THE MAGNET IS ALWAYS ON), `console`, `wires` (bundle behind the console at floor level, for Morris), `vent`, `cody` (seated in a waiting chair near the door; clipboard on his lap unless `G.flags.gotClipboard`; not drawn in morning), `door` (to the stairs), `magnetdoor` (red-signed door into the magnet room). Helium alarm: a flashing HELIUM LOW chip with `((( )))`, pose group `alarm`, when `G.flags.heliumAlarm`. **Morning** (`G.mode === "morning"`): police tape across the window, the thermos (with NELL) stuck to the face of the bore, `small` (Det. Sgt. Small standing) and `gus` (Gus standing) hotspots, no Tess, no Cody. Entries `fromStairs`, `morning`. Labels: `locker {use:"PUT METAL IN"}`, `calendar {use:"READ"}`, morris `wires {use:"CHEW"}`, morris `vent {use:"CLIMB IN"}`.

**office** (new) "MAIN OFFICE 1F": counter, Penny at her desk behind it. Hotspots: `penny`, `cabinet` (purchase-order filing cabinet), `forms` (form rack), `printer` (jammed: a red JAM chip and `((( )))` in pose group `jam`, unless `G.flags.printerFixed`), `mailboxes` (Preston's slot overflowing), `sign` (BACK IN 5 MIN, on the counter, while Penny is plainly in), `vent`, `door`. Entry `fromHall`. Labels: `printer {use:"PRINT"}` (day), morris `printer {use:"CRAWL IN"}`, `cabinet {use:"OPEN"}`.

**ethics** (new) "RESEARCH INTEGRITY 2F": a wall of binders. Hotspots: `ethel` (at desk), `index` (the Binder of Binders on a stand), `shelfA`, `shelfB`, `shelfC` (low shelves), `shelfR` (high red shelf at the top), `stool` (step stool; it's under shelf R when `G.flags.stoolPlaced`, otherwise by the desk), `window`, `door`. Entry `fromStairs`. Labels: shelves `{use:"PULL A BINDER"}`, `shelfR {use:"PULL R-12"}`, `stool {use:"MOVE IT"}`, `index {use:"LOOK UP VALU"}`.

**impact** (new, night) "IMPACT LAB 116": sleek, brushed steel, no window, server lights. Hotspots: `pc` (Preston's PC, FOG NEURO splash on screen), `gainpanel` (second monitor: Gain Controller status, a dial and a green bar), `printer` (sleek), `oat` (a carton of adaptogenic oat synergy), `poster` (SYNERGY motivational poster), `door`. Entry `fromHall`.

### Figures and portraits
- `morrisFigure()`: walking rat, same frame as the other figures (feet at y 187, centered on x 160, facing right), about 44 units long, poses `ap0/ap1/ap2`. Body INK, ears/tail/nose SKIN, implant ON (a lit dot on the head).
- `robedFigure()`: hooded NRT member walking (poses `ap0/ap1/ap2`), robe ROBE, lit insignia pin SIGNAL, no face (a black hood opening).
- `smallFigure()`: Det. Sgt. Small standing (police, notebook). In-room sitters for Tess, Penny, Ethel, Cody as functions taking `(x, y, k)`.
- Portraits: `tess` "DR. TESS LA", `penny` "PENNY LEDGER", `ethel` "ETHEL BORD", `cody` "CODY (RA)", `small` "DET. SGT. SMALL", each with eyes-open/closed and mouth-a/b, in the house style. Pick color keys that don't collide with the main cast, and add them to STORY.md's color keys.
