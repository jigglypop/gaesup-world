import { jsxs as R, jsx as k } from "react/jsx-runtime";
import { useRef as P, useMemo as T, useEffect as B } from "react";
import * as S from "three";
import { U as A } from "./index-DmHVuHAr.js";
import "reflect-metadata";
import { A as E, R as I, M as z } from "./gaesupStore-x2iiDzsY.js";
const O = "gaesup-save", _ = 1, w = "slots";
function L() {
  return new Promise((e, t) => {
    if (typeof indexedDB > "u") {
      t(new Error("IndexedDB unavailable"));
      return;
    }
    const r = indexedDB.open(O, _);
    r.onupgradeneeded = () => {
      const s = r.result;
      s.objectStoreNames.contains(w) || s.createObjectStore(w);
    }, r.onsuccess = () => e(r.result), r.onerror = () => t(r.error);
  });
}
function b(e, t) {
  return L().then(
    (r) => new Promise((s, n) => {
      const l = r.transaction(w, e).objectStore(w), i = t(l);
      if (i instanceof Promise) {
        i.then(s, n);
        return;
      }
      i.onsuccess = () => s(i.result), i.onerror = () => n(i.error);
    })
  );
}
class V {
  async read(t) {
    try {
      return await b("readonly", (s) => s.get(t)) ?? null;
    } catch {
      return null;
    }
  }
  async write(t, r) {
    await b("readwrite", (s) => s.put(r, t));
  }
  async list() {
    try {
      return (await b("readonly", (r) => r.getAllKeys())).map(String);
    } catch {
      return [];
    }
  }
  async remove(t) {
    try {
      await b("readwrite", (r) => r.delete(t));
    } catch {
    }
  }
}
const m = "gaesup:save:";
function v(e, t) {
  try {
    return e();
  } catch {
    return t;
  }
}
class W {
  async read(t) {
    return typeof localStorage > "u" ? null : v(() => {
      const r = localStorage.getItem(m + t);
      return r ? JSON.parse(r) : null;
    }, null);
  }
  async write(t, r) {
    typeof localStorage > "u" || v(() => localStorage.setItem(m + t, JSON.stringify(r)), void 0);
  }
  async list() {
    return typeof localStorage > "u" ? [] : v(() => {
      const t = [];
      for (let r = 0; r < localStorage.length; r++) {
        const s = localStorage.key(r);
        s && s.startsWith(m) && t.push(s.slice(m.length));
      }
      return t;
    }, []);
  }
  async remove(t) {
    typeof localStorage > "u" || v(() => localStorage.removeItem(m + t), void 0);
  }
}
class j {
  adapter;
  bindings = /* @__PURE__ */ new Map();
  currentVersion;
  migrations;
  defaultSlot;
  diagnosticListeners = /* @__PURE__ */ new Set();
  constructor(t) {
    this.adapter = t.adapter, this.currentVersion = t.currentVersion ?? 1, this.migrations = t.migrations ?? {}, this.defaultSlot = t.defaultSlot ?? "main", t.onDiagnostic && this.diagnosticListeners.add(t.onDiagnostic);
  }
  register(t) {
    if (this.bindings.has(t.key))
      throw new N(t.key);
    const r = {
      key: t.key,
      serialize: () => t.serialize(),
      hydrate: (s) => t.hydrate(s)
    };
    return this.bindings.set(t.key, r), () => {
      this.bindings.get(t.key) === r && this.bindings.delete(t.key);
    };
  }
  has(t) {
    return this.bindings.has(t);
  }
  subscribeDiagnostics(t) {
    return this.diagnosticListeners.add(t), () => {
      this.diagnosticListeners.delete(t);
    };
  }
  /**
   * Returns an iterator over registered domain bindings. Used by helpers
   * such as the visit-room snapshot serializer that need to read the
   * same set of (de)serializers as the autosave layer.
   */
  getBindings() {
    return this.bindings.values();
  }
  createBlob(t = this.defaultSlot) {
    const r = {};
    for (const [s, n] of this.bindings)
      try {
        r[s] = n.serialize();
      } catch (o) {
        r[s] = null, this.reportDiagnostic({ phase: "serialize", key: s, slot: t, error: o });
      }
    return {
      version: this.currentVersion,
      savedAt: Date.now(),
      domains: r
    };
  }
  hydrateBlob(t, r = this.defaultSlot) {
    let s = t;
    for (; s.version < this.currentVersion; ) {
      const n = this.migrations[s.version];
      if (!n) break;
      s = n(s);
    }
    for (const [n, o] of this.bindings)
      try {
        o.hydrate(s.domains?.[n]);
      } catch (l) {
        this.reportDiagnostic({ phase: "hydrate", key: n, slot: r, error: l });
      }
    return !0;
  }
  async save(t = this.defaultSlot) {
    const r = this.createBlob(t);
    await this.adapter.write(t, r);
  }
  async load(t = this.defaultSlot) {
    const r = await this.adapter.read(t);
    return r ? this.hydrateBlob(r, t) : !1;
  }
  async list() {
    return this.adapter.list();
  }
  async remove(t = this.defaultSlot) {
    return this.adapter.remove(t);
  }
  reportDiagnostic(t) {
    for (const r of this.diagnosticListeners)
      r(t);
  }
}
class N extends Error {
  constructor(t) {
    super(`Save domain "${t}" is already registered.`), this.name = "DuplicateSaveDomainBindingError";
  }
}
let M = null;
function U() {
  const e = typeof indexedDB < "u" ? new V() : new W();
  return new j({ adapter: e, defaultSlot: "main", currentVersion: 1 });
}
function Q() {
  return M || (M = U()), M;
}
var X = Object.defineProperty, F = Object.getOwnPropertyDescriptor, G = (e, t, r) => t in e ? X(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, Z = (e, t, r, s) => {
  for (var n = s > 1 ? void 0 : s ? F(t, r) : t, o = e.length - 1, l; o >= 0; o--)
    (l = e[o]) && (n = l(n) || n);
  return n;
}, $ = (e, t, r) => G(e, t + "", r);
let u = class extends E {
  listeners;
  constructor() {
    const e = {
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
    }, t = {
      markerCount: 0,
      renderTime: 0,
      frameTime: 0
    };
    super(e, t), this.listeners = /* @__PURE__ */ new Set();
  }
  static getInstance() {
    return (!u.instance || u.instance.isDisposed) && (u.instance = new u()), u.instance;
  }
  addMarker(e, t, r, s, n) {
    const o = { id: e, type: t, text: r, center: s, size: n };
    this.state.markers.set(e, o), this.updateMetrics(0), this.notifyListeners();
  }
  removeMarker(e) {
    this.state.markers.delete(e), this.updateMetrics(0), this.notifyListeners();
  }
  updateMarker(e, t) {
    const r = this.state.markers.get(e);
    r && (this.state.markers.set(e, { ...r, ...t }), this.updateMetrics(0), this.notifyListeners());
  }
  getMarkers() {
    return new Map(this.state.markers);
  }
  getMarker(e) {
    return this.state.markers.get(e);
  }
  clear() {
    this.state.markers.clear(), this.updateMetrics(0), this.notifyListeners();
  }
  subscribe(e) {
    return this.listeners.add(e), () => this.listeners.delete(e);
  }
  notifyListeners() {
    const e = this.getMarkers();
    this.listeners.forEach((t) => t(e));
  }
  setCanvas(e) {
    this.state.canvas = e, this.state.ctx = e ? e.getContext("2d") : null, this.state.isDirty = !0, this.state.gradientCache = {
      background: null,
      avatar: null
    };
  }
  checkForUpdates(e, t, r = 0.1, s = 0.01) {
    const n = this.state.lastPosition, o = this.state.lastRotation;
    if (!n || o === null) {
      this.state.isDirty = !0, this.state.lastPosition = { x: e.x, z: e.z }, this.state.lastRotation = t;
      return;
    }
    const l = Math.abs(e.x - n.x) > r || Math.abs(e.z - n.z) > r, i = Math.abs(t - o) > s;
    (l || i) && (this.state.isDirty = !0, this.state.lastPosition = { x: e.x, z: e.z }, this.state.lastRotation = t);
  }
  render(e) {
    if (!this.state.canvas || !this.state.ctx || !this.state.isDirty) return;
    const t = performance.now(), { size: r, scale: s, position: n, rotation: o, blockRotate: l, tileGroups: i, sceneObjects: h } = e, a = this.state.ctx;
    if (a.clearRect(0, 0, r, r), a.save(), a.beginPath(), a.arc(r / 2, r / 2, r / 2, 0, Math.PI * 2), a.clip(), !this.state.gradientCache.background) {
      const c = a.createRadialGradient(r / 2, r / 2, 0, r / 2, r / 2, r / 2);
      c.addColorStop(0, "rgba(20, 30, 40, 0.9)"), c.addColorStop(1, "rgba(10, 20, 30, 0.95)"), this.state.gradientCache.background = c;
    }
    a.fillStyle = this.state.gradientCache.background, a.fillRect(0, 0, r, r);
    const d = o * 180 / Math.PI;
    a.translate(r / 2, r / 2), a.rotate(-d * Math.PI / 180), a.translate(-r / 2, -r / 2), a.save(), a.strokeStyle = "rgba(255, 255, 255, 0.1)", a.lineWidth = 1;
    for (let c = 0; c < r; c += 20)
      a.beginPath(), a.moveTo(c, 0), a.lineTo(c, r), a.moveTo(0, c), a.lineTo(r, c), a.stroke();
    a.restore(), this.renderCompass(a, r, d), i && i.size > 0 && this.renderTiles(a, r, s, n, i), h && h.size > 0 && this.renderSceneObjects(a, r, s, n, h), this.renderMarkers(a, r, s, n, d, l), this.renderAvatar(a, r), a.restore(), this.state.isDirty = !1, this.metrics.renderTime = performance.now() - t;
  }
  renderCompass(e, t, r) {
    e.save(), e.fillStyle = "white", e.font = "bold 16px sans-serif", e.shadowColor = "rgba(0, 0, 0, 0.8)", e.shadowBlur = 3, [
      { text: "N", x: t / 2, y: 25, color: "#ff6b6b" },
      { text: "S", x: t / 2, y: t - 25, color: "#4ecdc4" },
      { text: "E", x: t - 25, y: t / 2, color: "#45b7d1" },
      { text: "W", x: 25, y: t / 2, color: "#f9ca24" }
    ].forEach(({ text: n, x: o, y: l, color: i }) => {
      e.save(), e.fillStyle = i, e.translate(o, l), e.rotate(r * Math.PI / 180), e.textAlign = "center", e.textBaseline = "middle", e.fillText(n, 0, 0), e.restore();
    }), e.restore();
  }
  renderTiles(e, t, r, s, n) {
    Array.from(n.values()).forEach((l) => {
      l && l.tiles && Array.isArray(l.tiles) && l.tiles.forEach((i) => {
        if (!i || !i.position) return;
        const h = (i.position.x - s.x) * r, a = (i.position.z - s.z) * r, d = (i.size || 1) * 4 * r;
        e.save();
        const c = t / 2 - h - d / 2, f = t / 2 - a - d / 2;
        i.objectType === "water" ? e.fillStyle = "rgba(0, 150, 255, 0.6)" : i.objectType === "grass" ? e.fillStyle = "rgba(50, 200, 50, 0.4)" : i.objectType === "sand" ? e.fillStyle = "rgba(210, 180, 120, 0.45)" : i.objectType === "snowfield" ? e.fillStyle = "rgba(225, 240, 255, 0.5)" : e.fillStyle = "rgba(150, 150, 150, 0.3)", e.fillRect(c, f, d, d), e.strokeStyle = "rgba(255, 255, 255, 0.2)", e.lineWidth = 0.5, e.strokeRect(c, f, d, d), e.restore();
      });
    });
  }
  renderSceneObjects(e, t, r, s, n) {
    n.forEach((o) => {
      if (!o?.position || !o?.size) return;
      const l = (o.position.x - s.x) * r, i = (o.position.z - s.z) * r, h = o.size.x * r, a = o.size.z * r;
      e.save();
      const d = t / 2 - l - h / 2, c = t / 2 - i - a / 2;
      e.fillStyle = "rgba(100, 150, 200, 0.4)", e.fillRect(d, c, h, a), e.strokeStyle = "rgba(255, 255, 255, 0.4)", e.lineWidth = 1, e.strokeRect(d, c, h, a), e.restore();
    });
  }
  renderMarkers(e, t, r, s, n, o) {
    this.state.markers.size !== 0 && this.state.markers.forEach((l) => {
      if (!l?.center || !l?.size) return;
      const { center: i, size: h, text: a } = l, d = (i.x - s.x) * r, c = (i.z - s.z) * r;
      e.save();
      const f = h.x * r, p = h.z * r, g = t / 2 - d - f / 2, y = t / 2 - c - p / 2;
      e.shadowColor = "rgba(0, 0, 0, 0.6)", e.shadowBlur = 4, e.shadowOffsetX = 2, e.shadowOffsetY = 2, e.fillStyle = "rgba(0,0,0,0.3)", e.fillRect(g, y, f, p), e.shadowColor = "transparent", e.strokeStyle = "rgba(255, 255, 255, 0.3)", e.lineWidth = 1, e.strokeRect(g, y, f, p), a && (e.save(), e.fillStyle = "white", e.font = "bold 12px sans-serif", e.shadowColor = "rgba(0, 0, 0, 0.8)", e.shadowBlur = 2, e.translate(g + f / 2, y + p / 2), o || e.rotate(-n * Math.PI / 180), e.textAlign = "center", e.textBaseline = "middle", e.fillText(a, 0, 0), e.restore()), e.restore();
    });
  }
  renderAvatar(e, t) {
    if (e.save(), !this.state.gradientCache.avatar) {
      const r = e.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, 12);
      r.addColorStop(0, "#01fff7"), r.addColorStop(0.7, "#01fff7"), r.addColorStop(1, "transparent"), this.state.gradientCache.avatar = r;
    }
    e.fillStyle = this.state.gradientCache.avatar, e.beginPath(), e.arc(t / 2, t / 2, 12, 0, Math.PI * 2), e.fill(), e.fillStyle = "#01fff7", e.shadowColor = "0 0 10px rgba(1,255,247,0.7)", e.shadowBlur = 8, e.beginPath(), e.arc(t / 2, t / 2, 6, 0, Math.PI * 2), e.fill(), e.shadowColor = "transparent", e.strokeStyle = "rgba(255, 255, 255, 0.8)", e.lineWidth = 2, e.beginPath(), e.moveTo(t / 2, t / 2), e.lineTo(t / 2, t / 2 - 12), e.stroke(), e.restore();
  }
  // AbstractSystem의 추상 메서드 구현
  performUpdate(e) {
  }
  createUpdateArgs(e) {
    return e;
  }
  updateMetrics(e) {
    this.metrics.markerCount = this.state.markers.size, this.metrics.frameTime = e;
  }
  onDispose() {
    this.clear(), this.listeners.clear(), this.state.canvas = null, this.state.ctx = null, u.instance = null;
  }
};
$(u, "instance", null);
u = Z([
  I("minimap"),
  z({ autoStart: !1 })
], u);
function x({
  type: e = "normal",
  text: t,
  position: r,
  children: s,
  interactive: n = !0,
  showMinimap: o = !0
}) {
  const l = P(null), i = A(), h = T(() => `world-prop-${Date.now()}-${Math.random()}`, []), a = P({
    center: new S.Vector3(),
    size: new S.Vector3(),
    positionAdd: new S.Vector3()
  });
  return B(() => {
    if (!o || !l.current) return;
    const d = u.getInstance(), f = setTimeout(() => {
      const p = l.current;
      if (!p) return;
      const g = new S.Box3();
      if (g.setFromObject(p), !g.isEmpty()) {
        const { center: y, size: D, positionAdd: C } = a.current;
        g.getCenter(y), g.getSize(D), r && (C.set(r[0], r[1], r[2]), y.add(C)), d.addMarker(
          h,
          e,
          t || "",
          y.clone(),
          // Clone only when passing to engine
          D.clone()
          // Clone only when passing to engine
        );
      }
    }, 100);
    return () => {
      clearTimeout(f), d.removeMarker(h);
    };
  }, [r, e, t, o, h]), /* @__PURE__ */ R(
    "group",
    {
      ref: l,
      ...r ? { position: r } : {},
      onClick: (d) => {
        n && (d.stopPropagation(), i.onClick(d));
      },
      children: [
        s,
        t && /* @__PURE__ */ k("group", { position: [0, 2, 0], children: /* @__PURE__ */ k("sprite", { scale: [2, 0.5, 1], children: /* @__PURE__ */ k(
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
export {
  N as D,
  V as I,
  W as L,
  u as M,
  j as S,
  x as W,
  U as c,
  Q as g
};
