import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename } from 'node:fs/promises';
import path from 'node:path';

const ENDPOINT = 'https://api.meshy.ai/openapi/v1/image-to-3d';
const CATEGORIES = new Set(['chair', 'table', 'sofa', 'planter', 'tree']);

export async function writeJson(file, value) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  const handle = await open(temporary, 'wx');
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`);
  } finally {
    await handle.close();
  }
  await rename(temporary, file);
}

export async function generateCandidate({
  directory,
  category,
  reference,
  approval,
  apiKey,
  fetcher = fetch,
}) {
  if (!CATEGORIES.has(category)) throw new Error('Unsupported candidate category');
  if (!apiKey) throw new Error('MESHY_API_KEY is required');
  const image = await readFile(reference);
  const hash = createHash('sha256').update(image).digest('hex');
  if (approval.sha256 !== hash || approval.decision !== 'approved' || !approval.reviewer?.trim())
    throw new Error('Reference image needs matching art approval');
  const extension = path.extname(reference).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(extension))
    throw new Error('Reference must be PNG or JPEG');
  const folder = path.join(directory, category);
  await mkdir(folder, { recursive: true });
  let journal;
  let file;
  for (let slot = 1; slot <= 2; slot++) {
    file = path.join(folder, `candidate-${slot}.json`);
    try {
      journal = await open(file, 'wx');
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  if (!journal) throw new Error('Two candidate slots already reserved; resume existing tasks');
  const request = {
    ai_model: 'meshy-7',
    model_type: 'standard',
    should_texture: true,
    enable_pbr: true,
    texture_resolution: '2k',
    should_remesh: false,
    image_enhancement: false,
    target_formats: ['glb'],
  };
  const job = {
    category,
    referenceHash: hash,
    request,
    state: 'submitting',
    submittedAt: new Date().toISOString(),
  };
  try {
    await journal.writeFile(JSON.stringify(job));
  } finally {
    await journal.close();
  }
  try {
    const response = await fetcher(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        image_url: `data:image/${extension === '.png' ? 'png' : 'jpeg'};base64,${image.toString('base64')}`,
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw new Error(`Meshy submission HTTP ${response.status}`);
    const body = await response.json();
    if (typeof body.result !== 'string' || !body.result) throw new Error('Missing Meshy task ID');
    await writeJson(file, { ...job, state: 'pending', taskId: body.result });
  } catch {
    await writeJson(file, {
      ...job,
      state: 'uncertain',
      error: 'Submission outcome uncertain. Inspect provider tasks; never automatically resubmit.',
    });
    throw new Error('Meshy submission outcome uncertain; candidate slot retained');
  }
  return file;
}

export async function resumeCandidate({ file, apiKey, fetcher = fetch }) {
  if (!apiKey) throw new Error('MESHY_API_KEY is required');
  const job = JSON.parse(await readFile(file, 'utf8'));
  if (job.state === 'downloaded') return job;
  if (typeof job.taskId !== 'string' || !job.taskId)
    throw new Error('Task ID missing; reconcile uncertain submission before resume');
  const response = await fetcher(`${ENDPOINT}/${encodeURIComponent(job.taskId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new Error(`Meshy status HTTP ${response.status}; resume is safe to retry`);
  const task = await response.json();
  const next = { ...job, state: task.status, progress: task.progress };
  if (task.status === 'SUCCEEDED') {
    const url = new URL(task.model_urls?.glb);
    if (url.protocol !== 'https:') throw new Error('Meshy artifact must use HTTPS');
    const result = await fetcher(url, { signal: AbortSignal.timeout(120000) });
    if (!result.ok) throw new Error(`Artifact download HTTP ${result.status}`);
    const bytes = Buffer.from(await result.arrayBuffer());
    if (
      bytes.toString('ascii', 0, 4) !== 'glTF' ||
      bytes.length < 12 ||
      bytes.readUInt32LE(8) !== bytes.length
    )
      throw new Error('Invalid downloaded GLB');
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const artifact = path.join(path.dirname(file), `${sha256}.glb`);
    try {
      const handle = await open(artifact, 'wx');
      try {
        await handle.writeFile(bytes);
      } finally {
        await handle.close();
      }
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    Object.assign(next, {
      state: 'downloaded',
      artifact: path.basename(artifact),
      sha256,
      bytes: bytes.length,
    });
  }
  await writeJson(file, next);
  return next;
}
