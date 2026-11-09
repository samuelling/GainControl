#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: MENTAL ROTATION

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Cooper, L. A., & Shepard, R. N. (1973). Chronometric studies of the rotation of mental images. In W. G. Chase (Ed.),
  Visual information processing (pp. 75-176). New York: Academic Press.

A letter (R, F, G or J) appears rotated by 0-300 deg in 60 deg steps, normal or mirror-reversed. N = normal,
M = mirror, as fast as you can without mistakes. RT rises with the angle from upright.

Output: data/rotation_<participant>_<date>.csv  columns: trial, letter, angle, mirror, said_mirror, rt_ms

Run in PsychoPy Coder, or `python gc_rotation.py`. Escape quits (data so far are saved).
"""
import os, csv, math, random, datetime  # noqa: F401 (not every script uses all)
import numpy as np
from psychopy import visual, core, event, gui

# ---- your setup ----
SCREEN = 0
FULLSCREEN = True
SCREEN_WIDTH_CM = 53.0   # visible width of the display
VIEW_DIST_CM = 57.0      # eyes to screen (57 cm: 1 cm = 1 deg)
QUICK = False            # True: the console's short version


class Quit(Exception):
    pass


def keys(names, clock=None, max_wait=float('inf')):
    """Wait for one of the keys (Escape quits). Returns (key, rt) or (None, None) after max_wait seconds."""
    r = event.waitKeys(maxWait=max_wait, keyList=list(names) + ['escape'], timeStamped=clock or core.Clock())
    if r is None:
        return None, None
    if r[0][0] == 'escape':
        raise Quit
    return r[0]


def start(title, file_id, header, bg=0.0, extra=None):
    """Dialog, data file, window (pixels), and pixels per degree. bg is a grey level 0-1."""
    info = {'participant': '', 'quick': QUICK}
    info.update(extra or {})
    if not gui.DlgFromDict(info, title=title).OK:
        core.quit()
    here = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(os.path.join(here, 'data'), exist_ok=True)
    fn = os.path.join(here, 'data', '%s_%s_%s.csv' % (file_id, info['participant'] or 'anon', datetime.datetime.now().strftime('%Y-%m-%d_%H%M')))
    out = open(fn, 'w', newline='')
    w = csv.writer(out)
    w.writerow(header)
    win = visual.Window(fullscr=FULLSCREEN, screen=SCREEN, units='pix', color=[2 * bg - 1] * 3, allowGUI=False)
    win.mouseVisible = False
    ppd = win.size[0] / SCREEN_WIDTH_CM * 2 * VIEW_DIST_CM * math.tan(math.radians(.5))
    fps = win.getActualFrameRate(nIdentical=20, nMaxFrames=120) or 60.0
    return info, fn, out, w, win, ppd, fps


def message(win, text, color=(1, 1, 1), wait=True):
    visual.TextStim(win, text, color=color, height=24, wrapWidth=win.size[0] * .8).draw()
    win.flip()
    if wait:
        keys(['space', 'return'])


def finish(win, out, fn):
    out.close()
    win.close()
    print('Saved', fn)


def main():
    info, fn, out, w, win, ppd, fps = start('Mental rotation', 'rotation', ['trial', 'letter', 'angle', 'mirror', 'said_mirror', 'rt_ms'], bg=0)
    reps = 4 if info['quick'] else 10
    trials = [(a, mir) for _ in range(reps) for a in (0, 60, 120, 180, 240, 300) for mir in (0, 1)]
    random.shuffle(trials)
    trials = trials[:48 if info['quick'] else 120]
    fix = visual.Rect(win, width=6, height=6, fillColor=[1, 1, 1], lineWidth=0)
    try:
        message(win, 'A letter appears, rotated. Normal letter: N.  Mirror image: M.\nAs fast as you can without mistakes.\n\nSPACE to start.')
        for t, (a, mir) in enumerate(trials):
            L = random.choice('RFGJ')
            fix.draw(); win.flip(); core.wait(.5)
            # mirror by flipping horizontally before rotating (PsychoPy ori is clockwise, like the console's)
            stim = visual.TextStim(win, L, height=4 * ppd, bold=True, font='Arial', color=[.83, .8, 1], ori=a, flipHoriz=bool(mir))
            stim.draw()
            clock = core.Clock(); win.callOnFlip(clock.reset); win.flip()
            k, rt = keys(['n', 'm'], clock)
            w.writerow([t + 1, L, a, mir, int(k == 'm'), round(rt * 1000, 1)]); out.flush()
            win.flip(); core.wait(.3)
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
