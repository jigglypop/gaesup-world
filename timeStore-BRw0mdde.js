import { create as A } from "zustand";
const S = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"], N = 30, D = 12, R = 24, c = 60, a = R * c, E = a * N, d = E * D;
function I(e) {
  return e >= 3 && e <= 5 ? "spring" : e >= 6 && e <= 8 ? "summer" : e >= 9 && e <= 11 ? "autumn" : "winter";
}
function i(e) {
  const s = Math.max(0, Math.floor(e)), t = Math.floor(s / d), o = s % d, n = Math.floor(o / E), u = o % E, l = Math.floor(u / a), r = u % a, M = Math.floor(r / c), f = r % c, y = Math.floor(s / a), T = S[y % 7], p = n + 1, w = l + 1;
  return {
    year: t + 1,
    month: p,
    day: w,
    hour: M,
    minute: f,
    weekday: T,
    season: I(p),
    totalMinutes: s
  };
}
function H(e, s) {
  return s <= 0 ? 0 : e / 1e3 / s;
}
function U(e, s) {
  return Math.floor(e / a) !== Math.floor(s / a);
}
function P(e, s) {
  return Math.floor(e / c) !== Math.floor(s / c);
}
const h = 1, m = 8 * 60;
function _(e, s, t) {
  e.forEach((o) => {
    try {
      o({ kind: s, time: t });
    } catch {
    }
  });
}
const x = A((e, s) => ({
  mode: "scaled",
  scale: h,
  startEpochMs: typeof performance < "u" ? performance.now() : 0,
  totalMinutes: m,
  paused: !1,
  time: i(m),
  listeners: /* @__PURE__ */ new Set(),
  tick: (t) => {
    const o = s();
    if (o.paused || t <= 0) return;
    let n = o.totalMinutes;
    if (o.mode === "scaled")
      n = o.totalMinutes + H(t, o.scale);
    else {
      const M = Date.now(), f = o.startEpochMs;
      n = (M - f) / 1e3 / 60;
    }
    if (n === o.totalMinutes) return;
    const u = U(o.totalMinutes, n), l = P(o.totalMinutes, n), r = i(n);
    e({ totalMinutes: n, time: r }), l && _(o.listeners, "newHour", r), u && _(o.listeners, "newDay", r);
  },
  setScale: (t) => e({ scale: Math.max(1e-3, t) }),
  setMode: (t) => e({ mode: t }),
  setTotalMinutes: (t) => e({ totalMinutes: t, time: i(t) }),
  pause: () => e({ paused: !0 }),
  resume: () => e({ paused: !1 }),
  addListener: (t) => {
    const o = s();
    return o.listeners.add(t), () => {
      o.listeners.delete(t);
    };
  },
  serialize: () => {
    const t = s();
    return {
      version: 1,
      totalMinutes: t.totalMinutes,
      startEpochMs: t.startEpochMs,
      mode: t.mode,
      scale: t.scale,
      pausedAt: t.paused ? Date.now() : null
    };
  },
  hydrate: (t) => {
    if (!t || typeof t != "object") return;
    const o = Number.isFinite(t.totalMinutes) ? t.totalMinutes : m;
    e({
      totalMinutes: o,
      time: i(o),
      mode: t.mode ?? "scaled",
      scale: typeof t.scale == "number" ? t.scale : h,
      startEpochMs: typeof t.startEpochMs == "number" ? t.startEpochMs : 0,
      paused: !1
    });
  }
}));
export {
  x as u
};
