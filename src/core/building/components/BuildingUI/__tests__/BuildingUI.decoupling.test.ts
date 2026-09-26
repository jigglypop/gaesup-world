import * as fs from 'fs';
import * as path from 'path';

const BUILDING_UI_DIR = path.resolve(__dirname, '..');

/** Every source file of the BuildingUI module, since the component and its sections live in several files. */
function readBuildingUISource(): string {
  return fs.readdirSync(BUILDING_UI_DIR)
    .filter((file) => /\.tsx?$/.test(file))
    .map((file) => fs.readFileSync(path.join(BUILDING_UI_DIR, file), 'utf8'))
    .join('\n');
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
