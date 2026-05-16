import { jsxs as d, jsx as i, Fragment as m } from "react/jsx-runtime";
import { useState as u } from "react";
import { create as c } from "zustand";
import { persist as p } from "zustand/middleware";
const g = c()(
  p(
    (e) => ({
      isLoggedIn: !1,
      user: null,
      loading: !1,
      modal: {
        on: !1,
        type: "",
        file: -1,
        username: "",
        gltf_url: ""
      },
      login: async (s, o) => {
        e({ loading: !0 });
        try {
          return s === "admin" && o === "password" ? (e({ isLoggedIn: !0, user: { username: s }, loading: !1 }), !0) : (e({ loading: !1 }), !1);
        } catch {
          return e({ loading: !1 }), !1;
        }
      },
      logout: () => {
        e({ isLoggedIn: !1, user: null });
      },
      setLoading: (s) => {
        e({ loading: s });
      },
      setModal: (s) => {
        e({ modal: s });
      }
    }),
    {
      name: "gaesup-admin-auth",
      partialize: (e) => ({ isLoggedIn: e.isLoggedIn, user: e.user })
    }
  )
), f = () => {
  const [e, s] = u(""), [o, t] = u(""), [n, l] = u(""), a = g((r) => r.login);
  return /* @__PURE__ */ d("div", { className: "login-container", children: [
    /* @__PURE__ */ i("h1", { children: "Admin Login" }),
    /* @__PURE__ */ d("form", { onSubmit: async (r) => {
      r.preventDefault(), l(""), await a(e, o) || l("Invalid username or password");
    }, className: "login-form", children: [
      /* @__PURE__ */ i(
        "input",
        {
          type: "text",
          value: e,
          onChange: (r) => s(r.target.value),
          placeholder: "Username",
          className: "login-input",
          autoComplete: "username"
        }
      ),
      /* @__PURE__ */ i(
        "input",
        {
          type: "password",
          value: o,
          onChange: (r) => t(r.target.value),
          placeholder: "Password",
          className: "login-input",
          autoComplete: "current-password"
        }
      ),
      /* @__PURE__ */ i("button", { type: "submit", className: "login-button", children: "Login" }),
      n && /* @__PURE__ */ i("p", { className: "login-error", children: n })
    ] })
  ] });
}, I = ({ children: e, requireLogin: s = !0 }) => {
  const o = g((t) => t.isLoggedIn);
  return s && !o ? /* @__PURE__ */ i(f, {}) : /* @__PURE__ */ i(m, { children: e });
}, N = c((e, s) => ({
  toasts: [],
  timers: /* @__PURE__ */ new Map(),
  addToast: (o) => {
    const t = Date.now().toString(), n = { ...o, id: t };
    e((a) => ({ toasts: [...a.toasts, n] }));
    const l = setTimeout(() => {
      s().removeToast(t);
    }, 3e3);
    e((a) => (a.timers.set(t, l), {}));
  },
  addToastAsync: async (o) => new Promise((t) => {
    s().addToast(o), t();
  }),
  removeToast: (o) => {
    const { timers: t } = s(), n = t.get(o);
    n && (clearTimeout(n), t.delete(o)), e((l) => ({ toasts: l.toasts.filter((a) => a.id !== o) }));
  }
}));
export {
  I as GaesupAdmin,
  g as useAuthStore,
  N as useToast
};
