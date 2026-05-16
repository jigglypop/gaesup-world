import "reflect-metadata";
import { a as $e } from "./index-C8EsdkFS.js";
import { C as Ta } from "./index-C8EsdkFS.js";
import { Z as Ee, V as ht, G as Ie, a6 as _t, a7 as Mt, a9 as Rt } from "./index-DmHVuHAr.js";
import { ac as Da, ad as Aa, ae as La, T as Oa, af as za, an as Fa, aa as Na, ab as Ua, ai as Ba, am as Ga, al as Va, aj as $a, ag as Wa, ah as ja, ao as qa, ak as Ha } from "./index-DmHVuHAr.js";
import { j as ye } from "./index-gasA93-x.js";
import { B as Ya, d as Ka, D as Qa, F as Za, R as Ja, T as ec, g as tc, b as nc, e as rc, a as oc, c as sc, f as ic, u as ac, l as cc, i as lc, k as uc } from "./index-gasA93-x.js";
import { D as fc, b as pc, I as mc, M as gc, d as hc, P as yc, e as bc, g as Sc, a as vc, s as xc } from "./runtimeFilter-CS35UPHd.js";
import { aG as pe, aH as Tt, aI as Pt, aJ as G, aK as Dt, aL as At, aM as Lt } from "./plugin-B5SoeI0c.js";
import { A as wc, w as Ec, B as kc, v as Cc, U as _c, C as Mc, aT as Rc, _ as Tc, $ as Pc, a0 as Dc, a1 as Ac, E as Lc, a as Oc, b as zc, G as Fc, N as Nc, M as Uc, aN as Bc, aU as Gc, P as Vc, R as $c, S as Wc, T as jc, V as qc, W as Hc, aV as Xc, aY as Yc, a3 as Kc, a_ as Qc, aO as Zc, a2 as Jc, c as el, d as tl, h as nl, aP as rl, aX as ol, e as sl, i as il, aZ as al, aQ as cl, aR as ll, r as ul, aS as dl, aF as fl, u as pl, f as ml, aW as gl } from "./plugin-B5SoeI0c.js";
import { W as yl, G as bl, W as Sl, a as vl, W as xl } from "./index-BzhEldhU.js";
import { u as yt } from "./index-Bgb2rlWx.js";
import { a as wl, C as El, G as kl } from "./index-Bgb2rlWx.js";
import * as v from "three";
import { B as Ot, u as V } from "./gaesupStore-x2iiDzsY.js";
import { d as _l, V as Ml, e as Rl, f as Tl, c as Pl, h as Dl, i as Al } from "./gaesupStore-x2iiDzsY.js";
import { jsxs as g, jsx as f, Fragment as J } from "react/jsx-runtime";
import { useRef as _, useState as z, useEffect as E, useCallback as ne, forwardRef as zt, useId as Ft, useMemo as A } from "react";
import { useFrame as ee, useThree as Nt } from "@react-three/fiber";
import { S as Ol, u as zl } from "./index-CUYKx17r.js";
import { M as bt } from "./index-D7BDts2W.js";
import { W as Nl, I as Ul, L as Bl, S as Gl, c as Vl, g as $l } from "./index-D7BDts2W.js";
import { u as T } from "./timeStore-BRw0mdde.js";
import { a as me, b as St, u as R, g as B, c as We, n as L } from "./eventsStore-DqmXNVEb.js";
import { i as jl } from "./eventsStore-DqmXNVEb.js";
import { createStoreDomainPlugin as j } from "./plugins.js";
import { PluginValidationAssertionError as Hl, assertValidGaesupPlugin as Xl, createCozyLifeSamplePlugin as Yl, createHighGraphicsSamplePlugin as Kl, createShooterKitSamplePlugin as Ql, defineGaesupPlugin as Zl, validateGaesupPlugin as Jl } from "./plugins.js";
import { create as Y } from "zustand";
import { c as tu, a as nu, b as ru, d as ou, e as su, f as iu, g as au } from "./authority-CysRQudy.js";
import { u as ue, o as Q, p as vt, q as $, r as Be } from "./loader-C3ZwumCe.js";
import { C as lu, t as uu, D as du, F as fu, H as pu, c as mu, s as gu, l as hu, v as yu, a as bu } from "./loader-C3ZwumCe.js";
import { u as W } from "./weatherStore-CzG5N441.js";
import { u as je } from "./assetStore-mAClONjR.js";
import { S as vu } from "./assetStore-mAClONjR.js";
import { A as Ut } from "./index-C-ViQFGa.js";
import { H as Iu } from "./api-BRV101Zn.js";
import { D as Eu, c as ku } from "./serverHost-DEn-35k3.js";
const Bt = () => ({
  position: new v.Vector3(0, 0, 0),
  velocity: new v.Vector3(0, 0, 0),
  rotation: new v.Euler(0, 0, 0),
  isMoving: !1,
  isGrounded: !1,
  speed: 0,
  height: 2
  // Default character height
});
function ie(e = {}) {
  const { updateInterval: n = 0, entityId: t } = e, r = _(null);
  r.current || (r.current = Bt());
  const [, o] = z(0), s = _(0), i = _(0), a = _({ x: 0, y: 0, z: 0 }), l = _(void 0), c = _(null), { activeState: d, gameStates: u } = Ee(), p = (h) => {
    if (t) return t;
    if (l.current) return l.current;
    const y = h.getActiveEntities();
    return l.current = y[0], l.current;
  };
  return E(() => {
    l.current = void 0, c.current = Ot.getOrCreate("motion");
    const h = c.current;
    if (!h) return;
    const y = h.subscribe((x, I) => {
      const m = p(h);
      if (!m || I !== m) return;
      const S = performance.now();
      if (i.current = S, n > 0 && S - s.current < n) return;
      s.current = S;
      const w = r.current;
      w.position.copy(x.position), w.velocity.copy(x.velocity), w.rotation.copy(x.rotation), w.isMoving = x.isMoving, w.isGrounded = x.isGrounded, w.speed = x.speed, w.height = 2, o((C) => C + 1);
    });
    return () => {
      y();
    };
  }, [t, n]), ee(() => {
    const h = performance.now();
    if (n > 0 && h - s.current < n) return;
    const y = r.current, x = c.current, I = (m) => {
      const S = a.current, w = m.x - S.x, C = m.y - S.y, P = m.z - S.z;
      return w * w + C * C + P * P > 1e-6 ? (S.x = m.x, S.y = m.y, S.z = m.z, !0) : !1;
    };
    if (x) {
      const m = p(x);
      if (!(h - i.current < 16) && m) {
        const w = x.snapshot(m);
        if (w) {
          y.position.copy(w.position), y.velocity.copy(w.velocity), y.rotation.copy(w.rotation), y.isMoving = w.isMoving, y.isGrounded = w.isGrounded, y.speed = w.speed, y.height = 2, s.current = h, I(y.position) && o((C) => C + 1);
          return;
        }
      }
    }
    d?.position && (y.position.copy(d.position), d.velocity ? y.velocity.copy(d.velocity) : y.velocity.set(0, 0, 0), d.euler ? y.rotation.copy(d.euler) : y.rotation.set(0, 0, 0), y.isMoving = u?.isMoving || !1, y.isGrounded = u?.isOnTheGround || !1, y.speed = d.velocity ? d.velocity.length() : 0, y.height = 2, s.current = h, I(y.position) && o((m) => m + 1));
  }), r.current;
}
const oe = Y((e, n) => ({
  entries: /* @__PURE__ */ new Map(),
  current: null,
  register: (t) => {
    const r = new Map(n().entries);
    r.set(t.id, t), e({ entries: r });
  },
  unregister: (t) => {
    const r = n().entries;
    if (!r.has(t)) return;
    const o = new Map(r);
    o.delete(t), e({ entries: o });
  },
  updatePosition: (t, r) => {
    const o = n().entries.get(t);
    o && o.position.copy(r);
  },
  getAll: () => Array.from(n().entries.values()),
  setCurrent: (t) => {
    const r = n().current;
    r !== t && (r && t && r.id === t.id && Math.abs(r.distance - t.distance) < 0.05 || e({ current: t }));
  },
  activateCurrent: () => {
    const t = n().current;
    if (!t) return;
    const r = n().entries.get(t.id);
    r && r.onActivate();
  }
})), qe = new v.Vector3();
function xt() {
  return oe((e) => e.current);
}
function Gt(e = !0) {
  const n = xt(), t = oe((s) => s.activateCurrent), r = ht(), o = _(!1);
  E(() => {
    if (o.current = !1, !e || !n) return;
    const s = (l) => {
      l && !o.current && t(), o.current = l;
    }, i = Vt(n.key);
    if (i && r.subscribe)
      return s(!!r.getKeyboard()[i]), r.subscribe(({ keyboard: l }) => {
        s(!!l[i]);
      });
    const a = (l) => {
      const c = l.target?.tagName?.toLowerCase();
      c === "input" || c === "textarea" || l.key.toLowerCase() === n.key.toLowerCase() && t();
    };
    return window.addEventListener("keydown", a), () => window.removeEventListener("keydown", a);
  }, [n, e, t, r]);
}
function Vt(e) {
  switch (e.toLowerCase()) {
    case "w":
      return "forward";
    case "a":
      return "leftward";
    case "s":
      return "backward";
    case "d":
      return "rightward";
    case "shift":
      return "shift";
    case " ":
    case "space":
      return "space";
    case "z":
      return "keyZ";
    case "r":
      return "keyR";
    case "f":
      return "keyF";
    case "e":
      return "keyE";
    case "escape":
      return "escape";
    default:
      return null;
  }
}
function ti({ throttleMs: e = 80 } = {}) {
  const { position: n } = ie({ updateInterval: 16 }), t = oe((s) => s.entries), r = oe((s) => s.setCurrent), o = _(0);
  return ee((s, i) => {
    if (o.current += i * 1e3, o.current < e) return;
    o.current = 0;
    let a = null, l = 1 / 0, c = "", d = "e";
    for (const u of t.values()) {
      qe.copy(u.position).sub(n);
      const p = qe.lengthSq(), h = u.range * u.range;
      p > h || p < l && (l = p, a = u.id, c = u.label, d = u.key);
    }
    if (!a) {
      r(null);
      return;
    }
    r({
      id: a,
      label: c,
      key: d,
      distance: Math.sqrt(l)
    });
  }), null;
}
function ni({ advanceKey: e = "e", closeKey: n = "Escape" }) {
  const t = ue((l) => l.node), r = ue((l) => l.runner), o = ue((l) => l.advance), s = ue((l) => l.choose), i = ue((l) => l.close), a = r?.visibleChoices() ?? [];
  return E(() => {
    if (!t) return;
    const l = (c) => {
      if (c.key === n) {
        i();
        return;
      }
      if (a.length === 0 && c.key.toLowerCase() === e.toLowerCase()) {
        o();
        return;
      }
      const d = parseInt(c.key, 10);
      !Number.isNaN(d) && d >= 1 && d <= a.length && s(d - 1);
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [t, a.length, o, s, i, e, n]), t ? /* @__PURE__ */ g(
    "div",
    {
      style: {
        position: "fixed",
        left: "50%",
        bottom: 110,
        transform: "translateX(-50%)",
        width: "min(720px, 92vw)",
        zIndex: 120,
        background: "rgba(18,20,28,0.62)",
        color: "#f3f4f8",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 14,
        padding: 14
      },
      children: [
        t.speaker && /* @__PURE__ */ f("div", { style: {
          display: "inline-block",
          padding: "3px 8px",
          background: "#ffd84a",
          color: "#1a1a1a",
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 12,
          marginBottom: 6
        }, children: t.speaker }),
        /* @__PURE__ */ f("div", { style: { lineHeight: 1.55, whiteSpace: "pre-wrap" }, children: t.text }),
        a.length === 0 ? /* @__PURE__ */ g("div", { style: { marginTop: 10, fontSize: 12, opacity: 0.65, textAlign: "right" }, children: [
          "[",
          e.toUpperCase(),
          "] 다음"
        ] }) : /* @__PURE__ */ f("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }, children: a.map((l, c) => /* @__PURE__ */ g(
          "button",
          {
            onClick: () => s(c),
            style: {
              textAlign: "left",
              padding: "9px 12px",
              background: "rgba(255,255,255,0.06)",
              color: "#f3f4f8",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "'Pretendard', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 500
            },
            children: [
              /* @__PURE__ */ g("span", { style: {
                display: "inline-block",
                width: 18,
                color: "#ffd84a",
                marginRight: 6
              }, children: [
                c + 1,
                "."
              ] }),
              l.text
            ]
          },
          c
        )) })
      ]
    }
  ) : null;
}
const $t = "gaesup.events", Wt = "events", jt = "events.store";
function qt() {
  return me.getState().serialize();
}
function Ht(e) {
  me.getState().hydrate(e);
}
function Xt(e = {}) {
  return j({
    id: e.id ?? $t,
    name: "GaeSup Events",
    saveExtensionId: e.saveExtensionId ?? Wt,
    storeServiceId: e.storeServiceId ?? jt,
    store: me,
    readyEvent: "events:ready",
    capabilities: ["events"],
    serialize: qt,
    hydrate: Ht
  });
}
const ri = Xt();
function oi(e = !0, n = {}) {
  E(() => {
    if (!e) return;
    const t = () => {
      const o = T.getState().time, { started: s, ended: i } = me.getState().refresh(o);
      s.length && n.onStarted && n.onStarted(s), i.length && n.onEnded && n.onEnded(i);
    };
    return t(), T.subscribe((o, s) => {
      (o.time.day !== s.time.day || o.time.month !== s.time.month || o.time.season !== s.time.season || o.time.weekday !== s.time.weekday) && t();
    });
  }, [e, n.onStarted, n.onEnded]);
}
function si({ position: e = "top-left", excludeIds: n = [] }) {
  const t = me((i) => i.active), r = St(), o = t.filter((i) => !n.includes(i));
  return o.length === 0 ? null : /* @__PURE__ */ f(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        pointerEvents: "none",
        userSelect: "none",
        ...e === "top-right" ? { top: 88, right: 12 } : { top: 88, left: 12 }
      },
      children: o.map((i) => {
        const a = r.get(i);
        if (!a) return null;
        const l = a.tags?.some((c) => c === "festival" || c === "tourney");
        return /* @__PURE__ */ g(
          "div",
          {
            style: {
              padding: "4px 10px",
              background: "rgba(20,20,28,0.85)",
              color: "#fff",
              fontFamily: "'Pretendard', system-ui, sans-serif",
              fontSize: 11,
              borderRadius: 999,
              boxShadow: `inset 0 0 0 1px ${l ? "#ffd84a55" : "#7adf9055"}`,
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            },
            children: [
              /* @__PURE__ */ f("span", { style: {
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: l ? "#ffd84a" : "#7adf90"
              } }),
              /* @__PURE__ */ f("span", { children: a.name })
            ]
          },
          i
        );
      })
    }
  );
}
const Yt = [
  {
    id: "season.spring",
    name: "봄",
    summary: "꽃이 피고 벌레가 깨어납니다.",
    triggers: [{ kind: "season", seasons: ["spring"] }],
    tags: ["season:spring", "fish:bass", "bug:butterfly"]
  },
  {
    id: "season.summer",
    name: "여름",
    summary: "낚시와 곤충채집의 계절.",
    triggers: [{ kind: "season", seasons: ["summer"] }],
    tags: ["season:summer", "fish:tuna", "bug:beetle", "bug:stag"]
  },
  {
    id: "season.autumn",
    name: "가을",
    summary: "단풍이 들고 낚시 보너스.",
    triggers: [{ kind: "season", seasons: ["autumn"] }],
    tags: ["season:autumn", "fish:koi", "bug:butterfly"]
  },
  {
    id: "season.winter",
    name: "겨울",
    summary: "눈이 내리고 곤충은 사라집니다.",
    triggers: [{ kind: "season", seasons: ["winter"] }],
    tags: ["season:winter", "fish:bass"]
  },
  {
    id: "event.cherryblossom",
    name: "벚꽃 축제",
    summary: "봄 한정 — 벚꽃 잎이 흩날립니다.",
    triggers: [{ kind: "monthRange", month: 4, fromDay: 1, toDay: 10 }],
    tags: ["festival", "visual:sakura"]
  },
  {
    id: "event.fishing-tourney",
    name: "낚시 대회",
    summary: "주말 한정 낚시 대회 — 보너스 종 출현.",
    triggers: [{ kind: "weekday", weekdays: ["sat", "sun"] }],
    tags: ["tourney", "fish:koi", "fish:tuna"]
  }
];
let He = !1;
function ii() {
  He || (He = !0, St().registerAll(Yt));
}
const Kt = "gaesup.inventory", Qt = "inventory", Zt = "inventory.store";
function Jt() {
  return R.getState().serialize();
}
function en(e) {
  R.getState().hydrate(e);
}
function tn(e = {}) {
  return j({
    id: e.id ?? Kt,
    name: "GaeSup Inventory",
    saveExtensionId: e.saveExtensionId ?? Qt,
    storeServiceId: e.storeServiceId ?? Zt,
    store: R,
    readyEvent: "inventory:ready",
    capabilities: ["inventory"],
    serialize: Jt,
    hydrate: en
  });
}
const ai = tn();
function ci() {
  return R((e) => ({
    slots: e.slots,
    add: e.add,
    remove: e.remove,
    removeById: e.removeById,
    move: e.move,
    countOf: e.countOf,
    has: e.has
  }));
}
function li() {
  return R((e) => {
    const n = e.hotbar[e.equippedHotbar];
    return n == null ? null : e.slots[n] ?? null;
  });
}
function nn() {
  const e = R((o) => o.hotbar), n = R((o) => o.slots), t = R((o) => o.equippedHotbar), r = R((o) => o.setEquippedHotbar);
  return {
    hotbar: e,
    slots: e.map((o) => n[o] ?? null),
    equipped: t,
    setEquipped: r
  };
}
function ui(e = !0) {
  const n = R((o) => o.setEquippedHotbar), t = R((o) => o.equippedHotbar), r = R((o) => o.hotbar);
  E(() => {
    if (!e) return;
    const o = (s) => {
      const i = s.target?.tagName?.toLowerCase();
      if (i === "input" || i === "textarea") return;
      const a = Number(s.key);
      if (Number.isInteger(a) && a >= 1 && a <= r.length) {
        n(a - 1);
        return;
      }
      (s.key === "q" || s.key === "Q") && n(t - 1), (s.key === "e" || s.key === "E") && n(t + 1);
    };
    return window.addEventListener("keydown", o), () => window.removeEventListener("keydown", o);
  }, [e, n, t, r.length]);
}
function di() {
  const { slots: e, equipped: n, setEquipped: t } = nn(), r = B();
  return /* @__PURE__ */ f(
    "div",
    {
      style: {
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 95,
        display: "flex",
        gap: 6,
        padding: 8,
        background: "rgba(18,20,28,0.55)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        boxShadow: "0 8px 28px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px) saturate(140%)",
        WebkitBackdropFilter: "blur(20px) saturate(140%)"
      },
      children: e.map((o, s) => {
        const i = o ? r.get(o.itemId) : void 0, a = s === n;
        return /* @__PURE__ */ g(
          "button",
          {
            onClick: () => t(s),
            title: i?.name ?? "",
            style: {
              width: 54,
              height: 54,
              borderRadius: 10,
              border: a ? "1.5px solid #ffd84a" : "1px solid rgba(255,255,255,0.14)",
              background: a ? "rgba(255,216,74,0.10)" : "rgba(255,255,255,0.04)",
              color: "#f3f4f8",
              position: "relative",
              cursor: "pointer",
              padding: 0,
              fontFamily: "'Pretendard', system-ui, sans-serif",
              fontSize: 11,
              boxShadow: a ? "0 0 16px rgba(255,216,74,0.45)" : "none",
              transition: "background 0.18s ease, border-color 0.18s ease"
            },
            children: [
              /* @__PURE__ */ f(
                "div",
                {
                  style: {
                    position: "absolute",
                    top: 4,
                    left: 4,
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    opacity: 0.85
                  },
                  children: s + 1
                }
              ),
              o && i ? /* @__PURE__ */ g(J, { children: [
                /* @__PURE__ */ f(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      inset: 14,
                      borderRadius: 6,
                      background: i.color ?? "#888",
                      boxShadow: "inset 0 0 8px rgba(0,0,0,0.4)"
                    }
                  }
                ),
                i.stackable && o.count > 1 && /* @__PURE__ */ f(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      bottom: 2,
                      right: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      textShadow: "0 0 3px black"
                    },
                    children: o.count
                  }
                )
              ] }) : null
            ]
          },
          s
        );
      })
    }
  );
}
function fi({ toggleKey: e = "i", initiallyOpen: n = !1 }) {
  const [t, r] = z(n), o = R((c) => c.slots), s = R((c) => c.move), i = B(), [a, l] = z(null);
  return E(() => {
    const c = (d) => {
      const u = d.target?.tagName?.toLowerCase();
      u === "input" || u === "textarea" || d.key.toLowerCase() === e.toLowerCase() && r((p) => !p);
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [e]), t ? /* @__PURE__ */ f(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)"
      },
      onClick: () => r(!1),
      children: /* @__PURE__ */ g(
        "div",
        {
          onClick: (c) => c.stopPropagation(),
          style: {
            background: "rgba(20,20,20,0.95)",
            borderRadius: 12,
            padding: 16,
            minWidth: 460,
            color: "#fff",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            boxShadow: "0 12px 32px rgba(0,0,0,0.6)"
          },
          children: [
            /* @__PURE__ */ g("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
              /* @__PURE__ */ f("div", { style: { fontSize: 14, opacity: 0.9 }, children: "Inventory" }),
              /* @__PURE__ */ f(
                "button",
                {
                  onClick: () => r(!1),
                  style: {
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 14
                  },
                  children: "×"
                }
              )
            ] }),
            /* @__PURE__ */ f(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 64px)",
                  gap: 6
                },
                children: o.map((c, d) => {
                  const u = c ? i.get(c.itemId) : void 0;
                  return /* @__PURE__ */ f(
                    "div",
                    {
                      draggable: !!c,
                      onDragStart: () => l(d),
                      onDragOver: (p) => {
                        p.preventDefault();
                      },
                      onDrop: () => {
                        a !== null && a !== d && s(a, d), l(null);
                      },
                      title: u?.name ?? "",
                      style: {
                        width: 64,
                        height: 64,
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(0,0,0,0.5)",
                        position: "relative",
                        cursor: c ? "grab" : "default",
                        fontSize: 11
                      },
                      children: c && u ? /* @__PURE__ */ g(J, { children: [
                        /* @__PURE__ */ f(
                          "div",
                          {
                            style: {
                              position: "absolute",
                              inset: 8,
                              borderRadius: 6,
                              background: u.color ?? "#888",
                              boxShadow: "inset 0 0 8px rgba(0,0,0,0.4)"
                            }
                          }
                        ),
                        u.stackable && c.count > 1 && /* @__PURE__ */ f(
                          "div",
                          {
                            style: {
                              position: "absolute",
                              bottom: 2,
                              right: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              textShadow: "0 0 3px black"
                            },
                            children: c.count
                          }
                        )
                      ] }) : null
                    },
                    d
                  );
                })
              }
            ),
            /* @__PURE__ */ f("div", { style: { marginTop: 12, opacity: 0.6, fontSize: 11 }, children: `[${e.toUpperCase()}] 닫기 / 드래그로 이동` })
          ]
        }
      )
    }
  ) : null;
}
const rn = "gaesup.quests", on = "quests", sn = "quests.store";
function an() {
  return Q.getState().serialize();
}
function cn(e) {
  Q.getState().hydrate(e);
}
function ln(e = {}) {
  return j({
    id: e.id ?? rn,
    name: "GaeSup Quests",
    saveExtensionId: e.saveExtensionId ?? on,
    storeServiceId: e.storeServiceId ?? sn,
    store: Q,
    readyEvent: "quests:ready",
    capabilities: ["quests"],
    serialize: an,
    hydrate: cn
  });
}
const pi = ln();
function mi({ toggleKey: e = "j" }) {
  const [n, t] = z(!1), r = Q((c) => c.state), o = Q((c) => c.complete), s = Q((c) => c.isObjectiveComplete), i = Q((c) => c.isAllObjectivesComplete);
  if (E(() => {
    const c = (d) => {
      const u = d.target?.tagName?.toLowerCase();
      u === "input" || u === "textarea" || (d.key.toLowerCase() === e.toLowerCase() && t((p) => !p), d.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [e]), !n) return null;
  const a = Object.values(r).filter((c) => c.status === "active"), l = Object.values(r).filter((c) => c.status === "completed");
  return /* @__PURE__ */ f(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 130,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      onClick: () => t(!1),
      children: /* @__PURE__ */ g(
        "div",
        {
          onClick: (c) => c.stopPropagation(),
          style: {
            width: 560,
            maxHeight: "76vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(122,166,255,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13
          },
          children: [
            /* @__PURE__ */ g(
              "div",
              {
                style: {
                  padding: "10px 14px",
                  borderBottom: "1px solid #333",
                  display: "flex",
                  justifyContent: "space-between"
                },
                children: [
                  /* @__PURE__ */ f("strong", { style: { fontSize: 15 }, children: "Quest Log" }),
                  /* @__PURE__ */ g("button", { onClick: () => t(!1), style: It(), children: [
                    "Close [",
                    e.toUpperCase(),
                    "]"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ g("div", { style: { overflowY: "auto", padding: 10 }, children: [
              /* @__PURE__ */ f(Xe, { title: `Active (${a.length})`, children: a.length === 0 ? /* @__PURE__ */ f(un, { children: "No active quests." }) : a.map((c) => /* @__PURE__ */ f(
                Ye,
                {
                  progress: c,
                  renderObjective: (d) => s(
                    vt().require(c.questId),
                    c,
                    d
                  ),
                  ...i(c.questId) ? {
                    onComplete: () => {
                      o(c.questId);
                    }
                  } : {}
                },
                c.questId
              )) }),
              l.length > 0 && /* @__PURE__ */ f(Xe, { title: `Completed (${l.length})`, children: l.map((c) => /* @__PURE__ */ f(Ye, { progress: c, renderObjective: () => !0, muted: !0 }, c.questId)) })
            ] })
          ]
        }
      )
    }
  );
}
function Xe({ title: e, children: n }) {
  return /* @__PURE__ */ g("div", { style: { marginBottom: 10 }, children: [
    /* @__PURE__ */ f("div", { style: { padding: "6px 6px 4px", color: "#7aa6ff", fontSize: 12 }, children: e }),
    n
  ] });
}
function un({ children: e }) {
  return /* @__PURE__ */ f("div", { style: { padding: "8px 10px", opacity: 0.6 }, children: e });
}
function Ye({
  progress: e,
  renderObjective: n,
  onComplete: t,
  muted: r
}) {
  const o = vt().get(e.questId);
  return o ? /* @__PURE__ */ g(
    "div",
    {
      style: {
        padding: 10,
        marginBottom: 6,
        background: "#222",
        borderRadius: 8,
        opacity: r ? 0.6 : 1
      },
      children: [
        /* @__PURE__ */ g(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4
            },
            children: [
              /* @__PURE__ */ f("strong", { children: o.name }),
              t && /* @__PURE__ */ f("button", { onClick: t, style: It(!0), children: "Report Complete" })
            ]
          }
        ),
        /* @__PURE__ */ f("div", { style: { opacity: 0.75, marginBottom: 6 }, children: o.summary }),
        /* @__PURE__ */ f("ul", { style: { margin: 0, padding: "0 0 0 16px" }, children: o.objectives.map((s) => {
          const i = n(s), a = e.progress[s.id] ?? 0, l = s.type === "collect" || s.type === "deliver" ? s.count : 1, c = s.type === "collect" ? Math.min(R.getState().countOf(s.itemId), l) : a, d = s.type === "collect" || s.type === "deliver" ? B().get(s.itemId)?.name ?? s.itemId : "";
          return /* @__PURE__ */ g(
            "li",
            {
              style: { color: i ? "#7adf90" : "#ddd", listStyle: "square" },
              children: [
                s.description ?? dn(s, d),
                " ",
                l > 1 ? `(${c}/${l})` : ""
              ]
            },
            s.id
          );
        }) }),
        /* @__PURE__ */ g("div", { style: { marginTop: 6, fontSize: 11, color: "#ffd84a" }, children: [
          "Rewards: ",
          o.rewards.map((s) => fn(s)).join(", ")
        ] })
      ]
    }
  ) : null;
}
function dn(e, n) {
  switch (e.type) {
    case "collect":
      return `Collect ${n ?? e.itemId}`;
    case "deliver":
      return `Deliver ${n ?? e.itemId} to ${e.npcId}`;
    case "talk":
      return `Talk to ${e.npcId}`;
    case "visit":
      return `Visit ${e.tag}`;
    case "flag":
      return "Meet the required condition";
    default:
      return "";
  }
}
function fn(e) {
  switch (e.type) {
    case "item":
      return `${e.itemId} x${e.count ?? 1}`;
    case "bells":
      return `${e.amount} B`;
    case "friendship":
      return `Friendship +${e.amount}`;
    default:
      return "";
  }
}
function It(e) {
  return {
    padding: "4px 10px",
    background: e ? "#7aa6ff" : "#444",
    color: e ? "#0d1424" : "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: e ? 700 : 400
  };
}
function gi(e = !0) {
  E(() => e ? R.subscribe((t, r) => {
    if (t.slots === r.slots) return;
    const o = Q.getState().active();
    for (const s of o) Q.getState().recheck(s.questId);
  }) : void 0, [e]);
}
const pn = 5, mn = 0.5, gn = 20, hn = 200, yn = (e) => {
  const { activeState: n } = Ee(), t = Ie((m) => m.tileGroups), r = _(/* @__PURE__ */ new Map()), o = _(bt.getInstance()), {
    scale: s = pn,
    blockRotate: i = !1,
    updateInterval: a = 33
  } = e, l = _(null), [c, d] = z(s), u = !!(n.position && e);
  E(() => {
    const m = l.current;
    return m && o.current.setCanvas(m), () => {
      o.current.setCanvas(null);
    };
  }, []);
  const p = ne(() => {
    e.blockScale || d((m) => Math.min(gn, m + 0.1));
  }, [e.blockScale]), h = ne(() => {
    e.blockScale || d((m) => Math.max(mn, m - 0.1));
  }, [e.blockScale]), y = ne(
    (m) => {
      e.blockScale || (m.preventDefault(), m.deltaY < 0 ? p() : h());
    },
    [e.blockScale, p, h]
  ), x = ne(() => {
    const m = l.current;
    if (!m) return;
    const S = (w) => {
      e.blockScale || (w.preventDefault(), w.deltaY < 0 ? p() : h());
    };
    return m.addEventListener("wheel", S, { passive: !1 }), () => {
      m.removeEventListener("wheel", S);
    };
  }, [e.blockScale, p, h]), I = ne(() => {
    const { position: m, euler: S } = n;
    !m || !S || o.current.render({
      size: hn,
      scale: c,
      position: m,
      rotation: S.y,
      blockRotate: i,
      tileGroups: t,
      sceneObjects: r.current
    });
  }, [n, c, i, t]);
  return E(() => {
    if (!u) return;
    const m = setInterval(() => {
      const { position: S, euler: w } = n;
      S && w && (o.current.checkForUpdates(S, w.y), I());
    }, a);
    return () => {
      clearInterval(m);
    };
  }, [I, a, u, n]), E(() => {
    I();
  }, [c, I]), {
    canvasRef: l,
    scale: c,
    upscale: p,
    downscale: h,
    handleWheel: y,
    setupWheelListener: x,
    updateCanvas: I,
    isReady: u
  };
}, Ke = 200;
function hi({
  scale: e = 5,
  minScale: n = 0.5,
  maxScale: t = 20,
  blockScale: r = !1,
  blockScaleControl: o = !1,
  blockRotate: s = !1,
  angle: i = 0,
  minimapStyle: a,
  scaleStyle: l,
  plusMinusStyle: c,
  position: d = "top-right",
  showZoom: u = !0,
  showCompass: p = !0,
  markers: h = []
}) {
  const { canvasRef: y, scale: x, upscale: I, downscale: m, handleWheel: S } = yn({
    blockScale: r,
    blockRotate: s
  }), w = d ? `minimap--${d}` : "";
  return /* @__PURE__ */ g("div", { className: `minimap ${w}`, style: a, children: [
    /* @__PURE__ */ f(
      "canvas",
      {
        ref: y,
        className: "minimap__canvas",
        width: Ke,
        height: Ke,
        onWheel: S
      }
    ),
    p && /* @__PURE__ */ f("div", { className: "minimap__compass", children: /* @__PURE__ */ f("div", { style: { transform: `rotate(${i}deg)` }, children: "N" }) }),
    h.map((C, P) => /* @__PURE__ */ f(
      "div",
      {
        className: `minimap__marker minimap__marker--${C.type || "normal"}`,
        style: {
          left: `${C.x}%`,
          top: `${C.y}%`
        },
        children: C.label && /* @__PURE__ */ f("div", { className: "minimap__marker-label", children: C.label })
      },
      C.id || P
    )),
    u && !o && /* @__PURE__ */ f("div", { className: "minimap__controls", style: l, children: /* @__PURE__ */ g("div", { className: "minimap__zoom-controls", children: [
      /* @__PURE__ */ f(
        "button",
        {
          className: "minimap__control-button",
          onClick: I,
          disabled: x >= t,
          style: c,
          children: "+"
        }
      ),
      /* @__PURE__ */ f(
        "button",
        {
          className: "minimap__control-button",
          onClick: m,
          disabled: x <= n,
          style: c,
          children: "-"
        }
      )
    ] }) })
  ] });
}
function bn({
  id: e,
  position: n,
  size: t = [2, 2, 2],
  text: r = "",
  type: o = "normal",
  children: s
}) {
  return E(() => {
    const i = bt.getInstance(), a = Array.isArray(n) ? n : [n.x, n.y, n.z], l = Array.isArray(t) ? t : [t.x, t.y, t.z];
    return i.addMarker(
      e,
      o,
      r || "",
      new v.Vector3(a[0], a[1], a[2]),
      new v.Vector3(l[0], l[1], l[2])
    ), () => {
      i.removeMarker(e);
    };
  }, [e, n, t, o, r]), /* @__PURE__ */ f(J, { children: s });
}
function yi({
  id: e,
  position: n,
  size: t,
  label: r,
  children: o
}) {
  return /* @__PURE__ */ f(bn, { id: e, position: n, size: t, text: r, type: "ground", children: o });
}
const Sn = {
  info: { bg: "rgba(20,30,50,0.55)", ring: "#7aa6ff", icon: "i" },
  success: { bg: "rgba(20,40,30,0.55)", ring: "#7adf90", icon: "+" },
  warn: { bg: "rgba(50,40,20,0.55)", ring: "#ffd84a", icon: "!" },
  error: { bg: "rgba(50,20,20,0.55)", ring: "#ff7a7a", icon: "x" },
  reward: { bg: "rgba(40,30,10,0.55)", ring: "#ffc24a", icon: "*" },
  mail: { bg: "rgba(30,20,40,0.55)", ring: "#cf9aff", icon: "M" }
};
function bi({ position: e = "top-right", max: n = 5 }) {
  const t = We((i) => i.toasts), r = We((i) => i.dismiss);
  E(() => {
    if (!t.length) return;
    const i = t.map(
      (a) => window.setTimeout(() => r(a.id), Math.max(500, a.durationMs))
    );
    return () => {
      i.forEach((a) => window.clearTimeout(a));
    };
  }, [t, r]);
  const o = e === "top-center" ? { top: 64, left: "50%", transform: "translateX(-50%)" } : { top: 64, right: 12 }, s = t.slice(-n);
  return /* @__PURE__ */ g(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 110,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
        ...o
      },
      children: [
        s.map((i) => {
          const a = Sn[i.kind];
          return /* @__PURE__ */ g(
            "div",
            {
              style: {
                minWidth: 220,
                maxWidth: 360,
                padding: "9px 14px",
                borderRadius: 12,
                background: a.bg,
                color: "#f3f4f8",
                fontFamily: "'Pretendard', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: `1px solid ${a.ring}55`,
                boxShadow: "0 8px 22px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)",
                backdropFilter: "blur(18px) saturate(140%)",
                WebkitBackdropFilter: "blur(18px) saturate(140%)",
                animation: "gaesup-toast-in 220ms ease-out both"
              },
              children: [
                /* @__PURE__ */ f(
                  "span",
                  {
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: a.ring,
                      color: "#1a1a1a",
                      fontWeight: 700
                    },
                    children: i.icon ?? a.icon
                  }
                ),
                /* @__PURE__ */ f("span", { children: i.text })
              ]
            },
            i.id
          );
        }),
        /* @__PURE__ */ f("style", { children: `@keyframes gaesup-toast-in {
        0% { opacity: 0; transform: translateY(-6px); }
        100% { opacity: 1; transform: translateY(0); }
      }` })
      ]
    }
  );
}
function vn(e) {
  return `${e.phase === "serialize" ? "저장" : "불러오기"} 실패: ${e.key} - ${e.errorMessage}`;
}
function Si({
  enabled: e = !0,
  includeExisting: n = !1,
  durationMs: t = 6500,
  kind: r = "error",
  icon: o,
  formatMessage: s = vn
}) {
  const i = _t(), a = Mt();
  return E(() => {
    if (!e || !i) return;
    const l = /* @__PURE__ */ new Set(), c = (u) => {
      if (l.has(u.id)) return;
      l.add(u.id);
      const p = Qe(r, u), h = o ? Qe(o, u) : void 0;
      L(p, s(u), {
        durationMs: t,
        ...h ? { icon: h } : {}
      });
    }, d = i.saveDiagnostics.getDiagnostics();
    return n ? d.forEach(c) : d.forEach((u) => l.add(u.id)), i.saveDiagnostics.subscribe(c);
  }, [t, e, s, o, n, r, a, i]), null;
}
function Qe(e, n) {
  return typeof e == "function" ? e(n) : e;
}
function xn(e, n, t) {
  return n === t ? !0 : n < t ? e >= n && e < t : e >= n || e < t;
}
function In(e, n) {
  return e.weekdays && e.weekdays.length > 0 && !e.weekdays.includes(n.weekday) || e.seasons && e.seasons.length > 0 && !e.seasons.includes(n.season) ? !1 : xn(n.hour, e.startHour, e.endHour);
}
function wn(e, n) {
  for (const r of e.entries)
    if (In(r, n))
      return {
        position: r.position,
        activity: r.activity ?? "idle",
        ...r.rotationY !== void 0 ? { rotationY: r.rotationY } : {},
        ...r.dialogTreeId ? { dialogTreeId: r.dialogTreeId } : {},
        source: r
      };
  const t = e.defaultEntry;
  return {
    position: t?.position ?? [0, 0, 0],
    activity: t?.activity ?? "idle",
    ...t?.rotationY !== void 0 ? { rotationY: t.rotationY } : {},
    ...t?.dialogTreeId ? { dialogTreeId: t.dialogTreeId } : {},
    source: null
  };
}
class En {
  map = /* @__PURE__ */ new Map();
  register(n) {
    this.map.set(n.npcId, n);
  }
  unregister(n) {
    this.map.delete(n);
  }
  get(n) {
    return this.map.get(n);
  }
  resolve(n, t) {
    const r = this.map.get(n);
    return r ? wn(r, t) : null;
  }
  all() {
    return Array.from(this.map.values());
  }
  clear() {
    this.map.clear();
  }
}
let Te = null;
function Ze() {
  return Te || (Te = new En()), Te;
}
const kn = "gaesup.npc", Cn = "npc", _n = "npc.store";
function U(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function Mn() {
  const e = pe.getState();
  return {
    version: 1,
    templates: Array.from(e.templates.values(), U),
    instances: Array.from(e.instances.values(), U),
    categories: Array.from(e.categories.values(), U),
    clothingSets: Array.from(e.clothingSets.values(), U),
    clothingCategories: Array.from(e.clothingCategories.values(), U),
    animations: Array.from(e.animations.values(), U),
    brainBlueprints: Array.from(e.brainBlueprints.values(), U),
    editMode: e.editMode
  };
}
function Rn(e) {
  if (!e) return;
  const n = Array.isArray(e) ? e : e.instances;
  pe.setState((t) => {
    Array.isArray(e) || (e.templates && (t.templates = new Map(e.templates.map((r) => [r.id, U(r)]))), e.categories && (t.categories = new Map(e.categories.map((r) => [r.id, U(r)]))), e.clothingSets && (t.clothingSets = new Map(e.clothingSets.map((r) => [r.id, U(r)]))), e.clothingCategories && (t.clothingCategories = new Map(e.clothingCategories.map((r) => [r.id, U(r)]))), e.animations && (t.animations = new Map(e.animations.map((r) => [r.id, U(r)]))), e.brainBlueprints && (t.brainBlueprints = new Map(e.brainBlueprints.map((r) => [r.id, U(r)]))), typeof e.editMode == "boolean" && (t.editMode = e.editMode)), n && (t.instances = new Map(n.map((r) => [r.id, U(r)])));
  });
}
function Tn(e = {}) {
  const n = e.id ?? kn, t = e.saveExtensionId ?? Cn, r = e.storeServiceId ?? _n;
  return {
    id: n,
    name: "GaeSup NPC",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["npc"],
    setup(o) {
      o.save.register(t, {
        key: t,
        serialize: Mn,
        hydrate: Rn
      }, n), o.services.register(r, {
        useStore: pe,
        getState: pe.getState,
        setState: pe.setState
      }, n), o.events.emit("npc:ready", {
        pluginId: n,
        saveExtensionId: t,
        storeServiceId: r
      });
    },
    dispose(o) {
      o.save.remove(t), o.services.remove(r);
    }
  };
}
const vi = Tn();
function xi(e) {
  const [n, t] = z(() => {
    const r = T.getState();
    return Ze().resolve(e, r.time);
  });
  return E(() => {
    let r = -1;
    const o = () => {
      const i = T.getState();
      if (i.time.hour === r) return;
      r = i.time.hour;
      const a = Ze().resolve(e, i.time);
      t(a);
    };
    return o(), T.subscribe((i, a) => {
      (i.time.hour !== a.time.hour || i.time.day !== a.time.day || i.time.weekday !== a.time.weekday) && o();
    });
  }, [e]), n;
}
const Pn = "gaesup.camera", Dn = "camera.system", An = "camera", Ln = "camera.store", On = /* @__PURE__ */ new Set([
  "offset",
  "target",
  "position",
  "focusTarget",
  "fixedPosition"
]);
function Ne(e) {
  if (e instanceof v.Vector3)
    return { x: e.x, y: e.y, z: e.z };
  if (e instanceof v.Euler)
    return { x: e.x, y: e.y, z: e.z, order: e.order };
  if (Array.isArray(e))
    return e.map(Ne);
  if (e && typeof e == "object")
    return Object.fromEntries(
      Object.entries(e).map(([n, t]) => [n, Ne(t)])
    );
  if (e == null || typeof e == "string" || typeof e == "number" || typeof e == "boolean")
    return e;
}
function wt(e) {
  if (!e || typeof e != "object") return !1;
  const n = e;
  return typeof n.x == "number" && typeof n.y == "number" && typeof n.z == "number";
}
function zn(e) {
  return wt(e) ? typeof e.order == "string" : !1;
}
function Fn(e) {
  const n = {};
  for (const [t, r] of Object.entries(e)) {
    if (On.has(t) && wt(r)) {
      Object.assign(n, { [t]: new v.Vector3(r.x, r.y, r.z) });
      continue;
    }
    if (t === "rotation" && zn(r)) {
      Object.assign(n, { rotation: new v.Euler(r.x, r.y, r.z, r.order) });
      continue;
    }
    Object.assign(n, { [t]: r });
  }
  return n;
}
function Je() {
  const e = V.getState();
  return {
    mode: { ...e.mode },
    cameraOption: Ne(e.cameraOption)
  };
}
function Nn(e) {
  if (!e || typeof e != "object") return;
  const n = V.getState();
  e.mode && typeof e.mode == "object" && n.setMode(e.mode), e.cameraOption && typeof e.cameraOption == "object" && n.setCameraOption(Fn(e.cameraOption));
}
function Un(e = {}) {
  const n = e.id ?? Pn, t = e.systemExtensionId ?? Dn, r = e.saveExtensionId ?? An, o = e.storeServiceId ?? Ln;
  return {
    id: n,
    name: "GaeSup Camera",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["camera"],
    setup(s) {
      s.systems.register(t, {
        System: $e,
        create: (i) => new $e(i)
      }, n), s.save.register(r, {
        key: r,
        serialize: Je,
        hydrate: Nn
      }, n), s.services.register(o, {
        useStore: V,
        getState: Je,
        setMode: (i) => V.getState().setMode(i),
        setCameraOption: (i) => V.getState().setCameraOption(i)
      }, n), s.events.emit("camera:ready", {
        pluginId: n,
        systemExtensionId: t,
        saveExtensionId: r,
        storeServiceId: o
      });
    },
    dispose(s) {
      s.systems.remove(t), s.save.remove(r), s.services.remove(o);
    }
  };
}
const Ii = Un();
function wi() {
  const { activeState: e, gameStates: n } = Ee(), t = V((i) => i.mode), r = V((i) => i.controllerOptions), o = V.getState();
  return {
    state: e || null,
    mode: t,
    states: n,
    control: r,
    context: { mode: t, states: n, control: r },
    controller: o
  };
}
function Et() {
  const { activeState: e, updateActiveState: n } = Ee(), t = !!e;
  return {
    teleport: ne((o, s) => {
      if (!e) {
        console.warn("[useTeleport]: Cannot teleport - activeState not available");
        return;
      }
      n({
        position: o.clone(),
        euler: s || e.euler
      });
    }, [e, n]),
    canTeleport: t
  };
}
function Bn({ value: e, name: n, gamePadButtonStyle: t }) {
  const [r, o] = z(!1), { pushKey: s } = yt(), i = () => {
    s(e, !0), o(!0);
  }, a = () => {
    s(e, !1), o(!1);
  };
  return /* @__PURE__ */ f(
    "button",
    {
      className: `pad-button ${r ? "is-clicked" : ""}`,
      onMouseDown: i,
      onMouseUp: a,
      onMouseLeave: a,
      onContextMenu: (l) => {
        l.preventDefault(), a();
      },
      onPointerDown: i,
      onPointerUp: a,
      style: t,
      children: n
    }
  );
}
function Ei(e) {
  const { gamePadStyle: n, gamePadButtonStyle: t, label: r } = e, o = V((a) => a.interaction?.keyboard), { mode: s } = V();
  yt();
  const i = Object.keys(o || {}).map((a) => {
    const l = r?.[a] || a;
    return a === "forward" || a === "backward" || a === "leftward" || a === "rightward" ? {
      key: a,
      name: l,
      type: "direction",
      active: o?.[a] || !1
    } : {
      key: a,
      name: l,
      type: "action",
      active: o?.[a] || !1
    };
  }).filter(Boolean);
  return /* @__PURE__ */ f(
    "div",
    {
      className: "gamepad-container",
      style: {
        ...n,
        display: s?.controller === "gamepad" ? "flex" : "none"
      },
      children: i.map((a) => /* @__PURE__ */ f(
        Bn,
        {
          value: a.key,
          name: a.name,
          gamePadButtonStyle: t
        },
        a.key
      ))
    }
  );
}
function Gn() {
  const { cameraOption: e, setCameraOption: n } = V.getState();
  e?.focus && n({
    focus: !1
  });
}
const Vn = zt(
  ({ children: e, position: n, focusDistance: t = 10, focusDuration: r = 1, onFocus: o, onBlur: s, ...i }, a) => {
    const l = V((y) => y.setCameraOption), c = V((y) => y.cameraOption), d = (y) => {
      if (y.stopPropagation(), !c?.enableFocus) return;
      if (c.focus) {
        Gn(), s && s(y);
        return;
      }
      const x = y.object.getWorldPosition(new v.Vector3());
      l({
        focusTarget: x,
        focusDuration: r,
        focusDistance: t,
        focus: !0
      }), o && o(y);
    }, u = () => {
      c?.enableFocus && (document.body.style.cursor = "pointer");
    }, p = (y) => {
      document.body.style.cursor = "default", s && !c?.focus && s(y);
    }, h = {
      ...i,
      ...n ? { position: n } : {}
    };
    return /* @__PURE__ */ f(
      "group",
      {
        ref: a,
        onClick: d,
        onPointerOver: u,
        onPointerOut: p,
        ...h,
        children: e
      }
    );
  }
);
Vn.displayName = "FocusableObject";
function ki({
  id: e,
  kind: n = "misc",
  label: t,
  range: r = 2.2,
  activationKey: o = "e",
  data: s,
  onActivate: i,
  position: a,
  children: l
}) {
  const c = Ft(), d = e ?? c, u = oe((I) => I.register), p = oe((I) => I.unregister), h = oe((I) => I.updatePosition), y = _(null), x = A(() => new v.Vector3(...a), [a]);
  return E(() => (u({
    id: d,
    kind: n,
    label: t,
    position: x.clone(),
    range: r,
    key: o,
    ...s ? { data: s } : {},
    onActivate: i
  }), () => p(d)), [d, n, t, r, o, s, i, u, p, x]), E(() => {
    h(d, x);
  }, [d, x, h]), /* @__PURE__ */ f("group", { ref: y, position: a, children: l });
}
function Ci({ enabled: e = !0 }) {
  const n = xt();
  return Gt(e), !e || !n ? null : /* @__PURE__ */ g(
    "div",
    {
      style: {
        position: "fixed",
        bottom: 96,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 96,
        padding: "8px 14px",
        background: "rgba(18,20,28,0.55)",
        color: "#f3f4f8",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 8px 22px rgba(0,0,0,0.32)",
        backdropFilter: "blur(18px) saturate(140%)",
        WebkitBackdropFilter: "blur(18px) saturate(140%)",
        pointerEvents: "none",
        userSelect: "none"
      },
      children: [
        /* @__PURE__ */ f(
          "span",
          {
            style: {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 22,
              height: 22,
              padding: "0 6px",
              borderRadius: 6,
              background: "#ffd84a",
              color: "#222",
              fontWeight: 700
            },
            children: n.key.toUpperCase()
          }
        ),
        /* @__PURE__ */ f("span", { children: n.label }),
        /* @__PURE__ */ g("span", { style: { opacity: 0.5, fontSize: 11 }, children: [
          n.distance.toFixed(1),
          "m"
        ] })
      ]
    }
  );
}
function _i({
  showController: e = !0,
  showDebugPanel: n = !0,
  controllerProps: t = {},
  debugPanelProps: r = {}
}) {
  return /* @__PURE__ */ g(J, { children: [
    e && /* @__PURE__ */ f(
      Tt,
      {
        position: "bottom-left",
        showLabels: !0,
        compact: !1,
        ...t
      }
    ),
    n && /* @__PURE__ */ f(
      Pt,
      {
        position: "top-right",
        updateInterval: 100,
        precision: 2,
        compact: !1,
        ...r
      }
    )
  ] });
}
function Mi({ text: e, position: n, teleportStyle: t }) {
  const { teleport: r, canTeleport: o } = Et();
  return /* @__PURE__ */ g(
    "div",
    {
      className: `teleport ${o ? "" : "teleport--disabled"}`,
      onClick: () => {
        r(n);
      },
      style: t,
      title: o ? "Click to teleport" : "Teleport not available",
      children: [
        e || "Teleport",
        !o && /* @__PURE__ */ f("span", { className: "teleport__cooldown", children: "⏱️" })
      ]
    }
  );
}
const $n = "gaesup.time", Wn = "time", jn = "time.store";
function qn() {
  return T.getState().serialize();
}
function Hn(e) {
  T.getState().hydrate(e);
}
function Xn(e = {}) {
  const n = e.id ?? $n, t = e.saveExtensionId ?? Wn, r = e.storeServiceId ?? jn;
  return {
    id: n,
    name: "GaeSup Time",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["time"],
    setup(o) {
      o.save.register(t, {
        key: t,
        serialize: qn,
        hydrate: Hn
      }, n), o.services.register(r, {
        useStore: T,
        getState: T.getState,
        setState: T.setState
      }, n), o.events.emit("time:ready", {
        pluginId: n,
        saveExtensionId: t,
        storeServiceId: r
      });
    },
    dispose(o) {
      o.save.remove(t), o.services.remove(r);
    }
  };
}
const Ri = Xn();
function Yn() {
  return T((e) => e.time);
}
function Ti() {
  return T((e) => ({ hour: e.time.hour, minute: e.time.minute }));
}
function Pi(e = !0) {
  const n = T((r) => r.tick), t = _(0);
  E(() => {
    if (!e) return;
    let r = 0, o = !0;
    const s = (i) => {
      if (!o) return;
      const a = t.current || i, l = i - a;
      t.current = i, n(l), r = requestAnimationFrame(s);
    };
    return r = requestAnimationFrame(s), () => {
      o = !1, cancelAnimationFrame(r);
    };
  }, [e, n]);
}
function Di(e) {
  const n = T((t) => t.addListener);
  E(() => n((t) => {
    t.kind === "newDay" && e(t.time);
  }), [n, e]);
}
function Ai(e) {
  const n = T((t) => t.addListener);
  E(() => n((t) => {
    t.kind === "newHour" && e(t.time);
  }), [n, e]);
}
const Kn = {
  spring: "#ffb6c1",
  summer: "#9bd97a",
  autumn: "#e0a060",
  winter: "#cfe2ff"
}, Qn = {
  sun: "일",
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토"
};
function Li() {
  const e = Yn(), n = String(e.hour).padStart(2, "0"), t = String(e.minute).padStart(2, "0");
  return /* @__PURE__ */ f(
    "div",
    {
      style: {
        position: "fixed",
        top: 10,
        left: 10,
        zIndex: 90,
        padding: "6px 10px",
        background: "rgba(0,0,0,0.55)",
        color: "#fff",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13,
        borderRadius: 6,
        userSelect: "none",
        pointerEvents: "none",
        backdropFilter: "blur(4px)"
      },
      children: /* @__PURE__ */ g("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ f(
          "span",
          {
            style: {
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: Kn[e.season] ?? "#fff"
            }
          }
        ),
        /* @__PURE__ */ g("span", { children: [
          "Y",
          e.year,
          " M",
          String(e.month).padStart(2, "0"),
          " D",
          String(e.day).padStart(2, "0"),
          " ",
          "(",
          Qn[e.weekday],
          ")"
        ] }),
        /* @__PURE__ */ g("span", { style: { opacity: 0.85 }, children: [
          n,
          ":",
          t
        ] })
      ] })
    }
  );
}
const Zn = [
  {
    id: "apple",
    name: "사과",
    icon: "apple",
    category: "food",
    stackable: !0,
    maxStack: 99,
    buyPrice: 100,
    sellPrice: 50,
    color: "#e54b4b",
    rarity: "common",
    description: "아삭한 사과. 그냥 먹어도, 팔아도 좋다."
  },
  {
    id: "wood",
    name: "목재",
    icon: "wood",
    category: "material",
    stackable: !0,
    maxStack: 99,
    sellPrice: 30,
    color: "#a07a4a",
    rarity: "common",
    description: "나무를 베면 얻을 수 있는 기본 재료."
  },
  {
    id: "stone",
    name: "돌",
    icon: "stone",
    category: "material",
    stackable: !0,
    maxStack: 99,
    sellPrice: 25,
    color: "#7a7a7a",
    rarity: "common"
  },
  {
    id: "flower-pink",
    name: "분홍 꽃",
    icon: "flower",
    category: "material",
    stackable: !0,
    maxStack: 99,
    sellPrice: 40,
    color: "#ff8fb1"
  },
  {
    id: "axe",
    name: "도끼",
    icon: "axe",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 800,
    color: "#9b6b3a",
    toolKind: "axe",
    durability: 60,
    description: "나무를 벨 수 있다."
  },
  {
    id: "shovel",
    name: "삽",
    icon: "shovel",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 600,
    color: "#777777",
    toolKind: "shovel",
    durability: 80,
    description: "땅을 팔 수 있다."
  },
  {
    id: "water-can",
    name: "물뿌리개",
    icon: "water-can",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 500,
    color: "#4aa8ff",
    toolKind: "water",
    durability: 100,
    description: "꽃에 물을 줄 수 있다."
  },
  {
    id: "net",
    name: "곤충채집망",
    icon: "net",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 700,
    color: "#d8d8d8",
    toolKind: "net",
    durability: 50
  },
  {
    id: "rod",
    name: "낚싯대",
    icon: "rod",
    category: "tool",
    stackable: !1,
    maxStack: 1,
    buyPrice: 900,
    color: "#5a3a2a",
    toolKind: "rod",
    durability: 50
  },
  {
    id: "shell",
    name: "조개",
    icon: "shell",
    category: "material",
    stackable: !0,
    maxStack: 99,
    sellPrice: 60,
    color: "#ffd9c2"
  },
  {
    id: "fish-bass",
    name: "배스",
    icon: "fish",
    category: "fish",
    stackable: !0,
    maxStack: 99,
    sellPrice: 200,
    color: "#5a8a8a",
    rarity: "common"
  },
  {
    id: "fish-tuna",
    name: "참다랑어",
    icon: "fish",
    category: "fish",
    stackable: !0,
    maxStack: 99,
    sellPrice: 700,
    color: "#3a5a8a",
    rarity: "rare"
  },
  {
    id: "fish-koi",
    name: "비단잉어",
    icon: "fish",
    category: "fish",
    stackable: !0,
    maxStack: 99,
    sellPrice: 1200,
    color: "#ff8a4a",
    rarity: "epic"
  },
  {
    id: "bug-butterfly",
    name: "나비",
    icon: "bug",
    category: "bug",
    stackable: !0,
    maxStack: 99,
    sellPrice: 160,
    color: "#ffd0e0",
    rarity: "common"
  },
  {
    id: "bug-beetle",
    name: "풍뎅이",
    icon: "bug",
    category: "bug",
    stackable: !0,
    maxStack: 99,
    sellPrice: 400,
    color: "#3a3a8a",
    rarity: "uncommon"
  },
  {
    id: "bug-stag",
    name: "사슴벌레",
    icon: "bug",
    category: "bug",
    stackable: !0,
    maxStack: 99,
    sellPrice: 900,
    color: "#5a2a1a",
    rarity: "rare"
  },
  {
    id: "seed-turnip",
    name: "순무 씨앗",
    icon: "seed",
    category: "material",
    stackable: !0,
    maxStack: 99,
    buyPrice: 80,
    sellPrice: 20,
    color: "#cfeeb6",
    toolKind: "seed"
  },
  {
    id: "seed-tomato",
    name: "토마토 씨앗",
    icon: "seed",
    category: "material",
    stackable: !0,
    maxStack: 99,
    buyPrice: 120,
    sellPrice: 30,
    color: "#9adf90",
    toolKind: "seed"
  },
  {
    id: "turnip",
    name: "순무",
    icon: "turnip",
    category: "food",
    stackable: !0,
    maxStack: 99,
    sellPrice: 220,
    color: "#ffeeaa",
    rarity: "common"
  },
  {
    id: "tomato",
    name: "토마토",
    icon: "tomato",
    category: "food",
    stackable: !0,
    maxStack: 99,
    sellPrice: 360,
    color: "#e54b4b",
    rarity: "uncommon"
  }
];
function Oi() {
  B().registerAll(Zn);
}
const Jn = ["axe", "shovel", "water-can", "net", "rod", "apple"];
function er(e, n, t) {
  const r = e.slice();
  for (let o = r.length - 1; o > 0; o--) {
    const s = Math.floor(t() * (o + 1));
    [r[o], r[s]] = [r[s], r[o]];
  }
  return r.slice(0, Math.min(n, r.length));
}
function tr(e) {
  let n = e | 0 || 1;
  return () => (n = n * 1664525 + 1013904223 | 0, (n >>> 0) / 4294967295);
}
const Z = Y((e, n) => ({
  catalog: Jn,
  dailyStock: [],
  lastRolledDay: -1,
  setCatalog: (t) => e({ catalog: t.slice() }),
  rollDailyStock: (t, r = 4) => {
    const o = n();
    if (o.lastRolledDay === t && o.dailyStock.length > 0) return;
    const s = tr(t * 9301 + 49297), a = er(o.catalog, r, s).map((l) => {
      const c = B().get(l), d = c?.stackable ? 5 + Math.floor(s() * 6) : 1;
      return { itemId: l, price: c?.buyPrice ?? 100, stock: d };
    });
    e({ dailyStock: a, lastRolledDay: t });
  },
  buy: (t, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    const o = n(), s = o.dailyStock.findIndex((p) => p.itemId === t);
    if (s < 0) return { ok: !1, reason: "not in stock" };
    const i = o.dailyStock[s], a = i.stock ?? 0;
    if (a < r) return { ok: !1, reason: "insufficient stock" };
    const l = (i.price ?? n().priceOf(t)) * r, c = $.getState();
    if (c.bells < l) return { ok: !1, reason: "insufficient bells" };
    if (!c.spend(l)) return { ok: !1, reason: "spend failed" };
    if (R.getState().add(t, r) > 0)
      return c.add(l), { ok: !1, reason: "inventory full" };
    const u = o.dailyStock.slice();
    return u[s] = { ...i, stock: a - r }, e({ dailyStock: u }), { ok: !0 };
  },
  sell: (t, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    if (R.getState().countOf(t) < r) return { ok: !1, reason: "not enough items" };
    const s = R.getState().removeById(t, r);
    if (s < r) return { ok: !1, reason: "remove failed" };
    const i = n().sellPriceOf(t) * s;
    return i > 0 && $.getState().add(i), { ok: !0 };
  },
  priceOf: (t) => {
    const o = n().dailyStock.find((s) => s.itemId === t);
    return o?.price != null ? o.price : B().get(t)?.buyPrice ?? 0;
  },
  sellPriceOf: (t) => B().get(t)?.sellPrice ?? 0,
  serialize: () => {
    const t = n();
    return {
      version: 1,
      lastRolledDay: t.lastRolledDay,
      dailyStock: t.dailyStock.map((r) => ({ ...r }))
    };
  },
  hydrate: (t) => {
    t && e({
      lastRolledDay: typeof t.lastRolledDay == "number" ? t.lastRolledDay : -1,
      dailyStock: Array.isArray(t.dailyStock) ? t.dailyStock.map((r) => ({ ...r })) : []
    });
  }
})), nr = "gaesup.economy", rr = "wallet", or = "shop", sr = "wallet.store", ir = "shop.store";
function ar() {
  return $.getState().serialize();
}
function cr(e) {
  $.getState().hydrate(e);
}
function lr() {
  return Z.getState().serialize();
}
function ur(e) {
  Z.getState().hydrate(e);
}
function dr(e = {}) {
  const n = e.id ?? nr, t = e.walletSaveExtensionId ?? rr, r = e.shopSaveExtensionId ?? or, o = e.walletStoreServiceId ?? sr, s = e.shopStoreServiceId ?? ir;
  return {
    id: n,
    name: "GaeSup Economy",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["economy", "wallet", "shop"],
    setup(i) {
      i.save.register(t, {
        key: t,
        serialize: ar,
        hydrate: cr
      }, n), i.save.register(r, {
        key: r,
        serialize: lr,
        hydrate: ur
      }, n), i.services.register(o, {
        useStore: $,
        getState: $.getState,
        setState: $.setState
      }, n), i.services.register(s, {
        useStore: Z,
        getState: Z.getState,
        setState: Z.setState
      }, n), i.events.emit("economy:ready", {
        pluginId: n,
        walletSaveExtensionId: t,
        shopSaveExtensionId: r,
        walletStoreServiceId: o,
        shopStoreServiceId: s
      });
    },
    dispose(i) {
      i.save.remove(t), i.save.remove(r), i.services.remove(o), i.services.remove(s);
    }
  };
}
const zi = dr();
function Fi({ position: e = "top-center" }) {
  const n = $((r) => r.bells);
  return /* @__PURE__ */ g(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 90,
        padding: "6px 12px",
        background: "rgba(40,30,10,0.85)",
        color: "#ffd84a",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "inset 0 0 0 1px rgba(255,216,74,0.4)",
        pointerEvents: "none",
        userSelect: "none",
        ...e === "bottom-right" ? { bottom: 96, right: 12 } : { top: 10, left: "50%", transform: "translateX(-50%)" }
      },
      children: [
        /* @__PURE__ */ f("span", { style: {
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#ffd84a",
          color: "#3a2a08",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 11
        }, children: "B" }),
        /* @__PURE__ */ f("span", { style: { fontWeight: 700 }, children: n.toLocaleString() })
      ]
    }
  );
}
function Ni({ open: e, onClose: n, title: t = "Shop" }) {
  const [r, o] = z("buy"), s = Z((p) => p.dailyStock), i = Z((p) => p.buy), a = Z((p) => p.sell), l = Z((p) => p.sellPriceOf), c = $((p) => p.bells), d = R((p) => p.slots);
  if (!e) return null;
  const u = (() => {
    const p = /* @__PURE__ */ new Map();
    for (const h of d)
      h && p.set(h.itemId, (p.get(h.itemId) ?? 0) + h.count);
    return Array.from(p.entries()).filter(([h]) => l(h) > 0);
  })();
  return /* @__PURE__ */ f(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 130,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)"
      },
      onClick: n,
      children: /* @__PURE__ */ g(
        "div",
        {
          onClick: (p) => p.stopPropagation(),
          style: {
            width: 520,
            maxHeight: "70vh",
            overflow: "hidden",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,216,74,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13,
            display: "flex",
            flexDirection: "column"
          },
          children: [
            /* @__PURE__ */ g("div", { style: { padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ f("strong", { style: { fontSize: 15 }, children: t }),
              /* @__PURE__ */ g("span", { style: { color: "#ffd84a" }, children: [
                c.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ f("button", { onClick: n, style: kt(), children: "닫기" })
            ] }),
            /* @__PURE__ */ g("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ f(et, { active: r === "buy", onClick: () => o("buy"), children: "구매" }),
              /* @__PURE__ */ f(et, { active: r === "sell", onClick: () => o("sell"), children: "판매" })
            ] }),
            /* @__PURE__ */ g("div", { style: { overflowY: "auto", padding: 10 }, children: [
              r === "buy" && (s.length === 0 ? /* @__PURE__ */ f("div", { style: { opacity: 0.7, padding: 12 }, children: "오늘 상품이 없습니다." }) : s.map((p) => {
                const h = B().get(p.itemId), y = p.price ?? h?.buyPrice ?? 0, x = p.stock ?? 0;
                return /* @__PURE__ */ f(
                  tt,
                  {
                    ...h?.color ? { color: h.color } : {},
                    name: h?.name ?? p.itemId,
                    sub: `재고 ${x}`,
                    price: y,
                    disabled: x <= 0 || c < y,
                    actionLabel: "구매",
                    onAction: () => {
                      const I = i(p.itemId, 1);
                      I.ok ? L("success", `${h?.name ?? p.itemId} 구매`) : L("warn", `구매 실패: ${I.reason ?? ""}`);
                    }
                  },
                  p.itemId
                );
              })),
              r === "sell" && (u.length === 0 ? /* @__PURE__ */ f("div", { style: { opacity: 0.7, padding: 12 }, children: "판매할 아이템이 없습니다." }) : u.map(([p, h]) => {
                const y = B().get(p), x = l(p);
                return /* @__PURE__ */ f(
                  tt,
                  {
                    ...y?.color ? { color: y.color } : {},
                    name: y?.name ?? p,
                    sub: `보유 ${h}`,
                    price: x,
                    actionLabel: "판매",
                    onAction: () => {
                      const I = a(p, 1);
                      I.ok ? L("reward", `${y?.name ?? p} 판매 +${x} B`) : L("warn", `판매 실패: ${I.reason ?? ""}`);
                    }
                  },
                  p
                );
              }))
            ] })
          ]
        }
      )
    }
  );
}
function et({ active: e, onClick: n, children: t }) {
  return /* @__PURE__ */ f(
    "button",
    {
      onClick: n,
      style: {
        flex: 1,
        padding: "8px 10px",
        background: e ? "#262626" : "transparent",
        color: e ? "#ffd84a" : "#ddd",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13
      },
      children: t
    }
  );
}
function tt({
  color: e,
  name: n,
  sub: t,
  price: r,
  actionLabel: o,
  onAction: s,
  disabled: i
}) {
  return /* @__PURE__ */ g("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 6px",
    borderBottom: "1px solid #2a2a2a"
  }, children: [
    /* @__PURE__ */ f("span", { style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      background: e ?? "#888"
    } }),
    /* @__PURE__ */ g("div", { style: { flex: 1 }, children: [
      /* @__PURE__ */ f("div", { children: n }),
      t && /* @__PURE__ */ f("div", { style: { fontSize: 11, opacity: 0.7 }, children: t })
    ] }),
    /* @__PURE__ */ g("div", { style: { color: "#ffd84a", minWidth: 64, textAlign: "right" }, children: [
      r.toLocaleString(),
      " B"
    ] }),
    /* @__PURE__ */ f("button", { onClick: s, disabled: i, style: kt(i), children: o })
  ] });
}
function kt(e) {
  return {
    padding: "6px 10px",
    background: e ? "#333" : "#444",
    color: e ? "#777" : "#fff",
    border: "none",
    borderRadius: 6,
    cursor: e ? "not-allowed" : "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12
  };
}
function Ui({
  useKey: e = "f",
  range: n = 2.4,
  cooldownMs: t = 350
} = {}) {
  const { position: r, rotation: o } = ie({ updateInterval: 16 }), s = _(0);
  return E(() => {
    const i = `Key${e.toUpperCase()}`, a = e.toLowerCase(), l = (c) => {
      const d = c.target?.tagName?.toLowerCase();
      if (d === "input" || d === "textarea" || c.code !== i && c.key.toLowerCase() !== a) return;
      const u = performance.now();
      if (u - s.current < t) return;
      const p = R.getState().getEquipped();
      if (!p) return;
      const h = B().get(p.itemId);
      if (!h?.toolKind) return;
      const y = h.toolKind, x = o?.y ?? 0, I = new v.Vector3(Math.sin(x), 0, Math.cos(x)).normalize();
      s.current = u, ye().emit({
        kind: y,
        origin: [r.x, r.y, r.z],
        direction: [I.x, I.y, I.z],
        range: n,
        timestamp: u
      });
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [e, t, n, r, o]), null;
}
const fr = "gaesup.relations", pr = "relations", mr = "relations.store";
function gr() {
  return Be.getState().serialize();
}
function hr(e) {
  Be.getState().hydrate(e);
}
function yr(e = {}) {
  return j({
    id: e.id ?? fr,
    name: "GaeSup Relations",
    saveExtensionId: e.saveExtensionId ?? pr,
    storeServiceId: e.storeServiceId ?? mr,
    store: Be,
    readyEvent: "relations:ready",
    capabilities: ["relations"],
    serialize: gr,
    hydrate: hr
  });
}
const Bi = yr();
let br = 0;
function Sr() {
  return `mail_${Date.now().toString(36)}_${(++br).toString(36)}`;
}
function vr(e) {
  return e.itemId !== void 0;
}
const re = Y((e, n) => ({
  messages: [],
  send: (t) => {
    const r = t.id ?? Sr(), o = {
      id: r,
      from: t.from,
      subject: t.subject,
      body: t.body,
      sentDay: t.sentDay,
      ...t.attachments ? { attachments: t.attachments } : {},
      read: !1,
      claimed: !t.attachments || t.attachments.length === 0
    };
    return e({ messages: [...n().messages, o] }), L("mail", `새 우편: ${t.subject}`), r;
  },
  markRead: (t) => {
    e({ messages: n().messages.map((r) => r.id === t ? { ...r, read: !0 } : r) });
  },
  markAllRead: () => {
    e({ messages: n().messages.map((t) => ({ ...t, read: !0 })) });
  },
  claim: (t) => {
    const r = n().messages.find((s) => s.id === t);
    if (!r || r.claimed || !r.attachments) return !1;
    let o = !0;
    for (const s of r.attachments)
      if (vr(s)) {
        if (R.getState().add(s.itemId, s.count ?? 1) > 0) {
          o = !1, L("warn", "인벤토리 부족, 일부 우편물 미수령");
          break;
        }
      } else
        $.getState().add(s.bells);
    return o && (e({ messages: n().messages.map((s) => s.id === t ? { ...s, claimed: !0, read: !0 } : s) }), L("reward", "우편 첨부물 수령")), o;
  },
  delete: (t) => {
    e({ messages: n().messages.filter((r) => r.id !== t) });
  },
  unreadCount: () => n().messages.reduce((t, r) => t + (r.read ? 0 : 1), 0),
  hasUnclaimedAttachments: () => n().messages.some((t) => !t.claimed && (t.attachments?.length ?? 0) > 0),
  serialize: () => ({
    version: 1,
    messages: n().messages.map((t) => ({
      ...t,
      ...t.attachments ? { attachments: t.attachments.map((r) => ({ ...r })) } : {}
    }))
  }),
  hydrate: (t) => {
    !t || !Array.isArray(t.messages) || e({ messages: t.messages.map((r) => ({ ...r })) });
  }
})), xr = "gaesup.mail", Ir = "mail", wr = "mail.store";
function Er() {
  return re.getState().serialize();
}
function kr(e) {
  re.getState().hydrate(e);
}
function Cr(e = {}) {
  return j({
    id: e.id ?? xr,
    name: "GaeSup Mail",
    saveExtensionId: e.saveExtensionId ?? Ir,
    storeServiceId: e.storeServiceId ?? wr,
    store: re,
    readyEvent: "mail:ready",
    capabilities: ["mail"],
    serialize: Er,
    hydrate: kr
  });
}
const Gi = Cr();
function Vi({ toggleKey: e = "m" }) {
  const [n, t] = z(!1), [r, o] = z(null), s = re((u) => u.messages), i = re((u) => u.markRead), a = re((u) => u.claim), l = re((u) => u.delete);
  if (E(() => {
    const u = (p) => {
      const h = p.target?.tagName?.toLowerCase();
      h === "input" || h === "textarea" || (p.key.toLowerCase() === e.toLowerCase() && t((y) => !y), p.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", u), () => window.removeEventListener("keydown", u);
  }, [e]), !n) return null;
  const c = s.slice().sort((u, p) => p.sentDay - u.sentDay), d = r ? c.find((u) => u.id === r) ?? null : null;
  return /* @__PURE__ */ f(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => t(!1),
      children: /* @__PURE__ */ g(
        "div",
        {
          onClick: (u) => u.stopPropagation(),
          style: {
            width: 720,
            height: 460,
            display: "flex",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(207,154,255,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13,
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ g("div", { style: { width: 260, borderRight: "1px solid #333", display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ g("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ f("strong", { children: "우편함" }),
                /* @__PURE__ */ f("span", { style: { fontSize: 12, opacity: 0.7 }, children: c.length })
              ] }),
              /* @__PURE__ */ f("div", { style: { flex: 1, overflowY: "auto" }, children: c.length === 0 ? /* @__PURE__ */ f(Mr, { children: "우편이 없습니다." }) : c.map((u) => /* @__PURE__ */ g(
                "div",
                {
                  onClick: () => {
                    o(u.id), u.read || i(u.id);
                  },
                  style: {
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: r === u.id ? "#262626" : "transparent",
                    borderBottom: "1px solid #2a2a2a",
                    opacity: u.read ? 0.7 : 1
                  },
                  children: [
                    /* @__PURE__ */ g("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      !u.read && /* @__PURE__ */ f("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "#cf9aff" } }),
                      /* @__PURE__ */ f("strong", { style: { fontSize: 13 }, children: u.subject })
                    ] }),
                    /* @__PURE__ */ g("div", { style: { fontSize: 11, opacity: 0.6 }, children: [
                      u.from,
                      " · day ",
                      u.sentDay
                    ] }),
                    u.attachments && u.attachments.length > 0 && !u.claimed && /* @__PURE__ */ f("div", { style: { fontSize: 11, color: "#ffd84a" }, children: "* 첨부물" })
                  ]
                },
                u.id
              )) })
            ] }),
            /* @__PURE__ */ g("div", { style: { flex: 1, display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ g("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ f("span", { children: d ? d.subject : "메시지를 선택하세요" }),
                /* @__PURE__ */ g("button", { onClick: () => t(!1), style: Ue(), children: [
                  "닫기 [",
                  e.toUpperCase(),
                  "]"
                ] })
              ] }),
              /* @__PURE__ */ f("div", { style: { flex: 1, padding: 12, overflowY: "auto" }, children: d ? /* @__PURE__ */ f(_r, { msg: d, onClaim: () => a(d.id), onDelete: () => {
                l(d.id), o(null);
              } }) : /* @__PURE__ */ f("div", { style: { opacity: 0.6 }, children: "왼쪽에서 메시지를 선택하세요." }) })
            ] })
          ]
        }
      )
    }
  );
}
function _r({ msg: e, onClaim: n, onDelete: t }) {
  return /* @__PURE__ */ g("div", { children: [
    /* @__PURE__ */ g("div", { style: { marginBottom: 6, opacity: 0.75 }, children: [
      "From. ",
      e.from
    ] }),
    /* @__PURE__ */ f("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 12 }, children: e.body }),
    e.attachments && e.attachments.length > 0 && /* @__PURE__ */ g("div", { style: { padding: 10, background: "#222", borderRadius: 8, marginBottom: 8 }, children: [
      /* @__PURE__ */ f("div", { style: { marginBottom: 6, color: "#ffd84a", fontSize: 12 }, children: "첨부물" }),
      /* @__PURE__ */ f("ul", { style: { margin: 0, paddingLeft: 18 }, children: e.attachments.map((r, o) => {
        if ("itemId" in r) {
          const s = B().get(r.itemId);
          return /* @__PURE__ */ g("li", { children: [
            s?.name ?? r.itemId,
            " x",
            r.count ?? 1
          ] }, o);
        }
        return /* @__PURE__ */ g("li", { children: [
          r.bells,
          " B"
        ] }, o);
      }) }),
      /* @__PURE__ */ f("div", { style: { marginTop: 8, display: "flex", gap: 6, justifyContent: "flex-end" }, children: e.claimed ? /* @__PURE__ */ f("span", { style: { fontSize: 12, opacity: 0.6 }, children: "수령 완료" }) : /* @__PURE__ */ f("button", { onClick: n, style: Ue(!0), children: "받기" }) })
    ] }),
    /* @__PURE__ */ f("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ f("button", { onClick: t, style: Ue(), children: "삭제" }) })
  ] });
}
function Mr({ children: e }) {
  return /* @__PURE__ */ f("div", { style: { padding: 14, opacity: 0.6 }, children: e });
}
function Ue(e) {
  return {
    padding: "6px 10px",
    background: e ? "#cf9aff" : "#444",
    color: e ? "#1a0d24" : "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: e ? 700 : 400
  };
}
const nt = ["fish", "bug", "food", "material", "furniture", "tool", "misc"], ge = Y((e, n) => ({
  entries: {},
  record: (t, r, o) => {
    if (r <= 0) return;
    const s = n().entries[t], i = s ? { ...s, totalCollected: s.totalCollected + r } : { itemId: t, firstSeenDay: o, totalCollected: r };
    e({ entries: { ...n().entries, [t]: i } });
  },
  has: (t) => !!n().entries[t],
  get: (t) => n().entries[t],
  size: () => Object.keys(n().entries).length,
  serialize: () => ({
    version: 1,
    entries: Object.fromEntries(Object.entries(n().entries).map(([t, r]) => [t, { ...r }]))
  }),
  hydrate: (t) => {
    if (!t || typeof t != "object") return;
    const r = {};
    if (t.entries && typeof t.entries == "object")
      for (const [o, s] of Object.entries(t.entries))
        !s || typeof s != "object" || (r[o] = {
          itemId: o,
          firstSeenDay: typeof s.firstSeenDay == "number" ? s.firstSeenDay : 0,
          totalCollected: typeof s.totalCollected == "number" ? s.totalCollected : 0
        });
    e({ entries: r });
  }
})), Rr = "gaesup.catalog", Tr = "catalog", Pr = "catalog.store";
function Dr() {
  return ge.getState().serialize();
}
function Ar(e) {
  ge.getState().hydrate(e);
}
function Lr(e = {}) {
  return j({
    id: e.id ?? Rr,
    name: "GaeSup Catalog",
    saveExtensionId: e.saveExtensionId ?? Tr,
    storeServiceId: e.storeServiceId ?? Pr,
    store: ge,
    readyEvent: "catalog:ready",
    capabilities: ["catalog"],
    serialize: Dr,
    hydrate: Ar
  });
}
const $i = Lr();
function Wi(e = !0) {
  E(() => e ? R.subscribe((t, r) => {
    if (t.slots === r.slots) return;
    const o = Math.floor(T.getState().totalMinutes / (60 * 24)), s = /* @__PURE__ */ new Map();
    for (const a of r.slots) a && s.set(a.itemId, (s.get(a.itemId) ?? 0) + a.count);
    const i = /* @__PURE__ */ new Map();
    for (const a of t.slots) a && i.set(a.itemId, (i.get(a.itemId) ?? 0) + a.count);
    for (const [a, l] of i.entries()) {
      const c = l - (s.get(a) ?? 0);
      c > 0 && ge.getState().record(a, c, o);
    }
  }) : void 0, [e]);
}
function ji({ toggleKey: e = "k" }) {
  const [n, t] = z(!1), [r, o] = z("fish"), s = ge((d) => d.entries);
  E(() => {
    const d = (u) => {
      const p = u.target?.tagName?.toLowerCase();
      p === "input" || p === "textarea" || (u.key.toLowerCase() === e.toLowerCase() && t((h) => !h), u.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", d), () => window.removeEventListener("keydown", d);
  }, [e]);
  const i = A(() => B().all(), []), a = A(() => {
    const d = /* @__PURE__ */ new Map();
    for (const u of nt) d.set(u, []);
    for (const u of i) {
      const p = d.get(u.category);
      p && p.push(u);
    }
    return d;
  }, [i]);
  if (!n) return null;
  const l = a.get(r) ?? [], c = l.filter((d) => s[d.id]).length;
  return /* @__PURE__ */ f(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => t(!1),
      children: /* @__PURE__ */ g(
        "div",
        {
          onClick: (d) => d.stopPropagation(),
          style: {
            width: 760,
            height: 520,
            display: "flex",
            flexDirection: "column",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(122,223,144,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13,
            overflow: "hidden"
          },
          children: [
            /* @__PURE__ */ g("div", { style: { padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ f("strong", { style: { fontSize: 15 }, children: "도감" }),
              /* @__PURE__ */ g("button", { onClick: () => t(!1), style: Or(), children: [
                "닫기 [",
                e.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ f("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: nt.map((d) => {
              const u = a.get(d) ?? [];
              if (u.length === 0) return null;
              const p = u.filter((h) => s[h.id]).length;
              return /* @__PURE__ */ g(
                "button",
                {
                  onClick: () => o(d),
                  style: {
                    flex: 1,
                    padding: "8px 4px",
                    background: r === d ? "#262626" : "transparent",
                    color: r === d ? "#7adf90" : "#ddd",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Pretendard', system-ui, sans-serif",
                    fontSize: 12
                  },
                  children: [
                    rt(d),
                    " (",
                    p,
                    "/",
                    u.length,
                    ")"
                  ]
                },
                d
              );
            }) }),
            /* @__PURE__ */ g("div", { style: { padding: "6px 14px", fontSize: 12, opacity: 0.7 }, children: [
              rt(r),
              " — ",
              c,
              "/",
              l.length,
              " 수집"
            ] }),
            /* @__PURE__ */ g("div", { style: { flex: 1, overflowY: "auto", padding: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }, children: [
              l.map((d) => {
                const u = s[d.id], p = !!u;
                return /* @__PURE__ */ g("div", { style: {
                  padding: 10,
                  borderRadius: 8,
                  background: p ? "#222" : "#181818",
                  border: p ? "1px solid #2e3" : "1px solid #2a2a2a",
                  opacity: p ? 1 : 0.4
                }, children: [
                  /* @__PURE__ */ g("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }, children: [
                    /* @__PURE__ */ f("span", { style: { width: 16, height: 16, borderRadius: 4, background: d.color ?? "#888" } }),
                    /* @__PURE__ */ f("strong", { style: { fontSize: 13 }, children: p ? d.name : "???" })
                  ] }),
                  p && /* @__PURE__ */ g("div", { style: { fontSize: 11, opacity: 0.7 }, children: [
                    "수집 ",
                    u.totalCollected,
                    " · day ",
                    u.firstSeenDay
                  ] })
                ] }, d.id);
              }),
              l.length === 0 && /* @__PURE__ */ f("div", { style: { opacity: 0.6 }, children: "이 카테고리에는 항목이 없습니다." })
            ] })
          ]
        }
      )
    }
  );
}
function rt(e) {
  switch (e) {
    case "fish":
      return "물고기";
    case "bug":
      return "곤충";
    case "food":
      return "음식";
    case "material":
      return "재료";
    case "furniture":
      return "가구";
    case "tool":
      return "도구";
    case "misc":
      return "기타";
  }
}
function Or() {
  return {
    padding: "4px 10px",
    background: "#444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12
  };
}
class zr {
  defs = /* @__PURE__ */ new Map();
  register(n) {
    this.defs.has(n.id) || this.defs.set(n.id, n);
  }
  registerAll(n) {
    for (const t of n) this.register(t);
  }
  get(n) {
    return this.defs.get(n);
  }
  require(n) {
    const t = this.defs.get(n);
    if (!t) throw new Error(`Unknown RecipeId: ${n}`);
    return t;
  }
  all() {
    return Array.from(this.defs.values());
  }
  has(n) {
    return this.defs.has(n);
  }
  clear() {
    this.defs.clear();
  }
}
let Pe = null;
function fe() {
  return Pe || (Pe = new zr()), Pe;
}
const le = Y((e, n) => ({
  unlocked: /* @__PURE__ */ new Set(),
  unlock: (t) => {
    const r = fe().get(t);
    if (!r || n().unlocked.has(t)) return;
    const o = new Set(n().unlocked);
    o.add(t), e({ unlocked: o }), L("info", `레시피 해금: ${r.name}`);
  },
  isUnlocked: (t) => {
    const r = fe().get(t);
    return r ? r.unlockedByDefault ? !0 : n().unlocked.has(t) : !1;
  },
  canCraft: (t) => {
    const r = fe().get(t);
    if (!r) return { ok: !1, reason: "unknown recipe" };
    if (!n().isUnlocked(t)) return { ok: !1, reason: "locked" };
    const o = R.getState();
    for (const s of r.ingredients)
      if (o.countOf(s.itemId) < s.count) return { ok: !1, reason: "missing ingredients" };
    return r.requireBells && $.getState().bells < r.requireBells ? { ok: !1, reason: "insufficient bells" } : { ok: !0 };
  },
  craft: (t) => {
    const r = n().canCraft(t);
    if (!r.ok) return r;
    const o = fe().require(t), s = R.getState();
    for (const a of o.ingredients)
      if (s.removeById(a.itemId, a.count) < a.count) return { ok: !1, reason: "remove failed" };
    return o.requireBells && !$.getState().spend(o.requireBells) ? { ok: !1, reason: "spend failed" } : (s.add(o.output.itemId, o.output.count) > 0 ? L("warn", "인벤토리 부족, 일부 결과물 폐기") : L("reward", `제작 완료: ${o.name}`), { ok: !0 });
  },
  serialize: () => ({ version: 1, unlocked: Array.from(n().unlocked) }),
  hydrate: (t) => {
    !t || !Array.isArray(t.unlocked) || e({ unlocked: new Set(t.unlocked) });
  }
})), Fr = "gaesup.crafting", Nr = "crafting", Ur = "crafting.store";
function Br() {
  return le.getState().serialize();
}
function Gr(e) {
  le.getState().hydrate(e);
}
function Vr(e = {}) {
  return j({
    id: e.id ?? Fr,
    name: "GaeSup Crafting",
    saveExtensionId: e.saveExtensionId ?? Nr,
    storeServiceId: e.storeServiceId ?? Ur,
    store: le,
    readyEvent: "crafting:ready",
    capabilities: ["crafting"],
    serialize: Br,
    hydrate: Gr
  });
}
const qi = Vr();
function Hi({ toggleKey: e = "c", title: n = "제작대", open: t, onClose: r }) {
  const [o, s] = z(!1), i = t !== void 0, a = i ? t : o, l = () => {
    i ? r?.() : s(!1);
  }, c = () => {
    i ? a && r?.() : s((m) => !m);
  }, d = le((m) => m.isUnlocked), u = le((m) => m.canCraft), p = le((m) => m.craft), h = R((m) => m.slots), y = $((m) => m.bells);
  if (E(() => {
    const m = (S) => {
      const w = S.target?.tagName?.toLowerCase();
      w === "input" || w === "textarea" || (S.key.toLowerCase() === e.toLowerCase() && c(), S.key === "Escape" && l());
    };
    return window.addEventListener("keydown", m), () => window.removeEventListener("keydown", m);
  }, [e, i, a]), !a) return null;
  const x = fe().all(), I = (() => {
    const m = /* @__PURE__ */ new Map();
    for (const S of h) S && m.set(S.itemId, (m.get(S.itemId) ?? 0) + S.count);
    return m;
  })();
  return /* @__PURE__ */ f(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: l,
      children: /* @__PURE__ */ g(
        "div",
        {
          onClick: (m) => m.stopPropagation(),
          style: {
            width: 600,
            maxHeight: "76vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            background: "#1a1a1a",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,200,120,0.35)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13
          },
          children: [
            /* @__PURE__ */ g("div", { style: { padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ f("strong", { style: { fontSize: 15 }, children: n }),
              /* @__PURE__ */ g("span", { style: { color: "#ffd84a" }, children: [
                y.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ g("button", { onClick: l, style: ot(), children: [
                "닫기 [",
                e.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ g("div", { style: { overflowY: "auto", padding: 10 }, children: [
              x.length === 0 && /* @__PURE__ */ f($r, { children: "레시피가 없습니다." }),
              x.map((m) => {
                const S = d(m.id), w = u(m.id), C = B().get(m.output.itemId);
                return /* @__PURE__ */ g("div", { style: {
                  padding: 10,
                  marginBottom: 6,
                  background: "#222",
                  borderRadius: 8,
                  opacity: S ? 1 : 0.45
                }, children: [
                  /* @__PURE__ */ g("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
                    /* @__PURE__ */ g("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      /* @__PURE__ */ f("span", { style: { width: 16, height: 16, borderRadius: 4, background: C?.color ?? "#888" } }),
                      /* @__PURE__ */ f("strong", { children: S ? m.name : "???" }),
                      m.output.count > 1 && /* @__PURE__ */ g("span", { style: { opacity: 0.7 }, children: [
                        "x",
                        m.output.count
                      ] })
                    ] }),
                    /* @__PURE__ */ f(
                      "button",
                      {
                        onClick: () => p(m.id),
                        disabled: !w.ok,
                        style: ot(w.ok),
                        children: "제작"
                      }
                    )
                  ] }),
                  S && /* @__PURE__ */ g("div", { style: { fontSize: 12, opacity: 0.85 }, children: [
                    "재료: ",
                    m.ingredients.map((P) => {
                      const F = I.get(P.itemId) ?? 0, b = F >= P.count, M = B().get(P.itemId);
                      return /* @__PURE__ */ g("span", { style: { marginRight: 8, color: b ? "#7adf90" : "#ff8a8a" }, children: [
                        M?.name ?? P.itemId,
                        " ",
                        F,
                        "/",
                        P.count
                      ] }, P.itemId);
                    }),
                    m.requireBells ? /* @__PURE__ */ g("span", { style: { color: "#ffd84a" }, children: [
                      "· ",
                      m.requireBells,
                      " B"
                    ] }) : null
                  ] })
                ] }, m.id);
              })
            ] })
          ]
        }
      )
    }
  );
}
function $r({ children: e }) {
  return /* @__PURE__ */ f("div", { style: { padding: 14, opacity: 0.6 }, children: e });
}
function ot(e) {
  return {
    padding: "5px 10px",
    background: e ? "#ffc878" : "#333",
    color: e ? "#1a1a1a" : "#777",
    border: "none",
    borderRadius: 6,
    cursor: e ? "pointer" : "not-allowed",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: e ? 700 : 400
  };
}
class Wr {
  defs = /* @__PURE__ */ new Map();
  register(n) {
    this.defs.has(n.id) || this.defs.set(n.id, n);
  }
  registerAll(n) {
    for (const t of n) this.register(t);
  }
  get(n) {
    return this.defs.get(n);
  }
  require(n) {
    const t = this.defs.get(n);
    if (!t) throw new Error(`Unknown CropId: ${n}`);
    return t;
  }
  bySeedItemId(n) {
    for (const t of this.defs.values()) if (t.seedItemId === n) return t;
  }
  all() {
    return Array.from(this.defs.values());
  }
  has(n) {
    return this.defs.has(n);
  }
  clear() {
    this.defs.clear();
  }
}
let De = null;
function se() {
  return De || (De = new Wr()), De;
}
function st(e, n) {
  return { id: e, position: n, state: "empty", stageIndex: 0 };
}
function jr(e, n) {
  if (e.state !== "planted" && e.state !== "mature") return e.stageIndex;
  const t = e.cropId ? se().get(e.cropId) : void 0;
  if (!t || e.plantedAt === void 0) return e.stageIndex;
  let r = n - e.plantedAt;
  for (let o = 0; o < t.stages.length; o++) {
    const s = t.stages[o];
    if (s.durationMinutes <= 0 || r < s.durationMinutes) return o;
    r -= s.durationMinutes;
  }
  return t.stages.length - 1;
}
const H = Y((e, n) => ({
  plots: {},
  registerPlot: (t) => {
    if (n().plots[t.id]) return;
    const o = { ...st(t.id, t.position), ...t };
    e({ plots: { ...n().plots, [t.id]: o } });
  },
  unregisterPlot: (t) => {
    if (!n().plots[t]) return;
    const r = { ...n().plots };
    delete r[t], e({ plots: r });
  },
  till: (t) => {
    const r = n().plots[t];
    return !r || r.state !== "empty" ? !1 : (e({ plots: { ...n().plots, [t]: { ...r, state: "tilled", stageIndex: 0 } } }), !0);
  },
  plant: (t, r, o) => {
    const s = n().plots[t], i = se().get(r);
    if (!s || !i || s.state !== "tilled") return !1;
    const a = R.getState();
    return a.countOf(i.seedItemId) < 1 ? (L("warn", `${i.name} 씨앗 부족`), !1) : (a.removeById(i.seedItemId, 1), e({
      plots: {
        ...n().plots,
        [t]: {
          ...s,
          state: "planted",
          cropId: r,
          plantedAt: o,
          lastWateredAt: o,
          stageIndex: 0
        }
      }
    }), L("success", `${i.name} 심음`), !0);
  },
  water: (t, r) => {
    const o = n().plots[t];
    if (!o || o.state !== "planted" && o.state !== "dried") return !1;
    let s = { ...o, lastWateredAt: r };
    return o.state === "dried" && (s = { ...s, state: "planted" }), e({ plots: { ...n().plots, [t]: s } }), !0;
  },
  harvest: (t) => {
    const r = n().plots[t];
    if (!r || r.state !== "mature" || !r.cropId) return !1;
    const o = se().get(r.cropId);
    return o ? R.getState().add(o.yieldItemId, o.yieldCount) > 0 ? (L("warn", "인벤토리가 가득 찼습니다"), !1) : (L("reward", `${o.name} +${o.yieldCount}`), e({
      plots: {
        ...n().plots,
        [t]: {
          ...st(r.id, r.position),
          state: "tilled"
        }
      }
    }), !0) : !1;
  },
  tick: (t) => {
    const r = n().plots, o = {};
    let s = !1;
    for (const [i, a] of Object.entries(r)) {
      let l = a;
      if (l.state === "planted" || l.state === "mature") {
        const c = l.cropId ? se().get(l.cropId) : void 0;
        if (c && l.plantedAt !== void 0) {
          const d = l.lastWateredAt ?? l.plantedAt;
          if (t - d >= c.driedOutMinutes)
            l = { ...l, state: "dried" }, s = !0;
          else {
            const u = jr(l, t), p = c.stages.length - 1, h = u >= p ? "mature" : "planted";
            (u !== l.stageIndex || h !== l.state) && (l = { ...l, stageIndex: u, state: h }, s = !0);
          }
        }
      }
      o[i] = l;
    }
    s && e({ plots: o });
  },
  near: (t, r, o) => {
    const s = o * o;
    let i = null, a = 1 / 0;
    for (const l of Object.values(n().plots)) {
      const c = l.position[0] - t, d = l.position[2] - r, u = c * c + d * d;
      u < s && u < a && (a = u, i = l);
    }
    return i;
  },
  serialize: () => ({ version: 1, plots: Object.values(n().plots).map((t) => ({ ...t })) }),
  hydrate: (t) => {
    if (!t || !Array.isArray(t.plots)) return;
    const r = {};
    for (const o of t.plots) o?.id && (r[o.id] = { ...o });
    e({ plots: r });
  }
})), qr = "gaesup.farming", Hr = "farming", Xr = "farming.store";
function Yr() {
  return H.getState().serialize();
}
function Kr(e) {
  H.getState().hydrate(e);
}
function Qr(e = {}) {
  return j({
    id: e.id ?? qr,
    name: "GaeSup Farming",
    saveExtensionId: e.saveExtensionId ?? Hr,
    storeServiceId: e.storeServiceId ?? Xr,
    store: H,
    readyEvent: "farming:ready",
    capabilities: ["farming"],
    serialize: Yr,
    hydrate: Kr
  });
}
const Xi = Qr();
function Zr(e, n, t) {
  const r = n.origin[0] - e.position[0], o = n.origin[2] - e.position[2];
  return r * r + o * o <= t * t;
}
let be = 0, Se = 0, ve = null;
const we = /* @__PURE__ */ new Map();
function it() {
  let e = 0;
  for (const n of we.values())
    e = Math.max(e, n);
  Se = e;
}
function Ge(e) {
  if (Se <= 0) return null;
  const n = H.getState().near(e.origin[0], e.origin[2], Se);
  if (!n) return null;
  const t = we.get(n.id) ?? Se;
  return Zr(n, e, t) ? n : null;
}
function Jr(e) {
  const n = Ge(e);
  if (!n) return;
  const t = H.getState(), r = t.plots[n.id];
  if (!r) return;
  if (r.state === "mature") return t.harvest(r.id) ? !0 : void 0;
  if (r.state !== "empty") return;
  const o = t.till(r.id);
  return o && L("info", "땅을 갈았다"), o ? !0 : void 0;
}
function eo(e) {
  const n = Ge(e);
  if (!n || n.state !== "tilled") return;
  const t = R.getState().getEquipped();
  if (!t) return;
  const r = se().bySeedItemId(t.itemId);
  if (!r) return;
  const o = T.getState().totalMinutes;
  return H.getState().plant(n.id, r.id, o) ? !0 : void 0;
}
function to(e) {
  const n = Ge(e);
  if (!n || n.state !== "planted" && n.state !== "dried") return;
  const t = T.getState().totalMinutes, r = H.getState().water(n.id, t);
  return r && L("info", "물을 줬다"), r ? !0 : void 0;
}
function no() {
  if (be += 1, ve) return;
  const e = ye().on("shovel", Jr), n = ye().on("seed", eo), t = ye().on("water", to);
  let r = Number.NaN;
  const o = (i) => {
    i !== r && (r = i, H.getState().tick(i));
  }, s = T.subscribe((i) => {
    o(i.totalMinutes);
  });
  o(T.getState().totalMinutes), ve = () => {
    e(), n(), t(), s(), ve = null;
  };
}
function ro() {
  be = Math.max(0, be - 1), !(be > 0) && ve?.();
}
function Yi({ id: e, position: n, size: t = 1.4, hitRange: r = 1.6 }) {
  const o = H((u) => u.registerPlot), s = H((u) => u.unregisterPlot), i = H((u) => u.plots[e]);
  E(() => (o({ id: e, position: n }), we.set(e, r), it(), no(), () => {
    ro(), we.delete(e), it(), s(e);
  }), [e, n, r, o, s]);
  const a = i?.cropId ? se().get(i.cropId) : void 0, l = a ? a.stages[i.stageIndex] : void 0, c = A(() => !i || i.state === "empty" ? "#5a3f24" : i.state === "tilled" ? "#4a2f18" : i.state === "dried" ? "#6b5230" : "#3a2810", [i]), d = _(null);
  return ee(({ clock: u }) => {
    const p = d.current;
    if (!p) return;
    const h = u.elapsedTime;
    p.rotation.y = Math.sin(h * 0.4) * 0.05, p.position.y = (l?.scale ?? 0.3) * 0.5 + Math.sin(h * 1.2) * 0.01;
  }), /* @__PURE__ */ g("group", { position: n, children: [
    /* @__PURE__ */ g("mesh", { receiveShadow: !0, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: [
      /* @__PURE__ */ f("planeGeometry", { args: [t, t] }),
      /* @__PURE__ */ f("meshToonMaterial", { color: c })
    ] }),
    i && (i.state === "planted" || i.state === "mature" || i.state === "dried") && a && l && /* @__PURE__ */ g("mesh", { ref: d, castShadow: !0, position: [0, l.scale * 0.5, 0], children: [
      /* @__PURE__ */ f("coneGeometry", { args: [Math.max(0.08, l.scale * 0.35), Math.max(0.16, l.scale * 0.9), 10] }),
      /* @__PURE__ */ f("meshToonMaterial", { color: i.state === "dried" ? "#7a6a4a" : l.color ?? "#9adf90" })
    ] }),
    i?.state === "mature" && /* @__PURE__ */ g("mesh", { position: [0, 1, 0], children: [
      /* @__PURE__ */ f("ringGeometry", { args: [0.18, 0.24, 16] }),
      /* @__PURE__ */ f("meshBasicMaterial", { color: "#ffd84a", transparent: !0, opacity: 0.85, depthWrite: !1 })
    ] })
  ] });
}
const oo = [
  {
    id: "crop.turnip",
    name: "순무",
    seedItemId: "seed-turnip",
    yieldItemId: "turnip",
    yieldCount: 2,
    waterIntervalMinutes: 60 * 8,
    driedOutMinutes: 60 * 16,
    stages: [
      { durationMinutes: 60 * 6, scale: 0.3, color: "#8acf8a" },
      { durationMinutes: 60 * 8, scale: 0.6, color: "#a8df9c", needsWater: !0 },
      { durationMinutes: 60 * 10, scale: 0.9, color: "#cfeeb6", needsWater: !0 },
      { durationMinutes: 0, scale: 1, color: "#ffeeaa" }
    ]
  },
  {
    id: "crop.tomato",
    name: "토마토",
    seedItemId: "seed-tomato",
    yieldItemId: "tomato",
    yieldCount: 3,
    waterIntervalMinutes: 60 * 6,
    driedOutMinutes: 60 * 12,
    stages: [
      { durationMinutes: 60 * 8, scale: 0.3, color: "#7adf90" },
      { durationMinutes: 60 * 12, scale: 0.6, color: "#9adf90", needsWater: !0 },
      { durationMinutes: 60 * 12, scale: 0.9, color: "#cfdf90", needsWater: !0 },
      { durationMinutes: 0, scale: 1.1, color: "#e54b4b" }
    ]
  }
];
let at = !1;
function Ki() {
  at || (at = !0, se().registerAll(oo));
}
const so = "gaesup.weather", io = "weather", ao = "weather.store";
function co() {
  return W.getState().serialize();
}
function lo(e) {
  W.getState().hydrate(e);
}
function uo(e = {}) {
  const n = e.id ?? so, t = e.saveExtensionId ?? io, r = e.storeServiceId ?? ao;
  return {
    id: n,
    name: "GaeSup Weather",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["weather"],
    setup(o) {
      o.save.register(t, {
        key: t,
        serialize: co,
        hydrate: lo
      }, n), o.services.register(r, {
        useStore: W,
        getState: W.getState,
        setState: W.setState
      }, n), o.events.emit("weather:ready", {
        pluginId: n,
        saveExtensionId: t,
        storeServiceId: r
      });
    },
    dispose(o) {
      o.save.remove(t), o.services.remove(r);
    }
  };
}
const Qi = uo(), fo = {
  sunny: { sym: "O", color: "#ffd84a", label: "맑음" },
  cloudy: { sym: "c", color: "#aab2bc", label: "흐림" },
  rain: { sym: "r", color: "#4aa8ff", label: "비" },
  snow: { sym: "*", color: "#dff0ff", label: "눈" },
  storm: { sym: "!", color: "#7f7fff", label: "폭풍" }
};
function Zi({ position: e = "top-left" }) {
  const n = W((o) => o.current);
  if (!n) return null;
  const t = fo[n.kind], r = e === "top-right" ? { top: 50, right: 12 } : { top: 50, left: 12 };
  return /* @__PURE__ */ g(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 90,
        padding: "4px 10px",
        background: "rgba(20,20,28,0.85)",
        color: "#fff",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 12,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: `inset 0 0 0 1px ${t.color}55`,
        pointerEvents: "none",
        userSelect: "none",
        ...r
      },
      children: [
        /* @__PURE__ */ f("span", { style: {
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: t.color,
          color: "#1a1a1a",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 11
        }, children: t.sym }),
        /* @__PURE__ */ f("span", { children: t.label })
      ]
    }
  );
}
function Ji(e = !0) {
  E(() => {
    if (!e) return;
    const n = () => {
      const r = T.getState(), o = Math.floor(r.totalMinutes / (60 * 24)), s = W.getState().current;
      (!s || s.day !== o) && W.getState().rollForDay(o, r.time.season);
    };
    return n(), T.subscribe((r, o) => {
      const s = Math.floor(r.totalMinutes / 1440), i = Math.floor(o.totalMinutes / (60 * 24));
      s !== i && n();
    });
  }, [e]);
}
function ct(e, n) {
  return { id: e, position: n, size: [4, 4], state: "empty" };
}
const q = Y((e, n) => ({
  houses: {},
  residents: {},
  decorationScore: 0,
  registerHouse: (t) => {
    if (n().houses[t.id]) return;
    const o = { ...ct(t.id, t.position), ...t };
    e({ houses: { ...n().houses, [t.id]: o } });
  },
  unregisterHouse: (t) => {
    const r = { ...n().houses };
    r[t] && (delete r[t], e({ houses: r }));
  },
  registerResident: (t) => {
    n().residents[t.id] || e({ residents: { ...n().residents, [t.id]: t } });
  },
  removeResident: (t) => {
    const r = { ...n().residents };
    if (r[t]) {
      delete r[t], e({ residents: r });
      for (const o of Object.values(n().houses))
        o.residentId === t && n().moveOut(o.id), o.reservedFor === t && n().cancelReservation(o.id);
    }
  },
  reserveHouse: (t, r, o) => {
    const s = n().houses[t];
    return !s || s.state !== "empty" ? !1 : (e({
      houses: {
        ...n().houses,
        [t]: {
          ...s,
          state: "reserved",
          reservedFor: r,
          ...o !== void 0 ? { reservedUntilDay: o } : {}
        }
      }
    }), !0);
  },
  cancelReservation: (t) => {
    const r = n().houses[t];
    if (!r || r.state !== "reserved") return;
    const o = { ...r, state: "empty" };
    delete o.reservedFor, delete o.reservedUntilDay, e({ houses: { ...n().houses, [t]: o } });
  },
  moveIn: (t, r, o) => {
    const s = n().houses[t], i = n().residents[r];
    return !s || !i || s.state === "occupied" ? !1 : (e({
      houses: {
        ...n().houses,
        [t]: {
          ...s,
          state: "occupied",
          residentId: r
        }
      },
      residents: {
        ...n().residents,
        [r]: { ...i, movedInDay: o }
      }
    }), L("reward", `${i.name}이(가) 이사 왔다!`), !0);
  },
  moveOut: (t) => {
    const r = n().houses[t];
    if (!r || r.state !== "occupied") return !1;
    const o = r.residentId ? n().residents[r.residentId] : null;
    return e({
      houses: {
        ...n().houses,
        [t]: ct(t, r.position)
      }
    }), o && L("info", `${o.name}이(가) 떠났다`), !0;
  },
  setDecorationScore: (t) => e({ decorationScore: Math.max(0, Math.floor(t)) }),
  stats: () => {
    const t = Object.values(n().houses), r = t.filter((o) => o.state === "occupied").length;
    return {
      decorationScore: n().decorationScore,
      residentCount: Object.keys(n().residents).length,
      occupiedHouses: r,
      totalHouses: t.length
    };
  },
  serialize: () => ({
    version: 1,
    houses: Object.values(n().houses).map((t) => ({ ...t })),
    residents: Object.values(n().residents).map((t) => ({ ...t }))
  }),
  hydrate: (t) => {
    if (!t) return;
    const r = {}, o = {};
    if (Array.isArray(t.houses))
      for (const s of t.houses) s?.id && (r[s.id] = { ...s });
    if (Array.isArray(t.residents))
      for (const s of t.residents) s?.id && (o[s.id] = { ...s });
    e({ houses: r, residents: o });
  }
})), po = "gaesup.town", mo = "town", go = "town.store";
function ho() {
  return q.getState().serialize();
}
function yo(e) {
  q.getState().hydrate(e);
}
function bo(e = {}) {
  return j({
    id: e.id ?? po,
    name: "GaeSup Town",
    saveExtensionId: e.saveExtensionId ?? mo,
    storeServiceId: e.storeServiceId ?? go,
    store: q,
    readyEvent: "town:ready",
    capabilities: ["town"],
    serialize: ho,
    hydrate: yo
  });
}
const ea = bo(), So = {
  tile: 2,
  wall: 1,
  placedObject: 5,
  base: 0
};
function ta(e = !0, n = {}) {
  E(() => {
    if (!e) return;
    const t = { ...So, ...n }, r = (s) => {
      let i = 0, a = 0;
      const l = s.objects.length;
      for (const d of s.tileGroups.values())
        i += d.tiles.length;
      for (const d of s.wallGroups.values())
        a += d.walls.length;
      const c = t.base + i * t.tile + a * t.wall + l * t.placedObject;
      q.getState().setDecorationScore(c);
    };
    return r(Ie.getState()), Ie.subscribe((s) => r(s));
  }, [e, n.tile, n.wall, n.placedObject, n.base]);
}
function na({
  id: e,
  position: n,
  size: t = [4, 4],
  emptyColor: r = "#705038",
  reservedColor: o = "#c8a85a",
  occupiedColor: s = "#5a8acf"
}) {
  const i = q((h) => h.registerHouse), a = q((h) => h.unregisterHouse), l = q((h) => h.houses[e]), c = q((h) => h.residents);
  E(() => (i({ id: e, position: n, size: t }), () => a(e)), [e, n, t, i, a]);
  const d = l ? l.state === "occupied" ? s : l.state === "reserved" ? o : r : r, u = l?.residentId ? c[l.residentId] : null, p = A(() => new v.PlaneGeometry(t[0], t[1]), [t[0], t[1]]);
  return /* @__PURE__ */ g("group", { position: n, children: [
    /* @__PURE__ */ f("mesh", { geometry: p, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: /* @__PURE__ */ f("meshToonMaterial", { color: d, transparent: !0, opacity: 0.7 }) }),
    l?.state === "occupied" && u && /* @__PURE__ */ g(J, { children: [
      /* @__PURE__ */ g("mesh", { position: [0, 0.6, 0], castShadow: !0, children: [
        /* @__PURE__ */ f("boxGeometry", { args: [Math.max(1.4, t[0] * 0.6), 1.2, Math.max(1.4, t[1] * 0.6)] }),
        /* @__PURE__ */ f("meshToonMaterial", { color: u.bodyColor ?? "#e8d8b8" })
      ] }),
      /* @__PURE__ */ g("mesh", { position: [0, 1.5, 0], castShadow: !0, children: [
        /* @__PURE__ */ f("coneGeometry", { args: [Math.max(1, t[0] * 0.45), 0.7, 4] }),
        /* @__PURE__ */ f("meshToonMaterial", { color: u.hatColor ?? "#a85a5a" })
      ] })
    ] }),
    l?.state === "reserved" && /* @__PURE__ */ g("mesh", { position: [0, 0.5, 0], children: [
      /* @__PURE__ */ f("boxGeometry", { args: [0.4, 1, 0.4] }),
      /* @__PURE__ */ f("meshToonMaterial", { color: o })
    ] })
  ] });
}
function ra({ position: e = "top-right", offset: n }) {
  const t = q((d) => d.decorationScore), r = q((d) => d.houses), o = q((d) => d.residents), s = Object.keys(r).length, i = Object.values(r).filter((d) => d.state === "occupied").length, a = Object.keys(o).length, c = { ...e === "bottom-right" ? { bottom: 12, right: 100 } : e === "top-left" ? { top: 160, left: 12 } : e === "bottom-left" ? { bottom: 12, left: 240 } : { top: 50, right: 12 }, ...n ?? {} };
  return /* @__PURE__ */ g(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 90,
        padding: "6px 10px",
        background: "rgba(20,20,28,0.85)",
        color: "#fff",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 11,
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        pointerEvents: "none",
        userSelect: "none",
        ...c
      },
      children: [
        /* @__PURE__ */ g("div", { children: [
          "마을 점수 ",
          /* @__PURE__ */ f("span", { style: { color: "#ffd84a", fontWeight: 700 }, children: t })
        ] }),
        /* @__PURE__ */ g("div", { children: [
          "주민 ",
          i,
          "/",
          s,
          " (등록 ",
          a,
          ")"
        ] })
      ]
    }
  );
}
class vo {
  ctx = null;
  masterGain = null;
  bgmGain = null;
  sfxGain = null;
  bgmInterval = null;
  bgmStep = 0;
  currentBgm = null;
  bufferCache = /* @__PURE__ */ new Map();
  ensure() {
    if (this.ctx) return !0;
    if (typeof window > "u" || typeof window.AudioContext > "u") return !1;
    try {
      return this.ctx = new window.AudioContext(), this.masterGain = this.ctx.createGain(), this.masterGain.connect(this.ctx.destination), this.bgmGain = this.ctx.createGain(), this.sfxGain = this.ctx.createGain(), this.bgmGain.connect(this.masterGain), this.sfxGain.connect(this.masterGain), !0;
    } catch {
      return !1;
    }
  }
  resume() {
    this.ctx?.state === "suspended" && this.ctx.resume();
  }
  setMasterVolume(n) {
    !this.ensure() || !this.masterGain || (this.masterGain.gain.value = Math.max(0, Math.min(1, n)));
  }
  setBgmVolume(n) {
    !this.ensure() || !this.bgmGain || (this.bgmGain.gain.value = Math.max(0, Math.min(1, n)));
  }
  setSfxVolume(n) {
    !this.ensure() || !this.sfxGain || (this.sfxGain.gain.value = Math.max(0, Math.min(1, n)));
  }
  playSfx(n) {
    if (!this.ensure() || !this.ctx || !this.sfxGain) return;
    if (n.url) {
      this.playFromUrl(n.url, this.sfxGain, n.volume ?? 1);
      return;
    }
    const t = this.ctx.createOscillator(), r = this.ctx.createGain();
    t.type = n.type ?? "sine", t.frequency.value = n.freq ?? 440;
    const o = n.duration ?? 0.12, s = this.ctx.currentTime;
    r.gain.setValueAtTime(0, s), r.gain.linearRampToValueAtTime((n.volume ?? 1) * 0.3, s + 5e-3), r.gain.exponentialRampToValueAtTime(1e-4, s + o), t.connect(r), r.connect(this.sfxGain), t.start(s), t.stop(s + o + 0.05);
  }
  playBgm(n) {
    if (!this.ensure() || !this.ctx || !this.bgmGain || (this.stopBgm(), !n)) return;
    if (this.currentBgm = n, n.url) {
      this.playFromUrl(n.url, this.bgmGain, n.volume ?? 1, !0);
      return;
    }
    const t = n.pattern ?? [0, 4, 7, 4], r = n.intervalMs ?? 800, o = n.baseFreq ?? 220;
    this.bgmStep = 0;
    const s = () => {
      if (!this.ctx || !this.bgmGain) return;
      const i = t[this.bgmStep % t.length] ?? 0, a = o * Math.pow(2, i / 12), l = this.ctx.createOscillator(), c = this.ctx.createGain();
      l.type = "triangle", l.frequency.value = a;
      const d = this.ctx.currentTime;
      c.gain.setValueAtTime(0, d), c.gain.linearRampToValueAtTime((n.volume ?? 1) * 0.18, d + 0.04), c.gain.exponentialRampToValueAtTime(1e-4, d + r / 1e3 * 0.95), l.connect(c), c.connect(this.bgmGain), l.start(d), l.stop(d + r / 1e3 + 0.05), this.bgmStep += 1;
    };
    s(), this.bgmInterval = window.setInterval(s, r);
  }
  stopBgm() {
    this.bgmInterval !== null && (window.clearInterval(this.bgmInterval), this.bgmInterval = null), this.currentBgm = null;
  }
  getCurrentBgmId() {
    return this.currentBgm?.id ?? null;
  }
  async playFromUrl(n, t, r, o = !1) {
    if (this.ctx)
      try {
        let s = this.bufferCache.get(n);
        if (!s) {
          const c = await (await fetch(n)).arrayBuffer();
          s = await this.ctx.decodeAudioData(c), this.bufferCache.set(n, s);
        }
        const i = this.ctx.createBufferSource();
        i.buffer = s, i.loop = o;
        const a = this.ctx.createGain();
        a.gain.value = r, i.connect(a), a.connect(t), i.start();
      } catch {
      }
  }
}
let Ae = null;
function ce() {
  return Ae || (Ae = new vo()), Ae;
}
const N = Y((e, n) => ({
  masterMuted: !1,
  bgmMuted: !1,
  sfxMuted: !1,
  masterVolume: 0.6,
  bgmVolume: 0.4,
  sfxVolume: 0.7,
  currentBgmId: null,
  setMaster: (t) => {
    e({ masterVolume: Math.max(0, Math.min(1, t)) }), n().apply();
  },
  setBgm: (t) => {
    e({ bgmVolume: Math.max(0, Math.min(1, t)) }), n().apply();
  },
  setSfx: (t) => {
    e({ sfxVolume: Math.max(0, Math.min(1, t)) }), n().apply();
  },
  toggleMaster: () => {
    e({ masterMuted: !n().masterMuted }), n().apply();
  },
  toggleBgm: () => {
    e({ bgmMuted: !n().bgmMuted }), n().apply();
  },
  toggleSfx: () => {
    e({ sfxMuted: !n().sfxMuted }), n().apply();
  },
  playSfx: (t) => {
    const r = n();
    r.masterMuted || r.sfxMuted || (ce().resume(), ce().playSfx(t));
  },
  playBgm: (t) => {
    ce().resume(), ce().playBgm(t), e({ currentBgmId: t?.id ?? null }), n().apply();
  },
  stopBgm: () => {
    ce().stopBgm(), e({ currentBgmId: null });
  },
  apply: () => {
    const t = n(), r = ce();
    r.setMasterVolume(t.masterMuted ? 0 : t.masterVolume), r.setBgmVolume(t.bgmMuted ? 0 : t.bgmVolume), r.setSfxVolume(t.sfxMuted ? 0 : t.sfxVolume);
  },
  serialize: () => {
    const t = n();
    return {
      version: 1,
      masterMuted: t.masterMuted,
      bgmMuted: t.bgmMuted,
      sfxMuted: t.sfxMuted,
      masterVolume: t.masterVolume,
      bgmVolume: t.bgmVolume,
      sfxVolume: t.sfxVolume
    };
  },
  hydrate: (t) => {
    t && (e({
      masterMuted: !!t.masterMuted,
      bgmMuted: !!t.bgmMuted,
      sfxMuted: !!t.sfxMuted,
      masterVolume: typeof t.masterVolume == "number" ? t.masterVolume : 0.6,
      bgmVolume: typeof t.bgmVolume == "number" ? t.bgmVolume : 0.4,
      sfxVolume: typeof t.sfxVolume == "number" ? t.sfxVolume : 0.7
    }), n().apply());
  }
})), xo = "gaesup.audio", Io = "audio", wo = "audio.store";
function Eo() {
  return N.getState().serialize();
}
function ko(e) {
  N.getState().hydrate(e);
}
function Co(e = {}) {
  const n = e.id ?? xo, t = e.saveExtensionId ?? Io, r = e.storeServiceId ?? wo;
  return {
    id: n,
    name: "GaeSup Audio",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["audio"],
    setup(o) {
      o.save.register(t, {
        key: t,
        serialize: Eo,
        hydrate: ko
      }, n), o.services.register(r, {
        useStore: N,
        getState: N.getState,
        setState: N.setState
      }, n), o.events.emit("audio:ready", {
        pluginId: n,
        saveExtensionId: t,
        storeServiceId: r
      });
    },
    dispose(o) {
      o.save.remove(t), o.services.remove(r);
    }
  };
}
const oa = Co(), _o = [0, 2, 4, 5, 7, 9, 11], Mo = [0, 2, 3, 5, 7, 8, 10];
function Ro(e) {
  return e === "rain" || e === "storm" || e === "snow" ? Mo : _o;
}
function To(e) {
  return e < 6 ? "night" : e < 10 ? "dawn" : e < 18 ? "day" : e < 22 ? "dusk" : "night";
}
function Po(e, n) {
  const t = To(e), r = Ro(n), o = t === "night" ? 174.6 : t === "dawn" ? 220 : t === "dusk" ? 196 : 261.6, s = t === "day" ? 700 : 950, i = [r[0], r[2], r[4], r[2], r[0], r[3], r[1], r[4]];
  return {
    id: `bgm.${t}.${n ?? "unknown"}`,
    baseFreq: o,
    intervalMs: s,
    pattern: i,
    volume: n === "storm" ? 0.6 : 1
  };
}
function sa(e = !0) {
  E(() => {
    if (!e) return;
    const n = () => {
      const o = T.getState(), s = W.getState().current, i = Po(o.time.hour, s?.kind);
      N.getState().currentBgmId !== i.id && N.getState().playBgm(i);
    }, t = T.subscribe((o, s) => {
      o.time.hour !== s.time.hour && n();
    }), r = W.subscribe((o, s) => {
      o.current?.kind !== s.current?.kind && n();
    });
    return n(), () => {
      t(), r(), N.getState().stopBgm();
    };
  }, [e]);
}
function ia({ position: e = "bottom-right", offset: n }) {
  const t = N((u) => u.masterMuted), r = N((u) => u.bgmMuted), o = N((u) => u.sfxMuted), s = N((u) => u.toggleMaster), i = N((u) => u.toggleBgm), a = N((u) => u.toggleSfx), c = { ...e === "top-right" ? { top: 50, right: 200 } : e === "bottom-left" ? { bottom: 12, left: 240 } : e === "top-left" ? { top: 220, left: 12 } : { bottom: 12, right: 110 }, ...n ?? {} }, d = (u, p, h) => /* @__PURE__ */ g(
    "button",
    {
      onClick: h,
      style: {
        padding: "4px 8px",
        background: p ? "rgba(80,30,30,0.85)" : "rgba(20,20,28,0.85)",
        color: p ? "#ff8a8a" : "#fff",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 11,
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 6,
        cursor: "pointer"
      },
      children: [
        u,
        p ? " OFF" : ""
      ]
    }
  );
  return /* @__PURE__ */ g(
    "div",
    {
      style: {
        position: "fixed",
        zIndex: 95,
        display: "flex",
        gap: 4,
        pointerEvents: "auto",
        ...c
      },
      children: [
        d("M", t, s),
        d("Bgm", r, i),
        d("Sfx", o, a)
      ]
    }
  );
}
const Do = {
  grass: { freq: 320, duration: 0.07, type: "triangle", volume: 0.18 },
  sand: { freq: 220, duration: 0.1, type: "sine", volume: 0.2 },
  snow: { freq: 380, duration: 0.1, type: "triangle", volume: 0.22 },
  wood: { freq: 540, duration: 0.06, type: "square", volume: 0.14 },
  stone: { freq: 760, duration: 0.05, type: "square", volume: 0.16 },
  water: { freq: 180, duration: 0.13, type: "sine", volume: 0.24 }
};
function Ao(e, n) {
  const t = Rt.GRID_CELL_SIZE, r = Ie.getState().tileGroups;
  for (const o of r.values())
    for (const s of o.tiles) {
      const i = (s.size || 1) * t / 2;
      if (!(Math.abs(s.position.x - e) > i) && !(Math.abs(s.position.z - n) > i)) {
        switch (s.objectType) {
          case "water":
            return "water";
          case "sand":
            return "sand";
          case "snowfield":
            return "snow";
          case "grass":
            return "grass";
        }
        return s.shape === "stairs" || s.shape === "ramp" ? "wood" : "stone";
      }
    }
  return "grass";
}
function aa({
  strideMeters: e = 0.65,
  maxStepsPerSecond: n = 6,
  volume: t = 1,
  resolveSurface: r = Ao,
  enabled: o = !0
} = {}) {
  const { position: s, isGrounded: i, isMoving: a, speed: l } = ie({ updateInterval: 32 }), c = _({ x: s.x, z: s.z }), d = _(0), u = _(0);
  return E(() => {
    c.current.x = s.x, c.current.z = s.z;
  }, []), ee(() => {
    if (!o) return;
    const p = performance.now(), h = s.x - c.current.x, y = s.z - c.current.z;
    if (c.current.x = s.x, c.current.z = s.z, !i || !a) {
      d.current = 0;
      return;
    }
    const x = Math.hypot(h, y);
    if (x <= 0 || (d.current += x, d.current < e) || p - u.current < 1e3 / n) return;
    d.current = 0, u.current = p;
    const I = r(s.x, s.z), m = Do[I], S = Math.min(1.4, 0.7 + l * 0.06);
    N.getState().playSfx({
      id: `footstep-${I}`,
      type: m.type ?? "sine",
      freq: m.freq ?? 320,
      duration: m.duration ?? 0.08,
      volume: (m.volume ?? 0.2) * t * S
    });
  }), null;
}
const Lo = "gaesup.character", Oo = "character", zo = "character.store";
function Fo() {
  return G.getState().serialize();
}
function No(e) {
  G.getState().hydrate(e);
}
function Uo(e = {}) {
  return j({
    id: e.id ?? Lo,
    name: "GaeSup Character",
    saveExtensionId: e.saveExtensionId ?? Oo,
    storeServiceId: e.storeServiceId ?? zo,
    store: G,
    readyEvent: "character:ready",
    capabilities: ["character"],
    serialize: Fo,
    hydrate: No
  });
}
const ca = Uo(), Bo = [
  { key: "body", label: "피부" },
  { key: "hair", label: "머리" },
  { key: "hat", label: "모자" },
  { key: "top", label: "상의" },
  { key: "bottom", label: "하의" },
  { key: "shoes", label: "신발" }
], Go = ["short", "long", "cap", "bun", "spiky"], Vo = ["default", "smile", "wink", "sleepy", "surprised"], lt = ["hat", "top", "bottom", "shoes", "face", "weapon", "accessory"], $o = (e, n) => n === "weapon" ? e.kind === "weapon" || e.slot === "weapon" : e.slot === n && (e.kind === "characterPart" || e.kind === "weapon");
function la({ toggleKey: e, open: n, onClose: t } = {}) {
  const r = typeof n == "boolean", [o, s] = z(!1), i = r ? n : o, a = G((b) => b.appearance), l = G((b) => b.outfits), c = G((b) => b.setName), d = G((b) => b.setColor), u = G((b) => b.setHair), p = G((b) => b.setFace), h = G((b) => b.equipOutfit), y = G((b) => b.resetAppearance), x = je((b) => b.ids), I = je((b) => b.records), [m, S] = z(""), [w, C] = z(!1), P = A(() => {
    const b = m.trim().toLowerCase();
    return lt.reduce((M, O) => (M[O] = x.map((k) => I[k]).filter((k) => !!k).filter((k) => $o(k, O)).filter((k) => b ? k.tags?.some((D) => D.toLowerCase().includes(b)) ?? !1 : !0).filter((k) => !w || k.metadata?.owned !== !1), M), {});
  }, [x, I, w, m]);
  if (E(() => {
    if (!e || r) return;
    const b = (M) => {
      const O = M.target?.tagName?.toLowerCase();
      if (O === "input" || O === "textarea") return;
      const k = e.toLowerCase(), D = `Key${e.toUpperCase()}`;
      M.code !== D && M.key.toLowerCase() !== k || s((ae) => !ae);
    };
    return window.addEventListener("keydown", b), () => window.removeEventListener("keydown", b);
  }, [e, r]), !i) return null;
  const F = () => {
    r ? t?.() : s(!1);
  };
  return /* @__PURE__ */ f(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 130,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.32)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)"
      },
      onClick: F,
      children: /* @__PURE__ */ g(
        "div",
        {
          onClick: (b) => b.stopPropagation(),
          style: {
            width: "min(760px, 92vw)",
            maxHeight: "88vh",
            overflowY: "auto",
            background: "rgba(18,20,28,0.62)",
            color: "#f3f4f8",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            fontFamily: "'Pretendard', system-ui, sans-serif",
            fontSize: 13,
            padding: 18
          },
          children: [
            /* @__PURE__ */ g("header", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }, children: [
              /* @__PURE__ */ f("h2", { style: { margin: 0, fontSize: 16, fontWeight: 600, flex: 1 }, children: "캐릭터 만들기" }),
              /* @__PURE__ */ f(
                "button",
                {
                  onClick: y,
                  style: Le,
                  children: "기본값"
                }
              ),
              /* @__PURE__ */ f("button", { onClick: F, style: Le, children: "닫기" })
            ] }),
            /* @__PURE__ */ g("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ f("label", { style: de, children: "이름" }),
              /* @__PURE__ */ f(
                "input",
                {
                  value: a.name,
                  onChange: (b) => c(b.target.value),
                  maxLength: 16,
                  style: {
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#f3f4f8",
                    fontFamily: "inherit",
                    fontSize: 13
                  }
                }
              )
            ] }),
            /* @__PURE__ */ g("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ f("label", { style: de, children: "색상" }),
              /* @__PURE__ */ f("div", { style: ut, children: Bo.map(({ key: b, label: M }) => /* @__PURE__ */ g("div", { style: Wo, children: [
                /* @__PURE__ */ f("span", { style: { flex: 1 }, children: M }),
                /* @__PURE__ */ f(
                  "input",
                  {
                    type: "color",
                    value: a.colors[b],
                    onChange: (O) => d(b, O.target.value),
                    style: {
                      width: 36,
                      height: 28,
                      border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 6,
                      background: "transparent",
                      cursor: "pointer"
                    }
                  }
                )
              ] }, b)) })
            ] }),
            /* @__PURE__ */ g("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ f("label", { style: de, children: "헤어" }),
              /* @__PURE__ */ f("div", { style: dt, children: Go.map((b) => /* @__PURE__ */ f(
                "button",
                {
                  onClick: () => u(b),
                  style: ft(a.hair === b),
                  children: Dt[b]
                },
                b
              )) })
            ] }),
            /* @__PURE__ */ g("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ f("label", { style: de, children: "표정" }),
              /* @__PURE__ */ f("div", { style: dt, children: Vo.map((b) => /* @__PURE__ */ f(
                "button",
                {
                  onClick: () => p(b),
                  style: ft(a.face === b),
                  children: At[b]
                },
                b
              )) })
            ] }),
            /* @__PURE__ */ g("section", { children: [
              /* @__PURE__ */ g("div", { style: jo, children: [
                /* @__PURE__ */ f("label", { style: { ...de, marginBottom: 0 }, children: "장착 슬롯" }),
                /* @__PURE__ */ f(
                  "input",
                  {
                    value: m,
                    onChange: (b) => S(b.target.value),
                    placeholder: "태그 검색",
                    style: qo
                  }
                ),
                /* @__PURE__ */ g("label", { style: Ho, children: [
                  /* @__PURE__ */ f(
                    "input",
                    {
                      type: "checkbox",
                      checked: w,
                      onChange: (b) => C(b.target.checked)
                    }
                  ),
                  "보유만"
                ] })
              ] }),
              /* @__PURE__ */ f("div", { style: ut, children: lt.map((b) => /* @__PURE__ */ g("div", { style: Xo, children: [
                /* @__PURE__ */ g("div", { style: Yo, children: [
                  /* @__PURE__ */ f("span", { children: Lt[b] }),
                  /* @__PURE__ */ f("span", { style: { color: l[b] ? "#7adf90" : "rgba(243,244,248,0.45)" }, children: l[b] ?? "비어있음" }),
                  /* @__PURE__ */ f("button", { onClick: () => h(b, null), style: Le, children: "비우기" })
                ] }),
                /* @__PURE__ */ g("div", { style: Ko, children: [
                  P[b].map((M) => /* @__PURE__ */ g(
                    "button",
                    {
                      onClick: () => h(b, M.id),
                      style: Qo(l[b] === M.id),
                      children: [
                        /* @__PURE__ */ f(Ut, { asset: M, size: 58 }),
                        /* @__PURE__ */ f("span", { style: Zo, children: M.name })
                      ]
                    },
                    M.id
                  )),
                  P[b].length === 0 && /* @__PURE__ */ f("span", { style: Jo, children: "사용 가능한 에셋 없음" })
                ] })
              ] }, b)) })
            ] })
          ]
        }
      )
    }
  );
}
const de = {
  display: "block",
  marginBottom: 6,
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: "rgba(243,244,248,0.62)"
}, ut = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, Wo = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 8
}, dt = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
}, ft = (e) => ({
  padding: "6px 12px",
  borderRadius: 999,
  border: e ? "1px solid #ffd84a" : "1px solid rgba(255,255,255,0.14)",
  background: e ? "rgba(255,216,74,0.12)" : "rgba(255,255,255,0.04)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}), Le = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}, jo = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8
}, qo = {
  flex: 1,
  minWidth: 120,
  padding: "6px 9px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f3f4f8",
  fontFamily: "inherit",
  fontSize: 12
}, Ho = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  color: "rgba(243,244,248,0.72)",
  fontSize: 12
}, Xo = {
  padding: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10
}, Yo = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8
}, Ko = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, Qo = (e) => ({
  display: "grid",
  gridTemplateColumns: "58px minmax(0, 1fr)",
  alignItems: "center",
  gap: 8,
  minHeight: 70,
  padding: 6,
  borderRadius: 10,
  border: e ? "1px solid #7bd3a7" : "1px solid rgba(255,255,255,0.10)",
  background: e ? "rgba(123,211,167,0.14)" : "rgba(255,255,255,0.035)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  textAlign: "left"
}), Zo = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 12,
  fontWeight: 600
}, Jo = {
  gridColumn: "1 / -1",
  padding: "10px 8px",
  color: "rgba(243,244,248,0.45)",
  fontSize: 12
};
function es(e) {
  return A(() => {
    switch (e) {
      case "long":
        return {
          geometry: new v.SphereGeometry(0.28, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
          position: [0, -0.05, 0],
          scale: [1.05, 1.55, 1.05]
        };
      case "cap":
        return {
          geometry: new v.CylinderGeometry(0.32, 0.34, 0.18, 16),
          position: [0, 0.1, 0],
          scale: [1, 1, 1]
        };
      case "bun":
        return {
          geometry: new v.SphereGeometry(0.22, 12, 10),
          position: [0, 0.18, -0.05],
          scale: [1, 1, 1]
        };
      case "spiky":
        return {
          geometry: new v.ConeGeometry(0.32, 0.36, 8),
          position: [0, 0.15, 0],
          scale: [1, 1, 1]
        };
      case "short":
      default:
        return {
          geometry: new v.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
          position: [0, 0.05, 0],
          scale: [1, 1, 1]
        };
    }
  }, [e]);
}
function ua({
  headHeight: e = 1.55,
  enabled: n = !0,
  opacity: t = 1
} = {}) {
  const r = _(null), o = G((u) => u.appearance), s = G((u) => u.outfits), { position: i, rotation: a } = ie({ updateInterval: 16 }), l = es(o.hair);
  if (ee(() => {
    const u = r.current;
    u && (u.position.set(i.x, i.y + e, i.z), u.rotation.set(0, a.y, 0));
  }), !n) return null;
  const c = !!s.hat, d = v.MathUtils.clamp(t, 0, 1);
  return /* @__PURE__ */ g("group", { ref: r, dispose: null, children: [
    !c && /* @__PURE__ */ g("mesh", { position: l.position, scale: l.scale, castShadow: !0, children: [
      /* @__PURE__ */ f("primitive", { object: l.geometry, attach: "geometry" }),
      /* @__PURE__ */ f(
        "meshStandardMaterial",
        {
          color: o.colors.hair,
          roughness: 0.85,
          metalness: 0.05,
          transparent: d < 1,
          opacity: d
        }
      )
    ] }),
    c && /* @__PURE__ */ g("group", { position: [0, 0.1, 0], children: [
      /* @__PURE__ */ g("mesh", { castShadow: !0, children: [
        /* @__PURE__ */ f("cylinderGeometry", { args: [0.34, 0.34, 0.22, 18] }),
        /* @__PURE__ */ f(
          "meshStandardMaterial",
          {
            color: o.colors.hat,
            roughness: 0.7,
            metalness: 0.05,
            transparent: d < 1,
            opacity: d
          }
        )
      ] }),
      /* @__PURE__ */ g("mesh", { position: [0, -0.1, 0], children: [
        /* @__PURE__ */ f("cylinderGeometry", { args: [0.5, 0.5, 0.04, 24] }),
        /* @__PURE__ */ f(
          "meshStandardMaterial",
          {
            color: o.colors.hat,
            roughness: 0.7,
            metalness: 0.05,
            transparent: d < 1,
            opacity: d
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ f(ts, { style: o.face, opacity: d })
  ] });
}
function ts({ style: e, opacity: n }) {
  const t = A(() => {
    switch (e) {
      case "smile":
        return "#ff8aa0";
      case "wink":
        return "#ffb04a";
      case "sleepy":
        return "#7d8ec8";
      case "surprised":
        return "#ffe066";
      default:
        return "#ffb6a8";
    }
  }, [e]);
  return /* @__PURE__ */ g("group", { position: [0, -0.18, 0.32], children: [
    /* @__PURE__ */ g("mesh", { position: [-0.13, 0, 0], children: [
      /* @__PURE__ */ f("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ f("meshBasicMaterial", { color: t, transparent: !0, opacity: n * 0.6 })
    ] }),
    /* @__PURE__ */ g("mesh", { position: [0.13, 0, 0], children: [
      /* @__PURE__ */ f("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ f("meshBasicMaterial", { color: t, transparent: !0, opacity: n * 0.6 })
    ] })
  ] });
}
const ns = (e) => e?.url ? e.kind === "characterPart" || e.kind === "weapon" : !1, rs = (e) => ({
  id: e.id,
  ...e.slot ? { slot: e.slot } : {},
  url: e.url,
  ...e.colors?.primary ? { color: e.colors.primary } : {}
});
function da({
  baseParts: e = [],
  outfits: n,
  assets: t
}) {
  const r = Object.values(n).map((i) => i ? t[i] : void 0).filter(ns).map(rs);
  if (r.length === 0)
    return e.map((i) => ({ ...i }));
  const o = new Set(r.map((i) => i.slot).filter(Boolean)), s = e.filter((i) => !i.slot || !o.has(i.slot)).map((i) => ({ ...i }));
  for (const i of r)
    s.some((a) => a.url === i.url && a.slot === i.slot) || s.push(i);
  return s;
}
function fa({
  capacity: e = 64,
  step: n = 0.55,
  lifetime: t = 9,
  size: r = 0.34,
  y: o = 0.02,
  color: s = "#1a1612"
} = {}) {
  const i = _(null), { position: a, isMoving: l, isGrounded: c } = ie({ updateInterval: 32 }), d = A(() => new v.Color(s), [s]), u = A(
    () => Array.from({ length: e }, () => ({
      x: 0,
      z: 0,
      bornAt: -1 / 0,
      side: 1
    })),
    [e]
  ), p = _(null), h = _(0), y = _(1), x = A(() => {
    const w = new v.PlaneGeometry(1, 1);
    return w.rotateX(-Math.PI / 2), w;
  }, []), I = A(
    () => new v.MeshBasicMaterial({
      color: d,
      transparent: !0,
      opacity: 0.42,
      depthWrite: !1,
      polygonOffset: !0,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    }),
    [d]
  );
  E(() => () => {
    x.dispose(), I.dispose();
  }, [x, I]);
  const m = A(() => new v.Object3D(), []), S = A(() => new v.Color(), []);
  return ee((w) => {
    const C = i.current;
    if (!C) return;
    const P = w.clock.elapsedTime;
    if (c && l) {
      const b = p.current, M = a.x - (b?.x ?? a.x), O = a.z - (b?.z ?? a.z), k = Math.hypot(M, O);
      if (!b || k >= n) {
        const D = u[h.current];
        D && (D.x = a.x, D.z = a.z, D.bornAt = P, D.side = y.current, y.current = y.current === 1 ? -1 : 1, h.current = (h.current + 1) % e, p.current = { x: a.x, z: a.z });
      }
    }
    let F = 0;
    for (let b = 0; b < e; b++) {
      const M = u[b];
      if (!M) continue;
      const O = P - M.bornAt;
      if (O < 0 || O > t) continue;
      const k = 1 - O / t;
      m.position.set(M.x + M.side * 0.07, o, M.z), m.rotation.set(0, 0, 0), m.scale.set(r, 1, r * 1.4), m.updateMatrix(), C.setMatrixAt(F, m.matrix), S.copy(d).multiplyScalar(0.6 + k * 0.4), C.setColorAt(F, S), F++;
    }
    C.count = F, C.instanceMatrix.needsUpdate = !0, C.instanceColor && (C.instanceColor.needsUpdate = !0);
  }), /* @__PURE__ */ f(
    "instancedMesh",
    {
      ref: i,
      args: [x, I, e],
      frustumCulled: !1,
      renderOrder: 1
    }
  );
}
const pa = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
}, xe = "ko";
function os() {
  if (typeof navigator > "u") return xe;
  const e = (navigator.language || xe).slice(0, 2).toLowerCase();
  return e === "ko" || e === "en" || e === "ja" ? e : xe;
}
function Oe(e, n) {
  return n ? e.replace(/\{(\w+)\}/g, (t, r) => {
    const o = n[r];
    return o == null ? `{${r}}` : String(o);
  }) : e;
}
const te = Y((e, n) => ({
  locale: os(),
  bundle: { ko: {}, en: {}, ja: {} },
  setLocale: (t) => e({ locale: t }),
  registerMessages: (t, r) => {
    const o = n().bundle;
    e({
      bundle: {
        ...o,
        [t]: { ...o[t], ...r }
      }
    });
  },
  registerBundle: (t) => {
    const r = n().bundle, o = { ...r };
    Object.keys(t).forEach((s) => {
      const i = t[s];
      i && (o[s] = { ...r[s], ...i });
    }), e({ bundle: o });
  },
  t: (t, r) => {
    const { locale: o, bundle: s } = n(), i = s[o]?.[t];
    if (i !== void 0) return Oe(i, r);
    const a = s[xe]?.[t];
    return Oe(a !== void 0 ? a : t, r);
  },
  serialize: () => ({ version: 1, locale: n().locale }),
  hydrate: (t) => {
    !t || t.version !== 1 || e({ locale: t.locale });
  }
}));
function ma(e, n) {
  return te.getState().t(e, n);
}
const ss = "gaesup.i18n", is = "i18n", as = "i18n.store";
function cs() {
  return te.getState().serialize();
}
function ls(e) {
  te.getState().hydrate(e);
}
function us(e = {}) {
  return j({
    id: e.id ?? ss,
    name: "GaeSup i18n",
    saveExtensionId: e.saveExtensionId ?? is,
    storeServiceId: e.storeServiceId ?? as,
    store: te,
    readyEvent: "i18n:ready",
    capabilities: ["i18n"],
    serialize: cs,
    hydrate: ls
  });
}
const ga = us();
function ha() {
  const e = te((t) => t.locale), n = te((t) => t.bundle);
  return ne(
    (t, r) => {
      const o = n[e]?.[t];
      if (o !== void 0) return ze(o, r);
      const s = n.ko?.[t];
      return ze(s !== void 0 ? s : t, r);
    },
    [e, n]
  );
}
function ya() {
  const e = te((t) => t.locale), n = te((t) => t.setLocale);
  return { locale: e, setLocale: n };
}
function ze(e, n) {
  return n ? e.replace(/\{(\w+)\}/g, (t, r) => {
    const o = n[r];
    return o == null ? `{${r}}` : String(o);
  }) : e;
}
const ds = [
  { id: "jump", label: "점프", key: " " },
  { id: "use", label: "사용", key: "F" }
];
function fs() {
  return typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(pointer: coarse)").matches;
}
function pt(e, n) {
  if (typeof window > "u") return;
  const t = /^[a-zA-Z]$/.test(n) ? `Key${n.toUpperCase()}` : n === " " ? "Space" : n, r = new KeyboardEvent(e, {
    key: n === " " ? " " : n.toLowerCase(),
    code: t,
    bubbles: !0
  });
  window.dispatchEvent(r);
}
function ba({
  forceVisible: e = !1,
  radius: n = 60,
  deadzone: t = 0.18,
  runThreshold: r = 0.8,
  actions: o = ds
} = {}) {
  const [s, i] = z(!1), a = ht(), l = _(null), c = _(null), d = _({
    pointerId: -1,
    cx: 0,
    cy: 0,
    forward: !1,
    backward: !1,
    leftward: !1,
    rightward: !1,
    run: !1
  });
  return E(() => {
    i(e || fs());
  }, [e]), E(() => {
    if (!s) return;
    const u = l.current, p = c.current;
    if (!u || !p) return;
    const h = () => {
      const m = d.current, S = {};
      m.forward && (S.forward = !1), m.backward && (S.backward = !1), m.leftward && (S.leftward = !1), m.rightward && (S.rightward = !1), m.run && (S.shift = !1), m.forward = m.backward = m.leftward = m.rightward = m.run = !1, Object.keys(S).length > 0 && a.updateKeyboard(S), p.style.transform = "translate(-50%, -50%)", d.current.pointerId = -1;
    }, y = (m) => {
      m.preventDefault();
      const S = u.getBoundingClientRect();
      d.current.cx = S.left + S.width / 2, d.current.cy = S.top + S.height / 2, d.current.pointerId = m.pointerId, u.setPointerCapture(m.pointerId), x(m);
    }, x = (m) => {
      if (m.pointerId !== d.current.pointerId) return;
      const S = m.clientX - d.current.cx, w = m.clientY - d.current.cy, C = Math.hypot(S, w), P = Math.min(C, n), F = Math.atan2(w, S), b = Math.cos(F) * P, M = Math.sin(F) * P;
      p.style.transform = `translate(calc(-50% + ${b}px), calc(-50% + ${M}px))`;
      const O = P / n, k = d.current, D = {};
      if (O < t)
        k.forward && (D.forward = !1, k.forward = !1), k.backward && (D.backward = !1, k.backward = !1), k.leftward && (D.leftward = !1, k.leftward = !1), k.rightward && (D.rightward = !1, k.rightward = !1), k.run && (D.shift = !1, k.run = !1);
      else {
        const ae = Math.cos(F), Ve = Math.sin(F), ke = Ve < -0.35, Ce = Ve > 0.35, _e = ae < -0.35, Me = ae > 0.35, Re = O >= r;
        k.forward !== ke && (D.forward = ke, k.forward = ke), k.backward !== Ce && (D.backward = Ce, k.backward = Ce), k.leftward !== _e && (D.leftward = _e, k.leftward = _e), k.rightward !== Me && (D.rightward = Me, k.rightward = Me), k.run !== Re && (D.shift = Re, k.run = Re);
      }
      Object.keys(D).length > 0 && a.updateKeyboard(D);
    }, I = (m) => {
      m.pointerId === d.current.pointerId && h();
    };
    return u.addEventListener("pointerdown", y), u.addEventListener("pointermove", x), u.addEventListener("pointerup", I), u.addEventListener("pointercancel", I), u.addEventListener("pointerleave", I), () => {
      u.removeEventListener("pointerdown", y), u.removeEventListener("pointermove", x), u.removeEventListener("pointerup", I), u.removeEventListener("pointercancel", I), u.removeEventListener("pointerleave", I), h();
    };
  }, [s, n, t, r, a]), s ? /* @__PURE__ */ g(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 90,
        pointerEvents: "none",
        fontFamily: "'Pretendard', system-ui, sans-serif"
      },
      children: [
        /* @__PURE__ */ f(
          "div",
          {
            ref: l,
            style: {
              position: "absolute",
              left: 24,
              bottom: 24,
              width: n * 2,
              height: n * 2,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(20,22,30,0.32)",
              backdropFilter: "blur(14px) saturate(140%)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
              touchAction: "none",
              pointerEvents: "auto"
            },
            children: /* @__PURE__ */ f(
              "div",
              {
                ref: c,
                style: {
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: n * 0.85,
                  height: n * 0.85,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.55)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.28)",
                  transform: "translate(-50%, -50%)",
                  transition: "transform 0.04s linear",
                  pointerEvents: "none"
                }
              }
            )
          }
        ),
        /* @__PURE__ */ f(
          "div",
          {
            style: {
              position: "absolute",
              right: 20,
              bottom: 32,
              display: "grid",
              gridTemplateColumns: "repeat(2, auto)",
              gap: 12,
              pointerEvents: "auto"
            },
            children: o.map((u) => /* @__PURE__ */ f(ps, { action: u }, u.id))
          }
        )
      ]
    }
  ) : null;
}
function ps({ action: e }) {
  const [n, t] = z(!1), r = () => {
    t(!0), e.key && pt("keydown", e.key), e.onPress?.();
  }, o = () => {
    t(!1), e.key && pt("keyup", e.key), e.onRelease?.();
  };
  return /* @__PURE__ */ f(
    "button",
    {
      type: "button",
      onPointerDown: (s) => {
        s.preventDefault(), r();
      },
      onPointerUp: (s) => {
        s.preventDefault(), o();
      },
      onPointerCancel: o,
      onPointerLeave: () => {
        n && o();
      },
      style: {
        width: 64,
        height: 64,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.22)",
        background: n ? "rgba(255,216,74,0.32)" : "rgba(20,22,30,0.42)",
        color: "#f3f4f8",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        touchAction: "none",
        userSelect: "none"
      },
      children: e.label
    }
  );
}
const he = "outdoor", Fe = (e) => new Promise((n) => setTimeout(n, e)), ms = 220, gs = 80, hs = 240, X = Y((e, n) => ({
  current: he,
  pending: null,
  scenes: {
    [he]: { id: he, name: "Outdoor", interior: !1 }
  },
  transition: { progress: 0, color: "#000000", active: !1 },
  lastReturnPoint: null,
  registerScene: (t) => e((r) => r.scenes[t.id] ? r : { scenes: { ...r.scenes, [t.id]: t } }),
  unregisterScene: (t) => e((r) => {
    if (t === he || !r.scenes[t]) return r;
    const o = { ...r.scenes };
    return delete o[t], { scenes: o };
  }),
  setTransition: (t) => e((r) => ({ transition: { ...r.transition, ...t } })),
  setReturnPoint: (t) => e({ lastReturnPoint: t }),
  goTo: async (t, r) => {
    const o = n();
    if (o.pending || t === o.current && !r?.entry) return;
    const s = o.scenes[t];
    if (!s) {
      console.warn(`[scene] Unknown scene "${t}". Did you forget to register it?`);
      return;
    }
    const a = s.interior ?? !1 ? "#0d0d10" : "#f5f5f5";
    e({ pending: t, transition: { active: !0, color: a, progress: 0 } });
    const l = performance.now();
    for (; ; ) {
      const d = Math.min(1, (performance.now() - l) / ms);
      if (n().setTransition({ progress: d }), d >= 1) break;
      await Fe(16);
    }
    r?.saveReturn && e({ lastReturnPoint: r.saveReturn }), e({ current: t }), await Fe(gs);
    const c = performance.now();
    for (; ; ) {
      const d = Math.min(1, (performance.now() - c) / hs);
      if (n().setTransition({ progress: 1 - d }), d >= 1) break;
      await Fe(16);
    }
    e({ pending: null, transition: { active: !1, color: a, progress: 0 } });
  },
  serialize: () => ({ version: 1, current: n().current }),
  hydrate: (t) => {
    !t || t.version !== 1 || n().scenes[t.current] && e({ current: t.current, pending: null });
  }
})), ys = "gaesup.scene", bs = "scene", Ss = "scene.store";
function vs() {
  return X.getState().serialize();
}
function xs(e) {
  X.getState().hydrate(e);
}
function Is(e = {}) {
  return j({
    id: e.id ?? ys,
    name: "GaeSup Scene",
    saveExtensionId: e.saveExtensionId ?? bs,
    storeServiceId: e.storeServiceId ?? Ss,
    store: X,
    readyEvent: "scene:ready",
    capabilities: ["scene"],
    serialize: vs,
    hydrate: xs
  });
}
const Sa = Is();
function ws(e, n) {
  if (e === n) return !0;
  if (e.size !== n.size) return !1;
  for (const t of e)
    if (!n.has(t)) return !1;
  return !0;
}
const K = Y((e) => ({
  rooms: /* @__PURE__ */ new Map(),
  portals: /* @__PURE__ */ new Map(),
  currentRoomId: null,
  visibleRoomIds: /* @__PURE__ */ new Set(),
  initializedSceneId: null,
  registerRoom: (n) => e((t) => {
    const r = new Map(t.rooms);
    return r.set(n.id, n), { rooms: r };
  }),
  unregisterRoom: (n) => e((t) => {
    if (!t.rooms.has(n)) return t;
    const r = new Map(t.rooms);
    return r.delete(n), {
      rooms: r,
      currentRoomId: t.currentRoomId === n ? null : t.currentRoomId
    };
  }),
  registerPortal: (n) => e((t) => {
    const r = new Map(t.portals);
    return r.set(n.id, n), { portals: r };
  }),
  unregisterPortal: (n) => e((t) => {
    if (!t.portals.has(n)) return t;
    const r = new Map(t.portals);
    return r.delete(n), { portals: r };
  }),
  setVisibleRooms: (n, t, r) => e((o) => o.initializedSceneId === n && o.currentRoomId === t && ws(o.visibleRoomIds, r) ? o : {
    initializedSceneId: n,
    currentRoomId: t,
    visibleRoomIds: r
  }),
  reset: () => e({
    currentRoomId: null,
    visibleRoomIds: /* @__PURE__ */ new Set(),
    initializedSceneId: null
  })
}));
function va({ zIndex: e = 9999 } = {}) {
  const n = X((t) => t.transition);
  return !n.active && n.progress <= 1e-3 ? null : /* @__PURE__ */ f(
    "div",
    {
      "aria-hidden": !0,
      style: {
        position: "fixed",
        inset: 0,
        background: n.color,
        opacity: n.progress,
        pointerEvents: n.progress > 0.5 ? "auto" : "none",
        zIndex: e,
        transition: "background-color 80ms linear"
      }
    }
  );
}
function xa({ scene: e, children: n }) {
  const t = X((s) => s.registerScene), r = X((s) => s.unregisterScene), o = X((s) => s.current);
  return E(() => (t(e), () => r(e.id)), [e, t, r]), o !== e.id ? null : /* @__PURE__ */ f(J, { children: n });
}
function Ia({
  position: e,
  sceneId: n,
  entry: t,
  exitOverride: r,
  radius: o = 1.4,
  cooldownMs: s = 800,
  color: i = "#5a8acf",
  label: a
}) {
  const l = X((x) => x.goTo), c = X((x) => x.current), { teleport: d } = Et(), { position: u } = ie({ updateInterval: 50 }), p = _(0), h = A(() => new v.CylinderGeometry(o, o, 0.08, 28), [o]);
  E(() => () => h.dispose(), [h]), ee(() => {
    const x = performance.now();
    if (x - p.current < s) return;
    const I = u.x - e[0], m = u.z - e[2];
    I * I + m * m > o * o || (p.current = x, c !== n && y());
  });
  async function y() {
    const x = r ?? {
      position: [e[0], e[1], e[2]]
    };
    await l(n, { entry: t, saveReturn: x });
    const I = new v.Vector3(t.position[0], t.position[1], t.position[2]);
    d(I);
  }
  return /* @__PURE__ */ g("group", { position: e, children: [
    /* @__PURE__ */ f("mesh", { rotation: [0, 0, 0], geometry: h, children: /* @__PURE__ */ f(
      "meshStandardMaterial",
      {
        color: i,
        emissive: i,
        emissiveIntensity: 0.35,
        transparent: !0,
        opacity: 0.6
      }
    ) }),
    a && /* @__PURE__ */ g("mesh", { position: [0, 1.3, 0], children: [
      /* @__PURE__ */ f("boxGeometry", { args: [0.04, 0.6, 0.04] }),
      /* @__PURE__ */ f("meshStandardMaterial", { color: i, emissive: i, emissiveIntensity: 0.4 })
    ] })
  ] });
}
function wa({ sceneId: e, roomId: n, bounds: t, children: r }) {
  const o = X((c) => c.current), s = K((c) => c.registerRoom), i = K((c) => c.unregisterRoom), a = K((c) => c.initializedSceneId), l = K((c) => c.visibleRoomIds);
  return E(() => (s({ id: n, sceneId: e, bounds: t }), () => i(n)), [n, e, t, s, i]), o !== e ? null : a !== e ? /* @__PURE__ */ f(J, { children: r }) : l.has(n) ? /* @__PURE__ */ f(J, { children: r }) : null;
}
function Ea({
  id: e,
  sceneId: n,
  fromRoomId: t,
  toRoomId: r,
  position: o,
  radius: s,
  revealDistance: i
}) {
  const a = K((c) => c.registerPortal), l = K((c) => c.unregisterPortal);
  return E(() => (a({
    id: e,
    sceneId: n,
    fromRoomId: t,
    toRoomId: r,
    position: o,
    ...s !== void 0 ? { radius: s } : {},
    ...i !== void 0 ? { revealDistance: i } : {}
  }), () => l(e)), [e, n, t, r, o, s, i, a, l]), null;
}
const Es = 0.12;
function ks(e, n) {
  return e.x >= n.min[0] && e.x <= n.max[0] && e.y >= n.min[1] && e.y <= n.max[1] && e.z >= n.min[2] && e.z <= n.max[2];
}
function Ct(e, n, t) {
  for (const r of n)
    if (r.sceneId === e && ks(t, r.bounds))
      return r.id;
  return null;
}
function Cs(e) {
  const n = e.rooms.filter((s) => s.sceneId === e.sceneId);
  if (n.length === 0) return /* @__PURE__ */ new Set();
  const t = Ct(e.sceneId, n, e.position);
  if (!t)
    return new Set(n.map((s) => s.id));
  const r = /* @__PURE__ */ new Set([t]), o = e.portals.filter((s) => s.sceneId === e.sceneId);
  for (const s of o) {
    const i = s.revealDistance ?? 3.8, a = e.position.x - s.position[0], l = e.position.y - s.position[1], c = e.position.z - s.position[2];
    a * a + l * l + c * c > i * i || (s.fromRoomId === t ? r.add(s.toRoomId) : s.toRoomId === t && r.add(s.fromRoomId));
  }
  return r;
}
function ka() {
  const e = X((a) => a.current), n = K((a) => a.rooms), t = K((a) => a.portals), r = K((a) => a.setVisibleRooms), o = K((a) => a.reset), { position: s } = ie({ updateInterval: 50 }), i = _(0);
  return E(() => o, [o]), ee((a, l) => {
    if (i.current += Math.max(0, l), i.current < Es) return;
    i.current = 0;
    const c = Array.from(n.values()), d = Array.from(t.values()), u = Ct(e, c, s), p = Cs({
      sceneId: e,
      rooms: c,
      portals: d,
      position: s
    });
    r(e, u, p);
  }), null;
}
const _s = new v.Color("#0a1430"), Ms = new v.Color("#ffb377"), Rs = new v.Color("#ff7a52"), Ts = new v.Color("#5b6975"), Ps = new v.Color("#dde7f0"), Ds = new v.Color("#3b4452");
function As(e, n) {
  const t = e + n / 60;
  return t < 5 ? { t: 0, phase: "night" } : t < 7 ? { t: (t - 5) / 2, phase: "dawn" } : t < 17 ? { t: 1, phase: "day" } : t < 19 ? { t: 1 - (t - 17) / 2, phase: "dusk" } : { t: 0, phase: "night" };
}
function Ca({
  color: e = "#cfd8e3",
  near: n = 35,
  far: t = 220,
  enabled: r = !0
} = {}) {
  const o = Nt((c) => c.scene), s = T((c) => c.time.hour), i = T((c) => c.time.minute), a = W((c) => c.current), l = _(void 0);
  return E(() => {
    if (l.current === void 0 && (l.current = o.fog instanceof v.Fog ? o.fog.clone() : null), !r) {
      o.fog = l.current ? l.current.clone() : null;
      return;
    }
    const c = new v.Color(e), d = As(s, i), u = c.clone();
    d.phase === "night" ? u.lerp(_s, 0.25) : d.phase === "dawn" ? u.lerp(Ms, 0.18 * (1 - d.t)) : d.phase === "dusk" && u.lerp(Rs, 0.18 * (1 - d.t));
    let p = n, h = t;
    if (d.phase === "night" ? (p = n * 0.45, h = t * 0.55) : (d.phase === "dawn" || d.phase === "dusk") && (p = n * (0.55 + 0.45 * d.t), h = t * (0.7 + 0.3 * d.t)), a) {
      const y = Math.max(0, Math.min(1, a.intensity));
      a.kind === "rain" ? (u.lerp(Ts, 0.12 + y * 0.1), p *= 0.7 - y * 0.2, h *= 0.65 - y * 0.2) : a.kind === "storm" ? (u.lerp(Ds, 0.16 + y * 0.12), p *= 0.55 - y * 0.2, h *= 0.5 - y * 0.2) : a.kind === "snow" && (u.lerp(Ps, 0.12 + y * 0.08), p *= 0.75, h *= 0.7);
    }
    p = Math.max(2, p), h = Math.max(p + 5, h), o.fog instanceof v.Fog ? (o.fog.color.copy(u), o.fog.near = p, o.fog.far = h) : o.fog = new v.Fog(u.getHex(), p, h);
  }, [o, e, n, t, r, s, i, a?.kind, a?.intensity]), E(() => () => {
    o.fog = l.current ? l.current.clone() : null;
  }, [o]), null;
}
const Ls = [
  { hour: 0, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: -Math.PI / 2, elevation: -0.3 },
  { hour: 5, sunColor: "#3b3a5a", ambientColor: "#28304a", sunIntensity: 0.15, ambientIntensity: 0.22, azimuth: -Math.PI / 3, elevation: -0.05 },
  { hour: 7, sunColor: "#ffb27a", ambientColor: "#7a8aa6", sunIntensity: 0.55, ambientIntensity: 0.3, azimuth: -Math.PI / 4, elevation: 0.25 },
  { hour: 10, sunColor: "#fff1c8", ambientColor: "#aab4c8", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: -Math.PI / 8, elevation: 0.7 },
  { hour: 13, sunColor: "#ffffff", ambientColor: "#b6c2d8", sunIntensity: 1.05, ambientIntensity: 0.38, azimuth: 0, elevation: 1.05 },
  { hour: 16, sunColor: "#ffe0a8", ambientColor: "#a8b4cc", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: Math.PI / 6, elevation: 0.65 },
  { hour: 18, sunColor: "#ff9a5a", ambientColor: "#806a8a", sunIntensity: 0.55, ambientIntensity: 0.28, azimuth: Math.PI / 3, elevation: 0.18 },
  { hour: 20, sunColor: "#5a3f6a", ambientColor: "#34304a", sunIntensity: 0.18, ambientIntensity: 0.22, azimuth: Math.PI / 2, elevation: -0.05 },
  { hour: 24, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: 3 * Math.PI / 4, elevation: -0.3 }
], mt = {
  spring: new v.Color("#fff0f5"),
  summer: new v.Color("#fff5d8"),
  autumn: new v.Color("#ffd9b0"),
  winter: new v.Color("#dfe8f5")
}, gt = {
  sunny: { sun: 1, ambient: 1, tint: new v.Color("#ffffff") },
  cloudy: { sun: 0.55, ambient: 0.95, tint: new v.Color("#cfd6e2") },
  rain: { sun: 0.3, ambient: 0.85, tint: new v.Color("#90a0b8") },
  snow: { sun: 0.65, ambient: 1.1, tint: new v.Color("#dfeaf5") },
  storm: { sun: 0.2, ambient: 0.75, tint: new v.Color("#5a6a82") }
};
function Os(e, n) {
  const t = e, r = (n % 24 + 24) % 24;
  let o = t[0], s = t[t.length - 1];
  for (let l = 0; l < t.length - 1; l += 1) {
    const c = t[l], d = t[l + 1];
    if (r >= c.hour && r <= d.hour) {
      o = c, s = d;
      break;
    }
  }
  const i = Math.max(1e-4, s.hour - o.hour), a = v.MathUtils.clamp((r - o.hour) / i, 0, 1);
  return {
    hour: r,
    sunColor: o.sunColor,
    ambientColor: o.ambientColor,
    sunIntensity: v.MathUtils.lerp(o.sunIntensity, s.sunIntensity, a),
    ambientIntensity: v.MathUtils.lerp(o.ambientIntensity, s.ambientIntensity, a),
    azimuth: v.MathUtils.lerp(o.azimuth, s.azimuth, a),
    elevation: v.MathUtils.lerp(o.elevation, s.elevation, a)
    // Mix colors via THREE.Color outside this scope to avoid string allocations.
  };
}
function _a({
  rigDistance: e = 60,
  castShadow: n = !0,
  shadowMapSize: t = 1024,
  keyframes: r,
  damping: o = 0.12
} = {}) {
  const s = _(null), i = _(null), a = A(() => (r ?? Ls).slice().sort((h, y) => h.hour - y.hour), [r]), l = A(() => new v.Color(), []), c = A(() => new v.Color(), []), d = A(() => new v.Color(), []), u = A(() => new v.Color(), []);
  return ee(() => {
    const p = s.current, h = i.current;
    if (!p || !h) return;
    const y = T.getState().time, x = W.getState().current, I = x?.kind ?? "sunny", m = v.MathUtils.clamp(x?.intensity ?? 0.5, 0, 1), S = gt[I] ?? gt.sunny, w = mt[y.season] ?? mt.spring, C = Os(a, y.hour + y.minute / 60);
    d.set(C.sunColor).lerp(w, 0.18).lerp(S.tint, 0.35 + 0.25 * m), u.set(C.ambientColor).lerp(w, 0.2).lerp(S.tint, 0.3 + 0.3 * m);
    const P = v.MathUtils.clamp(o, 0.01, 1);
    l.copy(p.color).lerp(d, P), c.copy(h.color).lerp(u, P), p.color.copy(l), h.color.copy(c);
    const F = v.MathUtils.lerp(1, S.sun, 0.5 + 0.5 * m), b = v.MathUtils.lerp(1, S.ambient, 0.5 + 0.5 * m);
    p.intensity = v.MathUtils.lerp(p.intensity, C.sunIntensity * F, P), h.intensity = v.MathUtils.lerp(h.intensity, C.ambientIntensity * b, P);
    const M = Math.cos(C.elevation), O = Math.sin(C.elevation), k = Math.cos(C.azimuth) * M * e, D = Math.sin(C.azimuth) * M * e, ae = Math.max(2, O * e);
    p.position.set(k, ae, D), p.target.position.set(0, 0, 0), p.target.updateMatrixWorld();
  }), /* @__PURE__ */ g(J, { children: [
    /* @__PURE__ */ f("ambientLight", { ref: i, intensity: 0.3, color: "#b6c2d8" }),
    /* @__PURE__ */ f(
      "directionalLight",
      {
        ref: s,
        castShadow: n,
        "shadow-mapSize": [t, t],
        "shadow-normalBias": 0.06,
        "shadow-camera-near": 1,
        "shadow-camera-far": Math.max(120, e * 2),
        "shadow-camera-top": 90,
        "shadow-camera-right": 90,
        "shadow-camera-bottom": -90,
        "shadow-camera-left": -90,
        intensity: 0.8,
        color: "#ffffff",
        position: [20, 30, 10]
      }
    )
  ] });
}
export {
  wc as AnimationPanel,
  Ut as AssetPreviewCanvas,
  ia as AudioControls,
  Ya as BugSpot,
  Ec as BuildingController,
  kc as BuildingPanel,
  Cc as BuildingSystem,
  _c as BuildingUI,
  nt as CATALOG_CATEGORIES,
  lu as CONTENT_SCHEMA_VERSION,
  Ta as Camera,
  Mc as CameraPanel,
  Rc as CameraPresets,
  ji as CatalogUI,
  la as CharacterCreator,
  wl as Clicker,
  Hi as CraftingUI,
  Yi as CropPlot,
  uu as DAILY_FRIENDSHIP_CAP,
  Tc as DEFAULT_BUILDING_GRID_EXTENSION_ID,
  Pc as DEFAULT_BUILDING_PLACEMENT_EXTENSION_ID,
  Dc as DEFAULT_BUILDING_SAVE_EXTENSION_ID,
  Ac as DEFAULT_BUILDING_STORE_SERVICE_ID,
  An as DEFAULT_CAMERA_SAVE_EXTENSION_ID,
  Ln as DEFAULT_CAMERA_STORE_SERVICE_ID,
  Dn as DEFAULT_CAMERA_SYSTEM_EXTENSION_ID,
  _l as DEFAULT_INTERACTION_INPUT_EXTENSION_ID,
  Da as DEFAULT_MOTIONS_INPUT_EXTENSION_ID,
  Aa as DEFAULT_MOTIONS_PHYSICS_EXTENSION_ID,
  La as DEFAULT_MOTIONS_RUNTIME_SERVICE_ID,
  Ka as DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
  Eu as DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID,
  Qa as DEFAULT_WORLD_SAVE_ENVIRONMENT,
  ni as DialogBox,
  du as DialogRunner,
  fc as DuplicateExtensionError,
  pc as DuplicatePluginError,
  Ca as DynamicFog,
  _a as DynamicSky,
  Lc as EDITOR_PANEL_COMPONENT_KIND,
  Oc as Editor,
  zc as EditorLayout,
  si as EventsHUD,
  fu as FRIENDSHIP_LEVELS,
  Za as FishSpot,
  Vn as FocusableObject,
  fa as Footprints,
  aa as Footsteps,
  Nl as GaeSupProps,
  El as GaesupController,
  Oa as GaesupRuntimeProvider,
  yl as GaesupWorld,
  bl as GaesupWorldContent,
  Ei as Gamepad,
  Fc as GameplayEventPanel,
  Nc as GridHelper,
  kl as GroundClicker,
  di as HotbarUI,
  Ia as HouseDoor,
  na as HousePlot,
  Iu as HttpAssetSource,
  pu as HttpContentBundleSource,
  mc as InMemoryExtensionRegistry,
  Ul as IndexedDBAdapter,
  ki as Interactable,
  Ci as InteractionPrompt,
  ti as InteractionTracker,
  fi as InventoryUI,
  pa as LOCALE_LABEL,
  Bl as LocalStorageAdapter,
  za as MOTIONS_TELEPORT_EVENT,
  Vi as MailboxUI,
  hi as MiniMap,
  yi as MinimapPlatform,
  gc as MissingExtensionError,
  hc as MissingPluginDependencyError,
  Tt as MotionController,
  Uc as MotionPanel,
  _i as MotionUI,
  Bc as NPCInstance,
  Gc as NPCSystem,
  ua as OutfitAvatar,
  Vc as PerformancePanel,
  yc as PluginManifestValidationError,
  bc as PluginRegistry,
  Hl as PluginValidationAssertionError,
  Sc as PluginVersionMismatchError,
  mi as QuestLogUI,
  Ja as RUNTIME_SAVE_DIAGNOSTIC_EVENT,
  $c as ResizablePanel,
  Ea as RoomPortal,
  wa as RoomRoot,
  ka as RoomVisibilityDriver,
  Si as RuntimeSaveDiagnosticsToaster,
  vu as SEED_ASSETS,
  Zn as SEED_ITEMS,
  Gl as SaveSystem,
  va as SceneFader,
  xa as SceneRoot,
  Ni as ShopUI,
  Ol as SpeechBalloon,
  Wc as StudioPanel,
  Mi as Teleport,
  jc as TileSystem,
  Li as TimeHUD,
  bi as ToastHost,
  Ui as ToolUseController,
  ba as TouchControls,
  ra as TownHUD,
  ec as TreeObject,
  Ml as V3,
  Rl as V30,
  Tl as V31,
  qc as VehiclePanel,
  Hc as WallSystem,
  Fi as WalletHUD,
  Xc as WeatherEffect,
  Zi as WeatherHUD,
  Sl as World,
  vl as WorldConfigProvider,
  xl as WorldContainer,
  Fa as applyToonToScene,
  Xl as assertValidGaesupPlugin,
  oa as audioPlugin,
  Yc as autoDetectProfile,
  Kc as buildingPlugin,
  Ii as cameraPlugin,
  $i as catalogPlugin,
  ca as characterPlugin,
  Qc as classifyTier,
  Zc as compileNPCBrainBlueprint,
  qi as craftingPlugin,
  Co as createAudioPlugin,
  Jc as createBuildingPlugin,
  Un as createCameraPlugin,
  tc as createCameraSaveDataFromDomain,
  Lr as createCatalogPlugin,
  Uo as createCharacterPlugin,
  tu as createCommandAcceptedResult,
  nu as createCommandAuthorityRouter,
  ru as createCommandRejectedResult,
  mu as createContentBundleFromSaveSystem,
  Yl as createCozyLifeSamplePlugin,
  Vr as createCraftingPlugin,
  Vl as createDefaultSaveSystem,
  dr as createEconomyPlugin,
  el as createEditorCommandStack,
  tl as createEditorShell,
  nl as createEditorSlice,
  Xt as createEventsPlugin,
  Qr as createFarmingPlugin,
  nc as createGaesupRuntime,
  ou as createGameCommand,
  Kl as createHighGraphicsSamplePlugin,
  us as createI18nPlugin,
  Pl as createInteractionInputAdapter,
  Dl as createInteractionSystemInputBackend,
  tn as createInventoryPlugin,
  Cr as createMailPlugin,
  Al as createMemoryInputBackend,
  Na as createMotionsPlugin,
  Ua as createMotionsRuntime,
  rl as createNPCObservation,
  Tn as createNPCPlugin,
  vc as createPluginRegistry,
  ln as createQuestsPlugin,
  yr as createRelationsPlugin,
  rc as createRuntimeSaveDiagnostics,
  oc as createSaveDataFromSaveSystem,
  Is as createScenePlugin,
  su as createServerEvent,
  ku as createServerPluginHost,
  Ql as createShooterKitSamplePlugin,
  iu as createSnapshotAck,
  au as createStateDelta,
  Xn as createTimePlugin,
  Ba as createToonMaterial,
  bo as createTownPlugin,
  uo as createWeatherPlugin,
  sc as createWorldDataFromSaveDomains,
  Zl as defineGaesupPlugin,
  ol as detectCapabilities,
  Ga as disposeToonGradients,
  zi as economyPlugin,
  sl as editorSlice,
  ri as eventsPlugin,
  Xi as farmingPlugin,
  ic as formatRuntimeSaveDiagnostic,
  vn as formatRuntimeSaveDiagnosticToastMessage,
  ce as getAudioEngine,
  se as getCropRegistry,
  Va as getDefaultToonMode,
  gu as getDialogRegistry,
  St as getEventRegistry,
  B as getItemRegistry,
  Ze as getNPCScheduler,
  vt as getQuestRegistry,
  fe as getRecipeRegistry,
  $l as getSaveSystem,
  ye as getToolEvents,
  $a as getToonGradient,
  ko as hydrateAudioState,
  Ar as hydrateCatalogState,
  No as hydrateCharacterState,
  Gr as hydrateCraftingState,
  Ht as hydrateEventsState,
  Kr as hydrateFarmingState,
  ls as hydrateI18nState,
  en as hydrateInventoryState,
  kr as hydrateMailState,
  Rn as hydrateNPCState,
  cn as hydrateQuestsState,
  hr as hydrateRelationsState,
  xs as hydrateSceneState,
  ur as hydrateShopState,
  Hn as hydrateTimeState,
  yo as hydrateTownState,
  cr as hydrateWalletState,
  lo as hydrateWeatherState,
  ga as i18nPlugin,
  ai as inventoryPlugin,
  il as isEditorPanelComponentExtension,
  jl as isEventActive,
  hu as loadContentBundleFromManifest,
  Gi as mailPlugin,
  Wa as motionsPlugin,
  L as notify,
  vi as npcPlugin,
  al as profileForTier,
  pi as questsPlugin,
  cl as registerNPCBrainAdapter,
  ll as registerNPCBrainBlueprint,
  Ki as registerSeedCrops,
  ii as registerSeedEvents,
  Oi as registerSeedItems,
  Bi as relationsPlugin,
  ja as requestMotionsTeleport,
  da as resolveCharacterParts,
  ul as resolveEditorPanelComponentExtensions,
  dl as resolveNPCBrainDecision,
  qa as resolveRuntimeInputBackend,
  wn as resolveSchedule,
  Sa as scenePlugin,
  Eo as serializeAudioState,
  Dr as serializeCatalogState,
  Fo as serializeCharacterState,
  Br as serializeCraftingState,
  qt as serializeEventsState,
  Yr as serializeFarmingState,
  cs as serializeI18nState,
  Jt as serializeInventoryState,
  Er as serializeMailState,
  Mn as serializeNPCState,
  an as serializeQuestsState,
  gr as serializeRelationsState,
  vs as serializeSceneState,
  lr as serializeShopState,
  qn as serializeTimeState,
  ho as serializeTownState,
  ar as serializeWalletState,
  co as serializeWeatherState,
  Ha as setDefaultToonMode,
  xc as shouldSetupPluginForRuntime,
  ma as t,
  Ri as timePlugin,
  ea as townPlugin,
  sa as useAmbientBgm,
  je as useAssetStore,
  N as useAudioStore,
  ac as useAutoSave,
  fl as useBuildingEditor,
  Ie as useBuildingStore,
  ge as useCatalogStore,
  Wi as useCatalogTracker,
  G as useCharacterStore,
  le as useCraftingStore,
  xt as useCurrentInteraction,
  Di as useDayChange,
  ta as useDecorationScore,
  ue as useDialogStore,
  pl as useEditor,
  ml as useEditorStore,
  li as useEquippedItem,
  cc as useEquippedToolKind,
  me as useEventsStore,
  oi as useEventsTicker,
  Be as useFriendshipStore,
  wi as useGaesupController,
  _t as useGaesupRuntime,
  Mt as useGaesupRuntimeRevision,
  V as useGaesupStore,
  Pi as useGameClock,
  Yn as useGameTime,
  nn as useHotbar,
  ui as useHotbarKeyboard,
  Ai as useHourChange,
  te as useI18nStore,
  ht as useInputBackend,
  oe as useInteractablesStore,
  Gt as useInteractionKey,
  ci as useInventory,
  R as useInventoryStore,
  lc as useLoadOnMount,
  ya as useLocale,
  re as useMailStore,
  pe as useNPCStore,
  xi as useNpcSchedule,
  gl as usePerfStore,
  ie as usePlayerPosition,
  H as usePlotStore,
  gi as useQuestObjectiveTracker,
  Q as useQuestStore,
  K as useRoomVisibilityStore,
  X as useSceneStore,
  Z as useShopStore,
  Ee as useStateSystem,
  Et as useTeleport,
  Ti as useTimeOfDay,
  T as useTimeStore,
  We as useToastStore,
  uc as useToolUse,
  q as useTownStore,
  ha as useTranslate,
  zl as useUIConfigStore,
  $ as useWalletStore,
  W as useWeatherStore,
  Ji as useWeatherTicker,
  yu as validateContentBundle,
  bu as validateContentBundleManifest,
  Jl as validateGaesupPlugin,
  Qi as weatherPlugin
};
