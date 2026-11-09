#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: ADELSON'S CORRUGATED PLAID (PS 327 Lab 04)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Adelson, E. H. (1993). Perceptual organization and the judgment of brightness. Science, 262(5142), 2042-2044.

A plaid folded in depth puts the upper test patch on a lit face and the lower on a shadowed one; a control
figure has the same local neighbours but no consistent 3D reading (rotated 90 deg). Adjust the LOWER patch
until it matches the UPPER one in lightness: UP/DOWN lighter/darker, LEFT/RIGHT smaller/bigger steps,
SPACE when they match. Upper patch values 0.2, 0.4, 0.6, 0.8; 3 blocks per figure (1 if quick).

Grey levels are nominal: linearise your display (PsychoPy's monitor centre) if absolute values matter.
Run in PsychoPy Coder, or `python gc_adelson.py`. Escape quits (data so far are saved).
Output: data/adelson_<participant>_<date>.csv  columns: figure, block, upper_test_lum, lower_match_lum
"""
import os, csv, random, datetime
from psychopy import visual, core, event, gui

# ---- your setup ----
SCREEN = 0
FULLSCREEN = True
S = 1.15             # size scale (the console's)
QUICK = False

LUM = dict(BG=1, L=.8, M=.55, D=.4, DD=.2)
TESTS = [.2, .4, .6, .8]


class Quit(Exception):
    pass


def grey(v):
    return [2 * max(0, min(1, v)) - 1] * 3


def keys(names):
    k = event.waitKeys(keyList=list(names) + ['escape'])[0]
    if k == 'escape':
        raise Quit
    return k


def plaid(win, UT, LT, control):
    """plaid.m / drawatest / drawacontrol, in screen pixels with y down (flipped for PsychoPy)."""
    W, H = win.size
    x = 100 * S
    y, z = x / 1.5, x / 3
    o1, o2 = -z, z
    L, M, D, DD = LUM['L'], LUM['M'], LUM['D'], LUM['DD']
    polys = []

    def row(top, bottom, tl, tr, br, bl, cols, widths, rot):
        for i, c in enumerate(cols):
            polys.append(([rot(p) for p in [(tl, top), (tr, top), (br, bottom), (bl, bottom)]], c))
            if i < len(cols) - 1:
                tl += widths[i]
                tr += widths[i + 1]
                br += widths[i + 1]
                bl += widths[i]
    if not control:
        rh, cw = [x, y, y, y, x], [y] * 5
        T, Lf, rot = (H - (2 * x + 3 * y)) / 2, (W - 5 * y) / 2, (lambda p: p)
        C135, C2, C4 = [M, D, M, D, M], [L, M, UT, M, L], [D, DD, LT, DD, D]
        t = T
        row(t, t + rh[0], Lf, Lf + y, Lf + y, Lf, C135, cw, rot); t += rh[0]
        row(t, t + rh[1], Lf, Lf + y, Lf + y + o1, Lf + o1, C2, cw, rot); t += rh[1]
        row(t, t + rh[2], Lf + o1, Lf + y + o1, Lf + y + o1, Lf + o1, C135, cw, rot); t += rh[2]
        row(t, t + rh[3], Lf + o1, Lf + o1 + y, Lf + o1 + y + o2, Lf, C4, cw, rot); t += rh[3]
        row(t, t + rh[4], Lf, Lf + y, Lf + y, Lf, C135, cw, rot)
    else:
        rh, cw = [y] * 5, [x, y, y, y, x]
        T, Lf, cx, cy = (H - 5 * y) / 2, (W - (2 * x + 3 * y)) / 2, W / 2, H / 2
        rot = lambda p: (cx - (p[1] - cy), cy + (p[0] - cx))
        C1, C2, C3 = [M, L, M, D, M], [D, M, D, DD, D], [M, UT, M, LT, M]
        t = T
        row(t, t + rh[0], Lf, Lf + x, Lf + x, Lf, C1, cw, rot); t += rh[0]
        row(t, t + rh[1], Lf, Lf + x, Lf + x + o1, Lf + o1, C2, cw, rot); t += rh[1]
        row(t, t + rh[2], Lf + o1, Lf + x + o1, Lf + x + o1, Lf + o1, C3, cw, rot); t += rh[2]
        row(t, t + rh[3], Lf + o1, Lf + o1 + x, Lf + o1 + x + o2, Lf, C2, cw, rot); t += rh[3]
        row(t, t + rh[4], Lf, Lf + x, Lf + x, Lf, C1, cw, rot)
    for pts, c in polys:
        v = [(px - W / 2, H / 2 - py) for px, py in pts]
        visual.ShapeStim(win, vertices=v, fillColor=grey(c), lineColor=grey(c), lineWidth=1).draw()


def main():
    info = {'participant': '', 'quick': QUICK}
    if not gui.DlgFromDict(info, title="Adelson's corrugated plaid").OK:
        return
    n_blocks = 1 if info['quick'] else 3
    here = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(os.path.join(here, 'data'), exist_ok=True)
    fn = os.path.join(here, 'data', 'adelson_%s_%s.csv' % (info['participant'] or 'anon', datetime.datetime.now().strftime('%Y-%m-%d_%H%M')))
    out = open(fn, 'w', newline='')
    w = csv.writer(out)
    w.writerow(['figure', 'block', 'upper_test_lum', 'lower_match_lum'])
    win = visual.Window(fullscr=FULLSCREEN, screen=SCREEN, units='pix', color=grey(LUM['BG']), allowGUI=False)
    win.mouseVisible = False
    try:
        visual.TextStim(win, 'Adjust the LOWER small patch until it looks the same grey as the UPPER one.\n\n'
                             'UP / DOWN: lighter / darker.  LEFT / RIGHT: smaller / bigger steps.  SPACE: they match.\n\nSPACE to start.',
                        color=grey(0), height=24, wrapWidth=win.size[0] * .8).draw()
        win.flip()
        keys(['space'])
        figures = [False, True]
        random.shuffle(figures)
        for control in figures:
            for b in range(n_blocks):
                tests = TESTS[:]
                random.shuffle(tests)
                for UT in tests:
                    LT, step = random.randint(0, 100) / 100, .025
                    while True:
                        plaid(win, UT, LT, control)
                        win.flip()
                        k = keys(['up', 'down', 'left', 'right', 'space'])
                        if k == 'space':
                            break
                        if k == 'up':
                            LT = min(1, LT + step)
                        elif k == 'down':
                            LT = max(0, LT - step)
                        elif k == 'left':
                            step = max(.005, step - .005)
                        else:
                            step = min(.1, step + .005)
                    w.writerow(['control' if control else 'test', b + 1, UT, round(LT, 4)])
                    out.flush()
    except Quit:
        pass
    finally:
        out.close()
        win.close()
    print('Saved', fn)


if __name__ == '__main__':
    main()
    core.quit()
