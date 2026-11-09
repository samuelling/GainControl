#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: TILT AFTEREFFECT

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Gibson, J. J., & Radner, M. (1937). Adaptation, after-effect and contrast in the perception of tilted lines. I.
  Quantitative studies. Journal of Experimental Psychology, 20(5), 453-467.
Clifford, C. W. G., Wenderoth, P., & Spehar, B. (2000). A functional angle on some after-effects in cortical vision.
  Proceedings of the Royal Society B, 267(1454), 1705-1710.

Baseline: a test Gabor (1.5 c/deg, sd 1.4 deg) flashes 150 ms; LEFT/RIGHT for its tilt from vertical; a 1-up-1-down
staircase (1 deg steps, 0.5 after two reversals) finds subjective vertical. Then 30 s adaptation to a 15 deg clockwise
Gabor (counterphasing at 1 Hz), 4 s top-ups before each test. Aftereffect = adapted PSE - baseline PSE.

Output: data/tae_<participant>_<date>.csv  columns: block, test, tilt_deg_cw, response

Run in PsychoPy Coder, or `python gc_tae.py`. Escape quits (data so far are saved).
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
    info, fn, out, w, win, ppd, fps = start('Tilt aftereffect', 'tae', ['block', 'test', 'tilt_deg_cw', 'response'], bg=.5)
    NT = 24 if info['quick'] else 40
    fix = visual.Rect(win, width=6, height=6, fillColor=[-1, -1, -1], lineWidth=0)
    adapter = visual.GratingStim(win, tex='sin', mask='gauss', size=8.4 * ppd, sf=1.5 / ppd, ori=15, contrast=.9)
    test = visual.GratingStim(win, tex='sin', mask='gauss', size=8.4 * ppd, sf=1.5 / ppd, contrast=.9)
    res = {}

    def adapt(secs):
        for f in range(int(round(secs * fps))):
            adapter.phase = 0 if (f / fps) % 1 < .5 else .5
            adapter.draw(); fix.draw(); win.flip()
    try:
        message(win, 'Is the striped patch tilted LEFT or RIGHT of vertical? Arrow keys.\nFirst a baseline, then 30 s staring at the dot on a tilted grating.\n\nSPACE to start.', color=(-1, -1, -1))
        for block in ('baseline', 'adapted'):
            if block == 'adapted':
                adapt(30)
            tilt, last, rev = (0 if block == 'adapted' else 2), 0, []
            for t in range(NT):
                if block == 'adapted':
                    adapt(4)
                fix.draw(); win.flip(); core.wait(.25)
                test.ori, test.phase = tilt, random.random()
                for _ in range(int(round(.15 * fps))):
                    test.draw(); fix.draw(); win.flip()
                fix.draw(); win.flip()
                k, _ = keys(['left', 'right'])
                w.writerow([block, t + 1, tilt, k]); out.flush()
                d = -1 if k == 'right' else 1
                if last and d != last:
                    rev.append(tilt)
                last = d
                tilt = max(-10, min(10, tilt + d * (1 if len(rev) < 2 else .5)))
            res[block] = np.mean(rev[-6:]) if len(rev) >= 2 else tilt
        print('Subjective vertical: baseline %.2f, adapted %.2f; aftereffect %.2f deg' % (res['baseline'], res['adapted'], res['adapted'] - res['baseline']))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
