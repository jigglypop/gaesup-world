import { CONTENT_SCHEMA_VERSION, createContentBundleFromSaveSystem } from '..';
import {
  loadContentBundleFromManifest,
  validateContentBundle,
  validateContentBundleManifest,
} from '../loader';
import type { ContentBundleManifest } from '../types';

describe('content bundle manifests', () => {
  it('exports content bundles with schema versions on every manifest layer', () => {
    const bundle = createContentBundleFromSaveSystem(
      {
        getBindings: () => [
          {
            key: 'inventory',
            serialize: () => ({ items: [] }),
            hydrate: () => undefined,
          },
        ],
      },
      [{ id: 'chair', name: 'Chair', kind: 'object3d' }],
      { id: 'cozy-pack', name: 'Cozy Pack', version: '1.0.0' },
    );

    expect(bundle.schemaVersion).toBe(CONTENT_SCHEMA_VERSION);
    expect(bundle.world.schemaVersion).toBe(CONTENT_SCHEMA_VERSION);
    expect(bundle.assets.schemaVersion).toBe(CONTENT_SCHEMA_VERSION);
    expect(bundle.blueprints?.schemaVersion).toBe(CONTENT_SCHEMA_VERSION);
    expect(bundle.gameplay?.schemaVersion).toBe(CONTENT_SCHEMA_VERSION);
    expect(validateContentBundle(bundle).ok).toBe(true);
  });

  it('validates content bundle manifests before loading referenced files', () => {
    const manifest = {
      id: 'legacy',
      name: 'Legacy',
      version: '1.0.0',
      world: 'world.json',
      assets: 'assets.json',
    } as unknown as ContentBundleManifest;

    const validation = validateContentBundleManifest(manifest);

    expect(validation.ok).toBe(false);
    expect(validation.errors).toContain('manifest.schemaVersion must be 1');
  });

  it('loads a schema-versioned bundle manifest and referenced manifests', async () => {
    const manifest: ContentBundleManifest = {
      schemaVersion: CONTENT_SCHEMA_VERSION,
      id: 'starter',
      name: 'Starter',
      version: '1.0.0',
      world: 'world.json',
      assets: 'assets.json',
    };
    const responses: Record<string, unknown> = {
      'https://cdn.example/bundles/starter/world.json': {
        schemaVersion: CONTENT_SCHEMA_VERSION,
        id: 'starter-world',
        name: 'Starter World',
        version: '1.0.0',
        domains: {},
      },
      'https://cdn.example/bundles/starter/assets.json': {
        schemaVersion: CONTENT_SCHEMA_VERSION,
        version: '1.0.0',
        assets: [{ id: 'crate', name: 'Crate', kind: 'object3d' }],
      },
    };
    const fetcher = jest.fn(async (input: RequestInfo | URL) => ({
      ok: true,
      status: 200,
      json: async () => responses[String(input)],
    } as Response)) as unknown as typeof fetch;

    const bundle = await loadContentBundleFromManifest(
      manifest,
      fetcher,
      'https://cdn.example/bundles/starter',
    );

    expect(bundle.id).toBe('starter');
    expect(bundle.world.id).toBe('starter-world');
    expect(validateContentBundle(bundle).ok).toBe(true);
  });
});
