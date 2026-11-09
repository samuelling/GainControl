#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: MULLER-LYER ILLUSION (PS 327 Lab 02)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Müller-Lyer, F. C. (1889). Optische Urtheilstäuschungen. Archiv für Anatomie und Physiologie,
Physiologische Abtheilung, Supplement-Band, 263-270.

Three methods, as in the lab:
  estimation  magnitude estimation of oblique lines with fins in (<->) or out (>-<), two colour schemes
  adjust      stretch a fins-in line (right) to match a 100 px fins-out standard (left); UP/DOWN, LEFT fine, RIGHT coarse, SPACE
  pse         constant stimuli: fins-in test 100-140 px vs fins-out standard 100; D = left longer, K = right longer

Run in PsychoPy Coder, or `python gc_ml.py`. Escape quits (data so far are saved).
Output: data/ml_<method>_<participant>_<date>.csv (same columns as the console's CSVs)
"""
import os, csv, math, random, datetime
from psychopy import visual, core, event, gui

# ---- your setup ----
SCREEN = 0
FULLSCREEN = True
SCALE = 2            # original lab pixels -> screen pixels (the console uses 2)
QUICK = False        # True: half the blocks


class Quit(Exception):
    pass


def rgb(c):
    return [v / 127.5 - 1 for v in c]


def keys(names, clock=None):
    event.clearEvents()
    k = event.waitKeys(keyList=list(names) + ['escape'], timeStamped=clock or core.Clock())[0]
    if k[0] == 'escape':
        raise Quit
    return k


def message(win, text, wait=True):
    visual.TextStim(win, text, color=rgb([255, 255, 255]), height=26, wrapWidth=win.size[0] * .8).draw()
    win.flip()
    if wait:
        keys(['space', 'return'])


def type_number(win, prompt):
    s = ''
    while True:
        visual.TextStim(win, prompt, pos=(0, 60), height=26, color=rgb([200, 200, 200])).draw()
        visual.TextStim(win, s + '_', pos=(0, -10), height=40, color=rgb([255, 255, 255])).draw()
        win.flip()
        k = keys([str(d) for d in range(10)] + ['period', 'backspace', 'return', 'num_enter'] + ['num_%d' % d for d in range(10)])[0]
        if k in ('return', 'num_enter'):
            if s and s != '.':
                return float(s)
        elif k == 'backspace':
            s = s[:-1]
        elif k == 'period':
            s += '.' if '.' not in s else ''
        elif len(s) < 6:
            s += k[-1]


def line_parts(L, A, aL, aA, h_off=0.0):
    """PrecomputeLineME: length L at angle A (deg, y up), fins aL long at aA (45 = fins in <->, 135 = fins out >-<)."""
    r = math.radians
    hl, vl = L / 2 * math.cos(r(A)) * SCALE, L / 2 * math.sin(r(A)) * SCALE
    f, t = (-hl + h_off, -vl), (hl + h_off, vl)
    fins = []
    if aA:
        a = aL * SCALE
        p = lambda o, ang: (o[0] + a * math.cos(r(ang)), o[1] + a * math.sin(r(ang)))
        fins = [(f, p(f, A + aA)), (f, p(f, A - aA)), (t, p(t, A + 180 - aA)), (t, p(t, A + 180 + aA))]
    return f, t, fins


def draw_line(win, parts, pen, line_col, arrow_col):
    f, t, fins = parts
    visual.Line(win, start=f, end=t, lineWidth=pen * SCALE / 1.5, lineColor=rgb(line_col)).draw()
    for a, b in fins:
        visual.Line(win, start=a, end=b, lineWidth=pen * SCALE / 1.5, lineColor=rgb(arrow_col)).draw()


def estimation(win, w, quick):
    lengths, n_blocks = [70, 80, 90, 100, 110, 120, 130], 2 if quick else 4
    colors = [dict(bg=[64, 64, 64], line=[255, 255, 255], arrow=[255, 255, 64]), dict(bg=[128, 128, 0], line=[255, 255, 64], arrow=[255, 255, 255])]
    w.writerow(['block', 'line_length', 'arrow_angle', 'color_cond', 'estimate'])
    bg = visual.Rect(win, width=win.size[0], height=win.size[1], lineWidth=0)

    def standard():
        draw_line(win, line_parts(100, 0, 0, 0), 4, [255] * 3, [255] * 3)
        visual.TextStim(win, 'This is 100. SPACE to go on.', pos=(0, -150), height=24).draw()
        win.flip()
        keys(['space'])
    message(win, 'Lines with arrowheads or tails flash for a second. Type a number for how long each LINE looked,\n'
                 'where the standard is 100. Judge the line, not the fins.\n\nSPACE to start.')
    standard()
    for b in range(n_blocks):
        conds = [(L, aA, cc) for aA in (45, 135) for L in lengths for cc in (0, 1)]
        random.shuffle(conds)
        for L, aA, cc in conds:
            col = colors[cc]
            bg.fillColor = rgb(col['bg'])
            bg.draw()
            draw_line(win, line_parts(L, 45, 30, aA), 4, col['line'], col['arrow'])
            win.flip()
            core.wait(1.0)
            win.flip()
            core.wait(1.0)
            w.writerow([b + 1, L, aA, cc + 1, type_number(win, 'Your estimate? (The standard is 100.)')])
        if b < n_blocks - 1:
            standard()


def adjust(win, w, quick):
    n_blocks = 2 if quick else 3
    w.writerow(['block', 'start_length', 'match_length'])
    message(win, 'Make the RIGHT line look as long as the LEFT one.\n\nUP / DOWN: longer / shorter.  LEFT: fine steps (1 px).  RIGHT: coarse (5 px).\nSPACE accepts.\n\nSPACE to start.')
    for b in range(n_blocks):
        starts = [80, 100, 120]
        random.shuffle(starts)
        for L0 in starts:
            L, step, jit = L0, 5, random.uniform(-100, 100)
            while True:
                draw_line(win, line_parts(100, 90, 30, 135, -100 * SCALE / 2 + jit), 4, [0, 255, 0], [255] * 3)
                draw_line(win, line_parts(L, 90, 30, 45, 100 * SCALE / 2 + jit), 4, [0, 255, 0], [255] * 3)
                win.flip()
                k = keys(['up', 'down', 'left', 'right', 'space'])[0]
                if k == 'space':
                    break
                if k == 'up':
                    L += step
                elif k == 'down':
                    L = max(10, L - step)
                elif k == 'left':
                    step = 1
                else:
                    step = 5
            w.writerow([b + 1, L0, L])


def pse(win, w, quick):
    lens, n_blocks = list(range(100, 141, 5)), 4 if quick else 8
    w.writerow(['block', 'test_length', 'test_longer'])
    message(win, 'Which line looks longer? D for the left one, K for the right one.\n\nSPACE to start.')
    data = []
    for b in range(n_blocks):
        order = lens[:]
        random.shuffle(order)
        for L in order:
            jit = random.uniform(-100, 100)
            draw_line(win, line_parts(100, 90, 30, 135, -50 * SCALE + jit), 4, [0, 255, 0], [255] * 3)
            draw_line(win, line_parts(L, 90, 30, 45, 50 * SCALE + jit), 4, [0, 255, 0], [255] * 3)
            win.flip()
            right = 1 if keys(['d', 'k'])[0] == 'k' else 0
            w.writerow([b + 1, L, right])
            data.append((L, right))
            win.flip()
            core.wait(.1)
    # a quick PSE: where P(test longer) crosses 0.5, by linear interpolation of the proportions
    ps = [(L, sum(r for l, r in data if l == L) / max(1, sum(1 for l, r in data if l == L))) for L in lens]
    for (l0, p0), (l1, p1) in zip(ps, ps[1:]):
        if p0 < .5 <= p1:
            print('PSE about %.1f px (illusion %.1f px)' % (l0 + (.5 - p0) / (p1 - p0) * (l1 - l0), l0 + (.5 - p0) / (p1 - p0) * (l1 - l0) - 100))
            break


def main():
    info = {'participant': '', 'method': ['estimation', 'adjust', 'pse'], 'quick': QUICK}
    if not gui.DlgFromDict(info, title='Muller-Lyer illusion').OK:
        return
    here = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(os.path.join(here, 'data'), exist_ok=True)
    fn = os.path.join(here, 'data', 'ml_%s_%s_%s.csv' % (info['method'], info['participant'] or 'anon', datetime.datetime.now().strftime('%Y-%m-%d_%H%M')))
    out = open(fn, 'w', newline='')
    w = csv.writer(out)
    win = visual.Window(fullscr=FULLSCREEN, screen=SCREEN, units='pix', color=rgb([0, 0, 0]), allowGUI=False)
    win.mouseVisible = False
    try:
        {'estimation': estimation, 'adjust': adjust, 'pse': pse}[info['method']](win, w, info['quick'])
        message(win, 'Done. Thank you!', wait=False)
        core.wait(1.5)
    except Quit:
        pass
    finally:
        out.close()
        win.close()
    print('Saved', fn)


if __name__ == '__main__':
    main()
    core.quit()
