import "reflect-metadata";
import { C as zo } from "./index-CgsUCTCC.js";
import { g as ft, b as be } from "./index-BrVS3AYS.js";
import { B as Oo, F as To, T as Bo, c as Fo, u as Do, d as _o, a as Go } from "./index-BrVS3AYS.js";
import { W as Uo, G as jo, W as qo, a as $o, W as No } from "./index-BrdOTJRU.js";
import { u as tt, b as ee } from "./index-BoURrNnx.js";
import { a as Ho, C as Yo, G as Ko } from "./index-BoURrNnx.js";
import { M as pt, a as mt, u as U, H as gt, F as ht, O as yt } from "./plugin-CE0w7qHU.js";
import { d as Qo, B as Zo, b as Jo, C as es, G as ts, N as ns, T as rs, W as os, h as ss, k as is, f as as, l as ls, e as cs, j as ds, p as us, c as fs, g as ps, i as ms } from "./plugin-CE0w7qHU.js";
import { jsxs as m, jsx as c, Fragment as N } from "react/jsx-runtime";
import { useCallback as q, useEffect as C, useState as D, useRef as z, forwardRef as bt, useId as xt, useMemo as T } from "react";
import { b as Le, a as fe, T as vt } from "./PhysicsEntity-_Uz-Stjj.js";
import { i as hs, k as ys, K as bs, h as xs, j as vs, J as ws } from "./PhysicsEntity-_Uz-Stjj.js";
import { u as H, I as wt } from "./gaesupStore-dfWoSPPs.js";
import { V as ks, d as Is, e as Cs } from "./gaesupStore-dfWoSPPs.js";
import { S as Rs, u as Ps } from "./index-BJXmSLWK.js";
import { M as nt } from "./index-Blqf2bes.js";
import { W as Ls, I as zs, L as As, S as Os, c as Ts, g as Bs } from "./index-Blqf2bes.js";
import * as S from "three";
import { u as O } from "./timeStore-BRw0mdde.js";
import { a as rt, b as ot, u as E, g as _, c as Ae, n as F } from "./eventsStore-DqmXNVEb.js";
import { i as Ds } from "./eventsStore-DqmXNVEb.js";
import { create as W } from "zustand";
import { useFrame as X, useThree as St } from "@react-three/fiber";
import { a as oe, u as re, g as st, c as K } from "./dialogStore-kKcA6g4t.js";
import { e as Gs, D as Ws, F as Us, d as js, b as qs } from "./dialogStore-kKcA6g4t.js";
import { u as J } from "./weatherStore-CzG5N441.js";
import { u as Oe } from "./assetStore-2bI2BPCn.js";
import { S as Ns } from "./assetStore-2bI2BPCn.js";
import { A as kt } from "./index-15RS3726.js";
import { H as Hs } from "./api-BRV101Zn.js";
function vr() {
  const { activeState: t, gameStates: n } = Le(), e = H((i) => i.mode), r = H((i) => i.controllerOptions), o = H.getState();
  return {
    state: t || null,
    mode: e,
    states: n,
    control: r,
    context: { mode: e, states: n, control: r },
    controller: o
  };
}
function it() {
  const { activeState: t, updateActiveState: n } = Le(), e = !!t;
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
function wr({ advanceKey: t = "e", closeKey: n = "Escape" }) {
  const e = oe((u) => u.node), r = oe((u) => u.runner), o = oe((u) => u.advance), s = oe((u) => u.choose), i = oe((u) => u.close), a = r?.visibleChoices() ?? [];
  return C(() => {
    if (!e) return;
    const u = (l) => {
      if (l.key === n) {
        i();
        return;
      }
      if (a.length === 0 && l.key.toLowerCase() === t.toLowerCase()) {
        o();
        return;
      }
      const d = parseInt(l.key, 10);
      !Number.isNaN(d) && d >= 1 && d <= a.length && s(d - 1);
    };
    return window.addEventListener("keydown", u), () => window.removeEventListener("keydown", u);
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
        e.speaker && /* @__PURE__ */ c("div", { style: {
          display: "inline-block",
          padding: "3px 8px",
          background: "#ffd84a",
          color: "#1a1a1a",
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 12,
          marginBottom: 6
        }, children: e.speaker }),
        /* @__PURE__ */ c("div", { style: { lineHeight: 1.55, whiteSpace: "pre-wrap" }, children: e.text }),
        a.length === 0 ? /* @__PURE__ */ m("div", { style: { marginTop: 10, fontSize: 12, opacity: 0.65, textAlign: "right" }, children: [
          "[",
          t.toUpperCase(),
          "] 다음"
        ] }) : /* @__PURE__ */ c("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }, children: a.map((u, l) => /* @__PURE__ */ m(
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
              u.text
            ]
          },
          l
        )) })
      ]
    }
  ) : null;
}
function Sr(t = !0, n = {}) {
  C(() => {
    if (!t) return;
    const e = () => {
      const o = O.getState().time, { started: s, ended: i } = rt.getState().refresh(o);
      s.length && n.onStarted && n.onStarted(s), i.length && n.onEnded && n.onEnded(i);
    };
    return e(), O.subscribe((o, s) => {
      (o.time.day !== s.time.day || o.time.month !== s.time.month || o.time.season !== s.time.season || o.time.weekday !== s.time.weekday) && e();
    });
  }, [t, n.onStarted, n.onEnded]);
}
function kr({ position: t = "top-left", excludeIds: n = [] }) {
  const e = rt((i) => i.active), r = ot(), o = e.filter((i) => !n.includes(i));
  return o.length === 0 ? null : /* @__PURE__ */ c(
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
        const u = a.tags?.some((l) => l === "festival" || l === "tourney");
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
              boxShadow: `inset 0 0 0 1px ${u ? "#ffd84a55" : "#7adf9055"}`,
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            },
            children: [
              /* @__PURE__ */ c("span", { style: {
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: u ? "#ffd84a" : "#7adf90"
              } }),
              /* @__PURE__ */ c("span", { children: a.name })
            ]
          },
          i
        );
      })
    }
  );
}
const It = [
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
function Ir() {
  Te || (Te = !0, ot().registerAll(It));
}
function Cr() {
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
function Mr() {
  return E((t) => {
    const n = t.hotbar[t.equippedHotbar];
    return n == null ? null : t.slots[n] ?? null;
  });
}
function Ct() {
  const t = E((o) => o.hotbar), n = E((o) => o.slots), e = E((o) => o.equippedHotbar), r = E((o) => o.setEquippedHotbar);
  return {
    hotbar: t,
    slots: t.map((o) => n[o] ?? null),
    equipped: e,
    setEquipped: r
  };
}
function Rr(t = !0) {
  const n = E((o) => o.setEquippedHotbar), e = E((o) => o.equippedHotbar), r = E((o) => o.hotbar);
  C(() => {
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
function Pr() {
  const { slots: t, equipped: n, setEquipped: e } = Ct(), r = _();
  return /* @__PURE__ */ c(
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
              /* @__PURE__ */ c(
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
              o && i ? /* @__PURE__ */ m(N, { children: [
                /* @__PURE__ */ c(
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
                i.stackable && o.count > 1 && /* @__PURE__ */ c(
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
function Er({ toggleKey: t = "i", initiallyOpen: n = !1 }) {
  const [e, r] = D(n), o = E((l) => l.slots), s = E((l) => l.move), i = _(), [a, u] = D(null);
  return C(() => {
    const l = (d) => {
      const f = d.target?.tagName?.toLowerCase();
      f === "input" || f === "textarea" || d.key.toLowerCase() === t.toLowerCase() && r((p) => !p);
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [t]), e ? /* @__PURE__ */ c(
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
              /* @__PURE__ */ c("div", { style: { fontSize: 14, opacity: 0.9 }, children: "Inventory" }),
              /* @__PURE__ */ c(
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
            /* @__PURE__ */ c(
              "div",
              {
                style: {
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 64px)",
                  gap: 6
                },
                children: o.map((l, d) => {
                  const f = l ? i.get(l.itemId) : void 0;
                  return /* @__PURE__ */ c(
                    "div",
                    {
                      draggable: !!l,
                      onDragStart: () => u(d),
                      onDragOver: (p) => {
                        p.preventDefault();
                      },
                      onDrop: () => {
                        a !== null && a !== d && s(a, d), u(null);
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
                      children: l && f ? /* @__PURE__ */ m(N, { children: [
                        /* @__PURE__ */ c(
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
                        f.stackable && l.count > 1 && /* @__PURE__ */ c(
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
                    d
                  );
                })
              }
            ),
            /* @__PURE__ */ c("div", { style: { marginTop: 12, opacity: 0.6, fontSize: 11 }, children: `[${t.toUpperCase()}] 닫기 / 드래그로 이동` })
          ]
        }
      )
    }
  ) : null;
}
function Lr({ toggleKey: t = "j" }) {
  const [n, e] = D(!1), r = re((l) => l.state), o = re((l) => l.complete), s = re((l) => l.isObjectiveComplete), i = re((l) => l.isAllObjectivesComplete);
  if (C(() => {
    const l = (d) => {
      const f = d.target?.tagName?.toLowerCase();
      f === "input" || f === "textarea" || (d.key.toLowerCase() === t.toLowerCase() && e((p) => !p), d.key === "Escape" && e(!1));
    };
    return window.addEventListener("keydown", l), () => window.removeEventListener("keydown", l);
  }, [t]), !n) return null;
  const a = Object.values(r).filter((l) => l.status === "active"), u = Object.values(r).filter((l) => l.status === "completed");
  return /* @__PURE__ */ c(
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
                  /* @__PURE__ */ c("strong", { style: { fontSize: 15 }, children: "Quest Log" }),
                  /* @__PURE__ */ m("button", { onClick: () => e(!1), style: at(), children: [
                    "Close [",
                    t.toUpperCase(),
                    "]"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ m("div", { style: { overflowY: "auto", padding: 10 }, children: [
              /* @__PURE__ */ c(Be, { title: `Active (${a.length})`, children: a.length === 0 ? /* @__PURE__ */ c(Mt, { children: "No active quests." }) : a.map((l) => /* @__PURE__ */ c(
                Fe,
                {
                  progress: l,
                  renderObjective: (d) => s(
                    st().require(l.questId),
                    l,
                    d
                  ),
                  ...i(l.questId) ? {
                    onComplete: () => {
                      o(l.questId);
                    }
                  } : {}
                },
                l.questId
              )) }),
              u.length > 0 && /* @__PURE__ */ c(Be, { title: `Completed (${u.length})`, children: u.map((l) => /* @__PURE__ */ c(Fe, { progress: l, renderObjective: () => !0, muted: !0 }, l.questId)) })
            ] })
          ]
        }
      )
    }
  );
}
function Be({ title: t, children: n }) {
  return /* @__PURE__ */ m("div", { style: { marginBottom: 10 }, children: [
    /* @__PURE__ */ c("div", { style: { padding: "6px 6px 4px", color: "#7aa6ff", fontSize: 12 }, children: t }),
    n
  ] });
}
function Mt({ children: t }) {
  return /* @__PURE__ */ c("div", { style: { padding: "8px 10px", opacity: 0.6 }, children: t });
}
function Fe({
  progress: t,
  renderObjective: n,
  onComplete: e,
  muted: r
}) {
  const o = st().get(t.questId);
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
              /* @__PURE__ */ c("strong", { children: o.name }),
              e && /* @__PURE__ */ c("button", { onClick: e, style: at(!0), children: "Report Complete" })
            ]
          }
        ),
        /* @__PURE__ */ c("div", { style: { opacity: 0.75, marginBottom: 6 }, children: o.summary }),
        /* @__PURE__ */ c("ul", { style: { margin: 0, padding: "0 0 0 16px" }, children: o.objectives.map((s) => {
          const i = n(s), a = t.progress[s.id] ?? 0, u = s.type === "collect" || s.type === "deliver" ? s.count : 1, l = s.type === "collect" ? Math.min(E.getState().countOf(s.itemId), u) : a, d = s.type === "collect" || s.type === "deliver" ? _().get(s.itemId)?.name ?? s.itemId : "";
          return /* @__PURE__ */ m(
            "li",
            {
              style: { color: i ? "#7adf90" : "#ddd", listStyle: "square" },
              children: [
                s.description ?? Rt(s, d),
                " ",
                u > 1 ? `(${l}/${u})` : ""
              ]
            },
            s.id
          );
        }) }),
        /* @__PURE__ */ m("div", { style: { marginTop: 6, fontSize: 11, color: "#ffd84a" }, children: [
          "Rewards: ",
          o.rewards.map((s) => Pt(s)).join(", ")
        ] })
      ]
    }
  ) : null;
}
function Rt(t, n) {
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
function Pt(t) {
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
function zr(t = !0) {
  C(() => t ? E.subscribe((e, r) => {
    if (e.slots === r.slots) return;
    const o = re.getState().active();
    for (const s of o) re.getState().recheck(s.questId);
  }) : void 0, [t]);
}
const Et = 5, Lt = 0.5, zt = 20, At = 200, Ot = (t) => {
  const { activeState: n } = Le(), e = fe((g) => g.tileGroups), r = z(/* @__PURE__ */ new Map()), o = z(nt.getInstance()), {
    scale: s = Et,
    blockRotate: i = !1,
    updateInterval: a = 33
  } = t, u = z(null), [l, d] = D(s), f = !!(n.position && t);
  C(() => {
    const g = u.current;
    return g && o.current.setCanvas(g), () => {
      o.current.setCanvas(null);
    };
  }, []);
  const p = q(() => {
    t.blockScale || d((g) => Math.min(zt, g + 0.1));
  }, [t.blockScale]), h = q(() => {
    t.blockScale || d((g) => Math.max(Lt, g - 0.1));
  }, [t.blockScale]), b = q(
    (g) => {
      t.blockScale || (g.preventDefault(), g.deltaY < 0 ? p() : h());
    },
    [t.blockScale, p, h]
  ), k = q(() => {
    const g = u.current;
    if (!g) return;
    const v = (w) => {
      t.blockScale || (w.preventDefault(), w.deltaY < 0 ? p() : h());
    };
    return g.addEventListener("wheel", v, { passive: !1 }), () => {
      g.removeEventListener("wheel", v);
    };
  }, [t.blockScale, p, h]), x = q(() => {
    const { position: g, euler: v } = n;
    !g || !v || o.current.render({
      size: At,
      scale: l,
      position: g,
      rotation: v.y,
      blockRotate: i,
      tileGroups: e,
      sceneObjects: r.current
    });
  }, [n, l, i, e]);
  return C(() => {
    if (!f) return;
    const g = setInterval(() => {
      const { position: v, euler: w } = n;
      v && w && (o.current.checkForUpdates(v, w.y), x());
    }, a);
    return () => {
      clearInterval(g);
    };
  }, [x, a, f, n]), C(() => {
    x();
  }, [l, x]), {
    canvasRef: u,
    scale: l,
    upscale: p,
    downscale: h,
    handleWheel: b,
    setupWheelListener: k,
    updateCanvas: x,
    isReady: f
  };
}, De = 200;
function Ar({
  scale: t = 5,
  minScale: n = 0.5,
  maxScale: e = 20,
  blockScale: r = !1,
  blockScaleControl: o = !1,
  blockRotate: s = !1,
  angle: i = 0,
  minimapStyle: a,
  scaleStyle: u,
  plusMinusStyle: l,
  position: d = "top-right",
  showZoom: f = !0,
  showCompass: p = !0,
  markers: h = []
}) {
  const { canvasRef: b, scale: k, upscale: x, downscale: g, handleWheel: v } = Ot({
    blockScale: r,
    blockRotate: s
  }), w = d ? `minimap--${d}` : "";
  return /* @__PURE__ */ m("div", { className: `minimap ${w}`, style: a, children: [
    /* @__PURE__ */ c(
      "canvas",
      {
        ref: b,
        className: "minimap__canvas",
        width: De,
        height: De,
        onWheel: v
      }
    ),
    p && /* @__PURE__ */ c("div", { className: "minimap__compass", children: /* @__PURE__ */ c("div", { style: { transform: `rotate(${i}deg)` }, children: "N" }) }),
    h.map((I, M) => /* @__PURE__ */ c(
      "div",
      {
        className: `minimap__marker minimap__marker--${I.type || "normal"}`,
        style: {
          left: `${I.x}%`,
          top: `${I.y}%`
        },
        children: I.label && /* @__PURE__ */ c("div", { className: "minimap__marker-label", children: I.label })
      },
      I.id || M
    )),
    f && !o && /* @__PURE__ */ c("div", { className: "minimap__controls", style: u, children: /* @__PURE__ */ m("div", { className: "minimap__zoom-controls", children: [
      /* @__PURE__ */ c(
        "button",
        {
          className: "minimap__control-button",
          onClick: x,
          disabled: k >= e,
          style: l,
          children: "+"
        }
      ),
      /* @__PURE__ */ c(
        "button",
        {
          className: "minimap__control-button",
          onClick: g,
          disabled: k <= n,
          style: l,
          children: "-"
        }
      )
    ] }) })
  ] });
}
function Tt({
  id: t,
  position: n,
  size: e = [2, 2, 2],
  text: r = "",
  type: o = "normal",
  children: s
}) {
  return C(() => {
    const i = nt.getInstance(), a = Array.isArray(n) ? n : [n.x, n.y, n.z], u = Array.isArray(e) ? e : [e.x, e.y, e.z];
    return i.addMarker(
      t,
      o,
      r || "",
      new S.Vector3(a[0], a[1], a[2]),
      new S.Vector3(u[0], u[1], u[2])
    ), () => {
      i.removeMarker(t);
    };
  }, [t, n, e, o, r]), /* @__PURE__ */ c(N, { children: s });
}
function Or({
  id: t,
  position: n,
  size: e,
  label: r,
  children: o
}) {
  return /* @__PURE__ */ c(Tt, { id: t, position: n, size: e, text: r, type: "ground", children: o });
}
const Bt = {
  info: { bg: "rgba(20,30,50,0.55)", ring: "#7aa6ff", icon: "i" },
  success: { bg: "rgba(20,40,30,0.55)", ring: "#7adf90", icon: "+" },
  warn: { bg: "rgba(50,40,20,0.55)", ring: "#ffd84a", icon: "!" },
  error: { bg: "rgba(50,20,20,0.55)", ring: "#ff7a7a", icon: "x" },
  reward: { bg: "rgba(40,30,10,0.55)", ring: "#ffc24a", icon: "*" },
  mail: { bg: "rgba(30,20,40,0.55)", ring: "#cf9aff", icon: "M" }
};
function Tr({ position: t = "top-right", max: n = 5 }) {
  const e = Ae((i) => i.toasts), r = Ae((i) => i.dismiss);
  C(() => {
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
          const a = Bt[i.kind];
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
                /* @__PURE__ */ c(
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
                /* @__PURE__ */ c("span", { children: i.text })
              ]
            },
            i.id
          );
        }),
        /* @__PURE__ */ c("style", { children: `@keyframes gaesup-toast-in {
        0% { opacity: 0; transform: translateY(-6px); }
        100% { opacity: 1; transform: translateY(0); }
      }` })
      ]
    }
  );
}
const Q = W((t, n) => ({
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
function Ft({ value: t, name: n, gamePadButtonStyle: e }) {
  const [r, o] = D(!1), { pushKey: s } = tt(), i = () => {
    s(t, !0), o(!0);
  }, a = () => {
    s(t, !1), o(!1);
  };
  return /* @__PURE__ */ c(
    "button",
    {
      className: `pad-button ${r ? "is-clicked" : ""}`,
      onMouseDown: i,
      onMouseUp: a,
      onMouseLeave: a,
      onContextMenu: (u) => {
        u.preventDefault(), a();
      },
      onPointerDown: i,
      onPointerUp: a,
      style: e,
      children: n
    }
  );
}
function Br(t) {
  const { gamePadStyle: n, gamePadButtonStyle: e, label: r } = t, o = H((a) => a.interaction?.keyboard), { mode: s } = H();
  tt();
  const i = Object.keys(o || {}).map((a) => {
    const u = r?.[a] || a;
    return a === "forward" || a === "backward" || a === "leftward" || a === "rightward" ? {
      key: a,
      name: u,
      type: "direction",
      active: o?.[a] || !1
    } : {
      key: a,
      name: u,
      type: "action",
      active: o?.[a] || !1
    };
  }).filter(Boolean);
  return /* @__PURE__ */ c(
    "div",
    {
      className: "gamepad-container",
      style: {
        ...n,
        display: s?.controller === "gamepad" ? "flex" : "none"
      },
      children: i.map((a) => /* @__PURE__ */ c(
        Ft,
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
function Dt() {
  const { cameraOption: t, setCameraOption: n } = H.getState();
  t?.focus && n({
    focus: !1
  });
}
const _t = bt(
  ({ children: t, position: n, focusDistance: e = 10, focusDuration: r = 1, onFocus: o, onBlur: s, ...i }, a) => {
    const u = H((b) => b.setCameraOption), l = H((b) => b.cameraOption), d = (b) => {
      if (b.stopPropagation(), !l?.enableFocus) return;
      if (l.focus) {
        Dt(), s && s(b);
        return;
      }
      const k = b.object.getWorldPosition(new S.Vector3());
      u({
        focusTarget: k,
        focusDuration: r,
        focusDistance: e,
        focus: !0
      }), o && o(b);
    }, f = () => {
      l?.enableFocus && (document.body.style.cursor = "pointer");
    }, p = (b) => {
      document.body.style.cursor = "default", s && !l?.focus && s(b);
    }, h = {
      ...i,
      ...n ? { position: n } : {}
    };
    return /* @__PURE__ */ c(
      "group",
      {
        ref: a,
        onClick: d,
        onPointerOver: f,
        onPointerOut: p,
        ...h,
        children: t
      }
    );
  }
);
_t.displayName = "FocusableObject";
function Fr({
  id: t,
  kind: n = "misc",
  label: e,
  range: r = 2.2,
  activationKey: o = "e",
  data: s,
  onActivate: i,
  position: a,
  children: u
}) {
  const l = xt(), d = t ?? l, f = Q((x) => x.register), p = Q((x) => x.unregister), h = Q((x) => x.updatePosition), b = z(null), k = T(() => new S.Vector3(...a), [a]);
  return C(() => (f({
    id: d,
    kind: n,
    label: e,
    position: k.clone(),
    range: r,
    key: o,
    ...s ? { data: s } : {},
    onActivate: i
  }), () => p(d)), [d, n, e, r, o, s, i, f, p, k]), C(() => {
    h(d, k);
  }, [d, k, h]), /* @__PURE__ */ c("group", { ref: b, position: a, children: u });
}
const _e = new S.Vector3();
function lt() {
  return Q((t) => t.current);
}
function Gt(t = !0) {
  const n = lt(), e = Q((r) => r.activateCurrent);
  C(() => {
    if (!t || !n) return;
    const r = (o) => {
      const s = o.target?.tagName?.toLowerCase();
      s === "input" || s === "textarea" || o.key.toLowerCase() === n.key.toLowerCase() && e();
    };
    return window.addEventListener("keydown", r), () => window.removeEventListener("keydown", r);
  }, [n, t, e]);
}
function Dr({ throttleMs: t = 80 } = {}) {
  const { position: n } = ee({ updateInterval: 16 }), e = Q((s) => s.entries), r = Q((s) => s.setCurrent), o = z(0);
  return X((s, i) => {
    if (o.current += i * 1e3, o.current < t) return;
    o.current = 0;
    let a = null, u = 1 / 0, l = "", d = "e";
    for (const f of e.values()) {
      _e.copy(f.position).sub(n);
      const p = _e.lengthSq(), h = f.range * f.range;
      p > h || p < u && (u = p, a = f.id, l = f.label, d = f.key);
    }
    if (!a) {
      r(null);
      return;
    }
    r({
      id: a,
      label: l,
      key: d,
      distance: Math.sqrt(u)
    });
  }), null;
}
function _r({ enabled: t = !0 }) {
  const n = lt();
  return Gt(t), !t || !n ? null : /* @__PURE__ */ m(
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
        /* @__PURE__ */ c(
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
        /* @__PURE__ */ c("span", { children: n.label }),
        /* @__PURE__ */ m("span", { style: { opacity: 0.5, fontSize: 11 }, children: [
          n.distance.toFixed(1),
          "m"
        ] })
      ]
    }
  );
}
function Gr({
  showController: t = !0,
  showDebugPanel: n = !0,
  controllerProps: e = {},
  debugPanelProps: r = {}
}) {
  return /* @__PURE__ */ m(N, { children: [
    t && /* @__PURE__ */ c(
      pt,
      {
        position: "bottom-left",
        showLabels: !0,
        compact: !1,
        ...e
      }
    ),
    n && /* @__PURE__ */ c(
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
function Wr({ text: t, position: n, teleportStyle: e }) {
  const { teleport: r, canTeleport: o } = it();
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
        !o && /* @__PURE__ */ c("span", { className: "teleport__cooldown", children: "⏱️" })
      ]
    }
  );
}
function Wt() {
  return O((t) => t.time);
}
function Ur() {
  return O((t) => ({ hour: t.time.hour, minute: t.time.minute }));
}
function jr(t = !0) {
  const n = O((r) => r.tick), e = z(0);
  C(() => {
    if (!t) return;
    let r = 0, o = !0;
    const s = (i) => {
      if (!o) return;
      const a = e.current || i, u = i - a;
      e.current = i, n(u), r = requestAnimationFrame(s);
    };
    return r = requestAnimationFrame(s), () => {
      o = !1, cancelAnimationFrame(r);
    };
  }, [t, n]);
}
function qr(t) {
  const n = O((e) => e.addListener);
  C(() => n((e) => {
    e.kind === "newDay" && t(e.time);
  }), [n, t]);
}
function $r(t) {
  const n = O((e) => e.addListener);
  C(() => n((e) => {
    e.kind === "newHour" && t(e.time);
  }), [n, t]);
}
const Ut = {
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
function Nr() {
  const t = Wt(), n = String(t.hour).padStart(2, "0"), e = String(t.minute).padStart(2, "0");
  return /* @__PURE__ */ c(
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
        /* @__PURE__ */ c(
          "span",
          {
            style: {
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: Ut[t.season] ?? "#fff"
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
const qt = [
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
function Vr() {
  _().registerAll(qt);
}
const $t = ["axe", "shovel", "water-can", "net", "rod", "apple"];
function Nt(t, n, e) {
  const r = t.slice();
  for (let o = r.length - 1; o > 0; o--) {
    const s = Math.floor(e() * (o + 1));
    [r[o], r[s]] = [r[s], r[o]];
  }
  return r.slice(0, Math.min(n, r.length));
}
function Vt(t) {
  let n = t | 0 || 1;
  return () => (n = n * 1664525 + 1013904223 | 0, (n >>> 0) / 4294967295);
}
const le = W((t, n) => ({
  catalog: $t,
  dailyStock: [],
  lastRolledDay: -1,
  setCatalog: (e) => t({ catalog: e.slice() }),
  rollDailyStock: (e, r = 4) => {
    const o = n();
    if (o.lastRolledDay === e && o.dailyStock.length > 0) return;
    const s = Vt(e * 9301 + 49297), a = Nt(o.catalog, r, s).map((u) => {
      const l = _().get(u), d = l?.stackable ? 5 + Math.floor(s() * 6) : 1;
      return { itemId: u, price: l?.buyPrice ?? 100, stock: d };
    });
    t({ dailyStock: a, lastRolledDay: e });
  },
  buy: (e, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    const o = n(), s = o.dailyStock.findIndex((p) => p.itemId === e);
    if (s < 0) return { ok: !1, reason: "not in stock" };
    const i = o.dailyStock[s], a = i.stock ?? 0;
    if (a < r) return { ok: !1, reason: "insufficient stock" };
    const u = (i.price ?? n().priceOf(e)) * r, l = K.getState();
    if (l.bells < u) return { ok: !1, reason: "insufficient bells" };
    if (!l.spend(u)) return { ok: !1, reason: "spend failed" };
    if (E.getState().add(e, r) > 0)
      return l.add(u), { ok: !1, reason: "inventory full" };
    const f = o.dailyStock.slice();
    return f[s] = { ...i, stock: a - r }, t({ dailyStock: f }), { ok: !0 };
  },
  sell: (e, r = 1) => {
    if (r <= 0) return { ok: !1, reason: "invalid count" };
    if (E.getState().countOf(e) < r) return { ok: !1, reason: "not enough items" };
    const s = E.getState().removeById(e, r);
    if (s < r) return { ok: !1, reason: "remove failed" };
    const i = n().sellPriceOf(e) * s;
    return i > 0 && K.getState().add(i), { ok: !0 };
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
function Hr({ position: t = "top-center" }) {
  const n = K((r) => r.bells);
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
        /* @__PURE__ */ c("span", { style: {
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
        /* @__PURE__ */ c("span", { style: { fontWeight: 700 }, children: n.toLocaleString() })
      ]
    }
  );
}
function Yr({ open: t, onClose: n, title: e = "Shop" }) {
  const [r, o] = D("buy"), s = le((p) => p.dailyStock), i = le((p) => p.buy), a = le((p) => p.sell), u = le((p) => p.sellPriceOf), l = K((p) => p.bells), d = E((p) => p.slots);
  if (!t) return null;
  const f = (() => {
    const p = /* @__PURE__ */ new Map();
    for (const h of d)
      h && p.set(h.itemId, (p.get(h.itemId) ?? 0) + h.count);
    return Array.from(p.entries()).filter(([h]) => u(h) > 0);
  })();
  return /* @__PURE__ */ c(
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
              /* @__PURE__ */ c("strong", { style: { fontSize: 15 }, children: e }),
              /* @__PURE__ */ m("span", { style: { color: "#ffd84a" }, children: [
                l.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ c("button", { onClick: n, style: ct(), children: "닫기" })
            ] }),
            /* @__PURE__ */ m("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: [
              /* @__PURE__ */ c(Ge, { active: r === "buy", onClick: () => o("buy"), children: "구매" }),
              /* @__PURE__ */ c(Ge, { active: r === "sell", onClick: () => o("sell"), children: "판매" })
            ] }),
            /* @__PURE__ */ m("div", { style: { overflowY: "auto", padding: 10 }, children: [
              r === "buy" && (s.length === 0 ? /* @__PURE__ */ c("div", { style: { opacity: 0.7, padding: 12 }, children: "오늘 상품이 없습니다." }) : s.map((p) => {
                const h = _().get(p.itemId), b = p.price ?? h?.buyPrice ?? 0, k = p.stock ?? 0;
                return /* @__PURE__ */ c(
                  We,
                  {
                    ...h?.color ? { color: h.color } : {},
                    name: h?.name ?? p.itemId,
                    sub: `재고 ${k}`,
                    price: b,
                    disabled: k <= 0 || l < b,
                    actionLabel: "구매",
                    onAction: () => {
                      const x = i(p.itemId, 1);
                      x.ok ? F("success", `${h?.name ?? p.itemId} 구매`) : F("warn", `구매 실패: ${x.reason ?? ""}`);
                    }
                  },
                  p.itemId
                );
              })),
              r === "sell" && (f.length === 0 ? /* @__PURE__ */ c("div", { style: { opacity: 0.7, padding: 12 }, children: "판매할 아이템이 없습니다." }) : f.map(([p, h]) => {
                const b = _().get(p), k = u(p);
                return /* @__PURE__ */ c(
                  We,
                  {
                    ...b?.color ? { color: b.color } : {},
                    name: b?.name ?? p,
                    sub: `보유 ${h}`,
                    price: k,
                    actionLabel: "판매",
                    onAction: () => {
                      const x = a(p, 1);
                      x.ok ? F("reward", `${b?.name ?? p} 판매 +${k} B`) : F("warn", `판매 실패: ${x.reason ?? ""}`);
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
function Ge({ active: t, onClick: n, children: e }) {
  return /* @__PURE__ */ c(
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
function We({
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
    /* @__PURE__ */ c("span", { style: {
      width: 22,
      height: 22,
      borderRadius: 6,
      background: t ?? "#888"
    } }),
    /* @__PURE__ */ m("div", { style: { flex: 1 }, children: [
      /* @__PURE__ */ c("div", { children: n }),
      e && /* @__PURE__ */ c("div", { style: { fontSize: 11, opacity: 0.7 }, children: e })
    ] }),
    /* @__PURE__ */ m("div", { style: { color: "#ffd84a", minWidth: 64, textAlign: "right" }, children: [
      r.toLocaleString(),
      " B"
    ] }),
    /* @__PURE__ */ c("button", { onClick: s, disabled: i, style: ct(i), children: o })
  ] });
}
function ct(t) {
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
function Kr({
  useKey: t = "f",
  range: n = 2.4,
  cooldownMs: e = 350
} = {}) {
  const { position: r, rotation: o } = ee({ updateInterval: 16 }), s = z(0);
  return C(() => {
    const i = `Key${t.toUpperCase()}`, a = t.toLowerCase(), u = (l) => {
      const d = l.target?.tagName?.toLowerCase();
      if (d === "input" || d === "textarea" || l.code !== i && l.key.toLowerCase() !== a) return;
      const f = performance.now();
      if (f - s.current < e) return;
      const p = E.getState().getEquipped();
      if (!p) return;
      const h = _().get(p.itemId);
      if (!h?.toolKind) return;
      const b = h.toolKind, k = o?.y ?? 0, x = new S.Vector3(Math.sin(k), 0, Math.cos(k)).normalize();
      s.current = f, ft().emit({
        kind: b,
        origin: [r.x, r.y, r.z],
        direction: [x.x, x.y, x.z],
        range: n,
        timestamp: f
      });
    };
    return window.addEventListener("keydown", u), () => window.removeEventListener("keydown", u);
  }, [t, e, n, r, o]), null;
}
let Ht = 0;
function Yt() {
  return `mail_${Date.now().toString(36)}_${(++Ht).toString(36)}`;
}
function Kt(t) {
  return t.itemId !== void 0;
}
const ce = W((t, n) => ({
  messages: [],
  send: (e) => {
    const r = e.id ?? Yt(), o = {
      id: r,
      from: e.from,
      subject: e.subject,
      body: e.body,
      sentDay: e.sentDay,
      ...e.attachments ? { attachments: e.attachments } : {},
      read: !1,
      claimed: !e.attachments || e.attachments.length === 0
    };
    return t({ messages: [...n().messages, o] }), F("mail", `새 우편: ${e.subject}`), r;
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
      if (Kt(s)) {
        if (E.getState().add(s.itemId, s.count ?? 1) > 0) {
          o = !1, F("warn", "인벤토리 부족, 일부 우편물 미수령");
          break;
        }
      } else
        K.getState().add(s.bells);
    return o && (t({ messages: n().messages.map((s) => s.id === e ? { ...s, claimed: !0, read: !0 } : s) }), F("reward", "우편 첨부물 수령")), o;
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
function Xr({ toggleKey: t = "m" }) {
  const [n, e] = D(!1), [r, o] = D(null), s = ce((f) => f.messages), i = ce((f) => f.markRead), a = ce((f) => f.claim), u = ce((f) => f.delete);
  if (C(() => {
    const f = (p) => {
      const h = p.target?.tagName?.toLowerCase();
      h === "input" || h === "textarea" || (p.key.toLowerCase() === t.toLowerCase() && e((b) => !b), p.key === "Escape" && e(!1));
    };
    return window.addEventListener("keydown", f), () => window.removeEventListener("keydown", f);
  }, [t]), !n) return null;
  const l = s.slice().sort((f, p) => p.sentDay - f.sentDay), d = r ? l.find((f) => f.id === r) ?? null : null;
  return /* @__PURE__ */ c(
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
                /* @__PURE__ */ c("strong", { children: "우편함" }),
                /* @__PURE__ */ c("span", { style: { fontSize: 12, opacity: 0.7 }, children: l.length })
              ] }),
              /* @__PURE__ */ c("div", { style: { flex: 1, overflowY: "auto" }, children: l.length === 0 ? /* @__PURE__ */ c(Qt, { children: "우편이 없습니다." }) : l.map((f) => /* @__PURE__ */ m(
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
                      !f.read && /* @__PURE__ */ c("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "#cf9aff" } }),
                      /* @__PURE__ */ c("strong", { style: { fontSize: 13 }, children: f.subject })
                    ] }),
                    /* @__PURE__ */ m("div", { style: { fontSize: 11, opacity: 0.6 }, children: [
                      f.from,
                      " · day ",
                      f.sentDay
                    ] }),
                    f.attachments && f.attachments.length > 0 && !f.claimed && /* @__PURE__ */ c("div", { style: { fontSize: 11, color: "#ffd84a" }, children: "* 첨부물" })
                  ]
                },
                f.id
              )) })
            ] }),
            /* @__PURE__ */ m("div", { style: { flex: 1, display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ m("div", { style: { padding: "10px 12px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ c("span", { children: d ? d.subject : "메시지를 선택하세요" }),
                /* @__PURE__ */ m("button", { onClick: () => e(!1), style: Ee(), children: [
                  "닫기 [",
                  t.toUpperCase(),
                  "]"
                ] })
              ] }),
              /* @__PURE__ */ c("div", { style: { flex: 1, padding: 12, overflowY: "auto" }, children: d ? /* @__PURE__ */ c(Xt, { msg: d, onClaim: () => a(d.id), onDelete: () => {
                u(d.id), o(null);
              } }) : /* @__PURE__ */ c("div", { style: { opacity: 0.6 }, children: "왼쪽에서 메시지를 선택하세요." }) })
            ] })
          ]
        }
      )
    }
  );
}
function Xt({ msg: t, onClaim: n, onDelete: e }) {
  return /* @__PURE__ */ m("div", { children: [
    /* @__PURE__ */ m("div", { style: { marginBottom: 6, opacity: 0.75 }, children: [
      "From. ",
      t.from
    ] }),
    /* @__PURE__ */ c("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 12 }, children: t.body }),
    t.attachments && t.attachments.length > 0 && /* @__PURE__ */ m("div", { style: { padding: 10, background: "#222", borderRadius: 8, marginBottom: 8 }, children: [
      /* @__PURE__ */ c("div", { style: { marginBottom: 6, color: "#ffd84a", fontSize: 12 }, children: "첨부물" }),
      /* @__PURE__ */ c("ul", { style: { margin: 0, paddingLeft: 18 }, children: t.attachments.map((r, o) => {
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
      /* @__PURE__ */ c("div", { style: { marginTop: 8, display: "flex", gap: 6, justifyContent: "flex-end" }, children: t.claimed ? /* @__PURE__ */ c("span", { style: { fontSize: 12, opacity: 0.6 }, children: "수령 완료" }) : /* @__PURE__ */ c("button", { onClick: n, style: Ee(!0), children: "받기" }) })
    ] }),
    /* @__PURE__ */ c("div", { style: { display: "flex", justifyContent: "flex-end" }, children: /* @__PURE__ */ c("button", { onClick: e, style: Ee(), children: "삭제" }) })
  ] });
}
function Qt({ children: t }) {
  return /* @__PURE__ */ c("div", { style: { padding: 14, opacity: 0.6 }, children: t });
}
function Ee(t) {
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
const Ue = ["fish", "bug", "food", "material", "furniture", "tool", "misc"], dt = W((t, n) => ({
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
function Qr(t = !0) {
  C(() => t ? E.subscribe((e, r) => {
    if (e.slots === r.slots) return;
    const o = Math.floor(O.getState().totalMinutes / (60 * 24)), s = /* @__PURE__ */ new Map();
    for (const a of r.slots) a && s.set(a.itemId, (s.get(a.itemId) ?? 0) + a.count);
    const i = /* @__PURE__ */ new Map();
    for (const a of e.slots) a && i.set(a.itemId, (i.get(a.itemId) ?? 0) + a.count);
    for (const [a, u] of i.entries()) {
      const l = u - (s.get(a) ?? 0);
      l > 0 && dt.getState().record(a, l, o);
    }
  }) : void 0, [t]);
}
function Zr({ toggleKey: t = "k" }) {
  const [n, e] = D(!1), [r, o] = D("fish"), s = dt((d) => d.entries);
  C(() => {
    const d = (f) => {
      const p = f.target?.tagName?.toLowerCase();
      p === "input" || p === "textarea" || (f.key.toLowerCase() === t.toLowerCase() && e((h) => !h), f.key === "Escape" && e(!1));
    };
    return window.addEventListener("keydown", d), () => window.removeEventListener("keydown", d);
  }, [t]);
  const i = T(() => _().all(), []), a = T(() => {
    const d = /* @__PURE__ */ new Map();
    for (const f of Ue) d.set(f, []);
    for (const f of i) {
      const p = d.get(f.category);
      p && p.push(f);
    }
    return d;
  }, [i]);
  if (!n) return null;
  const u = a.get(r) ?? [], l = u.filter((d) => s[d.id]).length;
  return /* @__PURE__ */ c(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: () => e(!1),
      children: /* @__PURE__ */ m(
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
            /* @__PURE__ */ m("div", { style: { padding: "10px 14px", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ c("strong", { style: { fontSize: 15 }, children: "도감" }),
              /* @__PURE__ */ m("button", { onClick: () => e(!1), style: Zt(), children: [
                "닫기 [",
                t.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ c("div", { style: { display: "flex", borderBottom: "1px solid #333" }, children: Ue.map((d) => {
              const f = a.get(d) ?? [];
              if (f.length === 0) return null;
              const p = f.filter((h) => s[h.id]).length;
              return /* @__PURE__ */ m(
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
                    je(d),
                    " (",
                    p,
                    "/",
                    f.length,
                    ")"
                  ]
                },
                d
              );
            }) }),
            /* @__PURE__ */ m("div", { style: { padding: "6px 14px", fontSize: 12, opacity: 0.7 }, children: [
              je(r),
              " — ",
              l,
              "/",
              u.length,
              " 수집"
            ] }),
            /* @__PURE__ */ m("div", { style: { flex: 1, overflowY: "auto", padding: 10, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }, children: [
              u.map((d) => {
                const f = s[d.id], p = !!f;
                return /* @__PURE__ */ m("div", { style: {
                  padding: 10,
                  borderRadius: 8,
                  background: p ? "#222" : "#181818",
                  border: p ? "1px solid #2e3" : "1px solid #2a2a2a",
                  opacity: p ? 1 : 0.4
                }, children: [
                  /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }, children: [
                    /* @__PURE__ */ c("span", { style: { width: 16, height: 16, borderRadius: 4, background: d.color ?? "#888" } }),
                    /* @__PURE__ */ c("strong", { style: { fontSize: 13 }, children: p ? d.name : "???" })
                  ] }),
                  p && /* @__PURE__ */ m("div", { style: { fontSize: 11, opacity: 0.7 }, children: [
                    "수집 ",
                    f.totalCollected,
                    " · day ",
                    f.firstSeenDay
                  ] })
                ] }, d.id);
              }),
              u.length === 0 && /* @__PURE__ */ c("div", { style: { opacity: 0.6 }, children: "이 카테고리에는 항목이 없습니다." })
            ] })
          ]
        }
      )
    }
  );
}
function je(t) {
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
function Zt() {
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
class Jt {
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
  return xe || (xe = new Jt()), xe;
}
const ve = W((t, n) => ({
  unlocked: /* @__PURE__ */ new Set(),
  unlock: (e) => {
    const r = ie().get(e);
    if (!r || n().unlocked.has(e)) return;
    const o = new Set(n().unlocked);
    o.add(e), t({ unlocked: o }), F("info", `레시피 해금: ${r.name}`);
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
    return r.requireBells && K.getState().bells < r.requireBells ? { ok: !1, reason: "insufficient bells" } : { ok: !0 };
  },
  craft: (e) => {
    const r = n().canCraft(e);
    if (!r.ok) return r;
    const o = ie().require(e), s = E.getState();
    for (const a of o.ingredients)
      if (s.removeById(a.itemId, a.count) < a.count) return { ok: !1, reason: "remove failed" };
    return o.requireBells && !K.getState().spend(o.requireBells) ? { ok: !1, reason: "spend failed" } : (s.add(o.output.itemId, o.output.count) > 0 ? F("warn", "인벤토리 부족, 일부 결과물 폐기") : F("reward", `제작 완료: ${o.name}`), { ok: !0 });
  },
  serialize: () => ({ version: 1, unlocked: Array.from(n().unlocked) }),
  hydrate: (e) => {
    !e || !Array.isArray(e.unlocked) || t({ unlocked: new Set(e.unlocked) });
  }
}));
function Jr({ toggleKey: t = "c", title: n = "제작대", open: e, onClose: r }) {
  const [o, s] = D(!1), i = e !== void 0, a = i ? e : o, u = () => {
    i ? r?.() : s(!1);
  }, l = () => {
    i ? a && r?.() : s((g) => !g);
  }, d = ve((g) => g.isUnlocked), f = ve((g) => g.canCraft), p = ve((g) => g.craft), h = E((g) => g.slots), b = K((g) => g.bells);
  if (C(() => {
    const g = (v) => {
      const w = v.target?.tagName?.toLowerCase();
      w === "input" || w === "textarea" || (v.key.toLowerCase() === t.toLowerCase() && l(), v.key === "Escape" && u());
    };
    return window.addEventListener("keydown", g), () => window.removeEventListener("keydown", g);
  }, [t, i, a]), !a) return null;
  const k = ie().all(), x = (() => {
    const g = /* @__PURE__ */ new Map();
    for (const v of h) v && g.set(v.itemId, (g.get(v.itemId) ?? 0) + v.count);
    return g;
  })();
  return /* @__PURE__ */ c(
    "div",
    {
      style: { position: "fixed", inset: 0, zIndex: 130, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" },
      onClick: u,
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
              /* @__PURE__ */ c("strong", { style: { fontSize: 15 }, children: n }),
              /* @__PURE__ */ m("span", { style: { color: "#ffd84a" }, children: [
                b.toLocaleString(),
                " B"
              ] }),
              /* @__PURE__ */ m("button", { onClick: u, style: qe(), children: [
                "닫기 [",
                t.toUpperCase(),
                "]"
              ] })
            ] }),
            /* @__PURE__ */ m("div", { style: { overflowY: "auto", padding: 10 }, children: [
              k.length === 0 && /* @__PURE__ */ c(en, { children: "레시피가 없습니다." }),
              k.map((g) => {
                const v = d(g.id), w = f(g.id), I = _().get(g.output.itemId);
                return /* @__PURE__ */ m("div", { style: {
                  padding: 10,
                  marginBottom: 6,
                  background: "#222",
                  borderRadius: 8,
                  opacity: v ? 1 : 0.45
                }, children: [
                  /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }, children: [
                    /* @__PURE__ */ m("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                      /* @__PURE__ */ c("span", { style: { width: 16, height: 16, borderRadius: 4, background: I?.color ?? "#888" } }),
                      /* @__PURE__ */ c("strong", { children: v ? g.name : "???" }),
                      g.output.count > 1 && /* @__PURE__ */ m("span", { style: { opacity: 0.7 }, children: [
                        "x",
                        g.output.count
                      ] })
                    ] }),
                    /* @__PURE__ */ c(
                      "button",
                      {
                        onClick: () => p(g.id),
                        disabled: !w.ok,
                        style: qe(w.ok),
                        children: "제작"
                      }
                    )
                  ] }),
                  v && /* @__PURE__ */ m("div", { style: { fontSize: 12, opacity: 0.85 }, children: [
                    "재료: ",
                    g.ingredients.map((M) => {
                      const A = x.get(M.itemId) ?? 0, y = A >= M.count, P = _().get(M.itemId);
                      return /* @__PURE__ */ m("span", { style: { marginRight: 8, color: y ? "#7adf90" : "#ff8a8a" }, children: [
                        P?.name ?? M.itemId,
                        " ",
                        A,
                        "/",
                        M.count
                      ] }, M.itemId);
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
function en({ children: t }) {
  return /* @__PURE__ */ c("div", { style: { padding: 14, opacity: 0.6 }, children: t });
}
function qe(t) {
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
let we = null;
function Z() {
  return we || (we = new tn()), we;
}
function $e(t, n) {
  return { id: t, position: n, state: "empty", stageIndex: 0 };
}
function nn(t, n) {
  if (t.state !== "planted" && t.state !== "mature") return t.stageIndex;
  const e = t.cropId ? Z().get(t.cropId) : void 0;
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
    const s = n().plots[e], i = Z().get(r);
    if (!s || !i || s.state !== "tilled") return !1;
    const a = E.getState();
    return a.countOf(i.seedItemId) < 1 ? (F("warn", `${i.name} 씨앗 부족`), !1) : (a.removeById(i.seedItemId, 1), t({
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
    }), F("success", `${i.name} 심음`), !0);
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
    const o = Z().get(r.cropId);
    return o ? E.getState().add(o.yieldItemId, o.yieldCount) > 0 ? (F("warn", "인벤토리가 가득 찼습니다"), !1) : (F("reward", `${o.name} +${o.yieldCount}`), t({
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
      let u = a;
      if (u.state === "planted" || u.state === "mature") {
        const l = u.cropId ? Z().get(u.cropId) : void 0;
        if (l && u.plantedAt !== void 0) {
          const d = u.lastWateredAt ?? u.plantedAt;
          if (e - d >= l.driedOutMinutes)
            u = { ...u, state: "dried" }, s = !0;
          else {
            const f = nn(u, e), p = l.stages.length - 1, h = f >= p ? "mature" : "planted";
            (f !== u.stageIndex || h !== u.state) && (u = { ...u, stageIndex: f, state: h }, s = !0);
          }
        }
      }
      o[i] = u;
    }
    s && t({ plots: o });
  },
  near: (e, r, o) => {
    const s = o * o;
    let i = null, a = 1 / 0;
    for (const u of Object.values(n().plots)) {
      const l = u.position[0] - e, d = u.position[2] - r, f = l * l + d * d;
      f < s && f < a && (a = f, i = u);
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
function eo({ id: t, position: n, size: e = 1.4, hitRange: r = 1.6 }) {
  const o = G((w) => w.registerPlot), s = G((w) => w.unregisterPlot), i = G((w) => w.plots[t]), a = G((w) => w.till), u = G((w) => w.plant), l = G((w) => w.water), d = G((w) => w.harvest), f = G((w) => w.tick);
  C(() => (o({ id: t, position: n }), () => s(t)), [t, n, o, s]), C(() => {
    let w = 0;
    const I = O.subscribe((M) => {
      M.totalMinutes !== w && (w = M.totalMinutes, f(M.totalMinutes));
    });
    return f(O.getState().totalMinutes), I;
  }, [f]);
  const p = q((w) => {
    const I = G.getState().plots[t];
    if (!(!I || !Se(I, w, r))) {
      if (I.state === "mature") return d(t) ? !0 : void 0;
      if (I.state === "empty") {
        const M = a(t);
        return M && F("info", "땅을 갈았다"), M ? !0 : void 0;
      }
    }
  }, [t, r, a, d]), h = q((w) => {
    const I = G.getState().plots[t];
    if (!I || !Se(I, w, r) || I.state !== "tilled") return;
    const M = E.getState().getEquipped();
    if (!M) return;
    const A = Z().bySeedItemId(M.itemId);
    if (!A) return;
    const y = O.getState().totalMinutes;
    return u(t, A.id, y) ? !0 : void 0;
  }, [t, r, u]), b = q((w) => {
    const I = G.getState().plots[t];
    if (!I || !Se(I, w, r) || I.state !== "planted" && I.state !== "dried") return;
    const M = O.getState().totalMinutes, A = l(t, M);
    return A && F("info", "물을 줬다"), A ? !0 : void 0;
  }, [t, r, l]);
  be("shovel", p), be("seed", h), be("water", b);
  const k = i?.cropId ? Z().get(i.cropId) : void 0, x = k ? k.stages[i.stageIndex] : void 0, g = T(() => !i || i.state === "empty" ? "#5a3f24" : i.state === "tilled" ? "#4a2f18" : i.state === "dried" ? "#6b5230" : "#3a2810", [i]), v = z(null);
  return X(({ clock: w }) => {
    const I = v.current;
    if (!I) return;
    const M = w.elapsedTime;
    I.rotation.y = Math.sin(M * 0.4) * 0.05, I.position.y = (x?.scale ?? 0.3) * 0.5 + Math.sin(M * 1.2) * 0.01;
  }), /* @__PURE__ */ m("group", { position: n, children: [
    /* @__PURE__ */ m("mesh", { receiveShadow: !0, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: [
      /* @__PURE__ */ c("planeGeometry", { args: [e, e] }),
      /* @__PURE__ */ c("meshToonMaterial", { color: g })
    ] }),
    i && (i.state === "planted" || i.state === "mature" || i.state === "dried") && k && x && /* @__PURE__ */ m("mesh", { ref: v, castShadow: !0, position: [0, x.scale * 0.5, 0], children: [
      /* @__PURE__ */ c("coneGeometry", { args: [Math.max(0.08, x.scale * 0.35), Math.max(0.16, x.scale * 0.9), 10] }),
      /* @__PURE__ */ c("meshToonMaterial", { color: i.state === "dried" ? "#7a6a4a" : x.color ?? "#9adf90" })
    ] }),
    i?.state === "mature" && /* @__PURE__ */ m("mesh", { position: [0, 1, 0], children: [
      /* @__PURE__ */ c("ringGeometry", { args: [0.18, 0.24, 16] }),
      /* @__PURE__ */ c("meshBasicMaterial", { color: "#ffd84a", transparent: !0, opacity: 0.85, depthWrite: !1 })
    ] })
  ] });
}
const rn = [
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
let Ne = !1;
function to() {
  Ne || (Ne = !0, Z().registerAll(rn));
}
const on = {
  sunny: { sym: "O", color: "#ffd84a", label: "맑음" },
  cloudy: { sym: "c", color: "#aab2bc", label: "흐림" },
  rain: { sym: "r", color: "#4aa8ff", label: "비" },
  snow: { sym: "*", color: "#dff0ff", label: "눈" },
  storm: { sym: "!", color: "#7f7fff", label: "폭풍" }
};
function no({ position: t = "top-left" }) {
  const n = J((o) => o.current);
  if (!n) return null;
  const e = on[n.kind], r = t === "top-right" ? { top: 50, right: 12 } : { top: 50, left: 12 };
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
        /* @__PURE__ */ c("span", { style: {
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
        /* @__PURE__ */ c("span", { children: e.label })
      ]
    }
  );
}
function ro(t = !0) {
  C(() => {
    if (!t) return;
    const n = () => {
      const r = O.getState(), o = Math.floor(r.totalMinutes / (60 * 24)), s = J.getState().current;
      (!s || s.day !== o) && J.getState().rollForDay(o, r.time.season);
    };
    return n(), O.subscribe((r, o) => {
      const s = Math.floor(r.totalMinutes / 1440), i = Math.floor(o.totalMinutes / (60 * 24));
      s !== i && n();
    });
  }, [t]);
}
function Ve(t, n) {
  return { id: t, position: n, size: [4, 4], state: "empty" };
}
const V = W((t, n) => ({
  houses: {},
  residents: {},
  decorationScore: 0,
  registerHouse: (e) => {
    if (n().houses[e.id]) return;
    const o = { ...Ve(e.id, e.position), ...e };
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
    }), F("reward", `${i.name}이(가) 이사 왔다!`), !0);
  },
  moveOut: (e) => {
    const r = n().houses[e];
    if (!r || r.state !== "occupied") return !1;
    const o = r.residentId ? n().residents[r.residentId] : null;
    return t({
      houses: {
        ...n().houses,
        [e]: Ve(e, r.position)
      }
    }), o && F("info", `${o.name}이(가) 떠났다`), !0;
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
})), sn = {
  tile: 2,
  wall: 1,
  placedObject: 5,
  base: 0
};
function oo(t = !0, n = {}) {
  C(() => {
    if (!t) return;
    const e = { ...sn, ...n }, r = (s) => {
      let i = 0, a = 0;
      const u = s.objects.length;
      for (const d of s.tileGroups.values())
        i += d.tiles.length;
      for (const d of s.wallGroups.values())
        a += d.walls.length;
      const l = e.base + i * e.tile + a * e.wall + u * e.placedObject;
      V.getState().setDecorationScore(l);
    };
    return r(fe.getState()), fe.subscribe((s) => r(s));
  }, [t, n.tile, n.wall, n.placedObject, n.base]);
}
function so({
  id: t,
  position: n,
  size: e = [4, 4],
  emptyColor: r = "#705038",
  reservedColor: o = "#c8a85a",
  occupiedColor: s = "#5a8acf"
}) {
  const i = V((h) => h.registerHouse), a = V((h) => h.unregisterHouse), u = V((h) => h.houses[t]), l = V((h) => h.residents);
  C(() => (i({ id: t, position: n, size: e }), () => a(t)), [t, n, e, i, a]);
  const d = u ? u.state === "occupied" ? s : u.state === "reserved" ? o : r : r, f = u?.residentId ? l[u.residentId] : null, p = T(() => new S.PlaneGeometry(e[0], e[1]), [e[0], e[1]]);
  return /* @__PURE__ */ m("group", { position: n, children: [
    /* @__PURE__ */ c("mesh", { geometry: p, rotation: [-Math.PI / 2, 0, 0], position: [0, 5e-3, 0], children: /* @__PURE__ */ c("meshToonMaterial", { color: d, transparent: !0, opacity: 0.7 }) }),
    u?.state === "occupied" && f && /* @__PURE__ */ m(N, { children: [
      /* @__PURE__ */ m("mesh", { position: [0, 0.6, 0], castShadow: !0, children: [
        /* @__PURE__ */ c("boxGeometry", { args: [Math.max(1.4, e[0] * 0.6), 1.2, Math.max(1.4, e[1] * 0.6)] }),
        /* @__PURE__ */ c("meshToonMaterial", { color: f.bodyColor ?? "#e8d8b8" })
      ] }),
      /* @__PURE__ */ m("mesh", { position: [0, 1.5, 0], castShadow: !0, children: [
        /* @__PURE__ */ c("coneGeometry", { args: [Math.max(1, e[0] * 0.45), 0.7, 4] }),
        /* @__PURE__ */ c("meshToonMaterial", { color: f.hatColor ?? "#a85a5a" })
      ] })
    ] }),
    u?.state === "reserved" && /* @__PURE__ */ m("mesh", { position: [0, 0.5, 0], children: [
      /* @__PURE__ */ c("boxGeometry", { args: [0.4, 1, 0.4] }),
      /* @__PURE__ */ c("meshToonMaterial", { color: o })
    ] })
  ] });
}
function io({ position: t = "top-right", offset: n }) {
  const e = V((d) => d.decorationScore), r = V((d) => d.houses), o = V((d) => d.residents), s = Object.keys(r).length, i = Object.values(r).filter((d) => d.state === "occupied").length, a = Object.keys(o).length, l = { ...t === "bottom-right" ? { bottom: 12, right: 100 } : t === "top-left" ? { top: 160, left: 12 } : t === "bottom-left" ? { bottom: 12, left: 240 } : { top: 50, right: 12 }, ...n ?? {} };
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
          /* @__PURE__ */ c("span", { style: { color: "#ffd84a", fontWeight: 700 }, children: e })
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
class an {
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
      const i = e[this.bgmStep % e.length] ?? 0, a = o * Math.pow(2, i / 12), u = this.ctx.createOscillator(), l = this.ctx.createGain();
      u.type = "triangle", u.frequency.value = a;
      const d = this.ctx.currentTime;
      l.gain.setValueAtTime(0, d), l.gain.linearRampToValueAtTime((n.volume ?? 1) * 0.18, d + 0.04), l.gain.exponentialRampToValueAtTime(1e-4, d + r / 1e3 * 0.95), u.connect(l), l.connect(this.bgmGain), u.start(d), u.stop(d + r / 1e3 + 0.05), this.bgmStep += 1;
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
  return ke || (ke = new an()), ke;
}
const j = W((t, n) => ({
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
})), ln = [0, 2, 4, 5, 7, 9, 11], cn = [0, 2, 3, 5, 7, 8, 10];
function dn(t) {
  return t === "rain" || t === "storm" || t === "snow" ? cn : ln;
}
function un(t) {
  return t < 6 ? "night" : t < 10 ? "dawn" : t < 18 ? "day" : t < 22 ? "dusk" : "night";
}
function fn(t, n) {
  const e = un(t), r = dn(n), o = e === "night" ? 174.6 : e === "dawn" ? 220 : e === "dusk" ? 196 : 261.6, s = e === "day" ? 700 : 950, i = [r[0], r[2], r[4], r[2], r[0], r[3], r[1], r[4]];
  return {
    id: `bgm.${e}.${n ?? "unknown"}`,
    baseFreq: o,
    intervalMs: s,
    pattern: i,
    volume: n === "storm" ? 0.6 : 1
  };
}
function ao(t = !0) {
  C(() => {
    if (!t) return;
    const n = () => {
      const o = O.getState(), s = J.getState().current, i = fn(o.time.hour, s?.kind);
      j.getState().currentBgmId !== i.id && j.getState().playBgm(i);
    }, e = O.subscribe((o, s) => {
      o.time.hour !== s.time.hour && n();
    }), r = J.subscribe((o, s) => {
      o.current?.kind !== s.current?.kind && n();
    });
    return n(), () => {
      e(), r(), j.getState().stopBgm();
    };
  }, [t]);
}
function lo({ position: t = "bottom-right", offset: n }) {
  const e = j((f) => f.masterMuted), r = j((f) => f.bgmMuted), o = j((f) => f.sfxMuted), s = j((f) => f.toggleMaster), i = j((f) => f.toggleBgm), a = j((f) => f.toggleSfx), l = { ...t === "top-right" ? { top: 50, right: 200 } : t === "bottom-left" ? { bottom: 12, left: 240 } : t === "top-left" ? { top: 220, left: 12 } : { bottom: 12, right: 110 }, ...n ?? {} }, d = (f, p, h) => /* @__PURE__ */ m(
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
        d("M", e, s),
        d("Bgm", r, i),
        d("Sfx", o, a)
      ]
    }
  );
}
const pn = {
  grass: { freq: 320, duration: 0.07, type: "triangle", volume: 0.18 },
  sand: { freq: 220, duration: 0.1, type: "sine", volume: 0.2 },
  snow: { freq: 380, duration: 0.1, type: "triangle", volume: 0.22 },
  wood: { freq: 540, duration: 0.06, type: "square", volume: 0.14 },
  stone: { freq: 760, duration: 0.05, type: "square", volume: 0.16 },
  water: { freq: 180, duration: 0.13, type: "sine", volume: 0.24 }
};
function mn(t, n) {
  const e = vt.GRID_CELL_SIZE, r = fe.getState().tileGroups;
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
function co({
  strideMeters: t = 0.65,
  maxStepsPerSecond: n = 6,
  volume: e = 1,
  resolveSurface: r = mn,
  enabled: o = !0
} = {}) {
  const { position: s, isGrounded: i, isMoving: a, speed: u } = ee({ updateInterval: 32 }), l = z({ x: s.x, z: s.z }), d = z(0), f = z(0);
  return C(() => {
    l.current.x = s.x, l.current.z = s.z;
  }, []), X(() => {
    if (!o) return;
    const p = performance.now(), h = s.x - l.current.x, b = s.z - l.current.z;
    if (l.current.x = s.x, l.current.z = s.z, !i || !a) {
      d.current = 0;
      return;
    }
    const k = Math.hypot(h, b);
    if (k <= 0 || (d.current += k, d.current < t) || p - f.current < 1e3 / n) return;
    d.current = 0, f.current = p;
    const x = r(s.x, s.z), g = pn[x], v = Math.min(1.4, 0.7 + u * 0.06);
    j.getState().playSfx({
      id: `footstep-${x}`,
      type: g.type ?? "sine",
      freq: g.freq ?? 320,
      duration: g.duration ?? 0.08,
      volume: (g.volume ?? 0.2) * e * v
    });
  }), null;
}
const gn = [
  { key: "body", label: "피부" },
  { key: "hair", label: "머리" },
  { key: "hat", label: "모자" },
  { key: "top", label: "상의" },
  { key: "bottom", label: "하의" },
  { key: "shoes", label: "신발" }
], hn = ["short", "long", "cap", "bun", "spiky"], yn = ["default", "smile", "wink", "sleepy", "surprised"], He = ["hat", "top", "bottom", "shoes", "face", "weapon", "accessory"], bn = (t, n) => n === "weapon" ? t.kind === "weapon" || t.slot === "weapon" : t.slot === n && (t.kind === "characterPart" || t.kind === "weapon");
function uo({ toggleKey: t, open: n, onClose: e } = {}) {
  const r = typeof n == "boolean", [o, s] = D(!1), i = r ? n : o, a = U((y) => y.appearance), u = U((y) => y.outfits), l = U((y) => y.setName), d = U((y) => y.setColor), f = U((y) => y.setHair), p = U((y) => y.setFace), h = U((y) => y.equipOutfit), b = U((y) => y.resetAppearance), k = Oe((y) => y.ids), x = Oe((y) => y.records), [g, v] = D(""), [w, I] = D(!1), M = T(() => {
    const y = g.trim().toLowerCase();
    return He.reduce((P, B) => (P[B] = k.map((R) => x[R]).filter((R) => !!R).filter((R) => bn(R, B)).filter((R) => y ? R.tags?.some((L) => L.toLowerCase().includes(y)) ?? !1 : !0).filter((R) => !w || R.metadata?.owned !== !1), P), {});
  }, [k, x, w, g]);
  if (C(() => {
    if (!t || r) return;
    const y = (P) => {
      const B = P.target?.tagName?.toLowerCase();
      if (B === "input" || B === "textarea") return;
      const R = t.toLowerCase(), L = `Key${t.toUpperCase()}`;
      P.code !== L && P.key.toLowerCase() !== R || s((te) => !te);
    };
    return window.addEventListener("keydown", y), () => window.removeEventListener("keydown", y);
  }, [t, r]), !i) return null;
  const A = () => {
    r ? e?.() : s(!1);
  };
  return /* @__PURE__ */ c(
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
              /* @__PURE__ */ c("h2", { style: { margin: 0, fontSize: 16, fontWeight: 600, flex: 1 }, children: "캐릭터 만들기" }),
              /* @__PURE__ */ c(
                "button",
                {
                  onClick: b,
                  style: Ie,
                  children: "기본값"
                }
              ),
              /* @__PURE__ */ c("button", { onClick: A, style: Ie, children: "닫기" })
            ] }),
            /* @__PURE__ */ m("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ c("label", { style: se, children: "이름" }),
              /* @__PURE__ */ c(
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
              /* @__PURE__ */ c("label", { style: se, children: "색상" }),
              /* @__PURE__ */ c("div", { style: Ye, children: gn.map(({ key: y, label: P }) => /* @__PURE__ */ m("div", { style: xn, children: [
                /* @__PURE__ */ c("span", { style: { flex: 1 }, children: P }),
                /* @__PURE__ */ c(
                  "input",
                  {
                    type: "color",
                    value: a.colors[y],
                    onChange: (B) => d(y, B.target.value),
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
              /* @__PURE__ */ c("label", { style: se, children: "헤어" }),
              /* @__PURE__ */ c("div", { style: Ke, children: hn.map((y) => /* @__PURE__ */ c(
                "button",
                {
                  onClick: () => f(y),
                  style: Xe(a.hair === y),
                  children: gt[y]
                },
                y
              )) })
            ] }),
            /* @__PURE__ */ m("section", { style: { marginBottom: 16 }, children: [
              /* @__PURE__ */ c("label", { style: se, children: "표정" }),
              /* @__PURE__ */ c("div", { style: Ke, children: yn.map((y) => /* @__PURE__ */ c(
                "button",
                {
                  onClick: () => p(y),
                  style: Xe(a.face === y),
                  children: ht[y]
                },
                y
              )) })
            ] }),
            /* @__PURE__ */ m("section", { children: [
              /* @__PURE__ */ m("div", { style: vn, children: [
                /* @__PURE__ */ c("label", { style: { ...se, marginBottom: 0 }, children: "장착 슬롯" }),
                /* @__PURE__ */ c(
                  "input",
                  {
                    value: g,
                    onChange: (y) => v(y.target.value),
                    placeholder: "태그 검색",
                    style: wn
                  }
                ),
                /* @__PURE__ */ m("label", { style: Sn, children: [
                  /* @__PURE__ */ c(
                    "input",
                    {
                      type: "checkbox",
                      checked: w,
                      onChange: (y) => I(y.target.checked)
                    }
                  ),
                  "보유만"
                ] })
              ] }),
              /* @__PURE__ */ c("div", { style: Ye, children: He.map((y) => /* @__PURE__ */ m("div", { style: kn, children: [
                /* @__PURE__ */ m("div", { style: In, children: [
                  /* @__PURE__ */ c("span", { children: yt[y] }),
                  /* @__PURE__ */ c("span", { style: { color: u[y] ? "#7adf90" : "rgba(243,244,248,0.45)" }, children: u[y] ?? "비어있음" }),
                  /* @__PURE__ */ c("button", { onClick: () => h(y, null), style: Ie, children: "비우기" })
                ] }),
                /* @__PURE__ */ m("div", { style: Cn, children: [
                  M[y].map((P) => /* @__PURE__ */ m(
                    "button",
                    {
                      onClick: () => h(y, P.id),
                      style: Mn(u[y] === P.id),
                      children: [
                        /* @__PURE__ */ c(kt, { asset: P, size: 58 }),
                        /* @__PURE__ */ c("span", { style: Rn, children: P.name })
                      ]
                    },
                    P.id
                  )),
                  M[y].length === 0 && /* @__PURE__ */ c("span", { style: Pn, children: "사용 가능한 에셋 없음" })
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
}, Ye = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, xn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 8
}, Ke = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6
}, Xe = (t) => ({
  padding: "6px 12px",
  borderRadius: 999,
  border: t ? "1px solid #ffd84a" : "1px solid rgba(255,255,255,0.14)",
  background: t ? "rgba(255,216,74,0.12)" : "rgba(255,255,255,0.04)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}), Ie = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f3f4f8",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 500
}, vn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8
}, wn = {
  flex: 1,
  minWidth: 120,
  padding: "6px 9px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#f3f4f8",
  fontFamily: "inherit",
  fontSize: 12
}, Sn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  color: "rgba(243,244,248,0.72)",
  fontSize: 12
}, kn = {
  padding: 8,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10
}, In = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 8
}, Cn = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 6
}, Mn = (t) => ({
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
}), Rn = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 12,
  fontWeight: 600
}, Pn = {
  gridColumn: "1 / -1",
  padding: "10px 8px",
  color: "rgba(243,244,248,0.45)",
  fontSize: 12
};
function En(t) {
  return T(() => {
    switch (t) {
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
  }, [t]);
}
function fo({
  headHeight: t = 1.55,
  enabled: n = !0,
  opacity: e = 1
} = {}) {
  const r = z(null), o = U((f) => f.appearance), s = U((f) => f.outfits), { position: i, rotation: a } = ee({ updateInterval: 16 }), u = En(o.hair);
  if (X(() => {
    const f = r.current;
    f && (f.position.set(i.x, i.y + t, i.z), f.rotation.set(0, a.y, 0));
  }), !n) return null;
  const l = !!s.hat, d = S.MathUtils.clamp(e, 0, 1);
  return /* @__PURE__ */ m("group", { ref: r, dispose: null, children: [
    !l && /* @__PURE__ */ m("mesh", { position: u.position, scale: u.scale, castShadow: !0, children: [
      /* @__PURE__ */ c("primitive", { object: u.geometry, attach: "geometry" }),
      /* @__PURE__ */ c(
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
    l && /* @__PURE__ */ m("group", { position: [0, 0.1, 0], children: [
      /* @__PURE__ */ m("mesh", { castShadow: !0, children: [
        /* @__PURE__ */ c("cylinderGeometry", { args: [0.34, 0.34, 0.22, 18] }),
        /* @__PURE__ */ c(
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
      /* @__PURE__ */ m("mesh", { position: [0, -0.1, 0], children: [
        /* @__PURE__ */ c("cylinderGeometry", { args: [0.5, 0.5, 0.04, 24] }),
        /* @__PURE__ */ c(
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
    /* @__PURE__ */ c(Ln, { style: o.face, opacity: d })
  ] });
}
function Ln({ style: t, opacity: n }) {
  const e = T(() => {
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
      /* @__PURE__ */ c("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ c("meshBasicMaterial", { color: e, transparent: !0, opacity: n * 0.6 })
    ] }),
    /* @__PURE__ */ m("mesh", { position: [0.13, 0, 0], children: [
      /* @__PURE__ */ c("sphereGeometry", { args: [0.045, 8, 8] }),
      /* @__PURE__ */ c("meshBasicMaterial", { color: e, transparent: !0, opacity: n * 0.6 })
    ] })
  ] });
}
const zn = (t) => t?.url ? t.kind === "characterPart" || t.kind === "weapon" : !1, An = (t) => ({
  id: t.id,
  ...t.slot ? { slot: t.slot } : {},
  url: t.url,
  ...t.colors?.primary ? { color: t.colors.primary } : {}
});
function po({
  baseParts: t = [],
  outfits: n,
  assets: e
}) {
  const r = Object.values(n).map((i) => i ? e[i] : void 0).filter(zn).map(An);
  if (r.length === 0)
    return t.map((i) => ({ ...i }));
  const o = new Set(r.map((i) => i.slot).filter(Boolean)), s = t.filter((i) => !i.slot || !o.has(i.slot)).map((i) => ({ ...i }));
  for (const i of r)
    s.some((a) => a.url === i.url && a.slot === i.slot) || s.push(i);
  return s;
}
function mo({
  capacity: t = 64,
  step: n = 0.55,
  lifetime: e = 9,
  size: r = 0.34,
  y: o = 0.02,
  color: s = "#1a1612"
} = {}) {
  const i = z(null), { position: a, isMoving: u, isGrounded: l } = ee({ updateInterval: 32 }), d = T(() => new S.Color(s), [s]), f = T(
    () => Array.from({ length: t }, () => ({
      x: 0,
      z: 0,
      bornAt: -1 / 0,
      side: 1
    })),
    [t]
  ), p = z(null), h = z(0), b = z(1), k = T(() => {
    const w = new S.PlaneGeometry(1, 1);
    return w.rotateX(-Math.PI / 2), w;
  }, []), x = T(
    () => new S.MeshBasicMaterial({
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
  C(() => () => {
    k.dispose(), x.dispose();
  }, [k, x]);
  const g = T(() => new S.Object3D(), []), v = T(() => new S.Color(), []);
  return X((w) => {
    const I = i.current;
    if (!I) return;
    const M = w.clock.elapsedTime;
    if (l && u) {
      const y = p.current, P = a.x - (y?.x ?? a.x), B = a.z - (y?.z ?? a.z), R = Math.hypot(P, B);
      if (!y || R >= n) {
        const L = f[h.current];
        L && (L.x = a.x, L.z = a.z, L.bornAt = M, L.side = b.current, b.current = b.current === 1 ? -1 : 1, h.current = (h.current + 1) % t, p.current = { x: a.x, z: a.z });
      }
    }
    let A = 0;
    for (let y = 0; y < t; y++) {
      const P = f[y];
      if (!P) continue;
      const B = M - P.bornAt;
      if (B < 0 || B > e) continue;
      const R = 1 - B / e;
      g.position.set(P.x + P.side * 0.07, o, P.z), g.rotation.set(0, 0, 0), g.scale.set(r, 1, r * 1.4), g.updateMatrix(), I.setMatrixAt(A, g.matrix), v.copy(d).multiplyScalar(0.6 + R * 0.4), I.setColorAt(A, v), A++;
    }
    I.count = A, I.instanceMatrix.needsUpdate = !0, I.instanceColor && (I.instanceColor.needsUpdate = !0);
  }), /* @__PURE__ */ c(
    "instancedMesh",
    {
      ref: i,
      args: [k, x, t],
      frustumCulled: !1,
      renderOrder: 1
    }
  );
}
const go = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
}, ue = "ko";
function On() {
  if (typeof navigator > "u") return ue;
  const t = (navigator.language || ue).slice(0, 2).toLowerCase();
  return t === "ko" || t === "en" || t === "ja" ? t : ue;
}
function Ce(t, n) {
  return n ? t.replace(/\{(\w+)\}/g, (e, r) => {
    const o = n[r];
    return o == null ? `{${r}}` : String(o);
  }) : t;
}
const ae = W((t, n) => ({
  locale: On(),
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
    if (i !== void 0) return Ce(i, r);
    const a = s[ue]?.[e];
    return Ce(a !== void 0 ? a : e, r);
  },
  serialize: () => ({ version: 1, locale: n().locale }),
  hydrate: (e) => {
    !e || e.version !== 1 || t({ locale: e.locale });
  }
}));
function ho(t, n) {
  return ae.getState().t(t, n);
}
function yo() {
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
function bo() {
  const t = ae((e) => e.locale), n = ae((e) => e.setLocale);
  return { locale: t, setLocale: n };
}
function Me(t, n) {
  return n ? t.replace(/\{(\w+)\}/g, (e, r) => {
    const o = n[r];
    return o == null ? `{${r}}` : String(o);
  }) : t;
}
const Tn = [
  { id: "jump", label: "점프", key: " " },
  { id: "use", label: "사용", key: "F" }
];
function Bn() {
  return typeof window > "u" || typeof window.matchMedia != "function" ? !1 : window.matchMedia("(pointer: coarse)").matches;
}
function Qe(t, n) {
  if (typeof window > "u") return;
  const e = /^[a-zA-Z]$/.test(n) ? `Key${n.toUpperCase()}` : n === " " ? "Space" : n, r = new KeyboardEvent(t, {
    key: n === " " ? " " : n.toLowerCase(),
    code: e,
    bubbles: !0
  });
  window.dispatchEvent(r);
}
function xo({
  forceVisible: t = !1,
  radius: n = 60,
  deadzone: e = 0.18,
  runThreshold: r = 0.8,
  actions: o = Tn
} = {}) {
  const [s, i] = D(!1), a = z(null), u = z(null), l = z({
    pointerId: -1,
    cx: 0,
    cy: 0,
    forward: !1,
    backward: !1,
    leftward: !1,
    rightward: !1,
    run: !1
  });
  return C(() => {
    i(t || Bn());
  }, [t]), C(() => {
    if (!s) return;
    const d = a.current, f = u.current;
    if (!d || !f) return;
    const p = wt.getInstance(), h = () => {
      const g = l.current, v = {};
      g.forward && (v.forward = !1), g.backward && (v.backward = !1), g.leftward && (v.leftward = !1), g.rightward && (v.rightward = !1), g.run && (v.shift = !1), g.forward = g.backward = g.leftward = g.rightward = g.run = !1, Object.keys(v).length > 0 && p.updateKeyboard(v), f.style.transform = "translate(-50%, -50%)", l.current.pointerId = -1;
    }, b = (g) => {
      g.preventDefault();
      const v = d.getBoundingClientRect();
      l.current.cx = v.left + v.width / 2, l.current.cy = v.top + v.height / 2, l.current.pointerId = g.pointerId, d.setPointerCapture(g.pointerId), k(g);
    }, k = (g) => {
      if (g.pointerId !== l.current.pointerId) return;
      const v = g.clientX - l.current.cx, w = g.clientY - l.current.cy, I = Math.hypot(v, w), M = Math.min(I, n), A = Math.atan2(w, v), y = Math.cos(A) * M, P = Math.sin(A) * M;
      f.style.transform = `translate(calc(-50% + ${y}px), calc(-50% + ${P}px))`;
      const B = M / n, R = l.current, L = {};
      if (B < e)
        R.forward && (L.forward = !1, R.forward = !1), R.backward && (L.backward = !1, R.backward = !1), R.leftward && (L.leftward = !1, R.leftward = !1), R.rightward && (L.rightward = !1, R.rightward = !1), R.run && (L.shift = !1, R.run = !1);
      else {
        const te = Math.cos(A), ze = Math.sin(A), pe = ze < -0.35, me = ze > 0.35, ge = te < -0.35, he = te > 0.35, ye = B >= r;
        R.forward !== pe && (L.forward = pe, R.forward = pe), R.backward !== me && (L.backward = me, R.backward = me), R.leftward !== ge && (L.leftward = ge, R.leftward = ge), R.rightward !== he && (L.rightward = he, R.rightward = he), R.run !== ye && (L.shift = ye, R.run = ye);
      }
      Object.keys(L).length > 0 && p.updateKeyboard(L);
    }, x = (g) => {
      g.pointerId === l.current.pointerId && h();
    };
    return d.addEventListener("pointerdown", b), d.addEventListener("pointermove", k), d.addEventListener("pointerup", x), d.addEventListener("pointercancel", x), d.addEventListener("pointerleave", x), () => {
      d.removeEventListener("pointerdown", b), d.removeEventListener("pointermove", k), d.removeEventListener("pointerup", x), d.removeEventListener("pointercancel", x), d.removeEventListener("pointerleave", x), h();
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
        /* @__PURE__ */ c(
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
            children: /* @__PURE__ */ c(
              "div",
              {
                ref: u,
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
        /* @__PURE__ */ c(
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
            children: o.map((d) => /* @__PURE__ */ c(Fn, { action: d }, d.id))
          }
        )
      ]
    }
  ) : null;
}
function Fn({ action: t }) {
  const [n, e] = D(!1), r = () => {
    e(!0), t.key && Qe("keydown", t.key), t.onPress?.();
  }, o = () => {
    e(!1), t.key && Qe("keyup", t.key), t.onRelease?.();
  };
  return /* @__PURE__ */ c(
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
const de = "outdoor", Re = (t) => new Promise((n) => setTimeout(n, t)), Dn = 220, _n = 80, Gn = 240, Y = W((t, n) => ({
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
    const u = performance.now();
    for (; ; ) {
      const d = Math.min(1, (performance.now() - u) / Dn);
      if (n().setTransition({ progress: d }), d >= 1) break;
      await Re(16);
    }
    r?.saveReturn && t({ lastReturnPoint: r.saveReturn }), t({ current: e }), await Re(_n);
    const l = performance.now();
    for (; ; ) {
      const d = Math.min(1, (performance.now() - l) / Gn);
      if (n().setTransition({ progress: 1 - d }), d >= 1) break;
      await Re(16);
    }
    t({ pending: null, transition: { active: !1, color: a, progress: 0 } });
  },
  serialize: () => ({ version: 1, current: n().current }),
  hydrate: (e) => {
    !e || e.version !== 1 || n().scenes[e.current] && t({ current: e.current, pending: null });
  }
}));
function Wn(t, n) {
  if (t === n) return !0;
  if (t.size !== n.size) return !1;
  for (const e of t)
    if (!n.has(e)) return !1;
  return !0;
}
const $ = W((t) => ({
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
  setVisibleRooms: (n, e, r) => t((o) => o.initializedSceneId === n && o.currentRoomId === e && Wn(o.visibleRoomIds, r) ? o : {
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
function vo({ zIndex: t = 9999 } = {}) {
  const n = Y((e) => e.transition);
  return !n.active && n.progress <= 1e-3 ? null : /* @__PURE__ */ c(
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
function wo({ scene: t, children: n }) {
  const e = Y((s) => s.registerScene), r = Y((s) => s.unregisterScene), o = Y((s) => s.current);
  return C(() => (e(t), () => r(t.id)), [t, e, r]), o !== t.id ? null : /* @__PURE__ */ c(N, { children: n });
}
function So({
  position: t,
  sceneId: n,
  entry: e,
  exitOverride: r,
  radius: o = 1.4,
  cooldownMs: s = 800,
  color: i = "#5a8acf",
  label: a
}) {
  const u = Y((k) => k.goTo), l = Y((k) => k.current), { teleport: d } = it(), { position: f } = ee({ updateInterval: 50 }), p = z(0), h = T(() => new S.CylinderGeometry(o, o, 0.08, 28), [o]);
  C(() => () => h.dispose(), [h]), X(() => {
    const k = performance.now();
    if (k - p.current < s) return;
    const x = f.x - t[0], g = f.z - t[2];
    x * x + g * g > o * o || (p.current = k, l !== n && b());
  });
  async function b() {
    const k = r ?? {
      position: [t[0], t[1], t[2]]
    };
    await u(n, { entry: e, saveReturn: k });
    const x = new S.Vector3(e.position[0], e.position[1], e.position[2]);
    d(x);
  }
  return /* @__PURE__ */ m("group", { position: t, children: [
    /* @__PURE__ */ c("mesh", { rotation: [0, 0, 0], geometry: h, children: /* @__PURE__ */ c(
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
      /* @__PURE__ */ c("boxGeometry", { args: [0.04, 0.6, 0.04] }),
      /* @__PURE__ */ c("meshStandardMaterial", { color: i, emissive: i, emissiveIntensity: 0.4 })
    ] })
  ] });
}
function ko({ sceneId: t, roomId: n, bounds: e, children: r }) {
  const o = Y((l) => l.current), s = $((l) => l.registerRoom), i = $((l) => l.unregisterRoom), a = $((l) => l.initializedSceneId), u = $((l) => l.visibleRoomIds);
  return C(() => (s({ id: n, sceneId: t, bounds: e }), () => i(n)), [n, t, e, s, i]), o !== t ? null : a !== t ? /* @__PURE__ */ c(N, { children: r }) : u.has(n) ? /* @__PURE__ */ c(N, { children: r }) : null;
}
function Io({
  id: t,
  sceneId: n,
  fromRoomId: e,
  toRoomId: r,
  position: o,
  radius: s,
  revealDistance: i
}) {
  const a = $((l) => l.registerPortal), u = $((l) => l.unregisterPortal);
  return C(() => (a({
    id: t,
    sceneId: n,
    fromRoomId: e,
    toRoomId: r,
    position: o,
    ...s !== void 0 ? { radius: s } : {},
    ...i !== void 0 ? { revealDistance: i } : {}
  }), () => u(t)), [t, n, e, r, o, s, i, a, u]), null;
}
const Un = 0.12;
function jn(t, n) {
  return t.x >= n.min[0] && t.x <= n.max[0] && t.y >= n.min[1] && t.y <= n.max[1] && t.z >= n.min[2] && t.z <= n.max[2];
}
function ut(t, n, e) {
  for (const r of n)
    if (r.sceneId === t && jn(e, r.bounds))
      return r.id;
  return null;
}
function qn(t) {
  const n = t.rooms.filter((s) => s.sceneId === t.sceneId);
  if (n.length === 0) return /* @__PURE__ */ new Set();
  const e = ut(t.sceneId, n, t.position);
  if (!e)
    return new Set(n.map((s) => s.id));
  const r = /* @__PURE__ */ new Set([e]), o = t.portals.filter((s) => s.sceneId === t.sceneId);
  for (const s of o) {
    const i = s.revealDistance ?? 3.8, a = t.position.x - s.position[0], u = t.position.y - s.position[1], l = t.position.z - s.position[2];
    a * a + u * u + l * l > i * i || (s.fromRoomId === e ? r.add(s.toRoomId) : s.toRoomId === e && r.add(s.fromRoomId));
  }
  return r;
}
function Co() {
  const t = Y((a) => a.current), n = $((a) => a.rooms), e = $((a) => a.portals), r = $((a) => a.setVisibleRooms), o = $((a) => a.reset), { position: s } = ee({ updateInterval: 50 }), i = z(0);
  return C(() => o, [o]), X((a, u) => {
    if (i.current += Math.max(0, u), i.current < Un) return;
    i.current = 0;
    const l = Array.from(n.values()), d = Array.from(e.values()), f = ut(t, l, s), p = qn({
      sceneId: t,
      rooms: l,
      portals: d,
      position: s
    });
    r(t, f, p);
  }), null;
}
const $n = new S.Color("#0a1430"), Nn = new S.Color("#ffb377"), Vn = new S.Color("#ff7a52"), Hn = new S.Color("#5b6975"), Yn = new S.Color("#dde7f0"), Kn = new S.Color("#3b4452");
function Xn(t, n) {
  const e = t + n / 60;
  return e < 5 ? { t: 0, phase: "night" } : e < 7 ? { t: (e - 5) / 2, phase: "dawn" } : e < 17 ? { t: 1, phase: "day" } : e < 19 ? { t: 1 - (e - 17) / 2, phase: "dusk" } : { t: 0, phase: "night" };
}
function Mo({
  color: t = "#cfd8e3",
  near: n = 35,
  far: e = 220,
  enabled: r = !0
} = {}) {
  const o = St((l) => l.scene), s = O((l) => l.time.hour), i = O((l) => l.time.minute), a = J((l) => l.current), u = z(void 0);
  return C(() => {
    if (u.current === void 0 && (u.current = o.fog instanceof S.Fog ? o.fog.clone() : null), !r) {
      o.fog = u.current ? u.current.clone() : null;
      return;
    }
    const l = new S.Color(t), d = Xn(s, i), f = l.clone();
    d.phase === "night" ? f.lerp($n, 0.25) : d.phase === "dawn" ? f.lerp(Nn, 0.18 * (1 - d.t)) : d.phase === "dusk" && f.lerp(Vn, 0.18 * (1 - d.t));
    let p = n, h = e;
    if (d.phase === "night" ? (p = n * 0.45, h = e * 0.55) : (d.phase === "dawn" || d.phase === "dusk") && (p = n * (0.55 + 0.45 * d.t), h = e * (0.7 + 0.3 * d.t)), a) {
      const b = Math.max(0, Math.min(1, a.intensity));
      a.kind === "rain" ? (f.lerp(Hn, 0.12 + b * 0.1), p *= 0.7 - b * 0.2, h *= 0.65 - b * 0.2) : a.kind === "storm" ? (f.lerp(Kn, 0.16 + b * 0.12), p *= 0.55 - b * 0.2, h *= 0.5 - b * 0.2) : a.kind === "snow" && (f.lerp(Yn, 0.12 + b * 0.08), p *= 0.75, h *= 0.7);
    }
    p = Math.max(2, p), h = Math.max(p + 5, h), o.fog instanceof S.Fog ? (o.fog.color.copy(f), o.fog.near = p, o.fog.far = h) : o.fog = new S.Fog(f.getHex(), p, h);
  }, [o, t, n, e, r, s, i, a?.kind, a?.intensity]), C(() => () => {
    o.fog = u.current ? u.current.clone() : null;
  }, [o]), null;
}
const Qn = [
  { hour: 0, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: -Math.PI / 2, elevation: -0.3 },
  { hour: 5, sunColor: "#3b3a5a", ambientColor: "#28304a", sunIntensity: 0.15, ambientIntensity: 0.22, azimuth: -Math.PI / 3, elevation: -0.05 },
  { hour: 7, sunColor: "#ffb27a", ambientColor: "#7a8aa6", sunIntensity: 0.55, ambientIntensity: 0.3, azimuth: -Math.PI / 4, elevation: 0.25 },
  { hour: 10, sunColor: "#fff1c8", ambientColor: "#aab4c8", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: -Math.PI / 8, elevation: 0.7 },
  { hour: 13, sunColor: "#ffffff", ambientColor: "#b6c2d8", sunIntensity: 1.05, ambientIntensity: 0.38, azimuth: 0, elevation: 1.05 },
  { hour: 16, sunColor: "#ffe0a8", ambientColor: "#a8b4cc", sunIntensity: 0.85, ambientIntensity: 0.34, azimuth: Math.PI / 6, elevation: 0.65 },
  { hour: 18, sunColor: "#ff9a5a", ambientColor: "#806a8a", sunIntensity: 0.55, ambientIntensity: 0.28, azimuth: Math.PI / 3, elevation: 0.18 },
  { hour: 20, sunColor: "#5a3f6a", ambientColor: "#34304a", sunIntensity: 0.18, ambientIntensity: 0.22, azimuth: Math.PI / 2, elevation: -0.05 },
  { hour: 24, sunColor: "#1f2a48", ambientColor: "#1a1f2e", sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: 3 * Math.PI / 4, elevation: -0.3 }
], Ze = {
  spring: new S.Color("#fff0f5"),
  summer: new S.Color("#fff5d8"),
  autumn: new S.Color("#ffd9b0"),
  winter: new S.Color("#dfe8f5")
}, Je = {
  sunny: { sun: 1, ambient: 1, tint: new S.Color("#ffffff") },
  cloudy: { sun: 0.55, ambient: 0.95, tint: new S.Color("#cfd6e2") },
  rain: { sun: 0.3, ambient: 0.85, tint: new S.Color("#90a0b8") },
  snow: { sun: 0.65, ambient: 1.1, tint: new S.Color("#dfeaf5") },
  storm: { sun: 0.2, ambient: 0.75, tint: new S.Color("#5a6a82") }
};
function Zn(t, n) {
  const e = t, r = (n % 24 + 24) % 24;
  let o = e[0], s = e[e.length - 1];
  for (let u = 0; u < e.length - 1; u += 1) {
    const l = e[u], d = e[u + 1];
    if (r >= l.hour && r <= d.hour) {
      o = l, s = d;
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
function Ro({
  rigDistance: t = 60,
  castShadow: n = !0,
  shadowMapSize: e = 1024,
  keyframes: r,
  damping: o = 0.12
} = {}) {
  const s = z(null), i = z(null), a = T(() => (r ?? Qn).slice().sort((h, b) => h.hour - b.hour), [r]), u = T(() => new S.Color(), []), l = T(() => new S.Color(), []), d = T(() => new S.Color(), []), f = T(() => new S.Color(), []);
  return X(() => {
    const p = s.current, h = i.current;
    if (!p || !h) return;
    const b = O.getState().time, k = J.getState().current, x = k?.kind ?? "sunny", g = S.MathUtils.clamp(k?.intensity ?? 0.5, 0, 1), v = Je[x] ?? Je.sunny, w = Ze[b.season] ?? Ze.spring, I = Zn(a, b.hour + b.minute / 60);
    d.set(I.sunColor).lerp(w, 0.18).lerp(v.tint, 0.35 + 0.25 * g), f.set(I.ambientColor).lerp(w, 0.2).lerp(v.tint, 0.3 + 0.3 * g);
    const M = S.MathUtils.clamp(o, 0.01, 1);
    u.copy(p.color).lerp(d, M), l.copy(h.color).lerp(f, M), p.color.copy(u), h.color.copy(l);
    const A = S.MathUtils.lerp(1, v.sun, 0.5 + 0.5 * g), y = S.MathUtils.lerp(1, v.ambient, 0.5 + 0.5 * g);
    p.intensity = S.MathUtils.lerp(p.intensity, I.sunIntensity * A, M), h.intensity = S.MathUtils.lerp(h.intensity, I.ambientIntensity * y, M);
    const P = Math.cos(I.elevation), B = Math.sin(I.elevation), R = Math.cos(I.azimuth) * P * t, L = Math.sin(I.azimuth) * P * t, te = Math.max(2, B * t);
    p.position.set(R, te, L), p.target.position.set(0, 0, 0), p.target.updateMatrixWorld();
  }), /* @__PURE__ */ m(N, { children: [
    /* @__PURE__ */ c("ambientLight", { ref: i, intensity: 0.3, color: "#b6c2d8" }),
    /* @__PURE__ */ c(
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
function Jn(t, n, e) {
  return n === e ? !0 : n < e ? t >= n && t < e : t >= n || t < e;
}
function er(t, n) {
  return t.weekdays && t.weekdays.length > 0 && !t.weekdays.includes(n.weekday) || t.seasons && t.seasons.length > 0 && !t.seasons.includes(n.season) ? !1 : Jn(n.hour, t.startHour, t.endHour);
}
function tr(t, n) {
  for (const r of t.entries)
    if (er(r, n))
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
class nr {
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
    return r ? tr(r, e) : null;
  }
  all() {
    return Array.from(this.map.values());
  }
  clear() {
    this.map.clear();
  }
}
let Pe = null;
function et() {
  return Pe || (Pe = new nr()), Pe;
}
function Po(t) {
  const [n, e] = D(() => {
    const r = O.getState();
    return et().resolve(t, r.time);
  });
  return C(() => {
    let r = -1;
    const o = () => {
      const i = O.getState();
      if (i.time.hour === r) return;
      r = i.time.hour;
      const a = et().resolve(t, i.time);
      e(a);
    };
    return o(), O.subscribe((i, a) => {
      (i.time.hour !== a.time.hour || i.time.day !== a.time.day || i.time.weekday !== a.time.weekday) && o();
    });
  }, [t]), n;
}
export {
  kt as AssetPreviewCanvas,
  lo as AudioControls,
  Oo as BugSpot,
  Qo as BuildingController,
  Zo as BuildingSystem,
  Jo as BuildingUI,
  Ue as CATALOG_CATEGORIES,
  zo as Camera,
  es as CameraPresets,
  Zr as CatalogUI,
  uo as CharacterCreator,
  Ho as Clicker,
  Jr as CraftingUI,
  eo as CropPlot,
  Gs as DAILY_FRIENDSHIP_CAP,
  wr as DialogBox,
  Ws as DialogRunner,
  Mo as DynamicFog,
  Ro as DynamicSky,
  kr as EventsHUD,
  Us as FRIENDSHIP_LEVELS,
  To as FishSpot,
  _t as FocusableObject,
  mo as Footprints,
  co as Footsteps,
  Ls as GaeSupProps,
  Yo as GaesupController,
  Uo as GaesupWorld,
  jo as GaesupWorldContent,
  Br as Gamepad,
  ts as GridHelper,
  Ko as GroundClicker,
  Pr as HotbarUI,
  So as HouseDoor,
  so as HousePlot,
  Hs as HttpAssetSource,
  zs as IndexedDBAdapter,
  Fr as Interactable,
  _r as InteractionPrompt,
  Dr as InteractionTracker,
  Er as InventoryUI,
  go as LOCALE_LABEL,
  As as LocalStorageAdapter,
  Xr as MailboxUI,
  Ar as MiniMap,
  Or as MinimapPlatform,
  pt as MotionController,
  Gr as MotionUI,
  ns as NPCSystem,
  fo as OutfitAvatar,
  Lr as QuestLogUI,
  Io as RoomPortal,
  ko as RoomRoot,
  Co as RoomVisibilityDriver,
  Ns as SEED_ASSETS,
  qt as SEED_ITEMS,
  Os as SaveSystem,
  vo as SceneFader,
  wo as SceneRoot,
  Yr as ShopUI,
  Rs as SpeechBalloon,
  Wr as Teleport,
  rs as TileSystem,
  Nr as TimeHUD,
  Tr as ToastHost,
  Kr as ToolUseController,
  xo as TouchControls,
  io as TownHUD,
  Bo as TreeObject,
  ks as V3,
  Is as V30,
  Cs as V31,
  os as WallSystem,
  Hr as WalletHUD,
  ss as WeatherEffect,
  no as WeatherHUD,
  qo as World,
  $o as WorldConfigProvider,
  No as WorldContainer,
  hs as applyToonToScene,
  is as autoDetectProfile,
  as as buildingPlugin,
  ls as classifyTier,
  cs as createBuildingPlugin,
  Ts as createDefaultSaveSystem,
  Fo as createGaesupRuntime,
  ys as createToonMaterial,
  ds as detectCapabilities,
  bs as disposeToonGradients,
  ne as getAudioEngine,
  Z as getCropRegistry,
  xs as getDefaultToonMode,
  js as getDialogRegistry,
  ot as getEventRegistry,
  _ as getItemRegistry,
  et as getNPCScheduler,
  st as getQuestRegistry,
  ie as getRecipeRegistry,
  Bs as getSaveSystem,
  ft as getToolEvents,
  vs as getToonGradient,
  Ds as isEventActive,
  F as notify,
  us as profileForTier,
  to as registerSeedCrops,
  Ir as registerSeedEvents,
  Vr as registerSeedItems,
  po as resolveCharacterParts,
  tr as resolveSchedule,
  ws as setDefaultToonMode,
  ho as t,
  ao as useAmbientBgm,
  Oe as useAssetStore,
  j as useAudioStore,
  Do as useAutoSave,
  fs as useBuildingEditor,
  fe as useBuildingStore,
  dt as useCatalogStore,
  Qr as useCatalogTracker,
  U as useCharacterStore,
  ve as useCraftingStore,
  lt as useCurrentInteraction,
  qr as useDayChange,
  oo as useDecorationScore,
  oe as useDialogStore,
  Mr as useEquippedItem,
  _o as useEquippedToolKind,
  rt as useEventsStore,
  Sr as useEventsTicker,
  qs as useFriendshipStore,
  vr as useGaesupController,
  H as useGaesupStore,
  jr as useGameClock,
  Wt as useGameTime,
  Ct as useHotbar,
  Rr as useHotbarKeyboard,
  $r as useHourChange,
  ae as useI18nStore,
  Q as useInteractablesStore,
  Gt as useInteractionKey,
  Cr as useInventory,
  E as useInventoryStore,
  Go as useLoadOnMount,
  bo as useLocale,
  ce as useMailStore,
  ps as useNPCStore,
  Po as useNpcSchedule,
  ms as usePerfStore,
  ee as usePlayerPosition,
  G as usePlotStore,
  zr as useQuestObjectiveTracker,
  re as useQuestStore,
  $ as useRoomVisibilityStore,
  Y as useSceneStore,
  le as useShopStore,
  Le as useStateSystem,
  it as useTeleport,
  Ur as useTimeOfDay,
  O as useTimeStore,
  Ae as useToastStore,
  be as useToolUse,
  V as useTownStore,
  yo as useTranslate,
  Ps as useUIConfigStore,
  K as useWalletStore,
  J as useWeatherStore,
  ro as useWeatherTicker
};
