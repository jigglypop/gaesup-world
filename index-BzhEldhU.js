import { jsx as s, jsxs as u } from "react/jsx-runtime";
import { useRef as d, useMemo as f, useEffect as v, useLayoutEffect as h, Suspense as g } from "react";
import { useThree as U, useFrame as D } from "@react-three/fiber";
import { u as l } from "./gaesupStore-x2iiDzsY.js";
import { T as x } from "./index-DmHVuHAr.js";
import { C as y } from "./index-C8EsdkFS.js";
function C() {
  const r = U((o) => o.gl), t = l((o) => o.setPerformance), n = d(0);
  return D(() => {
    if (n.current++, n.current < 30) return;
    n.current = 0;
    const o = r.info, a = "programs" in o ? o.programs : void 0;
    t({
      render: {
        calls: o.render.calls,
        triangles: o.render.triangles,
        points: o.render.points,
        lines: o.render.lines
      },
      engine: {
        geometries: o.memory.geometries,
        textures: o.memory.textures,
        programs: Array.isArray(a) ? a.length : 0
      }
    });
  }), null;
}
function z({ children: r, showGrid: t, showAxes: n }) {
  return /* @__PURE__ */ u("group", { name: "gaesup-world", children: [
    t && /* @__PURE__ */ s("gridHelper", { args: [100, 100, "#888888", "#444444"] }),
    n && /* @__PURE__ */ s("axesHelper", { args: [10] }),
    r
  ] });
}
function O(r) {
  const t = l((e) => e.setMode), n = l((e) => e.setUrls), o = l((e) => e.setCameraOption), a = f(() => {
    if (!r.urls) return null;
    const e = {};
    return r.urls.characterUrl !== void 0 && (e.characterUrl = r.urls.characterUrl), r.urls.vehicleUrl !== void 0 && (e.vehicleUrl = r.urls.vehicleUrl), r.urls.airplaneUrl !== void 0 && (e.airplaneUrl = r.urls.airplaneUrl), e.characterUrl === void 0 && r.urls.character !== void 0 && (e.characterUrl = r.urls.character), e.vehicleUrl === void 0 && r.urls.vehicle !== void 0 && (e.vehicleUrl = r.urls.vehicle), e.airplaneUrl === void 0 && r.urls.airplane !== void 0 && (e.airplaneUrl = r.urls.airplane), Object.keys(e).length > 0 ? e : null;
  }, [r.urls]);
  v(() => {
    a && n(a);
  }, [a, n]);
  const c = f(() => {
    const e = r.cameraOption;
    if (!e) return null;
    const m = e.distance ?? 15, i = {};
    return e.xDistance !== void 0 ? i.xDistance = e.xDistance : e.type === "topDown" ? i.xDistance = 0 : e.type !== "firstPerson" && (i.xDistance = m), e.yDistance !== void 0 ? i.yDistance = e.yDistance : i.yDistance = e.height ?? (e.type === "topDown" ? m : 8), e.zDistance !== void 0 ? i.zDistance = e.zDistance : e.type === "topDown" ? i.zDistance = 0 : e.type !== "firstPerson" && (i.zDistance = m), e.fov !== void 0 && (i.fov = e.fov), e.zoom !== void 0 && (i.zoom = e.zoom), e.enableZoom !== void 0 && (i.enableZoom = e.enableZoom), e.minZoom !== void 0 && (i.minZoom = e.minZoom), e.maxZoom !== void 0 && (i.maxZoom = e.maxZoom), e.zoomSpeed !== void 0 && (i.zoomSpeed = e.zoomSpeed), e.enableCollision !== void 0 && (i.enableCollision = e.enableCollision), e.smoothness !== void 0 && (i.smoothing = {
      position: e.smoothness,
      rotation: e.smoothness,
      fov: e.smoothness
    }), i;
  }, [r.cameraOption]);
  return h(() => {
    r.mode && t(r.mode), r.cameraOption && t({ control: r.cameraOption.type }), c && o(c);
  }, [c, r.cameraOption, r.mode, o, t]), r.runtime ? /* @__PURE__ */ s(x, { runtime: r.runtime, revision: r.runtimeRevision ?? 0, children: r.children }) : r.children;
}
const W = O;
function j({ children: r, showGrid: t, showAxes: n }) {
  return /* @__PURE__ */ u(g, { fallback: null, children: [
    /* @__PURE__ */ s(y, {}),
    /* @__PURE__ */ s(C, {}),
    /* @__PURE__ */ s(z, { showGrid: t ?? !1, showAxes: n ?? !1, children: r })
  ] });
}
export {
  j as G,
  W,
  O as a
};
