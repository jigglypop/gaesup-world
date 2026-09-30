// Character figures from reference views, end to end: (OpenAI reference views) → Tripo multiview or single-image
// model → rig check → Mixamo biped rig → one retarget with the engine's clips → engine clip names → inspection →
// figure preset. Every paid task is journaled before it is awaited, so a rerun polls the task it already paid for.
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { createIO } from './build.mjs';
import { inspection } from './contract.mjs';
import { writeJson } from './meshy.mjs';

const TRIPO = process.env.TRIPO_V3_BASE_URL ?? 'https://openapi.tripo3d.ai/v3';
const MODEL = process.env.TRIPO_MODEL_VERSION ?? 'v3.1-20260211';
/** Faces the model starts with; the figure preset simplifies anything past its budget. */
export const FACE_LIMIT = 12_000;
/** Rig v1.0 is biped-only and carries the `preset:biped:*` motions; one retarget returns them in one GLB. */
export const ANIMATIONS = [
  'preset:biped:idle',
  'preset:biped:walk',
  'preset:biped:run',
  'preset:biped:wave_goodbye_01',
  'preset:biped:look_around',
];
/** Engine names of those motions in request order, for clips whose Tripo names say nothing. */
const CLIP_ORDER = ['idle', 'walk', 'run', 'wave', 'look'];
/** Credits per stage: textured model 30, rig check 0, rig 25, 10 per retargeted clip ($1 buys 100). */
export const CREDITS = Object.freeze({ model: 30, rigCheck: 0, rig: 25, retarget: 10 * ANIMATIONS.length });
export const VIEWS = ['front', 'left', 'back', 'right'];
const delay = (ms) => new Promise((done) => setTimeout(done, ms));

export function characterPaths(directory, id) {
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(id)) throw new Error('Character id takes letters, digits, - and _');
  const root = path.join(directory, id);
  return { root, views: path.join(root, 'views'), state: path.join(root, 'state.json') };
}

async function loadState(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { uploads: {}, stages: {} };
  }
}

const viewFiles = (paths) => VIEWS.filter((view) => existsSync(path.join(paths.views, `${view}.png`)));

/** What a run would do, without calling anything: views found, stages left and the credits they cost. */
export async function planCharacter({ directory, id }) {
  const paths = characterPaths(directory, id);
  const state = await loadState(paths.state);
  const stages = Object.keys(CREDITS).filter((stage) => state.stages[stage]?.status !== 'success');
  const credits = stages.reduce((sum, stage) => sum + CREDITS[stage], 0);
  return {
    id,
    views: viewFiles(paths),
    stages,
    uncertain: stages.filter((stage) => state.stages[stage]?.submitting),
    credits,
    dollars: credits / 100,
    inspection: state.inspection?.verdict ?? null,
    published: state.published ?? null,
  };
}

/** One Tripo call. A refusal carries `answered` (no task exists); a lost request may have created one. */
async function tripo(context, route, { body, form } = {}) {
  const response = await context.fetcher(`${TRIPO}${route}`, {
    method: body || form ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${context.apiKey}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: form ?? (body ? JSON.stringify(body) : undefined),
    signal: AbortSignal.timeout(60_000),
  });
  if (response.status === 429) {
    await context.sleep(Number(response.headers.get('retry-after') ?? 10) * 1000);
    return tripo(context, route, { body, form });
  }
  const json = await response.json().catch(() => ({}));
  if (response.ok && json.code === 0 && json.data) return json.data;
  const error = new Error(`Tripo ${route}: HTTP ${response.status} ${json.code ?? ''} ${json.message ?? ''}`.trim());
  error.answered = (response.status >= 400 && response.status < 500) || (response.ok && typeof json.code === 'number');
  throw error;
}

/** Polls a task to its end. Output URLs live five minutes, so the caller downloads at once. */
async function wait(context, task, label) {
  const started = Date.now();
  for (;;) {
    const data = await tripo(context, `/tasks/${encodeURIComponent(task)}`);
    if (data.status === 'success') return data.output ?? {};
    if (!['queued', 'running'].includes(data.status))
      throw Object.assign(new Error(`${label} task ${task} ended ${data.status}`), { status: data.status });
    if (Date.now() - started > 20 * 60_000)
      throw new Error(`${label} task ${task} still ${data.status} after 20 minutes; rerun to keep polling`);
    context.log(`${label} ${data.status} ${data.progress ?? 0}%`);
    await context.sleep(4000);
  }
}

async function download(context, url, file) {
  if (new URL(url).protocol !== 'https:') throw new Error('Tripo artifacts must use HTTPS');
  const response = await context.fetcher(url, { signal: AbortSignal.timeout(300_000) });
  if (!response.ok) throw new Error(`Download of ${path.basename(file)}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.toString('ascii', 0, 4) !== 'glTF') throw new Error(`${path.basename(file)} is not a GLB`);
  await writeFile(file, bytes);
}

/**
 * Runs one paid stage once. The submission is journaled before the request and its task id before it is awaited;
 * a submission whose outcome is unknown is never repeated, and a stage whose download failed polls its task again.
 */
async function stage(context, name, create, file) {
  const { state } = context;
  const current = state.stages[name] ?? {};
  if (current.status === 'success' && (!file || existsSync(path.join(context.root, current.file ?? '')))) return current;
  if (current.status && current.status !== 'success')
    throw new Error(`${name} task ${current.task} ended ${current.status}; remove stages.${name} from ${context.stateFile} to pay for another`);
  if (!current.task) {
    if (current.submitting)
      throw new Error(`${name} submission outcome unknown since ${current.submitting}; find the task on Tripo and set stages.${name}.task in ${context.stateFile}`);
    state.stages[name] = { submitting: new Date().toISOString() };
    await context.save();
    try {
      state.stages[name] = { task: await create() };
    } catch (error) {
      if (error.answered) delete state.stages[name];
      await context.save();
      throw error;
    }
    await context.save();
  }
  const entry = state.stages[name];
  try {
    entry.output = await wait(context, entry.task, `${context.id} ${name}`);
  } catch (error) {
    if (error.status) {
      entry.status = error.status;
      await context.save();
    }
    throw error;
  }
  entry.status = 'success';
  if (file) {
    const url = entry.output.model_url ?? entry.output.model ?? entry.output.pbr_model;
    if (typeof url !== 'string') throw new Error(`${name}: no model URL in ${JSON.stringify(entry.output)}`);
    await download(context, url, file);
    entry.file = path.basename(file);
  }
  await context.save();
  return entry;
}

/** Engine clip names from Tripo's clip names, else from the request order. */
export function nameClips(document) {
  document
    .getRoot()
    .listAnimations()
    .forEach((animation, index) => {
      const name = inspection.figureClipName(animation.getName()) ?? CLIP_ORDER[index];
      if (name) animation.setName(name);
    });
}

/**
 * Builds or resumes character `id` from `<directory>/<id>/views/{front,left,back,right}.png` (front required).
 * `inspect(file)` returns a figure report; with `publish(file)`, a passing figure is published and its path kept.
 */
export async function generateCharacter({
  directory,
  id,
  apiKey,
  fetcher = fetch,
  sleep = delay,
  log = () => {},
  inspect,
  publish,
}) {
  if (!apiKey) throw new Error('TRIPO_API_KEY is required');
  const paths = characterPaths(directory, id);
  const views = viewFiles(paths);
  if (!views.includes('front')) throw new Error(`Missing ${path.join(paths.views, 'front.png')}: add views or draw them with --views`);
  await mkdir(paths.root, { recursive: true });
  const state = await loadState(paths.state);
  const context = { id, apiKey, fetcher, sleep, log, state, root: paths.root, stateFile: paths.state };
  context.save = () => writeJson(paths.state, state);
  for (const view of views) {
    if (state.uploads[view]) continue;
    const form = new FormData();
    form.append('file', new Blob([await readFile(path.join(paths.views, `${view}.png`))], { type: 'image/png' }), `${view}.png`);
    state.uploads[view] = (await tripo(context, '/files', { form })).file_token;
    await context.save();
  }
  const file = (name) => path.join(paths.root, name);
  const created = async (route, body) => (await tripo(context, route, { body })).task_id;
  const common = { model: MODEL, texture: true, pbr: true, face_limit: FACE_LIMIT, texture_quality: 'standard' };
  const model = await stage(
    context,
    'model',
    () =>
      views.length === 1
        ? created('/generation/image-to-model', { input: state.uploads.front, ...common })
        : created('/generation/multiview-to-model', { inputs: views.map((view) => ({ [view]: state.uploads[view] })), ...common }),
    file('model.glb'),
  );
  const check = await stage(context, 'rigCheck', () => created('/animations/rig-check', { input: model.task }));
  if (check.output?.riggable === false || (check.output?.rig_type && check.output.rig_type !== 'biped'))
    throw new Error(`${id}: rig check says ${JSON.stringify(check.output)}`);
  const rig = await stage(
    context,
    'rig',
    () => created('/animations/rig', { input: model.task, rig_type: 'biped', spec: 'mixamo', out_format: 'glb' }),
    file('rigged.glb'),
  );
  const animated = await stage(
    context,
    'retarget',
    () =>
      created('/animations/retarget', {
        input: rig.task,
        animations: ANIMATIONS,
        out_format: 'glb',
        bake_animation: true,
        export_with_geometry: true,
        animate_in_place: true,
      }),
    file('animated.glb'),
  );

  // Engine clip names, then the inspection: a failing figure stops here.
  const io = await createIO();
  const document = await io.read(file(animated.file));
  nameClips(document);
  const named = file(`${id}.glb`);
  await writeFile(named, await io.writeBinary(document));
  const report = await inspect(named);
  state.inspection = { verdict: report.verdict, issues: report.issues.map((issue) => `${issue.severity} ${issue.code}`) };
  await context.save();
  if (report.verdict === 'pass' && publish) {
    state.published = await publish(named);
    await context.save();
  }
  return { file: named, report, published: state.published ?? null };
}

const SHEET =
  'Full-body game character reference in a T pose: both arms straight out to the sides, feet slightly apart, ' +
  'plain white background, no text, no shadow on the ground.';

/**
 * Draws the front view from `description` (in the style of the `style` image, if given), then the left, back and
 * right views from that front, so all four show one character. Views already drawn are kept.
 */
export async function drawViews({ directory, id, description, style, apiKey, fetcher = fetch }) {
  if (!apiKey) throw new Error('OPENAI_API_KEY is required');
  const { views } = characterPaths(directory, id);
  await mkdir(views, { recursive: true });
  const model = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1';
  const base = process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1';
  const draw = async (view, prompt, reference) => {
    const file = path.join(views, `${view}.png`);
    if (existsSync(file)) return file;
    const request = { model, prompt, size: '1024x1536', quality: 'high' };
    let init = { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) };
    if (reference) {
      const form = new FormData();
      for (const [key, value] of Object.entries(request)) form.append(key, value);
      const type = /\.jpe?g$/i.test(reference) ? 'image/jpeg' : 'image/png';
      form.append('image[]', new Blob([await readFile(reference)], { type }), path.basename(reference));
      init = { body: form };
    }
    const response = await fetcher(`${base}/images/${reference ? 'edits' : 'generations'}`, {
      method: 'POST',
      ...init,
      headers: { Authorization: `Bearer ${apiKey}`, ...init.headers },
      signal: AbortSignal.timeout(300_000),
    });
    const json = await response.json().catch(() => ({}));
    const image = json.data?.[0]?.b64_json;
    if (!response.ok || !image) throw new Error(`OpenAI ${view} view: HTTP ${response.status} ${json.error?.message ?? ''}`.trim());
    await writeFile(file, Buffer.from(image, 'base64'));
    return file;
  };
  const styled = style ? " Drawn in exactly the reference image's rendering style, proportions and line quality." : '';
  const front = await draw('front', `${SHEET}${styled} Front view, facing the viewer. Character: ${description}`, style);
  const same = 'The same character as the reference image: identical outfit, colours, hair and proportions, same T pose and white background.';
  await draw('left', `${same} Left side view: the character faces the left edge of the image.`, front);
  await draw('back', `${same} Back view: the character faces away from the viewer.`, front);
  await draw('right', `${same} Right side view: the character faces the right edge of the image.`, front);
  return VIEWS.map((view) => path.join(views, `${view}.png`));
}
