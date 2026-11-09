#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: ATTENTION ALTERS APPEARANCE

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Carrasco, M., Ling, S., & Read, S. (2004). Attention alters appearance. Nature Neuroscience, 7(3), 308-313. (Experiment 2)

Two Gabors (2 deg, 2 or 4 c/deg, each tilted 45 deg left or right) at 4 deg left and right of fixation. A 0.3 deg black
dot flashes for 67 ms 1.5 deg above one of them (an uninformative peripheral cue) or at fixation (neutral); 53 ms later
the Gabors appear for 40 ms. One is the standard (22% contrast), the other the test (6-79%). Report the tilt of the
Gabor that looked HIGHER IN CONTRAST: left patch Z (tilted left) / X (tilted right); right patch . (left) / / (right).
Cueing the test lowers its point of subjective equality (in the paper, a cued 16% test matched the 22% standard).

Output: data/carrasco_<participant>_<date>.csv
  columns: trial, cue, test_contrast, test_left, sf_cpd, chose_test, tilt_correct, rt_ms

Run in PsychoPy Coder, or `python gc_carrasco.py`. Escape quits (data so far are saved).
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
    info, fn, out, w, win, ppd, fps = start('Attention alters appearance', 'carrasco',
        ['trial', 'cue', 'test_contrast', 'test_left', 'sf_cpd', 'chose_test', 'tilt_correct', 'rt_ms'], bg=.5)
    q = info['quick']
    levels = list(np.geomspace(.06, .79, 7 if q else 9)); reps = 4 if q else 10
    trials = [(c, cue) for _ in range(reps) for c in levels for cue in ('neutral', 'test', 'standard')]
    random.shuffle(trials)
    F = lambda ms: max(1, int(round(ms / 1000 * fps)))
    fix = visual.Rect(win, width=6, height=6, fillColor=[-1, -1, -1], lineWidth=0)
    dot = visual.Circle(win, radius=.15 * ppd, edges=32, fillColor=[-1, -1, -1], lineWidth=0)
    ecc = 4 * ppd
    gab = lambda x, c, sf, ori: visual.GratingStim(win, tex='sin', mask='gauss', size=2 * ppd, sf=sf / ppd, ori=ori, contrast=c,
                                                  phase=random.random(), pos=(x, 0), maskParams={'sd': 3})
    try:
        message(win, 'Keep your eyes on the small square in the centre. A dot flashes, then two striped patches.\n\n'
                     'Which patch looked HIGHER IN CONTRAST? Report ITS tilt:\nleft patch Z (tilted left) or X (tilted right);  right patch . (left) or / (right).\n\n'
                     'The dot tells you nothing about the answer. SPACE to start.', color=(-1, -1, -1))
        for t, (c, cue) in enumerate(trials):
            test_left, sf = random.random() < .5, random.choice([2, 4])
            ori_l, ori_r = random.choice([-45, 45]), random.choice([-45, 45])
            c_l, c_r = (c, .22) if test_left else (.22, c)
            for _ in range(F(500)):
                fix.draw(); win.flip()
            side = 0 if cue == 'neutral' else (-1 if (cue == 'test') == test_left else 1)
            dot.pos = (side * ecc, 1.5 * ppd if side else 0)
            for _ in range(F(67)):
                fix.draw(); dot.draw(); win.flip()
            for _ in range(F(53)):
                fix.draw(); win.flip()
            gl, gr = gab(-ecc, c_l, sf, ori_l), gab(ecc, c_r, sf, ori_r)
            for _ in range(F(40)):
                gl.draw(); gr.draw(); fix.draw(); win.flip()
            fix.draw()
            clock = core.Clock(); win.callOnFlip(clock.reset); win.flip()
            k, rt = keys(['z', 'x', 'period', 'slash'], clock)
            chose_left = k in ('z', 'x')
            said = -45 if k in ('z', 'period') else 45
            w.writerow([t + 1, cue, round(c, 5), int(test_left), sf, int(chose_left == test_left), int(said == (ori_l if chose_left else ori_r)), round(rt * 1000, 1)])
            out.flush()
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
