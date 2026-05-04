import { defineGaesupPlugin, type GaesupPlugin } from '../../../src/plugins';

export const EXAMPLE_COZY_LIFE_PACKAGE_PLUGIN_ID = '@gaesup-example/plugin-cozy-life';
export const EXAMPLE_COZY_LIFE_CATALOG_EXTENSION_ID = 'example.cozy-life.catalog';
export const EXAMPLE_COZY_LIFE_EDITOR_EXTENSION_ID = 'example.cozy-life.editor';

export function createExampleCozyLifePackagePlugin(): GaesupPlugin {
  return defineGaesupPlugin({
    id: EXAMPLE_COZY_LIFE_PACKAGE_PLUGIN_ID,
    name: 'Example Cozy Life Package',
    version: '0.1.0',
    runtime: 'both',
    capabilities: ['catalog:cozy-life-package', 'editor:cozy-life-package'],
    dependencies: [{ id: 'gaesup.catalog', version: '^0.1.0' }],
    setup(ctx) {
      ctx.catalog.register(EXAMPLE_COZY_LIFE_CATALOG_EXTENSION_ID, {
        schemaVersion: 1,
        packageName: EXAMPLE_COZY_LIFE_PACKAGE_PLUGIN_ID,
        itemTypes: ['crop', 'fish', 'bug', 'furniture'],
        starterItems: ['seed-turnip', 'rod', 'wood'],
      }, EXAMPLE_COZY_LIFE_PACKAGE_PLUGIN_ID);
      ctx.editor.register(EXAMPLE_COZY_LIFE_EDITOR_EXTENSION_ID, {
        packageName: EXAMPLE_COZY_LIFE_PACKAGE_PLUGIN_ID,
        panels: ['daily-life', 'catalog-pack'],
      }, EXAMPLE_COZY_LIFE_PACKAGE_PLUGIN_ID);
      ctx.events.emit('plugin:example-package-ready', {
        pluginId: EXAMPLE_COZY_LIFE_PACKAGE_PLUGIN_ID,
      });
    },
    dispose(ctx) {
      ctx.catalog.remove(EXAMPLE_COZY_LIFE_CATALOG_EXTENSION_ID);
      ctx.editor.remove(EXAMPLE_COZY_LIFE_EDITOR_EXTENSION_ID);
    },
  });
}

export default createExampleCozyLifePackagePlugin;
