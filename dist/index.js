import "reflect-metadata";
import { a as pe, A as Zi, R as Xi, M as Ki, c as Xo, I as Ji, H as Zt, P as Br, d as Qi } from "./useSpawnFromBlueprint-Cxb3C2ch.js";
import { B as jm, F as $m, V as Vm, e as qm, f as Ym, W as Zm, b as Xm, u as Km } from "./useSpawnFromBlueprint-Cxb3C2ch.js";
import { i as Qm, a as e0, g as t0, B as n0, h as r0, b as o0, C as i0, G as s0, r as a0, e as l0, u as c0, f as u0, c as d0, d as f0 } from "./registerComponents-CYCKQxA1.js";
import { c as zr, d as Xt, u as Ko, e as yt, f as O, C as es, g as ts, a as ns, b as rs, G as os, T as ie, F as In, h as Te, i as pt, j as mt, P as is, k as ss, l as as, w as ls, t as cs, m as us, n as ds, o as fs, p as ps } from "./index-Dy8k8h6n.js";
import { D as m0, M as h0, v as g0, x as y0, S as b0, y as v0, r as x0, q as w0, z as S0, A as M0, s as C0 } from "./index-Dy8k8h6n.js";
import { jsx as l, jsxs as b, Fragment as Se } from "react/jsx-runtime";
import Ce, { useState as Z, useEffect as L, useRef as E, useCallback as q, forwardRef as ms, useId as hs, useMemo as F, Suspense as tt, useLayoutEffect as Fe, memo as gs } from "react";
import { useFrame as de, useThree as Je, Canvas as ys, extend as An, useLoader as bs } from "@react-three/fiber";
import * as v from "three";
import { u as ve, a as Ge } from "./weatherStore-ZW3thKj6.js";
import { createNoise2D as Dr } from "simplex-noise";
import { useGLTF as Jo, useAnimations as vs, Text as xs, Environment as ws, Grid as Ss, useTexture as Fr, shaderMaterial as Lr, OrbitControls as Ms } from "@react-three/drei";
import { create as we } from "zustand";
import { SkeletonUtils as Qo, Water as Cs } from "three-stdlib";
import { RigidBody as Mt, CapsuleCollider as ks, Physics as Is, euler as As, CuboidCollider as Gr } from "@react-three/rapier";
import { enableMapSet as Ts } from "immer";
import { immer as _s } from "zustand/middleware/immer";
import { u as Ps } from "./authStore-CU_xZzJ7.js";
import { useShallow as ei } from "zustand/react/shallow";
class ap {
  id;
  precision;
  constructor(e = {}) {
    this.id = e.id ?? "free", this.precision = e.precision ?? 1e3;
  }
  toWorld(e) {
    return { ...e.position };
  }
  fromWorld(e) {
    return { position: { ...e } };
  }
  getNeighbors(e) {
    return [e];
  }
  equals(e, t) {
    return this.key(e) === this.key(t);
  }
  key(e) {
    const t = e.position;
    return [
      this.quantize(t.x),
      this.quantize(t.y),
      this.quantize(t.z)
    ].join(":");
  }
  quantize(e) {
    return Math.round(e * this.precision) / this.precision;
  }
}
class Rs extends Error {
  constructor(e) {
    super(`Extension "${e}" is already registered.`), this.name = "DuplicateExtensionError";
  }
}
class Ns extends Error {
  constructor(e) {
    super(`Extension "${e}" is not registered.`), this.name = "MissingExtensionError";
  }
}
class ze {
  entries = /* @__PURE__ */ new Map();
  register(e, t, r) {
    if (this.entries.has(e))
      throw new Rs(e);
    const o = r === void 0 ? { id: e, value: t } : { id: e, value: t, pluginId: r };
    this.entries.set(e, o);
  }
  get(e) {
    return this.entries.get(e)?.value;
  }
  require(e) {
    const t = this.get(e);
    if (t === void 0)
      throw new Ns(e);
    return t;
  }
  has(e) {
    return this.entries.has(e);
  }
  remove(e) {
    return this.entries.delete(e);
  }
  list() {
    return Array.from(this.entries.values());
  }
  clear() {
    this.entries.clear();
  }
}
class Es {
  handlers = /* @__PURE__ */ new Map();
  on(e, t) {
    const r = this.handlers.get(e) ?? /* @__PURE__ */ new Set();
    return r.add(t), this.handlers.set(e, r), () => this.off(e, t);
  }
  once(e, t) {
    const r = (o) => {
      this.off(e, r), t(o);
    };
    return this.on(e, r);
  }
  off(e, t) {
    const r = this.handlers.get(e);
    r && (r.delete(t), r.size === 0 && this.handlers.delete(e));
  }
  emit(e, t) {
    const r = this.handlers.get(e);
    if (r)
      for (const o of Array.from(r))
        o(t);
  }
  clear(e) {
    if (e === void 0) {
      this.handlers.clear();
      return;
    }
    this.handlers.delete(e);
  }
}
const Jt = {
  debug: () => {
  },
  info: () => {
  },
  warn: () => {
  },
  error: () => {
  }
};
function Bs(n = {}) {
  return {
    debug: n.debug ?? Jt.debug,
    info: n.info ?? Jt.info,
    warn: n.warn ?? Jt.warn,
    error: n.error ?? Jt.error
  };
}
function zs(n, e = {}) {
  return {
    plugins: n,
    events: new Es(),
    logger: Bs(e.logger),
    grid: new ze(),
    placement: new ze(),
    catalog: new ze(),
    assets: new ze(),
    rendering: new ze(),
    input: new ze(),
    interactions: new ze(),
    npc: new ze(),
    quests: new ze(),
    blueprints: new ze(),
    editor: new ze(),
    save: new ze()
  };
}
class Ds extends Error {
  constructor(e) {
    super(`Plugin "${e}" is already registered.`), this.name = "DuplicatePluginError";
  }
}
class Fs extends Error {
  constructor(e, t) {
    super(`Plugin "${e}" depends on missing plugin "${t}".`), this.name = "MissingPluginDependencyError";
  }
}
class Ls extends Error {
  constructor(e) {
    super(`Circular plugin dependency detected while setting up "${e}".`), this.name = "CircularPluginDependencyError";
  }
}
class Gs {
  records = /* @__PURE__ */ new Map();
  setupOrder = [];
  context;
  constructor(e = {}) {
    this.context = zs(this, e);
  }
  register(e) {
    if (this.records.has(e.id))
      throw new Ds(e.id);
    this.records.set(e.id, {
      plugin: e,
      manifest: this.toManifest(e),
      status: "registered"
    });
  }
  async use(e) {
    this.register(e), await this.setup(e.id);
  }
  async setupAll() {
    for (const e of this.records.keys())
      await this.setup(e);
  }
  async setup(e) {
    await this.setupInternal(e, /* @__PURE__ */ new Set());
  }
  async dispose(e) {
    const t = this.records.get(e);
    !t || t.status === "disposed" || (t.status = "disposing", await t.plugin.dispose?.(this.context), t.status = "disposed", this.removeFromSetupOrder(e));
  }
  async disposeAll() {
    const e = Array.from(this.setupOrder).reverse();
    for (const t of e)
      await this.dispose(t);
  }
  has(e) {
    return this.records.has(e);
  }
  get(e) {
    return this.records.get(e);
  }
  list() {
    return Array.from(this.records.values());
  }
  status(e) {
    return this.records.get(e)?.status;
  }
  async setupInternal(e, t) {
    const r = this.records.get(e);
    if (r && r.status !== "ready") {
      if (r.status === "setting-up" || t.has(e))
        throw new Ls(e);
      t.add(e);
      for (const o of r.plugin.dependencies ?? []) {
        if (!this.records.has(o))
          throw new Fs(e, o);
        await this.setupInternal(o, t);
      }
      for (const o of r.plugin.optionalDependencies ?? [])
        this.records.has(o) && await this.setupInternal(o, t);
      r.status = "setting-up";
      try {
        await r.plugin.setup(this.context), r.status = "ready", this.setupOrder.includes(e) || this.setupOrder.push(e);
      } catch (o) {
        throw r.status = "failed", r.error = o, o;
      } finally {
        t.delete(e);
      }
    }
  }
  toManifest(e) {
    const t = {
      id: e.id,
      name: e.name,
      version: e.version,
      runtime: e.runtime ?? "client",
      capabilities: e.capabilities ?? []
    }, r = this.toDependencyRecord(e.dependencies), o = this.toDependencyRecord(e.optionalDependencies);
    return r && (t.dependencies = r), o && (t.optionalDependencies = o), t;
  }
  toDependencyRecord(e) {
    if (!(!e || e.length === 0))
      return Object.fromEntries(e.map((t) => [t, "*"]));
  }
  removeFromSetupOrder(e) {
    const t = this.setupOrder.indexOf(e);
    t !== -1 && this.setupOrder.splice(t, 1);
  }
}
function lp(n = {}) {
  return new Gs(n);
}
const Os = [
  { value: "idle", label: "Idle" },
  { value: "walk", label: "Walk" },
  { value: "run", label: "Run" },
  { value: "jump", label: "Jump" },
  { value: "fall", label: "Fall" },
  { value: "dance", label: "Dance" },
  { value: "wave", label: "Wave" }
];
function Us() {
  const { playAnimation: n, currentType: e, currentAnimation: t } = zr(), r = (o) => {
    n(e, o);
  };
  return /* @__PURE__ */ l("div", { className: "ac-panel", children: /* @__PURE__ */ l("div", { className: "ac-grid", children: Os.map((o) => /* @__PURE__ */ l(
    "button",
    {
      className: `ac-button ${o.value === t ? "active" : ""}`,
      onClick: () => r(o.value),
      title: o.label,
      children: o.label
    },
    o.value
  )) }) });
}
const Ws = () => /* @__PURE__ */ l("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ l("path", { d: "M8 5v14l11-7z" }) }), Hs = () => /* @__PURE__ */ l("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ l("path", { d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z" }) }), js = () => /* @__PURE__ */ l("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ l("path", { d: "M6 6h2v12H6zm3.5 6l8.5 6V6z" }) }), $s = () => /* @__PURE__ */ l("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ l("path", { d: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" }) });
function Vs() {
  const { bridge: n, playAnimation: e, stopAnimation: t, currentType: r, currentAnimation: o } = zr(), [i, s] = Z(!1), [a, u] = Z([]), [c, f] = Z(30);
  L(() => {
    if (!n) return;
    const p = () => {
      const x = n.snapshot(r);
      x && (s(x.isPlaying), u(x.availableAnimations));
    };
    return p(), n.subscribe((x, y) => {
      y === r && p();
    });
  }, [n, r]);
  const d = () => {
    i ? t(r) : e(r, o);
  };
  return /* @__PURE__ */ b("div", { className: "ap-panel", children: [
    /* @__PURE__ */ b("div", { className: "ap-controls", children: [
      /* @__PURE__ */ l(
        "select",
        {
          className: "ap-select",
          value: o,
          onChange: (p) => e(r, p.target.value),
          children: a.map((p) => /* @__PURE__ */ l("option", { value: p, children: p }, p))
        }
      ),
      /* @__PURE__ */ b("div", { className: "ap-buttons", children: [
        /* @__PURE__ */ l("button", { className: "ap-btn", "aria-label": "previous animation", children: /* @__PURE__ */ l(js, {}) }),
        /* @__PURE__ */ l("button", { className: "ap-btn-primary", onClick: d, "aria-label": i ? "pause" : "play", children: i ? /* @__PURE__ */ l(Hs, {}) : /* @__PURE__ */ l(Ws, {}) }),
        /* @__PURE__ */ l("button", { className: "ap-btn", "aria-label": "next animation", children: /* @__PURE__ */ l($s, {}) })
      ] })
    ] }),
    /* @__PURE__ */ b("div", { className: "ap-timeline", children: [
      /* @__PURE__ */ l("span", { className: "ap-time", children: "0:00" }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "range",
          className: "ap-slider",
          min: "0",
          max: "100",
          value: c,
          onChange: (p) => f(Number(p.target.value))
        }
      ),
      /* @__PURE__ */ l("span", { className: "ap-time", children: "1:30" })
    ] })
  ] });
}
const qs = [
  {
    key: "currentAnimation",
    label: "현재 애니메이션",
    format: "text",
    enabled: !0
  },
  {
    key: "animationType",
    label: "애니메이션 타입",
    format: "text",
    enabled: !0
  },
  {
    key: "isPlaying",
    label: "재생 상태",
    format: "text",
    enabled: !0
  },
  {
    key: "weight",
    label: "가중치",
    format: "number",
    enabled: !0
  },
  {
    key: "speed",
    label: "속도",
    format: "number",
    enabled: !0
  },
  {
    key: "blendDuration",
    label: "블렌드 시간",
    format: "number",
    enabled: !1
  },
  {
    key: "activeActions",
    label: "활성 액션",
    format: "number",
    enabled: !0
  },
  {
    key: "availableAnimations",
    label: "사용 가능 애니메이션",
    format: "array",
    enabled: !1
  },
  {
    key: "frameCount",
    label: "프레임 카운트",
    format: "number",
    enabled: !1
  },
  {
    key: "averageFrameTime",
    label: "평균 프레임 시간",
    format: "number",
    enabled: !1
  }
];
function Ys() {
  const { bridge: n, currentType: e } = zr(), [t, r] = Z({
    frameCount: 0,
    averageFrameTime: 0,
    lastUpdateTime: Date.now(),
    currentAnimation: "idle",
    animationType: "character",
    availableAnimations: [],
    isPlaying: !1,
    weight: 1,
    speed: 1,
    blendDuration: 0.3,
    activeActions: 0
  });
  L(() => {
    if (!n) return;
    const s = () => {
      const u = n.snapshot(e);
      if (!u) return;
      const c = n.getMetrics(e);
      r((f) => ({
        ...f,
        currentAnimation: u.currentAnimation,
        animationType: e,
        availableAnimations: u.availableAnimations,
        isPlaying: u.isPlaying,
        weight: u.weight,
        speed: u.speed,
        activeActions: u.metrics.activeAnimations,
        frameCount: c?.totalActions || 0,
        averageFrameTime: c?.mixerTime || 0,
        lastUpdateTime: Date.now()
      }));
    };
    return s(), n.subscribe((u, c) => {
      c === e && s();
    });
  }, [n, e]);
  const o = (s, a, u = 2) => {
    if (s == null) return "N/A";
    switch (a) {
      case "array":
        return Array.isArray(s) ? `${s.length} animations` : String(s);
      case "boolean":
        return s ? "Yes" : "No";
      case "number":
        return typeof s == "number" ? s.toFixed(u) : String(s);
      default:
        return String(s);
    }
  }, i = (s) => {
    if (s in t)
      return t[s];
  };
  return /* @__PURE__ */ l("div", { className: "ad-panel", children: /* @__PURE__ */ l("div", { className: "ad-content", children: qs.filter((s) => s.enabled).map((s) => /* @__PURE__ */ b("div", { className: "ad-item", children: [
    /* @__PURE__ */ l("span", { className: "ad-label", children: s.label }),
    /* @__PURE__ */ l("span", { className: "ad-value", children: o(i(s.key), s.format) })
  ] }, s.key)) }) });
}
const Zs = [
  { value: "thirdPerson", label: "Third Person" },
  { value: "firstPerson", label: "First Person" },
  { value: "chase", label: "Chase" },
  { value: "topDown", label: "Top Down" },
  { value: "isometric", label: "Isometric" },
  { value: "sideScroll", label: "Side-Scroller" },
  { value: "fixed", label: "Fixed" }
];
function Xs() {
  const { mode: n, setMode: e } = pe(), t = n?.control || "thirdPerson";
  return /* @__PURE__ */ l("div", { className: "cc-panel", children: /* @__PURE__ */ l("div", { className: "cc-list", children: Zs.map((r) => /* @__PURE__ */ l(
    "button",
    {
      className: `cc-button ${t === r.value ? "active" : ""}`,
      onClick: () => e({ control: r.value }),
      children: r.label
    },
    r.value
  )) }) });
}
const Ks = [
  { key: "mode", label: "Mode", enabled: !0, format: "text" },
  { key: "position", label: "Position", enabled: !0, format: "vector3", precision: 2 },
  { key: "distance", label: "Distance", enabled: !0, format: "vector3", precision: 2 },
  { key: "fov", label: "FOV", enabled: !0, format: "angle", precision: 1 },
  { key: "velocity", label: "Velocity", enabled: !1, format: "vector3", precision: 2 },
  { key: "rotation", label: "Rotation", enabled: !1, format: "vector3", precision: 2 },
  { key: "zoom", label: "Zoom", enabled: !1, format: "number", precision: 2 },
  { key: "activeController", label: "Controller", enabled: !0, format: "text" }
];
function Bn(n) {
  if (typeof n != "object" || n === null) return !1;
  const e = n;
  return typeof e.x == "number" && typeof e.y == "number" && typeof e.z == "number";
}
function Js() {
  const n = {
    frameCount: 0,
    averageFrameTime: 0,
    lastUpdateTime: Date.now(),
    mode: "unknown",
    activeController: "unknown",
    distance: null,
    fov: 0,
    position: null,
    targetPosition: null,
    velocity: null,
    rotation: null
  }, [e, t] = Z(n), r = pe((d) => d.mode), o = pe((d) => d.cameraOption), { activeState: i } = Xt(), s = E(n), a = q((d, p) => d === p ? !1 : Bn(d) ? Bn(p) ? d.x !== p.x || d.y !== p.y || d.z !== p.z : !0 : typeof d != "object" || d === null ? !0 : JSON.stringify(d) !== JSON.stringify(p), []), u = q((d) => Bn(d) ? { x: d.x, y: d.y, z: d.z } : null, []), c = q(() => {
    const d = o?.xDistance !== void 0 && o?.yDistance !== void 0 && o?.zDistance !== void 0 ? {
      x: o.xDistance,
      y: o.yDistance,
      z: o.zDistance
    } : null, p = {
      ...s.current,
      mode: r?.control ?? "unknown",
      activeController: o?.mode ?? r?.control ?? "unknown",
      distance: d,
      fov: o?.fov ?? 0,
      position: u(i?.position),
      targetPosition: u(o?.target),
      velocity: u(i?.velocity),
      rotation: u(i?.euler),
      lastUpdateTime: Date.now(),
      ...o?.zoom !== void 0 ? { zoom: o.zoom } : {}
    };
    Object.keys(p).some(
      (x) => a(
        p[x],
        s.current[x]
      )
    ) && (s.current = p, t(p));
  }, [r, o, i, a, u]);
  L(() => {
    c();
    const d = setInterval(c, 100);
    return () => {
      clearInterval(d);
    };
  }, [c]);
  const f = q((d, p = 2) => d == null ? "N/A" : typeof d == "object" && d.x !== void 0 ? `X:${d.x.toFixed(p)} Y:${d.y.toFixed(p)} Z:${d.z.toFixed(p)}` : typeof d == "number" ? d.toFixed(p) : d.toString(), []);
  return /* @__PURE__ */ l("div", { className: "cd-panel", children: /* @__PURE__ */ l("div", { className: "cd-grid", children: Ks.map((d) => /* @__PURE__ */ b("div", { className: "cd-item", children: [
    /* @__PURE__ */ l("span", { className: "cd-label", children: d.label }),
    /* @__PURE__ */ l("span", { className: "cd-value", children: f(e[d.key]) })
  ] }, d.key)) }) });
}
const Qs = [
  {
    id: "classic",
    name: "Classic",
    description: "A traditional third-person view.",
    icon: "camera",
    config: {
      mode: "thirdPerson",
      distance: { x: 0, y: 8, z: 10 },
      fov: 75,
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 }
    }
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Smooth, movie-like camera work.",
    icon: "camera",
    config: {
      mode: "chase",
      distance: { x: 2, y: 7, z: 8 },
      fov: 60,
      smoothing: { position: 0.05, rotation: 0.05, fov: 0.05 }
    }
  },
  {
    id: "action",
    name: "Action",
    description: "Responsive camera for fast gameplay.",
    icon: "camera",
    config: {
      mode: "thirdPerson",
      distance: { x: 0, y: 6, z: 6 },
      fov: 85,
      smoothing: { position: 0.2, rotation: 0.2, fov: 0.2 }
    }
  },
  {
    id: "strategy",
    name: "Strategy",
    description: "Top-down view for an overview.",
    icon: "camera",
    config: {
      mode: "topDown",
      distance: { x: 0, y: 20, z: 0 },
      fov: 45,
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 }
    }
  },
  {
    id: "retro",
    name: "Retro",
    description: "Classic side-scroller style.",
    icon: "camera",
    config: {
      mode: "sideScroll",
      distance: { x: 15, y: 0, z: 0 },
      fov: 75,
      smoothing: { position: 0.15, rotation: 0.15, fov: 0.15 }
    }
  }
];
function ea(n, e) {
  return !n || !e ? !1 : n.x === e.x && n.y === e.y && n.z === e.z;
}
function ta(n) {
  const e = n?.xDistance, t = n?.yDistance, r = n?.zDistance;
  if (!(e === void 0 || t === void 0 || r === void 0))
    return { x: e, y: t, z: r };
}
function na() {
  const [n] = Z(Qs), e = pe((u) => u.setMode), t = pe((u) => u.setCameraOption), r = pe((u) => u.mode), o = pe((u) => u.cameraOption), [i, s] = Z(null), a = q((u) => {
    e({ control: u.config.mode }), t({
      xDistance: u.config.distance.x,
      yDistance: u.config.distance.y,
      zDistance: u.config.distance.z,
      fov: u.config.fov,
      smoothing: u.config.smoothing || { position: 0.1, rotation: 0.1, fov: 0.1 }
    });
  }, [e, t, o]);
  return L(() => {
    const u = n.find(
      (c) => c.config.mode === r?.control && ea(c.config.distance, ta(o))
    );
    s(u ? u.id : null);
  }, [r, o, n]), /* @__PURE__ */ l("div", { className: "cp-panel", children: /* @__PURE__ */ l("div", { className: "cp-grid", children: n.map((u) => /* @__PURE__ */ b(
    "button",
    {
      className: `cp-item ${i === u.id ? "active" : ""}`,
      onClick: () => a(u),
      children: [
        /* @__PURE__ */ l("div", { className: "cp-name", children: u.name }),
        /* @__PURE__ */ l("div", { className: "cp-description", children: u.description })
      ]
    },
    u.id
  )) }) });
}
function cp() {
  const { activeState: n, gameStates: e } = Xt(), t = pe((s) => s.mode), r = pe((s) => s.controllerOptions), o = pe(ei((s) => s));
  return {
    state: n || null,
    mode: t,
    states: e,
    control: r,
    context: { mode: t, states: e, control: r },
    controller: o
  };
}
function ti() {
  const { activeState: n, updateActiveState: e } = Xt(), t = !!n;
  return {
    teleport: q((o, i) => {
      if (!n) {
        console.warn("[useTeleport]: Cannot teleport - activeState not available");
        return;
      }
      e({
        position: o.clone(),
        euler: i || n.euler
      });
    }, [n, e]),
    canTeleport: t
  };
}
const to = {
  minimap: {
    enabled: !0,
    position: "bottom-right",
    size: 200,
    opacity: 0.9,
    showZoom: !0,
    showCompass: !0,
    updateInterval: 33
  },
  tooltip: {
    enabled: !0,
    delay: 500,
    fadeSpeed: 200,
    maxWidth: 300,
    fontSize: 14
  },
  hud: {
    enabled: !0,
    opacity: 0.9,
    showHealthBar: !0,
    showManaBar: !0,
    showExperienceBar: !0
  },
  modal: {
    closeOnEscape: !0,
    closeOnBackdrop: !0,
    backdropOpacity: 0.5
  },
  notifications: {
    maxCount: 5,
    autoHideDuration: 5e3,
    position: "top-right"
  },
  speechBalloon: {
    enabled: !0,
    fontSize: 80,
    padding: 30,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "#000000",
    maxWidth: 100,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    textColor: "#000000",
    fadeDistance: 20,
    scaleMultiplier: 2,
    defaultOffset: { x: 0, y: 4.5, z: 0 }
  }
}, ra = we((n) => ({
  config: to,
  updateConfig: (e) => n((t) => ({
    config: { ...t.config, ...e }
  })),
  updateMinimapConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      minimap: { ...t.config.minimap, ...e }
    }
  })),
  updateTooltipConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      tooltip: { ...t.config.tooltip, ...e }
    }
  })),
  updateHudConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      hud: { ...t.config.hud, ...e }
    }
  })),
  updateModalConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      modal: { ...t.config.modal, ...e }
    }
  })),
  updateNotificationsConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      notifications: { ...t.config.notifications, ...e }
    }
  })),
  updateSpeechBalloonConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      speechBalloon: { ...t.config.speechBalloon, ...e }
    }
  })),
  resetConfig: () => n({ config: to })
})), ht = we((n, e) => ({
  entries: /* @__PURE__ */ new Map(),
  current: null,
  register: (t) => {
    const r = new Map(e().entries);
    r.set(t.id, t), n({ entries: r });
  },
  unregister: (t) => {
    const r = e().entries;
    if (!r.has(t)) return;
    const o = new Map(r);
    o.delete(t), n({ entries: o });
  },
  updatePosition: (t, r) => {
    const o = e().entries.get(t);
    o && o.position.copy(r);
  },
  getAll: () => Array.from(e().entries.values()),
  setCurrent: (t) => {
    const r = e().current;
    r !== t && (r && t && r.id === t.id && Math.abs(r.distance - t.distance) < 0.05 || n({ current: t }));
  },
  activateCurrent: () => {
    const t = e().current;
    if (!t) return;
    const r = e().entries.get(t.id);
    r && r.onActivate();
  }
}));
function oa({ value: n, name: e, gamePadButtonStyle: t }) {
  const [r, o] = Z(!1), { pushKey: i } = Ko(), s = () => {
    i(n, !0), o(!0);
  }, a = () => {
    i(n, !1), o(!1);
  };
  return /* @__PURE__ */ l(
    "button",
    {
      className: `pad-button ${r ? "is-clicked" : ""}`,
      onMouseDown: s,
      onMouseUp: a,
      onMouseLeave: a,
      onContextMenu: (u) => {
        u.preventDefault(), a();
      },
      onPointerDown: s,
      onPointerUp: a,
      style: t,
      children: e
    }
  );
}
function up(n) {
  const { gamePadStyle: e, gamePadButtonStyle: t, label: r } = n, o = pe((a) => a.interaction?.keyboard), { mode: i } = pe();
  Ko();
  const s = Object.keys(o || {}).map((a) => {
    const u = r?.[a] || a;
    return a === "forward" || a === "backward" || a === "leftward" || a === "rightward" ? {
      key: a,
      name: u,
      type: "direction",
      active: o?.[a] || !1
    } : {
      key: a,
      name: u,
      type: "action",
      active: o?.[a] || !1
    };
  }).filter(Boolean);
  return /* @__PURE__ */ l(
    "div",
    {
      className: "gamepad-container",
      style: {
        ...e,
        display: i?.controller === "gamepad" ? "flex" : "none"
      },
      children: s.map((a) => /* @__PURE__ */ l(
        oa,
        {
          value: a.key,
          name: a.name,
          gamePadButtonStyle: t
        },
        a.key
      ))
    }
  );
}
const no = [
  { id: "slow", name: "Slow", maxSpeed: 5, acceleration: 8 },
  { id: "normal", name: "Normal", maxSpeed: 10, acceleration: 15 },
  { id: "fast", name: "Fast", maxSpeed: 20, acceleration: 25 },
  { id: "sprint", name: "Sprint", maxSpeed: 35, acceleration: 40 }
], ro = [
  { id: "eco", name: "Eco", maxSpeed: 15, acceleration: 10 },
  { id: "comfort", name: "Comfort", maxSpeed: 25, acceleration: 20 },
  { id: "sport", name: "Sport", maxSpeed: 40, acceleration: 35 },
  { id: "turbo", name: "Turbo", maxSpeed: 60, acceleration: 50 }
];
function ia(n, e) {
  const t = n ?? "bottom-left", r = {
    position: "fixed",
    zIndex: e ?? 1e4
  };
  return t.includes("top") && (r.top = 12), t.includes("bottom") && (r.bottom = 12), t.includes("left") && (r.left = 12), t.includes("right") && (r.right = 12), r;
}
function ni(n) {
  const e = ia(n.position, n.zIndex), t = pe((p) => p.mode), r = pe((p) => p.setMode), o = pe((p) => p.setPhysics), i = t?.type === "vehicle" ? "vehicle" : "character", s = i === "vehicle" ? ro : no, [a, u] = Z(
    i === "vehicle" ? "comfort" : "normal"
  ), c = q(
    (p, h) => {
      const y = (p === "vehicle" ? ro : no).find((g) => g.id === h);
      if (y) {
        if (p === "vehicle") {
          o({ maxSpeed: y.maxSpeed, accelRatio: y.acceleration });
          return;
        }
        o({
          walkSpeed: Math.max(1, y.maxSpeed * 0.5),
          runSpeed: y.maxSpeed,
          accelRatio: y.acceleration
        });
      }
    },
    [o]
  ), f = q((p) => {
    u(p), c(i, p), n.onPresetChange?.(p);
  }, [c, i, n]), d = q((p) => {
    const h = p.target.value;
    r({ type: h });
    const x = h === "vehicle" ? "comfort" : "normal";
    u(x), c(h, x), n.onPresetChange?.(x);
  }, [c, r, n]);
  return /* @__PURE__ */ b("div", { className: `mc-panel ${n.compact ? "compact" : ""}`, style: e, children: [
    /* @__PURE__ */ b("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ l("label", { htmlFor: "motion-type-select", className: "mc-label", children: "Motion Type" }),
      /* @__PURE__ */ b(
        "select",
        {
          id: "motion-type-select",
          className: "mc-select",
          value: i,
          onChange: d,
          children: [
            /* @__PURE__ */ l("option", { value: "character", children: "Character" }),
            /* @__PURE__ */ l("option", { value: "vehicle", children: "Vehicle" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ b("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ l("label", { className: "mc-label", children: "Presets" }),
      /* @__PURE__ */ l("div", { className: "mc-presets-grid", children: s.map((p) => /* @__PURE__ */ l(
        "button",
        {
          className: `mc-preset-btn ${p.id === a ? "active" : ""}`,
          onClick: () => f(p.id),
          title: `Max Speed: ${p.maxSpeed}, Accel: ${p.acceleration}`,
          children: p.name
        },
        p.id
      )) })
    ] })
  ] });
}
function sa() {
  const { cameraOption: n, setCameraOption: e } = pe.getState();
  n?.focus && e({
    focus: !1
  });
}
const aa = ms(
  ({ children: n, position: e, focusDistance: t = 10, focusDuration: r = 1, onFocus: o, onBlur: i, ...s }, a) => {
    const u = pe((x) => x.setCameraOption), c = pe((x) => x.cameraOption), f = (x) => {
      if (x.stopPropagation(), !c?.enableFocus) return;
      if (c.focus) {
        sa(), i && i(x);
        return;
      }
      const y = x.object.getWorldPosition(new v.Vector3());
      u({
        focusTarget: y,
        focusDuration: r,
        focusDistance: t,
        focus: !0
      }), o && o(x);
    }, d = () => {
      c?.enableFocus && (document.body.style.cursor = "pointer");
    }, p = (x) => {
      document.body.style.cursor = "default", i && !c?.focus && i(x);
    }, h = {
      ...s,
      ...e ? { position: e } : {}
    };
    return /* @__PURE__ */ l(
      "group",
      {
        ref: a,
        onClick: f,
        onPointerOver: d,
        onPointerOut: p,
        ...h,
        children: n
      }
    );
  }
);
aa.displayName = "FocusableObject";
function dp({
  id: n,
  kind: e = "misc",
  label: t,
  range: r = 2.2,
  activationKey: o = "e",
  data: i,
  onActivate: s,
  position: a,
  children: u
}) {
  const c = hs(), f = n ?? c, d = ht((g) => g.register), p = ht((g) => g.unregister), h = ht((g) => g.updatePosition), x = E(null), y = F(() => new v.Vector3(...a), [a]);
  return L(() => (d({
    id: f,
    kind: e,
    label: t,
    position: y.clone(),
    range: r,
    key: o,
    ...i ? { data: i } : {},
    onActivate: s
  }), () => p(f)), [f, e, t, r, o, i, s, d, p, y]), L(() => {
    h(f, y);
  }, [f, y, h]), /* @__PURE__ */ l("group", { ref: x, position: a, children: u });
}
const oo = new v.Vector3();
function ri() {
  return ht((n) => n.current);
}
function la(n = !0) {
  const e = ri(), t = ht((r) => r.activateCurrent);
  L(() => {
    if (!n || !e) return;
    const r = (o) => {
      const i = o.target?.tagName?.toLowerCase();
      i === "input" || i === "textarea" || o.key.toLowerCase() === e.key.toLowerCase() && t();
    };
    return window.addEventListener("keydown", r), () => window.removeEventListener("keydown", r);
  }, [e, n, t]);
}
function fp({ throttleMs: n = 80 } = {}) {
  const { position: e } = yt({ updateInterval: 16 }), t = ht((i) => i.entries), r = ht((i) => i.setCurrent), o = E(0);
  return de((i, s) => {
    if (o.current += s * 1e3, o.current < n) return;
    o.current = 0;
    let a = null, u = 1 / 0, c = "", f = "e";
    for (const d of t.values()) {
      oo.copy(d.position).sub(e);
      const p = oo.lengthSq(), h = d.range * d.range;
      p > h || p < u && (u = p, a = d.id, c = d.label, f = d.key);
    }
    if (!a) {
      r(null);
      return;
    }
    r({
      id: a,
      label: c,
      key: f,
      distance: Math.sqrt(u)
    });
  }), null;
}
function pp({ enabled: n = !0 }) {
  const e = ri();
  return la(n), !n || !e ? null : /* @__PURE__ */ b(
    "div",
    {
      style: {
        position: "fixed",
        bottom: 96,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 96,
        padding: "8px 14px",
        background: "rgba(18,20,28,0.55)",
        color: "#f3f4f8",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 22px rgba(0,0,0,0.32)",
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        pointerEvents: "none",
        userSelect: "none"
      },
      children: [
        /* @__PURE__ */ l(
          "span",
          {
            style: {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 22,
              height: 22,
              padding: "0 6px",
              borderRadius: 6,
              background: "#ffd84a",
              color: "#222",
              fontWeight: 700
            },
            children: e.key.toUpperCase()
          }
        ),
        /* @__PURE__ */ l("span", { children: e.label }),
        /* @__PURE__ */ b("span", { style: { opacity: 0.5, fontSize: 11 }, children: [
          e.distance.toFixed(1),
          "m"
        ] })
      ]
    }
  );
}
const io = [
  { key: "motionType", label: "Motion Type", type: "text" },
  { key: "position", label: "Position", type: "vector3" },
  { key: "velocity", label: "Velocity", type: "vector3" },
  { key: "speed", label: "Speed", type: "number" },
  { key: "direction", label: "Direction", type: "vector3" },
  { key: "isGrounded", label: "Grounded", type: "text" },
  { key: "isMoving", label: "Moving", type: "text" },
  { key: "acceleration", label: "Acceleration", type: "number" },
  { key: "jumpForce", label: "Jump Force", type: "number" },
  { key: "maxSpeed", label: "Max Speed", type: "number" },
  { key: "totalDistance", label: "Total Distance", type: "number" },
  { key: "gameState", label: "Game State", type: "text" }
];
function ca(n, e) {
  const t = n ?? "top-right", r = {
    position: "fixed",
    zIndex: e ?? 1e4
  };
  return t.includes("top") && (r.top = 12), t.includes("bottom") && (r.bottom = 12), t.includes("left") && (r.left = 12), t.includes("right") && (r.right = 12), r;
}
function oi(n) {
  const e = n.embedded ? {} : ca(n.position, n.zIndex), t = pe((f) => f.mode), r = pe((f) => f.physics), { activeState: o, gameStates: i } = Xt(), s = n.precision ?? 2, a = n.customFields ? [...io, ...n.customFields] : io, u = (f, d, p = 2) => {
    if (d == null) return "N/A";
    switch (f.type) {
      case "vector3":
        if (Array.isArray(d) && d.length === 3) {
          const [h, x, y] = d;
          return `X:${h.toFixed(p)} Y:${x.toFixed(p)} Z:${y.toFixed(p)}`;
        }
        if (typeof d == "object" && d !== null && "x" in d && "y" in d && "z" in d) {
          const h = d;
          return `X:${h.x.toFixed(p)} Y:${h.y.toFixed(p)} Z:${h.z.toFixed(p)}`;
        }
        return String(d);
      case "number":
        return typeof d == "number" ? d.toFixed(p) : String(d);
      default:
        return String(d);
    }
  }, c = (f) => {
    if (f.value !== void 0) return f.value;
    switch (f.key) {
      case "motionType":
        return t?.type ?? "character";
      case "position":
        return o?.position ? { x: o.position.x, y: o.position.y, z: o.position.z } : { x: 0, y: 0, z: 0 };
      case "velocity":
        return o?.velocity ? { x: o.velocity.x, y: o.velocity.y, z: o.velocity.z } : { x: 0, y: 0, z: 0 };
      case "speed":
        return o?.velocity ? o.velocity.length() : 0;
      case "direction":
        return o?.direction ? { x: o.direction.x, y: o.direction.y, z: o.direction.z } : { x: 0, y: 0, z: 0 };
      case "isGrounded":
        return i?.isOnTheGround ? "Yes" : "No";
      case "isMoving":
        return i?.isMoving ? "Yes" : "No";
      case "acceleration":
        return r?.accelRatio ?? 0;
      case "jumpForce":
        return r?.jumpSpeed ?? 0;
      case "maxSpeed":
        return t?.type === "character" ? r?.runSpeed ?? 0 : r?.maxSpeed ?? 0;
      case "totalDistance":
        return 0;
      case "gameState":
        return i?.isRiding ? "riding" : i?.isOnTheGround ? "ground" : "air";
      default:
        return null;
    }
  };
  return /* @__PURE__ */ l(
    "div",
    {
      className: `md-panel ${n.compact ? "compact" : ""} ${n.theme ? `theme-${n.theme}` : ""}`,
      style: e,
      children: /* @__PURE__ */ l("div", { className: "md-content", children: a.map((f) => /* @__PURE__ */ b("div", { className: "md-item", children: [
        /* @__PURE__ */ l("span", { className: "md-label", children: f.label }),
        /* @__PURE__ */ l("span", { className: "md-value", children: u(f, c(f), s) })
      ] }, f.key)) })
    }
  );
}
function mp({
  showController: n = !0,
  showDebugPanel: e = !0,
  controllerProps: t = {},
  debugPanelProps: r = {}
}) {
  return /* @__PURE__ */ b(Se, { children: [
    n && /* @__PURE__ */ l(
      ni,
      {
        position: "bottom-left",
        showLabels: !0,
        compact: !1,
        ...t
      }
    ),
    e && /* @__PURE__ */ l(
      oi,
      {
        position: "top-right",
        updateInterval: 100,
        precision: 2,
        compact: !1,
        ...r
      }
    )
  ] });
}
function hp({ text: n, position: e, teleportStyle: t }) {
  const { teleport: r, canTeleport: o } = ti();
  return /* @__PURE__ */ b(
    "div",
    {
      className: `teleport ${o ? "" : "teleport--disabled"}`,
      onClick: () => {
        r(e);
      },
      style: t,
      title: o ? "Click to teleport" : "Teleport not available",
      children: [
        n || "Teleport",
        !o && /* @__PURE__ */ l("span", { className: "teleport__cooldown", children: "⏱️" })
      ]
    }
  );
}
var ua = Object.defineProperty, da = Object.getOwnPropertyDescriptor, fa = (n, e, t) => e in n ? ua(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t, pa = (n, e, t, r) => {
  for (var o = r > 1 ? void 0 : r ? da(e, t) : e, i = n.length - 1, s; i >= 0; i--)
    (s = n[i]) && (o = s(o) || o);
  return o;
}, ma = (n, e, t) => fa(n, e + "", t);
let Ee = class extends Zi {
  listeners;
  constructor() {
    const n = {
      markers: /* @__PURE__ */ new Map(),
      canvas: null,
      ctx: null,
      isDirty: !0,
      lastPosition: null,
      lastRotation: null,
      gradientCache: {
        background: null,
        avatar: null
      },
      lastUpdate: Date.now()
    }, e = {
      markerCount: 0,
      renderTime: 0,
      frameTime: 0
    };
    super(n, e), this.listeners = /* @__PURE__ */ new Set();
  }
  static getInstance() {
    return (!Ee.instance || Ee.instance.isDisposed) && (Ee.instance = new Ee()), Ee.instance;
  }
  addMarker(n, e, t, r, o) {
    const i = { id: n, type: e, text: t, center: r, size: o };
    this.state.markers.set(n, i), this.updateMetrics(0), this.notifyListeners();
  }
  removeMarker(n) {
    this.state.markers.delete(n), this.updateMetrics(0), this.notifyListeners();
  }
  updateMarker(n, e) {
    const t = this.state.markers.get(n);
    t && (this.state.markers.set(n, { ...t, ...e }), this.updateMetrics(0), this.notifyListeners());
  }
  getMarkers() {
    return new Map(this.state.markers);
  }
  getMarker(n) {
    return this.state.markers.get(n);
  }
  clear() {
    this.state.markers.clear(), this.updateMetrics(0), this.notifyListeners();
  }
  subscribe(n) {
    return this.listeners.add(n), () => this.listeners.delete(n);
  }
  notifyListeners() {
    const n = this.getMarkers();
    this.listeners.forEach((e) => e(n));
  }
  setCanvas(n) {
    this.state.canvas = n, this.state.ctx = n ? n.getContext("2d") : null, this.state.isDirty = !0, this.state.gradientCache = {
      background: null,
      avatar: null
    };
  }
  checkForUpdates(n, e, t = 0.1, r = 0.01) {
    const o = this.state.lastPosition, i = this.state.lastRotation;
    if (!o || i === null) {
      this.state.isDirty = !0, this.state.lastPosition = { x: n.x, z: n.z }, this.state.lastRotation = e;
      return;
    }
    const s = Math.abs(n.x - o.x) > t || Math.abs(n.z - o.z) > t, a = Math.abs(e - i) > r;
    (s || a) && (this.state.isDirty = !0, this.state.lastPosition = { x: n.x, z: n.z }, this.state.lastRotation = e);
  }
  render(n) {
    if (!this.state.canvas || !this.state.ctx || !this.state.isDirty) return;
    const e = performance.now(), { size: t, scale: r, position: o, rotation: i, blockRotate: s, tileGroups: a, sceneObjects: u } = n, c = this.state.ctx;
    if (c.clearRect(0, 0, t, t), c.save(), c.beginPath(), c.arc(t / 2, t / 2, t / 2, 0, Math.PI * 2), c.clip(), !this.state.gradientCache.background) {
      const d = c.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
      d.addColorStop(0, "rgba(20, 30, 40, 0.9)"), d.addColorStop(1, "rgba(10, 20, 30, 0.95)"), this.state.gradientCache.background = d;
    }
    c.fillStyle = this.state.gradientCache.background, c.fillRect(0, 0, t, t);
    const f = i * 180 / Math.PI;
    c.translate(t / 2, t / 2), c.rotate(-f * Math.PI / 180), c.translate(-t / 2, -t / 2), c.save(), c.strokeStyle = "rgba(255, 255, 255, 0.1)", c.lineWidth = 1;
    for (let d = 0; d < t; d += 20)
      c.beginPath(), c.moveTo(d, 0), c.lineTo(d, t), c.moveTo(0, d), c.lineTo(t, d), c.stroke();
    c.restore(), this.renderCompass(c, t, f), a && a.size > 0 && this.renderTiles(c, t, r, o, a), u && u.size > 0 && this.renderSceneObjects(c, t, r, o, u), this.renderMarkers(c, t, r, o, f, s), this.renderAvatar(c, t), c.restore(), this.state.isDirty = !1, this.metrics.renderTime = performance.now() - e;
  }
  renderCompass(n, e, t) {
    n.save(), n.fillStyle = "white", n.font = "bold 16px sans-serif", n.shadowColor = "rgba(0, 0, 0, 0.8)", n.shadowBlur = 3, [
      { text: "N", x: e / 2, y: 25, color: "#ff6b6b" },
      { text: "S", x: e / 2, y: e - 25, color: "#4ecdc4" },
      { text: "E", x: e - 25, y: e / 2, color: "#45b7d1" },
      { text: "W", x: 25, y: e / 2, color: "#f9ca24" }
    ].forEach(({ text: o, x: i, y: s, color: a }) => {
      n.save(), n.fillStyle = a, n.translate(i, s), n.rotate(t * Math.PI / 180), n.textAlign = "center", n.textBaseline = "middle", n.fillText(o, 0, 0), n.restore();
    }), n.restore();
  }
  renderTiles(n, e, t, r, o) {
    Array.from(o.values()).forEach((s) => {
      s && s.tiles && Array.isArray(s.tiles) && s.tiles.forEach((a) => {
        if (!a || !a.position) return;
        const u = (a.position.x - r.x) * t, c = (a.position.z - r.z) * t, f = (a.size || 1) * 4 * t;
        n.save();
        const d = e / 2 - u - f / 2, p = e / 2 - c - f / 2;
        a.objectType === "water" ? n.fillStyle = "rgba(0, 150, 255, 0.6)" : a.objectType === "grass" ? n.fillStyle = "rgba(50, 200, 50, 0.4)" : a.objectType === "sand" ? n.fillStyle = "rgba(210, 180, 120, 0.45)" : a.objectType === "snowfield" ? n.fillStyle = "rgba(225, 240, 255, 0.5)" : n.fillStyle = "rgba(150, 150, 150, 0.3)", n.fillRect(d, p, f, f), n.strokeStyle = "rgba(255, 255, 255, 0.2)", n.lineWidth = 0.5, n.strokeRect(d, p, f, f), n.restore();
      });
    });
  }
  renderSceneObjects(n, e, t, r, o) {
    o.forEach((i) => {
      if (!i?.position || !i?.size) return;
      const s = (i.position.x - r.x) * t, a = (i.position.z - r.z) * t, u = i.size.x * t, c = i.size.z * t;
      n.save();
      const f = e / 2 - s - u / 2, d = e / 2 - a - c / 2;
      n.fillStyle = "rgba(100, 150, 200, 0.4)", n.fillRect(f, d, u, c), n.strokeStyle = "rgba(255, 255, 255, 0.4)", n.lineWidth = 1, n.strokeRect(f, d, u, c), n.restore();
    });
  }
  renderMarkers(n, e, t, r, o, i) {
    this.state.markers.size !== 0 && this.state.markers.forEach((s) => {
      if (!s?.center || !s?.size) return;
      const { center: a, size: u, text: c } = s, f = (a.x - r.x) * t, d = (a.z - r.z) * t;
      n.save();
      const p = u.x * t, h = u.z * t, x = e / 2 - f - p / 2, y = e / 2 - d - h / 2;
      n.shadowColor = "rgba(0, 0, 0, 0.6)", n.shadowBlur = 4, n.shadowOffsetX = 2, n.shadowOffsetY = 2, n.fillStyle = "rgba(0,0,0,0.3)", n.fillRect(x, y, p, h), n.shadowColor = "transparent", n.strokeStyle = "rgba(255, 255, 255, 0.3)", n.lineWidth = 1, n.strokeRect(x, y, p, h), c && (n.save(), n.fillStyle = "white", n.font = "bold 12px sans-serif", n.shadowColor = "rgba(0, 0, 0, 0.8)", n.shadowBlur = 2, n.translate(x + p / 2, y + h / 2), i || n.rotate(-o * Math.PI / 180), n.textAlign = "center", n.textBaseline = "middle", n.fillText(c, 0, 0), n.restore()), n.restore();
    });
  }
  renderAvatar(n, e) {
    if (n.save(), !this.state.gradientCache.avatar) {
      const t = n.createRadialGradient(e / 2, e / 2, 0, e / 2, e / 2, 12);
      t.addColorStop(0, "#01fff7"), t.addColorStop(0.7, "#01fff7"), t.addColorStop(1, "transparent"), this.state.gradientCache.avatar = t;
    }
    n.fillStyle = this.state.gradientCache.avatar, n.beginPath(), n.arc(e / 2, e / 2, 12, 0, Math.PI * 2), n.fill(), n.fillStyle = "#01fff7", n.shadowColor = "0 0 10px rgba(1,255,247,0.7)", n.shadowBlur = 8, n.beginPath(), n.arc(e / 2, e / 2, 6, 0, Math.PI * 2), n.fill(), n.shadowColor = "transparent", n.strokeStyle = "rgba(255, 255, 255, 0.8)", n.lineWidth = 2, n.beginPath(), n.moveTo(e / 2, e / 2), n.lineTo(e / 2, e / 2 - 12), n.stroke(), n.restore();
  }
  // AbstractSystem의 추상 메서드 구현
  performUpdate(n) {
  }
  createUpdateArgs(n) {
    return n;
  }
  updateMetrics(n) {
    this.metrics.markerCount = this.state.markers.size, this.metrics.frameTime = n;
  }
  onDispose() {
    this.clear(), this.listeners.clear(), this.state.canvas = null, this.state.ctx = null, Ee.instance = null;
  }
};
ma(Ee, "instance", null);
Ee = pa([
  Xi("minimap"),
  Ki({ autoStart: !1 })
], Ee);
const ha = 5, ga = 0.5, ya = 20, ba = 200, va = (n) => {
  const { activeState: e } = Xt(), t = O((m) => m.tileGroups), r = E(/* @__PURE__ */ new Map()), o = E(Ee.getInstance()), {
    scale: i = ha,
    blockRotate: s = !1,
    updateInterval: a = 33
  } = n, u = E(null), [c, f] = Z(i), d = !!(e.position && n);
  L(() => {
    const m = u.current;
    return m && o.current.setCanvas(m), () => {
      o.current.setCanvas(null);
    };
  }, []);
  const p = q(() => {
    n.blockScale || f((m) => Math.min(ya, m + 0.1));
  }, [n.blockScale]), h = q(() => {
    n.blockScale || f((m) => Math.max(ga, m - 0.1));
  }, [n.blockScale]), x = q(
    (m) => {
      n.blockScale || (m.preventDefault(), m.deltaY < 0 ? p() : h());
    },
    [n.blockScale, p, h]
  ), y = q(() => {
    const m = u.current;
    if (!m) return;
    const w = (S) => {
      n.blockScale || (S.preventDefault(), S.deltaY < 0 ? p() : h());
    };
    return m.addEventListener("wheel", w, { passive: !1 }), () => {
      m.removeEventListener("wheel", w);
    };
  }, [n.blockScale, p, h]), g = q(() => {
    const { position: m, euler: w } = e;
    !m || !w || o.current.render({
      size: ba,
      scale: c,
      position: m,
      rotation: w.y,
      blockRotate: s,
      tileGroups: t,
      sceneObjects: r.current
    });
  }, [e, c, s, t]);
  return L(() => {
    if (!d) return;
    const m = setInterval(() => {
      const { position: w, euler: S } = e;
      w && S && (o.current.checkForUpdates(w, S.y), g());
    }, a);
    return () => {
      clearInterval(m);
    };
  }, [g, a, d, e]), L(() => {
    g();
  }, [c, g]), {
    canvasRef: u,
    scale: c,
    upscale: p,
    downscale: h,
    handleWheel: x,
    setupWheelListener: y,
    updateCanvas: g,
    isReady: d
  };
};
function xa({
  playerPosition: n,
  offset: e
}) {
  const t = E(null), r = E(new v.Vector3()), o = E(new v.Vector3()), i = E(new v.Vector3()), s = E(!1);
  return de((a, u) => {
    if (!t.current) return;
    const c = i.current;
    if (c.set(
      n.x + e.x,
      n.y + e.y,
      n.z + e.z
    ), !s.current) {
      t.current.position.copy(c), r.current.copy(c), o.current.copy(c), s.current = !0;
      return;
    }
    c.distanceToSquared(o.current) > 25e-4 && o.current.copy(c);
    const d = 1 - Math.exp(-8 * u), p = r.current, h = o.current;
    p.lerp(h, d), p.distanceToSquared(h) < 1e-6 && p.copy(h), t.current.position.copy(p);
  }), t;
}
const so = 200;
function gp({
  scale: n = 5,
  minScale: e = 0.5,
  maxScale: t = 20,
  blockScale: r = !1,
  blockScaleControl: o = !1,
  blockRotate: i = !1,
  angle: s = 0,
  minimapStyle: a,
  scaleStyle: u,
  plusMinusStyle: c,
  position: f = "top-right",
  showZoom: d = !0,
  showCompass: p = !0,
  markers: h = []
}) {
  const { canvasRef: x, scale: y, upscale: g, downscale: m, handleWheel: w } = va({
    blockScale: r,
    blockRotate: i
  }), S = f ? `minimap--${f}` : "";
  return /* @__PURE__ */ b("div", { className: `minimap ${S}`, style: a, children: [
    /* @__PURE__ */ l(
      "canvas",
      {
        ref: x,
        className: "minimap__canvas",
        width: so,
        height: so,
        onWheel: w
      }
    ),
    p && /* @__PURE__ */ l("div", { className: "minimap__compass", children: /* @__PURE__ */ l("div", { style: { transform: `rotate(${s}deg)` }, children: "N" }) }),
    h.map((C, T) => /* @__PURE__ */ l(
      "div",
      {
        className: `minimap__marker minimap__marker--${C.type || "normal"}`,
        style: {
          left: `${C.x}%`,
          top: `${C.y}%`
        },
        children: C.label && /* @__PURE__ */ l("div", { className: "minimap__marker-label", children: C.label })
      },
      C.id || T
    )),
    d && !o && /* @__PURE__ */ l("div", { className: "minimap__controls", style: u, children: /* @__PURE__ */ b("div", { className: "minimap__zoom-controls", children: [
      /* @__PURE__ */ l(
        "button",
        {
          className: "minimap__control-button",
          onClick: g,
          disabled: y >= t,
          style: c,
          children: "+"
        }
      ),
      /* @__PURE__ */ l(
        "button",
        {
          className: "minimap__control-button",
          onClick: m,
          disabled: y <= e,
          style: c,
          children: "-"
        }
      )
    ] }) })
  ] });
}
function wa({
  id: n,
  position: e,
  size: t = [2, 2, 2],
  text: r = "",
  type: o = "normal",
  children: i
}) {
  return L(() => {
    const s = Ee.getInstance(), a = Array.isArray(e) ? e : [e.x, e.y, e.z], u = Array.isArray(t) ? t : [t.x, t.y, t.z];
    return s.addMarker(
      n,
      o,
      r || "",
      new v.Vector3(a[0], a[1], a[2]),
      new v.Vector3(u[0], u[1], u[2])
    ), () => {
      s.removeMarker(n);
    };
  }, [n, e, t, o, r]), /* @__PURE__ */ l(Se, { children: i });
}
function yp({
  id: n,
  position: e,
  size: t,
  label: r,
  children: o
}) {
  return /* @__PURE__ */ l(wa, { id: n, position: e, size: t, text: r, type: "ground", children: o });
}
function ao(n, e, t, r, o, i) {
  n.beginPath(), n.moveTo(e + i, t), n.lineTo(e + r - i, t), n.quadraticCurveTo(e + r, t, e + r, t + i), n.lineTo(e + r, t + o - i), n.quadraticCurveTo(e + r, t + o, e + r - i, t + o), n.lineTo(e + i, t + o), n.quadraticCurveTo(e, t + o, e, t + o - i), n.lineTo(e, t + i), n.quadraticCurveTo(e, t, e + i, t), n.closePath();
}
function Sa(n, e, t, r, o, i, s, a = 8, u = "#000000") {
  n.fillStyle = s, ao(n, e, t, r, o, i), n.fill(), n.strokeStyle = u, n.lineWidth = a;
  const c = a / 2;
  ao(n, e + c, t + c, r - a, o - a, i), n.stroke();
}
function Ma({
  text: n,
  backgroundColor: e,
  textColor: t,
  fontSize: r,
  padding: o,
  borderRadius: i,
  borderWidth: s,
  borderColor: a,
  maxWidth: u
}) {
  try {
    const c = String(n || "안녕"), f = Math.max(Math.floor(r ?? 120), 40), d = Math.max(Math.floor(o ?? 30), 15), p = 512, h = 256, x = document.createElement("canvas");
    x.width = p, x.height = h;
    const y = x.getContext("2d", { alpha: !0 }) ?? x.getContext("2d");
    if (!y)
      return console.error("Cannot get 2D context"), null;
    y.clearRect(0, 0, p, h);
    const g = d, m = d, w = p - d * 2, S = h - d * 2;
    Sa(
      y,
      g,
      m,
      w,
      S,
      i ?? 80,
      e ?? "rgba(255, 255, 255, 0.95)",
      s ?? 12,
      a ?? "#000000"
    );
    const C = "Arial Black, Arial, sans-serif";
    y.fillStyle = t ?? "#000000", y.font = `bold ${f}px ${C}`, y.textAlign = "center", y.textBaseline = "middle";
    const T = Math.max(10, Math.min(w - d * 2, u)), M = y.measureText(c).width;
    if (M > T) {
      const R = T / M, z = Math.max(12, Math.floor(f * R));
      y.font = `bold ${z}px ${C}`;
    }
    y.fillText(c, p / 2, h / 2);
    const _ = new v.CanvasTexture(x);
    return _.needsUpdate = !0, _.flipY = !0, _.generateMipmaps = !1, _.minFilter = v.LinearFilter, _.magFilter = v.LinearFilter, _.wrapS = v.ClampToEdgeWrapping, _.wrapT = v.ClampToEdgeWrapping, {
      texture: _,
      width: p,
      height: h,
      cleanup: () => {
        try {
          _.dispose();
        } catch (R) {
          console.warn("Error disposing texture:", R);
        }
      }
    };
  } catch (c) {
    return console.error("Error creating text texture:", c), null;
  }
}
function ii({
  text: n,
  position: e = new v.Vector3(0, 2, 0),
  offset: t,
  backgroundColor: r,
  textColor: o,
  fontSize: i,
  padding: s,
  borderRadius: a,
  borderWidth: u,
  borderColor: c,
  maxWidth: f,
  visible: d = !0,
  opacity: p = 1,
  children: h
}) {
  const { camera: x } = Je(), y = E(0), g = E(0), m = ra((k) => k.config.speechBalloon), w = t || new v.Vector3(m.defaultOffset.x, m.defaultOffset.y, m.defaultOffset.z), S = xa({
    playerPosition: e,
    offset: w
  }), [C, T] = Ce.useState(null), M = E(null);
  Ce.useEffect(() => {
    if (M.current?.cleanup && (M.current.cleanup(), M.current = null), !d || !m.enabled) {
      T(null);
      return;
    }
    const k = n && n.trim().length > 0 ? n.trim() : "안녕", R = Ma({
      text: k,
      backgroundColor: r ?? m.backgroundColor,
      textColor: o ?? m.textColor,
      fontSize: i ?? m.fontSize,
      padding: s ?? m.padding,
      borderRadius: a ?? m.borderRadius,
      borderWidth: u ?? m.borderWidth,
      borderColor: c ?? m.borderColor,
      maxWidth: f ?? m.maxWidth
    });
    return R && (M.current = R, T(R)), () => {
      M.current?.cleanup && (M.current.cleanup(), M.current = null);
    };
  }, [
    n,
    r ?? m.backgroundColor,
    o ?? m.textColor,
    i ?? m.fontSize,
    s ?? m.padding,
    a ?? m.borderRadius,
    u ?? m.borderWidth,
    c ?? m.borderColor,
    f ?? m.maxWidth,
    d,
    m.enabled
  ]);
  const _ = F(() => C?.texture ? new v.SpriteMaterial({
    map: C.texture,
    transparent: !0,
    opacity: Math.max(0, Math.min(1, p || 1)),
    depthTest: !1,
    // 항상 보이도록
    depthWrite: !1,
    alphaTest: 0.1
  }) : null, [C, p]);
  return Ce.useEffect(() => {
    if (S.current && C) {
      const k = m.scaleMultiplier;
      S.current.scale.set(k * 2, k, 1), y.current = 0;
    }
  }, [C, m.scaleMultiplier]), de(() => {
    if (!(!S.current || !C || !d) && (g.current++, !(g.current < 30))) {
      g.current = 0;
      try {
        const k = S.current.position, R = x.position.distanceTo(k);
        if (Math.abs(R - y.current) > 5) {
          const N = m.scaleMultiplier;
          S.current.scale.set(N * 2, N, 1), y.current = R;
        }
      } catch (k) {
        console.warn("Error in sprite scaling:", k);
      }
    }
  }), L(() => () => {
    _ && _.dispose();
  }, [_]), !d || !C?.texture || !_ ? null : /* @__PURE__ */ b("group", { children: [
    /* @__PURE__ */ l(
      "sprite",
      {
        ref: S,
        material: _,
        renderOrder: 1e3,
        frustumCulled: !1
      }
    ),
    h
  ] });
}
let Ca = 0;
const kr = we((n, e) => ({
  toasts: [],
  push: (t) => {
    const r = ++Ca, o = {
      id: r,
      createdAt: Date.now(),
      durationMs: t.durationMs ?? 3500,
      kind: t.kind,
      text: t.text,
      ...t.icon ? { icon: t.icon } : {}
    };
    return n({ toasts: [...e().toasts, o] }), r;
  },
  dismiss: (t) => n({ toasts: e().toasts.filter((r) => r.id !== t) }),
  clear: () => n({ toasts: [] })
}));
function fe(n, e, t) {
  return kr.getState().push({
    kind: n,
    text: e,
    ...t?.icon ? { icon: t.icon } : {},
    ...t?.durationMs !== void 0 ? { durationMs: t.durationMs } : {}
  });
}
const ka = {
  info: { bg: "rgba(20,30,50,0.55)", ring: "#7aa6ff", icon: "i" },
  success: { bg: "rgba(20,40,30,0.55)", ring: "#7adf90", icon: "+" },
  warn: { bg: "rgba(50,40,20,0.55)", ring: "#ffd84a", icon: "!" },
  error: { bg: "rgba(50,20,20,0.55)", ring: "#ff7a7a", icon: "x" },
  reward: { bg: "rgba(40,30,10,0.55)", ring: "#ffc24a", icon: "*" },
  mail: { bg: "rgba(30,20,40,0.55)", ring: "#cf9aff", icon: "M" }
};
function bp({ position: n = "top-right", max: e = 5 }) {
  const t = kr((s) => s.toasts), r = kr((s) => s.dismiss);
  L(() => {
    if (!t.length) return;
    const s = t.map(
      (a) => window.setTimeout(() => r(a.id), Math.max(500, a.durationMs))
    );
    return () => {
      s.forEach((a) => window.clearTimeout(a));
    };
  }, [t, r]);
  const o = n === "top-center" ? { top: 64, left: "50%", transform: "translateX(-50%)" } : { top: 64, right: 12 }, i = t.slice(-e);
  return /* @__PURE__ */ b(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 110,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
        ...o
      },
      children: [
        i.map((s) => {
          const a = ka[s.kind];
          return /* @__PURE__ */ b(
            "div",
            {
              style: {
                minWidth: 220,
                maxWidth: 360,
                padding: "9px 14px",
                borderRadius: 12,
                background: a.bg,
                color: "#f3f4f8",
                fontFamily: "'Pretendard', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: `1px solid ${a.ring}55`,
                boxShadow: "0 8px 22px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)",
                backdropFilter: "blur(18px) saturate(140%)",
                WebkitBackdropFilter: "blur(18px) saturate(140%)",
                animation: "gaesup-toast-in 220ms ease-out both"
              },
              children: [
                /* @__PURE__ */ l(
                  "span",
                  {
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: a.ring,
                      color: "#1a1a1a",
                      fontWeight: 700
                    },
                    children: s.icon ?? a.icon
                  }
                ),
                /* @__PURE__ */ l("span", { children: s.text })
              ]
            },
            s.id
          );
        }),
        /* @__PURE__ */ l("style", { children: `@keyframes gaesup-toast-in {
        0% { opacity: 0; transform: translateY(-6px); }
        100% { opacity: 1; transform: translateY(0); }
      }` })
      ]
    }
  );
}
function Ia() {
  const n = Je((r) => r.gl), e = pe((r) => r.setPerformance), t = E(0);
  return de(() => {
    if (t.current++, t.current < 30) return;
    t.current = 0;
    const r = n.info, o = "programs" in r ? r.programs : void 0;
    e({
      render: {
        calls: r.render.calls,
        triangles: r.render.triangles,
        points: r.render.points,
        lines: r.render.lines
      },
      engine: {
        geometries: r.memory.geometries,
        textures: r.memory.textures,
        programs: Array.isArray(o) ? o.length : 0
      }
    });
  }), null;
}
function Aa({ children: n, showGrid: e, showAxes: t }) {
  return /* @__PURE__ */ b("group", { name: "gaesup-world", children: [
    e && /* @__PURE__ */ l("gridHelper", { args: [100, 100, "#888888", "#444444"] }),
    t && /* @__PURE__ */ l("axesHelper", { args: [10] }),
    n
  ] });
}
function Ta(n) {
  const e = pe((i) => i.setMode), t = pe((i) => i.setUrls), r = pe((i) => i.setCameraOption);
  L(() => {
    n.mode && e(n.mode);
  }, [n.mode, e]);
  const o = F(() => {
    if (!n.urls) return null;
    const i = {};
    return n.urls.characterUrl !== void 0 && (i.characterUrl = n.urls.characterUrl), n.urls.vehicleUrl !== void 0 && (i.vehicleUrl = n.urls.vehicleUrl), n.urls.airplaneUrl !== void 0 && (i.airplaneUrl = n.urls.airplaneUrl), i.characterUrl === void 0 && n.urls.character !== void 0 && (i.characterUrl = n.urls.character), i.vehicleUrl === void 0 && n.urls.vehicle !== void 0 && (i.vehicleUrl = n.urls.vehicle), i.airplaneUrl === void 0 && n.urls.airplane !== void 0 && (i.airplaneUrl = n.urls.airplane), Object.keys(i).length > 0 ? i : null;
  }, [n.urls]);
  return L(() => {
    o && t(o);
  }, [o, t]), L(() => {
    n.cameraOption && r(n.cameraOption);
  }, [n.cameraOption, r]), n.children;
}
const _a = Ta;
function Pa({ children: n, showGrid: e, showAxes: t }) {
  return /* @__PURE__ */ b(tt, { fallback: null, children: [
    /* @__PURE__ */ l(es, {}),
    /* @__PURE__ */ l(Ia, {}),
    /* @__PURE__ */ l(Aa, { showGrid: e ?? !1, showAxes: t ?? !1, children: n })
  ] });
}
function Ra({
  type: n = "normal",
  text: e,
  position: t,
  children: r,
  interactive: o = !0,
  showMinimap: i = !0
}) {
  const s = E(null), a = ts(), u = F(() => `world-prop-${Date.now()}-${Math.random()}`, []), c = E({
    center: new v.Vector3(),
    size: new v.Vector3(),
    positionAdd: new v.Vector3()
  });
  return L(() => {
    if (!i || !s.current) return;
    const f = Ee.getInstance(), p = setTimeout(() => {
      const h = s.current;
      if (!h) return;
      const x = new v.Box3();
      if (x.setFromObject(h), !x.isEmpty()) {
        const { center: y, size: g, positionAdd: m } = c.current;
        x.getCenter(y), x.getSize(g), t && (m.set(t[0], t[1], t[2]), y.add(m)), f.addMarker(
          u,
          n,
          e || "",
          y.clone(),
          // Clone only when passing to engine
          g.clone()
          // Clone only when passing to engine
        );
      }
    }, 100);
    return () => {
      clearTimeout(p), f.removeMarker(u);
    };
  }, [t, n, e, i, u]), /* @__PURE__ */ b(
    "group",
    {
      ref: s,
      ...t ? { position: t } : {},
      onClick: (f) => {
        o && (f.stopPropagation(), a.onClick(f));
      },
      children: [
        r,
        e && /* @__PURE__ */ l("group", { position: [0, 2, 0], children: /* @__PURE__ */ l("sprite", { scale: [2, 0.5, 1], children: /* @__PURE__ */ l(
          "spriteMaterial",
          {
            color: "#ffffff",
            transparent: !0,
            opacity: 0.8
          }
        ) }) })
      ]
    }
  );
}
class Na {
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
let zn = null;
function Me() {
  return zn || (zn = new Na()), zn;
}
const Dn = 20, Fn = 5;
function Ln(n) {
  return Array.from({ length: n }, () => null);
}
function lo(n) {
  return Array.from({ length: n }, (e, t) => t);
}
function co(n) {
  const e = Me().get(n);
  return e && e.stackable ? Math.max(1, e.maxStack) : 1;
}
const ce = we((n, e) => ({
  size: Dn,
  slots: Ln(Dn),
  hotbar: lo(Fn),
  equippedHotbar: 0,
  add: (t, r = 1) => {
    if (r <= 0) return 0;
    const o = co(t), i = e().slots.slice();
    let s = r;
    if (o > 1)
      for (let a = 0; a < i.length && s > 0; a++) {
        const u = i[a];
        if (u && u.itemId === t && u.count < o) {
          const c = o - u.count, f = Math.min(c, s);
          i[a] = { ...u, count: u.count + f }, s -= f;
        }
      }
    for (let a = 0; a < i.length && s > 0; a++)
      if (i[a] === null) {
        const u = Math.min(o, s);
        i[a] = { itemId: t, count: u }, s -= u;
      }
    return n({ slots: i }), s;
  },
  remove: (t, r = 1) => {
    const o = e().slots.slice(), i = o[t];
    return !i || r <= 0 ? !1 : (i.count <= r ? o[t] = null : o[t] = { ...i, count: i.count - r }, n({ slots: o }), !0);
  },
  removeById: (t, r = 1) => {
    if (r <= 0) return 0;
    const o = e().slots.slice();
    let i = r;
    for (let s = 0; s < o.length && i > 0; s++) {
      const a = o[s];
      if (!a || a.itemId !== t) continue;
      const u = Math.min(a.count, i);
      a.count <= u ? o[s] = null : o[s] = { ...a, count: a.count - u }, i -= u;
    }
    return n({ slots: o }), r - i;
  },
  move: (t, r) => {
    const o = e().slots.slice();
    if (t < 0 || r < 0 || t >= o.length || r >= o.length) return;
    const i = o[t], s = o[r];
    if (i && s && i.itemId === s.itemId) {
      const a = co(i.itemId);
      if (a > 1) {
        const u = a - s.count;
        if (u > 0) {
          const c = Math.min(u, i.count);
          o[r] = { ...s, count: s.count + c }, i.count - c <= 0 ? o[t] = null : o[t] = { ...i, count: i.count - c }, n({ slots: o });
          return;
        }
      }
    }
    o[t] = s ?? null, o[r] = i ?? null, n({ slots: o });
  },
  clear: () => n({ slots: Ln(e().size) }),
  setEquippedHotbar: (t) => {
    const r = e().hotbar, o = (t % r.length + r.length) % r.length;
    n({ equippedHotbar: o });
  },
  getEquipped: () => {
    const { hotbar: t, slots: r, equippedHotbar: o } = e(), i = t[o];
    return i == null || i < 0 || i >= r.length ? null : r[i] ?? null;
  },
  getHotbarSlot: (t) => {
    const { hotbar: r, slots: o } = e(), i = r[t];
    return i == null ? null : o[i] ?? null;
  },
  countOf: (t) => {
    let r = 0;
    for (const o of e().slots) o && o.itemId === t && (r += o.count);
    return r;
  },
  has: (t, r = 1) => e().countOf(t) >= r,
  serialize: () => {
    const { slots: t, hotbar: r, equippedHotbar: o } = e();
    return {
      version: 1,
      slots: t.map((i) => i ? { ...i } : null),
      hotbar: [...r],
      equippedHotbar: o
    };
  },
  hydrate: (t) => {
    if (!t) return;
    const r = Array.isArray(t.slots) ? t.slots.length : Dn, o = Array.isArray(t.slots) ? t.slots.map((a) => a && typeof a == "object" && a.itemId ? { ...a } : null) : Ln(r), i = Array.isArray(t.hotbar) ? t.hotbar.slice(0, Fn) : lo(Fn), s = typeof t.equippedHotbar == "number" ? Math.max(0, Math.min(i.length - 1, t.equippedHotbar)) : 0;
    n({ size: r, slots: o, hotbar: i, equippedHotbar: s });
  }
}));
class Ea {
  byKind = /* @__PURE__ */ new Map();
  global = /* @__PURE__ */ new Set();
  on(e, t) {
    let r = this.byKind.get(e);
    return r || (r = /* @__PURE__ */ new Set(), this.byKind.set(e, r)), r.add(t), () => {
      r.delete(t);
    };
  }
  onAny(e) {
    return this.global.add(e), () => {
      this.global.delete(e);
    };
  }
  emit(e) {
    const t = this.byKind.get(e.kind);
    if (t) {
      for (const r of t)
        if (r(e) === !0) return;
    }
    for (const r of this.global) r(e);
  }
  clear() {
    this.byKind.clear(), this.global.clear();
  }
}
let Gn = null;
function si() {
  return Gn || (Gn = new Ea()), Gn;
}
function St(n, e, t = !0) {
  L(() => t ? si().on(n, e) : void 0, [n, e, t]);
}
function vp() {
  const n = ce((t) => t.getEquipped());
  return n ? Me().get(n.itemId)?.toolKind ?? null : null;
}
function xp({
  position: n,
  rotationY: e = 0,
  hp: t = 3,
  woodDrop: r = 2,
  regrowMinutes: o = 1440,
  hitRange: i = 1.6,
  trunkColor: s = "#6b4a2a",
  foliageColor: a = "#3f8a3a",
  scale: u = 1
}) {
  const c = E(null), [f, d] = Z(t), [p, h] = Z(!1), x = E(0), y = E(-1 / 0), g = q((M) => {
    if (p) return;
    const _ = M.origin[0] - n[0], k = M.origin[2] - n[2], R = _ * _ + k * k, z = i + M.range * 0.5;
    if (!(R > z * z))
      return y.current = performance.now(), d((N) => {
        const P = N - 1;
        return P <= 0 ? (ce.getState().add("wood", r) > 0 ? fe("warn", "인벤토리가 가득 찼습니다") : fe("reward", `목재 +${r}`), h(!0), x.current = ve.getState().totalMinutes + o, t) : P;
      }), !0;
  }, [p, n, i, r, o, t]);
  St("axe", g), L(() => p ? ve.subscribe((_, k) => {
    _.totalMinutes !== k.totalMinutes && _.totalMinutes >= x.current && (h(!1), d(t));
  }) : void 0, [p, t]), de((M, _) => {
    const k = c.current;
    if (!k) return;
    const R = (performance.now() - y.current) / 1e3;
    if (R < 0.4) {
      const z = R / 0.4, N = Math.sin(z * Math.PI * 6) * (1 - z) * 0.18;
      k.rotation.z = N;
    } else Math.abs(k.rotation.z) > 1e-4 && (k.rotation.z *= Math.max(0, 1 - _ * 12));
  });
  const m = f < t, w = 1.6 * u, S = 0.18 * u, C = 0.95 * u, T = F(() => {
    const M = new v.Color(a);
    return m && M.lerp(new v.Color("#a55"), 0.06 * (t - f)), M;
  }, [a, m, t, f]);
  return p ? /* @__PURE__ */ l("group", { position: n, rotation: [0, e, 0], children: /* @__PURE__ */ b("mesh", { castShadow: !0, receiveShadow: !0, position: [0, 0.18 * u, 0], children: [
    /* @__PURE__ */ l("cylinderGeometry", { args: [S, S * 1.15, 0.36 * u, 12] }),
    /* @__PURE__ */ l("meshToonMaterial", { color: s })
  ] }) }) : /* @__PURE__ */ b("group", { ref: c, position: n, rotation: [0, e, 0], children: [
    /* @__PURE__ */ b("mesh", { castShadow: !0, receiveShadow: !0, position: [0, w * 0.5, 0], children: [
      /* @__PURE__ */ l("cylinderGeometry", { args: [S * 0.85, S, w, 12] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: s })
    ] }),
    /* @__PURE__ */ b("mesh", { castShadow: !0, position: [0, w + C * 0.6, 0], children: [
      /* @__PURE__ */ l("coneGeometry", { args: [C, C * 1.6, 14] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: T })
    ] }),
    /* @__PURE__ */ b("mesh", { castShadow: !0, position: [0, w + C * 1.5, 0], children: [
      /* @__PURE__ */ l("coneGeometry", { args: [C * 0.75, C * 1.2, 14] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: T })
    ] })
  ] });
}
function Ba(n, e) {
  switch (n.kind) {
    case "always":
      return !0;
    case "season":
      return n.seasons.includes(e.season);
    case "monthDay":
      return e.month === n.month && e.day === n.day;
    case "monthRange":
      return e.month === n.month && e.day >= n.fromDay && e.day <= n.toDay;
    case "weekday":
      return n.weekdays.includes(e.weekday);
    default:
      return !1;
  }
}
function uo(n, e) {
  return n.triggers.length ? n.triggers.some((t) => Ba(t, e)) : !1;
}
class za {
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
    for (const r of this.defs.values())
      uo(r, e) && t.push(r.id);
    return t;
  }
  resolveTags(e) {
    const t = /* @__PURE__ */ new Set();
    for (const r of this.defs.values())
      if (uo(r, e))
        for (const o of r.tags ?? []) t.add(o);
    return t;
  }
}
let On = null;
function Or() {
  return On || (On = new za()), On;
}
const Tn = we((n, e) => ({
  active: [],
  startedAt: {},
  tags: /* @__PURE__ */ new Set(),
  refresh: (t) => {
    const r = Or(), o = r.resolveActive(t), i = e().active, s = new Set(o), a = new Set(i), u = o.filter((d) => !a.has(d)), c = i.filter((d) => !s.has(d)), f = { ...e().startedAt };
    for (const d of u) f[d] = t.totalMinutes;
    for (const d of c) delete f[d];
    return n({ active: o, startedAt: f, tags: r.resolveTags(t) }), { started: u, ended: c };
  },
  isActive: (t) => e().active.includes(t),
  hasTag: (t) => e().tags.has(t),
  serialize: () => ({ version: 1, active: [...e().active], startedAt: { ...e().startedAt } }),
  hydrate: (t) => {
    t && n({
      active: Array.isArray(t.active) ? [...t.active] : [],
      startedAt: t.startedAt && typeof t.startedAt == "object" ? { ...t.startedAt } : {}
    });
  }
})), Da = [
  { itemId: "fish-bass", weight: 60 },
  { itemId: "fish-tuna", weight: 25 },
  { itemId: "fish-koi", weight: 10 }
];
function Fa(n, e, t) {
  const r = [];
  for (const s of t) s.startsWith(e) && r.push(s.slice(e.length));
  if (r.length === 0) return n;
  const o = new Set(r), i = n.filter((s) => o.has(s.itemId));
  return i.length > 0 ? i : n;
}
function La(n) {
  if (n.length === 0) return null;
  const e = n.reduce((r, o) => r + Math.max(0, o.weight), 0);
  if (e <= 0) return null;
  let t = Math.random() * e;
  for (const r of n)
    if (t -= Math.max(0, r.weight), t <= 0) return r.itemId;
  return n[n.length - 1].itemId;
}
function wp({
  position: n,
  radius: e = 3,
  pool: t = Da,
  cooldownMs: r = 600,
  successChance: o = 0.6,
  showRipple: i = !0,
  rippleColor: s = "#9ad9ff"
}) {
  const a = E(-1 / 0), u = E(null), c = E(-1 / 0), f = q((d) => {
    const p = d.origin[0] - n[0], h = d.origin[2] - n[2];
    if (p * p + h * h > e * e) return;
    const x = performance.now();
    if (x - a.current < r) return !0;
    a.current = x, c.current = x;
    const y = Ge.getState().fishingBonus();
    if (Math.random() > Math.min(0.95, o + y))
      return fe("warn", "놓쳤다…"), !0;
    const g = Fa(t, "fish:", Tn.getState().tags), m = La(g);
    if (!m) return !0;
    const w = Me().get(m);
    return ce.getState().add(m, 1) > 0 ? fe("warn", "인벤토리가 가득 찼습니다") : fe("reward", `${w?.name ?? m} 낚음!`), !0;
  }, [n, e, r, t, o]);
  return St("rod", f), de(() => {
    const d = u.current;
    if (!d) return;
    const p = (performance.now() - c.current) / 1e3;
    if (p < 0.6) {
      const h = p / 0.6;
      d.scale.setScalar(0.4 + h * 1.4);
      const x = d.material;
      x.opacity = 0.55 * (1 - h);
    } else
      d.scale.setScalar(0);
  }), /* @__PURE__ */ l("group", { position: n, children: i && /* @__PURE__ */ b("mesh", { ref: u, rotation: [-Math.PI / 2, 0, 0], position: [0, 0.04, 0], children: [
    /* @__PURE__ */ l("ringGeometry", { args: [0.4, 0.6, 32] }),
    /* @__PURE__ */ l("meshBasicMaterial", { color: s, transparent: !0, opacity: 0, depthWrite: !1 })
  ] }) });
}
const Ga = [
  { itemId: "bug-butterfly", weight: 70 },
  { itemId: "bug-beetle", weight: 22 },
  { itemId: "bug-stag", weight: 8 }
];
function Oa(n, e, t) {
  const r = [];
  for (const s of t) s.startsWith(e) && r.push(s.slice(e.length));
  if (r.length === 0) return n;
  const o = new Set(r), i = n.filter((s) => o.has(s.itemId));
  return i.length > 0 ? i : n;
}
function Ua(n) {
  if (n.length === 0) return null;
  const e = n.reduce((r, o) => r + Math.max(0, o.weight), 0);
  if (e <= 0) return null;
  let t = Math.random() * e;
  for (const r of n)
    if (t -= Math.max(0, r.weight), t <= 0) return r.itemId;
  return n[n.length - 1].itemId;
}
function Sp({
  position: n,
  radius: e = 2.4,
  pool: t = Ga,
  cooldownMs: r = 600,
  successChance: o = 0.7,
  bugColor: i = "#ffd0e0",
  hoverHeight: s = 1.2
}) {
  const a = E(-1 / 0), u = E(null), [c, f] = Z(!0), d = E(-1 / 0), p = q((h) => {
    if (!c) return;
    const x = h.origin[0] - n[0], y = h.origin[2] - n[2];
    if (x * x + y * y > e * e) return;
    const g = performance.now();
    if (g - a.current < r) return !0;
    a.current = g;
    const m = Ge.getState().bugBonus();
    if (Math.random() > Math.min(0.95, Math.max(0.05, o + m)))
      return fe("warn", "날아갔다…"), f(!1), d.current = g + 8e3, !0;
    const w = Oa(t, "bug:", Tn.getState().tags), S = Ua(w);
    if (!S) return !0;
    const C = Me().get(S);
    return ce.getState().add(S, 1) > 0 ? fe("warn", "인벤토리가 가득 찼습니다") : fe("reward", `${C?.name ?? S} 잡았다!`), f(!1), d.current = g + 12e3, !0;
  }, [n, e, r, t, o, c]);
  return St("net", p), de(({ clock: h }) => {
    const x = performance.now();
    !c && x >= d.current && f(!0);
    const y = u.current;
    if (!y || !c) return;
    const g = h.elapsedTime;
    y.position.x = Math.sin(g * 1.2) * 0.6, y.position.z = Math.cos(g * 0.9) * 0.6, y.position.y = s + Math.sin(g * 2.6) * 0.15, y.rotation.y = g * 1.4;
  }), c ? /* @__PURE__ */ l("group", { position: n, children: /* @__PURE__ */ b("mesh", { ref: u, children: [
    /* @__PURE__ */ l("sphereGeometry", { args: [0.12, 10, 10] }),
    /* @__PURE__ */ l("meshToonMaterial", { color: i })
  ] }) }) : /* @__PURE__ */ l("group", { position: n });
}
const Wa = (n) => typeof n != "object" || n === null ? !1 : "text" in n && typeof n.text == "function";
class ai {
  ws = null;
  url;
  roomId;
  playerName;
  playerColor;
  players = /* @__PURE__ */ new Map();
  localPlayerId = null;
  isConnected = !1;
  isConnecting = !1;
  logLevel;
  logToConsole;
  reconnectAttemptsMax;
  reconnectDelayMs;
  reconnectAttemptsUsed = 0;
  reconnectTimer = null;
  shouldReconnect = !1;
  pingIntervalMs;
  pingTimer = null;
  lastPingSentAt = 0;
  updateRateLimitMs;
  lastUpdateSentAt = 0;
  pendingUpdate = null;
  updateFlushTimer = null;
  offlineQueueSize;
  pendingChats = [];
  // Optional app-level ACK (server must echo Ack for dedupe/retry).
  enableAck;
  reliableTimeoutMs;
  reliableRetryCount;
  ackIdCounter = 1;
  pendingAcks = /* @__PURE__ */ new Map();
  // 콜백 함수들
  onConnect;
  onDisconnect;
  onWelcome;
  onPlayerJoin;
  onPlayerUpdate;
  onPlayerLeave;
  onChat;
  onPing;
  onReliableFailed;
  onError;
  constructor(e) {
    this.url = e.url, this.roomId = e.roomId, this.playerName = e.playerName, this.playerColor = e.playerColor, this.reconnectAttemptsMax = Math.max(0, Math.floor(e.reconnectAttempts ?? 0)), this.reconnectDelayMs = Math.max(0, Math.floor(e.reconnectDelay ?? 1e3)), this.pingIntervalMs = Math.max(0, Math.floor(e.pingInterval ?? 0)), this.updateRateLimitMs = Math.max(0, Math.floor(e.sendRateLimit ?? 0)), this.offlineQueueSize = Math.max(0, Math.floor(e.offlineQueueSize ?? 50)), this.enableAck = !!e.enableAck, this.reliableTimeoutMs = Math.max(0, Math.floor(e.reliableTimeout ?? 5e3)), this.reliableRetryCount = Math.max(0, Math.floor(e.reliableRetryCount ?? 0)), this.logLevel = e.logLevel ?? "none", this.logToConsole = e.logToConsole ?? !1, e.onConnect && (this.onConnect = e.onConnect), e.onDisconnect && (this.onDisconnect = e.onDisconnect), e.onWelcome && (this.onWelcome = e.onWelcome), e.onPlayerJoin && (this.onPlayerJoin = e.onPlayerJoin), e.onPlayerUpdate && (this.onPlayerUpdate = e.onPlayerUpdate), e.onPlayerLeave && (this.onPlayerLeave = e.onPlayerLeave), e.onChat && (this.onChat = e.onChat), e.onPing && (this.onPing = e.onPing), e.onReliableFailed && (this.onReliableFailed = e.onReliableFailed), e.onError && (this.onError = e.onError);
  }
  shouldLog(e) {
    if (!this.logToConsole) return !1;
    const t = {
      none: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4
    };
    return t[e] <= t[this.logLevel];
  }
  debug(e, ...t) {
    this.shouldLog("debug") && console.log(e, ...t);
  }
  info(e, ...t) {
    this.shouldLog("info") && console.info(e, ...t);
  }
  warn(e, ...t) {
    this.shouldLog("warn") && console.warn(e, ...t);
  }
  error(e, ...t) {
    this.shouldLog("error") && console.error(e, ...t);
  }
  getConnectionStatus() {
    return this.isConnected;
  }
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.warn("[PlayerNetworkManager] Already connected");
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      this.warn("[PlayerNetworkManager] Already connecting");
      return;
    }
    if (this.isConnecting) {
      this.warn("[PlayerNetworkManager] Already connecting");
      return;
    }
    this.shouldReconnect = this.reconnectAttemptsMax > 0, this.clearReconnectTimer(), this.isConnecting = !0, this.info("[PlayerNetworkManager] Connecting WebSocket", this.url);
    let e;
    try {
      e = new WebSocket(this.url);
    } catch {
      this.isConnecting = !1, this.isConnected = !1, this.onError?.("WebSocket 연결 실패");
      return;
    }
    this.ws = e, e.onopen = () => {
      this.info("[PlayerNetworkManager] WebSocket connected"), this.isConnected = !0, this.isConnecting = !1, this.reconnectAttemptsUsed = 0, this.startPingLoop(), e.send(JSON.stringify({
        type: "Join",
        room_id: this.roomId,
        name: this.playerName,
        color: this.playerColor
      })), this.flushOfflineQueue(), this.resumePendingAcks(), this.onConnect && this.onConnect();
    }, e.onmessage = (t) => {
      const r = (i) => {
        try {
          const s = JSON.parse(i);
          this.handleServerMessage(s);
        } catch {
          this.onError?.("서버 메시지 파싱 실패");
        }
      }, o = t.data;
      if (typeof o == "string") {
        r(o);
        return;
      }
      if (Wa(o)) {
        o.text().then((i) => r(i)).catch(() => this.onError?.("서버 메시지 수신 실패"));
        return;
      }
      if (o instanceof ArrayBuffer)
        try {
          const i = new TextDecoder().decode(new Uint8Array(o));
          r(i);
        } catch {
          this.onError?.("서버 메시지 디코딩 실패");
        }
    }, e.onerror = (t) => {
      this.error("[PlayerNetworkManager] WebSocket error", t), this.isConnected = !1, this.isConnecting = !1, this.onError && this.onError("WebSocket 연결 에러");
    }, e.onclose = (t) => {
      this.info("[PlayerNetworkManager] WebSocket closed", { code: t.code, reason: t.reason });
      const r = this.isConnected || this.isConnecting;
      this.isConnected = !1, this.isConnecting = !1, this.stopPingLoop(), this.pausePendingAcks(), this.players.clear(), this.localPlayerId = null, this.onDisconnect && this.onDisconnect(), (t.code === 1e3 || t.code === 1001) && (this.shouldReconnect = !1), r && this.tryReconnect();
    };
  }
  disconnect() {
    if (this.shouldReconnect = !1, this.clearReconnectTimer(), this.stopPingLoop(), this.clearUpdateFlushTimer(), this.clearAllPendingAcks(!0), !this.ws) {
      this.players.clear(), this.isConnected = !1, this.isConnecting = !1, this.localPlayerId = null, this.onDisconnect?.();
      return;
    }
    const e = this.ws;
    if (e.onopen = null, e.onmessage = null, e.onerror = null, e.onclose = null, e.readyState === WebSocket.OPEN)
      try {
        e.send(JSON.stringify({ type: "Leave" }));
      } catch {
      }
    try {
      e.close();
    } catch {
    }
    this.ws = null, this.players.clear(), this.isConnected = !1, this.isConnecting = !1, this.localPlayerId = null, this.pendingUpdate = null, this.pendingChats = [], this.onDisconnect?.();
  }
  updateLocalPlayer(e) {
    this.pendingUpdate = this.pendingUpdate ? { ...this.pendingUpdate, ...e } : { ...e };
    const t = this.ws;
    if (!t || t.readyState !== WebSocket.OPEN) return;
    const r = Date.now();
    if (this.updateRateLimitMs <= 0 || r - this.lastUpdateSentAt >= this.updateRateLimitMs) {
      this.lastUpdateSentAt = r;
      const i = this.pendingUpdate;
      if (this.pendingUpdate = null, !i) return;
      t.send(JSON.stringify({ type: "Update", state: i }));
      return;
    }
    if (this.updateFlushTimer) return;
    const o = Math.max(0, this.updateRateLimitMs - (r - this.lastUpdateSentAt));
    this.updateFlushTimer = setTimeout(() => {
      this.updateFlushTimer = null;
      const i = this.pendingUpdate;
      i && this.updateLocalPlayer(i);
    }, o);
  }
  sendChat(e, t) {
    const r = String(e ?? "").trim().slice(0, 200);
    if (!r) return;
    const o = this.ws;
    if (!o || o.readyState !== WebSocket.OPEN) {
      if (this.offlineQueueSize <= 0) return;
      this.pendingChats.length >= this.offlineQueueSize && this.pendingChats.shift(), t?.range !== void 0 ? this.pendingChats.push({ text: r, range: t.range }) : this.pendingChats.push({ text: r });
      return;
    }
    const i = {
      type: "Chat",
      text: r,
      ...t?.range !== void 0 ? { range: t.range } : {}
    };
    if (this.enableAck) {
      this.sendReliable(i);
      return;
    }
    o.send(JSON.stringify(i));
  }
  handleServerMessage(e) {
    switch (this.debug("[PlayerNetworkManager] Server message", e.type, e), e.type) {
      case "Ack": {
        typeof e.ackId == "string" && e.ackId && this.ackReceived(e.ackId);
        break;
      }
      case "Pong": {
        if (typeof e.ts == "number" && e.ts > 0) {
          const t = Math.max(0, Date.now() - e.ts);
          this.onPing?.(t);
        } else if (this.lastPingSentAt > 0) {
          const t = Math.max(0, Date.now() - this.lastPingSentAt);
          this.onPing?.(t);
        }
        break;
      }
      case "Welcome":
        if (this.localPlayerId = e.client_id, this.onWelcome?.(this.localPlayerId, e.room_state), e.room_state)
          for (const [t, r] of Object.entries(e.room_state))
            t !== this.localPlayerId && (this.players.set(t, r), this.onPlayerJoin && this.onPlayerJoin(t, r));
        break;
      case "PlayerJoined":
        this.debug("[PlayerNetworkManager] PlayerJoined", e.client_id), e.client_id !== this.localPlayerId && (this.players.set(e.client_id, e.state), this.onPlayerJoin && this.onPlayerJoin(e.client_id, e.state));
        break;
      case "PlayerLeft":
        this.debug("[PlayerNetworkManager] PlayerLeft", e.client_id), this.players.delete(e.client_id), this.onPlayerLeave && this.onPlayerLeave(e.client_id);
        break;
      case "PlayerUpdate":
        this.debug("[PlayerNetworkManager] PlayerUpdate", e.client_id);
        {
          const t = this.players.get(e.client_id);
          if (t) {
            const i = { ...t, ...e.state };
            this.players.set(e.client_id, i), this.onPlayerUpdate?.(e.client_id, i);
            break;
          }
          const r = e.state, o = {
            name: r?.name ?? "Player",
            color: r?.color ?? "#ffffff",
            position: r?.position ?? [0, 0, 0],
            rotation: r?.rotation ?? [1, 0, 0, 0],
            ...r ?? {}
          };
          this.players.set(e.client_id, o), this.onPlayerJoin?.(e.client_id, o), this.onPlayerUpdate?.(e.client_id, o);
        }
        break;
      case "Chat":
        this.onChat?.(e.client_id, e.text, e.timestamp);
        break;
    }
  }
  setCallbacks(e) {
    e.onConnect && (this.onConnect = e.onConnect), e.onDisconnect && (this.onDisconnect = e.onDisconnect), e.onWelcome && (this.onWelcome = e.onWelcome), e.onPlayerJoin && (this.onPlayerJoin = e.onPlayerJoin), e.onPlayerUpdate && (this.onPlayerUpdate = e.onPlayerUpdate), e.onPlayerLeave && (this.onPlayerLeave = e.onPlayerLeave), e.onChat && (this.onChat = e.onChat), e.onPing && (this.onPing = e.onPing), e.onReliableFailed && (this.onReliableFailed = e.onReliableFailed), e.onError && (this.onError = e.onError);
  }
  getPlayers() {
    return new Map(this.players);
  }
  clearReconnectTimer() {
    this.reconnectTimer && (clearTimeout(this.reconnectTimer), this.reconnectTimer = null);
  }
  startPingLoop() {
    this.pingIntervalMs <= 0 || (this.stopPingLoop(), this.pingTimer = setInterval(() => {
      const e = this.ws;
      if (!e || e.readyState !== WebSocket.OPEN) return;
      const t = Date.now();
      this.lastPingSentAt = t;
      try {
        e.send(JSON.stringify({ type: "Ping", ts: t }));
      } catch {
      }
    }, this.pingIntervalMs));
  }
  stopPingLoop() {
    this.pingTimer && (clearInterval(this.pingTimer), this.pingTimer = null);
  }
  clearUpdateFlushTimer() {
    this.updateFlushTimer && (clearTimeout(this.updateFlushTimer), this.updateFlushTimer = null);
  }
  flushOfflineQueue() {
    const e = this.ws;
    if (!(!e || e.readyState !== WebSocket.OPEN)) {
      if (this.pendingChats.length > 0) {
        const t = this.pendingChats;
        this.pendingChats = [];
        for (const r of t)
          try {
            const o = {
              type: "Chat",
              text: r.text,
              ...r.range !== void 0 ? { range: r.range } : {}
            };
            this.enableAck ? this.sendReliable(o) : e.send(JSON.stringify(o));
          } catch {
            this.offlineQueueSize > 0 && (this.pendingChats = t.slice(t.indexOf(r)));
            break;
          }
      }
      if (this.pendingUpdate) {
        const t = this.pendingUpdate;
        this.pendingUpdate = null, this.updateLocalPlayer(t);
      }
    }
  }
  tryReconnect() {
    if (!this.shouldReconnect || this.reconnectAttemptsMax <= 0 || this.reconnectAttemptsUsed >= this.reconnectAttemptsMax || this.isConnecting) return;
    const e = this.reconnectAttemptsUsed + 1, t = this.reconnectDelayMs || 0, r = Math.min(3e4, Math.floor(t * Math.pow(2, this.reconnectAttemptsUsed)));
    this.reconnectAttemptsUsed = e, this.warn("[PlayerNetworkManager] Reconnecting...", { attempt: e, delay: r }), this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null, this.shouldReconnect && this.connect();
    }, r);
  }
  nextAckId() {
    const e = this.ackIdCounter++;
    return `ack_${Date.now()}_${e}`;
  }
  sendReliable(e) {
    const t = this.ws;
    if (!t || t.readyState !== WebSocket.OPEN) return;
    const r = this.nextAckId(), o = String(e.type ?? "Unknown"), i = JSON.stringify({ ...e, ackId: r });
    try {
      t.send(i);
    } catch {
      return;
    }
    this.trackPendingAck({ ackId: r, raw: i, messageType: o });
  }
  trackPendingAck(e) {
    this.enableAck && (this.stopAckTimer(e.ackId), this.pendingAcks.set(e.ackId, {
      raw: e.raw,
      messageType: e.messageType,
      retriesLeft: this.reliableRetryCount,
      timer: null
    }), this.scheduleAckTimeout(e.ackId));
  }
  scheduleAckTimeout(e) {
    if (!this.enableAck) return;
    const t = this.pendingAcks.get(e);
    t && (this.reliableTimeoutMs <= 0 || (t.timer = setTimeout(() => {
      const r = this.pendingAcks.get(e);
      if (!r) return;
      const o = this.ws;
      if (!o || o.readyState !== WebSocket.OPEN) {
        r.timer = null;
        return;
      }
      if (r.retriesLeft <= 0) {
        this.pendingAcks.delete(e), this.onReliableFailed?.({ ackId: e, messageType: r.messageType });
        return;
      }
      r.retriesLeft -= 1;
      try {
        o.send(r.raw);
      } catch {
        r.timer = null;
        return;
      }
      this.scheduleAckTimeout(e);
    }, this.reliableTimeoutMs)));
  }
  stopAckTimer(e) {
    const t = this.pendingAcks.get(e);
    !t || !t.timer || (clearTimeout(t.timer), t.timer = null);
  }
  ackReceived(e) {
    this.pendingAcks.get(e) && (this.stopAckTimer(e), this.pendingAcks.delete(e));
  }
  pausePendingAcks() {
    for (const [e, t] of this.pendingAcks.entries())
      t.timer && (clearTimeout(t.timer), t.timer = null), this.enableAck || this.pendingAcks.delete(e);
  }
  resumePendingAcks() {
    if (!this.enableAck) return;
    const e = this.ws;
    if (!(!e || e.readyState !== WebSocket.OPEN))
      for (const [t, r] of this.pendingAcks.entries()) {
        try {
          e.send(r.raw);
        } catch {
          continue;
        }
        this.scheduleAckTimeout(t);
      }
  }
  clearAllPendingAcks(e) {
    for (const [t, r] of this.pendingAcks.entries())
      r.timer && clearTimeout(r.timer), r.timer = null, e && this.pendingAcks.delete(t);
    e && this.pendingAcks.clear();
  }
}
class Ha {
  lastPosition = new v.Vector3();
  lastRotation = new v.Quaternion();
  lastAnimation = "idle";
  velocity = new v.Vector3();
  lastUpdateTime = 0;
  config;
  tempPos = new v.Vector3();
  tempRot = new v.Quaternion();
  tempSendRot = new v.Quaternion();
  tempEuler = new v.Euler();
  baseYaw = null;
  scratchUpdate = {
    name: "",
    color: "",
    position: [0, 0, 0],
    rotation: [1, 0, 0, 0],
    animation: "idle",
    velocity: [0, 0, 0]
  };
  constructor(e) {
    this.config = e;
  }
  trackPosition(e, t, r, o, i) {
    if (!e.current) return null;
    const s = Date.now();
    if (s - this.lastUpdateTime < this.config.sendRateLimit)
      return null;
    const a = e.current.translation(), u = e.current.rotation();
    this.tempPos.set(a.x, a.y, a.z), this.tempRot.set(u.x, u.y, u.z, u.w);
    const c = e.current.linvel();
    if (c)
      this.velocity.set(c.x, c.y, c.z);
    else {
      const _ = (s - this.lastUpdateTime) / 1e3;
      _ > 0 && this.velocity.set(
        (a.x - this.lastPosition.x) / _,
        (a.y - this.lastPosition.y) / _,
        (a.z - this.lastPosition.z) / _
      );
    }
    const f = this.velocity.length(), d = typeof i == "string" ? i.trim() : "", p = this.config.velocityThreshold, h = this.config.velocityThreshold * 0.6, x = this.lastAnimation === "run" ? f < h ? "idle" : "run" : f > p ? "run" : "idle", y = d.length > 0 ? d : x;
    this.tempSendRot.copy(this.tempRot);
    const g = this.velocity.x, m = this.velocity.z;
    if (Math.hypot(g, m) > 0.05) {
      this.baseYaw === null && (this.tempEuler.setFromQuaternion(this.tempRot, "YXZ"), this.baseYaw = this.tempEuler.y + Math.PI);
      const _ = Math.atan2(g, m) + (this.baseYaw ?? 0);
      this.tempEuler.set(0, _, 0, "YXZ"), this.tempSendRot.setFromEuler(this.tempEuler);
    }
    const S = !this.lastPosition.equals(this.tempPos), C = !this.lastRotation.equals(this.tempSendRot), T = this.lastAnimation !== y;
    if (!S && !C && !T)
      return null;
    const M = this.scratchUpdate;
    return M.name = t, M.color = r, M.position[0] = a.x, M.position[1] = a.y, M.position[2] = a.z, M.rotation[0] = this.tempSendRot.w, M.rotation[1] = this.tempSendRot.x, M.rotation[2] = this.tempSendRot.y, M.rotation[3] = this.tempSendRot.z, M.animation = y, M.velocity[0] = this.velocity.x, M.velocity[1] = this.velocity.y, M.velocity[2] = this.velocity.z, M.modelUrl = o, this.lastPosition.copy(this.tempPos), this.lastRotation.copy(this.tempSendRot), this.lastAnimation = y, this.lastUpdateTime = s, M;
  }
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
  reset() {
    this.lastPosition.set(0, 0, 0), this.lastRotation.set(0, 0, 0, 1), this.lastAnimation = "idle", this.velocity.set(0, 0, 0), this.lastUpdateTime = 0, this.baseYaw = null;
  }
}
function _n(n = {}) {
  const {
    systemId: e = "main",
    config: t,
    enableAutoUpdate: r = !0
  } = n, o = E(null), [i, s] = Z(null), [a, u] = Z(!1);
  L(() => {
    o.current || (o.current = Xo.getOrCreate("networks"));
    const x = o.current;
    return x ? (e === "main" ? x.ensureMainEngine() : x.getEngine(e) || x.register(e), t && Object.keys(t).length > 0 && x.execute(e, { type: "updateConfig", data: { config: t } }), s(x), u(!0), () => {
    }) : (s(null), u(!1), () => {
    });
  }, [e, t]), de((x, y) => {
    r && o.current && a && o.current.updateSystem(e, y);
  });
  const c = q((x) => {
    o.current && a && o.current.execute(e, x);
  }, [e, a]), f = q(() => o.current && a ? o.current.snapshot(e) : null, [e, a]), d = q(() => o.current && a ? o.current.getNetworkStats(e) : null, [e, a]), p = q(() => o.current && a ? o.current.getSystemState(e) : null, [e, a]), h = q((x) => {
    o.current && a && o.current.updateSystem(e, x);
  }, [e, a]);
  return {
    bridge: i,
    executeCommand: c,
    getSnapshot: f,
    getNetworkStats: d,
    getSystemState: p,
    updateSystem: h,
    isReady: a
  };
}
function Mp(n) {
  const { npcId: e, initialOptions: t, ...r } = n, {
    executeCommand: o,
    getSnapshot: i,
    isReady: s
  } = _n(r), a = E(!1), u = E(null), c = E(/* @__PURE__ */ new Set());
  L(() => (s && t && !a.current && f(t), () => {
    a.current && d();
  }), [s, t]);
  const f = q((m) => {
    !s || a.current || (o({
      type: "registerNPC",
      npcId: e,
      position: m.position,
      ...m.connectionRange !== void 0 ? { options: { communicationRange: m.connectionRange } } : {}
    }), a.current = !0, u.current = m.position.clone(), m.autoConnect);
  }, [s, o, e]), d = q(() => {
    !s || !a.current || (o({
      type: "unregisterNPC",
      npcId: e
    }), a.current = !1, u.current = null, c.current.clear());
  }, [s, o, e]), p = q((m) => {
    !s || !a.current || (o({
      type: "updateNPCPosition",
      npcId: e,
      position: m
    }), u.current = m.clone());
  }, [s, o, e]), h = q((m, w) => {
    !s || !a.current || (o({
      type: "connect",
      npcId: e,
      targetId: m
    }), c.current.add(m));
  }, [s, o, e]), x = q((m) => {
    !s || !a.current || (o({
      type: "disconnect",
      npcId: e,
      targetId: m
    }), c.current.delete(m));
  }, [s, o, e]), y = q(() => Array.from(c.current), []), g = q(() => u.current ? u.current.clone() : null, []);
  return {
    // NPC 관리
    registerNPC: f,
    unregisterNPC: d,
    updatePosition: p,
    // 연결 관리
    connectTo: h,
    disconnectFrom: x,
    // 상태 조회
    isRegistered: a.current,
    getConnections: y,
    getPosition: g,
    // 브릿지 기능
    executeCommand: o,
    getSnapshot: i,
    isReady: s
  };
}
function Cp(n) {
  const { senderId: e, onMessageSent: t, ...r } = n, {
    executeCommand: o,
    isReady: i
  } = _n(r), s = 500, [a, u] = Z([]), [c, f] = Z([]), [d, p] = Z([]), h = E(0), x = q((C, T, M = "chat", _) => {
    if (!i) return "";
    const k = `${e}-${++h.current}-${Date.now()}`, R = Date.now(), z = {
      id: k,
      from: e,
      to: C,
      type: M === "action" || M === "state" || M === "system" ? M : "chat",
      payload: T,
      priority: _?.priority ?? "normal",
      timestamp: R,
      reliability: _?.reliable ? "reliable" : "unreliable",
      ..._?.retries !== void 0 ? { retryCount: _.retries } : {}
    };
    return o({
      type: "sendMessage",
      message: z
    }), f((N) => {
      const P = [...N, z];
      return P.length > s ? P.slice(-s) : P;
    }), t?.(z), k;
  }, [i, o, e, t]), y = q((C, T = "chat", M) => {
    if (!i) return "";
    const _ = `${e}-broadcast-${++h.current}-${Date.now()}`, k = Date.now(), R = {
      id: _,
      from: e,
      type: T === "action" || T === "state" || T === "system" ? T : "chat",
      payload: C,
      priority: M?.priority ?? "normal",
      timestamp: k,
      reliability: M?.reliable ? "reliable" : "unreliable",
      ...M?.groupId ? { groupId: M.groupId } : {},
      ...M?.retries !== void 0 ? { retryCount: M.retries } : {}
    };
    o({
      type: "broadcast",
      message: R
    });
    const z = { ...R, to: "broadcast" };
    return f((N) => {
      const P = [...N, z];
      return P.length > s ? P.slice(-s) : P;
    }), t?.(z), _;
  }, [i, o, e, t]), g = q(() => {
    u([]), f([]), p([]);
  }, []), m = q((C) => C ? [...a, ...c].filter(
    (T) => T.from === C || T.to === C || T.from === e && T.to === C || T.to === e && T.from === C
  ).sort((T, M) => T.timestamp - M.timestamp) : [...a, ...c].sort((T, M) => T.timestamp - M.timestamp), [a, c, e]), w = q((C) => [...a, ...c].find((T) => T.id === C) || null, [a, c]), S = q(() => ({
    totalSent: c.length,
    totalReceived: a.length,
    totalPending: d.length,
    averageLatency: 0
  }), [c, a, d]);
  return {
    sendMessage: x,
    broadcastMessage: y,
    receivedMessages: a,
    sentMessages: c,
    pendingMessages: d,
    clearMessages: g,
    getMessageHistory: m,
    getMessageById: w,
    getMessageStats: S,
    isReady: i
  };
}
function kp(n) {
  const {
    npcId: e,
    onGroupJoined: t,
    onGroupLeft: r,
    onGroupMessage: o,
    onGroupMemberJoined: i,
    onGroupMemberLeft: s,
    ...a
  } = n, {
    executeCommand: u,
    getSystemState: c,
    isReady: f
  } = _n(a), [d, p] = Z([]), [h, x] = Z([]), [y, g] = Z([]), [m, w] = Z(/* @__PURE__ */ new Map()), S = E(0), C = E(/* @__PURE__ */ new Map()), T = E(/* @__PURE__ */ new Set()), M = E([]);
  M.current = d;
  const _ = E(/* @__PURE__ */ new Set()), k = E(""), R = E(null), z = 2e3, N = 500;
  L(() => {
    if (!f) return;
    const X = `node_${e}`, K = setInterval(() => {
      const Q = c();
      if (!Q) return;
      const ee = Array.from(Q.groups.values()), se = ee.map((re) => `${re.id}:${re.members.size}:${re.lastActivity}`).join("|");
      if (se !== k.current) {
        k.current = se, g(ee);
        const re = ee.filter(($) => $.members.has(X)).map(($) => $.id);
        _.current.clear();
        for (const $ of re) _.current.add($);
        const ge = M.current, ne = re.filter(($) => !ge.includes($)), Y = ge.filter(($) => !re.includes($));
        if ((ne.length > 0 || Y.length > 0) && (p(re), x(re), R.current = null, ne.forEach(($) => {
          const ae = ee.find((ye) => ye.id === $);
          ae && t?.($, ae);
        }), Y.forEach(($) => r?.($)), Y.length > 0)) {
          for (const $ of Y)
            C.current.delete($);
          w(($) => {
            const ae = new Map($);
            for (const ye of Y) ae.delete(ye);
            return ae;
          });
        }
        for (const $ of ee) {
          const ae = new Set(
            Array.from($.members).map(
              (D) => D.startsWith("node_") ? D.slice(5) : D
            )
          ), ye = C.current.get($.id);
          if (ye) {
            for (const D of ae)
              ye.has(D) || i?.(D, $.id);
            for (const D of ye)
              ae.has(D) || s?.(D, $.id);
          }
          C.current.set($.id, ae);
        }
      }
      const oe = Q.messageQueues.get(X) ?? [];
      if (oe.length === 0) return;
      const he = oe[oe.length - 1]?.id ?? null, j = R.current;
      if (j && j === he) return;
      let ue = 0;
      if (j) {
        for (let re = oe.length - 1; re >= 0; re--)
          if (oe[re]?.id === j) {
            ue = re + 1;
            break;
          }
      }
      R.current = he, !(ue >= oe.length) && _.current.size !== 0 && w((re) => {
        const ge = new Map(re), ne = /* @__PURE__ */ new Set();
        for (let Y = ue; Y < oe.length; Y++) {
          const $ = oe[Y];
          if (!$ || $.to !== "group" || !$.groupId || !_.current.has($.groupId) || T.current.has($.id)) continue;
          if (T.current.size >= z) {
            const D = Array.from(T.current);
            T.current = new Set(D.slice(D.length - Math.floor(z / 2)));
          }
          T.current.add($.id);
          const ae = ge.get($.groupId), ye = ne.has($.groupId) ? ae ?? [] : ae ? ae.slice() : [];
          ne.has($.groupId) || (ne.add($.groupId), ge.set($.groupId, ye)), ye.push($), o?.($, $.groupId);
        }
        if (ne.size === 0) return re;
        for (const Y of ne) {
          const $ = ge.get(Y);
          $ && $.length > N && ge.set(Y, $.slice(-N));
        }
        return ge;
      });
    }, 250);
    return () => clearInterval(K);
  }, [f, c, e, t, r, o, i, s]);
  const P = q((X, K = [], Q) => {
    if (!f) return;
    const ee = Date.now();
    u({
      type: "createGroup",
      group: {
        type: "party",
        members: /* @__PURE__ */ new Set(),
        maxMembers: Q?.maxSize ?? 20,
        range: 1e3,
        persistent: !1,
        createdAt: ee,
        lastActivity: ee
      }
    });
  }, [f, u, e]), B = q((X) => {
    f && u({
      type: "joinGroup",
      npcId: e,
      groupId: X
    });
  }, [f, u, e]), U = q((X) => {
    f && u({
      type: "leaveGroup",
      npcId: e,
      groupId: X
    });
  }, [f, u, e]), W = q((X, K, Q = "chat") => {
    if (!f || !d.includes(X)) return "";
    const ee = `${e}-group-${++S.current}-${Date.now()}`, se = Date.now();
    return u({
      type: "sendMessage",
      message: {
        id: ee,
        from: e,
        to: "group",
        groupId: X,
        type: Q === "action" || Q === "state" || Q === "system" ? Q : "chat",
        payload: K,
        priority: "normal",
        timestamp: se,
        reliability: "reliable"
      }
    }), ee;
  }, [f, u, e, d]), H = q((X, K) => {
    if (!f || !h.includes(X)) return;
    const Q = {
      id: `invite-${Date.now()}`,
      from: e,
      to: K,
      type: "system",
      payload: { groupId: X, inviterId: e },
      priority: "normal",
      timestamp: Date.now(),
      reliability: "reliable"
    };
    u({
      type: "sendMessage",
      message: Q
    });
  }, [f, u, e, h]), I = q((X, K) => {
    !f || !h.includes(X) || u({
      type: "leaveGroup",
      npcId: K,
      groupId: X
    });
  }, [f, u, h]), G = q((X) => y.find((K) => K.id === X) || null, [y]), V = q((X) => {
    const K = G(X);
    return K ? Array.from(K.members).map(
      (Q) => Q.startsWith("node_") ? Q.slice(5) : Q
    ) : [];
  }, [G]), J = q((X) => m.get(X) || [], [m]);
  return {
    // 그룹 생성 및 관리
    createGroup: P,
    joinGroup: B,
    leaveGroup: U,
    // 그룹 메시지
    sendGroupMessage: W,
    // 그룹 멤버 관리
    inviteToGroup: H,
    kickFromGroup: I,
    // 그룹 상태
    joinedGroups: d,
    ownedGroups: h,
    availableGroups: y,
    // 그룹 정보 조회
    getGroupInfo: G,
    getGroupMembers: V,
    getGroupMessages: J,
    // 브릿지 기능
    isReady: f
  };
}
function Ip(n = {}) {
  const {
    updateInterval: e = 1e3,
    enableRealTime: t = !0,
    trackHistory: r = !1,
    historyLength: o = 100,
    ...i
  } = n, {
    getSnapshot: s,
    getNetworkStats: a,
    getSystemState: u,
    isReady: c
  } = _n(i), [f, d] = Z(null), [p, h] = Z([]), [x, y] = Z(!1), [g, m] = Z(0), w = q(() => {
    if (!c) return null;
    const M = s(), _ = a(), k = u();
    if (!M || !_) return null;
    const R = M.nodeCount, z = M.connectionCount, N = _.totalMessages ?? 0, P = z, B = 0, U = (z > 0, 100), W = M.messagesPerSecond, H = {
      updateTime: 0,
      messageProcessingTime: 0,
      connectionProcessingTime: 0
    }, I = k ? Array.from(k.groups.values()) : [], G = k ? k.groups.size : M.activeGroups, V = G, J = G > 0 ? I.reduce((X, K) => X + K.members.size, 0) / G : 0;
    return {
      // 기본 통계
      totalNodes: R,
      totalConnections: z,
      totalMessages: N,
      averageLatency: M.averageLatency,
      messagesPerSecond: W,
      // 연결 통계
      activeConnections: P,
      failedConnections: B,
      connectionSuccessRate: U,
      // 메시지 통계
      sentMessages: N,
      receivedMessages: N,
      failedMessages: 0,
      messageSuccessRate: 100,
      // 성능 통계
      updateTime: H.updateTime,
      messageProcessingTime: H.messageProcessingTime,
      connectionProcessingTime: H.connectionProcessingTime,
      // 그룹 통계
      totalGroups: G,
      activeGroups: V,
      averageGroupSize: J
    };
  }, [c, s, a, u, e]), S = q(() => {
    y(!0);
    const M = w();
    M && (d(M), m(Date.now()), r && h((_) => {
      const k = [..._, M];
      return k.length > o ? k.slice(-o) : k;
    })), y(!1);
  }, [w, r, o]);
  L(() => {
    if (!t || !c) return;
    const M = setInterval(() => {
      S();
    }, e);
    return () => clearInterval(M);
  }, [t, c, S, e]), L(() => {
    c && S();
  }, [c, S]);
  const C = q((M) => p.length === 0 ? 0 : p.reduce((k, R) => k + R[M], 0) / p.length, [p]), T = q((M) => p.length === 0 ? 0 : Math.max(...p.map((_) => _[M])), [p]);
  return {
    // 현재 통계
    stats: f,
    // 기록된 통계
    statsHistory: r ? p : [],
    // 통계 조회
    refreshStats: S,
    getHistoricalAverage: C,
    getPeakValue: T,
    // 상태
    isLoading: x,
    lastUpdate: g,
    // 브릿지 기능
    isReady: c
  };
}
function Ap(n) {
  const [e, t] = Z(!1), [r, o] = Z(/* @__PURE__ */ new Map()), [i, s] = Z(), a = E(null), u = q((d) => {
    const p = { ...n, ...d };
    a.current && a.current.disconnect();
    const h = new ai({
      url: p.url,
      roomId: p.roomId,
      playerName: p.playerName,
      playerColor: p.playerColor,
      onConnect: () => {
        t(!0), s(void 0);
      },
      onDisconnect: () => {
        t(!1), o(/* @__PURE__ */ new Map());
      },
      onPlayerJoin: (x, y) => {
        o((g) => {
          const m = new Map(g);
          return m.set(x, y), m;
        });
      },
      onPlayerUpdate: (x, y) => {
        o((g) => {
          const m = new Map(g);
          return m.set(x, y), m;
        });
      },
      onPlayerLeave: (x) => {
        o((y) => {
          const g = new Map(y);
          return g.delete(x), g;
        });
      },
      onError: (x) => {
        s(x);
      }
    });
    a.current = h, h.connect();
  }, [n]), c = q(() => {
    a.current?.disconnect(), t(!1), o(/* @__PURE__ */ new Map());
  }, []), f = q((d) => {
    a.current?.updateLocalPlayer(d);
  }, []);
  return L(() => () => {
    a.current?.disconnect(), a.current = null;
  }, []), {
    isConnected: e,
    players: r,
    error: i,
    connect: u,
    disconnect: c,
    updateLocalPlayer: f
  };
}
function Tp(n) {
  const { config: e, characterUrl: t, rigidBodyRef: r } = n, o = pe((N) => N.mode?.type ?? "character"), i = pe((N) => N.animationState), [s, a] = Z({
    isConnected: !1,
    connectionStatus: "disconnected",
    players: /* @__PURE__ */ new Map(),
    localPlayerId: null,
    roomId: null,
    error: null,
    ping: 0,
    lastUpdate: 0
  }), u = E(null), c = E(null), f = E(null), d = E(null), p = E(e), h = E(s), x = E(o), y = E(i);
  L(() => {
    h.current = s;
  }, [s]), L(() => {
    x.current = o;
  }, [o]), L(() => {
    y.current = i;
  }, [i]);
  const [g, m] = Z(
    () => /* @__PURE__ */ new Map()
  ), w = E(/* @__PURE__ */ new Map());
  L(() => {
    w.current = g;
  }, [g]), L(() => {
    r && (d.current = r);
  }, [r]), L(() => {
    const N = {
      updateRate: e.tracking.updateRate,
      velocityThreshold: e.tracking.velocityThreshold,
      sendRateLimit: e.tracking.sendRateLimit
    };
    f.current = new Ha(N);
  }, [e.tracking]);
  const S = q((N) => {
    c.current && c.current.disconnect(), u.current = {
      playerName: N.playerName,
      playerColor: N.playerColor
    }, a((B) => ({
      ...B,
      connectionStatus: "connecting",
      error: null,
      roomId: N.roomId
    }));
    const P = new ai({
      url: e.websocket.url,
      roomId: N.roomId,
      playerName: N.playerName,
      playerColor: N.playerColor,
      reconnectAttempts: e.websocket.reconnectAttempts,
      reconnectDelay: e.websocket.reconnectDelay,
      pingInterval: e.websocket.pingInterval,
      sendRateLimit: e.tracking.sendRateLimit,
      enableAck: e.enableAck,
      reliableTimeout: e.reliableTimeout,
      reliableRetryCount: e.reliableRetryCount,
      logLevel: e.logLevel,
      logToConsole: e.logToConsole,
      onConnect: () => {
        a((B) => ({
          ...B,
          isConnected: !0,
          connectionStatus: "connected",
          error: null,
          lastUpdate: Date.now()
        }));
      },
      onWelcome: (B) => {
        a((U) => ({
          ...U,
          localPlayerId: B,
          lastUpdate: Date.now()
        }));
      },
      onDisconnect: () => {
        a((B) => ({
          ...B,
          isConnected: !1,
          connectionStatus: "disconnected",
          players: /* @__PURE__ */ new Map(),
          localPlayerId: null,
          lastUpdate: Date.now()
        }));
      },
      onPlayerJoin: (B, U) => {
        a((W) => {
          const H = new Map(W.players);
          return H.set(B, U), {
            ...W,
            players: H,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerUpdate: (B, U) => {
        a((W) => {
          const H = new Map(W.players);
          return H.set(B, U), {
            ...W,
            players: H,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerLeave: (B) => {
        a((U) => {
          const W = new Map(U.players);
          return W.delete(B), {
            ...U,
            players: W,
            lastUpdate: Date.now()
          };
        });
      },
      onChat: (B, U, W) => {
        m((I) => {
          const G = new Map(I);
          return G.set(B, { text: U, expiresAt: Date.now() + 2500 }), G;
        });
      },
      onPing: (B) => {
        a((U) => ({
          ...U,
          ping: B,
          lastUpdate: Date.now()
        }));
      },
      onError: (B) => {
        a((U) => ({
          ...U,
          connectionStatus: "error",
          error: B,
          lastUpdate: Date.now()
        }));
      }
    });
    c.current = P, P.connect();
  }, [
    e.websocket.url,
    e.websocket.reconnectAttempts,
    e.websocket.reconnectDelay,
    e.websocket.pingInterval,
    e.tracking.sendRateLimit,
    e.logLevel,
    e.logToConsole
  ]), C = q(() => {
    c.current?.disconnect(), f.current?.reset(), d.current = null, m(/* @__PURE__ */ new Map()), a((N) => ({
      ...N,
      isConnected: !1,
      connectionStatus: "disconnected",
      players: /* @__PURE__ */ new Map(),
      localPlayerId: null,
      roomId: null,
      error: null
    }));
  }, []), T = q((N) => {
    d.current = N;
  }, []), M = q(() => {
    d.current = null, f.current?.reset();
  }, []), _ = q((N) => {
    p.current = { ...p.current, ...N }, N.tracking && f.current && f.current.updateConfig(N.tracking);
  }, []), k = q((N, P) => {
    const B = c.current;
    if (!B) return;
    const U = P?.range ?? p.current.proximityRange;
    B.sendChat(N, { range: U });
    const W = s.localPlayerId;
    if (!W) return;
    const H = P?.ttlMs ?? 2500, I = String(N ?? "").trim().slice(0, 200);
    I && m((G) => {
      const V = new Map(G);
      return V.set(W, { text: I, expiresAt: Date.now() + H }), V;
    });
  }, [s.localPlayerId]);
  L(() => {
    if (!s.isConnected) return;
    const N = Math.max(15, Math.floor(1e3 / Math.max(1, p.current.tracking.updateRate))), P = window.setInterval(() => {
      if (!h.current.isConnected || !c.current || !f.current || !d.current?.current || !u.current) return;
      const { playerName: U, playerColor: W } = u.current, H = x.current, I = y.current?.[H]?.current ?? "idle", G = f.current.trackPosition(
        d.current,
        U,
        W,
        t,
        I
      );
      if (G) {
        const { modelUrl: V, ...J } = G;
        c.current.updateLocalPlayer(
          V ? { ...J, modelUrl: V } : J
        );
      }
      if (w.current.size > 0) {
        const V = Date.now(), J = [];
        if (w.current.forEach((X, K) => {
          X.expiresAt <= V && J.push(K);
        }), J.length > 0) {
          const X = new Map(w.current);
          for (const K of J) X.delete(K);
          m(X);
        }
      }
    }, N);
    return () => window.clearInterval(P);
  }, [s.isConnected, t]), L(() => () => {
    c.current?.disconnect();
  }, []);
  const R = F(() => {
    const N = /* @__PURE__ */ new Map();
    return g.forEach((P, B) => {
      N.set(B, P.text);
    }), N;
  }, [g]), z = s.localPlayerId ? g.get(s.localPlayerId)?.text ?? null : null;
  return {
    ...s,
    connect: S,
    disconnect: C,
    startTracking: T,
    stopTracking: M,
    updateConfig: _,
    sendChat: k,
    speechByPlayerId: R,
    localSpeechText: z
  };
}
const ja = (n, e, t) => n < e ? e : n > t ? t : n, $a = (n) => ja(n, 0, 1), Va = (n, e, t, r = 4) => {
  const o = Math.max(0, n), i = Math.max(0, e), s = Math.max(i + 1e-6, t), a = Math.max(0, r);
  return !Number.isFinite(o) || !Number.isFinite(i) || !Number.isFinite(s) || !Number.isFinite(a) ? a : $a((o - i) / (s - i)) * a;
}, qa = (n) => {
  const e = Math.max(0, n);
  return Number.isFinite(e) ? Math.exp(-e) : 0;
}, Ct = (n, e, t, r = 4) => n <= e ? 1 : n >= t ? 0 : qa(Va(n, e, t, r));
function fo(n) {
  return "color" in n && n.color instanceof v.Color;
}
const Ya = Ce.memo(function({ state: e, characterUrl: t, config: r, speechText: o }) {
  const i = E(null), s = E(null), a = E(null);
  a.current || (a.current = [e.position[0], e.position[1], e.position[2]]);
  const u = E(new v.Vector3()), c = E(new v.Quaternion()), f = E(new v.Vector3()), d = E(performance.now()), p = E(new v.Vector3()), h = E(new v.Quaternion()), x = E(new v.Vector3()), y = E(new v.Vector3()), g = E(new v.Vector3()), m = E(new v.Quaternion()), w = E(!1), S = E(new v.Vector3()), C = E(new v.Vector3()), T = E(new v.Vector3()), M = E(new v.Vector3()), _ = E(new v.Vector3()), k = E(new v.Vector3()), R = E({ x: 0, y: 0, z: 0 }), z = E({ x: 0, y: 0, z: 0, w: 1 }), N = E(0), P = E(0), B = t || e.modelUrl || "";
  if (!B) return null;
  const U = (ne) => {
    if (typeof ne != "string") return null;
    const Y = ne.trim();
    if (!Y) return null;
    const $ = Y.startsWith("#") ? Y : `#${Y}`;
    return /^#[0-9a-fA-F]{3}$/.test($) || /^#[0-9a-fA-F]{6}$/.test($) ? $ : null;
  }, W = F(() => U(e.color), [e.color]), H = r?.tracking?.interpolationSpeed || 0.15, I = r?.rendering?.characterScale || 1, G = r?.rendering?.nameTagHeight || 3.5, V = r?.rendering?.nameTagSize || 0.5, { scene: J, animations: X } = Jo(B), K = F(() => Qo.clone(J), [J]), { actions: Q, ref: ee } = vs(X, s), se = E([]), oe = E(null), he = E(null), j = E(performance.now()), ue = E(new v.Vector3());
  L(() => {
    for (const Y of se.current)
      try {
        Y.dispose();
      } catch {
      }
    if (se.current = [], !W) return;
    const ne = (Y) => {
      if (!fo(Y)) return Y;
      const $ = Y.clone();
      return fo($) ? ($.color.set(W), se.current.push($), $) : Y;
    };
    return K.traverse((Y) => {
      (Y instanceof v.Mesh || Y instanceof v.SkinnedMesh) && Y.material && (Array.isArray(Y.material) ? Y.material = Y.material.map(($) => ne($)) : Y.material = ne(Y.material));
    }), () => {
      for (const Y of se.current)
        try {
          Y.dispose();
        } catch {
        }
      se.current = [];
    };
  }, [K, W]);
  const re = (ne) => {
    if (!Q) return null;
    const Y = Q[ne];
    if (Y) return Y;
    const $ = ne.toLowerCase(), ae = Object.keys(Q), ye = ae.find((D) => D.toLowerCase().includes($));
    if (ye) return Q[ye] ?? null;
    if ($ === "run") {
      const D = ae.find((A) => A.toLowerCase().includes("walk")) ?? ae[0];
      return D ? Q[D] ?? null : null;
    }
    if ($ === "idle") {
      const D = ae.find((A) => A.toLowerCase().includes("idle")) ?? ae[0];
      return D ? Q[D] ?? null : null;
    }
    return ae[0] ? Q[ae[0]] ?? null : null;
  }, ge = (ne, Y, $, ae, ye, D, A) => {
    const be = Math.max(1e-4, ae), Ne = Math.max(0, D), Ie = 2 / be, Be = Ie * Ne, En = 1 / (1 + Be + 0.48 * Be * Be + 0.235 * Be * Be * Be);
    T.current.copy(Y), S.current.copy(ne).sub(Y);
    const kt = ye * be, Qe = S.current.length();
    Qe > kt && Qe > 0 && S.current.multiplyScalar(kt / Qe), M.current.copy(ne).sub(S.current), C.current.copy($).addScaledVector(S.current, Ie).multiplyScalar(Ne), $.addScaledVector(C.current, -Ie).multiplyScalar(En), A.copy(S.current).add(C.current).multiplyScalar(En).add(M.current), _.current.copy(T.current).sub(ne), k.current.copy(A).sub(T.current), _.current.dot(k.current) > 0 && (A.copy(T.current), $.set(0, 0, 0));
  };
  return L(() => {
    if (!Q) return;
    const ne = r?.tracking?.velocityThreshold ?? 0.5, Y = ne, $ = ne * 0.6, ae = 180, ye = e.velocity ? Math.hypot(e.velocity[0], e.velocity[1], e.velocity[2]) : f.current.length(), D = e.animation?.trim(), A = (oe.current ?? "idle") === "run" ? ye < $ ? "idle" : "run" : ye > Y ? "run" : "idle", be = (D && D.length > 0 ? D : A) || "idle";
    if (oe.current === be) return;
    const Ne = performance.now();
    if (Ne - j.current < ae) return;
    const Ie = re(be);
    if (!Ie) return;
    const Be = he.current;
    return Ie.enabled = !0, Ie.setEffectiveTimeScale(1), Ie.setEffectiveWeight(1), Ie.reset().play(), Be && Be !== Ie ? Ie.crossFadeFrom(Be, 0.18, !0) : Ie.fadeIn(0.18), oe.current = be, he.current = Ie, j.current = Ne, () => {
    };
  }, [Q, e.animation, e.velocity, r?.tracking?.velocityThreshold]), L(() => {
    if (d.current = performance.now(), u.current.set(
      e.position[0],
      e.position[1],
      e.position[2]
    ), ue.current.set(e.position[0], e.position[1], e.position[2]), !w.current && i.current) {
      const ae = u.current;
      w.current = !0, y.current.copy(ae), g.current.set(0, 0, 0), m.current.copy(c.current);
      const ye = i.current, D = R.current;
      D.x = ae.x, D.y = ae.y, D.z = ae.z, ye.setNextKinematicTranslation(D);
      const A = z.current;
      A.x = c.current.x, A.y = c.current.y, A.z = c.current.z, A.w = c.current.w, ye.setNextKinematicRotation(A);
    }
    const ne = e.rotation, $ = Math.abs(ne[0]) < 1e-6 && Math.abs(ne[1]) < 1e-6 && Math.abs(ne[2]) < 1e-6 && Math.abs(ne[3] - 1) < 1e-6 ? [1, 0, 0, 0] : ne;
    c.current.set(
      $[1],
      $[2],
      $[3],
      $[0]
    ), e.velocity && f.current.set(
      e.velocity[0],
      e.velocity[1],
      e.velocity[2]
    );
  }, [e.position, e.rotation, e.velocity]), de((ne, Y) => {
    if (!i.current || !s.current) return;
    const $ = P.current;
    if ($ > 0) {
      if (N.current += Math.max(0, Y), N.current < $) return;
      N.current = 0;
    } else
      N.current = 0;
    const ae = w.current ? y.current : u.current, ye = ne.camera.position.distanceTo(ae), D = w.current ? Ct(ye, 25, 140, 4) : 1;
    P.current = D >= 0.7 ? 0 : D >= 0.4 ? 1 / 30 : D >= 0.2 ? 1 / 15 : 1 / 8;
    const A = (performance.now() - d.current) / 1e3, be = Math.max(0, Math.min(0.12, A));
    if (x.current.copy(u.current).addScaledVector(f.current, be), !w.current) {
      const At = i.current.translation(), vt = i.current.rotation();
      w.current = !0, y.current.set(At.x, At.y, At.z), g.current.set(0, 0, 0), m.current.set(vt.x, vt.y, vt.z, vt.w);
    }
    const Ne = Math.max(0.01, Math.min(0.9, H)), Ie = Math.max(0.03, Math.min(0.22, 0.03 + (1 - Ne) * 0.19)), Be = 120;
    if (y.current.distanceTo(x.current) > 10 || Y > 0.25)
      y.current.copy(x.current), g.current.set(0, 0, 0), m.current.copy(c.current);
    else {
      ge(
        y.current,
        x.current,
        g.current,
        Ie,
        Be,
        Y,
        p.current
      ), y.current.copy(p.current);
      const At = Math.max(0.025, Ie * 0.7), vt = 1 - Math.exp(-Math.max(0, Y) / At);
      h.current.copy(m.current).slerp(c.current, vt), m.current.copy(h.current);
    }
    ue.current.copy(y.current);
    const kt = i.current, Qe = R.current;
    Qe.x = y.current.x, Qe.y = y.current.y, Qe.z = y.current.z, kt.setNextKinematicTranslation(Qe);
    const It = z.current;
    It.x = m.current.x, It.y = m.current.y, It.z = m.current.z, It.w = m.current.w, kt.setNextKinematicRotation(It);
  }), /* @__PURE__ */ b("group", { children: [
    /* @__PURE__ */ b(
      Mt,
      {
        ref: i,
        type: "kinematicPosition",
        position: a.current ?? void 0,
        colliders: !1,
        children: [
          /* @__PURE__ */ l(ks, { args: [0.5, 0.5], position: [0, 1.5, 0] }),
          /* @__PURE__ */ l("group", { ref: s, children: /* @__PURE__ */ l("group", { ref: ee, scale: [I, I, I], children: /* @__PURE__ */ l("primitive", { object: K }) }) }),
          /* @__PURE__ */ l(
            xs,
            {
              position: [0, G, 0],
              fontSize: V,
              color: "white",
              anchorX: "center",
              anchorY: "middle",
              outlineWidth: 0.05,
              outlineColor: "black",
              children: e.name
            }
          )
        ]
      }
    ),
    o ? /* @__PURE__ */ l(
      ii,
      {
        text: o,
        position: ue.current
      }
    ) : null
  ] });
});
function _p({ onConnect: n, error: e, isConnecting: t }) {
  const [r, o] = Z(""), [i, s] = Z("room1"), [a] = Z(() => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`);
  return /* @__PURE__ */ l("div", { style: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a1a1a"
  }, children: /* @__PURE__ */ b(
    "form",
    {
      onSubmit: (c) => {
        c.preventDefault(), r.trim() && n({
          roomId: i,
          playerName: r.trim(),
          playerColor: a
        });
      },
      style: {
        background: "rgba(0, 0, 0, 0.8)",
        padding: "40px",
        borderRadius: "10px",
        color: "white",
        minWidth: "300px"
      },
      children: [
        /* @__PURE__ */ l("h2", { style: { marginBottom: "20px", textAlign: "center" }, children: "네트워크 멀티플레이어" }),
        /* @__PURE__ */ b("div", { style: { marginBottom: "15px" }, children: [
          /* @__PURE__ */ l("label", { style: { display: "block", marginBottom: "5px" }, children: "플레이어 이름" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              placeholder: "이름을 입력하세요",
              value: r,
              onChange: (c) => o(c.target.value),
              disabled: t,
              style: {
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                background: "#333",
                color: "white",
                fontSize: "14px"
              }
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { style: { marginBottom: "20px" }, children: [
          /* @__PURE__ */ l("label", { style: { display: "block", marginBottom: "5px" }, children: "방 코드" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              placeholder: "방 코드",
              value: i,
              onChange: (c) => s(c.target.value),
              disabled: t,
              style: {
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                background: "#333",
                color: "white",
                fontSize: "14px"
              }
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { style: { marginBottom: "20px" }, children: [
          /* @__PURE__ */ l("label", { style: { display: "block", marginBottom: "5px" }, children: "플레이어 색상" }),
          /* @__PURE__ */ l(
            "div",
            {
              style: {
                width: "30px",
                height: "30px",
                backgroundColor: a,
                borderRadius: "50%",
                border: "2px solid #ccc"
              }
            }
          )
        ] }),
        /* @__PURE__ */ l(
          "button",
          {
            type: "submit",
            disabled: !r.trim() || t,
            style: {
              width: "100%",
              padding: "12px",
              borderRadius: "5px",
              border: "none",
              background: !r.trim() || t ? "#666" : "#4CAF50",
              color: "white",
              fontSize: "16px",
              cursor: !r.trim() || t ? "not-allowed" : "pointer",
              transition: "background-color 0.2s"
            },
            children: t ? "연결 중..." : "연결하기"
          }
        ),
        e && /* @__PURE__ */ l("div", { style: {
          color: "#ff6b6b",
          marginTop: "15px",
          padding: "10px",
          background: "rgba(255, 107, 107, 0.1)",
          borderRadius: "5px",
          fontSize: "14px"
        }, children: e })
      ]
    }
  ) });
}
function Pp({ state: n, playerName: e, onDisconnect: t, onSendChat: r }) {
  const { isConnected: o, connectionStatus: i, players: s, roomId: a, error: u, ping: c, localPlayerId: f, lastUpdate: d } = n, [p, h] = Z("");
  if (!o) return null;
  const x = q(() => {
    if (!r) return;
    const y = p.trim();
    y && (r(y), h(""));
  }, [r, p]);
  return /* @__PURE__ */ b("div", { style: {
    position: "fixed",
    top: 10,
    left: 10,
    background: "rgba(0, 0, 0, 0.8)",
    padding: "8px",
    borderRadius: "6px",
    color: "white",
    minWidth: "160px",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    lineHeight: 1.2
  }, children: [
    /* @__PURE__ */ l("h3", { style: {
      marginTop: 0,
      marginBottom: "6px",
      fontSize: "12px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
      paddingBottom: "6px"
    }, children: "네트워크 정보" }),
    /* @__PURE__ */ b("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "상태:" }),
      /* @__PURE__ */ l("span", { style: {
        marginLeft: "8px",
        color: i === "connected" ? "#4CAF50" : "#ff6b6b"
      }, children: i === "connected" ? "연결됨" : i === "connecting" ? "연결 중" : i === "error" ? "오류" : "연결 끊김" })
    ] }),
    e && /* @__PURE__ */ b("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "플레이어:" }),
      " ",
      /* @__PURE__ */ l("span", { style: { marginLeft: "8px" }, children: e })
    ] }),
    a && /* @__PURE__ */ b("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "방:" }),
      " ",
      /* @__PURE__ */ l("span", { style: { marginLeft: "8px" }, children: a })
    ] }),
    f && /* @__PURE__ */ b("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "내 ID:" }),
      " ",
      /* @__PURE__ */ l("span", { style: { marginLeft: "8px" }, children: f })
    ] }),
    /* @__PURE__ */ b("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "최근 업데이트:" }),
      /* @__PURE__ */ l("span", { style: { marginLeft: "8px" }, children: d ? `${Math.max(0, Date.now() - d)}ms 전` : "-" })
    ] }),
    /* @__PURE__ */ b("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "접속자:" }),
      /* @__PURE__ */ b("span", { style: { marginLeft: "8px" }, children: [
        s.size + (o ? 1 : 0),
        "명"
      ] })
    ] }),
    c > 0 && /* @__PURE__ */ b("div", { style: { marginBottom: "8px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "핑:" }),
      /* @__PURE__ */ b("span", { style: {
        marginLeft: "8px",
        color: c < 50 ? "#4CAF50" : c < 100 ? "#FFA726" : "#ff6b6b"
      }, children: [
        c,
        "ms"
      ] })
    ] }),
    s.size > 0 && /* @__PURE__ */ b("div", { style: { marginBottom: "8px" }, children: [
      /* @__PURE__ */ l("strong", { children: "다른 플레이어:" }),
      /* @__PURE__ */ l("div", { style: {
        marginTop: "6px",
        maxHeight: "80px",
        overflowY: "auto",
        fontSize: "11px"
      }, children: Array.from(s.entries()).map(([y, g]) => /* @__PURE__ */ b(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            marginBottom: "4px",
            padding: "3px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "3px"
          },
          children: [
            /* @__PURE__ */ l(
              "div",
              {
                style: {
                  width: "10px",
                  height: "10px",
                  backgroundColor: g.color,
                  borderRadius: "50%",
                  marginRight: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }
              }
            ),
            /* @__PURE__ */ b("span", { style: { flex: 1 }, children: [
              g.name,
              /* @__PURE__ */ b("span", { style: { opacity: 0.7, marginLeft: "8px" }, children: [
                "(",
                g.position[0].toFixed(1),
                ",",
                g.position[1].toFixed(1),
                ",",
                g.position[2].toFixed(1),
                ")"
              ] }),
              g.animation ? /* @__PURE__ */ l("span", { style: { opacity: 0.7, marginLeft: "8px" }, children: g.animation }) : null
            ] })
          ]
        },
        y
      )) })
    ] }),
    u && /* @__PURE__ */ l("div", { style: {
      color: "#ff6b6b",
      marginBottom: "15px",
      padding: "8px",
      background: "rgba(255, 107, 107, 0.1)",
      borderRadius: "5px",
      fontSize: "14px"
    }, children: u }),
    r ? /* @__PURE__ */ b("div", { style: { marginBottom: "8px" }, children: [
      /* @__PURE__ */ l("strong", { children: "채팅:" }),
      /* @__PURE__ */ b("div", { style: { display: "flex", gap: "6px", marginTop: "6px" }, children: [
        /* @__PURE__ */ l(
          "input",
          {
            value: p,
            onChange: (y) => h(y.target.value),
            placeholder: "Enter로 전송",
            style: {
              flex: 1,
              padding: "6px",
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "white",
              fontSize: "12px"
            },
            onKeyDown: (y) => {
              y.key === "Enter" && (y.preventDefault(), x());
            }
          }
        ),
        /* @__PURE__ */ l(
          "button",
          {
            onClick: x,
            style: {
              padding: "6px 8px",
              borderRadius: "4px",
              border: "none",
              background: "#4CAF50",
              color: "white",
              fontSize: "12px",
              cursor: "pointer"
            },
            disabled: !p.trim(),
            children: "전송"
          }
        )
      ] })
    ] }) : null,
    /* @__PURE__ */ l(
      "button",
      {
        onClick: t,
        style: {
          width: "100%",
          padding: "8px",
          borderRadius: "4px",
          border: "none",
          background: "#ff6b6b",
          color: "white",
          fontSize: "12px",
          cursor: "pointer",
          transition: "background-color 0.2s"
        },
        onMouseEnter: (y) => {
          y.currentTarget.style.backgroundColor = "#ff5252";
        },
        onMouseLeave: (y) => {
          y.currentTarget.style.backgroundColor = "#ff6b6b";
        },
        children: "연결 끊기"
      }
    )
  ] });
}
const Za = 6, Xa = 1e-4;
function Ka({
  playerRef: n,
  onChange: e
}) {
  const t = E({ x: 0, y: 0, z: 0 }), r = E(0);
  return de(() => {
    if (r.current++, r.current % Za !== 0) return;
    const o = n.current;
    if (!o) return;
    const i = o.translation(), s = t.current, a = i.x - s.x, u = i.y - s.y, c = i.z - s.z;
    a * a + u * u + c * c < Xa || (s.x = i.x, s.y = i.y, s.z = i.z, e(i.x, i.y, i.z));
  }), null;
}
const Rp = Ce.memo(function({
  players: e,
  characterUrl: t,
  vehicleUrl: r,
  airplaneUrl: o,
  playerRef: i,
  config: s,
  localPlayerColor: a,
  proximityRange: u,
  speechByPlayerId: c,
  localSpeechText: f
}) {
  L(() => {
    window.CHARACTER_URL = t;
  }, [t]);
  const [d, p] = Z([0, 0, 0]), h = F(() => new v.Vector3(), []), x = F(
    () => (g, m, w) => {
      h.set(g, m, w), p([g, m, w]);
    },
    [h]
  ), y = F(() => {
    const g = u;
    if (!g || g <= 0) return e;
    const [m, w, S] = d, C = /* @__PURE__ */ new Map();
    return e.forEach((T, M) => {
      const [_, k, R] = T.position, z = _ - m, N = k - w, P = R - S;
      z * z + N * N + P * P <= g * g && C.set(M, T);
    }), C;
  }, [e, u, d]);
  return /* @__PURE__ */ l(
    _a,
    {
      urls: {
        characterUrl: t,
        vehicleUrl: r,
        airplaneUrl: o
      },
      children: /* @__PURE__ */ b(
        ys,
        {
          shadows: !0,
          dpr: [1, 1.5],
          camera: { position: [0, 10, 20], fov: 75, near: 0.1, far: 1e3 },
          style: { width: "100vw", height: "100vh" },
          children: [
            /* @__PURE__ */ l(ws, { background: !0, preset: "sunset", backgroundBlurriness: 1 }),
            /* @__PURE__ */ l(
              "directionalLight",
              {
                castShadow: !0,
                "shadow-normalBias": 0.06,
                position: [20, 30, 10],
                intensity: 0.5,
                "shadow-mapSize": [1024, 1024],
                "shadow-camera-near": 1,
                "shadow-camera-far": 120,
                "shadow-camera-top": 90,
                "shadow-camera-right": 90,
                "shadow-camera-bottom": -90,
                "shadow-camera-left": -90
              }
            ),
            /* @__PURE__ */ l(tt, { fallback: null, children: /* @__PURE__ */ l(Pa, { children: /* @__PURE__ */ b(Is, { children: [
              /* @__PURE__ */ l(
                Ka,
                {
                  playerRef: i,
                  onChange: x
                }
              ),
              /* @__PURE__ */ l(
                ns,
                {
                  rigidBodyRef: i,
                  rotation: As({ x: 0, y: Math.PI, z: 0 }),
                  parts: [],
                  ...a ? { baseColor: a } : {}
                }
              ),
              f ? /* @__PURE__ */ l(
                ii,
                {
                  text: f,
                  position: h
                }
              ) : null,
              Array.from(y.entries()).map(([g, m]) => /* @__PURE__ */ l(
                Ya,
                {
                  playerId: g,
                  state: m,
                  characterUrl: t,
                  config: s,
                  ...(() => {
                    const w = c?.get(g);
                    return w ? { speechText: w } : {};
                  })()
                },
                g
              )),
              /* @__PURE__ */ l(
                Ss,
                {
                  renderOrder: -1,
                  position: [0, 0.01, 0],
                  infiniteGrid: !0,
                  cellSize: 2,
                  cellThickness: 1,
                  cellColor: "#1d1d1d",
                  sectionSize: 5,
                  sectionThickness: 0,
                  fadeDistance: 1e3
                }
              ),
              /* @__PURE__ */ l(Mt, { type: "fixed", children: /* @__PURE__ */ b("mesh", { receiveShadow: !0, position: [0, -1, 0], children: [
                /* @__PURE__ */ l("boxGeometry", { args: [1e3, 2, 1e3] }),
                /* @__PURE__ */ l("meshStandardMaterial", { color: "#3d3d3d" })
              ] }) }),
              /* @__PURE__ */ l(rs, {}),
              /* @__PURE__ */ l(os, {})
            ] }) }) })
          ]
        }
      )
    }
  );
}), Np = {
  // 기본 NetworkConfig
  updateFrequency: 30,
  maxConnections: 100,
  messageQueueSize: 1e3,
  // 통신 설정
  maxDistance: 100,
  signalStrength: 1,
  bandwidth: 1e3,
  proximityRange: 10,
  // 최적화 설정
  enableBatching: !0,
  batchSize: 10,
  compressionLevel: 1,
  connectionPoolSize: 50,
  // 메시지 설정
  enableChatMessages: !0,
  enableActionMessages: !0,
  enableStateMessages: !0,
  enableSystemMessages: !0,
  // 신뢰성 설정
  reliableRetryCount: 3,
  reliableTimeout: 5e3,
  enableAck: !0,
  // 그룹 설정
  maxGroupSize: 20,
  autoJoinProximity: !0,
  groupMessagePriority: "normal",
  // 디버깅 설정
  enableDebugPanel: !1,
  enableVisualizer: !1,
  showConnectionLines: !1,
  showMessageFlow: !1,
  debugUpdateInterval: 500,
  logLevel: "warn",
  logToConsole: !0,
  logToFile: !1,
  maxLogEntries: 1e3,
  // 보안 설정
  enableEncryption: !1,
  enableRateLimit: !0,
  maxMessagesPerSecond: 100,
  // 메모리 관리
  messageGCInterval: 3e4,
  connectionTimeout: 3e4,
  inactiveNodeCleanup: 6e4,
  // 멀티플레이어 전용 설정
  websocket: {
    url: "ws://localhost:8090",
    reconnectAttempts: 5,
    reconnectDelay: 1e3,
    pingInterval: 3e4
  },
  tracking: {
    updateRate: 20,
    // 20Hz (50ms)
    velocityThreshold: 0.5,
    sendRateLimit: 50,
    // 50ms
    interpolationSpeed: 0.15
  },
  rendering: {
    nameTagHeight: 3.5,
    nameTagSize: 0.5,
    characterScale: 1
  }
};
function Ja() {
  return ve((n) => n.time);
}
function Ep() {
  return ve((n) => ({ hour: n.time.hour, minute: n.time.minute }));
}
function Bp(n = !0) {
  const e = ve((r) => r.tick), t = E(0);
  L(() => {
    if (!n) return;
    let r = 0, o = !0;
    const i = (s) => {
      if (!o) return;
      const a = t.current || s, u = s - a;
      t.current = s, e(u), r = requestAnimationFrame(i);
    };
    return r = requestAnimationFrame(i), () => {
      o = !1, cancelAnimationFrame(r);
    };
  }, [n, e]);
}
function zp(n) {
  const e = ve((t) => t.addListener);
  L(() => e((t) => {
    t.kind === "newDay" && n(t.time);
  }), [e, n]);
}
function Dp(n) {
  const e = ve((t) => t.addListener);
  L(() => e((t) => {
    t.kind === "newHour" && n(t.time);
  }), [e, n]);
}
const Qa = {
  spring: "#ffb6c1",
  summer: "#9bd97a",
  autumn: "#e0a060",
  winter: "#cfe2ff"
}, el = {
  sun: "일",
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토"
};
function Fp() {
  const n = Ja(), e = String(n.hour).padStart(2, "0"), t = String(n.minute).padStart(2, "0");
  return /* @__PURE__ */ l(
    "div",
    {
      style: {
        position: "fixed",
        top: 10,
        left: 10,
        zIndex: 90,
        padding: "6px 10px",
        background: "rgba(0,0,0,0.55)",
        color: "#fff",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13,
        borderRadius: 6,
        userSelect: "none",
        pointerEvents: "none",
        backdropFilter: "blur(4px)"
      },
      children: /* @__PURE__ */ b("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ l(
          "span",
          {
            style: {
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: Qa[n.season] ?? "#fff"
            }
          }
        ),
        /* @__PURE__ */ b("span", { children: [
          "Y",
          n.year,
          " M",
          String(n.month).padStart(2, "0"),
          " D",
          String(n.day).padStart(2, "0"),
          " ",
          "(",
          el[n.weekday],
          ")"
        ] }),
        /* @__PURE__ */ b("span", { style: { opacity: 0.85 }, children: [
          e,
          ":",
          t
        ] })
      ] })
    }
  );
}
const tl = "gaesup-save", nl = 1, mn = "slots";
function rl() {
  return new Promise((n, e) => {
    if (typeof indexedDB > "u") {
      e(new Error("IndexedDB unavailable"));
      return;
    }
    const t = indexedDB.open(tl, nl);
    t.onupgradeneeded = () => {
      const r = t.result;
      r.objectStoreNames.contains(mn) || r.createObjectStore(mn);
    }, t.onsuccess = () => n(t.result), t.onerror = () => e(t.error);
  });
}
function Qt(n, e) {
  return rl().then(
    (t) => new Promise((r, o) => {
      const s = t.transaction(mn, n).objectStore(mn), a = e(s);
      if (a instanceof Promise) {
        a.then(r, o);
        return;
      }
      a.onsuccess = () => r(a.result), a.onerror = () => o(a.error);
    })
  );
}
class ol {
  async read(e) {
    try {
      return await Qt("readonly", (r) => r.get(e)) ?? null;
    } catch {
      return null;
    }
  }
  async write(e, t) {
    await Qt("readwrite", (r) => r.put(t, e));
  }
  async list() {
    try {
      return (await Qt("readonly", (t) => t.getAllKeys())).map(String);
    } catch {
      return [];
    }
  }
  async remove(e) {
    try {
      await Qt("readwrite", (t) => t.delete(e));
    } catch {
    }
  }
}
const Tt = "gaesup:save:";
function en(n, e) {
  try {
    return n();
  } catch {
    return e;
  }
}
class il {
  async read(e) {
    return typeof localStorage > "u" ? null : en(() => {
      const t = localStorage.getItem(Tt + e);
      return t ? JSON.parse(t) : null;
    }, null);
  }
  async write(e, t) {
    typeof localStorage > "u" || en(() => localStorage.setItem(Tt + e, JSON.stringify(t)), void 0);
  }
  async list() {
    return typeof localStorage > "u" ? [] : en(() => {
      const e = [];
      for (let t = 0; t < localStorage.length; t++) {
        const r = localStorage.key(t);
        r && r.startsWith(Tt) && e.push(r.slice(Tt.length));
      }
      return e;
    }, []);
  }
  async remove(e) {
    typeof localStorage > "u" || en(() => localStorage.removeItem(Tt + e), void 0);
  }
}
class sl {
  adapter;
  bindings = /* @__PURE__ */ new Map();
  currentVersion;
  migrations;
  defaultSlot;
  constructor(e) {
    this.adapter = e.adapter, this.currentVersion = e.currentVersion ?? 1, this.migrations = e.migrations ?? {}, this.defaultSlot = e.defaultSlot ?? "main";
  }
  register(e) {
    const t = {
      key: e.key,
      serialize: () => e.serialize(),
      hydrate: (r) => e.hydrate(r)
    };
    return this.bindings.set(e.key, t), () => {
      this.bindings.delete(e.key);
    };
  }
  has(e) {
    return this.bindings.has(e);
  }
  /**
   * Returns an iterator over registered domain bindings. Used by helpers
   * such as the visit-room snapshot serializer that need to read the
   * same set of (de)serializers as the autosave layer.
   */
  getBindings() {
    return this.bindings.values();
  }
  async save(e = this.defaultSlot) {
    const t = {};
    for (const [o, i] of this.bindings)
      try {
        t[o] = i.serialize();
      } catch {
        t[o] = null;
      }
    const r = {
      version: this.currentVersion,
      savedAt: Date.now(),
      domains: t
    };
    await this.adapter.write(e, r);
  }
  async load(e = this.defaultSlot) {
    const t = await this.adapter.read(e);
    if (!t) return !1;
    let r = t;
    for (; r.version < this.currentVersion; ) {
      const o = this.migrations[r.version];
      if (!o) break;
      r = o(r);
    }
    for (const [o, i] of this.bindings)
      try {
        i.hydrate(r.domains?.[o]);
      } catch {
      }
    return !0;
  }
  async list() {
    return this.adapter.list();
  }
  async remove(e = this.defaultSlot) {
    return this.adapter.remove(e);
  }
}
let Un = null;
function al() {
  const n = typeof indexedDB < "u" ? new ol() : new il();
  return new sl({ adapter: n, defaultSlot: "main", currentVersion: 1 });
}
function li() {
  return Un || (Un = al()), Un;
}
function Lp({
  intervalMs: n = 5 * 60 * 1e3,
  slot: e,
  saveOnUnload: t = !0,
  saveOnVisibilityChange: r = !0
} = {}) {
  L(() => {
    const o = li();
    let i = !1;
    const s = () => {
      i || o.save(e);
    }, a = window.setInterval(s, Math.max(1e3, n)), u = () => {
      o.save(e);
    }, c = () => {
      document.visibilityState === "hidden" && o.save(e);
    };
    return t && window.addEventListener("beforeunload", u), r && document.addEventListener("visibilitychange", c), () => {
      i = !0, window.clearInterval(a), t && window.removeEventListener("beforeunload", u), r && document.removeEventListener("visibilitychange", c);
    };
  }, [n, e, t, r]);
}
function Gp(n, e) {
  L(() => {
    const t = li();
    let r = !1;
    return t.load(n).then((o) => {
      !r && e && e(o);
    }), () => {
      r = !0;
    };
  }, [n, e]);
}
const ll = [
  {
    id: "apple",
    name: "사과",
    icon: "apple",
    category: "food",
    stackable: !0,
    maxStack: 99,
    buyPrice: 100,
    sellPrice: 50,
    color: "#e54b4b",
    rarity: "common",
    description: "아삭한 사과. 그냥 먹어도, 팔아도 좋다."
  },
  {
    id: "wood",
    name: "목재",
    icon: "wood",
    category: "material",
    stackable: !0,
    maxStack: 99,
    sellPrice: 30,
    color: "#a07a4a",
    rarity: "common",
    description: "나무를 베면 얻을 수 있는 기본 재료."
  },
  {
    id: "stone",
    name: "돌",
    icon: "stone",
    category: "material",
    stackable: !0,
    maxStack: 99,
    sellPrice: 25,
    color: "#7a7a7a",
    rarity: "common"
  },
  {
    id: "flower-pink",
    name: "분홍 꽃",
    icon: "flower",
    category: "material",
    stackable: !0,
    maxStack: 99,
    sellPrice: 40,
    color: "#ff8fb1"
  },
  {
    id: "axe",
    name: "도끼",
    icon: "axe",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 800,
    color: "#9b6b3a",
    toolKind: "axe",
    durability: 60,
    description: "나무를 벨 수 있다."
  },
  {
    id: "shovel",
    name: "삽",
    icon: "shovel",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 600,
    color: "#777777",
    toolKind: "shovel",
    durability: 80,
    description: "땅을 팔 수 있다."
  },
  {
    id: "water-can",
    name: "물뿌리개",
    icon: "water-can",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 500,
    color: "#4aa8ff",
    toolKind: "water",
    durability: 100,
    description: "꽃에 물을 줄 수 있다."
  },
  {
    id: "net",
    name: "곤충채집망",
    icon: "net",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 700,
    color: "#d8d8d8",
    toolKind: "net",
    durability: 50
  },
  {
    id: "rod",
    name: "낚싯대",
    icon: "rod",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 900,
    color: "#5a3a2a",
    toolKind: "rod",
    durability: 50
  },
  {
    id: "shell",
    name: "조개",
    icon: "shell",
    category: "material",
    stackable: !0,
    maxStack: 99,
    sellPrice: 60,
    color: "#ffd9c2"
  },
  {
    id: "fish-bass",
    name: "배스",
    icon: "fish",
    category: "fish",
    stackable: !0,
    maxStack: 99,
    sellPrice: 200,
    color: "#5a8a8a",
    rarity: "common"
  },
  {
    id: "fish-tuna",
    name: "참다랑어",
    icon: "fish",
    category: "fish",
    stackable: !0,
    maxStack: 99,
    sellPrice: 700,
    color: "#3a5a8a",
    rarity: "rare"
  },
  {
    id: "fish-koi",
    name: "비단잉어",
    icon: "fish",
    category: "fish",
    stackable: !0,
    maxStack: 99,
    sellPrice: 1200,
    color: "#ff8a4a",
    rarity: "epic"
  },
  {
    id: "bug-butterfly",
    name: "나비",
    icon: "bug",
    category: "bug",
    stackable: !0,
    maxStack: 99,
    sellPrice: 160,
    color: "#ffd0e0",
    rarity: "common"
  },
  {
    id: "bug-beetle",
    name: "풍뎅이",
    icon: "bug",
    category: "bug",
    stackable: !0,
    maxStack: 99,
    sellPrice: 400,
    color: "#3a3a8a",
    rarity: "uncommon"
  },
  {
    id: "bug-stag",
    name: "사슴벌레",
    icon: "bug",
    category: "bug",
    stackable: !0,
    maxStack: 99,
    sellPrice: 900,
    color: "#5a2a1a",
    rarity: "rare"
  },
  {
    id: "seed-turnip",
    name: "순무 씨앗",
    icon: "seed",
    category: "material",
    stackable: !0,
    maxStack: 99,
    buyPrice: 80,
    sellPrice: 20,
    color: "#cfeeb6",
    toolKind: "seed"
  },
  {
    id: "seed-tomato",
    name: "토마토 씨앗",
    icon: "seed",
    category: "material",
    stackable: !0,
    maxStack: 99,
    buyPrice: 120,
    sellPrice: 30,
    color: "#9adf90",
    toolKind: "seed"
  },
  {
    id: "turnip",
    name: "순무",
    icon: "turnip",
    category: "food",
    stackable: !0,
    maxStack: 99,
    sellPrice: 220,
    color: "#ffeeaa",
    rarity: "common"
  },
  {
    id: "tomato",
    name: "토마토",
    icon: "tomato",
    category: "food",
    stackable: !0,
    maxStack: 99,
    sellPrice: 360,
    color: "#e54b4b",
    rarity: "uncommon"
  }
];
function Op() {
  Me().registerAll(ll);
}
function Up() {
  return ce((n) => ({
    slots: n.slots,
    add: n.add,
    remove: n.remove,
    removeById: n.removeById,
    move: n.move,
    countOf: n.countOf,
    has: n.has
  }));
}
function Wp() {
  return ce((n) => {
    const e = n.hotbar[n.equippedHotbar];
    return e == null ? null : n.slots[e] ?? null;
  });
}
function cl() {
  const n = ce((o) => o.hotbar), e = ce((o) => o.slots), t = ce((o) => o.equippedHotbar), r = ce((o) => o.setEquippedHotbar);
  return {
    hotbar: n,
    slots: n.map((o) => e[o] ?? null),
    equipped: t,
    setEquipped: r
  };
}
function Hp(n = !0) {
  const e = ce((o) => o.setEquippedHotbar), t = ce((o) => o.equippedHotbar), r = ce((o) => o.hotbar);
  L(() => {
    if (!n) return;
    const o = (i) => {
      const s = i.target?.tagName?.toLowerCase();
      if (s === "input" || s === "textarea") return;
      const a = Number(i.key);
      if (Number.isInteger(a) && a >= 1 && a <= r.length) {
        e(a - 1);
        return;
      }
      (i.key === "q" || i.key === "Q") && e(t - 1), (i.key === "e" || i.key === "E") && e(t + 1);
    };
    return window.addEventListener("keydown", o), () => window.removeEventListener("keydown", o);
  }, [n, e, t, r.length]);
}
function jp() {
  const { slots: n, equipped: e, setEquipped: t } = cl(), r = Me();
  return /* @__PURE__ */ l(
    "div",
    {
      style: {
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 95,
        display: "flex",
        gap: 6,
        padding: 8,
        background: "rgba(18,20,28,0.55)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        boxShadow: "0 8px 28px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)"
      },
      children: n.map((o, i) => {
        const s = o ? r.get(o.itemId) : void 0, a = i === e;
        return /* @__PURE__ */ b(
          "button",
          {
            onClick: () => t(i),
            title: s?.name ?? "",
            style: {
              width: 54,
              height: 54,
              borderRadius: 10,
              border: a ? "1.5px solid #ffd84a" : "1px solid rgba(255,255,255,0.14)",
              background: a ? "rgba(255,216,74,0.10)" : "rgba(255,255,255,0.04)",
              color: "#f3f4f8",
              position: "relative",
              cursor: "pointer",
              padding: 0,
              fontFamily: "'Pretendard', system-ui, sans-serif",
              fontSize: 11,
              boxShadow: a ? "0 0 16px rgba(255,216,74,0.45)" : "none",
              transition: "background 0.18s ease, border-color 0.18s ease"
            },
            children: [
              /* @__PURE__ */ l(
                "div",
                {
                  style: {
                    position: "absolute",
                    top: 4,
                    left: 4,
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    opacity: 0.85
                  },
                  children: i + 1
                }
              ),
              o && s ? /* @__PURE__ */ b(Se, { children: [
                /* @__PURE__ */ l(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      inset: 14,
                      borderRadius: 6,
                      background: s.color ?? "#888",
                      boxShadow: "inset 0 0 8px rgba(0,0,0,0.4)"
                    }
                  }
                ),
                s.stackable && o.count > 1 && /* @__PURE__ */ l(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      bottom: 2,
                      right: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      textShadow: "0 0 3px black"
                    },
                    children: o.count
                  }
                )
              ] }) : null
            ]
          },
          i
        );
      })
    }
  );
}
function $p({ toggleKey: n = "i", initiallyOpen: e = !1 }) {
  const [t, r] = Z(e), o = ce((c) => c.slots), i = ce((c) => c.move), s = Me(), [a, u] = Z(null);
  return L(() => {
    const c = (f) => {
      const d = f.target?.tagName?.toLowerCase();
      d === "input" || d === "textarea" || f.key.toLowerCase() === n.toLowerCase() && r((p) => !p);
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [n]), t ? /* @__PURE__ */ l(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)"
      },
      onClick: () => r(!1),
      children: /* @__PURE__ */ b(
        "div",
        {
          onClick: (c) => c.stopPropagation(),
          style: {
            background: "rgba(20,20,20,0.95)",
            borderRadius: 12,
            padding: 16,
            minWidth: 460,
            color: "#fff",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            boxShadow: "0 12px 32px rgba(0,0,0,0.6)"
          },
          children: [
            /* @__PURE__ */ b("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
              /* @__PURE__ */ l("div", { style: { fontSize: 14, opacity: 0.9 }, children: "Inventory" }),
              /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => r(!1),
                  style: {
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14
                  },
                  children: "×"
                }
              )
            ] }),
            /* @__PURE__ */ l(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 64px)",
                  gap: 6
                },
                children: o.map((c, f) => {
                  const d = c ? s.get(c.itemId) : void 0;
                  return /* @__PURE__ */ l(
                    "div",
                    {
                      draggable: !!c,
                      onDragStart: () => u(f),
                      onDragOver: (p) => {
                        p.preventDefault();
                      },
                      onDrop: () => {
                        a !== null && a !== f && i(a, f), u(null);
                      },
                      title: d?.name ?? "",
                      style: {
                        width: 64,
                        height: 64,
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(0,0,0,0.5)",
                        position: "relative",
                        cursor: c ? "grab" : "default",
                        fontSize: 11
                      },
                      children: c && d ? /* @__PURE__ */ b(Se, { children: [
                        /* @__PURE__ */ l(
                          "div",
                          {
                            style: {
                              position: "absolute",
                              inset: 8,
                              borderRadius: 6,
                              background: d.color ?? "#888",
                              boxShadow: "inset 0 0 8px rgba(0,0,0,0.4)"
                            }
                          }
                        ),
                        d.stackable && c.count > 1 && /* @__PURE__ */ l(
                          "div",
                          {
                            style: {
                              position: "absolute",
                              bottom: 2,
                              right: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              textShadow: "0 0 3px black"
                            },
                            children: c.count
                          }
                        )
                      ] }) : null
                    },
                    f
                  );
                })
              }
            ),
            /* @__PURE__ */ l("div", { style: { marginTop: 12, opacity: 0.6, fontSize: 11 }, children: `[${n.toUpperCase()}] 닫기 / 드래그로 이동` })
          ]
        }
      )
    }
  ) : null;
}
const po = 1e3, Le = we((n, e) => ({
  bells: po,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  add: (t) => {
    if (t <= 0) return;
    const r = e();
    n({ bells: r.bells + t, lifetimeEarned: r.lifetimeEarned + t });
  },
  spend: (t) => {
    if (t <= 0) return !0;
    const r = e();
    return r.bells < t ? !1 : (n({ bells: r.bells - t, lifetimeSpent: r.lifetimeSpent + t }), !0);
  },
  set: (t) => n({ bells: Math.max(0, t) }),
  serialize: () => {
    const t = e();
    return {
      version: 1,
      bells: t.bells,
      lifetimeEarned: t.lifetimeEarned,
      lifetimeSpent: t.lifetimeSpent
    };
  },
  hydrate: (t) => {
    t && n({
      bells: typeof t.bells == "number" ? Math.max(0, t.bells) : po,
      lifetimeEarned: typeof t.lifetimeEarned == "number" ? t.lifetimeEarned : 0,
      lifetimeSpent: typeof t.lifetimeSpent == "number" ? t.lifetimeSpent : 0
    });
  }
})), ul = ["axe", "shovel", "water-can", "net", "rod", "apple"];
function dl(n, e, t) {
  const r = n.slice();
  for (let o = r.length - 1; o > 0; o--) {
    const i = Math.floor(t() * (o + 1));
    [r[o], r[i]] = [r[i], r[o]];
  }
  return r.slice(0, Math.min(e, r.length));
}
function fl(n) {
  let e = n | 0 || 1;
  return () => (e = e * 1664525 + 1013904223 | 0, (e >>> 0) / 4294967295);
}
const tn = we((n, e) => ({
  catalog: ul,
  dailyStock: [],
  lastRolledDay: -1,
  setCatalog: (t) => n({ catalog: t.slice() }),
  rollDailyStock: (t, r = 4) => {
    const o = e();
    if (o.lastRolledDay === t && o.dailyStock.length > 0) return;
    const i = fl(t * 9301 + 49297), a = dl(o.catalog, r, i).map((u) => {
      const c = Me().get(u), f = c?.stackable ? 5 + Math.floor(i() * 6) : 1;
      return { itemId: u, price: c?.buyPrice ?? 100, stock: f };
    });
    n({ dailyStock: a, lastRolledDay: t });
  },
  buy: (t, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    const o = e(), i = o.dailyStock.findIndex((p) => p.itemId === t);
    if (i < 0) return { ok: !1, reason: "not in stock" };
    const s = o.dailyStock[i], a = s.stock ?? 0;
    if (a < r) return { ok: !1, reason: "insufficient stock" };
    const u = (s.price ?? e().priceOf(t)) * r, c = Le.getState();
    if (c.bells < u) return { ok: !1, reason: "insufficient bells" };
    if (!c.spend(u)) return { ok: !1, reason: "spend failed" };
    if (ce.getState().add(t, r) > 0)
      return c.add(u), { ok: !1, reason: "inventory full" };
    const d = o.dailyStock.slice();
    return d[i] = { ...s, stock: a - r }, n({ dailyStock: d }), { ok: !0 };
  },
  sell: (t, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    if (ce.getState().countOf(t) < r) return { ok: !1, reason: "not enough items" };
    const i = ce.getState().removeById(t, r);
    if (i < r) return { ok: !1, reason: "remove failed" };
    const s = e().sellPriceOf(t) * i;
    return s > 0 && Le.getState().add(s), { ok: !0 };
  },
  priceOf: (t) => {
    const o = e().dailyStock.find((i) => i.itemId === t);
    return o?.price != null ? o.price : Me().get(t)?.buyPrice ?? 0;
  },
  sellPriceOf: (t) => Me().get(t)?.sellPrice ?? 0,
  serialize: () => {
    const t = e();
    return {
      version: 1,
      lastRolledDay: t.lastRolledDay,
      dailyStock: t.dailyStock.map((r) => ({ ...r }))
    };
  },
  hydrate: (t) => {
    t && n({
      lastRolledDay: typeof t.lastRolledDay == "number" ? t.lastRolledDay : -1,
      dailyStock: Array.isArray(t.dailyStock) ? t.dailyStock.map((r) => ({ ...r })) : []
    });
  }
}));
function Vp({ position: n = "top-center" }) {
  const e = Le((r) => r.bells);
  return /* @__PURE__ */ b(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 90,
        padding: "6px 12px",
        background: "rgba(40,30,10,0.85)",
        color: "#ffd84a",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "inset 0 0 0 1px rgba(255,216,74,0.4)",
        pointerEvents: "none",
        userSelect: "none",
        ...n === "bottom-right" ? { bottom: 96, right: 12 } : { top: 10, left: "50%", transform: "translateX(-50%)" }
      },
      children: [
        /* @__PURE__ */ l("span", { style: {
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#ffd84a",
          color: "#3a2a08",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 11
        }, children: "B" }),
        /* @__PURE__ */ l("span", { style: { fontWeight: 700 }, children: e.toLocaleString() })
      ]
    }
  );
}
function qp({ open: n, onClose: e, title: t = "Shop" }) {
  const [r, o] = Z("buy"), i = tn((p) => p.dailyStock), s = tn((p) => p.buy), a = tn((p) => p.sell), u = tn((p) => p.sellPriceOf), c = Le((p) => p.bells), f = ce((p) => p.slots);
  if (!n) return null;
  const d = (() => {
    const p = /* @__PURE__ */ new Map();
    for (const h of f)
      h && p.set(h.itemId, (p.get(h.itemId) ?? 0) + h.count);
    return Array.from(p.entries()).filter(([h]) => u(h) > 0);
  })();
  return /* @__PURE__ */ l(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 130,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)"
      },
      onClick: e,
      children: /* @__PURE__ */ b(
        "div",
        {
          onClick: (p) => p.stopPropagation(),
          style: {
            width: 520,
            maxHeight: "70vh",
            overflow: "hidden",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,216,74,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13,
            display: "flex",
            flexDirection: "column"
          },
          children: [
            /* @__PURE__ */ b("div", { style: { padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ l("strong", { style: { fontSize: 15 }, children: t }),
              /* @__PURE__ */ b("span", { style: { color: "#ffd84a" }, children: [
                c.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ l("button", { onClick: e, style: ci(), children: "닫기" })
            ] }),
            /* @__PURE__ */ b("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ l(mo, { active: r === "buy", onClick: () => o("buy"), children: "구매" }),
              /* @__PURE__ */ l(mo, { active: r === "sell", onClick: () => o("sell"), children: "판매" })
            ] }),
            /* @__PURE__ */ b("div", { style: { overflowY: "auto", padding: 10 }, children: [
              r === "buy" && (i.length === 0 ? /* @__PURE__ */ l("div", { style: { opacity: 0.7, padding: 12 }, children: "오늘 상품이 없습니다." }) : i.map((p) => {
                const h = Me().get(p.itemId), x = p.price ?? h?.buyPrice ?? 0, y = p.stock ?? 0;
                return /* @__PURE__ */ l(
                  ho,
                  {
                    ...h?.color ? { color: h.color } : {},
                    name: h?.name ?? p.itemId,
                    sub: `재고 ${y}`,
                    price: x,
                    disabled: y <= 0 || c < x,
                    actionLabel: "구매",
                    onAction: () => {
                      const g = s(p.itemId, 1);
                      g.ok ? fe("success", `${h?.name ?? p.itemId} 구매`) : fe("warn", `구매 실패: ${g.reason ?? ""}`);
                    }
                  },
                  p.itemId
                );
              })),
              r === "sell" && (d.length === 0 ? /* @__PURE__ */ l("div", { style: { opacity: 0.7, padding: 12 }, children: "판매할 아이템이 없습니다." }) : d.map(([p, h]) => {
                const x = Me().get(p), y = u(p);
                return /* @__PURE__ */ l(
                  ho,
                  {
                    ...x?.color ? { color: x.color } : {},
                    name: x?.name ?? p,
                    sub: `보유 ${h}`,
                    price: y,
                    actionLabel: "판매",
                    onAction: () => {
                      const g = a(p, 1);
                      g.ok ? fe("reward", `${x?.name ?? p} 판매 +${y} B`) : fe("warn", `판매 실패: ${g.reason ?? ""}`);
                    }
                  },
                  p
                );
              }))
            ] })
          ]
        }
      )
    }
  );
}
function mo({ active: n, onClick: e, children: t }) {
  return /* @__PURE__ */ l(
    "button",
    {
      onClick: e,
      style: {
        flex: 1,
        padding: "8px 10px",
        background: n ? "#262626" : "transparent",
        color: n ? "#ffd84a" : "#ddd",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13
      },
      children: t
    }
  );
}
function ho({
  color: n,
  name: e,
  sub: t,
  price: r,
  actionLabel: o,
  onAction: i,
  disabled: s
}) {
  return /* @__PURE__ */ b("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 6px",
    borderBottom: "1px solid #2a2a2a"
  }, children: [
    /* @__PURE__ */ l("span", { style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      background: n ?? "#888"
    } }),
    /* @__PURE__ */ b("div", { style: { flex: 1 }, children: [
      /* @__PURE__ */ l("div", { children: e }),
      t && /* @__PURE__ */ l("div", { style: { fontSize: 11, opacity: 0.7 }, children: t })
    ] }),
    /* @__PURE__ */ b("div", { style: { color: "#ffd84a", minWidth: 64, textAlign: "right" }, children: [
      r.toLocaleString(),
      " B"
    ] }),
    /* @__PURE__ */ l("button", { onClick: i, disabled: s, style: ci(s), children: o })
  ] });
}
function ci(n) {
  return {
    padding: "6px 10px",
    background: n ? "#333" : "#444",
    color: n ? "#777" : "#fff",
    border: "none",
    borderRadius: 6,
    cursor: n ? "not-allowed" : "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12
  };
}
const pl = [
  { level: "stranger", min: 0 },
  { level: "acquaintance", min: 50 },
  { level: "friend", min: 150 },
  { level: "close", min: 350 },
  { level: "best", min: 700 }
], ml = 25;
function go(n) {
  return { npcId: n, score: 0, todayGained: 0, lastGiftDay: -1, giftHistory: {} };
}
function hl(n) {
  let e = "stranger";
  for (const t of pl)
    n >= t.min && (e = t.level);
  return e;
}
function gl(n) {
  const e = Me().get(n);
  return e ? e.rarity === "legendary" ? 25 : e.rarity === "epic" ? 18 : e.rarity === "rare" ? 12 : e.rarity === "uncommon" ? 8 : e.category === "food" ? 6 : e.category === "fish" || e.category === "bug" ? 7 : e.category === "furniture" ? 10 : 4 : 1;
}
const Ir = we((n, e) => ({
  entries: {},
  ensure: (t) => {
    const r = e().entries[t];
    if (r) return r;
    const o = go(t);
    return n({ entries: { ...e().entries, [t]: o } }), o;
  },
  add: (t, r, o) => {
    if (r === 0) return 0;
    let s = e().entries[t] ?? go(t);
    s.lastGiftDay !== o && (s = { ...s, todayGained: 0, lastGiftDay: o });
    let a = r;
    if (a > 0) {
      const c = Math.max(0, ml - s.todayGained);
      a = Math.min(a, c);
    }
    if (a === 0) return 0;
    const u = {
      ...s,
      score: Math.max(0, s.score + a),
      todayGained: s.todayGained + Math.max(0, a)
    };
    return n({ entries: { ...e().entries, [t]: u } }), a;
  },
  giveGift: (t, r, o) => {
    const i = gl(r), s = e().add(t, i, o), a = e().entries[t], u = { ...a.giftHistory, [r]: (a.giftHistory[r] ?? 0) + 1 };
    return n({ entries: { ...e().entries, [t]: { ...a, giftHistory: u } } }), { gained: s, capped: s < i };
  },
  resetDaily: (t) => {
    if (t) {
      const o = e().entries[t];
      if (!o) return;
      n({ entries: { ...e().entries, [t]: { ...o, todayGained: 0 } } });
      return;
    }
    const r = {};
    for (const [o, i] of Object.entries(e().entries)) r[o] = { ...i, todayGained: 0 };
    n({ entries: r });
  },
  scoreOf: (t) => e().entries[t]?.score ?? 0,
  levelOf: (t) => hl(e().scoreOf(t)),
  serialize: () => ({
    version: 1,
    entries: Object.fromEntries(Object.entries(e().entries).map(([t, r]) => [t, { ...r, giftHistory: { ...r.giftHistory } }]))
  }),
  hydrate: (t) => {
    if (!t || typeof t != "object") return;
    const r = {};
    if (t.entries && typeof t.entries == "object")
      for (const [o, i] of Object.entries(t.entries))
        !i || typeof i != "object" || (r[o] = {
          npcId: o,
          score: typeof i.score == "number" ? i.score : 0,
          todayGained: typeof i.todayGained == "number" ? i.todayGained : 0,
          lastGiftDay: typeof i.lastGiftDay == "number" ? i.lastGiftDay : -1,
          giftHistory: i.giftHistory && typeof i.giftHistory == "object" ? { ...i.giftHistory } : {}
        });
    n({ entries: r });
  }
}));
class yl {
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
  require(e) {
    const t = this.defs.get(e);
    if (!t) throw new Error(`Unknown QuestId: ${e}`);
    return t;
  }
  all() {
    return Array.from(this.defs.values());
  }
  has(e) {
    return this.defs.has(e);
  }
  clear() {
    this.defs.clear();
  }
}
let Wn = null;
function He() {
  return Wn || (Wn = new yl()), Wn;
}
function bl(n) {
  return n.type === "collect" || n.type === "deliver" ? n.count : 1;
}
function vl(n) {
  if (n.type === "item")
    ce.getState().add(n.itemId, n.count ?? 1) > 0 && fe("warn", "인벤토리가 부족합니다");
  else if (n.type === "bells")
    Le.getState().add(n.amount), fe("reward", `+${n.amount} B`);
  else if (n.type === "friendship") {
    const e = Math.floor(ve.getState().totalMinutes / 1440);
    Ir.getState().add(n.npcId, n.amount, e);
  }
}
function xl(n, e = "active") {
  const t = {};
  for (const r of n.objectives) t[r.id] = 0;
  return { questId: n.id, status: e, progress: t, startedAt: Date.now() };
}
const qe = we((n, e) => ({
  state: {},
  start: (t) => {
    const r = He().get(t);
    if (!r) return !1;
    const o = e().state[t];
    if (o && o.status === "active" || o && o.status === "completed" && !r.repeatable) return !1;
    if (r.prerequisiteQuests) {
      for (const s of r.prerequisiteQuests)
        if (e().state[s]?.status !== "completed") return !1;
    }
    const i = xl(r, "active");
    return n({ state: { ...e().state, [t]: i } }), fe("info", `퀘스트 시작: ${r.name}`), !0;
  },
  abandon: (t) => {
    const r = e().state[t];
    !r || r.status !== "active" || n({ state: { ...e().state, [t]: { ...r, status: "failed" } } });
  },
  complete: (t) => {
    const r = He().get(t);
    if (!r) return !1;
    const o = e().state[t];
    if (!o || o.status !== "active" || !e().isAllObjectivesComplete(t)) return !1;
    for (const i of r.objectives)
      i.type === "deliver" && ce.getState().removeById(i.itemId, i.count);
    for (const i of r.rewards) vl(i);
    return n({ state: { ...e().state, [t]: { ...o, status: "completed", completedAt: Date.now() } } }), fe("success", `퀘스트 완료: ${r.name}`), !0;
  },
  notifyTalk: (t) => {
    const r = { ...e().state };
    let o = !1;
    for (const [i, s] of Object.entries(r)) {
      if (s.status !== "active") continue;
      const a = He().get(i);
      if (a)
        for (const u of a.objectives)
          u.type === "talk" && u.npcId === t && (s.progress[u.id] ?? 0) < 1 && (r[i] = { ...s, progress: { ...s.progress, [u.id]: 1 } }, o = !0);
    }
    o && n({ state: r });
  },
  notifyDeliver: (t, r, o = 1) => {
    let i = !1;
    const s = { ...e().state };
    for (const [a, u] of Object.entries(s)) {
      if (u.status !== "active") continue;
      const c = He().get(a);
      if (c) {
        for (const f of c.objectives)
          if (f.type === "deliver" && f.npcId === t && f.itemId === r) {
            const d = ce.getState().countOf(r);
            if (d <= 0) continue;
            const p = Math.min(d, f.count - (u.progress[f.id] ?? 0), o);
            if (p <= 0) continue;
            const h = ce.getState().removeById(r, p);
            s[a] = {
              ...u,
              progress: { ...u.progress, [f.id]: (u.progress[f.id] ?? 0) + h }
            }, i = !0;
          }
      }
    }
    return i && n({ state: s }), i;
  },
  notifyVisit: (t) => {
    const r = { ...e().state };
    let o = !1;
    for (const [i, s] of Object.entries(r)) {
      if (s.status !== "active") continue;
      const a = He().get(i);
      if (a)
        for (const u of a.objectives)
          u.type === "visit" && u.tag === t && (s.progress[u.id] ?? 0) < 1 && (r[i] = { ...s, progress: { ...s.progress, [u.id]: 1 } }, o = !0);
    }
    o && n({ state: r });
  },
  notifyFlag: (t, r) => {
    const o = { ...e().state };
    let i = !1;
    for (const [s, a] of Object.entries(o)) {
      if (a.status !== "active") continue;
      const u = He().get(s);
      if (u)
        for (const c of u.objectives)
          c.type === "flag" && c.key === t && c.value === r && (a.progress[c.id] ?? 0) < 1 && (o[s] = { ...a, progress: { ...a.progress, [c.id]: 1 } }, i = !0);
    }
    i && n({ state: o });
  },
  recheck: (t) => {
    const r = He().get(t), o = e().state[t];
    if (!r || !o || o.status !== "active") return;
    const i = { ...o };
    for (const s of r.objectives)
      s.type === "collect" && (i.progress = { ...i.progress, [s.id]: Math.min(s.count, ce.getState().countOf(s.itemId)) });
    n({ state: { ...e().state, [t]: i } });
  },
  statusOf: (t) => e().state[t]?.status ?? "available",
  progressOf: (t) => e().state[t] ?? null,
  active: () => Object.values(e().state).filter((t) => t.status === "active"),
  completed: () => Object.values(e().state).filter((t) => t.status === "completed"),
  isObjectiveComplete: (t, r, o) => {
    const i = r.progress[o.id] ?? 0;
    return o.type === "collect" ? ce.getState().countOf(o.itemId) >= o.count : i >= bl(o);
  },
  isAllObjectivesComplete: (t) => {
    const r = He().get(t), o = e().state[t];
    return !r || !o ? !1 : r.objectives.every((i) => e().isObjectiveComplete(r, o, i));
  },
  serialize: () => ({
    version: 1,
    state: Object.fromEntries(Object.entries(e().state).map(([t, r]) => [t, { ...r, progress: { ...r.progress } }]))
  }),
  hydrate: (t) => {
    if (!t || typeof t != "object") return;
    const r = {};
    if (t.state && typeof t.state == "object")
      for (const [o, i] of Object.entries(t.state))
        !i || typeof i != "object" || (r[o] = {
          questId: o,
          status: i.status ?? "available",
          progress: i.progress && typeof i.progress == "object" ? { ...i.progress } : {},
          ...typeof i.startedAt == "number" ? { startedAt: i.startedAt } : {},
          ...typeof i.completedAt == "number" ? { completedAt: i.completedAt } : {}
        });
    n({ state: r });
  }
}));
class wl {
  tree;
  context;
  currentId;
  onCustomEffect;
  onOpenShop;
  constructor(e) {
    this.tree = e.tree, this.context = e.context ?? {}, this.currentId = e.tree.startId, this.onCustomEffect = e.onCustomEffect, this.onOpenShop = e.onOpenShop;
  }
  get current() {
    return this.currentId ? this.tree.nodes[this.currentId] ?? null : null;
  }
  isFinished() {
    return this.currentId == null;
  }
  visibleChoices() {
    const e = this.current;
    return e?.choices ? e.choices.filter((t) => !t.condition || this.checkCondition(t.condition)) : [];
  }
  advance() {
    const e = this.current;
    if (!e) return null;
    if (e.effects) for (const t of e.effects) this.applyEffect(t);
    return e.choices && e.choices.length > 0 ? e : (this.currentId = e.next ?? null, this.current);
  }
  choose(e) {
    const t = this.current;
    if (!t?.choices) return t;
    const o = this.visibleChoices()[e];
    if (!o) return t;
    if (o.effects) for (const i of o.effects) this.applyEffect(i);
    return this.currentId = o.next ?? null, this.current;
  }
  checkCondition(e) {
    switch (e.type) {
      case "hasItem":
        return ce.getState().countOf(e.itemId) >= (e.count ?? 1);
      case "hasBells":
        return Le.getState().bells >= e.amount;
      case "flagEquals":
        return this.context.flags?.[e.key] === e.value;
      case "friendshipAtLeast":
        return Ir.getState().scoreOf(e.npcId) >= e.amount;
      default:
        return !0;
    }
  }
  applyEffect(e) {
    switch (e.type) {
      case "giveItem": {
        const t = Me().get(e.itemId);
        ce.getState().add(e.itemId, e.count ?? 1) > 0 ? fe("warn", "인벤토리가 가득 찼습니다") : fe("reward", `${t?.name ?? e.itemId} +${e.count ?? 1}`);
        return;
      }
      case "takeItem": {
        ce.getState().removeById(e.itemId, e.count ?? 1);
        return;
      }
      case "giveBells":
        Le.getState().add(e.amount), fe("reward", `+${e.amount} B`);
        return;
      case "takeBells":
        Le.getState().spend(e.amount);
        return;
      case "setFlag":
        this.context.flags || (this.context.flags = {}), this.context.flags[e.key] = e.value, qe.getState().notifyFlag(e.key, e.value);
        return;
      case "addFriendship": {
        const t = Math.floor(ve.getState().totalMinutes / 1440);
        Ir.getState().add(e.npcId, e.amount, t);
        return;
      }
      case "startQuest":
        qe.getState().start(e.questId);
        return;
      case "completeQuest":
        qe.getState().complete(e.questId);
        return;
      case "openShop":
        this.onOpenShop?.(e.shopId);
        return;
      case "custom":
        this.onCustomEffect?.(e);
        return;
      default:
        return;
    }
  }
}
class Sl {
  trees = /* @__PURE__ */ new Map();
  register(e) {
    this.trees.set(e.id, e);
  }
  registerAll(e) {
    for (const t of e) this.register(t);
  }
  get(e) {
    return this.trees.get(e);
  }
  require(e) {
    const t = this.trees.get(e);
    if (!t) throw new Error(`Unknown DialogTreeId: ${e}`);
    return t;
  }
  has(e) {
    return this.trees.has(e);
  }
  clear() {
    this.trees.clear();
  }
}
let Hn = null;
function Ml() {
  return Hn || (Hn = new Sl()), Hn;
}
const _t = we((n, e) => ({
  runner: null,
  node: null,
  npcId: void 0,
  start: (t, r) => {
    const o = Ml().get(t);
    if (!o) return !1;
    const i = new wl({
      tree: o,
      ...r?.context ? { context: r.context } : {},
      ...r?.onCustomEffect ? { onCustomEffect: r.onCustomEffect } : {},
      ...r?.onOpenShop ? { onOpenShop: r.onOpenShop } : {}
    });
    return n({ runner: i, node: i.current, npcId: r?.context?.npcId }), r?.context?.npcId && qe.getState().notifyTalk(r.context.npcId), !0;
  },
  advance: () => {
    const t = e().runner;
    if (!t) return;
    const r = t.advance();
    n({ node: r }), r || n({ runner: null, npcId: void 0 });
  },
  choose: (t) => {
    const r = e().runner;
    if (!r) return;
    const o = r.choose(t);
    n({ node: o }), o || n({ runner: null, npcId: void 0 });
  },
  close: () => n({ runner: null, node: null, npcId: void 0 })
}));
function Yp({ advanceKey: n = "e", closeKey: e = "Escape" }) {
  const t = _t((u) => u.node), r = _t((u) => u.runner), o = _t((u) => u.advance), i = _t((u) => u.choose), s = _t((u) => u.close), a = r?.visibleChoices() ?? [];
  return L(() => {
    if (!t) return;
    const u = (c) => {
      if (c.key === e) {
        s();
        return;
      }
      if (a.length === 0 && c.key.toLowerCase() === n.toLowerCase()) {
        o();
        return;
      }
      const f = parseInt(c.key, 10);
      !Number.isNaN(f) && f >= 1 && f <= a.length && i(f - 1);
    };
    return window.addEventListener("keydown", u), () => window.removeEventListener("keydown", u);
  }, [t, a.length, o, i, s, n, e]), t ? /* @__PURE__ */ b(
    "div",
    {
      style: {
        position: "fixed",
        left: "50%",
        bottom: 110,
        transform: "translateX(-50%)",
        width: "min(720px, 92vw)",
        zIndex: 120,
        background: "rgba(18,20,28,0.62)",
        color: "#f3f4f8",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 14,
        padding: 14
      },
      children: [
        t.speaker && /* @__PURE__ */ l("div", { style: {
          display: "inline-block",
          padding: "3px 8px",
          background: "#ffd84a",
          color: "#1a1a1a",
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 12,
          marginBottom: 6
        }, children: t.speaker }),
        /* @__PURE__ */ l("div", { style: { lineHeight: 1.55, whiteSpace: "pre-wrap" }, children: t.text }),
        a.length === 0 ? /* @__PURE__ */ b("div", { style: { marginTop: 10, fontSize: 12, opacity: 0.65, textAlign: "right" }, children: [
          "[",
          n.toUpperCase(),
          "] 다음"
        ] }) : /* @__PURE__ */ l("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }, children: a.map((u, c) => /* @__PURE__ */ b(
          "button",
          {
            onClick: () => i(c),
            style: {
              textAlign: "left",
              padding: "9px 12px",
              background: "rgba(255,255,255,0.06)",
              color: "#f3f4f8",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'Pretendard', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 500
            },
            children: [
              /* @__PURE__ */ b("span", { style: {
                display: "inline-block",
                width: 18,
                color: "#ffd84a",
                marginRight: 6
              }, children: [
                c + 1,
                "."
              ] }),
              u.text
            ]
          },
          c
        )) })
      ]
    }
  ) : null;
}
function Zp({
  useKey: n = "f",
  range: e = 2.4,
  cooldownMs: t = 350
} = {}) {
  const { position: r, rotation: o } = yt({ updateInterval: 16 }), i = E(0);
  return L(() => {
    const s = `Key${n.toUpperCase()}`, a = n.toLowerCase(), u = (c) => {
      const f = c.target?.tagName?.toLowerCase();
      if (f === "input" || f === "textarea" || c.code !== s && c.key.toLowerCase() !== a) return;
      const d = performance.now();
      if (d - i.current < t) return;
      const p = ce.getState().getEquipped();
      if (!p) return;
      const h = Me().get(p.itemId);
      if (!h?.toolKind) return;
      const x = h.toolKind, y = o?.y ?? 0, g = new v.Vector3(Math.sin(y), 0, Math.cos(y)).normalize();
      i.current = d, si().emit({
        kind: x,
        origin: [r.x, r.y, r.z],
        direction: [g.x, g.y, g.z],
        range: e,
        timestamp: d
      });
    };
    return window.addEventListener("keydown", u), () => window.removeEventListener("keydown", u);
  }, [n, t, e, r, o]), null;
}
function Xp({ toggleKey: n = "j" }) {
  const [e, t] = Z(!1), r = qe((c) => c.state), o = qe((c) => c.complete), i = qe((c) => c.isObjectiveComplete), s = qe((c) => c.isAllObjectivesComplete);
  if (L(() => {
    const c = (f) => {
      const d = f.target?.tagName?.toLowerCase();
      d === "input" || d === "textarea" || (f.key.toLowerCase() === n.toLowerCase() && t((p) => !p), f.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [n]), !e) return null;
  const a = Object.values(r).filter((c) => c.status === "active"), u = Object.values(r).filter((c) => c.status === "completed");
  return /* @__PURE__ */ l(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 130,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      onClick: () => t(!1),
      children: /* @__PURE__ */ b(
        "div",
        {
          onClick: (c) => c.stopPropagation(),
          style: {
            width: 560,
            maxHeight: "76vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(122,166,255,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13
          },
          children: [
            /* @__PURE__ */ b(
              "div",
              {
                style: {
                  padding: "10px 14px",
                  borderBottom: "1px solid #333",
                  display: "flex",
                  justifyContent: "space-between"
                },
                children: [
                  /* @__PURE__ */ l("strong", { style: { fontSize: 15 }, children: "Quest Log" }),
                  /* @__PURE__ */ b("button", { onClick: () => t(!1), style: ui(), children: [
                    "Close [",
                    n.toUpperCase(),
                    "]"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ b("div", { style: { overflowY: "auto", padding: 10 }, children: [
              /* @__PURE__ */ l(yo, { title: `Active (${a.length})`, children: a.length === 0 ? /* @__PURE__ */ l(Cl, { children: "No active quests." }) : a.map((c) => /* @__PURE__ */ l(
                bo,
                {
                  progress: c,
                  renderObjective: (f) => i(
                    He().require(c.questId),
                    c,
                    f
                  ),
                  ...s(c.questId) ? {
                    onComplete: () => {
                      o(c.questId);
                    }
                  } : {}
                },
                c.questId
              )) }),
              u.length > 0 && /* @__PURE__ */ l(yo, { title: `Completed (${u.length})`, children: u.map((c) => /* @__PURE__ */ l(bo, { progress: c, renderObjective: () => !0, muted: !0 }, c.questId)) })
            ] })
          ]
        }
      )
    }
  );
}
function yo({ title: n, children: e }) {
  return /* @__PURE__ */ b("div", { style: { marginBottom: 10 }, children: [
    /* @__PURE__ */ l("div", { style: { padding: "6px 6px 4px", color: "#7aa6ff", fontSize: 12 }, children: n }),
    e
  ] });
}
function Cl({ children: n }) {
  return /* @__PURE__ */ l("div", { style: { padding: "8px 10px", opacity: 0.6 }, children: n });
}
function bo({
  progress: n,
  renderObjective: e,
  onComplete: t,
  muted: r
}) {
  const o = He().get(n.questId);
  return o ? /* @__PURE__ */ b(
    "div",
    {
      style: {
        padding: 10,
        marginBottom: 6,
        background: "#222",
        borderRadius: 8,
        opacity: r ? 0.6 : 1
      },
      children: [
        /* @__PURE__ */ b(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4
            },
            children: [
              /* @__PURE__ */ l("strong", { children: o.name }),
              t && /* @__PURE__ */ l("button", { onClick: t, style: ui(!0), children: "Report Complete" })
            ]
          }
        ),
        /* @__PURE__ */ l("div", { style: { opacity: 0.75, marginBottom: 6 }, children: o.summary }),
        /* @__PURE__ */ l("ul", { style: { margin: 0, padding: "0 0 0 16px" }, children: o.objectives.map((i) => {
          const s = e(i), a = n.progress[i.id] ?? 0, u = i.type === "collect" || i.type === "deliver" ? i.count : 1, c = i.type === "collect" ? Math.min(ce.getState().countOf(i.itemId), u) : a, f = i.type === "collect" || i.type === "deliver" ? Me().get(i.itemId)?.name ?? i.itemId : "";
          return /* @__PURE__ */ b(
            "li",
            {
              style: { color: s ? "#7adf90" : "#ddd", listStyle: "square" },
              children: [
                i.description ?? kl(i, f),
                " ",
                u > 1 ? `(${c}/${u})` : ""
              ]
            },
            i.id
          );
        }) }),
        /* @__PURE__ */ b("div", { style: { marginTop: 6, fontSize: 11, color: "#ffd84a" }, children: [
          "Rewards: ",
          o.rewards.map((i) => Il(i)).join(", ")
        ] })
      ]
    }
  ) : null;
}
function kl(n, e) {
  switch (n.type) {
    case "collect":
      return `Collect ${e ?? n.itemId}`;
    case "deliver":
      return `Deliver ${e ?? n.itemId} to ${n.npcId}`;
    case "talk":
      return `Talk to ${n.npcId}`;
    case "visit":
      return `Visit ${n.tag}`;
    case "flag":
      return "Meet the required condition";
    default:
      return "";
  }
}
function Il(n) {
  switch (n.type) {
    case "item":
      return `${n.itemId} x${n.count ?? 1}`;
    case "bells":
      return `${n.amount} B`;
    case "friendship":
      return `Friendship +${n.amount}`;
    default:
      return "";
  }
}
function ui(n) {
  return {
    padding: "4px 10px",
    background: n ? "#7aa6ff" : "#444",
    color: n ? "#0d1424" : "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: n ? 700 : 400
  };
}
function Kp(n = !0) {
  L(() => n ? ce.subscribe((t, r) => {
    if (t.slots === r.slots) return;
    const o = qe.getState().active();
    for (const i of o) qe.getState().recheck(i.questId);
  }) : void 0, [n]);
}
let Al = 0;
function Tl() {
  return `mail_${Date.now().toString(36)}_${(++Al).toString(36)}`;
}
function _l(n) {
  return n.itemId !== void 0;
}
const nn = we((n, e) => ({
  messages: [],
  send: (t) => {
    const r = t.id ?? Tl(), o = {
      id: r,
      from: t.from,
      subject: t.subject,
      body: t.body,
      sentDay: t.sentDay,
      ...t.attachments ? { attachments: t.attachments } : {},
      read: !1,
      claimed: !t.attachments || t.attachments.length === 0
    };
    return n({ messages: [...e().messages, o] }), fe("mail", `새 우편: ${t.subject}`), r;
  },
  markRead: (t) => {
    n({ messages: e().messages.map((r) => r.id === t ? { ...r, read: !0 } : r) });
  },
  markAllRead: () => {
    n({ messages: e().messages.map((t) => ({ ...t, read: !0 })) });
  },
  claim: (t) => {
    const r = e().messages.find((i) => i.id === t);
    if (!r || r.claimed || !r.attachments) return !1;
    let o = !0;
    for (const i of r.attachments)
      if (_l(i)) {
        if (ce.getState().add(i.itemId, i.count ?? 1) > 0) {
          o = !1, fe("warn", "인벤토리 부족, 일부 우편물 미수령");
          break;
        }
      } else
        Le.getState().add(i.bells);
    return o && (n({ messages: e().messages.map((i) => i.id === t ? { ...i, claimed: !0, read: !0 } : i) }), fe("reward", "우편 첨부물 수령")), o;
  },
  delete: (t) => {
    n({ messages: e().messages.filter((r) => r.id !== t) });
  },
  unreadCount: () => e().messages.reduce((t, r) => t + (r.read ? 0 : 1), 0),
  hasUnclaimedAttachments: () => e().messages.some((t) => !t.claimed && (t.attachments?.length ?? 0) > 0),
  serialize: () => ({
    version: 1,
    messages: e().messages.map((t) => ({
      ...t,
      ...t.attachments ? { attachments: t.attachments.map((r) => ({ ...r })) } : {}
    }))
  }),
  hydrate: (t) => {
    !t || !Array.isArray(t.messages) || n({ messages: t.messages.map((r) => ({ ...r })) });
  }
}));
function Jp({ toggleKey: n = "m" }) {
  const [e, t] = Z(!1), [r, o] = Z(null), i = nn((d) => d.messages), s = nn((d) => d.markRead), a = nn((d) => d.claim), u = nn((d) => d.delete);
  if (L(() => {
    const d = (p) => {
      const h = p.target?.tagName?.toLowerCase();
      h === "input" || h === "textarea" || (p.key.toLowerCase() === n.toLowerCase() && t((x) => !x), p.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", d), () => window.removeEventListener("keydown", d);
  }, [n]), !e) return null;
  const c = i.slice().sort((d, p) => p.sentDay - d.sentDay), f = r ? c.find((d) => d.id === r) ?? null : null;
  return /* @__PURE__ */ l(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => t(!1),
      children: /* @__PURE__ */ b(
        "div",
        {
          onClick: (d) => d.stopPropagation(),
          style: {
            width: 720,
            height: 460,
            display: "flex",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(207,154,255,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13,
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ b("div", { style: { width: 260, borderRight: "1px solid #333", display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ b("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ l("strong", { children: "우편함" }),
                /* @__PURE__ */ l("span", { style: { fontSize: 12, opacity: 0.7 }, children: c.length })
              ] }),
              /* @__PURE__ */ l("div", { style: { flex: 1, overflowY: "auto" }, children: c.length === 0 ? /* @__PURE__ */ l(Rl, { children: "우편이 없습니다." }) : c.map((d) => /* @__PURE__ */ b(
                "div",
                {
                  onClick: () => {
                    o(d.id), d.read || s(d.id);
                  },
                  style: {
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: r === d.id ? "#262626" : "transparent",
                    borderBottom: "1px solid #2a2a2a",
                    opacity: d.read ? 0.7 : 1
                  },
                  children: [
                    /* @__PURE__ */ b("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      !d.read && /* @__PURE__ */ l("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "#cf9aff" } }),
                      /* @__PURE__ */ l("strong", { style: { fontSize: 13 }, children: d.subject })
                    ] }),
                    /* @__PURE__ */ b("div", { style: { fontSize: 11, opacity: 0.6 }, children: [
                      d.from,
                      " · day ",
                      d.sentDay
                    ] }),
                    d.attachments && d.attachments.length > 0 && !d.claimed && /* @__PURE__ */ l("div", { style: { fontSize: 11, color: "#ffd84a" }, children: "* 첨부물" })
                  ]
                },
                d.id
              )) })
            ] }),
            /* @__PURE__ */ b("div", { style: { flex: 1, display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ b("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ l("span", { children: f ? f.subject : "메시지를 선택하세요" }),
                /* @__PURE__ */ b("button", { onClick: () => t(!1), style: Ar(), children: [
                  "닫기 [",
                  n.toUpperCase(),
                  "]"
                ] })
              ] }),
              /* @__PURE__ */ l("div", { style: { flex: 1, padding: 12, overflowY: "auto" }, children: f ? /* @__PURE__ */ l(Pl, { msg: f, onClaim: () => a(f.id), onDelete: () => {
                u(f.id), o(null);
              } }) : /* @__PURE__ */ l("div", { style: { opacity: 0.6 }, children: "왼쪽에서 메시지를 선택하세요." }) })
            ] })
          ]
        }
      )
    }
  );
}
function Pl({ msg: n, onClaim: e, onDelete: t }) {
  return /* @__PURE__ */ b("div", { children: [
    /* @__PURE__ */ b("div", { style: { marginBottom: 6, opacity: 0.75 }, children: [
      "From. ",
      n.from
    ] }),
    /* @__PURE__ */ l("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 12 }, children: n.body }),
    n.attachments && n.attachments.length > 0 && /* @__PURE__ */ b("div", { style: { padding: 10, background: "#222", borderRadius: 8, marginBottom: 8 }, children: [
      /* @__PURE__ */ l("div", { style: { marginBottom: 6, color: "#ffd84a", fontSize: 12 }, children: "첨부물" }),
      /* @__PURE__ */ l("ul", { style: { margin: 0, paddingLeft: 18 }, children: n.attachments.map((r, o) => {
        if ("itemId" in r) {
          const i = Me().get(r.itemId);
          return /* @__PURE__ */ b("li", { children: [
            i?.name ?? r.itemId,
            " x",
            r.count ?? 1
          ] }, o);
        }
        return /* @__PURE__ */ b("li", { children: [
          r.bells,
          " B"
        ] }, o);
      }) }),
      /* @__PURE__ */ l("div", { style: { marginTop: 8, display: "flex", gap: 6, justifyContent: "flex-end" }, children: n.claimed ? /* @__PURE__ */ l("span", { style: { fontSize: 12, opacity: 0.6 }, children: "수령 완료" }) : /* @__PURE__ */ l("button", { onClick: e, style: Ar(!0), children: "받기" }) })
    ] }),
    /* @__PURE__ */ l("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ l("button", { onClick: t, style: Ar(), children: "삭제" }) })
  ] });
}
function Rl({ children: n }) {
  return /* @__PURE__ */ l("div", { style: { padding: 14, opacity: 0.6 }, children: n });
}
function Ar(n) {
  return {
    padding: "6px 10px",
    background: n ? "#cf9aff" : "#444",
    color: n ? "#1a0d24" : "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: n ? 700 : 400
  };
}
const vo = ["fish", "bug", "food", "material", "furniture", "tool", "misc"], di = we((n, e) => ({
  entries: {},
  record: (t, r, o) => {
    if (r <= 0) return;
    const i = e().entries[t], s = i ? { ...i, totalCollected: i.totalCollected + r } : { itemId: t, firstSeenDay: o, totalCollected: r };
    n({ entries: { ...e().entries, [t]: s } });
  },
  has: (t) => !!e().entries[t],
  get: (t) => e().entries[t],
  size: () => Object.keys(e().entries).length,
  serialize: () => ({
    version: 1,
    entries: Object.fromEntries(Object.entries(e().entries).map(([t, r]) => [t, { ...r }]))
  }),
  hydrate: (t) => {
    if (!t || typeof t != "object") return;
    const r = {};
    if (t.entries && typeof t.entries == "object")
      for (const [o, i] of Object.entries(t.entries))
        !i || typeof i != "object" || (r[o] = {
          itemId: o,
          firstSeenDay: typeof i.firstSeenDay == "number" ? i.firstSeenDay : 0,
          totalCollected: typeof i.totalCollected == "number" ? i.totalCollected : 0
        });
    n({ entries: r });
  }
}));
function Qp(n = !0) {
  L(() => n ? ce.subscribe((t, r) => {
    if (t.slots === r.slots) return;
    const o = Math.floor(ve.getState().totalMinutes / (60 * 24)), i = /* @__PURE__ */ new Map();
    for (const a of r.slots) a && i.set(a.itemId, (i.get(a.itemId) ?? 0) + a.count);
    const s = /* @__PURE__ */ new Map();
    for (const a of t.slots) a && s.set(a.itemId, (s.get(a.itemId) ?? 0) + a.count);
    for (const [a, u] of s.entries()) {
      const c = u - (i.get(a) ?? 0);
      c > 0 && di.getState().record(a, c, o);
    }
  }) : void 0, [n]);
}
function em({ toggleKey: n = "k" }) {
  const [e, t] = Z(!1), [r, o] = Z("fish"), i = di((f) => f.entries);
  L(() => {
    const f = (d) => {
      const p = d.target?.tagName?.toLowerCase();
      p === "input" || p === "textarea" || (d.key.toLowerCase() === n.toLowerCase() && t((h) => !h), d.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", f), () => window.removeEventListener("keydown", f);
  }, [n]);
  const s = F(() => Me().all(), []), a = F(() => {
    const f = /* @__PURE__ */ new Map();
    for (const d of vo) f.set(d, []);
    for (const d of s) {
      const p = f.get(d.category);
      p && p.push(d);
    }
    return f;
  }, [s]);
  if (!e) return null;
  const u = a.get(r) ?? [], c = u.filter((f) => i[f.id]).length;
  return /* @__PURE__ */ l(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => t(!1),
      children: /* @__PURE__ */ b(
        "div",
        {
          onClick: (f) => f.stopPropagation(),
          style: {
            width: 760,
            height: 520,
            display: "flex",
            flexDirection: "column",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(122,223,144,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13,
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ b("div", { style: { padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ l("strong", { style: { fontSize: 15 }, children: "도감" }),
              /* @__PURE__ */ b("button", { onClick: () => t(!1), style: Nl(), children: [
                "닫기 [",
                n.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ l("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: vo.map((f) => {
              const d = a.get(f) ?? [];
              if (d.length === 0) return null;
              const p = d.filter((h) => i[h.id]).length;
              return /* @__PURE__ */ b(
                "button",
                {
                  onClick: () => o(f),
                  style: {
                    flex: 1,
                    padding: "8px 4px",
                    background: r === f ? "#262626" : "transparent",
                    color: r === f ? "#7adf90" : "#ddd",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Pretendard', system-ui, sans-serif",
                    fontSize: 12
                  },
                  children: [
                    xo(f),
                    " (",
                    p,
                    "/",
                    d.length,
                    ")"
                  ]
                },
                f
              );
            }) }),
            /* @__PURE__ */ b("div", { style: { padding: "6px 14px", fontSize: 12, opacity: 0.7 }, children: [
              xo(r),
              " — ",
              c,
              "/",
              u.length,
              " 수집"
            ] }),
            /* @__PURE__ */ b("div", { style: { flex: 1, overflowY: "auto", padding: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }, children: [
              u.map((f) => {
                const d = i[f.id], p = !!d;
                return /* @__PURE__ */ b("div", { style: {
                  padding: 10,
                  borderRadius: 8,
                  background: p ? "#222" : "#181818",
                  border: p ? "1px solid #2e3" : "1px solid #2a2a2a",
                  opacity: p ? 1 : 0.4
                }, children: [
                  /* @__PURE__ */ b("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }, children: [
                    /* @__PURE__ */ l("span", { style: { width: 16, height: 16, borderRadius: 4, background: f.color ?? "#888" } }),
                    /* @__PURE__ */ l("strong", { style: { fontSize: 13 }, children: p ? f.name : "???" })
                  ] }),
                  p && /* @__PURE__ */ b("div", { style: { fontSize: 11, opacity: 0.7 }, children: [
                    "수집 ",
                    d.totalCollected,
                    " · day ",
                    d.firstSeenDay
                  ] })
                ] }, f.id);
              }),
              u.length === 0 && /* @__PURE__ */ l("div", { style: { opacity: 0.6 }, children: "이 카테고리에는 항목이 없습니다." })
            ] })
          ]
        }
      )
    }
  );
}
function xo(n) {
  switch (n) {
    case "fish":
      return "물고기";
    case "bug":
      return "곤충";
    case "food":
      return "음식";
    case "material":
      return "재료";
    case "furniture":
      return "가구";
    case "tool":
      return "도구";
    case "misc":
      return "기타";
  }
}
function Nl() {
  return {
    padding: "4px 10px",
    background: "#444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12
  };
}
class El {
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
  require(e) {
    const t = this.defs.get(e);
    if (!t) throw new Error(`Unknown RecipeId: ${e}`);
    return t;
  }
  all() {
    return Array.from(this.defs.values());
  }
  has(e) {
    return this.defs.has(e);
  }
  clear() {
    this.defs.clear();
  }
}
let jn = null;
function Lt() {
  return jn || (jn = new El()), jn;
}
const $n = we((n, e) => ({
  unlocked: /* @__PURE__ */ new Set(),
  unlock: (t) => {
    const r = Lt().get(t);
    if (!r || e().unlocked.has(t)) return;
    const o = new Set(e().unlocked);
    o.add(t), n({ unlocked: o }), fe("info", `레시피 해금: ${r.name}`);
  },
  isUnlocked: (t) => {
    const r = Lt().get(t);
    return r ? r.unlockedByDefault ? !0 : e().unlocked.has(t) : !1;
  },
  canCraft: (t) => {
    const r = Lt().get(t);
    if (!r) return { ok: !1, reason: "unknown recipe" };
    if (!e().isUnlocked(t)) return { ok: !1, reason: "locked" };
    const o = ce.getState();
    for (const i of r.ingredients)
      if (o.countOf(i.itemId) < i.count) return { ok: !1, reason: "missing ingredients" };
    return r.requireBells && Le.getState().bells < r.requireBells ? { ok: !1, reason: "insufficient bells" } : { ok: !0 };
  },
  craft: (t) => {
    const r = e().canCraft(t);
    if (!r.ok) return r;
    const o = Lt().require(t), i = ce.getState();
    for (const a of o.ingredients)
      if (i.removeById(a.itemId, a.count) < a.count) return { ok: !1, reason: "remove failed" };
    return o.requireBells && !Le.getState().spend(o.requireBells) ? { ok: !1, reason: "spend failed" } : (i.add(o.output.itemId, o.output.count) > 0 ? fe("warn", "인벤토리 부족, 일부 결과물 폐기") : fe("reward", `제작 완료: ${o.name}`), { ok: !0 });
  },
  serialize: () => ({ version: 1, unlocked: Array.from(e().unlocked) }),
  hydrate: (t) => {
    !t || !Array.isArray(t.unlocked) || n({ unlocked: new Set(t.unlocked) });
  }
}));
function tm({ toggleKey: n = "c", title: e = "제작대", open: t, onClose: r }) {
  const [o, i] = Z(!1), s = t !== void 0, a = s ? t : o, u = () => {
    s ? r?.() : i(!1);
  }, c = () => {
    s ? a && r?.() : i((m) => !m);
  }, f = $n((m) => m.isUnlocked), d = $n((m) => m.canCraft), p = $n((m) => m.craft), h = ce((m) => m.slots), x = Le((m) => m.bells);
  if (L(() => {
    const m = (w) => {
      const S = w.target?.tagName?.toLowerCase();
      S === "input" || S === "textarea" || (w.key.toLowerCase() === n.toLowerCase() && c(), w.key === "Escape" && u());
    };
    return window.addEventListener("keydown", m), () => window.removeEventListener("keydown", m);
  }, [n, s, a]), !a) return null;
  const y = Lt().all(), g = (() => {
    const m = /* @__PURE__ */ new Map();
    for (const w of h) w && m.set(w.itemId, (m.get(w.itemId) ?? 0) + w.count);
    return m;
  })();
  return /* @__PURE__ */ l(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: u,
      children: /* @__PURE__ */ b(
        "div",
        {
          onClick: (m) => m.stopPropagation(),
          style: {
            width: 600,
            maxHeight: "76vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,200,120,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13
          },
          children: [
            /* @__PURE__ */ b("div", { style: { padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ l("strong", { style: { fontSize: 15 }, children: e }),
              /* @__PURE__ */ b("span", { style: { color: "#ffd84a" }, children: [
                x.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ b("button", { onClick: u, style: wo(), children: [
                "닫기 [",
                n.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ b("div", { style: { overflowY: "auto", padding: 10 }, children: [
              y.length === 0 && /* @__PURE__ */ l(Bl, { children: "레시피가 없습니다." }),
              y.map((m) => {
                const w = f(m.id), S = d(m.id), C = Me().get(m.output.itemId);
                return /* @__PURE__ */ b("div", { style: {
                  padding: 10,
                  marginBottom: 6,
                  background: "#222",
                  borderRadius: 8,
                  opacity: w ? 1 : 0.45
                }, children: [
                  /* @__PURE__ */ b("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
                    /* @__PURE__ */ b("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      /* @__PURE__ */ l("span", { style: { width: 16, height: 16, borderRadius: 4, background: C?.color ?? "#888" } }),
                      /* @__PURE__ */ l("strong", { children: w ? m.name : "???" }),
                      m.output.count > 1 && /* @__PURE__ */ b("span", { style: { opacity: 0.7 }, children: [
                        "x",
                        m.output.count
                      ] })
                    ] }),
                    /* @__PURE__ */ l(
                      "button",
                      {
                        onClick: () => p(m.id),
                        disabled: !S.ok,
                        style: wo(S.ok),
                        children: "제작"
                      }
                    )
                  ] }),
                  w && /* @__PURE__ */ b("div", { style: { fontSize: 12, opacity: 0.85 }, children: [
                    "재료: ",
                    m.ingredients.map((T) => {
                      const M = g.get(T.itemId) ?? 0, _ = M >= T.count, k = Me().get(T.itemId);
                      return /* @__PURE__ */ b("span", { style: { marginRight: 8, color: _ ? "#7adf90" : "#ff8a8a" }, children: [
                        k?.name ?? T.itemId,
                        " ",
                        M,
                        "/",
                        T.count
                      ] }, T.itemId);
                    }),
                    m.requireBells ? /* @__PURE__ */ b("span", { style: { color: "#ffd84a" }, children: [
                      "· ",
                      m.requireBells,
                      " B"
                    ] }) : null
                  ] })
                ] }, m.id);
              })
            ] })
          ]
        }
      )
    }
  );
}
function Bl({ children: n }) {
  return /* @__PURE__ */ l("div", { style: { padding: 14, opacity: 0.6 }, children: n });
}
function wo(n) {
  return {
    padding: "5px 10px",
    background: n ? "#ffc878" : "#333",
    color: n ? "#1a1a1a" : "#777",
    border: "none",
    borderRadius: 6,
    cursor: n ? "pointer" : "not-allowed",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: n ? 700 : 400
  };
}
class zl {
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
  require(e) {
    const t = this.defs.get(e);
    if (!t) throw new Error(`Unknown CropId: ${e}`);
    return t;
  }
  bySeedItemId(e) {
    for (const t of this.defs.values()) if (t.seedItemId === e) return t;
  }
  all() {
    return Array.from(this.defs.values());
  }
  has(e) {
    return this.defs.has(e);
  }
  clear() {
    this.defs.clear();
  }
}
let Vn = null;
function gt() {
  return Vn || (Vn = new zl()), Vn;
}
function So(n, e) {
  return { id: n, position: e, state: "empty", stageIndex: 0 };
}
function Dl(n, e) {
  if (n.state !== "planted" && n.state !== "mature") return n.stageIndex;
  const t = n.cropId ? gt().get(n.cropId) : void 0;
  if (!t || n.plantedAt === void 0) return n.stageIndex;
  let r = e - n.plantedAt;
  for (let o = 0; o < t.stages.length; o++) {
    const i = t.stages[o];
    if (i.durationMinutes <= 0 || r < i.durationMinutes) return o;
    r -= i.durationMinutes;
  }
  return t.stages.length - 1;
}
const Oe = we((n, e) => ({
  plots: {},
  registerPlot: (t) => {
    if (e().plots[t.id]) return;
    const o = { ...So(t.id, t.position), ...t };
    n({ plots: { ...e().plots, [t.id]: o } });
  },
  unregisterPlot: (t) => {
    if (!e().plots[t]) return;
    const r = { ...e().plots };
    delete r[t], n({ plots: r });
  },
  till: (t) => {
    const r = e().plots[t];
    return !r || r.state !== "empty" ? !1 : (n({ plots: { ...e().plots, [t]: { ...r, state: "tilled", stageIndex: 0 } } }), !0);
  },
  plant: (t, r, o) => {
    const i = e().plots[t], s = gt().get(r);
    if (!i || !s || i.state !== "tilled") return !1;
    const a = ce.getState();
    return a.countOf(s.seedItemId) < 1 ? (fe("warn", `${s.name} 씨앗 부족`), !1) : (a.removeById(s.seedItemId, 1), n({
      plots: {
        ...e().plots,
        [t]: {
          ...i,
          state: "planted",
          cropId: r,
          plantedAt: o,
          lastWateredAt: o,
          stageIndex: 0
        }
      }
    }), fe("success", `${s.name} 심음`), !0);
  },
  water: (t, r) => {
    const o = e().plots[t];
    if (!o || o.state !== "planted" && o.state !== "dried") return !1;
    let i = { ...o, lastWateredAt: r };
    return o.state === "dried" && (i = { ...i, state: "planted" }), n({ plots: { ...e().plots, [t]: i } }), !0;
  },
  harvest: (t) => {
    const r = e().plots[t];
    if (!r || r.state !== "mature" || !r.cropId) return !1;
    const o = gt().get(r.cropId);
    return o ? ce.getState().add(o.yieldItemId, o.yieldCount) > 0 ? (fe("warn", "인벤토리가 가득 찼습니다"), !1) : (fe("reward", `${o.name} +${o.yieldCount}`), n({
      plots: {
        ...e().plots,
        [t]: {
          ...So(r.id, r.position),
          state: "tilled"
        }
      }
    }), !0) : !1;
  },
  tick: (t) => {
    const r = e().plots, o = {};
    let i = !1;
    for (const [s, a] of Object.entries(r)) {
      let u = a;
      if (u.state === "planted" || u.state === "mature") {
        const c = u.cropId ? gt().get(u.cropId) : void 0;
        if (c && u.plantedAt !== void 0) {
          const f = u.lastWateredAt ?? u.plantedAt;
          if (t - f >= c.driedOutMinutes)
            u = { ...u, state: "dried" }, i = !0;
          else {
            const d = Dl(u, t), p = c.stages.length - 1, h = d >= p ? "mature" : "planted";
            (d !== u.stageIndex || h !== u.state) && (u = { ...u, stageIndex: d, state: h }, i = !0);
          }
        }
      }
      o[s] = u;
    }
    i && n({ plots: o });
  },
  near: (t, r, o) => {
    const i = o * o;
    let s = null, a = 1 / 0;
    for (const u of Object.values(e().plots)) {
      const c = u.position[0] - t, f = u.position[2] - r, d = c * c + f * f;
      d < i && d < a && (a = d, s = u);
    }
    return s;
  },
  serialize: () => ({ version: 1, plots: Object.values(e().plots).map((t) => ({ ...t })) }),
  hydrate: (t) => {
    if (!t || !Array.isArray(t.plots)) return;
    const r = {};
    for (const o of t.plots) o?.id && (r[o.id] = { ...o });
    n({ plots: r });
  }
}));
function qn(n, e, t) {
  const r = e.origin[0] - n.position[0], o = e.origin[2] - n.position[2];
  return r * r + o * o <= t * t;
}
function nm({ id: n, position: e, size: t = 1.4, hitRange: r = 1.6 }) {
  const o = Oe((S) => S.registerPlot), i = Oe((S) => S.unregisterPlot), s = Oe((S) => S.plots[n]), a = Oe((S) => S.till), u = Oe((S) => S.plant), c = Oe((S) => S.water), f = Oe((S) => S.harvest), d = Oe((S) => S.tick);
  L(() => (o({ id: n, position: e }), () => i(n)), [n, e, o, i]), L(() => {
    let S = 0;
    const C = ve.subscribe((T) => {
      T.totalMinutes !== S && (S = T.totalMinutes, d(T.totalMinutes));
    });
    return d(ve.getState().totalMinutes), C;
  }, [d]);
  const p = q((S) => {
    const C = Oe.getState().plots[n];
    if (!(!C || !qn(C, S, r))) {
      if (C.state === "mature") return f(n) ? !0 : void 0;
      if (C.state === "empty") {
        const T = a(n);
        return T && fe("info", "땅을 갈았다"), T ? !0 : void 0;
      }
    }
  }, [n, r, a, f]), h = q((S) => {
    const C = Oe.getState().plots[n];
    if (!C || !qn(C, S, r) || C.state !== "tilled") return;
    const T = ce.getState().getEquipped();
    if (!T) return;
    const M = gt().bySeedItemId(T.itemId);
    if (!M) return;
    const _ = ve.getState().totalMinutes;
    return u(n, M.id, _) ? !0 : void 0;
  }, [n, r, u]), x = q((S) => {
    const C = Oe.getState().plots[n];
    if (!C || !qn(C, S, r) || C.state !== "planted" && C.state !== "dried") return;
    const T = ve.getState().totalMinutes, M = c(n, T);
    return M && fe("info", "물을 줬다"), M ? !0 : void 0;
  }, [n, r, c]);
  St("shovel", p), St("seed", h), St("water", x);
  const y = s?.cropId ? gt().get(s.cropId) : void 0, g = y ? y.stages[s.stageIndex] : void 0, m = F(() => !s || s.state === "empty" ? "#5a3f24" : s.state === "tilled" ? "#4a2f18" : s.state === "dried" ? "#6b5230" : "#3a2810", [s]), w = E(null);
  return de(({ clock: S }) => {
    const C = w.current;
    if (!C) return;
    const T = S.elapsedTime;
    C.rotation.y = Math.sin(T * 0.4) * 0.05, C.position.y = (g?.scale ?? 0.3) * 0.5 + Math.sin(T * 1.2) * 0.01;
  }), /* @__PURE__ */ b("group", { position: e, children: [
    /* @__PURE__ */ b("mesh", { receiveShadow: !0, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: [
      /* @__PURE__ */ l("planeGeometry", { args: [t, t] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: m })
    ] }),
    s && (s.state === "planted" || s.state === "mature" || s.state === "dried") && y && g && /* @__PURE__ */ b("mesh", { ref: w, castShadow: !0, position: [0, g.scale * 0.5, 0], children: [
      /* @__PURE__ */ l("coneGeometry", { args: [Math.max(0.08, g.scale * 0.35), Math.max(0.16, g.scale * 0.9), 10] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: s.state === "dried" ? "#7a6a4a" : g.color ?? "#9adf90" })
    ] }),
    s?.state === "mature" && /* @__PURE__ */ b("mesh", { position: [0, 1, 0], children: [
      /* @__PURE__ */ l("ringGeometry", { args: [0.18, 0.24, 16] }),
      /* @__PURE__ */ l("meshBasicMaterial", { color: "#ffd84a", transparent: !0, opacity: 0.85, depthWrite: !1 })
    ] })
  ] });
}
const Fl = [
  {
    id: "crop.turnip",
    name: "순무",
    seedItemId: "seed-turnip",
    yieldItemId: "turnip",
    yieldCount: 2,
    waterIntervalMinutes: 60 * 8,
    driedOutMinutes: 60 * 16,
    stages: [
      { durationMinutes: 60 * 6, scale: 0.3, color: "#8acf8a" },
      { durationMinutes: 60 * 8, scale: 0.6, color: "#a8df9c", needsWater: !0 },
      { durationMinutes: 60 * 10, scale: 0.9, color: "#cfeeb6", needsWater: !0 },
      { durationMinutes: 0, scale: 1, color: "#ffeeaa" }
    ]
  },
  {
    id: "crop.tomato",
    name: "토마토",
    seedItemId: "seed-tomato",
    yieldItemId: "tomato",
    yieldCount: 3,
    waterIntervalMinutes: 60 * 6,
    driedOutMinutes: 60 * 12,
    stages: [
      { durationMinutes: 60 * 8, scale: 0.3, color: "#7adf90" },
      { durationMinutes: 60 * 12, scale: 0.6, color: "#9adf90", needsWater: !0 },
      { durationMinutes: 60 * 12, scale: 0.9, color: "#cfdf90", needsWater: !0 },
      { durationMinutes: 0, scale: 1.1, color: "#e54b4b" }
    ]
  }
];
let Mo = !1;
function rm() {
  Mo || (Mo = !0, gt().registerAll(Fl));
}
const Ll = {
  sunny: { sym: "O", color: "#ffd84a", label: "맑음" },
  cloudy: { sym: "c", color: "#aab2bc", label: "흐림" },
  rain: { sym: "r", color: "#4aa8ff", label: "비" },
  snow: { sym: "*", color: "#dff0ff", label: "눈" },
  storm: { sym: "!", color: "#7f7fff", label: "폭풍" }
};
function om({ position: n = "top-left" }) {
  const e = Ge((o) => o.current);
  if (!e) return null;
  const t = Ll[e.kind], r = n === "top-right" ? { top: 50, right: 12 } : { top: 50, left: 12 };
  return /* @__PURE__ */ b(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 90,
        padding: "4px 10px",
        background: "rgba(20,20,28,0.85)",
        color: "#fff",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 12,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: `inset 0 0 0 1px ${t.color}55`,
        pointerEvents: "none",
        userSelect: "none",
        ...r
      },
      children: [
        /* @__PURE__ */ l("span", { style: {
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: t.color,
          color: "#1a1a1a",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 11
        }, children: t.sym }),
        /* @__PURE__ */ l("span", { children: t.label })
      ]
    }
  );
}
function im({ area: n = 80, height: e = 18, count: t = 1200 }) {
  const r = Ge((u) => u.current), o = E(null), { geometry: i, material: s, kind: a } = F(() => {
    if (!r || r.kind !== "rain" && r.kind !== "snow" && r.kind !== "storm")
      return { geometry: null, material: null, kind: null };
    const u = new Float32Array(t * 3), c = new Float32Array(t);
    for (let h = 0; h < t; h++)
      u[h * 3 + 0] = (Math.random() - 0.5) * n, u[h * 3 + 1] = Math.random() * e, u[h * 3 + 2] = (Math.random() - 0.5) * n, c[h] = r.kind === "snow" ? 0.6 + Math.random() * 0.4 : 8 + Math.random() * 6;
    const f = new v.BufferGeometry();
    f.setAttribute("position", new v.BufferAttribute(u, 3)), f.setAttribute("aSpeed", new v.BufferAttribute(c, 1));
    const d = r.kind === "snow", p = new v.PointsMaterial({
      color: d ? 16777215 : 10148351,
      size: d ? 0.18 : 0.12,
      transparent: !0,
      opacity: d ? 0.85 : 0.6,
      depthWrite: !1,
      sizeAttenuation: !0
    });
    return { geometry: f, material: p, kind: r.kind };
  }, [r?.kind, r?.intensity, n, e, t]);
  return de((u, c) => {
    if (!o.current || !i || !a) return;
    const d = i.getAttribute("position"), p = i.getAttribute("aSpeed"), h = d.array, x = p.array, y = a === "snow" ? 1 : 6;
    for (let g = 0; g < h.length; g += 3)
      h[g + 1] -= x[g / 3] * c * y, a === "snow" && (h[g + 0] += Math.sin((h[g + 1] + g) * 0.5) * c * 0.3), h[g + 1] < 0 && (h[g + 0] = (Math.random() - 0.5) * n, h[g + 1] = e, h[g + 2] = (Math.random() - 0.5) * n);
    d.needsUpdate = !0;
  }), !i || !s ? null : /* @__PURE__ */ l("points", { ref: o, geometry: i, material: s, frustumCulled: !1 });
}
function sm(n = !0) {
  L(() => {
    if (!n) return;
    const e = () => {
      const r = ve.getState(), o = Math.floor(r.totalMinutes / (60 * 24)), i = Ge.getState().current;
      (!i || i.day !== o) && Ge.getState().rollForDay(o, r.time.season);
    };
    return e(), ve.subscribe((r, o) => {
      const i = Math.floor(r.totalMinutes / 1440), s = Math.floor(o.totalMinutes / (60 * 24));
      i !== s && e();
    });
  }, [n]);
}
function am(n = !0, e = {}) {
  L(() => {
    if (!n) return;
    const t = () => {
      const o = ve.getState().time, { started: i, ended: s } = Tn.getState().refresh(o);
      i.length && e.onStarted && e.onStarted(i), s.length && e.onEnded && e.onEnded(s);
    };
    return t(), ve.subscribe((o, i) => {
      (o.time.day !== i.time.day || o.time.month !== i.time.month || o.time.season !== i.time.season || o.time.weekday !== i.time.weekday) && t();
    });
  }, [n, e.onStarted, e.onEnded]);
}
function lm({ position: n = "top-left", excludeIds: e = [] }) {
  const t = Tn((s) => s.active), r = Or(), o = t.filter((s) => !e.includes(s));
  return o.length === 0 ? null : /* @__PURE__ */ l(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        pointerEvents: "none",
        userSelect: "none",
        ...n === "top-right" ? { top: 88, right: 12 } : { top: 88, left: 12 }
      },
      children: o.map((s) => {
        const a = r.get(s);
        if (!a) return null;
        const u = a.tags?.some((c) => c === "festival" || c === "tourney");
        return /* @__PURE__ */ b(
          "div",
          {
            style: {
              padding: "4px 10px",
              background: "rgba(20,20,28,0.85)",
              color: "#fff",
              fontFamily: "'Pretendard', system-ui, sans-serif",
              fontSize: 11,
              borderRadius: 999,
              boxShadow: `inset 0 0 0 1px ${u ? "#ffd84a55" : "#7adf9055"}`,
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            },
            children: [
              /* @__PURE__ */ l("span", { style: {
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: u ? "#ffd84a" : "#7adf90"
              } }),
              /* @__PURE__ */ l("span", { children: a.name })
            ]
          },
          s
        );
      })
    }
  );
}
const Gl = [
  {
    id: "season.spring",
    name: "봄",
    summary: "꽃이 피고 벌레가 깨어납니다.",
    triggers: [{ kind: "season", seasons: ["spring"] }],
    tags: ["season:spring", "fish:bass", "bug:butterfly"]
  },
  {
    id: "season.summer",
    name: "여름",
    summary: "낚시와 곤충채집의 계절.",
    triggers: [{ kind: "season", seasons: ["summer"] }],
    tags: ["season:summer", "fish:tuna", "bug:beetle", "bug:stag"]
  },
  {
    id: "season.autumn",
    name: "가을",
    summary: "단풍이 들고 낚시 보너스.",
    triggers: [{ kind: "season", seasons: ["autumn"] }],
    tags: ["season:autumn", "fish:koi", "bug:butterfly"]
  },
  {
    id: "season.winter",
    name: "겨울",
    summary: "눈이 내리고 곤충은 사라집니다.",
    triggers: [{ kind: "season", seasons: ["winter"] }],
    tags: ["season:winter", "fish:bass"]
  },
  {
    id: "event.cherryblossom",
    name: "벚꽃 축제",
    summary: "봄 한정 — 벚꽃 잎이 흩날립니다.",
    triggers: [{ kind: "monthRange", month: 4, fromDay: 1, toDay: 10 }],
    tags: ["festival", "visual:sakura"]
  },
  {
    id: "event.fishing-tourney",
    name: "낚시 대회",
    summary: "주말 한정 낚시 대회 — 보너스 종 출현.",
    triggers: [{ kind: "weekday", weekdays: ["sat", "sun"] }],
    tags: ["tourney", "fish:koi", "fish:tuna"]
  }
];
let Co = !1;
function cm() {
  Co || (Co = !0, Or().registerAll(Gl));
}
function ko(n, e) {
  return { id: n, position: e, size: [4, 4], state: "empty" };
}
const rt = we((n, e) => ({
  houses: {},
  residents: {},
  decorationScore: 0,
  registerHouse: (t) => {
    if (e().houses[t.id]) return;
    const o = { ...ko(t.id, t.position), ...t };
    n({ houses: { ...e().houses, [t.id]: o } });
  },
  unregisterHouse: (t) => {
    const r = { ...e().houses };
    r[t] && (delete r[t], n({ houses: r }));
  },
  registerResident: (t) => {
    e().residents[t.id] || n({ residents: { ...e().residents, [t.id]: t } });
  },
  removeResident: (t) => {
    const r = { ...e().residents };
    if (r[t]) {
      delete r[t], n({ residents: r });
      for (const o of Object.values(e().houses))
        o.residentId === t && e().moveOut(o.id), o.reservedFor === t && e().cancelReservation(o.id);
    }
  },
  reserveHouse: (t, r, o) => {
    const i = e().houses[t];
    return !i || i.state !== "empty" ? !1 : (n({
      houses: {
        ...e().houses,
        [t]: {
          ...i,
          state: "reserved",
          reservedFor: r,
          ...o !== void 0 ? { reservedUntilDay: o } : {}
        }
      }
    }), !0);
  },
  cancelReservation: (t) => {
    const r = e().houses[t];
    if (!r || r.state !== "reserved") return;
    const o = { ...r, state: "empty" };
    delete o.reservedFor, delete o.reservedUntilDay, n({ houses: { ...e().houses, [t]: o } });
  },
  moveIn: (t, r, o) => {
    const i = e().houses[t], s = e().residents[r];
    return !i || !s || i.state === "occupied" ? !1 : (n({
      houses: {
        ...e().houses,
        [t]: {
          ...i,
          state: "occupied",
          residentId: r
        }
      },
      residents: {
        ...e().residents,
        [r]: { ...s, movedInDay: o }
      }
    }), fe("reward", `${s.name}이(가) 이사 왔다!`), !0);
  },
  moveOut: (t) => {
    const r = e().houses[t];
    if (!r || r.state !== "occupied") return !1;
    const o = r.residentId ? e().residents[r.residentId] : null;
    return n({
      houses: {
        ...e().houses,
        [t]: ko(t, r.position)
      }
    }), o && fe("info", `${o.name}이(가) 떠났다`), !0;
  },
  setDecorationScore: (t) => n({ decorationScore: Math.max(0, Math.floor(t)) }),
  stats: () => {
    const t = Object.values(e().houses), r = t.filter((o) => o.state === "occupied").length;
    return {
      decorationScore: e().decorationScore,
      residentCount: Object.keys(e().residents).length,
      occupiedHouses: r,
      totalHouses: t.length
    };
  },
  serialize: () => ({
    version: 1,
    houses: Object.values(e().houses).map((t) => ({ ...t })),
    residents: Object.values(e().residents).map((t) => ({ ...t }))
  }),
  hydrate: (t) => {
    if (!t) return;
    const r = {}, o = {};
    if (Array.isArray(t.houses))
      for (const i of t.houses) i?.id && (r[i.id] = { ...i });
    if (Array.isArray(t.residents))
      for (const i of t.residents) i?.id && (o[i.id] = { ...i });
    n({ houses: r, residents: o });
  }
})), Ol = {
  tile: 2,
  wall: 1,
  placedObject: 5,
  base: 0
};
function um(n = !0, e = {}) {
  L(() => {
    if (!n) return;
    const t = { ...Ol, ...e }, r = (i) => {
      let s = 0, a = 0;
      const u = i.objects.length;
      for (const f of i.tileGroups.values())
        s += f.tiles.length;
      for (const f of i.wallGroups.values())
        a += f.walls.length;
      const c = t.base + s * t.tile + a * t.wall + u * t.placedObject;
      rt.getState().setDecorationScore(c);
    };
    return r(O.getState()), O.subscribe((i) => r(i));
  }, [n, e.tile, e.wall, e.placedObject, e.base]);
}
function dm({
  id: n,
  position: e,
  size: t = [4, 4],
  emptyColor: r = "#705038",
  reservedColor: o = "#c8a85a",
  occupiedColor: i = "#5a8acf"
}) {
  const s = rt((h) => h.registerHouse), a = rt((h) => h.unregisterHouse), u = rt((h) => h.houses[n]), c = rt((h) => h.residents);
  L(() => (s({ id: n, position: e, size: t }), () => a(n)), [n, e, t, s, a]);
  const f = u ? u.state === "occupied" ? i : u.state === "reserved" ? o : r : r, d = u?.residentId ? c[u.residentId] : null, p = F(() => new v.PlaneGeometry(t[0], t[1]), [t[0], t[1]]);
  return /* @__PURE__ */ b("group", { position: e, children: [
    /* @__PURE__ */ l("mesh", { geometry: p, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: /* @__PURE__ */ l("meshToonMaterial", { color: f, transparent: !0, opacity: 0.7 }) }),
    u?.state === "occupied" && d && /* @__PURE__ */ b(Se, { children: [
      /* @__PURE__ */ b("mesh", { position: [0, 0.6, 0], castShadow: !0, children: [
        /* @__PURE__ */ l("boxGeometry", { args: [Math.max(1.4, t[0] * 0.6), 1.2, Math.max(1.4, t[1] * 0.6)] }),
        /* @__PURE__ */ l("meshToonMaterial", { color: d.bodyColor ?? "#e8d8b8" })
      ] }),
      /* @__PURE__ */ b("mesh", { position: [0, 1.5, 0], castShadow: !0, children: [
        /* @__PURE__ */ l("coneGeometry", { args: [Math.max(1, t[0] * 0.45), 0.7, 4] }),
        /* @__PURE__ */ l("meshToonMaterial", { color: d.hatColor ?? "#a85a5a" })
      ] })
    ] }),
    u?.state === "reserved" && /* @__PURE__ */ b("mesh", { position: [0, 0.5, 0], children: [
      /* @__PURE__ */ l("boxGeometry", { args: [0.4, 1, 0.4] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: o })
    ] })
  ] });
}
function fm({ position: n = "top-right", offset: e }) {
  const t = rt((f) => f.decorationScore), r = rt((f) => f.houses), o = rt((f) => f.residents), i = Object.keys(r).length, s = Object.values(r).filter((f) => f.state === "occupied").length, a = Object.keys(o).length, c = { ...n === "bottom-right" ? { bottom: 12, right: 100 } : n === "top-left" ? { top: 160, left: 12 } : n === "bottom-left" ? { bottom: 12, left: 240 } : { top: 50, right: 12 }, ...e ?? {} };
  return /* @__PURE__ */ b(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 90,
        padding: "6px 10px",
        background: "rgba(20,20,28,0.85)",
        color: "#fff",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 11,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        pointerEvents: "none",
        userSelect: "none",
        ...c
      },
      children: [
        /* @__PURE__ */ b("div", { children: [
          "마을 점수 ",
          /* @__PURE__ */ l("span", { style: { color: "#ffd84a", fontWeight: 700 }, children: t })
        ] }),
        /* @__PURE__ */ b("div", { children: [
          "주민 ",
          s,
          "/",
          i,
          " (등록 ",
          a,
          ")"
        ] })
      ]
    }
  );
}
class Ul {
  ctx = null;
  masterGain = null;
  bgmGain = null;
  sfxGain = null;
  bgmInterval = null;
  bgmStep = 0;
  currentBgm = null;
  bufferCache = /* @__PURE__ */ new Map();
  ensure() {
    if (this.ctx) return !0;
    if (typeof window > "u" || typeof window.AudioContext > "u") return !1;
    try {
      return this.ctx = new window.AudioContext(), this.masterGain = this.ctx.createGain(), this.masterGain.connect(this.ctx.destination), this.bgmGain = this.ctx.createGain(), this.sfxGain = this.ctx.createGain(), this.bgmGain.connect(this.masterGain), this.sfxGain.connect(this.masterGain), !0;
    } catch {
      return !1;
    }
  }
  resume() {
    this.ctx?.state === "suspended" && this.ctx.resume();
  }
  setMasterVolume(e) {
    !this.ensure() || !this.masterGain || (this.masterGain.gain.value = Math.max(0, Math.min(1, e)));
  }
  setBgmVolume(e) {
    !this.ensure() || !this.bgmGain || (this.bgmGain.gain.value = Math.max(0, Math.min(1, e)));
  }
  setSfxVolume(e) {
    !this.ensure() || !this.sfxGain || (this.sfxGain.gain.value = Math.max(0, Math.min(1, e)));
  }
  playSfx(e) {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return;
    if (e.url) {
      this.playFromUrl(e.url, this.sfxGain, e.volume ?? 1);
      return;
    }
    const t = this.ctx.createOscillator(), r = this.ctx.createGain();
    t.type = e.type ?? "sine", t.frequency.value = e.freq ?? 440;
    const o = e.duration ?? 0.12, i = this.ctx.currentTime;
    r.gain.setValueAtTime(0, i), r.gain.linearRampToValueAtTime((e.volume ?? 1) * 0.3, i + 5e-3), r.gain.exponentialRampToValueAtTime(1e-4, i + o), t.connect(r), r.connect(this.sfxGain), t.start(i), t.stop(i + o + 0.05);
  }
  playBgm(e) {
    if (!this.ensure() || !this.ctx || !this.bgmGain || (this.stopBgm(), !e)) return;
    if (this.currentBgm = e, e.url) {
      this.playFromUrl(e.url, this.bgmGain, e.volume ?? 1, !0);
      return;
    }
    const t = e.pattern ?? [0, 4, 7, 4], r = e.intervalMs ?? 800, o = e.baseFreq ?? 220;
    this.bgmStep = 0;
    const i = () => {
      if (!this.ctx || !this.bgmGain) return;
      const s = t[this.bgmStep % t.length] ?? 0, a = o * Math.pow(2, s / 12), u = this.ctx.createOscillator(), c = this.ctx.createGain();
      u.type = "triangle", u.frequency.value = a;
      const f = this.ctx.currentTime;
      c.gain.setValueAtTime(0, f), c.gain.linearRampToValueAtTime((e.volume ?? 1) * 0.18, f + 0.04), c.gain.exponentialRampToValueAtTime(1e-4, f + r / 1e3 * 0.95), u.connect(c), c.connect(this.bgmGain), u.start(f), u.stop(f + r / 1e3 + 0.05), this.bgmStep += 1;
    };
    i(), this.bgmInterval = window.setInterval(i, r);
  }
  stopBgm() {
    this.bgmInterval !== null && (window.clearInterval(this.bgmInterval), this.bgmInterval = null), this.currentBgm = null;
  }
  getCurrentBgmId() {
    return this.currentBgm?.id ?? null;
  }
  async playFromUrl(e, t, r, o = !1) {
    if (this.ctx)
      try {
        let i = this.bufferCache.get(e);
        if (!i) {
          const c = await (await fetch(e)).arrayBuffer();
          i = await this.ctx.decodeAudioData(c), this.bufferCache.set(e, i);
        }
        const s = this.ctx.createBufferSource();
        s.buffer = i, s.loop = o;
        const a = this.ctx.createGain();
        a.gain.value = r, s.connect(a), a.connect(t), s.start();
      } catch {
      }
  }
}
let Yn = null;
function xt() {
  return Yn || (Yn = new Ul()), Yn;
}
const Ve = we((n, e) => ({
  masterMuted: !1,
  bgmMuted: !1,
  sfxMuted: !1,
  masterVolume: 0.6,
  bgmVolume: 0.4,
  sfxVolume: 0.7,
  currentBgmId: null,
  setMaster: (t) => {
    n({ masterVolume: Math.max(0, Math.min(1, t)) }), e().apply();
  },
  setBgm: (t) => {
    n({ bgmVolume: Math.max(0, Math.min(1, t)) }), e().apply();
  },
  setSfx: (t) => {
    n({ sfxVolume: Math.max(0, Math.min(1, t)) }), e().apply();
  },
  toggleMaster: () => {
    n({ masterMuted: !e().masterMuted }), e().apply();
  },
  toggleBgm: () => {
    n({ bgmMuted: !e().bgmMuted }), e().apply();
  },
  toggleSfx: () => {
    n({ sfxMuted: !e().sfxMuted }), e().apply();
  },
  playSfx: (t) => {
    const r = e();
    r.masterMuted || r.sfxMuted || (xt().resume(), xt().playSfx(t));
  },
  playBgm: (t) => {
    xt().resume(), xt().playBgm(t), n({ currentBgmId: t?.id ?? null }), e().apply();
  },
  stopBgm: () => {
    xt().stopBgm(), n({ currentBgmId: null });
  },
  apply: () => {
    const t = e(), r = xt();
    r.setMasterVolume(t.masterMuted ? 0 : t.masterVolume), r.setBgmVolume(t.bgmMuted ? 0 : t.bgmVolume), r.setSfxVolume(t.sfxMuted ? 0 : t.sfxVolume);
  },
  serialize: () => {
    const t = e();
    return {
      version: 1,
      masterMuted: t.masterMuted,
      bgmMuted: t.bgmMuted,
      sfxMuted: t.sfxMuted,
      masterVolume: t.masterVolume,
      bgmVolume: t.bgmVolume,
      sfxVolume: t.sfxVolume
    };
  },
  hydrate: (t) => {
    t && (n({
      masterMuted: !!t.masterMuted,
      bgmMuted: !!t.bgmMuted,
      sfxMuted: !!t.sfxMuted,
      masterVolume: typeof t.masterVolume == "number" ? t.masterVolume : 0.6,
      bgmVolume: typeof t.bgmVolume == "number" ? t.bgmVolume : 0.4,
      sfxVolume: typeof t.sfxVolume == "number" ? t.sfxVolume : 0.7
    }), e().apply());
  }
})), Wl = [0, 2, 4, 5, 7, 9, 11], Hl = [0, 2, 3, 5, 7, 8, 10];
function jl(n) {
  return n === "rain" || n === "storm" || n === "snow" ? Hl : Wl;
}
function $l(n) {
  return n < 6 ? "night" : n < 10 ? "dawn" : n < 18 ? "day" : n < 22 ? "dusk" : "night";
}
function Vl(n, e) {
  const t = $l(n), r = jl(e), o = t === "night" ? 174.6 : t === "dawn" ? 220 : t === "dusk" ? 196 : 261.6, i = t === "day" ? 700 : 950, s = [r[0], r[2], r[4], r[2], r[0], r[3], r[1], r[4]];
  return {
    id: `bgm.${t}.${e ?? "unknown"}`,
    baseFreq: o,
    intervalMs: i,
    pattern: s,
    volume: e === "storm" ? 0.6 : 1
  };
}
function pm(n = !0) {
  L(() => {
    if (!n) return;
    const e = () => {
      const o = ve.getState(), i = Ge.getState().current, s = Vl(o.time.hour, i?.kind);
      Ve.getState().currentBgmId !== s.id && Ve.getState().playBgm(s);
    }, t = ve.subscribe((o, i) => {
      o.time.hour !== i.time.hour && e();
    }), r = Ge.subscribe((o, i) => {
      o.current?.kind !== i.current?.kind && e();
    });
    return e(), () => {
      t(), r(), Ve.getState().stopBgm();
    };
  }, [n]);
}
function mm({ position: n = "bottom-right", offset: e }) {
  const t = Ve((d) => d.masterMuted), r = Ve((d) => d.bgmMuted), o = Ve((d) => d.sfxMuted), i = Ve((d) => d.toggleMaster), s = Ve((d) => d.toggleBgm), a = Ve((d) => d.toggleSfx), c = { ...n === "top-right" ? { top: 50, right: 200 } : n === "bottom-left" ? { bottom: 12, left: 240 } : n === "top-left" ? { top: 220, left: 12 } : { bottom: 12, right: 110 }, ...e ?? {} }, f = (d, p, h) => /* @__PURE__ */ b(
    "button",
    {
      onClick: h,
      style: {
        padding: "4px 8px",
        background: p ? "rgba(80,30,30,0.85)" : "rgba(20,20,28,0.85)",
        color: p ? "#ff8a8a" : "#fff",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 11,
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 6,
        cursor: "pointer"
      },
      children: [
        d,
        p ? " OFF" : ""
      ]
    }
  );
  return /* @__PURE__ */ b(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 95,
        display: "flex",
        gap: 4,
        pointerEvents: "auto",
        ...c
      },
      children: [
        f("M", t, i),
        f("Bgm", r, s),
        f("Sfx", o, a)
      ]
    }
  );
}
const ql = {
  grass: { freq: 320, duration: 0.07, type: "triangle", volume: 0.18 },
  sand: { freq: 220, duration: 0.1, type: "sine", volume: 0.2 },
  snow: { freq: 380, duration: 0.1, type: "triangle", volume: 0.22 },
  wood: { freq: 540, duration: 0.06, type: "square", volume: 0.14 },
  stone: { freq: 760, duration: 0.05, type: "square", volume: 0.16 },
  water: { freq: 180, duration: 0.13, type: "sine", volume: 0.24 }
};
function Yl(n, e) {
  const t = ie.GRID_CELL_SIZE, r = O.getState().tileGroups;
  for (const o of r.values())
    for (const i of o.tiles) {
      const s = (i.size || 1) * t / 2;
      if (!(Math.abs(i.position.x - n) > s) && !(Math.abs(i.position.z - e) > s)) {
        switch (i.objectType) {
          case "water":
            return "water";
          case "sand":
            return "sand";
          case "snowfield":
            return "snow";
          case "grass":
            return "grass";
        }
        return i.shape === "stairs" || i.shape === "ramp" ? "wood" : "stone";
      }
    }
  return "grass";
}
function hm({
  strideMeters: n = 0.65,
  maxStepsPerSecond: e = 6,
  volume: t = 1,
  resolveSurface: r = Yl,
  enabled: o = !0
} = {}) {
  const { position: i, isGrounded: s, isMoving: a, speed: u } = yt({ updateInterval: 32 }), c = E({ x: i.x, z: i.z }), f = E(0), d = E(0);
  return L(() => {
    c.current.x = i.x, c.current.z = i.z;
  }, []), de(() => {
    if (!o) return;
    const p = performance.now(), h = i.x - c.current.x, x = i.z - c.current.z;
    if (c.current.x = i.x, c.current.z = i.z, !s || !a) {
      f.current = 0;
      return;
    }
    const y = Math.hypot(h, x);
    if (y <= 0 || (f.current += y, f.current < n) || p - d.current < 1e3 / e) return;
    f.current = 0, d.current = p;
    const g = r(i.x, i.z), m = ql[g], w = Math.min(1.4, 0.7 + u * 0.06);
    Ve.getState().playSfx({
      id: `footstep-${g}`,
      type: m.type ?? "sine",
      freq: m.freq ?? 320,
      duration: m.duration ?? 0.08,
      volume: (m.volume ?? 0.2) * t * w
    });
  }), null;
}
const wt = {
  name: "플레이어",
  colors: {
    body: "#ffd9b8",
    hair: "#3a2a1a",
    hat: "#5a8acf",
    top: "#f0e0c8",
    bottom: "#3a4a6a",
    shoes: "#3a2a1a"
  },
  face: "default",
  hair: "short"
}, Zl = {
  hat: "모자",
  top: "상의",
  bottom: "하의",
  shoes: "신발",
  face: "표정"
}, Xl = {
  short: "단발",
  long: "긴머리",
  cap: "모자머리",
  bun: "쪽머리",
  spiky: "뻗친머리"
}, Kl = {
  default: "기본",
  smile: "미소",
  wink: "윙크",
  sleepy: "졸림",
  surprised: "놀람"
}, Zn = {
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  face: null
}, je = we((n, e) => ({
  appearance: { ...wt, colors: { ...wt.colors } },
  outfits: { ...Zn },
  setName: (t) => n((r) => ({ appearance: { ...r.appearance, name: t.slice(0, 16) || "플레이어" } })),
  setColor: (t, r) => n((o) => ({
    appearance: {
      ...o.appearance,
      colors: { ...o.appearance.colors, [t]: r }
    }
  })),
  setFace: (t) => n((r) => ({ appearance: { ...r.appearance, face: t } })),
  setHair: (t) => n((r) => ({ appearance: { ...r.appearance, hair: t } })),
  equipOutfit: (t, r) => n((o) => ({ outfits: { ...o.outfits, [t]: r } })),
  resetAppearance: () => n({
    appearance: { ...wt, colors: { ...wt.colors } },
    outfits: { ...Zn }
  }),
  serialize: () => {
    const t = e();
    return {
      version: 1,
      appearance: {
        ...t.appearance,
        colors: { ...t.appearance.colors }
      },
      outfits: { ...t.outfits }
    };
  },
  hydrate: (t) => {
    !t || t.version !== 1 || n({
      appearance: {
        ...wt,
        ...t.appearance,
        colors: { ...wt.colors, ...t.appearance.colors }
      },
      outfits: { ...Zn, ...t.outfits }
    });
  }
})), Jl = [
  { key: "body", label: "피부" },
  { key: "hair", label: "머리" },
  { key: "hat", label: "모자" },
  { key: "top", label: "상의" },
  { key: "bottom", label: "하의" },
  { key: "shoes", label: "신발" }
], Ql = ["short", "long", "cap", "bun", "spiky"], ec = ["default", "smile", "wink", "sleepy", "surprised"], tc = ["hat", "top", "bottom", "shoes", "face"];
function gm({ toggleKey: n, open: e, onClose: t } = {}) {
  const r = typeof e == "boolean", [o, i] = Z(!1), s = r ? e : o, a = je((g) => g.appearance), u = je((g) => g.outfits), c = je((g) => g.setName), f = je((g) => g.setColor), d = je((g) => g.setHair), p = je((g) => g.setFace), h = je((g) => g.equipOutfit), x = je((g) => g.resetAppearance);
  if (L(() => {
    if (!n || r) return;
    const g = (m) => {
      const w = m.target?.tagName?.toLowerCase();
      if (w === "input" || w === "textarea") return;
      const S = n.toLowerCase(), C = `Key${n.toUpperCase()}`;
      m.code !== C && m.key.toLowerCase() !== S || i((T) => !T);
    };
    return window.addEventListener("keydown", g), () => window.removeEventListener("keydown", g);
  }, [n, r]), !s) return null;
  const y = () => {
    r ? t?.() : i(!1);
  };
  return /* @__PURE__ */ l(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 130,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.32)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)"
      },
      onClick: y,
      children: /* @__PURE__ */ b(
        "div",
        {
          onClick: (g) => g.stopPropagation(),
          style: {
            width: "min(640px, 92vw)",
            maxHeight: "88vh",
            overflowY: "auto",
            background: "rgba(18,20,28,0.62)",
            color: "#f3f4f8",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13,
            padding: 18
          },
          children: [
            /* @__PURE__ */ b("header", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }, children: [
              /* @__PURE__ */ l("h2", { style: { margin: 0, fontSize: 16, fontWeight: 600, flex: 1 }, children: "캐릭터 만들기" }),
              /* @__PURE__ */ l(
                "button",
                {
                  onClick: x,
                  style: Xn,
                  children: "기본값"
                }
              ),
              /* @__PURE__ */ l("button", { onClick: y, style: Xn, children: "닫기" })
            ] }),
            /* @__PURE__ */ b("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ l("label", { style: Pt, children: "이름" }),
              /* @__PURE__ */ l(
                "input",
                {
                  value: a.name,
                  onChange: (g) => c(g.target.value),
                  maxLength: 16,
                  style: {
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#f3f4f8",
                    fontFamily: "inherit",
                    fontSize: 13
                  }
                }
              )
            ] }),
            /* @__PURE__ */ b("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ l("label", { style: Pt, children: "색상" }),
              /* @__PURE__ */ l("div", { style: Io, children: Jl.map(({ key: g, label: m }) => /* @__PURE__ */ b("div", { style: Ao, children: [
                /* @__PURE__ */ l("span", { style: { flex: 1 }, children: m }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "color",
                    value: a.colors[g],
                    onChange: (w) => f(g, w.target.value),
                    style: {
                      width: 36,
                      height: 28,
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 6,
                      background: "transparent",
                      cursor: "pointer"
                    }
                  }
                )
              ] }, g)) })
            ] }),
            /* @__PURE__ */ b("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ l("label", { style: Pt, children: "헤어" }),
              /* @__PURE__ */ l("div", { style: To, children: Ql.map((g) => /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => d(g),
                  style: _o(a.hair === g),
                  children: Xl[g]
                },
                g
              )) })
            ] }),
            /* @__PURE__ */ b("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ l("label", { style: Pt, children: "표정" }),
              /* @__PURE__ */ l("div", { style: To, children: ec.map((g) => /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => p(g),
                  style: _o(a.face === g),
                  children: Kl[g]
                },
                g
              )) })
            ] }),
            /* @__PURE__ */ b("section", { children: [
              /* @__PURE__ */ l("label", { style: Pt, children: "장착 슬롯" }),
              /* @__PURE__ */ l("div", { style: Io, children: tc.map((g) => /* @__PURE__ */ b("div", { style: Ao, children: [
                /* @__PURE__ */ l("span", { style: { flex: 1 }, children: Zl[g] }),
                /* @__PURE__ */ l("span", { style: { color: u[g] ? "#7adf90" : "rgba(243,244,248,0.45)" }, children: u[g] ?? "비어있음" }),
                u[g] && /* @__PURE__ */ l("button", { onClick: () => h(g, null), style: Xn, children: "벗기" })
              ] }, g)) })
            ] })
          ]
        }
      )
    }
  );
}
const Pt = {
  display: "block",
  marginBottom: 6,
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: "rgba(243,244,248,0.62)"
}, Io = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, Ao = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 8
}, To = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
}, _o = (n) => ({
  padding: "6px 12px",
  borderRadius: 999,
  border: n ? "1px solid #ffd84a" : "1px solid rgba(255,255,255,0.14)",
  background: n ? "rgba(255,216,74,0.12)" : "rgba(255,255,255,0.04)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}), Xn = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
};
function nc(n) {
  return F(() => {
    switch (n) {
      case "long":
        return {
          geometry: new v.SphereGeometry(0.28, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
          position: [0, -0.05, 0],
          scale: [1.05, 1.55, 1.05]
        };
      case "cap":
        return {
          geometry: new v.CylinderGeometry(0.32, 0.34, 0.18, 16),
          position: [0, 0.1, 0],
          scale: [1, 1, 1]
        };
      case "bun":
        return {
          geometry: new v.SphereGeometry(0.22, 12, 10),
          position: [0, 0.18, -0.05],
          scale: [1, 1, 1]
        };
      case "spiky":
        return {
          geometry: new v.ConeGeometry(0.32, 0.36, 8),
          position: [0, 0.15, 0],
          scale: [1, 1, 1]
        };
      case "short":
      default:
        return {
          geometry: new v.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
          position: [0, 0.05, 0],
          scale: [1, 1, 1]
        };
    }
  }, [n]);
}
function ym({
  headHeight: n = 1.55,
  enabled: e = !0,
  opacity: t = 1
} = {}) {
  const r = E(null), o = je((d) => d.appearance), i = je((d) => d.outfits), { position: s, rotation: a } = yt({ updateInterval: 16 }), u = nc(o.hair);
  if (de(() => {
    const d = r.current;
    d && (d.position.set(s.x, s.y + n, s.z), d.rotation.set(0, a.y, 0));
  }), !e) return null;
  const c = !!i.hat, f = v.MathUtils.clamp(t, 0, 1);
  return /* @__PURE__ */ b("group", { ref: r, dispose: null, children: [
    !c && /* @__PURE__ */ b("mesh", { position: u.position, scale: u.scale, castShadow: !0, children: [
      /* @__PURE__ */ l("primitive", { object: u.geometry, attach: "geometry" }),
      /* @__PURE__ */ l(
        "meshStandardMaterial",
        {
          color: o.colors.hair,
          roughness: 0.85,
          metalness: 0.05,
          transparent: f < 1,
          opacity: f
        }
      )
    ] }),
    c && /* @__PURE__ */ b("group", { position: [0, 0.1, 0], children: [
      /* @__PURE__ */ b("mesh", { castShadow: !0, children: [
        /* @__PURE__ */ l("cylinderGeometry", { args: [0.34, 0.34, 0.22, 18] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: o.colors.hat,
            roughness: 0.7,
            metalness: 0.05,
            transparent: f < 1,
            opacity: f
          }
        )
      ] }),
      /* @__PURE__ */ b("mesh", { position: [0, -0.1, 0], children: [
        /* @__PURE__ */ l("cylinderGeometry", { args: [0.5, 0.5, 0.04, 24] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: o.colors.hat,
            roughness: 0.7,
            metalness: 0.05,
            transparent: f < 1,
            opacity: f
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ l(rc, { style: o.face, opacity: f })
  ] });
}
function rc({ style: n, opacity: e }) {
  const t = F(() => {
    switch (n) {
      case "smile":
        return "#ff8aa0";
      case "wink":
        return "#ffb04a";
      case "sleepy":
        return "#7d8ec8";
      case "surprised":
        return "#ffe066";
      default:
        return "#ffb6a8";
    }
  }, [n]);
  return /* @__PURE__ */ b("group", { position: [0, -0.18, 0.32], children: [
    /* @__PURE__ */ b("mesh", { position: [-0.13, 0, 0], children: [
      /* @__PURE__ */ l("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ l("meshBasicMaterial", { color: t, transparent: !0, opacity: e * 0.6 })
    ] }),
    /* @__PURE__ */ b("mesh", { position: [0.13, 0, 0], children: [
      /* @__PURE__ */ l("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ l("meshBasicMaterial", { color: t, transparent: !0, opacity: e * 0.6 })
    ] })
  ] });
}
function bm({
  capacity: n = 64,
  step: e = 0.55,
  lifetime: t = 9,
  size: r = 0.34,
  y: o = 0.02,
  color: i = "#1a1612"
} = {}) {
  const s = E(null), { position: a, isMoving: u, isGrounded: c } = yt({ updateInterval: 32 }), f = F(() => new v.Color(i), [i]), d = F(
    () => Array.from({ length: n }, () => ({
      x: 0,
      z: 0,
      bornAt: -1 / 0,
      side: 1
    })),
    [n]
  ), p = E(null), h = E(0), x = E(1), y = F(() => {
    const S = new v.PlaneGeometry(1, 1);
    return S.rotateX(-Math.PI / 2), S;
  }, []), g = F(
    () => new v.MeshBasicMaterial({
      color: f,
      transparent: !0,
      opacity: 0.42,
      depthWrite: !1,
      polygonOffset: !0,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    }),
    [f]
  );
  L(() => () => {
    y.dispose(), g.dispose();
  }, [y, g]);
  const m = F(() => new v.Object3D(), []), w = F(() => new v.Color(), []);
  return de((S) => {
    const C = s.current;
    if (!C) return;
    const T = S.clock.elapsedTime;
    if (c && u) {
      const _ = p.current, k = a.x - (_?.x ?? a.x), R = a.z - (_?.z ?? a.z), z = Math.hypot(k, R);
      if (!_ || z >= e) {
        const N = d[h.current];
        N && (N.x = a.x, N.z = a.z, N.bornAt = T, N.side = x.current, x.current = x.current === 1 ? -1 : 1, h.current = (h.current + 1) % n, p.current = { x: a.x, z: a.z });
      }
    }
    let M = 0;
    for (let _ = 0; _ < n; _++) {
      const k = d[_];
      if (!k) continue;
      const R = T - k.bornAt;
      if (R < 0 || R > t) continue;
      const z = 1 - R / t;
      m.position.set(k.x + k.side * 0.07, o, k.z), m.rotation.set(0, 0, 0), m.scale.set(r, 1, r * 1.4), m.updateMatrix(), C.setMatrixAt(M, m.matrix), w.copy(f).multiplyScalar(0.6 + z * 0.4), C.setColorAt(M, w), M++;
    }
    C.count = M, C.instanceMatrix.needsUpdate = !0, C.instanceColor && (C.instanceColor.needsUpdate = !0);
  }), /* @__PURE__ */ l(
    "instancedMesh",
    {
      ref: s,
      args: [y, g, n],
      frustumCulled: !1,
      renderOrder: 1
    }
  );
}
const vm = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
}, pn = "ko";
function oc() {
  if (typeof navigator > "u") return pn;
  const n = (navigator.language || pn).slice(0, 2).toLowerCase();
  return n === "ko" || n === "en" || n === "ja" ? n : pn;
}
function Kn(n, e) {
  return e ? n.replace(/\{(\w+)\}/g, (t, r) => {
    const o = e[r];
    return o == null ? `{${r}}` : String(o);
  }) : n;
}
const jt = we((n, e) => ({
  locale: oc(),
  bundle: { ko: {}, en: {}, ja: {} },
  setLocale: (t) => n({ locale: t }),
  registerMessages: (t, r) => {
    const o = e().bundle;
    n({
      bundle: {
        ...o,
        [t]: { ...o[t], ...r }
      }
    });
  },
  registerBundle: (t) => {
    const r = e().bundle, o = { ...r };
    Object.keys(t).forEach((i) => {
      const s = t[i];
      s && (o[i] = { ...r[i], ...s });
    }), n({ bundle: o });
  },
  t: (t, r) => {
    const { locale: o, bundle: i } = e(), s = i[o]?.[t];
    if (s !== void 0) return Kn(s, r);
    const a = i[pn]?.[t];
    return Kn(a !== void 0 ? a : t, r);
  },
  serialize: () => ({ version: 1, locale: e().locale }),
  hydrate: (t) => {
    !t || t.version !== 1 || n({ locale: t.locale });
  }
}));
function xm(n, e) {
  return jt.getState().t(n, e);
}
function wm() {
  const n = jt((t) => t.locale), e = jt((t) => t.bundle);
  return q(
    (t, r) => {
      const o = e[n]?.[t];
      if (o !== void 0) return Jn(o, r);
      const i = e.ko?.[t];
      return Jn(i !== void 0 ? i : t, r);
    },
    [n, e]
  );
}
function Sm() {
  const n = jt((t) => t.locale), e = jt((t) => t.setLocale);
  return { locale: n, setLocale: e };
}
function Jn(n, e) {
  return e ? n.replace(/\{(\w+)\}/g, (t, r) => {
    const o = e[r];
    return o == null ? `{${r}}` : String(o);
  }) : n;
}
const ic = [
  { id: "jump", label: "점프", key: " " },
  { id: "use", label: "사용", key: "F" }
];
function sc() {
  return typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(pointer: coarse)").matches;
}
function Po(n, e) {
  if (typeof window > "u") return;
  const t = /^[a-zA-Z]$/.test(e) ? `Key${e.toUpperCase()}` : e === " " ? "Space" : e, r = new KeyboardEvent(n, {
    key: e === " " ? " " : e.toLowerCase(),
    code: t,
    bubbles: !0
  });
  window.dispatchEvent(r);
}
function Mm({
  forceVisible: n = !1,
  radius: e = 60,
  deadzone: t = 0.18,
  runThreshold: r = 0.8,
  actions: o = ic
} = {}) {
  const [i, s] = Z(!1), a = E(null), u = E(null), c = E({
    pointerId: -1,
    cx: 0,
    cy: 0,
    forward: !1,
    backward: !1,
    leftward: !1,
    rightward: !1,
    run: !1
  });
  return L(() => {
    s(n || sc());
  }, [n]), L(() => {
    if (!i) return;
    const f = a.current, d = u.current;
    if (!f || !d) return;
    const p = Ji.getInstance(), h = () => {
      const m = c.current, w = {};
      m.forward && (w.forward = !1), m.backward && (w.backward = !1), m.leftward && (w.leftward = !1), m.rightward && (w.rightward = !1), m.run && (w.shift = !1), m.forward = m.backward = m.leftward = m.rightward = m.run = !1, Object.keys(w).length > 0 && p.updateKeyboard(w), d.style.transform = "translate(-50%, -50%)", c.current.pointerId = -1;
    }, x = (m) => {
      m.preventDefault();
      const w = f.getBoundingClientRect();
      c.current.cx = w.left + w.width / 2, c.current.cy = w.top + w.height / 2, c.current.pointerId = m.pointerId, f.setPointerCapture(m.pointerId), y(m);
    }, y = (m) => {
      if (m.pointerId !== c.current.pointerId) return;
      const w = m.clientX - c.current.cx, S = m.clientY - c.current.cy, C = Math.hypot(w, S), T = Math.min(C, e), M = Math.atan2(S, w), _ = Math.cos(M) * T, k = Math.sin(M) * T;
      d.style.transform = `translate(calc(-50% + ${_}px), calc(-50% + ${k}px))`;
      const R = T / e, z = c.current, N = {};
      if (R < t)
        z.forward && (N.forward = !1, z.forward = !1), z.backward && (N.backward = !1, z.backward = !1), z.leftward && (N.leftward = !1, z.leftward = !1), z.rightward && (N.rightward = !1, z.rightward = !1), z.run && (N.shift = !1, z.run = !1);
      else {
        const P = Math.cos(M), B = Math.sin(M), U = B < -0.35, W = B > 0.35, H = P < -0.35, I = P > 0.35, G = R >= r;
        z.forward !== U && (N.forward = U, z.forward = U), z.backward !== W && (N.backward = W, z.backward = W), z.leftward !== H && (N.leftward = H, z.leftward = H), z.rightward !== I && (N.rightward = I, z.rightward = I), z.run !== G && (N.shift = G, z.run = G);
      }
      Object.keys(N).length > 0 && p.updateKeyboard(N);
    }, g = (m) => {
      m.pointerId === c.current.pointerId && h();
    };
    return f.addEventListener("pointerdown", x), f.addEventListener("pointermove", y), f.addEventListener("pointerup", g), f.addEventListener("pointercancel", g), f.addEventListener("pointerleave", g), () => {
      f.removeEventListener("pointerdown", x), f.removeEventListener("pointermove", y), f.removeEventListener("pointerup", g), f.removeEventListener("pointercancel", g), f.removeEventListener("pointerleave", g), h();
    };
  }, [i, e, t, r]), i ? /* @__PURE__ */ b(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 90,
        pointerEvents: "none",
        fontFamily: "'Pretendard', system-ui, sans-serif"
      },
      children: [
        /* @__PURE__ */ l(
          "div",
          {
            ref: a,
            style: {
              position: "absolute",
              left: 24,
              bottom: 24,
              width: e * 2,
              height: e * 2,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(20,22,30,0.32)",
              backdropFilter: "blur(14px) saturate(140%)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
              touchAction: "none",
              pointerEvents: "auto"
            },
            children: /* @__PURE__ */ l(
              "div",
              {
                ref: u,
                style: {
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: e * 0.85,
                  height: e * 0.85,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.55)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.28)",
                  transform: "translate(-50%, -50%)",
                  transition: "transform 0.04s linear",
                  pointerEvents: "none"
                }
              }
            )
          }
        ),
        /* @__PURE__ */ l(
          "div",
          {
            style: {
              position: "absolute",
              right: 20,
              bottom: 32,
              display: "grid",
              gridTemplateColumns: "repeat(2, auto)",
              gap: 12,
              pointerEvents: "auto"
            },
            children: o.map((f) => /* @__PURE__ */ l(ac, { action: f }, f.id))
          }
        )
      ]
    }
  ) : null;
}
function ac({ action: n }) {
  const [e, t] = Z(!1), r = () => {
    t(!0), n.key && Po("keydown", n.key), n.onPress?.();
  }, o = () => {
    t(!1), n.key && Po("keyup", n.key), n.onRelease?.();
  };
  return /* @__PURE__ */ l(
    "button",
    {
      type: "button",
      onPointerDown: (i) => {
        i.preventDefault(), r();
      },
      onPointerUp: (i) => {
        i.preventDefault(), o();
      },
      onPointerCancel: o,
      onPointerLeave: () => {
        e && o();
      },
      style: {
        width: 64,
        height: 64,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.22)",
        background: e ? "rgba(255,216,74,0.32)" : "rgba(20,22,30,0.42)",
        color: "#f3f4f8",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        touchAction: "none",
        userSelect: "none"
      },
      children: n.label
    }
  );
}
const lc = ["intel", "mali", "adreno 3", "adreno 4", "powervr"], cc = ["swiftshader", "llvmpipe", "software"], Ro = ["rtx", "radeon rx", "apple m", "apple a1", "apple a2"];
function uc() {
  if (typeof window > "u" || typeof document > "u")
    return {
      webgl2: !1,
      maxTextureSize: 0,
      rendererName: "",
      vendorName: "",
      cores: 4,
      memory: 4,
      isMobile: !1,
      pixelRatio: 1
    };
  const n = document.createElement("canvas"), e = n.getContext("webgl2") ?? n.getContext("webgl");
  let t = "", r = "", o = 0, i = !1;
  if (e) {
    i = typeof WebGL2RenderingContext < "u" && e instanceof WebGL2RenderingContext, o = e.getParameter(e.MAX_TEXTURE_SIZE) || 0;
    const f = e.getExtension("WEBGL_debug_renderer_info");
    f && (t = String(e.getParameter(f.UNMASKED_RENDERER_WEBGL) || ""), r = String(e.getParameter(f.UNMASKED_VENDOR_WEBGL) || ""));
  }
  const s = navigator.hardwareConcurrency ?? 4, a = navigator.deviceMemory ?? 4, u = /android|iphone|ipad|ipod|mobile|opera mini/i.test(navigator.userAgent), c = Math.min(window.devicePixelRatio || 1, 2);
  return {
    webgl2: i,
    maxTextureSize: o,
    rendererName: t,
    vendorName: r,
    cores: s,
    memory: a,
    isMobile: u,
    pixelRatio: c
  };
}
function dc(n) {
  const e = n.rendererName.toLowerCase();
  return cc.some((t) => e.includes(t)) ? "low" : n.isMobile ? Ro.some((t) => e.includes(t)) ? "medium" : "low" : lc.some((t) => e.includes(t)) ? n.cores >= 8 && n.memory >= 8 ? "medium" : "low" : Ro.some((t) => e.includes(t)) || n.cores >= 8 && n.memory >= 8 && n.webgl2 ? "high" : n.cores >= 4 && n.memory >= 4 ? "medium" : "low";
}
function Ur(n) {
  return n === "high" ? {
    tier: n,
    instanceScale: 1,
    pixelRatio: 2,
    shadowMapSize: 2048,
    postprocess: !0,
    outline: !0
  } : n === "medium" ? {
    tier: n,
    instanceScale: 0.7,
    pixelRatio: 1.5,
    shadowMapSize: 1024,
    postprocess: !0,
    outline: !0
  } : {
    tier: n,
    instanceScale: 0.4,
    pixelRatio: 1,
    shadowMapSize: 512,
    postprocess: !1,
    outline: !1
  };
}
function No() {
  const n = uc(), e = dc(n);
  return { profile: Ur(e), capabilities: n };
}
const fc = Ur("medium"), pc = we((n) => ({
  profile: fc,
  capabilities: null,
  manualOverride: !1,
  detect: () => {
    const { profile: e, capabilities: t } = No();
    n({ profile: e, capabilities: t, manualOverride: !1 });
  },
  setTier: (e) => {
    n({ profile: Ur(e), manualOverride: !0 });
  },
  resetAuto: () => {
    const { profile: e, capabilities: t } = No();
    n({ profile: e, capabilities: t, manualOverride: !1 });
  }
})), rn = "outdoor", Qn = (n) => new Promise((e) => setTimeout(e, n)), mc = 220, hc = 80, gc = 240, st = we((n, e) => ({
  current: rn,
  pending: null,
  scenes: {
    [rn]: { id: rn, name: "Outdoor", interior: !1 }
  },
  transition: { progress: 0, color: "#000000", active: !1 },
  lastReturnPoint: null,
  registerScene: (t) => n((r) => r.scenes[t.id] ? r : { scenes: { ...r.scenes, [t.id]: t } }),
  unregisterScene: (t) => n((r) => {
    if (t === rn || !r.scenes[t]) return r;
    const o = { ...r.scenes };
    return delete o[t], { scenes: o };
  }),
  setTransition: (t) => n((r) => ({ transition: { ...r.transition, ...t } })),
  setReturnPoint: (t) => n({ lastReturnPoint: t }),
  goTo: async (t, r) => {
    const o = e();
    if (o.pending || t === o.current && !r?.entry) return;
    const i = o.scenes[t];
    if (!i) {
      console.warn(`[scene] Unknown scene "${t}". Did you forget to register it?`);
      return;
    }
    const a = i.interior ?? !1 ? "#0d0d10" : "#f5f5f5";
    n({ pending: t, transition: { active: !0, color: a, progress: 0 } });
    const u = performance.now();
    for (; ; ) {
      const f = Math.min(1, (performance.now() - u) / mc);
      if (e().setTransition({ progress: f }), f >= 1) break;
      await Qn(16);
    }
    r?.saveReturn && n({ lastReturnPoint: r.saveReturn }), n({ current: t }), await Qn(hc);
    const c = performance.now();
    for (; ; ) {
      const f = Math.min(1, (performance.now() - c) / gc);
      if (e().setTransition({ progress: 1 - f }), f >= 1) break;
      await Qn(16);
    }
    n({ pending: null, transition: { active: !1, color: a, progress: 0 } });
  },
  serialize: () => ({ version: 1, current: e().current }),
  hydrate: (t) => {
    !t || t.version !== 1 || e().scenes[t.current] && n({ current: t.current, pending: null });
  }
}));
function yc(n, e) {
  if (n === e) return !0;
  if (n.size !== e.size) return !1;
  for (const t of n)
    if (!e.has(t)) return !1;
  return !0;
}
const Ye = we((n) => ({
  rooms: /* @__PURE__ */ new Map(),
  portals: /* @__PURE__ */ new Map(),
  currentRoomId: null,
  visibleRoomIds: /* @__PURE__ */ new Set(),
  initializedSceneId: null,
  registerRoom: (e) => n((t) => {
    const r = new Map(t.rooms);
    return r.set(e.id, e), { rooms: r };
  }),
  unregisterRoom: (e) => n((t) => {
    if (!t.rooms.has(e)) return t;
    const r = new Map(t.rooms);
    return r.delete(e), {
      rooms: r,
      currentRoomId: t.currentRoomId === e ? null : t.currentRoomId
    };
  }),
  registerPortal: (e) => n((t) => {
    const r = new Map(t.portals);
    return r.set(e.id, e), { portals: r };
  }),
  unregisterPortal: (e) => n((t) => {
    if (!t.portals.has(e)) return t;
    const r = new Map(t.portals);
    return r.delete(e), { portals: r };
  }),
  setVisibleRooms: (e, t, r) => n((o) => o.initializedSceneId === e && o.currentRoomId === t && yc(o.visibleRoomIds, r) ? o : {
    initializedSceneId: e,
    currentRoomId: t,
    visibleRoomIds: r
  }),
  reset: () => n({
    currentRoomId: null,
    visibleRoomIds: /* @__PURE__ */ new Set(),
    initializedSceneId: null
  })
}));
function Cm({ zIndex: n = 9999 } = {}) {
  const e = st((t) => t.transition);
  return !e.active && e.progress <= 1e-3 ? null : /* @__PURE__ */ l(
    "div",
    {
      "aria-hidden": !0,
      style: {
        position: "fixed",
        inset: 0,
        background: e.color,
        opacity: e.progress,
        pointerEvents: e.progress > 0.5 ? "auto" : "none",
        zIndex: n,
        transition: "background-color 80ms linear"
      }
    }
  );
}
function km({ scene: n, children: e }) {
  const t = st((i) => i.registerScene), r = st((i) => i.unregisterScene), o = st((i) => i.current);
  return L(() => (t(n), () => r(n.id)), [n, t, r]), o !== n.id ? null : /* @__PURE__ */ l(Se, { children: e });
}
function Im({
  position: n,
  sceneId: e,
  entry: t,
  exitOverride: r,
  radius: o = 1.4,
  cooldownMs: i = 800,
  color: s = "#5a8acf",
  label: a
}) {
  const u = st((y) => y.goTo), c = st((y) => y.current), { teleport: f } = ti(), { position: d } = yt({ updateInterval: 50 }), p = E(0), h = F(() => new v.CylinderGeometry(o, o, 0.08, 28), [o]);
  L(() => () => h.dispose(), [h]), de(() => {
    const y = performance.now();
    if (y - p.current < i) return;
    const g = d.x - n[0], m = d.z - n[2];
    g * g + m * m > o * o || (p.current = y, c !== e && x());
  });
  async function x() {
    const y = r ?? {
      position: [n[0], n[1], n[2]]
    };
    await u(e, { entry: t, saveReturn: y });
    const g = new v.Vector3(t.position[0], t.position[1], t.position[2]);
    f(g);
  }
  return /* @__PURE__ */ b("group", { position: n, children: [
    /* @__PURE__ */ l("mesh", { rotation: [0, 0, 0], geometry: h, children: /* @__PURE__ */ l(
      "meshStandardMaterial",
      {
        color: s,
        emissive: s,
        emissiveIntensity: 0.35,
        transparent: !0,
        opacity: 0.6
      }
    ) }),
    a && /* @__PURE__ */ b("mesh", { position: [0, 1.3, 0], children: [
      /* @__PURE__ */ l("boxGeometry", { args: [0.04, 0.6, 0.04] }),
      /* @__PURE__ */ l("meshStandardMaterial", { color: s, emissive: s, emissiveIntensity: 0.4 })
    ] })
  ] });
}
function Am({ sceneId: n, roomId: e, bounds: t, children: r }) {
  const o = st((c) => c.current), i = Ye((c) => c.registerRoom), s = Ye((c) => c.unregisterRoom), a = Ye((c) => c.initializedSceneId), u = Ye((c) => c.visibleRoomIds);
  return L(() => (i({ id: e, sceneId: n, bounds: t }), () => s(e)), [e, n, t, i, s]), o !== n ? null : a !== n ? /* @__PURE__ */ l(Se, { children: r }) : u.has(e) ? /* @__PURE__ */ l(Se, { children: r }) : null;
}
function Tm({
  id: n,
  sceneId: e,
  fromRoomId: t,
  toRoomId: r,
  position: o,
  radius: i,
  revealDistance: s
}) {
  const a = Ye((c) => c.registerPortal), u = Ye((c) => c.unregisterPortal);
  return L(() => (a({
    id: n,
    sceneId: e,
    fromRoomId: t,
    toRoomId: r,
    position: o,
    ...i !== void 0 ? { radius: i } : {},
    ...s !== void 0 ? { revealDistance: s } : {}
  }), () => u(n)), [n, e, t, r, o, i, s, a, u]), null;
}
const bc = 0.12;
function vc(n, e) {
  return n.x >= e.min[0] && n.x <= e.max[0] && n.y >= e.min[1] && n.y <= e.max[1] && n.z >= e.min[2] && n.z <= e.max[2];
}
function fi(n, e, t) {
  for (const r of e)
    if (r.sceneId === n && vc(t, r.bounds))
      return r.id;
  return null;
}
function xc(n) {
  const e = n.rooms.filter((i) => i.sceneId === n.sceneId);
  if (e.length === 0) return /* @__PURE__ */ new Set();
  const t = fi(n.sceneId, e, n.position);
  if (!t)
    return new Set(e.map((i) => i.id));
  const r = /* @__PURE__ */ new Set([t]), o = n.portals.filter((i) => i.sceneId === n.sceneId);
  for (const i of o) {
    const s = i.revealDistance ?? 3.8, a = n.position.x - i.position[0], u = n.position.y - i.position[1], c = n.position.z - i.position[2];
    a * a + u * u + c * c > s * s || (i.fromRoomId === t ? r.add(i.toRoomId) : i.toRoomId === t && r.add(i.fromRoomId));
  }
  return r;
}
function _m() {
  const n = st((a) => a.current), e = Ye((a) => a.rooms), t = Ye((a) => a.portals), r = Ye((a) => a.setVisibleRooms), o = Ye((a) => a.reset), { position: i } = yt({ updateInterval: 50 }), s = E(0);
  return L(() => o, [o]), de((a, u) => {
    if (s.current += Math.max(0, u), s.current < bc) return;
    s.current = 0;
    const c = Array.from(e.values()), f = Array.from(t.values()), d = fi(n, c, i), p = xc({
      sceneId: n,
      rooms: c,
      portals: f,
      position: i
    });
    r(n, d, p);
  }), null;
}
const er = new v.Color("#0a1430"), wc = new v.Color("#ffb377"), Sc = new v.Color("#ff7a52"), Mc = new v.Color("#5b6975"), Cc = new v.Color("#dde7f0"), kc = new v.Color("#3b4452");
function Ic(n, e) {
  const t = n + e / 60;
  return t < 5 ? { t: 0, phase: "night" } : t < 7 ? { t: (t - 5) / 2, phase: "dawn" } : t < 17 ? { t: 1, phase: "day" } : t < 19 ? { t: 1 - (t - 17) / 2, phase: "dusk" } : { t: 0, phase: "night" };
}
function Pm({
  color: n = "#cfd8e3",
  near: e = 35,
  far: t = 220,
  enabled: r = !0
} = {}) {
  const o = Je((u) => u.scene), i = ve((u) => u.time.hour), s = ve((u) => u.time.minute), a = Ge((u) => u.current);
  return L(() => {
    if (!r) return;
    const u = new v.Color(n), c = Ic(i, s), f = u.clone();
    c.phase === "night" ? f.copy(er) : c.phase === "dawn" ? f.lerpColors(er, wc, c.t) : c.phase === "dusk" ? f.lerpColors(er, Sc, c.t) : f.lerp(u, 0.85);
    let d = e, p = t;
    if (c.phase === "night" ? (d = e * 0.45, p = t * 0.55) : (c.phase === "dawn" || c.phase === "dusk") && (d = e * (0.55 + 0.45 * c.t), p = t * (0.7 + 0.3 * c.t)), a) {
      const h = Math.max(0, Math.min(1, a.intensity));
      a.kind === "rain" ? (f.lerp(Mc, 0.5 + h * 0.3), d *= 0.7 - h * 0.2, p *= 0.65 - h * 0.2) : a.kind === "storm" ? (f.lerp(kc, 0.6 + h * 0.3), d *= 0.55 - h * 0.2, p *= 0.5 - h * 0.2) : a.kind === "snow" && (f.lerp(Cc, 0.5 + h * 0.25), d *= 0.75, p *= 0.7);
    }
    d = Math.max(2, d), p = Math.max(d + 5, p), o.fog instanceof v.Fog ? (o.fog.color.copy(f), o.fog.near = d, o.fog.far = p) : o.fog = new v.Fog(f.getHex(), d, p), o.background = null;
  }, [o, n, e, t, r, i, s, a?.kind, a?.intensity]), null;
}
const Ac = [
  { hour: 0, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: -Math.PI / 2, elevation: -0.3 },
  { hour: 5, sunColor: "#3b3a5a", ambientColor: "#28304a", sunIntensity: 0.15, ambientIntensity: 0.22, azimuth: -Math.PI / 3, elevation: -0.05 },
  { hour: 7, sunColor: "#ffb27a", ambientColor: "#7a8aa6", sunIntensity: 0.55, ambientIntensity: 0.3, azimuth: -Math.PI / 4, elevation: 0.25 },
  { hour: 10, sunColor: "#fff1c8", ambientColor: "#aab4c8", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: -Math.PI / 8, elevation: 0.7 },
  { hour: 13, sunColor: "#ffffff", ambientColor: "#b6c2d8", sunIntensity: 1.05, ambientIntensity: 0.38, azimuth: 0, elevation: 1.05 },
  { hour: 16, sunColor: "#ffe0a8", ambientColor: "#a8b4cc", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: Math.PI / 6, elevation: 0.65 },
  { hour: 18, sunColor: "#ff9a5a", ambientColor: "#806a8a", sunIntensity: 0.55, ambientIntensity: 0.28, azimuth: Math.PI / 3, elevation: 0.18 },
  { hour: 20, sunColor: "#5a3f6a", ambientColor: "#34304a", sunIntensity: 0.18, ambientIntensity: 0.22, azimuth: Math.PI / 2, elevation: -0.05 },
  { hour: 24, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: 3 * Math.PI / 4, elevation: -0.3 }
], Eo = {
  spring: new v.Color("#fff0f5"),
  summer: new v.Color("#fff5d8"),
  autumn: new v.Color("#ffd9b0"),
  winter: new v.Color("#dfe8f5")
}, Bo = {
  sunny: { sun: 1, ambient: 1, tint: new v.Color("#ffffff") },
  cloudy: { sun: 0.55, ambient: 0.95, tint: new v.Color("#cfd6e2") },
  rain: { sun: 0.3, ambient: 0.85, tint: new v.Color("#90a0b8") },
  snow: { sun: 0.65, ambient: 1.1, tint: new v.Color("#dfeaf5") },
  storm: { sun: 0.2, ambient: 0.75, tint: new v.Color("#5a6a82") }
};
function Tc(n, e) {
  const t = n, r = (e % 24 + 24) % 24;
  let o = t[0], i = t[t.length - 1];
  for (let u = 0; u < t.length - 1; u += 1) {
    const c = t[u], f = t[u + 1];
    if (r >= c.hour && r <= f.hour) {
      o = c, i = f;
      break;
    }
  }
  const s = Math.max(1e-4, i.hour - o.hour), a = v.MathUtils.clamp((r - o.hour) / s, 0, 1);
  return {
    hour: r,
    sunColor: o.sunColor,
    ambientColor: o.ambientColor,
    sunIntensity: v.MathUtils.lerp(o.sunIntensity, i.sunIntensity, a),
    ambientIntensity: v.MathUtils.lerp(o.ambientIntensity, i.ambientIntensity, a),
    azimuth: v.MathUtils.lerp(o.azimuth, i.azimuth, a),
    elevation: v.MathUtils.lerp(o.elevation, i.elevation, a)
    // Mix colors via THREE.Color outside this scope to avoid string allocations.
  };
}
function Rm({
  rigDistance: n = 60,
  castShadow: e = !0,
  shadowMapSize: t = 1024,
  keyframes: r,
  damping: o = 0.12
} = {}) {
  const i = E(null), s = E(null), a = F(() => (r ?? Ac).slice().sort((h, x) => h.hour - x.hour), [r]), u = F(() => new v.Color(), []), c = F(() => new v.Color(), []), f = F(() => new v.Color(), []), d = F(() => new v.Color(), []);
  return de(() => {
    const p = i.current, h = s.current;
    if (!p || !h) return;
    const x = ve.getState().time, y = Ge.getState().current, g = y?.kind ?? "sunny", m = v.MathUtils.clamp(y?.intensity ?? 0.5, 0, 1), w = Bo[g] ?? Bo.sunny, S = Eo[x.season] ?? Eo.spring, C = Tc(a, x.hour + x.minute / 60);
    f.set(C.sunColor).lerp(S, 0.18).lerp(w.tint, 0.35 + 0.25 * m), d.set(C.ambientColor).lerp(S, 0.2).lerp(w.tint, 0.3 + 0.3 * m);
    const T = v.MathUtils.clamp(o, 0.01, 1);
    u.copy(p.color).lerp(f, T), c.copy(h.color).lerp(d, T), p.color.copy(u), h.color.copy(c);
    const M = v.MathUtils.lerp(1, w.sun, 0.5 + 0.5 * m), _ = v.MathUtils.lerp(1, w.ambient, 0.5 + 0.5 * m);
    p.intensity = v.MathUtils.lerp(p.intensity, C.sunIntensity * M, T), h.intensity = v.MathUtils.lerp(h.intensity, C.ambientIntensity * _, T);
    const k = Math.cos(C.elevation), R = Math.sin(C.elevation), z = Math.cos(C.azimuth) * k * n, N = Math.sin(C.azimuth) * k * n, P = Math.max(2, R * n);
    p.position.set(z, P, N), p.target.position.set(0, 0, 0), p.target.updateMatrixWorld();
  }), /* @__PURE__ */ b(Se, { children: [
    /* @__PURE__ */ l("ambientLight", { ref: s, intensity: 0.3, color: "#b6c2d8" }),
    /* @__PURE__ */ l(
      "directionalLight",
      {
        ref: i,
        castShadow: e,
        "shadow-mapSize": [t, t],
        "shadow-normalBias": 0.06,
        "shadow-camera-near": 1,
        "shadow-camera-far": Math.max(120, n * 2),
        "shadow-camera-top": 90,
        "shadow-camera-right": 90,
        "shadow-camera-bottom": -90,
        "shadow-camera-left": -90,
        intensity: 0.8,
        color: "#ffffff",
        position: [20, 30, 10]
      }
    )
  ] });
}
function _e({ label: n, min: e, max: t, step: r, value: o, suffix: i, onChange: s }) {
  return /* @__PURE__ */ b("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#fff" }, children: [
    /* @__PURE__ */ l("span", { style: { width: 60, flexShrink: 0, color: "rgba(255,255,255,0.7)" }, children: n }),
    /* @__PURE__ */ l(
      "input",
      {
        type: "range",
        min: e,
        max: t,
        step: r,
        value: o,
        onChange: (a) => s(Number(a.target.value)),
        style: { flex: 1, accentColor: "#0078d4" }
      }
    ),
    /* @__PURE__ */ b("span", { style: { width: 44, textAlign: "right", fontFamily: "monospace", fontSize: 11 }, children: [
      typeof r == "number" && r < 1 ? o.toFixed(2) : o,
      i ?? ""
    ] })
  ] });
}
function tr({ label: n, checked: e, onChange: t }) {
  return /* @__PURE__ */ b("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#fff" }, children: [
    /* @__PURE__ */ l("input", { type: "checkbox", checked: e, onChange: (r) => t(r.target.checked), style: { accentColor: "#0078d4" } }),
    /* @__PURE__ */ l("span", { children: n })
  ] });
}
function Rt({ title: n, children: e }) {
  return /* @__PURE__ */ b("div", { style: {
    background: "rgba(0,0,0,0.2)",
    borderRadius: 6,
    padding: "8px 10px",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 6
  }, children: [
    /* @__PURE__ */ l("div", { style: { fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 }, children: n }),
    e
  ] });
}
function _c() {
  const n = pe((s) => s.cameraOption), e = pe((s) => s.setCameraOption), t = pe((s) => s.mode), r = q((s, a) => {
    e({ [s]: a });
  }, [e]), o = q((s, a) => {
    e({ smoothing: { ...n.smoothing, [s]: a } });
  }, [e, n.smoothing]), i = (s) => n[s] ?? 0;
  return /* @__PURE__ */ b("div", { style: { padding: 10, display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ b("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: -4 }, children: [
      "Mode: ",
      t.control ?? "thirdPerson"
    ] }),
    /* @__PURE__ */ b(Rt, { title: "Distance", children: [
      /* @__PURE__ */ l(_e, { label: "X", min: -50, max: 50, step: 1, value: i("xDistance"), onChange: (s) => r("xDistance", s) }),
      /* @__PURE__ */ l(_e, { label: "Y", min: 0, max: 50, step: 1, value: i("yDistance"), onChange: (s) => r("yDistance", s) }),
      /* @__PURE__ */ l(_e, { label: "Z", min: -50, max: 50, step: 1, value: i("zDistance"), onChange: (s) => r("zDistance", s) })
    ] }),
    /* @__PURE__ */ b(Rt, { title: "FOV / Smoothing", children: [
      /* @__PURE__ */ l(_e, { label: "FOV", min: 30, max: 120, step: 5, value: n.fov ?? 75, suffix: "deg", onChange: (s) => r("fov", s) }),
      /* @__PURE__ */ l(_e, { label: "Pos", min: 0.01, max: 1, step: 0.01, value: n.smoothing?.position ?? 0.1, onChange: (s) => o("position", s) }),
      /* @__PURE__ */ l(_e, { label: "Rot", min: 0.01, max: 1, step: 0.01, value: n.smoothing?.rotation ?? 0.1, onChange: (s) => o("rotation", s) }),
      /* @__PURE__ */ l(_e, { label: "FOV Sm", min: 0.01, max: 1, step: 0.01, value: n.smoothing?.fov ?? 0.2, onChange: (s) => o("fov", s) })
    ] }),
    /* @__PURE__ */ b(Rt, { title: "Zoom", children: [
      /* @__PURE__ */ l(tr, { label: "Enable Zoom", checked: n.enableZoom ?? !1, onChange: (s) => r("enableZoom", s) }),
      /* @__PURE__ */ l(_e, { label: "Speed", min: 1e-4, max: 0.01, step: 1e-4, value: n.zoomSpeed ?? 1e-3, onChange: (s) => r("zoomSpeed", s) }),
      /* @__PURE__ */ l(_e, { label: "Min", min: 0.1, max: 2, step: 0.1, value: n.minZoom ?? 0.5, onChange: (s) => r("minZoom", s) }),
      /* @__PURE__ */ l(_e, { label: "Max", min: 1, max: 5, step: 0.1, value: n.maxZoom ?? 2, onChange: (s) => r("maxZoom", s) })
    ] }),
    /* @__PURE__ */ b(Rt, { title: "Options", children: [
      /* @__PURE__ */ l(tr, { label: "Collision", checked: n.enableCollision ?? !1, onChange: (s) => r("enableCollision", s) }),
      /* @__PURE__ */ l(tr, { label: "Focus Mode", checked: n.enableFocus ?? !1, onChange: (s) => r("enableFocus", s) }),
      /* @__PURE__ */ l(_e, { label: "Focus Dist", min: 1, max: 50, step: 1, value: n.focusDistance ?? 15, onChange: (s) => r("focusDistance", s) }),
      /* @__PURE__ */ l(_e, { label: "Max Dist", min: 5, max: 100, step: 1, value: n.maxDistance ?? 50, onChange: (s) => r("maxDistance", s) })
    ] }),
    /* @__PURE__ */ b(Rt, { title: "Bounds", children: [
      /* @__PURE__ */ l(_e, { label: "Min Y", min: -10, max: 50, step: 1, value: n.bounds?.minY ?? 2, onChange: (s) => e({ bounds: { ...n.bounds, minY: s } }) }),
      /* @__PURE__ */ l(_e, { label: "Max Y", min: 5, max: 100, step: 1, value: n.bounds?.maxY ?? 50, onChange: (s) => e({ bounds: { ...n.bounds, maxY: s } }) })
    ] })
  ] });
}
function Pc() {
  const [n, e] = Z("Settings");
  return /* @__PURE__ */ b("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ b("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Settings" ? "active" : ""}`, onClick: () => e("Settings"), children: "Settings" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Presets" ? "active" : ""}`, onClick: () => e("Presets"), children: "Presets" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ l("div", { className: "panel-tab-content", children: (() => {
      switch (n) {
        case "Settings":
          return /* @__PURE__ */ l(_c, {});
        case "Controller":
          return /* @__PURE__ */ l(Xs, {});
        case "Presets":
          return /* @__PURE__ */ l(na, {});
        case "Debug":
          return /* @__PURE__ */ l(Js, {});
        default:
          return null;
      }
    })() })
  ] });
}
function Rc() {
  const [n, e] = Z("Player");
  return /* @__PURE__ */ b("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ b("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Player" ? "active" : ""}`, onClick: () => e("Player"), children: "Player" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ l("div", { className: "panel-tab-content", children: (() => {
      switch (n) {
        case "Player":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(Vs, {}) });
        case "Controller":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(Us, {}) });
        case "Debug":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(Ys, {}) });
        default:
          return null;
      }
    })() })
  ] });
}
function Nc() {
  const [n, e] = Z("Controller");
  return /* @__PURE__ */ b("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ b("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ l("div", { className: "panel-tab-content", children: (() => {
      switch (n) {
        case "Controller":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(ni, {}) });
        case "Debug":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(oi, { embedded: !0 }) });
        default:
          return null;
      }
    })() })
  ] });
}
const on = 60, sn = ({ data: n, color: e, max: t, warn: r }) => {
  const i = n.filter((u) => isFinite(u));
  if (i.length < 2) return null;
  const s = Math.max(1, t), a = i.map((u, c) => {
    const f = c / (i.length - 1) * 100, d = 40 - u / s * 40;
    return `${c === 0 ? "M" : "L"}${f.toFixed(2)},${d.toFixed(2)}`;
  }).join(" ");
  return /* @__PURE__ */ l("div", { className: "perf-chart", children: /* @__PURE__ */ b("svg", { width: "100%", height: 40, preserveAspectRatio: "none", viewBox: "0 0 100 40", children: [
    r !== void 0 && /* @__PURE__ */ l(
      "line",
      {
        x1: "0",
        y1: 40 - r / s * 40,
        x2: "100",
        y2: 40 - r / s * 40,
        stroke: "#facc15",
        strokeWidth: "0.5",
        strokeDasharray: "3,3",
        opacity: 0.5
      }
    ),
    /* @__PURE__ */ l("path", { d: a, fill: "none", stroke: e, strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" })
  ] }) });
}, nr = ({ value: n, max: e, color: t, label: r }) => {
  const o = e > 0 ? Math.min(100, n / e * 100) : 0;
  return /* @__PURE__ */ b("div", { style: { marginBottom: 4 }, children: [
    /* @__PURE__ */ b("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }, children: [
      /* @__PURE__ */ l("span", { className: "perf-label", children: r }),
      /* @__PURE__ */ l("span", { children: n.toFixed(1) })
    ] }),
    /* @__PURE__ */ l("div", { style: { height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }, children: /* @__PURE__ */ l("div", { style: { width: `${o}%`, height: "100%", background: t, borderRadius: 2, transition: "width 0.3s" } }) })
  ] });
};
function Ec() {
  const n = pe(ei((B) => B.performance)), [e, t] = Z({ current: 0, min: 1 / 0, max: 0, avg: 0, p1Low: 0, history: Array(on).fill(0) }), [r, o] = Z({ used: 0, limit: 0, history: Array(on).fill(0) }), [i, s] = Z(0), [a, u] = Z(Array(on).fill(0)), [c, f] = Z(Array(on).fill(0)), d = E(0), p = E(0), h = E(0), x = E([]), y = E(0), g = E(null), m = E(0), w = E(0), S = E(0), C = q((B) => {
    if (B.length < 5) return 0;
    const U = [...B].filter((I) => I > 0).sort((I, G) => I - G), W = Math.max(1, Math.floor(U.length * 0.01));
    let H = 0;
    for (let I = 0; I < W; I++) H += U[I] ?? 0;
    return H / W;
  }, []);
  L(() => {
    const B = window.performance.now();
    d.current = B, p.current = B, y.current = B;
    const U = (W) => {
      const H = W - p.current;
      if (p.current = W, x.current.push(H), x.current.length > 300 && x.current.shift(), m.current += H, w.current++, w.current >= 10) {
        const I = m.current / w.current;
        s(I), f((G) => [...G.slice(1), I]), m.current = 0, w.current = 0;
      }
      if (h.current++, W - d.current >= 500) {
        const I = h.current * 1e3 / (W - d.current), G = x.current.map((X) => X > 0 ? 1e3 / X : 0), V = W - y.current > 3e3;
        t((X) => {
          const K = [...X.history.slice(1), I], Q = V ? Math.min(X.min === 1 / 0 ? I : X.min, I) : 1 / 0, ee = V ? Math.max(X.max, I) : 0, se = V ? K.filter((j) => j > 0) : [], oe = se.length > 0 ? se.reduce((j, ue) => j + ue, 0) / se.length : I, he = V ? C(G) : I;
          return { current: I, min: Q, max: ee, avg: oe, p1Low: he, history: K };
        });
        const J = window.performance.memory;
        J && o((X) => {
          const K = Math.round(J.usedJSHeapSize / 1048576), Q = Math.round(J.jsHeapSizeLimit / 1048576);
          return { used: K, limit: Q, history: [...X.history.slice(1), K] };
        }), d.current = W, h.current = 0;
      }
      g.current = requestAnimationFrame(U);
    };
    return g.current = requestAnimationFrame(U), () => {
      g.current && cancelAnimationFrame(g.current);
    };
  }, [C]), L(() => {
    const B = n.render.calls;
    B !== S.current && (S.current = B, u((U) => [...U.slice(1), B]));
  }, [n.render.calls]);
  const T = (B) => B >= 55 ? "#4ade80" : B >= 30 ? "#facc15" : "#f87171", M = (B) => B <= 16.7 ? "#4ade80" : B <= 33.3 ? "#facc15" : "#f87171", _ = (B) => B <= 100 ? "#4ade80" : B <= 300 ? "#facc15" : "#f87171", k = (B, U) => {
    const W = U > 0 ? B / U * 100 : 0;
    return W < 60 ? "#4ade80" : W < 80 ? "#facc15" : "#f87171";
  }, R = n.render.triangles, z = n.render.calls, N = n.engine.geometries, P = n.engine.textures;
  return /* @__PURE__ */ b("div", { className: "perf-panel", children: [
    /* @__PURE__ */ b("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ b("div", { className: "perf-header", children: [
        /* @__PURE__ */ l("h4", { className: "perf-title", children: "Frame Rate" }),
        /* @__PURE__ */ b("span", { className: "perf-current", style: { color: T(e.current) }, children: [
          e.current.toFixed(0),
          " FPS"
        ] })
      ] }),
      /* @__PURE__ */ b("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Avg" }),
          e.avg.toFixed(1)
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Min" }),
          isFinite(e.min) ? e.min.toFixed(1) : "..."
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Max" }),
          e.max.toFixed(1)
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "1% Low" }),
          /* @__PURE__ */ l("span", { style: { color: T(e.p1Low) }, children: e.p1Low.toFixed(1) })
        ] })
      ] }),
      /* @__PURE__ */ l(sn, { data: e.history, color: T(e.current), max: 90, warn: 60 })
    ] }),
    /* @__PURE__ */ b("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ b("div", { className: "perf-header", children: [
        /* @__PURE__ */ l("h4", { className: "perf-title", children: "Frame Time" }),
        /* @__PURE__ */ b("span", { className: "perf-current", style: { color: M(i) }, children: [
          i.toFixed(2),
          " ms"
        ] })
      ] }),
      /* @__PURE__ */ l(nr, { value: i, max: 33.3, color: M(i), label: "Budget (16.7ms)" }),
      /* @__PURE__ */ l(sn, { data: c, color: M(i), max: 33.3, warn: 16.7 })
    ] }),
    /* @__PURE__ */ b("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ b("div", { className: "perf-header", children: [
        /* @__PURE__ */ l("h4", { className: "perf-title", children: "GPU Pipeline" }),
        /* @__PURE__ */ b("span", { className: "perf-current", style: { color: _(z) }, children: [
          z,
          " calls"
        ] })
      ] }),
      /* @__PURE__ */ b("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Triangles" }),
          R >= 1e6 ? (R / 1e6).toFixed(2) + "M" : R >= 1e3 ? (R / 1e3).toFixed(1) + "K" : R
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Draw Calls" }),
          /* @__PURE__ */ l("span", { style: { color: _(z) }, children: z })
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Tri/Call" }),
          z > 0 ? Math.round(R / z) : 0
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Points" }),
          n.render.points
        ] })
      ] }),
      /* @__PURE__ */ l(sn, { data: a, color: _(z), max: Math.max(200, ...a) })
    ] }),
    /* @__PURE__ */ b("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ l("div", { className: "perf-header", children: /* @__PURE__ */ l("h4", { className: "perf-title", children: "Resources" }) }),
      /* @__PURE__ */ b("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Geometries" }),
          N
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Textures" }),
          P
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Programs" }),
          n.engine.programs
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Lines" }),
          n.render.lines
        ] })
      ] }),
      /* @__PURE__ */ l(nr, { value: N, max: 200, color: N > 150 ? "#f87171" : "#4ade80", label: "Geometry Budget" }),
      /* @__PURE__ */ l(nr, { value: P, max: 100, color: P > 80 ? "#f87171" : "#4ade80", label: "Texture Budget" })
    ] }),
    /* @__PURE__ */ b("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ b("div", { className: "perf-header", children: [
        /* @__PURE__ */ l("h4", { className: "perf-title", children: "Memory" }),
        /* @__PURE__ */ b("span", { className: "perf-current", style: { color: k(r.used, r.limit) }, children: [
          r.used,
          " MB"
        ] })
      ] }),
      /* @__PURE__ */ b("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Limit" }),
          r.limit,
          " MB"
        ] }),
        /* @__PURE__ */ b("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Usage" }),
          r.limit > 0 ? (r.used / r.limit * 100).toFixed(0) : 0,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ l(sn, { data: r.history, color: k(r.used, r.limit), max: r.limit || 1 })
    ] })
  ] });
}
const Bc = () => {
  const n = pe((o) => o.mode), e = pe((o) => o.setMode), t = (o) => {
    e({
      type: o,
      controller: "keyboard",
      control: o === "airplane" || o === "vehicle" ? "chase" : "thirdPerson"
    });
  };
  return /* @__PURE__ */ b("div", { className: "vehicle-panel", children: [
    /* @__PURE__ */ l("div", { className: "vehicle-panel__modes", children: [
      { type: "character", label: "Character", description: "Walk around as character" },
      { type: "vehicle", label: "Vehicle", description: "Drive a ground vehicle" },
      { type: "airplane", label: "Airplane", description: "Fly an airplane" }
    ].map((o) => /* @__PURE__ */ b(
      "button",
      {
        className: `vehicle-panel__mode-button ${n.type === o.type ? "vehicle-panel__mode-button--active" : ""}`,
        onClick: () => t(o.type),
        children: [
          /* @__PURE__ */ l("span", { className: "vehicle-panel__mode-label", children: o.label }),
          /* @__PURE__ */ l("span", { className: "vehicle-panel__mode-description", children: o.description })
        ]
      },
      o.type
    )) }),
    /* @__PURE__ */ b("div", { className: "vehicle-panel__info", children: [
      /* @__PURE__ */ b("div", { className: "vehicle-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "vehicle-panel__info-label", children: "Current Mode:" }),
        /* @__PURE__ */ l("span", { className: "vehicle-panel__info-value", children: n.type })
      ] }),
      /* @__PURE__ */ b("div", { className: "vehicle-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "vehicle-panel__info-label", children: "Controls:" }),
        /* @__PURE__ */ l("span", { className: "vehicle-panel__info-value", children: n.type === "airplane" ? "WASD + Space/Shift" : "WASD + Space" })
      ] })
    ] })
  ] });
}, zc = Object.entries(In), Dc = [
  { value: "#00ff88", label: "Green" },
  { value: "#00aaff", label: "Blue" },
  { value: "#ff3333", label: "Red" },
  { value: "#ffffff", label: "White" },
  { value: "#ffdd00", label: "Yellow" }
], Fc = () => {
  const n = O((A) => A.editMode), e = O((A) => A.setEditMode), t = O((A) => A.currentTileMultiplier), r = O((A) => A.setTileMultiplier), o = O((A) => A.currentTileHeight), i = O((A) => A.setTileHeight), s = O((A) => A.currentTileShape), a = O((A) => A.setTileShape), u = O((A) => A.currentTileRotation), c = O((A) => A.setTileRotation), f = O((A) => A.selectedTileObjectType), d = O((A) => A.setSelectedTileObjectType), p = O((A) => A.selectedPlacedObjectType), h = O((A) => A.setSelectedPlacedObjectType), x = O((A) => A.snapToGrid), y = O((A) => A.setSnapToGrid), g = O((A) => A.currentFlagWidth), m = O((A) => A.currentFlagHeight), w = O((A) => A.currentFlagImageUrl), S = O((A) => A.setFlagWidth), C = O((A) => A.setFlagHeight), T = O((A) => A.setFlagImageUrl), M = O((A) => A.currentFlagStyle), _ = O((A) => A.setFlagStyle), k = O((A) => A.currentFireIntensity), R = O((A) => A.currentFireWidth), z = O((A) => A.currentFireHeight), N = O((A) => A.currentFireColor), P = O((A) => A.setFireIntensity), B = O((A) => A.setFireWidth), U = O((A) => A.setFireHeight), W = O((A) => A.setFireColor), H = O((A) => A.currentObjectRotation), I = O((A) => A.setObjectRotation), G = O((A) => A.selectedTileGroupId), V = O((A) => A.tileGroups), J = O((A) => A.meshes), X = O((A) => A.updateMesh), K = O((A) => A.currentBillboardText), Q = O((A) => A.currentBillboardImageUrl), ee = O((A) => A.currentBillboardColor), se = O((A) => A.setBillboardText), oe = O((A) => A.setBillboardImageUrl), he = O((A) => A.setBillboardColor), j = O((A) => A.currentObjectPrimaryColor), ue = O((A) => A.currentObjectSecondaryColor), re = O((A) => A.setObjectPrimaryColor), ge = O((A) => A.setObjectSecondaryColor), ne = O((A) => A.showSnow), Y = O((A) => A.setShowSnow), $ = [
    { type: "none", label: "None", description: "No building mode" },
    { type: "wall", label: "Wall", description: "Place wall segments" },
    { type: "tile", label: "Tile", description: "Place floor tiles" },
    { type: "object", label: "Object", description: "Place objects on tiles" },
    { type: "npc", label: "NPC", description: "Place NPC entities" }
  ], ae = [
    { type: "none", label: "None" },
    { type: "grass", label: "Grass" },
    { type: "water", label: "Water" },
    { type: "sand", label: "Sand" },
    { type: "snowfield", label: "Snowfield" }
  ], ye = [
    { type: "none", label: "None" },
    { type: "sakura", label: "Sakura" },
    { type: "flag", label: "Flag" },
    { type: "fire", label: "Fire" },
    { type: "billboard", label: "Billboard" }
  ], D = [
    { type: "box", label: "Box" },
    { type: "stairs", label: "Stairs" },
    { type: "round", label: "Round" },
    { type: "ramp", label: "Ramp" }
  ];
  return /* @__PURE__ */ b("div", { className: "building-panel", children: [
    /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Edit Mode" }),
      /* @__PURE__ */ l("div", { className: "building-panel__modes", children: $.map((A) => /* @__PURE__ */ b(
        "button",
        {
          className: `building-panel__mode-btn ${n === A.type ? "building-panel__mode-btn--active" : ""}`,
          onClick: () => e(A.type),
          children: [
            /* @__PURE__ */ l("span", { className: "building-panel__mode-label", children: A.label }),
            /* @__PURE__ */ l("span", { className: "building-panel__mode-desc", children: A.description })
          ]
        },
        A.type
      )) })
    ] }),
    (n === "tile" || n === "none") && /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Terrain Cover" }),
      /* @__PURE__ */ l("div", { className: "building-panel__grid", children: ae.map((A) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${f === A.type ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => d(A.type),
          children: A.label
        },
        A.type
      )) })
    ] }),
    (n === "object" || n === "none") && /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Placed Object" }),
      /* @__PURE__ */ l("div", { className: "building-panel__grid", children: ye.map((A) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${p === A.type ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => h(A.type),
          children: A.label
        },
        A.type
      )) })
    ] }),
    /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Tile Settings" }),
      /* @__PURE__ */ b("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Size" }),
          /* @__PURE__ */ b("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => r(Math.max(1, t - 1)),
                children: "-"
              }
            ),
            /* @__PURE__ */ l("span", { className: "building-panel__stepper-value", children: t }),
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => r(Math.min(4, t + 1)),
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Snap to Grid" }),
          /* @__PURE__ */ l(
            "button",
            {
              className: `building-panel__toggle ${x ? "building-panel__toggle--on" : ""}`,
              onClick: () => y(!x),
              children: x ? "ON" : "OFF"
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Height" }),
          /* @__PURE__ */ b("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => i(Math.max(0, o - 1)),
                children: "-"
              }
            ),
            /* @__PURE__ */ l("span", { className: "building-panel__stepper-value", children: o }),
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => i(Math.min(6, o + 1)),
                children: "+"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ l("div", { className: "building-panel__grid", style: { marginTop: "8px" }, children: D.map((A) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${s === A.type ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => a(A.type),
          children: A.label
        },
        A.type
      )) }),
      /* @__PURE__ */ l("div", { className: "building-panel__grid", style: { marginTop: "8px" }, children: [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((A, be) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${Math.abs(u - A) < 1e-4 ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => c(A),
          children: be * 90
        },
        A
      )) })
    ] }),
    n === "tile" && G && (() => {
      const A = V.get(G), be = A ? J.get(A.floorMeshId) : void 0;
      return be ? /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
        /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Tile Color" }),
        /* @__PURE__ */ l("div", { className: "building-panel__info", children: /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Color" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "color",
              value: be.color || "#888888",
              onChange: (Ne) => X(be.id, { color: Ne.target.value }),
              style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
            }
          ),
          /* @__PURE__ */ l("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: be.color || "#888888" })
        ] }) })
      ] }) : null;
    })(),
    /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Effects" }),
      /* @__PURE__ */ l("div", { className: "building-panel__info", children: /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Snow" }),
        /* @__PURE__ */ l(
          "button",
          {
            className: `building-panel__toggle ${ne ? "building-panel__toggle--on" : ""}`,
            onClick: () => Y(!ne),
            children: ne ? "ON" : "OFF"
          }
        )
      ] }) })
    ] }),
    n === "object" && p !== "none" && /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Object Rotation" }),
      /* @__PURE__ */ l("div", { className: "building-panel__grid", children: [0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75].map((A, be) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${Math.abs(H - A) < 0.01 ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => I(A),
          children: be * 45
        },
        A
      )) })
    ] }),
    n === "object" && p === "sakura" && /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Sakura Color" }),
      /* @__PURE__ */ b("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Blossom" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "color",
              value: j,
              onChange: (A) => re(A.target.value),
              style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
            }
          ),
          /* @__PURE__ */ l("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: j })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Bark" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "color",
              value: ue,
              onChange: (A) => ge(A.target.value),
              style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
            }
          ),
          /* @__PURE__ */ l("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: ue })
        ] })
      ] })
    ] }),
    p === "fire" && /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Fire Settings" }),
      /* @__PURE__ */ b("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Intensity" }),
          /* @__PURE__ */ b("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => P(Math.max(0.5, k - 0.5)), children: "-" }),
            /* @__PURE__ */ l("span", { className: "building-panel__stepper-value", children: k.toFixed(1) }),
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => P(Math.min(3, k + 0.5)), children: "+" })
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Width" }),
          /* @__PURE__ */ b("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => B(Math.max(0.3, R - 0.2)), children: "-" }),
            /* @__PURE__ */ b("span", { className: "building-panel__stepper-value", children: [
              R.toFixed(1),
              "m"
            ] }),
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => B(Math.min(4, R + 0.2)), children: "+" })
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Height" }),
          /* @__PURE__ */ b("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => U(Math.max(0.5, z - 0.3)), children: "-" }),
            /* @__PURE__ */ b("span", { className: "building-panel__stepper-value", children: [
              z.toFixed(1),
              "m"
            ] }),
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => U(Math.min(5, z + 0.3)), children: "+" })
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Color" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "color",
              value: N,
              onChange: (A) => W(A.target.value),
              style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
            }
          ),
          /* @__PURE__ */ l("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: N })
        ] })
      ] })
    ] }),
    p === "billboard" && /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Billboard Settings" }),
      /* @__PURE__ */ b("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Text" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              value: K,
              onChange: (A) => se(A.target.value),
              placeholder: "Display text...",
              style: {
                width: "100%",
                padding: "4px 6px",
                fontSize: "11px",
                background: "var(--panel-bg, #1a1a2e)",
                border: "1px solid var(--border-color, #333)",
                borderRadius: "3px",
                color: "inherit",
                boxSizing: "border-box"
              }
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Image URL" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              value: Q,
              onChange: (A) => oe(A.target.value),
              placeholder: "https://...",
              style: {
                width: "100%",
                padding: "4px 6px",
                fontSize: "11px",
                background: "var(--panel-bg, #1a1a2e)",
                border: "1px solid var(--border-color, #333)",
                borderRadius: "3px",
                color: "inherit",
                boxSizing: "border-box"
              }
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Color" }),
          /* @__PURE__ */ l("div", { className: "building-panel__grid", children: Dc.map((A) => /* @__PURE__ */ l(
            "button",
            {
              className: `building-panel__grid-btn ${ee === A.value ? "building-panel__grid-btn--active" : ""}`,
              onClick: () => he(A.value),
              style: { borderBottom: `3px solid ${A.value}` },
              children: A.label
            },
            A.value
          )) })
        ] })
      ] })
    ] }),
    p === "flag" && /* @__PURE__ */ b("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Flag Settings" }),
      /* @__PURE__ */ b("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Style" }),
          /* @__PURE__ */ l("div", { className: "building-panel__grid", children: zc.map(([A, be]) => /* @__PURE__ */ l(
            "button",
            {
              className: `building-panel__grid-btn ${M === A ? "building-panel__grid-btn--active" : ""}`,
              onClick: () => _(A),
              children: be.label
            },
            A
          )) })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Width" }),
          /* @__PURE__ */ b("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => S(Math.max(0.5, g - 0.5)),
                children: "-"
              }
            ),
            /* @__PURE__ */ b("span", { className: "building-panel__stepper-value", children: [
              g,
              "m"
            ] }),
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => S(Math.min(8, g + 0.5)),
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Height" }),
          /* @__PURE__ */ b("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => C(Math.max(0.5, m - 0.5)),
                children: "-"
              }
            ),
            /* @__PURE__ */ b("span", { className: "building-panel__stepper-value", children: [
              m,
              "m"
            ] }),
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => C(Math.min(6, m + 0.5)),
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Image URL" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              value: w,
              onChange: (A) => T(A.target.value),
              placeholder: "https://...",
              style: {
                width: "100%",
                padding: "4px 6px",
                fontSize: "11px",
                background: "var(--panel-bg, #1a1a2e)",
                border: "1px solid var(--border-color, #333)",
                borderRadius: "3px",
                color: "inherit",
                boxSizing: "border-box"
              }
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ b("div", { className: "building-panel__info", style: { marginTop: "auto" }, children: [
      /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Current Mode" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: n })
      ] }),
      /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Terrain Cover" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: f })
      ] }),
      /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Object" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: p })
      ] }),
      /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Tile Height" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: o })
      ] }),
      /* @__PURE__ */ b("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Tile Shape" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: s })
      ] })
    ] })
  ] });
}, Lc = () => /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ l("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) }), Gc = () => /* @__PURE__ */ b("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ l("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ l("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] }), rr = ({
  children: n,
  title: e,
  initialWidth: t = 280,
  initialHeight: r = 400,
  minWidth: o = 200,
  minHeight: i = 150,
  maxWidth: s = 600,
  maxHeight: a = 800,
  resizeHandles: u = ["right"],
  className: c = "",
  style: f = {},
  onClose: d,
  onMinimize: p,
  draggable: h = !0,
  onDrop: x
}) => {
  const [y, g] = Z({ width: t, height: r }), [m, w] = Z({ x: 0, y: 0 }), [S, C] = Z(!1), [T, M] = Z(!1), [_, k] = Z(""), [R, z] = Z({ x: 0, y: 0 }), N = E(null), P = E(null), B = q((I) => (G) => {
    G.preventDefault(), C(!0), k(I);
  }, []), U = q((I) => {
    if (N.current)
      if (S) {
        const G = N.current.getBoundingClientRect();
        let V = y.width, J = y.height;
        _.includes("right") && (V = Math.min(s, Math.max(o, I.clientX - G.left))), _.includes("bottom") && (J = Math.min(a, Math.max(i, I.clientY - G.top))), g({ width: V, height: J });
      } else T && w({
        x: I.clientX - R.x,
        y: I.clientY - R.y
      });
  }, [S, T, _, y, o, s, i, a, R]), W = q(() => {
    T && x && x(m.x, m.y), C(!1), M(!1), k("");
  }, [T, x, m]), H = q((I) => {
    if (!h || S) return;
    I.preventDefault(), M(!0);
    const G = N.current?.getBoundingClientRect();
    G && z({
      x: I.clientX - G.left,
      y: I.clientY - G.top
    });
  }, [h, S]);
  return L(() => {
    if (S || T)
      return document.addEventListener("mousemove", U), document.addEventListener("mouseup", W), () => {
        document.removeEventListener("mousemove", U), document.removeEventListener("mouseup", W);
      };
  }, [S, T, U, W]), /* @__PURE__ */ b(
    "div",
    {
      ref: N,
      className: `rp-panel ${c} ${T ? "dragging" : ""}`,
      style: {
        width: `${y.width}px`,
        height: `${y.height}px`,
        ...T ? {
          position: "fixed",
          left: `${m.x}px`,
          top: `${m.y}px`,
          zIndex: 10003
        } : {},
        ...f
      },
      children: [
        /* @__PURE__ */ b(
          "div",
          {
            ref: P,
            className: "rp-header",
            onMouseDown: H,
            children: [
              /* @__PURE__ */ l("h3", { className: "rp-title", children: e }),
              /* @__PURE__ */ b("div", { className: "rp-controls", children: [
                p && /* @__PURE__ */ l("button", { className: "rp-btn", onClick: p, title: "Minimize", children: /* @__PURE__ */ l(Lc, {}) }),
                d && /* @__PURE__ */ l("button", { className: "rp-btn", onClick: d, title: "Close", children: /* @__PURE__ */ l(Gc, {}) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ l("div", { className: "rp-content", children: n }),
        u.map((I) => /* @__PURE__ */ l(
          "div",
          {
            className: `rp-resize-handle handle-${I}`,
            onMouseDown: B(I.replace("corner", "right bottom"))
          },
          I
        ))
      ]
    }
  );
}, Oc = ({ children: n }) => {
  const [e, t] = Z(["building", "vehicle", "performance"]), [r, o] = Z([]), [i, s] = Z([]), a = [
    { id: "building", title: "Building", component: /* @__PURE__ */ l(Fc, {}), defaultSide: "left" },
    { id: "vehicle", title: "Vehicle", component: /* @__PURE__ */ l(Bc, {}), defaultSide: "left" },
    { id: "animation", title: "Animation", component: /* @__PURE__ */ l(Rc, {}), defaultSide: "left" },
    { id: "camera", title: "Camera", component: /* @__PURE__ */ l(Pc, {}), defaultSide: "right" },
    { id: "motion", title: "Motion", component: /* @__PURE__ */ l(Nc, {}), defaultSide: "right" },
    { id: "performance", title: "Performance", component: /* @__PURE__ */ l(Ec, {}), defaultSide: "right" }
  ], u = (g) => {
    t((m) => m.includes(g) ? m.filter((w) => w !== g) : [...m, g]), s((m) => m.filter((w) => w !== g));
  }, c = (g) => {
    t((m) => m.filter((w) => w !== g)), o((m) => m.filter((w) => w.id !== g)), s((m) => m.filter((w) => w !== g));
  }, f = (g) => {
    s((m) => [...m, g]), t((m) => m.filter((w) => w !== g)), o((m) => m.filter((w) => w.id !== g));
  }, d = (g) => {
    s((m) => m.filter((w) => w !== g)), t((m) => [...m, g]);
  }, p = (g, m, w) => {
    const S = r.find((C) => C.id === g);
    o(S ? (C) => C.map(
      (T) => T.id === g ? { ...T, x: m, y: w } : T
    ) : (C) => [...C, {
      id: g,
      x: m,
      y: w,
      width: 300,
      height: 400
    }]);
  }, h = () => a.filter(
    (g) => e.includes(g.id) && g.defaultSide === "left" && !r.some((m) => m.id === g.id)
  ), x = () => a.filter(
    (g) => e.includes(g.id) && g.defaultSide === "right" && !r.some((m) => m.id === g.id)
  ), y = () => r.filter((g) => e.includes(g.id));
  return /* @__PURE__ */ b("div", { className: "editor-root", children: [
    /* @__PURE__ */ l("div", { className: "editor-panel-bar", children: a.map((g) => /* @__PURE__ */ l(
      "button",
      {
        onClick: () => u(g.id),
        className: `editor-panel-toggle ${e.includes(g.id) ? "active" : ""}`,
        title: g.title,
        children: g.title
      },
      g.id
    )) }),
    h().length > 0 && /* @__PURE__ */ l("div", { className: "editor-left-stack", children: h().map((g, m) => /* @__PURE__ */ l(
      rr,
      {
        title: g.title,
        initialWidth: 280,
        initialHeight: Math.max(300, (window.innerHeight - 120) / h().length),
        minWidth: 200,
        maxWidth: 500,
        resizeHandles: ["right"],
        className: "editor-glass-panel",
        style: {
          marginBottom: m < h().length - 1 ? "8px" : "0"
        },
        onClose: () => c(g.id),
        onMinimize: () => f(g.id),
        onDrop: (w, S) => p(g.id, w, S),
        children: g.component
      },
      g.id
    )) }),
    x().length > 0 && /* @__PURE__ */ l("div", { className: "editor-right-stack", children: x().map((g, m) => /* @__PURE__ */ l(
      rr,
      {
        title: g.title,
        initialWidth: 320,
        initialHeight: Math.max(300, (window.innerHeight - 120) / x().length),
        minWidth: 200,
        maxWidth: 500,
        resizeHandles: ["corner"],
        className: "editor-glass-panel",
        style: {
          marginBottom: m < x().length - 1 ? "8px" : "0"
        },
        onClose: () => c(g.id),
        onMinimize: () => f(g.id),
        onDrop: (w, S) => p(g.id, w, S),
        children: g.component
      },
      g.id
    )) }),
    y().map((g) => {
      const m = a.find((w) => w.id === g.id);
      return m ? /* @__PURE__ */ l(
        rr,
        {
          title: m.title,
          initialWidth: g.width,
          initialHeight: g.height,
          minWidth: 200,
          maxWidth: 800,
          resizeHandles: ["right", "bottom", "corner"],
          className: "editor-glass-panel",
          style: {
            position: "fixed",
            left: `${g.x}px`,
            top: `${g.y}px`,
            zIndex: 1001
          },
          onClose: () => c(m.id),
          onMinimize: () => f(m.id),
          onDrop: (w, S) => p(m.id, w, S),
          children: m.component
        },
        g.id
      ) : null;
    }),
    i.length > 0 && /* @__PURE__ */ l("div", { className: "editor-minimized-dock", children: i.map((g) => {
      const m = a.find((w) => w.id === g);
      return m ? /* @__PURE__ */ l(
        "button",
        {
          onClick: () => d(g),
          className: "editor-minimized-item",
          title: `Restore ${m.title}`,
          children: m.title
        },
        g
      ) : null;
    }) }),
    n
  ] });
}, Nm = ({
  children: n,
  className: e = "",
  style: t = {}
}) => /* @__PURE__ */ l(
  "div",
  {
    className: `gaesup-editor ${e}`,
    style: {
      ...t
    },
    children: /* @__PURE__ */ l(Oc, { children: n })
  }
);
Ts();
const me = we()(
  _s((n, e) => ({
    initialized: !1,
    templates: /* @__PURE__ */ new Map(),
    instances: /* @__PURE__ */ new Map(),
    categories: /* @__PURE__ */ new Map(),
    clothingSets: /* @__PURE__ */ new Map(),
    clothingCategories: /* @__PURE__ */ new Map(),
    animations: /* @__PURE__ */ new Map(),
    editMode: !1,
    previewAccessories: {},
    initializeDefaults: () => n((t) => {
      t.initialized || (t.animations.set("idle", {
        id: "idle",
        name: "Idle",
        loop: !0,
        speed: 1
      }), t.animations.set("walk", {
        id: "walk",
        name: "Walk",
        loop: !0,
        speed: 1
      }), t.animations.set("greet", {
        id: "greet",
        name: "Greet",
        loop: !1,
        speed: 1
      }), t.animations.set("jump", {
        id: "jump",
        name: "Jump",
        loop: !1,
        speed: 1
      }), t.animations.set("run", {
        id: "run",
        name: "Run",
        loop: !0,
        speed: 1.5
      }), t.clothingCategories.set("basic", {
        id: "basic",
        name: "기본 의상",
        description: "Basic clothing sets",
        clothingSetIds: ["rabbit-outfit", "basic-suit", "formal-suit"]
      }), t.clothingCategories.set("accessories", {
        id: "accessories",
        name: "액세서리",
        description: "Hats and glasses",
        clothingSetIds: ["hat-set-a", "hat-set-b", "hat-set-c", "glass-set-a", "glass-set-b"]
      }), t.clothingSets.set("rabbit-outfit", {
        id: "rabbit-outfit",
        name: "토끼옷",
        category: "casual",
        parts: [
          {
            id: "rabbit-cloth",
            type: "top",
            url: "gltf/ally_cloth_rabbit.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("basic-suit", {
        id: "basic-suit",
        name: "양복",
        category: "formal",
        parts: [
          {
            id: "basic-suit-cloth",
            type: "top",
            url: "gltf/ally_cloth.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("formal-suit", {
        id: "formal-suit",
        name: "양복 2",
        category: "formal",
        parts: [
          {
            id: "formal-suit-cloth",
            type: "top",
            url: "gltf/formal.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("hat-set-a", {
        id: "hat-set-a",
        name: "모자 A",
        category: "casual",
        parts: [
          {
            id: "hat-a",
            type: "hat",
            url: "gltf/hat_a.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("hat-set-b", {
        id: "hat-set-b",
        name: "모자 B",
        category: "casual",
        parts: [
          {
            id: "hat-b",
            type: "hat",
            url: "gltf/hat_b.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("hat-set-c", {
        id: "hat-set-c",
        name: "모자 C",
        category: "casual",
        parts: [
          {
            id: "hat-c",
            type: "hat",
            url: "gltf/hat_c.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("glass-set-a", {
        id: "glass-set-a",
        name: "안경 A",
        category: "casual",
        parts: [
          {
            id: "glass-a",
            type: "glasses",
            url: "gltf/glass_a.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.clothingSets.set("glass-set-b", {
        id: "glass-set-b",
        name: "슈퍼 안경",
        category: "casual",
        parts: [
          {
            id: "super-glass",
            type: "glasses",
            url: "gltf/super_glass.glb",
            position: [0, 0, 0]
          }
        ]
      }), t.categories.set("humanoid", {
        id: "humanoid",
        name: "캐릭터",
        description: "Human-like characters",
        templateIds: ["ally", "oneyee"]
      }), t.templates.set("ally", {
        id: "ally",
        name: "올춘삼",
        description: "Ally character",
        category: "humanoid",
        baseParts: [
          {
            id: "ally-body",
            type: "body",
            url: "gltf/ally_body.glb",
            position: [0, 0, 0]
          }
        ],
        clothingParts: [],
        defaultAnimation: "idle",
        defaultClothingSet: "rabbit-outfit"
      }), t.templates.set("oneyee", {
        id: "oneyee",
        name: "원덕배",
        description: "Oneyee character",
        category: "humanoid",
        baseParts: [
          {
            id: "oneyee-body",
            type: "body",
            url: "gltf/oneyee.glb",
            position: [0, 0, 0]
          }
        ],
        clothingParts: [],
        defaultAnimation: "idle",
        defaultClothingSet: "basic-suit"
      }), t.selectedCategoryId = "humanoid", t.selectedTemplateId = "ally", t.selectedClothingCategoryId = "basic", t.selectedClothingSetId = "rabbit-outfit", t.initialized = !0);
    }),
    addTemplate: (t) => n((r) => {
      r.templates.set(t.id, t);
    }),
    updateTemplate: (t, r) => n((o) => {
      const i = o.templates.get(t);
      i && o.templates.set(t, { ...i, ...r });
    }),
    removeTemplate: (t) => n((r) => {
      r.templates.delete(t);
    }),
    addInstance: (t) => n((r) => {
      r.instances.set(t.id, t);
    }),
    updateInstance: (t, r) => n((o) => {
      const i = o.instances.get(t);
      i && o.instances.set(t, { ...i, ...r });
    }),
    removeInstance: (t) => n((r) => {
      r.instances.delete(t);
    }),
    addCategory: (t) => n((r) => {
      r.categories.set(t.id, t);
    }),
    updateCategory: (t, r) => n((o) => {
      const i = o.categories.get(t);
      i && o.categories.set(t, { ...i, ...r });
    }),
    removeCategory: (t) => n((r) => {
      r.categories.delete(t);
    }),
    addClothingSet: (t) => n((r) => {
      r.clothingSets.set(t.id, t);
    }),
    updateClothingSet: (t, r) => n((o) => {
      const i = o.clothingSets.get(t);
      i && o.clothingSets.set(t, { ...i, ...r });
    }),
    removeClothingSet: (t) => n((r) => {
      r.clothingSets.delete(t);
    }),
    addClothingCategory: (t) => n((r) => {
      r.clothingCategories.set(t.id, t);
    }),
    updateClothingCategory: (t, r) => n((o) => {
      const i = o.clothingCategories.get(t);
      i && o.clothingCategories.set(t, { ...i, ...r });
    }),
    removeClothingCategory: (t) => n((r) => {
      r.clothingCategories.delete(t);
    }),
    addAnimation: (t) => n((r) => {
      r.animations.set(t.id, t);
    }),
    updateAnimation: (t, r) => n((o) => {
      const i = o.animations.get(t);
      i && o.animations.set(t, { ...i, ...r });
    }),
    removeAnimation: (t) => n((r) => {
      r.animations.delete(t);
    }),
    setSelectedTemplate: (t) => n((r) => {
      r.selectedTemplateId = t;
    }),
    setSelectedCategory: (t) => n((r) => {
      r.selectedCategoryId = t;
      const o = r.categories.get(t);
      if (o && o.templateIds.length > 0) {
        const i = o.templateIds[0];
        i && (r.selectedTemplateId = i);
      } else
        delete r.selectedTemplateId;
    }),
    setSelectedInstance: (t) => n((r) => {
      r.selectedInstanceId = t;
    }),
    setSelectedClothingSet: (t) => n((r) => {
      r.selectedClothingSetId = t;
    }),
    setSelectedClothingCategory: (t) => n((r) => {
      r.selectedClothingCategoryId = t;
      const o = r.clothingCategories.get(t);
      if (o && o.clothingSetIds.length > 0) {
        const i = o.clothingSetIds[0];
        i && (r.selectedClothingSetId = i);
      } else
        delete r.selectedClothingSetId;
    }),
    setEditMode: (t) => n((r) => {
      r.editMode = t;
    }),
    createInstanceFromTemplate: (t, r) => {
      const o = e().templates.get(t);
      if (!o) return;
      const i = `npc-${Date.now()}`, s = e().selectedClothingSetId || o.defaultClothingSet, a = [], u = e().previewAccessories.hat;
      if (u) {
        const p = e().clothingSets.get(u)?.parts[0];
        p && a.push(p);
      }
      const c = e().previewAccessories.glasses;
      if (c) {
        const p = e().clothingSets.get(c)?.parts[0];
        p && a.push(p);
      }
      const f = {
        id: i,
        templateId: t,
        name: `${o.name} ${Date.now()}`,
        position: r,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        ...o.defaultAnimation ? { currentAnimation: o.defaultAnimation } : {},
        ...s ? { currentClothingSetId: s } : {},
        ...a.length > 0 ? { customParts: a } : {},
        events: []
      };
      e().addInstance(f), e().setSelectedInstance(i);
    },
    updateInstancePart: (t, r, o) => n((i) => {
      const s = i.instances.get(t);
      if (!s) return;
      const a = s.customParts || [], u = a.findIndex((c) => c.id === r);
      if (u >= 0) {
        const c = a[u];
        a[u] = {
          ...c,
          ...o,
          id: c.id,
          type: c.type,
          url: c.url
        };
      } else {
        const c = o.type ?? "accessory", f = o.url ?? "";
        a.push({
          id: r,
          type: c,
          url: f,
          ...o.category !== void 0 ? { category: o.category } : {},
          ...o.position !== void 0 ? { position: o.position } : {},
          ...o.rotation !== void 0 ? { rotation: o.rotation } : {},
          ...o.scale !== void 0 ? { scale: o.scale } : {},
          ...o.color !== void 0 ? { color: o.color } : {},
          ...o.metadata !== void 0 ? { metadata: o.metadata } : {}
        });
      }
      i.instances.set(t, { ...s, customParts: a });
    }),
    changeInstanceClothing: (t, r) => n((o) => {
      const i = o.instances.get(t);
      i && o.instances.set(t, { ...i, currentClothingSetId: r });
    }),
    addInstanceEvent: (t, r) => n((o) => {
      const i = o.instances.get(t);
      if (i) {
        const s = i.events || [];
        s.push(r), o.instances.set(t, { ...i, events: s });
      }
    }),
    removeInstanceEvent: (t, r) => n((o) => {
      const i = o.instances.get(t);
      if (i && i.events) {
        const s = i.events.filter((a) => a.id !== r);
        o.instances.set(t, { ...i, events: s });
      }
    }),
    setPreviewAccessory: (t, r) => n((o) => {
      r ? o.previewAccessories[t] = r : delete o.previewAccessories[t];
    }),
    setNavigation: (t, r, o = 3) => n((i) => {
      const s = i.instances.get(t);
      if (!s || r.length === 0) return;
      const a = {
        waypoints: r,
        currentIndex: 0,
        speed: o,
        state: "moving"
      };
      i.instances.set(t, {
        ...s,
        navigation: a,
        currentAnimation: "walk"
      });
    }),
    advanceNavigation: (t) => n((r) => {
      const o = r.instances.get(t);
      if (!o?.navigation || o.navigation.state !== "moving") return;
      const i = o.navigation, s = i.currentIndex + 1;
      s >= i.waypoints.length ? r.instances.set(t, {
        ...o,
        navigation: { ...i, state: "arrived", currentIndex: s },
        currentAnimation: "idle"
      }) : r.instances.set(t, {
        ...o,
        navigation: { ...i, currentIndex: s }
      });
    }),
    clearNavigation: (t) => n((r) => {
      const o = r.instances.get(t);
      if (!o) return;
      const i = {
        ...o,
        currentAnimation: "idle"
      };
      delete i.navigation, r.instances.set(t, i);
    }),
    updateNavigationPosition: (t, r) => n((o) => {
      const i = o.instances.get(t);
      i && o.instances.set(t, { ...i, position: r });
    })
  }))
);
function Uc({ part: n }) {
  return /* @__PURE__ */ b(
    "mesh",
    {
      position: n.position || [0, 0, 0],
      rotation: n.rotation || [0, 0, 0],
      scale: n.scale || [1, 1, 1],
      children: [
        /* @__PURE__ */ l("boxGeometry", { args: [0.5, 1.8, 0.5] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: "royalblue",
            transparent: !0,
            opacity: 0.7
          }
        )
      ]
    }
  );
}
function Wc() {
  const n = O((c) => c.editMode), e = O((c) => c.hoverPosition), t = me((c) => c.templates), r = me((c) => c.clothingSets), o = me((c) => c.selectedTemplateId), i = me(
    (c) => c.selectedClothingSetId
  ), s = me((c) => c.previewAccessories);
  if (n !== "npc" || !e || !o)
    return null;
  const a = t.get(o);
  if (!a)
    return null;
  const u = [];
  if (u.push(...a.baseParts), i) {
    const c = r.get(i);
    c && u.push(...c.parts);
  }
  if (s.hat) {
    const c = r.get(s.hat);
    if (c && c.parts.length > 0) {
      const f = c.parts[0];
      f && u.push(f);
    }
  }
  if (s.glasses) {
    const c = r.get(s.glasses);
    if (c && c.parts.length > 0) {
      const f = c.parts[0];
      f && u.push(f);
    }
  }
  return /* @__PURE__ */ b("group", { position: [e.x, e.y, e.z], children: [
    u.map((c) => /* @__PURE__ */ l(Uc, { part: c }, c.id)),
    /* @__PURE__ */ b("mesh", { position: [0, 0.01, 0], rotation: [-Math.PI / 2, 0, 0], children: [
      /* @__PURE__ */ l("circleGeometry", { args: [1, 32] }),
      /* @__PURE__ */ l(
        "meshStandardMaterial",
        {
          color: "#00ff00",
          transparent: !0,
          opacity: 0.3,
          emissive: "#00ff00",
          emissiveIntensity: 0.3
        }
      )
    ] })
  ] });
}
const Xe = /* @__PURE__ */ new Set(), De = we((n) => ({
  active: !1,
  version: 0,
  visibleTileGroupIds: Xe,
  visibleWallGroupIds: Xe,
  visibleBlockIds: Xe,
  visibleObjectIds: Xe,
  clusterCounts: new Uint32Array(0),
  setResult: ({ version: e, tileIds: t, wallIds: r, blockIds: o, objectIds: i, clusterCounts: s }) => n({
    active: !0,
    version: e,
    visibleTileGroupIds: t,
    visibleWallGroupIds: r,
    visibleBlockIds: o ?? Xe,
    visibleObjectIds: i,
    clusterCounts: s
  }),
  reset: () => n({
    active: !1,
    version: 0,
    visibleTileGroupIds: Xe,
    visibleWallGroupIds: Xe,
    visibleBlockIds: Xe,
    visibleObjectIds: Xe,
    clusterCounts: new Uint32Array(0)
  })
})), bt = 18, $e = 140, Hc = 0.12, jc = 8, $c = 3.2, zo = 2.4, Vc = 0.985;
function at(n, e) {
  return Math.floor(n / e);
}
function qc(n, e) {
  return `${n}:${e}`;
}
function Yc(n, e, t, r, o = bt, i = jc) {
  const s = at(n, o), a = at(e, o), u = Math.atan2(r, t), c = u < 0 ? u + Math.PI * 2 : u, f = Math.floor(c / (Math.PI * 2) * i) % i;
  return `${s}:${a}:${f}`;
}
function Wr(n, e, t, r, o, i, s, a) {
  const u = (e + t) * 0.5, c = (r + o) * 0.5, f = (i + s) * 0.5, d = t - e, p = o - r, h = s - i;
  return {
    id: n,
    centerX: u,
    centerY: c,
    centerZ: f,
    radius: Math.max(1, Math.hypot(d, p, h) * 0.5),
    cellX: at(u, a),
    cellZ: at(f, a)
  };
}
function Zc(n, e = bt) {
  if (n.tiles.length === 0) return null;
  let t = 1 / 0, r = -1 / 0, o = 0, i = 0.2, s = 1 / 0, a = -1 / 0;
  for (const u of n.tiles) {
    const f = (u.size ?? 1) * 0.5;
    t = Math.min(t, u.position.x - f), r = Math.max(r, u.position.x + f), o = Math.min(o, 0), i = Math.max(i, Math.max(u.position.y, 0.2) + 1.5), s = Math.min(s, u.position.z - f), a = Math.max(a, u.position.z + f);
  }
  return Wr(n.id, t, r, o, i, s, a, e);
}
function Xc(n, e = bt) {
  if (n.walls.length === 0) return null;
  let t = 1 / 0, r = -1 / 0, o = 0, i = 2.5, s = 1 / 0, a = -1 / 0;
  for (const u of n.walls)
    t = Math.min(t, u.position.x - 1.1), r = Math.max(r, u.position.x + 1.1), o = Math.min(o, u.position.y), i = Math.max(i, u.position.y + 3.5), s = Math.min(s, u.position.z - 1.1), a = Math.max(a, u.position.z + 1.1);
  return Wr(n.id, t, r, o, i, s, a, e);
}
function Kc(n, e = bt) {
  const t = Math.max(1, Math.round(n.size?.x ?? 1)) * ie.GRID_CELL_SIZE, r = Math.max(1, Math.round(n.size?.y ?? 1)) * ie.HEIGHT_STEP, o = Math.max(1, Math.round(n.size?.z ?? 1)) * ie.GRID_CELL_SIZE, i = ie.GRID_CELL_SIZE * 0.5;
  return Wr(
    n.id,
    n.position.x - i,
    n.position.x - i + t,
    n.position.y,
    n.position.y + r,
    n.position.z - i,
    n.position.z - i + o,
    e
  );
}
function Jc(n) {
  const e = n.config?.size ?? 1;
  switch (n.type) {
    case "sakura":
      return Math.max(2.2, e * 0.8);
    case "flag":
      return Math.max(1.4, (n.config?.flagWidth ?? 1.5) * 0.8);
    case "fire":
      return Math.max(1.2, n.config?.fireWidth ?? 1);
    case "billboard":
      return 1.8;
    default:
      return 1.5;
  }
}
function Qc(n, e = bt) {
  const t = Jc(n);
  return {
    id: n.id,
    centerX: n.position.x,
    centerY: n.position.y + t * 0.5,
    centerZ: n.position.z,
    radius: t,
    cellX: at(n.position.x, e),
    cellZ: at(n.position.z, e)
  };
}
function Gt(n, e, t, r = $e, o = bt) {
  const i = at(e, o), s = at(t, o), a = Math.ceil(r / o), u = /* @__PURE__ */ new Set();
  for (let c = s - a; c <= s + a; c += 1)
    for (let f = i - a; f <= i + a; f += 1) {
      const d = n.get(qc(f, c));
      if (d)
        for (const p of d) u.add(p);
    }
  return u;
}
function eu(n, e, t, r = $e, o = bt) {
  const i = Gt(n.occluderBuckets, e, t, r, o), s = [];
  for (const a of i) {
    const u = n.occluderByKey.get(a);
    u && s.push(u);
  }
  return s;
}
function tu(n, e, t, r, o) {
  const i = n.centerX - t.x, s = n.centerY - t.y, a = n.centerZ - t.z, u = Math.sqrt(i * i + s * s + a * a);
  if (u < 10) return !1;
  o.targetDir.set(i, s, a).normalize();
  for (const c of r) {
    if (c.kind === e && c.id === n.id) continue;
    const f = c.centerX - t.x, d = c.centerY - t.y, p = c.centerZ - t.z, h = Math.sqrt(f * f + d * d + p * p);
    if (h <= 1 || h >= u - Math.max(n.radius, 1.2) || (o.occDir.set(f, d, p).normalize(), o.targetDir.dot(o.occDir) < Vc)) continue;
    const y = o.cross.crossVectors(
      o.targetDir,
      o.occDir
    ).length() * h, g = c.strength + Math.min(n.radius * 0.45, 1.8);
    if (!(y > g))
      return !0;
  }
  return !1;
}
const Pn = 0, Rn = 1, Hr = 2, Nn = 3, nu = 0, pi = 1, mi = 2, hi = 3, gi = 4, ru = 10, yi = 20, bi = 21, Tr = 22, vi = 23, ou = 30;
function xi() {
  return {
    version: 0,
    ids: [],
    kinds: new Uint8Array(0),
    subKinds: new Uint8Array(0),
    centerX: new Float32Array(0),
    centerY: new Float32Array(0),
    centerZ: new Float32Array(0),
    radius: new Float32Array(0),
    cellX: new Int16Array(0),
    cellZ: new Int16Array(0),
    memberCount: new Uint16Array(0)
  };
}
function iu(n, e, t, r) {
  let o = t.length + r.length;
  for (const i of n)
    i.walls.length > 0 && (o += 1);
  for (const i of e)
    i.tiles.length > 0 && (o += 1);
  return o;
}
function su(n) {
  const e = n.blocks ?? [], t = iu(n.wallGroups, n.tileGroups, n.objects, e);
  if (t === 0)
    return { ...xi(), version: n.version };
  const r = new Array(t), o = new Uint8Array(t), i = new Uint8Array(t), s = new Float32Array(t), a = new Float32Array(t), u = new Float32Array(t), c = new Float32Array(t), f = new Int16Array(t), d = new Int16Array(t), p = new Uint16Array(t);
  let h = 0;
  const x = (y, g, m, w, S) => {
    r[h] = y, o[h] = g, i[h] = m, s[h] = w.centerX, a[h] = w.centerY, u[h] = w.centerZ, c[h] = w.radius, f[h] = w.cellX, d[h] = w.cellZ, p[h] = S, h += 1;
  };
  for (const y of n.tileGroups) {
    const g = Zc(y);
    if (!g) continue;
    const m = y.tiles.find((S) => S.objectType && S.objectType !== "none")?.objectType ?? "none", w = m === "grass" ? pi : m === "water" ? mi : m === "sand" ? hi : m === "snowfield" ? gi : nu;
    x(y.id, Pn, w, g, y.tiles.length);
  }
  for (const y of n.wallGroups) {
    const g = Xc(y);
    g && x(y.id, Rn, ru, g, y.walls.length);
  }
  for (const y of e)
    x(y.id, Nn, ou, Kc(y), 1);
  for (const y of n.objects) {
    const g = y.type === "sakura" ? yi : y.type === "flag" ? bi : y.type === "fire" ? Tr : y.type === "billboard" ? vi : Tr;
    x(y.id, Hr, g, Qc(y), 1);
  }
  return {
    version: n.version,
    ids: r,
    kinds: o,
    subKinds: i,
    centerX: s,
    centerY: a,
    centerZ: u,
    radius: c,
    cellX: f,
    cellZ: d,
    memberCount: p
  };
}
function ct(n, e, t, r) {
  const o = `${e}:${t}`, i = n.get(o);
  if (i) {
    i.push(r);
    return;
  }
  n.set(o, [r]);
}
function au(n, e) {
  return {
    id: n.ids[e] ?? "",
    centerX: n.centerX[e] ?? 0,
    centerY: n.centerY[e] ?? 0,
    centerZ: n.centerZ[e] ?? 0,
    radius: n.radius[e] ?? 1,
    cellX: n.cellX[e] ?? 0,
    cellZ: n.cellZ[e] ?? 0
  };
}
function lu(n) {
  const e = {
    tileById: /* @__PURE__ */ new Map(),
    wallById: /* @__PURE__ */ new Map(),
    blockById: /* @__PURE__ */ new Map(),
    objectById: /* @__PURE__ */ new Map(),
    tileBuckets: /* @__PURE__ */ new Map(),
    wallBuckets: /* @__PURE__ */ new Map(),
    blockBuckets: /* @__PURE__ */ new Map(),
    objectBuckets: /* @__PURE__ */ new Map(),
    occluderByKey: /* @__PURE__ */ new Map(),
    occluderBuckets: /* @__PURE__ */ new Map()
  };
  for (let t = 0; t < n.ids.length; t += 1) {
    const r = n.ids[t];
    if (!r) continue;
    const o = au(n, t), i = n.kinds[t];
    if (i === Pn) {
      if (e.tileById.set(r, o), ct(e.tileBuckets, o.cellX, o.cellZ, r), o.radius >= $c) {
        const s = {
          ...o,
          key: `tile:${r}`,
          kind: "tile",
          strength: o.radius
        };
        e.occluderByKey.set(s.key, s), ct(e.occluderBuckets, s.cellX, s.cellZ, s.key);
      }
      continue;
    }
    if (i === Rn) {
      e.wallById.set(r, o), ct(e.wallBuckets, o.cellX, o.cellZ, r);
      const s = n.memberCount[t] ?? 0;
      if (o.radius >= zo || s >= 4) {
        const a = {
          ...o,
          key: `wall:${r}`,
          kind: "wall",
          strength: o.radius * 1.15
        };
        e.occluderByKey.set(a.key, a), ct(e.occluderBuckets, a.cellX, a.cellZ, a.key);
      }
      continue;
    }
    if (i === Nn) {
      if (e.blockById.set(r, o), ct(e.blockBuckets, o.cellX, o.cellZ, r), o.radius >= zo || (n.memberCount[t] ?? 0) >= 1) {
        const s = {
          ...o,
          key: `block:${r}`,
          kind: "block",
          strength: o.radius * 1.1
        };
        e.occluderByKey.set(s.key, s), ct(e.occluderBuckets, s.cellX, s.cellZ, s.key);
      }
      continue;
    }
    e.objectById.set(r, o), ct(e.objectBuckets, o.cellX, o.cellZ, r);
  }
  return e;
}
const $t = 0, wi = 1, Vt = 2, qt = 3, Yt = 4, jr = 5, $r = 6, Vr = 7, qr = 8, Yr = 9, Zr = 10, Xr = 11;
function cu(n, e) {
  const t = n.kinds[e], r = n.subKinds[e];
  if (t === Pn)
    return r === pi ? wi : r === mi ? Vt : r === hi ? qt : r === gi ? Yt : $t;
  if (t === Rn)
    return jr;
  if (t === Nn)
    return Zr;
  if (t === Hr) {
    if (r === yi) return $r;
    if (r === bi) return Vr;
    if (r === Tr) return qr;
    if (r === vi) return Yr;
  }
  return $t;
}
function uu(n, e) {
  const t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), s = new Uint32Array(Xr), a = Math.min(n.ids.length, e.length);
  for (let u = 0; u < a; u += 1) {
    if ((e[u] ?? 0) === 0) continue;
    const c = n.ids[u];
    if (!c) continue;
    const f = n.kinds[u];
    f === Pn ? t.add(c) : f === Rn ? r.add(c) : f === Nn ? o.add(c) : f === Hr && i.add(c);
    const d = cu(n, u);
    s[d] = (s[d] ?? 0) + 1;
  }
  return {
    version: n.version,
    tileIds: t,
    wallIds: r,
    blockIds: o,
    objectIds: i,
    clusterCounts: s
  };
}
const Ze = 4;
function We(n, e) {
  const t = e * Ze;
  return n.args[t + 1] ?? 0;
}
const du = [
  { id: $t, label: "tile", vertexCountHint: 36 },
  { id: wi, label: "grass", vertexCountHint: 36 },
  { id: Vt, label: "water", vertexCountHint: 36 },
  { id: qt, label: "sand", vertexCountHint: 36 },
  { id: Yt, label: "snowfield", vertexCountHint: 36 },
  { id: jr, label: "wall", vertexCountHint: 36 },
  { id: $r, label: "sakura", vertexCountHint: 12 },
  { id: Vr, label: "flag", vertexCountHint: 12 },
  { id: qr, label: "fire", vertexCountHint: 6 },
  { id: Yr, label: "billboard", vertexCountHint: 6 },
  { id: Zr, label: "block", vertexCountHint: 36 }
];
function Si() {
  return {
    version: 0,
    args: new Uint32Array(Xr * Ze),
    dirtyRanges: []
  };
}
function fu(n, e) {
  if (n.length !== e.length)
    return e.length > 0 ? [{ start: 0, end: e.length / Ze }] : [];
  const t = [];
  let r = -1;
  const o = e.length / Ze;
  for (let i = 0; i < o; i += 1) {
    const s = i * Ze;
    let a = !1;
    for (let u = 0; u < Ze; u += 1)
      if ((n[s + u] ?? 0) !== (e[s + u] ?? 0)) {
        a = !0;
        break;
      }
    if (a) {
      r < 0 && (r = i);
      continue;
    }
    r >= 0 && (t.push({ start: r, end: i }), r = -1);
  }
  return r >= 0 && t.push({ start: r, end: o }), t;
}
function pu(n, e, t) {
  const r = new Uint32Array(Xr * Ze);
  for (const i of du) {
    const s = i.id * Ze;
    r[s] = i.vertexCountHint, r[s + 1] = e[i.id] ?? 0, r[s + 2] = 0, r[s + 3] = 0;
  }
  const o = t ?? Si();
  return {
    version: n,
    args: r,
    dirtyRanges: fu(o.args, r)
  };
}
function mu(n) {
  return {
    version: n.version,
    slices: n.dirtyRanges.map((e) => {
      const t = e.start * Ze, r = (e.end - e.start) * Ze;
      return {
        byteOffset: t * n.args.BYTES_PER_ELEMENT,
        elementOffset: t,
        elementCount: r,
        data: n.args.subarray(t, t + r)
      };
    })
  };
}
const hn = 4, gn = 5;
function Mi() {
  return {
    version: 0,
    count: 0,
    spatial: new Float32Array(0),
    meta: new Int32Array(0),
    spatialDirty: [],
    metaDirty: []
  };
}
function hu(n) {
  const e = new Float32Array(n.ids.length * hn);
  for (let t = 0; t < n.ids.length; t += 1) {
    const r = t * hn;
    e[r] = n.centerX[t] ?? 0, e[r + 1] = n.centerY[t] ?? 0, e[r + 2] = n.centerZ[t] ?? 0, e[r + 3] = n.radius[t] ?? 0;
  }
  return e;
}
function gu(n) {
  const e = new Int32Array(n.ids.length * gn);
  for (let t = 0; t < n.ids.length; t += 1) {
    const r = t * gn;
    e[r] = n.cellX[t] ?? 0, e[r + 1] = n.cellZ[t] ?? 0, e[r + 2] = n.kinds[t] ?? 0, e[r + 3] = n.subKinds[t] ?? 0, e[r + 4] = n.memberCount[t] ?? 0;
  }
  return e;
}
function Do(n, e, t) {
  if (n.length !== e.length)
    return e.length > 0 ? [{ start: 0, end: Math.ceil(e.length / t) }] : [];
  const r = [];
  let o = -1;
  const i = Math.ceil(e.length / t);
  for (let s = 0; s < i; s += 1) {
    const a = s * t;
    let u = !1;
    for (let c = 0; c < t; c += 1)
      if ((n[a + c] ?? 0) !== (e[a + c] ?? 0)) {
        u = !0;
        break;
      }
    if (u) {
      o < 0 && (o = s);
      continue;
    }
    o >= 0 && (r.push({ start: o, end: s }), o = -1);
  }
  return o >= 0 && r.push({ start: o, end: i }), r;
}
function yu(n, e) {
  const t = hu(n), r = gu(n), o = e ?? Mi();
  return {
    version: n.version,
    count: n.ids.length,
    spatial: t,
    meta: r,
    spatialDirty: Do(o.spatial, t, hn),
    metaDirty: Do(o.meta, r, gn)
  };
}
function Fo(n, e, t) {
  return t.map((r) => {
    const o = r.start * e, i = (r.end - r.start) * e;
    return {
      byteOffset: o * n.BYTES_PER_ELEMENT,
      elementOffset: o,
      elementCount: i,
      data: n.subarray(o, o + i)
    };
  });
}
function bu(n) {
  return {
    version: n.version,
    count: n.count,
    spatial: Fo(n.spatial, hn, n.spatialDirty),
    meta: Fo(n.meta, gn, n.metaDirty)
  };
}
const vu = 8, xu = 128;
function yn() {
  return {
    backend: "none",
    uploadedVersion: 0,
    spatialBuffer: null,
    metaBuffer: null,
    indirectArgsBuffer: null,
    spatialBytes: 0,
    metaBytes: 0,
    indirectArgsBytes: 0
  };
}
function Kr(n) {
  if (typeof n != "object" || n === null) return null;
  const e = n, t = e.backend?.device ?? e.device ?? null;
  return !t || typeof t.createBuffer != "function" || typeof t.queue?.writeBuffer != "function" ? null : t;
}
function Ut(n) {
  n?.destroy && n.destroy();
}
function wu(n) {
  Ut(n.spatialBuffer), Ut(n.metaBuffer), Ut(n.indirectArgsBuffer);
}
function _r(n, e, t, r, o) {
  return r <= 0 ? (Ut(e), null) : e && t === r ? e : (Ut(e), n.createBuffer({
    label: o,
    size: r,
    usage: xu | vu
  }));
}
function Su(n, e, t) {
  const r = bu(t), o = t.spatial.byteLength, i = t.meta.byteLength, s = _r(
    n,
    e.spatialBuffer,
    e.spatialBytes,
    o,
    "building-spatial"
  ), a = _r(
    n,
    e.metaBuffer,
    e.metaBytes,
    i,
    "building-meta"
  );
  if (s)
    for (const u of r.spatial)
      n.queue.writeBuffer(s, u.byteOffset, u.data);
  if (a)
    for (const u of r.meta)
      n.queue.writeBuffer(a, u.byteOffset, u.data);
  return {
    backend: "webgpu",
    uploadedVersion: t.version,
    spatialBuffer: s,
    metaBuffer: a,
    indirectArgsBuffer: e.indirectArgsBuffer,
    spatialBytes: o,
    metaBytes: i,
    indirectArgsBytes: e.indirectArgsBytes
  };
}
function Mu(n, e, t) {
  const r = mu(t), o = t.args.byteLength, i = _r(
    n,
    e.indirectArgsBuffer,
    e.indirectArgsBytes,
    o,
    "building-indirect-args"
  );
  if (i)
    for (const s of r.slices)
      n.queue.writeBuffer(i, s.byteOffset, s.data);
  return {
    ...e,
    backend: "webgpu",
    uploadedVersion: Math.max(e.uploadedVersion, t.version),
    indirectArgsBuffer: i,
    indirectArgsBytes: o
  };
}
const Lo = xi(), Go = Mi(), Oo = yn(), Uo = Si(), ke = we((n) => ({
  snapshot: Lo,
  gpuMirror: Go,
  uploadResources: Oo,
  drawMirror: Uo,
  setSnapshot: (e) => n({ snapshot: e }),
  setGpuMirror: (e) => n({ gpuMirror: e }),
  setUploadResources: (e) => n({ uploadResources: e }),
  setDrawMirror: (e) => n({ drawMirror: e }),
  reset: () => n({ snapshot: Lo, gpuMirror: Go, uploadResources: Oo, drawMirror: Uo })
}));
function an(n, e) {
  if (n === e) return !0;
  if (n.size !== e.size) return !1;
  for (const t of n)
    if (!e.has(t)) return !1;
  return !0;
}
const Ke = /* @__PURE__ */ new Set(), ft = we((n) => ({
  initialized: !1,
  visibleTileGroupIds: Ke,
  visibleWallGroupIds: Ke,
  visibleBlockIds: Ke,
  visibleObjectIds: Ke,
  setVisible: ({ tileIds: e, wallIds: t, blockIds: r, objectIds: o }) => n((i) => {
    const s = !an(i.visibleTileGroupIds, e), a = !an(i.visibleWallGroupIds, t), u = r ?? Ke, c = !an(i.visibleBlockIds, u), f = !an(i.visibleObjectIds, o);
    return !s && !a && !c && !f && i.initialized ? i : {
      initialized: !0,
      visibleTileGroupIds: s ? e : i.visibleTileGroupIds,
      visibleWallGroupIds: a ? t : i.visibleWallGroupIds,
      visibleBlockIds: c ? u : i.visibleBlockIds,
      visibleObjectIds: f ? o : i.visibleObjectIds
    };
  }),
  reset: () => n({
    initialized: !1,
    visibleTileGroupIds: Ke,
    visibleWallGroupIds: Ke,
    visibleBlockIds: Ke,
    visibleObjectIds: Ke
  })
}));
function Cu({
  size: n = ie.DEFAULT_GRID_SIZE,
  divisions: e = n / ie.GRID_CELL_SIZE,
  color1: t = "#888888",
  color2: r = "#444444"
}) {
  return /* @__PURE__ */ l(
    "gridHelper",
    {
      args: [n, e, t, r],
      position: [0, 0.01, 0]
    }
  );
}
var ku = Object.defineProperty, Iu = Object.getOwnPropertyDescriptor, Kt = (n, e, t, r) => {
  for (var o = Iu(e, t), i = n.length - 1, s; i >= 0; i--)
    (s = n[i]) && (o = s(e, t, o) || o);
  return o && ku(e, t, o), o;
};
class lt {
  materials = /* @__PURE__ */ new Map();
  textures = /* @__PURE__ */ new Map();
  textureLoader;
  constructor() {
    this.textureLoader = new v.TextureLoader();
  }
  getMaterial(e) {
    const t = this.materials.get(e.id);
    if (t) return t;
    const r = this.createMaterial(e);
    return this.materials.set(e.id, r), r;
  }
  createMaterial(e) {
    const t = {
      color: e.color || "#ffffff",
      roughness: e.roughness || 0.5,
      metalness: e.metalness || 0,
      opacity: e.opacity || 1,
      transparent: e.transparent || !1
    };
    if (Te()) {
      const r = e.material === "GLASS", o = new v.MeshToonMaterial({
        color: e.color || "#ffffff",
        opacity: r ? 0.45 : e.opacity || 1,
        transparent: r ? !0 : e.transparent || !1,
        gradientMap: pt(r ? 2 : 4)
      });
      return e.mapTextureUrl && (o.map = this.loadTexture(e.mapTextureUrl)), e.normalTextureUrl && (o.normalMap = this.loadTexture(e.normalTextureUrl)), o;
    }
    return e.material === "GLASS" ? new v.MeshPhysicalMaterial({
      ...t,
      transmission: 0.98,
      roughness: 0.1,
      envMapIntensity: 1
    }) : (e.mapTextureUrl && (t.map = this.loadTexture(e.mapTextureUrl)), e.normalTextureUrl && (t.normalMap = this.loadTexture(e.normalTextureUrl)), new v.MeshStandardMaterial(t));
  }
  // 텍스처는 메모리를 많이 사용할 수 있음
  loadTexture(e) {
    const t = this.textures.get(e);
    if (t) return t;
    const r = this.textureLoader.load(e);
    return r.wrapS = v.RepeatWrapping, r.wrapT = v.RepeatWrapping, r.needsUpdate = !0, this.textures.set(e, r), r;
  }
  updateMaterial(e, t) {
    const r = this.materials.get(e);
    r && (r instanceof v.MeshStandardMaterial ? (t.color && r.color.set(t.color), t.roughness !== void 0 && (r.roughness = t.roughness), t.metalness !== void 0 && (r.metalness = t.metalness), t.opacity !== void 0 && (r.opacity = t.opacity), r.needsUpdate = !0) : r instanceof v.MeshToonMaterial && (t.color && r.color.set(t.color), t.opacity !== void 0 && (r.opacity = t.opacity), r.needsUpdate = !0));
  }
  dispose() {
    this.materials.forEach((e) => e.dispose()), this.materials.clear(), this.textures.forEach((e) => e.dispose()), this.textures.clear();
  }
}
Kt([
  Zt(),
  Br()
], lt.prototype, "getMaterial");
Kt([
  Zt(),
  Br()
], lt.prototype, "createMaterial");
Kt([
  Zt(),
  Qi(20)
], lt.prototype, "loadTexture");
Kt([
  Zt(),
  Br()
], lt.prototype, "updateMaterial");
Kt([
  Zt()
], lt.prototype, "dispose");
const Wo = {
  id: "default-block",
  color: "#8b8174",
  material: "STANDARD",
  roughness: 0.92
};
function Au(n) {
  return {
    width: Math.max(1, Math.round(n.size?.x ?? 1)) * ie.GRID_CELL_SIZE,
    height: Math.max(1, Math.round(n.size?.y ?? 1)) * ie.HEIGHT_STEP,
    depth: Math.max(1, Math.round(n.size?.z ?? 1)) * ie.GRID_CELL_SIZE
  };
}
function Pr(n) {
  const { width: e, height: t, depth: r } = Au(n);
  return {
    position: [
      n.position.x - ie.GRID_CELL_SIZE * 0.5 + e * 0.5,
      n.position.y + t * 0.5,
      n.position.z - ie.GRID_CELL_SIZE * 0.5 + r * 0.5
    ],
    scale: [e, t, r]
  };
}
function Tu({
  blocks: n,
  meshes: e,
  isEditMode: t = !1,
  onBlockClick: r
}) {
  const o = E(new lt()), i = F(() => new v.Object3D(), []), s = F(() => new v.BoxGeometry(1, 1, 1), []), a = F(
    () => new v.MeshStandardMaterial({
      color: "#ff3344",
      transparent: !0,
      opacity: 0.58,
      emissive: new v.Color("#ff3344"),
      emissiveIntensity: 0.18
    }),
    []
  ), u = F(() => {
    const c = /* @__PURE__ */ new Map();
    for (const d of n) {
      const p = d.materialId ?? Wo.id, h = c.get(p) ?? [];
      h.push(d), c.set(p, h);
    }
    const f = o.current;
    return Array.from(c.entries()).map(([d, p]) => ({
      key: d,
      blocks: p,
      material: f.getMaterial(e.get(d) ?? { ...Wo, id: d })
    }));
  }, [n, e]);
  return L(() => () => {
    o.current.dispose(), s.dispose(), a.dispose();
  }, [a, s]), /* @__PURE__ */ b(Se, { children: [
    !t && n.length > 0 && /* @__PURE__ */ l(Mt, { type: "fixed", colliders: !1, children: n.map((c) => {
      const f = Pr(c);
      return /* @__PURE__ */ l(
        Gr,
        {
          position: f.position,
          args: [
            f.scale[0] * 0.5,
            f.scale[1] * 0.5,
            f.scale[2] * 0.5
          ]
        },
        c.id
      );
    }) }),
    u.map((c) => /* @__PURE__ */ l(
      _u,
      {
        batch: c,
        geometry: s,
        dummy: i
      },
      c.key
    )),
    t && n.map((c) => {
      const f = Pr(c);
      return /* @__PURE__ */ l(
        "mesh",
        {
          name: `block-edit-${c.id}`,
          position: f.position,
          scale: [
            f.scale[0] * 0.82,
            f.scale[1] * 0.82,
            f.scale[2] * 0.82
          ],
          geometry: s,
          material: a,
          onClick: () => r?.(c.id)
        },
        `${c.id}-edit`
      );
    })
  ] });
}
function _u({
  batch: n,
  geometry: e,
  dummy: t
}) {
  const r = E(null);
  return Fe(() => {
    const o = r.current;
    if (o) {
      o.count = n.blocks.length;
      for (let i = 0; i < n.blocks.length; i += 1) {
        const s = n.blocks[i];
        if (!s) continue;
        const a = Pr(s);
        t.position.set(...a.position), t.scale.set(...a.scale), t.rotation.set(0, 0, 0), t.updateMatrix(), o.setMatrixAt(i, t.matrix);
      }
      o.instanceMatrix.needsUpdate = !0, n.blocks.length > 0 && (o.computeBoundingBox(), o.computeBoundingSphere());
    }
  }, [n.blocks, t]), /* @__PURE__ */ l(
    "instancedMesh",
    {
      ref: r,
      name: `block-system-${n.key}`,
      args: [e, n.material, Math.max(1, n.blocks.length)],
      castShadow: !0,
      receiveShadow: !0
    }
  );
}
function Pu(n, e, t, r) {
  const o = document.createElement("canvas"), i = 512, s = Math.round(i * (t / e));
  o.width = i, o.height = s;
  const a = o.getContext("2d");
  a.fillStyle = "#0a0a0a", a.fillRect(0, 0, i, s), a.strokeStyle = "#333", a.lineWidth = 4, a.strokeRect(2, 2, i - 4, s - 4), a.fillStyle = r;
  const u = Math.floor(s * 0.25);
  a.font = `bold ${u}px monospace`, a.textAlign = "center", a.textBaseline = "middle";
  const c = n.split(`
`), f = u * 1.3, d = s / 2 - (c.length - 1) * f / 2;
  c.forEach((h, x) => {
    a.fillText(h, i / 2, d + x * f, i - 20);
  });
  const p = new v.CanvasTexture(o);
  return p.needsUpdate = !0, p;
}
const Ci = 20, ki = 100, Ii = 3;
function Ru({
  imageUrl: n,
  width: e,
  height: t,
  color: r,
  toon: o
}) {
  const i = E(null), s = E(null), a = E(null), u = F(() => new v.Vector3(), []), f = o ?? Te() ? pt(3) : null, d = Fr(n), p = e ?? 2, h = t ?? 1.5, x = F(
    () => new v.Color(r || "#00ff88"),
    [r]
  ), y = F(() => new v.PlaneGeometry(p, h), [p, h]), g = F(
    () => new v.PlaneGeometry(p * 1.15, h * 1.15),
    [p, h]
  );
  return de((m) => {
    i.current.getWorldPosition(u);
    const w = m.camera.position.distanceTo(u), S = Ct(w, Ci, ki, Ii);
    s.current.emissiveIntensity = 2 * S, a.current.opacity = (0.2 + 0.05 * Math.sin(m.clock.elapsedTime * 2)) * S;
  }), L(
    () => () => {
      y.dispose(), g.dispose();
    },
    [y, g]
  ), /* @__PURE__ */ b("group", { position: [0, h / 2 + 1, 0], children: [
    /* @__PURE__ */ l("mesh", { geometry: g, position: [0, 0, -0.01], children: /* @__PURE__ */ l(
      "meshBasicMaterial",
      {
        ref: a,
        color: x,
        transparent: !0,
        opacity: 0.25,
        blending: v.AdditiveBlending,
        depthWrite: !1,
        side: v.DoubleSide
      }
    ) }),
    /* @__PURE__ */ l("mesh", { ref: i, geometry: y, children: f ? /* @__PURE__ */ l(
      "meshToonMaterial",
      {
        ref: s,
        map: d,
        emissive: x,
        emissiveIntensity: 2,
        gradientMap: f,
        side: v.DoubleSide
      }
    ) : /* @__PURE__ */ l(
      "meshStandardMaterial",
      {
        ref: s,
        map: d,
        emissive: x,
        emissiveIntensity: 2,
        side: v.DoubleSide
      }
    ) })
  ] });
}
function Nu({ text: n, width: e, height: t, color: r, toon: o }) {
  const i = E(null), s = E(null), a = E(null), u = F(() => new v.Vector3(), []), f = o ?? Te() ? pt(3) : null, d = e ?? 2, p = t ?? 1.5, h = r || "#00ff88", x = F(
    () => Pu(n || "HELLO", d, p, h),
    [n, d, p, h]
  ), y = F(() => new v.Color(h), [h]), g = F(() => new v.PlaneGeometry(d, p), [d, p]), m = F(
    () => new v.PlaneGeometry(d * 1.15, p * 1.15),
    [d, p]
  );
  return de((w) => {
    i.current.getWorldPosition(u);
    const S = w.camera.position.distanceTo(u), C = Ct(S, Ci, ki, Ii);
    s.current.emissiveIntensity = 2 * C, a.current.opacity = (0.2 + 0.05 * Math.sin(w.clock.elapsedTime * 2)) * C;
  }), L(
    () => () => {
      g.dispose(), m.dispose(), x.dispose();
    },
    [g, m, x]
  ), /* @__PURE__ */ b("group", { position: [0, p / 2 + 1, 0], children: [
    /* @__PURE__ */ l("mesh", { geometry: m, position: [0, 0, -0.01], children: /* @__PURE__ */ l(
      "meshBasicMaterial",
      {
        ref: a,
        color: y,
        transparent: !0,
        opacity: 0.25,
        blending: v.AdditiveBlending,
        depthWrite: !1,
        side: v.DoubleSide
      }
    ) }),
    /* @__PURE__ */ l("mesh", { ref: i, geometry: g, children: f ? /* @__PURE__ */ l(
      "meshToonMaterial",
      {
        ref: s,
        map: x,
        emissive: y,
        emissiveIntensity: 2,
        gradientMap: f,
        side: v.DoubleSide
      }
    ) : /* @__PURE__ */ l(
      "meshStandardMaterial",
      {
        ref: s,
        map: x,
        emissive: y,
        emissiveIntensity: 2,
        side: v.DoubleSide
      }
    ) })
  ] });
}
const Eu = (n) => n.imageUrl ? /* @__PURE__ */ l(Ru, { ...n, imageUrl: n.imageUrl }) : /* @__PURE__ */ l(Nu, { ...n }), Bu = Ce.memo(Eu);
var zu = `varying vec2 vUv;\r
uniform float time;\r
uniform float intensity;\r
uniform float seed;\r
uniform float lean;\r
uniform float flare;\r
uniform vec3 tint;

float hash(vec2 p) {\r
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\r
}

float noise(vec2 p) {\r
  vec2 i = floor(p);\r
  vec2 f = fract(p);\r
  f = f * f * (3.0 - 2.0 * f);\r
  return mix(\r
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),\r
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),\r
    f.y\r
  );\r
}

float fbm(vec2 p) {\r
  float v = 0.0, a = 0.5;\r
  for (int i = 0; i < 3; i++) {\r
    v += a * noise(p);\r
    p = p * 2.1 + vec2(100.0);\r
    a *= 0.5;\r
  }\r
  return v;\r
}

void main() {\r
  vec2 uv = vUv;

  vec2 q = vec2(\r
    fbm(vec2(uv.x * 4.2 + seed * 5.1, uv.y * 5.8 - time * 1.5)),\r
    fbm(vec2(uv.x * 3.6 - seed * 3.3, uv.y * 4.6 + time * 0.6))\r
  );\r
  float n1 = fbm(uv * vec2(3.8, 5.6) + q * 1.5 + vec2(seed * 2.0, -time * 1.1));\r
  float n2 = noise(vec2(uv.y * 9.0 + seed * 11.0, time * 4.7 + seed * 17.0));

  float skew = lean * pow(uv.y, 1.2);\r
  float sway = (n1 - 0.5) * 0.28 * (1.0 - uv.y * 0.35);\r
  float x = (uv.x - 0.5) - skew + sway;\r
  float w = mix(0.46 * flare, 0.02, pow(uv.y, 0.72));

  float edgeTurb = q.x * 0.07 * uv.y;\r
  float body = 1.0 - smoothstep(w - edgeTurb, w + 0.06, abs(x));\r
  float tongue1 = 1.0 - smoothstep(w * 0.82, w * 0.82 + 0.06, abs(x + 0.12 + q.y * 0.08));\r
  float tongue2 = 1.0 - smoothstep(w * 0.68, w * 0.68 + 0.07, abs(x - 0.1 + q.x * 0.06));

  float baseGlow = 1.0 - smoothstep(0.1, 0.42, distance(uv, vec2(0.5 + skew * 0.1, 0.1)));\r
  float plume = max(body, max(tongue1 * 0.82, tongue2 * 0.68));

  float bite = smoothstep(0.55, 1.0, n1 + uv.y * 0.4);\r
  plume *= mix(1.0, 0.72, bite * smoothstep(0.2, 0.85, uv.y));\r
  plume *= 1.0 - smoothstep(0.8, 1.0, uv.y);\r
  plume = smoothstep(0.14, 0.9, plume + baseGlow * 0.38 + n1 * 0.2);

  float core = 1.0 - smoothstep(0.01, 0.14, abs(x));\r
  float fire = clamp(plume * (0.85 + 0.15 * n2), 0.0, 1.0);

  vec3 deepRed = vec3(0.35, 0.02, 0.0);\r
  vec3 ember   = vec3(0.65, 0.08, 0.01);\r
  vec3 orange  = vec3(1.0, 0.38, 0.04);\r
  vec3 golden  = vec3(1.0, 0.65, 0.18);\r
  vec3 hot     = vec3(1.0, 0.88, 0.55);\r
  vec3 white   = vec3(1.0, 0.97, 0.92);

  vec3 color = mix(deepRed, ember, smoothstep(0.02, 0.15, fire));\r
  color = mix(color, orange, smoothstep(0.12, 0.35, fire));\r
  color = mix(color, golden, smoothstep(0.28, 0.52, fire));\r
  color = mix(color, hot, smoothstep(0.45, 0.72, fire));\r
  color = mix(color, white, smoothstep(0.62, 1.0, fire * core));

  float trail = smoothstep(0.8, 1.0, n2 + n1 * 0.3)\r
    * smoothstep(0.18, 0.7, uv.y)\r
    * smoothstep(0.35, 0.0, abs(x));\r
  color += trail * vec3(1.0, 0.4, 0.06) * 0.4;

  float smokeY = smoothstep(0.75, 0.98, uv.y);\r
  float smoke = smokeY * q.x * 0.22 * smoothstep(0.28, 0.0, abs(x));\r
  color = mix(color, vec3(0.18, 0.14, 0.12), smoke);

  float alpha = smoothstep(0.06, 0.35, fire) * min(1.0, 0.5 + intensity * 0.26);\r
  alpha += trail * 0.15 + smoke * 0.3;

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(color * tint * (0.62 + intensity * 0.48), alpha);\r
}`, Du = `varying vec2 vUv;\r
uniform float seed;\r
uniform float lean;\r
uniform float time;

void main() {\r
  vUv = uv;

  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);\r
  vec3 up = vec3(0.0, 1.0, 0.0);\r
  float uy = clamp(uv.y, 0.0, 1.0);

  float sway = sin(time * 0.7 + seed * 3.14) * 0.04 * uy;\r
  float bend = lean * pow(uy, 1.35) * (0.35 + uy * 0.65);\r
  float wobble = sin((uy * 6.0 + seed * 5.73) + position.y * 1.15) * 0.03 * uy;\r
  float lift = sin(uv.x * 3.14159 + seed * 3.7) * 0.015 * uy;

  vec3 billboarded = right * (position.x + bend + wobble + sway) + up * (position.y + lift);

  vec4 center = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);\r
  center.xyz += billboarded;

  gl_Position = projectionMatrix * viewMatrix * center;\r
}`;
const Fu = Lr(
  { time: 0, intensity: 1.5, seed: 0, lean: 0, flare: 1, tint: new v.Color(1, 1, 1) },
  Du,
  zu
);
An({ FireMaterial: Fu });
const Lu = `
attribute float aLife;
attribute float aSpeed;
attribute float aDrift;
varying float vAlpha;
varying float vHeat;
uniform float uTime;

void main() {
  float t = fract(uTime * aSpeed + aLife);
  vec3 pos = position;
  float angle = t * 8.0 + aDrift;
  float radius = 0.08 + t * 0.2;
  pos.y += t * t * 3.2;
  pos.x += sin(angle) * radius;
  pos.z += cos(angle) * radius;
  float flicker = 0.75 + 0.25 * sin(uTime * 14.0 + aDrift * 4.0);
  vAlpha = (1.0 - t) * (1.0 - t) * 0.9 * flicker;
  vHeat = 1.0 - t * 0.85;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = mix(4.5, 0.6, t) * (220.0 / -mvPosition.z);
}
`, Ai = `
varying float vAlpha;
varying float vHeat;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float glow = smoothstep(0.5, 0.05, d);
  vec3 red = vec3(0.75, 0.12, 0.02);
  vec3 orange = vec3(1.0, 0.5, 0.08);
  vec3 hot = vec3(1.0, 0.92, 0.65);
  vec3 color = mix(red, orange, vHeat);
  color = mix(color, hot, vHeat * vHeat);
  gl_FragColor = vec4(color * glow * 1.4, vAlpha * glow);
}
`, Nt = 18;
let or = null, ir = null;
function Ti() {
  return or || (or = {
    log: new v.CylinderGeometry(0.035, 0.045, 0.5, 5),
    charcoal: new v.CircleGeometry(0.18, 6),
    glow: new v.CircleGeometry(0.7, 8)
  }), or;
}
function _i() {
  return ir || (ir = {
    log: new v.MeshStandardMaterial({ color: 2759178, roughness: 1 }),
    charcoal: new v.MeshStandardMaterial({
      color: 1118481,
      roughness: 1,
      emissive: new v.Color("#3a0c00"),
      emissiveIntensity: 0.8
    }),
    ember: new v.ShaderMaterial({
      vertexShader: Lu,
      fragmentShader: Ai,
      uniforms: { uTime: { value: 0 } },
      transparent: !0,
      depthWrite: !1,
      blending: v.AdditiveBlending
    })
  }), ir;
}
const Gu = ({ intensity: n = 1.5, width: e = 1, height: t = 1.5, color: r = "#ffffff" }) => {
  const o = F(() => new v.Color(r), [r]), i = Ti(), s = _i(), a = F(() => Math.max(0.4, (e + t * 0.5) / 1.5), [e, t]), u = F(() => [
    { w: e * 0.78, h: t, x: 0, y: t * 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1, speed: 1.45, tOff: 0, iMul: 1 },
    { w: e * 0.52, h: t * 0.85, x: -e * 0.12, y: t * 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
    { w: e * 0.42, h: t * 0.7, x: e * 0.14, y: t * 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 }
  ], [e, t]), c = F(
    () => u.map(() => Ce.createRef()),
    [u]
  ), f = F(
    () => u.map((p) => new v.PlaneGeometry(p.w, p.h)),
    [u]
  ), d = F(() => {
    const p = new v.BufferGeometry(), h = new Float32Array(Nt * 3), x = new Float32Array(Nt), y = new Float32Array(Nt), g = new Float32Array(Nt);
    for (let m = 0; m < Nt; m++)
      h[m * 3] = (Math.random() - 0.5) * e * 0.35, h[m * 3 + 1] = Math.random() * t * 0.2, h[m * 3 + 2] = (Math.random() - 0.5) * e * 0.35, x[m] = Math.random(), y[m] = 0.12 + Math.random() * 0.22, g[m] = Math.random() * Math.PI * 2;
    return p.setAttribute("position", new v.BufferAttribute(h, 3)), p.setAttribute("aLife", new v.BufferAttribute(x, 1)), p.setAttribute("aSpeed", new v.BufferAttribute(y, 1)), p.setAttribute("aDrift", new v.BufferAttribute(g, 1)), p;
  }, [e, t]);
  return de((p) => {
    const h = p.clock.elapsedTime;
    for (let y = 0; y < u.length; y++) {
      const g = c[y]?.current;
      if (!g) continue;
      const m = u[y];
      m && (g.time = h * m.speed + m.tOff, g.intensity = n * m.iMul, g.seed = m.seed, g.lean = m.lean, g.flare = m.flare, g.tint = o);
    }
    const x = s.ember.uniforms.uTime;
    x && (x.value = h);
  }), L(() => () => {
    f.forEach((p) => p.dispose()), d.dispose();
  }, [f, d]), /* @__PURE__ */ b("group", { children: [
    /* @__PURE__ */ l(
      "mesh",
      {
        geometry: i.glow,
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0.02, 0],
        scale: [e, e, 1],
        children: /* @__PURE__ */ l(
          "meshBasicMaterial",
          {
            color: o,
            transparent: !0,
            opacity: 0.18,
            blending: v.AdditiveBlending,
            depthWrite: !1
          }
        )
      }
    ),
    /* @__PURE__ */ l(
      "mesh",
      {
        geometry: i.charcoal,
        material: s.charcoal,
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0.018, 0],
        scale: [e, e, 1]
      }
    ),
    /* @__PURE__ */ l(
      "mesh",
      {
        geometry: i.log,
        material: s.log,
        position: [0.12 * a, 0.06 * a, 0.05 * a],
        rotation: [0.3, 0, 0.65],
        scale: a
      }
    ),
    /* @__PURE__ */ l(
      "mesh",
      {
        geometry: i.log,
        material: s.log,
        position: [-0.1 * a, 0.06 * a, 0.08 * a],
        rotation: [0.25, 1.2, -0.6],
        scale: a
      }
    ),
    /* @__PURE__ */ l(
      "mesh",
      {
        geometry: i.log,
        material: s.log,
        position: [0.02 * a, 0.06 * a, -0.13 * a],
        rotation: [-0.2, 0.6, 1],
        scale: a
      }
    ),
    u.map((p, h) => (() => {
      const x = f[h], y = c[h];
      return !x || !y ? null : /* @__PURE__ */ l("mesh", { geometry: x, position: [p.x, p.y, p.z], children: /* @__PURE__ */ l(
        "fireMaterial",
        {
          ref: y,
          transparent: !0,
          depthWrite: !1,
          side: v.DoubleSide,
          blending: v.AdditiveBlending
        }
      ) }, h);
    })()),
    /* @__PURE__ */ l("points", { geometry: d, material: s.ember })
  ] });
}, Em = Ce.memo(Gu), Ou = (
  /* glsl */
  `
attribute float aSeed;
attribute float aLean;
attribute float aFlare;
attribute float aIntensity;
attribute float aSpeed;
attribute float aTOff;
attribute float aWidth;
attribute float aHeight;
attribute vec3 aTint;
uniform float uTime;

varying vec2 vUv;
varying float vSeed;
varying float vLean;
varying float vFlare;
varying float vIntensity;
varying float vTime;
varying vec3 vTint;

void main() {
  vUv = uv;
  vSeed = aSeed;
  vLean = aLean;
  vFlare = aFlare;
  vIntensity = aIntensity;
  vTint = aTint;
  vTime = uTime * aSpeed + aTOff;

  vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
  vec3 up = vec3(0.0, 1.0, 0.0);

  float px = position.x * aWidth;
  float py = position.y * aHeight;
  float uy = clamp(uv.y, 0.0, 1.0);

  float sway = sin(vTime * 0.7 + aSeed * 3.14) * 0.04 * uy;
  float bend = aLean * pow(uy, 1.35) * (0.35 + uy * 0.65);
  float wobble = sin((uy * 6.0 + aSeed * 5.73) + py * 1.15) * 0.03 * uy;
  float lift = sin(uv.x * 3.14159 + aSeed * 3.7) * 0.015 * uy;

  vec3 billboarded = right * (px + bend + wobble + sway) + up * (py + lift);

  vec4 center = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  center.xyz += billboarded;

  gl_Position = projectionMatrix * viewMatrix * center;
}
`
), Uu = (
  /* glsl */
  `
varying vec2 vUv;
varying float vSeed;
varying float vLean;
varying float vFlare;
varying float vIntensity;
varying float vTime;
varying vec3 vTint;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = p * 2.1 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float time = vTime;
  float seed = vSeed;

  vec2 q = vec2(
    fbm(vec2(uv.x * 4.2 + seed * 5.1, uv.y * 5.8 - time * 1.5)),
    fbm(vec2(uv.x * 3.6 - seed * 3.3, uv.y * 4.6 + time * 0.6))
  );
  float n1 = fbm(uv * vec2(3.8, 5.6) + q * 1.5 + vec2(seed * 2.0, -time * 1.1));
  float n2 = noise(vec2(uv.y * 9.0 + seed * 11.0, time * 4.7 + seed * 17.0));

  float skew = vLean * pow(uv.y, 1.2);
  float sway = (n1 - 0.5) * 0.28 * (1.0 - uv.y * 0.35);
  float x = (uv.x - 0.5) - skew + sway;
  float w = mix(0.46 * vFlare, 0.02, pow(uv.y, 0.72));

  float edgeTurb = q.x * 0.07 * uv.y;
  float body = 1.0 - smoothstep(w - edgeTurb, w + 0.06, abs(x));
  float tongue1 = 1.0 - smoothstep(w * 0.82, w * 0.82 + 0.06, abs(x + 0.12 + q.y * 0.08));
  float tongue2 = 1.0 - smoothstep(w * 0.68, w * 0.68 + 0.07, abs(x - 0.1 + q.x * 0.06));

  float baseGlow = 1.0 - smoothstep(0.1, 0.42, distance(uv, vec2(0.5 + skew * 0.1, 0.1)));
  float plume = max(body, max(tongue1 * 0.82, tongue2 * 0.68));

  float bite = smoothstep(0.55, 1.0, n1 + uv.y * 0.4);
  plume *= mix(1.0, 0.72, bite * smoothstep(0.2, 0.85, uv.y));
  plume *= 1.0 - smoothstep(0.8, 1.0, uv.y);
  plume = smoothstep(0.14, 0.9, plume + baseGlow * 0.38 + n1 * 0.2);

  float core = 1.0 - smoothstep(0.01, 0.14, abs(x));
  float fire = clamp(plume * (0.85 + 0.15 * n2), 0.0, 1.0);

  vec3 deepRed = vec3(0.35, 0.02, 0.0);
  vec3 ember   = vec3(0.65, 0.08, 0.01);
  vec3 orange  = vec3(1.0, 0.38, 0.04);
  vec3 golden  = vec3(1.0, 0.65, 0.18);
  vec3 hot     = vec3(1.0, 0.88, 0.55);
  vec3 white   = vec3(1.0, 0.97, 0.92);

  vec3 color = mix(deepRed, ember, smoothstep(0.02, 0.15, fire));
  color = mix(color, orange, smoothstep(0.12, 0.35, fire));
  color = mix(color, golden, smoothstep(0.28, 0.52, fire));
  color = mix(color, hot, smoothstep(0.45, 0.72, fire));
  color = mix(color, white, smoothstep(0.62, 1.0, fire * core));

  float trail = smoothstep(0.8, 1.0, n2 + n1 * 0.3)
    * smoothstep(0.18, 0.7, uv.y)
    * smoothstep(0.35, 0.0, abs(x));
  color += trail * vec3(1.0, 0.4, 0.06) * 0.4;

  float smokeY = smoothstep(0.75, 0.98, uv.y);
  float smoke = smokeY * q.x * 0.22 * smoothstep(0.28, 0.0, abs(x));
  color = mix(color, vec3(0.18, 0.14, 0.12), smoke);

  float alpha = smoothstep(0.06, 0.35, fire) * min(1.0, 0.5 + vIntensity * 0.26);
  alpha += trail * 0.15 + smoke * 0.3;

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(color * vTint * (0.62 + vIntensity * 0.48), alpha);
}
`
), Wu = (
  /* glsl */
  `
attribute float aLife;
attribute float aSpeed;
attribute float aDrift;
attribute vec3 aFirePos;
uniform float uTime;
varying float vAlpha;
varying float vHeat;

void main() {
  float t = fract(uTime * aSpeed + aLife);
  vec3 pos = position;
  float angle = t * 8.0 + aDrift;
  float radius = 0.08 + t * 0.2;
  pos.y += t * t * 3.2;
  pos.x += sin(angle) * radius;
  pos.z += cos(angle) * radius;
  float flicker = 0.75 + 0.25 * sin(uTime * 14.0 + aDrift * 4.0);
  vAlpha = (1.0 - t) * (1.0 - t) * 0.9 * flicker;
  vHeat = 1.0 - t * 0.85;
  vec4 mvPosition = modelViewMatrix * vec4(pos + aFirePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = mix(4.5, 0.6, t) * (220.0 / -mvPosition.z);
}
`
), sr = [
  { wMul: 0.78, hMul: 1, xMul: 0, yMul: 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1, speed: 1.45, tOff: 0, iMul: 1 },
  { wMul: 0.52, hMul: 0.85, xMul: -0.12, yMul: 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
  { wMul: 0.42, hMul: 0.7, xMul: 0.14, yMul: 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 }
];
let ar = null, lr = null, cr = null;
function Hu() {
  return ar || (ar = new v.ShaderMaterial({
    vertexShader: Ou,
    fragmentShader: Uu,
    uniforms: { uTime: { value: 0 } },
    transparent: !0,
    depthWrite: !1,
    side: v.DoubleSide,
    blending: v.AdditiveBlending
  })), ar;
}
function ju() {
  return lr || (lr = new v.ShaderMaterial({
    vertexShader: Wu,
    fragmentShader: Ai,
    uniforms: { uTime: { value: 0 } },
    transparent: !0,
    depthWrite: !1,
    blending: v.AdditiveBlending
  })), lr;
}
function $u() {
  return cr || (cr = new v.MeshBasicMaterial({
    color: 16777215,
    transparent: !0,
    opacity: 0.18,
    blending: v.AdditiveBlending,
    depthWrite: !1
  })), cr;
}
const Et = new v.Object3D(), xe = new v.Object3D(), ln = new v.Matrix4(), Ho = new v.Color(), Vu = Ce.memo(function({ fires: e }) {
  const t = E(null), r = E(null), o = E(null), i = E(null), s = E(null), a = e.length, u = a * sr.length, c = a * 2, f = Ti(), d = _i(), p = Hu(), h = $u(), x = ju(), y = F(() => {
    if (a === 0) return null;
    const m = new v.PlaneGeometry(1, 1), w = new Float32Array(u), S = new Float32Array(u), C = new Float32Array(u), T = new Float32Array(u), M = new Float32Array(u), _ = new Float32Array(u), k = new Float32Array(u), R = new Float32Array(u), z = new Float32Array(u * 3);
    let N = 0;
    for (const P of e) {
      const B = new v.Color(P.color);
      for (const U of sr)
        w[N] = U.seed, S[N] = U.lean, C[N] = U.flare, T[N] = P.intensity * U.iMul, M[N] = U.speed, _[N] = U.tOff, k[N] = P.width * U.wMul, R[N] = P.height * U.hMul, z[N * 3] = B.r, z[N * 3 + 1] = B.g, z[N * 3 + 2] = B.b, N++;
    }
    return m.setAttribute("aSeed", new v.InstancedBufferAttribute(w, 1)), m.setAttribute("aLean", new v.InstancedBufferAttribute(S, 1)), m.setAttribute("aFlare", new v.InstancedBufferAttribute(C, 1)), m.setAttribute("aIntensity", new v.InstancedBufferAttribute(T, 1)), m.setAttribute("aSpeed", new v.InstancedBufferAttribute(M, 1)), m.setAttribute("aTOff", new v.InstancedBufferAttribute(_, 1)), m.setAttribute("aWidth", new v.InstancedBufferAttribute(k, 1)), m.setAttribute("aHeight", new v.InstancedBufferAttribute(R, 1)), m.setAttribute("aTint", new v.InstancedBufferAttribute(z, 3)), m;
  }, [e, a, u]), g = F(() => {
    if (a === 0) return null;
    const m = 18, w = a * m, S = new Float32Array(w * 3), C = new Float32Array(w), T = new Float32Array(w), M = new Float32Array(w), _ = new Float32Array(w * 3);
    for (let R = 0; R < a; R++) {
      const z = e[R], N = R * m;
      for (let P = 0; P < m; P++) {
        const B = N + P;
        S[B * 3] = (Math.random() - 0.5) * z.width * 0.35, S[B * 3 + 1] = Math.random() * z.height * 0.2, S[B * 3 + 2] = (Math.random() - 0.5) * z.width * 0.35, C[B] = Math.random(), T[B] = 0.12 + Math.random() * 0.22, M[B] = Math.random() * Math.PI * 2, _[B * 3] = z.position[0], _[B * 3 + 1] = z.position[1], _[B * 3 + 2] = z.position[2];
      }
    }
    const k = new v.BufferGeometry();
    return k.setAttribute("position", new v.BufferAttribute(S, 3)), k.setAttribute("aLife", new v.BufferAttribute(C, 1)), k.setAttribute("aSpeed", new v.BufferAttribute(T, 1)), k.setAttribute("aDrift", new v.BufferAttribute(M, 1)), k.setAttribute("aFirePos", new v.BufferAttribute(_, 3)), k.computeBoundingSphere(), k;
  }, [e, a]);
  return Fe(() => {
    if (a === 0) return;
    const m = t.current;
    if (!m) return;
    let w = 0;
    for (const S of e) {
      const C = Math.cos(S.rotation), T = Math.sin(S.rotation);
      for (const M of sr) {
        const _ = S.width * M.xMul, k = M.z;
        xe.position.set(
          S.position[0] + _ * C + k * T,
          S.position[1] + S.height * M.yMul,
          S.position[2] + k * C - _ * T
        ), xe.rotation.set(0, 0, 0), xe.scale.set(1, 1, 1), xe.updateMatrix(), m.setMatrixAt(w++, xe.matrix);
      }
    }
    m.count = u, m.instanceMatrix.needsUpdate = !0;
  }, [e, a, u]), Fe(() => {
    if (a === 0) return;
    const m = r.current;
    if (!m) return;
    let w = 0;
    for (const S of e) {
      Et.position.set(S.position[0], S.position[1], S.position[2]), Et.rotation.set(0, S.rotation, 0), Et.updateMatrix();
      const C = Math.max(0.4, (S.width + S.height * 0.5) / 1.5);
      xe.position.set(0.12 * C, 0.06 * C, 0.05 * C), xe.rotation.set(0.3, 0, 0.65), xe.scale.set(C, C, C), xe.updateMatrix(), ln.multiplyMatrices(Et.matrix, xe.matrix), m.setMatrixAt(w++, ln), xe.position.set(-0.1 * C, 0.06 * C, 0.08 * C), xe.rotation.set(0.25, 1.2, -0.6), xe.scale.set(C, C, C), xe.updateMatrix(), ln.multiplyMatrices(Et.matrix, xe.matrix), m.setMatrixAt(w++, ln);
    }
    m.count = c, m.instanceMatrix.needsUpdate = !0;
  }, [e, a, c]), Fe(() => {
    if (a === 0) return;
    const m = o.current;
    if (m) {
      for (let w = 0; w < a; w++) {
        const S = e[w];
        xe.position.set(S.position[0], S.position[1] + 0.018, S.position[2]), xe.rotation.set(-Math.PI / 2, 0, S.rotation), xe.scale.set(S.width, S.width, 1), xe.updateMatrix(), m.setMatrixAt(w, xe.matrix);
      }
      m.count = a, m.instanceMatrix.needsUpdate = !0;
    }
  }, [e, a]), Fe(() => {
    if (a === 0) return;
    const m = i.current;
    if (m) {
      for (let w = 0; w < a; w++) {
        const S = e[w];
        xe.position.set(S.position[0], S.position[1] + 0.02, S.position[2]), xe.rotation.set(-Math.PI / 2, 0, S.rotation), xe.scale.set(S.width, S.width, 1), xe.updateMatrix(), m.setMatrixAt(w, xe.matrix), Ho.set(S.color), m.setColorAt(w, Ho);
      }
      m.count = a, m.instanceMatrix.needsUpdate = !0, m.instanceColor && (m.instanceColor.needsUpdate = !0);
    }
  }, [e, a]), de((m) => {
    const w = m.clock.elapsedTime;
    p.uniforms.uTime.value = w, x.uniforms.uTime.value = w, h.opacity = 0.16 + Math.sin(w * 2.5) * 0.06;
  }), L(() => () => {
    y?.dispose(), g?.dispose();
  }, [y, g]), a === 0 ? null : /* @__PURE__ */ b(Se, { children: [
    y && /* @__PURE__ */ l(
      "instancedMesh",
      {
        ref: t,
        args: [y, p, u],
        frustumCulled: !1
      }
    ),
    /* @__PURE__ */ l("instancedMesh", { ref: r, args: [f.log, d.log, c] }),
    /* @__PURE__ */ l("instancedMesh", { ref: o, args: [f.charcoal, d.charcoal, a] }),
    /* @__PURE__ */ l("instancedMesh", { ref: i, args: [f.glow, h, a] }),
    g && /* @__PURE__ */ l("points", { ref: s, geometry: g, material: x, frustumCulled: !1 })
  ] });
});
var qu = `precision highp float;

uniform sampler2D map;\r
uniform float transmission;\r
uniform float envMapIntensity;

varying vec2 vUv;

void main() {\r
    vec4 texColor = texture2D(map, vUv);\r
    float alpha = texColor.a * (1.0 - transmission);\r
    if (alpha < 0.01) discard;\r
    gl_FragColor = vec4(texColor.rgb * envMapIntensity, alpha);\r
}`, Yu = `precision highp float;

uniform float time;\r
uniform float windStrength;

varying vec2 vUv;

void main() {\r
    vUv = uv;\r
    vec3 pos = position;

    float fixGradient = uv.x * uv.x;

    
    float phase = 0.0;\r
    #ifdef USE_INSTANCING\r
      phase = instanceMatrix[3][0] * 0.3 + instanceMatrix[3][2] * 0.5;\r
    #endif

    float wave1 = sin(uv.x * 4.0 + time * 1.0 + phase) * 0.12;\r
    float wave2 = sin(uv.x * 7.0 + time * 1.7 + 1.3 + phase * 0.7) * 0.06;\r
    float wave3 = sin(uv.x * 13.0 + time * 2.9 + 2.7 + phase * 1.3) * 0.025;

    float verticalRipple = sin(uv.y * 6.0 + time * 0.8 + phase * 0.4) * 0.02 * fixGradient;

    float displacement = (wave1 + wave2 + wave3) * fixGradient * windStrength;\r
    pos.z += displacement + verticalRipple;\r
    pos.y -= fixGradient * 0.03 * windStrength;

    vec4 mvPosition = vec4(pos, 1.0);\r
    #ifdef USE_INSTANCING\r
      mvPosition = instanceMatrix * mvPosition;\r
    #endif\r
    gl_Position = projectionMatrix * modelViewMatrix * mvPosition;\r
}`;
const Zu = Lr(
  {
    map: null,
    time: 0,
    windStrength: 1,
    transmission: 0.05,
    envMapIntensity: 1
  },
  Yu,
  qu
);
An({ FlagMaterial: Zu });
let Bt = null;
function Xu() {
  if (Bt) return Bt;
  const n = document.createElement("canvas");
  n.width = 4, n.height = 4;
  const e = n.getContext("2d");
  return e.fillStyle = "#cc2222", e.fillRect(0, 0, 4, 4), Bt = new v.CanvasTexture(n), Bt.needsUpdate = !0, Bt;
}
const Ku = new v.MeshStandardMaterial({ color: "#8B4513" }), Ju = new v.MeshStandardMaterial({ color: "#444444", metalness: 0.6, roughness: 0.3 }), le = new v.Object3D();
function Qu(n) {
  const e = [];
  for (const t of n)
    switch (In[t.style].poleType) {
      case "side": {
        const o = t.flagHeight + 2.5;
        le.position.set(t.x, t.y + o / 2, t.z), le.scale.set(1, o, 1), le.updateMatrix(), e.push(le.matrix.clone());
        break;
      }
      case "top": {
        const o = t.flagHeight + 1.5;
        le.position.set(t.x, t.y + o + 0.025, t.z), le.rotation.set(0, 0, Math.PI / 2), le.scale.set(1, t.flagWidth, 1), le.updateMatrix(), e.push(le.matrix.clone()), le.rotation.set(0, 0, 0);
        break;
      }
      case "frame": {
        const o = t.flagHeight + 0.5;
        le.position.set(t.x - t.flagWidth / 2, t.y + o / 2, t.z), le.scale.set(1, o, 1), le.updateMatrix(), e.push(le.matrix.clone()), le.position.set(t.x + t.flagWidth / 2, t.y + o / 2, t.z), le.updateMatrix(), e.push(le.matrix.clone()), le.position.set(t.x, t.y + o, t.z), le.rotation.set(0, 0, Math.PI / 2), le.scale.set(1, t.flagWidth + 0.05, 1), le.updateMatrix(), e.push(le.matrix.clone()), le.rotation.set(0, 0, 0), le.position.set(t.x, t.y + 0.025, t.z), le.rotation.set(0, 0, Math.PI / 2), le.scale.set(1, t.flagWidth + 0.05, 1), le.updateMatrix(), e.push(le.matrix.clone()), le.rotation.set(0, 0, 0);
        break;
      }
      case "both": {
        const o = t.flagHeight + 2.5;
        le.position.set(t.x - t.flagWidth / 2, t.y + o / 2, t.z), le.scale.set(1, o, 1), le.updateMatrix(), e.push(le.matrix.clone()), le.position.set(t.x + t.flagWidth / 2, t.y + o / 2, t.z), le.updateMatrix(), e.push(le.matrix.clone());
        break;
      }
    }
  return e;
}
function ed({ entries: n }) {
  const e = E(null), t = F(() => new v.BoxGeometry(0.05, 1, 0.05), []), r = F(() => Qu(n), [n]), o = r.length, i = F(() => Math.max(1, o), [o]), a = n.some((u) => u.style === "panel") ? Ju : Ku;
  return Fe(() => {
    const u = e.current;
    if (u) {
      u.count = o;
      for (let c = 0; c < o; c++) {
        const f = r[c];
        f && u.setMatrixAt(c, f);
      }
      u.instanceMatrix.needsUpdate = !0;
    }
  }, [r, o]), L(() => () => {
    t.dispose();
  }, [t]), o === 0 ? null : /* @__PURE__ */ l("instancedMesh", { ref: e, args: [t, a, i] });
}
function Pi({ entries: n, windStrength: e, texture: t }) {
  const r = E(null), o = E(null), i = n.length, s = F(() => Math.max(1, i), [i]), a = n[0]?.flagWidth ?? 1.5, u = n[0]?.flagHeight ?? 1, c = e > 0 ? 16 : 1, f = e > 0 ? 8 : 1, d = F(
    () => new v.PlaneGeometry(a, u, c, f),
    [a, u, c, f]
  );
  return Fe(() => {
    const p = r.current;
    if (p) {
      p.count = i;
      for (let h = 0; h < i; h++) {
        const x = n[h];
        if (!x) continue;
        const y = In[x.style];
        let g = x.x, m = x.y;
        switch (y.poleType) {
          case "side":
            g = x.x + x.flagWidth / 2, m = x.y + x.flagHeight + 2.5 - x.flagHeight / 2;
            break;
          case "top":
            m = x.y + x.flagHeight + 1.5 - x.flagHeight / 2;
            break;
          case "frame":
            m = x.y + (x.flagHeight + 0.5) / 2 + 0.025;
            break;
          case "both":
            m = x.y + x.flagHeight + 2.5 - x.flagHeight / 2;
            break;
        }
        le.position.set(g, m, x.z), le.scale.set(x.flagWidth / a, x.flagHeight / u, 1), le.updateMatrix(), p.setMatrixAt(h, le.matrix);
      }
      p.instanceMatrix.needsUpdate = !0;
    }
  }, [n, i, a, u]), de((p) => {
    const h = o.current;
    h.time = p.clock.elapsedTime * 5, h.windStrength = e;
  }), L(() => () => {
    d.dispose();
  }, [d]), i === 0 ? null : /* @__PURE__ */ l("instancedMesh", { ref: r, args: [d, void 0, s], frustumCulled: !1, children: /* @__PURE__ */ l(
    "flagMaterial",
    {
      ref: o,
      map: t,
      transmission: 0.05,
      windStrength: e,
      envMapIntensity: 1,
      side: v.DoubleSide,
      transparent: !0
    }
  ) });
}
function td({
  entries: n,
  textureUrl: e,
  windStrength: t
}) {
  const r = Fr(e);
  return /* @__PURE__ */ l(Pi, { entries: n, windStrength: t, texture: r });
}
function nd({
  entries: n,
  windStrength: e
}) {
  const t = F(() => Xu(), []);
  return /* @__PURE__ */ l(Pi, { entries: n, windStrength: e, texture: t });
}
function rd({
  entries: n,
  textureUrl: e,
  windStrength: t
}) {
  return e ? /* @__PURE__ */ l(td, { entries: n, textureUrl: e, windStrength: t }) : /* @__PURE__ */ l(nd, { entries: n, windStrength: t });
}
const od = Ce.memo(function({ flags: e }) {
  const t = F(
    () => e.map((o) => ({
      x: o.position.x,
      y: o.position.y,
      z: o.position.z,
      flagWidth: o.config?.flagWidth ?? 1.5,
      flagHeight: o.config?.flagHeight ?? 1,
      style: o.config?.flagStyle ?? "flag",
      textureUrl: o.config?.flagTexture ?? ""
    })),
    [e]
  ), r = F(() => {
    const o = /* @__PURE__ */ new Map();
    for (const i of t) {
      const s = `${i.textureUrl}|${i.style}`;
      let a = o.get(s);
      a || (a = [], o.set(s, a)), a.push(i);
    }
    return Array.from(o.entries());
  }, [t]);
  return /* @__PURE__ */ b(Se, { children: [
    /* @__PURE__ */ l(ed, { entries: t }),
    r.map(([o, i]) => {
      const s = i[0];
      if (!s) return null;
      const a = s.style, u = In[a].windStrength, c = s.textureUrl;
      return /* @__PURE__ */ l(
        rd,
        {
          entries: i,
          textureUrl: c,
          windStrength: u
        },
        o
      );
    })
  ] });
});
function te(n) {
  const e = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return e - Math.floor(e);
}
function Jr(n, e, t) {
  n[e] = t.r, n[e + 1] = t.g, n[e + 2] = t.b;
}
let ur = null, dr = null, fr = null;
function Ri() {
  return ur || (ur = {
    limb: new v.CylinderGeometry(0.5, 1, 1, 8, 1, !1),
    canopyCluster: new v.IcosahedronGeometry(1, 1),
    canopyCore: new v.SphereGeometry(1, 10, 8),
    trunkTop: new v.SphereGeometry(1, 10, 8)
  }), ur;
}
function Ni(n) {
  return n ? (fr || (fr = {
    bark: mt({ color: "#5e3d30", steps: 3 }),
    barkDark: mt({ color: "#3f271e", steps: 3 }),
    blossomShell: mt({ color: "#f7bfd2", transparent: !0, opacity: 0.78, steps: 4, depthWrite: !1 }),
    blossomCore: mt({ color: "#ffe6f0", transparent: !0, opacity: 0.6, steps: 4, depthWrite: !1 })
  }), fr) : (dr || (dr = {
    bark: new v.MeshStandardMaterial({ color: "#5e3d30", roughness: 0.95, metalness: 0.02 }),
    barkDark: new v.MeshStandardMaterial({ color: "#3f271e", roughness: 1, metalness: 0.01 }),
    blossomShell: new v.MeshStandardMaterial({ color: "#f7bfd2", roughness: 0.92, metalness: 0, transparent: !0, opacity: 0.68 }),
    blossomCore: new v.MeshStandardMaterial({ color: "#ffe6f0", roughness: 0.84, metalness: 0, transparent: !0, opacity: 0.5 })
  }), dr);
}
function Ei(n, e) {
  const t = Math.max(11, Math.min(18, Math.round(10 + n * 4)));
  return Array.from({ length: t }, (r, o) => {
    const i = 19.3 + o * 13.17 + n * 5.1, s = (1.05 + te(i + 1) * 1.35) * n, a = te(i + 2) > 0.5 ? 1 : -1;
    return {
      pivotY: e * (0.38 + te(i + 3) * 0.42),
      length: s,
      radius: (0.08 + te(i + 4) * 0.045) * n,
      yaw: te(i + 5) * Math.PI * 2,
      bend: (0.58 + te(i + 6) * 0.34) * a,
      lean: (te(i + 7) - 0.5) * 0.34,
      twigLength: s * (0.34 + te(i + 8) * 0.26),
      twigYaw: (te(i + 9) - 0.5) * 0.95,
      twigLean: (0.25 + te(i + 10) * 0.38) * -a
    };
  });
}
function Bi(n) {
  return Array.from({ length: 5 }, (e, t) => {
    const r = 101.2 + t * 8.31 + n * 3.7;
    return {
      angle: t / 5 * Math.PI * 2 + (te(r) - 0.5) * 0.4,
      length: (0.52 + te(r + 1) * 0.42) * n,
      radius: (0.09 + te(r + 2) * 0.04) * n,
      spread: (0.8 + te(r + 3) * 0.28) * (te(r + 4) > 0.5 ? 1 : -1)
    };
  });
}
function zi(n, e, t, r) {
  const o = Math.max(9, Math.min(16, Math.round(9 + n * 4)));
  return Array.from({ length: o }, (i, s) => {
    const a = 220.4 + s * 10.73 + n * 4.4, u = te(a) * Math.PI * 2, c = t * (0.18 + te(a + 1) * 0.72), f = (0.7 + te(a + 5) * 0.9) * n, d = (0.52 + te(a + 6) * 0.56) * n, p = (0.66 + te(a + 7) * 0.88) * n;
    return {
      position: [Math.cos(u) * c, e * (0.64 + te(a + 3) * 0.22) + te(a + 4) * r * 0.42, Math.sin(u) * c * (0.86 + te(a + 2) * 0.22)],
      rotation: [(te(a + 8) - 0.5) * 0.55, te(a + 9) * Math.PI * 2, (te(a + 10) - 0.5) * 0.55],
      outerScale: [f, d, p],
      innerScale: [f * 0.7, d * 0.72, p * 0.7]
    };
  });
}
const cn = new v.Object3D(), Ue = new v.Object3D(), Wt = new v.Matrix4(), bn = new v.Matrix4(), et = new v.Color();
function nt(n, e, t, r, o, i, s, a) {
  cn.position.set(r[0], r[1], r[2]), cn.rotation.set(o[0], o[1], o[2]), cn.updateMatrix(), Ue.position.set(i[0], i[1], i[2]), Ue.rotation.set(s ? s[0] : 0, s ? s[1] : 0, s ? s[2] : 0), Ue.scale.set(a[0], a[1], a[2]), Ue.updateMatrix(), Wt.multiplyMatrices(cn.matrix, Ue.matrix), t && (bn.makeTranslation(t[0], t[1] + 0.02, t[2]), Wt.premultiply(bn)), n.setMatrixAt(e, Wt);
}
function vn(n, e, t, r, o, i) {
  Ue.position.set(r[0], r[1], r[2]), Ue.rotation.set(o[0], o[1], o[2]), Ue.scale.set(i[0], i[1], i[2]), Ue.updateMatrix(), t ? (bn.makeTranslation(t[0], t[1] + 0.02, t[2]), Wt.multiplyMatrices(bn, Ue.matrix), n.setMatrixAt(e, Wt)) : n.setMatrixAt(e, Ue.matrix);
}
function Di(n, e, t, r, o, i, s, a, u, c, f) {
  const d = f ? f.clone().multiplyScalar(0.85) : new v.Color("#f3a1bf"), p = f ? f.clone().lerp(new v.Color("#ffffff"), 0.6) : new v.Color("#fff1f6"), h = new v.Color();
  for (let x = 0; x < r; x++) {
    const y = 330.7 + x * 17.13, g = te(y) * Math.PI * 2, m = i * (0.18 + Math.sqrt(te(y + 1)) * 0.86), w = (t + x) * 3;
    n[w] = Math.cos(g) * m * (0.82 + te(y + 2) * 0.22) + a, n[w + 1] = o * 0.58 + Math.pow(te(y + 4), 0.72) * s + (te(y + 5) - 0.5) * 0.36 + u, n[w + 2] = Math.sin(g) * m * (0.8 + te(y + 3) * 0.26) + c, h.copy(d).lerp(p, 0.28 + te(y + 6) * 0.72).multiplyScalar(0.92 + te(y + 7) * 0.18), Jr(e, w, h);
  }
}
function Fi(n, e, t, r, o, i, s, a, u) {
  const c = u ? u.clone().multiplyScalar(0.9) : new v.Color("#f7cadb"), f = u ? u.clone().lerp(new v.Color("#ffffff"), 0.7) : new v.Color("#fff3f8"), d = new v.Color();
  for (let p = 0; p < r; p++) {
    const h = 510.9 + p * 9.41, x = te(h) * Math.PI * 2, y = o * (0.18 + Math.pow(te(h + 1), 0.6) * 0.92), g = (t + p) * 3;
    n[g] = Math.cos(x) * y + i, n[g + 1] = 0.035 + te(h + 2) * 0.03 + s, n[g + 2] = Math.sin(x) * y + a, d.copy(c).lerp(f, 0.35 + te(h + 3) * 0.65).multiplyScalar(0.9 + te(h + 4) * 0.12), Jr(e, g, d);
  }
}
function Li(n, e, t, r, o, i, s, a, u, c, f, d, p, h, x, y) {
  const g = y ? y.clone().multiplyScalar(0.88) : new v.Color("#f8b3ca"), m = y ? y.clone().lerp(new v.Color("#ffffff"), 0.65) : new v.Color("#fff5fa"), w = new v.Color();
  for (let S = 0; S < a; S++) {
    const C = 740.6 + S * 6.83, T = te(C) * Math.PI * 2, M = c * (0.1 + te(C + 1) * 0.72), _ = s + S, k = _ * 3;
    n[k] = Math.cos(T) * M, n[k + 1] = u * 0.66 + te(C + 2) * f * 0.88, n[k + 2] = Math.sin(T) * M;
    const R = _ * 4;
    t[R] = 0.12 + te(C + 3) * 0.18, t[R + 1] = te(C + 4), t[R + 2] = 0.08 + te(C + 5) * 0.18, t[R + 3] = 1 + te(C + 6) * 1.9;
    const z = _ * 2;
    r[z] = (te(C + 7) - 0.5) * 0.8, r[z + 1] = (te(C + 8) - 0.5) * 0.8, o && (o[k] = p, o[k + 1] = h, o[k + 2] = x), i && (i[_] = 0.11 * d), w.copy(g).lerp(m, 0.2 + te(C + 9) * 0.8).multiplyScalar(0.94 + te(C + 10) * 0.12), Jr(e, k, w);
  }
}
function xn(n, e, t = !1) {
  const r = new v.BufferGeometry();
  return r.setAttribute("position", new v.Float32BufferAttribute(n, 3)), r.setAttribute("color", new v.Float32BufferAttribute(e, 3)), t && r.computeBoundingBox(), r.computeBoundingSphere(), r;
}
const dt = new v.Color("#f7bfd2"), Ot = new v.Color("#5e3d30"), id = new v.Color("#ffffff");
function sd(n) {
  return n.map((e) => {
    const t = v.MathUtils.clamp(e.size / 4, 0.95, 1.85), r = 3.8 * t, o = 1.65 * t + Math.min(e.size * 0.08, 0.55), i = 2.15 * t + Math.min(e.size * 0.04, 0.35);
    return {
      pos: e.position,
      scale: t,
      trunkHeight: r,
      crownRadius: o,
      crownHeight: i,
      branches: Ei(t, r),
      roots: Bi(t),
      clusters: zi(t, r, o, i),
      canopyN: Math.max(180, Math.min(420, Math.round(210 + t * 95))),
      groundN: Math.max(44, Math.min(120, Math.round(54 + t * 26))),
      fallingN: Math.max(52, Math.min(132, Math.round(62 + t * 30))),
      blossom: e.blossomColor ? new v.Color(e.blossomColor) : dt,
      bark: e.barkColor ? new v.Color(e.barkColor) : Ot
    };
  });
}
const ad = (
  /* glsl */
  `
attribute vec3 color;
attribute vec4 aParams1;
attribute vec2 aParams2;
attribute vec3 aTreePos;
attribute float aPointScale;

uniform float uTime;
uniform float uScale;
uniform float uWind;

varying vec3 vColor;

void main() {
  float cycle = fract(uTime * aParams1.x + aParams1.y);
  float drift = 1.0 - pow(cycle, 1.22);
  float w = uTime * aParams1.w + aParams1.y * 6.28318;

  vec3 localPos = vec3(
    position.x + sin(w) * aParams1.z * uWind + aParams2.x * cycle * uWind,
    0.18 + position.y * drift + sin(w * 0.6) * 0.06,
    position.z + cos(w * 0.82) * aParams1.z * 0.72 * uWind + aParams2.y * cycle * uWind
  );

  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(localPos + aTreePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = aPointScale * (uScale / -mvPosition.z);
}
`
), Gi = (
  /* glsl */
  `
uniform float uOpacity;
varying vec3 vColor;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;
  gl_FragColor = vec4(vColor, uOpacity * exp(-r2 * 8.0));
}
`
);
function ld({ trees: n, toon: e }) {
  const t = E(null), r = E(null), o = E(null), i = E(null), s = E(null), a = E(null), u = e ?? Te(), c = Ri(), f = Ni(u), d = F(() => sd(n), [n]), p = F(() => {
    let S = 0, C = 0, T = 0, M = 0, _ = 0, k = 0;
    for (const R of d)
      S += R.branches.length + 1, C += R.roots.length + R.branches.length, T += R.clusters.length, M += R.canopyN, _ += R.groundN, k += R.fallingN;
    return { bark: S, dark: C, top: d.length, cluster: T, canopy: M, ground: _, falling: k };
  }, [d]), h = F(() => d.length === 0 ? 1 : d.reduce((S, C) => S + C.scale, 0) / d.length, [d]), x = F(
    () => d.some((S) => S.blossom !== dt || S.bark !== Ot),
    [d]
  ), y = F(() => {
    const S = new Float32Array(p.canopy * 3), C = new Float32Array(p.canopy * 3);
    let T = 0;
    for (const M of d) {
      const _ = M.blossom !== dt ? M.blossom : void 0;
      Di(S, C, T, M.canopyN, M.trunkHeight, M.crownRadius, M.crownHeight, M.pos[0], M.pos[1] + 0.02, M.pos[2], _), T += M.canopyN;
    }
    return xn(S, C);
  }, [d, p.canopy]), g = F(() => {
    const S = new Float32Array(p.ground * 3), C = new Float32Array(p.ground * 3);
    let T = 0;
    for (const M of d) {
      const _ = M.blossom !== dt ? M.blossom : void 0;
      Fi(S, C, T, M.groundN, M.crownRadius, M.pos[0], M.pos[1] + 0.02, M.pos[2], _), T += M.groundN;
    }
    return xn(S, C);
  }, [d, p.ground]), m = F(() => {
    const S = p.falling, C = new Float32Array(S * 3), T = new Float32Array(S * 3), M = new Float32Array(S * 4), _ = new Float32Array(S * 2), k = new Float32Array(S * 3), R = new Float32Array(S);
    let z = 0;
    for (const P of d) {
      const B = P.blossom !== dt ? P.blossom : void 0;
      Li(
        C,
        T,
        M,
        _,
        k,
        R,
        z,
        P.fallingN,
        P.trunkHeight,
        P.crownRadius,
        P.crownHeight,
        P.scale,
        P.pos[0],
        P.pos[1] + 0.02,
        P.pos[2],
        B
      ), z += P.fallingN;
    }
    const N = new v.BufferGeometry();
    return N.setAttribute("position", new v.Float32BufferAttribute(C, 3)), N.setAttribute("color", new v.Float32BufferAttribute(T, 3)), N.setAttribute("aParams1", new v.Float32BufferAttribute(M, 4)), N.setAttribute("aParams2", new v.Float32BufferAttribute(_, 2)), N.setAttribute("aTreePos", new v.Float32BufferAttribute(k, 3)), N.setAttribute("aPointScale", new v.Float32BufferAttribute(R, 1)), N.computeBoundingSphere(), N;
  }, [d, p.falling]), w = F(() => new v.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: 1 },
      uOpacity: { value: 0.88 },
      uWind: { value: 1 }
    },
    vertexShader: ad,
    fragmentShader: Gi,
    transparent: !0,
    depthWrite: !1
  }), []);
  return Fe(() => {
    let S = 0, C = 0, T = 0, M = 0, _ = 0;
    for (const k of d) {
      const R = k.pos, z = k.bark !== Ot, N = k.blossom !== dt;
      if (nt(
        t.current,
        S,
        R,
        [0, k.trunkHeight * 0.5, 0],
        [0.02, 0, -0.04],
        [0, 0, 0],
        null,
        [0.3 * k.scale, k.trunkHeight, 0.3 * k.scale]
      ), x && t.current.setColorAt(S, z ? k.bark : Ot), S++, nt(
        o.current,
        T,
        R,
        [0, k.trunkHeight * 0.5, 0],
        [0.02, 0, -0.04],
        [0, k.trunkHeight * 0.48, 0],
        null,
        [0.24 * k.scale, 0.32 * k.scale, 0.24 * k.scale]
      ), x) {
        const P = z ? et.copy(k.bark).multiplyScalar(0.65) : et.set("#3f271e");
        o.current.setColorAt(T, P);
      }
      T++;
      for (const P of k.branches)
        nt(
          t.current,
          S,
          R,
          [0, P.pivotY, 0],
          [P.lean, P.yaw, P.bend],
          [0, P.length * 0.5, 0],
          null,
          [P.radius, P.length, P.radius]
        ), x && t.current.setColorAt(S, z ? k.bark : Ot), S++;
      for (const P of k.roots) {
        if (nt(
          r.current,
          C,
          R,
          [0, 0.14 * k.scale, 0],
          [0, P.angle, P.spread],
          [0, P.length * 0.22, 0],
          null,
          [P.radius, P.length, P.radius]
        ), x) {
          const B = z ? et.copy(k.bark).multiplyScalar(0.65) : et.set("#3f271e");
          r.current.setColorAt(C, B);
        }
        C++;
      }
      for (const P of k.branches) {
        if (nt(
          r.current,
          C,
          R,
          [0, P.pivotY, 0],
          [P.lean, P.yaw, P.bend],
          [0, P.length * 0.76, 0],
          [P.twigLean, P.twigYaw, P.bend * -0.42],
          [P.radius * 0.52, P.twigLength, P.radius * 0.52]
        ), x) {
          const B = z ? et.copy(k.bark).multiplyScalar(0.65) : et.set("#3f271e");
          r.current.setColorAt(C, B);
        }
        C++;
      }
      for (const P of k.clusters) {
        if (vn(i.current, M, R, P.position, P.rotation, P.outerScale), x && i.current.setColorAt(M, N ? k.blossom : dt), M++, vn(s.current, _, R, P.position, P.rotation, P.innerScale), x) {
          const B = N ? et.copy(k.blossom).lerp(id, 0.4) : et.set("#ffe6f0");
          s.current.setColorAt(_, B);
        }
        _++;
      }
    }
    for (const [k, R] of [[t, S], [r, C], [o, T], [i, M], [s, _]])
      k.current.count = R, k.current.instanceMatrix.needsUpdate = !0, x && k.current.instanceColor && (k.current.instanceColor.needsUpdate = !0);
  }, [d, x, p]), L(() => () => {
    y.dispose(), g.dispose(), m.dispose(), w.dispose();
  }, [y, g, m, w]), de((S) => {
    const C = a.current;
    if (!C) return;
    const T = C.parent;
    if (T && !T.visible) return;
    const M = C.material;
    if (M?.uniforms) {
      const _ = M.uniforms.uTime, k = M.uniforms.uScale, R = Ge.getState().current, z = R?.intensity ?? 0, N = R?.kind === "storm" ? 2.4 : R?.kind === "rain" ? 1.6 : R?.kind === "snow" ? 1.2 : R?.kind === "cloudy" ? 1.1 : 0.9, P = M.uniforms.uWind;
      _ && (_.value = S.clock.getElapsedTime()), k && (k.value = S.gl.domElement.height * 0.5), P && (P.value = N + z * 0.7);
    }
  }), d.length === 0 ? null : /* @__PURE__ */ b(Se, { children: [
    /* @__PURE__ */ l("instancedMesh", { ref: t, args: [c.limb, f.bark, p.bark], castShadow: !0 }),
    /* @__PURE__ */ l("instancedMesh", { ref: r, args: [c.limb, f.barkDark, p.dark] }),
    /* @__PURE__ */ l("instancedMesh", { ref: o, args: [c.trunkTop, f.barkDark, p.top], castShadow: !0 }),
    /* @__PURE__ */ l("instancedMesh", { ref: i, args: [c.canopyCluster, f.blossomShell, p.cluster], castShadow: !0 }),
    /* @__PURE__ */ l("instancedMesh", { ref: s, args: [c.canopyCore, f.blossomCore, p.cluster] }),
    /* @__PURE__ */ l("points", { geometry: y, children: /* @__PURE__ */ l("pointsMaterial", { size: 0.08 * h, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.82, depthWrite: !1 }) }),
    /* @__PURE__ */ l("points", { ref: a, geometry: m, material: w, frustumCulled: !1 }),
    /* @__PURE__ */ l("points", { geometry: g, children: /* @__PURE__ */ l("pointsMaterial", { size: 0.085 * h, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.7, depthWrite: !1 }) })
  ] });
}
function Bm({ size: n = 4, toon: e }) {
  const t = E(null), r = E(null), o = E(null), i = E(null), s = E(null), a = E(null), u = F(() => v.MathUtils.clamp(n / 4, 0.95, 1.85), [n]), c = 3.8 * u, f = 1.65 * u + Math.min(n * 0.08, 0.55), d = 2.15 * u + Math.min(n * 0.04, 0.35), p = e ?? Te(), h = Ri(), x = Ni(p), y = F(() => Ei(u, c), [u, c]), g = F(() => Bi(u), [u]), m = F(() => zi(u, c, f, d), [u, c, f, d]), w = y.length, S = g.length + y.length, C = m.length, T = Math.max(180, Math.min(420, Math.round(210 + u * 95))), M = Math.max(44, Math.min(120, Math.round(54 + u * 26))), _ = Math.max(52, Math.min(132, Math.round(62 + u * 30))), k = F(() => {
    const P = new Float32Array(T * 3), B = new Float32Array(T * 3);
    return Di(P, B, 0, T, c, f, d, 0, 0, 0), xn(P, B, !0);
  }, [T, c, f, d]), R = F(() => {
    const P = new Float32Array(M * 3), B = new Float32Array(M * 3);
    return Fi(P, B, 0, M, f, 0, 0, 0), xn(P, B, !0);
  }, [M, f]), z = F(() => {
    const P = new Float32Array(_ * 3), B = new Float32Array(_ * 3), U = new Float32Array(_ * 4), W = new Float32Array(_ * 2);
    Li(P, B, U, W, null, null, 0, _, c, f, d, u, 0, 0, 0);
    const H = new v.BufferGeometry();
    return H.setAttribute("position", new v.Float32BufferAttribute(P, 3)), H.setAttribute("color", new v.Float32BufferAttribute(B, 3)), H.setAttribute("aParams1", new v.Float32BufferAttribute(U, 4)), H.setAttribute("aParams2", new v.Float32BufferAttribute(W, 2)), H.computeBoundingSphere(), H;
  }, [_, c, f, d, u]), N = F(() => new v.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPointSize: { value: 0.11 * u }, uScale: { value: 1 }, uOpacity: { value: 0.88 } },
    vertexShader: cd,
    fragmentShader: Gi,
    transparent: !0,
    depthWrite: !1
  }), [u]);
  return Fe(() => {
    const P = o.current;
    if (P) {
      P.count = w;
      for (let H = 0; H < y.length; H++) {
        const I = y[H];
        I && nt(P, H, null, [0, I.pivotY, 0], [I.lean, I.yaw, I.bend], [0, I.length * 0.5, 0], null, [I.radius, I.length, I.radius]);
      }
      P.instanceMatrix.needsUpdate = !0;
    }
    const B = i.current;
    if (B) {
      B.count = S;
      let H = 0;
      for (const I of g) nt(B, H++, null, [0, 0.14 * u, 0], [0, I.angle, I.spread], [0, I.length * 0.22, 0], null, [I.radius, I.length, I.radius]);
      for (const I of y) nt(B, H++, null, [0, I.pivotY, 0], [I.lean, I.yaw, I.bend], [0, I.length * 0.76, 0], [I.twigLean, I.twigYaw, I.bend * -0.42], [I.radius * 0.52, I.twigLength, I.radius * 0.52]);
      B.instanceMatrix.needsUpdate = !0;
    }
    const U = s.current;
    if (U) {
      U.count = C;
      for (let H = 0; H < m.length; H++) {
        const I = m[H];
        I && vn(U, H, null, I.position, I.rotation, I.outerScale);
      }
      U.instanceMatrix.needsUpdate = !0;
    }
    const W = a.current;
    if (W) {
      W.count = C;
      for (let H = 0; H < m.length; H++) {
        const I = m[H];
        I && vn(W, H, null, I.position, I.rotation, I.innerScale);
      }
      W.instanceMatrix.needsUpdate = !0;
    }
  }, [y, g, m, u, w, S, C]), L(() => () => {
    k.dispose(), R.dispose(), z.dispose(), N.dispose();
  }, [k, R, z, N]), de((P) => {
    const B = r.current?.parent;
    if (B && !B.visible) return;
    const U = P.clock.getElapsedTime(), W = r.current?.material;
    if (W?.uniforms) {
      const H = W.uniforms.uTime, I = W.uniforms.uScale;
      H && (H.value = U), I && (I.value = P.gl.domElement.height * 0.5);
    }
    t.current && (t.current.rotation.z = Math.sin(U * 0.42 + u) * 0.028, t.current.rotation.x = Math.cos(U * 0.35 + u * 0.6) * 0.012, t.current.position.x = Math.sin(U * 0.28 + u) * 0.04 * u);
  }), /* @__PURE__ */ b("group", { position: [0, 0.02, 0], children: [
    /* @__PURE__ */ b("group", { position: [0, c * 0.5, 0], rotation: [0.02, 0, -0.04], children: [
      /* @__PURE__ */ l("mesh", { geometry: h.limb, material: x.bark, scale: [0.3 * u, c, 0.3 * u], castShadow: !0, receiveShadow: !0 }),
      /* @__PURE__ */ l("mesh", { geometry: h.trunkTop, material: x.barkDark, position: [0, c * 0.48, 0], scale: [0.24 * u, 0.32 * u, 0.24 * u], castShadow: !0, receiveShadow: !0 })
    ] }),
    /* @__PURE__ */ l("instancedMesh", { ref: o, args: [h.limb, x.bark, w] }),
    /* @__PURE__ */ l("instancedMesh", { ref: i, args: [h.limb, x.barkDark, S] }),
    /* @__PURE__ */ b("group", { ref: t, children: [
      /* @__PURE__ */ l("instancedMesh", { ref: s, args: [h.canopyCluster, x.blossomShell, C], castShadow: !0 }),
      /* @__PURE__ */ l("instancedMesh", { ref: a, args: [h.canopyCore, x.blossomCore, C] }),
      /* @__PURE__ */ l("points", { geometry: k, children: /* @__PURE__ */ l("pointsMaterial", { size: 0.08 * u, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.82, depthWrite: !1 }) })
    ] }),
    /* @__PURE__ */ l("points", { ref: r, geometry: z, material: N, frustumCulled: !1 }),
    /* @__PURE__ */ l("points", { geometry: R, children: /* @__PURE__ */ l("pointsMaterial", { size: 0.085 * u, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.7, depthWrite: !1 }) })
  ] });
}
const cd = (
  /* glsl */
  `
attribute vec3 color;
attribute vec4 aParams1;
attribute vec2 aParams2;
uniform float uTime;
uniform float uPointSize;
uniform float uScale;
varying vec3 vColor;
void main() {
  float cycle = fract(uTime * aParams1.x + aParams1.y);
  float drift = 1.0 - pow(cycle, 1.22);
  float w = uTime * aParams1.w + aParams1.y * 6.28318;
  vec3 pos = vec3(
    position.x + sin(w) * aParams1.z + aParams2.x * cycle,
    0.18 + position.y * drift + sin(w * 0.6) * 0.06,
    position.z + cos(w * 0.82) * aParams1.z * 0.72 + aParams2.y * cycle
  );
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uPointSize * (uScale / -mvPosition.z);
}
`
);
let un = null;
function ud() {
  try {
    const n = "/";
    if (n) {
      const e = n.endsWith("/") ? n : `${n}/`;
      return new URL(`${e}wasm/gaesup_core.wasm`, document.baseURI).toString();
    }
    if (typeof document < "u" && typeof document.baseURI == "string" && document.baseURI.length > 0)
      return `${new URL(document.baseURI).origin}/wasm/gaesup_core.wasm`;
  } catch {
  }
  return "/wasm/gaesup_core.wasm";
}
async function Oi() {
  return typeof WebAssembly > "u" ? null : un || (un = (async () => {
    try {
      const n = ud(), e = await fetch(n);
      if (!e.ok) return null;
      const t = await e.arrayBuffer(), { instance: r } = await WebAssembly.instantiate(t, {}), o = r.exports;
      return !o || !(o.memory instanceof WebAssembly.Memory) || typeof o.alloc_f32 != "function" || typeof o.dealloc_f32 != "function" ? null : o;
    } catch {
      return null;
    }
  })(), un);
}
const Ae = 2e3, dd = 800, Re = 20, Rr = 20, fd = 3, pd = (
  /* glsl */
  `
attribute float aSeed;
attribute float aBaseX;
attribute float aBaseZ;
attribute float aFallSpeed;
attribute float aDriftAmp;

uniform float uTime;
uniform vec3 uOrigin;
uniform float uHalfRange;
uniform float uHeight;
uniform float uPointSize;
uniform float uScale;

void main() {
  float fall = uHeight - mod(uTime * aFallSpeed + aSeed * uHeight * 2.0, uHeight * 1.4);
  float dx = sin(uTime * 0.7 + aSeed * 6.2831) * aDriftAmp;
  float dz = cos(uTime * 0.5 + aSeed * 3.1415) * aDriftAmp;

  float wx = uOrigin.x + mod(aBaseX + dx - uOrigin.x + uHalfRange, uHalfRange * 2.0) - uHalfRange;
  float wz = uOrigin.z + mod(aBaseZ + dz - uOrigin.z + uHalfRange, uHalfRange * 2.0) - uHalfRange;
  float wy = uOrigin.y + fall - uHeight * 0.5;

  vec4 mv = modelViewMatrix * vec4(wx, wy, wz, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uPointSize * (uScale / -mv.z);
}
`
), md = (
  /* glsl */
  `
uniform float uOpacity;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;
  gl_FragColor = vec4(1.0, 1.0, 1.0, uOpacity * exp(-r2 * 6.0));
}
`
);
let zt = null;
function hd() {
  if (zt) return zt;
  const n = document.createElement("canvas");
  n.width = 16, n.height = 16;
  const e = n.getContext("2d"), t = e.createRadialGradient(8, 8, 0, 8, 8, 8);
  return t.addColorStop(0, "rgba(255,255,255,1)"), t.addColorStop(1, "rgba(255,255,255,0)"), e.fillStyle = t, e.fillRect(0, 0, 16, 16), zt = new v.CanvasTexture(n), zt.needsUpdate = !0, zt;
}
function gd() {
  const n = E(null), e = E(null), t = F(() => {
    const o = new v.BufferGeometry(), i = new Float32Array(Ae * 3), s = new Float32Array(Ae), a = new Float32Array(Ae), u = new Float32Array(Ae), c = new Float32Array(Ae), f = new Float32Array(Ae);
    for (let d = 0; d < Ae; d++)
      i[d * 3] = 0, i[d * 3 + 1] = 0, i[d * 3 + 2] = 0, s[d] = Math.random(), a[d] = (Math.random() - 0.5) * Re * 2, u[d] = (Math.random() - 0.5) * Re * 2, c[d] = 0.5 + Math.random() * 1.5, f[d] = 0.05 + Math.random() * 0.25;
    return o.setAttribute("position", new v.Float32BufferAttribute(i, 3)), o.setAttribute("aSeed", new v.Float32BufferAttribute(s, 1)), o.setAttribute("aBaseX", new v.Float32BufferAttribute(a, 1)), o.setAttribute("aBaseZ", new v.Float32BufferAttribute(u, 1)), o.setAttribute("aFallSpeed", new v.Float32BufferAttribute(c, 1)), o.setAttribute("aDriftAmp", new v.Float32BufferAttribute(f, 1)), o.boundingSphere = new v.Sphere(new v.Vector3(), Re * 4), o;
  }, []), r = F(
    () => new v.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOrigin: { value: new v.Vector3() },
        uHalfRange: { value: Re },
        uHeight: { value: Rr },
        uPointSize: { value: 0.08 },
        uScale: { value: 1 },
        uOpacity: { value: 0.85 }
      },
      vertexShader: pd,
      fragmentShader: md,
      transparent: !0,
      depthWrite: !1
    }),
    []
  );
  return L(() => () => {
    t.dispose(), r.dispose();
  }, [t, r]), de((o) => {
    const i = n.current;
    if (!i) return;
    const s = i.parent;
    if (s && !s.visible) return;
    const a = e.current.uniforms, u = a.uTime, c = a.uOrigin, f = a.uScale;
    u && (u.value = o.clock.elapsedTime), c && c.value.copy(o.camera.position), f && (f.value = o.gl.domElement.height * 0.5);
  }), /* @__PURE__ */ l(
    "points",
    {
      ref: n,
      geometry: t,
      frustumCulled: !1,
      children: /* @__PURE__ */ l("primitive", { ref: e, object: r, attach: "material" })
    }
  );
}
function Ui({ gpu: n } = {}) {
  return n ? /* @__PURE__ */ l(gd, {}) : /* @__PURE__ */ l(yd, {});
}
function yd() {
  const n = E(null), e = E(new Float32Array(Ae * 3)), t = E(new Float32Array(Ae * 3)), r = E(null), o = E(null), i = F(() => new Float32Array(6), []), s = E(0);
  L(() => {
    const c = e.current, f = t.current;
    for (let x = 0; x < Ae; x++)
      c[x * 3] = (Math.random() - 0.5) * Re * 2, c[x * 3 + 1] = Math.random() * Rr, c[x * 3 + 2] = (Math.random() - 0.5) * Re * 2, f[x * 3] = 0, f[x * 3 + 1] = -(0.5 + Math.random() * 1.5), f[x * 3 + 2] = 0;
    let d = 0, p = 0, h = 0;
    return Oi().then((x) => {
      if (!x) return;
      r.current = x;
      const y = Ae * 3;
      d = x.alloc_f32(y), p = x.alloc_f32(y), h = x.alloc_f32(6), new Float32Array(x.memory.buffer, d, y).set(c), new Float32Array(x.memory.buffer, p, y).set(f), o.current = { p: d, v: p, b: h };
    }), () => {
      const x = r.current;
      x && (d && x.dealloc_f32(d, Ae * 3), p && x.dealloc_f32(p, Ae * 3), h && x.dealloc_f32(h, 6));
    };
  }, []), de((c, f) => {
    const d = n.current?.parent;
    if (d && !d.visible) return;
    const p = c.camera.position;
    i[0] = p.x - Re, i[1] = p.x + Re, i[2] = p.y - 5, i[3] = p.y + Rr, i[4] = p.z - Re, i[5] = p.z + Re;
    const h = Math.min(f, 0.05), x = r.current, y = o.current, g = e.current, m = t.current, S = s.current++ % fd === 0, C = n.current;
    if (C)
      if (x && y) {
        new Float32Array(x.memory.buffer, y.b, 6).set(i), x.update_snow_particles(
          Ae,
          y.p,
          y.v,
          y.b,
          0.3,
          0,
          0,
          2,
          0.01,
          h
        );
        const T = new Float32Array(x.memory.buffer, y.p, Ae * 3), M = C.geometry.attributes.position;
        if (!(M instanceof v.BufferAttribute)) return;
        M.array = T, M.needsUpdate = !0;
      } else {
        const T = S ? Ae : dd;
        for (let _ = 0; _ < T; _++) {
          const k = _ * 3, R = m[k], z = m[k + 1], N = m[k + 2], P = g[k], B = g[k + 1], U = g[k + 2], W = i[0], H = i[1], I = i[2], G = i[3], V = i[4], J = i[5];
          if (R === void 0 || z === void 0 || N === void 0 || P === void 0 || B === void 0 || U === void 0 || W === void 0 || H === void 0 || I === void 0 || G === void 0 || V === void 0 || J === void 0)
            continue;
          const X = R * 0.99 + 0.3 * h;
          let K = z - 2 * h;
          const Q = N * 0.99;
          let ee = P + X * h, se = B + K * h, oe = U + Q * h;
          ee < W ? ee += Re * 2 : ee > H && (ee -= Re * 2), se < I && (se = G, K = -(0.5 + Math.random() * 1.5)), oe < V ? oe += Re * 2 : oe > J && (oe -= Re * 2), m[k] = X, m[k + 1] = K, m[k + 2] = Q, g[k] = ee, g[k + 1] = se, g[k + 2] = oe;
        }
        const M = C.geometry.attributes.position;
        if (!(M instanceof v.BufferAttribute)) return;
        M.needsUpdate = !0;
      }
  });
  const a = F(() => {
    const c = new v.BufferGeometry(), f = new v.Float32BufferAttribute(e.current, 3);
    return f.setUsage(v.DynamicDrawUsage), c.setAttribute("position", f), c;
  }, []), u = F(
    () => new v.PointsMaterial({
      size: 0.08,
      map: hd(),
      transparent: !0,
      opacity: 0.85,
      depthWrite: !1
    }),
    []
  );
  return L(() => () => {
    a.dispose(), u.dispose();
  }, [a, u]), /* @__PURE__ */ l(
    "points",
    {
      ref: n,
      geometry: a,
      material: u,
      frustumCulled: !1
    }
  );
}
Ce.memo(Ui);
function bd() {
  const n = O((w) => w.editMode), e = O((w) => w.hoverPosition), t = O((w) => w.checkTilePosition), r = O((w) => w.currentTileMultiplier), o = O((w) => w.currentTileHeight), i = O((w) => w.currentTileShape), s = O((w) => w.currentTileRotation), a = O((w) => w.currentObjectRotation), u = O((w) => w.selectedPlacedObjectType), c = ie.GRID_CELL_SIZE * r, d = (i === "stairs" || i === "ramp" ? Math.max(1, o) : o) * ie.HEIGHT_STEP, p = Math.max(0.12, d + 0.12), h = v.MathUtils.clamp(c / ie.GRID_CELL_SIZE, 0.95, 1.85), x = F(() => {
    const w = new v.BufferGeometry(), S = new Float32Array([
      -0.5,
      0,
      -0.5,
      0.5,
      0,
      -0.5,
      -0.5,
      0,
      0.5,
      0.5,
      0,
      0.5,
      -0.5,
      1,
      0.5,
      0.5,
      1,
      0.5
    ]), C = [
      0,
      1,
      3,
      0,
      3,
      2,
      0,
      1,
      5,
      0,
      5,
      4,
      0,
      2,
      4,
      1,
      5,
      3,
      2,
      3,
      5,
      2,
      5,
      4
    ];
    return w.setAttribute("position", new v.BufferAttribute(S, 3)), w.setIndex(C), w.computeVertexNormals(), w;
  }, []);
  if (L(() => () => {
    x.dispose();
  }, [x]), n !== "tile" && n !== "object" || !e)
    return null;
  const y = n === "tile" && (i === "box" || i === "round") ? e.y + o * ie.HEIGHT_STEP : e.y, m = (n === "tile" ? t({ x: e.x, y, z: e.z }) : !1) ? "#ff0000" : "#00ff00";
  return /* @__PURE__ */ b("group", { position: [e.x, y, e.z], rotation: [0, n === "object" ? a : s, 0], children: [
    n === "tile" && (i === "round" ? /* @__PURE__ */ b("mesh", { position: [0, d > 0.02 ? d / 2 : -0.02, 0], children: [
      /* @__PURE__ */ l("cylinderGeometry", { args: [c / 2, c / 2, d > 0.02 ? d : 0.04, 24] }),
      /* @__PURE__ */ l("meshStandardMaterial", { color: m, transparent: !0, opacity: 0.45, emissive: m, emissiveIntensity: 0.25 })
    ] }) : i === "stairs" ? /* @__PURE__ */ l(Se, { children: Array.from({ length: 4 }, (w, S) => {
      const T = Math.max(ie.HEIGHT_STEP, d) / 4, M = c / 4, _ = T * (S + 1) - T / 2, k = -c / 2 + M * S + M / 2;
      return /* @__PURE__ */ b("mesh", { position: [0, _, k], children: [
        /* @__PURE__ */ l("boxGeometry", { args: [c, T * (S + 1), M] }),
        /* @__PURE__ */ l("meshStandardMaterial", { color: m, transparent: !0, opacity: 0.45, emissive: m, emissiveIntensity: 0.25 })
      ] }, S);
    }) }) : i === "ramp" ? /* @__PURE__ */ l("mesh", { position: [0, 0, 0], scale: [c, Math.max(ie.HEIGHT_STEP, d), c], geometry: x, children: /* @__PURE__ */ l("meshStandardMaterial", { color: m, transparent: !0, opacity: 0.45, emissive: m, emissiveIntensity: 0.25 }) }) : /* @__PURE__ */ b("mesh", { position: [0, p / 2, 0], children: [
      /* @__PURE__ */ l("boxGeometry", { args: [c, p, c] }),
      /* @__PURE__ */ l("meshStandardMaterial", { color: m, transparent: !0, opacity: 0.45, emissive: m, emissiveIntensity: 0.3 })
    ] })),
    n === "object" && /* @__PURE__ */ b("mesh", { position: [0, 0.06, 0], children: [
      /* @__PURE__ */ l("cylinderGeometry", { args: [0.35, 0.35, 0.12, 16] }),
      /* @__PURE__ */ l("meshStandardMaterial", { color: "#00ff88", transparent: !0, opacity: 0.5, emissive: "#00ff88", emissiveIntensity: 0.3 })
    ] }),
    n === "object" && u === "sakura" && /* @__PURE__ */ b("group", { position: [0, Math.max(d, 0.04), 0], children: [
      /* @__PURE__ */ b("mesh", { position: [0, 1.9 * h, 0], children: [
        /* @__PURE__ */ l("cylinderGeometry", { args: [0.16 * h, 0.28 * h, 3.8 * h, 8] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: m,
            transparent: !0,
            opacity: 0.32,
            emissive: m,
            emissiveIntensity: 0.15
          }
        )
      ] }),
      /* @__PURE__ */ b("mesh", { position: [0, 4 * h, 0], children: [
        /* @__PURE__ */ l("sphereGeometry", { args: [1.55 * h, 10, 8] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: m,
            transparent: !0,
            opacity: 0.18,
            emissive: m,
            emissiveIntensity: 0.18
          }
        )
      ] }),
      /* @__PURE__ */ b("mesh", { position: [0.95 * h, 3.55 * h, 0.4 * h], children: [
        /* @__PURE__ */ l("sphereGeometry", { args: [0.92 * h, 8, 6] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: m,
            transparent: !0,
            opacity: 0.14,
            emissive: m,
            emissiveIntensity: 0.12
          }
        )
      ] }),
      /* @__PURE__ */ b("mesh", { position: [-0.88 * h, 3.7 * h, -0.55 * h], children: [
        /* @__PURE__ */ l("sphereGeometry", { args: [1.02 * h, 8, 6] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: m,
            transparent: !0,
            opacity: 0.14,
            emissive: m,
            emissiveIntensity: 0.12
          }
        )
      ] })
    ] })
  ] });
}
function vd() {
  const n = O((c) => c.editMode), e = O((c) => c.hoverPosition), t = O((c) => c.currentWallRotation), r = O((c) => c.checkWallPosition), o = ie.WALL_SIZES.WIDTH, i = ie.WALL_SIZES.HEIGHT, s = ie.WALL_SIZES.THICKNESS;
  if (n !== "wall" || !e)
    return null;
  const u = r(e, t) ? "#ff0000" : "#00ff00";
  return /* @__PURE__ */ l("group", { position: [e.x, e.y + i / 2, e.z], rotation: [0, t, 0], children: /* @__PURE__ */ b("mesh", { position: [0, 0, o / 2], children: [
    /* @__PURE__ */ l("boxGeometry", { args: [o, i, s] }),
    /* @__PURE__ */ l(
      "meshStandardMaterial",
      {
        color: u,
        transparent: !0,
        opacity: 0.5,
        emissive: u,
        emissiveIntensity: 0.3
      }
    )
  ] }) });
}
const wn = Dr();
let pr = null, mr = null;
function Wi(n) {
  return n ? (pr || (pr = mt({ vertexColors: !0, steps: 4 })), pr) : (mr || (mr = new v.MeshStandardMaterial({ vertexColors: !0, roughness: 1, metalness: 0.02 })), mr);
}
function ot(n) {
  const e = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return e - Math.floor(e);
}
function Sn(n, e, t) {
  const r = Math.max(t, 1), o = wn(n / (r * 0.8), e / (r * 0.8)) * 0.07, i = wn(n / (r * 0.32) + 8.3, e / (r * 0.42) - 5.4) * 0.025, s = Math.sin(n * 1.35 + e * 0.42) * 0.01, a = Math.exp(-(((n + r * 0.18) * (n + r * 0.18) + (e - r * 0.08) * (e - r * 0.08)) / Math.max(r * r * 0.55, 1))) * 0.09, u = Math.exp(-(((n - r * 0.24) * (n - r * 0.24) + (e + r * 0.16) * (e + r * 0.16)) / Math.max(r * r * 0.7, 1))) * 0.05;
  return 0.025 + o + i + s + a + u;
}
function xd(n) {
  let e = 0, t = 0, r = 0;
  const o = [], i = [];
  for (const m of n) {
    const w = Math.max(20, Math.round(m.size * 6));
    o.push(w), e += (w + 1) * (w + 1), t += w * w * 6;
    const S = Math.max(90, Math.min(240, Math.round(m.size * m.size * 10)));
    i.push(S), r += S;
  }
  const s = new Float32Array(e * 3), a = new Float32Array(e * 3), u = new Uint32Array(t);
  let c = 0, f = 0;
  for (let m = 0; m < n.length; m++) {
    const w = n[m], S = o[m];
    if (!w || S === void 0) continue;
    const C = w.size, T = w.position[0], M = w.position[1] + 0.04, _ = w.position[2];
    for (let k = 0; k <= S; k++)
      for (let R = 0; R <= S; R++) {
        const z = c + k * (S + 1) + R, N = (R / S - 0.5) * C, P = (k / S - 0.5) * C, B = Sn(N, P, C), U = 0.5 + 0.5 * wn(N * 0.22 + 5.1, P * 0.22 - 3.6), W = z * 3;
        s[W] = N + T, s[W + 1] = B + M, s[W + 2] = P + _, a[W] = 0.72 + U * 0.09, a[W + 1] = 0.61 + U * 0.07, a[W + 2] = 0.4 + U * 0.05;
      }
    for (let k = 0; k < S; k++)
      for (let R = 0; R < S; R++) {
        const z = c + k * (S + 1) + R, N = z + 1, P = z + (S + 1), B = P + 1;
        u[f++] = z, u[f++] = P, u[f++] = N, u[f++] = N, u[f++] = P, u[f++] = B;
      }
    c += (S + 1) * (S + 1);
  }
  const d = new v.BufferGeometry();
  d.setAttribute("position", new v.Float32BufferAttribute(s, 3)), d.setAttribute("color", new v.Float32BufferAttribute(a, 3)), d.setIndex(new v.BufferAttribute(u, 1)), d.computeVertexNormals(), d.computeBoundingSphere();
  const p = new Float32Array(r * 3), h = new Float32Array(r * 3);
  let x = 0;
  for (let m = 0; m < n.length; m++) {
    const w = n[m], S = i[m];
    if (!w || S === void 0) continue;
    const C = w.size, T = w.position[0], M = w.position[1] + 0.04, _ = w.position[2];
    for (let k = 0; k < S; k++) {
      const R = (x + k) * 3, z = ot(k * 3.13 + 0.2) * C - C * 0.5, N = ot(k * 4.71 + 1.4) * C - C * 0.5, P = ot(k * 5.93 + 2.8), B = ot(k * 2.37 + 0.9), U = Sn(z, N, C) + 0.01 + P * 0.015;
      p[R] = z + T, p[R + 1] = U + M, p[R + 2] = N + _, h[R] = 0.76 + B * 0.08, h[R + 1] = 0.68 + B * 0.05, h[R + 2] = 0.48 + B * 0.04;
    }
    x += S;
  }
  const y = new v.BufferGeometry();
  y.setAttribute("position", new v.Float32BufferAttribute(p, 3)), y.setAttribute("color", new v.Float32BufferAttribute(h, 3)), y.computeBoundingSphere();
  const g = n.length > 0 ? n.reduce((m, w) => m + w.size, 0) / n.length : 4;
  return [d, y, g];
}
function wd({ entries: n, toon: e }) {
  const [t, r, o] = F(
    () => xd(n),
    [n]
  ), i = e ?? Te(), s = Wi(i);
  return L(() => () => {
    t.dispose(), r.dispose();
  }, [t, r]), n.length === 0 ? null : /* @__PURE__ */ b(Se, { children: [
    /* @__PURE__ */ l("mesh", { geometry: t, material: s, castShadow: !0, receiveShadow: !0 }),
    /* @__PURE__ */ l("points", { geometry: r, children: /* @__PURE__ */ l(
      "pointsMaterial",
      {
        size: Math.max(0.02, o * 8e-3),
        vertexColors: !0,
        transparent: !0,
        opacity: 0.85,
        depthWrite: !1
      }
    ) })
  ] });
}
function zm({ size: n = 4, toon: e }) {
  const t = e ?? Te(), r = Wi(t), [o, i] = F(() => {
    const s = Math.max(20, Math.round(n * 6)), a = new v.PlaneGeometry(n, n, s, s);
    a.rotateX(-Math.PI / 2);
    const u = a.getAttribute("position"), c = new Float32Array(u.count * 3), f = new v.Color();
    for (let y = 0; y < u.count; y++) {
      const g = u.getX(y), m = u.getZ(y), w = Sn(g, m, n), S = 0.5 + 0.5 * wn(g * 0.22 + 5.1, m * 0.22 - 3.6);
      u.setY(y, w), f.setRGB(0.72 + S * 0.09, 0.61 + S * 0.07, 0.4 + S * 0.05), c[y * 3] = f.r, c[y * 3 + 1] = f.g, c[y * 3 + 2] = f.b;
    }
    a.setAttribute("color", new v.Float32BufferAttribute(c, 3)), a.computeVertexNormals();
    const d = Math.max(90, Math.min(240, Math.round(n * n * 10))), p = new Float32Array(d * 3), h = new Float32Array(d * 3);
    for (let y = 0; y < d; y++) {
      const g = ot(y * 3.13 + 0.2) * n - n * 0.5, m = ot(y * 4.71 + 1.4) * n - n * 0.5, w = ot(y * 5.93 + 2.8), S = ot(y * 2.37 + 0.9), C = Sn(g, m, n) + 0.01 + w * 0.015;
      p[y * 3] = g, p[y * 3 + 1] = C, p[y * 3 + 2] = m, f.setRGB(0.76 + S * 0.08, 0.68 + S * 0.05, 0.48 + S * 0.04), h[y * 3] = f.r, h[y * 3 + 1] = f.g, h[y * 3 + 2] = f.b;
    }
    const x = new v.BufferGeometry();
    return x.setAttribute("position", new v.Float32BufferAttribute(p, 3)), x.setAttribute("color", new v.Float32BufferAttribute(h, 3)), [a, x];
  }, [n]);
  return L(() => () => {
    o.dispose(), i.dispose();
  }, [i, o]), /* @__PURE__ */ b("group", { position: [0, 0.04, 0], children: [
    /* @__PURE__ */ l("mesh", { geometry: o, material: r, castShadow: !0, receiveShadow: !0 }),
    /* @__PURE__ */ l("points", { geometry: i, frustumCulled: !1, children: /* @__PURE__ */ l(
      "pointsMaterial",
      {
        size: Math.max(0.02, n * 8e-3),
        vertexColors: !0,
        transparent: !0,
        opacity: 0.85,
        depthWrite: !1
      }
    ) })
  ] });
}
const Mn = Dr();
let hr = null, gr = null;
function Hi(n) {
  return n ? (hr || (hr = mt({
    vertexColors: !0,
    steps: 4,
    emissive: "#9ec1e8",
    emissiveIntensity: 0.06
  })), hr) : (gr || (gr = new v.MeshPhysicalMaterial({
    vertexColors: !0,
    roughness: 0.88,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.75
  })), gr);
}
function it(n) {
  const e = Math.sin(n * 91.7 + 173.3) * 43758.5453123;
  return e - Math.floor(e);
}
function Cn(n, e, t) {
  const r = Math.max(t, 1), o = Math.exp(-(((n + r * 0.2) * (n + r * 0.2) + (e - r * 0.14) * (e - r * 0.14)) / Math.max(r * r * 0.48, 1))) * 0.12, i = Math.exp(-(((n - r * 0.18) * (n - r * 0.18) + (e + r * 0.12) * (e + r * 0.12)) / Math.max(r * r * 0.65, 1))) * 0.08, s = Mn(n / (r * 0.7), e / (r * 0.7)) * 0.06, a = Mn(n / (r * 0.24) + 6.1, e / (r * 0.24) - 3.7) * 0.018;
  return 0.05 + o + i + s + a;
}
function Sd(n) {
  let e = 0, t = 0, r = 0;
  const o = [], i = [];
  for (const m of n) {
    const w = Math.max(22, Math.round(m.size * 7));
    o.push(w), e += (w + 1) * (w + 1), t += w * w * 6;
    const S = Math.max(28, Math.min(96, Math.round(m.size * m.size * 3)));
    i.push(S), r += S;
  }
  const s = new Float32Array(e * 3), a = new Float32Array(e * 3), u = new Uint32Array(t);
  let c = 0, f = 0;
  for (let m = 0; m < n.length; m++) {
    const w = n[m], S = o[m];
    if (!w || S === void 0) continue;
    const C = w.size, T = w.position[0], M = w.position[1] + 0.045, _ = w.position[2];
    for (let k = 0; k <= S; k++)
      for (let R = 0; R <= S; R++) {
        const z = c + k * (S + 1) + R, N = (R / S - 0.5) * C, P = (k / S - 0.5) * C, B = Cn(N, P, C), U = 0.5 + 0.5 * Mn(N * 0.16 - 2.4, P * 0.16 + 7.2), W = z * 3;
        s[W] = N + T, s[W + 1] = B + M, s[W + 2] = P + _, a[W] = 0.87 + U * 0.06, a[W + 1] = 0.9 + U * 0.05, a[W + 2] = 0.94 + U * 0.04;
      }
    for (let k = 0; k < S; k++)
      for (let R = 0; R < S; R++) {
        const z = c + k * (S + 1) + R, N = z + 1, P = z + (S + 1), B = P + 1;
        u[f++] = z, u[f++] = P, u[f++] = N, u[f++] = N, u[f++] = P, u[f++] = B;
      }
    c += (S + 1) * (S + 1);
  }
  const d = new v.BufferGeometry();
  d.setAttribute("position", new v.Float32BufferAttribute(s, 3)), d.setAttribute("color", new v.Float32BufferAttribute(a, 3)), d.setIndex(new v.BufferAttribute(u, 1)), d.computeVertexNormals(), d.computeBoundingSphere();
  const p = new Float32Array(r * 3), h = new Float32Array(r * 3);
  let x = 0;
  for (let m = 0; m < n.length; m++) {
    const w = n[m], S = i[m];
    if (!w || S === void 0) continue;
    const C = w.size, T = w.position[0], M = w.position[1] + 0.045, _ = w.position[2];
    for (let k = 0; k < S; k++) {
      const R = (x + k) * 3, z = it(k * 2.71 + 0.4) * C - C * 0.5, N = it(k * 3.97 + 1.9) * C - C * 0.5, P = it(k * 5.41 + 2.2), B = it(k * 7.13 + 3.1), U = Cn(z, N, C) + 0.016 + P * 0.02;
      p[R] = z + T, p[R + 1] = U + M, p[R + 2] = N + _, h[R] = 0.9 + B * 0.08, h[R + 1] = 0.94 + B * 0.05, h[R + 2] = 1;
    }
    x += S;
  }
  const y = new v.BufferGeometry();
  y.setAttribute("position", new v.Float32BufferAttribute(p, 3)), y.setAttribute("color", new v.Float32BufferAttribute(h, 3)), y.computeBoundingSphere();
  const g = n.length > 0 ? n.reduce((m, w) => m + w.size, 0) / n.length : 4;
  return [d, y, g];
}
function Md({ entries: n, toon: e }) {
  const [t, r, o] = F(
    () => Sd(n),
    [n]
  ), i = e ?? Te(), s = Hi(i);
  return L(() => () => {
    t.dispose(), r.dispose();
  }, [t, r]), n.length === 0 ? null : /* @__PURE__ */ b(Se, { children: [
    /* @__PURE__ */ l("mesh", { geometry: t, material: s, castShadow: !0, receiveShadow: !0 }),
    /* @__PURE__ */ l("points", { geometry: r, children: /* @__PURE__ */ l(
      "pointsMaterial",
      {
        size: Math.max(0.03, o * 0.01),
        vertexColors: !0,
        transparent: !0,
        opacity: 0.55,
        depthWrite: !1
      }
    ) })
  ] });
}
function Dm({ size: n = 4, toon: e }) {
  const t = e ?? Te(), r = Hi(t), [o, i] = F(() => {
    const s = Math.max(22, Math.round(n * 7)), a = new v.PlaneGeometry(n, n, s, s);
    a.rotateX(-Math.PI / 2);
    const u = a.getAttribute("position"), c = new Float32Array(u.count * 3), f = new v.Color();
    for (let y = 0; y < u.count; y++) {
      const g = u.getX(y), m = u.getZ(y), w = Cn(g, m, n), S = 0.5 + 0.5 * Mn(g * 0.16 - 2.4, m * 0.16 + 7.2);
      u.setY(y, w), f.setRGB(0.87 + S * 0.06, 0.9 + S * 0.05, 0.94 + S * 0.04), c[y * 3] = f.r, c[y * 3 + 1] = f.g, c[y * 3 + 2] = f.b;
    }
    a.setAttribute("color", new v.Float32BufferAttribute(c, 3)), a.computeVertexNormals();
    const d = Math.max(28, Math.min(96, Math.round(n * n * 3))), p = new Float32Array(d * 3), h = new Float32Array(d * 3);
    for (let y = 0; y < d; y++) {
      const g = it(y * 2.71 + 0.4) * n - n * 0.5, m = it(y * 3.97 + 1.9) * n - n * 0.5, w = it(y * 5.41 + 2.2), S = it(y * 7.13 + 3.1), C = Cn(g, m, n) + 0.016 + w * 0.02;
      p[y * 3] = g, p[y * 3 + 1] = C, p[y * 3 + 2] = m, f.setRGB(0.9 + S * 0.08, 0.94 + S * 0.05, 1), h[y * 3] = f.r, h[y * 3 + 1] = f.g, h[y * 3 + 2] = f.b;
    }
    const x = new v.BufferGeometry();
    return x.setAttribute("position", new v.Float32BufferAttribute(p, 3)), x.setAttribute("color", new v.Float32BufferAttribute(h, 3)), [a, x];
  }, [n]);
  return L(() => () => {
    o.dispose(), i.dispose();
  }, [i, o]), /* @__PURE__ */ b("group", { position: [0, 0.045, 0], children: [
    /* @__PURE__ */ l("mesh", { geometry: o, material: r, castShadow: !0, receiveShadow: !0 }),
    /* @__PURE__ */ l("points", { geometry: i, frustumCulled: !1, children: /* @__PURE__ */ l(
      "pointsMaterial",
      {
        size: Math.max(0.03, n * 0.01),
        vertexColors: !0,
        transparent: !0,
        opacity: 0.55,
        depthWrite: !1
      }
    ) })
  ] });
}
const Cd = "/resources/blade_alpha.jpg", kd = "/resources/blade_diffuse.jpg";
var Id = `precision highp float;\r
uniform sampler2D map;\r
uniform sampler2D alphaMap;\r
uniform vec3 tipColor;\r
uniform vec3 bottomColor;\r
uniform float uToon;\r
uniform float uToonSteps;\r
varying vec2 vUv;\r
varying float frc;\r
varying float vCluster;\r
varying float vDryness;\r
varying float vShade;

void main() {\r
  float alpha = texture2D(alphaMap, vUv).r;\r
  if(alpha < 0.15)\r
    discard;\r
  vec3 warmBottom = vec3(0.30, 0.23, 0.08);\r
  vec3 warmTip = vec3(0.80, 0.74, 0.34);\r
  vec3 coolBottom = vec3(0.18, 0.31, 0.12);\r
  vec3 coolTip = vec3(0.63, 0.82, 0.42);\r
  vec3 lushBottom = mix(bottomColor, coolBottom, vCluster * 0.35);\r
  vec3 lushTip = mix(tipColor, coolTip, vCluster * 0.28);\r
  vec3 dryBottom = mix(lushBottom, warmBottom, vDryness * 0.85);\r
  vec3 dryTip = mix(lushTip, warmTip, vDryness);

  float frcStepped = mix(smoothstep(0.0, 1.0, frc), floor(frc * uToonSteps) / max(uToonSteps - 1.0, 1.0), uToon);\r
  vec3 bladeGradient = mix(dryBottom, dryTip, frcStepped);\r
  vec3 tex = texture2D(map, vUv).rgb;\r
  float rib = 1.0 - smoothstep(0.0, 0.52, abs(vUv.x - 0.5));\r
  vec3 color = mix(bladeGradient * 0.72, tex * bladeGradient, mix(0.62, 0.35, uToon));\r
  color *= mix(0.9, 1.1, vCluster);\r
  color *= mix(1.0, 0.82, vDryness * 0.35);\r
  color *= mix(0.94, 1.05, rib);

  float shadeStepped = mix(vShade, floor(vShade * uToonSteps) / max(uToonSteps - 1.0, 1.0), uToon);\r
  color *= shadeStepped;

  vec4 col = vec4(color, 1.0);\r
  vec3 reinhard = col.rgb / (col.rgb + vec3(1.0));\r
  vec3 simple = clamp(col.rgb, 0.0, 1.0);\r
  col.rgb = mix(reinhard, simple, uToon);\r
  col.rgb = pow(col.rgb, vec3(1.0 / 2.2));

  gl_FragColor = col;\r
}`;
let ji = null;
function Ad(n) {
  ji = n;
}
class Td {
  nextId = 1;
  tiles = /* @__PURE__ */ new Map();
  // Reusable scratch buffers — never grow beyond the largest registered batch.
  positions = new Float32Array(0);
  weights = new Float32Array(0);
  trampleWorld = new v.Vector3(0, -9999, 0);
  trampleStrength = 0;
  lastSampleAt = 0;
  register(e) {
    this.tiles.size === 0 && (this.lastSampleAt = 0);
    const t = this.nextId++, r = { ...e, id: t };
    return this.tiles.set(t, r), this.ensureCapacity(this.tiles.size), r;
  }
  update(e, t) {
    const r = this.tiles.get(e);
    r && Object.assign(r, t);
  }
  unregister(e) {
    this.tiles.delete(e), this.tiles.size === 0 && (this.lastSampleAt = 0);
  }
  size() {
    return this.tiles.size;
  }
  /**
   * Run one management tick. Cheap to call from a single shared
   * `useFrame` that lives at the top of the scene; safe to call from
   * each individual tile if no shared driver is mounted (the manager
   * dedupes by tracking `lastSampleAt`).
   */
  tick(e) {
    if (this.tiles.size === 0) return;
    const t = performance.now();
    if (t - this.lastSampleAt < 12) return;
    this.lastSampleAt = t, this.refreshTrample(e.delta);
    const r = this.computeWindScale(), o = e.elapsedTime / 4;
    this.ensureCapacity(this.tiles.size);
    let i = 0;
    const s = [];
    for (const u of this.tiles.values()) {
      const c = i * 3;
      this.positions[c] = u.center.x, this.positions[c + 1] = u.center.y, this.positions[c + 2] = u.center.z, s.push(u.id), i += 1;
    }
    this.computeWeights(s.length, e.cameraPosition);
    let a = 0;
    for (const u of s) {
      const c = this.tiles.get(u);
      if (!c) {
        a += 1;
        continue;
      }
      const f = this.weights[a] ?? 0;
      a += 1;
      const d = Math.hypot(c.width, c.height) * 0.6, p = _d.set(c.center, d), h = e.frustum.intersectsSphere(p), x = Math.max(0, Math.floor(c.maxInstances * f)), y = h && x > 0;
      c.apply({
        visible: y,
        instanceCount: y ? x : 0,
        time: o,
        windScale: r,
        trampleCenter: this.trampleWorld,
        trampleStrength: this.trampleStrength
      });
    }
  }
  ensureCapacity(e) {
    this.positions.length < e * 3 && (this.positions = new Float32Array(e * 3)), this.weights.length < e && (this.weights = new Float32Array(e));
  }
  computeWeights(e, t) {
    const r = ji, o = 24, i = 160, s = 4;
    if (r)
      try {
        const a = r.alloc_f32(e * 3), u = r.alloc_f32(e);
        try {
          new Float32Array(r.memory.buffer, a, e * 3).set(this.positions.subarray(0, e * 3)), r.batch_sfe_weights(e, a, t.x, t.y, t.z, o, i, s, u), this.weights.set(new Float32Array(r.memory.buffer, u, e));
        } finally {
          r.dealloc_f32(a, e * 3), r.dealloc_f32(u, e);
        }
        return;
      } catch {
      }
    for (let a = 0; a < e; a += 1) {
      const u = a * 3, c = (this.positions[u] ?? 0) - t.x, f = (this.positions[u + 1] ?? 0) - t.y, d = (this.positions[u + 2] ?? 0) - t.z, p = Math.sqrt(c * c + f * f + d * d);
      this.weights[a] = Pd(p, o, i, s);
    }
  }
  refreshTrample(e) {
    const t = Xo.getOrCreate("motion"), r = t?.getActiveEntities() ?? [], o = r[0] ? t?.snapshot(r[0]) : null, i = v.MathUtils.clamp(e * 6, 0, 1);
    o && (this.trampleWorld.x += (o.position.x - this.trampleWorld.x) * i, this.trampleWorld.y = o.position.y, this.trampleWorld.z += (o.position.z - this.trampleWorld.z) * i);
    const s = o?.isMoving && o?.isGrounded ? 0.85 : 0.35;
    this.trampleStrength += (s - this.trampleStrength) * i;
  }
  computeWindScale() {
    const e = Ge.getState().current, t = e?.intensity ?? 0;
    return (e?.kind === "storm" ? 2.6 : e?.kind === "rain" ? 1.7 : e?.kind === "snow" ? 1.3 : e?.kind === "cloudy" ? 1.15 : 0.85) + t * 0.9;
  }
}
const _d = new v.Sphere();
function Pd(n, e, t, r) {
  if (n <= e) return 1;
  if (n >= t) return 0;
  const o = (n - e) / (t - e);
  return Math.pow(1 - o, Math.max(1, r));
}
let yr = null;
function kn() {
  return yr || (yr = new Td()), yr;
}
var Rd = `precision highp float;\r
attribute vec3 offset;\r
attribute vec4 orientation;\r
attribute float halfRootAngleSin;\r
attribute float halfRootAngleCos;\r
attribute float stretch;\r
uniform float time;\r
uniform float windScale;\r
uniform float bladeHeight;\r
uniform vec3 trampleCenter;\r
uniform float trampleRadius;\r
uniform float trampleStrength;\r
varying vec2 vUv;\r
varying float frc;\r
varying float vCluster;\r
varying float vDryness;\r
varying float vShade;

vec3 mod289(vec3 x) {\r
  return x - floor(x * (1.0 / 289.0)) * 289.0;\r
}\r
vec2 mod289(vec2 x) {\r
  return x - floor(x * (1.0 / 289.0)) * 289.0;\r
}\r
vec3 permute(vec3 x) {\r
  return mod289(((x * 34.0) + 1.0) * x);\r
}

float snoise(vec2 v) {\r
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);\r
  vec2 i = floor(v + dot(v, C.yy));\r
  vec2 x0 = v - i + dot(i, C.xx);\r
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r
  vec4 x12 = x0.xyxy + C.xxzz;\r
  x12.xy -= i1;\r
  i = mod289(i);\r
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));\r
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r
  m = m * m;\r
  m = m * m;\r
  vec3 x = 2.0 * fract(p * C.www) - 1.0;\r
  vec3 h = abs(x) - 0.5;\r
  vec3 ox = floor(x + 0.5);\r
  vec3 a0 = x - ox;\r
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);\r
  vec3 g;\r
  g.x = a0.x * x0.x + h.x * x0.y;\r
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r
  return 130.0 * dot(m, g);\r
}

vec3 rotateVectorByQuaternion(vec3 v, vec4 q) {\r
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);\r
}

void main() {\r
  frc = position.y / float(bladeHeight);\r
  float clusterNoise = snoise(offset.xz * 0.11 + vec2(3.7, -8.2));\r
  float dryNoise = snoise(offset.xz * 0.18 + vec2(-5.4, 12.6));\r
  float noise = 1.0 - snoise(vec2((time - offset.x / 50.0), (time - offset.z / 50.0)));\r
  vec4 direction = vec4(0.0, halfRootAngleSin, 0.0, halfRootAngleCos);\r
  vec4 tiltAxis = vec4(-orientation.z, 0.0, orientation.x, orientation.w);\r
  vec4 bent = normalize(mix(direction, tiltAxis, frc));\r
  vec3 vPosition = vec3(position.x, position.y + position.y * stretch, position.z);\r
  vPosition = rotateVectorByQuaternion(vPosition, bent);

  float windAngle = noise * 0.3 * windScale;\r
  vec4 windQuat = vec4(sin(windAngle), 0.0, -sin(windAngle), cos(windAngle));\r
  vPosition = rotateVectorByQuaternion(vPosition, windQuat);

  
  
  
  if (trampleRadius > 0.0001) {\r
    vec2 toCenter = offset.xz - trampleCenter.xz;\r
    float distXZ = length(toCenter);\r
    float falloff = clamp(1.0 - distXZ / trampleRadius, 0.0, 1.0);\r
    if (falloff > 0.0) {\r
      float push = falloff * falloff * trampleStrength;\r
      vPosition.y *= mix(1.0, 0.18, push);\r
      vec2 dir = distXZ > 0.0001 ? toCenter / distXZ : vec2(0.0);\r
      vPosition.x += dir.x * push * 0.45 * frc;\r
      vPosition.z += dir.y * push * 0.45 * frc;\r
    }\r
  }

  vCluster = clusterNoise * 0.5 + 0.5;\r
  vDryness = clamp((dryNoise * 0.5 + 0.5) * 0.7 + (1.0 - stretch) * 0.45, 0.0, 1.0);\r
  vShade = clamp(0.82 + noise * 0.08 + orientation.w * 0.06, 0.72, 1.1);\r
  vUv = uv;\r
  gl_Position = projectionMatrix * modelViewMatrix * vec4(offset + vPosition, 1.0);\r
}`;
let br = null, vr = null;
function Nd(n) {
  return n ? (br || (br = mt({
    color: "#ffffff",
    vertexColors: !0,
    steps: 3
  })), br) : (vr || (vr = new v.MeshStandardMaterial({
    color: "#ffffff",
    vertexColors: !0,
    roughness: 0.95,
    metalness: 0
  })), vr);
}
const Ht = Dr(), Ed = new v.Color("#2a4220"), Bd = new v.Color("#5a7a35"), zd = new v.Color("#7a8e3a"), Dd = new v.Color("#5b4628"), Fd = Lr(
  {
    bladeHeight: 1,
    map: null,
    alphaMap: null,
    time: 0,
    windScale: 1,
    trampleCenter: new v.Vector3(0, -9999, 0),
    trampleRadius: 1.4,
    trampleStrength: 0.85,
    tipColor: new v.Color("#8fbc5a").convertSRGBToLinear(),
    bottomColor: new v.Color("#355b2d").convertSRGBToLinear(),
    uToon: 0,
    uToonSteps: 4
  },
  Rd,
  Id
);
An({ GrassMaterial: Fd });
function Qr(n, e) {
  return 0.05 * Ht(n / 50, e / 50) + 0.05 * Ht(n / 100, e / 100);
}
function Ld(n, e, t) {
  const r = e * 3, o = e * 4, i = n.alloc_f32(r), s = n.alloc_f32(o), a = n.alloc_f32(e), u = n.alloc_f32(e), c = n.alloc_f32(e);
  try {
    const f = Math.random() * 4294967295 >>> 0;
    n.fill_grass_data(e, t, f, i, s, a, u, c);
    const d = n.memory.buffer;
    return {
      offsets: new Float32Array(d, i, r).slice(),
      orientations: new Float32Array(d, s, o).slice(),
      stretches: new Float32Array(d, a, e).slice(),
      halfRootAngleSin: new Float32Array(d, u, e).slice(),
      halfRootAngleCos: new Float32Array(d, c, e).slice()
    };
  } finally {
    n.dealloc_f32(i, r), n.dealloc_f32(s, o), n.dealloc_f32(a, e), n.dealloc_f32(u, e), n.dealloc_f32(c, e);
  }
}
function Gd(n, e) {
  const t = new Float32Array(n * 3), r = new Float32Array(n * 4), o = new Float32Array(n), i = new Float32Array(n), s = new Float32Array(n), a = new v.Quaternion(), u = new v.Quaternion(), c = new v.Vector3(1, 0, 0), f = new v.Vector3(0, 0, 1), d = Math.ceil(Math.sqrt(n)), p = e / d, h = p * 0.9;
  let x = 0, y = 0;
  for (let g = 0; g < n; g++) {
    const m = g % d, w = g / d | 0, S = (Math.random() - 0.5) * h, C = (Math.random() - 0.5) * h, T = (m + 0.5) * p - e / 2 + S, M = (w + 0.5) * p - e / 2 + C;
    t[x] = T, t[x + 1] = Qr(T, M), t[x + 2] = M, x += 3;
    const _ = Math.PI - Math.random() * (Math.PI / 6);
    i[g] = Math.sin(0.5 * _), s[g] = Math.cos(0.5 * _), a.setFromAxisAngle(f, _), u.setFromAxisAngle(c, Math.random() * Math.PI / 8), a.multiply(u), r[y] = a.x, r[y + 1] = a.y, r[y + 2] = a.z, r[y + 3] = a.w, y += 4, o[g] = 0.7 + Math.random() * 0.45;
  }
  return { offsets: t, orientations: r, stretches: o, halfRootAngleCos: s, halfRootAngleSin: i };
}
function Od(n, e, t) {
  const r = Math.ceil(Math.sqrt(e)), i = t / r * 0.9, s = n.offsets, a = n.stretches;
  for (let u = 0; u < e; u++) {
    const c = u * 3, f = (s[c] ?? 0) + (Math.random() - 0.5) * i, d = (s[c + 2] ?? 0) + (Math.random() - 0.5) * i;
    s[c] = f, s[c + 2] = d, s[c + 1] = Qr(f, d), a[u] = 0.7 + Math.random() * 0.55;
  }
}
const $i = gs(
  ({
    options: n = { bW: 0.14, bH: 0.65, joints: 5 },
    width: e = 4,
    instances: t,
    density: r,
    maxInstances: o = 18e3,
    toon: i,
    lod: s,
    center: a,
    ...u
  }) => {
    const { bW: c, bH: f, joints: d } = n, p = pc((P) => P.profile.instanceScale), h = F(() => {
      const P = Math.max(64, Math.min(o, Math.round(o * p)));
      if (typeof t == "number" && t > 0)
        return Math.max(1, Math.min(P, Math.floor(t * p)));
      const B = typeof r == "number" && r > 0 ? r : 90, U = Math.max(1, e * e);
      return Math.max(64, Math.min(P, Math.round(B * U * p)));
    }, [t, r, e, o, p]), x = i ?? Te(), y = Nd(x), g = E(null), m = E(null), w = E(h), S = E(null), C = E(null), [T, M] = bs(v.TextureLoader, [
      kd,
      Cd
    ]), [_, k] = Z(null);
    L(() => {
      Oi().then((P) => {
        P && (k(P), Ad(P));
      });
    }, []);
    const R = F(
      () => {
        const P = _ ? Ld(_, h, e) : Gd(h, e);
        return Od(P, h, e), P;
      },
      [h, e, _]
    ), [z, N] = F(() => {
      const P = new v.PlaneGeometry(c, f, 1, d).translate(0, f / 2, 0), B = Math.max(8, Math.min(128, Math.round(e * 1.5))), U = new v.PlaneGeometry(e, e, B, B), W = U.getAttribute("position"), H = new Float32Array(W.count * 3), I = new v.Color();
      for (let G = 0; G < W.count; G++) {
        const V = W.getX(G), J = W.getZ(G);
        W.setY(G, Qr(V, J));
        const X = 0.5 + 0.5 * Ht(V * 0.18, J * 0.18), K = 0.5 + 0.5 * Ht(V * 0.04 + 11.3, J * 0.04 - 7.7), Q = 0.5 + 0.5 * Ht(V * 0.55 - 3.1, J * 0.55 + 9.4), ee = v.MathUtils.clamp(X * 0.65 + K * 0.45, 0, 1);
        I.copy(Ed).lerp(Bd, ee).lerp(zd, K * 0.22), Q > 0.86 && I.lerp(Dd, (Q - 0.86) * 4);
        const se = G * 3;
        H[se] = I.r, H[se + 1] = I.g, H[se + 2] = I.b;
      }
      return U.setAttribute("color", new v.BufferAttribute(H, 3)), U.computeVertexNormals(), [P, U];
    }, [c, f, d, e]);
    return L(() => () => {
      z.dispose(), N.dispose();
    }, [z, N]), L(() => {
      const P = C.current;
      P && (P.instanceCount = h, w.current = h);
    }, [h, R]), L(() => {
      const P = S.current;
      P?.uniforms && (P.uniforms.uToon && (P.uniforms.uToon.value = x ? 1 : 0), P.uniforms.uToonSteps && (P.uniforms.uToonSteps.value = 4));
    }, [x]), L(() => {
      const P = g.current, B = new v.Vector3();
      a ? B.set(a[0], a[1], a[2]) : P && (P.updateWorldMatrix(!0, !1), P.getWorldPosition(B));
      const U = (H) => {
        const I = m.current, G = C.current, V = S.current?.uniforms;
        !I || !G || !V || (I.visible !== H.visible && (I.visible = H.visible), G.instanceCount !== H.instanceCount && (G.instanceCount = H.instanceCount, w.current = H.instanceCount), V.time && (V.time.value = H.time), V.windScale && (V.windScale.value = H.windScale), V.trampleCenter && V.trampleCenter.value.copy(H.trampleCenter), V.trampleStrength && (V.trampleStrength.value = H.trampleStrength));
      }, W = kn().register({
        width: e,
        height: f * 1.4,
        center: B,
        maxInstances: h,
        ...s ? { lod: s } : {},
        apply: U
      });
      return () => {
        kn().unregister(W.id);
      };
    }, [e, f, h, a?.[0], a?.[1], a?.[2], s?.near, s?.far, s?.strength]), L(() => {
      const P = C.current;
      if (!P) return;
      const B = Math.hypot(e, f * 1.4) * 0.6;
      P.boundingSphere = new v.Sphere(new v.Vector3(0, f * 0.5, 0), B), P.boundingBox = new v.Box3(
        new v.Vector3(-e * 0.5, 0, -e * 0.5),
        new v.Vector3(e * 0.5, f * 1.6, e * 0.5)
      );
    }, [e, f]), /* @__PURE__ */ b("group", { ref: g, ...u, children: [
      /* @__PURE__ */ b("mesh", { ref: m, frustumCulled: !0, children: [
        /* @__PURE__ */ b(
          "instancedBufferGeometry",
          {
            ref: C,
            index: z.index,
            "attributes-position": z.getAttribute("position"),
            "attributes-uv": z.getAttribute("uv"),
            children: [
              /* @__PURE__ */ l("instancedBufferAttribute", { attach: "attributes-offset", args: [R.offsets, 3] }),
              /* @__PURE__ */ l("instancedBufferAttribute", { attach: "attributes-orientation", args: [R.orientations, 4] }),
              /* @__PURE__ */ l("instancedBufferAttribute", { attach: "attributes-stretch", args: [R.stretches, 1] }),
              /* @__PURE__ */ l("instancedBufferAttribute", { attach: "attributes-halfRootAngleSin", args: [R.halfRootAngleSin, 1] }),
              /* @__PURE__ */ l("instancedBufferAttribute", { attach: "attributes-halfRootAngleCos", args: [R.halfRootAngleCos, 1] })
            ]
          }
        ),
        /* @__PURE__ */ l(
          "grassMaterial",
          {
            ref: S,
            map: T ?? null,
            alphaMap: M ?? null,
            toneMapped: !1,
            side: v.DoubleSide,
            transparent: !0
          }
        )
      ] }),
      /* @__PURE__ */ l(
        "mesh",
        {
          position: [0, 0, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: y,
          receiveShadow: !0,
          children: /* @__PURE__ */ l("primitive", { object: N, attach: "geometry" })
        }
      )
    ] });
  }
);
$i.displayName = "Grass";
An({ Water: Cs });
const Ud = (
  /* glsl */
  `
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vWave;

void main() {
  vUv = uv;
  vec3 p = position;
  float w1 = sin(p.x * 0.55 + uTime * 0.85) * 0.085;
  float w2 = sin(p.y * 0.78 - uTime * 1.05 + p.x * 0.33) * 0.055;
  float w3 = sin((p.x + p.y) * 1.40 + uTime * 1.60) * 0.025;
  float w  = w1 + w2 + w3;
  p.z += w;
  vWave = w;
  vWorldPos = (modelMatrix * vec4(p, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`
), Wd = (
  /* glsl */
  `
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uFoam;
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldPos;
varying float vWave;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.07 + vec2(13.7, 7.1);
    a *= 0.5;
  }
  return v;
}

float band(float v, float c, float w) {
  return smoothstep(c - w, c, v) - smoothstep(c, c + w, v);
}

void main() {
  vec2 wp = vWorldPos.xz;

  float baseNoise = fbm(wp * 0.18 + vec2(uTime * 0.04, -uTime * 0.03));
  float depthCol  = clamp(0.5 + vWave * 3.5 + (baseNoise - 0.5) * 0.55, 0.0, 1.0);
  vec3  base      = mix(uDeep, uShallow, depthCol);

  float stripeCoord = (wp.x + wp.y) * 0.55 + uTime * 0.35 + baseNoise * 0.8;
  float stripe      = sin(stripeCoord * 6.0) * 0.5 + 0.5;
  float stripeFoam  = band(stripe, 0.86, 0.10) * (0.35 + depthCol * 0.65);

  float specks = smoothstep(0.78, 0.95, fbm(wp * 0.62 + uTime * 0.10));
  float ripple = smoothstep(0.60, 0.95, fbm(wp * 1.30 + uTime * 0.60));

  vec3 col = mix(base, uFoam, stripeFoam * 0.55 + specks * 0.50 + ripple * 0.18);

  float edge = smoothstep(0.0, 0.06, min(min(vUv.x, vUv.y), min(1.0 - vUv.x, 1.0 - vUv.y)));
  col = mix(col * 0.86, col, edge);

  gl_FragColor = vec4(col, 0.88);
}
`
);
function Hd({ lod: n, center: e, size: t = 16, shore: r, toon: o }) {
  const i = o ?? Te(), s = E(null), a = E(null), u = E(null), c = Fr("/resources/waternormals.jpeg"), f = E(new v.Vector3()), d = E(!0), p = E(0), h = F(
    () => new v.MeshPhysicalMaterial({
      color: "#8dbab5",
      roughness: 0.28,
      metalness: 0.02,
      transparent: !0,
      opacity: 0.42,
      clearcoat: 0.18,
      clearcoatRoughness: 0.72,
      depthWrite: !1
    }),
    []
  ), x = F(
    () => ({
      north: r?.north ?? !0,
      south: r?.south ?? !0,
      east: r?.east ?? !0,
      west: r?.west ?? !0
    }),
    [r?.east, r?.north, r?.south, r?.west]
  ), y = Math.min(t * 0.18, 0.72), g = x.north ? y : 0, m = x.south ? y : 0, w = x.east ? y : 0, S = x.west ? y : 0, C = Math.max(t - S - w, t * 0.34), T = Math.max(t - g - m, t * 0.34), M = (S - w) * 0.5, _ = (g - m) * 0.5, k = Math.max(
    t - (x.west ? y * 0.25 : 0) - (x.east ? y * 0.25 : 0),
    t * 0.42
  ), R = Math.max(
    t - (x.north ? y * 0.25 : 0) - (x.south ? y * 0.25 : 0),
    t * 0.42
  ), z = F(() => Math.max(2, Math.round(t / 4)), [t]);
  L(() => {
    c && (c.wrapS = c.wrapT = v.RepeatWrapping, c.repeat.set(z, z), c.needsUpdate = !0);
  }, [c, z]), L(() => {
    e && f.current.set(e[0], e[1], e[2]);
  }, [e]);
  const N = F(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: c,
      sunDirection: new v.Vector3(0.1, 0.7, 0.2),
      sunColor: 16777215,
      waterColor: 7695,
      distortionScale: 3.7
    }),
    [c]
  ), P = F(() => {
    const W = Math.max(C, T), H = Math.round(i ? W * 4 : W * 1.2);
    return Math.max(i ? 16 : 6, Math.min(i ? 96 : 32, H));
  }, [i, C, T]), B = F(
    () => new v.PlaneGeometry(C, T, P, P),
    [T, C, P]
  ), U = F(() => i ? new v.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uShallow: { value: new v.Color("#9ed6c8") },
      uDeep: { value: new v.Color("#1f5f88") },
      uFoam: { value: new v.Color("#ffffff") }
    },
    vertexShader: Ud,
    fragmentShader: Wd,
    transparent: !0,
    depthWrite: !1
  }) : null, [i]);
  return L(() => () => {
    B.dispose();
    const W = s.current;
    W?.material?.dispose?.(), typeof W?.dispose == "function" && W.dispose(), U?.dispose();
  }, [B, U]), L(() => () => {
    h.dispose();
  }, [h]), de((W, H) => {
    const I = i ? u.current : s.current;
    if (I) {
      if (n) {
        p.current += Math.max(0, H);
        const G = d.current ? 0.2 : 0.5;
        if (p.current >= G) {
          p.current = 0;
          const V = n.near ?? 30, J = n.far ?? 180, X = n.strength ?? 4, K = W.camera.position.distanceTo(f.current), ee = Ct(K, V, J, X) > 0;
          ee !== d.current && (d.current = ee, I.visible = ee);
        }
        if (!d.current) return;
      }
      if (i) {
        const G = a.current?.uniforms?.uTime;
        G && (G.value = W.clock.elapsedTime);
      } else {
        const G = s.current?.material.uniforms?.time;
        G && (G.value += H * 0.3);
      }
    }
  }), /* @__PURE__ */ b("group", { children: [
    x.north && /* @__PURE__ */ l(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [0, 0.055, -t / 2 + y / 2],
        material: h,
        receiveShadow: !0,
        children: /* @__PURE__ */ l("planeGeometry", { args: [k, y, 1, 1] })
      }
    ),
    x.south && /* @__PURE__ */ l(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [0, 0.055, t / 2 - y / 2],
        material: h,
        receiveShadow: !0,
        children: /* @__PURE__ */ l("planeGeometry", { args: [k, y, 1, 1] })
      }
    ),
    x.west && /* @__PURE__ */ l(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [-t / 2 + y / 2, 0.055, 0],
        material: h,
        receiveShadow: !0,
        children: /* @__PURE__ */ l("planeGeometry", { args: [y, R, 1, 1] })
      }
    ),
    x.east && /* @__PURE__ */ l(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [t / 2 - y / 2, 0.055, 0],
        material: h,
        receiveShadow: !0,
        children: /* @__PURE__ */ l("planeGeometry", { args: [y, R, 1, 1] })
      }
    ),
    i ? /* @__PURE__ */ l(
      "mesh",
      {
        ref: u,
        geometry: B,
        "rotation-x": -Math.PI / 2,
        position: [M, 0.1, _],
        children: /* @__PURE__ */ l(
          "primitive",
          {
            ref: a,
            object: U,
            attach: "material"
          }
        )
      }
    ) : /* @__PURE__ */ l(
      "water",
      {
        ref: s,
        args: [B, N],
        "rotation-x": -Math.PI / 2,
        position: [M, 0.1, _]
      }
    )
  ] });
}
const jd = 25, $d = 90, Vd = 4, Vi = {
  north: !0,
  south: !0,
  east: !0,
  west: !0
};
function qd(n, e, t) {
  const o = ie.GRID_CELL_SIZE * (n.size || 1) / 2;
  return e > n.position.x - o + 1e-3 && e < n.position.x + o - 1e-3 && t > n.position.z - o + 1e-3 && t < n.position.z + o - 1e-3;
}
function Yd(n, e) {
  const t = ie.GRID_CELL_SIZE * (n.size || 1), r = t / 2, o = Math.max(0.08, t * 0.06), i = Math.max(0.12, ie.HEIGHT_STEP * 0.25), s = e ?? [];
  if (s.length === 0) return Vi;
  const a = (u, c) => {
    for (const f of s)
      if (f.id !== n.id && !(Math.abs(f.position.y - n.position.y) > i) && qd(f, u, c))
        return !0;
    return !1;
  };
  return {
    north: !a(n.position.x, n.position.z - r - o),
    south: !a(n.position.x, n.position.z + r + o),
    west: !a(n.position.x - r - o, n.position.z),
    east: !a(n.position.x + r + o, n.position.z)
  };
}
const Zd = /* @__PURE__ */ new Set(["sand", "snowfield"]);
function Xd({ tile: n, tiles: e }) {
  if (!n.objectType || n.objectType === "none" || Zd.has(n.objectType)) return null;
  const t = E(null), r = E(!0), o = E(0), i = ie.GRID_CELL_SIZE * (n.size || 1), s = [n.position.x, n.position.y, n.position.z], a = F(
    () => n.objectType === "water" ? Yd(n, e) : Vi,
    [n, e]
  );
  return de((u, c) => {
    o.current += c;
    const f = r.current ? 0.3 : 0.8;
    if (o.current < f) return;
    o.current = 0;
    const d = u.camera.position, p = n.position, h = d.x - p.x, x = d.y - p.y, y = d.z - p.z, g = Math.sqrt(h * h + x * x + y * y), w = Ct(g, jd, $d, Vd) > 0;
    w !== r.current && (r.current = w, t.current && (t.current.visible = w));
  }), /* @__PURE__ */ l("group", { ref: t, position: s, children: /* @__PURE__ */ b(tt, { fallback: null, children: [
    n.objectType === "water" && /* @__PURE__ */ l(Hd, { size: i, shore: a, center: s }),
    n.objectType === "grass" && /* @__PURE__ */ l(
      $i,
      {
        width: i,
        density: n.objectConfig?.grassDensity ?? 90,
        position: [0, 0.05, 0]
      }
    )
  ] }) });
}
function Kd(n) {
  return n - Math.floor(n);
}
function ut(...n) {
  const e = n.reduce((t, r, o) => t + r * (o * 19.19 + 7.13), 0);
  return Kd(Math.sin(e) * 43758.5453123);
}
function Dt(n) {
  return n.shape ?? "box";
}
function Nr(n, e, t) {
  const r = Math.cos(t), o = Math.sin(t);
  return [n * r + e * o, e * r - n * o];
}
function eo(n) {
  const e = (n.size || 1) * ie.GRID_CELL_SIZE, t = Math.max(4, Math.min(8, (n.size || 1) * 4)), r = Math.max(n.position.y, ie.HEIGHT_STEP), o = r / t, i = e / t, s = Math.max(t * 4, Math.ceil(r / 0.08)), a = n.rotation ?? 0;
  return { tileSize: e, stepCount: t, totalHeight: r, stepHeight: o, stepDepth: i, colliderSlices: s, rotation: a };
}
function jo(n) {
  const e = (n.size || 1) * ie.GRID_CELL_SIZE, t = Math.max(12, Math.min(24, Math.ceil(e / 0.25))), r = Math.max(n.position.y, ie.HEIGHT_STEP), o = r / t, i = e / t, s = n.rotation ?? 0;
  return { tileSize: e, rampSlices: t, totalHeight: r, sliceHeight: o, sliceDepth: i, rotation: s };
}
function Er(n) {
  const t = (n.size || 1) * ie.GRID_CELL_SIZE / 2;
  return {
    id: n.id,
    topY: n.position.y,
    minX: n.position.x - t,
    maxX: n.position.x + t,
    minZ: n.position.z - t,
    maxZ: n.position.z + t,
    centerX: n.position.x,
    centerZ: n.position.z,
    segments: n.size || 1
  };
}
function qi(n, e, t, r) {
  let o = 0;
  for (const i of n)
    i.id !== e && t > i.minX + 1e-3 && t < i.maxX - 1e-3 && r > i.minZ + 1e-3 && r < i.maxZ - 1e-3 && (o = Math.max(o, i.topY));
  return o;
}
function Jd(n, e, t, r, o, i, s, a) {
  const u = (c, f) => {
    n.push(c[0], c[1], c[2]), e.push(f.r, f.g, f.b);
  };
  u(t, s), u(r, s), u(o, a), u(t, s), u(o, a), u(i, a);
}
function Ft(n, e, t, r, o) {
  n.push(
    e[0],
    e[1],
    e[2],
    t[0],
    t[1],
    t[2],
    r[0],
    r[1],
    r[2],
    e[0],
    e[1],
    e[2],
    r[0],
    r[1],
    r[2],
    o[0],
    o[1],
    o[2]
  );
}
function Qd(n, e, t) {
  const r = [], o = [], i = [], s = e.map(Er), a = n.map(Er), u = new v.Color("#7b6a58"), c = new v.Color("#433930"), f = ie.GRID_CELL_SIZE, d = (h, x, y, g, m, w, S, C, T, M) => {
    const _ = qi(s, h.id, w, S);
    if (h.topY <= _ + 0.02) return;
    const k = h.topY - _, R = 0.72 + ut(M, h.centerX, h.centerZ) * 0.16, z = 0.42 + ut(M, h.topY) * 0.08, N = t.clone().lerp(u, 0.28 + Math.min(k, 2) * 0.08).multiplyScalar(R), P = t.clone().lerp(c, 0.7).multiplyScalar(z);
    if (Jd(
      r,
      o,
      [x, h.topY, y],
      [g, h.topY, m],
      [g, _, m],
      [x, _, y],
      N,
      P
    ), k < ie.HEIGHT_STEP * 0.95) return;
    const B = ut(M, _, k);
    if (B < 0.58) return;
    const U = (x + g) * 0.5, W = (y + m) * 0.5, H = 0.12 + Math.min(k, 2.5) * 0.06, I = 0.08 + B * 0.08;
    i.push({
      position: [
        U + C * (0.18 + B * 0.24),
        _ + H * 0.65,
        W + T * (0.18 + B * 0.24)
      ],
      rotation: [
        B * Math.PI * 1.7,
        B * Math.PI * 2.9,
        B * Math.PI * 0.9
      ],
      scale: [
        H + I * 0.6,
        H * 0.9 + I * 0.45,
        H + I
      ]
    });
  };
  for (const h of a) {
    if (h.topY <= 0.02) continue;
    const y = -(h.segments * f) / 2;
    for (let g = 0; g < h.segments; g++) {
      const m = y + g * f, w = m + f, S = m + f * 0.5;
      d(
        h,
        h.maxX,
        h.centerZ + m,
        h.maxX,
        h.centerZ + w,
        h.maxX + 0.02,
        h.centerZ + S,
        1,
        0,
        ut(h.centerX, h.centerZ, g, 1)
      ), d(
        h,
        h.minX,
        h.centerZ + w,
        h.minX,
        h.centerZ + m,
        h.minX - 0.02,
        h.centerZ + S,
        -1,
        0,
        ut(h.centerX, h.centerZ, g, 2)
      ), d(
        h,
        h.centerX + w,
        h.minZ,
        h.centerX + m,
        h.minZ,
        h.centerX + S,
        h.minZ - 0.02,
        0,
        -1,
        ut(h.centerX, h.centerZ, g, 3)
      ), d(
        h,
        h.centerX + m,
        h.maxZ,
        h.centerX + w,
        h.maxZ,
        h.centerX + S,
        h.maxZ + 0.02,
        0,
        1,
        ut(h.centerX, h.centerZ, g, 4)
      );
    }
  }
  const p = new v.BufferGeometry();
  return r.length > 0 && (p.setAttribute("position", new v.Float32BufferAttribute(r, 3)), p.setAttribute("color", new v.Float32BufferAttribute(o, 3)), p.computeVertexNormals(), p.computeBoundingBox(), p.computeBoundingSphere()), { sideGeometry: p, rocks: i };
}
function ef(n, e) {
  const t = e.map(Er), { tileSize: r, totalHeight: o, rotation: i } = eo(n), [s, a] = Nr(0, r / 2 + 0.04, i);
  return qi(t, n.id, n.position.x + s, n.position.z + a) + 0.02 < o;
}
function tf(n, e) {
  const t = new v.BufferGeometry(), r = [], { tileSize: o, stepCount: i, stepHeight: s, stepDepth: a, totalHeight: u } = eo(n), c = o / 2;
  for (let f = 0; f < i; f++) {
    const d = -c + f * a, p = d + a, h = s * (f + 1), x = s * f;
    Ft(
      r,
      [-c, h, d],
      [-c, h, p],
      [c, h, p],
      [c, h, d]
    ), Ft(
      r,
      [-c, x, d],
      [-c, h, d],
      [c, h, d],
      [c, x, d]
    ), Ft(
      r,
      [-c, 0, d],
      [-c, 0, p],
      [-c, h, p],
      [-c, h, d]
    ), Ft(
      r,
      [c, 0, p],
      [c, 0, d],
      [c, h, d],
      [c, h, p]
    );
  }
  return e && Ft(
    r,
    [-c, 0, c],
    [c, 0, c],
    [c, u, c],
    [-c, u, c]
  ), t.setAttribute("position", new v.Float32BufferAttribute(r, 3)), t.computeVertexNormals(), t.computeBoundingBox(), t.computeBoundingSphere(), t;
}
function nf({
  tile: n,
  material: e,
  supportTiles: t
}) {
  const r = n.rotation ?? 0, o = F(() => ef(n, t), [t, n]), i = F(() => tf(n, o), [n, o]);
  return L(() => () => {
    i.dispose();
  }, [i]), /* @__PURE__ */ l(
    "mesh",
    {
      position: [n.position.x, 0, n.position.z],
      rotation: [0, r, 0],
      geometry: i,
      material: e,
      castShadow: !0,
      receiveShadow: !0
    }
  );
}
function rf({
  tileGroup: n,
  meshes: e,
  isEditMode: t = !1,
  onTileClick: r
}) {
  const o = E(new lt()), i = E(null), s = E(null), a = n.tiles.length, [u, c] = Z(() => Math.max(1, a)), f = F(
    () => n.tiles.filter((I) => Dt(I) === "box"),
    [n.tiles]
  ), d = F(
    () => n.tiles.filter((I) => Dt(I) === "stairs"),
    [n.tiles]
  ), p = F(
    () => n.tiles.filter((I) => Dt(I) === "ramp"),
    [n.tiles]
  ), h = F(
    () => n.tiles.filter((I) => Dt(I) === "round"),
    [n.tiles]
  ), x = F(() => {
    const I = o.current, G = e.get(n.floorMeshId);
    if (!G) {
      s.current?.dispose();
      const V = Te() ? new v.MeshToonMaterial({ color: "#888888", gradientMap: pt(4) }) : new v.MeshStandardMaterial({ color: "#888888" });
      return s.current = V, V;
    }
    return s.current?.dispose(), s.current = null, I.getMaterial(G);
  }, [n.floorMeshId, e]), y = F(() => {
    const I = e.get(n.floorMeshId);
    return new v.Color(I?.color || "#8a806f");
  }, [n.floorMeshId, e]), g = F(
    () => Qd(f, n.tiles, y),
    [f, n.tiles, y]
  ), m = F(
    () => Te() ? new v.MeshToonMaterial({
      vertexColors: !0,
      side: v.DoubleSide,
      gradientMap: pt(4)
    }) : new v.MeshStandardMaterial({
      vertexColors: !0,
      roughness: 0.98,
      metalness: 0.02,
      side: v.DoubleSide
    }),
    []
  ), w = F(() => new v.DodecahedronGeometry(1, 0), []), S = F(() => {
    const I = new v.BufferGeometry(), G = new Float32Array([
      -0.5,
      0,
      -0.5,
      0.5,
      0,
      -0.5,
      -0.5,
      0,
      0.5,
      0.5,
      0,
      0.5,
      -0.5,
      1,
      0.5,
      0.5,
      1,
      0.5
    ]), V = [
      0,
      1,
      3,
      0,
      3,
      2,
      0,
      1,
      5,
      0,
      5,
      4,
      0,
      2,
      4,
      1,
      5,
      3,
      2,
      3,
      5,
      2,
      5,
      4
    ];
    return I.setAttribute("position", new v.BufferAttribute(G, 3)), I.setIndex(V), I.computeVertexNormals(), I;
  }, []), C = F(
    () => Te() ? new v.MeshToonMaterial({
      color: "#71695f",
      gradientMap: pt(3)
    }) : new v.MeshStandardMaterial({
      color: "#71695f",
      roughness: 1,
      metalness: 0.02
    }),
    []
  ), T = F(() => {
    const I = new v.PlaneGeometry(1, 1, 1, 1);
    return I.rotateX(-Math.PI / 2), I;
  }, []), M = F(() => new v.Object3D(), []), _ = E(null), k = F(() => new v.BoxGeometry(1, 1, 1), []), R = F(
    () => Te() ? new v.MeshToonMaterial({
      color: "#ff0000",
      transparent: !0,
      opacity: 0.6,
      emissive: new v.Color("#ff0000"),
      emissiveIntensity: 0.2,
      gradientMap: pt(3)
    }) : new v.MeshStandardMaterial({
      color: "#ff0000",
      transparent: !0,
      opacity: 0.6,
      emissive: new v.Color("#ff0000"),
      emissiveIntensity: 0.2
    }),
    []
  ), z = F(
    () => n.tiles.filter((I) => I.objectType === "sand"),
    [n.tiles]
  ), N = F(
    () => z.map((I) => ({
      position: [I.position.x, I.position.y, I.position.z],
      size: ie.GRID_CELL_SIZE * (I.size || 1)
    })),
    [z]
  ), P = F(
    () => n.tiles.filter((I) => I.objectType === "snowfield"),
    [n.tiles]
  ), B = F(
    () => P.map((I) => ({
      position: [I.position.x, I.position.y, I.position.z],
      size: ie.GRID_CELL_SIZE * (I.size || 1)
    })),
    [P]
  ), U = F(
    () => n.tiles.filter(
      (I) => I.objectType && I.objectType !== "none" && I.objectType !== "sand" && I.objectType !== "snowfield"
    ),
    [n.tiles]
  ), W = F(
    () => n.tiles.filter((I) => I.objectType === "water"),
    [n.tiles]
  ), H = F(
    () => {
      const I = [];
      for (const G of n.tiles) {
        const V = Dt(G), J = (G.size || 1) * ie.GRID_CELL_SIZE, X = G.rotation ?? 0;
        if (V === "stairs") {
          const { tileSize: se, totalHeight: oe, colliderSlices: he, rotation: j } = eo(G), ue = oe / he, re = se / he;
          for (let ge = 0; ge < he; ge++) {
            const ne = ue * (ge + 1), Y = -se / 2 + re * ge + re / 2, [$, ae] = Nr(0, Y, j);
            I.push({
              key: `${G.id}-stair-collider-${ge}`,
              position: [
                G.position.x + $,
                ne / 2,
                G.position.z + ae
              ],
              rotation: [0, j, 0],
              args: [se / 2, ne / 2, re / 2]
            });
          }
          continue;
        }
        if (V === "ramp") {
          const { tileSize: se, rampSlices: oe, sliceHeight: he, sliceDepth: j, rotation: ue } = jo(G);
          for (let re = 0; re < oe; re++) {
            const ge = he * (re + 1), ne = -se / 2 + j * re + j / 2, [Y, $] = Nr(0, ne, ue);
            I.push({
              key: `${G.id}-ramp-${re}`,
              position: [
                G.position.x + Y,
                ge / 2,
                G.position.z + $
              ],
              rotation: [0, ue, 0],
              args: [se / 2, ge / 2, j / 2]
            });
          }
          continue;
        }
        if (V === "round") {
          const se = G.position.y > 0.02, oe = se ? G.position.y : 0.04, he = se ? oe / 2 : -0.02, j = J / 2, ue = j * 0.34;
          I.push({
            key: `${G.id}-core`,
            position: [G.position.x, he, G.position.z],
            rotation: [0, 0, 0],
            args: [j * 0.46, oe / 2, j * 0.46]
          });
          for (let re = 0; re < 4; re++)
            I.push({
              key: `${G.id}-ring-${re}`,
              position: [G.position.x, he, G.position.z],
              rotation: [0, Math.PI / 4 * re, 0],
              args: [j * 0.82, oe / 2, ue]
            });
          continue;
        }
        const K = G.position.y > 0.02, Q = K ? G.position.y * 0.5 : 0.02, ee = K ? G.position.y * 0.5 : -0.02;
        I.push({
          key: G.id,
          position: [G.position.x, ee, G.position.z],
          rotation: [0, X, 0],
          args: [J / 2, Q, J / 2]
        });
      }
      return I;
    },
    [n.tiles]
  );
  return L(() => {
    a <= u || c(Math.max(a, Math.ceil(u * 1.5)));
  }, [a, u]), Fe(() => {
    const I = _.current;
    if (I && g.rocks.length > 0) {
      I.count = g.rocks.length;
      for (let G = 0; G < g.rocks.length; G++) {
        const V = g.rocks[G];
        M.position.set(V.position[0], V.position[1], V.position[2]), M.rotation.set(V.rotation[0], V.rotation[1], V.rotation[2]), M.scale.set(V.scale[0], V.scale[1], V.scale[2]), M.updateMatrix(), I.setMatrixAt(G, M.matrix);
      }
      I.instanceMatrix.needsUpdate = !0;
    }
  }, [g.rocks, M]), Fe(() => {
    const I = i.current;
    if (!I) return;
    const G = ie.GRID_CELL_SIZE;
    I.count = f.length;
    for (let V = 0; V < f.length; V++) {
      const J = f[V];
      if (!J) continue;
      const X = J.size || 1, K = G * X;
      M.position.set(J.position.x, J.position.y + 1e-3, J.position.z), M.rotation.set(0, J.rotation ?? 0, 0), M.scale.set(K, 1, K), M.updateMatrix(), I.setMatrixAt(V, M.matrix);
    }
    I.instanceMatrix.needsUpdate = !0, f.length > 0 && (I.computeBoundingBox(), I.computeBoundingSphere());
  }, [f, a, M, u]), L(() => {
    if (n.tiles.length === 0) return;
    const I = Ee.getInstance(), G = new v.Box3(), V = new v.Vector3();
    n.tiles.forEach((K) => {
      const ee = (K.size || 1) * ie.GRID_CELL_SIZE / 2;
      V.set(K.position.x - ee, K.position.y, K.position.z - ee), G.expandByPoint(V), V.set(K.position.x + ee, K.position.y, K.position.z + ee), G.expandByPoint(V);
    });
    const J = new v.Vector3(), X = new v.Vector3();
    return G.getCenter(J), G.getSize(X), I.addMarker(
      `tile-group-${n.id}`,
      "ground",
      n.name || "Tiles",
      J,
      X
    ), () => {
      I.removeMarker(`tile-group-${n.id}`);
    };
  }, [n]), L(() => () => {
    o.current.dispose(), s.current?.dispose(), s.current = null, T.dispose(), k.dispose(), R.dispose();
  }, [T, k, R]), L(() => () => {
    g.sideGeometry.dispose();
  }, [g.sideGeometry]), L(() => () => {
    m.dispose(), w.dispose(), S.dispose(), C.dispose();
  }, [S, w, C, m]), /* @__PURE__ */ l(Ra, { type: "ground", children: /* @__PURE__ */ b(Se, { children: [
    H.length > 0 && /* @__PURE__ */ l(Mt, { type: "fixed", colliders: !1, children: H.map((I) => /* @__PURE__ */ l(
      Gr,
      {
        position: I.position,
        rotation: I.rotation,
        args: I.args
      },
      `${n.id}-collider-${I.key}`
    )) }),
    t && n.tiles.map((I) => {
      const G = (I.size || 1) * ie.GRID_CELL_SIZE, V = Math.max(0.22, I.position.y + 0.22);
      return /* @__PURE__ */ l(
        "group",
        {
          position: [I.position.x, V / 2, I.position.z],
          scale: [G * 0.82, V, G * 0.82],
          onClick: () => r?.(I.id),
          children: /* @__PURE__ */ l("mesh", { geometry: k, material: R })
        },
        I.id
      );
    }),
    /* @__PURE__ */ l(
      "instancedMesh",
      {
        ref: i,
        args: [T, x, u],
        castShadow: !0,
        receiveShadow: !0,
        frustumCulled: !0
      }
    ),
    h.map((I) => {
      const G = (I.size || 1) * ie.GRID_CELL_SIZE, V = I.position.y > 0.02, J = V ? I.position.y : 0.04, X = V ? J / 2 : -0.02;
      return /* @__PURE__ */ l(
        "mesh",
        {
          position: [I.position.x, X, I.position.z],
          material: x,
          castShadow: !0,
          receiveShadow: !0,
          children: /* @__PURE__ */ l("cylinderGeometry", { args: [G / 2, G / 2, J, 28, 1, !1] })
        },
        `${I.id}-round`
      );
    }),
    d.map((I) => /* @__PURE__ */ l(
      nf,
      {
        tile: I,
        material: x,
        supportTiles: n.tiles
      },
      `${I.id}-stairs`
    )),
    p.map((I) => {
      const { tileSize: G, totalHeight: V, rotation: J } = jo(I);
      return /* @__PURE__ */ l(
        "mesh",
        {
          position: [I.position.x, 0, I.position.z],
          rotation: [0, J, 0],
          scale: [G, V, G],
          geometry: S,
          material: x,
          castShadow: !0,
          receiveShadow: !0
        },
        `${I.id}-ramp`
      );
    }),
    g.sideGeometry.getAttribute("position") && /* @__PURE__ */ l(
      "mesh",
      {
        geometry: g.sideGeometry,
        material: m,
        castShadow: !0,
        receiveShadow: !0,
        frustumCulled: !1
      }
    ),
    g.rocks.length > 0 && /* @__PURE__ */ l(
      "instancedMesh",
      {
        ref: _,
        args: [w, C, Math.max(1, g.rocks.length)],
        castShadow: !0,
        receiveShadow: !0
      }
    ),
    U.map((I) => /* @__PURE__ */ l(Xd, { tile: I, tiles: W }, `${I.id}-object`)),
    N.length > 0 && /* @__PURE__ */ l(wd, { entries: N }),
    B.length > 0 && /* @__PURE__ */ l(Md, { entries: B })
  ] }) });
}
function of({
  wallGroup: n,
  meshes: e,
  isEditMode: t = !1,
  onWallClick: r
}) {
  const o = E(new lt()), i = E(null), s = ie.WALL_SIZES.WIDTH, a = ie.WALL_SIZES.HEIGHT, u = ie.WALL_SIZES.THICKNESS, c = n.walls.length, [f, d] = Z(() => Math.max(1, c)), p = F(() => new v.Object3D(), []);
  L(() => {
    c <= f || d(Math.max(c, Math.ceil(f * 1.5)));
  }, [c, f]);
  const h = F(() => {
    const g = new v.BoxGeometry(s, a, u);
    return g.translate(0, 0, s / 2), g;
  }, [s, a, u]), x = F(() => {
    const g = o.current, m = { id: "default", color: "#000000" }, w = n.frontMeshId ? e.get(n.frontMeshId) : m, S = n.backMeshId ? e.get(n.backMeshId) : m, C = n.sideMeshId ? e.get(n.sideMeshId) : m;
    return [
      g.getMaterial(C || m),
      g.getMaterial(C || m),
      g.getMaterial(C || m),
      g.getMaterial(C || m),
      g.getMaterial(w || m),
      g.getMaterial(S || m)
    ];
  }, [n, e]);
  Fe(() => {
    const g = i.current;
    if (g) {
      g.count = c;
      for (let m = 0; m < c; m++) {
        const w = n.walls[m];
        w && (p.position.set(w.position.x, w.position.y + a / 2, w.position.z), p.rotation.set(0, w.rotation.y, 0), p.updateMatrix(), g.setMatrixAt(m, p.matrix));
      }
      g.instanceMatrix.needsUpdate = !0, c > 0 && (g.computeBoundingBox(), g.computeBoundingSphere());
    }
  }, [n.walls, c, p, a, f]), L(() => () => {
    o.current.dispose(), h.dispose();
  }, [h]);
  const y = F(() => {
    if (t) return [];
    const g = s / 2;
    return n.walls.map((m) => {
      const w = Math.sin(m.rotation.y), S = Math.cos(m.rotation.y);
      return {
        id: m.id,
        position: [
          m.position.x + w * g,
          m.position.y + a / 2,
          m.position.z + S * g
        ],
        rotation: [0, m.rotation.y, 0]
      };
    });
  }, [n.walls, s, a, t]);
  return /* @__PURE__ */ b(Se, { children: [
    !t && y.length > 0 && /* @__PURE__ */ l(Mt, { type: "fixed", colliders: !1, children: y.map((g) => /* @__PURE__ */ l(
      Gr,
      {
        position: g.position,
        rotation: g.rotation,
        args: [s / 2, a / 2, u / 2]
      },
      g.id
    )) }),
    t && n.walls.map((g) => /* @__PURE__ */ l(
      "group",
      {
        position: [g.position.x, g.position.y + a + 0.5, g.position.z],
        onClick: () => r?.(g.id),
        children: /* @__PURE__ */ b("mesh", { children: [
          /* @__PURE__ */ l("boxGeometry", { args: [0.5, 0.5, 0.5] }),
          /* @__PURE__ */ l("meshStandardMaterial", { color: "#ff0000" })
        ] })
      },
      g.id
    )),
    /* @__PURE__ */ l(
      "instancedMesh",
      {
        ref: i,
        args: [h, x, f],
        castShadow: !0,
        receiveShadow: !0
      }
    )
  ] });
}
const sf = {
  sakura: [],
  flag: [],
  fire: [],
  billboard: []
};
function Pe(n, e) {
  return e <= 0 ? [] : n.length <= e ? n : n.slice(0, e);
}
function af(n) {
  const e = n.tiles.find((t) => t.objectType && t.objectType !== "none")?.objectType ?? "none";
  return e === "water" ? Vt : e === "sand" ? qt : e === "snowfield" ? Yt : $t;
}
function lf(n) {
  if (!n || n.length === 0) return sf;
  const e = { sakura: [], flag: [], fire: [], billboard: [] };
  for (const t of n)
    t.type === "sakura" ? e.sakura.push({
      position: [t.position.x, t.position.y, t.position.z],
      size: t.config?.size ?? ie.GRID_CELL_SIZE,
      ...t.config?.primaryColor ? { blossomColor: t.config.primaryColor } : {},
      ...t.config?.secondaryColor ? { barkColor: t.config.secondaryColor } : {}
    }) : t.type === "flag" ? e.flag.push(t) : t.type === "fire" ? e.fire.push({
      position: [t.position.x, t.position.y, t.position.z],
      rotation: t.rotation ?? 0,
      intensity: t.config?.fireIntensity ?? 1.5,
      width: t.config?.fireWidth ?? 1,
      height: t.config?.fireHeight ?? 1.5,
      color: t.config?.fireColor ?? "#ffffff"
    }) : t.type === "billboard" && e.billboard.push(t);
  return e;
}
const cf = Ce.memo(function({
  onWallClick: e,
  onTileClick: t,
  onBlockClick: r,
  onWallDelete: o,
  onTileDelete: i,
  onBlockDelete: s
}) {
  const a = O((j) => j.meshes), u = O((j) => j.wallGroups), c = O((j) => j.tileGroups), f = O((j) => j.blocks), d = O((j) => j.editMode), p = O((j) => j.showGrid), h = O((j) => j.gridSize), x = O((j) => j.showSnow), y = O((j) => j.objects), g = ke((j) => j.drawMirror), m = De((j) => j.active), w = De((j) => j.version), S = ft((j) => j.initialized), C = ft((j) => j.visibleWallGroupIds), T = ft((j) => j.visibleTileGroupIds), M = ft((j) => j.visibleBlockIds), _ = ft((j) => j.visibleObjectIds), k = m && g.version > 0 && g.version === w, R = k ? We(g, jr) : Number.MAX_SAFE_INTEGER, z = k ? We(g, $t) : Number.MAX_SAFE_INTEGER, N = k ? We(g, Vt) : Number.MAX_SAFE_INTEGER, P = k ? We(g, qt) : Number.MAX_SAFE_INTEGER, B = k ? We(g, Yt) : Number.MAX_SAFE_INTEGER, U = k ? We(g, $r) : Number.MAX_SAFE_INTEGER, W = k ? We(g, Vr) : Number.MAX_SAFE_INTEGER, H = k ? We(g, qr) : Number.MAX_SAFE_INTEGER, I = k ? We(g, Yr) : Number.MAX_SAFE_INTEGER, G = k ? We(g, Zr) : Number.MAX_SAFE_INTEGER, V = F(() => {
    const j = Array.from(u.values()), ue = S ? j.filter((re) => C.has(re.id)) : j;
    return Pe(ue, R);
  }, [u, S, C, R]), J = F(() => {
    const j = Array.from(c.values()), ue = S ? j.filter(($) => T.has($.id)) : j, re = [], ge = [], ne = [], Y = [];
    for (const $ of ue) {
      const ae = af($);
      ae === Vt ? ge.push($) : ae === qt ? ne.push($) : ae === Yt ? Y.push($) : re.push($);
    }
    return [
      ...Pe(re, z),
      ...Pe(ge, N),
      ...Pe(ne, P),
      ...Pe(Y, B)
    ];
  }, [c, S, T, z, N, P, B]), X = F(() => {
    const j = S ? y.filter((Y) => _.has(Y.id)) : y, ue = [], re = [], ge = [], ne = [];
    for (const Y of j)
      Y.type === "sakura" ? ue.push(Y) : Y.type === "flag" ? re.push(Y) : Y.type === "fire" ? ge.push(Y) : Y.type === "billboard" && ne.push(Y);
    return [
      ...Pe(ue, U),
      ...Pe(re, W),
      ...Pe(ge, H),
      ...Pe(ne, I)
    ];
  }, [
    y,
    S,
    _,
    U,
    W,
    H,
    I
  ]), K = F(() => {
    const j = f ?? [], ue = S ? j.filter((re) => M.has(re.id)) : j;
    return Pe(ue, G);
  }, [f, S, M, G]), Q = F(() => lf(X), [X]), ee = Pe(Q.sakura, U), se = Pe(Q.flag, W), oe = Pe(Q.fire, H), he = Pe(Q.billboard, I);
  return /* @__PURE__ */ l(tt, { fallback: null, children: /* @__PURE__ */ b("group", { name: "building-system", children: [
    p && /* @__PURE__ */ l(Cu, { size: h }),
    /* @__PURE__ */ l(bd, {}),
    /* @__PURE__ */ l(vd, {}),
    /* @__PURE__ */ l(Wc, {}),
    V.map((j) => /* @__PURE__ */ l(
      of,
      {
        wallGroup: j,
        meshes: a,
        isEditMode: d === "wall",
        ...e ? { onWallClick: e } : {},
        ...o ? { onWallDelete: o } : {}
      },
      j.id
    )),
    J.map((j) => /* @__PURE__ */ l(
      rf,
      {
        tileGroup: j,
        meshes: a,
        isEditMode: d === "tile",
        ...t ? { onTileClick: t } : {},
        ...i ? { onTileDelete: i } : {}
      },
      j.id
    )),
    K.length > 0 && /* @__PURE__ */ l(
      Tu,
      {
        blocks: K,
        meshes: a,
        isEditMode: d === "block",
        ...r || s ? { onBlockClick: r ?? s } : {}
      }
    ),
    ee.length > 0 && /* @__PURE__ */ l(tt, { fallback: null, children: /* @__PURE__ */ l(ld, { trees: ee }) }),
    se.length > 0 && /* @__PURE__ */ l(tt, { fallback: null, children: /* @__PURE__ */ l(od, { flags: se }) }),
    oe.length > 0 && /* @__PURE__ */ l(tt, { fallback: null, children: /* @__PURE__ */ l(Vu, { fires: oe }) }),
    he.map((j) => /* @__PURE__ */ l(
      "group",
      {
        position: [j.position.x, j.position.y, j.position.z],
        rotation: [0, j.rotation ?? 0, 0],
        children: /* @__PURE__ */ l(tt, { fallback: null, children: /* @__PURE__ */ l(
          Bu,
          {
            ...j.config?.billboardText ? { text: j.config.billboardText } : {},
            ...j.config?.billboardImageUrl ? { imageUrl: j.config.billboardImageUrl } : {},
            ...j.config?.billboardColor ? { color: j.config.billboardColor } : {}
          }
        ) })
      },
      j.id
    )),
    x && /* @__PURE__ */ l(Ui, {})
  ] }) });
});
function uf({ part: n }) {
  return /* @__PURE__ */ b(
    "mesh",
    {
      position: n.position || [0, 0, 0],
      rotation: n.rotation || [0, 0, 0],
      scale: n.scale || [1, 1, 1],
      children: [
        /* @__PURE__ */ l("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: n.color || "#cccccc",
            transparent: !0,
            opacity: 0.6
          }
        )
      ]
    }
  );
}
function df({ part: n }) {
  const e = Jo(n.url), t = F(() => {
    const r = Qo.clone(e.scene);
    return r && Te() && ss(r), r;
  }, [e]);
  return t ? /* @__PURE__ */ l(
    "primitive",
    {
      object: t,
      position: n.position || [0, 0, 0],
      rotation: n.rotation || [0, 0, 0],
      scale: n.scale || [1, 1, 1]
    }
  ) : null;
}
function ff({ part: n, instanceId: e }) {
  return !!n.url && n.url.trim() !== "" ? /* @__PURE__ */ l(df, { part: n, instanceId: e }) : /* @__PURE__ */ l(uf, { part: n, instanceId: e });
}
const pf = 0.3, mf = Ce.memo(function({ instance: e, isEditMode: t, onClick: r }) {
  const o = E(null), i = E(null), s = E(0), a = me(
    q(
      (m) => m.templates.get(e.templateId),
      [e.templateId]
    )
  ), u = me(
    q(
      (m) => e.currentClothingSetId ? m.clothingSets.get(e.currentClothingSetId) : void 0,
      [e.currentClothingSetId]
    )
  ), c = me((m) => m.advanceNavigation), f = me(
    (m) => m.updateNavigationPosition
  ), d = e.navigation?.state === "moving";
  L(() => {
    s.current = e.navigation?.currentIndex ?? 0;
  }, [e.navigation?.waypoints]), de((m, w) => {
    if (!d || !e.navigation) return;
    const S = i.current;
    if (!S) return;
    const { waypoints: C, speed: T } = e.navigation, M = s.current;
    if (M >= C.length) return;
    const _ = C[M];
    if (!_) return;
    const k = S.translation(), R = _[0] - k.x, z = _[2] - k.z, N = Math.sqrt(R * R + z * z);
    if (N < pf) {
      s.current = M + 1, M + 1 >= C.length && f(e.id, [_[0], _[1], _[2]]), c(e.id);
      return;
    }
    const P = Math.min(T * w, N), B = k.x + R / N * P, U = k.z + z / N * P;
    if (S.setNextKinematicTranslation({ x: B, y: k.y, z: U }), o.current && N > 0.01) {
      const W = Math.atan2(R, z);
      o.current.rotation.y = W;
    }
  });
  const p = q((m) => {
    m.stopPropagation(), document.body.style.cursor = "pointer";
    const w = o.current?.__handlers;
    w?.pointerover && w.pointerover();
  }, []), h = q(() => {
    document.body.style.cursor = "default";
  }, []);
  L(() => {
    if (!e.events || e.events.length === 0) return;
    const m = o.current;
    if (!m) return;
    const w = () => {
      e.events?.find((C) => C.type === "onHover");
    }, S = () => {
      const C = e.events?.find((T) => T.type === "onClick");
      C && C.action;
    };
    return m.__handlers = {
      pointerover: w,
      click: S
    }, () => {
      delete m.__handlers;
    };
  }, [e.events]);
  const x = F(() => {
    if (!a) return [];
    const m = [...a.baseParts];
    if (u && m.push(...u.parts), a.accessoryParts && m.push(...a.accessoryParts), e.customParts)
      for (const w of e.customParts) {
        const S = m.findIndex((C) => C.type === w.type);
        S >= 0 ? m[S] = { ...m[S], ...w } : m.push(w);
      }
    return m;
  }, [a, u, e.customParts]);
  if (!a)
    return null;
  const y = a.fullModelUrl || e.metadata?.modelUrl;
  return y ? /* @__PURE__ */ l(
    is,
    {
      ref: i,
      url: y,
      isActive: !1,
      componentType: "character",
      name: `npc-${e.id}`,
      position: e.position,
      rotation: e.rotation,
      currentAnimation: e.currentAnimation || "idle",
      userData: {
        instanceId: e.id,
        templateId: e.templateId,
        nameTag: e.metadata?.nameTag
      },
      onCollisionEnter: () => {
        r && r();
      },
      children: t && /* @__PURE__ */ b("mesh", { position: [0, 2.5, 0], children: [
        /* @__PURE__ */ l("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ l("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
      ] })
    }
  ) : /* @__PURE__ */ l(
    Mt,
    {
      ref: i,
      type: d ? "kinematicPosition" : "fixed",
      position: e.position,
      rotation: e.rotation,
      colliders: "cuboid",
      children: /* @__PURE__ */ b(
        "group",
        {
          ref: o,
          scale: e.scale,
          ...r ? {
            onClick: (m) => {
              m.stopPropagation(), r();
            }
          } : {},
          onPointerEnter: p,
          onPointerLeave: h,
          children: [
            x.map((m) => /* @__PURE__ */ l(ff, { part: m, instanceId: e.id }, m.id)),
            t && /* @__PURE__ */ b("mesh", { position: [0, 2.5, 0], children: [
              /* @__PURE__ */ l("boxGeometry", { args: [0.5, 0.5, 0.5] }),
              /* @__PURE__ */ l("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
            ] })
          ]
        }
      )
    }
  );
}), hf = 30, gf = 120, yf = 4;
function bf() {
  const { gl: n } = Je(), e = me((d) => d.instances), t = me((d) => d.selectedTemplateId), r = me(
    (d) => d.createInstanceFromTemplate
  ), o = me((d) => d.setSelectedInstance), i = O((d) => d.editMode), s = O((d) => d.hoverPosition), a = i === "npc", [u, c] = Z(() => /* @__PURE__ */ new Set()), f = E(0);
  return de((d, p) => {
    if (f.current += p, f.current < 0.5) return;
    f.current = 0;
    const h = d.camera.position, x = /* @__PURE__ */ new Set();
    e.forEach((y) => {
      const [g, m, w] = y.position, S = g - h.x, C = m - h.y, T = w - h.z, M = Math.sqrt(S * S + C * C + T * T);
      Ct(M, hf, gf, yf) > 0.01 && x.add(y.id);
    }), (x.size !== u.size || [...x].some((y) => !u.has(y))) && c(x);
  }), L(() => {
    if (!a || !t || !s) return;
    const d = () => {
      s && r(t, [
        s.x,
        s.y,
        s.z
      ]);
    };
    return n.domElement.addEventListener("click", d), () => n.domElement.removeEventListener("click", d);
  }, [a, t, s, n, r]), /* @__PURE__ */ l("group", { name: "npc-system", children: Array.from(e.values()).map((d) => !a && !u.has(d.id) ? null : /* @__PURE__ */ l(
    mf,
    {
      instance: d,
      isEditMode: a,
      onClick: () => {
        a && o(d.id);
      }
    },
    d.id
  )) });
}
const $o = new v.Vector2(), vf = new v.Plane(new v.Vector3(0, 1, 0), 0), xr = new v.Vector3();
let dn = 0;
function xf() {
  const { camera: n, raycaster: e } = Je(), t = E({ x: 0, y: 0 }), r = O((M) => M.snapPosition), o = O((M) => M.addWall), i = O((M) => M.addTile), s = O((M) => M.addBlock), a = O((M) => M.addObject), u = O((M) => M.removeWall), c = O((M) => M.removeTile), f = O((M) => M.removeBlock), d = O((M) => M.setHoverPosition), p = q(() => ($o.set(t.current.x, t.current.y), e.setFromCamera($o, n), e.ray.intersectPlane(vf, xr) ? r({ x: xr.x, y: 0, z: xr.z }) : null), [n, e, r]), h = q(() => {
    const M = p();
    if (!M) return null;
    const _ = O.getState().getSupportHeightAt(M);
    return { ...M, y: _ };
  }, [p]), x = q((M) => {
    const _ = M.target;
    t.current.x = M.clientX / _.clientWidth * 2 - 1, t.current.y = -(M.clientY / _.clientHeight) * 2 + 1;
    const k = O.getState().editMode;
    d(k === "tile" || k === "block" ? h() : k === "wall" || k === "npc" || k === "object" ? p() : null);
  }, [p, h, d]), y = q(() => {
    const {
      editMode: M,
      selectedWallGroupId: _,
      currentWallRotation: k,
      checkWallPosition: R,
      hoverPosition: z
    } = O.getState();
    if (M !== "wall" || !_ || !z || R(z, k)) return;
    const N = { x: 0, y: k, z: 0 };
    o(_, {
      id: `wall-${++dn}-${Date.now()}`,
      position: z,
      rotation: N,
      wallGroupId: _
    });
  }, [o]), g = q(() => {
    const {
      editMode: M,
      selectedTileGroupId: _,
      checkTilePosition: k,
      getSupportHeightAt: R,
      currentTileMultiplier: z,
      currentTileHeight: N,
      currentTileShape: P,
      currentTileRotation: B,
      hoverPosition: U
    } = O.getState();
    if (M !== "tile" || !_ || !U) return;
    const W = ie.HEIGHT_STEP, H = R(U), I = P === "box" || P === "round" ? H + N * W : Math.max(1, N) * W, G = { ...U, y: I };
    k(G) || i(_, {
      id: `tile-${++dn}-${Date.now()}`,
      position: G,
      tileGroupId: _,
      size: z,
      rotation: B,
      shape: P
    });
  }, [i]), m = q(() => {
    const {
      editMode: M,
      checkBlockPosition: _,
      getSupportHeightAt: k,
      currentTileMultiplier: R,
      currentTileHeight: z,
      hoverPosition: N
    } = O.getState();
    if (M !== "block" || !N) return;
    const P = ie.HEIGHT_STEP, B = k(N), U = Math.max(1, Math.round(R)), W = {
      ...N,
      y: B + z * P
    }, H = {
      id: `block-${++dn}-${Date.now()}`,
      position: W,
      size: { x: U, y: 1, z: U },
      materialId: "default-block"
    };
    _(H) || s(H);
  }, [s]), w = q(() => {
    const {
      editMode: M,
      selectedPlacedObjectType: _,
      hoverPosition: k,
      tileGroups: R,
      currentObjectRotation: z,
      currentObjectPrimaryColor: N,
      currentObjectSecondaryColor: P,
      currentFlagWidth: B,
      currentFlagHeight: U,
      currentFlagStyle: W,
      currentFlagImageUrl: H,
      currentFireIntensity: I,
      currentFireWidth: G,
      currentFireHeight: V,
      currentFireColor: J,
      currentBillboardText: X,
      currentBillboardColor: K,
      currentBillboardImageUrl: Q
    } = O.getState();
    if (M !== "object" || _ === "none" || !k) return;
    let ee = 0;
    const se = ie.GRID_CELL_SIZE;
    for (const he of R.values())
      for (const j of he.tiles) {
        const ue = (j.size || 1) * se / 2;
        Math.abs(j.position.x - k.x) < ue && Math.abs(j.position.z - k.z) < ue && (ee = Math.max(ee, j.position.y));
      }
    const oe = _ === "sakura" ? {
      size: O.getState().currentTileMultiplier * se,
      primaryColor: N,
      secondaryColor: P
    } : _ === "flag" ? {
      flagWidth: B,
      flagHeight: U,
      flagStyle: W,
      ...H ? { flagTexture: H } : {}
    } : _ === "fire" ? { fireIntensity: I, fireWidth: G, fireHeight: V, fireColor: J } : _ === "billboard" ? {
      billboardText: X,
      billboardColor: K,
      ...Q ? { billboardImageUrl: Q } : {}
    } : void 0;
    a({
      id: `obj-${++dn}-${Date.now()}`,
      type: _,
      position: { ...k, y: ee },
      ...z !== 0 ? { rotation: z } : {},
      ...oe ? { config: oe } : {}
    });
  }, [a]), S = q((M) => {
    const { editMode: _, selectedWallGroupId: k } = O.getState();
    _ === "wall" && k && u(k, M);
  }, [u]), C = q((M) => {
    const { editMode: _, selectedTileGroupId: k } = O.getState();
    _ === "tile" && k && c(k, M);
  }, [c]), T = q((M) => {
    const { editMode: _ } = O.getState();
    _ === "block" && f(M);
  }, [f]);
  return {
    updateMousePosition: x,
    placeWall: y,
    placeTile: g,
    placeBlock: m,
    placeObject: w,
    handleWallClick: S,
    handleTileClick: C,
    handleBlockClick: T,
    getGroundPosition: p
  };
}
const wf = 1, Sf = 4, wr = 8, Mf = 128, Cf = 64, kf = 1, If = 180, Yi = 64;
function Sr() {
  return {
    pipeline: null,
    bindGroupLayout: null,
    uniformBuffer: null,
    visibleBuffer: null,
    readBuffer: null,
    bindGroup: null,
    count: 0,
    spatialBuffer: null,
    metaBuffer: null
  };
}
function Mr(n) {
  n?.destroy && n.destroy();
}
function Vo(n) {
  Mr(n.uniformBuffer), Mr(n.visibleBuffer), Mr(n.readBuffer);
}
function Af(n, e, t, r) {
  const o = n, i = o.createShaderModule({
    code: `
struct Params {
  viewProj : mat4x4<f32>,
  camera : vec4<f32>,
  misc : vec4<f32>,
}

@group(0) @binding(0) var<storage, read> spatial : array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> meta : array<vec4<i32>>;
@group(0) @binding(2) var<storage, read_write> visible : array<u32>;
@group(0) @binding(3) var<uniform> params : Params;

@compute @workgroup_size(${Yi})
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let i = gid.x;
  if (f32(i) >= params.misc.x) {
    return;
  }

  let s = spatial[i];
  let world = vec4<f32>(s.x, s.y, s.z, 1.0);
  let clip = params.viewProj * world;
  let w = clip.w;
  if (w <= 0.0) {
    visible[i] = 0u;
    return;
  }

  let inflate = s.w / max(abs(w), 0.0001);
  let ndc = clip.xyz / w;
  let inFrustum =
    ndc.x >= (-1.0 - inflate) &&
    ndc.x <= ( 1.0 + inflate) &&
    ndc.y >= (-1.0 - inflate) &&
    ndc.y <= ( 1.0 + inflate) &&
    ndc.z >= (-inflate) &&
    ndc.z <= ( 1.0 + inflate);

  let dx = s.x - params.camera.x;
  let dy = s.y - params.camera.y;
  let dz = s.z - params.camera.z;
  let limit = params.camera.w + s.w;
  let inRange = dx * dx + dy * dy + dz * dz <= limit * limit;

  visible[i] = select(0u, 1u, inFrustum && inRange);
}
`
  }), s = o.createComputePipeline({
    layout: "auto",
    compute: { module: i, entryPoint: "main" }
  }), a = s.getBindGroupLayout(0), u = n.createBuffer({
    label: "building-cull-uniforms",
    size: 96,
    usage: Cf | wr
  }), c = n.createBuffer({
    label: "building-cull-visible",
    size: Math.max(4, r * 4),
    usage: Mf | Sf | wr
  }), f = n.createBuffer({
    label: "building-cull-readback",
    size: Math.max(4, r * 4),
    usage: wr | wf
  }), d = o.createBindGroup({
    layout: a,
    entries: [
      { binding: 0, resource: { buffer: e } },
      { binding: 1, resource: { buffer: t } },
      { binding: 2, resource: { buffer: c } },
      { binding: 3, resource: { buffer: u } }
    ]
  });
  return {
    pipeline: s,
    bindGroupLayout: a,
    uniformBuffer: u,
    visibleBuffer: c,
    readBuffer: f,
    bindGroup: d,
    count: r,
    spatialBuffer: e,
    metaBuffer: t
  };
}
function Tf() {
  const n = Je((a) => a.gl), e = ke((a) => a.snapshot), t = ke((a) => a.uploadResources), r = De((a) => a.setResult), o = De((a) => a.reset), i = E({
    resources: Sr(),
    busy: !1,
    lastRunAt: 0
  }), s = F(
    () => ({
      viewProj: new v.Matrix4(),
      uniform: new Float32Array(24)
    }),
    []
  );
  return L(() => o, [o]), L(() => {
    const a = i.current.resources;
    (a.count !== e.ids.length || a.spatialBuffer !== t.spatialBuffer || a.metaBuffer !== t.metaBuffer) && (Vo(a), i.current.resources = Sr());
  }, [e.ids.length, t]), de((a) => {
    if (e.version === 0 || e.ids.length === 0 || t.backend !== "webgpu") return;
    const u = Kr(n);
    if (!u || !t.spatialBuffer || !t.metaBuffer || i.current.busy) return;
    const c = performance.now();
    if (c - i.current.lastRunAt < If) return;
    i.current.lastRunAt = c, i.current.resources.pipeline || (i.current.resources = Af(
      u,
      t.spatialBuffer,
      t.metaBuffer,
      e.ids.length
    ));
    const f = i.current.resources, d = s.uniform;
    if (s.viewProj.multiplyMatrices(a.camera.projectionMatrix, a.camera.matrixWorldInverse), d.set(s.viewProj.elements, 0), d[16] = a.camera.position.x, d[17] = a.camera.position.y, d[18] = a.camera.position.z, d[19] = $e, d[20] = e.ids.length, d[21] = 0, d[22] = 0, d[23] = 0, !f.uniformBuffer || !f.visibleBuffer || !f.readBuffer || !f.bindGroup || !f.pipeline)
      return;
    u.queue.writeBuffer(f.uniformBuffer, 0, d);
    const p = u, h = p.createCommandEncoder(), x = h.beginComputePass();
    x.setPipeline(f.pipeline), x.setBindGroup(0, f.bindGroup), x.dispatchWorkgroups(Math.max(1, Math.ceil(e.ids.length / Yi))), x.end(), h.copyBufferToBuffer(f.visibleBuffer, 0, f.readBuffer, 0, Math.max(4, e.ids.length * 4)), p.queue.submit([h.finish()]), i.current.busy = !0, Promise.resolve(f.readBuffer?.mapAsync?.(kf)).then(() => {
      const y = f.readBuffer?.getMappedRange?.();
      if (!y) return;
      const g = new Uint32Array(y.slice(0));
      f.readBuffer?.unmap?.();
      const m = uu(e, g);
      r(m);
    }).catch(() => {
      o();
    }).finally(() => {
      i.current.busy = !1;
    });
  }), L(() => () => {
    Vo(i.current.resources), i.current.resources = Sr(), o();
  }, [o]), null;
}
function _f() {
  const n = ke((r) => r.snapshot), e = ke((r) => r.setGpuMirror), t = E(ke.getState().gpuMirror);
  return L(() => {
    const r = yu(n, t.current);
    t.current = r, e(r);
  }, [n, e]), null;
}
function Pf() {
  const n = Je((o) => o.gl), e = ke((o) => o.gpuMirror), t = ke((o) => o.setUploadResources), r = E(yn());
  return L(() => {
    if (e.version === 0) return;
    const o = Kr(n);
    o && (r.current = Su(o, r.current, e), t(r.current));
  }, [n, e, t]), L(() => () => {
    wu(r.current), r.current = yn(), t(r.current);
  }, [t]), null;
}
function Rf() {
  const n = Je((o) => o.gl), e = ke((o) => o.drawMirror), t = ke((o) => o.setUploadResources), r = E(ke.getState().uploadResources ?? yn());
  return L(() => {
    r.current = ke.getState().uploadResources;
  }), L(() => {
    if (e.version === 0) return;
    const o = Kr(n);
    o && (r.current = Mu(o, r.current, e), t(r.current));
  }, [n, e, t]), null;
}
function Nf() {
  const n = De((o) => o.version), e = De((o) => o.clusterCounts), t = ke((o) => o.setDrawMirror), r = E(ke.getState().drawMirror);
  return L(() => {
    if (n === 0 || e.length === 0) return;
    const o = pu(n, e, r.current);
    r.current = o, t(o);
  }, [n, e, t]), null;
}
function Ef() {
  const n = O((u) => u.wallGroups), e = O((u) => u.tileGroups), t = O((u) => u.blocks), r = O((u) => u.objects), o = ke((u) => u.setSnapshot), i = ke((u) => u.reset), s = E(1), a = F(
    () => su({
      wallGroups: Array.from(n.values()),
      tileGroups: Array.from(e.values()),
      blocks: t ?? [],
      objects: r,
      version: s.current++
    }),
    [n, e, t, r]
  );
  return L(() => {
    o(a);
  }, [a, o]), L(() => i, [i]), null;
}
function fn(n, e, t, r, o, i, s, a, u, c) {
  for (const f of e) {
    const d = t.get(f);
    if (!d) continue;
    const p = d.centerX - s.x, h = d.centerY - s.y, x = d.centerZ - s.z, y = u + d.radius * d.radius;
    p * p + h * h + x * x > y || (a.center.set(d.centerX, d.centerY, d.centerZ), a.radius = d.radius, i.intersectsSphere(a) && (tu(d, r, s, o, c) || n.add(f)));
  }
}
function Bf() {
  const n = ke((h) => h.snapshot), e = De((h) => h.active), t = De((h) => h.version), r = De((h) => h.visibleTileGroupIds), o = De((h) => h.visibleWallGroupIds), i = De((h) => h.visibleBlockIds), s = De((h) => h.visibleObjectIds), a = ft((h) => h.setVisible), u = ft((h) => h.reset), c = F(
    () => lu(n),
    [n]
  ), f = E(0), d = E(/* @__PURE__ */ new Map()), p = F(
    () => ({
      frustum: new v.Frustum(),
      matrix: new v.Matrix4(),
      camera: new v.Vector3(),
      forward: new v.Vector3(),
      sphere: new v.Sphere(),
      targetDir: new v.Vector3(),
      occDir: new v.Vector3(),
      cross: new v.Vector3()
    }),
    []
  );
  return L(() => {
    d.current.clear();
  }, [c]), L(() => {
    d.current.clear();
  }, [e, t]), L(() => u, [u]), de((h, x) => {
    if (n.ids.length === 0 || (f.current += Math.max(0, x), f.current < Hc)) return;
    f.current = 0, p.matrix.multiplyMatrices(h.camera.projectionMatrix, h.camera.matrixWorldInverse), p.frustum.setFromProjectionMatrix(p.matrix), p.camera.copy(h.camera.position), h.camera.getWorldDirection(p.forward);
    const y = Yc(
      p.camera.x,
      p.camera.z,
      p.forward.x,
      p.forward.z
    ), g = d.current.get(y);
    if (g) {
      a(g);
      return;
    }
    const m = e && t === n.version, w = m ? new Set(r) : Gt(
      c.tileBuckets,
      p.camera.x,
      p.camera.z,
      $e
    ), S = m ? new Set(o) : Gt(
      c.wallBuckets,
      p.camera.x,
      p.camera.z,
      $e
    ), C = m ? new Set(s) : Gt(
      c.objectBuckets,
      p.camera.x,
      p.camera.z,
      $e
    ), T = m ? new Set(i) : Gt(
      c.blockBuckets,
      p.camera.x,
      p.camera.z,
      $e
    ), M = eu(
      c,
      p.camera.x,
      p.camera.z,
      $e
    ), _ = /* @__PURE__ */ new Set(), k = /* @__PURE__ */ new Set(), R = /* @__PURE__ */ new Set(), z = /* @__PURE__ */ new Set(), N = $e * $e;
    fn(
      _,
      w,
      c.tileById,
      "tile",
      M,
      p.frustum,
      p.camera,
      p.sphere,
      N,
      p
    ), fn(
      k,
      S,
      c.wallById,
      "wall",
      M,
      p.frustum,
      p.camera,
      p.sphere,
      N,
      p
    ), fn(
      z,
      C,
      c.objectById,
      "object",
      M,
      p.frustum,
      p.camera,
      p.sphere,
      N,
      p
    ), fn(
      R,
      T,
      c.blockById,
      "block",
      M,
      p.frustum,
      p.camera,
      p.sphere,
      N,
      p
    );
    const P = { tileIds: _, wallIds: k, blockIds: R, objectIds: z };
    if (d.current.set(y, P), d.current.size > 96) {
      const B = d.current.keys().next().value;
      B && d.current.delete(B);
    }
    a(P);
  }), null;
}
const zf = 9, Df = 150;
function Fm() {
  const { gl: n } = Je(), {
    updateMousePosition: e,
    placeWall: t,
    placeTile: r,
    placeBlock: o,
    placeObject: i,
    handleWallClick: s,
    handleTileClick: a,
    handleBlockClick: u
  } = xf(), c = O((T) => T.editMode), f = c !== "none", d = O((T) => T.setHoverPosition), p = O((T) => T.setWallRotation), h = O((T) => T.setTileRotation), x = O((T) => T.setObjectRotation), y = O((T) => T.setTileHeight), g = O((T) => T.initialized), m = O((T) => T.initializeDefaults), w = E({ x: 0, y: 0 }), S = E(0), C = q((T) => {
    T && (T.mouseButtons = {
      LEFT: -1,
      MIDDLE: v.MOUSE.DOLLY,
      RIGHT: v.MOUSE.ROTATE
    });
  }, []);
  return L(() => {
    g || m();
  }, [g, m]), L(() => {
    if (c !== "wall" && c !== "tile" && c !== "block" && c !== "object") return;
    const T = (M) => {
      const _ = (k) => {
        c === "wall" ? p(k) : c === "tile" ? h(k) : c === "object" && x(k);
      };
      switch (M.key) {
        case "ArrowUp":
          _(0);
          break;
        case "ArrowRight":
          _(Math.PI / 2);
          break;
        case "ArrowDown":
          _(Math.PI);
          break;
        case "ArrowLeft":
          _(Math.PI * 1.5);
          break;
      }
      if (c === "tile" || c === "block") {
        if (M.code === "KeyQ" || M.key === "q" || M.key === "Q") {
          const k = O.getState().currentTileHeight;
          y(k - 1);
        } else if (M.code === "KeyE" || M.key === "e" || M.key === "E") {
          const k = O.getState().currentTileHeight;
          y(k + 1);
        }
      }
    };
    return window.addEventListener("keydown", T), () => window.removeEventListener("keydown", T);
  }, [c, h, p, x, y]), L(() => {
    const T = n.domElement, M = (R) => {
      R.button === 0 && (w.current.x = R.clientX, w.current.y = R.clientY);
    }, _ = (R) => e(R), k = (R) => {
      if (R.button !== 0) return;
      const z = R.clientX - w.current.x, N = R.clientY - w.current.y;
      if (z * z + N * N > zf) return;
      const P = performance.now();
      if (P - S.current < Df) return;
      S.current = P;
      const B = O.getState().editMode;
      B !== "npc" && (B === "wall" ? t() : B === "tile" ? r() : B === "block" ? o() : B === "object" && i());
    };
    return T.addEventListener("mousedown", M), T.addEventListener("mousemove", _), T.addEventListener("mouseup", k), () => {
      T.removeEventListener("mousedown", M), T.removeEventListener("mousemove", _), T.removeEventListener("mouseup", k), d(null);
    };
  }, [n, e, t, r, o, i, d]), /* @__PURE__ */ b(Se, { children: [
    /* @__PURE__ */ l(Ef, {}),
    /* @__PURE__ */ l(_f, {}),
    /* @__PURE__ */ l(Pf, {}),
    /* @__PURE__ */ l(Tf, {}),
    /* @__PURE__ */ l(Nf, {}),
    /* @__PURE__ */ l(Rf, {}),
    /* @__PURE__ */ l(Bf, {}),
    f && /* @__PURE__ */ l(
      Ms,
      {
        ref: C,
        enablePan: !0,
        enableZoom: !0,
        enableRotate: !0,
        maxPolarAngle: Math.PI / 2.5,
        minDistance: 5,
        maxDistance: 100
      }
    ),
    /* @__PURE__ */ l(
      cf,
      {
        onWallClick: s,
        onTileClick: a,
        onBlockClick: u,
        onWallDelete: s,
        onTileDelete: a,
        onBlockDelete: u
      }
    ),
    /* @__PURE__ */ l(bf, {})
  ] });
}
const qo = [
  { type: "none", label: "None" },
  { type: "water", label: "Water" },
  { type: "grass", label: "Grass" },
  { type: "sand", label: "Sand" },
  { type: "snowfield", label: "Snowfield" }
], Yo = [
  { type: "box", label: "Box" },
  { type: "stairs", label: "Stairs" },
  { type: "round", label: "Round" },
  { type: "ramp", label: "Ramp" }
];
function Lm({ onClose: n }) {
  const {
    setEditMode: e,
    editMode: t,
    isInEditMode: r,
    currentTileMultiplier: o,
    setTileMultiplier: i,
    currentTileHeight: s,
    setTileHeight: a,
    currentTileShape: u,
    setTileShape: c,
    currentTileRotation: f,
    setTileRotation: d,
    currentWallRotation: p,
    setWallRotation: h,
    wallCategories: x,
    tileCategories: y,
    selectedWallCategoryId: g,
    selectedTileCategoryId: m,
    selectedWallGroupId: w,
    selectedTileGroupId: S,
    setSelectedWallCategory: C,
    setSelectedTileCategory: T,
    wallGroups: M,
    tileGroups: _,
    meshes: k,
    updateMesh: R,
    addMesh: z,
    addWallGroup: N,
    addTileGroup: P,
    selectedTileObjectType: B,
    setSelectedTileObjectType: U
  } = O(), W = Ps((D) => D.isLoggedIn), H = r(), {
    templates: I,
    selectedTemplateId: G,
    setSelectedTemplate: V,
    initializeDefaults: J,
    selectedInstanceId: X
  } = me(), [K, Q] = Ce.useState(!1), [ee, se] = Ce.useState(""), [oe, he] = Ce.useState("#808080"), [j, ue] = Ce.useState(""), re = F(() => Array.from(y.values()), [y]), ge = F(() => Array.from(x.values()), [x]), ne = F(() => Array.from(I.values()), [I]), Y = F(
    () => qo.find((D) => D.type === B)?.label ?? B,
    [B]
  ), $ = F(
    () => Yo.find((D) => D.type === u)?.label ?? u,
    [u]
  ), ae = q(() => {
    e("none"), n?.();
  }, [e, n]), ye = q(() => Q((D) => !D), []);
  return Ce.useEffect(() => {
    J();
  }, [J]), Ce.useEffect(() => {
    if (t === "wall" && w) {
      const D = M.get(w);
      if (D && D.frontMeshId) {
        const A = k.get(D.frontMeshId);
        A && (he(A.color || "#808080"), ue(A.mapTextureUrl || ""));
      }
    } else if (t === "tile" && S) {
      const D = _.get(S);
      if (D && D.floorMeshId) {
        const A = k.get(D.floorMeshId);
        A && (he(A.color || "#808080"), ue(A.mapTextureUrl || ""));
      }
    }
  }, [t, w, S, M, _, k]), W ? /* @__PURE__ */ b(Se, { children: [
    H && /* @__PURE__ */ l("div", { className: "building-edit-mode-overlay" }),
    /* @__PURE__ */ l("div", { className: "building-ui-container", children: H ? /* @__PURE__ */ b("div", { className: "building-ui-panel", children: [
      /* @__PURE__ */ b("div", { className: "building-ui-header", children: [
        /* @__PURE__ */ l("span", { className: "building-ui-title", children: "Building Mode" }),
        /* @__PURE__ */ l(
          "button",
          {
            onClick: ae,
            className: "building-ui-close",
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ b("div", { className: "building-ui-mode-group", children: [
        /* @__PURE__ */ l(
          "button",
          {
            onClick: () => e("wall"),
            className: `building-ui-mode-button ${t === "wall" ? "active" : ""}`,
            children: "Wall Mode"
          }
        ),
        /* @__PURE__ */ l(
          "button",
          {
            onClick: () => e("tile"),
            className: `building-ui-mode-button ${t === "tile" ? "active" : ""}`,
            children: "Tile Mode"
          }
        ),
        /* @__PURE__ */ l(
          "button",
          {
            onClick: () => e("block"),
            className: `building-ui-mode-button ${t === "block" ? "active" : ""}`,
            children: "Block Mode"
          }
        ),
        /* @__PURE__ */ l(
          "button",
          {
            onClick: () => e("npc"),
            className: `building-ui-mode-button ${t === "npc" ? "active" : ""}`,
            children: "NPC Mode"
          }
        )
      ] }),
      t === "tile" && /* @__PURE__ */ b(Se, { children: [
        /* @__PURE__ */ b("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Category:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: m || "",
              onChange: (D) => T(D.target.value),
              className: "building-ui-select",
              children: re.map((D) => /* @__PURE__ */ l("option", { value: D.id, children: D.name }, D.id))
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Type:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: S || "",
              onChange: (D) => O.setState({ selectedTileGroupId: D.target.value }),
              className: "building-ui-select",
              children: m && y.get(m)?.tileGroupIds.map((D) => {
                const A = _.get(D);
                return A ? /* @__PURE__ */ l("option", { value: A.id, children: A.name }, A.id) : null;
              })
            }
          )
        ] }),
        /* @__PURE__ */ b(
          "button",
          {
            onClick: ye,
            className: "building-ui-custom-toggle",
            children: [
              K ? "Hide" : "Show",
              " Custom Settings"
            ]
          }
        ),
        K && /* @__PURE__ */ b("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ b("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Name:" }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                value: ee,
                onChange: (D) => se(D.target.value),
                placeholder: "Custom Floor Name",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ b("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ b("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ l(
                "input",
                {
                  type: "color",
                  value: oe,
                  onChange: (D) => he(D.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "text",
                  value: oe,
                  onChange: (D) => he(D.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ b("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Texture URL:" }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                value: j,
                onChange: (D) => ue(D.target.value),
                placeholder: "https://...",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ l(
            "button",
            {
              onClick: () => {
                if (S) {
                  const D = _.get(S);
                  D && D.floorMeshId && R(D.floorMeshId, {
                    color: oe,
                    ...j ? { mapTextureUrl: j } : {}
                  });
                }
              },
              className: "building-ui-apply-button",
              children: "Apply Changes"
            }
          ),
          /* @__PURE__ */ l(
            "button",
            {
              onClick: () => {
                if (ee) {
                  const D = `custom-tile-${Date.now()}`, A = `custom-floor-mesh-${Date.now()}`;
                  if (z({
                    id: A,
                    color: oe,
                    material: "STANDARD",
                    ...j ? { mapTextureUrl: j } : {},
                    roughness: 0.6
                  }), P({
                    id: D,
                    name: ee,
                    floorMeshId: A,
                    tiles: []
                  }), m) {
                    const be = y.get(m);
                    be && O.getState().updateTileCategory(m, {
                      tileGroupIds: [...be.tileGroupIds, D]
                    });
                  }
                  O.setState({ selectedTileGroupId: D }), se("");
                }
              },
              className: "building-ui-create-button",
              children: "Create New Type"
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Size:" }),
          /* @__PURE__ */ b("div", { className: "building-ui-size-buttons", children: [
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => i(1),
                className: `building-ui-size-button ${o === 1 ? "active" : ""}`,
                children: "1x1"
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => i(2),
                className: `building-ui-size-button ${o === 2 ? "active" : ""}`,
                children: "2x2"
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => i(3),
                className: `building-ui-size-button ${o === 3 ? "active" : ""}`,
                children: "3x3"
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => i(4),
                className: `building-ui-size-button ${o === 4 ? "active" : ""}`,
                children: "4x4"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Height:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-size-buttons", children: [0, 1, 2, 3, 4].map((D) => /* @__PURE__ */ l(
            "button",
            {
              onClick: () => a(D),
              className: `building-ui-size-button ${s === D ? "active" : ""}`,
              children: D
            },
            D
          )) })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Shape:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-size-buttons", children: Yo.map((D) => /* @__PURE__ */ l(
            "button",
            {
              onClick: () => c(D.type),
              className: `building-ui-size-button ${u === D.type ? "active" : ""}`,
              children: D.label
            },
            D.type
          )) })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Rotation:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-size-buttons", children: [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((D, A) => /* @__PURE__ */ l(
            "button",
            {
              onClick: () => d(D),
              className: `building-ui-size-button ${Math.abs(f - D) < 1e-4 ? "active" : ""}`,
              children: A * 90
            },
            D
          )) })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-object-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Object:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-object-buttons", children: qo.map((D) => /* @__PURE__ */ l(
            "button",
            {
              onClick: () => U(D.type),
              className: `building-ui-object-button ${B === D.type ? "active" : ""}`,
              children: D.label
            },
            D.type
          )) })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ b("p", { children: [
            "Category: ",
            y.get(m || "")?.name
          ] }),
          /* @__PURE__ */ b("p", { children: [
            "Type: ",
            _.get(S || "")?.name
          ] }),
          /* @__PURE__ */ b("p", { children: [
            "Size: ",
            o,
            "x",
            o,
            " (",
            o * 4,
            "m)"
          ] }),
          /* @__PURE__ */ b("p", { children: [
            "Height: ",
            s
          ] }),
          /* @__PURE__ */ b("p", { children: [
            "Shape: ",
            $
          ] }),
          /* @__PURE__ */ b("p", { children: [
            "Object: ",
            Y
          ] }),
          /* @__PURE__ */ l("p", { children: "Click to place tiles" }),
          /* @__PURE__ */ l("p", { children: "Red = Occupied, Green = Available" })
        ] })
      ] }),
      t === "block" && /* @__PURE__ */ b(Se, { children: [
        /* @__PURE__ */ b("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Block Size:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-size-buttons", children: [1, 2, 3, 4].map((D) => /* @__PURE__ */ b(
            "button",
            {
              onClick: () => i(D),
              className: `building-ui-size-button ${o === D ? "active" : ""}`,
              children: [
                D,
                "x",
                D
              ]
            },
            D
          )) })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Layer Offset:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-size-buttons", children: [0, 1, 2, 3, 4].map((D) => /* @__PURE__ */ l(
            "button",
            {
              onClick: () => a(D),
              className: `building-ui-size-button ${s === D ? "active" : ""}`,
              children: D
            },
            D
          )) })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ b("p", { children: [
            "Size: ",
            o,
            "x",
            o
          ] }),
          /* @__PURE__ */ b("p", { children: [
            "Layer offset: ",
            s
          ] }),
          /* @__PURE__ */ l("p", { children: "Click to place voxel blocks" }),
          /* @__PURE__ */ l("p", { children: "Click red blocks to delete" })
        ] })
      ] }),
      t === "wall" && /* @__PURE__ */ b(Se, { children: [
        /* @__PURE__ */ b("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Category:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: g || "",
              onChange: (D) => C(D.target.value),
              className: "building-ui-select",
              children: ge.map((D) => /* @__PURE__ */ l("option", { value: D.id, children: D.name }, D.id))
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Type:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: w || "",
              onChange: (D) => O.setState({ selectedWallGroupId: D.target.value }),
              className: "building-ui-select",
              children: g && x.get(g)?.wallGroupIds.map((D) => {
                const A = M.get(D);
                return A ? /* @__PURE__ */ l("option", { value: A.id, children: A.name }, A.id) : null;
              })
            }
          )
        ] }),
        /* @__PURE__ */ b(
          "button",
          {
            onClick: ye,
            className: "building-ui-custom-toggle",
            children: [
              K ? "Hide" : "Show",
              " Custom Settings"
            ]
          }
        ),
        K && /* @__PURE__ */ b("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ b("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Name:" }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                value: ee,
                onChange: (D) => se(D.target.value),
                placeholder: "Custom Wall Name",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ b("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ b("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ l(
                "input",
                {
                  type: "color",
                  value: oe,
                  onChange: (D) => he(D.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "text",
                  value: oe,
                  onChange: (D) => he(D.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ b("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Texture URL:" }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                value: j,
                onChange: (D) => ue(D.target.value),
                placeholder: "https://...",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ l(
            "button",
            {
              onClick: () => {
                if (w) {
                  const D = M.get(w);
                  if (D && D.frontMeshId) {
                    const A = {
                      color: oe,
                      ...j ? { mapTextureUrl: j } : {}
                    };
                    R(D.frontMeshId, {
                      ...A
                    }), D.backMeshId && R(D.backMeshId, {
                      ...A
                    }), D.sideMeshId && R(D.sideMeshId, {
                      ...A
                    });
                  }
                }
              },
              className: "building-ui-apply-button",
              children: "Apply Changes"
            }
          ),
          /* @__PURE__ */ l(
            "button",
            {
              onClick: () => {
                if (ee) {
                  const D = `custom-wall-${Date.now()}`, A = `custom-mesh-${Date.now()}`;
                  if (z({
                    id: A,
                    color: oe,
                    material: "STANDARD",
                    ...j ? { mapTextureUrl: j } : {},
                    roughness: 0.7
                  }), N({
                    id: D,
                    name: ee,
                    frontMeshId: A,
                    backMeshId: A,
                    sideMeshId: A,
                    walls: []
                  }), g) {
                    const be = x.get(g);
                    be && O.getState().updateWallCategory(g, {
                      wallGroupIds: [...be.wallGroupIds, D]
                    });
                  }
                  O.setState({ selectedWallGroupId: D }), se("");
                }
              },
              className: "building-ui-create-button",
              children: "Create New Type"
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-direction-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Wall Direction:" }),
          /* @__PURE__ */ b("div", { className: "building-ui-direction-buttons", children: [
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => h(0),
                className: `building-ui-direction-button ${p === 0 ? "active" : ""}`,
                title: "North",
                children: "↑"
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => h(Math.PI / 2),
                className: `building-ui-direction-button ${p === Math.PI / 2 ? "active" : ""}`,
                title: "East",
                children: "→"
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => h(Math.PI),
                className: `building-ui-direction-button ${p === Math.PI ? "active" : ""}`,
                title: "South",
                children: "↓"
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => h(Math.PI * 1.5),
                className: `building-ui-direction-button ${p === Math.PI * 1.5 ? "active" : ""}`,
                title: "West",
                children: "←"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ b("p", { children: [
            "Category: ",
            x.get(g || "")?.name
          ] }),
          /* @__PURE__ */ b("p", { children: [
            "Type: ",
            M.get(w || "")?.name
          ] }),
          /* @__PURE__ */ l("p", { children: "Use arrow keys to rotate" }),
          /* @__PURE__ */ l("p", { children: "Click to place walls" }),
          /* @__PURE__ */ l("p", { children: "Red = Occupied, Green = Available" }),
          /* @__PURE__ */ l("p", { children: "Click red boxes to delete" })
        ] })
      ] }),
      t === "npc" && /* @__PURE__ */ b(Se, { children: [
        /* @__PURE__ */ b("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "캐릭터:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: G || "",
              onChange: (D) => V(D.target.value),
              className: "building-ui-select",
              children: ne.map((D) => /* @__PURE__ */ l("option", { value: D.id, children: D.name }, D.id))
            }
          )
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "옷:" }),
          /* @__PURE__ */ b("div", { className: "building-ui-clothing-buttons", children: [
            ["rabbit-outfit", "basic-suit", "formal-suit"].map((D) => {
              const A = me.getState().clothingSets.get(D);
              return A ? /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => me.getState().setSelectedClothingSet(A.id),
                  className: `building-ui-clothing-button ${me.getState().selectedClothingSetId === A.id ? "active" : ""}`,
                  children: A.name
                },
                A.id
              ) : null;
            }),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => me.getState().setSelectedClothingSet(""),
                className: `building-ui-clothing-button ${me.getState().selectedClothingSetId ? "" : "active"}`,
                children: "없음"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "모자:" }),
          /* @__PURE__ */ b("div", { className: "building-ui-clothing-buttons", children: [
            ["hat-set-a", "hat-set-b", "hat-set-c"].map((D) => {
              const A = me.getState().clothingSets.get(D);
              return A ? /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => {
                    me.getState().setPreviewAccessory("hat", A.id);
                    const be = me.getState().selectedInstanceId, Ne = A.parts[0];
                    be && Ne && me.getState().updateInstancePart(be, Ne.id, Ne);
                  },
                  className: `building-ui-clothing-button ${me.getState().previewAccessories.hat === A.id ? "active" : ""}`,
                  children: A.name
                },
                A.id
              ) : null;
            }),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => me.getState().setPreviewAccessory("hat", ""),
                className: `building-ui-clothing-button ${me.getState().previewAccessories.hat ? "" : "active"}`,
                children: "없음"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "안경:" }),
          /* @__PURE__ */ b("div", { className: "building-ui-clothing-buttons", children: [
            ["glasses-set-a", "glasses-set-b"].map((D) => {
              const A = me.getState().clothingSets.get(D);
              return A ? /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => me.getState().setPreviewAccessory("glasses", A.id),
                  className: `building-ui-clothing-button ${me.getState().previewAccessories.glasses === A.id ? "active" : ""}`,
                  children: A.name
                },
                A.id
              ) : null;
            }),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => me.getState().setPreviewAccessory("glasses", ""),
                className: `building-ui-clothing-button ${me.getState().previewAccessories.glasses ? "" : "active"}`,
                children: "없음"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ b("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Selected Instance:" }),
          /* @__PURE__ */ l("span", { className: "building-ui-info-value", children: X || "None" })
        ] }),
        G && I.get(G) && /* @__PURE__ */ b("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ b("p", { children: [
            "현재 선택: ",
            I.get(G)?.name
          ] }),
          /* @__PURE__ */ l("p", { children: "클릭하여 NPC 배치" }),
          /* @__PURE__ */ l("p", { children: "배치된 NPC를 클릭하여 선택" })
        ] })
      ] })
    ] }) : null })
  ] }) : null;
}
const Ff = "gaesup.building", Lf = "building.square", Gf = "building.placement";
function Of(n = {}) {
  const e = n.id ?? Ff, t = n.gridExtensionId ?? Lf, r = n.placementExtensionId ?? Gf;
  return {
    id: e,
    name: "GaeSup Building",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["building", "grid", "placement"],
    setup: (i) => {
      i.grid.register(t, as, e), i.placement.register(
        r,
        {
          adapter: ps,
          createEngine: fs,
          toEntries: ds,
          blockToEntry: us,
          tileToEntry: cs,
          wallToEntry: ls
        },
        e
      ), i.events.emit("building:ready", {
        pluginId: e,
        gridExtensionId: t,
        placementExtensionId: r
      });
    },
    dispose(i) {
      i.grid.remove(t), i.placement.remove(r);
    }
  };
}
const Gm = Of();
function Om() {
  const n = F(() => ({
    frustum: new v.Frustum(),
    matrix: new v.Matrix4(),
    camPos: new v.Vector3()
  }), []);
  return de((e, t) => {
    const r = e.camera;
    kn().size() !== 0 && (n.matrix.multiplyMatrices(
      r.projectionMatrix,
      r.matrixWorldInverse
    ), n.frustum.setFromProjectionMatrix(n.matrix), n.camPos.copy(r.position), kn().tick({
      elapsedTime: e.clock.elapsedTime,
      delta: t,
      cameraPosition: n.camPos,
      frustum: n.frustum
    }));
  }), null;
}
function Uf(n, e, t) {
  return e === t ? !0 : e < t ? n >= e && n < t : n >= e || n < t;
}
function Wf(n, e) {
  return n.weekdays && n.weekdays.length > 0 && !n.weekdays.includes(e.weekday) || n.seasons && n.seasons.length > 0 && !n.seasons.includes(e.season) ? !1 : Uf(e.hour, n.startHour, n.endHour);
}
function Hf(n, e) {
  for (const r of n.entries)
    if (Wf(r, e))
      return {
        position: r.position,
        activity: r.activity ?? "idle",
        ...r.rotationY !== void 0 ? { rotationY: r.rotationY } : {},
        ...r.dialogTreeId ? { dialogTreeId: r.dialogTreeId } : {},
        source: r
      };
  const t = n.defaultEntry;
  return {
    position: t?.position ?? [0, 0, 0],
    activity: t?.activity ?? "idle",
    ...t?.rotationY !== void 0 ? { rotationY: t.rotationY } : {},
    ...t?.dialogTreeId ? { dialogTreeId: t.dialogTreeId } : {},
    source: null
  };
}
class jf {
  map = /* @__PURE__ */ new Map();
  register(e) {
    this.map.set(e.npcId, e);
  }
  unregister(e) {
    this.map.delete(e);
  }
  get(e) {
    return this.map.get(e);
  }
  resolve(e, t) {
    const r = this.map.get(e);
    return r ? Hf(r, t) : null;
  }
  all() {
    return Array.from(this.map.values());
  }
  clear() {
    this.map.clear();
  }
}
let Cr = null;
function Zo() {
  return Cr || (Cr = new jf()), Cr;
}
function Um(n) {
  const [e, t] = Z(() => {
    const r = ve.getState();
    return Zo().resolve(n, r.time);
  });
  return L(() => {
    let r = -1;
    const o = () => {
      const s = ve.getState();
      if (s.time.hour === r) return;
      r = s.time.hour;
      const a = Zo().resolve(n, s.time);
      t(a);
    };
    return o(), ve.subscribe((s, a) => {
      (s.time.hour !== a.time.hour || s.time.day !== a.time.day || s.time.weekday !== a.time.weekday) && o();
    });
  }, [n]), e;
}
export {
  Ys as AnimationDebugPanel,
  mm as AudioControls,
  jm as BASIC_KART_BLUEPRINT,
  Qm as BaseComponent,
  Bu as Billboard,
  e0 as BlueprintConverter,
  t0 as BlueprintEntity,
  n0 as BlueprintFactory,
  r0 as BlueprintLoader,
  o0 as BlueprintSpawner,
  Sp as BugSpot,
  Fm as BuildingController,
  cf as BuildingSystem,
  Lm as BuildingUI,
  vo as CATALOG_CATEGORIES,
  es as Camera,
  Js as CameraDebugPanel,
  na as CameraPresets,
  em as CatalogUI,
  gm as CharacterCreator,
  Ls as CircularPluginDependencyError,
  rs as Clicker,
  i0 as ComponentRegistry,
  _p as ConnectionForm,
  tm as CraftingUI,
  nm as CropPlot,
  ml as DAILY_FRIENDSHIP_CAP,
  m0 as DEFAULT_SQUARE_GRID_SPEC,
  Yp as DialogBox,
  wl as DialogRunner,
  Rs as DuplicateExtensionError,
  Ds as DuplicatePluginError,
  Pm as DynamicFog,
  Rm as DynamicSky,
  Nm as Editor,
  lm as EventsHUD,
  $m as FIRE_MAGE_BLUEPRINT,
  pl as FRIENDSHIP_LEVELS,
  Em as Fire,
  wp as FishSpot,
  aa as FocusableObject,
  bm as Footprints,
  hm as Footsteps,
  ap as FreePlacementAdapter,
  Ra as GaeSupProps,
  ns as GaesupController,
  _a as GaesupWorld,
  Pa as GaesupWorldContent,
  up as Gamepad,
  $i as Grass,
  Om as GrassDriver,
  s0 as GravityForceComponent,
  Cu as GridHelper,
  os as GroundClicker,
  jp as HotbarUI,
  Im as HouseDoor,
  dm as HousePlot,
  Es as InMemoryEventBus,
  ze as InMemoryExtensionRegistry,
  ol as IndexedDBAdapter,
  dp as Interactable,
  pp as InteractionPrompt,
  fp as InteractionTracker,
  $p as InventoryUI,
  vm as LOCALE_LABEL,
  il as LocalStorageAdapter,
  Jp as MailboxUI,
  gp as MiniMap,
  yp as MinimapPlatform,
  Ns as MissingExtensionError,
  h0 as MissingPlacementEntryError,
  Fs as MissingPluginDependencyError,
  ni as MotionController,
  oi as MotionDebugPanel,
  mp as MotionUI,
  Rp as MultiplayerCanvas,
  bf as NPCSystem,
  ym as OutfitAvatar,
  g0 as PlacementEngine,
  y0 as PlacementRejectedError,
  Pp as PlayerInfoOverlay,
  Gs as PluginRegistry,
  Xp as QuestLogUI,
  Ya as RemotePlayer,
  Tm as RoomPortal,
  Am as RoomRoot,
  _m as RoomVisibilityDriver,
  ll as SEED_ITEMS,
  Bm as Sakura,
  ld as SakuraBatch,
  zm as Sand,
  wd as SandBatch,
  sl as SaveSystem,
  Cm as SceneFader,
  km as SceneRoot,
  qp as ShopUI,
  Ui as Snow,
  Dm as Snowfield,
  Md as SnowfieldBatch,
  ii as SpeechBalloon,
  b0 as SquareGridAdapter,
  hp as Teleport,
  rf as TileSystem,
  Fp as TimeHUD,
  bp as ToastHost,
  Zp as ToolUseController,
  Mm as TouchControls,
  fm as TownHUD,
  xp as TreeObject,
  Vm as V3,
  qm as V30,
  Ym as V31,
  Zm as WARRIOR_BLUEPRINT,
  of as WallSystem,
  Vp as WalletHUD,
  Hd as Water,
  im as WeatherEffect,
  om as WeatherHUD,
  _a as World,
  _a as WorldContainer,
  ss as applyToonToScene,
  No as autoDetectProfile,
  Xm as blueprintRegistry,
  Gm as buildingPlugin,
  dc as classifyTier,
  Of as createBuildingPlugin,
  al as createDefaultSaveSystem,
  v0 as createNoOverlapRule,
  x0 as createPlacementEngine,
  zs as createPluginContext,
  Bs as createPluginLogger,
  lp as createPluginRegistry,
  mt as createToonMaterial,
  Np as defaultMultiplayerConfig,
  uc as detectCapabilities,
  w0 as disposeToonGradients,
  xt as getAudioEngine,
  gt as getCropRegistry,
  Te as getDefaultToonMode,
  Ml as getDialogRegistry,
  Or as getEventRegistry,
  kn as getGrassManager,
  Me as getItemRegistry,
  Zo as getNPCScheduler,
  He as getQuestRegistry,
  Lt as getRecipeRegistry,
  li as getSaveSystem,
  si as getToolEvents,
  pt as getToonGradient,
  uo as isEventActive,
  fe as notify,
  S0 as placementOk,
  M0 as placementRejected,
  Ur as profileForTier,
  a0 as registerDefaultComponents,
  rm as registerSeedCrops,
  cm as registerSeedEvents,
  Op as registerSeedItems,
  Hf as resolveSchedule,
  C0 as setDefaultToonMode,
  xm as t,
  l0 as useAirplaneBlueprint,
  pm as useAmbientBgm,
  Ve as useAudioStore,
  Lp as useAutoSave,
  c0 as useBlueprint,
  u0 as useBlueprintsByType,
  xf as useBuildingEditor,
  O as useBuildingStore,
  di as useCatalogStore,
  Qp as useCatalogTracker,
  d0 as useCharacterBlueprint,
  je as useCharacterStore,
  $n as useCraftingStore,
  ri as useCurrentInteraction,
  zp as useDayChange,
  um as useDecorationScore,
  _t as useDialogStore,
  Wp as useEquippedItem,
  vp as useEquippedToolKind,
  Tn as useEventsStore,
  am as useEventsTicker,
  Ir as useFriendshipStore,
  cp as useGaesupController,
  pe as useGaesupStore,
  Bp as useGameClock,
  Ja as useGameTime,
  cl as useHotbar,
  Hp as useHotbarKeyboard,
  Dp as useHourChange,
  jt as useI18nStore,
  ht as useInteractablesStore,
  la as useInteractionKey,
  Up as useInventory,
  ce as useInventoryStore,
  Gp as useLoadOnMount,
  Sm as useLocale,
  nn as useMailStore,
  Tp as useMultiplayer,
  Mp as useNPCConnection,
  me as useNPCStore,
  _n as useNetworkBridge,
  kp as useNetworkGroup,
  Cp as useNetworkMessage,
  Ip as useNetworkStats,
  Um as useNpcSchedule,
  pc as usePerfStore,
  Ap as usePlayerNetwork,
  yt as usePlayerPosition,
  Oe as usePlotStore,
  Kp as useQuestObjectiveTracker,
  qe as useQuestStore,
  Ye as useRoomVisibilityStore,
  st as useSceneStore,
  tn as useShopStore,
  Km as useSpawnFromBlueprint,
  Xt as useStateSystem,
  ti as useTeleport,
  Ep as useTimeOfDay,
  ve as useTimeStore,
  kr as useToastStore,
  St as useToolUse,
  rt as useTownStore,
  wm as useTranslate,
  ra as useUIConfigStore,
  f0 as useVehicleBlueprint,
  Le as useWalletStore,
  Ge as useWeatherStore,
  sm as useWeatherTicker
};
