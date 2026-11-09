#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: SPEED DISCRIMINATION

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

McKee, S. P. (1981). A local mechanism for differential velocity detection. Vision Research, 21(4), 491-500.
De Bruyn, B., & Orban, G. A. (1988). Human velocity and direction discrimination measured with random dot patterns.
  Vision Research, 28(12), 1323-1335.

2IFC: two drifting vertical Gabors (sd 0.8 deg, contrast .5; base speed 2 or 6 deg/s split by a Weber fraction;
spatial frequency 1.5-2.5 c/deg, duration 0.3-0.5 s and direction randomised per interval so only speed is
informative). Which moved faster: 1 or 2? Two interleaved QUESTs on log10 Weber fraction.

Output: data/speed_<participant>_<date>.csv  columns: trial, base_deg_s, weber_fraction, faster_interval, response, correct

Run in PsychoPy Coder, or `python gc_speed.py`. Escape quits (data so far are saved).
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
    info, fn, out, w, win, ppd, fps = start('Speed discrimination', 'speed', ['trial', 'base_deg_s', 'weber_fraction', 'faster_interval', 'response', 'correct'], bg=.5)
    N = 50 if info['quick'] else 100
    bases = [2, 6]; Q = {b: Quest(-2, -.2, -1) for b in bases}
    g = visual.GratingStim(win, tex='sin', mask='gauss', size=4.8 * ppd, contrast=.5)
    num = visual.TextStim(win, '', pos=(0, win.size[1] / 2 - 60), height=26, color=[-1, -1, -1])
    try:
        message(win, 'Two drifting striped patches. Which moved FASTER: 1 or 2?\nDuration and stripe spacing vary on purpose.\n\nSPACE to start.', color=(-1, -1, -1))
        for t in range(N):
            b = bases[t % 2]; wf = 10 ** Q[b].next(); fast_first = random.random() < .5
            sp = [b * math.sqrt(1 + wf), b / math.sqrt(1 + wf)]; order = [0, 1] if fast_first else [1, 0]
            for i in (0, 1):
                num.text = str(i + 1)
                for _ in range(int(.5 * fps)):
                    num.draw(); win.flip()
                v, cpd, dur, d = sp[order[i]], random.uniform(1.5, 2.5), random.uniform(.3, .5), random.choice([-1, 1])
                g.sf, g.phase = cpd / ppd, random.random()
                for _ in range(int(round(dur * fps))):
                    g.phase += d * cpd * v / fps   # cycles per frame
                    g.draw(); num.draw(); win.flip()
            win.flip()
            k, _ = keys(['1', '2', 'num_1', 'num_2'])
            ok = (int(k[-1]) - 1) == (0 if fast_first else 1)
            Q[b].update(math.log10(wf), ok)
            w.writerow([t + 1, b, round(wf, 5), 1 if fast_first else 2, int(k[-1]), int(ok)]); out.flush()
        print('Weber fractions: %s' % ', '.join('%g deg/s %.1f%%' % (b, 100 * 10 ** Q[b].mean()) for b in bases))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
