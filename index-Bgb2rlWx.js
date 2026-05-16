import { jsx as u, jsxs as R, Fragment as B } from "react/jsx-runtime";
import { useRef as K, useMemo as b, useCallback as G, useEffect as A, memo as D, useLayoutEffect as N, useState as z } from "react";
import * as E from "three";
import { useFrame as O } from "@react-three/fiber";
import { G as U, V as F, W as T, X as I, Y as _, U as q, Z as Y, _ as Z } from "./index-DmHVuHAr.js";
import { u as p } from "./gaesupStore-x2iiDzsY.js";
import { vec3 as j } from "@react-three/rapier";
import { u as V } from "./index-C8EsdkFS.js";
const W = {
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
}, X = (e = !0, d = !0, r) => {
  const o = p((s) => s.automation?.queue.isRunning), a = p((s) => s.stopAutomation), n = p((s) => s.interaction?.isActive ?? !0), c = U((s) => s.isInEditMode()), i = F(), t = K(/* @__PURE__ */ new Set()), f = b(() => ({ ...W }), []), y = G(
    (s, v) => {
      if (!n) return !1;
      try {
        return i.updateKeyboard({ [s]: v }), v ? t.current.add(s) : t.current.delete(s), !0;
      } catch (k) {
        return console.error("Error updating keyboard state:", k), !1;
      }
    },
    [i, n]
  ), l = G(() => {
    t.current.clear(), i.updateKeyboard({
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
  return A(() => {
    (!n || c) && l();
  }, [l, n, c]), A(() => {
    const s = (g, P) => {
      const h = f[g.code];
      if (!h) return;
      if (!n || c) {
        P && g.preventDefault(), l();
        return;
      }
      const w = t.current.has(g.code);
      P && !w ? (t.current.add(g.code), g.code === "Space" && g.preventDefault(), d && o && (h === "forward" || h === "backward" || h === "leftward" || h === "rightward") && (a(), i.updateMouse({ isActive: !1, shouldRun: !1 })), i.updateKeyboard({ [h]: !0 })) : !P && w && (t.current.delete(g.code), i.updateKeyboard({ [h]: !1 }));
    }, v = (g) => s(g, !0), k = (g) => s(g, !1), m = () => document.hidden && l();
    return window.addEventListener("keydown", v), window.addEventListener("keyup", k), document.addEventListener("visibilitychange", m), () => {
      window.removeEventListener("keydown", v), window.removeEventListener("keyup", k), document.removeEventListener("visibilitychange", m);
    };
  }, [
    f,
    d,
    a,
    o,
    l,
    n,
    c,
    i
  ]), {
    pressedKeys: Array.from(t.current),
    pushKey: y,
    isKeyPressed: (s) => t.current.has(s),
    clearAllKeys: l
  };
}, x = D(({ points: e, color: d }) => {
  const r = b(() => new E.BufferGeometry(), []), o = b(() => new E.LineBasicMaterial({ color: d }), []), a = b(() => new E.Line(r, o), [r, o]), n = K(null), c = K(0);
  return N(() => {
    o.color.set(d);
  }, [d, o]), A(() => {
    const i = e.length + 1;
    c.current = i;
    const t = new Float32Array(i * 3);
    n.current = t;
    for (let f = 0; f < e.length; f += 1) {
      const y = e[f];
      if (!y) continue;
      const l = (f + 1) * 3;
      t[l] = y.x, t[l + 1] = y.y, t[l + 2] = y.z;
    }
    r.setAttribute("position", new E.BufferAttribute(t, 3)), r.setDrawRange(0, i), r.computeBoundingSphere();
  }, [r, e]), O(() => {
    const i = n.current;
    if (!i || c.current < 2) return;
    const t = T().getActiveState().position, f = i[4] ?? t.y;
    i[0] = t.x, i[1] = f, i[2] = t.z;
    const y = r.getAttribute("position");
    y && (y.needsUpdate = !0);
  }), A(() => () => {
    r.dispose(), o.dispose();
  }, [r, o]), e.length < 1 ? null : /* @__PURE__ */ u("primitive", { object: a, frustumCulled: !1 });
});
x.displayName = "PathLine";
const L = D(() => /* @__PURE__ */ R("group", { children: [
  /* @__PURE__ */ R("mesh", { children: [
    /* @__PURE__ */ u("sphereGeometry", { args: [0.2, 16, 16] }),
    /* @__PURE__ */ u(
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
  /* @__PURE__ */ R("mesh", { rotation: [Math.PI / 2, 0, 0], children: [
    /* @__PURE__ */ u("ringGeometry", { args: [0.3, 0.5, 8] }),
    /* @__PURE__ */ u(
      "meshStandardMaterial",
      {
        color: "#00ff88",
        transparent: !0,
        opacity: 0.6,
        side: E.DoubleSide
      }
    )
  ] })
] }));
L.displayName = "TargetMarker";
const H = [];
function $() {
  const e = p((t) => t.automation?.queue.actions ?? H), d = p((t) => t.automation?.queue.currentIndex ?? 0), [r, o] = z(() => [...I()]);
  A(() => _(() => {
    o([...I()]);
  }), []);
  const a = b(
    () => e.map((t) => t.type === "move" && t.target ? new E.Vector3(t.target.x, t.target.y, t.target.z) : null).filter((t) => t !== null),
    [e]
  ), n = b(
    () => r.length > 0 ? [...r, ...a] : a,
    [r, a]
  ), c = r[r.length - 1] ?? null, i = b(
    () => c ? [c.x, c.y, c.z] : null,
    [c?.x, c?.y, c?.z]
  );
  return /* @__PURE__ */ R("group", { children: [
    i && /* @__PURE__ */ u("group", { position: i, children: /* @__PURE__ */ u(L, {}) }),
    n.length > 0 && /* @__PURE__ */ u(
      x,
      {
        points: n,
        color: d >= 0 ? "#00ff88" : "#ffaa00"
      }
    ),
    e.map((t, f) => {
      if (t.type === "move" && t.target) {
        const y = f === d, l = f < d;
        return /* @__PURE__ */ u(
          "group",
          {
            position: [t.target.x, t.target.y, t.target.z],
            children: /* @__PURE__ */ R("mesh", { children: [
              /* @__PURE__ */ u("sphereGeometry", { args: [0.1, 8, 8] }),
              /* @__PURE__ */ u(
                "meshStandardMaterial",
                {
                  color: l ? "#888" : y ? "#ff4444" : "#ffaa00",
                  transparent: !0,
                  opacity: l ? 0.3 : 0.8
                }
              )
            ] })
          },
          `action-${f}`
        );
      }
      return null;
    })
  ] });
}
function J({ clickerOptions: e }) {
  const { onClick: d } = q(e), r = (o) => {
    o.stopPropagation();
    const { cameraOption: a, setCameraOption: n } = p.getState();
    if (a?.focus) {
      n({ focus: !1 });
      return;
    }
    d(o);
  };
  return /* @__PURE__ */ R(
    "mesh",
    {
      position: [0, 0, 0],
      rotation: [-Math.PI / 2, 0, 0],
      onPointerDown: r,
      visible: !0,
      userData: { intangible: !0 },
      children: [
        /* @__PURE__ */ u("planeGeometry", { args: [1e3, 1e3] }),
        /* @__PURE__ */ u("meshBasicMaterial", { transparent: !0, opacity: 0 })
      ]
    }
  );
}
function Q({ props: e, children: d }) {
  const r = p((m) => m.mode), { gameStates: o } = Y(), a = p((m) => m.rideable), n = p((m) => m.urls), c = U((m) => m.isInEditMode()), i = V();
  if (X(), c || !r || !o || !a || !n || r.type === "character" && !n.characterUrl || r.type === "vehicle" && !n.vehicleUrl || r.type === "airplane" && !n.airplaneUrl) return null;
  const { canRide: t, isRiding: f, currentRideable: y } = o, l = y?.id, s = b(
    () => (l ? a[l]?.offset : void 0) ?? j(),
    [l, a]
  ), k = (() => {
    const m = e.rigidBodyRef ?? i.rigidBodyRef, g = e.outerGroupRef ?? i.outerGroupRef, P = e.innerGroupRef ?? i.innerGroupRef, h = e.colliderRef ?? i.colliderRef, w = {
      isActive: !0,
      componentType: r.type,
      enableRiding: t,
      isRiderOn: f,
      offset: s,
      ref: m,
      outerGroupRef: g,
      innerGroupRef: P,
      colliderRef: h,
      parts: (e.parts || []).filter((S) => !!S.url).map((S) => ({ ...S, url: S.url })),
      ...e.onAnimate ? { onAnimate: e.onAnimate } : {},
      ...e.onFrame ? { onFrame: e.onFrame } : {},
      ...e.onReady ? { onReady: e.onReady } : {},
      ...e.onDestroy ? { onDestroy: e.onDestroy } : {},
      ...e.onDestory ? { onDestory: e.onDestory } : {},
      ...typeof e.baseColor == "string" && e.baseColor.trim().length > 0 ? { baseColor: e.baseColor } : {},
      ...Array.isArray(e.excludeBaseNodes) && e.excludeBaseNodes.length > 0 ? { excludeBaseNodes: e.excludeBaseNodes } : {},
      ...e.rigidBodyProps ? { rigidBodyProps: e.rigidBodyProps } : {},
      ...e.controllerOptions ? { controllerOptions: e.controllerOptions } : {},
      ...e.groundRay ? { groundRay: e.groundRay } : {},
      ...e.colliderSize ? { colliderSize: e.colliderSize } : {},
      ...e.position ? { position: e.position } : {},
      ...e.rotation ? { rotation: e.rotation } : {},
      ...e.scale ? { scale: e.scale } : {}
    }, C = f && r.type !== "character" ? n.ridingUrl : void 0, M = typeof C == "string" && C.length > 0 ? { ridingUrl: C } : {};
    switch (r.type) {
      case "character":
        return {
          ...w,
          url: n.characterUrl || ""
        };
      case "vehicle":
        return {
          ...w,
          ...M,
          url: n.vehicleUrl || "",
          wheelUrl: n.wheelUrl
        };
      case "airplane":
        return {
          ...w,
          ...M,
          url: n.airplaneUrl || ""
        };
      default:
        return {
          ...w,
          url: n.characterUrl || ""
        };
    }
  })();
  return r.type === "character" && o.isRiding ? null : /* @__PURE__ */ u(Z, { ...k, children: d });
}
const ee = 0.5;
function ce(e) {
  const { clickToMove: d, children: r, clickerOptions: o, ...a } = e, n = {
    ...o ?? {},
    ...o?.agentRadius === void 0 && a.colliderSize?.radius !== void 0 ? { agentRadius: Math.min(a.colliderSize.radius, ee) } : {}
  };
  return /* @__PURE__ */ R(B, { children: [
    /* @__PURE__ */ u(Q, { props: a, children: r }),
    d && /* @__PURE__ */ R(B, { children: [
      /* @__PURE__ */ u(J, { clickerOptions: n }),
      /* @__PURE__ */ u($, {})
    ] })
  ] });
}
export {
  ce as C,
  J as G,
  $ as a,
  X as u
};
