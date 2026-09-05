import type { AssetKind, AssetQuery, AssetRecord, AssetSlot, AssetSource } from './types';

type FetchLike = typeof fetch;

const ASSET_KINDS: ReadonlySet<string> = new Set<AssetKind>(['characterPart', 'weapon', 'material', 'tile', 'wall', 'object3d']);
const ASSET_SLOTS: ReadonlySet<string> = new Set<AssetSlot>(['body', 'hair', 'hat', 'top', 'bottom', 'shoes', 'face', 'weapon', 'shield', 'accessory', 'glasses']);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const buildAssetUrl = (baseUrl: string, query?: AssetQuery): string => {
  const params = new URLSearchParams();
  if (query?.kind) params.set('kind', query.kind);
  if (query?.slot) params.set('slot', query.slot);
  if (query?.tag) params.set('tag', query.tag);
  const queryString = params.toString();
  return `${baseUrl.replace(/\/$/, '')}/assets${queryString ? `?${queryString}` : ''}`;
};

const assertAssetArray = (value: unknown): AssetRecord[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is AssetRecord => {
    if (!isRecord(entry)) return false;
    return typeof entry['id'] === 'string' && entry['id'].trim().length > 0 &&
      typeof entry['name'] === 'string' &&
      typeof entry['kind'] === 'string' && ASSET_KINDS.has(entry['kind']) &&
      (entry['slot'] === undefined || (typeof entry['slot'] === 'string' && ASSET_SLOTS.has(entry['slot']))) &&
      ['url', 'thumbnailUrl', 'previewUrl'].every((key) => entry[key] === undefined || typeof entry[key] === 'string') &&
      (entry['tags'] === undefined || (Array.isArray(entry['tags']) && entry['tags'].every((tag: unknown) => typeof tag === 'string'))) &&
      (entry['colors'] === undefined || (isRecord(entry['colors']) && Object.values(entry['colors']).every((color) => typeof color === 'string'))) &&
      (entry['metadata'] === undefined || isRecord(entry['metadata']));
  });
};

export class HttpAssetSource implements AssetSource {
  private readonly baseUrl: string;
  private readonly fetcher: FetchLike;

  constructor(baseUrl: string = '/api', fetcher: FetchLike = fetch) {
    this.baseUrl = baseUrl;
    this.fetcher = fetcher;
  }

  async listAssets(query?: AssetQuery): Promise<AssetRecord[]> {
    const response = await this.fetcher(buildAssetUrl(this.baseUrl, query));
    if (!response.ok) {
      throw new Error(`Failed to load assets: ${response.status}`);
    }
    return assertAssetArray(await response.json());
  }

  async getAsset(id: string): Promise<AssetRecord | undefined> {
    const response = await this.fetcher(`${this.baseUrl.replace(/\/$/, '')}/assets/${encodeURIComponent(id)}`);
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(`Failed to load asset ${id}: ${response.status}`);
    }
    const value = await response.json();
    return assertAssetArray([value])[0];
  }

  listByKind(kind: AssetKind): Promise<AssetRecord[]> {
    return this.listAssets({ kind });
  }

  listBySlot(slot: AssetSlot): Promise<AssetRecord[]> {
    return this.listAssets({ slot });
  }
}
