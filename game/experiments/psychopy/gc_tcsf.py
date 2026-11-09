#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: FLICKER SENSITIVITY (DE LANGE)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

de Lange, H. (1958). Research into the dynamic nature of the human fovea-cortex systems with intermittent and modulated
  light. I. Attenuation characteristics with white and colored light. JOSA, 48(11), 777-784.
Kelly, D. H. (1961). Visual responses to time-dependent stimuli. I. Amplitude sensitivity measurements. JOSA, 51(4), 422-429.

2IFC: a 4 deg disc flickers (sinusoidal luminance modulation, raised-sine envelope over 0.6 s) in one interval.
Rates are chosen with a whole number of frames per cycle near 2, 4, 6, 10 and 15 Hz (at least 4 frames per cycle).
Interleaved QUESTs on log10 modulation contrast per rate. Use a linearised display.

Output: data/tcsf_<participant>_<date>.csv  columns: trial, rate_hz, refresh_hz, contrast, correct

Run in PsychoPy Coder, or `python gc_tcsf.py`. Escape quits (data so far are saved).
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
    info, fn, out, w, win, ppd, fps = start('Flicker sensitivity', 'tcsf', ['trial', 'rate_hz', 'refresh_hz', 'contrast', 'correct'], bg=.5)
    N = 75 if info['quick'] else 150
    hz = round(fps)
    rates = sorted(set(round(hz / max(4, round(hz / f)), 2) for f in (2, 4, 6, 10, 15)))
    Q = {r: Quest(-2.5, 0, -1.5, beta=3) for r in rates}
    disc = visual.Circle(win, radius=2 * ppd, edges=128, lineWidth=0, fillColor=[0, 0, 0])
    num = visual.TextStim(win, '', pos=(0, win.size[1] / 2 - 60), height=26, color=[-1, -1, -1])
    try:
        message(win, 'A disc flickers faintly in one of two intervals. Which one: 1 or 2?\n\nSPACE to start.', color=(-1, -1, -1))
        for t in range(N):
            r = rates[t % len(rates)]; c = 10 ** Q[r].next(); first = random.random() < .5; fpc = round(hz / r); nf = round(hz * .6)
            for i in (0, 1):
                num.text = str(i + 1)
                for _ in range(int(.5 * fps)):
                    num.draw(); win.flip()
                on = (i == 0) == first
                for f in range(nf):
                    v = c * math.sin(math.pi * f / nf) * math.sin(2 * math.pi * f / fpc) if on else 0
                    disc.fillColor = [v, v, v]; disc.draw(); num.draw(); win.flip()
            win.flip()
            k, _ = keys(['1', '2', 'num_1', 'num_2'])
            ok = (int(k[-1]) - 1) == (0 if first else 1)
            Q[r].update(math.log10(c), ok)
            w.writerow([t + 1, r, hz, round(c, 5), int(ok)]); out.flush()
        for r in rates:
            print('%.2f Hz: sensitivity %.0f' % (r, 1 / 10 ** Q[r].mean()))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
