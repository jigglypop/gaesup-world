import { createCatalogPlugin } from '../../../../src/core/catalog';
import { assertValidGaesupPlugin } from '../../../../src/core/plugins';
import { createGaesupRuntime } from '../../../../src/core/runtime';
import packageJson from '../package.json';
import {
  EXAMPLE_COZY_LIFE_CATALOG_EXTENSION_ID,
  EXAMPLE_COZY_LIFE_EDITOR_EXTENSION_ID,
  createExampleCozyLifePackagePlugin,
} from '..';

describe('example cozy-life plugin package', () => {
  it('keeps gaesup-world as a peer dependency', () => {
    expect(packageJson.peerDependencies).toEqual({ 'gaesup-world': '^1.0.0' });
    expect('dependencies' in packageJson).toBe(false);
  });

  it('passes public plugin validation utilities', async () => {
    const result = await assertValidGaesupPlugin(createExampleCozyLifePackagePlugin(), {
      dependencies: [createCatalogPlugin()],
      expectedRuntime: ['both', 'client'],
    });

    expect(result.manifest?.dependencies).toEqual({ 'gaesup.catalog': '^0.1.0' });
    expect(result.ok).toBe(true);
  });

  it('can be registered by a runtime like an external package', async () => {
    const runtime = createGaesupRuntime({
      plugins: [
        createCatalogPlugin(),
        createExampleCozyLifePackagePlugin(),
      ],
    });

    await runtime.setup();

    expect(runtime.plugins.context.catalog.has(EXAMPLE_COZY_LIFE_CATALOG_EXTENSION_ID)).toBe(true);
    expect(runtime.plugins.context.editor.has(EXAMPLE_COZY_LIFE_EDITOR_EXTENSION_ID)).toBe(true);

    await runtime.dispose();

    expect(runtime.plugins.context.catalog.has(EXAMPLE_COZY_LIFE_CATALOG_EXTENSION_ID)).toBe(false);
    expect(runtime.plugins.context.editor.has(EXAMPLE_COZY_LIFE_EDITOR_EXTENSION_ID)).toBe(false);
  });
});
