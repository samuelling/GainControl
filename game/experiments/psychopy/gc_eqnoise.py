#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: EQUIVALENT NOISE (LU & DOSHER)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Lu, Z.-L., & Dosher, B. A. (1998). External noise distinguishes attention mechanisms. Vision Research, 38(9), 1183-1198.
Lu, Z.-L., & Dosher, B. A. (2008). Characterizing observers using external noise and observer models: Assessing internal
  representations with external noise. Psychological Review, 115(1), 44-82.
Pelli, D. G., & Farell, B. (1999). Why use noise? JOSA A, 16(3), 647-653.

Orientation identification (+/-12 deg from vertical) of a Gabor (2 c/deg, sd 0.35 deg) embedded in Gaussian pixel noise
(2 x 2 px elements, sd 0, .02, .04, .08, .12, .16, .25, .33, clipped at +/-.5). Each trial is a temporal sandwich of
five 2-frame images: noise, noise, signal + noise, noise, noise. Two staircases per noise level (2-down-1-up, 70.7%;
3-down-1-up, 79.4%) on log10 contrast, 0.1 log steps (0.05 after two reversals), all interleaved. Fit the perceptual
template model to the threshold-vs-noise curves offline (see Lu & Dosher, 2008). Needs a linearised display.

Output: data/eqnoise_<participant>_<date>.csv  columns: trial, external_noise_sd, target_accuracy, contrast, tilt_deg, correct

Run in PsychoPy Coder, or `python gc_eqnoise.py`. Escape quits (data so far are saved).
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
    info, fn, out, w, win, ppd, fps = start('Equivalent noise', 'eqnoise', ['trial', 'external_noise_sd', 'target_accuracy', 'contrast', 'tilt_deg', 'correct'], bg=.5)
    NE = [0, .02, .04, .08, .12, .16, .25, .33]; per = 15 if info['quick'] else 30
    S = [dict(n=n, k=k, lc=math.log10(max(.15, n * 1.5) if n else .15), run=0, last=0, rev=[]) for n in NE for k in (2, 3)]
    order = [s for s in S for _ in range(per)]
    random.shuffle(order)
    sig = .35 * ppd; n = int(math.ceil(sig * 3)) * 2 + 1; n += n % 2   # even, for the 2 x 2 noise elements
    yy, xx = np.mgrid[0:n, 0:n] - (n - 1) / 2
    env = np.exp(-(xx ** 2 + yy ** 2) / (2 * sig ** 2)) * ((xx ** 2 + yy ** 2) < ((n - 1) / 2) ** 2)
    disc = ((xx ** 2 + yy ** 2) < ((n - 1) / 2) ** 2).astype(float)
    img = visual.ImageStim(win, image=np.zeros((n, n)), size=(n, n), units='pix', colorSpace='rgb')
    fix = visual.Rect(win, width=6, height=6, fillColor=[-1, -1, -1], lineWidth=0)

    def frame(c, sd, ori):
        th = math.radians(ori)
        g = c * env * np.sin(2 * np.pi * 2 / ppd * (xx * math.cos(th) + yy * math.sin(th)))
        nz = np.clip(sd * np.random.randn(n // 2, n // 2), -.5, .5).repeat(2, 0).repeat(2, 1) if sd else 0
        return np.clip(g + nz * disc, -1, 1)   # PsychoPy images: -1..1 around mean grey (0)
    try:
        message(win, 'A small striped patch flashes in a burst of noise, tilted LEFT or RIGHT of vertical.\nPress LEFT or RIGHT. Guess when unsure.\n\nSPACE to start.', color=(-1, -1, -1))
        for t, s in enumerate(order):
            c = min(1, 10 ** s['lc']); ori = random.choice([-12, 12])
            frames = [frame(c if k == 2 else 0, s['n'], ori) for k in range(5)]
            fix.draw(); win.flip(); core.wait(.35)
            for f in frames:
                img.image = np.flipud(f)
                for _ in range(2):
                    img.draw(); win.flip()
            fix.draw(); win.flip()
            k, _ = keys(['left', 'right'])
            ok = (k == 'right') == (ori > 0)
            w.writerow([t + 1, s['n'], .707 if s['k'] == 2 else .794, round(c, 5), ori, int(ok)]); out.flush()
            step = .05 if len(s['rev']) >= 2 else .1; d = 0
            if ok:
                s['run'] += 1
                if s['run'] >= s['k']:
                    s['run'], d = 0, -1
            else:
                s['run'], d = 0, 1
            if d:
                if s['last'] and d != s['last']:
                    s['rev'].append(s['lc'])
                s['last'] = d; s['lc'] = min(0, max(-2.7, s['lc'] + d * step))
        for s in S:
            r = s['rev'][-6:] if len(s['rev']) >= 3 else [s['lc']]
            print('noise %.2f, %s: threshold %.4f' % (s['n'], '70.7%' if s['k'] == 2 else '79.4%', 10 ** np.mean(r)))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
