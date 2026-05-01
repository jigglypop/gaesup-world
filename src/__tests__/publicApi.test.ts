import * as fs from 'fs';
import * as path from 'path';

const ROOT_ENTRY = path.resolve(__dirname, '../index.ts');

function readRootEntry(): string {
  return fs.readFileSync(ROOT_ENTRY, 'utf8');
}

function expectNamedExport(source: string, name: string): void {
  expect(source).toMatch(new RegExp(`\\b${name}\\b`));
}

describe('public package API', () => {
  test('exports world config and editor shell APIs from the root entry', () => {
    const source = readRootEntry();

    expectNamedExport(source, 'WorldConfigProvider');
    expectNamedExport(source, 'WorldContainer');
    expect(source).toContain("export * from './core/editor'");
  });

  test('exports NPC brain runtime APIs from the root entry', () => {
    const source = readRootEntry();

    [
      'NPCSystem',
      'NPCInstance',
      'createNPCObservation',
      'resolveNPCBrainDecision',
      'registerNPCBrainAdapter',
      'registerNPCBrainBlueprint',
      'compileNPCBrainBlueprint',
    ].forEach((name) => expectNamedExport(source, name));
  });

  test('exports NPC brain public types from the root entry', () => {
    const source = readRootEntry();

    [
      'NPCAction',
      'NPCBrainConfig',
      'NPCBrainBlueprint',
      'NPCObservation',
      'NPCBrainDecision',
      'NPCInstanceData',
    ].forEach((name) => expectNamedExport(source, name));
  });
});
