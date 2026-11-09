#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: HORIZONTAL-VERTICAL ILLUSION (PS 327 Lab 01)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Fick, A. (1851). De errore quodam optico asymmetria bulbi effecto. Marburg: J. A. Koch.
Stevens, S. S. (1957). On the psychophysical law. Psychological Review, 64(3), 153-181.

Magnitude estimation of line length. A standard horizontal line is 100; each test line (70-130 px,
horizontal or vertical) flashes for 1 s, then you type a number for how long it looked. Vertical lines
usually get bigger numbers than horizontal ones of the same length.

Run in PsychoPy Coder, or `python gc_hv.py`. Escape quits (data so far are saved).
Output: data/hv_<participant>_<date>.csv  columns: block, line_length, line_angle, estimate
Lengths are the original lab's pixel values times SCALE.
"""
import os, csv, math, random, datetime
from psychopy import visual, core, event, gui

# ---- your setup ----
SCREEN = 0
FULLSCREEN = True
SCALE = 2            # original lab pixels -> screen pixels (the console uses 2)
QUICK = False        # True: 2 blocks instead of 4

P = dict(standard=100, lengths=[70, 80, 90, 100, 110, 120, 130], angles=[0, 90], n_blocks=4, pen=4,
         trial_s=1.0, blank_s=1.0)


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
    visual.TextStim(win, text, color=rgb([255, 255, 255]), height=28, wrapWidth=win.size[0] * .8).draw()
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
    """PrecomputeLineME: line of length L (orig px) at angle A (deg), arrow fins aL long at aA (deg re inward)."""
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


def main():
    info = {'participant': '', 'quick': QUICK}
    if not gui.DlgFromDict(info, title='Horizontal-vertical illusion').OK:
        return
    n_blocks = 2 if info['quick'] else P['n_blocks']
    os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data'), exist_ok=True)
    fn = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data',
                      'hv_%s_%s.csv' % (info['participant'] or 'anon', datetime.datetime.now().strftime('%Y-%m-%d_%H%M')))
    out = open(fn, 'w', newline='')
    w = csv.writer(out)
    w.writerow(['block', 'line_length', 'line_angle', 'estimate'])
    win = visual.Window(fullscr=FULLSCREEN, screen=SCREEN, units='pix', color=rgb([0, 0, 0]), allowGUI=False)
    win.mouseVisible = False
    white = [255, 255, 255]
    try:
        message(win, 'A line flashes for a second, horizontal or vertical.\n\nThe standard line counts as 100. After each line, '
                     'type a number for how long it looked: twice as long is 200, half as long is 50.\n\nSPACE to start.')

        def show_standard():
            draw_line(win, line_parts(P['standard'], 0, 0, 0), P['pen'], white, white)
            visual.TextStim(win, 'This is 100. SPACE to go on.', pos=(0, -150), height=24, color=rgb([180, 180, 180])).draw()
            win.flip()
            keys(['space'])

        show_standard()
        for b in range(n_blocks):
            conds = [(L, A) for A in P['angles'] for L in P['lengths']]
            random.shuffle(conds)
            for L, A in conds:
                draw_line(win, line_parts(L, A, 20, 0), P['pen'], white, white)
                win.flip()
                core.wait(P['trial_s'])
                win.flip()
                core.wait(P['blank_s'])
                est = type_number(win, 'Your estimate? (The standard is 100.)')
                w.writerow([b + 1, L, A, est])
                out.flush()
            if b < n_blocks - 1:
                show_standard()
        message(win, 'Done. Thank you!\n\nData: ' + os.path.basename(fn), wait=False)
        core.wait(2)
    except Quit:
        pass
    finally:
        out.close()
        win.close()
    print('Saved', fn)


if __name__ == '__main__':
    main()
    core.quit()
