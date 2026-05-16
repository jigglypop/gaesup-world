import { jsx as V, Fragment as Yt, jsxs as We } from "react/jsx-runtime";
import { useRef as G, useEffect as W, useCallback as R, createContext as Qt, useContext as wt, useSyncExternalStore as Xe, useMemo as L, useState as en, forwardRef as vt, useImperativeHandle as tn, createElement as nn } from "react";
import { useGLTF as Le, useAnimations as rn } from "@react-three/drei";
import { useFrame as on, useGraph as St } from "@react-three/fiber";
import { RigidBody as sn, euler as an, CapsuleCollider as ln } from "@react-three/rapier";
import * as y from "three";
import { SkeletonUtils as Ct } from "three-stdlib";
import { l as Se, b as cn, D as un, A as Mt, M as It, u as K, B as xt, H as O, P as E, a as dn, c as ue, d as Tt, g as hn, V as Ye } from "./gaesupStore-x2iiDzsY.js";
import "reflect-metadata";
import { I as fn } from "./EventBus-Ck0Dwee2.js";
import { enableMapSet as gn } from "immer";
import { create as pn } from "zustand";
import { immer as mn } from "zustand/middleware/immer";
class yn {
  engines;
  snapshots;
  eventListeners;
  eventHandlers;
  middlewares;
  constructor() {
    this.engines = /* @__PURE__ */ new Map(), this.snapshots = /* @__PURE__ */ new Map(), this.eventListeners = /* @__PURE__ */ new Set(), this.eventHandlers = /* @__PURE__ */ new Map(), this.middlewares = [];
  }
  use(n) {
    this.middlewares.push(n);
  }
  emit(n) {
    const e = this.eventHandlers.get(n.type);
    e && e.forEach((o) => o(n));
    let r = 0;
    const i = () => {
      if (r < this.middlewares.length) {
        const o = this.middlewares[r++];
        o?.(n, i);
      }
    };
    i();
  }
  on(n, e) {
    return this.eventHandlers.has(n) || this.eventHandlers.set(n, /* @__PURE__ */ new Set()), this.eventHandlers.get(n).add(e), () => {
      this.eventHandlers.get(n)?.delete(e);
    };
  }
  register(n, ...e) {
    const r = this.buildEngine(n, ...e);
    if (!r) return;
    const i = this.engines.get(n);
    i !== r && (i && (i.dispose(), this.snapshots.delete(n)), this.engines.set(n, r), this.emit({
      type: "register",
      id: n,
      timestamp: Date.now(),
      data: { engine: r }
    }));
  }
  unregister(n) {
    const e = this.engines.get(n);
    e && (e.dispose(), this.engines.delete(n), this.snapshots.delete(n), this.emit({
      type: "unregister",
      id: n,
      timestamp: Date.now(),
      data: { engine: e }
    }));
  }
  getEngine(n) {
    return this.engines.get(n);
  }
  execute(n, e) {
    const r = this.getEngine(n);
    r && (this.emit({ type: "execute", id: n, timestamp: Date.now(), data: { command: e } }), this.executeCommand(r, e, n), this.notifyListeners(n));
  }
  snapshot(n) {
    const e = this.getEngine(n);
    if (!e) return null;
    const r = this.createSnapshot(e, n);
    return r && this.emit({ type: "snapshot", id: n, timestamp: Date.now(), data: { snapshot: r } }), r;
  }
  getCachedSnapshot(n) {
    return this.snapshots.get(n);
  }
  cacheSnapshot(n, e) {
    this.snapshots.set(n, e);
  }
  subscribe(n) {
    return this.eventListeners.add(n), () => this.eventListeners.delete(n);
  }
  notifyListeners(n) {
    if (this.eventListeners.size === 0) return;
    const e = this.snapshot(n);
    e && (this.cacheSnapshot(n, e), this.eventListeners.forEach((r) => r(e, n)));
  }
  getAllSnapshots() {
    const n = /* @__PURE__ */ new Map();
    return this.engines.forEach((e, r) => {
      const i = this.snapshot(r);
      i && n.set(r, i);
    }), n;
  }
  dispose() {
    this.engines.forEach((n) => n.dispose()), this.engines.clear(), this.snapshots.clear(), this.eventListeners.clear(), this.eventHandlers.clear(), this.middlewares = [];
  }
}
class Et extends yn {
  constructor() {
    super(), this.processMetrics(), this.processEventLog();
  }
  processMetrics() {
    const n = Object.getPrototypeOf(this);
    Reflect.getMetadata("enableMetrics", n);
  }
  processEventLog() {
    const n = Object.getPrototypeOf(this);
    Reflect.getMetadata("enableEventLog", n);
  }
}
function bn() {
  return function(...t) {
    if (t.length === 1) {
      const r = t[0];
      Reflect.defineMetadata("enableEventLog", !0, r.prototype);
      return;
    }
    const [n, e] = t;
    Reflect.defineMetadata("enableEventLog", !0, n, e);
  };
}
function Ke() {
  return function(t, n, e) {
    const r = e.value;
    return e.value = function(...i) {
      const o = performance.now(), s = r.apply(this, i), a = performance.now();
      return Se.log(
        `[${this.constructor.name}] ${n} snapshot processed in ${(a - o).toFixed(2)}ms`
      ), s;
    }, e;
  };
}
function Gt() {
  return function(t, n, e) {
    const r = e.value;
    return e.value = function(i, o, ...s) {
      if (!o || typeof o != "object") {
        Se.warn(`[${this.constructor.name}] Invalid command passed to ${n}`);
        return;
      }
      return r.apply(this, [i, o, ...s]);
    }, e;
  };
}
function xe() {
  return function(t, n, e) {
    const r = e.value;
    return e.value = function(...i) {
      const [o] = i;
      return o ? this.getEngine ? ((typeof o == "string" || typeof o == "number" || typeof o == "symbol" ? this.getEngine(o) : null) || Se.warn(`[${this.constructor.name}] No engine found for id: ${String(o)} in ${n}`), r.apply(this, i)) : r.apply(this, i) : (Se.warn(`[${this.constructor.name}] No id provided for ${n}`), r.apply(this, i));
    }, e;
  };
}
function Be(t = 16) {
  const n = /* @__PURE__ */ new Map();
  return function(e, r, i) {
    const o = i.value;
    return i.value = function(...s) {
      const a = s[0], c = typeof a == "object" && a !== null && "id" in a ? String(a.id) : String(a ?? "default"), l = `${this.constructor.name}_${r}_${c}`, h = Date.now(), d = n.get(l);
      if (d && h - d.timestamp < t)
        return d.value;
      const u = o.apply(this, s);
      return n.set(l, { value: u, timestamp: h }), u;
    }, i;
  };
}
function wn() {
  return function(t) {
    Reflect.defineMetadata("enableMetrics", !0, t.prototype);
  };
}
function At(t) {
  return function(n) {
    Reflect.defineMetadata("domain", t, n), cn.register(t, n), un.getInstance().registerService(n);
  };
}
function vn(t) {
  return function(n, e) {
    const r = Reflect.getMetadata("commands", n) || [];
    r.push({ name: t, method: e }), Reflect.defineMetadata("commands", r, n);
  };
}
var Sn = Object.getOwnPropertyDescriptor, Cn = (t, n, e, r) => {
  for (var i = r > 1 ? void 0 : r ? Sn(n, e) : n, o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = s(i) || i);
  return i;
};
let Ne = class extends Mt {
  callbacks;
  systemType;
  constructor(t = "default") {
    const n = {
      currentAnimation: "idle",
      animationMixer: null,
      actions: /* @__PURE__ */ new Map(),
      isPlaying: !1,
      currentWeight: 1,
      blendDuration: 0.3,
      lastUpdate: Date.now()
    }, e = {
      activeAnimations: 0,
      totalActions: 0,
      currentWeight: 1,
      mixerTime: 0,
      lastUpdate: 0,
      blendProgress: 0,
      frameTime: 0
    };
    super(n, e), this.callbacks = /* @__PURE__ */ new Set(), this.systemType = t;
  }
  getSystemType() {
    return this.systemType;
  }
  subscribe(t) {
    return this.callbacks.add(t), () => this.callbacks.delete(t);
  }
  notifyCallbacks() {
    this.callbacks.forEach((t) => t(this.getMetrics()));
  }
  initializeMixer(t) {
    this.state.animationMixer = new y.AnimationMixer(t);
  }
  addAnimation(t, n) {
    if (!this.state.animationMixer) return;
    const e = this.state.animationMixer.clipAction(n);
    this.state.actions.set(t, e), this.updateMetrics(0), this.notifyCallbacks();
  }
  registerAction(t, n) {
    this.state.actions.set(t, n), this.updateMetrics(0), this.notifyCallbacks();
  }
  playAnimation(t, n = this.state.blendDuration) {
    const e = this.state.actions.get(t);
    if (!e) return;
    const r = this.state.actions.get(this.state.currentAnimation);
    r && r !== e && r.fadeOut(n), e.reset().fadeIn(n).play(), this.state.currentAnimation = t, this.state.isPlaying = !0, this.updateMetrics(0), this.notifyCallbacks();
  }
  stopAnimation() {
    const t = this.state.actions.get(this.state.currentAnimation);
    t && t.stop(), this.state.isPlaying = !1, this.state.currentAnimation = "idle", this.updateMetrics(0), this.notifyCallbacks();
  }
  setWeight(t) {
    const n = this.state.actions.get(this.state.currentAnimation);
    n && (n.weight = t, this.state.currentWeight = t, this.updateMetrics(0), this.notifyCallbacks());
  }
  setTimeScale(t) {
    const n = this.state.actions.get(this.state.currentAnimation);
    n && (n.timeScale = t, this.notifyCallbacks());
  }
  // AbstractSystem의 추상 메서드 구현
  performUpdate(t) {
    this.state.animationMixer && (this.state.animationMixer.update(t.deltaTime / 1e3), this.metrics.mixerTime += t.deltaTime / 1e3);
  }
  createUpdateArgs(t) {
    return t;
  }
  // AnimationBridge에서 호출하는 update 메서드 (deltaTime 파라미터 유지)
  updateAnimation(t) {
    const n = {
      deltaTime: t * 1e3,
      // seconds to ms
      totalTime: 0,
      frameCount: 0
    };
    super.update(n), this.callbacks.size > 0 && this.notifyCallbacks();
  }
  getCurrentAnimation() {
    return this.state.currentAnimation;
  }
  getAnimationList() {
    return Array.from(this.state.actions.keys());
  }
  getMetrics() {
    return this.metrics;
  }
  getState() {
    return this.state;
  }
  updateMetrics(t) {
    this.metrics.frameTime = t;
    let n = 0;
    for (const e of this.state.actions.values())
      e.isRunning() && n++;
    this.metrics.activeAnimations = n, this.metrics.totalActions = this.state.actions.size, this.metrics.currentWeight = this.state.currentWeight, this.metrics.lastUpdate = Date.now();
  }
  clearActions() {
    this.state.actions.forEach((t) => {
      t.isRunning() && t.stop();
    }), this.state.actions.clear(), this.state.currentAnimation = "idle", this.state.isPlaying = !1, this.updateMetrics(0), this.notifyCallbacks();
  }
  onDispose() {
    this.state.animationMixer && (this.state.animationMixer.stopAllAction(), this.state.animationMixer = null), this.state.actions.clear(), this.callbacks.clear();
  }
};
Ne = Cn([
  It({ autoStart: !1 })
], Ne);
var Mn = Object.defineProperty, In = Object.getOwnPropertyDescriptor, ee = (t, n, e, r) => {
  for (var i = r > 1 ? void 0 : r ? In(n, e) : n, o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = (r ? s(n, e, i) : s(i)) || i);
  return r && i && Mn(n, e, i), i;
};
function Qe(t) {
  return t.replace(/[\x00-\x1F\x7F]/g, "").trim();
}
let Z = class extends Et {
  constructor() {
    super(), ["character", "vehicle", "airplane"].forEach((n) => {
      this.register(n);
    }), this.setupEngineSubscriptions();
  }
  setupEngineSubscriptions() {
    this.engines.forEach((t, n) => {
      t.subscribe(() => {
        this.notifyListeners(n);
      });
    });
  }
  buildEngine(t) {
    return new Ne(t);
  }
  registerAnimationAction(t, n, e) {
    const r = this.getEngine(t);
    if (r) {
      const i = Qe(n), o = i.length > 0 ? i : n;
      r.registerAction(o, e);
    }
  }
  registerAnimations(t, n) {
    const e = this.getEngine(t);
    e && Object.entries(n).forEach(([r, i]) => {
      if (i) {
        const o = Qe(r), s = o.length > 0 ? o : r;
        e.registerAction(s, i);
      }
    });
  }
  unregisterAnimations(t) {
    const n = this.getEngine(t);
    n && n.clearActions();
  }
  executeCommand(t, n) {
    switch (n.type) {
      case "play":
        n.animation && t.playAnimation(n.animation, n.duration);
        break;
      case "stop":
        t.stopAnimation();
        break;
      case "setWeight":
        n.weight !== void 0 && t.setWeight(n.weight);
        break;
      case "setSpeed":
        n.speed !== void 0 && t.setTimeScale(n.speed);
        break;
    }
  }
  // 60fps 캐싱
  createSnapshot(t) {
    const n = t.getState(), e = t.getMetrics();
    return {
      currentAnimation: n.currentAnimation,
      isPlaying: n.isPlaying,
      weight: n.currentWeight,
      speed: 1,
      availableAnimations: t.getAnimationList(),
      metrics: {
        activeAnimations: e.activeAnimations,
        totalActions: e.totalActions,
        mixerTime: e.mixerTime,
        lastUpdate: e.lastUpdate
      }
    };
  }
  getMetrics(t) {
    const n = this.getEngine(t);
    return n ? n.getMetrics() : null;
  }
  update(t, n) {
    const e = this.getEngine(t);
    e && e.updateAnimation(n);
  }
  execute(t, n) {
    super.execute(t, n);
  }
  snapshot(t) {
    const n = super.snapshot(t);
    return n || {
      currentAnimation: "idle",
      isPlaying: !1,
      weight: 0,
      speed: 1,
      availableAnimations: [],
      metrics: {
        activeAnimations: 0,
        totalActions: 0,
        mixerTime: 0,
        lastUpdate: 0
      }
    };
  }
};
ee([
  xe()
], Z.prototype, "registerAnimationAction", 1);
ee([
  xe()
], Z.prototype, "unregisterAnimations", 1);
ee([
  vn("play"),
  Gt()
], Z.prototype, "executeCommand", 1);
ee([
  Ke(),
  Be(16)
], Z.prototype, "createSnapshot", 1);
ee([
  xe()
], Z.prototype, "getMetrics", 1);
ee([
  xe()
], Z.prototype, "update", 1);
ee([
  Ke(),
  Be(16)
], Z.prototype, "snapshot", 1);
Z = ee([
  At("animation"),
  wn()
], Z);
let et = null;
function je() {
  const t = xt.getOrCreate("animation");
  return t || (et ??= new Z(), et);
}
function xn() {
  const t = G(null), n = K((h) => h.mode), e = K((h) => h.animationState), r = K((h) => h.setAnimation), i = je();
  t.current = i, W(() => {
    t.current = i;
    const h = i.subscribe((d, u) => {
      if (!d) return;
      const f = u, g = K.getState().animationState?.[f]?.current;
      d.currentAnimation !== g && r(f, d.currentAnimation);
    });
    return () => {
      h();
    };
  }, [r, i]);
  const o = R(
    (h, d) => {
      t.current && t.current.execute(h, d);
    },
    []
  ), s = R(
    (h, d) => {
      o(h, { type: "play", animation: d });
    },
    [o]
  ), a = R(
    (h) => {
      o(h, { type: "stop" });
    },
    [o]
  ), c = R(
    (h, d) => {
      t.current && t.current.registerAnimations(h, d);
    },
    []
  ), l = n?.type || "character";
  return {
    bridge: i,
    playAnimation: s,
    stopAnimation: a,
    executeCommand: o,
    registerAnimations: c,
    currentType: l,
    currentAnimation: e?.[l]?.current || "idle"
  };
}
var Tn = Object.defineProperty, En = Object.getOwnPropertyDescriptor, Gn = (t, n, e, r) => {
  for (var i = En(n, e), o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = s(n, e, i) || i);
  return i && Tn(n, e, i), i;
};
class Rt {
  animationBridge = je();
  lastAnimation = "idle";
  update(n) {
    const { isMoving: e, isRunning: r, isJumping: i, isFalling: o, isRiding: s } = n;
    let a = "idle";
    s ? a = "ride" : i ? a = "jump" : o ? a = "fall" : r ? a = "run" : e && (a = "walk"), a !== this.lastAnimation && (this.animationBridge.execute("character", {
      type: "play",
      animation: a
    }), this.lastAnimation = a);
  }
}
Gn([
  O(),
  E()
], Rt.prototype, "update");
var An = Object.defineProperty, Rn = Object.getOwnPropertyDescriptor, Te = (t, n, e, r) => {
  for (var i = Rn(n, e), o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = s(n, e, i) || i);
  return i && An(n, e, i), i;
};
class me {
  config;
  constructor(n) {
    this.config = n;
  }
  applyGravity(n, e) {
    if (!n.current) return;
    const { modeType: r } = e;
    switch (r) {
      case "character":
        this.applyCharacterGravity(n, e);
        break;
      case "airplane":
        this.applyAirplaneGravity(n);
        break;
      case "vehicle":
        this.applyVehicleGravity(n);
        break;
      default:
        this.applyCharacterGravity(n, e);
    }
  }
  applyCharacterGravity(n, e) {
    const {
      gameStates: { isJumping: r, isFalling: i }
    } = e, { jumpGravityScale: o = 1.5, normalGravityScale: s = 1 } = this.config;
    r || i ? n.current.setGravityScale(o, !1) : n.current.setGravityScale(s, !1);
  }
  applyAirplaneGravity(n) {
    const { gravityScale: e = 0.3 } = this.config;
    n.current.setGravityScale(e, !1);
  }
  applyVehicleGravity(n) {
    const { normalGravityScale: e = 1 } = this.config;
    n.current.setGravityScale(e, !1);
  }
}
Te([
  E()
], me.prototype, "applyGravity");
Te([
  E()
], me.prototype, "applyCharacterGravity");
Te([
  E()
], me.prototype, "applyAirplaneGravity");
Te([
  E()
], me.prototype, "applyVehicleGravity");
var zn = Object.defineProperty, kn = Object.getOwnPropertyDescriptor, He = (t, n, e, r) => {
  for (var i = kn(n, e), o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = s(n, e, i) || i);
  return i && zn(n, e, i), i;
};
const _n = 100, Oe = 1e3, Ae = 10;
function Dn() {
  const t = /* @__PURE__ */ new Map(), n = Array.from({ length: Ae }, () => new y.Vector3());
  return {
    getTempVector: (e) => {
      const r = n[e % Ae];
      return r ? r.set(0, 0, 0) : new y.Vector3();
    },
    getCached: (e, r) => {
      if (!t.has(e)) {
        if (t.size >= _n) {
          const i = t.keys().next().value;
          i !== void 0 && t.delete(i);
        }
        t.set(e, r());
      }
      return t.get(e);
    },
    clear: () => t.clear(),
    getStats: () => ({ cacheSize: t.size, tempVectorCount: Ae })
  };
}
const X = /* @__PURE__ */ new Map(), tt = (t) => {
  const n = Math.round(t * 100) / 100;
  if (!X.has(n)) {
    if (X.size >= Oe) {
      const e = X.keys().next().value;
      e !== void 0 && X.delete(e);
    }
    X.set(n, { sin: Math.sin(t), cos: Math.cos(t) });
  }
  return X.get(n);
}, Wn = () => X.clear(), Nn = () => ({
  size: X.size,
  maxSize: Oe,
  coverage: `${(X.size / Oe * 100).toFixed(1)}%`
}), nt = (t, n, e = 0.01) => Math.abs(t - n) >= e, Ee = class zt {
  static instance;
  vectorCaches = /* @__PURE__ */ new Map();
  static getInstance() {
    return this.instance ??= new zt();
  }
  getVectorCache(n) {
    return this.vectorCaches.get(n) ?? (this.vectorCaches.set(n, Dn()), this.vectorCaches.get(n));
  }
  clearAll() {
    this.vectorCaches.forEach((n) => n.clear()), Wn();
  }
  getStats() {
    return {
      vectorCaches: Array.from(this.vectorCaches.entries()).map(([n, e]) => ({
        id: n,
        ...e.getStats()
      })),
      trigCache: Nn()
    };
  }
};
He([
  E()
], Ee.prototype, "getVectorCache");
He([
  O()
], Ee.prototype, "clearAll");
He([
  dn(10)
], Ee.prototype, "getStats");
let On = Ee;
const v = {
  requestId: 0,
  waypoints: [],
  previewWaypoints: null,
  waypointIndex: 0,
  threshold: 1,
  shouldRun: !1,
  listeners: /* @__PURE__ */ new Set()
};
function Ge() {
  v.listeners.forEach((t) => t());
}
function rt() {
  return v.requestId += 1, v.requestId;
}
function it(t) {
  return v.requestId === t;
}
function ie(t, n, e) {
  v.waypoints = t, v.previewWaypoints = null, v.waypointIndex = 0, v.threshold = n, v.shouldRun = e, Ge();
}
function Pn(t) {
  v.waypoints = [], v.waypointIndex = 0, v.previewWaypoints = t, Ge();
}
function Re() {
  v.waypoints.length === 0 && v.waypointIndex === 0 && v.previewWaypoints === null || (v.waypoints = [], v.previewWaypoints = null, v.waypointIndex = 0, Ge());
}
function Ri(t) {
  return v.listeners.add(t), () => v.listeners.delete(t);
}
function zi() {
  return v.previewWaypoints ? v.previewWaypoints : v.waypointIndex === 0 ? v.waypoints : v.waypoints.slice(v.waypointIndex);
}
function Fn() {
  return v.waypointIndex < v.waypoints.length;
}
function Ln() {
  return {
    threshold: v.threshold,
    shouldRun: v.shouldRun
  };
}
function Kn(t) {
  const n = v.waypoints[v.waypointIndex];
  if (!n) return null;
  const e = t.x - n.x, r = t.z - n.z;
  if (e * e + r * r > v.threshold * v.threshold) return n;
  v.waypointIndex += 1;
  const i = v.waypoints[v.waypointIndex] ?? null;
  return i || (v.waypoints = [], v.previewWaypoints = null, v.waypointIndex = 0), Ge(), i;
}
var Bn = Object.defineProperty, jn = Object.getOwnPropertyDescriptor, ye = (t, n, e, r) => {
  for (var i = jn(n, e), o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = s(n, e, i) || i);
  return i && Bn(n, e, i), i;
};
class de {
  memoManager = On.getInstance();
  vectorCache = this.memoManager.getVectorCache("direction");
  lastEulerY = { character: 0, vehicle: 0, airplane: 0 };
  lastDirectionLength = 0;
  lastKeyboardState = {
    forward: !1,
    backward: !1,
    leftward: !1,
    rightward: !1
  };
  timers = /* @__PURE__ */ new Set();
  inputBackend;
  config;
  tempEuler = new y.Euler();
  tempQuaternion = new y.Quaternion();
  targetQuaternion = new y.Quaternion();
  cameraForward = new y.Vector3();
  cameraRight = new y.Vector3();
  desiredMovement = new y.Vector3();
  nextMousePosition = new y.Vector2();
  upAxis = new y.Vector3(0, 1, 0);
  constructor(n = {}, e = ue()) {
    this.inputBackend = e, this.config = n;
  }
  updateDirection(n, e, r, i) {
    const { modeType: o } = n;
    switch (o) {
      case "character":
        this.updateCharacterDirection(n, e, r);
        break;
      case "vehicle":
        this.updateVehicleDirection(n, e, r);
        break;
      case "airplane":
        this.updateAirplaneDirection(n, i, e, r);
        break;
      default:
        this.updateCharacterDirection(n, e, r);
    }
  }
  updateCharacterDirection(n, e, r) {
    const { activeState: i } = n, o = this.getKeyboard(r), s = this.getMouse(r), a = this.lastKeyboardState.forward !== o.forward || this.lastKeyboardState.backward !== o.backward || this.lastKeyboardState.leftward !== o.leftward || this.lastKeyboardState.rightward !== o.rightward, c = o.forward || o.backward || o.leftward || o.rightward;
    s.isActive ? this.handleMouseDirection(i, s, this.config, r) : c && this.handleKeyboardDirection(i, o, this.config, e, r), (a || c) && (this.lastKeyboardState = {
      forward: o.forward,
      backward: o.backward,
      leftward: o.leftward,
      rightward: o.rightward
    }), this.emitRotationUpdate(i, "character");
  }
  updateVehicleDirection(n, e, r) {
    const { activeState: i } = n, o = this.getKeyboard(r), { forward: s, backward: a, leftward: c, rightward: l } = o, h = Number(l) - Number(c), d = Number(s) - Number(a);
    i.euler.y -= h * (Math.PI / 64);
    const { sin: u, cos: f } = tt(i.euler.y);
    i.direction.set(u * d, 0, f * d), i.dir.copy(i.direction), this.emitRotationUpdate(i, "vehicle");
  }
  updateAirplaneDirection(n, e, r, i) {
    const { activeState: o } = n, s = this.getKeyboard(i), { forward: a, backward: c, leftward: l, rightward: h, shift: d, space: u } = s, {
      angleDelta: f = { x: 0.02, y: 0.02, z: 0.02 },
      maxAngle: g = { x: Math.PI / 6, y: Math.PI, z: Math.PI / 6 },
      accelRatio: p = 1.5
    } = this.config || {};
    if (!e?.current) return;
    let m = 1;
    d && (m *= p), u && (m *= 1.5);
    const I = Number(c) - Number(a), T = Number(l) - Number(h);
    r === "chase" ? o.euler.y += T * f.y * 0.5 : o.euler.y += T * f.y, this.applyAirplaneRotation(e.current, I, T, g, o), o.direction.set(
      Math.sin(o.euler.y) * m,
      -I * m,
      Math.cos(o.euler.y) * m
    ), o.dir.copy(o.direction).normalize(), this.emitRotationUpdate(o, "airplane");
  }
  getKeyboard(n) {
    return n?.inputRef?.current?.keyboard ?? this.inputBackend.getKeyboard();
  }
  getMouse(n) {
    return n?.inputRef?.current?.mouse ?? this.inputBackend.getMouse();
  }
  applyAirplaneRotation(n, e, r, i, o) {
    const s = i.x * e, a = -i.z * r, c = n.rotation.x, l = n.rotation.z, h = i.x, d = i.z;
    let u = c + s, f = l + a;
    u < -h ? u = -h : u > h && (u = h), f < -d ? f = -d : f > d && (f = d), o.euler.x = u, o.euler.z = f, this.tempEuler.set(u, 0, f), this.tempQuaternion.setFromEuler(n.rotation), this.targetQuaternion.setFromEuler(this.tempEuler), this.tempQuaternion.slerp(this.targetQuaternion, 0.2), n.setRotationFromQuaternion(this.tempQuaternion);
  }
  handleMouseDirection(n, e, r, i) {
    const o = this.vectorCache.getTempVector(0), s = i?.rigidBodyRef?.current;
    let a = !1;
    if (s) {
      const l = s.translation();
      o.set(l.x, l.y, l.z), a = !0;
    }
    this.syncClickNavigationTarget(
      e,
      i,
      a ? o : void 0
    );
    const { automation: c } = i?.worldContext || {};
    if (c?.settings.trackProgress && c.queue.actions && c.queue.actions.length > 0) {
      const l = c.queue.actions.shift();
      if (l && l.target) {
        const h = this.vectorCache.getTempVector(2), d = i?.rigidBodyRef?.current;
        if (d) {
          const g = d.translation();
          h.set(g.x, g.y, g.z);
        } else
          h.set(0, 0, 0);
        const u = l.target, f = this.vectorCache.getTempVector(1);
        f.subVectors(u, h).normalize(), i?.memo && (i.memo.direction || (i.memo.direction = new y.Vector3()), i.memo.directionTarget || (i.memo.directionTarget = new y.Vector3()), i.memo.direction.copy(f), i.memo.directionTarget.copy(u)), c.queue.loop && l && c.queue.actions && c.queue.actions.push(l);
      }
    } else {
      if (a) {
        const l = o.x - e.target.x, h = o.z - e.target.z;
        if (l * l + h * h < 1) {
          i && this.handleClicker(i, o);
          return;
        }
      }
      this.applyMouseRotation(n, e, r);
    }
  }
  syncClickNavigationTarget(n, e, r) {
    if (!Fn()) return;
    const i = this.vectorCache.getTempVector(3), o = r ? null : e?.rigidBodyRef?.current;
    if (r)
      i.copy(r);
    else if (o) {
      const u = o.translation();
      i.set(u.x, u.y, u.z);
    } else
      i.copy(e?.inputRef.current.mouse.target ?? n.target);
    const s = Kn(i), { shouldRun: a } = Ln();
    if (!s) {
      e?.setMouseInput?.({ isActive: !1, shouldRun: !1 }), n.isActive = !1, n.shouldRun = !1;
      return;
    }
    const c = Math.atan2(s.z - i.z, s.x - i.x), l = !n.target.equals(s), h = Math.abs(n.angle - c) > 1e-4, d = !n.isActive || n.shouldRun !== a;
    (l || h || d) && (this.nextMousePosition.set(s.x, s.z), e?.setMouseInput?.({
      target: s,
      angle: c,
      position: this.nextMousePosition,
      isActive: !0,
      shouldRun: a
    })), n.target = s, n.angle = c, n.isActive = !0, n.shouldRun = a;
  }
  handleClicker(n, e) {
    const { automation: r } = n.worldContext || {};
    if (r?.settings.trackProgress && r.queue.actions && r.queue.actions.length > 0) {
      const i = r.queue.actions.shift();
      if (i && i.target) {
        const o = Math.atan2(i.target.z - e.z, i.target.x - e.x);
        n.setMouseInput?.({ target: i.target, angle: o, isActive: !0 });
      } else if (i && i.type === "wait") {
        const o = i.duration || 1e3;
        if (n.state) {
          n.state.clock.stop();
          const s = setTimeout(() => {
            n.state && n.state.clock.start(), this.timers.delete(s);
          }, o);
          this.timers.add(s);
        }
      }
      r.queue.loop && i && r.queue.actions && r.queue.actions.push(i);
    } else
      n.setMouseInput?.({ isActive: !1, shouldRun: !1 });
  }
  applyMouseRotation(n, e, r) {
    n.euler.y = Math.PI / 2 - e.angle;
    const { sin: i, cos: o } = tt(n.euler.y);
    n.dir.set(-i, 0, -o), n.direction.copy(n.dir);
  }
  handleKeyboardDirection(n, e, r, i, o) {
    const s = this.resolveKeyboardMovementDirection(e, o);
    s && (n.dir.copy(s).multiplyScalar(-1), n.euler.y = Math.atan2(s.x, s.z), n.direction.copy(n.dir));
  }
  resolveKeyboardMovementDirection(n, e) {
    const r = Number(n.forward) - Number(n.backward), i = Number(n.rightward) - Number(n.leftward);
    if (r === 0 && i === 0)
      return null;
    const o = this.desiredMovement.set(0, 0, 0), s = e?.state?.camera;
    return s && (s.getWorldDirection(this.cameraForward), this.cameraForward.y = 0, this.cameraForward.lengthSq() > 1e-6 && (this.cameraForward.normalize(), this.cameraRight.crossVectors(this.cameraForward, this.upAxis).normalize(), o.addScaledVector(this.cameraForward, r), o.addScaledVector(this.cameraRight, i))), o.lengthSq() <= 1e-6 && o.set(i, 0, -r), o.normalize();
  }
  emitRotationUpdate(n, e) {
    const r = n.dir.length(), i = nt(n.euler.y, this.lastEulerY[e], 1e-3), o = nt(r, this.lastDirectionLength, 0.01);
    (i || o) && (this.lastDirectionLength = r), this.lastEulerY[e] = n.euler.y;
  }
  dispose() {
    this.timers.forEach((n) => clearTimeout(n)), this.timers.clear();
  }
}
ye([
  E()
], de.prototype, "updateDirection");
ye([
  E()
], de.prototype, "updateCharacterDirection");
ye([
  E()
], de.prototype, "updateVehicleDirection");
ye([
  E()
], de.prototype, "updateAirplaneDirection");
ye([
  O()
], de.prototype, "dispose");
let be = null;
function Hn(t) {
  return t.endsWith("/") ? t : `${t}/`;
}
function Un() {
  try {
    const t = globalThis.__GAESUP_WASM_BASE_URL__;
    if (t)
      return new URL("wasm/gaesup_core.wasm", Hn(t)).toString();
    if (typeof document < "u" && typeof document.baseURI == "string" && document.baseURI.length > 0)
      return new URL("wasm/gaesup_core.wasm", document.baseURI).toString();
  } catch {
  }
  return "/wasm/gaesup_core.wasm";
}
async function $n() {
  return typeof WebAssembly > "u" ? null : be || (be = (async () => {
    try {
      const t = Un(), n = await fetch(t);
      if (!n.ok) return null;
      const e = await n.arrayBuffer(), { instance: r } = await WebAssembly.instantiate(e, {}), i = r.exports;
      return !i || !(i.memory instanceof WebAssembly.Memory) || typeof i.alloc_f32 != "function" || typeof i.dealloc_f32 != "function" ? null : i;
    } catch {
      return null;
    }
  })(), be);
}
const Vn = {
  cellSize: 2,
  worldMinX: -200,
  worldMinZ: -200,
  worldMaxX: 200,
  worldMaxZ: 200,
  maxStepHeight: 1.1
}, qn = [
  [1, 0, 10],
  [-1, 0, 10],
  [0, 1, 10],
  [0, -1, 10],
  [1, 1, 14],
  [1, -1, 14],
  [-1, 1, 14],
  [-1, -1, 14]
], oe = 1e-6;
function Zn(t) {
  return !!(t && typeof t.alloc_u8 == "function" && typeof t.dealloc_u8 == "function" && typeof t.alloc_u32 == "function" && typeof t.dealloc_u32 == "function" && typeof t.astar_find_path == "function");
}
class Y {
  static instance = null;
  config;
  gridWidth;
  gridHeight;
  grid;
  costGrid;
  heightGrid;
  hasHeightData = !1;
  hasBlockedData = !1;
  wasm = null;
  ready = !1;
  gridPtr = 0;
  outPathPtr = 0;
  outCapacity = 512;
  traversalGridCacheLimit = 32;
  traversalGridCache = /* @__PURE__ */ new Map();
  traversalCostGridCache = /* @__PURE__ */ new WeakMap();
  constructor(n = {}) {
    this.config = { ...Vn, ...n };
    const { cellSize: e, worldMinX: r, worldMinZ: i, worldMaxX: o, worldMaxZ: s } = this.config;
    this.gridWidth = Math.ceil((o - r) / e), this.gridHeight = Math.ceil((s - i) / e);
    const a = this.gridWidth * this.gridHeight;
    this.grid = new Uint8Array(a).fill(1), this.costGrid = new Uint8Array(a).fill(1), this.heightGrid = new Float32Array(a);
  }
  static getInstance(n) {
    return Y.instance || (Y.instance = new Y(n)), Y.instance;
  }
  async init() {
    if (this.ready) return !0;
    const n = await $n();
    if (Zn(n)) {
      this.wasm = n;
      const e = this.gridWidth * this.gridHeight;
      this.gridPtr = this.wasm.alloc_u8(e), this.outPathPtr = this.wasm.alloc_u32(this.outCapacity * 2), this.syncGridToWasm();
    } else
      this.wasm = null;
    return this.ready = !0, !0;
  }
  syncGridToWasm() {
    this.syncToWasm(this.grid);
  }
  syncToWasm(n) {
    this.wasm && new Uint8Array(
      this.wasm.memory.buffer,
      this.gridPtr,
      this.gridWidth * this.gridHeight
    ).set(n);
  }
  cellIndex(n, e) {
    return e * this.gridWidth + n;
  }
  isGridCell(n, e) {
    return n >= 0 && n < this.gridWidth && e >= 0 && e < this.gridHeight;
  }
  setCell(n, e, r) {
    if (!this.isGridCell(n, e)) return;
    const i = this.cellIndex(n, e);
    this.grid[i] = r, this.costGrid[i] = r, r === 0 && (this.hasBlockedData = !0);
  }
  worldToGrid(n, e) {
    const { cellSize: r, worldMinX: i, worldMinZ: o } = this.config, s = Math.floor((n - i) / r), a = Math.floor((e - o) / r);
    return [
      Math.max(0, Math.min(s, this.gridWidth - 1)),
      Math.max(0, Math.min(a, this.gridHeight - 1))
    ];
  }
  gridToWorld(n, e, r) {
    const { cellSize: i, worldMinX: o, worldMinZ: s } = this.config;
    return [
      o + (n + 0.5) * i,
      r ?? this.heightGrid[this.cellIndex(n, e)] ?? 0,
      s + (e + 0.5) * i
    ];
  }
  resolveAgentFootprint(n = {}) {
    const e = Math.max(0, n.clearance ?? 0), r = Math.max(0, n.agentRadius ?? 0) + e, i = Math.max(r, Math.max(0, n.agentWidth ?? 0) * 0.5 + e), o = Math.max(r, Math.max(0, n.agentDepth ?? 0) * 0.5 + e);
    return {
      halfWidth: i,
      halfDepth: o,
      hasClearance: i > oe || o > oe
    };
  }
  getFootprintCacheKey(n) {
    return `${n.halfWidth.toFixed(4)}:${n.halfDepth.toFixed(4)}`;
  }
  invalidateTraversalCaches() {
    this.traversalGridCache.clear(), this.traversalCostGridCache = /* @__PURE__ */ new WeakMap();
  }
  getCellBounds(n, e) {
    const { cellSize: r, worldMinX: i, worldMinZ: o } = this.config, s = i + n * r, a = o + e * r;
    return {
      minX: s,
      maxX: s + r,
      minZ: a,
      maxZ: a + r
    };
  }
  footprintOverlapsBlockedCell(n, e, r) {
    const [i, , o] = this.gridToWorld(n, e, 0), s = i - r.halfWidth, a = i + r.halfWidth, c = o - r.halfDepth, l = o + r.halfDepth, h = Math.ceil(r.halfWidth / this.config.cellSize), d = Math.ceil(r.halfDepth / this.config.cellSize);
    for (let u = e - d; u <= e + d; u += 1)
      for (let f = n - h; f <= n + h; f += 1) {
        if (!this.isGridCell(f, u)) continue;
        const g = this.cellIndex(f, u);
        if (this.grid[g] !== 0) continue;
        const p = this.getCellBounds(f, u), m = a > p.minX + oe && s < p.maxX - oe, I = l > p.minZ + oe && c < p.maxZ - oe;
        if (m && I) return !0;
      }
    return !1;
  }
  canOccupyCell(n, e, r) {
    if (!this.isGridCell(n, e)) return !1;
    const i = this.cellIndex(n, e);
    return this.grid[i] === 0 ? !1 : r.hasClearance ? !this.footprintOverlapsBlockedCell(n, e, r) : !0;
  }
  createTraversalGrid(n) {
    if (!n.hasClearance) return this.grid;
    const e = this.getFootprintCacheKey(n), r = this.traversalGridCache.get(e);
    if (r) return r;
    const i = new Uint8Array(this.grid.length);
    for (let o = 0; o < this.gridHeight; o += 1)
      for (let s = 0; s < this.gridWidth; s += 1) {
        const a = this.cellIndex(s, o);
        i[a] = this.canOccupyCell(s, o, n) ? 1 : 0;
      }
    if (this.traversalGridCache.size >= this.traversalGridCacheLimit) {
      const o = this.traversalGridCache.keys().next().value;
      o && this.traversalGridCache.delete(o);
    }
    return this.traversalGridCache.set(e, i), i;
  }
  createTraversalCostGrid(n) {
    if (n === this.grid) return this.costGrid;
    const e = this.traversalCostGridCache.get(n);
    if (e) return e;
    const r = new Uint8Array(this.costGrid.length);
    for (let i = 0; i < r.length; i += 1)
      r[i] = n[i] === 0 ? 0 : this.costGrid[i] ?? 1;
    return this.traversalCostGridCache.set(n, r), r;
  }
  setBlocked(n, e, r, i) {
    this.setRegion(n, e, r, i, 0);
  }
  setWalkable(n, e, r, i) {
    this.setRegion(n, e, r, i, 1);
  }
  reset(n = 1) {
    const e = Math.max(0, Math.min(255, Math.round(n)));
    this.grid.fill(e === 0 ? 0 : 1), this.costGrid.fill(e), this.heightGrid.fill(0), this.hasHeightData = !1, this.hasBlockedData = e === 0, this.invalidateTraversalCaches();
  }
  setRegion(n, e, r, i, o) {
    const { cellSize: s, worldMinX: a, worldMinZ: c } = this.config, l = r / 2, h = i / 2, d = Math.floor((n - l - a) / s), u = Math.floor((e - h - c) / s), f = Math.ceil((n + l - a) / s), g = Math.ceil((e + h - c) / s);
    for (let p = u; p < g; p++)
      for (let m = d; m < f; m++)
        this.setCell(m, p, o);
    this.invalidateTraversalCaches();
  }
  setCost(n, e, r) {
    const [i, o] = this.worldToGrid(n, e), s = this.cellIndex(i, o), a = Math.max(0, Math.min(255, Math.round(r)));
    this.costGrid[s] = a, a === 0 && (this.grid[s] = 0, this.hasBlockedData = !0), this.invalidateTraversalCaches();
  }
  setHeight(n, e, r) {
    const [i, o] = this.worldToGrid(n, e);
    this.heightGrid[this.cellIndex(i, o)] = r, r !== 0 && (this.hasHeightData = !0), this.invalidateTraversalCaches();
  }
  setHeightRegion(n, e, r, i, o) {
    this.setHeightSampler(n, e, r, i, () => o);
  }
  setHeightSampler(n, e, r, i, o) {
    const { cellSize: s, worldMinX: a, worldMinZ: c } = this.config, l = r / 2, h = i / 2, d = Math.floor((n - l - a) / s), u = Math.floor((e - h - c) / s), f = Math.ceil((n + l - a) / s), g = Math.ceil((e + h - c) / s);
    for (let p = u; p < g; p++)
      for (let m = d; m < f; m++) {
        if (!this.isGridCell(m, p)) continue;
        const [I, , T] = this.gridToWorld(m, p, 0), _ = o(I, T);
        this.heightGrid[this.cellIndex(m, p)] = _, _ !== 0 && (this.hasHeightData = !0);
      }
    this.invalidateTraversalCaches();
  }
  sampleHeight(n, e) {
    const [r, i] = this.worldToGrid(n, e);
    return this.heightGrid[this.cellIndex(r, i)] ?? 0;
  }
  hasNavigationConstraints() {
    return this.hasBlockedData || this.hasHeightData;
  }
  setBlockedFromBox(n) {
    const e = new y.Vector3(), r = new y.Vector3();
    n.getCenter(e), n.getSize(r), this.setBlocked(e.x, e.z, r.x, r.z);
  }
  findPath(n, e, r, i, o, s = !1) {
    if (!this.ready) return [];
    const a = typeof o == "object" && o !== null ? o : {
      ...o !== void 0 ? { y: o } : {},
      weighted: s
    }, c = this.resolveAgentFootprint(a), l = a.y, h = a.weighted ?? s, [d, u] = this.worldToGrid(n, e), [f, g] = this.worldToGrid(r, i), p = this.createTraversalGrid(c), m = h ? this.createTraversalCostGrid(p) : this.costGrid;
    return this.wasm && !this.hasHeightData ? this.findPathWasm(d, u, f, g, l, h, p, m) : this.findPathJS(d, u, f, g, l, h, p, m);
  }
  findPathWasm(n, e, r, i, o, s, a, c) {
    const l = this.wasm;
    if (s && typeof l.astar_find_path_weighted != "function")
      return this.findPathJS(n, e, r, i, o, !0, a, c);
    s ? this.syncToWasm(c) : this.syncToWasm(a);
    const d = (s ? l.astar_find_path_weighted : l.astar_find_path)(
      this.gridPtr,
      this.gridWidth,
      this.gridHeight,
      n,
      e,
      r,
      i,
      this.outPathPtr,
      this.outCapacity
    );
    if (d === 0) return [];
    const u = new Uint32Array(l.memory.buffer, this.outPathPtr, d * 2), f = [];
    for (let g = 0; g < d; g++) {
      const p = u[g * 2], m = u[g * 2 + 1];
      p === void 0 || m === void 0 || f.push(this.gridToWorld(p, m, o));
    }
    return f;
  }
  findPathJS(n, e, r, i, o, s, a = this.grid, c = this.costGrid) {
    const l = this.gridWidth, h = this.gridHeight, d = a, u = l * h, f = this.cellIndex(n, e), g = this.cellIndex(r, i);
    if (d[f] === 0 || d[g] === 0) return [];
    if (f === g) return [this.gridToWorld(r, i, o)];
    const p = new Uint32Array(u).fill(4294967295), m = new Uint32Array(u).fill(4294967295), I = new Uint8Array(u);
    p[f] = 0;
    const T = [
      { f: this.octileH(n, e, r, i), idx: f }
    ];
    for (; T.length > 0; ) {
      let C = 0;
      for (let M = 1; M < T.length; M++) {
        const j = T[M], H = T[C];
        j && H && j.f < H.f && (C = M);
      }
      const B = T[C], x = T[T.length - 1];
      if (!B || !x) break;
      T[C] = x, T.pop();
      const w = B.idx;
      if (w === g) break;
      if (I[w]) continue;
      I[w] = 1;
      const A = w % l, b = w / l | 0, S = p[w];
      if (S !== void 0)
        for (const [M, j, H] of qn) {
          const P = A + M, U = b + j;
          if (P < 0 || U < 0 || P >= l || U >= h) continue;
          const F = this.cellIndex(P, U);
          if (I[F] || d[F] === 0 || !this.canStepBetween(w, F) || M !== 0 && j !== 0 && (d[b * l + P] === 0 || d[U * l + A] === 0 || !this.canStepBetween(w, this.cellIndex(P, b)) || !this.canStepBetween(w, this.cellIndex(A, U))))
            continue;
          const Ze = s ? Math.max(1, c[F] ?? 1) : 1, J = S + H * Ze, fe = p[F];
          fe !== void 0 && J < fe && (p[F] = J, m[F] = w, T.push({ f: J + this.octileH(P, U, r, i), idx: F }));
        }
    }
    if (p[g] === 4294967295) return [];
    const _ = [];
    let k = g;
    for (; k !== f; ) {
      _.push(this.gridToWorld(k % l, k / l | 0, o));
      const C = m[k];
      if (C === void 0) return [];
      if (k = C, k === 4294967295) return [];
    }
    return _.push(this.gridToWorld(n, e, o)), _.reverse(), _;
  }
  octileH(n, e, r, i) {
    const o = Math.abs(n - r), s = Math.abs(e - i);
    return Math.max(o, s) * 10 + Math.min(o, s) * 4;
  }
  canStepBetween(n, e) {
    return this.hasHeightData ? Math.abs((this.heightGrid[e] ?? 0) - (this.heightGrid[n] ?? 0)) <= this.config.maxStepHeight : !0;
  }
  hasLineOfSight(n, e, r, i, o = {}) {
    return this.canTraverseSegment(n, e, r, i, o);
  }
  canTraverseSegment(n, e, r, i, o = {}) {
    const s = r - n, a = i - e, c = Math.sqrt(s * s + a * a), l = Math.max(1, Math.ceil(c / (this.config.cellSize * 0.5))), h = this.resolveAgentFootprint(o);
    let d = -1, u = -1;
    for (let f = 0; f <= l; f++) {
      const g = f / l, [p, m] = this.worldToGrid(n + s * g, e + a * g);
      if (p === d && m === u) continue;
      const I = this.cellIndex(p, m);
      if (!(o.ignoreStart && f === 0) && !this.canOccupyCell(p, m, h) || d !== -1 && u !== -1 && !this.canStepBetween(this.cellIndex(d, u), I))
        return !1;
      d = p, u = m;
    }
    return !0;
  }
  smoothPath(n, e, r, i = {}) {
    if (n.length === 0) return [];
    const o = e ?? n[0], s = r ?? n[n.length - 1];
    if (!o || !s) return [];
    const a = [o], c = e ? 1 : 0, l = r ? n.length - 1 : n.length;
    for (let u = c; u < l; u++) {
      const f = n[u];
      f && a.push(f);
    }
    a.push(s);
    const h = [];
    let d = 0;
    for (h.push(a[d]); d < a.length - 1; ) {
      let u = a.length - 1;
      const f = a[d];
      for (; u > d + 1 && !this.hasLineOfSight(f[0], f[2], a[u][0], a[u][2], i); )
        u -= 1;
      h.push(a[u]), d = u;
    }
    return h;
  }
  simplifyPath(n) {
    if (n.length <= 2) return n;
    const e = n[0];
    if (!e) return [];
    const r = [e];
    for (let o = 1; o < n.length - 1; o++) {
      const s = r[r.length - 1], a = n[o], c = n[o + 1];
      if (!s || !a || !c) continue;
      const l = a[0] - s[0], h = a[2] - s[2], d = c[0] - a[0], u = c[2] - a[2];
      Math.abs(l * u - h * d) > 0.01 && r.push(a);
    }
    const i = n[n.length - 1];
    return i && r.push(i), r;
  }
  isWalkable(n, e, r = {}) {
    const [i, o] = this.worldToGrid(n, e);
    return this.canOccupyCell(i, o, this.resolveAgentFootprint(r));
  }
  getGridDimensions() {
    return { width: this.gridWidth, height: this.gridHeight, cellSize: this.config.cellSize };
  }
  dispose() {
    this.wasm && (this.gridPtr && this.wasm.dealloc_u8(this.gridPtr, this.gridWidth * this.gridHeight), this.outPathPtr && this.wasm.dealloc_u32(this.outPathPtr, this.outCapacity * 2)), Y.instance = null, this.ready = !1;
  }
}
var Jn = Object.defineProperty, Xn = Object.getOwnPropertyDescriptor, he = (t, n, e, r) => {
  for (var i = Xn(n, e), o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = s(n, e, i) || i);
  return i && Jn(n, e, i), i;
};
class te {
  refs;
  constructor() {
    this.refs = {
      activeState: {
        position: new y.Vector3(),
        quaternion: new y.Quaternion(),
        euler: new y.Euler(),
        velocity: new y.Vector3(),
        direction: new y.Vector3(),
        dir: new y.Vector3(),
        angular: new y.Vector3(),
        isGround: !1
      },
      gameStates: {
        canRide: !1,
        isRiding: !1,
        isJumping: !1,
        isFalling: !1,
        isMoving: !1,
        isRunning: !1,
        isNotMoving: !0,
        isNotRunning: !0,
        isOnTheGround: !0,
        nearbyRideable: void 0,
        currentRideable: void 0,
        rideableDistance: void 0
      }
    };
  }
  getActiveState() {
    return this.refs.activeState;
  }
  getGameStates() {
    return this.refs.gameStates;
  }
  getState() {
    return this.refs;
  }
  updateActiveState(n) {
    Object.assign(this.refs.activeState, n);
  }
  updateGameStates(n) {
    Object.assign(this.refs.gameStates, n);
  }
  resetActiveState() {
    this.refs.activeState.position.set(0, 0, 0), this.refs.activeState.quaternion.identity(), this.refs.activeState.euler.set(0, 0, 0), this.refs.activeState.velocity.set(0, 0, 0), this.refs.activeState.direction.set(0, 0, 0), this.refs.activeState.dir.set(0, 0, 0), this.refs.activeState.angular.set(0, 0, 0), this.refs.activeState.isGround = !1;
  }
  resetGameStates() {
    this.refs.gameStates.canRide = !1, this.refs.gameStates.isRiding = !1, this.refs.gameStates.isJumping = !1, this.refs.gameStates.isFalling = !1, this.refs.gameStates.isMoving = !1, this.refs.gameStates.isRunning = !1, this.refs.gameStates.isNotMoving = !0, this.refs.gameStates.isNotRunning = !0, this.refs.gameStates.isOnTheGround = !0, this.refs.gameStates.nearbyRideable = void 0, this.refs.gameStates.currentRideable = void 0, this.refs.gameStates.rideableDistance = void 0;
  }
  reset() {
    this.resetActiveState(), this.resetGameStates();
  }
  dispose() {
    this.reset();
  }
}
he([
  E()
], te.prototype, "updateActiveState");
he([
  E()
], te.prototype, "updateGameStates");
he([
  O()
], te.prototype, "resetActiveState");
he([
  O()
], te.prototype, "resetGameStates");
he([
  O()
], te.prototype, "reset");
he([
  O()
], te.prototype, "dispose");
var Yn = Object.defineProperty, Qn = Object.getOwnPropertyDescriptor, kt = (t, n, e, r) => {
  for (var i = Qn(n, e), o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = s(n, e, i) || i);
  return i && Yn(n, e, i), i;
};
class Ue {
  stateManager;
  inputBackend;
  config;
  scratchImpulse = { x: 0, y: 0, z: 0 };
  scratchLinvel = { x: 0, y: 0, z: 0 };
  navigation = Y.getInstance();
  constructor(n, e, r = ue()) {
    this.stateManager = e ?? new te(), this.inputBackend = r, this.config = n;
  }
  applyImpulse(n, e, r) {
    if (!n.current) return;
    const { modeType: i } = e;
    switch (i) {
      case "character":
        this.applyCharacterImpulse(n, e, r);
        break;
      case "vehicle":
        this.applyVehicleImpulse(n, e, r);
        break;
      case "airplane":
        this.applyAirplaneImpulse(n, e);
        break;
      default:
        this.applyCharacterImpulse(n, e, r);
    }
  }
  applyCharacterImpulse(n, e, r) {
    const {
      gameStates: { isMoving: i, isRunning: o, isOnTheGround: s, isJumping: a },
      activeState: c
    } = e, { walkSpeed: l = 10, runSpeed: h = 20, jumpSpeed: d = 15 } = this.config;
    if (a && s) {
      const u = n.current.linvel();
      this.scratchLinvel.x = u.x, this.scratchLinvel.y = d, this.scratchLinvel.z = u.z, n.current.setLinvel(this.scratchLinvel, !0), this.stateManager.updateGameStates({
        isOnTheGround: !1
      });
    }
    if (i) {
      const u = o ? h : l, f = c.dir, g = c.velocity, p = n.current.mass(), m = -f.x * u, I = -f.z * u;
      if (!e.mouse.isActive && !this.canMoveForward(n.current, m, I, r)) {
        this.scratchLinvel.x = 0, this.scratchLinvel.y = n.current.linvel().y, this.scratchLinvel.z = 0, n.current.setLinvel(this.scratchLinvel, !0);
        return;
      }
      const T = m - g.x, _ = I - g.z;
      this.scratchImpulse.x = T * p, this.scratchImpulse.y = 0, this.scratchImpulse.z = _ * p, n.current.applyImpulse(this.scratchImpulse, !0);
    }
  }
  canMoveForward(n, e, r, i) {
    if (!this.navigation.hasNavigationConstraints()) return !0;
    const o = Math.sqrt(e * e + r * r);
    if (o <= 1e-4 || typeof n.translation != "function") return !0;
    const s = n.translation(), { cellSize: a } = this.navigation.getGridDimensions(), c = Math.max(0.45, Math.min(a * 0.75, o * 0.08)), l = e / o, h = r / o, d = s.x + l * c, u = s.z + h * c, f = Math.max(
      0,
      i?.colliderSize?.radius ?? this.config.navigationAgentRadius ?? 0.35
    );
    return this.navigation.canTraverseSegment(s.x, s.z, d, u, {
      agentRadius: f,
      ignoreStart: !0
    });
  }
  applyVehicleImpulse(n, e, r) {
    const { activeState: i } = e, o = this.getKeyboard(r), { maxSpeed: s = 10, accelRatio: a = 2 } = this.config, c = o.shift && !e.mouse.isLookAround, l = n.current.linvel(), h = Math.max(0, s);
    if (l.x * l.x + l.z * l.z < h * h) {
      const u = n.current.mass(), f = c ? a : 1;
      this.scratchImpulse.x = i.dir.x * u * f, this.scratchImpulse.y = 0, this.scratchImpulse.z = i.dir.z * u * f, n.current.applyImpulse(this.scratchImpulse, !0);
    }
  }
  applyAirplaneImpulse(n, e) {
    const { activeState: r } = e, { maxSpeed: i = 20 } = this.config, o = n.current.linvel(), s = Math.max(0, i);
    if (o.x * o.x + o.y * o.y + o.z * o.z < s * s) {
      const c = n.current.mass();
      this.scratchImpulse.x = r.direction.x * c, this.scratchImpulse.y = r.direction.y * c, this.scratchImpulse.z = r.direction.z * c, n.current.applyImpulse(this.scratchImpulse, !0);
    }
  }
  getKeyboard(n) {
    return n?.inputRef?.current?.keyboard ?? this.inputBackend.getKeyboard();
  }
}
kt([
  E()
], Ue.prototype, "applyImpulse");
kt([
  E()
], Ue.prototype, "applyCharacterImpulse");
var er = Object.defineProperty, tr = Object.getOwnPropertyDescriptor, N = (t, n, e, r) => {
  for (var i = r > 1 ? void 0 : r ? tr(n, e) : n, o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = (r ? s(n, e, i) : s(i)) || i);
  return r && i && er(n, e, i), i;
};
const nr = {
  isJumping: !1,
  isMoving: !1,
  isRunning: !1,
  lastUpdate: 0
}, rr = {
  forcesApplied: 0,
  dampingChanges: 0,
  frameTime: 0
}, ot = 0.75, st = 0.25, ir = 0.025, or = 3, sr = 1.2, ar = 0.35, lr = -0.25;
function cr(t) {
  const n = t;
  return n.calcProp !== void 0 && n.physicsState !== void 0;
}
let D = class extends Mt {
  directionComponent;
  impulseComponent;
  gravityComponent;
  animationController = new Rt();
  forceComponents = [];
  keyStateCache = /* @__PURE__ */ new Map();
  isCurrentlyJumping = !1;
  lastJumpPressed = !1;
  lastMovingState = !1;
  lastRunningState = !1;
  lastPositionY = 0;
  groundStableCount = 0;
  lastGroundedY = null;
  tempQuaternion = new y.Quaternion();
  tempEuler = new y.Euler();
  tempVector = new y.Vector3();
  jumpScratch = new y.Vector3();
  config;
  constructor(t, n = {}, e) {
    super(nr, rr, n), this.config = t, this.directionComponent = new de(this.config), this.impulseComponent = new Ue(this.config, e), this.gravityComponent = new me(this.config);
  }
  updateConfig(t) {
    this.config = { ...this.config, ...t };
  }
  performUpdate(t) {
    this.calculate(t.calcProp, t.physicsState);
  }
  createUpdateArgs(t) {
    if (cr(t))
      return t;
    throw new Error("PhysicsSystem requires updateWithArgs().");
  }
  updateMetrics(t) {
    this.state.isJumping = this.isCurrentlyJumping, this.state.isMoving = this.lastMovingState, this.state.isRunning = this.lastRunningState;
  }
  updateWithArgs(t) {
    this.performUpdateWithArgs(t);
  }
  calculate(t, n) {
    if (!n || !t.rigidBodyRef.current) return;
    if (t.worldContext?.cameraOption?.focus === !0) {
      this.freezeInput(n), this.checkGround(t, n), this.animationController.update(n.gameStates);
      return;
    }
    const r = t.rigidBodyRef.current.linvel();
    n.activeState.velocity.set(
      r.x,
      r.y,
      r.z
    ), this.checkAllStates(t, n), this.animationController.update(n.gameStates);
    const { modeType: o = "character" } = n;
    switch (o) {
      case "character":
        this.calculateCharacter(t, n);
        break;
      case "vehicle":
        this.calculateVehicle(t, n);
        break;
      case "airplane":
        this.calculateAirplane(t, n);
        break;
    }
  }
  checkAllStates(t, n) {
    const e = t.rigidBodyRef.current?.handle ?? -1;
    this.checkGround(t, n), this.checkMoving(n), this.checkRiding(e, n);
  }
  checkGround(t, n) {
    const { rigidBodyRef: e } = t, r = n.gameStates, i = n.activeState;
    if (!e.current) {
      r.isOnTheGround = !1, r.isFalling = !0;
      return;
    }
    const o = e.current.linvel(), s = e.current.translation(), a = Math.abs(o.y), c = Math.abs(s.y - this.lastPositionY), l = o.y > 0.02, h = s.y <= ot, d = this.lastGroundedY !== null && Math.abs(s.y - this.lastGroundedY) <= ot, u = h || d, f = r.isJumping || n.keyboard.space, g = d && !f && a < sr && c < ar;
    !l && u && a < st && c < ir ? this.groundStableCount = Math.min(this.groundStableCount + 1, 5) : this.groundStableCount = 0, this.lastPositionY = s.y;
    const m = u && !l && a < st || g || this.groundStableCount >= or, I = !m && o.y < lr;
    m && (this.lastGroundedY = s.y, this.resetJumpState(n)), r.isOnTheGround = m, r.isFalling = I, this.copyVector3(i.position, s), this.copyVector3(i.velocity, o);
  }
  checkMoving(t) {
    const n = t.gameStates, e = t.keyboard, r = t.mouse, { shift: i, space: o, forward: s, backward: a, leftward: c, rightward: l } = e, h = s || a || c || l, d = h || r.isActive, u = h && i && !r.isLookAround || r.isActive && r.shouldRun;
    t.modeType === "character" && o && !this.lastJumpPressed && n.isOnTheGround && !this.isCurrentlyJumping && (this.isCurrentlyJumping = !0, n.isJumping = !0), this.lastJumpPressed = o, this.updateStateIfChanged("isMoving", d, () => {
      this.lastMovingState = d, n.isMoving = d, n.isNotMoving = !d;
    }), this.updateStateIfChanged("isRunning", u, () => {
      this.lastRunningState = u, n.isRunning = u, n.isNotRunning = !u;
    });
  }
  checkRiding(t = -1, n) {
    const e = n.keyboard;
    this.keyStateCache.has(t) || this.keyStateCache.set(t, { lastKeyE: !1, lastKeyR: !1 });
    const r = this.keyStateCache.get(t), i = e.keyE, o = n.gameStates;
    i && !r.lastKeyE && (o.canRide && !o.isRiding || o.isRiding), r.lastKeyE = i, r.lastKeyR = !1;
  }
  freezeInput(t) {
    const n = t.gameStates;
    n.isMoving = !1, n.isNotMoving = !0, n.isRunning = !1, n.isNotRunning = !0, n.isJumping = !1, this.isCurrentlyJumping = !1, this.lastJumpPressed = t.keyboard.space, this.lastMovingState = !1, this.lastRunningState = !1;
  }
  resetJumpState(t) {
    this.isCurrentlyJumping = !1, t.gameStates.isJumping = !1;
  }
  calculateCharacter(t, n) {
    const { rigidBodyRef: e, innerGroupRef: r } = t;
    if (this.directionComponent.updateDirection(n, "normal", t), this.impulseComponent.applyImpulse(e, n, t), this.gravityComponent.applyGravity(e, n), this.updateForces(e, n.delta ?? 0), e?.current) {
      const i = n.gameStates, o = n.activeState, { isJumping: s, isFalling: a, isNotMoving: c } = i, {
        linearDamping: l = 0.9,
        airDamping: h = 0.2,
        stopDamping: d = 1
      } = this.config;
      e.current.setLinearDamping(
        s || a ? h : c ? l * d : l
      ), e.current.setEnabledRotations(!1, !1, !1, !1), r?.current && r.current.quaternion.setFromEuler(o.euler);
    }
  }
  calculateVehicle(t, n) {
    const { rigidBodyRef: e, innerGroupRef: r } = t;
    if (this.directionComponent.updateDirection(n, "normal", t), this.impulseComponent.applyImpulse(e, n, t), this.applyDamping(e, n), this.updateForces(e, n.delta ?? 0), e?.current) {
      const i = n.activeState;
      e.current.setEnabledRotations(!1, !0, !1, !1), this.tempEuler.set(0, i.euler.y, 0), this.tempQuaternion.setFromEuler(this.tempEuler), e.current.setRotation(this.tempQuaternion, !0), r?.current && (r.current.rotation.y = 0);
    }
  }
  calculateAirplane(t, n) {
    const { rigidBodyRef: e, innerGroupRef: r } = t;
    if (this.directionComponent.updateDirection(
      n,
      "normal",
      t,
      r
    ), this.impulseComponent.applyImpulse(e, n, t), this.gravityComponent.applyGravity(e, n), this.applyDamping(e, n), this.updateForces(e, n.delta ?? 0), e?.current) {
      e.current.setEnabledRotations(!1, !1, !1, !1);
      const i = n.activeState;
      this.tempEuler.set(0, i.euler.y, 0), this.tempQuaternion.setFromEuler(this.tempEuler), e.current.setRotation(this.tempQuaternion, !0);
    }
  }
  applyDamping(t, n) {
    if (!t?.current || !n) return;
    const { modeType: e, keyboard: r } = n, { space: i } = r;
    if (e === "vehicle") {
      const { linearDamping: o = 0.9, brakeRatio: s = o } = this.config, a = i ? s : o;
      t.current.setLinearDamping(a);
    } else if (e === "airplane") {
      const { linearDamping: o = 0.2 } = this.config;
      t.current.setLinearDamping(o);
    }
  }
  addForceComponent(t) {
    this.forceComponents.push(t);
  }
  applyForce(t, n) {
    if (!n) return;
    const e = n.linvel();
    this.tempVector.set(
      e.x + t.x,
      e.y + t.y,
      e.z + t.z
    ), n.setLinvel(this.tempVector, !0);
  }
  calculateMovement(t, n, e, r, i) {
    const o = (i ?? new y.Vector3()).set(0, 0, 0), s = t.shift && !t.isLookAround, a = s ? 2 : 1, c = (n.maxSpeed ?? 10) * a;
    return t.forward && (o.z += 1), t.backward && (o.z -= 1), t.leftward && (o.x += 1), t.rightward && (o.x -= 1), o.length() > 0 && (o.normalize().multiplyScalar(c * r), e.isRunning = s, e.isNotRunning = !s), o;
  }
  calculateJump(t, n, e) {
    return e ? (n.isJumping = !0, this.jumpScratch.set(0, t.jumpSpeed ?? 0, 0)) : this.jumpScratch.set(0, 0, 0);
  }
  updateForces(t, n) {
    if (!t.current || this.forceComponents.length === 0) return;
    const e = t.current;
    for (let r = 0, i = this.forceComponents.length; r < i; r++) {
      const o = this.forceComponents[r];
      o && o.update(e, n);
    }
  }
  /**
   * Vector3 헬퍼 - 한 벡터를 다른 벡터로 복사
   */
  copyVector3(t, n) {
    t.set(n.x, n.y, n.z);
  }
  onDispose() {
    this.directionComponent.dispose(), this.forceComponents = [], this.keyStateCache.clear(), this.groundStableCount = 0, this.lastGroundedY = null, this.lastJumpPressed = !1;
  }
  /**
   * 조건부 상태 업데이트 - 변경된 경우에만 업데이트
   */
  updateStateIfChanged(t, n, e) {
    return this.state[t] !== n ? (this.state[t] = n, e?.(), !0) : !1;
  }
};
N([
  O()
], D.prototype, "updateConfig", 1);
N([
  E()
], D.prototype, "performUpdate", 1);
N([
  E()
], D.prototype, "updateMetrics", 1);
N([
  O(),
  E()
], D.prototype, "calculate", 1);
N([
  E()
], D.prototype, "checkAllStates", 1);
N([
  E()
], D.prototype, "checkGround", 1);
N([
  E()
], D.prototype, "checkMoving", 1);
N([
  O(),
  E()
], D.prototype, "calculateCharacter", 1);
N([
  O(),
  E()
], D.prototype, "calculateVehicle", 1);
N([
  O(),
  E()
], D.prototype, "calculateAirplane", 1);
N([
  E()
], D.prototype, "applyDamping", 1);
N([
  O()
], D.prototype, "applyForce", 1);
N([
  O(),
  E()
], D.prototype, "calculateMovement", 1);
N([
  O()
], D.prototype, "calculateJump", 1);
N([
  E()
], D.prototype, "updateForces", 1);
D = N([
  It({ autoStart: !1 })
], D);
var ur = Object.defineProperty, dr = Object.getOwnPropertyDescriptor, $e = (t, n, e, r) => {
  for (var i = r > 1 ? void 0 : r ? dr(n, e) : n, o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = (r ? s(n, e, i) : s(i)) || i);
  return r && i && ur(n, e, i), i;
};
let re = class extends Et {
  buildEngine(t, n, e) {
    const r = new D(n, {}, e);
    return { system: r, dispose: () => r.dispose() };
  }
  executeCommand(t, n, e) {
    switch (n.type) {
      case "updateConfig":
        t.system.updateConfig(n.data);
        break;
    }
  }
  // 60fps 캐싱
  createSnapshot(t) {
    return {
      ...t.system.getState(),
      metrics: { ...t.system.getMetrics() }
    };
  }
  updateEntity(t, n) {
    const e = this.getEngine(t);
    e && (e.system.updateWithArgs(n), this.notifyListeners(t));
  }
};
$e([
  Gt()
], re.prototype, "executeCommand", 1);
$e([
  Ke(),
  Be(16)
], re.prototype, "createSnapshot", 1);
re = $e([
  At("physics"),
  bn()
], re);
const Ve = Qt({
  runtime: null,
  revision: 0
});
function ki({
  runtime: t = null,
  revision: n = 0,
  children: e
}) {
  return /* @__PURE__ */ V(Ve.Provider, { value: { runtime: t, revision: n }, children: e });
}
function _t() {
  return wt(Ve).runtime;
}
function Dt() {
  return wt(Ve).revision;
}
let ze = null;
const Pe = /* @__PURE__ */ new Set();
function Wt() {
  return ze || (ze = new te()), ze;
}
const at = (t) => (Pe.add(t), () => {
  Pe.delete(t);
}), we = () => {
  Pe.forEach((t) => t());
};
function Nt() {
  const t = G(null);
  t.current || (t.current = Wt());
  const n = Xe(
    at,
    () => t.current.getActiveState(),
    () => t.current.getActiveState()
  ), e = Xe(
    at,
    () => t.current.getGameStates(),
    () => t.current.getGameStates()
  ), r = R((a) => {
    t.current?.updateActiveState(a), we();
  }, []), i = R((a) => {
    t.current?.updateGameStates(a), we();
  }, []), o = R(() => {
    t.current?.resetActiveState(), we();
  }, []), s = R(() => {
    t.current?.resetGameStates(), we();
  }, []);
  return W(() => () => {
    t.current = null;
  }, []), {
    activeState: n,
    gameStates: e,
    updateActiveState: r,
    updateGameStates: i,
    resetActiveState: o,
    resetGameStates: s
  };
}
const _i = [
  { type: "none", labelEn: "None", labelKo: "없음" },
  { type: "snow", labelEn: "Snow", labelKo: "눈" },
  { type: "rain", labelEn: "Rain", labelKo: "비" },
  { type: "storm", labelEn: "Storm", labelKo: "폭풍" },
  { type: "wind", labelEn: "Wind", labelKo: "바람" }
], Di = [
  { type: "solid", labelEn: "Solid", labelKo: "일반벽" },
  { type: "window", labelEn: "Window", labelKo: "창문벽" },
  { type: "door", labelEn: "Door", labelKo: "문벽" },
  { type: "arch", labelEn: "Arch", labelKo: "아치" },
  { type: "half", labelEn: "Half Wall", labelKo: "반벽" },
  { type: "railing", labelEn: "Railing", labelKo: "난간" },
  { type: "glass", labelEn: "Glass Wall", labelKo: "유리벽" }
], Fe = {
  flag: { label: "Flag", defaultWidth: 1.5, defaultHeight: 1, windStrength: 1, poleType: "side" },
  banner: { label: "Banner", defaultWidth: 1.2, defaultHeight: 3, windStrength: 0.3, poleType: "top" },
  panel: { label: "Panel", defaultWidth: 2, defaultHeight: 1.5, windStrength: 0, poleType: "frame" },
  placard: { label: "Placard", defaultWidth: 4, defaultHeight: 1, windStrength: 0.5, poleType: "both" }
}, lt = [
  { id: "brick-house", categoryId: "exterior-walls", categoryName: "Exterior Walls", labelEn: "Brick House", labelKo: "벽돌집", exteriorColor: "#8b4a34", interiorColor: "#eadfce", sideColor: "#6f3b2c", defaultKind: "solid", roughness: 0.82 },
  { id: "plaster-house", categoryId: "interior-walls", categoryName: "Interior Walls", labelEn: "Plaster Room", labelKo: "석고 내벽", exteriorColor: "#d7d0bf", interiorColor: "#f2eadc", sideColor: "#b6ac9a", defaultKind: "solid", roughness: 0.86 },
  { id: "wood-cabin", categoryId: "exterior-walls", categoryName: "Exterior Walls", labelEn: "Wood Cabin", labelKo: "나무집", exteriorColor: "#8a5a36", interiorColor: "#c8a174", sideColor: "#6f4529", defaultKind: "solid", roughness: 0.74 },
  { id: "stone-cottage", categoryId: "exterior-walls", categoryName: "Exterior Walls", labelEn: "Stone Cottage", labelKo: "돌집", exteriorColor: "#79766d", interiorColor: "#d5ceb9", sideColor: "#56544e", defaultKind: "solid", roughness: 0.9 },
  { id: "modern-concrete", categoryId: "exterior-walls", categoryName: "Exterior Walls", labelEn: "Modern Concrete", labelKo: "모던 콘크리트", exteriorColor: "#858a8c", interiorColor: "#e8e8e3", sideColor: "#64686a", defaultKind: "solid", roughness: 0.8 },
  { id: "shopfront", categoryId: "special-walls", categoryName: "Special Walls", labelEn: "Shopfront", labelKo: "상점 전면", exteriorColor: "#4b5563", interiorColor: "#e5dcc9", sideColor: "#374151", defaultKind: "window", roughness: 0.48, metalness: 0.08 },
  { id: "glass-office", categoryId: "special-walls", categoryName: "Special Walls", labelEn: "Glass Office", labelKo: "유리 오피스", exteriorColor: "#8ecae6", interiorColor: "#d8f2ff", sideColor: "#4b6470", defaultKind: "glass", roughness: 0.16, metalness: 0.03 },
  { id: "garden-fence", categoryId: "special-walls", categoryName: "Special Walls", labelEn: "Garden Fence", labelKo: "정원 울타리", exteriorColor: "#7a5a3a", interiorColor: "#9b7653", sideColor: "#5d422c", defaultKind: "railing", roughness: 0.78 }
], ct = [
  { id: "oak-planks", categoryId: "wood-floors", categoryName: "Wood Floors", labelEn: "Oak Planks", labelKo: "오크 판자", color: "#8b5a2b", roughness: 0.58 },
  { id: "pine-planks", categoryId: "wood-floors", categoryName: "Wood Floors", labelEn: "Pine Planks", labelKo: "소나무 판자", color: "#b88952", roughness: 0.62 },
  { id: "walnut-planks", categoryId: "wood-floors", categoryName: "Wood Floors", labelEn: "Walnut Planks", labelKo: "월넛 판자", color: "#4b2f22", roughness: 0.64 },
  { id: "bamboo-floor", categoryId: "wood-floors", categoryName: "Wood Floors", labelEn: "Bamboo Floor", labelKo: "대나무 바닥", color: "#c2a15b", roughness: 0.55 },
  { id: "herringbone-wood", categoryId: "wood-floors", categoryName: "Wood Floors", labelEn: "Herringbone", labelKo: "헤링본 목재", color: "#9a6a3a", roughness: 0.5 },
  { id: "white-marble", categoryId: "stone-floors", categoryName: "Stone Floors", labelEn: "White Marble", labelKo: "화이트 대리석", color: "#f0f0ec", roughness: 0.22, metalness: 0.05 },
  { id: "black-marble", categoryId: "stone-floors", categoryName: "Stone Floors", labelEn: "Black Marble", labelKo: "블랙 대리석", color: "#25252a", roughness: 0.2, metalness: 0.08 },
  { id: "granite", categoryId: "stone-floors", categoryName: "Stone Floors", labelEn: "Granite", labelKo: "화강암", color: "#77746f", roughness: 0.42, metalness: 0.03 },
  { id: "slate", categoryId: "stone-floors", categoryName: "Stone Floors", labelEn: "Slate", labelKo: "슬레이트", color: "#3f4a4d", roughness: 0.62 },
  { id: "basalt", categoryId: "stone-floors", categoryName: "Stone Floors", labelEn: "Basalt", labelKo: "현무암", color: "#2c2f31", roughness: 0.72 },
  { id: "limestone", categoryId: "stone-floors", categoryName: "Stone Floors", labelEn: "Limestone", labelKo: "석회암", color: "#c8bea8", roughness: 0.66 },
  { id: "cobblestone", categoryId: "masonry-floors", categoryName: "Masonry Floors", labelEn: "Cobblestone", labelKo: "자갈석", color: "#6f6b60", roughness: 0.82 },
  { id: "brick-pavers", categoryId: "masonry-floors", categoryName: "Masonry Floors", labelEn: "Brick Pavers", labelKo: "벽돌 포장", color: "#9a4f37", roughness: 0.78 },
  { id: "terracotta", categoryId: "masonry-floors", categoryName: "Masonry Floors", labelEn: "Terracotta", labelKo: "테라코타", color: "#b85f3c", roughness: 0.76 },
  { id: "concrete", categoryId: "urban-floors", categoryName: "Urban Floors", labelEn: "Concrete", labelKo: "콘크리트", color: "#8b8d8c", roughness: 0.86 },
  { id: "asphalt", categoryId: "urban-floors", categoryName: "Urban Floors", labelEn: "Asphalt", labelKo: "아스팔트", color: "#242629", roughness: 0.9 },
  { id: "ceramic-white", categoryId: "decor-floors", categoryName: "Decor Floors", labelEn: "White Ceramic", labelKo: "화이트 세라믹", color: "#f7f7f2", roughness: 0.28 },
  { id: "checker-tile", categoryId: "decor-floors", categoryName: "Decor Floors", labelEn: "Checker Tile", labelKo: "체커 타일", color: "#d9d9d2", roughness: 0.32 },
  { id: "mosaic-blue", categoryId: "decor-floors", categoryName: "Decor Floors", labelEn: "Blue Mosaic", labelKo: "블루 모자이크", color: "#3b78a0", roughness: 0.34 },
  { id: "metal-grate", categoryId: "special-floors", categoryName: "Special Floors", labelEn: "Metal Grate", labelKo: "금속 그레이팅", color: "#5c6268", material: "METAL", roughness: 0.38, metalness: 0.75 },
  { id: "glass-tile", categoryId: "special-floors", categoryName: "Special Floors", labelEn: "Glass Tile", labelKo: "유리 타일", color: "#9ed8ff", material: "GLASS", roughness: 0.08, opacity: 0.42, transparent: !0 },
  { id: "sandstone", categoryId: "natural-floors", categoryName: "Natural Floors", labelEn: "Sandstone", labelKo: "사암", color: "#c9ab75", roughness: 0.88 },
  { id: "snow-ice", categoryId: "natural-floors", categoryName: "Natural Floors", labelEn: "Snow Ice", labelKo: "눈 얼음", color: "#eef5ff", roughness: 0.5, metalness: 0.02 },
  { id: "moss-stone", categoryId: "natural-floors", categoryName: "Natural Floors", labelEn: "Moss Stone", labelKo: "이끼 낀 돌", color: "#60704a", roughness: 0.84 }
], Wi = [
  { type: "sakura", labelEn: "Sakura", labelKo: "벚꽃나무" },
  { type: "oak", labelEn: "Oak", labelKo: "참나무" },
  { type: "pine", labelEn: "Pine", labelKo: "소나무" },
  { type: "maple", labelEn: "Maple", labelKo: "단풍나무" },
  { type: "birch", labelEn: "Birch", labelKo: "자작나무" },
  { type: "willow", labelEn: "Willow", labelKo: "버드나무" },
  { type: "cypress", labelEn: "Cypress", labelKo: "사이프러스" },
  { type: "dead", labelEn: "Dead Tree", labelKo: "고목" }
], hr = {
  sakura: { primaryColor: "#f7bfd2", secondaryColor: "#5e3d30" },
  oak: { primaryColor: "#4f8f3a", secondaryColor: "#6b4a2a" },
  pine: { primaryColor: "#2f6f45", secondaryColor: "#5b3b24" },
  maple: { primaryColor: "#d05a2d", secondaryColor: "#654126" },
  birch: { primaryColor: "#87b95a", secondaryColor: "#e8e1cf" },
  willow: { primaryColor: "#7fae55", secondaryColor: "#6a5635" },
  cypress: { primaryColor: "#315f3a", secondaryColor: "#59402d" },
  dead: { primaryColor: "#8b7a61", secondaryColor: "#4b392c" }
}, Ni = [
  { type: "none", labelEn: "None", labelKo: "없음" },
  { type: "water", labelEn: "Water", labelKo: "물" },
  { type: "grass", labelEn: "Grass", labelKo: "잔디" },
  { type: "sand", labelEn: "Sand", labelKo: "모래" },
  { type: "snowfield", labelEn: "Snowfield", labelKo: "눈밭" }
], Oi = [
  { type: "box", labelEn: "Box", labelKo: "박스" },
  { type: "stairs", labelEn: "Stairs", labelKo: "계단" },
  { type: "round", labelEn: "Round", labelKo: "원형" },
  { type: "ramp", labelEn: "Ramp", labelKo: "경사" }
], fr = [
  { type: "tree", labelEn: "Tree", labelKo: "나무" },
  { type: "flag", labelEn: "Flag", labelKo: "깃발" },
  { type: "fire", labelEn: "Fire", labelKo: "불" },
  { type: "billboard", labelEn: "Billboard", labelKo: "간판" }
], Pi = [
  { type: "none", labelEn: "None", labelKo: "없음" },
  ...fr,
  { type: "model", labelEn: "Model", labelKo: "기본 기물" }
], Fi = Object.keys(Fe).map((t) => ({
  style: t,
  meta: Fe[t]
}));
function gr(t, n, e) {
  const r = G(!1);
  W(() => {
    if (!t || !e || r.current) return;
    const i = je();
    return i.registerAnimations(n, t), r.current = !0, () => {
      r.current && (i.unregisterAnimations(n), r.current = !1);
    };
  }, [t, n, e]);
}
function pr(t, n, e, r) {
  const i = G(!1), o = G(null);
  return o.current || (o.current = xt.getOrCreate("motion")), W(() => {
    if (!(!n.current || i.current || !o.current))
      return o.current.register(
        t,
        e === "vehicle" || e === "airplane" ? e : "character",
        n.current
      ), i.current = !0, () => {
        o.current?.unregister(t), i.current = !1;
      };
  }, [n, e, t]), { executeMotionCommand: (c) => {
    i.current && r && o.current && o.current.execute(t, c);
  }, getMotionSnapshot: () => i.current && r && o.current ? o.current.snapshot(t) : null };
}
const mr = (t, n) => {
  ["forward", "backward", "leftward", "rightward", "shift", "space", "keyE", "keyR"].forEach((r) => {
    t.keyboard[r] !== n.keyboard[r] && (t.keyboard[r] = n.keyboard[r]);
  }), t.mouse.target.equals(n.mouse.target) || t.mouse.target.copy(n.mouse.target), t.mouse.angle !== n.mouse.angle && (t.mouse.angle = n.mouse.angle), t.mouse.isActive !== n.mouse.isActive && (t.mouse.isActive = n.mouse.isActive), t.mouse.shouldRun !== n.mouse.shouldRun && (t.mouse.shouldRun = n.mouse.shouldRun);
}, yr = "gaesup.motions", Ot = "physics.bridge", Pt = Tt, Ft = "motions.runtime", Lt = "motions:teleport";
function br(t, n = {}) {
  const e = n.physicsExtensionId ?? Ot, r = n.inputExtensionId ?? Pt, i = t.systems.require(e), o = t.input.require(r);
  return {
    physicsBridge: i.createBridge(),
    inputAdapter: o.createAdapter(),
    events: t.events,
    extensionIds: {
      physics: e,
      input: r
    }
  };
}
function Li(t, n) {
  t.events.emit(Lt, n);
}
function wr(t = {}) {
  const n = t.id ?? yr, e = t.physicsExtensionId ?? Ot, r = t.inputExtensionId ?? Pt, i = t.runtimeServiceId ?? Ft, o = t.createPhysicsBridge ?? (() => new re()), s = t.createInputAdapter ?? ue;
  return {
    id: n,
    name: "GaeSup Motions",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["motions", "physics", "input"],
    setup(a) {
      a.systems.register(e, {
        Bridge: re,
        createBridge: o
      }, n), a.input.register(r, {
        createAdapter: s
      }, n), a.services.register(i, {
        create: (c) => br(a, {
          physicsExtensionId: e,
          inputExtensionId: r,
          ...c
        })
      }, n), a.events.emit("motions:ready", {
        pluginId: n,
        physicsExtensionId: e,
        inputExtensionId: r,
        runtimeServiceId: i
      });
    },
    dispose(a) {
      a.systems.remove(e), a.input.remove(r), a.services.remove(i);
    }
  };
}
const Ki = wr();
function vr(t, n, e, r, i) {
  const o = t.mode?.type || "character", s = n.getActiveState(), a = n.getGameStates(), c = t.automation;
  return {
    activeState: s,
    gameStates: a,
    keyboard: { ...e.keyboard },
    mouse: {
      target: i.copy(e.mouse.target),
      angle: e.mouse.angle,
      isActive: e.mouse.isActive,
      shouldRun: e.mouse.shouldRun,
      ...e.mouse.isLookAround !== void 0 ? { isLookAround: e.mouse.isLookAround } : {}
    },
    automationOption: c,
    modeType: o,
    delta: r
  };
}
function Sr(t) {
  if (!t || typeof t != "object") return !1;
  const e = t.position;
  return !!e && typeof e.x == "number" && typeof e.y == "number" && typeof e.z == "number";
}
function Cr(t) {
  if (!("detail" in t)) return null;
  const n = t.detail;
  return Sr(n) ? n : null;
}
function Mr(t) {
  if (typeof window > "u" || typeof document > "u")
    return () => {
    };
  const n = (e) => {
    const r = Cr(e);
    r && t(r);
  };
  return window.addEventListener("gaesup:teleport", n), document.addEventListener("teleport-request", n), () => {
    window.removeEventListener("gaesup:teleport", n), document.removeEventListener("teleport-request", n);
  };
}
let ut = null;
function Ir() {
  return {
    physicsBridge: new re(),
    inputAdapter: ue(),
    events: new fn(),
    extensionIds: {
      physics: "fallback.physics.bridge",
      input: "fallback.interaction.input"
    }
  };
}
function xr() {
  return ut ??= Ir(), ut;
}
function Tr(t) {
  const { enabled: n = !0, allowLegacyFallback: e = !0 } = t, r = _t(), i = Dt(), o = L(() => t.motionsRuntime || !r ? null : r.getService(Ft)?.create() ?? null, [r, i, t.motionsRuntime]), s = L(() => t.motionsRuntime || o || !e ? null : xr(), [e, o, t.motionsRuntime]), a = t.motionsRuntime ?? o ?? s, c = G(null), l = G(new y.Vector3()), h = G(null), d = G(null), u = G(!1), f = K((w) => w.physics), g = G(f), p = G(null);
  p.current ??= ue();
  const m = a?.inputAdapter ?? p.current, I = G(m);
  I.current = m;
  const T = n && !!a, _ = G({
    keyboard: m.getKeyboard(),
    mouse: m.getMouse()
  }), k = G(null), C = G((w) => {
    I.current.updateKeyboard(w);
  }), B = G((w) => {
    I.current.updateMouse(w);
  });
  W(() => {
    u.current || (g.current = f);
  }, [f]), W(() => {
    if (h.current = Wt(), !n) {
      u.current && (d.current?.unregister("global-physics"), u.current = !1), d.current = null, c.current = null;
      return;
    }
    const w = a?.physicsBridge;
    if (!w) {
      u.current && (d.current?.unregister("global-physics"), u.current = !1), d.current = null, c.current = null;
      return;
    }
    return d.current = w, u.current || (d.current.register(
      "global-physics",
      g.current,
      h.current
    ), u.current = !0), () => {
      u.current && d.current && (d.current.unregister("global-physics"), u.current = !1), c.current = null;
    };
  }, [n, a?.physicsBridge]), W(() => {
    n && u.current && d.current && d.current.execute("global-physics", {
      type: "updateConfig",
      data: f
    });
  }, [n, f]), W(() => {
    const w = (M) => {
      t.rigidBodyRef?.current && M && (t.rigidBodyRef.current.setTranslation(
        { x: M.x, y: M.y, z: M.z },
        !0
      ), t.rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, !0), t.rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, !0));
    }, A = (M) => {
      w(M.position);
    }, b = a?.events.on(
      Lt,
      A
    ), S = a === s ? Mr(A) : void 0;
    return () => {
      b?.(), S?.();
    };
  }, [s, a, a?.events, t.rigidBodyRef]);
  const x = R((w, A) => {
    if (!n || !d.current || !h.current) return;
    const b = _.current;
    b.keyboard = m.getKeyboard(), b.mouse = m.getMouse();
    let S = c.current;
    if (S)
      mr(S, b), S.activeState = h.current.getActiveState(), S.gameStates = h.current.getGameStates(), S.delta = A;
    else {
      const j = K.getState();
      if (S = vr(
        j,
        h.current,
        b,
        A,
        l.current
      ), c.current = S, S.activeState) {
        const { activeState: H } = S;
        t.rigidBodyRef.current.lockRotations(!1, !0), H.euler.set(0, 0, 0), t.rigidBodyRef.current.setTranslation(
          {
            x: H.position.x,
            y: H.position.y + 5,
            z: H.position.z
          },
          !0
        );
      }
    }
    let M = k.current;
    M ? (M.rigidBodyRef = t.rigidBodyRef, M.state = w, M.delta = A, M.worldContext = K.getState(), t.colliderSize ? M.colliderSize = t.colliderSize : delete M.colliderSize, t.innerGroupRef && (M.innerGroupRef = t.innerGroupRef)) : (M = {
      rigidBodyRef: t.rigidBodyRef,
      state: w,
      delta: A,
      worldContext: K.getState(),
      dispatch: () => {
      },
      inputRef: _,
      setKeyboardInput: C.current,
      setMouseInput: B.current,
      ...t.colliderSize ? { colliderSize: t.colliderSize } : {},
      ...t.innerGroupRef ? { innerGroupRef: t.innerGroupRef } : {}
    }, k.current = M), d.current.updateEntity("global-physics", {
      deltaTime: A,
      calcProp: M,
      physicsState: S
    });
  }, [n, m, t]);
  return on((w, A) => {
    T && x(w, A);
  }), {
    isReady: T,
    bridge: d.current
  };
}
function Er(t) {
  return t ? t.plugins.context.input.get(
    Tt
  )?.createAdapter() ?? null : null;
}
function Kt() {
  const t = _t(), n = Dt(), e = G(null);
  return e.current ??= ue(), L(
    () => Er(t) ?? e.current,
    [t, n]
  );
}
function Gr() {
  const t = Kt(), [n, e] = en(() => ({
    keyboard: t.getKeyboard(),
    mouse: t.getMouse()
  }));
  W(() => (e({
    keyboard: t.getKeyboard(),
    mouse: t.getMouse()
  }), t.subscribe?.((s) => {
    e({
      keyboard: s.keyboard,
      mouse: s.mouse
    });
  })), [t]);
  const r = R((s) => {
    t.updateKeyboard(s), t.subscribe || e({
      keyboard: t.getKeyboard(),
      mouse: t.getMouse()
    });
  }, [t]), i = R((s) => {
    t.updateMouse(s), t.subscribe || e({
      keyboard: t.getKeyboard(),
      mouse: t.getMouse()
    });
  }, [t]), o = R((s) => {
    i(s);
  }, [i]);
  return {
    keyboard: n.keyboard,
    mouse: n.mouse,
    updateKeyboard: r,
    updateMouse: i,
    dispatchInput: o
  };
}
function Bt(t) {
  const { playAnimation: n, currentType: e, currentAnimation: r } = xn(), { keyboard: i, mouse: o } = Gr(), s = K((d) => d.automation), { gameStates: a } = Nt(), c = L(() => {
    const d = i?.forward || i?.backward || i?.leftward || i?.rightward, u = o?.isActive || !1;
    return {
      isMoving: d || u,
      isRunning: !!i?.shift && !o?.isLookAround && d || o?.shouldRun && u && s?.queue.isRunning
    };
  }, [i.forward, i.backward, i.leftward, i.rightward, i.shift, o.isActive, o.shouldRun, o.isLookAround, s]), l = L(() => a?.isJumping ? "jump" : a?.isFalling ? "fall" : a?.isRiding ? "ride" : c.isRunning ? "run" : c.isMoving ? "walk" : "idle", [a.isJumping, a.isFalling, a.isRiding, c.isRunning, c.isMoving]), h = L(() => ["idle", "walk", "run", "jump", "fall", "ride", "land"], []);
  W(() => {
    if (!t) return;
    l !== "idle" ? l !== r && n(e, l) : h.includes(r) && r !== "idle" && n(e, "idle");
  }, [t, l, r, n, e, h]);
}
function Ar(t) {
  const {
    onIntersectionEnter: n,
    onIntersectionExit: e,
    onCollisionEnter: r,
    userData: i
  } = t, o = (l, ...h) => {
    if (typeof l == "function")
      try {
        l(...h);
      } catch {
      }
  }, s = R(
    (l) => {
      o(n, l), o(i?.onNear, l, i);
    },
    [n, i]
  ), a = R(
    (l) => {
      o(e, l), o(i?.onFar, l, i), o(i?.onLeave, l, i);
    },
    [e, i]
  ), c = R(
    (l) => {
      o(r, l), o(i?.onNear, l, i);
    },
    [r, i]
  );
  return {
    handleIntersectionEnter: s,
    handleIntersectionExit: a,
    handleCollisionEnter: c
  };
}
function Rr(t) {
  const { onReady: n, onFrame: e, onAnimate: r, onDestroy: i, actions: o } = t;
  W(() => (n && n(), i), [i, n]), W(() => {
    let s;
    const a = () => {
      e && e(), r && o && r(), s = requestAnimationFrame(a);
    };
    if (!(!e && !(r && o)))
      return s = requestAnimationFrame(a), () => {
        cancelAnimationFrame(s);
      };
  }, [e, r, o]);
}
function zr(t) {
  const {
    id: n,
    rigidBodyRef: e,
    isActive: r,
    actions: i,
    outerGroupRef: o,
    innerGroupRef: s,
    colliderRef: a,
    groundRay: c,
    colliderSize: l
  } = t, h = G(
    n || `entity-${Date.now()}-${Math.random()}`
  ).current, d = K((T) => T.mode), u = d?.type ?? "character", f = r === !0;
  gr(i, u, f), Bt(f && u === "character");
  const { executeMotionCommand: g, getMotionSnapshot: p } = pr(
    h,
    e,
    u,
    f
  ), m = {
    rigidBodyRef: e,
    enabled: f,
    ...o ? { outerGroupRef: o } : {},
    ...s ? { innerGroupRef: s } : {},
    ...a ? { colliderRef: a } : {},
    ...c ? { groundRay: c } : {},
    ...l ? { colliderSize: l } : {}
  };
  Tr(m);
  const I = Ar(t);
  return Rr(t), {
    executeMotionCommand: g,
    getMotionSnapshot: p,
    mode: d,
    ...I
  };
}
function jt({ nodes: t, color: n, skeleton: e, url: r, excludeNodeNames: i }) {
  const { processedNodes: o, ownedMaterials: s } = L(() => {
    const a = [], c = i && i.length > 0 ? new Set(i) : null, l = (u) => {
      const f = u.clone();
      return a.push(f), n && "color" in f && f.color instanceof y.Color && f.color.set(n), f;
    }, h = (u) => n ? Array.isArray(u) ? u.map((f) => l(f)) : l(u) : u;
    return {
      processedNodes: Object.keys(t).map((u, f) => {
        if (c && c.has(u)) return null;
        const g = t[u];
        return g instanceof y.SkinnedMesh ? {
          type: "skinnedMesh",
          material: h(g.material),
          geometry: g.geometry,
          skeleton: e || g.skeleton,
          key: `${r}-${u}-${f}`
        } : g instanceof y.Mesh ? {
          type: "mesh",
          material: h(g.material),
          geometry: g.geometry,
          key: `${r}-${u}-${f}`
        } : null;
      }).filter((u) => u !== null),
      ownedMaterials: a
    };
  }, [t, n, e, r, i]);
  return W(() => () => {
    for (const a of s)
      a.dispose();
  }, [s]), /* @__PURE__ */ V(Yt, { children: o.map((a) => a ? a.type === "skinnedMesh" ? /* @__PURE__ */ V(
    "skinnedMesh",
    {
      castShadow: !0,
      receiveShadow: !0,
      material: a.material,
      geometry: a.geometry,
      skeleton: a.skeleton,
      frustumCulled: !1,
      dispose: null
    },
    a.key
  ) : /* @__PURE__ */ V(
    "mesh",
    {
      castShadow: !0,
      receiveShadow: !0,
      material: a.material,
      geometry: a.geometry,
      dispose: null
    },
    a.key
  ) : null) });
}
function kr({ url: t, isActive: n, color: e, skeleton: r }) {
  const { scene: i } = Le(t), o = L(() => Ct.clone(i), [i]), { nodes: s } = St(o);
  return Bt(n), /* @__PURE__ */ V("group", { children: /* @__PURE__ */ V(
    jt,
    {
      nodes: s,
      url: t,
      ...e ? { color: e } : {},
      ...r ? { skeleton: r } : {}
    }
  ) });
}
const Ht = vt((t, n) => {
  const e = typeof t.modelYawOffset == "number" ? t.modelYawOffset : t.componentType === "character" ? Math.PI : 0, r = t.baseColor ?? t.parts?.[0]?.color;
  return /* @__PURE__ */ We("group", { receiveShadow: !0, castShadow: !0, ref: n, userData: { intangible: !0 }, children: [
    t.children,
    /* @__PURE__ */ We("group", { "rotation-y": e, ...t.modelScale !== void 0 ? { scale: t.modelScale } : {}, children: [
      t.objectNode && t.animationRef && /* @__PURE__ */ V(
        "primitive",
        {
          object: t.objectNode,
          visible: !1,
          receiveShadow: !0,
          castShadow: !0,
          ref: t.animationRef
        }
      ),
      /* @__PURE__ */ V(
        jt,
        {
          nodes: t.nodes,
          skeleton: t.skeleton,
          url: t.url || "",
          ...r ? { color: r } : {},
          ...t.excludeBaseNodes && t.excludeBaseNodes.length > 0 ? { excludeNodeNames: t.excludeBaseNodes } : {}
        }
      ),
      t.modelChildren
    ] })
  ] });
});
Ht.displayName = "InnerGroupRef";
const Ce = /* @__PURE__ */ new Map();
function _r(t) {
  const n = new Uint8Array(t);
  for (let r = 0; r < t; r++)
    n[r] = Math.round((r + 1) / t * 255);
  const e = new y.DataTexture(n, t, 1, y.RedFormat);
  return e.minFilter = y.NearestFilter, e.magFilter = y.NearestFilter, e.generateMipmaps = !1, e.needsUpdate = !0, e;
}
function Ut(t = 3) {
  const n = Math.max(2, Math.min(8, Math.floor(t))), e = Ce.get(n);
  if (e) return e;
  const r = _r(n);
  return Ce.set(n, r), r;
}
function Bi(t = {}) {
  return new y.MeshToonMaterial({
    color: t.color ?? "#ffffff",
    vertexColors: t.vertexColors ?? !1,
    transparent: t.transparent ?? !1,
    opacity: t.opacity ?? 1,
    map: t.map ?? null,
    alphaMap: t.alphaMap ?? null,
    emissive: t.emissive ?? "#000000",
    emissiveIntensity: t.emissiveIntensity ?? 0,
    gradientMap: Ut(t.steps ?? 3),
    side: t.side ?? y.FrontSide,
    depthWrite: t.depthWrite ?? !0
  });
}
let $t = !1;
function ji(t) {
  $t = t;
}
function Dr() {
  return $t;
}
function Hi() {
  for (const t of Ce.values()) t.dispose();
  Ce.clear();
}
const dt = /* @__PURE__ */ new WeakSet();
function Wr(t, n = 4) {
  if (!t || dt.has(t)) return;
  dt.add(t);
  const e = Ut(n);
  t.traverse((r) => {
    const i = r;
    if (!i.isMesh) return;
    const s = (Array.isArray(i.material) ? i.material : [i.material]).map((a) => {
      if (!a || a.isMeshToonMaterial) return a;
      const l = a;
      return new y.MeshToonMaterial({
        color: l.color && l.color.clone() || new y.Color("#ffffff"),
        map: l.map ?? null,
        normalMap: l.normalMap ?? null,
        alphaMap: l.alphaMap ?? null,
        transparent: a.transparent,
        opacity: a.opacity,
        side: a.side,
        emissive: l.emissive && l.emissive.clone() || new y.Color(0),
        emissiveMap: l.emissiveMap ?? null,
        emissiveIntensity: l.emissiveIntensity ?? 1,
        gradientMap: e
      });
    });
    i.material = Array.isArray(i.material) ? s : s[0];
  });
}
const Me = /* @__PURE__ */ new Map(), ve = new y.Vector3(1, 1, 1), Nr = new y.Box3(), Or = (t) => {
  const n = Me.get(t);
  n && --n.refCount <= 0 && Me.delete(t);
}, Pr = (t) => {
  try {
    return Nr.setFromObject(t).getSize(hn());
  } catch {
    return ve.clone();
  }
}, Fr = ({ url: t }) => {
  const n = K((d) => d.sizes), e = K((d) => d.setSizes), r = t ?? "data:application/json,{}", i = !!t?.trim(), o = Le(r), s = G(!1), a = R(
    () => i && o.scene ? Pr(o.scene) : ve.clone(),
    [o.scene, i]
  );
  W(() => {
    if (!t || !i) return;
    const d = Me.get(t);
    return d ? d.refCount++ : Me.set(t, { gltf: o, refCount: 1, size: a() }), o.scene && Dr() && Wr(o.scene), () => Or(t);
  }, [t, i, o, a]), W(() => {
    if (s.current || !i || !t || !o.scene || n[t]) return;
    s.current = !0;
    const d = a();
    e((u) => ({ ...u, [t]: d }));
  }, [t, o.scene, n, e, a, i]);
  const c = L(
    () => i && t ? n[t] ?? ve : ve,
    [n, t, i]
  ), l = R(
    (d, u) => {
      if (!i) return;
      const f = u ?? t;
      f && Promise.resolve().then(() => e((g) => ({ ...g, [f]: d })));
    },
    [t, e, i]
  ), h = R(
    (d) => {
      if (!i) return null;
      const u = d ?? t;
      return u ? n[u] ?? null : null;
    },
    [t, n, i]
  );
  return { gltf: o, size: c, setSize: l, getSize: h };
}, Ui = () => {
  const t = K((r) => r.sizes), n = R(
    (r) => {
      if (!r) return {};
      const i = {};
      return Object.entries(r).forEach(([o, s]) => {
        typeof s == "string" ? i[o] = t[s] ?? null : i[o] = null;
      }), i;
    },
    [t]
  ), e = R((r) => {
  }, []);
  return { getSizesByUrls: n, preloadSizes: e };
}, Lr = "data:application/json," + encodeURIComponent(
  JSON.stringify({
    asset: { version: "2.0" },
    scenes: [{ nodes: [] }],
    nodes: []
  })
);
function Kr(t, n) {
  if (t[n]) return n;
  const e = Object.keys(t), r = n.toLowerCase();
  return e.find((i) => i.toLowerCase() === r) ?? e.find((i) => i.toLowerCase().includes(r)) ?? (e.length === 1 ? e[0] : void 0);
}
const Br = vt(
  (t, n) => {
    const e = G(null);
    tn(n, () => e.current);
    const { size: r } = Fr({ url: t.url || "" }), i = t.url?.trim() ? t.url : Lr, { scene: o, animations: s } = Le(i), { actions: a, ref: c } = rn(s), l = G(void 0), {
      handleIntersectionEnter: h,
      handleIntersectionExit: d,
      handleCollisionEnter: u
    } = zr({
      rigidBodyRef: e,
      ...t.name ? { id: t.name } : {},
      ...t.userData ? { userData: t.userData } : {},
      ...t.onIntersectionEnter ? { onIntersectionEnter: t.onIntersectionEnter } : {},
      ...t.onIntersectionExit ? { onIntersectionExit: t.onIntersectionExit } : {},
      ...t.onCollisionEnter ? { onCollisionEnter: t.onCollisionEnter } : {},
      ...t.onReady ? { onReady: t.onReady } : {},
      ...t.onFrame ? { onFrame: t.onFrame } : {},
      ...t.onAnimate ? { onAnimate: t.onAnimate } : {},
      ...t.onDestroy || t.onDestory ? { onDestroy: t.onDestroy ?? t.onDestory } : {},
      actions: a,
      isActive: t.isActive,
      ...t.outerGroupRef ? { outerGroupRef: t.outerGroupRef } : {},
      ...t.innerGroupRef ? { innerGroupRef: t.innerGroupRef } : {},
      ...t.colliderRef ? { colliderRef: t.colliderRef } : {},
      ...t.groundRay ? { groundRay: t.groundRay } : {},
      ...t.colliderSize ? { colliderSize: t.colliderSize } : {}
    }), f = L(() => Ct.clone(o), [o]), g = L(() => {
      let x = null;
      return f.traverse((w) => {
        w instanceof y.SkinnedMesh && (x = w.skeleton);
      }), x;
    }, [f]), p = L(() => !t.parts || t.parts.length === 0 ? null : t.parts.map(({ url: x, color: w }, A) => x ? /* @__PURE__ */ nn(
      kr,
      {
        url: x,
        isActive: !0,
        componentType: t.componentType,
        ...t.currentAnimation ? { currentAnimation: t.currentAnimation } : {},
        ...w ? { color: w } : {},
        key: `${t.componentType}-${x}-${w || "default"}-${A}`,
        ...g ? { skeleton: g } : {}
      }
    ) : null).filter(Boolean), [t.parts, t.componentType, t.currentAnimation, g]), { nodes: m } = St(f), I = Object.values(m).find((x) => x.type === "Object3D"), T = t.rotation instanceof y.Euler ? t.rotation.y : 0, _ = t.outerGroupRef ? { ref: t.outerGroupRef } : {}, k = t.innerGroupRef ? { ref: t.innerGroupRef } : {}, C = t.isActive ? { canSleep: !1, ccd: !0 } : { canSleep: !0, ccd: !1 }, B = L(() => {
      if (t.colliderSize) {
        const S = Math.max(0.05, t.colliderSize.radius), M = Math.max(0.05, t.colliderSize.height * 0.5 - S);
        return {
          halfHeight: M,
          radius: S,
          y: M + S
        };
      }
      const x = Math.max(r.x, 0.1), w = Math.max(r.z, 0.1), A = t.componentType === "character" ? Math.max(0.18, Math.min(x, w) * 0.35) : Math.max(0.2, x * 1.2), b = Math.max(0.05, r.y * 0.5 - A);
      return {
        halfHeight: b,
        radius: A,
        y: b + A
      };
    }, [t.colliderSize, t.componentType, r.x, r.y, r.z]);
    return W(() => {
      if (!t.currentAnimation) return;
      const x = Kr(a, t.currentAnimation);
      if (!x || l.current === x) return;
      const w = l.current ? a[l.current] : void 0, A = a[x];
      w?.fadeOut(0.2), A?.reset().fadeIn(0.2).play(), l.current = x;
    }, [a, t.currentAnimation]), /* @__PURE__ */ V("group", { ..._, userData: { intangible: !0 }, children: /* @__PURE__ */ We(
      sn,
      {
        ...C,
        colliders: !1,
        ref: e,
        ...t.name ? { name: t.name } : {},
        position: t.position,
        rotation: an().set(0, T, 0),
        userData: t.userData,
        type: t.rigidbodyType || (t.isActive ? "dynamic" : "fixed"),
        ...t.sensor !== void 0 ? { sensor: t.sensor } : {},
        onIntersectionEnter: h,
        onIntersectionExit: d,
        onCollisionEnter: u,
        ...t.rigidBodyProps,
        children: [
          !t.isNotColliding && /* @__PURE__ */ V(
            ln,
            {
              ref: t.colliderRef,
              args: [B.halfHeight, B.radius],
              position: [0, B.y, 0]
            }
          ),
          /* @__PURE__ */ V(
            Ht,
            {
              animationRef: c,
              nodes: m,
              ...k,
              isActive: t.isActive,
              componentType: t.componentType,
              ...I ? { objectNode: I } : {},
              ...t.modelYawOffset !== void 0 ? { modelYawOffset: t.modelYawOffset } : {},
              ...t.scale !== void 0 ? { modelScale: t.scale } : {},
              ...t.isRiderOn !== void 0 ? { isRiderOn: t.isRiderOn } : {},
              ...t.enableRiding !== void 0 ? { enableRiding: t.enableRiding } : {},
              ...t.ridingUrl ? { ridingUrl: t.ridingUrl } : {},
              ...t.offset ? { offset: t.offset } : {},
              ...t.baseColor ? { baseColor: t.baseColor } : {},
              ...t.excludeBaseNodes ? { excludeBaseNodes: t.excludeBaseNodes } : {},
              ...t.parts ? { parts: t.parts } : {},
              ...p ? { modelChildren: p } : {},
              children: t.children
            }
          )
        ]
      }
    ) });
  }
);
Br.displayName = "PhysicsEntity";
const jr = Object.freeze({
  cellSize: 4,
  heightStep: 1,
  origin: "center"
});
class Hr {
  id;
  spec;
  constructor(n = {}) {
    this.id = n.id ?? "square", this.spec = {
      ...jr,
      ...n.spec
    };
  }
  toWorld(n) {
    const e = this.spec.origin === "center" ? 0 : this.spec.cellSize / 2;
    return {
      x: n.x * this.spec.cellSize + e,
      y: n.level * this.spec.heightStep,
      z: n.z * this.spec.cellSize + e
    };
  }
  fromWorld(n) {
    const e = this.spec.origin === "center" ? 0 : this.spec.cellSize / 2;
    return {
      x: Math.round((n.x - e) / this.spec.cellSize),
      z: Math.round((n.z - e) / this.spec.cellSize),
      level: Math.round(n.y / this.spec.heightStep)
    };
  }
  getNeighbors(n) {
    return [
      { x: n.x, z: n.z - 1, level: n.level },
      { x: n.x + 1, z: n.z, level: n.level },
      { x: n.x, z: n.z + 1, level: n.level },
      { x: n.x - 1, z: n.z, level: n.level }
    ];
  }
  equals(n, e) {
    return n.x === e.x && n.z === e.z && n.level === e.level;
  }
  key(n) {
    return `${n.x}:${n.z}:${n.level}`;
  }
  edgeToWorld(n) {
    const e = this.toWorld(n), r = this.spec.cellSize / 2;
    switch (n.side) {
      case "north":
        return { ...e, z: e.z - r };
      case "east":
        return { ...e, x: e.x + r };
      case "south":
        return { ...e, z: e.z + r };
      case "west":
        return { ...e, x: e.x - r };
    }
  }
  edgeKey(n) {
    return `${n.x}:${n.z}:${n.level}:${n.side}`;
  }
  cornerToWorld(n) {
    const e = this.toWorld(n), r = this.spec.cellSize / 2;
    return {
      x: e.x - r,
      y: e.y,
      z: e.z - r
    };
  }
  cornerKey(n) {
    return `${n.x}:${n.z}:${n.level}`;
  }
}
const Vt = () => ({ ok: !0 }), Ur = (t, n) => {
  const e = { ok: !1, reason: t };
  return e.ruleId = n, e;
};
function $r() {
  return {
    id: "no-overlap",
    test(t) {
      const n = t.request.footprint?.coords ?? [t.request.coord];
      for (const e of n)
        if (t.getOccupants(e).filter((i) => i.id !== t.request.subject.id).length > 0)
          return Ur("Target coordinate is already occupied.", "no-overlap");
      return Vt();
    }
  };
}
class ht extends Error {
  result;
  constructor(n) {
    super(n.reason ?? "Placement request was rejected."), this.name = "PlacementRejectedError", this.result = n;
  }
}
class ft extends Error {
  constructor(n) {
    super(`Placement entry "${n}" does not exist.`), this.name = "MissingPlacementEntryError";
  }
}
class Vr {
  adapter;
  rules;
  entries = /* @__PURE__ */ new Map();
  occupied = /* @__PURE__ */ new Map();
  constructor(n) {
    this.adapter = n.adapter, this.rules = [...n.rules ?? []];
  }
  use(n) {
    this.rules.push(n);
  }
  canPlace(n) {
    const e = {
      request: n,
      entries: this.entries,
      adapter: this.adapter,
      getOccupants: (r) => this.getOccupants(r)
    };
    for (const r of this.rules) {
      const i = r.test(e);
      if (!i.ok)
        return i.ruleId === void 0 ? { ...i, ruleId: r.id } : i;
    }
    return Vt();
  }
  place(n) {
    const e = this.canPlace(n);
    if (!e.ok)
      throw new ht(e);
    const r = this.toEntry(n), i = this.entries.get(r.id);
    i && this.unindex(i), this.entries.set(r.id, r), this.index(r);
    const o = { type: "place", after: r };
    return i && (o.before = i), o;
  }
  remove(n) {
    const e = this.entries.get(n);
    if (!e)
      throw new ft(n);
    return this.unindex(e), this.entries.delete(n), { type: "remove", before: e };
  }
  move(n, e, r) {
    const i = this.requireEntry(n), o = {
      subject: i.subject,
      coord: e,
      footprint: r ?? this.moveFootprint(i, e)
    };
    i.rotation !== void 0 && (o.rotation = i.rotation);
    const s = this.canPlace(o);
    if (!s.ok)
      throw new ht(s);
    const a = this.toEntry(o);
    return this.unindex(i), this.entries.set(n, a), this.index(a), { type: "move", before: i, after: a };
  }
  rotate(n, e) {
    const r = this.requireEntry(n), i = {
      ...r,
      rotation: e
    };
    return this.entries.set(n, i), { type: "rotate", before: r, after: i };
  }
  get(n) {
    return this.entries.get(n);
  }
  list() {
    return Array.from(this.entries.values());
  }
  getOccupants(n) {
    const e = this.occupied.get(this.adapter.key(n));
    return e ? Array.from(e).map((r) => this.entries.get(r)).filter((r) => r !== void 0) : [];
  }
  clear() {
    this.entries.clear(), this.occupied.clear();
  }
  toEntry(n) {
    const e = {
      id: n.subject.id,
      subject: n.subject,
      coord: n.coord,
      footprint: n.footprint ?? { kind: "cell", coords: [n.coord] }
    };
    return n.rotation !== void 0 && (e.rotation = n.rotation), e;
  }
  requireEntry(n) {
    const e = this.entries.get(n);
    if (!e)
      throw new ft(n);
    return e;
  }
  index(n) {
    for (const e of this.getFootprintCoords(n)) {
      const r = this.adapter.key(e), i = this.occupied.get(r) ?? /* @__PURE__ */ new Set();
      i.add(n.id), this.occupied.set(r, i);
    }
  }
  unindex(n) {
    for (const e of this.getFootprintCoords(n)) {
      const r = this.adapter.key(e), i = this.occupied.get(r);
      i && (i.delete(n.id), i.size === 0 && this.occupied.delete(r));
    }
  }
  getFootprintCoords(n) {
    return n.footprint.coords ?? [n.coord];
  }
  moveFootprint(n, e) {
    const r = n.footprint.coords;
    return r !== void 0 && r.length === 1 && r[0] !== void 0 && this.adapter.equals(r[0], n.coord) ? { ...n.footprint, coords: [e] } : n.footprint;
  }
}
function qr(t) {
  return new Vr(t);
}
const z = Object.freeze({
  GRID_CELL_SIZE: 4,
  // 그리드 한 칸 크기
  SNAP_GRID_SIZE: 4,
  // 스냅도 그리드에 맞춤
  HEIGHT_STEP: 1,
  // 타일 높이 한 단계(m)
  TILE_MULTIPLIERS: Object.freeze({
    SMALL: 1,
    // 1x1 (4x4m)
    MEDIUM: 2,
    // 2x2 (8x8m)
    LARGE: 3,
    // 3x3 (12x12m)
    HUGE: 4
    // 4x4 (16x16m)
  }),
  WALL_SIZES: Object.freeze({
    WIDTH: 4,
    // 벽 길이
    HEIGHT: 4,
    // 벽 높이  
    THICKNESS: 0.5,
    // 벽 두께
    MIN_LENGTH: 0.5,
    MAX_LENGTH: 10
  }),
  GRID_DIVISIONS: 25,
  // 100m / 4m = 25 divisions
  DEFAULT_GRID_SIZE: 100
}), $ = new Hr({
  id: "building-square",
  spec: {
    cellSize: z.GRID_CELL_SIZE,
    heightStep: z.HEIGHT_STEP,
    origin: "center"
  }
}), gt = (t) => t >= 0 ? t * 2 : -t * 2 - 1, qt = (t, n) => {
  const e = gt(t), r = gt(n), i = e + r;
  return i * (i + 1) / 2 + r;
}, Zr = (t) => ({
  ...t,
  x: Math.round(t.x / z.SNAP_GRID_SIZE) * z.SNAP_GRID_SIZE,
  z: Math.round(t.z / z.SNAP_GRID_SIZE) * z.SNAP_GRID_SIZE
}), Jr = (t) => $.fromWorld(t), Xr = (t) => $.toWorld(t), Yr = (t) => {
  const n = Math.PI / 2;
  return (Math.round(t / n) % 4 + 4) % 4 * n;
}, Qr = (t) => {
  switch (t) {
    case "north":
    case "south":
      return Math.PI / 2;
    case "east":
    case "west":
      return 0;
  }
}, $i = (t) => {
  const n = $.edgeToWorld(t), e = Qr(t.side), r = z.WALL_SIZES.WIDTH / 2, i = {
    x: Math.sin(e),
    z: Math.cos(e)
  };
  return {
    position: {
      x: Q(n.x - i.x * r),
      y: n.y,
      z: Q(n.z - i.z * r)
    },
    rotationY: e
  };
}, Ie = (t, n) => {
  const e = Yr(n), r = z.WALL_SIZES.WIDTH / 2, i = z.GRID_CELL_SIZE, o = {
    x: t.x + Math.sin(e) * r,
    y: t.y,
    z: t.z + Math.cos(e) * r
  };
  if (e === 0 || e === Math.PI) {
    const s = Math.trunc(o.x / i), a = o.x - s * i;
    return {
      x: Q(s),
      z: Q(Math.round(o.z / i)),
      level: Q(Math.round(o.y / z.HEIGHT_STEP)),
      side: a >= 0 ? "east" : "west"
    };
  }
  return {
    x: Q(Math.round(o.x / i)),
    z: Q(Math.trunc(o.z / i)),
    level: Q(Math.round(o.y / z.HEIGHT_STEP)),
    side: o.z - Math.trunc(o.z / i) * i >= 0 ? "south" : "north"
  };
}, Vi = (t) => $.edgeKey(t), Q = (t) => Object.is(t, -0) || Math.abs(t) < 1e-10 ? 0 : Number(t.toFixed(10)), q = (t) => Jr(t), qi = (t) => Xr(t), le = (t, n = 1) => {
  const e = Math.max(1, Math.round(n)), r = -Math.floor(e / 2), i = [];
  for (let o = 0; o < e; o++)
    for (let s = 0; s < e; s++)
      i.push({
        x: t.x + r + o,
        z: t.z + r + s,
        level: t.level
      });
  return i;
}, Zi = (t) => t.map((n) => $.key(n)), ei = (t, n = {}) => {
  const e = Math.max(1, Math.round(n.x ?? 1)), r = Math.max(1, Math.round(n.y ?? 1)), i = Math.max(1, Math.round(n.z ?? 1)), o = [];
  for (let s = 0; s < e; s++)
    for (let a = 0; a < r; a++)
      for (let c = 0; c < i; c++)
        o.push({
          x: t.x + s,
          z: t.z + c,
          level: t.level + a
        });
  return o;
}, ti = {
  id: "building-placement",
  toWorld(t) {
    return t.kind === "cell" ? $.toWorld(t.cell) : $.edgeToWorld(t.edge);
  },
  fromWorld(t) {
    return {
      kind: "cell",
      cell: $.fromWorld(t)
    };
  },
  getNeighbors(t) {
    return t.kind === "edge" ? [t] : $.getNeighbors(t.cell).map((n) => ({ kind: "cell", cell: n }));
  },
  equals(t, n) {
    return this.key(t) === this.key(n);
  },
  key(t) {
    return t.kind === "cell" ? `cell:${$.key(t.cell)}` : `edge:${$.edgeKey(t.edge)}`;
  }
}, Zt = (t) => {
  const n = t.cell ?? q(t.position), e = t.footprint ?? le(n, t.size || 1), r = {
    id: t.id,
    subject: {
      id: t.id,
      type: "tile",
      tags: [
        "building",
        "tile",
        `shape:${t.shape ?? "box"}`,
        ...t.objectType && t.objectType !== "none" ? [`terrain:${t.objectType}`] : []
      ]
    },
    coord: { kind: "cell", cell: n },
    footprint: {
      kind: "cell",
      coords: e.map((i) => ({ kind: "cell", cell: i }))
    }
  };
  return t.rotation !== void 0 && (r.rotation = t.rotation), r;
}, ni = (t) => {
  const n = t.edge ?? Ie(t.position, t.rotation.y);
  return {
    id: t.id,
    subject: {
      id: t.id,
      type: "wall",
      tags: ["building", "wall", `side:${n.side}`]
    },
    coord: { kind: "edge", edge: n },
    footprint: {
      kind: "edge",
      coords: [{ kind: "edge", edge: n }]
    },
    rotation: t.rotation.y
  };
}, Jt = (t) => {
  const n = t.cell ?? q(t.position), e = ei(n, t.size);
  return {
    id: t.id,
    subject: {
      id: t.id,
      type: "block",
      tags: [
        "building",
        "block",
        ...t.materialId ? [`material:${t.materialId}`] : [],
        ...t.tags ?? []
      ]
    },
    coord: { kind: "cell", cell: n },
    footprint: {
      kind: "volume",
      coords: e.map((r) => ({ kind: "cell", cell: r }))
    }
  };
}, ri = (t) => t.tiles.map(Zt), ii = (t) => t.walls.map(ni), oi = (t, n, e = []) => [
  ...Array.from(t).flatMap(ri),
  ...Array.from(n).flatMap(ii),
  ...Array.from(e).map(Jt)
], pt = (t = [], n = [], e = {}) => {
  const r = [
    ...e.includeNoOverlapRule === !1 ? [] : [$r()],
    ...e.rules ?? []
  ], i = qr({
    adapter: ti,
    rules: []
  });
  for (const o of oi(t, n, e.blocks ?? [])) {
    const s = {
      subject: o.subject,
      coord: o.coord,
      footprint: o.footprint
    };
    i.place(o.rotation === void 0 ? s : { ...s, rotation: o.rotation });
  }
  for (const o of r)
    i.use(o);
  return i;
}, se = (t, n, e) => {
  const r = n.get(e);
  if (r) {
    for (const i of r) {
      const o = t.get(i);
      o && (o.delete(e), o.size === 0 && t.delete(i));
    }
    n.delete(e);
  }
}, ne = (t, n, e, r, i, o, s, a) => {
  const c = Math.floor(r / a), l = Math.floor(i / a), h = Math.floor(o / a), d = Math.floor(s / a), u = [];
  for (let f = c; f <= l; f++)
    for (let g = h; g <= d; g++) {
      const p = qt(f, g);
      let m = t.get(p);
      m || (m = /* @__PURE__ */ new Set(), t.set(p, m)), m.add(e), u.push(p);
    }
  n.set(e, u);
}, qe = (t, n, e, r, i, o) => {
  const s = Math.floor(n / o), a = Math.floor(e / o), c = Math.floor(r / o), l = Math.floor(i / o), h = /* @__PURE__ */ new Set();
  for (let d = s; d <= a; d++)
    for (let u = c; u <= l; u++) {
      const f = t.get(qt(d, u));
      if (f)
        for (const g of f)
          h.add(g);
    }
  return h;
}, ce = (t) => z.GRID_CELL_SIZE * t / 2, Xt = (t, n) => Math.abs(t.x - n.x) < t.halfSize + n.halfSize - 0.1 && Math.abs(t.z - n.z) < t.halfSize + n.halfSize - 0.1, Ji = (t, n, e, r) => {
  const i = z.GRID_CELL_SIZE, o = ce(r), s = z.HEIGHT_STEP * 0.5, a = qe(
    t,
    e.x - o,
    e.x + o,
    e.z - o,
    e.z + o,
    i
  );
  for (const c of a) {
    const l = n.get(c);
    if (l && Xt({ x: e.x, z: e.z, halfSize: o }, l) && Math.abs((l.y ?? 0) - e.y) < s)
      return !0;
  }
  return !1;
}, si = (t, n, e, r) => {
  const i = z.GRID_CELL_SIZE, o = ce(r), s = qe(
    t,
    e.x - o,
    e.x + o,
    e.z - o,
    e.z + o,
    i
  );
  let a = 0;
  for (const c of s) {
    const l = n.get(c);
    if (!l || !Xt({ x: e.x, z: e.z, halfSize: o }, l)) continue;
    const h = (l.y ?? 0) + z.HEIGHT_STEP;
    h > a && (a = h);
  }
  return a;
}, ai = (t, n, e, r) => {
  const o = qe(
    t,
    e.x - 0.5,
    e.x + 0.5,
    e.z - 0.5,
    e.z + 0.5,
    1
  );
  for (const s of o) {
    const a = n.get(s);
    if (a && Math.abs(a.x - e.x) < 0.5 && Math.abs(a.z - e.z) < 0.5 && Math.abs(a.rotY - r) < 0.1)
      return !0;
  }
  return !1;
};
function li(t) {
  return {
    version: 1,
    meshes: Array.from(t.meshes.values(), pe),
    wallGroups: Array.from(t.wallGroups.values(), pe),
    tileGroups: Array.from(t.tileGroups.values(), pe),
    blocks: t.blocks.map(pe),
    objects: t.objects.map(pe),
    showSnow: t.showSnow,
    showFog: t.showFog,
    fogColor: t.fogColor,
    weatherEffect: t.weatherEffect
  };
}
function pe(t) {
  return typeof structuredClone == "function" ? structuredClone(t) : JSON.parse(JSON.stringify(t));
}
function ci(t, n) {
  if (n) {
    t.meshes.clear(), t.wallGroups.clear(), t.tileGroups.clear(), t.tileIndex.clear(), t.tileCells.clear(), t.tileMeta.clear(), t.wallIndex.clear(), t.wallCells.clear(), t.wallMeta.clear();
    for (const e of n.meshes ?? [])
      t.meshes.set(e.id, { ...e });
    ui(t, n.tileGroups ?? []), di(t, n.wallGroups ?? []), t.blocks = (n.blocks ?? []).map((e) => ({
      ...e,
      cell: e.cell ?? q(e.position)
    })), t.objects = (n.objects ?? []).map((e) => ({ ...e })), t.showSnow = n.showSnow ?? !1, t.showFog = n.showFog ?? !1, t.fogColor = n.fogColor ?? "#cfd8e3", t.weatherEffect = n.weatherEffect ?? (t.showSnow ? "snow" : "none"), t.initialized = !0;
  }
}
function ui(t, n) {
  const e = z.GRID_CELL_SIZE;
  for (const r of n) {
    const i = r.tiles.map((o) => {
      const s = o.cell ?? q(o.position), a = {
        ...o,
        cell: s,
        footprint: o.footprint ?? le(s, o.size || 1)
      }, c = ce(a.size || 1);
      return t.tileMeta.set(a.id, {
        x: a.position.x,
        z: a.position.z,
        y: a.position.y,
        halfSize: c
      }), ne(
        t.tileIndex,
        t.tileCells,
        a.id,
        a.position.x - c,
        a.position.x + c,
        a.position.z - c,
        a.position.z + c,
        e
      ), a;
    });
    t.tileGroups.set(r.id, { ...r, tiles: i });
  }
}
function di(t, n) {
  for (const e of n) {
    const r = e.walls.map((i) => {
      const o = {
        ...i,
        edge: i.edge ?? Ie(i.position, i.rotation.y)
      }, s = 0.5;
      return t.wallMeta.set(o.id, {
        x: o.position.x,
        z: o.position.z,
        rotY: o.rotation.y
      }), ne(
        t.wallIndex,
        t.wallCells,
        o.id,
        o.position.x - s,
        o.position.x + s,
        o.position.z - s,
        o.position.z + s,
        1
      ), o;
    });
    t.wallGroups.set(e.id, { ...e, walls: r });
  }
}
gn();
const ke = "custom-tiles";
function hi(t) {
  return t.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}
function _e(t, n, e, r) {
  t.tileCategories.has(n) || t.tileCategories.set(n, { id: n, name: e, description: r, tileGroupIds: [] });
}
function De(t, n, e) {
  const r = t.tileCategories.get(n);
  !r || r.tileGroupIds.includes(e) || t.tileCategories.set(n, {
    ...r,
    tileGroupIds: [...r.tileGroupIds, e]
  });
}
function mt(t, n, e, r) {
  t.wallCategories.has(n) || t.wallCategories.set(n, { id: n, name: e, description: r, wallGroupIds: [] });
}
function yt(t, n, e) {
  const r = t.wallCategories.get(n);
  !r || r.wallGroupIds.includes(e) || t.wallCategories.set(n, {
    ...r,
    wallGroupIds: [...r.wallGroupIds, e]
  });
}
const Xi = pn()(
  mn((t, n) => ({
    initialized: !1,
    tileIndex: /* @__PURE__ */ new Map(),
    tileCells: /* @__PURE__ */ new Map(),
    tileMeta: /* @__PURE__ */ new Map(),
    wallIndex: /* @__PURE__ */ new Map(),
    wallCells: /* @__PURE__ */ new Map(),
    wallMeta: /* @__PURE__ */ new Map(),
    meshes: /* @__PURE__ */ new Map(),
    wallGroups: /* @__PURE__ */ new Map(),
    tileGroups: /* @__PURE__ */ new Map(),
    blocks: [],
    wallCategories: /* @__PURE__ */ new Map(),
    tileCategories: /* @__PURE__ */ new Map(),
    editMode: "none",
    showGrid: !0,
    gridSize: 100,
    snapToGrid: !0,
    hoverPosition: null,
    currentTileMultiplier: 1,
    currentTileHeight: 0,
    currentTileShape: "box",
    currentTileRotation: 0,
    currentTileMaterialId: null,
    currentCustomTileName: "Custom Tile",
    currentCustomTileColor: "#8f8f8f",
    currentCustomTileTextureUrl: "",
    currentWallRotation: 0,
    currentWallMaterialId: null,
    currentWallKind: "solid",
    objects: [],
    selectedTileObjectType: "none",
    currentTerrainColor: "#5a7a35",
    currentTerrainAccentColor: "#8fbc5a",
    selectedPlacedObjectType: "none",
    selectedModelObjectId: "door-basic",
    currentModelUrl: "",
    currentModelScale: 1,
    currentModelColor: "#9b7653",
    selectedWallId: null,
    selectedTileId: null,
    selectedBlockId: null,
    currentFlagWidth: 1.5,
    currentFlagHeight: 1,
    currentFlagImageUrl: "",
    currentFlagStyle: "flag",
    currentFireIntensity: 1.5,
    currentFireWidth: 1,
    currentFireHeight: 1.5,
    currentFireColor: "#ff6622",
    currentObjectRotation: 0,
    currentObjectPrimaryColor: "#f7bfd2",
    currentObjectSecondaryColor: "#5e3d30",
    currentTreeKind: "sakura",
    currentBillboardText: "HELLO",
    currentBillboardImageUrl: "",
    currentBillboardColor: "#00ff88",
    currentBillboardWidth: 0,
    currentBillboardHeight: 1.5,
    currentBillboardScale: 1,
    currentBillboardOffsetY: 0,
    currentBillboardElevation: 1,
    currentBillboardIntensity: 2,
    showSnow: !1,
    showFog: !1,
    fogColor: "#cfd8e3",
    weatherEffect: "none",
    initializeDefaults: () => t((e) => {
      if (e.initialized) return;
      e.meshes.set("brick-wall", {
        id: "brick-wall",
        color: "#8B4513",
        material: "STANDARD",
        roughness: 0.8
      }), e.meshes.set("glass-wall", {
        id: "glass-wall",
        material: "GLASS",
        opacity: 0.3,
        transparent: !0
      }), e.meshes.set("concrete-wall", {
        id: "concrete-wall",
        color: "#808080",
        material: "STANDARD",
        roughness: 0.9
      }), e.meshes.set("wood-floor", {
        id: "wood-floor",
        color: "#654321",
        material: "STANDARD",
        roughness: 0.6
      }), e.meshes.set("marble-floor", {
        id: "marble-floor",
        color: "#f0f0f0",
        material: "STANDARD",
        roughness: 0.2,
        metalness: 0.1
      }), e.meshes.set("sand-floor", {
        id: "sand-floor",
        color: "#c9ab75",
        material: "STANDARD",
        roughness: 0.96,
        metalness: 0.02
      }), e.meshes.set("snow-floor", {
        id: "snow-floor",
        color: "#eef5ff",
        material: "STANDARD",
        roughness: 0.9,
        metalness: 0
      }), e.wallCategories.set("interior-walls", {
        id: "interior-walls",
        name: "Interior Walls",
        description: "Walls for interior spaces",
        wallGroupIds: ["plaster-walls", "painted-walls"]
      }), e.wallCategories.set("exterior-walls", {
        id: "exterior-walls",
        name: "Exterior Walls",
        description: "Walls for building exteriors",
        wallGroupIds: ["brick-walls", "concrete-walls"]
      }), e.wallCategories.set("special-walls", {
        id: "special-walls",
        name: "Special Walls",
        description: "Glass and special material walls",
        wallGroupIds: ["glass-walls"]
      }), e.tileCategories.set("wood-floors", {
        id: "wood-floors",
        name: "Wood Floors",
        description: "Various wood flooring options",
        tileGroupIds: ["oak-floor", "pine-floor"]
      }), e.tileCategories.set("stone-floors", {
        id: "stone-floors",
        name: "Stone Floors",
        description: "Marble and stone flooring",
        tileGroupIds: ["marble-floor", "granite-floor"]
      }), e.tileCategories.set("natural-floors", {
        id: "natural-floors",
        name: "Natural Floors",
        description: "Sand and snow terrain flooring",
        tileGroupIds: ["sand-floor", "snow-floor"]
      }), e.wallGroups.set("brick-walls", {
        id: "brick-walls",
        name: "Brick Walls",
        frontMeshId: "brick-wall",
        backMeshId: "brick-wall",
        sideMeshId: "brick-wall",
        walls: []
      }), e.wallGroups.set("glass-walls", {
        id: "glass-walls",
        name: "Glass Walls",
        frontMeshId: "glass-wall",
        backMeshId: "glass-wall",
        sideMeshId: "glass-wall",
        walls: []
      }), e.wallGroups.set("concrete-walls", {
        id: "concrete-walls",
        name: "Concrete Walls",
        frontMeshId: "concrete-wall",
        backMeshId: "concrete-wall",
        sideMeshId: "concrete-wall",
        walls: []
      }), e.wallGroups.set("plaster-walls", {
        id: "plaster-walls",
        name: "Plaster Walls",
        frontMeshId: "brick-wall",
        // 임시로 brick 재질 사용
        backMeshId: "brick-wall",
        sideMeshId: "brick-wall",
        walls: []
      }), e.wallGroups.set("painted-walls", {
        id: "painted-walls",
        name: "Painted Walls",
        frontMeshId: "brick-wall",
        // 임시로 brick 재질 사용
        backMeshId: "brick-wall",
        sideMeshId: "brick-wall",
        walls: []
      });
      for (const l of lt) {
        const h = `wall-${l.id}-exterior`, d = `wall-${l.id}-interior`, u = `wall-${l.id}-side`, f = `${l.id}-walls`;
        mt(e, l.categoryId, l.categoryName, `${l.categoryName} wall presets`), yt(e, l.categoryId, f), e.meshes.set(h, {
          id: h,
          color: l.exteriorColor,
          material: "STANDARD",
          roughness: l.roughness ?? 0.78,
          metalness: l.metalness ?? 0.02
        }), e.meshes.set(d, {
          id: d,
          color: l.interiorColor,
          material: "STANDARD",
          roughness: l.roughness ?? 0.78,
          metalness: l.metalness ?? 0.02
        }), e.meshes.set(u, {
          id: u,
          color: l.sideColor,
          material: "STANDARD",
          roughness: l.roughness ?? 0.82,
          metalness: l.metalness ?? 0.02
        }), e.wallGroups.has(f) || e.wallGroups.set(f, {
          id: f,
          name: l.labelEn,
          frontMeshId: h,
          backMeshId: d,
          sideMeshId: u,
          defaultWallKind: l.defaultKind,
          walls: []
        });
      }
      e.tileGroups.set("oak-floor", {
        id: "oak-floor",
        name: "Oak Wood Floor",
        floorMeshId: "wood-floor",
        tiles: []
      }), e.tileGroups.set("pine-floor", {
        id: "pine-floor",
        name: "Pine Wood Floor",
        floorMeshId: "wood-floor",
        tiles: []
      }), e.tileGroups.set("marble-floor", {
        id: "marble-floor",
        name: "Marble Floor",
        floorMeshId: "marble-floor",
        tiles: []
      }), e.tileGroups.set("granite-floor", {
        id: "granite-floor",
        name: "Granite Floor",
        floorMeshId: "marble-floor",
        // 임시로 marble 재질 사용
        tiles: []
      }), e.tileGroups.set("sand-floor", {
        id: "sand-floor",
        name: "Sand Floor",
        floorMeshId: "sand-floor",
        tiles: []
      }), e.tileGroups.set("snow-floor", {
        id: "snow-floor",
        name: "Snow Floor",
        floorMeshId: "snow-floor",
        tiles: []
      });
      for (const l of ct) {
        const h = `tile-${l.id}`, d = `${l.id}-floor`;
        _e(e, l.categoryId, l.categoryName, `${l.categoryName} tile presets`), De(e, l.categoryId, d), e.meshes.has(h) || e.meshes.set(h, {
          id: h,
          color: l.color,
          material: l.material ?? "STANDARD",
          roughness: l.roughness ?? 0.65,
          metalness: l.metalness ?? 0.02,
          ...l.opacity !== void 0 ? { opacity: l.opacity } : {},
          ...l.transparent !== void 0 ? { transparent: l.transparent } : {},
          ...l.mapTextureUrl ? { mapTextureUrl: l.mapTextureUrl, textureUrl: l.mapTextureUrl } : {}
        }), e.tileGroups.has(d) || e.tileGroups.set(d, {
          id: d,
          name: l.labelEn,
          floorMeshId: h,
          tiles: []
        });
      }
      e.selectedWallCategoryId = "exterior-walls", e.selectedWallGroupId = "brick-walls", e.selectedTileCategoryId = "wood-floors", e.selectedTileGroupId = "oak-floor";
      const r = e.tileGroups.get("oak-floor"), i = e.tileGroups.get("marble-floor"), o = e.tileGroups.get("sand-floor"), s = e.tileGroups.get("snow-floor"), a = z.GRID_CELL_SIZE, c = (l, h) => {
        const d = h.cell ?? q(h.position), u = {
          ...h,
          cell: d,
          footprint: h.footprint ?? le(d, h.size || 1)
        };
        l.tiles.push(u);
        const f = ce(h.size || 1);
        e.tileMeta.set(u.id, { x: u.position.x, z: u.position.z, y: u.position.y, halfSize: f }), ne(
          e.tileIndex,
          e.tileCells,
          u.id,
          u.position.x - f,
          u.position.x + f,
          u.position.z - f,
          u.position.z + f,
          a
        );
      };
      if (r && i) {
        for (let l = -3; l <= 3; l++)
          for (let h = -3; h <= 3; h++) {
            const d = l * a, u = h * a, f = Math.abs(l) <= 1 && Math.abs(h) <= 1, g = l >= 2 && h === -2, p = l >= 2 && h === -3, m = l <= -2 && h >= 2, I = l === 3 && h === 2, T = l === -3 && h === 2, _ = l === -2 && h === 2, k = l === 2 && h === -3, C = (m ? o : void 0) ?? (p ? s : void 0) ?? (f ? i : void 0) ?? r, B = p ? 2 : g || m || I ? 1 : f ? l === 0 && h === 0 ? 2 : 1 : 0, x = {
              id: `demo-${l + 3}-${h + 3}`,
              position: { x: d, y: B * z.HEIGHT_STEP, z: u },
              tileGroupId: C.id,
              size: 1,
              shape: T ? "round" : _ ? "ramp" : k ? "stairs" : "box"
            };
            g ? c(C, { ...x, objectType: "grass", objectConfig: { grassDensity: 90 } }) : p ? c(C, { ...x, objectType: "snowfield" }) : m ? c(C, { ...x, objectType: "sand" }) : c(C, x);
          }
        e.objects.push(
          {
            id: "demo-sakura-1",
            type: "sakura",
            position: { x: 3 * a, y: 0, z: 0 },
            config: { size: a }
          },
          {
            id: "demo-flag-1",
            type: "flag",
            position: { x: 0, y: 0, z: -3 * a },
            config: { flagWidth: 1.5, flagHeight: 1, flagStyle: "flag" }
          },
          {
            id: "demo-fire-1",
            type: "fire",
            position: { x: 3 * a, y: z.HEIGHT_STEP, z: 2 * a },
            config: { fireIntensity: 1.5 }
          }
        );
      }
      e.initialized = !0;
    }),
    addMesh: (e) => t((r) => {
      r.meshes.set(e.id, e);
    }),
    updateMesh: (e, r) => t((i) => {
      const o = i.meshes.get(e);
      o && i.meshes.set(e, { ...o, ...r });
    }),
    removeMesh: (e) => t((r) => {
      r.meshes.delete(e);
    }),
    addWallGroup: (e) => t((r) => {
      r.wallGroups.set(e.id, e);
    }),
    updateWallGroup: (e, r) => t((i) => {
      const o = i.wallGroups.get(e);
      o && i.wallGroups.set(e, { ...o, ...r });
    }),
    removeWallGroup: (e) => t((r) => {
      const i = r.wallGroups.get(e);
      if (i)
        for (const o of i.walls)
          se(r.wallIndex, r.wallCells, o.id), r.wallMeta.delete(o.id);
      r.wallGroups.delete(e);
    }),
    addWall: (e, r) => t((i) => {
      const o = i.wallGroups.get(e);
      if (o) {
        const s = r.materialId ?? i.currentWallMaterialId, a = r.wallKind ?? i.currentWallKind ?? o.defaultWallKind ?? "solid", c = {
          ...r,
          ...s ? { materialId: s } : {},
          wallKind: a,
          edge: r.edge ?? Ie(r.position, r.rotation.y)
        };
        o.walls.push(c);
        const l = 0.5;
        i.wallMeta.set(c.id, { x: c.position.x, z: c.position.z, rotY: c.rotation.y }), ne(
          i.wallIndex,
          i.wallCells,
          c.id,
          c.position.x - l,
          c.position.x + l,
          c.position.z - l,
          c.position.z + l,
          1
        );
      }
    }),
    updateWall: (e, r, i) => t((o) => {
      const s = o.wallGroups.get(e);
      if (s) {
        const a = s.walls.findIndex((c) => c.id === r);
        if (a !== -1) {
          const c = s.walls[a];
          if (c) {
            const l = i.position !== void 0 || i.rotation !== void 0;
            l && (se(o.wallIndex, o.wallCells, r), o.wallMeta.delete(r)), Object.assign(c, i), (i.position !== void 0 || i.rotation !== void 0) && (c.edge = i.edge ?? Ie(c.position, c.rotation.y)), l && (o.wallMeta.set(c.id, { x: c.position.x, z: c.position.z, rotY: c.rotation.y }), ne(
              o.wallIndex,
              o.wallCells,
              c.id,
              c.position.x - 0.5,
              c.position.x + 0.5,
              c.position.z - 0.5,
              c.position.z + 0.5,
              1
            ));
          }
        }
      }
    }),
    moveWallToGroup: (e, r) => t((i) => {
      const o = i.wallGroups.get(r);
      if (!o) return;
      let s, a = -1;
      for (const d of i.wallGroups.values())
        if (a = d.walls.findIndex((u) => u.id === e), a !== -1) {
          s = d;
          break;
        }
      if (!s || a === -1 || s.id === r) {
        i.selectedWallGroupId = r;
        return;
      }
      const c = s.walls[a];
      if (!c) return;
      const { materialId: l, ...h } = c;
      s.walls.splice(a, 1), o.walls.push({
        ...h,
        wallGroupId: r
      }), i.selectedWallGroupId = r;
    }),
    removeWall: (e, r) => t((i) => {
      const o = i.wallGroups.get(e);
      o && (se(i.wallIndex, i.wallCells, r), i.wallMeta.delete(r), o.walls = o.walls.filter((s) => s.id !== r), i.selectedWallId === r && (i.selectedWallId = null));
    }),
    addTileGroup: (e) => t((r) => {
      r.tileGroups.set(e.id, e);
    }),
    updateTileGroup: (e, r) => t((i) => {
      const o = i.tileGroups.get(e);
      o && i.tileGroups.set(e, { ...o, ...r });
    }),
    removeTileGroup: (e) => t((r) => {
      const i = r.tileGroups.get(e);
      if (i)
        for (const o of i.tiles)
          se(r.tileIndex, r.tileCells, o.id), r.tileMeta.delete(o.id);
      r.tileGroups.delete(e);
    }),
    addTile: (e, r) => t((i) => {
      const o = i.tileGroups.get(e);
      if (o) {
        const s = i.selectedTileObjectType === "grass" ? {
          grassDensity: 90,
          terrainColor: i.currentTerrainColor,
          terrainAccentColor: i.currentTerrainAccentColor
        } : i.selectedTileObjectType === "sand" || i.selectedTileObjectType === "snowfield" ? {
          terrainColor: i.currentTerrainColor,
          terrainAccentColor: i.currentTerrainAccentColor
        } : void 0, a = r.cell ?? q(r.position), c = r.materialId ?? i.currentTileMaterialId, l = {
          ...r,
          cell: a,
          footprint: r.footprint ?? le(a, r.size || 1),
          ...c ? { materialId: c } : {},
          objectType: i.selectedTileObjectType,
          ...s ? { objectConfig: s } : {}
        };
        o.tiles.push(l);
        const h = z.GRID_CELL_SIZE, d = ce(l.size || 1);
        i.tileMeta.set(l.id, { x: l.position.x, z: l.position.z, y: l.position.y, halfSize: d }), ne(
          i.tileIndex,
          i.tileCells,
          l.id,
          l.position.x - d,
          l.position.x + d,
          l.position.z - d,
          l.position.z + d,
          h
        );
      }
    }),
    updateTile: (e, r, i) => t((o) => {
      const s = o.tileGroups.get(e);
      if (s) {
        const a = s.tiles.findIndex((c) => c.id === r);
        if (a !== -1) {
          const c = s.tiles[a];
          if (c) {
            const l = i.position !== void 0 || i.size !== void 0;
            if (l && (se(o.tileIndex, o.tileCells, r), o.tileMeta.delete(r)), Object.assign(c, i), i.position !== void 0 || i.size !== void 0 || i.cell !== void 0) {
              const h = i.cell ?? q(c.position);
              c.cell = h, c.footprint = i.footprint ?? le(h, c.size || 1);
            }
            if (l) {
              const h = z.GRID_CELL_SIZE, d = ce(c.size || 1);
              o.tileMeta.set(c.id, { x: c.position.x, z: c.position.z, y: c.position.y, halfSize: d }), ne(
                o.tileIndex,
                o.tileCells,
                c.id,
                c.position.x - d,
                c.position.x + d,
                c.position.z - d,
                c.position.z + d,
                h
              );
            }
          }
        }
      }
    }),
    removeTile: (e, r) => t((i) => {
      const o = i.tileGroups.get(e);
      o && (se(i.tileIndex, i.tileCells, r), i.tileMeta.delete(r), o.tiles = o.tiles.filter((s) => s.id !== r), i.selectedTileId === r && (i.selectedTileId = null));
    }),
    addBlock: (e) => t((r) => {
      const i = e.cell ?? q(e.position);
      r.blocks.push({
        ...e,
        cell: i
      });
    }),
    updateBlock: (e, r) => t((i) => {
      const o = i.blocks.findIndex((a) => a.id === e);
      if (o === -1) return;
      const s = i.blocks[o];
      s && (Object.assign(s, r), (r.position !== void 0 || r.cell !== void 0) && (s.cell = r.cell ?? q(s.position)));
    }),
    removeBlock: (e) => t((r) => {
      r.blocks = r.blocks.filter((i) => i.id !== e), r.selectedBlockId === e && (r.selectedBlockId = null);
    }),
    setEditMode: (e) => t((r) => {
      r.editMode = e, e !== "none" && (r.showGrid = !0);
    }),
    setShowGrid: (e) => t((r) => {
      r.showGrid = e;
    }),
    setGridSize: (e) => t((r) => {
      r.gridSize = e;
    }),
    setSnapToGrid: (e) => t((r) => {
      r.snapToGrid = e;
    }),
    setHoverPosition: (e) => t((r) => {
      r.hoverPosition = e;
    }),
    setTileMultiplier: (e) => t((r) => {
      r.currentTileMultiplier = e;
    }),
    setTileHeight: (e) => t((r) => {
      const i = Math.max(0, Math.min(6, Math.round(e)));
      r.currentTileHeight = r.currentTileShape === "stairs" || r.currentTileShape === "ramp" ? Math.max(1, i) : i;
    }),
    setTileShape: (e) => t((r) => {
      r.currentTileShape = e, (e === "stairs" || e === "ramp") && r.currentTileHeight === 0 && (r.currentTileHeight = 1);
    }),
    setTileRotation: (e) => t((r) => {
      r.currentTileRotation = e;
    }),
    setCurrentTileMaterialId: (e) => t((r) => {
      r.currentTileMaterialId = e;
    }),
    setCustomTileDraft: (e) => t((r) => {
      e.name !== void 0 && (r.currentCustomTileName = e.name), e.color !== void 0 && (r.currentCustomTileColor = e.color), e.textureUrl !== void 0 && (r.currentCustomTileTextureUrl = e.textureUrl);
    }),
    applyTilePreset: (e) => t((r) => {
      const i = ct.find((a) => a.id === e);
      if (!i) return;
      const o = `tile-${i.id}`, s = `${i.id}-floor`;
      _e(r, i.categoryId, i.categoryName, `${i.categoryName} tile presets`), De(r, i.categoryId, s), r.meshes.set(o, {
        id: o,
        color: i.color,
        material: i.material ?? "STANDARD",
        roughness: i.roughness ?? 0.65,
        metalness: i.metalness ?? 0.02,
        ...i.opacity !== void 0 ? { opacity: i.opacity } : {},
        ...i.transparent !== void 0 ? { transparent: i.transparent } : {},
        ...i.mapTextureUrl ? { mapTextureUrl: i.mapTextureUrl, textureUrl: i.mapTextureUrl } : {}
      }), r.tileGroups.has(s) || r.tileGroups.set(s, {
        id: s,
        name: i.labelEn,
        floorMeshId: o,
        tiles: []
      }), r.selectedTileCategoryId = i.categoryId, r.selectedTileGroupId = s, r.currentTileMaterialId = null;
    }),
    applyCustomTile: () => t((e) => {
      const r = e.currentCustomTileName.trim() || "Custom Tile", i = e.currentCustomTileColor || "#8f8f8f", o = e.currentCustomTileTextureUrl.trim(), s = hi(`${r}-${i}-${o || "color"}`) || "custom-tile", a = `custom-tile-${s}`, c = `custom-tile-group-${s}`;
      _e(e, ke, "Custom Tiles", "User-created tile maps"), De(e, ke, c), e.meshes.set(a, {
        id: a,
        color: i,
        material: "STANDARD",
        roughness: 0.62,
        metalness: 0.02,
        ...o ? { mapTextureUrl: o, textureUrl: o } : {}
      }), e.tileGroups.has(c) || e.tileGroups.set(c, {
        id: c,
        name: r,
        floorMeshId: a,
        tiles: []
      }), e.selectedTileCategoryId = ke, e.selectedTileGroupId = c, e.currentTileMaterialId = null;
    }),
    setWallRotation: (e) => t((r) => {
      r.currentWallRotation = e;
    }),
    setCurrentWallMaterialId: (e) => t((r) => {
      r.currentWallMaterialId = e;
    }),
    setWallKind: (e) => t((r) => {
      if (r.currentWallKind = e, !!r.selectedWallId)
        for (const i of r.wallGroups.values()) {
          const o = i.walls.find((s) => s.id === r.selectedWallId);
          if (o) {
            o.wallKind = e;
            return;
          }
        }
    }),
    applyWallPreset: (e) => t((r) => {
      const i = lt.find((l) => l.id === e);
      if (!i) return;
      const o = `wall-${i.id}-exterior`, s = `wall-${i.id}-interior`, a = `wall-${i.id}-side`, c = `${i.id}-walls`;
      mt(r, i.categoryId, i.categoryName, `${i.categoryName} wall presets`), yt(r, i.categoryId, c), r.meshes.set(o, {
        id: o,
        color: i.exteriorColor,
        material: "STANDARD",
        roughness: i.roughness ?? 0.78,
        metalness: i.metalness ?? 0.02
      }), r.meshes.set(s, {
        id: s,
        color: i.interiorColor,
        material: "STANDARD",
        roughness: i.roughness ?? 0.78,
        metalness: i.metalness ?? 0.02
      }), r.meshes.set(a, {
        id: a,
        color: i.sideColor,
        material: "STANDARD",
        roughness: i.roughness ?? 0.82,
        metalness: i.metalness ?? 0.02
      }), r.wallGroups.has(c) || r.wallGroups.set(c, {
        id: c,
        name: i.labelEn,
        frontMeshId: o,
        backMeshId: s,
        sideMeshId: a,
        defaultWallKind: i.defaultKind,
        walls: []
      }), r.selectedWallCategoryId = i.categoryId, r.selectedWallGroupId = c, r.currentWallKind = i.defaultKind, r.currentWallMaterialId = null;
    }),
    snapPosition: (e) => {
      const { snapToGrid: r } = n();
      return r ? Zr(e) : e;
    },
    checkTilePosition: (e) => {
      const {
        currentTileMultiplier: r,
        currentTileRotation: i,
        currentTileShape: o,
        selectedTileGroupId: s,
        selectedTileObjectType: a,
        blocks: c,
        tileGroups: l,
        wallGroups: h
      } = n(), d = q(e), u = Zt({
        id: "__candidate_tile__",
        position: e,
        size: r,
        shape: o,
        rotation: i,
        objectType: a,
        cell: d,
        footprint: le(d, r)
      }), f = pt(l.values(), h.values(), { blocks: c }), g = {
        subject: u.subject,
        coord: u.coord,
        footprint: u.footprint
      };
      return !f.canPlace(u.rotation === void 0 ? g : { ...g, rotation: u.rotation }).ok;
    },
    checkBlockPosition: (e) => {
      const { blocks: r, tileGroups: i, wallGroups: o } = n(), s = Jt({
        id: "__candidate_block__",
        position: e.position,
        ...e.cell ? { cell: e.cell } : {},
        ...e.size ? { size: e.size } : {}
      });
      return !pt(i.values(), o.values(), { blocks: r }).canPlace({
        subject: s.subject,
        coord: s.coord,
        footprint: s.footprint
      }).ok;
    },
    getSupportHeightAt: (e) => {
      const { tileIndex: r, tileMeta: i, currentTileMultiplier: o } = n();
      return si(r, i, e, o);
    },
    checkWallPosition: (e, r) => {
      const { wallIndex: i, wallMeta: o } = n();
      return ai(i, o, e, r);
    },
    isInEditMode: () => {
      const { editMode: e } = n();
      return e !== "none";
    },
    serialize: () => li(n()),
    hydrate: (e) => t((r) => {
      ci(r, e);
    }),
    addWallCategory: (e) => t((r) => {
      r.wallCategories.set(e.id, e);
    }),
    updateWallCategory: (e, r) => t((i) => {
      const o = i.wallCategories.get(e);
      o && i.wallCategories.set(e, { ...o, ...r });
    }),
    removeWallCategory: (e) => t((r) => {
      r.wallCategories.delete(e);
    }),
    setSelectedWallCategory: (e) => t((r) => {
      r.selectedWallCategoryId = e;
      const i = r.wallCategories.get(e);
      if (i && i.wallGroupIds.length > 0) {
        const o = i.wallGroupIds[0];
        o && (r.selectedWallGroupId = o);
      }
    }),
    addTileCategory: (e) => t((r) => {
      r.tileCategories.set(e.id, e);
    }),
    updateTileCategory: (e, r) => t((i) => {
      const o = i.tileCategories.get(e);
      o && i.tileCategories.set(e, { ...o, ...r });
    }),
    removeTileCategory: (e) => t((r) => {
      r.tileCategories.delete(e);
    }),
    setSelectedTileCategory: (e) => t((r) => {
      r.selectedTileCategoryId = e;
      const i = r.tileCategories.get(e);
      if (i && i.tileGroupIds.length > 0) {
        const o = i.tileGroupIds[0];
        o && (r.selectedTileGroupId = o);
      }
    }),
    setSelectedTileObjectType: (e) => t((r) => {
      r.selectedTileObjectType = e, e === "grass" ? (r.currentTerrainColor = "#5a7a35", r.currentTerrainAccentColor = "#8fbc5a") : e === "water" ? (r.currentTerrainColor = "#2f8dbd", r.currentTerrainAccentColor = "#9ed6c8") : e === "sand" ? (r.currentTerrainColor = "#b89b66", r.currentTerrainAccentColor = "#e0c27a") : e === "snowfield" && (r.currentTerrainColor = "#dcecff", r.currentTerrainAccentColor = "#ffffff");
    }),
    setTerrainColors: (e, r) => t((i) => {
      i.currentTerrainColor = e, r !== void 0 && (i.currentTerrainAccentColor = r);
    }),
    setSelectedPlacedObjectType: (e) => t((r) => {
      r.selectedPlacedObjectType = e;
    }),
    setSelectedModelObjectId: (e) => t((r) => {
      r.selectedModelObjectId = e;
    }),
    setModelUrl: (e) => t((r) => {
      r.currentModelUrl = e;
    }),
    setModelScale: (e) => t((r) => {
      r.currentModelScale = Math.max(0.1, Math.min(10, e));
    }),
    setModelColor: (e) => t((r) => {
      r.currentModelColor = e;
    }),
    setSelectedWallId: (e) => t((r) => {
      r.selectedWallId = e, e && (r.selectedTileId = null, r.selectedBlockId = null);
    }),
    setSelectedTileId: (e) => t((r) => {
      r.selectedTileId = e, e && (r.selectedWallId = null, r.selectedBlockId = null);
    }),
    setSelectedBlockId: (e) => t((r) => {
      r.selectedBlockId = e, e && (r.selectedWallId = null, r.selectedTileId = null);
    }),
    addObject: (e) => t((r) => {
      r.objects.push(e);
    }),
    removeObject: (e) => t((r) => {
      r.objects = r.objects.filter((i) => i.id !== e);
    }),
    updateObject: (e, r) => t((i) => {
      const o = i.objects.findIndex((s) => s.id === e);
      if (o !== -1) {
        const s = i.objects[o];
        s && Object.assign(s, r);
      }
    }),
    setFlagWidth: (e) => t((r) => {
      r.currentFlagWidth = e;
    }),
    setFlagHeight: (e) => t((r) => {
      r.currentFlagHeight = e;
    }),
    setFlagImageUrl: (e) => t((r) => {
      r.currentFlagImageUrl = e;
    }),
    setFlagStyle: (e) => t((r) => {
      r.currentFlagStyle = e;
      const i = Fe[e];
      r.currentFlagWidth = i.defaultWidth, r.currentFlagHeight = i.defaultHeight;
    }),
    setFireIntensity: (e) => t((r) => {
      r.currentFireIntensity = e;
    }),
    setFireWidth: (e) => t((r) => {
      r.currentFireWidth = e;
    }),
    setFireHeight: (e) => t((r) => {
      r.currentFireHeight = e;
    }),
    setFireColor: (e) => t((r) => {
      r.currentFireColor = e;
    }),
    setObjectRotation: (e) => t((r) => {
      r.currentObjectRotation = e;
    }),
    setObjectPrimaryColor: (e) => t((r) => {
      r.currentObjectPrimaryColor = e;
    }),
    setObjectSecondaryColor: (e) => t((r) => {
      r.currentObjectSecondaryColor = e;
    }),
    setTreeKind: (e) => t((r) => {
      const i = hr[e];
      r.currentTreeKind = e, r.currentObjectPrimaryColor = i.primaryColor, r.currentObjectSecondaryColor = i.secondaryColor;
    }),
    setBillboardText: (e) => t((r) => {
      r.currentBillboardText = e;
    }),
    setBillboardImageUrl: (e) => t((r) => {
      r.currentBillboardImageUrl = e;
    }),
    setBillboardColor: (e) => t((r) => {
      r.currentBillboardColor = e;
    }),
    setBillboardWidth: (e) => t((r) => {
      r.currentBillboardWidth = e;
    }),
    setBillboardHeight: (e) => t((r) => {
      r.currentBillboardHeight = e;
    }),
    setBillboardScale: (e) => t((r) => {
      r.currentBillboardScale = e;
    }),
    setBillboardOffsetY: (e) => t((r) => {
      r.currentBillboardOffsetY = e;
    }),
    setBillboardElevation: (e) => t((r) => {
      r.currentBillboardElevation = e;
    }),
    setBillboardIntensity: (e) => t((r) => {
      r.currentBillboardIntensity = e;
    }),
    setShowSnow: (e) => t((r) => {
      r.showSnow = e, r.weatherEffect = e ? "snow" : "none";
    }),
    setShowFog: (e) => t((r) => {
      r.showFog = e;
    }),
    setFogColor: (e) => t((r) => {
      r.fogColor = e;
    }),
    setWeatherEffect: (e) => t((r) => {
      r.weatherEffect = e, r.showSnow = e === "snow";
    })
  }))
), fi = 120, gi = 800, pi = 80, mi = 0.04, yi = 96;
function bt(t, n, e, r, i) {
  if (!t || t.shouldRun !== e || r - t.startedAt > i) return !1;
  const o = t.targetX - n.x, s = t.targetZ - n.z;
  return o * o + s * s <= mi;
}
function ae(t, n, e, r) {
  const i = Math.atan2(
    n.z - e.z,
    n.x - e.x
  );
  t.updateMouse({
    target: n,
    angle: i,
    position: new y.Vector2(n.x, n.z),
    isActive: !0,
    shouldRun: r
  });
}
function Yi(t = {}) {
  const {
    minHeight: n = 0.5,
    offsetY: e = 0.5,
    useNavigation: r = !0,
    simplifyPath: i = !0,
    waypointThreshold: o = 1,
    fallbackToDirectOnFail: s = !0,
    agentRadius: a = 0.35,
    agentWidth: c,
    agentDepth: l,
    clearance: h
  } = t, { activeState: d } = Nt(), u = Kt(), f = G(null), g = G(null), p = G(null), m = !!d?.position;
  W(() => () => {
    p.current && (clearTimeout(p.current), p.current = null);
  }, []);
  const I = R((k, C, B) => {
    if (B !== "ground" || !d?.position)
      return !1;
    try {
      const x = d.position, w = Ye(k.point.x, k.point.y, k.point.z), A = Math.max(w.y + e, n), b = Ye(w.x, A, w.z), S = x.clone(), M = performance.now();
      if (bt(f.current, b, C, M, gi) || bt(g.current, b, C, M, fi))
        return !0;
      const j = rt(), H = {
        requestId: j,
        targetX: b.x,
        targetZ: b.z,
        shouldRun: C,
        startedAt: M
      };
      return f.current = H, g.current = H, Pn([b]), p.current && (clearTimeout(p.current), p.current = null), r ? (p.current = setTimeout(() => {
        p.current = null, Y.getInstance().init().then(() => {
          if (!it(j)) return;
          const P = Y.getInstance(), U = {
            agentRadius: a,
            ...c !== void 0 ? { agentWidth: c } : {},
            ...l !== void 0 ? { agentDepth: l } : {},
            ...h !== void 0 ? { clearance: h } : {}
          };
          if (b.y = Math.max(P.sampleHeight(b.x, b.z) + e, n), !P.hasNavigationConstraints()) {
            ie([b], o, C), ae(u, b, S, C);
            return;
          }
          if (P.hasLineOfSight(S.x, S.z, b.x, b.z, U)) {
            ie([b], o, C), ae(u, b, S, C);
            return;
          }
          const F = P.findPath(
            S.x,
            S.z,
            b.x,
            b.z,
            {
              weighted: !0,
              ...U
            }
          );
          if (F.length === 0) {
            Re(), s && !P.hasNavigationConstraints() && P.isWalkable(b.x, b.z, U) && (ie([b], o, C), ae(u, b, S, C));
            return;
          }
          const J = (i && F.length <= yi ? P.smoothPath(
            F,
            [S.x, S.y, S.z],
            [b.x, b.y, b.z],
            U
          ) : F).map((ge) => new y.Vector3(ge[0], ge[1], ge[2])).filter((ge) => ge.distanceToSquared(S) > o * o), fe = J[J.length - 1];
          (!fe || fe.distanceToSquared(b) > o * o) && J.push(b);
          const Je = J.length > 0 ? J : [b];
          ie(Je, o, C), ae(u, Je[0] ?? b, S, C);
        }).catch(() => {
          it(j) && (Re(), s && (ie([b], o, C), ae(u, b, S, C)));
        }).finally(() => {
          f.current?.requestId === j && (f.current = null);
        });
      }, pi), !0) : (f.current = null, ie([b], o, C), ae(u, b, S, C), !0);
    } catch (x) {
      return console.error("moveClicker error:", x), !1;
    }
  }, [
    d,
    l,
    a,
    c,
    h,
    s,
    u,
    n,
    e,
    i,
    r,
    o
  ]), T = R(() => {
    try {
      if (!m) return;
      f.current = null, p.current && (clearTimeout(p.current), p.current = null), rt(), Re(), u.updateMouse({ isActive: !1, shouldRun: !1 });
    } catch {
    }
  }, [u, m]), _ = R((k) => {
    I(k, !1, "ground");
  }, [I]);
  return {
    moveClicker: I,
    stopClicker: T,
    onClick: _,
    isReady: m
  };
}
export {
  Et as $,
  ii as A,
  ni as B,
  Ie as C,
  Jr as D,
  gt as E,
  Yr as F,
  Xi as G,
  _i as H,
  Di as I,
  Fe as J,
  lt as K,
  ct as L,
  Wi as M,
  hr as N,
  Ni as O,
  Oi as P,
  fr as Q,
  Pi as R,
  Fi as S,
  ki as T,
  Yi as U,
  Kt as V,
  Wt as W,
  zi as X,
  Ri as Y,
  Nt as Z,
  Br as _,
  Jt as a,
  Gt as a0,
  Ke as a1,
  Be as a2,
  At as a3,
  bn as a4,
  Ui as a5,
  _t as a6,
  Dt as a7,
  wn as a8,
  z as a9,
  wr as aa,
  br as ab,
  Pt as ac,
  Ot as ad,
  Ft as ae,
  Lt as af,
  Ki as ag,
  Li as ah,
  Bi as ai,
  Ut as aj,
  ji as ak,
  Dr as al,
  Hi as am,
  Wr as an,
  Er as ao,
  xn as ap,
  Y as aq,
  $n as ar,
  Xr as b,
  pt as c,
  oi as d,
  $ as e,
  ti as f,
  Vi as g,
  Qr as h,
  $i as i,
  si as j,
  Ji as k,
  ai as l,
  ne as m,
  qi as n,
  ei as o,
  qt as p,
  qe as q,
  le as r,
  Zr as s,
  ri as t,
  Zi as u,
  ce as v,
  Xt as w,
  q as x,
  Zt as y,
  se as z
};
