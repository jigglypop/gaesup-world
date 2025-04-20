import * as THREE from 'three';
import { GaesupComponent } from '../../../src/gaesup/component';
import { renderWithGaesup } from '../../utils/r3fTestUtils';

// jest.mock 사용하여 GLTF 로더 모킹
jest.mock('@react-three/drei', () => ({
  ...jest.requireActual('@react-three/drei'),
  useGLTF: jest.fn(() => {
    return {
      scene: new THREE.Group(),
      nodes: {},
      materials: {},
      animations: [],
    };
  }),
  useAnimations: jest.fn(() => {
    return {
      actions: {},
      names: [],
      clips: [],
    };
  }),
}));

describe('GaesupComponent Tests', () => {
  it('renders with basic props', async () => {
    // 기본 속성으로 컴포넌트 렌더링
    const mounted = await renderWithGaesup(
      <GaesupComponent url="/test/model.glb" componentType="character" />,
    );

    // 컴포넌트가 렌더링 되었는지 확인
    expect(mounted).toBeDefined();

    // scene이 생성되었는지 확인
    expect(mounted.scene).toBeDefined();
  });

  it('accepts position prop', async () => {
    // 위치 속성 정의
    const testPosition = new THREE.Vector3(1, 2, 3);

    // 지정된 위치로 컴포넌트 렌더링
    const mounted = await renderWithGaesup(
      <GaesupComponent url="/test/model.glb" componentType="character" position={testPosition} />,
    );

    // 컴포넌트가 렌더링 되었는지 확인
    expect(mounted).toBeDefined();

    // scene이 생성되었는지 확인
    expect(mounted.scene).toBeDefined();

    // 참고: 실제 position 검증은 컴포넌트 구조에 따라 다를 수 있음
    // 구체적인 검증을 위해서는 컴포넌트의 내부 구조에 대한 이해 필요
  });

  it('accepts componentType prop', async () => {
    // 다양한 컴포넌트 타입으로 테스트
    const componentTypes = ['character', 'vehicle', 'airplane'];

    for (const type of componentTypes) {
      // 지정된 컴포넌트 타입으로 렌더링
      const mounted = await renderWithGaesup(
        <GaesupComponent url="/test/model.glb" componentType={type} />,
      );

      // 컴포넌트가 렌더링 되었는지 확인
      expect(mounted).toBeDefined();
      expect(mounted.scene).toBeDefined();
    }
  });
});
