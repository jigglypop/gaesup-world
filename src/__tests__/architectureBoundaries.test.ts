import * as fs from 'fs';
import * as path from 'path';

import ts from 'typescript';

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

type ModuleReference = {
  kind: ModuleReferenceKind;
  specifier: string;
};

type DependencyEdge = ModuleReference & {
  from: string;
  target: string;
};

type BaselineDiff = {
  additions: DependencyEdge[];
  stale: DependencyEdge[];
};

const ROOT = path.resolve(__dirname, '../..');
const SRC_ROOT = path.join(ROOT, 'src');
const TSCONFIG_JSON = path.join(ROOT, 'tsconfig.json');
const RAPIER_MODULE = '@react-three/rapier';
const LAYER_ONE_FORBIDDEN_EXTERNAL_MODULES = ['@react-three/fiber', 'react', 'zustand'] as const;
const SOURCE_FILE_PATTERN = /\.(?:[cm]?[jt]sx?)$/;
const EXCLUDED_SOURCE_PATTERN = /(?:\.old|\.spec|\.test)\.[cm]?[jt]sx?$/;

const LOCAL_UPWARD_EDGE_BASELINE: DependencyEdge[] = [
  {
    from: 'src/core/animation/core/AnimationSystem.ts',
    kind: 'import',
    specifier: '../bridge/types',
    target: 'src/core/animation/bridge/types.ts',
  },
  {
    from: 'src/core/animation/core/types.ts',
    kind: 'import',
    specifier: '../bridge/types',
    target: 'src/core/animation/bridge/types.ts',
  },
  {
    from: 'src/core/camera/core/CameraSystem.ts',
    kind: 'import',
    specifier: '../bridge/BaseCameraSystem',
    target: 'src/core/camera/bridge/BaseCameraSystem.ts',
  },
  {
    from: 'src/core/camera/core/CameraSystem.ts',
    kind: 'import',
    specifier: '../bridge/types',
    target: 'src/core/camera/bridge/types.ts',
  },
  {
    from: 'src/core/camera/core/CameraSystem.ts',
    kind: 'import',
    specifier: '../controllers',
    target: 'src/core/camera/controllers/index.ts',
  },
  {
    from: 'src/core/motions/bridge/MotionBridge.ts',
    kind: 'import',
    specifier: '@/core/world/components/Rideable/types',
    target: 'src/core/world/components/Rideable/types.ts',
  },
  {
    from: 'src/core/motions/core/movement/DirectionComponent.ts',
    kind: 'import',
    specifier: '@stores/slices/mode/types',
    target: 'src/core/stores/slices/mode/types.ts',
  },
  {
    from: 'src/core/motions/core/services/MotionService.ts',
    kind: 'import',
    specifier: '@/core/world/components/Rideable/types',
    target: 'src/core/world/components/Rideable/types.ts',
  },
  {
    from: 'src/core/motions/core/system/EntityStateManager.ts',
    kind: 'import',
    specifier: '@core/world/components/Rideable/types',
    target: 'src/core/world/components/Rideable/types.ts',
  },
  {
    from: 'src/core/motions/core/system/MotionSystem.ts',
    kind: 'import-type',
    specifier: '@core/world/components/Rideable/types',
    target: 'src/core/world/components/Rideable/types.ts',
  },
  {
    from: 'src/core/motions/core/system/PhysicsSystem.ts',
    kind: 'import',
    specifier: '@core/motions/controller/AnimationController',
    target: 'src/core/motions/controller/AnimationController.ts',
  },
  {
    from: 'src/core/motions/core/system/PhysicsSystem.ts',
    kind: 'import',
    specifier: '@core/world/components/Rideable/types',
    target: 'src/core/world/components/Rideable/types.ts',
  },
  {
    from: 'src/core/motions/core/system/types.ts',
    kind: 'import',
    specifier: '@core/world/components/Rideable/types',
    target: 'src/core/world/components/Rideable/types.ts',
  },
  {
    from: 'src/core/motions/core/types.ts',
    kind: 'import-type',
    specifier: '@stores/types',
    target: 'src/core/stores/types.ts',
  },
  {
    from: 'src/core/npc/core/blueprint.ts',
    kind: 'import',
    specifier: '../../quests/stores/questStore',
    target: 'src/core/quests/stores/questStore.ts',
  },
  {
    from: 'src/core/npc/core/blueprint.ts',
    kind: 'import',
    specifier: '../../relations/stores/friendshipStore',
    target: 'src/core/relations/stores/friendshipStore.ts',
  },
];

const LAYER_ONE_RAPIER_EDGE_BASELINE: DependencyEdge[] = [
  {
    from: 'src/core/motions/core/forces/BuoyancyComponent.ts',
    kind: 'import',
    specifier: RAPIER_MODULE,
    target: 'node_modules/@react-three/rapier/dist/react-three-rapier.cjs.d.ts',
  },
  {
    from: 'src/core/motions/core/forces/ForceComponent.ts',
    kind: 'import',
    specifier: RAPIER_MODULE,
    target: 'node_modules/@react-three/rapier/dist/react-three-rapier.cjs.d.ts',
  },
  {
    from: 'src/core/motions/core/forces/GravityComponent.ts',
    kind: 'import',
    specifier: RAPIER_MODULE,
    target: 'node_modules/@react-three/rapier/dist/react-three-rapier.cjs.d.ts',
  },
  {
    from: 'src/core/motions/core/forces/WindComponent.ts',
    kind: 'import',
    specifier: RAPIER_MODULE,
    target: 'node_modules/@react-three/rapier/dist/react-three-rapier.cjs.d.ts',
  },
  {
    from: 'src/core/motions/core/movement/ImpulseComponent.ts',
    kind: 'import',
    specifier: RAPIER_MODULE,
    target: 'node_modules/@react-three/rapier/dist/react-three-rapier.cjs.d.ts',
  },
  {
    from: 'src/core/motions/core/system/MotionSystem.ts',
    kind: 'import',
    specifier: RAPIER_MODULE,
    target: 'node_modules/@react-three/rapier/dist/react-three-rapier.cjs.d.ts',
  },
  {
    from: 'src/core/motions/core/system/PhysicsSystem.ts',
    kind: 'import',
    specifier: RAPIER_MODULE,
    target: 'node_modules/@react-three/rapier/dist/react-three-rapier.cjs.d.ts',
  },
  {
    from: 'src/core/motions/core/types.ts',
    kind: 'import',
    specifier: RAPIER_MODULE,
    target: 'node_modules/@react-three/rapier/dist/react-three-rapier.cjs.d.ts',
  },
  {
    from: 'src/core/networks/core/PlayerPositionTracker.ts',
    kind: 'import-type',
    specifier: RAPIER_MODULE,
    target: 'node_modules/@react-three/rapier/dist/react-three-rapier.cjs.d.ts',
  },
];

function toRepositoryPath(file: string): string {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function normalizeResolvedTarget(file: string): string {
  const normalized = path.resolve(file).replace(/\\/g, '/');
  const nodeModulesMarker = '/node_modules/';
  const nodeModulesIndex = normalized.lastIndexOf(nodeModulesMarker);

  if (nodeModulesIndex >= 0) {
    return `node_modules/${normalized.slice(nodeModulesIndex + nodeModulesMarker.length)}`;
  }

  return toRepositoryPath(normalized);
}

function collectSourceFiles(directory: string): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (SOURCE_FILE_PATTERN.test(entry.name) && !EXCLUDED_SOURCE_PATTERN.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files.sort();
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

function collectModuleReferences(sourceFile: ts.SourceFile): ModuleReference[] {
  const references: ModuleReference[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
      references.push({
        kind: isTypeOnlyImport(node) ? 'import-type' : 'import',
        specifier: node.moduleSpecifier.text,
      });
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      references.push({
        kind: isTypeOnlyExport(node) ? 'export-type' : 'export',
        specifier: node.moduleSpecifier.text,
      });
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      references.push({
        kind: node.isTypeOnly ? 'import-equals-type' : 'import-equals',
        specifier: node.moduleReference.expression.text,
      });
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    ) {
      references.push({
        kind: 'import-type-expression',
        specifier: node.argument.literal.text,
      });
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        references.push({ kind: 'dynamic-import', specifier: node.arguments[0].text });
      } else if (ts.isIdentifier(node.expression) && node.expression.text === 'require') {
        references.push({ kind: 'require', specifier: node.arguments[0].text });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return references;
}

function getArchitectureLayer(file: string): 0 | 1 | 2 | 3 {
  const repositoryPath = toRepositoryPath(file);

  if (/^src\/core\/[^/]+\/core(?:\/|$)/.test(repositoryPath)) return 1;
  if (/^src\/core\/[^/]+\/bridge(?:\/|$)/.test(repositoryPath)) return 2;
  if (
    /^src\/core\/(?:[^/]+\/)?(?:components?|controllers?|hooks?|stores?)(?:\/|$)/.test(
      repositoryPath,
    )
  ) {
    return 3;
  }

  return 0;
}

function isLayerOneForbiddenExternalSpecifier(specifier: string): boolean {
  return LAYER_ONE_FORBIDDEN_EXTERNAL_MODULES.some(
    (moduleName) => specifier === moduleName || specifier.startsWith(`${moduleName}/`),
  );
}

function loadTsConfig(): ts.ParsedCommandLine {
  const readResult = ts.readConfigFile(TSCONFIG_JSON, ts.sys.readFile);
  if (readResult.error) {
    throw new Error(ts.flattenDiagnosticMessageText(readResult.error.messageText, '\n'));
  }

  return ts.parseJsonConfigFileContent(readResult.config, ts.sys, ROOT);
}

function collectArchitectureDebt(): {
  localUpwardEdges: DependencyEdge[];
  layerOneForbiddenExternalEdges: DependencyEdge[];
  layerOneRapierEdges: DependencyEdge[];
} {
  const parsedConfig = loadTsConfig();
  const resolutionCache = ts.createModuleResolutionCache(
    ROOT,
    (fileName) => (ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase()),
    parsedConfig.options,
  );
  const localUpwardEdges: DependencyEdge[] = [];
  const layerOneForbiddenExternalEdges: DependencyEdge[] = [];
  const layerOneRapierEdges: DependencyEdge[] = [];

  for (const file of collectSourceFiles(SRC_ROOT)) {
    const sourceLayer = getArchitectureLayer(file);
    if (sourceLayer !== 1 && sourceLayer !== 2) continue;

    const sourceFile = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );

    for (const reference of collectModuleReferences(sourceFile)) {
      const isLayerOneForbiddenExternal =
        sourceLayer === 1 && isLayerOneForbiddenExternalSpecifier(reference.specifier);
      const resolved = ts.resolveModuleName(
        reference.specifier,
        file,
        parsedConfig.options,
        ts.sys,
        resolutionCache,
      ).resolvedModule;
      if (!resolved) {
        if (isLayerOneForbiddenExternal) {
          layerOneForbiddenExternalEdges.push({
            from: toRepositoryPath(file),
            kind: reference.kind,
            specifier: reference.specifier,
            target: `unresolved:${reference.specifier}`,
          });
        }
        continue;
      }

      const edge: DependencyEdge = {
        from: toRepositoryPath(file),
        kind: reference.kind,
        specifier: reference.specifier,
        target: normalizeResolvedTarget(resolved.resolvedFileName),
      };
      const targetLayer = getArchitectureLayer(resolved.resolvedFileName);
      const isLocalUpwardEdge =
        (sourceLayer === 1 && (targetLayer === 2 || targetLayer === 3)) ||
        (sourceLayer === 2 && targetLayer === 3);

      if (isLocalUpwardEdge) localUpwardEdges.push(edge);
      if (isLayerOneForbiddenExternal) layerOneForbiddenExternalEdges.push(edge);
      if (
        sourceLayer === 1 &&
        (reference.specifier === RAPIER_MODULE ||
          reference.specifier.startsWith(`${RAPIER_MODULE}/`))
      ) {
        layerOneRapierEdges.push(edge);
      }
    }
  }

  return { localUpwardEdges, layerOneForbiddenExternalEdges, layerOneRapierEdges };
}

function edgeKey(edge: DependencyEdge): string {
  return JSON.stringify([edge.from, edge.kind, edge.specifier, edge.target]);
}

function compareEdges(left: DependencyEdge, right: DependencyEdge): number {
  return edgeKey(left).localeCompare(edgeKey(right));
}

function subtractEdges(edges: DependencyEdge[], subtract: DependencyEdge[]): DependencyEdge[] {
  const remaining = new Map<string, number>();
  for (const edge of subtract) {
    const key = edgeKey(edge);
    remaining.set(key, (remaining.get(key) ?? 0) + 1);
  }

  const difference: DependencyEdge[] = [];
  for (const edge of edges) {
    const key = edgeKey(edge);
    const count = remaining.get(key) ?? 0;
    if (count > 0) {
      remaining.set(key, count - 1);
    } else {
      difference.push(edge);
    }
  }

  return difference.sort(compareEdges);
}

function getBaselineDiff(actual: DependencyEdge[], baseline: DependencyEdge[]): BaselineDiff {
  return {
    additions: subtractEdges(actual, baseline),
    stale: subtractEdges(baseline, actual),
  };
}

describe('architecture dependency boundaries', () => {
  test('module reference extraction covers every supported dependency syntax', () => {
    const sourceFile = ts.createSourceFile(
      'syntax.ts',
      [
        "import value from './static';",
        "import type { TypeOnly } from './import-type';",
        "export { value } from './export';",
        "export type { TypeOnly } from './export-type';",
        "import legacy = require('./import-equals');",
        "void import('./dynamic');",
        "const required = require('./require');",
        "type Inline = import('./import-type-expression').Inline;",
      ].join('\n'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    expect(collectModuleReferences(sourceFile)).toEqual([
      { kind: 'import', specifier: './static' },
      { kind: 'import-type', specifier: './import-type' },
      { kind: 'export', specifier: './export' },
      { kind: 'export-type', specifier: './export-type' },
      { kind: 'import-equals', specifier: './import-equals' },
      { kind: 'dynamic-import', specifier: './dynamic' },
      { kind: 'require', specifier: './require' },
      { kind: 'import-type-expression', specifier: './import-type-expression' },
    ]);
  });

  test('baseline comparison reports additions and stale entries deterministically', () => {
    const shared: DependencyEdge = {
      from: 'src/core/example/core/shared.ts',
      kind: 'import',
      specifier: '../bridge/shared',
      target: 'src/core/example/bridge/shared.ts',
    };
    const addition: DependencyEdge = {
      from: 'src/core/example/core/addition.ts',
      kind: 'import',
      specifier: '../bridge/addition',
      target: 'src/core/example/bridge/addition.ts',
    };
    const stale: DependencyEdge = {
      from: 'src/core/example/core/stale.ts',
      kind: 'import',
      specifier: '../bridge/stale',
      target: 'src/core/example/bridge/stale.ts',
    };

    expect(getBaselineDiff([shared, addition], [stale, shared])).toEqual({
      additions: [addition],
      stale: [stale],
    });
  });

  test('recognizes direct and subpath Layer 1 framework imports', () => {
    expect(isLayerOneForbiddenExternalSpecifier('react')).toBe(true);
    expect(isLayerOneForbiddenExternalSpecifier('react/jsx-runtime')).toBe(true);
    expect(isLayerOneForbiddenExternalSpecifier('zustand/vanilla')).toBe(true);
    expect(isLayerOneForbiddenExternalSpecifier('@react-three/fiber')).toBe(true);
    expect(isLayerOneForbiddenExternalSpecifier('@react-three/rapier')).toBe(false);
  });

  test('keeps the exact local Layer 1 and Layer 2 upward-edge baseline', () => {
    const { localUpwardEdges } = collectArchitectureDebt();

    expect(LOCAL_UPWARD_EDGE_BASELINE).toHaveLength(16);
    expect(getBaselineDiff(localUpwardEdges, LOCAL_UPWARD_EDGE_BASELINE)).toEqual({
      additions: [],
      stale: [],
    });
  });

  test('keeps the exact Layer 1 React Rapier dependency baseline', () => {
    const { layerOneRapierEdges } = collectArchitectureDebt();

    expect(LAYER_ONE_RAPIER_EDGE_BASELINE).toHaveLength(9);
    expect(getBaselineDiff(layerOneRapierEdges, LAYER_ONE_RAPIER_EDGE_BASELINE)).toEqual({
      additions: [],
      stale: [],
    });
  });

  test('keeps direct Layer 1 React, Zustand, and React Three Fiber imports at zero', () => {
    const { layerOneForbiddenExternalEdges } = collectArchitectureDebt();

    expect(layerOneForbiddenExternalEdges).toEqual([]);
  });
});
