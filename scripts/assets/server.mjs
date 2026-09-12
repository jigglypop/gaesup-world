import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import sharp from 'sharp';

import { createImage, resumeImage } from './meshy-images.mjs';
import { CANDIDATE_CATEGORIES, generateCandidate, resumeCandidate, writeJson } from './meshy.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DEFAULT_WORK = path.join(ROOT, '.asset-work');
const CATEGORIES = CANDIDATE_CATEGORIES;
const BLENDER =
  process.env.GAESUP_BLENDER ?? 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe';
const execute = promisify(execFile);
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

function candidateFile(id, work) {
  if (typeof id !== 'string') throw new Error('Invalid candidate ID');
  const [category, slot, extra] = id.split('/');
  if (!CATEGORIES.includes(category) || !['1', '2'].includes(slot) || extra !== undefined)
    throw new Error('Invalid candidate ID');
  return path.join(work, 'candidates', category, `candidate-${slot}.json`);
}

export function createStudioServer({ work = DEFAULT_WORK } = {}) {
  const WORK = work;
  const IMAGES = path.join(WORK, 'images');
  let busy = false;
  return createServer(async (request, response) => {
    const origin = request.headers.origin;
    if (
      !/^127\.0\.0\.1:\d+$/.test(request.headers.host ?? '') ||
      origin !== 'http://127.0.0.1:5188'
    ) {
      response.writeHead(403);
      response.end('Local studio origin required');
      return;
    }
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Cache-Control', 'no-store');
    if (request.method === 'OPTIONS') {
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Asset-Studio');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.writeHead(204);
      response.end();
      return;
    }
    const reply = (value, status = 200) => {
      response.writeHead(status, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(value));
    };
    if (request.headers['x-asset-studio'] !== '1') {
      reply({ error: 'Studio header required' }, 403);
      return;
    }
    const route = request.url;
    if (request.method === 'GET' && route === '/health') {
      reply({ meshy: Boolean(process.env.MESHY_API_KEY), blender: existsSync(BLENDER), busy });
      return;
    }
    try {
      if (request.method === 'GET' && route === '/jobs') {
        await mkdir(IMAGES, { recursive: true });
        const jobs = [];
        for (const file of await readdir(IMAGES))
          if (file.endsWith('.json')) {
            const job = await readJson(path.join(IMAGES, file));
            jobs.push({
              id: job.id,
              kind: 'image',
              state: job.state,
              taskId: job.taskId,
              artifact: job.artifact,
            });
          }
        for (const category of CATEGORIES)
          for (const slot of [1, 2]) {
            const id = `${category}/${slot}`;
            const file = candidateFile(id, WORK);
            if (existsSync(file)) {
              const job = await readJson(file);
              jobs.push({
                id,
                kind: 'model',
                state: job.state,
                taskId: job.taskId,
                artifact: job.artifact,
                blender: job.blender,
              });
            }
          }
        reply(jobs);
        return;
      }
      if (request.method !== 'POST') {
        reply({ error: 'Unknown route' }, 404);
        return;
      }
      if (busy) {
        reply({ error: 'A studio operation is running; refresh jobs before retrying' }, 409);
        return;
      }
      busy = true;
      try {
        let size = 0;
        const chunks = [];
        for await (const chunk of request) {
          size += chunk.length;
          if (size > 14 * 1024 * 1024) throw new Error('Request too large');
          chunks.push(chunk);
        }
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (route === '/image') {
          if (body.confirmPaid !== true) throw new Error('Paid generation confirmation required');
          reply(
            await createImage({
              directory: IMAGES,
              id: body.id,
              prompt: body.prompt,
              apiKey: process.env.MESHY_API_KEY,
            }),
          );
        } else if (route === '/image/resume') {
          reply(
            await resumeImage({
              directory: IMAGES,
              id: body.id,
              apiKey: process.env.MESHY_API_KEY,
            }),
          );
        } else if (route === '/image/read') {
          if (!/^[a-f0-9-]{36}$/.test(body.id)) throw new Error('Invalid image ID');
          const job = await readJson(path.join(IMAGES, `${body.id}.json`));
          if (!/^[a-f0-9]{64}\.png$/.test(job.artifact)) throw new Error('Image not downloaded');
          reply({
            image: `data:image/png;base64,${(await readFile(path.join(IMAGES, job.artifact))).toString('base64')}`,
          });
        } else if (route === '/model') {
          if (
            body.confirmPaid !== true ||
            body.approved !== true ||
            typeof body.reviewer !== 'string' ||
            !body.reviewer.trim()
          )
            throw new Error('Reference approval and paid confirmation required');
          if (!process.env.MESHY_API_KEY) throw new Error('MESHY_API_KEY is required');
          if (!CATEGORIES.includes(body.category) || typeof body.image !== 'string')
            throw new Error('Invalid model request');
          const image = await sharp(Buffer.from(body.image, 'base64'), {
            limitInputPixels: 16777216,
          })
            .png()
            .toBuffer();
          const sha256 = createHash('sha256').update(image).digest('hex');
          await mkdir(IMAGES, { recursive: true });
          const reference = path.join(IMAGES, `${sha256}.png`);
          try {
            await writeFile(reference, image, { flag: 'wx' });
          } catch (error) {
            if (error.code !== 'EEXIST') throw error;
          }
          const file = await generateCandidate({
            directory: path.join(WORK, 'candidates'),
            category: body.category,
            reference,
            approval: { sha256, reviewer: body.reviewer, decision: 'approved' },
            apiKey: process.env.MESHY_API_KEY,
          });
          reply(await readJson(file));
        } else if (route === '/model/resume') {
          reply(
            await resumeCandidate({
              file: candidateFile(body.id, WORK),
              apiKey: process.env.MESHY_API_KEY,
            }),
          );
        } else if (route === '/blender') {
          const file = candidateFile(body.id, WORK);
          const job = await readJson(file);
          if (job.state !== 'downloaded' || !/^[a-f0-9]{64}\.glb$/.test(job.artifact))
            throw new Error('Download candidate first');
          const source = path.join(path.dirname(file), job.artifact);
          if (
            createHash('sha256')
              .update(await readFile(source))
              .digest('hex') !== job.sha256
          )
            throw new Error('Candidate hash changed');
          const output = path.join(WORK, 'blender', randomUUID());
          await execute(
            BLENDER,
            [
              '--background',
              '--python',
              path.join(ROOT, 'scripts/assets/import-candidate.py'),
              '--',
              source,
              output,
            ],
            { timeout: 180000, maxBuffer: 4 * 1024 * 1024, windowsHide: true },
          );
          const inspection = await readJson(path.join(output, 'inspection.json'));
          job.blender = { ...inspection, output: path.relative(WORK, output) };
          await writeJson(file, job);
          reply(job.blender);
        } else {
          reply({ error: 'Unknown route' }, 404);
        }
      } finally {
        busy = false;
      }
    } catch (error) {
      // Child process output and provider response bodies may contain private data.
      reply(
        {
          error: error.cmd
            ? 'Blender import failed; inspect local inputs'
            : String(error.message).replaceAll(process.env.MESHY_API_KEY || '\0', '[redacted]'),
        },
        400,
      );
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createStudioServer().listen(5190, '127.0.0.1', () =>
    process.stdout.write('Asset studio API: http://127.0.0.1:5190\n'),
  );
}
