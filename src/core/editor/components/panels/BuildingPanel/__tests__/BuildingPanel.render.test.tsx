import { Profiler } from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { useBuildingStore } from '../../../../../building/stores/buildingStore';
import {
  BUILDING_PLACED_OBJECT_OPTIONS,
  BUILDING_TILE_SHAPE_OPTIONS,
  BUILDING_WALL_KIND_OPTIONS,
  BUILDING_WALL_PRESETS,
  BUILDING_WEATHER_EFFECT_OPTIONS,
} from '../../../../../building/types';
import { useNPCStore } from '../../../../../npc/stores/npcStore';
import { BuildingPanel, type BuildingPanelNPCPanelContext } from '../index';

jest.mock('@react-three/fiber', () => ({ ...jest.requireActual('@react-three/fiber'), Canvas: () => null }));
jest.mock('../flow', () => ({ BrainFlow: () => null }));

// Five seconds of hover-cell changes at 60 Hz.
const HOVER_STEPS = 300;
const hoverAt = (step: number) => ({ x: (step % 20) * 4, y: 0, z: Math.floor(step / 20) * 4 });

function sweepHover(): void {
  for (let step = 0; step < HOVER_STEPS; step++) {
    act(() => useBuildingStore.getState().setHoverPosition(hoverAt(step)));
  }
}

function renderCounted(ui: React.ReactElement): { commits: () => number } {
  let commits = 0;
  render(<Profiler id="building-panel" onRender={() => { commits++; }}>{ui}</Profiler>);
  const settled = commits;
  return { commits: () => commits - settled };
}

describe('BuildingPanel subscriptions', () => {
  beforeAll(() => {
    useBuildingStore.getState().initializeDefaults();
    useNPCStore.getState().initializeDefaults();
  });
  afterEach(() => act(() => {
    useBuildingStore.getState().setHoverPosition(null);
    useBuildingStore.getState().setSelectedPlacedObjectType('none');
  }));

  it.each(['world', 'wall', 'tile', 'block', 'object'] as const)('commits nothing during a hover sweep in %s mode', (mode) => {
    if (mode === 'object') act(() => useBuildingStore.getState().setSelectedPlacedObjectType('billboard'));
    const { commits } = renderCounted(<BuildingPanel forcedEditMode={mode} />);
    sweepHover();
    expect(commits()).toBe(0);
  });

  it('ignores building edits and NPC updates that the open mode does not show', () => {
    const { commits } = renderCounted(<BuildingPanel forcedEditMode="world" />);
    const groupId = useBuildingStore.getState().selectedTileGroupId!;
    act(() => {
      useNPCStore.getState().createInstanceFromTemplate('ally', [0, 0, 0]);
      for (let index = 0; index < 5; index++) {
        useBuildingStore.getState().addTile(groupId, {
          id: `panel-edit-${index}`, tileGroupId: groupId, position: { x: 600 + index * 4, y: 0, z: 600 }, size: 1,
        });
      }
    });
    expect(commits()).toBe(0);
  });

  it('keeps hover updates inside the NPC movement section', () => {
    act(() => useNPCStore.getState().createInstanceFromTemplate('ally', [0, 0, 0]));
    const renderPanel = jest.fn(({ defaultPanel }: BuildingPanelNPCPanelContext) => defaultPanel);
    render(<BuildingPanel forcedEditMode="npc" npcPanel={renderPanel} />);
    const panelRenders = renderPanel.mock.calls.length;
    sweepHover();
    expect(renderPanel).toHaveBeenCalledTimes(panelRenders);
    const last = hoverAt(HOVER_STEPS - 1);
    expect(screen.getByText(`호버 위치: ${last.x.toFixed(1)}, ${last.z.toFixed(1)}`)).toBeTruthy();
  });

  it('sections still drive the store they read', () => {
    const { unmount } = render(<BuildingPanel forcedEditMode="world" />);
    fireEvent.click(screen.getByRole('button', { name: BUILDING_WEATHER_EFFECT_OPTIONS[2]!.labelKo }));
    expect(useBuildingStore.getState().weatherEffect).toBe(BUILDING_WEATHER_EFFECT_OPTIONS[2]!.type);
    unmount();

    const wall = render(<BuildingPanel forcedEditMode="wall" />);
    const preset = BUILDING_WALL_PRESETS[1]!;
    fireEvent.click(screen.getByRole('button', { name: preset.labelKo }));
    expect(useBuildingStore.getState().selectedWallGroupId).toBe(`${preset.id}-walls`);
    fireEvent.click(screen.getByRole('button', { name: BUILDING_WALL_KIND_OPTIONS[1]!.labelKo }));
    expect(useBuildingStore.getState().currentWallKind).toBe(BUILDING_WALL_KIND_OPTIONS[1]!.type);
    wall.unmount();

    const tile = render(<BuildingPanel forcedEditMode="tile" />);
    fireEvent.click(screen.getByRole('button', { name: BUILDING_TILE_SHAPE_OPTIONS[2]!.labelKo }));
    expect(useBuildingStore.getState().currentTileShape).toBe(BUILDING_TILE_SHAPE_OPTIONS[2]!.type);
    const color = tile.container.querySelectorAll<HTMLInputElement>('input[type="color"]');
    fireEvent.change(color[color.length - 1]!, { target: { value: '#123456' } });
    const materialId = useBuildingStore.getState().currentTileMaterialId!;
    expect(useBuildingStore.getState().meshes.get(materialId)?.color).toBe('#123456');
    tile.unmount();

    render(<BuildingPanel forcedEditMode="object" />);
    const model = BUILDING_PLACED_OBJECT_OPTIONS.find((option) => option.type === 'model')!;
    fireEvent.click(screen.getByRole('button', { name: model.labelKo }));
    expect(useBuildingStore.getState().selectedPlacedObjectType).toBe('model');
    expect(screen.getByText('기본 기물 GLB')).toBeTruthy();
  });
});
