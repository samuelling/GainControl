// Fitting for the perception console: a logistic psychometric function by maximum likelihood (Nelder–Mead), its
// inverse (PSE and thresholds), a least-squares line and a power function (Stevens) fit in log–log.

// P(x) = 1 / (1 + exp(-(x - a) / b))  — a is the PSE, b the slope scale
export const logistic = (x, a, b) => 1 / (1 + Math.exp(-(x - a) / b));
export const invLogistic = (p, a, b) => a + b * Math.log(p / (1 - p));

// Nelder–Mead on a small parameter vector
export function nelderMead(f, x0, { iters = 600, step = .5 } = {}) {
  const n = x0.length; let s = [x0.slice()];
  for (let i = 0; i < n; i++) { const v = x0.slice(); v[i] += (Math.abs(v[i]) > 1e-6 ? step * Math.abs(v[i]) : step); s.push(v); }
  let fs = s.map(f);
  for (let k = 0; k < iters; k++) {
    const o = fs.map((v, i) => i).sort((i, j) => fs[i] - fs[j]); s = o.map(i => s[i]); fs = o.map(i => fs[i]);
    const c = Array(n).fill(0); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += s[i][j] / n;
    const mv = (a, t) => c.map((ci, j) => ci + t * (a[j] - ci));
    const xr = mv(s[n], -1), fr = f(xr);
    if (fr < fs[0]) { const xe = mv(s[n], -2), fe = f(xe); if (fe < fr) { s[n] = xe; fs[n] = fe; } else { s[n] = xr; fs[n] = fr; } }
    else if (fr < fs[n - 1]) { s[n] = xr; fs[n] = fr; }
    else { const xc = mv(s[n], .5), fc = f(xc);
      if (fc < fs[n]) { s[n] = xc; fs[n] = fc; }
      else for (let i = 1; i <= n; i++) { s[i] = s[i].map((v, j) => s[0][j] + .5 * (v - s[0][j])); fs[i] = f(s[i]); } }
    if (Math.abs(fs[n] - fs[0]) < 1e-10) break;
  }
  return s[0];
}

// pts: [{ x, k (successes), n (trials) }] → { a, b, pse, t75: (x75 - x25) / 2 }, or null if there isn't enough data
export function fitLogistic(pts) {
  pts = pts.filter(p => p.n > 0); if (pts.length < 3) return null;
  const xs = pts.map(p => p.x), lo = Math.min(...xs), hi = Math.max(...xs), span = (hi - lo) || 1;
  const nll = ([a, lb]) => { const b = Math.exp(lb); let L = 0;
    for (const p of pts) { const q = Math.min(1 - 1e-6, Math.max(1e-6, logistic(p.x, a, b))); L -= p.k * Math.log(q) + (p.n - p.k) * Math.log(1 - q); }
    return L + 1e-4 * (a - (lo + hi) / 2) ** 2 / span; };
  // start from the point nearest 50%
  const near = pts.slice().sort((p, q) => Math.abs(p.k / p.n - .5) - Math.abs(q.k / q.n - .5))[0];
  const [a, lb] = nelderMead(nll, [near.x, Math.log(span / 8)]);
  const b = Math.exp(lb);
  if (!isFinite(a) || a < lo - span / 2 || a > hi + span / 2) return null;     // no usable fit (flat or reversed data)
  return { a, b, pse: a, t75: (invLogistic(.75, a, b) - invLogistic(.25, a, b)) / 2 };
}
// y = m x + c
export function linFit(xs, ys) {
  const n = xs.length, mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  const m = sxx ? sxy / sxx : 0; return { m, c: my - m * mx };
}
// Stevens: y = k x^e, fit in log–log
export function powerFit(xs, ys) {
  const ok = xs.map((x, i) => [x, ys[i]]).filter(([x, y]) => x > 0 && y > 0);
  const { m, c } = linFit(ok.map(p => Math.log(p[0])), ok.map(p => Math.log(p[1])));
  return { e: m, k: Math.exp(c) };
}
export const mean = (a) => a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN;
export const sem = (a) => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1) / a.length); };
export const median = (a) => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y), i = s.length >> 1; return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2; };
export const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const logspace = (lo, hi, n) => Array.from({ length: n }, (_, i) => Math.exp(Math.log(lo) + (Math.log(hi) - Math.log(lo)) * i / (n - 1)));
