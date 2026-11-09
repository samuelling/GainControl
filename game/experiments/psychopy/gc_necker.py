#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: NECKER CUBE

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Necker, L. A. (1832). Observations on some remarkable optical phaenomena seen in Switzerland; and on an optical phaenomenon
  which occurs on viewing a figure of a crystal or geometrical solid. London and Edinburgh Philosophical Magazine and
  Journal of Science, 1(5), 329-337.

A wireframe cube with no depth cues (side 150 px, offset 70 px) and a fixation dot in its middle.
Press A (LOWER FACE FRONT) or L (UPPER FACE FRONT) as soon as you see each interpretation, and again every time it changes. 30 s (quick) or
90 s. The last, cut-off percept is not saved. Output: data/necker_<participant>_<date>.csv
  columns: stimulus, percept, onset_s, duration_s

Run in PsychoPy Coder, or `python gc_necker.py`. Escape quits (data so far are saved).
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


def track(win, fps, secs, draw, keys2, w, label):
    """Press-on-change tracking: draw(t) every frame for secs; log each percept's onset and duration."""
    clock, cur, t0, log = core.Clock(), None, 0.0, []
    event.clearEvents()
    timer = visual.TextStim(win, '', pos=(win.size[0] / 2 - 60, win.size[1] / 2 - 30), height=18, color=[-.03, -.06, .13])
    while clock.getTime() < secs:
        t = clock.getTime()
        draw(t)
        timer.text = '%d s' % math.ceil(secs - t); timer.draw()
        win.flip()
        for k, kt in event.getKeys(keyList=list(keys2) + ['escape'], timeStamped=clock):
            if k == 'escape':
                raise Quit
            if k != cur:
                if cur is not None:
                    log.append((cur, t0, kt - t0))
                cur, t0 = k, kt
    for p, on, d in log:
        w.writerow([label, keys2[p], round(on, 3), round(d, 3)])
    return log


def main():
    info, fn, out, w, win, ppd, fps = start('NECKER CUBE', 'necker', ['stimulus', 'percept', 'onset_s', 'duration_s'], bg=0)
    secs = 30 if info['quick'] else 90
    s, o = 150, 70
    x, y = -(s + o) / 2, (s - o) / 2      # top-left of the front square, y up
    v = lambda a, b: (x + a, y - b)
    edges = [(v(0, 0), v(s, 0)), (v(s, 0), v(s, s)), (v(s, s), v(0, s)), (v(0, s), v(0, 0)),
             (v(o, -o), v(s + o, -o)), (v(s + o, -o), v(s + o, s - o)), (v(s + o, s - o), v(o, s - o)), (v(o, s - o), v(o, -o))]
    edges += [(v(a, b), v(a + o, b - o)) for a, b in ((0, 0), (s, 0), (0, s), (s, s))]
    cube = [visual.Line(win, start=a, end=b, lineColor=[.83, .8, 1], lineWidth=3) for a, b in edges]
    fixd = visual.Rect(win, width=4, height=4, fillColor=[.83, .8, 1], lineWidth=0)
    def draw(t):
        for e in cube:
            e.draw()
        fixd.draw()
    try:
        message(win, 'Keep your eyes on the dot in the cube. Press A when the lower-left face looks in front, L when the upper-right face does, and again at every flip.\\n\\nSPACE to start.')
        log = track(win, fps, secs, draw, {'a': 'LOWER FACE FRONT', 'l': 'UPPER FACE FRONT'}, w, 'necker')
        for k in ('a', 'l'):
            d = [x[2] for x in log if x[0] == k]
            print('%s: %d percepts, mean %.2f s' % (k, len(d), np.mean(d) if d else float('nan')))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
