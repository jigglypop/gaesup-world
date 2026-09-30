import ReactThreeTestRenderer, { type ReactThreeTest } from '@react-three/test-renderer';
import * as THREE from 'three';

import { SpeechBalloon } from '../index';

// cleanup 함수 추가
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe('SpeechBalloon 성능 테스트', () => {
  const graphHasType = (nodes: ReactThreeTest.SceneGraph, type: string): boolean => {
    const queue = [...nodes];
    while (queue.length > 0) {
      const n = queue.shift();
      if (!n) continue;
      if (n.type === type) return true;
      if (Array.isArray(n.children) && n.children.length > 0) {
        queue.push(...n.children);
      }
    }
    return false;
  };

  it('visible=true면 Sprite 노드가 생성되어야 함', async () => {
    const props = { text: '테스트', position: new THREE.Vector3(0, 0, 0) };
    const renderer = await ReactThreeTestRenderer.create(<SpeechBalloon {...props} />);

    // SpeechBalloon creates its texture/material in an effect.
    await new Promise((r) => setTimeout(r, 0));
    await renderer.update(<SpeechBalloon {...props} />);

    const graph = renderer.toGraph();
    expect(graphHasType(graph ?? [], 'Sprite')).toBe(true);

    renderer.unmount();
  });

  it('visible=false면 아무것도 렌더링하지 않아야 함', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <SpeechBalloon text="숨김" position={new THREE.Vector3(0, 0, 0)} visible={false} />
    );

    const graph = renderer.toGraph();
    expect(graph).toEqual([]);

    renderer.unmount();
  });
}); 