#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: NUMBER SENSE

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Halberda, J., Mazzocco, M. M. M., & Feigenson, L. (2008). Individual differences in non-verbal number acuity correlate
  with maths achievement. Nature, 455(7213), 665-668.

Two clouds of dots flash for 300 ms: yellow left, blue right, ratios 1.1-2 (smaller set 6-14). D = yellow had more,
K = blue had more. Half the trials equate dot size, half equate total area. Fit the Weber fraction w with
P(correct) = Phi(|n1 - n2| / (w * sqrt(n1^2 + n2^2))).

Output: data/number_<participant>_<date>.csv  columns: trial, n_yellow, n_blue, ratio, equal_size_dots, correct

Run in PsychoPy Coder, or `python gc_number.py`. Escape quits (data so far are saved).
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


def cloud(win, n, x0, ppd, col, equal_size):
    pts, R = [], 5 * ppd
    rr = 7 if equal_size else 11 * math.sqrt(10 / n)
    tries = 0
    while len(pts) < n and tries < 4000:
        tries += 1
        a, r = random.random() * 2 * math.pi, R * math.sqrt(random.random())
        x, y = x0 + r * math.cos(a), r * math.sin(a)
        if all(math.hypot(px - x, py - y) > rr * 2.4 for px, py in pts):
            pts.append((x, y))
    return visual.ElementArrayStim(win, nElements=len(pts), xys=pts, sizes=2 * max(3, rr), elementTex=None, elementMask='circle', colors=col, units='pix')


def main():
    info, fn, out, w, win, ppd, fps = start('Number sense', 'number', ['trial', 'n_yellow', 'n_blue', 'ratio', 'equal_size_dots', 'correct'], bg=.5)
    RAT = [1.1, 1.2, 1.33, 1.5, 2]
    reps = 12 if info['quick'] else 24
    trials = [r for _ in range(reps) for r in RAT]
    random.shuffle(trials)
    fix = visual.Rect(win, width=6, height=6, fillColor=[-1, -1, -1], lineWidth=0)
    try:
        message(win, 'Two clouds of dots flash: yellow on the left, blue on the right. Which had more?\nToo fast to count: go with your impression. D = yellow, K = blue.\n\nSPACE to start.', color=(-1, -1, -1))
        for t, ratio in enumerate(trials):
            small = random.randint(6, 14); big = round(small * ratio); y_more = random.random() < .5
            nY, nB = (big, small) if y_more else (small, big)
            eq = random.random() < .5
            fix.draw(); win.flip(); core.wait(.5)
            a, b = cloud(win, nY, -6.5 * ppd, ppd, [.96, .69, -.69], eq), cloud(win, nB, 6.5 * ppd, ppd, [-.53, -.06, 1], eq)
            for _ in range(int(round(.3 * fps))):
                a.draw(); b.draw(); win.flip()
            win.flip()
            k, _ = keys(['d', 'k'])
            w.writerow([t + 1, nY, nB, round(big / small, 3), int(eq), int((k == 'd') == y_more)]); out.flush()
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
