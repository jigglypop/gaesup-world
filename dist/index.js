import "reflect-metadata";
import { B as To, F as Do, W as Fo, b as _o, u as Go } from "./useSpawnFromBlueprint-BwL6IElE.js";
import { i as No, a as Uo, g as qo, B as jo, h as $o, b as Vo, C as Ho, G as Yo, r as Ko, e as Xo, u as Qo, f as Zo, c as Jo, d as es } from "./registerComponents-sElgckkI.js";
import { C as ns } from "./index-DFq_WOIP.js";
import { ap as pt, aq as mt, ar as N, as as gt, at as ht, au as yt } from "./GrassDriver-CK1RZSWp.js";
import { av as os, A as ss, B as is, s as as, r as ls, I as cs, aw as ds, C as us, ax as fs, E as ps, a as ms, q as gs, G as hs, n as ys, o as bs, H as xs, M as ws, ay as vs, P as Ss, R as ks, g as Cs, h as Is, i as Ms, j as Rs, m as Ps, k as Es, l as As, S as Bs, T as Ls, V as Os, W as zs, O as Ts, aC as Ds, K as Fs, aE as _s, J as Gs, c as Ws, b as Ns, f as Us, aB as qs, e as js, p as $s, aD as Vs, ao as Hs, u as Ys, d as Ks, az as Xs, aA as Qs } from "./GrassDriver-CK1RZSWp.js";
import { W as Js, G as ei, W as ti, W as ni } from "./index-Dm7hUs0Q.js";
import { u as nt, b as ee } from "./index-DufLdZvx.js";
import { a as oi, C as si, G as ii } from "./index-DufLdZvx.js";
import { jsxs as m, jsx as u, Fragment as $ } from "react/jsx-runtime";
import { useEffect as I, useState as F, useRef as B, useCallback as q, forwardRef as bt, useId as xt, useMemo as z } from "react";
import { K as Be, G as fe, T as wt } from "./PhysicsEntity-DbL--tKl.js";
import { $ as li, a2 as ci, a3 as di, a4 as ui, a0 as fi, _ as pi, a5 as mi, a1 as gi, U as hi, Z as yi, Y as bi, W as xi, a6 as wi, a7 as vi, X as Si } from "./PhysicsEntity-DbL--tKl.js";
import { u as Y, I as vt } from "./gaesupStore-RSVP02fq.js";
import { V as Ci, c as Ii, d as Mi } from "./gaesupStore-RSVP02fq.js";
import { C as Pi, M as Ei, h as Ai, R as Bi, S as Li, i as Oi, f as zi, b as Ti, u as Di, d as Fi, c as _i, a as Gi, e as Wi, j as Ni } from "./defaultConfig-B7QicBoI.js";
import { M as rt } from "./index-DZbjGmSx.js";
import { W as qi, I as ji, L as $i, S as Vi, c as Hi, g as Yi } from "./index-DZbjGmSx.js";
import * as x from "three";
import { useShallow as St } from "zustand/react/shallow";
import { u as O } from "./timeStore-BRw0mdde.js";
import { i as kt, j as be } from "./index-wJIJ4tLC.js";
import { B as Xi, C as Qi, D as Zi, e as Ji, F as ea, b as ta, I as na, M as ra, f as oa, P as sa, T as ia, c as aa, g as la, h as ca, d as da, u as ua, k as fa, a as pa } from "./index-wJIJ4tLC.js";
import { a as ot, b as st, u as E, g as _, c as Oe, n as D } from "./eventsStore-DqmXNVEb.js";
import { i as ga } from "./eventsStore-DqmXNVEb.js";
import { create as W } from "zustand";
import { useFrame as V, useThree as Ct } from "@react-three/fiber";
import { u as oe, d as re, e as it, f as X } from "./seedEvents-CLwEL1X0.js";
import { j as ya, D as ba, F as xa, G as wa, a as va, H as Sa, S as ka, c as Ca, b as Ia, h as Ma, g as Ra, l as Pa, i as Ea, v as Aa } from "./seedEvents-CLwEL1X0.js";
import { u as Q } from "./weatherStore-CzG5N441.js";
import { u as ze } from "./assetStore-BYmV1yz0.js";
import { S as La, s as Oa, a as za } from "./assetStore-BYmV1yz0.js";
import { A as It } from "./index-C-ViQFGa.js";
import { a as Da, b as Fa, c as _a } from "./index-C-ViQFGa.js";
import { H as Wa } from "./api-BRV101Zn.js";
import { M as Ua, c as qa } from "./types-Ck0ueY4N.js";
import { R as $a, c as Va, r as Ha } from "./rbac-Bjx9pTbU.js";
import { P as Ka, W as Xa, c as Qa, a as Za, p as Ja } from "./snapshot-CXe2CZiu.js";
class Sr {
  id;
  precision;
  constructor(n = {}) {
    this.id = n.id ?? "free", this.precision = n.precision ?? 1e3;
  }
  toWorld(n) {
    return { ...n.position };
  }
  fromWorld(n) {
    return { position: { ...n } };
  }
  getNeighbors(n) {
    return [n];
  }
  equals(n, e) {
    return this.key(n) === this.key(e);
  }
  key(n) {
    const e = n.position;
    return [
      this.quantize(e.x),
      this.quantize(e.y),
      this.quantize(e.z)
    ].join(":");
  }
  quantize(n) {
    return Math.round(n * this.precision) / this.precision;
  }
}
function kr({ advanceKey: t = "e", closeKey: n = "Escape" }) {
  const e = oe((d) => d.node), r = oe((d) => d.runner), o = oe((d) => d.advance), s = oe((d) => d.choose), i = oe((d) => d.close), a = r?.visibleChoices() ?? [];
  return I(() => {
    if (!e) return;
    const d = (l) => {
      if (l.key === n) {
        i();
        return;
      }
      if (a.length === 0 && l.key.toLowerCase() === t.toLowerCase()) {
        o();
        return;
      }
      const c = parseInt(l.key, 10);
      !Number.isNaN(c) && c >= 1 && c <= a.length && s(c - 1);
    };
    return window.addEventListener("keydown", d), () => window.removeEventListener("keydown", d);
  }, [e, a.length, o, s, i, t, n]), e ? /* @__PURE__ */ m(
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
        e.speaker && /* @__PURE__ */ u("div", { style: {
          display: "inline-block",
          padding: "3px 8px",
          background: "#ffd84a",
          color: "#1a1a1a",
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 12,
          marginBottom: 6
        }, children: e.speaker }),
        /* @__PURE__ */ u("div", { style: { lineHeight: 1.55, whiteSpace: "pre-wrap" }, children: e.text }),
        a.length === 0 ? /* @__PURE__ */ m("div", { style: { marginTop: 10, fontSize: 12, opacity: 0.65, textAlign: "right" }, children: [
          "[",
          t.toUpperCase(),
          "] 다음"
        ] }) : /* @__PURE__ */ u("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }, children: a.map((d, l) => /* @__PURE__ */ m(
          "button",
          {
            onClick: () => s(l),
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
                l + 1,
                "."
              ] }),
              d.text
            ]
          },
          l
        )) })
      ]
    }
  ) : null;
}
function Cr(t = !0, n = {}) {
  I(() => {
    if (!t) return;
    const e = () => {
      const o = O.getState().time, { started: s, ended: i } = ot.getState().refresh(o);
      s.length && n.onStarted && n.onStarted(s), i.length && n.onEnded && n.onEnded(i);
    };
    return e(), O.subscribe((o, s) => {
      (o.time.day !== s.time.day || o.time.month !== s.time.month || o.time.season !== s.time.season || o.time.weekday !== s.time.weekday) && e();
    });
  }, [t, n.onStarted, n.onEnded]);
}
function Ir({ position: t = "top-left", excludeIds: n = [] }) {
  const e = ot((i) => i.active), r = st(), o = e.filter((i) => !n.includes(i));
  return o.length === 0 ? null : /* @__PURE__ */ u(
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
        ...t === "top-right" ? { top: 88, right: 12 } : { top: 88, left: 12 }
      },
      children: o.map((i) => {
        const a = r.get(i);
        if (!a) return null;
        const d = a.tags?.some((l) => l === "festival" || l === "tourney");
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
              boxShadow: `inset 0 0 0 1px ${d ? "#ffd84a55" : "#7adf9055"}`,
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            },
            children: [
              /* @__PURE__ */ u("span", { style: {
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: d ? "#ffd84a" : "#7adf90"
              } }),
              /* @__PURE__ */ u("span", { children: a.name })
            ]
          },
          i
        );
      })
    }
  );
}
const Mt = [
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
let Te = !1;
function Mr() {
  Te || (Te = !0, st().registerAll(Mt));
}
function Rr() {
  return E((t) => ({
    slots: t.slots,
    add: t.add,
    remove: t.remove,
    removeById: t.removeById,
    move: t.move,
    countOf: t.countOf,
    has: t.has
  }));
}
function Pr() {
  return E((t) => {
    const n = t.hotbar[t.equippedHotbar];
    return n == null ? null : t.slots[n] ?? null;
  });
}
function Rt() {
  const t = E((o) => o.hotbar), n = E((o) => o.slots), e = E((o) => o.equippedHotbar), r = E((o) => o.setEquippedHotbar);
  return {
    hotbar: t,
    slots: t.map((o) => n[o] ?? null),
    equipped: e,
    setEquipped: r
  };
}
function Er(t = !0) {
  const n = E((o) => o.setEquippedHotbar), e = E((o) => o.equippedHotbar), r = E((o) => o.hotbar);
  I(() => {
    if (!t) return;
    const o = (s) => {
      const i = s.target?.tagName?.toLowerCase();
      if (i === "input" || i === "textarea") return;
      const a = Number(s.key);
      if (Number.isInteger(a) && a >= 1 && a <= r.length) {
        n(a - 1);
        return;
      }
      (s.key === "q" || s.key === "Q") && n(e - 1), (s.key === "e" || s.key === "E") && n(e + 1);
    };
    return window.addEventListener("keydown", o), () => window.removeEventListener("keydown", o);
  }, [t, n, e, r.length]);
}
function Ar() {
  const { slots: t, equipped: n, setEquipped: e } = Rt(), r = _();
  return /* @__PURE__ */ u(
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
      children: t.map((o, s) => {
        const i = o ? r.get(o.itemId) : void 0, a = s === n;
        return /* @__PURE__ */ m(
          "button",
          {
            onClick: () => e(s),
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
              /* @__PURE__ */ u(
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
              o && i ? /* @__PURE__ */ m($, { children: [
                /* @__PURE__ */ u(
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
                i.stackable && o.count > 1 && /* @__PURE__ */ u(
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
function Br({ toggleKey: t = "i", initiallyOpen: n = !1 }) {
  const [e, r] = F(n), o = E((l) => l.slots), s = E((l) => l.move), i = _(), [a, d] = F(null);
  return I(() => {
    const l = (c) => {
      const f = c.target?.tagName?.toLowerCase();
      f === "input" || f === "textarea" || c.key.toLowerCase() === t.toLowerCase() && r((p) => !p);
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [t]), e ? /* @__PURE__ */ u(
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
          onClick: (l) => l.stopPropagation(),
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
              /* @__PURE__ */ u("div", { style: { fontSize: 14, opacity: 0.9 }, children: "Inventory" }),
              /* @__PURE__ */ u(
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
            /* @__PURE__ */ u(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 64px)",
                  gap: 6
                },
                children: o.map((l, c) => {
                  const f = l ? i.get(l.itemId) : void 0;
                  return /* @__PURE__ */ u(
                    "div",
                    {
                      draggable: !!l,
                      onDragStart: () => d(c),
                      onDragOver: (p) => {
                        p.preventDefault();
                      },
                      onDrop: () => {
                        a !== null && a !== c && s(a, c), d(null);
                      },
                      title: f?.name ?? "",
                      style: {
                        width: 64,
                        height: 64,
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(0,0,0,0.5)",
                        position: "relative",
                        cursor: l ? "grab" : "default",
                        fontSize: 11
                      },
                      children: l && f ? /* @__PURE__ */ m($, { children: [
                        /* @__PURE__ */ u(
                          "div",
                          {
                            style: {
                              position: "absolute",
                              inset: 8,
                              borderRadius: 6,
                              background: f.color ?? "#888",
                              boxShadow: "inset 0 0 8px rgba(0,0,0,0.4)"
                            }
                          }
                        ),
                        f.stackable && l.count > 1 && /* @__PURE__ */ u(
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
                            children: l.count
                          }
                        )
                      ] }) : null
                    },
                    c
                  );
                })
              }
            ),
            /* @__PURE__ */ u("div", { style: { marginTop: 12, opacity: 0.6, fontSize: 11 }, children: `[${t.toUpperCase()}] 닫기 / 드래그로 이동` })
          ]
        }
      )
    }
  ) : null;
}
function Lr({ toggleKey: t = "j" }) {
  const [n, e] = F(!1), r = re((l) => l.state), o = re((l) => l.complete), s = re((l) => l.isObjectiveComplete), i = re((l) => l.isAllObjectivesComplete);
  if (I(() => {
    const l = (c) => {
      const f = c.target?.tagName?.toLowerCase();
      f === "input" || f === "textarea" || (c.key.toLowerCase() === t.toLowerCase() && e((p) => !p), c.key === "Escape" && e(!1));
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [t]), !n) return null;
  const a = Object.values(r).filter((l) => l.status === "active"), d = Object.values(r).filter((l) => l.status === "completed");
  return /* @__PURE__ */ u(
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
      onClick: () => e(!1),
      children: /* @__PURE__ */ m(
        "div",
        {
          onClick: (l) => l.stopPropagation(),
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
                  /* @__PURE__ */ u("strong", { style: { fontSize: 15 }, children: "Quest Log" }),
                  /* @__PURE__ */ m("button", { onClick: () => e(!1), style: at(), children: [
                    "Close [",
                    t.toUpperCase(),
                    "]"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ m("div", { style: { overflowY: "auto", padding: 10 }, children: [
              /* @__PURE__ */ u(De, { title: `Active (${a.length})`, children: a.length === 0 ? /* @__PURE__ */ u(Pt, { children: "No active quests." }) : a.map((l) => /* @__PURE__ */ u(
                Fe,
                {
                  progress: l,
                  renderObjective: (c) => s(
                    it().require(l.questId),
                    l,
                    c
                  ),
                  ...i(l.questId) ? {
                    onComplete: () => {
                      o(l.questId);
                    }
                  } : {}
                },
                l.questId
              )) }),
              d.length > 0 && /* @__PURE__ */ u(De, { title: `Completed (${d.length})`, children: d.map((l) => /* @__PURE__ */ u(Fe, { progress: l, renderObjective: () => !0, muted: !0 }, l.questId)) })
            ] })
          ]
        }
      )
    }
  );
}
function De({ title: t, children: n }) {
  return /* @__PURE__ */ m("div", { style: { marginBottom: 10 }, children: [
    /* @__PURE__ */ u("div", { style: { padding: "6px 6px 4px", color: "#7aa6ff", fontSize: 12 }, children: t }),
    n
  ] });
}
function Pt({ children: t }) {
  return /* @__PURE__ */ u("div", { style: { padding: "8px 10px", opacity: 0.6 }, children: t });
}
function Fe({
  progress: t,
  renderObjective: n,
  onComplete: e,
  muted: r
}) {
  const o = it().get(t.questId);
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
              /* @__PURE__ */ u("strong", { children: o.name }),
              e && /* @__PURE__ */ u("button", { onClick: e, style: at(!0), children: "Report Complete" })
            ]
          }
        ),
        /* @__PURE__ */ u("div", { style: { opacity: 0.75, marginBottom: 6 }, children: o.summary }),
        /* @__PURE__ */ u("ul", { style: { margin: 0, padding: "0 0 0 16px" }, children: o.objectives.map((s) => {
          const i = n(s), a = t.progress[s.id] ?? 0, d = s.type === "collect" || s.type === "deliver" ? s.count : 1, l = s.type === "collect" ? Math.min(E.getState().countOf(s.itemId), d) : a, c = s.type === "collect" || s.type === "deliver" ? _().get(s.itemId)?.name ?? s.itemId : "";
          return /* @__PURE__ */ m(
            "li",
            {
              style: { color: i ? "#7adf90" : "#ddd", listStyle: "square" },
              children: [
                s.description ?? Et(s, c),
                " ",
                d > 1 ? `(${l}/${d})` : ""
              ]
            },
            s.id
          );
        }) }),
        /* @__PURE__ */ m("div", { style: { marginTop: 6, fontSize: 11, color: "#ffd84a" }, children: [
          "Rewards: ",
          o.rewards.map((s) => At(s)).join(", ")
        ] })
      ]
    }
  ) : null;
}
function Et(t, n) {
  switch (t.type) {
    case "collect":
      return `Collect ${n ?? t.itemId}`;
    case "deliver":
      return `Deliver ${n ?? t.itemId} to ${t.npcId}`;
    case "talk":
      return `Talk to ${t.npcId}`;
    case "visit":
      return `Visit ${t.tag}`;
    case "flag":
      return "Meet the required condition";
    default:
      return "";
  }
}
function At(t) {
  switch (t.type) {
    case "item":
      return `${t.itemId} x${t.count ?? 1}`;
    case "bells":
      return `${t.amount} B`;
    case "friendship":
      return `Friendship +${t.amount}`;
    default:
      return "";
  }
}
function at(t) {
  return {
    padding: "4px 10px",
    background: t ? "#7aa6ff" : "#444",
    color: t ? "#0d1424" : "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: t ? 700 : 400
  };
}
function Or(t = !0) {
  I(() => t ? E.subscribe((e, r) => {
    if (e.slots === r.slots) return;
    const o = re.getState().active();
    for (const s of o) re.getState().recheck(s.questId);
  }) : void 0, [t]);
}
const Bt = 5, Lt = 0.5, Ot = 20, zt = 200, Tt = (t) => {
  const { activeState: n } = Be(), e = fe((h) => h.tileGroups), r = B(/* @__PURE__ */ new Map()), o = B(rt.getInstance()), {
    scale: s = Bt,
    blockRotate: i = !1,
    updateInterval: a = 33
  } = t, d = B(null), [l, c] = F(s), f = !!(n.position && t);
  I(() => {
    const h = d.current;
    return h && o.current.setCanvas(h), () => {
      o.current.setCanvas(null);
    };
  }, []);
  const p = q(() => {
    t.blockScale || c((h) => Math.min(Ot, h + 0.1));
  }, [t.blockScale]), g = q(() => {
    t.blockScale || c((h) => Math.max(Lt, h - 0.1));
  }, [t.blockScale]), k = q(
    (h) => {
      t.blockScale || (h.preventDefault(), h.deltaY < 0 ? p() : g());
    },
    [t.blockScale, p, g]
  ), w = q(() => {
    const h = d.current;
    if (!h) return;
    const v = (S) => {
      t.blockScale || (S.preventDefault(), S.deltaY < 0 ? p() : g());
    };
    return h.addEventListener("wheel", v, { passive: !1 }), () => {
      h.removeEventListener("wheel", v);
    };
  }, [t.blockScale, p, g]), b = q(() => {
    const { position: h, euler: v } = n;
    !h || !v || o.current.render({
      size: zt,
      scale: l,
      position: h,
      rotation: v.y,
      blockRotate: i,
      tileGroups: e,
      sceneObjects: r.current
    });
  }, [n, l, i, e]);
  return I(() => {
    if (!f) return;
    const h = setInterval(() => {
      const { position: v, euler: S } = n;
      v && S && (o.current.checkForUpdates(v, S.y), b());
    }, a);
    return () => {
      clearInterval(h);
    };
  }, [b, a, f, n]), I(() => {
    b();
  }, [l, b]), {
    canvasRef: d,
    scale: l,
    upscale: p,
    downscale: g,
    handleWheel: k,
    setupWheelListener: w,
    updateCanvas: b,
    isReady: f
  };
}, _e = 200;
function zr({
  scale: t = 5,
  minScale: n = 0.5,
  maxScale: e = 20,
  blockScale: r = !1,
  blockScaleControl: o = !1,
  blockRotate: s = !1,
  angle: i = 0,
  minimapStyle: a,
  scaleStyle: d,
  plusMinusStyle: l,
  position: c = "top-right",
  showZoom: f = !0,
  showCompass: p = !0,
  markers: g = []
}) {
  const { canvasRef: k, scale: w, upscale: b, downscale: h, handleWheel: v } = Tt({
    blockScale: r,
    blockRotate: s
  }), S = c ? `minimap--${c}` : "";
  return /* @__PURE__ */ m("div", { className: `minimap ${S}`, style: a, children: [
    /* @__PURE__ */ u(
      "canvas",
      {
        ref: k,
        className: "minimap__canvas",
        width: _e,
        height: _e,
        onWheel: v
      }
    ),
    p && /* @__PURE__ */ u("div", { className: "minimap__compass", children: /* @__PURE__ */ u("div", { style: { transform: `rotate(${i}deg)` }, children: "N" }) }),
    g.map((C, M) => /* @__PURE__ */ u(
      "div",
      {
        className: `minimap__marker minimap__marker--${C.type || "normal"}`,
        style: {
          left: `${C.x}%`,
          top: `${C.y}%`
        },
        children: C.label && /* @__PURE__ */ u("div", { className: "minimap__marker-label", children: C.label })
      },
      C.id || M
    )),
    f && !o && /* @__PURE__ */ u("div", { className: "minimap__controls", style: d, children: /* @__PURE__ */ m("div", { className: "minimap__zoom-controls", children: [
      /* @__PURE__ */ u(
        "button",
        {
          className: "minimap__control-button",
          onClick: b,
          disabled: w >= e,
          style: l,
          children: "+"
        }
      ),
      /* @__PURE__ */ u(
        "button",
        {
          className: "minimap__control-button",
          onClick: h,
          disabled: w <= n,
          style: l,
          children: "-"
        }
      )
    ] }) })
  ] });
}
function Dt({
  id: t,
  position: n,
  size: e = [2, 2, 2],
  text: r = "",
  type: o = "normal",
  children: s
}) {
  return I(() => {
    const i = rt.getInstance(), a = Array.isArray(n) ? n : [n.x, n.y, n.z], d = Array.isArray(e) ? e : [e.x, e.y, e.z];
    return i.addMarker(
      t,
      o,
      r || "",
      new x.Vector3(a[0], a[1], a[2]),
      new x.Vector3(d[0], d[1], d[2])
    ), () => {
      i.removeMarker(t);
    };
  }, [t, n, e, o, r]), /* @__PURE__ */ u($, { children: s });
}
function Tr({
  id: t,
  position: n,
  size: e,
  label: r,
  children: o
}) {
  return /* @__PURE__ */ u(Dt, { id: t, position: n, size: e, text: r, type: "ground", children: o });
}
const Ft = {
  info: { bg: "rgba(20,30,50,0.55)", ring: "#7aa6ff", icon: "i" },
  success: { bg: "rgba(20,40,30,0.55)", ring: "#7adf90", icon: "+" },
  warn: { bg: "rgba(50,40,20,0.55)", ring: "#ffd84a", icon: "!" },
  error: { bg: "rgba(50,20,20,0.55)", ring: "#ff7a7a", icon: "x" },
  reward: { bg: "rgba(40,30,10,0.55)", ring: "#ffc24a", icon: "*" },
  mail: { bg: "rgba(30,20,40,0.55)", ring: "#cf9aff", icon: "M" }
};
function Dr({ position: t = "top-right", max: n = 5 }) {
  const e = Oe((i) => i.toasts), r = Oe((i) => i.dismiss);
  I(() => {
    if (!e.length) return;
    const i = e.map(
      (a) => window.setTimeout(() => r(a.id), Math.max(500, a.durationMs))
    );
    return () => {
      i.forEach((a) => window.clearTimeout(a));
    };
  }, [e, r]);
  const o = t === "top-center" ? { top: 64, left: "50%", transform: "translateX(-50%)" } : { top: 64, right: 12 }, s = e.slice(-n);
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
          const a = Ft[i.kind];
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
                /* @__PURE__ */ u(
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
                /* @__PURE__ */ u("span", { children: i.text })
              ]
            },
            i.id
          );
        }),
        /* @__PURE__ */ u("style", { children: `@keyframes gaesup-toast-in {
        0% { opacity: 0; transform: translateY(-6px); }
        100% { opacity: 1; transform: translateY(0); }
      }` })
      ]
    }
  );
}
function Fr() {
  const { activeState: t, gameStates: n } = Be(), e = Y((i) => i.mode), r = Y((i) => i.controllerOptions), o = Y(St((i) => i));
  return {
    state: t || null,
    mode: e,
    states: n,
    control: r,
    context: { mode: e, states: n, control: r },
    controller: o
  };
}
function lt() {
  const { activeState: t, updateActiveState: n } = Be(), e = !!t;
  return {
    teleport: q((o, s) => {
      if (!t) {
        console.warn("[useTeleport]: Cannot teleport - activeState not available");
        return;
      }
      n({
        position: o.clone(),
        euler: s || t.euler
      });
    }, [t, n]),
    canTeleport: e
  };
}
const Z = W((t, n) => ({
  entries: /* @__PURE__ */ new Map(),
  current: null,
  register: (e) => {
    const r = new Map(n().entries);
    r.set(e.id, e), t({ entries: r });
  },
  unregister: (e) => {
    const r = n().entries;
    if (!r.has(e)) return;
    const o = new Map(r);
    o.delete(e), t({ entries: o });
  },
  updatePosition: (e, r) => {
    const o = n().entries.get(e);
    o && o.position.copy(r);
  },
  getAll: () => Array.from(n().entries.values()),
  setCurrent: (e) => {
    const r = n().current;
    r !== e && (r && e && r.id === e.id && Math.abs(r.distance - e.distance) < 0.05 || t({ current: e }));
  },
  activateCurrent: () => {
    const e = n().current;
    if (!e) return;
    const r = n().entries.get(e.id);
    r && r.onActivate();
  }
}));
function _t({ value: t, name: n, gamePadButtonStyle: e }) {
  const [r, o] = F(!1), { pushKey: s } = nt(), i = () => {
    s(t, !0), o(!0);
  }, a = () => {
    s(t, !1), o(!1);
  };
  return /* @__PURE__ */ u(
    "button",
    {
      className: `pad-button ${r ? "is-clicked" : ""}`,
      onMouseDown: i,
      onMouseUp: a,
      onMouseLeave: a,
      onContextMenu: (d) => {
        d.preventDefault(), a();
      },
      onPointerDown: i,
      onPointerUp: a,
      style: e,
      children: n
    }
  );
}
function _r(t) {
  const { gamePadStyle: n, gamePadButtonStyle: e, label: r } = t, o = Y((a) => a.interaction?.keyboard), { mode: s } = Y();
  nt();
  const i = Object.keys(o || {}).map((a) => {
    const d = r?.[a] || a;
    return a === "forward" || a === "backward" || a === "leftward" || a === "rightward" ? {
      key: a,
      name: d,
      type: "direction",
      active: o?.[a] || !1
    } : {
      key: a,
      name: d,
      type: "action",
      active: o?.[a] || !1
    };
  }).filter(Boolean);
  return /* @__PURE__ */ u(
    "div",
    {
      className: "gamepad-container",
      style: {
        ...n,
        display: s?.controller === "gamepad" ? "flex" : "none"
      },
      children: i.map((a) => /* @__PURE__ */ u(
        _t,
        {
          value: a.key,
          name: a.name,
          gamePadButtonStyle: e
        },
        a.key
      ))
    }
  );
}
function Gt() {
  const { cameraOption: t, setCameraOption: n } = Y.getState();
  t?.focus && n({
    focus: !1
  });
}
const Wt = bt(
  ({ children: t, position: n, focusDistance: e = 10, focusDuration: r = 1, onFocus: o, onBlur: s, ...i }, a) => {
    const d = Y((k) => k.setCameraOption), l = Y((k) => k.cameraOption), c = (k) => {
      if (k.stopPropagation(), !l?.enableFocus) return;
      if (l.focus) {
        Gt(), s && s(k);
        return;
      }
      const w = k.object.getWorldPosition(new x.Vector3());
      d({
        focusTarget: w,
        focusDuration: r,
        focusDistance: e,
        focus: !0
      }), o && o(k);
    }, f = () => {
      l?.enableFocus && (document.body.style.cursor = "pointer");
    }, p = (k) => {
      document.body.style.cursor = "default", s && !l?.focus && s(k);
    }, g = {
      ...i,
      ...n ? { position: n } : {}
    };
    return /* @__PURE__ */ u(
      "group",
      {
        ref: a,
        onClick: c,
        onPointerOver: f,
        onPointerOut: p,
        ...g,
        children: t
      }
    );
  }
);
Wt.displayName = "FocusableObject";
function Gr({
  id: t,
  kind: n = "misc",
  label: e,
  range: r = 2.2,
  activationKey: o = "e",
  data: s,
  onActivate: i,
  position: a,
  children: d
}) {
  const l = xt(), c = t ?? l, f = Z((b) => b.register), p = Z((b) => b.unregister), g = Z((b) => b.updatePosition), k = B(null), w = z(() => new x.Vector3(...a), [a]);
  return I(() => (f({
    id: c,
    kind: n,
    label: e,
    position: w.clone(),
    range: r,
    key: o,
    ...s ? { data: s } : {},
    onActivate: i
  }), () => p(c)), [c, n, e, r, o, s, i, f, p, w]), I(() => {
    g(c, w);
  }, [c, w, g]), /* @__PURE__ */ u("group", { ref: k, position: a, children: d });
}
const Ge = new x.Vector3();
function ct() {
  return Z((t) => t.current);
}
function Nt(t = !0) {
  const n = ct(), e = Z((r) => r.activateCurrent);
  I(() => {
    if (!t || !n) return;
    const r = (o) => {
      const s = o.target?.tagName?.toLowerCase();
      s === "input" || s === "textarea" || o.key.toLowerCase() === n.key.toLowerCase() && e();
    };
    return window.addEventListener("keydown", r), () => window.removeEventListener("keydown", r);
  }, [n, t, e]);
}
function Wr({ throttleMs: t = 80 } = {}) {
  const { position: n } = ee({ updateInterval: 16 }), e = Z((s) => s.entries), r = Z((s) => s.setCurrent), o = B(0);
  return V((s, i) => {
    if (o.current += i * 1e3, o.current < t) return;
    o.current = 0;
    let a = null, d = 1 / 0, l = "", c = "e";
    for (const f of e.values()) {
      Ge.copy(f.position).sub(n);
      const p = Ge.lengthSq(), g = f.range * f.range;
      p > g || p < d && (d = p, a = f.id, l = f.label, c = f.key);
    }
    if (!a) {
      r(null);
      return;
    }
    r({
      id: a,
      label: l,
      key: c,
      distance: Math.sqrt(d)
    });
  }), null;
}
function Nr({ enabled: t = !0 }) {
  const n = ct();
  return Nt(t), !t || !n ? null : /* @__PURE__ */ m(
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
        /* @__PURE__ */ u(
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
        /* @__PURE__ */ u("span", { children: n.label }),
        /* @__PURE__ */ m("span", { style: { opacity: 0.5, fontSize: 11 }, children: [
          n.distance.toFixed(1),
          "m"
        ] })
      ]
    }
  );
}
function Ur({
  showController: t = !0,
  showDebugPanel: n = !0,
  controllerProps: e = {},
  debugPanelProps: r = {}
}) {
  return /* @__PURE__ */ m($, { children: [
    t && /* @__PURE__ */ u(
      pt,
      {
        position: "bottom-left",
        showLabels: !0,
        compact: !1,
        ...e
      }
    ),
    n && /* @__PURE__ */ u(
      mt,
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
function qr({ text: t, position: n, teleportStyle: e }) {
  const { teleport: r, canTeleport: o } = lt();
  return /* @__PURE__ */ m(
    "div",
    {
      className: `teleport ${o ? "" : "teleport--disabled"}`,
      onClick: () => {
        r(n);
      },
      style: e,
      title: o ? "Click to teleport" : "Teleport not available",
      children: [
        t || "Teleport",
        !o && /* @__PURE__ */ u("span", { className: "teleport__cooldown", children: "⏱️" })
      ]
    }
  );
}
function Ut() {
  return O((t) => t.time);
}
function jr() {
  return O((t) => ({ hour: t.time.hour, minute: t.time.minute }));
}
function $r(t = !0) {
  const n = O((r) => r.tick), e = B(0);
  I(() => {
    if (!t) return;
    let r = 0, o = !0;
    const s = (i) => {
      if (!o) return;
      const a = e.current || i, d = i - a;
      e.current = i, n(d), r = requestAnimationFrame(s);
    };
    return r = requestAnimationFrame(s), () => {
      o = !1, cancelAnimationFrame(r);
    };
  }, [t, n]);
}
function Vr(t) {
  const n = O((e) => e.addListener);
  I(() => n((e) => {
    e.kind === "newDay" && t(e.time);
  }), [n, t]);
}
function Hr(t) {
  const n = O((e) => e.addListener);
  I(() => n((e) => {
    e.kind === "newHour" && t(e.time);
  }), [n, t]);
}
const qt = {
  spring: "#ffb6c1",
  summer: "#9bd97a",
  autumn: "#e0a060",
  winter: "#cfe2ff"
}, jt = {
  sun: "일",
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토"
};
function Yr() {
  const t = Ut(), n = String(t.hour).padStart(2, "0"), e = String(t.minute).padStart(2, "0");
  return /* @__PURE__ */ u(
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
        /* @__PURE__ */ u(
          "span",
          {
            style: {
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: qt[t.season] ?? "#fff"
            }
          }
        ),
        /* @__PURE__ */ m("span", { children: [
          "Y",
          t.year,
          " M",
          String(t.month).padStart(2, "0"),
          " D",
          String(t.day).padStart(2, "0"),
          " ",
          "(",
          jt[t.weekday],
          ")"
        ] }),
        /* @__PURE__ */ m("span", { style: { opacity: 0.85 }, children: [
          n,
          ":",
          e
        ] })
      ] })
    }
  );
}
const $t = [
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
function Kr() {
  _().registerAll($t);
}
const Vt = ["axe", "shovel", "water-can", "net", "rod", "apple"];
function Ht(t, n, e) {
  const r = t.slice();
  for (let o = r.length - 1; o > 0; o--) {
    const s = Math.floor(e() * (o + 1));
    [r[o], r[s]] = [r[s], r[o]];
  }
  return r.slice(0, Math.min(n, r.length));
}
function Yt(t) {
  let n = t | 0 || 1;
  return () => (n = n * 1664525 + 1013904223 | 0, (n >>> 0) / 4294967295);
}
const le = W((t, n) => ({
  catalog: Vt,
  dailyStock: [],
  lastRolledDay: -1,
  setCatalog: (e) => t({ catalog: e.slice() }),
  rollDailyStock: (e, r = 4) => {
    const o = n();
    if (o.lastRolledDay === e && o.dailyStock.length > 0) return;
    const s = Yt(e * 9301 + 49297), a = Ht(o.catalog, r, s).map((d) => {
      const l = _().get(d), c = l?.stackable ? 5 + Math.floor(s() * 6) : 1;
      return { itemId: d, price: l?.buyPrice ?? 100, stock: c };
    });
    t({ dailyStock: a, lastRolledDay: e });
  },
  buy: (e, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    const o = n(), s = o.dailyStock.findIndex((p) => p.itemId === e);
    if (s < 0) return { ok: !1, reason: "not in stock" };
    const i = o.dailyStock[s], a = i.stock ?? 0;
    if (a < r) return { ok: !1, reason: "insufficient stock" };
    const d = (i.price ?? n().priceOf(e)) * r, l = X.getState();
    if (l.bells < d) return { ok: !1, reason: "insufficient bells" };
    if (!l.spend(d)) return { ok: !1, reason: "spend failed" };
    if (E.getState().add(e, r) > 0)
      return l.add(d), { ok: !1, reason: "inventory full" };
    const f = o.dailyStock.slice();
    return f[s] = { ...i, stock: a - r }, t({ dailyStock: f }), { ok: !0 };
  },
  sell: (e, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    if (E.getState().countOf(e) < r) return { ok: !1, reason: "not enough items" };
    const s = E.getState().removeById(e, r);
    if (s < r) return { ok: !1, reason: "remove failed" };
    const i = n().sellPriceOf(e) * s;
    return i > 0 && X.getState().add(i), { ok: !0 };
  },
  priceOf: (e) => {
    const o = n().dailyStock.find((s) => s.itemId === e);
    return o?.price != null ? o.price : _().get(e)?.buyPrice ?? 0;
  },
  sellPriceOf: (e) => _().get(e)?.sellPrice ?? 0,
  serialize: () => {
    const e = n();
    return {
      version: 1,
      lastRolledDay: e.lastRolledDay,
      dailyStock: e.dailyStock.map((r) => ({ ...r }))
    };
  },
  hydrate: (e) => {
    e && t({
      lastRolledDay: typeof e.lastRolledDay == "number" ? e.lastRolledDay : -1,
      dailyStock: Array.isArray(e.dailyStock) ? e.dailyStock.map((r) => ({ ...r })) : []
    });
  }
}));
function Xr({ position: t = "top-center" }) {
  const n = X((r) => r.bells);
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
        ...t === "bottom-right" ? { bottom: 96, right: 12 } : { top: 10, left: "50%", transform: "translateX(-50%)" }
      },
      children: [
        /* @__PURE__ */ u("span", { style: {
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
        /* @__PURE__ */ u("span", { style: { fontWeight: 700 }, children: n.toLocaleString() })
      ]
    }
  );
}
function Qr({ open: t, onClose: n, title: e = "Shop" }) {
  const [r, o] = F("buy"), s = le((p) => p.dailyStock), i = le((p) => p.buy), a = le((p) => p.sell), d = le((p) => p.sellPriceOf), l = X((p) => p.bells), c = E((p) => p.slots);
  if (!t) return null;
  const f = (() => {
    const p = /* @__PURE__ */ new Map();
    for (const g of c)
      g && p.set(g.itemId, (p.get(g.itemId) ?? 0) + g.count);
    return Array.from(p.entries()).filter(([g]) => d(g) > 0);
  })();
  return /* @__PURE__ */ u(
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
              /* @__PURE__ */ u("strong", { style: { fontSize: 15 }, children: e }),
              /* @__PURE__ */ m("span", { style: { color: "#ffd84a" }, children: [
                l.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ u("button", { onClick: n, style: dt(), children: "닫기" })
            ] }),
            /* @__PURE__ */ m("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ u(We, { active: r === "buy", onClick: () => o("buy"), children: "구매" }),
              /* @__PURE__ */ u(We, { active: r === "sell", onClick: () => o("sell"), children: "판매" })
            ] }),
            /* @__PURE__ */ m("div", { style: { overflowY: "auto", padding: 10 }, children: [
              r === "buy" && (s.length === 0 ? /* @__PURE__ */ u("div", { style: { opacity: 0.7, padding: 12 }, children: "오늘 상품이 없습니다." }) : s.map((p) => {
                const g = _().get(p.itemId), k = p.price ?? g?.buyPrice ?? 0, w = p.stock ?? 0;
                return /* @__PURE__ */ u(
                  Ne,
                  {
                    ...g?.color ? { color: g.color } : {},
                    name: g?.name ?? p.itemId,
                    sub: `재고 ${w}`,
                    price: k,
                    disabled: w <= 0 || l < k,
                    actionLabel: "구매",
                    onAction: () => {
                      const b = i(p.itemId, 1);
                      b.ok ? D("success", `${g?.name ?? p.itemId} 구매`) : D("warn", `구매 실패: ${b.reason ?? ""}`);
                    }
                  },
                  p.itemId
                );
              })),
              r === "sell" && (f.length === 0 ? /* @__PURE__ */ u("div", { style: { opacity: 0.7, padding: 12 }, children: "판매할 아이템이 없습니다." }) : f.map(([p, g]) => {
                const k = _().get(p), w = d(p);
                return /* @__PURE__ */ u(
                  Ne,
                  {
                    ...k?.color ? { color: k.color } : {},
                    name: k?.name ?? p,
                    sub: `보유 ${g}`,
                    price: w,
                    actionLabel: "판매",
                    onAction: () => {
                      const b = a(p, 1);
                      b.ok ? D("reward", `${k?.name ?? p} 판매 +${w} B`) : D("warn", `판매 실패: ${b.reason ?? ""}`);
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
function We({ active: t, onClick: n, children: e }) {
  return /* @__PURE__ */ u(
    "button",
    {
      onClick: n,
      style: {
        flex: 1,
        padding: "8px 10px",
        background: t ? "#262626" : "transparent",
        color: t ? "#ffd84a" : "#ddd",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 13
      },
      children: e
    }
  );
}
function Ne({
  color: t,
  name: n,
  sub: e,
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
    /* @__PURE__ */ u("span", { style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      background: t ?? "#888"
    } }),
    /* @__PURE__ */ m("div", { style: { flex: 1 }, children: [
      /* @__PURE__ */ u("div", { children: n }),
      e && /* @__PURE__ */ u("div", { style: { fontSize: 11, opacity: 0.7 }, children: e })
    ] }),
    /* @__PURE__ */ m("div", { style: { color: "#ffd84a", minWidth: 64, textAlign: "right" }, children: [
      r.toLocaleString(),
      " B"
    ] }),
    /* @__PURE__ */ u("button", { onClick: s, disabled: i, style: dt(i), children: o })
  ] });
}
function dt(t) {
  return {
    padding: "6px 10px",
    background: t ? "#333" : "#444",
    color: t ? "#777" : "#fff",
    border: "none",
    borderRadius: 6,
    cursor: t ? "not-allowed" : "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12
  };
}
function Zr({
  useKey: t = "f",
  range: n = 2.4,
  cooldownMs: e = 350
} = {}) {
  const { position: r, rotation: o } = ee({ updateInterval: 16 }), s = B(0);
  return I(() => {
    const i = `Key${t.toUpperCase()}`, a = t.toLowerCase(), d = (l) => {
      const c = l.target?.tagName?.toLowerCase();
      if (c === "input" || c === "textarea" || l.code !== i && l.key.toLowerCase() !== a) return;
      const f = performance.now();
      if (f - s.current < e) return;
      const p = E.getState().getEquipped();
      if (!p) return;
      const g = _().get(p.itemId);
      if (!g?.toolKind) return;
      const k = g.toolKind, w = o?.y ?? 0, b = new x.Vector3(Math.sin(w), 0, Math.cos(w)).normalize();
      s.current = f, kt().emit({
        kind: k,
        origin: [r.x, r.y, r.z],
        direction: [b.x, b.y, b.z],
        range: n,
        timestamp: f
      });
    };
    return window.addEventListener("keydown", d), () => window.removeEventListener("keydown", d);
  }, [t, e, n, r, o]), null;
}
let Kt = 0;
function Xt() {
  return `mail_${Date.now().toString(36)}_${(++Kt).toString(36)}`;
}
function Qt(t) {
  return t.itemId !== void 0;
}
const ce = W((t, n) => ({
  messages: [],
  send: (e) => {
    const r = e.id ?? Xt(), o = {
      id: r,
      from: e.from,
      subject: e.subject,
      body: e.body,
      sentDay: e.sentDay,
      ...e.attachments ? { attachments: e.attachments } : {},
      read: !1,
      claimed: !e.attachments || e.attachments.length === 0
    };
    return t({ messages: [...n().messages, o] }), D("mail", `새 우편: ${e.subject}`), r;
  },
  markRead: (e) => {
    t({ messages: n().messages.map((r) => r.id === e ? { ...r, read: !0 } : r) });
  },
  markAllRead: () => {
    t({ messages: n().messages.map((e) => ({ ...e, read: !0 })) });
  },
  claim: (e) => {
    const r = n().messages.find((s) => s.id === e);
    if (!r || r.claimed || !r.attachments) return !1;
    let o = !0;
    for (const s of r.attachments)
      if (Qt(s)) {
        if (E.getState().add(s.itemId, s.count ?? 1) > 0) {
          o = !1, D("warn", "인벤토리 부족, 일부 우편물 미수령");
          break;
        }
      } else
        X.getState().add(s.bells);
    return o && (t({ messages: n().messages.map((s) => s.id === e ? { ...s, claimed: !0, read: !0 } : s) }), D("reward", "우편 첨부물 수령")), o;
  },
  delete: (e) => {
    t({ messages: n().messages.filter((r) => r.id !== e) });
  },
  unreadCount: () => n().messages.reduce((e, r) => e + (r.read ? 0 : 1), 0),
  hasUnclaimedAttachments: () => n().messages.some((e) => !e.claimed && (e.attachments?.length ?? 0) > 0),
  serialize: () => ({
    version: 1,
    messages: n().messages.map((e) => ({
      ...e,
      ...e.attachments ? { attachments: e.attachments.map((r) => ({ ...r })) } : {}
    }))
  }),
  hydrate: (e) => {
    !e || !Array.isArray(e.messages) || t({ messages: e.messages.map((r) => ({ ...r })) });
  }
}));
function Jr({ toggleKey: t = "m" }) {
  const [n, e] = F(!1), [r, o] = F(null), s = ce((f) => f.messages), i = ce((f) => f.markRead), a = ce((f) => f.claim), d = ce((f) => f.delete);
  if (I(() => {
    const f = (p) => {
      const g = p.target?.tagName?.toLowerCase();
      g === "input" || g === "textarea" || (p.key.toLowerCase() === t.toLowerCase() && e((k) => !k), p.key === "Escape" && e(!1));
    };
    return window.addEventListener("keydown", f), () => window.removeEventListener("keydown", f);
  }, [t]), !n) return null;
  const l = s.slice().sort((f, p) => p.sentDay - f.sentDay), c = r ? l.find((f) => f.id === r) ?? null : null;
  return /* @__PURE__ */ u(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => e(!1),
      children: /* @__PURE__ */ m(
        "div",
        {
          onClick: (f) => f.stopPropagation(),
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
                /* @__PURE__ */ u("strong", { children: "우편함" }),
                /* @__PURE__ */ u("span", { style: { fontSize: 12, opacity: 0.7 }, children: l.length })
              ] }),
              /* @__PURE__ */ u("div", { style: { flex: 1, overflowY: "auto" }, children: l.length === 0 ? /* @__PURE__ */ u(Jt, { children: "우편이 없습니다." }) : l.map((f) => /* @__PURE__ */ m(
                "div",
                {
                  onClick: () => {
                    o(f.id), f.read || i(f.id);
                  },
                  style: {
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: r === f.id ? "#262626" : "transparent",
                    borderBottom: "1px solid #2a2a2a",
                    opacity: f.read ? 0.7 : 1
                  },
                  children: [
                    /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      !f.read && /* @__PURE__ */ u("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "#cf9aff" } }),
                      /* @__PURE__ */ u("strong", { style: { fontSize: 13 }, children: f.subject })
                    ] }),
                    /* @__PURE__ */ m("div", { style: { fontSize: 11, opacity: 0.6 }, children: [
                      f.from,
                      " · day ",
                      f.sentDay
                    ] }),
                    f.attachments && f.attachments.length > 0 && !f.claimed && /* @__PURE__ */ u("div", { style: { fontSize: 11, color: "#ffd84a" }, children: "* 첨부물" })
                  ]
                },
                f.id
              )) })
            ] }),
            /* @__PURE__ */ m("div", { style: { flex: 1, display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ m("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ u("span", { children: c ? c.subject : "메시지를 선택하세요" }),
                /* @__PURE__ */ m("button", { onClick: () => e(!1), style: Ae(), children: [
                  "닫기 [",
                  t.toUpperCase(),
                  "]"
                ] })
              ] }),
              /* @__PURE__ */ u("div", { style: { flex: 1, padding: 12, overflowY: "auto" }, children: c ? /* @__PURE__ */ u(Zt, { msg: c, onClaim: () => a(c.id), onDelete: () => {
                d(c.id), o(null);
              } }) : /* @__PURE__ */ u("div", { style: { opacity: 0.6 }, children: "왼쪽에서 메시지를 선택하세요." }) })
            ] })
          ]
        }
      )
    }
  );
}
function Zt({ msg: t, onClaim: n, onDelete: e }) {
  return /* @__PURE__ */ m("div", { children: [
    /* @__PURE__ */ m("div", { style: { marginBottom: 6, opacity: 0.75 }, children: [
      "From. ",
      t.from
    ] }),
    /* @__PURE__ */ u("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 12 }, children: t.body }),
    t.attachments && t.attachments.length > 0 && /* @__PURE__ */ m("div", { style: { padding: 10, background: "#222", borderRadius: 8, marginBottom: 8 }, children: [
      /* @__PURE__ */ u("div", { style: { marginBottom: 6, color: "#ffd84a", fontSize: 12 }, children: "첨부물" }),
      /* @__PURE__ */ u("ul", { style: { margin: 0, paddingLeft: 18 }, children: t.attachments.map((r, o) => {
        if ("itemId" in r) {
          const s = _().get(r.itemId);
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
      /* @__PURE__ */ u("div", { style: { marginTop: 8, display: "flex", gap: 6, justifyContent: "flex-end" }, children: t.claimed ? /* @__PURE__ */ u("span", { style: { fontSize: 12, opacity: 0.6 }, children: "수령 완료" }) : /* @__PURE__ */ u("button", { onClick: n, style: Ae(!0), children: "받기" }) })
    ] }),
    /* @__PURE__ */ u("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ u("button", { onClick: e, style: Ae(), children: "삭제" }) })
  ] });
}
function Jt({ children: t }) {
  return /* @__PURE__ */ u("div", { style: { padding: 14, opacity: 0.6 }, children: t });
}
function Ae(t) {
  return {
    padding: "6px 10px",
    background: t ? "#cf9aff" : "#444",
    color: t ? "#1a0d24" : "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: t ? 700 : 400
  };
}
const Ue = ["fish", "bug", "food", "material", "furniture", "tool", "misc"], ut = W((t, n) => ({
  entries: {},
  record: (e, r, o) => {
    if (r <= 0) return;
    const s = n().entries[e], i = s ? { ...s, totalCollected: s.totalCollected + r } : { itemId: e, firstSeenDay: o, totalCollected: r };
    t({ entries: { ...n().entries, [e]: i } });
  },
  has: (e) => !!n().entries[e],
  get: (e) => n().entries[e],
  size: () => Object.keys(n().entries).length,
  serialize: () => ({
    version: 1,
    entries: Object.fromEntries(Object.entries(n().entries).map(([e, r]) => [e, { ...r }]))
  }),
  hydrate: (e) => {
    if (!e || typeof e != "object") return;
    const r = {};
    if (e.entries && typeof e.entries == "object")
      for (const [o, s] of Object.entries(e.entries))
        !s || typeof s != "object" || (r[o] = {
          itemId: o,
          firstSeenDay: typeof s.firstSeenDay == "number" ? s.firstSeenDay : 0,
          totalCollected: typeof s.totalCollected == "number" ? s.totalCollected : 0
        });
    t({ entries: r });
  }
}));
function eo(t = !0) {
  I(() => t ? E.subscribe((e, r) => {
    if (e.slots === r.slots) return;
    const o = Math.floor(O.getState().totalMinutes / (60 * 24)), s = /* @__PURE__ */ new Map();
    for (const a of r.slots) a && s.set(a.itemId, (s.get(a.itemId) ?? 0) + a.count);
    const i = /* @__PURE__ */ new Map();
    for (const a of e.slots) a && i.set(a.itemId, (i.get(a.itemId) ?? 0) + a.count);
    for (const [a, d] of i.entries()) {
      const l = d - (s.get(a) ?? 0);
      l > 0 && ut.getState().record(a, l, o);
    }
  }) : void 0, [t]);
}
function to({ toggleKey: t = "k" }) {
  const [n, e] = F(!1), [r, o] = F("fish"), s = ut((c) => c.entries);
  I(() => {
    const c = (f) => {
      const p = f.target?.tagName?.toLowerCase();
      p === "input" || p === "textarea" || (f.key.toLowerCase() === t.toLowerCase() && e((g) => !g), f.key === "Escape" && e(!1));
    };
    return window.addEventListener("keydown", c), () => window.removeEventListener("keydown", c);
  }, [t]);
  const i = z(() => _().all(), []), a = z(() => {
    const c = /* @__PURE__ */ new Map();
    for (const f of Ue) c.set(f, []);
    for (const f of i) {
      const p = c.get(f.category);
      p && p.push(f);
    }
    return c;
  }, [i]);
  if (!n) return null;
  const d = a.get(r) ?? [], l = d.filter((c) => s[c.id]).length;
  return /* @__PURE__ */ u(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => e(!1),
      children: /* @__PURE__ */ m(
        "div",
        {
          onClick: (c) => c.stopPropagation(),
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
              /* @__PURE__ */ u("strong", { style: { fontSize: 15 }, children: "도감" }),
              /* @__PURE__ */ m("button", { onClick: () => e(!1), style: en(), children: [
                "닫기 [",
                t.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ u("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: Ue.map((c) => {
              const f = a.get(c) ?? [];
              if (f.length === 0) return null;
              const p = f.filter((g) => s[g.id]).length;
              return /* @__PURE__ */ m(
                "button",
                {
                  onClick: () => o(c),
                  style: {
                    flex: 1,
                    padding: "8px 4px",
                    background: r === c ? "#262626" : "transparent",
                    color: r === c ? "#7adf90" : "#ddd",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Pretendard', system-ui, sans-serif",
                    fontSize: 12
                  },
                  children: [
                    qe(c),
                    " (",
                    p,
                    "/",
                    f.length,
                    ")"
                  ]
                },
                c
              );
            }) }),
            /* @__PURE__ */ m("div", { style: { padding: "6px 14px", fontSize: 12, opacity: 0.7 }, children: [
              qe(r),
              " — ",
              l,
              "/",
              d.length,
              " 수집"
            ] }),
            /* @__PURE__ */ m("div", { style: { flex: 1, overflowY: "auto", padding: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }, children: [
              d.map((c) => {
                const f = s[c.id], p = !!f;
                return /* @__PURE__ */ m("div", { style: {
                  padding: 10,
                  borderRadius: 8,
                  background: p ? "#222" : "#181818",
                  border: p ? "1px solid #2e3" : "1px solid #2a2a2a",
                  opacity: p ? 1 : 0.4
                }, children: [
                  /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }, children: [
                    /* @__PURE__ */ u("span", { style: { width: 16, height: 16, borderRadius: 4, background: c.color ?? "#888" } }),
                    /* @__PURE__ */ u("strong", { style: { fontSize: 13 }, children: p ? c.name : "???" })
                  ] }),
                  p && /* @__PURE__ */ m("div", { style: { fontSize: 11, opacity: 0.7 }, children: [
                    "수집 ",
                    f.totalCollected,
                    " · day ",
                    f.firstSeenDay
                  ] })
                ] }, c.id);
              }),
              d.length === 0 && /* @__PURE__ */ u("div", { style: { opacity: 0.6 }, children: "이 카테고리에는 항목이 없습니다." })
            ] })
          ]
        }
      )
    }
  );
}
function qe(t) {
  switch (t) {
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
function en() {
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
class tn {
  defs = /* @__PURE__ */ new Map();
  register(n) {
    this.defs.has(n.id) || this.defs.set(n.id, n);
  }
  registerAll(n) {
    for (const e of n) this.register(e);
  }
  get(n) {
    return this.defs.get(n);
  }
  require(n) {
    const e = this.defs.get(n);
    if (!e) throw new Error(`Unknown RecipeId: ${n}`);
    return e;
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
let xe = null;
function ie() {
  return xe || (xe = new tn()), xe;
}
const we = W((t, n) => ({
  unlocked: /* @__PURE__ */ new Set(),
  unlock: (e) => {
    const r = ie().get(e);
    if (!r || n().unlocked.has(e)) return;
    const o = new Set(n().unlocked);
    o.add(e), t({ unlocked: o }), D("info", `레시피 해금: ${r.name}`);
  },
  isUnlocked: (e) => {
    const r = ie().get(e);
    return r ? r.unlockedByDefault ? !0 : n().unlocked.has(e) : !1;
  },
  canCraft: (e) => {
    const r = ie().get(e);
    if (!r) return { ok: !1, reason: "unknown recipe" };
    if (!n().isUnlocked(e)) return { ok: !1, reason: "locked" };
    const o = E.getState();
    for (const s of r.ingredients)
      if (o.countOf(s.itemId) < s.count) return { ok: !1, reason: "missing ingredients" };
    return r.requireBells && X.getState().bells < r.requireBells ? { ok: !1, reason: "insufficient bells" } : { ok: !0 };
  },
  craft: (e) => {
    const r = n().canCraft(e);
    if (!r.ok) return r;
    const o = ie().require(e), s = E.getState();
    for (const a of o.ingredients)
      if (s.removeById(a.itemId, a.count) < a.count) return { ok: !1, reason: "remove failed" };
    return o.requireBells && !X.getState().spend(o.requireBells) ? { ok: !1, reason: "spend failed" } : (s.add(o.output.itemId, o.output.count) > 0 ? D("warn", "인벤토리 부족, 일부 결과물 폐기") : D("reward", `제작 완료: ${o.name}`), { ok: !0 });
  },
  serialize: () => ({ version: 1, unlocked: Array.from(n().unlocked) }),
  hydrate: (e) => {
    !e || !Array.isArray(e.unlocked) || t({ unlocked: new Set(e.unlocked) });
  }
}));
function no({ toggleKey: t = "c", title: n = "제작대", open: e, onClose: r }) {
  const [o, s] = F(!1), i = e !== void 0, a = i ? e : o, d = () => {
    i ? r?.() : s(!1);
  }, l = () => {
    i ? a && r?.() : s((h) => !h);
  }, c = we((h) => h.isUnlocked), f = we((h) => h.canCraft), p = we((h) => h.craft), g = E((h) => h.slots), k = X((h) => h.bells);
  if (I(() => {
    const h = (v) => {
      const S = v.target?.tagName?.toLowerCase();
      S === "input" || S === "textarea" || (v.key.toLowerCase() === t.toLowerCase() && l(), v.key === "Escape" && d());
    };
    return window.addEventListener("keydown", h), () => window.removeEventListener("keydown", h);
  }, [t, i, a]), !a) return null;
  const w = ie().all(), b = (() => {
    const h = /* @__PURE__ */ new Map();
    for (const v of g) v && h.set(v.itemId, (h.get(v.itemId) ?? 0) + v.count);
    return h;
  })();
  return /* @__PURE__ */ u(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: d,
      children: /* @__PURE__ */ m(
        "div",
        {
          onClick: (h) => h.stopPropagation(),
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
              /* @__PURE__ */ u("strong", { style: { fontSize: 15 }, children: n }),
              /* @__PURE__ */ m("span", { style: { color: "#ffd84a" }, children: [
                k.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ m("button", { onClick: d, style: je(), children: [
                "닫기 [",
                t.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ m("div", { style: { overflowY: "auto", padding: 10 }, children: [
              w.length === 0 && /* @__PURE__ */ u(nn, { children: "레시피가 없습니다." }),
              w.map((h) => {
                const v = c(h.id), S = f(h.id), C = _().get(h.output.itemId);
                return /* @__PURE__ */ m("div", { style: {
                  padding: 10,
                  marginBottom: 6,
                  background: "#222",
                  borderRadius: 8,
                  opacity: v ? 1 : 0.45
                }, children: [
                  /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
                    /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      /* @__PURE__ */ u("span", { style: { width: 16, height: 16, borderRadius: 4, background: C?.color ?? "#888" } }),
                      /* @__PURE__ */ u("strong", { children: v ? h.name : "???" }),
                      h.output.count > 1 && /* @__PURE__ */ m("span", { style: { opacity: 0.7 }, children: [
                        "x",
                        h.output.count
                      ] })
                    ] }),
                    /* @__PURE__ */ u(
                      "button",
                      {
                        onClick: () => p(h.id),
                        disabled: !S.ok,
                        style: je(S.ok),
                        children: "제작"
                      }
                    )
                  ] }),
                  v && /* @__PURE__ */ m("div", { style: { fontSize: 12, opacity: 0.85 }, children: [
                    "재료: ",
                    h.ingredients.map((M) => {
                      const L = b.get(M.itemId) ?? 0, y = L >= M.count, P = _().get(M.itemId);
                      return /* @__PURE__ */ m("span", { style: { marginRight: 8, color: y ? "#7adf90" : "#ff8a8a" }, children: [
                        P?.name ?? M.itemId,
                        " ",
                        L,
                        "/",
                        M.count
                      ] }, M.itemId);
                    }),
                    h.requireBells ? /* @__PURE__ */ m("span", { style: { color: "#ffd84a" }, children: [
                      "· ",
                      h.requireBells,
                      " B"
                    ] }) : null
                  ] })
                ] }, h.id);
              })
            ] })
          ]
        }
      )
    }
  );
}
function nn({ children: t }) {
  return /* @__PURE__ */ u("div", { style: { padding: 14, opacity: 0.6 }, children: t });
}
function je(t) {
  return {
    padding: "5px 10px",
    background: t ? "#ffc878" : "#333",
    color: t ? "#1a1a1a" : "#777",
    border: "none",
    borderRadius: 6,
    cursor: t ? "pointer" : "not-allowed",
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: t ? 700 : 400
  };
}
class rn {
  defs = /* @__PURE__ */ new Map();
  register(n) {
    this.defs.has(n.id) || this.defs.set(n.id, n);
  }
  registerAll(n) {
    for (const e of n) this.register(e);
  }
  get(n) {
    return this.defs.get(n);
  }
  require(n) {
    const e = this.defs.get(n);
    if (!e) throw new Error(`Unknown CropId: ${n}`);
    return e;
  }
  bySeedItemId(n) {
    for (const e of this.defs.values()) if (e.seedItemId === n) return e;
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
let ve = null;
function J() {
  return ve || (ve = new rn()), ve;
}
function $e(t, n) {
  return { id: t, position: n, state: "empty", stageIndex: 0 };
}
function on(t, n) {
  if (t.state !== "planted" && t.state !== "mature") return t.stageIndex;
  const e = t.cropId ? J().get(t.cropId) : void 0;
  if (!e || t.plantedAt === void 0) return t.stageIndex;
  let r = n - t.plantedAt;
  for (let o = 0; o < e.stages.length; o++) {
    const s = e.stages[o];
    if (s.durationMinutes <= 0 || r < s.durationMinutes) return o;
    r -= s.durationMinutes;
  }
  return e.stages.length - 1;
}
const G = W((t, n) => ({
  plots: {},
  registerPlot: (e) => {
    if (n().plots[e.id]) return;
    const o = { ...$e(e.id, e.position), ...e };
    t({ plots: { ...n().plots, [e.id]: o } });
  },
  unregisterPlot: (e) => {
    if (!n().plots[e]) return;
    const r = { ...n().plots };
    delete r[e], t({ plots: r });
  },
  till: (e) => {
    const r = n().plots[e];
    return !r || r.state !== "empty" ? !1 : (t({ plots: { ...n().plots, [e]: { ...r, state: "tilled", stageIndex: 0 } } }), !0);
  },
  plant: (e, r, o) => {
    const s = n().plots[e], i = J().get(r);
    if (!s || !i || s.state !== "tilled") return !1;
    const a = E.getState();
    return a.countOf(i.seedItemId) < 1 ? (D("warn", `${i.name} 씨앗 부족`), !1) : (a.removeById(i.seedItemId, 1), t({
      plots: {
        ...n().plots,
        [e]: {
          ...s,
          state: "planted",
          cropId: r,
          plantedAt: o,
          lastWateredAt: o,
          stageIndex: 0
        }
      }
    }), D("success", `${i.name} 심음`), !0);
  },
  water: (e, r) => {
    const o = n().plots[e];
    if (!o || o.state !== "planted" && o.state !== "dried") return !1;
    let s = { ...o, lastWateredAt: r };
    return o.state === "dried" && (s = { ...s, state: "planted" }), t({ plots: { ...n().plots, [e]: s } }), !0;
  },
  harvest: (e) => {
    const r = n().plots[e];
    if (!r || r.state !== "mature" || !r.cropId) return !1;
    const o = J().get(r.cropId);
    return o ? E.getState().add(o.yieldItemId, o.yieldCount) > 0 ? (D("warn", "인벤토리가 가득 찼습니다"), !1) : (D("reward", `${o.name} +${o.yieldCount}`), t({
      plots: {
        ...n().plots,
        [e]: {
          ...$e(r.id, r.position),
          state: "tilled"
        }
      }
    }), !0) : !1;
  },
  tick: (e) => {
    const r = n().plots, o = {};
    let s = !1;
    for (const [i, a] of Object.entries(r)) {
      let d = a;
      if (d.state === "planted" || d.state === "mature") {
        const l = d.cropId ? J().get(d.cropId) : void 0;
        if (l && d.plantedAt !== void 0) {
          const c = d.lastWateredAt ?? d.plantedAt;
          if (e - c >= l.driedOutMinutes)
            d = { ...d, state: "dried" }, s = !0;
          else {
            const f = on(d, e), p = l.stages.length - 1, g = f >= p ? "mature" : "planted";
            (f !== d.stageIndex || g !== d.state) && (d = { ...d, stageIndex: f, state: g }, s = !0);
          }
        }
      }
      o[i] = d;
    }
    s && t({ plots: o });
  },
  near: (e, r, o) => {
    const s = o * o;
    let i = null, a = 1 / 0;
    for (const d of Object.values(n().plots)) {
      const l = d.position[0] - e, c = d.position[2] - r, f = l * l + c * c;
      f < s && f < a && (a = f, i = d);
    }
    return i;
  },
  serialize: () => ({ version: 1, plots: Object.values(n().plots).map((e) => ({ ...e })) }),
  hydrate: (e) => {
    if (!e || !Array.isArray(e.plots)) return;
    const r = {};
    for (const o of e.plots) o?.id && (r[o.id] = { ...o });
    t({ plots: r });
  }
}));
function Se(t, n, e) {
  const r = n.origin[0] - t.position[0], o = n.origin[2] - t.position[2];
  return r * r + o * o <= e * e;
}
function ro({ id: t, position: n, size: e = 1.4, hitRange: r = 1.6 }) {
  const o = G((S) => S.registerPlot), s = G((S) => S.unregisterPlot), i = G((S) => S.plots[t]), a = G((S) => S.till), d = G((S) => S.plant), l = G((S) => S.water), c = G((S) => S.harvest), f = G((S) => S.tick);
  I(() => (o({ id: t, position: n }), () => s(t)), [t, n, o, s]), I(() => {
    let S = 0;
    const C = O.subscribe((M) => {
      M.totalMinutes !== S && (S = M.totalMinutes, f(M.totalMinutes));
    });
    return f(O.getState().totalMinutes), C;
  }, [f]);
  const p = q((S) => {
    const C = G.getState().plots[t];
    if (!(!C || !Se(C, S, r))) {
      if (C.state === "mature") return c(t) ? !0 : void 0;
      if (C.state === "empty") {
        const M = a(t);
        return M && D("info", "땅을 갈았다"), M ? !0 : void 0;
      }
    }
  }, [t, r, a, c]), g = q((S) => {
    const C = G.getState().plots[t];
    if (!C || !Se(C, S, r) || C.state !== "tilled") return;
    const M = E.getState().getEquipped();
    if (!M) return;
    const L = J().bySeedItemId(M.itemId);
    if (!L) return;
    const y = O.getState().totalMinutes;
    return d(t, L.id, y) ? !0 : void 0;
  }, [t, r, d]), k = q((S) => {
    const C = G.getState().plots[t];
    if (!C || !Se(C, S, r) || C.state !== "planted" && C.state !== "dried") return;
    const M = O.getState().totalMinutes, L = l(t, M);
    return L && D("info", "물을 줬다"), L ? !0 : void 0;
  }, [t, r, l]);
  be("shovel", p), be("seed", g), be("water", k);
  const w = i?.cropId ? J().get(i.cropId) : void 0, b = w ? w.stages[i.stageIndex] : void 0, h = z(() => !i || i.state === "empty" ? "#5a3f24" : i.state === "tilled" ? "#4a2f18" : i.state === "dried" ? "#6b5230" : "#3a2810", [i]), v = B(null);
  return V(({ clock: S }) => {
    const C = v.current;
    if (!C) return;
    const M = S.elapsedTime;
    C.rotation.y = Math.sin(M * 0.4) * 0.05, C.position.y = (b?.scale ?? 0.3) * 0.5 + Math.sin(M * 1.2) * 0.01;
  }), /* @__PURE__ */ m("group", { position: n, children: [
    /* @__PURE__ */ m("mesh", { receiveShadow: !0, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: [
      /* @__PURE__ */ u("planeGeometry", { args: [e, e] }),
      /* @__PURE__ */ u("meshToonMaterial", { color: h })
    ] }),
    i && (i.state === "planted" || i.state === "mature" || i.state === "dried") && w && b && /* @__PURE__ */ m("mesh", { ref: v, castShadow: !0, position: [0, b.scale * 0.5, 0], children: [
      /* @__PURE__ */ u("coneGeometry", { args: [Math.max(0.08, b.scale * 0.35), Math.max(0.16, b.scale * 0.9), 10] }),
      /* @__PURE__ */ u("meshToonMaterial", { color: i.state === "dried" ? "#7a6a4a" : b.color ?? "#9adf90" })
    ] }),
    i?.state === "mature" && /* @__PURE__ */ m("mesh", { position: [0, 1, 0], children: [
      /* @__PURE__ */ u("ringGeometry", { args: [0.18, 0.24, 16] }),
      /* @__PURE__ */ u("meshBasicMaterial", { color: "#ffd84a", transparent: !0, opacity: 0.85, depthWrite: !1 })
    ] })
  ] });
}
const sn = [
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
let Ve = !1;
function oo() {
  Ve || (Ve = !0, J().registerAll(sn));
}
const an = {
  sunny: { sym: "O", color: "#ffd84a", label: "맑음" },
  cloudy: { sym: "c", color: "#aab2bc", label: "흐림" },
  rain: { sym: "r", color: "#4aa8ff", label: "비" },
  snow: { sym: "*", color: "#dff0ff", label: "눈" },
  storm: { sym: "!", color: "#7f7fff", label: "폭풍" }
};
function so({ position: t = "top-left" }) {
  const n = Q((o) => o.current);
  if (!n) return null;
  const e = an[n.kind], r = t === "top-right" ? { top: 50, right: 12 } : { top: 50, left: 12 };
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
        boxShadow: `inset 0 0 0 1px ${e.color}55`,
        pointerEvents: "none",
        userSelect: "none",
        ...r
      },
      children: [
        /* @__PURE__ */ u("span", { style: {
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: e.color,
          color: "#1a1a1a",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 11
        }, children: e.sym }),
        /* @__PURE__ */ u("span", { children: e.label })
      ]
    }
  );
}
function io({ area: t = 80, height: n = 18, count: e = 1200 }) {
  const r = Q((d) => d.current), o = B(null), { geometry: s, material: i, kind: a } = z(() => {
    if (!r || r.kind !== "rain" && r.kind !== "snow" && r.kind !== "storm")
      return { geometry: null, material: null, kind: null };
    const d = new Float32Array(e * 3), l = new Float32Array(e);
    for (let g = 0; g < e; g++)
      d[g * 3 + 0] = (Math.random() - 0.5) * t, d[g * 3 + 1] = Math.random() * n, d[g * 3 + 2] = (Math.random() - 0.5) * t, l[g] = r.kind === "snow" ? 0.6 + Math.random() * 0.4 : 8 + Math.random() * 6;
    const c = new x.BufferGeometry();
    c.setAttribute("position", new x.BufferAttribute(d, 3)), c.setAttribute("aSpeed", new x.BufferAttribute(l, 1));
    const f = r.kind === "snow", p = new x.PointsMaterial({
      color: f ? 16777215 : 10148351,
      size: f ? 0.18 : 0.12,
      transparent: !0,
      opacity: f ? 0.85 : 0.6,
      depthWrite: !1,
      sizeAttenuation: !0
    });
    return { geometry: c, material: p, kind: r.kind };
  }, [r?.kind, r?.intensity, t, n, e]);
  return V((d, l) => {
    if (!o.current || !s || !a) return;
    const f = s.getAttribute("position"), p = s.getAttribute("aSpeed"), g = f.array, k = p.array, w = a === "snow" ? 1 : 6;
    for (let b = 0; b < g.length; b += 3)
      g[b + 1] -= k[b / 3] * l * w, a === "snow" && (g[b + 0] += Math.sin((g[b + 1] + b) * 0.5) * l * 0.3), g[b + 1] < 0 && (g[b + 0] = (Math.random() - 0.5) * t, g[b + 1] = n, g[b + 2] = (Math.random() - 0.5) * t);
    f.needsUpdate = !0;
  }), !s || !i ? null : /* @__PURE__ */ u("points", { ref: o, geometry: s, material: i, frustumCulled: !1 });
}
function ao(t = !0) {
  I(() => {
    if (!t) return;
    const n = () => {
      const r = O.getState(), o = Math.floor(r.totalMinutes / (60 * 24)), s = Q.getState().current;
      (!s || s.day !== o) && Q.getState().rollForDay(o, r.time.season);
    };
    return n(), O.subscribe((r, o) => {
      const s = Math.floor(r.totalMinutes / 1440), i = Math.floor(o.totalMinutes / (60 * 24));
      s !== i && n();
    });
  }, [t]);
}
function He(t, n) {
  return { id: t, position: n, size: [4, 4], state: "empty" };
}
const H = W((t, n) => ({
  houses: {},
  residents: {},
  decorationScore: 0,
  registerHouse: (e) => {
    if (n().houses[e.id]) return;
    const o = { ...He(e.id, e.position), ...e };
    t({ houses: { ...n().houses, [e.id]: o } });
  },
  unregisterHouse: (e) => {
    const r = { ...n().houses };
    r[e] && (delete r[e], t({ houses: r }));
  },
  registerResident: (e) => {
    n().residents[e.id] || t({ residents: { ...n().residents, [e.id]: e } });
  },
  removeResident: (e) => {
    const r = { ...n().residents };
    if (r[e]) {
      delete r[e], t({ residents: r });
      for (const o of Object.values(n().houses))
        o.residentId === e && n().moveOut(o.id), o.reservedFor === e && n().cancelReservation(o.id);
    }
  },
  reserveHouse: (e, r, o) => {
    const s = n().houses[e];
    return !s || s.state !== "empty" ? !1 : (t({
      houses: {
        ...n().houses,
        [e]: {
          ...s,
          state: "reserved",
          reservedFor: r,
          ...o !== void 0 ? { reservedUntilDay: o } : {}
        }
      }
    }), !0);
  },
  cancelReservation: (e) => {
    const r = n().houses[e];
    if (!r || r.state !== "reserved") return;
    const o = { ...r, state: "empty" };
    delete o.reservedFor, delete o.reservedUntilDay, t({ houses: { ...n().houses, [e]: o } });
  },
  moveIn: (e, r, o) => {
    const s = n().houses[e], i = n().residents[r];
    return !s || !i || s.state === "occupied" ? !1 : (t({
      houses: {
        ...n().houses,
        [e]: {
          ...s,
          state: "occupied",
          residentId: r
        }
      },
      residents: {
        ...n().residents,
        [r]: { ...i, movedInDay: o }
      }
    }), D("reward", `${i.name}이(가) 이사 왔다!`), !0);
  },
  moveOut: (e) => {
    const r = n().houses[e];
    if (!r || r.state !== "occupied") return !1;
    const o = r.residentId ? n().residents[r.residentId] : null;
    return t({
      houses: {
        ...n().houses,
        [e]: He(e, r.position)
      }
    }), o && D("info", `${o.name}이(가) 떠났다`), !0;
  },
  setDecorationScore: (e) => t({ decorationScore: Math.max(0, Math.floor(e)) }),
  stats: () => {
    const e = Object.values(n().houses), r = e.filter((o) => o.state === "occupied").length;
    return {
      decorationScore: n().decorationScore,
      residentCount: Object.keys(n().residents).length,
      occupiedHouses: r,
      totalHouses: e.length
    };
  },
  serialize: () => ({
    version: 1,
    houses: Object.values(n().houses).map((e) => ({ ...e })),
    residents: Object.values(n().residents).map((e) => ({ ...e }))
  }),
  hydrate: (e) => {
    if (!e) return;
    const r = {}, o = {};
    if (Array.isArray(e.houses))
      for (const s of e.houses) s?.id && (r[s.id] = { ...s });
    if (Array.isArray(e.residents))
      for (const s of e.residents) s?.id && (o[s.id] = { ...s });
    t({ houses: r, residents: o });
  }
})), ln = {
  tile: 2,
  wall: 1,
  placedObject: 5,
  base: 0
};
function lo(t = !0, n = {}) {
  I(() => {
    if (!t) return;
    const e = { ...ln, ...n }, r = (s) => {
      let i = 0, a = 0;
      const d = s.objects.length;
      for (const c of s.tileGroups.values())
        i += c.tiles.length;
      for (const c of s.wallGroups.values())
        a += c.walls.length;
      const l = e.base + i * e.tile + a * e.wall + d * e.placedObject;
      H.getState().setDecorationScore(l);
    };
    return r(fe.getState()), fe.subscribe((s) => r(s));
  }, [t, n.tile, n.wall, n.placedObject, n.base]);
}
function co({
  id: t,
  position: n,
  size: e = [4, 4],
  emptyColor: r = "#705038",
  reservedColor: o = "#c8a85a",
  occupiedColor: s = "#5a8acf"
}) {
  const i = H((g) => g.registerHouse), a = H((g) => g.unregisterHouse), d = H((g) => g.houses[t]), l = H((g) => g.residents);
  I(() => (i({ id: t, position: n, size: e }), () => a(t)), [t, n, e, i, a]);
  const c = d ? d.state === "occupied" ? s : d.state === "reserved" ? o : r : r, f = d?.residentId ? l[d.residentId] : null, p = z(() => new x.PlaneGeometry(e[0], e[1]), [e[0], e[1]]);
  return /* @__PURE__ */ m("group", { position: n, children: [
    /* @__PURE__ */ u("mesh", { geometry: p, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: /* @__PURE__ */ u("meshToonMaterial", { color: c, transparent: !0, opacity: 0.7 }) }),
    d?.state === "occupied" && f && /* @__PURE__ */ m($, { children: [
      /* @__PURE__ */ m("mesh", { position: [0, 0.6, 0], castShadow: !0, children: [
        /* @__PURE__ */ u("boxGeometry", { args: [Math.max(1.4, e[0] * 0.6), 1.2, Math.max(1.4, e[1] * 0.6)] }),
        /* @__PURE__ */ u("meshToonMaterial", { color: f.bodyColor ?? "#e8d8b8" })
      ] }),
      /* @__PURE__ */ m("mesh", { position: [0, 1.5, 0], castShadow: !0, children: [
        /* @__PURE__ */ u("coneGeometry", { args: [Math.max(1, e[0] * 0.45), 0.7, 4] }),
        /* @__PURE__ */ u("meshToonMaterial", { color: f.hatColor ?? "#a85a5a" })
      ] })
    ] }),
    d?.state === "reserved" && /* @__PURE__ */ m("mesh", { position: [0, 0.5, 0], children: [
      /* @__PURE__ */ u("boxGeometry", { args: [0.4, 1, 0.4] }),
      /* @__PURE__ */ u("meshToonMaterial", { color: o })
    ] })
  ] });
}
function uo({ position: t = "top-right", offset: n }) {
  const e = H((c) => c.decorationScore), r = H((c) => c.houses), o = H((c) => c.residents), s = Object.keys(r).length, i = Object.values(r).filter((c) => c.state === "occupied").length, a = Object.keys(o).length, l = { ...t === "bottom-right" ? { bottom: 12, right: 100 } : t === "top-left" ? { top: 160, left: 12 } : t === "bottom-left" ? { bottom: 12, left: 240 } : { top: 50, right: 12 }, ...n ?? {} };
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
        ...l
      },
      children: [
        /* @__PURE__ */ m("div", { children: [
          "마을 점수 ",
          /* @__PURE__ */ u("span", { style: { color: "#ffd84a", fontWeight: 700 }, children: e })
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
class cn {
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
    const e = this.ctx.createOscillator(), r = this.ctx.createGain();
    e.type = n.type ?? "sine", e.frequency.value = n.freq ?? 440;
    const o = n.duration ?? 0.12, s = this.ctx.currentTime;
    r.gain.setValueAtTime(0, s), r.gain.linearRampToValueAtTime((n.volume ?? 1) * 0.3, s + 5e-3), r.gain.exponentialRampToValueAtTime(1e-4, s + o), e.connect(r), r.connect(this.sfxGain), e.start(s), e.stop(s + o + 0.05);
  }
  playBgm(n) {
    if (!this.ensure() || !this.ctx || !this.bgmGain || (this.stopBgm(), !n)) return;
    if (this.currentBgm = n, n.url) {
      this.playFromUrl(n.url, this.bgmGain, n.volume ?? 1, !0);
      return;
    }
    const e = n.pattern ?? [0, 4, 7, 4], r = n.intervalMs ?? 800, o = n.baseFreq ?? 220;
    this.bgmStep = 0;
    const s = () => {
      if (!this.ctx || !this.bgmGain) return;
      const i = e[this.bgmStep % e.length] ?? 0, a = o * Math.pow(2, i / 12), d = this.ctx.createOscillator(), l = this.ctx.createGain();
      d.type = "triangle", d.frequency.value = a;
      const c = this.ctx.currentTime;
      l.gain.setValueAtTime(0, c), l.gain.linearRampToValueAtTime((n.volume ?? 1) * 0.18, c + 0.04), l.gain.exponentialRampToValueAtTime(1e-4, c + r / 1e3 * 0.95), d.connect(l), l.connect(this.bgmGain), d.start(c), d.stop(c + r / 1e3 + 0.05), this.bgmStep += 1;
    };
    s(), this.bgmInterval = window.setInterval(s, r);
  }
  stopBgm() {
    this.bgmInterval !== null && (window.clearInterval(this.bgmInterval), this.bgmInterval = null), this.currentBgm = null;
  }
  getCurrentBgmId() {
    return this.currentBgm?.id ?? null;
  }
  async playFromUrl(n, e, r, o = !1) {
    if (this.ctx)
      try {
        let s = this.bufferCache.get(n);
        if (!s) {
          const l = await (await fetch(n)).arrayBuffer();
          s = await this.ctx.decodeAudioData(l), this.bufferCache.set(n, s);
        }
        const i = this.ctx.createBufferSource();
        i.buffer = s, i.loop = o;
        const a = this.ctx.createGain();
        a.gain.value = r, i.connect(a), a.connect(e), i.start();
      } catch {
      }
  }
}
let ke = null;
function ne() {
  return ke || (ke = new cn()), ke;
}
const U = W((t, n) => ({
  masterMuted: !1,
  bgmMuted: !1,
  sfxMuted: !1,
  masterVolume: 0.6,
  bgmVolume: 0.4,
  sfxVolume: 0.7,
  currentBgmId: null,
  setMaster: (e) => {
    t({ masterVolume: Math.max(0, Math.min(1, e)) }), n().apply();
  },
  setBgm: (e) => {
    t({ bgmVolume: Math.max(0, Math.min(1, e)) }), n().apply();
  },
  setSfx: (e) => {
    t({ sfxVolume: Math.max(0, Math.min(1, e)) }), n().apply();
  },
  toggleMaster: () => {
    t({ masterMuted: !n().masterMuted }), n().apply();
  },
  toggleBgm: () => {
    t({ bgmMuted: !n().bgmMuted }), n().apply();
  },
  toggleSfx: () => {
    t({ sfxMuted: !n().sfxMuted }), n().apply();
  },
  playSfx: (e) => {
    const r = n();
    r.masterMuted || r.sfxMuted || (ne().resume(), ne().playSfx(e));
  },
  playBgm: (e) => {
    ne().resume(), ne().playBgm(e), t({ currentBgmId: e?.id ?? null }), n().apply();
  },
  stopBgm: () => {
    ne().stopBgm(), t({ currentBgmId: null });
  },
  apply: () => {
    const e = n(), r = ne();
    r.setMasterVolume(e.masterMuted ? 0 : e.masterVolume), r.setBgmVolume(e.bgmMuted ? 0 : e.bgmVolume), r.setSfxVolume(e.sfxMuted ? 0 : e.sfxVolume);
  },
  serialize: () => {
    const e = n();
    return {
      version: 1,
      masterMuted: e.masterMuted,
      bgmMuted: e.bgmMuted,
      sfxMuted: e.sfxMuted,
      masterVolume: e.masterVolume,
      bgmVolume: e.bgmVolume,
      sfxVolume: e.sfxVolume
    };
  },
  hydrate: (e) => {
    e && (t({
      masterMuted: !!e.masterMuted,
      bgmMuted: !!e.bgmMuted,
      sfxMuted: !!e.sfxMuted,
      masterVolume: typeof e.masterVolume == "number" ? e.masterVolume : 0.6,
      bgmVolume: typeof e.bgmVolume == "number" ? e.bgmVolume : 0.4,
      sfxVolume: typeof e.sfxVolume == "number" ? e.sfxVolume : 0.7
    }), n().apply());
  }
})), dn = [0, 2, 4, 5, 7, 9, 11], un = [0, 2, 3, 5, 7, 8, 10];
function fn(t) {
  return t === "rain" || t === "storm" || t === "snow" ? un : dn;
}
function pn(t) {
  return t < 6 ? "night" : t < 10 ? "dawn" : t < 18 ? "day" : t < 22 ? "dusk" : "night";
}
function mn(t, n) {
  const e = pn(t), r = fn(n), o = e === "night" ? 174.6 : e === "dawn" ? 220 : e === "dusk" ? 196 : 261.6, s = e === "day" ? 700 : 950, i = [r[0], r[2], r[4], r[2], r[0], r[3], r[1], r[4]];
  return {
    id: `bgm.${e}.${n ?? "unknown"}`,
    baseFreq: o,
    intervalMs: s,
    pattern: i,
    volume: n === "storm" ? 0.6 : 1
  };
}
function fo(t = !0) {
  I(() => {
    if (!t) return;
    const n = () => {
      const o = O.getState(), s = Q.getState().current, i = mn(o.time.hour, s?.kind);
      U.getState().currentBgmId !== i.id && U.getState().playBgm(i);
    }, e = O.subscribe((o, s) => {
      o.time.hour !== s.time.hour && n();
    }), r = Q.subscribe((o, s) => {
      o.current?.kind !== s.current?.kind && n();
    });
    return n(), () => {
      e(), r(), U.getState().stopBgm();
    };
  }, [t]);
}
function po({ position: t = "bottom-right", offset: n }) {
  const e = U((f) => f.masterMuted), r = U((f) => f.bgmMuted), o = U((f) => f.sfxMuted), s = U((f) => f.toggleMaster), i = U((f) => f.toggleBgm), a = U((f) => f.toggleSfx), l = { ...t === "top-right" ? { top: 50, right: 200 } : t === "bottom-left" ? { bottom: 12, left: 240 } : t === "top-left" ? { top: 220, left: 12 } : { bottom: 12, right: 110 }, ...n ?? {} }, c = (f, p, g) => /* @__PURE__ */ m(
    "button",
    {
      onClick: g,
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
        f,
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
        ...l
      },
      children: [
        c("M", e, s),
        c("Bgm", r, i),
        c("Sfx", o, a)
      ]
    }
  );
}
const gn = {
  grass: { freq: 320, duration: 0.07, type: "triangle", volume: 0.18 },
  sand: { freq: 220, duration: 0.1, type: "sine", volume: 0.2 },
  snow: { freq: 380, duration: 0.1, type: "triangle", volume: 0.22 },
  wood: { freq: 540, duration: 0.06, type: "square", volume: 0.14 },
  stone: { freq: 760, duration: 0.05, type: "square", volume: 0.16 },
  water: { freq: 180, duration: 0.13, type: "sine", volume: 0.24 }
};
function hn(t, n) {
  const e = wt.GRID_CELL_SIZE, r = fe.getState().tileGroups;
  for (const o of r.values())
    for (const s of o.tiles) {
      const i = (s.size || 1) * e / 2;
      if (!(Math.abs(s.position.x - t) > i) && !(Math.abs(s.position.z - n) > i)) {
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
function mo({
  strideMeters: t = 0.65,
  maxStepsPerSecond: n = 6,
  volume: e = 1,
  resolveSurface: r = hn,
  enabled: o = !0
} = {}) {
  const { position: s, isGrounded: i, isMoving: a, speed: d } = ee({ updateInterval: 32 }), l = B({ x: s.x, z: s.z }), c = B(0), f = B(0);
  return I(() => {
    l.current.x = s.x, l.current.z = s.z;
  }, []), V(() => {
    if (!o) return;
    const p = performance.now(), g = s.x - l.current.x, k = s.z - l.current.z;
    if (l.current.x = s.x, l.current.z = s.z, !i || !a) {
      c.current = 0;
      return;
    }
    const w = Math.hypot(g, k);
    if (w <= 0 || (c.current += w, c.current < t) || p - f.current < 1e3 / n) return;
    c.current = 0, f.current = p;
    const b = r(s.x, s.z), h = gn[b], v = Math.min(1.4, 0.7 + d * 0.06);
    U.getState().playSfx({
      id: `footstep-${b}`,
      type: h.type ?? "sine",
      freq: h.freq ?? 320,
      duration: h.duration ?? 0.08,
      volume: (h.volume ?? 0.2) * e * v
    });
  }), null;
}
const yn = [
  { key: "body", label: "피부" },
  { key: "hair", label: "머리" },
  { key: "hat", label: "모자" },
  { key: "top", label: "상의" },
  { key: "bottom", label: "하의" },
  { key: "shoes", label: "신발" }
], bn = ["short", "long", "cap", "bun", "spiky"], xn = ["default", "smile", "wink", "sleepy", "surprised"], Ye = ["hat", "top", "bottom", "shoes", "face", "weapon", "accessory"], wn = (t, n) => n === "weapon" ? t.kind === "weapon" || t.slot === "weapon" : t.slot === n && (t.kind === "characterPart" || t.kind === "weapon");
function go({ toggleKey: t, open: n, onClose: e } = {}) {
  const r = typeof n == "boolean", [o, s] = F(!1), i = r ? n : o, a = N((y) => y.appearance), d = N((y) => y.outfits), l = N((y) => y.setName), c = N((y) => y.setColor), f = N((y) => y.setHair), p = N((y) => y.setFace), g = N((y) => y.equipOutfit), k = N((y) => y.resetAppearance), w = ze((y) => y.ids), b = ze((y) => y.records), [h, v] = F(""), [S, C] = F(!1), M = z(() => {
    const y = h.trim().toLowerCase();
    return Ye.reduce((P, T) => (P[T] = w.map((R) => b[R]).filter((R) => !!R).filter((R) => wn(R, T)).filter((R) => y ? R.tags?.some((A) => A.toLowerCase().includes(y)) ?? !1 : !0).filter((R) => !S || R.metadata?.owned !== !1), P), {});
  }, [w, b, S, h]);
  if (I(() => {
    if (!t || r) return;
    const y = (P) => {
      const T = P.target?.tagName?.toLowerCase();
      if (T === "input" || T === "textarea") return;
      const R = t.toLowerCase(), A = `Key${t.toUpperCase()}`;
      P.code !== A && P.key.toLowerCase() !== R || s((te) => !te);
    };
    return window.addEventListener("keydown", y), () => window.removeEventListener("keydown", y);
  }, [t, r]), !i) return null;
  const L = () => {
    r ? e?.() : s(!1);
  };
  return /* @__PURE__ */ u(
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
      onClick: L,
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
              /* @__PURE__ */ u("h2", { style: { margin: 0, fontSize: 16, fontWeight: 600, flex: 1 }, children: "캐릭터 만들기" }),
              /* @__PURE__ */ u(
                "button",
                {
                  onClick: k,
                  style: Ce,
                  children: "기본값"
                }
              ),
              /* @__PURE__ */ u("button", { onClick: L, style: Ce, children: "닫기" })
            ] }),
            /* @__PURE__ */ m("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ u("label", { style: se, children: "이름" }),
              /* @__PURE__ */ u(
                "input",
                {
                  value: a.name,
                  onChange: (y) => l(y.target.value),
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
              /* @__PURE__ */ u("label", { style: se, children: "색상" }),
              /* @__PURE__ */ u("div", { style: Ke, children: yn.map(({ key: y, label: P }) => /* @__PURE__ */ m("div", { style: vn, children: [
                /* @__PURE__ */ u("span", { style: { flex: 1 }, children: P }),
                /* @__PURE__ */ u(
                  "input",
                  {
                    type: "color",
                    value: a.colors[y],
                    onChange: (T) => c(y, T.target.value),
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
              /* @__PURE__ */ u("label", { style: se, children: "헤어" }),
              /* @__PURE__ */ u("div", { style: Xe, children: bn.map((y) => /* @__PURE__ */ u(
                "button",
                {
                  onClick: () => f(y),
                  style: Qe(a.hair === y),
                  children: gt[y]
                },
                y
              )) })
            ] }),
            /* @__PURE__ */ m("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ u("label", { style: se, children: "표정" }),
              /* @__PURE__ */ u("div", { style: Xe, children: xn.map((y) => /* @__PURE__ */ u(
                "button",
                {
                  onClick: () => p(y),
                  style: Qe(a.face === y),
                  children: ht[y]
                },
                y
              )) })
            ] }),
            /* @__PURE__ */ m("section", { children: [
              /* @__PURE__ */ m("div", { style: Sn, children: [
                /* @__PURE__ */ u("label", { style: { ...se, marginBottom: 0 }, children: "장착 슬롯" }),
                /* @__PURE__ */ u(
                  "input",
                  {
                    value: h,
                    onChange: (y) => v(y.target.value),
                    placeholder: "태그 검색",
                    style: kn
                  }
                ),
                /* @__PURE__ */ m("label", { style: Cn, children: [
                  /* @__PURE__ */ u(
                    "input",
                    {
                      type: "checkbox",
                      checked: S,
                      onChange: (y) => C(y.target.checked)
                    }
                  ),
                  "보유만"
                ] })
              ] }),
              /* @__PURE__ */ u("div", { style: Ke, children: Ye.map((y) => /* @__PURE__ */ m("div", { style: In, children: [
                /* @__PURE__ */ m("div", { style: Mn, children: [
                  /* @__PURE__ */ u("span", { children: yt[y] }),
                  /* @__PURE__ */ u("span", { style: { color: d[y] ? "#7adf90" : "rgba(243,244,248,0.45)" }, children: d[y] ?? "비어있음" }),
                  /* @__PURE__ */ u("button", { onClick: () => g(y, null), style: Ce, children: "비우기" })
                ] }),
                /* @__PURE__ */ m("div", { style: Rn, children: [
                  M[y].map((P) => /* @__PURE__ */ m(
                    "button",
                    {
                      onClick: () => g(y, P.id),
                      style: Pn(d[y] === P.id),
                      children: [
                        /* @__PURE__ */ u(It, { asset: P, size: 58 }),
                        /* @__PURE__ */ u("span", { style: En, children: P.name })
                      ]
                    },
                    P.id
                  )),
                  M[y].length === 0 && /* @__PURE__ */ u("span", { style: An, children: "사용 가능한 에셋 없음" })
                ] })
              ] }, y)) })
            ] })
          ]
        }
      )
    }
  );
}
const se = {
  display: "block",
  marginBottom: 6,
  fontSize: 11.5,
  fontWeight: 600,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: "rgba(243,244,248,0.62)"
}, Ke = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, vn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 8
}, Xe = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
}, Qe = (t) => ({
  padding: "6px 12px",
  borderRadius: 999,
  border: t ? "1px solid #ffd84a" : "1px solid rgba(255,255,255,0.14)",
  background: t ? "rgba(255,216,74,0.12)" : "rgba(255,255,255,0.04)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}), Ce = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}, Sn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8
}, kn = {
  flex: 1,
  minWidth: 120,
  padding: "6px 9px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f3f4f8",
  fontFamily: "inherit",
  fontSize: 12
}, Cn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  color: "rgba(243,244,248,0.72)",
  fontSize: 12
}, In = {
  padding: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10
}, Mn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8
}, Rn = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, Pn = (t) => ({
  display: "grid",
  gridTemplateColumns: "58px minmax(0, 1fr)",
  alignItems: "center",
  gap: 8,
  minHeight: 70,
  padding: 6,
  borderRadius: 10,
  border: t ? "1px solid #7bd3a7" : "1px solid rgba(255,255,255,0.10)",
  background: t ? "rgba(123,211,167,0.14)" : "rgba(255,255,255,0.035)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  textAlign: "left"
}), En = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 12,
  fontWeight: 600
}, An = {
  gridColumn: "1 / -1",
  padding: "10px 8px",
  color: "rgba(243,244,248,0.45)",
  fontSize: 12
};
function Bn(t) {
  return z(() => {
    switch (t) {
      case "long":
        return {
          geometry: new x.SphereGeometry(0.28, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65),
          position: [0, -0.05, 0],
          scale: [1.05, 1.55, 1.05]
        };
      case "cap":
        return {
          geometry: new x.CylinderGeometry(0.32, 0.34, 0.18, 16),
          position: [0, 0.1, 0],
          scale: [1, 1, 1]
        };
      case "bun":
        return {
          geometry: new x.SphereGeometry(0.22, 12, 10),
          position: [0, 0.18, -0.05],
          scale: [1, 1, 1]
        };
      case "spiky":
        return {
          geometry: new x.ConeGeometry(0.32, 0.36, 8),
          position: [0, 0.15, 0],
          scale: [1, 1, 1]
        };
      case "short":
      default:
        return {
          geometry: new x.SphereGeometry(0.3, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
          position: [0, 0.05, 0],
          scale: [1, 1, 1]
        };
    }
  }, [t]);
}
function ho({
  headHeight: t = 1.55,
  enabled: n = !0,
  opacity: e = 1
} = {}) {
  const r = B(null), o = N((f) => f.appearance), s = N((f) => f.outfits), { position: i, rotation: a } = ee({ updateInterval: 16 }), d = Bn(o.hair);
  if (V(() => {
    const f = r.current;
    f && (f.position.set(i.x, i.y + t, i.z), f.rotation.set(0, a.y, 0));
  }), !n) return null;
  const l = !!s.hat, c = x.MathUtils.clamp(e, 0, 1);
  return /* @__PURE__ */ m("group", { ref: r, dispose: null, children: [
    !l && /* @__PURE__ */ m("mesh", { position: d.position, scale: d.scale, castShadow: !0, children: [
      /* @__PURE__ */ u("primitive", { object: d.geometry, attach: "geometry" }),
      /* @__PURE__ */ u(
        "meshStandardMaterial",
        {
          color: o.colors.hair,
          roughness: 0.85,
          metalness: 0.05,
          transparent: c < 1,
          opacity: c
        }
      )
    ] }),
    l && /* @__PURE__ */ m("group", { position: [0, 0.1, 0], children: [
      /* @__PURE__ */ m("mesh", { castShadow: !0, children: [
        /* @__PURE__ */ u("cylinderGeometry", { args: [0.34, 0.34, 0.22, 18] }),
        /* @__PURE__ */ u(
          "meshStandardMaterial",
          {
            color: o.colors.hat,
            roughness: 0.7,
            metalness: 0.05,
            transparent: c < 1,
            opacity: c
          }
        )
      ] }),
      /* @__PURE__ */ m("mesh", { position: [0, -0.1, 0], children: [
        /* @__PURE__ */ u("cylinderGeometry", { args: [0.5, 0.5, 0.04, 24] }),
        /* @__PURE__ */ u(
          "meshStandardMaterial",
          {
            color: o.colors.hat,
            roughness: 0.7,
            metalness: 0.05,
            transparent: c < 1,
            opacity: c
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ u(Ln, { style: o.face, opacity: c })
  ] });
}
function Ln({ style: t, opacity: n }) {
  const e = z(() => {
    switch (t) {
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
  }, [t]);
  return /* @__PURE__ */ m("group", { position: [0, -0.18, 0.32], children: [
    /* @__PURE__ */ m("mesh", { position: [-0.13, 0, 0], children: [
      /* @__PURE__ */ u("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ u("meshBasicMaterial", { color: e, transparent: !0, opacity: n * 0.6 })
    ] }),
    /* @__PURE__ */ m("mesh", { position: [0.13, 0, 0], children: [
      /* @__PURE__ */ u("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ u("meshBasicMaterial", { color: e, transparent: !0, opacity: n * 0.6 })
    ] })
  ] });
}
const On = (t) => t?.url ? t.kind === "characterPart" || t.kind === "weapon" : !1, zn = (t) => ({
  id: t.id,
  ...t.slot ? { slot: t.slot } : {},
  url: t.url,
  ...t.colors?.primary ? { color: t.colors.primary } : {}
});
function yo({
  baseParts: t = [],
  outfits: n,
  assets: e
}) {
  const r = Object.values(n).map((i) => i ? e[i] : void 0).filter(On).map(zn);
  if (r.length === 0)
    return t.map((i) => ({ ...i }));
  const o = new Set(r.map((i) => i.slot).filter(Boolean)), s = t.filter((i) => !i.slot || !o.has(i.slot)).map((i) => ({ ...i }));
  for (const i of r)
    s.some((a) => a.url === i.url && a.slot === i.slot) || s.push(i);
  return s;
}
function bo({
  capacity: t = 64,
  step: n = 0.55,
  lifetime: e = 9,
  size: r = 0.34,
  y: o = 0.02,
  color: s = "#1a1612"
} = {}) {
  const i = B(null), { position: a, isMoving: d, isGrounded: l } = ee({ updateInterval: 32 }), c = z(() => new x.Color(s), [s]), f = z(
    () => Array.from({ length: t }, () => ({
      x: 0,
      z: 0,
      bornAt: -1 / 0,
      side: 1
    })),
    [t]
  ), p = B(null), g = B(0), k = B(1), w = z(() => {
    const S = new x.PlaneGeometry(1, 1);
    return S.rotateX(-Math.PI / 2), S;
  }, []), b = z(
    () => new x.MeshBasicMaterial({
      color: c,
      transparent: !0,
      opacity: 0.42,
      depthWrite: !1,
      polygonOffset: !0,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    }),
    [c]
  );
  I(() => () => {
    w.dispose(), b.dispose();
  }, [w, b]);
  const h = z(() => new x.Object3D(), []), v = z(() => new x.Color(), []);
  return V((S) => {
    const C = i.current;
    if (!C) return;
    const M = S.clock.elapsedTime;
    if (l && d) {
      const y = p.current, P = a.x - (y?.x ?? a.x), T = a.z - (y?.z ?? a.z), R = Math.hypot(P, T);
      if (!y || R >= n) {
        const A = f[g.current];
        A && (A.x = a.x, A.z = a.z, A.bornAt = M, A.side = k.current, k.current = k.current === 1 ? -1 : 1, g.current = (g.current + 1) % t, p.current = { x: a.x, z: a.z });
      }
    }
    let L = 0;
    for (let y = 0; y < t; y++) {
      const P = f[y];
      if (!P) continue;
      const T = M - P.bornAt;
      if (T < 0 || T > e) continue;
      const R = 1 - T / e;
      h.position.set(P.x + P.side * 0.07, o, P.z), h.rotation.set(0, 0, 0), h.scale.set(r, 1, r * 1.4), h.updateMatrix(), C.setMatrixAt(L, h.matrix), v.copy(c).multiplyScalar(0.6 + R * 0.4), C.setColorAt(L, v), L++;
    }
    C.count = L, C.instanceMatrix.needsUpdate = !0, C.instanceColor && (C.instanceColor.needsUpdate = !0);
  }), /* @__PURE__ */ u(
    "instancedMesh",
    {
      ref: i,
      args: [w, b, t],
      frustumCulled: !1,
      renderOrder: 1
    }
  );
}
const xo = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
}, ue = "ko";
function Tn() {
  if (typeof navigator > "u") return ue;
  const t = (navigator.language || ue).slice(0, 2).toLowerCase();
  return t === "ko" || t === "en" || t === "ja" ? t : ue;
}
function Ie(t, n) {
  return n ? t.replace(/\{(\w+)\}/g, (e, r) => {
    const o = n[r];
    return o == null ? `{${r}}` : String(o);
  }) : t;
}
const ae = W((t, n) => ({
  locale: Tn(),
  bundle: { ko: {}, en: {}, ja: {} },
  setLocale: (e) => t({ locale: e }),
  registerMessages: (e, r) => {
    const o = n().bundle;
    t({
      bundle: {
        ...o,
        [e]: { ...o[e], ...r }
      }
    });
  },
  registerBundle: (e) => {
    const r = n().bundle, o = { ...r };
    Object.keys(e).forEach((s) => {
      const i = e[s];
      i && (o[s] = { ...r[s], ...i });
    }), t({ bundle: o });
  },
  t: (e, r) => {
    const { locale: o, bundle: s } = n(), i = s[o]?.[e];
    if (i !== void 0) return Ie(i, r);
    const a = s[ue]?.[e];
    return Ie(a !== void 0 ? a : e, r);
  },
  serialize: () => ({ version: 1, locale: n().locale }),
  hydrate: (e) => {
    !e || e.version !== 1 || t({ locale: e.locale });
  }
}));
function wo(t, n) {
  return ae.getState().t(t, n);
}
function vo() {
  const t = ae((e) => e.locale), n = ae((e) => e.bundle);
  return q(
    (e, r) => {
      const o = n[t]?.[e];
      if (o !== void 0) return Me(o, r);
      const s = n.ko?.[e];
      return Me(s !== void 0 ? s : e, r);
    },
    [t, n]
  );
}
function So() {
  const t = ae((e) => e.locale), n = ae((e) => e.setLocale);
  return { locale: t, setLocale: n };
}
function Me(t, n) {
  return n ? t.replace(/\{(\w+)\}/g, (e, r) => {
    const o = n[r];
    return o == null ? `{${r}}` : String(o);
  }) : t;
}
const Dn = [
  { id: "jump", label: "점프", key: " " },
  { id: "use", label: "사용", key: "F" }
];
function Fn() {
  return typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(pointer: coarse)").matches;
}
function Ze(t, n) {
  if (typeof window > "u") return;
  const e = /^[a-zA-Z]$/.test(n) ? `Key${n.toUpperCase()}` : n === " " ? "Space" : n, r = new KeyboardEvent(t, {
    key: n === " " ? " " : n.toLowerCase(),
    code: e,
    bubbles: !0
  });
  window.dispatchEvent(r);
}
function ko({
  forceVisible: t = !1,
  radius: n = 60,
  deadzone: e = 0.18,
  runThreshold: r = 0.8,
  actions: o = Dn
} = {}) {
  const [s, i] = F(!1), a = B(null), d = B(null), l = B({
    pointerId: -1,
    cx: 0,
    cy: 0,
    forward: !1,
    backward: !1,
    leftward: !1,
    rightward: !1,
    run: !1
  });
  return I(() => {
    i(t || Fn());
  }, [t]), I(() => {
    if (!s) return;
    const c = a.current, f = d.current;
    if (!c || !f) return;
    const p = vt.getInstance(), g = () => {
      const h = l.current, v = {};
      h.forward && (v.forward = !1), h.backward && (v.backward = !1), h.leftward && (v.leftward = !1), h.rightward && (v.rightward = !1), h.run && (v.shift = !1), h.forward = h.backward = h.leftward = h.rightward = h.run = !1, Object.keys(v).length > 0 && p.updateKeyboard(v), f.style.transform = "translate(-50%, -50%)", l.current.pointerId = -1;
    }, k = (h) => {
      h.preventDefault();
      const v = c.getBoundingClientRect();
      l.current.cx = v.left + v.width / 2, l.current.cy = v.top + v.height / 2, l.current.pointerId = h.pointerId, c.setPointerCapture(h.pointerId), w(h);
    }, w = (h) => {
      if (h.pointerId !== l.current.pointerId) return;
      const v = h.clientX - l.current.cx, S = h.clientY - l.current.cy, C = Math.hypot(v, S), M = Math.min(C, n), L = Math.atan2(S, v), y = Math.cos(L) * M, P = Math.sin(L) * M;
      f.style.transform = `translate(calc(-50% + ${y}px), calc(-50% + ${P}px))`;
      const T = M / n, R = l.current, A = {};
      if (T < e)
        R.forward && (A.forward = !1, R.forward = !1), R.backward && (A.backward = !1, R.backward = !1), R.leftward && (A.leftward = !1, R.leftward = !1), R.rightward && (A.rightward = !1, R.rightward = !1), R.run && (A.shift = !1, R.run = !1);
      else {
        const te = Math.cos(L), Le = Math.sin(L), pe = Le < -0.35, me = Le > 0.35, ge = te < -0.35, he = te > 0.35, ye = T >= r;
        R.forward !== pe && (A.forward = pe, R.forward = pe), R.backward !== me && (A.backward = me, R.backward = me), R.leftward !== ge && (A.leftward = ge, R.leftward = ge), R.rightward !== he && (A.rightward = he, R.rightward = he), R.run !== ye && (A.shift = ye, R.run = ye);
      }
      Object.keys(A).length > 0 && p.updateKeyboard(A);
    }, b = (h) => {
      h.pointerId === l.current.pointerId && g();
    };
    return c.addEventListener("pointerdown", k), c.addEventListener("pointermove", w), c.addEventListener("pointerup", b), c.addEventListener("pointercancel", b), c.addEventListener("pointerleave", b), () => {
      c.removeEventListener("pointerdown", k), c.removeEventListener("pointermove", w), c.removeEventListener("pointerup", b), c.removeEventListener("pointercancel", b), c.removeEventListener("pointerleave", b), g();
    };
  }, [s, n, e, r]), s ? /* @__PURE__ */ m(
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
        /* @__PURE__ */ u(
          "div",
          {
            ref: a,
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
            children: /* @__PURE__ */ u(
              "div",
              {
                ref: d,
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
        /* @__PURE__ */ u(
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
            children: o.map((c) => /* @__PURE__ */ u(_n, { action: c }, c.id))
          }
        )
      ]
    }
  ) : null;
}
function _n({ action: t }) {
  const [n, e] = F(!1), r = () => {
    e(!0), t.key && Ze("keydown", t.key), t.onPress?.();
  }, o = () => {
    e(!1), t.key && Ze("keyup", t.key), t.onRelease?.();
  };
  return /* @__PURE__ */ u(
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
      children: t.label
    }
  );
}
const de = "outdoor", Re = (t) => new Promise((n) => setTimeout(n, t)), Gn = 220, Wn = 80, Nn = 240, K = W((t, n) => ({
  current: de,
  pending: null,
  scenes: {
    [de]: { id: de, name: "Outdoor", interior: !1 }
  },
  transition: { progress: 0, color: "#000000", active: !1 },
  lastReturnPoint: null,
  registerScene: (e) => t((r) => r.scenes[e.id] ? r : { scenes: { ...r.scenes, [e.id]: e } }),
  unregisterScene: (e) => t((r) => {
    if (e === de || !r.scenes[e]) return r;
    const o = { ...r.scenes };
    return delete o[e], { scenes: o };
  }),
  setTransition: (e) => t((r) => ({ transition: { ...r.transition, ...e } })),
  setReturnPoint: (e) => t({ lastReturnPoint: e }),
  goTo: async (e, r) => {
    const o = n();
    if (o.pending || e === o.current && !r?.entry) return;
    const s = o.scenes[e];
    if (!s) {
      console.warn(`[scene] Unknown scene "${e}". Did you forget to register it?`);
      return;
    }
    const a = s.interior ?? !1 ? "#0d0d10" : "#f5f5f5";
    t({ pending: e, transition: { active: !0, color: a, progress: 0 } });
    const d = performance.now();
    for (; ; ) {
      const c = Math.min(1, (performance.now() - d) / Gn);
      if (n().setTransition({ progress: c }), c >= 1) break;
      await Re(16);
    }
    r?.saveReturn && t({ lastReturnPoint: r.saveReturn }), t({ current: e }), await Re(Wn);
    const l = performance.now();
    for (; ; ) {
      const c = Math.min(1, (performance.now() - l) / Nn);
      if (n().setTransition({ progress: 1 - c }), c >= 1) break;
      await Re(16);
    }
    t({ pending: null, transition: { active: !1, color: a, progress: 0 } });
  },
  serialize: () => ({ version: 1, current: n().current }),
  hydrate: (e) => {
    !e || e.version !== 1 || n().scenes[e.current] && t({ current: e.current, pending: null });
  }
}));
function Un(t, n) {
  if (t === n) return !0;
  if (t.size !== n.size) return !1;
  for (const e of t)
    if (!n.has(e)) return !1;
  return !0;
}
const j = W((t) => ({
  rooms: /* @__PURE__ */ new Map(),
  portals: /* @__PURE__ */ new Map(),
  currentRoomId: null,
  visibleRoomIds: /* @__PURE__ */ new Set(),
  initializedSceneId: null,
  registerRoom: (n) => t((e) => {
    const r = new Map(e.rooms);
    return r.set(n.id, n), { rooms: r };
  }),
  unregisterRoom: (n) => t((e) => {
    if (!e.rooms.has(n)) return e;
    const r = new Map(e.rooms);
    return r.delete(n), {
      rooms: r,
      currentRoomId: e.currentRoomId === n ? null : e.currentRoomId
    };
  }),
  registerPortal: (n) => t((e) => {
    const r = new Map(e.portals);
    return r.set(n.id, n), { portals: r };
  }),
  unregisterPortal: (n) => t((e) => {
    if (!e.portals.has(n)) return e;
    const r = new Map(e.portals);
    return r.delete(n), { portals: r };
  }),
  setVisibleRooms: (n, e, r) => t((o) => o.initializedSceneId === n && o.currentRoomId === e && Un(o.visibleRoomIds, r) ? o : {
    initializedSceneId: n,
    currentRoomId: e,
    visibleRoomIds: r
  }),
  reset: () => t({
    currentRoomId: null,
    visibleRoomIds: /* @__PURE__ */ new Set(),
    initializedSceneId: null
  })
}));
function Co({ zIndex: t = 9999 } = {}) {
  const n = K((e) => e.transition);
  return !n.active && n.progress <= 1e-3 ? null : /* @__PURE__ */ u(
    "div",
    {
      "aria-hidden": !0,
      style: {
        position: "fixed",
        inset: 0,
        background: n.color,
        opacity: n.progress,
        pointerEvents: n.progress > 0.5 ? "auto" : "none",
        zIndex: t,
        transition: "background-color 80ms linear"
      }
    }
  );
}
function Io({ scene: t, children: n }) {
  const e = K((s) => s.registerScene), r = K((s) => s.unregisterScene), o = K((s) => s.current);
  return I(() => (e(t), () => r(t.id)), [t, e, r]), o !== t.id ? null : /* @__PURE__ */ u($, { children: n });
}
function Mo({
  position: t,
  sceneId: n,
  entry: e,
  exitOverride: r,
  radius: o = 1.4,
  cooldownMs: s = 800,
  color: i = "#5a8acf",
  label: a
}) {
  const d = K((w) => w.goTo), l = K((w) => w.current), { teleport: c } = lt(), { position: f } = ee({ updateInterval: 50 }), p = B(0), g = z(() => new x.CylinderGeometry(o, o, 0.08, 28), [o]);
  I(() => () => g.dispose(), [g]), V(() => {
    const w = performance.now();
    if (w - p.current < s) return;
    const b = f.x - t[0], h = f.z - t[2];
    b * b + h * h > o * o || (p.current = w, l !== n && k());
  });
  async function k() {
    const w = r ?? {
      position: [t[0], t[1], t[2]]
    };
    await d(n, { entry: e, saveReturn: w });
    const b = new x.Vector3(e.position[0], e.position[1], e.position[2]);
    c(b);
  }
  return /* @__PURE__ */ m("group", { position: t, children: [
    /* @__PURE__ */ u("mesh", { rotation: [0, 0, 0], geometry: g, children: /* @__PURE__ */ u(
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
      /* @__PURE__ */ u("boxGeometry", { args: [0.04, 0.6, 0.04] }),
      /* @__PURE__ */ u("meshStandardMaterial", { color: i, emissive: i, emissiveIntensity: 0.4 })
    ] })
  ] });
}
function Ro({ sceneId: t, roomId: n, bounds: e, children: r }) {
  const o = K((l) => l.current), s = j((l) => l.registerRoom), i = j((l) => l.unregisterRoom), a = j((l) => l.initializedSceneId), d = j((l) => l.visibleRoomIds);
  return I(() => (s({ id: n, sceneId: t, bounds: e }), () => i(n)), [n, t, e, s, i]), o !== t ? null : a !== t ? /* @__PURE__ */ u($, { children: r }) : d.has(n) ? /* @__PURE__ */ u($, { children: r }) : null;
}
function Po({
  id: t,
  sceneId: n,
  fromRoomId: e,
  toRoomId: r,
  position: o,
  radius: s,
  revealDistance: i
}) {
  const a = j((l) => l.registerPortal), d = j((l) => l.unregisterPortal);
  return I(() => (a({
    id: t,
    sceneId: n,
    fromRoomId: e,
    toRoomId: r,
    position: o,
    ...s !== void 0 ? { radius: s } : {},
    ...i !== void 0 ? { revealDistance: i } : {}
  }), () => d(t)), [t, n, e, r, o, s, i, a, d]), null;
}
const qn = 0.12;
function jn(t, n) {
  return t.x >= n.min[0] && t.x <= n.max[0] && t.y >= n.min[1] && t.y <= n.max[1] && t.z >= n.min[2] && t.z <= n.max[2];
}
function ft(t, n, e) {
  for (const r of n)
    if (r.sceneId === t && jn(e, r.bounds))
      return r.id;
  return null;
}
function $n(t) {
  const n = t.rooms.filter((s) => s.sceneId === t.sceneId);
  if (n.length === 0) return /* @__PURE__ */ new Set();
  const e = ft(t.sceneId, n, t.position);
  if (!e)
    return new Set(n.map((s) => s.id));
  const r = /* @__PURE__ */ new Set([e]), o = t.portals.filter((s) => s.sceneId === t.sceneId);
  for (const s of o) {
    const i = s.revealDistance ?? 3.8, a = t.position.x - s.position[0], d = t.position.y - s.position[1], l = t.position.z - s.position[2];
    a * a + d * d + l * l > i * i || (s.fromRoomId === e ? r.add(s.toRoomId) : s.toRoomId === e && r.add(s.fromRoomId));
  }
  return r;
}
function Eo() {
  const t = K((a) => a.current), n = j((a) => a.rooms), e = j((a) => a.portals), r = j((a) => a.setVisibleRooms), o = j((a) => a.reset), { position: s } = ee({ updateInterval: 50 }), i = B(0);
  return I(() => o, [o]), V((a, d) => {
    if (i.current += Math.max(0, d), i.current < qn) return;
    i.current = 0;
    const l = Array.from(n.values()), c = Array.from(e.values()), f = ft(t, l, s), p = $n({
      sceneId: t,
      rooms: l,
      portals: c,
      position: s
    });
    r(t, f, p);
  }), null;
}
const Pe = new x.Color("#0a1430"), Vn = new x.Color("#ffb377"), Hn = new x.Color("#ff7a52"), Yn = new x.Color("#5b6975"), Kn = new x.Color("#dde7f0"), Xn = new x.Color("#3b4452");
function Qn(t, n) {
  const e = t + n / 60;
  return e < 5 ? { t: 0, phase: "night" } : e < 7 ? { t: (e - 5) / 2, phase: "dawn" } : e < 17 ? { t: 1, phase: "day" } : e < 19 ? { t: 1 - (e - 17) / 2, phase: "dusk" } : { t: 0, phase: "night" };
}
function Ao({
  color: t = "#cfd8e3",
  near: n = 35,
  far: e = 220,
  enabled: r = !0
} = {}) {
  const o = Ct((d) => d.scene), s = O((d) => d.time.hour), i = O((d) => d.time.minute), a = Q((d) => d.current);
  return I(() => {
    if (!r) return;
    const d = new x.Color(t), l = Qn(s, i), c = d.clone();
    l.phase === "night" ? c.copy(Pe) : l.phase === "dawn" ? c.lerpColors(Pe, Vn, l.t) : l.phase === "dusk" ? c.lerpColors(Pe, Hn, l.t) : c.lerp(d, 0.85);
    let f = n, p = e;
    if (l.phase === "night" ? (f = n * 0.45, p = e * 0.55) : (l.phase === "dawn" || l.phase === "dusk") && (f = n * (0.55 + 0.45 * l.t), p = e * (0.7 + 0.3 * l.t)), a) {
      const g = Math.max(0, Math.min(1, a.intensity));
      a.kind === "rain" ? (c.lerp(Yn, 0.5 + g * 0.3), f *= 0.7 - g * 0.2, p *= 0.65 - g * 0.2) : a.kind === "storm" ? (c.lerp(Xn, 0.6 + g * 0.3), f *= 0.55 - g * 0.2, p *= 0.5 - g * 0.2) : a.kind === "snow" && (c.lerp(Kn, 0.5 + g * 0.25), f *= 0.75, p *= 0.7);
    }
    f = Math.max(2, f), p = Math.max(f + 5, p), o.fog instanceof x.Fog ? (o.fog.color.copy(c), o.fog.near = f, o.fog.far = p) : o.fog = new x.Fog(c.getHex(), f, p), o.background = null;
  }, [o, t, n, e, r, s, i, a?.kind, a?.intensity]), null;
}
const Zn = [
  { hour: 0, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: -Math.PI / 2, elevation: -0.3 },
  { hour: 5, sunColor: "#3b3a5a", ambientColor: "#28304a", sunIntensity: 0.15, ambientIntensity: 0.22, azimuth: -Math.PI / 3, elevation: -0.05 },
  { hour: 7, sunColor: "#ffb27a", ambientColor: "#7a8aa6", sunIntensity: 0.55, ambientIntensity: 0.3, azimuth: -Math.PI / 4, elevation: 0.25 },
  { hour: 10, sunColor: "#fff1c8", ambientColor: "#aab4c8", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: -Math.PI / 8, elevation: 0.7 },
  { hour: 13, sunColor: "#ffffff", ambientColor: "#b6c2d8", sunIntensity: 1.05, ambientIntensity: 0.38, azimuth: 0, elevation: 1.05 },
  { hour: 16, sunColor: "#ffe0a8", ambientColor: "#a8b4cc", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: Math.PI / 6, elevation: 0.65 },
  { hour: 18, sunColor: "#ff9a5a", ambientColor: "#806a8a", sunIntensity: 0.55, ambientIntensity: 0.28, azimuth: Math.PI / 3, elevation: 0.18 },
  { hour: 20, sunColor: "#5a3f6a", ambientColor: "#34304a", sunIntensity: 0.18, ambientIntensity: 0.22, azimuth: Math.PI / 2, elevation: -0.05 },
  { hour: 24, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: 3 * Math.PI / 4, elevation: -0.3 }
], Je = {
  spring: new x.Color("#fff0f5"),
  summer: new x.Color("#fff5d8"),
  autumn: new x.Color("#ffd9b0"),
  winter: new x.Color("#dfe8f5")
}, et = {
  sunny: { sun: 1, ambient: 1, tint: new x.Color("#ffffff") },
  cloudy: { sun: 0.55, ambient: 0.95, tint: new x.Color("#cfd6e2") },
  rain: { sun: 0.3, ambient: 0.85, tint: new x.Color("#90a0b8") },
  snow: { sun: 0.65, ambient: 1.1, tint: new x.Color("#dfeaf5") },
  storm: { sun: 0.2, ambient: 0.75, tint: new x.Color("#5a6a82") }
};
function Jn(t, n) {
  const e = t, r = (n % 24 + 24) % 24;
  let o = e[0], s = e[e.length - 1];
  for (let d = 0; d < e.length - 1; d += 1) {
    const l = e[d], c = e[d + 1];
    if (r >= l.hour && r <= c.hour) {
      o = l, s = c;
      break;
    }
  }
  const i = Math.max(1e-4, s.hour - o.hour), a = x.MathUtils.clamp((r - o.hour) / i, 0, 1);
  return {
    hour: r,
    sunColor: o.sunColor,
    ambientColor: o.ambientColor,
    sunIntensity: x.MathUtils.lerp(o.sunIntensity, s.sunIntensity, a),
    ambientIntensity: x.MathUtils.lerp(o.ambientIntensity, s.ambientIntensity, a),
    azimuth: x.MathUtils.lerp(o.azimuth, s.azimuth, a),
    elevation: x.MathUtils.lerp(o.elevation, s.elevation, a)
    // Mix colors via THREE.Color outside this scope to avoid string allocations.
  };
}
function Bo({
  rigDistance: t = 60,
  castShadow: n = !0,
  shadowMapSize: e = 1024,
  keyframes: r,
  damping: o = 0.12
} = {}) {
  const s = B(null), i = B(null), a = z(() => (r ?? Zn).slice().sort((g, k) => g.hour - k.hour), [r]), d = z(() => new x.Color(), []), l = z(() => new x.Color(), []), c = z(() => new x.Color(), []), f = z(() => new x.Color(), []);
  return V(() => {
    const p = s.current, g = i.current;
    if (!p || !g) return;
    const k = O.getState().time, w = Q.getState().current, b = w?.kind ?? "sunny", h = x.MathUtils.clamp(w?.intensity ?? 0.5, 0, 1), v = et[b] ?? et.sunny, S = Je[k.season] ?? Je.spring, C = Jn(a, k.hour + k.minute / 60);
    c.set(C.sunColor).lerp(S, 0.18).lerp(v.tint, 0.35 + 0.25 * h), f.set(C.ambientColor).lerp(S, 0.2).lerp(v.tint, 0.3 + 0.3 * h);
    const M = x.MathUtils.clamp(o, 0.01, 1);
    d.copy(p.color).lerp(c, M), l.copy(g.color).lerp(f, M), p.color.copy(d), g.color.copy(l);
    const L = x.MathUtils.lerp(1, v.sun, 0.5 + 0.5 * h), y = x.MathUtils.lerp(1, v.ambient, 0.5 + 0.5 * h);
    p.intensity = x.MathUtils.lerp(p.intensity, C.sunIntensity * L, M), g.intensity = x.MathUtils.lerp(g.intensity, C.ambientIntensity * y, M);
    const P = Math.cos(C.elevation), T = Math.sin(C.elevation), R = Math.cos(C.azimuth) * P * t, A = Math.sin(C.azimuth) * P * t, te = Math.max(2, T * t);
    p.position.set(R, te, A), p.target.position.set(0, 0, 0), p.target.updateMatrixWorld();
  }), /* @__PURE__ */ m($, { children: [
    /* @__PURE__ */ u("ambientLight", { ref: i, intensity: 0.3, color: "#b6c2d8" }),
    /* @__PURE__ */ u(
      "directionalLight",
      {
        ref: s,
        castShadow: n,
        "shadow-mapSize": [e, e],
        "shadow-normalBias": 0.06,
        "shadow-camera-near": 1,
        "shadow-camera-far": Math.max(120, t * 2),
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
function er(t, n, e) {
  return n === e ? !0 : n < e ? t >= n && t < e : t >= n || t < e;
}
function tr(t, n) {
  return t.weekdays && t.weekdays.length > 0 && !t.weekdays.includes(n.weekday) || t.seasons && t.seasons.length > 0 && !t.seasons.includes(n.season) ? !1 : er(n.hour, t.startHour, t.endHour);
}
function nr(t, n) {
  for (const r of t.entries)
    if (tr(r, n))
      return {
        position: r.position,
        activity: r.activity ?? "idle",
        ...r.rotationY !== void 0 ? { rotationY: r.rotationY } : {},
        ...r.dialogTreeId ? { dialogTreeId: r.dialogTreeId } : {},
        source: r
      };
  const e = t.defaultEntry;
  return {
    position: e?.position ?? [0, 0, 0],
    activity: e?.activity ?? "idle",
    ...e?.rotationY !== void 0 ? { rotationY: e.rotationY } : {},
    ...e?.dialogTreeId ? { dialogTreeId: e.dialogTreeId } : {},
    source: null
  };
}
class rr {
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
  resolve(n, e) {
    const r = this.map.get(n);
    return r ? nr(r, e) : null;
  }
  all() {
    return Array.from(this.map.values());
  }
  clear() {
    this.map.clear();
  }
}
let Ee = null;
function tt() {
  return Ee || (Ee = new rr()), Ee;
}
function Lo(t) {
  const [n, e] = F(() => {
    const r = O.getState();
    return tt().resolve(t, r.time);
  });
  return I(() => {
    let r = -1;
    const o = () => {
      const i = O.getState();
      if (i.time.hour === r) return;
      r = i.time.hour;
      const a = tt().resolve(t, i.time);
      e(a);
    };
    return o(), O.subscribe((i, a) => {
      (i.time.hour !== a.time.hour || i.time.day !== a.time.day || i.time.weekday !== a.time.weekday) && o();
    });
  }, [t]), n;
}
export {
  os as AnimationDebugPanel,
  ss as AnimationPanel,
  It as AssetPreviewCanvas,
  po as AudioControls,
  To as BASIC_KART_BLUEPRINT,
  No as BaseComponent,
  is as Billboard,
  Uo as BlueprintConverter,
  qo as BlueprintEntity,
  jo as BlueprintFactory,
  $o as BlueprintLoader,
  Vo as BlueprintSpawner,
  Xi as BugSpot,
  as as BuildingController,
  ls as BuildingSystem,
  cs as BuildingUI,
  Ue as CATALOG_CATEGORIES,
  ns as Camera,
  ds as CameraDebugPanel,
  us as CameraPanel,
  fs as CameraPresets,
  to as CatalogUI,
  go as CharacterCreator,
  Qi as CircularPluginDependencyError,
  oi as Clicker,
  Ho as ComponentRegistry,
  Pi as ConnectionForm,
  no as CraftingUI,
  ro as CropPlot,
  ya as DAILY_FRIENDSHIP_CAP,
  li as DEFAULT_SQUARE_GRID_SPEC,
  kr as DialogBox,
  ba as DialogRunner,
  Zi as DuplicateExtensionError,
  Ji as DuplicatePluginError,
  Ao as DynamicFog,
  Bo as DynamicSky,
  ps as Editor,
  ms as EditorLayout,
  Ir as EventsHUD,
  Do as FIRE_MAGE_BLUEPRINT,
  xa as FRIENDSHIP_LEVELS,
  gs as Fire,
  ea as FishSpot,
  Wt as FocusableObject,
  bo as Footprints,
  mo as Footsteps,
  Sr as FreePlacementAdapter,
  qi as GaeSupProps,
  si as GaesupController,
  Js as GaesupWorld,
  ei as GaesupWorldContent,
  _r as Gamepad,
  wa as GameplayEventEngine,
  hs as GameplayEventPanel,
  va as GameplayEventRegistry,
  ys as Grass,
  bs as GrassDriver,
  Yo as GravityForceComponent,
  xs as GridHelper,
  ii as GroundClicker,
  Ar as HotbarUI,
  Mo as HouseDoor,
  co as HousePlot,
  Wa as HttpAssetSource,
  Sa as HttpContentBundleSource,
  ta as InMemoryEventBus,
  na as InMemoryExtensionRegistry,
  ji as IndexedDBAdapter,
  Gr as Interactable,
  Nr as InteractionPrompt,
  Wr as InteractionTracker,
  Br as InventoryUI,
  xo as LOCALE_LABEL,
  $i as LocalStorageAdapter,
  Jr as MailboxUI,
  zr as MiniMap,
  Tr as MinimapPlatform,
  ra as MissingExtensionError,
  ci as MissingPlacementEntryError,
  oa as MissingPluginDependencyError,
  Ua as MockNetworkAdapter,
  pt as MotionController,
  mt as MotionDebugPanel,
  ws as MotionPanel,
  Ur as MotionUI,
  Ei as MultiplayerCanvas,
  vs as NPCSystem,
  ho as OutfitAvatar,
  Ka as PLAYER_PROGRESS_DOMAINS,
  Ss as PerformancePanel,
  di as PlacementEngine,
  ui as PlacementRejectedError,
  Ai as PlayerInfoOverlay,
  sa as PluginRegistry,
  Lr as QuestLogUI,
  $a as ROLE_PERMISSIONS,
  Bi as RemotePlayer,
  ks as ResizablePanel,
  Po as RoomPortal,
  Ro as RoomRoot,
  Eo as RoomVisibilityDriver,
  La as SEED_ASSETS,
  ka as SEED_GAMEPLAY_EVENTS,
  $t as SEED_ITEMS,
  Cs as Sakura,
  Is as SakuraBatch,
  Ms as Sand,
  Rs as SandBatch,
  Vi as SaveSystem,
  Co as SceneFader,
  Io as SceneRoot,
  Qr as ShopUI,
  Ps as Snow,
  Es as Snowfield,
  As as SnowfieldBatch,
  Li as SpeechBalloon,
  fi as SquareGridAdapter,
  Bs as StudioPanel,
  qr as Teleport,
  Ls as TileSystem,
  Yr as TimeHUD,
  Dr as ToastHost,
  Zr as ToolUseController,
  ko as TouchControls,
  uo as TownHUD,
  ia as TreeObject,
  Ci as V3,
  Ii as V30,
  Mi as V31,
  Os as VehiclePanel,
  Fo as WARRIOR_BLUEPRINT,
  Xa as WORLD_SNAPSHOT_DOMAINS,
  zs as WallSystem,
  Xr as WalletHUD,
  Ts as Water,
  io as WeatherEffect,
  so as WeatherHUD,
  ti as World,
  ni as WorldContainer,
  pi as applyToonToScene,
  Da as assetToMeshConfig,
  Ds as autoDetectProfile,
  _o as blueprintRegistry,
  Fs as buildingPlugin,
  Va as canMember,
  _s as classifyTier,
  Gs as createBuildingPlugin,
  Ca as createContentBundleFromSaveSystem,
  Ia as createDefaultGameplayEventRegistry,
  Hi as createDefaultSaveSystem,
  Ws as createEditorCommandStack,
  Ns as createEditorShell,
  Us as createEditorSlice,
  aa as createGaesupRuntime,
  qa as createNetworkEnvelope,
  mi as createNoOverlapRule,
  gi as createPlacementEngine,
  Qa as createPlayerProgress,
  la as createPluginContext,
  ca as createPluginLogger,
  da as createPluginRegistry,
  Fa as createScopedAssetMeshConfig,
  _a as createScopedBuildingMeshId,
  hi as createToonMaterial,
  Za as createWorldSnapshot,
  Oi as defaultMultiplayerConfig,
  qs as detectCapabilities,
  yi as disposeToonGradients,
  js as editorSlice,
  ne as getAudioEngine,
  J as getCropRegistry,
  bi as getDefaultToonMode,
  Ma as getDialogRegistry,
  st as getEventRegistry,
  Ra as getGameplayEventRegistry,
  $s as getGrassManager,
  _ as getItemRegistry,
  tt as getNPCScheduler,
  it as getQuestRegistry,
  ie as getRecipeRegistry,
  Yi as getSaveSystem,
  kt as getToolEvents,
  xi as getToonGradient,
  ga as isEventActive,
  Pa as loadContentBundleFromManifest,
  D as notify,
  Ja as pickDomains,
  wi as placementOk,
  vi as placementRejected,
  Vs as profileForTier,
  Ko as registerDefaultComponents,
  oo as registerSeedCrops,
  Mr as registerSeedEvents,
  Kr as registerSeedItems,
  yo as resolveCharacterParts,
  Ha as resolveRolePermissions,
  nr as resolveSchedule,
  Oa as selectAssetsByKind,
  za as selectAssetsBySlot,
  Si as setDefaultToonMode,
  wo as t,
  Xo as useAirplaneBlueprint,
  fo as useAmbientBgm,
  ze as useAssetStore,
  U as useAudioStore,
  ua as useAutoSave,
  Qo as useBlueprint,
  Zo as useBlueprintsByType,
  Hs as useBuildingEditor,
  fe as useBuildingStore,
  ut as useCatalogStore,
  eo as useCatalogTracker,
  Jo as useCharacterBlueprint,
  N as useCharacterStore,
  we as useCraftingStore,
  ct as useCurrentInteraction,
  Vr as useDayChange,
  lo as useDecorationScore,
  oe as useDialogStore,
  Ys as useEditor,
  Ks as useEditorStore,
  Pr as useEquippedItem,
  fa as useEquippedToolKind,
  ot as useEventsStore,
  Cr as useEventsTicker,
  Ea as useFriendshipStore,
  Fr as useGaesupController,
  Y as useGaesupStore,
  $r as useGameClock,
  Ut as useGameTime,
  Rt as useHotbar,
  Er as useHotbarKeyboard,
  Hr as useHourChange,
  ae as useI18nStore,
  Z as useInteractablesStore,
  Nt as useInteractionKey,
  Rr as useInventory,
  E as useInventoryStore,
  pa as useLoadOnMount,
  So as useLocale,
  ce as useMailStore,
  zi as useMultiplayer,
  Ti as useNPCConnection,
  Xs as useNPCStore,
  Di as useNetworkBridge,
  Fi as useNetworkGroup,
  _i as useNetworkMessage,
  Gi as useNetworkStats,
  Lo as useNpcSchedule,
  Qs as usePerfStore,
  Wi as usePlayerNetwork,
  ee as usePlayerPosition,
  G as usePlotStore,
  Or as useQuestObjectiveTracker,
  re as useQuestStore,
  j as useRoomVisibilityStore,
  K as useSceneStore,
  le as useShopStore,
  Go as useSpawnFromBlueprint,
  Be as useStateSystem,
  lt as useTeleport,
  jr as useTimeOfDay,
  O as useTimeStore,
  Oe as useToastStore,
  be as useToolUse,
  H as useTownStore,
  vo as useTranslate,
  Ni as useUIConfigStore,
  es as useVehicleBlueprint,
  X as useWalletStore,
  Q as useWeatherStore,
  ao as useWeatherTicker,
  Aa as validateContentBundle
};
