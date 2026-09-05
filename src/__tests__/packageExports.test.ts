import * as fs from 'fs';
import * as path from 'path';

type PackageJson = {
  engines?: { node?: string };
  exports: Record<
    string,
    | string
    | {
        import?: { types?: string; default?: string };
        require?: { types?: string; default?: string };
      }
  >;
  files: string[];
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  scripts?: Record<string, string>;
};

const ROOT = path.resolve(__dirname, '../..');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const COPY_CJS_TYPES = path.join(ROOT, 'scripts/copy-cjs-types.cjs');
const PACKAGE_CONSUMER_SCRIPT = path.join(ROOT, 'scripts/verify-package-consumer.cjs');
const DEMO_VERIFIER_SCRIPT = path.join(ROOT, 'scripts/verify-demo-surface-chunk.cjs');
const JEST_CONFIG = path.join(ROOT, 'jest.config.js');
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
      const importDefault = (entry as Exclude<PackageJson['exports'][string], string>).import
        ?.default;
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
  test('declares the Node range required by the build toolchain', () => {
    const pkg = readPackageJson();

    expect(pkg.engines?.node).toBe('^20.19.0 || >=22.12.0');
  });

  test('marks statically imported runtime peers as required', () => {
    const pkg = readPackageJson();
    const requiredRuntimePeers = [
      '@react-three/drei',
      '@react-three/fiber',
      '@react-three/postprocessing',
      '@react-three/rapier',
      'react',
      'react-dom',
      'three',
      'three-stdlib',
    ];

    for (const dependencyName of requiredRuntimePeers) {
      expect(pkg.peerDependencies?.[dependencyName]).toBeDefined();
      expect(pkg.peerDependenciesMeta?.[dependencyName]?.optional).not.toBe(true);
    }

    expect(pkg.peerDependenciesMeta).toBeUndefined();
  });

  test('does not redeclare transitive or unused runtime packages as peers', () => {
    const pkg = readPackageJson();
    const indirectPackages = [
      '@dimforge/rapier3d',
      '@dimforge/rapier3d-compat',
      'postprocessing',
      'react-icons',
      'react-router-dom',
    ];

    for (const dependencyName of indirectPackages) {
      expect(pkg.peerDependencies?.[dependencyName]).toBeUndefined();
      expect(pkg.peerDependenciesMeta?.[dependencyName]).toBeUndefined();
    }
  });

  test('package and demo verification use disposable fresh-build directories', () => {
    const pkg = readPackageJson();
    const packageConsumerScript = fs.readFileSync(PACKAGE_CONSUMER_SCRIPT, 'utf8');
    const demoVerifierScript = fs.readFileSync(DEMO_VERIFIER_SCRIPT, 'utf8');

    expect(packageConsumerScript).toContain('os.tmpdir()');
    expect(packageConsumerScript).not.toContain("path.join(root, '.tmp'");
    expect(packageConsumerScript).toContain("'tsconfig.cjs.json'");
    expect(packageConsumerScript).toContain("'tsconfig.compat.json'");
    expect(packageConsumerScript).toContain("'consumer.cts'");
    expect(packageConsumerScript).toContain("'consumer-compat.ts'");
    expect(packageConsumerScript).not.toContain('--legacy-peer-deps');
    expect(packageConsumerScript).toContain('assertStrictPackageDeclarations');
    expect(packageConsumerScript).toContain(
      'for (const exactOptionalPropertyTypes of [false, true])',
    );
    expect(packageConsumerScript).toContain('assertDeclarationFinalizerIdempotent');
    expect(demoVerifierScript).toContain('os.tmpdir()');
    expect(demoVerifierScript).toContain("'vite.js'");
    expect(pkg.scripts?.['test:package']).toContain('npm run build');
    expect(pkg.scripts?.['test:package:built']).toBe('node scripts/verify-package-consumer.cjs');
    expect(pkg.scripts?.['test:demo']).toBe('node scripts/verify-demo-surface-chunk.cjs');
  });

  test('fresh ESM and CJS consumers exercise the root SceneDocument command API', () => {
    const packageConsumerScript = fs.readFileSync(PACKAGE_CONSUMER_SCRIPT, 'utf8');

    [
      'applySceneDocumentCommand',
      'directSceneResult',
      'createSceneDocumentController',
      'createSceneDocumentSaveBinding',
      'createSceneDocumentRuntimeProbe',
      'scene-object.create',
      'scene-document',
      'SCENE_DOCUMENT_SAVE_KEY',
      "'esm-package'",
      "'cjs-package'",
    ].forEach((value) => expect(packageConsumerScript).toContain(value));
  });

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

  test('CJS declaration graph mirrors every public ESM declaration target', () => {
    const pkg = readPackageJson();
    const copyScript = fs.readFileSync(COPY_CJS_TYPES, 'utf8');

    for (const entry of Object.values(pkg.exports)) {
      if (typeof entry === 'string') continue;

      const importTypes = entry.import?.types?.replace(/^\.\//, '');
      const requireTypes = entry.require?.types?.replace(/^\.\//, '');
      if (!importTypes || !requireTypes) continue;

      expect(requireTypes).toBe(importTypes.replace(/\.d\.ts$/, '.d.cts'));
    }

    expect(copyScript).toContain('collectFiles(DIST_ROOT, ESM_DECLARATION_SUFFIX)');
    expect(copyScript).toContain('toCjsDeclarationPath(declarationPath)');
    expect(copyScript).toContain('assertDeclarationGraph(declarationPaths, parsedConfig)');
  });

  test('declaration finalizer fails when its relative graph is unresolved', () => {
    const copyScript = fs.readFileSync(COPY_CJS_TYPES, 'utf8');

    expect(copyScript).toContain('Unable to resolve declaration module');
    expect(copyScript).toContain('Missing declaration source');
  });

  test('style CSS export is packaged and has a Vite development alias', () => {
    const pkg = readPackageJson();
    const viteConfig = fs.readFileSync(VITE_CONFIG, 'utf8');
    const styleExport = pkg.exports['./style.css'];

    expect(typeof styleExport).toBe('string');
    if (typeof styleExport !== 'string')
      throw new Error('Expected ./style.css to be a string export');
    expect(styleExport).toBe('./dist/index.css');
    expect(isIncludedByPackageFiles(styleExport, pkg.files)).toBe(true);
    expect(viteConfig).toContain('find: /^gaesup-world\\/style\\.css$/');
    expect(viteConfig).toContain('src/core/editor/styles/theme.css');
  });

  test('all exported package artifacts are included in npm files', () => {
    const pkg = readPackageJson();
    const missingTargets = getExportTargets(pkg).filter(
      (target) => !isIncludedByPackageFiles(target, pkg.files),
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

  test('JS package exports have matching Jest module aliases', () => {
    const pkg = readPackageJson();
    const jestConfig = fs.readFileSync(JEST_CONFIG, 'utf8');
    const missing = getJsExportEntries(pkg)
      .map((entry) => entry.specifier)
      .filter((specifier) => !jestConfig.includes(`'^${specifier}$'`));

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
      .filter(
        (entryName) =>
          !viteConfig.includes(`${entryName}: path.resolve(`) &&
          !viteConfig.includes(`'${entryName}': path.resolve(`),
      );

    expect(missing).toEqual([]);
  });
});
