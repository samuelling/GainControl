# GAIN CONTROL — working notes for Claude

A Sierra-style point-and-click comedy murder mystery set in a university neuroscience department. Story and design live in `docs/STORY.md`. Read it before writing any scene, dialogue or puzzle.

## The visual language is locked

Every scene, character, object, portrait and UI element follows the line/pose/number language. The canonical references are:

- `prototype/room-101/` — a playable scene: room, walking, hotspots, HUD, portraits, day/night. **Match this.**
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
- A character isn't named on screen until Ned has learned who they are (Iris is "THE OLD WOMAN" in Act I).

### Science on screen
Real neuroscience, drawn correctly and simply. Laminar fMRI is shown as a close-up of folded cortex: the pial surface, six layer lines following the gyrus/sulcus, the white-matter boundary, and a depth probe. Never as concentric rings.

## Repo conventions
- Plain HTML, CSS and JS; no build step. Each prototype is a single self-contained `index.html`.
- Commit and push work as it's finished.
