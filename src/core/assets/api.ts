import type { AssetKind, AssetQuery, AssetRecord, AssetSlot, AssetSource } from './types';

type FetchLike = typeof fetch;

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
    if (!entry || typeof entry !== 'object') return false;
    const candidate = entry as Partial<AssetRecord>;
    return typeof candidate.id === 'string' &&
      typeof candidate.name === 'string' &&
      typeof candidate.kind === 'string';
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
