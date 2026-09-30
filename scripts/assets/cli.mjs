import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { lstat, mkdir, readdir, readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildDelivery, validateDeliveryGlb } from './build.mjs';
import { contract } from './contract.mjs';
import { buildFigureFile } from './figure.mjs';
import { formatReport, inspectFile, renderSheets } from './inspect.mjs';
import { generateCandidate, resumeCandidate, writeJson } from './meshy.mjs';
import { publishAsset } from './publish.mjs';
import { drawViews, generateCharacter, planCharacter } from './tripo.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const WORK = path.join(ROOT, '.asset-work');
// Provider keys come from the environment or the git-ignored .env, never from manifests.
if (existsSync(path.join(ROOT, '.env'))) process.loadEnvFile(path.join(ROOT, '.env'));
const BLENDER =
  process.env.GAESUP_BLENDER ?? 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe';
const [command, ...rest] = process.argv.slice(2);
const FLAGS = new Set(['--matte', '--dilate', '--render', '--dry-run', '--publish', '--json']);
/** Positional arguments, and `--name value` options (`--flag` alone for FLAGS). */
const args = [];
const options = {};
function parseArguments() {
  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index];
    if (!arg.startsWith('--')) args.push(arg);
    else if (FLAGS.has(arg)) options[arg.slice(2)] = true;
    else if (index + 1 < rest.length) options[arg.slice(2)] = rest[++index];
    else throw new Error(`${arg} needs a value`);
  }
}
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));
const required = (index) => {
  if (!args[index]) throw new Error(`Missing argument ${index + 1}`);
  return args[index];
};
const number = (name) => {
  if (options[name] === undefined) return undefined;
  const value = Number(options[name]);
  if (!(value > 0)) throw new Error(`--${name} needs a positive number`);
  return value;
};
const print = (value) => process.stdout.write(`${typeof value === 'string' ? value : JSON.stringify(value, null, 2)}\n`);

/** GLB paths from arguments; a directory stands for the GLBs directly inside it. */
async function glbFiles(paths) {
  const files = [];
  for (const entry of paths) {
    if (!(await stat(entry)).isDirectory()) files.push(entry);
    else for (const name of (await readdir(entry)).sort()) if (name.endsWith('.glb')) files.push(path.join(entry, name));
  }
  return files;
}

/** Inspects figures, prints one PASS/FAIL block each and, with --render, writes Blender review sheets. */
async function inspectFigures(files) {
  const reports = [];
  for (const file of files) {
    const report = await inspectFile(file);
    reports.push(report);
    if (!options.json) print(formatReport(file, report));
  }
  if (options.json) print(files.map((file, index) => ({ file, ...reports[index] })));
  if (options.render) {
    const sheets = await renderSheets(files, path.resolve(options.out ?? path.join(WORK, 'inspection')), BLENDER);
    if (!options.json) print(`sheets: ${sheets.join(', ')}`);
  }
  if (reports.some((report) => report.verdict === 'fail')) process.exitCode = 1;
  return reports;
}

async function inspect(directory) {
  const manifest = await json(path.join(directory, 'manifest.json'));
  const errors = contract.validateAssetManifest(manifest);
  if (errors.length) throw new Error(errors.join(', '));
  const root = await realpath(directory);
  for (const artifact of manifest.artifacts) {
    const absolute = await realpath(path.join(root, artifact.path));
    const relative = path.relative(root, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative))
      throw new Error('Artifact escapes asset directory');
    const data = await readFile(absolute);
    if (
      data.length !== artifact.bytes ||
      createHash('sha256').update(data).digest('hex') !== artifact.sha256
    )
      throw new Error(`Integrity failure: ${artifact.path}`);
    if (artifact.path.endsWith('.glb')) {
      if (
        data.length < 20 ||
        data.toString('ascii', 0, 4) !== 'glTF' ||
        data.readUInt32LE(4) !== 2 ||
        data.readUInt32LE(8) !== data.length
      )
        throw new Error(`Invalid GLB: ${artifact.path}`);
      let offset = 12;
      while (offset < data.length) {
        if (offset + 8 > data.length) throw new Error('Truncated GLB chunk header');
        const length = data.readUInt32LE(offset);
        if (length % 4 || offset + 8 + length > data.length)
          throw new Error('Invalid GLB chunk length');
        offset += 8 + length;
      }
      await validateDeliveryGlb(data);
    }
  }
  return manifest;
}

async function main() {
  parseArguments();
  if (command === 'doctor') {
    const version = spawnSync(BLENDER, ['--background', '--version'], {
      encoding: 'utf8',
      timeout: 15000,
    });
    process.stdout.write(
      JSON.stringify(
        {
          blender:
            version.status === 0
              ? version.stdout.split('\n')[0]
              : 'unavailable; set GAESUP_BLENDER',
          meshyCredentials: Boolean(process.env.MESHY_API_KEY),
          tripoCredentials: Boolean(process.env.TRIPO_API_KEY),
          openaiCredentials: Boolean(process.env.OPENAI_API_KEY),
          blenderMcp: 'not verified: connect through MCP client',
          meshopt: 'available',
          ktx2: 'encoder not configured',
        },
        null,
        2,
      ),
    );
    return;
  }
  if (command === 'generate') {
    const file = await generateCandidate({
      directory: path.join(WORK, 'candidates'),
      category: required(0),
      reference: required(1),
      approval: await json(required(2)),
      apiKey: process.env.MESHY_API_KEY,
    });
    process.stdout.write(`${file}\n`);
    return;
  }
  if (command === 'resume') {
    const job = await resumeCandidate({ file: required(0), apiKey: process.env.MESHY_API_KEY });
    process.stdout.write(JSON.stringify(job, null, 2));
    return;
  }
  if (command === 'build') {
    const source = path.resolve(required(0));
    const output = path.resolve(required(1));
    const specification = await json(required(2));
    await mkdir(output, { recursive: true });
    if ((await lstat(output)).isSymbolicLink()) throw new Error('Output must be a directory');
    const result = spawnSync(
      BLENDER,
      [
        '--background',
        source,
        '--python',
        path.join(ROOT, 'scripts/assets/export.py'),
        '--',
        output,
      ],
      { encoding: 'utf8', timeout: 600000 },
    );
    if (result.status !== 0)
      throw new Error(`Blender export failed: ${result.stderr ?? result.error?.message}`);
    const manifest = await buildDelivery(output, specification);
    process.stdout.write(
      JSON.stringify({ id: manifest.id, version: manifest.version, status: 'draft' }),
    );
    return;
  }
  if (command === 'validate') {
    const manifest = await inspect(required(0));
    process.stdout.write(
      JSON.stringify({
        id: manifest.id,
        integrity: 'passed',
        technicalApproval: 'requires glTF validator and semantic inspection',
      }),
    );
    return;
  }
  if (command === 'approve') {
    const directory = required(0);
    const gate = required(1);
    if (!['provenance', 'technical', 'art', 'browser'].includes(gate))
      throw new Error('Unknown quality gate');
    const manifest = await inspect(directory);
    const evidence = await json(required(2));
    if (evidence.subject !== contract.assetApprovalSubject(manifest))
      throw new Error('Evidence belongs to another manifest revision');
    if (
      !['approved', 'rejected'].includes(evidence.decision) ||
      !evidence.reviewer?.trim() ||
      !Array.isArray(evidence.evidence) ||
      !evidence.evidence.length ||
      !Number.isFinite(Date.parse(evidence.recordedAt))
    )
      throw new Error('Incomplete evidence');
    const file = path.join(directory, 'quality.json');
    let quality;
    try {
      quality = await json(file);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      quality = { browser: [] };
    }
    if (gate === 'browser') quality.browser.push(evidence);
    else quality[gate] = evidence;
    await writeJson(file, quality);
    return;
  }
  if (command === 'publish') {
    await publishAsset(
      path.resolve(required(0)),
      path.join(ROOT, 'public', 'production-assets'),
      inspect,
    );
    return;
  }
  if (command === 'optimize') {
    if (options.preset !== 'figure') throw new Error('optimize needs --preset figure');
    if (options['add-clip'] && !options.from) throw new Error('--add-clip needs --from donor.glb#Clip');
    print(
      await buildFigureFile(required(0), required(1), {
        matte: Boolean(options.matte),
        dilate: Boolean(options.dilate),
        budget: number('budget'),
        texelDensity: number('texel-density'),
        addClip: options['add-clip'] && { name: options['add-clip'], from: options.from, poseRef: options['pose-ref'] },
      }),
    );
    return;
  }
  if (command === 'inspect') {
    await inspectFigures(await glbFiles(args.length ? args : [path.join(ROOT, 'public', 'gltf')]));
    return;
  }
  if (command === 'generate-character') {
    const id = required(0);
    const directory = path.join(WORK, 'characters');
    if (options['dry-run']) {
      print(await planCharacter({ directory, id }));
      return;
    }
    if (options.views !== undefined) {
      const views = await drawViews({ directory, id, description: options.views, style: options.style, apiKey: process.env.OPENAI_API_KEY });
      print({ views, next: 'review the views, then run generate-character again without --views' });
      return;
    }
    const result = await generateCharacter({
      directory,
      id,
      apiKey: process.env.TRIPO_API_KEY,
      log: (line) => process.stdout.write(`${line}\n`),
      inspect: async (file) => (await inspectFigures([file]))[0],
      publish:
        options.publish &&
        (async (file) => {
          const target = path.join(ROOT, 'public', 'gltf', `${id}.glb`);
          await buildFigureFile(file, target, { matte: true });
          if ((await inspectFigures([target]))[0].verdict !== 'pass') throw new Error(`${target} failed inspection`);
          return path.relative(ROOT, target);
        }),
    });
    print({ file: result.file, verdict: result.report.verdict, published: result.published });
    return;
  }
  throw new Error(
    'Usage: cli.mjs doctor | generate <category> <image> <approval.json> | resume <job.json> | build <source.blend> <output> <specification.json> | validate <directory> | approve <directory> <gate> <evidence.json> | publish <directory> | optimize <input.glb> <output.glb> --preset figure [--matte] [--dilate] [--budget n] [--texel-density px/m] [--add-clip idle --from donor.glb#Clip --pose-ref walk] | inspect [glb|directory ...] [--render] [--out dir] [--json] | generate-character <id> [--views "<description>" [--style image]] [--dry-run] [--publish] [--render]',
  );
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
