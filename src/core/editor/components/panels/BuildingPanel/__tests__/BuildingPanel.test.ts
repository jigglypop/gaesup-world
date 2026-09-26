import * as fs from 'fs';
import * as path from 'path';

import { createBuildingStore } from '../../../../../building/stores/buildingStore';
import type { NPCBrainBlueprint } from '../../../../../npc/types';
import {
  appendNPCBlueprintNode,
  appendNPCConditionNodeWithBranchTemplate,
  createNPCActionNode,
  createNPCConditionNode,
} from '../helpers';
import { createScopedColorMeshConfig } from '../index';
import { applyColorToTile } from '../state';

const BUILDING_PANEL_ENTRY = path.resolve(__dirname, '../index.tsx');

describe('BuildingPanel asset material scoping', () => {
  test('picking a placement color again reuses its mesh; only a new look adds one', () => {
    const store = createBuildingStore();
    store.getState().addMesh({ id: 'floor', color: '#777777' });
    store.setState({ tileGroups: new Map([['g', { id: 'g', name: 'g', floorMeshId: 'floor', tiles: [] }]]), selectedTileGroupId: 'g', selectedTileId: null });
    const count = () => store.getState().meshes.size;
    const before = count();
    applyColorToTile(store, '#ff0000');
    const red = store.getState().currentTileMaterialId;
    applyColorToTile(store, '#ff0000');
    expect(count()).toBe(before + 1);
    applyColorToTile(store, '#0000ff');
    applyColorToTile(store, '#ff0000');
    expect(count()).toBe(before + 2);
    expect(store.getState().currentTileMaterialId).toBe(red);
    expect(store.getState().meshes.get('floor')).toEqual({ id: 'floor', color: '#777777' });
  });

  test('creates a scoped color mesh without mutating shared texture fields', () => {
    expect(createScopedColorMeshConfig('tile-1-color', '#ffcc88', {
      id: 'shared-floor',
      color: '#111111',
      mapTextureUrl: '/old.png',
      textureUrl: '/old.png',
      materialParams: { roughness: 0.5, color: '#111111' },
    })).toEqual({
      id: 'tile-1-color',
      color: '#ffcc88',
      material: 'STANDARD',
      materialParams: { roughness: 0.5, color: '#ffcc88' },
    });
  });
});

describe('NPC brain presets', () => {
  test('the quest dialogue preset adds its nodes with distinct ids in one click', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1);
    const blueprint: NPCBrainBlueprint = { id: 'brain', name: 'brain', nodes: [{ id: 'start', type: 'start' }], edges: [] };
    const preset = appendNPCBlueprintNode(
      appendNPCConditionNodeWithBranchTemplate(blueprint, createNPCConditionNode('questStatus')),
      createNPCActionNode('speak', undefined),
    );
    jest.restoreAllMocks();

    const ids = preset.nodes.map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(preset.edges.filter((edge) => edge.source === edge.target)).toEqual([]);
  });
});

describe('BuildingPanel UI extension points', () => {
  test('allows the NPC panel to be disabled or replaced', () => {
    const source = fs.readFileSync(BUILDING_PANEL_ENTRY, 'utf8');

    expect(source).toContain('npcPanel?: BuildingPanelNPCPanelRenderer | false');
    expect(source).toContain('const hasNPCPanel = npcPanel !== false');
    expect(source).toContain("if (!hasNPCPanel) return");
    expect(source).toContain("npcPanel({ editMode: 'npc', layout: npcLayout, defaultPanel })");
  });

  test('커스텀 타일 텍스처를 이미지 드롭과 파일 선택으로 받을 수 있다', () => {
    const source = fs.readFileSync(BUILDING_PANEL_ENTRY, 'utf8');

    expect(source).toContain('handleCustomTileTextureDrop');
    expect(source).toContain('URL.createObjectURL(file)');
    expect(source).toContain('accept="image/*"');
    expect(source).toContain('className="building-panel__texture-dropzone"');
  });
});
