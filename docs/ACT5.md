# Act V — Friday: DECISION (design and build spec)

*Story logic: `game/js/story/act5.js`. New rooms: `defense.js`, `antechamber.js`, `chamber.js`, `plant.js`, `tubehub.js`. Minigames: `defense.js` (minigame, `js/minigames/`), `echo.js` (mode `induction`), `breakers.js`, `reels.js`, `crossref.js`. Iris becomes playable.*

**Question:** Can they be stopped?
Day and night merge. Part 1 is Laura Bow's courtroom; Part 2 is Gabriel Knight's lair, played Day-of-the-Tentacle style with three characters.

---

## Flow

### Part 1, 14:00: the Defense
1. **Card:** FRIDAY · ACT V DECISION · SEMINAR 101 · 14:00. Nell's inventory: notebook, recorder, the robe (from her chair), Gus's map (from the tube).
2. **The defense room (Seminar 101):** a committee table. Prof. Adline, Ethel Bord, Det. Small, and an empty chair with a QUORUM placard. A lectern for Nell, and a projector screen. Preston sits in the front row in a suit, waiting for his job talk (same room, next slot), earbuds dark. In the back row, where she's sat since 1961: Iris.
3. **THE DEFENSE** (`defense.js`): the committee asks five questions. For each, Nell presents evidence cards from her week, in an order that convinces. Wrong or weak cards cost credibility (a meter); the right ones raise it.
   1. "Was the study run?" (calendar, purchase orders, IRB, clipboard)
   2. "Are the data real?" (the noise ceiling, Figure 3, GPU logs, the replication)
   3. "Whose data are they?" (the retainer)
   4. "Who wrote the review?" (Reviewer 2's typos)
   5. "Why would anyone do this?" (the invitation, the missing hours, the metamer, Impact's card)

   The final score is the h-index carried into the finale.
4. **The turn:** the moment Nell names Preston, his earbuds flare. He stands up and says, flatly, *"The authors thank the reviewers for their insightful comments,"* and walks out toward the basement. The committee is convinced of the fraud, but not of a secret society: *"Extraordinary claims, Ms. Null."* Iris, from the back: "Then bring them extraordinary evidence. Tonight."
5. **Card:** FRIDAY NIGHT · 23:40 · STEAM TUNNELS. The palettes merge (night palette, all three characters). Cast: **Nell, Iris, Morris** (HUD chips; switch with Tab).

### Part 2, midnight: the Induction in B3
Three routes, three rooms, one finale.

**Nell → antechamber → chamber.**
- **antechamber:** a robe rack, portraits of members (every plaque says AGE 39), a hooded doorkeeper at the inner door. Nell must be wearing Gus's robe: USE robe on Nell, or the doorkeeper won't even look. Passphrase: the doorkeeper says "THE AUTHORS SHOULD CONSIDER…" and Nell picks the response (three options: "FURTHER RESEARCH IS NEEDED" is right; "…ADDITIONAL CONTROLS" earns a hood tilt; "…A CAREER IN INDUSTRY" is death). Age check: "Your date of birth." She shows Iris's forged card (Iris gives it at the start: her own 1962 card with the year scratched to 1987). Admitting she's 40+ is a death.
- **chamber:** the Round Table. Twelve hooded seats around the giant iron ring of the old magnet, with lamps. The Gain Controller console on a plinth, Preston in a hood beside it, earbuds glowing. Quorum at the head, hooded. **THE INDUCTION** (`echo.js`, mode `induction`: a dual 2-back over phrases and speaking seats; it escalates to 3-back when Quorum "advances the Echo"). Pass: "The motion carries." Fail: death 16 (hoods close in).

**Iris → plant.**
- **plant:** the old power plant room for the 1960s magnet. Breaker panel, a big knife switch, a dusty operator's manual on a lectern (her own 1968 margin notes). THE COLD START (`breakers.js`): the manual's printed order is wrong; her margin notes correct it. Throw the breakers in the corrected order, watching the needle. Then the charge climbs (`magnetCharged`). Then Iris walks up the service stair to the chamber.

**Morris → tubehub.**
- **Optional, hidden:** low on the left wall under the canister rack, a dim brass DEAD LETTERS box with one dusty canister in its slot (`deadletters`, OPEN IT; flag `brassGavel`, +2). Inside, wrapped in a 1974 sports section: the old table's brass gavel, taken in the Schism (SPOILS OF THE SCHISM · NOT FOR CEREMONIAL USE). It's described in text and never drawn. This sets up the coda's postscript.
- **tubehub:** every pneumatic line in the building ends here, in a ceiling of brass pipes. Beyond an arch is the Archive: shelves of reel-to-reel tapes. THE ARCHIVE (`reels.js`): pick the reels that prove the network (MEMBERSHIP ROLLS, PANEL SCORES, REVIEWER 2 REPORTS, EDITORIAL BOARDS) from decoys (HOLIDAY PARTY 1983, SHERRY INVENTORY, …), load them into canisters, and address each canister to ETHEL BORD (2F) on the brass dial, all before the magnet ramps (a timer that starts when Iris throws the last breaker). (`archiveSent`.)

**Morris, part two → crawlspace: THE DROP.** The 3T in B1 sits directly above the Round Table in B3. THE MAGNET IS ALWAYS ON. For fifty years the Table has tapped the 3T's chilled-water line to cool its ring: that is the leak Gus chased all week, running downhill to somewhere that shouldn't exist. The water has rotted the supports under the magnet's pad. After the Archive, Morris goes up a riser pipe from the tube hub into the **crawlspace** between B1 and B3: four rust-streaked steel jack posts (NW, NE, SW, SE) holding the pad, three bolts each.
- **THE SUPPORTS** (`supports.js`): Morris gnaws and kicks out bolts one at a time. Every bolt out tips the pad toward that post; a spirit-level bubble shows the tilt. Past the red line, the pad drops early (death: *"Morris has been archived under six tonnes of superconductor. So has the induction. So, unfortunately, has Nell."*). Alternate diagonal posts to keep it level. When the last bolt is out, the pad is held up by nothing but habit (`supportsOut`).

**The climax** (in the chamber, when `echoPassed && magnetCharged && supportsOut`):
1. The Board calls the induction to order with the skull gavel. Quorum unhoods: not dead, still officially 39. He makes the Hunt's final offer to its quarry. Three answers:
   - "Yes." → **INDUCTED** ending.
   - "Can I think about it?" → **DESK REJECT** ending ("Of course. Think about it on the curriculum committee.").
   - "No." → continue.
2. **Iris arrives** up the service stair: *"I told you in 1974."* She staples Quorum's robe to the Round Table.
3. Iris throws the knife switch beside the ring: *"I commissioned this magnet in 1968. I've waited a long time to turn it back on."* The ring ramps to full field. Cufflinks, hood clasps and earbuds fly to the ring; the Gain Controller is ripped off its console; Preston's earbuds go, and he's free. The LTM drives beside the Archive are wiped.
4. **The drop.** Two magnets, one above the other, and nothing holding the top one up. The ceiling groans, cracks spread, dust and water rain onto the Table ((( ))). Nell grabs Preston; Iris is already at the door. The 3T comes through the ceiling and lands on the Round Table: the Gain Controller crushed, the Table split, the gavel gone. Gus's scanner ends it. (*"His 2:30 slot."*)
5. Quorum, wearing fifty years of gold awards, is pulled off his feet: *"Fifty years of honors. All of them ferromagnetic."* He rises, at last, to the top, and straight into the bore of the 3T. He's finally been scanned.
6. **Endings:** `archiveSent` → **ACCEPTED** (the best ending, with THE CROSS-REFERENCE epilogue); otherwise **MAJOR REVISIONS**. Then the coda.

### Epilogue: THE CROSS-REFERENCE (Accepted only, `crossref.js`)
Ethel's office, the reels transcribed. Membership rolls in one column, fifty years of grant panels and editorial boards in the other. Draw lines between the same names. The lines form a network so dense it looks like a brain. That's the proof Iris described.

## Deaths (Act V)
- Doorkeeper: answer "…A CAREER IN INDUSTRY." *"Your application has been forwarded to industry."*
- Age check: admit you're over forty: death 17.
- Fail the Echo: death 16.
- Iris: throw the knife switch before the breakers are set: *"The 1968 supply comes on at once. So does every light in Boston. Briefly."*
- Morris: ride a canister yourself (death 19 variant): *"Morris has been delivered to the Registrar."*
- Stand near the ring with metal when the switch is thrown (Nell, if she picked up the gavel): death 18.

---

## Build spec

### Engine
- Iris becomes a playable character in Act V: `FIGURE.iris` (walking figure, slow, with the staple gun) and `CHIP.iris = ["IRIS", "fV"]`.
- In Act V, `G.mode` is `"day"` for Part 1 and `"night"` for Part 2.

### Rooms
**defense** (new) "SEMINAR 101 · DEFENSE". It reuses the look of Room 101 (one-point, rows of chair backs): a committee table front-left facing the room, with Adline, Ethel, Small and an empty chair with a QUORUM placard; Nell's lectern front-right; a projector screen on the back wall reading NULL RESULTS, A DEFENSE; Preston in the front row (earbuds, `#preston` blank parts); Iris in the back row (head and staple gun only). Hotspots: `committee`, `adline`, `ethel`, `small`, `quorumchair`, `lectern` (USE: BEGIN THE DEFENSE), `screen`, `preston`, `iris`, `door`. Entry `start`. After `G.flags.defenseDone`, Preston's seat is empty.

**antechamber** (new) "B3 · ANTECHAMBER". Night. A low vaulted room (one-point), a rack of robes (left), a wall of member portraits with plaques AGE 39 (back), the inner door with the insignia (back right), a hooded doorkeeper beside it, a lectern with a guest book, and the tunnel doorway (left, the way in). Hotspots: `rack`, `portraits`, `book`, `doorkeeper`, `inner` (the inner door; go to the chamber), `tunnel` (go back). Entries `fromTunnels`, `fromChamber`.

**chamber** (new) "B3 · THE ROUND TABLE". The centerpiece: the giant iron ring of the 1960s magnet seen in perspective (an ellipse ring with wireframe coil windings), a round table inside it, twelve hooded seats around it (simple hoods, each seat with a small lamp that can be lit: pose groups `seat0`…`seat11`, each `<g class="pz" data-g="seatN" data-i="1">` lit and `data-i="0"` unlit), Quorum at the head (hood; unhooded variant when `G.flags.unhooded`, gold medals), the Gain Controller console on a plinth (dial, green bar), Preston hooded beside it (earbuds lit `((( )))`), the skull gavel on the table, the knife switch on the wall by the service stair (right), the service stair (right). When `G.flags.creak`: cracks across the ceiling over the table, dust and water falling (pose groups), the bulge of something enormous above, `((( )))`. When `G.flags.crash`: the 3T (a huge scanner donut, its bore and bed) lies smashed into the Round Table, a broken hole in the ceiling above with bent rebar, rubble, the console crushed, hoods scattered, and Quorum's feet sticking out of the bore; Morris peeks down from the hole. When `G.flags.finale`: draw the ring "on": every small metal thing flying in toward the ring as speed dashes. Hotspots: `table` (TAKE YOUR SEAT), `quorum`, `console`, `preston`, `gavel`, `switch`, `stair`, `door` (back to the antechamber). Entries `fromAntechamber`, `fromStair`.

**plant** (new) "B3 · POWER PLANT". The old magnet supply: tall cabinets with analog meters (needles), a breaker panel with six big breakers labeled A–F (drawn up/down from `G.flags.brk` string e.g. "CADBEF"), a giant knife switch, conduit, the manual on a lectern, a service stair up (to the chamber). Hotspots: `panel`, `manual`, `meters`, `knife`, `stair`, `tunnel`. Entries `fromTunnels`, `fromStair`.

**crawlspace** (new) "UNDER THE 3T". A low space between B1 and B3: steel I-beams, the underside of the magnet's concrete pad overhead with a grating through which the bottom of the 3T is visible (a cryostat curve, a sticker THE MAGNET IS ALWAYS ON), four rust-streaked jack posts (NW, NE, SW, SE) with three bolts each, drawn from `G.flags.bolts` (a 4-char string of bolts remaining per post, e.g. "3321"; default "3333"), drips in pose group `drip`, the chilled-water line with a crude tap and a hose running down through the floor (insignia tag on the tap), and the riser pipe back down to the tube hub. Hotspots: `posts`, `grating`, `chiller`, `riser`. Entry `fromHub`. When `G.flags.supportsOut`: the pad visibly sagging, cracks, ((( ))).

**tubehub** (new) "B3 · TUBE HUB". A vaulted ceiling of brass tubes converging on a central dial (a big brass destination dial), canisters in a rack, an arch through to the Archive shelves of reels, the LTM drive rack (lights blinking) beside the arch. Hotspots: `dial`, `canisters`, `archive`, `ltm`, `pipe` (the pipe Morris came from), `arch`, `riser` (a vertical pipe going up, toward the 3T; labelled UP: 3T). Entries `fromPipes`, `fromRiser`.

### Cast and portraits
- **Iris walking figure** (the playable one): 88, slow, cardigan ROBE, hair INK bun, glasses BRASS, staple gun SIGNAL in hand. Same frame and poses as the other walkers (`ap0/ap1/ap2`).
- **Quorum unhooded standing** at the head of the table, gold medals in BRASS, and his robe.
- **Hooded member seated** (for the twelve seats; simple) and **the doorkeeper** (standing hood).
- **Preston hooded** with lit earbuds.
- **Committee seated:** Adline, Ethel (reuse), Small (seated variant), plus the empty QUORUM chair.
- Portraits: `adline` "PROF. ADLINE", `hood` "A HOODED MEMBER" (a hood with a black opening, an insignia pin lit), `quorumUnhooded` (reuse `quorum` with a hood pushed back), `irisPlay` is just `irisNamed`.

### Minigames
- **defense.js:** the Laura Bow interrogation. Five questions, a hand of evidence cards (only the ones the player actually has; pass `{ evidence: [ids] }`), a credibility meter, committee reactions. Resolves `{ credibility, order }`.
- **echo.js** (mode `induction`): a dual 2-back over phrases (SAME WORDS, key W) and seats (SAME SEAT, key S) on the chamber's twelve lamps; 3-back after three errors in a row (for six turns); suspicion fades after three clean answers; three hoods turned = fail. Resolves `{ passed, dprime }`.
- **breakers.js:** the manual page (printed steps plus handwritten margin notes that correct them) and the six breakers; throwing one out of order sparks and resets; a needle climbs. Resolves `{ done }`.
- **reels.js:** pick the four damning reels from twelve, address each canister on the brass dial to ETHEL BORD, and send; there's a countdown. Resolves `{ sent: n }`.
- **supports.js:** THE SUPPORTS (see the crawlspace, above). `supports(el, { die, score })` → `{ done, tries }`.
- **crossref.js:** two columns of names; draw lines; the network emerges. Resolves `{ done }`.
