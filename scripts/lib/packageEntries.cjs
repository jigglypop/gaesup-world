// Package entries come from package.json `exports`, the one list; the build, the export snapshot and S-H14 derive theirs here.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const EXPORTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).exports;

/** Each JS subpath with its import specifier, build chunk name (the output file) and source file (the emitted types mirror src). */
const PACKAGE_ENTRIES = Object.entries(EXPORTS)
  .filter(([subpath]) => !subpath.endsWith('.css'))
  .map(([subpath, target]) => ({
    subpath,
    specifier: subpath === '.' ? 'gaesup-world' : `gaesup-world/${subpath.slice(2)}`,
    name: path.posix.basename(target.import.default, '.js'),
    source: target.import.types.replace(/^\.\/dist\//, 'src/').replace(/\.d\.ts$/, '.ts'),
  }));

module.exports = { PACKAGE_ENTRIES };
