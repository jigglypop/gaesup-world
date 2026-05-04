import "reflect-metadata";
import { a as Ue } from "./index-lk7RULwc.js";
import { C as ba } from "./index-lk7RULwc.js";
import { W as dt, V as ze, G as be, a6 as It, a7 as wt, a9 as Et } from "./index-DhBFMYdt.js";
import { ac as va, ad as xa, ae as Ia, T as wa, af as Ea, an as ka, aa as Ca, ab as _a, ai as Ta, am as Ma, al as Ra, aj as Da, ag as Pa, ah as Aa, ao as La, ak as Oa } from "./index-DhBFMYdt.js";
import { j as kt, k as Ee } from "./index-zpBWDFlA.js";
import { B as Fa, d as Na, D as Ua, F as Ba, R as Ga, T as Va, g as $a, b as Wa, e as ja, a as qa, c as Ha, f as Xa, u as Ya, l as Ka, i as Qa } from "./index-zpBWDFlA.js";
import { D as Ja, b as ec, I as tc, M as nc, d as rc, P as oc, e as sc, g as ic, a as ac, s as cc } from "./runtimeFilter-CS35UPHd.js";
import { aG as pe, aH as Ct, aI as _t, aJ as V, aK as Tt, aL as Mt, aM as Rt } from "./plugin-F91ChEqv.js";
import { A as uc, w as dc, B as fc, v as pc, U as mc, C as gc, aT as hc, _ as yc, $ as bc, a0 as Sc, a1 as vc, E as xc, a as Ic, b as wc, G as Ec, N as kc, M as Cc, aN as _c, aU as Tc, P as Mc, R as Rc, S as Dc, T as Pc, V as Ac, W as Lc, aV as Oc, aY as zc, a3 as Fc, a_ as Nc, aO as Uc, a2 as Bc, c as Gc, d as Vc, h as $c, aP as Wc, aX as jc, e as qc, i as Hc, aZ as Xc, aQ as Yc, aR as Kc, r as Qc, aS as Zc, aF as Jc, u as el, f as tl, aW as nl } from "./plugin-F91ChEqv.js";
import { W as ol, G as sl, W as il, a as al, W as cl } from "./index-BovNs_Id.js";
import { b as ie, u as ft } from "./index-CaAR2VHu.js";
import { a as ul, C as dl, G as fl } from "./index-CaAR2VHu.js";
import * as S from "three";
import { u as $ } from "./gaesupStore-DTu0tYBp.js";
import { e as ml, V as gl, f as hl, h as yl, c as bl, i as Sl, j as vl } from "./gaesupStore-DTu0tYBp.js";
import { jsxs as m, jsx as d, Fragment as ee } from "react/jsx-runtime";
import { useRef as D, useEffect as k, useState as F, useCallback as K, forwardRef as Dt, useId as Pt, useMemo as L } from "react";
import { S as Il, u as wl } from "./index-CUYKx17r.js";
import { M as pt } from "./index-BDZRjwya.js";
import { W as kl, I as Cl, L as _l, S as Tl, c as Ml, g as Rl } from "./index-BDZRjwya.js";
import { u as R } from "./timeStore-BRw0mdde.js";
import { a as me, b as mt, u as M, g as G, c as Be, n as O } from "./eventsStore-DqmXNVEb.js";
import { i as Pl } from "./eventsStore-DqmXNVEb.js";
import { createStoreDomainPlugin as q } from "./plugins.js";
import { PluginValidationAssertionError as Ll, assertValidGaesupPlugin as Ol, createCozyLifeSamplePlugin as zl, createHighGraphicsSamplePlugin as Fl, createShooterKitSamplePlugin as Nl, defineGaesupPlugin as Ul, validateGaesupPlugin as Bl } from "./plugins.js";
import { create as Y } from "zustand";
import { useFrame as ne, useThree as At } from "@react-three/fiber";
import { c as Vl, a as $l, b as Wl, d as jl, e as ql, f as Hl, g as Xl } from "./authority-CysRQudy.js";
import { u as ue, o as Z, p as gt, q as W, r as Fe } from "./loader-C3ZwumCe.js";
import { C as Kl, t as Ql, D as Zl, F as Jl, H as eu, c as tu, s as nu, l as ru, v as ou, a as su } from "./loader-C3ZwumCe.js";
import { u as j } from "./weatherStore-CzG5N441.js";
import { u as Ge } from "./assetStore-mAClONjR.js";
import { S as au } from "./assetStore-mAClONjR.js";
import { A as Lt } from "./index-C-ViQFGa.js";
import { H as lu } from "./api-BRV101Zn.js";
import { D as du, c as fu } from "./serverHost-DEn-35k3.js";
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
})), Ve = new S.Vector3();
function ht() {
  return oe((e) => e.current);
}
function Ot(e = !0) {
  const n = ht(), t = oe((s) => s.activateCurrent), r = dt(), o = D(!1);
  k(() => {
    if (o.current = !1, !e || !n) return;
    const s = (l) => {
      l && !o.current && t(), o.current = l;
    }, i = zt(n.key);
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
function zt(e) {
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
function $s({ throttleMs: e = 80 } = {}) {
  const { position: n } = ie({ updateInterval: 16 }), t = oe((s) => s.entries), r = oe((s) => s.setCurrent), o = D(0);
  return ne((s, i) => {
    if (o.current += i * 1e3, o.current < e) return;
    o.current = 0;
    let a = null, l = 1 / 0, c = "", f = "e";
    for (const u of t.values()) {
      Ve.copy(u.position).sub(n);
      const p = Ve.lengthSq(), h = u.range * u.range;
      p > h || p < l && (l = p, a = u.id, c = u.label, f = u.key);
    }
    if (!a) {
      r(null);
      return;
    }
    r({
      id: a,
      label: c,
      key: f,
      distance: Math.sqrt(l)
    });
  }), null;
}
function Ws({ advanceKey: e = "e", closeKey: n = "Escape" }) {
  const t = ue((l) => l.node), r = ue((l) => l.runner), o = ue((l) => l.advance), s = ue((l) => l.choose), i = ue((l) => l.close), a = r?.visibleChoices() ?? [];
  return k(() => {
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
      const f = parseInt(c.key, 10);
      !Number.isNaN(f) && f >= 1 && f <= a.length && s(f - 1);
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [t, a.length, o, s, i, e, n]), t ? /* @__PURE__ */ m(
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
        t.speaker && /* @__PURE__ */ d("div", { style: {
          display: "inline-block",
          padding: "3px 8px",
          background: "#ffd84a",
          color: "#1a1a1a",
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 12,
          marginBottom: 6
        }, children: t.speaker }),
        /* @__PURE__ */ d("div", { style: { lineHeight: 1.55, whiteSpace: "pre-wrap" }, children: t.text }),
        a.length === 0 ? /* @__PURE__ */ m("div", { style: { marginTop: 10, fontSize: 12, opacity: 0.65, textAlign: "right" }, children: [
          "[",
          e.toUpperCase(),
          "] 다음"
        ] }) : /* @__PURE__ */ d("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }, children: a.map((l, c) => /* @__PURE__ */ m(
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
              /* @__PURE__ */ m("span", { style: {
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
const Ft = "gaesup.events", Nt = "events", Ut = "events.store";
function Bt() {
  return me.getState().serialize();
}
function Gt(e) {
  me.getState().hydrate(e);
}
function Vt(e = {}) {
  return q({
    id: e.id ?? Ft,
    name: "GaeSup Events",
    saveExtensionId: e.saveExtensionId ?? Nt,
    storeServiceId: e.storeServiceId ?? Ut,
    store: me,
    readyEvent: "events:ready",
    capabilities: ["events"],
    serialize: Bt,
    hydrate: Gt
  });
}
const js = Vt();
function qs(e = !0, n = {}) {
  k(() => {
    if (!e) return;
    const t = () => {
      const o = R.getState().time, { started: s, ended: i } = me.getState().refresh(o);
      s.length && n.onStarted && n.onStarted(s), i.length && n.onEnded && n.onEnded(i);
    };
    return t(), R.subscribe((o, s) => {
      (o.time.day !== s.time.day || o.time.month !== s.time.month || o.time.season !== s.time.season || o.time.weekday !== s.time.weekday) && t();
    });
  }, [e, n.onStarted, n.onEnded]);
}
function Hs({ position: e = "top-left", excludeIds: n = [] }) {
  const t = me((i) => i.active), r = mt(), o = t.filter((i) => !n.includes(i));
  return o.length === 0 ? null : /* @__PURE__ */ d(
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
        return /* @__PURE__ */ m(
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
              /* @__PURE__ */ d("span", { style: {
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: l ? "#ffd84a" : "#7adf90"
              } }),
              /* @__PURE__ */ d("span", { children: a.name })
            ]
          },
          i
        );
      })
    }
  );
}
const $t = [
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
let $e = !1;
function Xs() {
  $e || ($e = !0, mt().registerAll($t));
}
const Wt = "gaesup.inventory", jt = "inventory", qt = "inventory.store";
function Ht() {
  return M.getState().serialize();
}
function Xt(e) {
  M.getState().hydrate(e);
}
function Yt(e = {}) {
  return q({
    id: e.id ?? Wt,
    name: "GaeSup Inventory",
    saveExtensionId: e.saveExtensionId ?? jt,
    storeServiceId: e.storeServiceId ?? qt,
    store: M,
    readyEvent: "inventory:ready",
    capabilities: ["inventory"],
    serialize: Ht,
    hydrate: Xt
  });
}
const Ys = Yt();
function Ks() {
  return M((e) => ({
    slots: e.slots,
    add: e.add,
    remove: e.remove,
    removeById: e.removeById,
    move: e.move,
    countOf: e.countOf,
    has: e.has
  }));
}
function Qs() {
  return M((e) => {
    const n = e.hotbar[e.equippedHotbar];
    return n == null ? null : e.slots[n] ?? null;
  });
}
function Kt() {
  const e = M((o) => o.hotbar), n = M((o) => o.slots), t = M((o) => o.equippedHotbar), r = M((o) => o.setEquippedHotbar);
  return {
    hotbar: e,
    slots: e.map((o) => n[o] ?? null),
    equipped: t,
    setEquipped: r
  };
}
function Zs(e = !0) {
  const n = M((o) => o.setEquippedHotbar), t = M((o) => o.equippedHotbar), r = M((o) => o.hotbar);
  k(() => {
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
function Js() {
  const { slots: e, equipped: n, setEquipped: t } = Kt(), r = G();
  return /* @__PURE__ */ d(
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
        return /* @__PURE__ */ m(
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
              /* @__PURE__ */ d(
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
              o && i ? /* @__PURE__ */ m(ee, { children: [
                /* @__PURE__ */ d(
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
                i.stackable && o.count > 1 && /* @__PURE__ */ d(
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
function ei({ toggleKey: e = "i", initiallyOpen: n = !1 }) {
  const [t, r] = F(n), o = M((c) => c.slots), s = M((c) => c.move), i = G(), [a, l] = F(null);
  return k(() => {
    const c = (f) => {
      const u = f.target?.tagName?.toLowerCase();
      u === "input" || u === "textarea" || f.key.toLowerCase() === e.toLowerCase() && r((p) => !p);
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [e]), t ? /* @__PURE__ */ d(
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
      children: /* @__PURE__ */ m(
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
            /* @__PURE__ */ m("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
              /* @__PURE__ */ d("div", { style: { fontSize: 14, opacity: 0.9 }, children: "Inventory" }),
              /* @__PURE__ */ d(
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
            /* @__PURE__ */ d(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 64px)",
                  gap: 6
                },
                children: o.map((c, f) => {
                  const u = c ? i.get(c.itemId) : void 0;
                  return /* @__PURE__ */ d(
                    "div",
                    {
                      draggable: !!c,
                      onDragStart: () => l(f),
                      onDragOver: (p) => {
                        p.preventDefault();
                      },
                      onDrop: () => {
                        a !== null && a !== f && s(a, f), l(null);
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
                      children: c && u ? /* @__PURE__ */ m(ee, { children: [
                        /* @__PURE__ */ d(
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
                        u.stackable && c.count > 1 && /* @__PURE__ */ d(
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
                    f
                  );
                })
              }
            ),
            /* @__PURE__ */ d("div", { style: { marginTop: 12, opacity: 0.6, fontSize: 11 }, children: `[${e.toUpperCase()}] 닫기 / 드래그로 이동` })
          ]
        }
      )
    }
  ) : null;
}
const Qt = "gaesup.quests", Zt = "quests", Jt = "quests.store";
function en() {
  return Z.getState().serialize();
}
function tn(e) {
  Z.getState().hydrate(e);
}
function nn(e = {}) {
  return q({
    id: e.id ?? Qt,
    name: "GaeSup Quests",
    saveExtensionId: e.saveExtensionId ?? Zt,
    storeServiceId: e.storeServiceId ?? Jt,
    store: Z,
    readyEvent: "quests:ready",
    capabilities: ["quests"],
    serialize: en,
    hydrate: tn
  });
}
const ti = nn();
function ni({ toggleKey: e = "j" }) {
  const [n, t] = F(!1), r = Z((c) => c.state), o = Z((c) => c.complete), s = Z((c) => c.isObjectiveComplete), i = Z((c) => c.isAllObjectivesComplete);
  if (k(() => {
    const c = (f) => {
      const u = f.target?.tagName?.toLowerCase();
      u === "input" || u === "textarea" || (f.key.toLowerCase() === e.toLowerCase() && t((p) => !p), f.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [e]), !n) return null;
  const a = Object.values(r).filter((c) => c.status === "active"), l = Object.values(r).filter((c) => c.status === "completed");
  return /* @__PURE__ */ d(
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
      children: /* @__PURE__ */ m(
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
            /* @__PURE__ */ m(
              "div",
              {
                style: {
                  padding: "10px 14px",
                  borderBottom: "1px solid #333",
                  display: "flex",
                  justifyContent: "space-between"
                },
                children: [
                  /* @__PURE__ */ d("strong", { style: { fontSize: 15 }, children: "Quest Log" }),
                  /* @__PURE__ */ m("button", { onClick: () => t(!1), style: yt(), children: [
                    "Close [",
                    e.toUpperCase(),
                    "]"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ m("div", { style: { overflowY: "auto", padding: 10 }, children: [
              /* @__PURE__ */ d(We, { title: `Active (${a.length})`, children: a.length === 0 ? /* @__PURE__ */ d(rn, { children: "No active quests." }) : a.map((c) => /* @__PURE__ */ d(
                je,
                {
                  progress: c,
                  renderObjective: (f) => s(
                    gt().require(c.questId),
                    c,
                    f
                  ),
                  ...i(c.questId) ? {
                    onComplete: () => {
                      o(c.questId);
                    }
                  } : {}
                },
                c.questId
              )) }),
              l.length > 0 && /* @__PURE__ */ d(We, { title: `Completed (${l.length})`, children: l.map((c) => /* @__PURE__ */ d(je, { progress: c, renderObjective: () => !0, muted: !0 }, c.questId)) })
            ] })
          ]
        }
      )
    }
  );
}
function We({ title: e, children: n }) {
  return /* @__PURE__ */ m("div", { style: { marginBottom: 10 }, children: [
    /* @__PURE__ */ d("div", { style: { padding: "6px 6px 4px", color: "#7aa6ff", fontSize: 12 }, children: e }),
    n
  ] });
}
function rn({ children: e }) {
  return /* @__PURE__ */ d("div", { style: { padding: "8px 10px", opacity: 0.6 }, children: e });
}
function je({
  progress: e,
  renderObjective: n,
  onComplete: t,
  muted: r
}) {
  const o = gt().get(e.questId);
  return o ? /* @__PURE__ */ m(
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
        /* @__PURE__ */ m(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4
            },
            children: [
              /* @__PURE__ */ d("strong", { children: o.name }),
              t && /* @__PURE__ */ d("button", { onClick: t, style: yt(!0), children: "Report Complete" })
            ]
          }
        ),
        /* @__PURE__ */ d("div", { style: { opacity: 0.75, marginBottom: 6 }, children: o.summary }),
        /* @__PURE__ */ d("ul", { style: { margin: 0, padding: "0 0 0 16px" }, children: o.objectives.map((s) => {
          const i = n(s), a = e.progress[s.id] ?? 0, l = s.type === "collect" || s.type === "deliver" ? s.count : 1, c = s.type === "collect" ? Math.min(M.getState().countOf(s.itemId), l) : a, f = s.type === "collect" || s.type === "deliver" ? G().get(s.itemId)?.name ?? s.itemId : "";
          return /* @__PURE__ */ m(
            "li",
            {
              style: { color: i ? "#7adf90" : "#ddd", listStyle: "square" },
              children: [
                s.description ?? on(s, f),
                " ",
                l > 1 ? `(${c}/${l})` : ""
              ]
            },
            s.id
          );
        }) }),
        /* @__PURE__ */ m("div", { style: { marginTop: 6, fontSize: 11, color: "#ffd84a" }, children: [
          "Rewards: ",
          o.rewards.map((s) => sn(s)).join(", ")
        ] })
      ]
    }
  ) : null;
}
function on(e, n) {
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
function sn(e) {
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
function yt(e) {
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
function ri(e = !0) {
  k(() => e ? M.subscribe((t, r) => {
    if (t.slots === r.slots) return;
    const o = Z.getState().active();
    for (const s of o) Z.getState().recheck(s.questId);
  }) : void 0, [e]);
}
const an = 5, cn = 0.5, ln = 20, un = 200, dn = (e) => {
  const { activeState: n } = ze(), t = be((g) => g.tileGroups), r = D(/* @__PURE__ */ new Map()), o = D(pt.getInstance()), {
    scale: s = an,
    blockRotate: i = !1,
    updateInterval: a = 33
  } = e, l = D(null), [c, f] = F(s), u = !!(n.position && e);
  k(() => {
    const g = l.current;
    return g && o.current.setCanvas(g), () => {
      o.current.setCanvas(null);
    };
  }, []);
  const p = K(() => {
    e.blockScale || f((g) => Math.min(ln, g + 0.1));
  }, [e.blockScale]), h = K(() => {
    e.blockScale || f((g) => Math.max(cn, g - 0.1));
  }, [e.blockScale]), b = K(
    (g) => {
      e.blockScale || (g.preventDefault(), g.deltaY < 0 ? p() : h());
    },
    [e.blockScale, p, h]
  ), w = K(() => {
    const g = l.current;
    if (!g) return;
    const x = (I) => {
      e.blockScale || (I.preventDefault(), I.deltaY < 0 ? p() : h());
    };
    return g.addEventListener("wheel", x, { passive: !1 }), () => {
      g.removeEventListener("wheel", x);
    };
  }, [e.blockScale, p, h]), v = K(() => {
    const { position: g, euler: x } = n;
    !g || !x || o.current.render({
      size: un,
      scale: c,
      position: g,
      rotation: x.y,
      blockRotate: i,
      tileGroups: t,
      sceneObjects: r.current
    });
  }, [n, c, i, t]);
  return k(() => {
    if (!u) return;
    const g = setInterval(() => {
      const { position: x, euler: I } = n;
      x && I && (o.current.checkForUpdates(x, I.y), v());
    }, a);
    return () => {
      clearInterval(g);
    };
  }, [v, a, u, n]), k(() => {
    v();
  }, [c, v]), {
    canvasRef: l,
    scale: c,
    upscale: p,
    downscale: h,
    handleWheel: b,
    setupWheelListener: w,
    updateCanvas: v,
    isReady: u
  };
}, qe = 200;
function oi({
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
  position: f = "top-right",
  showZoom: u = !0,
  showCompass: p = !0,
  markers: h = []
}) {
  const { canvasRef: b, scale: w, upscale: v, downscale: g, handleWheel: x } = dn({
    blockScale: r,
    blockRotate: s
  }), I = f ? `minimap--${f}` : "";
  return /* @__PURE__ */ m("div", { className: `minimap ${I}`, style: a, children: [
    /* @__PURE__ */ d(
      "canvas",
      {
        ref: b,
        className: "minimap__canvas",
        width: qe,
        height: qe,
        onWheel: x
      }
    ),
    p && /* @__PURE__ */ d("div", { className: "minimap__compass", children: /* @__PURE__ */ d("div", { style: { transform: `rotate(${i}deg)` }, children: "N" }) }),
    h.map((E, C) => /* @__PURE__ */ d(
      "div",
      {
        className: `minimap__marker minimap__marker--${E.type || "normal"}`,
        style: {
          left: `${E.x}%`,
          top: `${E.y}%`
        },
        children: E.label && /* @__PURE__ */ d("div", { className: "minimap__marker-label", children: E.label })
      },
      E.id || C
    )),
    u && !o && /* @__PURE__ */ d("div", { className: "minimap__controls", style: l, children: /* @__PURE__ */ m("div", { className: "minimap__zoom-controls", children: [
      /* @__PURE__ */ d(
        "button",
        {
          className: "minimap__control-button",
          onClick: v,
          disabled: w >= t,
          style: c,
          children: "+"
        }
      ),
      /* @__PURE__ */ d(
        "button",
        {
          className: "minimap__control-button",
          onClick: g,
          disabled: w <= n,
          style: c,
          children: "-"
        }
      )
    ] }) })
  ] });
}
function fn({
  id: e,
  position: n,
  size: t = [2, 2, 2],
  text: r = "",
  type: o = "normal",
  children: s
}) {
  return k(() => {
    const i = pt.getInstance(), a = Array.isArray(n) ? n : [n.x, n.y, n.z], l = Array.isArray(t) ? t : [t.x, t.y, t.z];
    return i.addMarker(
      e,
      o,
      r || "",
      new S.Vector3(a[0], a[1], a[2]),
      new S.Vector3(l[0], l[1], l[2])
    ), () => {
      i.removeMarker(e);
    };
  }, [e, n, t, o, r]), /* @__PURE__ */ d(ee, { children: s });
}
function si({
  id: e,
  position: n,
  size: t,
  label: r,
  children: o
}) {
  return /* @__PURE__ */ d(fn, { id: e, position: n, size: t, text: r, type: "ground", children: o });
}
const pn = {
  info: { bg: "rgba(20,30,50,0.55)", ring: "#7aa6ff", icon: "i" },
  success: { bg: "rgba(20,40,30,0.55)", ring: "#7adf90", icon: "+" },
  warn: { bg: "rgba(50,40,20,0.55)", ring: "#ffd84a", icon: "!" },
  error: { bg: "rgba(50,20,20,0.55)", ring: "#ff7a7a", icon: "x" },
  reward: { bg: "rgba(40,30,10,0.55)", ring: "#ffc24a", icon: "*" },
  mail: { bg: "rgba(30,20,40,0.55)", ring: "#cf9aff", icon: "M" }
};
function ii({ position: e = "top-right", max: n = 5 }) {
  const t = Be((i) => i.toasts), r = Be((i) => i.dismiss);
  k(() => {
    if (!t.length) return;
    const i = t.map(
      (a) => window.setTimeout(() => r(a.id), Math.max(500, a.durationMs))
    );
    return () => {
      i.forEach((a) => window.clearTimeout(a));
    };
  }, [t, r]);
  const o = e === "top-center" ? { top: 64, left: "50%", transform: "translateX(-50%)" } : { top: 64, right: 12 }, s = t.slice(-n);
  return /* @__PURE__ */ m(
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
          const a = pn[i.kind];
          return /* @__PURE__ */ m(
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
                /* @__PURE__ */ d(
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
                /* @__PURE__ */ d("span", { children: i.text })
              ]
            },
            i.id
          );
        }),
        /* @__PURE__ */ d("style", { children: `@keyframes gaesup-toast-in {
        0% { opacity: 0; transform: translateY(-6px); }
        100% { opacity: 1; transform: translateY(0); }
      }` })
      ]
    }
  );
}
function mn(e) {
  return `${e.phase === "serialize" ? "저장" : "불러오기"} 실패: ${e.key} - ${e.errorMessage}`;
}
function ai({
  enabled: e = !0,
  includeExisting: n = !1,
  durationMs: t = 6500,
  kind: r = "error",
  icon: o,
  formatMessage: s = mn
}) {
  const i = It(), a = wt();
  return k(() => {
    if (!e || !i) return;
    const l = /* @__PURE__ */ new Set(), c = (u) => {
      if (l.has(u.id)) return;
      l.add(u.id);
      const p = He(r, u), h = o ? He(o, u) : void 0;
      O(p, s(u), {
        durationMs: t,
        ...h ? { icon: h } : {}
      });
    }, f = i.saveDiagnostics.getDiagnostics();
    return n ? f.forEach(c) : f.forEach((u) => l.add(u.id)), i.saveDiagnostics.subscribe(c);
  }, [t, e, s, o, n, r, a, i]), null;
}
function He(e, n) {
  return typeof e == "function" ? e(n) : e;
}
function gn(e, n, t) {
  return n === t ? !0 : n < t ? e >= n && e < t : e >= n || e < t;
}
function hn(e, n) {
  return e.weekdays && e.weekdays.length > 0 && !e.weekdays.includes(n.weekday) || e.seasons && e.seasons.length > 0 && !e.seasons.includes(n.season) ? !1 : gn(n.hour, e.startHour, e.endHour);
}
function yn(e, n) {
  for (const r of e.entries)
    if (hn(r, n))
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
class bn {
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
    return r ? yn(r, t) : null;
  }
  all() {
    return Array.from(this.map.values());
  }
  clear() {
    this.map.clear();
  }
}
let ke = null;
function Xe() {
  return ke || (ke = new bn()), ke;
}
const Sn = "gaesup.npc", vn = "npc", xn = "npc.store";
function B(e) {
  return typeof structuredClone == "function" ? structuredClone(e) : JSON.parse(JSON.stringify(e));
}
function In() {
  const e = pe.getState();
  return {
    version: 1,
    templates: Array.from(e.templates.values(), B),
    instances: Array.from(e.instances.values(), B),
    categories: Array.from(e.categories.values(), B),
    clothingSets: Array.from(e.clothingSets.values(), B),
    clothingCategories: Array.from(e.clothingCategories.values(), B),
    animations: Array.from(e.animations.values(), B),
    brainBlueprints: Array.from(e.brainBlueprints.values(), B),
    editMode: e.editMode
  };
}
function wn(e) {
  if (!e) return;
  const n = Array.isArray(e) ? e : e.instances;
  pe.setState((t) => {
    Array.isArray(e) || (e.templates && (t.templates = new Map(e.templates.map((r) => [r.id, B(r)]))), e.categories && (t.categories = new Map(e.categories.map((r) => [r.id, B(r)]))), e.clothingSets && (t.clothingSets = new Map(e.clothingSets.map((r) => [r.id, B(r)]))), e.clothingCategories && (t.clothingCategories = new Map(e.clothingCategories.map((r) => [r.id, B(r)]))), e.animations && (t.animations = new Map(e.animations.map((r) => [r.id, B(r)]))), e.brainBlueprints && (t.brainBlueprints = new Map(e.brainBlueprints.map((r) => [r.id, B(r)]))), typeof e.editMode == "boolean" && (t.editMode = e.editMode)), n && (t.instances = new Map(n.map((r) => [r.id, B(r)])));
  });
}
function En(e = {}) {
  const n = e.id ?? Sn, t = e.saveExtensionId ?? vn, r = e.storeServiceId ?? xn;
  return {
    id: n,
    name: "GaeSup NPC",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["npc"],
    setup(o) {
      o.save.register(t, {
        key: t,
        serialize: In,
        hydrate: wn
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
const ci = En();
function li(e) {
  const [n, t] = F(() => {
    const r = R.getState();
    return Xe().resolve(e, r.time);
  });
  return k(() => {
    let r = -1;
    const o = () => {
      const i = R.getState();
      if (i.time.hour === r) return;
      r = i.time.hour;
      const a = Xe().resolve(e, i.time);
      t(a);
    };
    return o(), R.subscribe((i, a) => {
      (i.time.hour !== a.time.hour || i.time.day !== a.time.day || i.time.weekday !== a.time.weekday) && o();
    });
  }, [e]), n;
}
const kn = "gaesup.camera", Cn = "camera.system", _n = "camera", Tn = "camera.store", Mn = /* @__PURE__ */ new Set([
  "offset",
  "target",
  "position",
  "focusTarget",
  "fixedPosition"
]);
function Le(e) {
  if (e instanceof S.Vector3)
    return { x: e.x, y: e.y, z: e.z };
  if (e instanceof S.Euler)
    return { x: e.x, y: e.y, z: e.z, order: e.order };
  if (Array.isArray(e))
    return e.map(Le);
  if (e && typeof e == "object")
    return Object.fromEntries(
      Object.entries(e).map(([n, t]) => [n, Le(t)])
    );
  if (e == null || typeof e == "string" || typeof e == "number" || typeof e == "boolean")
    return e;
}
function bt(e) {
  if (!e || typeof e != "object") return !1;
  const n = e;
  return typeof n.x == "number" && typeof n.y == "number" && typeof n.z == "number";
}
function Rn(e) {
  return bt(e) ? typeof e.order == "string" : !1;
}
function Dn(e) {
  const n = {};
  for (const [t, r] of Object.entries(e)) {
    if (Mn.has(t) && bt(r)) {
      Object.assign(n, { [t]: new S.Vector3(r.x, r.y, r.z) });
      continue;
    }
    if (t === "rotation" && Rn(r)) {
      Object.assign(n, { rotation: new S.Euler(r.x, r.y, r.z, r.order) });
      continue;
    }
    Object.assign(n, { [t]: r });
  }
  return n;
}
function Ye() {
  const e = $.getState();
  return {
    mode: { ...e.mode },
    cameraOption: Le(e.cameraOption)
  };
}
function Pn(e) {
  if (!e || typeof e != "object") return;
  const n = $.getState();
  e.mode && typeof e.mode == "object" && n.setMode(e.mode), e.cameraOption && typeof e.cameraOption == "object" && n.setCameraOption(Dn(e.cameraOption));
}
function An(e = {}) {
  const n = e.id ?? kn, t = e.systemExtensionId ?? Cn, r = e.saveExtensionId ?? _n, o = e.storeServiceId ?? Tn;
  return {
    id: n,
    name: "GaeSup Camera",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["camera"],
    setup(s) {
      s.systems.register(t, {
        System: Ue,
        create: (i) => new Ue(i)
      }, n), s.save.register(r, {
        key: r,
        serialize: Ye,
        hydrate: Pn
      }, n), s.services.register(o, {
        useStore: $,
        getState: Ye,
        setMode: (i) => $.getState().setMode(i),
        setCameraOption: (i) => $.getState().setCameraOption(i)
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
const ui = An();
function di() {
  const { activeState: e, gameStates: n } = ze(), t = $((i) => i.mode), r = $((i) => i.controllerOptions), o = $.getState();
  return {
    state: e || null,
    mode: t,
    states: n,
    control: r,
    context: { mode: t, states: n, control: r },
    controller: o
  };
}
function St() {
  const { activeState: e, updateActiveState: n } = ze(), t = !!e;
  return {
    teleport: K((o, s) => {
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
function Ln({ value: e, name: n, gamePadButtonStyle: t }) {
  const [r, o] = F(!1), { pushKey: s } = ft(), i = () => {
    s(e, !0), o(!0);
  }, a = () => {
    s(e, !1), o(!1);
  };
  return /* @__PURE__ */ d(
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
function fi(e) {
  const { gamePadStyle: n, gamePadButtonStyle: t, label: r } = e, o = $((a) => a.interaction?.keyboard), { mode: s } = $();
  ft();
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
  return /* @__PURE__ */ d(
    "div",
    {
      className: "gamepad-container",
      style: {
        ...n,
        display: s?.controller === "gamepad" ? "flex" : "none"
      },
      children: i.map((a) => /* @__PURE__ */ d(
        Ln,
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
function On() {
  const { cameraOption: e, setCameraOption: n } = $.getState();
  e?.focus && n({
    focus: !1
  });
}
const zn = Dt(
  ({ children: e, position: n, focusDistance: t = 10, focusDuration: r = 1, onFocus: o, onBlur: s, ...i }, a) => {
    const l = $((b) => b.setCameraOption), c = $((b) => b.cameraOption), f = (b) => {
      if (b.stopPropagation(), !c?.enableFocus) return;
      if (c.focus) {
        On(), s && s(b);
        return;
      }
      const w = b.object.getWorldPosition(new S.Vector3());
      l({
        focusTarget: w,
        focusDuration: r,
        focusDistance: t,
        focus: !0
      }), o && o(b);
    }, u = () => {
      c?.enableFocus && (document.body.style.cursor = "pointer");
    }, p = (b) => {
      document.body.style.cursor = "default", s && !c?.focus && s(b);
    }, h = {
      ...i,
      ...n ? { position: n } : {}
    };
    return /* @__PURE__ */ d(
      "group",
      {
        ref: a,
        onClick: f,
        onPointerOver: u,
        onPointerOut: p,
        ...h,
        children: e
      }
    );
  }
);
zn.displayName = "FocusableObject";
function pi({
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
  const c = Pt(), f = e ?? c, u = oe((v) => v.register), p = oe((v) => v.unregister), h = oe((v) => v.updatePosition), b = D(null), w = L(() => new S.Vector3(...a), [a]);
  return k(() => (u({
    id: f,
    kind: n,
    label: t,
    position: w.clone(),
    range: r,
    key: o,
    ...s ? { data: s } : {},
    onActivate: i
  }), () => p(f)), [f, n, t, r, o, s, i, u, p, w]), k(() => {
    h(f, w);
  }, [f, w, h]), /* @__PURE__ */ d("group", { ref: b, position: a, children: l });
}
function mi({ enabled: e = !0 }) {
  const n = ht();
  return Ot(e), !e || !n ? null : /* @__PURE__ */ m(
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
        /* @__PURE__ */ d(
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
        /* @__PURE__ */ d("span", { children: n.label }),
        /* @__PURE__ */ m("span", { style: { opacity: 0.5, fontSize: 11 }, children: [
          n.distance.toFixed(1),
          "m"
        ] })
      ]
    }
  );
}
function gi({
  showController: e = !0,
  showDebugPanel: n = !0,
  controllerProps: t = {},
  debugPanelProps: r = {}
}) {
  return /* @__PURE__ */ m(ee, { children: [
    e && /* @__PURE__ */ d(
      Ct,
      {
        position: "bottom-left",
        showLabels: !0,
        compact: !1,
        ...t
      }
    ),
    n && /* @__PURE__ */ d(
      _t,
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
function hi({ text: e, position: n, teleportStyle: t }) {
  const { teleport: r, canTeleport: o } = St();
  return /* @__PURE__ */ m(
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
        !o && /* @__PURE__ */ d("span", { className: "teleport__cooldown", children: "⏱️" })
      ]
    }
  );
}
const Fn = "gaesup.time", Nn = "time", Un = "time.store";
function Bn() {
  return R.getState().serialize();
}
function Gn(e) {
  R.getState().hydrate(e);
}
function Vn(e = {}) {
  const n = e.id ?? Fn, t = e.saveExtensionId ?? Nn, r = e.storeServiceId ?? Un;
  return {
    id: n,
    name: "GaeSup Time",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["time"],
    setup(o) {
      o.save.register(t, {
        key: t,
        serialize: Bn,
        hydrate: Gn
      }, n), o.services.register(r, {
        useStore: R,
        getState: R.getState,
        setState: R.setState
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
const yi = Vn();
function $n() {
  return R((e) => e.time);
}
function bi() {
  return R((e) => ({ hour: e.time.hour, minute: e.time.minute }));
}
function Si(e = !0) {
  const n = R((r) => r.tick), t = D(0);
  k(() => {
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
function vi(e) {
  const n = R((t) => t.addListener);
  k(() => n((t) => {
    t.kind === "newDay" && e(t.time);
  }), [n, e]);
}
function xi(e) {
  const n = R((t) => t.addListener);
  k(() => n((t) => {
    t.kind === "newHour" && e(t.time);
  }), [n, e]);
}
const Wn = {
  spring: "#ffb6c1",
  summer: "#9bd97a",
  autumn: "#e0a060",
  winter: "#cfe2ff"
}, jn = {
  sun: "일",
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토"
};
function Ii() {
  const e = $n(), n = String(e.hour).padStart(2, "0"), t = String(e.minute).padStart(2, "0");
  return /* @__PURE__ */ d(
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
      children: /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ d(
          "span",
          {
            style: {
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: Wn[e.season] ?? "#fff"
            }
          }
        ),
        /* @__PURE__ */ m("span", { children: [
          "Y",
          e.year,
          " M",
          String(e.month).padStart(2, "0"),
          " D",
          String(e.day).padStart(2, "0"),
          " ",
          "(",
          jn[e.weekday],
          ")"
        ] }),
        /* @__PURE__ */ m("span", { style: { opacity: 0.85 }, children: [
          n,
          ":",
          t
        ] })
      ] })
    }
  );
}
const qn = [
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
function wi() {
  G().registerAll(qn);
}
const Hn = ["axe", "shovel", "water-can", "net", "rod", "apple"];
function Xn(e, n, t) {
  const r = e.slice();
  for (let o = r.length - 1; o > 0; o--) {
    const s = Math.floor(t() * (o + 1));
    [r[o], r[s]] = [r[s], r[o]];
  }
  return r.slice(0, Math.min(n, r.length));
}
function Yn(e) {
  let n = e | 0 || 1;
  return () => (n = n * 1664525 + 1013904223 | 0, (n >>> 0) / 4294967295);
}
const J = Y((e, n) => ({
  catalog: Hn,
  dailyStock: [],
  lastRolledDay: -1,
  setCatalog: (t) => e({ catalog: t.slice() }),
  rollDailyStock: (t, r = 4) => {
    const o = n();
    if (o.lastRolledDay === t && o.dailyStock.length > 0) return;
    const s = Yn(t * 9301 + 49297), a = Xn(o.catalog, r, s).map((l) => {
      const c = G().get(l), f = c?.stackable ? 5 + Math.floor(s() * 6) : 1;
      return { itemId: l, price: c?.buyPrice ?? 100, stock: f };
    });
    e({ dailyStock: a, lastRolledDay: t });
  },
  buy: (t, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    const o = n(), s = o.dailyStock.findIndex((p) => p.itemId === t);
    if (s < 0) return { ok: !1, reason: "not in stock" };
    const i = o.dailyStock[s], a = i.stock ?? 0;
    if (a < r) return { ok: !1, reason: "insufficient stock" };
    const l = (i.price ?? n().priceOf(t)) * r, c = W.getState();
    if (c.bells < l) return { ok: !1, reason: "insufficient bells" };
    if (!c.spend(l)) return { ok: !1, reason: "spend failed" };
    if (M.getState().add(t, r) > 0)
      return c.add(l), { ok: !1, reason: "inventory full" };
    const u = o.dailyStock.slice();
    return u[s] = { ...i, stock: a - r }, e({ dailyStock: u }), { ok: !0 };
  },
  sell: (t, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    if (M.getState().countOf(t) < r) return { ok: !1, reason: "not enough items" };
    const s = M.getState().removeById(t, r);
    if (s < r) return { ok: !1, reason: "remove failed" };
    const i = n().sellPriceOf(t) * s;
    return i > 0 && W.getState().add(i), { ok: !0 };
  },
  priceOf: (t) => {
    const o = n().dailyStock.find((s) => s.itemId === t);
    return o?.price != null ? o.price : G().get(t)?.buyPrice ?? 0;
  },
  sellPriceOf: (t) => G().get(t)?.sellPrice ?? 0,
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
})), Kn = "gaesup.economy", Qn = "wallet", Zn = "shop", Jn = "wallet.store", er = "shop.store";
function tr() {
  return W.getState().serialize();
}
function nr(e) {
  W.getState().hydrate(e);
}
function rr() {
  return J.getState().serialize();
}
function or(e) {
  J.getState().hydrate(e);
}
function sr(e = {}) {
  const n = e.id ?? Kn, t = e.walletSaveExtensionId ?? Qn, r = e.shopSaveExtensionId ?? Zn, o = e.walletStoreServiceId ?? Jn, s = e.shopStoreServiceId ?? er;
  return {
    id: n,
    name: "GaeSup Economy",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["economy", "wallet", "shop"],
    setup(i) {
      i.save.register(t, {
        key: t,
        serialize: tr,
        hydrate: nr
      }, n), i.save.register(r, {
        key: r,
        serialize: rr,
        hydrate: or
      }, n), i.services.register(o, {
        useStore: W,
        getState: W.getState,
        setState: W.setState
      }, n), i.services.register(s, {
        useStore: J,
        getState: J.getState,
        setState: J.setState
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
const Ei = sr();
function ki({ position: e = "top-center" }) {
  const n = W((r) => r.bells);
  return /* @__PURE__ */ m(
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
        /* @__PURE__ */ d("span", { style: {
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
        /* @__PURE__ */ d("span", { style: { fontWeight: 700 }, children: n.toLocaleString() })
      ]
    }
  );
}
function Ci({ open: e, onClose: n, title: t = "Shop" }) {
  const [r, o] = F("buy"), s = J((p) => p.dailyStock), i = J((p) => p.buy), a = J((p) => p.sell), l = J((p) => p.sellPriceOf), c = W((p) => p.bells), f = M((p) => p.slots);
  if (!e) return null;
  const u = (() => {
    const p = /* @__PURE__ */ new Map();
    for (const h of f)
      h && p.set(h.itemId, (p.get(h.itemId) ?? 0) + h.count);
    return Array.from(p.entries()).filter(([h]) => l(h) > 0);
  })();
  return /* @__PURE__ */ d(
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
      children: /* @__PURE__ */ m(
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
            /* @__PURE__ */ m("div", { style: { padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ d("strong", { style: { fontSize: 15 }, children: t }),
              /* @__PURE__ */ m("span", { style: { color: "#ffd84a" }, children: [
                c.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ d("button", { onClick: n, style: vt(), children: "닫기" })
            ] }),
            /* @__PURE__ */ m("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ d(Ke, { active: r === "buy", onClick: () => o("buy"), children: "구매" }),
              /* @__PURE__ */ d(Ke, { active: r === "sell", onClick: () => o("sell"), children: "판매" })
            ] }),
            /* @__PURE__ */ m("div", { style: { overflowY: "auto", padding: 10 }, children: [
              r === "buy" && (s.length === 0 ? /* @__PURE__ */ d("div", { style: { opacity: 0.7, padding: 12 }, children: "오늘 상품이 없습니다." }) : s.map((p) => {
                const h = G().get(p.itemId), b = p.price ?? h?.buyPrice ?? 0, w = p.stock ?? 0;
                return /* @__PURE__ */ d(
                  Qe,
                  {
                    ...h?.color ? { color: h.color } : {},
                    name: h?.name ?? p.itemId,
                    sub: `재고 ${w}`,
                    price: b,
                    disabled: w <= 0 || c < b,
                    actionLabel: "구매",
                    onAction: () => {
                      const v = i(p.itemId, 1);
                      v.ok ? O("success", `${h?.name ?? p.itemId} 구매`) : O("warn", `구매 실패: ${v.reason ?? ""}`);
                    }
                  },
                  p.itemId
                );
              })),
              r === "sell" && (u.length === 0 ? /* @__PURE__ */ d("div", { style: { opacity: 0.7, padding: 12 }, children: "판매할 아이템이 없습니다." }) : u.map(([p, h]) => {
                const b = G().get(p), w = l(p);
                return /* @__PURE__ */ d(
                  Qe,
                  {
                    ...b?.color ? { color: b.color } : {},
                    name: b?.name ?? p,
                    sub: `보유 ${h}`,
                    price: w,
                    actionLabel: "판매",
                    onAction: () => {
                      const v = a(p, 1);
                      v.ok ? O("reward", `${b?.name ?? p} 판매 +${w} B`) : O("warn", `판매 실패: ${v.reason ?? ""}`);
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
function Ke({ active: e, onClick: n, children: t }) {
  return /* @__PURE__ */ d(
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
function Qe({
  color: e,
  name: n,
  sub: t,
  price: r,
  actionLabel: o,
  onAction: s,
  disabled: i
}) {
  return /* @__PURE__ */ m("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 6px",
    borderBottom: "1px solid #2a2a2a"
  }, children: [
    /* @__PURE__ */ d("span", { style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      background: e ?? "#888"
    } }),
    /* @__PURE__ */ m("div", { style: { flex: 1 }, children: [
      /* @__PURE__ */ d("div", { children: n }),
      t && /* @__PURE__ */ d("div", { style: { fontSize: 11, opacity: 0.7 }, children: t })
    ] }),
    /* @__PURE__ */ m("div", { style: { color: "#ffd84a", minWidth: 64, textAlign: "right" }, children: [
      r.toLocaleString(),
      " B"
    ] }),
    /* @__PURE__ */ d("button", { onClick: s, disabled: i, style: vt(i), children: o })
  ] });
}
function vt(e) {
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
function _i({
  useKey: e = "f",
  range: n = 2.4,
  cooldownMs: t = 350
} = {}) {
  const { position: r, rotation: o } = ie({ updateInterval: 16 }), s = D(0);
  return k(() => {
    const i = `Key${e.toUpperCase()}`, a = e.toLowerCase(), l = (c) => {
      const f = c.target?.tagName?.toLowerCase();
      if (f === "input" || f === "textarea" || c.code !== i && c.key.toLowerCase() !== a) return;
      const u = performance.now();
      if (u - s.current < t) return;
      const p = M.getState().getEquipped();
      if (!p) return;
      const h = G().get(p.itemId);
      if (!h?.toolKind) return;
      const b = h.toolKind, w = o?.y ?? 0, v = new S.Vector3(Math.sin(w), 0, Math.cos(w)).normalize();
      s.current = u, kt().emit({
        kind: b,
        origin: [r.x, r.y, r.z],
        direction: [v.x, v.y, v.z],
        range: n,
        timestamp: u
      });
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [e, t, n, r, o]), null;
}
const ir = "gaesup.relations", ar = "relations", cr = "relations.store";
function lr() {
  return Fe.getState().serialize();
}
function ur(e) {
  Fe.getState().hydrate(e);
}
function dr(e = {}) {
  return q({
    id: e.id ?? ir,
    name: "GaeSup Relations",
    saveExtensionId: e.saveExtensionId ?? ar,
    storeServiceId: e.storeServiceId ?? cr,
    store: Fe,
    readyEvent: "relations:ready",
    capabilities: ["relations"],
    serialize: lr,
    hydrate: ur
  });
}
const Ti = dr();
let fr = 0;
function pr() {
  return `mail_${Date.now().toString(36)}_${(++fr).toString(36)}`;
}
function mr(e) {
  return e.itemId !== void 0;
}
const re = Y((e, n) => ({
  messages: [],
  send: (t) => {
    const r = t.id ?? pr(), o = {
      id: r,
      from: t.from,
      subject: t.subject,
      body: t.body,
      sentDay: t.sentDay,
      ...t.attachments ? { attachments: t.attachments } : {},
      read: !1,
      claimed: !t.attachments || t.attachments.length === 0
    };
    return e({ messages: [...n().messages, o] }), O("mail", `새 우편: ${t.subject}`), r;
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
      if (mr(s)) {
        if (M.getState().add(s.itemId, s.count ?? 1) > 0) {
          o = !1, O("warn", "인벤토리 부족, 일부 우편물 미수령");
          break;
        }
      } else
        W.getState().add(s.bells);
    return o && (e({ messages: n().messages.map((s) => s.id === t ? { ...s, claimed: !0, read: !0 } : s) }), O("reward", "우편 첨부물 수령")), o;
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
})), gr = "gaesup.mail", hr = "mail", yr = "mail.store";
function br() {
  return re.getState().serialize();
}
function Sr(e) {
  re.getState().hydrate(e);
}
function vr(e = {}) {
  return q({
    id: e.id ?? gr,
    name: "GaeSup Mail",
    saveExtensionId: e.saveExtensionId ?? hr,
    storeServiceId: e.storeServiceId ?? yr,
    store: re,
    readyEvent: "mail:ready",
    capabilities: ["mail"],
    serialize: br,
    hydrate: Sr
  });
}
const Mi = vr();
function Ri({ toggleKey: e = "m" }) {
  const [n, t] = F(!1), [r, o] = F(null), s = re((u) => u.messages), i = re((u) => u.markRead), a = re((u) => u.claim), l = re((u) => u.delete);
  if (k(() => {
    const u = (p) => {
      const h = p.target?.tagName?.toLowerCase();
      h === "input" || h === "textarea" || (p.key.toLowerCase() === e.toLowerCase() && t((b) => !b), p.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", u), () => window.removeEventListener("keydown", u);
  }, [e]), !n) return null;
  const c = s.slice().sort((u, p) => p.sentDay - u.sentDay), f = r ? c.find((u) => u.id === r) ?? null : null;
  return /* @__PURE__ */ d(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => t(!1),
      children: /* @__PURE__ */ m(
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
            /* @__PURE__ */ m("div", { style: { width: 260, borderRight: "1px solid #333", display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ m("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ d("strong", { children: "우편함" }),
                /* @__PURE__ */ d("span", { style: { fontSize: 12, opacity: 0.7 }, children: c.length })
              ] }),
              /* @__PURE__ */ d("div", { style: { flex: 1, overflowY: "auto" }, children: c.length === 0 ? /* @__PURE__ */ d(Ir, { children: "우편이 없습니다." }) : c.map((u) => /* @__PURE__ */ m(
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
                    /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      !u.read && /* @__PURE__ */ d("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "#cf9aff" } }),
                      /* @__PURE__ */ d("strong", { style: { fontSize: 13 }, children: u.subject })
                    ] }),
                    /* @__PURE__ */ m("div", { style: { fontSize: 11, opacity: 0.6 }, children: [
                      u.from,
                      " · day ",
                      u.sentDay
                    ] }),
                    u.attachments && u.attachments.length > 0 && !u.claimed && /* @__PURE__ */ d("div", { style: { fontSize: 11, color: "#ffd84a" }, children: "* 첨부물" })
                  ]
                },
                u.id
              )) })
            ] }),
            /* @__PURE__ */ m("div", { style: { flex: 1, display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ m("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ d("span", { children: f ? f.subject : "메시지를 선택하세요" }),
                /* @__PURE__ */ m("button", { onClick: () => t(!1), style: Oe(), children: [
                  "닫기 [",
                  e.toUpperCase(),
                  "]"
                ] })
              ] }),
              /* @__PURE__ */ d("div", { style: { flex: 1, padding: 12, overflowY: "auto" }, children: f ? /* @__PURE__ */ d(xr, { msg: f, onClaim: () => a(f.id), onDelete: () => {
                l(f.id), o(null);
              } }) : /* @__PURE__ */ d("div", { style: { opacity: 0.6 }, children: "왼쪽에서 메시지를 선택하세요." }) })
            ] })
          ]
        }
      )
    }
  );
}
function xr({ msg: e, onClaim: n, onDelete: t }) {
  return /* @__PURE__ */ m("div", { children: [
    /* @__PURE__ */ m("div", { style: { marginBottom: 6, opacity: 0.75 }, children: [
      "From. ",
      e.from
    ] }),
    /* @__PURE__ */ d("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 12 }, children: e.body }),
    e.attachments && e.attachments.length > 0 && /* @__PURE__ */ m("div", { style: { padding: 10, background: "#222", borderRadius: 8, marginBottom: 8 }, children: [
      /* @__PURE__ */ d("div", { style: { marginBottom: 6, color: "#ffd84a", fontSize: 12 }, children: "첨부물" }),
      /* @__PURE__ */ d("ul", { style: { margin: 0, paddingLeft: 18 }, children: e.attachments.map((r, o) => {
        if ("itemId" in r) {
          const s = G().get(r.itemId);
          return /* @__PURE__ */ m("li", { children: [
            s?.name ?? r.itemId,
            " x",
            r.count ?? 1
          ] }, o);
        }
        return /* @__PURE__ */ m("li", { children: [
          r.bells,
          " B"
        ] }, o);
      }) }),
      /* @__PURE__ */ d("div", { style: { marginTop: 8, display: "flex", gap: 6, justifyContent: "flex-end" }, children: e.claimed ? /* @__PURE__ */ d("span", { style: { fontSize: 12, opacity: 0.6 }, children: "수령 완료" }) : /* @__PURE__ */ d("button", { onClick: n, style: Oe(!0), children: "받기" }) })
    ] }),
    /* @__PURE__ */ d("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ d("button", { onClick: t, style: Oe(), children: "삭제" }) })
  ] });
}
function Ir({ children: e }) {
  return /* @__PURE__ */ d("div", { style: { padding: 14, opacity: 0.6 }, children: e });
}
function Oe(e) {
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
const Ze = ["fish", "bug", "food", "material", "furniture", "tool", "misc"], ge = Y((e, n) => ({
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
})), wr = "gaesup.catalog", Er = "catalog", kr = "catalog.store";
function Cr() {
  return ge.getState().serialize();
}
function _r(e) {
  ge.getState().hydrate(e);
}
function Tr(e = {}) {
  return q({
    id: e.id ?? wr,
    name: "GaeSup Catalog",
    saveExtensionId: e.saveExtensionId ?? Er,
    storeServiceId: e.storeServiceId ?? kr,
    store: ge,
    readyEvent: "catalog:ready",
    capabilities: ["catalog"],
    serialize: Cr,
    hydrate: _r
  });
}
const Di = Tr();
function Pi(e = !0) {
  k(() => e ? M.subscribe((t, r) => {
    if (t.slots === r.slots) return;
    const o = Math.floor(R.getState().totalMinutes / (60 * 24)), s = /* @__PURE__ */ new Map();
    for (const a of r.slots) a && s.set(a.itemId, (s.get(a.itemId) ?? 0) + a.count);
    const i = /* @__PURE__ */ new Map();
    for (const a of t.slots) a && i.set(a.itemId, (i.get(a.itemId) ?? 0) + a.count);
    for (const [a, l] of i.entries()) {
      const c = l - (s.get(a) ?? 0);
      c > 0 && ge.getState().record(a, c, o);
    }
  }) : void 0, [e]);
}
function Ai({ toggleKey: e = "k" }) {
  const [n, t] = F(!1), [r, o] = F("fish"), s = ge((f) => f.entries);
  k(() => {
    const f = (u) => {
      const p = u.target?.tagName?.toLowerCase();
      p === "input" || p === "textarea" || (u.key.toLowerCase() === e.toLowerCase() && t((h) => !h), u.key === "Escape" && t(!1));
    };
    return window.addEventListener("keydown", f), () => window.removeEventListener("keydown", f);
  }, [e]);
  const i = L(() => G().all(), []), a = L(() => {
    const f = /* @__PURE__ */ new Map();
    for (const u of Ze) f.set(u, []);
    for (const u of i) {
      const p = f.get(u.category);
      p && p.push(u);
    }
    return f;
  }, [i]);
  if (!n) return null;
  const l = a.get(r) ?? [], c = l.filter((f) => s[f.id]).length;
  return /* @__PURE__ */ d(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => t(!1),
      children: /* @__PURE__ */ m(
        "div",
        {
          onClick: (f) => f.stopPropagation(),
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
            /* @__PURE__ */ m("div", { style: { padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ d("strong", { style: { fontSize: 15 }, children: "도감" }),
              /* @__PURE__ */ m("button", { onClick: () => t(!1), style: Mr(), children: [
                "닫기 [",
                e.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ d("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: Ze.map((f) => {
              const u = a.get(f) ?? [];
              if (u.length === 0) return null;
              const p = u.filter((h) => s[h.id]).length;
              return /* @__PURE__ */ m(
                "button",
                {
                  onClick: () => o(f),
                  style: {
                    flex: 1,
                    padding: "8px 4px",
                    background: r === f ? "#262626" : "transparent",
                    color: r === f ? "#7adf90" : "#ddd",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Pretendard', system-ui, sans-serif",
                    fontSize: 12
                  },
                  children: [
                    Je(f),
                    " (",
                    p,
                    "/",
                    u.length,
                    ")"
                  ]
                },
                f
              );
            }) }),
            /* @__PURE__ */ m("div", { style: { padding: "6px 14px", fontSize: 12, opacity: 0.7 }, children: [
              Je(r),
              " — ",
              c,
              "/",
              l.length,
              " 수집"
            ] }),
            /* @__PURE__ */ m("div", { style: { flex: 1, overflowY: "auto", padding: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }, children: [
              l.map((f) => {
                const u = s[f.id], p = !!u;
                return /* @__PURE__ */ m("div", { style: {
                  padding: 10,
                  borderRadius: 8,
                  background: p ? "#222" : "#181818",
                  border: p ? "1px solid #2e3" : "1px solid #2a2a2a",
                  opacity: p ? 1 : 0.4
                }, children: [
                  /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }, children: [
                    /* @__PURE__ */ d("span", { style: { width: 16, height: 16, borderRadius: 4, background: f.color ?? "#888" } }),
                    /* @__PURE__ */ d("strong", { style: { fontSize: 13 }, children: p ? f.name : "???" })
                  ] }),
                  p && /* @__PURE__ */ m("div", { style: { fontSize: 11, opacity: 0.7 }, children: [
                    "수집 ",
                    u.totalCollected,
                    " · day ",
                    u.firstSeenDay
                  ] })
                ] }, f.id);
              }),
              l.length === 0 && /* @__PURE__ */ d("div", { style: { opacity: 0.6 }, children: "이 카테고리에는 항목이 없습니다." })
            ] })
          ]
        }
      )
    }
  );
}
function Je(e) {
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
function Mr() {
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
class Rr {
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
let Ce = null;
function fe() {
  return Ce || (Ce = new Rr()), Ce;
}
const le = Y((e, n) => ({
  unlocked: /* @__PURE__ */ new Set(),
  unlock: (t) => {
    const r = fe().get(t);
    if (!r || n().unlocked.has(t)) return;
    const o = new Set(n().unlocked);
    o.add(t), e({ unlocked: o }), O("info", `레시피 해금: ${r.name}`);
  },
  isUnlocked: (t) => {
    const r = fe().get(t);
    return r ? r.unlockedByDefault ? !0 : n().unlocked.has(t) : !1;
  },
  canCraft: (t) => {
    const r = fe().get(t);
    if (!r) return { ok: !1, reason: "unknown recipe" };
    if (!n().isUnlocked(t)) return { ok: !1, reason: "locked" };
    const o = M.getState();
    for (const s of r.ingredients)
      if (o.countOf(s.itemId) < s.count) return { ok: !1, reason: "missing ingredients" };
    return r.requireBells && W.getState().bells < r.requireBells ? { ok: !1, reason: "insufficient bells" } : { ok: !0 };
  },
  craft: (t) => {
    const r = n().canCraft(t);
    if (!r.ok) return r;
    const o = fe().require(t), s = M.getState();
    for (const a of o.ingredients)
      if (s.removeById(a.itemId, a.count) < a.count) return { ok: !1, reason: "remove failed" };
    return o.requireBells && !W.getState().spend(o.requireBells) ? { ok: !1, reason: "spend failed" } : (s.add(o.output.itemId, o.output.count) > 0 ? O("warn", "인벤토리 부족, 일부 결과물 폐기") : O("reward", `제작 완료: ${o.name}`), { ok: !0 });
  },
  serialize: () => ({ version: 1, unlocked: Array.from(n().unlocked) }),
  hydrate: (t) => {
    !t || !Array.isArray(t.unlocked) || e({ unlocked: new Set(t.unlocked) });
  }
})), Dr = "gaesup.crafting", Pr = "crafting", Ar = "crafting.store";
function Lr() {
  return le.getState().serialize();
}
function Or(e) {
  le.getState().hydrate(e);
}
function zr(e = {}) {
  return q({
    id: e.id ?? Dr,
    name: "GaeSup Crafting",
    saveExtensionId: e.saveExtensionId ?? Pr,
    storeServiceId: e.storeServiceId ?? Ar,
    store: le,
    readyEvent: "crafting:ready",
    capabilities: ["crafting"],
    serialize: Lr,
    hydrate: Or
  });
}
const Li = zr();
function Oi({ toggleKey: e = "c", title: n = "제작대", open: t, onClose: r }) {
  const [o, s] = F(!1), i = t !== void 0, a = i ? t : o, l = () => {
    i ? r?.() : s(!1);
  }, c = () => {
    i ? a && r?.() : s((g) => !g);
  }, f = le((g) => g.isUnlocked), u = le((g) => g.canCraft), p = le((g) => g.craft), h = M((g) => g.slots), b = W((g) => g.bells);
  if (k(() => {
    const g = (x) => {
      const I = x.target?.tagName?.toLowerCase();
      I === "input" || I === "textarea" || (x.key.toLowerCase() === e.toLowerCase() && c(), x.key === "Escape" && l());
    };
    return window.addEventListener("keydown", g), () => window.removeEventListener("keydown", g);
  }, [e, i, a]), !a) return null;
  const w = fe().all(), v = (() => {
    const g = /* @__PURE__ */ new Map();
    for (const x of h) x && g.set(x.itemId, (g.get(x.itemId) ?? 0) + x.count);
    return g;
  })();
  return /* @__PURE__ */ d(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: l,
      children: /* @__PURE__ */ m(
        "div",
        {
          onClick: (g) => g.stopPropagation(),
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
            /* @__PURE__ */ m("div", { style: { padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ d("strong", { style: { fontSize: 15 }, children: n }),
              /* @__PURE__ */ m("span", { style: { color: "#ffd84a" }, children: [
                b.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ m("button", { onClick: l, style: et(), children: [
                "닫기 [",
                e.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ m("div", { style: { overflowY: "auto", padding: 10 }, children: [
              w.length === 0 && /* @__PURE__ */ d(Fr, { children: "레시피가 없습니다." }),
              w.map((g) => {
                const x = f(g.id), I = u(g.id), E = G().get(g.output.itemId);
                return /* @__PURE__ */ m("div", { style: {
                  padding: 10,
                  marginBottom: 6,
                  background: "#222",
                  borderRadius: 8,
                  opacity: x ? 1 : 0.45
                }, children: [
                  /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
                    /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      /* @__PURE__ */ d("span", { style: { width: 16, height: 16, borderRadius: 4, background: E?.color ?? "#888" } }),
                      /* @__PURE__ */ d("strong", { children: x ? g.name : "???" }),
                      g.output.count > 1 && /* @__PURE__ */ m("span", { style: { opacity: 0.7 }, children: [
                        "x",
                        g.output.count
                      ] })
                    ] }),
                    /* @__PURE__ */ d(
                      "button",
                      {
                        onClick: () => p(g.id),
                        disabled: !I.ok,
                        style: et(I.ok),
                        children: "제작"
                      }
                    )
                  ] }),
                  x && /* @__PURE__ */ m("div", { style: { fontSize: 12, opacity: 0.85 }, children: [
                    "재료: ",
                    g.ingredients.map((C) => {
                      const A = v.get(C.itemId) ?? 0, y = A >= C.count, T = G().get(C.itemId);
                      return /* @__PURE__ */ m("span", { style: { marginRight: 8, color: y ? "#7adf90" : "#ff8a8a" }, children: [
                        T?.name ?? C.itemId,
                        " ",
                        A,
                        "/",
                        C.count
                      ] }, C.itemId);
                    }),
                    g.requireBells ? /* @__PURE__ */ m("span", { style: { color: "#ffd84a" }, children: [
                      "· ",
                      g.requireBells,
                      " B"
                    ] }) : null
                  ] })
                ] }, g.id);
              })
            ] })
          ]
        }
      )
    }
  );
}
function Fr({ children: e }) {
  return /* @__PURE__ */ d("div", { style: { padding: 14, opacity: 0.6 }, children: e });
}
function et(e) {
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
class Nr {
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
let _e = null;
function se() {
  return _e || (_e = new Nr()), _e;
}
function tt(e, n) {
  return { id: e, position: n, state: "empty", stageIndex: 0 };
}
function Ur(e, n) {
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
const U = Y((e, n) => ({
  plots: {},
  registerPlot: (t) => {
    if (n().plots[t.id]) return;
    const o = { ...tt(t.id, t.position), ...t };
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
    const a = M.getState();
    return a.countOf(i.seedItemId) < 1 ? (O("warn", `${i.name} 씨앗 부족`), !1) : (a.removeById(i.seedItemId, 1), e({
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
    }), O("success", `${i.name} 심음`), !0);
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
    return o ? M.getState().add(o.yieldItemId, o.yieldCount) > 0 ? (O("warn", "인벤토리가 가득 찼습니다"), !1) : (O("reward", `${o.name} +${o.yieldCount}`), e({
      plots: {
        ...n().plots,
        [t]: {
          ...tt(r.id, r.position),
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
          const f = l.lastWateredAt ?? l.plantedAt;
          if (t - f >= c.driedOutMinutes)
            l = { ...l, state: "dried" }, s = !0;
          else {
            const u = Ur(l, t), p = c.stages.length - 1, h = u >= p ? "mature" : "planted";
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
      const c = l.position[0] - t, f = l.position[2] - r, u = c * c + f * f;
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
})), Br = "gaesup.farming", Gr = "farming", Vr = "farming.store";
function $r() {
  return U.getState().serialize();
}
function Wr(e) {
  U.getState().hydrate(e);
}
function jr(e = {}) {
  return q({
    id: e.id ?? Br,
    name: "GaeSup Farming",
    saveExtensionId: e.saveExtensionId ?? Gr,
    storeServiceId: e.storeServiceId ?? Vr,
    store: U,
    readyEvent: "farming:ready",
    capabilities: ["farming"],
    serialize: $r,
    hydrate: Wr
  });
}
const zi = jr();
function Te(e, n, t) {
  const r = n.origin[0] - e.position[0], o = n.origin[2] - e.position[2];
  return r * r + o * o <= t * t;
}
function Fi({ id: e, position: n, size: t = 1.4, hitRange: r = 1.6 }) {
  const o = U((I) => I.registerPlot), s = U((I) => I.unregisterPlot), i = U((I) => I.plots[e]), a = U((I) => I.till), l = U((I) => I.plant), c = U((I) => I.water), f = U((I) => I.harvest), u = U((I) => I.tick);
  k(() => (o({ id: e, position: n }), () => s(e)), [e, n, o, s]), k(() => {
    let I = 0;
    const E = R.subscribe((C) => {
      C.totalMinutes !== I && (I = C.totalMinutes, u(C.totalMinutes));
    });
    return u(R.getState().totalMinutes), E;
  }, [u]);
  const p = K((I) => {
    const E = U.getState().plots[e];
    if (!(!E || !Te(E, I, r))) {
      if (E.state === "mature") return f(e) ? !0 : void 0;
      if (E.state === "empty") {
        const C = a(e);
        return C && O("info", "땅을 갈았다"), C ? !0 : void 0;
      }
    }
  }, [e, r, a, f]), h = K((I) => {
    const E = U.getState().plots[e];
    if (!E || !Te(E, I, r) || E.state !== "tilled") return;
    const C = M.getState().getEquipped();
    if (!C) return;
    const A = se().bySeedItemId(C.itemId);
    if (!A) return;
    const y = R.getState().totalMinutes;
    return l(e, A.id, y) ? !0 : void 0;
  }, [e, r, l]), b = K((I) => {
    const E = U.getState().plots[e];
    if (!E || !Te(E, I, r) || E.state !== "planted" && E.state !== "dried") return;
    const C = R.getState().totalMinutes, A = c(e, C);
    return A && O("info", "물을 줬다"), A ? !0 : void 0;
  }, [e, r, c]);
  Ee("shovel", p), Ee("seed", h), Ee("water", b);
  const w = i?.cropId ? se().get(i.cropId) : void 0, v = w ? w.stages[i.stageIndex] : void 0, g = L(() => !i || i.state === "empty" ? "#5a3f24" : i.state === "tilled" ? "#4a2f18" : i.state === "dried" ? "#6b5230" : "#3a2810", [i]), x = D(null);
  return ne(({ clock: I }) => {
    const E = x.current;
    if (!E) return;
    const C = I.elapsedTime;
    E.rotation.y = Math.sin(C * 0.4) * 0.05, E.position.y = (v?.scale ?? 0.3) * 0.5 + Math.sin(C * 1.2) * 0.01;
  }), /* @__PURE__ */ m("group", { position: n, children: [
    /* @__PURE__ */ m("mesh", { receiveShadow: !0, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: [
      /* @__PURE__ */ d("planeGeometry", { args: [t, t] }),
      /* @__PURE__ */ d("meshToonMaterial", { color: g })
    ] }),
    i && (i.state === "planted" || i.state === "mature" || i.state === "dried") && w && v && /* @__PURE__ */ m("mesh", { ref: x, castShadow: !0, position: [0, v.scale * 0.5, 0], children: [
      /* @__PURE__ */ d("coneGeometry", { args: [Math.max(0.08, v.scale * 0.35), Math.max(0.16, v.scale * 0.9), 10] }),
      /* @__PURE__ */ d("meshToonMaterial", { color: i.state === "dried" ? "#7a6a4a" : v.color ?? "#9adf90" })
    ] }),
    i?.state === "mature" && /* @__PURE__ */ m("mesh", { position: [0, 1, 0], children: [
      /* @__PURE__ */ d("ringGeometry", { args: [0.18, 0.24, 16] }),
      /* @__PURE__ */ d("meshBasicMaterial", { color: "#ffd84a", transparent: !0, opacity: 0.85, depthWrite: !1 })
    ] })
  ] });
}
const qr = [
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
let nt = !1;
function Ni() {
  nt || (nt = !0, se().registerAll(qr));
}
const Hr = "gaesup.weather", Xr = "weather", Yr = "weather.store";
function Kr() {
  return j.getState().serialize();
}
function Qr(e) {
  j.getState().hydrate(e);
}
function Zr(e = {}) {
  const n = e.id ?? Hr, t = e.saveExtensionId ?? Xr, r = e.storeServiceId ?? Yr;
  return {
    id: n,
    name: "GaeSup Weather",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["weather"],
    setup(o) {
      o.save.register(t, {
        key: t,
        serialize: Kr,
        hydrate: Qr
      }, n), o.services.register(r, {
        useStore: j,
        getState: j.getState,
        setState: j.setState
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
const Ui = Zr(), Jr = {
  sunny: { sym: "O", color: "#ffd84a", label: "맑음" },
  cloudy: { sym: "c", color: "#aab2bc", label: "흐림" },
  rain: { sym: "r", color: "#4aa8ff", label: "비" },
  snow: { sym: "*", color: "#dff0ff", label: "눈" },
  storm: { sym: "!", color: "#7f7fff", label: "폭풍" }
};
function Bi({ position: e = "top-left" }) {
  const n = j((o) => o.current);
  if (!n) return null;
  const t = Jr[n.kind], r = e === "top-right" ? { top: 50, right: 12 } : { top: 50, left: 12 };
  return /* @__PURE__ */ m(
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
        /* @__PURE__ */ d("span", { style: {
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
        /* @__PURE__ */ d("span", { children: t.label })
      ]
    }
  );
}
function Gi(e = !0) {
  k(() => {
    if (!e) return;
    const n = () => {
      const r = R.getState(), o = Math.floor(r.totalMinutes / (60 * 24)), s = j.getState().current;
      (!s || s.day !== o) && j.getState().rollForDay(o, r.time.season);
    };
    return n(), R.subscribe((r, o) => {
      const s = Math.floor(r.totalMinutes / 1440), i = Math.floor(o.totalMinutes / (60 * 24));
      s !== i && n();
    });
  }, [e]);
}
function rt(e, n) {
  return { id: e, position: n, size: [4, 4], state: "empty" };
}
const H = Y((e, n) => ({
  houses: {},
  residents: {},
  decorationScore: 0,
  registerHouse: (t) => {
    if (n().houses[t.id]) return;
    const o = { ...rt(t.id, t.position), ...t };
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
    }), O("reward", `${i.name}이(가) 이사 왔다!`), !0);
  },
  moveOut: (t) => {
    const r = n().houses[t];
    if (!r || r.state !== "occupied") return !1;
    const o = r.residentId ? n().residents[r.residentId] : null;
    return e({
      houses: {
        ...n().houses,
        [t]: rt(t, r.position)
      }
    }), o && O("info", `${o.name}이(가) 떠났다`), !0;
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
})), eo = "gaesup.town", to = "town", no = "town.store";
function ro() {
  return H.getState().serialize();
}
function oo(e) {
  H.getState().hydrate(e);
}
function so(e = {}) {
  return q({
    id: e.id ?? eo,
    name: "GaeSup Town",
    saveExtensionId: e.saveExtensionId ?? to,
    storeServiceId: e.storeServiceId ?? no,
    store: H,
    readyEvent: "town:ready",
    capabilities: ["town"],
    serialize: ro,
    hydrate: oo
  });
}
const Vi = so(), io = {
  tile: 2,
  wall: 1,
  placedObject: 5,
  base: 0
};
function $i(e = !0, n = {}) {
  k(() => {
    if (!e) return;
    const t = { ...io, ...n }, r = (s) => {
      let i = 0, a = 0;
      const l = s.objects.length;
      for (const f of s.tileGroups.values())
        i += f.tiles.length;
      for (const f of s.wallGroups.values())
        a += f.walls.length;
      const c = t.base + i * t.tile + a * t.wall + l * t.placedObject;
      H.getState().setDecorationScore(c);
    };
    return r(be.getState()), be.subscribe((s) => r(s));
  }, [e, n.tile, n.wall, n.placedObject, n.base]);
}
function Wi({
  id: e,
  position: n,
  size: t = [4, 4],
  emptyColor: r = "#705038",
  reservedColor: o = "#c8a85a",
  occupiedColor: s = "#5a8acf"
}) {
  const i = H((h) => h.registerHouse), a = H((h) => h.unregisterHouse), l = H((h) => h.houses[e]), c = H((h) => h.residents);
  k(() => (i({ id: e, position: n, size: t }), () => a(e)), [e, n, t, i, a]);
  const f = l ? l.state === "occupied" ? s : l.state === "reserved" ? o : r : r, u = l?.residentId ? c[l.residentId] : null, p = L(() => new S.PlaneGeometry(t[0], t[1]), [t[0], t[1]]);
  return /* @__PURE__ */ m("group", { position: n, children: [
    /* @__PURE__ */ d("mesh", { geometry: p, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: /* @__PURE__ */ d("meshToonMaterial", { color: f, transparent: !0, opacity: 0.7 }) }),
    l?.state === "occupied" && u && /* @__PURE__ */ m(ee, { children: [
      /* @__PURE__ */ m("mesh", { position: [0, 0.6, 0], castShadow: !0, children: [
        /* @__PURE__ */ d("boxGeometry", { args: [Math.max(1.4, t[0] * 0.6), 1.2, Math.max(1.4, t[1] * 0.6)] }),
        /* @__PURE__ */ d("meshToonMaterial", { color: u.bodyColor ?? "#e8d8b8" })
      ] }),
      /* @__PURE__ */ m("mesh", { position: [0, 1.5, 0], castShadow: !0, children: [
        /* @__PURE__ */ d("coneGeometry", { args: [Math.max(1, t[0] * 0.45), 0.7, 4] }),
        /* @__PURE__ */ d("meshToonMaterial", { color: u.hatColor ?? "#a85a5a" })
      ] })
    ] }),
    l?.state === "reserved" && /* @__PURE__ */ m("mesh", { position: [0, 0.5, 0], children: [
      /* @__PURE__ */ d("boxGeometry", { args: [0.4, 1, 0.4] }),
      /* @__PURE__ */ d("meshToonMaterial", { color: o })
    ] })
  ] });
}
function ji({ position: e = "top-right", offset: n }) {
  const t = H((f) => f.decorationScore), r = H((f) => f.houses), o = H((f) => f.residents), s = Object.keys(r).length, i = Object.values(r).filter((f) => f.state === "occupied").length, a = Object.keys(o).length, c = { ...e === "bottom-right" ? { bottom: 12, right: 100 } : e === "top-left" ? { top: 160, left: 12 } : e === "bottom-left" ? { bottom: 12, left: 240 } : { top: 50, right: 12 }, ...n ?? {} };
  return /* @__PURE__ */ m(
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
        /* @__PURE__ */ m("div", { children: [
          "마을 점수 ",
          /* @__PURE__ */ d("span", { style: { color: "#ffd84a", fontWeight: 700 }, children: t })
        ] }),
        /* @__PURE__ */ m("div", { children: [
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
class ao {
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
      const f = this.ctx.currentTime;
      c.gain.setValueAtTime(0, f), c.gain.linearRampToValueAtTime((n.volume ?? 1) * 0.18, f + 0.04), c.gain.exponentialRampToValueAtTime(1e-4, f + r / 1e3 * 0.95), l.connect(c), c.connect(this.bgmGain), l.start(f), l.stop(f + r / 1e3 + 0.05), this.bgmStep += 1;
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
let Me = null;
function ce() {
  return Me || (Me = new ao()), Me;
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
})), co = "gaesup.audio", lo = "audio", uo = "audio.store";
function fo() {
  return N.getState().serialize();
}
function po(e) {
  N.getState().hydrate(e);
}
function mo(e = {}) {
  const n = e.id ?? co, t = e.saveExtensionId ?? lo, r = e.storeServiceId ?? uo;
  return {
    id: n,
    name: "GaeSup Audio",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["audio"],
    setup(o) {
      o.save.register(t, {
        key: t,
        serialize: fo,
        hydrate: po
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
const qi = mo(), go = [0, 2, 4, 5, 7, 9, 11], ho = [0, 2, 3, 5, 7, 8, 10];
function yo(e) {
  return e === "rain" || e === "storm" || e === "snow" ? ho : go;
}
function bo(e) {
  return e < 6 ? "night" : e < 10 ? "dawn" : e < 18 ? "day" : e < 22 ? "dusk" : "night";
}
function So(e, n) {
  const t = bo(e), r = yo(n), o = t === "night" ? 174.6 : t === "dawn" ? 220 : t === "dusk" ? 196 : 261.6, s = t === "day" ? 700 : 950, i = [r[0], r[2], r[4], r[2], r[0], r[3], r[1], r[4]];
  return {
    id: `bgm.${t}.${n ?? "unknown"}`,
    baseFreq: o,
    intervalMs: s,
    pattern: i,
    volume: n === "storm" ? 0.6 : 1
  };
}
function Hi(e = !0) {
  k(() => {
    if (!e) return;
    const n = () => {
      const o = R.getState(), s = j.getState().current, i = So(o.time.hour, s?.kind);
      N.getState().currentBgmId !== i.id && N.getState().playBgm(i);
    }, t = R.subscribe((o, s) => {
      o.time.hour !== s.time.hour && n();
    }), r = j.subscribe((o, s) => {
      o.current?.kind !== s.current?.kind && n();
    });
    return n(), () => {
      t(), r(), N.getState().stopBgm();
    };
  }, [e]);
}
function Xi({ position: e = "bottom-right", offset: n }) {
  const t = N((u) => u.masterMuted), r = N((u) => u.bgmMuted), o = N((u) => u.sfxMuted), s = N((u) => u.toggleMaster), i = N((u) => u.toggleBgm), a = N((u) => u.toggleSfx), c = { ...e === "top-right" ? { top: 50, right: 200 } : e === "bottom-left" ? { bottom: 12, left: 240 } : e === "top-left" ? { top: 220, left: 12 } : { bottom: 12, right: 110 }, ...n ?? {} }, f = (u, p, h) => /* @__PURE__ */ m(
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
  return /* @__PURE__ */ m(
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
        f("M", t, s),
        f("Bgm", r, i),
        f("Sfx", o, a)
      ]
    }
  );
}
const vo = {
  grass: { freq: 320, duration: 0.07, type: "triangle", volume: 0.18 },
  sand: { freq: 220, duration: 0.1, type: "sine", volume: 0.2 },
  snow: { freq: 380, duration: 0.1, type: "triangle", volume: 0.22 },
  wood: { freq: 540, duration: 0.06, type: "square", volume: 0.14 },
  stone: { freq: 760, duration: 0.05, type: "square", volume: 0.16 },
  water: { freq: 180, duration: 0.13, type: "sine", volume: 0.24 }
};
function xo(e, n) {
  const t = Et.GRID_CELL_SIZE, r = be.getState().tileGroups;
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
function Yi({
  strideMeters: e = 0.65,
  maxStepsPerSecond: n = 6,
  volume: t = 1,
  resolveSurface: r = xo,
  enabled: o = !0
} = {}) {
  const { position: s, isGrounded: i, isMoving: a, speed: l } = ie({ updateInterval: 32 }), c = D({ x: s.x, z: s.z }), f = D(0), u = D(0);
  return k(() => {
    c.current.x = s.x, c.current.z = s.z;
  }, []), ne(() => {
    if (!o) return;
    const p = performance.now(), h = s.x - c.current.x, b = s.z - c.current.z;
    if (c.current.x = s.x, c.current.z = s.z, !i || !a) {
      f.current = 0;
      return;
    }
    const w = Math.hypot(h, b);
    if (w <= 0 || (f.current += w, f.current < e) || p - u.current < 1e3 / n) return;
    f.current = 0, u.current = p;
    const v = r(s.x, s.z), g = vo[v], x = Math.min(1.4, 0.7 + l * 0.06);
    N.getState().playSfx({
      id: `footstep-${v}`,
      type: g.type ?? "sine",
      freq: g.freq ?? 320,
      duration: g.duration ?? 0.08,
      volume: (g.volume ?? 0.2) * t * x
    });
  }), null;
}
const Io = "gaesup.character", wo = "character", Eo = "character.store";
function ko() {
  return V.getState().serialize();
}
function Co(e) {
  V.getState().hydrate(e);
}
function _o(e = {}) {
  return q({
    id: e.id ?? Io,
    name: "GaeSup Character",
    saveExtensionId: e.saveExtensionId ?? wo,
    storeServiceId: e.storeServiceId ?? Eo,
    store: V,
    readyEvent: "character:ready",
    capabilities: ["character"],
    serialize: ko,
    hydrate: Co
  });
}
const Ki = _o(), To = [
  { key: "body", label: "피부" },
  { key: "hair", label: "머리" },
  { key: "hat", label: "모자" },
  { key: "top", label: "상의" },
  { key: "bottom", label: "하의" },
  { key: "shoes", label: "신발" }
], Mo = ["short", "long", "cap", "bun", "spiky"], Ro = ["default", "smile", "wink", "sleepy", "surprised"], ot = ["hat", "top", "bottom", "shoes", "face", "weapon", "accessory"], Do = (e, n) => n === "weapon" ? e.kind === "weapon" || e.slot === "weapon" : e.slot === n && (e.kind === "characterPart" || e.kind === "weapon");
function Qi({ toggleKey: e, open: n, onClose: t } = {}) {
  const r = typeof n == "boolean", [o, s] = F(!1), i = r ? n : o, a = V((y) => y.appearance), l = V((y) => y.outfits), c = V((y) => y.setName), f = V((y) => y.setColor), u = V((y) => y.setHair), p = V((y) => y.setFace), h = V((y) => y.equipOutfit), b = V((y) => y.resetAppearance), w = Ge((y) => y.ids), v = Ge((y) => y.records), [g, x] = F(""), [I, E] = F(!1), C = L(() => {
    const y = g.trim().toLowerCase();
    return ot.reduce((T, z) => (T[z] = w.map((_) => v[_]).filter((_) => !!_).filter((_) => Do(_, z)).filter((_) => y ? _.tags?.some((P) => P.toLowerCase().includes(y)) ?? !1 : !0).filter((_) => !I || _.metadata?.owned !== !1), T), {});
  }, [w, v, I, g]);
  if (k(() => {
    if (!e || r) return;
    const y = (T) => {
      const z = T.target?.tagName?.toLowerCase();
      if (z === "input" || z === "textarea") return;
      const _ = e.toLowerCase(), P = `Key${e.toUpperCase()}`;
      T.code !== P && T.key.toLowerCase() !== _ || s((ae) => !ae);
    };
    return window.addEventListener("keydown", y), () => window.removeEventListener("keydown", y);
  }, [e, r]), !i) return null;
  const A = () => {
    r ? t?.() : s(!1);
  };
  return /* @__PURE__ */ d(
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
      onClick: A,
      children: /* @__PURE__ */ m(
        "div",
        {
          onClick: (y) => y.stopPropagation(),
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
            /* @__PURE__ */ m("header", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }, children: [
              /* @__PURE__ */ d("h2", { style: { margin: 0, fontSize: 16, fontWeight: 600, flex: 1 }, children: "캐릭터 만들기" }),
              /* @__PURE__ */ d(
                "button",
                {
                  onClick: b,
                  style: Re,
                  children: "기본값"
                }
              ),
              /* @__PURE__ */ d("button", { onClick: A, style: Re, children: "닫기" })
            ] }),
            /* @__PURE__ */ m("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ d("label", { style: de, children: "이름" }),
              /* @__PURE__ */ d(
                "input",
                {
                  value: a.name,
                  onChange: (y) => c(y.target.value),
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
            /* @__PURE__ */ m("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ d("label", { style: de, children: "색상" }),
              /* @__PURE__ */ d("div", { style: st, children: To.map(({ key: y, label: T }) => /* @__PURE__ */ m("div", { style: Po, children: [
                /* @__PURE__ */ d("span", { style: { flex: 1 }, children: T }),
                /* @__PURE__ */ d(
                  "input",
                  {
                    type: "color",
                    value: a.colors[y],
                    onChange: (z) => f(y, z.target.value),
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
              ] }, y)) })
            ] }),
            /* @__PURE__ */ m("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ d("label", { style: de, children: "헤어" }),
              /* @__PURE__ */ d("div", { style: it, children: Mo.map((y) => /* @__PURE__ */ d(
                "button",
                {
                  onClick: () => u(y),
                  style: at(a.hair === y),
                  children: Tt[y]
                },
                y
              )) })
            ] }),
            /* @__PURE__ */ m("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ d("label", { style: de, children: "표정" }),
              /* @__PURE__ */ d("div", { style: it, children: Ro.map((y) => /* @__PURE__ */ d(
                "button",
                {
                  onClick: () => p(y),
                  style: at(a.face === y),
                  children: Mt[y]
                },
                y
              )) })
            ] }),
            /* @__PURE__ */ m("section", { children: [
              /* @__PURE__ */ m("div", { style: Ao, children: [
                /* @__PURE__ */ d("label", { style: { ...de, marginBottom: 0 }, children: "장착 슬롯" }),
                /* @__PURE__ */ d(
                  "input",
                  {
                    value: g,
                    onChange: (y) => x(y.target.value),
                    placeholder: "태그 검색",
                    style: Lo
                  }
                ),
                /* @__PURE__ */ m("label", { style: Oo, children: [
                  /* @__PURE__ */ d(
                    "input",
                    {
                      type: "checkbox",
                      checked: I,
                      onChange: (y) => E(y.target.checked)
                    }
                  ),
                  "보유만"
                ] })
              ] }),
              /* @__PURE__ */ d("div", { style: st, children: ot.map((y) => /* @__PURE__ */ m("div", { style: zo, children: [
                /* @__PURE__ */ m("div", { style: Fo, children: [
                  /* @__PURE__ */ d("span", { children: Rt[y] }),
                  /* @__PURE__ */ d("span", { style: { color: l[y] ? "#7adf90" : "rgba(243,244,248,0.45)" }, children: l[y] ?? "비어있음" }),
                  /* @__PURE__ */ d("button", { onClick: () => h(y, null), style: Re, children: "비우기" })
                ] }),
                /* @__PURE__ */ m("div", { style: No, children: [
                  C[y].map((T) => /* @__PURE__ */ m(
                    "button",
                    {
                      onClick: () => h(y, T.id),
                      style: Uo(l[y] === T.id),
                      children: [
                        /* @__PURE__ */ d(Lt, { asset: T, size: 58 }),
                        /* @__PURE__ */ d("span", { style: Bo, children: T.name })
                      ]
                    },
                    T.id
                  )),
                  C[y].length === 0 && /* @__PURE__ */ d("span", { style: Go, children: "사용 가능한 에셋 없음" })
                ] })
              ] }, y)) })
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
}, st = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, Po = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 8
}, it = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
}, at = (e) => ({
  padding: "6px 12px",
  borderRadius: 999,
  border: e ? "1px solid #ffd84a" : "1px solid rgba(255,255,255,0.14)",
  background: e ? "rgba(255,216,74,0.12)" : "rgba(255,255,255,0.04)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}), Re = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}, Ao = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8
}, Lo = {
  flex: 1,
  minWidth: 120,
  padding: "6px 9px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f3f4f8",
  fontFamily: "inherit",
  fontSize: 12
}, Oo = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  color: "rgba(243,244,248,0.72)",
  fontSize: 12
}, zo = {
  padding: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10
}, Fo = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8
}, No = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, Uo = (e) => ({
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
}), Bo = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 12,
  fontWeight: 600
}, Go = {
  gridColumn: "1 / -1",
  padding: "10px 8px",
  color: "rgba(243,244,248,0.45)",
  fontSize: 12
};
function Vo(e) {
  return L(() => {
    switch (e) {
      case "long":
        return {
          geometry: new S.SphereGeometry(0.28, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
          position: [0, -0.05, 0],
          scale: [1.05, 1.55, 1.05]
        };
      case "cap":
        return {
          geometry: new S.CylinderGeometry(0.32, 0.34, 0.18, 16),
          position: [0, 0.1, 0],
          scale: [1, 1, 1]
        };
      case "bun":
        return {
          geometry: new S.SphereGeometry(0.22, 12, 10),
          position: [0, 0.18, -0.05],
          scale: [1, 1, 1]
        };
      case "spiky":
        return {
          geometry: new S.ConeGeometry(0.32, 0.36, 8),
          position: [0, 0.15, 0],
          scale: [1, 1, 1]
        };
      case "short":
      default:
        return {
          geometry: new S.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
          position: [0, 0.05, 0],
          scale: [1, 1, 1]
        };
    }
  }, [e]);
}
function Zi({
  headHeight: e = 1.55,
  enabled: n = !0,
  opacity: t = 1
} = {}) {
  const r = D(null), o = V((u) => u.appearance), s = V((u) => u.outfits), { position: i, rotation: a } = ie({ updateInterval: 16 }), l = Vo(o.hair);
  if (ne(() => {
    const u = r.current;
    u && (u.position.set(i.x, i.y + e, i.z), u.rotation.set(0, a.y, 0));
  }), !n) return null;
  const c = !!s.hat, f = S.MathUtils.clamp(t, 0, 1);
  return /* @__PURE__ */ m("group", { ref: r, dispose: null, children: [
    !c && /* @__PURE__ */ m("mesh", { position: l.position, scale: l.scale, castShadow: !0, children: [
      /* @__PURE__ */ d("primitive", { object: l.geometry, attach: "geometry" }),
      /* @__PURE__ */ d(
        "meshStandardMaterial",
        {
          color: o.colors.hair,
          roughness: 0.85,
          metalness: 0.05,
          transparent: f < 1,
          opacity: f
        }
      )
    ] }),
    c && /* @__PURE__ */ m("group", { position: [0, 0.1, 0], children: [
      /* @__PURE__ */ m("mesh", { castShadow: !0, children: [
        /* @__PURE__ */ d("cylinderGeometry", { args: [0.34, 0.34, 0.22, 18] }),
        /* @__PURE__ */ d(
          "meshStandardMaterial",
          {
            color: o.colors.hat,
            roughness: 0.7,
            metalness: 0.05,
            transparent: f < 1,
            opacity: f
          }
        )
      ] }),
      /* @__PURE__ */ m("mesh", { position: [0, -0.1, 0], children: [
        /* @__PURE__ */ d("cylinderGeometry", { args: [0.5, 0.5, 0.04, 24] }),
        /* @__PURE__ */ d(
          "meshStandardMaterial",
          {
            color: o.colors.hat,
            roughness: 0.7,
            metalness: 0.05,
            transparent: f < 1,
            opacity: f
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ d($o, { style: o.face, opacity: f })
  ] });
}
function $o({ style: e, opacity: n }) {
  const t = L(() => {
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
  return /* @__PURE__ */ m("group", { position: [0, -0.18, 0.32], children: [
    /* @__PURE__ */ m("mesh", { position: [-0.13, 0, 0], children: [
      /* @__PURE__ */ d("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ d("meshBasicMaterial", { color: t, transparent: !0, opacity: n * 0.6 })
    ] }),
    /* @__PURE__ */ m("mesh", { position: [0.13, 0, 0], children: [
      /* @__PURE__ */ d("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ d("meshBasicMaterial", { color: t, transparent: !0, opacity: n * 0.6 })
    ] })
  ] });
}
const Wo = (e) => e?.url ? e.kind === "characterPart" || e.kind === "weapon" : !1, jo = (e) => ({
  id: e.id,
  ...e.slot ? { slot: e.slot } : {},
  url: e.url,
  ...e.colors?.primary ? { color: e.colors.primary } : {}
});
function Ji({
  baseParts: e = [],
  outfits: n,
  assets: t
}) {
  const r = Object.values(n).map((i) => i ? t[i] : void 0).filter(Wo).map(jo);
  if (r.length === 0)
    return e.map((i) => ({ ...i }));
  const o = new Set(r.map((i) => i.slot).filter(Boolean)), s = e.filter((i) => !i.slot || !o.has(i.slot)).map((i) => ({ ...i }));
  for (const i of r)
    s.some((a) => a.url === i.url && a.slot === i.slot) || s.push(i);
  return s;
}
function ea({
  capacity: e = 64,
  step: n = 0.55,
  lifetime: t = 9,
  size: r = 0.34,
  y: o = 0.02,
  color: s = "#1a1612"
} = {}) {
  const i = D(null), { position: a, isMoving: l, isGrounded: c } = ie({ updateInterval: 32 }), f = L(() => new S.Color(s), [s]), u = L(
    () => Array.from({ length: e }, () => ({
      x: 0,
      z: 0,
      bornAt: -1 / 0,
      side: 1
    })),
    [e]
  ), p = D(null), h = D(0), b = D(1), w = L(() => {
    const I = new S.PlaneGeometry(1, 1);
    return I.rotateX(-Math.PI / 2), I;
  }, []), v = L(
    () => new S.MeshBasicMaterial({
      color: f,
      transparent: !0,
      opacity: 0.42,
      depthWrite: !1,
      polygonOffset: !0,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    }),
    [f]
  );
  k(() => () => {
    w.dispose(), v.dispose();
  }, [w, v]);
  const g = L(() => new S.Object3D(), []), x = L(() => new S.Color(), []);
  return ne((I) => {
    const E = i.current;
    if (!E) return;
    const C = I.clock.elapsedTime;
    if (c && l) {
      const y = p.current, T = a.x - (y?.x ?? a.x), z = a.z - (y?.z ?? a.z), _ = Math.hypot(T, z);
      if (!y || _ >= n) {
        const P = u[h.current];
        P && (P.x = a.x, P.z = a.z, P.bornAt = C, P.side = b.current, b.current = b.current === 1 ? -1 : 1, h.current = (h.current + 1) % e, p.current = { x: a.x, z: a.z });
      }
    }
    let A = 0;
    for (let y = 0; y < e; y++) {
      const T = u[y];
      if (!T) continue;
      const z = C - T.bornAt;
      if (z < 0 || z > t) continue;
      const _ = 1 - z / t;
      g.position.set(T.x + T.side * 0.07, o, T.z), g.rotation.set(0, 0, 0), g.scale.set(r, 1, r * 1.4), g.updateMatrix(), E.setMatrixAt(A, g.matrix), x.copy(f).multiplyScalar(0.6 + _ * 0.4), E.setColorAt(A, x), A++;
    }
    E.count = A, E.instanceMatrix.needsUpdate = !0, E.instanceColor && (E.instanceColor.needsUpdate = !0);
  }), /* @__PURE__ */ d(
    "instancedMesh",
    {
      ref: i,
      args: [w, v, e],
      frustumCulled: !1,
      renderOrder: 1
    }
  );
}
const ta = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
}, ye = "ko";
function qo() {
  if (typeof navigator > "u") return ye;
  const e = (navigator.language || ye).slice(0, 2).toLowerCase();
  return e === "ko" || e === "en" || e === "ja" ? e : ye;
}
function De(e, n) {
  return n ? e.replace(/\{(\w+)\}/g, (t, r) => {
    const o = n[r];
    return o == null ? `{${r}}` : String(o);
  }) : e;
}
const te = Y((e, n) => ({
  locale: qo(),
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
    if (i !== void 0) return De(i, r);
    const a = s[ye]?.[t];
    return De(a !== void 0 ? a : t, r);
  },
  serialize: () => ({ version: 1, locale: n().locale }),
  hydrate: (t) => {
    !t || t.version !== 1 || e({ locale: t.locale });
  }
}));
function na(e, n) {
  return te.getState().t(e, n);
}
const Ho = "gaesup.i18n", Xo = "i18n", Yo = "i18n.store";
function Ko() {
  return te.getState().serialize();
}
function Qo(e) {
  te.getState().hydrate(e);
}
function Zo(e = {}) {
  return q({
    id: e.id ?? Ho,
    name: "GaeSup i18n",
    saveExtensionId: e.saveExtensionId ?? Xo,
    storeServiceId: e.storeServiceId ?? Yo,
    store: te,
    readyEvent: "i18n:ready",
    capabilities: ["i18n"],
    serialize: Ko,
    hydrate: Qo
  });
}
const ra = Zo();
function oa() {
  const e = te((t) => t.locale), n = te((t) => t.bundle);
  return K(
    (t, r) => {
      const o = n[e]?.[t];
      if (o !== void 0) return Pe(o, r);
      const s = n.ko?.[t];
      return Pe(s !== void 0 ? s : t, r);
    },
    [e, n]
  );
}
function sa() {
  const e = te((t) => t.locale), n = te((t) => t.setLocale);
  return { locale: e, setLocale: n };
}
function Pe(e, n) {
  return n ? e.replace(/\{(\w+)\}/g, (t, r) => {
    const o = n[r];
    return o == null ? `{${r}}` : String(o);
  }) : e;
}
const Jo = [
  { id: "jump", label: "점프", key: " " },
  { id: "use", label: "사용", key: "F" }
];
function es() {
  return typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(pointer: coarse)").matches;
}
function ct(e, n) {
  if (typeof window > "u") return;
  const t = /^[a-zA-Z]$/.test(n) ? `Key${n.toUpperCase()}` : n === " " ? "Space" : n, r = new KeyboardEvent(e, {
    key: n === " " ? " " : n.toLowerCase(),
    code: t,
    bubbles: !0
  });
  window.dispatchEvent(r);
}
function ia({
  forceVisible: e = !1,
  radius: n = 60,
  deadzone: t = 0.18,
  runThreshold: r = 0.8,
  actions: o = Jo
} = {}) {
  const [s, i] = F(!1), a = dt(), l = D(null), c = D(null), f = D({
    pointerId: -1,
    cx: 0,
    cy: 0,
    forward: !1,
    backward: !1,
    leftward: !1,
    rightward: !1,
    run: !1
  });
  return k(() => {
    i(e || es());
  }, [e]), k(() => {
    if (!s) return;
    const u = l.current, p = c.current;
    if (!u || !p) return;
    const h = () => {
      const g = f.current, x = {};
      g.forward && (x.forward = !1), g.backward && (x.backward = !1), g.leftward && (x.leftward = !1), g.rightward && (x.rightward = !1), g.run && (x.shift = !1), g.forward = g.backward = g.leftward = g.rightward = g.run = !1, Object.keys(x).length > 0 && a.updateKeyboard(x), p.style.transform = "translate(-50%, -50%)", f.current.pointerId = -1;
    }, b = (g) => {
      g.preventDefault();
      const x = u.getBoundingClientRect();
      f.current.cx = x.left + x.width / 2, f.current.cy = x.top + x.height / 2, f.current.pointerId = g.pointerId, u.setPointerCapture(g.pointerId), w(g);
    }, w = (g) => {
      if (g.pointerId !== f.current.pointerId) return;
      const x = g.clientX - f.current.cx, I = g.clientY - f.current.cy, E = Math.hypot(x, I), C = Math.min(E, n), A = Math.atan2(I, x), y = Math.cos(A) * C, T = Math.sin(A) * C;
      p.style.transform = `translate(calc(-50% + ${y}px), calc(-50% + ${T}px))`;
      const z = C / n, _ = f.current, P = {};
      if (z < t)
        _.forward && (P.forward = !1, _.forward = !1), _.backward && (P.backward = !1, _.backward = !1), _.leftward && (P.leftward = !1, _.leftward = !1), _.rightward && (P.rightward = !1, _.rightward = !1), _.run && (P.shift = !1, _.run = !1);
      else {
        const ae = Math.cos(A), Ne = Math.sin(A), Se = Ne < -0.35, ve = Ne > 0.35, xe = ae < -0.35, Ie = ae > 0.35, we = z >= r;
        _.forward !== Se && (P.forward = Se, _.forward = Se), _.backward !== ve && (P.backward = ve, _.backward = ve), _.leftward !== xe && (P.leftward = xe, _.leftward = xe), _.rightward !== Ie && (P.rightward = Ie, _.rightward = Ie), _.run !== we && (P.shift = we, _.run = we);
      }
      Object.keys(P).length > 0 && a.updateKeyboard(P);
    }, v = (g) => {
      g.pointerId === f.current.pointerId && h();
    };
    return u.addEventListener("pointerdown", b), u.addEventListener("pointermove", w), u.addEventListener("pointerup", v), u.addEventListener("pointercancel", v), u.addEventListener("pointerleave", v), () => {
      u.removeEventListener("pointerdown", b), u.removeEventListener("pointermove", w), u.removeEventListener("pointerup", v), u.removeEventListener("pointercancel", v), u.removeEventListener("pointerleave", v), h();
    };
  }, [s, n, t, r, a]), s ? /* @__PURE__ */ m(
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
        /* @__PURE__ */ d(
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
            children: /* @__PURE__ */ d(
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
        /* @__PURE__ */ d(
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
            children: o.map((u) => /* @__PURE__ */ d(ts, { action: u }, u.id))
          }
        )
      ]
    }
  ) : null;
}
function ts({ action: e }) {
  const [n, t] = F(!1), r = () => {
    t(!0), e.key && ct("keydown", e.key), e.onPress?.();
  }, o = () => {
    t(!1), e.key && ct("keyup", e.key), e.onRelease?.();
  };
  return /* @__PURE__ */ d(
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
const he = "outdoor", Ae = (e) => new Promise((n) => setTimeout(n, e)), ns = 220, rs = 80, os = 240, X = Y((e, n) => ({
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
      const f = Math.min(1, (performance.now() - l) / ns);
      if (n().setTransition({ progress: f }), f >= 1) break;
      await Ae(16);
    }
    r?.saveReturn && e({ lastReturnPoint: r.saveReturn }), e({ current: t }), await Ae(rs);
    const c = performance.now();
    for (; ; ) {
      const f = Math.min(1, (performance.now() - c) / os);
      if (n().setTransition({ progress: 1 - f }), f >= 1) break;
      await Ae(16);
    }
    e({ pending: null, transition: { active: !1, color: a, progress: 0 } });
  },
  serialize: () => ({ version: 1, current: n().current }),
  hydrate: (t) => {
    !t || t.version !== 1 || n().scenes[t.current] && e({ current: t.current, pending: null });
  }
})), ss = "gaesup.scene", is = "scene", as = "scene.store";
function cs() {
  return X.getState().serialize();
}
function ls(e) {
  X.getState().hydrate(e);
}
function us(e = {}) {
  return q({
    id: e.id ?? ss,
    name: "GaeSup Scene",
    saveExtensionId: e.saveExtensionId ?? is,
    storeServiceId: e.storeServiceId ?? as,
    store: X,
    readyEvent: "scene:ready",
    capabilities: ["scene"],
    serialize: cs,
    hydrate: ls
  });
}
const aa = us();
function ds(e, n) {
  if (e === n) return !0;
  if (e.size !== n.size) return !1;
  for (const t of e)
    if (!n.has(t)) return !1;
  return !0;
}
const Q = Y((e) => ({
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
  setVisibleRooms: (n, t, r) => e((o) => o.initializedSceneId === n && o.currentRoomId === t && ds(o.visibleRoomIds, r) ? o : {
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
function ca({ zIndex: e = 9999 } = {}) {
  const n = X((t) => t.transition);
  return !n.active && n.progress <= 1e-3 ? null : /* @__PURE__ */ d(
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
function la({ scene: e, children: n }) {
  const t = X((s) => s.registerScene), r = X((s) => s.unregisterScene), o = X((s) => s.current);
  return k(() => (t(e), () => r(e.id)), [e, t, r]), o !== e.id ? null : /* @__PURE__ */ d(ee, { children: n });
}
function ua({
  position: e,
  sceneId: n,
  entry: t,
  exitOverride: r,
  radius: o = 1.4,
  cooldownMs: s = 800,
  color: i = "#5a8acf",
  label: a
}) {
  const l = X((w) => w.goTo), c = X((w) => w.current), { teleport: f } = St(), { position: u } = ie({ updateInterval: 50 }), p = D(0), h = L(() => new S.CylinderGeometry(o, o, 0.08, 28), [o]);
  k(() => () => h.dispose(), [h]), ne(() => {
    const w = performance.now();
    if (w - p.current < s) return;
    const v = u.x - e[0], g = u.z - e[2];
    v * v + g * g > o * o || (p.current = w, c !== n && b());
  });
  async function b() {
    const w = r ?? {
      position: [e[0], e[1], e[2]]
    };
    await l(n, { entry: t, saveReturn: w });
    const v = new S.Vector3(t.position[0], t.position[1], t.position[2]);
    f(v);
  }
  return /* @__PURE__ */ m("group", { position: e, children: [
    /* @__PURE__ */ d("mesh", { rotation: [0, 0, 0], geometry: h, children: /* @__PURE__ */ d(
      "meshStandardMaterial",
      {
        color: i,
        emissive: i,
        emissiveIntensity: 0.35,
        transparent: !0,
        opacity: 0.6
      }
    ) }),
    a && /* @__PURE__ */ m("mesh", { position: [0, 1.3, 0], children: [
      /* @__PURE__ */ d("boxGeometry", { args: [0.04, 0.6, 0.04] }),
      /* @__PURE__ */ d("meshStandardMaterial", { color: i, emissive: i, emissiveIntensity: 0.4 })
    ] })
  ] });
}
function da({ sceneId: e, roomId: n, bounds: t, children: r }) {
  const o = X((c) => c.current), s = Q((c) => c.registerRoom), i = Q((c) => c.unregisterRoom), a = Q((c) => c.initializedSceneId), l = Q((c) => c.visibleRoomIds);
  return k(() => (s({ id: n, sceneId: e, bounds: t }), () => i(n)), [n, e, t, s, i]), o !== e ? null : a !== e ? /* @__PURE__ */ d(ee, { children: r }) : l.has(n) ? /* @__PURE__ */ d(ee, { children: r }) : null;
}
function fa({
  id: e,
  sceneId: n,
  fromRoomId: t,
  toRoomId: r,
  position: o,
  radius: s,
  revealDistance: i
}) {
  const a = Q((c) => c.registerPortal), l = Q((c) => c.unregisterPortal);
  return k(() => (a({
    id: e,
    sceneId: n,
    fromRoomId: t,
    toRoomId: r,
    position: o,
    ...s !== void 0 ? { radius: s } : {},
    ...i !== void 0 ? { revealDistance: i } : {}
  }), () => l(e)), [e, n, t, r, o, s, i, a, l]), null;
}
const fs = 0.12;
function ps(e, n) {
  return e.x >= n.min[0] && e.x <= n.max[0] && e.y >= n.min[1] && e.y <= n.max[1] && e.z >= n.min[2] && e.z <= n.max[2];
}
function xt(e, n, t) {
  for (const r of n)
    if (r.sceneId === e && ps(t, r.bounds))
      return r.id;
  return null;
}
function ms(e) {
  const n = e.rooms.filter((s) => s.sceneId === e.sceneId);
  if (n.length === 0) return /* @__PURE__ */ new Set();
  const t = xt(e.sceneId, n, e.position);
  if (!t)
    return new Set(n.map((s) => s.id));
  const r = /* @__PURE__ */ new Set([t]), o = e.portals.filter((s) => s.sceneId === e.sceneId);
  for (const s of o) {
    const i = s.revealDistance ?? 3.8, a = e.position.x - s.position[0], l = e.position.y - s.position[1], c = e.position.z - s.position[2];
    a * a + l * l + c * c > i * i || (s.fromRoomId === t ? r.add(s.toRoomId) : s.toRoomId === t && r.add(s.fromRoomId));
  }
  return r;
}
function pa() {
  const e = X((a) => a.current), n = Q((a) => a.rooms), t = Q((a) => a.portals), r = Q((a) => a.setVisibleRooms), o = Q((a) => a.reset), { position: s } = ie({ updateInterval: 50 }), i = D(0);
  return k(() => o, [o]), ne((a, l) => {
    if (i.current += Math.max(0, l), i.current < fs) return;
    i.current = 0;
    const c = Array.from(n.values()), f = Array.from(t.values()), u = xt(e, c, s), p = ms({
      sceneId: e,
      rooms: c,
      portals: f,
      position: s
    });
    r(e, u, p);
  }), null;
}
const gs = new S.Color("#0a1430"), hs = new S.Color("#ffb377"), ys = new S.Color("#ff7a52"), bs = new S.Color("#5b6975"), Ss = new S.Color("#dde7f0"), vs = new S.Color("#3b4452");
function xs(e, n) {
  const t = e + n / 60;
  return t < 5 ? { t: 0, phase: "night" } : t < 7 ? { t: (t - 5) / 2, phase: "dawn" } : t < 17 ? { t: 1, phase: "day" } : t < 19 ? { t: 1 - (t - 17) / 2, phase: "dusk" } : { t: 0, phase: "night" };
}
function ma({
  color: e = "#cfd8e3",
  near: n = 35,
  far: t = 220,
  enabled: r = !0
} = {}) {
  const o = At((c) => c.scene), s = R((c) => c.time.hour), i = R((c) => c.time.minute), a = j((c) => c.current), l = D(void 0);
  return k(() => {
    if (l.current === void 0 && (l.current = o.fog instanceof S.Fog ? o.fog.clone() : null), !r) {
      o.fog = l.current ? l.current.clone() : null;
      return;
    }
    const c = new S.Color(e), f = xs(s, i), u = c.clone();
    f.phase === "night" ? u.lerp(gs, 0.25) : f.phase === "dawn" ? u.lerp(hs, 0.18 * (1 - f.t)) : f.phase === "dusk" && u.lerp(ys, 0.18 * (1 - f.t));
    let p = n, h = t;
    if (f.phase === "night" ? (p = n * 0.45, h = t * 0.55) : (f.phase === "dawn" || f.phase === "dusk") && (p = n * (0.55 + 0.45 * f.t), h = t * (0.7 + 0.3 * f.t)), a) {
      const b = Math.max(0, Math.min(1, a.intensity));
      a.kind === "rain" ? (u.lerp(bs, 0.12 + b * 0.1), p *= 0.7 - b * 0.2, h *= 0.65 - b * 0.2) : a.kind === "storm" ? (u.lerp(vs, 0.16 + b * 0.12), p *= 0.55 - b * 0.2, h *= 0.5 - b * 0.2) : a.kind === "snow" && (u.lerp(Ss, 0.12 + b * 0.08), p *= 0.75, h *= 0.7);
    }
    p = Math.max(2, p), h = Math.max(p + 5, h), o.fog instanceof S.Fog ? (o.fog.color.copy(u), o.fog.near = p, o.fog.far = h) : o.fog = new S.Fog(u.getHex(), p, h);
  }, [o, e, n, t, r, s, i, a?.kind, a?.intensity]), k(() => () => {
    o.fog = l.current ? l.current.clone() : null;
  }, [o]), null;
}
const Is = [
  { hour: 0, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: -Math.PI / 2, elevation: -0.3 },
  { hour: 5, sunColor: "#3b3a5a", ambientColor: "#28304a", sunIntensity: 0.15, ambientIntensity: 0.22, azimuth: -Math.PI / 3, elevation: -0.05 },
  { hour: 7, sunColor: "#ffb27a", ambientColor: "#7a8aa6", sunIntensity: 0.55, ambientIntensity: 0.3, azimuth: -Math.PI / 4, elevation: 0.25 },
  { hour: 10, sunColor: "#fff1c8", ambientColor: "#aab4c8", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: -Math.PI / 8, elevation: 0.7 },
  { hour: 13, sunColor: "#ffffff", ambientColor: "#b6c2d8", sunIntensity: 1.05, ambientIntensity: 0.38, azimuth: 0, elevation: 1.05 },
  { hour: 16, sunColor: "#ffe0a8", ambientColor: "#a8b4cc", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: Math.PI / 6, elevation: 0.65 },
  { hour: 18, sunColor: "#ff9a5a", ambientColor: "#806a8a", sunIntensity: 0.55, ambientIntensity: 0.28, azimuth: Math.PI / 3, elevation: 0.18 },
  { hour: 20, sunColor: "#5a3f6a", ambientColor: "#34304a", sunIntensity: 0.18, ambientIntensity: 0.22, azimuth: Math.PI / 2, elevation: -0.05 },
  { hour: 24, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: 3 * Math.PI / 4, elevation: -0.3 }
], lt = {
  spring: new S.Color("#fff0f5"),
  summer: new S.Color("#fff5d8"),
  autumn: new S.Color("#ffd9b0"),
  winter: new S.Color("#dfe8f5")
}, ut = {
  sunny: { sun: 1, ambient: 1, tint: new S.Color("#ffffff") },
  cloudy: { sun: 0.55, ambient: 0.95, tint: new S.Color("#cfd6e2") },
  rain: { sun: 0.3, ambient: 0.85, tint: new S.Color("#90a0b8") },
  snow: { sun: 0.65, ambient: 1.1, tint: new S.Color("#dfeaf5") },
  storm: { sun: 0.2, ambient: 0.75, tint: new S.Color("#5a6a82") }
};
function ws(e, n) {
  const t = e, r = (n % 24 + 24) % 24;
  let o = t[0], s = t[t.length - 1];
  for (let l = 0; l < t.length - 1; l += 1) {
    const c = t[l], f = t[l + 1];
    if (r >= c.hour && r <= f.hour) {
      o = c, s = f;
      break;
    }
  }
  const i = Math.max(1e-4, s.hour - o.hour), a = S.MathUtils.clamp((r - o.hour) / i, 0, 1);
  return {
    hour: r,
    sunColor: o.sunColor,
    ambientColor: o.ambientColor,
    sunIntensity: S.MathUtils.lerp(o.sunIntensity, s.sunIntensity, a),
    ambientIntensity: S.MathUtils.lerp(o.ambientIntensity, s.ambientIntensity, a),
    azimuth: S.MathUtils.lerp(o.azimuth, s.azimuth, a),
    elevation: S.MathUtils.lerp(o.elevation, s.elevation, a)
    // Mix colors via THREE.Color outside this scope to avoid string allocations.
  };
}
function ga({
  rigDistance: e = 60,
  castShadow: n = !0,
  shadowMapSize: t = 1024,
  keyframes: r,
  damping: o = 0.12
} = {}) {
  const s = D(null), i = D(null), a = L(() => (r ?? Is).slice().sort((h, b) => h.hour - b.hour), [r]), l = L(() => new S.Color(), []), c = L(() => new S.Color(), []), f = L(() => new S.Color(), []), u = L(() => new S.Color(), []);
  return ne(() => {
    const p = s.current, h = i.current;
    if (!p || !h) return;
    const b = R.getState().time, w = j.getState().current, v = w?.kind ?? "sunny", g = S.MathUtils.clamp(w?.intensity ?? 0.5, 0, 1), x = ut[v] ?? ut.sunny, I = lt[b.season] ?? lt.spring, E = ws(a, b.hour + b.minute / 60);
    f.set(E.sunColor).lerp(I, 0.18).lerp(x.tint, 0.35 + 0.25 * g), u.set(E.ambientColor).lerp(I, 0.2).lerp(x.tint, 0.3 + 0.3 * g);
    const C = S.MathUtils.clamp(o, 0.01, 1);
    l.copy(p.color).lerp(f, C), c.copy(h.color).lerp(u, C), p.color.copy(l), h.color.copy(c);
    const A = S.MathUtils.lerp(1, x.sun, 0.5 + 0.5 * g), y = S.MathUtils.lerp(1, x.ambient, 0.5 + 0.5 * g);
    p.intensity = S.MathUtils.lerp(p.intensity, E.sunIntensity * A, C), h.intensity = S.MathUtils.lerp(h.intensity, E.ambientIntensity * y, C);
    const T = Math.cos(E.elevation), z = Math.sin(E.elevation), _ = Math.cos(E.azimuth) * T * e, P = Math.sin(E.azimuth) * T * e, ae = Math.max(2, z * e);
    p.position.set(_, ae, P), p.target.position.set(0, 0, 0), p.target.updateMatrixWorld();
  }), /* @__PURE__ */ m(ee, { children: [
    /* @__PURE__ */ d("ambientLight", { ref: i, intensity: 0.3, color: "#b6c2d8" }),
    /* @__PURE__ */ d(
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
  uc as AnimationPanel,
  Lt as AssetPreviewCanvas,
  Xi as AudioControls,
  Fa as BugSpot,
  dc as BuildingController,
  fc as BuildingPanel,
  pc as BuildingSystem,
  mc as BuildingUI,
  Ze as CATALOG_CATEGORIES,
  Kl as CONTENT_SCHEMA_VERSION,
  ba as Camera,
  gc as CameraPanel,
  hc as CameraPresets,
  Ai as CatalogUI,
  Qi as CharacterCreator,
  ul as Clicker,
  Oi as CraftingUI,
  Fi as CropPlot,
  Ql as DAILY_FRIENDSHIP_CAP,
  yc as DEFAULT_BUILDING_GRID_EXTENSION_ID,
  bc as DEFAULT_BUILDING_PLACEMENT_EXTENSION_ID,
  Sc as DEFAULT_BUILDING_SAVE_EXTENSION_ID,
  vc as DEFAULT_BUILDING_STORE_SERVICE_ID,
  _n as DEFAULT_CAMERA_SAVE_EXTENSION_ID,
  Tn as DEFAULT_CAMERA_STORE_SERVICE_ID,
  Cn as DEFAULT_CAMERA_SYSTEM_EXTENSION_ID,
  ml as DEFAULT_INTERACTION_INPUT_EXTENSION_ID,
  va as DEFAULT_MOTIONS_INPUT_EXTENSION_ID,
  xa as DEFAULT_MOTIONS_PHYSICS_EXTENSION_ID,
  Ia as DEFAULT_MOTIONS_RUNTIME_SERVICE_ID,
  Na as DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID,
  du as DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID,
  Ua as DEFAULT_WORLD_SAVE_ENVIRONMENT,
  Ws as DialogBox,
  Zl as DialogRunner,
  Ja as DuplicateExtensionError,
  ec as DuplicatePluginError,
  ma as DynamicFog,
  ga as DynamicSky,
  xc as EDITOR_PANEL_COMPONENT_KIND,
  Ic as Editor,
  wc as EditorLayout,
  Hs as EventsHUD,
  Jl as FRIENDSHIP_LEVELS,
  Ba as FishSpot,
  zn as FocusableObject,
  ea as Footprints,
  Yi as Footsteps,
  kl as GaeSupProps,
  dl as GaesupController,
  wa as GaesupRuntimeProvider,
  ol as GaesupWorld,
  sl as GaesupWorldContent,
  fi as Gamepad,
  Ec as GameplayEventPanel,
  kc as GridHelper,
  fl as GroundClicker,
  Js as HotbarUI,
  ua as HouseDoor,
  Wi as HousePlot,
  lu as HttpAssetSource,
  eu as HttpContentBundleSource,
  tc as InMemoryExtensionRegistry,
  Cl as IndexedDBAdapter,
  pi as Interactable,
  mi as InteractionPrompt,
  $s as InteractionTracker,
  ei as InventoryUI,
  ta as LOCALE_LABEL,
  _l as LocalStorageAdapter,
  Ea as MOTIONS_TELEPORT_EVENT,
  Ri as MailboxUI,
  oi as MiniMap,
  si as MinimapPlatform,
  nc as MissingExtensionError,
  rc as MissingPluginDependencyError,
  Ct as MotionController,
  Cc as MotionPanel,
  gi as MotionUI,
  _c as NPCInstance,
  Tc as NPCSystem,
  Zi as OutfitAvatar,
  Mc as PerformancePanel,
  oc as PluginManifestValidationError,
  sc as PluginRegistry,
  Ll as PluginValidationAssertionError,
  ic as PluginVersionMismatchError,
  ni as QuestLogUI,
  Ga as RUNTIME_SAVE_DIAGNOSTIC_EVENT,
  Rc as ResizablePanel,
  fa as RoomPortal,
  da as RoomRoot,
  pa as RoomVisibilityDriver,
  ai as RuntimeSaveDiagnosticsToaster,
  au as SEED_ASSETS,
  qn as SEED_ITEMS,
  Tl as SaveSystem,
  ca as SceneFader,
  la as SceneRoot,
  Ci as ShopUI,
  Il as SpeechBalloon,
  Dc as StudioPanel,
  hi as Teleport,
  Pc as TileSystem,
  Ii as TimeHUD,
  ii as ToastHost,
  _i as ToolUseController,
  ia as TouchControls,
  ji as TownHUD,
  Va as TreeObject,
  gl as V3,
  hl as V30,
  yl as V31,
  Ac as VehiclePanel,
  Lc as WallSystem,
  ki as WalletHUD,
  Oc as WeatherEffect,
  Bi as WeatherHUD,
  il as World,
  al as WorldConfigProvider,
  cl as WorldContainer,
  ka as applyToonToScene,
  Ol as assertValidGaesupPlugin,
  qi as audioPlugin,
  zc as autoDetectProfile,
  Fc as buildingPlugin,
  ui as cameraPlugin,
  Di as catalogPlugin,
  Ki as characterPlugin,
  Nc as classifyTier,
  Uc as compileNPCBrainBlueprint,
  Li as craftingPlugin,
  mo as createAudioPlugin,
  Bc as createBuildingPlugin,
  An as createCameraPlugin,
  $a as createCameraSaveDataFromDomain,
  Tr as createCatalogPlugin,
  _o as createCharacterPlugin,
  Vl as createCommandAcceptedResult,
  $l as createCommandAuthorityRouter,
  Wl as createCommandRejectedResult,
  tu as createContentBundleFromSaveSystem,
  zl as createCozyLifeSamplePlugin,
  zr as createCraftingPlugin,
  Ml as createDefaultSaveSystem,
  sr as createEconomyPlugin,
  Gc as createEditorCommandStack,
  Vc as createEditorShell,
  $c as createEditorSlice,
  Vt as createEventsPlugin,
  jr as createFarmingPlugin,
  Wa as createGaesupRuntime,
  jl as createGameCommand,
  Fl as createHighGraphicsSamplePlugin,
  Zo as createI18nPlugin,
  bl as createInteractionInputAdapter,
  Sl as createInteractionSystemInputBackend,
  Yt as createInventoryPlugin,
  vr as createMailPlugin,
  vl as createMemoryInputBackend,
  Ca as createMotionsPlugin,
  _a as createMotionsRuntime,
  Wc as createNPCObservation,
  En as createNPCPlugin,
  ac as createPluginRegistry,
  nn as createQuestsPlugin,
  dr as createRelationsPlugin,
  ja as createRuntimeSaveDiagnostics,
  qa as createSaveDataFromSaveSystem,
  us as createScenePlugin,
  ql as createServerEvent,
  fu as createServerPluginHost,
  Nl as createShooterKitSamplePlugin,
  Hl as createSnapshotAck,
  Xl as createStateDelta,
  Vn as createTimePlugin,
  Ta as createToonMaterial,
  so as createTownPlugin,
  Zr as createWeatherPlugin,
  Ha as createWorldDataFromSaveDomains,
  Ul as defineGaesupPlugin,
  jc as detectCapabilities,
  Ma as disposeToonGradients,
  Ei as economyPlugin,
  qc as editorSlice,
  js as eventsPlugin,
  zi as farmingPlugin,
  Xa as formatRuntimeSaveDiagnostic,
  mn as formatRuntimeSaveDiagnosticToastMessage,
  ce as getAudioEngine,
  se as getCropRegistry,
  Ra as getDefaultToonMode,
  nu as getDialogRegistry,
  mt as getEventRegistry,
  G as getItemRegistry,
  Xe as getNPCScheduler,
  gt as getQuestRegistry,
  fe as getRecipeRegistry,
  Rl as getSaveSystem,
  kt as getToolEvents,
  Da as getToonGradient,
  po as hydrateAudioState,
  _r as hydrateCatalogState,
  Co as hydrateCharacterState,
  Or as hydrateCraftingState,
  Gt as hydrateEventsState,
  Wr as hydrateFarmingState,
  Qo as hydrateI18nState,
  Xt as hydrateInventoryState,
  Sr as hydrateMailState,
  wn as hydrateNPCState,
  tn as hydrateQuestsState,
  ur as hydrateRelationsState,
  ls as hydrateSceneState,
  or as hydrateShopState,
  Gn as hydrateTimeState,
  oo as hydrateTownState,
  nr as hydrateWalletState,
  Qr as hydrateWeatherState,
  ra as i18nPlugin,
  Ys as inventoryPlugin,
  Hc as isEditorPanelComponentExtension,
  Pl as isEventActive,
  ru as loadContentBundleFromManifest,
  Mi as mailPlugin,
  Pa as motionsPlugin,
  O as notify,
  ci as npcPlugin,
  Xc as profileForTier,
  ti as questsPlugin,
  Yc as registerNPCBrainAdapter,
  Kc as registerNPCBrainBlueprint,
  Ni as registerSeedCrops,
  Xs as registerSeedEvents,
  wi as registerSeedItems,
  Ti as relationsPlugin,
  Aa as requestMotionsTeleport,
  Ji as resolveCharacterParts,
  Qc as resolveEditorPanelComponentExtensions,
  Zc as resolveNPCBrainDecision,
  La as resolveRuntimeInputBackend,
  yn as resolveSchedule,
  aa as scenePlugin,
  fo as serializeAudioState,
  Cr as serializeCatalogState,
  ko as serializeCharacterState,
  Lr as serializeCraftingState,
  Bt as serializeEventsState,
  $r as serializeFarmingState,
  Ko as serializeI18nState,
  Ht as serializeInventoryState,
  br as serializeMailState,
  In as serializeNPCState,
  en as serializeQuestsState,
  lr as serializeRelationsState,
  cs as serializeSceneState,
  rr as serializeShopState,
  Bn as serializeTimeState,
  ro as serializeTownState,
  tr as serializeWalletState,
  Kr as serializeWeatherState,
  Oa as setDefaultToonMode,
  cc as shouldSetupPluginForRuntime,
  na as t,
  yi as timePlugin,
  Vi as townPlugin,
  Hi as useAmbientBgm,
  Ge as useAssetStore,
  N as useAudioStore,
  Ya as useAutoSave,
  Jc as useBuildingEditor,
  be as useBuildingStore,
  ge as useCatalogStore,
  Pi as useCatalogTracker,
  V as useCharacterStore,
  le as useCraftingStore,
  ht as useCurrentInteraction,
  vi as useDayChange,
  $i as useDecorationScore,
  ue as useDialogStore,
  el as useEditor,
  tl as useEditorStore,
  Qs as useEquippedItem,
  Ka as useEquippedToolKind,
  me as useEventsStore,
  qs as useEventsTicker,
  Fe as useFriendshipStore,
  di as useGaesupController,
  It as useGaesupRuntime,
  wt as useGaesupRuntimeRevision,
  $ as useGaesupStore,
  Si as useGameClock,
  $n as useGameTime,
  Kt as useHotbar,
  Zs as useHotbarKeyboard,
  xi as useHourChange,
  te as useI18nStore,
  dt as useInputBackend,
  oe as useInteractablesStore,
  Ot as useInteractionKey,
  Ks as useInventory,
  M as useInventoryStore,
  Qa as useLoadOnMount,
  sa as useLocale,
  re as useMailStore,
  pe as useNPCStore,
  li as useNpcSchedule,
  nl as usePerfStore,
  ie as usePlayerPosition,
  U as usePlotStore,
  ri as useQuestObjectiveTracker,
  Z as useQuestStore,
  Q as useRoomVisibilityStore,
  X as useSceneStore,
  J as useShopStore,
  ze as useStateSystem,
  St as useTeleport,
  bi as useTimeOfDay,
  R as useTimeStore,
  Be as useToastStore,
  Ee as useToolUse,
  H as useTownStore,
  oa as useTranslate,
  wl as useUIConfigStore,
  W as useWalletStore,
  j as useWeatherStore,
  Gi as useWeatherTicker,
  ou as validateContentBundle,
  su as validateContentBundleManifest,
  Bl as validateGaesupPlugin,
  Ui as weatherPlugin
};
