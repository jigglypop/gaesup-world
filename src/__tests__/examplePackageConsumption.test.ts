import * as fs from 'fs';
import * as path from 'path';

import ts from 'typescript';

type PackageExportEntry =
  | string
  | {
      import?: { types?: string; default?: string };
      require?: { types?: string; default?: string };
    };

type PackageJson = {
  exports: Record<string, PackageExportEntry>;
};

type ModuleReferenceKind =
  | 'dynamic-import'
  | 'export'
  | 'export-type'
  | 'import'
  | 'import-equals'
  | 'import-equals-type'
  | 'import-type'
  | 'import-type-expression'
  | 'require';

type SourceModuleReference = {
  file: string;
  kind: ModuleReferenceKind;
  moduleName: string;
};

type PackageImport = SourceModuleReference & {
  importedNames: string[];
};

const ROOT = path.resolve(__dirname, '../..');
const EXAMPLES_ROOT = path.join(ROOT, 'examples');
const SRC_ROOT = path.join(ROOT, 'src');
const PACKAGE_JSON = path.join(ROOT, 'package.json');
const TSCONFIG_JSON = path.join(ROOT, 'tsconfig.json');
const EXAMPLES_APP = path.join(EXAMPLES_ROOT, 'App.tsx');
const PACKAGE_SURFACE = path.join(EXAMPLES_ROOT, 'engine/packageSurface.ts');
const PACKAGE_NAME = 'gaesup-world';

function readPackageJson(): PackageJson {
  return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8')) as PackageJson;
}

function collectExampleSourceFiles(): string[] {
  const files: string[] = [];

  function collect(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collect(fullPath);
        continue;
      }
      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  collect(EXAMPLES_ROOT);
  return files.sort();
}

function getPackageSubpath(moduleName: string): string | null {
  if (moduleName === PACKAGE_NAME) return '.';
  if (moduleName.startsWith(`${PACKAGE_NAME}/`)) {
    return `.${moduleName.slice(PACKAGE_NAME.length)}`;
  }
  return null;
}

function isTypeOnlyImport(node: ts.ImportDeclaration): boolean {
  if (!node.importClause) return false;
  if (node.importClause.isTypeOnly) return true;

  const bindings = node.importClause.namedBindings;
  return Boolean(
    bindings &&
      ts.isNamedImports(bindings) &&
      bindings.elements.length > 0 &&
      bindings.elements.every((element) => element.isTypeOnly),
  );
}

function isTypeOnlyExport(node: ts.ExportDeclaration): boolean {
  if (node.isTypeOnly) return true;
  return Boolean(
    node.exportClause &&
      ts.isNamedExports(node.exportClause) &&
      node.exportClause.elements.length > 0 &&
      node.exportClause.elements.every((element) => element.isTypeOnly),
  );
}

function getSourceModuleReferences(files: string[]): PackageImport[] {
  const imports: PackageImport[] = [];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);

    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const moduleName = node.moduleSpecifier.text;
        const importedNames: string[] = [];
        const namedBindings = node.importClause?.namedBindings;
        if (namedBindings && ts.isNamedImports(namedBindings)) {
          namedBindings.elements.forEach((element) => {
            importedNames.push(element.propertyName?.text ?? element.name.text);
          });
        }

        imports.push({
          file,
          kind: isTypeOnlyImport(node) ? 'import-type' : 'import',
          moduleName,
          importedNames,
        });
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteralLike(node.moduleSpecifier)
      ) {
        imports.push({
          file,
          kind: isTypeOnlyExport(node) ? 'export-type' : 'export',
          moduleName: node.moduleSpecifier.text,
          importedNames: [],
        });
      } else if (
        ts.isImportEqualsDeclaration(node) &&
        ts.isExternalModuleReference(node.moduleReference) &&
        node.moduleReference.expression &&
        ts.isStringLiteralLike(node.moduleReference.expression)
      ) {
        imports.push({
          file,
          kind: node.isTypeOnly ? 'import-equals-type' : 'import-equals',
          moduleName: node.moduleReference.expression.text,
          importedNames: [],
        });
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteralLike(node.argument.literal)
      ) {
        imports.push({
          file,
          kind: 'import-type-expression',
          moduleName: node.argument.literal.text,
          importedNames: [],
        });
      }

      if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length > 0
      ) {
        const [specifier] = node.arguments;
        if (specifier && ts.isStringLiteralLike(specifier)) {
          imports.push({
            file,
            kind: 'dynamic-import',
            moduleName: specifier.text,
            importedNames: [],
          });
        }
      } else if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'require' &&
        node.arguments.length === 1
      ) {
        const [specifier] = node.arguments;
        if (specifier && ts.isStringLiteralLike(specifier)) {
          imports.push({
            file,
            kind: 'require',
            moduleName: specifier.text,
            importedNames: [],
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  return imports;
}

function getPublicModuleImports(files: string[]): PackageImport[] {
  return getSourceModuleReferences(files).filter((item) => getPackageSubpath(item.moduleName));
}

function loadTsConfig(): ts.ParsedCommandLine {
  const readResult = ts.readConfigFile(TSCONFIG_JSON, ts.sys.readFile);
  if (readResult.error) {
    throw new Error(ts.flattenDiagnosticMessageText(readResult.error.messageText, '\n'));
  }

  return ts.parseJsonConfigFileContent(readResult.config, ts.sys, ROOT);
}

function matchesPathPattern(moduleName: string, pattern: string): boolean {
  const wildcardIndex = pattern.indexOf('*');
  if (wildcardIndex < 0) return moduleName === pattern;

  const prefix = pattern.slice(0, wildcardIndex);
  const suffix = pattern.slice(wildcardIndex + 1);
  return (
    moduleName.length >= prefix.length + suffix.length &&
    moduleName.startsWith(prefix) &&
    moduleName.endsWith(suffix)
  );
}

function isWithinDirectory(directory: string, file: string): boolean {
  const relative = path.relative(directory, path.resolve(file));
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
  );
}

function formatResolvedSource(file: string): string {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function getPrivateLibraryImportFailures(
  moduleReferences: SourceModuleReference[],
  parsedConfig: ts.ParsedCommandLine,
): string[] {
  const privatePathPatterns = Object.keys(parsedConfig.options.paths ?? {}).filter(
    (pattern) => pattern !== PACKAGE_NAME && !pattern.startsWith(`${PACKAGE_NAME}/`),
  );
  const resolutionCache = ts.createModuleResolutionCache(
    ROOT,
    (fileName) => (ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase()),
    parsedConfig.options,
  );
  const failures: string[] = [];

  for (const reference of moduleReferences) {
    if (getPackageSubpath(reference.moduleName)) continue;

    const usesPrivateAlias = privatePathPatterns.some((pattern) =>
      matchesPathPattern(reference.moduleName, pattern),
    );
    const resolved = ts.resolveModuleName(
      reference.moduleName,
      reference.file,
      parsedConfig.options,
      ts.sys,
      resolutionCache,
    ).resolvedModule;
    const resolvesToLibrarySource = Boolean(
      resolved && isWithinDirectory(SRC_ROOT, resolved.resolvedFileName),
    );

    if (!usesPrivateAlias && !resolvesToLibrarySource) continue;

    const resolvedSuffix = resolved ? ` -> ${formatResolvedSource(resolved.resolvedFileName)}` : '';
    failures.push(
      `${formatResolvedSource(reference.file)} uses private library specifier ${reference.moduleName} via ${reference.kind}${resolvedSuffix}`,
    );
  }

  return failures.sort();
}

/** Export lookups only need the example files and what they reach; full typechecking is `pnpm typecheck`. */
function createProgramForExamples(files: string[]): ts.Program {
  return ts.createProgram({ rootNames: files, options: loadTsConfig().options });
}

function getModuleExports(
  program: ts.Program,
  moduleName: string,
  containingFile: string,
): Set<string> {
  const parsedConfig = loadTsConfig();
  const resolved = ts.resolveModuleName(
    moduleName,
    containingFile,
    parsedConfig.options,
    ts.sys,
  ).resolvedModule;

  if (!resolved) {
    throw new Error(`Could not resolve ${moduleName} from ${path.relative(ROOT, containingFile)}`);
  }

  const sourceFile = program.getSourceFile(resolved.resolvedFileName);
  if (!sourceFile) {
    throw new Error(`Resolved module source not found: ${resolved.resolvedFileName}`);
  }

  const checker = program.getTypeChecker();
  const symbol = checker.getSymbolAtLocation(sourceFile);
  if (!symbol) {
    throw new Error(`Module symbol not found: ${resolved.resolvedFileName}`);
  }

  return new Set(checker.getExportsOfModule(symbol).map((item) => item.getName()));
}

function getPackageImportFailures(packageImports: PackageImport[], pkg: PackageJson): string[] {
  const failures: string[] = [];

  for (const item of packageImports) {
    const subpath = getPackageSubpath(item.moduleName);
    if (!subpath || Object.prototype.hasOwnProperty.call(pkg.exports, subpath)) continue;

    failures.push(
      `${path.relative(ROOT, item.file)} imports ${item.moduleName}, but package.json does not export ${subpath}`,
    );
  }

  return failures;
}

function getUnusedPackageExportFailures(
  packageImports: PackageImport[],
  pkg: PackageJson,
): string[] {
  const importedSubpaths = new Set(
    packageImports
      .map((item) => getPackageSubpath(item.moduleName))
      .filter((subpath): subpath is string => Boolean(subpath)),
  );

  return Object.keys(pkg.exports)
    .filter((subpath) => !importedSubpaths.has(subpath))
    .map((subpath) => `package export ${subpath} is not consumed by examples`);
}

function getNamedImportFailures(program: ts.Program, packageImports: PackageImport[]): string[] {
  const exportCache = new Map<string, Set<string>>();
  const failures: string[] = [];

  for (const item of packageImports) {
    if (item.importedNames.length === 0) continue;

    const cacheKey = `${item.moduleName}\0${item.file}`;
    let moduleExports = exportCache.get(cacheKey);
    if (!moduleExports) {
      moduleExports = getModuleExports(program, item.moduleName, item.file);
      exportCache.set(cacheKey, moduleExports);
    }

    for (const importedName of item.importedNames) {
      if (moduleExports.has(importedName)) continue;

      failures.push(
        `${path.relative(ROOT, item.file)} imports ${importedName} from ${item.moduleName}, but that entry point does not export it`,
      );
    }
  }

  return failures;
}

describe('examples package consumption contract', () => {
  test('private library import detection covers aliases and resolved source paths', () => {
    const references: SourceModuleReference[] = [
      { file: EXAMPLES_APP, kind: 'import', moduleName: 'gaesup-world' },
      { file: EXAMPLES_APP, kind: 'import', moduleName: './packageSurface' },
      { file: EXAMPLES_APP, kind: 'import', moduleName: '../src/index' },
      { file: EXAMPLES_APP, kind: 'dynamic-import', moduleName: '@core/does-not-exist' },
      { file: EXAMPLES_APP, kind: 'import-type', moduleName: '@stores/private-type' },
    ];

    expect(getPrivateLibraryImportFailures(references, loadTsConfig())).toEqual([
      'examples/App.tsx uses private library specifier ../src/index via import -> src/index.ts',
      'examples/App.tsx uses private library specifier @core/does-not-exist via dynamic-import',
      'examples/App.tsx uses private library specifier @stores/private-type via import-type',
    ]);
  });

  test('examples do not bypass public gaesup-world package entry points', () => {
    const moduleReferences = getSourceModuleReferences(collectExampleSourceFiles());

    expect(getPrivateLibraryImportFailures(moduleReferences, loadTsConfig())).toEqual([]);
  });

  test('examples only import declared gaesup-world package subpaths', () => {
    const pkg = readPackageJson();
    const packageImports = getPublicModuleImports(collectExampleSourceFiles());

    expect(getPackageImportFailures(packageImports, pkg)).toEqual([]);
  });

  test('examples consume every package export subpath', () => {
    const pkg = readPackageJson();
    const packageImports = getPublicModuleImports(collectExampleSourceFiles());

    expect(getUnusedPackageExportFailures(packageImports, pkg)).toEqual([]);
  });

  test('package surface smoke explicitly consumes every package export subpath', () => {
    const pkg = readPackageJson();
    const packageImports = getPublicModuleImports([PACKAGE_SURFACE]);

    expect(getUnusedPackageExportFailures(packageImports, pkg)).toEqual([]);
  });

  test('examples only import names exported by public package entry points', () => {
    const files = collectExampleSourceFiles();
    const packageImports = getPublicModuleImports(files);

    expect(getNamedImportFailures(createProgramForExamples(files), packageImports)).toEqual([]);
  });
});
