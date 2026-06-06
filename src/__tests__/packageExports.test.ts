import * as fs from 'fs';
import * as path from 'path';

type PackageJson = {
  exports: Record<string, string | {
    import?: { types?: string; default?: string };
    require?: { types?: string; default?: string };
  }>;
  files: string[];
};

const ROOT = path.resolve(__dirname, '../..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const COPY_CJS_TYPES = path.join(ROOT, 'scripts/copy-cjs-types.cjs');
const TSCONFIG_JSON = path.join(ROOT, 'tsconfig.json');
const VITE_CONFIG = path.join(ROOT, 'vite.config.ts');

function readPackageJson(): PackageJson {
  return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8')) as PackageJson;
}

function normalizePackagePath(filePath: string): string {
  return filePath.replace(/^\.\//, '').replace(/\\/g, '/');
}

function isIncludedByPackageFiles(filePath: string, packageFiles: string[]): boolean {
  const normalized = normalizePackagePath(filePath);

  return packageFiles.some((pattern) => {
    const normalizedPattern = normalizePackagePath(pattern);

    if (normalizedPattern === normalized) return true;

    if (normalizedPattern.endsWith('/**/*')) {
      const prefix = normalizedPattern.slice(0, -'/**/*'.length);
      return normalized.startsWith(`${prefix}/`);
    }

    if (normalizedPattern.includes('*')) {
      const escaped = normalizedPattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*');
      return new RegExp(`^${escaped}$`).test(normalized);
    }

    return false;
  });
}

function getExportTargets(pkg: PackageJson): string[] {
  const targets: string[] = [];

  for (const entry of Object.values(pkg.exports)) {
    if (typeof entry === 'string') {
      targets.push(entry);
      continue;
    }

    if (entry.import?.types) targets.push(entry.import.types);
    if (entry.import?.default) targets.push(entry.import.default);
    if (entry.require?.types) targets.push(entry.require.types);
    if (entry.require?.default) targets.push(entry.require.default);
  }

  return targets;
}

function getJsExportEntries(pkg: PackageJson): Array<{
  subpath: string;
  specifier: string;
  entryName: string;
}> {
  return Object.entries(pkg.exports)
    .filter(([, entry]) => typeof entry !== 'string')
    .map(([subpath, entry]) => {
      const importDefault = (entry as Exclude<PackageJson['exports'][string], string>).import?.default;
      if (!importDefault) {
        throw new Error(`Missing import.default for ${subpath}`);
      }
      return {
        subpath,
        specifier: subpath === '.' ? 'gaesup-world' : `gaesup-world${subpath.slice(1)}`,
        entryName: path.basename(importDefault, '.js'),
      };
    });
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

  test('all exported package artifacts are included in npm files', () => {
    const pkg = readPackageJson();
    const missingTargets = getExportTargets(pkg).filter(
      (target) => !isIncludedByPackageFiles(target, pkg.files)
    );

    expect(missingTargets).toEqual([]);
  });

  test('package exports only point to packaged dist artifacts', () => {
    const pkg = readPackageJson();

    for (const target of getExportTargets(pkg)) {
      const normalized = normalizePackagePath(target);

      expect(normalized).toMatch(/^dist\//);
      expect(normalized).not.toContain('..');
      expect(normalized).not.toMatch(/^src\//);
    }
  });

  test('JS package exports have matching TypeScript path aliases', () => {
    const pkg = readPackageJson();
    const tsconfig = JSON.parse(fs.readFileSync(TSCONFIG_JSON, 'utf8')) as {
      compilerOptions?: { paths?: Record<string, string[]> };
    };
    const paths = tsconfig.compilerOptions?.paths ?? {};
    const missing = getJsExportEntries(pkg)
      .map((entry) => entry.specifier)
      .filter((specifier) => !Object.prototype.hasOwnProperty.call(paths, specifier));

    expect(missing).toEqual([]);
  });

  test('JS package exports have matching Vite dev aliases', () => {
    const pkg = readPackageJson();
    const viteConfig = fs.readFileSync(VITE_CONFIG, 'utf8');
    const missing = getJsExportEntries(pkg)
      .map((entry) => entry.specifier)
      .filter((specifier) => !viteConfig.includes(`find: /^${specifier.replace(/\//g, '\\/')}$`));

    expect(missing).toEqual([]);
  });

  test('JS package exports have matching Vite library build entries', () => {
    const pkg = readPackageJson();
    const viteConfig = fs.readFileSync(VITE_CONFIG, 'utf8');
    const missing = getJsExportEntries(pkg)
      .map((entry) => entry.entryName)
      .filter((entryName) => !viteConfig.includes(`${entryName}: path.resolve(`) && !viteConfig.includes(`'${entryName}': path.resolve(`));

    expect(missing).toEqual([]);
  });
});
