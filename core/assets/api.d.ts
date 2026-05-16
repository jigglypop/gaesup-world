import type { AssetKind, AssetQuery, AssetRecord, AssetSlot, AssetSource } from './types';
type FetchLike = typeof fetch;
export declare class HttpAssetSource implements AssetSource {
    private readonly baseUrl;
    private readonly fetcher;
    constructor(baseUrl?: string, fetcher?: FetchLike);
    listAssets(query?: AssetQuery): Promise<AssetRecord[]>;
    getAsset(id: string): Promise<AssetRecord | undefined>;
    listByKind(kind: AssetKind): Promise<AssetRecord[]>;
    listBySlot(slot: AssetSlot): Promise<AssetRecord[]>;
}
export {};
