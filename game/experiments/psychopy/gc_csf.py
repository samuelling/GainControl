#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: CONTRAST SENSITIVITY

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Campbell, F. W., & Robson, J. G. (1968). Application of Fourier analysis to the visibility of gratings.
  Journal of Physiology, 197(3), 551-566.

2IFC detection of a Gabor (4 deg patch, sd 0.9 deg) at 1-8 c/deg (0.5-8 in the full version), one 2-down-1-up staircase
per spatial frequency (70.7% correct), interleaved; 0.2 log steps, 0.1 after two reversals. Threshold = mean of the
reversals after the first two. Two 300 ms intervals, each marked by a tick and its number. Press 1 or 2.
Low contrasts need more than 8 bits: use a high bit-depth display mode (PsychoPy: a Bits#/VPixx device or
`win = visual.Window(..., bpc=(10, 10, 10))` on a 10-bit display) and a linearised gamma for real thresholds.

Output: data/csf_<participant>_<date>.csv  columns: sf_cpd, trial, contrast, interval, correct  (+ a summary printed)

Run in PsychoPy Coder, or `python gc_csf.py`. Escape quits (data so far are saved).
"""
import os, csv, math, random, datetime
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


def main():
    info, fn, out, w, win, ppd, fps = start('Contrast sensitivity', 'csf', ['sf_cpd', 'trial', 'contrast', 'interval', 'correct'], bg=.5)
    q = info['quick']
    SF, N = ([1, 2, 4, 8], 24) if q else ([.5, 1, 2, 4, 8], 40)
    st = [dict(sf=sf, lc=math.log10(.15), step=.2, run=0, last=0, rev=[]) for sf in SF]
    order = []
    for _ in range(N):
        o = list(range(len(SF))); random.shuffle(o); order += o
    fix = visual.Rect(win, width=6, height=6, fillColor=[-1, -1, -1], lineWidth=0)
    num = visual.TextStim(win, '', pos=(0, 110), height=20, color=[-1, -1, -1])
    tick = visual.Line(win, start=(-8, 130), end=(8, 130), lineColor=[-1, -1, -1], lineWidth=2)
    try:
        message(win, 'Two intervals, each marked by a number. A faint striped patch is in ONE of them.\nPress 1 or 2 for the interval that had it. Guess if unsure.\n\nSPACE to start.', color=(-1, -1, -1))
        for t, k in enumerate(order):
            S = st[k]; c = 10 ** S['lc']; which = random.choice([1, 2])
            g = visual.GratingStim(win, tex='sin', mask='gauss', size=4 * ppd, sf=S['sf'] / ppd, contrast=c, phase=random.random(), maskParams={'sd': 4 * ppd / (.9 * ppd) / 2})
            fix.draw(); win.flip(); core.wait(.5)
            for iv in (1, 2):
                num.text = str(iv)
                for _ in range(int(round(.3 * fps))):
                    if iv == which:
                        g.draw()
                    fix.draw(); num.draw(); tick.draw(); win.flip()
                fix.draw(); win.flip(); core.wait(.5)
            kk, _ = keys(['1', '2', 'num_1', 'num_2'])
            ok = int(kk[-1]) == which
            w.writerow([S['sf'], t + 1, round(c, 6), which, int(ok)]); out.flush()
            d = 0
            if ok:
                S['run'] += 1
                if S['run'] == 2:
                    S['run'], d = 0, -1
            else:
                S['run'], d = 0, 1
            if d:
                if S['last'] and d != S['last']:
                    S['rev'].append(S['lc'])
                    if len(S['rev']) == 2:
                        S['step'] = .1
                S['last'] = d
                S['lc'] = min(0, S['lc'] + d * S['step'])
        for S in st:
            r = S['rev'][2:] or [S['lc']]
            print('%.1f c/deg: threshold %.4f, sensitivity %.0f' % (S['sf'], 10 ** np.mean(r), 1 / 10 ** np.mean(r)))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
