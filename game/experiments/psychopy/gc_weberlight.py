#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: WEBER'S LAW FOR LIGHT

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Weber, E. H. (1834). De pulsu, resorptione, auditu et tactu: Annotationes anatomicae et physiologicae. Leipzig: Koehler.
Barlow, H. B. (1957). Increment thresholds at low intensities considered as signal/noise discriminations. Journal of
  Physiology, 136(3), 469-488.

2IFC: a 1 deg spot, slightly brighter than the background, flashes 150 ms 1.2 deg above fixation in one interval.
Backgrounds of four grey levels (.08, .2, .45, .8, nominal), interleaved; QUEST on log10 Weber fraction (dI / I),
with grey levels converted to linear light by the sRGB curve. Measure your display (or linearise it) for real
luminances: the log-log slope of dI against I is 1 for Weber's law.

Output: data/weberlight_<participant>_<date>.csv  columns: trial, background_grey, background_linear, weber_fraction, correct

Run in PsychoPy Coder, or `python gc_weberlight.py`. Escape quits (data so far are saved).
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


lin = lambda v: v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4
enc = lambda L: 12.92 * L if L <= .0031308 else 1.055 * L ** (1 / 2.4) - .055


def main():
    info, fn, out, w, win, ppd, fps = start("Weber's law for light", 'weberlight', ['trial', 'background_grey', 'background_linear', 'weber_fraction', 'correct'], bg=.5)
    N = 60 if info['quick'] else 120
    bgs = [.08, .2, .45, .8]; Q = {b: Quest(-3, 0, -1.5, beta=3) for b in bgs}
    spot = visual.Circle(win, radius=.5 * ppd, edges=96, pos=(0, 1.2 * ppd), lineWidth=0)
    try:
        message(win, 'A faint spot, a little brighter than the background, flashes above the cross in one of two intervals.\nWhich one: 1 or 2?\n\nSPACE to start.')
        for t in range(N):
            b = bgs[t % len(bgs)]; I = lin(b); wf = 10 ** Q[b].next(); first = random.random() < .5
            win.color = [2 * b - 1] * 3
            v = 2 * enc(min(1, I * (1 + wf))) - 1
            spot.fillColor = [v, v, v]
            a = two_ifc(win, lambda i: spot.draw() if (i == 0) == first else None, fps, dur=.15, dark=b > .4)
            ok = a == (0 if first else 1)
            Q[b].update(math.log10(wf), ok)
            w.writerow([t + 1, b, round(I, 5), round(wf, 5), int(ok)]); out.flush()
        for b in bgs:
            print('background %.2f: Weber fraction %.3f' % (b, 10 ** Q[b].mean()))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
