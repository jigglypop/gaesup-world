import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const destination = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/texture/forest-ground');
const id = 'aerial_grass_rock';
const response = await fetch(`https://api.polyhaven.com/files/${id}`);
if (!response.ok) throw new Error(`Source API: ${response.status}`);
const sourceFiles = await response.json();
await mkdir(destination, { recursive: true });
const files = [];
for (const [channel, name] of [['Diffuse', 'color'], ['nor_gl', 'normal']]) {
  const source = sourceFiles[channel]['1k'].jpg;
  const url = new URL(source.url);
  if (url.hostname !== 'dl.polyhaven.org') throw new Error('Unexpected download host');
  const target = path.join(destination, `${name}.jpg`);
  let bytes;
  try { bytes = await readFile(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!bytes) {
    const download = await fetch(url);
    if (!download.ok) throw new Error(`Download: ${download.status}`);
    bytes = Buffer.from(await download.arrayBuffer());
  }
  if (createHash('md5').update(bytes).digest('hex') !== source.md5 || bytes.length !== source.size) throw new Error('Source integrity mismatch');
  await writeFile(target, bytes);
  files.push({ path: `${name}.jpg`, url: url.href, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length });
}
await writeFile(path.join(destination, 'manifest.json'), JSON.stringify({
  status: 'reference-unapproved', source: `https://polyhaven.com/a/${id}`, author: 'Rob Tuytel',
  license: 'CC0-1.0', licenseUrl: 'https://polyhaven.com/license', widthMeters: 15, files,
}, null, 2));
console.log(JSON.stringify(files, null, 2));
