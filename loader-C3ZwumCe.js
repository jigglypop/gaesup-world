import { g as j, u as l, n as m, a as D } from "./eventsStore-DqmXNVEb.js";
import { create as w } from "zustand";
import { u as B } from "./timeStore-BRw0mdde.js";
import { W as F } from "./snapshot-OExk53wq.js";
const x = 1e3, I = w((t, e) => ({
  bells: x,
  lifetimeEarned: 0,
  lifetimeSpent: 0,
  add: (s) => {
    if (s <= 0) return;
    const r = e();
    t({ bells: r.bells + s, lifetimeEarned: r.lifetimeEarned + s });
  },
  spend: (s) => {
    if (s <= 0) return !0;
    const r = e();
    return r.bells < s ? !1 : (t({ bells: r.bells - s, lifetimeSpent: r.lifetimeSpent + s }), !0);
  },
  set: (s) => t({ bells: Math.max(0, s) }),
  serialize: () => {
    const s = e();
    return {
      version: 1,
      bells: s.bells,
      lifetimeEarned: s.lifetimeEarned,
      lifetimeSpent: s.lifetimeSpent
    };
  },
  hydrate: (s) => {
    s && t({
      bells: typeof s.bells == "number" ? Math.max(0, s.bells) : x,
      lifetimeEarned: typeof s.lifetimeEarned == "number" ? s.lifetimeEarned : 0,
      lifetimeSpent: typeof s.lifetimeSpent == "number" ? s.lifetimeSpent : 0
    });
  }
})), V = [
  { level: "stranger", min: 0 },
  { level: "acquaintance", min: 50 },
  { level: "friend", min: 150 },
  { level: "close", min: 350 },
  { level: "best", min: 700 }
], Q = 25;
function C(t) {
  return { npcId: t, score: 0, todayGained: 0, lastGiftDay: -1, giftHistory: {} };
}
function _(t) {
  let e = "stranger";
  for (const s of V)
    t >= s.min && (e = s.level);
  return e;
}
function R(t) {
  const e = j().get(t);
  return e ? e.rarity === "legendary" ? 25 : e.rarity === "epic" ? 18 : e.rarity === "rare" ? 12 : e.rarity === "uncommon" ? 8 : e.category === "food" ? 6 : e.category === "fish" || e.category === "bug" ? 7 : e.category === "furniture" ? 10 : 4 : 1;
}
const k = w((t, e) => ({
  entries: {},
  ensure: (s) => {
    const r = e().entries[s];
    if (r) return r;
    const n = C(s);
    return t({ entries: { ...e().entries, [s]: n } }), n;
  },
  add: (s, r, n) => {
    if (r === 0) return 0;
    let i = e().entries[s] ?? C(s);
    i.lastGiftDay !== n && (i = { ...i, todayGained: 0, lastGiftDay: n });
    let c = r;
    if (c > 0) {
      const u = Math.max(0, Q - i.todayGained);
      c = Math.min(c, u);
    }
    if (c === 0) return 0;
    const o = {
      ...i,
      score: Math.max(0, i.score + c),
      todayGained: i.todayGained + Math.max(0, c)
    };
    return t({ entries: { ...e().entries, [s]: o } }), c;
  },
  giveGift: (s, r, n) => {
    const a = R(r), i = e().add(s, a, n), c = e().entries[s], o = { ...c.giftHistory, [r]: (c.giftHistory[r] ?? 0) + 1 };
    return t({ entries: { ...e().entries, [s]: { ...c, giftHistory: o } } }), { gained: i, capped: i < a };
  },
  resetDaily: (s) => {
    if (s) {
      const n = e().entries[s];
      if (!n) return;
      t({ entries: { ...e().entries, [s]: { ...n, todayGained: 0 } } });
      return;
    }
    const r = {};
    for (const [n, a] of Object.entries(e().entries)) r[n] = { ...a, todayGained: 0 };
    t({ entries: r });
  },
  scoreOf: (s) => e().entries[s]?.score ?? 0,
  levelOf: (s) => _(e().scoreOf(s)),
  serialize: () => ({
    version: 1,
    entries: Object.fromEntries(Object.entries(e().entries).map(([s, r]) => [s, { ...r, giftHistory: { ...r.giftHistory } }]))
  }),
  hydrate: (s) => {
    if (!s || typeof s != "object") return;
    const r = {};
    if (s.entries && typeof s.entries == "object")
      for (const [n, a] of Object.entries(s.entries))
        !a || typeof a != "object" || (r[n] = {
          npcId: n,
          score: typeof a.score == "number" ? a.score : 0,
          todayGained: typeof a.todayGained == "number" ? a.todayGained : 0,
          lastGiftDay: typeof a.lastGiftDay == "number" ? a.lastGiftDay : -1,
          giftHistory: a.giftHistory && typeof a.giftHistory == "object" ? { ...a.giftHistory } : {}
        });
    t({ entries: r });
  }
}));
class N {
  defs = /* @__PURE__ */ new Map();
  register(e) {
    this.defs.has(e.id) || this.defs.set(e.id, e);
  }
  registerAll(e) {
    for (const s of e) this.register(s);
  }
  get(e) {
    return this.defs.get(e);
  }
  require(e) {
    const s = this.defs.get(e);
    if (!s) throw new Error(`Unknown QuestId: ${e}`);
    return s;
  }
  all() {
    return Array.from(this.defs.values());
  }
  has(e) {
    return this.defs.has(e);
  }
  clear() {
    this.defs.clear();
  }
}
let S = null;
function d() {
  return S || (S = new N()), S;
}
function T(t) {
  return t.type === "collect" || t.type === "deliver" ? t.count : 1;
}
function H(t) {
  if (t.type === "item")
    l.getState().add(t.itemId, t.count ?? 1) > 0 && m("warn", "인벤토리가 부족합니다");
  else if (t.type === "bells")
    I.getState().add(t.amount), m("reward", `+${t.amount} B`);
  else if (t.type === "friendship") {
    const e = Math.floor(B.getState().totalMinutes / 1440);
    k.getState().add(t.npcId, t.amount, e);
  }
}
function L(t, e = "active") {
  const s = {};
  for (const r of t.objectives) s[r.id] = 0;
  return { questId: t.id, status: e, progress: s, startedAt: Date.now() };
}
const f = w((t, e) => ({
  state: {},
  start: (s) => {
    const r = d().get(s);
    if (!r) return !1;
    const n = e().state[s];
    if (n && n.status === "active" || n && n.status === "completed" && !r.repeatable) return !1;
    if (r.prerequisiteQuests) {
      for (const i of r.prerequisiteQuests)
        if (e().state[i]?.status !== "completed") return !1;
    }
    const a = L(r, "active");
    return t({ state: { ...e().state, [s]: a } }), m("info", `퀘스트 시작: ${r.name}`), !0;
  },
  abandon: (s) => {
    const r = e().state[s];
    !r || r.status !== "active" || t({ state: { ...e().state, [s]: { ...r, status: "failed" } } });
  },
  complete: (s) => {
    const r = d().get(s);
    if (!r) return !1;
    const n = e().state[s];
    if (!n || n.status !== "active" || !e().isAllObjectivesComplete(s)) return !1;
    for (const a of r.objectives)
      a.type === "deliver" && l.getState().removeById(a.itemId, a.count);
    for (const a of r.rewards) H(a);
    return t({ state: { ...e().state, [s]: { ...n, status: "completed", completedAt: Date.now() } } }), m("success", `퀘스트 완료: ${r.name}`), !0;
  },
  notifyTalk: (s) => {
    const r = { ...e().state };
    let n = !1;
    for (const [a, i] of Object.entries(r)) {
      if (i.status !== "active") continue;
      const c = d().get(a);
      if (c)
        for (const o of c.objectives)
          o.type === "talk" && o.npcId === s && (i.progress[o.id] ?? 0) < 1 && (r[a] = { ...i, progress: { ...i.progress, [o.id]: 1 } }, n = !0);
    }
    n && t({ state: r });
  },
  notifyDeliver: (s, r, n = 1) => {
    let a = !1;
    const i = { ...e().state };
    for (const [c, o] of Object.entries(i)) {
      if (o.status !== "active") continue;
      const u = d().get(c);
      if (u) {
        for (const p of u.objectives)
          if (p.type === "deliver" && p.npcId === s && p.itemId === r) {
            const A = l.getState().countOf(r);
            if (A <= 0) continue;
            const q = Math.min(A, p.count - (o.progress[p.id] ?? 0), n);
            if (q <= 0) continue;
            const M = l.getState().removeById(r, q);
            i[c] = {
              ...o,
              progress: { ...o.progress, [p.id]: (o.progress[p.id] ?? 0) + M }
            }, a = !0;
          }
      }
    }
    return a && t({ state: i }), a;
  },
  notifyVisit: (s) => {
    const r = { ...e().state };
    let n = !1;
    for (const [a, i] of Object.entries(r)) {
      if (i.status !== "active") continue;
      const c = d().get(a);
      if (c)
        for (const o of c.objectives)
          o.type === "visit" && o.tag === s && (i.progress[o.id] ?? 0) < 1 && (r[a] = { ...i, progress: { ...i.progress, [o.id]: 1 } }, n = !0);
    }
    n && t({ state: r });
  },
  notifyFlag: (s, r) => {
    const n = { ...e().state };
    let a = !1;
    for (const [i, c] of Object.entries(n)) {
      if (c.status !== "active") continue;
      const o = d().get(i);
      if (o)
        for (const u of o.objectives)
          u.type === "flag" && u.key === s && u.value === r && (c.progress[u.id] ?? 0) < 1 && (n[i] = { ...c, progress: { ...c.progress, [u.id]: 1 } }, a = !0);
    }
    a && t({ state: n });
  },
  recheck: (s) => {
    const r = d().get(s), n = e().state[s];
    if (!r || !n || n.status !== "active") return;
    const a = { ...n };
    for (const i of r.objectives)
      i.type === "collect" && (a.progress = { ...a.progress, [i.id]: Math.min(i.count, l.getState().countOf(i.itemId)) });
    t({ state: { ...e().state, [s]: a } });
  },
  statusOf: (s) => e().state[s]?.status ?? "available",
  progressOf: (s) => e().state[s] ?? null,
  active: () => Object.values(e().state).filter((s) => s.status === "active"),
  completed: () => Object.values(e().state).filter((s) => s.status === "completed"),
  isObjectiveComplete: (s, r, n) => {
    const a = r.progress[n.id] ?? 0;
    return n.type === "collect" ? l.getState().countOf(n.itemId) >= n.count : a >= T(n);
  },
  isAllObjectivesComplete: (s) => {
    const r = d().get(s), n = e().state[s];
    return !r || !n ? !1 : r.objectives.every((a) => e().isObjectiveComplete(r, n, a));
  },
  serialize: () => ({
    version: 1,
    state: Object.fromEntries(Object.entries(e().state).map(([s, r]) => [s, { ...r, progress: { ...r.progress } }]))
  }),
  hydrate: (s) => {
    if (!s || typeof s != "object") return;
    const r = {};
    if (s.state && typeof s.state == "object")
      for (const [n, a] of Object.entries(s.state))
        !a || typeof a != "object" || (r[n] = {
          questId: n,
          status: a.status ?? "available",
          progress: a.progress && typeof a.progress == "object" ? { ...a.progress } : {},
          ...typeof a.startedAt == "number" ? { startedAt: a.startedAt } : {},
          ...typeof a.completedAt == "number" ? { completedAt: a.completedAt } : {}
        });
    t({ state: r });
  }
}));
class P {
  tree;
  context;
  currentId;
  onCustomEffect;
  onOpenShop;
  constructor(e) {
    this.tree = e.tree, this.context = e.context ?? {}, this.currentId = e.tree.startId, this.onCustomEffect = e.onCustomEffect, this.onOpenShop = e.onOpenShop;
  }
  get current() {
    return this.currentId ? this.tree.nodes[this.currentId] ?? null : null;
  }
  isFinished() {
    return this.currentId == null;
  }
  visibleChoices() {
    const e = this.current;
    return e?.choices ? e.choices.filter((s) => !s.condition || this.checkCondition(s.condition)) : [];
  }
  advance() {
    const e = this.current;
    if (!e) return null;
    if (e.effects) for (const s of e.effects) this.applyEffect(s);
    return e.choices && e.choices.length > 0 ? e : (this.currentId = e.next ?? null, this.current);
  }
  choose(e) {
    const s = this.current;
    if (!s?.choices) return s;
    const n = this.visibleChoices()[e];
    if (!n) return s;
    if (n.effects) for (const a of n.effects) this.applyEffect(a);
    return this.currentId = n.next ?? null, this.current;
  }
  checkCondition(e) {
    switch (e.type) {
      case "hasItem":
        return l.getState().countOf(e.itemId) >= (e.count ?? 1);
      case "hasBells":
        return I.getState().bells >= e.amount;
      case "flagEquals":
        return this.context.flags?.[e.key] === e.value;
      case "friendshipAtLeast":
        return k.getState().scoreOf(e.npcId) >= e.amount;
      default:
        return !0;
    }
  }
  applyEffect(e) {
    switch (e.type) {
      case "giveItem": {
        const s = j().get(e.itemId);
        l.getState().add(e.itemId, e.count ?? 1) > 0 ? m("warn", "인벤토리가 가득 찼습니다") : m("reward", `${s?.name ?? e.itemId} +${e.count ?? 1}`);
        return;
      }
      case "takeItem": {
        l.getState().removeById(e.itemId, e.count ?? 1);
        return;
      }
      case "giveBells":
        I.getState().add(e.amount), m("reward", `+${e.amount} B`);
        return;
      case "takeBells":
        I.getState().spend(e.amount);
        return;
      case "setFlag":
        this.context.flags || (this.context.flags = {}), this.context.flags[e.key] = e.value, f.getState().notifyFlag(e.key, e.value);
        return;
      case "addFriendship": {
        const s = Math.floor(B.getState().totalMinutes / 1440);
        k.getState().add(e.npcId, e.amount, s);
        return;
      }
      case "startQuest":
        f.getState().start(e.questId);
        return;
      case "completeQuest":
        f.getState().complete(e.questId);
        return;
      case "openShop":
        this.onOpenShop?.(e.shopId);
        return;
      case "custom":
        this.onCustomEffect?.(e);
        return;
      default:
        return;
    }
  }
}
class Y {
  trees = /* @__PURE__ */ new Map();
  register(e) {
    this.trees.set(e.id, e);
  }
  registerAll(e) {
    for (const s of e) this.register(s);
  }
  get(e) {
    return this.trees.get(e);
  }
  require(e) {
    const s = this.trees.get(e);
    if (!s) throw new Error(`Unknown DialogTreeId: ${e}`);
    return s;
  }
  has(e) {
    return this.trees.has(e);
  }
  clear() {
    this.trees.clear();
  }
}
let E = null;
function W() {
  return E || (E = new Y()), E;
}
const U = w((t, e) => ({
  runner: null,
  node: null,
  npcId: void 0,
  start: (s, r) => {
    const n = W().get(s);
    if (!n) return !1;
    const a = new P({
      tree: n,
      ...r?.context ? { context: r.context } : {},
      ...r?.onCustomEffect ? { onCustomEffect: r.onCustomEffect } : {},
      ...r?.onOpenShop ? { onOpenShop: r.onOpenShop } : {}
    });
    return t({ runner: a, node: a.current, npcId: r?.context?.npcId }), r?.context?.npcId && f.getState().notifyTalk(r.context.npcId), !0;
  },
  advance: () => {
    const s = e().runner;
    if (!s) return;
    const r = s.advance();
    t({ node: r }), r || t({ runner: null, npcId: void 0 });
  },
  choose: (s) => {
    const r = e().runner;
    if (!r) return;
    const n = r.choose(s);
    t({ node: n }), n || t({ runner: null, npcId: void 0 });
  },
  close: () => t({ runner: null, node: null, npcId: void 0 })
}));
class z {
  conditions = /* @__PURE__ */ new Map();
  actions = /* @__PURE__ */ new Map();
  registerCondition(e, s) {
    this.conditions.set(e, s);
  }
  registerAction(e, s) {
    this.actions.set(e, s);
  }
  getCondition(e) {
    return this.conditions.get(e);
  }
  getAction(e) {
    return this.actions.get(e);
  }
}
function J() {
  const t = new z();
  return t.registerCondition("always", () => !0), t.registerCondition(
    "hasItem",
    (e) => l.getState().has(e.itemId, e.count ?? 1)
  ), t.registerCondition(
    "questStatus",
    (e) => f.getState().statusOf(e.questId) === e.status
  ), t.registerCondition(
    "eventActive",
    (e) => D.getState().isActive(e.eventId)
  ), t.registerCondition(
    "flagEquals",
    (e, s) => s.state.flags[e.key] === e.value
  ), t.registerCondition("custom", () => !1), t.registerAction("giveItem", (e) => {
    l.getState().add(e.itemId, e.count ?? 1);
  }), t.registerAction("removeItem", (e) => {
    l.getState().removeById(e.itemId, e.count ?? 1);
  }), t.registerAction("startQuest", (e) => {
    f.getState().start(e.questId);
  }), t.registerAction("completeQuest", (e) => {
    f.getState().complete(e.questId);
  }), t.registerAction("showDialog", (e) => {
    U.getState().start(
      e.dialogTreeId,
      e.npcId ? { context: { npcId: e.npcId } } : void 0
    );
  }), t.registerAction("toast", (e) => {
    m(e.kind ?? "info", e.text);
  }), t.registerAction("setFlag", (e, s) => {
    s.state.flags[e.key] = e.value;
  }), t.registerAction("notifyQuestFlag", (e) => {
    f.getState().notifyFlag(e.key, e.value);
  }), t.registerAction("emit", () => {
  }), t.registerAction("custom", () => {
  }), t;
}
let b = null;
function K() {
  return b || (b = J()), b;
}
const O = {
  executedAt: {},
  flags: {}
}, X = (t, e) => {
  if (t.type !== e.type) return !1;
  switch (t.type) {
    case "manual":
      return t.key === e.key;
    case "interaction":
      return t.targetId === e.targetId && (t.action === void 0 || t.action === e.action);
    case "enterArea":
      return t.areaId === e.areaId;
    case "itemCollected":
      return t.itemId === e.itemId;
    case "timeChanged":
      return t.hour === void 0 || t.hour === e.hour;
    case "calendarEventStarted":
      return t.eventId === e.eventId;
    case "questChanged":
      return t.questId === e.questId && (t.status === void 0 || t.status === e.status);
    case "custom":
      return t.key === e.key;
    default:
      return t;
  }
};
class oe {
  blueprints;
  registry;
  state;
  constructor(e = {}) {
    this.blueprints = e.blueprints ?? [], this.registry = e.registry ?? K(), this.state = e.state ?? {
      executedAt: { ...O.executedAt },
      flags: { ...O.flags }
    };
  }
  setBlueprints(e) {
    this.blueprints = [...e];
  }
  getBlueprints() {
    return [...this.blueprints];
  }
  async dispatch(e) {
    const s = [];
    for (const r of this.blueprints)
      r.enabled === !1 || !X(r.trigger, e) || s.push(await this.executeBlueprint(r, e));
    return s;
  }
  async executeBlueprint(e, s) {
    const r = Date.now(), n = this.state.executedAt[e.id], a = e.policy ?? {};
    if (a.run === "once" && n !== void 0)
      return { blueprintId: e.id, actionCount: 0, skipped: "already-executed" };
    if (a.cooldownMs !== void 0 && n !== void 0 && r - n < a.cooldownMs)
      return { blueprintId: e.id, actionCount: 0, skipped: "cooldown" };
    if (a.requiresServer)
      return { blueprintId: e.id, actionCount: 0, skipped: "requires-server" };
    const i = { blueprint: e, trigger: s, state: this.state, now: r };
    for (const o of e.conditions ?? []) {
      const u = this.registry.getCondition(o.type);
      if (!u || !await u(o, i))
        return { blueprintId: e.id, actionCount: 0, skipped: `condition:${o.type}` };
    }
    let c = 0;
    for (const o of e.actions) {
      const u = this.registry.getAction(o.type);
      u && (await u(o, i), c += 1);
    }
    return this.state.executedAt[e.id] = r, { blueprintId: e.id, actionCount: c };
  }
}
const ce = [
  {
    id: "world-ready-visible",
    name: "World Ready Visible",
    description: "Shows that gameplay event blueprints are running in the main world.",
    trigger: { type: "manual", key: "world.ready" },
    conditions: [{ type: "always" }],
    actions: [
      { type: "toast", kind: "success", text: "Gameplay Event Blueprint 실행됨" },
      { type: "setFlag", key: "gameplayReady", value: !0 }
    ],
    policy: { run: "once" },
    tags: ["starter", "visible"]
  },
  {
    id: "welcome-first-talk",
    name: "Welcome First Talk",
    description: "Starts the welcome quest the first time the player talks to the guide.",
    trigger: { type: "interaction", targetId: "npc:tommy", action: "talk" },
    conditions: [{ type: "questStatus", questId: "welcome", status: "available" }],
    actions: [
      { type: "startQuest", questId: "welcome" },
      { type: "showDialog", dialogTreeId: "npc.shopkeeper", npcId: "tommy" }
    ],
    policy: { run: "once" },
    tags: ["starter", "npc"]
  },
  {
    id: "meadow-entry-seed-gift",
    name: "Meadow Entry Seed Gift",
    description: "Gives starter seeds when the player first enters the meadow.",
    trigger: { type: "enterArea", areaId: "meadow" },
    conditions: [{ type: "always" }],
    actions: [
      { type: "giveItem", itemId: "seed-turnip", count: 3 },
      { type: "setFlag", key: "meadowSeedGift", value: !0 }
    ],
    policy: { run: "once" },
    tags: ["starter", "area"]
  },
  {
    id: "festival-quest-flag",
    name: "Festival Quest Flag",
    description: "Updates quest flag progress when a calendar festival starts.",
    trigger: { type: "calendarEventStarted", eventId: "spring-flower-fair" },
    actions: [{ type: "notifyQuestFlag", key: "festivalStarted", value: !0 }],
    policy: { run: "repeat", cooldownMs: 6e4 },
    tags: ["calendar", "quest"]
  }
], ue = [
  "manual",
  "interaction",
  "enterArea",
  "itemCollected",
  "timeChanged",
  "calendarEventStarted",
  "questChanged",
  "custom"
], le = [
  "always",
  "hasItem",
  "questStatus",
  "eventActive",
  "flagEquals",
  "custom"
], de = [
  "giveItem",
  "removeItem",
  "startQuest",
  "completeQuest",
  "showDialog",
  "toast",
  "setFlag",
  "notifyQuestFlag",
  "emit",
  "custom"
], fe = (t) => {
  switch (t) {
    case "manual":
      return { type: t, key: "manual.event" };
    case "interaction":
      return { type: t, targetId: "target.entity", action: "interact" };
    case "enterArea":
      return { type: t, areaId: "area.default" };
    case "itemCollected":
      return { type: t, itemId: "item.default" };
    case "timeChanged":
      return { type: t, hour: 9 };
    case "calendarEventStarted":
      return { type: t, eventId: "calendar.default" };
    case "questChanged":
      return { type: t, questId: "quest.default", status: "active" };
    case "custom":
      return { type: t, key: "custom.event" };
    default:
      return t;
  }
}, me = (t) => {
  switch (t) {
    case "always":
      return { type: t };
    case "hasItem":
      return { type: t, itemId: "item.default", count: 1 };
    case "questStatus":
      return { type: t, questId: "quest.default", status: "active" };
    case "eventActive":
      return { type: t, eventId: "calendar.default" };
    case "flagEquals":
      return { type: t, key: "flag.default", value: !0 };
    case "custom":
      return { type: t, key: "custom.condition" };
    default:
      return t;
  }
}, pe = (t) => {
  switch (t) {
    case "giveItem":
      return { type: t, itemId: "item.default", count: 1 };
    case "removeItem":
      return { type: t, itemId: "item.default", count: 1 };
    case "startQuest":
      return { type: t, questId: "quest.default" };
    case "completeQuest":
      return { type: t, questId: "quest.default" };
    case "showDialog":
      return { type: t, dialogTreeId: "dialog.default", npcId: "npc.default" };
    case "toast":
      return { type: t, kind: "success", text: "Event executed" };
    case "setFlag":
      return { type: t, key: "flag.default", value: !0 };
    case "notifyQuestFlag":
      return { type: t, key: "flag.default", value: !0 };
    case "emit":
      return { type: t, eventName: "gameplay.event" };
    case "custom":
      return { type: t, key: "custom.action" };
    default:
      return t;
  }
}, he = ({
  id: t,
  name: e,
  triggerKey: s,
  message: r
}) => {
  const n = t.trim() || `event-${Date.now()}`, a = n.trim() || "manualEvent";
  return {
    id: n,
    name: e.trim() || "Manual Event",
    trigger: { type: "manual", key: s.trim() || "manual.event" },
    conditions: [{ type: "always" }],
    actions: [
      { type: "toast", kind: "success", text: r.trim() || "Event executed" },
      { type: "setFlag", key: a, value: !0 }
    ],
    policy: { run: "repeat" },
    tags: ["editor", "manual"]
  };
}, ge = ({
  id: t,
  name: e,
  npcId: s = "tommy",
  questId: r = "welcome",
  dialogTreeId: n = "npc.shopkeeper"
} = {}) => {
  const a = s.trim() || "tommy", i = r.trim() || "welcome";
  return {
    id: t?.trim() || `npc-talk-${a}-start-${i}`,
    name: e?.trim() || `NPC Talk Starts Quest (${a})`,
    trigger: { type: "interaction", targetId: `npc:${a}`, action: "talk" },
    conditions: [{ type: "questStatus", questId: i, status: "available" }],
    actions: [
      { type: "startQuest", questId: i },
      { type: "showDialog", dialogTreeId: n.trim() || "npc.shopkeeper", npcId: a },
      { type: "setFlag", key: `questStarted:${i}`, value: !0 }
    ],
    policy: { run: "once" },
    tags: ["editor", "preset", "npc", "quest"]
  };
}, h = 1;
function Z(t) {
  const e = new Set(F), s = {};
  for (const r of t.getBindings())
    if (e.has(r.key))
      try {
        s[r.key] = r.serialize();
      } catch {
        s[r.key] = null;
      }
  return s;
}
function ye(t, e, s) {
  const r = {
    schemaVersion: h,
    id: s.worldId ?? `${s.id}-world`,
    name: s.worldName ?? s.name,
    version: s.version,
    domains: Z(t)
  }, n = {
    schemaVersion: h,
    version: s.assetVersion ?? s.version,
    assets: e
  };
  return {
    schemaVersion: h,
    id: s.id,
    name: s.name,
    version: s.version,
    world: r,
    assets: n,
    blueprints: {
      schemaVersion: h,
      version: s.version,
      blueprints: [],
      npcBehavior: s.npcBehaviorBlueprints ?? [],
      agentBehavior: s.agentBehaviorBlueprints ?? []
    },
    gameplay: {
      schemaVersion: h,
      version: s.version,
      items: [],
      quests: [],
      dialogs: [],
      recipes: [],
      events: s.gameplayEvents ?? []
    }
  };
}
const $ = (t) => !!t && typeof t == "object" && !Array.isArray(t), ee = (t) => $(t) ? typeof t.id == "string" && typeof t.name == "string" && typeof t.kind == "string" : !1;
function g(t, e, s) {
  s !== h && t.push(`${e}.schemaVersion must be ${h}`);
}
function te(t) {
  const e = [];
  return g(e, "manifest", t.schemaVersion), t.id || e.push("manifest.id is required"), t.name || e.push("manifest.name is required"), t.version || e.push("manifest.version is required"), t.world || e.push("manifest.world is required"), t.assets || e.push("manifest.assets is required"), { ok: e.length === 0, errors: e };
}
function G(t) {
  const e = [];
  if (g(e, "bundle", t.schemaVersion), g(e, "bundle.world", t.world?.schemaVersion), g(e, "bundle.assets", t.assets?.schemaVersion), t.blueprints && g(e, "bundle.blueprints", t.blueprints.schemaVersion), t.gameplay && g(e, "bundle.gameplay", t.gameplay.schemaVersion), t.id || e.push("bundle.id is required"), t.name || e.push("bundle.name is required"), t.version || e.push("bundle.version is required"), t.world?.id || e.push("bundle.world.id is required"), t.world?.version || e.push("bundle.world.version is required"), t.assets?.version || e.push("bundle.assets.version is required"), t.gameplay?.events && !Array.isArray(t.gameplay.events) && e.push("bundle.gameplay.events must be an array"), t.blueprints?.npcBehavior && !Array.isArray(t.blueprints.npcBehavior) && e.push("bundle.blueprints.npcBehavior must be an array"), t.blueprints?.agentBehavior && !Array.isArray(t.blueprints.agentBehavior) && e.push("bundle.blueprints.agentBehavior must be an array"), !Array.isArray(t.assets?.assets))
    e.push("bundle.assets.assets must be an array");
  else
    for (const s of t.assets.assets)
      if (!ee(s)) {
        e.push("bundle.assets.assets contains an invalid asset record");
        break;
      }
  return { ok: e.length === 0, errors: e };
}
const y = (t, e) => {
  const s = typeof e == "string" ? e : e.url ?? `${encodeURIComponent(e.id)}.json`;
  return /^https?:\/\//.test(s) || s.startsWith("/") || !t ? s : `${t.replace(/\/$/, "")}/${s.replace(/^\//, "")}`;
}, v = async (t, e) => {
  const s = await t(e);
  if (!s.ok)
    throw new Error(`Failed to load ${e}: ${s.status}`);
  return await s.json();
};
async function se(t, e = fetch, s = "") {
  const r = te(t);
  if (!r.ok)
    throw new Error(`Invalid content manifest ${t.id}: ${r.errors.join(", ")}`);
  const n = {
    schemaVersion: t.schemaVersion,
    id: t.id,
    name: t.name,
    version: t.version,
    world: await v(e, y(s, t.world)),
    assets: await v(e, y(s, t.assets))
  };
  t.blueprints && (n.blueprints = await v(e, y(s, t.blueprints))), t.gameplay && (n.gameplay = await v(e, y(s, t.gameplay)));
  const a = G(n);
  if (!a.ok)
    throw new Error(`Invalid content bundle ${t.id}: ${a.errors.join(", ")}`);
  return n;
}
class ve {
  constructor(e, s = fetch) {
    this.baseUrl = e, this.fetcher = s;
  }
  async loadBundle(e) {
    const s = `${this.baseUrl.replace(/\/$/, "")}/bundles/${encodeURIComponent(e)}`, r = await this.fetcher(s);
    if (!r.ok)
      throw new Error(`Failed to load content bundle ${e}: ${r.status}`);
    const n = await r.json(), a = $(n.world) && "domains" in n.world ? n : await se(n, this.fetcher, s), i = G(a);
    if (!i.ok)
      throw new Error(`Invalid content bundle ${e}: ${i.errors.join(", ")}`);
    return a;
  }
}
export {
  h as C,
  P as D,
  V as F,
  oe as G,
  ve as H,
  ce as S,
  te as a,
  z as b,
  ye as c,
  J as d,
  de as e,
  le as f,
  K as g,
  ue as h,
  pe as i,
  me as j,
  fe as k,
  se as l,
  he as m,
  ge as n,
  f as o,
  d as p,
  I as q,
  k as r,
  W as s,
  Q as t,
  U as u,
  G as v
};
