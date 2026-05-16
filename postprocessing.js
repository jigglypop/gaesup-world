import { jsxs as w, Fragment as N, jsx as h } from "react/jsx-runtime";
import { useMemo as C, useState as F, useRef as x, useEffect as M } from "react";
import { ToneMapping as U, BrightnessContrast as O, HueSaturation as y, Vignette as R, LUT as z, Selection as H, EffectComposer as W, Outline as Z, Select as P } from "@react-three/postprocessing";
import { u as $ } from "./timeStore-BRw0mdde.js";
import { u as j } from "./weatherStore-CzG5N441.js";
import * as p from "three";
const I = {
  neutral: { brightness: 0, contrast: 0, hue: 0, saturation: 0, vignetteAmount: 0.18, vignetteDarkness: 0.55 },
  morning: { brightness: 0.05, contrast: 0.05, hue: 0.04, saturation: 0.1, vignetteAmount: 0.2, vignetteDarkness: 0.55 },
  noon: { brightness: 0.04, contrast: 0.1, hue: 0, saturation: 0.18, vignetteAmount: 0.18, vignetteDarkness: 0.5 },
  sunset: { brightness: 0.02, contrast: 0.1, hue: -0.05, saturation: 0.22, vignetteAmount: 0.3, vignetteDarkness: 0.65 },
  night: { brightness: -0.1, contrast: 0.12, hue: 0.1, saturation: -0.15, vignetteAmount: 0.45, vignetteDarkness: 0.85 },
  rain: { brightness: -0.05, contrast: 0.06, hue: 0.05, saturation: -0.2, vignetteAmount: 0.35, vignetteDarkness: 0.7 },
  snow: { brightness: 0.06, contrast: 0.04, hue: 0, saturation: -0.1, vignetteAmount: 0.2, vignetteDarkness: 0.5 },
  storm: { brightness: -0.12, contrast: 0.15, hue: 0.08, saturation: -0.25, vignetteAmount: 0.5, vignetteDarkness: 0.9 }
};
function B(e, t) {
  return t === "rain" ? "rain" : t === "snow" ? "snow" : t === "storm" ? "storm" : e < 5 || e >= 20 ? "night" : e < 8 ? "morning" : e < 17 ? "noon" : e < 20 ? "sunset" : "neutral";
}
function nt({
  preset: e,
  intensity: t = 1,
  vignette: i = !0
} = {}) {
  const f = $((s) => s.time.hour), m = j((s) => s.current), c = e ?? B(f, m?.kind), r = Math.max(0, Math.min(1, t)), l = C(() => {
    const s = I[c] ?? I.neutral;
    return {
      brightness: s.brightness * r,
      contrast: s.contrast * r,
      hue: s.hue * r,
      saturation: s.saturation * r,
      vignetteAmount: s.vignetteAmount * r,
      vignetteDarkness: s.vignetteDarkness
    };
  }, [c, r]);
  return /* @__PURE__ */ w(N, { children: [
    /* @__PURE__ */ h(U, {}),
    /* @__PURE__ */ h(O, { brightness: l.brightness, contrast: l.contrast }),
    /* @__PURE__ */ h(y, { hue: l.hue, saturation: l.saturation }),
    i && /* @__PURE__ */ h(R, { eskil: !1, offset: 0.3, darkness: l.vignetteDarkness })
  ] });
}
const G = /* @__PURE__ */ new Set([
  "TITLE",
  "LUT_1D_SIZE",
  "LUT_3D_SIZE",
  "DOMAIN_MIN",
  "DOMAIN_MAX"
]);
function X(e) {
  let t = 0, i = !1, f = [0, 0, 0], m = [1, 1, 1], c;
  const r = [], l = e.split(/\r?\n/);
  for (const n of l) {
    const o = n.trim();
    if (!o || o.startsWith("#")) continue;
    const g = o.indexOf(" "), b = (g === -1 ? o : o.slice(0, g)).toUpperCase();
    if (G.has(b)) {
      const d = g === -1 ? "" : o.slice(g + 1).trim();
      switch (b) {
        case "TITLE":
          c = d.replace(/^"|"$/g, "");
          break;
        case "LUT_3D_SIZE":
          t = Number.parseInt(d, 10), i = !1;
          break;
        case "LUT_1D_SIZE":
          t = Number.parseInt(d, 10), i = !0;
          break;
        case "DOMAIN_MIN": {
          const [E, D, k] = d.split(/\s+/).map(Number);
          f = [E ?? 0, D ?? 0, k ?? 0];
          break;
        }
        case "DOMAIN_MAX": {
          const [E, D, k] = d.split(/\s+/).map(Number);
          m = [E ?? 1, D ?? 1, k ?? 1];
          break;
        }
      }
      continue;
    }
    const T = o.split(/\s+/);
    if (T.length < 3) continue;
    const L = Number.parseFloat(T[0]), A = Number.parseFloat(T[1]), S = Number.parseFloat(T[2]);
    !Number.isFinite(L) || !Number.isFinite(A) || !Number.isFinite(S) || r.push(L, A, S);
  }
  if (t <= 0)
    throw new Error("Invalid .cube LUT: missing LUT_1D_SIZE or LUT_3D_SIZE header");
  const s = i ? t : t * t * t, v = r.length / 3;
  if (v < s)
    throw new Error(
      `Invalid .cube LUT: expected ${s} samples, got ${v}`
    );
  const a = t, u = new Float32Array(a * a * a * 4);
  if (i)
    for (let n = 0; n < a; n += 1)
      for (let o = 0; o < a; o += 1)
        for (let g = 0; g < a; g += 1) {
          const b = (n * a * a + o * a + g) * 4;
          u[b] = r[g * 3], u[b + 1] = r[o * 3 + 1], u[b + 2] = r[n * 3 + 2], u[b + 3] = 1;
        }
  else
    for (let n = 0; n < s; n += 1) {
      const o = n * 4;
      u[o] = r[n * 3], u[o + 1] = r[n * 3 + 1], u[o + 2] = r[n * 3 + 2], u[o + 3] = 1;
    }
  return {
    size: a,
    data: u,
    domainMin: f,
    domainMax: m,
    ...c ? { title: c } : {}
  };
}
function V(e) {
  const t = new p.Data3DTexture(e.data, e.size, e.size, e.size);
  return t.format = p.RGBAFormat, t.type = p.FloatType, t.minFilter = p.LinearFilter, t.magFilter = p.LinearFilter, t.wrapS = p.ClampToEdgeWrapping, t.wrapT = p.ClampToEdgeWrapping, t.wrapR = p.ClampToEdgeWrapping, t.unpackAlignment = 1, t.needsUpdate = !0, t;
}
async function Y(e) {
  const t = await fetch(e);
  if (!t.ok)
    throw new Error(`Failed to fetch LUT '${e}': HTTP ${t.status}`);
  const i = await t.text();
  return X(i);
}
async function q(e) {
  const t = await Y(e);
  return V(t);
}
function rt({
  url: e,
  tetrahedralInterpolation: t = !0,
  blendFunction: i,
  onLoad: f,
  onError: m
}) {
  const [c, r] = F(null), l = x(f), s = x(m);
  return l.current = f, s.current = m, M(() => {
    let a = !1, u = null;
    return q(e).then((n) => {
      if (a) {
        n.dispose();
        return;
      }
      u = n, r(n), l.current?.(n);
    }).catch((n) => {
      if (a) return;
      const o = n instanceof Error ? n : new Error(String(n));
      s.current ? s.current(o) : console.warn("[LutOverlay] failed to load LUT:", o);
    }), () => {
      a = !0, r(null), u && u.dispose();
    };
  }, [e]), c ? /* @__PURE__ */ h(z, { ...i !== void 0 ? { lut: c, tetrahedralInterpolation: t, blendFunction: i } : { lut: c, tetrahedralInterpolation: t } }) : null;
}
function _(e) {
  return new p.Color(e).getHex();
}
function st({
  children: e,
  edgeStrength: t = 6,
  visibleEdgeColor: i = "#000000",
  hiddenEdgeColor: f = "#000000",
  pulseSpeed: m = 0,
  xRay: c = !1,
  blur: r = !1,
  multisampling: l = 0,
  extraEffects: s
}) {
  return /* @__PURE__ */ w(H, { children: [
    e,
    /* @__PURE__ */ w(W, { autoClear: !1, multisampling: l, children: [
      /* @__PURE__ */ h(
        Z,
        {
          edgeStrength: t,
          visibleEdgeColor: _(i),
          hiddenEdgeColor: _(f),
          pulseSpeed: m,
          xRay: c,
          blur: r
        }
      ),
      s
    ] })
  ] });
}
function ot({ children: e, enabled: t = !0 }) {
  return t ? /* @__PURE__ */ h(P, { enabled: !0, children: e }) : /* @__PURE__ */ h(N, { children: e });
}
export {
  nt as ColorGrade,
  rt as LutOverlay,
  ot as Outlined,
  st as ToonOutlines,
  V as createLutTexture,
  Y as loadCubeLut,
  q as loadCubeLutTexture,
  X as parseCubeLut
};
