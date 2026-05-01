import * as fs from 'fs';
import * as path from 'path';

type PackageJson = {
  exports: Record<string, string | {
    import?: { types?: string; default?: string };
    require?: { types?: string; default?: string };
  }>;
};

const ROOT = path.resolve(__dirname, '../..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const COPY_CJS_TYPES = path.join(ROOT, 'scripts/copy-cjs-types.cjs');

function readPackageJson(): PackageJson {
  return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8')) as PackageJson;
}

describe('package export map', () => {
  test('every JS subpath export has matching import and require type declarations', () => {
    const pkg = readPackageJson();

    for (const [subpath, entry] of Object.entries(pkg.exports)) {
      if (typeof entry === 'string') continue;

      expect(entry.import?.types).toBeDefined();
      expect(entry.import?.default).toBeDefined();
      expect(entry.require?.types).toBeDefined();
      expect(entry.require?.default).toBeDefined();

      expect(entry.import?.types).toMatch(/\.d\.ts$/);
      expect(entry.require?.types).toMatch(/\.d\.cts$/);
      expect(entry.import?.default).toMatch(/\.js$/);
      expect(entry.require?.default).toMatch(/\.cjs$/);
      expect(subpath).toMatch(/^\.($|\/)/);
    }
  });

  test('CJS declaration copy script covers every require type target', () => {
    const pkg = readPackageJson();
    const copyScript = fs.readFileSync(COPY_CJS_TYPES, 'utf8');

    for (const entry of Object.values(pkg.exports)) {
      if (typeof entry === 'string') continue;

      const importTypes = entry.import?.types?.replace(/^\.\//, '');
      const requireTypes = entry.require?.types?.replace(/^\.\//, '');
      if (!importTypes || !requireTypes) continue;

      expect(copyScript).toContain(`'${importTypes}'`);
      expect(copyScript).toContain(`'${requireTypes}'`);
    }
  });
});
