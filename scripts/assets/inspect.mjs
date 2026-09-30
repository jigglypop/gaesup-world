// Figure inspection with the engine's loader and checks, plus an optional Blender review sheet.
import { spawnSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';
import { Texture } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { inspection } from './contract.mjs';

const RENDER_SCRIPT = fileURLToPath(new URL('./render-figure.py', import.meta.url));

/**
 * Parses a GLB as the engine's loader does. Node has no image decoder, so each texture carries only the size its
 * header gives, which is all the inspection reads.
 */
export function loadGlb(bytes) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  loader.register((parser) => {
    parser.loadImageSource = async (index) => {
      const image = parser.json.images[index];
      if (image.bufferView === undefined) return new Texture();
      const data = await parser.getDependency('bufferView', image.bufferView);
      const { width, height } = await sharp(new Uint8Array(data)).metadata();
      return new Texture({ width, height });
    };
    return { name: 'gaesup_image_header' };
  });
  return loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
}

export async function inspectFile(file) {
  const bytes = await readFile(file);
  const { scene, animations } = await loadGlb(bytes);
  return inspection.inspectFigure(scene, animations, { bytes: bytes.length });
}

export function formatReport(file, report) {
  const { stats } = report;
  const megabytes = (bytes) => `${((bytes ?? 0) / 1e6).toFixed(2)} MB`;
  const drop = (value) => (value === null ? '-' : value.toFixed(2));
  const lines = [
    `${report.verdict === 'pass' ? 'PASS' : 'FAIL'} ${path.basename(file)}  ${megabytes(stats.bytes)}, ${stats.triangles} tris, ` +
      `texture ${stats.maxTextureSize}px (${megabytes(stats.textureBytes)} GPU), ${report.height.toFixed(2)} m, ` +
      `hips weight ${Math.round(report.hipsWeightShare * 100)}%, facing ${report.facingYaw === null ? '-' : Math.round(report.facingYaw)}°`,
  ];
  const clips = report.clips.map((clip) => `${clip.name}${clip.moving ? '' : '(still)'} arms ${clip.armDrop.map(drop).join('/')}`);
  if (clips.length) lines.push(`     clips: ${clips.join('; ')}`);
  for (const issue of report.issues) lines.push(`     ${issue.severity} ${issue.code}: ${issue.message}`);
  return lines.join('\n');
}

/** One strip per figure: front, side, back, then three moments of every clip. */
async function composeSheet(out, name, files) {
  const tile = { width: 180, height: 240 };
  const tiles = await Promise.all(
    files.map((file) => sharp(path.join(out, file)).resize(tile.width, tile.height).png().toBuffer()),
  );
  const sheet = path.join(out, `${name}-sheet.png`);
  await sharp({ create: { width: tile.width * tiles.length, height: tile.height, channels: 3, background: '#20242a' } })
    .composite(tiles.map((input, index) => ({ input, left: index * tile.width, top: 0 })))
    .png()
    .toFile(sheet);
  return sheet;
}

/** Renders every figure in Blender (`blender` is its executable) and returns one review sheet per figure. */
export async function renderSheets(files, out, blender) {
  await mkdir(out, { recursive: true });
  const run = spawnSync(
    blender,
    ['--background', '--factory-startup', '--python', RENDER_SCRIPT, '--', out, ...files.map((file) => path.resolve(file))],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 30 * 60_000 },
  );
  const rendered = (run.stdout ?? '')
    .split('\n')
    .filter((line) => line.startsWith('RENDERED '))
    .map((line) => JSON.parse(line.slice('RENDERED '.length)));
  if (rendered.length < files.length) {
    const detail = (run.stderr || run.stdout || run.error?.message || '').slice(-2000);
    throw new Error(`Blender rendered ${rendered.length} of ${files.length} figures; set GAESUP_BLENDER\n${detail}`);
  }
  return Promise.all(rendered.map(({ name, files: renders }) => composeSheet(out, name, renders)));
}
