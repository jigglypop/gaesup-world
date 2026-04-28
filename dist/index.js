import "reflect-metadata";
import { a as pe, A as Wi, R as Hi, M as ji, c as Uo, I as $i, H as Vt, P as Pr, d as Vi } from "./useSpawnFromBlueprint-Cxb3C2ch.js";
import { B as um, F as dm, V as fm, e as pm, f as mm, W as hm, b as gm, u as ym } from "./useSpawnFromBlueprint-Cxb3C2ch.js";
import { i as vm, a as xm, g as wm, B as Sm, h as Mm, b as Cm, C as km, G as Im, r as Am, e as Tm, u as _m, f as Pm, c as Rm, d as Nm } from "./registerComponents-CYCKQxA1.js";
import { c as Rr, d as qt, u as Wo, e as dt, f as U, C as qi, g as Yi, a as Zi, b as Xi, G as Ki, T as ue, F as wn, h as at, i as Te, j as lt, P as Ji, k as Qi } from "./index-rfyPsC1L.js";
import { l as zm, s as Bm } from "./index-rfyPsC1L.js";
import { jsx as l, jsxs as x, Fragment as Se } from "react/jsx-runtime";
import Ce, { useState as Y, useEffect as L, useRef as N, useCallback as V, forwardRef as es, useId as ts, useMemo as F, Suspense as Je, useLayoutEffect as Oe, memo as ns } from "react";
import { useFrame as de, useThree as Ze, Canvas as rs, extend as Sn, useLoader as os } from "@react-three/fiber";
import * as w from "three";
import { u as be, a as De } from "./weatherStore-ZW3thKj6.js";
import { createNoise2D as Nr } from "simplex-noise";
import { useGLTF as Ho, useAnimations as is, Text as ss, Environment as as, Grid as ls, useTexture as Er, shaderMaterial as zr, OrbitControls as cs } from "@react-three/drei";
import { create as xe } from "zustand";
import { SkeletonUtils as jo, Water as us } from "three-stdlib";
import { RigidBody as Yt, CapsuleCollider as ds, Physics as fs, euler as ps, CuboidCollider as $o } from "@react-three/rapier";
import { enableMapSet as ms } from "immer";
import { immer as hs } from "zustand/middleware/immer";
import { u as gs } from "./authStore-CU_xZzJ7.js";
import { useShallow as Vo } from "zustand/react/shallow";
const ys = [
  { value: "idle", label: "Idle" },
  { value: "walk", label: "Walk" },
  { value: "run", label: "Run" },
  { value: "jump", label: "Jump" },
  { value: "fall", label: "Fall" },
  { value: "dance", label: "Dance" },
  { value: "wave", label: "Wave" }
];
function bs() {
  const { playAnimation: n, currentType: e, currentAnimation: t } = Rr(), r = (o) => {
    n(e, o);
  };
  return /* @__PURE__ */ l("div", { className: "ac-panel", children: /* @__PURE__ */ l("div", { className: "ac-grid", children: ys.map((o) => /* @__PURE__ */ l(
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
const vs = () => /* @__PURE__ */ l("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ l("path", { d: "M8 5v14l11-7z" }) }), xs = () => /* @__PURE__ */ l("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ l("path", { d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z" }) }), ws = () => /* @__PURE__ */ l("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ l("path", { d: "M6 6h2v12H6zm3.5 6l8.5 6V6z" }) }), Ss = () => /* @__PURE__ */ l("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ l("path", { d: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" }) });
function Ms() {
  const { bridge: n, playAnimation: e, stopAnimation: t, currentType: r, currentAnimation: o } = Rr(), [i, a] = Y(!1), [s, u] = Y([]), [c, f] = Y(30);
  L(() => {
    if (!n) return;
    const m = () => {
      const b = n.snapshot(r);
      b && (a(b.isPlaying), u(b.availableAnimations));
    };
    return m(), n.subscribe((b, y) => {
      y === r && m();
    });
  }, [n, r]);
  const d = () => {
    i ? t(r) : e(r, o);
  };
  return /* @__PURE__ */ x("div", { className: "ap-panel", children: [
    /* @__PURE__ */ x("div", { className: "ap-controls", children: [
      /* @__PURE__ */ l(
        "select",
        {
          className: "ap-select",
          value: o,
          onChange: (m) => e(r, m.target.value),
          children: s.map((m) => /* @__PURE__ */ l("option", { value: m, children: m }, m))
        }
      ),
      /* @__PURE__ */ x("div", { className: "ap-buttons", children: [
        /* @__PURE__ */ l("button", { className: "ap-btn", "aria-label": "previous animation", children: /* @__PURE__ */ l(ws, {}) }),
        /* @__PURE__ */ l("button", { className: "ap-btn-primary", onClick: d, "aria-label": i ? "pause" : "play", children: i ? /* @__PURE__ */ l(xs, {}) : /* @__PURE__ */ l(vs, {}) }),
        /* @__PURE__ */ l("button", { className: "ap-btn", "aria-label": "next animation", children: /* @__PURE__ */ l(Ss, {}) })
      ] })
    ] }),
    /* @__PURE__ */ x("div", { className: "ap-timeline", children: [
      /* @__PURE__ */ l("span", { className: "ap-time", children: "0:00" }),
      /* @__PURE__ */ l(
        "input",
        {
          type: "range",
          className: "ap-slider",
          min: "0",
          max: "100",
          value: c,
          onChange: (m) => f(Number(m.target.value))
        }
      ),
      /* @__PURE__ */ l("span", { className: "ap-time", children: "1:30" })
    ] })
  ] });
}
const Cs = [
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
function ks() {
  const { bridge: n, currentType: e } = Rr(), [t, r] = Y({
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
    const a = () => {
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
    return a(), n.subscribe((u, c) => {
      c === e && a();
    });
  }, [n, e]);
  const o = (a, s, u = 2) => {
    if (a == null) return "N/A";
    switch (s) {
      case "array":
        return Array.isArray(a) ? `${a.length} animations` : String(a);
      case "boolean":
        return a ? "Yes" : "No";
      case "number":
        return typeof a == "number" ? a.toFixed(u) : String(a);
      default:
        return String(a);
    }
  }, i = (a) => {
    if (a in t)
      return t[a];
  };
  return /* @__PURE__ */ l("div", { className: "ad-panel", children: /* @__PURE__ */ l("div", { className: "ad-content", children: Cs.filter((a) => a.enabled).map((a) => /* @__PURE__ */ x("div", { className: "ad-item", children: [
    /* @__PURE__ */ l("span", { className: "ad-label", children: a.label }),
    /* @__PURE__ */ l("span", { className: "ad-value", children: o(i(a.key), a.format) })
  ] }, a.key)) }) });
}
const Is = [
  { value: "thirdPerson", label: "Third Person" },
  { value: "firstPerson", label: "First Person" },
  { value: "chase", label: "Chase" },
  { value: "topDown", label: "Top Down" },
  { value: "isometric", label: "Isometric" },
  { value: "sideScroll", label: "Side-Scroller" },
  { value: "fixed", label: "Fixed" }
];
function As() {
  const { mode: n, setMode: e } = pe(), t = n?.control || "thirdPerson";
  return /* @__PURE__ */ l("div", { className: "cc-panel", children: /* @__PURE__ */ l("div", { className: "cc-list", children: Is.map((r) => /* @__PURE__ */ l(
    "button",
    {
      className: `cc-button ${t === r.value ? "active" : ""}`,
      onClick: () => e({ control: r.value }),
      children: r.label
    },
    r.value
  )) }) });
}
const Ts = [
  { key: "mode", label: "Mode", enabled: !0, format: "text" },
  { key: "position", label: "Position", enabled: !0, format: "vector3", precision: 2 },
  { key: "distance", label: "Distance", enabled: !0, format: "vector3", precision: 2 },
  { key: "fov", label: "FOV", enabled: !0, format: "angle", precision: 1 },
  { key: "velocity", label: "Velocity", enabled: !1, format: "vector3", precision: 2 },
  { key: "rotation", label: "Rotation", enabled: !1, format: "vector3", precision: 2 },
  { key: "zoom", label: "Zoom", enabled: !1, format: "number", precision: 2 },
  { key: "activeController", label: "Controller", enabled: !0, format: "text" }
];
function Tn(n) {
  if (typeof n != "object" || n === null) return !1;
  const e = n;
  return typeof e.x == "number" && typeof e.y == "number" && typeof e.z == "number";
}
function _s() {
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
  }, [e, t] = Y(n), r = pe((d) => d.mode), o = pe((d) => d.cameraOption), { activeState: i } = qt(), a = N(n), s = V((d, m) => d === m ? !1 : Tn(d) ? Tn(m) ? d.x !== m.x || d.y !== m.y || d.z !== m.z : !0 : typeof d != "object" || d === null ? !0 : JSON.stringify(d) !== JSON.stringify(m), []), u = V((d) => Tn(d) ? { x: d.x, y: d.y, z: d.z } : null, []), c = V(() => {
    const d = o?.xDistance !== void 0 && o?.yDistance !== void 0 && o?.zDistance !== void 0 ? {
      x: o.xDistance,
      y: o.yDistance,
      z: o.zDistance
    } : null, m = {
      ...a.current,
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
    Object.keys(m).some(
      (b) => s(
        m[b],
        a.current[b]
      )
    ) && (a.current = m, t(m));
  }, [r, o, i, s, u]);
  L(() => {
    c();
    const d = setInterval(c, 100);
    return () => {
      clearInterval(d);
    };
  }, [c]);
  const f = V((d, m = 2) => d == null ? "N/A" : typeof d == "object" && d.x !== void 0 ? `X:${d.x.toFixed(m)} Y:${d.y.toFixed(m)} Z:${d.z.toFixed(m)}` : typeof d == "number" ? d.toFixed(m) : d.toString(), []);
  return /* @__PURE__ */ l("div", { className: "cd-panel", children: /* @__PURE__ */ l("div", { className: "cd-grid", children: Ts.map((d) => /* @__PURE__ */ x("div", { className: "cd-item", children: [
    /* @__PURE__ */ l("span", { className: "cd-label", children: d.label }),
    /* @__PURE__ */ l("span", { className: "cd-value", children: f(e[d.key]) })
  ] }, d.key)) }) });
}
const Ps = [
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
function Rs(n, e) {
  return !n || !e ? !1 : n.x === e.x && n.y === e.y && n.z === e.z;
}
function Ns(n) {
  const e = n?.xDistance, t = n?.yDistance, r = n?.zDistance;
  if (!(e === void 0 || t === void 0 || r === void 0))
    return { x: e, y: t, z: r };
}
function Es() {
  const [n] = Y(Ps), e = pe((u) => u.setMode), t = pe((u) => u.setCameraOption), r = pe((u) => u.mode), o = pe((u) => u.cameraOption), [i, a] = Y(null), s = V((u) => {
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
      (c) => c.config.mode === r?.control && Rs(c.config.distance, Ns(o))
    );
    a(u ? u.id : null);
  }, [r, o, n]), /* @__PURE__ */ l("div", { className: "cp-panel", children: /* @__PURE__ */ l("div", { className: "cp-grid", children: n.map((u) => /* @__PURE__ */ x(
    "button",
    {
      className: `cp-item ${i === u.id ? "active" : ""}`,
      onClick: () => s(u),
      children: [
        /* @__PURE__ */ l("div", { className: "cp-name", children: u.name }),
        /* @__PURE__ */ l("div", { className: "cp-description", children: u.description })
      ]
    },
    u.id
  )) }) });
}
function Pf() {
  const { activeState: n, gameStates: e } = qt(), t = pe((a) => a.mode), r = pe((a) => a.controllerOptions), o = pe(Vo((a) => a));
  return {
    state: n || null,
    mode: t,
    states: e,
    control: r,
    context: { mode: t, states: e, control: r },
    controller: o
  };
}
function qo() {
  const { activeState: n, updateActiveState: e } = qt(), t = !!n;
  return {
    teleport: V((o, i) => {
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
const Yr = {
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
}, zs = xe((n) => ({
  config: Yr,
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
  resetConfig: () => n({ config: Yr })
})), ct = xe((n, e) => ({
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
function Bs({ value: n, name: e, gamePadButtonStyle: t }) {
  const [r, o] = Y(!1), { pushKey: i } = Wo(), a = () => {
    i(n, !0), o(!0);
  }, s = () => {
    i(n, !1), o(!1);
  };
  return /* @__PURE__ */ l(
    "button",
    {
      className: `pad-button ${r ? "is-clicked" : ""}`,
      onMouseDown: a,
      onMouseUp: s,
      onMouseLeave: s,
      onContextMenu: (u) => {
        u.preventDefault(), s();
      },
      onPointerDown: a,
      onPointerUp: s,
      style: t,
      children: e
    }
  );
}
function Rf(n) {
  const { gamePadStyle: e, gamePadButtonStyle: t, label: r } = n, o = pe((s) => s.interaction?.keyboard), { mode: i } = pe();
  Wo();
  const a = Object.keys(o || {}).map((s) => {
    const u = r?.[s] || s;
    return s === "forward" || s === "backward" || s === "leftward" || s === "rightward" ? {
      key: s,
      name: u,
      type: "direction",
      active: o?.[s] || !1
    } : {
      key: s,
      name: u,
      type: "action",
      active: o?.[s] || !1
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
      children: a.map((s) => /* @__PURE__ */ l(
        Bs,
        {
          value: s.key,
          name: s.name,
          gamePadButtonStyle: t
        },
        s.key
      ))
    }
  );
}
const Zr = [
  { id: "slow", name: "Slow", maxSpeed: 5, acceleration: 8 },
  { id: "normal", name: "Normal", maxSpeed: 10, acceleration: 15 },
  { id: "fast", name: "Fast", maxSpeed: 20, acceleration: 25 },
  { id: "sprint", name: "Sprint", maxSpeed: 35, acceleration: 40 }
], Xr = [
  { id: "eco", name: "Eco", maxSpeed: 15, acceleration: 10 },
  { id: "comfort", name: "Comfort", maxSpeed: 25, acceleration: 20 },
  { id: "sport", name: "Sport", maxSpeed: 40, acceleration: 35 },
  { id: "turbo", name: "Turbo", maxSpeed: 60, acceleration: 50 }
];
function Ds(n, e) {
  const t = n ?? "bottom-left", r = {
    position: "fixed",
    zIndex: e ?? 1e4
  };
  return t.includes("top") && (r.top = 12), t.includes("bottom") && (r.bottom = 12), t.includes("left") && (r.left = 12), t.includes("right") && (r.right = 12), r;
}
function Yo(n) {
  const e = Ds(n.position, n.zIndex), t = pe((m) => m.mode), r = pe((m) => m.setMode), o = pe((m) => m.setPhysics), i = t?.type === "vehicle" ? "vehicle" : "character", a = i === "vehicle" ? Xr : Zr, [s, u] = Y(
    i === "vehicle" ? "comfort" : "normal"
  ), c = V(
    (m, h) => {
      const y = (m === "vehicle" ? Xr : Zr).find((g) => g.id === h);
      if (y) {
        if (m === "vehicle") {
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
  ), f = V((m) => {
    u(m), c(i, m), n.onPresetChange?.(m);
  }, [c, i, n]), d = V((m) => {
    const h = m.target.value;
    r({ type: h });
    const b = h === "vehicle" ? "comfort" : "normal";
    u(b), c(h, b), n.onPresetChange?.(b);
  }, [c, r, n]);
  return /* @__PURE__ */ x("div", { className: `mc-panel ${n.compact ? "compact" : ""}`, style: e, children: [
    /* @__PURE__ */ x("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ l("label", { htmlFor: "motion-type-select", className: "mc-label", children: "Motion Type" }),
      /* @__PURE__ */ x(
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
    /* @__PURE__ */ x("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ l("label", { className: "mc-label", children: "Presets" }),
      /* @__PURE__ */ l("div", { className: "mc-presets-grid", children: a.map((m) => /* @__PURE__ */ l(
        "button",
        {
          className: `mc-preset-btn ${m.id === s ? "active" : ""}`,
          onClick: () => f(m.id),
          title: `Max Speed: ${m.maxSpeed}, Accel: ${m.acceleration}`,
          children: m.name
        },
        m.id
      )) })
    ] })
  ] });
}
function Fs() {
  const { cameraOption: n, setCameraOption: e } = pe.getState();
  n?.focus && e({
    focus: !1
  });
}
const Ls = es(
  ({ children: n, position: e, focusDistance: t = 10, focusDuration: r = 1, onFocus: o, onBlur: i, ...a }, s) => {
    const u = pe((b) => b.setCameraOption), c = pe((b) => b.cameraOption), f = (b) => {
      if (b.stopPropagation(), !c?.enableFocus) return;
      if (c.focus) {
        Fs(), i && i(b);
        return;
      }
      const y = b.object.getWorldPosition(new w.Vector3());
      u({
        focusTarget: y,
        focusDuration: r,
        focusDistance: t,
        focus: !0
      }), o && o(b);
    }, d = () => {
      c?.enableFocus && (document.body.style.cursor = "pointer");
    }, m = (b) => {
      document.body.style.cursor = "default", i && !c?.focus && i(b);
    }, h = {
      ...a,
      ...e ? { position: e } : {}
    };
    return /* @__PURE__ */ l(
      "group",
      {
        ref: s,
        onClick: f,
        onPointerOver: d,
        onPointerOut: m,
        ...h,
        children: n
      }
    );
  }
);
Ls.displayName = "FocusableObject";
function Nf({
  id: n,
  kind: e = "misc",
  label: t,
  range: r = 2.2,
  activationKey: o = "e",
  data: i,
  onActivate: a,
  position: s,
  children: u
}) {
  const c = ts(), f = n ?? c, d = ct((g) => g.register), m = ct((g) => g.unregister), h = ct((g) => g.updatePosition), b = N(null), y = F(() => new w.Vector3(...s), [s]);
  return L(() => (d({
    id: f,
    kind: e,
    label: t,
    position: y.clone(),
    range: r,
    key: o,
    ...i ? { data: i } : {},
    onActivate: a
  }), () => m(f)), [f, e, t, r, o, i, a, d, m, y]), L(() => {
    h(f, y);
  }, [f, y, h]), /* @__PURE__ */ l("group", { ref: b, position: s, children: u });
}
const Kr = new w.Vector3();
function Zo() {
  return ct((n) => n.current);
}
function Gs(n = !0) {
  const e = Zo(), t = ct((r) => r.activateCurrent);
  L(() => {
    if (!n || !e) return;
    const r = (o) => {
      const i = o.target?.tagName?.toLowerCase();
      i === "input" || i === "textarea" || o.key.toLowerCase() === e.key.toLowerCase() && t();
    };
    return window.addEventListener("keydown", r), () => window.removeEventListener("keydown", r);
  }, [e, n, t]);
}
function Ef({ throttleMs: n = 80 } = {}) {
  const { position: e } = dt({ updateInterval: 16 }), t = ct((i) => i.entries), r = ct((i) => i.setCurrent), o = N(0);
  return de((i, a) => {
    if (o.current += a * 1e3, o.current < n) return;
    o.current = 0;
    let s = null, u = 1 / 0, c = "", f = "e";
    for (const d of t.values()) {
      Kr.copy(d.position).sub(e);
      const m = Kr.lengthSq(), h = d.range * d.range;
      m > h || m < u && (u = m, s = d.id, c = d.label, f = d.key);
    }
    if (!s) {
      r(null);
      return;
    }
    r({
      id: s,
      label: c,
      key: f,
      distance: Math.sqrt(u)
    });
  }), null;
}
function zf({ enabled: n = !0 }) {
  const e = Zo();
  return Gs(n), !n || !e ? null : /* @__PURE__ */ x(
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
        /* @__PURE__ */ x("span", { style: { opacity: 0.5, fontSize: 11 }, children: [
          e.distance.toFixed(1),
          "m"
        ] })
      ]
    }
  );
}
const Jr = [
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
function Os(n, e) {
  const t = n ?? "top-right", r = {
    position: "fixed",
    zIndex: e ?? 1e4
  };
  return t.includes("top") && (r.top = 12), t.includes("bottom") && (r.bottom = 12), t.includes("left") && (r.left = 12), t.includes("right") && (r.right = 12), r;
}
function Xo(n) {
  const e = n.embedded ? {} : Os(n.position, n.zIndex), t = pe((f) => f.mode), r = pe((f) => f.physics), { activeState: o, gameStates: i } = qt(), a = n.precision ?? 2, s = n.customFields ? [...Jr, ...n.customFields] : Jr, u = (f, d, m = 2) => {
    if (d == null) return "N/A";
    switch (f.type) {
      case "vector3":
        if (Array.isArray(d) && d.length === 3) {
          const [h, b, y] = d;
          return `X:${h.toFixed(m)} Y:${b.toFixed(m)} Z:${y.toFixed(m)}`;
        }
        if (typeof d == "object" && d !== null && "x" in d && "y" in d && "z" in d) {
          const h = d;
          return `X:${h.x.toFixed(m)} Y:${h.y.toFixed(m)} Z:${h.z.toFixed(m)}`;
        }
        return String(d);
      case "number":
        return typeof d == "number" ? d.toFixed(m) : String(d);
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
      children: /* @__PURE__ */ l("div", { className: "md-content", children: s.map((f) => /* @__PURE__ */ x("div", { className: "md-item", children: [
        /* @__PURE__ */ l("span", { className: "md-label", children: f.label }),
        /* @__PURE__ */ l("span", { className: "md-value", children: u(f, c(f), a) })
      ] }, f.key)) })
    }
  );
}
function Bf({
  showController: n = !0,
  showDebugPanel: e = !0,
  controllerProps: t = {},
  debugPanelProps: r = {}
}) {
  return /* @__PURE__ */ x(Se, { children: [
    n && /* @__PURE__ */ l(
      Yo,
      {
        position: "bottom-left",
        showLabels: !0,
        compact: !1,
        ...t
      }
    ),
    e && /* @__PURE__ */ l(
      Xo,
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
function Df({ text: n, position: e, teleportStyle: t }) {
  const { teleport: r, canTeleport: o } = qo();
  return /* @__PURE__ */ x(
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
var Us = Object.defineProperty, Ws = Object.getOwnPropertyDescriptor, Hs = (n, e, t) => e in n ? Us(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t, js = (n, e, t, r) => {
  for (var o = r > 1 ? void 0 : r ? Ws(e, t) : e, i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (o = a(o) || o);
  return o;
}, $s = (n, e, t) => Hs(n, e + "", t);
let Ee = class extends Wi {
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
    const a = Math.abs(n.x - o.x) > t || Math.abs(n.z - o.z) > t, s = Math.abs(e - i) > r;
    (a || s) && (this.state.isDirty = !0, this.state.lastPosition = { x: n.x, z: n.z }, this.state.lastRotation = e);
  }
  render(n) {
    if (!this.state.canvas || !this.state.ctx || !this.state.isDirty) return;
    const e = performance.now(), { size: t, scale: r, position: o, rotation: i, blockRotate: a, tileGroups: s, sceneObjects: u } = n, c = this.state.ctx;
    if (c.clearRect(0, 0, t, t), c.save(), c.beginPath(), c.arc(t / 2, t / 2, t / 2, 0, Math.PI * 2), c.clip(), !this.state.gradientCache.background) {
      const d = c.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
      d.addColorStop(0, "rgba(20, 30, 40, 0.9)"), d.addColorStop(1, "rgba(10, 20, 30, 0.95)"), this.state.gradientCache.background = d;
    }
    c.fillStyle = this.state.gradientCache.background, c.fillRect(0, 0, t, t);
    const f = i * 180 / Math.PI;
    c.translate(t / 2, t / 2), c.rotate(-f * Math.PI / 180), c.translate(-t / 2, -t / 2), c.save(), c.strokeStyle = "rgba(255, 255, 255, 0.1)", c.lineWidth = 1;
    for (let d = 0; d < t; d += 20)
      c.beginPath(), c.moveTo(d, 0), c.lineTo(d, t), c.moveTo(0, d), c.lineTo(t, d), c.stroke();
    c.restore(), this.renderCompass(c, t, f), s && s.size > 0 && this.renderTiles(c, t, r, o, s), u && u.size > 0 && this.renderSceneObjects(c, t, r, o, u), this.renderMarkers(c, t, r, o, f, a), this.renderAvatar(c, t), c.restore(), this.state.isDirty = !1, this.metrics.renderTime = performance.now() - e;
  }
  renderCompass(n, e, t) {
    n.save(), n.fillStyle = "white", n.font = "bold 16px sans-serif", n.shadowColor = "rgba(0, 0, 0, 0.8)", n.shadowBlur = 3, [
      { text: "N", x: e / 2, y: 25, color: "#ff6b6b" },
      { text: "S", x: e / 2, y: e - 25, color: "#4ecdc4" },
      { text: "E", x: e - 25, y: e / 2, color: "#45b7d1" },
      { text: "W", x: 25, y: e / 2, color: "#f9ca24" }
    ].forEach(({ text: o, x: i, y: a, color: s }) => {
      n.save(), n.fillStyle = s, n.translate(i, a), n.rotate(t * Math.PI / 180), n.textAlign = "center", n.textBaseline = "middle", n.fillText(o, 0, 0), n.restore();
    }), n.restore();
  }
  renderTiles(n, e, t, r, o) {
    Array.from(o.values()).forEach((a) => {
      a && a.tiles && Array.isArray(a.tiles) && a.tiles.forEach((s) => {
        if (!s || !s.position) return;
        const u = (s.position.x - r.x) * t, c = (s.position.z - r.z) * t, f = (s.size || 1) * 4 * t;
        n.save();
        const d = e / 2 - u - f / 2, m = e / 2 - c - f / 2;
        s.objectType === "water" ? n.fillStyle = "rgba(0, 150, 255, 0.6)" : s.objectType === "grass" ? n.fillStyle = "rgba(50, 200, 50, 0.4)" : s.objectType === "sand" ? n.fillStyle = "rgba(210, 180, 120, 0.45)" : s.objectType === "snowfield" ? n.fillStyle = "rgba(225, 240, 255, 0.5)" : n.fillStyle = "rgba(150, 150, 150, 0.3)", n.fillRect(d, m, f, f), n.strokeStyle = "rgba(255, 255, 255, 0.2)", n.lineWidth = 0.5, n.strokeRect(d, m, f, f), n.restore();
      });
    });
  }
  renderSceneObjects(n, e, t, r, o) {
    o.forEach((i) => {
      if (!i?.position || !i?.size) return;
      const a = (i.position.x - r.x) * t, s = (i.position.z - r.z) * t, u = i.size.x * t, c = i.size.z * t;
      n.save();
      const f = e / 2 - a - u / 2, d = e / 2 - s - c / 2;
      n.fillStyle = "rgba(100, 150, 200, 0.4)", n.fillRect(f, d, u, c), n.strokeStyle = "rgba(255, 255, 255, 0.4)", n.lineWidth = 1, n.strokeRect(f, d, u, c), n.restore();
    });
  }
  renderMarkers(n, e, t, r, o, i) {
    this.state.markers.size !== 0 && this.state.markers.forEach((a) => {
      if (!a?.center || !a?.size) return;
      const { center: s, size: u, text: c } = a, f = (s.x - r.x) * t, d = (s.z - r.z) * t;
      n.save();
      const m = u.x * t, h = u.z * t, b = e / 2 - f - m / 2, y = e / 2 - d - h / 2;
      n.shadowColor = "rgba(0, 0, 0, 0.6)", n.shadowBlur = 4, n.shadowOffsetX = 2, n.shadowOffsetY = 2, n.fillStyle = "rgba(0,0,0,0.3)", n.fillRect(b, y, m, h), n.shadowColor = "transparent", n.strokeStyle = "rgba(255, 255, 255, 0.3)", n.lineWidth = 1, n.strokeRect(b, y, m, h), c && (n.save(), n.fillStyle = "white", n.font = "bold 12px sans-serif", n.shadowColor = "rgba(0, 0, 0, 0.8)", n.shadowBlur = 2, n.translate(b + m / 2, y + h / 2), i || n.rotate(-o * Math.PI / 180), n.textAlign = "center", n.textBaseline = "middle", n.fillText(c, 0, 0), n.restore()), n.restore();
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
$s(Ee, "instance", null);
Ee = js([
  Hi("minimap"),
  ji({ autoStart: !1 })
], Ee);
const Vs = 5, qs = 0.5, Ys = 20, Zs = 200, Xs = (n) => {
  const { activeState: e } = qt(), t = U((p) => p.tileGroups), r = N(/* @__PURE__ */ new Map()), o = N(Ee.getInstance()), {
    scale: i = Vs,
    blockRotate: a = !1,
    updateInterval: s = 33
  } = n, u = N(null), [c, f] = Y(i), d = !!(e.position && n);
  L(() => {
    const p = u.current;
    return p && o.current.setCanvas(p), () => {
      o.current.setCanvas(null);
    };
  }, []);
  const m = V(() => {
    n.blockScale || f((p) => Math.min(Ys, p + 0.1));
  }, [n.blockScale]), h = V(() => {
    n.blockScale || f((p) => Math.max(qs, p - 0.1));
  }, [n.blockScale]), b = V(
    (p) => {
      n.blockScale || (p.preventDefault(), p.deltaY < 0 ? m() : h());
    },
    [n.blockScale, m, h]
  ), y = V(() => {
    const p = u.current;
    if (!p) return;
    const S = (v) => {
      n.blockScale || (v.preventDefault(), v.deltaY < 0 ? m() : h());
    };
    return p.addEventListener("wheel", S, { passive: !1 }), () => {
      p.removeEventListener("wheel", S);
    };
  }, [n.blockScale, m, h]), g = V(() => {
    const { position: p, euler: S } = e;
    !p || !S || o.current.render({
      size: Zs,
      scale: c,
      position: p,
      rotation: S.y,
      blockRotate: a,
      tileGroups: t,
      sceneObjects: r.current
    });
  }, [e, c, a, t]);
  return L(() => {
    if (!d) return;
    const p = setInterval(() => {
      const { position: S, euler: v } = e;
      S && v && (o.current.checkForUpdates(S, v.y), g());
    }, s);
    return () => {
      clearInterval(p);
    };
  }, [g, s, d, e]), L(() => {
    g();
  }, [c, g]), {
    canvasRef: u,
    scale: c,
    upscale: m,
    downscale: h,
    handleWheel: b,
    setupWheelListener: y,
    updateCanvas: g,
    isReady: d
  };
};
function Ks({
  playerPosition: n,
  offset: e
}) {
  const t = N(null), r = N(new w.Vector3()), o = N(new w.Vector3()), i = N(new w.Vector3()), a = N(!1);
  return de((s, u) => {
    if (!t.current) return;
    const c = i.current;
    if (c.set(
      n.x + e.x,
      n.y + e.y,
      n.z + e.z
    ), !a.current) {
      t.current.position.copy(c), r.current.copy(c), o.current.copy(c), a.current = !0;
      return;
    }
    c.distanceToSquared(o.current) > 25e-4 && o.current.copy(c);
    const d = 1 - Math.exp(-8 * u), m = r.current, h = o.current;
    m.lerp(h, d), m.distanceToSquared(h) < 1e-6 && m.copy(h), t.current.position.copy(m);
  }), t;
}
const Qr = 200;
function Ff({
  scale: n = 5,
  minScale: e = 0.5,
  maxScale: t = 20,
  blockScale: r = !1,
  blockScaleControl: o = !1,
  blockRotate: i = !1,
  angle: a = 0,
  minimapStyle: s,
  scaleStyle: u,
  plusMinusStyle: c,
  position: f = "top-right",
  showZoom: d = !0,
  showCompass: m = !0,
  markers: h = []
}) {
  const { canvasRef: b, scale: y, upscale: g, downscale: p, handleWheel: S } = Xs({
    blockScale: r,
    blockRotate: i
  }), v = f ? `minimap--${f}` : "";
  return /* @__PURE__ */ x("div", { className: `minimap ${v}`, style: s, children: [
    /* @__PURE__ */ l(
      "canvas",
      {
        ref: b,
        className: "minimap__canvas",
        width: Qr,
        height: Qr,
        onWheel: S
      }
    ),
    m && /* @__PURE__ */ l("div", { className: "minimap__compass", children: /* @__PURE__ */ l("div", { style: { transform: `rotate(${a}deg)` }, children: "N" }) }),
    h.map((M, T) => /* @__PURE__ */ l(
      "div",
      {
        className: `minimap__marker minimap__marker--${M.type || "normal"}`,
        style: {
          left: `${M.x}%`,
          top: `${M.y}%`
        },
        children: M.label && /* @__PURE__ */ l("div", { className: "minimap__marker-label", children: M.label })
      },
      M.id || T
    )),
    d && !o && /* @__PURE__ */ l("div", { className: "minimap__controls", style: u, children: /* @__PURE__ */ x("div", { className: "minimap__zoom-controls", children: [
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
          onClick: p,
          disabled: y <= e,
          style: c,
          children: "-"
        }
      )
    ] }) })
  ] });
}
function Js({
  id: n,
  position: e,
  size: t = [2, 2, 2],
  text: r = "",
  type: o = "normal",
  children: i
}) {
  return L(() => {
    const a = Ee.getInstance(), s = Array.isArray(e) ? e : [e.x, e.y, e.z], u = Array.isArray(t) ? t : [t.x, t.y, t.z];
    return a.addMarker(
      n,
      o,
      r || "",
      new w.Vector3(s[0], s[1], s[2]),
      new w.Vector3(u[0], u[1], u[2])
    ), () => {
      a.removeMarker(n);
    };
  }, [n, e, t, o, r]), /* @__PURE__ */ l(Se, { children: i });
}
function Lf({
  id: n,
  position: e,
  size: t,
  label: r,
  children: o
}) {
  return /* @__PURE__ */ l(Js, { id: n, position: e, size: t, text: r, type: "ground", children: o });
}
function eo(n, e, t, r, o, i) {
  n.beginPath(), n.moveTo(e + i, t), n.lineTo(e + r - i, t), n.quadraticCurveTo(e + r, t, e + r, t + i), n.lineTo(e + r, t + o - i), n.quadraticCurveTo(e + r, t + o, e + r - i, t + o), n.lineTo(e + i, t + o), n.quadraticCurveTo(e, t + o, e, t + o - i), n.lineTo(e, t + i), n.quadraticCurveTo(e, t, e + i, t), n.closePath();
}
function Qs(n, e, t, r, o, i, a, s = 8, u = "#000000") {
  n.fillStyle = a, eo(n, e, t, r, o, i), n.fill(), n.strokeStyle = u, n.lineWidth = s;
  const c = s / 2;
  eo(n, e + c, t + c, r - s, o - s, i), n.stroke();
}
function ea({
  text: n,
  backgroundColor: e,
  textColor: t,
  fontSize: r,
  padding: o,
  borderRadius: i,
  borderWidth: a,
  borderColor: s,
  maxWidth: u
}) {
  try {
    const c = String(n || "안녕"), f = Math.max(Math.floor(r ?? 120), 40), d = Math.max(Math.floor(o ?? 30), 15), m = 512, h = 256, b = document.createElement("canvas");
    b.width = m, b.height = h;
    const y = b.getContext("2d", { alpha: !0 }) ?? b.getContext("2d");
    if (!y)
      return console.error("Cannot get 2D context"), null;
    y.clearRect(0, 0, m, h);
    const g = d, p = d, S = m - d * 2, v = h - d * 2;
    Qs(
      y,
      g,
      p,
      S,
      v,
      i ?? 80,
      e ?? "rgba(255, 255, 255, 0.95)",
      a ?? 12,
      s ?? "#000000"
    );
    const M = "Arial Black, Arial, sans-serif";
    y.fillStyle = t ?? "#000000", y.font = `bold ${f}px ${M}`, y.textAlign = "center", y.textBaseline = "middle";
    const T = Math.max(10, Math.min(S - d * 2, u)), C = y.measureText(c).width;
    if (C > T) {
      const R = T / C, B = Math.max(12, Math.floor(f * R));
      y.font = `bold ${B}px ${M}`;
    }
    y.fillText(c, m / 2, h / 2);
    const P = new w.CanvasTexture(b);
    return P.needsUpdate = !0, P.flipY = !0, P.generateMipmaps = !1, P.minFilter = w.LinearFilter, P.magFilter = w.LinearFilter, P.wrapS = w.ClampToEdgeWrapping, P.wrapT = w.ClampToEdgeWrapping, {
      texture: P,
      width: m,
      height: h,
      cleanup: () => {
        try {
          P.dispose();
        } catch (R) {
          console.warn("Error disposing texture:", R);
        }
      }
    };
  } catch (c) {
    return console.error("Error creating text texture:", c), null;
  }
}
function Ko({
  text: n,
  position: e = new w.Vector3(0, 2, 0),
  offset: t,
  backgroundColor: r,
  textColor: o,
  fontSize: i,
  padding: a,
  borderRadius: s,
  borderWidth: u,
  borderColor: c,
  maxWidth: f,
  visible: d = !0,
  opacity: m = 1,
  children: h
}) {
  const { camera: b } = Ze(), y = N(0), g = N(0), p = zs((k) => k.config.speechBalloon), S = t || new w.Vector3(p.defaultOffset.x, p.defaultOffset.y, p.defaultOffset.z), v = Ks({
    playerPosition: e,
    offset: S
  }), [M, T] = Ce.useState(null), C = N(null);
  Ce.useEffect(() => {
    if (C.current?.cleanup && (C.current.cleanup(), C.current = null), !d || !p.enabled) {
      T(null);
      return;
    }
    const k = n && n.trim().length > 0 ? n.trim() : "안녕", R = ea({
      text: k,
      backgroundColor: r ?? p.backgroundColor,
      textColor: o ?? p.textColor,
      fontSize: i ?? p.fontSize,
      padding: a ?? p.padding,
      borderRadius: s ?? p.borderRadius,
      borderWidth: u ?? p.borderWidth,
      borderColor: c ?? p.borderColor,
      maxWidth: f ?? p.maxWidth
    });
    return R && (C.current = R, T(R)), () => {
      C.current?.cleanup && (C.current.cleanup(), C.current = null);
    };
  }, [
    n,
    r ?? p.backgroundColor,
    o ?? p.textColor,
    i ?? p.fontSize,
    a ?? p.padding,
    s ?? p.borderRadius,
    u ?? p.borderWidth,
    c ?? p.borderColor,
    f ?? p.maxWidth,
    d,
    p.enabled
  ]);
  const P = F(() => M?.texture ? new w.SpriteMaterial({
    map: M.texture,
    transparent: !0,
    opacity: Math.max(0, Math.min(1, m || 1)),
    depthTest: !1,
    // 항상 보이도록
    depthWrite: !1,
    alphaTest: 0.1
  }) : null, [M, m]);
  return Ce.useEffect(() => {
    if (v.current && M) {
      const k = p.scaleMultiplier;
      v.current.scale.set(k * 2, k, 1), y.current = 0;
    }
  }, [M, p.scaleMultiplier]), de(() => {
    if (!(!v.current || !M || !d) && (g.current++, !(g.current < 30))) {
      g.current = 0;
      try {
        const k = v.current.position, R = b.position.distanceTo(k);
        if (Math.abs(R - y.current) > 5) {
          const E = p.scaleMultiplier;
          v.current.scale.set(E * 2, E, 1), y.current = R;
        }
      } catch (k) {
        console.warn("Error in sprite scaling:", k);
      }
    }
  }), L(() => () => {
    P && P.dispose();
  }, [P]), !d || !M?.texture || !P ? null : /* @__PURE__ */ x("group", { children: [
    /* @__PURE__ */ l(
      "sprite",
      {
        ref: v,
        material: P,
        renderOrder: 1e3,
        frustumCulled: !1
      }
    ),
    h
  ] });
}
let ta = 0;
const Sr = xe((n, e) => ({
  toasts: [],
  push: (t) => {
    const r = ++ta, o = {
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
  return Sr.getState().push({
    kind: n,
    text: e,
    ...t?.icon ? { icon: t.icon } : {},
    ...t?.durationMs !== void 0 ? { durationMs: t.durationMs } : {}
  });
}
const na = {
  info: { bg: "rgba(20,30,50,0.55)", ring: "#7aa6ff", icon: "i" },
  success: { bg: "rgba(20,40,30,0.55)", ring: "#7adf90", icon: "+" },
  warn: { bg: "rgba(50,40,20,0.55)", ring: "#ffd84a", icon: "!" },
  error: { bg: "rgba(50,20,20,0.55)", ring: "#ff7a7a", icon: "x" },
  reward: { bg: "rgba(40,30,10,0.55)", ring: "#ffc24a", icon: "*" },
  mail: { bg: "rgba(30,20,40,0.55)", ring: "#cf9aff", icon: "M" }
};
function Gf({ position: n = "top-right", max: e = 5 }) {
  const t = Sr((a) => a.toasts), r = Sr((a) => a.dismiss);
  L(() => {
    if (!t.length) return;
    const a = t.map(
      (s) => window.setTimeout(() => r(s.id), Math.max(500, s.durationMs))
    );
    return () => {
      a.forEach((s) => window.clearTimeout(s));
    };
  }, [t, r]);
  const o = n === "top-center" ? { top: 64, left: "50%", transform: "translateX(-50%)" } : { top: 64, right: 12 }, i = t.slice(-e);
  return /* @__PURE__ */ x(
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
        i.map((a) => {
          const s = na[a.kind];
          return /* @__PURE__ */ x(
            "div",
            {
              style: {
                minWidth: 220,
                maxWidth: 360,
                padding: "9px 14px",
                borderRadius: 12,
                background: s.bg,
                color: "#f3f4f8",
                fontFamily: "'Pretendard', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: `1px solid ${s.ring}55`,
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
                      background: s.ring,
                      color: "#1a1a1a",
                      fontWeight: 700
                    },
                    children: a.icon ?? s.icon
                  }
                ),
                /* @__PURE__ */ l("span", { children: a.text })
              ]
            },
            a.id
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
function ra() {
  const n = Ze((r) => r.gl), e = pe((r) => r.setPerformance), t = N(0);
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
function oa({ children: n, showGrid: e, showAxes: t }) {
  return /* @__PURE__ */ x("group", { name: "gaesup-world", children: [
    e && /* @__PURE__ */ l("gridHelper", { args: [100, 100, "#888888", "#444444"] }),
    t && /* @__PURE__ */ l("axesHelper", { args: [10] }),
    n
  ] });
}
function ia(n) {
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
const sa = ia;
function aa({ children: n, showGrid: e, showAxes: t }) {
  return /* @__PURE__ */ x(Je, { fallback: null, children: [
    /* @__PURE__ */ l(qi, {}),
    /* @__PURE__ */ l(ra, {}),
    /* @__PURE__ */ l(oa, { showGrid: e ?? !1, showAxes: t ?? !1, children: n })
  ] });
}
function la({
  type: n = "normal",
  text: e,
  position: t,
  children: r,
  interactive: o = !0,
  showMinimap: i = !0
}) {
  const a = N(null), s = Yi(), u = F(() => `world-prop-${Date.now()}-${Math.random()}`, []), c = N({
    center: new w.Vector3(),
    size: new w.Vector3(),
    positionAdd: new w.Vector3()
  });
  return L(() => {
    if (!i || !a.current) return;
    const f = Ee.getInstance(), m = setTimeout(() => {
      const h = a.current;
      if (!h) return;
      const b = new w.Box3();
      if (b.setFromObject(h), !b.isEmpty()) {
        const { center: y, size: g, positionAdd: p } = c.current;
        b.getCenter(y), b.getSize(g), t && (p.set(t[0], t[1], t[2]), y.add(p)), f.addMarker(
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
      clearTimeout(m), f.removeMarker(u);
    };
  }, [t, n, e, i, u]), /* @__PURE__ */ x(
    "group",
    {
      ref: a,
      ...t ? { position: t } : {},
      onClick: (f) => {
        o && (f.stopPropagation(), s.onClick(f));
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
class ca {
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
let _n = null;
function Me() {
  return _n || (_n = new ca()), _n;
}
const Pn = 20, Rn = 5;
function Nn(n) {
  return Array.from({ length: n }, () => null);
}
function to(n) {
  return Array.from({ length: n }, (e, t) => t);
}
function no(n) {
  const e = Me().get(n);
  return e && e.stackable ? Math.max(1, e.maxStack) : 1;
}
const ae = xe((n, e) => ({
  size: Pn,
  slots: Nn(Pn),
  hotbar: to(Rn),
  equippedHotbar: 0,
  add: (t, r = 1) => {
    if (r <= 0) return 0;
    const o = no(t), i = e().slots.slice();
    let a = r;
    if (o > 1)
      for (let s = 0; s < i.length && a > 0; s++) {
        const u = i[s];
        if (u && u.itemId === t && u.count < o) {
          const c = o - u.count, f = Math.min(c, a);
          i[s] = { ...u, count: u.count + f }, a -= f;
        }
      }
    for (let s = 0; s < i.length && a > 0; s++)
      if (i[s] === null) {
        const u = Math.min(o, a);
        i[s] = { itemId: t, count: u }, a -= u;
      }
    return n({ slots: i }), a;
  },
  remove: (t, r = 1) => {
    const o = e().slots.slice(), i = o[t];
    return !i || r <= 0 ? !1 : (i.count <= r ? o[t] = null : o[t] = { ...i, count: i.count - r }, n({ slots: o }), !0);
  },
  removeById: (t, r = 1) => {
    if (r <= 0) return 0;
    const o = e().slots.slice();
    let i = r;
    for (let a = 0; a < o.length && i > 0; a++) {
      const s = o[a];
      if (!s || s.itemId !== t) continue;
      const u = Math.min(s.count, i);
      s.count <= u ? o[a] = null : o[a] = { ...s, count: s.count - u }, i -= u;
    }
    return n({ slots: o }), r - i;
  },
  move: (t, r) => {
    const o = e().slots.slice();
    if (t < 0 || r < 0 || t >= o.length || r >= o.length) return;
    const i = o[t], a = o[r];
    if (i && a && i.itemId === a.itemId) {
      const s = no(i.itemId);
      if (s > 1) {
        const u = s - a.count;
        if (u > 0) {
          const c = Math.min(u, i.count);
          o[r] = { ...a, count: a.count + c }, i.count - c <= 0 ? o[t] = null : o[t] = { ...i, count: i.count - c }, n({ slots: o });
          return;
        }
      }
    }
    o[t] = a ?? null, o[r] = i ?? null, n({ slots: o });
  },
  clear: () => n({ slots: Nn(e().size) }),
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
    const r = Array.isArray(t.slots) ? t.slots.length : Pn, o = Array.isArray(t.slots) ? t.slots.map((s) => s && typeof s == "object" && s.itemId ? { ...s } : null) : Nn(r), i = Array.isArray(t.hotbar) ? t.hotbar.slice(0, Rn) : to(Rn), a = typeof t.equippedHotbar == "number" ? Math.max(0, Math.min(i.length - 1, t.equippedHotbar)) : 0;
    n({ size: r, slots: o, hotbar: i, equippedHotbar: a });
  }
}));
class ua {
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
let En = null;
function Jo() {
  return En || (En = new ua()), En;
}
function vt(n, e, t = !0) {
  L(() => t ? Jo().on(n, e) : void 0, [n, e, t]);
}
function Of() {
  const n = ae((t) => t.getEquipped());
  return n ? Me().get(n.itemId)?.toolKind ?? null : null;
}
function Uf({
  position: n,
  rotationY: e = 0,
  hp: t = 3,
  woodDrop: r = 2,
  regrowMinutes: o = 1440,
  hitRange: i = 1.6,
  trunkColor: a = "#6b4a2a",
  foliageColor: s = "#3f8a3a",
  scale: u = 1
}) {
  const c = N(null), [f, d] = Y(t), [m, h] = Y(!1), b = N(0), y = N(-1 / 0), g = V((C) => {
    if (m) return;
    const P = C.origin[0] - n[0], k = C.origin[2] - n[2], R = P * P + k * k, B = i + C.range * 0.5;
    if (!(R > B * B))
      return y.current = performance.now(), d((E) => {
        const _ = E - 1;
        return _ <= 0 ? (ae.getState().add("wood", r) > 0 ? fe("warn", "인벤토리가 가득 찼습니다") : fe("reward", `목재 +${r}`), h(!0), b.current = be.getState().totalMinutes + o, t) : _;
      }), !0;
  }, [m, n, i, r, o, t]);
  vt("axe", g), L(() => m ? be.subscribe((P, k) => {
    P.totalMinutes !== k.totalMinutes && P.totalMinutes >= b.current && (h(!1), d(t));
  }) : void 0, [m, t]), de((C, P) => {
    const k = c.current;
    if (!k) return;
    const R = (performance.now() - y.current) / 1e3;
    if (R < 0.4) {
      const B = R / 0.4, E = Math.sin(B * Math.PI * 6) * (1 - B) * 0.18;
      k.rotation.z = E;
    } else Math.abs(k.rotation.z) > 1e-4 && (k.rotation.z *= Math.max(0, 1 - P * 12));
  });
  const p = f < t, S = 1.6 * u, v = 0.18 * u, M = 0.95 * u, T = F(() => {
    const C = new w.Color(s);
    return p && C.lerp(new w.Color("#a55"), 0.06 * (t - f)), C;
  }, [s, p, t, f]);
  return m ? /* @__PURE__ */ l("group", { position: n, rotation: [0, e, 0], children: /* @__PURE__ */ x("mesh", { castShadow: !0, receiveShadow: !0, position: [0, 0.18 * u, 0], children: [
    /* @__PURE__ */ l("cylinderGeometry", { args: [v, v * 1.15, 0.36 * u, 12] }),
    /* @__PURE__ */ l("meshToonMaterial", { color: a })
  ] }) }) : /* @__PURE__ */ x("group", { ref: c, position: n, rotation: [0, e, 0], children: [
    /* @__PURE__ */ x("mesh", { castShadow: !0, receiveShadow: !0, position: [0, S * 0.5, 0], children: [
      /* @__PURE__ */ l("cylinderGeometry", { args: [v * 0.85, v, S, 12] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: a })
    ] }),
    /* @__PURE__ */ x("mesh", { castShadow: !0, position: [0, S + M * 0.6, 0], children: [
      /* @__PURE__ */ l("coneGeometry", { args: [M, M * 1.6, 14] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: T })
    ] }),
    /* @__PURE__ */ x("mesh", { castShadow: !0, position: [0, S + M * 1.5, 0], children: [
      /* @__PURE__ */ l("coneGeometry", { args: [M * 0.75, M * 1.2, 14] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: T })
    ] })
  ] });
}
function da(n, e) {
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
function ro(n, e) {
  return n.triggers.length ? n.triggers.some((t) => da(t, e)) : !1;
}
class fa {
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
      ro(r, e) && t.push(r.id);
    return t;
  }
  resolveTags(e) {
    const t = /* @__PURE__ */ new Set();
    for (const r of this.defs.values())
      if (ro(r, e))
        for (const o of r.tags ?? []) t.add(o);
    return t;
  }
}
let zn = null;
function Br() {
  return zn || (zn = new fa()), zn;
}
const Mn = xe((n, e) => ({
  active: [],
  startedAt: {},
  tags: /* @__PURE__ */ new Set(),
  refresh: (t) => {
    const r = Br(), o = r.resolveActive(t), i = e().active, a = new Set(o), s = new Set(i), u = o.filter((d) => !s.has(d)), c = i.filter((d) => !a.has(d)), f = { ...e().startedAt };
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
})), pa = [
  { itemId: "fish-bass", weight: 60 },
  { itemId: "fish-tuna", weight: 25 },
  { itemId: "fish-koi", weight: 10 }
];
function ma(n, e, t) {
  const r = [];
  for (const a of t) a.startsWith(e) && r.push(a.slice(e.length));
  if (r.length === 0) return n;
  const o = new Set(r), i = n.filter((a) => o.has(a.itemId));
  return i.length > 0 ? i : n;
}
function ha(n) {
  if (n.length === 0) return null;
  const e = n.reduce((r, o) => r + Math.max(0, o.weight), 0);
  if (e <= 0) return null;
  let t = Math.random() * e;
  for (const r of n)
    if (t -= Math.max(0, r.weight), t <= 0) return r.itemId;
  return n[n.length - 1].itemId;
}
function Wf({
  position: n,
  radius: e = 3,
  pool: t = pa,
  cooldownMs: r = 600,
  successChance: o = 0.6,
  showRipple: i = !0,
  rippleColor: a = "#9ad9ff"
}) {
  const s = N(-1 / 0), u = N(null), c = N(-1 / 0), f = V((d) => {
    const m = d.origin[0] - n[0], h = d.origin[2] - n[2];
    if (m * m + h * h > e * e) return;
    const b = performance.now();
    if (b - s.current < r) return !0;
    s.current = b, c.current = b;
    const y = De.getState().fishingBonus();
    if (Math.random() > Math.min(0.95, o + y))
      return fe("warn", "놓쳤다…"), !0;
    const g = ma(t, "fish:", Mn.getState().tags), p = ha(g);
    if (!p) return !0;
    const S = Me().get(p);
    return ae.getState().add(p, 1) > 0 ? fe("warn", "인벤토리가 가득 찼습니다") : fe("reward", `${S?.name ?? p} 낚음!`), !0;
  }, [n, e, r, t, o]);
  return vt("rod", f), de(() => {
    const d = u.current;
    if (!d) return;
    const m = (performance.now() - c.current) / 1e3;
    if (m < 0.6) {
      const h = m / 0.6;
      d.scale.setScalar(0.4 + h * 1.4);
      const b = d.material;
      b.opacity = 0.55 * (1 - h);
    } else
      d.scale.setScalar(0);
  }), /* @__PURE__ */ l("group", { position: n, children: i && /* @__PURE__ */ x("mesh", { ref: u, rotation: [-Math.PI / 2, 0, 0], position: [0, 0.04, 0], children: [
    /* @__PURE__ */ l("ringGeometry", { args: [0.4, 0.6, 32] }),
    /* @__PURE__ */ l("meshBasicMaterial", { color: a, transparent: !0, opacity: 0, depthWrite: !1 })
  ] }) });
}
const ga = [
  { itemId: "bug-butterfly", weight: 70 },
  { itemId: "bug-beetle", weight: 22 },
  { itemId: "bug-stag", weight: 8 }
];
function ya(n, e, t) {
  const r = [];
  for (const a of t) a.startsWith(e) && r.push(a.slice(e.length));
  if (r.length === 0) return n;
  const o = new Set(r), i = n.filter((a) => o.has(a.itemId));
  return i.length > 0 ? i : n;
}
function ba(n) {
  if (n.length === 0) return null;
  const e = n.reduce((r, o) => r + Math.max(0, o.weight), 0);
  if (e <= 0) return null;
  let t = Math.random() * e;
  for (const r of n)
    if (t -= Math.max(0, r.weight), t <= 0) return r.itemId;
  return n[n.length - 1].itemId;
}
function Hf({
  position: n,
  radius: e = 2.4,
  pool: t = ga,
  cooldownMs: r = 600,
  successChance: o = 0.7,
  bugColor: i = "#ffd0e0",
  hoverHeight: a = 1.2
}) {
  const s = N(-1 / 0), u = N(null), [c, f] = Y(!0), d = N(-1 / 0), m = V((h) => {
    if (!c) return;
    const b = h.origin[0] - n[0], y = h.origin[2] - n[2];
    if (b * b + y * y > e * e) return;
    const g = performance.now();
    if (g - s.current < r) return !0;
    s.current = g;
    const p = De.getState().bugBonus();
    if (Math.random() > Math.min(0.95, Math.max(0.05, o + p)))
      return fe("warn", "날아갔다…"), f(!1), d.current = g + 8e3, !0;
    const S = ya(t, "bug:", Mn.getState().tags), v = ba(S);
    if (!v) return !0;
    const M = Me().get(v);
    return ae.getState().add(v, 1) > 0 ? fe("warn", "인벤토리가 가득 찼습니다") : fe("reward", `${M?.name ?? v} 잡았다!`), f(!1), d.current = g + 12e3, !0;
  }, [n, e, r, t, o, c]);
  return vt("net", m), de(({ clock: h }) => {
    const b = performance.now();
    !c && b >= d.current && f(!0);
    const y = u.current;
    if (!y || !c) return;
    const g = h.elapsedTime;
    y.position.x = Math.sin(g * 1.2) * 0.6, y.position.z = Math.cos(g * 0.9) * 0.6, y.position.y = a + Math.sin(g * 2.6) * 0.15, y.rotation.y = g * 1.4;
  }), c ? /* @__PURE__ */ l("group", { position: n, children: /* @__PURE__ */ x("mesh", { ref: u, children: [
    /* @__PURE__ */ l("sphereGeometry", { args: [0.12, 10, 10] }),
    /* @__PURE__ */ l("meshToonMaterial", { color: i })
  ] }) }) : /* @__PURE__ */ l("group", { position: n });
}
const va = (n) => typeof n != "object" || n === null ? !1 : "text" in n && typeof n.text == "function";
class Qo {
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
          const a = JSON.parse(i);
          this.handleServerMessage(a);
        } catch {
          this.onError?.("서버 메시지 파싱 실패");
        }
      }, o = t.data;
      if (typeof o == "string") {
        r(o);
        return;
      }
      if (va(o)) {
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
class xa {
  lastPosition = new w.Vector3();
  lastRotation = new w.Quaternion();
  lastAnimation = "idle";
  velocity = new w.Vector3();
  lastUpdateTime = 0;
  config;
  tempPos = new w.Vector3();
  tempRot = new w.Quaternion();
  tempSendRot = new w.Quaternion();
  tempEuler = new w.Euler();
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
    const a = Date.now();
    if (a - this.lastUpdateTime < this.config.sendRateLimit)
      return null;
    const s = e.current.translation(), u = e.current.rotation();
    this.tempPos.set(s.x, s.y, s.z), this.tempRot.set(u.x, u.y, u.z, u.w);
    const c = e.current.linvel();
    if (c)
      this.velocity.set(c.x, c.y, c.z);
    else {
      const P = (a - this.lastUpdateTime) / 1e3;
      P > 0 && this.velocity.set(
        (s.x - this.lastPosition.x) / P,
        (s.y - this.lastPosition.y) / P,
        (s.z - this.lastPosition.z) / P
      );
    }
    const f = this.velocity.length(), d = typeof i == "string" ? i.trim() : "", m = this.config.velocityThreshold, h = this.config.velocityThreshold * 0.6, b = this.lastAnimation === "run" ? f < h ? "idle" : "run" : f > m ? "run" : "idle", y = d.length > 0 ? d : b;
    this.tempSendRot.copy(this.tempRot);
    const g = this.velocity.x, p = this.velocity.z;
    if (Math.hypot(g, p) > 0.05) {
      this.baseYaw === null && (this.tempEuler.setFromQuaternion(this.tempRot, "YXZ"), this.baseYaw = this.tempEuler.y + Math.PI);
      const P = Math.atan2(g, p) + (this.baseYaw ?? 0);
      this.tempEuler.set(0, P, 0, "YXZ"), this.tempSendRot.setFromEuler(this.tempEuler);
    }
    const v = !this.lastPosition.equals(this.tempPos), M = !this.lastRotation.equals(this.tempSendRot), T = this.lastAnimation !== y;
    if (!v && !M && !T)
      return null;
    const C = this.scratchUpdate;
    return C.name = t, C.color = r, C.position[0] = s.x, C.position[1] = s.y, C.position[2] = s.z, C.rotation[0] = this.tempSendRot.w, C.rotation[1] = this.tempSendRot.x, C.rotation[2] = this.tempSendRot.y, C.rotation[3] = this.tempSendRot.z, C.animation = y, C.velocity[0] = this.velocity.x, C.velocity[1] = this.velocity.y, C.velocity[2] = this.velocity.z, C.modelUrl = o, this.lastPosition.copy(this.tempPos), this.lastRotation.copy(this.tempSendRot), this.lastAnimation = y, this.lastUpdateTime = a, C;
  }
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
  reset() {
    this.lastPosition.set(0, 0, 0), this.lastRotation.set(0, 0, 0, 1), this.lastAnimation = "idle", this.velocity.set(0, 0, 0), this.lastUpdateTime = 0, this.baseYaw = null;
  }
}
function Cn(n = {}) {
  const {
    systemId: e = "main",
    config: t,
    enableAutoUpdate: r = !0
  } = n, o = N(null), [i, a] = Y(null), [s, u] = Y(!1);
  L(() => {
    o.current || (o.current = Uo.getOrCreate("networks"));
    const b = o.current;
    return b ? (e === "main" ? b.ensureMainEngine() : b.getEngine(e) || b.register(e), t && Object.keys(t).length > 0 && b.execute(e, { type: "updateConfig", data: { config: t } }), a(b), u(!0), () => {
    }) : (a(null), u(!1), () => {
    });
  }, [e, t]), de((b, y) => {
    r && o.current && s && o.current.updateSystem(e, y);
  });
  const c = V((b) => {
    o.current && s && o.current.execute(e, b);
  }, [e, s]), f = V(() => o.current && s ? o.current.snapshot(e) : null, [e, s]), d = V(() => o.current && s ? o.current.getNetworkStats(e) : null, [e, s]), m = V(() => o.current && s ? o.current.getSystemState(e) : null, [e, s]), h = V((b) => {
    o.current && s && o.current.updateSystem(e, b);
  }, [e, s]);
  return {
    bridge: i,
    executeCommand: c,
    getSnapshot: f,
    getNetworkStats: d,
    getSystemState: m,
    updateSystem: h,
    isReady: s
  };
}
function jf(n) {
  const { npcId: e, initialOptions: t, ...r } = n, {
    executeCommand: o,
    getSnapshot: i,
    isReady: a
  } = Cn(r), s = N(!1), u = N(null), c = N(/* @__PURE__ */ new Set());
  L(() => (a && t && !s.current && f(t), () => {
    s.current && d();
  }), [a, t]);
  const f = V((p) => {
    !a || s.current || (o({
      type: "registerNPC",
      npcId: e,
      position: p.position,
      ...p.connectionRange !== void 0 ? { options: { communicationRange: p.connectionRange } } : {}
    }), s.current = !0, u.current = p.position.clone(), p.autoConnect);
  }, [a, o, e]), d = V(() => {
    !a || !s.current || (o({
      type: "unregisterNPC",
      npcId: e
    }), s.current = !1, u.current = null, c.current.clear());
  }, [a, o, e]), m = V((p) => {
    !a || !s.current || (o({
      type: "updateNPCPosition",
      npcId: e,
      position: p
    }), u.current = p.clone());
  }, [a, o, e]), h = V((p, S) => {
    !a || !s.current || (o({
      type: "connect",
      npcId: e,
      targetId: p
    }), c.current.add(p));
  }, [a, o, e]), b = V((p) => {
    !a || !s.current || (o({
      type: "disconnect",
      npcId: e,
      targetId: p
    }), c.current.delete(p));
  }, [a, o, e]), y = V(() => Array.from(c.current), []), g = V(() => u.current ? u.current.clone() : null, []);
  return {
    // NPC 관리
    registerNPC: f,
    unregisterNPC: d,
    updatePosition: m,
    // 연결 관리
    connectTo: h,
    disconnectFrom: b,
    // 상태 조회
    isRegistered: s.current,
    getConnections: y,
    getPosition: g,
    // 브릿지 기능
    executeCommand: o,
    getSnapshot: i,
    isReady: a
  };
}
function $f(n) {
  const { senderId: e, onMessageSent: t, ...r } = n, {
    executeCommand: o,
    isReady: i
  } = Cn(r), a = 500, [s, u] = Y([]), [c, f] = Y([]), [d, m] = Y([]), h = N(0), b = V((M, T, C = "chat", P) => {
    if (!i) return "";
    const k = `${e}-${++h.current}-${Date.now()}`, R = Date.now(), B = {
      id: k,
      from: e,
      to: M,
      type: C === "action" || C === "state" || C === "system" ? C : "chat",
      payload: T,
      priority: P?.priority ?? "normal",
      timestamp: R,
      reliability: P?.reliable ? "reliable" : "unreliable",
      ...P?.retries !== void 0 ? { retryCount: P.retries } : {}
    };
    return o({
      type: "sendMessage",
      message: B
    }), f((E) => {
      const _ = [...E, B];
      return _.length > a ? _.slice(-a) : _;
    }), t?.(B), k;
  }, [i, o, e, t]), y = V((M, T = "chat", C) => {
    if (!i) return "";
    const P = `${e}-broadcast-${++h.current}-${Date.now()}`, k = Date.now(), R = {
      id: P,
      from: e,
      type: T === "action" || T === "state" || T === "system" ? T : "chat",
      payload: M,
      priority: C?.priority ?? "normal",
      timestamp: k,
      reliability: C?.reliable ? "reliable" : "unreliable",
      ...C?.groupId ? { groupId: C.groupId } : {},
      ...C?.retries !== void 0 ? { retryCount: C.retries } : {}
    };
    o({
      type: "broadcast",
      message: R
    });
    const B = { ...R, to: "broadcast" };
    return f((E) => {
      const _ = [...E, B];
      return _.length > a ? _.slice(-a) : _;
    }), t?.(B), P;
  }, [i, o, e, t]), g = V(() => {
    u([]), f([]), m([]);
  }, []), p = V((M) => M ? [...s, ...c].filter(
    (T) => T.from === M || T.to === M || T.from === e && T.to === M || T.to === e && T.from === M
  ).sort((T, C) => T.timestamp - C.timestamp) : [...s, ...c].sort((T, C) => T.timestamp - C.timestamp), [s, c, e]), S = V((M) => [...s, ...c].find((T) => T.id === M) || null, [s, c]), v = V(() => ({
    totalSent: c.length,
    totalReceived: s.length,
    totalPending: d.length,
    averageLatency: 0
  }), [c, s, d]);
  return {
    sendMessage: b,
    broadcastMessage: y,
    receivedMessages: s,
    sentMessages: c,
    pendingMessages: d,
    clearMessages: g,
    getMessageHistory: p,
    getMessageById: S,
    getMessageStats: v,
    isReady: i
  };
}
function Vf(n) {
  const {
    npcId: e,
    onGroupJoined: t,
    onGroupLeft: r,
    onGroupMessage: o,
    onGroupMemberJoined: i,
    onGroupMemberLeft: a,
    ...s
  } = n, {
    executeCommand: u,
    getSystemState: c,
    isReady: f
  } = Cn(s), [d, m] = Y([]), [h, b] = Y([]), [y, g] = Y([]), [p, S] = Y(/* @__PURE__ */ new Map()), v = N(0), M = N(/* @__PURE__ */ new Map()), T = N(/* @__PURE__ */ new Set()), C = N([]);
  C.current = d;
  const P = N(/* @__PURE__ */ new Set()), k = N(""), R = N(null), B = 2e3, E = 500;
  L(() => {
    if (!f) return;
    const Z = `node_${e}`, O = setInterval(() => {
      const Q = c();
      if (!Q) return;
      const J = Array.from(Q.groups.values()), te = J.map((le) => `${le.id}:${le.members.size}:${le.lastActivity}`).join("|");
      if (te !== k.current) {
        k.current = te, g(J);
        const le = J.filter((q) => q.members.has(Z)).map((q) => q.id);
        P.current.clear();
        for (const q of le) P.current.add(q);
        const we = C.current, oe = le.filter((q) => !we.includes(q)), K = we.filter((q) => !le.includes(q));
        if ((oe.length > 0 || K.length > 0) && (m(le), b(le), R.current = null, oe.forEach((q) => {
          const ce = J.find((ge) => ge.id === q);
          ce && t?.(q, ce);
        }), K.forEach((q) => r?.(q)), K.length > 0)) {
          for (const q of K)
            M.current.delete(q);
          S((q) => {
            const ce = new Map(q);
            for (const ge of K) ce.delete(ge);
            return ce;
          });
        }
        for (const q of J) {
          const ce = new Set(
            Array.from(q.members).map(
              (D) => D.startsWith("node_") ? D.slice(5) : D
            )
          ), ge = M.current.get(q.id);
          if (ge) {
            for (const D of ce)
              ge.has(D) || i?.(D, q.id);
            for (const D of ge)
              ce.has(D) || a?.(D, q.id);
          }
          M.current.set(q.id, ce);
        }
      }
      const ne = Q.messageQueues.get(Z) ?? [];
      if (ne.length === 0) return;
      const se = ne[ne.length - 1]?.id ?? null, re = R.current;
      if (re && re === se) return;
      let he = 0;
      if (re) {
        for (let le = ne.length - 1; le >= 0; le--)
          if (ne[le]?.id === re) {
            he = le + 1;
            break;
          }
      }
      R.current = se, !(he >= ne.length) && P.current.size !== 0 && S((le) => {
        const we = new Map(le), oe = /* @__PURE__ */ new Set();
        for (let K = he; K < ne.length; K++) {
          const q = ne[K];
          if (!q || q.to !== "group" || !q.groupId || !P.current.has(q.groupId) || T.current.has(q.id)) continue;
          if (T.current.size >= B) {
            const D = Array.from(T.current);
            T.current = new Set(D.slice(D.length - Math.floor(B / 2)));
          }
          T.current.add(q.id);
          const ce = we.get(q.groupId), ge = oe.has(q.groupId) ? ce ?? [] : ce ? ce.slice() : [];
          oe.has(q.groupId) || (oe.add(q.groupId), we.set(q.groupId, ge)), ge.push(q), o?.(q, q.groupId);
        }
        if (oe.size === 0) return le;
        for (const K of oe) {
          const q = we.get(K);
          q && q.length > E && we.set(K, q.slice(-E));
        }
        return we;
      });
    }, 250);
    return () => clearInterval(O);
  }, [f, c, e, t, r, o, i, a]);
  const _ = V((Z, O = [], Q) => {
    if (!f) return;
    const J = Date.now();
    u({
      type: "createGroup",
      group: {
        type: "party",
        members: /* @__PURE__ */ new Set(),
        maxMembers: Q?.maxSize ?? 20,
        range: 1e3,
        persistent: !1,
        createdAt: J,
        lastActivity: J
      }
    });
  }, [f, u, e]), z = V((Z) => {
    f && u({
      type: "joinGroup",
      npcId: e,
      groupId: Z
    });
  }, [f, u, e]), W = V((Z) => {
    f && u({
      type: "leaveGroup",
      npcId: e,
      groupId: Z
    });
  }, [f, u, e]), H = V((Z, O, Q = "chat") => {
    if (!f || !d.includes(Z)) return "";
    const J = `${e}-group-${++v.current}-${Date.now()}`, te = Date.now();
    return u({
      type: "sendMessage",
      message: {
        id: J,
        from: e,
        to: "group",
        groupId: Z,
        type: Q === "action" || Q === "state" || Q === "system" ? Q : "chat",
        payload: O,
        priority: "normal",
        timestamp: te,
        reliability: "reliable"
      }
    }), J;
  }, [f, u, e, d]), j = V((Z, O) => {
    if (!f || !h.includes(Z)) return;
    const Q = {
      id: `invite-${Date.now()}`,
      from: e,
      to: O,
      type: "system",
      payload: { groupId: Z, inviterId: e },
      priority: "normal",
      timestamp: Date.now(),
      reliability: "reliable"
    };
    u({
      type: "sendMessage",
      message: Q
    });
  }, [f, u, e, h]), A = V((Z, O) => {
    !f || !h.includes(Z) || u({
      type: "leaveGroup",
      npcId: O,
      groupId: Z
    });
  }, [f, u, h]), G = V((Z) => y.find((O) => O.id === Z) || null, [y]), $ = V((Z) => {
    const O = G(Z);
    return O ? Array.from(O.members).map(
      (Q) => Q.startsWith("node_") ? Q.slice(5) : Q
    ) : [];
  }, [G]), X = V((Z) => p.get(Z) || [], [p]);
  return {
    // 그룹 생성 및 관리
    createGroup: _,
    joinGroup: z,
    leaveGroup: W,
    // 그룹 메시지
    sendGroupMessage: H,
    // 그룹 멤버 관리
    inviteToGroup: j,
    kickFromGroup: A,
    // 그룹 상태
    joinedGroups: d,
    ownedGroups: h,
    availableGroups: y,
    // 그룹 정보 조회
    getGroupInfo: G,
    getGroupMembers: $,
    getGroupMessages: X,
    // 브릿지 기능
    isReady: f
  };
}
function qf(n = {}) {
  const {
    updateInterval: e = 1e3,
    enableRealTime: t = !0,
    trackHistory: r = !1,
    historyLength: o = 100,
    ...i
  } = n, {
    getSnapshot: a,
    getNetworkStats: s,
    getSystemState: u,
    isReady: c
  } = Cn(i), [f, d] = Y(null), [m, h] = Y([]), [b, y] = Y(!1), [g, p] = Y(0), S = V(() => {
    if (!c) return null;
    const C = a(), P = s(), k = u();
    if (!C || !P) return null;
    const R = C.nodeCount, B = C.connectionCount, E = P.totalMessages ?? 0, _ = B, z = 0, W = (B > 0, 100), H = C.messagesPerSecond, j = {
      updateTime: 0,
      messageProcessingTime: 0,
      connectionProcessingTime: 0
    }, A = k ? Array.from(k.groups.values()) : [], G = k ? k.groups.size : C.activeGroups, $ = G, X = G > 0 ? A.reduce((Z, O) => Z + O.members.size, 0) / G : 0;
    return {
      // 기본 통계
      totalNodes: R,
      totalConnections: B,
      totalMessages: E,
      averageLatency: C.averageLatency,
      messagesPerSecond: H,
      // 연결 통계
      activeConnections: _,
      failedConnections: z,
      connectionSuccessRate: W,
      // 메시지 통계
      sentMessages: E,
      receivedMessages: E,
      failedMessages: 0,
      messageSuccessRate: 100,
      // 성능 통계
      updateTime: j.updateTime,
      messageProcessingTime: j.messageProcessingTime,
      connectionProcessingTime: j.connectionProcessingTime,
      // 그룹 통계
      totalGroups: G,
      activeGroups: $,
      averageGroupSize: X
    };
  }, [c, a, s, u, e]), v = V(() => {
    y(!0);
    const C = S();
    C && (d(C), p(Date.now()), r && h((P) => {
      const k = [...P, C];
      return k.length > o ? k.slice(-o) : k;
    })), y(!1);
  }, [S, r, o]);
  L(() => {
    if (!t || !c) return;
    const C = setInterval(() => {
      v();
    }, e);
    return () => clearInterval(C);
  }, [t, c, v, e]), L(() => {
    c && v();
  }, [c, v]);
  const M = V((C) => m.length === 0 ? 0 : m.reduce((k, R) => k + R[C], 0) / m.length, [m]), T = V((C) => m.length === 0 ? 0 : Math.max(...m.map((P) => P[C])), [m]);
  return {
    // 현재 통계
    stats: f,
    // 기록된 통계
    statsHistory: r ? m : [],
    // 통계 조회
    refreshStats: v,
    getHistoricalAverage: M,
    getPeakValue: T,
    // 상태
    isLoading: b,
    lastUpdate: g,
    // 브릿지 기능
    isReady: c
  };
}
function Yf(n) {
  const [e, t] = Y(!1), [r, o] = Y(/* @__PURE__ */ new Map()), [i, a] = Y(), s = N(null), u = V((d) => {
    const m = { ...n, ...d };
    s.current && s.current.disconnect();
    const h = new Qo({
      url: m.url,
      roomId: m.roomId,
      playerName: m.playerName,
      playerColor: m.playerColor,
      onConnect: () => {
        t(!0), a(void 0);
      },
      onDisconnect: () => {
        t(!1), o(/* @__PURE__ */ new Map());
      },
      onPlayerJoin: (b, y) => {
        o((g) => {
          const p = new Map(g);
          return p.set(b, y), p;
        });
      },
      onPlayerUpdate: (b, y) => {
        o((g) => {
          const p = new Map(g);
          return p.set(b, y), p;
        });
      },
      onPlayerLeave: (b) => {
        o((y) => {
          const g = new Map(y);
          return g.delete(b), g;
        });
      },
      onError: (b) => {
        a(b);
      }
    });
    s.current = h, h.connect();
  }, [n]), c = V(() => {
    s.current?.disconnect(), t(!1), o(/* @__PURE__ */ new Map());
  }, []), f = V((d) => {
    s.current?.updateLocalPlayer(d);
  }, []);
  return L(() => () => {
    s.current?.disconnect(), s.current = null;
  }, []), {
    isConnected: e,
    players: r,
    error: i,
    connect: u,
    disconnect: c,
    updateLocalPlayer: f
  };
}
function Zf(n) {
  const { config: e, characterUrl: t, rigidBodyRef: r } = n, o = pe((E) => E.mode?.type ?? "character"), i = pe((E) => E.animationState), [a, s] = Y({
    isConnected: !1,
    connectionStatus: "disconnected",
    players: /* @__PURE__ */ new Map(),
    localPlayerId: null,
    roomId: null,
    error: null,
    ping: 0,
    lastUpdate: 0
  }), u = N(null), c = N(null), f = N(null), d = N(null), m = N(e), h = N(a), b = N(o), y = N(i);
  L(() => {
    h.current = a;
  }, [a]), L(() => {
    b.current = o;
  }, [o]), L(() => {
    y.current = i;
  }, [i]);
  const [g, p] = Y(
    () => /* @__PURE__ */ new Map()
  ), S = N(/* @__PURE__ */ new Map());
  L(() => {
    S.current = g;
  }, [g]), L(() => {
    r && (d.current = r);
  }, [r]), L(() => {
    const E = {
      updateRate: e.tracking.updateRate,
      velocityThreshold: e.tracking.velocityThreshold,
      sendRateLimit: e.tracking.sendRateLimit
    };
    f.current = new xa(E);
  }, [e.tracking]);
  const v = V((E) => {
    c.current && c.current.disconnect(), u.current = {
      playerName: E.playerName,
      playerColor: E.playerColor
    }, s((z) => ({
      ...z,
      connectionStatus: "connecting",
      error: null,
      roomId: E.roomId
    }));
    const _ = new Qo({
      url: e.websocket.url,
      roomId: E.roomId,
      playerName: E.playerName,
      playerColor: E.playerColor,
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
        s((z) => ({
          ...z,
          isConnected: !0,
          connectionStatus: "connected",
          error: null,
          lastUpdate: Date.now()
        }));
      },
      onWelcome: (z) => {
        s((W) => ({
          ...W,
          localPlayerId: z,
          lastUpdate: Date.now()
        }));
      },
      onDisconnect: () => {
        s((z) => ({
          ...z,
          isConnected: !1,
          connectionStatus: "disconnected",
          players: /* @__PURE__ */ new Map(),
          localPlayerId: null,
          lastUpdate: Date.now()
        }));
      },
      onPlayerJoin: (z, W) => {
        s((H) => {
          const j = new Map(H.players);
          return j.set(z, W), {
            ...H,
            players: j,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerUpdate: (z, W) => {
        s((H) => {
          const j = new Map(H.players);
          return j.set(z, W), {
            ...H,
            players: j,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerLeave: (z) => {
        s((W) => {
          const H = new Map(W.players);
          return H.delete(z), {
            ...W,
            players: H,
            lastUpdate: Date.now()
          };
        });
      },
      onChat: (z, W, H) => {
        p((A) => {
          const G = new Map(A);
          return G.set(z, { text: W, expiresAt: Date.now() + 2500 }), G;
        });
      },
      onPing: (z) => {
        s((W) => ({
          ...W,
          ping: z,
          lastUpdate: Date.now()
        }));
      },
      onError: (z) => {
        s((W) => ({
          ...W,
          connectionStatus: "error",
          error: z,
          lastUpdate: Date.now()
        }));
      }
    });
    c.current = _, _.connect();
  }, [
    e.websocket.url,
    e.websocket.reconnectAttempts,
    e.websocket.reconnectDelay,
    e.websocket.pingInterval,
    e.tracking.sendRateLimit,
    e.logLevel,
    e.logToConsole
  ]), M = V(() => {
    c.current?.disconnect(), f.current?.reset(), d.current = null, p(/* @__PURE__ */ new Map()), s((E) => ({
      ...E,
      isConnected: !1,
      connectionStatus: "disconnected",
      players: /* @__PURE__ */ new Map(),
      localPlayerId: null,
      roomId: null,
      error: null
    }));
  }, []), T = V((E) => {
    d.current = E;
  }, []), C = V(() => {
    d.current = null, f.current?.reset();
  }, []), P = V((E) => {
    m.current = { ...m.current, ...E }, E.tracking && f.current && f.current.updateConfig(E.tracking);
  }, []), k = V((E, _) => {
    const z = c.current;
    if (!z) return;
    const W = _?.range ?? m.current.proximityRange;
    z.sendChat(E, { range: W });
    const H = a.localPlayerId;
    if (!H) return;
    const j = _?.ttlMs ?? 2500, A = String(E ?? "").trim().slice(0, 200);
    A && p((G) => {
      const $ = new Map(G);
      return $.set(H, { text: A, expiresAt: Date.now() + j }), $;
    });
  }, [a.localPlayerId]);
  L(() => {
    if (!a.isConnected) return;
    const E = Math.max(15, Math.floor(1e3 / Math.max(1, m.current.tracking.updateRate))), _ = window.setInterval(() => {
      if (!h.current.isConnected || !c.current || !f.current || !d.current?.current || !u.current) return;
      const { playerName: W, playerColor: H } = u.current, j = b.current, A = y.current?.[j]?.current ?? "idle", G = f.current.trackPosition(
        d.current,
        W,
        H,
        t,
        A
      );
      if (G) {
        const { modelUrl: $, ...X } = G;
        c.current.updateLocalPlayer(
          $ ? { ...X, modelUrl: $ } : X
        );
      }
      if (S.current.size > 0) {
        const $ = Date.now(), X = [];
        if (S.current.forEach((Z, O) => {
          Z.expiresAt <= $ && X.push(O);
        }), X.length > 0) {
          const Z = new Map(S.current);
          for (const O of X) Z.delete(O);
          p(Z);
        }
      }
    }, E);
    return () => window.clearInterval(_);
  }, [a.isConnected, t]), L(() => () => {
    c.current?.disconnect();
  }, []);
  const R = F(() => {
    const E = /* @__PURE__ */ new Map();
    return g.forEach((_, z) => {
      E.set(z, _.text);
    }), E;
  }, [g]), B = a.localPlayerId ? g.get(a.localPlayerId)?.text ?? null : null;
  return {
    ...a,
    connect: v,
    disconnect: M,
    startTracking: T,
    stopTracking: C,
    updateConfig: P,
    sendChat: k,
    speechByPlayerId: R,
    localSpeechText: B
  };
}
const wa = (n, e, t) => n < e ? e : n > t ? t : n, Sa = (n) => wa(n, 0, 1), Ma = (n, e, t, r = 4) => {
  const o = Math.max(0, n), i = Math.max(0, e), a = Math.max(i + 1e-6, t), s = Math.max(0, r);
  return !Number.isFinite(o) || !Number.isFinite(i) || !Number.isFinite(a) || !Number.isFinite(s) ? s : Sa((o - i) / (a - i)) * s;
}, Ca = (n) => {
  const e = Math.max(0, n);
  return Number.isFinite(e) ? Math.exp(-e) : 0;
}, xt = (n, e, t, r = 4) => n <= e ? 1 : n >= t ? 0 : Ca(Ma(n, e, t, r));
function oo(n) {
  return "color" in n && n.color instanceof w.Color;
}
const ka = Ce.memo(function({ state: e, characterUrl: t, config: r, speechText: o }) {
  const i = N(null), a = N(null), s = N(null);
  s.current || (s.current = [e.position[0], e.position[1], e.position[2]]);
  const u = N(new w.Vector3()), c = N(new w.Quaternion()), f = N(new w.Vector3()), d = N(performance.now()), m = N(new w.Vector3()), h = N(new w.Quaternion()), b = N(new w.Vector3()), y = N(new w.Vector3()), g = N(new w.Vector3()), p = N(new w.Quaternion()), S = N(!1), v = N(new w.Vector3()), M = N(new w.Vector3()), T = N(new w.Vector3()), C = N(new w.Vector3()), P = N(new w.Vector3()), k = N(new w.Vector3()), R = N({ x: 0, y: 0, z: 0 }), B = N({ x: 0, y: 0, z: 0, w: 1 }), E = N(0), _ = N(0), z = t || e.modelUrl || "";
  if (!z) return null;
  const W = (oe) => {
    if (typeof oe != "string") return null;
    const K = oe.trim();
    if (!K) return null;
    const q = K.startsWith("#") ? K : `#${K}`;
    return /^#[0-9a-fA-F]{3}$/.test(q) || /^#[0-9a-fA-F]{6}$/.test(q) ? q : null;
  }, H = F(() => W(e.color), [e.color]), j = r?.tracking?.interpolationSpeed || 0.15, A = r?.rendering?.characterScale || 1, G = r?.rendering?.nameTagHeight || 3.5, $ = r?.rendering?.nameTagSize || 0.5, { scene: X, animations: Z } = Ho(z), O = F(() => jo.clone(X), [X]), { actions: Q, ref: J } = is(Z, a), te = N([]), ne = N(null), se = N(null), re = N(performance.now()), he = N(new w.Vector3());
  L(() => {
    for (const K of te.current)
      try {
        K.dispose();
      } catch {
      }
    if (te.current = [], !H) return;
    const oe = (K) => {
      if (!oo(K)) return K;
      const q = K.clone();
      return oo(q) ? (q.color.set(H), te.current.push(q), q) : K;
    };
    return O.traverse((K) => {
      (K instanceof w.Mesh || K instanceof w.SkinnedMesh) && K.material && (Array.isArray(K.material) ? K.material = K.material.map((q) => oe(q)) : K.material = oe(K.material));
    }), () => {
      for (const K of te.current)
        try {
          K.dispose();
        } catch {
        }
      te.current = [];
    };
  }, [O, H]);
  const le = (oe) => {
    if (!Q) return null;
    const K = Q[oe];
    if (K) return K;
    const q = oe.toLowerCase(), ce = Object.keys(Q), ge = ce.find((D) => D.toLowerCase().includes(q));
    if (ge) return Q[ge] ?? null;
    if (q === "run") {
      const D = ce.find((I) => I.toLowerCase().includes("walk")) ?? ce[0];
      return D ? Q[D] ?? null : null;
    }
    if (q === "idle") {
      const D = ce.find((I) => I.toLowerCase().includes("idle")) ?? ce[0];
      return D ? Q[D] ?? null : null;
    }
    return ce[0] ? Q[ce[0]] ?? null : null;
  }, we = (oe, K, q, ce, ge, D, I) => {
    const ye = Math.max(1e-4, ce), Re = Math.max(0, D), Ie = 2 / ye, ze = Ie * Re, An = 1 / (1 + ze + 0.48 * ze * ze + 0.235 * ze * ze * ze);
    T.current.copy(K), v.current.copy(oe).sub(K);
    const St = ge * ye, Xe = v.current.length();
    Xe > St && Xe > 0 && v.current.multiplyScalar(St / Xe), C.current.copy(oe).sub(v.current), M.current.copy(q).addScaledVector(v.current, Ie).multiplyScalar(Re), q.addScaledVector(M.current, -Ie).multiplyScalar(An), I.copy(v.current).add(M.current).multiplyScalar(An).add(C.current), P.current.copy(T.current).sub(oe), k.current.copy(I).sub(T.current), P.current.dot(k.current) > 0 && (I.copy(T.current), q.set(0, 0, 0));
  };
  return L(() => {
    if (!Q) return;
    const oe = r?.tracking?.velocityThreshold ?? 0.5, K = oe, q = oe * 0.6, ce = 180, ge = e.velocity ? Math.hypot(e.velocity[0], e.velocity[1], e.velocity[2]) : f.current.length(), D = e.animation?.trim(), I = (ne.current ?? "idle") === "run" ? ge < q ? "idle" : "run" : ge > K ? "run" : "idle", ye = (D && D.length > 0 ? D : I) || "idle";
    if (ne.current === ye) return;
    const Re = performance.now();
    if (Re - re.current < ce) return;
    const Ie = le(ye);
    if (!Ie) return;
    const ze = se.current;
    return Ie.enabled = !0, Ie.setEffectiveTimeScale(1), Ie.setEffectiveWeight(1), Ie.reset().play(), ze && ze !== Ie ? Ie.crossFadeFrom(ze, 0.18, !0) : Ie.fadeIn(0.18), ne.current = ye, se.current = Ie, re.current = Re, () => {
    };
  }, [Q, e.animation, e.velocity, r?.tracking?.velocityThreshold]), L(() => {
    if (d.current = performance.now(), u.current.set(
      e.position[0],
      e.position[1],
      e.position[2]
    ), he.current.set(e.position[0], e.position[1], e.position[2]), !S.current && i.current) {
      const ce = u.current;
      S.current = !0, y.current.copy(ce), g.current.set(0, 0, 0), p.current.copy(c.current);
      const ge = i.current, D = R.current;
      D.x = ce.x, D.y = ce.y, D.z = ce.z, ge.setNextKinematicTranslation(D);
      const I = B.current;
      I.x = c.current.x, I.y = c.current.y, I.z = c.current.z, I.w = c.current.w, ge.setNextKinematicRotation(I);
    }
    const oe = e.rotation, q = Math.abs(oe[0]) < 1e-6 && Math.abs(oe[1]) < 1e-6 && Math.abs(oe[2]) < 1e-6 && Math.abs(oe[3] - 1) < 1e-6 ? [1, 0, 0, 0] : oe;
    c.current.set(
      q[1],
      q[2],
      q[3],
      q[0]
    ), e.velocity && f.current.set(
      e.velocity[0],
      e.velocity[1],
      e.velocity[2]
    );
  }, [e.position, e.rotation, e.velocity]), de((oe, K) => {
    if (!i.current || !a.current) return;
    const q = _.current;
    if (q > 0) {
      if (E.current += Math.max(0, K), E.current < q) return;
      E.current = 0;
    } else
      E.current = 0;
    const ce = S.current ? y.current : u.current, ge = oe.camera.position.distanceTo(ce), D = S.current ? xt(ge, 25, 140, 4) : 1;
    _.current = D >= 0.7 ? 0 : D >= 0.4 ? 1 / 30 : D >= 0.2 ? 1 / 15 : 1 / 8;
    const I = (performance.now() - d.current) / 1e3, ye = Math.max(0, Math.min(0.12, I));
    if (b.current.copy(u.current).addScaledVector(f.current, ye), !S.current) {
      const Ct = i.current.translation(), pt = i.current.rotation();
      S.current = !0, y.current.set(Ct.x, Ct.y, Ct.z), g.current.set(0, 0, 0), p.current.set(pt.x, pt.y, pt.z, pt.w);
    }
    const Re = Math.max(0.01, Math.min(0.9, j)), Ie = Math.max(0.03, Math.min(0.22, 0.03 + (1 - Re) * 0.19)), ze = 120;
    if (y.current.distanceTo(b.current) > 10 || K > 0.25)
      y.current.copy(b.current), g.current.set(0, 0, 0), p.current.copy(c.current);
    else {
      we(
        y.current,
        b.current,
        g.current,
        Ie,
        ze,
        K,
        m.current
      ), y.current.copy(m.current);
      const Ct = Math.max(0.025, Ie * 0.7), pt = 1 - Math.exp(-Math.max(0, K) / Ct);
      h.current.copy(p.current).slerp(c.current, pt), p.current.copy(h.current);
    }
    he.current.copy(y.current);
    const St = i.current, Xe = R.current;
    Xe.x = y.current.x, Xe.y = y.current.y, Xe.z = y.current.z, St.setNextKinematicTranslation(Xe);
    const Mt = B.current;
    Mt.x = p.current.x, Mt.y = p.current.y, Mt.z = p.current.z, Mt.w = p.current.w, St.setNextKinematicRotation(Mt);
  }), /* @__PURE__ */ x("group", { children: [
    /* @__PURE__ */ x(
      Yt,
      {
        ref: i,
        type: "kinematicPosition",
        position: s.current ?? void 0,
        colliders: !1,
        children: [
          /* @__PURE__ */ l(ds, { args: [0.5, 0.5], position: [0, 1.5, 0] }),
          /* @__PURE__ */ l("group", { ref: a, children: /* @__PURE__ */ l("group", { ref: J, scale: [A, A, A], children: /* @__PURE__ */ l("primitive", { object: O }) }) }),
          /* @__PURE__ */ l(
            ss,
            {
              position: [0, G, 0],
              fontSize: $,
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
      Ko,
      {
        text: o,
        position: he.current
      }
    ) : null
  ] });
});
function Xf({ onConnect: n, error: e, isConnecting: t }) {
  const [r, o] = Y(""), [i, a] = Y("room1"), [s] = Y(() => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`);
  return /* @__PURE__ */ l("div", { style: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a1a1a"
  }, children: /* @__PURE__ */ x(
    "form",
    {
      onSubmit: (c) => {
        c.preventDefault(), r.trim() && n({
          roomId: i,
          playerName: r.trim(),
          playerColor: s
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
        /* @__PURE__ */ x("div", { style: { marginBottom: "15px" }, children: [
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
        /* @__PURE__ */ x("div", { style: { marginBottom: "20px" }, children: [
          /* @__PURE__ */ l("label", { style: { display: "block", marginBottom: "5px" }, children: "방 코드" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              placeholder: "방 코드",
              value: i,
              onChange: (c) => a(c.target.value),
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
        /* @__PURE__ */ x("div", { style: { marginBottom: "20px" }, children: [
          /* @__PURE__ */ l("label", { style: { display: "block", marginBottom: "5px" }, children: "플레이어 색상" }),
          /* @__PURE__ */ l(
            "div",
            {
              style: {
                width: "30px",
                height: "30px",
                backgroundColor: s,
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
function Kf({ state: n, playerName: e, onDisconnect: t, onSendChat: r }) {
  const { isConnected: o, connectionStatus: i, players: a, roomId: s, error: u, ping: c, localPlayerId: f, lastUpdate: d } = n, [m, h] = Y("");
  if (!o) return null;
  const b = V(() => {
    if (!r) return;
    const y = m.trim();
    y && (r(y), h(""));
  }, [r, m]);
  return /* @__PURE__ */ x("div", { style: {
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
    /* @__PURE__ */ x("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "상태:" }),
      /* @__PURE__ */ l("span", { style: {
        marginLeft: "8px",
        color: i === "connected" ? "#4CAF50" : "#ff6b6b"
      }, children: i === "connected" ? "연결됨" : i === "connecting" ? "연결 중" : i === "error" ? "오류" : "연결 끊김" })
    ] }),
    e && /* @__PURE__ */ x("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "플레이어:" }),
      " ",
      /* @__PURE__ */ l("span", { style: { marginLeft: "8px" }, children: e })
    ] }),
    s && /* @__PURE__ */ x("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "방:" }),
      " ",
      /* @__PURE__ */ l("span", { style: { marginLeft: "8px" }, children: s })
    ] }),
    f && /* @__PURE__ */ x("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "내 ID:" }),
      " ",
      /* @__PURE__ */ l("span", { style: { marginLeft: "8px" }, children: f })
    ] }),
    /* @__PURE__ */ x("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "최근 업데이트:" }),
      /* @__PURE__ */ l("span", { style: { marginLeft: "8px" }, children: d ? `${Math.max(0, Date.now() - d)}ms 전` : "-" })
    ] }),
    /* @__PURE__ */ x("div", { style: { marginBottom: "6px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "접속자:" }),
      /* @__PURE__ */ x("span", { style: { marginLeft: "8px" }, children: [
        a.size + (o ? 1 : 0),
        "명"
      ] })
    ] }),
    c > 0 && /* @__PURE__ */ x("div", { style: { marginBottom: "8px", fontSize: "12px" }, children: [
      /* @__PURE__ */ l("strong", { children: "핑:" }),
      /* @__PURE__ */ x("span", { style: {
        marginLeft: "8px",
        color: c < 50 ? "#4CAF50" : c < 100 ? "#FFA726" : "#ff6b6b"
      }, children: [
        c,
        "ms"
      ] })
    ] }),
    a.size > 0 && /* @__PURE__ */ x("div", { style: { marginBottom: "8px" }, children: [
      /* @__PURE__ */ l("strong", { children: "다른 플레이어:" }),
      /* @__PURE__ */ l("div", { style: {
        marginTop: "6px",
        maxHeight: "80px",
        overflowY: "auto",
        fontSize: "11px"
      }, children: Array.from(a.entries()).map(([y, g]) => /* @__PURE__ */ x(
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
            /* @__PURE__ */ x("span", { style: { flex: 1 }, children: [
              g.name,
              /* @__PURE__ */ x("span", { style: { opacity: 0.7, marginLeft: "8px" }, children: [
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
    r ? /* @__PURE__ */ x("div", { style: { marginBottom: "8px" }, children: [
      /* @__PURE__ */ l("strong", { children: "채팅:" }),
      /* @__PURE__ */ x("div", { style: { display: "flex", gap: "6px", marginTop: "6px" }, children: [
        /* @__PURE__ */ l(
          "input",
          {
            value: m,
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
              y.key === "Enter" && (y.preventDefault(), b());
            }
          }
        ),
        /* @__PURE__ */ l(
          "button",
          {
            onClick: b,
            style: {
              padding: "6px 8px",
              borderRadius: "4px",
              border: "none",
              background: "#4CAF50",
              color: "white",
              fontSize: "12px",
              cursor: "pointer"
            },
            disabled: !m.trim(),
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
const Ia = 6, Aa = 1e-4;
function Ta({
  playerRef: n,
  onChange: e
}) {
  const t = N({ x: 0, y: 0, z: 0 }), r = N(0);
  return de(() => {
    if (r.current++, r.current % Ia !== 0) return;
    const o = n.current;
    if (!o) return;
    const i = o.translation(), a = t.current, s = i.x - a.x, u = i.y - a.y, c = i.z - a.z;
    s * s + u * u + c * c < Aa || (a.x = i.x, a.y = i.y, a.z = i.z, e(i.x, i.y, i.z));
  }), null;
}
const Jf = Ce.memo(function({
  players: e,
  characterUrl: t,
  vehicleUrl: r,
  airplaneUrl: o,
  playerRef: i,
  config: a,
  localPlayerColor: s,
  proximityRange: u,
  speechByPlayerId: c,
  localSpeechText: f
}) {
  L(() => {
    window.CHARACTER_URL = t;
  }, [t]);
  const [d, m] = Y([0, 0, 0]), h = F(() => new w.Vector3(), []), b = F(
    () => (g, p, S) => {
      h.set(g, p, S), m([g, p, S]);
    },
    [h]
  ), y = F(() => {
    const g = u;
    if (!g || g <= 0) return e;
    const [p, S, v] = d, M = /* @__PURE__ */ new Map();
    return e.forEach((T, C) => {
      const [P, k, R] = T.position, B = P - p, E = k - S, _ = R - v;
      B * B + E * E + _ * _ <= g * g && M.set(C, T);
    }), M;
  }, [e, u, d]);
  return /* @__PURE__ */ l(
    sa,
    {
      urls: {
        characterUrl: t,
        vehicleUrl: r,
        airplaneUrl: o
      },
      children: /* @__PURE__ */ x(
        rs,
        {
          shadows: !0,
          dpr: [1, 1.5],
          camera: { position: [0, 10, 20], fov: 75, near: 0.1, far: 1e3 },
          style: { width: "100vw", height: "100vh" },
          children: [
            /* @__PURE__ */ l(as, { background: !0, preset: "sunset", backgroundBlurriness: 1 }),
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
            /* @__PURE__ */ l(Je, { fallback: null, children: /* @__PURE__ */ l(aa, { children: /* @__PURE__ */ x(fs, { children: [
              /* @__PURE__ */ l(
                Ta,
                {
                  playerRef: i,
                  onChange: b
                }
              ),
              /* @__PURE__ */ l(
                Zi,
                {
                  rigidBodyRef: i,
                  rotation: ps({ x: 0, y: Math.PI, z: 0 }),
                  parts: [],
                  ...s ? { baseColor: s } : {}
                }
              ),
              f ? /* @__PURE__ */ l(
                Ko,
                {
                  text: f,
                  position: h
                }
              ) : null,
              Array.from(y.entries()).map(([g, p]) => /* @__PURE__ */ l(
                ka,
                {
                  playerId: g,
                  state: p,
                  characterUrl: t,
                  config: a,
                  ...(() => {
                    const S = c?.get(g);
                    return S ? { speechText: S } : {};
                  })()
                },
                g
              )),
              /* @__PURE__ */ l(
                ls,
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
              /* @__PURE__ */ l(Yt, { type: "fixed", children: /* @__PURE__ */ x("mesh", { receiveShadow: !0, position: [0, -1, 0], children: [
                /* @__PURE__ */ l("boxGeometry", { args: [1e3, 2, 1e3] }),
                /* @__PURE__ */ l("meshStandardMaterial", { color: "#3d3d3d" })
              ] }) }),
              /* @__PURE__ */ l(Xi, {}),
              /* @__PURE__ */ l(Ki, {})
            ] }) }) })
          ]
        }
      )
    }
  );
}), Qf = {
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
function _a() {
  return be((n) => n.time);
}
function ep() {
  return be((n) => ({ hour: n.time.hour, minute: n.time.minute }));
}
function tp(n = !0) {
  const e = be((r) => r.tick), t = N(0);
  L(() => {
    if (!n) return;
    let r = 0, o = !0;
    const i = (a) => {
      if (!o) return;
      const s = t.current || a, u = a - s;
      t.current = a, e(u), r = requestAnimationFrame(i);
    };
    return r = requestAnimationFrame(i), () => {
      o = !1, cancelAnimationFrame(r);
    };
  }, [n, e]);
}
function np(n) {
  const e = be((t) => t.addListener);
  L(() => e((t) => {
    t.kind === "newDay" && n(t.time);
  }), [e, n]);
}
function rp(n) {
  const e = be((t) => t.addListener);
  L(() => e((t) => {
    t.kind === "newHour" && n(t.time);
  }), [e, n]);
}
const Pa = {
  spring: "#ffb6c1",
  summer: "#9bd97a",
  autumn: "#e0a060",
  winter: "#cfe2ff"
}, Ra = {
  sun: "일",
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토"
};
function op() {
  const n = _a(), e = String(n.hour).padStart(2, "0"), t = String(n.minute).padStart(2, "0");
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
      children: /* @__PURE__ */ x("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ l(
          "span",
          {
            style: {
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: Pa[n.season] ?? "#fff"
            }
          }
        ),
        /* @__PURE__ */ x("span", { children: [
          "Y",
          n.year,
          " M",
          String(n.month).padStart(2, "0"),
          " D",
          String(n.day).padStart(2, "0"),
          " ",
          "(",
          Ra[n.weekday],
          ")"
        ] }),
        /* @__PURE__ */ x("span", { style: { opacity: 0.85 }, children: [
          e,
          ":",
          t
        ] })
      ] })
    }
  );
}
const Na = "gaesup-save", Ea = 1, cn = "slots";
function za() {
  return new Promise((n, e) => {
    if (typeof indexedDB > "u") {
      e(new Error("IndexedDB unavailable"));
      return;
    }
    const t = indexedDB.open(Na, Ea);
    t.onupgradeneeded = () => {
      const r = t.result;
      r.objectStoreNames.contains(cn) || r.createObjectStore(cn);
    }, t.onsuccess = () => n(t.result), t.onerror = () => e(t.error);
  });
}
function Xt(n, e) {
  return za().then(
    (t) => new Promise((r, o) => {
      const a = t.transaction(cn, n).objectStore(cn), s = e(a);
      if (s instanceof Promise) {
        s.then(r, o);
        return;
      }
      s.onsuccess = () => r(s.result), s.onerror = () => o(s.error);
    })
  );
}
class Ba {
  async read(e) {
    try {
      return await Xt("readonly", (r) => r.get(e)) ?? null;
    } catch {
      return null;
    }
  }
  async write(e, t) {
    await Xt("readwrite", (r) => r.put(t, e));
  }
  async list() {
    try {
      return (await Xt("readonly", (t) => t.getAllKeys())).map(String);
    } catch {
      return [];
    }
  }
  async remove(e) {
    try {
      await Xt("readwrite", (t) => t.delete(e));
    } catch {
    }
  }
}
const kt = "gaesup:save:";
function Kt(n, e) {
  try {
    return n();
  } catch {
    return e;
  }
}
class Da {
  async read(e) {
    return typeof localStorage > "u" ? null : Kt(() => {
      const t = localStorage.getItem(kt + e);
      return t ? JSON.parse(t) : null;
    }, null);
  }
  async write(e, t) {
    typeof localStorage > "u" || Kt(() => localStorage.setItem(kt + e, JSON.stringify(t)), void 0);
  }
  async list() {
    return typeof localStorage > "u" ? [] : Kt(() => {
      const e = [];
      for (let t = 0; t < localStorage.length; t++) {
        const r = localStorage.key(t);
        r && r.startsWith(kt) && e.push(r.slice(kt.length));
      }
      return e;
    }, []);
  }
  async remove(e) {
    typeof localStorage > "u" || Kt(() => localStorage.removeItem(kt + e), void 0);
  }
}
class Fa {
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
let Bn = null;
function La() {
  const n = typeof indexedDB < "u" ? new Ba() : new Da();
  return new Fa({ adapter: n, defaultSlot: "main", currentVersion: 1 });
}
function ei() {
  return Bn || (Bn = La()), Bn;
}
function ip({
  intervalMs: n = 5 * 60 * 1e3,
  slot: e,
  saveOnUnload: t = !0,
  saveOnVisibilityChange: r = !0
} = {}) {
  L(() => {
    const o = ei();
    let i = !1;
    const a = () => {
      i || o.save(e);
    }, s = window.setInterval(a, Math.max(1e3, n)), u = () => {
      o.save(e);
    }, c = () => {
      document.visibilityState === "hidden" && o.save(e);
    };
    return t && window.addEventListener("beforeunload", u), r && document.addEventListener("visibilitychange", c), () => {
      i = !0, window.clearInterval(s), t && window.removeEventListener("beforeunload", u), r && document.removeEventListener("visibilitychange", c);
    };
  }, [n, e, t, r]);
}
function sp(n, e) {
  L(() => {
    const t = ei();
    let r = !1;
    return t.load(n).then((o) => {
      !r && e && e(o);
    }), () => {
      r = !0;
    };
  }, [n, e]);
}
const Ga = [
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
function ap() {
  Me().registerAll(Ga);
}
function lp() {
  return ae((n) => ({
    slots: n.slots,
    add: n.add,
    remove: n.remove,
    removeById: n.removeById,
    move: n.move,
    countOf: n.countOf,
    has: n.has
  }));
}
function cp() {
  return ae((n) => {
    const e = n.hotbar[n.equippedHotbar];
    return e == null ? null : n.slots[e] ?? null;
  });
}
function Oa() {
  const n = ae((o) => o.hotbar), e = ae((o) => o.slots), t = ae((o) => o.equippedHotbar), r = ae((o) => o.setEquippedHotbar);
  return {
    hotbar: n,
    slots: n.map((o) => e[o] ?? null),
    equipped: t,
    setEquipped: r
  };
}
function up(n = !0) {
  const e = ae((o) => o.setEquippedHotbar), t = ae((o) => o.equippedHotbar), r = ae((o) => o.hotbar);
  L(() => {
    if (!n) return;
    const o = (i) => {
      const a = i.target?.tagName?.toLowerCase();
      if (a === "input" || a === "textarea") return;
      const s = Number(i.key);
      if (Number.isInteger(s) && s >= 1 && s <= r.length) {
        e(s - 1);
        return;
      }
      (i.key === "q" || i.key === "Q") && e(t - 1), (i.key === "e" || i.key === "E") && e(t + 1);
    };
    return window.addEventListener("keydown", o), () => window.removeEventListener("keydown", o);
  }, [n, e, t, r.length]);
}
function dp() {
  const { slots: n, equipped: e, setEquipped: t } = Oa(), r = Me();
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
        const a = o ? r.get(o.itemId) : void 0, s = i === e;
        return /* @__PURE__ */ x(
          "button",
          {
            onClick: () => t(i),
            title: a?.name ?? "",
            style: {
              width: 54,
              height: 54,
              borderRadius: 10,
              border: s ? "1.5px solid #ffd84a" : "1px solid rgba(255,255,255,0.14)",
              background: s ? "rgba(255,216,74,0.10)" : "rgba(255,255,255,0.04)",
              color: "#f3f4f8",
              position: "relative",
              cursor: "pointer",
              padding: 0,
              fontFamily: "'Pretendard', system-ui, sans-serif",
              fontSize: 11,
              boxShadow: s ? "0 0 16px rgba(255,216,74,0.45)" : "none",
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
              o && a ? /* @__PURE__ */ x(Se, { children: [
                /* @__PURE__ */ l(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      inset: 14,
                      borderRadius: 6,
                      background: a.color ?? "#888",
                      boxShadow: "inset 0 0 8px rgba(0,0,0,0.4)"
                    }
                  }
                ),
                a.stackable && o.count > 1 && /* @__PURE__ */ l(
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
function fp({ toggleKey: n = "i", initiallyOpen: e = !1 }) {
  const [t, r] = Y(e), o = ae((c) => c.slots), i = ae((c) => c.move), a = Me(), [s, u] = Y(null);
  return L(() => {
    const c = (f) => {
      const d = f.target?.tagName?.toLowerCase();
      d === "input" || d === "textarea" || f.key.toLowerCase() === n.toLowerCase() && r((m) => !m);
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
      children: /* @__PURE__ */ x(
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
            /* @__PURE__ */ x("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
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
                  const d = c ? a.get(c.itemId) : void 0;
                  return /* @__PURE__ */ l(
                    "div",
                    {
                      draggable: !!c,
                      onDragStart: () => u(f),
                      onDragOver: (m) => {
                        m.preventDefault();
                      },
                      onDrop: () => {
                        s !== null && s !== f && i(s, f), u(null);
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
                      children: c && d ? /* @__PURE__ */ x(Se, { children: [
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
const io = 1e3, Be = xe((n, e) => ({
  bells: io,
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
      bells: typeof t.bells == "number" ? Math.max(0, t.bells) : io,
      lifetimeEarned: typeof t.lifetimeEarned == "number" ? t.lifetimeEarned : 0,
      lifetimeSpent: typeof t.lifetimeSpent == "number" ? t.lifetimeSpent : 0
    });
  }
})), Ua = ["axe", "shovel", "water-can", "net", "rod", "apple"];
function Wa(n, e, t) {
  const r = n.slice();
  for (let o = r.length - 1; o > 0; o--) {
    const i = Math.floor(t() * (o + 1));
    [r[o], r[i]] = [r[i], r[o]];
  }
  return r.slice(0, Math.min(e, r.length));
}
function Ha(n) {
  let e = n | 0 || 1;
  return () => (e = e * 1664525 + 1013904223 | 0, (e >>> 0) / 4294967295);
}
const Jt = xe((n, e) => ({
  catalog: Ua,
  dailyStock: [],
  lastRolledDay: -1,
  setCatalog: (t) => n({ catalog: t.slice() }),
  rollDailyStock: (t, r = 4) => {
    const o = e();
    if (o.lastRolledDay === t && o.dailyStock.length > 0) return;
    const i = Ha(t * 9301 + 49297), s = Wa(o.catalog, r, i).map((u) => {
      const c = Me().get(u), f = c?.stackable ? 5 + Math.floor(i() * 6) : 1;
      return { itemId: u, price: c?.buyPrice ?? 100, stock: f };
    });
    n({ dailyStock: s, lastRolledDay: t });
  },
  buy: (t, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    const o = e(), i = o.dailyStock.findIndex((m) => m.itemId === t);
    if (i < 0) return { ok: !1, reason: "not in stock" };
    const a = o.dailyStock[i], s = a.stock ?? 0;
    if (s < r) return { ok: !1, reason: "insufficient stock" };
    const u = (a.price ?? e().priceOf(t)) * r, c = Be.getState();
    if (c.bells < u) return { ok: !1, reason: "insufficient bells" };
    if (!c.spend(u)) return { ok: !1, reason: "spend failed" };
    if (ae.getState().add(t, r) > 0)
      return c.add(u), { ok: !1, reason: "inventory full" };
    const d = o.dailyStock.slice();
    return d[i] = { ...a, stock: s - r }, n({ dailyStock: d }), { ok: !0 };
  },
  sell: (t, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    if (ae.getState().countOf(t) < r) return { ok: !1, reason: "not enough items" };
    const i = ae.getState().removeById(t, r);
    if (i < r) return { ok: !1, reason: "remove failed" };
    const a = e().sellPriceOf(t) * i;
    return a > 0 && Be.getState().add(a), { ok: !0 };
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
function pp({ position: n = "top-center" }) {
  const e = Be((r) => r.bells);
  return /* @__PURE__ */ x(
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
function mp({ open: n, onClose: e, title: t = "Shop" }) {
  const [r, o] = Y("buy"), i = Jt((m) => m.dailyStock), a = Jt((m) => m.buy), s = Jt((m) => m.sell), u = Jt((m) => m.sellPriceOf), c = Be((m) => m.bells), f = ae((m) => m.slots);
  if (!n) return null;
  const d = (() => {
    const m = /* @__PURE__ */ new Map();
    for (const h of f)
      h && m.set(h.itemId, (m.get(h.itemId) ?? 0) + h.count);
    return Array.from(m.entries()).filter(([h]) => u(h) > 0);
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
      children: /* @__PURE__ */ x(
        "div",
        {
          onClick: (m) => m.stopPropagation(),
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
            /* @__PURE__ */ x("div", { style: { padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ l("strong", { style: { fontSize: 15 }, children: t }),
              /* @__PURE__ */ x("span", { style: { color: "#ffd84a" }, children: [
                c.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ l("button", { onClick: e, style: ti(), children: "닫기" })
            ] }),
            /* @__PURE__ */ x("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ l(so, { active: r === "buy", onClick: () => o("buy"), children: "구매" }),
              /* @__PURE__ */ l(so, { active: r === "sell", onClick: () => o("sell"), children: "판매" })
            ] }),
            /* @__PURE__ */ x("div", { style: { overflowY: "auto", padding: 10 }, children: [
              r === "buy" && (i.length === 0 ? /* @__PURE__ */ l("div", { style: { opacity: 0.7, padding: 12 }, children: "오늘 상품이 없습니다." }) : i.map((m) => {
                const h = Me().get(m.itemId), b = m.price ?? h?.buyPrice ?? 0, y = m.stock ?? 0;
                return /* @__PURE__ */ l(
                  ao,
                  {
                    ...h?.color ? { color: h.color } : {},
                    name: h?.name ?? m.itemId,
                    sub: `재고 ${y}`,
                    price: b,
                    disabled: y <= 0 || c < b,
                    actionLabel: "구매",
                    onAction: () => {
                      const g = a(m.itemId, 1);
                      g.ok ? fe("success", `${h?.name ?? m.itemId} 구매`) : fe("warn", `구매 실패: ${g.reason ?? ""}`);
                    }
                  },
                  m.itemId
                );
              })),
              r === "sell" && (d.length === 0 ? /* @__PURE__ */ l("div", { style: { opacity: 0.7, padding: 12 }, children: "판매할 아이템이 없습니다." }) : d.map(([m, h]) => {
                const b = Me().get(m), y = u(m);
                return /* @__PURE__ */ l(
                  ao,
                  {
                    ...b?.color ? { color: b.color } : {},
                    name: b?.name ?? m,
                    sub: `보유 ${h}`,
                    price: y,
                    actionLabel: "판매",
                    onAction: () => {
                      const g = s(m, 1);
                      g.ok ? fe("reward", `${b?.name ?? m} 판매 +${y} B`) : fe("warn", `판매 실패: ${g.reason ?? ""}`);
                    }
                  },
                  m
                );
              }))
            ] })
          ]
        }
      )
    }
  );
}
function so({ active: n, onClick: e, children: t }) {
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
function ao({
  color: n,
  name: e,
  sub: t,
  price: r,
  actionLabel: o,
  onAction: i,
  disabled: a
}) {
  return /* @__PURE__ */ x("div", { style: {
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
    /* @__PURE__ */ x("div", { style: { flex: 1 }, children: [
      /* @__PURE__ */ l("div", { children: e }),
      t && /* @__PURE__ */ l("div", { style: { fontSize: 11, opacity: 0.7 }, children: t })
    ] }),
    /* @__PURE__ */ x("div", { style: { color: "#ffd84a", minWidth: 64, textAlign: "right" }, children: [
      r.toLocaleString(),
      " B"
    ] }),
    /* @__PURE__ */ l("button", { onClick: i, disabled: a, style: ti(a), children: o })
  ] });
}
function ti(n) {
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
const ja = [
  { level: "stranger", min: 0 },
  { level: "acquaintance", min: 50 },
  { level: "friend", min: 150 },
  { level: "close", min: 350 },
  { level: "best", min: 700 }
], $a = 25;
function lo(n) {
  return { npcId: n, score: 0, todayGained: 0, lastGiftDay: -1, giftHistory: {} };
}
function Va(n) {
  let e = "stranger";
  for (const t of ja)
    n >= t.min && (e = t.level);
  return e;
}
function qa(n) {
  const e = Me().get(n);
  return e ? e.rarity === "legendary" ? 25 : e.rarity === "epic" ? 18 : e.rarity === "rare" ? 12 : e.rarity === "uncommon" ? 8 : e.category === "food" ? 6 : e.category === "fish" || e.category === "bug" ? 7 : e.category === "furniture" ? 10 : 4 : 1;
}
const Mr = xe((n, e) => ({
  entries: {},
  ensure: (t) => {
    const r = e().entries[t];
    if (r) return r;
    const o = lo(t);
    return n({ entries: { ...e().entries, [t]: o } }), o;
  },
  add: (t, r, o) => {
    if (r === 0) return 0;
    let a = e().entries[t] ?? lo(t);
    a.lastGiftDay !== o && (a = { ...a, todayGained: 0, lastGiftDay: o });
    let s = r;
    if (s > 0) {
      const c = Math.max(0, $a - a.todayGained);
      s = Math.min(s, c);
    }
    if (s === 0) return 0;
    const u = {
      ...a,
      score: Math.max(0, a.score + s),
      todayGained: a.todayGained + Math.max(0, s)
    };
    return n({ entries: { ...e().entries, [t]: u } }), s;
  },
  giveGift: (t, r, o) => {
    const i = qa(r), a = e().add(t, i, o), s = e().entries[t], u = { ...s.giftHistory, [r]: (s.giftHistory[r] ?? 0) + 1 };
    return n({ entries: { ...e().entries, [t]: { ...s, giftHistory: u } } }), { gained: a, capped: a < i };
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
  levelOf: (t) => Va(e().scoreOf(t)),
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
class Ya {
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
let Dn = null;
function Ue() {
  return Dn || (Dn = new Ya()), Dn;
}
function Za(n) {
  return n.type === "collect" || n.type === "deliver" ? n.count : 1;
}
function Xa(n) {
  if (n.type === "item")
    ae.getState().add(n.itemId, n.count ?? 1) > 0 && fe("warn", "인벤토리가 부족합니다");
  else if (n.type === "bells")
    Be.getState().add(n.amount), fe("reward", `+${n.amount} B`);
  else if (n.type === "friendship") {
    const e = Math.floor(be.getState().totalMinutes / 1440);
    Mr.getState().add(n.npcId, n.amount, e);
  }
}
function Ka(n, e = "active") {
  const t = {};
  for (const r of n.objectives) t[r.id] = 0;
  return { questId: n.id, status: e, progress: t, startedAt: Date.now() };
}
const je = xe((n, e) => ({
  state: {},
  start: (t) => {
    const r = Ue().get(t);
    if (!r) return !1;
    const o = e().state[t];
    if (o && o.status === "active" || o && o.status === "completed" && !r.repeatable) return !1;
    if (r.prerequisiteQuests) {
      for (const a of r.prerequisiteQuests)
        if (e().state[a]?.status !== "completed") return !1;
    }
    const i = Ka(r, "active");
    return n({ state: { ...e().state, [t]: i } }), fe("info", `퀘스트 시작: ${r.name}`), !0;
  },
  abandon: (t) => {
    const r = e().state[t];
    !r || r.status !== "active" || n({ state: { ...e().state, [t]: { ...r, status: "failed" } } });
  },
  complete: (t) => {
    const r = Ue().get(t);
    if (!r) return !1;
    const o = e().state[t];
    if (!o || o.status !== "active" || !e().isAllObjectivesComplete(t)) return !1;
    for (const i of r.objectives)
      i.type === "deliver" && ae.getState().removeById(i.itemId, i.count);
    for (const i of r.rewards) Xa(i);
    return n({ state: { ...e().state, [t]: { ...o, status: "completed", completedAt: Date.now() } } }), fe("success", `퀘스트 완료: ${r.name}`), !0;
  },
  notifyTalk: (t) => {
    const r = { ...e().state };
    let o = !1;
    for (const [i, a] of Object.entries(r)) {
      if (a.status !== "active") continue;
      const s = Ue().get(i);
      if (s)
        for (const u of s.objectives)
          u.type === "talk" && u.npcId === t && (a.progress[u.id] ?? 0) < 1 && (r[i] = { ...a, progress: { ...a.progress, [u.id]: 1 } }, o = !0);
    }
    o && n({ state: r });
  },
  notifyDeliver: (t, r, o = 1) => {
    let i = !1;
    const a = { ...e().state };
    for (const [s, u] of Object.entries(a)) {
      if (u.status !== "active") continue;
      const c = Ue().get(s);
      if (c) {
        for (const f of c.objectives)
          if (f.type === "deliver" && f.npcId === t && f.itemId === r) {
            const d = ae.getState().countOf(r);
            if (d <= 0) continue;
            const m = Math.min(d, f.count - (u.progress[f.id] ?? 0), o);
            if (m <= 0) continue;
            const h = ae.getState().removeById(r, m);
            a[s] = {
              ...u,
              progress: { ...u.progress, [f.id]: (u.progress[f.id] ?? 0) + h }
            }, i = !0;
          }
      }
    }
    return i && n({ state: a }), i;
  },
  notifyVisit: (t) => {
    const r = { ...e().state };
    let o = !1;
    for (const [i, a] of Object.entries(r)) {
      if (a.status !== "active") continue;
      const s = Ue().get(i);
      if (s)
        for (const u of s.objectives)
          u.type === "visit" && u.tag === t && (a.progress[u.id] ?? 0) < 1 && (r[i] = { ...a, progress: { ...a.progress, [u.id]: 1 } }, o = !0);
    }
    o && n({ state: r });
  },
  notifyFlag: (t, r) => {
    const o = { ...e().state };
    let i = !1;
    for (const [a, s] of Object.entries(o)) {
      if (s.status !== "active") continue;
      const u = Ue().get(a);
      if (u)
        for (const c of u.objectives)
          c.type === "flag" && c.key === t && c.value === r && (s.progress[c.id] ?? 0) < 1 && (o[a] = { ...s, progress: { ...s.progress, [c.id]: 1 } }, i = !0);
    }
    i && n({ state: o });
  },
  recheck: (t) => {
    const r = Ue().get(t), o = e().state[t];
    if (!r || !o || o.status !== "active") return;
    const i = { ...o };
    for (const a of r.objectives)
      a.type === "collect" && (i.progress = { ...i.progress, [a.id]: Math.min(a.count, ae.getState().countOf(a.itemId)) });
    n({ state: { ...e().state, [t]: i } });
  },
  statusOf: (t) => e().state[t]?.status ?? "available",
  progressOf: (t) => e().state[t] ?? null,
  active: () => Object.values(e().state).filter((t) => t.status === "active"),
  completed: () => Object.values(e().state).filter((t) => t.status === "completed"),
  isObjectiveComplete: (t, r, o) => {
    const i = r.progress[o.id] ?? 0;
    return o.type === "collect" ? ae.getState().countOf(o.itemId) >= o.count : i >= Za(o);
  },
  isAllObjectivesComplete: (t) => {
    const r = Ue().get(t), o = e().state[t];
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
class Ja {
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
        return ae.getState().countOf(e.itemId) >= (e.count ?? 1);
      case "hasBells":
        return Be.getState().bells >= e.amount;
      case "flagEquals":
        return this.context.flags?.[e.key] === e.value;
      case "friendshipAtLeast":
        return Mr.getState().scoreOf(e.npcId) >= e.amount;
      default:
        return !0;
    }
  }
  applyEffect(e) {
    switch (e.type) {
      case "giveItem": {
        const t = Me().get(e.itemId);
        ae.getState().add(e.itemId, e.count ?? 1) > 0 ? fe("warn", "인벤토리가 가득 찼습니다") : fe("reward", `${t?.name ?? e.itemId} +${e.count ?? 1}`);
        return;
      }
      case "takeItem": {
        ae.getState().removeById(e.itemId, e.count ?? 1);
        return;
      }
      case "giveBells":
        Be.getState().add(e.amount), fe("reward", `+${e.amount} B`);
        return;
      case "takeBells":
        Be.getState().spend(e.amount);
        return;
      case "setFlag":
        this.context.flags || (this.context.flags = {}), this.context.flags[e.key] = e.value, je.getState().notifyFlag(e.key, e.value);
        return;
      case "addFriendship": {
        const t = Math.floor(be.getState().totalMinutes / 1440);
        Mr.getState().add(e.npcId, e.amount, t);
        return;
      }
      case "startQuest":
        je.getState().start(e.questId);
        return;
      case "completeQuest":
        je.getState().complete(e.questId);
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
class Qa {
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
let Fn = null;
function el() {
  return Fn || (Fn = new Qa()), Fn;
}
const It = xe((n, e) => ({
  runner: null,
  node: null,
  npcId: void 0,
  start: (t, r) => {
    const o = el().get(t);
    if (!o) return !1;
    const i = new Ja({
      tree: o,
      ...r?.context ? { context: r.context } : {},
      ...r?.onCustomEffect ? { onCustomEffect: r.onCustomEffect } : {},
      ...r?.onOpenShop ? { onOpenShop: r.onOpenShop } : {}
    });
    return n({ runner: i, node: i.current, npcId: r?.context?.npcId }), r?.context?.npcId && je.getState().notifyTalk(r.context.npcId), !0;
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
function hp({ advanceKey: n = "e", closeKey: e = "Escape" }) {
  const t = It((u) => u.node), r = It((u) => u.runner), o = It((u) => u.advance), i = It((u) => u.choose), a = It((u) => u.close), s = r?.visibleChoices() ?? [];
  return L(() => {
    if (!t) return;
    const u = (c) => {
      if (c.key === e) {
        a();
        return;
      }
      if (s.length === 0 && c.key.toLowerCase() === n.toLowerCase()) {
        o();
        return;
      }
      const f = parseInt(c.key, 10);
      !Number.isNaN(f) && f >= 1 && f <= s.length && i(f - 1);
    };
    return window.addEventListener("keydown", u), () => window.removeEventListener("keydown", u);
  }, [t, s.length, o, i, a, n, e]), t ? /* @__PURE__ */ x(
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
        s.length === 0 ? /* @__PURE__ */ x("div", { style: { marginTop: 10, fontSize: 12, opacity: 0.65, textAlign: "right" }, children: [
          "[",
          n.toUpperCase(),
          "] 다음"
        ] }) : /* @__PURE__ */ l("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }, children: s.map((u, c) => /* @__PURE__ */ x(
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
              /* @__PURE__ */ x("span", { style: {
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
function gp({
  useKey: n = "f",
  range: e = 2.4,
  cooldownMs: t = 350
} = {}) {
  const { position: r, rotation: o } = dt({ updateInterval: 16 }), i = N(0);
  return L(() => {
    const a = `Key${n.toUpperCase()}`, s = n.toLowerCase(), u = (c) => {
      const f = c.target?.tagName?.toLowerCase();
      if (f === "input" || f === "textarea" || c.code !== a && c.key.toLowerCase() !== s) return;
      const d = performance.now();
      if (d - i.current < t) return;
      const m = ae.getState().getEquipped();
      if (!m) return;
      const h = Me().get(m.itemId);
      if (!h?.toolKind) return;
      const b = h.toolKind, y = o?.y ?? 0, g = new w.Vector3(Math.sin(y), 0, Math.cos(y)).normalize();
      i.current = d, Jo().emit({
        kind: b,
        origin: [r.x, r.y, r.z],
        direction: [g.x, g.y, g.z],
        range: e,
        timestamp: d
      });
    };
    return window.addEventListener("keydown", u), () => window.removeEventListener("keydown", u);
  }, [n, t, e, r, o]), null;
}
function yp({ toggleKey: n = "j" }) {
  const [e, t] = Y(!1), r = je((c) => c.state), o = je((c) => c.complete), i = je((c) => c.isObjectiveComplete), a = je((c) => c.isAllObjectivesComplete);
  if (L(() => {
    const c = (f) => {
      const d = f.target?.tagName?.toLowerCase();
      d === "input" || d === "textarea" || (f.key.toLowerCase() === n.toLowerCase() && t((m) => !m), f.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [n]), !e) return null;
  const s = Object.values(r).filter((c) => c.status === "active"), u = Object.values(r).filter((c) => c.status === "completed");
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
      children: /* @__PURE__ */ x(
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
            /* @__PURE__ */ x(
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
                  /* @__PURE__ */ x("button", { onClick: () => t(!1), style: ni(), children: [
                    "Close [",
                    n.toUpperCase(),
                    "]"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ x("div", { style: { overflowY: "auto", padding: 10 }, children: [
              /* @__PURE__ */ l(co, { title: `Active (${s.length})`, children: s.length === 0 ? /* @__PURE__ */ l(tl, { children: "No active quests." }) : s.map((c) => /* @__PURE__ */ l(
                uo,
                {
                  progress: c,
                  renderObjective: (f) => i(
                    Ue().require(c.questId),
                    c,
                    f
                  ),
                  ...a(c.questId) ? {
                    onComplete: () => {
                      o(c.questId);
                    }
                  } : {}
                },
                c.questId
              )) }),
              u.length > 0 && /* @__PURE__ */ l(co, { title: `Completed (${u.length})`, children: u.map((c) => /* @__PURE__ */ l(uo, { progress: c, renderObjective: () => !0, muted: !0 }, c.questId)) })
            ] })
          ]
        }
      )
    }
  );
}
function co({ title: n, children: e }) {
  return /* @__PURE__ */ x("div", { style: { marginBottom: 10 }, children: [
    /* @__PURE__ */ l("div", { style: { padding: "6px 6px 4px", color: "#7aa6ff", fontSize: 12 }, children: n }),
    e
  ] });
}
function tl({ children: n }) {
  return /* @__PURE__ */ l("div", { style: { padding: "8px 10px", opacity: 0.6 }, children: n });
}
function uo({
  progress: n,
  renderObjective: e,
  onComplete: t,
  muted: r
}) {
  const o = Ue().get(n.questId);
  return o ? /* @__PURE__ */ x(
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
        /* @__PURE__ */ x(
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
              t && /* @__PURE__ */ l("button", { onClick: t, style: ni(!0), children: "Report Complete" })
            ]
          }
        ),
        /* @__PURE__ */ l("div", { style: { opacity: 0.75, marginBottom: 6 }, children: o.summary }),
        /* @__PURE__ */ l("ul", { style: { margin: 0, padding: "0 0 0 16px" }, children: o.objectives.map((i) => {
          const a = e(i), s = n.progress[i.id] ?? 0, u = i.type === "collect" || i.type === "deliver" ? i.count : 1, c = i.type === "collect" ? Math.min(ae.getState().countOf(i.itemId), u) : s, f = i.type === "collect" || i.type === "deliver" ? Me().get(i.itemId)?.name ?? i.itemId : "";
          return /* @__PURE__ */ x(
            "li",
            {
              style: { color: a ? "#7adf90" : "#ddd", listStyle: "square" },
              children: [
                i.description ?? nl(i, f),
                " ",
                u > 1 ? `(${c}/${u})` : ""
              ]
            },
            i.id
          );
        }) }),
        /* @__PURE__ */ x("div", { style: { marginTop: 6, fontSize: 11, color: "#ffd84a" }, children: [
          "Rewards: ",
          o.rewards.map((i) => rl(i)).join(", ")
        ] })
      ]
    }
  ) : null;
}
function nl(n, e) {
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
function rl(n) {
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
function ni(n) {
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
function bp(n = !0) {
  L(() => n ? ae.subscribe((t, r) => {
    if (t.slots === r.slots) return;
    const o = je.getState().active();
    for (const i of o) je.getState().recheck(i.questId);
  }) : void 0, [n]);
}
let ol = 0;
function il() {
  return `mail_${Date.now().toString(36)}_${(++ol).toString(36)}`;
}
function sl(n) {
  return n.itemId !== void 0;
}
const Qt = xe((n, e) => ({
  messages: [],
  send: (t) => {
    const r = t.id ?? il(), o = {
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
      if (sl(i)) {
        if (ae.getState().add(i.itemId, i.count ?? 1) > 0) {
          o = !1, fe("warn", "인벤토리 부족, 일부 우편물 미수령");
          break;
        }
      } else
        Be.getState().add(i.bells);
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
function vp({ toggleKey: n = "m" }) {
  const [e, t] = Y(!1), [r, o] = Y(null), i = Qt((d) => d.messages), a = Qt((d) => d.markRead), s = Qt((d) => d.claim), u = Qt((d) => d.delete);
  if (L(() => {
    const d = (m) => {
      const h = m.target?.tagName?.toLowerCase();
      h === "input" || h === "textarea" || (m.key.toLowerCase() === n.toLowerCase() && t((b) => !b), m.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", d), () => window.removeEventListener("keydown", d);
  }, [n]), !e) return null;
  const c = i.slice().sort((d, m) => m.sentDay - d.sentDay), f = r ? c.find((d) => d.id === r) ?? null : null;
  return /* @__PURE__ */ l(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => t(!1),
      children: /* @__PURE__ */ x(
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
            /* @__PURE__ */ x("div", { style: { width: 260, borderRight: "1px solid #333", display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ x("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ l("strong", { children: "우편함" }),
                /* @__PURE__ */ l("span", { style: { fontSize: 12, opacity: 0.7 }, children: c.length })
              ] }),
              /* @__PURE__ */ l("div", { style: { flex: 1, overflowY: "auto" }, children: c.length === 0 ? /* @__PURE__ */ l(ll, { children: "우편이 없습니다." }) : c.map((d) => /* @__PURE__ */ x(
                "div",
                {
                  onClick: () => {
                    o(d.id), d.read || a(d.id);
                  },
                  style: {
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: r === d.id ? "#262626" : "transparent",
                    borderBottom: "1px solid #2a2a2a",
                    opacity: d.read ? 0.7 : 1
                  },
                  children: [
                    /* @__PURE__ */ x("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      !d.read && /* @__PURE__ */ l("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "#cf9aff" } }),
                      /* @__PURE__ */ l("strong", { style: { fontSize: 13 }, children: d.subject })
                    ] }),
                    /* @__PURE__ */ x("div", { style: { fontSize: 11, opacity: 0.6 }, children: [
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
            /* @__PURE__ */ x("div", { style: { flex: 1, display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ x("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ l("span", { children: f ? f.subject : "메시지를 선택하세요" }),
                /* @__PURE__ */ x("button", { onClick: () => t(!1), style: Cr(), children: [
                  "닫기 [",
                  n.toUpperCase(),
                  "]"
                ] })
              ] }),
              /* @__PURE__ */ l("div", { style: { flex: 1, padding: 12, overflowY: "auto" }, children: f ? /* @__PURE__ */ l(al, { msg: f, onClaim: () => s(f.id), onDelete: () => {
                u(f.id), o(null);
              } }) : /* @__PURE__ */ l("div", { style: { opacity: 0.6 }, children: "왼쪽에서 메시지를 선택하세요." }) })
            ] })
          ]
        }
      )
    }
  );
}
function al({ msg: n, onClaim: e, onDelete: t }) {
  return /* @__PURE__ */ x("div", { children: [
    /* @__PURE__ */ x("div", { style: { marginBottom: 6, opacity: 0.75 }, children: [
      "From. ",
      n.from
    ] }),
    /* @__PURE__ */ l("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 12 }, children: n.body }),
    n.attachments && n.attachments.length > 0 && /* @__PURE__ */ x("div", { style: { padding: 10, background: "#222", borderRadius: 8, marginBottom: 8 }, children: [
      /* @__PURE__ */ l("div", { style: { marginBottom: 6, color: "#ffd84a", fontSize: 12 }, children: "첨부물" }),
      /* @__PURE__ */ l("ul", { style: { margin: 0, paddingLeft: 18 }, children: n.attachments.map((r, o) => {
        if ("itemId" in r) {
          const i = Me().get(r.itemId);
          return /* @__PURE__ */ x("li", { children: [
            i?.name ?? r.itemId,
            " x",
            r.count ?? 1
          ] }, o);
        }
        return /* @__PURE__ */ x("li", { children: [
          r.bells,
          " B"
        ] }, o);
      }) }),
      /* @__PURE__ */ l("div", { style: { marginTop: 8, display: "flex", gap: 6, justifyContent: "flex-end" }, children: n.claimed ? /* @__PURE__ */ l("span", { style: { fontSize: 12, opacity: 0.6 }, children: "수령 완료" }) : /* @__PURE__ */ l("button", { onClick: e, style: Cr(!0), children: "받기" }) })
    ] }),
    /* @__PURE__ */ l("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ l("button", { onClick: t, style: Cr(), children: "삭제" }) })
  ] });
}
function ll({ children: n }) {
  return /* @__PURE__ */ l("div", { style: { padding: 14, opacity: 0.6 }, children: n });
}
function Cr(n) {
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
const fo = ["fish", "bug", "food", "material", "furniture", "tool", "misc"], ri = xe((n, e) => ({
  entries: {},
  record: (t, r, o) => {
    if (r <= 0) return;
    const i = e().entries[t], a = i ? { ...i, totalCollected: i.totalCollected + r } : { itemId: t, firstSeenDay: o, totalCollected: r };
    n({ entries: { ...e().entries, [t]: a } });
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
function xp(n = !0) {
  L(() => n ? ae.subscribe((t, r) => {
    if (t.slots === r.slots) return;
    const o = Math.floor(be.getState().totalMinutes / (60 * 24)), i = /* @__PURE__ */ new Map();
    for (const s of r.slots) s && i.set(s.itemId, (i.get(s.itemId) ?? 0) + s.count);
    const a = /* @__PURE__ */ new Map();
    for (const s of t.slots) s && a.set(s.itemId, (a.get(s.itemId) ?? 0) + s.count);
    for (const [s, u] of a.entries()) {
      const c = u - (i.get(s) ?? 0);
      c > 0 && ri.getState().record(s, c, o);
    }
  }) : void 0, [n]);
}
function wp({ toggleKey: n = "k" }) {
  const [e, t] = Y(!1), [r, o] = Y("fish"), i = ri((f) => f.entries);
  L(() => {
    const f = (d) => {
      const m = d.target?.tagName?.toLowerCase();
      m === "input" || m === "textarea" || (d.key.toLowerCase() === n.toLowerCase() && t((h) => !h), d.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", f), () => window.removeEventListener("keydown", f);
  }, [n]);
  const a = F(() => Me().all(), []), s = F(() => {
    const f = /* @__PURE__ */ new Map();
    for (const d of fo) f.set(d, []);
    for (const d of a) {
      const m = f.get(d.category);
      m && m.push(d);
    }
    return f;
  }, [a]);
  if (!e) return null;
  const u = s.get(r) ?? [], c = u.filter((f) => i[f.id]).length;
  return /* @__PURE__ */ l(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => t(!1),
      children: /* @__PURE__ */ x(
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
            /* @__PURE__ */ x("div", { style: { padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ l("strong", { style: { fontSize: 15 }, children: "도감" }),
              /* @__PURE__ */ x("button", { onClick: () => t(!1), style: cl(), children: [
                "닫기 [",
                n.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ l("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: fo.map((f) => {
              const d = s.get(f) ?? [];
              if (d.length === 0) return null;
              const m = d.filter((h) => i[h.id]).length;
              return /* @__PURE__ */ x(
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
                    po(f),
                    " (",
                    m,
                    "/",
                    d.length,
                    ")"
                  ]
                },
                f
              );
            }) }),
            /* @__PURE__ */ x("div", { style: { padding: "6px 14px", fontSize: 12, opacity: 0.7 }, children: [
              po(r),
              " — ",
              c,
              "/",
              u.length,
              " 수집"
            ] }),
            /* @__PURE__ */ x("div", { style: { flex: 1, overflowY: "auto", padding: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }, children: [
              u.map((f) => {
                const d = i[f.id], m = !!d;
                return /* @__PURE__ */ x("div", { style: {
                  padding: 10,
                  borderRadius: 8,
                  background: m ? "#222" : "#181818",
                  border: m ? "1px solid #2e3" : "1px solid #2a2a2a",
                  opacity: m ? 1 : 0.4
                }, children: [
                  /* @__PURE__ */ x("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }, children: [
                    /* @__PURE__ */ l("span", { style: { width: 16, height: 16, borderRadius: 4, background: f.color ?? "#888" } }),
                    /* @__PURE__ */ l("strong", { style: { fontSize: 13 }, children: m ? f.name : "???" })
                  ] }),
                  m && /* @__PURE__ */ x("div", { style: { fontSize: 11, opacity: 0.7 }, children: [
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
function po(n) {
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
function cl() {
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
class ul {
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
let Ln = null;
function Dt() {
  return Ln || (Ln = new ul()), Ln;
}
const Gn = xe((n, e) => ({
  unlocked: /* @__PURE__ */ new Set(),
  unlock: (t) => {
    const r = Dt().get(t);
    if (!r || e().unlocked.has(t)) return;
    const o = new Set(e().unlocked);
    o.add(t), n({ unlocked: o }), fe("info", `레시피 해금: ${r.name}`);
  },
  isUnlocked: (t) => {
    const r = Dt().get(t);
    return r ? r.unlockedByDefault ? !0 : e().unlocked.has(t) : !1;
  },
  canCraft: (t) => {
    const r = Dt().get(t);
    if (!r) return { ok: !1, reason: "unknown recipe" };
    if (!e().isUnlocked(t)) return { ok: !1, reason: "locked" };
    const o = ae.getState();
    for (const i of r.ingredients)
      if (o.countOf(i.itemId) < i.count) return { ok: !1, reason: "missing ingredients" };
    return r.requireBells && Be.getState().bells < r.requireBells ? { ok: !1, reason: "insufficient bells" } : { ok: !0 };
  },
  craft: (t) => {
    const r = e().canCraft(t);
    if (!r.ok) return r;
    const o = Dt().require(t), i = ae.getState();
    for (const s of o.ingredients)
      if (i.removeById(s.itemId, s.count) < s.count) return { ok: !1, reason: "remove failed" };
    return o.requireBells && !Be.getState().spend(o.requireBells) ? { ok: !1, reason: "spend failed" } : (i.add(o.output.itemId, o.output.count) > 0 ? fe("warn", "인벤토리 부족, 일부 결과물 폐기") : fe("reward", `제작 완료: ${o.name}`), { ok: !0 });
  },
  serialize: () => ({ version: 1, unlocked: Array.from(e().unlocked) }),
  hydrate: (t) => {
    !t || !Array.isArray(t.unlocked) || n({ unlocked: new Set(t.unlocked) });
  }
}));
function Sp({ toggleKey: n = "c", title: e = "제작대", open: t, onClose: r }) {
  const [o, i] = Y(!1), a = t !== void 0, s = a ? t : o, u = () => {
    a ? r?.() : i(!1);
  }, c = () => {
    a ? s && r?.() : i((p) => !p);
  }, f = Gn((p) => p.isUnlocked), d = Gn((p) => p.canCraft), m = Gn((p) => p.craft), h = ae((p) => p.slots), b = Be((p) => p.bells);
  if (L(() => {
    const p = (S) => {
      const v = S.target?.tagName?.toLowerCase();
      v === "input" || v === "textarea" || (S.key.toLowerCase() === n.toLowerCase() && c(), S.key === "Escape" && u());
    };
    return window.addEventListener("keydown", p), () => window.removeEventListener("keydown", p);
  }, [n, a, s]), !s) return null;
  const y = Dt().all(), g = (() => {
    const p = /* @__PURE__ */ new Map();
    for (const S of h) S && p.set(S.itemId, (p.get(S.itemId) ?? 0) + S.count);
    return p;
  })();
  return /* @__PURE__ */ l(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: u,
      children: /* @__PURE__ */ x(
        "div",
        {
          onClick: (p) => p.stopPropagation(),
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
            /* @__PURE__ */ x("div", { style: { padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ l("strong", { style: { fontSize: 15 }, children: e }),
              /* @__PURE__ */ x("span", { style: { color: "#ffd84a" }, children: [
                b.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ x("button", { onClick: u, style: mo(), children: [
                "닫기 [",
                n.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ x("div", { style: { overflowY: "auto", padding: 10 }, children: [
              y.length === 0 && /* @__PURE__ */ l(dl, { children: "레시피가 없습니다." }),
              y.map((p) => {
                const S = f(p.id), v = d(p.id), M = Me().get(p.output.itemId);
                return /* @__PURE__ */ x("div", { style: {
                  padding: 10,
                  marginBottom: 6,
                  background: "#222",
                  borderRadius: 8,
                  opacity: S ? 1 : 0.45
                }, children: [
                  /* @__PURE__ */ x("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
                    /* @__PURE__ */ x("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      /* @__PURE__ */ l("span", { style: { width: 16, height: 16, borderRadius: 4, background: M?.color ?? "#888" } }),
                      /* @__PURE__ */ l("strong", { children: S ? p.name : "???" }),
                      p.output.count > 1 && /* @__PURE__ */ x("span", { style: { opacity: 0.7 }, children: [
                        "x",
                        p.output.count
                      ] })
                    ] }),
                    /* @__PURE__ */ l(
                      "button",
                      {
                        onClick: () => m(p.id),
                        disabled: !v.ok,
                        style: mo(v.ok),
                        children: "제작"
                      }
                    )
                  ] }),
                  S && /* @__PURE__ */ x("div", { style: { fontSize: 12, opacity: 0.85 }, children: [
                    "재료: ",
                    p.ingredients.map((T) => {
                      const C = g.get(T.itemId) ?? 0, P = C >= T.count, k = Me().get(T.itemId);
                      return /* @__PURE__ */ x("span", { style: { marginRight: 8, color: P ? "#7adf90" : "#ff8a8a" }, children: [
                        k?.name ?? T.itemId,
                        " ",
                        C,
                        "/",
                        T.count
                      ] }, T.itemId);
                    }),
                    p.requireBells ? /* @__PURE__ */ x("span", { style: { color: "#ffd84a" }, children: [
                      "· ",
                      p.requireBells,
                      " B"
                    ] }) : null
                  ] })
                ] }, p.id);
              })
            ] })
          ]
        }
      )
    }
  );
}
function dl({ children: n }) {
  return /* @__PURE__ */ l("div", { style: { padding: 14, opacity: 0.6 }, children: n });
}
function mo(n) {
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
class fl {
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
let On = null;
function ut() {
  return On || (On = new fl()), On;
}
function ho(n, e) {
  return { id: n, position: e, state: "empty", stageIndex: 0 };
}
function pl(n, e) {
  if (n.state !== "planted" && n.state !== "mature") return n.stageIndex;
  const t = n.cropId ? ut().get(n.cropId) : void 0;
  if (!t || n.plantedAt === void 0) return n.stageIndex;
  let r = e - n.plantedAt;
  for (let o = 0; o < t.stages.length; o++) {
    const i = t.stages[o];
    if (i.durationMinutes <= 0 || r < i.durationMinutes) return o;
    r -= i.durationMinutes;
  }
  return t.stages.length - 1;
}
const Fe = xe((n, e) => ({
  plots: {},
  registerPlot: (t) => {
    if (e().plots[t.id]) return;
    const o = { ...ho(t.id, t.position), ...t };
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
    const i = e().plots[t], a = ut().get(r);
    if (!i || !a || i.state !== "tilled") return !1;
    const s = ae.getState();
    return s.countOf(a.seedItemId) < 1 ? (fe("warn", `${a.name} 씨앗 부족`), !1) : (s.removeById(a.seedItemId, 1), n({
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
    }), fe("success", `${a.name} 심음`), !0);
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
    const o = ut().get(r.cropId);
    return o ? ae.getState().add(o.yieldItemId, o.yieldCount) > 0 ? (fe("warn", "인벤토리가 가득 찼습니다"), !1) : (fe("reward", `${o.name} +${o.yieldCount}`), n({
      plots: {
        ...e().plots,
        [t]: {
          ...ho(r.id, r.position),
          state: "tilled"
        }
      }
    }), !0) : !1;
  },
  tick: (t) => {
    const r = e().plots, o = {};
    let i = !1;
    for (const [a, s] of Object.entries(r)) {
      let u = s;
      if (u.state === "planted" || u.state === "mature") {
        const c = u.cropId ? ut().get(u.cropId) : void 0;
        if (c && u.plantedAt !== void 0) {
          const f = u.lastWateredAt ?? u.plantedAt;
          if (t - f >= c.driedOutMinutes)
            u = { ...u, state: "dried" }, i = !0;
          else {
            const d = pl(u, t), m = c.stages.length - 1, h = d >= m ? "mature" : "planted";
            (d !== u.stageIndex || h !== u.state) && (u = { ...u, stageIndex: d, state: h }, i = !0);
          }
        }
      }
      o[a] = u;
    }
    i && n({ plots: o });
  },
  near: (t, r, o) => {
    const i = o * o;
    let a = null, s = 1 / 0;
    for (const u of Object.values(e().plots)) {
      const c = u.position[0] - t, f = u.position[2] - r, d = c * c + f * f;
      d < i && d < s && (s = d, a = u);
    }
    return a;
  },
  serialize: () => ({ version: 1, plots: Object.values(e().plots).map((t) => ({ ...t })) }),
  hydrate: (t) => {
    if (!t || !Array.isArray(t.plots)) return;
    const r = {};
    for (const o of t.plots) o?.id && (r[o.id] = { ...o });
    n({ plots: r });
  }
}));
function Un(n, e, t) {
  const r = e.origin[0] - n.position[0], o = e.origin[2] - n.position[2];
  return r * r + o * o <= t * t;
}
function Mp({ id: n, position: e, size: t = 1.4, hitRange: r = 1.6 }) {
  const o = Fe((v) => v.registerPlot), i = Fe((v) => v.unregisterPlot), a = Fe((v) => v.plots[n]), s = Fe((v) => v.till), u = Fe((v) => v.plant), c = Fe((v) => v.water), f = Fe((v) => v.harvest), d = Fe((v) => v.tick);
  L(() => (o({ id: n, position: e }), () => i(n)), [n, e, o, i]), L(() => {
    let v = 0;
    const M = be.subscribe((T) => {
      T.totalMinutes !== v && (v = T.totalMinutes, d(T.totalMinutes));
    });
    return d(be.getState().totalMinutes), M;
  }, [d]);
  const m = V((v) => {
    const M = Fe.getState().plots[n];
    if (!(!M || !Un(M, v, r))) {
      if (M.state === "mature") return f(n) ? !0 : void 0;
      if (M.state === "empty") {
        const T = s(n);
        return T && fe("info", "땅을 갈았다"), T ? !0 : void 0;
      }
    }
  }, [n, r, s, f]), h = V((v) => {
    const M = Fe.getState().plots[n];
    if (!M || !Un(M, v, r) || M.state !== "tilled") return;
    const T = ae.getState().getEquipped();
    if (!T) return;
    const C = ut().bySeedItemId(T.itemId);
    if (!C) return;
    const P = be.getState().totalMinutes;
    return u(n, C.id, P) ? !0 : void 0;
  }, [n, r, u]), b = V((v) => {
    const M = Fe.getState().plots[n];
    if (!M || !Un(M, v, r) || M.state !== "planted" && M.state !== "dried") return;
    const T = be.getState().totalMinutes, C = c(n, T);
    return C && fe("info", "물을 줬다"), C ? !0 : void 0;
  }, [n, r, c]);
  vt("shovel", m), vt("seed", h), vt("water", b);
  const y = a?.cropId ? ut().get(a.cropId) : void 0, g = y ? y.stages[a.stageIndex] : void 0, p = F(() => !a || a.state === "empty" ? "#5a3f24" : a.state === "tilled" ? "#4a2f18" : a.state === "dried" ? "#6b5230" : "#3a2810", [a]), S = N(null);
  return de(({ clock: v }) => {
    const M = S.current;
    if (!M) return;
    const T = v.elapsedTime;
    M.rotation.y = Math.sin(T * 0.4) * 0.05, M.position.y = (g?.scale ?? 0.3) * 0.5 + Math.sin(T * 1.2) * 0.01;
  }), /* @__PURE__ */ x("group", { position: e, children: [
    /* @__PURE__ */ x("mesh", { receiveShadow: !0, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: [
      /* @__PURE__ */ l("planeGeometry", { args: [t, t] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: p })
    ] }),
    a && (a.state === "planted" || a.state === "mature" || a.state === "dried") && y && g && /* @__PURE__ */ x("mesh", { ref: S, castShadow: !0, position: [0, g.scale * 0.5, 0], children: [
      /* @__PURE__ */ l("coneGeometry", { args: [Math.max(0.08, g.scale * 0.35), Math.max(0.16, g.scale * 0.9), 10] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: a.state === "dried" ? "#7a6a4a" : g.color ?? "#9adf90" })
    ] }),
    a?.state === "mature" && /* @__PURE__ */ x("mesh", { position: [0, 1, 0], children: [
      /* @__PURE__ */ l("ringGeometry", { args: [0.18, 0.24, 16] }),
      /* @__PURE__ */ l("meshBasicMaterial", { color: "#ffd84a", transparent: !0, opacity: 0.85, depthWrite: !1 })
    ] })
  ] });
}
const ml = [
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
let go = !1;
function Cp() {
  go || (go = !0, ut().registerAll(ml));
}
const hl = {
  sunny: { sym: "O", color: "#ffd84a", label: "맑음" },
  cloudy: { sym: "c", color: "#aab2bc", label: "흐림" },
  rain: { sym: "r", color: "#4aa8ff", label: "비" },
  snow: { sym: "*", color: "#dff0ff", label: "눈" },
  storm: { sym: "!", color: "#7f7fff", label: "폭풍" }
};
function kp({ position: n = "top-left" }) {
  const e = De((o) => o.current);
  if (!e) return null;
  const t = hl[e.kind], r = n === "top-right" ? { top: 50, right: 12 } : { top: 50, left: 12 };
  return /* @__PURE__ */ x(
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
function Ip({ area: n = 80, height: e = 18, count: t = 1200 }) {
  const r = De((u) => u.current), o = N(null), { geometry: i, material: a, kind: s } = F(() => {
    if (!r || r.kind !== "rain" && r.kind !== "snow" && r.kind !== "storm")
      return { geometry: null, material: null, kind: null };
    const u = new Float32Array(t * 3), c = new Float32Array(t);
    for (let h = 0; h < t; h++)
      u[h * 3 + 0] = (Math.random() - 0.5) * n, u[h * 3 + 1] = Math.random() * e, u[h * 3 + 2] = (Math.random() - 0.5) * n, c[h] = r.kind === "snow" ? 0.6 + Math.random() * 0.4 : 8 + Math.random() * 6;
    const f = new w.BufferGeometry();
    f.setAttribute("position", new w.BufferAttribute(u, 3)), f.setAttribute("aSpeed", new w.BufferAttribute(c, 1));
    const d = r.kind === "snow", m = new w.PointsMaterial({
      color: d ? 16777215 : 10148351,
      size: d ? 0.18 : 0.12,
      transparent: !0,
      opacity: d ? 0.85 : 0.6,
      depthWrite: !1,
      sizeAttenuation: !0
    });
    return { geometry: f, material: m, kind: r.kind };
  }, [r?.kind, r?.intensity, n, e, t]);
  return de((u, c) => {
    if (!o.current || !i || !s) return;
    const d = i.getAttribute("position"), m = i.getAttribute("aSpeed"), h = d.array, b = m.array, y = s === "snow" ? 1 : 6;
    for (let g = 0; g < h.length; g += 3)
      h[g + 1] -= b[g / 3] * c * y, s === "snow" && (h[g + 0] += Math.sin((h[g + 1] + g) * 0.5) * c * 0.3), h[g + 1] < 0 && (h[g + 0] = (Math.random() - 0.5) * n, h[g + 1] = e, h[g + 2] = (Math.random() - 0.5) * n);
    d.needsUpdate = !0;
  }), !i || !a ? null : /* @__PURE__ */ l("points", { ref: o, geometry: i, material: a, frustumCulled: !1 });
}
function Ap(n = !0) {
  L(() => {
    if (!n) return;
    const e = () => {
      const r = be.getState(), o = Math.floor(r.totalMinutes / (60 * 24)), i = De.getState().current;
      (!i || i.day !== o) && De.getState().rollForDay(o, r.time.season);
    };
    return e(), be.subscribe((r, o) => {
      const i = Math.floor(r.totalMinutes / 1440), a = Math.floor(o.totalMinutes / (60 * 24));
      i !== a && e();
    });
  }, [n]);
}
function Tp(n = !0, e = {}) {
  L(() => {
    if (!n) return;
    const t = () => {
      const o = be.getState().time, { started: i, ended: a } = Mn.getState().refresh(o);
      i.length && e.onStarted && e.onStarted(i), a.length && e.onEnded && e.onEnded(a);
    };
    return t(), be.subscribe((o, i) => {
      (o.time.day !== i.time.day || o.time.month !== i.time.month || o.time.season !== i.time.season || o.time.weekday !== i.time.weekday) && t();
    });
  }, [n, e.onStarted, e.onEnded]);
}
function _p({ position: n = "top-left", excludeIds: e = [] }) {
  const t = Mn((a) => a.active), r = Br(), o = t.filter((a) => !e.includes(a));
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
      children: o.map((a) => {
        const s = r.get(a);
        if (!s) return null;
        const u = s.tags?.some((c) => c === "festival" || c === "tourney");
        return /* @__PURE__ */ x(
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
              /* @__PURE__ */ l("span", { children: s.name })
            ]
          },
          a
        );
      })
    }
  );
}
const gl = [
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
let yo = !1;
function Pp() {
  yo || (yo = !0, Br().registerAll(gl));
}
function bo(n, e) {
  return { id: n, position: e, size: [4, 4], state: "empty" };
}
const et = xe((n, e) => ({
  houses: {},
  residents: {},
  decorationScore: 0,
  registerHouse: (t) => {
    if (e().houses[t.id]) return;
    const o = { ...bo(t.id, t.position), ...t };
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
    const i = e().houses[t], a = e().residents[r];
    return !i || !a || i.state === "occupied" ? !1 : (n({
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
        [r]: { ...a, movedInDay: o }
      }
    }), fe("reward", `${a.name}이(가) 이사 왔다!`), !0);
  },
  moveOut: (t) => {
    const r = e().houses[t];
    if (!r || r.state !== "occupied") return !1;
    const o = r.residentId ? e().residents[r.residentId] : null;
    return n({
      houses: {
        ...e().houses,
        [t]: bo(t, r.position)
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
})), yl = {
  tile: 2,
  wall: 1,
  placedObject: 5,
  base: 0
};
function Rp(n = !0, e = {}) {
  L(() => {
    if (!n) return;
    const t = { ...yl, ...e }, r = (i) => {
      let a = 0, s = 0;
      const u = i.objects.length;
      for (const f of i.tileGroups.values())
        a += f.tiles.length;
      for (const f of i.wallGroups.values())
        s += f.walls.length;
      const c = t.base + a * t.tile + s * t.wall + u * t.placedObject;
      et.getState().setDecorationScore(c);
    };
    return r(U.getState()), U.subscribe((i) => r(i));
  }, [n, e.tile, e.wall, e.placedObject, e.base]);
}
function Np({
  id: n,
  position: e,
  size: t = [4, 4],
  emptyColor: r = "#705038",
  reservedColor: o = "#c8a85a",
  occupiedColor: i = "#5a8acf"
}) {
  const a = et((h) => h.registerHouse), s = et((h) => h.unregisterHouse), u = et((h) => h.houses[n]), c = et((h) => h.residents);
  L(() => (a({ id: n, position: e, size: t }), () => s(n)), [n, e, t, a, s]);
  const f = u ? u.state === "occupied" ? i : u.state === "reserved" ? o : r : r, d = u?.residentId ? c[u.residentId] : null, m = F(() => new w.PlaneGeometry(t[0], t[1]), [t[0], t[1]]);
  return /* @__PURE__ */ x("group", { position: e, children: [
    /* @__PURE__ */ l("mesh", { geometry: m, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: /* @__PURE__ */ l("meshToonMaterial", { color: f, transparent: !0, opacity: 0.7 }) }),
    u?.state === "occupied" && d && /* @__PURE__ */ x(Se, { children: [
      /* @__PURE__ */ x("mesh", { position: [0, 0.6, 0], castShadow: !0, children: [
        /* @__PURE__ */ l("boxGeometry", { args: [Math.max(1.4, t[0] * 0.6), 1.2, Math.max(1.4, t[1] * 0.6)] }),
        /* @__PURE__ */ l("meshToonMaterial", { color: d.bodyColor ?? "#e8d8b8" })
      ] }),
      /* @__PURE__ */ x("mesh", { position: [0, 1.5, 0], castShadow: !0, children: [
        /* @__PURE__ */ l("coneGeometry", { args: [Math.max(1, t[0] * 0.45), 0.7, 4] }),
        /* @__PURE__ */ l("meshToonMaterial", { color: d.hatColor ?? "#a85a5a" })
      ] })
    ] }),
    u?.state === "reserved" && /* @__PURE__ */ x("mesh", { position: [0, 0.5, 0], children: [
      /* @__PURE__ */ l("boxGeometry", { args: [0.4, 1, 0.4] }),
      /* @__PURE__ */ l("meshToonMaterial", { color: o })
    ] })
  ] });
}
function Ep({ position: n = "top-right", offset: e }) {
  const t = et((f) => f.decorationScore), r = et((f) => f.houses), o = et((f) => f.residents), i = Object.keys(r).length, a = Object.values(r).filter((f) => f.state === "occupied").length, s = Object.keys(o).length, c = { ...n === "bottom-right" ? { bottom: 12, right: 100 } : n === "top-left" ? { top: 160, left: 12 } : n === "bottom-left" ? { bottom: 12, left: 240 } : { top: 50, right: 12 }, ...e ?? {} };
  return /* @__PURE__ */ x(
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
        /* @__PURE__ */ x("div", { children: [
          "마을 점수 ",
          /* @__PURE__ */ l("span", { style: { color: "#ffd84a", fontWeight: 700 }, children: t })
        ] }),
        /* @__PURE__ */ x("div", { children: [
          "주민 ",
          a,
          "/",
          i,
          " (등록 ",
          s,
          ")"
        ] })
      ]
    }
  );
}
class bl {
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
      const a = t[this.bgmStep % t.length] ?? 0, s = o * Math.pow(2, a / 12), u = this.ctx.createOscillator(), c = this.ctx.createGain();
      u.type = "triangle", u.frequency.value = s;
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
        const a = this.ctx.createBufferSource();
        a.buffer = i, a.loop = o;
        const s = this.ctx.createGain();
        s.gain.value = r, a.connect(s), s.connect(t), a.start();
      } catch {
      }
  }
}
let Wn = null;
function mt() {
  return Wn || (Wn = new bl()), Wn;
}
const He = xe((n, e) => ({
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
    r.masterMuted || r.sfxMuted || (mt().resume(), mt().playSfx(t));
  },
  playBgm: (t) => {
    mt().resume(), mt().playBgm(t), n({ currentBgmId: t?.id ?? null }), e().apply();
  },
  stopBgm: () => {
    mt().stopBgm(), n({ currentBgmId: null });
  },
  apply: () => {
    const t = e(), r = mt();
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
})), vl = [0, 2, 4, 5, 7, 9, 11], xl = [0, 2, 3, 5, 7, 8, 10];
function wl(n) {
  return n === "rain" || n === "storm" || n === "snow" ? xl : vl;
}
function Sl(n) {
  return n < 6 ? "night" : n < 10 ? "dawn" : n < 18 ? "day" : n < 22 ? "dusk" : "night";
}
function Ml(n, e) {
  const t = Sl(n), r = wl(e), o = t === "night" ? 174.6 : t === "dawn" ? 220 : t === "dusk" ? 196 : 261.6, i = t === "day" ? 700 : 950, a = [r[0], r[2], r[4], r[2], r[0], r[3], r[1], r[4]];
  return {
    id: `bgm.${t}.${e ?? "unknown"}`,
    baseFreq: o,
    intervalMs: i,
    pattern: a,
    volume: e === "storm" ? 0.6 : 1
  };
}
function zp(n = !0) {
  L(() => {
    if (!n) return;
    const e = () => {
      const o = be.getState(), i = De.getState().current, a = Ml(o.time.hour, i?.kind);
      He.getState().currentBgmId !== a.id && He.getState().playBgm(a);
    }, t = be.subscribe((o, i) => {
      o.time.hour !== i.time.hour && e();
    }), r = De.subscribe((o, i) => {
      o.current?.kind !== i.current?.kind && e();
    });
    return e(), () => {
      t(), r(), He.getState().stopBgm();
    };
  }, [n]);
}
function Bp({ position: n = "bottom-right", offset: e }) {
  const t = He((d) => d.masterMuted), r = He((d) => d.bgmMuted), o = He((d) => d.sfxMuted), i = He((d) => d.toggleMaster), a = He((d) => d.toggleBgm), s = He((d) => d.toggleSfx), c = { ...n === "top-right" ? { top: 50, right: 200 } : n === "bottom-left" ? { bottom: 12, left: 240 } : n === "top-left" ? { top: 220, left: 12 } : { bottom: 12, right: 110 }, ...e ?? {} }, f = (d, m, h) => /* @__PURE__ */ x(
    "button",
    {
      onClick: h,
      style: {
        padding: "4px 8px",
        background: m ? "rgba(80,30,30,0.85)" : "rgba(20,20,28,0.85)",
        color: m ? "#ff8a8a" : "#fff",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 11,
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 6,
        cursor: "pointer"
      },
      children: [
        d,
        m ? " OFF" : ""
      ]
    }
  );
  return /* @__PURE__ */ x(
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
        f("Bgm", r, a),
        f("Sfx", o, s)
      ]
    }
  );
}
const Cl = {
  grass: { freq: 320, duration: 0.07, type: "triangle", volume: 0.18 },
  sand: { freq: 220, duration: 0.1, type: "sine", volume: 0.2 },
  snow: { freq: 380, duration: 0.1, type: "triangle", volume: 0.22 },
  wood: { freq: 540, duration: 0.06, type: "square", volume: 0.14 },
  stone: { freq: 760, duration: 0.05, type: "square", volume: 0.16 },
  water: { freq: 180, duration: 0.13, type: "sine", volume: 0.24 }
};
function kl(n, e) {
  const t = ue.GRID_CELL_SIZE, r = U.getState().tileGroups;
  for (const o of r.values())
    for (const i of o.tiles) {
      const a = (i.size || 1) * t / 2;
      if (!(Math.abs(i.position.x - n) > a) && !(Math.abs(i.position.z - e) > a)) {
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
function Dp({
  strideMeters: n = 0.65,
  maxStepsPerSecond: e = 6,
  volume: t = 1,
  resolveSurface: r = kl,
  enabled: o = !0
} = {}) {
  const { position: i, isGrounded: a, isMoving: s, speed: u } = dt({ updateInterval: 32 }), c = N({ x: i.x, z: i.z }), f = N(0), d = N(0);
  return L(() => {
    c.current.x = i.x, c.current.z = i.z;
  }, []), de(() => {
    if (!o) return;
    const m = performance.now(), h = i.x - c.current.x, b = i.z - c.current.z;
    if (c.current.x = i.x, c.current.z = i.z, !a || !s) {
      f.current = 0;
      return;
    }
    const y = Math.hypot(h, b);
    if (y <= 0 || (f.current += y, f.current < n) || m - d.current < 1e3 / e) return;
    f.current = 0, d.current = m;
    const g = r(i.x, i.z), p = Cl[g], S = Math.min(1.4, 0.7 + u * 0.06);
    He.getState().playSfx({
      id: `footstep-${g}`,
      type: p.type ?? "sine",
      freq: p.freq ?? 320,
      duration: p.duration ?? 0.08,
      volume: (p.volume ?? 0.2) * t * S
    });
  }), null;
}
const ht = {
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
}, Il = {
  hat: "모자",
  top: "상의",
  bottom: "하의",
  shoes: "신발",
  face: "표정"
}, Al = {
  short: "단발",
  long: "긴머리",
  cap: "모자머리",
  bun: "쪽머리",
  spiky: "뻗친머리"
}, Tl = {
  default: "기본",
  smile: "미소",
  wink: "윙크",
  sleepy: "졸림",
  surprised: "놀람"
}, Hn = {
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  face: null
}, We = xe((n, e) => ({
  appearance: { ...ht, colors: { ...ht.colors } },
  outfits: { ...Hn },
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
    appearance: { ...ht, colors: { ...ht.colors } },
    outfits: { ...Hn }
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
        ...ht,
        ...t.appearance,
        colors: { ...ht.colors, ...t.appearance.colors }
      },
      outfits: { ...Hn, ...t.outfits }
    });
  }
})), _l = [
  { key: "body", label: "피부" },
  { key: "hair", label: "머리" },
  { key: "hat", label: "모자" },
  { key: "top", label: "상의" },
  { key: "bottom", label: "하의" },
  { key: "shoes", label: "신발" }
], Pl = ["short", "long", "cap", "bun", "spiky"], Rl = ["default", "smile", "wink", "sleepy", "surprised"], Nl = ["hat", "top", "bottom", "shoes", "face"];
function Fp({ toggleKey: n, open: e, onClose: t } = {}) {
  const r = typeof e == "boolean", [o, i] = Y(!1), a = r ? e : o, s = We((g) => g.appearance), u = We((g) => g.outfits), c = We((g) => g.setName), f = We((g) => g.setColor), d = We((g) => g.setHair), m = We((g) => g.setFace), h = We((g) => g.equipOutfit), b = We((g) => g.resetAppearance);
  if (L(() => {
    if (!n || r) return;
    const g = (p) => {
      const S = p.target?.tagName?.toLowerCase();
      if (S === "input" || S === "textarea") return;
      const v = n.toLowerCase(), M = `Key${n.toUpperCase()}`;
      p.code !== M && p.key.toLowerCase() !== v || i((T) => !T);
    };
    return window.addEventListener("keydown", g), () => window.removeEventListener("keydown", g);
  }, [n, r]), !a) return null;
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
      children: /* @__PURE__ */ x(
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
            /* @__PURE__ */ x("header", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }, children: [
              /* @__PURE__ */ l("h2", { style: { margin: 0, fontSize: 16, fontWeight: 600, flex: 1 }, children: "캐릭터 만들기" }),
              /* @__PURE__ */ l(
                "button",
                {
                  onClick: b,
                  style: jn,
                  children: "기본값"
                }
              ),
              /* @__PURE__ */ l("button", { onClick: y, style: jn, children: "닫기" })
            ] }),
            /* @__PURE__ */ x("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ l("label", { style: At, children: "이름" }),
              /* @__PURE__ */ l(
                "input",
                {
                  value: s.name,
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
            /* @__PURE__ */ x("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ l("label", { style: At, children: "색상" }),
              /* @__PURE__ */ l("div", { style: vo, children: _l.map(({ key: g, label: p }) => /* @__PURE__ */ x("div", { style: xo, children: [
                /* @__PURE__ */ l("span", { style: { flex: 1 }, children: p }),
                /* @__PURE__ */ l(
                  "input",
                  {
                    type: "color",
                    value: s.colors[g],
                    onChange: (S) => f(g, S.target.value),
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
            /* @__PURE__ */ x("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ l("label", { style: At, children: "헤어" }),
              /* @__PURE__ */ l("div", { style: wo, children: Pl.map((g) => /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => d(g),
                  style: So(s.hair === g),
                  children: Al[g]
                },
                g
              )) })
            ] }),
            /* @__PURE__ */ x("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ l("label", { style: At, children: "표정" }),
              /* @__PURE__ */ l("div", { style: wo, children: Rl.map((g) => /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => m(g),
                  style: So(s.face === g),
                  children: Tl[g]
                },
                g
              )) })
            ] }),
            /* @__PURE__ */ x("section", { children: [
              /* @__PURE__ */ l("label", { style: At, children: "장착 슬롯" }),
              /* @__PURE__ */ l("div", { style: vo, children: Nl.map((g) => /* @__PURE__ */ x("div", { style: xo, children: [
                /* @__PURE__ */ l("span", { style: { flex: 1 }, children: Il[g] }),
                /* @__PURE__ */ l("span", { style: { color: u[g] ? "#7adf90" : "rgba(243,244,248,0.45)" }, children: u[g] ?? "비어있음" }),
                u[g] && /* @__PURE__ */ l("button", { onClick: () => h(g, null), style: jn, children: "벗기" })
              ] }, g)) })
            ] })
          ]
        }
      )
    }
  );
}
const At = {
  display: "block",
  marginBottom: 6,
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: "rgba(243,244,248,0.62)"
}, vo = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, xo = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 8
}, wo = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
}, So = (n) => ({
  padding: "6px 12px",
  borderRadius: 999,
  border: n ? "1px solid #ffd84a" : "1px solid rgba(255,255,255,0.14)",
  background: n ? "rgba(255,216,74,0.12)" : "rgba(255,255,255,0.04)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}), jn = {
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
function El(n) {
  return F(() => {
    switch (n) {
      case "long":
        return {
          geometry: new w.SphereGeometry(0.28, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
          position: [0, -0.05, 0],
          scale: [1.05, 1.55, 1.05]
        };
      case "cap":
        return {
          geometry: new w.CylinderGeometry(0.32, 0.34, 0.18, 16),
          position: [0, 0.1, 0],
          scale: [1, 1, 1]
        };
      case "bun":
        return {
          geometry: new w.SphereGeometry(0.22, 12, 10),
          position: [0, 0.18, -0.05],
          scale: [1, 1, 1]
        };
      case "spiky":
        return {
          geometry: new w.ConeGeometry(0.32, 0.36, 8),
          position: [0, 0.15, 0],
          scale: [1, 1, 1]
        };
      case "short":
      default:
        return {
          geometry: new w.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
          position: [0, 0.05, 0],
          scale: [1, 1, 1]
        };
    }
  }, [n]);
}
function Lp({
  headHeight: n = 1.55,
  enabled: e = !0,
  opacity: t = 1
} = {}) {
  const r = N(null), o = We((d) => d.appearance), i = We((d) => d.outfits), { position: a, rotation: s } = dt({ updateInterval: 16 }), u = El(o.hair);
  if (de(() => {
    const d = r.current;
    d && (d.position.set(a.x, a.y + n, a.z), d.rotation.set(0, s.y, 0));
  }), !e) return null;
  const c = !!i.hat, f = w.MathUtils.clamp(t, 0, 1);
  return /* @__PURE__ */ x("group", { ref: r, dispose: null, children: [
    !c && /* @__PURE__ */ x("mesh", { position: u.position, scale: u.scale, castShadow: !0, children: [
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
    c && /* @__PURE__ */ x("group", { position: [0, 0.1, 0], children: [
      /* @__PURE__ */ x("mesh", { castShadow: !0, children: [
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
      /* @__PURE__ */ x("mesh", { position: [0, -0.1, 0], children: [
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
    /* @__PURE__ */ l(zl, { style: o.face, opacity: f })
  ] });
}
function zl({ style: n, opacity: e }) {
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
  return /* @__PURE__ */ x("group", { position: [0, -0.18, 0.32], children: [
    /* @__PURE__ */ x("mesh", { position: [-0.13, 0, 0], children: [
      /* @__PURE__ */ l("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ l("meshBasicMaterial", { color: t, transparent: !0, opacity: e * 0.6 })
    ] }),
    /* @__PURE__ */ x("mesh", { position: [0.13, 0, 0], children: [
      /* @__PURE__ */ l("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ l("meshBasicMaterial", { color: t, transparent: !0, opacity: e * 0.6 })
    ] })
  ] });
}
function Gp({
  capacity: n = 64,
  step: e = 0.55,
  lifetime: t = 9,
  size: r = 0.34,
  y: o = 0.02,
  color: i = "#1a1612"
} = {}) {
  const a = N(null), { position: s, isMoving: u, isGrounded: c } = dt({ updateInterval: 32 }), f = F(() => new w.Color(i), [i]), d = F(
    () => Array.from({ length: n }, () => ({
      x: 0,
      z: 0,
      bornAt: -1 / 0,
      side: 1
    })),
    [n]
  ), m = N(null), h = N(0), b = N(1), y = F(() => {
    const v = new w.PlaneGeometry(1, 1);
    return v.rotateX(-Math.PI / 2), v;
  }, []), g = F(
    () => new w.MeshBasicMaterial({
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
  const p = F(() => new w.Object3D(), []), S = F(() => new w.Color(), []);
  return de((v) => {
    const M = a.current;
    if (!M) return;
    const T = v.clock.elapsedTime;
    if (c && u) {
      const P = m.current, k = s.x - (P?.x ?? s.x), R = s.z - (P?.z ?? s.z), B = Math.hypot(k, R);
      if (!P || B >= e) {
        const E = d[h.current];
        E && (E.x = s.x, E.z = s.z, E.bornAt = T, E.side = b.current, b.current = b.current === 1 ? -1 : 1, h.current = (h.current + 1) % n, m.current = { x: s.x, z: s.z });
      }
    }
    let C = 0;
    for (let P = 0; P < n; P++) {
      const k = d[P];
      if (!k) continue;
      const R = T - k.bornAt;
      if (R < 0 || R > t) continue;
      const B = 1 - R / t;
      p.position.set(k.x + k.side * 0.07, o, k.z), p.rotation.set(0, 0, 0), p.scale.set(r, 1, r * 1.4), p.updateMatrix(), M.setMatrixAt(C, p.matrix), S.copy(f).multiplyScalar(0.6 + B * 0.4), M.setColorAt(C, S), C++;
    }
    M.count = C, M.instanceMatrix.needsUpdate = !0, M.instanceColor && (M.instanceColor.needsUpdate = !0);
  }), /* @__PURE__ */ l(
    "instancedMesh",
    {
      ref: a,
      args: [y, g, n],
      frustumCulled: !1,
      renderOrder: 1
    }
  );
}
const Op = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
}, an = "ko";
function Bl() {
  if (typeof navigator > "u") return an;
  const n = (navigator.language || an).slice(0, 2).toLowerCase();
  return n === "ko" || n === "en" || n === "ja" ? n : an;
}
function $n(n, e) {
  return e ? n.replace(/\{(\w+)\}/g, (t, r) => {
    const o = e[r];
    return o == null ? `{${r}}` : String(o);
  }) : n;
}
const Ut = xe((n, e) => ({
  locale: Bl(),
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
      const a = t[i];
      a && (o[i] = { ...r[i], ...a });
    }), n({ bundle: o });
  },
  t: (t, r) => {
    const { locale: o, bundle: i } = e(), a = i[o]?.[t];
    if (a !== void 0) return $n(a, r);
    const s = i[an]?.[t];
    return $n(s !== void 0 ? s : t, r);
  },
  serialize: () => ({ version: 1, locale: e().locale }),
  hydrate: (t) => {
    !t || t.version !== 1 || n({ locale: t.locale });
  }
}));
function Up(n, e) {
  return Ut.getState().t(n, e);
}
function Wp() {
  const n = Ut((t) => t.locale), e = Ut((t) => t.bundle);
  return V(
    (t, r) => {
      const o = e[n]?.[t];
      if (o !== void 0) return Vn(o, r);
      const i = e.ko?.[t];
      return Vn(i !== void 0 ? i : t, r);
    },
    [n, e]
  );
}
function Hp() {
  const n = Ut((t) => t.locale), e = Ut((t) => t.setLocale);
  return { locale: n, setLocale: e };
}
function Vn(n, e) {
  return e ? n.replace(/\{(\w+)\}/g, (t, r) => {
    const o = e[r];
    return o == null ? `{${r}}` : String(o);
  }) : n;
}
const Dl = [
  { id: "jump", label: "점프", key: " " },
  { id: "use", label: "사용", key: "F" }
];
function Fl() {
  return typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(pointer: coarse)").matches;
}
function Mo(n, e) {
  if (typeof window > "u") return;
  const t = /^[a-zA-Z]$/.test(e) ? `Key${e.toUpperCase()}` : e === " " ? "Space" : e, r = new KeyboardEvent(n, {
    key: e === " " ? " " : e.toLowerCase(),
    code: t,
    bubbles: !0
  });
  window.dispatchEvent(r);
}
function jp({
  forceVisible: n = !1,
  radius: e = 60,
  deadzone: t = 0.18,
  runThreshold: r = 0.8,
  actions: o = Dl
} = {}) {
  const [i, a] = Y(!1), s = N(null), u = N(null), c = N({
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
    a(n || Fl());
  }, [n]), L(() => {
    if (!i) return;
    const f = s.current, d = u.current;
    if (!f || !d) return;
    const m = $i.getInstance(), h = () => {
      const p = c.current, S = {};
      p.forward && (S.forward = !1), p.backward && (S.backward = !1), p.leftward && (S.leftward = !1), p.rightward && (S.rightward = !1), p.run && (S.shift = !1), p.forward = p.backward = p.leftward = p.rightward = p.run = !1, Object.keys(S).length > 0 && m.updateKeyboard(S), d.style.transform = "translate(-50%, -50%)", c.current.pointerId = -1;
    }, b = (p) => {
      p.preventDefault();
      const S = f.getBoundingClientRect();
      c.current.cx = S.left + S.width / 2, c.current.cy = S.top + S.height / 2, c.current.pointerId = p.pointerId, f.setPointerCapture(p.pointerId), y(p);
    }, y = (p) => {
      if (p.pointerId !== c.current.pointerId) return;
      const S = p.clientX - c.current.cx, v = p.clientY - c.current.cy, M = Math.hypot(S, v), T = Math.min(M, e), C = Math.atan2(v, S), P = Math.cos(C) * T, k = Math.sin(C) * T;
      d.style.transform = `translate(calc(-50% + ${P}px), calc(-50% + ${k}px))`;
      const R = T / e, B = c.current, E = {};
      if (R < t)
        B.forward && (E.forward = !1, B.forward = !1), B.backward && (E.backward = !1, B.backward = !1), B.leftward && (E.leftward = !1, B.leftward = !1), B.rightward && (E.rightward = !1, B.rightward = !1), B.run && (E.shift = !1, B.run = !1);
      else {
        const _ = Math.cos(C), z = Math.sin(C), W = z < -0.35, H = z > 0.35, j = _ < -0.35, A = _ > 0.35, G = R >= r;
        B.forward !== W && (E.forward = W, B.forward = W), B.backward !== H && (E.backward = H, B.backward = H), B.leftward !== j && (E.leftward = j, B.leftward = j), B.rightward !== A && (E.rightward = A, B.rightward = A), B.run !== G && (E.shift = G, B.run = G);
      }
      Object.keys(E).length > 0 && m.updateKeyboard(E);
    }, g = (p) => {
      p.pointerId === c.current.pointerId && h();
    };
    return f.addEventListener("pointerdown", b), f.addEventListener("pointermove", y), f.addEventListener("pointerup", g), f.addEventListener("pointercancel", g), f.addEventListener("pointerleave", g), () => {
      f.removeEventListener("pointerdown", b), f.removeEventListener("pointermove", y), f.removeEventListener("pointerup", g), f.removeEventListener("pointercancel", g), f.removeEventListener("pointerleave", g), h();
    };
  }, [i, e, t, r]), i ? /* @__PURE__ */ x(
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
            ref: s,
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
            children: o.map((f) => /* @__PURE__ */ l(Ll, { action: f }, f.id))
          }
        )
      ]
    }
  ) : null;
}
function Ll({ action: n }) {
  const [e, t] = Y(!1), r = () => {
    t(!0), n.key && Mo("keydown", n.key), n.onPress?.();
  }, o = () => {
    t(!1), n.key && Mo("keyup", n.key), n.onRelease?.();
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
const Gl = ["intel", "mali", "adreno 3", "adreno 4", "powervr"], Ol = ["swiftshader", "llvmpipe", "software"], Co = ["rtx", "radeon rx", "apple m", "apple a1", "apple a2"];
function Ul() {
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
  const a = navigator.hardwareConcurrency ?? 4, s = navigator.deviceMemory ?? 4, u = /android|iphone|ipad|ipod|mobile|opera mini/i.test(navigator.userAgent), c = Math.min(window.devicePixelRatio || 1, 2);
  return {
    webgl2: i,
    maxTextureSize: o,
    rendererName: t,
    vendorName: r,
    cores: a,
    memory: s,
    isMobile: u,
    pixelRatio: c
  };
}
function Wl(n) {
  const e = n.rendererName.toLowerCase();
  return Ol.some((t) => e.includes(t)) ? "low" : n.isMobile ? Co.some((t) => e.includes(t)) ? "medium" : "low" : Gl.some((t) => e.includes(t)) ? n.cores >= 8 && n.memory >= 8 ? "medium" : "low" : Co.some((t) => e.includes(t)) || n.cores >= 8 && n.memory >= 8 && n.webgl2 ? "high" : n.cores >= 4 && n.memory >= 4 ? "medium" : "low";
}
function Dr(n) {
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
function ko() {
  const n = Ul(), e = Wl(n);
  return { profile: Dr(e), capabilities: n };
}
const Hl = Dr("medium"), jl = xe((n) => ({
  profile: Hl,
  capabilities: null,
  manualOverride: !1,
  detect: () => {
    const { profile: e, capabilities: t } = ko();
    n({ profile: e, capabilities: t, manualOverride: !1 });
  },
  setTier: (e) => {
    n({ profile: Dr(e), manualOverride: !0 });
  },
  resetAuto: () => {
    const { profile: e, capabilities: t } = ko();
    n({ profile: e, capabilities: t, manualOverride: !1 });
  }
})), en = "outdoor", qn = (n) => new Promise((e) => setTimeout(e, n)), $l = 220, Vl = 80, ql = 240, rt = xe((n, e) => ({
  current: en,
  pending: null,
  scenes: {
    [en]: { id: en, name: "Outdoor", interior: !1 }
  },
  transition: { progress: 0, color: "#000000", active: !1 },
  lastReturnPoint: null,
  registerScene: (t) => n((r) => r.scenes[t.id] ? r : { scenes: { ...r.scenes, [t.id]: t } }),
  unregisterScene: (t) => n((r) => {
    if (t === en || !r.scenes[t]) return r;
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
    const s = i.interior ?? !1 ? "#0d0d10" : "#f5f5f5";
    n({ pending: t, transition: { active: !0, color: s, progress: 0 } });
    const u = performance.now();
    for (; ; ) {
      const f = Math.min(1, (performance.now() - u) / $l);
      if (e().setTransition({ progress: f }), f >= 1) break;
      await qn(16);
    }
    r?.saveReturn && n({ lastReturnPoint: r.saveReturn }), n({ current: t }), await qn(Vl);
    const c = performance.now();
    for (; ; ) {
      const f = Math.min(1, (performance.now() - c) / ql);
      if (e().setTransition({ progress: 1 - f }), f >= 1) break;
      await qn(16);
    }
    n({ pending: null, transition: { active: !1, color: s, progress: 0 } });
  },
  serialize: () => ({ version: 1, current: e().current }),
  hydrate: (t) => {
    !t || t.version !== 1 || e().scenes[t.current] && n({ current: t.current, pending: null });
  }
}));
function Yl(n, e) {
  if (n === e) return !0;
  if (n.size !== e.size) return !1;
  for (const t of n)
    if (!e.has(t)) return !1;
  return !0;
}
const $e = xe((n) => ({
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
  setVisibleRooms: (e, t, r) => n((o) => o.initializedSceneId === e && o.currentRoomId === t && Yl(o.visibleRoomIds, r) ? o : {
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
function $p({ zIndex: n = 9999 } = {}) {
  const e = rt((t) => t.transition);
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
function Vp({ scene: n, children: e }) {
  const t = rt((i) => i.registerScene), r = rt((i) => i.unregisterScene), o = rt((i) => i.current);
  return L(() => (t(n), () => r(n.id)), [n, t, r]), o !== n.id ? null : /* @__PURE__ */ l(Se, { children: e });
}
function qp({
  position: n,
  sceneId: e,
  entry: t,
  exitOverride: r,
  radius: o = 1.4,
  cooldownMs: i = 800,
  color: a = "#5a8acf",
  label: s
}) {
  const u = rt((y) => y.goTo), c = rt((y) => y.current), { teleport: f } = qo(), { position: d } = dt({ updateInterval: 50 }), m = N(0), h = F(() => new w.CylinderGeometry(o, o, 0.08, 28), [o]);
  L(() => () => h.dispose(), [h]), de(() => {
    const y = performance.now();
    if (y - m.current < i) return;
    const g = d.x - n[0], p = d.z - n[2];
    g * g + p * p > o * o || (m.current = y, c !== e && b());
  });
  async function b() {
    const y = r ?? {
      position: [n[0], n[1], n[2]]
    };
    await u(e, { entry: t, saveReturn: y });
    const g = new w.Vector3(t.position[0], t.position[1], t.position[2]);
    f(g);
  }
  return /* @__PURE__ */ x("group", { position: n, children: [
    /* @__PURE__ */ l("mesh", { rotation: [0, 0, 0], geometry: h, children: /* @__PURE__ */ l(
      "meshStandardMaterial",
      {
        color: a,
        emissive: a,
        emissiveIntensity: 0.35,
        transparent: !0,
        opacity: 0.6
      }
    ) }),
    s && /* @__PURE__ */ x("mesh", { position: [0, 1.3, 0], children: [
      /* @__PURE__ */ l("boxGeometry", { args: [0.04, 0.6, 0.04] }),
      /* @__PURE__ */ l("meshStandardMaterial", { color: a, emissive: a, emissiveIntensity: 0.4 })
    ] })
  ] });
}
function Yp({ sceneId: n, roomId: e, bounds: t, children: r }) {
  const o = rt((c) => c.current), i = $e((c) => c.registerRoom), a = $e((c) => c.unregisterRoom), s = $e((c) => c.initializedSceneId), u = $e((c) => c.visibleRoomIds);
  return L(() => (i({ id: e, sceneId: n, bounds: t }), () => a(e)), [e, n, t, i, a]), o !== n ? null : s !== n ? /* @__PURE__ */ l(Se, { children: r }) : u.has(e) ? /* @__PURE__ */ l(Se, { children: r }) : null;
}
function Zp({
  id: n,
  sceneId: e,
  fromRoomId: t,
  toRoomId: r,
  position: o,
  radius: i,
  revealDistance: a
}) {
  const s = $e((c) => c.registerPortal), u = $e((c) => c.unregisterPortal);
  return L(() => (s({
    id: n,
    sceneId: e,
    fromRoomId: t,
    toRoomId: r,
    position: o,
    ...i !== void 0 ? { radius: i } : {},
    ...a !== void 0 ? { revealDistance: a } : {}
  }), () => u(n)), [n, e, t, r, o, i, a, s, u]), null;
}
const Zl = 0.12;
function Xl(n, e) {
  return n.x >= e.min[0] && n.x <= e.max[0] && n.y >= e.min[1] && n.y <= e.max[1] && n.z >= e.min[2] && n.z <= e.max[2];
}
function oi(n, e, t) {
  for (const r of e)
    if (r.sceneId === n && Xl(t, r.bounds))
      return r.id;
  return null;
}
function Kl(n) {
  const e = n.rooms.filter((i) => i.sceneId === n.sceneId);
  if (e.length === 0) return /* @__PURE__ */ new Set();
  const t = oi(n.sceneId, e, n.position);
  if (!t)
    return new Set(e.map((i) => i.id));
  const r = /* @__PURE__ */ new Set([t]), o = n.portals.filter((i) => i.sceneId === n.sceneId);
  for (const i of o) {
    const a = i.revealDistance ?? 3.8, s = n.position.x - i.position[0], u = n.position.y - i.position[1], c = n.position.z - i.position[2];
    s * s + u * u + c * c > a * a || (i.fromRoomId === t ? r.add(i.toRoomId) : i.toRoomId === t && r.add(i.fromRoomId));
  }
  return r;
}
function Xp() {
  const n = rt((s) => s.current), e = $e((s) => s.rooms), t = $e((s) => s.portals), r = $e((s) => s.setVisibleRooms), o = $e((s) => s.reset), { position: i } = dt({ updateInterval: 50 }), a = N(0);
  return L(() => o, [o]), de((s, u) => {
    if (a.current += Math.max(0, u), a.current < Zl) return;
    a.current = 0;
    const c = Array.from(e.values()), f = Array.from(t.values()), d = oi(n, c, i), m = Kl({
      sceneId: n,
      rooms: c,
      portals: f,
      position: i
    });
    r(n, d, m);
  }), null;
}
const Yn = new w.Color("#0a1430"), Jl = new w.Color("#ffb377"), Ql = new w.Color("#ff7a52"), ec = new w.Color("#5b6975"), tc = new w.Color("#dde7f0"), nc = new w.Color("#3b4452");
function rc(n, e) {
  const t = n + e / 60;
  return t < 5 ? { t: 0, phase: "night" } : t < 7 ? { t: (t - 5) / 2, phase: "dawn" } : t < 17 ? { t: 1, phase: "day" } : t < 19 ? { t: 1 - (t - 17) / 2, phase: "dusk" } : { t: 0, phase: "night" };
}
function Kp({
  color: n = "#cfd8e3",
  near: e = 35,
  far: t = 220,
  enabled: r = !0
} = {}) {
  const o = Ze((u) => u.scene), i = be((u) => u.time.hour), a = be((u) => u.time.minute), s = De((u) => u.current);
  return L(() => {
    if (!r) return;
    const u = new w.Color(n), c = rc(i, a), f = u.clone();
    c.phase === "night" ? f.copy(Yn) : c.phase === "dawn" ? f.lerpColors(Yn, Jl, c.t) : c.phase === "dusk" ? f.lerpColors(Yn, Ql, c.t) : f.lerp(u, 0.85);
    let d = e, m = t;
    if (c.phase === "night" ? (d = e * 0.45, m = t * 0.55) : (c.phase === "dawn" || c.phase === "dusk") && (d = e * (0.55 + 0.45 * c.t), m = t * (0.7 + 0.3 * c.t)), s) {
      const h = Math.max(0, Math.min(1, s.intensity));
      s.kind === "rain" ? (f.lerp(ec, 0.5 + h * 0.3), d *= 0.7 - h * 0.2, m *= 0.65 - h * 0.2) : s.kind === "storm" ? (f.lerp(nc, 0.6 + h * 0.3), d *= 0.55 - h * 0.2, m *= 0.5 - h * 0.2) : s.kind === "snow" && (f.lerp(tc, 0.5 + h * 0.25), d *= 0.75, m *= 0.7);
    }
    d = Math.max(2, d), m = Math.max(d + 5, m), o.fog instanceof w.Fog ? (o.fog.color.copy(f), o.fog.near = d, o.fog.far = m) : o.fog = new w.Fog(f.getHex(), d, m), o.background = null;
  }, [o, n, e, t, r, i, a, s?.kind, s?.intensity]), null;
}
const oc = [
  { hour: 0, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: -Math.PI / 2, elevation: -0.3 },
  { hour: 5, sunColor: "#3b3a5a", ambientColor: "#28304a", sunIntensity: 0.15, ambientIntensity: 0.22, azimuth: -Math.PI / 3, elevation: -0.05 },
  { hour: 7, sunColor: "#ffb27a", ambientColor: "#7a8aa6", sunIntensity: 0.55, ambientIntensity: 0.3, azimuth: -Math.PI / 4, elevation: 0.25 },
  { hour: 10, sunColor: "#fff1c8", ambientColor: "#aab4c8", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: -Math.PI / 8, elevation: 0.7 },
  { hour: 13, sunColor: "#ffffff", ambientColor: "#b6c2d8", sunIntensity: 1.05, ambientIntensity: 0.38, azimuth: 0, elevation: 1.05 },
  { hour: 16, sunColor: "#ffe0a8", ambientColor: "#a8b4cc", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: Math.PI / 6, elevation: 0.65 },
  { hour: 18, sunColor: "#ff9a5a", ambientColor: "#806a8a", sunIntensity: 0.55, ambientIntensity: 0.28, azimuth: Math.PI / 3, elevation: 0.18 },
  { hour: 20, sunColor: "#5a3f6a", ambientColor: "#34304a", sunIntensity: 0.18, ambientIntensity: 0.22, azimuth: Math.PI / 2, elevation: -0.05 },
  { hour: 24, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: 3 * Math.PI / 4, elevation: -0.3 }
], Io = {
  spring: new w.Color("#fff0f5"),
  summer: new w.Color("#fff5d8"),
  autumn: new w.Color("#ffd9b0"),
  winter: new w.Color("#dfe8f5")
}, Ao = {
  sunny: { sun: 1, ambient: 1, tint: new w.Color("#ffffff") },
  cloudy: { sun: 0.55, ambient: 0.95, tint: new w.Color("#cfd6e2") },
  rain: { sun: 0.3, ambient: 0.85, tint: new w.Color("#90a0b8") },
  snow: { sun: 0.65, ambient: 1.1, tint: new w.Color("#dfeaf5") },
  storm: { sun: 0.2, ambient: 0.75, tint: new w.Color("#5a6a82") }
};
function ic(n, e) {
  const t = n, r = (e % 24 + 24) % 24;
  let o = t[0], i = t[t.length - 1];
  for (let u = 0; u < t.length - 1; u += 1) {
    const c = t[u], f = t[u + 1];
    if (r >= c.hour && r <= f.hour) {
      o = c, i = f;
      break;
    }
  }
  const a = Math.max(1e-4, i.hour - o.hour), s = w.MathUtils.clamp((r - o.hour) / a, 0, 1);
  return {
    hour: r,
    sunColor: o.sunColor,
    ambientColor: o.ambientColor,
    sunIntensity: w.MathUtils.lerp(o.sunIntensity, i.sunIntensity, s),
    ambientIntensity: w.MathUtils.lerp(o.ambientIntensity, i.ambientIntensity, s),
    azimuth: w.MathUtils.lerp(o.azimuth, i.azimuth, s),
    elevation: w.MathUtils.lerp(o.elevation, i.elevation, s)
    // Mix colors via THREE.Color outside this scope to avoid string allocations.
  };
}
function Jp({
  rigDistance: n = 60,
  castShadow: e = !0,
  shadowMapSize: t = 1024,
  keyframes: r,
  damping: o = 0.12
} = {}) {
  const i = N(null), a = N(null), s = F(() => (r ?? oc).slice().sort((h, b) => h.hour - b.hour), [r]), u = F(() => new w.Color(), []), c = F(() => new w.Color(), []), f = F(() => new w.Color(), []), d = F(() => new w.Color(), []);
  return de(() => {
    const m = i.current, h = a.current;
    if (!m || !h) return;
    const b = be.getState().time, y = De.getState().current, g = y?.kind ?? "sunny", p = w.MathUtils.clamp(y?.intensity ?? 0.5, 0, 1), S = Ao[g] ?? Ao.sunny, v = Io[b.season] ?? Io.spring, M = ic(s, b.hour + b.minute / 60);
    f.set(M.sunColor).lerp(v, 0.18).lerp(S.tint, 0.35 + 0.25 * p), d.set(M.ambientColor).lerp(v, 0.2).lerp(S.tint, 0.3 + 0.3 * p);
    const T = w.MathUtils.clamp(o, 0.01, 1);
    u.copy(m.color).lerp(f, T), c.copy(h.color).lerp(d, T), m.color.copy(u), h.color.copy(c);
    const C = w.MathUtils.lerp(1, S.sun, 0.5 + 0.5 * p), P = w.MathUtils.lerp(1, S.ambient, 0.5 + 0.5 * p);
    m.intensity = w.MathUtils.lerp(m.intensity, M.sunIntensity * C, T), h.intensity = w.MathUtils.lerp(h.intensity, M.ambientIntensity * P, T);
    const k = Math.cos(M.elevation), R = Math.sin(M.elevation), B = Math.cos(M.azimuth) * k * n, E = Math.sin(M.azimuth) * k * n, _ = Math.max(2, R * n);
    m.position.set(B, _, E), m.target.position.set(0, 0, 0), m.target.updateMatrixWorld();
  }), /* @__PURE__ */ x(Se, { children: [
    /* @__PURE__ */ l("ambientLight", { ref: a, intensity: 0.3, color: "#b6c2d8" }),
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
function _e({ label: n, min: e, max: t, step: r, value: o, suffix: i, onChange: a }) {
  return /* @__PURE__ */ x("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#fff" }, children: [
    /* @__PURE__ */ l("span", { style: { width: 60, flexShrink: 0, color: "rgba(255,255,255,0.7)" }, children: n }),
    /* @__PURE__ */ l(
      "input",
      {
        type: "range",
        min: e,
        max: t,
        step: r,
        value: o,
        onChange: (s) => a(Number(s.target.value)),
        style: { flex: 1, accentColor: "#0078d4" }
      }
    ),
    /* @__PURE__ */ x("span", { style: { width: 44, textAlign: "right", fontFamily: "monospace", fontSize: 11 }, children: [
      typeof r == "number" && r < 1 ? o.toFixed(2) : o,
      i ?? ""
    ] })
  ] });
}
function Zn({ label: n, checked: e, onChange: t }) {
  return /* @__PURE__ */ x("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#fff" }, children: [
    /* @__PURE__ */ l("input", { type: "checkbox", checked: e, onChange: (r) => t(r.target.checked), style: { accentColor: "#0078d4" } }),
    /* @__PURE__ */ l("span", { children: n })
  ] });
}
function Tt({ title: n, children: e }) {
  return /* @__PURE__ */ x("div", { style: {
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
function sc() {
  const n = pe((a) => a.cameraOption), e = pe((a) => a.setCameraOption), t = pe((a) => a.mode), r = V((a, s) => {
    e({ [a]: s });
  }, [e]), o = V((a, s) => {
    e({ smoothing: { ...n.smoothing, [a]: s } });
  }, [e, n.smoothing]), i = (a) => n[a] ?? 0;
  return /* @__PURE__ */ x("div", { style: { padding: 10, display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ x("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: -4 }, children: [
      "Mode: ",
      t.control ?? "thirdPerson"
    ] }),
    /* @__PURE__ */ x(Tt, { title: "Distance", children: [
      /* @__PURE__ */ l(_e, { label: "X", min: -50, max: 50, step: 1, value: i("xDistance"), onChange: (a) => r("xDistance", a) }),
      /* @__PURE__ */ l(_e, { label: "Y", min: 0, max: 50, step: 1, value: i("yDistance"), onChange: (a) => r("yDistance", a) }),
      /* @__PURE__ */ l(_e, { label: "Z", min: -50, max: 50, step: 1, value: i("zDistance"), onChange: (a) => r("zDistance", a) })
    ] }),
    /* @__PURE__ */ x(Tt, { title: "FOV / Smoothing", children: [
      /* @__PURE__ */ l(_e, { label: "FOV", min: 30, max: 120, step: 5, value: n.fov ?? 75, suffix: "deg", onChange: (a) => r("fov", a) }),
      /* @__PURE__ */ l(_e, { label: "Pos", min: 0.01, max: 1, step: 0.01, value: n.smoothing?.position ?? 0.1, onChange: (a) => o("position", a) }),
      /* @__PURE__ */ l(_e, { label: "Rot", min: 0.01, max: 1, step: 0.01, value: n.smoothing?.rotation ?? 0.1, onChange: (a) => o("rotation", a) }),
      /* @__PURE__ */ l(_e, { label: "FOV Sm", min: 0.01, max: 1, step: 0.01, value: n.smoothing?.fov ?? 0.2, onChange: (a) => o("fov", a) })
    ] }),
    /* @__PURE__ */ x(Tt, { title: "Zoom", children: [
      /* @__PURE__ */ l(Zn, { label: "Enable Zoom", checked: n.enableZoom ?? !1, onChange: (a) => r("enableZoom", a) }),
      /* @__PURE__ */ l(_e, { label: "Speed", min: 1e-4, max: 0.01, step: 1e-4, value: n.zoomSpeed ?? 1e-3, onChange: (a) => r("zoomSpeed", a) }),
      /* @__PURE__ */ l(_e, { label: "Min", min: 0.1, max: 2, step: 0.1, value: n.minZoom ?? 0.5, onChange: (a) => r("minZoom", a) }),
      /* @__PURE__ */ l(_e, { label: "Max", min: 1, max: 5, step: 0.1, value: n.maxZoom ?? 2, onChange: (a) => r("maxZoom", a) })
    ] }),
    /* @__PURE__ */ x(Tt, { title: "Options", children: [
      /* @__PURE__ */ l(Zn, { label: "Collision", checked: n.enableCollision ?? !1, onChange: (a) => r("enableCollision", a) }),
      /* @__PURE__ */ l(Zn, { label: "Focus Mode", checked: n.enableFocus ?? !1, onChange: (a) => r("enableFocus", a) }),
      /* @__PURE__ */ l(_e, { label: "Focus Dist", min: 1, max: 50, step: 1, value: n.focusDistance ?? 15, onChange: (a) => r("focusDistance", a) }),
      /* @__PURE__ */ l(_e, { label: "Max Dist", min: 5, max: 100, step: 1, value: n.maxDistance ?? 50, onChange: (a) => r("maxDistance", a) })
    ] }),
    /* @__PURE__ */ x(Tt, { title: "Bounds", children: [
      /* @__PURE__ */ l(_e, { label: "Min Y", min: -10, max: 50, step: 1, value: n.bounds?.minY ?? 2, onChange: (a) => e({ bounds: { ...n.bounds, minY: a } }) }),
      /* @__PURE__ */ l(_e, { label: "Max Y", min: 5, max: 100, step: 1, value: n.bounds?.maxY ?? 50, onChange: (a) => e({ bounds: { ...n.bounds, maxY: a } }) })
    ] })
  ] });
}
function ac() {
  const [n, e] = Y("Settings");
  return /* @__PURE__ */ x("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ x("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Settings" ? "active" : ""}`, onClick: () => e("Settings"), children: "Settings" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Presets" ? "active" : ""}`, onClick: () => e("Presets"), children: "Presets" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ l("div", { className: "panel-tab-content", children: (() => {
      switch (n) {
        case "Settings":
          return /* @__PURE__ */ l(sc, {});
        case "Controller":
          return /* @__PURE__ */ l(As, {});
        case "Presets":
          return /* @__PURE__ */ l(Es, {});
        case "Debug":
          return /* @__PURE__ */ l(_s, {});
        default:
          return null;
      }
    })() })
  ] });
}
function lc() {
  const [n, e] = Y("Player");
  return /* @__PURE__ */ x("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ x("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Player" ? "active" : ""}`, onClick: () => e("Player"), children: "Player" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ l("div", { className: "panel-tab-content", children: (() => {
      switch (n) {
        case "Player":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(Ms, {}) });
        case "Controller":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(bs, {}) });
        case "Debug":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(ks, {}) });
        default:
          return null;
      }
    })() })
  ] });
}
function cc() {
  const [n, e] = Y("Controller");
  return /* @__PURE__ */ x("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ x("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ l("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ l("div", { className: "panel-tab-content", children: (() => {
      switch (n) {
        case "Controller":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(Yo, {}) });
        case "Debug":
          return /* @__PURE__ */ l("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ l(Xo, { embedded: !0 }) });
        default:
          return null;
      }
    })() })
  ] });
}
const tn = 60, nn = ({ data: n, color: e, max: t, warn: r }) => {
  const i = n.filter((u) => isFinite(u));
  if (i.length < 2) return null;
  const a = Math.max(1, t), s = i.map((u, c) => {
    const f = c / (i.length - 1) * 100, d = 40 - u / a * 40;
    return `${c === 0 ? "M" : "L"}${f.toFixed(2)},${d.toFixed(2)}`;
  }).join(" ");
  return /* @__PURE__ */ l("div", { className: "perf-chart", children: /* @__PURE__ */ x("svg", { width: "100%", height: 40, preserveAspectRatio: "none", viewBox: "0 0 100 40", children: [
    r !== void 0 && /* @__PURE__ */ l(
      "line",
      {
        x1: "0",
        y1: 40 - r / a * 40,
        x2: "100",
        y2: 40 - r / a * 40,
        stroke: "#facc15",
        strokeWidth: "0.5",
        strokeDasharray: "3,3",
        opacity: 0.5
      }
    ),
    /* @__PURE__ */ l("path", { d: s, fill: "none", stroke: e, strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" })
  ] }) });
}, Xn = ({ value: n, max: e, color: t, label: r }) => {
  const o = e > 0 ? Math.min(100, n / e * 100) : 0;
  return /* @__PURE__ */ x("div", { style: { marginBottom: 4 }, children: [
    /* @__PURE__ */ x("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }, children: [
      /* @__PURE__ */ l("span", { className: "perf-label", children: r }),
      /* @__PURE__ */ l("span", { children: n.toFixed(1) })
    ] }),
    /* @__PURE__ */ l("div", { style: { height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }, children: /* @__PURE__ */ l("div", { style: { width: `${o}%`, height: "100%", background: t, borderRadius: 2, transition: "width 0.3s" } }) })
  ] });
};
function uc() {
  const n = pe(Vo((z) => z.performance)), [e, t] = Y({ current: 0, min: 1 / 0, max: 0, avg: 0, p1Low: 0, history: Array(tn).fill(0) }), [r, o] = Y({ used: 0, limit: 0, history: Array(tn).fill(0) }), [i, a] = Y(0), [s, u] = Y(Array(tn).fill(0)), [c, f] = Y(Array(tn).fill(0)), d = N(0), m = N(0), h = N(0), b = N([]), y = N(0), g = N(null), p = N(0), S = N(0), v = N(0), M = V((z) => {
    if (z.length < 5) return 0;
    const W = [...z].filter((A) => A > 0).sort((A, G) => A - G), H = Math.max(1, Math.floor(W.length * 0.01));
    let j = 0;
    for (let A = 0; A < H; A++) j += W[A] ?? 0;
    return j / H;
  }, []);
  L(() => {
    const z = window.performance.now();
    d.current = z, m.current = z, y.current = z;
    const W = (H) => {
      const j = H - m.current;
      if (m.current = H, b.current.push(j), b.current.length > 300 && b.current.shift(), p.current += j, S.current++, S.current >= 10) {
        const A = p.current / S.current;
        a(A), f((G) => [...G.slice(1), A]), p.current = 0, S.current = 0;
      }
      if (h.current++, H - d.current >= 500) {
        const A = h.current * 1e3 / (H - d.current), G = b.current.map((Z) => Z > 0 ? 1e3 / Z : 0), $ = H - y.current > 3e3;
        t((Z) => {
          const O = [...Z.history.slice(1), A], Q = $ ? Math.min(Z.min === 1 / 0 ? A : Z.min, A) : 1 / 0, J = $ ? Math.max(Z.max, A) : 0, te = $ ? O.filter((re) => re > 0) : [], ne = te.length > 0 ? te.reduce((re, he) => re + he, 0) / te.length : A, se = $ ? M(G) : A;
          return { current: A, min: Q, max: J, avg: ne, p1Low: se, history: O };
        });
        const X = window.performance.memory;
        X && o((Z) => {
          const O = Math.round(X.usedJSHeapSize / 1048576), Q = Math.round(X.jsHeapSizeLimit / 1048576);
          return { used: O, limit: Q, history: [...Z.history.slice(1), O] };
        }), d.current = H, h.current = 0;
      }
      g.current = requestAnimationFrame(W);
    };
    return g.current = requestAnimationFrame(W), () => {
      g.current && cancelAnimationFrame(g.current);
    };
  }, [M]), L(() => {
    const z = n.render.calls;
    z !== v.current && (v.current = z, u((W) => [...W.slice(1), z]));
  }, [n.render.calls]);
  const T = (z) => z >= 55 ? "#4ade80" : z >= 30 ? "#facc15" : "#f87171", C = (z) => z <= 16.7 ? "#4ade80" : z <= 33.3 ? "#facc15" : "#f87171", P = (z) => z <= 100 ? "#4ade80" : z <= 300 ? "#facc15" : "#f87171", k = (z, W) => {
    const H = W > 0 ? z / W * 100 : 0;
    return H < 60 ? "#4ade80" : H < 80 ? "#facc15" : "#f87171";
  }, R = n.render.triangles, B = n.render.calls, E = n.engine.geometries, _ = n.engine.textures;
  return /* @__PURE__ */ x("div", { className: "perf-panel", children: [
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ x("div", { className: "perf-header", children: [
        /* @__PURE__ */ l("h4", { className: "perf-title", children: "Frame Rate" }),
        /* @__PURE__ */ x("span", { className: "perf-current", style: { color: T(e.current) }, children: [
          e.current.toFixed(0),
          " FPS"
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Avg" }),
          e.avg.toFixed(1)
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Min" }),
          isFinite(e.min) ? e.min.toFixed(1) : "..."
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Max" }),
          e.max.toFixed(1)
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "1% Low" }),
          /* @__PURE__ */ l("span", { style: { color: T(e.p1Low) }, children: e.p1Low.toFixed(1) })
        ] })
      ] }),
      /* @__PURE__ */ l(nn, { data: e.history, color: T(e.current), max: 90, warn: 60 })
    ] }),
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ x("div", { className: "perf-header", children: [
        /* @__PURE__ */ l("h4", { className: "perf-title", children: "Frame Time" }),
        /* @__PURE__ */ x("span", { className: "perf-current", style: { color: C(i) }, children: [
          i.toFixed(2),
          " ms"
        ] })
      ] }),
      /* @__PURE__ */ l(Xn, { value: i, max: 33.3, color: C(i), label: "Budget (16.7ms)" }),
      /* @__PURE__ */ l(nn, { data: c, color: C(i), max: 33.3, warn: 16.7 })
    ] }),
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ x("div", { className: "perf-header", children: [
        /* @__PURE__ */ l("h4", { className: "perf-title", children: "GPU Pipeline" }),
        /* @__PURE__ */ x("span", { className: "perf-current", style: { color: P(B) }, children: [
          B,
          " calls"
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Triangles" }),
          R >= 1e6 ? (R / 1e6).toFixed(2) + "M" : R >= 1e3 ? (R / 1e3).toFixed(1) + "K" : R
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Draw Calls" }),
          /* @__PURE__ */ l("span", { style: { color: P(B) }, children: B })
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Tri/Call" }),
          B > 0 ? Math.round(R / B) : 0
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Points" }),
          n.render.points
        ] })
      ] }),
      /* @__PURE__ */ l(nn, { data: s, color: P(B), max: Math.max(200, ...s) })
    ] }),
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ l("div", { className: "perf-header", children: /* @__PURE__ */ l("h4", { className: "perf-title", children: "Resources" }) }),
      /* @__PURE__ */ x("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Geometries" }),
          E
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Textures" }),
          _
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Programs" }),
          n.engine.programs
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Lines" }),
          n.render.lines
        ] })
      ] }),
      /* @__PURE__ */ l(Xn, { value: E, max: 200, color: E > 150 ? "#f87171" : "#4ade80", label: "Geometry Budget" }),
      /* @__PURE__ */ l(Xn, { value: _, max: 100, color: _ > 80 ? "#f87171" : "#4ade80", label: "Texture Budget" })
    ] }),
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ x("div", { className: "perf-header", children: [
        /* @__PURE__ */ l("h4", { className: "perf-title", children: "Memory" }),
        /* @__PURE__ */ x("span", { className: "perf-current", style: { color: k(r.used, r.limit) }, children: [
          r.used,
          " MB"
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Limit" }),
          r.limit,
          " MB"
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ l("span", { className: "perf-label", children: "Usage" }),
          r.limit > 0 ? (r.used / r.limit * 100).toFixed(0) : 0,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ l(nn, { data: r.history, color: k(r.used, r.limit), max: r.limit || 1 })
    ] })
  ] });
}
const dc = () => {
  const n = pe((o) => o.mode), e = pe((o) => o.setMode), t = (o) => {
    e({
      type: o,
      controller: "keyboard",
      control: o === "airplane" || o === "vehicle" ? "chase" : "thirdPerson"
    });
  };
  return /* @__PURE__ */ x("div", { className: "vehicle-panel", children: [
    /* @__PURE__ */ l("div", { className: "vehicle-panel__modes", children: [
      { type: "character", label: "Character", description: "Walk around as character" },
      { type: "vehicle", label: "Vehicle", description: "Drive a ground vehicle" },
      { type: "airplane", label: "Airplane", description: "Fly an airplane" }
    ].map((o) => /* @__PURE__ */ x(
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
    /* @__PURE__ */ x("div", { className: "vehicle-panel__info", children: [
      /* @__PURE__ */ x("div", { className: "vehicle-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "vehicle-panel__info-label", children: "Current Mode:" }),
        /* @__PURE__ */ l("span", { className: "vehicle-panel__info-value", children: n.type })
      ] }),
      /* @__PURE__ */ x("div", { className: "vehicle-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "vehicle-panel__info-label", children: "Controls:" }),
        /* @__PURE__ */ l("span", { className: "vehicle-panel__info-value", children: n.type === "airplane" ? "WASD + Space/Shift" : "WASD + Space" })
      ] })
    ] })
  ] });
}, fc = Object.entries(wn), pc = [
  { value: "#00ff88", label: "Green" },
  { value: "#00aaff", label: "Blue" },
  { value: "#ff3333", label: "Red" },
  { value: "#ffffff", label: "White" },
  { value: "#ffdd00", label: "Yellow" }
], mc = () => {
  const n = U((I) => I.editMode), e = U((I) => I.setEditMode), t = U((I) => I.currentTileMultiplier), r = U((I) => I.setTileMultiplier), o = U((I) => I.currentTileHeight), i = U((I) => I.setTileHeight), a = U((I) => I.currentTileShape), s = U((I) => I.setTileShape), u = U((I) => I.currentTileRotation), c = U((I) => I.setTileRotation), f = U((I) => I.selectedTileObjectType), d = U((I) => I.setSelectedTileObjectType), m = U((I) => I.selectedPlacedObjectType), h = U((I) => I.setSelectedPlacedObjectType), b = U((I) => I.snapToGrid), y = U((I) => I.setSnapToGrid), g = U((I) => I.currentFlagWidth), p = U((I) => I.currentFlagHeight), S = U((I) => I.currentFlagImageUrl), v = U((I) => I.setFlagWidth), M = U((I) => I.setFlagHeight), T = U((I) => I.setFlagImageUrl), C = U((I) => I.currentFlagStyle), P = U((I) => I.setFlagStyle), k = U((I) => I.currentFireIntensity), R = U((I) => I.currentFireWidth), B = U((I) => I.currentFireHeight), E = U((I) => I.currentFireColor), _ = U((I) => I.setFireIntensity), z = U((I) => I.setFireWidth), W = U((I) => I.setFireHeight), H = U((I) => I.setFireColor), j = U((I) => I.currentObjectRotation), A = U((I) => I.setObjectRotation), G = U((I) => I.selectedTileGroupId), $ = U((I) => I.tileGroups), X = U((I) => I.meshes), Z = U((I) => I.updateMesh), O = U((I) => I.currentBillboardText), Q = U((I) => I.currentBillboardImageUrl), J = U((I) => I.currentBillboardColor), te = U((I) => I.setBillboardText), ne = U((I) => I.setBillboardImageUrl), se = U((I) => I.setBillboardColor), re = U((I) => I.currentObjectPrimaryColor), he = U((I) => I.currentObjectSecondaryColor), le = U((I) => I.setObjectPrimaryColor), we = U((I) => I.setObjectSecondaryColor), oe = U((I) => I.showSnow), K = U((I) => I.setShowSnow), q = [
    { type: "none", label: "None", description: "No building mode" },
    { type: "wall", label: "Wall", description: "Place wall segments" },
    { type: "tile", label: "Tile", description: "Place floor tiles" },
    { type: "object", label: "Object", description: "Place objects on tiles" },
    { type: "npc", label: "NPC", description: "Place NPC entities" }
  ], ce = [
    { type: "none", label: "None" },
    { type: "grass", label: "Grass" },
    { type: "water", label: "Water" },
    { type: "sand", label: "Sand" },
    { type: "snowfield", label: "Snowfield" }
  ], ge = [
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
  return /* @__PURE__ */ x("div", { className: "building-panel", children: [
    /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Edit Mode" }),
      /* @__PURE__ */ l("div", { className: "building-panel__modes", children: q.map((I) => /* @__PURE__ */ x(
        "button",
        {
          className: `building-panel__mode-btn ${n === I.type ? "building-panel__mode-btn--active" : ""}`,
          onClick: () => e(I.type),
          children: [
            /* @__PURE__ */ l("span", { className: "building-panel__mode-label", children: I.label }),
            /* @__PURE__ */ l("span", { className: "building-panel__mode-desc", children: I.description })
          ]
        },
        I.type
      )) })
    ] }),
    (n === "tile" || n === "none") && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Terrain Cover" }),
      /* @__PURE__ */ l("div", { className: "building-panel__grid", children: ce.map((I) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${f === I.type ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => d(I.type),
          children: I.label
        },
        I.type
      )) })
    ] }),
    (n === "object" || n === "none") && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Placed Object" }),
      /* @__PURE__ */ l("div", { className: "building-panel__grid", children: ge.map((I) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${m === I.type ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => h(I.type),
          children: I.label
        },
        I.type
      )) })
    ] }),
    /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Tile Settings" }),
      /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Size" }),
          /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
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
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Snap to Grid" }),
          /* @__PURE__ */ l(
            "button",
            {
              className: `building-panel__toggle ${b ? "building-panel__toggle--on" : ""}`,
              onClick: () => y(!b),
              children: b ? "ON" : "OFF"
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Height" }),
          /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
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
      /* @__PURE__ */ l("div", { className: "building-panel__grid", style: { marginTop: "8px" }, children: D.map((I) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${a === I.type ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => s(I.type),
          children: I.label
        },
        I.type
      )) }),
      /* @__PURE__ */ l("div", { className: "building-panel__grid", style: { marginTop: "8px" }, children: [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((I, ye) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${Math.abs(u - I) < 1e-4 ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => c(I),
          children: ye * 90
        },
        I
      )) })
    ] }),
    n === "tile" && G && (() => {
      const I = $.get(G), ye = I ? X.get(I.floorMeshId) : void 0;
      return ye ? /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
        /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Tile Color" }),
        /* @__PURE__ */ l("div", { className: "building-panel__info", children: /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Color" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "color",
              value: ye.color || "#888888",
              onChange: (Re) => Z(ye.id, { color: Re.target.value }),
              style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
            }
          ),
          /* @__PURE__ */ l("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: ye.color || "#888888" })
        ] }) })
      ] }) : null;
    })(),
    /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Effects" }),
      /* @__PURE__ */ l("div", { className: "building-panel__info", children: /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Snow" }),
        /* @__PURE__ */ l(
          "button",
          {
            className: `building-panel__toggle ${oe ? "building-panel__toggle--on" : ""}`,
            onClick: () => K(!oe),
            children: oe ? "ON" : "OFF"
          }
        )
      ] }) })
    ] }),
    n === "object" && m !== "none" && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Object Rotation" }),
      /* @__PURE__ */ l("div", { className: "building-panel__grid", children: [0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75].map((I, ye) => /* @__PURE__ */ l(
        "button",
        {
          className: `building-panel__grid-btn ${Math.abs(j - I) < 0.01 ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => A(I),
          children: ye * 45
        },
        I
      )) })
    ] }),
    n === "object" && m === "sakura" && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Sakura Color" }),
      /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Blossom" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "color",
              value: re,
              onChange: (I) => le(I.target.value),
              style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
            }
          ),
          /* @__PURE__ */ l("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: re })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Bark" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "color",
              value: he,
              onChange: (I) => we(I.target.value),
              style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
            }
          ),
          /* @__PURE__ */ l("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: he })
        ] })
      ] })
    ] }),
    m === "fire" && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Fire Settings" }),
      /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Intensity" }),
          /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => _(Math.max(0.5, k - 0.5)), children: "-" }),
            /* @__PURE__ */ l("span", { className: "building-panel__stepper-value", children: k.toFixed(1) }),
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => _(Math.min(3, k + 0.5)), children: "+" })
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Width" }),
          /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => z(Math.max(0.3, R - 0.2)), children: "-" }),
            /* @__PURE__ */ x("span", { className: "building-panel__stepper-value", children: [
              R.toFixed(1),
              "m"
            ] }),
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => z(Math.min(4, R + 0.2)), children: "+" })
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Height" }),
          /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => W(Math.max(0.5, B - 0.3)), children: "-" }),
            /* @__PURE__ */ x("span", { className: "building-panel__stepper-value", children: [
              B.toFixed(1),
              "m"
            ] }),
            /* @__PURE__ */ l("button", { className: "building-panel__stepper-btn", onClick: () => W(Math.min(5, B + 0.3)), children: "+" })
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Color" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "color",
              value: E,
              onChange: (I) => H(I.target.value),
              style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
            }
          ),
          /* @__PURE__ */ l("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: E })
        ] })
      ] })
    ] }),
    m === "billboard" && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Billboard Settings" }),
      /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Text" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              value: O,
              onChange: (I) => te(I.target.value),
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
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Image URL" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              value: Q,
              onChange: (I) => ne(I.target.value),
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
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Color" }),
          /* @__PURE__ */ l("div", { className: "building-panel__grid", children: pc.map((I) => /* @__PURE__ */ l(
            "button",
            {
              className: `building-panel__grid-btn ${J === I.value ? "building-panel__grid-btn--active" : ""}`,
              onClick: () => se(I.value),
              style: { borderBottom: `3px solid ${I.value}` },
              children: I.label
            },
            I.value
          )) })
        ] })
      ] })
    ] }),
    m === "flag" && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
      /* @__PURE__ */ l("div", { className: "building-panel__section-title", children: "Flag Settings" }),
      /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Style" }),
          /* @__PURE__ */ l("div", { className: "building-panel__grid", children: fc.map(([I, ye]) => /* @__PURE__ */ l(
            "button",
            {
              className: `building-panel__grid-btn ${C === I ? "building-panel__grid-btn--active" : ""}`,
              onClick: () => P(I),
              children: ye.label
            },
            I
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Width" }),
          /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => v(Math.max(0.5, g - 0.5)),
                children: "-"
              }
            ),
            /* @__PURE__ */ x("span", { className: "building-panel__stepper-value", children: [
              g,
              "m"
            ] }),
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => v(Math.min(8, g + 0.5)),
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Height" }),
          /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => M(Math.max(0.5, p - 0.5)),
                children: "-"
              }
            ),
            /* @__PURE__ */ x("span", { className: "building-panel__stepper-value", children: [
              p,
              "m"
            ] }),
            /* @__PURE__ */ l(
              "button",
              {
                className: "building-panel__stepper-btn",
                onClick: () => M(Math.min(6, p + 0.5)),
                children: "+"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
          /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Image URL" }),
          /* @__PURE__ */ l(
            "input",
            {
              type: "text",
              value: S,
              onChange: (I) => T(I.target.value),
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
    /* @__PURE__ */ x("div", { className: "building-panel__info", style: { marginTop: "auto" }, children: [
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Current Mode" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: n })
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Terrain Cover" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: f })
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Object" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: m })
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Tile Height" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: o })
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ l("span", { className: "building-panel__info-label", children: "Tile Shape" }),
        /* @__PURE__ */ l("span", { className: "building-panel__info-value", children: a })
      ] })
    ] })
  ] });
}, hc = () => /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ l("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) }), gc = () => /* @__PURE__ */ x("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ l("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ l("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] }), Kn = ({
  children: n,
  title: e,
  initialWidth: t = 280,
  initialHeight: r = 400,
  minWidth: o = 200,
  minHeight: i = 150,
  maxWidth: a = 600,
  maxHeight: s = 800,
  resizeHandles: u = ["right"],
  className: c = "",
  style: f = {},
  onClose: d,
  onMinimize: m,
  draggable: h = !0,
  onDrop: b
}) => {
  const [y, g] = Y({ width: t, height: r }), [p, S] = Y({ x: 0, y: 0 }), [v, M] = Y(!1), [T, C] = Y(!1), [P, k] = Y(""), [R, B] = Y({ x: 0, y: 0 }), E = N(null), _ = N(null), z = V((A) => (G) => {
    G.preventDefault(), M(!0), k(A);
  }, []), W = V((A) => {
    if (E.current)
      if (v) {
        const G = E.current.getBoundingClientRect();
        let $ = y.width, X = y.height;
        P.includes("right") && ($ = Math.min(a, Math.max(o, A.clientX - G.left))), P.includes("bottom") && (X = Math.min(s, Math.max(i, A.clientY - G.top))), g({ width: $, height: X });
      } else T && S({
        x: A.clientX - R.x,
        y: A.clientY - R.y
      });
  }, [v, T, P, y, o, a, i, s, R]), H = V(() => {
    T && b && b(p.x, p.y), M(!1), C(!1), k("");
  }, [T, b, p]), j = V((A) => {
    if (!h || v) return;
    A.preventDefault(), C(!0);
    const G = E.current?.getBoundingClientRect();
    G && B({
      x: A.clientX - G.left,
      y: A.clientY - G.top
    });
  }, [h, v]);
  return L(() => {
    if (v || T)
      return document.addEventListener("mousemove", W), document.addEventListener("mouseup", H), () => {
        document.removeEventListener("mousemove", W), document.removeEventListener("mouseup", H);
      };
  }, [v, T, W, H]), /* @__PURE__ */ x(
    "div",
    {
      ref: E,
      className: `rp-panel ${c} ${T ? "dragging" : ""}`,
      style: {
        width: `${y.width}px`,
        height: `${y.height}px`,
        ...T ? {
          position: "fixed",
          left: `${p.x}px`,
          top: `${p.y}px`,
          zIndex: 10003
        } : {},
        ...f
      },
      children: [
        /* @__PURE__ */ x(
          "div",
          {
            ref: _,
            className: "rp-header",
            onMouseDown: j,
            children: [
              /* @__PURE__ */ l("h3", { className: "rp-title", children: e }),
              /* @__PURE__ */ x("div", { className: "rp-controls", children: [
                m && /* @__PURE__ */ l("button", { className: "rp-btn", onClick: m, title: "Minimize", children: /* @__PURE__ */ l(hc, {}) }),
                d && /* @__PURE__ */ l("button", { className: "rp-btn", onClick: d, title: "Close", children: /* @__PURE__ */ l(gc, {}) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ l("div", { className: "rp-content", children: n }),
        u.map((A) => /* @__PURE__ */ l(
          "div",
          {
            className: `rp-resize-handle handle-${A}`,
            onMouseDown: z(A.replace("corner", "right bottom"))
          },
          A
        ))
      ]
    }
  );
}, yc = ({ children: n }) => {
  const [e, t] = Y(["building", "vehicle", "performance"]), [r, o] = Y([]), [i, a] = Y([]), s = [
    { id: "building", title: "Building", component: /* @__PURE__ */ l(mc, {}), defaultSide: "left" },
    { id: "vehicle", title: "Vehicle", component: /* @__PURE__ */ l(dc, {}), defaultSide: "left" },
    { id: "animation", title: "Animation", component: /* @__PURE__ */ l(lc, {}), defaultSide: "left" },
    { id: "camera", title: "Camera", component: /* @__PURE__ */ l(ac, {}), defaultSide: "right" },
    { id: "motion", title: "Motion", component: /* @__PURE__ */ l(cc, {}), defaultSide: "right" },
    { id: "performance", title: "Performance", component: /* @__PURE__ */ l(uc, {}), defaultSide: "right" }
  ], u = (g) => {
    t((p) => p.includes(g) ? p.filter((S) => S !== g) : [...p, g]), a((p) => p.filter((S) => S !== g));
  }, c = (g) => {
    t((p) => p.filter((S) => S !== g)), o((p) => p.filter((S) => S.id !== g)), a((p) => p.filter((S) => S !== g));
  }, f = (g) => {
    a((p) => [...p, g]), t((p) => p.filter((S) => S !== g)), o((p) => p.filter((S) => S.id !== g));
  }, d = (g) => {
    a((p) => p.filter((S) => S !== g)), t((p) => [...p, g]);
  }, m = (g, p, S) => {
    const v = r.find((M) => M.id === g);
    o(v ? (M) => M.map(
      (T) => T.id === g ? { ...T, x: p, y: S } : T
    ) : (M) => [...M, {
      id: g,
      x: p,
      y: S,
      width: 300,
      height: 400
    }]);
  }, h = () => s.filter(
    (g) => e.includes(g.id) && g.defaultSide === "left" && !r.some((p) => p.id === g.id)
  ), b = () => s.filter(
    (g) => e.includes(g.id) && g.defaultSide === "right" && !r.some((p) => p.id === g.id)
  ), y = () => r.filter((g) => e.includes(g.id));
  return /* @__PURE__ */ x("div", { className: "editor-root", children: [
    /* @__PURE__ */ l("div", { className: "editor-panel-bar", children: s.map((g) => /* @__PURE__ */ l(
      "button",
      {
        onClick: () => u(g.id),
        className: `editor-panel-toggle ${e.includes(g.id) ? "active" : ""}`,
        title: g.title,
        children: g.title
      },
      g.id
    )) }),
    h().length > 0 && /* @__PURE__ */ l("div", { className: "editor-left-stack", children: h().map((g, p) => /* @__PURE__ */ l(
      Kn,
      {
        title: g.title,
        initialWidth: 280,
        initialHeight: Math.max(300, (window.innerHeight - 120) / h().length),
        minWidth: 200,
        maxWidth: 500,
        resizeHandles: ["right"],
        className: "editor-glass-panel",
        style: {
          marginBottom: p < h().length - 1 ? "8px" : "0"
        },
        onClose: () => c(g.id),
        onMinimize: () => f(g.id),
        onDrop: (S, v) => m(g.id, S, v),
        children: g.component
      },
      g.id
    )) }),
    b().length > 0 && /* @__PURE__ */ l("div", { className: "editor-right-stack", children: b().map((g, p) => /* @__PURE__ */ l(
      Kn,
      {
        title: g.title,
        initialWidth: 320,
        initialHeight: Math.max(300, (window.innerHeight - 120) / b().length),
        minWidth: 200,
        maxWidth: 500,
        resizeHandles: ["corner"],
        className: "editor-glass-panel",
        style: {
          marginBottom: p < b().length - 1 ? "8px" : "0"
        },
        onClose: () => c(g.id),
        onMinimize: () => f(g.id),
        onDrop: (S, v) => m(g.id, S, v),
        children: g.component
      },
      g.id
    )) }),
    y().map((g) => {
      const p = s.find((S) => S.id === g.id);
      return p ? /* @__PURE__ */ l(
        Kn,
        {
          title: p.title,
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
          onClose: () => c(p.id),
          onMinimize: () => f(p.id),
          onDrop: (S, v) => m(p.id, S, v),
          children: p.component
        },
        g.id
      ) : null;
    }),
    i.length > 0 && /* @__PURE__ */ l("div", { className: "editor-minimized-dock", children: i.map((g) => {
      const p = s.find((S) => S.id === g);
      return p ? /* @__PURE__ */ l(
        "button",
        {
          onClick: () => d(g),
          className: "editor-minimized-item",
          title: `Restore ${p.title}`,
          children: p.title
        },
        g
      ) : null;
    }) }),
    n
  ] });
}, Qp = ({
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
    children: /* @__PURE__ */ l(yc, { children: n })
  }
);
ms();
const me = xe()(
  hs((n, e) => ({
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
      const i = `npc-${Date.now()}`, a = e().selectedClothingSetId || o.defaultClothingSet, s = [], u = e().previewAccessories.hat;
      if (u) {
        const m = e().clothingSets.get(u)?.parts[0];
        m && s.push(m);
      }
      const c = e().previewAccessories.glasses;
      if (c) {
        const m = e().clothingSets.get(c)?.parts[0];
        m && s.push(m);
      }
      const f = {
        id: i,
        templateId: t,
        name: `${o.name} ${Date.now()}`,
        position: r,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        ...o.defaultAnimation ? { currentAnimation: o.defaultAnimation } : {},
        ...a ? { currentClothingSetId: a } : {},
        ...s.length > 0 ? { customParts: s } : {},
        events: []
      };
      e().addInstance(f), e().setSelectedInstance(i);
    },
    updateInstancePart: (t, r, o) => n((i) => {
      const a = i.instances.get(t);
      if (!a) return;
      const s = a.customParts || [], u = s.findIndex((c) => c.id === r);
      if (u >= 0) {
        const c = s[u];
        s[u] = {
          ...c,
          ...o,
          id: c.id,
          type: c.type,
          url: c.url
        };
      } else {
        const c = o.type ?? "accessory", f = o.url ?? "";
        s.push({
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
      i.instances.set(t, { ...a, customParts: s });
    }),
    changeInstanceClothing: (t, r) => n((o) => {
      const i = o.instances.get(t);
      i && o.instances.set(t, { ...i, currentClothingSetId: r });
    }),
    addInstanceEvent: (t, r) => n((o) => {
      const i = o.instances.get(t);
      if (i) {
        const a = i.events || [];
        a.push(r), o.instances.set(t, { ...i, events: a });
      }
    }),
    removeInstanceEvent: (t, r) => n((o) => {
      const i = o.instances.get(t);
      if (i && i.events) {
        const a = i.events.filter((s) => s.id !== r);
        o.instances.set(t, { ...i, events: a });
      }
    }),
    setPreviewAccessory: (t, r) => n((o) => {
      r ? o.previewAccessories[t] = r : delete o.previewAccessories[t];
    }),
    setNavigation: (t, r, o = 3) => n((i) => {
      const a = i.instances.get(t);
      if (!a || r.length === 0) return;
      const s = {
        waypoints: r,
        currentIndex: 0,
        speed: o,
        state: "moving"
      };
      i.instances.set(t, {
        ...a,
        navigation: s,
        currentAnimation: "walk"
      });
    }),
    advanceNavigation: (t) => n((r) => {
      const o = r.instances.get(t);
      if (!o?.navigation || o.navigation.state !== "moving") return;
      const i = o.navigation, a = i.currentIndex + 1;
      a >= i.waypoints.length ? r.instances.set(t, {
        ...o,
        navigation: { ...i, state: "arrived", currentIndex: a },
        currentAnimation: "idle"
      }) : r.instances.set(t, {
        ...o,
        navigation: { ...i, currentIndex: a }
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
function bc({ part: n }) {
  return /* @__PURE__ */ x(
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
function vc() {
  const n = U((c) => c.editMode), e = U((c) => c.hoverPosition), t = me((c) => c.templates), r = me((c) => c.clothingSets), o = me((c) => c.selectedTemplateId), i = me(
    (c) => c.selectedClothingSetId
  ), a = me((c) => c.previewAccessories);
  if (n !== "npc" || !e || !o)
    return null;
  const s = t.get(o);
  if (!s)
    return null;
  const u = [];
  if (u.push(...s.baseParts), i) {
    const c = r.get(i);
    c && u.push(...c.parts);
  }
  if (a.hat) {
    const c = r.get(a.hat);
    if (c && c.parts.length > 0) {
      const f = c.parts[0];
      f && u.push(f);
    }
  }
  if (a.glasses) {
    const c = r.get(a.glasses);
    if (c && c.parts.length > 0) {
      const f = c.parts[0];
      f && u.push(f);
    }
  }
  return /* @__PURE__ */ x("group", { position: [e.x, e.y, e.z], children: [
    u.map((c) => /* @__PURE__ */ l(bc, { part: c }, c.id)),
    /* @__PURE__ */ x("mesh", { position: [0, 0.01, 0], rotation: [-Math.PI / 2, 0, 0], children: [
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
const gt = /* @__PURE__ */ new Set(), Ge = xe((n) => ({
  active: !1,
  version: 0,
  visibleTileGroupIds: gt,
  visibleWallGroupIds: gt,
  visibleObjectIds: gt,
  clusterCounts: new Uint32Array(0),
  setResult: ({ version: e, tileIds: t, wallIds: r, objectIds: o, clusterCounts: i }) => n({
    active: !0,
    version: e,
    visibleTileGroupIds: t,
    visibleWallGroupIds: r,
    visibleObjectIds: o,
    clusterCounts: i
  }),
  reset: () => n({
    active: !1,
    version: 0,
    visibleTileGroupIds: gt,
    visibleWallGroupIds: gt,
    visibleObjectIds: gt,
    clusterCounts: new Uint32Array(0)
  })
})), wt = 18, Ye = 140, xc = 0.12, wc = 8, Sc = 3.2, Mc = 2.4, Cc = 0.985;
function ot(n, e) {
  return Math.floor(n / e);
}
function kc(n, e) {
  return `${n}:${e}`;
}
function Ic(n, e, t, r, o = wt, i = wc) {
  const a = ot(n, o), s = ot(e, o), u = Math.atan2(r, t), c = u < 0 ? u + Math.PI * 2 : u, f = Math.floor(c / (Math.PI * 2) * i) % i;
  return `${a}:${s}:${f}`;
}
function ii(n, e, t, r, o, i, a, s) {
  const u = (e + t) * 0.5, c = (r + o) * 0.5, f = (i + a) * 0.5, d = t - e, m = o - r, h = a - i;
  return {
    id: n,
    centerX: u,
    centerY: c,
    centerZ: f,
    radius: Math.max(1, Math.hypot(d, m, h) * 0.5),
    cellX: ot(u, s),
    cellZ: ot(f, s)
  };
}
function Ac(n, e = wt) {
  if (n.tiles.length === 0) return null;
  let t = 1 / 0, r = -1 / 0, o = 0, i = 0.2, a = 1 / 0, s = -1 / 0;
  for (const u of n.tiles) {
    const f = (u.size ?? 1) * 0.5;
    t = Math.min(t, u.position.x - f), r = Math.max(r, u.position.x + f), o = Math.min(o, 0), i = Math.max(i, Math.max(u.position.y, 0.2) + 1.5), a = Math.min(a, u.position.z - f), s = Math.max(s, u.position.z + f);
  }
  return ii(n.id, t, r, o, i, a, s, e);
}
function Tc(n, e = wt) {
  if (n.walls.length === 0) return null;
  let t = 1 / 0, r = -1 / 0, o = 0, i = 2.5, a = 1 / 0, s = -1 / 0;
  for (const u of n.walls)
    t = Math.min(t, u.position.x - 1.1), r = Math.max(r, u.position.x + 1.1), o = Math.min(o, u.position.y), i = Math.max(i, u.position.y + 3.5), a = Math.min(a, u.position.z - 1.1), s = Math.max(s, u.position.z + 1.1);
  return ii(n.id, t, r, o, i, a, s, e);
}
function _c(n) {
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
function Pc(n, e = wt) {
  const t = _c(n);
  return {
    id: n.id,
    centerX: n.position.x,
    centerY: n.position.y + t * 0.5,
    centerZ: n.position.z,
    radius: t,
    cellX: ot(n.position.x, e),
    cellZ: ot(n.position.z, e)
  };
}
function ln(n, e, t, r = Ye, o = wt) {
  const i = ot(e, o), a = ot(t, o), s = Math.ceil(r / o), u = /* @__PURE__ */ new Set();
  for (let c = a - s; c <= a + s; c += 1)
    for (let f = i - s; f <= i + s; f += 1) {
      const d = n.get(kc(f, c));
      if (d)
        for (const m of d) u.add(m);
    }
  return u;
}
function Rc(n, e, t, r = Ye, o = wt) {
  const i = ln(n.occluderBuckets, e, t, r, o), a = [];
  for (const s of i) {
    const u = n.occluderByKey.get(s);
    u && a.push(u);
  }
  return a;
}
function Nc(n, e, t, r, o) {
  const i = n.centerX - t.x, a = n.centerY - t.y, s = n.centerZ - t.z, u = Math.sqrt(i * i + a * a + s * s);
  if (u < 10) return !1;
  o.targetDir.set(i, a, s).normalize();
  for (const c of r) {
    if (c.kind === e && c.id === n.id) continue;
    const f = c.centerX - t.x, d = c.centerY - t.y, m = c.centerZ - t.z, h = Math.sqrt(f * f + d * d + m * m);
    if (h <= 1 || h >= u - Math.max(n.radius, 1.2) || (o.occDir.set(f, d, m).normalize(), o.targetDir.dot(o.occDir) < Cc)) continue;
    const y = o.cross.crossVectors(
      o.targetDir,
      o.occDir
    ).length() * h, g = c.strength + Math.min(n.radius * 0.45, 1.8);
    if (!(y > g))
      return !0;
  }
  return !1;
}
const kn = 0, In = 1, Fr = 2, Ec = 0, si = 1, ai = 2, li = 3, ci = 4, zc = 10, ui = 20, di = 21, kr = 22, fi = 23;
function pi() {
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
function Bc(n, e, t) {
  let r = t.length;
  for (const o of n)
    o.walls.length > 0 && (r += 1);
  for (const o of e)
    o.tiles.length > 0 && (r += 1);
  return r;
}
function Dc(n) {
  const e = Bc(n.wallGroups, n.tileGroups, n.objects);
  if (e === 0)
    return { ...pi(), version: n.version };
  const t = new Array(e), r = new Uint8Array(e), o = new Uint8Array(e), i = new Float32Array(e), a = new Float32Array(e), s = new Float32Array(e), u = new Float32Array(e), c = new Int16Array(e), f = new Int16Array(e), d = new Uint16Array(e);
  let m = 0;
  const h = (b, y, g, p, S) => {
    t[m] = b, r[m] = y, o[m] = g, i[m] = p.centerX, a[m] = p.centerY, s[m] = p.centerZ, u[m] = p.radius, c[m] = p.cellX, f[m] = p.cellZ, d[m] = S, m += 1;
  };
  for (const b of n.tileGroups) {
    const y = Ac(b);
    if (!y) continue;
    const g = b.tiles.find((S) => S.objectType && S.objectType !== "none")?.objectType ?? "none", p = g === "grass" ? si : g === "water" ? ai : g === "sand" ? li : g === "snowfield" ? ci : Ec;
    h(b.id, kn, p, y, b.tiles.length);
  }
  for (const b of n.wallGroups) {
    const y = Tc(b);
    y && h(b.id, In, zc, y, b.walls.length);
  }
  for (const b of n.objects) {
    const y = b.type === "sakura" ? ui : b.type === "flag" ? di : b.type === "fire" ? kr : b.type === "billboard" ? fi : kr;
    h(b.id, Fr, y, Pc(b), 1);
  }
  return {
    version: n.version,
    ids: t,
    kinds: r,
    subKinds: o,
    centerX: i,
    centerY: a,
    centerZ: s,
    radius: u,
    cellX: c,
    cellZ: f,
    memberCount: d
  };
}
function _t(n, e, t, r) {
  const o = `${e}:${t}`, i = n.get(o);
  if (i) {
    i.push(r);
    return;
  }
  n.set(o, [r]);
}
function Fc(n, e) {
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
function Lc(n) {
  const e = {
    tileById: /* @__PURE__ */ new Map(),
    wallById: /* @__PURE__ */ new Map(),
    objectById: /* @__PURE__ */ new Map(),
    tileBuckets: /* @__PURE__ */ new Map(),
    wallBuckets: /* @__PURE__ */ new Map(),
    objectBuckets: /* @__PURE__ */ new Map(),
    occluderByKey: /* @__PURE__ */ new Map(),
    occluderBuckets: /* @__PURE__ */ new Map()
  };
  for (let t = 0; t < n.ids.length; t += 1) {
    const r = n.ids[t];
    if (!r) continue;
    const o = Fc(n, t), i = n.kinds[t];
    if (i === kn) {
      if (e.tileById.set(r, o), _t(e.tileBuckets, o.cellX, o.cellZ, r), o.radius >= Sc) {
        const a = {
          ...o,
          key: `tile:${r}`,
          kind: "tile",
          strength: o.radius
        };
        e.occluderByKey.set(a.key, a), _t(e.occluderBuckets, a.cellX, a.cellZ, a.key);
      }
      continue;
    }
    if (i === In) {
      e.wallById.set(r, o), _t(e.wallBuckets, o.cellX, o.cellZ, r);
      const a = n.memberCount[t] ?? 0;
      if (o.radius >= Mc || a >= 4) {
        const s = {
          ...o,
          key: `wall:${r}`,
          kind: "wall",
          strength: o.radius * 1.15
        };
        e.occluderByKey.set(s.key, s), _t(e.occluderBuckets, s.cellX, s.cellZ, s.key);
      }
      continue;
    }
    e.objectById.set(r, o), _t(e.objectBuckets, o.cellX, o.cellZ, r);
  }
  return e;
}
const Wt = 0, mi = 1, Ht = 2, jt = 3, $t = 4, Lr = 5, Gr = 6, Or = 7, Ur = 8, Wr = 9, Hr = 10;
function Gc(n, e) {
  const t = n.kinds[e], r = n.subKinds[e];
  if (t === kn)
    return r === si ? mi : r === ai ? Ht : r === li ? jt : r === ci ? $t : Wt;
  if (t === In)
    return Lr;
  if (t === Fr) {
    if (r === ui) return Gr;
    if (r === di) return Or;
    if (r === kr) return Ur;
    if (r === fi) return Wr;
  }
  return Wt;
}
function Oc(n, e) {
  const t = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), i = new Uint32Array(Hr), a = Math.min(n.ids.length, e.length);
  for (let s = 0; s < a; s += 1) {
    if ((e[s] ?? 0) === 0) continue;
    const u = n.ids[s];
    if (!u) continue;
    const c = n.kinds[s];
    c === kn ? t.add(u) : c === In ? r.add(u) : c === Fr && o.add(u);
    const f = Gc(n, s);
    i[f] = (i[f] ?? 0) + 1;
  }
  return {
    version: n.version,
    tileIds: t,
    wallIds: r,
    objectIds: o,
    clusterCounts: i
  };
}
const Ve = 4;
function qe(n, e) {
  const t = e * Ve;
  return n.args[t + 1] ?? 0;
}
const Uc = [
  { id: Wt, label: "tile", vertexCountHint: 36 },
  { id: mi, label: "grass", vertexCountHint: 36 },
  { id: Ht, label: "water", vertexCountHint: 36 },
  { id: jt, label: "sand", vertexCountHint: 36 },
  { id: $t, label: "snowfield", vertexCountHint: 36 },
  { id: Lr, label: "wall", vertexCountHint: 36 },
  { id: Gr, label: "sakura", vertexCountHint: 12 },
  { id: Or, label: "flag", vertexCountHint: 12 },
  { id: Ur, label: "fire", vertexCountHint: 6 },
  { id: Wr, label: "billboard", vertexCountHint: 6 }
];
function hi() {
  return {
    version: 0,
    args: new Uint32Array(Hr * Ve),
    dirtyRanges: []
  };
}
function Wc(n, e) {
  if (n.length !== e.length)
    return e.length > 0 ? [{ start: 0, end: e.length / Ve }] : [];
  const t = [];
  let r = -1;
  const o = e.length / Ve;
  for (let i = 0; i < o; i += 1) {
    const a = i * Ve;
    let s = !1;
    for (let u = 0; u < Ve; u += 1)
      if ((n[a + u] ?? 0) !== (e[a + u] ?? 0)) {
        s = !0;
        break;
      }
    if (s) {
      r < 0 && (r = i);
      continue;
    }
    r >= 0 && (t.push({ start: r, end: i }), r = -1);
  }
  return r >= 0 && t.push({ start: r, end: o }), t;
}
function Hc(n, e, t) {
  const r = new Uint32Array(Hr * Ve);
  for (const i of Uc) {
    const a = i.id * Ve;
    r[a] = i.vertexCountHint, r[a + 1] = e[i.id] ?? 0, r[a + 2] = 0, r[a + 3] = 0;
  }
  const o = t ?? hi();
  return {
    version: n,
    args: r,
    dirtyRanges: Wc(o.args, r)
  };
}
function jc(n) {
  return {
    version: n.version,
    slices: n.dirtyRanges.map((e) => {
      const t = e.start * Ve, r = (e.end - e.start) * Ve;
      return {
        byteOffset: t * n.args.BYTES_PER_ELEMENT,
        elementOffset: t,
        elementCount: r,
        data: n.args.subarray(t, t + r)
      };
    })
  };
}
const un = 4, dn = 5;
function gi() {
  return {
    version: 0,
    count: 0,
    spatial: new Float32Array(0),
    meta: new Int32Array(0),
    spatialDirty: [],
    metaDirty: []
  };
}
function $c(n) {
  const e = new Float32Array(n.ids.length * un);
  for (let t = 0; t < n.ids.length; t += 1) {
    const r = t * un;
    e[r] = n.centerX[t] ?? 0, e[r + 1] = n.centerY[t] ?? 0, e[r + 2] = n.centerZ[t] ?? 0, e[r + 3] = n.radius[t] ?? 0;
  }
  return e;
}
function Vc(n) {
  const e = new Int32Array(n.ids.length * dn);
  for (let t = 0; t < n.ids.length; t += 1) {
    const r = t * dn;
    e[r] = n.cellX[t] ?? 0, e[r + 1] = n.cellZ[t] ?? 0, e[r + 2] = n.kinds[t] ?? 0, e[r + 3] = n.subKinds[t] ?? 0, e[r + 4] = n.memberCount[t] ?? 0;
  }
  return e;
}
function To(n, e, t) {
  if (n.length !== e.length)
    return e.length > 0 ? [{ start: 0, end: Math.ceil(e.length / t) }] : [];
  const r = [];
  let o = -1;
  const i = Math.ceil(e.length / t);
  for (let a = 0; a < i; a += 1) {
    const s = a * t;
    let u = !1;
    for (let c = 0; c < t; c += 1)
      if ((n[s + c] ?? 0) !== (e[s + c] ?? 0)) {
        u = !0;
        break;
      }
    if (u) {
      o < 0 && (o = a);
      continue;
    }
    o >= 0 && (r.push({ start: o, end: a }), o = -1);
  }
  return o >= 0 && r.push({ start: o, end: i }), r;
}
function qc(n, e) {
  const t = $c(n), r = Vc(n), o = e ?? gi();
  return {
    version: n.version,
    count: n.ids.length,
    spatial: t,
    meta: r,
    spatialDirty: To(o.spatial, t, un),
    metaDirty: To(o.meta, r, dn)
  };
}
function _o(n, e, t) {
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
function Yc(n) {
  return {
    version: n.version,
    count: n.count,
    spatial: _o(n.spatial, un, n.spatialDirty),
    meta: _o(n.meta, dn, n.metaDirty)
  };
}
const Zc = 8, Xc = 128;
function fn() {
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
function jr(n) {
  if (typeof n != "object" || n === null) return null;
  const e = n, t = e.backend?.device ?? e.device ?? null;
  return !t || typeof t.createBuffer != "function" || typeof t.queue?.writeBuffer != "function" ? null : t;
}
function Lt(n) {
  n?.destroy && n.destroy();
}
function Kc(n) {
  Lt(n.spatialBuffer), Lt(n.metaBuffer), Lt(n.indirectArgsBuffer);
}
function Ir(n, e, t, r, o) {
  return r <= 0 ? (Lt(e), null) : e && t === r ? e : (Lt(e), n.createBuffer({
    label: o,
    size: r,
    usage: Xc | Zc
  }));
}
function Jc(n, e, t) {
  const r = Yc(t), o = t.spatial.byteLength, i = t.meta.byteLength, a = Ir(
    n,
    e.spatialBuffer,
    e.spatialBytes,
    o,
    "building-spatial"
  ), s = Ir(
    n,
    e.metaBuffer,
    e.metaBytes,
    i,
    "building-meta"
  );
  if (a)
    for (const u of r.spatial)
      n.queue.writeBuffer(a, u.byteOffset, u.data);
  if (s)
    for (const u of r.meta)
      n.queue.writeBuffer(s, u.byteOffset, u.data);
  return {
    backend: "webgpu",
    uploadedVersion: t.version,
    spatialBuffer: a,
    metaBuffer: s,
    indirectArgsBuffer: e.indirectArgsBuffer,
    spatialBytes: o,
    metaBytes: i,
    indirectArgsBytes: e.indirectArgsBytes
  };
}
function Qc(n, e, t) {
  const r = jc(t), o = t.args.byteLength, i = Ir(
    n,
    e.indirectArgsBuffer,
    e.indirectArgsBytes,
    o,
    "building-indirect-args"
  );
  if (i)
    for (const a of r.slices)
      n.queue.writeBuffer(i, a.byteOffset, a.data);
  return {
    ...e,
    backend: "webgpu",
    uploadedVersion: Math.max(e.uploadedVersion, t.version),
    indirectArgsBuffer: i,
    indirectArgsBytes: o
  };
}
const Po = pi(), Ro = gi(), No = fn(), Eo = hi(), ke = xe((n) => ({
  snapshot: Po,
  gpuMirror: Ro,
  uploadResources: No,
  drawMirror: Eo,
  setSnapshot: (e) => n({ snapshot: e }),
  setGpuMirror: (e) => n({ gpuMirror: e }),
  setUploadResources: (e) => n({ uploadResources: e }),
  setDrawMirror: (e) => n({ drawMirror: e }),
  reset: () => n({ snapshot: Po, gpuMirror: Ro, uploadResources: No, drawMirror: Eo })
}));
function Jn(n, e) {
  if (n === e) return !0;
  if (n.size !== e.size) return !1;
  for (const t of n)
    if (!e.has(t)) return !1;
  return !0;
}
const yt = /* @__PURE__ */ new Set(), bt = xe((n) => ({
  initialized: !1,
  visibleTileGroupIds: yt,
  visibleWallGroupIds: yt,
  visibleObjectIds: yt,
  setVisible: ({ tileIds: e, wallIds: t, objectIds: r }) => n((o) => {
    const i = !Jn(o.visibleTileGroupIds, e), a = !Jn(o.visibleWallGroupIds, t), s = !Jn(o.visibleObjectIds, r);
    return !i && !a && !s && o.initialized ? o : {
      initialized: !0,
      visibleTileGroupIds: i ? e : o.visibleTileGroupIds,
      visibleWallGroupIds: a ? t : o.visibleWallGroupIds,
      visibleObjectIds: s ? r : o.visibleObjectIds
    };
  }),
  reset: () => n({
    initialized: !1,
    visibleTileGroupIds: yt,
    visibleWallGroupIds: yt,
    visibleObjectIds: yt
  })
}));
function eu({
  size: n = ue.DEFAULT_GRID_SIZE,
  divisions: e = n / ue.GRID_CELL_SIZE,
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
function tu(n, e, t, r) {
  const o = document.createElement("canvas"), i = 512, a = Math.round(i * (t / e));
  o.width = i, o.height = a;
  const s = o.getContext("2d");
  s.fillStyle = "#0a0a0a", s.fillRect(0, 0, i, a), s.strokeStyle = "#333", s.lineWidth = 4, s.strokeRect(2, 2, i - 4, a - 4), s.fillStyle = r;
  const u = Math.floor(a * 0.25);
  s.font = `bold ${u}px monospace`, s.textAlign = "center", s.textBaseline = "middle";
  const c = n.split(`
`), f = u * 1.3, d = a / 2 - (c.length - 1) * f / 2;
  c.forEach((h, b) => {
    s.fillText(h, i / 2, d + b * f, i - 20);
  });
  const m = new w.CanvasTexture(o);
  return m.needsUpdate = !0, m;
}
const yi = 20, bi = 100, vi = 3;
function nu({
  imageUrl: n,
  width: e,
  height: t,
  color: r,
  toon: o
}) {
  const i = N(null), a = N(null), s = N(null), u = F(() => new w.Vector3(), []), f = o ?? Te() ? at(3) : null, d = Er(n), m = e ?? 2, h = t ?? 1.5, b = F(
    () => new w.Color(r || "#00ff88"),
    [r]
  ), y = F(() => new w.PlaneGeometry(m, h), [m, h]), g = F(
    () => new w.PlaneGeometry(m * 1.15, h * 1.15),
    [m, h]
  );
  return de((p) => {
    i.current.getWorldPosition(u);
    const S = p.camera.position.distanceTo(u), v = xt(S, yi, bi, vi);
    a.current.emissiveIntensity = 2 * v, s.current.opacity = (0.2 + 0.05 * Math.sin(p.clock.elapsedTime * 2)) * v;
  }), L(
    () => () => {
      y.dispose(), g.dispose();
    },
    [y, g]
  ), /* @__PURE__ */ x("group", { position: [0, h / 2 + 1, 0], children: [
    /* @__PURE__ */ l("mesh", { geometry: g, position: [0, 0, -0.01], children: /* @__PURE__ */ l(
      "meshBasicMaterial",
      {
        ref: s,
        color: b,
        transparent: !0,
        opacity: 0.25,
        blending: w.AdditiveBlending,
        depthWrite: !1,
        side: w.DoubleSide
      }
    ) }),
    /* @__PURE__ */ l("mesh", { ref: i, geometry: y, children: f ? /* @__PURE__ */ l(
      "meshToonMaterial",
      {
        ref: a,
        map: d,
        emissive: b,
        emissiveIntensity: 2,
        gradientMap: f,
        side: w.DoubleSide
      }
    ) : /* @__PURE__ */ l(
      "meshStandardMaterial",
      {
        ref: a,
        map: d,
        emissive: b,
        emissiveIntensity: 2,
        side: w.DoubleSide
      }
    ) })
  ] });
}
function ru({ text: n, width: e, height: t, color: r, toon: o }) {
  const i = N(null), a = N(null), s = N(null), u = F(() => new w.Vector3(), []), f = o ?? Te() ? at(3) : null, d = e ?? 2, m = t ?? 1.5, h = r || "#00ff88", b = F(
    () => tu(n || "HELLO", d, m, h),
    [n, d, m, h]
  ), y = F(() => new w.Color(h), [h]), g = F(() => new w.PlaneGeometry(d, m), [d, m]), p = F(
    () => new w.PlaneGeometry(d * 1.15, m * 1.15),
    [d, m]
  );
  return de((S) => {
    i.current.getWorldPosition(u);
    const v = S.camera.position.distanceTo(u), M = xt(v, yi, bi, vi);
    a.current.emissiveIntensity = 2 * M, s.current.opacity = (0.2 + 0.05 * Math.sin(S.clock.elapsedTime * 2)) * M;
  }), L(
    () => () => {
      g.dispose(), p.dispose(), b.dispose();
    },
    [g, p, b]
  ), /* @__PURE__ */ x("group", { position: [0, m / 2 + 1, 0], children: [
    /* @__PURE__ */ l("mesh", { geometry: p, position: [0, 0, -0.01], children: /* @__PURE__ */ l(
      "meshBasicMaterial",
      {
        ref: s,
        color: y,
        transparent: !0,
        opacity: 0.25,
        blending: w.AdditiveBlending,
        depthWrite: !1,
        side: w.DoubleSide
      }
    ) }),
    /* @__PURE__ */ l("mesh", { ref: i, geometry: g, children: f ? /* @__PURE__ */ l(
      "meshToonMaterial",
      {
        ref: a,
        map: b,
        emissive: y,
        emissiveIntensity: 2,
        gradientMap: f,
        side: w.DoubleSide
      }
    ) : /* @__PURE__ */ l(
      "meshStandardMaterial",
      {
        ref: a,
        map: b,
        emissive: y,
        emissiveIntensity: 2,
        side: w.DoubleSide
      }
    ) })
  ] });
}
const ou = (n) => n.imageUrl ? /* @__PURE__ */ l(nu, { ...n, imageUrl: n.imageUrl }) : /* @__PURE__ */ l(ru, { ...n }), iu = Ce.memo(ou);
var su = `varying vec2 vUv;\r
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
}`, au = `varying vec2 vUv;\r
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
const lu = zr(
  { time: 0, intensity: 1.5, seed: 0, lean: 0, flare: 1, tint: new w.Color(1, 1, 1) },
  au,
  su
);
Sn({ FireMaterial: lu });
const cu = `
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
`, xi = `
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
`, Pt = 18;
let Qn = null, er = null;
function wi() {
  return Qn || (Qn = {
    log: new w.CylinderGeometry(0.035, 0.045, 0.5, 5),
    charcoal: new w.CircleGeometry(0.18, 6),
    glow: new w.CircleGeometry(0.7, 8)
  }), Qn;
}
function Si() {
  return er || (er = {
    log: new w.MeshStandardMaterial({ color: 2759178, roughness: 1 }),
    charcoal: new w.MeshStandardMaterial({
      color: 1118481,
      roughness: 1,
      emissive: new w.Color("#3a0c00"),
      emissiveIntensity: 0.8
    }),
    ember: new w.ShaderMaterial({
      vertexShader: cu,
      fragmentShader: xi,
      uniforms: { uTime: { value: 0 } },
      transparent: !0,
      depthWrite: !1,
      blending: w.AdditiveBlending
    })
  }), er;
}
const uu = ({ intensity: n = 1.5, width: e = 1, height: t = 1.5, color: r = "#ffffff" }) => {
  const o = F(() => new w.Color(r), [r]), i = wi(), a = Si(), s = F(() => Math.max(0.4, (e + t * 0.5) / 1.5), [e, t]), u = F(() => [
    { w: e * 0.78, h: t, x: 0, y: t * 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1, speed: 1.45, tOff: 0, iMul: 1 },
    { w: e * 0.52, h: t * 0.85, x: -e * 0.12, y: t * 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
    { w: e * 0.42, h: t * 0.7, x: e * 0.14, y: t * 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 }
  ], [e, t]), c = F(
    () => u.map(() => Ce.createRef()),
    [u]
  ), f = F(
    () => u.map((m) => new w.PlaneGeometry(m.w, m.h)),
    [u]
  ), d = F(() => {
    const m = new w.BufferGeometry(), h = new Float32Array(Pt * 3), b = new Float32Array(Pt), y = new Float32Array(Pt), g = new Float32Array(Pt);
    for (let p = 0; p < Pt; p++)
      h[p * 3] = (Math.random() - 0.5) * e * 0.35, h[p * 3 + 1] = Math.random() * t * 0.2, h[p * 3 + 2] = (Math.random() - 0.5) * e * 0.35, b[p] = Math.random(), y[p] = 0.12 + Math.random() * 0.22, g[p] = Math.random() * Math.PI * 2;
    return m.setAttribute("position", new w.BufferAttribute(h, 3)), m.setAttribute("aLife", new w.BufferAttribute(b, 1)), m.setAttribute("aSpeed", new w.BufferAttribute(y, 1)), m.setAttribute("aDrift", new w.BufferAttribute(g, 1)), m;
  }, [e, t]);
  return de((m) => {
    const h = m.clock.elapsedTime;
    for (let y = 0; y < u.length; y++) {
      const g = c[y]?.current;
      if (!g) continue;
      const p = u[y];
      p && (g.time = h * p.speed + p.tOff, g.intensity = n * p.iMul, g.seed = p.seed, g.lean = p.lean, g.flare = p.flare, g.tint = o);
    }
    const b = a.ember.uniforms.uTime;
    b && (b.value = h);
  }), L(() => () => {
    f.forEach((m) => m.dispose()), d.dispose();
  }, [f, d]), /* @__PURE__ */ x("group", { children: [
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
            blending: w.AdditiveBlending,
            depthWrite: !1
          }
        )
      }
    ),
    /* @__PURE__ */ l(
      "mesh",
      {
        geometry: i.charcoal,
        material: a.charcoal,
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0.018, 0],
        scale: [e, e, 1]
      }
    ),
    /* @__PURE__ */ l(
      "mesh",
      {
        geometry: i.log,
        material: a.log,
        position: [0.12 * s, 0.06 * s, 0.05 * s],
        rotation: [0.3, 0, 0.65],
        scale: s
      }
    ),
    /* @__PURE__ */ l(
      "mesh",
      {
        geometry: i.log,
        material: a.log,
        position: [-0.1 * s, 0.06 * s, 0.08 * s],
        rotation: [0.25, 1.2, -0.6],
        scale: s
      }
    ),
    /* @__PURE__ */ l(
      "mesh",
      {
        geometry: i.log,
        material: a.log,
        position: [0.02 * s, 0.06 * s, -0.13 * s],
        rotation: [-0.2, 0.6, 1],
        scale: s
      }
    ),
    u.map((m, h) => (() => {
      const b = f[h], y = c[h];
      return !b || !y ? null : /* @__PURE__ */ l("mesh", { geometry: b, position: [m.x, m.y, m.z], children: /* @__PURE__ */ l(
        "fireMaterial",
        {
          ref: y,
          transparent: !0,
          depthWrite: !1,
          side: w.DoubleSide,
          blending: w.AdditiveBlending
        }
      ) }, h);
    })()),
    /* @__PURE__ */ l("points", { geometry: d, material: a.ember })
  ] });
}, em = Ce.memo(uu), du = (
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
), fu = (
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
), pu = (
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
), tr = [
  { wMul: 0.78, hMul: 1, xMul: 0, yMul: 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1, speed: 1.45, tOff: 0, iMul: 1 },
  { wMul: 0.52, hMul: 0.85, xMul: -0.12, yMul: 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
  { wMul: 0.42, hMul: 0.7, xMul: 0.14, yMul: 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 }
];
let nr = null, rr = null, or = null;
function mu() {
  return nr || (nr = new w.ShaderMaterial({
    vertexShader: du,
    fragmentShader: fu,
    uniforms: { uTime: { value: 0 } },
    transparent: !0,
    depthWrite: !1,
    side: w.DoubleSide,
    blending: w.AdditiveBlending
  })), nr;
}
function hu() {
  return rr || (rr = new w.ShaderMaterial({
    vertexShader: pu,
    fragmentShader: xi,
    uniforms: { uTime: { value: 0 } },
    transparent: !0,
    depthWrite: !1,
    blending: w.AdditiveBlending
  })), rr;
}
function gu() {
  return or || (or = new w.MeshBasicMaterial({
    color: 16777215,
    transparent: !0,
    opacity: 0.18,
    blending: w.AdditiveBlending,
    depthWrite: !1
  })), or;
}
const Rt = new w.Object3D(), ve = new w.Object3D(), rn = new w.Matrix4(), zo = new w.Color(), yu = Ce.memo(function({ fires: e }) {
  const t = N(null), r = N(null), o = N(null), i = N(null), a = N(null), s = e.length, u = s * tr.length, c = s * 2, f = wi(), d = Si(), m = mu(), h = gu(), b = hu(), y = F(() => {
    if (s === 0) return null;
    const p = new w.PlaneGeometry(1, 1), S = new Float32Array(u), v = new Float32Array(u), M = new Float32Array(u), T = new Float32Array(u), C = new Float32Array(u), P = new Float32Array(u), k = new Float32Array(u), R = new Float32Array(u), B = new Float32Array(u * 3);
    let E = 0;
    for (const _ of e) {
      const z = new w.Color(_.color);
      for (const W of tr)
        S[E] = W.seed, v[E] = W.lean, M[E] = W.flare, T[E] = _.intensity * W.iMul, C[E] = W.speed, P[E] = W.tOff, k[E] = _.width * W.wMul, R[E] = _.height * W.hMul, B[E * 3] = z.r, B[E * 3 + 1] = z.g, B[E * 3 + 2] = z.b, E++;
    }
    return p.setAttribute("aSeed", new w.InstancedBufferAttribute(S, 1)), p.setAttribute("aLean", new w.InstancedBufferAttribute(v, 1)), p.setAttribute("aFlare", new w.InstancedBufferAttribute(M, 1)), p.setAttribute("aIntensity", new w.InstancedBufferAttribute(T, 1)), p.setAttribute("aSpeed", new w.InstancedBufferAttribute(C, 1)), p.setAttribute("aTOff", new w.InstancedBufferAttribute(P, 1)), p.setAttribute("aWidth", new w.InstancedBufferAttribute(k, 1)), p.setAttribute("aHeight", new w.InstancedBufferAttribute(R, 1)), p.setAttribute("aTint", new w.InstancedBufferAttribute(B, 3)), p;
  }, [e, s, u]), g = F(() => {
    if (s === 0) return null;
    const p = 18, S = s * p, v = new Float32Array(S * 3), M = new Float32Array(S), T = new Float32Array(S), C = new Float32Array(S), P = new Float32Array(S * 3);
    for (let R = 0; R < s; R++) {
      const B = e[R], E = R * p;
      for (let _ = 0; _ < p; _++) {
        const z = E + _;
        v[z * 3] = (Math.random() - 0.5) * B.width * 0.35, v[z * 3 + 1] = Math.random() * B.height * 0.2, v[z * 3 + 2] = (Math.random() - 0.5) * B.width * 0.35, M[z] = Math.random(), T[z] = 0.12 + Math.random() * 0.22, C[z] = Math.random() * Math.PI * 2, P[z * 3] = B.position[0], P[z * 3 + 1] = B.position[1], P[z * 3 + 2] = B.position[2];
      }
    }
    const k = new w.BufferGeometry();
    return k.setAttribute("position", new w.BufferAttribute(v, 3)), k.setAttribute("aLife", new w.BufferAttribute(M, 1)), k.setAttribute("aSpeed", new w.BufferAttribute(T, 1)), k.setAttribute("aDrift", new w.BufferAttribute(C, 1)), k.setAttribute("aFirePos", new w.BufferAttribute(P, 3)), k.computeBoundingSphere(), k;
  }, [e, s]);
  return Oe(() => {
    if (s === 0) return;
    const p = t.current;
    if (!p) return;
    let S = 0;
    for (const v of e) {
      const M = Math.cos(v.rotation), T = Math.sin(v.rotation);
      for (const C of tr) {
        const P = v.width * C.xMul, k = C.z;
        ve.position.set(
          v.position[0] + P * M + k * T,
          v.position[1] + v.height * C.yMul,
          v.position[2] + k * M - P * T
        ), ve.rotation.set(0, 0, 0), ve.scale.set(1, 1, 1), ve.updateMatrix(), p.setMatrixAt(S++, ve.matrix);
      }
    }
    p.count = u, p.instanceMatrix.needsUpdate = !0;
  }, [e, s, u]), Oe(() => {
    if (s === 0) return;
    const p = r.current;
    if (!p) return;
    let S = 0;
    for (const v of e) {
      Rt.position.set(v.position[0], v.position[1], v.position[2]), Rt.rotation.set(0, v.rotation, 0), Rt.updateMatrix();
      const M = Math.max(0.4, (v.width + v.height * 0.5) / 1.5);
      ve.position.set(0.12 * M, 0.06 * M, 0.05 * M), ve.rotation.set(0.3, 0, 0.65), ve.scale.set(M, M, M), ve.updateMatrix(), rn.multiplyMatrices(Rt.matrix, ve.matrix), p.setMatrixAt(S++, rn), ve.position.set(-0.1 * M, 0.06 * M, 0.08 * M), ve.rotation.set(0.25, 1.2, -0.6), ve.scale.set(M, M, M), ve.updateMatrix(), rn.multiplyMatrices(Rt.matrix, ve.matrix), p.setMatrixAt(S++, rn);
    }
    p.count = c, p.instanceMatrix.needsUpdate = !0;
  }, [e, s, c]), Oe(() => {
    if (s === 0) return;
    const p = o.current;
    if (p) {
      for (let S = 0; S < s; S++) {
        const v = e[S];
        ve.position.set(v.position[0], v.position[1] + 0.018, v.position[2]), ve.rotation.set(-Math.PI / 2, 0, v.rotation), ve.scale.set(v.width, v.width, 1), ve.updateMatrix(), p.setMatrixAt(S, ve.matrix);
      }
      p.count = s, p.instanceMatrix.needsUpdate = !0;
    }
  }, [e, s]), Oe(() => {
    if (s === 0) return;
    const p = i.current;
    if (p) {
      for (let S = 0; S < s; S++) {
        const v = e[S];
        ve.position.set(v.position[0], v.position[1] + 0.02, v.position[2]), ve.rotation.set(-Math.PI / 2, 0, v.rotation), ve.scale.set(v.width, v.width, 1), ve.updateMatrix(), p.setMatrixAt(S, ve.matrix), zo.set(v.color), p.setColorAt(S, zo);
      }
      p.count = s, p.instanceMatrix.needsUpdate = !0, p.instanceColor && (p.instanceColor.needsUpdate = !0);
    }
  }, [e, s]), de((p) => {
    const S = p.clock.elapsedTime;
    m.uniforms.uTime.value = S, b.uniforms.uTime.value = S, h.opacity = 0.16 + Math.sin(S * 2.5) * 0.06;
  }), L(() => () => {
    y?.dispose(), g?.dispose();
  }, [y, g]), s === 0 ? null : /* @__PURE__ */ x(Se, { children: [
    y && /* @__PURE__ */ l(
      "instancedMesh",
      {
        ref: t,
        args: [y, m, u],
        frustumCulled: !1
      }
    ),
    /* @__PURE__ */ l("instancedMesh", { ref: r, args: [f.log, d.log, c] }),
    /* @__PURE__ */ l("instancedMesh", { ref: o, args: [f.charcoal, d.charcoal, s] }),
    /* @__PURE__ */ l("instancedMesh", { ref: i, args: [f.glow, h, s] }),
    g && /* @__PURE__ */ l("points", { ref: a, geometry: g, material: b, frustumCulled: !1 })
  ] });
});
var bu = `precision highp float;

uniform sampler2D map;\r
uniform float transmission;\r
uniform float envMapIntensity;

varying vec2 vUv;

void main() {\r
    vec4 texColor = texture2D(map, vUv);\r
    float alpha = texColor.a * (1.0 - transmission);\r
    if (alpha < 0.01) discard;\r
    gl_FragColor = vec4(texColor.rgb * envMapIntensity, alpha);\r
}`, vu = `precision highp float;

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
const xu = zr(
  {
    map: null,
    time: 0,
    windStrength: 1,
    transmission: 0.05,
    envMapIntensity: 1
  },
  vu,
  bu
);
Sn({ FlagMaterial: xu });
let Nt = null;
function wu() {
  if (Nt) return Nt;
  const n = document.createElement("canvas");
  n.width = 4, n.height = 4;
  const e = n.getContext("2d");
  return e.fillStyle = "#cc2222", e.fillRect(0, 0, 4, 4), Nt = new w.CanvasTexture(n), Nt.needsUpdate = !0, Nt;
}
const Su = new w.MeshStandardMaterial({ color: "#8B4513" }), Mu = new w.MeshStandardMaterial({ color: "#444444", metalness: 0.6, roughness: 0.3 }), ie = new w.Object3D();
function Cu(n) {
  const e = [];
  for (const t of n)
    switch (wn[t.style].poleType) {
      case "side": {
        const o = t.flagHeight + 2.5;
        ie.position.set(t.x, t.y + o / 2, t.z), ie.scale.set(1, o, 1), ie.updateMatrix(), e.push(ie.matrix.clone());
        break;
      }
      case "top": {
        const o = t.flagHeight + 1.5;
        ie.position.set(t.x, t.y + o + 0.025, t.z), ie.rotation.set(0, 0, Math.PI / 2), ie.scale.set(1, t.flagWidth, 1), ie.updateMatrix(), e.push(ie.matrix.clone()), ie.rotation.set(0, 0, 0);
        break;
      }
      case "frame": {
        const o = t.flagHeight + 0.5;
        ie.position.set(t.x - t.flagWidth / 2, t.y + o / 2, t.z), ie.scale.set(1, o, 1), ie.updateMatrix(), e.push(ie.matrix.clone()), ie.position.set(t.x + t.flagWidth / 2, t.y + o / 2, t.z), ie.updateMatrix(), e.push(ie.matrix.clone()), ie.position.set(t.x, t.y + o, t.z), ie.rotation.set(0, 0, Math.PI / 2), ie.scale.set(1, t.flagWidth + 0.05, 1), ie.updateMatrix(), e.push(ie.matrix.clone()), ie.rotation.set(0, 0, 0), ie.position.set(t.x, t.y + 0.025, t.z), ie.rotation.set(0, 0, Math.PI / 2), ie.scale.set(1, t.flagWidth + 0.05, 1), ie.updateMatrix(), e.push(ie.matrix.clone()), ie.rotation.set(0, 0, 0);
        break;
      }
      case "both": {
        const o = t.flagHeight + 2.5;
        ie.position.set(t.x - t.flagWidth / 2, t.y + o / 2, t.z), ie.scale.set(1, o, 1), ie.updateMatrix(), e.push(ie.matrix.clone()), ie.position.set(t.x + t.flagWidth / 2, t.y + o / 2, t.z), ie.updateMatrix(), e.push(ie.matrix.clone());
        break;
      }
    }
  return e;
}
function ku({ entries: n }) {
  const e = N(null), t = F(() => new w.BoxGeometry(0.05, 1, 0.05), []), r = F(() => Cu(n), [n]), o = r.length, i = F(() => Math.max(1, o), [o]), s = n.some((u) => u.style === "panel") ? Mu : Su;
  return Oe(() => {
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
  }, [t]), o === 0 ? null : /* @__PURE__ */ l("instancedMesh", { ref: e, args: [t, s, i] });
}
function Mi({ entries: n, windStrength: e, texture: t }) {
  const r = N(null), o = N(null), i = n.length, a = F(() => Math.max(1, i), [i]), s = n[0]?.flagWidth ?? 1.5, u = n[0]?.flagHeight ?? 1, c = e > 0 ? 16 : 1, f = e > 0 ? 8 : 1, d = F(
    () => new w.PlaneGeometry(s, u, c, f),
    [s, u, c, f]
  );
  return Oe(() => {
    const m = r.current;
    if (m) {
      m.count = i;
      for (let h = 0; h < i; h++) {
        const b = n[h];
        if (!b) continue;
        const y = wn[b.style];
        let g = b.x, p = b.y;
        switch (y.poleType) {
          case "side":
            g = b.x + b.flagWidth / 2, p = b.y + b.flagHeight + 2.5 - b.flagHeight / 2;
            break;
          case "top":
            p = b.y + b.flagHeight + 1.5 - b.flagHeight / 2;
            break;
          case "frame":
            p = b.y + (b.flagHeight + 0.5) / 2 + 0.025;
            break;
          case "both":
            p = b.y + b.flagHeight + 2.5 - b.flagHeight / 2;
            break;
        }
        ie.position.set(g, p, b.z), ie.scale.set(b.flagWidth / s, b.flagHeight / u, 1), ie.updateMatrix(), m.setMatrixAt(h, ie.matrix);
      }
      m.instanceMatrix.needsUpdate = !0;
    }
  }, [n, i, s, u]), de((m) => {
    const h = o.current;
    h.time = m.clock.elapsedTime * 5, h.windStrength = e;
  }), L(() => () => {
    d.dispose();
  }, [d]), i === 0 ? null : /* @__PURE__ */ l("instancedMesh", { ref: r, args: [d, void 0, a], frustumCulled: !1, children: /* @__PURE__ */ l(
    "flagMaterial",
    {
      ref: o,
      map: t,
      transmission: 0.05,
      windStrength: e,
      envMapIntensity: 1,
      side: w.DoubleSide,
      transparent: !0
    }
  ) });
}
function Iu({
  entries: n,
  textureUrl: e,
  windStrength: t
}) {
  const r = Er(e);
  return /* @__PURE__ */ l(Mi, { entries: n, windStrength: t, texture: r });
}
function Au({
  entries: n,
  windStrength: e
}) {
  const t = F(() => wu(), []);
  return /* @__PURE__ */ l(Mi, { entries: n, windStrength: e, texture: t });
}
function Tu({
  entries: n,
  textureUrl: e,
  windStrength: t
}) {
  return e ? /* @__PURE__ */ l(Iu, { entries: n, textureUrl: e, windStrength: t }) : /* @__PURE__ */ l(Au, { entries: n, windStrength: t });
}
const _u = Ce.memo(function({ flags: e }) {
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
      const a = `${i.textureUrl}|${i.style}`;
      let s = o.get(a);
      s || (s = [], o.set(a, s)), s.push(i);
    }
    return Array.from(o.entries());
  }, [t]);
  return /* @__PURE__ */ x(Se, { children: [
    /* @__PURE__ */ l(ku, { entries: t }),
    r.map(([o, i]) => {
      const a = i[0];
      if (!a) return null;
      const s = a.style, u = wn[s].windStrength, c = a.textureUrl;
      return /* @__PURE__ */ l(
        Tu,
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
function ee(n) {
  const e = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return e - Math.floor(e);
}
function $r(n, e, t) {
  n[e] = t.r, n[e + 1] = t.g, n[e + 2] = t.b;
}
let ir = null, sr = null, ar = null;
function Ci() {
  return ir || (ir = {
    limb: new w.CylinderGeometry(0.5, 1, 1, 8, 1, !1),
    canopyCluster: new w.IcosahedronGeometry(1, 1),
    canopyCore: new w.SphereGeometry(1, 10, 8),
    trunkTop: new w.SphereGeometry(1, 10, 8)
  }), ir;
}
function ki(n) {
  return n ? (ar || (ar = {
    bark: lt({ color: "#5e3d30", steps: 3 }),
    barkDark: lt({ color: "#3f271e", steps: 3 }),
    blossomShell: lt({ color: "#f7bfd2", transparent: !0, opacity: 0.78, steps: 4, depthWrite: !1 }),
    blossomCore: lt({ color: "#ffe6f0", transparent: !0, opacity: 0.6, steps: 4, depthWrite: !1 })
  }), ar) : (sr || (sr = {
    bark: new w.MeshStandardMaterial({ color: "#5e3d30", roughness: 0.95, metalness: 0.02 }),
    barkDark: new w.MeshStandardMaterial({ color: "#3f271e", roughness: 1, metalness: 0.01 }),
    blossomShell: new w.MeshStandardMaterial({ color: "#f7bfd2", roughness: 0.92, metalness: 0, transparent: !0, opacity: 0.68 }),
    blossomCore: new w.MeshStandardMaterial({ color: "#ffe6f0", roughness: 0.84, metalness: 0, transparent: !0, opacity: 0.5 })
  }), sr);
}
function Ii(n, e) {
  const t = Math.max(11, Math.min(18, Math.round(10 + n * 4)));
  return Array.from({ length: t }, (r, o) => {
    const i = 19.3 + o * 13.17 + n * 5.1, a = (1.05 + ee(i + 1) * 1.35) * n, s = ee(i + 2) > 0.5 ? 1 : -1;
    return {
      pivotY: e * (0.38 + ee(i + 3) * 0.42),
      length: a,
      radius: (0.08 + ee(i + 4) * 0.045) * n,
      yaw: ee(i + 5) * Math.PI * 2,
      bend: (0.58 + ee(i + 6) * 0.34) * s,
      lean: (ee(i + 7) - 0.5) * 0.34,
      twigLength: a * (0.34 + ee(i + 8) * 0.26),
      twigYaw: (ee(i + 9) - 0.5) * 0.95,
      twigLean: (0.25 + ee(i + 10) * 0.38) * -s
    };
  });
}
function Ai(n) {
  return Array.from({ length: 5 }, (e, t) => {
    const r = 101.2 + t * 8.31 + n * 3.7;
    return {
      angle: t / 5 * Math.PI * 2 + (ee(r) - 0.5) * 0.4,
      length: (0.52 + ee(r + 1) * 0.42) * n,
      radius: (0.09 + ee(r + 2) * 0.04) * n,
      spread: (0.8 + ee(r + 3) * 0.28) * (ee(r + 4) > 0.5 ? 1 : -1)
    };
  });
}
function Ti(n, e, t, r) {
  const o = Math.max(9, Math.min(16, Math.round(9 + n * 4)));
  return Array.from({ length: o }, (i, a) => {
    const s = 220.4 + a * 10.73 + n * 4.4, u = ee(s) * Math.PI * 2, c = t * (0.18 + ee(s + 1) * 0.72), f = (0.7 + ee(s + 5) * 0.9) * n, d = (0.52 + ee(s + 6) * 0.56) * n, m = (0.66 + ee(s + 7) * 0.88) * n;
    return {
      position: [Math.cos(u) * c, e * (0.64 + ee(s + 3) * 0.22) + ee(s + 4) * r * 0.42, Math.sin(u) * c * (0.86 + ee(s + 2) * 0.22)],
      rotation: [(ee(s + 8) - 0.5) * 0.55, ee(s + 9) * Math.PI * 2, (ee(s + 10) - 0.5) * 0.55],
      outerScale: [f, d, m],
      innerScale: [f * 0.7, d * 0.72, m * 0.7]
    };
  });
}
const on = new w.Object3D(), Le = new w.Object3D(), Gt = new w.Matrix4(), pn = new w.Matrix4(), Ke = new w.Color();
function Qe(n, e, t, r, o, i, a, s) {
  on.position.set(r[0], r[1], r[2]), on.rotation.set(o[0], o[1], o[2]), on.updateMatrix(), Le.position.set(i[0], i[1], i[2]), Le.rotation.set(a ? a[0] : 0, a ? a[1] : 0, a ? a[2] : 0), Le.scale.set(s[0], s[1], s[2]), Le.updateMatrix(), Gt.multiplyMatrices(on.matrix, Le.matrix), t && (pn.makeTranslation(t[0], t[1] + 0.02, t[2]), Gt.premultiply(pn)), n.setMatrixAt(e, Gt);
}
function mn(n, e, t, r, o, i) {
  Le.position.set(r[0], r[1], r[2]), Le.rotation.set(o[0], o[1], o[2]), Le.scale.set(i[0], i[1], i[2]), Le.updateMatrix(), t ? (pn.makeTranslation(t[0], t[1] + 0.02, t[2]), Gt.multiplyMatrices(pn, Le.matrix), n.setMatrixAt(e, Gt)) : n.setMatrixAt(e, Le.matrix);
}
function _i(n, e, t, r, o, i, a, s, u, c, f) {
  const d = f ? f.clone().multiplyScalar(0.85) : new w.Color("#f3a1bf"), m = f ? f.clone().lerp(new w.Color("#ffffff"), 0.6) : new w.Color("#fff1f6"), h = new w.Color();
  for (let b = 0; b < r; b++) {
    const y = 330.7 + b * 17.13, g = ee(y) * Math.PI * 2, p = i * (0.18 + Math.sqrt(ee(y + 1)) * 0.86), S = (t + b) * 3;
    n[S] = Math.cos(g) * p * (0.82 + ee(y + 2) * 0.22) + s, n[S + 1] = o * 0.58 + Math.pow(ee(y + 4), 0.72) * a + (ee(y + 5) - 0.5) * 0.36 + u, n[S + 2] = Math.sin(g) * p * (0.8 + ee(y + 3) * 0.26) + c, h.copy(d).lerp(m, 0.28 + ee(y + 6) * 0.72).multiplyScalar(0.92 + ee(y + 7) * 0.18), $r(e, S, h);
  }
}
function Pi(n, e, t, r, o, i, a, s, u) {
  const c = u ? u.clone().multiplyScalar(0.9) : new w.Color("#f7cadb"), f = u ? u.clone().lerp(new w.Color("#ffffff"), 0.7) : new w.Color("#fff3f8"), d = new w.Color();
  for (let m = 0; m < r; m++) {
    const h = 510.9 + m * 9.41, b = ee(h) * Math.PI * 2, y = o * (0.18 + Math.pow(ee(h + 1), 0.6) * 0.92), g = (t + m) * 3;
    n[g] = Math.cos(b) * y + i, n[g + 1] = 0.035 + ee(h + 2) * 0.03 + a, n[g + 2] = Math.sin(b) * y + s, d.copy(c).lerp(f, 0.35 + ee(h + 3) * 0.65).multiplyScalar(0.9 + ee(h + 4) * 0.12), $r(e, g, d);
  }
}
function Ri(n, e, t, r, o, i, a, s, u, c, f, d, m, h, b, y) {
  const g = y ? y.clone().multiplyScalar(0.88) : new w.Color("#f8b3ca"), p = y ? y.clone().lerp(new w.Color("#ffffff"), 0.65) : new w.Color("#fff5fa"), S = new w.Color();
  for (let v = 0; v < s; v++) {
    const M = 740.6 + v * 6.83, T = ee(M) * Math.PI * 2, C = c * (0.1 + ee(M + 1) * 0.72), P = a + v, k = P * 3;
    n[k] = Math.cos(T) * C, n[k + 1] = u * 0.66 + ee(M + 2) * f * 0.88, n[k + 2] = Math.sin(T) * C;
    const R = P * 4;
    t[R] = 0.12 + ee(M + 3) * 0.18, t[R + 1] = ee(M + 4), t[R + 2] = 0.08 + ee(M + 5) * 0.18, t[R + 3] = 1 + ee(M + 6) * 1.9;
    const B = P * 2;
    r[B] = (ee(M + 7) - 0.5) * 0.8, r[B + 1] = (ee(M + 8) - 0.5) * 0.8, o && (o[k] = m, o[k + 1] = h, o[k + 2] = b), i && (i[P] = 0.11 * d), S.copy(g).lerp(p, 0.2 + ee(M + 9) * 0.8).multiplyScalar(0.94 + ee(M + 10) * 0.12), $r(e, k, S);
  }
}
function hn(n, e, t = !1) {
  const r = new w.BufferGeometry();
  return r.setAttribute("position", new w.Float32BufferAttribute(n, 3)), r.setAttribute("color", new w.Float32BufferAttribute(e, 3)), t && r.computeBoundingBox(), r.computeBoundingSphere(), r;
}
const st = new w.Color("#f7bfd2"), Ft = new w.Color("#5e3d30"), Pu = new w.Color("#ffffff");
function Ru(n) {
  return n.map((e) => {
    const t = w.MathUtils.clamp(e.size / 4, 0.95, 1.85), r = 3.8 * t, o = 1.65 * t + Math.min(e.size * 0.08, 0.55), i = 2.15 * t + Math.min(e.size * 0.04, 0.35);
    return {
      pos: e.position,
      scale: t,
      trunkHeight: r,
      crownRadius: o,
      crownHeight: i,
      branches: Ii(t, r),
      roots: Ai(t),
      clusters: Ti(t, r, o, i),
      canopyN: Math.max(180, Math.min(420, Math.round(210 + t * 95))),
      groundN: Math.max(44, Math.min(120, Math.round(54 + t * 26))),
      fallingN: Math.max(52, Math.min(132, Math.round(62 + t * 30))),
      blossom: e.blossomColor ? new w.Color(e.blossomColor) : st,
      bark: e.barkColor ? new w.Color(e.barkColor) : Ft
    };
  });
}
const Nu = (
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
), Ni = (
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
function Eu({ trees: n, toon: e }) {
  const t = N(null), r = N(null), o = N(null), i = N(null), a = N(null), s = N(null), u = e ?? Te(), c = Ci(), f = ki(u), d = F(() => Ru(n), [n]), m = F(() => {
    let v = 0, M = 0, T = 0, C = 0, P = 0, k = 0;
    for (const R of d)
      v += R.branches.length + 1, M += R.roots.length + R.branches.length, T += R.clusters.length, C += R.canopyN, P += R.groundN, k += R.fallingN;
    return { bark: v, dark: M, top: d.length, cluster: T, canopy: C, ground: P, falling: k };
  }, [d]), h = F(() => d.length === 0 ? 1 : d.reduce((v, M) => v + M.scale, 0) / d.length, [d]), b = F(
    () => d.some((v) => v.blossom !== st || v.bark !== Ft),
    [d]
  ), y = F(() => {
    const v = new Float32Array(m.canopy * 3), M = new Float32Array(m.canopy * 3);
    let T = 0;
    for (const C of d) {
      const P = C.blossom !== st ? C.blossom : void 0;
      _i(v, M, T, C.canopyN, C.trunkHeight, C.crownRadius, C.crownHeight, C.pos[0], C.pos[1] + 0.02, C.pos[2], P), T += C.canopyN;
    }
    return hn(v, M);
  }, [d, m.canopy]), g = F(() => {
    const v = new Float32Array(m.ground * 3), M = new Float32Array(m.ground * 3);
    let T = 0;
    for (const C of d) {
      const P = C.blossom !== st ? C.blossom : void 0;
      Pi(v, M, T, C.groundN, C.crownRadius, C.pos[0], C.pos[1] + 0.02, C.pos[2], P), T += C.groundN;
    }
    return hn(v, M);
  }, [d, m.ground]), p = F(() => {
    const v = m.falling, M = new Float32Array(v * 3), T = new Float32Array(v * 3), C = new Float32Array(v * 4), P = new Float32Array(v * 2), k = new Float32Array(v * 3), R = new Float32Array(v);
    let B = 0;
    for (const _ of d) {
      const z = _.blossom !== st ? _.blossom : void 0;
      Ri(
        M,
        T,
        C,
        P,
        k,
        R,
        B,
        _.fallingN,
        _.trunkHeight,
        _.crownRadius,
        _.crownHeight,
        _.scale,
        _.pos[0],
        _.pos[1] + 0.02,
        _.pos[2],
        z
      ), B += _.fallingN;
    }
    const E = new w.BufferGeometry();
    return E.setAttribute("position", new w.Float32BufferAttribute(M, 3)), E.setAttribute("color", new w.Float32BufferAttribute(T, 3)), E.setAttribute("aParams1", new w.Float32BufferAttribute(C, 4)), E.setAttribute("aParams2", new w.Float32BufferAttribute(P, 2)), E.setAttribute("aTreePos", new w.Float32BufferAttribute(k, 3)), E.setAttribute("aPointScale", new w.Float32BufferAttribute(R, 1)), E.computeBoundingSphere(), E;
  }, [d, m.falling]), S = F(() => new w.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: 1 },
      uOpacity: { value: 0.88 },
      uWind: { value: 1 }
    },
    vertexShader: Nu,
    fragmentShader: Ni,
    transparent: !0,
    depthWrite: !1
  }), []);
  return Oe(() => {
    let v = 0, M = 0, T = 0, C = 0, P = 0;
    for (const k of d) {
      const R = k.pos, B = k.bark !== Ft, E = k.blossom !== st;
      if (Qe(
        t.current,
        v,
        R,
        [0, k.trunkHeight * 0.5, 0],
        [0.02, 0, -0.04],
        [0, 0, 0],
        null,
        [0.3 * k.scale, k.trunkHeight, 0.3 * k.scale]
      ), b && t.current.setColorAt(v, B ? k.bark : Ft), v++, Qe(
        o.current,
        T,
        R,
        [0, k.trunkHeight * 0.5, 0],
        [0.02, 0, -0.04],
        [0, k.trunkHeight * 0.48, 0],
        null,
        [0.24 * k.scale, 0.32 * k.scale, 0.24 * k.scale]
      ), b) {
        const _ = B ? Ke.copy(k.bark).multiplyScalar(0.65) : Ke.set("#3f271e");
        o.current.setColorAt(T, _);
      }
      T++;
      for (const _ of k.branches)
        Qe(
          t.current,
          v,
          R,
          [0, _.pivotY, 0],
          [_.lean, _.yaw, _.bend],
          [0, _.length * 0.5, 0],
          null,
          [_.radius, _.length, _.radius]
        ), b && t.current.setColorAt(v, B ? k.bark : Ft), v++;
      for (const _ of k.roots) {
        if (Qe(
          r.current,
          M,
          R,
          [0, 0.14 * k.scale, 0],
          [0, _.angle, _.spread],
          [0, _.length * 0.22, 0],
          null,
          [_.radius, _.length, _.radius]
        ), b) {
          const z = B ? Ke.copy(k.bark).multiplyScalar(0.65) : Ke.set("#3f271e");
          r.current.setColorAt(M, z);
        }
        M++;
      }
      for (const _ of k.branches) {
        if (Qe(
          r.current,
          M,
          R,
          [0, _.pivotY, 0],
          [_.lean, _.yaw, _.bend],
          [0, _.length * 0.76, 0],
          [_.twigLean, _.twigYaw, _.bend * -0.42],
          [_.radius * 0.52, _.twigLength, _.radius * 0.52]
        ), b) {
          const z = B ? Ke.copy(k.bark).multiplyScalar(0.65) : Ke.set("#3f271e");
          r.current.setColorAt(M, z);
        }
        M++;
      }
      for (const _ of k.clusters) {
        if (mn(i.current, C, R, _.position, _.rotation, _.outerScale), b && i.current.setColorAt(C, E ? k.blossom : st), C++, mn(a.current, P, R, _.position, _.rotation, _.innerScale), b) {
          const z = E ? Ke.copy(k.blossom).lerp(Pu, 0.4) : Ke.set("#ffe6f0");
          a.current.setColorAt(P, z);
        }
        P++;
      }
    }
    for (const [k, R] of [[t, v], [r, M], [o, T], [i, C], [a, P]])
      k.current.count = R, k.current.instanceMatrix.needsUpdate = !0, b && k.current.instanceColor && (k.current.instanceColor.needsUpdate = !0);
  }, [d, b, m]), L(() => () => {
    y.dispose(), g.dispose(), p.dispose(), S.dispose();
  }, [y, g, p, S]), de((v) => {
    const M = s.current;
    if (!M) return;
    const T = M.parent;
    if (T && !T.visible) return;
    const C = M.material;
    if (C?.uniforms) {
      const P = C.uniforms.uTime, k = C.uniforms.uScale, R = De.getState().current, B = R?.intensity ?? 0, E = R?.kind === "storm" ? 2.4 : R?.kind === "rain" ? 1.6 : R?.kind === "snow" ? 1.2 : R?.kind === "cloudy" ? 1.1 : 0.9, _ = C.uniforms.uWind;
      P && (P.value = v.clock.getElapsedTime()), k && (k.value = v.gl.domElement.height * 0.5), _ && (_.value = E + B * 0.7);
    }
  }), d.length === 0 ? null : /* @__PURE__ */ x(Se, { children: [
    /* @__PURE__ */ l("instancedMesh", { ref: t, args: [c.limb, f.bark, m.bark], castShadow: !0 }),
    /* @__PURE__ */ l("instancedMesh", { ref: r, args: [c.limb, f.barkDark, m.dark] }),
    /* @__PURE__ */ l("instancedMesh", { ref: o, args: [c.trunkTop, f.barkDark, m.top], castShadow: !0 }),
    /* @__PURE__ */ l("instancedMesh", { ref: i, args: [c.canopyCluster, f.blossomShell, m.cluster], castShadow: !0 }),
    /* @__PURE__ */ l("instancedMesh", { ref: a, args: [c.canopyCore, f.blossomCore, m.cluster] }),
    /* @__PURE__ */ l("points", { geometry: y, children: /* @__PURE__ */ l("pointsMaterial", { size: 0.08 * h, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.82, depthWrite: !1 }) }),
    /* @__PURE__ */ l("points", { ref: s, geometry: p, material: S, frustumCulled: !1 }),
    /* @__PURE__ */ l("points", { geometry: g, children: /* @__PURE__ */ l("pointsMaterial", { size: 0.085 * h, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.7, depthWrite: !1 }) })
  ] });
}
function tm({ size: n = 4, toon: e }) {
  const t = N(null), r = N(null), o = N(null), i = N(null), a = N(null), s = N(null), u = F(() => w.MathUtils.clamp(n / 4, 0.95, 1.85), [n]), c = 3.8 * u, f = 1.65 * u + Math.min(n * 0.08, 0.55), d = 2.15 * u + Math.min(n * 0.04, 0.35), m = e ?? Te(), h = Ci(), b = ki(m), y = F(() => Ii(u, c), [u, c]), g = F(() => Ai(u), [u]), p = F(() => Ti(u, c, f, d), [u, c, f, d]), S = y.length, v = g.length + y.length, M = p.length, T = Math.max(180, Math.min(420, Math.round(210 + u * 95))), C = Math.max(44, Math.min(120, Math.round(54 + u * 26))), P = Math.max(52, Math.min(132, Math.round(62 + u * 30))), k = F(() => {
    const _ = new Float32Array(T * 3), z = new Float32Array(T * 3);
    return _i(_, z, 0, T, c, f, d, 0, 0, 0), hn(_, z, !0);
  }, [T, c, f, d]), R = F(() => {
    const _ = new Float32Array(C * 3), z = new Float32Array(C * 3);
    return Pi(_, z, 0, C, f, 0, 0, 0), hn(_, z, !0);
  }, [C, f]), B = F(() => {
    const _ = new Float32Array(P * 3), z = new Float32Array(P * 3), W = new Float32Array(P * 4), H = new Float32Array(P * 2);
    Ri(_, z, W, H, null, null, 0, P, c, f, d, u, 0, 0, 0);
    const j = new w.BufferGeometry();
    return j.setAttribute("position", new w.Float32BufferAttribute(_, 3)), j.setAttribute("color", new w.Float32BufferAttribute(z, 3)), j.setAttribute("aParams1", new w.Float32BufferAttribute(W, 4)), j.setAttribute("aParams2", new w.Float32BufferAttribute(H, 2)), j.computeBoundingSphere(), j;
  }, [P, c, f, d, u]), E = F(() => new w.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPointSize: { value: 0.11 * u }, uScale: { value: 1 }, uOpacity: { value: 0.88 } },
    vertexShader: zu,
    fragmentShader: Ni,
    transparent: !0,
    depthWrite: !1
  }), [u]);
  return Oe(() => {
    const _ = o.current;
    if (_) {
      _.count = S;
      for (let j = 0; j < y.length; j++) {
        const A = y[j];
        A && Qe(_, j, null, [0, A.pivotY, 0], [A.lean, A.yaw, A.bend], [0, A.length * 0.5, 0], null, [A.radius, A.length, A.radius]);
      }
      _.instanceMatrix.needsUpdate = !0;
    }
    const z = i.current;
    if (z) {
      z.count = v;
      let j = 0;
      for (const A of g) Qe(z, j++, null, [0, 0.14 * u, 0], [0, A.angle, A.spread], [0, A.length * 0.22, 0], null, [A.radius, A.length, A.radius]);
      for (const A of y) Qe(z, j++, null, [0, A.pivotY, 0], [A.lean, A.yaw, A.bend], [0, A.length * 0.76, 0], [A.twigLean, A.twigYaw, A.bend * -0.42], [A.radius * 0.52, A.twigLength, A.radius * 0.52]);
      z.instanceMatrix.needsUpdate = !0;
    }
    const W = a.current;
    if (W) {
      W.count = M;
      for (let j = 0; j < p.length; j++) {
        const A = p[j];
        A && mn(W, j, null, A.position, A.rotation, A.outerScale);
      }
      W.instanceMatrix.needsUpdate = !0;
    }
    const H = s.current;
    if (H) {
      H.count = M;
      for (let j = 0; j < p.length; j++) {
        const A = p[j];
        A && mn(H, j, null, A.position, A.rotation, A.innerScale);
      }
      H.instanceMatrix.needsUpdate = !0;
    }
  }, [y, g, p, u, S, v, M]), L(() => () => {
    k.dispose(), R.dispose(), B.dispose(), E.dispose();
  }, [k, R, B, E]), de((_) => {
    const z = r.current?.parent;
    if (z && !z.visible) return;
    const W = _.clock.getElapsedTime(), H = r.current?.material;
    if (H?.uniforms) {
      const j = H.uniforms.uTime, A = H.uniforms.uScale;
      j && (j.value = W), A && (A.value = _.gl.domElement.height * 0.5);
    }
    t.current && (t.current.rotation.z = Math.sin(W * 0.42 + u) * 0.028, t.current.rotation.x = Math.cos(W * 0.35 + u * 0.6) * 0.012, t.current.position.x = Math.sin(W * 0.28 + u) * 0.04 * u);
  }), /* @__PURE__ */ x("group", { position: [0, 0.02, 0], children: [
    /* @__PURE__ */ x("group", { position: [0, c * 0.5, 0], rotation: [0.02, 0, -0.04], children: [
      /* @__PURE__ */ l("mesh", { geometry: h.limb, material: b.bark, scale: [0.3 * u, c, 0.3 * u], castShadow: !0, receiveShadow: !0 }),
      /* @__PURE__ */ l("mesh", { geometry: h.trunkTop, material: b.barkDark, position: [0, c * 0.48, 0], scale: [0.24 * u, 0.32 * u, 0.24 * u], castShadow: !0, receiveShadow: !0 })
    ] }),
    /* @__PURE__ */ l("instancedMesh", { ref: o, args: [h.limb, b.bark, S] }),
    /* @__PURE__ */ l("instancedMesh", { ref: i, args: [h.limb, b.barkDark, v] }),
    /* @__PURE__ */ x("group", { ref: t, children: [
      /* @__PURE__ */ l("instancedMesh", { ref: a, args: [h.canopyCluster, b.blossomShell, M], castShadow: !0 }),
      /* @__PURE__ */ l("instancedMesh", { ref: s, args: [h.canopyCore, b.blossomCore, M] }),
      /* @__PURE__ */ l("points", { geometry: k, children: /* @__PURE__ */ l("pointsMaterial", { size: 0.08 * u, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.82, depthWrite: !1 }) })
    ] }),
    /* @__PURE__ */ l("points", { ref: r, geometry: B, material: E, frustumCulled: !1 }),
    /* @__PURE__ */ l("points", { geometry: R, children: /* @__PURE__ */ l("pointsMaterial", { size: 0.085 * u, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.7, depthWrite: !1 }) })
  ] });
}
const zu = (
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
let sn = null;
function Bu() {
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
async function Ei() {
  return typeof WebAssembly > "u" ? null : sn || (sn = (async () => {
    try {
      const n = Bu(), e = await fetch(n);
      if (!e.ok) return null;
      const t = await e.arrayBuffer(), { instance: r } = await WebAssembly.instantiate(t, {}), o = r.exports;
      return !o || !(o.memory instanceof WebAssembly.Memory) || typeof o.alloc_f32 != "function" || typeof o.dealloc_f32 != "function" ? null : o;
    } catch {
      return null;
    }
  })(), sn);
}
const Ae = 2e3, Du = 800, Pe = 20, Ar = 20, Fu = 3, Lu = (
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
), Gu = (
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
let Et = null;
function Ou() {
  if (Et) return Et;
  const n = document.createElement("canvas");
  n.width = 16, n.height = 16;
  const e = n.getContext("2d"), t = e.createRadialGradient(8, 8, 0, 8, 8, 8);
  return t.addColorStop(0, "rgba(255,255,255,1)"), t.addColorStop(1, "rgba(255,255,255,0)"), e.fillStyle = t, e.fillRect(0, 0, 16, 16), Et = new w.CanvasTexture(n), Et.needsUpdate = !0, Et;
}
function Uu() {
  const n = N(null), e = N(null), t = F(() => {
    const o = new w.BufferGeometry(), i = new Float32Array(Ae * 3), a = new Float32Array(Ae), s = new Float32Array(Ae), u = new Float32Array(Ae), c = new Float32Array(Ae), f = new Float32Array(Ae);
    for (let d = 0; d < Ae; d++)
      i[d * 3] = 0, i[d * 3 + 1] = 0, i[d * 3 + 2] = 0, a[d] = Math.random(), s[d] = (Math.random() - 0.5) * Pe * 2, u[d] = (Math.random() - 0.5) * Pe * 2, c[d] = 0.5 + Math.random() * 1.5, f[d] = 0.05 + Math.random() * 0.25;
    return o.setAttribute("position", new w.Float32BufferAttribute(i, 3)), o.setAttribute("aSeed", new w.Float32BufferAttribute(a, 1)), o.setAttribute("aBaseX", new w.Float32BufferAttribute(s, 1)), o.setAttribute("aBaseZ", new w.Float32BufferAttribute(u, 1)), o.setAttribute("aFallSpeed", new w.Float32BufferAttribute(c, 1)), o.setAttribute("aDriftAmp", new w.Float32BufferAttribute(f, 1)), o.boundingSphere = new w.Sphere(new w.Vector3(), Pe * 4), o;
  }, []), r = F(
    () => new w.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOrigin: { value: new w.Vector3() },
        uHalfRange: { value: Pe },
        uHeight: { value: Ar },
        uPointSize: { value: 0.08 },
        uScale: { value: 1 },
        uOpacity: { value: 0.85 }
      },
      vertexShader: Lu,
      fragmentShader: Gu,
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
    const a = i.parent;
    if (a && !a.visible) return;
    const s = e.current.uniforms, u = s.uTime, c = s.uOrigin, f = s.uScale;
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
function zi({ gpu: n } = {}) {
  return n ? /* @__PURE__ */ l(Uu, {}) : /* @__PURE__ */ l(Wu, {});
}
function Wu() {
  const n = N(null), e = N(new Float32Array(Ae * 3)), t = N(new Float32Array(Ae * 3)), r = N(null), o = N(null), i = F(() => new Float32Array(6), []), a = N(0);
  L(() => {
    const c = e.current, f = t.current;
    for (let b = 0; b < Ae; b++)
      c[b * 3] = (Math.random() - 0.5) * Pe * 2, c[b * 3 + 1] = Math.random() * Ar, c[b * 3 + 2] = (Math.random() - 0.5) * Pe * 2, f[b * 3] = 0, f[b * 3 + 1] = -(0.5 + Math.random() * 1.5), f[b * 3 + 2] = 0;
    let d = 0, m = 0, h = 0;
    return Ei().then((b) => {
      if (!b) return;
      r.current = b;
      const y = Ae * 3;
      d = b.alloc_f32(y), m = b.alloc_f32(y), h = b.alloc_f32(6), new Float32Array(b.memory.buffer, d, y).set(c), new Float32Array(b.memory.buffer, m, y).set(f), o.current = { p: d, v: m, b: h };
    }), () => {
      const b = r.current;
      b && (d && b.dealloc_f32(d, Ae * 3), m && b.dealloc_f32(m, Ae * 3), h && b.dealloc_f32(h, 6));
    };
  }, []), de((c, f) => {
    const d = n.current?.parent;
    if (d && !d.visible) return;
    const m = c.camera.position;
    i[0] = m.x - Pe, i[1] = m.x + Pe, i[2] = m.y - 5, i[3] = m.y + Ar, i[4] = m.z - Pe, i[5] = m.z + Pe;
    const h = Math.min(f, 0.05), b = r.current, y = o.current, g = e.current, p = t.current, v = a.current++ % Fu === 0, M = n.current;
    if (M)
      if (b && y) {
        new Float32Array(b.memory.buffer, y.b, 6).set(i), b.update_snow_particles(
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
        const T = new Float32Array(b.memory.buffer, y.p, Ae * 3), C = M.geometry.attributes.position;
        if (!(C instanceof w.BufferAttribute)) return;
        C.array = T, C.needsUpdate = !0;
      } else {
        const T = v ? Ae : Du;
        for (let P = 0; P < T; P++) {
          const k = P * 3, R = p[k], B = p[k + 1], E = p[k + 2], _ = g[k], z = g[k + 1], W = g[k + 2], H = i[0], j = i[1], A = i[2], G = i[3], $ = i[4], X = i[5];
          if (R === void 0 || B === void 0 || E === void 0 || _ === void 0 || z === void 0 || W === void 0 || H === void 0 || j === void 0 || A === void 0 || G === void 0 || $ === void 0 || X === void 0)
            continue;
          const Z = R * 0.99 + 0.3 * h;
          let O = B - 2 * h;
          const Q = E * 0.99;
          let J = _ + Z * h, te = z + O * h, ne = W + Q * h;
          J < H ? J += Pe * 2 : J > j && (J -= Pe * 2), te < A && (te = G, O = -(0.5 + Math.random() * 1.5)), ne < $ ? ne += Pe * 2 : ne > X && (ne -= Pe * 2), p[k] = Z, p[k + 1] = O, p[k + 2] = Q, g[k] = J, g[k + 1] = te, g[k + 2] = ne;
        }
        const C = M.geometry.attributes.position;
        if (!(C instanceof w.BufferAttribute)) return;
        C.needsUpdate = !0;
      }
  });
  const s = F(() => {
    const c = new w.BufferGeometry(), f = new w.Float32BufferAttribute(e.current, 3);
    return f.setUsage(w.DynamicDrawUsage), c.setAttribute("position", f), c;
  }, []), u = F(
    () => new w.PointsMaterial({
      size: 0.08,
      map: Ou(),
      transparent: !0,
      opacity: 0.85,
      depthWrite: !1
    }),
    []
  );
  return L(() => () => {
    s.dispose(), u.dispose();
  }, [s, u]), /* @__PURE__ */ l(
    "points",
    {
      ref: n,
      geometry: s,
      material: u,
      frustumCulled: !1
    }
  );
}
Ce.memo(zi);
function Hu() {
  const n = U((S) => S.editMode), e = U((S) => S.hoverPosition), t = U((S) => S.checkTilePosition), r = U((S) => S.currentTileMultiplier), o = U((S) => S.currentTileHeight), i = U((S) => S.currentTileShape), a = U((S) => S.currentTileRotation), s = U((S) => S.currentObjectRotation), u = U((S) => S.selectedPlacedObjectType), c = ue.GRID_CELL_SIZE * r, d = (i === "stairs" || i === "ramp" ? Math.max(1, o) : o) * ue.HEIGHT_STEP, m = Math.max(0.12, d + 0.12), h = w.MathUtils.clamp(c / ue.GRID_CELL_SIZE, 0.95, 1.85), b = F(() => {
    const S = new w.BufferGeometry(), v = new Float32Array([
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
    ]), M = [
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
    return S.setAttribute("position", new w.BufferAttribute(v, 3)), S.setIndex(M), S.computeVertexNormals(), S;
  }, []);
  if (L(() => () => {
    b.dispose();
  }, [b]), n !== "tile" && n !== "object" || !e)
    return null;
  const y = n === "tile" && (i === "box" || i === "round") ? e.y + o * ue.HEIGHT_STEP : e.y, p = (n === "tile" ? t({ x: e.x, y, z: e.z }) : !1) ? "#ff0000" : "#00ff00";
  return /* @__PURE__ */ x("group", { position: [e.x, y, e.z], rotation: [0, n === "object" ? s : a, 0], children: [
    n === "tile" && (i === "round" ? /* @__PURE__ */ x("mesh", { position: [0, d > 0.02 ? d / 2 : -0.02, 0], children: [
      /* @__PURE__ */ l("cylinderGeometry", { args: [c / 2, c / 2, d > 0.02 ? d : 0.04, 24] }),
      /* @__PURE__ */ l("meshStandardMaterial", { color: p, transparent: !0, opacity: 0.45, emissive: p, emissiveIntensity: 0.25 })
    ] }) : i === "stairs" ? /* @__PURE__ */ l(Se, { children: Array.from({ length: 4 }, (S, v) => {
      const T = Math.max(ue.HEIGHT_STEP, d) / 4, C = c / 4, P = T * (v + 1) - T / 2, k = -c / 2 + C * v + C / 2;
      return /* @__PURE__ */ x("mesh", { position: [0, P, k], children: [
        /* @__PURE__ */ l("boxGeometry", { args: [c, T * (v + 1), C] }),
        /* @__PURE__ */ l("meshStandardMaterial", { color: p, transparent: !0, opacity: 0.45, emissive: p, emissiveIntensity: 0.25 })
      ] }, v);
    }) }) : i === "ramp" ? /* @__PURE__ */ l("mesh", { position: [0, 0, 0], scale: [c, Math.max(ue.HEIGHT_STEP, d), c], geometry: b, children: /* @__PURE__ */ l("meshStandardMaterial", { color: p, transparent: !0, opacity: 0.45, emissive: p, emissiveIntensity: 0.25 }) }) : /* @__PURE__ */ x("mesh", { position: [0, m / 2, 0], children: [
      /* @__PURE__ */ l("boxGeometry", { args: [c, m, c] }),
      /* @__PURE__ */ l("meshStandardMaterial", { color: p, transparent: !0, opacity: 0.45, emissive: p, emissiveIntensity: 0.3 })
    ] })),
    n === "object" && /* @__PURE__ */ x("mesh", { position: [0, 0.06, 0], children: [
      /* @__PURE__ */ l("cylinderGeometry", { args: [0.35, 0.35, 0.12, 16] }),
      /* @__PURE__ */ l("meshStandardMaterial", { color: "#00ff88", transparent: !0, opacity: 0.5, emissive: "#00ff88", emissiveIntensity: 0.3 })
    ] }),
    n === "object" && u === "sakura" && /* @__PURE__ */ x("group", { position: [0, Math.max(d, 0.04), 0], children: [
      /* @__PURE__ */ x("mesh", { position: [0, 1.9 * h, 0], children: [
        /* @__PURE__ */ l("cylinderGeometry", { args: [0.16 * h, 0.28 * h, 3.8 * h, 8] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: p,
            transparent: !0,
            opacity: 0.32,
            emissive: p,
            emissiveIntensity: 0.15
          }
        )
      ] }),
      /* @__PURE__ */ x("mesh", { position: [0, 4 * h, 0], children: [
        /* @__PURE__ */ l("sphereGeometry", { args: [1.55 * h, 10, 8] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: p,
            transparent: !0,
            opacity: 0.18,
            emissive: p,
            emissiveIntensity: 0.18
          }
        )
      ] }),
      /* @__PURE__ */ x("mesh", { position: [0.95 * h, 3.55 * h, 0.4 * h], children: [
        /* @__PURE__ */ l("sphereGeometry", { args: [0.92 * h, 8, 6] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: p,
            transparent: !0,
            opacity: 0.14,
            emissive: p,
            emissiveIntensity: 0.12
          }
        )
      ] }),
      /* @__PURE__ */ x("mesh", { position: [-0.88 * h, 3.7 * h, -0.55 * h], children: [
        /* @__PURE__ */ l("sphereGeometry", { args: [1.02 * h, 8, 6] }),
        /* @__PURE__ */ l(
          "meshStandardMaterial",
          {
            color: p,
            transparent: !0,
            opacity: 0.14,
            emissive: p,
            emissiveIntensity: 0.12
          }
        )
      ] })
    ] })
  ] });
}
function ju() {
  const n = U((c) => c.editMode), e = U((c) => c.hoverPosition), t = U((c) => c.currentWallRotation), r = U((c) => c.checkWallPosition), o = ue.WALL_SIZES.WIDTH, i = ue.WALL_SIZES.HEIGHT, a = ue.WALL_SIZES.THICKNESS;
  if (n !== "wall" || !e)
    return null;
  const u = r(e, t) ? "#ff0000" : "#00ff00";
  return /* @__PURE__ */ l("group", { position: [e.x, e.y + i / 2, e.z], rotation: [0, t, 0], children: /* @__PURE__ */ x("mesh", { position: [0, 0, o / 2], children: [
    /* @__PURE__ */ l("boxGeometry", { args: [o, i, a] }),
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
var $u = Object.defineProperty, Vu = Object.getOwnPropertyDescriptor, Zt = (n, e, t, r) => {
  for (var o = Vu(e, t), i = n.length - 1, a; i >= 0; i--)
    (a = n[i]) && (o = a(e, t, o) || o);
  return o && $u(e, t, o), o;
};
class ft {
  materials = /* @__PURE__ */ new Map();
  textures = /* @__PURE__ */ new Map();
  textureLoader;
  constructor() {
    this.textureLoader = new w.TextureLoader();
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
      const r = e.material === "GLASS", o = new w.MeshToonMaterial({
        color: e.color || "#ffffff",
        opacity: r ? 0.45 : e.opacity || 1,
        transparent: r ? !0 : e.transparent || !1,
        gradientMap: at(r ? 2 : 4)
      });
      return e.mapTextureUrl && (o.map = this.loadTexture(e.mapTextureUrl)), e.normalTextureUrl && (o.normalMap = this.loadTexture(e.normalTextureUrl)), o;
    }
    return e.material === "GLASS" ? new w.MeshPhysicalMaterial({
      ...t,
      transmission: 0.98,
      roughness: 0.1,
      envMapIntensity: 1
    }) : (e.mapTextureUrl && (t.map = this.loadTexture(e.mapTextureUrl)), e.normalTextureUrl && (t.normalMap = this.loadTexture(e.normalTextureUrl)), new w.MeshStandardMaterial(t));
  }
  // 텍스처는 메모리를 많이 사용할 수 있음
  loadTexture(e) {
    const t = this.textures.get(e);
    if (t) return t;
    const r = this.textureLoader.load(e);
    return r.wrapS = w.RepeatWrapping, r.wrapT = w.RepeatWrapping, r.needsUpdate = !0, this.textures.set(e, r), r;
  }
  updateMaterial(e, t) {
    const r = this.materials.get(e);
    r && (r instanceof w.MeshStandardMaterial ? (t.color && r.color.set(t.color), t.roughness !== void 0 && (r.roughness = t.roughness), t.metalness !== void 0 && (r.metalness = t.metalness), t.opacity !== void 0 && (r.opacity = t.opacity), r.needsUpdate = !0) : r instanceof w.MeshToonMaterial && (t.color && r.color.set(t.color), t.opacity !== void 0 && (r.opacity = t.opacity), r.needsUpdate = !0));
  }
  dispose() {
    this.materials.forEach((e) => e.dispose()), this.materials.clear(), this.textures.forEach((e) => e.dispose()), this.textures.clear();
  }
}
Zt([
  Vt(),
  Pr()
], ft.prototype, "getMaterial");
Zt([
  Vt(),
  Pr()
], ft.prototype, "createMaterial");
Zt([
  Vt(),
  Vi(20)
], ft.prototype, "loadTexture");
Zt([
  Vt(),
  Pr()
], ft.prototype, "updateMaterial");
Zt([
  Vt()
], ft.prototype, "dispose");
const gn = Nr();
let lr = null, cr = null;
function Bi(n) {
  return n ? (lr || (lr = lt({ vertexColors: !0, steps: 4 })), lr) : (cr || (cr = new w.MeshStandardMaterial({ vertexColors: !0, roughness: 1, metalness: 0.02 })), cr);
}
function tt(n) {
  const e = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return e - Math.floor(e);
}
function yn(n, e, t) {
  const r = Math.max(t, 1), o = gn(n / (r * 0.8), e / (r * 0.8)) * 0.07, i = gn(n / (r * 0.32) + 8.3, e / (r * 0.42) - 5.4) * 0.025, a = Math.sin(n * 1.35 + e * 0.42) * 0.01, s = Math.exp(-(((n + r * 0.18) * (n + r * 0.18) + (e - r * 0.08) * (e - r * 0.08)) / Math.max(r * r * 0.55, 1))) * 0.09, u = Math.exp(-(((n - r * 0.24) * (n - r * 0.24) + (e + r * 0.16) * (e + r * 0.16)) / Math.max(r * r * 0.7, 1))) * 0.05;
  return 0.025 + o + i + a + s + u;
}
function qu(n) {
  let e = 0, t = 0, r = 0;
  const o = [], i = [];
  for (const p of n) {
    const S = Math.max(20, Math.round(p.size * 6));
    o.push(S), e += (S + 1) * (S + 1), t += S * S * 6;
    const v = Math.max(90, Math.min(240, Math.round(p.size * p.size * 10)));
    i.push(v), r += v;
  }
  const a = new Float32Array(e * 3), s = new Float32Array(e * 3), u = new Uint32Array(t);
  let c = 0, f = 0;
  for (let p = 0; p < n.length; p++) {
    const S = n[p], v = o[p];
    if (!S || v === void 0) continue;
    const M = S.size, T = S.position[0], C = S.position[1] + 0.04, P = S.position[2];
    for (let k = 0; k <= v; k++)
      for (let R = 0; R <= v; R++) {
        const B = c + k * (v + 1) + R, E = (R / v - 0.5) * M, _ = (k / v - 0.5) * M, z = yn(E, _, M), W = 0.5 + 0.5 * gn(E * 0.22 + 5.1, _ * 0.22 - 3.6), H = B * 3;
        a[H] = E + T, a[H + 1] = z + C, a[H + 2] = _ + P, s[H] = 0.72 + W * 0.09, s[H + 1] = 0.61 + W * 0.07, s[H + 2] = 0.4 + W * 0.05;
      }
    for (let k = 0; k < v; k++)
      for (let R = 0; R < v; R++) {
        const B = c + k * (v + 1) + R, E = B + 1, _ = B + (v + 1), z = _ + 1;
        u[f++] = B, u[f++] = _, u[f++] = E, u[f++] = E, u[f++] = _, u[f++] = z;
      }
    c += (v + 1) * (v + 1);
  }
  const d = new w.BufferGeometry();
  d.setAttribute("position", new w.Float32BufferAttribute(a, 3)), d.setAttribute("color", new w.Float32BufferAttribute(s, 3)), d.setIndex(new w.BufferAttribute(u, 1)), d.computeVertexNormals(), d.computeBoundingSphere();
  const m = new Float32Array(r * 3), h = new Float32Array(r * 3);
  let b = 0;
  for (let p = 0; p < n.length; p++) {
    const S = n[p], v = i[p];
    if (!S || v === void 0) continue;
    const M = S.size, T = S.position[0], C = S.position[1] + 0.04, P = S.position[2];
    for (let k = 0; k < v; k++) {
      const R = (b + k) * 3, B = tt(k * 3.13 + 0.2) * M - M * 0.5, E = tt(k * 4.71 + 1.4) * M - M * 0.5, _ = tt(k * 5.93 + 2.8), z = tt(k * 2.37 + 0.9), W = yn(B, E, M) + 0.01 + _ * 0.015;
      m[R] = B + T, m[R + 1] = W + C, m[R + 2] = E + P, h[R] = 0.76 + z * 0.08, h[R + 1] = 0.68 + z * 0.05, h[R + 2] = 0.48 + z * 0.04;
    }
    b += v;
  }
  const y = new w.BufferGeometry();
  y.setAttribute("position", new w.Float32BufferAttribute(m, 3)), y.setAttribute("color", new w.Float32BufferAttribute(h, 3)), y.computeBoundingSphere();
  const g = n.length > 0 ? n.reduce((p, S) => p + S.size, 0) / n.length : 4;
  return [d, y, g];
}
function Yu({ entries: n, toon: e }) {
  const [t, r, o] = F(
    () => qu(n),
    [n]
  ), i = e ?? Te(), a = Bi(i);
  return L(() => () => {
    t.dispose(), r.dispose();
  }, [t, r]), n.length === 0 ? null : /* @__PURE__ */ x(Se, { children: [
    /* @__PURE__ */ l("mesh", { geometry: t, material: a, castShadow: !0, receiveShadow: !0 }),
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
function nm({ size: n = 4, toon: e }) {
  const t = e ?? Te(), r = Bi(t), [o, i] = F(() => {
    const a = Math.max(20, Math.round(n * 6)), s = new w.PlaneGeometry(n, n, a, a);
    s.rotateX(-Math.PI / 2);
    const u = s.getAttribute("position"), c = new Float32Array(u.count * 3), f = new w.Color();
    for (let y = 0; y < u.count; y++) {
      const g = u.getX(y), p = u.getZ(y), S = yn(g, p, n), v = 0.5 + 0.5 * gn(g * 0.22 + 5.1, p * 0.22 - 3.6);
      u.setY(y, S), f.setRGB(0.72 + v * 0.09, 0.61 + v * 0.07, 0.4 + v * 0.05), c[y * 3] = f.r, c[y * 3 + 1] = f.g, c[y * 3 + 2] = f.b;
    }
    s.setAttribute("color", new w.Float32BufferAttribute(c, 3)), s.computeVertexNormals();
    const d = Math.max(90, Math.min(240, Math.round(n * n * 10))), m = new Float32Array(d * 3), h = new Float32Array(d * 3);
    for (let y = 0; y < d; y++) {
      const g = tt(y * 3.13 + 0.2) * n - n * 0.5, p = tt(y * 4.71 + 1.4) * n - n * 0.5, S = tt(y * 5.93 + 2.8), v = tt(y * 2.37 + 0.9), M = yn(g, p, n) + 0.01 + S * 0.015;
      m[y * 3] = g, m[y * 3 + 1] = M, m[y * 3 + 2] = p, f.setRGB(0.76 + v * 0.08, 0.68 + v * 0.05, 0.48 + v * 0.04), h[y * 3] = f.r, h[y * 3 + 1] = f.g, h[y * 3 + 2] = f.b;
    }
    const b = new w.BufferGeometry();
    return b.setAttribute("position", new w.Float32BufferAttribute(m, 3)), b.setAttribute("color", new w.Float32BufferAttribute(h, 3)), [s, b];
  }, [n]);
  return L(() => () => {
    o.dispose(), i.dispose();
  }, [i, o]), /* @__PURE__ */ x("group", { position: [0, 0.04, 0], children: [
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
const bn = Nr();
let ur = null, dr = null;
function Di(n) {
  return n ? (ur || (ur = lt({
    vertexColors: !0,
    steps: 4,
    emissive: "#9ec1e8",
    emissiveIntensity: 0.06
  })), ur) : (dr || (dr = new w.MeshPhysicalMaterial({
    vertexColors: !0,
    roughness: 0.88,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.75
  })), dr);
}
function nt(n) {
  const e = Math.sin(n * 91.7 + 173.3) * 43758.5453123;
  return e - Math.floor(e);
}
function vn(n, e, t) {
  const r = Math.max(t, 1), o = Math.exp(-(((n + r * 0.2) * (n + r * 0.2) + (e - r * 0.14) * (e - r * 0.14)) / Math.max(r * r * 0.48, 1))) * 0.12, i = Math.exp(-(((n - r * 0.18) * (n - r * 0.18) + (e + r * 0.12) * (e + r * 0.12)) / Math.max(r * r * 0.65, 1))) * 0.08, a = bn(n / (r * 0.7), e / (r * 0.7)) * 0.06, s = bn(n / (r * 0.24) + 6.1, e / (r * 0.24) - 3.7) * 0.018;
  return 0.05 + o + i + a + s;
}
function Zu(n) {
  let e = 0, t = 0, r = 0;
  const o = [], i = [];
  for (const p of n) {
    const S = Math.max(22, Math.round(p.size * 7));
    o.push(S), e += (S + 1) * (S + 1), t += S * S * 6;
    const v = Math.max(28, Math.min(96, Math.round(p.size * p.size * 3)));
    i.push(v), r += v;
  }
  const a = new Float32Array(e * 3), s = new Float32Array(e * 3), u = new Uint32Array(t);
  let c = 0, f = 0;
  for (let p = 0; p < n.length; p++) {
    const S = n[p], v = o[p];
    if (!S || v === void 0) continue;
    const M = S.size, T = S.position[0], C = S.position[1] + 0.045, P = S.position[2];
    for (let k = 0; k <= v; k++)
      for (let R = 0; R <= v; R++) {
        const B = c + k * (v + 1) + R, E = (R / v - 0.5) * M, _ = (k / v - 0.5) * M, z = vn(E, _, M), W = 0.5 + 0.5 * bn(E * 0.16 - 2.4, _ * 0.16 + 7.2), H = B * 3;
        a[H] = E + T, a[H + 1] = z + C, a[H + 2] = _ + P, s[H] = 0.87 + W * 0.06, s[H + 1] = 0.9 + W * 0.05, s[H + 2] = 0.94 + W * 0.04;
      }
    for (let k = 0; k < v; k++)
      for (let R = 0; R < v; R++) {
        const B = c + k * (v + 1) + R, E = B + 1, _ = B + (v + 1), z = _ + 1;
        u[f++] = B, u[f++] = _, u[f++] = E, u[f++] = E, u[f++] = _, u[f++] = z;
      }
    c += (v + 1) * (v + 1);
  }
  const d = new w.BufferGeometry();
  d.setAttribute("position", new w.Float32BufferAttribute(a, 3)), d.setAttribute("color", new w.Float32BufferAttribute(s, 3)), d.setIndex(new w.BufferAttribute(u, 1)), d.computeVertexNormals(), d.computeBoundingSphere();
  const m = new Float32Array(r * 3), h = new Float32Array(r * 3);
  let b = 0;
  for (let p = 0; p < n.length; p++) {
    const S = n[p], v = i[p];
    if (!S || v === void 0) continue;
    const M = S.size, T = S.position[0], C = S.position[1] + 0.045, P = S.position[2];
    for (let k = 0; k < v; k++) {
      const R = (b + k) * 3, B = nt(k * 2.71 + 0.4) * M - M * 0.5, E = nt(k * 3.97 + 1.9) * M - M * 0.5, _ = nt(k * 5.41 + 2.2), z = nt(k * 7.13 + 3.1), W = vn(B, E, M) + 0.016 + _ * 0.02;
      m[R] = B + T, m[R + 1] = W + C, m[R + 2] = E + P, h[R] = 0.9 + z * 0.08, h[R + 1] = 0.94 + z * 0.05, h[R + 2] = 1;
    }
    b += v;
  }
  const y = new w.BufferGeometry();
  y.setAttribute("position", new w.Float32BufferAttribute(m, 3)), y.setAttribute("color", new w.Float32BufferAttribute(h, 3)), y.computeBoundingSphere();
  const g = n.length > 0 ? n.reduce((p, S) => p + S.size, 0) / n.length : 4;
  return [d, y, g];
}
function Xu({ entries: n, toon: e }) {
  const [t, r, o] = F(
    () => Zu(n),
    [n]
  ), i = e ?? Te(), a = Di(i);
  return L(() => () => {
    t.dispose(), r.dispose();
  }, [t, r]), n.length === 0 ? null : /* @__PURE__ */ x(Se, { children: [
    /* @__PURE__ */ l("mesh", { geometry: t, material: a, castShadow: !0, receiveShadow: !0 }),
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
function rm({ size: n = 4, toon: e }) {
  const t = e ?? Te(), r = Di(t), [o, i] = F(() => {
    const a = Math.max(22, Math.round(n * 7)), s = new w.PlaneGeometry(n, n, a, a);
    s.rotateX(-Math.PI / 2);
    const u = s.getAttribute("position"), c = new Float32Array(u.count * 3), f = new w.Color();
    for (let y = 0; y < u.count; y++) {
      const g = u.getX(y), p = u.getZ(y), S = vn(g, p, n), v = 0.5 + 0.5 * bn(g * 0.16 - 2.4, p * 0.16 + 7.2);
      u.setY(y, S), f.setRGB(0.87 + v * 0.06, 0.9 + v * 0.05, 0.94 + v * 0.04), c[y * 3] = f.r, c[y * 3 + 1] = f.g, c[y * 3 + 2] = f.b;
    }
    s.setAttribute("color", new w.Float32BufferAttribute(c, 3)), s.computeVertexNormals();
    const d = Math.max(28, Math.min(96, Math.round(n * n * 3))), m = new Float32Array(d * 3), h = new Float32Array(d * 3);
    for (let y = 0; y < d; y++) {
      const g = nt(y * 2.71 + 0.4) * n - n * 0.5, p = nt(y * 3.97 + 1.9) * n - n * 0.5, S = nt(y * 5.41 + 2.2), v = nt(y * 7.13 + 3.1), M = vn(g, p, n) + 0.016 + S * 0.02;
      m[y * 3] = g, m[y * 3 + 1] = M, m[y * 3 + 2] = p, f.setRGB(0.9 + v * 0.08, 0.94 + v * 0.05, 1), h[y * 3] = f.r, h[y * 3 + 1] = f.g, h[y * 3 + 2] = f.b;
    }
    const b = new w.BufferGeometry();
    return b.setAttribute("position", new w.Float32BufferAttribute(m, 3)), b.setAttribute("color", new w.Float32BufferAttribute(h, 3)), [s, b];
  }, [n]);
  return L(() => () => {
    o.dispose(), i.dispose();
  }, [i, o]), /* @__PURE__ */ x("group", { position: [0, 0.045, 0], children: [
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
const Ku = "/resources/blade_alpha.jpg", Ju = "/resources/blade_diffuse.jpg";
var Qu = `precision highp float;\r
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
let Fi = null;
function ed(n) {
  Fi = n;
}
class td {
  nextId = 1;
  tiles = /* @__PURE__ */ new Map();
  // Reusable scratch buffers — never grow beyond the largest registered batch.
  positions = new Float32Array(0);
  weights = new Float32Array(0);
  trampleWorld = new w.Vector3(0, -9999, 0);
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
    const a = [];
    for (const u of this.tiles.values()) {
      const c = i * 3;
      this.positions[c] = u.center.x, this.positions[c + 1] = u.center.y, this.positions[c + 2] = u.center.z, a.push(u.id), i += 1;
    }
    this.computeWeights(a.length, e.cameraPosition);
    let s = 0;
    for (const u of a) {
      const c = this.tiles.get(u);
      if (!c) {
        s += 1;
        continue;
      }
      const f = this.weights[s] ?? 0;
      s += 1;
      const d = Math.hypot(c.width, c.height) * 0.6, m = nd.set(c.center, d), h = e.frustum.intersectsSphere(m), b = Math.max(0, Math.floor(c.maxInstances * f)), y = h && b > 0;
      c.apply({
        visible: y,
        instanceCount: y ? b : 0,
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
    const r = Fi, o = 24, i = 160, a = 4;
    if (r)
      try {
        const s = r.alloc_f32(e * 3), u = r.alloc_f32(e);
        try {
          new Float32Array(r.memory.buffer, s, e * 3).set(this.positions.subarray(0, e * 3)), r.batch_sfe_weights(e, s, t.x, t.y, t.z, o, i, a, u), this.weights.set(new Float32Array(r.memory.buffer, u, e));
        } finally {
          r.dealloc_f32(s, e * 3), r.dealloc_f32(u, e);
        }
        return;
      } catch {
      }
    for (let s = 0; s < e; s += 1) {
      const u = s * 3, c = (this.positions[u] ?? 0) - t.x, f = (this.positions[u + 1] ?? 0) - t.y, d = (this.positions[u + 2] ?? 0) - t.z, m = Math.sqrt(c * c + f * f + d * d);
      this.weights[s] = rd(m, o, i, a);
    }
  }
  refreshTrample(e) {
    const t = Uo.getOrCreate("motion"), r = t?.getActiveEntities() ?? [], o = r[0] ? t?.snapshot(r[0]) : null, i = w.MathUtils.clamp(e * 6, 0, 1);
    o && (this.trampleWorld.x += (o.position.x - this.trampleWorld.x) * i, this.trampleWorld.y = o.position.y, this.trampleWorld.z += (o.position.z - this.trampleWorld.z) * i);
    const a = o?.isMoving && o?.isGrounded ? 0.85 : 0.35;
    this.trampleStrength += (a - this.trampleStrength) * i;
  }
  computeWindScale() {
    const e = De.getState().current, t = e?.intensity ?? 0;
    return (e?.kind === "storm" ? 2.6 : e?.kind === "rain" ? 1.7 : e?.kind === "snow" ? 1.3 : e?.kind === "cloudy" ? 1.15 : 0.85) + t * 0.9;
  }
}
const nd = new w.Sphere();
function rd(n, e, t, r) {
  if (n <= e) return 1;
  if (n >= t) return 0;
  const o = (n - e) / (t - e);
  return Math.pow(1 - o, Math.max(1, r));
}
let fr = null;
function xn() {
  return fr || (fr = new td()), fr;
}
var od = `precision highp float;\r
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
let pr = null, mr = null;
function id(n) {
  return n ? (pr || (pr = lt({
    color: "#ffffff",
    vertexColors: !0,
    steps: 3
  })), pr) : (mr || (mr = new w.MeshStandardMaterial({
    color: "#ffffff",
    vertexColors: !0,
    roughness: 0.95,
    metalness: 0
  })), mr);
}
const Ot = Nr(), sd = new w.Color("#2a4220"), ad = new w.Color("#5a7a35"), ld = new w.Color("#7a8e3a"), cd = new w.Color("#5b4628"), ud = zr(
  {
    bladeHeight: 1,
    map: null,
    alphaMap: null,
    time: 0,
    windScale: 1,
    trampleCenter: new w.Vector3(0, -9999, 0),
    trampleRadius: 1.4,
    trampleStrength: 0.85,
    tipColor: new w.Color("#8fbc5a").convertSRGBToLinear(),
    bottomColor: new w.Color("#355b2d").convertSRGBToLinear(),
    uToon: 0,
    uToonSteps: 4
  },
  od,
  Qu
);
Sn({ GrassMaterial: ud });
function Vr(n, e) {
  return 0.05 * Ot(n / 50, e / 50) + 0.05 * Ot(n / 100, e / 100);
}
function dd(n, e, t) {
  const r = e * 3, o = e * 4, i = n.alloc_f32(r), a = n.alloc_f32(o), s = n.alloc_f32(e), u = n.alloc_f32(e), c = n.alloc_f32(e);
  try {
    const f = Math.random() * 4294967295 >>> 0;
    n.fill_grass_data(e, t, f, i, a, s, u, c);
    const d = n.memory.buffer;
    return {
      offsets: new Float32Array(d, i, r).slice(),
      orientations: new Float32Array(d, a, o).slice(),
      stretches: new Float32Array(d, s, e).slice(),
      halfRootAngleSin: new Float32Array(d, u, e).slice(),
      halfRootAngleCos: new Float32Array(d, c, e).slice()
    };
  } finally {
    n.dealloc_f32(i, r), n.dealloc_f32(a, o), n.dealloc_f32(s, e), n.dealloc_f32(u, e), n.dealloc_f32(c, e);
  }
}
function fd(n, e) {
  const t = new Float32Array(n * 3), r = new Float32Array(n * 4), o = new Float32Array(n), i = new Float32Array(n), a = new Float32Array(n), s = new w.Quaternion(), u = new w.Quaternion(), c = new w.Vector3(1, 0, 0), f = new w.Vector3(0, 0, 1), d = Math.ceil(Math.sqrt(n)), m = e / d, h = m * 0.9;
  let b = 0, y = 0;
  for (let g = 0; g < n; g++) {
    const p = g % d, S = g / d | 0, v = (Math.random() - 0.5) * h, M = (Math.random() - 0.5) * h, T = (p + 0.5) * m - e / 2 + v, C = (S + 0.5) * m - e / 2 + M;
    t[b] = T, t[b + 1] = Vr(T, C), t[b + 2] = C, b += 3;
    const P = Math.PI - Math.random() * (Math.PI / 6);
    i[g] = Math.sin(0.5 * P), a[g] = Math.cos(0.5 * P), s.setFromAxisAngle(f, P), u.setFromAxisAngle(c, Math.random() * Math.PI / 8), s.multiply(u), r[y] = s.x, r[y + 1] = s.y, r[y + 2] = s.z, r[y + 3] = s.w, y += 4, o[g] = 0.7 + Math.random() * 0.45;
  }
  return { offsets: t, orientations: r, stretches: o, halfRootAngleCos: a, halfRootAngleSin: i };
}
function pd(n, e, t) {
  const r = Math.ceil(Math.sqrt(e)), i = t / r * 0.9, a = n.offsets, s = n.stretches;
  for (let u = 0; u < e; u++) {
    const c = u * 3, f = (a[c] ?? 0) + (Math.random() - 0.5) * i, d = (a[c + 2] ?? 0) + (Math.random() - 0.5) * i;
    a[c] = f, a[c + 2] = d, a[c + 1] = Vr(f, d), s[u] = 0.7 + Math.random() * 0.55;
  }
}
const Li = ns(
  ({
    options: n = { bW: 0.14, bH: 0.65, joints: 5 },
    width: e = 4,
    instances: t,
    density: r,
    maxInstances: o = 18e3,
    toon: i,
    lod: a,
    center: s,
    ...u
  }) => {
    const { bW: c, bH: f, joints: d } = n, m = jl((_) => _.profile.instanceScale), h = F(() => {
      const _ = Math.max(64, Math.min(o, Math.round(o * m)));
      if (typeof t == "number" && t > 0)
        return Math.max(1, Math.min(_, Math.floor(t * m)));
      const z = typeof r == "number" && r > 0 ? r : 90, W = Math.max(1, e * e);
      return Math.max(64, Math.min(_, Math.round(z * W * m)));
    }, [t, r, e, o, m]), b = i ?? Te(), y = id(b), g = N(null), p = N(null), S = N(h), v = N(null), M = N(null), [T, C] = os(w.TextureLoader, [
      Ju,
      Ku
    ]), [P, k] = Y(null);
    L(() => {
      Ei().then((_) => {
        _ && (k(_), ed(_));
      });
    }, []);
    const R = F(
      () => {
        const _ = P ? dd(P, h, e) : fd(h, e);
        return pd(_, h, e), _;
      },
      [h, e, P]
    ), [B, E] = F(() => {
      const _ = new w.PlaneGeometry(c, f, 1, d).translate(0, f / 2, 0), z = Math.max(8, Math.min(128, Math.round(e * 1.5))), W = new w.PlaneGeometry(e, e, z, z), H = W.getAttribute("position"), j = new Float32Array(H.count * 3), A = new w.Color();
      for (let G = 0; G < H.count; G++) {
        const $ = H.getX(G), X = H.getZ(G);
        H.setY(G, Vr($, X));
        const Z = 0.5 + 0.5 * Ot($ * 0.18, X * 0.18), O = 0.5 + 0.5 * Ot($ * 0.04 + 11.3, X * 0.04 - 7.7), Q = 0.5 + 0.5 * Ot($ * 0.55 - 3.1, X * 0.55 + 9.4), J = w.MathUtils.clamp(Z * 0.65 + O * 0.45, 0, 1);
        A.copy(sd).lerp(ad, J).lerp(ld, O * 0.22), Q > 0.86 && A.lerp(cd, (Q - 0.86) * 4);
        const te = G * 3;
        j[te] = A.r, j[te + 1] = A.g, j[te + 2] = A.b;
      }
      return W.setAttribute("color", new w.BufferAttribute(j, 3)), W.computeVertexNormals(), [_, W];
    }, [c, f, d, e]);
    return L(() => () => {
      B.dispose(), E.dispose();
    }, [B, E]), L(() => {
      const _ = M.current;
      _ && (_.instanceCount = h, S.current = h);
    }, [h, R]), L(() => {
      const _ = v.current;
      _?.uniforms && (_.uniforms.uToon && (_.uniforms.uToon.value = b ? 1 : 0), _.uniforms.uToonSteps && (_.uniforms.uToonSteps.value = 4));
    }, [b]), L(() => {
      const _ = g.current, z = new w.Vector3();
      s ? z.set(s[0], s[1], s[2]) : _ && (_.updateWorldMatrix(!0, !1), _.getWorldPosition(z));
      const W = (j) => {
        const A = p.current, G = M.current, $ = v.current?.uniforms;
        !A || !G || !$ || (A.visible !== j.visible && (A.visible = j.visible), G.instanceCount !== j.instanceCount && (G.instanceCount = j.instanceCount, S.current = j.instanceCount), $.time && ($.time.value = j.time), $.windScale && ($.windScale.value = j.windScale), $.trampleCenter && $.trampleCenter.value.copy(j.trampleCenter), $.trampleStrength && ($.trampleStrength.value = j.trampleStrength));
      }, H = xn().register({
        width: e,
        height: f * 1.4,
        center: z,
        maxInstances: h,
        ...a ? { lod: a } : {},
        apply: W
      });
      return () => {
        xn().unregister(H.id);
      };
    }, [e, f, h, s?.[0], s?.[1], s?.[2], a?.near, a?.far, a?.strength]), L(() => {
      const _ = M.current;
      if (!_) return;
      const z = Math.hypot(e, f * 1.4) * 0.6;
      _.boundingSphere = new w.Sphere(new w.Vector3(0, f * 0.5, 0), z), _.boundingBox = new w.Box3(
        new w.Vector3(-e * 0.5, 0, -e * 0.5),
        new w.Vector3(e * 0.5, f * 1.6, e * 0.5)
      );
    }, [e, f]), /* @__PURE__ */ x("group", { ref: g, ...u, children: [
      /* @__PURE__ */ x("mesh", { ref: p, frustumCulled: !0, children: [
        /* @__PURE__ */ x(
          "instancedBufferGeometry",
          {
            ref: M,
            index: B.index,
            "attributes-position": B.getAttribute("position"),
            "attributes-uv": B.getAttribute("uv"),
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
            ref: v,
            map: T ?? null,
            alphaMap: C ?? null,
            toneMapped: !1,
            side: w.DoubleSide,
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
          children: /* @__PURE__ */ l("primitive", { object: E, attach: "geometry" })
        }
      )
    ] });
  }
);
Li.displayName = "Grass";
Sn({ Water: us });
const md = (
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
), hd = (
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
function gd({ lod: n, center: e, size: t = 16, shore: r, toon: o }) {
  const i = o ?? Te(), a = N(null), s = N(null), u = N(null), c = Er("/resources/waternormals.jpeg"), f = N(new w.Vector3()), d = N(!0), m = N(0), h = F(
    () => new w.MeshPhysicalMaterial({
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
  ), b = F(
    () => ({
      north: r?.north ?? !0,
      south: r?.south ?? !0,
      east: r?.east ?? !0,
      west: r?.west ?? !0
    }),
    [r?.east, r?.north, r?.south, r?.west]
  ), y = Math.min(t * 0.18, 0.72), g = b.north ? y : 0, p = b.south ? y : 0, S = b.east ? y : 0, v = b.west ? y : 0, M = Math.max(t - v - S, t * 0.34), T = Math.max(t - g - p, t * 0.34), C = (v - S) * 0.5, P = (g - p) * 0.5, k = Math.max(
    t - (b.west ? y * 0.25 : 0) - (b.east ? y * 0.25 : 0),
    t * 0.42
  ), R = Math.max(
    t - (b.north ? y * 0.25 : 0) - (b.south ? y * 0.25 : 0),
    t * 0.42
  ), B = F(() => Math.max(2, Math.round(t / 4)), [t]);
  L(() => {
    c && (c.wrapS = c.wrapT = w.RepeatWrapping, c.repeat.set(B, B), c.needsUpdate = !0);
  }, [c, B]), L(() => {
    e && f.current.set(e[0], e[1], e[2]);
  }, [e]);
  const E = F(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: c,
      sunDirection: new w.Vector3(0.1, 0.7, 0.2),
      sunColor: 16777215,
      waterColor: 7695,
      distortionScale: 3.7
    }),
    [c]
  ), _ = F(() => {
    const H = Math.max(M, T), j = Math.round(i ? H * 4 : H * 1.2);
    return Math.max(i ? 16 : 6, Math.min(i ? 96 : 32, j));
  }, [i, M, T]), z = F(
    () => new w.PlaneGeometry(M, T, _, _),
    [T, M, _]
  ), W = F(() => i ? new w.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uShallow: { value: new w.Color("#9ed6c8") },
      uDeep: { value: new w.Color("#1f5f88") },
      uFoam: { value: new w.Color("#ffffff") }
    },
    vertexShader: md,
    fragmentShader: hd,
    transparent: !0,
    depthWrite: !1
  }) : null, [i]);
  return L(() => () => {
    z.dispose();
    const H = a.current;
    H?.material?.dispose?.(), typeof H?.dispose == "function" && H.dispose(), W?.dispose();
  }, [z, W]), L(() => () => {
    h.dispose();
  }, [h]), de((H, j) => {
    const A = i ? u.current : a.current;
    if (A) {
      if (n) {
        m.current += Math.max(0, j);
        const G = d.current ? 0.2 : 0.5;
        if (m.current >= G) {
          m.current = 0;
          const $ = n.near ?? 30, X = n.far ?? 180, Z = n.strength ?? 4, O = H.camera.position.distanceTo(f.current), J = xt(O, $, X, Z) > 0;
          J !== d.current && (d.current = J, A.visible = J);
        }
        if (!d.current) return;
      }
      if (i) {
        const G = s.current?.uniforms?.uTime;
        G && (G.value = H.clock.elapsedTime);
      } else {
        const G = a.current?.material.uniforms?.time;
        G && (G.value += j * 0.3);
      }
    }
  }), /* @__PURE__ */ x("group", { children: [
    b.north && /* @__PURE__ */ l(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [0, 0.055, -t / 2 + y / 2],
        material: h,
        receiveShadow: !0,
        children: /* @__PURE__ */ l("planeGeometry", { args: [k, y, 1, 1] })
      }
    ),
    b.south && /* @__PURE__ */ l(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [0, 0.055, t / 2 - y / 2],
        material: h,
        receiveShadow: !0,
        children: /* @__PURE__ */ l("planeGeometry", { args: [k, y, 1, 1] })
      }
    ),
    b.west && /* @__PURE__ */ l(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [-t / 2 + y / 2, 0.055, 0],
        material: h,
        receiveShadow: !0,
        children: /* @__PURE__ */ l("planeGeometry", { args: [y, R, 1, 1] })
      }
    ),
    b.east && /* @__PURE__ */ l(
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
        geometry: z,
        "rotation-x": -Math.PI / 2,
        position: [C, 0.1, P],
        children: /* @__PURE__ */ l(
          "primitive",
          {
            ref: s,
            object: W,
            attach: "material"
          }
        )
      }
    ) : /* @__PURE__ */ l(
      "water",
      {
        ref: a,
        args: [z, E],
        "rotation-x": -Math.PI / 2,
        position: [C, 0.1, P]
      }
    )
  ] });
}
const yd = 25, bd = 90, vd = 4, Gi = {
  north: !0,
  south: !0,
  east: !0,
  west: !0
};
function xd(n, e, t) {
  const o = ue.GRID_CELL_SIZE * (n.size || 1) / 2;
  return e > n.position.x - o + 1e-3 && e < n.position.x + o - 1e-3 && t > n.position.z - o + 1e-3 && t < n.position.z + o - 1e-3;
}
function wd(n, e) {
  const t = ue.GRID_CELL_SIZE * (n.size || 1), r = t / 2, o = Math.max(0.08, t * 0.06), i = Math.max(0.12, ue.HEIGHT_STEP * 0.25), a = e ?? [];
  if (a.length === 0) return Gi;
  const s = (u, c) => {
    for (const f of a)
      if (f.id !== n.id && !(Math.abs(f.position.y - n.position.y) > i) && xd(f, u, c))
        return !0;
    return !1;
  };
  return {
    north: !s(n.position.x, n.position.z - r - o),
    south: !s(n.position.x, n.position.z + r + o),
    west: !s(n.position.x - r - o, n.position.z),
    east: !s(n.position.x + r + o, n.position.z)
  };
}
const Sd = /* @__PURE__ */ new Set(["sand", "snowfield"]);
function Md({ tile: n, tiles: e }) {
  if (!n.objectType || n.objectType === "none" || Sd.has(n.objectType)) return null;
  const t = N(null), r = N(!0), o = N(0), i = ue.GRID_CELL_SIZE * (n.size || 1), a = [n.position.x, n.position.y, n.position.z], s = F(
    () => n.objectType === "water" ? wd(n, e) : Gi,
    [n, e]
  );
  return de((u, c) => {
    o.current += c;
    const f = r.current ? 0.3 : 0.8;
    if (o.current < f) return;
    o.current = 0;
    const d = u.camera.position, m = n.position, h = d.x - m.x, b = d.y - m.y, y = d.z - m.z, g = Math.sqrt(h * h + b * b + y * y), S = xt(g, yd, bd, vd) > 0;
    S !== r.current && (r.current = S, t.current && (t.current.visible = S));
  }), /* @__PURE__ */ l("group", { ref: t, position: a, children: /* @__PURE__ */ x(Je, { fallback: null, children: [
    n.objectType === "water" && /* @__PURE__ */ l(gd, { size: i, shore: s, center: a }),
    n.objectType === "grass" && /* @__PURE__ */ l(
      Li,
      {
        width: i,
        density: n.objectConfig?.grassDensity ?? 90,
        position: [0, 0.05, 0]
      }
    )
  ] }) });
}
function Cd(n) {
  return n - Math.floor(n);
}
function it(...n) {
  const e = n.reduce((t, r, o) => t + r * (o * 19.19 + 7.13), 0);
  return Cd(Math.sin(e) * 43758.5453123);
}
function zt(n) {
  return n.shape ?? "box";
}
function Tr(n, e, t) {
  const r = Math.cos(t), o = Math.sin(t);
  return [n * r + e * o, e * r - n * o];
}
function qr(n) {
  const e = (n.size || 1) * ue.GRID_CELL_SIZE, t = Math.max(4, Math.min(8, (n.size || 1) * 4)), r = Math.max(n.position.y, ue.HEIGHT_STEP), o = r / t, i = e / t, a = Math.max(t * 4, Math.ceil(r / 0.08)), s = n.rotation ?? 0;
  return { tileSize: e, stepCount: t, totalHeight: r, stepHeight: o, stepDepth: i, colliderSlices: a, rotation: s };
}
function Bo(n) {
  const e = (n.size || 1) * ue.GRID_CELL_SIZE, t = Math.max(12, Math.min(24, Math.ceil(e / 0.25))), r = Math.max(n.position.y, ue.HEIGHT_STEP), o = r / t, i = e / t, a = n.rotation ?? 0;
  return { tileSize: e, rampSlices: t, totalHeight: r, sliceHeight: o, sliceDepth: i, rotation: a };
}
function _r(n) {
  const t = (n.size || 1) * ue.GRID_CELL_SIZE / 2;
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
function Oi(n, e, t, r) {
  let o = 0;
  for (const i of n)
    i.id !== e && t > i.minX + 1e-3 && t < i.maxX - 1e-3 && r > i.minZ + 1e-3 && r < i.maxZ - 1e-3 && (o = Math.max(o, i.topY));
  return o;
}
function kd(n, e, t, r, o, i, a, s) {
  const u = (c, f) => {
    n.push(c[0], c[1], c[2]), e.push(f.r, f.g, f.b);
  };
  u(t, a), u(r, a), u(o, s), u(t, a), u(o, s), u(i, s);
}
function Bt(n, e, t, r, o) {
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
function Id(n, e, t) {
  const r = [], o = [], i = [], a = e.map(_r), s = n.map(_r), u = new w.Color("#7b6a58"), c = new w.Color("#433930"), f = ue.GRID_CELL_SIZE, d = (h, b, y, g, p, S, v, M, T, C) => {
    const P = Oi(a, h.id, S, v);
    if (h.topY <= P + 0.02) return;
    const k = h.topY - P, R = 0.72 + it(C, h.centerX, h.centerZ) * 0.16, B = 0.42 + it(C, h.topY) * 0.08, E = t.clone().lerp(u, 0.28 + Math.min(k, 2) * 0.08).multiplyScalar(R), _ = t.clone().lerp(c, 0.7).multiplyScalar(B);
    if (kd(
      r,
      o,
      [b, h.topY, y],
      [g, h.topY, p],
      [g, P, p],
      [b, P, y],
      E,
      _
    ), k < ue.HEIGHT_STEP * 0.95) return;
    const z = it(C, P, k);
    if (z < 0.58) return;
    const W = (b + g) * 0.5, H = (y + p) * 0.5, j = 0.12 + Math.min(k, 2.5) * 0.06, A = 0.08 + z * 0.08;
    i.push({
      position: [
        W + M * (0.18 + z * 0.24),
        P + j * 0.65,
        H + T * (0.18 + z * 0.24)
      ],
      rotation: [
        z * Math.PI * 1.7,
        z * Math.PI * 2.9,
        z * Math.PI * 0.9
      ],
      scale: [
        j + A * 0.6,
        j * 0.9 + A * 0.45,
        j + A
      ]
    });
  };
  for (const h of s) {
    if (h.topY <= 0.02) continue;
    const y = -(h.segments * f) / 2;
    for (let g = 0; g < h.segments; g++) {
      const p = y + g * f, S = p + f, v = p + f * 0.5;
      d(
        h,
        h.maxX,
        h.centerZ + p,
        h.maxX,
        h.centerZ + S,
        h.maxX + 0.02,
        h.centerZ + v,
        1,
        0,
        it(h.centerX, h.centerZ, g, 1)
      ), d(
        h,
        h.minX,
        h.centerZ + S,
        h.minX,
        h.centerZ + p,
        h.minX - 0.02,
        h.centerZ + v,
        -1,
        0,
        it(h.centerX, h.centerZ, g, 2)
      ), d(
        h,
        h.centerX + S,
        h.minZ,
        h.centerX + p,
        h.minZ,
        h.centerX + v,
        h.minZ - 0.02,
        0,
        -1,
        it(h.centerX, h.centerZ, g, 3)
      ), d(
        h,
        h.centerX + p,
        h.maxZ,
        h.centerX + S,
        h.maxZ,
        h.centerX + v,
        h.maxZ + 0.02,
        0,
        1,
        it(h.centerX, h.centerZ, g, 4)
      );
    }
  }
  const m = new w.BufferGeometry();
  return r.length > 0 && (m.setAttribute("position", new w.Float32BufferAttribute(r, 3)), m.setAttribute("color", new w.Float32BufferAttribute(o, 3)), m.computeVertexNormals(), m.computeBoundingBox(), m.computeBoundingSphere()), { sideGeometry: m, rocks: i };
}
function Ad(n, e) {
  const t = e.map(_r), { tileSize: r, totalHeight: o, rotation: i } = qr(n), [a, s] = Tr(0, r / 2 + 0.04, i);
  return Oi(t, n.id, n.position.x + a, n.position.z + s) + 0.02 < o;
}
function Td(n, e) {
  const t = new w.BufferGeometry(), r = [], { tileSize: o, stepCount: i, stepHeight: a, stepDepth: s, totalHeight: u } = qr(n), c = o / 2;
  for (let f = 0; f < i; f++) {
    const d = -c + f * s, m = d + s, h = a * (f + 1), b = a * f;
    Bt(
      r,
      [-c, h, d],
      [-c, h, m],
      [c, h, m],
      [c, h, d]
    ), Bt(
      r,
      [-c, b, d],
      [-c, h, d],
      [c, h, d],
      [c, b, d]
    ), Bt(
      r,
      [-c, 0, d],
      [-c, 0, m],
      [-c, h, m],
      [-c, h, d]
    ), Bt(
      r,
      [c, 0, m],
      [c, 0, d],
      [c, h, d],
      [c, h, m]
    );
  }
  return e && Bt(
    r,
    [-c, 0, c],
    [c, 0, c],
    [c, u, c],
    [-c, u, c]
  ), t.setAttribute("position", new w.Float32BufferAttribute(r, 3)), t.computeVertexNormals(), t.computeBoundingBox(), t.computeBoundingSphere(), t;
}
function _d({
  tile: n,
  material: e,
  supportTiles: t
}) {
  const r = n.rotation ?? 0, o = F(() => Ad(n, t), [t, n]), i = F(() => Td(n, o), [n, o]);
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
function Pd({
  tileGroup: n,
  meshes: e,
  isEditMode: t = !1,
  onTileClick: r
}) {
  const o = N(new ft()), i = N(null), a = N(null), s = n.tiles.length, [u, c] = Y(() => Math.max(1, s)), f = F(
    () => n.tiles.filter((A) => zt(A) === "box"),
    [n.tiles]
  ), d = F(
    () => n.tiles.filter((A) => zt(A) === "stairs"),
    [n.tiles]
  ), m = F(
    () => n.tiles.filter((A) => zt(A) === "ramp"),
    [n.tiles]
  ), h = F(
    () => n.tiles.filter((A) => zt(A) === "round"),
    [n.tiles]
  ), b = F(() => {
    const A = o.current, G = e.get(n.floorMeshId);
    if (!G) {
      a.current?.dispose();
      const $ = Te() ? new w.MeshToonMaterial({ color: "#888888", gradientMap: at(4) }) : new w.MeshStandardMaterial({ color: "#888888" });
      return a.current = $, $;
    }
    return a.current?.dispose(), a.current = null, A.getMaterial(G);
  }, [n.floorMeshId, e]), y = F(() => {
    const A = e.get(n.floorMeshId);
    return new w.Color(A?.color || "#8a806f");
  }, [n.floorMeshId, e]), g = F(
    () => Id(f, n.tiles, y),
    [f, n.tiles, y]
  ), p = F(
    () => Te() ? new w.MeshToonMaterial({
      vertexColors: !0,
      side: w.DoubleSide,
      gradientMap: at(4)
    }) : new w.MeshStandardMaterial({
      vertexColors: !0,
      roughness: 0.98,
      metalness: 0.02,
      side: w.DoubleSide
    }),
    []
  ), S = F(() => new w.DodecahedronGeometry(1, 0), []), v = F(() => {
    const A = new w.BufferGeometry(), G = new Float32Array([
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
    ]), $ = [
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
    return A.setAttribute("position", new w.BufferAttribute(G, 3)), A.setIndex($), A.computeVertexNormals(), A;
  }, []), M = F(
    () => Te() ? new w.MeshToonMaterial({
      color: "#71695f",
      gradientMap: at(3)
    }) : new w.MeshStandardMaterial({
      color: "#71695f",
      roughness: 1,
      metalness: 0.02
    }),
    []
  ), T = F(() => {
    const A = new w.PlaneGeometry(1, 1, 1, 1);
    return A.rotateX(-Math.PI / 2), A;
  }, []), C = F(() => new w.Object3D(), []), P = N(null), k = F(() => new w.BoxGeometry(1, 1, 1), []), R = F(
    () => Te() ? new w.MeshToonMaterial({
      color: "#ff0000",
      transparent: !0,
      opacity: 0.6,
      emissive: new w.Color("#ff0000"),
      emissiveIntensity: 0.2,
      gradientMap: at(3)
    }) : new w.MeshStandardMaterial({
      color: "#ff0000",
      transparent: !0,
      opacity: 0.6,
      emissive: new w.Color("#ff0000"),
      emissiveIntensity: 0.2
    }),
    []
  ), B = F(
    () => n.tiles.filter((A) => A.objectType === "sand"),
    [n.tiles]
  ), E = F(
    () => B.map((A) => ({
      position: [A.position.x, A.position.y, A.position.z],
      size: ue.GRID_CELL_SIZE * (A.size || 1)
    })),
    [B]
  ), _ = F(
    () => n.tiles.filter((A) => A.objectType === "snowfield"),
    [n.tiles]
  ), z = F(
    () => _.map((A) => ({
      position: [A.position.x, A.position.y, A.position.z],
      size: ue.GRID_CELL_SIZE * (A.size || 1)
    })),
    [_]
  ), W = F(
    () => n.tiles.filter(
      (A) => A.objectType && A.objectType !== "none" && A.objectType !== "sand" && A.objectType !== "snowfield"
    ),
    [n.tiles]
  ), H = F(
    () => n.tiles.filter((A) => A.objectType === "water"),
    [n.tiles]
  ), j = F(
    () => {
      const A = [];
      for (const G of n.tiles) {
        const $ = zt(G), X = (G.size || 1) * ue.GRID_CELL_SIZE, Z = G.rotation ?? 0;
        if ($ === "stairs") {
          const { tileSize: te, totalHeight: ne, colliderSlices: se, rotation: re } = qr(G), he = ne / se, le = te / se;
          for (let we = 0; we < se; we++) {
            const oe = he * (we + 1), K = -te / 2 + le * we + le / 2, [q, ce] = Tr(0, K, re);
            A.push({
              key: `${G.id}-stair-collider-${we}`,
              position: [
                G.position.x + q,
                oe / 2,
                G.position.z + ce
              ],
              rotation: [0, re, 0],
              args: [te / 2, oe / 2, le / 2]
            });
          }
          continue;
        }
        if ($ === "ramp") {
          const { tileSize: te, rampSlices: ne, sliceHeight: se, sliceDepth: re, rotation: he } = Bo(G);
          for (let le = 0; le < ne; le++) {
            const we = se * (le + 1), oe = -te / 2 + re * le + re / 2, [K, q] = Tr(0, oe, he);
            A.push({
              key: `${G.id}-ramp-${le}`,
              position: [
                G.position.x + K,
                we / 2,
                G.position.z + q
              ],
              rotation: [0, he, 0],
              args: [te / 2, we / 2, re / 2]
            });
          }
          continue;
        }
        if ($ === "round") {
          const te = G.position.y > 0.02, ne = te ? G.position.y : 0.04, se = te ? ne / 2 : -0.02, re = X / 2, he = re * 0.34;
          A.push({
            key: `${G.id}-core`,
            position: [G.position.x, se, G.position.z],
            rotation: [0, 0, 0],
            args: [re * 0.46, ne / 2, re * 0.46]
          });
          for (let le = 0; le < 4; le++)
            A.push({
              key: `${G.id}-ring-${le}`,
              position: [G.position.x, se, G.position.z],
              rotation: [0, Math.PI / 4 * le, 0],
              args: [re * 0.82, ne / 2, he]
            });
          continue;
        }
        const O = G.position.y > 0.02, Q = O ? G.position.y * 0.5 : 0.02, J = O ? G.position.y * 0.5 : -0.02;
        A.push({
          key: G.id,
          position: [G.position.x, J, G.position.z],
          rotation: [0, Z, 0],
          args: [X / 2, Q, X / 2]
        });
      }
      return A;
    },
    [n.tiles]
  );
  return L(() => {
    s <= u || c(Math.max(s, Math.ceil(u * 1.5)));
  }, [s, u]), Oe(() => {
    const A = P.current;
    if (A && g.rocks.length > 0) {
      A.count = g.rocks.length;
      for (let G = 0; G < g.rocks.length; G++) {
        const $ = g.rocks[G];
        C.position.set($.position[0], $.position[1], $.position[2]), C.rotation.set($.rotation[0], $.rotation[1], $.rotation[2]), C.scale.set($.scale[0], $.scale[1], $.scale[2]), C.updateMatrix(), A.setMatrixAt(G, C.matrix);
      }
      A.instanceMatrix.needsUpdate = !0;
    }
  }, [g.rocks, C]), Oe(() => {
    const A = i.current;
    if (!A) return;
    const G = ue.GRID_CELL_SIZE;
    A.count = f.length;
    for (let $ = 0; $ < f.length; $++) {
      const X = f[$];
      if (!X) continue;
      const Z = X.size || 1, O = G * Z;
      C.position.set(X.position.x, X.position.y + 1e-3, X.position.z), C.rotation.set(0, X.rotation ?? 0, 0), C.scale.set(O, 1, O), C.updateMatrix(), A.setMatrixAt($, C.matrix);
    }
    A.instanceMatrix.needsUpdate = !0, f.length > 0 && (A.computeBoundingBox(), A.computeBoundingSphere());
  }, [f, s, C, u]), L(() => {
    if (n.tiles.length === 0) return;
    const A = Ee.getInstance(), G = new w.Box3(), $ = new w.Vector3();
    n.tiles.forEach((O) => {
      const J = (O.size || 1) * ue.GRID_CELL_SIZE / 2;
      $.set(O.position.x - J, O.position.y, O.position.z - J), G.expandByPoint($), $.set(O.position.x + J, O.position.y, O.position.z + J), G.expandByPoint($);
    });
    const X = new w.Vector3(), Z = new w.Vector3();
    return G.getCenter(X), G.getSize(Z), A.addMarker(
      `tile-group-${n.id}`,
      "ground",
      n.name || "Tiles",
      X,
      Z
    ), () => {
      A.removeMarker(`tile-group-${n.id}`);
    };
  }, [n]), L(() => () => {
    o.current.dispose(), a.current?.dispose(), a.current = null, T.dispose(), k.dispose(), R.dispose();
  }, [T, k, R]), L(() => () => {
    g.sideGeometry.dispose();
  }, [g.sideGeometry]), L(() => () => {
    p.dispose(), S.dispose(), v.dispose(), M.dispose();
  }, [v, S, M, p]), /* @__PURE__ */ l(la, { type: "ground", children: /* @__PURE__ */ x(Se, { children: [
    j.length > 0 && /* @__PURE__ */ l(Yt, { type: "fixed", colliders: !1, children: j.map((A) => /* @__PURE__ */ l(
      $o,
      {
        position: A.position,
        rotation: A.rotation,
        args: A.args
      },
      `${n.id}-collider-${A.key}`
    )) }),
    t && n.tiles.map((A) => {
      const G = (A.size || 1) * ue.GRID_CELL_SIZE, $ = Math.max(0.22, A.position.y + 0.22);
      return /* @__PURE__ */ l(
        "group",
        {
          position: [A.position.x, $ / 2, A.position.z],
          scale: [G * 0.82, $, G * 0.82],
          onClick: () => r?.(A.id),
          children: /* @__PURE__ */ l("mesh", { geometry: k, material: R })
        },
        A.id
      );
    }),
    /* @__PURE__ */ l(
      "instancedMesh",
      {
        ref: i,
        args: [T, b, u],
        castShadow: !0,
        receiveShadow: !0,
        frustumCulled: !0
      }
    ),
    h.map((A) => {
      const G = (A.size || 1) * ue.GRID_CELL_SIZE, $ = A.position.y > 0.02, X = $ ? A.position.y : 0.04, Z = $ ? X / 2 : -0.02;
      return /* @__PURE__ */ l(
        "mesh",
        {
          position: [A.position.x, Z, A.position.z],
          material: b,
          castShadow: !0,
          receiveShadow: !0,
          children: /* @__PURE__ */ l("cylinderGeometry", { args: [G / 2, G / 2, X, 28, 1, !1] })
        },
        `${A.id}-round`
      );
    }),
    d.map((A) => /* @__PURE__ */ l(
      _d,
      {
        tile: A,
        material: b,
        supportTiles: n.tiles
      },
      `${A.id}-stairs`
    )),
    m.map((A) => {
      const { tileSize: G, totalHeight: $, rotation: X } = Bo(A);
      return /* @__PURE__ */ l(
        "mesh",
        {
          position: [A.position.x, 0, A.position.z],
          rotation: [0, X, 0],
          scale: [G, $, G],
          geometry: v,
          material: b,
          castShadow: !0,
          receiveShadow: !0
        },
        `${A.id}-ramp`
      );
    }),
    g.sideGeometry.getAttribute("position") && /* @__PURE__ */ l(
      "mesh",
      {
        geometry: g.sideGeometry,
        material: p,
        castShadow: !0,
        receiveShadow: !0,
        frustumCulled: !1
      }
    ),
    g.rocks.length > 0 && /* @__PURE__ */ l(
      "instancedMesh",
      {
        ref: P,
        args: [S, M, Math.max(1, g.rocks.length)],
        castShadow: !0,
        receiveShadow: !0
      }
    ),
    W.map((A) => /* @__PURE__ */ l(Md, { tile: A, tiles: H }, `${A.id}-object`)),
    E.length > 0 && /* @__PURE__ */ l(Yu, { entries: E }),
    z.length > 0 && /* @__PURE__ */ l(Xu, { entries: z })
  ] }) });
}
function Rd({
  wallGroup: n,
  meshes: e,
  isEditMode: t = !1,
  onWallClick: r
}) {
  const o = N(new ft()), i = N(null), a = ue.WALL_SIZES.WIDTH, s = ue.WALL_SIZES.HEIGHT, u = ue.WALL_SIZES.THICKNESS, c = n.walls.length, [f, d] = Y(() => Math.max(1, c)), m = F(() => new w.Object3D(), []);
  L(() => {
    c <= f || d(Math.max(c, Math.ceil(f * 1.5)));
  }, [c, f]);
  const h = F(() => {
    const g = new w.BoxGeometry(a, s, u);
    return g.translate(0, 0, a / 2), g;
  }, [a, s, u]), b = F(() => {
    const g = o.current, p = { id: "default", color: "#000000" }, S = n.frontMeshId ? e.get(n.frontMeshId) : p, v = n.backMeshId ? e.get(n.backMeshId) : p, M = n.sideMeshId ? e.get(n.sideMeshId) : p;
    return [
      g.getMaterial(M || p),
      g.getMaterial(M || p),
      g.getMaterial(M || p),
      g.getMaterial(M || p),
      g.getMaterial(S || p),
      g.getMaterial(v || p)
    ];
  }, [n, e]);
  Oe(() => {
    const g = i.current;
    if (g) {
      g.count = c;
      for (let p = 0; p < c; p++) {
        const S = n.walls[p];
        S && (m.position.set(S.position.x, S.position.y + s / 2, S.position.z), m.rotation.set(0, S.rotation.y, 0), m.updateMatrix(), g.setMatrixAt(p, m.matrix));
      }
      g.instanceMatrix.needsUpdate = !0, c > 0 && (g.computeBoundingBox(), g.computeBoundingSphere());
    }
  }, [n.walls, c, m, s, f]), L(() => () => {
    o.current.dispose(), h.dispose();
  }, [h]);
  const y = F(() => {
    if (t) return [];
    const g = a / 2;
    return n.walls.map((p) => {
      const S = Math.sin(p.rotation.y), v = Math.cos(p.rotation.y);
      return {
        id: p.id,
        position: [
          p.position.x + S * g,
          p.position.y + s / 2,
          p.position.z + v * g
        ],
        rotation: [0, p.rotation.y, 0]
      };
    });
  }, [n.walls, a, s, t]);
  return /* @__PURE__ */ x(Se, { children: [
    !t && y.length > 0 && /* @__PURE__ */ l(Yt, { type: "fixed", colliders: !1, children: y.map((g) => /* @__PURE__ */ l(
      $o,
      {
        position: g.position,
        rotation: g.rotation,
        args: [a / 2, s / 2, u / 2]
      },
      g.id
    )) }),
    t && n.walls.map((g) => /* @__PURE__ */ l(
      "group",
      {
        position: [g.position.x, g.position.y + s + 0.5, g.position.z],
        onClick: () => r?.(g.id),
        children: /* @__PURE__ */ x("mesh", { children: [
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
        args: [h, b, f],
        castShadow: !0,
        receiveShadow: !0
      }
    )
  ] });
}
const Nd = {
  sakura: [],
  flag: [],
  fire: [],
  billboard: []
};
function Ne(n, e) {
  return e <= 0 ? [] : n.length <= e ? n : n.slice(0, e);
}
function Ed(n) {
  const e = n.tiles.find((t) => t.objectType && t.objectType !== "none")?.objectType ?? "none";
  return e === "water" ? Ht : e === "sand" ? jt : e === "snowfield" ? $t : Wt;
}
function zd(n) {
  if (!n || n.length === 0) return Nd;
  const e = { sakura: [], flag: [], fire: [], billboard: [] };
  for (const t of n)
    t.type === "sakura" ? e.sakura.push({
      position: [t.position.x, t.position.y, t.position.z],
      size: t.config?.size ?? ue.GRID_CELL_SIZE,
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
const Bd = Ce.memo(function({
  onWallClick: e,
  onTileClick: t,
  onWallDelete: r,
  onTileDelete: o
}) {
  const i = U((O) => O.meshes), a = U((O) => O.wallGroups), s = U((O) => O.tileGroups), u = U((O) => O.editMode), c = U((O) => O.showGrid), f = U((O) => O.gridSize), d = U((O) => O.showSnow), m = U((O) => O.objects), h = ke((O) => O.drawMirror), b = Ge((O) => O.active), y = Ge((O) => O.version), g = bt((O) => O.initialized), p = bt((O) => O.visibleWallGroupIds), S = bt((O) => O.visibleTileGroupIds), v = bt((O) => O.visibleObjectIds), M = b && h.version > 0 && h.version === y, T = M ? qe(h, Lr) : Number.MAX_SAFE_INTEGER, C = M ? qe(h, Wt) : Number.MAX_SAFE_INTEGER, P = M ? qe(h, Ht) : Number.MAX_SAFE_INTEGER, k = M ? qe(h, jt) : Number.MAX_SAFE_INTEGER, R = M ? qe(h, $t) : Number.MAX_SAFE_INTEGER, B = M ? qe(h, Gr) : Number.MAX_SAFE_INTEGER, E = M ? qe(h, Or) : Number.MAX_SAFE_INTEGER, _ = M ? qe(h, Ur) : Number.MAX_SAFE_INTEGER, z = M ? qe(h, Wr) : Number.MAX_SAFE_INTEGER, W = F(() => {
    const O = Array.from(a.values()), Q = g ? O.filter((J) => p.has(J.id)) : O;
    return Ne(Q, T);
  }, [a, g, p, T]), H = F(() => {
    const O = Array.from(s.values()), Q = g ? O.filter((re) => S.has(re.id)) : O, J = [], te = [], ne = [], se = [];
    for (const re of Q) {
      const he = Ed(re);
      he === Ht ? te.push(re) : he === jt ? ne.push(re) : he === $t ? se.push(re) : J.push(re);
    }
    return [
      ...Ne(J, C),
      ...Ne(te, P),
      ...Ne(ne, k),
      ...Ne(se, R)
    ];
  }, [s, g, S, C, P, k, R]), j = F(() => {
    const O = g ? m.filter((se) => v.has(se.id)) : m, Q = [], J = [], te = [], ne = [];
    for (const se of O)
      se.type === "sakura" ? Q.push(se) : se.type === "flag" ? J.push(se) : se.type === "fire" ? te.push(se) : se.type === "billboard" && ne.push(se);
    return [
      ...Ne(Q, B),
      ...Ne(J, E),
      ...Ne(te, _),
      ...Ne(ne, z)
    ];
  }, [
    m,
    g,
    v,
    B,
    E,
    _,
    z
  ]), A = F(() => zd(j), [j]), G = Ne(A.sakura, B), $ = Ne(A.flag, E), X = Ne(A.fire, _), Z = Ne(A.billboard, z);
  return /* @__PURE__ */ l(Je, { fallback: null, children: /* @__PURE__ */ x("group", { name: "building-system", children: [
    c && /* @__PURE__ */ l(eu, { size: f }),
    /* @__PURE__ */ l(Hu, {}),
    /* @__PURE__ */ l(ju, {}),
    /* @__PURE__ */ l(vc, {}),
    W.map((O) => /* @__PURE__ */ l(
      Rd,
      {
        wallGroup: O,
        meshes: i,
        isEditMode: u === "wall",
        ...e ? { onWallClick: e } : {},
        ...r ? { onWallDelete: r } : {}
      },
      O.id
    )),
    H.map((O) => /* @__PURE__ */ l(
      Pd,
      {
        tileGroup: O,
        meshes: i,
        isEditMode: u === "tile",
        ...t ? { onTileClick: t } : {},
        ...o ? { onTileDelete: o } : {}
      },
      O.id
    )),
    G.length > 0 && /* @__PURE__ */ l(Je, { fallback: null, children: /* @__PURE__ */ l(Eu, { trees: G }) }),
    $.length > 0 && /* @__PURE__ */ l(Je, { fallback: null, children: /* @__PURE__ */ l(_u, { flags: $ }) }),
    X.length > 0 && /* @__PURE__ */ l(Je, { fallback: null, children: /* @__PURE__ */ l(yu, { fires: X }) }),
    Z.map((O) => /* @__PURE__ */ l(
      "group",
      {
        position: [O.position.x, O.position.y, O.position.z],
        rotation: [0, O.rotation ?? 0, 0],
        children: /* @__PURE__ */ l(Je, { fallback: null, children: /* @__PURE__ */ l(
          iu,
          {
            ...O.config?.billboardText ? { text: O.config.billboardText } : {},
            ...O.config?.billboardImageUrl ? { imageUrl: O.config.billboardImageUrl } : {},
            ...O.config?.billboardColor ? { color: O.config.billboardColor } : {}
          }
        ) })
      },
      O.id
    )),
    d && /* @__PURE__ */ l(zi, {})
  ] }) });
});
function Dd({ part: n }) {
  return /* @__PURE__ */ x(
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
function Fd({ part: n }) {
  const e = Ho(n.url), t = F(() => {
    const r = jo.clone(e.scene);
    return r && Te() && Qi(r), r;
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
function Ld({ part: n, instanceId: e }) {
  return !!n.url && n.url.trim() !== "" ? /* @__PURE__ */ l(Fd, { part: n, instanceId: e }) : /* @__PURE__ */ l(Dd, { part: n, instanceId: e });
}
const Gd = 0.3, Od = Ce.memo(function({ instance: e, isEditMode: t, onClick: r }) {
  const o = N(null), i = N(null), a = N(0), s = me(
    V(
      (p) => p.templates.get(e.templateId),
      [e.templateId]
    )
  ), u = me(
    V(
      (p) => e.currentClothingSetId ? p.clothingSets.get(e.currentClothingSetId) : void 0,
      [e.currentClothingSetId]
    )
  ), c = me((p) => p.advanceNavigation), f = me(
    (p) => p.updateNavigationPosition
  ), d = e.navigation?.state === "moving";
  L(() => {
    a.current = e.navigation?.currentIndex ?? 0;
  }, [e.navigation?.waypoints]), de((p, S) => {
    if (!d || !e.navigation) return;
    const v = i.current;
    if (!v) return;
    const { waypoints: M, speed: T } = e.navigation, C = a.current;
    if (C >= M.length) return;
    const P = M[C];
    if (!P) return;
    const k = v.translation(), R = P[0] - k.x, B = P[2] - k.z, E = Math.sqrt(R * R + B * B);
    if (E < Gd) {
      a.current = C + 1, C + 1 >= M.length && f(e.id, [P[0], P[1], P[2]]), c(e.id);
      return;
    }
    const _ = Math.min(T * S, E), z = k.x + R / E * _, W = k.z + B / E * _;
    if (v.setNextKinematicTranslation({ x: z, y: k.y, z: W }), o.current && E > 0.01) {
      const H = Math.atan2(R, B);
      o.current.rotation.y = H;
    }
  });
  const m = V((p) => {
    p.stopPropagation(), document.body.style.cursor = "pointer";
    const S = o.current?.__handlers;
    S?.pointerover && S.pointerover();
  }, []), h = V(() => {
    document.body.style.cursor = "default";
  }, []);
  L(() => {
    if (!e.events || e.events.length === 0) return;
    const p = o.current;
    if (!p) return;
    const S = () => {
      e.events?.find((M) => M.type === "onHover");
    }, v = () => {
      const M = e.events?.find((T) => T.type === "onClick");
      M && M.action;
    };
    return p.__handlers = {
      pointerover: S,
      click: v
    }, () => {
      delete p.__handlers;
    };
  }, [e.events]);
  const b = F(() => {
    if (!s) return [];
    const p = [...s.baseParts];
    if (u && p.push(...u.parts), s.accessoryParts && p.push(...s.accessoryParts), e.customParts)
      for (const S of e.customParts) {
        const v = p.findIndex((M) => M.type === S.type);
        v >= 0 ? p[v] = { ...p[v], ...S } : p.push(S);
      }
    return p;
  }, [s, u, e.customParts]);
  if (!s)
    return null;
  const y = s.fullModelUrl || e.metadata?.modelUrl;
  return y ? /* @__PURE__ */ l(
    Ji,
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
      children: t && /* @__PURE__ */ x("mesh", { position: [0, 2.5, 0], children: [
        /* @__PURE__ */ l("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ l("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
      ] })
    }
  ) : /* @__PURE__ */ l(
    Yt,
    {
      ref: i,
      type: d ? "kinematicPosition" : "fixed",
      position: e.position,
      rotation: e.rotation,
      colliders: "cuboid",
      children: /* @__PURE__ */ x(
        "group",
        {
          ref: o,
          scale: e.scale,
          ...r ? {
            onClick: (p) => {
              p.stopPropagation(), r();
            }
          } : {},
          onPointerEnter: m,
          onPointerLeave: h,
          children: [
            b.map((p) => /* @__PURE__ */ l(Ld, { part: p, instanceId: e.id }, p.id)),
            t && /* @__PURE__ */ x("mesh", { position: [0, 2.5, 0], children: [
              /* @__PURE__ */ l("boxGeometry", { args: [0.5, 0.5, 0.5] }),
              /* @__PURE__ */ l("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
            ] })
          ]
        }
      )
    }
  );
}), Ud = 30, Wd = 120, Hd = 4;
function jd() {
  const { gl: n } = Ze(), e = me((d) => d.instances), t = me((d) => d.selectedTemplateId), r = me(
    (d) => d.createInstanceFromTemplate
  ), o = me((d) => d.setSelectedInstance), i = U((d) => d.editMode), a = U((d) => d.hoverPosition), s = i === "npc", [u, c] = Y(() => /* @__PURE__ */ new Set()), f = N(0);
  return de((d, m) => {
    if (f.current += m, f.current < 0.5) return;
    f.current = 0;
    const h = d.camera.position, b = /* @__PURE__ */ new Set();
    e.forEach((y) => {
      const [g, p, S] = y.position, v = g - h.x, M = p - h.y, T = S - h.z, C = Math.sqrt(v * v + M * M + T * T);
      xt(C, Ud, Wd, Hd) > 0.01 && b.add(y.id);
    }), (b.size !== u.size || [...b].some((y) => !u.has(y))) && c(b);
  }), L(() => {
    if (!s || !t || !a) return;
    const d = () => {
      a && r(t, [
        a.x,
        a.y,
        a.z
      ]);
    };
    return n.domElement.addEventListener("click", d), () => n.domElement.removeEventListener("click", d);
  }, [s, t, a, n, r]), /* @__PURE__ */ l("group", { name: "npc-system", children: Array.from(e.values()).map((d) => !s && !u.has(d.id) ? null : /* @__PURE__ */ l(
    Od,
    {
      instance: d,
      isEditMode: s,
      onClick: () => {
        s && o(d.id);
      }
    },
    d.id
  )) });
}
const Do = new w.Vector2(), $d = new w.Plane(new w.Vector3(0, 1, 0), 0), hr = new w.Vector3();
let gr = 0;
function Vd() {
  const { camera: n, raycaster: e } = Ze(), t = N({ x: 0, y: 0 }), r = U((S) => S.snapPosition), o = U((S) => S.addWall), i = U((S) => S.addTile), a = U((S) => S.addObject), s = U((S) => S.removeWall), u = U((S) => S.removeTile), c = U((S) => S.setHoverPosition), f = V(() => (Do.set(t.current.x, t.current.y), e.setFromCamera(Do, n), e.ray.intersectPlane($d, hr) ? r({ x: hr.x, y: 0, z: hr.z }) : null), [n, e, r]), d = V(() => {
    const S = f();
    if (!S) return null;
    const v = U.getState().getSupportHeightAt(S);
    return { ...S, y: v };
  }, [f]), m = V((S) => {
    const v = S.target;
    t.current.x = S.clientX / v.clientWidth * 2 - 1, t.current.y = -(S.clientY / v.clientHeight) * 2 + 1;
    const M = U.getState().editMode;
    c(M === "tile" ? d() : M === "wall" || M === "npc" || M === "object" ? f() : null);
  }, [f, d, c]), h = V(() => {
    const {
      editMode: S,
      selectedWallGroupId: v,
      currentWallRotation: M,
      checkWallPosition: T,
      hoverPosition: C
    } = U.getState();
    if (S !== "wall" || !v || !C || T(C, M)) return;
    const P = { x: 0, y: M, z: 0 };
    o(v, {
      id: `wall-${++gr}-${Date.now()}`,
      position: C,
      rotation: P,
      wallGroupId: v
    });
  }, [o]), b = V(() => {
    const {
      editMode: S,
      selectedTileGroupId: v,
      checkTilePosition: M,
      getSupportHeightAt: T,
      currentTileMultiplier: C,
      currentTileHeight: P,
      currentTileShape: k,
      currentTileRotation: R,
      hoverPosition: B
    } = U.getState();
    if (S !== "tile" || !v || !B) return;
    const E = ue.HEIGHT_STEP, _ = T(B), z = k === "box" || k === "round" ? _ + P * E : Math.max(1, P) * E, W = { ...B, y: z };
    M(W) || i(v, {
      id: `tile-${++gr}-${Date.now()}`,
      position: W,
      tileGroupId: v,
      size: C,
      rotation: R,
      shape: k
    });
  }, [i]), y = V(() => {
    const {
      editMode: S,
      selectedPlacedObjectType: v,
      hoverPosition: M,
      tileGroups: T,
      currentObjectRotation: C,
      currentObjectPrimaryColor: P,
      currentObjectSecondaryColor: k,
      currentFlagWidth: R,
      currentFlagHeight: B,
      currentFlagStyle: E,
      currentFlagImageUrl: _,
      currentFireIntensity: z,
      currentFireWidth: W,
      currentFireHeight: H,
      currentFireColor: j,
      currentBillboardText: A,
      currentBillboardColor: G,
      currentBillboardImageUrl: $
    } = U.getState();
    if (S !== "object" || v === "none" || !M) return;
    let X = 0;
    const Z = ue.GRID_CELL_SIZE;
    for (const Q of T.values())
      for (const J of Q.tiles) {
        const te = (J.size || 1) * Z / 2;
        Math.abs(J.position.x - M.x) < te && Math.abs(J.position.z - M.z) < te && (X = Math.max(X, J.position.y));
      }
    const O = v === "sakura" ? {
      size: U.getState().currentTileMultiplier * Z,
      primaryColor: P,
      secondaryColor: k
    } : v === "flag" ? {
      flagWidth: R,
      flagHeight: B,
      flagStyle: E,
      ..._ ? { flagTexture: _ } : {}
    } : v === "fire" ? { fireIntensity: z, fireWidth: W, fireHeight: H, fireColor: j } : v === "billboard" ? {
      billboardText: A,
      billboardColor: G,
      ...$ ? { billboardImageUrl: $ } : {}
    } : void 0;
    a({
      id: `obj-${++gr}-${Date.now()}`,
      type: v,
      position: { ...M, y: X },
      ...C !== 0 ? { rotation: C } : {},
      ...O ? { config: O } : {}
    });
  }, [a]), g = V((S) => {
    const { editMode: v, selectedWallGroupId: M } = U.getState();
    v === "wall" && M && s(M, S);
  }, [s]), p = V((S) => {
    const { editMode: v, selectedTileGroupId: M } = U.getState();
    v === "tile" && M && u(M, S);
  }, [u]);
  return {
    updateMousePosition: m,
    placeWall: h,
    placeTile: b,
    placeObject: y,
    handleWallClick: g,
    handleTileClick: p,
    getGroundPosition: f
  };
}
const qd = 1, Yd = 4, yr = 8, Zd = 128, Xd = 64, Kd = 1, Jd = 180, Ui = 64;
function br() {
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
function vr(n) {
  n?.destroy && n.destroy();
}
function Fo(n) {
  vr(n.uniformBuffer), vr(n.visibleBuffer), vr(n.readBuffer);
}
function Qd(n, e, t, r) {
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

@compute @workgroup_size(${Ui})
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
  }), a = o.createComputePipeline({
    layout: "auto",
    compute: { module: i, entryPoint: "main" }
  }), s = a.getBindGroupLayout(0), u = n.createBuffer({
    label: "building-cull-uniforms",
    size: 96,
    usage: Xd | yr
  }), c = n.createBuffer({
    label: "building-cull-visible",
    size: Math.max(4, r * 4),
    usage: Zd | Yd | yr
  }), f = n.createBuffer({
    label: "building-cull-readback",
    size: Math.max(4, r * 4),
    usage: yr | qd
  }), d = o.createBindGroup({
    layout: s,
    entries: [
      { binding: 0, resource: { buffer: e } },
      { binding: 1, resource: { buffer: t } },
      { binding: 2, resource: { buffer: c } },
      { binding: 3, resource: { buffer: u } }
    ]
  });
  return {
    pipeline: a,
    bindGroupLayout: s,
    uniformBuffer: u,
    visibleBuffer: c,
    readBuffer: f,
    bindGroup: d,
    count: r,
    spatialBuffer: e,
    metaBuffer: t
  };
}
function ef() {
  const n = Ze((s) => s.gl), e = ke((s) => s.snapshot), t = ke((s) => s.uploadResources), r = Ge((s) => s.setResult), o = Ge((s) => s.reset), i = N({
    resources: br(),
    busy: !1,
    lastRunAt: 0
  }), a = F(
    () => ({
      viewProj: new w.Matrix4(),
      uniform: new Float32Array(24)
    }),
    []
  );
  return L(() => o, [o]), L(() => {
    const s = i.current.resources;
    (s.count !== e.ids.length || s.spatialBuffer !== t.spatialBuffer || s.metaBuffer !== t.metaBuffer) && (Fo(s), i.current.resources = br());
  }, [e.ids.length, t]), de((s) => {
    if (e.version === 0 || e.ids.length === 0 || t.backend !== "webgpu") return;
    const u = jr(n);
    if (!u || !t.spatialBuffer || !t.metaBuffer || i.current.busy) return;
    const c = performance.now();
    if (c - i.current.lastRunAt < Jd) return;
    i.current.lastRunAt = c, i.current.resources.pipeline || (i.current.resources = Qd(
      u,
      t.spatialBuffer,
      t.metaBuffer,
      e.ids.length
    ));
    const f = i.current.resources, d = a.uniform;
    if (a.viewProj.multiplyMatrices(s.camera.projectionMatrix, s.camera.matrixWorldInverse), d.set(a.viewProj.elements, 0), d[16] = s.camera.position.x, d[17] = s.camera.position.y, d[18] = s.camera.position.z, d[19] = Ye, d[20] = e.ids.length, d[21] = 0, d[22] = 0, d[23] = 0, !f.uniformBuffer || !f.visibleBuffer || !f.readBuffer || !f.bindGroup || !f.pipeline)
      return;
    u.queue.writeBuffer(f.uniformBuffer, 0, d);
    const m = u, h = m.createCommandEncoder(), b = h.beginComputePass();
    b.setPipeline(f.pipeline), b.setBindGroup(0, f.bindGroup), b.dispatchWorkgroups(Math.max(1, Math.ceil(e.ids.length / Ui))), b.end(), h.copyBufferToBuffer(f.visibleBuffer, 0, f.readBuffer, 0, Math.max(4, e.ids.length * 4)), m.queue.submit([h.finish()]), i.current.busy = !0, Promise.resolve(f.readBuffer?.mapAsync?.(Kd)).then(() => {
      const y = f.readBuffer?.getMappedRange?.();
      if (!y) return;
      const g = new Uint32Array(y.slice(0));
      f.readBuffer?.unmap?.();
      const p = Oc(e, g);
      r(p);
    }).catch(() => {
      o();
    }).finally(() => {
      i.current.busy = !1;
    });
  }), L(() => () => {
    Fo(i.current.resources), i.current.resources = br(), o();
  }, [o]), null;
}
function tf() {
  const n = ke((r) => r.snapshot), e = ke((r) => r.setGpuMirror), t = N(ke.getState().gpuMirror);
  return L(() => {
    const r = qc(n, t.current);
    t.current = r, e(r);
  }, [n, e]), null;
}
function nf() {
  const n = Ze((o) => o.gl), e = ke((o) => o.gpuMirror), t = ke((o) => o.setUploadResources), r = N(fn());
  return L(() => {
    if (e.version === 0) return;
    const o = jr(n);
    o && (r.current = Jc(o, r.current, e), t(r.current));
  }, [n, e, t]), L(() => () => {
    Kc(r.current), r.current = fn(), t(r.current);
  }, [t]), null;
}
function rf() {
  const n = Ze((o) => o.gl), e = ke((o) => o.drawMirror), t = ke((o) => o.setUploadResources), r = N(ke.getState().uploadResources ?? fn());
  return L(() => {
    r.current = ke.getState().uploadResources;
  }), L(() => {
    if (e.version === 0) return;
    const o = jr(n);
    o && (r.current = Qc(o, r.current, e), t(r.current));
  }, [n, e, t]), null;
}
function of() {
  const n = Ge((o) => o.version), e = Ge((o) => o.clusterCounts), t = ke((o) => o.setDrawMirror), r = N(ke.getState().drawMirror);
  return L(() => {
    if (n === 0 || e.length === 0) return;
    const o = Hc(n, e, r.current);
    r.current = o, t(o);
  }, [n, e, t]), null;
}
function sf() {
  const n = U((s) => s.wallGroups), e = U((s) => s.tileGroups), t = U((s) => s.objects), r = ke((s) => s.setSnapshot), o = ke((s) => s.reset), i = N(1), a = F(
    () => Dc({
      wallGroups: Array.from(n.values()),
      tileGroups: Array.from(e.values()),
      objects: t,
      version: i.current++
    }),
    [n, e, t]
  );
  return L(() => {
    r(a);
  }, [a, r]), L(() => o, [o]), null;
}
function xr(n, e, t, r, o, i, a, s, u, c) {
  for (const f of e) {
    const d = t.get(f);
    if (!d) continue;
    const m = d.centerX - a.x, h = d.centerY - a.y, b = d.centerZ - a.z, y = u + d.radius * d.radius;
    m * m + h * h + b * b > y || (s.center.set(d.centerX, d.centerY, d.centerZ), s.radius = d.radius, i.intersectsSphere(s) && (Nc(d, r, a, o, c) || n.add(f)));
  }
}
function af() {
  const n = ke((m) => m.snapshot), e = Ge((m) => m.active), t = Ge((m) => m.version), r = Ge((m) => m.visibleTileGroupIds), o = Ge((m) => m.visibleWallGroupIds), i = Ge((m) => m.visibleObjectIds), a = bt((m) => m.setVisible), s = bt((m) => m.reset), u = F(
    () => Lc(n),
    [n]
  ), c = N(0), f = N(/* @__PURE__ */ new Map()), d = F(
    () => ({
      frustum: new w.Frustum(),
      matrix: new w.Matrix4(),
      camera: new w.Vector3(),
      forward: new w.Vector3(),
      sphere: new w.Sphere(),
      targetDir: new w.Vector3(),
      occDir: new w.Vector3(),
      cross: new w.Vector3()
    }),
    []
  );
  return L(() => {
    f.current.clear();
  }, [u]), L(() => {
    f.current.clear();
  }, [e, t]), L(() => s, [s]), de((m, h) => {
    if (n.ids.length === 0 || (c.current += Math.max(0, h), c.current < xc)) return;
    c.current = 0, d.matrix.multiplyMatrices(m.camera.projectionMatrix, m.camera.matrixWorldInverse), d.frustum.setFromProjectionMatrix(d.matrix), d.camera.copy(m.camera.position), m.camera.getWorldDirection(d.forward);
    const b = Ic(
      d.camera.x,
      d.camera.z,
      d.forward.x,
      d.forward.z
    ), y = f.current.get(b);
    if (y) {
      a(y);
      return;
    }
    const g = e && t === n.version, p = g ? new Set(r) : ln(
      u.tileBuckets,
      d.camera.x,
      d.camera.z,
      Ye
    ), S = g ? new Set(o) : ln(
      u.wallBuckets,
      d.camera.x,
      d.camera.z,
      Ye
    ), v = g ? new Set(i) : ln(
      u.objectBuckets,
      d.camera.x,
      d.camera.z,
      Ye
    ), M = Rc(
      u,
      d.camera.x,
      d.camera.z,
      Ye
    ), T = /* @__PURE__ */ new Set(), C = /* @__PURE__ */ new Set(), P = /* @__PURE__ */ new Set(), k = Ye * Ye;
    xr(
      T,
      p,
      u.tileById,
      "tile",
      M,
      d.frustum,
      d.camera,
      d.sphere,
      k,
      d
    ), xr(
      C,
      S,
      u.wallById,
      "wall",
      M,
      d.frustum,
      d.camera,
      d.sphere,
      k,
      d
    ), xr(
      P,
      v,
      u.objectById,
      "object",
      M,
      d.frustum,
      d.camera,
      d.sphere,
      k,
      d
    );
    const R = { tileIds: T, wallIds: C, objectIds: P };
    if (f.current.set(b, R), f.current.size > 96) {
      const B = f.current.keys().next().value;
      B && f.current.delete(B);
    }
    a(R);
  }), null;
}
const lf = 9, cf = 150;
function om() {
  const { gl: n } = Ze(), {
    updateMousePosition: e,
    placeWall: t,
    placeTile: r,
    placeObject: o,
    handleWallClick: i,
    handleTileClick: a
  } = Vd(), s = U((v) => v.editMode), u = s !== "none", c = U((v) => v.setHoverPosition), f = U((v) => v.setWallRotation), d = U((v) => v.setTileRotation), m = U((v) => v.setObjectRotation), h = U((v) => v.setTileHeight), b = U((v) => v.initialized), y = U((v) => v.initializeDefaults), g = N({ x: 0, y: 0 }), p = N(0), S = V((v) => {
    v && (v.mouseButtons = {
      LEFT: -1,
      MIDDLE: w.MOUSE.DOLLY,
      RIGHT: w.MOUSE.ROTATE
    });
  }, []);
  return L(() => {
    b || y();
  }, [b, y]), L(() => {
    if (s !== "wall" && s !== "tile" && s !== "object") return;
    const v = (M) => {
      const T = (C) => {
        s === "wall" ? f(C) : s === "tile" ? d(C) : s === "object" && m(C);
      };
      switch (M.key) {
        case "ArrowUp":
          T(0);
          break;
        case "ArrowRight":
          T(Math.PI / 2);
          break;
        case "ArrowDown":
          T(Math.PI);
          break;
        case "ArrowLeft":
          T(Math.PI * 1.5);
          break;
      }
      if (s === "tile") {
        if (M.code === "KeyQ" || M.key === "q" || M.key === "Q") {
          const C = U.getState().currentTileHeight;
          h(C - 1);
        } else if (M.code === "KeyE" || M.key === "e" || M.key === "E") {
          const C = U.getState().currentTileHeight;
          h(C + 1);
        }
      }
    };
    return window.addEventListener("keydown", v), () => window.removeEventListener("keydown", v);
  }, [s, d, f, m, h]), L(() => {
    const v = n.domElement, M = (P) => {
      P.button === 0 && (g.current.x = P.clientX, g.current.y = P.clientY);
    }, T = (P) => e(P), C = (P) => {
      if (P.button !== 0) return;
      const k = P.clientX - g.current.x, R = P.clientY - g.current.y;
      if (k * k + R * R > lf) return;
      const B = performance.now();
      if (B - p.current < cf) return;
      p.current = B;
      const E = U.getState().editMode;
      E !== "npc" && (E === "wall" ? t() : E === "tile" ? r() : E === "object" && o());
    };
    return v.addEventListener("mousedown", M), v.addEventListener("mousemove", T), v.addEventListener("mouseup", C), () => {
      v.removeEventListener("mousedown", M), v.removeEventListener("mousemove", T), v.removeEventListener("mouseup", C), c(null);
    };
  }, [n, e, t, r, o, c]), /* @__PURE__ */ x(Se, { children: [
    /* @__PURE__ */ l(sf, {}),
    /* @__PURE__ */ l(tf, {}),
    /* @__PURE__ */ l(nf, {}),
    /* @__PURE__ */ l(ef, {}),
    /* @__PURE__ */ l(of, {}),
    /* @__PURE__ */ l(rf, {}),
    /* @__PURE__ */ l(af, {}),
    u && /* @__PURE__ */ l(
      cs,
      {
        ref: S,
        enablePan: !0,
        enableZoom: !0,
        enableRotate: !0,
        maxPolarAngle: Math.PI / 2.5,
        minDistance: 5,
        maxDistance: 100
      }
    ),
    /* @__PURE__ */ l(
      Bd,
      {
        onWallClick: i,
        onTileClick: a,
        onWallDelete: i,
        onTileDelete: a
      }
    ),
    /* @__PURE__ */ l(jd, {})
  ] });
}
const Lo = [
  { type: "none", label: "None" },
  { type: "water", label: "Water" },
  { type: "grass", label: "Grass" },
  { type: "sand", label: "Sand" },
  { type: "snowfield", label: "Snowfield" }
], Go = [
  { type: "box", label: "Box" },
  { type: "stairs", label: "Stairs" },
  { type: "round", label: "Round" },
  { type: "ramp", label: "Ramp" }
];
function im({ onClose: n }) {
  const {
    setEditMode: e,
    editMode: t,
    isInEditMode: r,
    currentTileMultiplier: o,
    setTileMultiplier: i,
    currentTileHeight: a,
    setTileHeight: s,
    currentTileShape: u,
    setTileShape: c,
    currentTileRotation: f,
    setTileRotation: d,
    currentWallRotation: m,
    setWallRotation: h,
    wallCategories: b,
    tileCategories: y,
    selectedWallCategoryId: g,
    selectedTileCategoryId: p,
    selectedWallGroupId: S,
    selectedTileGroupId: v,
    setSelectedWallCategory: M,
    setSelectedTileCategory: T,
    wallGroups: C,
    tileGroups: P,
    meshes: k,
    updateMesh: R,
    addMesh: B,
    addWallGroup: E,
    addTileGroup: _,
    selectedTileObjectType: z,
    setSelectedTileObjectType: W
  } = U(), H = gs((D) => D.isLoggedIn), j = r(), {
    templates: A,
    selectedTemplateId: G,
    setSelectedTemplate: $,
    initializeDefaults: X,
    selectedInstanceId: Z
  } = me(), [O, Q] = Ce.useState(!1), [J, te] = Ce.useState(""), [ne, se] = Ce.useState("#808080"), [re, he] = Ce.useState(""), le = F(() => Array.from(y.values()), [y]), we = F(() => Array.from(b.values()), [b]), oe = F(() => Array.from(A.values()), [A]), K = F(
    () => Lo.find((D) => D.type === z)?.label ?? z,
    [z]
  ), q = F(
    () => Go.find((D) => D.type === u)?.label ?? u,
    [u]
  ), ce = V(() => {
    e("none"), n?.();
  }, [e, n]), ge = V(() => Q((D) => !D), []);
  return Ce.useEffect(() => {
    X();
  }, [X]), Ce.useEffect(() => {
    if (t === "wall" && S) {
      const D = C.get(S);
      if (D && D.frontMeshId) {
        const I = k.get(D.frontMeshId);
        I && (se(I.color || "#808080"), he(I.mapTextureUrl || ""));
      }
    } else if (t === "tile" && v) {
      const D = P.get(v);
      if (D && D.floorMeshId) {
        const I = k.get(D.floorMeshId);
        I && (se(I.color || "#808080"), he(I.mapTextureUrl || ""));
      }
    }
  }, [t, S, v, C, P, k]), H ? /* @__PURE__ */ x(Se, { children: [
    j && /* @__PURE__ */ l("div", { className: "building-edit-mode-overlay" }),
    /* @__PURE__ */ l("div", { className: "building-ui-container", children: j ? /* @__PURE__ */ x("div", { className: "building-ui-panel", children: [
      /* @__PURE__ */ x("div", { className: "building-ui-header", children: [
        /* @__PURE__ */ l("span", { className: "building-ui-title", children: "Building Mode" }),
        /* @__PURE__ */ l(
          "button",
          {
            onClick: ce,
            className: "building-ui-close",
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ x("div", { className: "building-ui-mode-group", children: [
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
            onClick: () => e("npc"),
            className: `building-ui-mode-button ${t === "npc" ? "active" : ""}`,
            children: "NPC Mode"
          }
        )
      ] }),
      t === "tile" && /* @__PURE__ */ x(Se, { children: [
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Category:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: p || "",
              onChange: (D) => T(D.target.value),
              className: "building-ui-select",
              children: le.map((D) => /* @__PURE__ */ l("option", { value: D.id, children: D.name }, D.id))
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Type:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: v || "",
              onChange: (D) => U.setState({ selectedTileGroupId: D.target.value }),
              className: "building-ui-select",
              children: p && y.get(p)?.tileGroupIds.map((D) => {
                const I = P.get(D);
                return I ? /* @__PURE__ */ l("option", { value: I.id, children: I.name }, I.id) : null;
              })
            }
          )
        ] }),
        /* @__PURE__ */ x(
          "button",
          {
            onClick: ge,
            className: "building-ui-custom-toggle",
            children: [
              O ? "Hide" : "Show",
              " Custom Settings"
            ]
          }
        ),
        O && /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Name:" }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                value: J,
                onChange: (D) => te(D.target.value),
                placeholder: "Custom Floor Name",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ l(
                "input",
                {
                  type: "color",
                  value: ne,
                  onChange: (D) => se(D.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "text",
                  value: ne,
                  onChange: (D) => se(D.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Texture URL:" }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                value: re,
                onChange: (D) => he(D.target.value),
                placeholder: "https://...",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ l(
            "button",
            {
              onClick: () => {
                if (v) {
                  const D = P.get(v);
                  D && D.floorMeshId && R(D.floorMeshId, {
                    color: ne,
                    ...re ? { mapTextureUrl: re } : {}
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
                if (J) {
                  const D = `custom-tile-${Date.now()}`, I = `custom-floor-mesh-${Date.now()}`;
                  if (B({
                    id: I,
                    color: ne,
                    material: "STANDARD",
                    ...re ? { mapTextureUrl: re } : {},
                    roughness: 0.6
                  }), _({
                    id: D,
                    name: J,
                    floorMeshId: I,
                    tiles: []
                  }), p) {
                    const ye = y.get(p);
                    ye && U.getState().updateTileCategory(p, {
                      tileGroupIds: [...ye.tileGroupIds, D]
                    });
                  }
                  U.setState({ selectedTileGroupId: D }), te("");
                }
              },
              className: "building-ui-create-button",
              children: "Create New Type"
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Size:" }),
          /* @__PURE__ */ x("div", { className: "building-ui-size-buttons", children: [
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
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Height:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-size-buttons", children: [0, 1, 2, 3, 4].map((D) => /* @__PURE__ */ l(
            "button",
            {
              onClick: () => s(D),
              className: `building-ui-size-button ${a === D ? "active" : ""}`,
              children: D
            },
            D
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Shape:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-size-buttons", children: Go.map((D) => /* @__PURE__ */ l(
            "button",
            {
              onClick: () => c(D.type),
              className: `building-ui-size-button ${u === D.type ? "active" : ""}`,
              children: D.label
            },
            D.type
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Rotation:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-size-buttons", children: [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((D, I) => /* @__PURE__ */ l(
            "button",
            {
              onClick: () => d(D),
              className: `building-ui-size-button ${Math.abs(f - D) < 1e-4 ? "active" : ""}`,
              children: I * 90
            },
            D
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-object-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Tile Object:" }),
          /* @__PURE__ */ l("div", { className: "building-ui-object-buttons", children: Lo.map((D) => /* @__PURE__ */ l(
            "button",
            {
              onClick: () => W(D.type),
              className: `building-ui-object-button ${z === D.type ? "active" : ""}`,
              children: D.label
            },
            D.type
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ x("p", { children: [
            "Category: ",
            y.get(p || "")?.name
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Type: ",
            P.get(v || "")?.name
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Size: ",
            o,
            "x",
            o,
            " (",
            o * 4,
            "m)"
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Height: ",
            a
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Shape: ",
            q
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Object: ",
            K
          ] }),
          /* @__PURE__ */ l("p", { children: "Click to place tiles" }),
          /* @__PURE__ */ l("p", { children: "Red = Occupied, Green = Available" })
        ] })
      ] }),
      t === "wall" && /* @__PURE__ */ x(Se, { children: [
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Category:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: g || "",
              onChange: (D) => M(D.target.value),
              className: "building-ui-select",
              children: we.map((D) => /* @__PURE__ */ l("option", { value: D.id, children: D.name }, D.id))
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Type:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: S || "",
              onChange: (D) => U.setState({ selectedWallGroupId: D.target.value }),
              className: "building-ui-select",
              children: g && b.get(g)?.wallGroupIds.map((D) => {
                const I = C.get(D);
                return I ? /* @__PURE__ */ l("option", { value: I.id, children: I.name }, I.id) : null;
              })
            }
          )
        ] }),
        /* @__PURE__ */ x(
          "button",
          {
            onClick: ge,
            className: "building-ui-custom-toggle",
            children: [
              O ? "Hide" : "Show",
              " Custom Settings"
            ]
          }
        ),
        O && /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Name:" }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                value: J,
                onChange: (D) => te(D.target.value),
                placeholder: "Custom Wall Name",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ l(
                "input",
                {
                  type: "color",
                  value: ne,
                  onChange: (D) => se(D.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ l(
                "input",
                {
                  type: "text",
                  value: ne,
                  onChange: (D) => se(D.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Texture URL:" }),
            /* @__PURE__ */ l(
              "input",
              {
                type: "text",
                value: re,
                onChange: (D) => he(D.target.value),
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
                  const D = C.get(S);
                  if (D && D.frontMeshId) {
                    const I = {
                      color: ne,
                      ...re ? { mapTextureUrl: re } : {}
                    };
                    R(D.frontMeshId, {
                      ...I
                    }), D.backMeshId && R(D.backMeshId, {
                      ...I
                    }), D.sideMeshId && R(D.sideMeshId, {
                      ...I
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
                if (J) {
                  const D = `custom-wall-${Date.now()}`, I = `custom-mesh-${Date.now()}`;
                  if (B({
                    id: I,
                    color: ne,
                    material: "STANDARD",
                    ...re ? { mapTextureUrl: re } : {},
                    roughness: 0.7
                  }), E({
                    id: D,
                    name: J,
                    frontMeshId: I,
                    backMeshId: I,
                    sideMeshId: I,
                    walls: []
                  }), g) {
                    const ye = b.get(g);
                    ye && U.getState().updateWallCategory(g, {
                      wallGroupIds: [...ye.wallGroupIds, D]
                    });
                  }
                  U.setState({ selectedWallGroupId: D }), te("");
                }
              },
              className: "building-ui-create-button",
              children: "Create New Type"
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-direction-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Wall Direction:" }),
          /* @__PURE__ */ x("div", { className: "building-ui-direction-buttons", children: [
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => h(0),
                className: `building-ui-direction-button ${m === 0 ? "active" : ""}`,
                title: "North",
                children: "↑"
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => h(Math.PI / 2),
                className: `building-ui-direction-button ${m === Math.PI / 2 ? "active" : ""}`,
                title: "East",
                children: "→"
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => h(Math.PI),
                className: `building-ui-direction-button ${m === Math.PI ? "active" : ""}`,
                title: "South",
                children: "↓"
              }
            ),
            /* @__PURE__ */ l(
              "button",
              {
                onClick: () => h(Math.PI * 1.5),
                className: `building-ui-direction-button ${m === Math.PI * 1.5 ? "active" : ""}`,
                title: "West",
                children: "←"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ x("p", { children: [
            "Category: ",
            b.get(g || "")?.name
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Type: ",
            C.get(S || "")?.name
          ] }),
          /* @__PURE__ */ l("p", { children: "Use arrow keys to rotate" }),
          /* @__PURE__ */ l("p", { children: "Click to place walls" }),
          /* @__PURE__ */ l("p", { children: "Red = Occupied, Green = Available" }),
          /* @__PURE__ */ l("p", { children: "Click red boxes to delete" })
        ] })
      ] }),
      t === "npc" && /* @__PURE__ */ x(Se, { children: [
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "캐릭터:" }),
          /* @__PURE__ */ l(
            "select",
            {
              value: G || "",
              onChange: (D) => $(D.target.value),
              className: "building-ui-select",
              children: oe.map((D) => /* @__PURE__ */ l("option", { value: D.id, children: D.name }, D.id))
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "옷:" }),
          /* @__PURE__ */ x("div", { className: "building-ui-clothing-buttons", children: [
            ["rabbit-outfit", "basic-suit", "formal-suit"].map((D) => {
              const I = me.getState().clothingSets.get(D);
              return I ? /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => me.getState().setSelectedClothingSet(I.id),
                  className: `building-ui-clothing-button ${me.getState().selectedClothingSetId === I.id ? "active" : ""}`,
                  children: I.name
                },
                I.id
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
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "모자:" }),
          /* @__PURE__ */ x("div", { className: "building-ui-clothing-buttons", children: [
            ["hat-set-a", "hat-set-b", "hat-set-c"].map((D) => {
              const I = me.getState().clothingSets.get(D);
              return I ? /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => {
                    me.getState().setPreviewAccessory("hat", I.id);
                    const ye = me.getState().selectedInstanceId, Re = I.parts[0];
                    ye && Re && me.getState().updateInstancePart(ye, Re.id, Re);
                  },
                  className: `building-ui-clothing-button ${me.getState().previewAccessories.hat === I.id ? "active" : ""}`,
                  children: I.name
                },
                I.id
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
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "안경:" }),
          /* @__PURE__ */ x("div", { className: "building-ui-clothing-buttons", children: [
            ["glasses-set-a", "glasses-set-b"].map((D) => {
              const I = me.getState().clothingSets.get(D);
              return I ? /* @__PURE__ */ l(
                "button",
                {
                  onClick: () => me.getState().setPreviewAccessory("glasses", I.id),
                  className: `building-ui-clothing-button ${me.getState().previewAccessories.glasses === I.id ? "active" : ""}`,
                  children: I.name
                },
                I.id
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
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ l("span", { className: "building-ui-label", children: "Selected Instance:" }),
          /* @__PURE__ */ l("span", { className: "building-ui-info-value", children: Z || "None" })
        ] }),
        G && A.get(G) && /* @__PURE__ */ x("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ x("p", { children: [
            "현재 선택: ",
            A.get(G)?.name
          ] }),
          /* @__PURE__ */ l("p", { children: "클릭하여 NPC 배치" }),
          /* @__PURE__ */ l("p", { children: "배치된 NPC를 클릭하여 선택" })
        ] })
      ] })
    ] }) : null })
  ] }) : null;
}
function sm() {
  const n = F(() => ({
    frustum: new w.Frustum(),
    matrix: new w.Matrix4(),
    camPos: new w.Vector3()
  }), []);
  return de((e, t) => {
    const r = e.camera;
    xn().size() !== 0 && (n.matrix.multiplyMatrices(
      r.projectionMatrix,
      r.matrixWorldInverse
    ), n.frustum.setFromProjectionMatrix(n.matrix), n.camPos.copy(r.position), xn().tick({
      elapsedTime: e.clock.elapsedTime,
      delta: t,
      cameraPosition: n.camPos,
      frustum: n.frustum
    }));
  }), null;
}
function uf(n, e, t) {
  return e === t ? !0 : e < t ? n >= e && n < t : n >= e || n < t;
}
function df(n, e) {
  return n.weekdays && n.weekdays.length > 0 && !n.weekdays.includes(e.weekday) || n.seasons && n.seasons.length > 0 && !n.seasons.includes(e.season) ? !1 : uf(e.hour, n.startHour, n.endHour);
}
function ff(n, e) {
  for (const r of n.entries)
    if (df(r, e))
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
class pf {
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
    return r ? ff(r, t) : null;
  }
  all() {
    return Array.from(this.map.values());
  }
  clear() {
    this.map.clear();
  }
}
let wr = null;
function Oo() {
  return wr || (wr = new pf()), wr;
}
function am(n) {
  const [e, t] = Y(() => {
    const r = be.getState();
    return Oo().resolve(n, r.time);
  });
  return L(() => {
    let r = -1;
    const o = () => {
      const a = be.getState();
      if (a.time.hour === r) return;
      r = a.time.hour;
      const s = Oo().resolve(n, a.time);
      t(s);
    };
    return o(), be.subscribe((a, s) => {
      (a.time.hour !== s.time.hour || a.time.day !== s.time.day || a.time.weekday !== s.time.weekday) && o();
    });
  }, [n]), e;
}
export {
  ks as AnimationDebugPanel,
  Bp as AudioControls,
  um as BASIC_KART_BLUEPRINT,
  vm as BaseComponent,
  iu as Billboard,
  xm as BlueprintConverter,
  wm as BlueprintEntity,
  Sm as BlueprintFactory,
  Mm as BlueprintLoader,
  Cm as BlueprintSpawner,
  Hf as BugSpot,
  om as BuildingController,
  Bd as BuildingSystem,
  im as BuildingUI,
  fo as CATALOG_CATEGORIES,
  qi as Camera,
  _s as CameraDebugPanel,
  Es as CameraPresets,
  wp as CatalogUI,
  Fp as CharacterCreator,
  Xi as Clicker,
  km as ComponentRegistry,
  Xf as ConnectionForm,
  Sp as CraftingUI,
  Mp as CropPlot,
  $a as DAILY_FRIENDSHIP_CAP,
  hp as DialogBox,
  Ja as DialogRunner,
  Kp as DynamicFog,
  Jp as DynamicSky,
  Qp as Editor,
  _p as EventsHUD,
  dm as FIRE_MAGE_BLUEPRINT,
  ja as FRIENDSHIP_LEVELS,
  em as Fire,
  Wf as FishSpot,
  Ls as FocusableObject,
  Gp as Footprints,
  Dp as Footsteps,
  la as GaeSupProps,
  Zi as GaesupController,
  sa as GaesupWorld,
  aa as GaesupWorldContent,
  Rf as Gamepad,
  Li as Grass,
  sm as GrassDriver,
  Im as GravityForceComponent,
  eu as GridHelper,
  Ki as GroundClicker,
  dp as HotbarUI,
  qp as HouseDoor,
  Np as HousePlot,
  Ba as IndexedDBAdapter,
  Nf as Interactable,
  zf as InteractionPrompt,
  Ef as InteractionTracker,
  fp as InventoryUI,
  Op as LOCALE_LABEL,
  Da as LocalStorageAdapter,
  vp as MailboxUI,
  Ff as MiniMap,
  Lf as MinimapPlatform,
  Yo as MotionController,
  Xo as MotionDebugPanel,
  Bf as MotionUI,
  Jf as MultiplayerCanvas,
  jd as NPCSystem,
  Lp as OutfitAvatar,
  Kf as PlayerInfoOverlay,
  yp as QuestLogUI,
  ka as RemotePlayer,
  Zp as RoomPortal,
  Yp as RoomRoot,
  Xp as RoomVisibilityDriver,
  Ga as SEED_ITEMS,
  tm as Sakura,
  Eu as SakuraBatch,
  nm as Sand,
  Yu as SandBatch,
  Fa as SaveSystem,
  $p as SceneFader,
  Vp as SceneRoot,
  mp as ShopUI,
  zi as Snow,
  rm as Snowfield,
  Xu as SnowfieldBatch,
  Ko as SpeechBalloon,
  Df as Teleport,
  Pd as TileSystem,
  op as TimeHUD,
  Gf as ToastHost,
  gp as ToolUseController,
  jp as TouchControls,
  Ep as TownHUD,
  Uf as TreeObject,
  fm as V3,
  pm as V30,
  mm as V31,
  hm as WARRIOR_BLUEPRINT,
  Rd as WallSystem,
  pp as WalletHUD,
  gd as Water,
  Ip as WeatherEffect,
  kp as WeatherHUD,
  sa as World,
  sa as WorldContainer,
  Qi as applyToonToScene,
  ko as autoDetectProfile,
  gm as blueprintRegistry,
  Wl as classifyTier,
  La as createDefaultSaveSystem,
  lt as createToonMaterial,
  Qf as defaultMultiplayerConfig,
  Ul as detectCapabilities,
  zm as disposeToonGradients,
  mt as getAudioEngine,
  ut as getCropRegistry,
  Te as getDefaultToonMode,
  el as getDialogRegistry,
  Br as getEventRegistry,
  xn as getGrassManager,
  Me as getItemRegistry,
  Oo as getNPCScheduler,
  Ue as getQuestRegistry,
  Dt as getRecipeRegistry,
  ei as getSaveSystem,
  Jo as getToolEvents,
  at as getToonGradient,
  ro as isEventActive,
  fe as notify,
  Dr as profileForTier,
  Am as registerDefaultComponents,
  Cp as registerSeedCrops,
  Pp as registerSeedEvents,
  ap as registerSeedItems,
  ff as resolveSchedule,
  Bm as setDefaultToonMode,
  Up as t,
  Tm as useAirplaneBlueprint,
  zp as useAmbientBgm,
  He as useAudioStore,
  ip as useAutoSave,
  _m as useBlueprint,
  Pm as useBlueprintsByType,
  Vd as useBuildingEditor,
  U as useBuildingStore,
  ri as useCatalogStore,
  xp as useCatalogTracker,
  Rm as useCharacterBlueprint,
  We as useCharacterStore,
  Gn as useCraftingStore,
  Zo as useCurrentInteraction,
  np as useDayChange,
  Rp as useDecorationScore,
  It as useDialogStore,
  cp as useEquippedItem,
  Of as useEquippedToolKind,
  Mn as useEventsStore,
  Tp as useEventsTicker,
  Mr as useFriendshipStore,
  Pf as useGaesupController,
  pe as useGaesupStore,
  tp as useGameClock,
  _a as useGameTime,
  Oa as useHotbar,
  up as useHotbarKeyboard,
  rp as useHourChange,
  Ut as useI18nStore,
  ct as useInteractablesStore,
  Gs as useInteractionKey,
  lp as useInventory,
  ae as useInventoryStore,
  sp as useLoadOnMount,
  Hp as useLocale,
  Qt as useMailStore,
  Zf as useMultiplayer,
  jf as useNPCConnection,
  me as useNPCStore,
  Cn as useNetworkBridge,
  Vf as useNetworkGroup,
  $f as useNetworkMessage,
  qf as useNetworkStats,
  am as useNpcSchedule,
  jl as usePerfStore,
  Yf as usePlayerNetwork,
  dt as usePlayerPosition,
  Fe as usePlotStore,
  bp as useQuestObjectiveTracker,
  je as useQuestStore,
  $e as useRoomVisibilityStore,
  rt as useSceneStore,
  Jt as useShopStore,
  ym as useSpawnFromBlueprint,
  qt as useStateSystem,
  qo as useTeleport,
  ep as useTimeOfDay,
  be as useTimeStore,
  Sr as useToastStore,
  vt as useToolUse,
  et as useTownStore,
  Wp as useTranslate,
  zs as useUIConfigStore,
  Nm as useVehicleBlueprint,
  Be as useWalletStore,
  De as useWeatherStore,
  Ap as useWeatherTicker
};
