function v(e) {
  return `${e}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function R(e) {
  return {
    version: e.version ?? 1,
    commandId: e.commandId ?? v("cmd"),
    domain: e.domain,
    action: e.action,
    actorId: e.actorId,
    submittedAt: e.submittedAt ?? Date.now(),
    payload: e.payload,
    ...e.targetId ? { targetId: e.targetId } : {},
    ...e.clientSequence !== void 0 ? { clientSequence: e.clientSequence } : {},
    ...e.expectedRevision !== void 0 ? { expectedRevision: e.expectedRevision } : {},
    ...e.traceId ? { traceId: e.traceId } : {}
  };
}
function u(e) {
  return {
    version: e.version ?? 1,
    eventId: e.eventId ?? v("evt"),
    domain: e.domain,
    type: e.type,
    occurredAt: e.occurredAt ?? Date.now(),
    payload: e.payload,
    ...e.commandId ? { commandId: e.commandId } : {},
    ...e.actorId ? { actorId: e.actorId } : {},
    ...e.serverRevision !== void 0 ? { serverRevision: e.serverRevision } : {},
    ...e.traceId ? { traceId: e.traceId } : {}
  };
}
function s(e) {
  return {
    version: e.version ?? 1,
    deltaId: e.deltaId ?? v("delta"),
    domain: e.domain,
    path: e.path,
    op: e.op,
    serverRevision: e.serverRevision,
    changedAt: e.changedAt ?? Date.now(),
    ...e.entityId ? { entityId: e.entityId } : {},
    ...e.commandId ? { commandId: e.commandId } : {},
    ..."value" in e ? { value: e.value } : {}
  };
}
function y(e) {
  return {
    version: e.version ?? 1,
    ackId: e.ackId ?? v("ack"),
    snapshotId: e.snapshotId,
    kind: e.kind,
    acceptedAt: e.acceptedAt ?? Date.now(),
    ...e.worldId ? { worldId: e.worldId } : {},
    ...e.playerId ? { playerId: e.playerId } : {},
    ...e.roomId ? { roomId: e.roomId } : {},
    ...e.serverRevision !== void 0 ? { serverRevision: e.serverRevision } : {},
    ...e.domains ? { domains: e.domains } : {}
  };
}
function n(e) {
  return `${e.domain}:${e.action ?? "*"}`;
}
function l(e, r) {
  return `${e}-${r.commandId}`;
}
function h(e, r = {}) {
  return {
    accepted: !0,
    command: e,
    events: r.events ?? [],
    deltas: r.deltas ?? [],
    ...r.serverRevision !== void 0 ? { serverRevision: r.serverRevision } : {}
  };
}
function m(e, r, a = {}) {
  const t = u({
    eventId: a.eventId ?? `rejected-${e.commandId}`,
    domain: e.domain,
    type: "command.rejected",
    occurredAt: a.occurredAt ?? Date.now(),
    commandId: e.commandId,
    actorId: e.actorId,
    payload: {
      action: e.action,
      reason: r
    },
    ...a.serverRevision !== void 0 ? { serverRevision: a.serverRevision } : {},
    ...e.traceId ? { traceId: e.traceId } : {}
  });
  return {
    accepted: !1,
    command: e,
    reason: r,
    events: [t],
    deltas: [],
    ...a.serverRevision !== void 0 ? { serverRevision: a.serverRevision } : {}
  };
}
function f(e = {}) {
  const r = /* @__PURE__ */ new Map(), a = e.now ?? Date.now, t = e.createId ?? l, i = { now: a, createId: t };
  return {
    register: (d, c) => {
      const I = n(d);
      return r.set(I, c), () => {
        r.delete(I);
      };
    },
    handle: async (d) => {
      const c = r.get(n({ domain: d.domain, action: d.action })) ?? r.get(n({ domain: d.domain, action: "*" }));
      return c ? c(d, i) : m(
        d,
        `No authority handler registered for ${d.domain}:${d.action}.`,
        {
          eventId: t("rejected", d),
          occurredAt: a()
        }
      );
    },
    has: (d) => r.has(n(d)),
    clear: () => {
      r.clear();
    }
  };
}
export {
  f as a,
  m as b,
  h as c,
  R as d,
  u as e,
  y as f,
  s as g
};
