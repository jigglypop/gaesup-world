var vt = Object.defineProperty;
var wt = (n, e, t) => e in n ? vt(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var j = (n, e, t) => wt(n, typeof e != "symbol" ? e + "" : e, t);
import Me, { useRef as T, useEffect as N, useCallback as E, useMemo as V, useState as R, Component as St, forwardRef as st, memo as rt, Suspense as jt } from "react";
import * as g from "three";
import { vec3 as ce, euler as at, RigidBody as Ct, CapsuleCollider as Mt } from "@react-three/rapier";
import { useGLTF as de, useCursor as kt, useAnimations as he, Line as Et } from "@react-three/drei";
import { useFrame as ne, useGraph as Ne, useThree as At } from "@react-three/fiber";
import { SkeletonUtils as Re } from "three-stdlib";
const ze = (n) => {
  let e;
  const t = /* @__PURE__ */ new Set(), i = (l, d) => {
    const h = typeof l == "function" ? l(e) : l;
    if (!Object.is(h, e)) {
      const f = e;
      e = d ?? (typeof h != "object" || h === null) ? h : Object.assign({}, e, h), t.forEach((C) => C(e, f));
    }
  }, s = () => e, c = { setState: i, getState: s, getInitialState: () => u, subscribe: (l) => (t.add(l), () => t.delete(l)) }, u = e = n(i, s, c);
  return c;
}, Nt = (n) => n ? ze(n) : ze, Rt = (n) => n;
function It(n, e = Rt) {
  const t = Me.useSyncExternalStore(
    n.subscribe,
    () => e(n.getState()),
    () => e(n.getInitialState())
  );
  return Me.useDebugValue(t), t;
}
const Ve = (n) => {
  const e = Nt(n), t = (i) => It(e, i);
  return Object.assign(t, e), t;
}, ot = (n) => n ? Ve(n) : Ve, Le = { BASE_URL: "/", DEV: !1, MODE: "esm", PROD: !0, SSR: !1 }, te = /* @__PURE__ */ new Map(), se = (n) => {
  const e = te.get(n);
  return e ? Object.fromEntries(
    Object.entries(e.stores).map(([t, i]) => [t, i.getState()])
  ) : {};
}, Tt = (n, e, t) => {
  if (n === void 0)
    return {
      type: "untracked",
      connection: e.connect(t)
    };
  const i = te.get(t.name);
  if (i)
    return { type: "tracked", store: n, ...i };
  const s = {
    connection: e.connect(t),
    stores: {}
  };
  return te.set(t.name, s), { type: "tracked", store: n, ...s };
}, Ot = (n, e) => {
  if (e === void 0) return;
  const t = te.get(n);
  t && (delete t.stores[e], Object.keys(t.stores).length === 0 && te.delete(n));
}, Dt = (n) => {
  var e, t;
  if (!n) return;
  const i = n.split(`
`), s = i.findIndex(
    (o) => o.includes("api.setState")
  );
  if (s < 0) return;
  const a = ((e = i[s + 1]) == null ? void 0 : e.trim()) || "";
  return (t = /.+ (.+) .+/.exec(a)) == null ? void 0 : t[1];
}, Pt = (n, e = {}) => (t, i, s) => {
  const { enabled: a, anonymousActionType: o, store: c, ...u } = e;
  let l;
  try {
    l = (a ?? (Le ? "esm" : void 0) !== "production") && window.__REDUX_DEVTOOLS_EXTENSION__;
  } catch {
  }
  if (!l)
    return n(t, i, s);
  const { connection: d, ...h } = Tt(c, l, u);
  let f = !0;
  s.setState = (x, m, y) => {
    const p = t(x, m);
    if (!f) return p;
    const b = y === void 0 ? {
      type: o || Dt(new Error().stack) || "anonymous"
    } : typeof y == "string" ? { type: y } : y;
    return c === void 0 ? (d == null || d.send(b, i()), p) : (d == null || d.send(
      {
        ...b,
        type: `${c}/${b.type}`
      },
      {
        ...se(u.name),
        [c]: s.getState()
      }
    ), p);
  }, s.devtools = {
    cleanup: () => {
      d && typeof d.unsubscribe == "function" && d.unsubscribe(), Ot(u.name, c);
    }
  };
  const C = (...x) => {
    const m = f;
    f = !1, t(...x), f = m;
  }, w = n(s.setState, i, s);
  if (h.type === "untracked" ? d == null || d.init(w) : (h.stores[h.store] = s, d == null || d.init(
    Object.fromEntries(
      Object.entries(h.stores).map(([x, m]) => [
        x,
        x === h.store ? w : m.getState()
      ])
    )
  )), s.dispatchFromDevtools && typeof s.dispatch == "function") {
    let x = !1;
    const m = s.dispatch;
    s.dispatch = (...y) => {
      (Le ? "esm" : void 0) !== "production" && y[0].type === "__setState" && !x && (console.warn(
        '[zustand devtools middleware] "__setState" action type is reserved to set state from the devtools. Avoid using it.'
      ), x = !0), m(...y);
    };
  }
  return d.subscribe((x) => {
    var m;
    switch (x.type) {
      case "ACTION":
        if (typeof x.payload != "string") {
          console.error(
            "[zustand devtools middleware] Unsupported action format"
          );
          return;
        }
        return xe(
          x.payload,
          (y) => {
            if (y.type === "__setState") {
              if (c === void 0) {
                C(y.state);
                return;
              }
              Object.keys(y.state).length !== 1 && console.error(
                `
                    [zustand devtools middleware] Unsupported __setState action format.
                    When using 'store' option in devtools(), the 'state' should have only one key, which is a value of 'store' that was passed in devtools(),
                    and value of this only key should be a state object. Example: { "type": "__setState", "state": { "abc123Store": { "foo": "bar" } } }
                    `
              );
              const p = y.state[c];
              if (p == null)
                return;
              JSON.stringify(s.getState()) !== JSON.stringify(p) && C(p);
              return;
            }
            s.dispatchFromDevtools && typeof s.dispatch == "function" && s.dispatch(y);
          }
        );
      case "DISPATCH":
        switch (x.payload.type) {
          case "RESET":
            return C(w), c === void 0 ? d == null ? void 0 : d.init(s.getState()) : d == null ? void 0 : d.init(se(u.name));
          case "COMMIT":
            if (c === void 0) {
              d == null || d.init(s.getState());
              return;
            }
            return d == null ? void 0 : d.init(se(u.name));
          case "ROLLBACK":
            return xe(x.state, (y) => {
              if (c === void 0) {
                C(y), d == null || d.init(s.getState());
                return;
              }
              C(y[c]), d == null || d.init(se(u.name));
            });
          case "JUMP_TO_STATE":
          case "JUMP_TO_ACTION":
            return xe(x.state, (y) => {
              if (c === void 0) {
                C(y);
                return;
              }
              JSON.stringify(s.getState()) !== JSON.stringify(y[c]) && C(y[c]);
            });
          case "IMPORT_STATE": {
            const { nextLiftedState: y } = x.payload, p = (m = y.computedStates.slice(-1)[0]) == null ? void 0 : m.state;
            if (!p) return;
            C(c === void 0 ? p : p[c]), d == null || d.send(
              null,
              // FIXME no-any
              y
            );
            return;
          }
          case "PAUSE_RECORDING":
            return f = !f;
        }
        return;
    }
  }), w;
}, zt = Pt, xe = (n, e) => {
  let t;
  try {
    t = JSON.parse(n);
  } catch (i) {
    console.error(
      "[zustand devtools middleware] Could not parse the received json",
      i
    );
  }
  t !== void 0 && e(t);
}, Vt = (n) => (e, t, i) => {
  const s = i.subscribe;
  return i.subscribe = (o, c, u) => {
    let l = o;
    if (c) {
      const d = (u == null ? void 0 : u.equalityFn) || Object.is;
      let h = o(i.getState());
      l = (f) => {
        const C = o(f);
        if (!d(h, C)) {
          const w = h;
          c(h = C, w);
        }
      }, u != null && u.fireImmediately && c(h, h);
    }
    return s(l);
  }, n(e, t, i);
}, Lt = Vt, Gt = {
  characterUrl: "",
  vehicleUrl: "",
  airplaneUrl: "",
  wheelUrl: "",
  ridingUrl: ""
}, Ft = (n) => ({
  urls: Gt,
  setUrls: (e) => n((t) => ({
    urls: { ...t.urls, ...e }
  }))
}), _t = {
  type: "character",
  controller: "keyboard",
  control: "thirdPerson"
}, Ut = {
  lerp: {
    cameraTurn: 1,
    cameraPosition: 1
  }
}, Bt = (n) => ({
  mode: _t,
  controllerOptions: Ut,
  setMode: (e) => n((t) => ({
    mode: { ...t.mode, ...e }
  })),
  setControllerOptions: (e) => n((t) => ({
    controllerOptions: { ...t.controllerOptions, ...e }
  }))
}), qt = (n) => ({
  block: {
    camera: !1,
    control: !1,
    animation: !1,
    scroll: !0
  },
  setBlock: (e) => n((t) => ({
    block: { ...t.block, ...e }
  }))
}), Ge = new g.Vector3(), Fe = new g.Vector3(0, 0, 1), ke = [], Ht = new g.Vector3(0, 0, 0), $t = new g.Vector3(1, 1, 1);
function Ie() {
  return ke.pop() || new g.Vector3();
}
function ys(n) {
  ke.length < 50 && (n.set(0, 0, 0), ke.push(n));
}
function xs(n) {
  return n.x !== 0 && n.y !== 0 && n.z !== 0;
}
function Wt(n, e, t) {
  const i = n.x - e.x, s = n.y - e.y, a = n.z - e.z;
  return Math.sqrt(i * i + (t ? s * s : 0) + a * a);
}
const bs = (n, e) => n ? e : Ht, vs = (n, e) => n ? e : $t;
function Kt(n) {
  const e = n.dot(Fe) / n.length(), t = Math.acos(Math.max(-1, Math.min(1, e)));
  Ge.copy(n).cross(Fe);
  const i = Math.sin(Ge.y) || 1;
  return Math.PI - t * i;
}
const ws = (n) => n instanceof g.Vector3 ? [n.x, n.y, n.z] : n instanceof g.Euler ? [n.x, n.y, n.z] : n, Ss = (n) => n instanceof g.Vector3 ? n : Q(n[0], n[1], n[2]), js = (n) => n instanceof g.Euler ? n : Yt(n[0], n[1], n[2]), Q = (n = 0, e = 0, t = 0) => {
  const i = Ie();
  return i.set(n, e, t), i;
}, Cs = (n = 0, e = 0, t = 0, i = 1) => new g.Quaternion(n, e, t, i), Yt = (n = 0, e = 0, t = 0) => new g.Euler(n, e, t), Ms = () => Ie(), ks = () => Q(1, 1, 1), D = {
  OFFSET: Q(-10, -10, -10),
  MAX_DISTANCE: -7,
  DISTANCE: -1,
  X_DISTANCE: 15,
  Y_DISTANCE: 8,
  Z_DISTANCE: 15,
  ZOOM: 1,
  TARGET: Q(0, 0, 0),
  POSITION: Q(-15, 8, -15),
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
}, Xt = (n) => ({
  cameraOption: {
    offset: D.OFFSET,
    maxDistance: D.MAX_DISTANCE,
    distance: D.DISTANCE,
    xDistance: D.X_DISTANCE,
    yDistance: D.Y_DISTANCE,
    zDistance: D.Z_DISTANCE,
    zoom: D.ZOOM,
    target: D.TARGET,
    position: D.POSITION,
    focus: D.FOCUS,
    enableCollision: D.ENABLE_COLLISION,
    collisionMargin: D.COLLISION_MARGIN,
    smoothing: {
      position: D.SMOOTHING.POSITION,
      rotation: D.SMOOTHING.ROTATION,
      fov: D.SMOOTHING.FOV
    },
    fov: D.FOV,
    minFov: D.MIN_FOV,
    maxFov: D.MAX_FOV,
    bounds: {
      minY: D.BOUNDS.MIN_Y,
      maxY: D.BOUNDS.MAX_Y
    },
    modeSettings: {}
  },
  setCameraOption: (e) => n((t) => ({
    cameraOption: { ...t.cameraOption, ...e }
  }))
}), Qt = () => ({
  name: "default",
  type: "thirdPerson",
  position: new g.Vector3(0, 5, 10),
  rotation: new g.Euler(0, 0, 0),
  fov: 75,
  config: {
    distance: 10,
    height: 5,
    followSpeed: 0.1,
    rotationSpeed: 0.1
  },
  priority: 0,
  tags: []
}), Jt = () => [
  {
    from: "character",
    to: "vehicle",
    duration: 1,
    easing: "easeInOut"
  },
  {
    from: "vehicle",
    to: "airplane",
    duration: 1.5,
    easing: "easeOut"
  }
], Zt = (n) => ({
  cameraStates: /* @__PURE__ */ new Map([["default", Qt()]]),
  cameraTransitions: Jt(),
  currentCameraStateName: "default",
  cameraStateHistory: ["default"],
  setCameraStates: (e) => {
    n({ cameraStates: e });
  },
  setCameraTransitions: (e) => {
    n({ cameraTransitions: e });
  },
  setCurrentCameraStateName: (e) => {
    n((t) => ({
      currentCameraStateName: e,
      cameraStateHistory: [...t.cameraStateHistory, e]
    }));
  },
  setCameraStateHistory: (e) => {
    n({ cameraStateHistory: e });
  },
  addCameraState: (e, t) => {
    n((i) => {
      const s = new Map(i.cameraStates);
      return s.set(e, t), { cameraStates: s };
    });
  },
  updateCurrentCameraState: (e) => {
    n((t) => {
      const i = t.cameraStates.get(t.currentCameraStateName);
      if (i) {
        const s = { ...i, ...e }, a = new Map(t.cameraStates);
        return a.set(t.currentCameraStateName, s), { cameraStates: a };
      }
      return t;
    });
  },
  zoomIn: () => {
    n((e) => {
      var i;
      const t = e.cameraStates.get(e.currentCameraStateName);
      if (t && t.config.distance) {
        const s = Math.max(
          t.config.distance - 0.5,
          ((i = t.config.constraints) == null ? void 0 : i.minDistance) || 1
        ), a = new Map(e.cameraStates);
        return a.set(e.currentCameraStateName, {
          ...t,
          config: { ...t.config, distance: s }
        }), { cameraStates: a };
      }
      return e;
    });
  },
  zoomOut: () => {
    n((e) => {
      var i;
      const t = e.cameraStates.get(e.currentCameraStateName);
      if (t && t.config.distance) {
        const s = Math.min(
          t.config.distance + 0.5,
          ((i = t.config.constraints) == null ? void 0 : i.maxDistance) || 20
        ), a = new Map(e.cameraStates);
        return a.set(e.currentCameraStateName, {
          ...t,
          config: { ...t.config, distance: s }
        }), { cameraStates: a };
      }
      return e;
    });
  },
  setZoom: (e) => {
    n((t) => {
      var s, a;
      const i = t.cameraStates.get(t.currentCameraStateName);
      if (i) {
        const o = Math.max(
          ((s = i.config.constraints) == null ? void 0 : s.minDistance) || 1,
          Math.min(e, ((a = i.config.constraints) == null ? void 0 : a.maxDistance) || 20)
        ), c = new Map(t.cameraStates);
        return c.set(t.currentCameraStateName, {
          ...i,
          config: { ...i.config, distance: o }
        }), { cameraStates: c };
      }
      return t;
    });
  },
  setRotation: (e) => {
    n((t) => {
      const i = t.cameraStates.get(t.currentCameraStateName);
      if (i) {
        const s = new Map(t.cameraStates);
        return s.set(t.currentCameraStateName, {
          ...i,
          rotation: e
        }), { cameraStates: s };
      }
      return t;
    });
  }
}), en = (n) => ({
  minimap: {
    props: {}
  },
  addMinimapMarker: (e, t) => n((i) => ({
    minimap: {
      props: {
        ...i.minimap.props,
        [e]: t
      }
    }
  })),
  removeMinimapMarker: (e) => n((t) => {
    const i = { ...t.minimap.props };
    return delete i[e], {
      minimap: {
        props: i
      }
    };
  })
}), tn = (n) => ({
  sizes: {},
  setSizes: (e) => n((t) => ({
    sizes: e(t.sizes)
  }))
}), _e = {
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
}, nn = (n, e) => ({
  animationState: _e,
  setAnimation: (t, i) => {
    n((s) => ({
      animationState: {
        ...s.animationState,
        [t]: {
          ...s.animationState[t],
          current: i
        }
      }
    }));
  },
  resetAnimations: () => n(() => ({
    animationState: _e
  })),
  setAnimationAction: (t, i, s) => n((a) => ({
    animationState: {
      ...a.animationState,
      [t]: {
        ...a.animationState[t],
        store: {
          ...a.animationState[t].store,
          [i]: s
        }
      }
    }
  }))
}), Ue = () => ({
  isActive: !1,
  currentPreset: "normal",
  motionType: "character",
  position: new g.Vector3(),
  velocity: new g.Vector3(),
  rotation: new g.Euler(),
  speed: 0,
  direction: new g.Vector3(),
  isGrounded: !1,
  isMoving: !1,
  lastUpdate: 0
}), Be = () => ({
  maxSpeed: 10,
  acceleration: 15,
  deceleration: 10,
  turnSpeed: 8,
  jumpForce: 12,
  gravity: -30,
  linearDamping: 0.95,
  angularDamping: 0.85
}), qe = () => ({
  currentSpeed: 0,
  averageSpeed: 0,
  totalDistance: 0,
  frameTime: 0,
  physicsTime: 0,
  isAccelerating: !1,
  groundContact: !1,
  lastPosition: new g.Vector3()
}), sn = (n, e) => ({
  motion: Ue(),
  config: Be(),
  metrics: qe(),
  entities: /* @__PURE__ */ new Map(),
  activeEntityId: null,
  setMotionActive: (t) => n((i) => ({
    motion: { ...i.motion, isActive: t }
  })),
  setCurrentPreset: (t) => n((i) => ({
    motion: { ...i.motion, currentPreset: t }
  })),
  setMotionType: (t) => n((i) => ({
    motion: { ...i.motion, motionType: t }
  })),
  updatePosition: (t) => n((i) => ({
    motion: { ...i.motion, position: t.clone() }
  })),
  updateVelocity: (t) => n((i) => {
    const s = t.length();
    return {
      motion: {
        ...i.motion,
        velocity: t.clone(),
        speed: s,
        isMoving: s > 0.1
      }
    };
  }),
  updateRotation: (t) => n((i) => ({
    motion: { ...i.motion, rotation: t.clone() }
  })),
  setGrounded: (t) => n((i) => ({
    motion: { ...i.motion, isGrounded: t }
  })),
  updateConfig: (t) => n((i) => ({
    config: { ...i.config, ...t }
  })),
  updateMetrics: (t) => n((i) => ({
    metrics: { ...i.metrics, ...t }
  })),
  registerEntity: (t, i) => n((s) => {
    const a = new Map(s.entities);
    return a.set(t, i), {
      entities: a,
      activeEntityId: s.activeEntityId || t
    };
  }),
  unregisterEntity: (t) => n((i) => {
    const s = new Map(i.entities);
    return s.delete(t), {
      entities: s,
      activeEntityId: i.activeEntityId === t ? null : i.activeEntityId
    };
  }),
  setActiveEntity: (t) => n((i) => ({
    activeEntityId: i.entities.has(t) ? t : null
  })),
  resetMotion: () => n(() => ({
    motion: Ue(),
    config: Be(),
    metrics: qe(),
    entities: /* @__PURE__ */ new Map(),
    activeEntityId: null
  }))
}), He = () => ({
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
    target: new g.Vector3(),
    angle: 0,
    isActive: !1,
    shouldRun: !1,
    buttons: { left: !1, right: !1, middle: !1 },
    wheel: 0,
    position: new g.Vector2()
  },
  gamepad: {
    connected: !1,
    leftStick: new g.Vector2(),
    rightStick: new g.Vector2(),
    triggers: { left: 0, right: 0 },
    buttons: {},
    vibration: { weak: 0, strong: 0 }
  },
  touch: {
    touches: [],
    gestures: {
      pinch: 1,
      rotation: 0,
      pan: new g.Vector2()
    }
  },
  lastUpdate: 0,
  isActive: !0
}), $e = () => ({
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
}), We = () => ({
  isActive: !0,
  lastCommand: null,
  commandHistory: [],
  syncStatus: "idle"
}), Ke = () => ({
  sensitivity: { mouse: 1, gamepad: 1, touch: 1 },
  deadzone: { gamepad: 0.1, touch: 0.05 },
  smoothing: { mouse: 0.1, gamepad: 0.2 },
  invertY: !1,
  enableVibration: !0
}), Ye = () => ({
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
}), Xe = () => ({
  inputLatency: 0,
  frameTime: 0,
  eventCount: 0,
  activeInputs: [],
  performanceScore: 100
}), Qe = () => ({
  queueLength: 0,
  executionTime: 0,
  performance: 100,
  memoryUsage: 0,
  errorRate: 0
}), rn = (n, e) => ({
  interaction: He(),
  automation: $e(),
  bridge: We(),
  config: {
    interaction: Ke(),
    automation: Ye()
  },
  metrics: {
    interaction: Xe(),
    automation: Qe()
  },
  addAutomationAction: (t) => {
    const i = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, s = {
      ...t,
      id: i,
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
    })), i;
  },
  removeAutomationAction: (t) => n((i) => ({
    automation: {
      ...i.automation,
      queue: {
        ...i.automation.queue,
        actions: i.automation.queue.actions.filter((s) => s.id !== t)
      }
    }
  })),
  startAutomation: () => n((t) => ({
    automation: {
      ...t.automation,
      queue: {
        ...t.automation.queue,
        isRunning: !0,
        isPaused: !1
      }
    }
  })),
  pauseAutomation: () => n((t) => ({
    automation: {
      ...t.automation,
      queue: {
        ...t.automation.queue,
        isPaused: !0
      }
    }
  })),
  resumeAutomation: () => n((t) => ({
    automation: {
      ...t.automation,
      queue: {
        ...t.automation.queue,
        isPaused: !1
      }
    }
  })),
  stopAutomation: () => n((t) => ({
    automation: {
      ...t.automation,
      queue: {
        ...t.automation.queue,
        isRunning: !1,
        isPaused: !1,
        currentIndex: 0
      },
      currentAction: null
    }
  })),
  clearAutomationQueue: () => n((t) => ({
    automation: {
      ...t.automation,
      queue: {
        ...t.automation.queue,
        actions: [],
        currentIndex: 0
      }
    }
  })),
  updateAutomationSettings: (t) => n((i) => ({
    automation: {
      ...i.automation,
      settings: { ...i.automation.settings, ...t }
    }
  })),
  updateInteractionConfig: (t) => n((i) => ({
    config: {
      ...i.config,
      interaction: { ...i.config.interaction, ...t }
    }
  })),
  updateAutomationConfig: (t) => n((i) => ({
    config: {
      ...i.config,
      automation: { ...i.config.automation, ...t }
    }
  })),
  updateInteractionMetrics: (t) => n((i) => ({
    metrics: {
      ...i.metrics,
      interaction: { ...i.metrics.interaction, ...t }
    }
  })),
  updateAutomationMetrics: (t) => n((i) => ({
    metrics: {
      ...i.metrics,
      automation: { ...i.metrics.automation, ...t }
    }
  })),
  setBridgeStatus: (t) => n((i) => ({
    bridge: { ...i.bridge, syncStatus: t }
  })),
  addCommandToHistory: (t) => n((i) => ({
    bridge: {
      ...i.bridge,
      lastCommand: t,
      commandHistory: [...i.bridge.commandHistory, t].slice(-100)
    }
  })),
  resetInteractions: () => n(() => ({
    interaction: He(),
    automation: $e(),
    bridge: We(),
    config: {
      interaction: Ke(),
      automation: Ye()
    },
    metrics: {
      interaction: Xe(),
      automation: Qe()
    }
  })),
  updateMouse: (t) => n((i) => ({
    interaction: {
      ...i.interaction,
      mouse: { ...i.interaction.mouse, ...t }
    }
  })),
  updateKeyboard: (t) => n((i) => ({
    interaction: {
      ...i.interaction,
      keyboard: { ...i.interaction.keyboard, ...t }
    }
  })),
  updateGamepad: (t) => n((i) => ({
    interaction: {
      ...i.interaction,
      gamepad: { ...i.interaction.gamepad, ...t }
    }
  })),
  updateTouch: (t) => n((i) => ({
    interaction: {
      ...i.interaction,
      touch: { ...i.interaction.touch, ...t }
    }
  })),
  setInteractionActive: (t) => n((i) => ({
    interaction: {
      ...i.interaction,
      isActive: t
    }
  }))
}), an = () => ({
  rideableId: "",
  isMoving: !1,
  isNotMoving: !0,
  isOnTheGround: !0,
  isOnMoving: !1,
  isRotated: !1,
  isRunning: !1,
  isJumping: !1,
  enableRiding: !1,
  isRiderOn: !1,
  isLanding: !1,
  isFalling: !1,
  isRiding: !1,
  canRide: !1,
  nearbyRideable: null,
  shouldEnterRideable: !1,
  shouldExitRideable: !1
}), on = (n) => ({
  states: an(),
  setStates: (e) => n((t) => ({
    states: { ...t.states, ...e }
  }))
}), cn = (n) => ({
  rideable: {},
  setRideable: (e, t) => n((i) => ({
    rideable: { ...i.rideable, [e]: t }
  })),
  removeRideable: (e) => n((t) => {
    const { [e]: i, ...s } = t.rideable;
    return { rideable: s };
  })
}), re = {
  position: new g.Vector3(),
  quaternion: new g.Quaternion(),
  euler: new g.Euler(),
  velocity: new g.Vector3(),
  direction: new g.Vector3(),
  dir: new g.Vector3(),
  angular: new g.Vector3(),
  isGround: !1
}, ln = (n) => ({
  activeState: re,
  setActiveState: (e) => n(() => ({
    activeState: { ...re, ...e }
  })),
  updateActiveState: (e) => n((t) => ({
    activeState: t.activeState ? { ...t.activeState, ...e } : re
  })),
  resetActiveState: () => n(() => ({
    activeState: re
  }))
}), un = {
  render: {
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  },
  engine: {
    geometries: 0,
    textures: 0
  }
}, dn = (n) => ({
  performance: un,
  setPerformance: (e) => n({
    performance: e
  })
}), hn = (n, e) => ({
  meshes: /* @__PURE__ */ new Map(),
  currentMeshId: null,
  addMesh: (t) => {
    n((i) => {
      const s = new Map(i.meshes);
      return s.set(t.id, t), { meshes: s };
    });
  },
  removeMesh: (t) => {
    n((i) => {
      const s = new Map(i.meshes);
      return s.delete(t), { meshes: s };
    });
  },
  updateMesh: (t, i) => {
    n((s) => {
      const a = s.meshes.get(t);
      if (a) {
        const o = { ...a, ...i }, c = new Map(s.meshes);
        return c.set(t, o), { meshes: c };
      }
      return s;
    });
  },
  setCurrentMeshId: (t) => {
    n({ currentMeshId: t });
  },
  tiles: /* @__PURE__ */ new Map(),
  addTile: (t) => {
    n((i) => {
      const s = new Map(i.tiles);
      return s.set(t.id, t), { tiles: s };
    });
  },
  removeTile: (t) => {
    n((i) => {
      const s = new Map(i.tiles);
      return s.delete(t), { tiles: s };
    });
  },
  updateTile: (t, i) => {
    n((s) => {
      const a = s.tiles.get(t);
      if (a) {
        const o = { ...a, ...i }, c = new Map(s.tiles);
        return c.set(t, o), { tiles: c };
      }
      return s;
    });
  },
  tileGroups: /* @__PURE__ */ new Map(),
  addTileGroup: (t) => {
    n((i) => {
      const s = new Map(i.tileGroups);
      return s.set(t.id, t), { tileGroups: s };
    });
  },
  removeTileGroup: (t) => {
    n((i) => {
      const s = new Map(i.tileGroups);
      s.delete(t);
      const a = new Map(i.tiles);
      return a.forEach((o) => {
        o.groupId === t && a.set(o.id, { ...o, groupId: void 0 });
      }), { tileGroups: s, tiles: a };
    });
  },
  updateTileGroup: (t, i) => {
    n((s) => {
      const a = s.tileGroups.get(t);
      if (a) {
        const o = { ...a, ...i }, c = new Map(s.tileGroups);
        return c.set(t, o), { tileGroups: c };
      }
      return s;
    });
  },
  addTileToGroup: (t, i) => {
    n((s) => {
      const a = s.tiles.get(i);
      if (a && s.tileGroups.has(t)) {
        const o = new Map(s.tiles);
        return o.set(i, { ...a, groupId: t }), { tiles: o };
      }
      return s;
    });
  },
  removeTileFromGroup: (t) => {
    n((i) => {
      const s = i.tiles.get(t);
      if (s != null && s.groupId) {
        const a = new Map(i.tiles);
        return a.set(t, { ...s, groupId: void 0 }), { tiles: a };
      }
      return i;
    });
  },
  walls: /* @__PURE__ */ new Map(),
  addWall: (t) => {
    n((i) => {
      const s = new Map(i.walls);
      return s.set(t.id, t), { walls: s };
    });
  },
  removeWall: (t) => {
    n((i) => {
      const s = new Map(i.walls);
      return s.delete(t), { walls: s };
    });
  },
  updateWall: (t, i) => {
    n((s) => {
      const a = s.walls.get(t);
      if (a) {
        const o = { ...a, ...i }, c = new Map(s.walls);
        return c.set(t, o), { walls: c };
      }
      return s;
    });
  },
  wallGroups: /* @__PURE__ */ new Map(),
  addWallGroup: (t) => {
    n((i) => {
      const s = new Map(i.wallGroups);
      return s.set(t.id, t), { wallGroups: s };
    });
  },
  removeWallGroup: (t) => {
    n((i) => {
      const s = new Map(i.wallGroups);
      s.delete(t);
      const a = new Map(i.walls);
      return a.forEach((o) => {
        o.groupId === t && a.set(o.id, { ...o, groupId: void 0 });
      }), { wallGroups: s, walls: a };
    });
  },
  updateWallGroup: (t, i) => {
    n((s) => {
      const a = s.wallGroups.get(t);
      if (a) {
        const o = { ...a, ...i }, c = new Map(s.wallGroups);
        return c.set(t, o), { wallGroups: c };
      }
      return s;
    });
  },
  addWallToGroup: (t, i) => {
    n((s) => {
      const a = s.walls.get(i);
      if (a && s.wallGroups.has(t)) {
        const o = new Map(s.walls);
        return o.set(i, { ...a, groupId: t }), { walls: o };
      }
      return s;
    });
  },
  removeWallFromGroup: (t) => {
    n((i) => {
      const s = i.walls.get(t);
      if (s != null && s.groupId) {
        const a = new Map(i.walls);
        return a.set(t, { ...s, groupId: void 0 }), { walls: a };
      }
      return i;
    });
  },
  npcs: /* @__PURE__ */ new Map(),
  addNpc: (t) => {
    n((i) => {
      const s = new Map(i.npcs);
      return s.set(t.id, t), { npcs: s };
    });
  },
  removeNpc: (t) => {
    n((i) => {
      const s = new Map(i.npcs);
      return s.delete(t), { npcs: s };
    });
  },
  updateNpc: (t, i) => {
    n((s) => {
      const a = s.npcs.get(t);
      if (a) {
        const o = { ...a, ...i }, c = new Map(s.npcs);
        return c.set(t, o), { npcs: c };
      }
      return s;
    });
  },
  interactableObjects: /* @__PURE__ */ new Map(),
  addInteractableObject: (t) => {
    n((i) => {
      const s = new Map(i.interactableObjects);
      return s.set(t.id, t), { interactableObjects: s };
    });
  },
  removeInteractableObject: (t) => {
    n((i) => {
      const s = new Map(i.interactableObjects);
      return s.delete(t), { interactableObjects: s };
    });
  },
  updateInteractableObject: (t, i) => {
    n((s) => {
      const a = s.interactableObjects.get(t);
      if (a) {
        const o = { ...a, ...i }, c = new Map(s.interactableObjects);
        return c.set(t, o), { interactableObjects: c };
      }
      return s;
    });
  }
}), S = ot()(
  zt(
    Lt((n, e, t) => ({
      ...Ft(n),
      ...Bt(n),
      ...qt(n),
      ...Xt(n),
      ...Zt(n),
      ...en(n),
      ...tn(n),
      ...nn(n),
      ...sn(n),
      ...rn(n),
      ...on(n),
      ...cn(n),
      ...ln(n),
      ...dn(n),
      ...hn(n),
      updateState: (i) => {
        n((s) => ({ ...s, ...i }));
      },
      initialize: (i) => {
        const s = e();
        i.mode && s.setMode(i.mode), i.urls && s.setUrls(i.urls), i.cameraOption && s.setCameraOption(i.cameraOption);
      }
    }))
  )
);
class mn {
  constructor() {
    j(this, "state");
    j(this, "metrics");
    j(this, "callbacks");
    this.state = {
      currentAnimation: "idle",
      animationMixer: null,
      actions: /* @__PURE__ */ new Map(),
      isPlaying: !1,
      currentWeight: 1,
      blendDuration: 0.3
    }, this.metrics = {
      activeAnimations: 0,
      totalActions: 0,
      currentWeight: 1,
      mixerTime: 0,
      lastUpdate: 0,
      blendProgress: 0
    }, this.callbacks = /* @__PURE__ */ new Set();
  }
  subscribe(e) {
    return this.callbacks.add(e), () => this.callbacks.delete(e);
  }
  notifyCallbacks() {
    this.callbacks.forEach((e) => e(this.getMetrics()));
  }
  initializeMixer(e) {
    this.state.animationMixer = new g.AnimationMixer(e);
  }
  addAnimation(e, t) {
    if (!this.state.animationMixer) return;
    const i = this.state.animationMixer.clipAction(t);
    this.state.actions.set(e, i), this.updateMetrics(), this.notifyCallbacks();
  }
  registerAction(e, t) {
    this.state.actions.set(e, t), this.updateMetrics(), this.notifyCallbacks();
  }
  playAnimation(e, t = this.state.blendDuration) {
    const i = this.state.actions.get(e);
    if (!i) return;
    const s = this.state.actions.get(this.state.currentAnimation);
    s && s !== i && s.fadeOut(t), i.reset().fadeIn(t).play(), this.state.currentAnimation = e, this.state.isPlaying = !0, this.updateMetrics(), this.notifyCallbacks();
  }
  stopAnimation() {
    const e = this.state.actions.get(this.state.currentAnimation);
    e && e.stop(), this.state.isPlaying = !1, this.state.currentAnimation = "idle", this.updateMetrics(), this.notifyCallbacks();
  }
  setWeight(e) {
    const t = this.state.actions.get(this.state.currentAnimation);
    t && (t.weight = e, this.state.currentWeight = e, this.updateMetrics(), this.notifyCallbacks());
  }
  setTimeScale(e) {
    const t = this.state.actions.get(this.state.currentAnimation);
    t && (t.timeScale = e, this.notifyCallbacks());
  }
  update(e) {
    this.state.animationMixer && (this.state.animationMixer.update(e), this.metrics.mixerTime += e, this.metrics.lastUpdate = Date.now(), this.callbacks.size > 0 && (this.updateMetrics(), this.notifyCallbacks()));
  }
  getCurrentAnimation() {
    return this.state.currentAnimation;
  }
  getAnimationList() {
    return Array.from(this.state.actions.keys());
  }
  getMetrics() {
    return { ...this.metrics };
  }
  getState() {
    return { ...this.state };
  }
  updateMetrics() {
    this.metrics.activeAnimations = Array.from(this.state.actions.values()).filter((e) => e.isRunning()).length, this.metrics.totalActions = this.state.actions.size, this.metrics.currentWeight = this.state.currentWeight;
  }
  dispose() {
    this.state.animationMixer && (this.state.animationMixer.stopAllAction(), this.state.animationMixer = null), this.state.actions.clear(), this.callbacks.clear();
  }
}
class fn {
  constructor() {
    j(this, "engines");
    j(this, "eventListeners");
    j(this, "unsubscribeFunctions");
    this.engines = /* @__PURE__ */ new Map(), this.eventListeners = /* @__PURE__ */ new Set(), this.unsubscribeFunctions = /* @__PURE__ */ new Map(), ["character", "vehicle", "airplane"].forEach((t) => {
      this.engines.set(t, new mn());
    }), this.setupEngineSubscriptions();
  }
  setupEngineSubscriptions() {
    this.engines.forEach((e, t) => {
      const i = e.subscribe(() => {
        this.notifyListeners(t);
      });
      this.unsubscribeFunctions.set(t, i);
    });
  }
  registerAnimationAction(e, t, i) {
    const s = this.engines.get(e);
    s && s.registerAction(t, i);
  }
  registerAnimations(e, t) {
    const i = this.engines.get(e);
    i && Object.entries(t).forEach(([s, a]) => {
      a && i.registerAction(s, a);
    });
  }
  execute(e, t) {
    const i = this.engines.get(e);
    if (i)
      switch (t.type) {
        case "play":
          t.animation && i.playAnimation(t.animation, t.duration);
          break;
        case "stop":
          i.stopAnimation();
          break;
        case "setWeight":
          t.weight !== void 0 && i.setWeight(t.weight);
          break;
        case "setSpeed":
          t.speed !== void 0 && i.setTimeScale(t.speed);
          break;
      }
  }
  snapshot(e) {
    const t = this.engines.get(e);
    if (!t)
      return this.getEmptySnapshot();
    const i = t.getState(), s = t.getMetrics();
    return {
      currentAnimation: i.currentAnimation,
      isPlaying: i.isPlaying,
      weight: i.currentWeight,
      speed: 1,
      availableAnimations: t.getAnimationList(),
      metrics: {
        activeAnimations: s.activeAnimations,
        totalActions: s.totalActions,
        mixerTime: s.mixerTime,
        lastUpdate: s.lastUpdate
      }
    };
  }
  getMetrics(e) {
    const t = this.engines.get(e);
    return t ? t.getMetrics() : null;
  }
  subscribe(e) {
    return this.eventListeners.add(e), () => this.eventListeners.delete(e);
  }
  notifyListeners(e) {
    if (this.eventListeners.size > 0) {
      const t = this.snapshot(e);
      this.eventListeners.forEach((i) => i(t, e));
    }
  }
  getEmptySnapshot() {
    return {
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
  update(e, t) {
    const i = this.engines.get(e);
    i && i.update(t);
  }
  dispose() {
    this.unsubscribeFunctions.forEach((e) => e()), this.unsubscribeFunctions.clear(), this.engines.forEach((e) => e.dispose()), this.engines.clear(), this.eventListeners.clear();
  }
}
let be = null;
function ct() {
  return be || (be = new fn()), be;
}
function me() {
  var l;
  const n = T(null), e = S((d) => d.mode), t = S((d) => d.animationState), i = S((d) => d.setAnimation);
  N(() => {
    const d = ct();
    n.current = d;
    const h = d.subscribe((f, C) => {
      var x, m;
      const w = (m = (x = S.getState().animationState) == null ? void 0 : x[C]) == null ? void 0 : m.current;
      f.currentAnimation !== w && i(C, f.currentAnimation);
    });
    return () => {
      h();
    };
  }, [i]);
  const s = E(
    (d, h) => {
      n.current && n.current.execute(d, h);
    },
    []
  ), a = E(
    (d, h) => {
      s(d, { type: "play", animation: h });
    },
    [s]
  ), o = E(
    (d) => {
      s(d, { type: "stop" });
    },
    [s]
  ), c = E(
    (d, h) => {
      n.current && n.current.registerAnimations(d, h);
    },
    []
  ), u = (e == null ? void 0 : e.type) || "character";
  return {
    bridge: n.current,
    playAnimation: a,
    stopAnimation: o,
    executeCommand: s,
    registerAnimations: c,
    currentType: u,
    currentAnimation: ((l = t == null ? void 0 : t[u]) == null ? void 0 : l.current) || "idle"
  };
}
function fe(n) {
  const { playAnimation: e, currentType: t, currentAnimation: i } = me(), s = S((h) => {
    var f;
    return (f = h.interaction) == null ? void 0 : f.keyboard;
  }), a = S((h) => {
    var f;
    return (f = h.interaction) == null ? void 0 : f.mouse;
  }), o = S((h) => h.automation), c = S((h) => h.states), u = V(() => {
    const h = (s == null ? void 0 : s.forward) || (s == null ? void 0 : s.backward) || (s == null ? void 0 : s.leftward) || (s == null ? void 0 : s.rightward), f = (a == null ? void 0 : a.isActive) || !1;
    return {
      isMoving: h || f,
      isRunning: (s == null ? void 0 : s.shift) && h || (a == null ? void 0 : a.shouldRun) && f && (o == null ? void 0 : o.queue.isRunning)
    };
  }, [s, a, o]), l = V(() => c != null && c.isJumping ? "jump" : c != null && c.isFalling ? "fall" : c != null && c.isRiding ? "ride" : c != null && c.isLanding ? "land" : u.isRunning ? "run" : u.isMoving ? "walk" : "idle", [c, u]), d = V(() => ["idle", "walk", "run", "jump", "fall", "ride", "land"], []);
  N(() => {
    if (!n) return;
    l !== "idle" ? l !== i && e(t, l) : d.includes(i) && i !== "idle" && e(t, "idle");
  }, [n, l, i, e, t, d]);
}
function Es(n) {
  return {
    playAnimation: (e, t = 0.2) => {
      const i = n[e];
      i && i !== null && i.reset().fadeIn(t).play();
    },
    stopAnimation: (e, t = 0.2) => {
      const i = n[e];
      i && i !== null && i.fadeOut(t);
    },
    crossFade: (e, t, i = 0.2) => {
      const s = n[e], a = n[t];
      s && s !== null && s.fadeOut(i), a && a !== null && a.reset().fadeIn(i).play();
    }
  };
}
function pn(n = {}) {
  const { minHeight: e = 0.5, offsetY: t = 0.5 } = n, { activeState: i } = S(), s = S((l) => l.updateMouse), a = !!(i != null && i.position), o = (l, d, h) => {
    if (h !== "ground" || !(i != null && i.position))
      return !1;
    try {
      const f = i.position, C = Q(l.point.x, l.point.y, l.point.z), w = Math.atan2(
        C.z - f.z,
        C.x - f.x
      ), x = Math.max(C.y + t, e), m = Q(C.x, x, C.z);
      return s({
        target: m,
        angle: w,
        position: new g.Vector2(m.x, m.z),
        isActive: !0,
        shouldRun: d
      }), !0;
    } catch {
      return !1;
    }
  };
  return {
    moveClicker: o,
    stopClicker: () => {
      try {
        if (!a) return;
        s({ isActive: !1, shouldRun: !1 });
      } catch {
      }
    },
    onClick: (l) => {
      o(l, !1, "ground");
    },
    isReady: a
  };
}
function As() {
  const n = S((a) => a.activeState), e = S((a) => a.mode), t = S((a) => a.animationState), i = S((a) => a.urls), s = e != null && e.type && t ? t[e.type].current : "idle";
  return {
    state: n || null,
    mode: e || null,
    urls: i,
    currentAnimation: s
  };
}
const gn = {
  KeyW: "forward",
  KeyA: "leftward",
  KeyS: "backward",
  KeyD: "rightward",
  ShiftLeft: "shift",
  Space: "space",
  KeyZ: "keyZ",
  KeyR: "keyR",
  KeyF: "keyF",
  KeyE: "keyE",
  Escape: "escape"
}, Te = (n = !0, e = !0, t) => {
  const i = S((h) => h.updateKeyboard), s = S((h) => h.automation), a = S((h) => h.stopAutomation), o = S((h) => h.updateMouse), c = T(/* @__PURE__ */ new Set()), u = V(() => ({ ...gn }), []), l = E(
    (h, f) => {
      try {
        return i({ [h]: f }), f ? c.current.add(h) : c.current.delete(h), !0;
      } catch (C) {
        return console.error("Error updating keyboard state:", C), !1;
      }
    },
    [i]
  ), d = E(() => {
    c.current.clear(), i({
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
    });
  }, [i]);
  return N(() => {
    const h = (x, m) => {
      const y = u[x.code];
      if (!y) return;
      const p = c.current.has(x.code);
      m && !p ? (c.current.add(x.code), x.code === "Space" && x.preventDefault(), e && x.code === "KeyS" && (s != null && s.queue.isRunning) && (a(), o({ isActive: !1, shouldRun: !1 })), i({ [y]: !0 })) : !m && p && (c.current.delete(x.code), i({ [y]: !1 }));
    }, f = (x) => h(x, !0), C = (x) => h(x, !1), w = () => document.hidden && d();
    return window.addEventListener("keydown", f), window.addEventListener("keyup", C), document.addEventListener("visibilitychange", w), () => {
      window.removeEventListener("keydown", f), window.removeEventListener("keyup", C), document.removeEventListener("visibilitychange", w);
    };
  }, [
    u,
    e,
    i,
    a,
    o,
    s,
    d
  ]), {
    pressedKeys: Array.from(c.current),
    pushKey: l,
    isKeyPressed: (h) => c.current.has(h),
    clearAllKeys: d
  };
}, yn = 5, xn = 0.5, bn = 20, Je = 0.1, vn = 0.01, A = 200, wn = (n) => {
  const e = S((k) => k.mode), t = S((k) => k.activeState), i = S((k) => k.minimap), {
    size: s = 200,
    scale: a = yn,
    zoom: o = 2,
    blockRotate: c = !1,
    angle: u = 0,
    updateInterval: l = 33
  } = n, d = T(null), [h, f] = R(a), C = T(null), w = T(null), x = !!(t.position && n), m = E(() => {
    n.blockScale || f((k) => Math.min(bn, k + 0.1));
  }, [n.blockScale]), y = E(() => {
    n.blockScale || f((k) => Math.max(xn, k - 0.1));
  }, [n.blockScale]), p = E(
    (k) => {
      n.blockScale || (k.preventDefault(), k.deltaY < 0 ? m() : y());
    },
    [n.blockScale, m, y]
  ), b = E(() => {
    const k = d.current;
    if (!k) return;
    const v = (z) => {
      n.blockScale || (z.preventDefault(), z.deltaY < 0 ? m() : y());
    };
    return k.addEventListener("wheel", v, { passive: !1 }), () => {
      k.removeEventListener("wheel", v);
    };
  }, [n.blockScale, m, y]), M = E(() => {
    const k = d.current;
    if (!k || !i) return;
    const v = k.getContext("2d");
    if (!v) return;
    const { position: z, euler: G } = t, F = G.y;
    v.clearRect(0, 0, A, A), v.save(), v.beginPath(), v.arc(A / 2, A / 2, A / 2, 0, Math.PI * 2), v.clip();
    const B = v.createRadialGradient(
      A / 2,
      A / 2,
      0,
      A / 2,
      A / 2,
      A / 2
    );
    B.addColorStop(0, "rgba(20, 30, 40, 0.9)"), B.addColorStop(1, "rgba(10, 20, 30, 0.95)"), v.fillStyle = B, v.fillRect(0, 0, A, A);
    const _ = c || (e == null ? void 0 : e.control) === "normal" ? 180 : F * 180 / Math.PI + 180;
    v.translate(A / 2, A / 2), v.rotate(_ * Math.PI / 180), v.translate(-A / 2, -A / 2), v.save(), v.strokeStyle = "rgba(255, 255, 255, 0.1)", v.lineWidth = 1;
    for (let O = 0; O < A; O += 20)
      v.beginPath(), v.moveTo(O, 0), v.lineTo(O, A), v.moveTo(0, O), v.lineTo(A, O), v.stroke();
    v.restore(), v.save(), v.fillStyle = "white", v.font = "bold 16px sans-serif", v.shadowColor = "rgba(0, 0, 0, 0.8)", v.shadowBlur = 3, [
      { text: "N", x: A / 2, y: 25, color: "#ff6b6b" },
      { text: "S", x: A / 2, y: A - 25, color: "#4ecdc4" },
      { text: "E", x: A - 25, y: A / 2, color: "#45b7d1" },
      { text: "W", x: 25, y: A / 2, color: "#f9ca24" }
    ].forEach(({ text: O, x: H, y: ee, color: P }) => {
      v.save(), v.fillStyle = P, v.translate(H, ee), v.rotate(-_ * Math.PI / 180), v.textAlign = "center", v.textBaseline = "middle", v.fillText(O, 0, 0), v.restore();
    }), v.restore(), i && i.props && Object.values(i.props).forEach((O) => {
      if (!(O != null && O.center) || !(O != null && O.size)) return;
      const { center: H, size: ee, text: P } = O, U = (H.x - z.x) * h, $ = (H.z - z.z) * h;
      v.save();
      const W = ee.x * h, ie = ee.z * h, ge = A / 2 - U - W / 2, ye = A / 2 - $ - ie / 2;
      v.shadowColor = "rgba(0, 0, 0, 0.6)", v.shadowBlur = 4, v.shadowOffsetX = 2, v.shadowOffsetY = 2, v.fillStyle = "rgba(0,0,0,0.3)", v.fillRect(ge, ye, W, ie), v.shadowColor = "transparent", v.strokeStyle = "rgba(255, 255, 255, 0.3)", v.lineWidth = 1, v.strokeRect(ge, ye, W, ie), P && (v.save(), v.fillStyle = "white", v.font = "bold 12px sans-serif", v.shadowColor = "rgba(0, 0, 0, 0.8)", v.shadowBlur = 2, v.translate(ge + W / 2, ye + ie / 2), c || (e == null ? void 0 : e.control) === "normal" ? v.rotate(Math.PI) : v.rotate(-_ * Math.PI / 180), v.textAlign = "center", v.textBaseline = "middle", v.fillText(P, 0, 0), v.restore()), v.restore();
    }), v.save();
    const Z = v.createRadialGradient(
      A / 2,
      A / 2,
      0,
      A / 2,
      A / 2,
      12
    );
    Z.addColorStop(0, "#01fff7"), Z.addColorStop(0.7, "#01fff7"), Z.addColorStop(1, "transparent"), v.fillStyle = Z, v.beginPath(), v.arc(A / 2, A / 2, 12, 0, Math.PI * 2), v.fill(), v.fillStyle = "#01fff7", v.shadowColor = "0 0 10px rgba(1,255,247,0.7)", v.shadowBlur = 8, v.beginPath(), v.arc(A / 2, A / 2, 6, 0, Math.PI * 2), v.fill(), v.shadowColor = "transparent", v.strokeStyle = "rgba(255, 255, 255, 0.8)", v.lineWidth = 2, v.beginPath(), v.moveTo(A / 2, A / 2), v.lineTo(A / 2, A / 2 - 12), v.stroke(), v.restore(), v.restore();
  }, [t, i, e, h, u, c]), I = E(() => {
    const { position: k, euler: v } = t, z = v.y, G = C.current, F = w.current;
    if (!G || F === null) {
      M(), C.current = k.clone(), w.current = z;
      return;
    }
    const B = Math.abs(k.x - G.x) > Je || Math.abs(k.z - G.z) > Je, _ = Math.abs(z - F) > vn;
    (B || _) && (M(), C.current = k.clone(), w.current = z);
  }, [t, M]);
  return N(() => {
    M();
    const k = setInterval(I, l);
    return () => {
      clearInterval(k);
    };
  }, [M, I, l]), N(() => {
    M();
  }, [h, M]), {
    canvasRef: d,
    scale: h,
    upscale: m,
    downscale: y,
    handleWheel: p,
    setupWheelListener: b,
    updateCanvas: M,
    isReady: x
  };
}, le = /* @__PURE__ */ new Map(), oe = new g.Vector3(1, 1, 1), Sn = new g.Box3(), jn = (n) => {
  const e = le.get(n);
  e && --e.refCount <= 0 && le.delete(n);
}, Cn = (n) => {
  try {
    return Sn.setFromObject(n).getSize(Ie());
  } catch {
    return oe.clone();
  }
}, lt = ({ url: n }) => {
  const e = S((h) => h.sizes), t = S((h) => h.setSizes), i = n ?? "data:application/json,{}", s = !!(n != null && n.trim()), a = de(i), o = T(!1), c = E(
    () => s && a.scene ? Cn(a.scene) : oe.clone(),
    [a.scene, s]
  );
  N(() => {
    if (!n || !s) return;
    const h = le.get(n);
    return h ? h.refCount++ : le.set(n, { gltf: a, refCount: 1, size: c() }), () => jn(n);
  }, [n, s, a, c]), N(() => {
    if (o.current || !s || !n || !a.scene || e[n]) return;
    o.current = !0;
    const h = c();
    t((f) => ({ ...f, [n]: h }));
  }, [n, a.scene, e, t, c, s]);
  const u = V(
    () => s && n ? e[n] ?? oe : oe,
    [e, n, s]
  ), l = E(
    (h, f) => {
      if (!s) return;
      const C = f ?? n;
      C && Promise.resolve().then(() => t((w) => ({ ...w, [C]: h })));
    },
    [n, t, s]
  ), d = E(
    (h) => {
      if (!s) return null;
      const f = h ?? n;
      return f ? e[f] ?? null : null;
    },
    [n, e, s]
  );
  return { gltf: a, size: u, setSize: l, getSize: d };
}, ut = () => {
  const n = S((i) => i.sizes), e = E(
    (i) => {
      if (!i) return {};
      const s = {};
      return Object.entries(i).forEach(([a, o]) => {
        typeof o == "string" ? s[a] = n[o] ?? null : s[a] = null;
      }), s;
    },
    [n]
  ), t = E((i) => {
    console.log("GLTF 프리로딩이 비활성화되었습니다:", i);
  }, []);
  return { getSizesByUrls: e, preloadSizes: t };
}, Mn = {
  isRiderOn: !1,
  position: ce(),
  rotation: at(),
  offset: ce(),
  visible: !0
};
function Ns() {
  const n = S((p) => p.states), e = S((p) => p.rideable), t = S((p) => p.activeState), i = S((p) => p.urls), s = S((p) => p.setStates), a = S((p) => p.setMode), o = S((p) => p.setRideable), c = S((p) => p.setUrls), { getSizesByUrls: u } = ut(), l = E(
    (p) => {
      const b = {};
      b.ridingUrl = p.ridingUrl ?? i.characterUrl, p.objectType === "vehicle" ? (b.vehicleUrl = p.url ?? "", b.wheelUrl = p.wheelUrl ?? "") : p.objectType === "airplane" && (b.airplaneUrl = p.url ?? ""), c(b);
    },
    [c, i]
  ), d = E(
    (p) => {
      const b = e[p];
      if (!(b != null && b.position)) return;
      const M = b.objectType, { vehicleUrl: I, airplaneUrl: k, characterUrl: v } = u(i);
      !(M === "vehicle" ? I : k) || !v || (s({
        enableRiding: !1,
        isRiderOn: !1,
        rideableId: ""
      }), o(p, {
        ...b,
        visible: !0,
        position: t.position.clone()
      }));
    },
    [
      e,
      u,
      i,
      s,
      o,
      t.position
    ]
  ), h = E(async () => {
    if (n.canRide && n.nearbyRideable && !n.isRiding) {
      const { objectkey: p, objectType: b } = n.nearbyRideable, M = e[p];
      if (!M) return;
      l(M), a({ type: b }), s({
        rideableId: p,
        isRiding: !0,
        canRide: !1,
        nearbyRideable: null,
        enableRiding: M.enableRiding,
        isRiderOn: !0
      }), o(p, {
        ...M,
        visible: !1
      });
    }
  }, [
    n.canRide,
    n.nearbyRideable,
    n.isRiding,
    e,
    l,
    a,
    s,
    o
  ]), f = E(async () => {
    n.isRiding && n.rideableId && (d(n.rideableId), a({ type: "character" }), s({
      isRiding: !1,
      rideableId: ""
    }));
  }, [n.isRiding, n.rideableId, d, a, s]);
  N(() => {
    const p = (b) => {
      b.code === "KeyF" && (n.canRide && n.nearbyRideable ? h() : n.isRiding && f());
    };
    return window.addEventListener("keydown", p), () => window.removeEventListener("keydown", p);
  }, [
    n.canRide,
    n.nearbyRideable,
    n.isRiding,
    h,
    f
  ]), N(() => {
    n.shouldEnterRideable && (h(), s({ shouldEnterRideable: !1 }));
  }, [n.shouldEnterRideable, h, s]), N(() => {
    n.shouldExitRideable && (f(), s({ shouldExitRideable: !1 }));
  }, [n.shouldExitRideable, f, s]);
  const C = E(
    (p) => {
      o(p.objectkey, {
        ...Mn,
        ...p
      });
    },
    [o]
  ), w = E(
    (p) => {
      o(p.objectkey, p);
    },
    [o]
  ), x = (p) => e[p], m = E(
    async (p, b) => {
      if ((p.other.rigidBodyObject && p.other.rigidBodyObject.name === "character" || p.other.rigidBodyObject && !p.other.rigidBodyObject.name || p.other.rigidBody) && !n.isRiding) {
        if (!b.objectType) return;
        s({
          nearbyRideable: {
            objectkey: b.objectkey,
            objectType: b.objectType,
            name: b.objectType === "vehicle" ? "차량" : "비행기",
            rideMessage: b.rideMessage,
            exitMessage: b.exitMessage,
            displayName: b.displayName
          },
          canRide: !0
        });
      }
    },
    [n.isRiding, s]
  ), y = E(
    async (p) => {
      (p.other.rigidBodyObject && p.other.rigidBodyObject.name === "character" || p.other.rigidBodyObject && !p.other.rigidBodyObject.name || p.other.rigidBody) && s({
        nearbyRideable: null,
        canRide: !1
      });
    },
    [s]
  );
  return {
    initRideable: C,
    updateRideable: w,
    getRideable: x,
    onRideableNear: m,
    onRideableLeave: y,
    enterRideable: h,
    exitRideable: f,
    landing: d
  };
}
function kn() {
  const n = S((s) => s.activeState), e = S((s) => s.setActiveState);
  return {
    teleport: (s) => {
      if (!n)
        return !1;
      try {
        e({
          ...n,
          position: s.clone(),
          velocity: new g.Vector3(0, 0, 0)
        });
        const a = new CustomEvent("gaesup:teleport", {
          detail: {
            position: s.clone(),
            timestamp: Date.now()
          }
        });
        return window.dispatchEvent(a), document.dispatchEvent(
          new CustomEvent("teleport-request", {
            detail: { position: s.clone() }
          })
        ), !0;
      } catch (a) {
        return console.error("Teleport failed:", a), !1;
      }
    },
    canTeleport: !!n
  };
}
const Rs = () => {
  const n = S();
  return {
    activeState: n.activeState,
    mode: n.mode,
    animationState: n.animationState,
    states: n.states,
    urls: n.urls,
    rideable: n.rideable,
    block: n.block,
    cameraOption: n.cameraOption,
    minimap: n.minimap
  };
}, Is = () => {
  const [n, e] = R(!1);
  kt(n);
  const t = E((i) => {
    e(i);
  }, []);
  return { isHovered: n, setHovered: t };
}, En = 100, Ee = 1e3, ve = 10;
function An() {
  const n = /* @__PURE__ */ new Map(), e = Array.from({ length: ve }, () => new g.Vector3());
  return {
    getTempVector: (t) => e[t % ve].set(0, 0, 0),
    getCached: (t, i) => (n.has(t) || (n.size >= En && n.delete(n.keys().next().value), n.set(t, i())), n.get(t)),
    clear: () => n.clear(),
    getStats: () => ({ cacheSize: n.size, tempVectorCount: ve })
  };
}
const q = /* @__PURE__ */ new Map(), Ze = (n) => {
  const e = Math.round(n * 100) / 100;
  return q.has(e) || (q.size >= Ee && q.delete(q.keys().next().value), q.set(e, { sin: Math.sin(n), cos: Math.cos(n) })), q.get(e);
}, Nn = () => q.clear(), Rn = () => ({
  size: q.size,
  maxSize: Ee,
  coverage: `${(q.size / Ee * 100).toFixed(1)}%`
}), et = (n) => {
  const e = 2 * Math.PI;
  for (; n > Math.PI; ) n -= e;
  for (; n < -Math.PI; ) n += e;
  return n;
}, tt = (n, e, t = 0.01) => Math.abs(n - e) >= t, Ts = (n, e, t = 0.01) => n.distanceTo(e) >= t, ue = class ue {
  constructor() {
    j(this, "vectorCaches", /* @__PURE__ */ new Map());
  }
  static getInstance() {
    return this.instance ?? (this.instance = new ue());
  }
  getVectorCache(e) {
    return this.vectorCaches.get(e) ?? (this.vectorCaches.set(e, An()), this.vectorCaches.get(e));
  }
  clearAll() {
    this.vectorCaches.forEach((e) => e.clear()), Nn();
  }
  getStats() {
    return {
      vectorCaches: Array.from(this.vectorCaches.entries()).map(([e, t]) => ({
        id: e,
        ...t.getStats()
      })),
      trigCache: Rn()
    };
  }
};
j(ue, "instance");
let Ae = ue;
const Os = (n) => {
  var e, t;
  return (t = (e = n == null ? void 0 : n.name) == null ? void 0 : e.split("_")) == null ? void 0 : t[0];
}, Ds = (n, e) => {
  var t, i;
  return ((i = (t = e == null ? void 0 : e.name) == null ? void 0 : t.split("_")) == null ? void 0 : i[0]) === n;
}, Ps = {
  get(n) {
    if (typeof window < "u") {
      const e = localStorage.getItem(n);
      if (e)
        try {
          return JSON.parse(e);
        } catch (t) {
          return console.error("Error parsing cached data:", t), null;
        }
    }
    return null;
  },
  set(n, e) {
    if (typeof window < "u")
      try {
        const t = JSON.stringify(e);
        localStorage.setItem(n, t);
      } catch (t) {
        console.error("Error serializing data for cache:", t);
      }
  },
  remove(n) {
    typeof window < "u" && localStorage.removeItem(n);
  }
}, K = new g.Vector3(), we = new g.Vector3(), In = new g.Quaternion(), X = {
  tempVectors: {
    temp1: new g.Vector3(),
    temp2: new g.Vector3(),
    temp3: new g.Vector3()
  },
  clampValue: (n, e, t) => Math.max(e, Math.min(t, n)),
  frameRateIndependentLerpVector3: (n, e, t, i) => {
    const s = 1 - Math.exp(-t * i);
    n.lerp(e, s);
  },
  smoothLookAt: (n, e, t, i) => {
    K.subVectors(e, n.position).normalize();
    const s = In.setFromRotationMatrix(new g.Matrix4().lookAt(n.position, e, n.up)).normalize();
    n.quaternion.clone().normalize().dot(s) < 0 && (s.x *= -1, s.y *= -1, s.z *= -1, s.w *= -1);
    const o = 1 - Math.exp(-t * i);
    n.quaternion.slerp(s, o).normalize();
  },
  preventCameraJitter: (n, e, t, i, s) => {
    X.frameRateIndependentLerpVector3(n.position, e, i, s), X.smoothLookAt(n, t, i * 0.8, s);
  },
  improvedCollisionCheck: (n, e, t, i = 0.5) => {
    const s = new g.Vector3().subVectors(e, n).normalize(), a = n.distanceTo(e), o = new g.Raycaster(n, s, 0, a), c = [];
    if (t.traverse((d) => {
      var f;
      if (!(d instanceof g.Mesh) || d.userData.intangible || !((f = d.geometry) != null && f.boundingSphere)) return;
      const h = o.intersectObject(d, !1);
      h.length > 0 && c.push({
        object: d,
        distance: h[0].distance,
        point: h[0].point
      });
    }), c.length === 0)
      return { safe: !0, position: e, obstacles: [] };
    const u = c.reduce(
      (d, h) => h.distance < d.distance ? h : d
    );
    return { safe: !1, position: n.clone().add(s.multiplyScalar(Math.max(0, u.distance - i))), obstacles: c };
  },
  distanceSquared: (n, e) => K.subVectors(n, e).lengthSq(),
  safeNormalize: (n) => {
    const e = n.length();
    return e > 0 ? n.divideScalar(e) : n.set(0, 0, 0);
  },
  smoothDamp: (n, e, t, i, s, a) => {
    const o = 2 / i, c = o * s, u = 1 / (1 + c + 0.48 * c * c + 0.235 * c * c * c);
    K.subVectors(n, e);
    const l = a ? a * i : 1 / 0;
    K.clampLength(0, l), we.copy(t).addScaledVector(K, o).multiplyScalar(s), t.copy(t).sub(we).multiplyScalar(u), n.copy(e).add(K.add(we).multiplyScalar(u));
  },
  calculateBounds: (n, e, t) => {
    if (!t) return n;
    const i = t.minX !== void 0 ? Math.max(t.minX, n.x) : n.x, s = t.minY !== void 0 ? Math.max(t.minY, n.y) : n.y, a = t.minZ !== void 0 ? Math.max(t.minZ, n.z) : n.z, o = t.maxX !== void 0 ? Math.min(t.maxX, i) : i, c = t.maxY !== void 0 ? Math.min(t.maxY, s) : s, u = t.maxZ !== void 0 ? Math.min(t.maxZ, a) : a;
    return K.set(o, c, u);
  },
  fastAtan2: (n, e) => e === 0 ? n > 0 ? Math.PI / 2 : n < 0 ? -Math.PI / 2 : 0 : e > 0 ? Math.atan(n / e) : Math.atan(n / e) + (n >= 0 ? Math.PI : -Math.PI),
  updateFOV: (n, e, t) => {
    t && t > 0 ? n.fov = g.MathUtils.lerp(n.fov, e, t) : n.fov = e, n.updateProjectionMatrix();
  },
  clampPosition: (n, e) => (e && (n.y = X.clampValue(
    n.y,
    e.minY || -1 / 0,
    e.maxY || 1 / 0
  )), n),
  isPositionEqual: (n, e, t = 1e-3) => Math.abs(n.x - e.x) < t && Math.abs(n.y - e.y) < t && Math.abs(n.z - e.z) < t,
  pool: {
    vectors: [],
    getVector3: () => X.pool.vectors.pop() || new g.Vector3(),
    releaseVector3: (n) => {
      n.set(0, 0, 0), X.pool.vectors.push(n);
    }
  },
  calculateSafeDistance: (n, e, t, i) => {
    const s = n.distanceTo(e);
    return g.MathUtils.clamp(s, t, i);
  },
  isPositionValid: (n, e) => e ? n.y >= e.minY && n.y <= e.maxY : !0
}, L = {
  getPosition: (n) => n != null && n.position ? n.position instanceof g.Vector3 ? n.position : typeof n.position == "object" ? new g.Vector3(
    n.position.x || 0,
    n.position.y || 0,
    n.position.z || 0
  ) : new g.Vector3(0, 0, 0) : new g.Vector3(0, 0, 0),
  getEuler: (n) => n != null && n.euler ? n.euler instanceof g.Euler ? n.euler : typeof n.euler == "object" ? new g.Euler(
    n.euler.x || 0,
    n.euler.y || 0,
    n.euler.z || 0
  ) : new g.Euler(0, 0, 0) : new g.Euler(0, 0, 0),
  getVelocity: (n) => n != null && n.velocity ? n.velocity instanceof g.Vector3 ? n.velocity : typeof n.velocity == "object" ? new g.Vector3(
    n.velocity.x || 0,
    n.velocity.y || 0,
    n.velocity.z || 0
  ) : new g.Vector3(0, 0, 0) : new g.Vector3(0, 0, 0),
  calculateCameraOffset: (n, e) => {
    const { xDistance: t = 15, yDistance: i = 8, zDistance: s = 15, euler: a, mode: o = "thirdPerson" } = e;
    switch (o) {
      case "chase":
        return a ? new g.Vector3(
          Math.sin(a.y),
          1,
          Math.cos(a.y)
        ).normalize().multiply(new g.Vector3(-t, i, -s)) : new g.Vector3(-t, i, -s);
      case "thirdPerson":
      default:
        return new g.Vector3(-t, i, -s);
    }
  },
  getCameraTarget: (n, e) => {
    const t = L.getPosition(n);
    return e.target || t;
  }
};
class J {
  calculateLookAt(e, t) {
    return L.getPosition(e.activeState);
  }
  update(e, t) {
    var u;
    const { camera: i, deltaTime: s, activeState: a } = e;
    if (!a) return;
    Object.assign(t.config, this.defaultConfig);
    const o = this.calculateTargetPosition(e, t), c = this.calculateLookAt(e, t);
    X.preventCameraJitter(
      i,
      o,
      c,
      8,
      s
    ), t.config.fov && i instanceof g.PerspectiveCamera && X.updateFOV(i, t.config.fov, (u = t.config.smoothing) == null ? void 0 : u.fov);
  }
}
class Tn extends J {
  constructor() {
    super(...arguments);
    j(this, "name", "thirdPerson");
    j(this, "defaultConfig", {
      distance: { x: 15, y: 8, z: 15 },
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
      enableCollision: !0
    });
  }
  calculateTargetPosition(t, i) {
    const s = L.getPosition(t.activeState), a = L.calculateCameraOffset(s, {
      xDistance: i.config.distance.x,
      yDistance: i.config.distance.y,
      zDistance: i.config.distance.z,
      mode: "thirdPerson"
    });
    return s.clone().add(a);
  }
}
class On extends J {
  constructor() {
    super(...arguments);
    j(this, "name", "firstPerson");
    j(this, "defaultConfig", {
      distance: { x: 0, y: 1.7, z: 0 },
      smoothing: { position: 0.2, rotation: 0.15, fov: 0.1 },
      enableCollision: !1
    });
  }
  calculateTargetPosition(t, i) {
    const s = L.getPosition(t.activeState), a = new g.Vector3(0, 1.7, 0);
    return s.clone().add(a);
  }
  calculateLookAt(t, i) {
    const s = L.getPosition(t.activeState), a = L.getEuler(t.activeState), o = new g.Vector3(0, 0, -1);
    return a && o.applyEuler(a), s.clone().add(o);
  }
}
class Dn extends J {
  constructor() {
    super(...arguments);
    j(this, "name", "chase");
    j(this, "defaultConfig", {
      distance: { x: 10, y: 5, z: 10 },
      smoothing: { position: 0.15, rotation: 0.1, fov: 0.1 },
      enableCollision: !0
    });
  }
  calculateTargetPosition(t, i) {
    const s = L.getPosition(t.activeState), a = L.getEuler(t.activeState), o = L.calculateCameraOffset(s, {
      xDistance: i.config.distance.x,
      yDistance: i.config.distance.y,
      zDistance: i.config.distance.z,
      euler: a,
      mode: "chase"
    });
    return s.clone().add(o);
  }
}
class Pn extends J {
  constructor() {
    super(...arguments);
    j(this, "name", "topDown");
    j(this, "defaultConfig", {
      distance: { x: 0, y: 20, z: 0 },
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
      enableCollision: !1
    });
  }
  calculateTargetPosition(t, i) {
    const s = L.getPosition(t.activeState);
    return new g.Vector3(
      s.x,
      s.y + i.config.distance.y,
      s.z
    );
  }
}
class zn extends J {
  constructor() {
    super(...arguments);
    j(this, "name", "isometric");
    j(this, "defaultConfig", {
      distance: { x: 15, y: 15, z: 15 },
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
      enableCollision: !1
    });
  }
  calculateTargetPosition(t, i) {
    const s = L.getPosition(t.activeState), a = Math.PI / 4, o = Math.sqrt(i.config.distance.x ** 2 + i.config.distance.z ** 2);
    return new g.Vector3(
      s.x + Math.cos(a) * o,
      s.y + i.config.distance.y,
      s.z + Math.sin(a) * o
    );
  }
}
class Vn extends J {
  constructor() {
    super(...arguments);
    j(this, "name", "sideScroll");
    j(this, "defaultConfig", {
      distance: { x: 0, y: 5, z: 10 },
      smoothing: { position: 0.08, rotation: 0.1, fov: 0.1 },
      enableCollision: !1
    });
  }
  calculateTargetPosition(t, i) {
    const s = L.getPosition(t.activeState);
    return new g.Vector3(
      s.x + i.config.distance.x,
      s.y + i.config.distance.y,
      i.config.distance.z
    );
  }
}
class Ln extends J {
  constructor() {
    super(...arguments);
    j(this, "name", "fixed");
    j(this, "defaultConfig", {
      distance: { x: 0, y: 0, z: 0 },
      smoothing: { position: 0, rotation: 0, fov: 0 },
      enableCollision: !1
    });
  }
  calculateTargetPosition(t, i) {
    return i.config.fixedPosition || new g.Vector3(0, 10, 10);
  }
  calculateLookAt(t, i) {
    return i.config.fixedLookAt || new g.Vector3(0, 0, 0);
  }
}
function Gn(n) {
  return { all: n = n || /* @__PURE__ */ new Map(), on: function(e, t) {
    var i = n.get(e);
    i ? i.push(t) : n.set(e, [t]);
  }, off: function(e, t) {
    var i = n.get(e);
    i && (t ? i.splice(i.indexOf(t) >>> 0, 1) : n.set(e, []));
  }, emit: function(e, t) {
    var i = n.get(e);
    i && i.slice().map(function(s) {
      s(t);
    }), (i = n.get("*")) && i.slice().map(function(s) {
      s(e, t);
    });
  } };
}
class Fn {
  constructor(e) {
    j(this, "emitter");
    j(this, "config");
    j(this, "metrics", {
      frameCount: 0,
      totalFrameTime: 0,
      lastUpdateTime: 0
    });
    this.emitter = Gn(), this.config = e;
  }
  updateConfig(e) {
    const t = { ...this.config };
    this.config = { ...this.config, ...e }, Object.keys(e).forEach((i) => {
      this.emitter.emit("configChange", {
        key: i,
        value: e[i]
      });
    }), t.mode !== this.config.mode && this.emitter.emit("modeChange", {
      from: t.mode,
      to: this.config.mode
    });
  }
  getConfig() {
    return { ...this.config };
  }
  getState() {
    return {
      config: this.getConfig(),
      metrics: this.getMetrics()
    };
  }
  getMetrics() {
    return {
      frameCount: this.metrics.frameCount,
      averageFrameTime: this.metrics.frameCount > 0 ? this.metrics.totalFrameTime / this.metrics.frameCount : 0,
      lastUpdateTime: this.metrics.lastUpdateTime
    };
  }
  trackFrameMetrics(e) {
    this.metrics.frameCount++, this.metrics.totalFrameTime += e, this.metrics.lastUpdateTime = Date.now();
  }
  emitError(e, t) {
    this.emitter.emit("error", { message: e, details: t });
  }
  destroy() {
    this.emitter.all.clear();
  }
}
class _n extends Fn {
  constructor(t) {
    super(t);
    j(this, "controllers", /* @__PURE__ */ new Map());
    j(this, "state");
    this.state = this.createInitialState(), this.registerControllers();
  }
  createInitialState() {
    return {
      config: {
        mode: "thirdPerson",
        distance: { x: 15, y: 8, z: 15 },
        bounds: void 0,
        enableCollision: !0,
        smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
        fov: 75,
        zoom: 1
      },
      activeController: void 0
    };
  }
  registerController(t) {
    this.controllers.set(t.name, t);
  }
  updateConfig(t) {
    Object.assign(this.state.config, t), (t.xDistance !== void 0 || t.yDistance !== void 0 || t.zDistance !== void 0) && (this.state.config.distance = {
      x: t.xDistance || this.state.config.distance.x,
      y: t.yDistance || this.state.config.distance.y,
      z: t.zDistance || this.state.config.distance.z
    });
  }
  update(t) {
    this.trackFrameMetrics(t);
  }
  calculate(t) {
    try {
      const i = this.controllers.get(this.state.config.mode);
      if (!i) return;
      this.state.activeController = i, i.update(t, this.state);
    } catch (i) {
      console.error("Camera calculation error:", i), this.emitError("Camera calculation failed", i);
    }
  }
  getState() {
    return this.state;
  }
  registerControllers() {
    this.registerController(new Tn()), this.registerController(new On()), this.registerController(new Dn()), this.registerController(new Pn()), this.registerController(new zn()), this.registerController(new Vn()), this.registerController(new Ln());
  }
}
function Un(n, e, t) {
  const i = T(null);
  i.current || (i.current = new n(e));
  const s = i.current;
  ne((u, l) => {
    s == null || s.update(l);
  }), N(() => {
    if (!t || !s) return;
    const u = [];
    return Object.entries(t).forEach(([l, d]) => {
      d && (s.emitter.on(l, d), u.push(() => {
        s.emitter.off(l, d);
      }));
    }), () => {
      u.forEach((l) => l());
    };
  }, [t, s]), N(() => () => {
    s == null || s.destroy();
  }, [s]);
  const a = E((u) => {
    s == null || s.updateConfig(u);
  }, [s]), o = E(() => s == null ? void 0 : s.getState(), [s]), c = E(() => s == null ? void 0 : s.getMetrics(), [s]);
  return {
    engine: s,
    updateConfig: a,
    getState: o,
    getMetrics: c
  };
}
function Bn() {
  const n = S((c) => c.block), e = S((c) => c.activeState), t = S((c) => c.cameraOption), i = S((c) => c.mode), s = V(() => ({
    mode: (i == null ? void 0 : i.control) || "thirdPerson",
    enableMetrics: !0,
    autoUpdate: !0,
    ...t
  }), []), { engine: a, updateConfig: o } = Un(
    _n,
    s
  );
  return N(() => {
    o({
      mode: (i == null ? void 0 : i.control) || "thirdPerson",
      ...t
    });
  }, [t, i, o]), ne((c, u) => {
    if (!a || n.camera) return;
    const l = {
      camera: c.camera,
      scene: c.scene,
      deltaTime: u,
      activeState: e,
      clock: c.clock,
      excludeObjects: []
    };
    a.calculate(l);
  }), {
    engine: a
  };
}
function qn() {
  return Bn(), null;
}
class zs {
  constructor(e) {
    j(this, "isEnabled", !1);
    j(this, "positionHistory", []);
    j(this, "debugInfo", []);
    j(this, "maxHistoryLength", 100);
    j(this, "cleanupInterval", null);
    j(this, "disposables", /* @__PURE__ */ new Set());
    j(this, "debugLines", []);
    j(this, "scene", null);
    this.scene = e || null;
  }
  enable(e) {
    this.isEnabled = !0, e && (this.scene = e), this.setupCleanupInterval(), this.setupEventListeners();
  }
  disable() {
    this.isEnabled = !1, this.cleanup();
  }
  setupCleanupInterval() {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupOldHistory();
    }, 5e3), this.disposables.add(() => {
      this.cleanupInterval && (clearInterval(this.cleanupInterval), this.cleanupInterval = null);
    });
  }
  setupEventListeners() {
    const e = () => this.handleResize();
    window.addEventListener("resize", e), this.disposables.add(() => window.removeEventListener("resize", e));
  }
  handleResize() {
    this.isEnabled && (console.error("[CameraDebugger] Window resized, clearing debug info"), this.clearDebugInfo());
  }
  update(e, t, i) {
    if (!this.isEnabled) return;
    const s = e.position.clone(), a = new g.Vector3();
    e.getWorldDirection(a), a.multiplyScalar(10).add(s), this.addPositionToHistory(s);
    const o = {
      position: s.clone(),
      target: a.clone(),
      distance: s.length(),
      fov: e instanceof g.PerspectiveCamera ? e.fov : 0,
      state: i || "unknown",
      timestamp: Date.now()
    };
    this.addDebugInfo(o), this.updateDebugVisuals(e);
  }
  addPositionToHistory(e) {
    this.positionHistory.push(e.clone()), this.positionHistory.length > this.maxHistoryLength && this.positionHistory.shift();
  }
  addDebugInfo(e) {
    this.debugInfo.push(e), this.debugInfo.length > this.maxHistoryLength && this.debugInfo.shift();
  }
  updateDebugVisuals(e) {
    if (this.scene && (this.clearDebugLines(), this.positionHistory.length > 1)) {
      const t = new g.BufferGeometry(), i = [];
      this.positionHistory.forEach((o) => {
        i.push(o.x, o.y, o.z);
      }), t.setAttribute("position", new g.Float32BufferAttribute(i, 3));
      const s = new g.LineBasicMaterial({
        color: 65280,
        transparent: !0,
        opacity: 0.6
      }), a = new g.Line(t, s);
      this.scene.add(a), this.debugLines.push(a), this.disposables.add(() => {
        t.dispose(), s.dispose(), this.scene && this.scene.remove(a);
      });
    }
  }
  clearDebugLines() {
    this.debugLines.forEach((e) => {
      e.geometry && e.geometry.dispose(), e.material instanceof g.Material && e.material.dispose(), this.scene && this.scene.remove(e);
    }), this.debugLines.length = 0;
  }
  cleanupOldHistory() {
    const e = Date.now(), t = 1e4;
    if (this.debugInfo = this.debugInfo.filter((i) => e - i.timestamp < t), this.positionHistory.length > this.maxHistoryLength * 0.8) {
      const i = Math.floor(this.positionHistory.length * 0.2);
      this.positionHistory.splice(0, i);
    }
  }
  getDebugInfo() {
    return [...this.debugInfo];
  }
  getPositionHistory() {
    return [...this.positionHistory];
  }
  exportData() {
    const e = {
      debugInfo: this.debugInfo,
      positionHistory: this.positionHistory.map((t) => ({ x: t.x, y: t.y, z: t.z })),
      timestamp: Date.now()
    };
    return JSON.stringify(e, null, 2);
  }
  clearDebugInfo() {
    this.debugInfo.length = 0, this.positionHistory.length = 0, this.clearDebugLines();
  }
  cleanup() {
    this.clearDebugInfo(), this.clearDebugLines();
  }
  dispose() {
    this.disable(), this.disposables.forEach((e) => e()), this.disposables.clear(), this.cleanup();
  }
}
var dt = { exports: {} }, pe = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Hn = Me, $n = Symbol.for("react.element"), Wn = Symbol.for("react.fragment"), Kn = Object.prototype.hasOwnProperty, Yn = Hn.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Xn = { key: !0, ref: !0, __self: !0, __source: !0 };
function ht(n, e, t) {
  var i, s = {}, a = null, o = null;
  t !== void 0 && (a = "" + t), e.key !== void 0 && (a = "" + e.key), e.ref !== void 0 && (o = e.ref);
  for (i in e) Kn.call(e, i) && !Xn.hasOwnProperty(i) && (s[i] = e[i]);
  if (n && n.defaultProps) for (i in e = n.defaultProps, e) s[i] === void 0 && (s[i] = e[i]);
  return { $$typeof: $n, type: n, key: a, ref: o, props: s, _owner: Yn.current };
}
pe.Fragment = Wn;
pe.jsx = ht;
pe.jsxs = ht;
dt.exports = pe;
var r = dt.exports;
const Qn = [
  { value: "thirdPerson", label: "Third Person" },
  { value: "firstPerson", label: "First Person" },
  { value: "chase", label: "Chase" },
  { value: "topDown", label: "Top Down" },
  { value: "isometric", label: "Isometric" },
  { value: "side", label: "Side-Scroller" },
  { value: "fixed", label: "Fixed" }
];
function mt() {
  const { mode: n, setMode: e } = S(), t = (n == null ? void 0 : n.control) || "thirdPerson";
  return /* @__PURE__ */ r.jsx("div", { className: "cc-panel", children: /* @__PURE__ */ r.jsx("div", { className: "cc-list", children: Qn.map((i) => /* @__PURE__ */ r.jsx(
    "button",
    {
      className: `cc-button ${t === i.value ? "active" : ""}`,
      onClick: () => e({ control: i.value }),
      children: i.label
    },
    i.value
  )) }) });
}
const Jn = [
  { key: "mode", label: "Mode", enabled: !0, format: "text" },
  { key: "position", label: "Position", enabled: !0, format: "vector3", precision: 2 },
  { key: "distance", label: "Distance", enabled: !0, format: "vector3", precision: 2 },
  { key: "fov", label: "FOV", enabled: !0, format: "angle", precision: 1 },
  { key: "velocity", label: "Velocity", enabled: !1, format: "vector3", precision: 2 },
  { key: "rotation", label: "Rotation", enabled: !1, format: "vector3", precision: 2 },
  { key: "zoom", label: "Zoom", enabled: !1, format: "number", precision: 2 },
  { key: "activeController", label: "Controller", enabled: !0, format: "text" }
];
function ft() {
  const [n, e] = R({}), { mode: t, cameraOption: i, activeState: s, characterPosition: a, characterVelocity: o, characterRotation: c } = S();
  N(() => {
    const l = setInterval(() => {
      e({
        mode: t == null ? void 0 : t.control,
        distance: i == null ? void 0 : i.distance,
        fov: i == null ? void 0 : i.fov,
        position: a || (s == null ? void 0 : s.position),
        velocity: o,
        rotation: c,
        zoom: i == null ? void 0 : i.zoom
      });
    }, 100);
    return () => clearInterval(l);
  }, [t, i, s, a, o, c]);
  const u = (l, d = 2) => l == null ? "N/A" : typeof l == "object" && l.x !== void 0 ? `X:${l.x.toFixed(d)} Y:${l.y.toFixed(d)} Z:${l.z.toFixed(d)}` : typeof l == "number" ? l.toFixed(d) : l.toString();
  return /* @__PURE__ */ r.jsx("div", { className: "cd-panel", children: /* @__PURE__ */ r.jsx("div", { className: "cd-grid", children: Jn.map((l) => /* @__PURE__ */ r.jsxs("div", { className: "cd-item", children: [
    /* @__PURE__ */ r.jsx("span", { className: "cd-label", children: l.label }),
    /* @__PURE__ */ r.jsx("span", { className: "cd-value", children: u(n[l.key]) })
  ] }, l.key)) }) });
}
const Zn = [
  {
    id: "classic",
    name: "Classic",
    description: "A traditional third-person view.",
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
    config: {
      mode: "side",
      distance: { x: 15, y: 0, z: 0 },
      fov: 75,
      smoothing: { position: 0.15, rotation: 0.15, fov: 0.15 }
    }
  }
];
function pt() {
  const [n] = R(Zn), {
    setMode: e,
    setCameraOption: t,
    mode: i,
    cameraOption: s
  } = S(), [a, o] = R(null), c = (u) => {
    e({ control: u.config.mode });
    const l = {
      ...s,
      distance: u.config.distance,
      fov: u.config.fov,
      smoothing: u.config.smoothing || { position: 0.1, rotation: 0.1, fov: 0.1 }
    };
    t(l);
  };
  return N(() => {
    const u = n.find(
      (l) => l.config.mode === (i == null ? void 0 : i.control) && JSON.stringify(l.config.distance) === JSON.stringify(s == null ? void 0 : s.distance)
    );
    o(u ? u.id : null);
  }, [i, s, n]), /* @__PURE__ */ r.jsx("div", { className: "cp-panel", children: /* @__PURE__ */ r.jsx("div", { className: "cp-grid", children: n.map((u) => /* @__PURE__ */ r.jsxs(
    "button",
    {
      className: `cp-item ${a === u.id ? "active" : ""}`,
      onClick: () => c(u),
      children: [
        /* @__PURE__ */ r.jsx("div", { className: "cp-name", children: u.name }),
        /* @__PURE__ */ r.jsx("div", { className: "cp-description", children: u.description })
      ]
    },
    u.id
  )) }) });
}
function Vs({
  debugPanelProps: n,
  controllerProps: e,
  presetsProps: t
}) {
  return /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
    n && /* @__PURE__ */ r.jsx(ft, { ...n }),
    e && /* @__PURE__ */ r.jsx(mt, { ...e }),
    t && /* @__PURE__ */ r.jsx(pt, { ...t })
  ] });
}
const ei = [
  { value: "idle", label: "Idle" },
  { value: "walk", label: "Walk" },
  { value: "run", label: "Run" },
  { value: "jump", label: "Jump" },
  { value: "fall", label: "Fall" },
  { value: "dance", label: "Dance" },
  { value: "wave", label: "Wave" }
];
function ti() {
  const { playAnimation: n, currentType: e, currentAnimation: t } = me(), i = (s) => {
    n(e, s);
  };
  return /* @__PURE__ */ r.jsx("div", { className: "ac-panel", children: /* @__PURE__ */ r.jsx("div", { className: "ac-grid", children: ei.map((s) => /* @__PURE__ */ r.jsx(
    "button",
    {
      className: `ac-button ${s.value === t ? "active" : ""}`,
      onClick: () => i(s.value),
      title: s.label,
      children: s.label
    },
    s.value
  )) }) });
}
const ni = () => /* @__PURE__ */ r.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ r.jsx("path", { d: "M8 5v14l11-7z" }) }), ii = () => /* @__PURE__ */ r.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ r.jsx("path", { d: "M6 19h4V5H6v14zm8-14v14h4V5h-4z" }) }), si = () => /* @__PURE__ */ r.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ r.jsx("path", { d: "M6 6h2v12H6zm3.5 6l8.5 6V6z" }) }), ri = () => /* @__PURE__ */ r.jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ r.jsx("path", { d: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" }) });
function ai() {
  const { bridge: n, playAnimation: e, stopAnimation: t, currentType: i, currentAnimation: s } = me(), [a, o] = R(!1), [c, u] = R([]), [l, d] = R(30);
  N(() => {
    if (!n) return;
    const f = () => {
      const w = n.snapshot(i);
      o(w.isPlaying), u(w.availableAnimations);
    };
    return f(), n.subscribe((w, x) => {
      x === i && f();
    });
  }, [n, i]);
  const h = () => {
    a ? t(i) : e(i, s);
  };
  return /* @__PURE__ */ r.jsxs("div", { className: "ap-panel", children: [
    /* @__PURE__ */ r.jsxs("div", { className: "ap-controls", children: [
      /* @__PURE__ */ r.jsx(
        "select",
        {
          className: "ap-select",
          value: s,
          onChange: (f) => e(i, f.target.value),
          children: c.map((f) => /* @__PURE__ */ r.jsx("option", { value: f, children: f }, f))
        }
      ),
      /* @__PURE__ */ r.jsxs("div", { className: "ap-buttons", children: [
        /* @__PURE__ */ r.jsx("button", { className: "ap-btn", "aria-label": "previous animation", children: /* @__PURE__ */ r.jsx(si, {}) }),
        /* @__PURE__ */ r.jsx("button", { className: "ap-btn-primary", onClick: h, "aria-label": a ? "pause" : "play", children: a ? /* @__PURE__ */ r.jsx(ii, {}) : /* @__PURE__ */ r.jsx(ni, {}) }),
        /* @__PURE__ */ r.jsx("button", { className: "ap-btn", "aria-label": "next animation", children: /* @__PURE__ */ r.jsx(ri, {}) })
      ] })
    ] }),
    /* @__PURE__ */ r.jsxs("div", { className: "ap-timeline", children: [
      /* @__PURE__ */ r.jsx("span", { className: "ap-time", children: "0:00" }),
      /* @__PURE__ */ r.jsx(
        "input",
        {
          type: "range",
          className: "ap-slider",
          min: "0",
          max: "100",
          value: l,
          onChange: (f) => d(Number(f.target.value))
        }
      ),
      /* @__PURE__ */ r.jsx("span", { className: "ap-time", children: "1:30" })
    ] })
  ] });
}
const oi = [
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
function ci() {
  const { bridge: n, currentType: e } = me(), [t, i] = R({
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
  N(() => {
    if (!n) return;
    const o = () => {
      const u = n.snapshot(e), l = n.getMetrics(e);
      i((d) => ({
        ...d,
        currentAnimation: u.currentAnimation,
        animationType: e,
        availableAnimations: u.availableAnimations,
        isPlaying: u.isPlaying,
        weight: u.weight,
        speed: u.speed,
        activeActions: u.metrics.activeAnimations,
        frameCount: (l == null ? void 0 : l.totalActions) || 0,
        averageFrameTime: (l == null ? void 0 : l.mixerTime) || 0,
        lastUpdateTime: Date.now()
      }));
    };
    return o(), n.subscribe((u, l) => {
      l === e && o();
    });
  }, [n, e]);
  const s = (o, c, u = 2) => {
    if (o == null) return "N/A";
    switch (c) {
      case "array":
        return Array.isArray(o) ? `${o.length} animations` : String(o);
      case "boolean":
        return o ? "Yes" : "No";
      case "number":
        return typeof o == "number" ? o.toFixed(u) : String(o);
      default:
        return String(o);
    }
  }, a = (o) => t[o];
  return /* @__PURE__ */ r.jsx("div", { className: "ad-panel", children: /* @__PURE__ */ r.jsx("div", { className: "ad-content", children: oi.filter((o) => o.enabled).map((o) => /* @__PURE__ */ r.jsxs("div", { className: "ad-item", children: [
    /* @__PURE__ */ r.jsx("span", { className: "ad-label", children: o.label }),
    /* @__PURE__ */ r.jsx("span", { className: "ad-value", children: s(a(o.key), o.format) })
  ] }, o.key)) }) });
}
class Ls extends St {
  constructor() {
    super(...arguments);
    j(this, "state", {
      hasError: !1,
      error: null,
      errorInfo: null
    });
  }
  static getDerivedStateFromError(t) {
    return { hasError: !0, error: t, errorInfo: null };
  }
  componentDidCatch(t, i) {
    var s, a;
    console.error("[Gaesup Error]", {
      error: t.toString(),
      stack: i.componentStack,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }), this.reportError(t, i), (a = (s = this.props).onError) == null || a.call(s, t, i);
  }
  reportError(t, i) {
    typeof window < "u" && window.Sentry && window.Sentry.captureException(t, {
      contexts: {
        react: {
          componentStack: i.componentStack
        }
      }
    });
  }
  render() {
    return this.state.hasError ? this.props.fallback || /* @__PURE__ */ r.jsx(li, { error: this.state.error }) : this.props.children;
  }
}
function li({ error: n }) {
  return console.error("ErrorBoundary caught error:", n), /* @__PURE__ */ r.jsxs("div", { children: [
    /* @__PURE__ */ r.jsx("h3", { children: "앱에서 오류가 발생했습니다" }),
    /* @__PURE__ */ r.jsx("p", { children: "콘솔을 확인해주세요" })
  ] });
}
function ui() {
  const n = S(), e = S((l) => l.interaction), t = S((l) => l.updateKeyboard), i = S((l) => l.updateMouse), s = S((l) => l.urls), a = S((l) => l.activeState), o = S((l) => l.block), { getSizesByUrls: c } = ut(), u = !!(e && s && a);
  return {
    worldContext: n,
    activeState: a,
    input: {
      keyboard: e == null ? void 0 : e.keyboard,
      mouse: e == null ? void 0 : e.mouse
    },
    urls: s,
    setKeyboardInput: t,
    setMouseInput: i,
    getSizesByUrls: c,
    isReady: u,
    blockControl: o == null ? void 0 : o.control
  };
}
class di {
  constructor() {
    j(this, "memoManager", Ae.getInstance());
    j(this, "vectorCache", this.memoManager.getVectorCache("direction"));
    j(this, "tempEuler", new g.Euler());
    j(this, "tempQuaternion", new g.Quaternion());
    j(this, "targetQuaternion", new g.Quaternion());
    j(this, "lastEulerY", { character: 0, vehicle: 0, airplane: 0 });
    j(this, "lastDirectionLength", 0);
    j(this, "lastKeyboardState", {
      forward: !1,
      backward: !1,
      leftward: !1,
      rightward: !1
    });
  }
  updateDirection(e, t, i, s, a) {
    const { modeType: o } = e;
    switch (o) {
      case "character":
        this.updateCharacterDirection(e, t, i);
        break;
      case "vehicle":
        this.updateVehicleDirection(e, t);
        break;
      case "airplane":
        this.updateAirplaneDirection(e, s, a, t);
        break;
      default:
        this.updateCharacterDirection(e, t, i);
    }
  }
  updateCharacterDirection(e, t, i) {
    const { activeState: s, keyboard: a, mouse: o, characterConfig: c } = e, u = this.lastKeyboardState.forward !== a.forward || this.lastKeyboardState.backward !== a.backward || this.lastKeyboardState.leftward !== a.leftward || this.lastKeyboardState.rightward !== a.rightward;
    o.isActive ? this.handleMouseDirection(s, o, c, i) : u && ((a.forward || a.backward || a.leftward || a.rightward) && this.handleKeyboardDirection(s, a, c, t), this.lastKeyboardState = {
      forward: a.forward,
      backward: a.backward,
      leftward: a.leftward,
      rightward: a.rightward
    }), this.emitRotationUpdate(s, "character");
  }
  updateVehicleDirection(e, t) {
    const { activeState: i, keyboard: s } = e, { forward: a, backward: o, leftward: c, rightward: u } = s, l = Number(c) - Number(u), d = Number(a) - Number(o);
    l !== 0 && (t === "chase" ? i.euler.y += l * (Math.PI / 120) : i.euler.y += l * (Math.PI / 64), this.emitRotationUpdate(i, "vehicle"));
    const { sin: h, cos: f } = Ze(i.euler.y);
    i.direction.set(h * d, 0, f * d), i.dir.copy(i.direction).normalize();
  }
  updateAirplaneDirection(e, t, i, s) {
    const { activeState: a, keyboard: o, airplaneConfig: c } = e, { forward: u, backward: l, leftward: d, rightward: h, shift: f, space: C } = o, {
      angleDelta: w = { x: 0, y: 0, z: 0 },
      maxAngle: x = { x: 0, y: 0, z: 0 },
      accelRatio: m = 1
    } = c || {};
    if (!(t != null && t.current)) return;
    let y = 1;
    f && (y *= m), C && (y *= 1.5);
    const p = Number(l) - Number(u), b = Number(h) - Number(d);
    s === "chase" ? a.euler.y += -b * w.y * 0.5 : a.euler.y += -b * w.y, this.applyAirplaneRotation(t.current, p, b, x, a), a.direction.set(
      Math.sin(a.euler.y) * y,
      -p * y,
      Math.cos(a.euler.y) * y
    ), a.dir.copy(a.direction).normalize(), S.getState().updateState({
      activeState: {
        ...S.getState().activeState,
        euler: a.euler,
        direction: a.direction,
        dir: a.dir
      }
    });
  }
  applyAirplaneRotation(e, t, i, s, a) {
    const o = s.x * t, c = s.z * i, u = e.rotation.x, l = e.rotation.z, d = s.x, h = s.z;
    let f = u + o, C = l + c;
    f < -d ? f = -d : f > d && (f = d), C < -h ? C = -h : C > h && (C = h), a.euler.x = f, a.euler.z = C, this.tempEuler.set(f, 0, C), this.tempQuaternion.setFromEuler(e.rotation), this.targetQuaternion.setFromEuler(this.tempEuler), this.tempQuaternion.slerp(this.targetQuaternion, 0.2), e.setRotationFromQuaternion(this.tempQuaternion);
  }
  handleMouseDirection(e, t, i, s) {
    const { automation: a } = s.worldContext || {};
    if (a != null && a.settings.trackProgress && a.queue.actions && a.queue.actions.length > 0) {
      const o = a.queue.actions.shift();
      if (o && o.target) {
        const c = s.body.translation(), u = o.target, l = new g.Vector3().subVectors(u, c).normalize();
        s.memo.direction = l.clone(), s.memo.directionTarget = u.clone(), a.settings.loop && o && a.queue.actions && a.queue.actions.push(o);
      }
    } else {
      if (s != null && s.rigidBodyRef.current) {
        const o = s.rigidBodyRef.current.translation(), c = this.vectorCache.getTempVector(0);
        if (c.set(o.x, o.y, o.z), Wt(c, t.target, !1) < 1) {
          this.handleClicker(s, o);
          return;
        }
      }
      this.applyMouseRotation(e, t, i);
    }
  }
  handleClicker(e, t) {
    var s, a;
    const { automation: i } = e.worldContext || {};
    if (i != null && i.settings.trackProgress && i.queue.actions && i.queue.actions.length > 0) {
      const o = i.queue.actions.shift();
      if (o && o.target) {
        const c = Math.atan2(o.target.z - t.z, o.target.x - t.x);
        (s = e.setMouseInput) == null || s.call(e, { target: o.target, angle: c, isActive: !0 });
      } else if (o && o.type === "wait") {
        const c = o.duration || 1e3;
        e.state && (e.state.clock.stop(), setTimeout(() => {
          e.state && e.state.clock.start();
        }, c));
      }
      i.settings.loop && o && i.queue.actions && i.queue.actions.push(o);
    } else
      (a = e.setMouseInput) == null || a.call(e, { isActive: !1, shouldRun: !1 });
  }
  applyMouseRotation(e, t, i) {
    const { turnSpeed: s = 10 } = i, a = Math.PI / 2 - t.angle;
    let o = et(a - e.euler.y);
    const c = s * Math.PI / 80, u = Math.sign(o) * Math.min(Math.abs(o), c);
    e.euler.y += u;
    const { sin: l, cos: d } = Ze(e.euler.y), h = this.vectorCache.getTempVector(2);
    h.set(-l, 0, -d), e.direction.copy(h), e.dir.copy(h).normalize();
  }
  handleKeyboardDirection(e, t, i, s) {
    const { forward: a, backward: o, leftward: c, rightward: u } = t, { turnSpeed: l = 10 } = i, d = Number(c) - Number(u), h = Number(a) - Number(o);
    if (d === 0 && h === 0) return;
    const f = this.vectorCache.getTempVector(5);
    f.set(d, 0, h);
    const C = Kt(f);
    let w = et(C - e.euler.y);
    const x = l * Math.PI / 160, m = Math.sign(w) * Math.min(Math.abs(w), x);
    e.euler.y += m, e.dir.set(d, 0, h), e.direction.copy(e.dir);
  }
  emitRotationUpdate(e, t) {
    const i = e.dir.length(), s = tt(e.euler.y, this.lastEulerY[t], 1e-3), a = tt(i, this.lastDirectionLength, 0.01);
    (s || a) && (S.getState().updateState({
      activeState: {
        ...S.getState().activeState,
        euler: e.euler,
        direction: e.direction,
        dir: e.dir
      }
    }), this.lastDirectionLength = i), this.lastEulerY[t] = e.euler.y;
  }
}
class hi {
  applyImpulse(e, t) {
    if (!e.current) return;
    const { modeType: i } = t;
    switch (i) {
      case "character":
        this.applyCharacterImpulse(e, t);
        break;
      case "vehicle":
        this.applyVehicleImpulse(e, t);
        break;
      case "airplane":
        this.applyAirplaneImpulse(e, t);
        break;
      default:
        this.applyCharacterImpulse(e, t);
    }
  }
  applyCharacterImpulse(e, t) {
    const {
      gameStates: { isMoving: i, isRunning: s, isOnTheGround: a, isJumping: o },
      activeState: c,
      characterConfig: u
    } = t, { walkSpeed: l = 10, runSpeed: d = 20, jumpSpeed: h = 15 } = u;
    if (o && a) {
      const f = e.current.linvel();
      e.current.setLinvel({ x: f.x, y: h, z: f.z }, !0), S.getState().setStates({
        isJumping: !1,
        isOnTheGround: !0
      });
    }
    if (i) {
      const f = s ? d : l, C = c.dir, w = c.velocity, x = e.current.mass(), m = -C.x * f, y = -C.z * f, p = m - w.x, b = y - w.z, M = p * x, I = b * x;
      e.current.applyImpulse({ x: M, y: 0, z: I }, !0);
    }
  }
  applyVehicleImpulse(e, t) {
    const { activeState: i, vehicleConfig: s } = t, { maxSpeed: a = 10 } = s, o = i.direction.clone().multiplyScalar(a);
    e.current.applyImpulse({ x: o.x, y: 0, z: o.z }, !0);
  }
  applyAirplaneImpulse(e, t) {
    const { activeState: i, airplaneConfig: s } = t, { maxSpeed: a = 5 } = s, o = i.direction.clone().multiplyScalar(a);
    e.current.applyImpulse({ x: o.x, y: o.y, z: o.z }, !0);
  }
}
class mi {
  applyGravity(e, t) {
    if (!e.current) return;
    const { modeType: i } = t;
    switch (i) {
      case "character":
        this.applyCharacterGravity(e, t);
        break;
      case "airplane":
        this.applyAirplaneGravity(e, t);
        break;
      case "vehicle":
        break;
      default:
        this.applyCharacterGravity(e, t);
    }
  }
  applyCharacterGravity(e, t) {
    const {
      gameStates: { isJumping: i, isFalling: s },
      characterConfig: { jumpGravityScale: a = 1.5, normalGravityScale: o = 1 }
    } = t;
    i || s ? e.current.setGravityScale(a, !1) : e.current.setGravityScale(o, !1);
  }
  applyAirplaneGravity(e, t) {
    const { airplaneConfig: { gravityScale: i = 0.3 } = {} } = t;
    e.current.setGravityScale(i, !1);
  }
}
class fi {
  constructor() {
    j(this, "keyStateCache", /* @__PURE__ */ new Map());
    j(this, "isCurrentlyJumping", !1);
    j(this, "lastMovingState", !1);
    j(this, "lastRunningState", !1);
  }
  checkAll(e, t) {
    var s;
    const i = `physics-${((s = e.rigidBodyRef.current) == null ? void 0 : s.handle) || "unknown"}`;
    this.checkGround(e), this.checkMoving(e), this.checkRotate(e, t.activeState), this.checkRiding(e, i);
  }
  checkGround(e) {
    const { rigidBodyRef: t, matchSizes: i } = e;
    if (!t.current) {
      S.getState().setStates({
        isOnTheGround: !1,
        isFalling: !0
      });
      return;
    }
    const s = t.current.linvel(), a = t.current.translation();
    let o = 1;
    i && i.characterUrl && (o = i.characterUrl.y * 0.1);
    const c = a.y <= o, u = Math.abs(s.y) < 0.5, l = c && u, d = !l && s.y < -0.1;
    l && this.resetJumpState(), S.getState().setStates({
      isOnTheGround: l,
      isFalling: d
    }), S.getState().updateState({
      activeState: {
        ...S.getState().activeState,
        position: new g.Vector3(a.x, a.y, a.z),
        velocity: new g.Vector3(s.x, s.y, s.z)
      }
    });
  }
  checkMoving(e) {
    const { inputRef: t } = e;
    if (!t || !t.current)
      return;
    const i = t.current.keyboard, s = t.current.mouse, a = i.shift, o = i.space, c = i.forward, u = i.backward, l = i.leftward, d = i.rightward, h = s.isActive, f = s.shouldRun, C = c || u || l || d, w = C || h;
    let x = !1;
    (C && a || h && f) && (x = !0), o && !this.isCurrentlyJumping && (this.isCurrentlyJumping = !0, S.getState().setStates({
      isJumping: !0,
      isOnTheGround: !0
    })), (this.lastMovingState !== w || this.lastRunningState !== x) && (this.lastMovingState = w, this.lastRunningState = x, S.getState().setStates({
      isMoving: w,
      isRunning: x,
      isNotMoving: !w,
      isNotRunning: !x
    }));
  }
  checkRotate(e, t) {
    const { outerGroupRef: i } = e;
    !t.isMoving || i != null && i.current;
  }
  checkRiding(e, t = "default") {
    const { inputRef: i } = e;
    if (!i || !i.current)
      return;
    this.keyStateCache.has(t) || this.keyStateCache.set(t, { lastKeyE: !1, lastKeyR: !1 });
    const s = this.keyStateCache.get(t), a = i.current.keyboard.keyF, o = S.getState().states;
    a && !s.lastKeyE && (o.canRide && !o.isRiding ? S.getState().setStates({
      shouldEnterRideable: !0,
      shouldExitRideable: !1
    }) : o.isRiding && S.getState().setStates({
      shouldEnterRideable: !1,
      shouldExitRideable: !0
    })), s.lastKeyE = a, s.lastKeyR = !1;
  }
  resetJumpState() {
    this.isCurrentlyJumping = !1;
  }
}
class pi {
  constructor() {
    j(this, "directionController", new di());
    j(this, "impulseController", new hi());
    j(this, "gravityController", new mi());
    j(this, "stateChecker", new fi());
  }
  calculate(e, t) {
    if (!t || !e.rigidBodyRef.current) return;
    const i = e.rigidBodyRef.current.linvel();
    t.activeState.velocity.set(i.x, i.y, i.z), this.stateChecker.checkAll(e, t);
    const { rigidBodyRef: s, innerGroupRef: a, matchSizes: o } = e, { modeType: c = "character" } = t;
    if (this.directionController.updateDirection(
      t,
      "normal",
      e,
      c === "airplane" ? a : void 0,
      c === "airplane" ? o : void 0
    ), this.impulseController.applyImpulse(s, t), (c === "character" || c === "airplane") && this.gravityController.applyGravity(s, t), (c === "vehicle" || c === "airplane") && this.applyDamping(s, t), s != null && s.current) {
      if (c === "character" && (a != null && a.current)) {
        const {
          gameStates: { isJumping: u, isFalling: l, isNotMoving: d },
          activeState: h,
          characterConfig: { linearDamping: f = 0.2, airDamping: C = 0.1, stopDamping: w = 2 }
        } = t;
        s.current.setLinearDamping(
          u || l ? C : d ? f * w : f
        ), a.current.quaternion.setFromEuler(h.euler);
      }
      s.current.setEnabledRotations(!1, !1, !1, !1);
    }
  }
  applyDamping(e, t) {
    if (!(e != null && e.current) || !t) return;
    const { modeType: i, vehicleConfig: s, airplaneConfig: a } = t;
    let o = 0;
    i === "vehicle" ? o = (s == null ? void 0 : s.linearDamping) || 0.9 : i === "airplane" && (o = (a == null ? void 0 : a.linearDamping) || 0.8), o > 0 && e.current.setLinearDamping(o);
  }
}
class gi {
  constructor(e, t = {}) {
    j(this, "state");
    j(this, "config");
    j(this, "metrics");
    j(this, "type");
    this.type = e, this.state = {
      position: new g.Vector3(),
      velocity: new g.Vector3(),
      rotation: new g.Euler(),
      isGrounded: !1,
      isMoving: !1,
      speed: 0,
      direction: new g.Vector3(),
      lastUpdate: 0
    }, this.config = {
      maxSpeed: 10,
      acceleration: 15,
      deceleration: 10,
      turnSpeed: 8,
      jumpForce: 12,
      gravity: -30,
      linearDamping: 0.95,
      angularDamping: 0.85,
      ...t
    }, this.metrics = {
      currentSpeed: 0,
      averageSpeed: 0,
      totalDistance: 0,
      frameTime: 0,
      physicsTime: 0,
      lastPosition: new g.Vector3(),
      isAccelerating: !1,
      groundContact: !1
    };
  }
  updatePosition(e) {
    this.metrics.lastPosition.copy(this.state.position), this.state.position.copy(e), this.calculateSpeed();
  }
  updateVelocity(e) {
    this.state.velocity.copy(e), this.state.speed = e.length(), this.state.isMoving = this.state.speed > 0.1;
  }
  updateRotation(e) {
    this.state.rotation.copy(e);
  }
  setGrounded(e) {
    this.state.isGrounded = e, this.metrics.groundContact = e;
  }
  applyForce(e, t) {
    const i = t.linvel(), s = new g.Vector3(
      i.x + e.x,
      i.y + e.y,
      i.z + e.z
    );
    t.setLinvel(s, !0);
  }
  calculateMovement(e, t) {
    const i = new g.Vector3(), s = e.shift ? 2 : 1, a = this.config.maxSpeed * s;
    return e.forward && (i.z -= 1), e.backward && (i.z += 1), e.leftward && (i.x -= 1), e.rightward && (i.x += 1), i.length() > 0 && (i.normalize(), i.multiplyScalar(a * t)), i;
  }
  calculateJump() {
    return this.state.isGrounded ? new g.Vector3(0, this.config.jumpForce, 0) : new g.Vector3();
  }
  update(e) {
    this.state.lastUpdate = Date.now(), this.metrics.frameTime = e, this.updateMetrics(e);
  }
  calculateSpeed() {
    const e = this.state.position.distanceTo(this.metrics.lastPosition);
    this.metrics.totalDistance += e, this.metrics.currentSpeed = e / (this.metrics.frameTime || 0.016);
  }
  updateMetrics(e) {
    this.metrics.isAccelerating = this.state.speed > this.metrics.currentSpeed, this.metrics.averageSpeed = this.metrics.totalDistance / (this.state.lastUpdate / 1e3);
  }
  getState() {
    return { ...this.state };
  }
  getMetrics() {
    return { ...this.metrics };
  }
  getConfig() {
    return { ...this.config };
  }
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
  reset() {
    this.state.position.set(0, 0, 0), this.state.velocity.set(0, 0, 0), this.state.rotation.set(0, 0, 0), this.state.speed = 0, this.state.isMoving = !1, this.state.isGrounded = !1, this.metrics.totalDistance = 0, this.metrics.currentSpeed = 0, this.metrics.averageSpeed = 0;
  }
  dispose() {
    this.reset();
  }
}
class Gs {
  constructor() {
    j(this, "engines");
    j(this, "eventListeners");
    j(this, "rigidBodies");
    this.engines = /* @__PURE__ */ new Map(), this.eventListeners = /* @__PURE__ */ new Set(), this.rigidBodies = /* @__PURE__ */ new Map();
  }
  registerEntity(e, t, i) {
    const s = new gi(t);
    this.engines.set(e, s), this.rigidBodies.set(e, i);
  }
  unregisterEntity(e) {
    const t = this.engines.get(e);
    t && (t.dispose(), this.engines.delete(e)), this.rigidBodies.delete(e);
  }
  execute(e, t) {
    var a, o;
    const i = this.engines.get(e), s = this.rigidBodies.get(e);
    if (!(!i || !s)) {
      switch (t.type) {
        case "move":
          (a = t.data) != null && a.movement && i.applyForce(t.data.movement, s);
          break;
        case "jump":
          const c = i.calculateJump();
          c.length() > 0 && i.applyForce(c, s);
          break;
        case "stop":
          const u = s.linvel();
          s.setLinvel({ x: 0, y: u.y, z: 0 }, !0);
          break;
        case "setConfig":
          (o = t.data) != null && o.config && i.updateConfig(t.data.config);
          break;
        case "reset":
          i.reset(), s.setTranslation({ x: 0, y: 0, z: 0 }, !0), s.setLinvel({ x: 0, y: 0, z: 0 }, !0);
          break;
      }
      this.notifyListeners(e);
    }
  }
  updateEntity(e, t) {
    const i = this.engines.get(e), s = this.rigidBodies.get(e);
    if (!i || !s) return;
    const a = new g.Vector3().copy(s.translation()), o = new g.Vector3().copy(s.linvel()), c = new g.Euler().setFromQuaternion(
      new g.Quaternion().copy(s.rotation())
    );
    i.updatePosition(a), i.updateVelocity(o), i.updateRotation(c), i.update(t);
  }
  snapshot(e) {
    const t = this.engines.get(e);
    if (!t) return null;
    const i = t.getState(), s = t.getMetrics(), a = t.getConfig();
    return {
      type: "character",
      position: i.position.clone(),
      velocity: i.velocity.clone(),
      rotation: i.rotation.clone(),
      isGrounded: i.isGrounded,
      isMoving: i.isMoving,
      speed: i.speed,
      metrics: {
        currentSpeed: s.currentSpeed,
        averageSpeed: s.averageSpeed,
        totalDistance: s.totalDistance,
        frameTime: s.frameTime,
        isAccelerating: s.isAccelerating
      },
      config: {
        maxSpeed: a.maxSpeed,
        acceleration: a.acceleration,
        jumpForce: a.jumpForce
      }
    };
  }
  getAllSnapshots() {
    const e = /* @__PURE__ */ new Map();
    return this.engines.forEach((t, i) => {
      const s = this.snapshot(i);
      s && e.set(i, s);
    }), e;
  }
  subscribe(e) {
    return this.eventListeners.add(e), () => this.eventListeners.delete(e);
  }
  notifyListeners(e) {
    const t = this.snapshot(e);
    t && this.eventListeners.forEach((i) => i(t));
  }
  getActiveEntities() {
    return Array.from(this.engines.keys());
  }
  dispose() {
    this.engines.forEach((e) => e.dispose()), this.engines.clear(), this.rigidBodies.clear(), this.eventListeners.clear();
  }
}
const yi = [
  { id: "slow", name: "Slow", maxSpeed: 5, acceleration: 8 },
  { id: "normal", name: "Normal", maxSpeed: 10, acceleration: 15 },
  { id: "fast", name: "Fast", maxSpeed: 20, acceleration: 25 },
  { id: "sprint", name: "Sprint", maxSpeed: 35, acceleration: 40 }
], xi = [
  { id: "eco", name: "Eco", maxSpeed: 15, acceleration: 10 },
  { id: "comfort", name: "Comfort", maxSpeed: 25, acceleration: 20 },
  { id: "sport", name: "Sport", maxSpeed: 40, acceleration: 35 },
  { id: "turbo", name: "Turbo", maxSpeed: 60, acceleration: 50 }
];
function gt() {
  const { mode: n, motion: e, setCurrentPreset: t, setMotionType: i } = S(), s = (e == null ? void 0 : e.motionType) || (n == null ? void 0 : n.type) || "character", a = (e == null ? void 0 : e.currentPreset) || "normal", o = s === "vehicle" ? xi : yi, c = (l) => {
    t(l);
  }, u = (l) => {
    const d = l.target.value;
    i(d), t(d === "vehicle" ? "comfort" : "normal");
  };
  return /* @__PURE__ */ r.jsxs("div", { className: "mc-panel", children: [
    /* @__PURE__ */ r.jsxs("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ r.jsx("label", { htmlFor: "motion-type-select", className: "mc-label", children: "Motion Type" }),
      /* @__PURE__ */ r.jsxs(
        "select",
        {
          id: "motion-type-select",
          className: "mc-select",
          value: s,
          onChange: u,
          children: [
            /* @__PURE__ */ r.jsx("option", { value: "character", children: "Character" }),
            /* @__PURE__ */ r.jsx("option", { value: "vehicle", children: "Vehicle" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ r.jsxs("div", { className: "mc-setting-row", children: [
      /* @__PURE__ */ r.jsx("label", { className: "mc-label", children: "Presets" }),
      /* @__PURE__ */ r.jsx("div", { className: "mc-presets-grid", children: o.map((l) => /* @__PURE__ */ r.jsx(
        "button",
        {
          className: `mc-preset-btn ${l.id === a ? "active" : ""}`,
          onClick: () => c(l.id),
          title: `Max Speed: ${l.maxSpeed}, Accel: ${l.acceleration}`,
          children: l.name
        },
        l.id
      )) })
    ] })
  ] });
}
const bi = [
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
function yt() {
  const { motion: n, metrics: e, config: t } = S(), i = (a, o, c = 2) => {
    if (o == null) return "N/A";
    switch (a.type) {
      case "vector3":
        return o.x !== void 0 ? `X:${o.x.toFixed(c)} Y:${o.y.toFixed(c)} Z:${o.z.toFixed(c)}` : String(o);
      case "boolean":
        return typeof o == "boolean" ? o ? "Yes" : "No" : String(o);
      case "number":
        return typeof o == "number" ? o.toFixed(c) : String(o);
      default:
        return String(o);
    }
  }, s = (a) => {
    switch (a.key) {
      case "motionType":
        return (n == null ? void 0 : n.type) || "character";
      case "position":
        return (n == null ? void 0 : n.position) || { x: 0, y: 0, z: 0 };
      case "velocity":
        return (n == null ? void 0 : n.velocity) || { x: 0, y: 0, z: 0 };
      case "speed":
        return (n == null ? void 0 : n.speed) || 0;
      case "isGrounded":
        return n == null ? void 0 : n.grounded;
      case "isMoving":
        return n != null && n.velocity ? Math.abs(n.velocity.x) + Math.abs(n.velocity.z) > 0.1 : !1;
      default:
        return e[a.key] || t[a.key] || "N/A";
    }
  };
  return /* @__PURE__ */ r.jsx("div", { className: "md-panel", children: /* @__PURE__ */ r.jsx("div", { className: "md-content", children: bi.map((a) => /* @__PURE__ */ r.jsxs("div", { className: "md-item", children: [
    /* @__PURE__ */ r.jsx("span", { className: "md-label", children: a.label }),
    /* @__PURE__ */ r.jsx("span", { className: "md-value", children: i(a, s(a)) })
  ] }, a.key)) }) });
}
function Fs({
  showController: n = !0,
  showDebugPanel: e = !0,
  controllerProps: t = {},
  debugPanelProps: i = {}
}) {
  return /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
    n && /* @__PURE__ */ r.jsx(
      gt,
      {
        position: "bottom-left",
        showLabels: !0,
        compact: !1,
        ...t
      }
    ),
    e && /* @__PURE__ */ r.jsx(
      yt,
      {
        position: "top-right",
        updateInterval: 100,
        precision: 2,
        compact: !1,
        ...i
      }
    )
  ] });
}
function _s({ text: n, position: e, teleportStyle: t }) {
  const { teleport: i, canTeleport: s } = kn(), a = () => {
    i(e) || console.warn("이동에 실패했습니다.");
  };
  return /* @__PURE__ */ r.jsxs(
    "div",
    {
      className: `teleport ${s ? "" : "teleport--disabled"}`,
      onClick: a,
      style: t,
      title: s ? "Click to teleport" : "Teleport not available",
      children: [
        n || "Teleport",
        !s && /* @__PURE__ */ r.jsx("span", { className: "teleport__cooldown", children: "⏱️" })
      ]
    }
  );
}
function Oe({ nodes: n, color: e, skeleton: t, url: i }) {
  const s = V(() => Object.keys(n).map((a, o) => {
    const c = n[a];
    return c instanceof g.SkinnedMesh ? {
      type: "skinnedMesh",
      material: Array.isArray(c.material) ? c.material.map((l) => {
        const d = l.clone();
        return e && "color" in d && d.color instanceof g.Color && d.color.set(e), d;
      }) : (() => {
        const l = c.material.clone();
        return e && "color" in l && l.color instanceof g.Color && l.color.set(e), l;
      })(),
      geometry: c.geometry,
      skeleton: t || c.skeleton,
      key: `${i}-${a}-${o}`
    } : c instanceof g.Mesh ? {
      type: "mesh",
      material: Array.isArray(c.material) ? c.material.map((l) => {
        const d = l.clone();
        return e && "color" in d && d.color instanceof g.Color && d.color.set(e), d;
      }) : (() => {
        const l = c.material.clone();
        return e && "color" in l && l.color instanceof g.Color && l.color.set(e), l;
      })(),
      geometry: c.geometry,
      key: `${i}-${a}-${o}`
    } : null;
  }).filter(Boolean), [n, e, t, i]);
  return /* @__PURE__ */ r.jsx(r.Fragment, { children: s.map((a) => a ? a.type === "skinnedMesh" ? /* @__PURE__ */ r.jsx(
    "skinnedMesh",
    {
      castShadow: !0,
      receiveShadow: !0,
      material: a.material,
      geometry: a.geometry,
      skeleton: a.skeleton
    },
    a.key
  ) : /* @__PURE__ */ r.jsx(
    "mesh",
    {
      castShadow: !0,
      receiveShadow: !0,
      material: a.material,
      geometry: a.geometry
    },
    a.key
  ) : null) });
}
function vi({ url: n, isActive: e, color: t, skeleton: i }) {
  const { scene: s, animations: a } = de(n), { actions: o } = he(a), c = V(() => Re.clone(s), [s]), { nodes: u } = Ne(c);
  return fe(o), /* @__PURE__ */ r.jsx("group", { children: /* @__PURE__ */ r.jsx(Oe, { nodes: u, color: t, skeleton: i, url: n }) });
}
function wi({
  url: n,
  children: e,
  offset: t = new g.Vector3(0, 0, 0)
}) {
  const { gltf: i } = lt({ url: n }), { animations: s, scene: a } = i, { actions: o, ref: c } = he(s), u = V(() => Re.clone(a), [a]), { nodes: l } = Ne(u), d = Object.values(l).find(
    (h) => h.type === "Object3D"
  );
  return fe(o), /* @__PURE__ */ r.jsxs("group", { position: t, children: [
    d && /* @__PURE__ */ r.jsx(
      "primitive",
      {
        object: d,
        visible: !1,
        receiveShadow: !0,
        castShadow: !0,
        ref: c
      }
    ),
    /* @__PURE__ */ r.jsx(Oe, { nodes: l, url: n }),
    e
  ] });
}
const Si = st((n, e) => (N(() => () => {
  n.objectNode && n.objectNode.traverse((t) => {
    var i;
    t instanceof g.Mesh && ((i = t.geometry) == null || i.dispose(), t.material && (Array.isArray(t.material) ? t.material.forEach((s) => s.dispose()) : t.material.dispose()));
  });
}, [n.objectNode]), /* @__PURE__ */ r.jsxs("group", { receiveShadow: !0, castShadow: !0, ref: e, userData: { intangible: !0 }, children: [
  n.isRiderOn && n.enableRiding && n.isActive && n.ridingUrl && /* @__PURE__ */ r.jsx(wi, { url: n.ridingUrl, offset: n.offset }),
  n.children,
  n.objectNode && n.animationRef && /* @__PURE__ */ r.jsx(
    "primitive",
    {
      object: n.objectNode,
      visible: !1,
      receiveShadow: !0,
      castShadow: !0,
      ref: n.animationRef
    }
  ),
  /* @__PURE__ */ r.jsx(Oe, { nodes: n.nodes, skeleton: n.skeleton, url: n.url || "" })
] })));
function ji() {
  return ({ groundRay: n, length: e, colliderRef: t }) => {
    if (!t.current || !n || !n.origin || !n.dir) return;
    const i = new g.Raycaster();
    i.set(n.origin, n.dir), i.far = e, i.intersectObjects([], !0).length > 0 && t.current.setActiveEvents(1);
  };
}
function Ci({
  url: n,
  active: e = !1
}) {
  const { animations: t } = de(n), { actions: i } = he(t);
  return fe(e), null;
}
const Mi = st(
  (n, e) => {
    const { size: t } = lt({ url: n.url || "" }), i = ji(), { scene: s, animations: a } = de(n.url), { actions: o, ref: c } = he(a), u = V(() => Re.clone(s), [s]), l = V(() => {
      let b = null;
      return u.traverse((M) => {
        M instanceof g.SkinnedMesh && (b = M.skeleton);
      }), b;
    }, [u]), d = S((b) => b.mode);
    N(() => {
      o && (d != null && d.type) && n.isActive && ct().registerAnimations(d.type, o);
    }, [o, d == null ? void 0 : d.type, n.isActive]);
    const h = V(() => !n.parts || n.parts.length === 0 ? null : n.parts.map(({ url: b, color: M }, I) => b ? /* @__PURE__ */ r.jsx(
      vi,
      {
        url: b,
        isActive: !0,
        componentType: n.componentType,
        currentAnimation: n.currentAnimation,
        color: M,
        skeleton: l
      },
      `${n.componentType}-${b}-${M || "default"}-${I}`
    ) : null).filter(Boolean), [n.parts, n.componentType, n.currentAnimation, l]);
    N(() => () => {
      u && u.traverse((b) => {
        if (b instanceof g.Mesh) {
          if (b.geometry.dispose(), Array.isArray(b.material))
            b.material.forEach((M) => {
              Object.keys(M).forEach((I) => {
                const k = M[I];
                k != null && k.isTexture && k.dispose();
              }), M.dispose();
            });
          else if (b.material) {
            const M = b.material;
            Object.keys(M).forEach((I) => {
              var k;
              (k = M[I]) != null && k.isTexture && M[I].dispose();
            }), M.dispose();
          }
        }
      }), l && l.dispose(), o && Object.values(o).forEach((b) => {
        b && (b.stop(), b.getMixer().uncacheAction(b.getClip()));
      });
    }, [u, l, o]), N(() => {
      n.groundRay && n.colliderRef && i({
        groundRay: n.groundRay,
        length: 2,
        colliderRef: n.colliderRef
      });
    }, [n.groundRay, n.colliderRef, i]), n.isActive && Ri({
      outerGroupRef: n.outerGroupRef,
      innerGroupRef: n.innerGroupRef,
      rigidBodyRef: e,
      colliderRef: n.colliderRef,
      groundRay: n.groundRay
    });
    const f = S((b) => b.states.isRiding);
    fe(n.isActive && !f), N(() => {
      !n.isActive && o && o.idle && o.idle.reset().play();
    }, [o, n.isActive]), n.onReady && n.onReady(), n.onFrame && n.onFrame(), n.onAnimate && o && n.onAnimate();
    const { nodes: C } = Ne(u), w = Object.values(C).find((b) => b.type === "Object3D"), x = n.rotation instanceof g.Euler ? n.rotation.y : 0, m = async (b) => {
      var M;
      n.onIntersectionEnter && await n.onIntersectionEnter(b), (M = n.userData) != null && M.onNear && await n.userData.onNear(b, n.userData);
    }, y = async (b) => {
      var M;
      n.onIntersectionExit && await n.onIntersectionExit(b), (M = n.userData) != null && M.onLeave && await n.userData.onLeave(b);
    }, p = async (b) => {
      var M;
      n.onCollisionEnter && await n.onCollisionEnter(b), (M = n.userData) != null && M.onNear && await n.userData.onNear(b, n.userData);
    };
    return /* @__PURE__ */ r.jsxs("group", { ref: n.outerGroupRef, userData: { intangible: !0 }, children: [
      n.isActive && /* @__PURE__ */ r.jsx(qn, {}),
      n.ridingUrl && d.type !== "character" && /* @__PURE__ */ r.jsx(Ci, { url: n.ridingUrl, active: f }),
      /* @__PURE__ */ r.jsxs(
        Ct,
        {
          canSleep: !1,
          ccd: !0,
          colliders: !1,
          ref: e,
          name: n.name || (n.isActive ? "character" : n.componentType),
          position: n.position,
          rotation: at().set(0, x, 0),
          userData: n.userData,
          type: n.rigidbodyType || (n.isActive ? "dynamic" : "fixed"),
          sensor: n.sensor,
          onIntersectionEnter: m,
          onIntersectionExit: y,
          onCollisionEnter: p,
          ...n.rigidBodyProps,
          children: [
            !n.isNotColliding && /* @__PURE__ */ r.jsx(
              Mt,
              {
                ref: n.colliderRef,
                args: [(t.y / 2 - t.x) * 1.2, t.x * 1.2],
                position: [0, t.x * 1.2, 0]
              }
            ),
            /* @__PURE__ */ r.jsxs(
              Si,
              {
                objectNode: w,
                animationRef: c,
                nodes: C,
                ref: n.innerGroupRef,
                isActive: n.isActive,
                isRiderOn: n.isRiderOn,
                enableRiding: n.enableRiding,
                ridingUrl: n.ridingUrl,
                offset: n.offset,
                parts: n.parts,
                children: [
                  n.children,
                  h
                ]
              }
            )
          ]
        }
      )
    ] });
  }
);
function ki() {
  const n = T(null), e = T(null), t = T(null), i = T(null);
  return {
    outerGroupRef: n,
    innerGroupRef: e,
    rigidBodyRef: t,
    colliderRef: i
  };
}
function Ei({ props: n, children: e }) {
  const t = S((x) => x.mode), i = S((x) => x.states), s = S((x) => x.rideable), a = S((x) => x.urls), o = S((x) => x.setRefs), c = ki(), u = T(!1);
  if (N(() => {
    o && !u.current && (o({
      rigidBodyRef: c.rigidBodyRef,
      colliderRef: c.colliderRef,
      outerGroupRef: c.outerGroupRef,
      innerGroupRef: c.innerGroupRef
    }), u.current = !0);
  }, [o, c]), !t || !i || !s || !a) return null;
  const { enableRiding: l, isRiderOn: d, rideableId: h } = i, f = V(
    () => h && s[h] ? s[h].offset : ce(),
    [h, s]
  ), w = (() => {
    const x = {
      isActive: !0,
      componentType: t.type,
      controllerOptions: n.controllerOptions,
      enableRiding: l,
      isRiderOn: d,
      groundRay: n.groundRay,
      offset: f,
      children: e,
      ref: c.rigidBodyRef,
      outerGroupRef: c.outerGroupRef,
      innerGroupRef: c.innerGroupRef,
      colliderRef: c.colliderRef,
      onAnimate: n.onAnimate || (() => {
      }),
      onFrame: n.onFrame || (() => {
      }),
      onReady: n.onReady || (() => {
      }),
      onDestory: n.onDestory || (() => {
      }),
      rigidBodyProps: n.rigidBodyProps,
      parts: (n.parts || []).filter((y) => !!y.url).map((y) => ({ ...y, url: y.url }))
    }, m = d && t.type !== "character" ? { ridingUrl: a.ridingUrl } : { ridingUrl: void 0 };
    switch (t.type) {
      case "character":
        return {
          ...x,
          url: a.characterUrl || ""
        };
      case "vehicle":
        return {
          ...x,
          ...m,
          url: a.vehicleUrl || "",
          wheelUrl: a.wheelUrl
        };
      case "airplane":
        return {
          ...x,
          ...m,
          url: a.airplaneUrl || ""
        };
      default:
        return {
          ...x,
          url: a.characterUrl || ""
        };
    }
  })();
  return /* @__PURE__ */ r.jsx(Mi, { ...w, groundRay: n.groundRay });
}
function Ai({ props: n }) {
  return /* @__PURE__ */ r.jsx(Ei, { props: n, children: n.children });
}
const Ni = (n, e) => {
  [
    "forward",
    "backward",
    "leftward",
    "rightward",
    "shift",
    "space",
    "keyE",
    "keyR"
  ].forEach((s) => {
    n.keyboard[s] !== e.keyboard[s] && (n.keyboard[s] = e.keyboard[s]);
  }), n.mouse.target.equals(e.mouse.target) || n.mouse.target.copy(e.mouse.target), [
    "angle",
    "isActive",
    "shouldRun"
  ].forEach((s) => {
    n.mouse[s] !== e.mouse[s] && (n.mouse[s] = e.mouse[s]);
  });
}, Ri = (n) => {
  const e = ui(), t = T(null), i = T(new pi()), s = T(!1);
  N(() => {
    !s.current && e.worldContext && (s.current = !0);
  }, [e.worldContext]), N(() => {
    const o = (c) => {
      try {
        const { position: u } = c.detail;
        n.rigidBodyRef.current && u && (n.rigidBodyRef.current.setTranslation(
          {
            x: u.x,
            y: u.y,
            z: u.z
          },
          !0
        ), n.rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, !0), n.rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, !0));
      } catch (u) {
        console.error("Teleport error:", u);
      }
    };
    return window.addEventListener("gaesup:teleport", o), document.addEventListener("teleport-request", o), () => {
      window.removeEventListener("gaesup:teleport", o), document.removeEventListener("teleport-request", o);
    };
  }, [n.rigidBodyRef]);
  const a = E(
    (o, c) => {
      var u, l, d;
      try {
        if (!e.worldContext || !e.input) return;
        if (t.current)
          Ni(t.current, e.input), t.current && (t.current.gameStates = e.worldContext.states);
        else {
          const f = ((l = (u = e.worldContext) == null ? void 0 : u.mode) == null ? void 0 : l.type) || "character";
          t.current = {
            activeState: e.activeState,
            gameStates: e.worldContext.states,
            keyboard: { ...e.input.keyboard },
            mouse: {
              target: e.input.mouse.target.clone(),
              angle: e.input.mouse.angle,
              isActive: e.input.mouse.isActive,
              shouldRun: e.input.mouse.shouldRun
            },
            characterConfig: e.worldContext.character || {},
            vehicleConfig: e.worldContext.vehicle || {},
            airplaneConfig: e.worldContext.airplane || {},
            automation: e.worldContext.automation || {},
            modeType: f
          }, (d = n.rigidBodyRef) != null && d.current && e.activeState && (n.rigidBodyRef.current.lockRotations(!1, !0), e.activeState.euler.set(0, 0, 0), n.rigidBodyRef.current.setTranslation(
            {
              x: e.activeState.position.x,
              y: e.activeState.position.y + 5,
              z: e.activeState.position.z
            },
            !0
          ));
        }
        const h = {
          ...n,
          state: o,
          delta: c,
          worldContext: e.worldContext,
          dispatch: e.dispatch,
          matchSizes: e.getSizesByUrls(),
          inputRef: { current: e.input },
          setKeyboardInput: e.setKeyboardInput,
          setMouseInput: e.setMouseInput
        };
        i.current.calculate(h, t.current);
      } catch (h) {
        console.error("Physics execution error:", h);
      }
    },
    [e, n]
  );
  ne((o, c) => {
    var u, l, d, h;
    if (!(!e.isReady || !s.current)) {
      if (e.blockControl) {
        (l = (u = n.rigidBodyRef) == null ? void 0 : u.current) == null || l.resetForces(!1), (h = (d = n.rigidBodyRef) == null ? void 0 : d.current) == null || h.resetTorques(!1);
        return;
      }
      a(o, c);
    }
  });
};
class Ii {
  constructor() {
    j(this, "state");
    j(this, "config");
    j(this, "metrics");
    j(this, "eventCallbacks");
    this.state = this.createDefaultState(), this.config = this.createDefaultConfig(), this.metrics = this.createDefaultMetrics(), this.eventCallbacks = /* @__PURE__ */ new Map();
  }
  createDefaultState() {
    return {
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
        target: new g.Vector3(),
        angle: 0,
        isActive: !1,
        shouldRun: !1,
        buttons: { left: !1, right: !1, middle: !1 },
        wheel: 0,
        position: new g.Vector2()
      },
      gamepad: {
        connected: !1,
        leftStick: new g.Vector2(),
        rightStick: new g.Vector2(),
        triggers: { left: 0, right: 0 },
        buttons: {},
        vibration: { weak: 0, strong: 0 }
      },
      touch: {
        touches: [],
        gestures: {
          pinch: 1,
          rotation: 0,
          pan: new g.Vector2()
        }
      },
      lastUpdate: 0,
      isActive: !0
    };
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
  createDefaultMetrics() {
    return {
      inputLatency: 0,
      frameTime: 0,
      eventCount: 0,
      activeInputs: [],
      performanceScore: 100
    };
  }
  updateKeyboard(e) {
    Object.assign(this.state.keyboard, e), this.updateMetrics();
  }
  updateMouse(e) {
    Object.assign(this.state.mouse, e), this.updateMetrics();
  }
  updateGamepad(e) {
    Object.assign(this.state.gamepad, e), this.updateMetrics();
  }
  updateTouch(e) {
    Object.assign(this.state.touch, e), this.updateMetrics();
  }
  setConfig(e) {
    Object.assign(this.config, e);
  }
  getState() {
    return { ...this.state };
  }
  getConfig() {
    return { ...this.config };
  }
  getMetrics() {
    return { ...this.metrics };
  }
  addEventListener(e, t) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(t);
  }
  removeEventListener(e, t) {
    const i = this.eventCallbacks.get(e);
    if (i) {
      const s = i.indexOf(t);
      s > -1 && i.splice(s, 1);
    }
  }
  updateMetrics() {
    this.metrics.eventCount++, this.metrics.lastUpdate = Date.now(), this.metrics.activeInputs = this.getActiveInputs();
  }
  getActiveInputs() {
    const e = [];
    return Object.entries(this.state.keyboard).forEach(([t, i]) => {
      i && e.push(`keyboard:${t}`);
    }), Object.entries(this.state.mouse.buttons).forEach(([t, i]) => {
      i && e.push(`mouse:${t}`);
    }), this.state.gamepad.connected && e.push("gamepad:connected"), this.state.touch.touches.length > 0 && e.push(`touch:${this.state.touch.touches.length}`), e;
  }
  reset() {
    this.state = this.createDefaultState(), this.metrics = this.createDefaultMetrics(), this.eventCallbacks.clear();
  }
  dispose() {
    this.reset();
  }
}
class Ti {
  constructor() {
    j(this, "state");
    j(this, "config");
    j(this, "metrics");
    j(this, "executionTimer");
    j(this, "eventCallbacks");
    this.state = this.createDefaultState(), this.config = this.createDefaultConfig(), this.metrics = this.createDefaultMetrics(), this.executionTimer = null, this.eventCallbacks = /* @__PURE__ */ new Map();
  }
  createDefaultState() {
    return {
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
    };
  }
  createDefaultConfig() {
    return {
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
    };
  }
  createDefaultMetrics() {
    return {
      queueLength: 0,
      executionTime: 0,
      performance: 100,
      memoryUsage: 0,
      errorRate: 0
    };
  }
  addAction(e) {
    const t = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, i = {
      ...e,
      id: t,
      timestamp: Date.now()
    };
    return this.state.queue.actions.push(i), this.updateMetrics(), this.emit("actionAdded", i), this.state.settings.autoStart && !this.state.queue.isRunning && this.start(), t;
  }
  removeAction(e) {
    const t = this.state.queue.actions.findIndex((i) => i.id === e);
    return t > -1 ? (this.state.queue.actions.splice(t, 1), this.updateMetrics(), this.emit("actionRemoved", e), !0) : !1;
  }
  clearQueue() {
    this.state.queue.actions = [], this.state.queue.currentIndex = 0, this.updateMetrics(), this.emit("queueCleared");
  }
  start() {
    this.state.queue.actions.length !== 0 && (this.state.queue.isRunning = !0, this.state.queue.isPaused = !1, this.emit("automationStarted"), this.executeNext());
  }
  pause() {
    this.state.queue.isPaused = !0, this.executionTimer && (clearTimeout(this.executionTimer), this.executionTimer = null), this.emit("automationPaused");
  }
  resume() {
    this.state.queue.isPaused && (this.state.queue.isPaused = !1, this.emit("automationResumed"), this.executeNext());
  }
  stop() {
    this.state.queue.isRunning = !1, this.state.queue.isPaused = !1, this.state.currentAction = null, this.executionTimer && (clearTimeout(this.executionTimer), this.executionTimer = null), this.emit("automationStopped");
  }
  async executeNext() {
    if (!this.state.queue.isRunning || this.state.queue.isPaused) return;
    if (this.state.queue.currentIndex >= this.state.queue.actions.length)
      if (this.state.queue.loop)
        this.state.queue.currentIndex = 0;
      else {
        this.stop(), this.emit("automationCompleted");
        return;
      }
    const e = this.state.queue.actions[this.state.queue.currentIndex];
    if (e) {
      this.state.currentAction = e, this.emit("actionStarted", e);
      try {
        await this.executeAction(e), this.state.executionStats.totalExecuted++, this.state.queue.currentIndex++, this.emit("actionCompleted", e);
        const t = e.delay || this.state.settings.throttle;
        this.executionTimer = window.setTimeout(() => this.executeNext(), t);
      } catch (t) {
        this.handleExecutionError(e, t);
      }
    }
  }
  async executeAction(e) {
    e.beforeCallback && e.beforeCallback();
    const t = Date.now();
    switch (e.type) {
      case "move":
        e.target && this.emit("moveRequested", e.target);
        break;
      case "click":
        e.target && this.emit("clickRequested", e.target);
        break;
      case "wait":
        await new Promise((s) => setTimeout(s, e.duration || 1e3));
        break;
      case "key":
        e.key && this.emit("keyRequested", e.key);
        break;
      case "custom":
        this.emit("customActionRequested", e.data);
        break;
    }
    const i = Date.now() - t;
    this.updateExecutionStats(i), e.afterCallback && e.afterCallback();
  }
  handleExecutionError(e, t) {
    var s;
    this.state.executionStats.errors.push(`${e.id}: ${t.message}`), this.emit("actionError", { action: e, error: t });
    const i = ((s = e.data) == null ? void 0 : s.retryCount) || 0;
    i < this.state.queue.maxRetries ? (e.data = { ...e.data, retryCount: i + 1 }, this.executionTimer = window.setTimeout(() => this.executeNext(), this.config.retryDelay)) : (this.state.queue.currentIndex++, this.executionTimer = window.setTimeout(() => this.executeNext(), this.state.settings.throttle));
  }
  updateExecutionStats(e) {
    const t = this.state.executionStats;
    t.averageTime = (t.averageTime * t.totalExecuted + e) / (t.totalExecuted + 1);
  }
  updateMetrics() {
    this.metrics.queueLength = this.state.queue.actions.length, this.metrics.errorRate = this.state.executionStats.errors.length / Math.max(this.state.executionStats.totalExecuted, 1) * 100;
  }
  emit(e, t) {
    const i = this.eventCallbacks.get(e);
    i && i.forEach((s) => s(t));
  }
  addEventListener(e, t) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(t);
  }
  removeEventListener(e, t) {
    const i = this.eventCallbacks.get(e);
    if (i) {
      const s = i.indexOf(t);
      s > -1 && i.splice(s, 1);
    }
  }
  getState() {
    return { ...this.state };
  }
  getConfig() {
    return { ...this.config };
  }
  getMetrics() {
    return { ...this.metrics };
  }
  setConfig(e) {
    Object.assign(this.config, e);
  }
  updateSettings(e) {
    Object.assign(this.state.settings, e);
  }
  reset() {
    this.stop(), this.clearQueue(), this.state = this.createDefaultState(), this.metrics = this.createDefaultMetrics();
  }
  dispose() {
    this.stop(), this.eventCallbacks.clear();
  }
}
class Us {
  constructor() {
    j(this, "interactionEngine");
    j(this, "automationEngine");
    j(this, "state");
    j(this, "eventSubscribers");
    j(this, "eventQueue");
    j(this, "syncInterval");
    this.interactionEngine = new Ii(), this.automationEngine = new Ti(), this.state = {
      isActive: !0,
      lastCommand: null,
      commandHistory: [],
      syncStatus: "idle"
    }, this.eventSubscribers = /* @__PURE__ */ new Map(), this.eventQueue = [], this.syncInterval = null, this.setupEngineListeners(), this.startSync();
  }
  setupEngineListeners() {
    this.automationEngine.addEventListener("moveRequested", (e) => {
      this.executeCommand({
        type: "input",
        action: "moveTo",
        data: { target: e }
      });
    }), this.automationEngine.addEventListener("clickRequested", (e) => {
      this.executeCommand({
        type: "input",
        action: "clickAt",
        data: { target: e }
      });
    }), this.automationEngine.addEventListener("keyRequested", (e) => {
      this.executeCommand({
        type: "input",
        action: "keyPress",
        data: { key: e }
      });
    });
  }
  executeCommand(e) {
    const t = {
      ...e,
      timestamp: Date.now()
    };
    switch (this.state.lastCommand = t, this.state.commandHistory.push(t), this.emitEvent({
      type: "sync",
      event: "commandExecuted",
      data: t,
      timestamp: Date.now()
    }), e.type) {
      case "input":
        this.handleInputCommand(e);
        break;
      case "automation":
        this.handleAutomationCommand(e);
        break;
    }
  }
  handleInputCommand(e) {
    const { action: t, data: i } = e;
    switch (t) {
      case "updateKeyboard":
        this.interactionEngine.updateKeyboard(i);
        break;
      case "updateMouse":
        this.interactionEngine.updateMouse(i);
        break;
      case "updateGamepad":
        this.interactionEngine.updateGamepad(i);
        break;
      case "updateTouch":
        this.interactionEngine.updateTouch(i);
        break;
      case "setConfig":
        this.interactionEngine.setConfig(i);
        break;
      case "moveTo":
        this.emitEvent({
          type: "input",
          event: "moveToRequested",
          data: i,
          timestamp: Date.now()
        });
        break;
      case "clickAt":
        this.emitEvent({
          type: "input",
          event: "clickAtRequested",
          data: i,
          timestamp: Date.now()
        });
        break;
      case "keyPress":
        this.emitEvent({
          type: "input",
          event: "keyPressRequested",
          data: i,
          timestamp: Date.now()
        });
        break;
    }
  }
  handleAutomationCommand(e) {
    const { action: t, data: i } = e;
    switch (t) {
      case "addAction":
        this.automationEngine.addAction(i);
        break;
      case "removeAction":
        this.automationEngine.removeAction(i);
        break;
      case "start":
        this.automationEngine.start();
        break;
      case "pause":
        this.automationEngine.pause();
        break;
      case "resume":
        this.automationEngine.resume();
        break;
      case "stop":
        this.automationEngine.stop();
        break;
      case "clearQueue":
        this.automationEngine.clearQueue();
        break;
      case "updateSettings":
        this.automationEngine.updateSettings(i);
        break;
    }
  }
  snapshot() {
    return {
      interaction: {
        state: this.interactionEngine.getState(),
        config: this.interactionEngine.getConfig(),
        metrics: this.interactionEngine.getMetrics()
      },
      automation: {
        state: this.automationEngine.getState(),
        config: this.automationEngine.getConfig(),
        metrics: this.automationEngine.getMetrics()
      },
      bridge: { ...this.state }
    };
  }
  subscribe(e, t) {
    this.eventSubscribers.has(e) || this.eventSubscribers.set(e, []), this.eventSubscribers.get(e).push(t);
  }
  unsubscribe(e, t) {
    const i = this.eventSubscribers.get(e);
    if (i) {
      const s = i.indexOf(t);
      s > -1 && i.splice(s, 1);
    }
  }
  emitEvent(e) {
    this.eventQueue.push(e);
    const t = this.eventSubscribers.get(e.event);
    t && t.forEach((s) => s(e));
    const i = this.eventSubscribers.get("*");
    i && i.forEach((s) => s(e));
  }
  startSync() {
    this.syncInterval = window.setInterval(() => {
      this.state.syncStatus = "syncing", this.processEventQueue(), this.updateMetrics(), this.state.syncStatus = "idle";
    }, 16);
  }
  processEventQueue() {
    const t = this.eventQueue.splice(0, 10);
    t.length > 0 && this.emitEvent({
      type: "sync",
      event: "batchProcessed",
      data: { count: t.length },
      timestamp: Date.now()
    });
  }
  updateMetrics() {
    const e = this.interactionEngine.getMetrics(), t = this.automationEngine.getMetrics();
    this.emitEvent({
      type: "sync",
      event: "metricsUpdated",
      data: {
        interaction: e,
        automation: t
      },
      timestamp: Date.now()
    });
  }
  getInteractionEngine() {
    return this.interactionEngine;
  }
  getAutomationEngine() {
    return this.automationEngine;
  }
  reset() {
    this.interactionEngine.reset(), this.automationEngine.reset(), this.state.commandHistory = [], this.state.lastCommand = null, this.eventQueue = [];
  }
  dispose() {
    this.syncInterval && (clearInterval(this.syncInterval), this.syncInterval = null), this.interactionEngine.dispose(), this.automationEngine.dispose(), this.eventSubscribers.clear(), this.eventQueue = [];
  }
}
function Oi({ value: n, name: e, gamePadButtonStyle: t }) {
  const [i, s] = R(!1), { pushKey: a } = Te(), o = () => {
    a(n, !0), s(!0);
  }, c = () => {
    a(n, !1), s(!1);
  };
  return /* @__PURE__ */ r.jsx(
    "button",
    {
      className: `pad-button ${i ? "is-clicked" : ""}`,
      onMouseDown: o,
      onMouseUp: c,
      onMouseLeave: c,
      onContextMenu: (u) => {
        u.preventDefault(), c();
      },
      onPointerDown: o,
      onPointerUp: c,
      style: t,
      children: e
    }
  );
}
const Bs = {
  on: !0
};
function qs(n) {
  var c;
  const { gamePadStyle: e, gamePadButtonStyle: t, label: i } = n, s = S((u) => {
    var l;
    return (l = u.interaction) == null ? void 0 : l.keyboard;
  }), { mode: a } = S();
  Te();
  const o = Object.keys(s || {}).map((u) => {
    const l = (i == null ? void 0 : i[u]) || u;
    return u === "forward" || u === "backward" || u === "leftward" || u === "rightward" ? {
      key: u,
      name: l,
      type: "direction",
      active: (s == null ? void 0 : s[u]) || !1
    } : {
      key: u,
      name: l,
      type: "action",
      active: (s == null ? void 0 : s[u]) || !1
    };
  }).filter(Boolean);
  return /* @__PURE__ */ r.jsx(
    "div",
    {
      className: "gamepad-container",
      style: {
        ...e,
        display: (c = a == null ? void 0 : a.gamepad) != null && c.on ? "flex" : "none"
      },
      children: o.map((u) => /* @__PURE__ */ r.jsx(
        Oi,
        {
          name: u.name,
          type: u.type,
          active: u.active,
          style: t
        },
        u.key
      ))
    }
  );
}
const Di = rt(() => /* @__PURE__ */ r.jsxs("group", { children: [
  /* @__PURE__ */ r.jsxs("mesh", { children: [
    /* @__PURE__ */ r.jsx("sphereGeometry", { args: [0.2, 16, 16] }),
    /* @__PURE__ */ r.jsx(
      "meshStandardMaterial",
      {
        color: "#00ff88",
        emissive: "#00ff88",
        emissiveIntensity: 0.5,
        transparent: !0,
        opacity: 0.9
      }
    )
  ] }),
  /* @__PURE__ */ r.jsxs("mesh", { rotation: [Math.PI / 2, 0, 0], children: [
    /* @__PURE__ */ r.jsx("ringGeometry", { args: [0.3, 0.5, 8] }),
    /* @__PURE__ */ r.jsx(
      "meshStandardMaterial",
      {
        color: "#00ff88",
        transparent: !0,
        opacity: 0.6,
        side: g.DoubleSide
      }
    )
  ] })
] })), Pi = rt(({ points: n, color: e }) => n.length < 2 ? null : /* @__PURE__ */ r.jsx(
  Et,
  {
    points: n,
    color: e,
    lineWidth: 2,
    dashed: !1
  }
));
function Hs() {
  var l;
  const n = S((d) => d.interaction), e = S((d) => d.automation), t = ((l = n == null ? void 0 : n.mouse) == null ? void 0 : l.position) || new g.Vector2(), i = (e == null ? void 0 : e.queue) || { actions: [], currentIndex: 0 }, s = i.actions || [], a = i.currentIndex || 0, o = new g.Vector3(t.x, 0.5, t.y), c = s.map((d) => d.type === "move" && d.target ? new g.Vector3(d.target.x, d.target.y, d.target.z) : o).filter(Boolean), u = [o, ...c];
  return /* @__PURE__ */ r.jsxs("group", { children: [
    /* @__PURE__ */ r.jsx("group", { position: [t.x, 0.5, t.y], children: /* @__PURE__ */ r.jsx(Di, {}) }),
    u.length > 1 && /* @__PURE__ */ r.jsx(
      Pi,
      {
        points: u,
        color: a >= 0 ? "#00ff88" : "#ffaa00"
      }
    ),
    s.map((d, h) => {
      if (d.type === "move" && d.target) {
        const f = h === a, C = h < a;
        return /* @__PURE__ */ r.jsx(
          "group",
          {
            position: [d.target.x, d.target.y, d.target.z],
            children: /* @__PURE__ */ r.jsxs("mesh", { children: [
              /* @__PURE__ */ r.jsx("sphereGeometry", { args: [0.1, 8, 8] }),
              /* @__PURE__ */ r.jsx(
                "meshStandardMaterial",
                {
                  color: C ? "#888" : f ? "#ff4444" : "#ffaa00",
                  transparent: !0,
                  opacity: C ? 0.3 : 0.8
                }
              )
            ] })
          },
          `action-${h}`
        );
      }
      return null;
    })
  ] });
}
function $s({
  children: n,
  ...e
}) {
  return Te(), /* @__PURE__ */ r.jsx(
    Ai,
    {
      props: {
        children: n,
        ...e
      }
    }
  );
}
class zi {
  constructor(e = 10) {
    j(this, "cellSize");
    j(this, "cells", /* @__PURE__ */ new Map());
    this.cellSize = e;
  }
  getCellKey(e, t) {
    const i = Math.floor(e / this.cellSize), s = Math.floor(t / this.cellSize);
    return `${i},${s}`;
  }
  addObject(e, t) {
    const i = this.getCellKey(t.x, t.z);
    this.cells.has(i) || this.cells.set(i, /* @__PURE__ */ new Set()), this.cells.get(i).add(e);
  }
  removeObject(e, t) {
    const i = this.getCellKey(t.x, t.z), s = this.cells.get(i);
    s && (s.delete(e), s.size === 0 && this.cells.delete(i));
  }
  getNearbyObjects(e, t = 1) {
    const i = /* @__PURE__ */ new Set(), s = Math.ceil(t / this.cellSize), a = Math.floor(e.x / this.cellSize), o = Math.floor(e.z / this.cellSize);
    for (let c = a - s; c <= a + s; c++)
      for (let u = o - s; u <= o + s; u++) {
        const l = `${c},${u}`, d = this.cells.get(l);
        d && d.forEach((h) => i.add(h));
      }
    return Array.from(i);
  }
  clear() {
    this.cells.clear();
  }
}
class Vi {
  constructor() {
    j(this, "objects", /* @__PURE__ */ new Map());
    j(this, "interactionEvents", []);
    j(this, "spatial", new zi(10));
  }
  addObject(e) {
    this.objects.set(e.id, e), this.spatial.addObject(e.id, e.position);
  }
  removeObject(e) {
    var t;
    return this.spatial.removeObject(e, (t = this.objects.get(e)) == null ? void 0 : t.position), this.objects.delete(e);
  }
  getObject(e) {
    return this.objects.get(e);
  }
  getAllObjects() {
    return Array.from(this.objects.values());
  }
  getObjectsByType(e) {
    return this.getAllObjects().filter((t) => t.type === e);
  }
  updateObject(e, t) {
    const i = this.objects.get(e);
    return i ? (Object.assign(i, t), this.spatial.removeObject(e, i.position), this.spatial.addObject(e, i.position), !0) : !1;
  }
  getObjectsInRadius(e, t) {
    return this.spatial.getNearbyObjects(e, t).map((s) => this.objects.get(s)).filter((s) => s !== void 0);
  }
  checkCollisions(e) {
    const t = this.objects.get(e);
    return !t || !t.boundingBox ? [] : this.spatial.getNearbyObjects(t.position, t.boundingBox.max.distanceTo(t.boundingBox.min)).map((s) => this.objects.get(s)).filter(
      (s) => s.id !== e && s.boundingBox && t.boundingBox.intersectsBox(s.boundingBox)
    );
  }
  processInteraction(e) {
    this.interactionEvents.push(e), this.interactionEvents.length > 1e3 && (this.interactionEvents = this.interactionEvents.slice(-500));
  }
  getRecentEvents(e = 1e3) {
    const t = Date.now();
    return this.interactionEvents.filter(
      (i) => t - i.timestamp <= e
    );
  }
  raycast(e, t, i = 100) {
    const s = new g.Raycaster(e, t, 0, i), a = this.spatial.getNearbyObjects(e, i);
    for (const o of a) {
      const c = this.objects.get(o);
      if (c && c.boundingBox) {
        const u = s.ray.intersectBox(c.boundingBox, new g.Vector3());
        if (u)
          return {
            object: c,
            distance: e.distanceTo(u),
            point: u
          };
      }
    }
    return null;
  }
  cleanup() {
    this.objects.clear(), this.interactionEvents.length = 0, this.spatial.clear();
  }
}
class Li {
  constructor() {
    j(this, "engine");
    j(this, "state");
    j(this, "stateUpdateCallback");
    this.engine = new Vi(), this.state = {
      objects: [],
      interactionMode: "view",
      showDebugInfo: !1,
      events: []
    };
  }
  setStateUpdateCallback(e) {
    this.stateUpdateCallback = e;
  }
  addObject(e) {
    const t = this.generateId(), i = { ...e, id: t };
    return this.engine.addObject(i), this.updateState(), t;
  }
  removeObject(e) {
    const t = this.engine.removeObject(e);
    return t && (this.state.selectedObjectId === e && (this.state.selectedObjectId = void 0), this.updateState()), t;
  }
  updateObject(e, t) {
    const i = this.engine.updateObject(e, t);
    return i && this.updateState(), i;
  }
  selectObject(e) {
    this.state.selectedObjectId = e, this.updateState();
  }
  setInteractionMode(e) {
    this.state.interactionMode = e, this.updateState();
  }
  toggleDebugInfo() {
    this.state.showDebugInfo = !this.state.showDebugInfo, this.updateState();
  }
  interact(e, t) {
    const i = this.engine.getObject(e);
    if (!i || !i.canInteract) return;
    const s = {
      type: "interact",
      objectId: e,
      position: i.position.clone(),
      timestamp: Date.now()
    };
    this.engine.processInteraction(s), this.updateState();
  }
  raycast(e, t) {
    const i = this.engine.raycast(e, t);
    return (i == null ? void 0 : i.object) || null;
  }
  getObjectsInRadius(e, t) {
    return this.engine.getObjectsInRadius(e, t);
  }
  getObjectsByType(e) {
    return this.engine.getObjectsByType(e);
  }
  getState() {
    return { ...this.state };
  }
  cleanup() {
    this.engine.cleanup(), this.state = {
      objects: [],
      interactionMode: "view",
      showDebugInfo: !1,
      events: []
    }, this.updateState();
  }
  updateState() {
    this.state.objects = this.engine.getAllObjects(), this.state.events = this.engine.getRecentEvents(), this.stateUpdateCallback && this.stateUpdateCallback({ ...this.state });
  }
  generateId() {
    return `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
const Y = new Li(), Ws = (n, e) => (Y.setStateUpdateCallback((t) => {
  n({
    objects: t.objects,
    selectedObjectId: t.selectedObjectId,
    interactionMode: t.interactionMode,
    showDebugInfo: t.showDebugInfo,
    events: t.events
  });
}), {
  objects: [],
  selectedObjectId: void 0,
  interactionMode: "view",
  showDebugInfo: !1,
  events: [],
  loading: !1,
  error: void 0,
  addObject: (t) => {
    n({ loading: !0, error: void 0 });
    try {
      const i = Y.addObject(t);
      return n({ loading: !1 }), i;
    } catch (i) {
      return n({
        loading: !1,
        error: i instanceof Error ? i.message : "Unknown error"
      }), "";
    }
  },
  removeObject: (t) => {
    n({ loading: !0, error: void 0 });
    try {
      const i = Y.removeObject(t);
      return n({ loading: !1 }), i;
    } catch (i) {
      return n({
        loading: !1,
        error: i instanceof Error ? i.message : "Unknown error"
      }), !1;
    }
  },
  updateObject: (t, i) => {
    n({ loading: !0, error: void 0 });
    try {
      const s = Y.updateObject(t, i);
      return n({ loading: !1 }), s;
    } catch (s) {
      return n({
        loading: !1,
        error: s instanceof Error ? s.message : "Unknown error"
      }), !1;
    }
  },
  selectObject: (t) => {
    Y.selectObject(t);
  },
  setInteractionMode: (t) => {
    Y.setInteractionMode(t);
  },
  toggleDebugInfo: () => {
    Y.toggleDebugInfo();
  },
  setLoading: (t) => {
    n({ loading: t });
  },
  setError: (t) => {
    n({ error: t });
  },
  clearEvents: () => {
    n({ events: [] });
  }
});
function Gi({
  object: n,
  selected: e = !1,
  onSelect: t,
  showDebugInfo: i = !1
}) {
  return /* @__PURE__ */ r.jsxs(
    "group",
    {
      position: [n.position.x, n.position.y, n.position.z],
      rotation: [n.rotation.x, n.rotation.y, n.rotation.z],
      scale: [n.scale.x, n.scale.y, n.scale.z],
      onClick: () => t == null ? void 0 : t(n.id),
      children: [
        /* @__PURE__ */ r.jsxs("mesh", { children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [2, 1, 4] }),
          /* @__PURE__ */ r.jsx(
            "meshStandardMaterial",
            {
              color: e ? "#ff4444" : "#4488ff",
              wireframe: i
            }
          )
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [0, 0.5, 1.5], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [1.8, 0.8, 0.5] }),
          /* @__PURE__ */ r.jsx(
            "meshStandardMaterial",
            {
              color: e ? "#ff2222" : "#3366dd",
              wireframe: i
            }
          )
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [-0.8, -0.3, 1], children: [
          /* @__PURE__ */ r.jsx("cylinderGeometry", { args: [0.3, 0.3, 0.2, 8] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#333333" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [0.8, -0.3, 1], children: [
          /* @__PURE__ */ r.jsx("cylinderGeometry", { args: [0.3, 0.3, 0.2, 8] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#333333" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [-0.8, -0.3, -1], children: [
          /* @__PURE__ */ r.jsx("cylinderGeometry", { args: [0.3, 0.3, 0.2, 8] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#333333" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [0.8, -0.3, -1], children: [
          /* @__PURE__ */ r.jsx("cylinderGeometry", { args: [0.3, 0.3, 0.2, 8] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#333333" })
        ] }),
        i && /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
          /* @__PURE__ */ r.jsx("axesHelper", { args: [2] }),
          n.boundingBox && /* @__PURE__ */ r.jsx("boxHelper", { args: [n.boundingBox], color: "#00ff00" })
        ] })
      ]
    }
  );
}
function Fi({
  object: n,
  selected: e = !1,
  onSelect: t,
  showDebugInfo: i = !1
}) {
  return /* @__PURE__ */ r.jsxs(
    "group",
    {
      position: [n.position.x, n.position.y, n.position.z],
      rotation: [n.rotation.x, n.rotation.y, n.rotation.z],
      scale: [n.scale.x, n.scale.y, n.scale.z],
      onClick: () => t == null ? void 0 : t(n.id),
      children: [
        /* @__PURE__ */ r.jsxs("mesh", { children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [1, 0.8, 6] }),
          /* @__PURE__ */ r.jsx(
            "meshStandardMaterial",
            {
              color: e ? "#ff4444" : "#88ccff",
              wireframe: i
            }
          )
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [0, 0, 2], children: [
          /* @__PURE__ */ r.jsx("coneGeometry", { args: [0.3, 1, 8] }),
          /* @__PURE__ */ r.jsx(
            "meshStandardMaterial",
            {
              color: e ? "#ff2222" : "#66aadd",
              wireframe: i
            }
          )
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [-3, 0, 0], rotation: [0, 0, Math.PI / 6], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.2, 0.1, 3] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#666666" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [3, 0, 0], rotation: [0, 0, -Math.PI / 6], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.2, 0.1, 3] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#666666" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [0, 1, -2], rotation: [Math.PI / 4, 0, 0], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.1, 0.1, 1.5] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#444444" })
        ] }),
        i && /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
          /* @__PURE__ */ r.jsx("axesHelper", { args: [3] }),
          n.boundingBox && /* @__PURE__ */ r.jsx("boxHelper", { args: [n.boundingBox], color: "#00ff00" })
        ] })
      ]
    }
  );
}
function _i({
  object: n,
  selected: e = !1,
  onSelect: t,
  showDebugInfo: i = !1
}) {
  return /* @__PURE__ */ r.jsxs(
    "group",
    {
      position: [n.position.x, n.position.y, n.position.z],
      rotation: [n.rotation.x, n.rotation.y, n.rotation.z],
      scale: [n.scale.x, n.scale.y, n.scale.z],
      onClick: () => t == null ? void 0 : t(n.id),
      children: [
        /* @__PURE__ */ r.jsxs("mesh", { position: [0, 0.5, 0], children: [
          /* @__PURE__ */ r.jsx("sphereGeometry", { args: [0.3, 8, 6] }),
          /* @__PURE__ */ r.jsx(
            "meshStandardMaterial",
            {
              color: e ? "#ff4444" : "#ffcc88",
              wireframe: i
            }
          )
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [0, -0.2, 0], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.6, 0.8, 0.4] }),
          /* @__PURE__ */ r.jsx(
            "meshStandardMaterial",
            {
              color: e ? "#ff2222" : "#4488ff",
              wireframe: i
            }
          )
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [-0.35, -0.1, 0], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.15, 0.6, 0.15] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#ffcc88" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [0.35, -0.1, 0], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.15, 0.6, 0.15] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#ffcc88" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [-0.25, -0.8, 0], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.2, 0.6, 0.2] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#ffcc88" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [0.25, -0.8, 0], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.2, 0.6, 0.2] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#ffcc88" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [-0.25, -1.3, 0.1], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.3, 0.1, 0.4] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#333333" })
        ] }),
        /* @__PURE__ */ r.jsxs("mesh", { position: [0.25, -1.3, 0.1], children: [
          /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.3, 0.1, 0.4] }),
          /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#333333" })
        ] }),
        i && /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
          /* @__PURE__ */ r.jsx("axesHelper", { args: [1] }),
          n.boundingBox && /* @__PURE__ */ r.jsx("boxHelper", { args: [n.boundingBox], color: "#00ff00" })
        ] })
      ]
    }
  );
}
function Ui({
  objects: n,
  selectedId: e,
  onSelect: t,
  showDebugInfo: i = !1
}) {
  return /* @__PURE__ */ r.jsx("group", { name: "active-objects", children: n.map((s) => {
    const a = s.id === e;
    switch (s.type) {
      case "vehicle":
        return /* @__PURE__ */ r.jsx(
          Gi,
          {
            object: s,
            selected: a,
            onSelect: t,
            showDebugInfo: i
          },
          s.id
        );
      case "airplane":
        return /* @__PURE__ */ r.jsx(
          Fi,
          {
            object: s,
            selected: a,
            onSelect: t,
            showDebugInfo: i
          },
          s.id
        );
      case "character":
        return /* @__PURE__ */ r.jsx(
          _i,
          {
            object: s,
            selected: a,
            onSelect: t,
            showDebugInfo: i
          },
          s.id
        );
      default:
        return /* @__PURE__ */ r.jsxs(
          "mesh",
          {
            position: [s.position.x, s.position.y, s.position.z],
            rotation: [s.rotation.x, s.rotation.y, s.rotation.z],
            scale: [s.scale.x, s.scale.y, s.scale.z],
            onClick: () => t == null ? void 0 : t(s.id),
            children: [
              /* @__PURE__ */ r.jsx("boxGeometry", { args: [1, 1, 1] }),
              /* @__PURE__ */ r.jsx(
                "meshStandardMaterial",
                {
                  color: a ? "#ff4444" : "#4444ff",
                  wireframe: i
                }
              )
            ]
          },
          s.id
        );
    }
  }) });
}
function Bi({
  objects: n,
  selectedId: e,
  onSelect: t,
  showDebugInfo: i = !1,
  enableInteraction: s = !0
}) {
  return /* @__PURE__ */ r.jsx("group", { name: "passive-objects", children: n.map((a) => {
    var c, u, l, d;
    const o = a.id === e;
    return /* @__PURE__ */ r.jsxs(
      "group",
      {
        position: [a.position.x, a.position.y, a.position.z],
        rotation: [a.rotation.x, a.rotation.y, a.rotation.z],
        scale: [a.scale.x, a.scale.y, a.scale.z],
        children: [
          /* @__PURE__ */ r.jsxs(
            "mesh",
            {
              onClick: () => s && (t == null ? void 0 : t(a.id)),
              onPointerEnter: (h) => {
                s && (h.stopPropagation(), document.body.style.cursor = "pointer");
              },
              onPointerLeave: () => {
                document.body.style.cursor = "default";
              },
              children: [
                a.type === "building" && /* @__PURE__ */ r.jsx("boxGeometry", { args: [2, 3, 2] }),
                a.type === "tree" && /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
                  /* @__PURE__ */ r.jsx("cylinderGeometry", { args: [0.2, 0.3, 2, 8] }),
                  /* @__PURE__ */ r.jsxs("mesh", { position: [0, 2, 0], children: [
                    /* @__PURE__ */ r.jsx("sphereGeometry", { args: [1.5, 8, 6] }),
                    /* @__PURE__ */ r.jsx("meshStandardMaterial", { color: "#228833" })
                  ] })
                ] }),
                a.type === "rock" && /* @__PURE__ */ r.jsx("sphereGeometry", { args: [0.8, 6, 4] }),
                a.type === "item" && /* @__PURE__ */ r.jsx("boxGeometry", { args: [0.5, 0.5, 0.5] }),
                /* @__PURE__ */ r.jsx(
                  "meshStandardMaterial",
                  {
                    color: o ? "#ff4444" : ((c = a.metadata) == null ? void 0 : c.color) || "#888888",
                    wireframe: i,
                    transparent: ((u = a.metadata) == null ? void 0 : u.opacity) !== void 0,
                    opacity: ((l = a.metadata) == null ? void 0 : l.opacity) || 1
                  }
                )
              ]
            }
          ),
          i && /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
            /* @__PURE__ */ r.jsx("axesHelper", { args: [1] }),
            a.boundingBox && /* @__PURE__ */ r.jsx(
              "boxHelper",
              {
                args: [a.boundingBox],
                color: o ? "#ff0000" : "#00ff00"
              }
            )
          ] }),
          ((d = a.metadata) == null ? void 0 : d.label) && /* @__PURE__ */ r.jsx("group", { position: [0, 2, 0], children: /* @__PURE__ */ r.jsx("sprite", { children: /* @__PURE__ */ r.jsx("spriteMaterial", { color: "#ffffff" }) }) })
        ]
      },
      a.id
    );
  }) });
}
function Ks({ states: n }) {
  var i, s;
  if (!n || !n.canRide && !n.isRiding)
    return null;
  const e = ((i = n.nearbyRideable) == null ? void 0 : i.rideMessage) ?? "Press R to ride";
  return /* @__PURE__ */ r.jsxs("div", { className: "rideable-ui", children: [
    n.canRide && !n.isRiding && /* @__PURE__ */ r.jsxs("div", { className: "rideable-prompt", children: [
      /* @__PURE__ */ r.jsx("div", { className: "rideable-prompt__message", children: e }),
      /* @__PURE__ */ r.jsx("div", { className: "rideable-prompt__key", children: "R" })
    ] }),
    n.isRiding && /* @__PURE__ */ r.jsxs("div", { className: "rideable-controls", children: [
      /* @__PURE__ */ r.jsxs("div", { className: "rideable-controls__exit", children: [
        /* @__PURE__ */ r.jsx("div", { className: "rideable-controls__message", children: "Press R to exit" }),
        /* @__PURE__ */ r.jsx("div", { className: "rideable-controls__key", children: "R" })
      ] }),
      n.currentRideable && /* @__PURE__ */ r.jsx("div", { className: "rideable-controls__info", children: /* @__PURE__ */ r.jsxs("div", { className: "rideable-info", children: [
        /* @__PURE__ */ r.jsx("div", { className: "rideable-info__name", children: ((s = n.currentRideable.metadata) == null ? void 0 : s.name) || "Vehicle" }),
        /* @__PURE__ */ r.jsxs("div", { className: "rideable-info__stats", children: [
          /* @__PURE__ */ r.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ r.jsx("span", { className: "stat__label", children: "Speed:" }),
            /* @__PURE__ */ r.jsx("span", { className: "stat__value", children: Math.round(n.currentRideable.speed || 0) })
          ] }),
          /* @__PURE__ */ r.jsxs("div", { className: "stat", children: [
            /* @__PURE__ */ r.jsx("span", { className: "stat__label", children: "Max:" }),
            /* @__PURE__ */ r.jsx("span", { className: "stat__value", children: Math.round(n.currentRideable.maxSpeed || 0) })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
function qi({
  objects: n,
  onRide: e,
  onExit: t,
  showDebugInfo: i = !1
}) {
  return /* @__PURE__ */ r.jsx("group", { name: "rideable-objects", children: n.map((s) => {
    const a = s.isOccupied;
    return /* @__PURE__ */ r.jsxs(
      "group",
      {
        position: [s.position.x, s.position.y, s.position.z],
        rotation: [s.rotation.x, s.rotation.y, s.rotation.z],
        scale: [s.scale.x, s.scale.y, s.scale.z],
        children: [
          /* @__PURE__ */ r.jsxs(
            "mesh",
            {
              onClick: () => !a && (e == null ? void 0 : e(s.id)),
              onPointerEnter: (o) => {
                a || (o.stopPropagation(), document.body.style.cursor = "pointer");
              },
              onPointerLeave: () => {
                document.body.style.cursor = "default";
              },
              children: [
                /* @__PURE__ */ r.jsx("boxGeometry", { args: [2, 1, 4] }),
                /* @__PURE__ */ r.jsx(
                  "meshStandardMaterial",
                  {
                    color: a ? "#666666" : "#4488ff",
                    wireframe: i,
                    transparent: !0,
                    opacity: a ? 0.5 : 1
                  }
                )
              ]
            }
          ),
          i && /* @__PURE__ */ r.jsxs(r.Fragment, { children: [
            /* @__PURE__ */ r.jsx("axesHelper", { args: [2] }),
            s.boundingBox && /* @__PURE__ */ r.jsx(
              "boxHelper",
              {
                args: [s.boundingBox],
                color: a ? "#ff0000" : "#00ff00"
              }
            )
          ] }),
          !a && /* @__PURE__ */ r.jsx("group", { position: [0, 2, 0], children: /* @__PURE__ */ r.jsx("sprite", { scale: [2, 0.5, 1], children: /* @__PURE__ */ r.jsx("spriteMaterial", { color: "#ffffff", opacity: 0.8 }) }) })
        ]
      },
      s.id
    );
  }) });
}
function Hi() {
  const { gl: n } = At(), e = S((t) => t.setPerformance);
  return ne(() => {
    e({
      render: {
        calls: n.info.render.calls,
        triangles: n.info.render.triangles,
        points: n.info.render.points,
        lines: n.info.render.lines
      },
      engine: {
        geometries: n.info.memory.geometries,
        textures: n.info.memory.textures
      }
    });
  }), null;
}
function $i() {
  return /* @__PURE__ */ r.jsxs("group", { children: [
    /* @__PURE__ */ r.jsxs("mesh", { position: [0, 1, 0], children: [
      /* @__PURE__ */ r.jsx("boxGeometry", { args: [2, 0.1, 2] }),
      /* @__PURE__ */ r.jsx("meshBasicMaterial", { color: "#444444" })
    ] }),
    /* @__PURE__ */ r.jsxs("mesh", { position: [0, 1.1, 0], children: [
      /* @__PURE__ */ r.jsx("boxGeometry", { args: [1.8, 0.05, 1.8] }),
      /* @__PURE__ */ r.jsx("meshBasicMaterial", { color: "#666666" })
    ] })
  ] });
}
function Ys(n) {
  var l, d, h;
  const e = S((f) => f.setMode), t = S((f) => f.setUrls), i = S((f) => f.setCameraOption), s = S((f) => f.world), { debug: a } = S((f) => f.mode);
  N(() => {
    n.mode && e(n.mode);
  }, [n.mode, e]), N(() => {
    if (n.urls) {
      const f = Object.fromEntries(
        Object.entries(n.urls).filter(([, C]) => C !== void 0)
      );
      Object.keys(f).length > 0 && t(f);
    }
  }, [n.urls, t]), N(() => {
    n.cameraOption && i(n.cameraOption);
  }, [n.cameraOption, i]);
  const o = ((l = s == null ? void 0 : s.objects) == null ? void 0 : l.filter((f) => f.type === "active")) || [], c = ((d = s == null ? void 0 : s.objects) == null ? void 0 : d.filter((f) => f.type === "passive")) || [], u = ((h = s == null ? void 0 : s.objects) == null ? void 0 : h.filter((f) => f.type === "rideable")) || [];
  return /* @__PURE__ */ r.jsx(jt, { fallback: /* @__PURE__ */ r.jsx($i, {}), children: /* @__PURE__ */ r.jsxs("group", { name: "gaesup-world", children: [
    a && /* @__PURE__ */ r.jsx(Hi, {}),
    n.showGrid && /* @__PURE__ */ r.jsx("gridHelper", { args: [100, 100, "#888888", "#444444"] }),
    n.showAxes && /* @__PURE__ */ r.jsx("axesHelper", { args: [10] }),
    /* @__PURE__ */ r.jsx(
      Ui,
      {
        objects: o,
        selectedId: s == null ? void 0 : s.selectedObjectId,
        onSelect: s == null ? void 0 : s.selectObject,
        showDebugInfo: s == null ? void 0 : s.showDebugInfo
      }
    ),
    /* @__PURE__ */ r.jsx(
      Bi,
      {
        objects: c,
        selectedId: s == null ? void 0 : s.selectedObjectId,
        onSelect: s == null ? void 0 : s.selectObject,
        showDebugInfo: s == null ? void 0 : s.showDebugInfo
      }
    ),
    /* @__PURE__ */ r.jsx(
      qi,
      {
        objects: u,
        showDebugInfo: s == null ? void 0 : s.showDebugInfo
      }
    ),
    n.children
  ] }) });
}
function Xs({
  type: n = "normal",
  text: e,
  position: t,
  children: i,
  interactive: s = !0,
  showMinimap: a = !0
}) {
  const o = T(null), c = S((l) => l.addMinimapMarker), u = pn();
  return N(() => {
    if (a && o.current && t) {
      const l = {
        id: `prop-${Date.now()}`,
        position: ce(t),
        type: n,
        label: e || "Prop"
      };
      c(l);
    }
  }, [c, t, n, e, a]), /* @__PURE__ */ r.jsxs(
    "group",
    {
      ref: o,
      position: t,
      onClick: (l) => {
        s && (l.stopPropagation(), u.onClick(l));
      },
      children: [
        i,
        e && /* @__PURE__ */ r.jsx("group", { position: [0, 2, 0], children: /* @__PURE__ */ r.jsx("sprite", { scale: [2, 0.5, 1], children: /* @__PURE__ */ r.jsx(
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
const Se = 200;
function Qs({
  scale: n = 5,
  minScale: e = 0.5,
  maxScale: t = 20,
  blockScale: i = !1,
  blockScaleControl: s = !1,
  blockRotate: a = !1,
  angle: o = 0,
  minimapStyle: c,
  scaleStyle: u,
  plusMinusStyle: l,
  position: d = "top-right",
  showZoom: h = !0,
  showCompass: f = !0,
  markers: C = []
}) {
  const { canvasRef: w, scale: x, upscale: m, downscale: y, handleWheel: p, setupWheelListener: b, isReady: M } = wn({
    size: Se,
    blockScale: i,
    blockRotate: a,
    angle: o
  });
  N(() => {
    if (!s)
      return b();
  }, [s, b]);
  const I = d ? `minimap--${d}` : "";
  return /* @__PURE__ */ r.jsxs("div", { className: `minimap-container ${I}`, style: c, children: [
    /* @__PURE__ */ r.jsxs("div", { className: "minimap-wrapper", children: [
      /* @__PURE__ */ r.jsx(
        "canvas",
        {
          ref: w,
          className: "minimap-canvas",
          width: Se,
          height: Se,
          onWheel: p
        }
      ),
      f && /* @__PURE__ */ r.jsx("div", { className: "minimap-compass", children: /* @__PURE__ */ r.jsx("div", { className: "compass-needle", style: { transform: `rotate(${o}deg)` }, children: "↑" }) }),
      C.map((k, v) => /* @__PURE__ */ r.jsx(
        "div",
        {
          className: `minimap-marker minimap-marker--${k.type}`,
          style: {
            left: `${k.x}%`,
            top: `${k.y}%`,
            transform: "translate(-50%, -50%)"
          },
          title: k.label,
          children: k.icon || "●"
        },
        k.id || v
      ))
    ] }),
    h && !s && /* @__PURE__ */ r.jsxs("div", { className: "minimap-controls", style: u, children: [
      /* @__PURE__ */ r.jsx(
        "button",
        {
          className: "minimap-button",
          onClick: m,
          disabled: x >= t,
          style: l,
          children: "+"
        }
      ),
      /* @__PURE__ */ r.jsxs("span", { className: "minimap-scale", children: [
        x.toFixed(1),
        "x"
      ] }),
      /* @__PURE__ */ r.jsx(
        "button",
        {
          className: "minimap-button",
          onClick: y,
          disabled: x <= e,
          style: l,
          children: "-"
        }
      )
    ] })
  ] });
}
function xt({
  id: n,
  position: e,
  size: t = [2, 2, 2],
  text: i = "",
  type: s = "normal",
  children: a
}) {
  const o = S((u) => u.addMinimapMarker), c = S((u) => u.removeMinimapMarker);
  return N(() => {
    const u = Array.isArray(e) ? e : [e.x, e.y, e.z], l = Array.isArray(t) ? t : [t.x, t.y, t.z];
    return o(n, {
      type: s,
      text: i || "",
      center: new g.Vector3(u[0], u[1], u[2]),
      size: new g.Vector3(l[0], l[1], l[2])
    }), () => {
      c(n);
    };
  }, [n, e, t, s, i, o, c]), /* @__PURE__ */ r.jsx(r.Fragment, { children: a });
}
function Js({
  id: n,
  position: e,
  size: t,
  label: i,
  children: s
}) {
  return /* @__PURE__ */ r.jsx(xt, { id: n, position: e, size: t, text: i, type: "ground", children: s });
}
function Zs({
  id: n,
  position: e,
  emoji: t,
  size: i = [3, 3, 3],
  children: s
}) {
  return /* @__PURE__ */ r.jsx(xt, { id: n, position: e, size: i, text: t, type: "special", children: s });
}
function er(n = 120) {
  const [e, t] = R(null), i = T([]), s = T([]), a = T(performance.now()), o = T(0), c = T(0), u = E(() => {
    const w = performance.now(), x = performance.now();
    for (; performance.now() - x < 1; )
      ;
    return {
      mainThread: performance.now() - w,
      worker: 0,
      idle: Math.max(0, 16.67 - (performance.now() - w))
    };
  }, []), l = E(() => {
    const w = performance;
    if (w.memory) {
      const x = w.memory.usedJSHeapSize / 1048576, m = w.memory.totalJSHeapSize / 1048576, y = w.memory.jsHeapSizeLimit / 1048576, p = (e == null ? void 0 : e.memory.used) || 0;
      return x < p * 0.9 && c.current++, {
        used: Math.round(x * 100) / 100,
        total: Math.round(m * 100) / 100,
        limit: Math.round(y * 100) / 100,
        percentage: Math.round(x / y * 100),
        gcEvents: c.current
      };
    }
    return {
      used: 0,
      total: 0,
      limit: 0,
      percentage: 0,
      gcEvents: 0
    };
  }, [e]), d = E(() => {
    const w = document.createElement("canvas"), x = w.getContext("webgl2") || w.getContext("webgl");
    if (x) {
      const m = x.getExtension("WEBGL_debug_renderer_info"), y = x.getExtension("WEBGL_memory_info_webgl");
      return {
        vendor: m ? x.getParameter(m.UNMASKED_VENDOR_WEBGL) : "Unknown",
        renderer: m ? x.getParameter(m.UNMASKED_RENDERER_WEBGL) : "Unknown",
        memory: y ? x.getParameter(y.MEMORY_INFO_DEDICATED_VIDMEM_WEBGL) : void 0,
        textureMemory: y ? x.getParameter(y.MEMORY_INFO_CURRENT_AVAILABLE_VIDMEM_WEBGL) : void 0
      };
    }
    return {
      vendor: "Unknown",
      renderer: "Unknown"
    };
  }, []), h = E(() => {
    const w = navigator.connection;
    return w ? {
      rtt: w.rtt || 0,
      bandwidth: w.downlink || 0,
      effectiveType: w.effectiveType || "unknown"
    } : {
      rtt: 0,
      bandwidth: 0,
      effectiveType: "unknown"
    };
  }, []), f = E((w, x) => {
    const m = [...w].sort((p, b) => p - b), y = Math.ceil(x / 100 * m.length) - 1;
    return m[y] || 0;
  }, []);
  ne(() => {
    o.current++;
    const w = performance.now(), x = w - a.current;
    i.current.push(x), i.current.length > n && i.current.shift();
    const m = Math.round(1e3 / x);
    s.current.push(m), s.current.length > n && s.current.shift(), a.current = w;
  }), N(() => {
    const w = setInterval(() => {
      if (i.current.length === 0 || s.current.length === 0) return;
      const x = i.current.reduce((p, b) => p + b, 0) / i.current.length, m = s.current.reduce((p, b) => p + b, 0) / s.current.length, y = {
        fps: {
          current: s.current[s.current.length - 1] || 0,
          average: Math.round(m * 10) / 10,
          min: Math.min(...s.current),
          max: Math.max(...s.current),
          history: [...s.current]
        },
        frameTime: {
          current: i.current[i.current.length - 1] || 0,
          average: Math.round(x * 100) / 100,
          p95: f(i.current, 95),
          p99: f(i.current, 99),
          history: [...i.current]
        },
        memory: l(),
        cpu: u(),
        gpu: d(),
        network: h()
      };
      t(y);
    }, 1e3);
    return () => clearInterval(w);
  }, [f, u, l, d, h]);
  const C = E(() => {
    if (!e) return;
    const w = {
      metrics: e,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        devicePixelRatio: window.devicePixelRatio
      }
    }, x = new Blob([JSON.stringify(w, null, 2)], { type: "application/json" }), m = URL.createObjectURL(x), y = document.createElement("a");
    y.href = m, y.download = `performance-metrics-${Date.now()}.json`, y.click(), URL.revokeObjectURL(m);
  }, [e]);
  return {
    metrics: e,
    exportData: C
  };
}
const Wi = (n) => ({
  selectedObjectIds: [],
  setSelectedObjectIds: (e) => n({ selectedObjectIds: e }),
  layoutConfig: null,
  setLayoutConfig: (e) => n({ layoutConfig: e }),
  activeNodeGraph: null,
  setActiveNodeGraph: (e) => n({ activeNodeGraph: e }),
  clipboard: null,
  setClipboard: (e) => n({ clipboard: e })
}), De = ot(Wi), Ki = [
  { id: "world", name: "World", children: [
    { id: "lights", name: "Lights", children: [
      { id: "directional", name: "Directional Light", children: [] },
      { id: "ambient", name: "Ambient Light", children: [] }
    ] },
    { id: "environment", name: "Environment", children: [
      { id: "ground", name: "Ground", children: [] },
      { id: "skybox", name: "Skybox", children: [] }
    ] },
    { id: "actors", name: "Actors", children: [
      { id: "player", name: "PlayerCharacter", children: [] },
      { id: "npc1", name: "NPC_Guard", children: [] }
    ] }
  ] }
], bt = ({ node: n, level: e, selectedIds: t, onSelect: i }) => {
  const [s, a] = R(!0), o = t.includes(n.id), c = (l) => {
    l.stopPropagation(), i(n.id, l.ctrlKey || l.metaKey);
  }, u = (l) => {
    l.stopPropagation(), a(!s);
  };
  return /* @__PURE__ */ r.jsxs("div", { children: [
    /* @__PURE__ */ r.jsxs(
      "div",
      {
        className: `hierarchy-item ${o ? "selected" : ""}`,
        style: { paddingLeft: `${12 + e * 16}px` },
        onClick: c,
        children: [
          n.children.length > 0 && /* @__PURE__ */ r.jsx("span", { className: "hierarchy-toggle", onClick: u, children: s ? "▼" : "▶" }),
          /* @__PURE__ */ r.jsx("span", { className: "hierarchy-name", children: n.name })
        ]
      }
    ),
    s && n.children.map((l) => /* @__PURE__ */ r.jsx(
      bt,
      {
        node: l,
        level: e + 1,
        selectedIds: t,
        onSelect: i
      },
      l.id
    ))
  ] });
};
function Yi() {
  const { selectedObjectIds: n, setSelectedObjectIds: e } = De(), t = (i, s) => {
    e((a) => s ? a.includes(i) ? a.filter((o) => o !== i) : [...a, i] : [i]);
  };
  return /* @__PURE__ */ r.jsx("div", { className: "hierarchy-panel", children: Ki.map((i) => /* @__PURE__ */ r.jsx(
    bt,
    {
      node: i,
      level: 0,
      selectedIds: n,
      onSelect: t
    },
    i.id
  )) });
}
const je = ({ label: n, value: e }) => /* @__PURE__ */ r.jsxs("div", { className: "prop-item", children: [
  /* @__PURE__ */ r.jsx("label", { className: "prop-label", children: n }),
  /* @__PURE__ */ r.jsxs("div", { className: "prop-value vector-input", children: [
    /* @__PURE__ */ r.jsx("span", { children: "X" }),
    /* @__PURE__ */ r.jsx("input", { type: "number", defaultValue: e.x.toFixed(2) }),
    /* @__PURE__ */ r.jsx("span", { children: "Y" }),
    /* @__PURE__ */ r.jsx("input", { type: "number", defaultValue: e.y.toFixed(2) }),
    /* @__PURE__ */ r.jsx("span", { children: "Z" }),
    /* @__PURE__ */ r.jsx("input", { type: "number", defaultValue: e.z.toFixed(2) })
  ] })
] }), ae = ({ label: n, value: e }) => /* @__PURE__ */ r.jsxs("div", { className: "prop-item", children: [
  /* @__PURE__ */ r.jsx("label", { className: "prop-label", children: n }),
  /* @__PURE__ */ r.jsx("div", { className: "prop-value", children: /* @__PURE__ */ r.jsx("input", { type: "number", defaultValue: e.toFixed(2) }) })
] }), nt = {
  player: {
    transform: { position: { x: 10.5, y: 0, z: 5.2 }, rotation: { x: 0, y: 90, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    rigidbody: { mass: 70, friction: 0.8, restitution: 0.1 }
  },
  npc1: {
    transform: { position: { x: -5, y: 0, z: 12.8 }, rotation: { x: 0, y: -45, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
    ai: { state: "Patrolling", speed: 2.5 }
  },
  directional: {
    light: { intensity: 1.5, color: "#FFFFFF", castShadow: !0 },
    transform: { position: { x: 50, y: 100, z: 25 }, rotation: { x: -45, y: 20, z: 0 }, scale: { x: 1, y: 1, z: 1 } }
  }
};
function Xi() {
  const { selectedObjectIds: n } = De(), [e, t] = R(null);
  return N(() => {
    const i = n[0];
    i && nt[i] ? t({ id: i, ...nt[i] }) : t(null);
  }, [n]), e ? /* @__PURE__ */ r.jsxs("div", { className: "inspector-panel", children: [
    /* @__PURE__ */ r.jsxs("div", { className: "inspector-header", children: [
      /* @__PURE__ */ r.jsx("h3", { children: e.id }),
      /* @__PURE__ */ r.jsx("span", { className: "object-tag", children: "TAG_EXAMPLE" })
    ] }),
    e.transform && /* @__PURE__ */ r.jsxs("div", { className: "prop-group", children: [
      /* @__PURE__ */ r.jsx("h4", { className: "prop-group-title", children: "Transform" }),
      /* @__PURE__ */ r.jsx(je, { label: "Position", value: e.transform.position }),
      /* @__PURE__ */ r.jsx(je, { label: "Rotation", value: e.transform.rotation }),
      /* @__PURE__ */ r.jsx(je, { label: "Scale", value: e.transform.scale })
    ] }),
    e.rigidbody && /* @__PURE__ */ r.jsxs("div", { className: "prop-group", children: [
      /* @__PURE__ */ r.jsx("h4", { className: "prop-group-title", children: "Rigidbody" }),
      /* @__PURE__ */ r.jsx(ae, { label: "Mass", value: e.rigidbody.mass }),
      /* @__PURE__ */ r.jsx(ae, { label: "Friction", value: e.rigidbody.friction }),
      /* @__PURE__ */ r.jsx(ae, { label: "Restitution", value: e.rigidbody.restitution })
    ] }),
    e.light && /* @__PURE__ */ r.jsxs("div", { className: "prop-group", children: [
      /* @__PURE__ */ r.jsx("h4", { className: "prop-group-title", children: "Light" }),
      /* @__PURE__ */ r.jsx(ae, { label: "Intensity", value: e.light.intensity })
    ] })
  ] }) : /* @__PURE__ */ r.jsx("div", { className: "inspector-panel empty", children: /* @__PURE__ */ r.jsx("span", { children: "No object selected" }) });
}
const Qi = [
  { id: "1", label: "Start State", position: { x: 250, y: 25 } },
  { id: "2", label: "Idle State", position: { x: 100, y: 125 } },
  { id: "3", label: "Moving State", position: { x: 400, y: 125 } }
], Ji = () => {
  const [n] = R(Qi), [e, t] = R(null);
  return /* @__PURE__ */ r.jsxs("div", { style: { height: "100%", display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ r.jsx("h3", { className: "editor-title", children: "🔗 Node Editor (FSM)" }),
    /* @__PURE__ */ r.jsxs("div", { className: "editor-scrollbar", style: { flex: 1, overflow: "auto", padding: "8px" }, children: [
      /* @__PURE__ */ r.jsx("div", { className: "editor-text", style: { marginBottom: "10px", fontWeight: "bold" }, children: "State Machine Nodes:" }),
      n.map((i) => /* @__PURE__ */ r.jsxs(
        "div",
        {
          onClick: () => t(i.id),
          style: {
            padding: "8px 12px",
            margin: "4px 0",
            background: e === i.id ? "rgba(0, 120, 212, 0.3)" : "rgba(255, 255, 255, 0.05)",
            border: e === i.id ? "1px solid rgba(0, 120, 212, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "all 0.2s ease"
          },
          children: [
            /* @__PURE__ */ r.jsx("div", { className: "editor-text", style: { fontWeight: "bold" }, children: i.label }),
            /* @__PURE__ */ r.jsxs("div", { className: "editor-text-small", children: [
              "Position: (",
              i.position.x,
              ", ",
              i.position.y,
              ")"
            ] })
          ]
        },
        i.id
      )),
      /* @__PURE__ */ r.jsxs("div", { style: {
        marginTop: "20px",
        padding: "10px",
        background: "rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "6px"
      }, children: [
        /* @__PURE__ */ r.jsx("div", { className: "editor-text", style: { fontWeight: "bold", marginBottom: "8px" }, children: "FSM Graph Preview" }),
        /* @__PURE__ */ r.jsx("div", { className: "editor-text-small", style: { marginBottom: "6px" }, children: "Start → Idle ↔ Moving" }),
        /* @__PURE__ */ r.jsx("div", { className: "editor-text-small", style: { opacity: 0.7 }, children: "Note: React Flow integration will be added once package issues are resolved." })
      ] })
    ] })
  ] });
}, Zi = () => /* @__PURE__ */ r.jsx("svg", { width: "60", height: "60", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r.jsx("path", { d: "M4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V7M4 7C4 5.89543 4.89543 5 6 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L11.7071 6.70711C11.8946 6.89464 12.149 7 12.4142 7H18C19.1046 7 20 7.89543 20 9V7", stroke: "rgba(255, 255, 255, 0.6)", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }), es = () => /* @__PURE__ */ r.jsx("svg", { width: "60", height: "60", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ r.jsx("path", { d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", stroke: "rgba(255, 255, 255, 0.6)", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }), ts = [
  { id: "folder1", name: "Characters", type: "folder" },
  { id: "folder2", name: "Environments", type: "folder" },
  { id: "folder3", name: "Props", type: "folder" },
  { id: "model1", name: "Player.gltf", type: "model" },
  { id: "tex1", name: "Grass_d.png", type: "texture" },
  { id: "tex2", name: "Rock_n.png", type: "texture" },
  { id: "mat1", name: "Ground.mat", type: "material" }
];
function ns() {
  const [n, e] = R(null);
  return /* @__PURE__ */ r.jsxs("div", { className: "asset-browser-panel", children: [
    /* @__PURE__ */ r.jsx("div", { className: "asset-grid editor-scrollbar", children: ts.map((t) => /* @__PURE__ */ r.jsxs(
      "div",
      {
        className: `asset-item ${n === t.id ? "selected" : ""}`,
        onClick: () => e(t.id),
        children: [
          /* @__PURE__ */ r.jsx("div", { className: "asset-preview", children: t.type === "folder" ? /* @__PURE__ */ r.jsx(Zi, {}) : /* @__PURE__ */ r.jsx(es, {}) }),
          /* @__PURE__ */ r.jsx("div", { className: "asset-info", children: /* @__PURE__ */ r.jsx("div", { className: "asset-name", children: t.name }) })
        ]
      },
      t.id
    )) }),
    /* @__PURE__ */ r.jsxs("div", { className: "asset-footer", children: [
      /* @__PURE__ */ r.jsx("span", { className: "asset-path", children: "Content / Characters /" }),
      /* @__PURE__ */ r.jsx("div", { className: "asset-actions", children: /* @__PURE__ */ r.jsx("button", { className: "editor-glass-button", children: "Import" }) })
    ] })
  ] });
}
function is() {
  const { compileFSM: n } = De(), e = [
    { label: "Load Asset", action: () => console.log("Load asset") },
    { label: "Save Scene", action: () => console.log("Save scene") },
    { label: "Build Project", action: () => console.log("Build project") },
    { label: "Export Package", action: () => console.log("Export package") }
  ];
  return /* @__PURE__ */ r.jsxs("div", { className: "quick-actions-panel", children: [
    /* @__PURE__ */ r.jsx("h3", { className: "editor-title", children: "Quick Actions" }),
    /* @__PURE__ */ r.jsx("div", { className: "actions-grid", children: e.map((t, i) => /* @__PURE__ */ r.jsx(
      "button",
      {
        className: "editor-glass-button action-button",
        onClick: t.action,
        children: t.label
      },
      i
    )) })
  ] });
}
function ss() {
  const [n, e] = R("Controller"), t = () => {
    switch (n) {
      case "Controller":
        return /* @__PURE__ */ r.jsx(mt, {});
      case "Presets":
        return /* @__PURE__ */ r.jsx(pt, {});
      case "Debug":
        return /* @__PURE__ */ r.jsx(ft, {});
      default:
        return null;
    }
  };
  return /* @__PURE__ */ r.jsxs("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ r.jsxs("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ r.jsx("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ r.jsx("button", { className: `panel-tab ${n === "Presets" ? "active" : ""}`, onClick: () => e("Presets"), children: "Presets" }),
      /* @__PURE__ */ r.jsx("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ r.jsx("div", { className: "panel-tab-content", children: t() })
  ] });
}
function rs() {
  const [n, e] = R("Player"), t = () => {
    switch (n) {
      case "Player":
        return /* @__PURE__ */ r.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ r.jsx(ai, {}) });
      case "Controller":
        return /* @__PURE__ */ r.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ r.jsx(ti, {}) });
      case "Debug":
        return /* @__PURE__ */ r.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ r.jsx(ci, {}) });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ r.jsxs("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ r.jsxs("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ r.jsx("button", { className: `panel-tab ${n === "Player" ? "active" : ""}`, onClick: () => e("Player"), children: "Player" }),
      /* @__PURE__ */ r.jsx("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ r.jsx("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ r.jsx("div", { className: "panel-tab-content", children: t() })
  ] });
}
function as() {
  const [n, e] = R("Controller"), t = () => {
    switch (n) {
      case "Controller":
        return /* @__PURE__ */ r.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ r.jsx(gt, {}) });
      case "Debug":
        return /* @__PURE__ */ r.jsx("div", { className: "panel-content-wrapper", children: /* @__PURE__ */ r.jsx(yt, {}) });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ r.jsxs("div", { className: "tabbed-panel", children: [
    /* @__PURE__ */ r.jsxs("div", { className: "panel-tabs", children: [
      /* @__PURE__ */ r.jsx("button", { className: `panel-tab ${n === "Controller" ? "active" : ""}`, onClick: () => e("Controller"), children: "Controller" }),
      /* @__PURE__ */ r.jsx("button", { className: `panel-tab ${n === "Debug" ? "active" : ""}`, onClick: () => e("Debug"), children: "Debug" })
    ] }),
    /* @__PURE__ */ r.jsx("div", { className: "panel-tab-content", children: t() })
  ] });
}
const it = ({ data: n, color: e, max: t }) => {
  const s = n.filter((c) => isFinite(c));
  if (s.length < 2) return null;
  const a = Math.max(1, t), o = s.map((c, u) => {
    const l = u / (s.length - 1) * 100, d = 40 - c / a * 40;
    return `${u === 0 ? "M" : "L"}${l.toFixed(2)},${d.toFixed(2)}`;
  }).join(" ");
  return /* @__PURE__ */ r.jsx("div", { className: "perf-chart", children: /* @__PURE__ */ r.jsx("svg", { width: "100%", height: 40, preserveAspectRatio: "none", viewBox: "0 0 100 40", children: /* @__PURE__ */ r.jsx("path", { d: o, fill: "none", stroke: e, strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" }) }) });
};
function os() {
  const n = S((w) => w.performance), [e, t] = R({ current: 0, min: 1 / 0, max: 0, avg: 0, history: Array(50).fill(0) }), [i, s] = R({ used: 0, limit: 0, history: Array(50).fill(0) }), [a, o] = R(0), c = T(0), u = T(0), l = T(0), d = T([]), h = T();
  N(() => {
    const w = window.performance.now();
    c.current = w, u.current = w;
    const x = (m) => {
      const y = m - u.current;
      u.current = m, d.current.push(y), d.current.length > 30 && d.current.shift();
      const p = d.current.reduce((b, M) => b + M, 0) / d.current.length;
      if (o(p), l.current++, m - c.current >= 500) {
        const b = l.current * 1e3 / (m - c.current);
        t((I) => {
          const k = [...I.history.slice(1), b], v = Math.min(
            I.min === 1 / 0 ? b : I.min,
            b
          ), z = Math.max(I.max, b), G = k.reduce((F, B) => F + B, 0) / k.length;
          return {
            current: b,
            min: v,
            max: z,
            avg: G,
            history: k
          };
        });
        const M = window.performance.memory;
        M && s((I) => {
          const k = Math.round(M.usedJSHeapSize / 1048576), v = Math.round(M.jsHeapSizeLimit / 1048576), z = [...I.history.slice(1), k];
          return { used: k, limit: v, history: z };
        }), c.current = m, l.current = 0;
      }
      h.current = requestAnimationFrame(x);
    };
    return h.current = requestAnimationFrame(x), () => {
      h.current && cancelAnimationFrame(h.current);
    };
  }, []);
  const f = (w) => w >= 55 ? "#4ade80" : w >= 30 ? "#facc15" : "#f87171", C = (w, x) => {
    const m = x > 0 ? w / x * 100 : 0;
    return m < 60 ? "#4ade80" : m < 80 ? "#facc15" : "#f87171";
  };
  return /* @__PURE__ */ r.jsxs("div", { className: "perf-panel", children: [
    /* @__PURE__ */ r.jsxs("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ r.jsxs("div", { className: "perf-header", children: [
        /* @__PURE__ */ r.jsx("h4", { className: "perf-title", children: "Frame Rate (FPS)" }),
        /* @__PURE__ */ r.jsx("span", { className: "perf-current", style: { color: f(e.current) }, children: e.current.toFixed(0) })
      ] }),
      /* @__PURE__ */ r.jsxs("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Avg" }),
          e.avg.toFixed(1)
        ] }),
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Min" }),
          isFinite(e.min) ? e.min.toFixed(1) : "..."
        ] }),
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Max" }),
          e.max.toFixed(1)
        ] }),
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Time" }),
          a.toFixed(1),
          " ms"
        ] })
      ] }),
      /* @__PURE__ */ r.jsx(it, { data: e.history, color: f(e.current), max: 90 })
    ] }),
    /* @__PURE__ */ r.jsxs("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ r.jsxs("div", { className: "perf-header", children: [
        /* @__PURE__ */ r.jsx("h4", { className: "perf-title", children: "Memory (MB)" }),
        /* @__PURE__ */ r.jsx("span", { className: "perf-current", style: { color: C(i.used, i.limit) }, children: i.used })
      ] }),
      /* @__PURE__ */ r.jsxs("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Limit" }),
          i.limit
        ] }),
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Usage" }),
          i.limit > 0 ? (i.used / i.limit * 100).toFixed(0) : 0,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ r.jsx(it, { data: i.history, color: C(i.used, i.limit), max: i.limit || 1 })
    ] }),
    /* @__PURE__ */ r.jsxs("div", { className: "perf-stat-group", children: [
      /* @__PURE__ */ r.jsx("div", { className: "perf-header", children: /* @__PURE__ */ r.jsx("h4", { className: "perf-title", children: "Rendering" }) }),
      /* @__PURE__ */ r.jsxs("div", { className: "perf-details-grid", children: [
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Draws" }),
          n.render.calls
        ] }),
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Tris" }),
          (n.render.triangles / 1e3).toFixed(1),
          "K"
        ] }),
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Geometries" }),
          n.engine.geometries
        ] }),
        /* @__PURE__ */ r.jsxs("div", { children: [
          /* @__PURE__ */ r.jsx("span", { className: "perf-label", children: "Textures" }),
          n.engine.textures
        ] })
      ] })
    ] })
  ] });
}
const cs = () => /* @__PURE__ */ r.jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ r.jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" }) }), ls = () => /* @__PURE__ */ r.jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
  /* @__PURE__ */ r.jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ r.jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] }), Ce = ({
  children: n,
  title: e,
  initialWidth: t = 280,
  initialHeight: i = 400,
  minWidth: s = 200,
  minHeight: a = 150,
  maxWidth: o = 600,
  maxHeight: c = 800,
  resizeHandles: u = ["right"],
  className: l = "",
  style: d = {},
  onClose: h,
  onMinimize: f,
  draggable: C = !0,
  icon: w,
  onDrop: x
}) => {
  const [m, y] = R({ width: t, height: i }), [p, b] = R({ x: 0, y: 0 }), [M, I] = R(!1), [k, v] = R(!1), [z, G] = R(""), [F, B] = R({ x: 0, y: 0 }), _ = T(null), Pe = T(null), Z = E((P) => (U) => {
    U.preventDefault(), I(!0), G(P);
  }, []), O = E((P) => {
    if (_.current)
      if (M) {
        const U = _.current.getBoundingClientRect();
        let $ = m.width, W = m.height;
        z.includes("right") && ($ = Math.min(o, Math.max(s, P.clientX - U.left))), z.includes("bottom") && (W = Math.min(c, Math.max(a, P.clientY - U.top))), y({ width: $, height: W });
      } else k && b({
        x: P.clientX - F.x,
        y: P.clientY - F.y
      });
  }, [M, k, z, m, s, o, a, c, F]), H = E(() => {
    k && x && x(p.x, p.y), I(!1), v(!1), G("");
  }, [k, x, p]), ee = E((P) => {
    var $;
    if (!C || M) return;
    P.preventDefault(), v(!0);
    const U = ($ = _.current) == null ? void 0 : $.getBoundingClientRect();
    U && B({
      x: P.clientX - U.left,
      y: P.clientY - U.top
    });
  }, [C, M]);
  return N(() => {
    if (M || k)
      return document.addEventListener("mousemove", O), document.addEventListener("mouseup", H), () => {
        document.removeEventListener("mousemove", O), document.removeEventListener("mouseup", H);
      };
  }, [M, k, O, H]), /* @__PURE__ */ r.jsxs(
    "div",
    {
      ref: _,
      className: `rp-panel ${l} ${k ? "dragging" : ""}`,
      style: {
        width: `${m.width}px`,
        height: `${m.height}px`,
        ...k ? {
          position: "fixed",
          left: `${p.x}px`,
          top: `${p.y}px`,
          zIndex: 10003
        } : {},
        ...d
      },
      children: [
        /* @__PURE__ */ r.jsxs(
          "div",
          {
            ref: Pe,
            className: "rp-header",
            onMouseDown: ee,
            children: [
              /* @__PURE__ */ r.jsx("h3", { className: "rp-title", children: e }),
              /* @__PURE__ */ r.jsxs("div", { className: "rp-controls", children: [
                f && /* @__PURE__ */ r.jsx("button", { className: "rp-btn", onClick: f, title: "Minimize", children: /* @__PURE__ */ r.jsx(cs, {}) }),
                h && /* @__PURE__ */ r.jsx("button", { className: "rp-btn", onClick: h, title: "Close", children: /* @__PURE__ */ r.jsx(ls, {}) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ r.jsx("div", { className: "rp-content", children: n }),
        u.map((P) => /* @__PURE__ */ r.jsx(
          "div",
          {
            className: `rp-resize-handle handle-${P}`,
            onMouseDown: Z(P.replace("corner", "right bottom"))
          },
          P
        ))
      ]
    }
  );
}, us = ({ children: n }) => {
  const [e, t] = R(["hierarchy", "performance"]), [i, s] = R([]), [a, o] = R([]), c = [
    { id: "hierarchy", title: "Hierarchy", component: /* @__PURE__ */ r.jsx(Yi, {}), defaultSide: "left" },
    { id: "inspector", title: "Inspector", component: /* @__PURE__ */ r.jsx(Xi, {}), defaultSide: "right" },
    { id: "camera", title: "Camera", component: /* @__PURE__ */ r.jsx(ss, {}), defaultSide: "right" },
    { id: "animation", title: "Animation", component: /* @__PURE__ */ r.jsx(rs, {}), defaultSide: "left" },
    { id: "motion", title: "Motion", component: /* @__PURE__ */ r.jsx(as, {}), defaultSide: "right" },
    { id: "performance", title: "Performance", component: /* @__PURE__ */ r.jsx(os, {}), defaultSide: "right" },
    { id: "nodes", title: "Node Editor", component: /* @__PURE__ */ r.jsx(Ji, {}), defaultSide: "floating" },
    { id: "assets", title: "Assets", component: /* @__PURE__ */ r.jsx(ns, {}), defaultSide: "right" },
    { id: "actions", title: "Quick Actions", component: /* @__PURE__ */ r.jsx(is, {}), defaultSide: "right" }
  ], u = (m) => {
    t((y) => y.includes(m) ? y.filter((p) => p !== m) : [...y, m]), o((y) => y.filter((p) => p !== m));
  }, l = (m) => {
    t((y) => y.filter((p) => p !== m)), s((y) => y.filter((p) => p.id !== m)), o((y) => y.filter((p) => p !== m));
  }, d = (m) => {
    o((y) => [...y, m]), t((y) => y.filter((p) => p !== m)), s((y) => y.filter((p) => p.id !== m));
  }, h = (m) => {
    o((y) => y.filter((p) => p !== m)), t((y) => [...y, m]);
  }, f = (m, y, p) => {
    const b = i.find((M) => M.id === m);
    s(b ? (M) => M.map(
      (I) => I.id === m ? { ...I, x: y, y: p } : I
    ) : (M) => [...M, {
      id: m,
      x: y,
      y: p,
      width: 300,
      height: 400
    }]);
  }, C = () => c.filter(
    (m) => e.includes(m.id) && m.defaultSide === "left" && !i.some((y) => y.id === m.id)
  ), w = () => c.filter(
    (m) => e.includes(m.id) && m.defaultSide === "right" && !i.some((y) => y.id === m.id)
  ), x = () => i.filter((m) => e.includes(m.id));
  return /* @__PURE__ */ r.jsxs("div", { className: "editor-root", children: [
    /* @__PURE__ */ r.jsx("div", { className: "editor-panel-bar", children: c.map((m) => /* @__PURE__ */ r.jsx(
      "button",
      {
        onClick: () => u(m.id),
        className: `editor-panel-toggle ${e.includes(m.id) ? "active" : ""}`,
        title: m.title,
        children: m.title
      },
      m.id
    )) }),
    C().length > 0 && /* @__PURE__ */ r.jsx("div", { className: "editor-left-stack", children: C().map((m, y) => /* @__PURE__ */ r.jsx(
      Ce,
      {
        title: m.title,
        initialWidth: 280,
        initialHeight: Math.max(300, (window.innerHeight - 120) / C().length),
        minWidth: 200,
        maxWidth: 500,
        resizeHandles: ["right"],
        className: "editor-glass-panel",
        style: {
          marginBottom: y < C().length - 1 ? "8px" : "0"
        },
        onClose: () => l(m.id),
        onMinimize: () => d(m.id),
        onDrop: (p, b) => f(m.id, p, b),
        children: m.component
      },
      m.id
    )) }),
    w().length > 0 && /* @__PURE__ */ r.jsx("div", { className: "editor-right-stack", children: w().map((m, y) => /* @__PURE__ */ r.jsx(
      Ce,
      {
        title: m.title,
        initialWidth: 320,
        initialHeight: Math.max(300, (window.innerHeight - 120) / w().length),
        minWidth: 200,
        maxWidth: 500,
        resizeHandles: ["corner"],
        className: "editor-glass-panel",
        style: {
          marginBottom: y < w().length - 1 ? "8px" : "0"
        },
        onClose: () => l(m.id),
        onMinimize: () => d(m.id),
        onDrop: (p, b) => f(m.id, p, b),
        children: m.component
      },
      m.id
    )) }),
    x().map((m) => {
      const y = c.find((p) => p.id === m.id);
      return y ? /* @__PURE__ */ r.jsx(
        Ce,
        {
          title: y.title,
          initialWidth: m.width,
          initialHeight: m.height,
          minWidth: 200,
          maxWidth: 800,
          resizeHandles: ["right", "bottom", "corner"],
          className: "editor-glass-panel",
          style: {
            position: "fixed",
            left: `${m.x}px`,
            top: `${m.y}px`,
            zIndex: 1001
          },
          onClose: () => l(y.id),
          onMinimize: () => d(y.id),
          onDrop: (p, b) => f(y.id, p, b),
          children: y.component
        },
        m.id
      ) : null;
    }),
    a.length > 0 && /* @__PURE__ */ r.jsx("div", { className: "editor-minimized-dock", children: a.map((m) => {
      const y = c.find((p) => p.id === m);
      return y ? /* @__PURE__ */ r.jsx(
        "button",
        {
          onClick: () => h(m),
          className: "editor-minimized-item",
          title: `Restore ${y.title}`,
          children: y.title
        },
        m
      ) : null;
    }) }),
    n
  ] });
}, tr = ({
  children: n,
  className: e = "",
  style: t = {}
}) => /* @__PURE__ */ r.jsx(
  "div",
  {
    className: `gaesup-editor ${e}`,
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      zIndex: 1e3,
      ...t
    },
    children: /* @__PURE__ */ r.jsx(us, { children: n })
  }
);
export {
  Ui as ActiveObjects,
  Fi as Airplane,
  fn as AnimationBridge,
  ti as AnimationController,
  ci as AnimationDebugPanel,
  mn as AnimationEngine,
  ai as AnimationPlayer,
  Ti as AutomationEngine,
  Fn as BaseCameraEngine,
  J as BaseController,
  qn as Camera,
  mt as CameraController,
  ft as CameraDebugPanel,
  zs as CameraDebugger,
  _n as CameraEngine,
  pt as CameraPresets,
  Vs as CameraUI,
  _i as Character,
  Dn as ChaseController,
  Hs as Clicker,
  $s as ControllerWrapper,
  tr as Editor,
  us as EditorLayout,
  Yt as Elr,
  Ai as EntityWrapper,
  On as FirstPersonController,
  Ln as FixedController,
  Xs as GaeSupProps,
  $s as GaesupController,
  Ls as GaesupErrorBoundary,
  Ys as GaesupWorld,
  qs as GamePad,
  Us as InteractionBridge,
  Ii as InteractionEngine,
  zn as IsometricController,
  Ae as MemoizationManager,
  Qs as MiniMap,
  Zs as MinimapObject,
  Js as MinimapPlatform,
  Gs as MotionBridge,
  gt as MotionController,
  yt as MotionDebugPanel,
  gi as MotionEngine,
  Fs as MotionUI,
  Bi as PassiveObjects,
  pi as PhysicsEngine,
  Cs as Qt,
  Ce as ResizablePanel,
  qi as RideableObjects,
  Ks as RideableUI,
  Vn as SideScrollController,
  _s as Teleport,
  Tn as ThirdPersonController,
  Pn as TopDownController,
  Q as V3,
  Ms as V30,
  ks as V31,
  Gi as Vehicle,
  Li as WorldBridge,
  Ys as WorldContainer,
  Vi as WorldEngine,
  Xs as WorldProps,
  Ps as cache,
  Kt as calcAngleByVector,
  Wt as calcNorm,
  Nn as clearTrigCache,
  js as convertElr,
  ws as convertN3,
  Ss as convertV3,
  Es as createAnimationController,
  nn as createAnimationSlice,
  Xt as createCameraOptionSlice,
  Zt as createCameraSlice,
  rn as createInteractionSlice,
  An as createVectorCache,
  Ws as createWorldSlice,
  Bs as gamepadDefault,
  Ze as getCachedTrig,
  ct as getGlobalAnimationBridge,
  Ie as getPooledVector,
  Os as getTag,
  Rn as getTrigCacheStats,
  Ds as isEqualTag,
  vs as isValidOrOne,
  bs as isValidOrZero,
  xs as isVectorNonZero,
  et as normalizeAngle,
  ys as releaseVector,
  Mn as rideableDefault,
  tt as shouldUpdate,
  Ts as shouldUpdateVector3,
  me as useAnimationBridge,
  fe as useAnimationPlayer,
  Bn as useCamera,
  Un as useCameraBridge,
  pn as useClicker,
  Is as useCursorState,
  Rs as useGaesupContext,
  As as useGaesupController,
  S as useGaesupStore,
  Te as useKeyboard,
  wn as useMinimap,
  er as usePerformanceMonitor,
  ui as usePhysics,
  Ns as useRideable,
  kn as useTeleport
};
