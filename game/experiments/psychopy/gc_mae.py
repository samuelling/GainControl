#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: MOTION AFTEREFFECT (PS 327 Lab 05)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Addams, R. (1834). An account of a peculiar optical phaenomenon seen after having looked at a moving body.
  London and Edinburgh Philosophical Magazine and Journal of Science, 5(29), 373-374.
Blake, R., & Hiris, E. (1993). Another means for measuring the motion aftereffect. Vision Research, 33(11), 1589-1592.

MotionAfterDots: 1000 dots stream radially through an annulus (1-7 deg) for 20 s (adaptation, green), then
each trial is a 0.5 s red test in which a fraction of the dots ("correlation", 0-1) move outward and the rest
inward. D = inward, K = outward. 2 s top-up adaptation after every trial. Adapt to expansion (1), contraction (0)
or no net motion (0.5). After expansion, the test needs more outward dots to look outward: the PSE shifts up.

Run in PsychoPy Coder, or `python gc_mae.py`. Escape quits (data so far are saved).
Output: data/mae_<participant>_<date>.csv  columns: adapt_corr, block, test_corr, said_outward
"""
import os, csv, math, random, datetime  # noqa: F401 (not every script uses all)
import numpy as np
from psychopy import visual, core, event, gui

# ---- your setup ----
SCREEN = 0
FULLSCREEN = True
SCREEN_WIDTH_CM = 53.0   # visible width of the display
VIEW_DIST_CM = 57.0      # eyes to screen
QUICK = False            # True: 3 blocks instead of 10

P = dict(n_dots=1000, size_px=5, speed=6.0, ecc=(1, 7), tests=[i / 10 for i in range(11)], test_s=.5, adapt0=20, top_up=2, gap=.5)


class Quit(Exception):
    pass


def rgb(c):
    return [v / 127.5 - 1 for v in c]


def check_escape():
    if 'escape' in event.getKeys(['escape']):
        raise Quit


def main():
    info = {'participant': '', 'adapt to': ['expansion (1)', 'contraction (0)', 'no net motion (0.5)'], 'quick': QUICK}
    if not gui.DlgFromDict(info, title='Motion aftereffect').OK:
        return
    adapt = {'expansion (1)': 1.0, 'contraction (0)': 0.0, 'no net motion (0.5)': .5}[info['adapt to']]
    n_blocks = 3 if info['quick'] else 10
    here = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(os.path.join(here, 'data'), exist_ok=True)
    fn = os.path.join(here, 'data', 'mae_%s_%s.csv' % (info['participant'] or 'anon', datetime.datetime.now().strftime('%Y-%m-%d_%H%M')))
    out = open(fn, 'w', newline='')
    w = csv.writer(out)
    w.writerow(['adapt_corr', 'block', 'test_corr', 'said_outward'])
    win = visual.Window(fullscr=FULLSCREEN, screen=SCREEN, units='pix', color=rgb([0, 0, 0]), allowGUI=False, waitBlanking=True)
    win.mouseVisible = False
    ppd = win.size[0] / SCREEN_WIDTH_CM * 2 * VIEW_DIST_CM * math.tan(math.radians(.5))
    rmin, rmax, n = P['ecc'][0] * ppd, P['ecc'][1] * ppd, P['n_dots']
    dots = visual.ElementArrayStim(win, nElements=n, elementTex=None, elementMask=None, sizes=P['size_px'], units='pix')
    fix = visual.Rect(win, width=8, height=8, fillColor=rgb([255] * 3), lineWidth=0)
    fps = win.getActualFrameRate() or 60.0

    def play(corr, secs, col):
        r = rmin + np.random.rand(n) * (rmax - rmin)
        th = np.random.rand(n) * 2 * np.pi
        d = np.where(np.random.rand(n) < corr, 1.0, -1.0)
        dots.colors = rgb(col)
        step = P['speed'] * ppd / fps
        for _ in range(int(round(secs * fps))):
            r += d * step
            out_of = (r > rmax) | (r < rmin)
            k = out_of.sum()
            if k:   # re-place leaving dots anywhere in the annulus, uniform over area
                r[out_of] = np.sqrt(rmin ** 2 + np.random.rand(k) * (rmax ** 2 - rmin ** 2))
                th[out_of] = np.random.rand(k) * 2 * np.pi
            dots.xys = np.column_stack([r * np.cos(th), r * np.sin(th)])
            dots.draw()
            fix.draw()
            win.flip()
            check_escape()
        fix.draw()
        win.flip()

    try:
        visual.TextStim(win, 'Keep your eyes on the centre dot the whole time.\n\nGreen dots stream for a while: adaptation. Then red dots flash for half a second, '
                             'some moving in, some out.\nReport which way the RED dots went overall: D inward, K outward.\n\nSPACE to start.',
                        height=24, wrapWidth=win.size[0] * .8).draw()
        win.flip()
        if event.waitKeys(keyList=['space', 'escape'])[0] == 'escape':
            raise Quit
        play(adapt, P['adapt0'], [0, 255, 0])
        for b in range(n_blocks):
            order = P['tests'][:]
            random.shuffle(order)
            for c in order:
                fix.draw()
                win.flip()
                core.wait(P['gap'])
                play(c, P['test_s'], [255, 0, 0])
                event.clearEvents()
                k = event.waitKeys(keyList=['d', 'k', 'escape'])[0]
                if k == 'escape':
                    raise Quit
                w.writerow([adapt, b + 1, c, 1 if k == 'k' else 0])
                out.flush()
                play(adapt, P['top_up'], [0, 255, 0])
    except Quit:
        pass
    finally:
        out.close()
        win.close()
    print('Saved', fn)


if __name__ == '__main__':
    main()
    core.quit()
