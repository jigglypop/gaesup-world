import { useRef as h, useEffect as b, useCallback as A, useMemo as ut, useLayoutEffect as J } from "react";
import { useFrame as ct, useThree as mt } from "@react-three/fiber";
import * as a from "three";
import { Z as dt, G as ht, V as gt } from "./index-DmHVuHAr.js";
import { H, P as G, C as pt, M as vt, u as Z } from "./gaesupStore-x2iiDzsY.js";
import "reflect-metadata";
import yt from "mitt";
var wt = Object.defineProperty, Ct = Object.getOwnPropertyDescriptor, K = (e, o, t, i) => {
  for (var n = Ct(o, t), r = e.length - 1, c; r >= 0; r--)
    (c = e[r]) && (n = c(o, t, n) || n);
  return n && wt(o, t, n), n;
};
function _(e) {
  return {
    ...e,
    distance: { ...e.distance },
    smoothing: { ...e.smoothing },
    ...e.focusTarget ? { focusTarget: { ...e.focusTarget } } : {},
    ...e.offset ? { offset: { ...e.offset } } : {},
    ...e.lookAt ? { lookAt: { ...e.lookAt } } : {}
  };
}
class Y {
  emitter;
  config;
  metrics = {
    frameCount: 0,
    totalFrameTime: 0,
    lastUpdateTime: 0
  };
  constructor(o) {
    this.emitter = yt(), this.config = _(o);
  }
  updateConfig(o) {
    const t = { ...this.config };
    this.config = _({ ...this.config, ...o }), Object.keys(o).forEach((i) => {
      this.emitter.emit("configChange", {
        key: i,
        value: o[i]
      });
    }), t.mode !== this.config.mode && this.emitter.emit("modeChange", {
      from: t.mode,
      to: this.config.mode
    });
  }
  getConfig() {
    return _(this.config);
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
  trackFrameMetrics(o) {
    this.metrics.frameCount++, this.metrics.totalFrameTime += o, this.metrics.lastUpdateTime = Date.now();
  }
  emitError(o, t) {
    this.emitter.emit("error", { message: o, details: t });
  }
  destroy() {
    this.emitter.all.clear();
  }
}
K([
  H()
], Y.prototype, "updateConfig");
K([
  G()
], Y.prototype, "trackFrameMetrics");
K([
  H()
], Y.prototype, "destroy");
const V = new a.Vector3(), U = new a.Vector3(), xt = new a.Quaternion(), Pt = new a.Matrix4(), W = new a.Quaternion(), E = new a.Vector3(), I = new a.Raycaster(), N = [], tt = new a.Vector3(), et = new a.Vector3(), Mt = new a.Vector3(), St = new a.Euler(), bt = new a.Vector3(), zt = new a.Vector3();
new a.Vector3();
let X = [], ot = null, nt = -1;
function it(e) {
  const o = [];
  return e.traverse((t) => {
    t instanceof a.Mesh && !t.userData.intangible && t.geometry?.boundingSphere && o.push(t);
  }), o;
}
function Tt(e) {
  const o = e._frameId;
  return o === void 0 ? it(e) : (e === ot && o - nt < 60 || (ot = e, nt = o, X = it(e)), X);
}
function Dt(e, o) {
  if (!o || o.length === 0) return !1;
  let t = e;
  for (; t; ) {
    for (let i = 0, n = o.length; i < n; i++)
      if (t === o[i]) return !0;
    t = t.parent;
  }
  return !1;
}
const y = {
  tempVectors: {
    temp1: new a.Vector3(),
    temp2: new a.Vector3(),
    temp3: new a.Vector3()
  },
  clampValue: (e, o, t) => Math.max(o, Math.min(t, e)),
  smoothingToSpeed: (e, o = pt.FRAME_RATE_LERP_SPEED) => {
    if (e === void 0 || !Number.isFinite(e)) return o;
    if (e <= 0) return 0;
    if (e >= 1) return e;
    const t = y.clampValue(e, 1e-3, 0.999);
    return -Math.log(1 - t) * 60;
  },
  frameRateIndependentLerpVector3: (e, o, t, i) => {
    const n = 1 - Math.exp(-t * i);
    e.lerp(o, n);
  },
  smoothLookAt: (e, o, t, i) => {
    const n = xt.setFromRotationMatrix(Pt.lookAt(e.position, o, e.up)).normalize();
    W.copy(e.quaternion).normalize(), W.dot(n) < 0 && (n.x *= -1, n.y *= -1, n.z *= -1, n.w *= -1);
    const r = 1 - Math.exp(-t * i);
    e.quaternion.slerp(n, r).normalize();
  },
  preventCameraJitter: (e, o, t, i, n, r = i * 0.8) => {
    y.frameRateIndependentLerpVector3(e.position, o, i, n), y.smoothLookAt(e, t, r, n);
  },
  improvedCollisionCheck: (e, o, t, i = 0.5, n) => {
    E.subVectors(o, e);
    const r = E.length();
    if (r <= 0)
      return { safe: !0, position: o, obstacles: [] };
    E.multiplyScalar(1 / r), I.set(e, E), I.near = 0, I.far = r;
    const c = [], l = Tt(t);
    for (let m = 0, P = l.length; m < P; m++) {
      const w = l[m];
      if (!w || Dt(w, n)) continue;
      N.length = 0, I.intersectObject(w, !1, N);
      const g = N[0];
      g && c.push({
        object: w,
        distance: g.distance,
        point: g.point
      });
    }
    if (c.length === 0)
      return { safe: !0, position: o, obstacles: [] };
    const u = c.reduce(
      (m, P) => P.distance < m.distance ? P : m
    );
    return tt.copy(e).addScaledVector(E, Math.max(0, u.distance - i)), et.copy(tt), { safe: !1, position: et, obstacles: c };
  },
  distanceSquared: (e, o) => V.subVectors(e, o).lengthSq(),
  safeNormalize: (e) => {
    const o = e.length();
    return o > 0 ? e.divideScalar(o) : e.set(0, 0, 0);
  },
  smoothDamp: (e, o, t, i, n, r) => {
    const c = 2 / i, l = c * n, u = 1 / (1 + l + 0.48 * l * l + 0.235 * l * l * l);
    V.subVectors(e, o);
    const m = r ? r * i : 1 / 0;
    V.clampLength(0, m), U.copy(t).addScaledVector(V, c).multiplyScalar(n), t.copy(t).sub(U).multiplyScalar(u), e.copy(o).add(V.add(U).multiplyScalar(u));
  },
  calculateBounds: (e, o, t) => {
    if (!t) return e;
    const i = t.minX !== void 0 ? Math.max(t.minX, e.x) : e.x, n = t.minY !== void 0 ? Math.max(t.minY, e.y) : e.y, r = t.minZ !== void 0 ? Math.max(t.minZ, e.z) : e.z, c = t.maxX !== void 0 ? Math.min(t.maxX, i) : i, l = t.maxY !== void 0 ? Math.min(t.maxY, n) : n, u = t.maxZ !== void 0 ? Math.min(t.maxZ, r) : r;
    return V.set(c, l, u);
  },
  fastAtan2: (e, o) => o === 0 ? e > 0 ? Math.PI / 2 : e < 0 ? -Math.PI / 2 : 0 : o > 0 ? Math.atan(e / o) : Math.atan(e / o) + (e >= 0 ? Math.PI : -Math.PI),
  updateFOV: (e, o, t, i) => {
    if (!t || t <= 0) {
      if (Math.abs(o - e.fov) < 1e-4) return;
      e.fov = o, e.updateProjectionMatrix();
      return;
    }
    const n = i === void 0 ? t : 1 - Math.exp(-y.smoothingToSpeed(t) * i), r = n >= 1 ? o : a.MathUtils.lerp(e.fov, o, n);
    Math.abs(r - e.fov) < 1e-4 || (e.fov = r, e.updateProjectionMatrix());
  },
  clampPosition: (e, o) => (o && (e.y = y.clampValue(
    e.y,
    o.minY || -1 / 0,
    o.maxY || 1 / 0
  )), e),
  isPositionEqual: (e, o, t = 1e-3) => Math.abs(e.x - o.x) < t && Math.abs(e.y - o.y) < t && Math.abs(e.z - o.z) < t,
  pool: {
    vectors: [],
    getVector3: () => y.pool.vectors.pop() || new a.Vector3(),
    releaseVector3: (e) => {
      e.set(0, 0, 0), y.pool.vectors.push(e);
    }
  },
  calculateSafeDistance: (e, o, t, i) => {
    const n = e.distanceTo(o);
    return a.MathUtils.clamp(n, t, i);
  },
  isPositionValid: (e, o) => o ? e.y >= (o.minY ?? -1 / 0) && e.y <= (o.maxY ?? 1 / 0) : !0
}, v = {
  getPosition: (e) => e?.position ? e.position : Mt.set(0, 0, 0),
  getEuler: (e) => e?.euler ? e.euler : St.set(0, 0, 0),
  getVelocity: (e) => e?.velocity ? e.velocity : bt.set(0, 0, 0),
  calculateCameraOffset: (e, o, t) => {
    const { xDistance: i = 15, yDistance: n = 8, zDistance: r = 15, euler: c, mode: l = "thirdPerson" } = o, u = t ?? zt;
    switch (l) {
      case "chase":
        if (c) {
          const m = 1 / Math.SQRT2;
          return u.set(
            -i * Math.sin(c.y) * m,
            n * m,
            -r * Math.cos(c.y) * m
          );
        }
        return u.set(-i, n, -r);
      case "thirdPerson":
      default:
        return u.set(-i, n, -r);
    }
  },
  getCameraTarget: (e, o) => {
    const t = v.getPosition(e);
    return o.target || t;
  }
};
var Vt = Object.defineProperty, Et = Object.getOwnPropertyDescriptor, lt = (e, o, t, i) => {
  for (var n = Et(o, t), r = e.length - 1, c; r >= 0; r--)
    (c = e[r]) && (n = c(o, t, n) || n);
  return n && Vt(o, t, n), n;
};
class M {
  // Scratch objects reused per controller instance (one instance per CameraSystem).
  focusTarget = new a.Vector3();
  focusDirection = new a.Vector3();
  focusBasePosition = new a.Vector3();
  focusTargetPosition = new a.Vector3();
  orbitRight = new a.Vector3();
  orbitYawQuaternion = new a.Quaternion();
  orbitPitchQuaternion = new a.Quaternion();
  xAxis = new a.Vector3(1, 0, 0);
  yAxis = new a.Vector3(0, 1, 0);
  applyDefaults(o) {
    const t = this.defaultConfig, i = o.config;
    if (t.enableCollision !== void 0 && i.enableCollision === void 0 && (i.enableCollision = t.enableCollision), t.distance) {
      const n = i.distance;
      n ? (n.x === void 0 && t.distance.x !== void 0 && (n.x = t.distance.x), n.y === void 0 && t.distance.y !== void 0 && (n.y = t.distance.y), n.z === void 0 && t.distance.z !== void 0 && (n.z = t.distance.z)) : i.distance = { ...t.distance };
    }
    if (t.smoothing) {
      const n = i.smoothing;
      n ? (n.position === void 0 && t.smoothing.position !== void 0 && (n.position = t.smoothing.position), n.rotation === void 0 && t.smoothing.rotation !== void 0 && (n.rotation = t.smoothing.rotation), n.fov === void 0 && t.smoothing.fov !== void 0 && (n.fov = t.smoothing.fov)) : i.smoothing = { ...t.smoothing };
    }
  }
  calculateLookAt(o, t) {
    return v.getPosition(o.activeState);
  }
  applyOrbitOffset(o, t) {
    const i = t.config.orbitYaw ?? 0, n = t.config.orbitPitch ?? 0;
    return i === 0 && n === 0 || (i !== 0 && (this.orbitYawQuaternion.setFromAxisAngle(this.yAxis, i), o.applyQuaternion(this.orbitYawQuaternion)), n !== 0 && (this.orbitRight.crossVectors(o, this.yAxis), this.orbitRight.lengthSq() <= 1e-6 ? this.orbitRight.copy(this.xAxis) : this.orbitRight.normalize(), this.orbitPitchQuaternion.setFromAxisAngle(this.orbitRight, n), o.applyQuaternion(this.orbitPitchQuaternion))), o;
  }
  update(o, t) {
    const { camera: i, deltaTime: n, activeState: r } = o;
    if (!r) return;
    this.applyDefaults(t);
    const c = t.config;
    let l, u;
    if (c.focus && c.focusTarget) {
      const g = this.focusTarget;
      g.set(
        c.focusTarget.x,
        c.focusTarget.y,
        c.focusTarget.z
      ), u = g;
      const T = c.focusDistance || 10, z = this.focusBasePosition.copy(this.calculateTargetPosition(o, t)), p = this.focusDirection;
      p.copy(z).sub(g), p.lengthSq() === 0 && p.copy(i.position).sub(g), p.lengthSq() === 0 && p.set(1, 1, 1), p.normalize(), l = this.focusTargetPosition.copy(g).addScaledVector(p, T);
    } else
      l = this.calculateTargetPosition(o, t), u = this.calculateLookAt(o, t);
    c.enableCollision && (l = y.improvedCollisionCheck(
      u,
      l,
      o.scene,
      c.collisionMargin ?? 0.5,
      o.excludeObjects
    ).position);
    const m = c.focusLerpSpeed || 10, P = c.focus ? m : y.smoothingToSpeed(c.smoothing?.position), w = c.focus ? m * 0.8 : y.smoothingToSpeed(c.smoothing?.rotation, P * 0.8);
    y.preventCameraJitter(
      i,
      l,
      u,
      P,
      n,
      w
    ), t.config.fov && i instanceof a.PerspectiveCamera && y.updateFOV(i, t.config.fov, t.config.smoothing?.fov, n);
  }
}
lt([
  G()
], M.prototype, "calculateLookAt");
lt([
  H(),
  G()
], M.prototype, "update");
class At extends M {
  name = "thirdPerson";
  target = new a.Vector3();
  offset = new a.Vector3();
  defaultConfig = {
    distance: { x: 15, y: 8, z: 15 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: !0
  };
  calculateTargetPosition(o, t) {
    const i = v.getPosition(o.activeState), n = t.config.zoom || 1;
    return v.calculateCameraOffset(i, {
      xDistance: t.config.distance.x * n,
      yDistance: t.config.distance.y * n,
      zDistance: t.config.distance.z * n,
      mode: "thirdPerson"
    }, this.offset), this.applyOrbitOffset(this.offset, t), this.target.copy(i).add(this.offset);
  }
}
class Lt extends M {
  name = "firstPerson";
  target = new a.Vector3();
  lookAt = new a.Vector3();
  lookDirection = new a.Vector3();
  eyePosition = new a.Vector3();
  defaultConfig = {
    distance: { x: 0, y: 2, z: 0.45 },
    smoothing: { position: 0.2, rotation: 0.15, fov: 0.1 },
    enableCollision: !1
  };
  calculateTargetPosition(o, t) {
    const i = v.getPosition(o.activeState), n = v.getEuler(o.activeState), r = t.config.distance.y || this.defaultConfig.distance?.y || 2, c = t.config.distance.z || this.defaultConfig.distance?.z || 0.45, l = this.lookDirection.set(0, 0, -1);
    return n && l.applyEuler(n), this.target.set(i.x, i.y + r, i.z).addScaledVector(l, c);
  }
  calculateLookAt(o, t) {
    const i = this.eyePosition.copy(this.calculateTargetPosition(o, t)), n = v.getEuler(o.activeState), r = this.lookDirection.set(0, 0, -1);
    return n && r.applyEuler(n), this.lookAt.copy(i).add(r);
  }
}
class Ot extends M {
  name = "chase";
  target = new a.Vector3();
  offset = new a.Vector3();
  defaultConfig = {
    distance: { x: 10, y: 5, z: 10 },
    smoothing: { position: 0.15, rotation: 0.1, fov: 0.1 },
    enableCollision: !0
  };
  calculateTargetPosition(o, t) {
    const i = v.getPosition(o.activeState), n = v.getEuler(o.activeState), r = t.config.zoom || -1;
    return v.calculateCameraOffset(i, {
      xDistance: t.config.distance.x * r,
      yDistance: t.config.distance.y * r,
      zDistance: t.config.distance.z * r,
      euler: n,
      mode: "chase"
    }, this.offset), this.applyOrbitOffset(this.offset, t), this.target.copy(i).add(this.offset);
  }
}
class kt extends M {
  name = "topDown";
  target = new a.Vector3();
  offset = new a.Vector3();
  yawQuaternion = new a.Quaternion();
  pitchQuaternion = new a.Quaternion();
  topDownXAxis = new a.Vector3(1, 0, 0);
  topDownYAxis = new a.Vector3(0, 1, 0);
  defaultConfig = {
    distance: { x: 0, y: 20, z: 0 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: !1
  };
  calculateTargetPosition(o, t) {
    const i = v.getPosition(o.activeState), n = t.config.zoom || 1, r = this.offset.set(0, t.config.distance.y * n, 0), c = t.config.orbitPitch ?? 0, l = t.config.orbitYaw ?? 0;
    return c !== 0 && (this.pitchQuaternion.setFromAxisAngle(this.topDownXAxis, c), r.applyQuaternion(this.pitchQuaternion)), l !== 0 && (this.yawQuaternion.setFromAxisAngle(this.topDownYAxis, l), r.applyQuaternion(this.yawQuaternion)), this.target.copy(i).add(r);
  }
}
class Rt extends M {
  name = "isometric";
  target = new a.Vector3();
  defaultConfig = {
    distance: { x: 15, y: 15, z: 15 },
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    enableCollision: !1
  };
  calculateTargetPosition(o, t) {
    const i = v.getPosition(o.activeState), n = Math.PI / 4, r = Math.sqrt(t.config.distance.x ** 2 + t.config.distance.z ** 2);
    return this.target.set(
      i.x + Math.cos(n) * r,
      i.y + t.config.distance.y,
      i.z + Math.sin(n) * r
    );
  }
}
class It extends M {
  name = "sideScroll";
  target = new a.Vector3();
  defaultConfig = {
    distance: { x: 0, y: 5, z: 18 },
    smoothing: { position: 0.08, rotation: 0.1, fov: 0.1 },
    enableCollision: !1
  };
  calculateTargetPosition(o, t) {
    const i = v.getPosition(o.activeState);
    return this.target.set(
      i.x + t.config.distance.x,
      i.y + t.config.distance.y,
      i.z + t.config.distance.z
    );
  }
}
class _t extends M {
  name = "fixed";
  defaultPosition = new a.Vector3(0, 10, 10);
  defaultLookAt = new a.Vector3(0, 0, 0);
  defaultConfig = {
    distance: { x: 0, y: 0, z: 0 },
    smoothing: { position: 0, rotation: 0, fov: 0 },
    enableCollision: !1
  };
  calculateTargetPosition(o, t) {
    return t.config.fixedPosition || this.defaultPosition;
  }
  calculateLookAt(o, t) {
    return t.config.fixedLookAt || this.defaultLookAt;
  }
}
var Yt = Object.getOwnPropertyDescriptor, Qt = (e, o, t, i) => {
  for (var n = i > 1 ? void 0 : i ? Yt(o, t) : o, r = e.length - 1, c; r >= 0; r--)
    (c = e[r]) && (n = c(n) || n);
  return n;
};
let j = class extends Y {
  controllers = /* @__PURE__ */ new Map();
  state;
  cameraStates = /* @__PURE__ */ new Map();
  currentCameraStateName = "default";
  cameraTransitions = [];
  constructor(e) {
    super(e), this.state = this.createInitialState(e), this.registerControllers(), this.initializeCameraStates();
  }
  createInitialState(e) {
    return {
      config: _(e),
      lastUpdate: Date.now()
    };
  }
  initializeCameraStates() {
    const e = {
      name: "default",
      type: "thirdPerson",
      position: new a.Vector3(0, 5, 10),
      rotation: new a.Euler(0, 0, 0),
      fov: 75,
      config: {
        distance: { x: 15, y: 8, z: 15 },
        height: 5,
        followSpeed: 0.1,
        rotationSpeed: 0.1
      },
      priority: 0,
      tags: []
    };
    this.cameraStates.set("default", e);
  }
  registerController(e) {
    this.controllers.set(e.name, e);
  }
  updateConfig(e) {
    super.updateConfig(e), this.state.config = this.getConfig();
  }
  update(e) {
    this.trackFrameMetrics(e);
  }
  calculate(e) {
    try {
      const o = this.controllers.get(this.state.config.mode);
      if (!o) return;
      this.state.activeController = o, o.update(e, this.state);
    } catch (o) {
      this.emitError(
        "Camera calculation failed",
        o instanceof Error ? o.message : void 0
      );
    }
  }
  getCameraState(e) {
    return this.cameraStates.get(e);
  }
  getCurrentCameraState() {
    return this.cameraStates.get(this.currentCameraStateName);
  }
  addCameraState(e, o) {
    this.cameraStates.set(e, o);
  }
  setCameraTransitions(e) {
    this.cameraTransitions = e, this.cameraTransitions.length;
  }
  switchCameraState(e) {
    if (this.cameraStates.has(e)) {
      this.currentCameraStateName = e;
      const o = this.cameraStates.get(e), t = {
        mode: o.type,
        fov: o.fov
      };
      o.config.distance && (t.distance = o.config.distance), this.updateConfig(t);
    }
  }
  registerControllers() {
    this.registerController(new At()), this.registerController(new Lt()), this.registerController(new Ot()), this.registerController(new kt()), this.registerController(new Rt()), this.registerController(new It()), this.registerController(new _t());
  }
};
j = Qt([
  vt({ autoStart: !1 })
], j);
function Ft(e, o, t) {
  const i = h(null);
  i.current || (i.current = new e(o));
  const n = i.current;
  ct((u, m) => {
    n?.update(m);
  }), b(() => {
  }, [t, n]), b(() => () => {
    n?.destroy();
  }, [n]);
  const r = A((u) => {
    n?.updateConfig(u);
  }, [n]), c = A(() => n?.getState(), [n]), l = A(() => n?.getMetrics(), [n]);
  return {
    system: n,
    updateConfig: r,
    getState: c,
    getMetrics: l
  };
}
const st = 15e-4, rt = 10, at = 1e-4, Bt = -0.65, Zt = 0.85, q = (e) => {
  if (!(e instanceof HTMLElement)) return !1;
  const o = e.tagName.toLowerCase();
  return o === "input" || o === "textarea" || o === "select" || e.isContentEditable;
};
function Ut() {
  const { gl: e } = mt(), { activeState: o } = dt(), t = Z((s) => s.cameraOption), i = Z((s) => s.setCameraOption), n = Z((s) => s.mode), r = ht((s) => s.isInEditMode()), c = gt(), l = h(t);
  b(() => {
    l.current = t;
  }, [t]);
  const u = h(n);
  b(() => {
    u.current = n;
  }, [n]);
  const m = h(r);
  b(() => {
    m.current = r;
  }, [r]);
  const P = h([]), w = h(null), g = h(/* @__PURE__ */ new Set()), T = h(!1), z = h(0), p = h(0), $ = h(0), Q = h(0), ft = ut(() => ({
    mode: n?.control || "thirdPerson",
    distance: {
      x: t?.xDistance ?? 0,
      y: t?.yDistance ?? 0,
      z: t?.zDistance ?? 0
    },
    smoothing: {
      position: t?.smoothing?.position ?? 0.1,
      rotation: t?.smoothing?.rotation ?? 0.1,
      fov: t?.smoothing?.fov ?? 0.1
    },
    fov: t?.fov ?? 75,
    zoom: t?.zoom ?? 1,
    enableCollision: t?.enableCollision ?? !0,
    ...t?.collisionMargin !== void 0 ? { collisionMargin: t.collisionMargin } : {},
    orbitYaw: z.current,
    orbitPitch: p.current,
    ...t?.maxDistance !== void 0 ? { maxDistance: t.maxDistance } : {},
    ...t?.offset ? { offset: { x: t.offset.x, y: t.offset.y, z: t.offset.z } } : {},
    ...t?.target ? { lookAt: { x: t.target.x, y: t.target.y, z: t.target.z } } : {}
  }), []), { system: F, updateConfig: L } = Ft(
    j,
    ft
  ), O = A(() => {
    const s = l.current, d = u.current;
    L({
      mode: d?.control || "thirdPerson",
      distance: {
        x: s?.xDistance ?? 0,
        y: s?.yDistance ?? 0,
        z: s?.zDistance ?? 0
      },
      smoothing: {
        position: s?.smoothing?.position ?? 0.1,
        rotation: s?.smoothing?.rotation ?? 0.1,
        fov: s?.smoothing?.fov ?? 0.1
      },
      fov: s?.fov ?? 75,
      zoom: s?.zoom ?? 1,
      enableCollision: s?.enableCollision ?? !0,
      ...s?.collisionMargin !== void 0 ? { collisionMargin: s.collisionMargin } : {},
      orbitYaw: z.current,
      orbitPitch: p.current,
      ...s?.maxDistance !== void 0 ? { maxDistance: s.maxDistance } : {},
      ...s?.offset ? { offset: { x: s.offset.x, y: s.offset.y, z: s.offset.z } } : {},
      ...s?.target ? { lookAt: { x: s.target.x, y: s.target.y, z: s.target.z } } : {},
      ...s?.focus !== void 0 ? { focus: s.focus } : {},
      ...s?.focusTarget ? { focusTarget: { x: s.focusTarget.x, y: s.focusTarget.y, z: s.focusTarget.z } } : { focusTarget: void 0 },
      ...s?.focusDistance !== void 0 ? { focusDistance: s.focusDistance } : {},
      ...s?.focusLerpSpeed !== void 0 ? { focusLerpSpeed: s.focusLerpSpeed } : {}
    });
  }, [L]), B = A((s) => {
    const d = l.current;
    if (!d?.enableZoom) return;
    s.preventDefault();
    const C = d.zoomSpeed || 1e-3, S = d.minZoom || 0.45, x = d.maxZoom || 2.4, k = d.zoom || 1, D = s.deltaY * C, R = Math.min(Math.max(k + D, S), x);
    i({ zoom: R });
  }, [i]);
  return b(() => {
    const s = e.domElement;
    if (t?.enableZoom)
      return s.addEventListener("wheel", B, { passive: !1 }), () => {
        s.removeEventListener("wheel", B);
      };
  }, [e, B, t?.enableZoom]), b(() => {
    const s = e.domElement, d = (f) => {
      q(f.target) || (f.code === "ControlLeft" || f.code === "ControlRight") && g.current.add(f.code);
    }, C = (f) => {
      f.code !== "ControlLeft" && f.code !== "ControlRight" || g.current.delete(f.code);
    }, S = (f) => {
      !m.current || q(f.target) || f.button !== 1 && f.button !== 2 || (f.preventDefault(), T.current = !0);
    }, x = (f) => {
      f.button !== 1 && f.button !== 2 || (T.current = !1);
    }, k = (f) => {
      !(g.current.size > 0 || T.current) || q(f.target) || f.movementX === 0 && f.movementY === 0 || ($.current -= f.movementX * st, Q.current = a.MathUtils.clamp(
        Q.current + f.movementY * st,
        Bt,
        Zt
      ));
    }, D = () => {
      g.current.clear(), T.current = !1;
    }, R = (f) => {
      m.current && f.preventDefault();
    };
    return window.addEventListener("keydown", d), window.addEventListener("keyup", C), window.addEventListener("mousemove", k), window.addEventListener("mouseup", x), window.addEventListener("blur", D), document.addEventListener("visibilitychange", D), s.addEventListener("mousedown", S), s.addEventListener("contextmenu", R), () => {
      window.removeEventListener("keydown", d), window.removeEventListener("keyup", C), window.removeEventListener("mousemove", k), window.removeEventListener("mouseup", x), window.removeEventListener("blur", D), document.removeEventListener("visibilitychange", D), s.removeEventListener("mousedown", S), s.removeEventListener("contextmenu", R);
    };
  }, [e, L]), b(() => {
    const s = (d) => {
      const C = l.current;
      d.key === "Escape" && C?.focus && i({ focus: !1 });
    };
    if (t?.enableFocus && !r)
      return window.addEventListener("keydown", s), () => {
        window.removeEventListener("keydown", s);
      };
  }, [t?.enableFocus, r, i]), J(() => {
    c.updateMouse({ isLookAround: !1 }), O();
  }, [c, O]), J(() => {
    O();
  }, [t, n, O]), ct((s, d) => {
    if (!F) return;
    const C = a.MathUtils.damp(
      z.current,
      $.current,
      rt,
      d
    ), S = a.MathUtils.damp(
      p.current,
      Q.current,
      rt,
      d
    );
    if ((Math.abs(C - z.current) > at || Math.abs(S - p.current) > at) && (z.current = C, p.current = S, L({
      orbitYaw: C,
      orbitPitch: S
    })), !w.current)
      w.current = {
        camera: s.camera,
        scene: s.scene,
        deltaTime: d,
        activeState: o,
        clock: s.clock,
        excludeObjects: P.current
      };
    else {
      const x = w.current;
      x.camera = s.camera, x.scene = s.scene, x.deltaTime = d, x.activeState = o, x.clock = s.clock;
    }
    F.calculate(w.current);
  }), {
    system: F
  };
}
function $t() {
  return Ut(), null;
}
function Jt() {
  const e = h(null), o = h(null), t = h(null), i = h(null);
  return {
    outerGroupRef: e,
    innerGroupRef: o,
    rigidBodyRef: t,
    colliderRef: i
  };
}
export {
  $t as C,
  j as a,
  Jt as u
};
