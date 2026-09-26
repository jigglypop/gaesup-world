import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createNPCStore } from '../npcStore';

function readGlbJson(url: string): { extensionsUsed?: string[]; animations?: { name: string }[]; bytes: number } {
  const bytes = readFileSync(resolve(process.cwd(), 'public', url.replace(/^\//, '')));
  expect(bytes.readUInt32LE(0)).toBe(0x46546c67);
  const length = bytes.readUInt32LE(12);
  return { ...JSON.parse(bytes.subarray(20, 20 + length).toString('utf8')), bytes: bytes.length };
}

test('default templates draw shipped, compressed models with the locomotion clips NPCs request', () => {
  const store = createNPCStore();
  store.getState().initializeDefaults();
  const templates = [...store.getState().templates.values()];
  expect(templates.length).toBeGreaterThan(0);
  for (const template of templates) {
    const glb = readGlbJson(template.fullModelUrl!);
    expect(glb.extensionsUsed).toEqual(expect.arrayContaining(['EXT_meshopt_compression', 'EXT_texture_webp']));
    expect(glb.bytes).toBeLessThan(3 * 1024 * 1024);
    expect(glb.animations?.map((clip) => clip.name)).toEqual(expect.arrayContaining(['idle', 'walk', 'run']));
  }
});

test('a save that names removed ally parts loads with a default model and without those parts', () => {
  const store = createNPCStore();
  store.getState().initializeDefaults();
  store.setState((state) => ({
    templates: new Map(state.templates).set('ally', {
      id: 'ally', name: '올춘삼', category: 'humanoid', clothingParts: [],
      baseParts: [{ id: 'ally-body', type: 'body', url: '/gltf/ally_body.glb' }],
    }),
    clothingSets: new Map(state.clothingSets).set('rabbit-outfit', {
      id: 'rabbit-outfit', name: '토끼옷', category: 'casual', parts: [{ id: 'rabbit-cloth', type: 'top', url: 'gltf/ally_cloth_rabbit.glb' }],
    }),
    clothingCategories: new Map(state.clothingCategories).set('basic', { id: 'basic', name: '기본 의상', clothingSetIds: ['rabbit-outfit'] }),
  }));

  store.getState().initializeDefaults();

  const ally = store.getState().templates.get('ally')!;
  expect(ally.baseParts).toEqual([]);
  expect(ally.fullModelUrl).toBe('/gltf/trainer_green.glb');
  expect(store.getState().clothingSets.has('rabbit-outfit')).toBe(false);
  expect(store.getState().clothingCategories.get('basic')?.clothingSetIds).toEqual([]);
});
