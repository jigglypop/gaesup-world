import { jsxs as x, jsx as s, Fragment as be } from "react/jsx-runtime";
import ge, { useCallback as ce, useState as le, useRef as ee, useEffect as oe, memo as Be, forwardRef as lu, useContext as To, createContext as ws, useMemo as X, useLayoutEffect as Ke, Suspense as In } from "react";
import { u as ze, H as Eo, P as xs, a as Cp, B as Np } from "./gaesupStore-x2iiDzsY.js";
import { Z as cu, ap as _s, H as uu, I as Ss, P as Va, M as du, S as fu, _ as Ip, al as We, an as Tp, G as j, K as pu, L as hu, O as Za, R as Ep, a9 as fe, aq as Ap, a6 as kp, a7 as Pp, aj as En, J as Ms, ai as ui, ar as mu, Q as Bp, e as Rp, B as Dp, y as zp, a as Fp, d as Lp, c as $p, f as Op } from "./index-DmHVuHAr.js";
import { useFrame as $e, Canvas as Hp, useThree as Li, extend as Gr } from "@react-three/fiber";
import { CapsuleCollider as ra, RigidBody as Wr, Physics as Gp, CuboidCollider as Cs } from "@react-three/rapier";
import { useStoreWithEqualityFn as Wp, createWithEqualityFn as Up } from "zustand/traditional";
import { shallow as Ae } from "zustand/shallow";
import "react-dom";
import { u as Pn } from "./assetStore-mAClONjR.js";
import { A as gu, c as aa, b as jp } from "./index-C-ViQFGa.js";
import { create as yi } from "zustand";
import { useShallow as Ns } from "zustand/react/shallow";
import { r as Vp, o as Zp, G as Yp, S as bu, h as Xp, k as Kp, f as qp, j as Qp, e as Jp, i as eh, m as th, n as nh, c as ih, v as oh } from "./loader-C3ZwumCe.js";
import { g as Ui, M as rh, W as ah } from "./index-D7BDts2W.js";
import { useGLTF as Is, useAnimations as sh, useTexture as Ts, shaderMaterial as Es, OrbitControls as lh } from "@react-three/drei";
import * as B from "three";
import { w as Ao } from "./sfe-CRsG1dTW.js";
import { enableMapSet as ch } from "immer";
import { immer as uh } from "zustand/middleware/immer";
import { SkeletonUtils as yu, Water as dh } from "three-stdlib";
import "reflect-metadata";
import { u as As } from "./weatherStore-CzG5N441.js";
import { createNoise2D as ks } from "simplex-noise";
function Xe({ label: e, min: t, max: n, step: i, value: o, suffix: r, onChange: a }) {
  return /* @__PURE__ */ x("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#fff" }, children: [
    /* @__PURE__ */ s("span", { style: { width: 60, flexShrink: 0, color: "rgba(255,255,255,0.7)" }, children: e }),
    /* @__PURE__ */ s(
      "input",
      {
        type: "range",
        min: t,
        max: n,
        step: i,
        value: o,
        onChange: (l) => a(Number(l.target.value)),
        style: { flex: 1, accentColor: "#0078d4" }
      }
    ),
    /* @__PURE__ */ x("span", { style: { width: 44, textAlign: "right", fontFamily: "monospace", fontSize: 11 }, children: [
      typeof i == "number" && i < 1 ? o.toFixed(2) : o,
      r ?? ""
    ] })
  ] });
}
function sa({ label: e, checked: t, onChange: n }) {
  return /* @__PURE__ */ x("div", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#fff" }, children: [
    /* @__PURE__ */ s("input", { type: "checkbox", checked: t, onChange: (i) => n(i.target.checked), style: { accentColor: "#0078d4" } }),
    /* @__PURE__ */ s("span", { children: e })
  ] });
}
function ji({ title: e, children: t }) {
  return /* @__PURE__ */ x("div", { style: {
    background: "rgba(0,0,0,0.2)",
    borderRadius: 6,
    padding: "8px 10px",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: 6
  }, children: [
    /* @__PURE__ */ s("div", { style: { fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 }, children: e }),
    t
  ] });
}
function fh() {
  const e = ze((a) => a.cameraOption), t = ze((a) => a.setCameraOption), n = ze((a) => a.mode), i = ce((a, l) => {
    t({ [a]: l });
  }, [t]), o = ce((a, l) => {
    t({ smoothing: { ...e.smoothing, [a]: l } });
  }, [t, e.smoothing]), r = (a) => e[a] ?? 0;
  return /* @__PURE__ */ x("div", { style: { padding: 10, display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ x("div", { style: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: -4 }, children: [
      "Mode: ",
      n.control ?? "thirdPerson"
    ] }),
    /* @__PURE__ */ x(ji, { title: "Distance", children: [
      /* @__PURE__ */ s(Xe, { label: "X", min: -50, max: 50, step: 1, value: r("xDistance"), onChange: (a) => i("xDistance", a) }),
      /* @__PURE__ */ s(Xe, { label: "Y", min: 0, max: 50, step: 1, value: r("yDistance"), onChange: (a) => i("yDistance", a) }),
      /* @__PURE__ */ s(Xe, { label: "Z", min: -50, max: 50, step: 1, value: r("zDistance"), onChange: (a) => i("zDistance", a) })
    ] }),
    /* @__PURE__ */ x(ji, { title: "FOV / Smoothing", children: [
      /* @__PURE__ */ s(Xe, { label: "FOV", min: 30, max: 120, step: 5, value: e.fov ?? 75, suffix: "deg", onChange: (a) => i("fov", a) }),
      /* @__PURE__ */ s(Xe, { label: "Pos", min: 0.01, max: 1, step: 0.01, value: e.smoothing?.position ?? 0.1, onChange: (a) => o("position", a) }),
      /* @__PURE__ */ s(Xe, { label: "Rot", min: 0.01, max: 1, step: 0.01, value: e.smoothing?.rotation ?? 0.1, onChange: (a) => o("rotation", a) }),
      /* @__PURE__ */ s(Xe, { label: "FOV Sm", min: 0.01, max: 1, step: 0.01, value: e.smoothing?.fov ?? 0.2, onChange: (a) => o("fov", a) })
    ] }),
    /* @__PURE__ */ x(ji, { title: "Zoom", children: [
      /* @__PURE__ */ s(sa, { label: "Enable Zoom", checked: e.enableZoom ?? !1, onChange: (a) => i("enableZoom", a) }),
      /* @__PURE__ */ s(Xe, { label: "Speed", min: 1e-4, max: 0.01, step: 1e-4, value: e.zoomSpeed ?? 1e-3, onChange: (a) => i("zoomSpeed", a) }),
      /* @__PURE__ */ s(Xe, { label: "Min", min: 0.1, max: 2, step: 0.1, value: e.minZoom ?? 0.5, onChange: (a) => i("minZoom", a) }),
      /* @__PURE__ */ s(Xe, { label: "Max", min: 1, max: 5, step: 0.1, value: e.maxZoom ?? 2, onChange: (a) => i("maxZoom", a) })
    ] }),
    /* @__PURE__ */ x(ji, { title: "Options", children: [
      /* @__PURE__ */ s(sa, { label: "Collision", checked: e.enableCollision ?? !1, onChange: (a) => i("enableCollision", a) }),
      /* @__PURE__ */ s(sa, { label: "Focus Mode", checked: e.enableFocus ?? !1, onChange: (a) => i("enableFocus", a) }),
      /* @__PURE__ */ s(Xe, { label: "Focus Dist", min: 1, max: 50, step: 1, value: e.focusDistance ?? 15, onChange: (a) => i("focusDistance", a) }),
      /* @__PURE__ */ s(Xe, { label: "Max Dist", min: 5, max: 100, step: 1, value: e.maxDistance ?? 50, onChange: (a) => i("maxDistance", a) })
    ] }),
    /* @__PURE__ */ x(ji, { title: "Bounds", children: [
      /* @__PURE__ */ s(Xe, { label: "Min Y", min: -10, max: 50, step: 1, value: e.bounds?.minY ?? 2, onChange: (a) => t({ bounds: { ...e.bounds, minY: a } }) }),
      /* @__PURE__ */ s(Xe, { label: "Max Y", min: 5, max: 100, step: 1, value: e.bounds?.maxY ?? 50, onChange: (a) => t({ bounds: { ...e.bounds, maxY: a } }) })
    ] })
  ] });
}
const ph = [
  { value: "thirdPerson", label: "Third Person" },
  { value: "firstPerson", label: "First Person" },
  { value: "chase", label: "Chase" },
  { value: "topDown", label: "Top Down" },
  { value: "isometric", label: "Isometric" },
  { value: "sideScroll", label: "Side-Scroller" },
  { value: "fixed", label: "Fixed" }
];
function hh() {
  const { mode: e, setMode: t } = ze(Ns((i) => ({
    mode: i.mode,
    setMode: i.setMode
  }))), n = e?.control || "thirdPerson";
  return /* @__PURE__ */ s("div", { className: "cc-panel", children: /* @__PURE__ */ s("div", { className: "cc-list", children: ph.map((i) => /* @__PURE__ */ s(
    "button",
    {
      className: `cc-button ${n === i.value ? "active" : ""}`,
      onClick: () => t({ control: i.value }),
      children: i.label
    },
    i.value
  )) }) });
}
const mh = [
  { key: "mode", label: "Mode", enabled: !0, format: "text" },
  { key: "position", label: "Position", enabled: !0, format: "vector3", precision: 2 },
  { key: "distance", label: "Distance", enabled: !0, format: "vector3", precision: 2 },
  { key: "fov", label: "FOV", enabled: !0, format: "angle", precision: 1 },
  { key: "velocity", label: "Velocity", enabled: !1, format: "vector3", precision: 2 },
  { key: "rotation", label: "Rotation", enabled: !1, format: "vector3", precision: 2 },
  { key: "zoom", label: "Zoom", enabled: !1, format: "number", precision: 2 },
  { key: "activeController", label: "Controller", enabled: !0, format: "text" }
];
function la(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = e;
  return typeof t.x == "number" && typeof t.y == "number" && typeof t.z == "number";
}
function gh() {
  const e = {
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
  }, [t, n] = le(e), i = ze((f) => f.mode), o = ze((f) => f.cameraOption), { activeState: r } = cu(), a = ee(e), l = ce((f, p) => f === p ? !1 : la(f) ? la(p) ? f.x !== p.x || f.y !== p.y || f.z !== p.z : !0 : typeof f != "object" || f === null ? !0 : JSON.stringify(f) !== JSON.stringify(p), []), c = ce((f) => la(f) ? { x: f.x, y: f.y, z: f.z } : null, []), u = ce(() => {
    const f = o?.xDistance !== void 0 && o?.yDistance !== void 0 && o?.zDistance !== void 0 ? {
      x: o.xDistance,
      y: o.yDistance,
      z: o.zDistance
    } : null, p = {
      ...a.current,
      mode: i?.control ?? "unknown",
      activeController: o?.mode ?? i?.control ?? "unknown",
      distance: f,
      fov: o?.fov ?? 0,
      position: c(r?.position),
      targetPosition: c(o?.target),
      velocity: c(r?.velocity),
      rotation: c(r?.euler),
      lastUpdateTime: Date.now(),
      ...o?.zoom !== void 0 ? { zoom: o.zoom } : {}
    };
    Object.keys(p).some(
      (w) => l(
        p[w],
        a.current[w]
      )
    ) && (a.current = p, n(p));
  }, [i, o, r, l, c]);
  oe(() => {
    u();
    const f = setInterval(u, 100);
    return () => {
      clearInterval(f);
    };
  }, [u]);
  const d = ce((f, p = 2) => f == null ? "N/A" : typeof f == "object" && f.x !== void 0 ? `X:${f.x.toFixed(p)} Y:${f.y.toFixed(p)} Z:${f.z.toFixed(p)}` : typeof f == "number" ? f.toFixed(p) : f.toString(), []);
  return /* @__PURE__ */ s("div", { className: "cd-panel", children: /* @__PURE__ */ s("div", { className: "cd-grid", children: mh.map((f) => /* @__PURE__ */ x("div", { className: "cd-item", children: [
    /* @__PURE__ */ s("span", { className: "cd-label", children: f.label }),
    /* @__PURE__ */ s("span", { className: "cd-value", children: d(t[f.key]) })
  ] }, f.key)) }) });
}
const bh = [
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
function yh(e, t) {
  return !e || !t ? !1 : e.x === t.x && e.y === t.y && e.z === t.z;
}
function vh(e) {
  const t = e?.xDistance, n = e?.yDistance, i = e?.zDistance;
  if (!(t === void 0 || n === void 0 || i === void 0))
    return { x: t, y: n, z: i };
}
function wh() {
  const [e] = le(bh), t = ze((c) => c.setMode), n = ze((c) => c.setCameraOption), i = ze((c) => c.mode), o = ze((c) => c.cameraOption), [r, a] = le(null), l = ce((c) => {
    t({ control: c.config.mode }), n({
      xDistance: c.config.distance.x,
      yDistance: c.config.distance.y,
      zDistance: c.config.distance.z,
      fov: c.config.fov,
      smoothing: c.config.smoothing || { position: 0.1, rotation: 0.1, fov: 0.1 }
    });
  }, [t, n, o]);
  return oe(() => {
    const c = e.find(
      (u) => u.config.mode === i?.control && yh(u.config.distance, vh(o))
    );
    a(c ? c.id : null);
  }, [i, o, e]), /* @__PURE__ */ s("div", { className: "cp-panel", children: /* @__PURE__ */ s("div", { className: "cp-grid", children: e.map((c) => /* @__PURE__ */ x(
    "button",
    {
      className: `cp-item ${r === c.id ? "active" : ""}`,
      onClick: () => l(c),
      children: [
        /* @__PURE__ */ s("div", { className: "cp-name", children: c.name }),
        /* @__PURE__ */ s("div", { className: "cp-description", children: c.description })
      ]
    },
    c.id
  )) }) });
}
function xh({ className: e = "", style: t, children: n } = {}) {
  const [i, o] = le("Settings"), r = () => {
    switch (i) {
      case "Settings":
        return /* @__PURE__ */ s(fh, {});
      case "Controller":
        return /* @__PURE__ */ s(hh, {});
      case "Presets":
        return /* @__PURE__ */ s(wh, {});
      case "Debug":
        return /* @__PURE__ */ s(gh, {});
      default:
        return null;
    }
  };
  return /* @__PURE__ */ x("div", { className: `tabbed-panel ${e}`, style: t, children: [
    /* @__PURE__ */ x("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ s("button", { className: `panel-tab ${i === "Settings" ? "active" : ""}`, onClick: () => o("Settings"), children: "Settings" }),
      /* @__PURE__ */ s("button", { className: `panel-tab ${i === "Controller" ? "active" : ""}`, onClick: () => o("Controller"), children: "Controller" }),
      /* @__PURE__ */ s("button", { className: `panel-tab ${i === "Presets" ? "active" : ""}`, onClick: () => o("Presets"), children: "Presets" }),
      /* @__PURE__ */ s("button", { className: `panel-tab ${i === "Debug" ? "active" : ""}`, onClick: () => o("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ x("div", { className: "panel-tab-content", children: [
      r(),
      n
    ] })
  ] });
}
const _h = [
  { value: "idle", label: "Idle" },
  { value: "walk", label: "Walk" },
  { value: "run", label: "Run" },
  { value: "jump", label: "Jump" },
  { value: "fall", label: "Fall" },
  { value: "dance", label: "Dance" },
  { value: "wave", label: "Wave" }
];
function Sh() {
  const { playAnimation: e, currentType: t, currentAnimation: n } = _s(), i = (o) => {
    e(t, o);
  };
  return /* @__PURE__ */ s("div", { className: "ac-panel", children: /* @__PURE__ */ s("div", { className: "ac-grid", children: _h.map((o) => /* @__PURE__ */ s(
    "button",
    {
      className: `ac-button ${o.value === n ? "active" : ""}`,
      onClick: () => i(o.value),
      title: o.label,
      children: o.label
    },
    o.value
  )) }) });
}
const Mh = [
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
function Ch() {
  const { bridge: e, currentType: t } = _s(), [n, i] = le({
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
  oe(() => {
    if (!e) return;
    const a = () => {
      const c = e.snapshot(t);
      if (!c) return;
      const u = e.getMetrics(t);
      i((d) => ({
        ...d,
        currentAnimation: c.currentAnimation,
        animationType: t,
        availableAnimations: c.availableAnimations,
        isPlaying: c.isPlaying,
        weight: c.weight,
        speed: c.speed,
        activeActions: c.metrics.activeAnimations,
        frameCount: u?.totalActions || 0,
        averageFrameTime: u?.mixerTime || 0,
        lastUpdateTime: Date.now()
      }));
    };
    return a(), e.subscribe((c, u) => {
      u === t && a();
    });
  }, [e, t]);
  const o = (a, l, c = 2) => {
    if (a == null) return "N/A";
    switch (l) {
      case "array":
        return Array.isArray(a) ? `${a.length} animations` : String(a);
      case "boolean":
        return a ? "Yes" : "No";
      case "number":
        return typeof a == "number" ? a.toFixed(c) : String(a);
      default:
        return String(a);
    }
  }, r = (a) => {
    if (a in n)
      return n[a];
  };
  return /* @__PURE__ */ s("div", { className: "ad-panel", children: /* @__PURE__ */ s("div", { className: "ad-content", children: Mh.filter((a) => a.enabled).map((a) => /* @__PURE__ */ x("div", { className: "ad-item", children: [
    /* @__PURE__ */ s("span", { className: "ad-label", children: a.label }),
    /* @__PURE__ */ s("span", { className: "ad-value", children: o(r(a.key), a.format) })
  ] }, a.key)) }) });
}
const Nh = () => /* @__PURE__ */ s("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ s("path", { d: "M8 5v14l11-7z" }) }), Ih = () => /* @__PURE__ */ s("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ s("path", { d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z" }) }), Th = () => /* @__PURE__ */ s("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ s("path", { d: "M6 6h2v12H6zm3.5 6l8.5 6V6z" }) }), Eh = () => /* @__PURE__ */ s("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ s("path", { d: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" }) });
function Ah() {
  const { bridge: e, playAnimation: t, stopAnimation: n, currentType: i, currentAnimation: o } = _s(), [r, a] = le(!1), [l, c] = le([]), [u, d] = le(30);
  oe(() => {
    if (!e) return;
    const p = () => {
      const w = e.snapshot(i);
      w && (a(w.isPlaying), c(w.availableAnimations));
    };
    return p(), e.subscribe((w, g) => {
      g === i && p();
    });
  }, [e, i]);
  const f = () => {
    r ? n(i) : t(i, o);
  };
  return /* @__PURE__ */ x("div", { className: "ap-panel", children: [
    /* @__PURE__ */ x("div", { className: "ap-controls", children: [
      /* @__PURE__ */ s(
        "select",
        {
          className: "ap-select",
          value: o,
          onChange: (p) => t(i, p.target.value),
          children: l.map((p) => /* @__PURE__ */ s("option", { value: p, children: p }, p))
        }
      ),
      /* @__PURE__ */ x("div", { className: "ap-buttons", children: [
        /* @__PURE__ */ s("button", { className: "ap-btn", "aria-label": "previous animation", children: /* @__PURE__ */ s(Th, {}) }),
        /* @__PURE__ */ s("button", { className: "ap-btn-primary", onClick: f, "aria-label": r ? "pause" : "play", children: r ? /* @__PURE__ */ s(Ih, {}) : /* @__PURE__ */ s(Nh, {}) }),
        /* @__PURE__ */ s("button", { className: "ap-btn", "aria-label": "next animation", children: /* @__PURE__ */ s(Eh, {}) })
      ] })
    ] }),
    /* @__PURE__ */ x("div", { className: "ap-timeline", children: [
      /* @__PURE__ */ s("span", { className: "ap-time", children: "0:00" }),
      /* @__PURE__ */ s(
        "input",
        {
          type: "range",
          className: "ap-slider",
          min: "0",
          max: "100",
          value: u,
          onChange: (p) => d(Number(p.target.value))
        }
      ),
      /* @__PURE__ */ s("span", { className: "ap-time", children: "1:30" })
    ] })
  ] });
}
function kh({ className: e = "", style: t, children: n } = {}) {
  const [i, o] = le("Player"), r = () => {
    switch (i) {
      case "Player":
        return /* @__PURE__ */ s("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ s(Ah, {}) });
      case "Controller":
        return /* @__PURE__ */ s("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ s(Sh, {}) });
      case "Debug":
        return /* @__PURE__ */ s("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ s(Ch, {}) });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ x("div", { className: `tabbed-panel ${e}`, style: t, children: [
    /* @__PURE__ */ x("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ s("button", { className: `panel-tab ${i === "Player" ? "active" : ""}`, onClick: () => o("Player"), children: "Player" }),
      /* @__PURE__ */ s("button", { className: `panel-tab ${i === "Controller" ? "active" : ""}`, onClick: () => o("Controller"), children: "Controller" }),
      /* @__PURE__ */ s("button", { className: `panel-tab ${i === "Debug" ? "active" : ""}`, onClick: () => o("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ x("div", { className: "panel-tab-content", children: [
      r(),
      n
    ] })
  ] });
}
const yl = [
  { id: "slow", name: "Slow", maxSpeed: 5, acceleration: 8 },
  { id: "normal", name: "Normal", maxSpeed: 10, acceleration: 15 },
  { id: "fast", name: "Fast", maxSpeed: 20, acceleration: 25 },
  { id: "sprint", name: "Sprint", maxSpeed: 35, acceleration: 40 }
], vl = [
  { id: "eco", name: "Eco", maxSpeed: 15, acceleration: 10 },
  { id: "comfort", name: "Comfort", maxSpeed: 25, acceleration: 20 },
  { id: "sport", name: "Sport", maxSpeed: 40, acceleration: 35 },
  { id: "turbo", name: "Turbo", maxSpeed: 60, acceleration: 50 }
];
function Ph(e, t) {
  const n = e ?? "bottom-left", i = {
    position: "fixed",
    zIndex: t ?? 1e4
  };
  return n.includes("top") && (i.top = 12), n.includes("bottom") && (i.bottom = 12), n.includes("left") && (i.left = 12), n.includes("right") && (i.right = 12), i;
}
function Bh(e) {
  const t = Ph(e.position, e.zIndex), n = ze((p) => p.mode), i = ze((p) => p.setMode), o = ze((p) => p.setPhysics), r = n?.type === "vehicle" ? "vehicle" : "character", a = r === "vehicle" ? vl : yl, [l, c] = le(
    r === "vehicle" ? "comfort" : "normal"
  ), u = ce(
    (p, h) => {
      const g = (p === "vehicle" ? vl : yl).find((_) => _.id === h);
      if (g) {
        if (p === "vehicle") {
          o({ maxSpeed: g.maxSpeed, accelRatio: g.acceleration });
          return;
        }
        o({
          walkSpeed: Math.max(1, g.maxSpeed * 0.5),
          runSpeed: g.maxSpeed,
          accelRatio: g.acceleration
        });
      }
    },
    [o]
  ), d = ce((p) => {
    c(p), u(r, p), e.onPresetChange?.(p);
  }, [u, r, e]), f = ce((p) => {
    const h = p.target.value;
    i({ type: h });
    const w = h === "vehicle" ? "comfort" : "normal";
    c(w), u(h, w), e.onPresetChange?.(w);
  }, [u, i, e]);
  return /* @__PURE__ */ x("div", { className: `mc-panel ${e.compact ? "compact" : ""}`, style: t, children: [
    /* @__PURE__ */ x("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ s("label", { htmlFor: "motion-type-select", className: "mc-label", children: "Motion Type" }),
      /* @__PURE__ */ x(
        "select",
        {
          id: "motion-type-select",
          className: "mc-select",
          value: r,
          onChange: f,
          children: [
            /* @__PURE__ */ s("option", { value: "character", children: "Character" }),
            /* @__PURE__ */ s("option", { value: "vehicle", children: "Vehicle" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ x("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ s("label", { className: "mc-label", children: "Presets" }),
      /* @__PURE__ */ s("div", { className: "mc-presets-grid", children: a.map((p) => /* @__PURE__ */ s(
        "button",
        {
          className: `mc-preset-btn ${p.id === l ? "active" : ""}`,
          onClick: () => d(p.id),
          title: `Max Speed: ${p.maxSpeed}, Accel: ${p.acceleration}`,
          children: p.name
        },
        p.id
      )) })
    ] })
  ] });
}
const wl = [
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
function Rh(e, t) {
  const n = e ?? "top-right", i = {
    position: "fixed",
    zIndex: t ?? 1e4
  };
  return n.includes("top") && (i.top = 12), n.includes("bottom") && (i.bottom = 12), n.includes("left") && (i.left = 12), n.includes("right") && (i.right = 12), i;
}
function Dh(e) {
  const t = e.embedded ? {} : Rh(e.position, e.zIndex), n = ze((d) => d.mode), i = ze((d) => d.physics), { activeState: o, gameStates: r } = cu(), a = e.precision ?? 2, l = e.customFields ? [...wl, ...e.customFields] : wl, c = (d, f, p = 2) => {
    if (f == null) return "N/A";
    switch (d.type) {
      case "vector3":
        if (Array.isArray(f) && f.length === 3) {
          const [h, w, g] = f;
          return `X:${h.toFixed(p)} Y:${w.toFixed(p)} Z:${g.toFixed(p)}`;
        }
        if (typeof f == "object" && f !== null && "x" in f && "y" in f && "z" in f) {
          const h = f;
          return `X:${h.x.toFixed(p)} Y:${h.y.toFixed(p)} Z:${h.z.toFixed(p)}`;
        }
        return String(f);
      case "number":
        return typeof f == "number" ? f.toFixed(p) : String(f);
      default:
        return String(f);
    }
  }, u = (d) => {
    if (d.value !== void 0) return d.value;
    switch (d.key) {
      case "motionType":
        return n?.type ?? "character";
      case "position":
        return o?.position ? { x: o.position.x, y: o.position.y, z: o.position.z } : { x: 0, y: 0, z: 0 };
      case "velocity":
        return o?.velocity ? { x: o.velocity.x, y: o.velocity.y, z: o.velocity.z } : { x: 0, y: 0, z: 0 };
      case "speed":
        return o?.velocity ? o.velocity.length() : 0;
      case "direction":
        return o?.direction ? { x: o.direction.x, y: o.direction.y, z: o.direction.z } : { x: 0, y: 0, z: 0 };
      case "isGrounded":
        return r?.isOnTheGround ? "Yes" : "No";
      case "isMoving":
        return r?.isMoving ? "Yes" : "No";
      case "acceleration":
        return i?.accelRatio ?? 0;
      case "jumpForce":
        return i?.jumpSpeed ?? 0;
      case "maxSpeed":
        return n?.type === "character" ? i?.runSpeed ?? 0 : i?.maxSpeed ?? 0;
      case "totalDistance":
        return 0;
      case "gameState":
        return r?.isRiding ? "riding" : r?.isOnTheGround ? "ground" : "air";
      default:
        return null;
    }
  };
  return /* @__PURE__ */ s(
    "div",
    {
      className: `md-panel ${e.compact ? "compact" : ""} ${e.theme ? `theme-${e.theme}` : ""}`,
      style: t,
      children: /* @__PURE__ */ s("div", { className: "md-content", children: l.map((d) => /* @__PURE__ */ x("div", { className: "md-item", children: [
        /* @__PURE__ */ s("span", { className: "md-label", children: d.label }),
        /* @__PURE__ */ s("span", { className: "md-value", children: c(d, u(d), a) })
      ] }, d.key)) })
    }
  );
}
function zh({ className: e = "", style: t, children: n } = {}) {
  const [i, o] = le("Controller"), r = () => {
    switch (i) {
      case "Controller":
        return /* @__PURE__ */ s("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ s(Bh, {}) });
      case "Debug":
        return /* @__PURE__ */ s("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ s(Dh, { embedded: !0 }) });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ x("div", { className: `tabbed-panel ${e}`, style: t, children: [
    /* @__PURE__ */ x("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ s("button", { className: `panel-tab ${i === "Controller" ? "active" : ""}`, onClick: () => o("Controller"), children: "Controller" }),
      /* @__PURE__ */ s("button", { className: `panel-tab ${i === "Debug" ? "active" : ""}`, onClick: () => o("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ x("div", { className: "panel-tab-content", children: [
      r(),
      n
    ] })
  ] });
}
const Oo = 60, Ho = ({ data: e, color: t, max: n, warn: i }) => {
  const r = e.filter((c) => isFinite(c));
  if (r.length < 2) return null;
  const a = Math.max(1, n), l = r.map((c, u) => {
    const d = u / (r.length - 1) * 100, f = 40 - c / a * 40;
    return `${u === 0 ? "M" : "L"}${d.toFixed(2)},${f.toFixed(2)}`;
  }).join(" ");
  return /* @__PURE__ */ s("div", { className: "perf-chart", children: /* @__PURE__ */ x("svg", { width: "100%", height: 40, preserveAspectRatio: "none", viewBox: "0 0 100 40", children: [
    i !== void 0 && /* @__PURE__ */ s(
      "line",
      {
        x1: "0",
        y1: 40 - i / a * 40,
        x2: "100",
        y2: 40 - i / a * 40,
        stroke: "#facc15",
        strokeWidth: "0.5",
        strokeDasharray: "3,3",
        opacity: 0.5
      }
    ),
    /* @__PURE__ */ s("path", { d: l, fill: "none", stroke: t, strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" })
  ] }) });
}, ca = ({ value: e, max: t, color: n, label: i }) => {
  const o = t > 0 ? Math.min(100, e / t * 100) : 0;
  return /* @__PURE__ */ x("div", { style: { marginBottom: 4 }, children: [
    /* @__PURE__ */ x("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }, children: [
      /* @__PURE__ */ s("span", { className: "perf-label", children: i }),
      /* @__PURE__ */ s("span", { children: e.toFixed(1) })
    ] }),
    /* @__PURE__ */ s("div", { style: { height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }, children: /* @__PURE__ */ s("div", { style: { width: `${o}%`, height: "100%", background: n, borderRadius: 2, transition: "width 0.3s" } }) })
  ] });
};
function Fh({ className: e = "", style: t, children: n } = {}) {
  const i = ze(Ns((R) => R.performance)), [o, r] = le({ current: 0, min: 1 / 0, max: 0, avg: 0, p1Low: 0, history: Array(Oo).fill(0) }), [a, l] = le({ used: 0, limit: 0, history: Array(Oo).fill(0) }), [c, u] = le(0), [d, f] = le(Array(Oo).fill(0)), [p, h] = le(Array(Oo).fill(0)), w = ee(0), g = ee(0), _ = ee(0), b = ee([]), S = ee(0), m = ee(null), y = ee(0), v = ee(0), C = ee(0), T = ce((R) => {
    if (R.length < 5) return 0;
    const L = [...R].filter((U) => U > 0).sort((U, V) => U - V), M = Math.max(1, Math.floor(L.length * 0.01));
    let F = 0;
    for (let U = 0; U < M; U++) F += L[U] ?? 0;
    return F / M;
  }, []);
  oe(() => {
    const R = window.performance.now();
    w.current = R, g.current = R, S.current = R;
    const L = (M) => {
      const F = M - g.current;
      if (g.current = M, b.current.push(F), b.current.length > 300 && b.current.shift(), y.current += F, v.current++, v.current >= 10) {
        const U = y.current / v.current;
        u(U), h((V) => [...V.slice(1), U]), y.current = 0, v.current = 0;
      }
      if (_.current++, M - w.current >= 500) {
        const U = _.current * 1e3 / (M - w.current), V = b.current.map((J) => J > 0 ? 1e3 / J : 0), Y = M - S.current > 3e3;
        r((J) => {
          const q = [...J.history.slice(1), U], A = Y ? Math.min(J.min === 1 / 0 ? U : J.min, U) : 1 / 0, N = Y ? Math.max(J.max, U) : 0, W = Y ? q.filter((ne) => ne > 0) : [], K = W.length > 0 ? W.reduce((ne, re) => ne + re, 0) / W.length : U, Q = Y ? T(V) : U;
          return { current: U, min: A, max: N, avg: K, p1Low: Q, history: q };
        });
        const Z = window.performance.memory;
        Z && l((J) => {
          const q = Math.round(Z.usedJSHeapSize / 1048576), A = Math.round(Z.jsHeapSizeLimit / 1048576);
          return { used: q, limit: A, history: [...J.history.slice(1), q] };
        }), w.current = M, _.current = 0;
      }
      m.current = requestAnimationFrame(L);
    };
    return m.current = requestAnimationFrame(L), () => {
      m.current && cancelAnimationFrame(m.current);
    };
  }, [T]), oe(() => {
    const R = i.render.calls;
    R !== C.current && (C.current = R, f((L) => [...L.slice(1), R]));
  }, [i.render.calls]);
  const P = (R) => R >= 55 ? "#4ade80" : R >= 30 ? "#facc15" : "#f87171", D = (R) => R <= 16.7 ? "#4ade80" : R <= 33.3 ? "#facc15" : "#f87171", O = (R) => R <= 100 ? "#4ade80" : R <= 300 ? "#facc15" : "#f87171", z = (R, L) => {
    const M = L > 0 ? R / L * 100 : 0;
    return M < 60 ? "#4ade80" : M < 80 ? "#facc15" : "#f87171";
  }, E = i.render.triangles, G = i.render.calls, I = i.engine.geometries, $ = i.engine.textures;
  return /* @__PURE__ */ x("div", { className: `perf-panel ${e}`, style: t, children: [
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ x("div", { className: "perf-header", children: [
        /* @__PURE__ */ s("h4", { className: "perf-title", children: "Frame Rate" }),
        /* @__PURE__ */ x("span", { className: "perf-current", style: { color: P(o.current) }, children: [
          o.current.toFixed(0),
          " FPS"
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Avg" }),
          o.avg.toFixed(1)
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Min" }),
          isFinite(o.min) ? o.min.toFixed(1) : "..."
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Max" }),
          o.max.toFixed(1)
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "1% Low" }),
          /* @__PURE__ */ s("span", { style: { color: P(o.p1Low) }, children: o.p1Low.toFixed(1) })
        ] })
      ] }),
      /* @__PURE__ */ s(Ho, { data: o.history, color: P(o.current), max: 90, warn: 60 })
    ] }),
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ x("div", { className: "perf-header", children: [
        /* @__PURE__ */ s("h4", { className: "perf-title", children: "Frame Time" }),
        /* @__PURE__ */ x("span", { className: "perf-current", style: { color: D(c) }, children: [
          c.toFixed(2),
          " ms"
        ] })
      ] }),
      /* @__PURE__ */ s(ca, { value: c, max: 33.3, color: D(c), label: "Budget (16.7ms)" }),
      /* @__PURE__ */ s(Ho, { data: p, color: D(c), max: 33.3, warn: 16.7 })
    ] }),
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ x("div", { className: "perf-header", children: [
        /* @__PURE__ */ s("h4", { className: "perf-title", children: "GPU Pipeline" }),
        /* @__PURE__ */ x("span", { className: "perf-current", style: { color: O(G) }, children: [
          G,
          " calls"
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Triangles" }),
          E >= 1e6 ? (E / 1e6).toFixed(2) + "M" : E >= 1e3 ? (E / 1e3).toFixed(1) + "K" : E
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Draw Calls" }),
          /* @__PURE__ */ s("span", { style: { color: O(G) }, children: G })
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Tri/Call" }),
          G > 0 ? Math.round(E / G) : 0
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Points" }),
          i.render.points
        ] })
      ] }),
      /* @__PURE__ */ s(Ho, { data: d, color: O(G), max: Math.max(200, ...d) })
    ] }),
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ s("div", { className: "perf-header", children: /* @__PURE__ */ s("h4", { className: "perf-title", children: "Resources" }) }),
      /* @__PURE__ */ x("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Geometries" }),
          I
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Textures" }),
          $
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Programs" }),
          i.engine.programs
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Lines" }),
          i.render.lines
        ] })
      ] }),
      /* @__PURE__ */ s(ca, { value: I, max: 200, color: I > 150 ? "#f87171" : "#4ade80", label: "Geometry Budget" }),
      /* @__PURE__ */ s(ca, { value: $, max: 100, color: $ > 80 ? "#f87171" : "#4ade80", label: "Texture Budget" })
    ] }),
    /* @__PURE__ */ x("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ x("div", { className: "perf-header", children: [
        /* @__PURE__ */ s("h4", { className: "perf-title", children: "Memory" }),
        /* @__PURE__ */ x("span", { className: "perf-current", style: { color: z(a.used, a.limit) }, children: [
          a.used,
          " MB"
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Limit" }),
          a.limit,
          " MB"
        ] }),
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("span", { className: "perf-label", children: "Usage" }),
          a.limit > 0 ? (a.used / a.limit * 100).toFixed(0) : 0,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ s(Ho, { data: a.history, color: z(a.used, a.limit), max: a.limit || 1 })
    ] }),
    n
  ] });
}
const Lh = ({ className: e = "", style: t, children: n }) => {
  const i = ze((l) => l.mode), o = ze((l) => l.setMode), r = (l) => {
    o({
      type: l,
      controller: "keyboard",
      control: l === "airplane" || l === "vehicle" ? "chase" : "thirdPerson"
    });
  }, a = [
    { type: "character", label: "Character", description: "Walk around as character" },
    { type: "vehicle", label: "Vehicle", description: "Drive a ground vehicle" },
    { type: "airplane", label: "Airplane", description: "Fly an airplane" }
  ];
  return /* @__PURE__ */ x("div", { className: `vehicle-panel ${e}`, style: t, children: [
    /* @__PURE__ */ s("div", { className: "vehicle-panel__modes", children: a.map((l) => /* @__PURE__ */ x(
      "button",
      {
        className: `vehicle-panel__mode-button ${i.type === l.type ? "vehicle-panel__mode-button--active" : ""}`,
        onClick: () => r(l.type),
        children: [
          /* @__PURE__ */ s("span", { className: "vehicle-panel__mode-label", children: l.label }),
          /* @__PURE__ */ s("span", { className: "vehicle-panel__mode-description", children: l.description })
        ]
      },
      l.type
    )) }),
    /* @__PURE__ */ x("div", { className: "vehicle-panel__info", children: [
      /* @__PURE__ */ x("div", { className: "vehicle-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "vehicle-panel__info-label", children: "Current Mode:" }),
        /* @__PURE__ */ s("span", { className: "vehicle-panel__info-value", children: i.type })
      ] }),
      /* @__PURE__ */ x("div", { className: "vehicle-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "vehicle-panel__info-label", children: "Controls:" }),
        /* @__PURE__ */ s("span", { className: "vehicle-panel__info-value", children: i.type === "airplane" ? "WASD + Space/Shift" : "WASD + Space" })
      ] })
    ] }),
    n
  ] });
};
function Fe(e) {
  if (typeof e == "string" || typeof e == "number") return "" + e;
  let t = "";
  if (Array.isArray(e))
    for (let n = 0, i; n < e.length; n++)
      (i = Fe(e[n])) !== "" && (t += (t && " ") + i);
  else
    for (let n in e)
      e[n] && (t += (t && " ") + n);
  return t;
}
var $h = { value: () => {
} };
function Ur() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new fr(n);
}
function fr(e) {
  this._ = e;
}
function Oh(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", o = n.indexOf(".");
    if (o >= 0 && (i = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
fr.prototype = Ur.prototype = {
  constructor: fr,
  on: function(e, t) {
    var n = this._, i = Oh(e + "", n), o, r = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++r < a; ) if ((o = (e = i[r]).type) && (o = Hh(n[o], e.name))) return o;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++r < a; )
      if (o = (e = i[r]).type) n[o] = xl(n[o], e.name, t);
      else if (t == null) for (o in n) n[o] = xl(n[o], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new fr(e);
  },
  call: function(e, t) {
    if ((o = arguments.length - 2) > 0) for (var n = new Array(o), i = 0, o, r; i < o; ++i) n[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (r = this._[e], i = 0, o = r.length; i < o; ++i) r[i].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (var i = this._[e], o = 0, r = i.length; o < r; ++o) i[o].value.apply(t, n);
  }
};
function Hh(e, t) {
  for (var n = 0, i = e.length, o; n < i; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function xl(e, t, n) {
  for (var i = 0, o = e.length; i < o; ++i)
    if (e[i].name === t) {
      e[i] = $h, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var Ya = "http://www.w3.org/1999/xhtml";
const _l = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: Ya,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function jr(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), _l.hasOwnProperty(t) ? { space: _l[t], local: e } : e;
}
function Gh(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === Ya && t.documentElement.namespaceURI === Ya ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function Wh(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function vu(e) {
  var t = jr(e);
  return (t.local ? Wh : Gh)(t);
}
function Uh() {
}
function Ps(e) {
  return e == null ? Uh : function() {
    return this.querySelector(e);
  };
}
function jh(e) {
  typeof e != "function" && (e = Ps(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, l = i[o] = new Array(a), c, u, d = 0; d < a; ++d)
      (c = r[d]) && (u = e.call(c, c.__data__, d, r)) && ("__data__" in c && (u.__data__ = c.__data__), l[d] = u);
  return new tt(i, this._parents);
}
function Vh(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function Zh() {
  return [];
}
function wu(e) {
  return e == null ? Zh : function() {
    return this.querySelectorAll(e);
  };
}
function Yh(e) {
  return function() {
    return Vh(e.apply(this, arguments));
  };
}
function Xh(e) {
  typeof e == "function" ? e = Yh(e) : e = wu(e);
  for (var t = this._groups, n = t.length, i = [], o = [], r = 0; r < n; ++r)
    for (var a = t[r], l = a.length, c, u = 0; u < l; ++u)
      (c = a[u]) && (i.push(e.call(c, c.__data__, u, a)), o.push(c));
  return new tt(i, o);
}
function xu(e) {
  return function() {
    return this.matches(e);
  };
}
function _u(e) {
  return function(t) {
    return t.matches(e);
  };
}
var Kh = Array.prototype.find;
function qh(e) {
  return function() {
    return Kh.call(this.children, e);
  };
}
function Qh() {
  return this.firstElementChild;
}
function Jh(e) {
  return this.select(e == null ? Qh : qh(typeof e == "function" ? e : _u(e)));
}
var em = Array.prototype.filter;
function tm() {
  return Array.from(this.children);
}
function nm(e) {
  return function() {
    return em.call(this.children, e);
  };
}
function im(e) {
  return this.selectAll(e == null ? tm : nm(typeof e == "function" ? e : _u(e)));
}
function om(e) {
  typeof e != "function" && (e = xu(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, l = i[o] = [], c, u = 0; u < a; ++u)
      (c = r[u]) && e.call(c, c.__data__, u, r) && l.push(c);
  return new tt(i, this._parents);
}
function Su(e) {
  return new Array(e.length);
}
function rm() {
  return new tt(this._enter || this._groups.map(Su), this._parents);
}
function vr(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
vr.prototype = {
  constructor: vr,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function am(e) {
  return function() {
    return e;
  };
}
function sm(e, t, n, i, o, r) {
  for (var a = 0, l, c = t.length, u = r.length; a < u; ++a)
    (l = t[a]) ? (l.__data__ = r[a], i[a] = l) : n[a] = new vr(e, r[a]);
  for (; a < c; ++a)
    (l = t[a]) && (o[a] = l);
}
function lm(e, t, n, i, o, r, a) {
  var l, c, u = /* @__PURE__ */ new Map(), d = t.length, f = r.length, p = new Array(d), h;
  for (l = 0; l < d; ++l)
    (c = t[l]) && (p[l] = h = a.call(c, c.__data__, l, t) + "", u.has(h) ? o[l] = c : u.set(h, c));
  for (l = 0; l < f; ++l)
    h = a.call(e, r[l], l, r) + "", (c = u.get(h)) ? (i[l] = c, c.__data__ = r[l], u.delete(h)) : n[l] = new vr(e, r[l]);
  for (l = 0; l < d; ++l)
    (c = t[l]) && u.get(p[l]) === c && (o[l] = c);
}
function cm(e) {
  return e.__data__;
}
function um(e, t) {
  if (!arguments.length) return Array.from(this, cm);
  var n = t ? lm : sm, i = this._parents, o = this._groups;
  typeof e != "function" && (e = am(e));
  for (var r = o.length, a = new Array(r), l = new Array(r), c = new Array(r), u = 0; u < r; ++u) {
    var d = i[u], f = o[u], p = f.length, h = dm(e.call(d, d && d.__data__, u, i)), w = h.length, g = l[u] = new Array(w), _ = a[u] = new Array(w), b = c[u] = new Array(p);
    n(d, f, g, _, b, h, t);
    for (var S = 0, m = 0, y, v; S < w; ++S)
      if (y = g[S]) {
        for (S >= m && (m = S + 1); !(v = _[m]) && ++m < w; ) ;
        y._next = v || null;
      }
  }
  return a = new tt(a, i), a._enter = l, a._exit = c, a;
}
function dm(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function fm() {
  return new tt(this._exit || this._groups.map(Su), this._parents);
}
function pm(e, t, n) {
  var i = this.enter(), o = this, r = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? r.remove() : n(r), i && o ? i.merge(o).order() : o;
}
function hm(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, o = n.length, r = i.length, a = Math.min(o, r), l = new Array(o), c = 0; c < a; ++c)
    for (var u = n[c], d = i[c], f = u.length, p = l[c] = new Array(f), h, w = 0; w < f; ++w)
      (h = u[w] || d[w]) && (p[w] = h);
  for (; c < o; ++c)
    l[c] = n[c];
  return new tt(l, this._parents);
}
function mm() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], o = i.length - 1, r = i[o], a; --o >= 0; )
      (a = i[o]) && (r && a.compareDocumentPosition(r) ^ 4 && r.parentNode.insertBefore(a, r), r = a);
  return this;
}
function gm(e) {
  e || (e = bm);
  function t(f, p) {
    return f && p ? e(f.__data__, p.__data__) : !f - !p;
  }
  for (var n = this._groups, i = n.length, o = new Array(i), r = 0; r < i; ++r) {
    for (var a = n[r], l = a.length, c = o[r] = new Array(l), u, d = 0; d < l; ++d)
      (u = a[d]) && (c[d] = u);
    c.sort(t);
  }
  return new tt(o, this._parents).order();
}
function bm(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function ym() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function vm() {
  return Array.from(this);
}
function wm() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length; o < r; ++o) {
      var a = i[o];
      if (a) return a;
    }
  return null;
}
function xm() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function _m() {
  return !this.node();
}
function Sm(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var o = t[n], r = 0, a = o.length, l; r < a; ++r)
      (l = o[r]) && e.call(l, l.__data__, r, o);
  return this;
}
function Mm(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Cm(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function Nm(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function Im(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function Tm(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function Em(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function Am(e, t) {
  var n = jr(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? Cm : Mm : typeof t == "function" ? n.local ? Em : Tm : n.local ? Im : Nm)(n, t));
}
function Mu(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function km(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Pm(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function Bm(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function Rm(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? km : typeof t == "function" ? Bm : Pm)(e, t, n ?? "")) : ki(this.node(), e);
}
function ki(e, t) {
  return e.style.getPropertyValue(t) || Mu(e).getComputedStyle(e, null).getPropertyValue(t);
}
function Dm(e) {
  return function() {
    delete this[e];
  };
}
function zm(e, t) {
  return function() {
    this[e] = t;
  };
}
function Fm(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function Lm(e, t) {
  return arguments.length > 1 ? this.each((t == null ? Dm : typeof t == "function" ? Fm : zm)(e, t)) : this.node()[e];
}
function Cu(e) {
  return e.trim().split(/^|\s+/);
}
function Bs(e) {
  return e.classList || new Nu(e);
}
function Nu(e) {
  this._node = e, this._names = Cu(e.getAttribute("class") || "");
}
Nu.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function Iu(e, t) {
  for (var n = Bs(e), i = -1, o = t.length; ++i < o; ) n.add(t[i]);
}
function Tu(e, t) {
  for (var n = Bs(e), i = -1, o = t.length; ++i < o; ) n.remove(t[i]);
}
function $m(e) {
  return function() {
    Iu(this, e);
  };
}
function Om(e) {
  return function() {
    Tu(this, e);
  };
}
function Hm(e, t) {
  return function() {
    (t.apply(this, arguments) ? Iu : Tu)(this, e);
  };
}
function Gm(e, t) {
  var n = Cu(e + "");
  if (arguments.length < 2) {
    for (var i = Bs(this.node()), o = -1, r = n.length; ++o < r; ) if (!i.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? Hm : t ? $m : Om)(n, t));
}
function Wm() {
  this.textContent = "";
}
function Um(e) {
  return function() {
    this.textContent = e;
  };
}
function jm(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function Vm(e) {
  return arguments.length ? this.each(e == null ? Wm : (typeof e == "function" ? jm : Um)(e)) : this.node().textContent;
}
function Zm() {
  this.innerHTML = "";
}
function Ym(e) {
  return function() {
    this.innerHTML = e;
  };
}
function Xm(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function Km(e) {
  return arguments.length ? this.each(e == null ? Zm : (typeof e == "function" ? Xm : Ym)(e)) : this.node().innerHTML;
}
function qm() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Qm() {
  return this.each(qm);
}
function Jm() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function eg() {
  return this.each(Jm);
}
function tg(e) {
  var t = typeof e == "function" ? e : vu(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function ng() {
  return null;
}
function ig(e, t) {
  var n = typeof e == "function" ? e : vu(e), i = t == null ? ng : typeof t == "function" ? t : Ps(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function og() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function rg() {
  return this.each(og);
}
function ag() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function sg() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function lg(e) {
  return this.select(e ? sg : ag);
}
function cg(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function ug(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function dg(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function fg(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, o = t.length, r; n < o; ++n)
        r = t[n], (!e.type || r.type === e.type) && r.name === e.name ? this.removeEventListener(r.type, r.listener, r.options) : t[++i] = r;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function pg(e, t, n) {
  return function() {
    var i = this.__on, o, r = ug(t);
    if (i) {
      for (var a = 0, l = i.length; a < l; ++a)
        if ((o = i[a]).type === e.type && o.name === e.name) {
          this.removeEventListener(o.type, o.listener, o.options), this.addEventListener(o.type, o.listener = r, o.options = n), o.value = t;
          return;
        }
    }
    this.addEventListener(e.type, r, n), o = { type: e.type, name: e.name, value: t, listener: r, options: n }, i ? i.push(o) : this.__on = [o];
  };
}
function hg(e, t, n) {
  var i = dg(e + ""), o, r = i.length, a;
  if (arguments.length < 2) {
    var l = this.node().__on;
    if (l) {
      for (var c = 0, u = l.length, d; c < u; ++c)
        for (o = 0, d = l[c]; o < r; ++o)
          if ((a = i[o]).type === d.type && a.name === d.name)
            return d.value;
    }
    return;
  }
  for (l = t ? pg : fg, o = 0; o < r; ++o) this.each(l(i[o], t, n));
  return this;
}
function Eu(e, t, n) {
  var i = Mu(e), o = i.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = i.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function mg(e, t) {
  return function() {
    return Eu(this, e, t);
  };
}
function gg(e, t) {
  return function() {
    return Eu(this, e, t.apply(this, arguments));
  };
}
function bg(e, t) {
  return this.each((typeof t == "function" ? gg : mg)(e, t));
}
function* yg() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], o = 0, r = i.length, a; o < r; ++o)
      (a = i[o]) && (yield a);
}
var Au = [null];
function tt(e, t) {
  this._groups = e, this._parents = t;
}
function ko() {
  return new tt([[document.documentElement]], Au);
}
function vg() {
  return this;
}
tt.prototype = ko.prototype = {
  constructor: tt,
  select: jh,
  selectAll: Xh,
  selectChild: Jh,
  selectChildren: im,
  filter: om,
  data: um,
  enter: rm,
  exit: fm,
  join: pm,
  merge: hm,
  selection: vg,
  order: mm,
  sort: gm,
  call: ym,
  nodes: vm,
  node: wm,
  size: xm,
  empty: _m,
  each: Sm,
  attr: Am,
  style: Rm,
  property: Lm,
  classed: Gm,
  text: Vm,
  html: Km,
  raise: Qm,
  lower: eg,
  append: tg,
  insert: ig,
  remove: rg,
  clone: lg,
  datum: cg,
  on: hg,
  dispatch: bg,
  [Symbol.iterator]: yg
};
function et(e) {
  return typeof e == "string" ? new tt([[document.querySelector(e)]], [document.documentElement]) : new tt([[e]], Au);
}
function wg(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function ht(e, t) {
  if (e = wg(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var i = n.createSVGPoint();
      return i.x = e.clientX, i.y = e.clientY, i = i.matrixTransform(t.getScreenCTM().inverse()), [i.x, i.y];
    }
    if (t.getBoundingClientRect) {
      var o = t.getBoundingClientRect();
      return [e.clientX - o.left - t.clientLeft, e.clientY - o.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
const xg = { passive: !1 }, uo = { capture: !0, passive: !1 };
function ua(e) {
  e.stopImmediatePropagation();
}
function Ei(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function ku(e) {
  var t = e.document.documentElement, n = et(e).on("dragstart.drag", Ei, uo);
  "onselectstart" in t ? n.on("selectstart.drag", Ei, uo) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function Pu(e, t) {
  var n = e.document.documentElement, i = et(e).on("dragstart.drag", null);
  t && (i.on("click.drag", Ei, uo), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const Go = (e) => () => e;
function Xa(e, {
  sourceEvent: t,
  subject: n,
  target: i,
  identifier: o,
  active: r,
  x: a,
  y: l,
  dx: c,
  dy: u,
  dispatch: d
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    subject: { value: n, enumerable: !0, configurable: !0 },
    target: { value: i, enumerable: !0, configurable: !0 },
    identifier: { value: o, enumerable: !0, configurable: !0 },
    active: { value: r, enumerable: !0, configurable: !0 },
    x: { value: a, enumerable: !0, configurable: !0 },
    y: { value: l, enumerable: !0, configurable: !0 },
    dx: { value: c, enumerable: !0, configurable: !0 },
    dy: { value: u, enumerable: !0, configurable: !0 },
    _: { value: d }
  });
}
Xa.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function _g(e) {
  return !e.ctrlKey && !e.button;
}
function Sg() {
  return this.parentNode;
}
function Mg(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function Cg() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Bu() {
  var e = _g, t = Sg, n = Mg, i = Cg, o = {}, r = Ur("start", "drag", "end"), a = 0, l, c, u, d, f = 0;
  function p(y) {
    y.on("mousedown.drag", h).filter(i).on("touchstart.drag", _).on("touchmove.drag", b, xg).on("touchend.drag touchcancel.drag", S).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function h(y, v) {
    if (!(d || !e.call(this, y, v))) {
      var C = m(this, t.call(this, y, v), y, v, "mouse");
      C && (et(y.view).on("mousemove.drag", w, uo).on("mouseup.drag", g, uo), ku(y.view), ua(y), u = !1, l = y.clientX, c = y.clientY, C("start", y));
    }
  }
  function w(y) {
    if (Ei(y), !u) {
      var v = y.clientX - l, C = y.clientY - c;
      u = v * v + C * C > f;
    }
    o.mouse("drag", y);
  }
  function g(y) {
    et(y.view).on("mousemove.drag mouseup.drag", null), Pu(y.view, u), Ei(y), o.mouse("end", y);
  }
  function _(y, v) {
    if (e.call(this, y, v)) {
      var C = y.changedTouches, T = t.call(this, y, v), P = C.length, D, O;
      for (D = 0; D < P; ++D)
        (O = m(this, T, y, v, C[D].identifier, C[D])) && (ua(y), O("start", y, C[D]));
    }
  }
  function b(y) {
    var v = y.changedTouches, C = v.length, T, P;
    for (T = 0; T < C; ++T)
      (P = o[v[T].identifier]) && (Ei(y), P("drag", y, v[T]));
  }
  function S(y) {
    var v = y.changedTouches, C = v.length, T, P;
    for (d && clearTimeout(d), d = setTimeout(function() {
      d = null;
    }, 500), T = 0; T < C; ++T)
      (P = o[v[T].identifier]) && (ua(y), P("end", y, v[T]));
  }
  function m(y, v, C, T, P, D) {
    var O = r.copy(), z = ht(D || C, v), E, G, I;
    if ((I = n.call(y, new Xa("beforestart", {
      sourceEvent: C,
      target: p,
      identifier: P,
      active: a,
      x: z[0],
      y: z[1],
      dx: 0,
      dy: 0,
      dispatch: O
    }), T)) != null)
      return E = I.x - z[0] || 0, G = I.y - z[1] || 0, function $(R, L, M) {
        var F = z, U;
        switch (R) {
          case "start":
            o[P] = $, U = a++;
            break;
          case "end":
            delete o[P], --a;
          // falls through
          case "drag":
            z = ht(M || L, v), U = a;
            break;
        }
        O.call(
          R,
          y,
          new Xa(R, {
            sourceEvent: L,
            subject: I,
            target: p,
            identifier: P,
            active: U,
            x: z[0] + E,
            y: z[1] + G,
            dx: z[0] - F[0],
            dy: z[1] - F[1],
            dispatch: O
          }),
          T
        );
      };
  }
  return p.filter = function(y) {
    return arguments.length ? (e = typeof y == "function" ? y : Go(!!y), p) : e;
  }, p.container = function(y) {
    return arguments.length ? (t = typeof y == "function" ? y : Go(y), p) : t;
  }, p.subject = function(y) {
    return arguments.length ? (n = typeof y == "function" ? y : Go(y), p) : n;
  }, p.touchable = function(y) {
    return arguments.length ? (i = typeof y == "function" ? y : Go(!!y), p) : i;
  }, p.on = function() {
    var y = r.on.apply(r, arguments);
    return y === r ? p : y;
  }, p.clickDistance = function(y) {
    return arguments.length ? (f = (y = +y) * y, p) : Math.sqrt(f);
  }, p;
}
function Rs(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function Ru(e, t) {
  var n = Object.create(e.prototype);
  for (var i in t) n[i] = t[i];
  return n;
}
function Po() {
}
var fo = 0.7, wr = 1 / fo, Ai = "\\s*([+-]?\\d+)\\s*", po = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", Dt = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", Ng = /^#([0-9a-f]{3,8})$/, Ig = new RegExp(`^rgb\\(${Ai},${Ai},${Ai}\\)$`), Tg = new RegExp(`^rgb\\(${Dt},${Dt},${Dt}\\)$`), Eg = new RegExp(`^rgba\\(${Ai},${Ai},${Ai},${po}\\)$`), Ag = new RegExp(`^rgba\\(${Dt},${Dt},${Dt},${po}\\)$`), kg = new RegExp(`^hsl\\(${po},${Dt},${Dt}\\)$`), Pg = new RegExp(`^hsla\\(${po},${Dt},${Dt},${po}\\)$`), Sl = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
Rs(Po, hi, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: Ml,
  // Deprecated! Use color.formatHex.
  formatHex: Ml,
  formatHex8: Bg,
  formatHsl: Rg,
  formatRgb: Cl,
  toString: Cl
});
function Ml() {
  return this.rgb().formatHex();
}
function Bg() {
  return this.rgb().formatHex8();
}
function Rg() {
  return Du(this).formatHsl();
}
function Cl() {
  return this.rgb().formatRgb();
}
function hi(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = Ng.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? Nl(t) : n === 3 ? new qe(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Wo(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Wo(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = Ig.exec(e)) ? new qe(t[1], t[2], t[3], 1) : (t = Tg.exec(e)) ? new qe(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = Eg.exec(e)) ? Wo(t[1], t[2], t[3], t[4]) : (t = Ag.exec(e)) ? Wo(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = kg.exec(e)) ? El(t[1], t[2] / 100, t[3] / 100, 1) : (t = Pg.exec(e)) ? El(t[1], t[2] / 100, t[3] / 100, t[4]) : Sl.hasOwnProperty(e) ? Nl(Sl[e]) : e === "transparent" ? new qe(NaN, NaN, NaN, 0) : null;
}
function Nl(e) {
  return new qe(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Wo(e, t, n, i) {
  return i <= 0 && (e = t = n = NaN), new qe(e, t, n, i);
}
function Dg(e) {
  return e instanceof Po || (e = hi(e)), e ? (e = e.rgb(), new qe(e.r, e.g, e.b, e.opacity)) : new qe();
}
function Ka(e, t, n, i) {
  return arguments.length === 1 ? Dg(e) : new qe(e, t, n, i ?? 1);
}
function qe(e, t, n, i) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +i;
}
Rs(qe, Ka, Ru(Po, {
  brighter(e) {
    return e = e == null ? wr : Math.pow(wr, e), new qe(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? fo : Math.pow(fo, e), new qe(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new qe(fi(this.r), fi(this.g), fi(this.b), xr(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Il,
  // Deprecated! Use color.formatHex.
  formatHex: Il,
  formatHex8: zg,
  formatRgb: Tl,
  toString: Tl
}));
function Il() {
  return `#${di(this.r)}${di(this.g)}${di(this.b)}`;
}
function zg() {
  return `#${di(this.r)}${di(this.g)}${di(this.b)}${di((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Tl() {
  const e = xr(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${fi(this.r)}, ${fi(this.g)}, ${fi(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function xr(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function fi(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function di(e) {
  return e = fi(e), (e < 16 ? "0" : "") + e.toString(16);
}
function El(e, t, n, i) {
  return i <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new bt(e, t, n, i);
}
function Du(e) {
  if (e instanceof bt) return new bt(e.h, e.s, e.l, e.opacity);
  if (e instanceof Po || (e = hi(e)), !e) return new bt();
  if (e instanceof bt) return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, i = e.b / 255, o = Math.min(t, n, i), r = Math.max(t, n, i), a = NaN, l = r - o, c = (r + o) / 2;
  return l ? (t === r ? a = (n - i) / l + (n < i) * 6 : n === r ? a = (i - t) / l + 2 : a = (t - n) / l + 4, l /= c < 0.5 ? r + o : 2 - r - o, a *= 60) : l = c > 0 && c < 1 ? 0 : a, new bt(a, l, c, e.opacity);
}
function Fg(e, t, n, i) {
  return arguments.length === 1 ? Du(e) : new bt(e, t, n, i ?? 1);
}
function bt(e, t, n, i) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +i;
}
Rs(bt, Fg, Ru(Po, {
  brighter(e) {
    return e = e == null ? wr : Math.pow(wr, e), new bt(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? fo : Math.pow(fo, e), new bt(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, i = n + (n < 0.5 ? n : 1 - n) * t, o = 2 * n - i;
    return new qe(
      da(e >= 240 ? e - 240 : e + 120, o, i),
      da(e, o, i),
      da(e < 120 ? e + 240 : e - 120, o, i),
      this.opacity
    );
  },
  clamp() {
    return new bt(Al(this.h), Uo(this.s), Uo(this.l), xr(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = xr(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${Al(this.h)}, ${Uo(this.s) * 100}%, ${Uo(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function Al(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function Uo(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function da(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const Ds = (e) => () => e;
function Lg(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function $g(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(i) {
    return Math.pow(e + i * t, n);
  };
}
function Og(e) {
  return (e = +e) == 1 ? zu : function(t, n) {
    return n - t ? $g(t, n, e) : Ds(isNaN(t) ? n : t);
  };
}
function zu(e, t) {
  var n = t - e;
  return n ? Lg(e, n) : Ds(isNaN(e) ? t : e);
}
const _r = function e(t) {
  var n = Og(t);
  function i(o, r) {
    var a = n((o = Ka(o)).r, (r = Ka(r)).r), l = n(o.g, r.g), c = n(o.b, r.b), u = zu(o.opacity, r.opacity);
    return function(d) {
      return o.r = a(d), o.g = l(d), o.b = c(d), o.opacity = u(d), o + "";
    };
  }
  return i.gamma = e, i;
}(1);
function Hg(e, t) {
  t || (t = []);
  var n = e ? Math.min(t.length, e.length) : 0, i = t.slice(), o;
  return function(r) {
    for (o = 0; o < n; ++o) i[o] = e[o] * (1 - r) + t[o] * r;
    return i;
  };
}
function Gg(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function Wg(e, t) {
  var n = t ? t.length : 0, i = e ? Math.min(n, e.length) : 0, o = new Array(i), r = new Array(n), a;
  for (a = 0; a < i; ++a) o[a] = to(e[a], t[a]);
  for (; a < n; ++a) r[a] = t[a];
  return function(l) {
    for (a = 0; a < i; ++a) r[a] = o[a](l);
    return r;
  };
}
function Ug(e, t) {
  var n = /* @__PURE__ */ new Date();
  return e = +e, t = +t, function(i) {
    return n.setTime(e * (1 - i) + t * i), n;
  };
}
function Bt(e, t) {
  return e = +e, t = +t, function(n) {
    return e * (1 - n) + t * n;
  };
}
function jg(e, t) {
  var n = {}, i = {}, o;
  (e === null || typeof e != "object") && (e = {}), (t === null || typeof t != "object") && (t = {});
  for (o in t)
    o in e ? n[o] = to(e[o], t[o]) : i[o] = t[o];
  return function(r) {
    for (o in n) i[o] = n[o](r);
    return i;
  };
}
var qa = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, fa = new RegExp(qa.source, "g");
function Vg(e) {
  return function() {
    return e;
  };
}
function Zg(e) {
  return function(t) {
    return e(t) + "";
  };
}
function Fu(e, t) {
  var n = qa.lastIndex = fa.lastIndex = 0, i, o, r, a = -1, l = [], c = [];
  for (e = e + "", t = t + ""; (i = qa.exec(e)) && (o = fa.exec(t)); )
    (r = o.index) > n && (r = t.slice(n, r), l[a] ? l[a] += r : l[++a] = r), (i = i[0]) === (o = o[0]) ? l[a] ? l[a] += o : l[++a] = o : (l[++a] = null, c.push({ i: a, x: Bt(i, o) })), n = fa.lastIndex;
  return n < t.length && (r = t.slice(n), l[a] ? l[a] += r : l[++a] = r), l.length < 2 ? c[0] ? Zg(c[0].x) : Vg(t) : (t = c.length, function(u) {
    for (var d = 0, f; d < t; ++d) l[(f = c[d]).i] = f.x(u);
    return l.join("");
  });
}
function to(e, t) {
  var n = typeof t, i;
  return t == null || n === "boolean" ? Ds(t) : (n === "number" ? Bt : n === "string" ? (i = hi(t)) ? (t = i, _r) : Fu : t instanceof hi ? _r : t instanceof Date ? Ug : Gg(t) ? Hg : Array.isArray(t) ? Wg : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? jg : Bt)(e, t);
}
var kl = 180 / Math.PI, Qa = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function Lu(e, t, n, i, o, r) {
  var a, l, c;
  return (a = Math.sqrt(e * e + t * t)) && (e /= a, t /= a), (c = e * n + t * i) && (n -= e * c, i -= t * c), (l = Math.sqrt(n * n + i * i)) && (n /= l, i /= l, c /= l), e * i < t * n && (e = -e, t = -t, c = -c, a = -a), {
    translateX: o,
    translateY: r,
    rotate: Math.atan2(t, e) * kl,
    skewX: Math.atan(c) * kl,
    scaleX: a,
    scaleY: l
  };
}
var jo;
function Yg(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? Qa : Lu(t.a, t.b, t.c, t.d, t.e, t.f);
}
function Xg(e) {
  return e == null || (jo || (jo = document.createElementNS("http://www.w3.org/2000/svg", "g")), jo.setAttribute("transform", e), !(e = jo.transform.baseVal.consolidate())) ? Qa : (e = e.matrix, Lu(e.a, e.b, e.c, e.d, e.e, e.f));
}
function $u(e, t, n, i) {
  function o(u) {
    return u.length ? u.pop() + " " : "";
  }
  function r(u, d, f, p, h, w) {
    if (u !== f || d !== p) {
      var g = h.push("translate(", null, t, null, n);
      w.push({ i: g - 4, x: Bt(u, f) }, { i: g - 2, x: Bt(d, p) });
    } else (f || p) && h.push("translate(" + f + t + p + n);
  }
  function a(u, d, f, p) {
    u !== d ? (u - d > 180 ? d += 360 : d - u > 180 && (u += 360), p.push({ i: f.push(o(f) + "rotate(", null, i) - 2, x: Bt(u, d) })) : d && f.push(o(f) + "rotate(" + d + i);
  }
  function l(u, d, f, p) {
    u !== d ? p.push({ i: f.push(o(f) + "skewX(", null, i) - 2, x: Bt(u, d) }) : d && f.push(o(f) + "skewX(" + d + i);
  }
  function c(u, d, f, p, h, w) {
    if (u !== f || d !== p) {
      var g = h.push(o(h) + "scale(", null, ",", null, ")");
      w.push({ i: g - 4, x: Bt(u, f) }, { i: g - 2, x: Bt(d, p) });
    } else (f !== 1 || p !== 1) && h.push(o(h) + "scale(" + f + "," + p + ")");
  }
  return function(u, d) {
    var f = [], p = [];
    return u = e(u), d = e(d), r(u.translateX, u.translateY, d.translateX, d.translateY, f, p), a(u.rotate, d.rotate, f, p), l(u.skewX, d.skewX, f, p), c(u.scaleX, u.scaleY, d.scaleX, d.scaleY, f, p), u = d = null, function(h) {
      for (var w = -1, g = p.length, _; ++w < g; ) f[(_ = p[w]).i] = _.x(h);
      return f.join("");
    };
  };
}
var Kg = $u(Yg, "px, ", "px)", "deg)"), qg = $u(Xg, ", ", ")", ")"), Qg = 1e-12;
function Pl(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function Jg(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function e0(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const pr = function e(t, n, i) {
  function o(r, a) {
    var l = r[0], c = r[1], u = r[2], d = a[0], f = a[1], p = a[2], h = d - l, w = f - c, g = h * h + w * w, _, b;
    if (g < Qg)
      b = Math.log(p / u) / t, _ = function(T) {
        return [
          l + T * h,
          c + T * w,
          u * Math.exp(t * T * b)
        ];
      };
    else {
      var S = Math.sqrt(g), m = (p * p - u * u + i * g) / (2 * u * n * S), y = (p * p - u * u - i * g) / (2 * p * n * S), v = Math.log(Math.sqrt(m * m + 1) - m), C = Math.log(Math.sqrt(y * y + 1) - y);
      b = (C - v) / t, _ = function(T) {
        var P = T * b, D = Pl(v), O = u / (n * S) * (D * e0(t * P + v) - Jg(v));
        return [
          l + O * h,
          c + O * w,
          u * D / Pl(t * P + v)
        ];
      };
    }
    return _.duration = b * 1e3 * t / Math.SQRT2, _;
  }
  return o.rho = function(r) {
    var a = Math.max(1e-3, +r), l = a * a, c = l * l;
    return e(a, l, c);
  }, o;
}(Math.SQRT2, 2, 4);
var Pi = 0, Ji = 0, Vi = 0, Ou = 1e3, Sr, eo, Mr = 0, mi = 0, Vr = 0, ho = typeof performance == "object" && performance.now ? performance : Date, Hu = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function zs() {
  return mi || (Hu(t0), mi = ho.now() + Vr);
}
function t0() {
  mi = 0;
}
function Cr() {
  this._call = this._time = this._next = null;
}
Cr.prototype = Gu.prototype = {
  constructor: Cr,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? zs() : +n) + (t == null ? 0 : +t), !this._next && eo !== this && (eo ? eo._next = this : Sr = this, eo = this), this._call = e, this._time = n, Ja();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Ja());
  }
};
function Gu(e, t, n) {
  var i = new Cr();
  return i.restart(e, t, n), i;
}
function n0() {
  zs(), ++Pi;
  for (var e = Sr, t; e; )
    (t = mi - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Pi;
}
function Bl() {
  mi = (Mr = ho.now()) + Vr, Pi = Ji = 0;
  try {
    n0();
  } finally {
    Pi = 0, o0(), mi = 0;
  }
}
function i0() {
  var e = ho.now(), t = e - Mr;
  t > Ou && (Vr -= t, Mr = e);
}
function o0() {
  for (var e, t = Sr, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Sr = n);
  eo = e, Ja(i);
}
function Ja(e) {
  if (!Pi) {
    Ji && (Ji = clearTimeout(Ji));
    var t = e - mi;
    t > 24 ? (e < 1 / 0 && (Ji = setTimeout(Bl, e - ho.now() - Vr)), Vi && (Vi = clearInterval(Vi))) : (Vi || (Mr = ho.now(), Vi = setInterval(i0, Ou)), Pi = 1, Hu(Bl));
  }
}
function Rl(e, t, n) {
  var i = new Cr();
  return t = t == null ? 0 : +t, i.restart((o) => {
    i.stop(), e(o + t);
  }, t, n), i;
}
var r0 = Ur("start", "end", "cancel", "interrupt"), a0 = [], Wu = 0, Dl = 1, es = 2, hr = 3, zl = 4, ts = 5, mr = 6;
function Zr(e, t, n, i, o, r) {
  var a = e.__transition;
  if (!a) e.__transition = {};
  else if (n in a) return;
  s0(e, n, {
    name: t,
    index: i,
    // For context during callback.
    group: o,
    // For context during callback.
    on: r0,
    tween: a0,
    time: r.time,
    delay: r.delay,
    duration: r.duration,
    ease: r.ease,
    timer: null,
    state: Wu
  });
}
function Fs(e, t) {
  var n = wt(e, t);
  if (n.state > Wu) throw new Error("too late; already scheduled");
  return n;
}
function Ft(e, t) {
  var n = wt(e, t);
  if (n.state > hr) throw new Error("too late; already running");
  return n;
}
function wt(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t])) throw new Error("transition not found");
  return n;
}
function s0(e, t, n) {
  var i = e.__transition, o;
  i[t] = n, n.timer = Gu(r, 0, n.time);
  function r(u) {
    n.state = Dl, n.timer.restart(a, n.delay, n.time), n.delay <= u && a(u - n.delay);
  }
  function a(u) {
    var d, f, p, h;
    if (n.state !== Dl) return c();
    for (d in i)
      if (h = i[d], h.name === n.name) {
        if (h.state === hr) return Rl(a);
        h.state === zl ? (h.state = mr, h.timer.stop(), h.on.call("interrupt", e, e.__data__, h.index, h.group), delete i[d]) : +d < t && (h.state = mr, h.timer.stop(), h.on.call("cancel", e, e.__data__, h.index, h.group), delete i[d]);
      }
    if (Rl(function() {
      n.state === hr && (n.state = zl, n.timer.restart(l, n.delay, n.time), l(u));
    }), n.state = es, n.on.call("start", e, e.__data__, n.index, n.group), n.state === es) {
      for (n.state = hr, o = new Array(p = n.tween.length), d = 0, f = -1; d < p; ++d)
        (h = n.tween[d].value.call(e, e.__data__, n.index, n.group)) && (o[++f] = h);
      o.length = f + 1;
    }
  }
  function l(u) {
    for (var d = u < n.duration ? n.ease.call(null, u / n.duration) : (n.timer.restart(c), n.state = ts, 1), f = -1, p = o.length; ++f < p; )
      o[f].call(e, d);
    n.state === ts && (n.on.call("end", e, e.__data__, n.index, n.group), c());
  }
  function c() {
    n.state = mr, n.timer.stop(), delete i[t];
    for (var u in i) return;
    delete e.__transition;
  }
}
function gr(e, t) {
  var n = e.__transition, i, o, r = !0, a;
  if (n) {
    t = t == null ? null : t + "";
    for (a in n) {
      if ((i = n[a]).name !== t) {
        r = !1;
        continue;
      }
      o = i.state > es && i.state < ts, i.state = mr, i.timer.stop(), i.on.call(o ? "interrupt" : "cancel", e, e.__data__, i.index, i.group), delete n[a];
    }
    r && delete e.__transition;
  }
}
function l0(e) {
  return this.each(function() {
    gr(this, e);
  });
}
function c0(e, t) {
  var n, i;
  return function() {
    var o = Ft(this, e), r = o.tween;
    if (r !== n) {
      i = n = r;
      for (var a = 0, l = i.length; a < l; ++a)
        if (i[a].name === t) {
          i = i.slice(), i.splice(a, 1);
          break;
        }
    }
    o.tween = i;
  };
}
function u0(e, t, n) {
  var i, o;
  if (typeof n != "function") throw new Error();
  return function() {
    var r = Ft(this, e), a = r.tween;
    if (a !== i) {
      o = (i = a).slice();
      for (var l = { name: t, value: n }, c = 0, u = o.length; c < u; ++c)
        if (o[c].name === t) {
          o[c] = l;
          break;
        }
      c === u && o.push(l);
    }
    r.tween = o;
  };
}
function d0(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var i = wt(this.node(), n).tween, o = 0, r = i.length, a; o < r; ++o)
      if ((a = i[o]).name === e)
        return a.value;
    return null;
  }
  return this.each((t == null ? c0 : u0)(n, e, t));
}
function Ls(e, t, n) {
  var i = e._id;
  return e.each(function() {
    var o = Ft(this, i);
    (o.value || (o.value = {}))[t] = n.apply(this, arguments);
  }), function(o) {
    return wt(o, i).value[t];
  };
}
function Uu(e, t) {
  var n;
  return (typeof t == "number" ? Bt : t instanceof hi ? _r : (n = hi(t)) ? (t = n, _r) : Fu)(e, t);
}
function f0(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function p0(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function h0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttribute(e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function m0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = this.getAttributeNS(e.space, e.local);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function g0(e, t, n) {
  var i, o, r;
  return function() {
    var a, l = n(this), c;
    return l == null ? void this.removeAttribute(e) : (a = this.getAttribute(e), c = l + "", a === c ? null : a === i && c === o ? r : (o = c, r = t(i = a, l)));
  };
}
function b0(e, t, n) {
  var i, o, r;
  return function() {
    var a, l = n(this), c;
    return l == null ? void this.removeAttributeNS(e.space, e.local) : (a = this.getAttributeNS(e.space, e.local), c = l + "", a === c ? null : a === i && c === o ? r : (o = c, r = t(i = a, l)));
  };
}
function y0(e, t) {
  var n = jr(e), i = n === "transform" ? qg : Uu;
  return this.attrTween(e, typeof t == "function" ? (n.local ? b0 : g0)(n, i, Ls(this, "attr." + e, t)) : t == null ? (n.local ? p0 : f0)(n) : (n.local ? m0 : h0)(n, i, t));
}
function v0(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function w0(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function x0(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && w0(e, r)), n;
  }
  return o._value = t, o;
}
function _0(e, t) {
  var n, i;
  function o() {
    var r = t.apply(this, arguments);
    return r !== i && (n = (i = r) && v0(e, r)), n;
  }
  return o._value = t, o;
}
function S0(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  var i = jr(e);
  return this.tween(n, (i.local ? x0 : _0)(i, t));
}
function M0(e, t) {
  return function() {
    Fs(this, e).delay = +t.apply(this, arguments);
  };
}
function C0(e, t) {
  return t = +t, function() {
    Fs(this, e).delay = t;
  };
}
function N0(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? M0 : C0)(t, e)) : wt(this.node(), t).delay;
}
function I0(e, t) {
  return function() {
    Ft(this, e).duration = +t.apply(this, arguments);
  };
}
function T0(e, t) {
  return t = +t, function() {
    Ft(this, e).duration = t;
  };
}
function E0(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? I0 : T0)(t, e)) : wt(this.node(), t).duration;
}
function A0(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    Ft(this, e).ease = t;
  };
}
function k0(e) {
  var t = this._id;
  return arguments.length ? this.each(A0(t, e)) : wt(this.node(), t).ease;
}
function P0(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    Ft(this, e).ease = n;
  };
}
function B0(e) {
  if (typeof e != "function") throw new Error();
  return this.each(P0(this._id, e));
}
function R0(e) {
  typeof e != "function" && (e = xu(e));
  for (var t = this._groups, n = t.length, i = new Array(n), o = 0; o < n; ++o)
    for (var r = t[o], a = r.length, l = i[o] = [], c, u = 0; u < a; ++u)
      (c = r[u]) && e.call(c, c.__data__, u, r) && l.push(c);
  return new en(i, this._parents, this._name, this._id);
}
function D0(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, n = e._groups, i = t.length, o = n.length, r = Math.min(i, o), a = new Array(i), l = 0; l < r; ++l)
    for (var c = t[l], u = n[l], d = c.length, f = a[l] = new Array(d), p, h = 0; h < d; ++h)
      (p = c[h] || u[h]) && (f[h] = p);
  for (; l < i; ++l)
    a[l] = t[l];
  return new en(a, this._parents, this._name, this._id);
}
function z0(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function F0(e, t, n) {
  var i, o, r = z0(t) ? Fs : Ft;
  return function() {
    var a = r(this, e), l = a.on;
    l !== i && (o = (i = l).copy()).on(t, n), a.on = o;
  };
}
function L0(e, t) {
  var n = this._id;
  return arguments.length < 2 ? wt(this.node(), n).on.on(e) : this.each(F0(n, e, t));
}
function $0(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition) if (+n !== e) return;
    t && t.removeChild(this);
  };
}
function O0() {
  return this.on("end.remove", $0(this._id));
}
function H0(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Ps(e));
  for (var i = this._groups, o = i.length, r = new Array(o), a = 0; a < o; ++a)
    for (var l = i[a], c = l.length, u = r[a] = new Array(c), d, f, p = 0; p < c; ++p)
      (d = l[p]) && (f = e.call(d, d.__data__, p, l)) && ("__data__" in d && (f.__data__ = d.__data__), u[p] = f, Zr(u[p], t, n, p, u, wt(d, n)));
  return new en(r, this._parents, t, n);
}
function G0(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = wu(e));
  for (var i = this._groups, o = i.length, r = [], a = [], l = 0; l < o; ++l)
    for (var c = i[l], u = c.length, d, f = 0; f < u; ++f)
      if (d = c[f]) {
        for (var p = e.call(d, d.__data__, f, c), h, w = wt(d, n), g = 0, _ = p.length; g < _; ++g)
          (h = p[g]) && Zr(h, t, n, g, p, w);
        r.push(p), a.push(d);
      }
  return new en(r, a, t, n);
}
var W0 = ko.prototype.constructor;
function U0() {
  return new W0(this._groups, this._parents);
}
function j0(e, t) {
  var n, i, o;
  return function() {
    var r = ki(this, e), a = (this.style.removeProperty(e), ki(this, e));
    return r === a ? null : r === n && a === i ? o : o = t(n = r, i = a);
  };
}
function ju(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function V0(e, t, n) {
  var i, o = n + "", r;
  return function() {
    var a = ki(this, e);
    return a === o ? null : a === i ? r : r = t(i = a, n);
  };
}
function Z0(e, t, n) {
  var i, o, r;
  return function() {
    var a = ki(this, e), l = n(this), c = l + "";
    return l == null && (c = l = (this.style.removeProperty(e), ki(this, e))), a === c ? null : a === i && c === o ? r : (o = c, r = t(i = a, l));
  };
}
function Y0(e, t) {
  var n, i, o, r = "style." + t, a = "end." + r, l;
  return function() {
    var c = Ft(this, e), u = c.on, d = c.value[r] == null ? l || (l = ju(t)) : void 0;
    (u !== n || o !== d) && (i = (n = u).copy()).on(a, o = d), c.on = i;
  };
}
function X0(e, t, n) {
  var i = (e += "") == "transform" ? Kg : Uu;
  return t == null ? this.styleTween(e, j0(e, i)).on("end.style." + e, ju(e)) : typeof t == "function" ? this.styleTween(e, Z0(e, i, Ls(this, "style." + e, t))).each(Y0(this._id, e)) : this.styleTween(e, V0(e, i, t), n).on("end.style." + e, null);
}
function K0(e, t, n) {
  return function(i) {
    this.style.setProperty(e, t.call(this, i), n);
  };
}
function q0(e, t, n) {
  var i, o;
  function r() {
    var a = t.apply(this, arguments);
    return a !== o && (i = (o = a) && K0(e, a, n)), i;
  }
  return r._value = t, r;
}
function Q0(e, t, n) {
  var i = "style." + (e += "");
  if (arguments.length < 2) return (i = this.tween(i)) && i._value;
  if (t == null) return this.tween(i, null);
  if (typeof t != "function") throw new Error();
  return this.tween(i, q0(e, t, n ?? ""));
}
function J0(e) {
  return function() {
    this.textContent = e;
  };
}
function eb(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function tb(e) {
  return this.tween("text", typeof e == "function" ? eb(Ls(this, "text", e)) : J0(e == null ? "" : e + ""));
}
function nb(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function ib(e) {
  var t, n;
  function i() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && nb(o)), t;
  }
  return i._value = e, i;
}
function ob(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, ib(e));
}
function rb() {
  for (var e = this._name, t = this._id, n = Vu(), i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], l = a.length, c, u = 0; u < l; ++u)
      if (c = a[u]) {
        var d = wt(c, t);
        Zr(c, e, n, u, a, {
          time: d.time + d.delay + d.duration,
          delay: 0,
          duration: d.duration,
          ease: d.ease
        });
      }
  return new en(i, this._parents, e, n);
}
function ab() {
  var e, t, n = this, i = n._id, o = n.size();
  return new Promise(function(r, a) {
    var l = { value: a }, c = { value: function() {
      --o === 0 && r();
    } };
    n.each(function() {
      var u = Ft(this, i), d = u.on;
      d !== e && (t = (e = d).copy(), t._.cancel.push(l), t._.interrupt.push(l), t._.end.push(c)), u.on = t;
    }), o === 0 && r();
  });
}
var sb = 0;
function en(e, t, n, i) {
  this._groups = e, this._parents = t, this._name = n, this._id = i;
}
function Vu() {
  return ++sb;
}
var Xt = ko.prototype;
en.prototype = {
  constructor: en,
  select: H0,
  selectAll: G0,
  selectChild: Xt.selectChild,
  selectChildren: Xt.selectChildren,
  filter: R0,
  merge: D0,
  selection: U0,
  transition: rb,
  call: Xt.call,
  nodes: Xt.nodes,
  node: Xt.node,
  size: Xt.size,
  empty: Xt.empty,
  each: Xt.each,
  on: L0,
  attr: y0,
  attrTween: S0,
  style: X0,
  styleTween: Q0,
  text: tb,
  textTween: ob,
  remove: O0,
  tween: d0,
  delay: N0,
  duration: E0,
  ease: k0,
  easeVarying: B0,
  end: ab,
  [Symbol.iterator]: Xt[Symbol.iterator]
};
function lb(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var cb = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: lb
};
function ub(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function db(e) {
  var t, n;
  e instanceof en ? (t = e._id, e = e._name) : (t = Vu(), (n = cb).time = zs(), e = e == null ? null : e + "");
  for (var i = this._groups, o = i.length, r = 0; r < o; ++r)
    for (var a = i[r], l = a.length, c, u = 0; u < l; ++u)
      (c = a[u]) && Zr(c, e, t, u, a, n || ub(c, t));
  return new en(i, this._parents, e, t);
}
ko.prototype.interrupt = l0;
ko.prototype.transition = db;
const Vo = (e) => () => e;
function fb(e, {
  sourceEvent: t,
  target: n,
  transform: i,
  dispatch: o
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    target: { value: n, enumerable: !0, configurable: !0 },
    transform: { value: i, enumerable: !0, configurable: !0 },
    _: { value: o }
  });
}
function Jt(e, t, n) {
  this.k = e, this.x = t, this.y = n;
}
Jt.prototype = {
  constructor: Jt,
  scale: function(e) {
    return e === 1 ? this : new Jt(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new Jt(this.k, this.x + this.k * e, this.y + this.k * t);
  },
  apply: function(e) {
    return [e[0] * this.k + this.x, e[1] * this.k + this.y];
  },
  applyX: function(e) {
    return e * this.k + this.x;
  },
  applyY: function(e) {
    return e * this.k + this.y;
  },
  invert: function(e) {
    return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
  },
  invertX: function(e) {
    return (e - this.x) / this.k;
  },
  invertY: function(e) {
    return (e - this.y) / this.k;
  },
  rescaleX: function(e) {
    return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
  },
  rescaleY: function(e) {
    return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var Yr = new Jt(1, 0, 0);
Zu.prototype = Jt.prototype;
function Zu(e) {
  for (; !e.__zoom; ) if (!(e = e.parentNode)) return Yr;
  return e.__zoom;
}
function pa(e) {
  e.stopImmediatePropagation();
}
function Zi(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function pb(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function hb() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function Fl() {
  return this.__zoom || Yr;
}
function mb(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function gb() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function bb(e, t, n) {
  var i = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], r = e.invertY(t[0][1]) - n[0][1], a = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > i ? (i + o) / 2 : Math.min(0, i) || Math.max(0, o),
    a > r ? (r + a) / 2 : Math.min(0, r) || Math.max(0, a)
  );
}
function Yu() {
  var e = pb, t = hb, n = bb, i = mb, o = gb, r = [0, 1 / 0], a = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], l = 250, c = pr, u = Ur("start", "zoom", "end"), d, f, p, h = 500, w = 150, g = 0, _ = 10;
  function b(I) {
    I.property("__zoom", Fl).on("wheel.zoom", P, { passive: !1 }).on("mousedown.zoom", D).on("dblclick.zoom", O).filter(o).on("touchstart.zoom", z).on("touchmove.zoom", E).on("touchend.zoom touchcancel.zoom", G).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  b.transform = function(I, $, R, L) {
    var M = I.selection ? I.selection() : I;
    M.property("__zoom", Fl), I !== M ? v(I, $, R, L) : M.interrupt().each(function() {
      C(this, arguments).event(L).start().zoom(null, typeof $ == "function" ? $.apply(this, arguments) : $).end();
    });
  }, b.scaleBy = function(I, $, R, L) {
    b.scaleTo(I, function() {
      var M = this.__zoom.k, F = typeof $ == "function" ? $.apply(this, arguments) : $;
      return M * F;
    }, R, L);
  }, b.scaleTo = function(I, $, R, L) {
    b.transform(I, function() {
      var M = t.apply(this, arguments), F = this.__zoom, U = R == null ? y(M) : typeof R == "function" ? R.apply(this, arguments) : R, V = F.invert(U), Y = typeof $ == "function" ? $.apply(this, arguments) : $;
      return n(m(S(F, Y), U, V), M, a);
    }, R, L);
  }, b.translateBy = function(I, $, R, L) {
    b.transform(I, function() {
      return n(this.__zoom.translate(
        typeof $ == "function" ? $.apply(this, arguments) : $,
        typeof R == "function" ? R.apply(this, arguments) : R
      ), t.apply(this, arguments), a);
    }, null, L);
  }, b.translateTo = function(I, $, R, L, M) {
    b.transform(I, function() {
      var F = t.apply(this, arguments), U = this.__zoom, V = L == null ? y(F) : typeof L == "function" ? L.apply(this, arguments) : L;
      return n(Yr.translate(V[0], V[1]).scale(U.k).translate(
        typeof $ == "function" ? -$.apply(this, arguments) : -$,
        typeof R == "function" ? -R.apply(this, arguments) : -R
      ), F, a);
    }, L, M);
  };
  function S(I, $) {
    return $ = Math.max(r[0], Math.min(r[1], $)), $ === I.k ? I : new Jt($, I.x, I.y);
  }
  function m(I, $, R) {
    var L = $[0] - R[0] * I.k, M = $[1] - R[1] * I.k;
    return L === I.x && M === I.y ? I : new Jt(I.k, L, M);
  }
  function y(I) {
    return [(+I[0][0] + +I[1][0]) / 2, (+I[0][1] + +I[1][1]) / 2];
  }
  function v(I, $, R, L) {
    I.on("start.zoom", function() {
      C(this, arguments).event(L).start();
    }).on("interrupt.zoom end.zoom", function() {
      C(this, arguments).event(L).end();
    }).tween("zoom", function() {
      var M = this, F = arguments, U = C(M, F).event(L), V = t.apply(M, F), Y = R == null ? y(V) : typeof R == "function" ? R.apply(M, F) : R, Z = Math.max(V[1][0] - V[0][0], V[1][1] - V[0][1]), J = M.__zoom, q = typeof $ == "function" ? $.apply(M, F) : $, A = c(J.invert(Y).concat(Z / J.k), q.invert(Y).concat(Z / q.k));
      return function(N) {
        if (N === 1) N = q;
        else {
          var W = A(N), K = Z / W[2];
          N = new Jt(K, Y[0] - W[0] * K, Y[1] - W[1] * K);
        }
        U.zoom(null, N);
      };
    });
  }
  function C(I, $, R) {
    return !R && I.__zooming || new T(I, $);
  }
  function T(I, $) {
    this.that = I, this.args = $, this.active = 0, this.sourceEvent = null, this.extent = t.apply(I, $), this.taps = 0;
  }
  T.prototype = {
    event: function(I) {
      return I && (this.sourceEvent = I), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(I, $) {
      return this.mouse && I !== "mouse" && (this.mouse[1] = $.invert(this.mouse[0])), this.touch0 && I !== "touch" && (this.touch0[1] = $.invert(this.touch0[0])), this.touch1 && I !== "touch" && (this.touch1[1] = $.invert(this.touch1[0])), this.that.__zoom = $, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(I) {
      var $ = et(this.that).datum();
      u.call(
        I,
        this.that,
        new fb(I, {
          sourceEvent: this.sourceEvent,
          target: b,
          transform: this.that.__zoom,
          dispatch: u
        }),
        $
      );
    }
  };
  function P(I, ...$) {
    if (!e.apply(this, arguments)) return;
    var R = C(this, $).event(I), L = this.__zoom, M = Math.max(r[0], Math.min(r[1], L.k * Math.pow(2, i.apply(this, arguments)))), F = ht(I);
    if (R.wheel)
      (R.mouse[0][0] !== F[0] || R.mouse[0][1] !== F[1]) && (R.mouse[1] = L.invert(R.mouse[0] = F)), clearTimeout(R.wheel);
    else {
      if (L.k === M) return;
      R.mouse = [F, L.invert(F)], gr(this), R.start();
    }
    Zi(I), R.wheel = setTimeout(U, w), R.zoom("mouse", n(m(S(L, M), R.mouse[0], R.mouse[1]), R.extent, a));
    function U() {
      R.wheel = null, R.end();
    }
  }
  function D(I, ...$) {
    if (p || !e.apply(this, arguments)) return;
    var R = I.currentTarget, L = C(this, $, !0).event(I), M = et(I.view).on("mousemove.zoom", Y, !0).on("mouseup.zoom", Z, !0), F = ht(I, R), U = I.clientX, V = I.clientY;
    ku(I.view), pa(I), L.mouse = [F, this.__zoom.invert(F)], gr(this), L.start();
    function Y(J) {
      if (Zi(J), !L.moved) {
        var q = J.clientX - U, A = J.clientY - V;
        L.moved = q * q + A * A > g;
      }
      L.event(J).zoom("mouse", n(m(L.that.__zoom, L.mouse[0] = ht(J, R), L.mouse[1]), L.extent, a));
    }
    function Z(J) {
      M.on("mousemove.zoom mouseup.zoom", null), Pu(J.view, L.moved), Zi(J), L.event(J).end();
    }
  }
  function O(I, ...$) {
    if (e.apply(this, arguments)) {
      var R = this.__zoom, L = ht(I.changedTouches ? I.changedTouches[0] : I, this), M = R.invert(L), F = R.k * (I.shiftKey ? 0.5 : 2), U = n(m(S(R, F), L, M), t.apply(this, $), a);
      Zi(I), l > 0 ? et(this).transition().duration(l).call(v, U, L, I) : et(this).call(b.transform, U, L, I);
    }
  }
  function z(I, ...$) {
    if (e.apply(this, arguments)) {
      var R = I.touches, L = R.length, M = C(this, $, I.changedTouches.length === L).event(I), F, U, V, Y;
      for (pa(I), U = 0; U < L; ++U)
        V = R[U], Y = ht(V, this), Y = [Y, this.__zoom.invert(Y), V.identifier], M.touch0 ? !M.touch1 && M.touch0[2] !== Y[2] && (M.touch1 = Y, M.taps = 0) : (M.touch0 = Y, F = !0, M.taps = 1 + !!d);
      d && (d = clearTimeout(d)), F && (M.taps < 2 && (f = Y[0], d = setTimeout(function() {
        d = null;
      }, h)), gr(this), M.start());
    }
  }
  function E(I, ...$) {
    if (this.__zooming) {
      var R = C(this, $).event(I), L = I.changedTouches, M = L.length, F, U, V, Y;
      for (Zi(I), F = 0; F < M; ++F)
        U = L[F], V = ht(U, this), R.touch0 && R.touch0[2] === U.identifier ? R.touch0[0] = V : R.touch1 && R.touch1[2] === U.identifier && (R.touch1[0] = V);
      if (U = R.that.__zoom, R.touch1) {
        var Z = R.touch0[0], J = R.touch0[1], q = R.touch1[0], A = R.touch1[1], N = (N = q[0] - Z[0]) * N + (N = q[1] - Z[1]) * N, W = (W = A[0] - J[0]) * W + (W = A[1] - J[1]) * W;
        U = S(U, Math.sqrt(N / W)), V = [(Z[0] + q[0]) / 2, (Z[1] + q[1]) / 2], Y = [(J[0] + A[0]) / 2, (J[1] + A[1]) / 2];
      } else if (R.touch0) V = R.touch0[0], Y = R.touch0[1];
      else return;
      R.zoom("touch", n(m(U, V, Y), R.extent, a));
    }
  }
  function G(I, ...$) {
    if (this.__zooming) {
      var R = C(this, $).event(I), L = I.changedTouches, M = L.length, F, U;
      for (pa(I), p && clearTimeout(p), p = setTimeout(function() {
        p = null;
      }, h), F = 0; F < M; ++F)
        U = L[F], R.touch0 && R.touch0[2] === U.identifier ? delete R.touch0 : R.touch1 && R.touch1[2] === U.identifier && delete R.touch1;
      if (R.touch1 && !R.touch0 && (R.touch0 = R.touch1, delete R.touch1), R.touch0) R.touch0[1] = this.__zoom.invert(R.touch0[0]);
      else if (R.end(), R.taps === 2 && (U = ht(U, this), Math.hypot(f[0] - U[0], f[1] - U[1]) < _)) {
        var V = et(this).on("dblclick.zoom");
        V && V.apply(this, arguments);
      }
    }
  }
  return b.wheelDelta = function(I) {
    return arguments.length ? (i = typeof I == "function" ? I : Vo(+I), b) : i;
  }, b.filter = function(I) {
    return arguments.length ? (e = typeof I == "function" ? I : Vo(!!I), b) : e;
  }, b.touchable = function(I) {
    return arguments.length ? (o = typeof I == "function" ? I : Vo(!!I), b) : o;
  }, b.extent = function(I) {
    return arguments.length ? (t = typeof I == "function" ? I : Vo([[+I[0][0], +I[0][1]], [+I[1][0], +I[1][1]]]), b) : t;
  }, b.scaleExtent = function(I) {
    return arguments.length ? (r[0] = +I[0], r[1] = +I[1], b) : [r[0], r[1]];
  }, b.translateExtent = function(I) {
    return arguments.length ? (a[0][0] = +I[0][0], a[1][0] = +I[1][0], a[0][1] = +I[0][1], a[1][1] = +I[1][1], b) : [[a[0][0], a[0][1]], [a[1][0], a[1][1]]];
  }, b.constrain = function(I) {
    return arguments.length ? (n = I, b) : n;
  }, b.duration = function(I) {
    return arguments.length ? (l = +I, b) : l;
  }, b.interpolate = function(I) {
    return arguments.length ? (c = I, b) : c;
  }, b.on = function() {
    var I = u.on.apply(u, arguments);
    return I === u ? b : I;
  }, b.clickDistance = function(I) {
    return arguments.length ? (g = (I = +I) * I, b) : Math.sqrt(g);
  }, b.tapDistance = function(I) {
    return arguments.length ? (_ = +I, b) : _;
  }, b;
}
const zt = {
  error001: () => "[React Flow]: Seems like you have not used zustand provider as an ancestor. Help: https://reactflow.dev/error#001",
  error002: () => "It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",
  error003: (e) => `Node type "${e}" not found. Using fallback type "default".`,
  error004: () => "The React Flow parent container needs a width and a height to render the graph.",
  error005: () => "Only child nodes can use a parent extent.",
  error006: () => "Can't create edge. An edge needs a source and a target.",
  error007: (e) => `The old edge with id=${e} does not exist.`,
  error009: (e) => `Marker type "${e}" doesn't exist.`,
  error008: (e, { id: t, sourceHandle: n, targetHandle: i }) => `Couldn't create edge for ${e} handle id: "${e === "source" ? n : i}", edge id: ${t}.`,
  error010: () => "Handle: No node id found. Make sure to only use a Handle inside a custom Node.",
  error011: (e) => `Edge type "${e}" not found. Using fallback type "default".`,
  error012: (e) => `Node with id "${e}" does not exist, it may have been removed. This can happen when a node is deleted before the "onNodeClick" handler is called.`,
  error013: (e = "react") => `It seems that you haven't loaded the styles. Please import '@xyflow/${e}/dist/style.css' or base.css to make sure everything is working properly.`,
  error014: () => "useNodeConnections: No node ID found. Call useNodeConnections inside a custom Node or provide a node ID.",
  error015: () => "It seems that you are trying to drag a node that is not initialized. Please use onNodesChange as explained in the docs."
}, mo = [
  [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
], Xu = ["Enter", " ", "Escape"], Ku = {
  "node.a11yDescription.default": "Press enter or space to select a node. Press delete to remove it and escape to cancel.",
  "node.a11yDescription.keyboardDisabled": "Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel.",
  "node.a11yDescription.ariaLiveMessage": ({ direction: e, x: t, y: n }) => `Moved selected node ${e}. New position, x: ${t}, y: ${n}`,
  "edge.a11yDescription.default": "Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.",
  // Control elements
  "controls.ariaLabel": "Control Panel",
  "controls.zoomIn.ariaLabel": "Zoom In",
  "controls.zoomOut.ariaLabel": "Zoom Out",
  "controls.fitView.ariaLabel": "Fit View",
  "controls.interactive.ariaLabel": "Toggle Interactivity",
  // Mini map
  "minimap.ariaLabel": "Mini Map",
  // Handle
  "handle.ariaLabel": "Handle"
};
var Bi;
(function(e) {
  e.Strict = "strict", e.Loose = "loose";
})(Bi || (Bi = {}));
var pi;
(function(e) {
  e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal";
})(pi || (pi = {}));
var go;
(function(e) {
  e.Partial = "partial", e.Full = "full";
})(go || (go = {}));
const qu = {
  inProgress: !1,
  isValid: null,
  from: null,
  fromHandle: null,
  fromPosition: null,
  fromNode: null,
  to: null,
  toHandle: null,
  toPosition: null,
  toNode: null,
  pointer: null
};
var An;
(function(e) {
  e.Bezier = "default", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e.SimpleBezier = "simplebezier";
})(An || (An = {}));
var bo;
(function(e) {
  e.Arrow = "arrow", e.ArrowClosed = "arrowclosed";
})(bo || (bo = {}));
var de;
(function(e) {
  e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom";
})(de || (de = {}));
const Ll = {
  [de.Left]: de.Right,
  [de.Right]: de.Left,
  [de.Top]: de.Bottom,
  [de.Bottom]: de.Top
};
function Qu(e) {
  return e === null ? null : e ? "valid" : "invalid";
}
const Ju = (e) => "id" in e && "source" in e && "target" in e, yb = (e) => "id" in e && "position" in e && !("source" in e) && !("target" in e), $s = (e) => "id" in e && "internals" in e && !("source" in e) && !("target" in e), Bo = (e, t = [0, 0]) => {
  const { width: n, height: i } = tn(e), o = e.origin ?? t, r = n * o[0], a = i * o[1];
  return {
    x: e.position.x - r,
    y: e.position.y - a
  };
}, vb = (e, t = { nodeOrigin: [0, 0] }) => {
  if (e.length === 0)
    return { x: 0, y: 0, width: 0, height: 0 };
  const n = e.reduce((i, o) => {
    const r = typeof o == "string";
    let a = !t.nodeLookup && !r ? o : void 0;
    t.nodeLookup && (a = r ? t.nodeLookup.get(o) : $s(o) ? o : t.nodeLookup.get(o.id));
    const l = a ? Nr(a, t.nodeOrigin) : { x: 0, y: 0, x2: 0, y2: 0 };
    return Xr(i, l);
  }, { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 });
  return Kr(n);
}, Ro = (e, t = {}) => {
  let n = { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 }, i = !1;
  return e.forEach((o) => {
    (t.filter === void 0 || t.filter(o)) && (n = Xr(n, Nr(o)), i = !0);
  }), i ? Kr(n) : { x: 0, y: 0, width: 0, height: 0 };
}, Os = (e, t, [n, i, o] = [0, 0, 1], r = !1, a = !1) => {
  const l = {
    ...zo(t, [n, i, o]),
    width: t.width / o,
    height: t.height / o
  }, c = [];
  for (const u of e.values()) {
    const { measured: d, selectable: f = !0, hidden: p = !1 } = u;
    if (a && !f || p)
      continue;
    const h = d.width ?? u.width ?? u.initialWidth ?? null, w = d.height ?? u.height ?? u.initialHeight ?? null, g = yo(l, Di(u)), _ = (h ?? 0) * (w ?? 0), b = r && g > 0;
    (!u.internals.handleBounds || b || g >= _ || u.dragging) && c.push(u);
  }
  return c;
}, wb = (e, t) => {
  const n = /* @__PURE__ */ new Set();
  return e.forEach((i) => {
    n.add(i.id);
  }), t.filter((i) => n.has(i.source) || n.has(i.target));
};
function xb(e, t) {
  const n = /* @__PURE__ */ new Map(), i = t?.nodes ? new Set(t.nodes.map((o) => o.id)) : null;
  return e.forEach((o) => {
    o.measured.width && o.measured.height && (t?.includeHiddenNodes || !o.hidden) && (!i || i.has(o.id)) && n.set(o.id, o);
  }), n;
}
async function _b({ nodes: e, width: t, height: n, panZoom: i, minZoom: o, maxZoom: r }, a) {
  if (e.size === 0)
    return Promise.resolve(!0);
  const l = xb(e, a), c = Ro(l), u = Hs(c, t, n, a?.minZoom ?? o, a?.maxZoom ?? r, a?.padding ?? 0.1);
  return await i.setViewport(u, {
    duration: a?.duration,
    ease: a?.ease,
    interpolate: a?.interpolate
  }), Promise.resolve(!0);
}
function ed({ nodeId: e, nextPosition: t, nodeLookup: n, nodeOrigin: i = [0, 0], nodeExtent: o, onError: r }) {
  const a = n.get(e), l = a.parentId ? n.get(a.parentId) : void 0, { x: c, y: u } = l ? l.internals.positionAbsolute : { x: 0, y: 0 }, d = a.origin ?? i;
  let f = a.extent || o;
  if (a.extent === "parent" && !a.expandParent)
    if (!l)
      r?.("005", zt.error005());
    else {
      const h = l.measured.width, w = l.measured.height;
      h && w && (f = [
        [c, u],
        [c + h, u + w]
      ]);
    }
  else l && zi(a.extent) && (f = [
    [a.extent[0][0] + c, a.extent[0][1] + u],
    [a.extent[1][0] + c, a.extent[1][1] + u]
  ]);
  const p = zi(f) ? gi(t, f, a.measured) : t;
  return (a.measured.width === void 0 || a.measured.height === void 0) && r?.("015", zt.error015()), {
    position: {
      x: p.x - c + (a.measured.width ?? 0) * d[0],
      y: p.y - u + (a.measured.height ?? 0) * d[1]
    },
    positionAbsolute: p
  };
}
async function Sb({ nodesToRemove: e = [], edgesToRemove: t = [], nodes: n, edges: i, onBeforeDelete: o }) {
  const r = new Set(e.map((p) => p.id)), a = [];
  for (const p of n) {
    if (p.deletable === !1)
      continue;
    const h = r.has(p.id), w = !h && p.parentId && a.find((g) => g.id === p.parentId);
    (h || w) && a.push(p);
  }
  const l = new Set(t.map((p) => p.id)), c = i.filter((p) => p.deletable !== !1), d = wb(a, c);
  for (const p of c)
    l.has(p.id) && !d.find((w) => w.id === p.id) && d.push(p);
  if (!o)
    return {
      edges: d,
      nodes: a
    };
  const f = await o({
    nodes: a,
    edges: d
  });
  return typeof f == "boolean" ? f ? { edges: d, nodes: a } : { edges: [], nodes: [] } : f;
}
const Ri = (e, t = 0, n = 1) => Math.min(Math.max(e, t), n), gi = (e = { x: 0, y: 0 }, t, n) => ({
  x: Ri(e.x, t[0][0], t[1][0] - (n?.width ?? 0)),
  y: Ri(e.y, t[0][1], t[1][1] - (n?.height ?? 0))
});
function td(e, t, n) {
  const { width: i, height: o } = tn(n), { x: r, y: a } = n.internals.positionAbsolute;
  return gi(e, [
    [r, a],
    [r + i, a + o]
  ], t);
}
const $l = (e, t, n) => e < t ? Ri(Math.abs(e - t), 1, t) / t : e > n ? -Ri(Math.abs(e - n), 1, t) / t : 0, nd = (e, t, n = 15, i = 40) => {
  const o = $l(e.x, i, t.width - i) * n, r = $l(e.y, i, t.height - i) * n;
  return [o, r];
}, Xr = (e, t) => ({
  x: Math.min(e.x, t.x),
  y: Math.min(e.y, t.y),
  x2: Math.max(e.x2, t.x2),
  y2: Math.max(e.y2, t.y2)
}), ns = ({ x: e, y: t, width: n, height: i }) => ({
  x: e,
  y: t,
  x2: e + n,
  y2: t + i
}), Kr = ({ x: e, y: t, x2: n, y2: i }) => ({
  x: e,
  y: t,
  width: n - e,
  height: i - t
}), Di = (e, t = [0, 0]) => {
  const { x: n, y: i } = $s(e) ? e.internals.positionAbsolute : Bo(e, t);
  return {
    x: n,
    y: i,
    width: e.measured?.width ?? e.width ?? e.initialWidth ?? 0,
    height: e.measured?.height ?? e.height ?? e.initialHeight ?? 0
  };
}, Nr = (e, t = [0, 0]) => {
  const { x: n, y: i } = $s(e) ? e.internals.positionAbsolute : Bo(e, t);
  return {
    x: n,
    y: i,
    x2: n + (e.measured?.width ?? e.width ?? e.initialWidth ?? 0),
    y2: i + (e.measured?.height ?? e.height ?? e.initialHeight ?? 0)
  };
}, id = (e, t) => Kr(Xr(ns(e), ns(t))), yo = (e, t) => {
  const n = Math.max(0, Math.min(e.x + e.width, t.x + t.width) - Math.max(e.x, t.x)), i = Math.max(0, Math.min(e.y + e.height, t.y + t.height) - Math.max(e.y, t.y));
  return Math.ceil(n * i);
}, Ol = (e) => yt(e.width) && yt(e.height) && yt(e.x) && yt(e.y), yt = (e) => !isNaN(e) && isFinite(e), Mb = (e, t) => {
}, Do = (e, t = [1, 1]) => ({
  x: t[0] * Math.round(e.x / t[0]),
  y: t[1] * Math.round(e.y / t[1])
}), zo = ({ x: e, y: t }, [n, i, o], r = !1, a = [1, 1]) => {
  const l = {
    x: (e - n) / o,
    y: (t - i) / o
  };
  return r ? Do(l, a) : l;
}, Ir = ({ x: e, y: t }, [n, i, o]) => ({
  x: e * o + n,
  y: t * o + i
});
function _i(e, t) {
  if (typeof e == "number")
    return Math.floor((t - t / (1 + e)) * 0.5);
  if (typeof e == "string" && e.endsWith("px")) {
    const n = parseFloat(e);
    if (!Number.isNaN(n))
      return Math.floor(n);
  }
  if (typeof e == "string" && e.endsWith("%")) {
    const n = parseFloat(e);
    if (!Number.isNaN(n))
      return Math.floor(t * n * 0.01);
  }
  return console.error(`[React Flow] The padding value "${e}" is invalid. Please provide a number or a string with a valid unit (px or %).`), 0;
}
function Cb(e, t, n) {
  if (typeof e == "string" || typeof e == "number") {
    const i = _i(e, n), o = _i(e, t);
    return {
      top: i,
      right: o,
      bottom: i,
      left: o,
      x: o * 2,
      y: i * 2
    };
  }
  if (typeof e == "object") {
    const i = _i(e.top ?? e.y ?? 0, n), o = _i(e.bottom ?? e.y ?? 0, n), r = _i(e.left ?? e.x ?? 0, t), a = _i(e.right ?? e.x ?? 0, t);
    return { top: i, right: a, bottom: o, left: r, x: r + a, y: i + o };
  }
  return { top: 0, right: 0, bottom: 0, left: 0, x: 0, y: 0 };
}
function Nb(e, t, n, i, o, r) {
  const { x: a, y: l } = Ir(e, [t, n, i]), { x: c, y: u } = Ir({ x: e.x + e.width, y: e.y + e.height }, [t, n, i]), d = o - c, f = r - u;
  return {
    left: Math.floor(a),
    top: Math.floor(l),
    right: Math.floor(d),
    bottom: Math.floor(f)
  };
}
const Hs = (e, t, n, i, o, r) => {
  const a = Cb(r, t, n), l = (t - a.x) / e.width, c = (n - a.y) / e.height, u = Math.min(l, c), d = Ri(u, i, o), f = e.x + e.width / 2, p = e.y + e.height / 2, h = t / 2 - f * d, w = n / 2 - p * d, g = Nb(e, h, w, d, t, n), _ = {
    left: Math.min(g.left - a.left, 0),
    top: Math.min(g.top - a.top, 0),
    right: Math.min(g.right - a.right, 0),
    bottom: Math.min(g.bottom - a.bottom, 0)
  };
  return {
    x: h - _.left + _.right,
    y: w - _.top + _.bottom,
    zoom: d
  };
}, vo = () => typeof navigator < "u" && navigator?.userAgent?.indexOf("Mac") >= 0;
function zi(e) {
  return e != null && e !== "parent";
}
function tn(e) {
  return {
    width: e.measured?.width ?? e.width ?? e.initialWidth ?? 0,
    height: e.measured?.height ?? e.height ?? e.initialHeight ?? 0
  };
}
function od(e) {
  return (e.measured?.width ?? e.width ?? e.initialWidth) !== void 0 && (e.measured?.height ?? e.height ?? e.initialHeight) !== void 0;
}
function rd(e, t = { width: 0, height: 0 }, n, i, o) {
  const r = { ...e }, a = i.get(n);
  if (a) {
    const l = a.origin || o;
    r.x += a.internals.positionAbsolute.x - (t.width ?? 0) * l[0], r.y += a.internals.positionAbsolute.y - (t.height ?? 0) * l[1];
  }
  return r;
}
function Hl(e, t) {
  if (e.size !== t.size)
    return !1;
  for (const n of e)
    if (!t.has(n))
      return !1;
  return !0;
}
function Ib() {
  let e, t;
  return { promise: new Promise((i, o) => {
    e = i, t = o;
  }), resolve: e, reject: t };
}
function Tb(e) {
  return { ...Ku, ...e || {} };
}
function no(e, { snapGrid: t = [0, 0], snapToGrid: n = !1, transform: i, containerBounds: o }) {
  const { x: r, y: a } = vt(e), l = zo({ x: r - (o?.left ?? 0), y: a - (o?.top ?? 0) }, i), { x: c, y: u } = n ? Do(l, t) : l;
  return {
    xSnapped: c,
    ySnapped: u,
    ...l
  };
}
const Gs = (e) => ({
  width: e.offsetWidth,
  height: e.offsetHeight
}), ad = (e) => e?.getRootNode?.() || window?.document, Eb = ["INPUT", "SELECT", "TEXTAREA"];
function sd(e) {
  const t = e.composedPath?.()?.[0] || e.target;
  return t?.nodeType !== 1 ? !1 : Eb.includes(t.nodeName) || t.hasAttribute("contenteditable") || !!t.closest(".nokey");
}
const ld = (e) => "clientX" in e, vt = (e, t) => {
  const n = ld(e), i = n ? e.clientX : e.touches?.[0].clientX, o = n ? e.clientY : e.touches?.[0].clientY;
  return {
    x: i - (t?.left ?? 0),
    y: o - (t?.top ?? 0)
  };
}, Gl = (e, t, n, i, o) => {
  const r = t.querySelectorAll(`.${e}`);
  return !r || !r.length ? null : Array.from(r).map((a) => {
    const l = a.getBoundingClientRect();
    return {
      id: a.getAttribute("data-handleid"),
      type: e,
      nodeId: o,
      position: a.getAttribute("data-handlepos"),
      x: (l.left - n.left) / i,
      y: (l.top - n.top) / i,
      ...Gs(a)
    };
  });
};
function cd({ sourceX: e, sourceY: t, targetX: n, targetY: i, sourceControlX: o, sourceControlY: r, targetControlX: a, targetControlY: l }) {
  const c = e * 0.125 + o * 0.375 + a * 0.375 + n * 0.125, u = t * 0.125 + r * 0.375 + l * 0.375 + i * 0.125, d = Math.abs(c - e), f = Math.abs(u - t);
  return [c, u, d, f];
}
function Zo(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function Wl({ pos: e, x1: t, y1: n, x2: i, y2: o, c: r }) {
  switch (e) {
    case de.Left:
      return [t - Zo(t - i, r), n];
    case de.Right:
      return [t + Zo(i - t, r), n];
    case de.Top:
      return [t, n - Zo(n - o, r)];
    case de.Bottom:
      return [t, n + Zo(o - n, r)];
  }
}
function ud({ sourceX: e, sourceY: t, sourcePosition: n = de.Bottom, targetX: i, targetY: o, targetPosition: r = de.Top, curvature: a = 0.25 }) {
  const [l, c] = Wl({
    pos: n,
    x1: e,
    y1: t,
    x2: i,
    y2: o,
    c: a
  }), [u, d] = Wl({
    pos: r,
    x1: i,
    y1: o,
    x2: e,
    y2: t,
    c: a
  }), [f, p, h, w] = cd({
    sourceX: e,
    sourceY: t,
    targetX: i,
    targetY: o,
    sourceControlX: l,
    sourceControlY: c,
    targetControlX: u,
    targetControlY: d
  });
  return [
    `M${e},${t} C${l},${c} ${u},${d} ${i},${o}`,
    f,
    p,
    h,
    w
  ];
}
function dd({ sourceX: e, sourceY: t, targetX: n, targetY: i }) {
  const o = Math.abs(n - e) / 2, r = n < e ? n + o : n - o, a = Math.abs(i - t) / 2, l = i < t ? i + a : i - a;
  return [r, l, o, a];
}
function Ab({ sourceNode: e, targetNode: t, selected: n = !1, zIndex: i = 0, elevateOnSelect: o = !1, zIndexMode: r = "basic" }) {
  if (r === "manual")
    return i;
  const a = o && n ? i + 1e3 : i, l = Math.max(e.parentId || o && e.selected ? e.internals.z : 0, t.parentId || o && t.selected ? t.internals.z : 0);
  return a + l;
}
function kb({ sourceNode: e, targetNode: t, width: n, height: i, transform: o }) {
  const r = Xr(Nr(e), Nr(t));
  r.x === r.x2 && (r.x2 += 1), r.y === r.y2 && (r.y2 += 1);
  const a = {
    x: -o[0] / o[2],
    y: -o[1] / o[2],
    width: n / o[2],
    height: i / o[2]
  };
  return yo(a, Kr(r)) > 0;
}
const Pb = ({ source: e, sourceHandle: t, target: n, targetHandle: i }) => `xy-edge__${e}${t || ""}-${n}${i || ""}`, Bb = (e, t) => t.some((n) => n.source === e.source && n.target === e.target && (n.sourceHandle === e.sourceHandle || !n.sourceHandle && !e.sourceHandle) && (n.targetHandle === e.targetHandle || !n.targetHandle && !e.targetHandle)), Rb = (e, t, n = {}) => {
  if (!e.source || !e.target)
    return t;
  const i = n.getEdgeId || Pb;
  let o;
  return Ju(e) ? o = { ...e } : o = {
    ...e,
    id: i(e)
  }, Bb(o, t) ? t : (o.sourceHandle === null && delete o.sourceHandle, o.targetHandle === null && delete o.targetHandle, t.concat(o));
};
function fd({ sourceX: e, sourceY: t, targetX: n, targetY: i }) {
  const [o, r, a, l] = dd({
    sourceX: e,
    sourceY: t,
    targetX: n,
    targetY: i
  });
  return [`M ${e},${t}L ${n},${i}`, o, r, a, l];
}
const Ul = {
  [de.Left]: { x: -1, y: 0 },
  [de.Right]: { x: 1, y: 0 },
  [de.Top]: { x: 0, y: -1 },
  [de.Bottom]: { x: 0, y: 1 }
}, Db = ({ source: e, sourcePosition: t = de.Bottom, target: n }) => t === de.Left || t === de.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, jl = (e, t) => Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2));
function zb({ source: e, sourcePosition: t = de.Bottom, target: n, targetPosition: i = de.Top, center: o, offset: r, stepPosition: a }) {
  const l = Ul[t], c = Ul[i], u = { x: e.x + l.x * r, y: e.y + l.y * r }, d = { x: n.x + c.x * r, y: n.y + c.y * r }, f = Db({
    source: u,
    sourcePosition: t,
    target: d
  }), p = f.x !== 0 ? "x" : "y", h = f[p];
  let w = [], g, _;
  const b = { x: 0, y: 0 }, S = { x: 0, y: 0 }, [, , m, y] = dd({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (l[p] * c[p] === -1) {
    p === "x" ? (g = o.x ?? u.x + (d.x - u.x) * a, _ = o.y ?? (u.y + d.y) / 2) : (g = o.x ?? (u.x + d.x) / 2, _ = o.y ?? u.y + (d.y - u.y) * a);
    const P = [
      { x: g, y: u.y },
      { x: g, y: d.y }
    ], D = [
      { x: u.x, y: _ },
      { x: d.x, y: _ }
    ];
    l[p] === h ? w = p === "x" ? P : D : w = p === "x" ? D : P;
  } else {
    const P = [{ x: u.x, y: d.y }], D = [{ x: d.x, y: u.y }];
    if (p === "x" ? w = l.x === h ? D : P : w = l.y === h ? P : D, t === i) {
      const I = Math.abs(e[p] - n[p]);
      if (I <= r) {
        const $ = Math.min(r - 1, r - I);
        l[p] === h ? b[p] = (u[p] > e[p] ? -1 : 1) * $ : S[p] = (d[p] > n[p] ? -1 : 1) * $;
      }
    }
    if (t !== i) {
      const I = p === "x" ? "y" : "x", $ = l[p] === c[I], R = u[I] > d[I], L = u[I] < d[I];
      (l[p] === 1 && (!$ && R || $ && L) || l[p] !== 1 && (!$ && L || $ && R)) && (w = p === "x" ? P : D);
    }
    const O = { x: u.x + b.x, y: u.y + b.y }, z = { x: d.x + S.x, y: d.y + S.y }, E = Math.max(Math.abs(O.x - w[0].x), Math.abs(z.x - w[0].x)), G = Math.max(Math.abs(O.y - w[0].y), Math.abs(z.y - w[0].y));
    E >= G ? (g = (O.x + z.x) / 2, _ = w[0].y) : (g = w[0].x, _ = (O.y + z.y) / 2);
  }
  const v = { x: u.x + b.x, y: u.y + b.y }, C = { x: d.x + S.x, y: d.y + S.y };
  return [[
    e,
    // we only want to add the gapped source/target if they are different from the first/last point to avoid duplicates which can cause issues with the bends
    ...v.x !== w[0].x || v.y !== w[0].y ? [v] : [],
    ...w,
    ...C.x !== w[w.length - 1].x || C.y !== w[w.length - 1].y ? [C] : [],
    n
  ], g, _, m, y];
}
function Fb(e, t, n, i) {
  const o = Math.min(jl(e, t) / 2, jl(t, n) / 2, i), { x: r, y: a } = t;
  if (e.x === r && r === n.x || e.y === a && a === n.y)
    return `L${r} ${a}`;
  if (e.y === a) {
    const u = e.x < n.x ? -1 : 1, d = e.y < n.y ? 1 : -1;
    return `L ${r + o * u},${a}Q ${r},${a} ${r},${a + o * d}`;
  }
  const l = e.x < n.x ? 1 : -1, c = e.y < n.y ? -1 : 1;
  return `L ${r},${a + o * c}Q ${r},${a} ${r + o * l},${a}`;
}
function is({ sourceX: e, sourceY: t, sourcePosition: n = de.Bottom, targetX: i, targetY: o, targetPosition: r = de.Top, borderRadius: a = 5, centerX: l, centerY: c, offset: u = 20, stepPosition: d = 0.5 }) {
  const [f, p, h, w, g] = zb({
    source: { x: e, y: t },
    sourcePosition: n,
    target: { x: i, y: o },
    targetPosition: r,
    center: { x: l, y: c },
    offset: u,
    stepPosition: d
  });
  let _ = `M${f[0].x} ${f[0].y}`;
  for (let b = 1; b < f.length - 1; b++)
    _ += Fb(f[b - 1], f[b], f[b + 1], a);
  return _ += `L${f[f.length - 1].x} ${f[f.length - 1].y}`, [_, p, h, w, g];
}
function Vl(e) {
  return e && !!(e.internals.handleBounds || e.handles?.length) && !!(e.measured.width || e.width || e.initialWidth);
}
function Lb(e) {
  const { sourceNode: t, targetNode: n } = e;
  if (!Vl(t) || !Vl(n))
    return null;
  const i = t.internals.handleBounds || Zl(t.handles), o = n.internals.handleBounds || Zl(n.handles), r = Yl(i?.source ?? [], e.sourceHandle), a = Yl(
    // when connection type is loose we can define all handles as sources and connect source -> source
    e.connectionMode === Bi.Strict ? o?.target ?? [] : (o?.target ?? []).concat(o?.source ?? []),
    e.targetHandle
  );
  if (!r || !a)
    return e.onError?.("008", zt.error008(r ? "target" : "source", {
      id: e.id,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle
    })), null;
  const l = r?.position || de.Bottom, c = a?.position || de.Top, u = bi(t, r, l), d = bi(n, a, c);
  return {
    sourceX: u.x,
    sourceY: u.y,
    targetX: d.x,
    targetY: d.y,
    sourcePosition: l,
    targetPosition: c
  };
}
function Zl(e) {
  if (!e)
    return null;
  const t = [], n = [];
  for (const i of e)
    i.width = i.width ?? 1, i.height = i.height ?? 1, i.type === "source" ? t.push(i) : i.type === "target" && n.push(i);
  return {
    source: t,
    target: n
  };
}
function bi(e, t, n = de.Left, i = !1) {
  const o = (t?.x ?? 0) + e.internals.positionAbsolute.x, r = (t?.y ?? 0) + e.internals.positionAbsolute.y, { width: a, height: l } = t ?? tn(e);
  if (i)
    return { x: o + a / 2, y: r + l / 2 };
  switch (t?.position ?? n) {
    case de.Top:
      return { x: o + a / 2, y: r };
    case de.Right:
      return { x: o + a, y: r + l / 2 };
    case de.Bottom:
      return { x: o + a / 2, y: r + l };
    case de.Left:
      return { x: o, y: r + l / 2 };
  }
}
function Yl(e, t) {
  return e && (t ? e.find((n) => n.id === t) : e[0]) || null;
}
function os(e, t) {
  return e ? typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((i) => `${i}=${e[i]}`).join("&")}` : "";
}
function $b(e, { id: t, defaultColor: n, defaultMarkerStart: i, defaultMarkerEnd: o }) {
  const r = /* @__PURE__ */ new Set();
  return e.reduce((a, l) => ([l.markerStart || i, l.markerEnd || o].forEach((c) => {
    if (c && typeof c == "object") {
      const u = os(c, t);
      r.has(u) || (a.push({ id: u, color: c.color || n, ...c }), r.add(u));
    }
  }), a), []).sort((a, l) => a.id.localeCompare(l.id));
}
const pd = 1e3, Ob = 10, Ws = {
  nodeOrigin: [0, 0],
  nodeExtent: mo,
  elevateNodesOnSelect: !0,
  zIndexMode: "basic",
  defaults: {}
}, Hb = {
  ...Ws,
  checkEquality: !0
};
function Us(e, t) {
  const n = { ...e };
  for (const i in t)
    t[i] !== void 0 && (n[i] = t[i]);
  return n;
}
function Gb(e, t, n) {
  const i = Us(Ws, n);
  for (const o of e.values())
    if (o.parentId)
      Vs(o, e, t, i);
    else {
      const r = Bo(o, i.nodeOrigin), a = zi(o.extent) ? o.extent : i.nodeExtent, l = gi(r, a, tn(o));
      o.internals.positionAbsolute = l;
    }
}
function Wb(e, t) {
  if (!e.handles)
    return e.measured ? t?.internals.handleBounds : void 0;
  const n = [], i = [];
  for (const o of e.handles) {
    const r = {
      id: o.id,
      width: o.width ?? 1,
      height: o.height ?? 1,
      nodeId: e.id,
      x: o.x,
      y: o.y,
      position: o.position,
      type: o.type
    };
    o.type === "source" ? n.push(r) : o.type === "target" && i.push(r);
  }
  return {
    source: n,
    target: i
  };
}
function js(e) {
  return e === "manual";
}
function rs(e, t, n, i = {}) {
  const o = Us(Hb, i), r = { i: 0 }, a = new Map(t), l = o?.elevateNodesOnSelect && !js(o.zIndexMode) ? pd : 0;
  let c = e.length > 0, u = !1;
  t.clear(), n.clear();
  for (const d of e) {
    let f = a.get(d.id);
    if (o.checkEquality && d === f?.internals.userNode)
      t.set(d.id, f);
    else {
      const p = Bo(d, o.nodeOrigin), h = zi(d.extent) ? d.extent : o.nodeExtent, w = gi(p, h, tn(d));
      f = {
        ...o.defaults,
        ...d,
        measured: {
          width: d.measured?.width,
          height: d.measured?.height
        },
        internals: {
          positionAbsolute: w,
          // if user re-initializes the node or removes `measured` for whatever reason, we reset the handleBounds so that the node gets re-measured
          handleBounds: Wb(d, f),
          z: hd(d, l, o.zIndexMode),
          userNode: d
        }
      }, t.set(d.id, f);
    }
    (f.measured === void 0 || f.measured.width === void 0 || f.measured.height === void 0) && !f.hidden && (c = !1), d.parentId && Vs(f, t, n, i, r), u ||= d.selected ?? !1;
  }
  return { nodesInitialized: c, hasSelectedNodes: u };
}
function Ub(e, t) {
  if (!e.parentId)
    return;
  const n = t.get(e.parentId);
  n ? n.set(e.id, e) : t.set(e.parentId, /* @__PURE__ */ new Map([[e.id, e]]));
}
function Vs(e, t, n, i, o) {
  const { elevateNodesOnSelect: r, nodeOrigin: a, nodeExtent: l, zIndexMode: c } = Us(Ws, i), u = e.parentId, d = t.get(u);
  if (!d) {
    console.warn(`Parent node ${u} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`);
    return;
  }
  Ub(e, n), o && !d.parentId && d.internals.rootParentIndex === void 0 && c === "auto" && (d.internals.rootParentIndex = ++o.i, d.internals.z = d.internals.z + o.i * Ob), o && d.internals.rootParentIndex !== void 0 && (o.i = d.internals.rootParentIndex);
  const f = r && !js(c) ? pd : 0, { x: p, y: h, z: w } = jb(e, d, a, l, f, c), { positionAbsolute: g } = e.internals, _ = p !== g.x || h !== g.y;
  (_ || w !== e.internals.z) && t.set(e.id, {
    ...e,
    internals: {
      ...e.internals,
      positionAbsolute: _ ? { x: p, y: h } : g,
      z: w
    }
  });
}
function hd(e, t, n) {
  const i = yt(e.zIndex) ? e.zIndex : 0;
  return js(n) ? i : i + (e.selected ? t : 0);
}
function jb(e, t, n, i, o, r) {
  const { x: a, y: l } = t.internals.positionAbsolute, c = tn(e), u = Bo(e, n), d = zi(e.extent) ? gi(u, e.extent, c) : u;
  let f = gi({ x: a + d.x, y: l + d.y }, i, c);
  e.extent === "parent" && (f = td(f, c, t));
  const p = hd(e, o, r), h = t.internals.z ?? 0;
  return {
    x: f.x,
    y: f.y,
    z: h >= p ? h + 1 : p
  };
}
function Zs(e, t, n, i = [0, 0]) {
  const o = [], r = /* @__PURE__ */ new Map();
  for (const a of e) {
    const l = t.get(a.parentId);
    if (!l)
      continue;
    const c = r.get(a.parentId)?.expandedRect ?? Di(l), u = id(c, a.rect);
    r.set(a.parentId, { expandedRect: u, parent: l });
  }
  return r.size > 0 && r.forEach(({ expandedRect: a, parent: l }, c) => {
    const u = l.internals.positionAbsolute, d = tn(l), f = l.origin ?? i, p = a.x < u.x ? Math.round(Math.abs(u.x - a.x)) : 0, h = a.y < u.y ? Math.round(Math.abs(u.y - a.y)) : 0, w = Math.max(d.width, Math.round(a.width)), g = Math.max(d.height, Math.round(a.height)), _ = (w - d.width) * f[0], b = (g - d.height) * f[1];
    (p > 0 || h > 0 || _ || b) && (o.push({
      id: c,
      type: "position",
      position: {
        x: l.position.x - p + _,
        y: l.position.y - h + b
      }
    }), n.get(c)?.forEach((S) => {
      e.some((m) => m.id === S.id) || o.push({
        id: S.id,
        type: "position",
        position: {
          x: S.position.x + p,
          y: S.position.y + h
        }
      });
    })), (d.width < a.width || d.height < a.height || p || h) && o.push({
      id: c,
      type: "dimensions",
      setAttributes: !0,
      dimensions: {
        width: w + (p ? f[0] * p - _ : 0),
        height: g + (h ? f[1] * h - b : 0)
      }
    });
  }), o;
}
function Vb(e, t, n, i, o, r, a) {
  const l = i?.querySelector(".xyflow__viewport");
  let c = !1;
  if (!l)
    return { changes: [], updatedInternals: c };
  const u = [], d = window.getComputedStyle(l), { m22: f } = new window.DOMMatrixReadOnly(d.transform), p = [];
  for (const h of e.values()) {
    const w = t.get(h.id);
    if (!w)
      continue;
    if (w.hidden) {
      t.set(w.id, {
        ...w,
        internals: {
          ...w.internals,
          handleBounds: void 0
        }
      }), c = !0;
      continue;
    }
    const g = Gs(h.nodeElement), _ = w.measured.width !== g.width || w.measured.height !== g.height;
    if (!!(g.width && g.height && (_ || !w.internals.handleBounds || h.force))) {
      const S = h.nodeElement.getBoundingClientRect(), m = zi(w.extent) ? w.extent : r;
      let { positionAbsolute: y } = w.internals;
      w.parentId && w.extent === "parent" ? y = td(y, g, t.get(w.parentId)) : m && (y = gi(y, m, g));
      const v = {
        ...w,
        measured: g,
        internals: {
          ...w.internals,
          positionAbsolute: y,
          handleBounds: {
            source: Gl("source", h.nodeElement, S, f, w.id),
            target: Gl("target", h.nodeElement, S, f, w.id)
          }
        }
      };
      t.set(w.id, v), w.parentId && Vs(v, t, n, { nodeOrigin: o, zIndexMode: a }), c = !0, _ && (u.push({
        id: w.id,
        type: "dimensions",
        dimensions: g
      }), w.expandParent && w.parentId && p.push({
        id: w.id,
        parentId: w.parentId,
        rect: Di(v, o)
      }));
    }
  }
  if (p.length > 0) {
    const h = Zs(p, t, n, o);
    u.push(...h);
  }
  return { changes: u, updatedInternals: c };
}
async function Zb({ delta: e, panZoom: t, transform: n, translateExtent: i, width: o, height: r }) {
  if (!t || !e.x && !e.y)
    return Promise.resolve(!1);
  const a = await t.setViewportConstrained({
    x: n[0] + e.x,
    y: n[1] + e.y,
    zoom: n[2]
  }, [
    [0, 0],
    [o, r]
  ], i), l = !!a && (a.x !== n[0] || a.y !== n[1] || a.k !== n[2]);
  return Promise.resolve(l);
}
function Xl(e, t, n, i, o, r) {
  let a = o;
  const l = i.get(a) || /* @__PURE__ */ new Map();
  i.set(a, l.set(n, t)), a = `${o}-${e}`;
  const c = i.get(a) || /* @__PURE__ */ new Map();
  if (i.set(a, c.set(n, t)), r) {
    a = `${o}-${e}-${r}`;
    const u = i.get(a) || /* @__PURE__ */ new Map();
    i.set(a, u.set(n, t));
  }
}
function md(e, t, n) {
  e.clear(), t.clear();
  for (const i of n) {
    const { source: o, target: r, sourceHandle: a = null, targetHandle: l = null } = i, c = { edgeId: i.id, source: o, target: r, sourceHandle: a, targetHandle: l }, u = `${o}-${a}--${r}-${l}`, d = `${r}-${l}--${o}-${a}`;
    Xl("source", c, d, e, o, a), Xl("target", c, u, e, r, l), t.set(i.id, i);
  }
}
function gd(e, t) {
  if (!e.parentId)
    return !1;
  const n = t.get(e.parentId);
  return n ? n.selected ? !0 : gd(n, t) : !1;
}
function Kl(e, t, n) {
  let i = e;
  do {
    if (i?.matches?.(t))
      return !0;
    if (i === n)
      return !1;
    i = i?.parentElement;
  } while (i);
  return !1;
}
function Yb(e, t, n, i) {
  const o = /* @__PURE__ */ new Map();
  for (const [r, a] of e)
    if ((a.selected || a.id === i) && (!a.parentId || !gd(a, e)) && (a.draggable || t && typeof a.draggable > "u")) {
      const l = e.get(r);
      l && o.set(r, {
        id: r,
        position: l.position || { x: 0, y: 0 },
        distance: {
          x: n.x - l.internals.positionAbsolute.x,
          y: n.y - l.internals.positionAbsolute.y
        },
        extent: l.extent,
        parentId: l.parentId,
        origin: l.origin,
        expandParent: l.expandParent,
        internals: {
          positionAbsolute: l.internals.positionAbsolute || { x: 0, y: 0 }
        },
        measured: {
          width: l.measured.width ?? 0,
          height: l.measured.height ?? 0
        }
      });
    }
  return o;
}
function ha({ nodeId: e, dragItems: t, nodeLookup: n, dragging: i = !0 }) {
  const o = [];
  for (const [a, l] of t) {
    const c = n.get(a)?.internals.userNode;
    c && o.push({
      ...c,
      position: l.position,
      dragging: i
    });
  }
  if (!e)
    return [o[0], o];
  const r = n.get(e)?.internals.userNode;
  return [
    r ? {
      ...r,
      position: t.get(e)?.position || r.position,
      dragging: i
    } : o[0],
    o
  ];
}
function Xb({ dragItems: e, snapGrid: t, x: n, y: i }) {
  const o = e.values().next().value;
  if (!o)
    return null;
  const r = {
    x: n - o.distance.x,
    y: i - o.distance.y
  }, a = Do(r, t);
  return {
    x: a.x - r.x,
    y: a.y - r.y
  };
}
function Kb({ onNodeMouseDown: e, getStoreItems: t, onDragStart: n, onDrag: i, onDragStop: o }) {
  let r = { x: null, y: null }, a = 0, l = /* @__PURE__ */ new Map(), c = !1, u = { x: 0, y: 0 }, d = null, f = !1, p = null, h = !1, w = !1, g = null;
  function _({ noDragClassName: S, handleSelector: m, domNode: y, isSelectable: v, nodeId: C, nodeClickDistance: T = 0 }) {
    p = et(y);
    function P({ x: E, y: G }) {
      const { nodeLookup: I, nodeExtent: $, snapGrid: R, snapToGrid: L, nodeOrigin: M, onNodeDrag: F, onSelectionDrag: U, onError: V, updateNodePositions: Y } = t();
      r = { x: E, y: G };
      let Z = !1;
      const J = l.size > 1, q = J && $ ? ns(Ro(l)) : null, A = J && L ? Xb({
        dragItems: l,
        snapGrid: R,
        x: E,
        y: G
      }) : null;
      for (const [N, W] of l) {
        if (!I.has(N))
          continue;
        let K = { x: E - W.distance.x, y: G - W.distance.y };
        L && (K = A ? {
          x: Math.round(K.x + A.x),
          y: Math.round(K.y + A.y)
        } : Do(K, R));
        let Q = null;
        if (J && $ && !W.extent && q) {
          const { positionAbsolute: ae } = W.internals, se = ae.x - q.x + $[0][0], te = ae.x + W.measured.width - q.x2 + $[1][0], he = ae.y - q.y + $[0][1], ye = ae.y + W.measured.height - q.y2 + $[1][1];
          Q = [
            [se, he],
            [te, ye]
          ];
        }
        const { position: ne, positionAbsolute: re } = ed({
          nodeId: N,
          nextPosition: K,
          nodeLookup: I,
          nodeExtent: Q || $,
          nodeOrigin: M,
          onError: V
        });
        Z = Z || W.position.x !== ne.x || W.position.y !== ne.y, W.position = ne, W.internals.positionAbsolute = re;
      }
      if (w = w || Z, !!Z && (Y(l, !0), g && (i || F || !C && U))) {
        const [N, W] = ha({
          nodeId: C,
          dragItems: l,
          nodeLookup: I
        });
        i?.(g, l, N, W), F?.(g, N, W), C || U?.(g, W);
      }
    }
    async function D() {
      if (!d)
        return;
      const { transform: E, panBy: G, autoPanSpeed: I, autoPanOnNodeDrag: $ } = t();
      if (!$) {
        c = !1, cancelAnimationFrame(a);
        return;
      }
      const [R, L] = nd(u, d, I);
      (R !== 0 || L !== 0) && (r.x = (r.x ?? 0) - R / E[2], r.y = (r.y ?? 0) - L / E[2], await G({ x: R, y: L }) && P(r)), a = requestAnimationFrame(D);
    }
    function O(E) {
      const { nodeLookup: G, multiSelectionActive: I, nodesDraggable: $, transform: R, snapGrid: L, snapToGrid: M, selectNodesOnDrag: F, onNodeDragStart: U, onSelectionDragStart: V, unselectNodesAndEdges: Y } = t();
      f = !0, (!F || !v) && !I && C && (G.get(C)?.selected || Y()), v && F && C && e?.(C);
      const Z = no(E.sourceEvent, { transform: R, snapGrid: L, snapToGrid: M, containerBounds: d });
      if (r = Z, l = Yb(G, $, Z, C), l.size > 0 && (n || U || !C && V)) {
        const [J, q] = ha({
          nodeId: C,
          dragItems: l,
          nodeLookup: G
        });
        n?.(E.sourceEvent, l, J, q), U?.(E.sourceEvent, J, q), C || V?.(E.sourceEvent, q);
      }
    }
    const z = Bu().clickDistance(T).on("start", (E) => {
      const { domNode: G, nodeDragThreshold: I, transform: $, snapGrid: R, snapToGrid: L } = t();
      d = G?.getBoundingClientRect() || null, h = !1, w = !1, g = E.sourceEvent, I === 0 && O(E), r = no(E.sourceEvent, { transform: $, snapGrid: R, snapToGrid: L, containerBounds: d }), u = vt(E.sourceEvent, d);
    }).on("drag", (E) => {
      const { autoPanOnNodeDrag: G, transform: I, snapGrid: $, snapToGrid: R, nodeDragThreshold: L, nodeLookup: M } = t(), F = no(E.sourceEvent, { transform: I, snapGrid: $, snapToGrid: R, containerBounds: d });
      if (g = E.sourceEvent, (E.sourceEvent.type === "touchmove" && E.sourceEvent.touches.length > 1 || // if user deletes a node while dragging, we need to abort the drag to prevent errors
      C && !M.has(C)) && (h = !0), !h) {
        if (!c && G && f && (c = !0, D()), !f) {
          const U = vt(E.sourceEvent, d), V = U.x - u.x, Y = U.y - u.y;
          Math.sqrt(V * V + Y * Y) > L && O(E);
        }
        (r.x !== F.xSnapped || r.y !== F.ySnapped) && l && f && (u = vt(E.sourceEvent, d), P(F));
      }
    }).on("end", (E) => {
      if (!(!f || h) && (c = !1, f = !1, cancelAnimationFrame(a), l.size > 0)) {
        const { nodeLookup: G, updateNodePositions: I, onNodeDragStop: $, onSelectionDragStop: R } = t();
        if (w && (I(l, !1), w = !1), o || $ || !C && R) {
          const [L, M] = ha({
            nodeId: C,
            dragItems: l,
            nodeLookup: G,
            dragging: !1
          });
          o?.(E.sourceEvent, l, L, M), $?.(E.sourceEvent, L, M), C || R?.(E.sourceEvent, M);
        }
      }
    }).filter((E) => {
      const G = E.target;
      return !E.button && (!S || !Kl(G, `.${S}`, y)) && (!m || Kl(G, m, y));
    });
    p.call(z);
  }
  function b() {
    p?.on(".drag", null);
  }
  return {
    update: _,
    destroy: b
  };
}
function qb(e, t, n) {
  const i = [], o = {
    x: e.x - n,
    y: e.y - n,
    width: n * 2,
    height: n * 2
  };
  for (const r of t.values())
    yo(o, Di(r)) > 0 && i.push(r);
  return i;
}
const Qb = 250;
function Jb(e, t, n, i) {
  let o = [], r = 1 / 0;
  const a = qb(e, n, t + Qb);
  for (const l of a) {
    const c = [...l.internals.handleBounds?.source ?? [], ...l.internals.handleBounds?.target ?? []];
    for (const u of c) {
      if (i.nodeId === u.nodeId && i.type === u.type && i.id === u.id)
        continue;
      const { x: d, y: f } = bi(l, u, u.position, !0), p = Math.sqrt(Math.pow(d - e.x, 2) + Math.pow(f - e.y, 2));
      p > t || (p < r ? (o = [{ ...u, x: d, y: f }], r = p) : p === r && o.push({ ...u, x: d, y: f }));
    }
  }
  if (!o.length)
    return null;
  if (o.length > 1) {
    const l = i.type === "source" ? "target" : "source";
    return o.find((c) => c.type === l) ?? o[0];
  }
  return o[0];
}
function bd(e, t, n, i, o, r = !1) {
  const a = i.get(e);
  if (!a)
    return null;
  const l = o === "strict" ? a.internals.handleBounds?.[t] : [...a.internals.handleBounds?.source ?? [], ...a.internals.handleBounds?.target ?? []], c = (n ? l?.find((u) => u.id === n) : l?.[0]) ?? null;
  return c && r ? { ...c, ...bi(a, c, c.position, !0) } : c;
}
function yd(e, t) {
  return e || (t?.classList.contains("target") ? "target" : t?.classList.contains("source") ? "source" : null);
}
function ey(e, t) {
  let n = null;
  return t ? n = !0 : e && !t && (n = !1), n;
}
const vd = () => !0;
function ty(e, { connectionMode: t, connectionRadius: n, handleId: i, nodeId: o, edgeUpdaterType: r, isTarget: a, domNode: l, nodeLookup: c, lib: u, autoPanOnConnect: d, flowId: f, panBy: p, cancelConnection: h, onConnectStart: w, onConnect: g, onConnectEnd: _, isValidConnection: b = vd, onReconnectEnd: S, updateConnection: m, getTransform: y, getFromHandle: v, autoPanSpeed: C, dragThreshold: T = 1, handleDomNode: P }) {
  const D = ad(e.target);
  let O = 0, z;
  const { x: E, y: G } = vt(e), I = yd(r, P), $ = l?.getBoundingClientRect();
  let R = !1;
  if (!$ || !I)
    return;
  const L = bd(o, I, i, c, t);
  if (!L)
    return;
  let M = vt(e, $), F = !1, U = null, V = !1, Y = null;
  function Z() {
    if (!d || !$)
      return;
    const [ne, re] = nd(M, $, C);
    p({ x: ne, y: re }), O = requestAnimationFrame(Z);
  }
  const J = {
    ...L,
    nodeId: o,
    type: I,
    position: L.position
  }, q = c.get(o);
  let N = {
    inProgress: !0,
    isValid: null,
    from: bi(q, J, de.Left, !0),
    fromHandle: J,
    fromPosition: J.position,
    fromNode: q,
    to: M,
    toHandle: null,
    toPosition: Ll[J.position],
    toNode: null,
    pointer: M
  };
  function W() {
    R = !0, m(N), w?.(e, { nodeId: o, handleId: i, handleType: I });
  }
  T === 0 && W();
  function K(ne) {
    if (!R) {
      const { x: ye, y: _e } = vt(ne), Me = ye - E, Pe = _e - G;
      if (!(Me * Me + Pe * Pe > T * T))
        return;
      W();
    }
    if (!v() || !J) {
      Q(ne);
      return;
    }
    const re = y();
    M = vt(ne, $), z = Jb(zo(M, re, !1, [1, 1]), n, c, J), F || (Z(), F = !0);
    const ae = wd(ne, {
      handle: z,
      connectionMode: t,
      fromNodeId: o,
      fromHandleId: i,
      fromType: a ? "target" : "source",
      isValidConnection: b,
      doc: D,
      lib: u,
      flowId: f,
      nodeLookup: c
    });
    Y = ae.handleDomNode, U = ae.connection, V = ey(!!z, ae.isValid);
    const se = c.get(o), te = se ? bi(se, J, de.Left, !0) : N.from, he = {
      ...N,
      from: te,
      isValid: V,
      to: ae.toHandle && V ? Ir({ x: ae.toHandle.x, y: ae.toHandle.y }, re) : M,
      toHandle: ae.toHandle,
      toPosition: V && ae.toHandle ? ae.toHandle.position : Ll[J.position],
      toNode: ae.toHandle ? c.get(ae.toHandle.nodeId) : null,
      pointer: M
    };
    m(he), N = he;
  }
  function Q(ne) {
    if (!("touches" in ne && ne.touches.length > 0)) {
      if (R) {
        (z || Y) && U && V && g?.(U);
        const { inProgress: re, ...ae } = N, se = {
          ...ae,
          toPosition: N.toHandle ? N.toPosition : null
        };
        _?.(ne, se), r && S?.(ne, se);
      }
      h(), cancelAnimationFrame(O), F = !1, V = !1, U = null, Y = null, D.removeEventListener("mousemove", K), D.removeEventListener("mouseup", Q), D.removeEventListener("touchmove", K), D.removeEventListener("touchend", Q);
    }
  }
  D.addEventListener("mousemove", K), D.addEventListener("mouseup", Q), D.addEventListener("touchmove", K), D.addEventListener("touchend", Q);
}
function wd(e, { handle: t, connectionMode: n, fromNodeId: i, fromHandleId: o, fromType: r, doc: a, lib: l, flowId: c, isValidConnection: u = vd, nodeLookup: d }) {
  const f = r === "target", p = t ? a.querySelector(`.${l}-flow__handle[data-id="${c}-${t?.nodeId}-${t?.id}-${t?.type}"]`) : null, { x: h, y: w } = vt(e), g = a.elementFromPoint(h, w), _ = g?.classList.contains(`${l}-flow__handle`) ? g : p, b = {
    handleDomNode: _,
    isValid: !1,
    connection: null,
    toHandle: null
  };
  if (_) {
    const S = yd(void 0, _), m = _.getAttribute("data-nodeid"), y = _.getAttribute("data-handleid"), v = _.classList.contains("connectable"), C = _.classList.contains("connectableend");
    if (!m || !S)
      return b;
    const T = {
      source: f ? m : i,
      sourceHandle: f ? y : o,
      target: f ? i : m,
      targetHandle: f ? o : y
    };
    b.connection = T;
    const D = v && C && (n === Bi.Strict ? f && S === "source" || !f && S === "target" : m !== i || y !== o);
    b.isValid = D && u(T), b.toHandle = bd(m, S, y, d, n, !0);
  }
  return b;
}
const as = {
  onPointerDown: ty,
  isValid: wd
};
function ny({ domNode: e, panZoom: t, getTransform: n, getViewScale: i }) {
  const o = et(e);
  function r({ translateExtent: l, width: c, height: u, zoomStep: d = 1, pannable: f = !0, zoomable: p = !0, inversePan: h = !1 }) {
    const w = (m) => {
      if (m.sourceEvent.type !== "wheel" || !t)
        return;
      const y = n(), v = m.sourceEvent.ctrlKey && vo() ? 10 : 1, C = -m.sourceEvent.deltaY * (m.sourceEvent.deltaMode === 1 ? 0.05 : m.sourceEvent.deltaMode ? 1 : 2e-3) * d, T = y[2] * Math.pow(2, C * v);
      t.scaleTo(T);
    };
    let g = [0, 0];
    const _ = (m) => {
      (m.sourceEvent.type === "mousedown" || m.sourceEvent.type === "touchstart") && (g = [
        m.sourceEvent.clientX ?? m.sourceEvent.touches[0].clientX,
        m.sourceEvent.clientY ?? m.sourceEvent.touches[0].clientY
      ]);
    }, b = (m) => {
      const y = n();
      if (m.sourceEvent.type !== "mousemove" && m.sourceEvent.type !== "touchmove" || !t)
        return;
      const v = [
        m.sourceEvent.clientX ?? m.sourceEvent.touches[0].clientX,
        m.sourceEvent.clientY ?? m.sourceEvent.touches[0].clientY
      ], C = [v[0] - g[0], v[1] - g[1]];
      g = v;
      const T = i() * Math.max(y[2], Math.log(y[2])) * (h ? -1 : 1), P = {
        x: y[0] - C[0] * T,
        y: y[1] - C[1] * T
      }, D = [
        [0, 0],
        [c, u]
      ];
      t.setViewportConstrained({
        x: P.x,
        y: P.y,
        zoom: y[2]
      }, D, l);
    }, S = Yu().on("start", _).on("zoom", f ? b : null).on("zoom.wheel", p ? w : null);
    o.call(S, {});
  }
  function a() {
    o.on("zoom", null);
  }
  return {
    update: r,
    destroy: a,
    pointer: ht
  };
}
const qr = (e) => ({
  x: e.x,
  y: e.y,
  zoom: e.k
}), ma = ({ x: e, y: t, zoom: n }) => Yr.translate(e, t).scale(n), Ii = (e, t) => e.target.closest(`.${t}`), xd = (e, t) => t === 2 && Array.isArray(e) && e.includes(2), iy = (e) => ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2, ga = (e, t = 0, n = iy, i = () => {
}) => {
  const o = typeof t == "number" && t > 0;
  return o || i(), o ? e.transition().duration(t).ease(n).on("end", i) : e;
}, _d = (e) => {
  const t = e.ctrlKey && vo() ? 10 : 1;
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * t;
};
function oy({ zoomPanValues: e, noWheelClassName: t, d3Selection: n, d3Zoom: i, panOnScrollMode: o, panOnScrollSpeed: r, zoomOnPinch: a, onPanZoomStart: l, onPanZoom: c, onPanZoomEnd: u }) {
  return (d) => {
    if (Ii(d, t))
      return d.ctrlKey && d.preventDefault(), !1;
    d.preventDefault(), d.stopImmediatePropagation();
    const f = n.property("__zoom").k || 1;
    if (d.ctrlKey && a) {
      const _ = ht(d), b = _d(d), S = f * Math.pow(2, b);
      i.scaleTo(n, S, _, d);
      return;
    }
    const p = d.deltaMode === 1 ? 20 : 1;
    let h = o === pi.Vertical ? 0 : d.deltaX * p, w = o === pi.Horizontal ? 0 : d.deltaY * p;
    !vo() && d.shiftKey && o !== pi.Vertical && (h = d.deltaY * p, w = 0), i.translateBy(
      n,
      -(h / f) * r,
      -(w / f) * r,
      // @ts-ignore
      { internal: !0 }
    );
    const g = qr(n.property("__zoom"));
    clearTimeout(e.panScrollTimeout), e.isPanScrolling ? (c?.(d, g), e.panScrollTimeout = setTimeout(() => {
      u?.(d, g), e.isPanScrolling = !1;
    }, 150)) : (e.isPanScrolling = !0, l?.(d, g));
  };
}
function ry({ noWheelClassName: e, preventScrolling: t, d3ZoomHandler: n }) {
  return function(i, o) {
    const r = i.type === "wheel", a = !t && r && !i.ctrlKey, l = Ii(i, e);
    if (i.ctrlKey && r && l && i.preventDefault(), a || l)
      return null;
    i.preventDefault(), n.call(this, i, o);
  };
}
function ay({ zoomPanValues: e, onDraggingChange: t, onPanZoomStart: n }) {
  return (i) => {
    if (i.sourceEvent?.internal)
      return;
    const o = qr(i.transform);
    e.mouseButton = i.sourceEvent?.button || 0, e.isZoomingOrPanning = !0, e.prevViewport = o, i.sourceEvent?.type === "mousedown" && t(!0), n && n?.(i.sourceEvent, o);
  };
}
function sy({ zoomPanValues: e, panOnDrag: t, onPaneContextMenu: n, onTransformChange: i, onPanZoom: o }) {
  return (r) => {
    e.usedRightMouseButton = !!(n && xd(t, e.mouseButton ?? 0)), r.sourceEvent?.sync || i([r.transform.x, r.transform.y, r.transform.k]), o && !r.sourceEvent?.internal && o?.(r.sourceEvent, qr(r.transform));
  };
}
function ly({ zoomPanValues: e, panOnDrag: t, panOnScroll: n, onDraggingChange: i, onPanZoomEnd: o, onPaneContextMenu: r }) {
  return (a) => {
    if (!a.sourceEvent?.internal && (e.isZoomingOrPanning = !1, r && xd(t, e.mouseButton ?? 0) && !e.usedRightMouseButton && a.sourceEvent && r(a.sourceEvent), e.usedRightMouseButton = !1, i(!1), o)) {
      const l = qr(a.transform);
      e.prevViewport = l, clearTimeout(e.timerId), e.timerId = setTimeout(
        () => {
          o?.(a.sourceEvent, l);
        },
        // we need a setTimeout for panOnScroll to suppress multiple end events fired during scroll
        n ? 150 : 0
      );
    }
  };
}
function cy({ zoomActivationKeyPressed: e, zoomOnScroll: t, zoomOnPinch: n, panOnDrag: i, panOnScroll: o, zoomOnDoubleClick: r, userSelectionActive: a, noWheelClassName: l, noPanClassName: c, lib: u, connectionInProgress: d }) {
  return (f) => {
    const p = e || t, h = n && f.ctrlKey, w = f.type === "wheel";
    if (f.button === 1 && f.type === "mousedown" && (Ii(f, `${u}-flow__node`) || Ii(f, `${u}-flow__edge`)))
      return !0;
    if (!i && !p && !o && !r && !n || a || d && !w || Ii(f, l) && w || Ii(f, c) && (!w || o && w && !e) || !n && f.ctrlKey && w)
      return !1;
    if (!n && f.type === "touchstart" && f.touches?.length > 1)
      return f.preventDefault(), !1;
    if (!p && !o && !h && w || !i && (f.type === "mousedown" || f.type === "touchstart") || Array.isArray(i) && !i.includes(f.button) && f.type === "mousedown")
      return !1;
    const g = Array.isArray(i) && i.includes(f.button) || !f.button || f.button <= 1;
    return (!f.ctrlKey || w) && g;
  };
}
function uy({ domNode: e, minZoom: t, maxZoom: n, translateExtent: i, viewport: o, onPanZoom: r, onPanZoomStart: a, onPanZoomEnd: l, onDraggingChange: c }) {
  const u = {
    isZoomingOrPanning: !1,
    usedRightMouseButton: !1,
    prevViewport: {},
    mouseButton: 0,
    timerId: void 0,
    panScrollTimeout: void 0,
    isPanScrolling: !1
  }, d = e.getBoundingClientRect(), f = Yu().scaleExtent([t, n]).translateExtent(i), p = et(e).call(f);
  S({
    x: o.x,
    y: o.y,
    zoom: Ri(o.zoom, t, n)
  }, [
    [0, 0],
    [d.width, d.height]
  ], i);
  const h = p.on("wheel.zoom"), w = p.on("dblclick.zoom");
  f.wheelDelta(_d);
  function g(z, E) {
    return p ? new Promise((G) => {
      f?.interpolate(E?.interpolate === "linear" ? to : pr).transform(ga(p, E?.duration, E?.ease, () => G(!0)), z);
    }) : Promise.resolve(!1);
  }
  function _({ noWheelClassName: z, noPanClassName: E, onPaneContextMenu: G, userSelectionActive: I, panOnScroll: $, panOnDrag: R, panOnScrollMode: L, panOnScrollSpeed: M, preventScrolling: F, zoomOnPinch: U, zoomOnScroll: V, zoomOnDoubleClick: Y, zoomActivationKeyPressed: Z, lib: J, onTransformChange: q, connectionInProgress: A, paneClickDistance: N, selectionOnDrag: W }) {
    I && !u.isZoomingOrPanning && b();
    const K = $ && !Z && !I;
    f.clickDistance(W ? 1 / 0 : !yt(N) || N < 0 ? 0 : N);
    const Q = K ? oy({
      zoomPanValues: u,
      noWheelClassName: z,
      d3Selection: p,
      d3Zoom: f,
      panOnScrollMode: L,
      panOnScrollSpeed: M,
      zoomOnPinch: U,
      onPanZoomStart: a,
      onPanZoom: r,
      onPanZoomEnd: l
    }) : ry({
      noWheelClassName: z,
      preventScrolling: F,
      d3ZoomHandler: h
    });
    if (p.on("wheel.zoom", Q, { passive: !1 }), !I) {
      const re = ay({
        zoomPanValues: u,
        onDraggingChange: c,
        onPanZoomStart: a
      });
      f.on("start", re);
      const ae = sy({
        zoomPanValues: u,
        panOnDrag: R,
        onPaneContextMenu: !!G,
        onPanZoom: r,
        onTransformChange: q
      });
      f.on("zoom", ae);
      const se = ly({
        zoomPanValues: u,
        panOnDrag: R,
        panOnScroll: $,
        onPaneContextMenu: G,
        onPanZoomEnd: l,
        onDraggingChange: c
      });
      f.on("end", se);
    }
    const ne = cy({
      zoomActivationKeyPressed: Z,
      panOnDrag: R,
      zoomOnScroll: V,
      panOnScroll: $,
      zoomOnDoubleClick: Y,
      zoomOnPinch: U,
      userSelectionActive: I,
      noPanClassName: E,
      noWheelClassName: z,
      lib: J,
      connectionInProgress: A
    });
    f.filter(ne), Y ? p.on("dblclick.zoom", w) : p.on("dblclick.zoom", null);
  }
  function b() {
    f.on("zoom", null);
  }
  async function S(z, E, G) {
    const I = ma(z), $ = f?.constrain()(I, E, G);
    return $ && await g($), new Promise((R) => R($));
  }
  async function m(z, E) {
    const G = ma(z);
    return await g(G, E), new Promise((I) => I(G));
  }
  function y(z) {
    if (p) {
      const E = ma(z), G = p.property("__zoom");
      (G.k !== z.zoom || G.x !== z.x || G.y !== z.y) && f?.transform(p, E, null, { sync: !0 });
    }
  }
  function v() {
    const z = p ? Zu(p.node()) : { x: 0, y: 0, k: 1 };
    return { x: z.x, y: z.y, zoom: z.k };
  }
  function C(z, E) {
    return p ? new Promise((G) => {
      f?.interpolate(E?.interpolate === "linear" ? to : pr).scaleTo(ga(p, E?.duration, E?.ease, () => G(!0)), z);
    }) : Promise.resolve(!1);
  }
  function T(z, E) {
    return p ? new Promise((G) => {
      f?.interpolate(E?.interpolate === "linear" ? to : pr).scaleBy(ga(p, E?.duration, E?.ease, () => G(!0)), z);
    }) : Promise.resolve(!1);
  }
  function P(z) {
    f?.scaleExtent(z);
  }
  function D(z) {
    f?.translateExtent(z);
  }
  function O(z) {
    const E = !yt(z) || z < 0 ? 0 : z;
    f?.clickDistance(E);
  }
  return {
    update: _,
    destroy: b,
    setViewport: m,
    setViewportConstrained: S,
    getViewport: v,
    scaleTo: C,
    scaleBy: T,
    setScaleExtent: P,
    setTranslateExtent: D,
    syncViewport: y,
    setClickDistance: O
  };
}
var Fi;
(function(e) {
  e.Line = "line", e.Handle = "handle";
})(Fi || (Fi = {}));
function dy({ width: e, prevWidth: t, height: n, prevHeight: i, affectsX: o, affectsY: r }) {
  const a = e - t, l = n - i, c = [a > 0 ? 1 : a < 0 ? -1 : 0, l > 0 ? 1 : l < 0 ? -1 : 0];
  return a && o && (c[0] = c[0] * -1), l && r && (c[1] = c[1] * -1), c;
}
function ql(e) {
  const t = e.includes("right") || e.includes("left"), n = e.includes("bottom") || e.includes("top"), i = e.includes("left"), o = e.includes("top");
  return {
    isHorizontal: t,
    isVertical: n,
    affectsX: i,
    affectsY: o
  };
}
function Sn(e, t) {
  return Math.max(0, t - e);
}
function Mn(e, t) {
  return Math.max(0, e - t);
}
function Yo(e, t, n) {
  return Math.max(0, t - e, e - n);
}
function Ql(e, t) {
  return e ? !t : t;
}
function fy(e, t, n, i, o, r, a, l) {
  let { affectsX: c, affectsY: u } = t;
  const { isHorizontal: d, isVertical: f } = t, p = d && f, { xSnapped: h, ySnapped: w } = n, { minWidth: g, maxWidth: _, minHeight: b, maxHeight: S } = i, { x: m, y, width: v, height: C, aspectRatio: T } = e;
  let P = Math.floor(d ? h - e.pointerX : 0), D = Math.floor(f ? w - e.pointerY : 0);
  const O = v + (c ? -P : P), z = C + (u ? -D : D), E = -r[0] * v, G = -r[1] * C;
  let I = Yo(O, g, _), $ = Yo(z, b, S);
  if (a) {
    let M = 0, F = 0;
    c && P < 0 ? M = Sn(m + P + E, a[0][0]) : !c && P > 0 && (M = Mn(m + O + E, a[1][0])), u && D < 0 ? F = Sn(y + D + G, a[0][1]) : !u && D > 0 && (F = Mn(y + z + G, a[1][1])), I = Math.max(I, M), $ = Math.max($, F);
  }
  if (l) {
    let M = 0, F = 0;
    c && P > 0 ? M = Mn(m + P, l[0][0]) : !c && P < 0 && (M = Sn(m + O, l[1][0])), u && D > 0 ? F = Mn(y + D, l[0][1]) : !u && D < 0 && (F = Sn(y + z, l[1][1])), I = Math.max(I, M), $ = Math.max($, F);
  }
  if (o) {
    if (d) {
      const M = Yo(O / T, b, S) * T;
      if (I = Math.max(I, M), a) {
        let F = 0;
        !c && !u || c && !u && p ? F = Mn(y + G + O / T, a[1][1]) * T : F = Sn(y + G + (c ? P : -P) / T, a[0][1]) * T, I = Math.max(I, F);
      }
      if (l) {
        let F = 0;
        !c && !u || c && !u && p ? F = Sn(y + O / T, l[1][1]) * T : F = Mn(y + (c ? P : -P) / T, l[0][1]) * T, I = Math.max(I, F);
      }
    }
    if (f) {
      const M = Yo(z * T, g, _) / T;
      if ($ = Math.max($, M), a) {
        let F = 0;
        !c && !u || u && !c && p ? F = Mn(m + z * T + E, a[1][0]) / T : F = Sn(m + (u ? D : -D) * T + E, a[0][0]) / T, $ = Math.max($, F);
      }
      if (l) {
        let F = 0;
        !c && !u || u && !c && p ? F = Sn(m + z * T, l[1][0]) / T : F = Mn(m + (u ? D : -D) * T, l[0][0]) / T, $ = Math.max($, F);
      }
    }
  }
  D = D + (D < 0 ? $ : -$), P = P + (P < 0 ? I : -I), o && (p ? O > z * T ? D = (Ql(c, u) ? -P : P) / T : P = (Ql(c, u) ? -D : D) * T : d ? (D = P / T, u = c) : (P = D * T, c = u));
  const R = c ? m + P : m, L = u ? y + D : y;
  return {
    width: v + (c ? -P : P),
    height: C + (u ? -D : D),
    x: r[0] * P * (c ? -1 : 1) + R,
    y: r[1] * D * (u ? -1 : 1) + L
  };
}
const Sd = { width: 0, height: 0, x: 0, y: 0 }, py = {
  ...Sd,
  pointerX: 0,
  pointerY: 0,
  aspectRatio: 1
};
function hy(e) {
  return [
    [0, 0],
    [e.measured.width, e.measured.height]
  ];
}
function my(e, t, n) {
  const i = t.position.x + e.position.x, o = t.position.y + e.position.y, r = e.measured.width ?? 0, a = e.measured.height ?? 0, l = n[0] * r, c = n[1] * a;
  return [
    [i - l, o - c],
    [i + r - l, o + a - c]
  ];
}
function gy({ domNode: e, nodeId: t, getStoreItems: n, onChange: i, onEnd: o }) {
  const r = et(e);
  let a = {
    controlDirection: ql("bottom-right"),
    boundaries: {
      minWidth: 0,
      minHeight: 0,
      maxWidth: Number.MAX_VALUE,
      maxHeight: Number.MAX_VALUE
    },
    resizeDirection: void 0,
    keepAspectRatio: !1
  };
  function l({ controlPosition: u, boundaries: d, keepAspectRatio: f, resizeDirection: p, onResizeStart: h, onResize: w, onResizeEnd: g, shouldResize: _ }) {
    let b = { ...Sd }, S = { ...py };
    a = {
      boundaries: d,
      resizeDirection: p,
      keepAspectRatio: f,
      controlDirection: ql(u)
    };
    let m, y = null, v = [], C, T, P, D = !1;
    const O = Bu().on("start", (z) => {
      const { nodeLookup: E, transform: G, snapGrid: I, snapToGrid: $, nodeOrigin: R, paneDomNode: L } = n();
      if (m = E.get(t), !m)
        return;
      y = L?.getBoundingClientRect() ?? null;
      const { xSnapped: M, ySnapped: F } = no(z.sourceEvent, {
        transform: G,
        snapGrid: I,
        snapToGrid: $,
        containerBounds: y
      });
      b = {
        width: m.measured.width ?? 0,
        height: m.measured.height ?? 0,
        x: m.position.x ?? 0,
        y: m.position.y ?? 0
      }, S = {
        ...b,
        pointerX: M,
        pointerY: F,
        aspectRatio: b.width / b.height
      }, C = void 0, m.parentId && (m.extent === "parent" || m.expandParent) && (C = E.get(m.parentId), T = C && m.extent === "parent" ? hy(C) : void 0), v = [], P = void 0;
      for (const [U, V] of E)
        if (V.parentId === t && (v.push({
          id: U,
          position: { ...V.position },
          extent: V.extent
        }), V.extent === "parent" || V.expandParent)) {
          const Y = my(V, m, V.origin ?? R);
          P ? P = [
            [Math.min(Y[0][0], P[0][0]), Math.min(Y[0][1], P[0][1])],
            [Math.max(Y[1][0], P[1][0]), Math.max(Y[1][1], P[1][1])]
          ] : P = Y;
        }
      h?.(z, { ...b });
    }).on("drag", (z) => {
      const { transform: E, snapGrid: G, snapToGrid: I, nodeOrigin: $ } = n(), R = no(z.sourceEvent, {
        transform: E,
        snapGrid: G,
        snapToGrid: I,
        containerBounds: y
      }), L = [];
      if (!m)
        return;
      const { x: M, y: F, width: U, height: V } = b, Y = {}, Z = m.origin ?? $, { width: J, height: q, x: A, y: N } = fy(S, a.controlDirection, R, a.boundaries, a.keepAspectRatio, Z, T, P), W = J !== U, K = q !== V, Q = A !== M && W, ne = N !== F && K;
      if (!Q && !ne && !W && !K)
        return;
      if ((Q || ne || Z[0] === 1 || Z[1] === 1) && (Y.x = Q ? A : b.x, Y.y = ne ? N : b.y, b.x = Y.x, b.y = Y.y, v.length > 0)) {
        const te = A - M, he = N - F;
        for (const ye of v)
          ye.position = {
            x: ye.position.x - te + Z[0] * (J - U),
            y: ye.position.y - he + Z[1] * (q - V)
          }, L.push(ye);
      }
      if ((W || K) && (Y.width = W && (!a.resizeDirection || a.resizeDirection === "horizontal") ? J : b.width, Y.height = K && (!a.resizeDirection || a.resizeDirection === "vertical") ? q : b.height, b.width = Y.width, b.height = Y.height), C && m.expandParent) {
        const te = Z[0] * (Y.width ?? 0);
        Y.x && Y.x < te && (b.x = te, S.x = S.x - (Y.x - te));
        const he = Z[1] * (Y.height ?? 0);
        Y.y && Y.y < he && (b.y = he, S.y = S.y - (Y.y - he));
      }
      const re = dy({
        width: b.width,
        prevWidth: U,
        height: b.height,
        prevHeight: V,
        affectsX: a.controlDirection.affectsX,
        affectsY: a.controlDirection.affectsY
      }), ae = { ...b, direction: re };
      _?.(z, ae) !== !1 && (D = !0, w?.(z, ae), i(Y, L));
    }).on("end", (z) => {
      D && (g?.(z, { ...b }), o?.({ ...b }), D = !1);
    });
    r.call(O);
  }
  function c() {
    r.on(".drag", null);
  }
  return {
    update: l,
    destroy: c
  };
}
const Qr = ws(null), by = Qr.Provider, Md = zt.error001();
function Se(e, t) {
  const n = To(Qr);
  if (n === null)
    throw new Error(Md);
  return Wp(n, e, t);
}
function ke() {
  const e = To(Qr);
  if (e === null)
    throw new Error(Md);
  return X(() => ({
    getState: e.getState,
    setState: e.setState,
    subscribe: e.subscribe
  }), [e]);
}
const Jl = { display: "none" }, yy = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0px, 0px, 0px, 0px)",
  clipPath: "inset(100%)"
}, Cd = "react-flow__node-desc", Nd = "react-flow__edge-desc", vy = "react-flow__aria-live", wy = (e) => e.ariaLiveMessage, xy = (e) => e.ariaLabelConfig;
function _y({ rfId: e }) {
  const t = Se(wy);
  return s("div", { id: `${vy}-${e}`, "aria-live": "assertive", "aria-atomic": "true", style: yy, children: t });
}
function Sy({ rfId: e, disableKeyboardA11y: t }) {
  const n = Se(xy);
  return x(be, { children: [s("div", { id: `${Cd}-${e}`, style: Jl, children: t ? n["node.a11yDescription.default"] : n["node.a11yDescription.keyboardDisabled"] }), s("div", { id: `${Nd}-${e}`, style: Jl, children: n["edge.a11yDescription.default"] }), !t && s(_y, { rfId: e })] });
}
const Jr = lu(({ position: e = "top-left", children: t, className: n, style: i, ...o }, r) => {
  const a = `${e}`.split("-");
  return s("div", { className: Fe(["react-flow__panel", n, ...a]), style: i, ref: r, ...o, children: t });
});
Jr.displayName = "Panel";
function My({ proOptions: e, position: t = "bottom-right" }) {
  return e?.hideAttribution ? null : s(Jr, { position: t, className: "react-flow__attribution", "data-message": "Please only hide this attribution when you are subscribed to React Flow Pro: https://pro.reactflow.dev", children: s("a", { href: "https://reactflow.dev", target: "_blank", rel: "noopener noreferrer", "aria-label": "React Flow attribution", children: "React Flow" }) });
}
const Cy = (e) => {
  const t = [], n = [];
  for (const [, i] of e.nodeLookup)
    i.selected && t.push(i.internals.userNode);
  for (const [, i] of e.edgeLookup)
    i.selected && n.push(i);
  return { selectedNodes: t, selectedEdges: n };
}, Xo = (e) => e.id;
function Ny(e, t) {
  return Ae(e.selectedNodes.map(Xo), t.selectedNodes.map(Xo)) && Ae(e.selectedEdges.map(Xo), t.selectedEdges.map(Xo));
}
function Iy({ onSelectionChange: e }) {
  const t = ke(), { selectedNodes: n, selectedEdges: i } = Se(Cy, Ny);
  return oe(() => {
    const o = { nodes: n, edges: i };
    e?.(o), t.getState().onSelectionChangeHandlers.forEach((r) => r(o));
  }, [n, i, e]), null;
}
const Ty = (e) => !!e.onSelectionChangeHandlers;
function Ey({ onSelectionChange: e }) {
  const t = Se(Ty);
  return e || t ? s(Iy, { onSelectionChange: e }) : null;
}
const ss = typeof window < "u" ? Ke : oe, Id = [0, 0], Ay = { x: 0, y: 0, zoom: 1 }, ky = [
  "nodes",
  "edges",
  "defaultNodes",
  "defaultEdges",
  "onConnect",
  "onConnectStart",
  "onConnectEnd",
  "onClickConnectStart",
  "onClickConnectEnd",
  "nodesDraggable",
  "autoPanOnNodeFocus",
  "nodesConnectable",
  "nodesFocusable",
  "edgesFocusable",
  "edgesReconnectable",
  "elevateNodesOnSelect",
  "elevateEdgesOnSelect",
  "minZoom",
  "maxZoom",
  "nodeExtent",
  "onNodesChange",
  "onEdgesChange",
  "elementsSelectable",
  "connectionMode",
  "snapGrid",
  "snapToGrid",
  "translateExtent",
  "connectOnClick",
  "defaultEdgeOptions",
  "fitView",
  "fitViewOptions",
  "onNodesDelete",
  "onEdgesDelete",
  "onDelete",
  "onNodeDrag",
  "onNodeDragStart",
  "onNodeDragStop",
  "onSelectionDrag",
  "onSelectionDragStart",
  "onSelectionDragStop",
  "onMoveStart",
  "onMove",
  "onMoveEnd",
  "noPanClassName",
  "nodeOrigin",
  "autoPanOnConnect",
  "autoPanOnNodeDrag",
  "onError",
  "connectionRadius",
  "isValidConnection",
  "selectNodesOnDrag",
  "nodeDragThreshold",
  "connectionDragThreshold",
  "onBeforeDelete",
  "debug",
  "autoPanSpeed",
  "ariaLabelConfig",
  "zIndexMode"
], ec = [...ky, "rfId"], Py = (e) => ({
  setNodes: e.setNodes,
  setEdges: e.setEdges,
  setMinZoom: e.setMinZoom,
  setMaxZoom: e.setMaxZoom,
  setTranslateExtent: e.setTranslateExtent,
  setNodeExtent: e.setNodeExtent,
  reset: e.reset,
  setDefaultNodesAndEdges: e.setDefaultNodesAndEdges
}), tc = {
  /*
   * these are values that are also passed directly to other components
   * than the StoreUpdater. We can reduce the number of setStore calls
   * by setting the same values here as prev fields.
   */
  translateExtent: mo,
  nodeOrigin: Id,
  minZoom: 0.5,
  maxZoom: 2,
  elementsSelectable: !0,
  noPanClassName: "nopan",
  rfId: "1"
};
function By(e) {
  const { setNodes: t, setEdges: n, setMinZoom: i, setMaxZoom: o, setTranslateExtent: r, setNodeExtent: a, reset: l, setDefaultNodesAndEdges: c } = Se(Py, Ae), u = ke();
  ss(() => (c(e.defaultNodes, e.defaultEdges), () => {
    d.current = tc, l();
  }), []);
  const d = ee(tc);
  return ss(
    () => {
      for (const f of ec) {
        const p = e[f], h = d.current[f];
        p !== h && (typeof e[f] > "u" || (f === "nodes" ? t(p) : f === "edges" ? n(p) : f === "minZoom" ? i(p) : f === "maxZoom" ? o(p) : f === "translateExtent" ? r(p) : f === "nodeExtent" ? a(p) : f === "ariaLabelConfig" ? u.setState({ ariaLabelConfig: Tb(p) }) : f === "fitView" ? u.setState({ fitViewQueued: p }) : f === "fitViewOptions" ? u.setState({ fitViewOptions: p }) : u.setState({ [f]: p })));
      }
      d.current = e;
    },
    // Only re-run the effect if one of the fields we track changes
    ec.map((f) => e[f])
  ), null;
}
function nc() {
  return typeof window > "u" || !window.matchMedia ? null : window.matchMedia("(prefers-color-scheme: dark)");
}
function Ry(e) {
  const [t, n] = le(e === "system" ? null : e);
  return oe(() => {
    if (e !== "system") {
      n(e);
      return;
    }
    const i = nc(), o = () => n(i?.matches ? "dark" : "light");
    return o(), i?.addEventListener("change", o), () => {
      i?.removeEventListener("change", o);
    };
  }, [e]), t !== null ? t : nc()?.matches ? "dark" : "light";
}
const ic = typeof document < "u" ? document : null;
function wo(e = null, t = { target: ic, actInsideInputWithModifier: !0 }) {
  const [n, i] = le(!1), o = ee(!1), r = ee(/* @__PURE__ */ new Set([])), [a, l] = X(() => {
    if (e !== null) {
      const u = (Array.isArray(e) ? e : [e]).filter((f) => typeof f == "string").map((f) => f.replace("+", `
`).replace(`

`, `
+`).split(`
`)), d = u.reduce((f, p) => f.concat(...p), []);
      return [u, d];
    }
    return [[], []];
  }, [e]);
  return oe(() => {
    const c = t?.target ?? ic, u = t?.actInsideInputWithModifier ?? !0;
    if (e !== null) {
      const d = (h) => {
        if (o.current = h.ctrlKey || h.metaKey || h.shiftKey || h.altKey, (!o.current || o.current && !u) && sd(h))
          return !1;
        const g = rc(h.code, l);
        if (r.current.add(h[g]), oc(a, r.current, !1)) {
          const _ = h.composedPath?.()?.[0] || h.target, b = _?.nodeName === "BUTTON" || _?.nodeName === "A";
          t.preventDefault !== !1 && (o.current || !b) && h.preventDefault(), i(!0);
        }
      }, f = (h) => {
        const w = rc(h.code, l);
        oc(a, r.current, !0) ? (i(!1), r.current.clear()) : r.current.delete(h[w]), h.key === "Meta" && r.current.clear(), o.current = !1;
      }, p = () => {
        r.current.clear(), i(!1);
      };
      return c?.addEventListener("keydown", d), c?.addEventListener("keyup", f), window.addEventListener("blur", p), window.addEventListener("contextmenu", p), () => {
        c?.removeEventListener("keydown", d), c?.removeEventListener("keyup", f), window.removeEventListener("blur", p), window.removeEventListener("contextmenu", p);
      };
    }
  }, [e, i]), n;
}
function oc(e, t, n) {
  return e.filter((i) => n || i.length === t.size).some((i) => i.every((o) => t.has(o)));
}
function rc(e, t) {
  return t.includes(e) ? "code" : "key";
}
const Dy = () => {
  const e = ke();
  return X(() => ({
    zoomIn: (t) => {
      const { panZoom: n } = e.getState();
      return n ? n.scaleBy(1.2, t) : Promise.resolve(!1);
    },
    zoomOut: (t) => {
      const { panZoom: n } = e.getState();
      return n ? n.scaleBy(1 / 1.2, t) : Promise.resolve(!1);
    },
    zoomTo: (t, n) => {
      const { panZoom: i } = e.getState();
      return i ? i.scaleTo(t, n) : Promise.resolve(!1);
    },
    getZoom: () => e.getState().transform[2],
    setViewport: async (t, n) => {
      const { transform: [i, o, r], panZoom: a } = e.getState();
      return a ? (await a.setViewport({
        x: t.x ?? i,
        y: t.y ?? o,
        zoom: t.zoom ?? r
      }, n), Promise.resolve(!0)) : Promise.resolve(!1);
    },
    getViewport: () => {
      const [t, n, i] = e.getState().transform;
      return { x: t, y: n, zoom: i };
    },
    setCenter: async (t, n, i) => e.getState().setCenter(t, n, i),
    fitBounds: async (t, n) => {
      const { width: i, height: o, minZoom: r, maxZoom: a, panZoom: l } = e.getState(), c = Hs(t, i, o, r, a, n?.padding ?? 0.1);
      return l ? (await l.setViewport(c, {
        duration: n?.duration,
        ease: n?.ease,
        interpolate: n?.interpolate
      }), Promise.resolve(!0)) : Promise.resolve(!1);
    },
    screenToFlowPosition: (t, n = {}) => {
      const { transform: i, snapGrid: o, snapToGrid: r, domNode: a } = e.getState();
      if (!a)
        return t;
      const { x: l, y: c } = a.getBoundingClientRect(), u = {
        x: t.x - l,
        y: t.y - c
      }, d = n.snapGrid ?? o, f = n.snapToGrid ?? r;
      return zo(u, i, f, d);
    },
    flowToScreenPosition: (t) => {
      const { transform: n, domNode: i } = e.getState();
      if (!i)
        return t;
      const { x: o, y: r } = i.getBoundingClientRect(), a = Ir(t, n);
      return {
        x: a.x + o,
        y: a.y + r
      };
    }
  }), []);
};
function Td(e, t) {
  const n = [], i = /* @__PURE__ */ new Map(), o = [];
  for (const r of e)
    if (r.type === "add") {
      o.push(r);
      continue;
    } else if (r.type === "remove" || r.type === "replace")
      i.set(r.id, [r]);
    else {
      const a = i.get(r.id);
      a ? a.push(r) : i.set(r.id, [r]);
    }
  for (const r of t) {
    const a = i.get(r.id);
    if (!a) {
      n.push(r);
      continue;
    }
    if (a[0].type === "remove")
      continue;
    if (a[0].type === "replace") {
      n.push({ ...a[0].item });
      continue;
    }
    const l = { ...r };
    for (const c of a)
      zy(c, l);
    n.push(l);
  }
  return o.length && o.forEach((r) => {
    r.index !== void 0 ? n.splice(r.index, 0, { ...r.item }) : n.push({ ...r.item });
  }), n;
}
function zy(e, t) {
  switch (e.type) {
    case "select": {
      t.selected = e.selected;
      break;
    }
    case "position": {
      typeof e.position < "u" && (t.position = e.position), typeof e.dragging < "u" && (t.dragging = e.dragging);
      break;
    }
    case "dimensions": {
      typeof e.dimensions < "u" && (t.measured = {
        ...e.dimensions
      }, e.setAttributes && ((e.setAttributes === !0 || e.setAttributes === "width") && (t.width = e.dimensions.width), (e.setAttributes === !0 || e.setAttributes === "height") && (t.height = e.dimensions.height))), typeof e.resizing == "boolean" && (t.resizing = e.resizing);
      break;
    }
  }
}
function Ed(e, t) {
  return Td(e, t);
}
function Ad(e, t) {
  return Td(e, t);
}
function li(e, t) {
  return {
    id: e,
    type: "select",
    selected: t
  };
}
function Ti(e, t = /* @__PURE__ */ new Set(), n = !1) {
  const i = [];
  for (const [o, r] of e) {
    const a = t.has(o);
    !(r.selected === void 0 && !a) && r.selected !== a && (n && (r.selected = a), i.push(li(r.id, a)));
  }
  return i;
}
function ac({ items: e = [], lookup: t }) {
  const n = [], i = new Map(e.map((o) => [o.id, o]));
  for (const [o, r] of e.entries()) {
    const a = t.get(r.id), l = a?.internals?.userNode ?? a;
    l !== void 0 && l !== r && n.push({ id: r.id, item: r, type: "replace" }), l === void 0 && n.push({ item: r, type: "add", index: o });
  }
  for (const [o] of t)
    i.get(o) === void 0 && n.push({ id: o, type: "remove" });
  return n;
}
function sc(e) {
  return {
    id: e.id,
    type: "remove"
  };
}
const lc = (e) => yb(e), Fy = (e) => Ju(e);
function kd(e) {
  return lu(e);
}
function cc(e) {
  const [t, n] = le(BigInt(0)), [i] = le(() => Ly(() => n((o) => o + BigInt(1))));
  return ss(() => {
    const o = i.get();
    o.length && (e(o), i.reset());
  }, [t]), i;
}
function Ly(e) {
  let t = [];
  return {
    get: () => t,
    reset: () => {
      t = [];
    },
    push: (n) => {
      t.push(n), e();
    }
  };
}
const Pd = ws(null);
function $y({ children: e }) {
  const t = ke(), n = ce((l) => {
    const { nodes: c = [], setNodes: u, hasDefaultNodes: d, onNodesChange: f, nodeLookup: p, fitViewQueued: h, onNodesChangeMiddlewareMap: w } = t.getState();
    let g = c;
    for (const b of l)
      g = typeof b == "function" ? b(g) : b;
    let _ = ac({
      items: g,
      lookup: p
    });
    for (const b of w.values())
      _ = b(_);
    d && u(g), _.length > 0 ? f?.(_) : h && window.requestAnimationFrame(() => {
      const { fitViewQueued: b, nodes: S, setNodes: m } = t.getState();
      b && m(S);
    });
  }, []), i = cc(n), o = ce((l) => {
    const { edges: c = [], setEdges: u, hasDefaultEdges: d, onEdgesChange: f, edgeLookup: p } = t.getState();
    let h = c;
    for (const w of l)
      h = typeof w == "function" ? w(h) : w;
    d ? u(h) : f && f(ac({
      items: h,
      lookup: p
    }));
  }, []), r = cc(o), a = X(() => ({ nodeQueue: i, edgeQueue: r }), []);
  return s(Pd.Provider, { value: a, children: e });
}
function Oy() {
  const e = To(Pd);
  if (!e)
    throw new Error("useBatchContext must be used within a BatchProvider");
  return e;
}
const Hy = (e) => !!e.panZoom;
function Ys() {
  const e = Dy(), t = ke(), n = Oy(), i = Se(Hy), o = X(() => {
    const r = (f) => t.getState().nodeLookup.get(f), a = (f) => {
      n.nodeQueue.push(f);
    }, l = (f) => {
      n.edgeQueue.push(f);
    }, c = (f) => {
      const { nodeLookup: p, nodeOrigin: h } = t.getState(), w = lc(f) ? f : p.get(f.id), g = w.parentId ? rd(w.position, w.measured, w.parentId, p, h) : w.position, _ = {
        ...w,
        position: g,
        width: w.measured?.width ?? w.width,
        height: w.measured?.height ?? w.height
      };
      return Di(_);
    }, u = (f, p, h = { replace: !1 }) => {
      a((w) => w.map((g) => {
        if (g.id === f) {
          const _ = typeof p == "function" ? p(g) : p;
          return h.replace && lc(_) ? _ : { ...g, ..._ };
        }
        return g;
      }));
    }, d = (f, p, h = { replace: !1 }) => {
      l((w) => w.map((g) => {
        if (g.id === f) {
          const _ = typeof p == "function" ? p(g) : p;
          return h.replace && Fy(_) ? _ : { ...g, ..._ };
        }
        return g;
      }));
    };
    return {
      getNodes: () => t.getState().nodes.map((f) => ({ ...f })),
      getNode: (f) => r(f)?.internals.userNode,
      getInternalNode: r,
      getEdges: () => {
        const { edges: f = [] } = t.getState();
        return f.map((p) => ({ ...p }));
      },
      getEdge: (f) => t.getState().edgeLookup.get(f),
      setNodes: a,
      setEdges: l,
      addNodes: (f) => {
        const p = Array.isArray(f) ? f : [f];
        n.nodeQueue.push((h) => [...h, ...p]);
      },
      addEdges: (f) => {
        const p = Array.isArray(f) ? f : [f];
        n.edgeQueue.push((h) => [...h, ...p]);
      },
      toObject: () => {
        const { nodes: f = [], edges: p = [], transform: h } = t.getState(), [w, g, _] = h;
        return {
          nodes: f.map((b) => ({ ...b })),
          edges: p.map((b) => ({ ...b })),
          viewport: {
            x: w,
            y: g,
            zoom: _
          }
        };
      },
      deleteElements: async ({ nodes: f = [], edges: p = [] }) => {
        const { nodes: h, edges: w, onNodesDelete: g, onEdgesDelete: _, triggerNodeChanges: b, triggerEdgeChanges: S, onDelete: m, onBeforeDelete: y } = t.getState(), { nodes: v, edges: C } = await Sb({
          nodesToRemove: f,
          edgesToRemove: p,
          nodes: h,
          edges: w,
          onBeforeDelete: y
        }), T = C.length > 0, P = v.length > 0;
        if (T) {
          const D = C.map(sc);
          _?.(C), S(D);
        }
        if (P) {
          const D = v.map(sc);
          g?.(v), b(D);
        }
        return (P || T) && m?.({ nodes: v, edges: C }), { deletedNodes: v, deletedEdges: C };
      },
      /**
       * Partial is defined as "the 2 nodes/areas are intersecting partially".
       * If a is contained in b or b is contained in a, they are both
       * considered fully intersecting.
       */
      getIntersectingNodes: (f, p = !0, h) => {
        const w = Ol(f), g = w ? f : c(f), _ = h !== void 0;
        return g ? (h || t.getState().nodes).filter((b) => {
          const S = t.getState().nodeLookup.get(b.id);
          if (S && !w && (b.id === f.id || !S.internals.positionAbsolute))
            return !1;
          const m = Di(_ ? b : S), y = yo(m, g);
          return p && y > 0 || y >= m.width * m.height || y >= g.width * g.height;
        }) : [];
      },
      isNodeIntersecting: (f, p, h = !0) => {
        const g = Ol(f) ? f : c(f);
        if (!g)
          return !1;
        const _ = yo(g, p);
        return h && _ > 0 || _ >= p.width * p.height || _ >= g.width * g.height;
      },
      updateNode: u,
      updateNodeData: (f, p, h = { replace: !1 }) => {
        u(f, (w) => {
          const g = typeof p == "function" ? p(w) : p;
          return h.replace ? { ...w, data: g } : { ...w, data: { ...w.data, ...g } };
        }, h);
      },
      updateEdge: d,
      updateEdgeData: (f, p, h = { replace: !1 }) => {
        d(f, (w) => {
          const g = typeof p == "function" ? p(w) : p;
          return h.replace ? { ...w, data: g } : { ...w, data: { ...w.data, ...g } };
        }, h);
      },
      getNodesBounds: (f) => {
        const { nodeLookup: p, nodeOrigin: h } = t.getState();
        return vb(f, { nodeLookup: p, nodeOrigin: h });
      },
      getHandleConnections: ({ type: f, id: p, nodeId: h }) => Array.from(t.getState().connectionLookup.get(`${h}-${f}${p ? `-${p}` : ""}`)?.values() ?? []),
      getNodeConnections: ({ type: f, handleId: p, nodeId: h }) => Array.from(t.getState().connectionLookup.get(`${h}${f ? p ? `-${f}-${p}` : `-${f}` : ""}`)?.values() ?? []),
      fitView: async (f) => {
        const p = t.getState().fitViewResolver ?? Ib();
        return t.setState({ fitViewQueued: !0, fitViewOptions: f, fitViewResolver: p }), n.nodeQueue.push((h) => [...h]), p.promise;
      }
    };
  }, []);
  return X(() => ({
    ...o,
    ...e,
    viewportInitialized: i
  }), [i]);
}
const uc = (e) => e.selected, Gy = typeof window < "u" ? window : void 0;
function Wy({ deleteKeyCode: e, multiSelectionKeyCode: t }) {
  const n = ke(), { deleteElements: i } = Ys(), o = wo(e, { actInsideInputWithModifier: !1 }), r = wo(t, { target: Gy });
  oe(() => {
    if (o) {
      const { edges: a, nodes: l } = n.getState();
      i({ nodes: l.filter(uc), edges: a.filter(uc) }), n.setState({ nodesSelectionActive: !1 });
    }
  }, [o]), oe(() => {
    n.setState({ multiSelectionActive: r });
  }, [r]);
}
function Uy(e) {
  const t = ke();
  oe(() => {
    const n = () => {
      if (!e.current || !(e.current.checkVisibility?.() ?? !0))
        return !1;
      const i = Gs(e.current);
      (i.height === 0 || i.width === 0) && t.getState().onError?.("004", zt.error004()), t.setState({ width: i.width || 500, height: i.height || 500 });
    };
    if (e.current) {
      n(), window.addEventListener("resize", n);
      const i = new ResizeObserver(() => n());
      return i.observe(e.current), () => {
        window.removeEventListener("resize", n), i && e.current && i.unobserve(e.current);
      };
    }
  }, []);
}
const ea = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0
}, jy = (e) => ({
  userSelectionActive: e.userSelectionActive,
  lib: e.lib,
  connectionInProgress: e.connection.inProgress
});
function Vy({ onPaneContextMenu: e, zoomOnScroll: t = !0, zoomOnPinch: n = !0, panOnScroll: i = !1, panOnScrollSpeed: o = 0.5, panOnScrollMode: r = pi.Free, zoomOnDoubleClick: a = !0, panOnDrag: l = !0, defaultViewport: c, translateExtent: u, minZoom: d, maxZoom: f, zoomActivationKeyCode: p, preventScrolling: h = !0, children: w, noWheelClassName: g, noPanClassName: _, onViewportChange: b, isControlledViewport: S, paneClickDistance: m, selectionOnDrag: y }) {
  const v = ke(), C = ee(null), { userSelectionActive: T, lib: P, connectionInProgress: D } = Se(jy, Ae), O = wo(p), z = ee();
  Uy(C);
  const E = ce((G) => {
    b?.({ x: G[0], y: G[1], zoom: G[2] }), S || v.setState({ transform: G });
  }, [b, S]);
  return oe(() => {
    if (C.current) {
      z.current = uy({
        domNode: C.current,
        minZoom: d,
        maxZoom: f,
        translateExtent: u,
        viewport: c,
        onDraggingChange: (R) => v.setState((L) => L.paneDragging === R ? L : { paneDragging: R }),
        onPanZoomStart: (R, L) => {
          const { onViewportChangeStart: M, onMoveStart: F } = v.getState();
          F?.(R, L), M?.(L);
        },
        onPanZoom: (R, L) => {
          const { onViewportChange: M, onMove: F } = v.getState();
          F?.(R, L), M?.(L);
        },
        onPanZoomEnd: (R, L) => {
          const { onViewportChangeEnd: M, onMoveEnd: F } = v.getState();
          F?.(R, L), M?.(L);
        }
      });
      const { x: G, y: I, zoom: $ } = z.current.getViewport();
      return v.setState({
        panZoom: z.current,
        transform: [G, I, $],
        domNode: C.current.closest(".react-flow")
      }), () => {
        z.current?.destroy();
      };
    }
  }, []), oe(() => {
    z.current?.update({
      onPaneContextMenu: e,
      zoomOnScroll: t,
      zoomOnPinch: n,
      panOnScroll: i,
      panOnScrollSpeed: o,
      panOnScrollMode: r,
      zoomOnDoubleClick: a,
      panOnDrag: l,
      zoomActivationKeyPressed: O,
      preventScrolling: h,
      noPanClassName: _,
      userSelectionActive: T,
      noWheelClassName: g,
      lib: P,
      onTransformChange: E,
      connectionInProgress: D,
      selectionOnDrag: y,
      paneClickDistance: m
    });
  }, [
    e,
    t,
    n,
    i,
    o,
    r,
    a,
    l,
    O,
    h,
    _,
    T,
    g,
    P,
    E,
    D,
    y,
    m
  ]), s("div", { className: "react-flow__renderer", ref: C, style: ea, children: w });
}
const Zy = (e) => ({
  userSelectionActive: e.userSelectionActive,
  userSelectionRect: e.userSelectionRect
});
function Yy() {
  const { userSelectionActive: e, userSelectionRect: t } = Se(Zy, Ae);
  return e && t ? s("div", { className: "react-flow__selection react-flow__container", style: {
    width: t.width,
    height: t.height,
    transform: `translate(${t.x}px, ${t.y}px)`
  } }) : null;
}
const ba = (e, t) => (n) => {
  n.target === t.current && e?.(n);
}, Xy = (e) => ({
  userSelectionActive: e.userSelectionActive,
  elementsSelectable: e.elementsSelectable,
  connectionInProgress: e.connection.inProgress,
  dragging: e.paneDragging
});
function Ky({ isSelecting: e, selectionKeyPressed: t, selectionMode: n = go.Full, panOnDrag: i, paneClickDistance: o, selectionOnDrag: r, onSelectionStart: a, onSelectionEnd: l, onPaneClick: c, onPaneContextMenu: u, onPaneScroll: d, onPaneMouseEnter: f, onPaneMouseMove: p, onPaneMouseLeave: h, children: w }) {
  const g = ke(), { userSelectionActive: _, elementsSelectable: b, dragging: S, connectionInProgress: m } = Se(Xy, Ae), y = b && (e || _), v = ee(null), C = ee(), T = ee(/* @__PURE__ */ new Set()), P = ee(/* @__PURE__ */ new Set()), D = ee(!1), O = (M) => {
    if (D.current || m) {
      D.current = !1;
      return;
    }
    c?.(M), g.getState().resetSelectedElements(), g.setState({ nodesSelectionActive: !1 });
  }, z = (M) => {
    if (Array.isArray(i) && i?.includes(2)) {
      M.preventDefault();
      return;
    }
    u?.(M);
  }, E = d ? (M) => d(M) : void 0, G = (M) => {
    D.current && (M.stopPropagation(), D.current = !1);
  }, I = (M) => {
    const { domNode: F } = g.getState();
    if (C.current = F?.getBoundingClientRect(), !C.current)
      return;
    const U = M.target === v.current;
    if (!U && !!M.target.closest(".nokey") || !e || !(r && U || t) || M.button !== 0 || !M.isPrimary)
      return;
    M.target?.setPointerCapture?.(M.pointerId), D.current = !1;
    const { x: Z, y: J } = vt(M.nativeEvent, C.current);
    g.setState({
      userSelectionRect: {
        width: 0,
        height: 0,
        startX: Z,
        startY: J,
        x: Z,
        y: J
      }
    }), U || (M.stopPropagation(), M.preventDefault());
  }, $ = (M) => {
    const { userSelectionRect: F, transform: U, nodeLookup: V, edgeLookup: Y, connectionLookup: Z, triggerNodeChanges: J, triggerEdgeChanges: q, defaultEdgeOptions: A, resetSelectedElements: N } = g.getState();
    if (!C.current || !F)
      return;
    const { x: W, y: K } = vt(M.nativeEvent, C.current), { startX: Q, startY: ne } = F;
    if (!D.current) {
      const he = t ? 0 : o;
      if (Math.hypot(W - Q, K - ne) <= he)
        return;
      N(), a?.(M);
    }
    D.current = !0;
    const re = {
      startX: Q,
      startY: ne,
      x: W < Q ? W : Q,
      y: K < ne ? K : ne,
      width: Math.abs(W - Q),
      height: Math.abs(K - ne)
    }, ae = T.current, se = P.current;
    T.current = new Set(Os(V, re, U, n === go.Partial, !0).map((he) => he.id)), P.current = /* @__PURE__ */ new Set();
    const te = A?.selectable ?? !0;
    for (const he of T.current) {
      const ye = Z.get(he);
      if (ye)
        for (const { edgeId: _e } of ye.values()) {
          const Me = Y.get(_e);
          Me && (Me.selectable ?? te) && P.current.add(_e);
        }
    }
    if (!Hl(ae, T.current)) {
      const he = Ti(V, T.current, !0);
      J(he);
    }
    if (!Hl(se, P.current)) {
      const he = Ti(Y, P.current);
      q(he);
    }
    g.setState({
      userSelectionRect: re,
      userSelectionActive: !0,
      nodesSelectionActive: !1
    });
  }, R = (M) => {
    M.button === 0 && (M.target?.releasePointerCapture?.(M.pointerId), !_ && M.target === v.current && g.getState().userSelectionRect && O?.(M), g.setState({
      userSelectionActive: !1,
      userSelectionRect: null
    }), D.current && (l?.(M), g.setState({
      nodesSelectionActive: T.current.size > 0
    })));
  }, L = i === !0 || Array.isArray(i) && i.includes(0);
  return x("div", { className: Fe(["react-flow__pane", { draggable: L, dragging: S, selection: e }]), onClick: y ? void 0 : ba(O, v), onContextMenu: ba(z, v), onWheel: ba(E, v), onPointerEnter: y ? void 0 : f, onPointerMove: y ? $ : p, onPointerUp: y ? R : void 0, onPointerDownCapture: y ? I : void 0, onClickCapture: y ? G : void 0, onPointerLeave: h, ref: v, style: ea, children: [w, s(Yy, {})] });
}
function ls({ id: e, store: t, unselect: n = !1, nodeRef: i }) {
  const { addSelectedNodes: o, unselectNodesAndEdges: r, multiSelectionActive: a, nodeLookup: l, onError: c } = t.getState(), u = l.get(e);
  if (!u) {
    c?.("012", zt.error012(e));
    return;
  }
  t.setState({ nodesSelectionActive: !1 }), u.selected ? (n || u.selected && a) && (r({ nodes: [u], edges: [] }), requestAnimationFrame(() => i?.current?.blur())) : o([e]);
}
function Bd({ nodeRef: e, disabled: t = !1, noDragClassName: n, handleSelector: i, nodeId: o, isSelectable: r, nodeClickDistance: a }) {
  const l = ke(), [c, u] = le(!1), d = ee();
  return oe(() => {
    d.current = Kb({
      getStoreItems: () => l.getState(),
      onNodeMouseDown: (f) => {
        ls({
          id: f,
          store: l,
          nodeRef: e
        });
      },
      onDragStart: () => {
        u(!0);
      },
      onDragStop: () => {
        u(!1);
      }
    });
  }, []), oe(() => {
    if (!(t || !e.current || !d.current))
      return d.current.update({
        noDragClassName: n,
        handleSelector: i,
        domNode: e.current,
        isSelectable: r,
        nodeId: o,
        nodeClickDistance: a
      }), () => {
        d.current?.destroy();
      };
  }, [n, i, t, r, e, o, a]), c;
}
const qy = (e) => (t) => t.selected && (t.draggable || e && typeof t.draggable > "u");
function Rd() {
  const e = ke();
  return ce((n) => {
    const { nodeExtent: i, snapToGrid: o, snapGrid: r, nodesDraggable: a, onError: l, updateNodePositions: c, nodeLookup: u, nodeOrigin: d } = e.getState(), f = /* @__PURE__ */ new Map(), p = qy(a), h = o ? r[0] : 5, w = o ? r[1] : 5, g = n.direction.x * h * n.factor, _ = n.direction.y * w * n.factor;
    for (const [, b] of u) {
      if (!p(b))
        continue;
      let S = {
        x: b.internals.positionAbsolute.x + g,
        y: b.internals.positionAbsolute.y + _
      };
      o && (S = Do(S, r));
      const { position: m, positionAbsolute: y } = ed({
        nodeId: b.id,
        nextPosition: S,
        nodeLookup: u,
        nodeExtent: i,
        nodeOrigin: d,
        onError: l
      });
      b.position = m, b.internals.positionAbsolute = y, f.set(b.id, b);
    }
    c(f);
  }, []);
}
const Xs = ws(null), Qy = Xs.Provider;
Xs.Consumer;
const Dd = () => To(Xs), Jy = (e) => ({
  connectOnClick: e.connectOnClick,
  noPanClassName: e.noPanClassName,
  rfId: e.rfId
}), ev = (e, t, n) => (i) => {
  const { connectionClickStartHandle: o, connectionMode: r, connection: a } = i, { fromHandle: l, toHandle: c, isValid: u } = a, d = c?.nodeId === e && c?.id === t && c?.type === n;
  return {
    connectingFrom: l?.nodeId === e && l?.id === t && l?.type === n,
    connectingTo: d,
    clickConnecting: o?.nodeId === e && o?.id === t && o?.type === n,
    isPossibleEndHandle: r === Bi.Strict ? l?.type !== n : e !== l?.nodeId || t !== l?.id,
    connectionInProcess: !!l,
    clickConnectionInProcess: !!o,
    valid: d && u
  };
};
function tv({ type: e = "source", position: t = de.Top, isValidConnection: n, isConnectable: i = !0, isConnectableStart: o = !0, isConnectableEnd: r = !0, id: a, onConnect: l, children: c, className: u, onMouseDown: d, onTouchStart: f, ...p }, h) {
  const w = a || null, g = e === "target", _ = ke(), b = Dd(), { connectOnClick: S, noPanClassName: m, rfId: y } = Se(Jy, Ae), { connectingFrom: v, connectingTo: C, clickConnecting: T, isPossibleEndHandle: P, connectionInProcess: D, clickConnectionInProcess: O, valid: z } = Se(ev(b, w, e), Ae);
  b || _.getState().onError?.("010", zt.error010());
  const E = ($) => {
    const { defaultEdgeOptions: R, onConnect: L, hasDefaultEdges: M } = _.getState(), F = {
      ...R,
      ...$
    };
    if (M) {
      const { edges: U, setEdges: V } = _.getState();
      V(Rb(F, U));
    }
    L?.(F), l?.(F);
  }, G = ($) => {
    if (!b)
      return;
    const R = ld($.nativeEvent);
    if (o && (R && $.button === 0 || !R)) {
      const L = _.getState();
      as.onPointerDown($.nativeEvent, {
        handleDomNode: $.currentTarget,
        autoPanOnConnect: L.autoPanOnConnect,
        connectionMode: L.connectionMode,
        connectionRadius: L.connectionRadius,
        domNode: L.domNode,
        nodeLookup: L.nodeLookup,
        lib: L.lib,
        isTarget: g,
        handleId: w,
        nodeId: b,
        flowId: L.rfId,
        panBy: L.panBy,
        cancelConnection: L.cancelConnection,
        onConnectStart: L.onConnectStart,
        onConnectEnd: (...M) => _.getState().onConnectEnd?.(...M),
        updateConnection: L.updateConnection,
        onConnect: E,
        isValidConnection: n || ((...M) => _.getState().isValidConnection?.(...M) ?? !0),
        getTransform: () => _.getState().transform,
        getFromHandle: () => _.getState().connection.fromHandle,
        autoPanSpeed: L.autoPanSpeed,
        dragThreshold: L.connectionDragThreshold
      });
    }
    R ? d?.($) : f?.($);
  }, I = ($) => {
    const { onClickConnectStart: R, onClickConnectEnd: L, connectionClickStartHandle: M, connectionMode: F, isValidConnection: U, lib: V, rfId: Y, nodeLookup: Z, connection: J } = _.getState();
    if (!b || !M && !o)
      return;
    if (!M) {
      R?.($.nativeEvent, { nodeId: b, handleId: w, handleType: e }), _.setState({ connectionClickStartHandle: { nodeId: b, type: e, id: w } });
      return;
    }
    const q = ad($.target), A = n || U, { connection: N, isValid: W } = as.isValid($.nativeEvent, {
      handle: {
        nodeId: b,
        id: w,
        type: e
      },
      connectionMode: F,
      fromNodeId: M.nodeId,
      fromHandleId: M.id || null,
      fromType: M.type,
      isValidConnection: A,
      flowId: Y,
      doc: q,
      lib: V,
      nodeLookup: Z
    });
    W && N && E(N);
    const K = structuredClone(J);
    delete K.inProgress, K.toPosition = K.toHandle ? K.toHandle.position : null, L?.($, K), _.setState({ connectionClickStartHandle: null });
  };
  return s("div", { "data-handleid": w, "data-nodeid": b, "data-handlepos": t, "data-id": `${y}-${b}-${w}-${e}`, className: Fe([
    "react-flow__handle",
    `react-flow__handle-${t}`,
    "nodrag",
    m,
    u,
    {
      source: !g,
      target: g,
      connectable: i,
      connectablestart: o,
      connectableend: r,
      clickconnecting: T,
      connectingfrom: v,
      connectingto: C,
      valid: z,
      /*
       * shows where you can start a connection from
       * and where you can end it while connecting
       */
      connectionindicator: i && (!D || P) && (D || O ? r : o)
    }
  ]), onMouseDown: G, onTouchStart: G, onClick: S ? I : void 0, ref: h, ...p, children: c });
}
const Tr = Be(kd(tv));
function nv({ data: e, isConnectable: t, sourcePosition: n = de.Bottom }) {
  return x(be, { children: [e?.label, s(Tr, { type: "source", position: n, isConnectable: t })] });
}
function iv({ data: e, isConnectable: t, targetPosition: n = de.Top, sourcePosition: i = de.Bottom }) {
  return x(be, { children: [s(Tr, { type: "target", position: n, isConnectable: t }), e?.label, s(Tr, { type: "source", position: i, isConnectable: t })] });
}
function ov() {
  return null;
}
function rv({ data: e, isConnectable: t, targetPosition: n = de.Top }) {
  return x(be, { children: [s(Tr, { type: "target", position: n, isConnectable: t }), e?.label] });
}
const Er = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
}, dc = {
  input: nv,
  default: iv,
  output: rv,
  group: ov
};
function av(e) {
  return e.internals.handleBounds === void 0 ? {
    width: e.width ?? e.initialWidth ?? e.style?.width,
    height: e.height ?? e.initialHeight ?? e.style?.height
  } : {
    width: e.width ?? e.style?.width,
    height: e.height ?? e.style?.height
  };
}
const sv = (e) => {
  const { width: t, height: n, x: i, y: o } = Ro(e.nodeLookup, {
    filter: (r) => !!r.selected
  });
  return {
    width: yt(t) ? t : null,
    height: yt(n) ? n : null,
    userSelectionActive: e.userSelectionActive,
    transformString: `translate(${e.transform[0]}px,${e.transform[1]}px) scale(${e.transform[2]}) translate(${i}px,${o}px)`
  };
};
function lv({ onSelectionContextMenu: e, noPanClassName: t, disableKeyboardA11y: n }) {
  const i = ke(), { width: o, height: r, transformString: a, userSelectionActive: l } = Se(sv, Ae), c = Rd(), u = ee(null);
  oe(() => {
    n || u.current?.focus({
      preventScroll: !0
    });
  }, [n]);
  const d = !l && o !== null && r !== null;
  if (Bd({
    nodeRef: u,
    disabled: !d
  }), !d)
    return null;
  const f = e ? (h) => {
    const w = i.getState().nodes.filter((g) => g.selected);
    e(h, w);
  } : void 0, p = (h) => {
    Object.prototype.hasOwnProperty.call(Er, h.key) && (h.preventDefault(), c({
      direction: Er[h.key],
      factor: h.shiftKey ? 4 : 1
    }));
  };
  return s("div", { className: Fe(["react-flow__nodesselection", "react-flow__container", t]), style: {
    transform: a
  }, children: s("div", { ref: u, className: "react-flow__nodesselection-rect", onContextMenu: f, tabIndex: n ? void 0 : -1, onKeyDown: n ? void 0 : p, style: {
    width: o,
    height: r
  } }) });
}
const fc = typeof window < "u" ? window : void 0, cv = (e) => ({ nodesSelectionActive: e.nodesSelectionActive, userSelectionActive: e.userSelectionActive });
function zd({ children: e, onPaneClick: t, onPaneMouseEnter: n, onPaneMouseMove: i, onPaneMouseLeave: o, onPaneContextMenu: r, onPaneScroll: a, paneClickDistance: l, deleteKeyCode: c, selectionKeyCode: u, selectionOnDrag: d, selectionMode: f, onSelectionStart: p, onSelectionEnd: h, multiSelectionKeyCode: w, panActivationKeyCode: g, zoomActivationKeyCode: _, elementsSelectable: b, zoomOnScroll: S, zoomOnPinch: m, panOnScroll: y, panOnScrollSpeed: v, panOnScrollMode: C, zoomOnDoubleClick: T, panOnDrag: P, defaultViewport: D, translateExtent: O, minZoom: z, maxZoom: E, preventScrolling: G, onSelectionContextMenu: I, noWheelClassName: $, noPanClassName: R, disableKeyboardA11y: L, onViewportChange: M, isControlledViewport: F }) {
  const { nodesSelectionActive: U, userSelectionActive: V } = Se(cv, Ae), Y = wo(u, { target: fc }), Z = wo(g, { target: fc }), J = Z || P, q = Z || y, A = d && J !== !0, N = Y || V || A;
  return Wy({ deleteKeyCode: c, multiSelectionKeyCode: w }), s(Vy, { onPaneContextMenu: r, elementsSelectable: b, zoomOnScroll: S, zoomOnPinch: m, panOnScroll: q, panOnScrollSpeed: v, panOnScrollMode: C, zoomOnDoubleClick: T, panOnDrag: !Y && J, defaultViewport: D, translateExtent: O, minZoom: z, maxZoom: E, zoomActivationKeyCode: _, preventScrolling: G, noWheelClassName: $, noPanClassName: R, onViewportChange: M, isControlledViewport: F, paneClickDistance: l, selectionOnDrag: A, children: x(Ky, { onSelectionStart: p, onSelectionEnd: h, onPaneClick: t, onPaneMouseEnter: n, onPaneMouseMove: i, onPaneMouseLeave: o, onPaneContextMenu: r, onPaneScroll: a, panOnDrag: J, isSelecting: !!N, selectionMode: f, selectionKeyPressed: Y, paneClickDistance: l, selectionOnDrag: A, children: [e, U && s(lv, { onSelectionContextMenu: I, noPanClassName: R, disableKeyboardA11y: L })] }) });
}
zd.displayName = "FlowRenderer";
const uv = Be(zd), dv = (e) => (t) => e ? Os(t.nodeLookup, { x: 0, y: 0, width: t.width, height: t.height }, t.transform, !0).map((n) => n.id) : Array.from(t.nodeLookup.keys());
function fv(e) {
  return Se(ce(dv(e), [e]), Ae);
}
const pv = (e) => e.updateNodeInternals;
function hv() {
  const e = Se(pv), [t] = le(() => typeof ResizeObserver > "u" ? null : new ResizeObserver((n) => {
    const i = /* @__PURE__ */ new Map();
    n.forEach((o) => {
      const r = o.target.getAttribute("data-id");
      i.set(r, {
        id: r,
        nodeElement: o.target,
        force: !0
      });
    }), e(i);
  }));
  return oe(() => () => {
    t?.disconnect();
  }, [t]), t;
}
function mv({ node: e, nodeType: t, hasDimensions: n, resizeObserver: i }) {
  const o = ke(), r = ee(null), a = ee(null), l = ee(e.sourcePosition), c = ee(e.targetPosition), u = ee(t), d = n && !!e.internals.handleBounds;
  return oe(() => {
    r.current && !e.hidden && (!d || a.current !== r.current) && (a.current && i?.unobserve(a.current), i?.observe(r.current), a.current = r.current);
  }, [d, e.hidden]), oe(() => () => {
    a.current && (i?.unobserve(a.current), a.current = null);
  }, []), oe(() => {
    if (r.current) {
      const f = u.current !== t, p = l.current !== e.sourcePosition, h = c.current !== e.targetPosition;
      (f || p || h) && (u.current = t, l.current = e.sourcePosition, c.current = e.targetPosition, o.getState().updateNodeInternals(/* @__PURE__ */ new Map([[e.id, { id: e.id, nodeElement: r.current, force: !0 }]])));
    }
  }, [e.id, t, e.sourcePosition, e.targetPosition]), r;
}
function gv({ id: e, onClick: t, onMouseEnter: n, onMouseMove: i, onMouseLeave: o, onContextMenu: r, onDoubleClick: a, nodesDraggable: l, elementsSelectable: c, nodesConnectable: u, nodesFocusable: d, resizeObserver: f, noDragClassName: p, noPanClassName: h, disableKeyboardA11y: w, rfId: g, nodeTypes: _, nodeClickDistance: b, onError: S }) {
  const { node: m, internals: y, isParent: v } = Se((W) => {
    const K = W.nodeLookup.get(e), Q = W.parentLookup.has(e);
    return {
      node: K,
      internals: K.internals,
      isParent: Q
    };
  }, Ae);
  let C = m.type || "default", T = _?.[C] || dc[C];
  T === void 0 && (S?.("003", zt.error003(C)), C = "default", T = _?.default || dc.default);
  const P = !!(m.draggable || l && typeof m.draggable > "u"), D = !!(m.selectable || c && typeof m.selectable > "u"), O = !!(m.connectable || u && typeof m.connectable > "u"), z = !!(m.focusable || d && typeof m.focusable > "u"), E = ke(), G = od(m), I = mv({ node: m, nodeType: C, hasDimensions: G, resizeObserver: f }), $ = Bd({
    nodeRef: I,
    disabled: m.hidden || !P,
    noDragClassName: p,
    handleSelector: m.dragHandle,
    nodeId: e,
    isSelectable: D,
    nodeClickDistance: b
  }), R = Rd();
  if (m.hidden)
    return null;
  const L = tn(m), M = av(m), F = D || P || t || n || i || o, U = n ? (W) => n(W, { ...y.userNode }) : void 0, V = i ? (W) => i(W, { ...y.userNode }) : void 0, Y = o ? (W) => o(W, { ...y.userNode }) : void 0, Z = r ? (W) => r(W, { ...y.userNode }) : void 0, J = a ? (W) => a(W, { ...y.userNode }) : void 0, q = (W) => {
    const { selectNodesOnDrag: K, nodeDragThreshold: Q } = E.getState();
    D && (!K || !P || Q > 0) && ls({
      id: e,
      store: E,
      nodeRef: I
    }), t && t(W, { ...y.userNode });
  }, A = (W) => {
    if (!(sd(W.nativeEvent) || w)) {
      if (Xu.includes(W.key) && D) {
        const K = W.key === "Escape";
        ls({
          id: e,
          store: E,
          unselect: K,
          nodeRef: I
        });
      } else if (P && m.selected && Object.prototype.hasOwnProperty.call(Er, W.key)) {
        W.preventDefault();
        const { ariaLabelConfig: K } = E.getState();
        E.setState({
          ariaLiveMessage: K["node.a11yDescription.ariaLiveMessage"]({
            direction: W.key.replace("Arrow", "").toLowerCase(),
            x: ~~y.positionAbsolute.x,
            y: ~~y.positionAbsolute.y
          })
        }), R({
          direction: Er[W.key],
          factor: W.shiftKey ? 4 : 1
        });
      }
    }
  }, N = () => {
    if (w || !I.current?.matches(":focus-visible"))
      return;
    const { transform: W, width: K, height: Q, autoPanOnNodeFocus: ne, setCenter: re } = E.getState();
    if (!ne)
      return;
    Os(/* @__PURE__ */ new Map([[e, m]]), { x: 0, y: 0, width: K, height: Q }, W, !0).length > 0 || re(m.position.x + L.width / 2, m.position.y + L.height / 2, {
      zoom: W[2]
    });
  };
  return s("div", { className: Fe([
    "react-flow__node",
    `react-flow__node-${C}`,
    {
      // this is overwritable by passing `nopan` as a class name
      [h]: P
    },
    m.className,
    {
      selected: m.selected,
      selectable: D,
      parent: v,
      draggable: P,
      dragging: $
    }
  ]), ref: I, style: {
    zIndex: y.z,
    transform: `translate(${y.positionAbsolute.x}px,${y.positionAbsolute.y}px)`,
    pointerEvents: F ? "all" : "none",
    visibility: G ? "visible" : "hidden",
    ...m.style,
    ...M
  }, "data-id": e, "data-testid": `rf__node-${e}`, onMouseEnter: U, onMouseMove: V, onMouseLeave: Y, onContextMenu: Z, onClick: q, onDoubleClick: J, onKeyDown: z ? A : void 0, tabIndex: z ? 0 : void 0, onFocus: z ? N : void 0, role: m.ariaRole ?? (z ? "group" : void 0), "aria-roledescription": "node", "aria-describedby": w ? void 0 : `${Cd}-${g}`, "aria-label": m.ariaLabel, ...m.domAttributes, children: s(Qy, { value: e, children: s(T, { id: e, data: m.data, type: C, positionAbsoluteX: y.positionAbsolute.x, positionAbsoluteY: y.positionAbsolute.y, selected: m.selected ?? !1, selectable: D, draggable: P, deletable: m.deletable ?? !0, isConnectable: O, sourcePosition: m.sourcePosition, targetPosition: m.targetPosition, dragging: $, dragHandle: m.dragHandle, zIndex: y.z, parentId: m.parentId, ...L }) }) });
}
var bv = Be(gv);
const yv = (e) => ({
  nodesDraggable: e.nodesDraggable,
  nodesConnectable: e.nodesConnectable,
  nodesFocusable: e.nodesFocusable,
  elementsSelectable: e.elementsSelectable,
  onError: e.onError
});
function Fd(e) {
  const { nodesDraggable: t, nodesConnectable: n, nodesFocusable: i, elementsSelectable: o, onError: r } = Se(yv, Ae), a = fv(e.onlyRenderVisibleElements), l = hv();
  return s("div", { className: "react-flow__nodes", style: ea, children: a.map((c) => (
    /*
     * The split of responsibilities between NodeRenderer and
     * NodeComponentWrapper may appear weird. However, it’s designed to
     * minimize the cost of updates when individual nodes change.
     *
     * For example, when you’re dragging a single node, that node gets
     * updated multiple times per second. If `NodeRenderer` were to update
     * every time, it would have to re-run the `nodes.map()` loop every
     * time. This gets pricey with hundreds of nodes, especially if every
     * loop cycle does more than just rendering a JSX element!
     *
     * As a result of this choice, we took the following implementation
     * decisions:
     * - NodeRenderer subscribes *only* to node IDs – and therefore
     *   rerender *only* when visible nodes are added or removed.
     * - NodeRenderer performs all operations the result of which can be
     *   shared between nodes (such as creating the `ResizeObserver`
     *   instance, or subscribing to `selector`). This means extra prop
     *   drilling into `NodeComponentWrapper`, but it means we need to run
     *   these operations only once – instead of once per node.
     * - Any operations that you’d normally write inside `nodes.map` are
     *   moved into `NodeComponentWrapper`. This ensures they are
     *   memorized – so if `NodeRenderer` *has* to rerender, it only
     *   needs to regenerate the list of nodes, nothing else.
     */
    s(bv, { id: c, nodeTypes: e.nodeTypes, nodeExtent: e.nodeExtent, onClick: e.onNodeClick, onMouseEnter: e.onNodeMouseEnter, onMouseMove: e.onNodeMouseMove, onMouseLeave: e.onNodeMouseLeave, onContextMenu: e.onNodeContextMenu, onDoubleClick: e.onNodeDoubleClick, noDragClassName: e.noDragClassName, noPanClassName: e.noPanClassName, rfId: e.rfId, disableKeyboardA11y: e.disableKeyboardA11y, resizeObserver: l, nodesDraggable: t, nodesConnectable: n, nodesFocusable: i, elementsSelectable: o, nodeClickDistance: e.nodeClickDistance, onError: r }, c)
  )) });
}
Fd.displayName = "NodeRenderer";
const vv = Be(Fd);
function wv(e) {
  return Se(ce((n) => {
    if (!e)
      return n.edges.map((o) => o.id);
    const i = [];
    if (n.width && n.height)
      for (const o of n.edges) {
        const r = n.nodeLookup.get(o.source), a = n.nodeLookup.get(o.target);
        r && a && kb({
          sourceNode: r,
          targetNode: a,
          width: n.width,
          height: n.height,
          transform: n.transform
        }) && i.push(o.id);
      }
    return i;
  }, [e]), Ae);
}
const xv = ({ color: e = "none", strokeWidth: t = 1 }) => {
  const n = {
    strokeWidth: t,
    ...e && { stroke: e }
  };
  return s("polyline", { className: "arrow", style: n, strokeLinecap: "round", fill: "none", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4" });
}, _v = ({ color: e = "none", strokeWidth: t = 1 }) => {
  const n = {
    strokeWidth: t,
    ...e && { stroke: e, fill: e }
  };
  return s("polyline", { className: "arrowclosed", style: n, strokeLinecap: "round", strokeLinejoin: "round", points: "-5,-4 0,0 -5,4 -5,-4" });
}, pc = {
  [bo.Arrow]: xv,
  [bo.ArrowClosed]: _v
};
function Sv(e) {
  const t = ke();
  return X(() => Object.prototype.hasOwnProperty.call(pc, e) ? pc[e] : (t.getState().onError?.("009", zt.error009(e)), null), [e]);
}
const Mv = ({ id: e, type: t, color: n, width: i = 12.5, height: o = 12.5, markerUnits: r = "strokeWidth", strokeWidth: a, orient: l = "auto-start-reverse" }) => {
  const c = Sv(t);
  return c ? s("marker", { className: "react-flow__arrowhead", id: e, markerWidth: `${i}`, markerHeight: `${o}`, viewBox: "-10 -10 20 20", markerUnits: r, orient: l, refX: "0", refY: "0", children: s(c, { color: n, strokeWidth: a }) }) : null;
}, Ld = ({ defaultColor: e, rfId: t }) => {
  const n = Se((r) => r.edges), i = Se((r) => r.defaultEdgeOptions), o = X(() => $b(n, {
    id: t,
    defaultColor: e,
    defaultMarkerStart: i?.markerStart,
    defaultMarkerEnd: i?.markerEnd
  }), [n, i, t, e]);
  return o.length ? s("svg", { className: "react-flow__marker", "aria-hidden": "true", children: s("defs", { children: o.map((r) => s(Mv, { id: r.id, type: r.type, color: r.color, width: r.width, height: r.height, markerUnits: r.markerUnits, strokeWidth: r.strokeWidth, orient: r.orient }, r.id)) }) }) : null;
};
Ld.displayName = "MarkerDefinitions";
var Cv = Be(Ld);
function $d({ x: e, y: t, label: n, labelStyle: i, labelShowBg: o = !0, labelBgStyle: r, labelBgPadding: a = [2, 4], labelBgBorderRadius: l = 2, children: c, className: u, ...d }) {
  const [f, p] = le({ x: 1, y: 0, width: 0, height: 0 }), h = Fe(["react-flow__edge-textwrapper", u]), w = ee(null);
  return oe(() => {
    if (w.current) {
      const g = w.current.getBBox();
      p({
        x: g.x,
        y: g.y,
        width: g.width,
        height: g.height
      });
    }
  }, [n]), n ? x("g", { transform: `translate(${e - f.width / 2} ${t - f.height / 2})`, className: h, visibility: f.width ? "visible" : "hidden", ...d, children: [o && s("rect", { width: f.width + 2 * a[0], x: -a[0], y: -a[1], height: f.height + 2 * a[1], className: "react-flow__edge-textbg", style: r, rx: l, ry: l }), s("text", { className: "react-flow__edge-text", y: f.height / 2, dy: "0.3em", ref: w, style: i, children: n }), c] }) : null;
}
$d.displayName = "EdgeText";
const Nv = Be($d);
function ta({ path: e, labelX: t, labelY: n, label: i, labelStyle: o, labelShowBg: r, labelBgStyle: a, labelBgPadding: l, labelBgBorderRadius: c, interactionWidth: u = 20, ...d }) {
  return x(be, { children: [s("path", { ...d, d: e, fill: "none", className: Fe(["react-flow__edge-path", d.className]) }), u ? s("path", { d: e, fill: "none", strokeOpacity: 0, strokeWidth: u, className: "react-flow__edge-interaction" }) : null, i && yt(t) && yt(n) ? s(Nv, { x: t, y: n, label: i, labelStyle: o, labelShowBg: r, labelBgStyle: a, labelBgPadding: l, labelBgBorderRadius: c }) : null] });
}
function hc({ pos: e, x1: t, y1: n, x2: i, y2: o }) {
  return e === de.Left || e === de.Right ? [0.5 * (t + i), n] : [t, 0.5 * (n + o)];
}
function Od({ sourceX: e, sourceY: t, sourcePosition: n = de.Bottom, targetX: i, targetY: o, targetPosition: r = de.Top }) {
  const [a, l] = hc({
    pos: n,
    x1: e,
    y1: t,
    x2: i,
    y2: o
  }), [c, u] = hc({
    pos: r,
    x1: i,
    y1: o,
    x2: e,
    y2: t
  }), [d, f, p, h] = cd({
    sourceX: e,
    sourceY: t,
    targetX: i,
    targetY: o,
    sourceControlX: a,
    sourceControlY: l,
    targetControlX: c,
    targetControlY: u
  });
  return [
    `M${e},${t} C${a},${l} ${c},${u} ${i},${o}`,
    d,
    f,
    p,
    h
  ];
}
function Hd(e) {
  return Be(({ id: t, sourceX: n, sourceY: i, targetX: o, targetY: r, sourcePosition: a, targetPosition: l, label: c, labelStyle: u, labelShowBg: d, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h, style: w, markerEnd: g, markerStart: _, interactionWidth: b }) => {
    const [S, m, y] = Od({
      sourceX: n,
      sourceY: i,
      sourcePosition: a,
      targetX: o,
      targetY: r,
      targetPosition: l
    }), v = e.isInternal ? void 0 : t;
    return s(ta, { id: v, path: S, labelX: m, labelY: y, label: c, labelStyle: u, labelShowBg: d, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h, style: w, markerEnd: g, markerStart: _, interactionWidth: b });
  });
}
const Iv = Hd({ isInternal: !1 }), Gd = Hd({ isInternal: !0 });
Iv.displayName = "SimpleBezierEdge";
Gd.displayName = "SimpleBezierEdgeInternal";
function Wd(e) {
  return Be(({ id: t, sourceX: n, sourceY: i, targetX: o, targetY: r, label: a, labelStyle: l, labelShowBg: c, labelBgStyle: u, labelBgPadding: d, labelBgBorderRadius: f, style: p, sourcePosition: h = de.Bottom, targetPosition: w = de.Top, markerEnd: g, markerStart: _, pathOptions: b, interactionWidth: S }) => {
    const [m, y, v] = is({
      sourceX: n,
      sourceY: i,
      sourcePosition: h,
      targetX: o,
      targetY: r,
      targetPosition: w,
      borderRadius: b?.borderRadius,
      offset: b?.offset,
      stepPosition: b?.stepPosition
    }), C = e.isInternal ? void 0 : t;
    return s(ta, { id: C, path: m, labelX: y, labelY: v, label: a, labelStyle: l, labelShowBg: c, labelBgStyle: u, labelBgPadding: d, labelBgBorderRadius: f, style: p, markerEnd: g, markerStart: _, interactionWidth: S });
  });
}
const Ud = Wd({ isInternal: !1 }), jd = Wd({ isInternal: !0 });
Ud.displayName = "SmoothStepEdge";
jd.displayName = "SmoothStepEdgeInternal";
function Vd(e) {
  return Be(({ id: t, ...n }) => {
    const i = e.isInternal ? void 0 : t;
    return s(Ud, { ...n, id: i, pathOptions: X(() => ({ borderRadius: 0, offset: n.pathOptions?.offset }), [n.pathOptions?.offset]) });
  });
}
const Tv = Vd({ isInternal: !1 }), Zd = Vd({ isInternal: !0 });
Tv.displayName = "StepEdge";
Zd.displayName = "StepEdgeInternal";
function Yd(e) {
  return Be(({ id: t, sourceX: n, sourceY: i, targetX: o, targetY: r, label: a, labelStyle: l, labelShowBg: c, labelBgStyle: u, labelBgPadding: d, labelBgBorderRadius: f, style: p, markerEnd: h, markerStart: w, interactionWidth: g }) => {
    const [_, b, S] = fd({ sourceX: n, sourceY: i, targetX: o, targetY: r }), m = e.isInternal ? void 0 : t;
    return s(ta, { id: m, path: _, labelX: b, labelY: S, label: a, labelStyle: l, labelShowBg: c, labelBgStyle: u, labelBgPadding: d, labelBgBorderRadius: f, style: p, markerEnd: h, markerStart: w, interactionWidth: g });
  });
}
const Ev = Yd({ isInternal: !1 }), Xd = Yd({ isInternal: !0 });
Ev.displayName = "StraightEdge";
Xd.displayName = "StraightEdgeInternal";
function Kd(e) {
  return Be(({ id: t, sourceX: n, sourceY: i, targetX: o, targetY: r, sourcePosition: a = de.Bottom, targetPosition: l = de.Top, label: c, labelStyle: u, labelShowBg: d, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h, style: w, markerEnd: g, markerStart: _, pathOptions: b, interactionWidth: S }) => {
    const [m, y, v] = ud({
      sourceX: n,
      sourceY: i,
      sourcePosition: a,
      targetX: o,
      targetY: r,
      targetPosition: l,
      curvature: b?.curvature
    }), C = e.isInternal ? void 0 : t;
    return s(ta, { id: C, path: m, labelX: y, labelY: v, label: c, labelStyle: u, labelShowBg: d, labelBgStyle: f, labelBgPadding: p, labelBgBorderRadius: h, style: w, markerEnd: g, markerStart: _, interactionWidth: S });
  });
}
const Av = Kd({ isInternal: !1 }), qd = Kd({ isInternal: !0 });
Av.displayName = "BezierEdge";
qd.displayName = "BezierEdgeInternal";
const mc = {
  default: qd,
  straight: Xd,
  step: Zd,
  smoothstep: jd,
  simplebezier: Gd
}, gc = {
  sourceX: null,
  sourceY: null,
  targetX: null,
  targetY: null,
  sourcePosition: null,
  targetPosition: null
}, kv = (e, t, n) => n === de.Left ? e - t : n === de.Right ? e + t : e, Pv = (e, t, n) => n === de.Top ? e - t : n === de.Bottom ? e + t : e, bc = "react-flow__edgeupdater";
function yc({ position: e, centerX: t, centerY: n, radius: i = 10, onMouseDown: o, onMouseEnter: r, onMouseOut: a, type: l }) {
  return s("circle", { onMouseDown: o, onMouseEnter: r, onMouseOut: a, className: Fe([bc, `${bc}-${l}`]), cx: kv(t, i, e), cy: Pv(n, i, e), r: i, stroke: "transparent", fill: "transparent" });
}
function Bv({ isReconnectable: e, reconnectRadius: t, edge: n, sourceX: i, sourceY: o, targetX: r, targetY: a, sourcePosition: l, targetPosition: c, onReconnect: u, onReconnectStart: d, onReconnectEnd: f, setReconnecting: p, setUpdateHover: h }) {
  const w = ke(), g = (y, v) => {
    if (y.button !== 0)
      return;
    const { autoPanOnConnect: C, domNode: T, connectionMode: P, connectionRadius: D, lib: O, onConnectStart: z, cancelConnection: E, nodeLookup: G, rfId: I, panBy: $, updateConnection: R } = w.getState(), L = v.type === "target", M = (V, Y) => {
      p(!1), f?.(V, n, v.type, Y);
    }, F = (V) => u?.(n, V), U = (V, Y) => {
      p(!0), d?.(y, n, v.type), z?.(V, Y);
    };
    as.onPointerDown(y.nativeEvent, {
      autoPanOnConnect: C,
      connectionMode: P,
      connectionRadius: D,
      domNode: T,
      handleId: v.id,
      nodeId: v.nodeId,
      nodeLookup: G,
      isTarget: L,
      edgeUpdaterType: v.type,
      lib: O,
      flowId: I,
      cancelConnection: E,
      panBy: $,
      isValidConnection: (...V) => w.getState().isValidConnection?.(...V) ?? !0,
      onConnect: F,
      onConnectStart: U,
      onConnectEnd: (...V) => w.getState().onConnectEnd?.(...V),
      onReconnectEnd: M,
      updateConnection: R,
      getTransform: () => w.getState().transform,
      getFromHandle: () => w.getState().connection.fromHandle,
      dragThreshold: w.getState().connectionDragThreshold,
      handleDomNode: y.currentTarget
    });
  }, _ = (y) => g(y, { nodeId: n.target, id: n.targetHandle ?? null, type: "target" }), b = (y) => g(y, { nodeId: n.source, id: n.sourceHandle ?? null, type: "source" }), S = () => h(!0), m = () => h(!1);
  return x(be, { children: [(e === !0 || e === "source") && s(yc, { position: l, centerX: i, centerY: o, radius: t, onMouseDown: _, onMouseEnter: S, onMouseOut: m, type: "source" }), (e === !0 || e === "target") && s(yc, { position: c, centerX: r, centerY: a, radius: t, onMouseDown: b, onMouseEnter: S, onMouseOut: m, type: "target" })] });
}
function Rv({ id: e, edgesFocusable: t, edgesReconnectable: n, elementsSelectable: i, onClick: o, onDoubleClick: r, onContextMenu: a, onMouseEnter: l, onMouseMove: c, onMouseLeave: u, reconnectRadius: d, onReconnect: f, onReconnectStart: p, onReconnectEnd: h, rfId: w, edgeTypes: g, noPanClassName: _, onError: b, disableKeyboardA11y: S }) {
  let m = Se((re) => re.edgeLookup.get(e));
  const y = Se((re) => re.defaultEdgeOptions);
  m = y ? { ...y, ...m } : m;
  let v = m.type || "default", C = g?.[v] || mc[v];
  C === void 0 && (b?.("011", zt.error011(v)), v = "default", C = g?.default || mc.default);
  const T = !!(m.focusable || t && typeof m.focusable > "u"), P = typeof f < "u" && (m.reconnectable || n && typeof m.reconnectable > "u"), D = !!(m.selectable || i && typeof m.selectable > "u"), O = ee(null), [z, E] = le(!1), [G, I] = le(!1), $ = ke(), { zIndex: R, sourceX: L, sourceY: M, targetX: F, targetY: U, sourcePosition: V, targetPosition: Y } = Se(ce((re) => {
    const ae = re.nodeLookup.get(m.source), se = re.nodeLookup.get(m.target);
    if (!ae || !se)
      return {
        zIndex: m.zIndex,
        ...gc
      };
    const te = Lb({
      id: e,
      sourceNode: ae,
      targetNode: se,
      sourceHandle: m.sourceHandle || null,
      targetHandle: m.targetHandle || null,
      connectionMode: re.connectionMode,
      onError: b
    });
    return {
      zIndex: Ab({
        selected: m.selected,
        zIndex: m.zIndex,
        sourceNode: ae,
        targetNode: se,
        elevateOnSelect: re.elevateEdgesOnSelect,
        zIndexMode: re.zIndexMode
      }),
      ...te || gc
    };
  }, [m.source, m.target, m.sourceHandle, m.targetHandle, m.selected, m.zIndex]), Ae), Z = X(() => m.markerStart ? `url('#${os(m.markerStart, w)}')` : void 0, [m.markerStart, w]), J = X(() => m.markerEnd ? `url('#${os(m.markerEnd, w)}')` : void 0, [m.markerEnd, w]);
  if (m.hidden || L === null || M === null || F === null || U === null)
    return null;
  const q = (re) => {
    const { addSelectedEdges: ae, unselectNodesAndEdges: se, multiSelectionActive: te } = $.getState();
    D && ($.setState({ nodesSelectionActive: !1 }), m.selected && te ? (se({ nodes: [], edges: [m] }), O.current?.blur()) : ae([e])), o && o(re, m);
  }, A = r ? (re) => {
    r(re, { ...m });
  } : void 0, N = a ? (re) => {
    a(re, { ...m });
  } : void 0, W = l ? (re) => {
    l(re, { ...m });
  } : void 0, K = c ? (re) => {
    c(re, { ...m });
  } : void 0, Q = u ? (re) => {
    u(re, { ...m });
  } : void 0, ne = (re) => {
    if (!S && Xu.includes(re.key) && D) {
      const { unselectNodesAndEdges: ae, addSelectedEdges: se } = $.getState();
      re.key === "Escape" ? (O.current?.blur(), ae({ edges: [m] })) : se([e]);
    }
  };
  return s("svg", { style: { zIndex: R }, children: x("g", { className: Fe([
    "react-flow__edge",
    `react-flow__edge-${v}`,
    m.className,
    _,
    {
      selected: m.selected,
      animated: m.animated,
      inactive: !D && !o,
      updating: z,
      selectable: D
    }
  ]), onClick: q, onDoubleClick: A, onContextMenu: N, onMouseEnter: W, onMouseMove: K, onMouseLeave: Q, onKeyDown: T ? ne : void 0, tabIndex: T ? 0 : void 0, role: m.ariaRole ?? (T ? "group" : "img"), "aria-roledescription": "edge", "data-id": e, "data-testid": `rf__edge-${e}`, "aria-label": m.ariaLabel === null ? void 0 : m.ariaLabel || `Edge from ${m.source} to ${m.target}`, "aria-describedby": T ? `${Nd}-${w}` : void 0, ref: O, ...m.domAttributes, children: [!G && s(C, { id: e, source: m.source, target: m.target, type: m.type, selected: m.selected, animated: m.animated, selectable: D, deletable: m.deletable ?? !0, label: m.label, labelStyle: m.labelStyle, labelShowBg: m.labelShowBg, labelBgStyle: m.labelBgStyle, labelBgPadding: m.labelBgPadding, labelBgBorderRadius: m.labelBgBorderRadius, sourceX: L, sourceY: M, targetX: F, targetY: U, sourcePosition: V, targetPosition: Y, data: m.data, style: m.style, sourceHandleId: m.sourceHandle, targetHandleId: m.targetHandle, markerStart: Z, markerEnd: J, pathOptions: "pathOptions" in m ? m.pathOptions : void 0, interactionWidth: m.interactionWidth }), P && s(Bv, { edge: m, isReconnectable: P, reconnectRadius: d, onReconnect: f, onReconnectStart: p, onReconnectEnd: h, sourceX: L, sourceY: M, targetX: F, targetY: U, sourcePosition: V, targetPosition: Y, setUpdateHover: E, setReconnecting: I })] }) });
}
var Dv = Be(Rv);
const zv = (e) => ({
  edgesFocusable: e.edgesFocusable,
  edgesReconnectable: e.edgesReconnectable,
  elementsSelectable: e.elementsSelectable,
  connectionMode: e.connectionMode,
  onError: e.onError
});
function Qd({ defaultMarkerColor: e, onlyRenderVisibleElements: t, rfId: n, edgeTypes: i, noPanClassName: o, onReconnect: r, onEdgeContextMenu: a, onEdgeMouseEnter: l, onEdgeMouseMove: c, onEdgeMouseLeave: u, onEdgeClick: d, reconnectRadius: f, onEdgeDoubleClick: p, onReconnectStart: h, onReconnectEnd: w, disableKeyboardA11y: g }) {
  const { edgesFocusable: _, edgesReconnectable: b, elementsSelectable: S, onError: m } = Se(zv, Ae), y = wv(t);
  return x("div", { className: "react-flow__edges", children: [s(Cv, { defaultColor: e, rfId: n }), y.map((v) => s(Dv, { id: v, edgesFocusable: _, edgesReconnectable: b, elementsSelectable: S, noPanClassName: o, onReconnect: r, onContextMenu: a, onMouseEnter: l, onMouseMove: c, onMouseLeave: u, onClick: d, reconnectRadius: f, onDoubleClick: p, onReconnectStart: h, onReconnectEnd: w, rfId: n, onError: m, edgeTypes: i, disableKeyboardA11y: g }, v))] });
}
Qd.displayName = "EdgeRenderer";
const Fv = Be(Qd), Lv = (e) => `translate(${e.transform[0]}px,${e.transform[1]}px) scale(${e.transform[2]})`;
function $v({ children: e }) {
  const t = Se(Lv);
  return s("div", { className: "react-flow__viewport xyflow__viewport react-flow__container", style: { transform: t }, children: e });
}
function Ov(e) {
  const t = Ys(), n = ee(!1);
  oe(() => {
    !n.current && t.viewportInitialized && e && (setTimeout(() => e(t), 1), n.current = !0);
  }, [e, t.viewportInitialized]);
}
const Hv = (e) => e.panZoom?.syncViewport;
function Gv(e) {
  const t = Se(Hv), n = ke();
  return oe(() => {
    e && (t?.(e), n.setState({ transform: [e.x, e.y, e.zoom] }));
  }, [e, t]), null;
}
function Wv(e) {
  return e.connection.inProgress ? { ...e.connection, to: zo(e.connection.to, e.transform) } : { ...e.connection };
}
function Uv(e) {
  return Wv;
}
function jv(e) {
  const t = Uv();
  return Se(t, Ae);
}
const Vv = (e) => ({
  nodesConnectable: e.nodesConnectable,
  isValid: e.connection.isValid,
  inProgress: e.connection.inProgress,
  width: e.width,
  height: e.height
});
function Zv({ containerStyle: e, style: t, type: n, component: i }) {
  const { nodesConnectable: o, width: r, height: a, isValid: l, inProgress: c } = Se(Vv, Ae);
  return !(r && o && c) ? null : s("svg", { style: e, width: r, height: a, className: "react-flow__connectionline react-flow__container", children: s("g", { className: Fe(["react-flow__connection", Qu(l)]), children: s(Jd, { style: t, type: n, CustomComponent: i, isValid: l }) }) });
}
const Jd = ({ style: e, type: t = An.Bezier, CustomComponent: n, isValid: i }) => {
  const { inProgress: o, from: r, fromNode: a, fromHandle: l, fromPosition: c, to: u, toNode: d, toHandle: f, toPosition: p, pointer: h } = jv();
  if (!o)
    return;
  if (n)
    return s(n, { connectionLineType: t, connectionLineStyle: e, fromNode: a, fromHandle: l, fromX: r.x, fromY: r.y, toX: u.x, toY: u.y, fromPosition: c, toPosition: p, connectionStatus: Qu(i), toNode: d, toHandle: f, pointer: h });
  let w = "";
  const g = {
    sourceX: r.x,
    sourceY: r.y,
    sourcePosition: c,
    targetX: u.x,
    targetY: u.y,
    targetPosition: p
  };
  switch (t) {
    case An.Bezier:
      [w] = ud(g);
      break;
    case An.SimpleBezier:
      [w] = Od(g);
      break;
    case An.Step:
      [w] = is({
        ...g,
        borderRadius: 0
      });
      break;
    case An.SmoothStep:
      [w] = is(g);
      break;
    default:
      [w] = fd(g);
  }
  return s("path", { d: w, fill: "none", className: "react-flow__connection-path", style: e });
};
Jd.displayName = "ConnectionLine";
const Yv = {};
function vc(e = Yv) {
  ee(e), ke(), oe(() => {
  }, [e]);
}
function Xv() {
  ke(), ee(!1), oe(() => {
  }, []);
}
function ef({ nodeTypes: e, edgeTypes: t, onInit: n, onNodeClick: i, onEdgeClick: o, onNodeDoubleClick: r, onEdgeDoubleClick: a, onNodeMouseEnter: l, onNodeMouseMove: c, onNodeMouseLeave: u, onNodeContextMenu: d, onSelectionContextMenu: f, onSelectionStart: p, onSelectionEnd: h, connectionLineType: w, connectionLineStyle: g, connectionLineComponent: _, connectionLineContainerStyle: b, selectionKeyCode: S, selectionOnDrag: m, selectionMode: y, multiSelectionKeyCode: v, panActivationKeyCode: C, zoomActivationKeyCode: T, deleteKeyCode: P, onlyRenderVisibleElements: D, elementsSelectable: O, defaultViewport: z, translateExtent: E, minZoom: G, maxZoom: I, preventScrolling: $, defaultMarkerColor: R, zoomOnScroll: L, zoomOnPinch: M, panOnScroll: F, panOnScrollSpeed: U, panOnScrollMode: V, zoomOnDoubleClick: Y, panOnDrag: Z, onPaneClick: J, onPaneMouseEnter: q, onPaneMouseMove: A, onPaneMouseLeave: N, onPaneScroll: W, onPaneContextMenu: K, paneClickDistance: Q, nodeClickDistance: ne, onEdgeContextMenu: re, onEdgeMouseEnter: ae, onEdgeMouseMove: se, onEdgeMouseLeave: te, reconnectRadius: he, onReconnect: ye, onReconnectStart: _e, onReconnectEnd: Me, noDragClassName: Pe, noWheelClassName: Ce, noPanClassName: Re, disableKeyboardA11y: Oe, nodeExtent: xt, rfId: nt, viewport: Qe, onViewportChange: it }) {
  return vc(e), vc(t), Xv(), Ov(n), Gv(Qe), s(uv, { onPaneClick: J, onPaneMouseEnter: q, onPaneMouseMove: A, onPaneMouseLeave: N, onPaneContextMenu: K, onPaneScroll: W, paneClickDistance: Q, deleteKeyCode: P, selectionKeyCode: S, selectionOnDrag: m, selectionMode: y, onSelectionStart: p, onSelectionEnd: h, multiSelectionKeyCode: v, panActivationKeyCode: C, zoomActivationKeyCode: T, elementsSelectable: O, zoomOnScroll: L, zoomOnPinch: M, zoomOnDoubleClick: Y, panOnScroll: F, panOnScrollSpeed: U, panOnScrollMode: V, panOnDrag: Z, defaultViewport: z, translateExtent: E, minZoom: G, maxZoom: I, onSelectionContextMenu: f, preventScrolling: $, noDragClassName: Pe, noWheelClassName: Ce, noPanClassName: Re, disableKeyboardA11y: Oe, onViewportChange: it, isControlledViewport: !!Qe, children: x($v, { children: [s(Fv, { edgeTypes: t, onEdgeClick: o, onEdgeDoubleClick: a, onReconnect: ye, onReconnectStart: _e, onReconnectEnd: Me, onlyRenderVisibleElements: D, onEdgeContextMenu: re, onEdgeMouseEnter: ae, onEdgeMouseMove: se, onEdgeMouseLeave: te, reconnectRadius: he, defaultMarkerColor: R, noPanClassName: Re, disableKeyboardA11y: Oe, rfId: nt }), s(Zv, { style: g, type: w, component: _, containerStyle: b }), s("div", { className: "react-flow__edgelabel-renderer" }), s(vv, { nodeTypes: e, onNodeClick: i, onNodeDoubleClick: r, onNodeMouseEnter: l, onNodeMouseMove: c, onNodeMouseLeave: u, onNodeContextMenu: d, nodeClickDistance: ne, onlyRenderVisibleElements: D, noPanClassName: Re, noDragClassName: Pe, disableKeyboardA11y: Oe, nodeExtent: xt, rfId: nt }), s("div", { className: "react-flow__viewport-portal" })] }) });
}
ef.displayName = "GraphView";
const Kv = Be(ef), wc = ({ nodes: e, edges: t, defaultNodes: n, defaultEdges: i, width: o, height: r, fitView: a, fitViewOptions: l, minZoom: c = 0.5, maxZoom: u = 2, nodeOrigin: d, nodeExtent: f, zIndexMode: p = "basic" } = {}) => {
  const h = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ new Map(), _ = /* @__PURE__ */ new Map(), b = i ?? t ?? [], S = n ?? e ?? [], m = d ?? [0, 0], y = f ?? mo;
  md(g, _, b);
  const { nodesInitialized: v } = rs(S, h, w, {
    nodeOrigin: m,
    nodeExtent: y,
    zIndexMode: p
  });
  let C = [0, 0, 1];
  if (a && o && r) {
    const T = Ro(h, {
      filter: (z) => !!((z.width || z.initialWidth) && (z.height || z.initialHeight))
    }), { x: P, y: D, zoom: O } = Hs(T, o, r, c, u, l?.padding ?? 0.1);
    C = [P, D, O];
  }
  return {
    rfId: "1",
    width: o ?? 0,
    height: r ?? 0,
    transform: C,
    nodes: S,
    nodesInitialized: v,
    nodeLookup: h,
    parentLookup: w,
    edges: b,
    edgeLookup: _,
    connectionLookup: g,
    onNodesChange: null,
    onEdgesChange: null,
    hasDefaultNodes: n !== void 0,
    hasDefaultEdges: i !== void 0,
    panZoom: null,
    minZoom: c,
    maxZoom: u,
    translateExtent: mo,
    nodeExtent: y,
    nodesSelectionActive: !1,
    userSelectionActive: !1,
    userSelectionRect: null,
    connectionMode: Bi.Strict,
    domNode: null,
    paneDragging: !1,
    noPanClassName: "nopan",
    nodeOrigin: m,
    nodeDragThreshold: 1,
    connectionDragThreshold: 1,
    snapGrid: [15, 15],
    snapToGrid: !1,
    nodesDraggable: !0,
    nodesConnectable: !0,
    nodesFocusable: !0,
    edgesFocusable: !0,
    edgesReconnectable: !0,
    elementsSelectable: !0,
    elevateNodesOnSelect: !0,
    elevateEdgesOnSelect: !0,
    selectNodesOnDrag: !0,
    multiSelectionActive: !1,
    fitViewQueued: a ?? !1,
    fitViewOptions: l,
    fitViewResolver: null,
    connection: { ...qu },
    connectionClickStartHandle: null,
    connectOnClick: !0,
    ariaLiveMessage: "",
    autoPanOnConnect: !0,
    autoPanOnNodeDrag: !0,
    autoPanOnNodeFocus: !0,
    autoPanSpeed: 15,
    connectionRadius: 20,
    onError: Mb,
    isValidConnection: void 0,
    onSelectionChangeHandlers: [],
    lib: "react",
    debug: !1,
    ariaLabelConfig: Ku,
    zIndexMode: p,
    onNodesChangeMiddlewareMap: /* @__PURE__ */ new Map(),
    onEdgesChangeMiddlewareMap: /* @__PURE__ */ new Map()
  };
}, qv = ({ nodes: e, edges: t, defaultNodes: n, defaultEdges: i, width: o, height: r, fitView: a, fitViewOptions: l, minZoom: c, maxZoom: u, nodeOrigin: d, nodeExtent: f, zIndexMode: p }) => Up((h, w) => {
  async function g() {
    const { nodeLookup: _, panZoom: b, fitViewOptions: S, fitViewResolver: m, width: y, height: v, minZoom: C, maxZoom: T } = w();
    b && (await _b({
      nodes: _,
      width: y,
      height: v,
      panZoom: b,
      minZoom: C,
      maxZoom: T
    }, S), m?.resolve(!0), h({ fitViewResolver: null }));
  }
  return {
    ...wc({
      nodes: e,
      edges: t,
      width: o,
      height: r,
      fitView: a,
      fitViewOptions: l,
      minZoom: c,
      maxZoom: u,
      nodeOrigin: d,
      nodeExtent: f,
      defaultNodes: n,
      defaultEdges: i,
      zIndexMode: p
    }),
    setNodes: (_) => {
      const { nodeLookup: b, parentLookup: S, nodeOrigin: m, elevateNodesOnSelect: y, fitViewQueued: v, zIndexMode: C, nodesSelectionActive: T } = w(), { nodesInitialized: P, hasSelectedNodes: D } = rs(_, b, S, {
        nodeOrigin: m,
        nodeExtent: f,
        elevateNodesOnSelect: y,
        checkEquality: !0,
        zIndexMode: C
      }), O = T && D;
      v && P ? (g(), h({
        nodes: _,
        nodesInitialized: P,
        fitViewQueued: !1,
        fitViewOptions: void 0,
        nodesSelectionActive: O
      })) : h({ nodes: _, nodesInitialized: P, nodesSelectionActive: O });
    },
    setEdges: (_) => {
      const { connectionLookup: b, edgeLookup: S } = w();
      md(b, S, _), h({ edges: _ });
    },
    setDefaultNodesAndEdges: (_, b) => {
      if (_) {
        const { setNodes: S } = w();
        S(_), h({ hasDefaultNodes: !0 });
      }
      if (b) {
        const { setEdges: S } = w();
        S(b), h({ hasDefaultEdges: !0 });
      }
    },
    /*
     * Every node gets registered at a ResizeObserver. Whenever a node
     * changes its dimensions, this function is called to measure the
     * new dimensions and update the nodes.
     */
    updateNodeInternals: (_) => {
      const { triggerNodeChanges: b, nodeLookup: S, parentLookup: m, domNode: y, nodeOrigin: v, nodeExtent: C, debug: T, fitViewQueued: P, zIndexMode: D } = w(), { changes: O, updatedInternals: z } = Vb(_, S, m, y, v, C, D);
      z && (Gb(S, m, { nodeOrigin: v, nodeExtent: C, zIndexMode: D }), P ? (g(), h({ fitViewQueued: !1, fitViewOptions: void 0 })) : h({}), O?.length > 0 && (T && console.log("React Flow: trigger node changes", O), b?.(O)));
    },
    updateNodePositions: (_, b = !1) => {
      const S = [];
      let m = [];
      const { nodeLookup: y, triggerNodeChanges: v, connection: C, updateConnection: T, onNodesChangeMiddlewareMap: P } = w();
      for (const [D, O] of _) {
        const z = y.get(D), E = !!(z?.expandParent && z?.parentId && O?.position), G = {
          id: D,
          type: "position",
          position: E ? {
            x: Math.max(0, O.position.x),
            y: Math.max(0, O.position.y)
          } : O.position,
          dragging: b
        };
        if (z && C.inProgress && C.fromNode.id === z.id) {
          const I = bi(z, C.fromHandle, de.Left, !0);
          T({ ...C, from: I });
        }
        E && z.parentId && S.push({
          id: D,
          parentId: z.parentId,
          rect: {
            ...O.internals.positionAbsolute,
            width: O.measured.width ?? 0,
            height: O.measured.height ?? 0
          }
        }), m.push(G);
      }
      if (S.length > 0) {
        const { parentLookup: D, nodeOrigin: O } = w(), z = Zs(S, y, D, O);
        m.push(...z);
      }
      for (const D of P.values())
        m = D(m);
      v(m);
    },
    triggerNodeChanges: (_) => {
      const { onNodesChange: b, setNodes: S, nodes: m, hasDefaultNodes: y, debug: v } = w();
      if (_?.length) {
        if (y) {
          const C = Ed(_, m);
          S(C);
        }
        v && console.log("React Flow: trigger node changes", _), b?.(_);
      }
    },
    triggerEdgeChanges: (_) => {
      const { onEdgesChange: b, setEdges: S, edges: m, hasDefaultEdges: y, debug: v } = w();
      if (_?.length) {
        if (y) {
          const C = Ad(_, m);
          S(C);
        }
        v && console.log("React Flow: trigger edge changes", _), b?.(_);
      }
    },
    addSelectedNodes: (_) => {
      const { multiSelectionActive: b, edgeLookup: S, nodeLookup: m, triggerNodeChanges: y, triggerEdgeChanges: v } = w();
      if (b) {
        const C = _.map((T) => li(T, !0));
        y(C);
        return;
      }
      y(Ti(m, /* @__PURE__ */ new Set([..._]), !0)), v(Ti(S));
    },
    addSelectedEdges: (_) => {
      const { multiSelectionActive: b, edgeLookup: S, nodeLookup: m, triggerNodeChanges: y, triggerEdgeChanges: v } = w();
      if (b) {
        const C = _.map((T) => li(T, !0));
        v(C);
        return;
      }
      v(Ti(S, /* @__PURE__ */ new Set([..._]))), y(Ti(m, /* @__PURE__ */ new Set(), !0));
    },
    unselectNodesAndEdges: ({ nodes: _, edges: b } = {}) => {
      const { edges: S, nodes: m, nodeLookup: y, triggerNodeChanges: v, triggerEdgeChanges: C } = w(), T = _ || m, P = b || S, D = [];
      for (const z of T) {
        if (!z.selected)
          continue;
        const E = y.get(z.id);
        E && (E.selected = !1), D.push(li(z.id, !1));
      }
      const O = [];
      for (const z of P)
        z.selected && O.push(li(z.id, !1));
      v(D), C(O);
    },
    setMinZoom: (_) => {
      const { panZoom: b, maxZoom: S } = w();
      b?.setScaleExtent([_, S]), h({ minZoom: _ });
    },
    setMaxZoom: (_) => {
      const { panZoom: b, minZoom: S } = w();
      b?.setScaleExtent([S, _]), h({ maxZoom: _ });
    },
    setTranslateExtent: (_) => {
      w().panZoom?.setTranslateExtent(_), h({ translateExtent: _ });
    },
    resetSelectedElements: () => {
      const { edges: _, nodes: b, triggerNodeChanges: S, triggerEdgeChanges: m, elementsSelectable: y } = w();
      if (!y)
        return;
      const v = b.reduce((T, P) => P.selected ? [...T, li(P.id, !1)] : T, []), C = _.reduce((T, P) => P.selected ? [...T, li(P.id, !1)] : T, []);
      S(v), m(C);
    },
    setNodeExtent: (_) => {
      const { nodes: b, nodeLookup: S, parentLookup: m, nodeOrigin: y, elevateNodesOnSelect: v, nodeExtent: C, zIndexMode: T } = w();
      _[0][0] === C[0][0] && _[0][1] === C[0][1] && _[1][0] === C[1][0] && _[1][1] === C[1][1] || (rs(b, S, m, {
        nodeOrigin: y,
        nodeExtent: _,
        elevateNodesOnSelect: v,
        checkEquality: !1,
        zIndexMode: T
      }), h({ nodeExtent: _ }));
    },
    panBy: (_) => {
      const { transform: b, width: S, height: m, panZoom: y, translateExtent: v } = w();
      return Zb({ delta: _, panZoom: y, transform: b, translateExtent: v, width: S, height: m });
    },
    setCenter: async (_, b, S) => {
      const { width: m, height: y, maxZoom: v, panZoom: C } = w();
      if (!C)
        return Promise.resolve(!1);
      const T = typeof S?.zoom < "u" ? S.zoom : v;
      return await C.setViewport({
        x: m / 2 - _ * T,
        y: y / 2 - b * T,
        zoom: T
      }, { duration: S?.duration, ease: S?.ease, interpolate: S?.interpolate }), Promise.resolve(!0);
    },
    cancelConnection: () => {
      h({
        connection: { ...qu }
      });
    },
    updateConnection: (_) => {
      h({ connection: _ });
    },
    reset: () => h({ ...wc() })
  };
}, Object.is);
function Qv({ initialNodes: e, initialEdges: t, defaultNodes: n, defaultEdges: i, initialWidth: o, initialHeight: r, initialMinZoom: a, initialMaxZoom: l, initialFitViewOptions: c, fitView: u, nodeOrigin: d, nodeExtent: f, zIndexMode: p, children: h }) {
  const [w] = le(() => qv({
    nodes: e,
    edges: t,
    defaultNodes: n,
    defaultEdges: i,
    width: o,
    height: r,
    fitView: u,
    minZoom: a,
    maxZoom: l,
    fitViewOptions: c,
    nodeOrigin: d,
    nodeExtent: f,
    zIndexMode: p
  }));
  return s(by, { value: w, children: s($y, { children: h }) });
}
function Jv({ children: e, nodes: t, edges: n, defaultNodes: i, defaultEdges: o, width: r, height: a, fitView: l, fitViewOptions: c, minZoom: u, maxZoom: d, nodeOrigin: f, nodeExtent: p, zIndexMode: h }) {
  return To(Qr) ? s(be, { children: e }) : s(Qv, { initialNodes: t, initialEdges: n, defaultNodes: i, defaultEdges: o, initialWidth: r, initialHeight: a, fitView: l, initialFitViewOptions: c, initialMinZoom: u, initialMaxZoom: d, nodeOrigin: f, nodeExtent: p, zIndexMode: h, children: e });
}
const ew = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  position: "relative",
  zIndex: 0
};
function tw({ nodes: e, edges: t, defaultNodes: n, defaultEdges: i, className: o, nodeTypes: r, edgeTypes: a, onNodeClick: l, onEdgeClick: c, onInit: u, onMove: d, onMoveStart: f, onMoveEnd: p, onConnect: h, onConnectStart: w, onConnectEnd: g, onClickConnectStart: _, onClickConnectEnd: b, onNodeMouseEnter: S, onNodeMouseMove: m, onNodeMouseLeave: y, onNodeContextMenu: v, onNodeDoubleClick: C, onNodeDragStart: T, onNodeDrag: P, onNodeDragStop: D, onNodesDelete: O, onEdgesDelete: z, onDelete: E, onSelectionChange: G, onSelectionDragStart: I, onSelectionDrag: $, onSelectionDragStop: R, onSelectionContextMenu: L, onSelectionStart: M, onSelectionEnd: F, onBeforeDelete: U, connectionMode: V, connectionLineType: Y = An.Bezier, connectionLineStyle: Z, connectionLineComponent: J, connectionLineContainerStyle: q, deleteKeyCode: A = "Backspace", selectionKeyCode: N = "Shift", selectionOnDrag: W = !1, selectionMode: K = go.Full, panActivationKeyCode: Q = "Space", multiSelectionKeyCode: ne = vo() ? "Meta" : "Control", zoomActivationKeyCode: re = vo() ? "Meta" : "Control", snapToGrid: ae, snapGrid: se, onlyRenderVisibleElements: te = !1, selectNodesOnDrag: he, nodesDraggable: ye, autoPanOnNodeFocus: _e, nodesConnectable: Me, nodesFocusable: Pe, nodeOrigin: Ce = Id, edgesFocusable: Re, edgesReconnectable: Oe, elementsSelectable: xt = !0, defaultViewport: nt = Ay, minZoom: Qe = 0.5, maxZoom: it = 2, translateExtent: Lt = mo, preventScrolling: on = !0, nodeExtent: $t, defaultMarkerColor: Ln = "#b1b1b7", zoomOnScroll: $n = !0, zoomOnPinch: On = !0, panOnScroll: Hn = !1, panOnScrollSpeed: Gn = 0.5, panOnScrollMode: Wn = pi.Free, zoomOnDoubleClick: Un = !0, panOnDrag: _t = !0, onPaneClick: ct, onPaneMouseEnter: St, onPaneMouseMove: ot, onPaneMouseLeave: Ot, onPaneScroll: rn, onPaneContextMenu: an, paneClickDistance: Ht = 1, nodeClickDistance: sn = 0, children: ln, onReconnect: jn, onReconnectStart: Vn, onReconnectEnd: Zn, onEdgeContextMenu: Yn, onEdgeDoubleClick: cn, onEdgeMouseEnter: un, onEdgeMouseMove: Xn, onEdgeMouseLeave: Kn, reconnectRadius: qn = 10, onNodesChange: Qn, onEdgesChange: dn, noDragClassName: fn = "nodrag", noWheelClassName: pn = "nowheel", noPanClassName: Gt = "nopan", fitView: hn, fitViewOptions: mn, connectOnClick: Jn, attributionPosition: ei, proOptions: Wt, defaultEdgeOptions: ti, elevateNodesOnSelect: Ut = !0, elevateEdgesOnSelect: ni = !1, disableKeyboardA11y: gn = !1, autoPanOnConnect: bn, autoPanOnNodeDrag: jt, autoPanSpeed: yn, connectionRadius: Mt, isValidConnection: Ct, onError: ii, style: rt, id: ut, nodeDragThreshold: Ye, connectionDragThreshold: at, viewport: je, onViewportChange: Nt, width: oi, height: ri, colorMode: It = "light", debug: ai, onScroll: vn, ariaLabelConfig: Vt, zIndexMode: Tt = "basic", ...Zt }, dt) {
  const Yt = ut || "1", Et = Ry(It), wn = ce((H) => {
    H.currentTarget.scrollTo({ top: 0, left: 0, behavior: "instant" }), vn?.(H);
  }, [vn]);
  return s("div", { "data-testid": "rf__wrapper", ...Zt, onScroll: wn, style: { ...rt, ...ew }, ref: dt, className: Fe(["react-flow", o, Et]), id: ut, role: "application", children: x(Jv, { nodes: e, edges: t, width: oi, height: ri, fitView: hn, fitViewOptions: mn, minZoom: Qe, maxZoom: it, nodeOrigin: Ce, nodeExtent: $t, zIndexMode: Tt, children: [s(By, { nodes: e, edges: t, defaultNodes: n, defaultEdges: i, onConnect: h, onConnectStart: w, onConnectEnd: g, onClickConnectStart: _, onClickConnectEnd: b, nodesDraggable: ye, autoPanOnNodeFocus: _e, nodesConnectable: Me, nodesFocusable: Pe, edgesFocusable: Re, edgesReconnectable: Oe, elementsSelectable: xt, elevateNodesOnSelect: Ut, elevateEdgesOnSelect: ni, minZoom: Qe, maxZoom: it, nodeExtent: $t, onNodesChange: Qn, onEdgesChange: dn, snapToGrid: ae, snapGrid: se, connectionMode: V, translateExtent: Lt, connectOnClick: Jn, defaultEdgeOptions: ti, fitView: hn, fitViewOptions: mn, onNodesDelete: O, onEdgesDelete: z, onDelete: E, onNodeDragStart: T, onNodeDrag: P, onNodeDragStop: D, onSelectionDrag: $, onSelectionDragStart: I, onSelectionDragStop: R, onMove: d, onMoveStart: f, onMoveEnd: p, noPanClassName: Gt, nodeOrigin: Ce, rfId: Yt, autoPanOnConnect: bn, autoPanOnNodeDrag: jt, autoPanSpeed: yn, onError: ii, connectionRadius: Mt, isValidConnection: Ct, selectNodesOnDrag: he, nodeDragThreshold: Ye, connectionDragThreshold: at, onBeforeDelete: U, debug: ai, ariaLabelConfig: Vt, zIndexMode: Tt }), s(Kv, { onInit: u, onNodeClick: l, onEdgeClick: c, onNodeMouseEnter: S, onNodeMouseMove: m, onNodeMouseLeave: y, onNodeContextMenu: v, onNodeDoubleClick: C, nodeTypes: r, edgeTypes: a, connectionLineType: Y, connectionLineStyle: Z, connectionLineComponent: J, connectionLineContainerStyle: q, selectionKeyCode: N, selectionOnDrag: W, selectionMode: K, deleteKeyCode: A, multiSelectionKeyCode: ne, panActivationKeyCode: Q, zoomActivationKeyCode: re, onlyRenderVisibleElements: te, defaultViewport: nt, translateExtent: Lt, minZoom: Qe, maxZoom: it, preventScrolling: on, zoomOnScroll: $n, zoomOnPinch: On, zoomOnDoubleClick: Un, panOnScroll: Hn, panOnScrollSpeed: Gn, panOnScrollMode: Wn, panOnDrag: _t, onPaneClick: ct, onPaneMouseEnter: St, onPaneMouseMove: ot, onPaneMouseLeave: Ot, onPaneScroll: rn, onPaneContextMenu: an, paneClickDistance: Ht, nodeClickDistance: sn, onSelectionContextMenu: L, onSelectionStart: M, onSelectionEnd: F, onReconnect: jn, onReconnectStart: Vn, onReconnectEnd: Zn, onEdgeContextMenu: Yn, onEdgeDoubleClick: cn, onEdgeMouseEnter: un, onEdgeMouseMove: Xn, onEdgeMouseLeave: Kn, reconnectRadius: qn, defaultMarkerColor: Ln, noDragClassName: fn, noWheelClassName: pn, noPanClassName: Gt, rfId: Yt, disableKeyboardA11y: gn, nodeExtent: $t, viewport: je, onViewportChange: Nt }), s(Ey, { onSelectionChange: G }), ln, s(My, { proOptions: Wt, position: ei }), s(Sy, { rfId: Yt, disableKeyboardA11y: gn })] }) });
}
var nw = kd(tw);
function iw(e) {
  const [t, n] = le(e), i = ce((o) => n((r) => Ed(o, r)), []);
  return [t, n, i];
}
function ow(e) {
  const [t, n] = le(e), i = ce((o) => n((r) => Ad(o, r)), []);
  return [t, n, i];
}
function rw({ dimensions: e, lineWidth: t, variant: n, className: i }) {
  return s("path", { strokeWidth: t, d: `M${e[0] / 2} 0 V${e[1]} M0 ${e[1] / 2} H${e[0]}`, className: Fe(["react-flow__background-pattern", n, i]) });
}
function aw({ radius: e, className: t }) {
  return s("circle", { cx: e, cy: e, r: e, className: Fe(["react-flow__background-pattern", "dots", t]) });
}
var Dn;
(function(e) {
  e.Lines = "lines", e.Dots = "dots", e.Cross = "cross";
})(Dn || (Dn = {}));
const sw = {
  [Dn.Dots]: 1,
  [Dn.Lines]: 1,
  [Dn.Cross]: 6
}, lw = (e) => ({ transform: e.transform, patternId: `pattern-${e.rfId}` });
function tf({
  id: e,
  variant: t = Dn.Dots,
  // only used for dots and cross
  gap: n = 20,
  // only used for lines and cross
  size: i,
  lineWidth: o = 1,
  offset: r = 0,
  color: a,
  bgColor: l,
  style: c,
  className: u,
  patternClassName: d
}) {
  const f = ee(null), { transform: p, patternId: h } = Se(lw, Ae), w = i || sw[t], g = t === Dn.Dots, _ = t === Dn.Cross, b = Array.isArray(n) ? n : [n, n], S = [b[0] * p[2] || 1, b[1] * p[2] || 1], m = w * p[2], y = Array.isArray(r) ? r : [r, r], v = _ ? [m, m] : S, C = [
    y[0] * p[2] || 1 + v[0] / 2,
    y[1] * p[2] || 1 + v[1] / 2
  ], T = `${h}${e || ""}`;
  return x("svg", { className: Fe(["react-flow__background", u]), style: {
    ...c,
    ...ea,
    "--xy-background-color-props": l,
    "--xy-background-pattern-color-props": a
  }, ref: f, "data-testid": "rf__background", children: [s("pattern", { id: T, x: p[0] % S[0], y: p[1] % S[1], width: S[0], height: S[1], patternUnits: "userSpaceOnUse", patternTransform: `translate(-${C[0]},-${C[1]})`, children: g ? s(aw, { radius: m / 2, className: d }) : s(rw, { dimensions: v, lineWidth: o, variant: t, className: d }) }), s("rect", { x: "0", y: "0", width: "100%", height: "100%", fill: `url(#${T})` })] });
}
tf.displayName = "Background";
const cw = Be(tf);
function uw() {
  return s("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 32", children: s("path", { d: "M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" }) });
}
function dw() {
  return s("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 5", children: s("path", { d: "M0 0h32v4.2H0z" }) });
}
function fw() {
  return s("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 32 30", children: s("path", { d: "M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" }) });
}
function pw() {
  return s("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: s("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" }) });
}
function hw() {
  return s("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 32", children: s("path", { d: "M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" }) });
}
function Ko({ children: e, className: t, ...n }) {
  return s("button", { type: "button", className: Fe(["react-flow__controls-button", t]), ...n, children: e });
}
const mw = (e) => ({
  isInteractive: e.nodesDraggable || e.nodesConnectable || e.elementsSelectable,
  minZoomReached: e.transform[2] <= e.minZoom,
  maxZoomReached: e.transform[2] >= e.maxZoom,
  ariaLabelConfig: e.ariaLabelConfig
});
function nf({ style: e, showZoom: t = !0, showFitView: n = !0, showInteractive: i = !0, fitViewOptions: o, onZoomIn: r, onZoomOut: a, onFitView: l, onInteractiveChange: c, className: u, children: d, position: f = "bottom-left", orientation: p = "vertical", "aria-label": h }) {
  const w = ke(), { isInteractive: g, minZoomReached: _, maxZoomReached: b, ariaLabelConfig: S } = Se(mw, Ae), { zoomIn: m, zoomOut: y, fitView: v } = Ys(), C = () => {
    m(), r?.();
  }, T = () => {
    y(), a?.();
  }, P = () => {
    v(o), l?.();
  }, D = () => {
    w.setState({
      nodesDraggable: !g,
      nodesConnectable: !g,
      elementsSelectable: !g
    }), c?.(!g);
  };
  return x(Jr, { className: Fe(["react-flow__controls", p === "horizontal" ? "horizontal" : "vertical", u]), position: f, style: e, "data-testid": "rf__controls", "aria-label": h ?? S["controls.ariaLabel"], children: [t && x(be, { children: [s(Ko, { onClick: C, className: "react-flow__controls-zoomin", title: S["controls.zoomIn.ariaLabel"], "aria-label": S["controls.zoomIn.ariaLabel"], disabled: b, children: s(uw, {}) }), s(Ko, { onClick: T, className: "react-flow__controls-zoomout", title: S["controls.zoomOut.ariaLabel"], "aria-label": S["controls.zoomOut.ariaLabel"], disabled: _, children: s(dw, {}) })] }), n && s(Ko, { className: "react-flow__controls-fitview", onClick: P, title: S["controls.fitView.ariaLabel"], "aria-label": S["controls.fitView.ariaLabel"], children: s(fw, {}) }), i && s(Ko, { className: "react-flow__controls-interactive", onClick: D, title: S["controls.interactive.ariaLabel"], "aria-label": S["controls.interactive.ariaLabel"], children: g ? s(hw, {}) : s(pw, {}) }), d] });
}
nf.displayName = "Controls";
const gw = Be(nf);
function bw({ id: e, x: t, y: n, width: i, height: o, style: r, color: a, strokeColor: l, strokeWidth: c, className: u, borderRadius: d, shapeRendering: f, selected: p, onClick: h }) {
  const { background: w, backgroundColor: g } = r || {}, _ = a || w || g;
  return s("rect", { className: Fe(["react-flow__minimap-node", { selected: p }, u]), x: t, y: n, rx: d, ry: d, width: i, height: o, style: {
    fill: _,
    stroke: l,
    strokeWidth: c
  }, shapeRendering: f, onClick: h ? (b) => h(b, e) : void 0 });
}
const yw = Be(bw), vw = (e) => e.nodes.map((t) => t.id), ya = (e) => e instanceof Function ? e : () => e;
function ww({
  nodeStrokeColor: e,
  nodeColor: t,
  nodeClassName: n = "",
  nodeBorderRadius: i = 5,
  nodeStrokeWidth: o,
  /*
   * We need to rename the prop to be `CapitalCase` so that JSX will render it as
   * a component properly.
   */
  nodeComponent: r = yw,
  onClick: a
}) {
  const l = Se(vw, Ae), c = ya(t), u = ya(e), d = ya(n), f = typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision";
  return s(be, { children: l.map((p) => (
    /*
     * The split of responsibilities between MiniMapNodes and
     * NodeComponentWrapper may appear weird. However, it’s designed to
     * minimize the cost of updates when individual nodes change.
     *
     * For more details, see a similar commit in `NodeRenderer/index.tsx`.
     */
    s(_w, { id: p, nodeColorFunc: c, nodeStrokeColorFunc: u, nodeClassNameFunc: d, nodeBorderRadius: i, nodeStrokeWidth: o, NodeComponent: r, onClick: a, shapeRendering: f }, p)
  )) });
}
function xw({ id: e, nodeColorFunc: t, nodeStrokeColorFunc: n, nodeClassNameFunc: i, nodeBorderRadius: o, nodeStrokeWidth: r, shapeRendering: a, NodeComponent: l, onClick: c }) {
  const { node: u, x: d, y: f, width: p, height: h } = Se((w) => {
    const g = w.nodeLookup.get(e);
    if (!g)
      return { node: void 0, x: 0, y: 0, width: 0, height: 0 };
    const _ = g.internals.userNode, { x: b, y: S } = g.internals.positionAbsolute, { width: m, height: y } = tn(_);
    return {
      node: _,
      x: b,
      y: S,
      width: m,
      height: y
    };
  }, Ae);
  return !u || u.hidden || !od(u) ? null : s(l, { x: d, y: f, width: p, height: h, style: u.style, selected: !!u.selected, className: i(u), color: t(u), borderRadius: o, strokeColor: n(u), strokeWidth: r, shapeRendering: a, onClick: c, id: u.id });
}
const _w = Be(xw);
var Sw = Be(ww);
const Mw = 200, Cw = 150, Nw = (e) => !e.hidden, Iw = (e) => {
  const t = {
    x: -e.transform[0] / e.transform[2],
    y: -e.transform[1] / e.transform[2],
    width: e.width / e.transform[2],
    height: e.height / e.transform[2]
  };
  return {
    viewBB: t,
    boundingRect: e.nodeLookup.size > 0 ? id(Ro(e.nodeLookup, { filter: Nw }), t) : t,
    rfId: e.rfId,
    panZoom: e.panZoom,
    translateExtent: e.translateExtent,
    flowWidth: e.width,
    flowHeight: e.height,
    ariaLabelConfig: e.ariaLabelConfig
  };
}, Tw = "react-flow__minimap-desc";
function of({
  style: e,
  className: t,
  nodeStrokeColor: n,
  nodeColor: i,
  nodeClassName: o = "",
  nodeBorderRadius: r = 5,
  nodeStrokeWidth: a,
  /*
   * We need to rename the prop to be `CapitalCase` so that JSX will render it as
   * a component properly.
   */
  nodeComponent: l,
  bgColor: c,
  maskColor: u,
  maskStrokeColor: d,
  maskStrokeWidth: f,
  position: p = "bottom-right",
  onClick: h,
  onNodeClick: w,
  pannable: g = !1,
  zoomable: _ = !1,
  ariaLabel: b,
  inversePan: S,
  zoomStep: m = 1,
  offsetScale: y = 5
}) {
  const v = ke(), C = ee(null), { boundingRect: T, viewBB: P, rfId: D, panZoom: O, translateExtent: z, flowWidth: E, flowHeight: G, ariaLabelConfig: I } = Se(Iw, Ae), $ = e?.width ?? Mw, R = e?.height ?? Cw, L = T.width / $, M = T.height / R, F = Math.max(L, M), U = F * $, V = F * R, Y = y * F, Z = T.x - (U - T.width) / 2 - Y, J = T.y - (V - T.height) / 2 - Y, q = U + Y * 2, A = V + Y * 2, N = `${Tw}-${D}`, W = ee(0), K = ee();
  W.current = F, oe(() => {
    if (C.current && O)
      return K.current = ny({
        domNode: C.current,
        panZoom: O,
        getTransform: () => v.getState().transform,
        getViewScale: () => W.current
      }), () => {
        K.current?.destroy();
      };
  }, [O]), oe(() => {
    K.current?.update({
      translateExtent: z,
      width: E,
      height: G,
      inversePan: S,
      pannable: g,
      zoomStep: m,
      zoomable: _
    });
  }, [g, _, S, m, z, E, G]);
  const Q = h ? (ae) => {
    const [se, te] = K.current?.pointer(ae) || [0, 0];
    h(ae, { x: se, y: te });
  } : void 0, ne = w ? ce((ae, se) => {
    const te = v.getState().nodeLookup.get(se).internals.userNode;
    w(ae, te);
  }, []) : void 0, re = b ?? I["minimap.ariaLabel"];
  return s(Jr, { position: p, style: {
    ...e,
    "--xy-minimap-background-color-props": typeof c == "string" ? c : void 0,
    "--xy-minimap-mask-background-color-props": typeof u == "string" ? u : void 0,
    "--xy-minimap-mask-stroke-color-props": typeof d == "string" ? d : void 0,
    "--xy-minimap-mask-stroke-width-props": typeof f == "number" ? f * F : void 0,
    "--xy-minimap-node-background-color-props": typeof i == "string" ? i : void 0,
    "--xy-minimap-node-stroke-color-props": typeof n == "string" ? n : void 0,
    "--xy-minimap-node-stroke-width-props": typeof a == "number" ? a : void 0
  }, className: Fe(["react-flow__minimap", t]), "data-testid": "rf__minimap", children: x("svg", { width: $, height: R, viewBox: `${Z} ${J} ${q} ${A}`, className: "react-flow__minimap-svg", role: "img", "aria-labelledby": N, ref: C, onClick: Q, children: [re && s("title", { id: N, children: re }), s(Sw, { onClick: ne, nodeColor: i, nodeStrokeColor: n, nodeBorderRadius: r, nodeClassName: o, nodeStrokeWidth: a, nodeComponent: l }), s("path", { className: "react-flow__minimap-mask", d: `M${Z - Y},${J - Y}h${q + Y * 2}v${A + Y * 2}h${-q - Y * 2}z
        M${P.x},${P.y}h${P.width}v${P.height}h${-P.width}z`, fillRule: "evenodd", pointerEvents: "none" })] }) });
}
of.displayName = "MiniMap";
const Ew = Be(of), Aw = (e) => (t) => e ? `${Math.max(1 / t.transform[2], 1)}` : void 0, kw = {
  [Fi.Line]: "right",
  [Fi.Handle]: "bottom-right"
};
function Pw({ nodeId: e, position: t, variant: n = Fi.Handle, className: i, style: o = void 0, children: r, color: a, minWidth: l = 10, minHeight: c = 10, maxWidth: u = Number.MAX_VALUE, maxHeight: d = Number.MAX_VALUE, keepAspectRatio: f = !1, resizeDirection: p, autoScale: h = !0, shouldResize: w, onResizeStart: g, onResize: _, onResizeEnd: b }) {
  const S = Dd(), m = typeof e == "string" ? e : S, y = ke(), v = ee(null), C = n === Fi.Handle, T = Se(ce(Aw(C && h), [C, h]), Ae), P = ee(null), D = t ?? kw[n];
  oe(() => {
    if (!(!v.current || !m))
      return P.current || (P.current = gy({
        domNode: v.current,
        nodeId: m,
        getStoreItems: () => {
          const { nodeLookup: z, transform: E, snapGrid: G, snapToGrid: I, nodeOrigin: $, domNode: R } = y.getState();
          return {
            nodeLookup: z,
            transform: E,
            snapGrid: G,
            snapToGrid: I,
            nodeOrigin: $,
            paneDomNode: R
          };
        },
        onChange: (z, E) => {
          const { triggerNodeChanges: G, nodeLookup: I, parentLookup: $, nodeOrigin: R } = y.getState(), L = [], M = { x: z.x, y: z.y }, F = I.get(m);
          if (F && F.expandParent && F.parentId) {
            const U = F.origin ?? R, V = z.width ?? F.measured.width ?? 0, Y = z.height ?? F.measured.height ?? 0, Z = {
              id: F.id,
              parentId: F.parentId,
              rect: {
                width: V,
                height: Y,
                ...rd({
                  x: z.x ?? F.position.x,
                  y: z.y ?? F.position.y
                }, { width: V, height: Y }, F.parentId, I, U)
              }
            }, J = Zs([Z], I, $, R);
            L.push(...J), M.x = z.x ? Math.max(U[0] * V, z.x) : void 0, M.y = z.y ? Math.max(U[1] * Y, z.y) : void 0;
          }
          if (M.x !== void 0 && M.y !== void 0) {
            const U = {
              id: m,
              type: "position",
              position: { ...M }
            };
            L.push(U);
          }
          if (z.width !== void 0 && z.height !== void 0) {
            const V = {
              id: m,
              type: "dimensions",
              resizing: !0,
              setAttributes: p ? p === "horizontal" ? "width" : "height" : !0,
              dimensions: {
                width: z.width,
                height: z.height
              }
            };
            L.push(V);
          }
          for (const U of E) {
            const V = {
              ...U,
              type: "position"
            };
            L.push(V);
          }
          G(L);
        },
        onEnd: ({ width: z, height: E }) => {
          const G = {
            id: m,
            type: "dimensions",
            resizing: !1,
            dimensions: {
              width: z,
              height: E
            }
          };
          y.getState().triggerNodeChanges([G]);
        }
      })), P.current.update({
        controlPosition: D,
        boundaries: {
          minWidth: l,
          minHeight: c,
          maxWidth: u,
          maxHeight: d
        },
        keepAspectRatio: f,
        resizeDirection: p,
        onResizeStart: g,
        onResize: _,
        onResizeEnd: b,
        shouldResize: w
      }), () => {
        P.current?.destroy();
      };
  }, [
    D,
    l,
    c,
    u,
    d,
    f,
    g,
    _,
    b,
    w
  ]);
  const O = D.split("-");
  return s("div", { className: Fe(["react-flow__resize-control", "nodrag", ...O, n, i]), ref: v, style: {
    ...o,
    scale: T,
    ...a && { [C ? "backgroundColor" : "borderColor"]: a }
  }, children: r });
}
Be(Pw);
function rf(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
const Bw = (e) => e.kind === "material" || e.kind === "wall" || e.kind === "tile", va = rf;
function xc(e, t, n) {
  const { mapTextureUrl: i, textureUrl: o, materialParams: r, ...a } = n ?? {};
  return {
    ...a,
    id: e,
    color: t,
    material: "STANDARD",
    materialParams: {
      ...r ?? {},
      color: t
    }
  };
}
function io(e) {
  return `${e}-${Date.now()}`;
}
function qo(e) {
  return e === "questStatus" ? {
    id: io("condition-quest"),
    type: "condition",
    label: "Quest Active",
    condition: { type: "questStatus", questId: "welcome", status: "active" }
  } : e === "friendshipAtLeast" ? {
    id: io("condition-friendship"),
    type: "condition",
    label: "Friendship Gate",
    condition: { type: "friendshipAtLeast", score: 150 }
  } : {
    id: io("condition-idle"),
    type: "condition",
    label: "Navigation Idle",
    condition: { type: "navigationIdle" }
  };
}
function oo(e, t) {
  return e === "speak" ? {
    id: io("speak"),
    type: "action",
    label: "Speak",
    action: { type: "speak", text: "안녕?", duration: 2 }
  } : {
    id: io("wander"),
    type: "action",
    label: "Wander",
    action: {
      type: "wander",
      radius: t?.wanderRadius ?? 4,
      speed: t?.speed ?? 2.2
    }
  };
}
function ro(e) {
  return e.label ? e.label : e.type === "start" ? "Start" : e.type === "condition" ? `Condition: ${e.condition.type}` : `Action: ${e.action.type}`;
}
function Rw(e) {
  return e.type === "start" ? "블루프린트 실행 시작점" : e.type === "condition" ? e.condition.type === "questStatus" ? `quest ${e.condition.questId} is ${e.condition.status}` : e.condition.type === "friendshipAtLeast" ? `friendship >= ${e.condition.score}` : e.condition.type : e.action.type === "moveToTarget" ? `moveTo ${e.action.target.type}` : e.action.type === "speak" ? e.action.text : e.action.type === "playAnimation" ? e.action.animationId : e.action.type;
}
function ao(e, t) {
  const n = e.nodes[e.nodes.length - 1], i = n ? {
    id: `${n.id}-${t.id}`,
    source: n.id,
    target: t.id,
    branch: "next"
  } : void 0;
  return {
    ...e,
    nodes: [...e.nodes, t],
    edges: i ? [...e.edges, i] : e.edges
  };
}
function Qo(e, t, n) {
  if (t.type !== "condition") return ao(e, t);
  const i = ao(e, t), o = oo("wander", n), r = oo("speak", n), a = {
    ...o,
    label: o.label ?? "True Path"
  }, l = {
    ...r,
    label: r.label ?? "False Path"
  };
  return {
    ...i,
    nodes: [
      ...i.nodes,
      a,
      l
    ],
    edges: [
      ...i.edges,
      {
        id: `${t.id}-true-${a.id}`,
        source: t.id,
        target: a.id,
        branch: "true"
      },
      {
        id: `${t.id}-false-${l.id}`,
        source: t.id,
        target: l.id,
        branch: "false"
      }
    ]
  };
}
function Dw(e, t) {
  const n = e.nodes.find((i) => i.id === t);
  return !n || n.type === "start" ? e : {
    ...e,
    nodes: e.nodes.filter((i) => i.id !== t),
    edges: e.edges.filter((i) => i.source !== t && i.target !== t)
  };
}
function zw(e) {
  return {
    ...e,
    nodes: [{ id: "start", type: "start", label: "Start" }],
    edges: []
  };
}
function Fw(e, t) {
  return {
    ...e,
    id: `npc-custom-${t}-${Date.now()}`,
    name: `${e.name} Custom`,
    description: e.description ? `${e.description} Customized for ${t}.` : `Customized for ${t}.`,
    nodes: e.nodes.map((n) => ({ ...n })),
    edges: e.edges.map((n) => ({ ...n }))
  };
}
function Lw(e, t) {
  const n = new Map(e.nodes.map((o) => [o.id, o])), i = e.edges.filter((o) => o.source === t);
  return i.length === 0 ? "다음 없음" : i.map((o) => {
    const r = n.get(o.target);
    return `${o.branch ?? "next"} -> ${r ? ro(r) : o.target}`;
  }).join(" · ");
}
const $w = 240, Ow = 130, Hw = {
  borderRadius: 10,
  border: "1px solid #3b4258",
  padding: "8px 10px",
  color: "#e5e7eb",
  background: "#182033",
  minWidth: 140,
  textAlign: "center",
  fontSize: 12,
  fontWeight: 600
}, Gw = {
  start: { background: "#1b2f2a", borderColor: "#2f6d5b" },
  condition: { background: "#2d2435", borderColor: "#6b4f81" },
  action: { background: "#1f2b44", borderColor: "#4366a9" }
}, _c = {
  next: "#8b9bb4",
  true: "#34d399",
  false: "#f87171"
}, Ww = (e, t) => e.nodes.map((n, i) => {
  const o = i % 4, r = Math.floor(i / 4);
  return {
    id: n.id,
    position: { x: o * $w, y: r * Ow },
    data: { label: ro(n) },
    draggable: !0,
    style: {
      ...Hw,
      ...Gw[n.type],
      ...t === n.id ? { boxShadow: "0 0 0 2px #60a5fa" } : {}
    }
  };
}), Uw = (e, t) => e.edges.map((n) => {
  const i = n.branch ?? "next";
  return {
    id: n.id,
    source: n.source,
    target: n.target,
    label: i,
    animated: t === n.id,
    markerEnd: { type: bo.ArrowClosed, color: _c[i] },
    style: {
      stroke: _c[i],
      strokeWidth: t === n.id ? 2.5 : 1.6
    },
    labelStyle: { fill: "#d1d5db", fontSize: 11, fontWeight: 700 },
    labelBgStyle: { fill: "#111827", fillOpacity: 0.85 },
    labelBgPadding: [4, 2],
    labelBgBorderRadius: 4
  };
});
function jw({
  blueprint: e,
  selectedNodeId: t,
  selectedEdgeId: n,
  onSelectNode: i,
  onSelectEdge: o
}) {
  const r = ge.useMemo(
    () => Ww(e, t),
    [e, t]
  ), a = ge.useMemo(
    () => Uw(e, n),
    [e, n]
  ), [l, c, u] = iw(r), [d, f, p] = ow(a);
  ge.useEffect(() => {
    c((g) => r.map((_) => {
      const b = g.find((S) => S.id === _.id);
      return b ? { ..._, position: b.position } : _;
    }));
  }, [r, c]), ge.useEffect(() => {
    f(a);
  }, [a, f]);
  const h = ge.useCallback((g, _) => {
    i(_.id);
  }, [i]), w = ge.useCallback((g, _) => {
    o(_.id), i(_.source);
  }, [o, i]);
  return /* @__PURE__ */ x(
    nw,
    {
      nodes: l,
      edges: d,
      onNodesChange: u,
      onEdgesChange: p,
      onNodeClick: h,
      onEdgeClick: w,
      fitView: !0,
      fitViewOptions: { padding: 0.2 },
      minZoom: 0.2,
      maxZoom: 2,
      colorMode: "dark",
      proOptions: { hideAttribution: !0 },
      children: [
        /* @__PURE__ */ s(Ew, { zoomable: !0, pannable: !0, nodeColor: "#64748b" }),
        /* @__PURE__ */ s(gw, {}),
        /* @__PURE__ */ s(cw, { gap: 20, size: 1, color: "#334155" })
      ]
    }
  );
}
function me({ label: e, children: t }) {
  return /* @__PURE__ */ x("div", { className: "editor-field-row", children: [
    /* @__PURE__ */ s("span", { className: "editor-field-row__label", children: e }),
    /* @__PURE__ */ s("div", { className: "editor-field-row__control", children: t })
  ] });
}
function cs({ value: e, onChange: t }) {
  return /* @__PURE__ */ s(
    "button",
    {
      type: "button",
      className: `editor-field-toggle ${e ? "editor-field-toggle--on" : ""}`,
      onClick: () => t(!e),
      children: e ? "ON" : "OFF"
    }
  );
}
function xo({ value: e, onChange: t }) {
  return /* @__PURE__ */ x("div", { className: "editor-field-color", children: [
    /* @__PURE__ */ s("input", { type: "color", value: e, onChange: (n) => t(n.target.value) }),
    /* @__PURE__ */ s("span", { children: e })
  ] });
}
function Vw({ actions: e }) {
  return e.length === 0 ? null : /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "커스텀 액션" }),
    /* @__PURE__ */ s("div", { className: "building-panel__segmented", children: e.map((t) => /* @__PURE__ */ s(
      "button",
      {
        className: "building-panel__segment-btn",
        disabled: t.disabled,
        onClick: () => {
          t.onClick();
        },
        children: t.label
      },
      t.id
    )) })
  ] });
}
function Zw({
  showSnow: e,
  setShowSnow: t,
  showFog: n,
  setShowFog: i,
  fogColor: o,
  setFogColor: r,
  weatherEffect: a,
  setWeatherEffect: l
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "전역 환경" }),
    /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
      /* @__PURE__ */ s(me, { label: "눈", children: /* @__PURE__ */ s(cs, { value: e, onChange: t }) }),
      /* @__PURE__ */ s(me, { label: "안개", children: /* @__PURE__ */ s(cs, { value: n, onChange: i }) }),
      /* @__PURE__ */ s(me, { label: "안개색", children: /* @__PURE__ */ s(xo, { value: o, onChange: r }) }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { alignItems: "flex-start" }, children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "날씨" }),
        /* @__PURE__ */ s("div", { className: "building-panel__grid", style: { display: "flex" }, children: uu.map((c) => /* @__PURE__ */ s(
          "button",
          {
            className: `building-panel__grid-btn ${a === c.type ? "building-panel__grid-btn--active" : ""}`,
            onClick: () => l(c.type),
            children: c.labelKo
          },
          c.type
        )) })
      ] })
    ] })
  ] });
}
const Yw = [
  0,
  Math.PI / 4,
  Math.PI / 2,
  Math.PI * 0.75,
  Math.PI,
  Math.PI * 1.25,
  Math.PI * 1.5,
  Math.PI * 1.75
];
function Xw({
  currentObjectRotation: e,
  setObjectRotation: t
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "오브젝트 회전" }),
    /* @__PURE__ */ s("div", { className: "building-panel__grid", children: Yw.map((n, i) => /* @__PURE__ */ s(
      "button",
      {
        className: `building-panel__grid-btn ${Math.abs(e - n) < 0.01 ? "building-panel__grid-btn--active" : ""}`,
        onClick: () => t(n),
        children: i * 45
      },
      n
    )) })
  ] });
}
function Kw({
  isTileMode: e,
  currentTileMultiplier: t,
  setTileMultiplier: n,
  currentTileHeight: i,
  setTileHeight: o,
  snapToGrid: r,
  setSnapToGrid: a,
  currentTileShape: l,
  setTileShape: c,
  currentTileRotation: u,
  setTileRotation: d,
  rotations: f,
  selectedTileId: p,
  hasSelectedTileGroup: h,
  onDeleteSelectedTile: w
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "배치 설정" }),
    /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "크기" }),
        /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => n(Math.max(1, t - 1)),
              children: "-"
            }
          ),
          /* @__PURE__ */ s("span", { className: "building-panel__stepper-value", children: t }),
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => n(Math.min(4, t + 1)),
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "격자 맞춤" }),
        /* @__PURE__ */ s(
          "button",
          {
            className: `building-panel__toggle ${r ? "building-panel__toggle--on" : ""}`,
            onClick: () => a(!r),
            children: r ? "ON" : "OFF"
          }
        )
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "높이" }),
        /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => o(Math.max(0, i - 1)),
              children: "-"
            }
          ),
          /* @__PURE__ */ s("span", { className: "building-panel__stepper-value", children: i }),
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => o(Math.min(6, i + 1)),
              children: "+"
            }
          )
        ] })
      ] })
    ] }),
    e && /* @__PURE__ */ x(be, { children: [
      /* @__PURE__ */ s("div", { className: "building-panel__section-subtitle", children: "타일 형태" }),
      /* @__PURE__ */ s("div", { className: "building-panel__grid", children: Va.map((g) => /* @__PURE__ */ s(
        "button",
        {
          className: `building-panel__grid-btn ${l === g.type ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => c(g.type),
          children: g.labelKo
        },
        g.type
      )) }),
      /* @__PURE__ */ s("div", { className: "building-panel__section-subtitle", children: "타일 회전" }),
      /* @__PURE__ */ s("div", { className: "building-panel__segmented", children: f.map((g) => /* @__PURE__ */ s(
        "button",
        {
          className: `building-panel__segment-btn ${Math.abs(u - g.value) < 1e-4 ? "building-panel__segment-btn--active" : ""}`,
          onClick: () => d(g.value),
          children: g.label
        },
        g.value
      )) }),
      /* @__PURE__ */ x("div", { className: "building-panel__delete-card", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("strong", { children: "선택한 타일" }),
          /* @__PURE__ */ s("span", { children: p ? `ID: ${p}` : "타일 하이라이트를 클릭해 선택하세요" })
        ] }),
        /* @__PURE__ */ s(
          "button",
          {
            className: "building-panel__delete-button",
            disabled: !p || !h,
            onClick: w,
            children: "선택 타일 삭제"
          }
        )
      ] })
    ] })
  ] });
}
function qw({
  currentTileMultiplier: e,
  currentTileHeight: t,
  selectedBlockId: n,
  onDeleteSelectedBlock: i
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "박스 편집" }),
    /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "박스 크기" }),
        /* @__PURE__ */ x("span", { className: "building-panel__info-value", children: [
          e,
          " x ",
          e
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "쌓기 높이" }),
        /* @__PURE__ */ s("span", { className: "building-panel__info-value", children: t })
      ] })
    ] }),
    /* @__PURE__ */ x("div", { className: "building-panel__delete-card", children: [
      /* @__PURE__ */ x("div", { children: [
        /* @__PURE__ */ s("strong", { children: "선택한 박스" }),
        /* @__PURE__ */ s("span", { children: n ? `ID: ${n}` : "박스 하이라이트를 클릭해 선택하세요" })
      ] }),
      /* @__PURE__ */ s(
        "button",
        {
          className: "building-panel__delete-button",
          disabled: !n,
          onClick: i,
          children: "선택 박스 삭제"
        }
      )
    ] })
  ] });
}
function Qw({
  currentWallKind: e,
  currentWallKindLabel: t,
  setWallKind: n,
  currentWallRotation: i,
  setWallRotation: o,
  rotations: r,
  selectedWallId: a,
  hasSelectedWallGroup: l,
  onFlipSelectedWall: c,
  onDeleteSelectedWall: u
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "벽 모듈 / 회전 / 삭제" }),
    /* @__PURE__ */ x("div", { className: "building-panel__section-subtitle", children: [
      "벽 모듈: ",
      t
    ] }),
    /* @__PURE__ */ s("div", { className: "building-panel__grid", children: Ss.map((d) => /* @__PURE__ */ s(
      "button",
      {
        className: `building-panel__grid-btn ${e === d.type ? "building-panel__grid-btn--active" : ""}`,
        onClick: () => n(d.type),
        children: d.labelKo
      },
      d.type
    )) }),
    /* @__PURE__ */ s("div", { className: "building-panel__segmented", children: r.map((d) => /* @__PURE__ */ s(
      "button",
      {
        className: `building-panel__segment-btn ${Math.abs(i - d.value) < 1e-4 ? "building-panel__segment-btn--active" : ""}`,
        onClick: () => o(d.value),
        children: d.label
      },
      d.value
    )) }),
    /* @__PURE__ */ x("div", { className: "building-panel__delete-card", children: [
      /* @__PURE__ */ x("div", { children: [
        /* @__PURE__ */ s("strong", { children: "선택한 벽" }),
        /* @__PURE__ */ s("span", { children: a ? `ID: ${a}` : "벽 마커를 클릭해 선택하세요" })
      ] }),
      /* @__PURE__ */ s(
        "button",
        {
          className: "building-panel__delete-button",
          disabled: !a || !l,
          onClick: c,
          children: "내외부 뒤집기"
        }
      ),
      /* @__PURE__ */ s(
        "button",
        {
          className: "building-panel__delete-button",
          disabled: !a || !l,
          onClick: u,
          children: "선택 벽 삭제"
        }
      )
    ] })
  ] });
}
const Jw = ["idle", "patrol", "wander"];
function Sc({
  instance: e,
  hoverPosition: t,
  updateBehavior: n,
  setNavigation: i,
  clearNavigation: o
}) {
  const r = e.behavior?.speed ?? 2.2, a = e.behavior?.wanderRadius ?? 4, l = e.behavior?.waypoints ?? [], c = t ? `${t.x.toFixed(1)}, ${t.z.toFixed(1)}` : "없음";
  return /* @__PURE__ */ x("div", { className: "building-panel__npc-card", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "이동 설정" }),
    /* @__PURE__ */ s("div", { className: "building-panel__section-subtitle", children: "행동 모드" }),
    /* @__PURE__ */ s("div", { className: "building-panel__segmented", children: Jw.map((u) => /* @__PURE__ */ s(
      "button",
      {
        className: `building-panel__segment-btn ${e.behavior?.mode === u ? "building-panel__segment-btn--active" : ""}`,
        onClick: () => {
          n(e.id, { mode: u, speed: r }), u === "idle" && o(e.id);
        },
        children: u
      },
      u
    )) }),
    /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "이동 속도" }),
        /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => n(e.id, { speed: Math.max(0.4, r - 0.4) }),
              children: "-"
            }
          ),
          /* @__PURE__ */ s("span", { className: "building-panel__stepper-value", children: r.toFixed(1) }),
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => n(e.id, { speed: Math.min(7, r + 0.4) }),
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "배회 반경" }),
        /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => n(e.id, { wanderRadius: Math.max(1, a - 1) }),
              children: "-"
            }
          ),
          /* @__PURE__ */ x("span", { className: "building-panel__stepper-value", children: [
            a,
            "m"
          ] }),
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => n(e.id, { wanderRadius: Math.min(30, a + 1) }),
              children: "+"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ s("div", { className: "building-panel__section-subtitle", children: "웨이포인트" }),
    /* @__PURE__ */ x("div", { className: "building-panel__asset-targets", children: [
      /* @__PURE__ */ x("span", { children: [
        l.length,
        "개 지정됨"
      ] }),
      /* @__PURE__ */ x("span", { children: [
        "호버 위치: ",
        c
      ] })
    ] }),
    /* @__PURE__ */ x("div", { className: "building-panel__segmented", children: [
      /* @__PURE__ */ s(
        "button",
        {
          className: "building-panel__segment-btn",
          disabled: !t,
          onClick: () => {
            if (!t) return;
            const u = [t.x, t.y, t.z], d = [...l, u];
            n(e.id, {
              mode: "patrol",
              waypoints: d
            }), i(e.id, d, r);
          },
          children: "호버 위치 추가"
        }
      ),
      /* @__PURE__ */ s(
        "button",
        {
          className: "building-panel__segment-btn",
          disabled: l.length === 0,
          onClick: () => {
            l.length !== 0 && (n(e.id, { mode: "patrol", waypoints: l }), i(e.id, l, r));
          },
          children: "순찰 시작"
        }
      ),
      /* @__PURE__ */ s(
        "button",
        {
          className: "building-panel__segment-btn",
          onClick: () => {
            n(e.id, { waypoints: [] }), o(e.id);
          },
          children: "경로 초기화"
        }
      ),
      /* @__PURE__ */ s(
        "button",
        {
          className: "building-panel__segment-btn",
          disabled: !t,
          onClick: () => {
            if (!t) return;
            const u = [t.x, t.y, t.z];
            n(e.id, { mode: "idle" }), i(e.id, [u], r);
          },
          children: "호버 위치로 1회 이동"
        }
      )
    ] })
  ] });
}
function Mc({
  instance: e,
  animations: t,
  updateInstance: n,
  updateBehavior: i
}) {
  const o = (r) => {
    n(e.id, { currentAnimation: r }), i(e.id, {
      mode: "idle",
      idleAnimation: r,
      arriveAnimation: r
    });
  };
  return /* @__PURE__ */ x("div", { className: "building-panel__npc-card", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "애니메이션 설정" }),
    /* @__PURE__ */ s("div", { className: "building-panel__section-subtitle", children: "애니메이션" }),
    /* @__PURE__ */ s("div", { className: "building-panel__grid", children: t.map((r) => /* @__PURE__ */ s(
      "button",
      {
        className: `building-panel__grid-btn ${e.currentAnimation === r.id ? "building-panel__grid-btn--active" : ""}`,
        onClick: () => o(r.id),
        children: r.name
      },
      r.id
    )) }),
    /* @__PURE__ */ s("div", { className: "building-panel__segmented", children: t.map((r) => /* @__PURE__ */ x(
      "button",
      {
        className: `building-panel__segment-btn ${e.behavior?.moveAnimation === r.id ? "building-panel__segment-btn--active" : ""}`,
        onClick: () => i(e.id, { moveAnimation: r.id }),
        children: [
          "이동:",
          r.name
        ]
      },
      `move-${r.id}`
    )) }),
    /* @__PURE__ */ s("div", { className: "building-panel__segmented", children: t.map((r) => /* @__PURE__ */ x(
      "button",
      {
        className: `building-panel__segment-btn ${e.behavior?.idleAnimation === r.id ? "building-panel__segment-btn--active" : ""}`,
        onClick: () => i(e.id, { idleAnimation: r.id, arriveAnimation: r.id }),
        children: [
          "대기:",
          r.name
        ]
      },
      `idle-${r.id}`
    )) })
  ] });
}
const e1 = ["none", "scripted", "llm", "reinforcement"], t1 = ["locked", "available", "active", "completed", "failed"], n1 = [
  "always",
  "navigationIdle",
  "perceivedAny",
  "questStatus",
  "friendshipAtLeast",
  "memoryEquals"
], i1 = [
  "idle",
  "moveTo",
  "patrol",
  "wander",
  "playAnimation",
  "lookAt",
  "speak",
  "interact",
  "remember",
  "moveToTarget"
];
function o1({
  instance: e,
  blueprints: t,
  selectedBlueprint: n,
  updateBrain: i,
  addBrainBlueprint: o,
  updateBrainBlueprint: r,
  onPreviewStateChange: a
}) {
  const l = ge.useRef(null), [c, u] = ge.useState(null), [d, f] = ge.useState(null), [p, h] = ge.useState(""), [w, g] = ge.useState(!0), [_, b] = ge.useState("nodes"), [S, m] = ge.useState(!1);
  ge.useEffect(() => {
    const A = l.current;
    A && m(!!A.closest(".editor-panel-modal"));
  }, [n]), ge.useEffect(() => {
    S && (w || g(!0));
  }, [S, w]), ge.useEffect(() => {
    if (!n) {
      u(null), g(!0), b("nodes");
      return;
    }
    if (c ? n.nodes.some((W) => W.id === c && W.type !== "start") : !1) return;
    const N = n.nodes.find((W) => W.type !== "start");
    u(N?.id ?? null);
  }, [n, c]);
  const y = (A) => {
    if (!n || !c) return;
    const N = n.nodes.map((W) => W.id !== c || W.type === "start" ? W : A(W));
    r(n.id, {
      ...n,
      nodes: N
    });
  }, v = n?.nodes.find(
    (A) => A.id === c && A.type !== "start"
  );
  ge.useEffect(() => {
    const A = e.behavior;
    let N = {
      mode: "idle",
      label: "대기"
    };
    if (v?.type === "action")
      switch (v.action.type) {
        case "moveTo":
          N = {
            mode: "move",
            label: "moveTo",
            target: v.action.target,
            ...v.action.animationId ? { animationId: v.action.animationId } : {}
          };
          break;
        case "patrol":
          N = {
            mode: "patrol",
            label: "patrol",
            waypoints: v.action.waypoints,
            ...v.action.animationId ? { animationId: v.action.animationId } : {}
          };
          break;
        case "wander":
          N = {
            mode: "wander",
            label: "wander",
            ...v.action.radius ? { radius: v.action.radius } : {}
          };
          break;
        case "moveToTarget":
          N = v.action.target.type === "point" ? {
            mode: "move",
            label: "moveToTarget(point)",
            target: v.action.target.value,
            ...v.action.animationId ? { animationId: v.action.animationId } : {}
          } : {
            mode: "action",
            label: `moveToTarget(${v.action.target.type})`,
            ...v.action.animationId ? { animationId: v.action.animationId } : {}
          };
          break;
        case "playAnimation":
          N = {
            mode: "action",
            label: "playAnimation",
            animationId: v.action.animationId
          };
          break;
        case "speak":
          N = {
            mode: "action",
            label: `speak: ${v.action.text}`
          };
          break;
        default:
          N = {
            mode: "action",
            label: v.action.type
          };
      }
    else A?.mode === "patrol" && A.waypoints && A.waypoints.length > 0 ? N = {
      mode: "patrol",
      label: "patrol(behavior)",
      waypoints: A.waypoints
    } : A?.mode === "wander" && (N = {
      mode: "wander",
      label: "wander(behavior)",
      radius: A.wanderRadius ?? 4
    });
    a?.(N);
  }, [e.behavior, a, v]);
  const C = n?.nodes.find((A) => A.type === "start") ?? null, T = ge.useMemo(
    () => new Set((n?.nodes ?? []).map((A) => A.id)),
    [n]
  ), P = ge.useMemo(
    () => (n?.edges ?? []).filter(
      (A) => !T.has(A.source) || !T.has(A.target)
    ),
    [T, n]
  ), D = ge.useMemo(() => {
    if (!n) return /* @__PURE__ */ new Set();
    const A = /* @__PURE__ */ new Map();
    for (const Q of n.edges) {
      if (!T.has(Q.source) || !T.has(Q.target)) continue;
      const ne = A.get(Q.source) ?? [];
      ne.push(Q.target), A.set(Q.source, ne);
    }
    const N = /* @__PURE__ */ new Set(), K = n.nodes.filter((Q) => Q.type === "start").map((Q) => Q.id);
    for (; K.length > 0; ) {
      const Q = K.shift();
      if (!Q || N.has(Q)) continue;
      N.add(Q);
      const ne = A.get(Q) ?? [];
      for (const re of ne)
        N.has(re) || K.push(re);
    }
    return N;
  }, [T, n]), O = ge.useMemo(
    () => new Set(
      (n?.nodes ?? []).filter((A) => A.type !== "start" && !D.has(A.id)).map((A) => A.id)
    ),
    [D, n]
  ), z = ge.useMemo(() => {
    const A = /* @__PURE__ */ new Map();
    if (!n) return A;
    for (const N of n.nodes) {
      if (N.type !== "condition") continue;
      const K = n.edges.filter((ne) => ne.source === N.id).map((ne) => ne.branch ?? "next"), Q = [];
      K.includes("true") || Q.push("true branch 누락"), K.includes("false") || Q.push("false branch 누락"), K.includes("next") && Q.push("condition에는 next 대신 true/false를 권장"), Q.length > 0 && A.set(N.id, Q);
    }
    return A;
  }, [n]), E = n?.nodes.filter((A) => A.type !== "start") ?? [], G = ge.useMemo(
    () => n?.edges.filter((A) => A.source === c) ?? [],
    [n, c]
  ), I = G.find((A) => A.id === d) ?? G[0] ?? null, $ = n?.nodes.find((A) => A.id === I?.target);
  ge.useEffect(() => {
    if (G.length === 0) {
      f(null);
      return;
    }
    (!d || !G.some((A) => A.id === d)) && f(G[0]?.id ?? null);
  }, [d, G]), ge.useEffect(() => {
    !n || P.length === 0 || (r(n.id, {
      ...n,
      edges: n.edges.filter(
        (A) => T.has(A.source) && T.has(A.target)
      )
    }), h(`유효하지 않은 edge ${P.length}개를 자동 정리했습니다.`));
  }, [T, P, n, r]);
  const R = (A, N, W, K = n?.edges ?? []) => A === N ? "self-loop는 허용하지 않습니다." : K.some(
    (ne) => ne.id !== W && ne.source === A && ne.target === N
  ) ? "동일 source/target edge가 이미 있습니다." : null, L = (A) => {
    if (!n || !I) return;
    const N = [];
    for (const W of n.edges) {
      if (W.id !== I.id) {
        N.push(W);
        continue;
      }
      const K = A(W), Q = R(K.source, K.target, W.id);
      Q ? (h(Q), N.push(W)) : (h(""), N.push(K));
    }
    r(n.id, {
      ...n,
      edges: N
    });
  }, M = (A) => {
    if (!n || !C) return;
    const N = {
      id: `${C.id}-${A}-${Date.now()}`,
      source: C.id,
      target: A,
      branch: "next"
    }, W = R(N.source, N.target);
    if (W) {
      h(W);
      return;
    }
    r(n.id, {
      ...n,
      edges: [...n.edges, N]
    }), h(`orphan 노드 ${A}를 start에 연결했습니다.`);
  }, F = () => {
    if (!n || !C || O.size === 0) return;
    let A = 0;
    const N = [...n.edges];
    for (const W of O)
      R(
        C.id,
        W,
        void 0,
        N
      ) || (N.push({
        id: `${C.id}-${W}-${Date.now()}-${A}`,
        source: C.id,
        target: W,
        branch: "next"
      }), A += 1);
    if (A === 0) {
      h("복구 가능한 orphan 노드가 없습니다.");
      return;
    }
    r(n.id, {
      ...n,
      edges: N
    }), h(`orphan 노드 ${A}개를 start에 연결했습니다.`);
  }, U = () => {
    if (!n || !c) return;
    const A = E.find(
      (K) => K.id !== c && !n.edges.some((Q) => Q.source === c && Q.target === K.id)
    );
    if (!A) return;
    const N = {
      id: `${c}-${A.id}-${Date.now()}`,
      source: c,
      target: A.id,
      branch: "next"
    }, W = R(N.source, N.target);
    if (W) {
      h(W);
      return;
    }
    r(n.id, {
      ...n,
      edges: [...n.edges, N]
    }), h(""), f(N.id);
  }, V = () => {
    !n || !I || (r(n.id, {
      ...n,
      edges: n.edges.filter((A) => A.id !== I.id)
    }), h(""), f(null));
  }, Y = (A, N) => {
    if (!n) return;
    const W = n.nodes.find((se) => se.id === A);
    if (!W || W.type !== "condition" || n.edges.some(
      (se) => se.source === A && (se.branch ?? "next") === N
    )) return;
    const Q = [...n.edges], ne = E.find(
      (se) => se.id !== A && !Q.some((te) => te.source === A && te.target === se.id)
    );
    if (!ne) {
      h(`branch ${N}를 추가할 타겟 노드를 찾을 수 없습니다.`);
      return;
    }
    const re = R(
      A,
      ne.id,
      void 0,
      Q
    );
    if (re) {
      h(re);
      return;
    }
    const ae = {
      id: `${A}-${N}-${ne.id}-${Date.now()}`,
      source: A,
      target: ne.id,
      branch: N
    };
    r(n.id, {
      ...n,
      edges: [...Q, ae]
    }), f(ae.id), h(`condition ${A}에 ${N} branch를 추가했습니다.`);
  }, Z = (A) => {
    if (!n) return;
    const N = z.get(A) ?? [], W = N.some((ae) => ae.startsWith("true branch")), K = N.some((ae) => ae.startsWith("false branch"));
    if (!W && !K) return;
    const Q = [...n.edges], ne = [
      ...W ? ["true"] : [],
      ...K ? ["false"] : []
    ];
    let re = 0;
    for (const ae of ne) {
      if (Q.some(
        (ye) => ye.source === A && (ye.branch ?? "next") === ae
      )) continue;
      const te = E.find(
        (ye) => ye.id !== A && !Q.some((_e) => _e.source === A && _e.target === ye.id)
      );
      !te || R(
        A,
        te.id,
        void 0,
        Q
      ) || (Q.push({
        id: `${A}-${ae}-${te.id}-${Date.now()}-${re}`,
        source: A,
        target: te.id,
        branch: ae
      }), re += 1);
    }
    if (re === 0) {
      h("자동 보완할 분기를 찾지 못했습니다.");
      return;
    }
    r(n.id, {
      ...n,
      edges: Q
    }), h(`누락 분기 ${re}개를 자동 보완했습니다.`);
  }, J = (A, N) => {
    const W = Number(A);
    return Number.isFinite(W) ? W : N;
  }, q = (A, N, W) => {
    const K = [...A];
    return K[N] = J(W, A[N]), K;
  };
  return /* @__PURE__ */ x("div", { className: "building-panel__npc-card building-panel__npc-card--brain", children: [
    /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
      /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "AI 두뇌" }),
      /* @__PURE__ */ s("div", { className: "building-panel__segmented", children: e1.map((A) => /* @__PURE__ */ s(
        "button",
        {
          className: `building-panel__segment-btn ${e.brain?.mode === A ? "building-panel__segment-btn--active" : ""}`,
          onClick: () => i(e.id, { mode: A }),
          children: A
        },
        A
      )) })
    ] }),
    /* @__PURE__ */ s("div", { className: "building-panel__section-subtitle", children: "행동 블루프린트" }),
    /* @__PURE__ */ x("div", { className: "building-panel__grid", children: [
      /* @__PURE__ */ s(
        "button",
        {
          className: `building-panel__grid-btn ${e.brain?.blueprintId ? "" : "building-panel__grid-btn--active"}`,
          onClick: () => i(e.id, { blueprintId: "" }),
          children: "없음"
        }
      ),
      t.map((A) => /* @__PURE__ */ s(
        "button",
        {
          className: `building-panel__grid-btn ${e.brain?.blueprintId === A.id ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => i(e.id, {
            mode: "scripted",
            blueprintId: A.id
          }),
          title: A.description,
          children: A.name
        },
        A.id
      ))
    ] }),
    n && /* @__PURE__ */ s(be, { children: /* @__PURE__ */ x(
      "div",
      {
        ref: l,
        className: "building-panel__node-editor",
        children: [
          /* @__PURE__ */ x("div", { className: "building-panel__asset-targets building-panel__brain-summary", children: [
            /* @__PURE__ */ s("span", { children: n.name }),
            /* @__PURE__ */ x("span", { children: [
              n.nodes.length,
              " nodes · ",
              n.edges.length,
              " edges"
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-panel__segmented building-panel__brain-toolbar", children: [
            /* @__PURE__ */ s(
              "button",
              {
                className: "building-panel__segment-btn",
                onClick: () => {
                  const A = Fw(n, e.id);
                  o(A), i(e.id, {
                    mode: "scripted",
                    blueprintId: A.id
                  });
                },
                children: "전용 복제본"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                className: "building-panel__segment-btn",
                onClick: () => r(n.id, zw(n)),
                children: "초기화"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                className: "building-panel__segment-btn",
                onClick: () => g((A) => !A),
                children: w ? "캔버스 숨기기" : "캔버스 보기"
              }
            )
          ] }),
          w && /* @__PURE__ */ s(
            "div",
            {
              className: "building-panel__brain-canvas",
              style: {
                height: S ? "64vh" : "320px",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "8px",
                background: "#0f172a"
              },
              children: /* @__PURE__ */ s(
                jw,
                {
                  blueprint: n,
                  selectedNodeId: c,
                  selectedEdgeId: d,
                  onSelectNode: u,
                  onSelectEdge: f
                }
              )
            }
          ),
          /* @__PURE__ */ x("div", { className: "building-panel__brain-tabs", children: [
            /* @__PURE__ */ s(
              "button",
              {
                type: "button",
                className: `building-panel__brain-tab ${_ === "nodes" ? "building-panel__brain-tab--active" : ""}`,
                onClick: () => b("nodes"),
                children: "노드 목록"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                type: "button",
                className: `building-panel__brain-tab ${_ === "inspector" ? "building-panel__brain-tab--active" : ""}`,
                onClick: () => b("inspector"),
                children: "노드 인스펙터"
              }
            )
          ] }),
          _ === "nodes" && /* @__PURE__ */ s("div", { className: "building-panel__node-list", children: n.nodes.map((A) => /* @__PURE__ */ x(
            "div",
            {
              className: "building-panel__node-card",
              style: A.id === c ? { borderColor: "#6dd3ff", boxShadow: "0 0 0 1px #6dd3ff" } : O.has(A.id) ? { borderColor: "#f59e0b", boxShadow: "0 0 0 1px #f59e0b" } : void 0,
              onClick: () => {
                A.type !== "start" && (u(A.id), b("inspector"));
              },
              children: [
                /* @__PURE__ */ x("div", { className: "building-panel__node-card-header", children: [
                  /* @__PURE__ */ s("div", { className: "building-panel__node-card-title", children: ro(A) }),
                  A.type !== "start" && /* @__PURE__ */ s(
                    "button",
                    {
                      className: "building-panel__node-card-action",
                      onClick: () => r(
                        n.id,
                        Dw(n, A.id)
                      ),
                      children: "삭제"
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { className: "building-panel__node-card-desc", children: Rw(A) }),
                /* @__PURE__ */ s("div", { className: "building-panel__node-card-edge", children: Lw(n, A.id) }),
                O.has(A.id) && /* @__PURE__ */ x("div", { className: "building-panel__node-card-edge", style: { display: "flex", justifyContent: "space-between", gap: "8px" }, children: [
                  /* @__PURE__ */ s("span", { children: "도달 불가(orphan) 노드" }),
                  /* @__PURE__ */ s(
                    "button",
                    {
                      className: "building-panel__node-card-action",
                      onClick: (N) => {
                        N.stopPropagation(), M(A.id);
                      },
                      disabled: !C,
                      children: "start 연결"
                    }
                  )
                ] }),
                z.has(A.id) && /* @__PURE__ */ s("div", { className: "building-panel__node-card-edge", style: { color: "#f59e0b" }, children: z.get(A.id)?.join(" · ") })
              ]
            },
            A.id
          )) }),
          _ === "inspector" && v && /* @__PURE__ */ x("div", { className: "building-panel__info building-panel__brain-inspector", style: { marginTop: "8px" }, children: [
            /* @__PURE__ */ s("div", { className: "building-panel__section-subtitle", children: "노드 인스펙터" }),
            /* @__PURE__ */ s(me, { label: "라벨", children: /* @__PURE__ */ s(
              "input",
              {
                value: v.label ?? "",
                onChange: (A) => y((N) => ({ ...N, label: A.target.value })),
                style: { width: "100%" }
              }
            ) }),
            /* @__PURE__ */ s(me, { label: "Outgoing Edge", children: /* @__PURE__ */ x(
              "select",
              {
                value: I?.id ?? "",
                onChange: (A) => f(A.target.value || null),
                style: { width: "100%" },
                disabled: G.length === 0,
                children: [
                  G.length === 0 && /* @__PURE__ */ s("option", { value: "", children: "다음 없음" }),
                  G.map((A) => /* @__PURE__ */ x("option", { value: A.id, children: [
                    A.branch ?? "next",
                    " -> ",
                    n?.nodes.find((N) => N.id === A.target)?.label ?? A.target
                  ] }, A.id))
                ]
              }
            ) }),
            /* @__PURE__ */ x("div", { className: "building-panel__segmented", children: [
              /* @__PURE__ */ s(
                "button",
                {
                  className: "building-panel__segment-btn",
                  onClick: U,
                  disabled: !v || E.length <= 1 || !E.some(
                    (A) => A.id !== v.id && !n.edges.some((N) => N.source === v.id && N.target === A.id)
                  ),
                  children: "엣지 추가"
                }
              ),
              /* @__PURE__ */ s(
                "button",
                {
                  className: "building-panel__segment-btn",
                  onClick: V,
                  disabled: !I,
                  children: "엣지 삭제"
                }
              )
            ] }),
            (P.length > 0 || O.size > 0) && /* @__PURE__ */ s(me, { label: "그래프 상태", children: /* @__PURE__ */ x("span", { children: [
              "dangling edge ",
              P.length,
              " · orphan node ",
              O.size
            ] }) }),
            O.size > 0 && /* @__PURE__ */ x("div", { className: "building-panel__segmented", children: [
              /* @__PURE__ */ s(
                "button",
                {
                  className: "building-panel__segment-btn",
                  onClick: F,
                  disabled: !C,
                  children: "orphan 전체 복구"
                }
              ),
              /* @__PURE__ */ s(
                "button",
                {
                  className: "building-panel__segment-btn",
                  onClick: () => {
                    !v || !O.has(v.id) || M(v.id);
                  },
                  disabled: !v || !O.has(v.id) || !C,
                  children: "선택 노드 복구"
                }
              )
            ] }),
            p && /* @__PURE__ */ s(me, { label: "그래프 규칙", children: /* @__PURE__ */ s("span", { children: p }) }),
            I && /* @__PURE__ */ x(be, { children: [
              /* @__PURE__ */ s(me, { label: "Source", children: /* @__PURE__ */ s(
                "select",
                {
                  value: I.source,
                  onChange: (A) => L((N) => ({
                    ...N,
                    source: A.target.value
                  })),
                  style: { width: "100%" },
                  children: E.map((A) => /* @__PURE__ */ s("option", { value: A.id, children: ro(A) }, A.id))
                }
              ) }),
              /* @__PURE__ */ s(me, { label: "Branch", children: /* @__PURE__ */ x(
                "select",
                {
                  value: I.branch ?? "next",
                  onChange: (A) => L((N) => ({
                    ...N,
                    branch: A.target.value
                  })),
                  style: { width: "100%" },
                  children: [
                    /* @__PURE__ */ s("option", { value: "next", children: "next" }),
                    /* @__PURE__ */ s("option", { value: "true", children: "true" }),
                    /* @__PURE__ */ s("option", { value: "false", children: "false" })
                  ]
                }
              ) }),
              /* @__PURE__ */ s(me, { label: "Target", children: /* @__PURE__ */ s(
                "select",
                {
                  value: I.target,
                  onChange: (A) => L((N) => ({
                    ...N,
                    target: A.target.value
                  })),
                  style: { width: "100%" },
                  children: E.map((A) => /* @__PURE__ */ s("option", { value: A.id, children: ro(A) }, A.id))
                }
              ) }),
              !$ && /* @__PURE__ */ s(me, { label: "주의", children: /* @__PURE__ */ s("span", { children: "타겟 노드를 찾을 수 없습니다." }) })
            ] }),
            v.type === "condition" && z.has(v.id) && /* @__PURE__ */ x(be, { children: [
              /* @__PURE__ */ s(me, { label: "Branch 검증", children: /* @__PURE__ */ s("span", { children: z.get(v.id)?.join(" · ") }) }),
              /* @__PURE__ */ x("div", { className: "building-panel__segmented", children: [
                /* @__PURE__ */ s(
                  "button",
                  {
                    className: "building-panel__segment-btn",
                    onClick: () => Y(v.id, "true"),
                    disabled: G.some((A) => (A.branch ?? "next") === "true"),
                    children: "true 분기 추가"
                  }
                ),
                /* @__PURE__ */ s(
                  "button",
                  {
                    className: "building-panel__segment-btn",
                    onClick: () => Y(v.id, "false"),
                    disabled: G.some((A) => (A.branch ?? "next") === "false"),
                    children: "false 분기 추가"
                  }
                ),
                /* @__PURE__ */ s(
                  "button",
                  {
                    className: "building-panel__segment-btn",
                    onClick: () => Z(v.id),
                    children: "누락 분기 자동 보완"
                  }
                )
              ] })
            ] }),
            v.type === "condition" && /* @__PURE__ */ x(be, { children: [
              /* @__PURE__ */ s(me, { label: "조건 타입", children: /* @__PURE__ */ s(
                "select",
                {
                  value: v.condition.type,
                  onChange: (A) => {
                    const N = A.target.value;
                    y((W) => {
                      if (W.type !== "condition") return W;
                      switch (N) {
                        case "always":
                          return { ...W, condition: { type: "always" } };
                        case "navigationIdle":
                          return { ...W, condition: { type: "navigationIdle" } };
                        case "perceivedAny":
                          return { ...W, condition: { type: "perceivedAny" } };
                        case "questStatus":
                          return { ...W, condition: { type: "questStatus", questId: "welcome", status: "active" } };
                        case "friendshipAtLeast":
                          return { ...W, condition: { type: "friendshipAtLeast", score: 150 } };
                        case "memoryEquals":
                          return { ...W, condition: { type: "memoryEquals", key: "memory.key", value: !0 } };
                        default:
                          return W;
                      }
                    });
                  },
                  children: n1.map((A) => /* @__PURE__ */ s("option", { value: A, children: A }, A))
                }
              ) }),
              v.condition.type === "questStatus" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "Quest ID", children: /* @__PURE__ */ s(
                  "input",
                  {
                    value: v.condition.questId,
                    onChange: (A) => y((N) => N.type !== "condition" || N.condition.type !== "questStatus" ? N : { ...N, condition: { ...N.condition, questId: A.target.value } }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Status", children: /* @__PURE__ */ s(
                  "select",
                  {
                    value: v.condition.status,
                    onChange: (A) => y((N) => N.type !== "condition" || N.condition.type !== "questStatus" ? N : {
                      ...N,
                      condition: {
                        ...N.condition,
                        status: A.target.value
                      }
                    }),
                    children: t1.map((A) => /* @__PURE__ */ s("option", { value: A, children: A }, A))
                  }
                ) })
              ] }),
              v.condition.type === "friendshipAtLeast" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "NPC ID(optional)", children: /* @__PURE__ */ s(
                  "input",
                  {
                    value: v.condition.npcId ?? "",
                    onChange: (A) => y((N) => {
                      if (N.type !== "condition" || N.condition.type !== "friendshipAtLeast") return N;
                      const W = A.target.value.trim();
                      return {
                        ...N,
                        condition: {
                          ...N.condition,
                          ...W ? { npcId: W } : {}
                        }
                      };
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Score", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.condition.score,
                    onChange: (A) => y((N) => {
                      if (N.type !== "condition" || N.condition.type !== "friendshipAtLeast") return N;
                      const W = Number(A.target.value);
                      return {
                        ...N,
                        condition: {
                          ...N.condition,
                          score: Number.isFinite(W) ? W : N.condition.score
                        }
                      };
                    }),
                    style: { width: "100%" }
                  }
                ) })
              ] })
            ] }),
            v.type === "action" && /* @__PURE__ */ x(be, { children: [
              /* @__PURE__ */ s(me, { label: "액션 타입", children: /* @__PURE__ */ s(
                "select",
                {
                  value: v.action.type,
                  onChange: (A) => {
                    const N = A.target.value;
                    y((W) => {
                      if (W.type !== "action") return W;
                      switch (N) {
                        case "idle":
                          return { ...W, action: { type: "idle", animationId: "idle" } };
                        case "moveTo":
                          return { ...W, action: { type: "moveTo", target: [0, 0, 0], speed: 2.2, animationId: "walk" } };
                        case "patrol":
                          return {
                            ...W,
                            action: {
                              type: "patrol",
                              waypoints: [[0, 0, 0], [2, 0, 2]],
                              speed: 2.2,
                              loop: !0,
                              animationId: "walk"
                            }
                          };
                        case "wander":
                          return { ...W, action: { type: "wander", radius: 4, speed: 2.2, waitSeconds: 1.5 } };
                        case "playAnimation":
                          return { ...W, action: { type: "playAnimation", animationId: "wave", loop: !1, speed: 1 } };
                        case "lookAt":
                          return { ...W, action: { type: "lookAt", target: [0, 0, 0] } };
                        case "speak":
                          return { ...W, action: { type: "speak", text: "안녕?", duration: 2 } };
                        case "interact":
                          return { ...W, action: { type: "interact", targetId: "target.entity" } };
                        case "remember":
                          return { ...W, action: { type: "remember", key: "memory.key", value: !0 } };
                        case "moveToTarget":
                          return {
                            ...W,
                            action: {
                              type: "moveToTarget",
                              target: { type: "self" },
                              speed: 2.2,
                              animationId: "walk"
                            }
                          };
                        default:
                          return W;
                      }
                    });
                  },
                  children: i1.map((A) => /* @__PURE__ */ s("option", { value: A, children: A }, A))
                }
              ) }),
              v.action.type === "wander" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "반경", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.radius ?? 4,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "wander" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        radius: J(A.target.value, N.action.radius ?? 4)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "속도", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.speed ?? 2.2,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "wander" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        speed: J(A.target.value, N.action.speed ?? 2.2)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "대기(초)", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.waitSeconds ?? 1.5,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "wander" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        waitSeconds: J(A.target.value, N.action.waitSeconds ?? 1.5)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) })
              ] }),
              v.action.type === "speak" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "대사", children: /* @__PURE__ */ s(
                  "input",
                  {
                    value: v.action.text,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "speak" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        text: A.target.value
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "지속시간(초)", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.duration ?? 2,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "speak" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        duration: J(A.target.value, N.action.duration ?? 2)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) })
              ] }),
              v.action.type === "playAnimation" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "Animation ID", children: /* @__PURE__ */ s(
                  "input",
                  {
                    value: v.action.animationId,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "playAnimation" ? N : { ...N, action: { ...N.action, animationId: A.target.value } }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Loop", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "checkbox",
                    checked: v.action.loop ?? !1,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "playAnimation" ? N : { ...N, action: { ...N.action, loop: A.target.checked } })
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "재생속도", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.speed ?? 1,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "playAnimation" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        speed: J(A.target.value, N.action.speed ?? 1)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) })
              ] }),
              v.action.type === "moveToTarget" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "Target", children: /* @__PURE__ */ x(
                  "select",
                  {
                    value: v.action.target.type,
                    onChange: (A) => y((N) => {
                      if (N.type !== "action" || N.action.type !== "moveToTarget") return N;
                      const W = A.target.value;
                      return W === "point" ? { ...N, action: { ...N.action, target: { type: "point", value: [0, 0, 0] } } } : { ...N, action: { ...N.action, target: { type: W } } };
                    }),
                    children: [
                      /* @__PURE__ */ s("option", { value: "self", children: "self" }),
                      /* @__PURE__ */ s("option", { value: "nearestPerceived", children: "nearestPerceived" }),
                      /* @__PURE__ */ s("option", { value: "point", children: "point" })
                    ]
                  }
                ) }),
                v.action.target.type === "point" && /* @__PURE__ */ x(be, { children: [
                  /* @__PURE__ */ s(me, { label: "Point X", children: /* @__PURE__ */ s(
                    "input",
                    {
                      type: "number",
                      value: v.action.target.value[0],
                      onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "moveToTarget" || N.action.target.type !== "point" ? N : {
                        ...N,
                        action: {
                          ...N.action,
                          target: {
                            type: "point",
                            value: q(N.action.target.value, 0, A.target.value)
                          }
                        }
                      }),
                      style: { width: "100%" }
                    }
                  ) }),
                  /* @__PURE__ */ s(me, { label: "Point Y", children: /* @__PURE__ */ s(
                    "input",
                    {
                      type: "number",
                      value: v.action.target.value[1],
                      onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "moveToTarget" || N.action.target.type !== "point" ? N : {
                        ...N,
                        action: {
                          ...N.action,
                          target: {
                            type: "point",
                            value: q(N.action.target.value, 1, A.target.value)
                          }
                        }
                      }),
                      style: { width: "100%" }
                    }
                  ) }),
                  /* @__PURE__ */ s(me, { label: "Point Z", children: /* @__PURE__ */ s(
                    "input",
                    {
                      type: "number",
                      value: v.action.target.value[2],
                      onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "moveToTarget" || N.action.target.type !== "point" ? N : {
                        ...N,
                        action: {
                          ...N.action,
                          target: {
                            type: "point",
                            value: q(N.action.target.value, 2, A.target.value)
                          }
                        }
                      }),
                      style: { width: "100%" }
                    }
                  ) })
                ] }),
                /* @__PURE__ */ s(me, { label: "속도", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.speed ?? 2.2,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "moveToTarget" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        speed: J(A.target.value, N.action.speed ?? 2.2)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Animation ID", children: /* @__PURE__ */ s(
                  "input",
                  {
                    value: v.action.animationId ?? "",
                    onChange: (A) => y((N) => {
                      if (N.type !== "action" || N.action.type !== "moveToTarget") return N;
                      const W = A.target.value.trim(), K = { ...N.action };
                      return delete K.animationId, {
                        ...N,
                        action: {
                          ...K,
                          ...W ? { animationId: W } : {}
                        }
                      };
                    }),
                    style: { width: "100%" }
                  }
                ) })
              ] }),
              v.action.type === "idle" && /* @__PURE__ */ s(me, { label: "Animation ID", children: /* @__PURE__ */ s(
                "input",
                {
                  value: v.action.animationId ?? "",
                  onChange: (A) => y((N) => {
                    if (N.type !== "action" || N.action.type !== "idle") return N;
                    const W = A.target.value.trim(), K = { ...N.action };
                    return delete K.animationId, {
                      ...N,
                      action: {
                        ...K,
                        ...W ? { animationId: W } : {}
                      }
                    };
                  }),
                  style: { width: "100%" }
                }
              ) }),
              v.action.type === "interact" && /* @__PURE__ */ s(me, { label: "Target ID", children: /* @__PURE__ */ s(
                "input",
                {
                  value: v.action.targetId,
                  onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "interact" ? N : { ...N, action: { ...N.action, targetId: A.target.value } }),
                  style: { width: "100%" }
                }
              ) }),
              v.action.type === "remember" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "Memory Key", children: /* @__PURE__ */ s(
                  "input",
                  {
                    value: v.action.key,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "remember" ? N : { ...N, action: { ...N.action, key: A.target.value } }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Memory Value", children: /* @__PURE__ */ s(
                  "input",
                  {
                    value: String(v.action.value),
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "remember" ? N : { ...N, action: { ...N.action, value: A.target.value } }),
                    style: { width: "100%" }
                  }
                ) })
              ] }),
              v.action.type === "moveTo" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "Target X", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.target[0],
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "moveTo" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        target: q(N.action.target, 0, A.target.value)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Target Y", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.target[1],
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "moveTo" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        target: q(N.action.target, 1, A.target.value)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Target Z", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.target[2],
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "moveTo" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        target: q(N.action.target, 2, A.target.value)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "속도", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.speed ?? 2.2,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "moveTo" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        speed: J(A.target.value, N.action.speed ?? 2.2)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) })
              ] }),
              v.action.type === "lookAt" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "Target X", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.target[0],
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "lookAt" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        target: q(N.action.target, 0, A.target.value)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Target Y", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.target[1],
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "lookAt" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        target: q(N.action.target, 1, A.target.value)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Target Z", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.target[2],
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "lookAt" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        target: q(N.action.target, 2, A.target.value)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) })
              ] }),
              v.action.type === "patrol" && /* @__PURE__ */ x(be, { children: [
                /* @__PURE__ */ s(me, { label: "웨이포인트 수", children: /* @__PURE__ */ s("span", { children: v.action.waypoints.length }) }),
                /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "6px" }, children: [
                  /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "웨이포인트 편집" }),
                  v.action.waypoints.map((A, N) => /* @__PURE__ */ x(
                    "div",
                    {
                      style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr)) auto auto auto",
                        gap: "4px",
                        alignItems: "center"
                      },
                      children: [
                        /* @__PURE__ */ s(
                          "input",
                          {
                            type: "number",
                            value: A[0],
                            onChange: (W) => y((K) => {
                              if (K.type !== "action" || K.action.type !== "patrol") return K;
                              const Q = [...K.action.waypoints], ne = Q[N] ?? A;
                              return Q[N] = q(ne, 0, W.target.value), {
                                ...K,
                                action: {
                                  ...K.action,
                                  waypoints: Q
                                }
                              };
                            })
                          }
                        ),
                        /* @__PURE__ */ s(
                          "input",
                          {
                            type: "number",
                            value: A[1],
                            onChange: (W) => y((K) => {
                              if (K.type !== "action" || K.action.type !== "patrol") return K;
                              const Q = [...K.action.waypoints], ne = Q[N] ?? A;
                              return Q[N] = q(ne, 1, W.target.value), {
                                ...K,
                                action: {
                                  ...K.action,
                                  waypoints: Q
                                }
                              };
                            })
                          }
                        ),
                        /* @__PURE__ */ s(
                          "input",
                          {
                            type: "number",
                            value: A[2],
                            onChange: (W) => y((K) => {
                              if (K.type !== "action" || K.action.type !== "patrol") return K;
                              const Q = [...K.action.waypoints], ne = Q[N] ?? A;
                              return Q[N] = q(ne, 2, W.target.value), {
                                ...K,
                                action: {
                                  ...K.action,
                                  waypoints: Q
                                }
                              };
                            })
                          }
                        ),
                        /* @__PURE__ */ s(
                          "button",
                          {
                            className: "building-panel__segment-btn",
                            onClick: () => y((W) => {
                              if (W.type !== "action" || W.action.type !== "patrol" || N <= 0) return W;
                              const K = [...W.action.waypoints], Q = K[N - 1], ne = K[N];
                              return !Q || !ne ? W : (K[N - 1] = ne, K[N] = Q, {
                                ...W,
                                action: {
                                  ...W.action,
                                  waypoints: K
                                }
                              });
                            }),
                            children: "위"
                          }
                        ),
                        /* @__PURE__ */ s(
                          "button",
                          {
                            className: "building-panel__segment-btn",
                            onClick: () => y((W) => {
                              if (W.type !== "action" || W.action.type !== "patrol" || N >= W.action.waypoints.length - 1) return W;
                              const K = [...W.action.waypoints], Q = K[N], ne = K[N + 1];
                              return !Q || !ne ? W : (K[N] = ne, K[N + 1] = Q, {
                                ...W,
                                action: {
                                  ...W.action,
                                  waypoints: K
                                }
                              });
                            }),
                            children: "아래"
                          }
                        ),
                        /* @__PURE__ */ s(
                          "button",
                          {
                            className: "building-panel__segment-btn",
                            onClick: () => y((W) => W.type !== "action" || W.action.type !== "patrol" || W.action.waypoints.length <= 1 ? W : {
                              ...W,
                              action: {
                                ...W.action,
                                waypoints: W.action.waypoints.filter((K, Q) => Q !== N)
                              }
                            }),
                            children: "삭제"
                          }
                        )
                      ]
                    },
                    `waypoint-${N}`
                  )),
                  /* @__PURE__ */ s(
                    "button",
                    {
                      className: "building-panel__segment-btn",
                      onClick: () => y((A) => {
                        if (A.type !== "action" || A.action.type !== "patrol") return A;
                        const N = A.action.waypoints[A.action.waypoints.length - 1] ?? [0, 0, 0], W = [N[0] + 1, N[1], N[2] + 1];
                        return {
                          ...A,
                          action: {
                            ...A.action,
                            waypoints: [...A.action.waypoints, W]
                          }
                        };
                      }),
                      children: "웨이포인트 추가"
                    }
                  )
                ] }),
                /* @__PURE__ */ s(me, { label: "속도", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "number",
                    value: v.action.speed ?? 2.2,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "patrol" ? N : {
                      ...N,
                      action: {
                        ...N.action,
                        speed: J(A.target.value, N.action.speed ?? 2.2)
                      }
                    }),
                    style: { width: "100%" }
                  }
                ) }),
                /* @__PURE__ */ s(me, { label: "Loop", children: /* @__PURE__ */ s(
                  "input",
                  {
                    type: "checkbox",
                    checked: v.action.loop ?? !0,
                    onChange: (A) => y((N) => N.type !== "action" || N.action.type !== "patrol" ? N : { ...N, action: { ...N.action, loop: A.target.checked } })
                  }
                ) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-panel__segmented", children: [
            /* @__PURE__ */ s(
              "button",
              {
                className: "building-panel__segment-btn",
                onClick: () => r(n.id, Qo(
                  n,
                  qo("navigationIdle"),
                  e.behavior
                )),
                children: "조건:이동 대기"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                className: "building-panel__segment-btn",
                onClick: () => r(n.id, Qo(
                  n,
                  qo("questStatus"),
                  e.behavior
                )),
                children: "조건:퀘스트"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                className: "building-panel__segment-btn",
                onClick: () => r(n.id, Qo(
                  n,
                  qo("friendshipAtLeast"),
                  e.behavior
                )),
                children: "조건:친밀도"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                className: "building-panel__segment-btn",
                onClick: () => r(n.id, ao(
                  n,
                  oo("wander", e.behavior)
                )),
                children: "배회 노드 추가"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                className: "building-panel__segment-btn",
                onClick: () => r(n.id, ao(
                  n,
                  oo("speak", e.behavior)
                )),
                children: "대화 노드 추가"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                className: "building-panel__segment-btn",
                onClick: () => {
                  const A = Qo(
                    n,
                    qo("questStatus"),
                    e.behavior
                  ), N = ao(
                    A,
                    oo("speak", e.behavior)
                  );
                  r(n.id, N);
                },
                children: "프리셋:퀘스트 대화"
              }
            )
          ] })
        ]
      }
    ) })
  ] });
}
function Cc({
  instance: e,
  updateBrain: t,
  updatePerception: n
}) {
  const i = e.perception?.sightRadius ?? 8;
  return /* @__PURE__ */ x("div", { className: "building-panel__npc-card", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "지각/연동 설정" }),
    /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
      /* @__PURE__ */ s(me, { label: "시야 감지", children: /* @__PURE__ */ s(
        cs,
        {
          value: e.perception?.enabled ?? !0,
          onChange: (o) => n(e.id, { enabled: o })
        }
      ) }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "시야 반경" }),
        /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => n(e.id, { sightRadius: Math.max(1, i - 1) }),
              children: "-"
            }
          ),
          /* @__PURE__ */ x("span", { className: "building-panel__stepper-value", children: [
            i,
            "m"
          ] }),
          /* @__PURE__ */ s(
            "button",
            {
              className: "building-panel__stepper-btn",
              onClick: () => n(e.id, { sightRadius: Math.min(60, i + 1) }),
              children: "+"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "Provider" }),
        /* @__PURE__ */ s(
          "input",
          {
            value: e.brain?.providerId ?? "",
            onChange: (o) => t(e.id, { providerId: o.target.value }),
            placeholder: "llm provider id",
            style: { width: "100%", minWidth: 0 }
          }
        )
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "Policy" }),
        /* @__PURE__ */ s(
          "input",
          {
            value: e.brain?.policyId ?? "",
            onChange: (o) => t(e.id, { policyId: o.target.value }),
            placeholder: "rl policy id",
            style: { width: "100%", minWidth: 0 }
          }
        )
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "관측" }),
        /* @__PURE__ */ x("span", { className: "building-panel__info-value", children: [
          "감지 ",
          e.lastObservation?.perceived.length ?? 0,
          " · 결정 ",
          e.lastDecision?.source ?? "없음"
        ] })
      ] })
    ] })
  ] });
}
function mt({
  label: e,
  value: t,
  onDecrement: n,
  onIncrement: i
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
    /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: e }),
    /* @__PURE__ */ x("div", { className: "building-panel__stepper", children: [
      /* @__PURE__ */ s("button", { className: "building-panel__stepper-btn", onClick: n, children: "-" }),
      /* @__PURE__ */ s("span", { className: "building-panel__stepper-value", children: t }),
      /* @__PURE__ */ s("button", { className: "building-panel__stepper-btn", onClick: i, children: "+" })
    ] })
  ] });
}
function us({
  label: e,
  value: t,
  placeholder: n,
  onChange: i
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
    /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: e }),
    /* @__PURE__ */ s(
      "input",
      {
        type: "text",
        value: t,
        onChange: (o) => i(o.target.value),
        placeholder: n,
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
  ] });
}
function r1({
  currentTreeKind: e,
  setTreeKind: t,
  currentObjectPrimaryColor: n,
  setObjectPrimaryColor: i,
  currentObjectSecondaryColor: o,
  setObjectSecondaryColor: r
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "나무 프리셋" }),
    /* @__PURE__ */ s("div", { className: "building-panel__grid", children: du.map((a) => /* @__PURE__ */ s(
      "button",
      {
        className: `building-panel__grid-btn ${e === a.type ? "building-panel__grid-btn--active" : ""}`,
        onClick: () => t(a.type),
        children: a.labelKo
      },
      a.type
    )) }),
    /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
      /* @__PURE__ */ s(me, { label: "잎/꽃 색", children: /* @__PURE__ */ s(xo, { value: n, onChange: i }) }),
      /* @__PURE__ */ s(me, { label: "줄기 색", children: /* @__PURE__ */ s(xo, { value: o, onChange: r }) })
    ] })
  ] });
}
function a1({
  currentFireIntensity: e,
  setFireIntensity: t,
  currentFireWidth: n,
  setFireWidth: i,
  currentFireHeight: o,
  setFireHeight: r,
  currentFireColor: a,
  setFireColor: l
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "불 설정" }),
    /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
      /* @__PURE__ */ s(
        mt,
        {
          label: "강도",
          value: e.toFixed(1),
          onDecrement: () => t(Math.max(0.5, e - 0.5)),
          onIncrement: () => t(Math.min(3, e + 0.5))
        }
      ),
      /* @__PURE__ */ s(
        mt,
        {
          label: "너비",
          value: `${n.toFixed(1)}m`,
          onDecrement: () => i(Math.max(0.3, n - 0.2)),
          onIncrement: () => i(Math.min(4, n + 0.2))
        }
      ),
      /* @__PURE__ */ s(
        mt,
        {
          label: "높이",
          value: `${o.toFixed(1)}m`,
          onDecrement: () => r(Math.max(0.5, o - 0.3)),
          onIncrement: () => r(Math.min(5, o + 0.3))
        }
      ),
      /* @__PURE__ */ s(me, { label: "색상", children: /* @__PURE__ */ s(xo, { value: a, onChange: l }) })
    ] })
  ] });
}
const s1 = [
  { value: "#00ff88", label: "초록" },
  { value: "#00aaff", label: "파랑" },
  { value: "#f59e0b", label: "앰버" },
  { value: "#ffffff", label: "흰색" },
  { value: "#ffdd00", label: "노랑" }
];
function l1({
  currentBillboardScale: e,
  setBillboardScale: t,
  currentBillboardOffsetY: n,
  setBillboardOffsetY: i,
  currentBillboardWidth: o,
  setBillboardWidth: r,
  currentBillboardHeight: a,
  setBillboardHeight: l,
  currentBillboardElevation: c,
  setBillboardElevation: u,
  currentBillboardIntensity: d,
  setBillboardIntensity: f,
  currentBillboardText: p,
  setBillboardText: h,
  currentBillboardImageUrl: w,
  setBillboardImageUrl: g,
  currentBillboardColor: _,
  setBillboardColor: b
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "간판 설정" }),
    /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
      /* @__PURE__ */ s(
        mt,
        {
          label: "크기",
          value: `${e.toFixed(1)}x`,
          onDecrement: () => t(Math.max(0.2, e - 0.2)),
          onIncrement: () => t(Math.min(10, e + 0.2))
        }
      ),
      /* @__PURE__ */ s(
        mt,
        {
          label: "배치 높이",
          value: `${n.toFixed(2)}m`,
          onDecrement: () => i(Math.max(-4, n - 0.25)),
          onIncrement: () => i(Math.min(12, n + 0.25))
        }
      ),
      /* @__PURE__ */ s(
        mt,
        {
          label: "판넬 너비",
          value: o > 0 ? `${o.toFixed(2)}m` : "자동",
          onDecrement: () => r(Math.max(0, o - 0.25)),
          onIncrement: () => r(Math.min(12, o + 0.25))
        }
      ),
      /* @__PURE__ */ s(
        mt,
        {
          label: "판넬 높이",
          value: `${a.toFixed(2)}m`,
          onDecrement: () => l(Math.max(0.3, a - 0.25)),
          onIncrement: () => l(Math.min(8, a + 0.25))
        }
      ),
      /* @__PURE__ */ s(
        mt,
        {
          label: "기둥 높이",
          value: `${c.toFixed(2)}m`,
          onDecrement: () => u(Math.max(0, c - 0.25)),
          onIncrement: () => u(Math.min(8, c + 0.25))
        }
      ),
      /* @__PURE__ */ s(
        mt,
        {
          label: "밝기",
          value: d.toFixed(2),
          onDecrement: () => f(Math.max(0, d - 0.25)),
          onIncrement: () => f(Math.min(8, d + 0.25))
        }
      ),
      /* @__PURE__ */ s(
        us,
        {
          label: "문구",
          value: p,
          onChange: h,
          placeholder: "표시할 문구..."
        }
      ),
      /* @__PURE__ */ s(
        us,
        {
          label: "이미지 URL",
          value: w,
          onChange: g,
          placeholder: "https://..."
        }
      ),
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "색상" }),
        /* @__PURE__ */ s("div", { className: "building-panel__grid", children: s1.map((S) => /* @__PURE__ */ s(
          "button",
          {
            className: `building-panel__grid-btn ${_ === S.value ? "building-panel__grid-btn--active" : ""}`,
            onClick: () => b(S.value),
            style: { borderBottom: `3px solid ${S.value}` },
            children: S.label
          },
          S.value
        )) })
      ] })
    ] })
  ] });
}
function c1({
  currentFlagStyle: e,
  setFlagStyle: t,
  currentFlagWidth: n,
  setFlagWidth: i,
  currentFlagHeight: o,
  setFlagHeight: r,
  currentFlagImageUrl: a,
  setFlagImageUrl: l
}) {
  return /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "깃발 설정" }),
    /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
      /* @__PURE__ */ x("div", { className: "building-panel__info-item", style: { flexDirection: "column", alignItems: "stretch", gap: "4px" }, children: [
        /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "스타일" }),
        /* @__PURE__ */ s("div", { className: "building-panel__grid", children: fu.map(({ style: c, meta: u }) => /* @__PURE__ */ s(
          "button",
          {
            className: `building-panel__grid-btn ${e === c ? "building-panel__grid-btn--active" : ""}`,
            onClick: () => t(c),
            children: u.label
          },
          c
        )) })
      ] }),
      /* @__PURE__ */ s(
        mt,
        {
          label: "너비",
          value: `${n}m`,
          onDecrement: () => i(Math.max(0.5, n - 0.5)),
          onIncrement: () => i(Math.min(8, n + 0.5))
        }
      ),
      /* @__PURE__ */ s(
        mt,
        {
          label: "높이",
          value: `${o}m`,
          onDecrement: () => r(Math.max(0.5, o - 0.5)),
          onIncrement: () => r(Math.min(6, o + 0.5))
        }
      ),
      /* @__PURE__ */ s(
        us,
        {
          label: "이미지 URL",
          value: a,
          onChange: l,
          placeholder: "https://..."
        }
      )
    ] })
  ] });
}
const u1 = 32, Ar = /* @__PURE__ */ new Map();
function Jo(e) {
  return Ar.set(e.id, e), () => {
    Ar.delete(e.id);
  };
}
function d1(e) {
  return Ar.get(e);
}
function f1(e) {
  Ar.delete(e);
}
const p1 = (e) => ({
  ...e,
  ...e.waypoints ? { waypoints: e.waypoints.map((t) => [...t]) } : {}
}), af = (e) => ({
  ...e,
  ...e.memory ? { memory: { ...e.memory } } : {}
}), sf = (e) => ({ ...e }), lf = (e) => e.map((t) => ({ ...t, ...t.payload ? { payload: { ...t.payload } } : {} }));
function h1(e, t = {}) {
  const n = {
    mode: e.behavior?.mode ?? "idle",
    speed: e.behavior?.speed ?? 2.2,
    ...e.behavior?.loop !== void 0 ? { loop: e.behavior.loop } : {},
    ...e.behavior?.waypoints ? { waypoints: e.behavior.waypoints.map((i) => [...i]) } : {},
    ...e.behavior?.wanderRadius !== void 0 ? { wanderRadius: e.behavior.wanderRadius } : {},
    ...e.behavior?.waitSeconds !== void 0 ? { waitSeconds: e.behavior.waitSeconds } : {},
    ...e.behavior?.idleAnimation ? { idleAnimation: e.behavior.idleAnimation } : {},
    ...e.behavior?.moveAnimation ? { moveAnimation: e.behavior.moveAnimation } : {},
    ...e.behavior?.arriveAnimation ? { arriveAnimation: e.behavior.arriveAnimation } : {}
  };
  return {
    id: t.id ?? `npc-behavior-${e.id}`,
    name: t.name ?? `${e.name} Behavior`,
    ...t.description ? { description: t.description } : {},
    ...t.role ? { role: t.role } : {},
    behavior: n,
    ...e.brain ? { brain: af(e.brain) } : {},
    ...e.perception ? { perception: sf(e.perception) } : {},
    ...e.events ? { events: lf(e.events) } : {},
    ...t.tags ? { tags: [...t.tags] } : {}
  };
}
function m1(e, t = {}) {
  return {
    id: t.id ?? e.id,
    name: t.name ?? e.name,
    ownerType: t.ownerType ?? "npc",
    ...t.description ?? e.description ? { description: t.description ?? e.description } : {},
    ...t.role ?? e.role ? { role: t.role ?? e.role } : {},
    behavior: p1(e.behavior),
    ...e.brain ? { brain: af(e.brain) } : {},
    ...e.perception ? { perception: sf(e.perception) } : {},
    ...e.events ? { events: lf(e.events) } : {},
    ...t.tags ? { tags: [...t.tags] } : e.tags ? { tags: [...e.tags] } : {}
  };
}
function g1(e, t) {
  switch (e.type) {
    case "always":
      return !0;
    case "navigationIdle":
      return t.navigationState !== "moving";
    case "perceivedAny":
      return t.perceived.length > 0;
    case "questStatus":
      return Zp.getState().statusOf(e.questId) === e.status;
    case "friendshipAtLeast": {
      const n = e.npcId ?? t.instanceId;
      return Vp.getState().scoreOf(n) >= e.score;
    }
    case "memoryEquals":
      return t.memory?.[e.key] === e.value;
  }
}
function b1(e, t) {
  switch (e.type) {
    case "point":
      return e.value;
    case "self":
      return t.position;
    case "nearestPerceived":
      return t.perceived[0]?.position;
  }
}
function y1(e, t) {
  const n = e.timestamp * 1.7 + e.instanceId.length * 13.37, i = (Math.sin(n) * 0.5 + 0.5) * Math.PI * 2, o = t * (0.35 + (Math.cos(n * 0.73) * 0.5 + 0.5) * 0.65);
  return [
    e.position[0] + Math.cos(i) * o,
    e.position[1],
    e.position[2] + Math.sin(i) * o
  ];
}
function v1(e, t) {
  if (e.action.type === "wander") {
    const i = Math.max(0.5, e.action.radius ?? 4);
    return {
      type: "moveTo",
      target: y1(t, i),
      ...e.action.speed !== void 0 ? { speed: e.action.speed } : {}
    };
  }
  if (e.action.type !== "moveToTarget") return e.action;
  const n = b1(e.action.target, t);
  if (n)
    return {
      type: "moveTo",
      target: n,
      ...e.action.speed !== void 0 ? { speed: e.action.speed } : {},
      ...e.action.animationId ? { animationId: e.action.animationId } : {}
    };
}
function Nc(e, t, n = "next") {
  return e.find((i) => i.source === t && i.branch === n) ?? e.find((i) => i.source === t && i.branch === void 0);
}
function w1(e, t) {
  const n = new Map(e.nodes.map((a) => [a.id, a])), i = [];
  let o = e.nodes.find((a) => a.type === "start") ?? e.nodes[0], r = 0;
  for (; o && r < u1; ) {
    if (r += 1, o.type === "condition") {
      const a = g1(o.condition, t) ? "true" : "false";
      o = n.get(Nc(e.edges, o.id, a)?.target ?? "");
      continue;
    }
    if (o.type === "action") {
      const a = v1(o, t);
      a && i.push(a);
    }
    o = n.get(Nc(e.edges, o.id)?.target ?? "");
  }
  return i;
}
const kr = /* @__PURE__ */ new Map();
function ds(e, t) {
  return `${e}:${t}`;
}
function x1(e, t) {
  const n = e[0] - t[0], i = e[1] - t[1], o = e[2] - t[2];
  return n * n + i * i + o * o;
}
function _1(e, t) {
  const n = e.timestamp * 1.7 + e.instanceId.length * 13.37, i = (Math.sin(n) * 0.5 + 0.5) * Math.PI * 2, o = t * (0.35 + (Math.cos(n * 0.73) * 0.5 + 0.5) * 0.65);
  return [
    e.position[0] + Math.cos(i) * o,
    e.position[1],
    e.position[2] + Math.sin(i) * o
  ];
}
function bM(e, t, n) {
  const i = ds(e, t);
  return kr.set(i, n), () => {
    kr.delete(i);
  };
}
function S1(e, t, n) {
  const i = e.perception, o = i?.enabled ? i.sightRadius : 0, r = o * o, a = [];
  if (o > 0)
    for (const l of t.values()) {
      if (l.id === e.id) continue;
      const c = x1(e.position, l.position);
      if (c > r) continue;
      const u = Math.sqrt(c);
      a.push({
        instanceId: l.id,
        name: l.name,
        position: l.position,
        distance: u,
        brainMode: l.brain?.mode ?? "none"
      });
    }
  return a.sort((l, c) => l.distance - c.distance), {
    instanceId: e.id,
    templateId: e.templateId,
    timestamp: n,
    position: e.position,
    rotation: e.rotation,
    currentAnimation: e.currentAnimation ?? e.behavior?.idleAnimation ?? "idle",
    navigationState: e.navigation?.state ?? "none",
    behaviorMode: e.behavior?.mode ?? "idle",
    brainMode: e.brain?.mode ?? "none",
    perceptionEnabled: i?.enabled ?? !1,
    perceived: a,
    ...e.brain?.memory ? { memory: e.brain.memory } : {}
  };
}
function M1(e) {
  if (!e) return;
  const t = [e.policyId, e.providerId].filter((n) => !!n);
  for (const n of t) {
    const i = kr.get(ds(e.mode, n));
    if (i) return i;
  }
  return kr.get(ds(e.mode, "default"));
}
function C1(e, t) {
  const n = e.brain?.blueprintId, i = n ? d1(n) : void 0;
  if (i) {
    const r = w1(i, t);
    if (r.length > 0)
      return {
        source: "blueprint",
        reason: i.name,
        actions: r
      };
  }
  const o = e.behavior;
  if (!(!o || o.mode === "idle" || t.navigationState === "moving")) {
    if (o.mode === "patrol" && o.waypoints && o.waypoints.length > 0)
      return {
        source: "scripted",
        reason: "patrol behavior",
        actions: [{
          type: "patrol",
          waypoints: o.waypoints,
          speed: o.speed,
          ...o.loop !== void 0 ? { loop: o.loop } : {},
          ...o.moveAnimation ? { animationId: o.moveAnimation } : {}
        }]
      };
    if (o.mode === "wander") {
      const r = Math.max(0.5, o.wanderRadius ?? 4);
      return {
        source: "scripted",
        reason: "wander behavior",
        actions: [{
          type: "moveTo",
          target: _1(t, r),
          speed: o.speed,
          ...o.moveAnimation ? { animationId: o.moveAnimation } : {}
        }]
      };
    }
  }
}
function N1(e, t) {
  const n = e.brain?.mode ?? "none";
  if (n === "none") return;
  const i = M1(e.brain);
  if (i)
    return i({ instance: e, observation: t });
  if (n === "scripted")
    return C1(e, t);
}
ch();
const Ic = {
  height: 1.8,
  radius: 0.32,
  interactionRadius: 1.6
}, fs = {
  mode: "reinforcement",
  policyId: "openai",
  autoRespond: !1,
  prompt: "Respond as an in-world NPC when a dialogue system is connected."
}, Tc = {
  enabled: !0,
  sightRadius: 8,
  hearingRadius: 4,
  fieldOfView: 110
}, Cn = {
  mode: "idle",
  speed: 2.2,
  loop: !0,
  wanderRadius: 4,
  waitSeconds: 1.5,
  idleAnimation: "idle",
  moveAnimation: "walk",
  arriveAnimation: "idle"
}, Ne = {
  body: "/gltf/ally_body.glb",
  cloth: "/gltf/ally_cloth.glb",
  rabbitCloth: "/gltf/ally_cloth_rabbit.glb",
  hat: "/gltf/ally_hat.glb",
  glasses: "/gltf/ally_glass.glb"
}, I1 = /* @__PURE__ */ new Map([
  ["gltf/formal.glb", Ne.cloth],
  ["gltf/hat_a.glb", Ne.hat],
  ["gltf/hat_b.glb", Ne.hat],
  ["gltf/hat_c.glb", Ne.hat],
  ["gltf/glass_a.glb", Ne.glasses],
  ["gltf/super_glass.glb", Ne.glasses]
]);
function wa(e) {
  const t = I1.get(e.url) ?? e.url;
  return {
    ...e,
    url: t.startsWith("gltf/") ? `/${t}` : t
  };
}
function Ec(e) {
  return e.behavior?.idleAnimation ?? e.behavior?.arriveAnimation ?? "idle";
}
function T1(e, t) {
  return e.behavior?.moveAnimation ?? (t >= 3.8 ? "run" : "walk");
}
function Ac(e) {
  e.instances.forEach((t, n) => {
    const i = t.brain ?? fs;
    i.mode === "reinforcement" && (i.policyId ?? "").length > 0 || e.instances.set(n, {
      ...t,
      brain: {
        ...i,
        mode: "reinforcement",
        policyId: i.policyId ?? "openai"
      }
    });
  });
}
function E1(e) {
  const t = /* @__PURE__ */ new Map([
    ["rabbit-cloth", Ne.rabbitCloth],
    ["basic-suit-cloth", Ne.cloth],
    ["formal-suit-cloth", Ne.cloth],
    ["hat-a", Ne.hat],
    ["hat-b", Ne.hat],
    ["hat-c", Ne.hat],
    ["glass-a", Ne.glasses],
    ["super-glass", Ne.glasses],
    ["ally-body", Ne.body],
    ["oneyee-body", Ne.body]
  ]);
  e.clothingSets.forEach((n) => {
    n.parts = n.parts.map((i) => {
      const o = wa(i);
      return {
        ...o,
        url: t.get(i.id) ?? o.url
      };
    });
  }), e.templates.forEach((n) => {
    n.baseParts = n.baseParts.map((i) => {
      const o = wa(i);
      return {
        ...o,
        url: t.get(i.id) ?? o.url
      };
    });
  }), e.instances.forEach((n) => {
    n.customParts && (n.customParts = n.customParts.map(wa));
  });
}
const we = yi()(
  uh((e, t) => ({
    initialized: !1,
    templates: /* @__PURE__ */ new Map(),
    instances: /* @__PURE__ */ new Map(),
    categories: /* @__PURE__ */ new Map(),
    clothingSets: /* @__PURE__ */ new Map(),
    clothingCategories: /* @__PURE__ */ new Map(),
    animations: /* @__PURE__ */ new Map(),
    brainBlueprints: /* @__PURE__ */ new Map(),
    editMode: !1,
    previewAccessories: {},
    initializeDefaults: () => e((n) => {
      if (n.initialized) {
        E1(n), Ac(n);
        return;
      }
      n.animations.set("idle", {
        id: "idle",
        name: "Idle",
        loop: !0,
        speed: 1
      }), n.animations.set("walk", {
        id: "walk",
        name: "Walk",
        loop: !0,
        speed: 1
      }), n.animations.set("greet", {
        id: "greet",
        name: "Greet",
        loop: !1,
        speed: 1
      }), n.animations.set("jump", {
        id: "jump",
        name: "Jump",
        loop: !1,
        speed: 1
      }), n.animations.set("run", {
        id: "run",
        name: "Run",
        loop: !0,
        speed: 1.5
      });
      const i = {
        id: "npc-blueprint-wander",
        name: "Wander Loop",
        description: "Move to a generated wander target when navigation is idle.",
        nodes: [
          { id: "start", type: "start", label: "Start" },
          { id: "idle-check", type: "condition", label: "Navigation Idle", condition: { type: "navigationIdle" } },
          { id: "quest-check", type: "condition", label: "Quest Active", condition: { type: "questStatus", questId: "welcome", status: "active" } },
          { id: "wander", type: "action", label: "Wander", action: { type: "wander", radius: 4, speed: 2.2, waitSeconds: 1.5 } }
        ],
        edges: [
          { id: "start-idle", source: "start", target: "idle-check", branch: "next" },
          { id: "idle-quest", source: "idle-check", target: "quest-check", branch: "true" },
          { id: "quest-wander", source: "quest-check", target: "wander", branch: "true" }
        ]
      }, o = {
        id: "npc-blueprint-greet-nearest",
        name: "Greet Nearest",
        description: "Look at and greet the nearest perceived NPC.",
        nodes: [
          { id: "start", type: "start", label: "Start" },
          { id: "see-any", type: "condition", label: "Perceived Any", condition: { type: "perceivedAny" } },
          { id: "look", type: "action", label: "Look At Nearest", action: { type: "moveToTarget", target: { type: "nearestPerceived" }, speed: 1.2, animationId: "walk" } },
          { id: "speak", type: "action", label: "Speak", action: { type: "speak", text: "안녕?", duration: 2 } }
        ],
        edges: [
          { id: "start-see", source: "start", target: "see-any", branch: "next" },
          { id: "see-look", source: "see-any", target: "look", branch: "true" },
          { id: "look-speak", source: "look", target: "speak", branch: "next" }
        ]
      };
      n.brainBlueprints.set(i.id, i), n.brainBlueprints.set(o.id, o), Jo(i), Jo(o), n.clothingCategories.set("basic", {
        id: "basic",
        name: "기본 의상",
        description: "Basic clothing sets",
        clothingSetIds: ["rabbit-outfit", "basic-suit", "formal-suit"]
      }), n.clothingCategories.set("accessories", {
        id: "accessories",
        name: "액세서리",
        description: "Hats and glasses",
        clothingSetIds: ["hat-set-a", "hat-set-b", "hat-set-c", "glass-set-a", "glass-set-b"]
      }), n.clothingSets.set("rabbit-outfit", {
        id: "rabbit-outfit",
        name: "토끼옷",
        category: "casual",
        parts: [
          {
            id: "rabbit-cloth",
            type: "top",
            url: Ne.rabbitCloth,
            position: [0, 0, 0]
          }
        ]
      }), n.clothingSets.set("basic-suit", {
        id: "basic-suit",
        name: "양복",
        category: "formal",
        parts: [
          {
            id: "basic-suit-cloth",
            type: "top",
            url: Ne.cloth,
            position: [0, 0, 0]
          }
        ]
      }), n.clothingSets.set("formal-suit", {
        id: "formal-suit",
        name: "양복 2",
        category: "formal",
        parts: [
          {
            id: "formal-suit-cloth",
            type: "top",
            url: Ne.cloth,
            position: [0, 0, 0]
          }
        ]
      }), n.clothingSets.set("hat-set-a", {
        id: "hat-set-a",
        name: "모자 A",
        category: "casual",
        parts: [
          {
            id: "hat-a",
            type: "hat",
            url: Ne.hat,
            position: [0, 0, 0]
          }
        ]
      }), n.clothingSets.set("hat-set-b", {
        id: "hat-set-b",
        name: "모자 B",
        category: "casual",
        parts: [
          {
            id: "hat-b",
            type: "hat",
            url: Ne.hat,
            position: [0, 0, 0]
          }
        ]
      }), n.clothingSets.set("hat-set-c", {
        id: "hat-set-c",
        name: "모자 C",
        category: "casual",
        parts: [
          {
            id: "hat-c",
            type: "hat",
            url: Ne.hat,
            position: [0, 0, 0]
          }
        ]
      }), n.clothingSets.set("glass-set-a", {
        id: "glass-set-a",
        name: "안경 A",
        category: "casual",
        parts: [
          {
            id: "glass-a",
            type: "glasses",
            url: Ne.glasses,
            position: [0, 0, 0]
          }
        ]
      }), n.clothingSets.set("glass-set-b", {
        id: "glass-set-b",
        name: "슈퍼 안경",
        category: "casual",
        parts: [
          {
            id: "super-glass",
            type: "glasses",
            url: Ne.glasses,
            position: [0, 0, 0]
          }
        ]
      }), n.categories.set("humanoid", {
        id: "humanoid",
        name: "캐릭터",
        description: "Human-like characters",
        templateIds: ["ally", "oneyee"]
      }), n.templates.set("ally", {
        id: "ally",
        name: "올춘삼",
        description: "Ally character",
        category: "humanoid",
        baseParts: [
          {
            id: "ally-body",
            type: "body",
            url: Ne.body,
            position: [0, 0, 0]
          }
        ],
        clothingParts: [],
        defaultAnimation: "idle",
        defaultClothingSet: "rabbit-outfit"
      }), n.templates.set("oneyee", {
        id: "oneyee",
        name: "원덕배",
        description: "Oneyee character",
        category: "humanoid",
        baseParts: [
          {
            id: "oneyee-body",
            type: "body",
            // Fallback to an existing body asset until oneyee model is added.
            url: Ne.body,
            position: [0, 0, 0]
          }
        ],
        clothingParts: [],
        defaultAnimation: "idle",
        defaultClothingSet: "basic-suit"
      }), n.selectedCategoryId = "humanoid", n.selectedTemplateId = "ally", n.selectedClothingCategoryId = "basic", n.selectedClothingSetId = "rabbit-outfit", Ac(n), n.initialized = !0;
    }),
    addTemplate: (n) => e((i) => {
      i.templates.set(n.id, n);
    }),
    updateTemplate: (n, i) => e((o) => {
      const r = o.templates.get(n);
      r && o.templates.set(n, { ...r, ...i });
    }),
    removeTemplate: (n) => e((i) => {
      i.templates.delete(n);
    }),
    addInstance: (n) => e((i) => {
      i.instances.set(n.id, n);
    }),
    updateInstance: (n, i) => e((o) => {
      const r = o.instances.get(n);
      r && o.instances.set(n, { ...r, ...i });
    }),
    removeInstance: (n) => e((i) => {
      i.instances.delete(n);
    }),
    addCategory: (n) => e((i) => {
      i.categories.set(n.id, n);
    }),
    updateCategory: (n, i) => e((o) => {
      const r = o.categories.get(n);
      r && o.categories.set(n, { ...r, ...i });
    }),
    removeCategory: (n) => e((i) => {
      i.categories.delete(n);
    }),
    addClothingSet: (n) => e((i) => {
      i.clothingSets.set(n.id, n);
    }),
    updateClothingSet: (n, i) => e((o) => {
      const r = o.clothingSets.get(n);
      r && o.clothingSets.set(n, { ...r, ...i });
    }),
    removeClothingSet: (n) => e((i) => {
      i.clothingSets.delete(n);
    }),
    addClothingCategory: (n) => e((i) => {
      i.clothingCategories.set(n.id, n);
    }),
    updateClothingCategory: (n, i) => e((o) => {
      const r = o.clothingCategories.get(n);
      r && o.clothingCategories.set(n, { ...r, ...i });
    }),
    removeClothingCategory: (n) => e((i) => {
      i.clothingCategories.delete(n);
    }),
    addAnimation: (n) => e((i) => {
      i.animations.set(n.id, n);
    }),
    updateAnimation: (n, i) => e((o) => {
      const r = o.animations.get(n);
      r && o.animations.set(n, { ...r, ...i });
    }),
    removeAnimation: (n) => e((i) => {
      i.animations.delete(n);
    }),
    addBrainBlueprint: (n) => e((i) => {
      i.brainBlueprints.set(n.id, n), Jo(n);
    }),
    updateBrainBlueprint: (n, i) => e((o) => {
      const r = o.brainBlueprints.get(n);
      if (!r) return;
      const a = { ...r, ...i };
      o.brainBlueprints.set(n, a), Jo(a);
    }),
    removeBrainBlueprint: (n) => e((i) => {
      i.brainBlueprints.delete(n), f1(n);
    }),
    setSelectedTemplate: (n) => e((i) => {
      i.selectedTemplateId = n;
    }),
    setSelectedCategory: (n) => e((i) => {
      i.selectedCategoryId = n;
      const o = i.categories.get(n);
      if (o && o.templateIds.length > 0) {
        const r = o.templateIds[0];
        r && (i.selectedTemplateId = r);
      } else
        delete i.selectedTemplateId;
    }),
    setSelectedInstance: (n) => e((i) => {
      i.selectedInstanceId = n;
    }),
    setSelectedClothingSet: (n) => e((i) => {
      i.selectedClothingSetId = n;
    }),
    setSelectedClothingCategory: (n) => e((i) => {
      i.selectedClothingCategoryId = n;
      const o = i.clothingCategories.get(n);
      if (o && o.clothingSetIds.length > 0) {
        const r = o.clothingSetIds[0];
        r && (i.selectedClothingSetId = r);
      } else
        delete i.selectedClothingSetId;
    }),
    setEditMode: (n) => e((i) => {
      i.editMode = n;
    }),
    createInstanceFromTemplate: (n, i) => {
      const o = t().templates.get(n);
      if (!o) return;
      const r = `npc-${Date.now()}`, a = t().selectedClothingSetId || o.defaultClothingSet, l = [], c = t().previewAccessories.hat;
      if (c) {
        const p = t().clothingSets.get(c)?.parts[0];
        p && l.push(p);
      }
      const u = t().previewAccessories.glasses;
      if (u) {
        const p = t().clothingSets.get(u)?.parts[0];
        p && l.push(p);
      }
      const d = {
        id: r,
        templateId: n,
        name: `${o.name} ${Date.now()}`,
        position: i,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        ...o.defaultAnimation ? { currentAnimation: o.defaultAnimation } : {},
        ...a ? { currentClothingSetId: a } : {},
        ...l.length > 0 ? { customParts: l } : {},
        volume: { ...Ic },
        brain: { ...fs },
        perception: { ...Tc },
        behavior: { ...Cn },
        events: []
      };
      t().addInstance(d), t().setSelectedInstance(r);
    },
    updateInstancePart: (n, i, o) => e((r) => {
      const a = r.instances.get(n);
      if (!a) return;
      const l = a.customParts || [], c = l.findIndex((u) => u.id === i);
      if (c >= 0) {
        const u = l[c];
        l[c] = {
          ...u,
          ...o,
          id: u.id,
          type: u.type,
          url: u.url
        };
      } else {
        const u = o.type ?? "accessory", d = o.url ?? "";
        l.push({
          id: i,
          type: u,
          url: d,
          ...o.category !== void 0 ? { category: o.category } : {},
          ...o.position !== void 0 ? { position: o.position } : {},
          ...o.rotation !== void 0 ? { rotation: o.rotation } : {},
          ...o.scale !== void 0 ? { scale: o.scale } : {},
          ...o.color !== void 0 ? { color: o.color } : {},
          ...o.metadata !== void 0 ? { metadata: o.metadata } : {}
        });
      }
      r.instances.set(n, { ...a, customParts: l });
    }),
    changeInstanceClothing: (n, i) => e((o) => {
      const r = o.instances.get(n);
      r && o.instances.set(n, { ...r, currentClothingSetId: i });
    }),
    updateInstanceVolume: (n, i) => e((o) => {
      const r = o.instances.get(n);
      r && o.instances.set(n, {
        ...r,
        volume: { ...r.volume ?? Ic, ...i }
      });
    }),
    updateInstanceBrain: (n, i) => e((o) => {
      const r = o.instances.get(n);
      r && o.instances.set(n, {
        ...r,
        brain: { ...r.brain ?? fs, ...i }
      });
    }),
    updateInstancePerception: (n, i) => e((o) => {
      const r = o.instances.get(n);
      r && o.instances.set(n, {
        ...r,
        perception: { ...r.perception ?? Tc, ...i }
      });
    }),
    updateInstanceBehavior: (n, i) => e((o) => {
      const r = o.instances.get(n);
      if (!r) return;
      const a = { ...r.behavior ?? Cn, ...i }, l = {
        ...r,
        behavior: a
      };
      a.mode === "idle" ? l.currentAnimation = a.idleAnimation ?? "idle" : i.moveAnimation !== void 0 && (l.currentAnimation = i.moveAnimation), a.mode === "idle" && delete l.navigation, o.instances.set(n, l);
    }),
    setInstanceObservation: (n, i) => e((o) => {
      const r = o.instances.get(n);
      r && o.instances.set(n, {
        ...r,
        lastObservation: i
      });
    }),
    setInstanceDecision: (n, i) => e((o) => {
      const r = o.instances.get(n);
      r && o.instances.set(n, {
        ...r,
        lastDecision: i
      });
    }),
    executeInstanceAction: (n, i) => {
      const o = t(), r = o.instances.get(n);
      if (r)
        switch (i.type) {
          case "idle":
            o.updateInstanceBehavior(n, {
              mode: "idle",
              ...i.animationId ? { idleAnimation: i.animationId, arriveAnimation: i.animationId } : {}
            }), o.clearNavigation(n), i.animationId && o.updateInstance(n, { currentAnimation: i.animationId });
            return;
          case "moveTo":
            i.animationId && o.updateInstanceBehavior(n, { moveAnimation: i.animationId }), o.setNavigation(n, [i.target], i.speed ?? r.behavior?.speed ?? Cn.speed);
            return;
          case "patrol":
            if (i.waypoints.length === 0) return;
            o.updateInstanceBehavior(n, {
              mode: "patrol",
              waypoints: i.waypoints,
              speed: i.speed ?? r.behavior?.speed ?? Cn.speed,
              loop: i.loop ?? r.behavior?.loop ?? !0,
              ...i.animationId ? { moveAnimation: i.animationId } : {}
            }), o.setNavigation(n, i.waypoints, i.speed ?? r.behavior?.speed ?? Cn.speed);
            return;
          case "wander":
            o.updateInstanceBehavior(n, {
              mode: "wander",
              speed: i.speed ?? r.behavior?.speed ?? Cn.speed,
              wanderRadius: i.radius ?? r.behavior?.wanderRadius ?? Cn.wanderRadius ?? 4,
              waitSeconds: i.waitSeconds ?? r.behavior?.waitSeconds ?? Cn.waitSeconds ?? 1.5
            });
            return;
          case "playAnimation":
            o.updateAnimation(i.animationId, {
              ...i.loop !== void 0 ? { loop: i.loop } : {},
              ...i.speed !== void 0 ? { speed: i.speed } : {}
            }), o.updateInstance(n, { currentAnimation: i.animationId });
            return;
          case "lookAt":
            o.updateInstance(n, {
              rotation: [
                r.rotation[0],
                Math.atan2(i.target[0] - r.position[0], i.target[2] - r.position[2]),
                r.rotation[2]
              ]
            });
            return;
          case "speak":
            o.addInstanceEvent(n, {
              id: `npc-speak-${Date.now()}`,
              type: "onInteract",
              action: "dialogue",
              payload: {
                type: "dialogue",
                text: i.text,
                ...i.duration !== void 0 ? { duration: i.duration } : {}
              }
            });
            return;
          case "interact":
            o.updateInstance(n, {
              metadata: {
                ...r.metadata,
                lastInteractionTargetId: i.targetId
              }
            });
            return;
          case "remember":
            o.updateInstanceBrain(n, {
              memory: {
                ...r.brain?.memory ?? {},
                [i.key]: i.value
              }
            });
            return;
        }
    },
    executeInstanceActions: (n, i) => {
      for (const o of i)
        t().executeInstanceAction(n, o);
    },
    addInstanceEvent: (n, i) => e((o) => {
      const r = o.instances.get(n);
      if (r) {
        const a = r.events || [];
        a.push(i), o.instances.set(n, { ...r, events: a });
      }
    }),
    removeInstanceEvent: (n, i) => e((o) => {
      const r = o.instances.get(n);
      if (r && r.events) {
        const a = r.events.filter((l) => l.id !== i);
        o.instances.set(n, { ...r, events: a });
      }
    }),
    setPreviewAccessory: (n, i) => e((o) => {
      i ? o.previewAccessories[n] = i : delete o.previewAccessories[n];
    }),
    setNavigation: (n, i, o = 3) => e((r) => {
      const a = r.instances.get(n);
      if (!a || i.length === 0) return;
      const l = {
        waypoints: i,
        currentIndex: 0,
        speed: o,
        state: "moving"
      };
      r.instances.set(n, {
        ...a,
        navigation: l,
        currentAnimation: T1(a, o)
      });
    }),
    advanceNavigation: (n) => e((i) => {
      const o = i.instances.get(n);
      if (!o?.navigation || o.navigation.state !== "moving") return;
      const r = o.navigation, a = r.currentIndex + 1;
      a >= r.waypoints.length ? i.instances.set(n, {
        ...o,
        navigation: { ...r, state: "arrived", currentIndex: a },
        currentAnimation: Ec(o)
      }) : i.instances.set(n, {
        ...o,
        navigation: { ...r, currentIndex: a }
      });
    }),
    clearNavigation: (n) => e((i) => {
      const o = i.instances.get(n);
      if (!o) return;
      const r = {
        ...o,
        currentAnimation: Ec(o)
      };
      delete r.navigation, i.instances.set(n, r);
    }),
    updateNavigationPosition: (n, i) => e((o) => {
      const r = o.instances.get(n);
      r && o.instances.set(n, { ...r, position: i });
    })
  }))
);
class A1 extends ge.Component {
  state = { hasError: !1 };
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidUpdate(t) {
    this.state.hasError && t.part.url !== this.props.part.url && this.setState({ hasError: !1 });
  }
  render() {
    return this.state.hasError ? /* @__PURE__ */ s(cf, { part: this.props.part, instanceId: this.props.instanceId }) : this.props.children;
  }
}
function k1(e, t) {
  if (e[t]) return t;
  const n = Object.keys(e), i = t.toLowerCase();
  return n.find((o) => o.toLowerCase() === i) ?? n.find((o) => o.toLowerCase().includes(i)) ?? (n.length === 1 ? n[0] : void 0);
}
function cf({ part: e }) {
  return /* @__PURE__ */ x(
    "mesh",
    {
      position: e.position || [0, 0, 0],
      rotation: e.rotation || [0, 0, 0],
      scale: e.scale || [1, 1, 1],
      children: [
        /* @__PURE__ */ s("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ s(
          "meshStandardMaterial",
          {
            color: e.color || "#cccccc",
            transparent: !0,
            opacity: 0.6
          }
        )
      ]
    }
  );
}
function P1(e) {
  const t = e.trim();
  return t.startsWith("gltf/") ? `/${t}` : t;
}
function B1({ part: e, currentAnimation: t }) {
  const n = X(() => P1(e.url), [e.url]), i = Is(n), o = X(() => {
    const l = yu.clone(i.scene);
    return l && We() && Tp(l), l;
  }, [i]), { actions: r } = sh(i.animations, o), a = ee(void 0);
  return oe(() => {
    if (!t) return;
    const l = k1(r, t);
    if (!l || a.current === l) return;
    const c = a.current ? r[a.current] : void 0, u = r[l];
    c?.fadeOut(0.2), u?.reset().fadeIn(0.2).play(), a.current = l;
  }, [r, t]), o ? /* @__PURE__ */ s(
    "primitive",
    {
      object: o,
      position: e.position || [0, 0, 0],
      rotation: e.rotation || [0, 0, 0],
      scale: e.scale || [1, 1, 1]
    }
  ) : null;
}
function R1({ part: e, instanceId: t, currentAnimation: n }) {
  return !!e.url && e.url.trim() !== "" ? /* @__PURE__ */ s(A1, { part: e, instanceId: t, currentAnimation: n, children: /* @__PURE__ */ s(B1, { part: e, instanceId: t, currentAnimation: n }) }) : /* @__PURE__ */ s(cf, { part: e, instanceId: t });
}
const D1 = 0.3, z1 = {
  height: 1.8,
  radius: 0.32,
  interactionRadius: 1.6
}, uf = ge.memo(function({ instance: t, isEditMode: n, onClick: i }) {
  const o = ee(null), r = ee(null), a = ee(0), l = we(
    ce(
      (E) => E.templates.get(t.templateId),
      [t.templateId]
    )
  ), c = we(
    ce(
      (E) => t.currentClothingSetId ? E.clothingSets.get(t.currentClothingSetId) : void 0,
      [t.currentClothingSetId]
    )
  ), u = we((E) => E.advanceNavigation), d = we((E) => E.executeInstanceAction), f = we((E) => E.executeInstanceActions), p = we((E) => E.setInstanceDecision), h = we((E) => E.setInstanceObservation), w = we((E) => E.updateInstance), g = we(
    (E) => E.updateNavigationPosition
  ), _ = t.navigation?.state === "moving", b = t.volume ?? z1, S = Math.max(0.05, b.height * 0.5 - b.radius), m = S + b.radius, y = _ ? "kinematicPosition" : "fixed", v = Math.max(b.interactionRadius, b.radius), C = ee(0);
  oe(() => {
    a.current = t.navigation?.currentIndex ?? 0;
  }, [t.navigation?.waypoints]), $e((E, G) => {
    if (!_ || !t.navigation) return;
    const I = r.current;
    if (!I) return;
    const { waypoints: $, speed: R } = t.navigation, L = a.current;
    if (L >= $.length) return;
    const M = $[L];
    if (!M) return;
    const F = I.translation(), U = M[0] - F.x, V = M[2] - F.z, Y = Math.sqrt(U * U + V * V);
    if (Y < D1) {
      a.current = L + 1, L + 1 >= $.length && g(t.id, [M[0], M[1], M[2]]), u(t.id);
      return;
    }
    const Z = Math.min(R * G, Y), J = F.x + U / Y * Z, q = F.z + V / Y * Z;
    if (I.setNextKinematicTranslation({ x: J, y: F.y, z: q }), o.current && Y > 0.01) {
      const A = Math.atan2(U, V);
      o.current.rotation.y = A;
    }
  }), $e((E) => {
    if ((t.brain?.mode ?? "none") === "none" || E.clock.elapsedTime < C.current) return;
    const $ = r.current?.translation(), R = $ ? { ...t, position: [$.x, $.y, $.z] } : t, L = S1(
      R,
      we.getState().instances,
      E.clock.elapsedTime
    );
    h(t.id, L);
    const M = N1(R, L);
    M && M.actions.length > 0 && (p(t.id, M), f(t.id, M.actions)), C.current = E.clock.elapsedTime + Math.max(0.5, t.behavior?.waitSeconds ?? 1);
  });
  const T = ce((E) => {
    E.stopPropagation(), document.body.style.cursor = "pointer";
    const G = o.current?.__handlers;
    G?.pointerover && G.pointerover();
  }, []), P = ce(() => {
    document.body.style.cursor = "default";
  }, []), D = ce((E) => {
    const G = t.events?.find(($) => $.type === E);
    if (!G) return;
    const I = G.payload;
    if (G.action === "dialogue" && I?.type === "dialogue") {
      d(t.id, {
        type: "speak",
        text: I.text,
        ...I.duration !== void 0 ? { duration: I.duration } : {}
      });
      return;
    }
    if (G.action === "animation" && I?.type === "animation") {
      d(t.id, {
        type: "playAnimation",
        animationId: I.animationId,
        ...I.loop !== void 0 ? { loop: I.loop } : {}
      });
      return;
    }
    if (G.action === "custom" && I?.type === "custom") {
      d(t.id, {
        type: "remember",
        key: `event:${G.id}`,
        value: I.data
      });
      return;
    }
    G.action === "sound" && I?.type === "sound" && w(t.id, {
      metadata: {
        ...t.metadata,
        lastInteractionTargetId: I.soundUrl
      }
    });
  }, [d, t.events, t.id, t.metadata, w]);
  oe(() => {
    if (!t.events || t.events.length === 0) return;
    const E = o.current;
    if (!E) return;
    const G = () => {
      D("onHover");
    }, I = () => {
      D("onClick");
    };
    return E.__handlers = {
      pointerover: G,
      click: I
    }, () => {
      delete E.__handlers;
    };
  }, [t.events, D]);
  const O = X(() => {
    if (!l) return [];
    const E = [...l.baseParts];
    if (c && E.push(...c.parts), l.accessoryParts && E.push(...l.accessoryParts), t.customParts)
      for (const G of t.customParts) {
        const I = E.findIndex(($) => $.type === G.type);
        I >= 0 ? E[I] = { ...E[I], ...G } : E.push(G);
      }
    return E;
  }, [l, c, t.customParts]);
  if (!l)
    return null;
  const z = l.fullModelUrl || t.metadata?.modelUrl;
  return z ? /* @__PURE__ */ x(
    Ip,
    {
      ref: r,
      url: z,
      isActive: !1,
      componentType: "character",
      name: `npc-${t.id}`,
      position: t.position,
      rotation: t.rotation,
      rigidbodyType: y,
      colliderSize: { height: b.height, radius: b.radius },
      currentAnimation: t.currentAnimation || "idle",
      userData: {
        instanceId: t.id,
        templateId: t.templateId,
        nameTag: t.metadata?.nameTag,
        npcBrainMode: t.brain?.mode ?? "none",
        npcPerceptionEnabled: t.perception?.enabled ?? !1
      },
      onCollisionEnter: () => {
        D("onClick"), i && i();
      },
      children: [
        /* @__PURE__ */ s(
          ra,
          {
            sensor: !0,
            args: [Math.max(0.05, S), v],
            position: [0, m, 0]
          }
        ),
        n && /* @__PURE__ */ x("mesh", { position: [0, 2.5, 0], children: [
          /* @__PURE__ */ s("boxGeometry", { args: [0.5, 0.5, 0.5] }),
          /* @__PURE__ */ s("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
        ] })
      ]
    }
  ) : /* @__PURE__ */ x(
    Wr,
    {
      ref: r,
      type: y,
      position: t.position,
      rotation: t.rotation,
      colliders: !1,
      userData: {
        instanceId: t.id,
        templateId: t.templateId,
        npcBrainMode: t.brain?.mode ?? "none",
        npcPerceptionEnabled: t.perception?.enabled ?? !1
      },
      children: [
        /* @__PURE__ */ s(ra, { args: [S, b.radius], position: [0, m, 0] }),
        /* @__PURE__ */ s(
          ra,
          {
            sensor: !0,
            args: [Math.max(0.05, S), v],
            position: [0, m, 0]
          }
        ),
        /* @__PURE__ */ x(
          "group",
          {
            ref: o,
            scale: t.scale,
            ...i ? {
              onClick: (E) => {
                E.stopPropagation(), E.nativeEvent.preventDefault(), D("onClick"), i();
              }
            } : {},
            onPointerEnter: T,
            onPointerLeave: P,
            children: [
              O.map((E) => /* @__PURE__ */ s(
                R1,
                {
                  part: E,
                  instanceId: t.id,
                  currentAnimation: t.currentAnimation ?? t.behavior?.idleAnimation ?? "idle"
                },
                E.id
              )),
              n && /* @__PURE__ */ x("mesh", { position: [0, 2.5, 0], children: [
                /* @__PURE__ */ s("boxGeometry", { args: [0.5, 0.5, 0.5] }),
                /* @__PURE__ */ s("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
              ] })
            ]
          }
        )
      ]
    }
  );
});
function F1({
  layout: e = "default",
  npcTemplatesArray: t,
  selectedNPCTemplateId: n,
  setSelectedNPCTemplate: i,
  npcInstancesArray: o,
  selectedNPCInstanceId: r,
  setSelectedNPCInstance: a,
  selectedNPCInstance: l,
  npcAnimationsArray: c,
  selectedNPCBrainBlueprint: u,
  npcBrainBlueprintsArray: d,
  hoverPosition: f,
  updateNPCBehavior: p,
  setNPCNavigation: h,
  clearNPCNavigation: w,
  updateNPCInstance: g,
  updateNPCBrain: _,
  addNPCBrainBlueprint: b,
  updateNPCBrainBlueprint: S,
  updateNPCPerception: m
}) {
  const [y, v] = ge.useState("movement"), [C, T] = ge.useState({
    mode: "idle",
    label: "대기"
  }), P = ge.useMemo(
    () => o.findIndex((Z) => Z.id === r),
    [o, r]
  ), D = P >= 0, O = ge.useCallback(() => {
    if (o.length === 0) return;
    const Z = D ? (P - 1 + o.length) % o.length : 0, J = o[Z];
    J && a(J.id);
  }, [D, o, P, a]), z = ge.useCallback(() => {
    if (o.length === 0) return;
    const Z = D ? (P + 1) % o.length : 0, J = o[Z];
    J && a(J.id);
  }, [D, o, P, a]), E = ge.useMemo(() => l ? y === "movement" ? /* @__PURE__ */ s(
    Sc,
    {
      instance: l,
      hoverPosition: f,
      updateBehavior: p,
      setNavigation: h,
      clearNavigation: w
    }
  ) : y === "animation" ? /* @__PURE__ */ s(
    Mc,
    {
      instance: l,
      animations: c,
      updateInstance: g,
      updateBehavior: p
    }
  ) : /* @__PURE__ */ s(
    Cc,
    {
      instance: l,
      updateBrain: _,
      updatePerception: m
    }
  ) : null, [
    y,
    w,
    f,
    c,
    l,
    h,
    p,
    _,
    g,
    m
  ]), G = l ? /* @__PURE__ */ s(
    Sc,
    {
      instance: l,
      hoverPosition: f,
      updateBehavior: p,
      setNavigation: h,
      clearNavigation: w
    }
  ) : null, I = l ? /* @__PURE__ */ s(
    Mc,
    {
      instance: l,
      animations: c,
      updateInstance: g,
      updateBehavior: p
    }
  ) : null, $ = l ? /* @__PURE__ */ s(
    Cc,
    {
      instance: l,
      updateBrain: _,
      updatePerception: m
    }
  ) : null, R = /* @__PURE__ */ x("div", { className: "building-panel__asset-targets building-panel__npc-summary building-panel__npc-statusbar", children: [
    /* @__PURE__ */ x("span", { children: [
      "선택 NPC: ",
      l?.name ?? r ?? "선택 없음"
    ] }),
    /* @__PURE__ */ x("span", { children: [
      "행동: ",
      l?.behavior?.mode ?? "idle",
      " · 이동: ",
      l?.navigation?.state ?? "없음"
    ] }),
    /* @__PURE__ */ x("span", { children: [
      "현재 애니메이션: ",
      l?.currentAnimation ?? "idle"
    ] })
  ] }), L = /* @__PURE__ */ x("div", { className: "building-panel__npc-switcher", children: [
    /* @__PURE__ */ s("button", { className: "building-panel__segment-btn", onClick: O, disabled: o.length < 2, children: "이전 NPC" }),
    /* @__PURE__ */ s("span", { children: D ? `${P + 1} / ${o.length}` : `0 / ${o.length}` }),
    /* @__PURE__ */ s("button", { className: "building-panel__segment-btn", onClick: z, disabled: o.length < 2, children: "다음 NPC" })
  ] }), M = /* @__PURE__ */ x("div", { className: "building-panel__npc-head", children: [
    /* @__PURE__ */ x("div", { className: "building-panel__npc-head-block", children: [
      /* @__PURE__ */ s("div", { className: "building-panel__section-subtitle", children: "템플릿" }),
      /* @__PURE__ */ s("div", { className: "building-panel__npc-chip-list", children: t.map((Z) => /* @__PURE__ */ s(
        "button",
        {
          className: `building-panel__grid-btn ${n === Z.id ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => i(Z.id),
          children: Z.name
        },
        Z.id
      )) })
    ] }),
    /* @__PURE__ */ x("div", { className: "building-panel__npc-head-block", children: [
      /* @__PURE__ */ s("div", { className: "building-panel__section-subtitle", children: "NPC 선택" }),
      /* @__PURE__ */ s("div", { className: "building-panel__npc-chip-list", children: o.map((Z) => /* @__PURE__ */ s(
        "button",
        {
          className: `building-panel__grid-btn ${r === Z.id ? "building-panel__grid-btn--active" : ""}`,
          onClick: () => a(Z.id),
          children: Z.name
        },
        Z.id
      )) })
    ] })
  ] }), F = l ? /* @__PURE__ */ x("div", { className: "building-panel__npc-modal-controls", children: [
    /* @__PURE__ */ x("div", { className: "building-panel__brain-tabs", children: [
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: `building-panel__brain-tab ${y === "movement" ? "building-panel__brain-tab--active" : ""}`,
          onClick: () => v("movement"),
          children: "이동"
        }
      ),
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: `building-panel__brain-tab ${y === "animation" ? "building-panel__brain-tab--active" : ""}`,
          onClick: () => v("animation"),
          children: "애니메이션"
        }
      ),
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          className: `building-panel__brain-tab ${y === "perception" ? "building-panel__brain-tab--active" : ""}`,
          onClick: () => v("perception"),
          children: "지각"
        }
      )
    ] }),
    E
  ] }) : null, U = l ? /* @__PURE__ */ x("div", { className: "building-panel__npc-card", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "미니 프리뷰 캔버스" }),
    /* @__PURE__ */ x("div", { className: "building-panel__asset-targets", children: [
      /* @__PURE__ */ x("span", { children: [
        "노드 프리뷰: ",
        C.label
      ] }),
      C.animationId && /* @__PURE__ */ x("span", { children: [
        "애니메이션: ",
        C.animationId
      ] })
    ] }),
    /* @__PURE__ */ s("div", { className: "building-panel__npc-avatar-canvas", children: /* @__PURE__ */ s(
      L1,
      {
        state: C,
        instance: l
      }
    ) })
  ] }) : null, V = l ? /* @__PURE__ */ s(
    o1,
    {
      instance: l,
      blueprints: d,
      selectedBlueprint: u,
      updateBrain: _,
      addBrainBlueprint: b,
      updateBrainBlueprint: S,
      onPreviewStateChange: T
    }
  ) : null, Y = /* @__PURE__ */ x(be, { children: [
    t.length === 0 && /* @__PURE__ */ s("div", { className: "building-panel__empty", children: "사용 가능한 NPC 템플릿이 없습니다." }),
    o.length === 0 && /* @__PURE__ */ s("div", { className: "building-panel__empty", children: "월드에 NPC를 배치하면 상세 편집이 열립니다." })
  ] });
  return e === "split" ? /* @__PURE__ */ x("div", { className: "building-panel__section building-panel__npc-shell building-panel__npc-shell--split", children: [
    /* @__PURE__ */ x("div", { className: "building-panel__npc-pane building-panel__npc-pane--left", children: [
      /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "선택" }),
      R,
      L,
      M,
      Y
    ] }),
    /* @__PURE__ */ x("div", { className: "building-panel__npc-board", children: [
      /* @__PURE__ */ x("div", { className: "building-panel__npc-pane building-panel__npc-pane--movement", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "이동" }),
        G
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__npc-pane building-panel__npc-pane--animation", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "애니메이션" }),
        I
      ] }),
      /* @__PURE__ */ x("div", { className: "building-panel__npc-pane building-panel__npc-pane--perception", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "지각" }),
        $
      ] })
    ] }),
    /* @__PURE__ */ x("div", { className: "building-panel__npc-pane building-panel__npc-pane--right", children: [
      /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "두뇌/프리뷰" }),
      U,
      V
    ] })
  ] }) : e === "sidebars" ? /* @__PURE__ */ x("div", { className: "building-panel__section building-panel__npc-shell building-panel__npc-shell--sidebars", children: [
    /* @__PURE__ */ x("aside", { className: "building-panel__npc-side building-panel__npc-side--left", children: [
      /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "NPC 선택" }),
      R,
      L,
      M,
      /* @__PURE__ */ x("div", { className: "building-panel__npc-board", children: [
        /* @__PURE__ */ x("div", { className: "building-panel__npc-pane building-panel__npc-pane--movement", children: [
          /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "이동" }),
          G
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__npc-pane building-panel__npc-pane--animation", children: [
          /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "애니메이션" }),
          I
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__npc-pane building-panel__npc-pane--perception", children: [
          /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "지각" }),
          $
        ] })
      ] }),
      Y
    ] }),
    /* @__PURE__ */ s("aside", { className: "building-panel__npc-side building-panel__npc-side--right", children: /* @__PURE__ */ x("div", { className: "building-panel__npc-pane building-panel__npc-pane--brain", children: [
      /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "두뇌/프리뷰" }),
      U,
      V
    ] }) })
  ] }) : /* @__PURE__ */ x("div", { className: "building-panel__section building-panel__npc-shell building-panel__npc-shell--modal", children: [
    /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "NPC 에디터" }),
    R,
    L,
    M,
    l && /* @__PURE__ */ x("div", { className: "building-panel__npc-workspace building-panel__npc-workspace--modal", children: [
      /* @__PURE__ */ s("div", { className: "building-panel__npc-column building-panel__npc-column--controls", children: F }),
      /* @__PURE__ */ x("div", { className: "building-panel__npc-column building-panel__npc-column--brain", children: [
        U,
        V
      ] })
    ] }),
    Y
  ] });
}
const kc = 0.25;
function Pc(e, t) {
  const n = (e[0] - t[0]) * kc, i = (e[2] - t[2]) * kc;
  return [Math.max(-2.8, Math.min(2.8, n)), Math.max(-2.8, Math.min(2.8, i))];
}
function L1({
  state: e,
  instance: t
}) {
  const n = t.position, i = ge.useMemo(() => {
    const r = t.templateId?.trim();
    return r || "ally";
  }, [t.templateId]), o = ge.useMemo(() => {
    const r = `preview-${n.join("-")}`, a = e.waypoints && e.waypoints.length > 0 ? e.waypoints : [
      [n[0] + 2, n[1], n[2]],
      [n[0], n[1], n[2] + 2],
      [n[0] - 2, n[1], n[2]],
      [n[0], n[1], n[2] - 2]
    ], l = e.mode === "move" && e.target ? {
      waypoints: [e.target],
      currentIndex: 0,
      speed: 1.7,
      state: "moving"
    } : e.mode === "patrol" ? {
      waypoints: a,
      currentIndex: 0,
      speed: 1.6,
      state: "moving"
    } : e.mode === "wander" ? {
      waypoints: a,
      currentIndex: 0,
      speed: 1.3,
      state: "moving"
    } : void 0;
    return {
      id: r,
      templateId: i,
      name: `${t.name}-preview`,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: t.scale ?? [1, 1, 1],
      currentAnimation: e.animationId ?? t.currentAnimation ?? "idle",
      ...t.currentClothingSetId ? { currentClothingSetId: t.currentClothingSetId } : {},
      ...t.customParts ? { customParts: t.customParts } : {},
      ...t.metadata ? { metadata: t.metadata } : {},
      brain: { mode: "none" },
      behavior: {
        mode: e.mode === "patrol" ? "patrol" : e.mode === "wander" ? "wander" : "idle",
        speed: 1.6
      },
      ...l ? { navigation: l } : {}
    };
  }, [t, n, e.animationId, e.mode, e.target, e.waypoints, i]);
  return /* @__PURE__ */ x(Hp, { camera: { position: [0, 6.2, 11.5], fov: 34, near: 0.1, far: 120 }, children: [
    /* @__PURE__ */ s("ambientLight", { intensity: 0.72 }),
    /* @__PURE__ */ s("directionalLight", { position: [5, 8, 4], intensity: 1 }),
    /* @__PURE__ */ s("gridHelper", { args: [8, 16, "#3b82f6", "#1e293b"] }),
    /* @__PURE__ */ x("mesh", { rotation: [-Math.PI / 2, 0, 0], position: [0, -0.01, 0], receiveShadow: !0, children: [
      /* @__PURE__ */ s("circleGeometry", { args: [3.2, 48] }),
      /* @__PURE__ */ s("meshStandardMaterial", { color: "#0f172a" })
    ] }),
    /* @__PURE__ */ s(Gp, { gravity: [0, 0, 0], children: /* @__PURE__ */ s(uf, { instance: o, isEditMode: !1 }) }),
    /* @__PURE__ */ s($1, { state: e, origin: n })
  ] });
}
function $1({
  state: e,
  origin: t
}) {
  const n = e.target ? Pc(e.target, t) : null;
  return /* @__PURE__ */ x("group", { children: [
    n && /* @__PURE__ */ x("mesh", { position: [n[0], 0.12, n[1]], children: [
      /* @__PURE__ */ s("sphereGeometry", { args: [0.08, 12, 12] }),
      /* @__PURE__ */ s("meshStandardMaterial", { color: "#38bdf8" })
    ] }),
    (e.waypoints ?? []).map((i, o) => {
      const r = Pc(i, t);
      return /* @__PURE__ */ x("mesh", { position: [r[0], 0.1, r[1]], children: [
        /* @__PURE__ */ s("sphereGeometry", { args: [0.06, 10, 10] }),
        /* @__PURE__ */ s("meshStandardMaterial", { color: "#34d399" })
      ] }, `${i.join("-")}-${o}`);
    }),
    e.mode === "wander" && /* @__PURE__ */ x("mesh", { rotation: [-Math.PI / 2, 0, 0], position: [0, 0.03, 0], children: [
      /* @__PURE__ */ s("ringGeometry", { args: [Math.max(0.35, (e.radius ?? 4) * 0.16), Math.max(0.45, (e.radius ?? 4) * 0.16 + 0.07), 48] }),
      /* @__PURE__ */ s("meshStandardMaterial", { color: "#f59e0b", transparent: !0, opacity: 0.55 })
    ] })
  ] });
}
const _o = [
  { id: "door-basic", label: "Door", category: "structure", fallbackKind: "door", defaultScale: 1, defaultColor: "#8b5a2b", modelUrl: "gltf/props/door.glb" },
  { id: "window-basic", label: "Window", category: "structure", fallbackKind: "window", defaultScale: 1, defaultColor: "#9fd3ff", modelUrl: "gltf/props/window.glb" },
  { id: "fence-basic", label: "Fence", category: "structure", fallbackKind: "fence", defaultScale: 1, defaultColor: "#8f6a3d", modelUrl: "gltf/props/fence.glb" },
  { id: "lamp-basic", label: "Lamp", category: "utility", fallbackKind: "lamp", defaultScale: 1, defaultColor: "#ffd166", modelUrl: "gltf/props/lamp.glb" },
  { id: "chair-basic", label: "Chair", category: "furniture", fallbackKind: "chair", defaultScale: 1, defaultColor: "#a6784f", modelUrl: "gltf/props/chair.glb" },
  { id: "table-basic", label: "Table", category: "furniture", fallbackKind: "table", defaultScale: 1, defaultColor: "#9b6b43", modelUrl: "gltf/props/table.glb" },
  { id: "bed-basic", label: "Bed", category: "furniture", fallbackKind: "bed", defaultScale: 1, defaultColor: "#7aa2ff", modelUrl: "gltf/props/bed.glb" },
  { id: "storage-basic", label: "Storage", category: "furniture", fallbackKind: "storage", defaultScale: 1, defaultColor: "#7c5c3e", modelUrl: "gltf/props/storage.glb" },
  { id: "mailbox-basic", label: "Mailbox", category: "utility", fallbackKind: "mailbox", defaultScale: 1, defaultColor: "#d04f45", modelUrl: "gltf/props/mailbox.glb" },
  { id: "crafting-basic", label: "Crafting Station", category: "utility", fallbackKind: "crafting", defaultScale: 1, defaultColor: "#b68553", modelUrl: "gltf/props/crafting.glb" },
  { id: "shop-stall-basic", label: "Shop Stall", category: "shop", fallbackKind: "shop", defaultScale: 1, defaultColor: "#d88f45", modelUrl: "gltf/props/shop-stall.glb" }
];
function Ks(e) {
  return _o.find((t) => t.id === e);
}
function O1() {
  const e = j((H) => H.editMode), t = j((H) => H.setEditMode), n = j((H) => H.selectedWallId), i = j((H) => H.selectedTileId), o = j((H) => H.selectedBlockId), r = j((H) => H.selectedWallGroupId), a = j((H) => H.hoverPosition), l = j((H) => H.currentTileMultiplier), c = j((H) => H.setTileMultiplier), u = j((H) => H.currentTileHeight), d = j((H) => H.setTileHeight), f = j((H) => H.currentTileShape), p = j((H) => H.setTileShape), h = j((H) => H.currentTileRotation), w = j((H) => H.setTileRotation), g = j((H) => H.currentTileMaterialId), _ = j((H) => H.setCurrentTileMaterialId), b = j((H) => H.currentCustomTileName), S = j((H) => H.currentCustomTileColor), m = j((H) => H.currentCustomTileTextureUrl), y = j((H) => H.setCustomTileDraft), v = j((H) => H.applyTilePreset), C = j((H) => H.applyCustomTile), T = j((H) => H.currentWallRotation), P = j((H) => H.setWallRotation), D = j((H) => H.currentWallKind), O = j((H) => H.setWallKind), z = j((H) => H.applyWallPreset), E = j((H) => H.selectedTileObjectType), G = j((H) => H.setSelectedTileObjectType), I = j((H) => H.currentTerrainColor), $ = j((H) => H.currentTerrainAccentColor), R = j((H) => H.setTerrainColors), L = j((H) => H.selectedPlacedObjectType), M = j((H) => H.setSelectedPlacedObjectType), F = j((H) => H.selectedModelObjectId), U = j((H) => H.setSelectedModelObjectId), V = j((H) => H.currentModelUrl), Y = j((H) => H.setModelUrl), Z = j((H) => H.currentModelScale), J = j((H) => H.setModelScale), q = j((H) => H.currentModelColor), A = j((H) => H.setModelColor), N = j((H) => H.snapToGrid), W = j((H) => H.setSnapToGrid), K = j((H) => H.currentFlagWidth), Q = j((H) => H.currentFlagHeight), ne = j((H) => H.currentFlagImageUrl), re = j((H) => H.setFlagWidth), ae = j((H) => H.setFlagHeight), se = j((H) => H.setFlagImageUrl), te = j((H) => H.currentFlagStyle), he = j((H) => H.setFlagStyle), ye = j((H) => H.currentFireIntensity), _e = j((H) => H.currentFireWidth), Me = j((H) => H.currentFireHeight), Pe = j((H) => H.currentFireColor), Ce = j((H) => H.setFireIntensity), Re = j((H) => H.setFireWidth), Oe = j((H) => H.setFireHeight), xt = j((H) => H.setFireColor), nt = j((H) => H.currentObjectRotation), Qe = j((H) => H.setObjectRotation), it = j((H) => H.selectedTileGroupId), Lt = j((H) => H.tileGroups), on = j((H) => H.wallGroups), $t = j((H) => H.meshes), Ln = j((H) => H.addMesh), $n = j((H) => H.updateMesh), On = j((H) => H.updateWall), Hn = j((H) => H.updateTile), Gn = j((H) => H.setCurrentWallMaterialId), Wn = j((H) => H.removeWall), Un = j((H) => H.removeTile), _t = j((H) => H.removeBlock), ct = j((H) => H.currentBillboardText), St = j((H) => H.currentBillboardImageUrl), ot = j((H) => H.currentBillboardColor), Ot = j((H) => H.currentBillboardWidth), rn = j((H) => H.currentBillboardHeight), an = j((H) => H.currentBillboardScale), Ht = j((H) => H.currentBillboardOffsetY), sn = j((H) => H.currentBillboardElevation), ln = j((H) => H.currentBillboardIntensity), jn = j((H) => H.setBillboardText), Vn = j((H) => H.setBillboardImageUrl), Zn = j((H) => H.setBillboardColor), Yn = j((H) => H.setBillboardWidth), cn = j((H) => H.setBillboardHeight), un = j((H) => H.setBillboardScale), Xn = j((H) => H.setBillboardOffsetY), Kn = j((H) => H.setBillboardElevation), qn = j((H) => H.setBillboardIntensity), Qn = j((H) => H.currentObjectPrimaryColor), dn = j((H) => H.currentObjectSecondaryColor), fn = j((H) => H.currentTreeKind), pn = j((H) => H.setObjectPrimaryColor), Gt = j((H) => H.setObjectSecondaryColor), hn = j((H) => H.setTreeKind), mn = j((H) => H.showSnow), Jn = j((H) => H.setShowSnow), ei = j((H) => H.showFog), Wt = j((H) => H.setShowFog), ti = j((H) => H.fogColor), Ut = j((H) => H.setFogColor), ni = j((H) => H.weatherEffect), gn = j((H) => H.setWeatherEffect), bn = we((H) => H.templates), jt = we((H) => H.instances), yn = we((H) => H.animations), Mt = we((H) => H.brainBlueprints), Ct = we((H) => H.selectedTemplateId), ii = we((H) => H.selectedInstanceId), rt = we((H) => H.setSelectedTemplate), ut = we((H) => H.setSelectedInstance), Ye = we((H) => H.updateInstance), at = we((H) => H.setNavigation), je = we((H) => H.clearNavigation), Nt = we((H) => H.updateInstanceBehavior), oi = we((H) => H.updateInstanceBrain), ri = we((H) => H.updateInstancePerception), It = we((H) => H.addBrainBlueprint), ai = we((H) => H.updateBrainBlueprint), vn = we((H) => H.initializeDefaults), Vt = Pn((H) => H.ids), Tt = Pn((H) => H.records), Zt = X(
    () => Vt.map((H) => Tt[H]).filter((H) => !!H).filter(Bw),
    [Vt, Tt]
  ), dt = X(() => Array.from(bn.values()), [bn]), Yt = X(() => Array.from(jt.values()), [jt]), Et = X(() => Array.from(yn.values()), [yn]), wn = X(() => Array.from(Mt.values()), [Mt]);
  return {
    editMode: e,
    setEditMode: t,
    selectedWallId: n,
    selectedTileId: i,
    selectedBlockId: o,
    selectedWallGroupId: r,
    hoverPosition: a,
    currentTileMultiplier: l,
    setTileMultiplier: c,
    currentTileHeight: u,
    setTileHeight: d,
    currentTileShape: f,
    setTileShape: p,
    currentTileRotation: h,
    setTileRotation: w,
    currentTileMaterialId: g,
    setCurrentTileMaterialId: _,
    currentCustomTileName: b,
    currentCustomTileColor: S,
    currentCustomTileTextureUrl: m,
    setCustomTileDraft: y,
    applyTilePreset: v,
    applyCustomTile: C,
    currentWallRotation: T,
    setWallRotation: P,
    currentWallKind: D,
    setWallKind: O,
    applyWallPreset: z,
    selectedTileObjectType: E,
    setSelectedTileObjectType: G,
    currentTerrainColor: I,
    currentTerrainAccentColor: $,
    setTerrainColors: R,
    selectedPlacedObjectType: L,
    setSelectedPlacedObjectType: M,
    selectedModelObjectId: F,
    setSelectedModelObjectId: U,
    currentModelUrl: V,
    setModelUrl: Y,
    currentModelScale: Z,
    setModelScale: J,
    currentModelColor: q,
    setModelColor: A,
    snapToGrid: N,
    setSnapToGrid: W,
    currentFlagWidth: K,
    currentFlagHeight: Q,
    currentFlagImageUrl: ne,
    setFlagWidth: re,
    setFlagHeight: ae,
    setFlagImageUrl: se,
    currentFlagStyle: te,
    setFlagStyle: he,
    currentFireIntensity: ye,
    currentFireWidth: _e,
    currentFireHeight: Me,
    currentFireColor: Pe,
    setFireIntensity: Ce,
    setFireWidth: Re,
    setFireHeight: Oe,
    setFireColor: xt,
    currentObjectRotation: nt,
    setObjectRotation: Qe,
    selectedTileGroupId: it,
    tileGroups: Lt,
    wallGroups: on,
    meshes: $t,
    addMesh: Ln,
    updateMesh: $n,
    updateWall: On,
    updateTile: Hn,
    setCurrentWallMaterialId: Gn,
    removeWall: Wn,
    removeTile: Un,
    removeBlock: _t,
    currentBillboardText: ct,
    currentBillboardImageUrl: St,
    currentBillboardColor: ot,
    currentBillboardWidth: Ot,
    currentBillboardHeight: rn,
    currentBillboardScale: an,
    currentBillboardOffsetY: Ht,
    currentBillboardElevation: sn,
    currentBillboardIntensity: ln,
    setBillboardText: jn,
    setBillboardImageUrl: Vn,
    setBillboardColor: Zn,
    setBillboardWidth: Yn,
    setBillboardHeight: cn,
    setBillboardScale: un,
    setBillboardOffsetY: Xn,
    setBillboardElevation: Kn,
    setBillboardIntensity: qn,
    currentObjectPrimaryColor: Qn,
    currentObjectSecondaryColor: dn,
    currentTreeKind: fn,
    setObjectPrimaryColor: pn,
    setObjectSecondaryColor: Gt,
    setTreeKind: hn,
    showSnow: mn,
    setShowSnow: Jn,
    showFog: ei,
    setShowFog: Wt,
    fogColor: ti,
    setFogColor: Ut,
    weatherEffect: ni,
    setWeatherEffect: gn,
    npcInstances: jt,
    npcBrainBlueprints: Mt,
    selectedNPCTemplateId: Ct,
    selectedNPCInstanceId: ii,
    setSelectedNPCTemplate: rt,
    setSelectedNPCInstance: ut,
    updateNPCInstance: Ye,
    setNPCNavigation: at,
    clearNPCNavigation: je,
    updateNPCBehavior: Nt,
    updateNPCBrain: oi,
    updateNPCPerception: ri,
    addNPCBrainBlueprint: It,
    updateNPCBrainBlueprint: ai,
    initializeNPCDefaults: vn,
    buildingAssets: Zt,
    npcTemplatesArray: dt,
    npcInstancesArray: Yt,
    npcAnimationsArray: Et,
    npcBrainBlueprintsArray: wn
  };
}
const $i = ({
  className: e = "",
  style: t,
  children: n,
  slots: i = {},
  actions: o = [],
  disabledSections: r = [],
  forcedEditMode: a,
  npcLayout: l = "default",
  npcPanel: c,
  hideHeader: u = !1
}) => {
  const d = X(() => new Set(r), [r]), {
    editMode: f,
    setEditMode: p,
    selectedWallId: h,
    selectedTileId: w,
    selectedBlockId: g,
    selectedWallGroupId: _,
    hoverPosition: b,
    currentTileMultiplier: S,
    setTileMultiplier: m,
    currentTileHeight: y,
    setTileHeight: v,
    currentTileShape: C,
    setTileShape: T,
    currentTileRotation: P,
    setTileRotation: D,
    currentTileMaterialId: O,
    setCurrentTileMaterialId: z,
    currentCustomTileName: E,
    currentCustomTileColor: G,
    currentCustomTileTextureUrl: I,
    setCustomTileDraft: $,
    applyTilePreset: R,
    applyCustomTile: L,
    currentWallRotation: M,
    setWallRotation: F,
    currentWallKind: U,
    setWallKind: V,
    applyWallPreset: Y,
    selectedTileObjectType: Z,
    setSelectedTileObjectType: J,
    currentTerrainColor: q,
    currentTerrainAccentColor: A,
    setTerrainColors: N,
    selectedPlacedObjectType: W,
    setSelectedPlacedObjectType: K,
    selectedModelObjectId: Q,
    setSelectedModelObjectId: ne,
    currentModelUrl: re,
    setModelUrl: ae,
    currentModelScale: se,
    setModelScale: te,
    currentModelColor: he,
    setModelColor: ye,
    snapToGrid: _e,
    setSnapToGrid: Me,
    currentFlagWidth: Pe,
    currentFlagHeight: Ce,
    currentFlagImageUrl: Re,
    setFlagWidth: Oe,
    setFlagHeight: xt,
    setFlagImageUrl: nt,
    currentFlagStyle: Qe,
    setFlagStyle: it,
    currentFireIntensity: Lt,
    currentFireWidth: on,
    currentFireHeight: $t,
    currentFireColor: Ln,
    setFireIntensity: $n,
    setFireWidth: On,
    setFireHeight: Hn,
    setFireColor: Gn,
    currentObjectRotation: Wn,
    setObjectRotation: Un,
    selectedTileGroupId: _t,
    tileGroups: ct,
    wallGroups: St,
    meshes: ot,
    addMesh: Ot,
    updateMesh: rn,
    updateWall: an,
    updateTile: Ht,
    setCurrentWallMaterialId: sn,
    removeWall: ln,
    removeTile: jn,
    removeBlock: Vn,
    currentBillboardText: Zn,
    currentBillboardImageUrl: Yn,
    currentBillboardColor: cn,
    currentBillboardWidth: un,
    currentBillboardHeight: Xn,
    currentBillboardScale: Kn,
    currentBillboardOffsetY: qn,
    currentBillboardElevation: Qn,
    currentBillboardIntensity: dn,
    setBillboardText: fn,
    setBillboardImageUrl: pn,
    setBillboardColor: Gt,
    setBillboardWidth: hn,
    setBillboardHeight: mn,
    setBillboardScale: Jn,
    setBillboardOffsetY: ei,
    setBillboardElevation: Wt,
    setBillboardIntensity: ti,
    currentObjectPrimaryColor: Ut,
    currentObjectSecondaryColor: ni,
    currentTreeKind: gn,
    setObjectPrimaryColor: bn,
    setObjectSecondaryColor: jt,
    setTreeKind: yn,
    showSnow: Mt,
    setShowSnow: Ct,
    showFog: ii,
    setShowFog: rt,
    fogColor: ut,
    setFogColor: Ye,
    weatherEffect: at,
    setWeatherEffect: je,
    npcInstances: Nt,
    npcBrainBlueprints: oi,
    selectedNPCTemplateId: ri,
    selectedNPCInstanceId: It,
    setSelectedNPCTemplate: ai,
    setSelectedNPCInstance: vn,
    updateNPCInstance: Vt,
    setNPCNavigation: Tt,
    clearNPCNavigation: Zt,
    updateNPCBehavior: dt,
    updateNPCBrain: Yt,
    updateNPCPerception: Et,
    addNPCBrainBlueprint: wn,
    updateNPCBrainBlueprint: H,
    initializeNPCDefaults: Oi,
    buildingAssets: k,
    npcTemplatesArray: pe,
    npcInstancesArray: Ve,
    npcAnimationsArray: ft,
    npcBrainBlueprintsArray: Lo
  } = O1(), vi = c !== !1, Hi = [
    { type: "none", label: "없음", description: "건축 편집을 끕니다" },
    { type: "world", label: "전역", description: "전역 설정을 배치합니다" },
    { type: "wall", label: "벽", description: "벽 조각을 배치합니다" },
    { type: "tile", label: "타일", description: "바닥 타일을 배치합니다" },
    { type: "block", label: "박스", description: "복셀 박스를 쌓습니다" },
    { type: "object", label: "오브젝트", description: "타일 위에 장식을 배치합니다" },
    ...vi ? [{ type: "npc", label: "NPC", description: "NPC를 배치합니다" }] : []
  ], ml = [
    { value: 0, label: "0도" },
    { value: Math.PI / 2, label: "90도" },
    { value: Math.PI, label: "180도" },
    { value: Math.PI * 1.5, label: "270도" }
  ], dp = X(() => {
    const ie = /* @__PURE__ */ new Map();
    for (const Te of St.values())
      for (const Ee of Te.walls)
        ie.set(Ee.id, Te.id);
    return ie;
  }, [St]), fp = X(() => {
    const ie = /* @__PURE__ */ new Map();
    for (const Te of ct.values())
      for (const Ee of Te.tiles)
        ie.set(Ee.id, Te.id);
    return ie;
  }, [ct]), Je = h ? St.get(dp.get(h) ?? "") : St.get(_ ?? ""), He = w ? ct.get(fp.get(w) ?? "") : ct.get(_t ?? ""), na = w ? He?.tiles.find((ie) => ie.id === w) : void 0, ia = h ? Je?.walls.find((ie) => ie.id === h) : void 0, xn = a ?? f, pp = Hi.find((ie) => ie.type === xn)?.label ?? xn, hp = Ss.find((ie) => ie.type === (ia?.wallKind ?? U))?.labelKo ?? U, Gi = Ks(Q) ?? _o[0], oa = It ? Nt.get(It) : void 0, mp = oa?.brain?.blueprintId ? oi.get(oa.brain.blueprintId) : void 0, wi = xn === "wall", gp = xn === "world", pt = xn === "tile", gl = xn === "block", _n = xn === "object", bp = xn === "npc" && vi;
  ge.useEffect(() => {
    vi && Oi();
  }, [vi, Oi]), ge.useEffect(() => {
    a && f !== a && p(a);
  }, [f, a, p]);
  const yp = () => {
    !h || !Je || ln(Je.id, h);
  }, vp = () => {
    !h || !Je || an(Je.id, h, { flipSides: !ia?.flipSides });
  }, wp = () => {
    !w || !He || jn(He.id, w);
  }, xp = () => {
    g && Vn(g);
  }, $o = (ie, Te, Ee, At) => {
    const kt = aa(Te, Ee, At.id), xi = ie ? ot.get(ie) : void 0, Wi = jp(kt, At, xi);
    return ot.has(kt) ? rn(kt, Wi) : Ot(Wi), kt;
  }, _p = (ie) => {
    if (!Je) return;
    const Ee = (h ? Je.walls.find((kt) => kt.id === h) : void 0)?.materialId ?? Je.frontMeshId;
    if (h) {
      const kt = $o(Ee, h, "wall", ie);
      an(Je.id, h, { materialId: kt });
      return;
    }
    const At = $o(
      Je.frontMeshId,
      va("placement-wall"),
      "wall",
      ie
    );
    sn(At);
  }, Sp = (ie) => {
    if (!He) return;
    if (w) {
      const Ee = $o(na?.materialId ?? He.floorMeshId, w, "tile", ie);
      Ht(He.id, w, { materialId: Ee });
      return;
    }
    const Te = $o(
      He.floorMeshId,
      va("placement-tile"),
      "tile",
      ie
    );
    z(Te);
  }, Mp = (ie) => {
    if (!He) return;
    if (w) {
      const kt = na?.materialId ?? He.floorMeshId, xi = aa(w, "tile-color", ie), Wi = xc(xi, ie, ot.get(kt));
      ot.has(xi) ? rn(xi, Wi) : Ot(Wi), Ht(He.id, w, { materialId: xi });
      return;
    }
    const Te = O ?? He.floorMeshId, Ee = aa(va("placement-tile-color"), "tile", ie), At = xc(Ee, ie, ot.get(Te));
    Ot(At), z(Ee);
  }, bl = (ie, Te = A) => {
    if (N(ie, Te), !w || !He) return;
    const Ee = He.tiles.find((At) => At.id === w);
    !Ee || !Ee.objectType || Ee.objectType === "none" || Ee.objectType === "water" || Ht(He.id, w, {
      objectConfig: {
        ...Ee.objectConfig ?? {},
        terrainColor: ie,
        terrainAccentColor: Te
      }
    });
  };
  return /* @__PURE__ */ x("div", { className: `building-panel ${e}`, style: t, children: [
    !u && /* @__PURE__ */ x("div", { className: "building-panel__header", children: [
      /* @__PURE__ */ x("div", { children: [
        /* @__PURE__ */ s("div", { className: "building-panel__eyebrow", children: "Mode" }),
        /* @__PURE__ */ x("div", { className: "building-panel__title", children: [
          pp,
          " 인스펙터"
        ] })
      ] }),
      !a && /* @__PURE__ */ s("div", { className: "building-panel__mode-tabs", children: Hi.map((ie) => /* @__PURE__ */ s(
        "button",
        {
          className: `building-panel__mode-tab ${f === ie.type ? "building-panel__mode-tab--active" : ""}`,
          onClick: () => p(ie.type),
          title: ie.description,
          children: ie.label
        },
        ie.type
      )) })
    ] }),
    i.header,
    /* @__PURE__ */ x("div", { className: "building-panel__inspector", children: [
      i.beforeInspector,
      /* @__PURE__ */ s(Vw, { actions: o }),
      gp && !d.has("environment") && /* @__PURE__ */ s(
        Zw,
        {
          showSnow: Mt,
          setShowSnow: Ct,
          showFog: ii,
          setShowFog: rt,
          fogColor: ut,
          setFogColor: Ye,
          weatherEffect: at,
          setWeatherEffect: je
        }
      ),
      wi && !d.has("wallPresets") && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "벽 프리셋" }),
        /* @__PURE__ */ s("div", { className: "building-panel__grid", children: pu.map((ie) => {
          const Te = `${ie.id}-walls`;
          return /* @__PURE__ */ s(
            "button",
            {
              className: `building-panel__grid-btn ${_ === Te ? "building-panel__grid-btn--active" : ""}`,
              onClick: () => Y(ie.id),
              title: ie.labelEn,
              children: ie.labelKo
            },
            ie.id
          );
        }) })
      ] }),
      wi && !d.has("wallModules") && /* @__PURE__ */ s(
        Qw,
        {
          currentWallKind: ia?.wallKind ?? U,
          currentWallKindLabel: hp,
          setWallKind: V,
          currentWallRotation: M,
          setWallRotation: F,
          rotations: ml,
          selectedWallId: h,
          hasSelectedWallGroup: !!Je,
          onFlipSelectedWall: vp,
          onDeleteSelectedWall: yp
        }
      ),
      wi && i.afterWallSettings,
      (wi || pt) && !d.has("assetMaterials") && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "에셋 재질" }),
        /* @__PURE__ */ x("div", { className: "building-panel__asset-targets", children: [
          wi && /* @__PURE__ */ x("span", { children: [
            "벽: ",
            Je?.name ?? "선택 없음"
          ] }),
          pt && /* @__PURE__ */ x("span", { children: [
            "타일: ",
            w ? `선택 타일 ${w}` : "다음 생성 타일"
          ] }),
          pt && /* @__PURE__ */ x("span", { children: [
            "현재 생성 재질: ",
            O ?? He?.floorMeshId ?? "기본값"
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-panel__asset-list", children: [
          k.map((ie) => /* @__PURE__ */ x("div", { className: "building-panel__asset-card", children: [
            /* @__PURE__ */ s(gu, { asset: ie, size: 54 }),
            /* @__PURE__ */ x("div", { className: "building-panel__asset-info", children: [
              /* @__PURE__ */ s("strong", { children: ie.name }),
              /* @__PURE__ */ s("span", { children: ie.kind })
            ] }),
            /* @__PURE__ */ x("div", { className: "building-panel__asset-actions", children: [
              wi && /* @__PURE__ */ s(
                "button",
                {
                  className: "building-panel__asset-action",
                  disabled: !Je,
                  onClick: () => _p(ie),
                  children: "벽"
                }
              ),
              pt && /* @__PURE__ */ s(
                "button",
                {
                  className: "building-panel__asset-action",
                  disabled: !He,
                  onClick: () => Sp(ie),
                  children: "타일"
                }
              )
            ] })
          ] }, ie.id)),
          k.length === 0 && /* @__PURE__ */ s("div", { className: "building-panel__empty", children: "사용 가능한 빌딩 에셋이 없습니다." })
        ] })
      ] }),
      pt && !d.has("tilePresets") && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "타일 프리셋" }),
        /* @__PURE__ */ s("div", { className: "building-panel__grid", children: hu.map((ie) => {
          const Te = `${ie.id}-floor`;
          return /* @__PURE__ */ s(
            "button",
            {
              className: `building-panel__grid-btn ${_t === Te ? "building-panel__grid-btn--active" : ""}`,
              onClick: () => R(ie.id),
              title: ie.labelEn,
              children: ie.labelKo
            },
            ie.id
          );
        }) })
      ] }),
      pt && !d.has("customTile") && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "커스텀 타일 맵" }),
        /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
          /* @__PURE__ */ x("label", { className: "building-panel__info-item", children: [
            /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "이름" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: E,
                onChange: (ie) => $({ name: ie.target.value }),
                className: "building-panel__text-input"
              }
            )
          ] }),
          /* @__PURE__ */ s(me, { label: "기본색", children: /* @__PURE__ */ s(
            xo,
            {
              value: G,
              onChange: (ie) => $({ color: ie })
            }
          ) }),
          /* @__PURE__ */ x("label", { className: "building-panel__info-item", children: [
            /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "텍스처 URL" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: I,
                onChange: (ie) => $({ textureUrl: ie.target.value }),
                placeholder: "textures/floor.png",
                className: "building-panel__text-input"
              }
            )
          ] }),
          /* @__PURE__ */ s("button", { className: "building-panel__asset-action", onClick: L, children: "별도 타일 맵 생성/선택" })
        ] })
      ] }),
      pt && !d.has("terrainCover") && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "지형 덮개" }),
        /* @__PURE__ */ s("div", { className: "building-panel__grid", children: Za.map((ie) => /* @__PURE__ */ s(
          "button",
          {
            className: `building-panel__grid-btn ${Z === ie.type ? "building-panel__grid-btn--active" : ""}`,
            onClick: () => J(ie.type),
            children: ie.labelKo
          },
          ie.type
        )) }),
        /* @__PURE__ */ x("div", { className: "building-panel__terrain-colors", children: [
          /* @__PURE__ */ x("label", { children: [
            /* @__PURE__ */ s("span", { children: "기본색" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "color",
                value: q,
                onChange: (ie) => bl(ie.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ x("label", { children: [
            /* @__PURE__ */ s("span", { children: "강조색" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "color",
                value: A,
                onChange: (ie) => bl(q, ie.target.value)
              }
            )
          ] })
        ] })
      ] }),
      _n && !d.has("objectPresets") && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "배치 오브젝트" }),
        /* @__PURE__ */ s("div", { className: "building-panel__grid", children: Ep.map((ie) => /* @__PURE__ */ s(
          "button",
          {
            className: `building-panel__grid-btn ${W === ie.type ? "building-panel__grid-btn--active" : ""}`,
            onClick: () => {
              K(ie.type), ie.type === "model" && Gi && (te(Gi.defaultScale), ye(Gi.defaultColor), ae(Gi.modelUrl ?? ""));
            },
            children: ie.labelKo
          },
          ie.type
        )) })
      ] }),
      _n && W === "model" && !d.has("modelSettings") && /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
        /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "기본 기물 GLB" }),
        /* @__PURE__ */ s("div", { className: "building-panel__grid", children: _o.map((ie) => /* @__PURE__ */ s(
          "button",
          {
            className: `building-panel__grid-btn ${Q === ie.id ? "building-panel__grid-btn--active" : ""}`,
            onClick: () => {
              ne(ie.id), te(ie.defaultScale), ye(ie.defaultColor), ae(ie.modelUrl ?? "");
            },
            children: ie.label
          },
          ie.id
        )) }),
        /* @__PURE__ */ x("div", { className: "building-panel__info", children: [
          /* @__PURE__ */ x("label", { className: "building-panel__info-item", children: [
            /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "GLB URL" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: re,
                onChange: (ie) => ae(ie.target.value),
                placeholder: "gltf/props/door.glb",
                className: "building-panel__text-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("label", { className: "building-panel__info-item", children: [
            /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "스케일" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0.1",
                max: "10",
                step: "0.1",
                value: se,
                onChange: (ie) => te(Number(ie.target.value) || 1),
                className: "building-panel__number-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("label", { className: "building-panel__info-item", children: [
            /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "색상" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "color",
                value: he,
                onChange: (ie) => ye(ie.target.value),
                style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
              }
            ),
            /* @__PURE__ */ s("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: he })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
            /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "Fallback" }),
            /* @__PURE__ */ s("span", { className: "building-panel__info-value", children: Gi?.fallbackKind ?? "generic" })
          ] })
        ] })
      ] }),
      (pt || gl) && !d.has("placement") && /* @__PURE__ */ s(
        Kw,
        {
          isTileMode: pt,
          currentTileMultiplier: S,
          setTileMultiplier: m,
          currentTileHeight: y,
          setTileHeight: v,
          snapToGrid: _e,
          setSnapToGrid: Me,
          currentTileShape: C,
          setTileShape: T,
          currentTileRotation: P,
          setTileRotation: D,
          rotations: ml,
          selectedTileId: w,
          hasSelectedTileGroup: !!He,
          onDeleteSelectedTile: wp
        }
      ),
      gl && /* @__PURE__ */ s(
        qw,
        {
          currentTileMultiplier: S,
          currentTileHeight: y,
          selectedBlockId: g,
          onDeleteSelectedBlock: xp
        }
      ),
      pt && i.afterTileSettings,
      pt && _t && !d.has("tileColor") && (() => {
        const ie = ct.get(_t), Te = na?.materialId ?? O ?? ie?.floorMeshId, Ee = Te ? ot.get(Te) : void 0;
        return Ee ? /* @__PURE__ */ x("div", { className: "building-panel__section", children: [
          /* @__PURE__ */ s("div", { className: "building-panel__section-title", children: "타일 색상" }),
          /* @__PURE__ */ s("div", { className: "building-panel__info", children: /* @__PURE__ */ x("div", { className: "building-panel__info-item", children: [
            /* @__PURE__ */ s("span", { className: "building-panel__info-label", children: "색상" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "color",
                value: Ee.color || "#888888",
                onChange: (At) => Mp(At.target.value),
                style: { width: "36px", height: "24px", border: "none", cursor: "pointer", background: "none" }
              }
            ),
            /* @__PURE__ */ s("span", { className: "building-panel__info-value", style: { fontSize: "10px" }, children: Ee.color || "#888888" })
          ] }) })
        ] }) : null;
      })(),
      bp && (() => {
        if (c !== void 0 && typeof c != "function")
          return c;
        const ie = /* @__PURE__ */ s(
          F1,
          {
            layout: l,
            npcTemplatesArray: pe,
            selectedNPCTemplateId: ri,
            setSelectedNPCTemplate: ai,
            npcInstancesArray: Ve,
            selectedNPCInstanceId: It ?? null,
            setSelectedNPCInstance: vn,
            selectedNPCInstance: oa,
            npcAnimationsArray: ft,
            selectedNPCBrainBlueprint: mp,
            npcBrainBlueprintsArray: Lo,
            hoverPosition: b,
            updateNPCBehavior: (Te, Ee) => dt(Te, Ee),
            setNPCNavigation: Tt,
            clearNPCNavigation: Zt,
            updateNPCInstance: Vt,
            updateNPCBrain: Yt,
            addNPCBrainBlueprint: wn,
            updateNPCBrainBlueprint: H,
            updateNPCPerception: Et
          }
        );
        return c === void 0 ? ie : c({ editMode: "npc", layout: l, defaultPanel: ie });
      })(),
      _n && W !== "none" && !d.has("objectRotation") && /* @__PURE__ */ s(
        Xw,
        {
          currentObjectRotation: Wn,
          setObjectRotation: Un
        }
      ),
      _n && (W === "tree" || W === "sakura") && !d.has("treeSettings") && /* @__PURE__ */ s(
        r1,
        {
          currentTreeKind: gn,
          setTreeKind: yn,
          currentObjectPrimaryColor: Ut,
          setObjectPrimaryColor: bn,
          currentObjectSecondaryColor: ni,
          setObjectSecondaryColor: jt
        }
      ),
      _n && W === "fire" && !d.has("fireSettings") && /* @__PURE__ */ s(
        a1,
        {
          currentFireIntensity: Lt,
          setFireIntensity: $n,
          currentFireWidth: on,
          setFireWidth: On,
          currentFireHeight: $t,
          setFireHeight: Hn,
          currentFireColor: Ln,
          setFireColor: Gn
        }
      ),
      _n && W === "billboard" && !d.has("billboardSettings") && /* @__PURE__ */ s(
        l1,
        {
          currentBillboardScale: Kn,
          setBillboardScale: Jn,
          currentBillboardOffsetY: qn,
          setBillboardOffsetY: ei,
          currentBillboardWidth: un,
          setBillboardWidth: hn,
          currentBillboardHeight: Xn,
          setBillboardHeight: mn,
          currentBillboardElevation: Qn,
          setBillboardElevation: Wt,
          currentBillboardIntensity: dn,
          setBillboardIntensity: ti,
          currentBillboardText: Zn,
          setBillboardText: fn,
          currentBillboardImageUrl: Yn,
          setBillboardImageUrl: pn,
          currentBillboardColor: cn,
          setBillboardColor: Gt
        }
      ),
      _n && W === "flag" && !d.has("flagSettings") && /* @__PURE__ */ s(
        c1,
        {
          currentFlagStyle: Qe,
          setFlagStyle: it,
          currentFlagWidth: Pe,
          setFlagWidth: Oe,
          currentFlagHeight: Ce,
          setFlagHeight: xt,
          currentFlagImageUrl: Re,
          setFlagImageUrl: nt
        }
      ),
      _n && i.afterObjectSettings,
      n
    ] })
  ] });
};
function H1(e = {}) {
  return /* @__PURE__ */ s($i, { ...e, forcedEditMode: "world" });
}
function G1(e = {}) {
  return /* @__PURE__ */ s($i, { ...e, forcedEditMode: "wall" });
}
function W1(e = {}) {
  return /* @__PURE__ */ s($i, { ...e, forcedEditMode: "tile" });
}
function U1(e = {}) {
  return /* @__PURE__ */ s($i, { ...e, forcedEditMode: "block" });
}
function j1(e = {}) {
  return /* @__PURE__ */ s($i, { ...e, forcedEditMode: "object" });
}
function V1(e = {}) {
  return /* @__PURE__ */ s($i, { ...e, forcedEditMode: "npc" });
}
const Si = {
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
}, Z1 = {
  hat: "모자",
  top: "상의",
  bottom: "하의",
  shoes: "신발",
  face: "표정",
  weapon: "무기",
  accessory: "액세서리"
}, yM = {
  short: "단발",
  long: "긴머리",
  cap: "모자머리",
  bun: "쪽머리",
  spiky: "뻗친머리"
}, vM = {
  default: "기본",
  smile: "미소",
  wink: "윙크",
  sleepy: "졸림",
  surprised: "놀람"
}, xa = {
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  face: null,
  weapon: null,
  accessory: null
}, _a = yi((e, t) => ({
  appearance: { ...Si, colors: { ...Si.colors } },
  outfits: { ...xa },
  setName: (n) => e((i) => ({ appearance: { ...i.appearance, name: n.slice(0, 16) || "플레이어" } })),
  setColor: (n, i) => e((o) => ({
    appearance: {
      ...o.appearance,
      colors: { ...o.appearance.colors, [n]: i }
    }
  })),
  setFace: (n) => e((i) => ({ appearance: { ...i.appearance, face: n } })),
  setHair: (n) => e((i) => ({ appearance: { ...i.appearance, hair: n } })),
  equipOutfit: (n, i) => e((o) => ({ outfits: { ...o.outfits, [n]: i } })),
  resetAppearance: () => e({
    appearance: { ...Si, colors: { ...Si.colors } },
    outfits: { ...xa }
  }),
  getEquippedAssetIds: () => Object.values(t().outfits).filter((n) => typeof n == "string" && n.length > 0),
  serialize: () => {
    const n = t();
    return {
      version: 2,
      appearance: {
        ...n.appearance,
        colors: { ...n.appearance.colors }
      },
      outfits: { ...n.outfits }
    };
  },
  hydrate: (n) => {
    !n || n.version !== 1 && n.version !== 2 || e({
      appearance: {
        ...Si,
        ...n.appearance,
        colors: { ...Si.colors, ...n.appearance.colors }
      },
      outfits: { ...xa, ...n.outfits }
    });
  }
})), Y1 = ["hat", "top", "bottom", "shoes", "face", "weapon", "accessory"], X1 = (e, t) => t === "weapon" ? e.kind === "weapon" || e.slot === "weapon" : e.slot === t && (e.kind === "characterPart" || e.kind === "weapon"), K1 = ({ className: e = "", style: t, children: n }) => {
  const i = _a((b) => b.outfits), o = _a((b) => b.equipOutfit), r = _a((b) => b.resetAppearance), a = Pn((b) => b.ids), l = Pn((b) => b.records), c = Pn((b) => b.isLoading), u = Pn((b) => b.error), [d, f] = le("top"), [p, h] = le(""), [w, g] = le(!1), _ = X(() => {
    const b = p.trim().toLowerCase();
    return a.map((S) => l[S]).filter((S) => !!S).filter((S) => X1(S, d)).filter((S) => b ? S.tags?.some((m) => m.toLowerCase().includes(b)) ?? !1 : !0).filter((S) => !w || S.metadata?.owned !== !1);
  }, [a, l, w, d, p]);
  return /* @__PURE__ */ x("div", { className: `character-asset-panel ${e}`, style: t, children: [
    /* @__PURE__ */ x("section", { className: "character-asset-panel__section", children: [
      /* @__PURE__ */ x("div", { className: "character-asset-panel__header", children: [
        /* @__PURE__ */ s("span", { className: "character-asset-panel__section-title", children: "캐릭터 에셋" }),
        /* @__PURE__ */ s(
          "button",
          {
            className: "character-asset-panel__ghost-btn",
            onClick: r,
            type: "button",
            children: "초기화"
          }
        )
      ] }),
      /* @__PURE__ */ s("div", { className: "character-asset-panel__slot-grid", children: Y1.map((b) => /* @__PURE__ */ x(
        "button",
        {
          type: "button",
          className: `character-asset-panel__slot-btn ${d === b ? "character-asset-panel__slot-btn--active" : ""}`,
          onClick: () => f(b),
          children: [
            /* @__PURE__ */ s("span", { children: Z1[b] }),
            /* @__PURE__ */ s("small", { children: i[b] ?? "비어있음" })
          ]
        },
        b
      )) })
    ] }),
    /* @__PURE__ */ x("section", { className: "character-asset-panel__section", children: [
      /* @__PURE__ */ x("div", { className: "character-asset-panel__filters", children: [
        /* @__PURE__ */ s(
          "input",
          {
            value: p,
            onChange: (b) => h(b.target.value),
            placeholder: "태그 검색",
            className: "character-asset-panel__input"
          }
        ),
        /* @__PURE__ */ x("label", { className: "character-asset-panel__check", children: [
          /* @__PURE__ */ s(
            "input",
            {
              type: "checkbox",
              checked: w,
              onChange: (b) => g(b.target.checked)
            }
          ),
          "보유만"
        ] })
      ] }),
      u && /* @__PURE__ */ s("p", { className: "character-asset-panel__notice", children: u }),
      c && /* @__PURE__ */ s("p", { className: "character-asset-panel__notice", children: "에셋 로딩 중" }),
      /* @__PURE__ */ x("div", { className: "character-asset-panel__asset-list", children: [
        /* @__PURE__ */ x(
          "button",
          {
            type: "button",
            className: `character-asset-panel__asset-card ${i[d] === null ? "character-asset-panel__asset-card--active" : ""}`,
            onClick: () => o(d, null),
            children: [
              /* @__PURE__ */ s("div", { className: "character-asset-panel__empty-preview" }),
              /* @__PURE__ */ s("span", { children: "비우기" })
            ]
          }
        ),
        _.map((b) => /* @__PURE__ */ x(
          "button",
          {
            type: "button",
            className: `character-asset-panel__asset-card ${i[d] === b.id ? "character-asset-panel__asset-card--active" : ""}`,
            onClick: () => o(d, b.id),
            children: [
              /* @__PURE__ */ s(gu, { asset: b, size: 58 }),
              /* @__PURE__ */ s("span", { children: b.name })
            ]
          },
          b.id
        )),
        _.length === 0 && /* @__PURE__ */ s("p", { className: "character-asset-panel__notice", children: "선택한 슬롯에 사용할 에셋이 없습니다." })
      ] })
    ] }),
    n
  ] });
}, Bc = {
  manual: "수동",
  interaction: "상호작용",
  enterArea: "영역 진입",
  itemCollected: "아이템 획득",
  timeChanged: "시간 변경",
  calendarEventStarted: "캘린더 이벤트",
  questChanged: "퀘스트 변경",
  custom: "커스텀"
}, q1 = {
  id: "ID",
  name: "이름",
  description: "설명",
  type: "타입",
  key: "키",
  run: "실행 방식",
  cooldownMs: "쿨다운(ms)",
  requiresServer: "서버 필요",
  targetId: "대상 ID",
  action: "액션",
  areaId: "영역 ID",
  itemId: "아이템 ID",
  hour: "시간",
  eventId: "이벤트 ID",
  questId: "퀘스트 ID",
  status: "상태",
  operator: "연산자",
  value: "값",
  message: "메시지",
  toast: "토스트",
  durationMs: "지속시간(ms)"
}, Q1 = /* @__PURE__ */ new Set(["i", "j", "m", "k", "o", "c", "f", "e", "t"]), Sa = (e) => {
  const t = e.trim().toLowerCase();
  return t.length === 1 && Q1.has(t);
}, J1 = (e) => {
  const t = e.trigger;
  switch (t.type) {
    case "manual":
      return { type: "manual", key: t.key };
    case "interaction":
      return {
        type: "interaction",
        targetId: t.targetId,
        ...t.action ? { action: t.action } : {}
      };
    case "enterArea":
      return { type: "enterArea", areaId: t.areaId };
    case "itemCollected":
      return { type: "itemCollected", itemId: t.itemId };
    case "timeChanged":
      return { type: "timeChanged", ...t.hour !== void 0 ? { hour: t.hour } : {} };
    case "calendarEventStarted":
      return { type: "calendarEventStarted", eventId: t.eventId };
    case "questChanged":
      return {
        type: "questChanged",
        questId: t.questId,
        ...t.status ? { status: t.status } : {}
      };
    case "custom":
      return { type: "custom", key: t.key };
    default:
      return t;
  }
}, er = (e) => {
  if (e === "true") return !0;
  if (e === "false") return !1;
  const t = Number(e);
  return Number.isFinite(t) && e.trim() !== "" ? t : e;
};
function ex({
  blueprints: e = bu,
  onCreate: t,
  onUpdate: n,
  onDelete: i,
  onRun: o,
  className: r = "",
  style: a,
  children: l
}) {
  const c = X(() => new Yp({ blueprints: e }), [e]), [u, d] = le("manual-event"), [f, p] = le("수동 이벤트"), [h, w] = le("manual.event"), [g, _] = le("이벤트가 실행되었습니다."), [b, S] = le(null), [m, y] = le(!1), v = X(
    () => e.find((M) => M.id === b) ?? null,
    [e, b]
  ), [C, T] = le({ kind: "idle", message: "대기 중" }), P = () => {
    if (Sa(h)) {
      T({ kind: "error", message: `트리거 키 "${h}" 는 HUD 단축키로 예약되어 있습니다.` });
      return;
    }
    const M = th({ id: u, name: f, triggerKey: h, message: g });
    t?.(M), S(M.id), y(!0), T({ kind: "success", message: `이벤트를 생성했습니다: ${M.id}` });
  }, D = () => {
    const M = u.trim(), F = f.trim(), U = nh({
      ...M ? { id: `${M}-npc-quest` } : {},
      ...F ? { name: `${F} NPC 퀘스트` } : {}
    });
    t?.(U), S(U.id), y(!0), T({ kind: "success", message: `NPC 퀘스트 프리셋을 추가했습니다: ${U.id}` });
  }, O = ce((M) => {
    if (!v) return;
    const F = { ...v, ...M };
    n?.(F), S(F.id), T({ kind: "success", message: `이벤트를 수정했습니다: ${F.id}` });
  }, [n, v]), z = () => {
    if (!v) return;
    i?.(v.id);
    const M = e.find((F) => F.id !== v.id) ?? null;
    S(M?.id ?? null), y(!1), T({ kind: "success", message: `이벤트를 삭제했습니다: ${v.id}` });
  }, E = async (M) => {
    const F = J1(M);
    o ? await o(F) : await c.dispatch(F), T({ kind: "success", message: `이벤트를 실행했습니다: ${M.id}` });
  }, G = ce((M, F) => {
    if (!v) return;
    const U = [...v.conditions ?? []];
    U[M] = F, O({ conditions: U });
  }, [v, O]), I = ce((M, F) => {
    if (!v) return;
    const U = [...v.actions];
    U[M] = F, O({ actions: U });
  }, [v, O]), $ = ce((M, F, U) => {
    if (!v || F === "type") return;
    const V = U;
    if (M === "root") {
      O({ [F]: V });
      return;
    }
    if (M === "policy") {
      F === "run" && (V === "once" || V === "repeat") && O({ policy: { ...v.policy, run: V } }), F === "cooldownMs" && O({ policy: { ...v.policy, cooldownMs: Number(V) } }), F === "requiresServer" && O({ policy: { ...v.policy, requiresServer: er(String(V)) === !0 } });
      return;
    }
    if (M === "trigger") {
      const Y = v.trigger;
      if (Y.type === "manual" && F === "key") {
        const Z = String(V);
        if (Sa(Z)) {
          T({ kind: "error", message: `트리거 키 "${Z}" 는 HUD 단축키로 예약되어 있습니다.` });
          return;
        }
        O({ trigger: { type: "manual", key: Z } });
      }
      if (Y.type === "interaction" && (F === "targetId" || F === "action") && O({ trigger: { ...Y, [F]: String(V) } }), Y.type === "enterArea" && F === "areaId" && O({ trigger: { type: "enterArea", areaId: String(V) } }), Y.type === "itemCollected" && F === "itemId" && O({ trigger: { type: "itemCollected", itemId: String(V) } }), Y.type === "timeChanged" && F === "hour" && O({ trigger: { type: "timeChanged", hour: Number(V) } }), Y.type === "calendarEventStarted" && F === "eventId" && O({ trigger: { type: "calendarEventStarted", eventId: String(V) } }), Y.type === "questChanged" && (F === "questId" || F === "status") && O({ trigger: { ...Y, [F]: String(V) } }), Y.type === "custom" && F === "key") {
        const Z = String(V);
        if (Sa(Z)) {
          T({ kind: "error", message: `트리거 키 "${Z}" 는 HUD 단축키로 예약되어 있습니다.` });
          return;
        }
        O({ trigger: { type: "custom", key: Z } });
      }
      return;
    }
    if (M.startsWith("condition:")) {
      const Y = Number(M.split(":")[1]), Z = v.conditions?.[Y];
      if (!Z) return;
      G(Y, { ...Z, [F]: F === "value" ? er(String(V)) : V });
      return;
    }
    if (M.startsWith("action:")) {
      const Y = Number(M.split(":")[1]), Z = v.actions[Y];
      if (!Z) return;
      I(Y, { ...Z, [F]: F === "value" ? er(String(V)) : V });
    }
  }, [v, I, G, O]), R = ce((M) => {
    if (v) {
      if (M.startsWith("condition:")) {
        const F = Number(M.split(":")[1]);
        O({ conditions: (v.conditions ?? []).filter((U, V) => V !== F) });
        return;
      }
      if (M.startsWith("action:")) {
        const F = Number(M.split(":")[1]);
        O({ actions: v.actions.filter((U, V) => V !== F) });
      }
    }
  }, [v, O]), L = (M, F) => /* @__PURE__ */ s("div", { className: "gameplay-event-panel__field-grid", children: Object.entries(F).map(([U, V]) => /* @__PURE__ */ x("label", { className: "gameplay-event-panel__field", children: [
    /* @__PURE__ */ s("span", { children: q1[U] ?? U }),
    /* @__PURE__ */ s(
      "input",
      {
        type: typeof V == "number" ? "number" : "text",
        value: String(V),
        disabled: U === "type",
        onChange: (Y) => $(M, U, er(Y.target.value))
      }
    )
  ] }, `${M}-${U}`)) });
  return /* @__PURE__ */ x("div", { className: `gameplay-event-panel ${r}`, style: a, children: [
    /* @__PURE__ */ x("section", { className: "gameplay-event-panel__section", children: [
      /* @__PURE__ */ s("div", { className: "gameplay-event-panel__title", children: "빠른 생성" }),
      /* @__PURE__ */ x("label", { className: "gameplay-event-panel__field", children: [
        /* @__PURE__ */ s("span", { children: "ID" }),
        /* @__PURE__ */ s("input", { value: u, onChange: (M) => d(M.target.value) })
      ] }),
      /* @__PURE__ */ x("label", { className: "gameplay-event-panel__field", children: [
        /* @__PURE__ */ s("span", { children: "이름" }),
        /* @__PURE__ */ s("input", { value: f, onChange: (M) => p(M.target.value) })
      ] }),
      /* @__PURE__ */ x("label", { className: "gameplay-event-panel__field", children: [
        /* @__PURE__ */ s("span", { children: "트리거 키" }),
        /* @__PURE__ */ s("input", { value: h, onChange: (M) => w(M.target.value) })
      ] }),
      /* @__PURE__ */ s("div", { className: "gameplay-event-panel__hint", children: "단일 문자 키(`i`, `j`, `m`, `k`, `o`, `c`, `f`, `e`, `t`)는 HUD 단축키로 예약됩니다." }),
      /* @__PURE__ */ x("label", { className: "gameplay-event-panel__field", children: [
        /* @__PURE__ */ s("span", { children: "토스트 메시지" }),
        /* @__PURE__ */ s("input", { value: g, onChange: (M) => _(M.target.value) })
      ] }),
      /* @__PURE__ */ s("button", { type: "button", className: "gameplay-event-panel__primary", onClick: P, children: "수동 이벤트 생성" }),
      /* @__PURE__ */ s("button", { type: "button", onClick: D, children: "NPC 퀘스트 프리셋 추가" })
    ] }),
    /* @__PURE__ */ x("section", { className: "gameplay-event-panel__section", children: [
      /* @__PURE__ */ s("div", { className: "gameplay-event-panel__title", children: "이벤트 목록" }),
      /* @__PURE__ */ x("div", { className: "gameplay-event-panel__list", children: [
        e.map((M) => /* @__PURE__ */ x("article", { className: "gameplay-event-panel__card", children: [
          /* @__PURE__ */ x("div", { children: [
            /* @__PURE__ */ s("div", { className: "gameplay-event-panel__card-title", children: M.name }),
            /* @__PURE__ */ x("div", { className: "gameplay-event-panel__card-meta", children: [
              M.id,
              " · ",
              Bc[M.trigger.type],
              " · 액션 ",
              M.actions.length,
              "개"
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "gameplay-event-panel__card-actions", children: [
            /* @__PURE__ */ s(
              "button",
              {
                type: "button",
                onClick: () => {
                  S(M.id), y(!0);
                },
                children: "편집"
              }
            ),
            /* @__PURE__ */ s("button", { type: "button", onClick: () => {
              E(M);
            }, children: "실행" })
          ] })
        ] }, M.id)),
        e.length === 0 && /* @__PURE__ */ s("div", { className: "gameplay-event-panel__empty", children: "등록된 이벤트가 없습니다. 위에서 새 이벤트를 생성하세요." })
      ] })
    ] }),
    v && /* @__PURE__ */ x("section", { className: "gameplay-event-panel__section gameplay-event-panel__detail", children: [
      /* @__PURE__ */ x("div", { className: "gameplay-event-panel__editor-head", children: [
        /* @__PURE__ */ x("div", { children: [
          /* @__PURE__ */ s("div", { className: "gameplay-event-panel__title", children: "이벤트 인스펙터" }),
          /* @__PURE__ */ s("div", { className: "gameplay-event-panel__hint", children: "그래프 노드 대신 트리거, 조건, 액션을 섹션별 인스펙터에서 수정합니다." })
        ] }),
        /* @__PURE__ */ x("div", { className: "gameplay-event-panel__editor-tools", children: [
          /* @__PURE__ */ x("label", { className: "gameplay-event-panel__type-select", children: [
            /* @__PURE__ */ s("span", { children: "트리거 타입" }),
            /* @__PURE__ */ s(
              "select",
              {
                value: v.trigger.type,
                onChange: (M) => O({ trigger: Kp(M.target.value) }),
                children: Xp.map((M) => /* @__PURE__ */ s("option", { value: M, children: Bc[M] }, M))
              }
            )
          ] }),
          /* @__PURE__ */ s("button", { type: "button", className: "gameplay-event-panel__primary", onClick: () => y((M) => !M), children: m ? "상세 편집 접기" : "상세 편집 열기" })
        ] })
      ] }),
      m ? /* @__PURE__ */ x(be, { children: [
        /* @__PURE__ */ x("div", { className: "gameplay-event-panel__inspector", children: [
          /* @__PURE__ */ x("div", { className: "gameplay-event-panel__inspector-card", children: [
            /* @__PURE__ */ s("div", { className: "gameplay-event-panel__subhead", children: "기본 정보" }),
            L("root", {
              id: v.id,
              name: v.name,
              description: v.description ?? ""
            })
          ] }),
          /* @__PURE__ */ x("div", { className: "gameplay-event-panel__inspector-card", children: [
            /* @__PURE__ */ s("div", { className: "gameplay-event-panel__subhead", children: "트리거" }),
            L("trigger", v.trigger)
          ] }),
          /* @__PURE__ */ x("div", { className: "gameplay-event-panel__inspector-card", children: [
            /* @__PURE__ */ s("div", { className: "gameplay-event-panel__subhead", children: "실행 정책" }),
            L("policy", {
              run: v.policy?.run ?? "repeat",
              cooldownMs: v.policy?.cooldownMs ?? 0,
              requiresServer: v.policy?.requiresServer ?? !1
            })
          ] }),
          /* @__PURE__ */ x("div", { className: "gameplay-event-panel__inspector-card", children: [
            /* @__PURE__ */ s("div", { className: "gameplay-event-panel__subhead", children: "조건" }),
            (v.conditions ?? []).map((M, F) => /* @__PURE__ */ x("div", { className: "gameplay-event-panel__item-editor", children: [
              L(`condition:${F}`, M),
              /* @__PURE__ */ s("button", { type: "button", onClick: () => R(`condition:${F}`), children: "삭제" })
            ] }, `condition-${F}`)),
            (v.conditions ?? []).length === 0 && /* @__PURE__ */ s("div", { className: "gameplay-event-panel__hint", children: "조건 없음" })
          ] }),
          /* @__PURE__ */ x("div", { className: "gameplay-event-panel__inspector-card", children: [
            /* @__PURE__ */ s("div", { className: "gameplay-event-panel__subhead", children: "액션" }),
            v.actions.map((M, F) => /* @__PURE__ */ x("div", { className: "gameplay-event-panel__item-editor", children: [
              L(`action:${F}`, M),
              /* @__PURE__ */ s("button", { type: "button", onClick: () => R(`action:${F}`), children: "삭제" })
            ] }, `action-${F}`))
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "gameplay-event-panel__node-toolbar", children: [
          /* @__PURE__ */ x(
            "select",
            {
              "aria-label": "Condition type",
              onChange: (M) => {
                O({ conditions: [...v.conditions ?? [], Qp(M.target.value)] }), M.currentTarget.value = "";
              },
              defaultValue: "",
              children: [
                /* @__PURE__ */ s("option", { value: "", disabled: !0, children: "조건 추가" }),
                qp.map((M) => /* @__PURE__ */ s("option", { value: M, children: M }, M))
              ]
            }
          ),
          /* @__PURE__ */ x(
            "select",
            {
              "aria-label": "Action type",
              onChange: (M) => {
                O({ actions: [...v.actions, eh(M.target.value)] }), M.currentTarget.value = "";
              },
              defaultValue: "",
              children: [
                /* @__PURE__ */ s("option", { value: "", disabled: !0, children: "액션 추가" }),
                Jp.map((M) => /* @__PURE__ */ s("option", { value: M, children: M }, M))
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ s("div", { className: "gameplay-event-panel__hint", children: "상세 편집이 접혀 있습니다. 필요할 때만 열어 수정하세요." }),
      /* @__PURE__ */ x("div", { className: "gameplay-event-panel__actions", children: [
        /* @__PURE__ */ s("button", { type: "button", onClick: z, children: "이벤트 삭제" }),
        /* @__PURE__ */ s("button", { type: "button", onClick: () => {
          E(v);
        }, children: "선택 이벤트 실행" })
      ] })
    ] }),
    !v && /* @__PURE__ */ s("section", { className: "gameplay-event-panel__section", children: /* @__PURE__ */ s("div", { className: "gameplay-event-panel__hint", children: "이벤트 목록에서 `편집`을 누르면 상세 설정이 열립니다." }) }),
    /* @__PURE__ */ s("section", { className: "gameplay-event-panel__section", children: /* @__PURE__ */ s("div", { className: `gameplay-event-panel__status gameplay-event-panel__status--${C.kind}`, children: C.message }) }),
    l
  ] });
}
function tx(e, t) {
  const n = {}, i = t.agentRadius ?? e.agentRadius, o = t.agentWidth ?? e.agentWidth, r = t.agentDepth ?? e.agentDepth, a = t.clearance ?? e.clearance;
  return i !== void 0 && (n.agentRadius = i), o !== void 0 && (n.agentWidth = o), r !== void 0 && (n.agentDepth = r), a !== void 0 && (n.clearance = a), n;
}
function nx(e, t, n, i = {}) {
  const o = tx(t, i), r = e.findPath(
    t.position[0],
    t.position[2],
    n[0],
    n[2],
    {
      y: n[1],
      weighted: i.weighted ?? !1,
      ...o
    }
  );
  if (r.length === 0) return [];
  const a = i.simplify === !1 ? r : e.smoothPath(r, void 0, void 0, o);
  return i.includeStart ? a : a.slice(1);
}
function ix(e, t, n, i, o = {}) {
  const r = nx(e, t, n, o);
  return r.length === 0 ? (o.clearOnFail && o.clearNavigation?.(t.id), []) : (i(t.id, r, o.speed), r);
}
const ox = /* @__PURE__ */ new Map();
function rx() {
  return Array.from(ox.values()).flat();
}
function ax(e) {
  let t = 0;
  for (const n of rx())
    e.setBlocked(n.x, n.z, n.width, n.depth), t += 1;
  return t;
}
const sx = /* @__PURE__ */ new Set(["door", "arch", "railing"]);
function lx(e) {
  return !sx.has(e.wallKind ?? "solid");
}
function ps(e, t, n) {
  const i = Math.abs(Math.cos(n)), o = Math.abs(Math.sin(n));
  return {
    width: e * i + t * o,
    depth: e * o + t * i
  };
}
function cx(e, t) {
  const n = Math.max(0.1, e.config?.size ?? e.config?.modelScale ?? 1);
  if (e.type === "flag")
    return {
      width: Math.max(0.2, e.config?.flagWidth ?? n) + t,
      depth: 0.4 + t
    };
  if (e.type === "billboard")
    return {
      width: Math.max(0.2, (e.config?.billboardWidth ?? 2) * (e.config?.billboardScale ?? 1)) + t,
      depth: 0.5 + t
    };
  if (e.type === "fire") {
    const i = e.config?.fireWidth ?? n, o = e.config?.fireHeight ?? i;
    return { width: i + t, depth: o + t };
  }
  return { width: n + t, depth: n + t };
}
function ux(e, t, n) {
  const i = Math.cos(n), o = Math.sin(n);
  return [e * i - t * o, e * o + t * i];
}
function df(e) {
  return Math.max(1, e.size ?? 1) * fe.GRID_CELL_SIZE;
}
function dx(e) {
  return Math.max(e.position.y, fe.HEIGHT_STEP);
}
function fx(e, t, n) {
  const i = e.shape ?? "box";
  if (i === "box" || i === "round") return e.position.y;
  const o = df(e), r = o / 2, a = e.rotation ?? 0, [l, c] = ux(
    t - e.position.x,
    n - e.position.z,
    a
  );
  if (Math.abs(l) > r || Math.abs(c) > r) return e.position.y;
  const u = Math.max(0, Math.min(1, (c + r) / o)), d = dx(e);
  if (i === "stairs") {
    const f = Math.max(4, Math.min(8, (e.size ?? 1) * 4));
    return Math.ceil(u * f) / f * d;
  }
  return i === "ramp" ? u * d : e.position.y;
}
function px(e, t) {
  const n = df(t), i = t.rotation ?? 0, o = ps(n, n, i);
  e.setHeightSampler(
    t.position.x,
    t.position.z,
    o.width,
    o.depth,
    (r, a) => fx(t, r, a)
  );
}
function hx(e, t, n = {}) {
  n.reset && e.reset();
  let i = 0;
  const o = n.includeTiles ?? !0, r = n.includeWalls ?? !0, a = n.includeBlocks ?? !0, l = n.includeObjects ?? !0, c = n.wallPadding ?? 0, u = n.objectPadding ?? 0;
  if (o)
    for (const d of t.tileGroups ?? [])
      for (const f of d.tiles)
        px(e, f), i += 1;
  if (r)
    for (const d of t.wallGroups ?? [])
      for (const f of d.walls) {
        if (!lx(f)) continue;
        const p = ps(
          (f.width ?? fe.WALL_SIZES.WIDTH) + c,
          (f.depth ?? fe.WALL_SIZES.THICKNESS) + c,
          f.rotation.y
        );
        e.setBlocked(f.position.x, f.position.z, p.width, p.depth), i += 1;
      }
  if (a)
    for (const d of t.blocks ?? []) {
      const f = Math.max(1, d.size?.x ?? 1) * fe.GRID_CELL_SIZE, p = Math.max(1, d.size?.z ?? 1) * fe.GRID_CELL_SIZE;
      e.setBlocked(d.position.x, d.position.z, f, p), i += 1;
    }
  if (l)
    for (const d of t.objects ?? []) {
      const f = cx(d, u), p = ps(
        f.width,
        f.depth,
        d.rotation ?? 0
      );
      e.setBlocked(d.position.x, d.position.z, p.width, p.depth), i += 1;
    }
  return i;
}
function mx({
  navigation: e,
  enabled: t = !0,
  includeWalls: n,
  includeTiles: i,
  includeBlocks: o,
  includeObjects: r,
  reset: a = !0,
  objectPadding: l,
  wallPadding: c
}) {
  const u = j((h) => h.wallGroups), d = j((h) => h.tileGroups), f = j((h) => h.blocks), p = j((h) => h.objects);
  return oe(() => {
    t && (hx(
      e,
      {
        wallGroups: u.values(),
        tileGroups: d.values(),
        blocks: f,
        objects: p
      },
      {
        reset: a,
        ...i !== void 0 ? { includeTiles: i } : {},
        ...n !== void 0 ? { includeWalls: n } : {},
        ...o !== void 0 ? { includeBlocks: o } : {},
        ...r !== void 0 ? { includeObjects: r } : {},
        ...l !== void 0 ? { objectPadding: l } : {},
        ...c !== void 0 ? { wallPadding: c } : {}
      }
    ), ax(e));
  }, [
    f,
    t,
    o,
    r,
    i,
    n,
    e,
    l,
    p,
    a,
    d,
    u,
    c
  ]), null;
}
const gx = 30, bx = 120, yx = 4;
function vx() {
  const { gl: e } = Li(), t = we((S) => S.instances), n = we((S) => S.selectedInstanceId), i = we((S) => S.selectedTemplateId), o = we(
    (S) => S.createInstanceFromTemplate
  ), r = we((S) => S.setNavigation), a = we((S) => S.updateInstanceBehavior), l = we((S) => S.setSelectedInstance), c = j((S) => S.editMode), u = j((S) => S.hoverPosition), d = c === "npc", f = ee(Ap.getInstance()), p = ee(!1), [h, w] = le(!1);
  oe(() => {
    let S = !0;
    return f.current.init().then((m) => {
      S && (p.current = m, w(m));
    }), () => {
      S = !1;
    };
  }, []);
  const [g, _] = le(() => /* @__PURE__ */ new Set()), b = ee(0);
  return $e((S, m) => {
    if (b.current += m, b.current < 0.5) return;
    b.current = 0;
    const y = S.camera.position, v = /* @__PURE__ */ new Set();
    t.forEach((C) => {
      const [T, P, D] = C.position, O = T - y.x, z = P - y.y, E = D - y.z, G = Math.sqrt(O * O + z * z + E * E);
      Ao(G, gx, bx, yx) > 0.01 && v.add(C.id);
    }), (v.size !== g.size || [...v].some((C) => !g.has(C))) && _(v);
  }), oe(() => {
    if (!d || !u) return;
    const S = (m) => {
      if (m.target instanceof HTMLCanvasElement && !m.defaultPrevented) {
        if (n && !m.shiftKey) {
          const v = t.get(n), C = [
            u.x,
            u.y,
            u.z
          ];
          if (a(n, { mode: "idle" }), v && p.current && ix(
            f.current,
            { id: v.id, position: v.position },
            C,
            r
          ).length > 0)
            return;
          r(n, [C]);
          return;
        }
        i && u && o(i, [
          u.x,
          u.y,
          u.z
        ]);
      }
    };
    return e.domElement.addEventListener("click", S), () => e.domElement.removeEventListener("click", S);
  }, [
    d,
    i,
    n,
    u,
    t,
    e,
    o,
    r,
    a
  ]), /* @__PURE__ */ x("group", { name: "npc-system", children: [
    /* @__PURE__ */ s(
      mx,
      {
        navigation: f.current,
        enabled: h
      }
    ),
    Array.from(t.values()).map((S) => !d && !g.has(S.id) ? null : /* @__PURE__ */ s(
      uf,
      {
        instance: S,
        isEditMode: d,
        onClick: () => {
          d && l(S.id);
        }
      },
      S.id
    ))
  ] });
}
function wx({ part: e }) {
  return /* @__PURE__ */ x(
    "mesh",
    {
      position: e.position || [0, 0, 0],
      rotation: e.rotation || [0, 0, 0],
      scale: e.scale || [1, 1, 1],
      children: [
        /* @__PURE__ */ s("boxGeometry", { args: [0.5, 1.8, 0.5] }),
        /* @__PURE__ */ s(
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
function xx() {
  const e = j((c) => c.editMode), t = j((c) => c.hoverPosition), n = we((c) => c.templates), i = we((c) => c.clothingSets), o = we((c) => c.selectedTemplateId), r = we(
    (c) => c.selectedClothingSetId
  ), a = we((c) => c.previewAccessories);
  if (e !== "npc" || !t)
    return null;
  const l = [];
  if (o) {
    const c = n.get(o);
    if (c) {
      if (l.push(...c.baseParts), r) {
        const u = i.get(r);
        u && l.push(...u.parts);
      }
      if (a.hat) {
        const u = i.get(a.hat);
        if (u && u.parts.length > 0) {
          const d = u.parts[0];
          d && l.push(d);
        }
      }
      if (a.glasses) {
        const u = i.get(a.glasses);
        if (u && u.parts.length > 0) {
          const d = u.parts[0];
          d && l.push(d);
        }
      }
    }
  }
  return /* @__PURE__ */ x("group", { position: [t.x, t.y, t.z], children: [
    l.map((c) => /* @__PURE__ */ s(wx, { part: c }, c.id)),
    /* @__PURE__ */ x("mesh", { position: [0, 0.03, 0], rotation: [-Math.PI / 2, 0, 0], children: [
      /* @__PURE__ */ s("circleGeometry", { args: [1, 32] }),
      /* @__PURE__ */ s(
        "meshBasicMaterial",
        {
          color: "#00ff00",
          transparent: !0,
          opacity: 0.4,
          depthWrite: !1
        }
      )
    ] }),
    /* @__PURE__ */ x("mesh", { position: [0, 0.12, 0], children: [
      /* @__PURE__ */ s("sphereGeometry", { args: [0.08, 16, 16] }),
      /* @__PURE__ */ s("meshBasicMaterial", { color: "#38bdf8", depthWrite: !1 })
    ] })
  ] });
}
const _x = "studio-social-world", Sx = "Studio Social World", Mx = "1.0.0", Cx = (e, t) => {
  if (typeof window > "u" || typeof document > "u") return;
  const n = new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }), i = window.URL.createObjectURL(n), o = document.createElement("a");
  o.href = i, o.download = e, o.click(), window.URL.revokeObjectURL(i);
};
function Nx({
  gameplayEvents: e = bu,
  defaultSlot: t = "main",
  defaultBundleId: n = _x,
  defaultBundleName: i = Sx,
  defaultVersion: o = Mx,
  buildBundle: r,
  validateBundle: a = oh,
  onSaveWorld: l,
  onLoadWorld: c,
  onExportBundle: u,
  className: d = "",
  style: f,
  children: p
}) {
  const h = Pn((q) => q.ids), w = Pn((q) => q.records), g = X(
    () => h.map((q) => w[q]).filter((q) => !!q),
    [h, w]
  ), _ = we((q) => q.instances), b = X(
    () => Array.from(_.values()).map(
      (q) => h1(q, { id: `npc-behavior-${q.id}` })
    ),
    [_]
  ), S = X(
    () => b.map(
      (q) => m1(q, {
        id: `agent-behavior-${q.id}`,
        ownerType: "npc"
      })
    ),
    [b]
  ), [m, y] = le(t), [v, C] = le(n), [T, P] = le(i), [D, O] = le(o), [z, E] = le([]), [G, I] = le({ kind: "idle", message: "대기 중" }), [$, R] = le(null), [L, M] = le(!1), F = ce(() => {
    const q = {
      assets: g,
      bundleId: v,
      bundleName: T,
      version: D,
      gameplayEvents: e,
      npcBehaviorBlueprints: b,
      agentBehaviorBlueprints: S
    };
    return r ? r(q) : ih(Ui(), g, {
      id: v,
      name: T,
      version: D,
      gameplayEvents: e,
      npcBehaviorBlueprints: b,
      agentBehaviorBlueprints: S
    });
  }, [
    S,
    g,
    r,
    v,
    T,
    e,
    b,
    D
  ]), U = ce(async () => {
    const q = await Ui().list();
    E(q), I({ kind: "success", message: `저장 슬롯 ${q.length}개를 불러왔습니다.` });
  }, []), V = ce(async () => {
    l ? await l(m) : await Ui().save(m), I({ kind: "success", message: `슬롯 "${m}" 에 저장했습니다.` }), await U();
  }, [l, U, m]), Y = ce(async () => {
    const q = c ? await c(m) : await Ui().load(m), A = q === void 0 ? !0 : !!q;
    I({
      kind: A ? "success" : "error",
      message: A ? `슬롯 "${m}" 을 불러왔습니다.` : `슬롯 "${m}" 에 저장 데이터가 없습니다.`
    });
  }, [c, m]), Z = ce(() => {
    const q = a(F());
    R(q), I({
      kind: q.ok ? "success" : "error",
      message: q.ok ? "번들 검증이 통과했습니다." : `번들 오류 ${q.errors.length}개가 발견되었습니다.`
    });
  }, [F, a]), J = ce(() => {
    const q = F(), A = a(q);
    if (R(A), !A.ok) {
      I({ kind: "error", message: "번들 오류를 먼저 수정한 뒤 내보내세요." });
      return;
    }
    u ? u(q) : Cx(`${q.id}-${q.version}.bundle.json`, q), I({ kind: "success", message: "콘텐츠 번들 JSON을 내보냈습니다." });
  }, [F, u, a]);
  return /* @__PURE__ */ x("div", { className: `studio-panel ${d}`, style: f, children: [
    /* @__PURE__ */ x("section", { className: "studio-panel__section", children: [
      /* @__PURE__ */ s("div", { className: "studio-panel__title", children: "월드 저장 관리" }),
      /* @__PURE__ */ s("div", { className: "studio-panel__hint", children: "작업 중인 월드 상태를 슬롯 단위로 저장하거나 불러옵니다." }),
      /* @__PURE__ */ x("label", { className: "studio-panel__field", children: [
        /* @__PURE__ */ s("span", { children: "슬롯 이름" }),
        /* @__PURE__ */ s("input", { value: m, onChange: (q) => y(q.target.value || "main") })
      ] }),
      /* @__PURE__ */ x("div", { className: "studio-panel__actions", children: [
        /* @__PURE__ */ s("button", { type: "button", onClick: () => {
          V();
        }, children: "현재 월드 저장" }),
        /* @__PURE__ */ s("button", { type: "button", onClick: () => {
          Y();
        }, children: "슬롯 불러오기" }),
        /* @__PURE__ */ s("button", { type: "button", onClick: () => {
          U();
        }, children: "슬롯 새로고침" })
      ] }),
      z.length > 0 && /* @__PURE__ */ s("div", { className: "studio-panel__chips", children: z.map((q) => /* @__PURE__ */ s("button", { type: "button", onClick: () => y(q), children: q }, q)) })
    ] }),
    /* @__PURE__ */ x("section", { className: "studio-panel__section", children: [
      /* @__PURE__ */ s("div", { className: "studio-panel__title", children: "콘텐츠 번들" }),
      /* @__PURE__ */ s("div", { className: "studio-panel__hint", children: "배포용 번들을 검증하고 JSON으로 내보냅니다." }),
      /* @__PURE__ */ s(
        "button",
        {
          type: "button",
          onClick: () => M((q) => !q),
          className: "studio-panel__ghost",
          children: L ? "번들 상세 설정 접기" : "번들 상세 설정 열기"
        }
      ),
      L && /* @__PURE__ */ x("div", { className: "studio-panel__advanced", children: [
        /* @__PURE__ */ x("label", { className: "studio-panel__field", children: [
          /* @__PURE__ */ s("span", { children: "번들 ID" }),
          /* @__PURE__ */ s("input", { value: v, onChange: (q) => C(q.target.value) })
        ] }),
        /* @__PURE__ */ x("label", { className: "studio-panel__field", children: [
          /* @__PURE__ */ s("span", { children: "번들 이름" }),
          /* @__PURE__ */ s("input", { value: T, onChange: (q) => P(q.target.value) })
        ] }),
        /* @__PURE__ */ x("label", { className: "studio-panel__field", children: [
          /* @__PURE__ */ s("span", { children: "버전" }),
          /* @__PURE__ */ s("input", { value: D, onChange: (q) => O(q.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ x("div", { className: "studio-panel__meta", children: [
        "에셋 ",
        g.length,
        "개 · 이벤트 ",
        e.length,
        "개 · NPC 행동 ",
        b.length,
        "개 · 에이전트 행동 ",
        S.length,
        "개 · 세이브 도메인 ",
        Array.from(Ui().getBindings()).length,
        "개"
      ] }),
      /* @__PURE__ */ x("div", { className: "studio-panel__actions", children: [
        /* @__PURE__ */ s("button", { type: "button", onClick: Z, children: "번들 검증" }),
        /* @__PURE__ */ s("button", { type: "button", onClick: J, children: "JSON 내보내기" })
      ] })
    ] }),
    /* @__PURE__ */ x("section", { className: "studio-panel__section", children: [
      /* @__PURE__ */ s("div", { className: "studio-panel__title", children: "상태" }),
      /* @__PURE__ */ s("div", { className: `studio-panel__status studio-panel__status--${G.kind}`, children: G.message }),
      $ && !$.ok && /* @__PURE__ */ s("ul", { className: "studio-panel__errors", children: $.errors.map((q) => /* @__PURE__ */ s("li", { children: q }, q)) })
    ] }),
    p
  ] });
}
const Ix = "editor.panel";
function Tx(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  if (t.kind !== Ix || !t.panel || typeof t.panel != "object") return !1;
  const n = t.panel;
  return typeof n.id == "string" && typeof n.title == "string" && "component" in n;
}
function Ex(e) {
  return e.flatMap((t) => {
    if (!Tx(t.value)) return [];
    const n = t.value.panel, i = n.pluginId ?? t.pluginId;
    return i === void 0 ? [n] : [{ ...n, pluginId: i }];
  });
}
const Ax = ({
  children: e,
  panels: t = [],
  defaultActivePanels: n = ["tile", "camera"],
  defaultPanelOpen: i = !1,
  defaultModalOpen: o = !1,
  actions: r = [],
  hiddenBuiltInPanels: a = [],
  panelOrder: l,
  panelDefaults: c = {},
  validateBundle: u
}) => {
  const d = kp(), f = Pp(), p = X(
    () => d ? Ex(d.plugins.context.components.list()) : [],
    [d, f]
  ), h = X(() => {
    const D = [
      { id: "world", title: "전역", component: /* @__PURE__ */ s(H1, {}), defaultSide: "left" },
      { id: "wall", title: "벽", component: /* @__PURE__ */ s(G1, {}), defaultSide: "left" },
      { id: "tile", title: "타일", component: /* @__PURE__ */ s(W1, {}), defaultSide: "left" },
      { id: "block", title: "박스", component: /* @__PURE__ */ s(U1, {}), defaultSide: "left" },
      { id: "object", title: "오브젝트", component: /* @__PURE__ */ s(j1, {}), defaultSide: "left" },
      { id: "npc", title: "NPC", component: /* @__PURE__ */ s(V1, {}), defaultSide: "left" },
      { id: "character", title: "캐릭터", component: /* @__PURE__ */ s(K1, {}), defaultSide: "left" },
      { id: "vehicle", title: "탈것", component: /* @__PURE__ */ s(Lh, {}), defaultSide: "left" },
      { id: "animation", title: "애니메이션", component: /* @__PURE__ */ s(kh, {}), defaultSide: "left" },
      { id: "camera", title: "카메라", component: /* @__PURE__ */ s(xh, {}), defaultSide: "right" },
      { id: "motion", title: "모션", component: /* @__PURE__ */ s(zh, {}), defaultSide: "right" },
      { id: "performance", title: "성능", component: /* @__PURE__ */ s(Fh, {}), defaultSide: "right" },
      { id: "gameplay-events", title: "게임플레이 이벤트", component: /* @__PURE__ */ s(ex, {}), defaultSide: "right" },
      { id: "studio", title: "스튜디오", component: /* @__PURE__ */ s(Nx, { ...u ? { validateBundle: u } : {} }), defaultSide: "right" }
    ], O = new Set(a), z = /* @__PURE__ */ new Map();
    for (const I of D) {
      if (O.has(I.id)) continue;
      const $ = c[I.id] ?? {};
      z.set(I.id, { ...I, ...$ });
    }
    for (const I of p) {
      const $ = c[I.id] ?? {};
      z.set(I.id, { ...z.get(I.id), ...I, ...$ });
    }
    for (const I of t) {
      const $ = c[I.id] ?? {};
      z.set(I.id, { ...z.get(I.id), ...I, ...$ });
    }
    const E = l ?? [], G = [];
    for (const I of E) {
      const $ = z.get(I);
      $ && (G.push($), z.delete(I));
    }
    return [...G, ...z.values()];
  }, [p, a, c, l, t, u]), w = X(
    () => n.find((D) => h.some((O) => O.id === D)) ?? h[0]?.id ?? "",
    [n, h]
  ), [g, _] = le(w), [b, S] = le(i), [m, y] = le(o), v = X(
    () => /* @__PURE__ */ new Set(["npc", "gameplay-events", "studio"]),
    []
  ), C = h.some((D) => D.id === g) ? g : w, T = h.find((D) => D.id === C);
  oe(() => {
    C && _(C);
  }, [C]);
  const P = (D) => {
    const z = D === C ? !b : !0, E = z && v.has(D);
    _(D), S(z), y(E);
  };
  return /* @__PURE__ */ x("div", { className: "editor-root", children: [
    /* @__PURE__ */ x("aside", { className: `editor-sidebar ${b ? "editor-sidebar--open" : "editor-sidebar--collapsed"}`, "aria-label": "Editor sidebar", children: [
      /* @__PURE__ */ x("div", { className: "editor-sidebar-menu", children: [
        /* @__PURE__ */ x("div", { className: "editor-sidebar-header", children: [
          /* @__PURE__ */ s("div", { className: "editor-shell-title", children: "Editor" }),
          /* @__PURE__ */ s("div", { className: "editor-shell-status", children: b ? T?.title ?? "패널 없음" : "" })
        ] }),
        /* @__PURE__ */ s("nav", { className: "editor-panel-menu editor-panel-menu--flat", children: h.map((D) => /* @__PURE__ */ s(
          "button",
          {
            type: "button",
            onClick: () => P(D.id),
            className: `editor-panel-toggle ${C === D.id && b ? "active" : ""}`,
            title: D.title,
            children: D.title
          },
          D.id
        )) }),
        /* @__PURE__ */ x("div", { className: "editor-sidebar-footer", children: [
          r.length > 0 && /* @__PURE__ */ x("div", { className: "editor-menu-section", children: [
            /* @__PURE__ */ s("div", { className: "editor-region-label", children: "액션" }),
            r.map((D) => /* @__PURE__ */ s(
              "button",
              {
                type: "button",
                onClick: () => {
                  D.onClick();
                },
                className: "editor-panel-toggle",
                disabled: D.disabled,
                title: D.label,
                children: D.label
              },
              D.id
            ))
          ] }),
          /* @__PURE__ */ s("div", { className: "editor-shell-hint", children: "좌클릭 배치 · 우클릭 회전 · Q/E 높이 조절" })
        ] })
      ] }),
      b && !m && /* @__PURE__ */ x("section", { className: `editor-sidebar-panel ${T?.className ?? ""}`, children: [
        /* @__PURE__ */ x("div", { className: "editor-sidebar-panel-header", children: [
          /* @__PURE__ */ x("div", { children: [
            /* @__PURE__ */ s("div", { className: "editor-region-label", children: "패널" }),
            /* @__PURE__ */ s("h2", { children: T?.title ?? "패널" })
          ] }),
          /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              className: "editor-sidebar-close",
              onClick: () => y(!0),
              "aria-label": "패널 전면 열기",
              children: "전면"
            }
          ),
          /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              className: "editor-sidebar-close",
              onClick: () => S(!1),
              "aria-label": "패널 접기",
              children: "접기"
            }
          )
        ] }),
        /* @__PURE__ */ s("div", { className: "editor-sidebar-panel-content", style: T?.style, children: T?.component })
      ] })
    ] }),
    b && m && T && /* @__PURE__ */ s(
      "section",
      {
        className: `editor-panel-modal ${C === "npc" ? "editor-panel-modal--npc" : ""}`,
        "aria-label": `${T.title} panel modal`,
        children: /* @__PURE__ */ x("div", { className: `editor-panel-modal__surface ${T.className ?? ""}`, children: [
          /* @__PURE__ */ x("header", { className: "editor-panel-modal__header", children: [
            /* @__PURE__ */ x("div", { children: [
              /* @__PURE__ */ s("div", { className: "editor-region-label", children: "패널" }),
              /* @__PURE__ */ s("h2", { children: T.title })
            ] }),
            /* @__PURE__ */ x("div", { className: "editor-panel-modal__actions", children: [
              /* @__PURE__ */ s(
                "button",
                {
                  type: "button",
                  className: "editor-sidebar-close",
                  onClick: () => y(!1),
                  "aria-label": "패널 사이드바로",
                  children: "사이드바"
                }
              ),
              /* @__PURE__ */ s(
                "button",
                {
                  type: "button",
                  className: "editor-sidebar-close",
                  onClick: () => {
                    y(!1), S(!1);
                  },
                  "aria-label": "패널 닫기",
                  children: "닫기"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ s(
            "div",
            {
              className: `editor-panel-modal__content ${C === "npc" ? "editor-panel-modal__content--npc" : ""}`,
              style: T.style,
              children: T.component
            }
          )
        ] })
      }
    ),
    e
  ] });
}, Rc = {
  forward: !1,
  backward: !1,
  leftward: !1,
  rightward: !1,
  shift: !1,
  space: !1,
  keyZ: !1,
  keyR: !1,
  keyF: !1,
  keyE: !1,
  escape: !1
}, Dc = {
  isActive: !1,
  shouldRun: !1,
  isLookAround: !1
}, kx = (e) => ({
  ...e,
  ...e.smoothing ? { smoothing: { ...e.smoothing } } : {},
  ...e.bounds ? { bounds: { ...e.bounds } } : {},
  ...e.modeSettings ? { modeSettings: { ...e.modeSettings } } : {}
}), wM = ({
  children: e,
  className: t = "",
  style: n = {},
  shell: i
}) => {
  const o = ee(null);
  return oe(() => {
    const r = ze.getState();
    return o.current = {
      mode: { ...r.mode },
      cameraOption: kx(r.cameraOption),
      interactionActive: r.interaction.isActive
    }, r.stopAutomation(), r.updateKeyboard(Rc), r.updateMouse(Dc), r.setInteractionActive(!1), () => {
      const a = o.current;
      if (!a) return;
      const l = ze.getState();
      l.setMode(a.mode), l.replaceCameraOption(a.cameraOption), l.setInteractionActive(a.interactionActive), l.updateKeyboard(Rc), l.updateMouse(Dc);
    };
  }, []), /* @__PURE__ */ s(
    "div",
    {
      className: `gaesup-editor ${t}`,
      style: {
        ...n
      },
      children: /* @__PURE__ */ s(
        Ax,
        {
          ...i?.panels ? { panels: i.panels } : {},
          ...i?.defaultActivePanels ? { defaultActivePanels: i.defaultActivePanels } : {},
          ...typeof i?.defaultPanelOpen == "boolean" ? { defaultPanelOpen: i.defaultPanelOpen } : {},
          ...typeof i?.defaultModalOpen == "boolean" ? { defaultModalOpen: i.defaultModalOpen } : {},
          ...i?.actions ? { actions: i.actions } : {},
          ...i?.hiddenBuiltInPanels ? { hiddenBuiltInPanels: i.hiddenBuiltInPanels } : {},
          ...i?.panelOrder ? { panelOrder: i.panelOrder } : {},
          ...i?.panelDefaults ? { panelDefaults: i.panelDefaults } : {},
          ...i?.validate ? { validateBundle: i.validate } : {},
          children: e
        }
      )
    }
  );
}, Px = () => /* @__PURE__ */ s("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ s("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) }), Bx = () => /* @__PURE__ */ x("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ s("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ s("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] }), xM = ({
  children: e,
  title: t,
  initialWidth: n = 280,
  initialHeight: i = 400,
  minWidth: o = 200,
  minHeight: r = 150,
  maxWidth: a = 600,
  maxHeight: l = 800,
  resizeHandles: c = ["right"],
  className: u = "",
  style: d = {},
  onClose: f,
  onMinimize: p,
  draggable: h = !0,
  onDrop: w
}) => {
  const [g, _] = le({ width: n, height: i }), [b, S] = le({ x: 0, y: 0 }), [m, y] = le(!1), [v, C] = le(!1), [T, P] = le(""), [D, O] = le({ x: 0, y: 0 }), z = ee(null), E = ee(null), G = ce((L) => (M) => {
    M.preventDefault(), y(!0), P(L);
  }, []), I = ce((L) => {
    if (z.current)
      if (m) {
        const M = z.current.getBoundingClientRect();
        let F = g.width, U = g.height;
        T.includes("right") && (F = Math.min(a, Math.max(o, L.clientX - M.left))), T.includes("bottom") && (U = Math.min(l, Math.max(r, L.clientY - M.top))), _({ width: F, height: U });
      } else v && S({
        x: L.clientX - D.x,
        y: L.clientY - D.y
      });
  }, [m, v, T, g, o, a, r, l, D]), $ = ce(() => {
    v && w && w(b.x, b.y), y(!1), C(!1), P("");
  }, [v, w, b]), R = ce((L) => {
    if (!h || m) return;
    L.preventDefault(), C(!0);
    const M = z.current?.getBoundingClientRect();
    M && O({
      x: L.clientX - M.left,
      y: L.clientY - M.top
    });
  }, [h, m]);
  return oe(() => {
    if (m || v)
      return document.addEventListener("mousemove", I), document.addEventListener("mouseup", $), () => {
        document.removeEventListener("mousemove", I), document.removeEventListener("mouseup", $);
      };
  }, [m, v, I, $]), /* @__PURE__ */ x(
    "div",
    {
      ref: z,
      className: `rp-panel ${u} ${v ? "dragging" : ""}`,
      style: {
        width: `${g.width}px`,
        height: `${g.height}px`,
        ...v ? {
          position: "fixed",
          left: `${b.x}px`,
          top: `${b.y}px`,
          zIndex: 10003
        } : {},
        ...d
      },
      children: [
        /* @__PURE__ */ x(
          "div",
          {
            ref: E,
            className: "rp-header",
            onMouseDown: R,
            children: [
              /* @__PURE__ */ s("h3", { className: "rp-title", children: t }),
              /* @__PURE__ */ x("div", { className: "rp-controls", onMouseDown: (L) => L.stopPropagation(), children: [
                p && /* @__PURE__ */ s("button", { className: "rp-btn rp-btn--minimize", onClick: p, title: "최소화", children: /* @__PURE__ */ s(Px, {}) }),
                f && /* @__PURE__ */ s("button", { className: "rp-btn rp-btn--close", onClick: f, title: "닫기", children: /* @__PURE__ */ s(Bx, {}) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ s("div", { className: "rp-content", children: e }),
        c.map((L) => /* @__PURE__ */ s(
          "div",
          {
            className: `rp-resize-handle handle-${L}`,
            onMouseDown: G(L.replace("corner", "right bottom"))
          },
          L
        ))
      ]
    }
  );
}, ff = (e) => ({
  selectedObjectIds: [],
  setSelectedObjectIds: (t) => e({ selectedObjectIds: t }),
  layoutConfig: null,
  setLayoutConfig: (t) => e({ layoutConfig: t }),
  activeNodeGraph: null,
  setActiveNodeGraph: (t) => e({ activeNodeGraph: t }),
  clipboard: null,
  setClipboard: (t) => e({ clipboard: t })
}), _M = ff, Rx = yi(ff), SM = () => {
  const e = Rx();
  return {
    ...e,
    selectObject: (t) => e.setSelectedObjectIds([t]),
    selectMultiple: (t) => e.setSelectedObjectIds(t),
    clearSelection: () => e.setSelectedObjectIds([])
  };
};
function MM(e = {}) {
  const t = {
    panels: e.panels ?? [],
    actions: (e.commands ?? []).map((n) => ({
      id: n.id,
      label: n.label,
      onClick: n.run
    }))
  };
  return e.defaultActivePanels && (t.defaultActivePanels = e.defaultActivePanels), typeof e.defaultPanelOpen == "boolean" && (t.defaultPanelOpen = e.defaultPanelOpen), typeof e.defaultModalOpen == "boolean" && (t.defaultModalOpen = e.defaultModalOpen), e.hiddenBuiltInPanels && (t.hiddenBuiltInPanels = e.hiddenBuiltInPanels), e.panelOrder && (t.panelOrder = e.panelOrder), e.panelDefaults && (t.panelDefaults = e.panelDefaults), e.validate && (t.validate = e.validate), t;
}
function CM() {
  const e = [], t = [];
  return {
    execute: async (n) => {
      await n.run(), n.undo && (e.push(n), t.length = 0);
    },
    undo: async () => {
      const n = e.pop();
      n?.undo && (await n.undo(), t.push(n));
    },
    redo: async () => {
      const n = t.pop();
      n && (await n.run(), e.push(n));
    },
    canUndo: () => e.length > 0,
    canRedo: () => t.length > 0,
    clear: () => {
      e.length = 0, t.length = 0;
    }
  };
}
function Dx({
  area: e = 80,
  height: t = 18,
  count: n = 1200,
  kind: i,
  followCamera: o = !1
}) {
  const r = As((d) => d.current), a = ee(null), { geometry: l, material: c, kind: u } = X(() => {
    const d = i ?? r?.kind;
    if (d !== "rain" && d !== "snow" && d !== "storm" && d !== "wind")
      return { geometry: null, material: null, kind: null };
    const f = new Float32Array(n * 3), p = new Float32Array(n);
    for (let S = 0; S < n; S++)
      f[S * 3 + 0] = (Math.random() - 0.5) * e, f[S * 3 + 1] = Math.random() * t, f[S * 3 + 2] = (Math.random() - 0.5) * e, p[S] = d === "snow" ? 0.6 + Math.random() * 0.4 : d === "wind" ? 5 + Math.random() * 5 : 8 + Math.random() * 6;
    const h = new B.BufferGeometry();
    h.setAttribute("position", new B.BufferAttribute(f, 3)), h.setAttribute("aSpeed", new B.BufferAttribute(p, 1));
    const w = d === "snow", g = d === "wind", _ = d === "storm", b = new B.PointsMaterial({
      color: w ? 16777215 : g ? 14542832 : _ ? 8366296 : 10148351,
      size: w ? 0.18 : g ? 0.08 : 0.12,
      transparent: !0,
      opacity: w ? 0.85 : g ? 0.35 : _ ? 0.7 : 0.6,
      depthWrite: !1,
      sizeAttenuation: !0
    });
    return { geometry: h, material: b, kind: d };
  }, [i, r?.kind, e, t, n]);
  return oe(() => () => {
    l?.dispose(), c?.dispose();
  }, [l, c]), $e(({ camera: d }, f) => {
    const p = a.current;
    if (!p || !l || !u) return;
    o && p.position.set(d.position.x, d.position.y - t * 0.35, d.position.z);
    const h = l.getAttribute("position"), w = l.getAttribute("aSpeed"), g = h.array, _ = w.array, b = u === "snow" || u === "wind" ? 1 : 6;
    for (let S = 0; S < g.length; S += 3)
      u === "wind" ? (g[S + 0] += _[S / 3] * f * b, g[S + 1] += Math.sin((g[S + 0] + S) * 0.4) * f * 0.25) : g[S + 1] -= _[S / 3] * f * b, u === "snow" && (g[S + 0] += Math.sin((g[S + 1] + S) * 0.5) * f * 0.3), u === "wind" && g[S + 0] > e * 0.5 ? (g[S + 0] = -e * 0.5, g[S + 1] = Math.random() * t, g[S + 2] = (Math.random() - 0.5) * e) : g[S + 1] < 0 && (g[S + 0] = (Math.random() - 0.5) * e, g[S + 1] = t, g[S + 2] = (Math.random() - 0.5) * e);
    h.needsUpdate = !0;
  }), !l || !c ? null : /* @__PURE__ */ s("points", { ref: a, geometry: l, material: c, frustumCulled: !1 });
}
const zx = ["intel", "mali", "adreno 3", "adreno 4", "powervr"], Fx = ["swiftshader", "llvmpipe", "software"], zc = ["rtx", "radeon rx", "apple m", "apple a1", "apple a2"];
function Lx() {
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
  const e = document.createElement("canvas"), t = e.getContext("webgl2") ?? e.getContext("webgl");
  let n = "", i = "", o = 0, r = !1;
  if (t) {
    r = typeof WebGL2RenderingContext < "u" && t instanceof WebGL2RenderingContext, o = t.getParameter(t.MAX_TEXTURE_SIZE) || 0;
    const d = t.getExtension("WEBGL_debug_renderer_info");
    d && (n = String(t.getParameter(d.UNMASKED_RENDERER_WEBGL) || ""), i = String(t.getParameter(d.UNMASKED_VENDOR_WEBGL) || ""));
  }
  const a = navigator.hardwareConcurrency ?? 4, l = navigator.deviceMemory ?? 4, c = /android|iphone|ipad|ipod|mobile|opera mini/i.test(navigator.userAgent), u = Math.min(window.devicePixelRatio || 1, 2);
  return {
    webgl2: r,
    maxTextureSize: o,
    rendererName: n,
    vendorName: i,
    cores: a,
    memory: l,
    isMobile: c,
    pixelRatio: u
  };
}
function $x(e) {
  const t = e.rendererName.toLowerCase();
  return Fx.some((n) => t.includes(n)) ? "low" : e.isMobile ? zc.some((n) => t.includes(n)) ? "medium" : "low" : zx.some((n) => t.includes(n)) ? e.cores >= 8 && e.memory >= 8 ? "medium" : "low" : zc.some((n) => t.includes(n)) || e.cores >= 8 && e.memory >= 8 && e.webgl2 ? "high" : e.cores >= 4 && e.memory >= 4 ? "medium" : "low";
}
function qs(e) {
  return e === "high" ? {
    tier: e,
    instanceScale: 1,
    pixelRatio: 2,
    shadowMapSize: 2048,
    postprocess: !0,
    outline: !0
  } : e === "medium" ? {
    tier: e,
    instanceScale: 0.7,
    pixelRatio: 1.5,
    shadowMapSize: 1024,
    postprocess: !0,
    outline: !0
  } : {
    tier: e,
    instanceScale: 0.4,
    pixelRatio: 1,
    shadowMapSize: 512,
    postprocess: !1,
    outline: !1
  };
}
function Fc() {
  const e = Lx(), t = $x(e);
  return { profile: qs(t), capabilities: e };
}
const Ox = qs("medium"), Hx = yi((e) => ({
  profile: Ox,
  capabilities: null,
  manualOverride: !1,
  detect: () => {
    const { profile: t, capabilities: n } = Fc();
    e({ profile: t, capabilities: n, manualOverride: !1 });
  },
  setTier: (t) => {
    e({ profile: qs(t), manualOverride: !0 });
  },
  resetAuto: () => {
    const { profile: t, capabilities: n } = Fc();
    e({ profile: t, capabilities: n, manualOverride: !1 });
  }
})), Kt = /* @__PURE__ */ new Set(), lt = yi((e) => ({
  active: !1,
  version: 0,
  visibleTileGroupIds: Kt,
  visibleWallGroupIds: Kt,
  visibleBlockIds: Kt,
  visibleObjectIds: Kt,
  clusterCounts: new Uint32Array(0),
  setResult: ({ version: t, tileIds: n, wallIds: i, blockIds: o, objectIds: r, clusterCounts: a }) => e({
    active: !0,
    version: t,
    visibleTileGroupIds: n,
    visibleWallGroupIds: i,
    visibleBlockIds: o ?? Kt,
    visibleObjectIds: r,
    clusterCounts: a
  }),
  reset: () => e({
    active: !1,
    version: 0,
    visibleTileGroupIds: Kt,
    visibleWallGroupIds: Kt,
    visibleBlockIds: Kt,
    visibleObjectIds: Kt,
    clusterCounts: new Uint32Array(0)
  })
})), nn = 18, Tn = 140, Gx = 0.12, Wx = 8, Ux = 3.2, Lc = 2.4;
function zn(e, t) {
  return Math.floor(e / t);
}
function pf(e, t) {
  return `${e}:${t}`;
}
function jx(e, t, n, i, o = nn, r = Wx) {
  const a = zn(e, o), l = zn(t, o), c = Math.atan2(i, n), u = c < 0 ? c + Math.PI * 2 : c, d = Math.floor(u / (Math.PI * 2) * r) % r;
  return `${a}:${l}:${d}`;
}
function br(e, t, n, i = nn) {
  const o = Math.max(0, Math.ceil(t.radius / i));
  for (let r = t.cellZ - o; r <= t.cellZ + o; r += 1)
    for (let a = t.cellX - o; a <= t.cellX + o; a += 1)
      Vx(e, a, r, n);
}
function tr(e, t, n = nn) {
  br(e, t, t.id, n);
}
function Vx(e, t, n, i) {
  const o = pf(t, n), r = e.get(o);
  if (r) {
    r.push(i);
    return;
  }
  e.set(o, [i]);
}
function Qs(e, t, n, i, o, r, a, l) {
  const c = (t + n) * 0.5, u = (i + o) * 0.5, d = (r + a) * 0.5, f = n - t, p = o - i, h = a - r;
  return {
    id: e,
    centerX: c,
    centerY: u,
    centerZ: d,
    radius: Math.max(1, Math.hypot(f, p, h) * 0.5),
    cellX: zn(c, l),
    cellZ: zn(d, l)
  };
}
function hf(e, t = nn) {
  if (e.tiles.length === 0) return null;
  let n = 1 / 0, i = -1 / 0, o = 0, r = 0.2, a = 1 / 0, l = -1 / 0;
  for (const c of e.tiles) {
    const d = (c.size ?? 1) * 0.5;
    n = Math.min(n, c.position.x - d), i = Math.max(i, c.position.x + d), o = Math.min(o, 0), r = Math.max(r, Math.max(c.position.y, 0.2) + 1.5), a = Math.min(a, c.position.z - d), l = Math.max(l, c.position.z + d);
  }
  return Qs(e.id, n, i, o, r, a, l, t);
}
function mf(e, t = nn) {
  if (e.walls.length === 0) return null;
  let n = 1 / 0, i = -1 / 0, o = 0, r = 2.5, a = 1 / 0, l = -1 / 0;
  for (const c of e.walls)
    n = Math.min(n, c.position.x - 1.1), i = Math.max(i, c.position.x + 1.1), o = Math.min(o, c.position.y), r = Math.max(r, c.position.y + 3.5), a = Math.min(a, c.position.z - 1.1), l = Math.max(l, c.position.z + 1.1);
  return Qs(e.id, n, i, o, r, a, l, t);
}
function gf(e, t = nn) {
  const n = Math.max(1, Math.round(e.size?.x ?? 1)) * fe.GRID_CELL_SIZE, i = Math.max(1, Math.round(e.size?.y ?? 1)) * fe.HEIGHT_STEP, o = Math.max(1, Math.round(e.size?.z ?? 1)) * fe.GRID_CELL_SIZE, r = fe.GRID_CELL_SIZE * 0.5;
  return Qs(
    e.id,
    e.position.x - r,
    e.position.x - r + n,
    e.position.y,
    e.position.y + i,
    e.position.z - r,
    e.position.z - r + o,
    t
  );
}
function Zx(e) {
  const t = e.config?.size ?? 1;
  switch (e.type) {
    case "tree":
    case "sakura":
      return Math.max(2.2, t * 0.8);
    case "flag":
      return Math.max(1.4, (e.config?.flagWidth ?? 1.5) * 0.8);
    case "fire":
      return Math.max(1.2, e.config?.fireWidth ?? 1);
    case "billboard":
      return 1.8;
    default:
      return 1.5;
  }
}
function bf(e, t = nn) {
  const n = Zx(e);
  return {
    id: e.id,
    centerX: e.position.x,
    centerY: e.position.y + n * 0.5,
    centerZ: e.position.z,
    radius: n,
    cellX: zn(e.position.x, t),
    cellZ: zn(e.position.z, t)
  };
}
function Yx(e, t, n, i = [], o = nn) {
  const r = Array.isArray(i) ? i : [], a = typeof i == "number" ? i : o, l = {
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
  for (const c of t) {
    const u = hf(c, a);
    if (u && (l.tileById.set(u.id, u), tr(l.tileBuckets, u, a), u.radius >= Ux)) {
      const d = {
        ...u,
        key: `tile:${u.id}`,
        kind: "tile",
        strength: u.radius
      };
      l.occluderByKey.set(d.key, d), br(l.occluderBuckets, d, d.key, a);
    }
  }
  for (const c of e) {
    const u = mf(c, a);
    if (u && (l.wallById.set(u.id, u), tr(l.wallBuckets, u, a), u.radius >= Lc || c.walls.length >= 4)) {
      const d = {
        ...u,
        key: `wall:${u.id}`,
        kind: "wall",
        strength: u.radius * 1.15
      };
      l.occluderByKey.set(d.key, d), br(l.occluderBuckets, d, d.key, a);
    }
  }
  for (const c of r) {
    const u = gf(c, a);
    if (l.blockById.set(u.id, u), tr(l.blockBuckets, u, a), u.radius >= Lc || (c.size?.y ?? 1) >= 2) {
      const d = {
        ...u,
        key: `block:${u.id}`,
        kind: "block",
        strength: u.radius * 1.1
      };
      l.occluderByKey.set(d.key, d), br(l.occluderBuckets, d, d.key, a);
    }
  }
  for (const c of n) {
    const u = bf(c, a);
    l.objectById.set(u.id, u), tr(l.objectBuckets, u, a);
  }
  return l;
}
function nr(e, t, n, i = Tn, o = nn) {
  const r = zn(t, o), a = zn(n, o), l = Math.ceil(i / o), c = /* @__PURE__ */ new Set();
  for (let u = a - l; u <= a + l; u += 1)
    for (let d = r - l; d <= r + l; d += 1) {
      const f = e.get(pf(d, u));
      if (f)
        for (const p of f) c.add(p);
    }
  return c;
}
const Js = 0, el = 1, tl = 2, nl = 3, Xx = 0, yf = 1, vf = 2, wf = 3, xf = 4, Kx = 10, _f = 20, Sf = 21, hs = 22, Mf = 23, Cf = 24, qx = 30;
function Nf() {
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
function Qx(e, t, n, i) {
  let o = n.length + i.length;
  for (const r of e)
    r.walls.length > 0 && (o += 1);
  for (const r of t)
    r.tiles.length > 0 && (o += 1);
  return o;
}
function Jx(e) {
  const t = e.blocks ?? [], n = Qx(e.wallGroups, e.tileGroups, e.objects, t);
  if (n === 0)
    return { ...Nf(), version: e.version };
  const i = new Array(n), o = new Uint8Array(n), r = new Uint8Array(n), a = new Float32Array(n), l = new Float32Array(n), c = new Float32Array(n), u = new Float32Array(n), d = new Int16Array(n), f = new Int16Array(n), p = new Uint16Array(n);
  let h = 0;
  const w = (g, _, b, S, m) => {
    i[h] = g, o[h] = _, r[h] = b, a[h] = S.centerX, l[h] = S.centerY, c[h] = S.centerZ, u[h] = S.radius, d[h] = S.cellX, f[h] = S.cellZ, p[h] = m, h += 1;
  };
  for (const g of e.tileGroups) {
    const _ = hf(g);
    if (!_) continue;
    const b = g.tiles.find((m) => m.objectType && m.objectType !== "none")?.objectType ?? "none", S = b === "grass" ? yf : b === "water" ? vf : b === "sand" ? wf : b === "snowfield" ? xf : Xx;
    w(g.id, Js, S, _, g.tiles.length);
  }
  for (const g of e.wallGroups) {
    const _ = mf(g);
    _ && w(g.id, el, Kx, _, g.walls.length);
  }
  for (const g of t)
    w(g.id, nl, qx, gf(g), 1);
  for (const g of e.objects) {
    const _ = g.type === "tree" || g.type === "sakura" ? _f : g.type === "flag" ? Sf : g.type === "fire" ? hs : g.type === "billboard" ? Mf : g.type === "model" ? Cf : hs;
    w(g.id, tl, _, bf(g), 1);
  }
  return {
    version: e.version,
    ids: i,
    kinds: o,
    subKinds: r,
    centerX: a,
    centerY: l,
    centerZ: c,
    radius: u,
    cellX: d,
    cellZ: f,
    memberCount: p
  };
}
const So = 0, Mo = 1, Co = 2, No = 3, Io = 4, il = 5, ol = 6, rl = 7, al = 8, sl = 9, ll = 10, cl = 11, ul = 12;
function e_(e, t) {
  const n = e.kinds[t], i = e.subKinds[t];
  if (n === Js)
    return i === yf ? Mo : i === vf ? Co : i === wf ? No : i === xf ? Io : So;
  if (n === el)
    return il;
  if (n === nl)
    return ll;
  if (n === tl) {
    if (i === _f) return ol;
    if (i === Sf) return rl;
    if (i === hs) return al;
    if (i === Mf) return sl;
    if (i === Cf) return cl;
  }
  return So;
}
function t_(e, t) {
  const n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), a = new Uint32Array(ul), l = Math.min(e.ids.length, t.length);
  for (let c = 0; c < l; c += 1) {
    if ((t[c] ?? 0) === 0) continue;
    const u = e.ids[c];
    if (!u) continue;
    const d = e.kinds[c];
    d === Js ? n.add(u) : d === el ? i.add(u) : d === nl ? o.add(u) : d === tl && r.add(u);
    const f = e_(e, c);
    a[f] = (a[f] ?? 0) + 1;
  }
  return {
    version: e.version,
    tileIds: n,
    wallIds: i,
    blockIds: o,
    objectIds: r,
    clusterCounts: a
  };
}
const Rt = 4;
function st(e, t) {
  const n = t * Rt;
  return e.args[n + 1] ?? 0;
}
const n_ = [
  { id: So, label: "tile", vertexCountHint: 36 },
  { id: Mo, label: "grass", vertexCountHint: 36 },
  { id: Co, label: "water", vertexCountHint: 36 },
  { id: No, label: "sand", vertexCountHint: 36 },
  { id: Io, label: "snowfield", vertexCountHint: 36 },
  { id: il, label: "wall", vertexCountHint: 36 },
  { id: ol, label: "sakura", vertexCountHint: 12 },
  { id: rl, label: "flag", vertexCountHint: 12 },
  { id: al, label: "fire", vertexCountHint: 6 },
  { id: sl, label: "billboard", vertexCountHint: 6 },
  { id: ll, label: "block", vertexCountHint: 36 },
  { id: cl, label: "model", vertexCountHint: 36 }
];
function If() {
  return {
    version: 0,
    args: new Uint32Array(ul * Rt),
    dirtyRanges: []
  };
}
function i_(e, t) {
  if (e.length !== t.length)
    return t.length > 0 ? [{ start: 0, end: t.length / Rt }] : [];
  const n = [];
  let i = -1;
  const o = t.length / Rt;
  for (let r = 0; r < o; r += 1) {
    const a = r * Rt;
    let l = !1;
    for (let c = 0; c < Rt; c += 1)
      if ((e[a + c] ?? 0) !== (t[a + c] ?? 0)) {
        l = !0;
        break;
      }
    if (l) {
      i < 0 && (i = r);
      continue;
    }
    i >= 0 && (n.push({ start: i, end: r }), i = -1);
  }
  return i >= 0 && n.push({ start: i, end: o }), n;
}
function o_(e, t, n) {
  const i = new Uint32Array(ul * Rt);
  for (const r of n_) {
    const a = r.id * Rt;
    i[a] = r.vertexCountHint, i[a + 1] = t[r.id] ?? 0, i[a + 2] = 0, i[a + 3] = 0;
  }
  const o = n ?? If();
  return {
    version: e,
    args: i,
    dirtyRanges: i_(o.args, i)
  };
}
function r_(e) {
  return {
    version: e.version,
    slices: e.dirtyRanges.map((t) => {
      const n = t.start * Rt, i = (t.end - t.start) * Rt;
      return {
        byteOffset: n * e.args.BYTES_PER_ELEMENT,
        elementOffset: n,
        elementCount: i,
        data: e.args.subarray(n, n + i)
      };
    })
  };
}
const Pr = 4, Br = 5;
function Tf() {
  return {
    version: 0,
    count: 0,
    spatial: new Float32Array(0),
    meta: new Int32Array(0),
    spatialDirty: [],
    metaDirty: []
  };
}
function a_(e) {
  const t = new Float32Array(e.ids.length * Pr);
  for (let n = 0; n < e.ids.length; n += 1) {
    const i = n * Pr;
    t[i] = e.centerX[n] ?? 0, t[i + 1] = e.centerY[n] ?? 0, t[i + 2] = e.centerZ[n] ?? 0, t[i + 3] = e.radius[n] ?? 0;
  }
  return t;
}
function s_(e) {
  const t = new Int32Array(e.ids.length * Br);
  for (let n = 0; n < e.ids.length; n += 1) {
    const i = n * Br;
    t[i] = e.cellX[n] ?? 0, t[i + 1] = e.cellZ[n] ?? 0, t[i + 2] = e.kinds[n] ?? 0, t[i + 3] = e.subKinds[n] ?? 0, t[i + 4] = e.memberCount[n] ?? 0;
  }
  return t;
}
function $c(e, t, n) {
  if (e.length !== t.length)
    return t.length > 0 ? [{ start: 0, end: Math.ceil(t.length / n) }] : [];
  const i = [];
  let o = -1;
  const r = Math.ceil(t.length / n);
  for (let a = 0; a < r; a += 1) {
    const l = a * n;
    let c = !1;
    for (let u = 0; u < n; u += 1)
      if ((e[l + u] ?? 0) !== (t[l + u] ?? 0)) {
        c = !0;
        break;
      }
    if (c) {
      o < 0 && (o = a);
      continue;
    }
    o >= 0 && (i.push({ start: o, end: a }), o = -1);
  }
  return o >= 0 && i.push({ start: o, end: r }), i;
}
function l_(e, t) {
  const n = a_(e), i = s_(e), o = t ?? Tf();
  return {
    version: e.version,
    count: e.ids.length,
    spatial: n,
    meta: i,
    spatialDirty: $c(o.spatial, n, Pr),
    metaDirty: $c(o.meta, i, Br)
  };
}
function Oc(e, t, n) {
  return n.map((i) => {
    const o = i.start * t, r = (i.end - i.start) * t;
    return {
      byteOffset: o * e.BYTES_PER_ELEMENT,
      elementOffset: o,
      elementCount: r,
      data: e.subarray(o, o + r)
    };
  });
}
function c_(e) {
  return {
    version: e.version,
    count: e.count,
    spatial: Oc(e.spatial, Pr, e.spatialDirty),
    meta: Oc(e.meta, Br, e.metaDirty)
  };
}
const u_ = 8, d_ = 128;
function Rr() {
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
function dl(e) {
  if (typeof e != "object" || e === null) return null;
  const t = e, n = t.backend?.device ?? t.device ?? null;
  return !n || typeof n.createBuffer != "function" || typeof n.queue?.writeBuffer != "function" ? null : n;
}
function so(e) {
  e?.destroy && e.destroy();
}
function f_(e) {
  so(e.spatialBuffer), so(e.metaBuffer), so(e.indirectArgsBuffer);
}
function ms(e, t, n, i, o) {
  return i <= 0 ? (so(t), null) : t && n === i ? t : (so(t), e.createBuffer({
    label: o,
    size: i,
    usage: d_ | u_
  }));
}
function p_(e, t, n) {
  const i = c_(n), o = n.spatial.byteLength, r = n.meta.byteLength, a = ms(
    e,
    t.spatialBuffer,
    t.spatialBytes,
    o,
    "building-spatial"
  ), l = ms(
    e,
    t.metaBuffer,
    t.metaBytes,
    r,
    "building-meta"
  );
  if (a)
    for (const c of i.spatial)
      e.queue.writeBuffer(a, c.byteOffset, c.data);
  if (l)
    for (const c of i.meta)
      e.queue.writeBuffer(l, c.byteOffset, c.data);
  return {
    backend: "webgpu",
    uploadedVersion: n.version,
    spatialBuffer: a,
    metaBuffer: l,
    indirectArgsBuffer: t.indirectArgsBuffer,
    spatialBytes: o,
    metaBytes: r,
    indirectArgsBytes: t.indirectArgsBytes
  };
}
function h_(e, t, n) {
  const i = r_(n), o = n.args.byteLength, r = ms(
    e,
    t.indirectArgsBuffer,
    t.indirectArgsBytes,
    o,
    "building-indirect-args"
  );
  if (r)
    for (const a of i.slices)
      e.queue.writeBuffer(r, a.byteOffset, a.data);
  return {
    ...t,
    backend: "webgpu",
    uploadedVersion: Math.max(t.uploadedVersion, n.version),
    indirectArgsBuffer: r,
    indirectArgsBytes: o
  };
}
const Hc = Nf(), Gc = Tf(), Wc = Rr(), Uc = If(), Ue = yi((e) => ({
  snapshot: Hc,
  gpuMirror: Gc,
  uploadResources: Wc,
  drawMirror: Uc,
  setSnapshot: (t) => e({ snapshot: t }),
  setGpuMirror: (t) => e({ gpuMirror: t }),
  setUploadResources: (t) => e({ uploadResources: t }),
  setDrawMirror: (t) => e({ drawMirror: t }),
  reset: () => e({ snapshot: Hc, gpuMirror: Gc, uploadResources: Wc, drawMirror: Uc })
}));
function ir(e, t) {
  if (e === t) return !0;
  if (e.size !== t.size) return !1;
  for (const n of e)
    if (!t.has(n)) return !1;
  return !0;
}
const qt = /* @__PURE__ */ new Set(), ci = yi((e) => ({
  initialized: !1,
  visibleTileGroupIds: qt,
  visibleWallGroupIds: qt,
  visibleBlockIds: qt,
  visibleObjectIds: qt,
  setVisible: ({ tileIds: t, wallIds: n, blockIds: i, objectIds: o }) => e((r) => {
    const a = !ir(r.visibleTileGroupIds, t), l = !ir(r.visibleWallGroupIds, n), c = i ?? qt, u = !ir(r.visibleBlockIds, c), d = !ir(r.visibleObjectIds, o);
    return !a && !l && !u && !d && r.initialized ? r : {
      initialized: !0,
      visibleTileGroupIds: a ? t : r.visibleTileGroupIds,
      visibleWallGroupIds: l ? n : r.visibleWallGroupIds,
      visibleBlockIds: u ? c : r.visibleBlockIds,
      visibleObjectIds: d ? o : r.visibleObjectIds
    };
  }),
  reset: () => e({
    initialized: !1,
    visibleTileGroupIds: qt,
    visibleWallGroupIds: qt,
    visibleBlockIds: qt,
    visibleObjectIds: qt
  })
}));
var m_ = Object.defineProperty, g_ = Object.getOwnPropertyDescriptor, Fo = (e, t, n, i) => {
  for (var o = g_(t, n), r = e.length - 1, a; r >= 0; r--)
    (a = e[r]) && (o = a(t, n, o) || o);
  return o && m_(t, n, o), o;
};
class Fn {
  materials = /* @__PURE__ */ new Map();
  textures = /* @__PURE__ */ new Map();
  textureLoader;
  constructor() {
    this.textureLoader = new B.TextureLoader();
  }
  getMaterial(t) {
    const n = this.createMaterialKey(t), i = this.materials.get(n);
    if (i) return i;
    const o = this.createMaterial(t);
    return this.materials.set(n, o), o;
  }
  createMaterialKey(t) {
    return [
      t.id,
      t.assetId ?? "",
      t.color ?? t.materialParams?.color ?? "",
      t.material ?? "",
      t.textureUrl ?? "",
      t.mapTextureUrl ?? t.materialParams?.mapTextureUrl ?? "",
      t.normalTextureUrl ?? t.materialParams?.normalTextureUrl ?? "",
      t.roughness ?? t.materialParams?.roughness ?? "",
      t.metalness ?? t.materialParams?.metalness ?? "",
      t.opacity ?? t.materialParams?.opacity ?? "",
      t.transparent ?? t.materialParams?.transparent ?? ""
    ].join("|");
  }
  createMaterial(t) {
    const n = t.color ?? t.materialParams?.color ?? "#ffffff", i = t.roughness ?? t.materialParams?.roughness ?? 0.5, o = t.metalness ?? t.materialParams?.metalness ?? 0, r = t.opacity ?? t.materialParams?.opacity ?? 1, a = t.transparent ?? t.materialParams?.transparent ?? !1, l = t.mapTextureUrl ?? t.textureUrl ?? t.materialParams?.mapTextureUrl, c = t.normalTextureUrl ?? t.materialParams?.normalTextureUrl, u = {
      color: n,
      roughness: i,
      metalness: o,
      opacity: r,
      transparent: a
    };
    if (We()) {
      const d = t.material === "GLASS", f = new B.MeshToonMaterial({
        color: n,
        opacity: d ? 0.45 : r,
        transparent: d ? !0 : a,
        gradientMap: En(d ? 2 : 4)
      });
      return l && (f.map = this.loadTexture(l)), c && (f.normalMap = this.loadTexture(c)), f;
    }
    return t.material === "GLASS" ? new B.MeshPhysicalMaterial({
      ...u,
      transmission: 0.98,
      roughness: 0.1,
      envMapIntensity: 1
    }) : (l && (u.map = this.loadTexture(l)), c && (u.normalMap = this.loadTexture(c)), new B.MeshStandardMaterial(u));
  }
  // 텍스처는 메모리를 많이 사용할 수 있음
  loadTexture(t) {
    const n = this.textures.get(t);
    if (n) return n;
    const i = this.textureLoader.load(t);
    return i.wrapS = B.RepeatWrapping, i.wrapT = B.RepeatWrapping, i.needsUpdate = !0, this.textures.set(t, i), i;
  }
  updateMaterial(t, n) {
    const i = this.materials.get(t);
    i && (i instanceof B.MeshStandardMaterial ? (n.color && i.color.set(n.color), n.roughness !== void 0 && (i.roughness = n.roughness), n.metalness !== void 0 && (i.metalness = n.metalness), n.opacity !== void 0 && (i.opacity = n.opacity), i.needsUpdate = !0) : i instanceof B.MeshToonMaterial && (n.color && i.color.set(n.color), n.opacity !== void 0 && (i.opacity = n.opacity), i.needsUpdate = !0));
  }
  dispose() {
    this.materials.forEach((t) => t.dispose()), this.materials.clear(), this.textures.forEach((t) => t.dispose()), this.textures.clear();
  }
}
Fo([
  Eo(),
  xs()
], Fn.prototype, "getMaterial");
Fo([
  Eo(),
  xs()
], Fn.prototype, "createMaterial");
Fo([
  Eo(),
  Cp(20)
], Fn.prototype, "loadTexture");
Fo([
  Eo(),
  xs()
], Fn.prototype, "updateMaterial");
Fo([
  Eo()
], Fn.prototype, "dispose");
const jc = {
  id: "default-block",
  color: "#8b8174",
  material: "STANDARD",
  roughness: 0.92
};
function b_(e) {
  return {
    width: Math.max(1, Math.round(e.size?.x ?? 1)) * fe.GRID_CELL_SIZE,
    height: Math.max(1, Math.round(e.size?.y ?? 1)) * fe.HEIGHT_STEP,
    depth: Math.max(1, Math.round(e.size?.z ?? 1)) * fe.GRID_CELL_SIZE
  };
}
function gs(e) {
  const { width: t, height: n, depth: i } = b_(e);
  return {
    position: [
      e.position.x - fe.GRID_CELL_SIZE * 0.5 + t * 0.5,
      e.position.y + n * 0.5,
      e.position.z - fe.GRID_CELL_SIZE * 0.5 + i * 0.5
    ],
    scale: [t, n, i]
  };
}
function y_({
  blocks: e,
  meshes: t,
  isEditMode: n = !1,
  selectedBlockId: i = null,
  onBlockClick: o
}) {
  const r = ee(new Fn()), a = X(() => new B.Object3D(), []), l = X(() => new B.BoxGeometry(1, 1, 1), []), c = X(
    () => new B.MeshStandardMaterial({
      color: "#60a5fa",
      transparent: !0,
      opacity: 0.16,
      emissive: new B.Color("#2563eb"),
      emissiveIntensity: 0.08,
      wireframe: !0,
      depthWrite: !1
    }),
    []
  ), u = X(
    () => new B.MeshStandardMaterial({
      color: "#bae6fd",
      transparent: !0,
      opacity: 0.28,
      emissive: new B.Color("#60a5fa"),
      emissiveIntensity: 0.2,
      wireframe: !0,
      depthWrite: !1
    }),
    []
  ), d = X(() => {
    const f = /* @__PURE__ */ new Map();
    for (const h of e) {
      const w = h.materialId ?? jc.id, g = f.get(w) ?? [];
      g.push(h), f.set(w, g);
    }
    const p = r.current;
    return Array.from(f.entries()).map(([h, w]) => ({
      key: h,
      blocks: w,
      material: p.getMaterial(t.get(h) ?? { ...jc, id: h })
    }));
  }, [e, t]);
  return oe(() => () => {
    r.current.dispose(), l.dispose(), c.dispose(), u.dispose();
  }, [c, l, u]), /* @__PURE__ */ x(be, { children: [
    !n && e.length > 0 && /* @__PURE__ */ s(Wr, { type: "fixed", colliders: !1, children: e.map((f) => {
      const p = gs(f);
      return /* @__PURE__ */ s(
        Cs,
        {
          position: p.position,
          args: [
            p.scale[0] * 0.5,
            p.scale[1] * 0.5,
            p.scale[2] * 0.5
          ]
        },
        f.id
      );
    }) }),
    d.map((f) => /* @__PURE__ */ s(
      v_,
      {
        batch: f,
        geometry: l,
        dummy: a
      },
      f.key
    )),
    n && e.map((f) => {
      const p = gs(f), h = f.id === i;
      return /* @__PURE__ */ s(
        "mesh",
        {
          name: `block-edit-${f.id}`,
          position: p.position,
          scale: [
            p.scale[0] * 0.82,
            p.scale[1] * 0.82,
            p.scale[2] * 0.82
          ],
          geometry: l,
          material: h ? u : c,
          onClick: () => o?.(f.id)
        },
        `${f.id}-edit`
      );
    })
  ] });
}
function v_({
  batch: e,
  geometry: t,
  dummy: n
}) {
  const i = ee(null);
  return Ke(() => {
    const o = i.current;
    if (o) {
      o.count = e.blocks.length;
      for (let r = 0; r < e.blocks.length; r += 1) {
        const a = e.blocks[r];
        if (!a) continue;
        const l = gs(a);
        n.position.set(...l.position), n.scale.set(...l.scale), n.rotation.set(0, 0, 0), n.updateMatrix(), o.setMatrixAt(r, n.matrix);
      }
      o.instanceMatrix.needsUpdate = !0, e.blocks.length > 0 && (o.computeBoundingBox(), o.computeBoundingSphere());
    }
  }, [e.blocks, n]), /* @__PURE__ */ s(
    "instancedMesh",
    {
      ref: i,
      name: `block-system-${e.key}`,
      args: [t, e.material, Math.max(1, e.blocks.length)],
      castShadow: !0,
      receiveShadow: !0
    }
  );
}
function w_({
  size: e = fe.DEFAULT_GRID_SIZE,
  divisions: t = e / fe.GRID_CELL_SIZE,
  color1: n = "#888888",
  color2: i = "#444444"
}) {
  return /* @__PURE__ */ s(
    "gridHelper",
    {
      args: [e, t, n, i],
      position: [0, 0.01, 0]
    }
  );
}
function Ef(e, t, n, i) {
  const o = document.createElement("canvas"), r = 512, a = Math.round(r * (n / t));
  o.width = r, o.height = a;
  const l = o.getContext("2d");
  l.fillStyle = "#0a0a0a", l.fillRect(0, 0, r, a), l.strokeStyle = "#333", l.lineWidth = 4, l.strokeRect(2, 2, r - 4, a - 4), l.fillStyle = i;
  const c = Math.floor(a * 0.25);
  l.font = `bold ${c}px monospace`, l.textAlign = "center", l.textBaseline = "middle";
  const u = e.split(`
`), d = c * 1.3, f = a / 2 - (u.length - 1) * d / 2;
  u.forEach((h, w) => {
    l.fillText(h, r / 2, f + w * d, r - 20);
  });
  const p = new B.CanvasTexture(o);
  return p.needsUpdate = !0, p;
}
const Af = 20, kf = 100, Pf = 3, Mi = new B.Object3D(), x_ = 1.5, __ = 1, S_ = 4;
function Bf(e) {
  const t = e?.image;
  return !t?.width || !t?.height ? null : t.width / t.height;
}
function Rf(e, t, n) {
  const i = t ?? x_;
  return { width: e && e > 0 ? e : B.MathUtils.clamp(i * (n ?? 4 / 3), __, S_), height: i };
}
function M_({
  imageUrl: e,
  width: t,
  height: n,
  scale: i,
  color: o,
  elevation: r,
  intensity: a,
  toon: l
}) {
  const c = ee(null), u = ee(null), d = ee(null), f = X(() => new B.Vector3(), []), h = l ?? We() ? En(3) : null, w = Ts(e), g = Bf(w), _ = Rf(t, n, g), b = i ?? 1, S = _.width * b, m = _.height * b, y = X(
    () => new B.Color(o || "#00ff88"),
    [o]
  ), v = r ?? 1, C = a ?? 2, T = X(() => new B.PlaneGeometry(S, m), [S, m]), P = X(() => new B.BoxGeometry(S * 1.08, m * 1.12, 0.08), [S, m]), D = X(
    () => new B.PlaneGeometry(S * 1.15, m * 1.15),
    [S, m]
  );
  return $e((O) => {
    c.current.getWorldPosition(f);
    const z = O.camera.position.distanceTo(f), E = Ao(z, Af, kf, Pf);
    u.current.emissiveIntensity = C * E, d.current.opacity = (0.14 + C * 0.055 + 0.05 * Math.sin(O.clock.elapsedTime * 2)) * E;
  }), oe(
    () => () => {
      T.dispose(), P.dispose(), D.dispose();
    },
    [T, P, D]
  ), /* @__PURE__ */ x("group", { position: [0, m / 2 + v, 0], children: [
    /* @__PURE__ */ s("mesh", { geometry: P, position: [0, 0, -0.045], castShadow: !0, receiveShadow: !0, children: /* @__PURE__ */ s("meshStandardMaterial", { color: "#07090b", roughness: 0.68, metalness: 0.18 }) }),
    /* @__PURE__ */ s("mesh", { geometry: D, position: [0, 0, -0.01], children: /* @__PURE__ */ s(
      "meshBasicMaterial",
      {
        ref: d,
        color: y,
        transparent: !0,
        opacity: 0.25,
        blending: B.AdditiveBlending,
        depthWrite: !1,
        side: B.DoubleSide
      }
    ) }),
    /* @__PURE__ */ s("mesh", { ref: c, geometry: T, position: [0, 0, 0.012], children: h ? /* @__PURE__ */ s(
      "meshToonMaterial",
      {
        ref: u,
        map: w,
        emissive: y,
        emissiveIntensity: C,
        gradientMap: h,
        side: B.DoubleSide,
        transparent: !0
      }
    ) : /* @__PURE__ */ s(
      "meshStandardMaterial",
      {
        ref: u,
        map: w,
        emissive: y,
        emissiveIntensity: C,
        side: B.DoubleSide,
        transparent: !0
      }
    ) })
  ] });
}
function C_({ text: e, width: t, height: n, scale: i, color: o, elevation: r, intensity: a, toon: l }) {
  const c = ee(null), u = ee(null), d = ee(null), f = X(() => new B.Vector3(), []), h = l ?? We() ? En(3) : null, w = i ?? 1, g = (t ?? 2) * w, _ = (n ?? 1.5) * w, b = o || "#00ff88", S = r ?? 1, m = a ?? 2, y = X(
    () => Ef(e || "HELLO", g, _, b),
    [e, g, _, b]
  ), v = X(() => new B.Color(b), [b]), C = X(() => new B.PlaneGeometry(g, _), [g, _]), T = X(() => new B.BoxGeometry(g * 1.08, _ * 1.12, 0.08), [g, _]), P = X(
    () => new B.PlaneGeometry(g * 1.15, _ * 1.15),
    [g, _]
  );
  return $e((D) => {
    c.current.getWorldPosition(f);
    const O = D.camera.position.distanceTo(f), z = Ao(O, Af, kf, Pf);
    u.current.emissiveIntensity = m * z, d.current.opacity = (0.14 + m * 0.055 + 0.05 * Math.sin(D.clock.elapsedTime * 2)) * z;
  }), oe(
    () => () => {
      C.dispose(), T.dispose(), P.dispose(), y.dispose();
    },
    [C, T, P, y]
  ), /* @__PURE__ */ x("group", { position: [0, _ / 2 + S, 0], children: [
    /* @__PURE__ */ s("mesh", { geometry: T, position: [0, 0, -0.045], castShadow: !0, receiveShadow: !0, children: /* @__PURE__ */ s("meshStandardMaterial", { color: "#07090b", roughness: 0.68, metalness: 0.18 }) }),
    /* @__PURE__ */ s("mesh", { geometry: P, position: [0, 0, -0.01], children: /* @__PURE__ */ s(
      "meshBasicMaterial",
      {
        ref: d,
        color: v,
        transparent: !0,
        opacity: 0.25,
        blending: B.AdditiveBlending,
        depthWrite: !1,
        side: B.DoubleSide
      }
    ) }),
    /* @__PURE__ */ s("mesh", { ref: c, geometry: C, position: [0, 0, 0.012], children: h ? /* @__PURE__ */ s(
      "meshToonMaterial",
      {
        ref: u,
        map: y,
        emissive: v,
        emissiveIntensity: m,
        gradientMap: h,
        side: B.DoubleSide
      }
    ) : /* @__PURE__ */ s(
      "meshStandardMaterial",
      {
        ref: u,
        map: y,
        emissive: v,
        emissiveIntensity: m,
        side: B.DoubleSide
      }
    ) })
  ] });
}
const N_ = (e) => e.imageUrl ? /* @__PURE__ */ s(M_, { ...e, imageUrl: e.imageUrl }) : /* @__PURE__ */ s(C_, { ...e });
function Df({
  entries: e,
  texture: t,
  color: n,
  width: i,
  height: o
}) {
  const r = ee(null), a = ee(null), l = ee(null), c = ee(null), u = ee(null), d = ee(0), f = e.length, p = Math.max(1, f), h = X(() => new B.Color(n), [n]), w = X(() => {
    const m = new B.PlaneGeometry(i, o);
    return m.translate(0, 0, 0.052), m;
  }, [o, i]), g = X(() => new B.BoxGeometry(i * 1.08, o * 1.12, 0.08), [o, i]), _ = X(() => {
    const m = new B.PlaneGeometry(i * 1.18, o * 1.18);
    return m.translate(0, 0, 0.046), m;
  }, [o, i]), b = X(
    () => Math.min(0.72, 0.14 + Math.max(...e.map((m) => m.intensity)) * 0.055),
    [e]
  ), S = X(
    () => new B.MeshStandardMaterial({ color: "#07090b", roughness: 0.68, metalness: 0.18 }),
    []
  );
  return Ke(() => {
    const m = r.current, y = a.current, v = l.current;
    if (!(!m || !y || !v)) {
      m.count = f, y.count = f, v.count = f;
      for (let C = 0; C < f; C += 1) {
        const T = e[C];
        T && (Mi.position.set(T.x, T.y + o / 2 + T.elevation, T.z), Mi.rotation.set(0, T.rotation, 0), Mi.updateMatrix(), m.setMatrixAt(C, Mi.matrix), y.setMatrixAt(C, Mi.matrix), v.setMatrixAt(C, Mi.matrix));
      }
      m.instanceMatrix.needsUpdate = !0, y.instanceMatrix.needsUpdate = !0, v.instanceMatrix.needsUpdate = !0, m.computeBoundingSphere(), y.computeBoundingSphere(), v.computeBoundingSphere();
    }
  }, [f, e, o]), $e((m, y) => {
    if (d.current += Math.max(0, y), d.current < 1 / 20) return;
    d.current = 0;
    const v = b + 0.05 * Math.sin(m.clock.elapsedTime * 2);
    u.current && (u.current.opacity = v);
  }), oe(() => () => {
    w.dispose(), g.dispose(), _.dispose(), S.dispose();
  }, [_, w, g, S]), f === 0 ? null : /* @__PURE__ */ x(be, { children: [
    /* @__PURE__ */ s(
      "instancedMesh",
      {
        ref: r,
        args: [g, S, p],
        castShadow: !0,
        receiveShadow: !0,
        frustumCulled: !0
      }
    ),
    /* @__PURE__ */ s("instancedMesh", { ref: l, args: [_, void 0, p], frustumCulled: !0, children: /* @__PURE__ */ s(
      "meshBasicMaterial",
      {
        ref: u,
        color: h,
        transparent: !0,
        opacity: b,
        blending: B.AdditiveBlending,
        depthWrite: !1,
        side: B.DoubleSide,
        toneMapped: !1
      }
    ) }),
    /* @__PURE__ */ s("instancedMesh", { ref: a, args: [w, void 0, p], frustumCulled: !0, children: /* @__PURE__ */ s(
      "meshBasicMaterial",
      {
        ref: c,
        map: t,
        color: h,
        side: B.DoubleSide,
        transparent: !0,
        toneMapped: !1
      }
    ) })
  ] });
}
function I_({ entries: e }) {
  const t = e[0], n = Ts(t?.imageUrl ?? ""), i = Rf(t?.width, t?.height, Bf(n));
  return t ? /* @__PURE__ */ s(
    Df,
    {
      entries: e,
      texture: n,
      color: t.color,
      width: i.width,
      height: i.height
    }
  ) : null;
}
function T_({ entries: e }) {
  const t = e[0], n = X(
    () => Ef(t?.text ?? "HELLO", t?.width ?? 2, t?.height ?? 1.5, t?.color ?? "#00ff88"),
    [t?.color, t?.height, t?.text, t?.width]
  );
  return oe(() => () => {
    n.dispose();
  }, [n]), t ? /* @__PURE__ */ s(
    Df,
    {
      entries: e,
      texture: n,
      color: t.color,
      width: t.width,
      height: t.height
    }
  ) : null;
}
const E_ = ge.memo(function({ billboards: t }) {
  const n = X(() => {
    const i = /* @__PURE__ */ new Map();
    for (const o of t) {
      const r = o.config?.billboardScale ?? 1, a = (o.config?.billboardHeight ?? 1.5) * r, l = o.config?.billboardWidth, c = o.config?.billboardColor ?? "#00ff88", u = o.config?.billboardImageUrl ?? "", d = o.config?.billboardText ?? "HELLO", f = l ? l * r : u ? 0 : 2 * r, p = o.config?.billboardElevation ?? 1, h = o.config?.billboardIntensity ?? 2, w = u ? `img:${u}:${c}:${f}:${a}:${h}` : `txt:${d}:${c}:${f}:${a}:${h}`, g = {
        key: w,
        text: d,
        imageUrl: u,
        color: c,
        width: f,
        height: a,
        scale: r,
        elevation: p,
        intensity: h,
        x: o.position.x,
        y: o.position.y,
        z: o.position.z,
        rotation: o.rotation ?? 0
      }, _ = i.get(w);
      _ ? _.push(g) : i.set(w, [g]);
    }
    return Array.from(i.entries());
  }, [t]);
  return n.length === 0 ? null : /* @__PURE__ */ s(be, { children: n.map(([i, o]) => {
    const r = o[0];
    return r ? r.imageUrl ? /* @__PURE__ */ s(I_, { entries: o }, i) : /* @__PURE__ */ s(T_, { entries: o }, i) : null;
  }) });
}), NM = ge.memo(N_);
var A_ = `varying vec2 vUv;\r
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
}`, k_ = `varying vec2 vUv;\r
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
const P_ = Es(
  { time: 0, intensity: 1.5, seed: 0, lean: 0, flare: 1, tint: new B.Color(1, 1, 1) },
  k_,
  A_
);
Gr({ FireMaterial: P_ });
const B_ = `
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
`, zf = `
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
`, Yi = 18;
let Ma = null, Ca = null;
function Ff() {
  return Ma || (Ma = {
    log: new B.CylinderGeometry(0.035, 0.045, 0.5, 5),
    charcoal: new B.CircleGeometry(0.18, 6),
    glow: new B.CircleGeometry(0.7, 8)
  }), Ma;
}
function Lf() {
  return Ca || (Ca = {
    log: new B.MeshStandardMaterial({ color: 2759178, roughness: 1 }),
    charcoal: new B.MeshStandardMaterial({
      color: 1118481,
      roughness: 1,
      emissive: new B.Color("#3a0c00"),
      emissiveIntensity: 0.8
    }),
    ember: new B.ShaderMaterial({
      vertexShader: B_,
      fragmentShader: zf,
      uniforms: { uTime: { value: 0 } },
      transparent: !0,
      depthWrite: !1,
      blending: B.AdditiveBlending
    })
  }), Ca;
}
const R_ = ({ intensity: e = 1.5, width: t = 1, height: n = 1.5, color: i = "#ffffff" }) => {
  const o = X(() => new B.Color(i), [i]), r = Ff(), a = Lf(), l = X(() => Math.max(0.4, (t + n * 0.5) / 1.5), [t, n]), c = X(() => [
    { w: t * 0.78, h: n, x: 0, y: n * 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1, speed: 1.45, tOff: 0, iMul: 1 },
    { w: t * 0.52, h: n * 0.85, x: -t * 0.12, y: n * 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
    { w: t * 0.42, h: n * 0.7, x: t * 0.14, y: n * 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 }
  ], [t, n]), u = X(
    () => c.map(() => ge.createRef()),
    [c]
  ), d = X(
    () => c.map((p) => new B.PlaneGeometry(p.w, p.h)),
    [c]
  ), f = X(() => {
    const p = new B.BufferGeometry(), h = new Float32Array(Yi * 3), w = new Float32Array(Yi), g = new Float32Array(Yi), _ = new Float32Array(Yi);
    for (let b = 0; b < Yi; b++)
      h[b * 3] = (Math.random() - 0.5) * t * 0.35, h[b * 3 + 1] = Math.random() * n * 0.2, h[b * 3 + 2] = (Math.random() - 0.5) * t * 0.35, w[b] = Math.random(), g[b] = 0.12 + Math.random() * 0.22, _[b] = Math.random() * Math.PI * 2;
    return p.setAttribute("position", new B.BufferAttribute(h, 3)), p.setAttribute("aLife", new B.BufferAttribute(w, 1)), p.setAttribute("aSpeed", new B.BufferAttribute(g, 1)), p.setAttribute("aDrift", new B.BufferAttribute(_, 1)), p;
  }, [t, n]);
  return $e((p) => {
    const h = p.clock.elapsedTime;
    for (let g = 0; g < c.length; g++) {
      const _ = u[g]?.current;
      if (!_) continue;
      const b = c[g];
      b && (_.time = h * b.speed + b.tOff, _.intensity = e * b.iMul, _.seed = b.seed, _.lean = b.lean, _.flare = b.flare, _.tint = o);
    }
    const w = a.ember.uniforms.uTime;
    w && (w.value = h);
  }), oe(() => () => {
    d.forEach((p) => p.dispose()), f.dispose();
  }, [d, f]), /* @__PURE__ */ x("group", { children: [
    /* @__PURE__ */ s(
      "mesh",
      {
        geometry: r.glow,
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0.02, 0],
        scale: [t, t, 1],
        children: /* @__PURE__ */ s(
          "meshBasicMaterial",
          {
            color: o,
            transparent: !0,
            opacity: 0.18,
            blending: B.AdditiveBlending,
            depthWrite: !1
          }
        )
      }
    ),
    /* @__PURE__ */ s(
      "mesh",
      {
        geometry: r.charcoal,
        material: a.charcoal,
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0.018, 0],
        scale: [t, t, 1]
      }
    ),
    /* @__PURE__ */ s(
      "mesh",
      {
        geometry: r.log,
        material: a.log,
        position: [0.12 * l, 0.06 * l, 0.05 * l],
        rotation: [0.3, 0, 0.65],
        scale: l
      }
    ),
    /* @__PURE__ */ s(
      "mesh",
      {
        geometry: r.log,
        material: a.log,
        position: [-0.1 * l, 0.06 * l, 0.08 * l],
        rotation: [0.25, 1.2, -0.6],
        scale: l
      }
    ),
    /* @__PURE__ */ s(
      "mesh",
      {
        geometry: r.log,
        material: a.log,
        position: [0.02 * l, 0.06 * l, -0.13 * l],
        rotation: [-0.2, 0.6, 1],
        scale: l
      }
    ),
    c.map((p, h) => (() => {
      const w = d[h], g = u[h];
      return !w || !g ? null : /* @__PURE__ */ s("mesh", { geometry: w, position: [p.x, p.y, p.z], children: /* @__PURE__ */ s(
        "fireMaterial",
        {
          ref: g,
          transparent: !0,
          depthWrite: !1,
          side: B.DoubleSide,
          blending: B.AdditiveBlending
        }
      ) }, h);
    })()),
    /* @__PURE__ */ s("points", { geometry: f, material: a.ember })
  ] });
}, IM = ge.memo(R_), D_ = (
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
), z_ = (
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
), F_ = (
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
), Na = [
  { wMul: 0.78, hMul: 1, xMul: 0, yMul: 0.5, z: 0, seed: 0.17, lean: 0.06, flare: 1, speed: 1.45, tOff: 0, iMul: 1 },
  { wMul: 0.52, hMul: 0.85, xMul: -0.12, yMul: 0.43, z: 0.02, seed: 1.31, lean: -0.2, flare: 0.85, speed: 1.9, tOff: 1.7, iMul: 0.82 },
  { wMul: 0.42, hMul: 0.7, xMul: 0.14, yMul: 0.36, z: -0.02, seed: 2.63, lean: 0.16, flare: 0.74, speed: 2.2, tOff: 3.4, iMul: 0.72 }
];
let Ia = null, Ta = null, Ea = null;
function L_() {
  return Ia || (Ia = new B.ShaderMaterial({
    vertexShader: D_,
    fragmentShader: z_,
    uniforms: { uTime: { value: 0 } },
    transparent: !0,
    depthWrite: !1,
    side: B.DoubleSide,
    blending: B.AdditiveBlending
  })), Ia;
}
function $_() {
  return Ta || (Ta = new B.ShaderMaterial({
    vertexShader: F_,
    fragmentShader: zf,
    uniforms: { uTime: { value: 0 } },
    transparent: !0,
    depthWrite: !1,
    blending: B.AdditiveBlending
  })), Ta;
}
function O_() {
  return Ea || (Ea = new B.MeshBasicMaterial({
    color: 16777215,
    transparent: !0,
    opacity: 0.18,
    blending: B.AdditiveBlending,
    depthWrite: !1
  })), Ea;
}
const Xi = new B.Object3D(), Ie = new B.Object3D(), or = new B.Matrix4(), Ci = new B.Color();
function H_(e) {
  let t = `${e.length}`;
  for (const n of e)
    t += `|${n.position[0]},${n.position[1]},${n.position[2]},${n.rotation},${n.intensity},${n.width},${n.height},${n.color}`;
  return t;
}
const G_ = ge.memo(function({ fires: t }) {
  const n = ee(null), i = ee(null), o = ee(null), r = ee(null), a = ee(null), l = t.length, c = l * Na.length, u = l * 2, d = Ff(), f = Lf(), p = L_(), h = O_(), w = $_(), g = X(() => H_(t), [t]), _ = ee({ signature: g, fires: t });
  _.current.signature !== g && (_.current = { signature: g, fires: t });
  const b = _.current.fires, S = X(() => {
    if (l === 0) return null;
    const y = new B.PlaneGeometry(1, 1), v = new Float32Array(c), C = new Float32Array(c), T = new Float32Array(c), P = new Float32Array(c), D = new Float32Array(c), O = new Float32Array(c), z = new Float32Array(c), E = new Float32Array(c), G = new Float32Array(c * 3);
    let I = 0;
    for (const $ of b) {
      Ci.set($.color);
      for (const R of Na)
        v[I] = R.seed, C[I] = R.lean, T[I] = R.flare, P[I] = $.intensity * R.iMul, D[I] = R.speed, O[I] = R.tOff, z[I] = $.width * R.wMul, E[I] = $.height * R.hMul, G[I * 3] = Ci.r, G[I * 3 + 1] = Ci.g, G[I * 3 + 2] = Ci.b, I++;
    }
    return y.setAttribute("aSeed", new B.InstancedBufferAttribute(v, 1)), y.setAttribute("aLean", new B.InstancedBufferAttribute(C, 1)), y.setAttribute("aFlare", new B.InstancedBufferAttribute(T, 1)), y.setAttribute("aIntensity", new B.InstancedBufferAttribute(P, 1)), y.setAttribute("aSpeed", new B.InstancedBufferAttribute(D, 1)), y.setAttribute("aTOff", new B.InstancedBufferAttribute(O, 1)), y.setAttribute("aWidth", new B.InstancedBufferAttribute(z, 1)), y.setAttribute("aHeight", new B.InstancedBufferAttribute(E, 1)), y.setAttribute("aTint", new B.InstancedBufferAttribute(G, 3)), y;
  }, [g, b, l, c]), m = X(() => {
    if (l === 0) return null;
    const y = 18, v = l * y, C = new Float32Array(v * 3), T = new Float32Array(v), P = new Float32Array(v), D = new Float32Array(v), O = new Float32Array(v * 3);
    for (let E = 0; E < l; E++) {
      const G = b[E], I = E * y;
      for (let $ = 0; $ < y; $++) {
        const R = I + $;
        C[R * 3] = (Math.random() - 0.5) * G.width * 0.35, C[R * 3 + 1] = Math.random() * G.height * 0.2, C[R * 3 + 2] = (Math.random() - 0.5) * G.width * 0.35, T[R] = Math.random(), P[R] = 0.12 + Math.random() * 0.22, D[R] = Math.random() * Math.PI * 2, O[R * 3] = G.position[0], O[R * 3 + 1] = G.position[1], O[R * 3 + 2] = G.position[2];
      }
    }
    const z = new B.BufferGeometry();
    return z.setAttribute("position", new B.BufferAttribute(C, 3)), z.setAttribute("aLife", new B.BufferAttribute(T, 1)), z.setAttribute("aSpeed", new B.BufferAttribute(P, 1)), z.setAttribute("aDrift", new B.BufferAttribute(D, 1)), z.setAttribute("aFirePos", new B.BufferAttribute(O, 3)), z.computeBoundingSphere(), z;
  }, [g, b, l]);
  return Ke(() => {
    if (l === 0) return;
    const y = n.current;
    if (!y) return;
    let v = 0;
    for (const C of t) {
      const T = Math.cos(C.rotation), P = Math.sin(C.rotation);
      for (const D of Na) {
        const O = C.width * D.xMul, z = D.z;
        Ie.position.set(
          C.position[0] + O * T + z * P,
          C.position[1] + C.height * D.yMul,
          C.position[2] + z * T - O * P
        ), Ie.rotation.set(0, 0, 0), Ie.scale.set(1, 1, 1), Ie.updateMatrix(), y.setMatrixAt(v++, Ie.matrix);
      }
    }
    y.count = c, y.instanceMatrix.needsUpdate = !0;
  }, [t, l, c]), Ke(() => {
    if (l === 0) return;
    const y = i.current;
    if (!y) return;
    let v = 0;
    for (const C of t) {
      Xi.position.set(C.position[0], C.position[1], C.position[2]), Xi.rotation.set(0, C.rotation, 0), Xi.updateMatrix();
      const T = Math.max(0.4, (C.width + C.height * 0.5) / 1.5);
      Ie.position.set(0.12 * T, 0.06 * T, 0.05 * T), Ie.rotation.set(0.3, 0, 0.65), Ie.scale.set(T, T, T), Ie.updateMatrix(), or.multiplyMatrices(Xi.matrix, Ie.matrix), y.setMatrixAt(v++, or), Ie.position.set(-0.1 * T, 0.06 * T, 0.08 * T), Ie.rotation.set(0.25, 1.2, -0.6), Ie.scale.set(T, T, T), Ie.updateMatrix(), or.multiplyMatrices(Xi.matrix, Ie.matrix), y.setMatrixAt(v++, or);
    }
    y.count = u, y.instanceMatrix.needsUpdate = !0;
  }, [t, l, u]), Ke(() => {
    if (l === 0) return;
    const y = o.current;
    if (y) {
      for (let v = 0; v < l; v++) {
        const C = t[v];
        Ie.position.set(C.position[0], C.position[1] + 0.018, C.position[2]), Ie.rotation.set(-Math.PI / 2, 0, C.rotation), Ie.scale.set(C.width, C.width, 1), Ie.updateMatrix(), y.setMatrixAt(v, Ie.matrix);
      }
      y.count = l, y.instanceMatrix.needsUpdate = !0;
    }
  }, [t, l]), Ke(() => {
    if (l === 0) return;
    const y = r.current;
    if (y) {
      for (let v = 0; v < l; v++) {
        const C = t[v];
        Ie.position.set(C.position[0], C.position[1] + 0.02, C.position[2]), Ie.rotation.set(-Math.PI / 2, 0, C.rotation), Ie.scale.set(C.width, C.width, 1), Ie.updateMatrix(), y.setMatrixAt(v, Ie.matrix), Ci.set(C.color), y.setColorAt(v, Ci);
      }
      y.count = l, y.instanceMatrix.needsUpdate = !0, y.instanceColor && (y.instanceColor.needsUpdate = !0);
    }
  }, [t, l]), $e((y) => {
    const v = y.clock.elapsedTime;
    p.uniforms.uTime.value = v, w.uniforms.uTime.value = v, h.opacity = 0.16 + Math.sin(v * 2.5) * 0.06;
  }), oe(() => () => {
    S?.dispose(), m?.dispose();
  }, [S, m]), l === 0 ? null : /* @__PURE__ */ x(be, { children: [
    S && /* @__PURE__ */ s(
      "instancedMesh",
      {
        ref: n,
        args: [S, p, c],
        frustumCulled: !1
      }
    ),
    /* @__PURE__ */ s("instancedMesh", { ref: i, args: [d.log, f.log, u] }),
    /* @__PURE__ */ s("instancedMesh", { ref: o, args: [d.charcoal, f.charcoal, l] }),
    /* @__PURE__ */ s("instancedMesh", { ref: r, args: [d.glow, h, l] }),
    m && /* @__PURE__ */ s("points", { ref: a, geometry: m, material: w, frustumCulled: !1 })
  ] });
});
var W_ = `precision highp float;

uniform sampler2D map;\r
uniform float transmission;\r
uniform float envMapIntensity;

varying vec2 vUv;

void main() {\r
    vec4 texColor = texture2D(map, vUv);\r
    float alpha = texColor.a * (1.0 - transmission);\r
    if (alpha < 0.01) discard;\r
    gl_FragColor = vec4(texColor.rgb * envMapIntensity, alpha);\r
}`, U_ = `precision highp float;

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
const j_ = Es(
  {
    map: null,
    time: 0,
    windStrength: 1,
    transmission: 0.05,
    envMapIntensity: 1
  },
  U_,
  W_
);
Gr({ FlagMaterial: j_ });
let Ki = null;
function V_() {
  if (Ki) return Ki;
  const e = document.createElement("canvas");
  e.width = 4, e.height = 4;
  const t = e.getContext("2d");
  return t.fillStyle = "#cc2222", t.fillRect(0, 0, 4, 4), Ki = new B.CanvasTexture(e), Ki.needsUpdate = !0, Ki;
}
const Z_ = new B.MeshStandardMaterial({ color: "#8B4513" }), Y_ = new B.MeshStandardMaterial({ color: "#444444", metalness: 0.6, roughness: 0.3 }), ve = new B.Object3D();
function X_(e) {
  const t = [];
  for (const n of e)
    switch (Ms[n.style].poleType) {
      case "side": {
        const o = n.flagHeight + 2.5;
        ve.position.set(n.x, n.y + o / 2, n.z), ve.scale.set(1, o, 1), ve.updateMatrix(), t.push(ve.matrix.clone());
        break;
      }
      case "top": {
        const o = n.flagHeight + 1.5;
        ve.position.set(n.x, n.y + o + 0.025, n.z), ve.rotation.set(0, 0, Math.PI / 2), ve.scale.set(1, n.flagWidth, 1), ve.updateMatrix(), t.push(ve.matrix.clone()), ve.rotation.set(0, 0, 0);
        break;
      }
      case "frame": {
        const o = n.flagHeight + 0.5;
        ve.position.set(n.x - n.flagWidth / 2, n.y + o / 2, n.z), ve.scale.set(1, o, 1), ve.updateMatrix(), t.push(ve.matrix.clone()), ve.position.set(n.x + n.flagWidth / 2, n.y + o / 2, n.z), ve.updateMatrix(), t.push(ve.matrix.clone()), ve.position.set(n.x, n.y + o, n.z), ve.rotation.set(0, 0, Math.PI / 2), ve.scale.set(1, n.flagWidth + 0.05, 1), ve.updateMatrix(), t.push(ve.matrix.clone()), ve.rotation.set(0, 0, 0), ve.position.set(n.x, n.y + 0.025, n.z), ve.rotation.set(0, 0, Math.PI / 2), ve.scale.set(1, n.flagWidth + 0.05, 1), ve.updateMatrix(), t.push(ve.matrix.clone()), ve.rotation.set(0, 0, 0);
        break;
      }
      case "both": {
        const o = n.flagHeight + 2.5;
        ve.position.set(n.x - n.flagWidth / 2, n.y + o / 2, n.z), ve.scale.set(1, o, 1), ve.updateMatrix(), t.push(ve.matrix.clone()), ve.position.set(n.x + n.flagWidth / 2, n.y + o / 2, n.z), ve.updateMatrix(), t.push(ve.matrix.clone());
        break;
      }
    }
  return t;
}
function K_({ entries: e }) {
  const t = ee(null), n = X(() => new B.BoxGeometry(0.05, 1, 0.05), []), i = X(() => X_(e), [e]), o = i.length, r = X(() => Math.max(1, o), [o]), l = e.some((c) => c.style === "panel") ? Y_ : Z_;
  return Ke(() => {
    const c = t.current;
    if (c) {
      c.count = o;
      for (let u = 0; u < o; u++) {
        const d = i[u];
        d && c.setMatrixAt(u, d);
      }
      c.instanceMatrix.needsUpdate = !0, c.computeBoundingSphere();
    }
  }, [i, o]), oe(() => () => {
    n.dispose();
  }, [n]), o === 0 ? null : /* @__PURE__ */ s("instancedMesh", { ref: t, args: [n, l, r], frustumCulled: !0 });
}
function $f({ entries: e, windStrength: t, texture: n }) {
  const i = ee(null), o = ee(null), r = ee(0), a = e.length, l = X(() => Math.max(1, a), [a]), c = e[0]?.flagWidth ?? 1.5, u = e[0]?.flagHeight ?? 1, d = t > 0.6 ? 12 : t > 0 ? 8 : 1, f = t > 0.6 ? 6 : t > 0 ? 4 : 1, p = X(
    () => new B.PlaneGeometry(c, u, d, f),
    [c, u, d, f]
  );
  return Ke(() => {
    const h = i.current;
    if (h) {
      h.count = a;
      for (let w = 0; w < a; w++) {
        const g = e[w];
        if (!g) continue;
        const _ = Ms[g.style];
        let b = g.x, S = g.y;
        switch (_.poleType) {
          case "side":
            b = g.x + g.flagWidth / 2, S = g.y + g.flagHeight + 2.5 - g.flagHeight / 2;
            break;
          case "top":
            S = g.y + g.flagHeight + 1.5 - g.flagHeight / 2;
            break;
          case "frame":
            S = g.y + (g.flagHeight + 0.5) / 2 + 0.025;
            break;
          case "both":
            S = g.y + g.flagHeight + 2.5 - g.flagHeight / 2;
            break;
        }
        ve.position.set(b, S, g.z), ve.scale.set(g.flagWidth / c, g.flagHeight / u, 1), ve.updateMatrix(), h.setMatrixAt(w, ve.matrix);
      }
      h.instanceMatrix.needsUpdate = !0, h.computeBoundingSphere();
    }
  }, [e, a, c, u]), $e((h, w) => {
    if (r.current += Math.max(0, w), r.current < 1 / 30) return;
    r.current = 0;
    const g = o.current;
    g.time = h.clock.elapsedTime * 5, g.windStrength = t;
  }), oe(() => () => {
    p.dispose();
  }, [p]), a === 0 ? null : /* @__PURE__ */ s("instancedMesh", { ref: i, args: [p, void 0, l], frustumCulled: !0, children: /* @__PURE__ */ s(
    "flagMaterial",
    {
      ref: o,
      map: n,
      transmission: 0.05,
      windStrength: t,
      envMapIntensity: 1,
      side: B.DoubleSide,
      transparent: !0
    }
  ) });
}
function q_({
  entries: e,
  textureUrl: t,
  windStrength: n
}) {
  const i = Ts(t);
  return /* @__PURE__ */ s($f, { entries: e, windStrength: n, texture: i });
}
function Q_({
  entries: e,
  windStrength: t
}) {
  const n = X(() => V_(), []);
  return /* @__PURE__ */ s($f, { entries: e, windStrength: t, texture: n });
}
function J_({
  entries: e,
  textureUrl: t,
  windStrength: n
}) {
  return t ? /* @__PURE__ */ s(q_, { entries: e, textureUrl: t, windStrength: n }) : /* @__PURE__ */ s(Q_, { entries: e, windStrength: n });
}
const e2 = ge.memo(function({ flags: t }) {
  const n = X(
    () => t.map((o) => ({
      x: o.position.x,
      y: o.position.y,
      z: o.position.z,
      flagWidth: o.config?.flagWidth ?? 1.5,
      flagHeight: o.config?.flagHeight ?? 1,
      style: o.config?.flagStyle ?? "flag",
      textureUrl: o.config?.flagTexture ?? ""
    })),
    [t]
  ), i = X(() => {
    const o = /* @__PURE__ */ new Map();
    for (const r of n) {
      const a = `${r.textureUrl}|${r.style}`;
      let l = o.get(a);
      l || (l = [], o.set(a, l)), l.push(r);
    }
    return Array.from(o.entries());
  }, [n]);
  return /* @__PURE__ */ x(be, { children: [
    /* @__PURE__ */ s(K_, { entries: n }),
    i.map(([o, r]) => {
      const a = r[0];
      if (!a) return null;
      const l = a.style, c = Ms[l].windStrength, u = a.textureUrl;
      return /* @__PURE__ */ s(
        J_,
        {
          entries: r,
          textureUrl: u,
          windStrength: c
        },
        o
      );
    })
  ] });
});
class t2 extends ge.Component {
  state = { failed: !1 };
  static getDerivedStateFromError() {
    return { failed: !0 };
  }
  componentDidUpdate(t) {
    t.children !== this.props.children && this.state.failed && this.setState({ failed: !1 });
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function n2({ url: e }) {
  const { scene: t } = Is(e), n = X(() => yu.clone(t), [t]);
  return /* @__PURE__ */ s("primitive", { object: n });
}
function xe(e, t, n, i) {
  return /* @__PURE__ */ x("mesh", { position: t, castShadow: !0, receiveShadow: !0, children: [
    /* @__PURE__ */ s("boxGeometry", { args: e }),
    /* @__PURE__ */ s("meshStandardMaterial", { color: n, roughness: 0.75, metalness: 0.04 })
  ] }, i);
}
function Aa(e, t, n, i) {
  return /* @__PURE__ */ x("mesh", { position: t, castShadow: !0, receiveShadow: !0, children: [
    /* @__PURE__ */ s("cylinderGeometry", { args: e }),
    /* @__PURE__ */ s("meshStandardMaterial", { color: n, roughness: 0.7, metalness: 0.05 })
  ] }, i);
}
function i2({
  kind: e = "generic",
  color: t = "#9b7653"
}) {
  const n = new B.Color(t).multiplyScalar(0.72).getStyle(), i = new B.Color(t).lerp(new B.Color("#ffffff"), 0.35).getStyle();
  return e === "door" ? /* @__PURE__ */ x("group", { children: [
    xe([0.9, 1.9, 0.12], [0, 0.95, 0], t, "panel"),
    xe([0.08, 2.05, 0.16], [-0.5, 1.02, 0], n, "left-frame"),
    xe([0.08, 2.05, 0.16], [0.5, 1.02, 0], n, "right-frame"),
    Aa([0.045, 0.045, 0.06, 12], [0.32, 0.95, 0.08], "#f3c969", "knob")
  ] }) : e === "window" ? /* @__PURE__ */ x("group", { children: [
    xe([1.1, 0.08, 0.12], [0, 1.3, 0], n, "top"),
    xe([1.1, 0.08, 0.12], [0, 0.55, 0], n, "bottom"),
    xe([0.08, 0.82, 0.12], [-0.55, 0.92, 0], n, "left"),
    xe([0.08, 0.82, 0.12], [0.55, 0.92, 0], n, "right"),
    xe([0.9, 0.62, 0.04], [0, 0.92, 0.02], t, "glass")
  ] }) : e === "fence" ? /* @__PURE__ */ x("group", { children: [
    xe([0.16, 1, 0.16], [-0.65, 0.5, 0], n, "post-a"),
    xe([0.16, 1, 0.16], [0.65, 0.5, 0], n, "post-b"),
    xe([1.5, 0.16, 0.12], [0, 0.72, 0], t, "rail-a"),
    xe([1.5, 0.16, 0.12], [0, 0.36, 0], t, "rail-b")
  ] }) : e === "lamp" ? /* @__PURE__ */ x("group", { children: [
    Aa([0.06, 0.08, 1.5, 12], [0, 0.75, 0], n, "pole"),
    Aa([0.28, 0.18, 0.35, 16], [0, 1.55, 0], t, "shade"),
    /* @__PURE__ */ s("pointLight", { position: [0, 1.55, 0], intensity: 0.65, distance: 5, color: i })
  ] }) : e === "chair" ? /* @__PURE__ */ x("group", { children: [
    xe([0.8, 0.12, 0.75], [0, 0.55, 0], t, "seat"),
    xe([0.8, 0.9, 0.12], [0, 1, 0.33], n, "back"),
    xe([0.09, 0.55, 0.09], [-0.3, 0.28, -0.25], n, "leg-a"),
    xe([0.09, 0.55, 0.09], [0.3, 0.28, -0.25], n, "leg-b"),
    xe([0.09, 0.55, 0.09], [-0.3, 0.28, 0.25], n, "leg-c"),
    xe([0.09, 0.55, 0.09], [0.3, 0.28, 0.25], n, "leg-d")
  ] }) : e === "table" || e === "crafting" ? /* @__PURE__ */ x("group", { children: [
    xe([1.4, 0.16, 0.9], [0, 0.8, 0], t, "top"),
    xe([0.12, 0.75, 0.12], [-0.52, 0.38, -0.3], n, "leg-a"),
    xe([0.12, 0.75, 0.12], [0.52, 0.38, -0.3], n, "leg-b"),
    xe([0.12, 0.75, 0.12], [-0.52, 0.38, 0.3], n, "leg-c"),
    xe([0.12, 0.75, 0.12], [0.52, 0.38, 0.3], n, "leg-d"),
    e === "crafting" && xe([0.55, 0.12, 0.12], [0.22, 0.96, 0], i, "tool")
  ] }) : e === "bed" ? /* @__PURE__ */ x("group", { children: [
    xe([1.3, 0.35, 2], [0, 0.35, 0], t, "base"),
    xe([1.25, 0.18, 1.45], [0, 0.62, 0.2], i, "blanket"),
    xe([1.25, 0.55, 0.14], [0, 0.72, 0.92], n, "headboard")
  ] }) : e === "storage" || e === "mailbox" ? /* @__PURE__ */ x("group", { children: [
    xe([1, 0.8, 0.7], [0, 0.4, 0], t, "body"),
    xe([1.08, 0.12, 0.78], [0, 0.86, 0], n, "lid"),
    xe([0.38, 0.08, 0.04], [0, 0.46, 0.37], i, "handle")
  ] }) : e === "shop" ? /* @__PURE__ */ x("group", { children: [
    xe([1.7, 0.18, 0.9], [0, 0.72, 0], t, "counter"),
    xe([1.9, 0.16, 1], [0, 1.55, 0], i, "awning"),
    xe([0.08, 1.45, 0.08], [-0.82, 0.8, -0.35], n, "post-a"),
    xe([0.08, 1.45, 0.08], [0.82, 0.8, -0.35], n, "post-b")
  ] }) : xe([1, 1, 1], [0, 0.5, 0], t, "generic");
}
function o2({ url: e, label: t, fallbackKind: n, scale: i = 1, color: o }) {
  const r = /* @__PURE__ */ s(i2, { kind: n, color: o });
  return oe(() => {
    e && Is.preload(e);
  }, [e]), /* @__PURE__ */ s("group", { name: t ?? "building-model-object", scale: [i, i, i], children: e ? /* @__PURE__ */ s(t2, { fallback: r, children: /* @__PURE__ */ s(In, { fallback: r, children: /* @__PURE__ */ s(n2, { url: e }) }) }) : r });
}
function ue(e) {
  const t = Math.sin(e * 127.1 + 311.7) * 43758.5453123;
  return t - Math.floor(t);
}
function fl(e, t, n) {
  e[t] = n.r, e[t + 1] = n.g, e[t + 2] = n.b;
}
let ka = null, Pa = null, Ba = null;
function Of() {
  return ka || (ka = {
    limb: new B.CylinderGeometry(0.5, 1, 1, 8, 1, !1),
    canopyCluster: new B.IcosahedronGeometry(1, 1),
    canopyCore: new B.SphereGeometry(1, 10, 8),
    trunkTop: new B.SphereGeometry(1, 10, 8)
  }), ka;
}
function Hf(e) {
  return e ? (Ba || (Ba = {
    bark: ui({ color: "#5e3d30", steps: 3 }),
    barkDark: ui({ color: "#3f271e", steps: 3 }),
    blossomShell: ui({ color: "#f7bfd2", transparent: !0, opacity: 0.78, steps: 4, depthWrite: !1 }),
    blossomCore: ui({ color: "#ffe6f0", transparent: !0, opacity: 0.6, steps: 4, depthWrite: !1 })
  }), Ba) : (Pa || (Pa = {
    bark: new B.MeshStandardMaterial({ color: "#5e3d30", roughness: 0.95, metalness: 0.02 }),
    barkDark: new B.MeshStandardMaterial({ color: "#3f271e", roughness: 1, metalness: 0.01 }),
    blossomShell: new B.MeshStandardMaterial({ color: "#f7bfd2", roughness: 0.92, metalness: 0, transparent: !0, opacity: 0.68 }),
    blossomCore: new B.MeshStandardMaterial({ color: "#ffe6f0", roughness: 0.84, metalness: 0, transparent: !0, opacity: 0.5 })
  }), Pa);
}
function Gf(e, t, n) {
  const i = n === "sparse" ? 5 : 0, o = Math.max(8, Math.min(20, Math.round(10 + e * 4 + i)));
  return Array.from({ length: o }, (r, a) => {
    const l = 19.3 + a * 13.17 + e * 5.1, c = n === "conifer" || n === "column", u = n === "sparse", d = c ? 0.58 : u ? 1.24 : n === "weeping" ? 0.82 : 1, f = (1.05 + ue(l + 1) * 1.35) * e * d, p = ue(l + 2) > 0.5 ? 1 : -1;
    return {
      pivotY: t * (c ? 0.28 + ue(l + 3) * 0.52 : 0.38 + ue(l + 3) * 0.42),
      length: f,
      radius: (0.08 + ue(l + 4) * 0.045) * e * (u ? 0.82 : 1),
      yaw: ue(l + 5) * Math.PI * 2,
      bend: (c ? 0.38 : 0.58 + ue(l + 6) * 0.34) * p,
      lean: (ue(l + 7) - 0.5) * (c ? 0.18 : 0.34),
      twigLength: f * (u ? 0.5 : 0.34 + ue(l + 8) * 0.26),
      twigYaw: (ue(l + 9) - 0.5) * (c ? 0.48 : 0.95),
      twigLean: (n === "weeping" ? -0.55 : 0.25 + ue(l + 10) * 0.38) * -p
    };
  });
}
function Wf(e) {
  return Array.from({ length: 5 }, (t, n) => {
    const i = 101.2 + n * 8.31 + e * 3.7;
    return {
      angle: n / 5 * Math.PI * 2 + (ue(i) - 0.5) * 0.4,
      length: (0.52 + ue(i + 1) * 0.42) * e,
      radius: (0.09 + ue(i + 2) * 0.04) * e,
      spread: (0.8 + ue(i + 3) * 0.28) * (ue(i + 4) > 0.5 ? 1 : -1)
    };
  });
}
function Uf(e, t, n, i, o) {
  const r = Math.max(6, Math.min(18, Math.round((o === "sparse" ? 6 : 9) + e * 4)));
  return Array.from({ length: r }, (a, l) => {
    const c = 220.4 + l * 10.73 + e * 4.4, u = ue(c) * Math.PI * 2, d = r <= 1 ? 0 : l / (r - 1), f = Math.max(0.12, 1 - d), p = o === "conifer" || o === "column", h = p ? n * f * (o === "column" ? 0.34 : 0.58) * (0.55 + ue(c + 1) * 0.45) : n * (0.18 + ue(c + 1) * 0.72), w = (0.7 + ue(c + 5) * 0.9) * e * (p ? f : 1), g = (0.52 + ue(c + 6) * 0.56) * e * (o === "weeping" ? 1.4 : 1), _ = (0.66 + ue(c + 7) * 0.88) * e * (p ? f : 1), b = p ? t * 0.42 + i * (0.06 + d * 0.9) : o === "weeping" ? t * (0.46 + ue(c + 3) * 0.18) + ue(c + 4) * i * 0.32 : t * (0.64 + ue(c + 3) * 0.22) + ue(c + 4) * i * 0.42;
    return {
      position: [Math.cos(u) * h, b, Math.sin(u) * h * (0.86 + ue(c + 2) * 0.22)],
      rotation: [(ue(c + 8) - 0.5) * 0.55, ue(c + 9) * Math.PI * 2, (ue(c + 10) - 0.5) * 0.55],
      outerScale: [
        o === "column" ? w * 0.62 : w,
        p ? g * 0.88 : g,
        o === "column" ? _ * 0.62 : _
      ],
      innerScale: [w * 0.7, g * 0.72, _ * 0.7]
    };
  });
}
const rr = new B.Object3D(), gt = new B.Object3D(), lo = new B.Matrix4(), Dr = new B.Matrix4(), Nn = new B.Color();
function kn(e, t, n, i, o, r, a, l) {
  rr.position.set(i[0], i[1], i[2]), rr.rotation.set(o[0], o[1], o[2]), rr.updateMatrix(), gt.position.set(r[0], r[1], r[2]), gt.rotation.set(a ? a[0] : 0, a ? a[1] : 0, a ? a[2] : 0), gt.scale.set(l[0], l[1], l[2]), gt.updateMatrix(), lo.multiplyMatrices(rr.matrix, gt.matrix), n && (Dr.makeTranslation(n[0], n[1] + 0.02, n[2]), lo.premultiply(Dr)), e.setMatrixAt(t, lo);
}
function zr(e, t, n, i, o, r) {
  gt.position.set(i[0], i[1], i[2]), gt.rotation.set(o[0], o[1], o[2]), gt.scale.set(r[0], r[1], r[2]), gt.updateMatrix(), n ? (Dr.makeTranslation(n[0], n[1] + 0.02, n[2]), lo.multiplyMatrices(Dr, gt.matrix), e.setMatrixAt(t, lo)) : e.setMatrixAt(t, gt.matrix);
}
function jf(e, t, n, i, o, r, a, l, c, u, d = "round", f) {
  const p = f ? f.clone().multiplyScalar(0.85) : new B.Color("#f3a1bf"), h = f ? f.clone().lerp(new B.Color("#ffffff"), 0.6) : new B.Color("#fff1f6"), w = new B.Color();
  for (let g = 0; g < i; g++) {
    const _ = 330.7 + g * 17.13, b = ue(_) * Math.PI * 2, S = Math.pow(ue(_ + 4), d === "conifer" || d === "column" ? 0.92 : 0.72), m = d === "conifer" ? Math.max(0.08, 1 - S * 0.92) : d === "column" ? 0.32 + Math.max(0.08, 1 - S) * 0.24 : d === "weeping" ? 0.82 + S * 0.28 : 1, y = r * m * (0.18 + Math.sqrt(ue(_ + 1)) * 0.86), v = (n + g) * 3;
    e[v] = Math.cos(b) * y * (0.82 + ue(_ + 2) * 0.22) + l, e[v + 1] = o * (d === "weeping" ? 0.46 : 0.58) + S * a + (ue(_ + 5) - 0.5) * 0.36 + c, e[v + 2] = Math.sin(b) * y * (0.8 + ue(_ + 3) * 0.26) + u, w.copy(p).lerp(h, 0.28 + ue(_ + 6) * 0.72).multiplyScalar(0.92 + ue(_ + 7) * 0.18), fl(t, v, w);
  }
}
function Vf(e, t, n, i, o, r, a, l, c) {
  const u = c ? c.clone().multiplyScalar(0.9) : new B.Color("#f7cadb"), d = c ? c.clone().lerp(new B.Color("#ffffff"), 0.7) : new B.Color("#fff3f8"), f = new B.Color();
  for (let p = 0; p < i; p++) {
    const h = 510.9 + p * 9.41, w = ue(h) * Math.PI * 2, g = o * (0.18 + Math.pow(ue(h + 1), 0.6) * 0.92), _ = (n + p) * 3;
    e[_] = Math.cos(w) * g + r, e[_ + 1] = 0.035 + ue(h + 2) * 0.03 + a, e[_ + 2] = Math.sin(w) * g + l, f.copy(u).lerp(d, 0.35 + ue(h + 3) * 0.65).multiplyScalar(0.9 + ue(h + 4) * 0.12), fl(t, _, f);
  }
}
function Zf(e, t, n, i, o, r, a, l, c, u, d, f, p, h, w, g) {
  const _ = g ? g.clone().multiplyScalar(0.88) : new B.Color("#f8b3ca"), b = g ? g.clone().lerp(new B.Color("#ffffff"), 0.65) : new B.Color("#fff5fa"), S = new B.Color();
  for (let m = 0; m < l; m++) {
    const y = 740.6 + m * 6.83, v = ue(y) * Math.PI * 2, C = u * (0.1 + ue(y + 1) * 0.72), T = a + m, P = T * 3;
    e[P] = Math.cos(v) * C, e[P + 1] = c * 0.66 + ue(y + 2) * d * 0.88, e[P + 2] = Math.sin(v) * C;
    const D = T * 4;
    n[D] = 0.12 + ue(y + 3) * 0.18, n[D + 1] = ue(y + 4), n[D + 2] = 0.08 + ue(y + 5) * 0.18, n[D + 3] = 1 + ue(y + 6) * 1.9;
    const O = T * 2;
    i[O] = (ue(y + 7) - 0.5) * 0.8, i[O + 1] = (ue(y + 8) - 0.5) * 0.8, o && (o[P] = p, o[P + 1] = h, o[P + 2] = w), r && (r[T] = 0.11 * f), S.copy(_).lerp(b, 0.2 + ue(y + 9) * 0.8).multiplyScalar(0.94 + ue(y + 10) * 0.12), fl(t, P, S);
  }
}
function Fr(e, t, n = !1) {
  const i = new B.BufferGeometry();
  return i.setAttribute("position", new B.Float32BufferAttribute(e, 3)), i.setAttribute("color", new B.Float32BufferAttribute(t, 3)), n && i.computeBoundingBox(), i.computeBoundingSphere(), i;
}
const Ni = new B.Color("#f7bfd2"), ar = new B.Color("#5e3d30"), r2 = new B.Color("#ffffff"), a2 = {
  sakura: { canopyColor: "#f7bfd2", bark: "#5e3d30", shape: "round", crownRadius: 1, crownHeight: 1, trunkHeight: 1, canopyDensity: 1, falling: 1, ground: 1 },
  oak: { canopyColor: "#4f8f3a", bark: "#6b4a2a", shape: "round", crownRadius: 1.12, crownHeight: 0.86, trunkHeight: 1, canopyDensity: 1, falling: 0.08, ground: 0.35 },
  pine: { canopyColor: "#2f6f45", bark: "#5b3b24", shape: "conifer", crownRadius: 0.92, crownHeight: 1.5, trunkHeight: 1.18, canopyDensity: 0.82, falling: 0.02, ground: 0.12 },
  maple: { canopyColor: "#d05a2d", bark: "#654126", shape: "oval", crownRadius: 1.02, crownHeight: 0.78, trunkHeight: 0.96, canopyDensity: 1, falling: 0.45, ground: 0.8 },
  birch: { canopyColor: "#87b95a", bark: "#e8e1cf", shape: "oval", crownRadius: 0.82, crownHeight: 1.08, trunkHeight: 1.14, canopyDensity: 0.86, falling: 0.12, ground: 0.35 },
  willow: { canopyColor: "#7fae55", bark: "#6a5635", shape: "weeping", crownRadius: 1.2, crownHeight: 1.28, trunkHeight: 0.88, canopyDensity: 1.08, falling: 0.2, ground: 0.45 },
  cypress: { canopyColor: "#315f3a", bark: "#59402d", shape: "column", crownRadius: 0.78, crownHeight: 1.65, trunkHeight: 1.24, canopyDensity: 0.74, falling: 0.02, ground: 0.12 },
  dead: { canopyColor: "#8b7a61", bark: "#4b392c", shape: "sparse", crownRadius: 0.7, crownHeight: 0.7, trunkHeight: 1.08, canopyDensity: 0.2, falling: 0, ground: 0.12 }
};
function s2(e) {
  return e.map((t) => {
    const n = a2[t.treeKind ?? "sakura"], i = B.MathUtils.clamp(t.size / 4, 0.95, 1.85), o = 3.8 * i * n.trunkHeight, r = (1.65 * i + Math.min(t.size * 0.08, 0.55)) * n.crownRadius, a = (2.15 * i + Math.min(t.size * 0.04, 0.35)) * n.crownHeight;
    return {
      pos: t.position,
      scale: i,
      trunkHeight: o,
      crownRadius: r,
      crownHeight: a,
      shape: n.shape,
      branches: Gf(i, o, n.shape),
      roots: Wf(i),
      clusters: Uf(i, o, r, a, n.shape),
      canopyN: Math.round(Math.max(180, Math.min(420, Math.round(210 + i * 95))) * n.canopyDensity),
      groundN: Math.round(Math.max(44, Math.min(120, Math.round(54 + i * 26))) * n.ground),
      fallingN: Math.round(Math.max(52, Math.min(132, Math.round(62 + i * 30))) * n.falling),
      blossom: t.blossomColor ? new B.Color(t.blossomColor) : new B.Color(n.canopyColor),
      bark: t.barkColor ? new B.Color(t.barkColor) : new B.Color(n.bark)
    };
  });
}
const l2 = (
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
), Yf = (
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
function c2({ trees: e, toon: t }) {
  const n = ee(null), i = ee(null), o = ee(null), r = ee(null), a = ee(null), l = ee(null), c = t ?? We(), u = Of(), d = Hf(c), f = X(() => s2(e), [e]), p = X(() => {
    let m = 0, y = 0, v = 0, C = 0, T = 0, P = 0;
    for (const D of f)
      m += D.branches.length + 1, y += D.roots.length + D.branches.length, v += D.clusters.length, C += D.canopyN, T += D.groundN, P += D.fallingN;
    return { bark: m, dark: y, top: f.length, cluster: v, canopy: C, ground: T, falling: P };
  }, [f]), h = X(() => f.length === 0 ? 1 : f.reduce((m, y) => m + y.scale, 0) / f.length, [f]), w = X(
    () => f.some((m) => m.blossom !== Ni || m.bark !== ar),
    [f]
  ), g = X(() => {
    const m = new Float32Array(p.canopy * 3), y = new Float32Array(p.canopy * 3);
    let v = 0;
    for (const C of f) {
      const T = C.blossom !== Ni ? C.blossom : void 0;
      jf(m, y, v, C.canopyN, C.trunkHeight, C.crownRadius, C.crownHeight, C.pos[0], C.pos[1] + 0.02, C.pos[2], C.shape, T), v += C.canopyN;
    }
    return Fr(m, y);
  }, [f, p.canopy]), _ = X(() => {
    const m = new Float32Array(p.ground * 3), y = new Float32Array(p.ground * 3);
    let v = 0;
    for (const C of f) {
      const T = C.blossom !== Ni ? C.blossom : void 0;
      Vf(m, y, v, C.groundN, C.crownRadius, C.pos[0], C.pos[1] + 0.02, C.pos[2], T), v += C.groundN;
    }
    return Fr(m, y);
  }, [f, p.ground]), b = X(() => {
    const m = p.falling, y = new Float32Array(m * 3), v = new Float32Array(m * 3), C = new Float32Array(m * 4), T = new Float32Array(m * 2), P = new Float32Array(m * 3), D = new Float32Array(m);
    let O = 0;
    for (const E of f) {
      const G = E.blossom !== Ni ? E.blossom : void 0;
      Zf(
        y,
        v,
        C,
        T,
        P,
        D,
        O,
        E.fallingN,
        E.trunkHeight,
        E.crownRadius,
        E.crownHeight,
        E.scale,
        E.pos[0],
        E.pos[1] + 0.02,
        E.pos[2],
        G
      ), O += E.fallingN;
    }
    const z = new B.BufferGeometry();
    return z.setAttribute("position", new B.Float32BufferAttribute(y, 3)), z.setAttribute("color", new B.Float32BufferAttribute(v, 3)), z.setAttribute("aParams1", new B.Float32BufferAttribute(C, 4)), z.setAttribute("aParams2", new B.Float32BufferAttribute(T, 2)), z.setAttribute("aTreePos", new B.Float32BufferAttribute(P, 3)), z.setAttribute("aPointScale", new B.Float32BufferAttribute(D, 1)), z.computeBoundingSphere(), z;
  }, [f, p.falling]), S = X(() => new B.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: 1 },
      uOpacity: { value: 0.88 },
      uWind: { value: 1 }
    },
    vertexShader: l2,
    fragmentShader: Yf,
    transparent: !0,
    depthWrite: !1
  }), []);
  return Ke(() => {
    let m = 0, y = 0, v = 0, C = 0, T = 0;
    for (const P of f) {
      const D = P.pos, O = P.bark !== ar, z = P.blossom !== Ni;
      if (kn(
        n.current,
        m,
        D,
        [0, P.trunkHeight * 0.5, 0],
        [0.02, 0, -0.04],
        [0, 0, 0],
        null,
        [0.3 * P.scale, P.trunkHeight, 0.3 * P.scale]
      ), w && n.current.setColorAt(m, O ? P.bark : ar), m++, kn(
        o.current,
        v,
        D,
        [0, P.trunkHeight * 0.5, 0],
        [0.02, 0, -0.04],
        [0, P.trunkHeight * 0.48, 0],
        null,
        [0.24 * P.scale, 0.32 * P.scale, 0.24 * P.scale]
      ), w) {
        const E = O ? Nn.copy(P.bark).multiplyScalar(0.65) : Nn.set("#3f271e");
        o.current.setColorAt(v, E);
      }
      v++;
      for (const E of P.branches)
        kn(
          n.current,
          m,
          D,
          [0, E.pivotY, 0],
          [E.lean, E.yaw, E.bend],
          [0, E.length * 0.5, 0],
          null,
          [E.radius, E.length, E.radius]
        ), w && n.current.setColorAt(m, O ? P.bark : ar), m++;
      for (const E of P.roots) {
        if (kn(
          i.current,
          y,
          D,
          [0, 0.14 * P.scale, 0],
          [0, E.angle, E.spread],
          [0, E.length * 0.22, 0],
          null,
          [E.radius, E.length, E.radius]
        ), w) {
          const G = O ? Nn.copy(P.bark).multiplyScalar(0.65) : Nn.set("#3f271e");
          i.current.setColorAt(y, G);
        }
        y++;
      }
      for (const E of P.branches) {
        if (kn(
          i.current,
          y,
          D,
          [0, E.pivotY, 0],
          [E.lean, E.yaw, E.bend],
          [0, E.length * 0.76, 0],
          [E.twigLean, E.twigYaw, E.bend * -0.42],
          [E.radius * 0.52, E.twigLength, E.radius * 0.52]
        ), w) {
          const G = O ? Nn.copy(P.bark).multiplyScalar(0.65) : Nn.set("#3f271e");
          i.current.setColorAt(y, G);
        }
        y++;
      }
      for (const E of P.clusters) {
        if (zr(r.current, C, D, E.position, E.rotation, E.outerScale), w && r.current.setColorAt(C, z ? P.blossom : Ni), C++, zr(a.current, T, D, E.position, E.rotation, E.innerScale), w) {
          const G = z ? Nn.copy(P.blossom).lerp(r2, 0.4) : Nn.set("#ffe6f0");
          a.current.setColorAt(T, G);
        }
        T++;
      }
    }
    for (const [P, D] of [[n, m], [i, y], [o, v], [r, C], [a, T]])
      P.current.count = D, P.current.instanceMatrix.needsUpdate = !0, w && P.current.instanceColor && (P.current.instanceColor.needsUpdate = !0);
  }, [f, w, p]), oe(() => () => {
    g.dispose(), _.dispose(), b.dispose(), S.dispose();
  }, [g, _, b, S]), $e((m) => {
    const y = l.current;
    if (!y) return;
    const v = y.parent;
    if (v && !v.visible) return;
    const C = y.material;
    if (C?.uniforms) {
      const T = C.uniforms.uTime, P = C.uniforms.uScale, D = As.getState().current, O = D?.intensity ?? 0, z = D?.kind === "storm" ? 2.4 : D?.kind === "rain" ? 1.6 : D?.kind === "snow" ? 1.2 : D?.kind === "cloudy" ? 1.1 : 0.9, E = C.uniforms.uWind;
      T && (T.value = m.clock.getElapsedTime()), P && (P.value = m.gl.domElement.height * 0.5), E && (E.value = z + O * 0.7);
    }
  }), f.length === 0 ? null : /* @__PURE__ */ x(be, { children: [
    /* @__PURE__ */ s("instancedMesh", { ref: n, args: [u.limb, d.bark, p.bark], castShadow: !0 }),
    /* @__PURE__ */ s("instancedMesh", { ref: i, args: [u.limb, d.barkDark, p.dark] }),
    /* @__PURE__ */ s("instancedMesh", { ref: o, args: [u.trunkTop, d.barkDark, p.top], castShadow: !0 }),
    /* @__PURE__ */ s("instancedMesh", { ref: r, args: [u.canopyCluster, d.blossomShell, p.cluster], castShadow: !0 }),
    /* @__PURE__ */ s("instancedMesh", { ref: a, args: [u.canopyCore, d.blossomCore, p.cluster] }),
    /* @__PURE__ */ s("points", { geometry: g, children: /* @__PURE__ */ s("pointsMaterial", { size: 0.08 * h, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.82, depthWrite: !1 }) }),
    /* @__PURE__ */ s("points", { ref: l, geometry: b, material: S, frustumCulled: !1 }),
    /* @__PURE__ */ s("points", { geometry: _, children: /* @__PURE__ */ s("pointsMaterial", { size: 0.085 * h, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.7, depthWrite: !1 }) })
  ] });
}
function TM({ size: e = 4, toon: t }) {
  const n = ee(null), i = ee(null), o = ee(null), r = ee(null), a = ee(null), l = ee(null), c = X(() => B.MathUtils.clamp(e / 4, 0.95, 1.85), [e]), u = 3.8 * c, d = 1.65 * c + Math.min(e * 0.08, 0.55), f = 2.15 * c + Math.min(e * 0.04, 0.35), p = t ?? We(), h = Of(), w = Hf(p), g = X(() => Gf(c, u, "round"), [c, u]), _ = X(() => Wf(c), [c]), b = X(() => Uf(c, u, d, f, "round"), [c, u, d, f]), S = g.length, m = _.length + g.length, y = b.length, v = Math.max(180, Math.min(420, Math.round(210 + c * 95))), C = Math.max(44, Math.min(120, Math.round(54 + c * 26))), T = Math.max(52, Math.min(132, Math.round(62 + c * 30))), P = X(() => {
    const E = new Float32Array(v * 3), G = new Float32Array(v * 3);
    return jf(E, G, 0, v, u, d, f, 0, 0, 0), Fr(E, G, !0);
  }, [v, u, d, f]), D = X(() => {
    const E = new Float32Array(C * 3), G = new Float32Array(C * 3);
    return Vf(E, G, 0, C, d, 0, 0, 0), Fr(E, G, !0);
  }, [C, d]), O = X(() => {
    const E = new Float32Array(T * 3), G = new Float32Array(T * 3), I = new Float32Array(T * 4), $ = new Float32Array(T * 2);
    Zf(E, G, I, $, null, null, 0, T, u, d, f, c, 0, 0, 0);
    const R = new B.BufferGeometry();
    return R.setAttribute("position", new B.Float32BufferAttribute(E, 3)), R.setAttribute("color", new B.Float32BufferAttribute(G, 3)), R.setAttribute("aParams1", new B.Float32BufferAttribute(I, 4)), R.setAttribute("aParams2", new B.Float32BufferAttribute($, 2)), R.computeBoundingSphere(), R;
  }, [T, u, d, f, c]), z = X(() => new B.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPointSize: { value: 0.11 * c }, uScale: { value: 1 }, uOpacity: { value: 0.88 } },
    vertexShader: u2,
    fragmentShader: Yf,
    transparent: !0,
    depthWrite: !1
  }), [c]);
  return Ke(() => {
    const E = o.current;
    if (E) {
      E.count = S;
      for (let R = 0; R < g.length; R++) {
        const L = g[R];
        L && kn(E, R, null, [0, L.pivotY, 0], [L.lean, L.yaw, L.bend], [0, L.length * 0.5, 0], null, [L.radius, L.length, L.radius]);
      }
      E.instanceMatrix.needsUpdate = !0;
    }
    const G = r.current;
    if (G) {
      G.count = m;
      let R = 0;
      for (const L of _) kn(G, R++, null, [0, 0.14 * c, 0], [0, L.angle, L.spread], [0, L.length * 0.22, 0], null, [L.radius, L.length, L.radius]);
      for (const L of g) kn(G, R++, null, [0, L.pivotY, 0], [L.lean, L.yaw, L.bend], [0, L.length * 0.76, 0], [L.twigLean, L.twigYaw, L.bend * -0.42], [L.radius * 0.52, L.twigLength, L.radius * 0.52]);
      G.instanceMatrix.needsUpdate = !0;
    }
    const I = a.current;
    if (I) {
      I.count = y;
      for (let R = 0; R < b.length; R++) {
        const L = b[R];
        L && zr(I, R, null, L.position, L.rotation, L.outerScale);
      }
      I.instanceMatrix.needsUpdate = !0;
    }
    const $ = l.current;
    if ($) {
      $.count = y;
      for (let R = 0; R < b.length; R++) {
        const L = b[R];
        L && zr($, R, null, L.position, L.rotation, L.innerScale);
      }
      $.instanceMatrix.needsUpdate = !0;
    }
  }, [g, _, b, c, S, m, y]), oe(() => () => {
    P.dispose(), D.dispose(), O.dispose(), z.dispose();
  }, [P, D, O, z]), $e((E) => {
    const G = i.current?.parent;
    if (G && !G.visible) return;
    const I = E.clock.getElapsedTime(), $ = i.current?.material;
    if ($?.uniforms) {
      const R = $.uniforms.uTime, L = $.uniforms.uScale;
      R && (R.value = I), L && (L.value = E.gl.domElement.height * 0.5);
    }
    n.current && (n.current.rotation.z = Math.sin(I * 0.42 + c) * 0.028, n.current.rotation.x = Math.cos(I * 0.35 + c * 0.6) * 0.012, n.current.position.x = Math.sin(I * 0.28 + c) * 0.04 * c);
  }), /* @__PURE__ */ x("group", { position: [0, 0.02, 0], children: [
    /* @__PURE__ */ x("group", { position: [0, u * 0.5, 0], rotation: [0.02, 0, -0.04], children: [
      /* @__PURE__ */ s("mesh", { geometry: h.limb, material: w.bark, scale: [0.3 * c, u, 0.3 * c], castShadow: !0, receiveShadow: !0 }),
      /* @__PURE__ */ s("mesh", { geometry: h.trunkTop, material: w.barkDark, position: [0, u * 0.48, 0], scale: [0.24 * c, 0.32 * c, 0.24 * c], castShadow: !0, receiveShadow: !0 })
    ] }),
    /* @__PURE__ */ s("instancedMesh", { ref: o, args: [h.limb, w.bark, S] }),
    /* @__PURE__ */ s("instancedMesh", { ref: r, args: [h.limb, w.barkDark, m] }),
    /* @__PURE__ */ x("group", { ref: n, children: [
      /* @__PURE__ */ s("instancedMesh", { ref: a, args: [h.canopyCluster, w.blossomShell, y], castShadow: !0 }),
      /* @__PURE__ */ s("instancedMesh", { ref: l, args: [h.canopyCore, w.blossomCore, y] }),
      /* @__PURE__ */ s("points", { geometry: P, children: /* @__PURE__ */ s("pointsMaterial", { size: 0.08 * c, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.82, depthWrite: !1 }) })
    ] }),
    /* @__PURE__ */ s("points", { ref: i, geometry: O, material: z, frustumCulled: !1 }),
    /* @__PURE__ */ s("points", { geometry: D, children: /* @__PURE__ */ s("pointsMaterial", { size: 0.085 * c, sizeAttenuation: !0, vertexColors: !0, transparent: !0, opacity: 0.7, depthWrite: !1 }) })
  ] });
}
const u2 = (
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
), Ze = 2e3, d2 = 800, Le = 20, yr = 20, f2 = 3, p2 = (
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
), h2 = (
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
let qi = null;
function m2() {
  if (qi) return qi;
  const e = document.createElement("canvas");
  e.width = 16, e.height = 16;
  const t = e.getContext("2d"), n = t.createRadialGradient(8, 8, 0, 8, 8, 8);
  return n.addColorStop(0, "rgba(255,255,255,1)"), n.addColorStop(1, "rgba(255,255,255,0)"), t.fillStyle = n, t.fillRect(0, 0, 16, 16), qi = new B.CanvasTexture(e), qi.needsUpdate = !0, qi;
}
function g2({ followCamera: e = !1 }) {
  const t = ee(null), n = ee(null), i = X(() => {
    const r = new B.BufferGeometry(), a = new Float32Array(Ze * 3), l = new Float32Array(Ze), c = new Float32Array(Ze), u = new Float32Array(Ze), d = new Float32Array(Ze), f = new Float32Array(Ze);
    for (let p = 0; p < Ze; p++)
      a[p * 3] = 0, a[p * 3 + 1] = 0, a[p * 3 + 2] = 0, l[p] = Math.random(), c[p] = (Math.random() - 0.5) * Le * 2, u[p] = (Math.random() - 0.5) * Le * 2, d[p] = 0.5 + Math.random() * 1.5, f[p] = 0.05 + Math.random() * 0.25;
    return r.setAttribute("position", new B.Float32BufferAttribute(a, 3)), r.setAttribute("aSeed", new B.Float32BufferAttribute(l, 1)), r.setAttribute("aBaseX", new B.Float32BufferAttribute(c, 1)), r.setAttribute("aBaseZ", new B.Float32BufferAttribute(u, 1)), r.setAttribute("aFallSpeed", new B.Float32BufferAttribute(d, 1)), r.setAttribute("aDriftAmp", new B.Float32BufferAttribute(f, 1)), r.boundingSphere = new B.Sphere(new B.Vector3(), Le * 4), r;
  }, []), o = X(
    () => new B.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOrigin: { value: new B.Vector3() },
        uHalfRange: { value: Le },
        uHeight: { value: yr },
        uPointSize: { value: 0.08 },
        uScale: { value: 1 },
        uOpacity: { value: 0.85 }
      },
      vertexShader: p2,
      fragmentShader: h2,
      transparent: !0,
      depthWrite: !1
    }),
    []
  );
  return oe(() => () => {
    i.dispose(), o.dispose();
  }, [i, o]), $e((r) => {
    const a = t.current;
    if (!a) return;
    const l = a.parent;
    if (l && !l.visible) return;
    const c = n.current.uniforms, u = c.uTime, d = c.uOrigin, f = c.uScale;
    u && (u.value = r.clock.elapsedTime), e && d && d.value.copy(r.camera.position), f && (f.value = r.gl.domElement.height * 0.5);
  }), /* @__PURE__ */ s(
    "points",
    {
      ref: t,
      geometry: i,
      frustumCulled: !1,
      children: /* @__PURE__ */ s("primitive", { ref: n, object: o, attach: "material" })
    }
  );
}
function Xf({ gpu: e, followCamera: t = !1 } = {}) {
  return e ? /* @__PURE__ */ s(g2, { followCamera: t }) : /* @__PURE__ */ s(b2, { followCamera: t });
}
function b2({ followCamera: e = !1 }) {
  const t = ee(null), n = ee(new Float32Array(Ze * 3)), i = ee(new Float32Array(Ze * 3)), o = ee(null), r = ee(null), a = X(() => new Float32Array(6), []), l = ee(0);
  oe(() => {
    const d = n.current, f = i.current;
    for (let g = 0; g < Ze; g++)
      d[g * 3] = (Math.random() - 0.5) * Le * 2, d[g * 3 + 1] = Math.random() * yr, d[g * 3 + 2] = (Math.random() - 0.5) * Le * 2, f[g * 3] = 0, f[g * 3 + 1] = -(0.5 + Math.random() * 1.5), f[g * 3 + 2] = 0;
    let p = 0, h = 0, w = 0;
    return mu().then((g) => {
      if (!g) return;
      o.current = g;
      const _ = Ze * 3;
      p = g.alloc_f32(_), h = g.alloc_f32(_), w = g.alloc_f32(6), new Float32Array(g.memory.buffer, p, _).set(d), new Float32Array(g.memory.buffer, h, _).set(f), r.current = { p, v: h, b: w };
    }), () => {
      const g = o.current;
      g && (p && g.dealloc_f32(p, Ze * 3), h && g.dealloc_f32(h, Ze * 3), w && g.dealloc_f32(w, 6));
    };
  }, []), $e((d, f) => {
    const p = t.current?.parent;
    if (p && !p.visible) return;
    if (e) {
      const v = d.camera.position;
      a[0] = v.x - Le, a[1] = v.x + Le, a[2] = v.y - 5, a[3] = v.y + yr, a[4] = v.z - Le, a[5] = v.z + Le;
    } else
      a[0] = -Le, a[1] = Le, a[2] = 0, a[3] = yr, a[4] = -Le, a[5] = Le;
    const h = Math.min(f, 0.05), w = o.current, g = r.current, _ = n.current, b = i.current, m = l.current++ % f2 === 0, y = t.current;
    if (y)
      if (w && g) {
        new Float32Array(w.memory.buffer, g.b, 6).set(a), w.update_snow_particles(
          Ze,
          g.p,
          g.v,
          g.b,
          0.3,
          0,
          0,
          2,
          0.01,
          h
        );
        const v = new Float32Array(w.memory.buffer, g.p, Ze * 3), C = y.geometry.attributes.position;
        if (!(C instanceof B.BufferAttribute)) return;
        C.array = v, C.needsUpdate = !0;
      } else {
        const v = m ? Ze : d2;
        for (let T = 0; T < v; T++) {
          const P = T * 3, D = b[P], O = b[P + 1], z = b[P + 2], E = _[P], G = _[P + 1], I = _[P + 2], $ = a[0], R = a[1], L = a[2], M = a[3], F = a[4], U = a[5];
          if (D === void 0 || O === void 0 || z === void 0 || E === void 0 || G === void 0 || I === void 0 || $ === void 0 || R === void 0 || L === void 0 || M === void 0 || F === void 0 || U === void 0)
            continue;
          const V = D * 0.99 + 0.3 * h;
          let Y = O - 2 * h;
          const Z = z * 0.99;
          let J = E + V * h, q = G + Y * h, A = I + Z * h;
          J < $ ? J += Le * 2 : J > R && (J -= Le * 2), q < L && (q = M, Y = -(0.5 + Math.random() * 1.5)), A < F ? A += Le * 2 : A > U && (A -= Le * 2), b[P] = V, b[P + 1] = Y, b[P + 2] = Z, _[P] = J, _[P + 1] = q, _[P + 2] = A;
        }
        const C = y.geometry.attributes.position;
        if (!(C instanceof B.BufferAttribute)) return;
        C.needsUpdate = !0;
      }
  });
  const c = X(() => {
    const d = new B.BufferGeometry(), f = new B.Float32BufferAttribute(n.current, 3);
    return f.setUsage(B.DynamicDrawUsage), d.setAttribute("position", f), d;
  }, []), u = X(
    () => new B.PointsMaterial({
      size: 0.08,
      map: m2(),
      transparent: !0,
      opacity: 0.85,
      depthWrite: !1
    }),
    []
  );
  return oe(() => () => {
    c.dispose(), u.dispose();
  }, [c, u]), /* @__PURE__ */ s(
    "points",
    {
      ref: t,
      geometry: c,
      material: u,
      frustumCulled: !1
    }
  );
}
ge.memo(Xf);
function y2() {
  const e = j((y) => y.editMode), t = j((y) => y.hoverPosition), n = j((y) => y.checkTilePosition), i = j((y) => y.currentTileMultiplier), o = j((y) => y.currentTileHeight), r = j((y) => y.currentTileShape), a = j((y) => y.currentTileRotation), l = j((y) => y.currentObjectRotation), c = j((y) => y.selectedPlacedObjectType), u = fe.GRID_CELL_SIZE * i, f = (r === "stairs" || r === "ramp" ? Math.max(1, o) : o) * fe.HEIGHT_STEP, p = Math.max(0.12, f + 0.12), h = B.MathUtils.clamp(u / fe.GRID_CELL_SIZE, 0.95, 1.85), w = X(() => {
    const y = new B.BufferGeometry(), v = new Float32Array([
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
    return y.setAttribute("position", new B.BufferAttribute(v, 3)), y.setIndex(C), y.computeVertexNormals(), y;
  }, []);
  if (oe(() => () => {
    w.dispose();
  }, [w]), e !== "tile" && e !== "object" || !t)
    return null;
  const g = e === "tile" && (r === "box" || r === "round") ? t.y + o * fe.HEIGHT_STEP : t.y, _ = e === "tile" ? n({ x: t.x, y: g, z: t.z }) : !1, b = _ ? "#f3b95f" : "#7dd3fc", S = _ ? 0.3 : 0.38, m = _ ? 0.08 : 0.12;
  return /* @__PURE__ */ x("group", { position: [t.x, g, t.z], rotation: [0, e === "object" ? l : a, 0], children: [
    e === "tile" && (r === "round" ? /* @__PURE__ */ x("mesh", { position: [0, f > 0.02 ? f / 2 : -0.02, 0], children: [
      /* @__PURE__ */ s("cylinderGeometry", { args: [u / 2, u / 2, f > 0.02 ? f : 0.04, 24] }),
      /* @__PURE__ */ s("meshStandardMaterial", { color: b, transparent: !0, opacity: S, emissive: b, emissiveIntensity: m })
    ] }) : r === "stairs" ? /* @__PURE__ */ s(be, { children: Array.from({ length: 4 }, (y, v) => {
      const T = Math.max(fe.HEIGHT_STEP, f) / 4, P = u / 4, D = T * (v + 1) - T / 2, O = -u / 2 + P * v + P / 2;
      return /* @__PURE__ */ x("mesh", { position: [0, D, O], children: [
        /* @__PURE__ */ s("boxGeometry", { args: [u, T * (v + 1), P] }),
        /* @__PURE__ */ s("meshStandardMaterial", { color: b, transparent: !0, opacity: S, emissive: b, emissiveIntensity: m })
      ] }, v);
    }) }) : r === "ramp" ? /* @__PURE__ */ s("mesh", { position: [0, 0, 0], scale: [u, Math.max(fe.HEIGHT_STEP, f), u], geometry: w, children: /* @__PURE__ */ s("meshStandardMaterial", { color: b, transparent: !0, opacity: S, emissive: b, emissiveIntensity: m }) }) : /* @__PURE__ */ x("mesh", { position: [0, p / 2, 0], children: [
      /* @__PURE__ */ s("boxGeometry", { args: [u, p, u] }),
      /* @__PURE__ */ s("meshStandardMaterial", { color: b, transparent: !0, opacity: S, emissive: b, emissiveIntensity: m })
    ] })),
    e === "object" && /* @__PURE__ */ x("mesh", { position: [0, 0.06, 0], children: [
      /* @__PURE__ */ s("cylinderGeometry", { args: [0.35, 0.35, 0.12, 16] }),
      /* @__PURE__ */ s("meshStandardMaterial", { color: "#7dd3fc", transparent: !0, opacity: 0.38, emissive: "#2f8dbd", emissiveIntensity: 0.12 })
    ] }),
    e === "object" && c === "sakura" && /* @__PURE__ */ x("group", { position: [0, Math.max(f, 0.04), 0], children: [
      /* @__PURE__ */ x("mesh", { position: [0, 1.9 * h, 0], children: [
        /* @__PURE__ */ s("cylinderGeometry", { args: [0.16 * h, 0.28 * h, 3.8 * h, 8] }),
        /* @__PURE__ */ s(
          "meshStandardMaterial",
          {
            color: b,
            transparent: !0,
            opacity: 0.32,
            emissive: b,
            emissiveIntensity: 0.15
          }
        )
      ] }),
      /* @__PURE__ */ x("mesh", { position: [0, 4 * h, 0], children: [
        /* @__PURE__ */ s("sphereGeometry", { args: [1.55 * h, 10, 8] }),
        /* @__PURE__ */ s(
          "meshStandardMaterial",
          {
            color: b,
            transparent: !0,
            opacity: 0.18,
            emissive: b,
            emissiveIntensity: 0.18
          }
        )
      ] }),
      /* @__PURE__ */ x("mesh", { position: [0.95 * h, 3.55 * h, 0.4 * h], children: [
        /* @__PURE__ */ s("sphereGeometry", { args: [0.92 * h, 8, 6] }),
        /* @__PURE__ */ s(
          "meshStandardMaterial",
          {
            color: b,
            transparent: !0,
            opacity: 0.14,
            emissive: b,
            emissiveIntensity: 0.12
          }
        )
      ] }),
      /* @__PURE__ */ x("mesh", { position: [-0.88 * h, 3.7 * h, -0.55 * h], children: [
        /* @__PURE__ */ s("sphereGeometry", { args: [1.02 * h, 8, 6] }),
        /* @__PURE__ */ s(
          "meshStandardMaterial",
          {
            color: b,
            transparent: !0,
            opacity: 0.14,
            emissive: b,
            emissiveIntensity: 0.12
          }
        )
      ] })
    ] })
  ] });
}
function v2() {
  const e = j((u) => u.editMode), t = j((u) => u.hoverPosition), n = j((u) => u.currentWallRotation), i = j((u) => u.checkWallPosition), o = fe.WALL_SIZES.WIDTH, r = fe.WALL_SIZES.HEIGHT, a = fe.WALL_SIZES.THICKNESS;
  if (e !== "wall" || !t)
    return null;
  const l = i(t, n), c = l ? "#f3b95f" : "#7dd3fc";
  return /* @__PURE__ */ s("group", { position: [t.x, t.y + r / 2, t.z], rotation: [0, n, 0], children: /* @__PURE__ */ x("mesh", { position: [0, 0, o / 2], children: [
    /* @__PURE__ */ s("boxGeometry", { args: [o, r, a] }),
    /* @__PURE__ */ s(
      "meshStandardMaterial",
      {
        color: c,
        transparent: !0,
        opacity: l ? 0.34 : 0.42,
        emissive: c,
        emissiveIntensity: l ? 0.08 : 0.14
      }
    )
  ] }) });
}
const Lr = ks();
let Ra = null, Da = null;
function Kf(e) {
  return e ? (Ra || (Ra = ui({ vertexColors: !0, steps: 4 })), Ra) : (Da || (Da = new B.MeshStandardMaterial({ vertexColors: !0, roughness: 1, metalness: 0.02 })), Da);
}
function Bn(e) {
  const t = Math.sin(e * 127.1 + 311.7) * 43758.5453123;
  return t - Math.floor(t);
}
function $r(e, t, n) {
  const i = Math.max(n, 1), o = Lr(e / (i * 0.8), t / (i * 0.8)) * 0.07, r = Lr(e / (i * 0.32) + 8.3, t / (i * 0.42) - 5.4) * 0.025, a = Math.sin(e * 1.35 + t * 0.42) * 0.01, l = Math.exp(-(((e + i * 0.18) * (e + i * 0.18) + (t - i * 0.08) * (t - i * 0.08)) / Math.max(i * i * 0.55, 1))) * 0.09, c = Math.exp(-(((e - i * 0.24) * (e - i * 0.24) + (t + i * 0.16) * (t + i * 0.16)) / Math.max(i * i * 0.7, 1))) * 0.05;
  return 0.025 + o + r + a + l + c;
}
function w2(e) {
  let t = 0, n = 0, i = 0;
  const o = [], r = [];
  for (const b of e) {
    const S = Math.max(20, Math.round(b.size * 6));
    o.push(S), t += (S + 1) * (S + 1), n += S * S * 6;
    const m = Math.max(90, Math.min(240, Math.round(b.size * b.size * 10)));
    r.push(m), i += m;
  }
  const a = new Float32Array(t * 3), l = new Float32Array(t * 3), c = new Uint32Array(n);
  let u = 0, d = 0;
  for (let b = 0; b < e.length; b++) {
    const S = e[b], m = o[b];
    if (!S || m === void 0) continue;
    const y = S.size, v = S.position[0], C = S.position[1] + 0.04, T = S.position[2], P = new B.Color(S.color ?? "#b89b66"), D = new B.Color(S.accentColor ?? "#e0c27a"), O = new B.Color();
    for (let z = 0; z <= m; z++)
      for (let E = 0; E <= m; E++) {
        const G = u + z * (m + 1) + E, I = (E / m - 0.5) * y, $ = (z / m - 0.5) * y, R = $r(I, $, y), L = 0.5 + 0.5 * Lr(I * 0.22 + 5.1, $ * 0.22 - 3.6), M = G * 3;
        a[M] = I + v, a[M + 1] = R + C, a[M + 2] = $ + T, O.copy(P).lerp(D, L * 0.45).multiplyScalar(0.86 + L * 0.18), l[M] = O.r, l[M + 1] = O.g, l[M + 2] = O.b;
      }
    for (let z = 0; z < m; z++)
      for (let E = 0; E < m; E++) {
        const G = u + z * (m + 1) + E, I = G + 1, $ = G + (m + 1), R = $ + 1;
        c[d++] = G, c[d++] = $, c[d++] = I, c[d++] = I, c[d++] = $, c[d++] = R;
      }
    u += (m + 1) * (m + 1);
  }
  const f = new B.BufferGeometry();
  f.setAttribute("position", new B.Float32BufferAttribute(a, 3)), f.setAttribute("color", new B.Float32BufferAttribute(l, 3)), f.setIndex(new B.BufferAttribute(c, 1)), f.computeVertexNormals(), f.computeBoundingSphere();
  const p = new Float32Array(i * 3), h = new Float32Array(i * 3);
  let w = 0;
  for (let b = 0; b < e.length; b++) {
    const S = e[b], m = r[b];
    if (!S || m === void 0) continue;
    const y = S.size, v = S.position[0], C = S.position[1] + 0.04, T = S.position[2], P = new B.Color(S.color ?? "#b89b66"), D = new B.Color(S.accentColor ?? "#e0c27a"), O = new B.Color();
    for (let z = 0; z < m; z++) {
      const E = (w + z) * 3, G = Bn(z * 3.13 + 0.2) * y - y * 0.5, I = Bn(z * 4.71 + 1.4) * y - y * 0.5, $ = Bn(z * 5.93 + 2.8), R = Bn(z * 2.37 + 0.9), L = $r(G, I, y) + 0.01 + $ * 0.015;
      p[E] = G + v, p[E + 1] = L + C, p[E + 2] = I + T, O.copy(P).lerp(D, R * 0.55).multiplyScalar(0.92 + R * 0.12), h[E] = O.r, h[E + 1] = O.g, h[E + 2] = O.b;
    }
    w += m;
  }
  const g = new B.BufferGeometry();
  g.setAttribute("position", new B.Float32BufferAttribute(p, 3)), g.setAttribute("color", new B.Float32BufferAttribute(h, 3)), g.computeBoundingSphere();
  const _ = e.length > 0 ? e.reduce((b, S) => b + S.size, 0) / e.length : 4;
  return [f, g, _];
}
function x2({ entries: e, toon: t }) {
  const [n, i, o] = X(
    () => w2(e),
    [e]
  ), r = t ?? We(), a = Kf(r);
  return oe(() => () => {
    n.dispose(), i.dispose();
  }, [n, i]), e.length === 0 ? null : /* @__PURE__ */ x(be, { children: [
    /* @__PURE__ */ s("mesh", { geometry: n, material: a, castShadow: !0, receiveShadow: !0 }),
    /* @__PURE__ */ s("points", { geometry: i, children: /* @__PURE__ */ s(
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
function EM({ size: e = 4, toon: t, color: n, accentColor: i }) {
  const o = t ?? We(), r = Kf(o), [a, l] = X(() => {
    const c = Math.max(20, Math.round(e * 6)), u = new B.PlaneGeometry(e, e, c, c);
    u.rotateX(-Math.PI / 2);
    const d = u.getAttribute("position"), f = new Float32Array(d.count * 3), p = new B.Color(), h = new B.Color(n ?? "#b89b66"), w = new B.Color(i ?? "#e0c27a");
    for (let m = 0; m < d.count; m++) {
      const y = d.getX(m), v = d.getZ(m), C = $r(y, v, e), T = 0.5 + 0.5 * Lr(y * 0.22 + 5.1, v * 0.22 - 3.6);
      d.setY(m, C), p.copy(h).lerp(w, T * 0.45).multiplyScalar(0.86 + T * 0.18), f[m * 3] = p.r, f[m * 3 + 1] = p.g, f[m * 3 + 2] = p.b;
    }
    u.setAttribute("color", new B.Float32BufferAttribute(f, 3)), u.computeVertexNormals();
    const g = Math.max(90, Math.min(240, Math.round(e * e * 10))), _ = new Float32Array(g * 3), b = new Float32Array(g * 3);
    for (let m = 0; m < g; m++) {
      const y = Bn(m * 3.13 + 0.2) * e - e * 0.5, v = Bn(m * 4.71 + 1.4) * e - e * 0.5, C = Bn(m * 5.93 + 2.8), T = Bn(m * 2.37 + 0.9), P = $r(y, v, e) + 0.01 + C * 0.015;
      _[m * 3] = y, _[m * 3 + 1] = P, _[m * 3 + 2] = v, p.copy(h).lerp(w, T * 0.55).multiplyScalar(0.92 + T * 0.12), b[m * 3] = p.r, b[m * 3 + 1] = p.g, b[m * 3 + 2] = p.b;
    }
    const S = new B.BufferGeometry();
    return S.setAttribute("position", new B.Float32BufferAttribute(_, 3)), S.setAttribute("color", new B.Float32BufferAttribute(b, 3)), [u, S];
  }, [i, n, e]);
  return oe(() => () => {
    a.dispose(), l.dispose();
  }, [l, a]), /* @__PURE__ */ x("group", { position: [0, 0.04, 0], children: [
    /* @__PURE__ */ s("mesh", { geometry: a, material: r, castShadow: !0, receiveShadow: !0 }),
    /* @__PURE__ */ s("points", { geometry: l, frustumCulled: !1, children: /* @__PURE__ */ s(
      "pointsMaterial",
      {
        size: Math.max(0.02, e * 8e-3),
        vertexColors: !0,
        transparent: !0,
        opacity: 0.85,
        depthWrite: !1
      }
    ) })
  ] });
}
const Or = ks();
let za = null, Fa = null;
function qf(e) {
  return e ? (za || (za = ui({
    vertexColors: !0,
    steps: 4,
    emissive: "#9ec1e8",
    emissiveIntensity: 0.06
  })), za) : (Fa || (Fa = new B.MeshPhysicalMaterial({
    vertexColors: !0,
    roughness: 0.88,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.75
  })), Fa);
}
function Rn(e) {
  const t = Math.sin(e * 91.7 + 173.3) * 43758.5453123;
  return t - Math.floor(t);
}
function Hr(e, t, n) {
  const i = Math.max(n, 1), o = Math.exp(-(((e + i * 0.2) * (e + i * 0.2) + (t - i * 0.14) * (t - i * 0.14)) / Math.max(i * i * 0.48, 1))) * 0.12, r = Math.exp(-(((e - i * 0.18) * (e - i * 0.18) + (t + i * 0.12) * (t + i * 0.12)) / Math.max(i * i * 0.65, 1))) * 0.08, a = Or(e / (i * 0.7), t / (i * 0.7)) * 0.06, l = Or(e / (i * 0.24) + 6.1, t / (i * 0.24) - 3.7) * 0.018;
  return 0.05 + o + r + a + l;
}
function _2(e) {
  let t = 0, n = 0, i = 0;
  const o = [], r = [];
  for (const b of e) {
    const S = Math.max(22, Math.round(b.size * 7));
    o.push(S), t += (S + 1) * (S + 1), n += S * S * 6;
    const m = Math.max(28, Math.min(96, Math.round(b.size * b.size * 3)));
    r.push(m), i += m;
  }
  const a = new Float32Array(t * 3), l = new Float32Array(t * 3), c = new Uint32Array(n);
  let u = 0, d = 0;
  for (let b = 0; b < e.length; b++) {
    const S = e[b], m = o[b];
    if (!S || m === void 0) continue;
    const y = S.size, v = S.position[0], C = S.position[1] + 0.045, T = S.position[2], P = new B.Color(S.color ?? "#dcecff"), D = new B.Color(S.accentColor ?? "#ffffff"), O = new B.Color();
    for (let z = 0; z <= m; z++)
      for (let E = 0; E <= m; E++) {
        const G = u + z * (m + 1) + E, I = (E / m - 0.5) * y, $ = (z / m - 0.5) * y, R = Hr(I, $, y), L = 0.5 + 0.5 * Or(I * 0.16 - 2.4, $ * 0.16 + 7.2), M = G * 3;
        a[M] = I + v, a[M + 1] = R + C, a[M + 2] = $ + T, O.copy(P).lerp(D, L * 0.55).multiplyScalar(0.9 + L * 0.1), l[M] = O.r, l[M + 1] = O.g, l[M + 2] = O.b;
      }
    for (let z = 0; z < m; z++)
      for (let E = 0; E < m; E++) {
        const G = u + z * (m + 1) + E, I = G + 1, $ = G + (m + 1), R = $ + 1;
        c[d++] = G, c[d++] = $, c[d++] = I, c[d++] = I, c[d++] = $, c[d++] = R;
      }
    u += (m + 1) * (m + 1);
  }
  const f = new B.BufferGeometry();
  f.setAttribute("position", new B.Float32BufferAttribute(a, 3)), f.setAttribute("color", new B.Float32BufferAttribute(l, 3)), f.setIndex(new B.BufferAttribute(c, 1)), f.computeVertexNormals(), f.computeBoundingSphere();
  const p = new Float32Array(i * 3), h = new Float32Array(i * 3);
  let w = 0;
  for (let b = 0; b < e.length; b++) {
    const S = e[b], m = r[b];
    if (!S || m === void 0) continue;
    const y = S.size, v = S.position[0], C = S.position[1] + 0.045, T = S.position[2], P = new B.Color(S.color ?? "#dcecff"), D = new B.Color(S.accentColor ?? "#ffffff"), O = new B.Color();
    for (let z = 0; z < m; z++) {
      const E = (w + z) * 3, G = Rn(z * 2.71 + 0.4) * y - y * 0.5, I = Rn(z * 3.97 + 1.9) * y - y * 0.5, $ = Rn(z * 5.41 + 2.2), R = Rn(z * 7.13 + 3.1), L = Hr(G, I, y) + 0.016 + $ * 0.02;
      p[E] = G + v, p[E + 1] = L + C, p[E + 2] = I + T, O.copy(P).lerp(D, 0.6 + R * 0.4), h[E] = O.r, h[E + 1] = O.g, h[E + 2] = O.b;
    }
    w += m;
  }
  const g = new B.BufferGeometry();
  g.setAttribute("position", new B.Float32BufferAttribute(p, 3)), g.setAttribute("color", new B.Float32BufferAttribute(h, 3)), g.computeBoundingSphere();
  const _ = e.length > 0 ? e.reduce((b, S) => b + S.size, 0) / e.length : 4;
  return [f, g, _];
}
function S2({ entries: e, toon: t }) {
  const [n, i, o] = X(
    () => _2(e),
    [e]
  ), r = t ?? We(), a = qf(r);
  return oe(() => () => {
    n.dispose(), i.dispose();
  }, [n, i]), e.length === 0 ? null : /* @__PURE__ */ x(be, { children: [
    /* @__PURE__ */ s("mesh", { geometry: n, material: a, castShadow: !0, receiveShadow: !0 }),
    /* @__PURE__ */ s("points", { geometry: i, children: /* @__PURE__ */ s(
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
function AM({ size: e = 4, toon: t, color: n, accentColor: i }) {
  const o = t ?? We(), r = qf(o), [a, l] = X(() => {
    const c = Math.max(22, Math.round(e * 7)), u = new B.PlaneGeometry(e, e, c, c);
    u.rotateX(-Math.PI / 2);
    const d = u.getAttribute("position"), f = new Float32Array(d.count * 3), p = new B.Color(), h = new B.Color(n ?? "#dcecff"), w = new B.Color(i ?? "#ffffff");
    for (let m = 0; m < d.count; m++) {
      const y = d.getX(m), v = d.getZ(m), C = Hr(y, v, e), T = 0.5 + 0.5 * Or(y * 0.16 - 2.4, v * 0.16 + 7.2);
      d.setY(m, C), p.copy(h).lerp(w, T * 0.55).multiplyScalar(0.9 + T * 0.1), f[m * 3] = p.r, f[m * 3 + 1] = p.g, f[m * 3 + 2] = p.b;
    }
    u.setAttribute("color", new B.Float32BufferAttribute(f, 3)), u.computeVertexNormals();
    const g = Math.max(28, Math.min(96, Math.round(e * e * 3))), _ = new Float32Array(g * 3), b = new Float32Array(g * 3);
    for (let m = 0; m < g; m++) {
      const y = Rn(m * 2.71 + 0.4) * e - e * 0.5, v = Rn(m * 3.97 + 1.9) * e - e * 0.5, C = Rn(m * 5.41 + 2.2), T = Rn(m * 7.13 + 3.1), P = Hr(y, v, e) + 0.016 + C * 0.02;
      _[m * 3] = y, _[m * 3 + 1] = P, _[m * 3 + 2] = v, p.copy(h).lerp(w, 0.6 + T * 0.4), b[m * 3] = p.r, b[m * 3 + 1] = p.g, b[m * 3 + 2] = p.b;
    }
    const S = new B.BufferGeometry();
    return S.setAttribute("position", new B.Float32BufferAttribute(_, 3)), S.setAttribute("color", new B.Float32BufferAttribute(b, 3)), [u, S];
  }, [e, i, n]);
  return oe(() => () => {
    a.dispose(), l.dispose();
  }, [l, a]), /* @__PURE__ */ x("group", { position: [0, 0.045, 0], children: [
    /* @__PURE__ */ s("mesh", { geometry: a, material: r, castShadow: !0, receiveShadow: !0 }),
    /* @__PURE__ */ s("points", { geometry: l, frustumCulled: !1, children: /* @__PURE__ */ s(
      "pointsMaterial",
      {
        size: Math.max(0.03, e * 0.01),
        vertexColors: !0,
        transparent: !0,
        opacity: 0.55,
        depthWrite: !1
      }
    ) })
  ] });
}
Gr({ Water: dh });
const M2 = (
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
), C2 = (
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
let La = null;
function sr(e, t) {
  const n = Math.sin(e * 127.1 + t * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}
function N2(e, t) {
  const n = Math.floor(e), i = Math.floor(t), o = e - n, r = t - i, a = o * o * (3 - 2 * o), l = r * r * (3 - 2 * r), c = sr(n, i), u = sr(n + 1, i), d = sr(n, i + 1), f = sr(n + 1, i + 1);
  return B.MathUtils.lerp(
    B.MathUtils.lerp(c, u, a),
    B.MathUtils.lerp(d, f, a),
    l
  );
}
function lr(e, t) {
  let n = 0, i = 0.58, o = 1.15;
  for (let r = 0; r < 5; r += 1)
    n += N2(e * o + 17.3 * r, t * o - 9.1 * r) * i, o *= 2.03, i *= 0.48;
  return n += Math.sin(e * 8.2 + t * 1.7) * 0.06, n += Math.cos(t * 7.1 - e * 2.4) * 0.05, n;
}
function I2(e = 128) {
  if (La) return La;
  const t = new Uint8Array(e * e * 4);
  for (let i = 0; i < e; i += 1)
    for (let o = 0; o < e; o += 1) {
      const r = (i * e + o) * 4, a = o / e, l = i / e, c = 1 / e, u = lr(a - c, l), d = lr(a + c, l), f = lr(a, l - c), p = lr(a, l + c), h = (u - d) * 1.15, w = (f - p) * 1.15, g = 1, _ = Math.sqrt(h * h + w * w + g * g) || 1;
      t[r] = Math.round((h / _ * 0.5 + 0.5) * 255), t[r + 1] = Math.round((w / _ * 0.5 + 0.5) * 255), t[r + 2] = Math.round((g / _ * 0.5 + 0.5) * 255), t[r + 3] = 255;
    }
  const n = new B.DataTexture(t, e, e, B.RGBAFormat);
  return n.wrapS = B.RepeatWrapping, n.wrapT = B.RepeatWrapping, n.minFilter = B.LinearMipmapLinearFilter, n.magFilter = B.LinearFilter, n.generateMipmaps = !0, n.colorSpace = B.NoColorSpace, n.needsUpdate = !0, La = n, n;
}
function Qf({ lod: e, center: t, size: n = 16, width: i, depth: o, shore: r, toon: a }) {
  const l = a ?? We(), c = ee(null), u = ee(null), d = ee(null), f = ee(null), p = ee(new B.Vector3()), h = ee(!0), w = ee(!0), g = ee(0), _ = ee(0), b = X(
    () => new B.MeshPhysicalMaterial({
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
  ), S = X(
    () => ({
      north: r?.north ?? !0,
      south: r?.south ?? !0,
      east: r?.east ?? !0,
      west: r?.west ?? !0
    }),
    [r?.east, r?.north, r?.south, r?.west]
  ), m = i ?? n, y = o ?? n, v = Math.min(Math.min(m, y) * 0.18, 0.72), C = S.north ? v : 0, T = S.south ? v : 0, P = S.east ? v : 0, D = S.west ? v : 0, O = Math.max(m - D - P, m * 0.34), z = Math.max(y - C - T, y * 0.34), E = (D - P) * 0.5, G = (C - T) * 0.5, I = Math.max(
    m - (S.west ? v * 0.25 : 0) - (S.east ? v * 0.25 : 0),
    m * 0.42
  ), $ = Math.max(
    y - (S.north ? v * 0.25 : 0) - (S.south ? v * 0.25 : 0),
    y * 0.42
  ), R = I2(), L = X(() => {
    const Z = Math.max(m, y);
    return Z <= 8 ? 256 : Z <= 24 ? 384 : 512;
  }, [y, m]);
  oe(() => {
    t && p.current.set(t[0], t[1], t[2]);
  }, [t]);
  const M = X(
    () => ({
      textureWidth: L,
      textureHeight: L,
      waterNormals: R,
      sunDirection: new B.Vector3(0.1, 0.7, 0.2),
      sunColor: 16777215,
      waterColor: 7695,
      distortionScale: 3.7
    }),
    [L, R]
  ), F = X(() => {
    const Z = Math.max(O, z), J = Math.round(l ? Z * 2.5 : Z * 1.2);
    return Math.max(l ? 14 : 6, Math.min(l ? 56 : 32, J));
  }, [l, O, z]), U = X(
    () => new B.PlaneGeometry(O, z, F, F),
    [z, O, F]
  ), V = X(
    () => new B.MeshPhysicalMaterial({
      color: "#2f8dbd",
      roughness: 0.18,
      metalness: 0,
      transparent: !0,
      opacity: 0.72,
      clearcoat: 0.45,
      clearcoatRoughness: 0.24,
      normalMap: R,
      normalScale: new B.Vector2(0.22, 0.22),
      depthWrite: !1
    }),
    [R]
  ), Y = X(() => l ? new B.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uShallow: { value: new B.Color("#9ed6c8") },
      uDeep: { value: new B.Color("#1f5f88") },
      uFoam: { value: new B.Color("#ffffff") }
    },
    vertexShader: M2,
    fragmentShader: C2,
    transparent: !0,
    depthWrite: !1
  }) : null, [l, R]);
  return oe(() => () => {
    U.dispose();
    const Z = c.current;
    Z?.material?.dispose?.(), typeof Z?.dispose == "function" && Z.dispose(), V.dispose(), Y?.dispose();
  }, [V, U, Y]), oe(() => () => {
    b.dispose();
  }, [b]), $e((Z, J) => {
    const q = l ? d.current : c.current;
    if (!q) return;
    const A = c.current, N = f.current;
    if (e) {
      g.current += Math.max(0, J);
      const W = h.current ? 0.2 : 0.5;
      if (g.current >= W) {
        g.current = 0;
        const K = e.near ?? 30, Q = e.far ?? 180, ne = e.strength ?? 4, re = Z.camera.position.distanceTo(p.current), se = Ao(re, K, Q, ne) > 0;
        w.current = !l && re <= K, se !== h.current && (h.current = se, q.visible = se);
      }
      if (!h.current) {
        A && (A.visible = !1), N && (N.visible = !1);
        return;
      }
    }
    if (l) {
      N && (N.visible = !1);
      const W = u.current?.uniforms?.uTime;
      W && (W.value = Z.clock.elapsedTime);
    } else {
      const W = w.current;
      if (A && (A.visible = W), N && (N.visible = !W), !W || (_.current += Math.max(0, J), _.current < 1 / 30)) return;
      const K = c.current?.material.uniforms?.time;
      K && (K.value += _.current * 0.3), _.current = 0;
    }
  }), /* @__PURE__ */ x("group", { children: [
    S.north && /* @__PURE__ */ s(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [0, 0.055, -y / 2 + v / 2],
        material: b,
        receiveShadow: !0,
        children: /* @__PURE__ */ s("planeGeometry", { args: [I, v, 1, 1] })
      }
    ),
    S.south && /* @__PURE__ */ s(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [0, 0.055, y / 2 - v / 2],
        material: b,
        receiveShadow: !0,
        children: /* @__PURE__ */ s("planeGeometry", { args: [I, v, 1, 1] })
      }
    ),
    S.west && /* @__PURE__ */ s(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [-m / 2 + v / 2, 0.055, 0],
        material: b,
        receiveShadow: !0,
        children: /* @__PURE__ */ s("planeGeometry", { args: [v, $, 1, 1] })
      }
    ),
    S.east && /* @__PURE__ */ s(
      "mesh",
      {
        "rotation-x": -Math.PI / 2,
        position: [m / 2 - v / 2, 0.055, 0],
        material: b,
        receiveShadow: !0,
        children: /* @__PURE__ */ s("planeGeometry", { args: [v, $, 1, 1] })
      }
    ),
    l ? /* @__PURE__ */ s(
      "mesh",
      {
        ref: d,
        geometry: U,
        "rotation-x": -Math.PI / 2,
        position: [E, 0.1, G],
        children: /* @__PURE__ */ s(
          "primitive",
          {
            ref: u,
            object: Y,
            attach: "material"
          }
        )
      }
    ) : /* @__PURE__ */ x(be, { children: [
      /* @__PURE__ */ s(
        "water",
        {
          ref: c,
          args: [U, M],
          "rotation-x": -Math.PI / 2,
          position: [E, 0.1, G]
        }
      ),
      /* @__PURE__ */ s(
        "mesh",
        {
          ref: f,
          geometry: U,
          material: V,
          "rotation-x": -Math.PI / 2,
          position: [E, 0.095, G],
          visible: !1
        }
      )
    ] })
  ] });
}
const T2 = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="128" viewBox="0 0 32 128">',
  '<rect width="32" height="128" fill="black"/>',
  '<path d="M16 2 C8 36 6 82 15 126 C23 82 24 36 16 2 Z" fill="white"/>',
  "</svg>"
].join(""), E2 = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="128" viewBox="0 0 32 128">',
  '<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">',
  '<stop offset="0" stop-color="#2f5f2b"/>',
  '<stop offset="0.55" stop-color="#66a846"/>',
  '<stop offset="1" stop-color="#b8dc69"/>',
  "</linearGradient></defs>",
  '<rect width="32" height="128" fill="#4f8d39"/>',
  '<path d="M16 2 C8 36 6 82 15 126 C23 82 24 36 16 2 Z" fill="url(#g)"/>',
  "</svg>"
].join(""), Jf = `data:image/svg+xml,${encodeURIComponent(T2)}`, ep = `data:image/svg+xml,${encodeURIComponent(E2)}`;
function A2(e = {}) {
  return {
    bladeDiffuseUrl: e.bladeDiffuseUrl ?? ep,
    bladeAlphaUrl: e.bladeAlphaUrl ?? Jf
  };
}
var k2 = `precision highp float;\r
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
let tp = null;
function P2(e) {
  tp = e;
}
class B2 {
  nextId = 1;
  tiles = /* @__PURE__ */ new Map();
  // Reusable scratch buffers — never grow beyond the largest registered batch.
  positions = new Float32Array(0);
  weights = new Float32Array(0);
  trampleWorld = new B.Vector3(0, -9999, 0);
  trampleStrength = 0;
  lastSampleAt = 0;
  register(t) {
    this.tiles.size === 0 && (this.lastSampleAt = 0);
    const n = this.nextId++, i = { ...t, id: n };
    return this.tiles.set(n, i), this.ensureCapacity(this.tiles.size), i;
  }
  update(t, n) {
    const i = this.tiles.get(t);
    i && Object.assign(i, n);
  }
  unregister(t) {
    this.tiles.delete(t), this.tiles.size === 0 && (this.lastSampleAt = 0);
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
  tick(t) {
    if (this.tiles.size === 0) return;
    const n = performance.now();
    if (n - this.lastSampleAt < 12) return;
    this.lastSampleAt = n, this.refreshTrample(t.delta);
    const i = this.computeWindScale(), o = t.elapsedTime / 4;
    this.ensureCapacity(this.tiles.size);
    let r = 0;
    const a = [];
    for (const c of this.tiles.values()) {
      const u = r * 3;
      this.positions[u] = c.center.x, this.positions[u + 1] = c.center.y, this.positions[u + 2] = c.center.z, a.push(c.id), r += 1;
    }
    this.computeWeights(a.length, t.cameraPosition);
    let l = 0;
    for (const c of a) {
      const u = this.tiles.get(c);
      if (!u) {
        l += 1;
        continue;
      }
      let d = this.weights[l] ?? 0;
      l += 1;
      const f = Math.hypot(u.width, u.height) * 0.6, p = R2.set(u.center, f), h = t.frustum.intersectsSphere(p);
      if (u.lod) {
        const _ = u.center.distanceTo(t.cameraPosition);
        d = Vc(
          _,
          u.lod.near ?? 24,
          u.lod.far ?? 160,
          u.lod.strength ?? 4
        );
      }
      const w = Math.max(0, Math.floor(u.maxInstances * d)), g = h && w > 0;
      u.apply({
        visible: g,
        instanceCount: g ? w : 0,
        time: o,
        windScale: i,
        trampleCenter: this.trampleWorld,
        trampleStrength: this.trampleStrength
      });
    }
  }
  ensureCapacity(t) {
    this.positions.length < t * 3 && (this.positions = new Float32Array(t * 3)), this.weights.length < t && (this.weights = new Float32Array(t));
  }
  computeWeights(t, n) {
    const i = tp, o = 24, r = 160, a = 4;
    if (i)
      try {
        const l = i.alloc_f32(t * 3), c = i.alloc_f32(t);
        try {
          new Float32Array(i.memory.buffer, l, t * 3).set(this.positions.subarray(0, t * 3)), i.batch_sfe_weights(t, l, n.x, n.y, n.z, o, r, a, c), this.weights.set(new Float32Array(i.memory.buffer, c, t));
        } finally {
          i.dealloc_f32(l, t * 3), i.dealloc_f32(c, t);
        }
        return;
      } catch {
      }
    for (let l = 0; l < t; l += 1) {
      const c = l * 3, u = (this.positions[c] ?? 0) - n.x, d = (this.positions[c + 1] ?? 0) - n.y, f = (this.positions[c + 2] ?? 0) - n.z, p = Math.sqrt(u * u + d * d + f * f);
      this.weights[l] = Vc(p, o, r, a);
    }
  }
  refreshTrample(t) {
    const n = Np.getOrCreate("motion"), i = n?.getActiveEntities() ?? [], o = i[0] ? n?.snapshot(i[0]) : null, r = B.MathUtils.clamp(t * 6, 0, 1);
    o && (this.trampleWorld.x += (o.position.x - this.trampleWorld.x) * r, this.trampleWorld.y = o.position.y, this.trampleWorld.z += (o.position.z - this.trampleWorld.z) * r);
    const a = o?.isMoving && o?.isGrounded ? 0.85 : 0.35;
    this.trampleStrength += (a - this.trampleStrength) * r;
  }
  computeWindScale() {
    const t = As.getState().current, n = t?.intensity ?? 0;
    return (t?.kind === "storm" ? 2.6 : t?.kind === "rain" ? 1.7 : t?.kind === "snow" ? 1.3 : t?.kind === "cloudy" ? 1.15 : 0.85) + n * 0.9;
  }
}
const R2 = new B.Sphere();
function Vc(e, t, n, i) {
  if (e <= t) return 1;
  if (e >= n) return 0;
  const o = (e - t) / (n - t);
  return Math.pow(1 - o, Math.max(1, i));
}
let $a = null;
function Zc() {
  return $a || ($a = new B2()), $a;
}
var D2 = `precision highp float;\r
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
let Oa = null, Ha = null, Yc = null, Xc = null, Kc = null;
function z2() {
  return Kc ??= new B.TextureLoader(), Kc;
}
function np(e, t, n, i) {
  const o = new B.DataTexture(new Uint8Array([e, t, n, i]), 1, 1, B.RGBAFormat);
  return o.needsUpdate = !0, o;
}
function qc() {
  return Yc ??= np(102, 168, 70, 255), Yc;
}
function Qc() {
  return Xc ??= np(255, 255, 255, 255), Xc;
}
function F2(e, t) {
  return e.colorSpace = t, e.wrapS = B.ClampToEdgeWrapping, e.wrapT = B.ClampToEdgeWrapping, e.needsUpdate = !0, e;
}
function Jc(e, t, n, i) {
  const o = z2(), r = (a) => new Promise((l, c) => {
    o.load(
      a,
      (u) => l(F2(u, i)),
      void 0,
      c
    );
  });
  return r(e).catch(() => e === t ? n : r(t).catch(() => n));
}
function L2(e) {
  return e ? (Oa || (Oa = ui({
    color: "#ffffff",
    vertexColors: !0,
    steps: 3
  })), Oa) : (Ha || (Ha = new B.MeshStandardMaterial({
    color: "#ffffff",
    vertexColors: !0,
    roughness: 0.95,
    metalness: 0
  })), Ha);
}
const co = ks(), $2 = new B.Color("#5a7a35"), O2 = new B.Color("#7a8e3a"), H2 = new B.Color("#5b4628"), G2 = Es(
  {
    bladeHeight: 1,
    map: null,
    alphaMap: null,
    time: 0,
    windScale: 1,
    trampleCenter: new B.Vector3(0, -9999, 0),
    trampleRadius: 1.4,
    trampleStrength: 0.85,
    tipColor: new B.Color("#8fbc5a").convertSRGBToLinear(),
    bottomColor: new B.Color("#355b2d").convertSRGBToLinear(),
    uToon: 0,
    uToonSteps: 4
  },
  D2,
  k2
);
Gr({ GrassMaterial: G2 });
function pl(e, t) {
  return 0.05 * co(e / 50, t / 50) + 0.05 * co(e / 100, t / 100);
}
function W2(e) {
  const [t, n] = le(() => ({
    texture: qc(),
    alphaMap: Qc()
  }));
  return oe(() => {
    let i = !1;
    return Promise.all([
      Jc(
        e.bladeDiffuseUrl,
        ep,
        qc(),
        B.SRGBColorSpace
      ),
      Jc(
        e.bladeAlphaUrl,
        Jf,
        Qc(),
        B.NoColorSpace
      )
    ]).then(([o, r]) => {
      i || n({ texture: o, alphaMap: r });
    }), () => {
      i = !0;
    };
  }, [e.bladeAlphaUrl, e.bladeDiffuseUrl]), t;
}
function U2(e, t, n) {
  const i = t * 3, o = t * 4, r = e.alloc_f32(i), a = e.alloc_f32(o), l = e.alloc_f32(t), c = e.alloc_f32(t), u = e.alloc_f32(t);
  try {
    const d = Math.random() * 4294967295 >>> 0;
    e.fill_grass_data(t, n, d, r, a, l, c, u);
    const f = e.memory.buffer;
    return {
      offsets: new Float32Array(f, r, i).slice(),
      orientations: new Float32Array(f, a, o).slice(),
      stretches: new Float32Array(f, l, t).slice(),
      halfRootAngleSin: new Float32Array(f, c, t).slice(),
      halfRootAngleCos: new Float32Array(f, u, t).slice()
    };
  } finally {
    e.dealloc_f32(r, i), e.dealloc_f32(a, o), e.dealloc_f32(l, t), e.dealloc_f32(c, t), e.dealloc_f32(u, t);
  }
}
function j2(e, t) {
  const n = new Float32Array(e * 3), i = new Float32Array(e * 4), o = new Float32Array(e), r = new Float32Array(e), a = new Float32Array(e), l = new B.Quaternion(), c = new B.Quaternion(), u = new B.Vector3(1, 0, 0), d = new B.Vector3(0, 0, 1), f = Math.ceil(Math.sqrt(e)), p = t / f, h = p * 0.9;
  let w = 0, g = 0;
  for (let _ = 0; _ < e; _++) {
    const b = _ % f, S = _ / f | 0, m = (Math.random() - 0.5) * h, y = (Math.random() - 0.5) * h, v = (b + 0.5) * p - t / 2 + m, C = (S + 0.5) * p - t / 2 + y;
    n[w] = v, n[w + 1] = pl(v, C), n[w + 2] = C, w += 3;
    const T = Math.PI - Math.random() * (Math.PI / 6);
    r[_] = Math.sin(0.5 * T), a[_] = Math.cos(0.5 * T), l.setFromAxisAngle(d, T), c.setFromAxisAngle(u, Math.random() * Math.PI / 8), l.multiply(c), i[g] = l.x, i[g + 1] = l.y, i[g + 2] = l.z, i[g + 3] = l.w, g += 4, o[_] = 0.7 + Math.random() * 0.45;
  }
  return { offsets: n, orientations: i, stretches: o, halfRootAngleCos: a, halfRootAngleSin: r };
}
function V2(e, t, n) {
  const i = Math.ceil(Math.sqrt(t)), r = n / i * 0.9, a = e.offsets, l = e.stretches;
  for (let c = 0; c < t; c++) {
    const u = c * 3, d = (a[u] ?? 0) + (Math.random() - 0.5) * r, f = (a[u + 2] ?? 0) + (Math.random() - 0.5) * r;
    a[u] = d, a[u + 2] = f, a[u + 1] = pl(d, f), l[c] = 0.7 + Math.random() * 0.55;
  }
}
const ip = Be(
  ({
    options: e = { bW: 0.14, bH: 0.65, joints: 5 },
    width: t = 4,
    instances: n,
    density: i,
    maxInstances: o = 18e3,
    toon: r,
    lod: a,
    center: l,
    groundColor: c,
    groundAccentColor: u,
    bladeTipColor: d,
    bladeBottomColor: f,
    bladeDiffuseUrl: p,
    bladeAlphaUrl: h,
    ...w
  }) => {
    const { bW: g, bH: _, joints: b } = e, S = Hx((Z) => Z.profile.instanceScale), m = X(() => {
      const Z = Math.max(64, Math.min(o, Math.round(o * S)));
      if (typeof n == "number" && n > 0)
        return Math.max(1, Math.min(Z, Math.floor(n * S)));
      const J = typeof i == "number" && i > 0 ? i : 90, q = Math.max(1, t * t);
      return Math.max(64, Math.min(Z, Math.round(J * q * S)));
    }, [n, i, t, o, S]), y = r ?? We(), v = L2(y), C = X(() => new B.Color(c ?? $2), [c]), T = X(() => new B.Color(u ?? O2), [u]), P = X(
      () => new B.Color(d ?? "#8fbc5a").convertSRGBToLinear(),
      [d]
    ), D = X(
      () => new B.Color(f ?? "#355b2d").convertSRGBToLinear(),
      [f]
    ), O = ee(null), z = ee(null), E = ee(m), G = ee(null), I = ee(null), $ = X(
      () => A2({
        ...p ? { bladeDiffuseUrl: p } : {},
        ...h ? { bladeAlphaUrl: h } : {}
      }),
      [p, h]
    ), { texture: R, alphaMap: L } = W2($), [M, F] = le(null);
    oe(() => {
      mu().then((Z) => {
        Z && (F(Z), P2(Z));
      });
    }, []);
    const U = X(
      () => {
        const Z = M ? U2(M, m, t) : j2(m, t);
        return V2(Z, m, t), Z;
      },
      [m, t, M]
    ), [V, Y] = X(() => {
      const Z = new B.PlaneGeometry(g, _, 1, b).translate(0, _ / 2, 0), J = Math.max(8, Math.min(128, Math.round(t * 1.5))), q = new B.PlaneGeometry(t, t, J, J), A = q.getAttribute("position"), N = new Float32Array(A.count * 3), W = new B.Color();
      for (let K = 0; K < A.count; K++) {
        const Q = A.getX(K), ne = A.getZ(K);
        A.setY(K, pl(Q, ne));
        const re = 0.5 + 0.5 * co(Q * 0.18, ne * 0.18), ae = 0.5 + 0.5 * co(Q * 0.04 + 11.3, ne * 0.04 - 7.7), se = 0.5 + 0.5 * co(Q * 0.55 - 3.1, ne * 0.55 + 9.4), te = B.MathUtils.clamp(re * 0.65 + ae * 0.45, 0, 1);
        W.copy(C).multiplyScalar(0.58 + te * 0.42).lerp(T, ae * 0.28), se > 0.86 && W.lerp(H2, (se - 0.86) * 4);
        const he = K * 3;
        N[he] = W.r, N[he + 1] = W.g, N[he + 2] = W.b;
      }
      return q.setAttribute("color", new B.BufferAttribute(N, 3)), q.computeVertexNormals(), [Z, q];
    }, [T, g, _, C, b, t]);
    return oe(() => () => {
      V.dispose(), Y.dispose();
    }, [V, Y]), oe(() => {
      const Z = I.current;
      Z && (Z.instanceCount = m, E.current = m);
    }, [m, U]), oe(() => {
      const Z = G.current;
      Z?.uniforms && (Z.uniforms.uToon && (Z.uniforms.uToon.value = y ? 1 : 0), Z.uniforms.uToonSteps && (Z.uniforms.uToonSteps.value = 4), Z.uniforms.tipColor && Z.uniforms.tipColor.value.copy(P), Z.uniforms.bottomColor && Z.uniforms.bottomColor.value.copy(D));
    }, [D, P, y]), oe(() => {
      const Z = O.current, J = new B.Vector3();
      l ? J.set(l[0], l[1], l[2]) : Z && (Z.updateWorldMatrix(!0, !1), Z.getWorldPosition(J));
      const q = (N) => {
        const W = z.current, K = I.current, Q = G.current?.uniforms;
        !W || !K || !Q || (W.visible !== N.visible && (W.visible = N.visible), K.instanceCount !== N.instanceCount && (K.instanceCount = N.instanceCount, E.current = N.instanceCount), Q.time && (Q.time.value = N.time), Q.windScale && (Q.windScale.value = N.windScale), Q.trampleCenter && Q.trampleCenter.value.copy(N.trampleCenter), Q.trampleStrength && (Q.trampleStrength.value = N.trampleStrength));
      }, A = Zc().register({
        width: t,
        height: _ * 1.4,
        center: J,
        maxInstances: m,
        ...a ? { lod: a } : {},
        apply: q
      });
      return () => {
        Zc().unregister(A.id);
      };
    }, [t, _, m, l?.[0], l?.[1], l?.[2], a?.near, a?.far, a?.strength]), oe(() => {
      const Z = I.current;
      if (!Z) return;
      const J = Math.hypot(t, _ * 1.4) * 0.6;
      Z.boundingSphere = new B.Sphere(new B.Vector3(0, _ * 0.5, 0), J), Z.boundingBox = new B.Box3(
        new B.Vector3(-t * 0.5, 0, -t * 0.5),
        new B.Vector3(t * 0.5, _ * 1.6, t * 0.5)
      );
    }, [t, _]), /* @__PURE__ */ x("group", { ref: O, ...w, children: [
      /* @__PURE__ */ x("mesh", { ref: z, frustumCulled: !0, children: [
        /* @__PURE__ */ x(
          "instancedBufferGeometry",
          {
            ref: I,
            index: V.index,
            "attributes-position": V.getAttribute("position"),
            "attributes-uv": V.getAttribute("uv"),
            children: [
              /* @__PURE__ */ s("instancedBufferAttribute", { attach: "attributes-offset", args: [U.offsets, 3] }),
              /* @__PURE__ */ s("instancedBufferAttribute", { attach: "attributes-orientation", args: [U.orientations, 4] }),
              /* @__PURE__ */ s("instancedBufferAttribute", { attach: "attributes-stretch", args: [U.stretches, 1] }),
              /* @__PURE__ */ s("instancedBufferAttribute", { attach: "attributes-halfRootAngleSin", args: [U.halfRootAngleSin, 1] }),
              /* @__PURE__ */ s("instancedBufferAttribute", { attach: "attributes-halfRootAngleCos", args: [U.halfRootAngleCos, 1] })
            ]
          }
        ),
        /* @__PURE__ */ s(
          "grassMaterial",
          {
            ref: G,
            map: R ?? null,
            alphaMap: L ?? null,
            toneMapped: !1,
            side: B.DoubleSide,
            transparent: !0
          }
        )
      ] }),
      /* @__PURE__ */ s(
        "mesh",
        {
          position: [0, 0, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: v,
          receiveShadow: !0,
          children: /* @__PURE__ */ s("primitive", { object: Y, attach: "geometry" })
        }
      )
    ] });
  }
);
ip.displayName = "Grass";
const eu = 25, tu = 90, nu = 4, op = {
  north: !0,
  south: !0,
  east: !0,
  west: !0
};
function Z2(e, t, n) {
  const o = fe.GRID_CELL_SIZE * (e.size || 1) / 2;
  return t > e.position.x - o + 1e-3 && t < e.position.x + o - 1e-3 && n > e.position.z - o + 1e-3 && n < e.position.z + o - 1e-3;
}
function Y2(e, t) {
  const n = fe.GRID_CELL_SIZE * (e.size || 1), i = n / 2, o = Math.max(0.08, n * 0.06), r = Math.max(0.12, fe.HEIGHT_STEP * 0.25), a = t ?? [];
  if (a.length === 0) return op;
  const l = (c, u) => {
    for (const d of a)
      if (d.id !== e.id && !(Math.abs(d.position.y - e.position.y) > r) && Z2(d, c, u))
        return !0;
    return !1;
  };
  return {
    north: !l(e.position.x, e.position.z - i - o),
    south: !l(e.position.x, e.position.z + i + o),
    west: !l(e.position.x - i - o, e.position.z),
    east: !l(e.position.x + i + o, e.position.z)
  };
}
const X2 = /* @__PURE__ */ new Set(["sand", "snowfield"]);
function K2({ tile: e, tiles: t }) {
  if (!e.objectType || e.objectType === "none" || X2.has(e.objectType)) return null;
  const n = ee(null), i = ee(!0), o = ee(0), r = fe.GRID_CELL_SIZE * (e.size || 1), a = [e.position.x, e.position.y, e.position.z], l = X(
    () => e.objectType === "water" ? Y2(e, t) : op,
    [e, t]
  );
  return $e((c, u) => {
    o.current += u;
    const d = i.current ? 0.3 : 0.8;
    if (o.current < d) return;
    o.current = 0;
    const f = c.camera.position, p = e.position, h = f.x - p.x, w = f.y - p.y, g = f.z - p.z, _ = Math.sqrt(h * h + w * w + g * g), S = Ao(_, eu, tu, nu) > 0;
    S !== i.current && (i.current = S, n.current && (n.current.visible = S));
  }), /* @__PURE__ */ s("group", { ref: n, position: a, children: /* @__PURE__ */ x(In, { fallback: null, children: [
    e.objectType === "water" && /* @__PURE__ */ s(
      Qf,
      {
        size: r,
        shore: l,
        center: a,
        lod: { near: eu, far: tu, strength: nu }
      }
    ),
    e.objectType === "grass" && /* @__PURE__ */ s(
      ip,
      {
        width: r,
        density: e.objectConfig?.grassDensity ?? 90,
        ...e.objectConfig?.terrainColor ? { groundColor: e.objectConfig.terrainColor } : {},
        ...e.objectConfig?.terrainAccentColor ? { groundAccentColor: e.objectConfig.terrainAccentColor } : {},
        ...e.objectConfig?.terrainColor ? { bladeBottomColor: e.objectConfig.terrainColor } : {},
        ...e.objectConfig?.terrainAccentColor ? { bladeTipColor: e.objectConfig.terrainAccentColor } : {},
        position: [0, 0.05, 0]
      }
    )
  ] }) });
}
const q2 = {
  grass: 0.05,
  sand: 0.065,
  snowfield: 0.055,
  water: 0.055
}, Q2 = { near: 25, far: 90, strength: 4 };
function J2(e) {
  return e - Math.floor(e);
}
function si(...e) {
  const t = e.reduce((n, i, o) => n + i * (o * 19.19 + 7.13), 0);
  return J2(Math.sin(t) * 43758.5453123);
}
function Qt(e) {
  return e.shape ?? "box";
}
function cr(e, t) {
  return e.materialId ?? t;
}
function bs(e, t, n) {
  const i = Math.cos(n), o = Math.sin(n);
  return [e * i + t * o, t * i - e * o];
}
function hl(e) {
  const t = (e.size || 1) * fe.GRID_CELL_SIZE, n = Math.max(4, Math.min(8, (e.size || 1) * 4)), i = Math.max(e.position.y, fe.HEIGHT_STEP), o = i / n, r = t / n, a = Math.max(n * 4, Math.ceil(i / 0.08)), l = e.rotation ?? 0;
  return { tileSize: t, stepCount: n, totalHeight: i, stepHeight: o, stepDepth: r, colliderSlices: a, rotation: l };
}
function iu(e) {
  const t = (e.size || 1) * fe.GRID_CELL_SIZE, n = Math.max(12, Math.min(24, Math.ceil(t / 0.25))), i = Math.max(e.position.y, fe.HEIGHT_STEP), o = i / n, r = t / n, a = e.rotation ?? 0;
  return { tileSize: t, rampSlices: n, totalHeight: i, sliceHeight: o, sliceDepth: r, rotation: a };
}
function ys(e) {
  const n = (e.size || 1) * fe.GRID_CELL_SIZE / 2, i = e.objectType ? q2[e.objectType] ?? 0 : 0;
  return {
    id: e.id,
    topY: e.position.y + i,
    minX: e.position.x - n,
    maxX: e.position.x + n,
    minZ: e.position.z - n,
    maxZ: e.position.z + n,
    centerX: e.position.x,
    centerZ: e.position.z,
    segments: e.size || 1
  };
}
function rp(e, t, n, i) {
  let o = 0;
  for (const r of e)
    r.id !== t && n > r.minX + 1e-3 && n < r.maxX - 1e-3 && i > r.minZ + 1e-3 && i < r.maxZ - 1e-3 && (o = Math.max(o, r.topY));
  return o;
}
function eS(e, t, n, i, o, r, a, l) {
  const c = (u, d) => {
    e.push(u[0], u[1], u[2]), t.push(d.r, d.g, d.b);
  };
  c(n, a), c(i, a), c(o, l), c(n, a), c(o, l), c(r, l);
}
function Qi(e, t, n, i, o) {
  e.push(
    t[0],
    t[1],
    t[2],
    n[0],
    n[1],
    n[2],
    i[0],
    i[1],
    i[2],
    t[0],
    t[1],
    t[2],
    i[0],
    i[1],
    i[2],
    o[0],
    o[1],
    o[2]
  );
}
function tS(e, t, n) {
  const i = [], o = [], r = [], a = t.map(ys), l = e.map(ys), c = new B.Color("#7b6a58"), u = new B.Color("#433930"), d = fe.GRID_CELL_SIZE, f = (h, w, g, _, b, S, m, y, v, C) => {
    const T = rp(a, h.id, S, m);
    if (h.topY <= T + 0.02) return;
    const P = h.topY - T, D = 0.72 + si(C, h.centerX, h.centerZ) * 0.16, O = 0.42 + si(C, h.topY) * 0.08, z = n.clone().lerp(c, 0.28 + Math.min(P, 2) * 0.08).multiplyScalar(D), E = n.clone().lerp(u, 0.7).multiplyScalar(O);
    if (eS(
      i,
      o,
      [w, h.topY, g],
      [_, h.topY, b],
      [_, T, b],
      [w, T, g],
      z,
      E
    ), P < fe.HEIGHT_STEP * 0.95) return;
    const G = si(C, T, P);
    if (G < 0.58) return;
    const I = (w + _) * 0.5, $ = (g + b) * 0.5, R = 0.12 + Math.min(P, 2.5) * 0.06, L = 0.08 + G * 0.08;
    r.push({
      position: [
        I + y * (0.18 + G * 0.24),
        T + R * 0.65,
        $ + v * (0.18 + G * 0.24)
      ],
      rotation: [
        G * Math.PI * 1.7,
        G * Math.PI * 2.9,
        G * Math.PI * 0.9
      ],
      scale: [
        R + L * 0.6,
        R * 0.9 + L * 0.45,
        R + L
      ]
    });
  };
  for (const h of l) {
    if (h.topY <= 0.02) continue;
    const g = -(h.segments * d) / 2;
    for (let _ = 0; _ < h.segments; _++) {
      const b = g + _ * d, S = b + d, m = b + d * 0.5;
      f(
        h,
        h.maxX,
        h.centerZ + b,
        h.maxX,
        h.centerZ + S,
        h.maxX + 0.02,
        h.centerZ + m,
        1,
        0,
        si(h.centerX, h.centerZ, _, 1)
      ), f(
        h,
        h.minX,
        h.centerZ + S,
        h.minX,
        h.centerZ + b,
        h.minX - 0.02,
        h.centerZ + m,
        -1,
        0,
        si(h.centerX, h.centerZ, _, 2)
      ), f(
        h,
        h.centerX + S,
        h.minZ,
        h.centerX + b,
        h.minZ,
        h.centerX + m,
        h.minZ - 0.02,
        0,
        -1,
        si(h.centerX, h.centerZ, _, 3)
      ), f(
        h,
        h.centerX + b,
        h.maxZ,
        h.centerX + S,
        h.maxZ,
        h.centerX + m,
        h.maxZ + 0.02,
        0,
        1,
        si(h.centerX, h.centerZ, _, 4)
      );
    }
  }
  const p = new B.BufferGeometry();
  return i.length > 0 && (p.setAttribute("position", new B.Float32BufferAttribute(i, 3)), p.setAttribute("color", new B.Float32BufferAttribute(o, 3)), p.computeVertexNormals(), p.computeBoundingBox(), p.computeBoundingSphere()), { sideGeometry: p, rocks: r };
}
function nS(e, t) {
  const n = t.map(ys), { tileSize: i, totalHeight: o, rotation: r } = hl(e), [a, l] = bs(0, i / 2 + 0.04, r);
  return rp(n, e.id, e.position.x + a, e.position.z + l) + 0.02 < o;
}
function iS(e, t) {
  const n = new B.BufferGeometry(), i = [], { tileSize: o, stepCount: r, stepHeight: a, stepDepth: l, totalHeight: c } = hl(e), u = o / 2;
  for (let d = 0; d < r; d++) {
    const f = -u + d * l, p = f + l, h = a * (d + 1), w = a * d;
    Qi(
      i,
      [-u, h, f],
      [-u, h, p],
      [u, h, p],
      [u, h, f]
    ), Qi(
      i,
      [-u, w, f],
      [-u, h, f],
      [u, h, f],
      [u, w, f]
    ), Qi(
      i,
      [-u, 0, f],
      [-u, 0, p],
      [-u, h, p],
      [-u, h, f]
    ), Qi(
      i,
      [u, 0, p],
      [u, 0, f],
      [u, h, f],
      [u, h, p]
    );
  }
  return t && Qi(
    i,
    [-u, 0, u],
    [u, 0, u],
    [u, c, u],
    [-u, c, u]
  ), n.setAttribute("position", new B.Float32BufferAttribute(i, 3)), n.computeVertexNormals(), n.computeBoundingBox(), n.computeBoundingSphere(), n;
}
function oS({
  tile: e,
  material: t,
  supportTiles: n
}) {
  const i = e.rotation ?? 0, o = X(() => nS(e, n), [n, e]), r = X(() => iS(e, o), [e, o]);
  return oe(() => () => {
    r.dispose();
  }, [r]), /* @__PURE__ */ s(
    "mesh",
    {
      position: [e.position.x, 0, e.position.z],
      rotation: [0, i, 0],
      geometry: r,
      material: t,
      castShadow: !0,
      receiveShadow: !0
    }
  );
}
function rS({
  batch: e,
  geometry: t,
  dummy: n
}) {
  const i = ee(null);
  return Ke(() => {
    const o = i.current;
    if (!o) return;
    const r = fe.GRID_CELL_SIZE;
    o.count = e.tiles.length;
    for (let a = 0; a < e.tiles.length; a++) {
      const l = e.tiles[a];
      if (!l) continue;
      const c = l.size || 1, u = r * c;
      n.position.set(l.position.x, l.position.y + 1e-3, l.position.z), n.rotation.set(0, l.rotation ?? 0, 0), n.scale.set(u, 1, u), n.updateMatrix(), o.setMatrixAt(a, n.matrix);
    }
    o.instanceMatrix.needsUpdate = !0, e.tiles.length > 0 && (o.computeBoundingBox(), o.computeBoundingSphere());
  }, [e.tiles, n]), /* @__PURE__ */ s(
    "instancedMesh",
    {
      ref: i,
      args: [t, e.material, Math.max(1, e.tiles.length)],
      castShadow: !0,
      receiveShadow: !0,
      frustumCulled: !0
    }
  );
}
function aS(e) {
  if (e.length === 0) return [];
  const t = fe.GRID_CELL_SIZE / 2, n = /* @__PURE__ */ new Map();
  for (const o of e) {
    const l = Math.max(1, Math.round(o.size || 1)) * fe.GRID_CELL_SIZE / 2, c = Math.round((o.position.x - l) / t), u = Math.round((o.position.x + l) / t), d = Math.round((o.position.z - l) / t), f = Math.round((o.position.z + l) / t), p = Math.round(o.position.y * 1e3);
    let h = n.get(p);
    h || (h = /* @__PURE__ */ new Set(), n.set(p, h));
    for (let w = d; w < f; w += 1)
      for (let g = c; g < u; g += 1)
        h.add(`${g}:${w}`);
  }
  const i = [];
  for (const [o, r] of n) {
    const a = new Set(r);
    for (; a.size > 0; ) {
      let l = 0, c = 0, u = !1;
      for (const S of a) {
        const [m, y] = S.split(":").map(Number);
        (!u || y < c || y === c && m < l) && (l = m, c = y, u = !0);
      }
      let d = 1;
      for (; a.has(`${l + d}:${c}`); )
        d += 1;
      let f = 1, p = !0;
      for (; p; ) {
        const S = c + f;
        for (let m = 0; m < d; m += 1)
          if (!a.has(`${l + m}:${S}`)) {
            p = !1;
            break;
          }
        p && (f += 1);
      }
      for (let S = 0; S < f; S += 1)
        for (let m = 0; m < d; m += 1)
          a.delete(`${l + m}:${c + S}`);
      const h = d * t, w = f * t, g = (l + d / 2) * t, _ = (c + f / 2) * t, b = o / 1e3;
      i.push({
        key: `${o}:${l}:${c}:${d}:${f}`,
        center: [g, b, _],
        width: h,
        depth: w
      });
    }
  }
  return i;
}
function sS({
  tileGroup: e,
  meshes: t,
  isEditMode: n = !1,
  selectedTileId: i = null,
  onTileClick: o
}) {
  const r = ee(new Fn()), a = ee(null), l = X(
    () => e.tiles.filter((M) => Qt(M) === "box"),
    [e.tiles]
  ), c = X(
    () => e.tiles.filter((M) => Qt(M) === "stairs"),
    [e.tiles]
  ), u = X(
    () => e.tiles.filter((M) => Qt(M) === "ramp"),
    [e.tiles]
  ), d = X(
    () => e.tiles.filter((M) => Qt(M) === "round"),
    [e.tiles]
  ), f = X(() => {
    const M = r.current, F = t.get(e.floorMeshId);
    if (!F) {
      a.current?.dispose();
      const U = We() ? new B.MeshToonMaterial({ color: "#888888", gradientMap: En(4) }) : new B.MeshStandardMaterial({ color: "#888888" });
      return a.current = U, U;
    }
    return a.current?.dispose(), a.current = null, M.getMaterial(F);
  }, [e.floorMeshId, t]), p = X(() => {
    const M = r.current, F = /* @__PURE__ */ new Map();
    F.set(e.floorMeshId, f);
    for (const U of e.tiles) {
      if (!U.materialId || F.has(U.materialId)) continue;
      const V = t.get(U.materialId);
      F.set(U.materialId, V ? M.getMaterial(V) : f);
    }
    return F;
  }, [f, t, e.floorMeshId, e.tiles]), h = X(() => {
    const M = /* @__PURE__ */ new Map();
    for (const F of l) {
      const U = cr(F, e.floorMeshId), V = M.get(U) ?? [];
      V.push(F), M.set(U, V);
    }
    return Array.from(M.entries()).map(([F, U]) => ({
      materialId: F,
      tiles: U,
      material: p.get(F) ?? f
    }));
  }, [l, f, p, e.floorMeshId]), w = X(() => {
    const M = t.get(e.floorMeshId);
    return new B.Color(M?.color || "#8a806f");
  }, [e.floorMeshId, t]), g = X(
    () => tS(l, e.tiles, w),
    [l, e.tiles, w]
  ), _ = X(
    () => We() ? new B.MeshToonMaterial({
      vertexColors: !0,
      side: B.DoubleSide,
      gradientMap: En(4)
    }) : new B.MeshStandardMaterial({
      vertexColors: !0,
      roughness: 0.98,
      metalness: 0.02,
      side: B.DoubleSide
    }),
    []
  ), b = X(() => new B.DodecahedronGeometry(1, 0), []), S = X(() => {
    const M = new B.BufferGeometry(), F = new Float32Array([
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
    ]), U = [
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
    return M.setAttribute("position", new B.BufferAttribute(F, 3)), M.setIndex(U), M.computeVertexNormals(), M;
  }, []), m = X(
    () => We() ? new B.MeshToonMaterial({
      color: "#71695f",
      gradientMap: En(3)
    }) : new B.MeshStandardMaterial({
      color: "#71695f",
      roughness: 1,
      metalness: 0.02
    }),
    []
  ), y = X(() => {
    const M = new B.PlaneGeometry(1, 1, 1, 1);
    return M.rotateX(-Math.PI / 2), M;
  }, []), v = X(() => new B.Object3D(), []), C = ee(null), T = X(() => new B.BoxGeometry(1, 1, 1), []), P = X(
    () => We() ? new B.MeshToonMaterial({
      color: "#60a5fa",
      transparent: !0,
      opacity: 0.14,
      emissive: new B.Color("#2563eb"),
      emissiveIntensity: 0.08,
      gradientMap: En(3),
      wireframe: !0,
      depthWrite: !1
    }) : new B.MeshStandardMaterial({
      color: "#60a5fa",
      transparent: !0,
      opacity: 0.14,
      emissive: new B.Color("#2563eb"),
      emissiveIntensity: 0.08,
      wireframe: !0,
      depthWrite: !1
    }),
    []
  ), D = X(
    () => We() ? new B.MeshToonMaterial({
      color: "#bae6fd",
      transparent: !0,
      opacity: 0.28,
      emissive: new B.Color("#60a5fa"),
      emissiveIntensity: 0.18,
      gradientMap: En(3),
      wireframe: !0,
      depthWrite: !1
    }) : new B.MeshStandardMaterial({
      color: "#bae6fd",
      transparent: !0,
      opacity: 0.28,
      emissive: new B.Color("#60a5fa"),
      emissiveIntensity: 0.18,
      wireframe: !0,
      depthWrite: !1
    }),
    []
  ), O = X(
    () => e.tiles.filter((M) => Qt(M) === "box" && M.objectType === "sand"),
    [e.tiles]
  ), z = X(
    () => O.map((M) => ({
      position: [M.position.x, M.position.y, M.position.z],
      size: fe.GRID_CELL_SIZE * (M.size || 1),
      ...M.objectConfig?.terrainColor ? { color: M.objectConfig.terrainColor } : {},
      ...M.objectConfig?.terrainAccentColor ? { accentColor: M.objectConfig.terrainAccentColor } : {}
    })),
    [O]
  ), E = X(
    () => e.tiles.filter((M) => Qt(M) === "box" && M.objectType === "snowfield"),
    [e.tiles]
  ), G = X(
    () => E.map((M) => ({
      position: [M.position.x, M.position.y, M.position.z],
      size: fe.GRID_CELL_SIZE * (M.size || 1),
      ...M.objectConfig?.terrainColor ? { color: M.objectConfig.terrainColor } : {},
      ...M.objectConfig?.terrainAccentColor ? { accentColor: M.objectConfig.terrainAccentColor } : {}
    })),
    [E]
  ), I = X(
    () => e.tiles.filter(
      (M) => M.objectType && M.objectType !== "none" && Qt(M) === "box" && M.objectType !== "water" && M.objectType !== "sand" && M.objectType !== "snowfield"
    ),
    [e.tiles]
  ), $ = X(
    () => e.tiles.filter((M) => Qt(M) === "box" && M.objectType === "water"),
    [e.tiles]
  ), R = X(
    () => aS($),
    [$]
  ), L = X(
    () => {
      const M = [];
      for (const F of e.tiles) {
        const U = Qt(F), V = (F.size || 1) * fe.GRID_CELL_SIZE, Y = F.rotation ?? 0;
        if (U === "stairs") {
          const { tileSize: A, totalHeight: N, colliderSlices: W, rotation: K } = hl(F), Q = N / W, ne = A / W;
          for (let re = 0; re < W; re++) {
            const ae = Q * (re + 1), se = -A / 2 + ne * re + ne / 2, [te, he] = bs(0, se, K);
            M.push({
              key: `${F.id}-stair-collider-${re}`,
              position: [
                F.position.x + te,
                ae / 2,
                F.position.z + he
              ],
              rotation: [0, K, 0],
              args: [A / 2, ae / 2, ne / 2]
            });
          }
          continue;
        }
        if (U === "ramp") {
          const { tileSize: A, rampSlices: N, sliceHeight: W, sliceDepth: K, rotation: Q } = iu(F);
          for (let ne = 0; ne < N; ne++) {
            const re = W * (ne + 1), ae = -A / 2 + K * ne + K / 2, [se, te] = bs(0, ae, Q);
            M.push({
              key: `${F.id}-ramp-${ne}`,
              position: [
                F.position.x + se,
                re / 2,
                F.position.z + te
              ],
              rotation: [0, Q, 0],
              args: [A / 2, re / 2, K / 2]
            });
          }
          continue;
        }
        if (U === "round") {
          const A = F.position.y > 0.02, N = A ? F.position.y : 0.04, W = A ? N / 2 : -0.02, K = V / 2, Q = K * 0.34;
          M.push({
            key: `${F.id}-core`,
            position: [F.position.x, W, F.position.z],
            rotation: [0, 0, 0],
            args: [K * 0.46, N / 2, K * 0.46]
          });
          for (let ne = 0; ne < 4; ne++)
            M.push({
              key: `${F.id}-ring-${ne}`,
              position: [F.position.x, W, F.position.z],
              rotation: [0, Math.PI / 4 * ne, 0],
              args: [K * 0.82, N / 2, Q]
            });
          continue;
        }
        const Z = F.position.y > 0.02, J = Z ? F.position.y * 0.5 : 0.02, q = Z ? F.position.y * 0.5 : -0.02;
        M.push({
          key: F.id,
          position: [F.position.x, q, F.position.z],
          rotation: [0, Y, 0],
          args: [V / 2, J, V / 2]
        });
      }
      return M;
    },
    [e.tiles]
  );
  return Ke(() => {
    const M = C.current;
    if (M && g.rocks.length > 0) {
      M.count = g.rocks.length;
      for (let F = 0; F < g.rocks.length; F++) {
        const U = g.rocks[F];
        v.position.set(U.position[0], U.position[1], U.position[2]), v.rotation.set(U.rotation[0], U.rotation[1], U.rotation[2]), v.scale.set(U.scale[0], U.scale[1], U.scale[2]), v.updateMatrix(), M.setMatrixAt(F, v.matrix);
      }
      M.instanceMatrix.needsUpdate = !0;
    }
  }, [g.rocks, v]), oe(() => {
    if (e.tiles.length === 0) return;
    const M = rh.getInstance(), F = new B.Box3(), U = new B.Vector3();
    e.tiles.forEach((Z) => {
      const q = (Z.size || 1) * fe.GRID_CELL_SIZE / 2;
      U.set(Z.position.x - q, Z.position.y, Z.position.z - q), F.expandByPoint(U), U.set(Z.position.x + q, Z.position.y, Z.position.z + q), F.expandByPoint(U);
    });
    const V = new B.Vector3(), Y = new B.Vector3();
    return F.getCenter(V), F.getSize(Y), M.addMarker(
      `tile-group-${e.id}`,
      "ground",
      e.name || "Tiles",
      V,
      Y
    ), () => {
      M.removeMarker(`tile-group-${e.id}`);
    };
  }, [e]), oe(() => () => {
    r.current.dispose(), a.current?.dispose(), a.current = null, y.dispose(), T.dispose(), P.dispose(), D.dispose();
  }, [y, T, P, D]), oe(() => () => {
    g.sideGeometry.dispose();
  }, [g.sideGeometry]), oe(() => () => {
    _.dispose(), b.dispose(), S.dispose(), m.dispose();
  }, [S, b, m, _]), /* @__PURE__ */ s(ah, { type: "ground", children: /* @__PURE__ */ x(be, { children: [
    L.length > 0 && /* @__PURE__ */ s(Wr, { type: "fixed", colliders: !1, children: L.map((M) => /* @__PURE__ */ s(
      Cs,
      {
        position: M.position,
        rotation: M.rotation,
        args: M.args
      },
      `${e.id}-collider-${M.key}`
    )) }),
    n && e.tiles.map((M) => {
      const F = M.id === i, U = (M.size || 1) * fe.GRID_CELL_SIZE, V = Math.max(0.22, M.position.y + 0.22);
      return /* @__PURE__ */ s(
        "group",
        {
          position: [M.position.x, V / 2, M.position.z],
          scale: [U * 0.82, V, U * 0.82],
          onClick: () => o?.(M.id),
          children: /* @__PURE__ */ s("mesh", { geometry: T, material: F ? D : P })
        },
        M.id
      );
    }),
    h.map((M) => /* @__PURE__ */ s(
      rS,
      {
        batch: M,
        geometry: y,
        dummy: v
      },
      `${e.id}-box-${M.materialId}`
    )),
    d.map((M) => {
      const F = (M.size || 1) * fe.GRID_CELL_SIZE, U = M.position.y > 0.02, V = U ? M.position.y : 0.04, Y = U ? V / 2 : -0.02, Z = cr(M, e.floorMeshId);
      return /* @__PURE__ */ s(
        "mesh",
        {
          position: [M.position.x, Y, M.position.z],
          material: p.get(Z) ?? f,
          castShadow: !0,
          receiveShadow: !0,
          children: /* @__PURE__ */ s("cylinderGeometry", { args: [F / 2, F / 2, V, 28, 1, !1] })
        },
        `${M.id}-round`
      );
    }),
    c.map((M) => /* @__PURE__ */ s(
      oS,
      {
        tile: M,
        material: p.get(cr(M, e.floorMeshId)) ?? f,
        supportTiles: e.tiles
      },
      `${M.id}-stairs`
    )),
    u.map((M) => {
      const { tileSize: F, totalHeight: U, rotation: V } = iu(M), Y = cr(M, e.floorMeshId);
      return /* @__PURE__ */ s(
        "mesh",
        {
          position: [M.position.x, 0, M.position.z],
          rotation: [0, V, 0],
          scale: [F, U, F],
          geometry: S,
          material: p.get(Y) ?? f,
          castShadow: !0,
          receiveShadow: !0
        },
        `${M.id}-ramp`
      );
    }),
    g.sideGeometry.getAttribute("position") && /* @__PURE__ */ s(
      "mesh",
      {
        geometry: g.sideGeometry,
        material: _,
        castShadow: !0,
        receiveShadow: !0,
        frustumCulled: !1
      }
    ),
    g.rocks.length > 0 && /* @__PURE__ */ s(
      "instancedMesh",
      {
        ref: C,
        args: [b, m, Math.max(1, g.rocks.length)],
        castShadow: !0,
        receiveShadow: !0
      }
    ),
    R.map((M) => /* @__PURE__ */ s("group", { position: M.center, children: /* @__PURE__ */ s(
      Qf,
      {
        width: M.width,
        depth: M.depth,
        center: M.center,
        shore: { north: !1, south: !1, east: !1, west: !1 },
        lod: Q2
      }
    ) }, `water-${M.key}`)),
    I.map((M) => /* @__PURE__ */ s(K2, { tile: M, tiles: $ }, `${M.id}-object`)),
    z.length > 0 && /* @__PURE__ */ s(x2, { entries: z }),
    G.length > 0 && /* @__PURE__ */ s(S2, { entries: G })
  ] }) });
}
const Pt = { id: "default", color: "#000000" }, lS = {
  id: "default-window-glass",
  color: "#9ed8ff",
  material: "GLASS",
  opacity: 0.42,
  transparent: !0,
  roughness: 0.08
}, cS = { id: "default-door-panel", color: "#7a5232", roughness: 0.78 };
function uS(e) {
  return e.materialId ? `material:${e.materialId}` : `type:${e.wallGroupId}`;
}
function ap(e, t) {
  return e.wallKind ?? t.defaultWallKind ?? "solid";
}
function sp(e, t) {
  return ap(e, t) === "solid";
}
function vs(e, t, n, i, o) {
  if (n.materialId) {
    const f = e.getMaterial(t.get(n.materialId) ?? Pt);
    return [f, f, f, f, f, f];
  }
  const r = i.get(n.wallGroupId) ?? o, a = r.frontMeshId ? t.get(r.frontMeshId) : Pt, l = r.backMeshId ? t.get(r.backMeshId) : Pt, c = r.sideMeshId ? t.get(r.sideMeshId) : Pt, u = n.flipSides ? l : a, d = n.flipSides ? a : l;
  return [
    e.getMaterial(c ?? Pt),
    e.getMaterial(c ?? Pt),
    e.getMaterial(c ?? Pt),
    e.getMaterial(c ?? Pt),
    e.getMaterial(u ?? Pt),
    e.getMaterial(d ?? Pt)
  ];
}
function dS(e, t, n, i) {
  const o = /* @__PURE__ */ new Map();
  for (const r of e.walls) {
    if (!sp(r, e)) continue;
    const a = uS(r), l = o.get(a) ?? [];
    l.push(r), o.set(a, l);
  }
  return Array.from(o.entries()).map(([r, a]) => {
    const l = a[0];
    return {
      key: r,
      walls: a,
      materials: l ? vs(i, n, l, t, e) : vs(i, n, { wallGroupId: e.id }, t, e)
    };
  });
}
function fS(e) {
  return e.getMaterial(lS);
}
function pS(e, t, n) {
  const i = n.frontMeshId ? t.get(n.frontMeshId) : void 0;
  return e.getMaterial({
    ...cS,
    color: i?.color ? new B.Color(i.color).multiplyScalar(0.72).getStyle() : "#7a5232"
  });
}
function De({
  position: e,
  size: t,
  materials: n
}) {
  return /* @__PURE__ */ s("mesh", { position: e, material: n, castShadow: !0, receiveShadow: !0, children: /* @__PURE__ */ s("boxGeometry", { args: t }) });
}
function hS({
  wall: e,
  wallGroup: t,
  wallGroups: n,
  meshes: i,
  manager: o,
  width: r,
  height: a,
  depth: l,
  onWallClick: c
}) {
  const u = ap(e, t), d = vs(o, i, e, n, t), f = fS(o), p = pS(o, i, t), h = r / 2, w = a * 0.46, g = (b) => {
    b.stopPropagation(), c?.(e.id);
  }, _ = (() => {
    if (u === "half")
      return [
        /* @__PURE__ */ s(De, { position: [0, w / 2, h], size: [r, w, l], materials: d }, "half")
      ];
    if (u === "railing") {
      const b = a * 0.62;
      return [
        /* @__PURE__ */ s(De, { position: [-r * 0.42, b / 2, h], size: [0.18, b, l], materials: d }, "post-l"),
        /* @__PURE__ */ s(De, { position: [0, b / 2, h], size: [0.16, b * 0.9, l], materials: d }, "post-c"),
        /* @__PURE__ */ s(De, { position: [r * 0.42, b / 2, h], size: [0.18, b, l], materials: d }, "post-r"),
        /* @__PURE__ */ s(De, { position: [0, b * 0.82, h], size: [r, 0.18, l], materials: d }, "rail-top"),
        /* @__PURE__ */ s(De, { position: [0, b * 0.48, h], size: [r * 0.88, 0.12, l], materials: d }, "rail-mid")
      ];
    }
    if (u === "door" || u === "arch") {
      const b = r * 0.24, S = r - b * 2, m = u === "arch" ? a * 0.34 : a * 0.22, y = a - m;
      return [
        /* @__PURE__ */ s(De, { position: [-(S + b) / 2, a / 2, h], size: [b, a, l], materials: d }, "left"),
        /* @__PURE__ */ s(De, { position: [(S + b) / 2, a / 2, h], size: [b, a, l], materials: d }, "right"),
        /* @__PURE__ */ s(De, { position: [0, a - m / 2, h], size: [S, m, l], materials: d }, "top"),
        /* @__PURE__ */ s(De, { position: [0, y / 2, h - l * 0.07], size: [S * 0.76, y * 0.94, l * 0.34], materials: p }, "door")
      ];
    }
    if (u === "window") {
      const b = r * 0.22, S = a * 0.24, m = r - b * 2, y = a - S * 2;
      return [
        /* @__PURE__ */ s(De, { position: [-(m + b) / 2, a / 2, h], size: [b, a, l], materials: d }, "left"),
        /* @__PURE__ */ s(De, { position: [(m + b) / 2, a / 2, h], size: [b, a, l], materials: d }, "right"),
        /* @__PURE__ */ s(De, { position: [0, S / 2, h], size: [m, S, l], materials: d }, "bottom"),
        /* @__PURE__ */ s(De, { position: [0, a - S / 2, h], size: [m, S, l], materials: d }, "top"),
        /* @__PURE__ */ s(De, { position: [0, a / 2, h - l * 0.08], size: [m * 0.82, y * 0.72, l * 0.24], materials: f }, "glass")
      ];
    }
    return [
      /* @__PURE__ */ s(De, { position: [0, a / 2, h], size: [r, a, l * 0.4], materials: f }, "glass-wall"),
      /* @__PURE__ */ s(De, { position: [0, a - 0.08, h], size: [r, 0.16, l], materials: d }, "frame-top"),
      /* @__PURE__ */ s(De, { position: [0, 0.08, h], size: [r, 0.16, l], materials: d }, "frame-bottom"),
      /* @__PURE__ */ s(De, { position: [-r / 2 + 0.08, a / 2, h], size: [0.16, a, l], materials: d }, "frame-left"),
      /* @__PURE__ */ s(De, { position: [r / 2 - 0.08, a / 2, h], size: [0.16, a, l], materials: d }, "frame-right")
    ];
  })();
  return /* @__PURE__ */ s(
    "group",
    {
      position: [e.position.x, e.position.y, e.position.z],
      rotation: [0, e.rotation.y, 0],
      ...c ? { onClick: g } : {},
      children: _
    }
  );
}
function mS({
  batch: e,
  geometry: t,
  height: n,
  onWallClick: i
}) {
  const o = ee(null), r = e.walls.length, [a, l] = le(() => Math.max(1, r)), c = X(() => new B.Object3D(), []);
  oe(() => {
    r <= a || l(Math.max(r, Math.ceil(a * 1.5)));
  }, [r, a]), Ke(() => {
    const d = o.current;
    if (d) {
      d.count = r;
      for (let f = 0; f < r; f++) {
        const p = e.walls[f];
        p && (c.position.set(p.position.x, p.position.y + n / 2, p.position.z), c.rotation.set(0, p.rotation.y, 0), c.updateMatrix(), d.setMatrixAt(f, c.matrix));
      }
      d.instanceMatrix.needsUpdate = !0, r > 0 && (d.computeBoundingBox(), d.computeBoundingSphere());
    }
  }, [e.walls, r, c, n, a]);
  const u = (d) => {
    d.stopPropagation();
    const f = d.instanceId !== void 0 ? e.walls[d.instanceId] : void 0;
    f && i?.(f.id);
  };
  return /* @__PURE__ */ s(
    "instancedMesh",
    {
      ref: o,
      args: [t, e.materials, a],
      castShadow: !0,
      receiveShadow: !0,
      ...i ? { onClick: u } : {}
    }
  );
}
function gS({
  wallGroup: e,
  wallGroups: t,
  meshes: n,
  isEditMode: i = !1,
  selectedWallId: o = null,
  onWallClick: r
}) {
  const a = ee(new Fn()), l = fe.WALL_SIZES.WIDTH, c = fe.WALL_SIZES.HEIGHT, u = fe.WALL_SIZES.THICKNESS, d = X(() => {
    const g = new B.BoxGeometry(l, c, u);
    return g.translate(0, 0, l / 2), g;
  }, [l, c, u]), f = X(
    () => dS(e, t ?? /* @__PURE__ */ new Map([[e.id, e]]), n, a.current),
    [e, t, n]
  ), p = t ?? /* @__PURE__ */ new Map([[e.id, e]]), h = X(
    () => e.walls.filter((g) => !sp(g, e)),
    [e]
  );
  oe(() => () => {
    a.current.dispose(), d.dispose();
  }, [d]);
  const w = X(() => {
    if (i) return [];
    const g = l / 2;
    return e.walls.map((_) => {
      const b = Math.sin(_.rotation.y), S = Math.cos(_.rotation.y);
      return {
        id: _.id,
        position: [
          _.position.x + b * g,
          _.position.y + c / 2,
          _.position.z + S * g
        ],
        rotation: [0, _.rotation.y, 0]
      };
    });
  }, [e.walls, l, c, i]);
  return /* @__PURE__ */ x(be, { children: [
    !i && w.length > 0 && /* @__PURE__ */ s(Wr, { type: "fixed", colliders: !1, children: w.map((g) => /* @__PURE__ */ s(
      Cs,
      {
        position: g.position,
        rotation: g.rotation,
        args: [l / 2, c / 2, u / 2]
      },
      g.id
    )) }),
    i && e.walls.map((g) => {
      const _ = g.id === o;
      return /* @__PURE__ */ s(
        "group",
        {
          position: [g.position.x, g.position.y + c + 0.5, g.position.z],
          onClick: () => r?.(g.id),
          children: /* @__PURE__ */ x("mesh", { scale: _ ? 1.28 : 1, children: [
            /* @__PURE__ */ s("sphereGeometry", { args: [0.22, 16, 16] }),
            /* @__PURE__ */ s(
              "meshStandardMaterial",
              {
                color: _ ? "#bae6fd" : "#7dd3fc",
                emissive: _ ? "#60a5fa" : "#2f8dbd",
                emissiveIntensity: _ ? 0.5 : 0.22,
                transparent: !0,
                opacity: _ ? 0.94 : 0.78
              }
            )
          ] })
        },
        g.id
      );
    }),
    f.map((g) => /* @__PURE__ */ s(
      mS,
      {
        batch: g,
        geometry: d,
        height: c,
        ...r ? { onWallClick: r } : {}
      },
      `${e.id}-${g.key}`
    )),
    h.map((g) => /* @__PURE__ */ s(
      hS,
      {
        wall: g,
        wallGroup: e,
        wallGroups: p,
        meshes: n,
        manager: a.current,
        width: l,
        height: c,
        depth: u,
        ...r ? { onWallClick: r } : {}
      },
      g.id
    ))
  ] });
}
function lp(e) {
  return e.type === "tree" || e.type === "sakura";
}
function bS(e) {
  return e.type === "sakura" ? "sakura" : e.config?.treeKind ?? "oak";
}
const yS = {
  sakura: [],
  flag: [],
  fire: [],
  billboard: [],
  model: []
};
function Ge(e, t) {
  return t <= 0 ? [] : e.length <= t ? e : e.slice(0, t);
}
function vS(e) {
  const t = e.tiles.find((n) => n.objectType && n.objectType !== "none")?.objectType ?? "none";
  return t === "water" ? Co : t === "sand" ? No : t === "snowfield" ? Io : t === "grass" ? Mo : So;
}
function wS(e) {
  if (!e || e.length === 0) return yS;
  const t = { sakura: [], flag: [], fire: [], billboard: [], model: [] };
  for (const n of e)
    lp(n) ? t.sakura.push({
      position: [n.position.x, n.position.y, n.position.z],
      size: n.config?.size ?? fe.GRID_CELL_SIZE,
      treeKind: bS(n),
      ...n.config?.primaryColor ? { blossomColor: n.config.primaryColor } : {},
      ...n.config?.secondaryColor ? { barkColor: n.config.secondaryColor } : {}
    }) : n.type === "flag" ? t.flag.push(n) : n.type === "fire" ? t.fire.push({
      position: [n.position.x, n.position.y, n.position.z],
      rotation: n.rotation ?? 0,
      intensity: n.config?.fireIntensity ?? 1.5,
      width: n.config?.fireWidth ?? 1,
      height: n.config?.fireHeight ?? 1.5,
      color: n.config?.fireColor ?? "#ffffff"
    }) : n.type === "billboard" ? t.billboard.push(n) : n.type === "model" && t.model.push(n);
  return t;
}
const xS = ge.memo(function({
  onWallClick: t,
  onTileClick: n,
  onBlockClick: i,
  onWallDelete: o,
  onTileDelete: r,
  onBlockDelete: a
}) {
  const l = j((te) => te.meshes), c = j((te) => te.wallGroups), u = j((te) => te.tileGroups), d = j((te) => te.blocks), f = j((te) => te.editMode), p = j((te) => te.selectedWallId), h = j((te) => te.selectedTileId), w = j((te) => te.selectedBlockId), g = j((te) => te.showGrid), _ = j((te) => te.gridSize), b = j((te) => te.showSnow), S = j((te) => te.weatherEffect), m = j((te) => te.objects), y = Ue((te) => te.drawMirror), v = lt((te) => te.active), C = lt((te) => te.version), T = ci((te) => te.initialized), P = ci((te) => te.visibleWallGroupIds), D = ci((te) => te.visibleTileGroupIds), O = ci((te) => te.visibleBlockIds), z = ci((te) => te.visibleObjectIds), E = v && y.version > 0 && y.version === C, G = E ? st(y, il) : Number.MAX_SAFE_INTEGER, I = E ? st(y, So) : Number.MAX_SAFE_INTEGER, $ = E ? st(y, Mo) : Number.MAX_SAFE_INTEGER, R = E ? st(y, Co) : Number.MAX_SAFE_INTEGER, L = E ? st(y, No) : Number.MAX_SAFE_INTEGER, M = E ? st(y, Io) : Number.MAX_SAFE_INTEGER, F = E ? st(y, ol) : Number.MAX_SAFE_INTEGER, U = E ? st(y, rl) : Number.MAX_SAFE_INTEGER, V = E ? st(y, al) : Number.MAX_SAFE_INTEGER, Y = E ? st(y, sl) : Number.MAX_SAFE_INTEGER, Z = E ? st(y, cl) : Number.MAX_SAFE_INTEGER, J = E ? st(y, ll) : Number.MAX_SAFE_INTEGER, q = X(() => {
    const te = Array.from(c.values()), he = T ? te.filter((ye) => P.has(ye.id)) : te;
    return Ge(he, G);
  }, [c, T, P, G]), A = X(() => {
    const te = Array.from(u.values()), he = T ? te.filter((Re) => D.has(Re.id)) : te, ye = [], _e = [], Me = [], Pe = [], Ce = [];
    for (const Re of he) {
      const Oe = vS(Re);
      Oe === Mo ? _e.push(Re) : Oe === Co ? Me.push(Re) : Oe === No ? Pe.push(Re) : Oe === Io ? Ce.push(Re) : ye.push(Re);
    }
    return [
      ...Ge(ye, I),
      ...Ge(_e, $),
      ...Ge(Me, R),
      ...Ge(Pe, L),
      ...Ge(Ce, M)
    ];
  }, [u, T, D, I, $, R, L, M]), N = X(() => {
    const te = T ? m.filter((Ce) => z.has(Ce.id)) : m, he = [], ye = [], _e = [], Me = [], Pe = [];
    for (const Ce of te)
      lp(Ce) ? he.push(Ce) : Ce.type === "flag" ? ye.push(Ce) : Ce.type === "fire" ? _e.push(Ce) : Ce.type === "billboard" ? Me.push(Ce) : Ce.type === "model" && Pe.push(Ce);
    return [
      ...Ge(he, F),
      ...Ge(ye, U),
      ...Ge(_e, V),
      ...Ge(Me, Y),
      ...Ge(Pe, Z)
    ];
  }, [
    m,
    T,
    z,
    F,
    U,
    V,
    Y,
    Z
  ]), W = X(() => {
    const te = d ?? [], he = T ? te.filter((ye) => O.has(ye.id)) : te;
    return Ge(he, J);
  }, [d, T, O, J]), K = X(() => wS(N), [N]), Q = Ge(K.sakura, F), ne = Ge(K.flag, U), re = Ge(K.fire, V), ae = Ge(K.billboard, Y), se = Ge(K.model, Z);
  return /* @__PURE__ */ s(In, { fallback: null, children: /* @__PURE__ */ x("group", { name: "building-system", children: [
    g && /* @__PURE__ */ s(w_, { size: _ }),
    /* @__PURE__ */ s(y2, {}),
    /* @__PURE__ */ s(v2, {}),
    /* @__PURE__ */ s(xx, {}),
    q.map((te) => /* @__PURE__ */ s(
      gS,
      {
        wallGroup: te,
        wallGroups: c,
        meshes: l,
        isEditMode: f === "wall",
        selectedWallId: p,
        ...t ? { onWallClick: t } : {},
        ...o ? { onWallDelete: o } : {}
      },
      te.id
    )),
    A.map((te) => /* @__PURE__ */ s(
      sS,
      {
        tileGroup: te,
        meshes: l,
        isEditMode: f === "tile",
        selectedTileId: h,
        ...n ? { onTileClick: n } : {},
        ...r ? { onTileDelete: r } : {}
      },
      te.id
    )),
    W.length > 0 && /* @__PURE__ */ s(
      y_,
      {
        blocks: W,
        meshes: l,
        isEditMode: f === "block",
        selectedBlockId: w,
        ...i || a ? { onBlockClick: i ?? a } : {}
      }
    ),
    Q.length > 0 && /* @__PURE__ */ s(In, { fallback: null, children: /* @__PURE__ */ s(c2, { trees: Q }) }),
    ne.length > 0 && /* @__PURE__ */ s(In, { fallback: null, children: /* @__PURE__ */ s(e2, { flags: ne }) }),
    re.length > 0 && /* @__PURE__ */ s(In, { fallback: null, children: /* @__PURE__ */ s(G_, { fires: re }) }),
    ae.length > 0 && /* @__PURE__ */ s(In, { fallback: null, children: /* @__PURE__ */ s(E_, { billboards: ae }) }),
    se.map((te) => /* @__PURE__ */ s(
      "group",
      {
        position: [te.position.x, te.position.y, te.position.z],
        rotation: [0, te.rotation ?? 0, 0],
        children: /* @__PURE__ */ s(In, { fallback: null, children: /* @__PURE__ */ s(
          o2,
          {
            ...te.config?.modelUrl ? { url: te.config.modelUrl } : {},
            ...te.config?.modelLabel ? { label: te.config.modelLabel } : {},
            ...te.config?.modelFallbackKind ? { fallbackKind: te.config.modelFallbackKind } : {},
            ...te.config?.modelScale ? { scale: te.config.modelScale } : {},
            ...te.config?.modelColor ? { color: te.config.modelColor } : {}
          }
        ) })
      },
      te.id
    )),
    S !== "none" && /* @__PURE__ */ s(Dx, { kind: S, count: S === "storm" ? 1800 : 1200 }),
    b && S !== "snow" && /* @__PURE__ */ s(Xf, { gpu: !0 })
  ] }) });
}), ou = new B.Vector2(), _S = new B.Plane(new B.Vector3(0, 1, 0), 0), Ga = new B.Vector3();
let ur = 0;
function ru(e) {
  return e.replace(/[^a-zA-Z0-9_-]/g, "");
}
function cp(e, t, n) {
  return e !== "sand" && e !== "snowfield" ? null : {
    id: [
      "terrain-block",
      e,
      ru(t),
      ru(n)
    ].join("-"),
    color: t,
    material: "STANDARD",
    roughness: e === "snowfield" ? 0.78 : 0.94
  };
}
function SS(e) {
  return e === "sand" ? { color: "#b89b66", accentColor: "#e0c27a" } : e === "snowfield" ? { color: "#dcecff", accentColor: "#ffffff" } : null;
}
function MS(e, t) {
  let n = null, i = -1 / 0;
  for (const r of e)
    for (const a of r.tiles) {
      if (a.objectType !== "sand" && a.objectType !== "snowfield") continue;
      const c = (a.size ?? 1) * fe.GRID_CELL_SIZE * 0.5, u = t.x >= a.position.x - c && t.x <= a.position.x + c, d = t.z >= a.position.z - c && t.z <= a.position.z + c;
      !u || !d || a.position.y < i || (n = a, i = a.position.y);
    }
  if (!n) return null;
  const o = SS(n.objectType ?? "none");
  return o ? cp(
    n.objectType ?? "none",
    n.objectConfig?.terrainColor ?? o.color,
    n.objectConfig?.terrainAccentColor ?? o.accentColor
  ) : null;
}
function CS() {
  const { camera: e, raycaster: t } = Li(), n = ee({ x: 0, y: 0 }), i = j((C) => C.snapPosition), o = j((C) => C.addWall), r = j((C) => C.addTile), a = j((C) => C.addBlock), l = j((C) => C.addObject), c = j((C) => C.setSelectedWallId), u = j((C) => C.setSelectedTileId), d = j((C) => C.setSelectedBlockId), f = j((C) => C.setHoverPosition), p = ce(() => (ou.set(n.current.x, n.current.y), t.setFromCamera(ou, e), t.ray.intersectPlane(_S, Ga) ? i({ x: Ga.x, y: 0, z: Ga.z }) : null), [e, t, i]), h = ce(() => {
    const C = p();
    if (!C) return null;
    const T = j.getState().getSupportHeightAt(C);
    return { ...C, y: T };
  }, [p]), w = ce((C) => {
    const T = C.currentTarget ?? C.target ?? null, P = T && typeof T.getBoundingClientRect == "function" ? T.getBoundingClientRect() : {
      left: 0,
      top: 0,
      width: T?.clientWidth ?? window.innerWidth,
      height: T?.clientHeight ?? window.innerHeight
    };
    if (P.width <= 0 || P.height <= 0) {
      f(null);
      return;
    }
    const D = (C.clientX - P.left) / P.width, O = (C.clientY - P.top) / P.height;
    n.current.x = D * 2 - 1, n.current.y = -O * 2 + 1;
    const z = j.getState().editMode;
    f(z === "tile" || z === "block" || z === "npc" ? h() : z === "wall" || z === "object" ? p() : null);
  }, [p, h, f]), g = ce(() => {
    const {
      editMode: C,
      selectedWallGroupId: T,
      currentWallRotation: P,
      currentWallKind: D,
      checkWallPosition: O,
      hoverPosition: z
    } = j.getState();
    if (C !== "wall" || !T || !z || O(z, P)) return;
    const E = { x: 0, y: P, z: 0 };
    o(T, {
      id: `wall-${++ur}-${Date.now()}`,
      position: z,
      rotation: E,
      wallGroupId: T,
      wallKind: D
    });
  }, [o]), _ = ce(() => {
    const {
      editMode: C,
      selectedTileGroupId: T,
      checkTilePosition: P,
      getSupportHeightAt: D,
      currentTileMultiplier: O,
      currentTileHeight: z,
      currentTileShape: E,
      currentTileRotation: G,
      hoverPosition: I
    } = j.getState();
    if (C !== "tile" || !T || !I) return;
    const $ = fe.HEIGHT_STEP, R = D(I), L = E === "box" || E === "round" ? R + z * $ : Math.max(1, z) * $, M = { ...I, y: L };
    P(M) || r(T, {
      id: `tile-${++ur}-${Date.now()}`,
      position: M,
      tileGroupId: T,
      size: O,
      rotation: G,
      shape: E
    });
  }, [r]), b = ce(() => {
    const {
      editMode: C,
      checkBlockPosition: T,
      getSupportHeightAt: P,
      currentTileMultiplier: D,
      currentTileHeight: O,
      selectedTileObjectType: z,
      currentTerrainColor: E,
      currentTerrainAccentColor: G,
      tileGroups: I,
      meshes: $,
      addMesh: R,
      hoverPosition: L
    } = j.getState();
    if (C !== "block" || !L) return;
    const M = fe.HEIGHT_STEP, F = P(L), U = Math.max(1, Math.round(D)), V = {
      ...L,
      y: F + O * M
    }, Y = MS(I.values(), L) ?? cp(z, E, G);
    Y && !$.has(Y.id) && R(Y);
    const Z = {
      id: `block-${++ur}-${Date.now()}`,
      position: V,
      size: { x: U, y: 1, z: U },
      materialId: Y?.id ?? "default-block"
    };
    T(Z) || a(Z);
  }, [a]), S = ce(() => {
    const {
      editMode: C,
      selectedPlacedObjectType: T,
      hoverPosition: P,
      tileGroups: D,
      currentObjectRotation: O,
      currentObjectPrimaryColor: z,
      currentObjectSecondaryColor: E,
      currentTreeKind: G,
      currentFlagWidth: I,
      currentFlagHeight: $,
      currentFlagStyle: R,
      currentFlagImageUrl: L,
      currentFireIntensity: M,
      currentFireWidth: F,
      currentFireHeight: U,
      currentFireColor: V,
      currentBillboardText: Y,
      currentBillboardColor: Z,
      currentBillboardImageUrl: J,
      currentBillboardWidth: q,
      currentBillboardHeight: A,
      currentBillboardScale: N,
      currentBillboardOffsetY: W,
      currentBillboardElevation: K,
      currentBillboardIntensity: Q,
      selectedModelObjectId: ne,
      currentModelUrl: re,
      currentModelScale: ae,
      currentModelColor: se
    } = j.getState();
    if (C !== "object" || T === "none" || !P) return;
    let te = 0;
    const he = fe.GRID_CELL_SIZE;
    for (const _e of D.values())
      for (const Me of _e.tiles) {
        const Pe = (Me.size || 1) * he / 2;
        Math.abs(Me.position.x - P.x) < Pe && Math.abs(Me.position.z - P.z) < Pe && (te = Math.max(te, Me.position.y));
      }
    const ye = T === "tree" || T === "sakura" ? {
      size: j.getState().currentTileMultiplier * he,
      primaryColor: z,
      secondaryColor: E,
      treeKind: T === "sakura" ? "sakura" : G
    } : T === "flag" ? {
      flagWidth: I,
      flagHeight: $,
      flagStyle: R,
      ...L ? { flagTexture: L } : {}
    } : T === "fire" ? { fireIntensity: M, fireWidth: F, fireHeight: U, fireColor: V } : T === "billboard" ? {
      billboardText: Y,
      billboardColor: Z,
      billboardHeight: A,
      billboardScale: N,
      billboardOffsetY: W,
      billboardElevation: K,
      billboardIntensity: Q,
      ...q > 0 ? { billboardWidth: q } : {},
      ...J ? { billboardImageUrl: J } : {}
    } : T === "model" ? (() => {
      const _e = Ks(ne), Me = re || _e?.modelUrl;
      return {
        modelId: _e?.id ?? ne,
        modelLabel: _e?.label ?? ne,
        modelFallbackKind: _e?.fallbackKind ?? "generic",
        modelScale: ae || _e?.defaultScale || 1,
        modelColor: se || _e?.defaultColor || "#9b7653",
        ...Me ? { modelUrl: Me } : {}
      };
    })() : void 0;
    l({
      id: `obj-${++ur}-${Date.now()}`,
      type: T,
      position: {
        ...P,
        y: T === "billboard" ? te + W : te
      },
      ...O !== 0 ? { rotation: O } : {},
      ...ye ? { config: ye } : {}
    });
  }, [l]), m = ce((C) => {
    const { editMode: T } = j.getState();
    T === "wall" && c(C);
  }, [c]), y = ce((C) => {
    const { editMode: T } = j.getState();
    T === "tile" && u(C);
  }, [u]), v = ce((C) => {
    const { editMode: T } = j.getState();
    T === "block" && d(C);
  }, [d]);
  return {
    updateMousePosition: w,
    placeWall: g,
    placeTile: _,
    placeBlock: b,
    placeObject: S,
    handleWallClick: m,
    handleTileClick: y,
    handleBlockClick: v,
    getGroundPosition: p
  };
}
const NS = 1, IS = 4, Wa = 8, TS = 128, ES = 64, AS = 1, kS = 180, up = 64;
function Ua() {
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
function ja(e) {
  e?.destroy && e.destroy();
}
function au(e) {
  ja(e.uniformBuffer), ja(e.visibleBuffer), ja(e.readBuffer);
}
function PS(e, t, n, i) {
  const o = e, r = o.createShaderModule({
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

@compute @workgroup_size(${up})
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
    compute: { module: r, entryPoint: "main" }
  }), l = a.getBindGroupLayout(0), c = e.createBuffer({
    label: "building-cull-uniforms",
    size: 96,
    usage: ES | Wa
  }), u = e.createBuffer({
    label: "building-cull-visible",
    size: Math.max(4, i * 4),
    usage: TS | IS | Wa
  }), d = e.createBuffer({
    label: "building-cull-readback",
    size: Math.max(4, i * 4),
    usage: Wa | NS
  }), f = o.createBindGroup({
    layout: l,
    entries: [
      { binding: 0, resource: { buffer: t } },
      { binding: 1, resource: { buffer: n } },
      { binding: 2, resource: { buffer: u } },
      { binding: 3, resource: { buffer: c } }
    ]
  });
  return {
    pipeline: a,
    bindGroupLayout: l,
    uniformBuffer: c,
    visibleBuffer: u,
    readBuffer: d,
    bindGroup: f,
    count: i,
    spatialBuffer: t,
    metaBuffer: n
  };
}
function BS() {
  const e = Li((l) => l.gl), t = Ue((l) => l.snapshot), n = Ue((l) => l.uploadResources), i = lt((l) => l.setResult), o = lt((l) => l.reset), r = ee({
    resources: Ua(),
    busy: !1,
    lastRunAt: 0,
    readbackFlags: null
  }), a = X(
    () => ({
      viewProj: new B.Matrix4(),
      uniform: new Float32Array(24)
    }),
    []
  );
  return oe(() => o, [o]), oe(() => {
    const l = r.current.resources;
    (l.count !== t.ids.length || l.spatialBuffer !== n.spatialBuffer || l.metaBuffer !== n.metaBuffer) && (au(l), r.current.resources = Ua());
  }, [t.ids.length, n]), $e((l) => {
    if (t.version === 0 || t.ids.length === 0 || n.backend !== "webgpu") return;
    const c = dl(e);
    if (!c || !n.spatialBuffer || !n.metaBuffer || r.current.busy) return;
    const u = performance.now();
    if (u - r.current.lastRunAt < kS) return;
    r.current.lastRunAt = u, r.current.resources.pipeline || (r.current.resources = PS(
      c,
      n.spatialBuffer,
      n.metaBuffer,
      t.ids.length
    ));
    const d = r.current.resources, f = a.uniform;
    if (a.viewProj.multiplyMatrices(l.camera.projectionMatrix, l.camera.matrixWorldInverse), f.set(a.viewProj.elements, 0), f[16] = l.camera.position.x, f[17] = l.camera.position.y, f[18] = l.camera.position.z, f[19] = Tn, f[20] = t.ids.length, f[21] = 0, f[22] = 0, f[23] = 0, !d.uniformBuffer || !d.visibleBuffer || !d.readBuffer || !d.bindGroup || !d.pipeline)
      return;
    c.queue.writeBuffer(d.uniformBuffer, 0, f);
    const p = c, h = p.createCommandEncoder(), w = h.beginComputePass();
    w.setPipeline(d.pipeline), w.setBindGroup(0, d.bindGroup), w.dispatchWorkgroups(Math.max(1, Math.ceil(t.ids.length / up))), w.end(), h.copyBufferToBuffer(d.visibleBuffer, 0, d.readBuffer, 0, Math.max(4, t.ids.length * 4)), p.queue.submit([h.finish()]), r.current.busy = !0, Promise.resolve(d.readBuffer?.mapAsync?.(AS)).then(() => {
      const g = d.readBuffer?.getMappedRange?.();
      if (!g) return;
      const _ = t.ids.length, b = new Uint32Array(g, 0, _);
      (!r.current.readbackFlags || r.current.readbackFlags.length < _) && (r.current.readbackFlags = new Uint32Array(_));
      const S = r.current.readbackFlags;
      S.set(b), d.readBuffer?.unmap?.();
      const m = t_(t, S);
      i(m);
    }).catch(() => {
      o();
    }).finally(() => {
      r.current.busy = !1;
    });
  }), oe(() => () => {
    au(r.current.resources), r.current.resources = Ua(), o();
  }, [o]), null;
}
function RS() {
  const e = Ue((i) => i.snapshot), t = Ue((i) => i.setGpuMirror), n = ee(Ue.getState().gpuMirror);
  return oe(() => {
    const i = l_(e, n.current);
    n.current = i, t(i);
  }, [e, t]), null;
}
function DS() {
  const e = Li((o) => o.gl), t = Ue((o) => o.gpuMirror), n = Ue((o) => o.setUploadResources), i = ee(Rr());
  return oe(() => {
    if (t.version === 0) return;
    const o = dl(e);
    o && (i.current = p_(o, i.current, t), n(i.current));
  }, [e, t, n]), oe(() => () => {
    f_(i.current), i.current = Rr(), n(i.current);
  }, [n]), null;
}
function zS() {
  const e = Li((o) => o.gl), t = Ue((o) => o.drawMirror), n = Ue((o) => o.setUploadResources), i = ee(Ue.getState().uploadResources ?? Rr());
  return oe(() => {
    i.current = Ue.getState().uploadResources;
  }), oe(() => {
    if (t.version === 0) return;
    const o = dl(e);
    o && (i.current = h_(o, i.current, t), n(i.current));
  }, [e, t, n]), null;
}
function FS() {
  const e = lt((o) => o.version), t = lt((o) => o.clusterCounts), n = Ue((o) => o.setDrawMirror), i = ee(Ue.getState().drawMirror);
  return oe(() => {
    if (e === 0 || t.length === 0) return;
    const o = o_(e, t, i.current);
    i.current = o, n(o);
  }, [e, t, n]), null;
}
function LS() {
  const e = j((c) => c.wallGroups), t = j((c) => c.tileGroups), n = j((c) => c.blocks), i = j((c) => c.objects), o = Ue((c) => c.setSnapshot), r = Ue((c) => c.reset), a = ee(1), l = X(
    () => Jx({
      wallGroups: Array.from(e.values()),
      tileGroups: Array.from(t.values()),
      blocks: n ?? [],
      objects: i,
      version: a.current++
    }),
    [e, t, n, i]
  );
  return oe(() => {
    o(l);
  }, [l, o]), oe(() => r, [r]), null;
}
function dr(e, t, n, i, o, r, a, l) {
  for (const c of t) {
    const u = n.get(c);
    if (!u) continue;
    const d = u.centerX - r.x, f = u.centerY - r.y, p = u.centerZ - r.z, h = l + u.radius * u.radius;
    d * d + f * f + p * p > h || (a.center.set(u.centerX, u.centerY, u.centerZ), a.radius = u.radius, o.intersectsSphere(a) && e.add(c));
  }
}
function $S() {
  const e = Ue((b) => b.snapshot), t = j((b) => b.wallGroups), n = j((b) => b.tileGroups), i = j((b) => b.blocks), o = j((b) => b.objects), r = lt((b) => b.active), a = lt((b) => b.version), l = lt((b) => b.visibleTileGroupIds), c = lt((b) => b.visibleWallGroupIds), u = lt((b) => b.visibleBlockIds), d = lt((b) => b.visibleObjectIds), f = ci((b) => b.setVisible), p = ci((b) => b.reset), h = X(
    () => Yx(
      Array.from(t.values()),
      Array.from(n.values()),
      o,
      i ?? []
    ),
    [t, n, o, i]
  ), w = ee(0), g = ee(/* @__PURE__ */ new Map()), _ = X(
    () => ({
      frustum: new B.Frustum(),
      matrix: new B.Matrix4(),
      camera: new B.Vector3(),
      forward: new B.Vector3(),
      sphere: new B.Sphere()
    }),
    []
  );
  return oe(() => {
    g.current.clear();
  }, [h]), oe(() => {
    g.current.clear();
  }, [r, a]), oe(() => p, [p]), $e((b, S) => {
    if (e.ids.length === 0 || (w.current += Math.max(0, S), w.current < Gx)) return;
    w.current = 0, _.matrix.multiplyMatrices(b.camera.projectionMatrix, b.camera.matrixWorldInverse), _.frustum.setFromProjectionMatrix(_.matrix), _.camera.copy(b.camera.position), b.camera.getWorldDirection(_.forward);
    const m = jx(
      _.camera.x,
      _.camera.z,
      _.forward.x,
      _.forward.z
    ), y = g.current.get(m);
    if (y) {
      f(y);
      return;
    }
    const v = r && a === e.version, C = v ? new Set(l) : nr(
      h.tileBuckets,
      _.camera.x,
      _.camera.z,
      Tn
    ), T = v ? new Set(c) : nr(
      h.wallBuckets,
      _.camera.x,
      _.camera.z,
      Tn
    ), P = v ? new Set(d) : nr(
      h.objectBuckets,
      _.camera.x,
      _.camera.z,
      Tn
    ), D = v ? new Set(u) : nr(
      h.blockBuckets,
      _.camera.x,
      _.camera.z,
      Tn
    ), O = /* @__PURE__ */ new Set(), z = /* @__PURE__ */ new Set(), E = /* @__PURE__ */ new Set(), G = /* @__PURE__ */ new Set(), I = Tn * Tn;
    dr(
      O,
      C,
      h.tileById,
      "tile",
      _.frustum,
      _.camera,
      _.sphere,
      I
    ), dr(
      z,
      T,
      h.wallById,
      "wall",
      _.frustum,
      _.camera,
      _.sphere,
      I
    ), dr(
      G,
      P,
      h.objectById,
      "object",
      _.frustum,
      _.camera,
      _.sphere,
      I
    ), dr(
      E,
      D,
      h.blockById,
      "block",
      _.frustum,
      _.camera,
      _.sphere,
      I
    );
    const $ = { tileIds: O, wallIds: z, blockIds: E, objectIds: G };
    if (g.current.set(m, $), g.current.size > 96) {
      const R = g.current.keys().next().value;
      R && g.current.delete(R);
    }
    f({
      tileIds: $.tileIds,
      wallIds: $.wallIds,
      blockIds: $.blockIds,
      objectIds: $.objectIds
    });
  }), null;
}
const OS = 9, HS = 150;
function kM() {
  const { gl: e } = Li(), {
    updateMousePosition: t,
    placeWall: n,
    placeTile: i,
    placeBlock: o,
    placeObject: r,
    handleWallClick: a,
    handleTileClick: l,
    handleBlockClick: c
  } = CS(), u = j((v) => v.editMode), d = u !== "none", f = j((v) => v.setHoverPosition), p = j((v) => v.setWallRotation), h = j((v) => v.setTileRotation), w = j((v) => v.setObjectRotation), g = j((v) => v.setTileHeight), _ = j((v) => v.initialized), b = j((v) => v.initializeDefaults), S = ee({ x: 0, y: 0 }), m = ee(0), y = ce((v) => {
    v && (v.mouseButtons = {
      LEFT: -1,
      MIDDLE: B.MOUSE.DOLLY,
      RIGHT: B.MOUSE.ROTATE
    });
  }, []);
  return oe(() => {
    _ || b();
  }, [_, b]), oe(() => {
    if (u !== "wall" && u !== "tile" && u !== "block" && u !== "object") return;
    const v = (C) => {
      const T = (P) => {
        u === "wall" ? p(P) : u === "tile" ? h(P) : u === "object" && w(P);
      };
      switch (C.key) {
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
      if (u === "tile" || u === "block") {
        if (C.code === "KeyQ" || C.key === "q" || C.key === "Q") {
          const P = j.getState().currentTileHeight;
          g(P - 1);
        } else if (C.code === "KeyE" || C.key === "e" || C.key === "E") {
          const P = j.getState().currentTileHeight;
          g(P + 1);
        }
      }
    };
    return window.addEventListener("keydown", v), () => window.removeEventListener("keydown", v);
  }, [u, h, p, w, g]), oe(() => {
    const v = e.domElement, C = (D) => {
      D.button === 0 && (S.current.x = D.clientX, S.current.y = D.clientY);
    }, T = (D) => t(D), P = (D) => {
      if (D.button !== 0) return;
      const O = D.clientX - S.current.x, z = D.clientY - S.current.y;
      if (O * O + z * z > OS) return;
      const E = performance.now();
      if (E - m.current < HS) return;
      m.current = E;
      const G = j.getState().editMode;
      G !== "npc" && (G === "wall" ? n() : G === "tile" ? i() : G === "block" ? o() : G === "object" && r());
    };
    return v.addEventListener("mousedown", C), v.addEventListener("mousemove", T), v.addEventListener("mouseup", P), () => {
      v.removeEventListener("mousedown", C), v.removeEventListener("mousemove", T), v.removeEventListener("mouseup", P), f(null);
    };
  }, [e, t, n, i, o, r, f]), /* @__PURE__ */ x(be, { children: [
    /* @__PURE__ */ s(LS, {}),
    /* @__PURE__ */ s(RS, {}),
    /* @__PURE__ */ s(DS, {}),
    /* @__PURE__ */ s(BS, {}),
    /* @__PURE__ */ s(FS, {}),
    /* @__PURE__ */ s(zS, {}),
    /* @__PURE__ */ s($S, {}),
    d && /* @__PURE__ */ s(
      lh,
      {
        ref: y,
        enablePan: !0,
        enableZoom: !0,
        enableRotate: !0,
        maxPolarAngle: Math.PI / 2.5,
        minDistance: 5,
        maxDistance: 100
      }
    ),
    /* @__PURE__ */ s(
      xS,
      {
        onWallClick: a,
        onTileClick: l,
        onBlockClick: c,
        onWallDelete: a,
        onTileDelete: l,
        onBlockDelete: c
      }
    ),
    /* @__PURE__ */ s(vx, {})
  ] });
}
const su = rf;
function PM({
  onClose: e,
  canEdit: t = !0,
  npcPanel: n = !1,
  extensionPanel: i
}) {
  const {
    setEditMode: o,
    editMode: r,
    isInEditMode: a,
    currentTileMultiplier: l,
    setTileMultiplier: c,
    currentTileHeight: u,
    setTileHeight: d,
    currentTileShape: f,
    setTileShape: p,
    currentTileRotation: h,
    setTileRotation: w,
    currentWallRotation: g,
    setWallRotation: _,
    currentWallKind: b,
    setWallKind: S,
    applyWallPreset: m,
    wallCategories: y,
    tileCategories: v,
    selectedWallCategoryId: C,
    selectedTileCategoryId: T,
    selectedWallGroupId: P,
    selectedTileGroupId: D,
    selectedWallId: O,
    selectedTileId: z,
    setCurrentWallMaterialId: E,
    setCurrentTileMaterialId: G,
    setSelectedWallCategory: I,
    setSelectedTileCategory: $,
    wallGroups: R,
    tileGroups: L,
    meshes: M,
    updateMesh: F,
    addMesh: U,
    updateWall: V,
    moveWallToGroup: Y,
    updateTile: Z,
    addWallGroup: J,
    addTileGroup: q,
    selectedTileObjectType: A,
    setSelectedTileObjectType: N,
    currentCustomTileName: W,
    currentCustomTileColor: K,
    currentCustomTileTextureUrl: Q,
    setCustomTileDraft: ne,
    applyTilePreset: re,
    applyCustomTile: ae,
    selectedPlacedObjectType: se,
    setSelectedPlacedObjectType: te,
    currentObjectRotation: he,
    setObjectRotation: ye,
    selectedModelObjectId: _e,
    setSelectedModelObjectId: Me,
    currentModelUrl: Pe,
    setModelUrl: Ce,
    currentModelScale: Re,
    setModelScale: Oe,
    currentModelColor: xt,
    setModelColor: nt,
    currentObjectPrimaryColor: Qe,
    setObjectPrimaryColor: it,
    currentObjectSecondaryColor: Lt,
    setObjectSecondaryColor: on,
    currentTreeKind: $t,
    setTreeKind: Ln,
    currentFlagWidth: $n,
    setFlagWidth: On,
    currentFlagHeight: Hn,
    setFlagHeight: Gn,
    currentFlagImageUrl: Wn,
    setFlagImageUrl: Un,
    currentFlagStyle: _t,
    setFlagStyle: ct,
    currentFireIntensity: St,
    setFireIntensity: ot,
    currentFireWidth: Ot,
    setFireWidth: rn,
    currentFireHeight: an,
    setFireHeight: Ht,
    currentFireColor: sn,
    setFireColor: ln,
    currentBillboardText: jn,
    setBillboardText: Vn,
    currentBillboardImageUrl: Zn,
    setBillboardImageUrl: Yn,
    currentBillboardColor: cn,
    setBillboardColor: un,
    currentBillboardWidth: Xn,
    setBillboardWidth: Kn,
    currentBillboardHeight: qn,
    setBillboardHeight: Qn,
    currentBillboardScale: dn,
    setBillboardScale: fn,
    currentBillboardOffsetY: pn,
    setBillboardOffsetY: Gt,
    currentBillboardElevation: hn,
    setBillboardElevation: mn,
    currentBillboardIntensity: Jn,
    setBillboardIntensity: ei,
    showSnow: Wt,
    setShowSnow: ti,
    showFog: Ut,
    setShowFog: ni,
    fogColor: gn,
    setFogColor: bn,
    weatherEffect: jt,
    setWeatherEffect: yn
  } = j(Ns((k) => ({
    setEditMode: k.setEditMode,
    editMode: k.editMode,
    isInEditMode: k.isInEditMode,
    currentTileMultiplier: k.currentTileMultiplier,
    setTileMultiplier: k.setTileMultiplier,
    currentTileHeight: k.currentTileHeight,
    setTileHeight: k.setTileHeight,
    currentTileShape: k.currentTileShape,
    setTileShape: k.setTileShape,
    currentTileRotation: k.currentTileRotation,
    setTileRotation: k.setTileRotation,
    currentWallRotation: k.currentWallRotation,
    setWallRotation: k.setWallRotation,
    currentWallKind: k.currentWallKind,
    setWallKind: k.setWallKind,
    applyWallPreset: k.applyWallPreset,
    wallCategories: k.wallCategories,
    tileCategories: k.tileCategories,
    selectedWallCategoryId: k.selectedWallCategoryId,
    selectedTileCategoryId: k.selectedTileCategoryId,
    selectedWallGroupId: k.selectedWallGroupId,
    selectedTileGroupId: k.selectedTileGroupId,
    selectedWallId: k.selectedWallId,
    selectedTileId: k.selectedTileId,
    setCurrentWallMaterialId: k.setCurrentWallMaterialId,
    setCurrentTileMaterialId: k.setCurrentTileMaterialId,
    setSelectedWallCategory: k.setSelectedWallCategory,
    setSelectedTileCategory: k.setSelectedTileCategory,
    wallGroups: k.wallGroups,
    tileGroups: k.tileGroups,
    meshes: k.meshes,
    updateMesh: k.updateMesh,
    addMesh: k.addMesh,
    updateWall: k.updateWall,
    moveWallToGroup: k.moveWallToGroup,
    updateTile: k.updateTile,
    addWallGroup: k.addWallGroup,
    addTileGroup: k.addTileGroup,
    selectedTileObjectType: k.selectedTileObjectType,
    setSelectedTileObjectType: k.setSelectedTileObjectType,
    currentCustomTileName: k.currentCustomTileName,
    currentCustomTileColor: k.currentCustomTileColor,
    currentCustomTileTextureUrl: k.currentCustomTileTextureUrl,
    setCustomTileDraft: k.setCustomTileDraft,
    applyTilePreset: k.applyTilePreset,
    applyCustomTile: k.applyCustomTile,
    selectedPlacedObjectType: k.selectedPlacedObjectType,
    setSelectedPlacedObjectType: k.setSelectedPlacedObjectType,
    currentObjectRotation: k.currentObjectRotation,
    setObjectRotation: k.setObjectRotation,
    selectedModelObjectId: k.selectedModelObjectId,
    setSelectedModelObjectId: k.setSelectedModelObjectId,
    currentModelUrl: k.currentModelUrl,
    setModelUrl: k.setModelUrl,
    currentModelScale: k.currentModelScale,
    setModelScale: k.setModelScale,
    currentModelColor: k.currentModelColor,
    setModelColor: k.setModelColor,
    currentObjectPrimaryColor: k.currentObjectPrimaryColor,
    setObjectPrimaryColor: k.setObjectPrimaryColor,
    currentObjectSecondaryColor: k.currentObjectSecondaryColor,
    setObjectSecondaryColor: k.setObjectSecondaryColor,
    currentTreeKind: k.currentTreeKind,
    setTreeKind: k.setTreeKind,
    currentFlagWidth: k.currentFlagWidth,
    setFlagWidth: k.setFlagWidth,
    currentFlagHeight: k.currentFlagHeight,
    setFlagHeight: k.setFlagHeight,
    currentFlagImageUrl: k.currentFlagImageUrl,
    setFlagImageUrl: k.setFlagImageUrl,
    currentFlagStyle: k.currentFlagStyle,
    setFlagStyle: k.setFlagStyle,
    currentFireIntensity: k.currentFireIntensity,
    setFireIntensity: k.setFireIntensity,
    currentFireWidth: k.currentFireWidth,
    setFireWidth: k.setFireWidth,
    currentFireHeight: k.currentFireHeight,
    setFireHeight: k.setFireHeight,
    currentFireColor: k.currentFireColor,
    setFireColor: k.setFireColor,
    currentBillboardText: k.currentBillboardText,
    setBillboardText: k.setBillboardText,
    currentBillboardImageUrl: k.currentBillboardImageUrl,
    setBillboardImageUrl: k.setBillboardImageUrl,
    currentBillboardColor: k.currentBillboardColor,
    setBillboardColor: k.setBillboardColor,
    currentBillboardWidth: k.currentBillboardWidth,
    setBillboardWidth: k.setBillboardWidth,
    currentBillboardHeight: k.currentBillboardHeight,
    setBillboardHeight: k.setBillboardHeight,
    currentBillboardScale: k.currentBillboardScale,
    setBillboardScale: k.setBillboardScale,
    currentBillboardOffsetY: k.currentBillboardOffsetY,
    setBillboardOffsetY: k.setBillboardOffsetY,
    currentBillboardElevation: k.currentBillboardElevation,
    setBillboardElevation: k.setBillboardElevation,
    currentBillboardIntensity: k.currentBillboardIntensity,
    setBillboardIntensity: k.setBillboardIntensity,
    showSnow: k.showSnow,
    setShowSnow: k.setShowSnow,
    showFog: k.showFog,
    setShowFog: k.setShowFog,
    fogColor: k.fogColor,
    setFogColor: k.setFogColor,
    weatherEffect: k.weatherEffect,
    setWeatherEffect: k.setWeatherEffect
  }))), Mt = a(), [Ct, ii] = ge.useState(!1), [rt, ut] = ge.useState(""), [Ye, at] = ge.useState("#808080"), [je, Nt] = ge.useState(""), oi = X(() => Array.from(v.values()), [v]), ri = X(() => Array.from(y.values()), [y]), It = n !== !1 && n !== null && n !== void 0, ai = X(
    () => Za.find((k) => k.type === A)?.labelEn ?? A,
    [A]
  ), vn = X(
    () => Va.find((k) => k.type === f)?.labelEn ?? f,
    [f]
  ), Vt = X(
    () => Ks(_e) ?? _o[0],
    [_e]
  ), Tt = X(() => {
    const k = /* @__PURE__ */ new Map();
    for (const pe of R.values())
      for (const Ve of pe.walls)
        k.set(Ve.id, pe.id);
    return k;
  }, [R]), Zt = ce((k, pe) => {
    const Ve = k ? M.get(k) : void 0, { mapTextureUrl: ft, textureUrl: Lo, ...vi } = Ve ?? {}, Hi = {
      ...vi,
      id: pe,
      color: Ye,
      material: "STANDARD",
      ...je ? { mapTextureUrl: je, textureUrl: je } : {}
    };
    return M.has(pe) ? F(pe, Hi) : U(Hi), pe;
  }, [U, Ye, je, M, F]), dt = ce((k) => {
    const pe = Tt.get(k);
    return pe ? R.get(pe) : void 0;
  }, [Tt, R]), Yt = O ? dt(O)?.id : P, Et = O ? dt(O) : R.get(P ?? ""), wn = O ? Et?.walls.find((k) => k.id === O) : void 0, H = ce(() => {
    o("none"), e?.();
  }, [o, e]), Oi = ce(() => ii((k) => !k), []);
  return ge.useEffect(() => {
    if (r === "wall" && P) {
      const k = O ? dt(O) : R.get(P), Ve = (O ? k?.walls.find((ft) => ft.id === O) : void 0)?.materialId ?? k?.frontMeshId;
      if (Ve) {
        const ft = M.get(Ve);
        ft && (at(ft.color || "#808080"), Nt(ft.mapTextureUrl || ""));
      }
    } else if (r === "tile" && D) {
      const k = L.get(D);
      if (k && k.floorMeshId) {
        const pe = M.get(k.floorMeshId);
        pe && (at(pe.color || "#808080"), Nt(pe.mapTextureUrl || ""));
      }
    }
  }, [r, P, D, O, dt, R, L, M]), t ? /* @__PURE__ */ x(be, { children: [
    Mt && /* @__PURE__ */ s("div", { className: "building-edit-mode-overlay" }),
    /* @__PURE__ */ s("div", { className: "building-ui-container", children: Mt ? /* @__PURE__ */ x("div", { className: "building-ui-panel", children: [
      /* @__PURE__ */ x("div", { className: "building-ui-header", children: [
        /* @__PURE__ */ s("span", { className: "building-ui-title", children: "Building Mode" }),
        /* @__PURE__ */ s(
          "button",
          {
            onClick: H,
            className: "building-ui-close",
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ x("div", { className: "building-ui-mode-group", children: [
        /* @__PURE__ */ s(
          "button",
          {
            onClick: () => o("wall"),
            className: `building-ui-mode-button ${r === "wall" ? "active" : ""}`,
            children: "Wall Mode"
          }
        ),
        /* @__PURE__ */ s(
          "button",
          {
            onClick: () => o("tile"),
            className: `building-ui-mode-button ${r === "tile" ? "active" : ""}`,
            children: "Tile Mode"
          }
        ),
        /* @__PURE__ */ s(
          "button",
          {
            onClick: () => o("block"),
            className: `building-ui-mode-button ${r === "block" ? "active" : ""}`,
            children: "Block Mode"
          }
        ),
        It && /* @__PURE__ */ s(
          "button",
          {
            onClick: () => o("npc"),
            className: `building-ui-mode-button ${r === "npc" ? "active" : ""}`,
            children: "NPC Mode"
          }
        ),
        /* @__PURE__ */ s(
          "button",
          {
            onClick: () => o("object"),
            className: `building-ui-mode-button ${r === "object" ? "active" : ""}`,
            children: "Object Mode"
          }
        )
      ] }),
      /* @__PURE__ */ x("div", { className: "building-ui-object-group", children: [
        /* @__PURE__ */ s("span", { className: "building-ui-label", children: "World Environment:" }),
        /* @__PURE__ */ x("div", { className: "building-ui-object-buttons", children: [
          /* @__PURE__ */ x(
            "button",
            {
              onClick: () => ti(!Wt),
              className: `building-ui-object-button ${Wt ? "active" : ""}`,
              children: [
                "Snow ",
                Wt ? "ON" : "OFF"
              ]
            }
          ),
          uu.filter((k) => k.type !== "snow").map((k) => /* @__PURE__ */ s(
            "button",
            {
              onClick: () => yn(k.type),
              className: `building-ui-object-button ${jt === k.type ? "active" : ""}`,
              children: k.labelEn
            },
            k.type
          )),
          /* @__PURE__ */ x(
            "button",
            {
              onClick: () => ni(!Ut),
              className: `building-ui-object-button ${Ut ? "active" : ""}`,
              children: [
                "Fog ",
                Ut ? "ON" : "OFF"
              ]
            }
          ),
          /* @__PURE__ */ x("label", { className: "building-ui-object-button", children: [
            "Fog Color",
            /* @__PURE__ */ s(
              "input",
              {
                type: "color",
                value: gn,
                onChange: (k) => bn(k.target.value),
                style: { marginLeft: 8 }
              }
            )
          ] })
        ] })
      ] }),
      r === "tile" && /* @__PURE__ */ x(be, { children: [
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Category:" }),
          /* @__PURE__ */ s(
            "select",
            {
              value: T || "",
              onChange: (k) => $(k.target.value),
              className: "building-ui-select",
              children: oi.map((k) => /* @__PURE__ */ s("option", { value: k.id, children: k.name }, k.id))
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Type:" }),
          /* @__PURE__ */ s(
            "select",
            {
              value: D || "",
              onChange: (k) => j.setState({ selectedTileGroupId: k.target.value }),
              className: "building-ui-select",
              children: T && v.get(T)?.tileGroupIds.map((k) => {
                const pe = L.get(k);
                return pe ? /* @__PURE__ */ s("option", { value: pe.id, children: pe.name }, pe.id) : null;
              })
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-object-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Wall Preset:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-object-buttons", children: pu.map((k) => {
            const pe = `${k.id}-walls`;
            return /* @__PURE__ */ s(
              "button",
              {
                onClick: () => m(k.id),
                className: `building-ui-object-button ${P === pe ? "active" : ""}`,
                children: k.labelEn
              },
              k.id
            );
          }) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-object-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Wall Module:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-object-buttons", children: Ss.map((k) => /* @__PURE__ */ s(
            "button",
            {
              onClick: () => S(k.type),
              className: `building-ui-object-button ${(wn?.wallKind ?? b) === k.type ? "active" : ""}`,
              children: k.labelEn
            },
            k.type
          )) })
        ] }),
        /* @__PURE__ */ s(
          "button",
          {
            onClick: () => {
              !O || !Et || V(Et.id, O, { flipSides: !wn?.flipSides });
            },
            className: "building-ui-apply-button",
            disabled: !O || !Et,
            children: "Flip Interior/Exterior"
          }
        ),
        /* @__PURE__ */ x(
          "button",
          {
            onClick: Oi,
            className: "building-ui-custom-toggle",
            children: [
              Ct ? "Hide" : "Show",
              " Custom Settings"
            ]
          }
        ),
        Ct && /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Name:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: rt,
                onChange: (k) => ut(k.target.value),
                placeholder: "Custom Floor Name",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ s(
                "input",
                {
                  type: "color",
                  value: Ye,
                  onChange: (k) => at(k.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ s(
                "input",
                {
                  type: "text",
                  value: Ye,
                  onChange: (k) => at(k.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Texture URL:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: je,
                onChange: (k) => Nt(k.target.value),
                placeholder: "https://...",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ s(
            "button",
            {
              onClick: () => {
                if (D) {
                  const k = L.get(D);
                  if (k && k.floorMeshId) {
                    const pe = z ? Zt(k.floorMeshId, `custom-tile-mesh-${z}`) : Zt(k.floorMeshId, su("custom-placement-tile-mesh"));
                    if (z) {
                      Z(k.id, z, { materialId: pe });
                      return;
                    }
                    G(pe);
                  }
                }
              },
              className: "building-ui-apply-button",
              children: "Apply Changes"
            }
          ),
          /* @__PURE__ */ s(
            "button",
            {
              onClick: () => {
                if (rt) {
                  const k = `custom-tile-${Date.now()}`, pe = `custom-floor-mesh-${Date.now()}`;
                  if (U({
                    id: pe,
                    color: Ye,
                    material: "STANDARD",
                    ...je ? { mapTextureUrl: je } : {},
                    roughness: 0.6
                  }), q({
                    id: k,
                    name: rt,
                    floorMeshId: pe,
                    tiles: []
                  }), T) {
                    const Ve = v.get(T);
                    Ve && j.getState().updateTileCategory(T, {
                      tileGroupIds: [...Ve.tileGroupIds, k]
                    });
                  }
                  j.setState({ selectedTileGroupId: k }), ut("");
                }
              },
              className: "building-ui-create-button",
              children: "Create New Type"
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Tile Size:" }),
          /* @__PURE__ */ x("div", { className: "building-ui-size-buttons", children: [
            /* @__PURE__ */ s(
              "button",
              {
                onClick: () => c(1),
                className: `building-ui-size-button ${l === 1 ? "active" : ""}`,
                children: "1x1"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                onClick: () => c(2),
                className: `building-ui-size-button ${l === 2 ? "active" : ""}`,
                children: "2x2"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                onClick: () => c(3),
                className: `building-ui-size-button ${l === 3 ? "active" : ""}`,
                children: "3x3"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                onClick: () => c(4),
                className: `building-ui-size-button ${l === 4 ? "active" : ""}`,
                children: "4x4"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Tile Height:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-size-buttons", children: [0, 1, 2, 3, 4].map((k) => /* @__PURE__ */ s(
            "button",
            {
              onClick: () => d(k),
              className: `building-ui-size-button ${u === k ? "active" : ""}`,
              children: k
            },
            k
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Tile Shape:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-size-buttons", children: Va.map((k) => /* @__PURE__ */ s(
            "button",
            {
              onClick: () => p(k.type),
              className: `building-ui-size-button ${f === k.type ? "active" : ""}`,
              children: k.labelEn
            },
            k.type
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Tile Rotation:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-size-buttons", children: [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((k, pe) => /* @__PURE__ */ s(
            "button",
            {
              onClick: () => w(k),
              className: `building-ui-size-button ${Math.abs(h - k) < 1e-4 ? "active" : ""}`,
              children: pe * 90
            },
            k
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-object-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Tile Preset:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-object-buttons", children: hu.map((k) => {
            const pe = `${k.id}-floor`;
            return /* @__PURE__ */ s(
              "button",
              {
                onClick: () => re(k.id),
                className: `building-ui-object-button ${D === pe ? "active" : ""}`,
                children: k.labelEn
              },
              k.id
            );
          }) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Custom Tile:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: W,
                onChange: (k) => ne({ name: k.target.value }),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ s(
                "input",
                {
                  type: "color",
                  value: K,
                  onChange: (k) => ne({ color: k.target.value }),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ s(
                "input",
                {
                  type: "text",
                  value: K,
                  onChange: (k) => ne({ color: k.target.value }),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Texture URL:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: Q,
                onChange: (k) => ne({ textureUrl: k.target.value }),
                placeholder: "textures/floor.png",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ s("button", { onClick: ae, className: "building-ui-action-button", children: "Create/Select Separate Tile Map" })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-object-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Tile Object:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-object-buttons", children: Za.map((k) => /* @__PURE__ */ s(
            "button",
            {
              onClick: () => N(k.type),
              className: `building-ui-object-button ${A === k.type ? "active" : ""}`,
              children: k.labelEn
            },
            k.type
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ x("p", { children: [
            "Category: ",
            v.get(T || "")?.name
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Type: ",
            L.get(D || "")?.name
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Size: ",
            l,
            "x",
            l,
            " (",
            l * 4,
            "m)"
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Height: ",
            u
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Shape: ",
            vn
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Object: ",
            ai
          ] }),
          /* @__PURE__ */ s("p", { children: "Click to place tiles" }),
          /* @__PURE__ */ s("p", { children: "Amber = Occupied, Blue = Available" })
        ] })
      ] }),
      r === "block" && /* @__PURE__ */ x(be, { children: [
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Block Size:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-size-buttons", children: [1, 2, 3, 4].map((k) => /* @__PURE__ */ x(
            "button",
            {
              onClick: () => c(k),
              className: `building-ui-size-button ${l === k ? "active" : ""}`,
              children: [
                k,
                "x",
                k
              ]
            },
            k
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Layer Offset:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-size-buttons", children: [0, 1, 2, 3, 4].map((k) => /* @__PURE__ */ s(
            "button",
            {
              onClick: () => d(k),
              className: `building-ui-size-button ${u === k ? "active" : ""}`,
              children: k
            },
            k
          )) })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ x("p", { children: [
            "Size: ",
            l,
            "x",
            l
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Layer offset: ",
            u
          ] }),
          /* @__PURE__ */ s("p", { children: "Click to place voxel blocks" }),
          /* @__PURE__ */ s("p", { children: "Click highlighted blocks to delete" })
        ] })
      ] }),
      r === "object" && /* @__PURE__ */ x(be, { children: [
        /* @__PURE__ */ x("div", { className: "building-ui-object-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Object Type:" }),
          /* @__PURE__ */ x("div", { className: "building-ui-object-buttons", children: [
            Bp.map((k) => /* @__PURE__ */ s(
              "button",
              {
                onClick: () => te(k.type),
                className: `building-ui-object-button ${se === k.type ? "active" : ""}`,
                children: k.labelEn
              },
              k.type
            )),
            _o.map((k) => /* @__PURE__ */ s(
              "button",
              {
                onClick: () => {
                  te("model"), Me(k.id), Oe(k.defaultScale), nt(k.defaultColor), Ce(k.modelUrl ?? "");
                },
                className: `building-ui-object-button ${se === "model" && _e === k.id ? "active" : ""}`,
                children: k.label
              },
              k.id
            ))
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Object Rotation:" }),
          /* @__PURE__ */ s("div", { className: "building-ui-size-buttons", children: [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((k, pe) => /* @__PURE__ */ s(
            "button",
            {
              onClick: () => ye(k),
              className: `building-ui-size-button ${Math.abs(he - k) < 1e-4 ? "active" : ""}`,
              children: pe * 90
            },
            k
          )) })
        ] }),
        (se === "tree" || se === "sakura") && /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-object-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Tree Type:" }),
            /* @__PURE__ */ s("div", { className: "building-ui-object-buttons", children: du.map((k) => /* @__PURE__ */ s(
              "button",
              {
                onClick: () => Ln(k.type),
                className: `building-ui-object-button ${$t === k.type ? "active" : ""}`,
                children: k.labelEn
              },
              k.type
            )) })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Leaf/Flower Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ s(
                "input",
                {
                  type: "color",
                  value: Qe,
                  onChange: (k) => it(k.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ s(
                "input",
                {
                  type: "text",
                  value: Qe,
                  onChange: (k) => it(k.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Bark Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ s(
                "input",
                {
                  type: "color",
                  value: Lt,
                  onChange: (k) => on(k.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ s(
                "input",
                {
                  type: "text",
                  value: Lt,
                  onChange: (k) => on(k.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] })
        ] }),
        se === "flag" && /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-object-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Flag Style:" }),
            /* @__PURE__ */ s("div", { className: "building-ui-object-buttons", children: fu.map(({ style: k, meta: pe }) => /* @__PURE__ */ s(
              "button",
              {
                onClick: () => ct(k),
                className: `building-ui-object-button ${_t === k ? "active" : ""}`,
                children: pe.label
              },
              k
            )) })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Width:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0.5",
                max: "8",
                step: "0.1",
                value: $n,
                onChange: (k) => On(Number(k.target.value) || 1.5),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Height:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0.5",
                max: "6",
                step: "0.1",
                value: Hn,
                onChange: (k) => Gn(Number(k.target.value) || 1),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Image URL:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: Wn,
                onChange: (k) => Un(k.target.value),
                placeholder: "https://...",
                className: "building-ui-input"
              }
            )
          ] })
        ] }),
        se === "fire" && /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Intensity:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0.5",
                max: "3",
                step: "0.1",
                value: St,
                onChange: (k) => ot(Number(k.target.value) || 1.5),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Width:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0.3",
                max: "4",
                step: "0.1",
                value: Ot,
                onChange: (k) => rn(Number(k.target.value) || 1),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Height:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0.5",
                max: "5",
                step: "0.1",
                value: an,
                onChange: (k) => Ht(Number(k.target.value) || 1.5),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ s(
                "input",
                {
                  type: "color",
                  value: sn,
                  onChange: (k) => ln(k.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ s(
                "input",
                {
                  type: "text",
                  value: sn,
                  onChange: (k) => ln(k.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] })
        ] }),
        se === "billboard" && /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Billboard Size:" }),
            /* @__PURE__ */ s("div", { className: "building-ui-size-buttons", children: [0.5, 1, 1.5, 2, 3, 4].map((k) => /* @__PURE__ */ x(
              "button",
              {
                onClick: () => fn(k),
                className: `building-ui-size-button ${Math.abs(dn - k) < 1e-4 ? "active" : ""}`,
                children: [
                  k,
                  "x"
                ]
              },
              k
            )) })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-size-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Billboard Height:" }),
            /* @__PURE__ */ s("div", { className: "building-ui-size-buttons", children: [-1, 0, 1, 2, 3, 4, 6].map((k) => /* @__PURE__ */ x(
              "button",
              {
                onClick: () => Gt(k),
                className: `building-ui-size-button ${Math.abs(pn - k) < 1e-4 ? "active" : ""}`,
                children: [
                  k,
                  "m"
                ]
              },
              k
            )) })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Text:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: jn,
                onChange: (k) => Vn(k.target.value),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Image URL:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: Zn,
                onChange: (k) => Yn(k.target.value),
                placeholder: "https://...",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ s(
                "input",
                {
                  type: "color",
                  value: cn,
                  onChange: (k) => un(k.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ s(
                "input",
                {
                  type: "text",
                  value: cn,
                  onChange: (k) => un(k.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Custom Size:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0.1",
                max: "10",
                step: "0.1",
                value: dn,
                onChange: (k) => fn(Number(k.target.value) || 1),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Custom Height:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "-4",
                max: "12",
                step: "0.1",
                value: pn,
                onChange: (k) => Gt(Number(k.target.value) || 0),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Panel Width:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0",
                max: "8",
                step: "0.1",
                value: Xn,
                onChange: (k) => Kn(Number(k.target.value) || 0),
                className: "building-ui-input"
              }
            ),
            /* @__PURE__ */ s("span", { className: "building-ui-help", children: "0 = image ratio auto" })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Panel Height:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0.3",
                max: "5",
                step: "0.1",
                value: qn,
                onChange: (k) => Qn(Number(k.target.value) || 1.5),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Post Height:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0",
                max: "8",
                step: "0.1",
                value: hn,
                onChange: (k) => mn(Number(k.target.value) || 0),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Brightness:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0",
                max: "8",
                step: "0.1",
                value: Jn,
                onChange: (k) => ei(Number(k.target.value) || 0),
                className: "building-ui-input"
              }
            )
          ] })
        ] }),
        se === "model" && /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "GLB URL:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: Pe,
                onChange: (k) => Ce(k.target.value),
                placeholder: "gltf/props/door.glb",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Scale:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "number",
                min: "0.1",
                max: "10",
                step: "0.1",
                value: Re,
                onChange: (k) => Oe(Number(k.target.value) || 1),
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ s(
                "input",
                {
                  type: "color",
                  value: xt,
                  onChange: (k) => nt(k.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ s(
                "input",
                {
                  type: "text",
                  value: xt,
                  onChange: (k) => nt(k.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ x("p", { children: [
            "Type: ",
            se === "model" ? Vt?.label : se
          ] }),
          se === "model" && /* @__PURE__ */ x(be, { children: [
            /* @__PURE__ */ x("p", { children: [
              "Fallback: ",
              Vt?.fallbackKind ?? "generic"
            ] }),
            /* @__PURE__ */ s("p", { children: "GLB URL이 비어 있으면 기본 프리미티브로 표시됩니다." })
          ] }),
          /* @__PURE__ */ s("p", { children: "Click to place objects" })
        ] })
      ] }),
      r === "wall" && /* @__PURE__ */ x(be, { children: [
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Category:" }),
          /* @__PURE__ */ s(
            "select",
            {
              value: C || "",
              onChange: (k) => I(k.target.value),
              className: "building-ui-select",
              children: ri.map((k) => /* @__PURE__ */ s("option", { value: k.id, children: k.name }, k.id))
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-category-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Type:" }),
          /* @__PURE__ */ s(
            "select",
            {
              value: Yt || "",
              onChange: (k) => {
                const pe = k.target.value;
                if (O) {
                  Y(O, pe);
                  return;
                }
                j.setState({ selectedWallGroupId: pe });
              },
              className: "building-ui-select",
              children: C && y.get(C)?.wallGroupIds.map((k) => {
                const pe = R.get(k);
                return pe ? /* @__PURE__ */ s("option", { value: pe.id, children: pe.name }, pe.id) : null;
              })
            }
          )
        ] }),
        /* @__PURE__ */ x(
          "button",
          {
            onClick: Oi,
            className: "building-ui-custom-toggle",
            children: [
              Ct ? "Hide" : "Show",
              " Custom Settings"
            ]
          }
        ),
        Ct && /* @__PURE__ */ x("div", { className: "building-ui-custom-settings", children: [
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Name:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: rt,
                onChange: (k) => ut(k.target.value),
                placeholder: "Custom Wall Name",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Color:" }),
            /* @__PURE__ */ x("div", { className: "building-ui-color-input", children: [
              /* @__PURE__ */ s(
                "input",
                {
                  type: "color",
                  value: Ye,
                  onChange: (k) => at(k.target.value),
                  className: "building-ui-color-picker"
                }
              ),
              /* @__PURE__ */ s(
                "input",
                {
                  type: "text",
                  value: Ye,
                  onChange: (k) => at(k.target.value),
                  className: "building-ui-input",
                  style: { width: "100px" }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ x("div", { className: "building-ui-input-group", children: [
            /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Texture URL:" }),
            /* @__PURE__ */ s(
              "input",
              {
                type: "text",
                value: je,
                onChange: (k) => Nt(k.target.value),
                placeholder: "https://...",
                className: "building-ui-input"
              }
            )
          ] }),
          /* @__PURE__ */ s(
            "button",
            {
              onClick: () => {
                if (P) {
                  const k = O ? dt(O) : R.get(P);
                  if (!k) return;
                  const Ve = (O ? k.walls.find((Lo) => Lo.id === O) : void 0)?.materialId ?? k.frontMeshId, ft = Zt(
                    Ve,
                    O ? `custom-wall-mesh-${O}` : su("custom-placement-wall-mesh")
                  );
                  if (O) {
                    V(k.id, O, { materialId: ft });
                    return;
                  }
                  E(ft);
                }
              },
              className: "building-ui-apply-button",
              children: "Apply Changes"
            }
          ),
          /* @__PURE__ */ s(
            "button",
            {
              onClick: () => {
                if (rt) {
                  const k = `custom-wall-${Date.now()}`, pe = `custom-mesh-${Date.now()}`;
                  if (U({
                    id: pe,
                    color: Ye,
                    material: "STANDARD",
                    ...je ? { mapTextureUrl: je } : {},
                    roughness: 0.7
                  }), J({
                    id: k,
                    name: rt,
                    frontMeshId: pe,
                    backMeshId: pe,
                    sideMeshId: pe,
                    walls: []
                  }), C) {
                    const Ve = y.get(C);
                    Ve && j.getState().updateWallCategory(C, {
                      wallGroupIds: [...Ve.wallGroupIds, k]
                    });
                  }
                  j.setState({ selectedWallGroupId: k }), ut("");
                }
              },
              className: "building-ui-create-button",
              children: "Create New Type"
            }
          )
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-direction-group", children: [
          /* @__PURE__ */ s("span", { className: "building-ui-label", children: "Wall Direction:" }),
          /* @__PURE__ */ x("div", { className: "building-ui-direction-buttons", children: [
            /* @__PURE__ */ s(
              "button",
              {
                onClick: () => _(0),
                className: `building-ui-direction-button ${g === 0 ? "active" : ""}`,
                title: "North",
                children: "↑"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                onClick: () => _(Math.PI / 2),
                className: `building-ui-direction-button ${g === Math.PI / 2 ? "active" : ""}`,
                title: "East",
                children: "→"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                onClick: () => _(Math.PI),
                className: `building-ui-direction-button ${g === Math.PI ? "active" : ""}`,
                title: "South",
                children: "↓"
              }
            ),
            /* @__PURE__ */ s(
              "button",
              {
                onClick: () => _(Math.PI * 1.5),
                className: `building-ui-direction-button ${g === Math.PI * 1.5 ? "active" : ""}`,
                title: "West",
                children: "←"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ x("div", { className: "building-ui-info", children: [
          /* @__PURE__ */ x("p", { children: [
            "Category: ",
            y.get(C || "")?.name
          ] }),
          /* @__PURE__ */ x("p", { children: [
            "Type: ",
            R.get(P || "")?.name
          ] }),
          /* @__PURE__ */ s("p", { children: "Use arrow keys to rotate" }),
          /* @__PURE__ */ s("p", { children: "Click to place walls" }),
          /* @__PURE__ */ s("p", { children: "Amber = Occupied, Blue = Available" }),
          /* @__PURE__ */ s("p", { children: "Click highlighted markers to delete" })
        ] })
      ] }),
      r === "npc" && It && (typeof n == "function" ? n({ editMode: "npc" }) : n),
      i
    ] }) : null })
  ] }) : null;
}
const GS = "gaesup.building", WS = "building.square", US = "building.placement", jS = "building", VS = "building.store";
function ZS(e = {}) {
  const t = e.id ?? GS, n = e.gridExtensionId ?? WS, i = e.placementExtensionId ?? US, o = e.saveExtensionId ?? jS, r = e.storeServiceId ?? VS;
  return {
    id: t,
    name: "GaeSup Building",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["building", "grid", "placement"],
    setup: (l) => {
      l.grid.register(n, Rp, t), l.placement.register(
        i,
        {
          adapter: Op,
          createEngine: $p,
          toEntries: Lp,
          blockToEntry: Fp,
          tileToEntry: zp,
          wallToEntry: Dp
        },
        t
      ), l.save.register(o, {
        key: o,
        serialize: () => j.getState().serialize(),
        hydrate: (c) => j.getState().hydrate(c)
      }, t), l.services.register(r, {
        useStore: j,
        getState: j.getState,
        setState: j.setState
      }, t), l.events.emit("building:ready", {
        pluginId: t,
        gridExtensionId: n,
        placementExtensionId: i,
        saveExtensionId: o,
        storeServiceId: r
      });
    },
    dispose(l) {
      l.grid.remove(n), l.placement.remove(i), l.save.remove(o), l.services.remove(r);
    }
  };
}
const BM = ZS();
export {
  US as $,
  kh as A,
  $i as B,
  xh as C,
  DS as D,
  Ix as E,
  BS as F,
  ex as G,
  FS as H,
  zS as I,
  $S as J,
  mx as K,
  uS as L,
  zh as M,
  w_ as N,
  Qf as O,
  Fh as P,
  su as Q,
  xM as R,
  Nx as S,
  sS as T,
  PM as U,
  Lh as V,
  gS as W,
  _o as X,
  Ks as Y,
  rf as Z,
  WS as _,
  wM as a,
  jS as a0,
  VS as a1,
  ZS as a2,
  BM as a3,
  hx as a4,
  Ue as a5,
  Rt as a6,
  st as a7,
  n_ as a8,
  If as a9,
  p_ as aA,
  h_ as aB,
  ci as aC,
  cp as aD,
  MS as aE,
  CS as aF,
  we as aG,
  Bh as aH,
  Dh as aI,
  _a as aJ,
  yM as aK,
  vM as aL,
  Z1 as aM,
  uf as aN,
  w1 as aO,
  S1 as aP,
  bM as aQ,
  Jo as aR,
  N1 as aS,
  wh as aT,
  vx as aU,
  Dx as aV,
  Hx as aW,
  Lx as aX,
  Fc as aY,
  qs as aZ,
  $x as a_,
  o_ as aa,
  r_ as ab,
  sl as ac,
  ll as ad,
  ul as ae,
  al as af,
  rl as ag,
  Mo as ah,
  cl as ai,
  ol as aj,
  No as ak,
  Io as al,
  So as am,
  il as an,
  Co as ao,
  Pr as ap,
  Br as aq,
  Tf as ar,
  l_ as as,
  c_ as at,
  e_ as au,
  t_ as av,
  lt as aw,
  Rr as ax,
  dl as ay,
  f_ as az,
  Ax as b,
  CM as c,
  MM as d,
  _M as e,
  Rx as f,
  Zc as g,
  ff as h,
  Tx as i,
  TM as j,
  c2 as k,
  EM as l,
  x2 as m,
  AM as n,
  S2 as o,
  Xf as p,
  ip as q,
  Ex as r,
  NM as s,
  IM as t,
  SM as u,
  xS as v,
  kM as w,
  LS as x,
  y_ as y,
  RS as z
};
