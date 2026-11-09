#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: ADAPTING TO THE INVISIBLE (BLAKE & FOX 1974)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Blake, R., & Fox, R. (1974). Adaptation to invisible gratings and the site of binocular rivalry suppression.
  Nature, 249, 488-490.
Wade, N. J., & Wenderoth, P. (1978). The influence of colour and contour rivalry on the magnitude of the tilt
  after-effect. Vision Research, 18(7), 827-835.

Two blocks, in a random order. The LEFT eye adapts to a grating tilted 15 deg clockwise from vertical (2 c/deg,
contrast .9) for 30 s (quick) or 60 s; in the 'suppressed' block the right eye sees black and white squares renewed
ten times a second, which hide it most of the time. Hold V while the adapter is visible at all. Then 24 (quick) or
40 tests, each after 5 s of top-up: a near-vertical test grating for 200 ms in the left eye; A tilted left, L tilted
right. A 1-up-1-down staircase on the test tilt (1 deg steps, then 0.5 after two reversals); PSE = mean of the last
six reversals (positive = clockwise).

Output: data/rivadapt_<participant>_<date>.csv  columns: block, test, tilt_deg_cw, response

Viewing: set VIEW_MODE at the top. 'anaglyph' draws each eye's picture in grey, tinted red or green, for red/green
(or red/cyan) glasses; 'split' puts the two pictures side by side for a mirror or prism stereoscope. Run gc_rivsetup
first to check for crosstalk and to match the two eyes' brightness. Both eyes share a frame of black and white
squares and a fixation dot, which lock the two pictures together.

Run in PsychoPy Coder, or `python gc_rivadapt.py`. Escape quits (data so far are saved).
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


# ---- viewing: how each eye gets its own picture ----
VIEW_MODE = 'anaglyph'     # 'anaglyph': red/green (or red/cyan) glasses; 'split': side by side, for a stereoscope
RED_EYE = 'left'           # anaglyph: the eye behind the red filter
RED_GAIN, GREEN_GAIN = 1.0, 0.85   # anaglyph: match the two eyes' brightness through the glasses (gc_rivsetup finds them)
SPLIT_SEP_PX = None        # split: centre-to-centre distance of the two halves, px (None: half the screen width)
MIRROR_LEFT = False        # split: mirror-reverse the left half, for single-mirror stereoscopes
EYE_DEG = 12.8             # each eye's square picture, in degrees
TRIKEYS = {'a': 'LEFT TILT', 's': 'MIXED', 'l': 'RIGHT TILT'}


def nom(px):
    """The console draws at a nominal 36 px per degree: its pixel sizes, in degrees."""
    return px / 36.0


class Eyes:
    """Each eye's picture as a grey image (0-1, rows top to bottom), composed for the glasses or the stereoscope.
    begin() ... put() ... lock() fill both eyes; compose() turns them into the display; draw() puts it up (then flip)."""
    def __init__(self, win, ppd):
        self.win, self.ppd, self.cache = win, ppd, {}
        W, H = win.size
        n = int(round(EYE_DEG * ppd))
        if VIEW_MODE == 'split':
            n = min(n, int(W / 2) - 10, int(H) - 10)
        else:
            n = min(n, int(H) - 10)
        self.n = n - n % 2
        self.sep = SPLIT_SEP_PX or W / 2
        mk = lambda x: visual.ImageStim(win, image=np.zeros((self.n, self.n, 3)), size=(self.n, self.n), pos=(x, 0), units='pix', interpolate=False)
        self.stims = [mk(0)] if VIEW_MODE == 'anaglyph' else [mk(-self.sep / 2), mk(self.sep / 2)]
        self.begin()

    def begin(self, bg=.5):
        self.L = np.full((self.n, self.n), float(bg))
        self.R = self.L.copy()

    def put(self, eye, patch, dx=0.0, dy=0.0, alpha=1.0, mask=None):
        """Blend patch = (lum, alpha) into eye 'L' or 'R', centred dx, dy degrees from the middle (dy down).
        mask: an n x n array (0-1) in the eye's own coordinates that clips it."""
        lum, a = patch
        im = self.L if eye == 'L' else self.R
        h, w = lum.shape
        y0 = int(round(self.n / 2 + dy * self.ppd - h / 2))
        x0 = int(round(self.n / 2 + dx * self.ppd - w / 2))
        ys, xs = slice(max(0, y0), min(self.n, y0 + h)), slice(max(0, x0), min(self.n, x0 + w))
        if ys.stop <= ys.start or xs.stop <= xs.start:
            return
        sub = (slice(ys.start - y0, ys.stop - y0), slice(xs.start - x0, xs.stop - x0))
        aa = a[sub] * alpha
        if mask is not None:
            aa = aa * mask[ys, xs]
        im[ys, xs] = im[ys, xs] * (1 - aa) + lum[sub] * aa

    def lock(self, fix=True):
        """What both eyes share, so the two pictures lock together: a frame of black and white squares, and a fixation dot."""
        n, s = self.n, max(4, int(round(nom(12) * self.ppd)))
        for im in (self.L, self.R):
            for i in range(0, n, s):
                v = 1.0 if (i // s) % 2 == 0 else 0.0
                im[:s, i:i + s] = v; im[n - s:, i:i + s] = v; im[i:i + s, :s] = v; im[i:i + s, n - s:] = v
            if fix:
                c, a, b = n // 2, max(2, int(round(nom(4) * self.ppd))), max(1, int(round(nom(2) * self.ppd)))
                im[c - a:c + a, c - a:c + a] = 0
                im[c - b:c + b, c - b:c + b] = 1

    def compose(self):
        if VIEW_MODE == 'anaglyph':
            red, green = (self.L, self.R) if RED_EYE == 'left' else (self.R, self.L)
            rgb = np.dstack([red * RED_GAIN, green * GREEN_GAIN, np.zeros_like(red)])
            self.stims[0].image = np.flipud(rgb) * 2 - 1
        else:
            left = self.L[:, ::-1] if MIRROR_LEFT else self.L
            for st, im in zip(self.stims, (left, self.R)):
                st.image = np.flipud(np.dstack([im] * 3)) * 2 - 1

    def draw(self):
        for st in self.stims:
            st.draw()

    def show(self):
        self.compose(); self.draw(); self.win.flip()

    def grating(self, r=nom(54), r0=0.0, cpd=3.0, ori=45.0, c=.8, ph=0.0, kind='linear'):
        """A sine grating in a soft-edged circular (or annular) aperture: (lum, alpha). r, r0 in degrees.
        ori: the direction the phase runs, degrees clockwise from rightward, so 45 gives stripes tilted right (/),
        -45 tilted left, 0 vertical stripes, and small positive angles stripes rotated clockwise from vertical.
        kind 'radial' or 'concentric' for rings."""
        k = (r, r0, cpd, ori, c, ph, kind)
        if k in self.cache:
            return self.cache[k]
        rp, r0p, ep = r * self.ppd, r0 * self.ppd, max(1.0, nom(3) * self.ppd)
        m = int(math.ceil(rp)) * 2 + 2
        y, x = np.mgrid[0:m, 0:m] + .5 - m / 2
        d = np.hypot(x, y)
        f, th = cpd / self.ppd * 2 * math.pi, math.radians(ori)
        if kind == 'radial':
            phase = np.arctan2(y, x) * max(4, round(2 * math.pi * (rp + r0p) / 2 / self.ppd * cpd))
        elif kind == 'concentric':
            phase = d * f
        else:
            phase = (x * math.cos(th) + y * math.sin(th)) * f
        lum = .5 + .5 * c * np.sin(phase + ph)
        a = np.clip(np.minimum(rp - d, (d - r0p) if r0p else 1e9) / ep, 0, 1)
        self.cache[k] = (lum, a)
        return lum, a

    def disc(self, r, v=1.0):
        """A plain disc of grey level v, radius r degrees: (lum, alpha)."""
        rp = r * self.ppd
        m = int(math.ceil(rp)) * 2 + 2
        y, x = np.mgrid[0:m, 0:m] + .5 - m / 2
        return np.full((m, m), float(v)), np.clip(rp - np.hypot(x, y) + .5, 0, 1)


def show_for(E, secs, draw):
    """Show for secs seconds; draw(E, t) fills both eyes and returns a state: the display is recomposed when it changes."""
    clock, state = core.Clock(), object()
    while clock.getTime() < secs:
        s = draw(E, clock.getTime())
        if s != state:
            E.compose(); state = s
        E.draw(); E.win.flip()
        if 'escape' in event.getKeys(['escape']):
            raise Quit


def track(E, secs, draw):
    """Report percepts continuously: the key for what you see (A left tilt, S mixed, L right tilt), on every change.
    draw(E, t) fills both eyes and returns a state (recomposed when it changes).
    Returns completed percepts [(label, onset_s, duration_s)]; the last one, cut off by the end, is left out."""
    clock, log, cur, t0, state = core.Clock(), [], None, 0.0, object()
    tl = visual.TextStim(E.win, '', pos=(E.win.size[0] / 2 - 50, E.win.size[1] / 2 - 26), height=16, color=(-.04, -.06, .13))
    event.clearEvents()
    while True:
        t = clock.getTime()
        if t >= secs:
            break
        s = draw(E, t)
        if s != state:
            E.compose(); state = s
        tl.text = '%d S' % math.ceil(secs - t)
        E.draw(); tl.draw(); E.win.flip()
        for k, kt in event.getKeys(list(TRIKEYS) + ['escape'], timeStamped=clock):
            if k == 'escape':
                raise Quit
            if k != cur:
                if cur:
                    log.append((TRIKEYS[cur], t0, kt - t0))
                cur, t0 = k, kt
    return log


def dur_stats(ds):
    """Mean, SD, CV and gamma shape (k = mean^2 / var) of dominance durations."""
    if len(ds) < 2:
        return dict(n=len(ds), m=float('nan'), sd=float('nan'), cv=float('nan'), k=float('nan'))
    m, s = float(np.mean(ds)), float(np.std(ds, ddof=1))
    return dict(n=len(ds), m=m, sd=s, cv=s / m, k=m * m / (s * s) if s else float('nan'))



def main():
    info, fn, out, w, win, ppd, fps = start('Adapting to the invisible', 'rivadapt', ['block', 'test', 'tilt_deg_cw', 'response'], bg=0)
    E = Eyes(win, ppd)
    AD, NT, TOP = (30, 24, 5) if info['quick'] else (60, 40, 5)
    adapter = E.grating(ori=15, c=.9, cpd=2)
    try:   # V held down, from pyglet's key state (the default PsychoPy window); otherwise V toggles
        from pyglet.window import key as pk
        kstate = pk.KeyStateHandler(); win.winHandle.push_handlers(kstate)
        held = lambda: bool(kstate[pk.V])
    except Exception:
        tog = {'on': False}
        def held():
            if event.getKeys(['v']):
                tog['on'] = not tog['on']
            return tog['on']
    noise = {'f': -1, 'im': None}

    def squares(t):
        f = int(t * 10)
        if f != noise['f']:
            noise['f'] = f
            lum, a = np.zeros((E.n, E.n)), np.zeros((E.n, E.n))
            for _ in range(70):
                s = nom(random.uniform(14, 60)) * ppd
                cx, cy = E.n / 2 + nom(random.uniform(-100, 100)) * ppd, E.n / 2 + nom(random.uniform(-100, 100)) * ppd
                ys, xs = slice(int(max(0, cy - s / 2)), int(cy + s / 2)), slice(int(max(0, cx - s / 2)), int(cx + s / 2))
                lum[ys, xs] = float(random.random() < .5); a[ys, xs] = 1
            noise['im'] = (lum, a)
        return f

    def adapt(cond):
        def draw(E, t):
            E.begin(); E.put('L', adapter); f = 0
            if cond == 'suppressed':
                f = squares(t); E.put('R', noise['im'])
            E.lock()
            return f
        return draw
    try:
        out_s = {}
        for cond in random.sample(['visible', 'suppressed'], 2):
            message(win, ('This block the adapter stays visible.' if cond == 'visible' else 'This block flickering squares in the other eye hide the adapter most of the time.') +
                    '\nHold V whenever you can see the tilted grating. Keep your eyes on the dot.\n\nSPACE to start.')
            clock, vis, last, draw, state = core.Clock(), 0.0, 0.0, adapt(cond), None
            while clock.getTime() < AD:
                t = clock.getTime(); s = draw(E, t)
                if s != state:
                    E.compose(); state = s
                E.draw(); win.flip()
                if held():
                    vis += t - last
                last = t
                if 'escape' in event.getKeys(['escape']):
                    raise Quit
            tilt, last_dir, rev = 3.0, 0, []
            for t in range(NT):
                show_for(E, TOP, draw)
                E.begin(); E.lock(); show_for(E, .25, lambda E, tt: 0)
                test = E.grating(ori=tilt, c=.9, cpd=2)
                E.begin(); E.put('L', test); E.lock(); show_for(E, .2, lambda E, tt: 0)
                E.begin(); E.lock(); E.show()
                k, _ = keys(['a', 'l'])
                w.writerow([cond, t + 1, tilt, 'right' if k == 'l' else 'left']); out.flush()
                d = -1 if k == 'l' else 1
                if last_dir and d != last_dir:
                    rev.append(tilt)
                last_dir = d
                tilt = min(10, max(-10, tilt + d * (1 if len(rev) < 2 else .5)))
            out_s[cond] = (np.mean(rev[-6:]) if len(rev) >= 2 else tilt, vis / AD)
            print('%s: PSE %.2f deg CW, adapter visible %d%% of the time' % (cond, out_s[cond][0], 100 * out_s[cond][1]))
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
