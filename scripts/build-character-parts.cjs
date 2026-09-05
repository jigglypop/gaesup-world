const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const {
  parseGlb,
  readSkinJointNames,
  readBindPoseHash,
  compareSkeletons,
} = require('./lib/glb.cjs');

const ROOT = path.resolve(__dirname, '..');
const BLENDER_SCRIPT = path.join(__dirname, 'blender', 'gaesup_parts.py');
const BODY_GLB = path.join(ROOT, 'public', 'gltf', 'ally_body.glb');
const OUTPUT_DIR = path.join(ROOT, 'public', 'gltf', 'parts');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const URL_PREFIX = 'gltf/parts';
const INSPECT_MARKER = 'GAESUP_INSPECT_JSON:';
const RESULT_MARKER = 'GAESUP_RESULT_JSON:';
const BLENDER_TIMEOUT_MS = 10 * 60 * 1000;
const WINDOWS_BLENDER_ROOT = 'C:\\Program Files\\Blender Foundation';

function resolveBlender() {
  if (process.env.GAESUP_BLENDER) return process.env.GAESUP_BLENDER;
  if (process.platform === 'win32' && fs.existsSync(WINDOWS_BLENDER_ROOT)) {
    const candidates = fs
      .readdirSync(WINDOWS_BLENDER_ROOT)
      .filter((name) => /^Blender \d/.test(name))
      .sort()
      .reverse()
      .map((name) => path.join(WINDOWS_BLENDER_ROOT, name, 'blender.exe'))
      .filter((file) => fs.existsSync(file));
    if (candidates[0]) return candidates[0];
  }
  return 'blender';
}

function runBlender(extraArgs) {
  const blender = resolveBlender();
  const args = [
    '--background',
    '--factory-startup',
    '--python',
    BLENDER_SCRIPT,
    '--',
    '--body',
    BODY_GLB,
    '--out',
    OUTPUT_DIR,
    '--manifest',
    MANIFEST_PATH,
    '--url-prefix',
    URL_PREFIX,
    ...extraArgs,
  ];
  const result = spawnSync(blender, args, { encoding: 'utf8', timeout: BLENDER_TIMEOUT_MS });
  if (result.error) {
    throw new Error(
      `[build-character-parts Error]: cannot launch Blender (${blender}). Set GAESUP_BLENDER to blender.exe. ${result.error.message}`,
    );
  }
  const stdout = result.stdout ?? '';
  if (result.status !== 0) {
    throw new Error(
      `[build-character-parts Error]: Blender exited with ${result.status}\n${stdout}\n${result.stderr ?? ''}`,
    );
  }
  return stdout;
}

function extractMarker(stdout, marker) {
  const line = stdout.split(/\r?\n/).find((entry) => entry.startsWith(marker));
  if (!line) throw new Error(`[build-character-parts Error]: Blender output lacks ${marker}`);
  return JSON.parse(line.slice(marker.length));
}

function validateManifest() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const body = parseGlb(fs.readFileSync(BODY_GLB));
  const bodyJoints = readSkinJointNames(body);
  if (!bodyJoints) throw new Error('[build-character-parts Error]: body GLB has no skin');
  const bodyHash = readBindPoseHash(body);
  const problems = [];
  for (const part of manifest.parts) {
    const filePath = path.join(OUTPUT_DIR, part.file);
    const glb = parseGlb(fs.readFileSync(filePath));
    const joints = readSkinJointNames(glb);
    const meshCount = glb.json.meshes?.length ?? 0;
    if (!joints) {
      problems.push(`${part.file}: no skin exported`);
      continue;
    }
    if (meshCount !== 1) problems.push(`${part.file}: expected 1 mesh, found ${meshCount}`);
    const report = compareSkeletons(joints, bodyJoints);
    part.compatibility = report.compatibility;
    part.jointCount = joints.length;
    part.fileSize = fs.statSync(filePath).size;
    if (report.compatibility === 'identical' && bodyHash) part.bindPoseHash = bodyHash;
    if (report.compatibility === 'incompatible') {
      problems.push(
        `${part.file}: incompatible skeleton, missing ${report.missingBones.join(', ')}`,
      );
    }
  }
  manifest.body.bindPoseHash = bodyHash;
  manifest.body.jointCount = bodyJoints.length;
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  if (problems.length > 0) {
    throw new Error(`[build-character-parts Error]: validation failed\n${problems.join('\n')}`);
  }
  return manifest;
}

function main() {
  const inspect = process.argv.includes('--inspect');
  if (!fs.existsSync(BODY_GLB)) {
    throw new Error(
      `[build-character-parts Error]: missing body GLB ${path.relative(ROOT, BODY_GLB)}`,
    );
  }
  if (inspect) {
    const stdout = runBlender(['--inspect']);
    console.log(JSON.stringify(extractMarker(stdout, INSPECT_MARKER), null, 2));
    return;
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const stdout = runBlender([]);
  extractMarker(stdout, RESULT_MARKER);
  const manifest = validateManifest();
  for (const part of manifest.parts) {
    console.log(
      `${part.url} slot=${part.slot} joints=${part.jointCount} compat=${part.compatibility} bytes=${part.fileSize} bones=${part.bones.join(',')} bounds=${JSON.stringify(part.bounds)}`,
    );
  }
  console.log(
    `manifest ${path.relative(ROOT, MANIFEST_PATH)} body bindPoseHash=${manifest.body.bindPoseHash}`,
  );
}

main();
