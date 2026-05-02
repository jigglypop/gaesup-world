import type { AssetRecord } from '../assets';
import type {
  AssetManifest,
  BlueprintManifest,
  ContentBundle,
  ContentBundleManifest,
  ContentBundleSource,
  ContentBundleValidation,
  GameplayManifest,
  ManifestResource,
  WorldManifest,
} from './types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isAssetRecord = (value: unknown): value is AssetRecord => {
  if (!isObject(value)) return false;
  return typeof value['id'] === 'string' &&
    typeof value['name'] === 'string' &&
    typeof value['kind'] === 'string';
};

export function validateContentBundle(bundle: ContentBundle): ContentBundleValidation {
  const errors: string[] = [];
  if (!bundle.id) errors.push('bundle.id is required');
  if (!bundle.version) errors.push('bundle.version is required');
  if (!bundle.world?.id) errors.push('bundle.world.id is required');
  if (!bundle.world?.version) errors.push('bundle.world.version is required');
  if (!bundle.assets?.version) errors.push('bundle.assets.version is required');
  if (bundle.gameplay?.events && !Array.isArray(bundle.gameplay.events)) {
    errors.push('bundle.gameplay.events must be an array');
  }
  if (bundle.blueprints?.npcBehavior && !Array.isArray(bundle.blueprints.npcBehavior)) {
    errors.push('bundle.blueprints.npcBehavior must be an array');
  }
  if (bundle.blueprints?.agentBehavior && !Array.isArray(bundle.blueprints.agentBehavior)) {
    errors.push('bundle.blueprints.agentBehavior must be an array');
  }
  if (!Array.isArray(bundle.assets?.assets)) {
    errors.push('bundle.assets.assets must be an array');
  } else {
    for (const asset of bundle.assets.assets) {
      if (!isAssetRecord(asset)) {
        errors.push('bundle.assets.assets contains an invalid asset record');
        break;
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

const resolveManifestUrl = (baseUrl: string, ref: ManifestResource | string): string => {
  const url = typeof ref === 'string'
    ? ref
    : ref.url ?? `${encodeURIComponent(ref.id)}.json`;
  if (/^https?:\/\//.test(url) || url.startsWith('/')) return url;
  if (!baseUrl) return url;
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const loadJson = async <T>(fetcher: typeof fetch, url: string): Promise<T> => {
  const response = await fetcher(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return await response.json() as T;
};

export async function loadContentBundleFromManifest(
  manifest: ContentBundleManifest,
  fetcher: typeof fetch = fetch,
  baseUrl = '',
): Promise<ContentBundle> {
  const bundle: ContentBundle = {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    world: await loadJson<WorldManifest>(fetcher, resolveManifestUrl(baseUrl, manifest.world)),
    assets: await loadJson<AssetManifest>(fetcher, resolveManifestUrl(baseUrl, manifest.assets)),
  };

  if (manifest.blueprints) {
    bundle.blueprints = await loadJson<BlueprintManifest>(fetcher, resolveManifestUrl(baseUrl, manifest.blueprints));
  }
  if (manifest.gameplay) {
    bundle.gameplay = await loadJson<GameplayManifest>(fetcher, resolveManifestUrl(baseUrl, manifest.gameplay));
  }

  const validation = validateContentBundle(bundle);
  if (!validation.ok) {
    throw new Error(`Invalid content bundle ${manifest.id}: ${validation.errors.join(', ')}`);
  }
  return bundle;
}

export class HttpContentBundleSource implements ContentBundleSource {
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async loadBundle(id: string): Promise<ContentBundle> {
    const root = `${this.baseUrl.replace(/\/$/, '')}/bundles/${encodeURIComponent(id)}`;
    const response = await this.fetcher(root);
    if (!response.ok) {
      throw new Error(`Failed to load content bundle ${id}: ${response.status}`);
    }
    const data = await response.json() as ContentBundle | ContentBundleManifest;
    const bundle = isObject(data.world) && 'domains' in data.world
      ? data as ContentBundle
      : await loadContentBundleFromManifest(data as ContentBundleManifest, this.fetcher, root);
    const validation = validateContentBundle(bundle);
    if (!validation.ok) {
      throw new Error(`Invalid content bundle ${id}: ${validation.errors.join(', ')}`);
    }
    return bundle;
  }
}
