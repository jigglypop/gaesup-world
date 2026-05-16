import { jsxs as q, jsx as D } from "react/jsx-runtime";
import W, { useRef as x, useMemo as y, useEffect as H } from "react";
import { useFrame as P, useThree as V } from "@react-three/fiber";
import * as m from "three";
import { create as A } from "zustand";
function $({
  playerPosition: t,
  offset: o
}) {
  const e = x(null), i = x(new m.Vector3()), r = x(new m.Vector3()), a = x(new m.Vector3()), b = x(!1);
  return P((h, S) => {
    if (!e.current) return;
    const c = a.current;
    if (c.set(
      t.x + o.x,
      t.y + o.y,
      t.z + o.z
    ), !b.current) {
      e.current.position.copy(c), i.current.copy(c), r.current.copy(c), b.current = !0;
      return;
    }
    c.distanceToSquared(r.current) > 25e-4 && r.current.copy(c);
    const f = 1 - Math.exp(-8 * S), u = i.current, d = r.current;
    u.lerp(d, f), u.distanceToSquared(d) < 1e-6 && u.copy(d), e.current.position.copy(u);
  }), e;
}
const F = {
  minimap: {
    enabled: !0,
    position: "bottom-right",
    size: 200,
    opacity: 0.9,
    showZoom: !0,
    showCompass: !0,
    updateInterval: 33
  },
  tooltip: {
    enabled: !0,
    delay: 500,
    fadeSpeed: 200,
    maxWidth: 300,
    fontSize: 14
  },
  hud: {
    enabled: !0,
    opacity: 0.9,
    showHealthBar: !0,
    showManaBar: !0,
    showExperienceBar: !0
  },
  modal: {
    closeOnEscape: !0,
    closeOnBackdrop: !0,
    backdropOpacity: 0.5
  },
  notifications: {
    maxCount: 5,
    autoHideDuration: 5e3,
    position: "top-right"
  },
  speechBalloon: {
    enabled: !0,
    fontSize: 80,
    padding: 30,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "#000000",
    maxWidth: 100,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    textColor: "#000000",
    fadeDistance: 20,
    scaleMultiplier: 2,
    defaultOffset: { x: 0, y: 4.5, z: 0 }
  }
}, j = A((t) => ({
  config: F,
  updateConfig: (o) => t((e) => ({
    config: { ...e.config, ...o }
  })),
  updateMinimapConfig: (o) => t((e) => ({
    config: {
      ...e.config,
      minimap: { ...e.config.minimap, ...o }
    }
  })),
  updateTooltipConfig: (o) => t((e) => ({
    config: {
      ...e.config,
      tooltip: { ...e.config.tooltip, ...o }
    }
  })),
  updateHudConfig: (o) => t((e) => ({
    config: {
      ...e.config,
      hud: { ...e.config.hud, ...o }
    }
  })),
  updateModalConfig: (o) => t((e) => ({
    config: {
      ...e.config,
      modal: { ...e.config.modal, ...o }
    }
  })),
  updateNotificationsConfig: (o) => t((e) => ({
    config: {
      ...e.config,
      notifications: { ...e.config.notifications, ...o }
    }
  })),
  updateSpeechBalloonConfig: (o) => t((e) => ({
    config: {
      ...e.config,
      speechBalloon: { ...e.config.speechBalloon, ...o }
    }
  })),
  resetConfig: () => t({ config: F })
}));
function O(t, o, e, i, r, a) {
  t.beginPath(), t.moveTo(o + a, e), t.lineTo(o + i - a, e), t.quadraticCurveTo(o + i, e, o + i, e + a), t.lineTo(o + i, e + r - a), t.quadraticCurveTo(o + i, e + r, o + i - a, e + r), t.lineTo(o + a, e + r), t.quadraticCurveTo(o, e + r, o, e + r - a), t.lineTo(o, e + a), t.quadraticCurveTo(o, e, o + a, e), t.closePath();
}
function I(t, o, e, i, r, a, b, h = 8, S = "#000000") {
  t.fillStyle = b, O(t, o, e, i, r, a), t.fill(), t.strokeStyle = S, t.lineWidth = h;
  const c = h / 2;
  O(t, o + c, e + c, i - h, r - h, a), t.stroke();
}
function L({
  text: t,
  backgroundColor: o,
  textColor: e,
  fontSize: i,
  padding: r,
  borderRadius: a,
  borderWidth: b,
  borderColor: h,
  maxWidth: S
}) {
  try {
    const c = String(t || "안녕"), B = Math.max(Math.floor(i ?? 120), 40), f = Math.max(Math.floor(r ?? 30), 15), u = 512, d = 256, R = document.createElement("canvas");
    R.width = u, R.height = d;
    const s = R.getContext("2d", { alpha: !0 }) ?? R.getContext("2d");
    if (!s)
      return console.error("Cannot get 2D context"), null;
    s.clearRect(0, 0, u, d);
    const w = f, n = f, z = u - f * 2, M = d - f * 2;
    I(
      s,
      w,
      n,
      z,
      M,
      a ?? 80,
      o ?? "rgba(255, 255, 255, 0.95)",
      b ?? 12,
      h ?? "#000000"
    );
    const C = "Arial Black, Arial, sans-serif";
    s.fillStyle = e ?? "#000000", s.font = `bold ${B}px ${C}`, s.textAlign = "center", s.textBaseline = "middle";
    const E = Math.max(10, Math.min(z - f * 2, S)), T = s.measureText(c).width;
    if (T > E) {
      const g = E / T, v = Math.max(12, Math.floor(B * g));
      s.font = `bold ${v}px ${C}`;
    }
    s.fillText(c, u / 2, d / 2);
    const l = new m.CanvasTexture(R);
    return l.needsUpdate = !0, l.flipY = !0, l.generateMipmaps = !1, l.minFilter = m.LinearFilter, l.magFilter = m.LinearFilter, l.wrapS = m.ClampToEdgeWrapping, l.wrapT = m.ClampToEdgeWrapping, {
      texture: l,
      width: u,
      height: d,
      cleanup: () => {
        try {
          l.dispose();
        } catch (g) {
          console.warn("Error disposing texture:", g);
        }
      }
    };
  } catch (c) {
    return console.error("Error creating text texture:", c), null;
  }
}
function _({
  text: t,
  position: o = new m.Vector3(0, 2, 0),
  offset: e,
  backgroundColor: i,
  textColor: r,
  fontSize: a,
  padding: b,
  borderRadius: h,
  borderWidth: S,
  borderColor: c,
  maxWidth: B,
  visible: f = !0,
  opacity: u = 1,
  children: d
}) {
  const { camera: R } = V(), s = x(0), w = x(0), n = j((p) => p.config.speechBalloon), z = e || new m.Vector3(n.defaultOffset.x, n.defaultOffset.y, n.defaultOffset.z), M = $({
    playerPosition: o,
    offset: z
  }), [C, E] = W.useState(null), T = x(null);
  W.useEffect(() => {
    if (T.current?.cleanup && (T.current.cleanup(), T.current = null), !f || !n.enabled) {
      E(null);
      return;
    }
    const p = t && t.trim().length > 0 ? t.trim() : "안녕", g = L({
      text: p,
      backgroundColor: i ?? n.backgroundColor,
      textColor: r ?? n.textColor,
      fontSize: a ?? n.fontSize,
      padding: b ?? n.padding,
      borderRadius: h ?? n.borderRadius,
      borderWidth: S ?? n.borderWidth,
      borderColor: c ?? n.borderColor,
      maxWidth: B ?? n.maxWidth
    });
    return g && (T.current = g, E(g)), () => {
      T.current?.cleanup && (T.current.cleanup(), T.current = null);
    };
  }, [
    t,
    i ?? n.backgroundColor,
    r ?? n.textColor,
    a ?? n.fontSize,
    b ?? n.padding,
    h ?? n.borderRadius,
    S ?? n.borderWidth,
    c ?? n.borderColor,
    B ?? n.maxWidth,
    f,
    n.enabled
  ]);
  const l = y(() => C?.texture ? new m.SpriteMaterial({
    map: C.texture,
    transparent: !0,
    opacity: Math.max(0, Math.min(1, u || 1)),
    depthTest: !1,
    // 항상 보이도록
    depthWrite: !1,
    alphaTest: 0.1
  }) : null, [C, u]);
  return W.useEffect(() => {
    if (M.current && C) {
      const p = n.scaleMultiplier;
      M.current.scale.set(p * 2, p, 1), s.current = 0;
    }
  }, [C, n.scaleMultiplier]), P(() => {
    if (!(!M.current || !C || !f) && (w.current++, !(w.current < 30))) {
      w.current = 0;
      try {
        const p = M.current.position, g = R.position.distanceTo(p);
        if (Math.abs(g - s.current) > 5) {
          const k = n.scaleMultiplier;
          M.current.scale.set(k * 2, k, 1), s.current = g;
        }
      } catch (p) {
        console.warn("Error in sprite scaling:", p);
      }
    }
  }), H(() => () => {
    l && l.dispose();
  }, [l]), !f || !C?.texture || !l ? null : /* @__PURE__ */ q("group", { children: [
    /* @__PURE__ */ D(
      "sprite",
      {
        ref: M,
        material: l,
        renderOrder: 1e3,
        frustumCulled: !1
      }
    ),
    d
  ] });
}
export {
  _ as S,
  j as u
};
