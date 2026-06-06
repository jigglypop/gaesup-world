const fs = require('fs');
const path = require('path');

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

function align4(value) {
  return (value + 3) & ~3;
}

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

function parseGlb(buffer) {
  if (buffer.toString('utf8', 0, 4) !== 'glTF') {
    throw new Error('Not a binary glTF file');
  }
  const version = buffer.readUInt32LE(4);
  if (version !== 2) {
    throw new Error(`Unsupported glTF version: ${version}`);
  }

  let offset = 12;
  const chunks = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.toString('utf8', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += 8 + length;
  }

  const jsonChunk = chunks.find((chunk) => chunk.type === 'JSON');
  if (!jsonChunk) throw new Error('Missing JSON chunk');
  const binChunk = chunks.find((chunk) => chunk.type === 'BIN\0');
  const json = JSON.parse(jsonChunk.data.toString('utf8').trim());

  return { json, bin: binChunk?.data };
}

function buildGlb(json, bin) {
  const jsonRaw = Buffer.from(JSON.stringify(json));
  const jsonLength = align4(jsonRaw.length);
  const jsonChunk = Buffer.alloc(jsonLength, 0x20);
  jsonRaw.copy(jsonChunk);

  const chunks = [
    { type: 'JSON', data: jsonChunk },
  ];
  if (bin) {
    const binLength = align4(bin.length);
    const binChunk = Buffer.alloc(binLength, 0);
    bin.copy(binChunk);
    chunks.push({ type: 'BIN\0', data: binChunk });
  }

  const totalLength = 12 + chunks.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0);
  const output = Buffer.alloc(totalLength);
  output.write('glTF', 0, 4, 'utf8');
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(totalLength, 8);

  let offset = 12;
  for (const chunk of chunks) {
    output.writeUInt32LE(chunk.data.length, offset);
    output.write(chunk.type, offset + 4, 4, 'utf8');
    chunk.data.copy(output, offset + 8);
    offset += 8 + chunk.data.length;
  }

  return output;
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
