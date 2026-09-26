import * as fs from 'fs';
import * as path from 'path';

const SRC_ROOT = path.resolve(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const SOURCES = sourceFiles(SRC_ROOT).map((file) => ({
  file: path.relative(SRC_ROOT, file).split(path.sep).join('/'),
  text: fs.readFileSync(file, 'utf8'),
}));

/** Files other than the rule's owner that match the pattern. */
function offenders(pattern: RegExp, owner: string): string[] {
  return SOURCES.filter(({ file, text }) => file !== owner && pattern.test(text)).map(({ file }) => file);
}

test('string ids come from createUniqueId, never from Date.now()', () => {
  expect(offenders(/\$\{Date\.now\(\)|Date\.now\(\)\.toString\(/, 'core/utils/id.ts')).toEqual([]);
});

test('renderer and WebGPU environment checks live only in rendering/webgpu', () => {
  expect(offenders(/\bis(?:WebGPURenderer|WebGPUBackend|WebGLRenderer)\b|\.gpu\b/, 'core/rendering/webgpu.ts')).toEqual([]);
});
