#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: HUE ARRANGEMENT (D-15 STYLE)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Farnsworth, D. (1947). The Farnsworth Dichotomous Test for Color Blindness, Panel D-15. New York: Psychological Corporation.
Vingrys, A. J., & King-Smith, P. E. (1988). A quantitative scoring technique for panel tests of color vision.
  Investigative Ophthalmology & Visual Science, 29(1), 50-63.

A reference cap and fifteen loose caps of equal CIELAB lightness (L* 60, chroma 32) stepping round the hue circle
(sRGB, uncalibrated). Click the cap closest to the last one in the row until all are placed; BACKSPACE undoes. Score
offline with Vingrys & King-Smith's moments of inertia (confusion angle and index). A demonstration of the method,
not a diagnosis: real panel tests need calibrated colours and standard illumination.

Output: data/hues_<participant>_<date>.csv  columns: position, cap_number

Run in PsychoPy Coder, or `python gc_hues.py`. Escape quits (data so far are saved).
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


def lch_to_rgb(L, C, h):
    a, b = C * math.cos(h), C * math.sin(h)
    fy = (L + 16) / 116; fx, fz = fy + a / 500, fy - b / 200
    inv = lambda t: t ** 3 if t ** 3 > .008856 else (t - 16 / 116) / 7.787
    X, Y, Z = inv(fx) * .95047, inv(fy), inv(fz) * 1.08883
    rgb = (3.2406 * X - 1.5372 * Y - .4986 * Z, -.9689 * X + 1.8758 * Y + .0415 * Z, .0557 * X - .2040 * Y + 1.0570 * Z)
    e = lambda v: max(0, min(1, 12.92 * v if v <= .0031308 else 1.055 * v ** (1 / 2.4) - .055))
    return [2 * e(v) - 1 for v in rgb]


def main():
    info, fn, out, w, win, ppd, fps = start('Hue arrangement', 'hues', ['position', 'cap_number'], bg=.12)
    ref = lch_to_rgb(60, 32, 4.2)
    caps = [lch_to_rgb(60, 32, 4.2 - (i + 1) * 2 * math.pi / 17) for i in range(15)]
    order = list(range(15)); random.shuffle(order)
    W, H = win.size; R = 22
    pos_row = lambda k: (-W / 2 + 70 + k * 54, 90)
    pos_loose = lambda j: (-W / 2 + 70 + (j % 8) * 108 + (54 if j >= 8 else 0), -80 - (90 if j >= 8 else 0))
    mouse = event.Mouse(win=win, visible=True); row = []
    try:
        message(win, 'Click the loose cap closest in colour to the last cap in the row, then the next closest, until the row is full.\nBACKSPACE takes one back. (Uncalibrated colours: a demonstration, not a test.)\n\nSPACE to start.')
        win.mouseVisible = True
        while len(row) < 15:
            visual.Circle(win, radius=R, edges=48, pos=pos_row(0), fillColor=ref, lineColor=[.83, .8, 1], lineWidth=2).draw()
            for k, i in enumerate(row):
                visual.Circle(win, radius=R, edges=48, pos=pos_row(k + 1), fillColor=caps[i], lineWidth=0).draw()
            for j, i in enumerate(order):
                if i not in row:
                    visual.Circle(win, radius=R, edges=48, pos=pos_loose(j), fillColor=caps[i], lineWidth=0).draw()
            win.flip()
            ks = event.getKeys(['backspace', 'escape'])
            if 'escape' in ks:
                raise Quit
            if 'backspace' in ks and row:
                row.pop()
            if mouse.getPressed()[0]:
                mx, my = mouse.getPos()
                while mouse.getPressed()[0]:
                    pass
                for j, i in enumerate(order):
                    px, py_ = pos_loose(j)
                    if i not in row and math.hypot(mx - px, my - py_) < R + 6:
                        row.append(i); break
        for k, i in enumerate(row):
            w.writerow([k + 1, i + 1])
        print('Order:', ' '.join(str(i + 1) for i in row))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
