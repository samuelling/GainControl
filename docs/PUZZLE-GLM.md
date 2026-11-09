# Puzzle: THE REPLICATION (a playable GLM)

**Act III — Wednesday: MAJOR REVISIONS.** Part of "The fraud, proven." Nell and her labmate Gus try to reproduce the Big Finding at her desk, using Preston's own stimulus log and the raw data Preston deposited with the journal. It is a real fMRI analysis: define the events, build the model, fit it by hand, run the contrast. Done correctly, it breaks the paper.

> The game teaches each idea right before it asks you to use it (the Freddy Pharkas rule). A non-scientist can solve every step. A neuroscientist should nod along, then laugh at the forking-paths death.

---

## Why it's in the story

- **Preston's claim** (the slide from Act I): top-down attention boosts the BOLD response **most in V1's feedback layers**, the outermost (1, 2/3) and innermost (5/6), and least in layer 4, the feedforward input layer that carries the stimulus drive: a U-shaped depth profile. The hypothesis is reasonable (feedback terminates outside layer 4); what is fake is his data, which could never resolve it at 3T. It's a "textbook" double-bump depth profile with tiny error bars, at "7T."
- **What the data really show** (revised Nov 2026): a clean visual response, and a **real attention effect**: ATTEND is about 30% above IGNORE across the whole time series, as the field has known since the late 1990s. What the data cannot show is *where in depth* it lives: at 3T one voxel spans the whole cortex, so the effect is the same number in all six "layers". The null is a **laminar** null. And at 3T there are no layers to look at in the first place.
- **The knife twist:** the null is Nell's. The deposited "sub-01" is Nell's pilot scan. Her honest paper reported this null; Reviewer 2 rejected it for being null, then Preston upscaled the same data into a positive laminar result. Nell doesn't realize sub-01 is herself until the lasagna reveal in Act IV, so this puzzle *plants* that reveal:
  > **Act III, after the fit:** GUS: "It's not a small effect. It's no effect." / MORRIS: "So the fancy layers?" / NELL: "Painted on."
  > **Act IV, at the lasagna:** "His sub-01 had my null. Because his sub-01 is me."
- **The methods section doesn't match the log.** The paper (written by the LTM; see STORY.md, secret step 12) describes "a jittered event-related design, 24 participants, 7T." The log shows 16 s blocks, one subject, no 7T. The text was generated to sound like an NRT paper; nobody checked it against what was actually run.
- **Theme:** publication bias as the motive. A true null was a dead end for Nell and a raw material for Preston. The game's hero is named Null for a reason.

**Story change this requires:** in STORY.md, "The secret" step 1 now says Nell's pilot found a strong visual response and an honest null for attention (it used to say "modest effect").

---

## Where the pieces come from

| Piece | Source | How you get it |
|---|---|---|
| **The data** | The journal's open-data repository: `sub-01_task-attn_bold.nii` plus a V1 depth-binned time series. The header says 3T, FECHNER HALL. | Archive research on Nell's computer (the journal's "data available" link actually works, to Preston's surprise) |
| **The stimulus log** | Preston's handwritten run log, inside the Impact Lab (Room 116, the locked door seeded in Act I) | Morris, through the ceiling vent (character switch). Gus's badge doesn't open it, and the keypad code he cracked in Act II has been changed. |
| **The analysis station** | Nell's monitor in the Adline Lab ("MATLAB is getting judgmental" pays off) | Use the log on the monitor |
| **The teacher** | Gus Ian, Nell's labmate, running on no sleep. Calm and exact; he walks Nell through each step in plain language, and she catches the things he's too tired to see (the dummy scans are her catch). | Free: he's been waiting all week for someone to run a GLM with. Brett (office hours again) is the layperson Nell explains it back to. Rex keeps a cameo: he guards the GPU logs, and drops one line about the analysis ("I've run ten thousand GLMs. Nine thousand were on purpose."). |

---

## The design (what actually happened in the scanner)

- TR = 2 s. 4 dummy volumes (8 s) were **discarded** before the data start. That matters, and the log doesn't say so.
- Block design (revised again): 16 s OFF (grey screen), 16 s ON while attending, 16 s OFF, 16 s ON while ignoring, … eight ON blocks, ending on OFF. 272 s = 136 volumes after the dummies. Preston's log: ATT @ 0:16, IGN @ 0:48, ATT @ 1:20, …
- No dummy-scan offset (revised): modern scanners drop the warm-up volumes before the data reach you, so the log's times are the data's times and the LINE IT UP stage is skipped (seven steps on screen). Earlier notes about dummies below are history.
- Grace (revised): LINED UP accepts one TR either way (Gus nudges the last two seconds); the FIT lamp lights when the leftovers are within 25% of the best fit, or every knob is within 0.1. Each stage opens with a short line-by-line lesson, a task line under the stage chips, and a brass arrow on the next thing to click.
- ON blocks alternate: **ATTEND** (count the checkerboard's contrast dips) and **IGNORE** (do a hard letter task at fixation). 4 ATTEND blocks, 4 IGNORE blocks. Same visual input in both; only attention changes. That is the whole logic of the contrast.

**Preston's log** (drawn as a page in his handwriting, with a coffee ring and the NRT insignia doodled in the margin):
```
RUN 1  sub-01   "attn synergy"
TR 2s   blocks 16 on / 16 off
ATT @ 0:16   IGN @ 0:48   ATT @ 1:20   IGN @ 1:52   ...   IGN @ 4:00
(note to self: dummies??  ask Nell)
```
The onsets are timed from the *scanner start*, but the data start after the dummies. Copy them straight in and every block is 8 s late: the signal visibly rises before each block starts. That's the first trap and the first lesson: **check your timing.** "Ask Nell" is a line players reread after Act IV.

---

## Play, stage by stage

The analysis is a full-screen instrument readout on Nell's monitor, in the house style: thin colored lines on black, stroke-alphabet numbers, knobs drawn as circles with a tick, a segmented error meter, and a **step sequencer** for the stimulus timeline (one step = one TR, so a 16 s block is 8 lit steps). No fills except lit steps and the fit lamp.

| Stage | You do | It teaches (plain language, said first) | Score |
|---|---|---|---|
| **1. Read the log** | Look at Preston's log; enter the blocks on the step sequencer, two rows (revised Nov 2026): **STIM ON** (all eight blocks: the checkerboard is on in every one) and **ATTEND** (the four attend blocks again). IGNORE gets no row: it's what STIM ON alone predicts, and a third row would make the design collinear (STIM ON = ATTEND + IGNORE), so the betas couldn't be estimated. Gus says so. | **Block design:** "Show the picture for 16 seconds, then nothing for 16. Over and over. Like flicking a porch light to see if the neighbor's dog barks every time." | +2 |
| **2. Line it up** | Overlay your square wave on the raw V1 signal. It's early. Spot the 8 s misalignment, find "dummies??" in the log, and shift the whole row by 4 steps. | **Timing:** the data clock and the scanner clock aren't the same clock. | +2 |
| **3. Make it slow** | The square wave still doesn't look like the data: real responses ramp up late and sag after. Apply the **HRF** (a slow-ink stamp that smears each square into a gentle hump). | **Hemodynamic response:** "Neurons answer instantly. The blood arrives about five seconds later and lingers, then dips. Lightning, then thunder." | +2 |
| **4. Fit by hand** | Three knobs: STIM ON amplitude (the visual response), ATTEND (what attending adds on top; it can go negative), BASELINE. Turn them to stretch the model curves onto the data. The error meter (sum of squared leftovers) drops as you get closer; the fit lamp lights within 2% of the best possible. | **The GLM:** "Your guess is a template. Stretch it taller or shorter until it lies on top of the data. How far you had to stretch it is the answer." | +3 |
| **5. Let MATLAB do it** | Press SOLVE. The knobs snap to the least-squares answer, a hair from where you left them. | The computer does exactly what you just did, instantly. That's all "running a GLM" means. | +1 |
| **6. The contrast** | The ATTEND beta is the attention effect, tested against zero (t = β / SE). The seesaw shows attend blocks (STIM ON + ATTEND) against ignore blocks (STIM ON alone), with the error bar on what attending adds. It doesn't tip. Difference ≈ 0, error bars straddle zero. | **Contrasts:** "Same picture both times. The only difference is attention. So the difference between the fits *is* the attention effect." | +2 |
| **7. Look for layers** | Switch to the depth view: the folded-cortex close-up (pial surface, six layer lines, white-matter boundary, depth probe) with the **3T voxel grid** laid on top. One voxel swallows all six layers. Try to fit per layer; you get one number, not six. | **Resolution:** "V1 is about 2 mm thick. A 3T voxel is about 3 mm on a side. Like measuring the six layers of a cake with a spoon bigger than the cake." | +2 |
| **8. Compare to the paper** | Notebook overlay: trace Preston's published time courses onto yours. Three tells light up (below). | **Real vs. fake noise:** "Real measurements wobble, drift and disagree. Fake ones are too smooth, or repeat." | +3 per tell |

### The three tells in Preston's figure
1. **Too clean.** His fit leaves almost nothing over: residuals near zero, error bars smaller than the line width. Real fMRI noise drifts slowly and wobbles from one TR to the next.
2. **Copy-paste noise.** The little wobbles in his "layer 2" and "layer 5" traces are identical, wobble for wobble. Six layers, one noise. (The super-resolution model reused the same texture; it ties forward to the GPU logs, clue 8.)
3. **No draining veins.** Real gradient-echo BOLD gets *louder toward the brain's surface*, because blood drains outward into veins on the pial surface. Any honest depth profile slopes up toward the top. Preston's double-bump is perfectly symmetric and floats free of that slope. "The top floor always gets the most water pressure. His building has no plumbing."

Tell 3 is the one a laminar fMRI expert should nod at hardest.

---

## Deaths and gags

- **The garden of forking paths (Sierra death, Revise & Resubmit):** a big red button on the analysis screen: TRY ANOTHER ANALYSIS. Each press quietly changes something: a new ROI, drop run 2, more smoothing, "exclude outliers" (a canister rattles; this is how Dana was "excluded"). The p-value creeps down: .48, .31, .19, .11… On press 14 it hits **p = .049** and the screen goes ((( SIGNIFICANT ))). A pneumatic canister lands on Nell's desk: an invitation, embossed with the insignia.
  > *"You found significance on the fourteenth try. The Round Table has noticed your potential. You are now a Rising Star. Your earbuds arrive Friday."* **INDUCTED EARLY.**
  It teaches the real lesson (keep trying analyses and something will pass by chance), it's a joke about the villains' whole method, and it previews the Inducted ending.
- **Double-dipping** (optional look line): if Nell tries to choose her V1 voxels using the attention contrast itself, Gus: "Congratulations. You've discovered that the data agree with the data."
- **The HRF sticker:** the slow-ink stamp is a rubber stamp shaped like a thunderhead, "the only thing in this building that admits blood is slow."
- **SOLVE** button label after you nail the fit by hand: "SOLVE (YOU DIDN'T NEED ME)."

---

## Built

Playable as a test scene: `game/glm.html` (module `game/js/minigames/glm.js`, which mounts into any container so Act III can put it on Nell's monitor). The data are computed for real: boxcars convolved with a canonical double-gamma HRF, AR(1) noise plus slow drift, ordinary least squares, and a t contrast. The seed is chosen so the attention effect is a genuine null (t ≈ 0). The fit lamp lights within 2% of the least-squares minimum.

## Under the hood (for implementation)

- **Synthetic data**, generated once from a seed and drawn as lines, never raster:
  - predictor per condition = boxcar (16 s blocks, onsets in seconds, minus 8 s for the dummies) convolved with a canonical double-gamma HRF (peak ≈ 5–6 s, undershoot ≈ 15–16 s, ratio 1/6), sampled at TR 2 s
  - **Nell's sub-01 (truth):** y = 1.0·attend + 1.0·ignore + baseline + slow drift + AR(1) noise (φ ≈ 0.3). β_attend = β_ignore. Depth profile (if forced at fake resolution): monotonic increase toward the pial surface, same for both conditions.
  - **Preston's figure (fake):** six depth bins, β_attend − β_ignore > 0 only in bins 1 and 5–6, noise SD tiny, and the *same* noise vector added to every bin.
- **Manual fit:** RSS = Σ(y − b_A·x_A − b_I·x_I − b_0)². The fit lamp lights at RSS ≤ 1.02 × RSS_OLS. SOLVE computes OLS directly (3×3 normal equations, no library).
- **Contrast:** t = (b_A − b_I) / SE from the residual variance and (XᵀX)⁻¹. Show it on screen as the seesaw plus a readout (t ≈ 0.3, p ≈ .7), never as a wall of numbers.
- **Module:** `game/js/minigames/glm.js`, a full-screen overlay like the sticky-note readout, opened by USE LOG ON MONITOR. It reports stage completion to `story.js` through `api.flag()` and `api.score()`, and the forking-paths death goes through the normal `api.die()` so Revise & Resubmit works.
- **Knob input:** drag vertically to turn, in discrete detents (poses, not tweens). The model curve redraws per detent.

---

## Gates

- **Needs:** the stimulus log (Morris, Impact Lab), the data (archive research), Gus at the desk (Act III day, after the Act II alliance).
- **Unlocks:** the "Painted on" line, a new Notebook entry ("sub-01 has a null. Like mine."), and a +1 nudge toward the GPU logs ("so where did the layers come from?"). In Act IV the lasagna overlay pays it off.
- **Total:** about 20 h-index points if all three tells are found.

**Update (Nov 2026):** the standalone test page is gone. WRITE IT UP ends the minigame; the result appears as Nell's write-up, a clue close-up (`WRITEUP` in `game/js/story/act3.js`), instead of a scorecard.
