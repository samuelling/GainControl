#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: VISUAL SEARCH (PS 327 Lab 03)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Treisman, A. M., & Gelade, G. (1980). A feature-integration theory of attention. Cognitive Psychology, 12(1), 97-136.

Find the target: K if it's there, D if it isn't, as fast as you can. Three searches, as in the lab
(PopoutSearch / ConjunctionSearch / LineSearch):
  popout  a red B among green As                         set sizes 2, 4, 8, 16 (10 blocks)
  conj    a red B among green Bs and red As              set sizes 2, 4, 8, 16 (10 blocks)
  line    a line tilted 15 deg among vertical lines      set sizes 5, 10, 15, 20 (3 blocks)
Each set size appears with the target present and absent once per block, in random order.

Run in PsychoPy Coder, or `python gc_search.py`. Escape quits (data so far are saved).
Output: data/search_<kind>_<participant>_<date>.csv  columns: block, set_size, n_a, n_b, present, said_present, rt_ms
"""
import os, csv, math, random, datetime
from psychopy import visual, core, event, gui

# ---- your setup ----
SCREEN = 0
FULLSCREEN = True
SCALE = 1.2          # original lab pixels -> screen pixels (the console uses 1.2)
QUICK = False        # True: a quarter of the blocks (at least 2)

COND = {
    'popout': dict(what='a red B among green As', A=[('A', (0, 255, 0))], B=[('A', (0, 255, 0))], target=('B', (255, 0, 0)), nA=[1, 2, 4, 8], nB=[1, 2, 4, 8], blocks=10, fix=.5),
    'conj': dict(what='a red B among green Bs and red As', A=[('A', (0, 255, 0)), ('A', (255, 0, 0))], B=[('B', (0, 255, 0))], target=('B', (255, 0, 0)), nA=[1, 2, 4, 8], nB=[1, 2, 4, 8], blocks=10, fix=.5),
    'line': dict(what='a line tilted 15 degrees among vertical lines', line=True, nA=[5, 10, 15, 20], nB=[0, 0, 0, 0], blocks=3, fix=.25),
}
R, ITEM = 200 * SCALE, 30 * SCALE    # display radius and item size


class Quit(Exception):
    pass


def rgb(c):
    return [v / 127.5 - 1 for v in c]


def keys(names, clock=None):
    k = event.waitKeys(keyList=list(names) + ['escape'], timeStamped=clock or core.Clock())[0]
    if k[0] == 'escape':
        raise Quit
    return k


def message(win, text, wait=True):
    visual.TextStim(win, text, color=rgb([255, 255, 255]), height=26, wrapWidth=win.size[0] * .8).draw()
    win.flip()
    if wait:
        event.clearEvents()
        keys(['space', 'return'])


def positions(n):
    out, tries = [], 0
    while len(out) < n and tries < 5000:
        tries += 1
        r, a = R * math.sqrt(random.random()), random.random() * 2 * math.pi
        x, y = r * math.cos(a), r * math.sin(a)
        if math.hypot(x, y) < ITEM and n > 1:
            continue
        if all(math.hypot(px - x, py - y) > ITEM * 1.5 for px, py in out):
            out.append((x, y))
    return out


def main():
    info = {'participant': '', 'search': ['popout', 'conj', 'line'], 'quick': QUICK}
    if not gui.DlgFromDict(info, title='Visual search').OK:
        return
    C = COND[info['search']]
    n_blocks = max(2, C['blocks'] >> 2) if info['quick'] else C['blocks']
    here = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(os.path.join(here, 'data'), exist_ok=True)
    fn = os.path.join(here, 'data', 'search_%s_%s_%s.csv' % (info['search'], info['participant'] or 'anon', datetime.datetime.now().strftime('%Y-%m-%d_%H%M')))
    out = open(fn, 'w', newline='')
    w = csv.writer(out)
    w.writerow(['block', 'set_size', 'n_a', 'n_b', 'present', 'said_present', 'rt_ms'])
    win = visual.Window(fullscr=FULLSCREEN, screen=SCREEN, units='pix', color=rgb([0, 0, 0]), allowGUI=False)
    win.mouseVisible = False
    fix = visual.Rect(win, width=6, height=6, fillColor=rgb([255] * 3), lineWidth=0)
    types = [(a, b, p) for a, b in zip(C['nA'], C['nB']) for p in (0, 1)]
    try:
        message(win, 'Target: %s.\n\nK if it is there, D if it is not. Fast, but try not to make mistakes.\nEyes on the dot between trials.\n\nSPACE to start.' % C['what'])
        for b in range(n_blocks):
            order = types[:]
            random.shuffle(order)
            for nA, nB, present in order:
                n = nA + nB
                fix.draw()
                win.flip()
                core.wait(C['fix'])
                P = positions(n)
                t_idx = random.randrange(n) if present else -1
                stims = []
                for k, (x, y) in enumerate(P):
                    if C.get('line'):
                        ang, L = math.radians(75 if k == t_idx else 90), 20 * SCALE
                        stims.append(visual.Line(win, start=(x - L / 2 * math.cos(ang), y - L / 2 * math.sin(ang)), end=(x + L / 2 * math.cos(ang), y + L / 2 * math.sin(ang)),
                                                 lineWidth=2.4, lineColor=rgb([255, 0, 0])))
                        continue
                    if k == t_idx:
                        ch, col = C['target']
                    else:
                        ch, col = random.choice(C['A'] if k < nA else C['B'])
                    stims.append(visual.TextStim(win, ch, pos=(x, y), height=ITEM, bold=True, font='Arial', color=rgb(col)))
                for s in stims:
                    s.draw()
                event.clearEvents()
                clock = core.Clock()
                win.callOnFlip(clock.reset)
                win.flip()
                key, rt = keys(['d', 'k'], clock)
                w.writerow([b + 1, n, nA, nB, present, 1 if key == 'k' else 0, round(rt * 1000, 1)])
                out.flush()
                win.flip()
                core.wait(.5 if C.get('line') else .4)
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
