import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { useGaesupStore } from '../../../stores/gaesupStore';
import { FrameSchedulerHost } from '../../../runtime/frame';
import {
  getDefaultInteractionInputBackend,
  resolveDefaultInteractionSystem,
} from '../../core';
import { Clicker } from '../Clicker';

const playerPosition = new THREE.Vector3();
const pathRenders = jest.fn();
let pathPoints: { current: THREE.Vector3[] | null } = { current: null };

jest.mock('../../../motions/hooks/usePlayerPosition', () => ({
  usePlayerPosition: () => ({ position: playerPosition }),
}));
jest.mock('../Clicker/PathLine', () => ({
  PathLine: (props: { pointsRef: { current: THREE.Vector3[] | null } }) => {
    pathRenders();
    pathPoints = props.pointsRef;
    return null;
  },
}));
jest.mock('../Clicker/TargetMarker', () => ({
  TargetMarker: () => <group name="target-marker" />,
}));

describe('Clicker', () => {
  beforeEach(() => {
    useGaesupStore.getState().resetInteractions();
    resolveDefaultInteractionSystem().reset();
    playerPosition.set(0, 0, 0);
    pathRenders.mockClear();
  });

  test('키보드 입력과 플레이어 이동은 다시 렌더하지 않고 프레임에서 마커와 경로를 갱신한다', async () => {
    const renderer = await ReactThreeTestRenderer.create(<><FrameSchedulerHost /><Clicker /></>);
    const marker = renderer.scene.find((node) => node.instance.name === 'target-marker').instance.parent!;
    const backend = getDefaultInteractionInputBackend();
    const target = new THREE.Vector3(5, 0, 0);

    await ReactThreeTestRenderer.act(async () => {
      backend.updateMouse({ target, isActive: true });
    });
    await renderer.advanceFrames(1, 0.016);
    expect(marker.visible).toBe(true);
    expect(pathPoints.current).toEqual([playerPosition, target]);
    const rendersAfterClick = pathRenders.mock.calls.length;

    await ReactThreeTestRenderer.act(async () => {
      backend.updateKeyboard({ forward: true });
      backend.updateKeyboard({ forward: false });
    });
    playerPosition.set(4.5, 0, 0);
    await renderer.advanceFrames(1, 0.016);
    expect(marker.visible).toBe(false);
    expect(pathPoints.current).toEqual([]);
    expect(pathRenders).toHaveBeenCalledTimes(rendersAfterClick);
    await renderer.unmount();
  });
});
