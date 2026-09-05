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
const VITE_CONFIG = path.join(ROOT, 'vite.config.ts');
const EXAMPLES_APP = path.join(EXAMPLES_ROOT, 'App.tsx');
const WORLD_PAGE = path.join(EXAMPLES_ROOT, 'pages/World.tsx');
const WORLD_PLAYER = path.join(EXAMPLES_ROOT, 'pages/world/player.tsx');
const WORLD_EDITOR_SURFACE = path.join(EXAMPLES_ROOT, 'pages/WorldEditorSurface.tsx');
const MINIMAL_EXAMPLE_PAGE = path.join(EXAMPLES_ROOT, 'pages/MinimalExamplePage.tsx');
const RIDEABLE_EXAMPLE = path.join(EXAMPLES_ROOT, 'components/rideable/index.tsx');
const CLOSE_UP_EXAMPLE = path.join(EXAMPLES_ROOT, 'components/cinematic/CloseUpControls.tsx');
const WORLD_SCENE = path.join(EXAMPLES_ROOT, 'pages/world/scene.tsx');
const FEATURE_ACCESS_EXAMPLE = path.join(
  EXAMPLES_ROOT,
  'components/feature/FeatureAccessPanel.tsx',
);
const PERFORMANCE_OVERLAY_EXAMPLE = path.join(
  EXAMPLES_ROOT,
  'components/performance/PerformanceOverlay.tsx',
);
const TELEPORT_CONSTANTS_EXAMPLE = path.join(EXAMPLES_ROOT, 'components/teleport/constants.ts');
const TELEPORT_MARKERS_EXAMPLE = path.join(EXAMPLES_ROOT, 'components/teleport/markers.tsx');
const PACKAGE_SURFACE = path.join(EXAMPLES_ROOT, 'packageSurface.ts');
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

function getVitePrivateAliases(): string[] {
  const sourceFile = ts.createSourceFile(
    VITE_CONFIG,
    fs.readFileSync(VITE_CONFIG, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const aliases = new Set<string>();

  const visit = (node: ts.Node): void => {
    if (ts.isObjectLiteralExpression(node)) {
      const findProperty = node.properties.find(
        (property): property is ts.PropertyAssignment =>
          ts.isPropertyAssignment(property) &&
          ((ts.isIdentifier(property.name) && property.name.text === 'find') ||
            (ts.isStringLiteralLike(property.name) && property.name.text === 'find')),
      );
      const replacementProperty = node.properties.find(
        (property): property is ts.PropertyAssignment =>
          ts.isPropertyAssignment(property) &&
          ((ts.isIdentifier(property.name) && property.name.text === 'replacement') ||
            (ts.isStringLiteralLike(property.name) && property.name.text === 'replacement')),
      );

      if (
        findProperty &&
        replacementProperty &&
        ts.isStringLiteralLike(findProperty.initializer) &&
        findProperty.initializer.text.startsWith('@') &&
        replacementProperty.getText(sourceFile).includes("'src")
      ) {
        aliases.add(findProperty.initializer.text);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return [...aliases].sort();
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
  const vitePrivateAliases = getVitePrivateAliases();
  const resolutionCache = ts.createModuleResolutionCache(
    ROOT,
    (fileName) => (ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase()),
    parsedConfig.options,
  );
  const failures: string[] = [];

  for (const reference of moduleReferences) {
    if (getPackageSubpath(reference.moduleName)) continue;

    const usesPrivateAlias =
      privatePathPatterns.some((pattern) => matchesPathPattern(reference.moduleName, pattern)) ||
      vitePrivateAliases.some(
        (alias) => reference.moduleName === alias || reference.moduleName.startsWith(`${alias}/`),
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

function createProgramForExamples(files: string[]): ts.Program {
  const parsedConfig = loadTsConfig();

  return ts.createProgram({
    rootNames: Array.from(new Set([...parsedConfig.fileNames, ...files])),
    options: parsedConfig.options,
  });
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

function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (!diagnostic.file || diagnostic.start === undefined) {
    return message;
  }

  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  return `${path.relative(ROOT, diagnostic.file.fileName)}:${position.line + 1}:${position.character + 1} - ${message}`;
}

function getExampleTypecheckFailures(program: ts.Program): string[] {
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => {
      if (!diagnostic.file) return true;
      const fileName = path.resolve(diagnostic.file.fileName);
      return fileName.startsWith(EXAMPLES_ROOT) || fileName.startsWith(path.join(ROOT, 'src'));
    })
    .map(formatDiagnostic);
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
      { file: EXAMPLES_APP, kind: 'import-type', moduleName: '@world/private-type' },
    ];

    expect(getPrivateLibraryImportFailures(references, loadTsConfig())).toEqual([
      'examples/App.tsx uses private library specifier ../src/index via import -> src/index.ts',
      'examples/App.tsx uses private library specifier @core/does-not-exist via dynamic-import',
      'examples/App.tsx uses private library specifier @world/private-type via import-type',
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

  test('package surface smoke is available from the developer catalog without app startup work', () => {
    const appSource = fs.readFileSync(EXAMPLES_APP, 'utf8');
    const catalogSource = fs.readFileSync(path.join(EXAMPLES_ROOT, 'pages/ExampleCatalogPage.tsx'), 'utf8');
    expect(appSource).not.toContain('packageSurface');
    expect(catalogSource).toContain("import('../packageSurface')");
    expect(catalogSource).toContain('createPackageSurfaceExample');
  });

  test('world example wires character customization into visible gameplay', () => {
    const worldSource = fs.readFileSync(WORLD_PAGE, 'utf8');
    const playerSource = fs.readFileSync(WORLD_PLAYER, 'utf8');
    const featureAccessSource = fs.readFileSync(FEATURE_ACCESS_EXAMPLE, 'utf8');
    const packageSource = fs.readFileSync(PACKAGE_JSON, 'utf8');

    expect(worldSource).toContain('CharacterCreator');
    expect(worldSource).toContain('FeatureAccessPanel');
    expect(worldSource).toMatch(/<CharacterCreator\s+toggleKey="o"/);
    expect(worldSource).toContain('<Player />');
    expect(playerSource).toContain('baseColor={appearance.colors.body}');
    expect(featureAccessSource).toContain('월드 조작');
    expect(featureAccessSource).toContain('꾸미기');
    expect(featureAccessSource).toContain('toggleCharacterWeapon');
    expect(featureAccessSource).toContain('applyCharacterEquipmentPreset');
    expect(featureAccessSource).toContain('warrior-cloth-blue');
    expect(featureAccessSource).toContain('warrior-cloth-green');
    expect(featureAccessSource).toContain('warrior-cloth-red');
    expect(featureAccessSource).toContain('starter-bottom-layer');
    expect(featureAccessSource).toContain('starter-shoes-layer');
    expect(featureAccessSource).toContain('starter-accessory-ring');
    expect(featureAccessSource).toContain('장비 비우기');
    expect(packageSource).toContain('public/gltf/*.glb');
  });

  test('minimal example consumes runtime APIs without world physics or editor shells', () => {
    const appSource = fs.readFileSync(EXAMPLES_APP, 'utf8');
    const minimalSource = fs.readFileSync(MINIMAL_EXAMPLE_PAGE, 'utf8');

    expect(appSource).toContain("import('./pages/MinimalExamplePage')");
    expect(appSource).toContain('path="/minimal"');
    expect(minimalSource).toContain("from 'gaesup-world'");
    expect(minimalSource).toContain('GaesupRuntimeProvider');
    expect(minimalSource).toContain('createGaesupRuntime');
    expect(minimalSource).toContain('ActionEquipmentPanel');
    expect(minimalSource).not.toContain('GaesupWorld');
    expect(minimalSource).not.toContain("from 'gaesup-world/editor'");
    expect(minimalSource).not.toContain('@react-three/rapier');
  });

  test('world example wires rideables into visible gameplay through public APIs', () => {
    const worldSource = fs.readFileSync(WORLD_PAGE, 'utf8');
    const rideableSource = fs.readFileSync(RIDEABLE_EXAMPLE, 'utf8');
    const featureAccessSource = fs.readFileSync(FEATURE_ACCESS_EXAMPLE, 'utf8');

    expect(worldSource).toContain('RideableVehicles');
    expect(worldSource).toContain('RideableUIRenderer');
    expect(worldSource).toContain('<RideableVehicles />');
    expect(worldSource).toContain('{!showEditor && <RideableUIRenderer />}');
    expect(featureAccessSource).toContain('차량 탑승');
    expect(featureAccessSource).toContain('비행기 탑승');
    expect(featureAccessSource).toContain('내리기');
    expect(rideableSource).toContain("from 'gaesup-world'");
    expect(rideableSource).toContain('Rideable');
    expect(rideableSource).toContain('RideableUI');
  });

  test('world example wires close-up camera controls through public APIs', () => {
    const worldSource = fs.readFileSync(WORLD_PAGE, 'utf8');
    const closeUpSource = fs.readFileSync(CLOSE_UP_EXAMPLE, 'utf8');
    const sceneSource = fs.readFileSync(WORLD_SCENE, 'utf8');

    expect(worldSource).toContain('CloseUpControls');
    expect(worldSource).toContain('{!showEditor && <CloseUpControls />}');
    expect(worldSource).toContain('restoreCameraCloseUp');
    expect(worldSource).toContain('<Scenery enableCloseUp={!showEditor} />');
    expect(closeUpSource).toContain("from 'gaesup-world'");
    expect(closeUpSource).toContain('playCameraCinematic');
    expect(closeUpSource).toContain("kind: 'dolly'");
    expect(closeUpSource).toContain("kind: 'orbit'");
    expect(closeUpSource).toContain("kind: 'shake'");
    expect(closeUpSource).toContain("kind: 'fade'");
    expect(closeUpSource).toContain("kind: 'expression'");
    expect(closeUpSource).toContain("kind: 'equip'");
    expect(closeUpSource).toContain("kind: 'teleport'");
    expect(closeUpSource).toContain("kind: 'animation'");
    expect(closeUpSource).toContain("kind: 'event'");
    expect(closeUpSource).toContain('requestCameraCloseUp');
    expect(closeUpSource).toContain('restoreCameraCloseUp');
    expect(sceneSource).toContain('requestCameraCloseUp');
    expect(sceneSource).toContain('InspectableCloseUpTargets');
    expect(sceneSource).toContain("document.body.style.cursor = 'zoom-in'");
  });

  test('world editor shell wires cinematic panel through public APIs', () => {
    const worldSource = fs.readFileSync(WORLD_PAGE, 'utf8');
    const editorSurfaceSource = fs.readFileSync(WORLD_EDITOR_SURFACE, 'utf8');

    expect(worldSource).toContain("lazy(() => import('./WorldEditorSurface'))");
    expect(worldSource).not.toContain("from 'gaesup-world/editor'");
    expect(editorSurfaceSource).toContain("from 'gaesup-world/editor'");
    expect(editorSurfaceSource).toContain('CinematicPanel');
    expect(editorSurfaceSource).toContain('component: <CinematicPanel />');
    expect(editorSurfaceSource).toContain("'cinematic'");
  });

  test('world example exposes performance metrics when diagnostics are enabled', () => {
    const worldSource = fs.readFileSync(WORLD_PAGE, 'utf8');
    const performanceOverlaySource = fs.readFileSync(PERFORMANCE_OVERLAY_EXAMPLE, 'utf8');

    expect(worldSource).toContain('PerformanceOverlay');
    expect(worldSource).toContain('{showDiagnostics && <PerformanceOverlay />}');
    expect(performanceOverlaySource).toContain("import('gaesup-world/editor')");
    expect(performanceOverlaySource).toContain('PerformancePanel');
    expect(performanceOverlaySource).toContain("'보기'");
  });

  test('world example wires click-to-teleport through public APIs', () => {
    const worldSource = fs.readFileSync(WORLD_PAGE, 'utf8');

    expect(worldSource).toContain('TeleportOnClick');
    expect(worldSource).toContain('{!showEditor && <TeleportOnClick modifierKey="altKey" />}');
  });

  test('world example wires named teleport markers through public APIs', () => {
    const worldSource = fs.readFileSync(WORLD_PAGE, 'utf8');
    const constantsSource = fs.readFileSync(TELEPORT_CONSTANTS_EXAMPLE, 'utf8');
    const markersSource = fs.readFileSync(TELEPORT_MARKERS_EXAMPLE, 'utf8');

    expect(worldSource).toContain('TeleportMarkers');
    expect(worldSource).toContain('{!showEditor && <TeleportMarkers />}');
    expect(constantsSource).toContain("from 'gaesup-world'");
    expect(constantsSource).toContain('createTeleportDestination');
    expect(markersSource).toContain("from 'gaesup-world'");
    expect(markersSource).toContain('TeleportMarker');
  });

  test('examples only import names exported by public package entry points', () => {
    const files = collectExampleSourceFiles();
    const packageImports = getPublicModuleImports(files);
    const program = createProgramForExamples(files);

    expect(getNamedImportFailures(program, packageImports)).toEqual([]);
  });

  test('examples typecheck against public package aliases', () => {
    const files = collectExampleSourceFiles();
    const program = createProgramForExamples(files);

    expect(getExampleTypecheckFailures(program)).toEqual([]);
  });
});
