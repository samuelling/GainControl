#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: SPINNING SPHERE (KINETIC DEPTH)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Wallach, H., & O'Connell, D. N. (1953). The kinetic depth effect. Journal of Experimental Psychology, 45(4), 205-217.

260 dots on a transparent sphere (radius 170 px) turning at 0.2 rev/s, in orthographic projection, with a red fixation square.
Press A (FRONT MOVES LEFT) or L (FRONT MOVES RIGHT) as soon as you see each interpretation, and again every time it changes. 30 s (quick) or
90 s. The last, cut-off percept is not saved. Output: data/sphere_<participant>_<date>.csv
  columns: stimulus, percept, onset_s, duration_s

Run in PsychoPy Coder, or `python gc_sphere.py`. Escape quits (data so far are saved).
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
    info, fn, out, w, win, ppd, fps = start('SPINNING SPHERE (KINETIC DEPTH)', 'sphere', ['stimulus', 'percept', 'onset_s', 'duration_s'], bg=0)
    secs = 30 if info['quick'] else 90
    N = 260
    z = np.random.rand(N) * 2 - 1
    a = np.random.rand(N) * 2 * np.pi
    r = np.sqrt(1 - z ** 2)
    dots = visual.ElementArrayStim(win, nElements=N, elementTex=None, elementMask=None, sizes=4, colors=[.83, .8, 1], units='pix')
    red = visual.Rect(win, width=6, height=6, fillColor=[1, -.54, -.28], lineWidth=0)
    def draw(t):
        xs = r * np.cos(a + t * 2 * np.pi * .2) * 170
        dots.xys = np.column_stack([xs, -z * 170])
        dots.draw(); red.draw()
    try:
        message(win, 'Keep your eyes on the red square. Press A while the front of the globe moves left, L while it moves right, and again at every flip.\\n\\nSPACE to start.')
        log = track(win, fps, secs, draw, {'a': 'FRONT MOVES LEFT', 'l': 'FRONT MOVES RIGHT'}, w, 'sphere')
        for k in ('a', 'l'):
            d = [x[2] for x in log if x[0] == k]
            print('%s: %d percepts, mean %.2f s' % (k, len(d), np.mean(d) if d else float('nan')))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
