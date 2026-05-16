import "reflect-metadata";
import { create as z } from "zustand";
import { devtools as Y, subscribeWithSelector as H } from "zustand/middleware";
import * as l from "three";
import { Vector3 as E } from "three";
class h {
  static registry = /* @__PURE__ */ new Map();
  static register(e, t) {
    h.registry.has(e) && console.warn(`[BridgeRegistry] Domain '${e}' is already registered. Overwriting.`), h.registry.set(e, t);
  }
  static get(e) {
    return h.registry.get(e);
  }
  static list() {
    return Array.from(h.registry.keys());
  }
}
class b {
  static instance;
  enabled = !1;
  level = "info";
  constructor() {
  }
  static getInstance() {
    return b.instance || (b.instance = new b()), b.instance;
  }
  enable() {
    this.enabled = !0;
  }
  disable() {
    this.enabled = !1;
  }
  setLevel(e) {
    this.level = e;
  }
  shouldLog(e) {
    if (!this.enabled) return !1;
    const t = {
      error: 0,
      warn: 1,
      info: 2,
      log: 3
    };
    return t[e] <= t[this.level];
  }
  log(e, ...t) {
    this.shouldLog("log") && console.log(`[LOG] ${e}`, ...t);
  }
  info(e, ...t) {
    this.shouldLog("info") && console.info(`[INFO] ${e}`, ...t);
  }
  warn(e, ...t) {
    this.shouldLog("warn") && console.warn(`[WARN] ${e}`, ...t);
  }
  error(e, ...t) {
    this.shouldLog("error") && console.error(`[ERROR] ${e}`, ...t);
  }
}
const d = b.getInstance();
function y(n) {
  return typeof n == "function" ? n.name : typeof n == "symbol" ? n.toString() : String(n);
}
class w {
  static instance;
  factories = /* @__PURE__ */ new Map();
  singletons = /* @__PURE__ */ new Map();
  singletonTokens = /* @__PURE__ */ new Set();
  resolving = /* @__PURE__ */ new Set();
  constructor() {
  }
  static getInstance() {
    return w.instance || (w.instance = new w()), w.instance;
  }
  register(e, t, s = !0) {
    this.factories.set(e, () => t()), s ? this.singletonTokens.add(e) : (this.singletonTokens.delete(e), this.singletons.delete(e));
  }
  registerService(e) {
    const t = Reflect.getMetadata("di:token", e) || e;
    if (this.factories.has(t))
      return;
    const s = Reflect.getMetadata("di:singleton", e) ?? !0, a = () => this.createInstance(e);
    this.register(t, a, s);
  }
  resolve(e) {
    if (this.resolving.has(e)) {
      const a = `DIContainer: Circular dependency detected: ${Array.from(this.resolving).map(y).join(" -> ")} -> ${y(
        e
      )}`;
      throw d.error(a), new Error(a);
    }
    if (this.singletons.has(e))
      return this.singletons.get(e);
    const t = this.factories.get(e);
    if (!t) {
      if (typeof e == "function" && "prototype" in e)
        return this.registerService(e), this.resolve(e);
      throw new Error(`DIContainer: No factory registered for token: ${y(e)}`);
    }
    this.resolving.add(e);
    try {
      const s = t();
      return this.singletonTokens.has(e) && this.singletons.set(e, s), s;
    } finally {
      this.resolving.delete(e);
    }
  }
  createInstance(e) {
    const t = Reflect.getMetadata("di:paramtypes", e) || [], a = (Reflect.getMetadata("design:paramtypes", e) || []).map((i, o) => {
      const c = t[o] || i;
      if (!c)
        throw new Error(`DIContainer: Cannot resolve dependency for parameter ${o} of ${e.name}. Type is not inferable and no @Inject decorator found.`);
      try {
        return this.resolve(c);
      } catch (S) {
        const I = S instanceof Error ? S.message : String(S);
        throw d.error(`DIContainer: Failed to resolve parameter ${o} (${y(c)}) for ${e.name}.`, I), new Error(`Could not construct ${e.name}.`);
      }
    }), r = new e(...a);
    return this.autowireProperties(r), r;
  }
  injectProperties(e) {
    this.autowireProperties(e);
  }
  autowireProperties(e) {
    const t = e.constructor, s = Reflect.getMetadata("autowired", t) || Reflect.getMetadata("autowired", t.prototype) || [];
    for (const r of s) {
      const i = Reflect.getMetadata("design:type", t.prototype, r) || Reflect.getMetadata("design:type", e, r);
      if (i)
        try {
          e[r] = this.resolve(i);
        } catch (o) {
          const c = o instanceof Error ? o.message : String(o);
          d.warn(`DIContainer: Failed to autowire property '${r}' on '${t.name}'.`, c);
        }
    }
    const a = Reflect.getMetadata("di:properties", t) || {};
    for (const r in a) {
      const i = a[r];
      try {
        e[r] = this.resolve(i);
      } catch (o) {
        const c = o instanceof Error ? o.message : String(o);
        d.warn(`DIContainer: Failed to inject property '${r}' with token '${String(i)}' on '${t.name}'.`, c);
      }
    }
  }
  clear() {
    this.factories.clear(), this.singletons.clear(), this.singletonTokens.clear(), this.resolving.clear();
  }
}
class p {
  static instances = /* @__PURE__ */ new Map();
  static create(e) {
    const t = p.instances.get(e);
    if (t)
      return t;
    const s = h.get(e);
    if (!s)
      return d.error(`[BridgeFactory] No bridge registered for domain: ${e}`), null;
    try {
      const a = w.getInstance().resolve(s);
      return p.instances.set(e, a), d.info(`[BridgeFactory] Created bridge instance for domain: ${e}`), a;
    } catch (a) {
      return d.error(
        `[BridgeFactory] Failed to create bridge for domain: ${e}`,
        a instanceof Error ? a : String(a)
      ), null;
    }
  }
  static get(e) {
    const t = p.instances.get(e);
    return t || null;
  }
  static getOrCreate(e) {
    return p.get(e) ?? p.create(e);
  }
  static has(e) {
    return p.instances.has(e);
  }
  static dispose(e) {
    const t = p.instances.get(e);
    t && (d.info(`[BridgeFactory] Disposing bridge instance for domain: ${e}`), t.dispose(), p.instances.delete(e));
  }
  static disposeAll() {
    d.info(`[BridgeFactory] Disposing all bridge instances (${p.instances.size} total)`), p.instances.forEach((e, t) => {
      d.info(`[BridgeFactory] Disposing: ${t}`), e.dispose();
    }), p.instances.clear();
  }
  static listDomains() {
    return h.list();
  }
  static listActiveInstances() {
    return Array.from(p.instances.keys());
  }
  static getInstanceCount() {
    return p.instances.size;
  }
}
const X = !0;
class Q {
  systems = /* @__PURE__ */ new Map();
  safeDispose(e) {
    if (e)
      try {
        e.dispose();
      } catch {
      }
  }
  register(e, t) {
    const s = this.systems.get(e);
    s !== t && (s && X && console.warn(`System with type "${e}" is already registered. Overwriting.`), this.systems.set(e, t));
  }
  get(e) {
    return this.systems.get(e);
  }
  getAll() {
    return this.systems;
  }
  unregister(e) {
    if (!this.systems.has(e)) return;
    const t = this.systems.get(e);
    this.safeDispose(t), this.systems.delete(e);
  }
  clear() {
    this.systems.forEach((e) => this.safeDispose(e)), this.systems.clear();
  }
}
const J = new Q();
function v(n) {
  return function(e, t, s) {
    const a = s.value;
    return s.value = function(...r) {
      try {
        return a.apply(this, r);
      } catch (i) {
        const o = i instanceof Error ? i : String(i);
        return d.error(
          `[${this.constructor.name}] Error in ${t}:`,
          o
        ), n;
      }
    }, s;
  };
}
function ee(n) {
  return function(e) {
    const t = new Proxy(e, {
      construct(s, a, r) {
        const i = Reflect.construct(s, a, r);
        return J.register(n, i), d.info(`[${e.name}] Registered as ${n} system`), i;
      }
    });
    return Object.defineProperty(t, "name", { value: e.name }), t;
  };
}
function Le(n = {}) {
  return function(e) {
    const t = /* @__PURE__ */ new WeakMap(), s = new Proxy(e, {
      construct(a, r, i) {
        const o = Reflect.construct(a, r, i), c = {
          animationFrameId: null,
          lastTime: 0,
          totalTime: 0,
          frameCount: 0
        };
        t.set(o, c);
        const S = () => {
          c.animationFrameId !== null && (cancelAnimationFrame(c.animationFrameId), c.animationFrameId = null, d.info(`[${e.name}] Runtime stopped`));
        }, I = () => {
          const k = (T) => {
            c.lastTime === 0 && (c.lastTime = T);
            const D = T - c.lastTime;
            c.lastTime = T, c.totalTime += D, c.frameCount++;
            const Z = {
              deltaTime: D,
              totalTime: c.totalTime,
              frameCount: c.frameCount
            };
            o.update && typeof o.update == "function" && o.update(Z), c.animationFrameId = requestAnimationFrame(k);
          };
          c.animationFrameId = requestAnimationFrame(k), d.info(`[${e.name}] Runtime started`);
        }, K = o.dispose?.bind(o);
        return Object.defineProperty(o, "dispose", {
          configurable: !0,
          writable: !0,
          value: () => {
            S(), K?.();
          }
        }), n.autoStart && I(), o;
      }
    });
    return Object.defineProperty(s, "name", { value: e.name }), s;
  };
}
const V = (n, e, t) => t;
function x(n) {
  return V;
}
function Ue(n = 100) {
  return V;
}
function Be(n) {
  return function(e, t, s) {
    const a = s.value;
    return s.value = async function(...r) {
      const i = new Promise((o, c) => {
        setTimeout(() => c(new Error(`${t} timed out after ${n}ms`)), n);
      });
      try {
        return await Promise.race([
          a.apply(this, r),
          i
        ]);
      } catch (o) {
        throw d.error(
          `[${this.constructor.name}] ${t} timeout:`,
          o instanceof Error ? o : String(o)
        ), o;
      }
    }, s;
  };
}
var te = Object.defineProperty, ne = Object.getOwnPropertyDescriptor, M = (n, e, t, s) => {
  for (var a = ne(e, t), r = n.length - 1, i; r >= 0; r--)
    (i = n[r]) && (a = i(e, t, a) || a);
  return a && te(e, t, a), a;
};
class g {
  id;
  capabilities = {
    hasAsync: !0,
    hasMetrics: !0,
    hasState: !0,
    hasEvents: !1
  };
  state;
  metrics;
  options;
  _isDisposed = !1;
  _updateCount = 0;
  constructor(e, t, s) {
    this.options = { ...s }, this.state = this.createInitialState(e, this.options.initialState), this.metrics = this.createInitialMetrics(t, this.options.initialMetrics);
  }
  createInitialState(e, t) {
    return {
      ...e,
      ...t,
      lastUpdate: 0
    };
  }
  createInitialMetrics(e, t) {
    return {
      ...e,
      ...t,
      frameTime: 0
    };
  }
  async init() {
  }
  async start() {
  }
  pause() {
  }
  resume() {
  }
  update(e) {
    const t = this.createUpdateArgs(e);
    this.performUpdateWithArgs(t);
  }
  createDefaultUpdateArgs(e) {
    return e;
  }
  performUpdateWithArgs(e) {
    if (this._isDisposed)
      throw new Error("Cannot update disposed system");
    const t = performance.now();
    this._updateCount++, this.state.lastUpdate = Date.now(), this.beforeUpdate(e), this.performUpdate(e);
    const s = performance.now();
    this.metrics.frameTime = s - t, this.updateMetrics(e.deltaTime), this.afterUpdate(e);
  }
  beforeUpdate(e) {
  }
  afterUpdate(e) {
  }
  updateMetrics(e) {
  }
  getState() {
    return this.state;
  }
  getMetrics() {
    return this.metrics;
  }
  get isDisposed() {
    return this._isDisposed;
  }
  get updateCount() {
    return this._updateCount;
  }
  reset() {
    this.state = this.createInitialState(this.state, this.options.initialState), this.metrics = this.createInitialMetrics(this.metrics, this.options.initialMetrics), this._updateCount = 0, this.onReset();
  }
  onReset() {
  }
  dispose() {
    this._isDisposed || (this.onDispose(), this._isDisposed = !0);
  }
  onDispose() {
  }
}
M([
  v()
], g.prototype, "init");
M([
  v()
], g.prototype, "start");
M([
  x()
], g.prototype, "update");
M([
  x()
], g.prototype, "performUpdateWithArgs");
M([
  v()
], g.prototype, "reset");
M([
  v()
], g.prototype, "dispose");
new l.Vector3();
new l.Vector3(0, 0, 1);
const se = [];
new l.Vector3(0, 0, 0);
new l.Vector3(1, 1, 1);
function W() {
  return se.pop() || new l.Vector3();
}
const O = (n = 0, e = 0, t = 0) => {
  const s = W();
  return s.set(n, e, t), s;
}, Ve = () => W(), xe = () => O(1, 1, 1), We = {
  FRAME_RATE_LERP_SPEED: 8
}, u = {
  OFFSET: O(-10, -10, -10),
  MAX_DISTANCE: -7,
  DISTANCE: -1,
  X_DISTANCE: 15,
  Y_DISTANCE: 8,
  Z_DISTANCE: 15,
  ZOOM: 1,
  ENABLE_ZOOM: !0,
  ZOOM_SPEED: 1e-3,
  MIN_ZOOM: 0.45,
  MAX_ZOOM: 2.4,
  TARGET: O(0, 0, 0),
  POSITION: O(-15, 8, -15),
  FOCUS: !1,
  ENABLE_COLLISION: !0,
  COLLISION_MARGIN: 0.1,
  SMOOTHING: {
    POSITION: 0.08,
    ROTATION: 0.1,
    FOV: 0.1
  },
  FOV: 75,
  MIN_FOV: 10,
  MAX_FOV: 120,
  BOUNDS: {
    MIN_Y: 2,
    MAX_Y: 50
  }
}, ae = (n) => ({
  cameraOption: {
    offset: u.OFFSET,
    maxDistance: u.MAX_DISTANCE,
    distance: u.DISTANCE,
    xDistance: u.X_DISTANCE,
    yDistance: u.Y_DISTANCE,
    zDistance: u.Z_DISTANCE,
    zoom: u.ZOOM,
    enableZoom: u.ENABLE_ZOOM,
    zoomSpeed: u.ZOOM_SPEED,
    minZoom: u.MIN_ZOOM,
    maxZoom: u.MAX_ZOOM,
    target: u.TARGET,
    position: u.POSITION,
    focus: u.FOCUS,
    enableCollision: u.ENABLE_COLLISION,
    collisionMargin: u.COLLISION_MARGIN,
    smoothing: {
      position: u.SMOOTHING.POSITION,
      rotation: u.SMOOTHING.ROTATION,
      fov: u.SMOOTHING.FOV
    },
    fov: u.FOV,
    minFov: u.MIN_FOV,
    maxFov: u.MAX_FOV,
    bounds: {
      minY: u.BOUNDS.MIN_Y,
      maxY: u.BOUNDS.MAX_Y
    },
    modeSettings: {}
  },
  setCameraOption: (e) => n((t) => ({
    cameraOption: { ...t.cameraOption, ...e }
  })),
  replaceCameraOption: (e) => n(() => ({
    cameraOption: e
  }))
}), re = {
  characterUrl: "",
  vehicleUrl: "",
  airplaneUrl: "",
  wheelUrl: "",
  ridingUrl: ""
}, ie = (n) => ({
  urls: re,
  setUrls: (e) => n((t) => ({
    urls: { ...t.urls, ...e }
  }))
}), C = {
  type: "character",
  controller: "keyboard",
  control: "thirdPerson"
}, G = {
  lerp: {
    cameraTurn: 1,
    cameraPosition: 1
  }
}, oe = (n) => ({
  mode: C,
  controllerOptions: G,
  setMode: (e) => n((t) => ({
    mode: { ...t.mode, ...e }
  })),
  setControllerOptions: (e) => n((t) => ({
    controllerOptions: { ...t.controllerOptions, ...e }
  })),
  resetMode: () => n(() => ({
    mode: C,
    controllerOptions: G
  }))
}), ce = (n) => ({
  sizes: {},
  setSizes: (e) => n((t) => ({
    sizes: e(t.sizes)
  }))
}), ue = (n) => ({
  rideable: {},
  setRideable: (e, t) => n((s) => {
    const r = {
      ...s.rideable[e] ?? { objectkey: e },
      ...t,
      objectkey: e
    };
    return {
      rideable: { ...s.rideable, [e]: r }
    };
  }),
  removeRideable: (e) => n((t) => {
    const s = { ...t.rideable };
    return delete s[e], { rideable: s };
  })
}), le = {
  render: {
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  },
  engine: {
    geometries: 0,
    textures: 0,
    programs: 0
  }
}, de = (n) => ({
  performance: le,
  setPerformance: (e) => n({
    performance: e
  })
}), R = {
  // character
  walkSpeed: 10,
  runSpeed: 20,
  jumpSpeed: 15,
  jumpGravityScale: 2.4,
  normalGravityScale: 1,
  airDamping: 0.1,
  stopDamping: 2,
  // vehicle
  maxSpeed: 10,
  accelRatio: 2,
  brakeRatio: 5,
  // airplane
  gravityScale: 0.3,
  angleDelta: new E(0.02, 0.02, 0.02),
  maxAngle: new E(Math.PI / 6, Math.PI, Math.PI / 6),
  // common
  linearDamping: 0.9
}, pe = (n) => ({
  physics: R,
  setPhysics: (e) => n((t) => ({
    physics: { ...t.physics, ...e }
  })),
  resetPhysics: () => n({ physics: R })
}), N = {
  character: {
    current: "idle",
    default: "idle",
    store: {}
  },
  vehicle: {
    current: "idle",
    default: "idle",
    store: {}
  },
  airplane: {
    current: "idle",
    default: "idle",
    store: {}
  }
}, fe = (n) => ({
  animationState: N,
  setAnimation: (e, t) => {
    n((s) => ({
      animationState: {
        ...s.animationState,
        [e]: {
          ...s.animationState[e],
          current: t
        }
      }
    }));
  },
  resetAnimations: () => n(() => ({
    animationState: N
  })),
  setAnimationAction: (e, t, s) => n((a) => ({
    animationState: {
      ...a.animationState,
      [e]: {
        ...a.animationState[e],
        store: {
          ...a.animationState[e].store,
          [t]: s
        }
      }
    }
  }))
});
var me = Object.defineProperty, he = Object.getOwnPropertyDescriptor, ge = (n, e, t) => e in n ? me(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t, be = (n, e, t, s) => {
  for (var a = s > 1 ? void 0 : s ? he(e, t) : e, r = n.length - 1, i; r >= 0; r--)
    (i = n[r]) && (a = i(a) || a);
  return a;
}, we = (n, e, t) => ge(n, e + "", t);
const Me = [
  "forward",
  "backward",
  "leftward",
  "rightward",
  "shift",
  "space",
  "keyZ",
  "keyR",
  "keyF",
  "keyE",
  "escape"
], Se = ["left", "right", "middle"];
let f = class extends g {
  config;
  eventCallbacks;
  // public으로 변경
  constructor() {
    super(
      {
        keyboard: { forward: !1, backward: !1, leftward: !1, rightward: !1, shift: !1, space: !1, keyZ: !1, keyR: !1, keyF: !1, keyE: !1, escape: !1 },
        mouse: { target: new l.Vector3(), angle: 0, isActive: !1, shouldRun: !1, isLookAround: !1, buttons: { left: !1, right: !1, middle: !1 }, wheel: 0, position: new l.Vector2() },
        gamepad: { connected: !1, leftStick: new l.Vector2(), rightStick: new l.Vector2(), triggers: { left: 0, right: 0 }, buttons: {}, vibration: { weak: 0, strong: 0 } },
        touch: { touches: [], gestures: { pinch: 1, rotation: 0, pan: new l.Vector2() } },
        lastUpdate: 0,
        isActive: !0
      },
      {
        inputLatency: 0,
        frameTime: 0,
        eventCount: 0,
        activeInputs: [],
        performanceScore: 100,
        lastUpdate: 0
      }
    ), this.config = this.createDefaultConfig(), this.eventCallbacks = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return f.instance || (f.instance = new f()), f.instance;
  }
  // ... 나머지 코드는 거의 동일
  performUpdate(n) {
  }
  createUpdateArgs(n) {
    return this.createDefaultUpdateArgs(n);
  }
  createDefaultConfig() {
    return {
      sensitivity: { mouse: 1, gamepad: 1, touch: 1 },
      deadzone: { gamepad: 0.1, touch: 0.05 },
      smoothing: { mouse: 0.1, gamepad: 0.2 },
      invertY: !1,
      enableVibration: !0
    };
  }
  getKeyboardRef() {
    return this.state.keyboard;
  }
  getMouseRef() {
    return this.state.mouse;
  }
  updateKeyboard(n) {
    Object.assign(this.state.keyboard, n), this.updateMetrics(0), this.emitChange("keyboard", n);
  }
  updateMouse(n) {
    Object.assign(this.state.mouse, n), this.updateMetrics(0), this.emitChange("mouse", n);
  }
  updateGamepad(n) {
    Object.assign(this.state.gamepad, n), this.updateMetrics(0), this.emitChange("gamepad", n);
  }
  updateTouch(n) {
    Object.assign(this.state.touch, n), this.updateMetrics(0), this.emitChange("touch", n);
  }
  emitChange(n, e) {
    const t = this.eventCallbacks.get(n);
    if (!(!t || t.length === 0))
      for (const s of t)
        try {
          s(e);
        } catch (a) {
          console.error("InteractionSystem change callback error:", a);
        }
  }
  dispatchInput(n) {
    this.updateMouse(n);
  }
  setConfig(n) {
    Object.assign(this.config, n);
  }
  getConfig() {
    return { ...this.config };
  }
  // getState, getMetrics는 AbstractSystem에 이미 있으므로 제거
  addEventListener(n, e) {
    this.eventCallbacks.has(n) || this.eventCallbacks.set(n, []), this.eventCallbacks.get(n).push(e);
  }
  removeEventListener(n, e) {
    const t = this.eventCallbacks.get(n);
    if (t) {
      const s = t.indexOf(e);
      s > -1 && t.splice(s, 1);
    }
  }
  updateMetrics(n) {
    super.updateMetrics(n), this.metrics.eventCount++, this.collectActiveInputs(this.metrics.activeInputs);
  }
  // Object.entries 는 매 호출마다 새 [k,v][] 와 string concat 을 만들어 GC pressure 가 크다.
  // 대신 호출자 소유의 배열을 in-place 로 갱신한다 (활성 입력은 거의 항상 0~수개).
  collectActiveInputs(n) {
    n.length = 0;
    for (const t of Me)
      this.state.keyboard[t] && n.push(`keyboard:${t}`);
    for (const t of Se)
      this.state.mouse.buttons[t] && n.push(`mouse:${t}`);
    this.state.gamepad.connected && n.push("gamepad:connected");
    const e = this.state.touch.touches.length;
    e > 0 && n.push(`touch:${e}`);
  }
  onReset() {
    super.onReset();
  }
  onDispose() {
    super.onDispose(), this.eventCallbacks.clear(), f.instance = null;
  }
};
we(f, "instance", null);
f = be([
  ee("interaction")
], f);
const qe = "interaction.input";
let ye = () => f.getInstance();
function A() {
  return ye();
}
function Oe(n = {}) {
  return {
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
    escape: !1,
    ...n
  };
}
function ve(n = {}) {
  return {
    target: n.target?.clone?.() ?? new l.Vector3(),
    angle: n.angle ?? 0,
    isActive: n.isActive ?? !1,
    shouldRun: n.shouldRun ?? !1,
    isLookAround: n.isLookAround ?? !1,
    buttons: {
      left: !1,
      right: !1,
      middle: !1,
      ...n.buttons
    },
    wheel: n.wheel ?? 0,
    position: n.position?.clone?.() ?? new l.Vector2()
  };
}
function Ie(n = {}) {
  return {
    connected: n.connected ?? !1,
    leftStick: n.leftStick?.clone?.() ?? new l.Vector2(),
    rightStick: n.rightStick?.clone?.() ?? new l.Vector2(),
    triggers: {
      left: 0,
      right: 0,
      ...n.triggers
    },
    buttons: { ...n.buttons },
    vibration: {
      weak: 0,
      strong: 0,
      ...n.vibration
    }
  };
}
function Te(n = {}) {
  return {
    touches: n.touches?.map((e) => ({
      id: e.id,
      position: e.position.clone(),
      force: e.force
    })) ?? [],
    gestures: {
      pinch: 1,
      rotation: 0,
      pan: new l.Vector2(),
      ...n.gestures,
      ...n.gestures?.pan ? { pan: n.gestures.pan.clone() } : {}
    }
  };
}
function Ae(n, e) {
  const { buttons: t, target: s, position: a, ...r } = e;
  Object.assign(n, r), s && n.target.copy(s), a && n.position.copy(a), t && Object.assign(n.buttons, t);
}
function ke(n, e) {
  const { leftStick: t, rightStick: s, triggers: a, vibration: r, buttons: i, ...o } = e;
  Object.assign(n, o), t && n.leftStick.copy(t), s && n.rightStick.copy(s), a && Object.assign(n.triggers, a), r && Object.assign(n.vibration, r), i && Object.assign(n.buttons, i);
}
function De(n, e) {
  const { touches: t, gestures: s } = e;
  if (t && (n.touches = t.map((a) => ({
    id: a.id,
    position: a.position.clone(),
    force: a.force
  }))), s) {
    const { pan: a, ...r } = s;
    Object.assign(n.gestures, r), a && n.gestures.pan.copy(a);
  }
}
function q(n) {
  const e = () => {
    const t = n.getState();
    return {
      keyboard: n.getKeyboardRef(),
      mouse: n.getMouseRef(),
      gamepad: t.gamepad,
      touch: t.touch
    };
  };
  return {
    getKeyboard: () => n.getKeyboardRef(),
    getMouse: () => n.getMouseRef(),
    getGamepad: () => n.getState().gamepad,
    getTouch: () => n.getState().touch,
    updateKeyboard: (t) => n.updateKeyboard(t),
    updateMouse: (t) => n.updateMouse(t),
    updateGamepad: (t) => n.updateGamepad(t),
    updateTouch: (t) => n.updateTouch(t),
    subscribe: (t) => {
      const s = () => t(e());
      return n.addEventListener("keyboard", s), n.addEventListener("mouse", s), n.addEventListener("gamepad", s), n.addEventListener("touch", s), s(), () => {
        n.removeEventListener("keyboard", s), n.removeEventListener("mouse", s), n.removeEventListener("gamepad", s), n.removeEventListener("touch", s);
      };
    }
  };
}
class Ee {
  system = null;
  backend = null;
  unsubscribeFromBackend = null;
  listeners = /* @__PURE__ */ new Set();
  invalidate() {
    this.unsubscribeFromBackend?.(), this.unsubscribeFromBackend = null, this.backend = null, this.system = null;
  }
  getKeyboard() {
    return this.resolveBackend().getKeyboard();
  }
  getMouse() {
    return this.resolveBackend().getMouse();
  }
  getGamepad() {
    return this.resolveBackend().getGamepad?.() ?? this.resolveDefaultGamepad();
  }
  getTouch() {
    return this.resolveBackend().getTouch?.() ?? this.resolveDefaultTouch();
  }
  updateKeyboard(e) {
    this.resolveSubscribedBackend().updateKeyboard(e);
  }
  updateMouse(e) {
    this.resolveSubscribedBackend().updateMouse(e);
  }
  updateGamepad(e) {
    this.resolveSubscribedBackend().updateGamepad?.(e);
  }
  updateTouch(e) {
    this.resolveSubscribedBackend().updateTouch?.(e);
  }
  subscribe(e) {
    return this.listeners.add(e), this.ensureSubscription() || e(this.snapshot()), () => {
      this.listeners.delete(e), this.listeners.size === 0 && (this.unsubscribeFromBackend?.(), this.unsubscribeFromBackend = null);
    };
  }
  resolveBackend() {
    const e = A();
    return (this.system !== e || !this.backend) && (this.unsubscribeFromBackend?.(), this.unsubscribeFromBackend = null, this.system = e, this.backend = q(e)), this.backend;
  }
  resolveSubscribedBackend() {
    const e = this.resolveBackend();
    return this.listeners.size > 0 && this.bindBackend(e), e;
  }
  ensureSubscription() {
    const e = this.resolveBackend();
    return this.bindBackend(e);
  }
  bindBackend(e) {
    return this.unsubscribeFromBackend || !e.subscribe ? !1 : (this.unsubscribeFromBackend = e.subscribe((t) => {
      this.listeners.forEach((s) => s(t));
    }), !0);
  }
  snapshot() {
    const e = this.resolveBackend(), t = {
      keyboard: e.getKeyboard(),
      mouse: e.getMouse()
    }, s = e.getGamepad?.(), a = e.getTouch?.();
    return s && (t.gamepad = s), a && (t.touch = a), t;
  }
  resolveDefaultGamepad() {
    return A().getState().gamepad;
  }
  resolveDefaultTouch() {
    return A().getState().touch;
  }
}
const Ce = new Ee();
function m() {
  return Ce;
}
function Ge() {
  return m();
}
function Ke(n) {
  return n ? q(n) : Ge();
}
function Ze(n = {}) {
  const e = /* @__PURE__ */ new Set(), t = {
    keyboard: Oe(n.keyboard),
    mouse: ve(n.mouse),
    gamepad: Ie(n.gamepad),
    touch: Te(n.touch)
  }, s = () => t, a = () => {
    const r = s();
    e.forEach((i) => i(r));
  };
  return {
    getKeyboard: () => t.keyboard,
    getMouse: () => t.mouse,
    getGamepad: () => t.gamepad,
    getTouch: () => t.touch,
    updateKeyboard: (r) => {
      Object.assign(t.keyboard, r), a();
    },
    updateMouse: (r) => {
      Ae(t.mouse, r), a();
    },
    updateGamepad: (r) => {
      ke(t.gamepad, r), a();
    },
    updateTouch: (r) => {
      De(t.touch, r), a();
    },
    subscribe: (r) => (e.add(r), r(s()), () => {
      e.delete(r);
    })
  };
}
const P = () => ({
  keyboard: {
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
  },
  mouse: {
    target: new l.Vector3(),
    angle: 0,
    isActive: !1,
    shouldRun: !1,
    isLookAround: !1,
    buttons: { left: !1, right: !1, middle: !1 },
    wheel: 0,
    position: new l.Vector2()
  },
  gamepad: {
    connected: !1,
    leftStick: new l.Vector2(),
    rightStick: new l.Vector2(),
    triggers: { left: 0, right: 0 },
    buttons: {},
    vibration: { weak: 0, strong: 0 }
  },
  touch: {
    touches: [],
    gestures: {
      pinch: 1,
      rotation: 0,
      pan: new l.Vector2()
    }
  },
  lastUpdate: 0,
  isActive: !0
}), _ = () => ({
  isActive: !1,
  queue: {
    actions: [],
    currentIndex: 0,
    isRunning: !1,
    isPaused: !1,
    loop: !1,
    maxRetries: 3
  },
  currentAction: null,
  executionStats: {
    totalExecuted: 0,
    successRate: 100,
    averageTime: 0,
    errors: []
  },
  settings: {
    throttle: 100,
    autoStart: !1,
    trackProgress: !0,
    showVisualCues: !0
  }
}), $ = () => ({
  isActive: !0,
  lastCommand: null,
  commandHistory: [],
  syncStatus: "idle"
}), F = () => ({
  sensitivity: { mouse: 1, gamepad: 1, touch: 1 },
  deadzone: { gamepad: 0.1, touch: 0.05 },
  smoothing: { mouse: 0.1, gamepad: 0.2 },
  invertY: !1,
  enableVibration: !0
}), j = () => ({
  maxConcurrentActions: 1,
  defaultDelay: 100,
  retryDelay: 1e3,
  timeoutDuration: 5e3,
  enableLogging: !0,
  visualCues: {
    showPath: !0,
    showTargets: !0,
    lineColor: "#00ff00",
    targetColor: "#ff0000"
  }
}), L = () => ({
  lastUpdate: 0,
  inputLatency: 0,
  frameTime: 0,
  eventCount: 0,
  activeInputs: [],
  performanceScore: 100
}), U = () => ({
  queueLength: 0,
  executionTime: 0,
  performance: 100,
  memoryUsage: 0,
  errorRate: 0
});
let B = !1;
const Re = (n) => {
  if (B) return;
  B = !0;
  let e = !1;
  m().subscribe?.(({ keyboard: t, mouse: s, gamepad: a, touch: r }) => {
    if (!e) {
      e = !0;
      return;
    }
    n((i) => ({
      interaction: {
        ...i.interaction,
        keyboard: t,
        mouse: s,
        gamepad: a ?? i.interaction.gamepad,
        touch: r ?? i.interaction.touch
      }
    }));
  });
}, Ne = (n) => (Re(n), {
  interaction: P(),
  automation: _(),
  bridge: $(),
  config: {
    interaction: F(),
    automation: j()
  },
  metrics: {
    interaction: L(),
    automation: U()
  },
  dispatchInput: (e) => {
    m().updateMouse(e);
  },
  addAutomationAction: (e) => {
    const t = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, s = {
      ...e,
      id: t,
      timestamp: Date.now()
    };
    return n((a) => ({
      automation: {
        ...a.automation,
        queue: {
          ...a.automation.queue,
          actions: [...a.automation.queue.actions, s]
        }
      }
    })), t;
  },
  removeAutomationAction: (e) => n((t) => ({
    automation: {
      ...t.automation,
      queue: {
        ...t.automation.queue,
        actions: t.automation.queue.actions.filter((s) => s.id !== e)
      }
    }
  })),
  startAutomation: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        isRunning: !0,
        isPaused: !1
      }
    }
  })),
  pauseAutomation: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        isPaused: !0
      }
    }
  })),
  resumeAutomation: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        isPaused: !1
      }
    }
  })),
  stopAutomation: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        isRunning: !1,
        isPaused: !1,
        currentIndex: 0
      },
      currentAction: null
    }
  })),
  clearAutomationQueue: () => n((e) => ({
    automation: {
      ...e.automation,
      queue: {
        ...e.automation.queue,
        actions: [],
        currentIndex: 0
      }
    }
  })),
  updateAutomationSettings: (e) => n((t) => ({
    automation: {
      ...t.automation,
      settings: { ...t.automation.settings, ...e }
    }
  })),
  updateInteractionConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      interaction: { ...t.config.interaction, ...e }
    }
  })),
  updateAutomationConfig: (e) => n((t) => ({
    config: {
      ...t.config,
      automation: { ...t.config.automation, ...e }
    }
  })),
  updateInteractionMetrics: (e) => n((t) => ({
    metrics: {
      ...t.metrics,
      interaction: { ...t.metrics.interaction, ...e }
    }
  })),
  updateAutomationMetrics: (e) => n((t) => ({
    metrics: {
      ...t.metrics,
      automation: { ...t.metrics.automation, ...e }
    }
  })),
  setBridgeStatus: (e) => n((t) => ({
    bridge: { ...t.bridge, syncStatus: e }
  })),
  addCommandToHistory: (e) => n((t) => ({
    bridge: {
      ...t.bridge,
      lastCommand: e,
      commandHistory: [...t.bridge.commandHistory, e].slice(-100)
    }
  })),
  resetInteractions: () => n(() => ({
    interaction: P(),
    automation: _(),
    bridge: $(),
    config: {
      interaction: F(),
      automation: j()
    },
    metrics: {
      interaction: L(),
      automation: U()
    }
  })),
  updateMouse: (e) => {
    m().updateMouse(e);
  },
  updateKeyboard: (e) => {
    m().updateKeyboard(e);
  },
  updateGamepad: (e) => {
    m().updateGamepad?.(e);
  },
  updateTouch: (e) => {
    m().updateTouch?.(e);
  },
  setInteractionActive: (e) => n((t) => ({
    interaction: {
      ...t.interaction,
      isActive: e
    }
  }))
}), Pe = (n) => ({
  meshes: /* @__PURE__ */ new Map(),
  currentMeshId: null,
  addMesh: (e) => {
    n((t) => {
      const s = new Map(t.meshes);
      return s.set(e.id, e), { meshes: s };
    });
  },
  removeMesh: (e) => {
    n((t) => {
      const s = new Map(t.meshes);
      return s.delete(e), { meshes: s };
    });
  },
  updateMesh: (e, t) => {
    n((s) => {
      const a = s.meshes.get(e);
      if (a) {
        const r = { ...a, ...t }, i = new Map(s.meshes);
        return i.set(e, r), { meshes: i };
      }
      return s;
    });
  },
  setCurrentMeshId: (e) => {
    n({ currentMeshId: e });
  },
  tiles: /* @__PURE__ */ new Map(),
  addTile: (e) => {
    n((t) => {
      const s = new Map(t.tiles);
      return s.set(e.id, e), { tiles: s };
    });
  },
  removeTile: (e) => {
    n((t) => {
      const s = new Map(t.tiles);
      return s.delete(e), { tiles: s };
    });
  },
  updateTile: (e, t) => {
    n((s) => {
      const a = s.tiles.get(e);
      if (a) {
        const r = { ...a, ...t }, i = new Map(s.tiles);
        return i.set(e, r), { tiles: i };
      }
      return s;
    });
  },
  tileGroups: /* @__PURE__ */ new Map(),
  addTileGroup: (e) => {
    n((t) => {
      const s = new Map(t.tileGroups);
      return s.set(e.id, e), { tileGroups: s };
    });
  },
  removeTileGroup: (e) => {
    n((t) => {
      const s = new Map(t.tileGroups);
      s.delete(e);
      const a = new Map(t.tiles);
      return a.forEach((r) => {
        if (r.groupId === e) {
          const { groupId: i, ...o } = r;
          a.set(r.id, o);
        }
      }), { tileGroups: s, tiles: a };
    });
  },
  updateTileGroup: (e, t) => {
    n((s) => {
      const a = s.tileGroups.get(e);
      if (a) {
        const r = { ...a, ...t }, i = new Map(s.tileGroups);
        return i.set(e, r), { tileGroups: i };
      }
      return s;
    });
  },
  addTileToGroup: (e, t) => {
    n((s) => {
      const a = s.tiles.get(t);
      if (a && s.tileGroups.has(e)) {
        const r = new Map(s.tiles);
        return r.set(t, { ...a, groupId: e }), { tiles: r };
      }
      return s;
    });
  },
  removeTileFromGroup: (e) => {
    n((t) => {
      const s = t.tiles.get(e);
      if (s?.groupId) {
        const a = new Map(t.tiles), { groupId: r, ...i } = s;
        return a.set(e, i), { tiles: a };
      }
      return t;
    });
  },
  walls: /* @__PURE__ */ new Map(),
  addWall: (e) => {
    n((t) => {
      const s = new Map(t.walls);
      return s.set(e.id, e), { walls: s };
    });
  },
  removeWall: (e) => {
    n((t) => {
      const s = new Map(t.walls);
      return s.delete(e), { walls: s };
    });
  },
  updateWall: (e, t) => {
    n((s) => {
      const a = s.walls.get(e);
      if (a) {
        const r = { ...a, ...t }, i = new Map(s.walls);
        return i.set(e, r), { walls: i };
      }
      return s;
    });
  },
  wallGroups: /* @__PURE__ */ new Map(),
  addWallGroup: (e) => {
    n((t) => {
      const s = new Map(t.wallGroups);
      return s.set(e.id, e), { wallGroups: s };
    });
  },
  removeWallGroup: (e) => {
    n((t) => {
      const s = new Map(t.wallGroups);
      s.delete(e);
      const a = new Map(t.walls);
      return a.forEach((r) => {
        if (r.groupId === e) {
          const { groupId: i, ...o } = r;
          a.set(r.id, o);
        }
      }), { wallGroups: s, walls: a };
    });
  },
  updateWallGroup: (e, t) => {
    n((s) => {
      const a = s.wallGroups.get(e);
      if (a) {
        const r = { ...a, ...t }, i = new Map(s.wallGroups);
        return i.set(e, r), { wallGroups: i };
      }
      return s;
    });
  },
  addWallToGroup: (e, t) => {
    n((s) => {
      const a = s.walls.get(t);
      if (a && s.wallGroups.has(e)) {
        const r = new Map(s.walls);
        return r.set(t, { ...a, groupId: e }), { walls: r };
      }
      return s;
    });
  },
  removeWallFromGroup: (e) => {
    n((t) => {
      const s = t.walls.get(e);
      if (s?.groupId) {
        const a = new Map(t.walls), { groupId: r, ...i } = s;
        return a.set(e, i), { walls: a };
      }
      return t;
    });
  },
  npcs: /* @__PURE__ */ new Map(),
  addNpc: (e) => {
    n((t) => {
      const s = new Map(t.npcs);
      return s.set(e.id, e), { npcs: s };
    });
  },
  removeNpc: (e) => {
    n((t) => {
      const s = new Map(t.npcs);
      return s.delete(e), { npcs: s };
    });
  },
  updateNpc: (e, t) => {
    n((s) => {
      const a = s.npcs.get(e);
      if (a) {
        const r = { ...a, ...t }, i = new Map(s.npcs);
        return i.set(e, r), { npcs: i };
      }
      return s;
    });
  },
  interactableObjects: /* @__PURE__ */ new Map(),
  addInteractableObject: (e) => {
    n((t) => {
      const s = new Map(t.interactableObjects);
      return s.set(e.id, e), { interactableObjects: s };
    });
  },
  removeInteractableObject: (e) => {
    n((t) => {
      const s = new Map(t.interactableObjects);
      return s.delete(e), { interactableObjects: s };
    });
  },
  updateInteractableObject: (e, t) => {
    n((s) => {
      const a = s.interactableObjects.get(e);
      if (a) {
        const r = { ...a, ...t }, i = new Map(s.interactableObjects);
        return i.set(e, r), { interactableObjects: i };
      }
      return s;
    });
  }
}), ze = z()(
  Y(
    H(
      (...n) => ({
        ...oe(...n),
        ...ie(...n),
        ...ce(...n),
        ...ue(...n),
        ...de(...n),
        ...ae(...n),
        ...pe(...n),
        ...fe(...n),
        ...Ne(...n),
        ...Pe(...n)
      })
    )
  )
);
export {
  g as A,
  p as B,
  We as C,
  w as D,
  v as H,
  Le as M,
  x as P,
  ee as R,
  Be as T,
  O as V,
  Ue as a,
  h as b,
  Ke as c,
  qe as d,
  Ve as e,
  xe as f,
  W as g,
  q as h,
  Ze as i,
  d as l,
  ze as u
};
