const fs = require('fs');
const path = require('path');

const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(ROOT, 'src');
const DIST_ROOT = path.join(ROOT, 'dist');
const BUILD_TSCONFIG = path.join(ROOT, 'tsconfig.build.json');
const ESM_DECLARATION_SUFFIX = '.d.ts';
const CJS_DECLARATION_SUFFIX = '.d.cts';

function canonicalPath(file) {
  const resolved = path.resolve(file);
  return ts.sys.useCaseSensitiveFileNames ? resolved : resolved.toLowerCase();
}

function isWithinDirectory(directory, file) {
  const relative = path.relative(directory, file);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function collectFiles(directory, suffix) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Missing declaration output directory: ${directory}`);
  }

  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(file, suffix));
    } else if (entry.isFile() && entry.name.endsWith(suffix)) {
      files.push(file);
    }
  }

  return files.sort();
}

function loadBuildConfig() {
  const readResult = ts.readConfigFile(BUILD_TSCONFIG, ts.sys.readFile);
  if (readResult.error) {
    throw new Error(ts.flattenDiagnosticMessageText(readResult.error.messageText, '\n'));
  }

  return ts.parseJsonConfigFileContent(readResult.config, ts.sys, ROOT);
}

function toDeclarationPath(sourceFile) {
  const relativeSource = path.relative(SRC_ROOT, sourceFile);
  if (relativeSource.startsWith('..') || path.isAbsolute(relativeSource)) return undefined;

  if (relativeSource.endsWith(ESM_DECLARATION_SUFFIX)) {
    return path.join(DIST_ROOT, relativeSource);
  }

  const declarationRelativePath = relativeSource.replace(/\.[cm]?[jt]sx?$/, ESM_DECLARATION_SUFFIX);
  if (declarationRelativePath === relativeSource) return undefined;
  return path.join(DIST_ROOT, declarationRelativePath);
}

function createDeclarationMaps(parsedConfig) {
  const declarationBySource = new Map();
  const sourceByDeclaration = new Map();

  for (const sourceFile of parsedConfig.fileNames) {
    const declarationPath = toDeclarationPath(sourceFile);
    if (!declarationPath) continue;

    const sourceKey = canonicalPath(sourceFile);
    const declarationKey = canonicalPath(declarationPath);
    const existingSource = sourceByDeclaration.get(declarationKey);
    if (existingSource && canonicalPath(existingSource) !== sourceKey) {
      throw new Error(`Multiple source files emit ${declarationPath}`);
    }

    declarationBySource.set(sourceKey, declarationPath);
    sourceByDeclaration.set(declarationKey, sourceFile);
  }

  return { declarationBySource, sourceByDeclaration };
}

function copySourceDeclarations(declarationBySource) {
  for (const [sourceKey, declarationPath] of declarationBySource) {
    if (!sourceKey.endsWith(ESM_DECLARATION_SUFFIX)) continue;

    fs.mkdirSync(path.dirname(declarationPath), { recursive: true });
    fs.copyFileSync(sourceKey, declarationPath);
  }
}

function collectModuleReferences(sourceFile) {
  const references = [];

  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) {
      references.push({ owner: node, specifier: node.moduleSpecifier });
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      references.push({ owner: node, specifier: node.moduleSpecifier });
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      references.push({ owner: node, specifier: node.moduleReference.expression });
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    ) {
      references.push({ owner: node, specifier: node.argument.literal });
    } else if (ts.isModuleDeclaration(node) && ts.isStringLiteralLike(node.name)) {
      references.push({ owner: node, specifier: node.name });
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      references.push({ owner: node, specifier: node.arguments[0] });
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return references;
}

function isRelativeSpecifier(specifier) {
  return specifier.startsWith('./') || specifier.startsWith('../');
}

function matchesPathPattern(specifier, pattern) {
  const wildcardIndex = pattern.indexOf('*');
  if (wildcardIndex < 0) return specifier === pattern;
  return (
    specifier.startsWith(pattern.slice(0, wildcardIndex)) &&
    specifier.endsWith(pattern.slice(wildcardIndex + 1))
  );
}

function isInternalPathSpecifier(specifier, compilerOptions) {
  return Object.keys(compilerOptions.paths ?? {}).some((pattern) =>
    matchesPathPattern(specifier, pattern),
  );
}

function resolveDeclarationTarget(
  originalSourceFile,
  specifier,
  parsedConfig,
  resolutionCache,
  declarationBySource,
) {
  const resolved = ts.resolveModuleName(
    specifier,
    originalSourceFile,
    parsedConfig.options,
    ts.sys,
    resolutionCache,
  ).resolvedModule;

  if (!resolved) {
    if (
      isRelativeSpecifier(specifier) ||
      isInternalPathSpecifier(specifier, parsedConfig.options)
    ) {
      throw new Error(
        `Unable to resolve declaration module '${specifier}' from ${path.relative(ROOT, originalSourceFile)}`,
      );
    }
    return undefined;
  }

  if (!isWithinDirectory(SRC_ROOT, resolved.resolvedFileName)) return undefined;

  const targetDeclaration = declarationBySource.get(canonicalPath(resolved.resolvedFileName));
  if (!targetDeclaration) {
    throw new Error(
      `Missing declaration target for ${path.relative(ROOT, resolved.resolvedFileName)}`,
    );
  }
  return targetDeclaration;
}

function toRuntimeSpecifier(sourceFile, targetFile, runtimeExtension) {
  let relativeTarget = path
    .relative(path.dirname(sourceFile), targetFile)
    .replace(/\\/g, '/')
    .slice(0, -ESM_DECLARATION_SUFFIX.length);
  if (!relativeTarget.startsWith('.')) relativeTarget = `./${relativeTarget}`;
  return `${relativeTarget}${runtimeExtension}`;
}

function getStatementRemovalEnd(source, statement) {
  const end = statement.getEnd();
  if (source.slice(end, end + 2) === '\r\n') return end + 2;
  if (source[end] === '\n') return end + 1;
  return end;
}

function rewriteDeclarationSource(
  declarationPath,
  originalSourceFile,
  source,
  runtimeExtension,
  parsedConfig,
  resolutionCache,
  declarationBySource,
) {
  const sourceAst = ts.createSourceFile(
    declarationPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const replacements = [];

  for (const reference of collectModuleReferences(sourceAst)) {
    if (
      ts.isImportDeclaration(reference.owner) &&
      reference.owner.importClause === undefined &&
      reference.specifier.text.endsWith('.css')
    ) {
      replacements.push({
        start: reference.owner.getStart(sourceAst),
        end: getStatementRemovalEnd(source, reference.owner),
        value: '',
      });
      continue;
    }

    const targetFile = resolveDeclarationTarget(
      originalSourceFile,
      reference.specifier.text,
      parsedConfig,
      resolutionCache,
      declarationBySource,
    );
    if (!targetFile) continue;

    replacements.push({
      start: reference.specifier.getStart(sourceAst) + 1,
      end: reference.specifier.getEnd() - 1,
      value: toRuntimeSpecifier(declarationPath, targetFile, runtimeExtension),
    });
  }

  return replacements
    .sort((left, right) => right.start - left.start)
    .reduce(
      (result, replacement) =>
        `${result.slice(0, replacement.start)}${replacement.value}${result.slice(replacement.end)}`,
      source,
    );
}

function toCjsDeclarationPath(esmDeclarationPath) {
  return `${esmDeclarationPath.slice(0, -ESM_DECLARATION_SUFFIX.length)}${CJS_DECLARATION_SUFFIX}`;
}

function getDeclarationGraphKey(declarationPath, suffix) {
  return path.relative(DIST_ROOT, declarationPath).replace(/\\/g, '/').slice(0, -suffix.length);
}

function assertDeclarationFile(declarationPath, runtimeExtension, declarationSuffix, parsedConfig) {
  const source = fs.readFileSync(declarationPath, 'utf8');
  const sourceAst = ts.createSourceFile(
    declarationPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  for (const reference of collectModuleReferences(sourceAst)) {
    const specifier = reference.specifier.text;
    if (specifier.endsWith('.css')) {
      throw new Error(
        `CSS import remained in declaration graph: ${path.relative(DIST_ROOT, declarationPath)}`,
      );
    }
    if (isInternalPathSpecifier(specifier, parsedConfig.options)) {
      throw new Error(
        `Private path alias remained in declaration graph: ${specifier} from ${path.relative(DIST_ROOT, declarationPath)}`,
      );
    }
    if (!isRelativeSpecifier(specifier)) continue;
    if (!specifier.endsWith(runtimeExtension)) {
      throw new Error(
        `Declaration module lacks ${runtimeExtension} extension: ${specifier} from ${path.relative(DIST_ROOT, declarationPath)}`,
      );
    }

    const targetDeclaration = path.resolve(
      path.dirname(declarationPath),
      `${specifier.slice(0, -runtimeExtension.length)}${declarationSuffix}`,
    );
    if (!fs.existsSync(targetDeclaration)) {
      throw new Error(
        `Declaration module target is missing: ${specifier} from ${path.relative(DIST_ROOT, declarationPath)}`,
      );
    }
  }
}

function assertDeclarationGraph(esmDeclarationPaths, parsedConfig) {
  const cjsDeclarationPaths = collectFiles(DIST_ROOT, CJS_DECLARATION_SUFFIX);
  const esmGraph = new Set(
    esmDeclarationPaths.map((file) => getDeclarationGraphKey(file, ESM_DECLARATION_SUFFIX)),
  );
  const cjsGraph = new Set(
    cjsDeclarationPaths.map((file) => getDeclarationGraphKey(file, CJS_DECLARATION_SUFFIX)),
  );
  const missingCjs = [...esmGraph].filter((key) => !cjsGraph.has(key));
  const extraCjs = [...cjsGraph].filter((key) => !esmGraph.has(key));
  if (missingCjs.length > 0 || extraCjs.length > 0) {
    throw new Error(
      [
        'ESM and CJS declaration graphs do not match.',
        ...missingCjs.map((key) => `Missing CJS declaration: ${key}`),
        ...extraCjs.map((key) => `Unexpected CJS declaration: ${key}`),
      ].join('\n'),
    );
  }

  for (const declarationPath of esmDeclarationPaths) {
    assertDeclarationFile(declarationPath, '.js', ESM_DECLARATION_SUFFIX, parsedConfig);
  }
  for (const declarationPath of cjsDeclarationPaths) {
    assertDeclarationFile(declarationPath, '.cjs', CJS_DECLARATION_SUFFIX, parsedConfig);
  }
}

function main() {
  const parsedConfig = loadBuildConfig();
  const { declarationBySource, sourceByDeclaration } = createDeclarationMaps(parsedConfig);
  copySourceDeclarations(declarationBySource);

  const declarationPaths = collectFiles(DIST_ROOT, ESM_DECLARATION_SUFFIX);
  if (declarationPaths.length === 0) {
    throw new Error(`No declaration files found in ${DIST_ROOT}`);
  }

  for (const staleDeclaration of collectFiles(DIST_ROOT, CJS_DECLARATION_SUFFIX)) {
    fs.rmSync(staleDeclaration);
  }

  const declarationSources = new Map(
    declarationPaths.map((file) => [file, fs.readFileSync(file, 'utf8')]),
  );
  const resolutionCache = ts.createModuleResolutionCache(ROOT, canonicalPath, parsedConfig.options);

  for (const declarationPath of declarationPaths) {
    const source = declarationSources.get(declarationPath);
    const originalSourceFile = sourceByDeclaration.get(canonicalPath(declarationPath));
    if (source === undefined || !originalSourceFile) {
      throw new Error(`Missing declaration source: ${declarationPath}`);
    }

    fs.writeFileSync(
      declarationPath,
      rewriteDeclarationSource(
        declarationPath,
        originalSourceFile,
        source,
        '.js',
        parsedConfig,
        resolutionCache,
        declarationBySource,
      ),
    );
    fs.writeFileSync(
      toCjsDeclarationPath(declarationPath),
      rewriteDeclarationSource(
        declarationPath,
        originalSourceFile,
        source,
        '.cjs',
        parsedConfig,
        resolutionCache,
        declarationBySource,
      ),
    );
  }

  assertDeclarationGraph(declarationPaths, parsedConfig);
}

main();
