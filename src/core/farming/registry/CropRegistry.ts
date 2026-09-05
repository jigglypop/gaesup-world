import type { CropDef, CropId } from '../types';

class CropRegistry {
  private defs = new Map<CropId, CropDef>();

  register(def: CropDef): void {
    if (this.defs.has(def.id)) return;
    this.defs.set(def.id, def);
  }

  registerAll(defs: CropDef[]): void {
    for (const d of defs) this.register(d);
  }

  get(id: CropId): CropDef | undefined { return this.defs.get(id); }

  require(id: CropId): CropDef {
    const v = this.defs.get(id);
    if (!v) throw new Error(`Unknown CropId: ${id}`);
    return v;
  }

  bySeedItemId(seedItemId: string): CropDef | undefined {
    for (const d of this.defs.values()) if (d.seedItemId === seedItemId) return d;
    return undefined;
  }

  all(): CropDef[] { return Array.from(this.defs.values()); }
  has(id: CropId): boolean { return this.defs.has(id); }
  clear(): void { this.defs.clear(); }
}

let _instance: CropRegistry | null = null;
export function getCropRegistry(): CropRegistry {
  if (!_instance) _instance = new CropRegistry();
  return _instance;
}
export type { CropRegistry };
