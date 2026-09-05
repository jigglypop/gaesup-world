import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { WARRIOR_BLUEPRINT } from '../warrior';

test('default locomotion clips exist in the shipped warrior body GLB', () => {
  const body = WARRIOR_BLUEPRINT.visuals.parts.find(part => part.type === 'body');
  expect(body).toBeDefined();
  const bytes = readFileSync(resolve(process.cwd(), 'public', body!.url));
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  const jsonLength = bytes.readUInt32LE(12);
  const document = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString('utf8')) as {
    animations: { name: string }[];
  };
  const names = new Set(document.animations.map(animation => animation.name));
  const { idle, walk, run, jump } = WARRIOR_BLUEPRINT.animations;
  for (const configured of [idle, walk, run, jump.start, jump.loop, jump.land]) {
    const candidates = Array.isArray(configured) ? configured : [configured];
    expect(candidates.some(name => names.has(name))).toBe(true);
  }
});
