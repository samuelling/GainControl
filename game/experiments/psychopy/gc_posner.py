#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: ORIENTING OF ATTENTION

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Posner, M. I. (1980). Orienting of attention. Quarterly Journal of Experimental Psychology, 32(1), 3-25.

Two boxes 7 deg left and right of fixation. A central arrow (or a neutral plus) appears; 500-1000 ms later a square
flashes in one box: press SPACE as fast as you can. 10% catch trials (no target), 30% neutral, the rest cued with an
arrow that is valid 80% of the time. 1.2 s response window. RT benefit = neutral - valid; cost = invalid - neutral.

Output: data/posner_<participant>_<date>.csv  columns: trial, kind, cue, target_side, soa_ms, pressed, rt_ms

Run in PsychoPy Coder, or `python gc_posner.py`. Escape quits (data so far are saved).
"""
import os, csv, math, random, datetime
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
    info, fn, out, w, win, ppd, fps = start('Orienting of attention', 'posner', ['trial', 'kind', 'cue', 'target_side', 'soa_ms', 'pressed', 'rt_ms'], bg=.12)
    N = 60 if info['quick'] else 150
    ecc, bs = 7 * ppd, 1.4 * ppd
    trials = []
    for _ in range(N):
        r, side = random.random(), random.choice([-1, 1])
        if r < .1:
            trials.append(['catch', random.choice(['left', 'right', 'neutral']), 0])
        elif r < .4:
            trials.append(['neutral', 'neutral', side])
        else:
            kind = 'valid' if random.random() < .8 else 'invalid'
            trials.append([kind, 'left' if (kind == 'valid') == (side < 0) else 'right', side])
    boxes = [visual.Rect(win, width=bs, height=bs, pos=(s * ecc, 0), lineColor=[.6] * 3, lineWidth=2, fillColor=None) for s in (-1, 1)]
    fix = visual.Rect(win, width=6, height=6, fillColor=[1, 1, 1], lineWidth=0)
    arrows = {d: visual.ShapeStim(win, vertices=[(-d * 16, 0), (d * 16, 0), (d * 6, 9), (d * 16, 0), (d * 6, -9)], closeShape=False, lineColor=[1, 1, 1], lineWidth=3) for d in (-1, 1)}
    plus = visual.ShapeStim(win, vertices=[(-14, 0), (14, 0), (0, 0), (0, 14), (0, -14)], closeShape=False, lineColor=[1, 1, 1], lineWidth=3)
    target = visual.Rect(win, width=bs * .6, height=bs * .6, fillColor=[1, 1, 1], lineWidth=0)
    try:
        message(win, 'Eyes on the centre. An arrow (or a plus) appears, then a square flashes in one box.\nPress SPACE as fast as you can when you see it. On a few trials nothing comes: then don\'t press.\n\nSPACE to start.')
        for t, (kind, cue, side) in enumerate(trials):
            for b in boxes: b.draw()
            fix.draw(); win.flip(); core.wait(.7)
            cue_stim = plus if cue == 'neutral' else arrows[-1 if cue == 'left' else 1]
            soa = random.uniform(.5, 1.0)
            for _ in range(int(round(soa * fps))):
                for b in boxes: b.draw()
                cue_stim.draw(); win.flip()
            for b in boxes: b.draw()
            cue_stim.draw()
            if kind != 'catch':
                target.pos = (side * ecc, 0); target.draw()
            event.clearEvents()
            clock = core.Clock(); win.callOnFlip(clock.reset); win.flip()
            k, rt = keys(['space'], clock, max_wait=1.2)
            w.writerow([t + 1, kind, cue, side, round(soa * 1000), int(k is not None), round(rt * 1000, 1) if k else '']); out.flush()
            for b in boxes: b.draw()
            win.flip(); core.wait(.4)
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
