import { a as u, d as v, c as m } from "./snapshot-OExk53wq.js";
import { c as y, a as f, f as d } from "./runtimeFilter-CS35UPHd.js";
import { a as S } from "./authority-CysRQudy.js";
const g = "server.commandAuthority";
function h(r) {
  if (!r || typeof r != "object") return !1;
  const a = r;
  return typeof a.key == "string" && typeof a.serialize == "function" && typeof a.hydrate == "function";
}
function R(r = {}) {
  const a = y(r.logger), t = f(r.logger ? { logger: r.logger } : {}), n = S(r.commandAuthority), i = /* @__PURE__ */ new Map();
  t.context.services.register(
    g,
    n,
    "platform.server-host"
  );
  for (const e of d(r.plugins ?? [], "server"))
    t.register(e);
  const o = (e) => {
    const s = r.saveSystem;
    if (!s) {
      a.warn("Server plugin host ignored save binding because no SaveSystem was provided.", {
        key: e.key
      });
      return;
    }
    i.has(e.key) || i.set(e.key, s.register(e));
  };
  for (const e of r.saveBindings ?? [])
    o(e);
  const l = () => {
    for (const e of t.context.save.list())
      h(e.value) && o(e.value);
  }, c = () => r.saveSystem ? m(r.saveSystem) : {};
  return {
    pluginRuntime: "server",
    plugins: t,
    commandAuthority: n,
    ...r.saveSystem ? { saveSystem: r.saveSystem } : {},
    setup: async () => {
      await t.setupAll(), l();
    },
    dispose: async () => {
      await t.disposeAll();
      for (const e of i.values())
        e();
      i.clear(), n.clear(), t.context.services.remove(g);
    },
    handleCommand: (e) => n.handle(e),
    getService: (e) => t.context.services.get(e),
    requireService: (e) => t.context.services.require(e),
    getSaveBindings: () => r.saveSystem?.getBindings() ?? [],
    createWorldSnapshot: (e, s = {}) => v(e, c(), s),
    createPlayerProgress: (e, s = {}) => u(e, c(), s)
  };
}
export {
  g as D,
  R as c
};
