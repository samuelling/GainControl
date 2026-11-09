#!/usr/bin/env python3
"""
GAIN CONTROL perception console, lab version: BREAKING CONTINUOUS FLASH SUPPRESSION (TSUCHIYA & KOCH 2005)

STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
design as the console, but nobody has validated it on your hardware. Before you collect real data, check the
timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and counterbalancing, and
the data file it writes. Dot your i's and cross your coding t's.

Tsuchiya, N., & Koch, C. (2005). Continuous flash suppression reduces negative afterimages. Nature Neuroscience,
  8(8), 1096-1101.
Jiang, Y., Costello, P., & He, S. (2007). Processing of invisible stimuli: Advantage of upright faces and recognizable
  words in overcoming interocular suppression. Psychological Science, 18(4), 349-355.

24 (quick) or 48 trials. One eye (CFS_EYE) sees grey rectangles renewed ten times a second; the other gets a
schematic line-drawn face (3 deg tall), upright or inverted, 2.5 deg left or right of the dot, fading in over 6 s.
As soon as any of it is visible: A left, L right (10 s limit). Breakthrough time (correct trials), upright vs
inverted. A schematic face is a weaker test than a photograph; swap in your own images for real work.

Output: data/rivcfs_<participant>_<date>.csv  columns: trial, face, side, response, correct, breakthrough_s

Viewing: set VIEW_MODE at the top. 'anaglyph' draws each eye's picture in grey, tinted red or green, for red/green
(or red/cyan) glasses; 'split' puts the two pictures side by side for a mirror or prism stereoscope. Run gc_rivsetup
first to check for crosstalk and to match the two eyes' brightness. Both eyes share a frame of black and white
squares and a fixation dot, which lock the two pictures together.

Run in PsychoPy Coder, or `python gc_rivcfs.py`. Escape quits (data so far are saved).
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



CFS_EYE = 'R'   # the eye that gets the flicker; the face goes to the other (the console uses the eye behind the green filter)


def face_patch(E, inv):
    """A schematic face (outline, eyes, brows, nose, mouth) in white lines: (lum, alpha)."""
    from PIL import Image, ImageDraw
    s = nom(110) * E.ppd * 4   # drawn 4x and shrunk, for smooth edges
    m = int(s * 1.2)
    im = Image.new('L', (m, m), 0)
    g, c, lw = ImageDraw.Draw(im), m / 2, max(2, int(s * .07))
    g.ellipse([c - s * .42, c - s * .52, c + s * .42, c + s * .52], outline=255, width=lw)
    for sx in (-1, 1):
        ex, ey, r = c + sx * s * .16, c - s * .1, s * .055
        g.ellipse([ex - r, ey - r, ex + r, ey + r], fill=255)
        g.line([c + sx * s * .26, c - s * .24, c + sx * s * .07, c - s * .21], fill=255, width=lw)
    g.line([c, c - s * .04, c - s * .04, c + s * .12, c + s * .03, c + s * .13], fill=255, width=lw, joint='curve')
    g.arc([c - s * .16, c + s * .14 - s * .16, c + s * .16, c + s * .14 + s * .16], 36, 144, fill=255, width=lw)
    im = im.resize((m // 4, m // 4), Image.LANCZOS)
    a = np.asarray(im, float) / 255
    if inv:
        a = a[::-1, ::-1]
    return np.ones_like(a), a


def main():
    info, fn, out, w, win, ppd, fps = start('Breaking flash suppression', 'rivcfs', ['trial', 'face', 'side', 'response', 'correct', 'breakthrough_s'], bg=0)
    E = Eyes(win, ppd)
    N = 24 if info['quick'] else 48
    trials = [(i % 2 == 1, 1 if (i >> 1) % 2 else -1) for i in range(N)]
    random.shuffle(trials)
    faces = {False: face_patch(E, False), True: face_patch(E, True)}
    fe, ce = ('L', 'R') if CFS_EYE == 'R' else ('R', 'L')
    mond = {'f': -1, 'im': None}

    def mondrian(t):
        f = int(t * 10)
        if f != mond['f']:
            mond['f'] = f
            im = np.full((E.n, E.n), .5)
            for _ in range(160):
                ww, hh = nom(random.uniform(18, 80)) * ppd, nom(random.uniform(18, 80)) * ppd
                x, y = random.uniform(nom(20) * ppd, E.n - nom(20) * ppd), random.uniform(nom(20) * ppd, E.n - nom(20) * ppd)
                im[int(max(0, y - hh / 2)):int(y + hh / 2), int(max(0, x - ww / 2)):int(x + ww / 2)] = random.random()
            mond['im'] = im
        return f
    try:
        message(win, 'One eye sees a storm of flickering rectangles; a face slowly fades in for the other eye, left or right of the dot.\nAs soon as you see ANY part of it: A left, L right. Be fast, but don\'t guess.\n\nSPACE to start.')
        for t, (inv, side) in enumerate(trials):
            E.begin(); E.lock(); show_for(E, .8, lambda E, tt: 0)
            event.clearEvents(); clock, k, rt, state = core.Clock(), None, None, None
            while clock.getTime() < 10 and k is None:
                tt = clock.getTime()
                f = mondrian(tt); fade = round(min(1, tt / 6), 2)
                if (f, fade) != state:
                    E.begin()
                    if ce == 'L':
                        E.L = mond['im'].copy()
                    else:
                        E.R = mond['im'].copy()
                    E.put(fe, faces[inv], side * nom(90), 0, alpha=fade); E.lock(); E.compose(); state = (f, fade)
                E.draw(); win.flip()
                for kk, kt in event.getKeys(['a', 'l', 'escape'], timeStamped=clock):
                    if kk == 'escape':
                        raise Quit
                    if k is None:
                        k, rt = kk, kt
            ok = k is not None and (k == 'l') == (side > 0)
            w.writerow([t + 1, 'inverted' if inv else 'upright', 'right' if side > 0 else 'left', {'a': 'left', 'l': 'right'}.get(k, 'none'), int(ok), round(rt, 3) if k else '']); out.flush()
            E.begin(); E.lock(); show_for(E, .6, lambda E, tt: 0)
    except Quit:
        pass
    finish(win, out, fn)


if __name__ == '__main__':
    main()
    core.quit()
