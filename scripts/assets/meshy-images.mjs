import { createHash } from 'node:crypto';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import { writeJson } from './meshy.mjs';

const ENDPOINT = 'https://api.meshy.ai/openapi/v1/text-to-image';

export async function createImage({ directory, id, prompt, apiKey, fetcher = fetch }) {
  if (!apiKey) throw new Error('MESHY_API_KEY is required');
  if (
    !/^[a-f0-9-]{36}$/.test(id) ||
    typeof prompt !== 'string' ||
    !prompt.trim() ||
    prompt.length > 4000
  )
    throw new Error('Invalid image request');
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, `${id}.json`);
  const request = { ai_model: 'nano-banana-2', prompt, aspect_ratio: '1:1' };
  const job = {
    id,
    kind: 'image',
    state: 'submitting',
    request,
    submittedAt: new Date().toISOString(),
  };
  let handle;
  try {
    handle = await open(file, 'wx');
  } catch (error) {
    if (error.code === 'EEXIST') return JSON.parse(await readFile(file, 'utf8'));
    throw error;
  }
  try {
    await handle.writeFile(JSON.stringify(job));
  } finally {
    await handle.close();
  }
  try {
    const response = await fetcher(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw new Error('Submission failed');
    const result = await response.json();
    if (typeof result.result !== 'string' || !result.result) throw new Error('Missing task ID');
    job.taskId = result.result;
    job.state = 'pending';
  } catch {
    job.state = 'uncertain';
  }
  await writeJson(file, job);
  return job;
}

export async function resumeImage({ directory, id, apiKey, fetcher = fetch }) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error('Invalid job ID');
  const file = path.join(directory, `${id}.json`);
  const job = JSON.parse(await readFile(file, 'utf8'));
  if (job.state === 'downloaded') return job;
  if (!apiKey || !job.taskId)
    throw new Error('Key or task ID missing; do not resubmit uncertain jobs');
  const response = await fetcher(`${ENDPOINT}/${encodeURIComponent(job.taskId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Image status HTTP ${response.status}`);
  const result = await response.json();
  job.state = result.status;
  if (result.status === 'SUCCEEDED') {
    const url = new URL(result.image_urls?.[0]);
    if (url.protocol !== 'https:') throw new Error('Image must use HTTPS');
    const download = await fetcher(url, { signal: AbortSignal.timeout(60000) });
    if (!download.ok) throw new Error('Image download failed');
    const chunks = [];
    let size = 0;
    for await (const chunk of download.body) {
      size += chunk.length;
      if (size > 20 * 1024 * 1024) throw new Error('Image exceeds 20MiB');
      chunks.push(chunk);
    }
    const bytes = await sharp(Buffer.concat(chunks), { limitInputPixels: 16777216 })
      .png()
      .toBuffer();
    const hash = createHash('sha256').update(bytes).digest('hex');
    job.artifact = `${hash}.png`;
    job.sha256 = hash;
    job.state = 'downloaded';
    try {
      await writeFile(path.join(directory, job.artifact), bytes, { flag: 'wx' });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  await writeJson(file, job);
  return job;
}
