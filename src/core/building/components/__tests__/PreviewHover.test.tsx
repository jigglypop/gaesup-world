import ReactThreeTestRenderer from '@react-three/test-renderer';

import * as placement from '../../model/placement';
import { useBuildingStore } from '../../stores/buildingStore';
import { PreviewBlock } from '../PreviewBlock';
import { PreviewTile } from '../PreviewTile';

const { act } = ReactThreeTestRenderer;
const ORIGIN = 1200;
const OCCUPIED_COLOR = '#f3b95f';

function hover(x: number, z: number): Promise<void> {
  return act(async () => useBuildingStore.getState().setHoverPosition({ x: ORIGIN + x, y: 0, z: ORIGIN + z }));
}

function addTile(id: string, x: number, z: number): Promise<void> {
  const groupId = useBuildingStore.getState().selectedTileGroupId!;
  return act(async () => useBuildingStore.getState().addTile(groupId, {
    id, tileGroupId: groupId, position: { x: ORIGIN + x, y: 0, z: ORIGIN + z }, size: 1,
  }));
}

describe('placement preview hover', () => {
  beforeAll(() => useBuildingStore.getState().initializeDefaults());
  afterEach(() => {
    jest.restoreAllMocks();
    useBuildingStore.getState().setHoverPosition(null);
    useBuildingStore.getState().setEditMode('none');
  });

  it('never builds a placement engine during a hover sweep with edits', async () => {
    const engines = jest.spyOn(placement, 'createBuildingPlacementEngine');
    const renderer = await ReactThreeTestRenderer.create(<><PreviewTile /><PreviewBlock /></>);
    try {
      for (const mode of ['tile', 'block'] as const) {
        await act(async () => useBuildingStore.getState().setEditMode(mode));
        for (let step = 0; step < 60; step++) {
          await hover((step % 6) * 4, Math.floor(step / 6) * 4);
          if (step % 20 === 19) await addTile(`sweep-${mode}-${step}`, 40 + step * 4, 0);
        }
      }
      expect(engines).not.toHaveBeenCalled();
    } finally {
      renderer.unmount();
    }
  });

  it('checks once per hovered cell and data change and reflects occupancy', async () => {
    await act(async () => useBuildingStore.getState().setEditMode('tile'));
    const checkTilePosition = jest.fn(useBuildingStore.getState().checkTilePosition);
    const original = useBuildingStore.getState().checkTilePosition;
    useBuildingStore.setState({ checkTilePosition });
    const renderer = await ReactThreeTestRenderer.create(<PreviewTile />);
    const color = () => renderer.scene.findAllByType('MeshStandardMaterial')[0]!.props['color'];
    try {
      await hover(200, 200);
      expect(color()).not.toBe(OCCUPIED_COLOR);
      const checks = checkTilePosition.mock.calls.length;
      await hover(200.6, 199.4);
      await act(async () => useBuildingStore.getState().setTileRotation(Math.PI / 2));
      expect(checkTilePosition).toHaveBeenCalledTimes(checks);
      await addTile('occupied-probe', 200, 200);
      expect(checkTilePosition).toHaveBeenCalledTimes(checks + 1);
      expect(color()).toBe(OCCUPIED_COLOR);
      await hover(204, 200);
      expect(checkTilePosition).toHaveBeenCalledTimes(checks + 2);
      expect(color()).not.toBe(OCCUPIED_COLOR);
    } finally {
      renderer.unmount();
      useBuildingStore.setState({ checkTilePosition: original });
      useBuildingStore.getState().setTileRotation(0);
    }
  });
});
