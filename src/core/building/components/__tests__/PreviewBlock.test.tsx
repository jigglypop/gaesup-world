import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { useBuildingStore } from '../../stores/buildingStore';
import { PreviewBlock } from '../PreviewBlock';

jest.mock('../../stores/buildingStore', () => ({
  useBuildingStore: jest.fn(),
}));

const setStoreState = (state: Record<string, unknown>): void => {
  const mockUseBuildingStore = useBuildingStore as jest.MockedFunction<typeof useBuildingStore>;
  mockUseBuildingStore.mockImplementation(((selector?: (store: Record<string, unknown>) => unknown) =>
    typeof selector === 'function' ? selector(state) : state
  ) as typeof useBuildingStore);
};

describe('PreviewBlock 컴포넌트 테스트', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('블록 모드가 아니면 미리보기를 숨겨야 함', async () => {
    setStoreState({
      editMode: 'tile',
      hoverPosition: { x: 0, y: 0, z: 0 },
      checkBlockPosition: jest.fn(() => false),
      currentTileMultiplier: 1,
      currentTileHeight: 0,
    });
    const renderer = await ReactThreeTestRenderer.create(<PreviewBlock />);
    expect(() => renderer.scene.findByProps({ name: 'preview-block' })).toThrow();
    renderer.unmount();
  });

  test('블록 모드에서 투명 박스 위치와 충돌 검사를 맞춰야 함', async () => {
    const checkBlockPosition = jest.fn(() => false);
    setStoreState({
      editMode: 'block',
      hoverPosition: { x: 0, y: 1, z: 4 },
      checkBlockPosition,
      currentTileMultiplier: 2,
      currentTileHeight: 0,
    });
    const renderer = await ReactThreeTestRenderer.create(<PreviewBlock />);
    const group = renderer.scene.findByProps({ name: 'preview-block' });
    expect(group.props.position).toEqual([2, 1.5, 6]);
    expect(checkBlockPosition).toHaveBeenCalledWith({
      position: { x: 0, y: 1, z: 4 },
      size: { x: 2, y: 1, z: 2 },
    });
    renderer.unmount();
  });
});
