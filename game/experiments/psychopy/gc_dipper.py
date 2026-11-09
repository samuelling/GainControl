#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: CONTRAST DISCRIMINATION (THE DIPPER)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Legge, G. E., & Foley, J. M. (1980). Contrast masking in human vision. JOSA, 70(12), 1458-1471.
Nachmias, J., & Sansbury, R. V. (1974). Grating contrast: Discrimination may be better than detection. Vision Research, 14(10), 1039-1042.

2IFC: two vertical Gabors (3 c/deg, sd 0.6 deg, same phase), both at a pedestal contrast (0, .01, .03, .1 or .3), one
with an increment. Which had more contrast: 1 or 2? Five interleaved QUESTs on log10 increment. Thresholds vs pedestal
dip below detection at low pedestals, then rise (masking). Needs a linearised, high bit-depth display to be real.

Output: data/dipper_<participant>_<date>.csv  columns: trial, pedestal, increment, target_interval, response, correct

Run in PsychoPy Coder, or `python gc_dipper.py`. Escape quits (data so far are saved).
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
    info, fn, out, w, win, ppd, fps = start('The dipper', 'dipper', ['trial', 'pedestal', 'increment', 'target_interval', 'response', 'correct'], bg=.5)
    N = 100 if info['quick'] else 200
    peds = [0, .01, .03, .1, .3]
    Q = [Quest(-3, -.3, math.log10(max(.006, p * .25)) if p else -2, beta=3) for p in peds]
    try:
        message(win, 'Two striped patches. Both have the same base contrast (sometimes zero); one has a little extra.\nWhich had MORE contrast: 1 or 2?\n\nSPACE to start.', color=(-1, -1, -1))
        for t in range(N):
            k = t % len(peds); p = peds[k]; dc = 10 ** Q[k].next(); first = random.random() < .5; ph = random.random()
            gs = [visual.GratingStim(win, tex='sin', mask='gauss', size=3.6 * ppd, sf=3 / ppd, contrast=p + (dc if (i == 0) == first else 0), phase=ph) for i in (0, 1)]
            a = two_ifc(win, lambda i: gs[i].draw(), fps)
            ok = a == (0 if first else 1)
            Q[k].update(math.log10(dc), ok)
            w.writerow([t + 1, p, round(dc, 6), 1 if first else 2, a + 1, int(ok)]); out.flush()
        for p, q in zip(peds, Q):
            print('pedestal %.2f: increment threshold %.4f' % (p, 10 ** q.mean()))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
