# The Perception Console, for the lab

Every experiment in GAIN CONTROL's perception console is also here as a standalone script, in two versions:

- `psychopy/gc_<id>.py`: PsychoPy (Python). Open it in PsychoPy Coder and press Run, or run `python gc_<id>.py` in an environment with PsychoPy installed. Tested against the PsychoPy 2023–2025 API.
- `ptb/gc_<id>.m`: Psychtoolbox-3 (MATLAB). Put it on your path and call `gc_<id>` (or `gc_<id>('quick')` for the short version).

> **Starter code.** These scripts were written in part with Claude (Anthropic's AI model). They run the same designs as the console, but they haven't been validated on your hardware or for your study. Before you collect real data, check the timing, the stimulus sizes and luminances, the randomisation and counterbalancing, and the data files. Dot your i's and cross your coding t's.

Each script is a whole experiment, not just the stimulus: the same design, trial structure, staircases or adjustment procedure, and the same CSV columns as the console's version, so the console's results and the lab's can be analysed with the same code.

## Before you run

At the top of every script is a short block of settings:

| Setting | What it does |
| --- | --- |
| `SCREEN_WIDTH_CM` / `screenWidthCm` | The visible width of the display, in cm. With the viewing distance, this sets pixels per degree. |
| `VIEW_DIST_CM` / `viewDistCm` | Eyes to screen, in cm. 57 cm makes 1 cm on screen = 1 degree. |
| `SCREEN` / `screenNumber` | Which display to use. |
| `QUICK` / `'quick'` | The console's short version (fewer blocks or trials). |

Sizes in degrees are real once these are set. Luminance and contrast are not calibrated by the scripts: if your study depends on them, linearise the display (PsychoPy's monitor centre gamma, or `PsychColorCorrection` / a loaded gamma table in Psychtoolbox) and, for low contrasts, use a high bit-depth display mode. The PS 327 lab scripts keep the original lab code's pixel units, as in the course.

Escape quits any script; the data collected so far are saved.

The rivalry scripts (`gc_riv*`) need each eye to get its own picture: red/green or red/cyan glasses (the default), or a mirror or prism stereoscope. Set `VIEW_MODE` / `V.view` at the top, and run `gc_rivsetup` first: it checks for crosstalk, matches the two eyes' brightness through the glasses (or lines up the halves for a stereoscope), and prints the values to copy into the others. The Psychtoolbox versions use Psychtoolbox's own stereo modes (anaglyph mode 6 with per-eye gains, side-by-side mode 4).

## Data

Each run writes `data/<id>_<participant>_<date>.csv` next to the script, one row per trial (or per response), with the columns named in its first line.

## Sources

Every script's header gives the paper(s) it replicates, the same citations the console shows.
