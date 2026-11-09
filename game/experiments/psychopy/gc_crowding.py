#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: CROWDING

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Bouma, H. (1970). Interaction effects in parafoveal letter recognition. Nature, 226(5241), 177-178.

A letter (D H K N R S V Z, 0.9 deg) flashes for 150 ms 6 deg left or right of fixation, alone or between two flanker
letters at 0.9-4.5 deg centre-to-centre spacing (or 0, i.e. no flankers drawn, and 'alone'). Type the MIDDLE letter.
Bouma's rule: crowding extends to about half the eccentricity (3 deg here).

Output: data/crowding_<participant>_<date>.csv  columns: trial, spacing_deg, side, target, response, correct

Run in PsychoPy Coder, or `python gc_crowding.py`. Escape quits (data so far are saved).
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
    info, fn, out, w, win, ppd, fps = start('Crowding', 'crowding', ['trial', 'spacing_deg', 'side', 'target', 'response', 'correct'], bg=.5)
    LET, SP = list('DHKNRSVZ'), [0, .9, 1.5, 2.2, 3, 4.5, None]
    reps = 10 if info['quick'] else 20
    trials = [s for _ in range(reps) for s in SP]
    random.shuffle(trials)
    fix = visual.Rect(win, width=8, height=8, fillColor=[-1, -1, -1], lineWidth=0)
    txt = lambda s, x: visual.TextStim(win, s, pos=(x, 0), height=.9 * ppd, bold=True, font='Arial', color=[-1, -1, -1])
    try:
        message(win, 'Keep your eyes on the centre dot. A letter flashes 6 deg to one side, sometimes between two others.\nType the MIDDLE letter (one of D H K N R S V Z). Guess if you have to.\n\nSPACE to start.', color=(-1, -1, -1))
        for t, s in enumerate(trials):
            side, tgt = random.choice([-1, 1]), random.choice(LET)
            fl = random.sample([l for l in LET if l != tgt], 2)
            fix.draw(); win.flip(); core.wait(.6)
            x = side * 6 * ppd
            stims = [txt(tgt, x)] + ([txt(fl[0], x - s * ppd), txt(fl[1], x + s * ppd)] if s else [])
            for _ in range(int(round(.15 * fps))):
                for st in stims: st.draw()
                fix.draw(); win.flip()
            fix.draw(); win.flip()
            k, _ = keys([l.lower() for l in LET])
            w.writerow([t + 1, 'alone' if s is None else s, side, tgt, k.upper(), int(k.upper() == tgt)]); out.flush()
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
