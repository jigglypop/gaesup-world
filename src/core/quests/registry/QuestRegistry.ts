import type { QuestDef, QuestId } from '../types';

class QuestRegistry {
  private defs = new Map<QuestId, QuestDef>();

  register(def: QuestDef): void {
    if (this.defs.has(def.id)) return;
    this.defs.set(def.id, def);
  }

  registerAll(defs: QuestDef[]): void {
    for (const d of defs) this.register(d);
  }

  get(id: QuestId): QuestDef | undefined { return this.defs.get(id); }

  require(id: QuestId): QuestDef {
    const v = this.defs.get(id);
    if (!v) throw new Error(`Unknown QuestId: ${id}`);
    return v;
  }

  all(): QuestDef[] { return Array.from(this.defs.values()); }
  has(id: QuestId): boolean { return this.defs.has(id); }
  clear(): void { this.defs.clear(); }
}

let _instance: QuestRegistry | null = null;
export function getQuestRegistry(): QuestRegistry {
  if (!_instance) _instance = new QuestRegistry();
  return _instance;
}
export type { QuestRegistry };
