# Act I — Monday: SUBMISSION (playable design)

The first playable slice. It teaches walking, the chooser, inventory and USE ON, talking portraits, dialogue choices, the voice memo recorder, a death with Revise & Resubmit, and the day-to-night handoff. It also plants the Act I seeds from `STORY.md`.

## Rooms (first floor, Fechner Hall)

| Room | Exits | What's here (day) | What's here (night) |
|---|---|---|---|
| **Seminar Room 101** | door → Hallway | Preston at the lectern, the old woman (Iris), Quorum, nodding faculty, the 7T slide, pizza, pneumatic tube, Morris in the ceiling | the forgotten robe (with a lit pin), a screen ghost, canisters rattling |
| **Hallway** | 101 · Adline Lab 111 · (stairs, locked) · (main office, closed) · (Impact Lab 116, locked) | Rising Stars wall (Preston's photo is the biggest), bulletin board (the Friday 2 PM collision), water fountain, tube station, Penny's yellowed BACK IN 5 MIN sign | lights off, a strip of light and a hum under the Impact Lab door, Preston's photo smiling wider |
| **Adline Lab 111** | door → Hallway | Nell's desk (monitor, drawer), whiteboard of null results, Prof. Adline's door ("after the 15th"), the dark-adapted psychophysics booth, Brett waiting for office hours | empty desks, a monitor glow, Morris asleep in the drawer |

## Day goals (Nell)

To end the day, Nell needs three things, in any order:

1. **RECORDED:** Talk to Preston at journal club. His "I ran every subject myself" goes on the voice memo recorder.
2. **OFFICE HOURS:** Help Brett in the lab. A Freddy Pharkas-style interlude: Brett asks what a Tesla is, and Nell picks the answer. The right answer teaches the 7T/3T idea and earns points; wrong answers get jokes and another try.
3. **FED MORRIS:** Morris, in the seminar ceiling, wants pepperoni "back at the drawer, I don't eat in public." Take a slice of pizza, go to the lab, and USE the slice ON the drawer.

When all three are done and Nell is in the lab, **a sticky note appears on her monitor**. LOOK at it to get a close-up: a column of brain coordinates. (Decoding them is Tuesday's first lesson.) Then the day ends: the MONDAY NIGHT card plays and the game switches to Gus.

### Dependency chart (day)

```
journal club ──► TALK Preston ──────────────► [RECORDED] ─────────┐
       │                                                          │
       ├──► LOOK slide (7T vs 3T) ··· (points, and it informs Brett's answer)
       │                                                          │
       ├──► TAKE SLICE (pizza) ──► inventory: slice ──┐           │
       │                                              ▼           │
       └──► TALK Morris (ceiling) ──► Morris moves ──► USE slice ON drawer ──► [FED MORRIS]
                                      to the lab drawer           │
lab ──► TALK Brett ──► choice: what's a Tesla? ──► [OFFICE HOURS] ┤
                                                                  ▼
                                         sticky note on monitor ──► LOOK note ──► MONDAY NIGHT
```

### Optional (points and seeds)
- LOOK at the slide, the Rising Stars wall and the bulletin board (Nell's defense and Preston's job talk: same room, same Friday, same 2 PM).
- Talk to the old woman ("ask yourself who reviewed yours"). USE the recorder ON her once it has Preston on it.
- PLAY the recorder.
- Prof. Adline through her door ("after the 15th").
- **Death:** USE (SIT IN) the dark-adapted booth: "You fall asleep. You wake up a 9th-year." Revise & Resubmit rewinds to just before.

## Night goals (Gus)

Gus Ian, Nell's labmate, arrives at 02:13 for his 2 AM scan (the 3T is cheapest after 11pm). He starts in the dark hallway with his badge, phone and an energy drink. To end the act:

1. **ROBE PHOTOGRAPHED:** In Seminar Room 101, PHOTOGRAPH the robe left on a chair. The small round pin is lit, and the laundry tag inside the collar reads No. 0412, from a dry cleaner that closed in 1979.
2. **LISTENED:** USE (LISTEN) on any tube station. The canisters are going down, past the basement.

Optional: the light and the hum under the Impact Lab door (his badge doesn't open it); Morris (only squeaks for Gus); Preston's photo in the dark; Nell's whiteboard ("p = .48. Rough week.").

Gus's night verbs come from being a grad student, not staff: a badge that opens what grad students can open, a phone camera, and the habit of noticing data that's too clean.

When both are done: **END OF ACT I** card, then "TUESDAY: UNDER REVIEW."

## Score (h-index) available in Act I: about 16
slide 1 · tube 1 · pizza 1 · Preston 2 · old woman 2 · Morris 1 · Morris fed 2 · Brett right answer 3 · Rising Stars 1 · bulletin board 1 · note 1 · robe photo 2 · tube (night) 1 · Impact door (night) 1

## Engine features this act exercises
Rooms with exits and entry points · flags · inventory add/remove · the chooser with per-room labels · USE ON · conversations with branching **choices** · narrator boxes · readout close-ups (the sticky note) · the death screen with **Revise & Resubmit** · title, act and end cards · day/night state.
