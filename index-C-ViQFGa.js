import { jsx as t, jsxs as s, Fragment as p } from "react/jsx-runtime";
import { Suspense as h, useMemo as v } from "react";
import { OrbitControls as b, useGLTF as f } from "@react-three/drei";
import { Canvas as g } from "@react-three/fiber";
const d = (r) => r.replace(/[^a-zA-Z0-9_-]/g, "-"), u = (r, o) => {
  const e = r.metadata?.[o];
  return typeof e == "string" ? e : void 0;
}, m = (r, o) => {
  const e = r.metadata?.[o];
  return typeof e == "number" && Number.isFinite(e) ? e : void 0;
}, y = (r, o) => {
  const e = r.metadata?.[o];
  return typeof e == "boolean" ? e : void 0;
};
function w(r) {
  const o = u(r, "textureUrl"), e = u(r, "normalTextureUrl"), n = u(r, "material"), i = m(r, "roughness"), a = m(r, "metalness"), c = m(r, "opacity"), l = y(r, "transparent");
  return {
    assetId: r.id,
    ...r.colors?.primary ? { color: r.colors.primary } : {},
    ...n === "GLASS" || n === "METAL" || n === "STANDARD" ? { material: n } : {},
    ...o ? { textureUrl: o, mapTextureUrl: o } : {},
    ...e ? { normalTextureUrl: e } : {},
    ...i !== void 0 ? { roughness: i } : {},
    ...a !== void 0 ? { metalness: a } : {},
    ...c !== void 0 ? { opacity: c } : {},
    ...l !== void 0 ? { transparent: l } : {},
    materialParams: {
      ...r.colors?.primary ? { color: r.colors.primary } : {},
      ...o ? { mapTextureUrl: o } : {},
      ...e ? { normalTextureUrl: e } : {},
      ...i !== void 0 ? { roughness: i } : {},
      ...a !== void 0 ? { metalness: a } : {},
      ...c !== void 0 ? { opacity: c } : {},
      ...l !== void 0 ? { transparent: l } : {}
    }
  };
}
function k(r, o, e) {
  return `asset-${d(r)}-${d(o)}-${d(e)}`;
}
function L(r, o, e) {
  return {
    ...e ?? {},
    ...w(o),
    id: r
  };
}
function S({ url: r }) {
  const { scene: o } = f(r), e = v(() => o.clone(!0), [o]);
  return /* @__PURE__ */ t("group", { scale: 0.85, position: [0, -0.65, 0], children: /* @__PURE__ */ t("primitive", { object: e }) });
}
function M({ color: r }) {
  return /* @__PURE__ */ s("mesh", { rotation: [-0.35, 0.55, 0], castShadow: !0, receiveShadow: !0, children: [
    /* @__PURE__ */ t("boxGeometry", { args: [1.05, 1.05, 1.05] }),
    /* @__PURE__ */ t("meshStandardMaterial", { color: r ?? "#7bd3a7", roughness: 0.72, metalness: 0.05 })
  ] });
}
function x({ asset: r }) {
  const o = r.previewUrl ?? r.url, e = !!(o && (r.kind === "characterPart" || r.kind === "weapon" || r.kind === "object3d"));
  return /* @__PURE__ */ s(p, { children: [
    /* @__PURE__ */ t("ambientLight", { intensity: 0.9 }),
    /* @__PURE__ */ t("directionalLight", { position: [2, 3, 3], intensity: 1.2 }),
    e && o ? /* @__PURE__ */ t(S, { url: o }) : /* @__PURE__ */ t(M, { ...r.colors?.primary ? { color: r.colors.primary } : {} }),
    /* @__PURE__ */ t(b, { enablePan: !1, enableZoom: !1, autoRotate: !0, autoRotateSpeed: 1.5 })
  ] });
}
function R({ asset: r, size: o = 84, className: e }) {
  return r ? r.thumbnailUrl ? /* @__PURE__ */ t(
    "img",
    {
      className: e,
      src: r.thumbnailUrl,
      alt: r.name,
      style: {
        width: o,
        height: o,
        objectFit: "cover",
        borderRadius: 10,
        background: "rgba(255,255,255,0.05)"
      }
    }
  ) : /* @__PURE__ */ t("div", { className: e, style: { width: o, height: o, borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ t(g, { camera: { position: [0, 0.65, 2.4], fov: 42 }, dpr: [1, 1.5], children: /* @__PURE__ */ t(h, { fallback: null, children: /* @__PURE__ */ t(x, { asset: r }) }) }) }) : /* @__PURE__ */ t(
    "div",
    {
      className: e,
      style: {
        width: o,
        height: o,
        borderRadius: 10,
        background: "rgba(255,255,255,0.05)"
      }
    }
  );
}
export {
  R as A,
  w as a,
  L as b,
  k as c
};
