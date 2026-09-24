import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');

type PackageJson = { files: string[] };

function readPackageFiles(): string[] {
  const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as PackageJson;
  return json.files;
}

function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '(?:.*/)?')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');
  return new RegExp(`^${escaped}$`);
}

function staticPrefix(pattern: string): string {
  const wildcard = pattern.indexOf('*');
  const head = wildcard === -1 ? pattern : pattern.slice(0, wildcard);
  const slash = head.lastIndexOf('/');
  return slash === -1 ? '' : head.slice(0, slash);
}

function listFiles(relativeDir: string): string[] {
  const absolute = path.join(ROOT, relativeDir);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return [relativeDir];
  const out: string[] = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const child = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listFiles(child));
    else out.push(child);
  }
  return out;
}

function markdownLinks(markdown: string): string[] {
  const links: string[] = [];
  const pattern = /\]\(([^)\s]+)\)/g;
  for (let match = pattern.exec(markdown); match; match = pattern.exec(markdown)) {
    const target = match[1];
    if (!target || /^(?:[a-z]+:|#)/i.test(target)) continue;
    links.push(target.split('#')[0] ?? target);
  }
  return links;
}

describe('published package files', () => {
  const sourcePatterns = readPackageFiles().filter((pattern) => !pattern.startsWith('dist/'));

  test.each(sourcePatterns)('"%s" matches at least one tracked file', (pattern) => {
    if (!pattern.includes('*')) {
      expect(fs.existsSync(path.join(ROOT, pattern))).toBe(true);
      return;
    }
    const matcher = patternToRegExp(pattern);
    const candidates = listFiles(staticPrefix(pattern));
    expect(candidates.some((file) => matcher.test(file))).toBe(true);
  });
});

describe('relative markdown links', () => {
  const documents = [
    'README.md',
    'README.ko.md',
    ...listFiles('docs').filter((file) => file.endsWith('.md')),
  ];

  test.each(documents)('%s links only to existing files', (document) => {
    const markdown = fs.readFileSync(path.join(ROOT, document), 'utf8');
    const baseDir = path.dirname(path.join(ROOT, document));
    const missing = markdownLinks(markdown)
      .filter((link) => link.length > 0)
      .filter((link) => !fs.existsSync(path.resolve(baseDir, decodeURIComponent(link))));
    expect(missing).toEqual([]);
  });
});
