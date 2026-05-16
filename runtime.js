import "reflect-metadata";
import { c as le, n as de, a as ue, p as fe, D as pe } from "./index-gasA93-x.js";
import { B as Et, d as Ot, F as It, R as jt, T as Dt, g as xt, b as Bt, e as Tt, f as Ut, h as Ct, u as Mt, i as At } from "./index-gasA93-x.js";
import { s as Gt } from "./runtimeFilter-CS35UPHd.js";
import { $ as ye, a0 as ge, a1 as me, a2 as he, a3 as ve, a4 as be, Z as Y, a5 as Se, _ as D } from "./index-DmHVuHAr.js";
import { T as zt, a6 as Lt, a7 as Nt } from "./index-DmHVuHAr.js";
import * as V from "three";
import { H as E, P as O, R as Re, u as I, B as we, T as ee, a as Ee } from "./gaesupStore-x2iiDzsY.js";
import { G as kt, W as Wt, a as $t, W as Vt } from "./index-BzhEldhU.js";
import { jsx as f, jsxs as j, Fragment as Oe } from "react/jsx-runtime";
import { u as x } from "./index-C8EsdkFS.js";
import { useCallback as S, useEffect as N, memo as te, useState as Ie, useRef as je, useMemo as De } from "react";
import { useFrame as xe } from "@react-three/fiber";
import { vec3 as J, euler as Be, RigidBody as Te, CapsuleCollider as Ue } from "@react-three/rapier";
import { D as Kt, I as Ht, L as Zt, S as qt, W as Xt, c as Qt, g as Yt } from "./index-D7BDts2W.js";
class M {
  cellSize;
  cells = /* @__PURE__ */ new Map();
  objectPositions = /* @__PURE__ */ new Map();
  constructor(e = {}) {
    this.cellSize = e.cellSize ?? 10;
  }
  static zigZag(e) {
    return e >= 0 ? e * 2 : -e * 2 - 1;
  }
  static pair(e, r) {
    const a = M.zigZag(e), s = M.zigZag(r), n = a + s;
    return n * (n + 1) / 2 + s;
  }
  getCellKey(e, r) {
    const a = Math.floor(e / this.cellSize), s = Math.floor(r / this.cellSize);
    return M.pair(a, s);
  }
  add(e, r) {
    this.remove(e);
    const a = this.getCellKey(r.x, r.z);
    this.cells.has(a) || this.cells.set(a, /* @__PURE__ */ new Set()), this.cells.get(a).add(e), this.objectPositions.set(e, r.clone());
  }
  remove(e) {
    const r = this.objectPositions.get(e);
    if (r) {
      const a = this.getCellKey(r.x, r.z), s = this.cells.get(a);
      s && (s.delete(e), s.size === 0 && this.cells.delete(a)), this.objectPositions.delete(e);
    }
  }
  update(e, r) {
    const a = this.objectPositions.get(e);
    if (!a) {
      this.add(e, r);
      return;
    }
    if (a.equals(r)) return;
    const s = this.getCellKey(a.x, a.z), n = this.getCellKey(r.x, r.z);
    if (s !== n) {
      const i = this.cells.get(s);
      i && (i.delete(e), i.size === 0 && this.cells.delete(s));
      const o = this.cells.get(n) ?? /* @__PURE__ */ new Set();
      o.add(e), this.cells.set(n, o);
    }
    a.copy(r);
  }
  getNearby(e, r, a) {
    const s = a ?? [];
    a && (a.length = 0);
    const n = Math.ceil(r / this.cellSize), i = Math.floor(e.x / this.cellSize), o = Math.floor(e.z / this.cellSize), l = r * r;
    for (let d = i - n; d <= i + n; d++)
      for (let u = o - n; u <= o + n; u++) {
        const g = M.pair(d, u), y = this.cells.get(g);
        if (y)
          for (const h of y) {
            const m = this.objectPositions.get(h);
            if (!m) continue;
            const B = e.x - m.x, T = e.y - m.y, U = e.z - m.z;
            B * B + T * T + U * U <= l && s.push(h);
          }
      }
    return s;
  }
  clear() {
    this.cells.clear(), this.objectPositions.clear();
  }
  get size() {
    return this.objectPositions.size;
  }
}
var Ce = Object.defineProperty, Me = Object.getOwnPropertyDescriptor, F = (t, e, r, a) => {
  for (var s = a > 1 ? void 0 : a ? Me(e, r) : e, n = t.length - 1, i; n >= 0; n--)
    (i = t[n]) && (s = (a ? i(e, r, s) : i(s)) || s);
  return a && s && Ce(e, r, s), s;
};
let A = class {
  objects = /* @__PURE__ */ new Map();
  interactionEvents = [];
  spatial = new M({ cellSize: 10 });
  raycaster = new V.Raycaster();
  tempVector = new V.Vector3();
  nearbyIds = [];
  nearbyIds2 = [];
  async init() {
  }
  update(t) {
  }
  dispose() {
    this.cleanup();
  }
  addObject(t) {
    this.objects.set(t.id, t), this.spatial.add(t.id, t.position);
  }
  removeObject(t) {
    return this.objects.get(t) && this.spatial.remove(t), this.objects.delete(t);
  }
  getObject(t) {
    return this.objects.get(t);
  }
  getAllObjects() {
    return Array.from(this.objects.values());
  }
  getObjectsByType(t) {
    return this.getAllObjects().filter((e) => e.type === t);
  }
  updateObject(t, e) {
    const r = this.objects.get(t);
    return r ? (Object.assign(r, e), e.position && this.spatial.update(t, e.position), !0) : !1;
  }
  getObjectsInRadius(t, e) {
    const r = this.spatial.getNearby(t, e, this.nearbyIds), a = [];
    for (const s of r) {
      const n = this.objects.get(s);
      n && a.push(n);
    }
    return a;
  }
  checkCollisions(t) {
    const e = this.objects.get(t);
    if (!e || !e.boundingBox) return [];
    const r = e.boundingBox.max.distanceTo(e.boundingBox.min), a = this.spatial.getNearby(e.position, r, this.nearbyIds2), s = [];
    for (const n of a) {
      if (n === t) continue;
      const i = this.objects.get(n);
      !i || !i.boundingBox || e.boundingBox.intersectsBox(i.boundingBox) && s.push(i);
    }
    return s;
  }
  processInteraction(t) {
    this.interactionEvents.push(t), this.interactionEvents.length > 1e3 && (this.interactionEvents = this.interactionEvents.slice(-500));
  }
  getRecentEvents(t = 1e3) {
    const e = Date.now();
    return this.interactionEvents.filter(
      (r) => e - r.timestamp <= t
    );
  }
  raycast(t, e, r = 100) {
    this.raycaster.set(t, e), this.raycaster.near = 0, this.raycaster.far = r;
    const a = this.spatial.getNearby(t, r, this.nearbyIds);
    for (const s of a) {
      const n = this.objects.get(s);
      if (n && n.boundingBox) {
        const i = this.raycaster.ray.intersectBox(n.boundingBox, this.tempVector);
        if (i)
          return {
            object: n,
            distance: t.distanceTo(i),
            point: i.clone()
          };
      }
    }
    return null;
  }
  cleanup() {
    this.objects.clear(), this.interactionEvents.length = 0, this.spatial.clear();
  }
};
F([
  E()
], A.prototype, "init", 1);
F([
  O(),
  E()
], A.prototype, "update", 1);
F([
  E()
], A.prototype, "dispose", 1);
A = F([
  Re("world")
], A);
var Ae = Object.defineProperty, Pe = Object.getOwnPropertyDescriptor, $ = (t, e, r, a) => {
  for (var s = a > 1 ? void 0 : a ? Pe(e, r) : e, n = t.length - 1, i; n >= 0; n--)
    (i = t[n]) && (s = (a ? i(e, r, s) : i(s)) || s);
  return a && s && Ae(e, r, s), s;
};
let L = class extends ye {
  buildEngine(t, e) {
    const r = new A(), a = {
      ...e?.selectedObjectId !== void 0 ? { selectedObjectId: e.selectedObjectId } : {},
      interactionMode: e?.interactionMode ?? "view",
      showDebugInfo: e?.showDebugInfo ?? !1
    };
    return {
      system: r,
      state: a,
      dispose: () => r.dispose()
    };
  }
  executeCommand(t, e, r) {
    const { system: a, state: s } = t;
    switch (e.type) {
      case "addObject":
        const { id: n, ...i } = e.data, o = typeof n == "string" && n.length > 0 ? n : this.generateId(), l = { ...i, id: o };
        a.addObject(l);
        break;
      case "removeObject":
        a.removeObject(e.data.id), s.selectedObjectId === e.data.id && delete s.selectedObjectId;
        break;
      case "updateObject":
        a.updateObject(e.data.id, e.data.updates);
        break;
      case "selectObject":
        e.data.id !== void 0 ? s.selectedObjectId = e.data.id : delete s.selectedObjectId;
        break;
      case "setInteractionMode":
        s.interactionMode = e.data.mode;
        break;
      case "toggleDebugInfo":
        s.showDebugInfo = !s.showDebugInfo;
        break;
      case "interact":
        const d = a.getObject(e.data.objectId);
        if (d && d.canInteract) {
          const u = {
            type: "custom",
            object1Id: e.data.objectId,
            timestamp: Date.now(),
            data: { action: e.data.action }
          };
          a.processInteraction(u);
        }
        break;
      case "cleanup":
        a.cleanup(), delete s.selectedObjectId, s.interactionMode = "view", s.showDebugInfo = !1;
        break;
    }
  }
  // 60fps 캐싱
  createSnapshot(t, e) {
    const { system: r, state: a } = t;
    return {
      objects: r.getAllObjects(),
      ...a.selectedObjectId !== void 0 ? { selectedObjectId: a.selectedObjectId } : {},
      interactionMode: a.interactionMode,
      showDebugInfo: a.showDebugInfo,
      events: r.getRecentEvents(),
      // 추가 조회 기능들을 함수로 제공
      objectsInRadius: (s, n) => r.getObjectsInRadius(s, n),
      objectsByType: (s) => r.getObjectsByType(s),
      raycast: (s, n) => r.raycast(s, n)?.object || null
    };
  }
  // 편의 메서드들 (기존 API 호환성 유지)
  addObject(t, e) {
    const r = e.id, a = typeof r == "string" && r.length > 0 ? r : this.generateId();
    return this.execute(t, { type: "addObject", data: { ...e, id: a } }), a;
  }
  removeObject(t, e) {
    this.execute(t, { type: "removeObject", data: { id: e } });
  }
  updateObject(t, e, r) {
    this.execute(t, { type: "updateObject", data: { id: e, updates: r } });
  }
  selectObject(t, e) {
    this.execute(
      t,
      { type: "selectObject", data: e !== void 0 ? { id: e } : {} }
    );
  }
  setInteractionMode(t, e) {
    this.execute(t, { type: "setInteractionMode", data: { mode: e } });
  }
  toggleDebugInfo(t) {
    this.execute(t, { type: "toggleDebugInfo" });
  }
  interact(t, e, r) {
    this.execute(t, { type: "interact", data: { objectId: e, action: r } });
  }
  cleanup(t) {
    this.execute(t, { type: "cleanup" });
  }
  // 조회 메서드들
  getObjectsInRadius(t, e, r) {
    const a = this.getEngine(t);
    return a ? a.system.getObjectsInRadius(e, r) : [];
  }
  getObjectsByType(t, e) {
    const r = this.getEngine(t);
    return r ? r.system.getObjectsByType(e) : [];
  }
  raycast(t, e, r) {
    const a = this.getEngine(t);
    return a && a.system.raycast(e, r)?.object || null;
  }
  generateId() {
    return `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
$([
  ge()
], L.prototype, "executeCommand", 1);
$([
  me(),
  he(16)
], L.prototype, "createSnapshot", 1);
L = $([
  ve("world"),
  be()
], L);
const Ge = {
  isRiderOn: !1,
  position: J(),
  rotation: Be(),
  offset: J(),
  visible: !0
};
function _e() {
  const { gameStates: t, updateGameStates: e, activeState: r } = Y(), a = I((c) => c.rideable), s = I((c) => c.urls), n = I((c) => c.setMode), i = I((c) => c.setRideable), o = I((c) => c.setUrls), { getSizesByUrls: l } = Se(), d = S(
    (c) => c === "airplane" ? "airplane" : "vehicle",
    []
  ), u = S(
    (c) => {
      const p = {}, w = c.ridingUrl ?? s.characterUrl;
      if (typeof w == "string" && w.length > 0 && (p.ridingUrl = w), c.objectType === "airplane") {
        p.airplaneUrl = c.url ?? "", o(p);
        return;
      }
      c.objectType && (p.vehicleUrl = c.url ?? "", p.wheelUrl = c.wheelUrl ?? ""), o(p);
    },
    [o, s]
  ), g = S(
    (c) => {
      const p = a[c];
      if (!p?.position) return;
      const w = p.objectType, { vehicleUrl: ie, airplaneUrl: oe, characterUrl: ce } = l({ ...s });
      !(w === "airplane" ? oe : ie) || !ce || (e({
        canRide: !1,
        isRiding: !1,
        currentRideable: void 0
      }), i(c, {
        ...p,
        visible: !0,
        position: r.position.clone()
      }));
    },
    [
      a,
      l,
      s,
      e,
      i,
      r.position
    ]
  ), y = S(async () => {
    if (t.canRide && t.nearbyRideable && !t.isRiding) {
      const { objectkey: c, objectType: p } = t.nearbyRideable, w = a[c];
      if (!w) return;
      u(w), n({ type: d(p) }), e({
        currentRideable: t.nearbyRideable,
        isRiding: !0,
        canRide: !1,
        nearbyRideable: void 0
      }), i(c, {
        ...w,
        visible: !1
      });
    }
  }, [
    t.canRide,
    t.nearbyRideable,
    t.isRiding,
    a,
    u,
    n,
    d,
    e,
    i
  ]), h = S(async () => {
    t.isRiding && t.currentRideable && (g(t.currentRideable.objectkey), n({ type: "character" }), e({
      isRiding: !1,
      currentRideable: void 0
    }));
  }, [t.isRiding, t.currentRideable, g, n, e]);
  N(() => {
    const c = (p) => {
      p.code === "KeyF" && (t.canRide && t.nearbyRideable ? y() : t.isRiding && h());
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [
    t.canRide,
    t.nearbyRideable,
    t.isRiding,
    y,
    h
  ]);
  const m = S(
    (c) => {
      i(c.objectkey, {
        ...Ge,
        ...c
      });
    },
    [i]
  ), B = S(
    (c) => {
      i(c.objectkey, c);
    },
    [i]
  ), T = (c) => a[c], U = S(
    async (c, p) => {
      if ((c.other.rigidBodyObject && c.other.rigidBodyObject.name === "character" || c.other.rigidBodyObject && !c.other.rigidBodyObject.name || c.other.rigidBody) && !t.isRiding) {
        if (!p.objectType) return;
        e({
          nearbyRideable: {
            id: p.objectkey,
            objectkey: p.objectkey,
            objectType: p.objectType,
            type: "rideable",
            maxSpeed: 0,
            acceleration: 0,
            deceleration: 0,
            isOccupied: !1,
            controls: {
              forward: !1,
              backward: !1,
              left: !1,
              right: !1,
              brake: !1
            },
            name: p.objectType === "vehicle" ? "차량" : "비행기",
            ...p.rideMessage ? { rideMessage: p.rideMessage } : {},
            ...p.exitMessage ? { exitMessage: p.exitMessage } : {},
            ...p.displayName ? { displayName: p.displayName } : {}
          },
          canRide: !0
        });
      }
    },
    [t.isRiding, e]
  ), _ = S(
    async (c) => {
      (c.other.rigidBodyObject && c.other.rigidBodyObject.name === "character" || c.other.rigidBodyObject && !c.other.rigidBodyObject.name || c.other.rigidBody) && e({
        nearbyRideable: void 0,
        canRide: !1
      });
    },
    [e]
  );
  return {
    initRideable: m,
    updateRideable: B,
    getRideable: T,
    onRideableNear: U,
    onRideableLeave: _,
    enterRideable: y,
    exitRideable: h,
    landing: g
  };
}
const b = "default", yt = (t) => {
  const e = we.getOrCreate("world");
  if (e) {
    e.register(b);
    const r = e;
    r.__gaesupWorldSliceUnsubscribe?.(), r.__gaesupWorldSliceUnsubscribe = e.subscribe((a) => {
      t({
        objects: a.objects,
        selectedObjectId: a.selectedObjectId,
        interactionMode: a.interactionMode,
        showDebugInfo: a.showDebugInfo,
        events: a.events,
        loading: !1,
        error: void 0
      });
    });
  }
  return {
    objects: [],
    selectedObjectId: void 0,
    interactionMode: "view",
    showDebugInfo: !1,
    events: [],
    loading: !1,
    error: void 0,
    addObject: (r) => {
      if (!e) return "";
      t({ loading: !0, error: void 0 });
      try {
        const a = e.addObject(b, r);
        return t({ loading: !1 }), a;
      } catch (a) {
        return t({
          loading: !1,
          error: a instanceof Error ? a.message : "Unknown error"
        }), "";
      }
    },
    removeObject: (r) => {
      if (!e) return !1;
      t({ loading: !0, error: void 0 });
      try {
        return e.removeObject(b, r), t({ loading: !1 }), !0;
      } catch (a) {
        return t({
          loading: !1,
          error: a instanceof Error ? a.message : "Unknown error"
        }), !1;
      }
    },
    updateObject: (r, a) => {
      if (!e) return !1;
      t({ loading: !0, error: void 0 });
      try {
        return e.updateObject(b, r, a), t({ loading: !1 }), !0;
      } catch (s) {
        return t({
          loading: !1,
          error: s instanceof Error ? s.message : "Unknown error"
        }), !1;
      }
    },
    selectObject: (r) => {
      e && e.selectObject(b, r);
    },
    setInteractionMode: (r) => {
      e && e.setInteractionMode(b, r);
    },
    toggleDebugInfo: () => {
      e && e.toggleDebugInfo(b);
    },
    setLoading: (r) => {
      t({ loading: r });
    },
    setError: (r) => {
      t({ error: r });
    },
    clearEvents: () => {
      t({ events: [] });
    },
    // 브릿지 인스턴스 접근 (고급 사용자용)
    getBridge: () => e,
    // 추가 조회 기능들
    getObjectsInRadius: (r, a) => e ? e.getObjectsInRadius(b, r, a) : [],
    getObjectsByType: (r) => e ? e.getObjectsByType(b, r) : [],
    raycast: (r, a) => e ? e.raycast(b, r, a) : null,
    interact: (r, a) => {
      e && e.interact(b, r, a);
    },
    cleanup: () => {
      e && e.cleanup(b);
    }
  };
};
var ze = Object.defineProperty, Le = Object.getOwnPropertyDescriptor, R = (t, e, r, a) => {
  for (var s = Le(e, r), n = t.length - 1, i; n >= 0; n--)
    (i = t[n]) && (s = i(e, r, s) || s);
  return s && ze(e, r, s), s;
};
const Ne = "1.0.0", C = "gaesup_world_save_", P = "base64-json:", re = "gaesup-world:gzip-json:v1";
class v {
  version;
  storage;
  fileWriter;
  now;
  constructor(e = {}) {
    this.version = e.version ?? Ne, this.storage = e.storage, this.fileWriter = e.fileWriter, this.now = e.now ?? Date.now;
  }
  // 5초 타임아웃
  async save(e, r, a = {}) {
    try {
      const s = this.createSaveData(e, r, a);
      return a.compress ? await this.saveCompressed(s) : await this.saveUncompressed(s);
    } catch (s) {
      return {
        success: !1,
        error: s instanceof Error ? s.message : "Unknown error occurred"
      };
    }
  }
  async load(e, r = {}) {
    try {
      const a = `${C}${e}`, s = this.getStorage().getItem(a);
      if (!s)
        throw new Error(`Save data not found: ${e}`);
      const n = await this.parseStoredSaveData(s);
      if (!this.validateSaveData(n))
        throw new Error("Invalid save data format");
      return {
        success: !0,
        data: {
          ...n,
          world: this.filterWorldData(n.world, r)
        }
      };
    } catch (a) {
      return {
        success: !1,
        error: a instanceof Error ? a.message : "Failed to load save data"
      };
    }
  }
  async saveToFile(e, r, a, s = {}) {
    try {
      const n = this.createSaveData(e, a, s);
      return await this.writeFile(r, n), { success: !0, data: n };
    } catch (n) {
      return {
        success: !1,
        error: n instanceof Error ? n.message : "Failed to save file"
      };
    }
  }
  async loadFromFile(e, r = {}) {
    try {
      const a = await e.text(), s = JSON.parse(a);
      if (!this.validateSaveData(s))
        throw new Error("Invalid save file format");
      return {
        success: !0,
        data: {
          ...s,
          world: this.filterWorldData(s.world, r)
        }
      };
    } catch (a) {
      return {
        success: !1,
        error: a instanceof Error ? a.message : "Failed to load file"
      };
    }
  }
  listSaves() {
    const e = [];
    let r;
    try {
      r = this.getStorage();
    } catch (a) {
      return console.error("Failed to list saves:", a), e;
    }
    for (let a = 0; a < r.length; a++) {
      const s = r.key(a);
      if (s && s.startsWith(C))
        try {
          const n = s.substring(C.length), i = r.getItem(s);
          if (i) {
            const o = this.parseStoredSaveDataSync(i);
            e.push({
              id: n,
              timestamp: o.timestamp,
              ...o.metadata ? { metadata: o.metadata } : {}
            });
          }
        } catch (n) {
          console.error(`Failed to parse save: ${s}`, n);
        }
    }
    return e.sort((a, s) => s.timestamp - a.timestamp);
  }
  deleteSave(e) {
    try {
      const r = `${C}${e}`;
      return this.getStorage().removeItem(r), !0;
    } catch (r) {
      return console.error("Failed to delete save:", r), !1;
    }
  }
  filterWorldData(e, r) {
    const a = { ...e };
    return r.includeBuildings === !1 && (a.buildings = {
      wallGroups: [],
      tileGroups: [],
      blocks: [],
      meshes: []
    }), r.includeNPCs === !1 && (a.npcs = []), r.includeEnvironment === !1 && (a.environment = {
      lighting: {
        ambientIntensity: 1,
        directionalIntensity: 1,
        directionalPosition: { x: 0, y: 10, z: 0 }
      }
    }), r.includeCamera === !1 && delete a.camera, a;
  }
  createSaveData(e, r, a = {}) {
    const s = this.now();
    return {
      version: this.version,
      timestamp: s,
      world: this.filterWorldData(e, a),
      ...r ? {
        metadata: {
          ...r,
          createdAt: r.createdAt || s,
          updatedAt: s
        }
      } : {}
    };
  }
  getStorage() {
    if (this.storage) return this.storage;
    if (typeof localStorage > "u")
      throw new Error("Legacy save storage is not available in this environment");
    return localStorage;
  }
  async writeFile(e, r) {
    if (this.fileWriter) {
      await this.fileWriter(e, r);
      return;
    }
    if (typeof document > "u" || typeof URL > "u" || typeof Blob > "u")
      throw new Error("File download is not available in this environment");
    const a = new Blob(
      [JSON.stringify(r, null, 2)],
      { type: "application/json" }
    ), s = URL.createObjectURL(a), n = document.createElement("a");
    n.href = s, n.download = e.endsWith(".json") ? e : `${e}.json`, document.body.appendChild(n), n.click(), document.body.removeChild(n), URL.revokeObjectURL(s);
  }
  async saveUncompressed(e) {
    const r = `${e.world.id}_${e.timestamp}`, a = `${C}${r}`;
    try {
      return this.getStorage().setItem(a, JSON.stringify(e)), { success: !0, data: e };
    } catch (s) {
      throw s instanceof Error && s.name === "QuotaExceededError" ? new Error("Storage quota exceeded. Please delete some saves.") : s;
    }
  }
  async saveCompressed(e) {
    const r = await this.compressData(e), a = `${e.world.id}_${e.timestamp}`, s = `${C}${a}`;
    try {
      return this.getStorage().setItem(s, r), { success: !0, data: e };
    } catch (n) {
      throw n instanceof Error && n.name === "QuotaExceededError" ? new Error("Storage quota exceeded. Please delete some saves.") : n;
    }
  }
  async compressData(e) {
    const r = JSON.stringify(e);
    if (!Z())
      return `${P}${K(H(r))}`;
    const a = await this.gzipBytes(H(r)), s = {
      encoding: re,
      version: e.version,
      timestamp: e.timestamp,
      worldId: e.world.id,
      worldName: e.world.name,
      ...e.metadata ? { metadata: e.metadata } : {},
      payload: K(a)
    };
    return JSON.stringify(s);
  }
  async decompressData(e) {
    const r = ae(e), a = await this.gunzipBytes(r), s = se(a);
    return JSON.parse(s);
  }
  async parseStoredSaveData(e) {
    if (e.startsWith("{")) {
      const r = JSON.parse(e);
      return q(r) ? this.decompressData(r.payload) : r;
    }
    return e.startsWith(P) ? z(e.slice(P.length)) : z(e);
  }
  parseStoredSaveDataSync(e) {
    if (e.startsWith("{")) {
      const r = JSON.parse(e);
      return q(r) ? {
        version: r.version,
        timestamp: r.timestamp,
        world: {
          id: r.worldId,
          name: r.worldName,
          buildings: { wallGroups: [], tileGroups: [], blocks: [], meshes: [] },
          npcs: [],
          environment: {
            lighting: {
              ambientIntensity: 1,
              directionalIntensity: 1,
              directionalPosition: { x: 0, y: 10, z: 0 }
            }
          }
        },
        ...r.metadata ? { metadata: r.metadata } : {}
      } : r;
    }
    return e.startsWith(P) ? z(e.slice(P.length)) : z(e);
  }
  async gzipBytes(e) {
    if (!Z())
      return e;
    const r = new Blob([e]).stream().pipeThrough(new CompressionStream("gzip"));
    return new Uint8Array(await new Response(r).arrayBuffer());
  }
  async gunzipBytes(e) {
    if (!Fe())
      return e;
    const r = new Blob([e]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Uint8Array(await new Response(r).arrayBuffer());
  }
  validateSaveData(e) {
    return e !== null && typeof e == "object" && "version" in e && "timestamp" in e && "world" in e && typeof e.version == "string" && typeof e.timestamp == "number" && e.world && typeof e.world.id == "string" && typeof e.world.name == "string";
  }
}
R([
  E(),
  O(),
  ee(5e3)
], v.prototype, "save");
R([
  E(),
  O(),
  ee(5e3)
], v.prototype, "load");
R([
  E(),
  O()
], v.prototype, "saveToFile");
R([
  E(),
  O()
], v.prototype, "loadFromFile");
R([
  Ee(10)
], v.prototype, "listSaves");
R([
  E()
], v.prototype, "deleteSave");
R([
  O()
], v.prototype, "filterWorldData");
R([
  O()
], v.prototype, "createSaveData");
R([
  E()
], v.prototype, "saveUncompressed");
R([
  E()
], v.prototype, "saveCompressed");
R([
  O()
], v.prototype, "compressData");
R([
  O()
], v.prototype, "decompressData");
function K(t) {
  let e = "";
  for (let a = 0; a < t.length; a += 32768)
    e += String.fromCharCode(...t.subarray(a, a + 32768));
  return btoa(e);
}
function ae(t) {
  const e = atob(t), r = new Uint8Array(e.length);
  for (let a = 0; a < e.length; a += 1)
    r[a] = e.charCodeAt(a);
  return r;
}
function z(t) {
  return JSON.parse(se(ae(t)));
}
function H(t) {
  if (typeof TextEncoder < "u")
    return new TextEncoder().encode(t);
  const e = unescape(encodeURIComponent(t)), r = new Uint8Array(e.length);
  for (let a = 0; a < e.length; a += 1)
    r[a] = e.charCodeAt(a);
  return r;
}
function se(t) {
  if (typeof TextDecoder < "u")
    return new TextDecoder().decode(t);
  let e = "";
  const r = 32768;
  for (let a = 0; a < t.length; a += r)
    e += String.fromCharCode(...t.subarray(a, a + r));
  return decodeURIComponent(escape(e));
}
function Z() {
  return typeof CompressionStream < "u" && typeof Blob < "u" && typeof Response < "u" && typeof new Blob().stream == "function";
}
function Fe() {
  return typeof DecompressionStream < "u" && typeof Blob < "u" && typeof Response < "u" && typeof new Blob().stream == "function";
}
function q(t) {
  if (!t || typeof t != "object") return !1;
  const e = t;
  return e.encoding === re && typeof e.version == "string" && typeof e.timestamp == "number" && typeof e.worldId == "string" && typeof e.worldName == "string" && typeof e.payload == "string";
}
const ke = () => ({});
function X(t, e, r) {
  const { buildingStore: a, npcStore: s, cameraStore: n } = t;
  if (!a)
    throw new Error("Building store not initialized");
  const i = a.getState(), o = n?.getState(), l = o ? {
    position: o.position,
    rotation: o.rotation,
    mode: o.mode,
    ...o.settings ? { settings: o.settings } : {}
  } : void 0;
  return {
    id: e,
    name: r,
    buildings: {
      wallGroups: Array.from(i.wallGroups.values()),
      tileGroups: Array.from(i.tileGroups.values()),
      blocks: Array.from(i.blocks),
      meshes: Array.from(i.meshes.values())
    },
    npcs: s ? Array.from(s.getState().instances.values()) : [],
    environment: pe,
    ...l ? { camera: l } : {}
  };
}
function We(t, e) {
  if (!t || !e) return;
  const r = t.getState();
  if (typeof r.hydrate == "function") {
    r.hydrate(e);
    return;
  }
  r.wallGroups.clear(), r.tileGroups.clear(), r.meshes.clear(), r.blocks = [], e.wallGroups.forEach((a) => {
    r.wallGroups.set(a.id, a);
  }), e.tileGroups.forEach((a) => {
    r.tileGroups.set(a.id, a);
  }), e.meshes.forEach((a) => {
    r.meshes.set(a.id, a);
  }), r.blocks = [...e.blocks ?? []];
}
function $e(t, e) {
  if (!t || !e) return;
  const r = t.getState();
  r.instances.clear(), e.forEach((a) => {
    r.instances.set(a.id, a);
  });
}
function Ve(t, e) {
  !t || !e || t.setState({
    position: e.position,
    rotation: e.rotation,
    mode: e.mode,
    settings: e.settings || {}
  });
}
function Q(t, e) {
  We(t.buildingStore, e.buildings), $e(t.npcStore, e.npcs), Ve(t.cameraStore, e.camera);
}
function W(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function Je(t) {
  return t.replace(/\.json$/i, "");
}
function ne(t) {
  return W(t) && typeof t.version == "number" && typeof t.savedAt == "number" && W(t.domains);
}
function G(t) {
  return W(t) && t.kind === "gaesup.save-system" && typeof t.worldId == "string" && typeof t.worldName == "string" && ne(t.blob);
}
async function k(t) {
  return (await t.list()).map((r) => ({ id: r, timestamp: fe(r) })).sort((r, a) => a.timestamp - r.timestamp);
}
function Ke(t, e) {
  if (typeof document > "u" || typeof URL > "u" || typeof Blob > "u")
    throw new Error("File download is not available in this environment");
  const r = new Blob([JSON.stringify(e, null, 2)], { type: "application/json" }), a = URL.createObjectURL(r), s = document.createElement("a");
  s.href = a, s.download = t.endsWith(".json") ? t : `${t}.json`, document.body.appendChild(s), s.click(), document.body.removeChild(s), URL.revokeObjectURL(a);
}
async function He(t) {
  const e = JSON.parse(await t.text());
  if (G(e) || ne(e)) return e;
  throw new Error("Invalid SaveSystem file format");
}
function Ze(t = {}) {
  const e = t.getStores ?? ke, r = t.saveSystem;
  return (a, s) => ({
    saveLoadManager: t.saveLoadManager ?? new v(),
    currentSaveId: null,
    saves: [],
    isSaving: !1,
    isLoading: !1,
    lastError: null,
    saveWorld: async (n, i, o, l) => {
      a({ isSaving: !0, lastError: null });
      try {
        if (r) {
          const g = Date.now(), y = `${n}_${g}`;
          await r.save(y), a({
            currentSaveId: y,
            saves: await k(r)
          });
          return;
        }
        const d = X(e(), n, i), u = await s().saveLoadManager.save(d, o, l);
        if (u.success) {
          const g = `${n}_${u.data.timestamp}`;
          a({ currentSaveId: g }), s().refreshSaveList();
        } else
          throw new Error(u.error);
      } catch (d) {
        throw a({ lastError: d instanceof Error ? d.message : "Save failed" }), d;
      } finally {
        a({ isSaving: !1 });
      }
    },
    loadWorld: async (n, i) => {
      a({ isLoading: !0, lastError: null });
      try {
        if (r) {
          if (!await r.load(n))
            throw new Error(`Save data not found: ${n}`);
          return a({ currentSaveId: n }), ue(r, n);
        }
        const o = await s().saveLoadManager.load(n, i);
        if (o.success && o.data)
          return Q(e(), o.data.world), a({ currentSaveId: n }), o.data;
        throw new Error(o.error);
      } catch (o) {
        return a({ lastError: o instanceof Error ? o.message : "Load failed" }), null;
      } finally {
        a({ isLoading: !1 });
      }
    },
    saveToFile: async (n, i, o, l, d) => {
      a({ isSaving: !0, lastError: null });
      try {
        if (r) {
          const y = {
            kind: "gaesup.save-system",
            version: 1,
            worldId: n,
            worldName: i,
            blob: r.createBlob(o),
            ...l ? { metadata: l } : {}
          };
          Ke(o, y);
          return;
        }
        const u = X(e(), n, i), g = await s().saveLoadManager.saveToFile(u, o, l, d);
        if (!g.success)
          throw new Error(g.error);
      } catch (u) {
        throw a({ lastError: u instanceof Error ? u.message : "Save to file failed" }), u;
      } finally {
        a({ isSaving: !1 });
      }
    },
    loadFromFile: async (n, i) => {
      a({ isLoading: !0, lastError: null });
      try {
        if (r) {
          const l = await He(n), d = G(l) ? l.blob : l;
          r.hydrateBlob(d, n.name);
          const u = G(l) ? l.worldId : Je(n.name), g = G(l) ? l.worldName : u, y = d.savedAt, h = {
            version: String(d.version),
            timestamp: y,
            world: le(d.domains, u, g)
          }, m = G(l) ? de(l.metadata, y) : void 0;
          return m ? { ...h, metadata: m } : h;
        }
        const o = await s().saveLoadManager.loadFromFile(n, i);
        if (o.success && o.data)
          return Q(e(), o.data.world), o.data;
        throw new Error(o.error);
      } catch (o) {
        return a({ lastError: o instanceof Error ? o.message : "Load from file failed" }), null;
      } finally {
        a({ isLoading: !1 });
      }
    },
    refreshSaveList: () => {
      if (r) {
        k(r).then((i) => a({ saves: i })).catch((i) => {
          a({ lastError: i instanceof Error ? i.message : "Failed to list saves" });
        });
        return;
      }
      const n = s().saveLoadManager.listSaves();
      a({ saves: n });
    },
    deleteSave: (n) => {
      if (r) {
        (async () => {
          try {
            await r.remove(n);
            const o = await k(r);
            a({
              saves: o,
              ...s().currentSaveId === n ? { currentSaveId: null } : {}
            });
          } catch (o) {
            a({ lastError: o instanceof Error ? o.message : "Failed to delete save" });
          }
        })();
        return;
      }
      s().saveLoadManager.deleteSave(n) && (s().refreshSaveList(), s().currentSaveId === n && a({ currentSaveId: null }));
    },
    clearError: () => {
      a({ lastError: null });
    }
  });
}
const gt = Ze();
function qe({
  object: t,
  selected: e = !1,
  onSelect: r,
  showDebugInfo: a = !1
}) {
  const s = x(), n = t.metadata?.airplaneUrl ?? t.metadata?.modelUrl, i = typeof n == "string" ? n : void 0;
  if (typeof i != "string" || i.length === 0) return null;
  const o = t.metadata?.ridingUrl, l = typeof o == "string" ? o : void 0, d = t.metadata?.currentAnimation, u = typeof d == "string" ? d : "idle";
  return /* @__PURE__ */ f(
    D,
    {
      url: i,
      isActive: !1,
      componentType: "airplane",
      name: `active-airplane-${t.id}`,
      position: t.position,
      rotation: t.rotation,
      scale: t.scale,
      currentAnimation: u,
      ...l ? { ridingUrl: l } : {},
      ref: s.rigidBodyRef,
      outerGroupRef: s.outerGroupRef,
      innerGroupRef: s.innerGroupRef,
      colliderRef: s.colliderRef,
      userData: {
        id: t.id,
        type: "active",
        subType: "airplane",
        health: t.health,
        maxHealth: t.maxHealth,
        energy: t.energy,
        maxEnergy: t.maxEnergy
      },
      onCollisionEnter: () => {
        r && r(t.id);
      },
      children: e && a && /* @__PURE__ */ j("mesh", { position: [0, 3, 0], children: [
        /* @__PURE__ */ f("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ f("meshStandardMaterial", { color: "#00ffff", transparent: !0, opacity: 0.6 })
      ] })
    }
  );
}
function Xe({
  object: t,
  selected: e = !1,
  onSelect: r,
  showDebugInfo: a = !1
}) {
  const s = x();
  N(() => {
    s.rigidBodyRef && s.rigidBodyRef.current && s.rigidBodyRef.current.setEnabledRotations(!1, !1, !1, !1);
  }, [s.rigidBodyRef]);
  const n = t.metadata?.characterUrl;
  if (typeof n != "string" || n.length === 0) return null;
  const i = t.metadata?.currentAnimation, o = typeof i == "string" ? i : "idle", l = t.metadata?.nameTag, d = typeof l == "string" ? l : void 0;
  return /* @__PURE__ */ f(
    D,
    {
      url: n,
      isActive: !1,
      componentType: "character",
      name: `active-character-${t.id}`,
      position: t.position,
      rotation: t.rotation,
      scale: t.scale,
      currentAnimation: o,
      ref: s.rigidBodyRef,
      outerGroupRef: s.outerGroupRef,
      innerGroupRef: s.innerGroupRef,
      colliderRef: s.colliderRef,
      userData: {
        id: t.id,
        type: "active",
        subType: "character",
        health: t.health,
        maxHealth: t.maxHealth,
        energy: t.energy,
        maxEnergy: t.maxEnergy,
        nameTag: d
      },
      onCollisionEnter: () => {
        r && r(t.id);
      },
      children: e && a && /* @__PURE__ */ j("mesh", { position: [0, 3, 0], children: [
        /* @__PURE__ */ f("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ f("meshStandardMaterial", { color: "#ff0000", transparent: !0, opacity: 0.6 })
      ] })
    }
  );
}
function Qe({
  object: t,
  selected: e = !1,
  onSelect: r,
  showDebugInfo: a = !1
}) {
  const s = x(), n = t.metadata?.vehicleUrl ?? t.metadata?.modelUrl, i = typeof n == "string" ? n : void 0;
  if (typeof i != "string" || i.length === 0) return null;
  const o = t.metadata?.ridingUrl, l = typeof o == "string" ? o : void 0, d = t.metadata?.currentAnimation, u = typeof d == "string" ? d : "idle";
  return /* @__PURE__ */ f(
    D,
    {
      url: i,
      isActive: !1,
      componentType: "vehicle",
      name: `active-vehicle-${t.id}`,
      position: t.position,
      rotation: t.rotation,
      scale: t.scale,
      currentAnimation: u,
      ...l ? { ridingUrl: l } : {},
      ref: s.rigidBodyRef,
      outerGroupRef: s.outerGroupRef,
      innerGroupRef: s.innerGroupRef,
      colliderRef: s.colliderRef,
      userData: {
        id: t.id,
        type: "active",
        subType: "vehicle",
        health: t.health,
        maxHealth: t.maxHealth,
        energy: t.energy,
        maxEnergy: t.maxEnergy
      },
      onCollisionEnter: () => {
        r && r(t.id);
      },
      children: e && a && /* @__PURE__ */ j("mesh", { position: [0, 3, 0], children: [
        /* @__PURE__ */ f("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ f("meshStandardMaterial", { color: "#0000ff", transparent: !0, opacity: 0.6 })
      ] })
    }
  );
}
function mt({
  objects: t,
  selectedId: e,
  onSelect: r,
  showDebugInfo: a = !1
}) {
  const { gameStates: s } = Y(), n = I((i) => i.mode);
  return /* @__PURE__ */ f("group", { name: "active-objects", children: t.map((i) => {
    const o = i.id === e;
    if (i.type === "character" && s?.isRiding && n?.type !== "character")
      return null;
    switch (i.type) {
      case "vehicle":
        return /* @__PURE__ */ f(
          Qe,
          {
            object: i,
            selected: o,
            ...r ? { onSelect: r } : {},
            showDebugInfo: a
          },
          i.id
        );
      case "airplane":
        return /* @__PURE__ */ f(
          qe,
          {
            object: i,
            selected: o,
            ...r ? { onSelect: r } : {},
            showDebugInfo: a
          },
          i.id
        );
      case "character":
        return /* @__PURE__ */ f(
          Xe,
          {
            object: i,
            selected: o,
            ...r ? { onSelect: r } : {},
            showDebugInfo: a
          },
          i.id
        );
      default:
        return null;
    }
  }) });
}
function Ye(t) {
  const { children: e, visible: r = !0, ...a } = t, s = x();
  return /* @__PURE__ */ f("group", { visible: r, children: /* @__PURE__ */ f(
    D,
    {
      ...a,
      url: a.url || "",
      isActive: !1,
      componentType: "vehicle",
      name: a.name ?? "vehicle",
      ref: s.rigidBodyRef,
      outerGroupRef: s.outerGroupRef,
      innerGroupRef: s.innerGroupRef,
      colliderRef: s.colliderRef,
      children: e
    }
  ) });
}
function et(t) {
  const { children: e, visible: r = !0, ...a } = t, s = x();
  return /* @__PURE__ */ f("group", { visible: r, children: /* @__PURE__ */ f(
    D,
    {
      ...a,
      url: a.url || "",
      isActive: !1,
      componentType: "airplane",
      name: a.name ?? "airplane",
      ref: s.rigidBodyRef,
      outerGroupRef: s.outerGroupRef,
      innerGroupRef: s.innerGroupRef,
      colliderRef: s.colliderRef,
      children: e
    }
  ) });
}
function ht(t) {
  const { children: e, visible: r = !0, ...a } = t, s = x();
  N(() => {
    s.rigidBodyRef && s.rigidBodyRef.current && s.rigidBodyRef.current.setEnabledRotations(!1, !1, !1, !1);
  }, [s.rigidBodyRef]);
  const n = a.controllerOptions ?? {
    lerp: {
      cameraTurn: 1,
      cameraPosition: 1
    }
  };
  return /* @__PURE__ */ f("group", { visible: r, children: /* @__PURE__ */ f(
    D,
    {
      ...a,
      url: a.url || "",
      isActive: !1,
      componentType: "character",
      controllerOptions: n,
      ref: s.rigidBodyRef,
      outerGroupRef: s.outerGroupRef,
      innerGroupRef: s.innerGroupRef,
      colliderRef: s.colliderRef,
      children: e
    }
  ) });
}
const tt = 150 * 150, rt = te(function({
  object: e,
  isSelected: r,
  onSelect: a,
  showDebugInfo: s = !1,
  enableInteraction: n = !0
}) {
  const i = x(), o = e.metadata?.modelUrl, l = typeof o == "string" ? o : void 0, d = S(() => {
    n && e.interactable && a && a(e.id);
  }, [n, e.interactable, e.id, a]), u = S((y) => {
    n && e.interactable && (y.stopPropagation(), document.body.style.cursor = "pointer");
  }, [n, e.interactable]), g = S(() => {
    document.body.style.cursor = "default";
  }, []);
  return l ? /* @__PURE__ */ f(
    D,
    {
      url: l,
      isActive: !1,
      componentType: e.type,
      name: `passive-${e.type}-${e.id}`,
      position: e.position,
      rotation: e.rotation,
      scale: e.scale,
      ref: i.rigidBodyRef,
      outerGroupRef: i.outerGroupRef,
      innerGroupRef: i.innerGroupRef,
      colliderRef: i.colliderRef,
      userData: {
        id: e.id,
        type: "passive",
        subType: e.type,
        interactable: e.interactable,
        onNear: e.metadata?.onNear,
        onLeave: e.metadata?.onLeave,
        onInteract: e.metadata?.onInteract
      },
      onCollisionEnter: () => {
        n && e.interactable && a && a(e.id);
      },
      children: r && s && /* @__PURE__ */ j("mesh", { position: [0, 3, 0], children: [
        /* @__PURE__ */ f("boxGeometry", { args: [0.5, 0.5, 0.5] }),
        /* @__PURE__ */ f("meshStandardMaterial", { color: "#00ff00", transparent: !0, opacity: 0.6 })
      ] })
    }
  ) : /* @__PURE__ */ j(
    Te,
    {
      type: "fixed",
      position: e.position,
      rotation: e.rotation,
      colliders: !1,
      children: [
        /* @__PURE__ */ f(Ue, { args: [1, 0.5], position: [0, 1, 0] }),
        /* @__PURE__ */ f(
          "group",
          {
            scale: e.scale,
            onClick: d,
            onPointerEnter: u,
            onPointerLeave: g
          }
        )
      ]
    }
  );
}), vt = te(function({
  objects: e,
  selectedId: r,
  onSelect: a,
  showDebugInfo: s = !1,
  enableInteraction: n = !0
}) {
  const [i, o] = Ie(() => /* @__PURE__ */ new Set()), l = je(0);
  xe((u, g) => {
    if (l.current += g, l.current < 0.5) return;
    l.current = 0;
    const y = u.camera.position, h = /* @__PURE__ */ new Set();
    for (const m of e) {
      const B = m.position.x, T = m.position.y, U = m.position.z, _ = B - y.x, c = T - y.y, p = U - y.z;
      _ * _ + c * c + p * p <= tt && h.add(m.id);
    }
    (h.size !== i.size || [...h].some((m) => !i.has(m))) && o(h);
  });
  const d = De(
    () => e.filter((u) => i.has(u.id)).map((u) => /* @__PURE__ */ f(
      rt,
      {
        object: u,
        isSelected: u.id === r,
        ...a ? { onSelect: a } : {},
        showDebugInfo: s,
        enableInteraction: n
      },
      u.id
    )),
    [e, r, a, s, n, i]
  );
  return /* @__PURE__ */ f("group", { name: "passive-objects", children: d });
});
function bt({ states: t }) {
  if (!t || !t.canRide && !t.isRiding)
    return null;
  const e = t.nearbyRideable?.rideMessage ?? `Press F to ride ${t.nearbyRideable?.displayName ?? t.nearbyRideable?.name ?? "vehicle"}`, r = t.nearbyRideable?.exitMessage ?? "Press F to exit";
  return /* @__PURE__ */ f("div", { className: "rideable-ui-container", children: /* @__PURE__ */ j("div", { className: "message-box", children: [
    t.canRide && /* @__PURE__ */ f("div", { children: e }),
    t.isRiding && /* @__PURE__ */ f("div", { children: r })
  ] }) });
}
function St(t) {
  const e = I((u) => u.rideable), { initRideable: r, onRideableNear: a, onRideableLeave: s, landing: n } = _e();
  N(() => {
    r(t);
  }, [t, r]);
  const { controllerOptions: i, ...o } = t, l = i?.lerp ? {
    lerp: {
      cameraTurn: i.lerp.cameraTurn ?? 1,
      cameraPosition: i.lerp.cameraPosition ?? 1
    }
  } : void 0, d = {
    objectType: t.objectType,
    objectkey: t.objectkey,
    rideable: !0,
    init: r,
    onNear: a,
    onLeave: s,
    landing: n,
    rideMessage: t.rideMessage,
    exitMessage: t.exitMessage,
    displayName: t.displayName
  };
  return /* @__PURE__ */ j(Oe, { children: [
    t.objectType === "vehicle" && /* @__PURE__ */ f(
      Ye,
      {
        ...o,
        ...l ? { controllerOptions: l } : {},
        userData: d,
        sensor: !0,
        visible: !e[t.objectkey]?.isOccupied
      }
    ),
    t.objectType === "airplane" && /* @__PURE__ */ f(
      et,
      {
        ...o,
        ...l ? { controllerOptions: l } : {},
        userData: d,
        sensor: !0,
        visible: !e[t.objectkey]?.isOccupied
      }
    )
  ] });
}
export {
  mt as ActiveObjects,
  qe as Airplane,
  Et as BugSpot,
  Xe as Character,
  Ot as DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
  pe as DEFAULT_WORLD_SAVE_ENVIRONMENT,
  Kt as DuplicateSaveDomainBindingError,
  It as FishSpot,
  zt as GaesupRuntimeProvider,
  kt as GaesupWorldContent,
  Ht as IndexedDBAdapter,
  Zt as LocalStorageAdapter,
  et as PassiveAirplane,
  ht as PassiveCharacter,
  vt as PassiveObjects,
  Ye as PassiveVehicle,
  jt as RUNTIME_SAVE_DIAGNOSTIC_EVENT,
  St as Rideable,
  bt as RideableUI,
  v as SaveLoadManager,
  qt as SaveSystem,
  Dt as TreeObject,
  Qe as Vehicle,
  Wt as World,
  L as WorldBridge,
  $t as WorldConfigProvider,
  Vt as WorldContainer,
  Xt as WorldProps,
  A as WorldSystem,
  xt as createCameraSaveDataFromDomain,
  Qt as createDefaultSaveSystem,
  Bt as createGaesupRuntime,
  gt as createPersistenceSlice,
  Ze as createPersistenceSliceWithOptions,
  Tt as createRuntimeSaveDiagnostics,
  ue as createSaveDataFromSaveSystem,
  le as createWorldDataFromSaveDomains,
  yt as createWorldSlice,
  Ut as formatRuntimeSaveDiagnostic,
  Yt as getSaveSystem,
  de as normalizeSaveMetadata,
  Ct as parseWorldSaveId,
  fe as parseWorldSaveTimestamp,
  Gt as shouldSetupPluginForRuntime,
  Mt as useAutoSave,
  Lt as useGaesupRuntime,
  Nt as useGaesupRuntimeRevision,
  At as useLoadOnMount
};
