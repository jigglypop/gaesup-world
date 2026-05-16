import type { CropDef, CropId } from '../types';
declare class CropRegistry {
    private defs;
    register(def: CropDef): void;
    registerAll(defs: CropDef[]): void;
    get(id: CropId): CropDef | undefined;
    require(id: CropId): CropDef;
    bySeedItemId(seedItemId: string): CropDef | undefined;
    all(): CropDef[];
    has(id: CropId): boolean;
    clear(): void;
}
export declare function getCropRegistry(): CropRegistry;
export type { CropRegistry };
