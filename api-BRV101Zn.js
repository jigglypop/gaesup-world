const i = (e, t) => {
  const s = new URLSearchParams();
  t?.kind && s.set("kind", t.kind), t?.slot && s.set("slot", t.slot), t?.tag && s.set("tag", t.tag);
  const r = s.toString();
  return `${e.replace(/\/$/, "")}/assets${r ? `?${r}` : ""}`;
}, a = (e) => Array.isArray(e) ? e.filter((t) => {
  if (!t || typeof t != "object") return !1;
  const s = t;
  return typeof s.id == "string" && typeof s.name == "string" && typeof s.kind == "string";
}) : [];
class n {
  baseUrl;
  fetcher;
  constructor(t = "/api", s = fetch) {
    this.baseUrl = t, this.fetcher = s;
  }
  async listAssets(t) {
    const s = await this.fetcher(i(this.baseUrl, t));
    if (!s.ok)
      throw new Error(`Failed to load assets: ${s.status}`);
    return a(await s.json());
  }
  async getAsset(t) {
    const s = await this.fetcher(`${this.baseUrl.replace(/\/$/, "")}/assets/${encodeURIComponent(t)}`);
    if (s.status === 404) return;
    if (!s.ok)
      throw new Error(`Failed to load asset ${t}: ${s.status}`);
    const r = await s.json();
    return a([r])[0];
  }
  listByKind(t) {
    return this.listAssets({ kind: t });
  }
  listBySlot(t) {
    return this.listAssets({ slot: t });
  }
}
export {
  n as H
};
