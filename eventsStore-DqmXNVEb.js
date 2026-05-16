import { create as p } from "zustand";
class w {
  items = /* @__PURE__ */ new Map();
  register(e) {
    this.items.has(e.id) || this.items.set(e.id, Object.freeze({ ...e }));
  }
  registerAll(e) {
    for (const t of e) this.register(t);
  }
  get(e) {
    return this.items.get(e);
  }
  require(e) {
    const t = this.items.get(e);
    if (!t) throw new Error(`Unknown ItemId: ${e}`);
    return t;
  }
  all() {
    return Array.from(this.items.values());
  }
  has(e) {
    return this.items.has(e);
  }
  clear() {
    this.items.clear();
  }
}
let h = null;
function S() {
  return h || (h = new w()), h;
}
const d = 20, m = 5;
function v(o) {
  return Array.from({ length: o }, () => null);
}
function A(o) {
  return Array.from({ length: o }, (e, t) => t);
}
function b(o) {
  const e = S().get(o);
  return e && e.stackable ? Math.max(1, e.maxStack) : 1;
}
const k = p((o, e) => ({
  size: d,
  slots: v(d),
  hotbar: A(m),
  equippedHotbar: 0,
  add: (t, s = 1) => {
    if (s <= 0) return 0;
    const n = b(t), r = e().slots.slice();
    let a = s;
    if (n > 1)
      for (let i = 0; i < r.length && a > 0; i++) {
        const c = r[i];
        if (c && c.itemId === t && c.count < n) {
          const l = n - c.count, f = Math.min(l, a);
          r[i] = { ...c, count: c.count + f }, a -= f;
        }
      }
    for (let i = 0; i < r.length && a > 0; i++)
      if (r[i] === null) {
        const c = Math.min(n, a);
        r[i] = { itemId: t, count: c }, a -= c;
      }
    return o({ slots: r }), a;
  },
  remove: (t, s = 1) => {
    const n = e().slots.slice(), r = n[t];
    return !r || s <= 0 ? !1 : (r.count <= s ? n[t] = null : n[t] = { ...r, count: r.count - s }, o({ slots: n }), !0);
  },
  removeById: (t, s = 1) => {
    if (s <= 0) return 0;
    const n = e().slots.slice();
    let r = s;
    for (let a = 0; a < n.length && r > 0; a++) {
      const i = n[a];
      if (!i || i.itemId !== t) continue;
      const c = Math.min(i.count, r);
      i.count <= c ? n[a] = null : n[a] = { ...i, count: i.count - c }, r -= c;
    }
    return o({ slots: n }), s - r;
  },
  move: (t, s) => {
    const n = e().slots.slice();
    if (t < 0 || s < 0 || t >= n.length || s >= n.length) return;
    const r = n[t], a = n[s];
    if (r && a && r.itemId === a.itemId) {
      const i = b(r.itemId);
      if (i > 1) {
        const c = i - a.count;
        if (c > 0) {
          const l = Math.min(c, r.count);
          n[s] = { ...a, count: a.count + l }, r.count - l <= 0 ? n[t] = null : n[t] = { ...r, count: r.count - l }, o({ slots: n });
          return;
        }
      }
    }
    n[t] = a ?? null, n[s] = r ?? null, o({ slots: n });
  },
  clear: () => o({ slots: v(e().size) }),
  setEquippedHotbar: (t) => {
    const s = e().hotbar, n = (t % s.length + s.length) % s.length;
    o({ equippedHotbar: n });
  },
  getEquipped: () => {
    const { hotbar: t, slots: s, equippedHotbar: n } = e(), r = t[n];
    return r == null || r < 0 || r >= s.length ? null : s[r] ?? null;
  },
  getHotbarSlot: (t) => {
    const { hotbar: s, slots: n } = e(), r = s[t];
    return r == null ? null : n[r] ?? null;
  },
  countOf: (t) => {
    let s = 0;
    for (const n of e().slots) n && n.itemId === t && (s += n.count);
    return s;
  },
  has: (t, s = 1) => e().countOf(t) >= s,
  serialize: () => {
    const { slots: t, hotbar: s, equippedHotbar: n } = e();
    return {
      version: 1,
      slots: t.map((r) => r ? { ...r } : null),
      hotbar: [...s],
      equippedHotbar: n
    };
  },
  hydrate: (t) => {
    if (!t) return;
    const s = Array.isArray(t.slots) ? t.slots.length : d, n = Array.isArray(t.slots) ? t.slots.map((i) => i && typeof i == "object" && i.itemId ? { ...i } : null) : v(s), r = Array.isArray(t.hotbar) ? t.hotbar.slice(0, m) : A(m), a = typeof t.equippedHotbar == "number" ? Math.max(0, Math.min(r.length - 1, t.equippedHotbar)) : 0;
    o({ size: s, slots: n, hotbar: r, equippedHotbar: a });
  }
}));
let M = 0;
const I = p((o, e) => ({
  toasts: [],
  push: (t) => {
    const s = ++M, n = {
      id: s,
      createdAt: Date.now(),
      durationMs: t.durationMs ?? 3500,
      kind: t.kind,
      text: t.text,
      ...t.icon ? { icon: t.icon } : {}
    };
    return o({ toasts: [...e().toasts, n] }), s;
  },
  dismiss: (t) => o({ toasts: e().toasts.filter((s) => s.id !== t) }),
  clear: () => o({ toasts: [] })
}));
function T(o, e, t) {
  return I.getState().push({
    kind: o,
    text: e,
    ...t?.icon ? { icon: t.icon } : {},
    ...t?.durationMs !== void 0 ? { durationMs: t.durationMs } : {}
  });
}
function q(o, e) {
  switch (o.kind) {
    case "always":
      return !0;
    case "season":
      return o.seasons.includes(e.season);
    case "monthDay":
      return e.month === o.month && e.day === o.day;
    case "monthRange":
      return e.month === o.month && e.day >= o.fromDay && e.day <= o.toDay;
    case "weekday":
      return o.weekdays.includes(e.weekday);
    default:
      return !1;
  }
}
function g(o, e) {
  return o.triggers.length ? o.triggers.some((t) => q(t, e)) : !1;
}
class x {
  defs = /* @__PURE__ */ new Map();
  register(e) {
    this.defs.has(e.id) || this.defs.set(e.id, e);
  }
  registerAll(e) {
    for (const t of e) this.register(t);
  }
  get(e) {
    return this.defs.get(e);
  }
  has(e) {
    return this.defs.has(e);
  }
  all() {
    return Array.from(this.defs.values());
  }
  clear() {
    this.defs.clear();
  }
  resolveActive(e) {
    const t = [];
    for (const s of this.defs.values())
      g(s, e) && t.push(s.id);
    return t;
  }
  resolveTags(e) {
    const t = /* @__PURE__ */ new Set();
    for (const s of this.defs.values())
      if (g(s, e))
        for (const n of s.tags ?? []) t.add(n);
    return t;
  }
}
let y = null;
function E() {
  return y || (y = new x()), y;
}
const _ = p((o, e) => ({
  active: [],
  startedAt: {},
  tags: /* @__PURE__ */ new Set(),
  refresh: (t) => {
    const s = E(), n = s.resolveActive(t), r = e().active, a = new Set(n), i = new Set(r), c = n.filter((u) => !i.has(u)), l = r.filter((u) => !a.has(u)), f = { ...e().startedAt };
    for (const u of c) f[u] = t.totalMinutes;
    for (const u of l) delete f[u];
    return o({ active: n, startedAt: f, tags: s.resolveTags(t) }), { started: c, ended: l };
  },
  isActive: (t) => e().active.includes(t),
  hasTag: (t) => e().tags.has(t),
  serialize: () => ({ version: 1, active: [...e().active], startedAt: { ...e().startedAt } }),
  hydrate: (t) => {
    t && o({
      active: Array.isArray(t.active) ? [...t.active] : [],
      startedAt: t.startedAt && typeof t.startedAt == "object" ? { ...t.startedAt } : {}
    });
  }
}));
export {
  _ as a,
  E as b,
  I as c,
  S as g,
  g as i,
  T as n,
  k as u
};
