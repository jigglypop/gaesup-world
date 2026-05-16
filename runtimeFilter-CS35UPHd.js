import { I as m } from "./EventBus-Ck0Dwee2.js";
class y extends Error {
  constructor(e, t = {}) {
    const n = t.registryName ? `${t.registryName} ` : "", s = t.existingPluginId ? ` by plugin "${t.existingPluginId}"` : "", i = t.pluginId ? ` Plugin "${t.pluginId}" cannot register it.` : "";
    super(`${n}Extension "${e}" is already registered${s}.${i}`), this.name = "DuplicateExtensionError";
  }
}
class w extends Error {
  constructor(e, t) {
    const n = t ? `${t} ` : "";
    super(`${n}Extension "${e}" is not registered.`), this.name = "MissingExtensionError";
  }
}
class o {
  entries = /* @__PURE__ */ new Map();
  name;
  constructor(e = {}) {
    this.name = typeof e == "string" ? e : e.name;
  }
  register(e, t, n) {
    const s = this.entries.get(e);
    if (s)
      throw new y(e, {
        registryName: this.name,
        existingPluginId: s.pluginId,
        pluginId: n
      });
    const i = n === void 0 ? { id: e, value: t } : { id: e, value: t, pluginId: n };
    this.entries.set(e, i);
  }
  get(e) {
    return this.entries.get(e)?.value;
  }
  require(e) {
    const t = this.entries.get(e)?.value;
    if (t === void 0)
      throw new w(e, this.name);
    return t;
  }
  has(e) {
    return this.entries.has(e);
  }
  remove(e) {
    return this.entries.delete(e);
  }
  removeByPlugin(e) {
    let t = 0;
    for (const [n, s] of this.entries)
      s.pluginId === e && (this.entries.delete(n), t += 1);
    return t;
  }
  list() {
    return Array.from(this.entries.values());
  }
  clear() {
    this.entries.clear();
  }
}
const p = {
  debug: () => {
  },
  info: () => {
  },
  warn: () => {
  },
  error: () => {
  }
};
function v(r = {}) {
  return {
    debug: r.debug ?? p.debug,
    info: r.info ?? p.info,
    warn: r.warn ?? p.warn,
    error: r.error ?? p.error
  };
}
function b(r, e = {}) {
  return {
    plugins: r,
    events: new m(),
    logger: v(e.logger),
    grid: new o("grid"),
    placement: new o("placement"),
    catalog: new o("catalog"),
    assets: new o("assets"),
    rendering: new o("rendering"),
    input: new o("input"),
    interactions: new o("interactions"),
    npc: new o("npc"),
    quests: new o("quests"),
    blueprints: new o("blueprints"),
    editor: new o("editor"),
    save: new o("save"),
    services: new o("services"),
    systems: new o("systems"),
    components: new o("components")
  };
}
class x extends Error {
  constructor(e) {
    super(`Plugin "${e}" is already registered.`), this.name = "DuplicatePluginError";
  }
}
class P extends Error {
  constructor(e, t, n = "*") {
    super(`Plugin "${e}" depends on missing plugin "${t}" (${n}).`), this.name = "MissingPluginDependencyError";
  }
}
class D extends Error {
  constructor(e, t, n, s) {
    super(
      `Plugin "${e}" depends on "${t}" ${s}, but version "${n}" is registered.`
    ), this.name = "PluginVersionMismatchError";
  }
}
class u extends Error {
  constructor(e, t) {
    super(`Plugin "${e}" has an invalid manifest: ${t}`), this.name = "PluginManifestValidationError";
  }
}
class $ extends Error {
  constructor(e) {
    super(`Circular plugin dependency detected while setting up "${e}".`), this.name = "CircularPluginDependencyError";
  }
}
class E {
  records = /* @__PURE__ */ new Map();
  setupOrder = [];
  options;
  context;
  constructor(e = {}) {
    this.options = e, this.context = b(this, e);
  }
  register(e) {
    if (this.records.has(e.id))
      throw new x(e.id);
    this.records.set(e.id, {
      plugin: e,
      manifest: this.toManifest(e),
      status: "registered"
    });
  }
  async use(e) {
    this.register(e), await this.setup(e.id);
  }
  async setupAll() {
    for (const e of this.records.keys())
      await this.setup(e);
    this.reportCapabilityDiagnostics();
  }
  async setup(e) {
    await this.setupInternal(e, /* @__PURE__ */ new Set());
  }
  async dispose(e) {
    const t = this.records.get(e);
    if (!(!t || t.status === "disposed")) {
      t.status = "disposing";
      try {
        await t.plugin.dispose?.(this.context), this.removePluginExtensions(e), t.status = "disposed", this.removeFromSetupOrder(e);
      } catch (n) {
        throw t.status = "failed", t.error = n, n;
      }
    }
  }
  async disposeAll() {
    const e = Array.from(this.setupOrder).reverse();
    for (const t of e)
      await this.dispose(t);
  }
  has(e) {
    return this.records.has(e);
  }
  get(e) {
    return this.records.get(e);
  }
  list() {
    return Array.from(this.records.values());
  }
  status(e) {
    return this.records.get(e)?.status;
  }
  getDiagnostics() {
    return this.collectCapabilityDiagnostics();
  }
  async setupInternal(e, t) {
    const n = this.records.get(e);
    if (n && n.status !== "ready") {
      if (n.status === "setting-up" || t.has(e))
        throw new $(e);
      this.validateManifest(n.manifest), t.add(e);
      for (const s of this.toDependencyDeclarations(n.plugin.dependencies)) {
        const i = this.records.get(s.id), c = s.version ?? "*";
        if (!i)
          throw new P(e, s.id, c);
        this.validateDependencyVersion(e, s.id, i.manifest.version, c), await this.setupInternal(s.id, t);
      }
      for (const s of this.toDependencyDeclarations(n.plugin.optionalDependencies)) {
        const i = this.records.get(s.id);
        i && (this.validateDependencyVersion(
          e,
          s.id,
          i.manifest.version,
          s.version ?? "*"
        ), await this.setupInternal(s.id, t));
      }
      n.status = "setting-up";
      try {
        await n.plugin.setup(this.context), n.status = "ready", this.setupOrder.includes(e) || this.setupOrder.push(e);
      } catch (s) {
        throw n.status = "failed", n.error = s, s;
      } finally {
        t.delete(e);
      }
    }
  }
  toManifest(e) {
    const t = {
      id: e.id,
      name: e.name,
      version: e.version,
      runtime: e.runtime ?? "client",
      capabilities: e.capabilities ?? []
    }, n = this.toDependencyRecord(e.dependencies), s = this.toDependencyRecord(e.optionalDependencies);
    return n && (t.dependencies = n), s && (t.optionalDependencies = s), t;
  }
  toDependencyRecord(e) {
    if (!(!e || e.length === 0))
      return Object.fromEntries(
        this.toDependencyDeclarations(e).map((t) => [
          t.id,
          t.version ?? "*"
        ])
      );
  }
  toDependencyDeclarations(e) {
    return e ? e.map((t) => typeof t == "string" ? { id: t, version: "*" } : t.version === void 0 ? { id: t.id, version: "*" } : { id: t.id, version: t.version }) : [];
  }
  validateManifest(e) {
    if (!e.id.trim())
      throw new u(e.id || "<empty>", "id must be a non-empty string.");
    if (!e.name.trim())
      throw new u(e.id, "name must be a non-empty string.");
    if (!B(e.version))
      throw new u(e.id, `version "${e.version}" must be semver.`);
    for (const [t, n] of Object.entries(e.dependencies ?? {})) {
      if (!t.trim())
        throw new u(e.id, "dependency id must be non-empty.");
      if (!g(n))
        throw new u(
          e.id,
          `dependency "${t}" has unsupported version range "${n}".`
        );
    }
    for (const [t, n] of Object.entries(e.optionalDependencies ?? {})) {
      if (!t.trim())
        throw new u(e.id, "optional dependency id must be non-empty.");
      if (!g(n))
        throw new u(
          e.id,
          `optional dependency "${t}" has unsupported version range "${n}".`
        );
    }
  }
  validateDependencyVersion(e, t, n, s) {
    if (!M(n, s))
      throw new D(e, t, n, s);
  }
  reportCapabilityDiagnostics() {
    for (const e of this.collectCapabilityDiagnostics())
      this.context.logger.warn(e.message, e);
  }
  collectCapabilityDiagnostics() {
    const e = [], t = this.collectCapabilityOwners();
    for (const s of this.options.requiredCapabilities ?? [])
      t.has(s) || e.push({
        kind: "missing-capability",
        message: `Required capability "${s}" is not provided by any registered plugin.`,
        pluginIds: [],
        capabilities: [s]
      });
    for (const s of this.options.exclusiveCapabilities ?? []) {
      const i = t.get(s) ?? [];
      i.length <= 1 || e.push({
        kind: "capability-conflict",
        message: `Exclusive capability "${s}" is provided by multiple plugins: ${i.join(", ")}.`,
        pluginIds: i,
        capabilities: [s]
      });
    }
    const n = /* @__PURE__ */ new Set();
    for (const [s, i] of Object.entries(this.options.capabilityConflicts ?? {})) {
      const c = t.get(s) ?? [];
      if (c.length !== 0)
        for (const d of i) {
          const h = t.get(d) ?? [];
          if (h.length === 0) continue;
          const f = [s, d].sort().join("\0");
          n.has(f) || (n.add(f), e.push({
            kind: "capability-conflict",
            message: `Capabilities "${s}" and "${d}" are both provided.`,
            pluginIds: [...c, ...h],
            capabilities: [s, d]
          }));
        }
    }
    return e;
  }
  collectCapabilityOwners() {
    const e = /* @__PURE__ */ new Map();
    for (const t of this.records.values())
      for (const n of t.manifest.capabilities) {
        const s = e.get(n) ?? [];
        s.push(t.manifest.id), e.set(n, s);
      }
    return e;
  }
  removeFromSetupOrder(e) {
    const t = this.setupOrder.indexOf(e);
    t !== -1 && this.setupOrder.splice(t, 1);
  }
  removePluginExtensions(e) {
    this.context.grid.removeByPlugin(e), this.context.placement.removeByPlugin(e), this.context.catalog.removeByPlugin(e), this.context.assets.removeByPlugin(e), this.context.rendering.removeByPlugin(e), this.context.input.removeByPlugin(e), this.context.interactions.removeByPlugin(e), this.context.npc.removeByPlugin(e), this.context.quests.removeByPlugin(e), this.context.blueprints.removeByPlugin(e), this.context.editor.removeByPlugin(e), this.context.save.removeByPlugin(e), this.context.services.removeByPlugin(e), this.context.systems.removeByPlugin(e), this.context.components.removeByPlugin(e);
  }
}
function S(r = {}) {
  return new E(r);
}
function B(r) {
  return a(r) !== null;
}
function g(r) {
  return r === "*" ? !0 : r.split(/\s+/).filter(Boolean).every((e) => {
    if (e.startsWith("^") || e.startsWith("~"))
      return a(e.slice(1)) !== null;
    const t = e.match(/^(>=|<=|>|<|=)(.+)$/);
    return t ? a(t[2]?.trim() ?? "") !== null : a(e) !== null;
  });
}
function M(r, e) {
  const t = a(r);
  return t ? e === "*" ? !0 : e.split(/\s+/).filter(Boolean).every((s) => O(t, s)) : !1;
}
function O(r, e) {
  if (e.startsWith("^")) {
    const s = a(e.slice(1));
    if (!s || l(r, s) < 0) return !1;
    const i = s[0] > 0 ? [s[0] + 1, 0, 0] : s[1] > 0 ? [0, s[1] + 1, 0] : [0, 0, s[2] + 1];
    return l(r, i) < 0;
  }
  if (e.startsWith("~")) {
    const s = a(e.slice(1));
    return !s || l(r, s) < 0 ? !1 : l(r, [s[0], s[1] + 1, 0]) < 0;
  }
  const t = e.match(/^(>=|<=|>|<|=)(.+)$/);
  if (t) {
    const s = t[1], i = a(t[2]?.trim() ?? "");
    if (!s || !i) return !1;
    const c = l(r, i);
    switch (s) {
      case ">":
        return c > 0;
      case ">=":
        return c >= 0;
      case "<":
        return c < 0;
      case "<=":
        return c <= 0;
      case "=":
        return c === 0;
      default:
        return !1;
    }
  }
  const n = a(e);
  return n ? l(r, n) === 0 : !1;
}
function a(r) {
  const e = r.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+][0-9A-Za-z.-]+)?$/);
  if (!e) return null;
  const t = Number(e[1]), n = Number(e[2]), s = Number(e[3]);
  return !Number.isSafeInteger(t) || !Number.isSafeInteger(n) || !Number.isSafeInteger(s) ? null : [t, n, s];
}
function l(r, e) {
  return r[0] !== e[0] ? r[0] - e[0] : r[1] !== e[1] ? r[1] - e[1] : r[2] !== e[2] ? r[2] - e[2] : 0;
}
function C(r, e) {
  const t = r ?? "client";
  return t === "both" || t === e;
}
function V(r, e) {
  return r.filter((t) => C(t.runtime, e));
}
export {
  $ as C,
  y as D,
  o as I,
  w as M,
  u as P,
  S as a,
  x as b,
  v as c,
  P as d,
  E as e,
  V as f,
  D as g,
  b as h,
  C as s
};
