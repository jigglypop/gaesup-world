import { create as l } from "zustand";
function h(t) {
  let n = t | 0 || 1;
  return () => (n = n * 1664525 + 1013904223 | 0, (n >>> 0) / 4294967295);
}
const d = ["sunny", "sunny", "sunny", "cloudy"], f = ["rain", "rain", "cloudy", "storm", "sunny"], a = ["snow", "snow", "cloudy", "sunny"];
function k(t) {
  return t === "winter" ? a : t === "autumn" || t === "spring" ? f : d;
}
const p = l((t, n) => ({
  current: null,
  history: [],
  rollForDay: (r, i) => {
    const u = n().current;
    if (u && u.day === r) return u;
    const s = h(r * 6151 + 7919), o = k(i), e = o[Math.floor(s() * o.length)] ?? "sunny", y = 0.4 + s() * 0.6, c = { day: r, kind: e, intensity: y };
    return t({ current: c, history: [...n().history.slice(-29), c] }), c;
  },
  setWeather: (r, i = 0.7, u) => {
    const o = { day: u ?? n().current?.day ?? 0, kind: r, intensity: i };
    t({ current: o, history: [...n().history.slice(-29), o] });
  },
  isPrecipitating: () => {
    const r = n().current;
    return !!r && (r.kind === "rain" || r.kind === "snow" || r.kind === "storm");
  },
  fishingBonus: () => {
    const r = n().current;
    return r ? r.kind === "rain" || r.kind === "storm" ? 0.2 : r.kind === "cloudy" ? 0.1 : 0 : 0;
  },
  bugBonus: () => {
    const r = n().current;
    return r ? r.kind === "sunny" ? 0.15 : r.kind === "rain" || r.kind === "storm" || r.kind === "snow" ? -0.5 : 0 : 0;
  },
  serialize: () => ({
    version: 1,
    current: n().current ? { ...n().current } : null,
    history: n().history.map((r) => ({ ...r }))
  }),
  hydrate: (r) => {
    r && t({
      current: r.current ? { ...r.current } : null,
      history: Array.isArray(r.history) ? r.history.map((i) => ({ ...i })) : []
    });
  }
}));
export {
  p as u
};
