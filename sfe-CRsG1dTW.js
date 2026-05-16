const c = (t, r, n) => t < r ? r : t > n ? n : t, u = (t) => c(t, 0, 1), a = (t, r, n, e = 4) => {
  const m = Math.max(0, t), i = Math.max(0, r), o = Math.max(i + 1e-6, n), s = Math.max(0, e);
  return !Number.isFinite(m) || !Number.isFinite(i) || !Number.isFinite(o) || !Number.isFinite(s) ? s : u((m - i) / (o - i)) * s;
}, h = (t) => {
  const r = Math.max(0, t);
  return Number.isFinite(r) ? Math.exp(-r) : 0;
}, f = (t, r, n, e = 4) => t <= r ? 1 : t >= n ? 0 : h(a(t, r, n, e));
export {
  f as w
};
