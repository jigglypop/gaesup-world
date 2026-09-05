const path = require('node:path');
const ts = require('typescript');

if (!process.argv[2]) throw Error('Usage: node scripts/probe-r3f10-types.cjs <isolated-fixture-directory>');
const workspace = path.resolve(__dirname, '..');
const fixture = path.resolve(process.argv[2]);
const configPath = path.join(workspace, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, workspace);
parsed.options.paths = Object.fromEntries(Object.entries(parsed.options.paths).map(([key, values]) =>
  [key, values.map(value => path.resolve(workspace, value))]));
parsed.options.paths['@react-three/fiber'] = [path.join(fixture, 'node_modules/@react-three/fiber/dist/index.d.ts')];
parsed.options.paths['@react-three/drei'] = [path.join(fixture, 'node_modules/@react-three/drei/index.d.ts')];
const host = ts.createCompilerHost(parsed.options);
const getSourceFile = host.getSourceFile.bind(host);
const boundary = path.join(workspace, 'src/core/rendering/legacyDrei.ts');
const legacy = path.join(fixture, 'node_modules/@react-three/drei/legacy/index.js').replaceAll('\\', '/');
host.getSourceFile = (filename, languageVersion, onError, shouldCreateNewSourceFile) =>
  path.resolve(filename) === boundary
    ? ts.createSourceFile(filename, `export { Grid, Line, Text, shaderMaterial } from '${legacy}';`, languageVersion, true)
    : getSourceFile(filename, languageVersion, onError, shouldCreateNewSourceFile);
const program = ts.createProgram(parsed.fileNames, parsed.options, host);
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
process.stdout.write(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCurrentDirectory: ts.sys.getCurrentDirectory, getCanonicalFileName: filename => filename, getNewLine: () => '\n',
}));
process.stdout.write(JSON.stringify({ files: parsed.fileNames.length, diagnostics: diagnostics.length, virtualLegacyBoundary: true }) + '\n');
process.exitCode = diagnostics.length ? 1 : 0;
