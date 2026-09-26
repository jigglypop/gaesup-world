import { DefinitionRegistry } from '../../utils/definitionRegistry';
import type { CropDef, CropId } from '../types';

class CropRegistry extends DefinitionRegistry<CropId, CropDef> {
  constructor() { super('CropId'); }

  bySeedItemId(seedItemId: string): CropDef | undefined {
    for (const d of this.defs.values()) if (d.seedItemId === seedItemId) return d;
    return undefined;
  }
}

let _instance: CropRegistry | null = null;
export function getCropRegistry(): CropRegistry {
  if (!_instance) _instance = new CropRegistry();
  return _instance;
}
export type { CropRegistry };
