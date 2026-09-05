const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

if (!process.argv[2]) throw Error('Usage: node scripts/prepare-r3f10-install.cjs <audited-fixture-directory>');
const fixture = path.resolve(process.argv[2]);
const manifest = JSON.parse(fs.readFileSync(path.join(fixture, 'package.json'), 'utf8'));
const fiberRoot = path.join(fixture, 'node_modules/@react-three/fiber');
const fiberVersion = JSON.parse(fs.readFileSync(path.join(fiberRoot, 'package.json'), 'utf8')).version;
assert.equal(fiberVersion, '10.0.0-alpha.4');
const target = 'function invalidate(state, frames = 1, stackFrames = false) {';
const repairLegacyImports = process.argv.includes('--repair-legacy-imports');
const entrypoints = ['dist/index.mjs', 'dist/index.cjs', 'dist/legacy.mjs', 'dist/legacy.cjs', 'dist/webgpu/index.mjs', 'dist/webgpu/index.cjs'];
const patch = entrypoints.map(file => {
  const source = fs.readFileSync(path.join(fiberRoot, file), 'utf8');
  assert.equal(source.split(target).length, 2, `Unexpected invalidate implementation in ${file}`);
  const lines = source.split('\n');
  const edits = new Map([[lines.indexOf(target), target + '\n  if (state && !state.internal.active) return;']]);
  if (repairLegacyImports && file.includes('/legacy.')) {
    const replaceLine = (before, after) => {
      const index = lines.indexOf(before);
      assert.ok(index >= 0 && lines.lastIndexOf(before) === index, `Unexpected legacy code: ${before}`);
      edits.set(index, after);
    };
    if (file.endsWith('.mjs')) {
      const imports = lines.find(line => line.startsWith('import { ') && line.endsWith("from 'three';"));
      assert.ok(imports);
      replaceLine(imports, imports.replace('MeshBasicNodeMaterial, ', '').replace('Node, ', '').replace('NodeUpdateType, ', ''));
    } else {
      replaceLine('  const node = new three.Node("float");', '  const node = new Node("float");');
      replaceLine('  node.updateType = three.NodeUpdateType.OBJECT;', '  node.updateType = NodeUpdateType.OBJECT;');
      replaceLine('  const material = new three.MeshBasicNodeMaterial({', '  const material = new MeshBasicNodeMaterial({');
    }
    replaceLine("    const tsl = await import('three/tsl');", "    const [tsl, nodes] = await Promise.all([import('three/tsl'), import('three/webgpu')]);");
    replaceLine('    tslModule = { uniform: tsl.uniform, nodeObject: tsl.nodeObject };', '    tslModule = { uniform: tsl.uniform, nodeObject: tsl.nodeObject, MeshBasicNodeMaterial: nodes.MeshBasicNodeMaterial, Node: nodes.Node, NodeUpdateType: nodes.NodeUpdateType };');
    replaceLine('function createOcclusionObserverNode(store, uniform) {', 'function createOcclusionObserverNode(store, uniform, Node, NodeUpdateType) {');
    replaceLine('  const { uniform, nodeObject } = tsl;', '  const { uniform, nodeObject, MeshBasicNodeMaterial, Node, NodeUpdateType } = tsl;');
    replaceLine('  const observerNode = nodeObject(createOcclusionObserverNode(store, uniform));', '  const observerNode = nodeObject(createOcclusionObserverNode(store, uniform, Node, NodeUpdateType));');
  }
  let offset = 0;
  const hunks = [...edits].sort(([a], [b]) => a - b).flatMap(([line, replacement]) => {
    const added = replacement.split('\n');
    const hunk = [`@@ -${line + 1},1 +${line + 1 + offset},${added.length} @@`, '-' + lines[line], ...added.map(value => '+' + value)];
    offset += added.length - 1;
    return hunk;
  });
  return [
    `diff --git a/${file} b/${file}`,
    `--- a/${file}`, `+++ b/${file}`,
    ...hunks,
  ].join('\n');
}).join('\n') + '\n';
const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gaesup-r3f10-install-'));
fs.mkdirSync(path.join(outputRoot, 'patches'));
fs.writeFileSync(path.join(outputRoot, 'patches/fiber-inactive-root.patch'), patch);
fs.writeFileSync(path.join(outputRoot, 'package.json'), JSON.stringify({
  private: true,
  dependencies: {
    ...manifest.dependencies,
    '@react-three/rapier': '2.2.0',
    '@react-three/postprocessing': '3.1.1',
  },
  pnpm: { patchedDependencies: { [`@react-three/fiber@${fiberVersion}`]: 'patches/fiber-inactive-root.patch' } },
}, null, 2));
process.stdout.write(JSON.stringify({ outputRoot, entrypoints, fiberVersion, repairLegacyImports }) + '\n');
