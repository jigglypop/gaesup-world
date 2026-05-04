import * as fs from 'fs';
import * as path from 'path';

const BUILDING_UI_ENTRY = path.resolve(__dirname, '../index.tsx');

function readBuildingUISource(): string {
  return fs.readFileSync(BUILDING_UI_ENTRY, 'utf8');
}

describe('BuildingUI decoupling', () => {
  test('does not import admin or NPC stores directly', () => {
    const source = readBuildingUISource();

    expect(source).not.toContain('admin/store/authStore');
    expect(source).not.toContain('npc/stores/npcStore');
    expect(source).not.toContain('useAuthStore');
    expect(source).not.toContain('useNPCStore');
  });

  test('exposes app policy and domain UI as optional props', () => {
    const source = readBuildingUISource();

    expect(source).toContain('canEdit?: boolean');
    expect(source).toContain('npcPanel?: BuildingUINPCPanelRenderer | false');
    expect(source).toContain('extensionPanel?: React.ReactNode');
    expect(source).toContain('if (!canEdit)');
    expect(source).toContain('hasNPCPanel');
  });
});
