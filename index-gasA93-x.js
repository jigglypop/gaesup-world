import { useEffect as k, useRef as I, useState as P, useCallback as W, useMemo as Y } from "react";
import { g as $, S as tt } from "./index-D7BDts2W.js";
import { c as et, a as nt, f as rt } from "./runtimeFilter-CS35UPHd.js";
import { u as st } from "./assetStore-mAClONjR.js";
import { c as ot } from "./snapshot-OExk53wq.js";
import { jsx as m, jsxs as D } from "react/jsx-runtime";
import { useFrame as K } from "@react-three/fiber";
import * as C from "three";
import { u as N, g as V, n as A, a as Q } from "./eventsStore-DqmXNVEb.js";
import { u as H } from "./timeStore-BRw0mdde.js";
import { u as X } from "./weatherStore-CzG5N441.js";
function Lt({
  intervalMs: t = 5 * 60 * 1e3,
  slot: e,
  saveOnUnload: n = !0,
  saveOnVisibilityChange: r = !0
} = {}) {
  k(() => {
    const s = $();
    let o = !1;
    const a = () => {
      o || s.save(e);
    }, c = window.setInterval(a, Math.max(1e3, t)), u = () => {
      s.save(e);
    }, l = () => {
      document.visibilityState === "hidden" && s.save(e);
    };
    return n && window.addEventListener("beforeunload", u), r && document.addEventListener("visibilitychange", l), () => {
      o = !0, window.clearInterval(c), n && window.removeEventListener("beforeunload", u), r && document.removeEventListener("visibilitychange", l);
    };
  }, [t, e, n, r]);
}
function Ut(t, e) {
  k(() => {
    const n = $();
    let r = !1;
    return n.load(t).then((s) => {
      !r && e && e(s);
    }), () => {
      r = !0;
    };
  }, [t, e]);
}
const J = "runtime.saveDiagnostics", it = "runtime:saveDiagnostic";
function at(t = {}) {
  const e = Math.max(1, t.maxEntries ?? 50), n = [], r = /* @__PURE__ */ new Set();
  let s = 1;
  return {
    report(o) {
      const a = Z(o.error), c = {
        ...o,
        id: s,
        reportedAt: Date.now(),
        errorMessage: a,
        message: ct(o, a)
      };
      s += 1, n.push(c), n.length > e && n.splice(0, n.length - e);
      for (const u of r)
        u(c);
      return c;
    },
    getDiagnostics() {
      return n.map((o) => ({ ...o }));
    },
    getLatest() {
      const o = n[n.length - 1];
      return o ? { ...o } : void 0;
    },
    clear() {
      n.length = 0;
    },
    subscribe(o) {
      return r.add(o), () => {
        r.delete(o);
      };
    }
  };
}
function ct(t, e = Z(t.error)) {
  return `Save domain "${t.key}" failed during ${t.phase} for slot "${t.slot}": ${e}`;
}
function Z(t) {
  return t instanceof Error ? t.message : typeof t == "string" ? t : "Unknown save error";
}
function ut(t) {
  if (!t || typeof t != "object") return !1;
  const e = t;
  return typeof e.key == "string" && typeof e.serialize == "function" && typeof e.hydrate == "function";
}
function Pt(t = {}) {
  const e = et(t.logger), n = nt(t.logger ? { logger: t.logger } : {}), r = t.pluginRuntime ?? "client", s = t.saveSystem ?? (t.saveOptions ? new tt(ft(t.saveOptions)) : $()), o = at(t.saveDiagnostics), a = s.subscribeDiagnostics((i) => {
    const f = o.report(i);
    e.warn(f.message, f), n.context.events.emit(it, f);
  }), c = /* @__PURE__ */ new Map();
  n.context.services.register(
    J,
    o,
    "gaesup.runtime"
  );
  for (const i of rt(t.plugins ?? [], r))
    n.register(i);
  const u = (i) => {
    if (c.has(i.key)) return;
    const f = s.register({
      key: i.key,
      serialize: () => i.serialize() ?? null,
      hydrate: i.hydrate
    });
    c.set(i.key, f);
  };
  for (const i of t.saveBindings ?? [])
    u(i);
  const l = () => {
    for (const i of n.context.save.list())
      ut(i.value) && u(i.value);
  }, p = async () => {
    const i = t.assets?.source;
    i && await st.getState().loadAssets(i);
  };
  return {
    pluginRuntime: r,
    plugins: n,
    save: s,
    saveDiagnostics: o,
    loadAssets: p,
    getService: (i) => n.context.services.get(i),
    requireService: (i) => n.context.services.require(i),
    setup: async () => {
      t.assets?.loadOnCreate && await p(), await n.setupAll(), l();
    },
    dispose: async () => {
      await n.disposeAll(), a();
      for (const i of c.values())
        i();
      c.clear(), n.context.services.remove(J);
    }
  };
}
function ft(t) {
  return {
    ...t
  };
}
const lt = {
  lighting: {
    ambientIntensity: 1,
    directionalIntensity: 1,
    directionalPosition: { x: 0, y: 10, z: 0 }
  }
};
function v(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function _(t) {
  return typeof structuredClone == "function" ? structuredClone(t) : JSON.parse(JSON.stringify(t));
}
function O(t) {
  return Array.isArray(t) ? t.map((e) => _(e)) : [];
}
function L(t, e) {
  const n = t[e];
  return v(n) ? n : void 0;
}
function F(t) {
  if (Array.isArray(t) && t.length >= 3) {
    const [e, n, r] = t;
    if (typeof e == "number" && typeof n == "number" && typeof r == "number")
      return { x: e, y: n, z: r };
  }
  if (v(t) && typeof t.x == "number" && typeof t.y == "number" && typeof t.z == "number")
    return { x: t.x, y: t.y, z: t.z };
}
function mt(t) {
  if (!v(t) || typeof t.id != "string") return null;
  const e = F(t.position) ?? { x: 0, y: 0, z: 0 }, n = F(t.rotation) ?? { x: 0, y: 0, z: 0 }, r = v(t.metadata) ? _(t.metadata) : void 0, s = v(t.behavior) ? t.behavior : void 0, o = s && typeof s.mode == "string" ? s.mode : void 0;
  return {
    id: t.id,
    name: typeof t.name == "string" ? t.name : t.id,
    position: e,
    rotation: n,
    ...typeof t.modelUrl == "string" ? { modelUrl: t.modelUrl } : {},
    ...o ? { behavior: o } : {},
    ...r ? { metadata: r } : {}
  };
}
function dt(t) {
  const e = t?.instances;
  return Array.isArray(e) ? e.map(mt).filter((n) => n !== null) : [];
}
function gt(t) {
  if (!t) return;
  const e = v(t.cameraOption) ? t.cameraOption : t, n = F(e.position);
  if (!n) return;
  const r = F(e.rotation) ?? { x: 0, y: 0, z: 0 }, s = v(t.mode) ? t.mode : void 0, o = typeof t.mode == "string" ? t.mode : s && typeof s.control == "string" ? s.control : "default", a = v(t.settings) ? _(t.settings) : v(t.cameraOption) ? _(t.cameraOption) : void 0;
  return {
    position: n,
    rotation: r,
    mode: o,
    ...a ? { settings: a } : {}
  };
}
function ht(t, e, n) {
  const r = L(t, "building"), s = gt(L(t, "camera"));
  return {
    id: e,
    name: n,
    buildings: {
      wallGroups: O(r?.wallGroups),
      tileGroups: O(r?.tileGroups),
      blocks: O(r?.blocks),
      meshes: O(r?.meshes)
    },
    npcs: dt(L(t, "npc")),
    environment: lt,
    ...s ? { camera: s } : {}
  };
}
function yt(t) {
  const e = t.slice(t.lastIndexOf("_") + 1), n = Number(e);
  return Number.isFinite(n) ? n : Date.now();
}
function pt(t) {
  const e = t.lastIndexOf("_");
  return e > 0 ? t.slice(0, e) : t;
}
function St(t, e) {
  if (t)
    return {
      ...t,
      createdAt: t.createdAt ?? e,
      updatedAt: t.updatedAt ?? e
    };
}
function Wt(t, e, n, r) {
  const s = yt(e), o = pt(e), a = {
    version: "1.0.0",
    timestamp: s,
    world: ht(
      ot(t),
      o,
      n ?? o
    )
  }, c = St(r, s);
  return c ? { ...a, metadata: c } : a;
}
class wt {
  byKind = /* @__PURE__ */ new Map();
  global = /* @__PURE__ */ new Set();
  on(e, n) {
    let r = this.byKind.get(e);
    return r || (r = /* @__PURE__ */ new Set(), this.byKind.set(e, r)), r.add(n), () => {
      r.delete(n);
    };
  }
  onAny(e) {
    return this.global.add(e), () => {
      this.global.delete(e);
    };
  }
  emit(e) {
    const n = this.byKind.get(e.kind);
    if (n) {
      for (const r of n)
        if (r(e) === !0) return;
    }
    for (const r of this.global) r(e);
  }
  clear() {
    this.byKind.clear(), this.global.clear();
  }
}
let U = null;
function bt() {
  return U || (U = new wt()), U;
}
function j(t, e, n = !0) {
  k(() => n ? bt().on(t, e) : void 0, [t, e, n]);
}
function $t() {
  const t = N((n) => n.getEquipped());
  return t ? V().get(t.itemId)?.toolKind ?? null : null;
}
function Kt({
  position: t,
  rotationY: e = 0,
  hp: n = 3,
  woodDrop: r = 2,
  regrowMinutes: s = 1440,
  hitRange: o = 1.6,
  trunkColor: a = "#6b4a2a",
  foliageColor: c = "#3f8a3a",
  scale: u = 1
}) {
  const l = I(null), [p, i] = P(n), [f, d] = P(!1), g = I(0), h = I(-1 / 0), y = W((R) => {
    if (f) return;
    const E = R.origin[0] - t[0], b = R.origin[2] - t[2], z = E * E + b * b, T = o + R.range * 0.5;
    if (!(z > T * T))
      return h.current = performance.now(), i((G) => {
        const q = G - 1;
        return q <= 0 ? (N.getState().add("wood", r) > 0 ? A("warn", "인벤토리가 가득 찼습니다") : A("reward", `목재 +${r}`), d(!0), g.current = H.getState().totalMinutes + s, n) : q;
      }), !0;
  }, [f, t, o, r, s, n]);
  j("axe", y), k(() => f ? H.subscribe((E, b) => {
    E.totalMinutes !== b.totalMinutes && E.totalMinutes >= g.current && (d(!1), i(n));
  }) : void 0, [f, n]), K((R, E) => {
    const b = l.current;
    if (!b) return;
    const z = (performance.now() - h.current) / 1e3;
    if (z < 0.4) {
      const T = z / 0.4, G = Math.sin(T * Math.PI * 6) * (1 - T) * 0.18;
      b.rotation.z = G;
    } else Math.abs(b.rotation.z) > 1e-4 && (b.rotation.z *= Math.max(0, 1 - E * 12));
  });
  const w = p < n, M = 1.6 * u, S = 0.18 * u, x = 0.95 * u, B = Y(() => {
    const R = new C.Color(c);
    return w && R.lerp(new C.Color("#a55"), 0.06 * (n - p)), R;
  }, [c, w, n, p]);
  return f ? /* @__PURE__ */ m("group", { position: t, rotation: [0, e, 0], children: /* @__PURE__ */ D("mesh", { castShadow: !0, receiveShadow: !0, position: [0, 0.18 * u, 0], children: [
    /* @__PURE__ */ m("cylinderGeometry", { args: [S, S * 1.15, 0.36 * u, 12] }),
    /* @__PURE__ */ m("meshToonMaterial", { color: a })
  ] }) }) : /* @__PURE__ */ D("group", { ref: l, position: t, rotation: [0, e, 0], children: [
    /* @__PURE__ */ D("mesh", { castShadow: !0, receiveShadow: !0, position: [0, M * 0.5, 0], children: [
      /* @__PURE__ */ m("cylinderGeometry", { args: [S * 0.85, S, M, 12] }),
      /* @__PURE__ */ m("meshToonMaterial", { color: a })
    ] }),
    /* @__PURE__ */ D("mesh", { castShadow: !0, position: [0, M + x * 0.6, 0], children: [
      /* @__PURE__ */ m("coneGeometry", { args: [x, x * 1.6, 14] }),
      /* @__PURE__ */ m("meshToonMaterial", { color: B })
    ] }),
    /* @__PURE__ */ D("mesh", { castShadow: !0, position: [0, M + x * 1.5, 0], children: [
      /* @__PURE__ */ m("coneGeometry", { args: [x * 0.75, x * 1.2, 14] }),
      /* @__PURE__ */ m("meshToonMaterial", { color: B })
    ] })
  ] });
}
const vt = [
  { itemId: "fish-bass", weight: 60 },
  { itemId: "fish-tuna", weight: 25 },
  { itemId: "fish-koi", weight: 10 }
];
function It(t, e, n) {
  const r = [];
  for (const a of n) a.startsWith(e) && r.push(a.slice(e.length));
  if (r.length === 0) return t;
  const s = new Set(r), o = t.filter((a) => s.has(a.itemId));
  return o.length > 0 ? o : t;
}
function Mt(t) {
  if (t.length === 0) return null;
  const e = t.reduce((r, s) => r + Math.max(0, s.weight), 0);
  if (e <= 0) return null;
  let n = Math.random() * e;
  for (const r of t)
    if (n -= Math.max(0, r.weight), n <= 0) return r.itemId;
  return t[t.length - 1].itemId;
}
function Vt({
  position: t,
  radius: e = 3,
  pool: n = vt,
  cooldownMs: r = 600,
  successChance: s = 0.6,
  showRipple: o = !0,
  rippleColor: a = "#9ad9ff"
}) {
  const c = I(-1 / 0), u = I(null), l = I(-1 / 0), p = W((i) => {
    const f = i.origin[0] - t[0], d = i.origin[2] - t[2];
    if (f * f + d * d > e * e) return;
    const g = performance.now();
    if (g - c.current < r) return !0;
    c.current = g, l.current = g;
    const h = X.getState().fishingBonus();
    if (Math.random() > Math.min(0.95, s + h))
      return A("warn", "놓쳤다…"), !0;
    const y = It(n, "fish:", Q.getState().tags), w = Mt(y);
    if (!w) return !0;
    const M = V().get(w);
    return N.getState().add(w, 1) > 0 ? A("warn", "인벤토리가 가득 찼습니다") : A("reward", `${M?.name ?? w} 낚음!`), !0;
  }, [t, e, r, n, s]);
  return j("rod", p), K(() => {
    const i = u.current;
    if (!i) return;
    const f = (performance.now() - l.current) / 1e3;
    if (f < 0.6) {
      const d = f / 0.6;
      i.scale.setScalar(0.4 + d * 1.4);
      const g = i.material;
      g.opacity = 0.55 * (1 - d);
    } else
      i.scale.setScalar(0);
  }), /* @__PURE__ */ m("group", { position: t, children: o && /* @__PURE__ */ D("mesh", { ref: u, rotation: [-Math.PI / 2, 0, 0], position: [0, 0.04, 0], children: [
    /* @__PURE__ */ m("ringGeometry", { args: [0.4, 0.6, 32] }),
    /* @__PURE__ */ m("meshBasicMaterial", { color: a, transparent: !0, opacity: 0, depthWrite: !1 })
  ] }) });
}
const xt = [
  { itemId: "bug-butterfly", weight: 70 },
  { itemId: "bug-beetle", weight: 22 },
  { itemId: "bug-stag", weight: 8 }
];
function Rt(t, e, n) {
  const r = [];
  for (const a of n) a.startsWith(e) && r.push(a.slice(e.length));
  if (r.length === 0) return t;
  const s = new Set(r), o = t.filter((a) => s.has(a.itemId));
  return o.length > 0 ? o : t;
}
function At(t) {
  if (t.length === 0) return null;
  const e = t.reduce((r, s) => r + Math.max(0, s.weight), 0);
  if (e <= 0) return null;
  let n = Math.random() * e;
  for (const r of t)
    if (n -= Math.max(0, r.weight), n <= 0) return r.itemId;
  return t[t.length - 1].itemId;
}
function jt({
  position: t,
  radius: e = 2.4,
  pool: n = xt,
  cooldownMs: r = 600,
  successChance: s = 0.7,
  bugColor: o = "#ffd0e0",
  hoverHeight: a = 1.2
}) {
  const c = I(-1 / 0), u = I(null), [l, p] = P(!0), i = I(-1 / 0), f = W((d) => {
    if (!l) return;
    const g = d.origin[0] - t[0], h = d.origin[2] - t[2];
    if (g * g + h * h > e * e) return;
    const y = performance.now();
    if (y - c.current < r) return !0;
    c.current = y;
    const w = X.getState().bugBonus();
    if (Math.random() > Math.min(0.95, Math.max(0.05, s + w)))
      return A("warn", "날아갔다…"), p(!1), i.current = y + 8e3, !0;
    const M = Rt(n, "bug:", Q.getState().tags), S = At(M);
    if (!S) return !0;
    const x = V().get(S);
    return N.getState().add(S, 1) > 0 ? A("warn", "인벤토리가 가득 찼습니다") : A("reward", `${x?.name ?? S} 잡았다!`), p(!1), i.current = y + 12e3, !0;
  }, [t, e, r, n, s, l]);
  return j("net", f), K(({ clock: d }) => {
    const g = performance.now();
    !l && g >= i.current && p(!0);
    const h = u.current;
    if (!h || !l) return;
    const y = d.elapsedTime;
    h.position.x = Math.sin(y * 1.2) * 0.6, h.position.z = Math.cos(y * 0.9) * 0.6, h.position.y = a + Math.sin(y * 2.6) * 0.15, h.rotation.y = y * 1.4;
  }), l ? /* @__PURE__ */ m("group", { position: t, children: /* @__PURE__ */ D("mesh", { ref: u, children: [
    /* @__PURE__ */ m("sphereGeometry", { args: [0.12, 10, 10] }),
    /* @__PURE__ */ m("meshToonMaterial", { color: o })
  ] }) }) : /* @__PURE__ */ m("group", { position: t });
}
export {
  jt as B,
  lt as D,
  Vt as F,
  it as R,
  Kt as T,
  Wt as a,
  Pt as b,
  ht as c,
  J as d,
  at as e,
  ct as f,
  gt as g,
  pt as h,
  Ut as i,
  bt as j,
  j as k,
  $t as l,
  St as n,
  yt as p,
  Lt as u
};
