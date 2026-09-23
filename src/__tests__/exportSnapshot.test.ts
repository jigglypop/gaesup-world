import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

const ENTRY_LOADERS: Record<string, () => Promise<object>> = {
  '.': () => import('gaesup-world'),
  './admin': () => import('gaesup-world/admin'),
  './assets': () => import('gaesup-world/assets'),
  './blueprints': () => import('gaesup-world/blueprints'),
  './blueprints/editor': () => import('gaesup-world/blueprints/editor'),
  './building': () => import('gaesup-world/building'),
  './editor': () => import('gaesup-world/editor'),
  './gameplay': () => import('gaesup-world/gameplay'),
  './navigation': () => import('gaesup-world/navigation'),
  './network': () => import('gaesup-world/network'),
  './next': () => import('gaesup-world/next'),
  './plugins': () => import('gaesup-world/plugins'),
  './postprocessing': () => import('gaesup-world/postprocessing'),
  './runtime': () => import('gaesup-world/runtime'),
  './server-contracts': () => import('gaesup-world/server-contracts'),
};

describe('runtime export snapshot', () => {
  test('모든 JS 서브패스가 스냅샷 대상에 포함된다', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>;
    };
    const jsEntries = Object.keys(packageJson.exports).filter((entry) => !entry.endsWith('.css'));
    expect(Object.keys(ENTRY_LOADERS).sort()).toEqual(jsEntries.sort());
  });

  test.each(Object.keys(ENTRY_LOADERS))('%s export 목록', async (entry) => {
    const loader = ENTRY_LOADERS[entry];
    if (!loader) throw new Error(`Missing loader for ${entry}`);
    const exported = Object.keys(await loader()).filter((name) => name !== 'default').sort();
    expect(exported).toMatchSnapshot();
  });
});
