import * as fs from 'fs';
import * as path from 'path';

const SRC_ROOT = path.resolve(__dirname, '../../..');
const ID_MODULE = path.resolve(__dirname, '../id.ts');
const TIME_IN_STRING = /\$\{Date\.now\(\)|Date\.now\(\)\.toString\(/;

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

test('string ids come from createUniqueId, never from Date.now()', () => {
  const offenders = sourceFiles(SRC_ROOT)
    .filter((file) => file !== ID_MODULE && TIME_IN_STRING.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(SRC_ROOT, file));
  expect(offenders).toEqual([]);
});
