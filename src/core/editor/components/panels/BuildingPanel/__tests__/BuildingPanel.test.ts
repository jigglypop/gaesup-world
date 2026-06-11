import * as fs from 'fs';
import * as path from 'path';

import { createPlacementAssetScopeId, createScopedColorMeshConfig } from '../index';

const BUILDING_PANEL_ENTRY = path.resolve(__dirname, '../index.tsx');

describe('BuildingPanel asset material scoping', () => {
  test('creates a fresh placement scope for each wall asset application', () => {
    const first = createPlacementAssetScopeId('placement-wall');
    const second = createPlacementAssetScopeId('placement-wall');

    expect(first).toMatch(/^placement-wall-/);
    expect(second).toMatch(/^placement-wall-/);
    expect(first).not.toBe(second);
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
