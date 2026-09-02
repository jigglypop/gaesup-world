const fs = require('fs');
const path = require('path');

const { parseGlb, buildGlb } = require('./lib/glb.cjs');

const ROOT = path.resolve(__dirname, '..');
const GLTF_DIR = path.join(ROOT, 'public', 'gltf');

const VARIANTS = [
  {
    id: 'blue',
    source: 'ally_cloth.glb',
    output: 'ally_cloth_blue.glb',
    materialColors: {
      white_cloth: '#3b82f6',
      'back.001': '#1e3a8a',
      'badges.002': '#dbeafe',
    },
  },
  {
    id: 'green',
    source: 'ally_cloth.glb',
    output: 'ally_cloth_green.glb',
    materialColors: {
      white_cloth: '#22c55e',
      'back.001': '#166534',
      'badges.002': '#dcfce7',
    },
  },
  {
    id: 'red',
    source: 'ally_cloth.glb',
    output: 'ally_cloth_red.glb',
    materialColors: {
      white_cloth: '#ef4444',
      'back.001': '#7f1d1d',
      'badges.002': '#fee2e2',
    },
  },
];

function hexToFactor(hex) {
  const clean = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b, 1];
}

function recolorGlb(variant) {
  const sourcePath = path.join(GLTF_DIR, variant.source);
  const outputPath = path.join(GLTF_DIR, variant.output);
  const { json, bin } = parseGlb(fs.readFileSync(sourcePath));

  for (const material of json.materials ?? []) {
    const color = variant.materialColors[material.name];
    if (!color) continue;
    material.pbrMetallicRoughness ??= {};
    material.pbrMetallicRoughness.baseColorFactor = hexToFactor(color);
  }

  json.asset ??= { version: '2.0' };
  json.asset.generator = 'gaesup-world local character GLB generator';
  json.extras = {
    ...(json.extras ?? {}),
    gaesup: {
      source: variant.source,
      variant: variant.id,
      generatedBy: 'scripts/generate-local-character-glbs.cjs',
    },
  };

  fs.writeFileSync(outputPath, buildGlb(json, bin));
  return outputPath;
}

const outputs = VARIANTS.map(recolorGlb);
console.log(outputs.map((file) => path.relative(ROOT, file)).join('\n'));
