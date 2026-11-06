# GAIN CONTROL — working notes for Claude

A Sierra-style point-and-click comedy murder mystery set in a university neuroscience department. Story and design live in `docs/STORY.md`. Read it before writing any scene, dialogue or puzzle.

## The visual language is locked

Every scene, character, object, portrait and UI element follows the line/pose/number language. The canonical references are:

- `game/` — **the game.** A multi-room engine running Acts I and II. New rooms, items and dialogue go here (see below).
- `prototype/room-101/` — the original single-file scene: room, walking, hotspots, HUD, portraits, day/night. **Match this.**
- `prototype/style-sheet/` — Style Sheet 02: characters, objects, isometric and perspective tiles, the stroke alphabet, palette.
- `docs/STORY.md` → "Visual direction" — the eight rules, palette and character color keys.

Don't introduce other looks: no gradients, glows on everything, filled shapes, textures, raster art, or generic UI fonts in the scene.

### Rules (short form)
1. **Two line weights**, drawn at native resolution and scaled up: a 1.5 line for objects and a 0.75 hairline (`.hl`) for grids, guides and interior detail. Room scenes use a 640×360 native canvas, and tiles are 320×200.
2. **Almost no fill.** Closed shapes are filled black (`.k`) so lines overlap cleanly. Color fills only for things that are *on* (LEDs, pupils, the NRT insignia, Morris's implant, a lit cube) and for solid **status chips** with black lettering.
3. **Color = material.** Use stroke classes `sW sR sB sG sK sA sV sN sD sM` (and `sX` for the always-red EXIT), never hard-coded hex, so day/night palettes switch through CSS variables.
4. **Open contours.** Faces are a jaw, a hairline and a few marks. Skin is a pink line, never a filled face.
5. **Poses, not tweens** (Game & Watch / Pocket Operator). Animation swaps pre-drawn poses in place. Characters walk in discrete steps (one pose change and position step every ~120 ms). Thrown or falling objects jump between fixed positions.
6. **Motion as drawn glyphs:** `((( )))` vibration arcs, speed dashes, sparks, drips.
7. **3D as wireframe:** exploded isometric diagrams for clue close-ups, isometric cubes for maps, perspective grids for corridors.
8. **Type:** labels, numbers, signs and HUD readouts use the condensed rounded **stroke alphabet** (`seg()` / `chip()` / `readout()` in the prototypes): big thin numbers with tiny labels above. **Dialogue and narration** use *Saira Condensed*, all caps, large (about 3cqw in conversations and 2.5cqw in narration boxes), with each line colored in its **speaker's color** and a solid speaker chip.

### Proportions and staging
- One-point perspective rooms, stage-like and front-facing, with a hairline perspective grid on the floor.
- Walking characters scale by depth (`kAtY(y) × 0.72` in Room 101). Everything else in the room is sized against them: a chair back is about half a standing figure's height, and a seated head matches a standing head. Preston at the lectern uses the same scale for his depth.
- **Unimportant things stay simple.** Anonymous audience members are just chair backs. Only story-relevant people show a head (and a single identifying mark).
- Atmosphere is drawn in STRUCT/DIM; hotspots get full color; a few colored objects are red herrings.

### Portraits (Gabriel Knight)
- Portraits are the same drawings cropped and enlarged, with portrait-only stroke widths so lines keep the same apparent weight.
- Every portrait needs `eyes-open` / `eyes-closed` and `mouth-a` / `mouth-b` poses. Preston also needs `normal-only` / `blank-only` (the Gain Controller blank-out: pinpoint pupils, earbuds lit ON-green with `((( )))`, faint scanlines).
- A character isn't named on screen until Nell has learned who they are (Iris is "THE OLD WOMAN" in Act I).

### Interaction: the chooser (no verb bar)
- **Click the floor: walk.** There is no verb bar and no verb cycling.
- **Click a hotspot:** a reticle lands on the spot, the object's name appears as a solid INK chip, and an arc of round glyph buttons fans out (above the click, or below near the top of the screen). It pops in as two poses.
- **Only the verbs that apply appear**, with object-specific labels (pizza: LOOK / TAKE SLICE; robe: LOOK / PHOTOGRAPH; Preston: LOOK / TALK / SHAKE HAND). Define them per hotspot and per shift (`HS[id][mode]` plus `LABELS[mode][id]`).
- **Inventory items** use the same chooser: LOOK, USE ON (the cursor then carries the item; the HUD shows a USE X ON chip; responses live in `WITH[hotspot][item]`), plus item-specific verbs like PLAY on the recorder once it has caught something.
- Look happens from where you stand; talk and use walk to the hotspot's stand point first. Right-click or Esc cancels.

### Science on screen
Real neuroscience, drawn correctly and simply. Laminar fMRI is shown as a close-up of folded cortex: the pial surface, six layer lines following the gyrus/sulcus, the white-matter boundary, and a depth probe. Never as concentric rings.

## The game (`game/`)
- `index.html` holds the CSS (palettes, pose classes, dialogue styles) and loads `js/main.js` as an ES module. No build step, but it must be served over HTTP.
- `js/gfx.js`: stroke alphabet (`seg`, `chip`), glyph icons, `perspective()`, `shell()`, `sideDoor()`. `js/figures.js`: walking figures and props. `js/portraits.js`: talking portraits.
- `js/rooms/<room>.js`: each room exports `{ id, name, pp, floor, entries, draw(G) → { back, sortables }, stand, labels }`. It draws itself from state (`G.mode`, `G.flags`), marks hotspots with `data-hs`, and puts depth-sorted things in `sortables`.
- `js/story/actN.js`: one file per act, holding all its words and logic: `HS[room][id][key]` (look/talk/use/go plus score), `WITH["room.id"][item]`, `CONVOS` (lines plus `choice` blocks), `check(api)` for triggers, and `start(api)`, `TITLE`, `END`. `ITEMS` lives in act1.js, and later acts add to it. A response is a string, `"WHO|line"`, `"c:convo"`, or `fn(api)` (which may be async).
- **Hotspot key:** `"morris"` when Morris is the active character, otherwise `G.mode` (`"day"`, `"night"` or `"morning"`). `go` may be `"room@entry"`, an object of several exits (`{ down: …, up: … }`, one chooser button each), a refusal string, or a function. The entry `"vent"` lands on the room's `stand.vent`.
- **Characters:** `G.char` is the active one; `G.cast` lists who can be switched to (HUD name chips or Tab); `G.chars` keeps the inactive ones' rooms and positions, and an idle character in the same room is drawn automatically. Each character has its own inventory (`G.inv.nell`, `.gus`, `.morris`).
- `js/minigames/`: `keypad.js` (the Impact Lab keypad), `fogneuro.js` (Preston's paper mill, an HTML overlay in `#panel`), `stairwell.js` (THE FOG test scene, its own page).
- `js/main.js`: the engine. State, chooser, stepped walking, character switching, conversations, cards, clue readouts, choice menus, death and Revise & Resubmit (a snapshot before every action), act transitions (`startAct`, `endAct`, a title-screen chapter select, progress in localStorage), and ambient pose clocks. `window.GC` is exposed for scripted tests. Test hashes: `#night` (Act I night), `#act2`, `#act2night`, `#act3`, `#act3night`, `#act4`, `#act4night`, `#act4morning`, `#act5`, `#act5night`.
- `api.mini(fn, opts, cls)` runs a full-screen minigame `fn(el, opts) → Promise` in `#panel` (`cls` adds layout classes such as `glmwrap` or `nodmode`). `api.pose(group, i)` sets a pose group by hand. `check()` may return any response (a string, `"WHO|line"` or `"c:convo"`).
- `js/minigames/`: also `grim.js` (Table 1's impossible means), `overlay.js` (Figure 3b/3d), `nod.js` (THE NOD, a 2-back over faculty motions), `glm.js` (THE REPLICATION). `js/cast/` holds the later acts' characters and portraits (act3a/b, act4/act4b, act5a/b). Acts IV–V add `metamer.js`, `hours.js`, `retainer.js`, `stairwell.js` (THE FOG, now callable), `echo.js` (THE REHEARSAL / THE INDUCTION), `defense.js`, `breakers.js`, `reels.js`, `supports.js`, `crossref.js`, and the coda (`story/coda.js`). Iris is playable in Act V (`G.cast` nell, iris, morris). Act V's `END` is filled in by the ending reached (accepted, major, inducted, deskreject).
- `preview.html?room=kitchen&mode=day&act=3&flags=a,b&hs=1` draws one room from flags, with hit areas and stand points marked (for art work).

## Repo conventions
- Plain HTML, CSS and JS; no build step. Prototypes are single self-contained `index.html` files; the game is `game/` with ES modules.
- Commit and push work as it's finished.
