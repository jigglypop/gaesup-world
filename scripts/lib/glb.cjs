const GLB_MAGIC = 'glTF';
const GLB_VERSION = 2;
const HEADER_LENGTH = 12;
const CHUNK_HEADER_LENGTH = 8;
const JSON_CHUNK = 'JSON';
const BIN_CHUNK = 'BIN\0';
const JSON_PAD = 0x20;

function align4(value) {
  return (value + 3) & ~3;
}

function parseGlb(buffer) {
  if (buffer.toString('utf8', 0, 4) !== GLB_MAGIC) {
    throw new Error('[glb Error]: Not a binary glTF file');
  }
  const version = buffer.readUInt32LE(4);
  if (version !== GLB_VERSION) {
    throw new Error(`[glb Error]: Unsupported glTF version: ${version}`);
  }
  let offset = HEADER_LENGTH;
  const chunks = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.toString('utf8', offset + 4, offset + CHUNK_HEADER_LENGTH);
    const data = buffer.subarray(
      offset + CHUNK_HEADER_LENGTH,
      offset + CHUNK_HEADER_LENGTH + length,
    );
    chunks.push({ type, data });
    offset += CHUNK_HEADER_LENGTH + length;
  }
  const jsonChunk = chunks.find((chunk) => chunk.type === JSON_CHUNK);
  if (!jsonChunk) throw new Error('[glb Error]: Missing JSON chunk');
  const binChunk = chunks.find((chunk) => chunk.type === BIN_CHUNK);
  const json = JSON.parse(jsonChunk.data.toString('utf8').trim());
  return { json, bin: binChunk?.data };
}

function buildGlb(json, bin) {
  const jsonRaw = Buffer.from(JSON.stringify(json));
  const jsonChunk = Buffer.alloc(align4(jsonRaw.length), JSON_PAD);
  jsonRaw.copy(jsonChunk);
  const chunks = [{ type: JSON_CHUNK, data: jsonChunk }];
  if (bin) {
    const binChunk = Buffer.alloc(align4(bin.length), 0);
    bin.copy(binChunk);
    chunks.push({ type: BIN_CHUNK, data: binChunk });
  }
  const totalLength =
    HEADER_LENGTH + chunks.reduce((sum, chunk) => sum + CHUNK_HEADER_LENGTH + chunk.data.length, 0);
  const output = Buffer.alloc(totalLength);
  output.write(GLB_MAGIC, 0, 4, 'utf8');
  output.writeUInt32LE(GLB_VERSION, 4);
  output.writeUInt32LE(totalLength, 8);
  let offset = HEADER_LENGTH;
  for (const chunk of chunks) {
    output.writeUInt32LE(chunk.data.length, offset);
    output.write(chunk.type, offset + 4, 4, 'utf8');
    chunk.data.copy(output, offset + CHUNK_HEADER_LENGTH);
    offset += CHUNK_HEADER_LENGTH + chunk.data.length;
  }
  return output;
}

function readAccessorFloat32(glb, accessorIndex) {
  const accessor = glb.json.accessors?.[accessorIndex];
  if (!accessor) throw new Error(`[glb Error]: Missing accessor ${accessorIndex}`);
  const bufferView = glb.json.bufferViews?.[accessor.bufferView];
  if (!bufferView || !glb.bin)
    throw new Error(`[glb Error]: Accessor ${accessorIndex} has no buffer view`);
  const componentCounts = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const count = accessor.count * (componentCounts[accessor.type] ?? 1);
  const start = glb.bin.byteOffset + (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  return new Float32Array(glb.bin.buffer.slice(start, start + count * 4));
}

function readSkinJointNames(glb, skinIndex = 0) {
  const skin = glb.json.skins?.[skinIndex];
  if (!skin) return null;
  return skin.joints.map((nodeIndex) => glb.json.nodes?.[nodeIndex]?.name ?? `node-${nodeIndex}`);
}

const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const HASH_QUANTIZE = 10000;
const HASH_HEX_WIDTH = 8;

function hashBindPose(inverseBindMatrices) {
  let hash = FNV_OFFSET;
  for (const element of inverseBindMatrices) {
    const quantized = Math.round(element * HASH_QUANTIZE);
    hash ^= quantized & 0xff;
    hash = Math.imul(hash, FNV_PRIME);
    hash ^= (quantized >> 8) & 0xff;
    hash = Math.imul(hash, FNV_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(HASH_HEX_WIDTH, '0');
}

function readBindPoseHash(glb, skinIndex = 0) {
  const skin = glb.json.skins?.[skinIndex];
  if (!skin || skin.inverseBindMatrices === undefined) return null;
  return hashBindPose(readAccessorFloat32(glb, skin.inverseBindMatrices));
}

function compareSkeletons(sourceJoints, targetJoints) {
  const targetSet = new Set(targetJoints);
  const missingBones = sourceJoints.filter((name) => !targetSet.has(name));
  const duplicated = new Set(sourceJoints).size !== sourceJoints.length;
  if (missingBones.length > 0 || duplicated) return { compatibility: 'incompatible', missingBones };
  const identical =
    sourceJoints.length === targetJoints.length &&
    sourceJoints.every((name, index) => name === targetJoints[index]);
  return { compatibility: identical ? 'identical' : 'remappable', missingBones };
}

module.exports = {
  parseGlb,
  buildGlb,
  readAccessorFloat32,
  readSkinJointNames,
  readBindPoseHash,
  hashBindPose,
  compareSkeletons,
};
