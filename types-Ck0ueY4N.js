class r {
  session = null;
  handlers = /* @__PURE__ */ new Map();
  async connect(e) {
    this.session = e, this.emit("connected", e);
  }
  async disconnect() {
    if (!this.session) return;
    const e = this.session;
    this.session = null, this.emit("disconnected", e);
  }
  async send(e) {
    this.emit("message", e);
  }
  on(e, s) {
    const t = this.handlers.get(e) ?? /* @__PURE__ */ new Set();
    return t.add(s), this.handlers.set(e, t), () => {
      t.delete(s);
    };
  }
  emit(e, s) {
    for (const t of this.handlers.get(e) ?? [])
      t(s);
  }
}
function d(n, e, s = {}) {
  return {
    version: s.version ?? 1,
    type: n,
    sentAt: Date.now(),
    payload: e,
    ...s.roomId ? { roomId: s.roomId } : {},
    ...s.playerId ? { playerId: s.playerId } : {},
    ...s.traceId ? { traceId: s.traceId } : {}
  };
}
export {
  r as M,
  d as c
};
