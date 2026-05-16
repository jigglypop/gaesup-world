import { jsxs as i, jsx as e, Fragment as K } from "react/jsx-runtime";
import { useState as g, useEffect as F, useMemo as M, useCallback as Q } from "react";
import { u as W, b as D } from "./useSpawnFromBlueprint-C_IzLBK5.js";
import { Environment as H, Grid as q } from "@react-three/drei";
import { Canvas as X } from "@react-three/fiber";
import { Physics as ee, euler as te, RigidBody as ie } from "@react-three/rapier";
import * as re from "three";
import { u as J } from "./gaesupStore-x2iiDzsY.js";
import { u as ne, C as ae, a as se, G as oe } from "./index-Bgb2rlWx.js";
import { C as le } from "./index-C8EsdkFS.js";
const w = (t) => t?.type === "character";
function ce({ blueprint: t }) {
  const d = J((n) => n.setUrls), b = J((n) => n.setCameraOption), r = J((n) => n.setMode), h = J((n) => n.mode), [l, u] = g(20), c = w(t) ? t.controls?.clickToMove ?? !0 : !1, C = w(t) ? t.controls?.enableKeyboard ?? !0 : !1, O = w(t) ? t.controls?.enableMouse ?? !0 : !1;
  ne(C, C), F(() => {
    r({
      type: "character",
      control: w(t) && t.camera?.mode || "thirdPerson"
    });
    const n = w(t) ? t.camera || {} : {};
    b({
      xDistance: n.distance?.x || l,
      yDistance: n.distance?.y || l * 0.5,
      zDistance: n.distance?.z || l,
      offset: new re.Vector3(0, 0, 0),
      enableCollision: n.enableCollision ?? !1,
      smoothing: n.smoothing || { position: 0.25, rotation: 0.3, fov: 0.2 },
      fov: n.fov || 50,
      zoom: 1,
      enableZoom: n.enableZoom ?? !0,
      zoomSpeed: n.zoomSpeed || 1e-3,
      minZoom: n.minZoom || 0.5,
      maxZoom: n.maxZoom || 3,
      enableFocus: !1,
      maxDistance: 50,
      distance: 10,
      bounds: { minY: 2, maxY: 50 }
    });
  }, [r, b, l, t]), F(() => {
    if (w(t)) {
      if (t.visuals?.model)
        d({ characterUrl: t.visuals.model });
      else if (t.visuals?.parts && t.visuals.parts.length > 0) {
        const n = t.visuals.parts.find((v) => v.type === "body");
        n && d({ characterUrl: n.url });
      }
    }
  }, [t, d]), F(() => {
    const n = (v) => {
      if (w(t) && t.camera?.enableZoom === !1) return;
      v.preventDefault();
      const S = v.deltaY * 0.01;
      u((j) => Math.max(10, Math.min(40, j + S)));
    };
    return window.addEventListener("wheel", n, { passive: !1 }), () => window.removeEventListener("wheel", n);
  }, [t]);
  const E = () => !w(t) || !t.visuals?.parts ? [] : t.visuals.parts.filter((n) => n.type !== "body").map((n) => n.color ? { url: n.url, color: n.color } : { url: n.url });
  return /* @__PURE__ */ i("div", { className: "blueprint-preview", children: [
    /* @__PURE__ */ i(
      X,
      {
        shadows: !0,
        camera: { position: [0, 10, 20], fov: 50 },
        style: { width: "100%", height: "100%" },
        children: [
          /* @__PURE__ */ e(le, {}),
          /* @__PURE__ */ e(H, { preset: "sunset" }),
          /* @__PURE__ */ e("ambientLight", { intensity: 0.5 }),
          /* @__PURE__ */ e(
            "directionalLight",
            {
              castShadow: !0,
              position: [20, 30, 10],
              intensity: 0.5,
              "shadow-mapSize": [1024, 1024],
              "shadow-camera-near": 1,
              "shadow-camera-far": 120,
              "shadow-camera-top": 90,
              "shadow-camera-right": 90,
              "shadow-camera-bottom": -90,
              "shadow-camera-left": -90
            }
          ),
          /* @__PURE__ */ i(ee, { debug: !1, gravity: [0, -9.81, 0], children: [
            t && h?.type === "character" && /* @__PURE__ */ e(
              ae,
              {
                controllerOptions: {
                  lerp: {
                    cameraTurn: 0.1,
                    cameraPosition: 0.08
                  }
                },
                rigidBodyProps: {
                  lockRotations: !0
                },
                parts: E(),
                position: [0, 1, 0],
                rotation: te({ x: 0, y: Math.PI, z: 0 })
              },
              `preview-${t.id}`
            ),
            c && /* @__PURE__ */ i(K, { children: [
              /* @__PURE__ */ e(se, {}),
              /* @__PURE__ */ e(oe, {})
            ] }),
            /* @__PURE__ */ e(ie, { type: "fixed", children: /* @__PURE__ */ i("mesh", { receiveShadow: !0, position: [0, -0.5, 0], children: [
              /* @__PURE__ */ e("boxGeometry", { args: [100, 1, 100] }),
              /* @__PURE__ */ e("meshStandardMaterial", { color: "#303030" })
            ] }) }),
            /* @__PURE__ */ e(
              q,
              {
                renderOrder: -1,
                position: [0, 0.01, 0],
                infiniteGrid: !0,
                cellSize: 1,
                cellThickness: 0.5,
                cellColor: "#404040",
                sectionSize: 5,
                sectionThickness: 1,
                sectionColor: "#606060",
                fadeDistance: 50,
                fadeStrength: 1,
                followCamera: !1,
                userData: { intangible: !0 }
              }
            )
          ] })
        ]
      }
    ),
    t && /* @__PURE__ */ i("div", { className: "blueprint-preview__info", children: [
      /* @__PURE__ */ e("h4", { className: "blueprint-preview__name", children: t.name }),
      /* @__PURE__ */ e("p", { className: "blueprint-preview__type", children: t.type }),
      w(t) && t.physics && /* @__PURE__ */ i("div", { className: "blueprint-preview__stats", children: [
        /* @__PURE__ */ i("div", { children: [
          "Move Speed: ",
          t.physics.moveSpeed
        ] }),
        /* @__PURE__ */ i("div", { children: [
          "Jump Force: ",
          t.physics.jumpForce
        ] })
      ] }),
      /* @__PURE__ */ i("div", { className: "blueprint-preview__controls", children: [
        /* @__PURE__ */ i("div", { children: [
          "Camera: ",
          w(t) ? t.camera?.mode || "thirdPerson" : "N/A"
        ] }),
        /* @__PURE__ */ i("div", { children: [
          "Keyboard: ",
          C ? "Enabled" : "Disabled"
        ] }),
        /* @__PURE__ */ i("div", { children: [
          "Mouse: ",
          O ? "Enabled" : "Disabled"
        ] }),
        /* @__PURE__ */ i("div", { children: [
          "Click to Move: ",
          c ? "Enabled" : "Disabled"
        ] })
      ] })
    ] })
  ] });
}
const de = (t) => {
  switch (t.type) {
    case "animation-sequence":
      return "animation";
    case "behavior-tree":
      return "behavior";
    default:
      return t.type;
  }
}, V = (t) => ({
  id: t.id,
  name: t.name,
  type: de(t),
  version: t.version,
  tags: t.tags || [],
  description: t.description ?? "",
  lastModified: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] ?? ""
}), R = (t) => typeof t == "object" && t !== null && !Array.isArray(t), pe = (t, d, b) => {
  if (d.length === 0) return !1;
  let r = t;
  for (let l = 0; l < d.length - 1; l++) {
    const u = d[l];
    if (!u) return !1;
    if (Array.isArray(r)) {
      const c = Number(u);
      if (!Number.isInteger(c) || c < 0 || c >= r.length) return !1;
      r = r[c];
      continue;
    }
    if (!R(r)) return !1;
    r = r[u];
  }
  const h = d[d.length - 1];
  if (!h) return !1;
  if (Array.isArray(r)) {
    const l = Number(h);
    return !Number.isInteger(l) || l < 0 || l >= r.length ? !1 : (r[l] = b, !0);
  }
  return R(r) ? (r[h] = b, !0) : !1;
}, me = [
  { id: "characters", name: "Characters", type: "character", count: 0 },
  { id: "vehicles", name: "Vehicles", type: "vehicle", count: 0 },
  { id: "airplanes", name: "Airplanes", type: "airplane", count: 0 },
  { id: "animations", name: "Animations", type: "animation", count: 0 },
  { id: "behaviors", name: "Behaviors", type: "behavior", count: 0 },
  { id: "items", name: "Items", type: "item", count: 0 }
], Se = ({ onClose: t }) => {
  const [d, b] = g("character"), [r, h] = g(null), [l, u] = g(""), [c, C] = g(null), [O, E] = g(!0), { spawnAtCursor: n, isSpawning: v } = W(), S = M(() => D.getAll().map(V), []), j = M(() => {
    const a = {
      character: 0,
      vehicle: 0,
      airplane: 0,
      animation: 0,
      behavior: 0,
      item: 0
    };
    return S.forEach((o) => {
      o.type in a && a[o.type]++;
    }), me.map((o) => ({
      ...o,
      count: a[o.type]
    })).filter((o) => o.count > 0);
  }, [S]), x = M(() => S.filter((a) => {
    const o = a.type === d, m = l === "" || a.name.toLowerCase().includes(l.toLowerCase()) || a.tags.some((_) => _.toLowerCase().includes(l.toLowerCase()));
    return o && m;
  }), [d, l, S]), k = Q((a, o) => {
    C((m) => {
      if (!m) return null;
      const _ = JSON.parse(JSON.stringify(m));
      return pe(_, a, o) ? _ : m;
    });
  }, []), B = Q((a) => {
    if (h(a), a) {
      const o = D.get(a);
      o && C(JSON.parse(JSON.stringify(o)));
    } else
      C(null);
  }, []);
  F(() => {
    const a = x.some((o) => o.id === r);
    x[0]?.id && x.length > 0 && !a ? B(x[0].id) : x.length === 0 && B(null);
  }, [x, r, B]);
  const T = async () => {
    if (!r) return;
    await n(r) && t();
  }, L = (a, o, m) => Array.isArray(o) ? /* @__PURE__ */ i("div", { className: "blueprint-editor__inspector-group", children: [
    /* @__PURE__ */ e("div", { className: "blueprint-editor__inspector-title", children: a }),
    /* @__PURE__ */ e("div", { className: "blueprint-editor__inspector-list", children: o.length === 0 ? "비어 있음" : `${o.length}개 항목` })
  ] }, m.join(".")) : R(o) ? /* @__PURE__ */ i("div", { className: "blueprint-editor__inspector-group", children: [
    /* @__PURE__ */ e("div", { className: "blueprint-editor__inspector-title", children: a }),
    Object.entries(o).map(
      ([_, U]) => L(_, U, [...m, _])
    )
  ] }, m.join(".")) : typeof o == "boolean" ? /* @__PURE__ */ i("label", { className: "blueprint-editor__inspector-field", children: [
    /* @__PURE__ */ e("span", { children: a }),
    /* @__PURE__ */ e(
      "button",
      {
        className: `blueprint-editor__toggle ${o ? "blueprint-editor__toggle--on" : ""}`,
        onClick: () => k(m, !o),
        children: o ? "ON" : "OFF"
      }
    )
  ] }, m.join(".")) : typeof o == "number" ? /* @__PURE__ */ i("label", { className: "blueprint-editor__inspector-field", children: [
    /* @__PURE__ */ e("span", { children: a }),
    /* @__PURE__ */ e(
      "input",
      {
        type: "number",
        value: o,
        onChange: (_) => k(m, Number(_.target.value)),
        className: "blueprint-editor__inspector-input"
      }
    )
  ] }, m.join(".")) : /* @__PURE__ */ i("label", { className: "blueprint-editor__inspector-field", children: [
    /* @__PURE__ */ e("span", { children: a }),
    /* @__PURE__ */ e(
      "input",
      {
        type: "text",
        value: typeof o == "string" ? o : "",
        onChange: (_) => k(m, _.target.value),
        className: "blueprint-editor__inspector-input"
      }
    )
  ] }, m.join("."));
  return /* @__PURE__ */ i("div", { className: "blueprint-editor", children: [
    /* @__PURE__ */ i("div", { className: "blueprint-editor__sidebar", children: [
      /* @__PURE__ */ e("div", { className: "blueprint-editor__search", children: /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          placeholder: "Search blueprints...",
          value: l,
          onChange: (a) => u(a.target.value),
          className: "blueprint-editor__search-input"
        }
      ) }),
      /* @__PURE__ */ e("div", { className: "blueprint-editor__categories", children: j.map((a) => /* @__PURE__ */ i(
        "button",
        {
          onClick: () => b(a.type),
          className: `blueprint-editor__category ${d === a.type ? "active" : ""}`,
          children: [
            /* @__PURE__ */ e("span", { className: "blueprint-editor__category-name", children: a.name }),
            /* @__PURE__ */ e("span", { className: "blueprint-editor__category-count", children: a.count })
          ]
        },
        a.id
      )) }),
      /* @__PURE__ */ e("div", { className: "blueprint-editor__list", children: x.map((a) => /* @__PURE__ */ i(
        "div",
        {
          onClick: () => B(a.id),
          className: `blueprint-editor__item ${r === a.id ? "active" : ""}`,
          children: [
            /* @__PURE__ */ e("div", { className: "blueprint-editor__item-name", children: a.name }),
            /* @__PURE__ */ e("div", { className: "blueprint-editor__item-tags", children: a.tags.map((o) => /* @__PURE__ */ e("span", { className: "blueprint-editor__tag", children: o }, o)) })
          ]
        },
        a.id
      )) }),
      /* @__PURE__ */ e("div", { className: "blueprint-editor__actions", children: /* @__PURE__ */ e(
        "button",
        {
          onClick: T,
          disabled: !r || v,
          className: "blueprint-editor__spawn-button",
          children: v ? "Spawning..." : "Spawn Entity"
        }
      ) })
    ] }),
    /* @__PURE__ */ i("div", { className: "blueprint-editor__main", children: [
      /* @__PURE__ */ i("div", { className: "blueprint-editor__preview-section", children: [
        /* @__PURE__ */ i("div", { className: "blueprint-editor__preview-header", children: [
          /* @__PURE__ */ e("h3", { className: "blueprint-editor__preview-title", children: "Preview" }),
          /* @__PURE__ */ e(
            "button",
            {
              onClick: () => E(!O),
              className: "blueprint-editor__preview-toggle",
              children: O ? "Hide" : "Show"
            }
          )
        ] }),
        O && /* @__PURE__ */ e("div", { className: "blueprint-editor__preview-container", children: /* @__PURE__ */ e(
          ce,
          {
            blueprint: c
          },
          c ? c.id : "no-blueprint"
        ) })
      ] }),
      /* @__PURE__ */ i("div", { className: "blueprint-editor__inspector-section", children: [
        /* @__PURE__ */ e("div", { className: "blueprint-editor__preview-header", children: /* @__PURE__ */ e("h3", { className: "blueprint-editor__preview-title", children: "Inspector" }) }),
        /* @__PURE__ */ e("div", { className: "blueprint-editor__inspector", children: c ? Object.entries(c).map(
          ([a, o]) => L(a, o, [a])
        ) : /* @__PURE__ */ e("div", { className: "blueprint-editor__empty", children: "블루프린트를 선택하세요." }) })
      ] })
    ] })
  ] });
}, z = (t) => typeof t == "object" && t !== null && !Array.isArray(t), ue = (t, d, b) => {
  if (d.length === 0) return !1;
  let r = t;
  for (let l = 0; l < d.length - 1; l++) {
    const u = d[l];
    if (!u) return !1;
    if (Array.isArray(r)) {
      const c = Number(u);
      if (!Number.isInteger(c) || c < 0 || c >= r.length)
        return !1;
      r = r[c];
      continue;
    }
    if (!z(r)) return !1;
    r = r[u];
  }
  const h = d[d.length - 1];
  if (!h) return !1;
  if (Array.isArray(r)) {
    const l = Number(h);
    return !Number.isInteger(l) || l < 0 || l >= r.length ? !1 : (r[l] = b, !0);
  }
  return z(r) ? (r[h] = b, !0) : !1;
}, he = [
  { id: "characters", name: "Characters", type: "character", count: 0 },
  { id: "vehicles", name: "Vehicles", type: "vehicle", count: 0 },
  { id: "airplanes", name: "Airplanes", type: "airplane", count: 0 },
  { id: "animations", name: "Animations", type: "animation", count: 0 },
  { id: "behaviors", name: "Behaviors", type: "behavior", count: 0 },
  { id: "items", name: "Items", type: "item", count: 0 }
], xe = ({ className: t = "", style: d, children: b }) => {
  const [r, h] = g("character"), [l, u] = g(null), [c, C] = g(""), [O, E] = g(!1), [n, v] = g(null), [S, j] = g(!1), { spawnAtCursor: x, isSpawning: k } = W(), B = M(() => D.getAll().map(V), []), T = M(() => {
    const s = {
      character: 0,
      vehicle: 0,
      airplane: 0,
      animation: 0,
      behavior: 0,
      item: 0
    };
    return B.forEach((p) => {
      p.type in s && s[p.type]++;
    }), he.map((p) => ({
      ...p,
      count: s[p.type]
    }));
  }, [B]), L = M(() => B.filter((s) => {
    const p = s.type === r, N = c === "" || s.name.toLowerCase().includes(c.toLowerCase()) || s.tags.some((f) => f.toLowerCase().includes(c.toLowerCase()));
    return p && N;
  }), [r, c, B]), a = (s) => {
    u(s);
    const p = D.get(s);
    p && v(JSON.parse(JSON.stringify(p)));
  }, o = () => {
    E(!0);
  }, m = () => {
    n && (D.register(n), E(!1), j(!1), a(n.id));
  }, _ = () => {
    if (E(!1), l) {
      const s = D.get(l);
      s && v(JSON.parse(JSON.stringify(s)));
    }
  }, U = () => {
    let s;
    const p = {
      id: `custom_${r}_${Date.now()}`,
      name: `New ${r.charAt(0).toUpperCase() + r.slice(1)}`,
      version: "1.0.0",
      tags: ["custom"],
      description: "Custom blueprint"
    };
    switch (r) {
      case "vehicle":
        s = {
          ...p,
          type: "vehicle",
          physics: {
            mass: 1e3,
            maxSpeed: 30,
            acceleration: 10,
            braking: 15,
            turning: 2
          },
          seats: [{
            position: [0, 1, 0],
            isDriver: !0
          }],
          animations: {
            idle: ""
          }
        };
        break;
      case "airplane":
        s = {
          ...p,
          type: "airplane",
          physics: {
            mass: 2e3,
            maxSpeed: 100,
            acceleration: 20,
            turning: 1,
            lift: 50,
            drag: 10
          },
          seats: [{
            position: [0, 1, 2],
            isDriver: !0
          }],
          animations: {
            idle: ""
          }
        };
        break;
      default:
        s = {
          ...p,
          type: "character",
          physics: {
            mass: 70,
            height: 1.8,
            radius: 0.3,
            jumpForce: 300,
            moveSpeed: 5,
            runSpeed: 10,
            airControl: 0.2
          },
          animations: {
            idle: "",
            walk: "",
            run: "",
            jump: {
              start: "",
              loop: "",
              land: ""
            }
          },
          stats: {
            health: 100,
            stamina: 50,
            strength: 10,
            defense: 10,
            speed: 10
          }
        };
    }
    v(s), u(s.id), j(!0), E(!0);
  }, Z = (s, p) => {
    if (!n) return;
    const N = JSON.parse(JSON.stringify(n));
    ue(N, s, p) && v(N);
  }, G = (s, p = []) => {
    const N = [];
    return Object.entries(s).forEach(([f, y]) => {
      const $ = [...p, f], P = $.join(".");
      f === "id" || f === "type" ? N.push(
        /* @__PURE__ */ i("div", { className: "property-editor__field", children: [
          /* @__PURE__ */ i("label", { className: "property-editor__label editor-text-small", children: [
            f,
            ":"
          ] }),
          /* @__PURE__ */ e(
            "input",
            {
              type: "text",
              value: y,
              disabled: !0,
              className: "property-editor__input property-editor__input--disabled"
            }
          )
        ] }, P)
      ) : z(y) ? N.push(
        /* @__PURE__ */ i("div", { className: "property-editor__group", children: [
          /* @__PURE__ */ i("div", { className: "property-editor__group-title editor-text", children: [
            f.charAt(0).toUpperCase() + f.slice(1),
            ":"
          ] }),
          /* @__PURE__ */ e("div", { className: "property-editor__group-content", children: G(y, $) })
        ] }, P)
      ) : Array.isArray(y) ? y.length > 0 && y.every(z) ? N.push(
        /* @__PURE__ */ i("div", { className: "property-editor__group", children: [
          /* @__PURE__ */ i("div", { className: "property-editor__group-title editor-text", children: [
            f.charAt(0).toUpperCase() + f.slice(1),
            ":"
          ] }),
          /* @__PURE__ */ e("div", { className: "property-editor__group-content", children: y.map((A, I) => /* @__PURE__ */ i("div", { className: "property-editor__array-item", children: [
            /* @__PURE__ */ i("div", { className: "property-editor__array-item-title editor-text-small", children: [
              "Item ",
              I + 1
            ] }),
            G(A, [...$, I.toString()])
          ] }, `${P}.${I}`)) })
        ] }, P)
      ) : N.push(
        /* @__PURE__ */ i("div", { className: "property-editor__field", children: [
          /* @__PURE__ */ i("label", { className: "property-editor__label editor-text-small", children: [
            f,
            ":"
          ] }),
          /* @__PURE__ */ e(
            "input",
            {
              type: "text",
              value: y.join(", "),
              onChange: (A) => Z($, A.target.value.split(",").map((I) => I.trim())),
              className: "property-editor__input"
            }
          )
        ] }, P)
      ) : typeof y == "boolean" ? N.push(
        /* @__PURE__ */ e("div", { className: "property-editor__field", children: /* @__PURE__ */ i("label", { className: "property-editor__checkbox-label editor-text-small", children: [
          /* @__PURE__ */ e(
            "input",
            {
              type: "checkbox",
              checked: y,
              onChange: (A) => Z($, A.target.checked),
              className: "property-editor__checkbox"
            }
          ),
          f
        ] }) }, P)
      ) : N.push(
        /* @__PURE__ */ i("div", { className: "property-editor__field", children: [
          /* @__PURE__ */ i("label", { className: "property-editor__label editor-text-small", children: [
            f,
            ":"
          ] }),
          /* @__PURE__ */ e(
            "input",
            {
              type: typeof y == "number" ? "number" : "text",
              value: y,
              onChange: (A) => Z($, typeof y == "number" ? Number(A.target.value) : A.target.value),
              className: "property-editor__input"
            }
          )
        ] }, P)
      );
    }), N;
  }, Y = async () => {
    !l || await x(l);
  };
  return /* @__PURE__ */ i("div", { className: `blueprint-panel ${t}`, style: d, children: [
    /* @__PURE__ */ e("h3", { className: "editor-title", children: "Blueprint Library" }),
    /* @__PURE__ */ e("div", { className: "blueprint-panel__toolbar", children: /* @__PURE__ */ i("div", { className: "blueprint-panel__search-container", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          placeholder: "Search blueprints...",
          value: c,
          onChange: (s) => C(s.target.value),
          className: "blueprint-panel__search-input"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          onClick: U,
          className: "blueprint-panel__button blueprint-panel__button--primary",
          children: "+ New Blueprint"
        }
      )
    ] }) }),
    /* @__PURE__ */ e("div", { className: "blueprint-panel__categories", children: T.map((s) => /* @__PURE__ */ i(
      "button",
      {
        onClick: () => h(s.type),
        className: `blueprint-panel__category-button ${r === s.type ? "blueprint-panel__category-button--active" : ""}`,
        children: [
          /* @__PURE__ */ e("span", { children: s.name }),
          /* @__PURE__ */ i("span", { children: [
            "(",
            s.count,
            ")"
          ] })
        ]
      },
      s.id
    )) }),
    O ? /* @__PURE__ */ i(K, { children: [
      /* @__PURE__ */ e("div", { className: "blueprint-panel__property-editor-container editor-scrollbar", children: n && /* @__PURE__ */ i("div", { children: [
        /* @__PURE__ */ e("h4", { className: "blueprint-panel__property-editor-title editor-text", children: S ? "Create New Blueprint" : `Edit: ${n.name}` }),
        G(n)
      ] }) }),
      /* @__PURE__ */ e("div", { className: "blueprint-panel__footer", children: /* @__PURE__ */ i("div", { className: "blueprint-panel__footer-buttons", children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: m,
            className: "blueprint-panel__button blueprint-panel__button--primary",
            children: S ? "Create" : "Save"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: _,
            className: "blueprint-panel__button blueprint-panel__button--danger",
            children: "Cancel"
          }
        )
      ] }) })
    ] }) : /* @__PURE__ */ i(K, { children: [
      /* @__PURE__ */ e("div", { className: "blueprint-panel__list editor-scrollbar", children: L.length === 0 ? /* @__PURE__ */ e("div", { className: "blueprint-panel__empty-message editor-text-small", children: "No blueprints found" }) : L.map((s) => /* @__PURE__ */ e(
        "div",
        {
          onClick: () => a(s.id),
          className: `blueprint-panel__list-item ${l === s.id ? "blueprint-panel__list-item--selected" : ""}`,
          children: /* @__PURE__ */ i("div", { className: "list-item__content", children: [
            /* @__PURE__ */ i("div", { className: "list-item__text-content", children: [
              /* @__PURE__ */ e("div", { className: "list-item__name editor-text", children: s.name }),
              /* @__PURE__ */ e("div", { className: "list-item__description editor-text-small", children: s.description }),
              /* @__PURE__ */ e("div", { className: "list-item__tags", children: s.tags.map((p) => /* @__PURE__ */ e(
                "span",
                {
                  className: "list-item__tag editor-text-small",
                  children: p
                },
                p
              )) })
            ] }),
            /* @__PURE__ */ i("div", { className: "list-item__meta editor-text-small", children: [
              /* @__PURE__ */ i("div", { children: [
                "v",
                s.version
              ] }),
              /* @__PURE__ */ e("div", { children: s.lastModified })
            ] })
          ] })
        },
        s.id
      )) }),
      l && /* @__PURE__ */ e("div", { className: "blueprint-panel__footer", children: /* @__PURE__ */ i("div", { className: "blueprint-panel__footer-buttons", children: [
        /* @__PURE__ */ e(
          "button",
          {
            onClick: o,
            className: "blueprint-panel__button blueprint-panel__button--secondary",
            children: "Edit Blueprint"
          }
        ),
        /* @__PURE__ */ e(
          "button",
          {
            onClick: Y,
            disabled: k,
            className: "blueprint-panel__button blueprint-panel__button--primary",
            children: k ? "Spawning..." : "Spawn Entity"
          }
        )
      ] }) })
    ] }),
    b
  ] });
};
export {
  Se as BlueprintEditor,
  xe as BlueprintPanel,
  ce as BlueprintPreview
};
