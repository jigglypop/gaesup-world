import { a as u, P as g, d as h, g as v, C as y, b as f } from "./runtimeFilter-CS35UPHd.js";
import { D as N, I as _, M as $, e as L, h as x, c as A, f as C, s as q } from "./runtimeFilter-CS35UPHd.js";
import { I as V } from "./EventBus-Ck0Dwee2.js";
function k(e) {
  return e;
}
const n = "@gaesup/sample-cozy-life", d = "@gaesup/sample-high-graphics", o = "@gaesup/sample-shooter-kit";
function w() {
  return {
    id: n,
    name: "Cozy Life Sample",
    version: "0.1.0",
    runtime: "both",
    capabilities: ["catalog:cozy-life", "quests:daily-life", "npc:schedules"],
    setup(e) {
      e.catalog.register("sample.cozy-life.catalogPack", {
        itemTypes: ["crop", "fish", "bug", "furniture"],
        starterItems: ["seed-turnip", "rod", "wood"]
      }, n), e.quests.register("sample.cozy-life.dailyQuestPack", {
        objectiveTypes: ["collect", "talk", "deliver"],
        rewardTypes: ["bells", "friendship", "item"]
      }, n), e.npc.register("sample.cozy-life.schedulePack", {
        activities: ["idle", "shop", "work", "sleep"]
      }, n), e.events.emit("plugin:sample-ready", { pluginId: n });
    },
    dispose(e) {
      e.catalog.remove("sample.cozy-life.catalogPack"), e.quests.remove("sample.cozy-life.dailyQuestPack"), e.npc.remove("sample.cozy-life.schedulePack");
    }
  };
}
function R() {
  return {
    id: d,
    name: "High Graphics Sample",
    version: "0.1.0",
    runtime: "client",
    capabilities: ["rendering:high-graphics"],
    setup(e) {
      e.rendering.register("sample.high-graphics.preset", {
        shadows: "high",
        toneMapping: "filmic",
        postprocess: ["bloom", "color-grade", "ambient-occlusion"]
      }, d), e.assets.register("sample.high-graphics.assetPolicy", {
        preferredFormats: ["ktx2", "webp", "glb"],
        fallbackFormats: ["png", "jpg", "gltf"]
      }, d), e.events.emit("plugin:sample-ready", { pluginId: d });
    },
    dispose(e) {
      e.rendering.remove("sample.high-graphics.preset"), e.assets.remove("sample.high-graphics.assetPolicy");
    }
  };
}
function z() {
  return {
    id: o,
    name: "Shooter Kit Sample",
    version: "0.1.0",
    runtime: "both",
    capabilities: ["catalog:weapons", "input:shooter", "interactions:damage"],
    setup(e) {
      e.catalog.register("sample.shooter-kit.weaponTypes", {
        itemTypes: ["weapon", "ammo", "armor"],
        stats: ["damage", "range", "fireRate", "reloadTime"]
      }, o), e.input.register("sample.shooter-kit.bindings", {
        actions: {
          fire: ["Mouse0", "GamepadRT"],
          aim: ["Mouse1", "GamepadLT"],
          reload: ["KeyR", "GamepadX"]
        }
      }, o), e.interactions.register("sample.shooter-kit.damageable", {
        events: ["damage:request", "damage:confirmed"],
        authority: "server"
      }, o), e.events.emit("plugin:sample-ready", { pluginId: o });
    },
    dispose(e) {
      e.catalog.remove("sample.shooter-kit.weaponTypes"), e.input.remove("sample.shooter-kit.bindings"), e.interactions.remove("sample.shooter-kit.damageable");
    }
  };
}
function P(e) {
  const s = {
    useStore: e,
    getState: e.getState
  };
  return "setState" in e && typeof e.setState == "function" ? {
    ...s,
    setState: e.setState
  } : s;
}
function G(e) {
  const s = e.serialize ?? (() => e.store.getState().serialize()), t = e.hydrate ?? ((i) => {
    e.store.getState().hydrate(i);
  });
  return {
    id: e.id,
    name: e.name,
    version: e.version ?? "0.1.0",
    runtime: e.runtime ?? "client",
    capabilities: e.capabilities ?? [e.saveExtensionId],
    setup(i) {
      const r = {
        key: e.saveExtensionId,
        serialize: s,
        hydrate: t
      };
      i.save.register(e.saveExtensionId, r, e.id), i.services.register(e.storeServiceId, P(e.store), e.id), i.events.emit(e.readyEvent, {
        pluginId: e.id,
        saveExtensionId: e.saveExtensionId,
        storeServiceId: e.storeServiceId
      });
    },
    dispose(i) {
      i.save.remove(e.saveExtensionId), i.services.remove(e.storeServiceId);
    }
  };
}
class I extends Error {
  result;
  constructor(s) {
    super(`Plugin "${s.pluginId}" failed validation: ${s.issues.map((t) => t.message).join("; ")}`), this.name = "PluginValidationAssertionError", this.result = s;
  }
}
async function S(e, s = {}) {
  const t = u(s.registry), i = [], r = Array.isArray(s.expectedRuntime) ? s.expectedRuntime : s.expectedRuntime ? [s.expectedRuntime] : null;
  r && !r.includes(e.runtime ?? "client") && i.push({
    code: "runtime",
    message: `Plugin "${e.id}" targets runtime "${e.runtime ?? "client"}", expected ${r.join(", ")}.`,
    pluginId: e.id
  });
  try {
    for (const a of s.dependencies ?? [])
      t.register(a);
    t.register(e), await t.setup(e.id);
  } catch (a) {
    i.push(E(e.id, a));
  }
  const m = t.getDiagnostics();
  for (const a of m)
    i.push({
      code: "diagnostic",
      message: a.message,
      pluginId: e.id,
      details: a
    });
  const l = t.context.save.list().filter((a) => a.pluginId === e.id).map((a) => a.id);
  for (const a of s.requiredSaveNamespaces ?? [])
    l.includes(a) || i.push({
      code: "save-namespace",
      message: `Plugin "${e.id}" did not register required save namespace "${a}".`,
      pluginId: e.id,
      details: { namespace: a, saveNamespaces: l }
    });
  const c = s.allowedSaveNamespaces ? new Set(s.allowedSaveNamespaces) : null;
  if (c)
    for (const a of l)
      c.has(a) || i.push({
        code: "save-namespace",
        message: `Plugin "${e.id}" registered unexpected save namespace "${a}".`,
        pluginId: e.id,
        details: { namespace: a, allowedSaveNamespaces: Array.from(c) }
      });
  const p = t.get(e.id)?.manifest ?? null;
  return await t.disposeAll(), {
    ok: i.length === 0,
    pluginId: e.id,
    manifest: p,
    issues: i,
    diagnostics: m,
    saveNamespaces: l
  };
}
async function T(e, s = {}) {
  const t = await S(e, s);
  if (!t.ok)
    throw new I(t);
  return t;
}
function E(e, s) {
  return s instanceof g ? { code: "manifest", message: s.message, pluginId: e, details: s } : s instanceof h || s instanceof v || s instanceof y ? { code: "dependency", message: s.message, pluginId: e, details: s } : s instanceof f ? { code: "setup", message: s.message, pluginId: e, details: s } : {
    code: "setup",
    message: s instanceof Error ? s.message : "Plugin setup failed.",
    pluginId: e,
    details: s
  };
}
export {
  y as CircularPluginDependencyError,
  N as DuplicateExtensionError,
  f as DuplicatePluginError,
  V as InMemoryEventBus,
  _ as InMemoryExtensionRegistry,
  $ as MissingExtensionError,
  h as MissingPluginDependencyError,
  g as PluginManifestValidationError,
  L as PluginRegistry,
  I as PluginValidationAssertionError,
  v as PluginVersionMismatchError,
  T as assertValidGaesupPlugin,
  w as createCozyLifeSamplePlugin,
  R as createHighGraphicsSamplePlugin,
  x as createPluginContext,
  A as createPluginLogger,
  u as createPluginRegistry,
  z as createShooterKitSamplePlugin,
  G as createStoreDomainPlugin,
  k as defineGaesupPlugin,
  C as filterPluginsForRuntime,
  q as shouldSetupPluginForRuntime,
  S as validateGaesupPlugin
};
