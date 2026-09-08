import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createImage } from './meshy-images.mjs';
import { createStudioServer } from './server.mjs';

test('image submission persists uncertain results and never repeats the same request ID', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'gaesup-image-'));
  try {
    let calls = 0;
    const input = {
      directory,
      id: randomUUID(),
      prompt: 'test bunny',
      apiKey: 'fake-secret',
      fetcher: async () => {
        calls++;
        throw new Error('timeout');
      },
    };
    assert.equal((await createImage(input)).state, 'uncertain');
    assert.equal((await createImage(input)).state, 'uncertain');
    assert.equal(calls, 1);
    assert.equal(
      (await readFile(path.join(directory, `${input.id}.json`), 'utf8')).includes('fake-secret'),
      false,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('local API rejects foreign origins, unconfirmed generation and invalid paths', async () => {
  const work = await mkdtemp(path.join(os.tmpdir(), 'gaesup-studio-'));
  const server = createStudioServer({ work });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = {
    Origin: 'http://127.0.0.1:5188',
    'X-Asset-Studio': '1',
    'Content-Type': 'application/json',
  };
  try {
    assert.equal(
      (await fetch(`${base}/health`, { headers: { Origin: 'https://evil.invalid' } })).status,
      403,
    );
    assert.equal((await fetch(`${base}/health`, { headers })).status, 200);
    for (const [route, body] of [
      ['/image', { prompt: 'test' }],
      ['/model', {}],
      ['/blender', { id: '../escape' }],
    ]) {
      assert.equal(
        (await fetch(`${base}${route}`, { method: 'POST', headers, body: JSON.stringify(body) }))
          .status,
        400,
      );
    }
    assert.deepEqual(await (await fetch(`${base}/jobs`, { headers })).json(), []);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(work, { recursive: true, force: true });
  }
});

test(
  'installed Blender imports a real GLB and creates blend and preview files',
  {
    skip: !existsSync(
      process.env.GAESUP_BLENDER ??
        'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe',
    ),
  },
  async () => {
    const work = await mkdtemp(path.join(os.tmpdir(), 'gaesup-blender-'));
    const folder = path.join(work, 'candidates', 'table');
    await mkdir(folder, { recursive: true });
    const bytes = await readFile('public/gltf/props/table.glb');
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const artifact = `${sha256}.glb`;
    await writeFile(path.join(folder, artifact), bytes);
    await writeFile(
      path.join(folder, 'candidate-1.json'),
      JSON.stringify({ state: 'downloaded', sha256, artifact }),
    );
    const server = createStudioServer({ work });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/blender`, {
        method: 'POST',
        headers: {
          Origin: 'http://127.0.0.1:5188',
          'X-Asset-Studio': '1',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 'table/1' }),
      });
      const result = await response.json();
      assert.equal(response.status, 200, JSON.stringify(result));
      assert.ok(result.meshes > 0);
      assert.ok(result.triangles > 0);
      assert.ok(existsSync(path.join(work, result.output, 'source.blend')));
      assert.ok(existsSync(path.join(work, result.output, 'preview.glb')));
      assert.equal(result.rigApproval, 'not-validated');
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await rm(work, { recursive: true, force: true });
    }
  },
);
