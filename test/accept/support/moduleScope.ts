import { readFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { ROOT, walkRuntimeImports } from '../../../scripts/lib/importGraph.cjs';

/** Source files of every package entry (vite.config.ts lib entries). */
export const PACKAGE_ENTRIES = [
  'src/index.ts', 'src/admin-entry.ts', 'src/assets.ts', 'src/avatar.ts', 'src/blueprints/editor.ts',
  'src/blueprints/index.ts', 'src/building.ts', 'src/editor.ts', 'src/gameplay.ts', 'src/navigation.ts',
  'src/network.ts', 'src/next.ts', 'src/plugins.ts', 'src/postprocessing.ts', 'src/runtime.ts', 'src/server-contracts.ts',
];

/** Factories whose module-scope result is a global store (RC-4); `lazyStore` and `lazyScopedStore` create on first use. */
const STORE_FACTORIES = new Set(['create', 'createStore', 'createWithEqualityFn']);

export type ModuleScopeEffect = { file: string; line: number; callee: string };
export type ModuleScopeEffects = {
  /** Calls whose result is discarded: registrations, polyfills, global listeners. */
  statementCalls: ModuleScopeEffect[];
  /** Class decorators, evaluated when the module loads. */
  classDecorators: ModuleScopeEffect[];
  /** Stores created at module scope instead of per runtime. */
  globalStores: ModuleScopeEffect[];
  /** Other calls and `new` that run at import; usually pure values, recorded only. */
  otherCalls: ModuleScopeEffect[];
};

function calleeName(expression: ts.Expression): string {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return `${calleeName(expression.expression)}.${expression.name.text}`;
  if (ts.isCallExpression(expression)) return calleeName(expression.expression);
  return expression.getText().slice(0, 40);
}

function unwrap(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (ts.isParenthesizedExpression(current) || ts.isAsExpression(current) || ts.isSatisfiesExpression(current)
    || ts.isNonNullExpression(current) || ts.isAwaitExpression(current) || ts.isVoidExpression(current)) current = current.expression;
  return current;
}

/** What importing `file` runs at module scope, without descending into function bodies. */
export function moduleScopeEffects(file: string): ModuleScopeEffects {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const effects: ModuleScopeEffects = { statementCalls: [], classDecorators: [], globalStores: [], otherCalls: [] };
  const at = (node: ts.Node, callee: string): ModuleScopeEffect => ({
    file: path.relative(ROOT, file).split(path.sep).join('/'),
    line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
    callee,
  });
  const visit = (node: ts.Node): void => {
    if (ts.isFunctionLike(node) || ts.isTypeNode(node)) return;
    if (ts.isClassLike(node)) {
      for (const decorator of ts.getDecorators(node) ?? []) effects.classDecorators.push(at(decorator, `@${calleeName(decorator.expression)}`));
      for (const member of node.members) {
        const isStatic = ts.canHaveModifiers(member) && (ts.getModifiers(member) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword);
        if (isStatic && ts.isPropertyDeclaration(member) && member.initializer) visit(member.initializer);
        if (ts.isClassStaticBlockDeclaration(member)) visit(member.body);
      }
      return;
    }
    if (ts.isCallExpression(node) || ts.isNewExpression(node) || ts.isTaggedTemplateExpression(node)) {
      const callee = calleeName(ts.isTaggedTemplateExpression(node) ? node.tag : node.expression);
      effects.otherCalls.push(at(node, ts.isNewExpression(node) ? `new ${callee}` : callee));
      if (ts.isTaggedTemplateExpression(node)) ts.forEachChild(node.template, visit);
      else node.arguments?.forEach(visit);
      return;
    }
    ts.forEachChild(node, visit);
  };
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement) || ts.isInterfaceDeclaration(statement)
      || ts.isTypeAliasDeclaration(statement)) continue;
    if (ts.isExpressionStatement(statement)) {
      const expression = unwrap(statement.expression);
      if (ts.isCallExpression(expression)) {
        effects.statementCalls.push(at(expression, calleeName(expression.expression)));
        expression.arguments.forEach(visit);
        continue;
      }
    }
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        const initializer = declaration.initializer && unwrap(declaration.initializer);
        if (initializer && ts.isCallExpression(initializer) && STORE_FACTORIES.has(calleeName(initializer.expression))) {
          effects.globalStores.push(at(initializer, calleeName(initializer.expression)));
          continue;
        }
        if (initializer) visit(initializer);
      }
      continue;
    }
    visit(statement);
  }
  return effects;
}

/** Our TypeScript files that importing any package entry evaluates. */
export function packageSourceFiles(): string[] {
  const files = new Set<string>();
  for (const entry of PACKAGE_ENTRIES) {
    for (const file of walkRuntimeImports(entry).keys()) if (/\.tsx?$/.test(file)) files.add(file);
  }
  return [...files].sort();
}
