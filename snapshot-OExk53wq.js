const o = [
  "building",
  "scene",
  "character",
  "assets",
  "npc",
  "camera",
  "time",
  "weather",
  "audio"
], i = [
  "inventory",
  "wallet",
  "shop",
  "relations",
  "quests",
  "mail",
  "catalog",
  "crafting",
  "farming",
  "events",
  "town",
  "i18n"
];
function t(r, n) {
  const e = {};
  for (const a of n)
    a in r && (e[a] = r[a]);
  return e;
}
function c(r, n, e = {}) {
  return {
    kind: "world",
    worldId: r,
    version: e.version ?? 1,
    savedAt: e.savedAt ?? Date.now(),
    domains: t(n, o)
  };
}
function d(r, n, e = {}) {
  return {
    kind: "player",
    playerId: r,
    ...e.worldId ? { worldId: e.worldId } : {},
    version: e.version ?? 1,
    savedAt: e.savedAt ?? Date.now(),
    domains: t(n, i)
  };
}
function s(r) {
  const n = {};
  for (const e of r.getBindings())
    try {
      n[e.key] = e.serialize();
    } catch {
      n[e.key] = null;
    }
  return n;
}
function l(r, n, e = {}) {
  return c(n, s(r), e);
}
function u(r, n, e = {}) {
  return d(n, s(r), e);
}
export {
  i as P,
  o as W,
  d as a,
  u as b,
  s as c,
  c as d,
  l as e,
  t as p
};
