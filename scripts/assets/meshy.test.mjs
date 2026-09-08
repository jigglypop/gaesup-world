import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { generateCandidate, resumeCandidate } from './meshy.mjs';

test('two persistent slots, no POST replay on ambiguous outcomes, and GET-only resume', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gaesup-meshy-test-'));
  try {
    const reference = path.join(directory, 'reference.png');
    const image = Buffer.from('test image fixture');
    await writeFile(reference, image);
    const options = {
      directory,
      reference,
      category: 'sofa',
      apiKey: 'test-secret',
      approval: {
        sha256: createHash('sha256').update(image).digest('hex'),
        decision: 'approved',
        reviewer: 'artist',
      },
    };
    let posts = 0;
    await assert.rejects(
      generateCandidate({
        ...options,
        fetcher: async () => {
          posts++;
          throw new Error('timeout');
        },
      }),
      /uncertain/,
    );
    const file = await generateCandidate({
      ...options,
      fetcher: async () => {
        posts++;
        return Response.json({ result: 'task-2' });
      },
    });
    await assert.rejects(generateCandidate(options), /Two candidate slots/);
    assert.equal(posts, 2);
    const text = await readFile(file, 'utf8');
    assert.ok(!text.includes('test-secret'));
    const result = await resumeCandidate({
      file,
      apiKey: 'test-secret',
      fetcher: async (_url, init) => {
        assert.notEqual(init.method, 'POST');
        return Response.json({ status: 'IN_PROGRESS', progress: 50 });
      },
    });
    assert.equal(result.state, 'IN_PROGRESS');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
