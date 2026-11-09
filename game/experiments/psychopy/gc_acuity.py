#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: VISUAL ACUITY (TUMBLING E)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Snellen, H. (1862). Probebuchstaben zur Bestimmung der Sehschärfe. Utrecht: Van de Weijer.
Bailey, I. L., & Lovie, J. E. (1976). New design principles for visual acuity letter charts. American Journal of
  Optometry and Physiological Optics, 53(11), 740-745.
Watson, A. B., & Pelli, D. G. (1983). QUEST: A Bayesian adaptive psychometric method. Perception & Psychophysics, 33(2), 113-120.

A black tumbling E (5 x 5 strokes) on white faces right, down, left or up; press the arrow key for the way its bars
point. QUEST (4AFC, guess 0.25) on log10 stroke width in pixels. Threshold stroke in arcmin = MAR; logMAR = log10(MAR).
Set SCREEN_WIDTH_CM and VIEW_DIST_CM carefully: acuity depends on them directly. Sit far enough back that the
threshold stroke is several pixels wide.

Output: data/acuity_<participant>_<date>.csv  columns: trial, stroke_px, stroke_arcmin, direction, correct

Run in PsychoPy Coder, or `python gc_acuity.py`. Escape quits (data so far are saved).
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
    info, fn, out, w, win, ppd, fps = start('Visual acuity', 'acuity', ['trial', 'stroke_px', 'stroke_arcmin', 'direction', 'correct'], bg=1)
    N = 30 if info['quick'] else 60
    px_arcmin = ppd / 60
    q = Quest(0, math.log10(60), math.log10(max(2, 2 * px_arcmin)), gam=.25)
    dirs = ['right', 'down', 'left', 'up']
    try:
        message(win, 'Which way does the E face (the way its three bars point)? Press the arrow key.\nGuess when unsure.\n\nSPACE to start.', color=(-1, -1, -1))
        for t in range(N):
            s = max(1, round(10 ** q.next())); d = random.randrange(4)
            # the E as five rectangles: spine plus three bars, built facing right then rotated
            parts = [(-2 * s, 0, s, 5 * s)] + [(0, (2 - k) * s, 5 * s, s) for k in (0, 2, 4)]
            for x, y, wd, ht in parts:
                th = math.radians(d * 90)
                rx, ry = x * math.cos(th) + y * math.sin(th), -x * math.sin(th) + y * math.cos(th)
                visual.Rect(win, width=wd, height=ht, pos=(rx, ry), ori=d * 90, fillColor=[-1, -1, -1], lineWidth=0).draw()
            win.flip()
            k, _ = keys(['right', 'down', 'left', 'up'])
            ok = k == dirs[d]
            q.update(math.log10(s), ok)
            w.writerow([t + 1, s, round(s / px_arcmin, 3), dirs[d], int(ok)]); out.flush()
            win.flip(); core.wait(.2)
        mar = 10 ** q.mean() / px_arcmin
        print('Threshold stroke %.2f arcmin, logMAR %.2f (about 20/%d)' % (mar, math.log10(mar), round(20 * mar)))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
