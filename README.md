# GAIN CONTROL

A point-and-click comedy murder mystery set in a university neuroscience department. Built on Sierra structure, with LucasArts humor, Gabriel Knight investigation, and thin line art on black in the spirit of the OP-1, Pocket Operators, Game & Watch and Q*bert.

A grad student suspects the department's rising star faked his breakthrough paper. Then people start dying.

- **Play the whole game (Acts I–V):** https://samuelling.github.io/GainControl/ (source in [game/](game/index.html)). The title screen lets you start at any unlocked act. Serve the folder over HTTP (the game uses ES modules), e.g. `cd game && python3 -m http.server`, then open http://localhost:8000.
- **On a phone:** play sideways. FULLSCREEN (title screen, HUD, or the F key) hides the browser where the browser allows it. iPhone Safari never does, so there it explains how to use Share → Add to Home Screen. Launched from that icon, the game runs edge to edge with no address bar. M mutes.
- **The Script Room (behind the scenes):** https://samuelling.github.io/GainControl/game/script.html. Read and edit every line of dialogue, hotspot and item, and see each act's logic as a graph of who sets which flag and what it unlocks. Edits are saved in your browser and the game uses them right away. EXPORT saves them as `overrides.json`; commit that file to `game/` and the edits become canon.
- **Test scene, THE REPLICATION (a playable GLM):** https://samuelling.github.io/GainControl/game/glm.html. Design: [docs/PUZZLE-GLM.md](docs/PUZZLE-GLM.md).
- **Test scene, THE FOG (stairwell):** https://samuelling.github.io/GainControl/game/stairwell.html, a 2AFC contrast staircase down a real stairwell. Design: [docs/PUZZLE-FOG.md](docs/PUZZLE-FOG.md).
- Story bible: [docs/STORY.md](docs/STORY.md) · Act designs: [ACT1](docs/ACT1.md), [ACT2](docs/ACT2.md), [ACT3](docs/ACT3.md), [ACT4](docs/ACT4.md), [ACT5](docs/ACT5.md)
- Style reference scene: [prototype/room-101](prototype/room-101/index.html)
- Style sheet: [prototype/style-sheet](prototype/style-sheet/index.html)
