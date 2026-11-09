#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: STEREOACUITY (RANDOM-DOT STEREOGRAMS)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Julesz, B. (1960). Binocular depth perception of computer-generated patterns. Bell System Technical Journal, 39(5), 1125-1162.
Westheimer, G. (1979). Cooperative neural processes involved in stereoscopic acuity. Experimental Brain Research, 36(4), 585-597.

Two random-dot patterns (3 px dots, 50% density), one per eye. Two square regions (120 px) left and right of centre; one
is shifted with crossed disparity (left eye's copy right, right eye's left) so it floats nearer. LEFT or RIGHT for the
nearer square. 2-down-1-up staircase on disparity in pixels (x0.75 down, x1.33 up, 2-40 px). Disparity in arcmin =
px * 60 / ppd. VIEW_MODE: 'anaglyph' (red/green or red/cyan glasses; RED_EYE says which eye has the red filter) or
'split' (side by side for a mirror stereoscope; SPLIT_SEP_PX between the two halves' centres).

Output: data/stereo_<participant>_<date>.csv  columns: trial, disparity_px, disparity_arcmin, nearer, correct

Run in PsychoPy Coder, or `python gc_stereo.py`. Escape quits (data so far are saved).
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


VIEW_MODE = 'anaglyph'   # or 'split'
RED_EYE = 'left'
SPLIT_SEP_PX = 600


def main():
    info, fn, out, w, win, ppd, fps = start('Stereoacuity', 'stereo', ['trial', 'disparity_px', 'disparity_arcmin', 'nearer', 'correct'], bg=0)
    N = 30 if info['quick'] else 60
    ES, el = 462, 3
    img = visual.ImageStim(win, image=np.zeros((ES, ES, 3)), size=(ES, ES), units='pix')
    dis, run, last, rev = 6.0, 0, 0, []
    try:
        message(win, 'Glasses on (or look through the stereoscope). Two squares hide in the dots; one floats NEARER.\nLEFT or RIGHT for the nearer square.\n\nSPACE to start.')
        for t in range(N):
            near = random.choice([-1, 1]); D = int(round(dis)); n = ES // el
            dots = np.random.rand(n, n) < .5
            base = np.kron(dots, np.ones((el, el)))
            def eye(sign):
                im = base.copy()
                for si, cxs in enumerate((ES // 2 - 110, ES // 2 + 110)):
                    if (si == 0) == (near < 0):
                        y0, x0 = ES // 2 - 60, cxs - 60
                        patch = base[y0:y0 + 120, x0:x0 + 120]
                        im[y0:y0 + 120, x0 + sign * D // 2:x0 + sign * D // 2 + 120] = patch
                return im
            L, R = eye(1), eye(-1)   # crossed disparity: the left eye's copy shifts right
            if VIEW_MODE == 'anaglyph':
                rgb = np.zeros((ES, ES, 3))
                rgb[..., 0] = (L if RED_EYE == 'left' else R)
                rgb[..., 1] = (R if RED_EYE == 'left' else L)
                img.image, img.pos = np.flipud(rgb * 2 - 1), (0, 0)
                img.draw()
            else:
                for im, x in ((L, -SPLIT_SEP_PX / 2), (R, SPLIT_SEP_PX / 2)):
                    img.image, img.pos = np.flipud(np.dstack([im] * 3) * 2 - 1), (x, 0)
                    img.draw()
            win.flip()
            k, _ = keys(['left', 'right'])
            ok = (k == 'left') == (near < 0)
            w.writerow([t + 1, D, round(D * 60 / ppd, 3), 'left' if near < 0 else 'right', int(ok)]); out.flush()
            d = 0
            if ok:
                run += 1
                if run >= 2:
                    run, d = 0, -1
            else:
                run, d = 0, 1
            if d:
                if last and d != last:
                    rev.append(dis)
                last = d; dis = max(2, min(40, dis * (.75 if d < 0 else 1.33)))
            win.flip(); core.wait(.3)
        thr = math.exp(np.mean(np.log(rev[-6:]))) if len(rev) >= 2 else dis
        print('Stereo threshold about %.0f arcsec' % (thr * 3600 / ppd))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
