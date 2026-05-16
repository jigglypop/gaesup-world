import { C as c, e as l, f as d, h as i, G as p, b as m, H as E, S, c as v, d as u, i as A, j as _, k as T, m as R, n as y, g as N, l as P, v as C, a as M } from "./loader-C3ZwumCe.js";
import { M as G, c as f } from "./types-Ck0ueY4N.js";
import { c as O, a as D, b as w, d as I, e as Y, f as L, g as b } from "./authority-CysRQudy.js";
import { D as B, c as V } from "./serverHost-DEn-35k3.js";
import { P as H, W as F, c as W, a as j, b as U, d as Q, e as q, p as z } from "./snapshot-OExk53wq.js";
const t = {
  owner: [
    "workspace:read",
    "workspace:manage",
    "content:edit",
    "content:validate",
    "content:publish",
    "content:rollback",
    "asset:upload",
    "asset:approve",
    "moderation:read",
    "moderation:resolve",
    "analytics:read"
  ],
  admin: [
    "workspace:read",
    "content:edit",
    "content:validate",
    "content:publish",
    "content:rollback",
    "asset:upload",
    "asset:approve",
    "moderation:read",
    "moderation:resolve",
    "analytics:read"
  ],
  developer: ["workspace:read", "content:edit", "content:validate", "asset:upload", "analytics:read"],
  designer: ["workspace:read", "content:edit", "asset:upload"],
  moderator: ["workspace:read", "moderation:read", "moderation:resolve"],
  viewer: ["workspace:read"]
};
function r(e) {
  return Array.from(new Set(e.flatMap((a) => t[a])));
}
function o(e, a) {
  return e.permissions.includes(a) || r(e.roles).includes(a);
}
export {
  c as CONTENT_SCHEMA_VERSION,
  B as DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID,
  l as GAMEPLAY_EVENT_ACTION_TYPES,
  d as GAMEPLAY_EVENT_CONDITION_TYPES,
  i as GAMEPLAY_EVENT_TRIGGER_TYPES,
  p as GameplayEventEngine,
  m as GameplayEventRegistry,
  E as HttpContentBundleSource,
  G as MockNetworkAdapter,
  H as PLAYER_PROGRESS_DOMAINS,
  t as ROLE_PERMISSIONS,
  S as SEED_GAMEPLAY_EVENTS,
  F as WORLD_SNAPSHOT_DOMAINS,
  o as canMember,
  W as collectSaveDomains,
  O as createCommandAcceptedResult,
  D as createCommandAuthorityRouter,
  w as createCommandRejectedResult,
  v as createContentBundleFromSaveSystem,
  u as createDefaultGameplayEventRegistry,
  I as createGameCommand,
  A as createGameplayEventActionTemplate,
  _ as createGameplayEventConditionTemplate,
  T as createGameplayEventTriggerTemplate,
  R as createManualToastEventBlueprint,
  f as createNetworkEnvelope,
  y as createNpcTalkStartsQuestEventBlueprint,
  j as createPlayerProgress,
  U as createPlayerProgressFromSaveSystem,
  Y as createServerEvent,
  V as createServerPluginHost,
  L as createSnapshotAck,
  b as createStateDelta,
  Q as createWorldSnapshot,
  q as createWorldSnapshotFromSaveSystem,
  N as getGameplayEventRegistry,
  P as loadContentBundleFromManifest,
  z as pickDomains,
  r as resolveRolePermissions,
  C as validateContentBundle,
  M as validateContentBundleManifest
};
