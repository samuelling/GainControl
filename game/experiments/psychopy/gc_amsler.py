#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: AMSLER GRID

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Amsler, M. (1953). Earliest symptoms of diseases of the macula. British Journal of Ophthalmology, 37(9), 521-537.

The central 20 x 20 deg grid (1 deg squares) with a centre dot, one eye at a time; click wherever the lines look wavy,
blurred or missing, then press SPACE for the next eye. A demonstration of the clinical self-check, not a test.

Output: data/amsler_<participant>_<date>.csv  columns: eye, x_deg, y_deg  (x right, y up, from the centre)

Run in PsychoPy Coder, or `python gc_amsler.py`. Escape quits (data so far are saved).
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


class Quest:
    """QUEST (Watson & Pelli, 1983) over log10 threshold: Weibull with slope beta, guess rate gam, lapse delta;
    trials placed at the posterior mean (as in the console)."""
    def __init__(self, lo, hi, guess, beta=3.5, gam=.5, delta=.02, n=240, sd=1.2):
        self.T = np.linspace(lo, hi, n)
        self.lp = -.5 * ((self.T - guess) / sd) ** 2
        self.lo, self.hi, self.beta, self.gam, self.delta = lo, hi, beta, gam, delta

    def update(self, x, ok):
        p = self.delta * self.gam + (1 - self.delta) * (1 - (1 - self.gam) * np.exp(-10 ** (self.beta * (x - self.T))))
        p = np.clip(p, 1e-6, 1 - 1e-6)
        self.lp += np.log(p if ok else 1 - p)

    def mean(self):
        w = np.exp(self.lp - self.lp.max())
        return float((self.T * w).sum() / w.sum())

    def next(self):
        return float(np.clip(self.mean(), self.lo, self.hi))


def two_ifc(win, draw, fps, dur=.2, isi=.5, prompt='Which interval? 1 or 2', dark=True):
    """Two intervals, each numbered; draw(i) draws interval i's stimulus. Returns the interval chosen (0 or 1)."""
    col = [-1, -1, -1] if dark else [1, 1, 1]
    num = visual.TextStim(win, '', pos=(0, win.size[1] / 2 - 60), height=26, color=col)
    fix = visual.Rect(win, width=14, height=2, fillColor=col, lineWidth=0)
    fix2 = visual.Rect(win, width=2, height=14, fillColor=col, lineWidth=0)
    for i in (0, 1):
        num.text = str(i + 1)
        for _ in range(int(round(isi * fps))):
            num.draw(); fix.draw(); fix2.draw(); win.flip()
        for _ in range(max(1, int(round(dur * fps)))):
            draw(i); num.draw(); win.flip()
    fix.draw(); fix2.draw()
    visual.TextStim(win, prompt, pos=(0, -win.size[1] / 2 + 60), height=22, color=col).draw()
    win.flip()
    k, _ = keys(['1', '2', 'num_1', 'num_2'])
    return int(k[-1]) - 1


def main():
    info, fn, out, w, win, ppd, fps = start('Amsler grid', 'amsler', ['eye', 'x_deg', 'y_deg'], bg=1)
    side = min(win.size[1] - 40, 20 * ppd); cell = side / 20
    lines = [visual.Line(win, start=(-side / 2 + i * cell, -side / 2), end=(-side / 2 + i * cell, side / 2), lineColor=[-1, -1, -1], lineWidth=1.5) for i in range(21)]
    lines += [visual.Line(win, start=(-side / 2, -side / 2 + i * cell), end=(side / 2, -side / 2 + i * cell), lineColor=[-1, -1, -1], lineWidth=1.5) for i in range(21)]
    dot = visual.Circle(win, radius=5, edges=24, fillColor=[-1, -1, -1], lineWidth=0)
    mouse = event.Mouse(win=win, visible=True)
    try:
        for eye in ('left', 'right'):
            message(win, 'Cover your %s eye. Look only at the centre dot.\nClick anywhere the lines look wavy, bent, blurred or missing; SPACE when done.\n\nSPACE to start.' % ('RIGHT' if eye == 'left' else 'LEFT'), color=(-1, -1, -1))
            win.mouseVisible = True; marks = []
            while True:
                for l in lines: l.draw()
                dot.draw()
                for mx, my in marks:
                    visual.Circle(win, radius=9, edges=24, lineColor=[.52, -.69, -.51], lineWidth=2.5, fillColor=None, pos=(mx, my)).draw()
                win.flip()
                ks = event.getKeys(['space', 'escape'])
                if 'escape' in ks:
                    raise Quit
                if 'space' in ks:
                    break
                if mouse.getPressed()[0]:
                    mx, my = mouse.getPos()
                    while mouse.getPressed()[0]:
                        pass
                    if abs(mx) <= side / 2 and abs(my) <= side / 2:
                        marks.append((mx, my)); w.writerow([eye, round(mx / ppd, 3), round(my / ppd, 3)]); out.flush()
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
