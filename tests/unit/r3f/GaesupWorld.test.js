import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { GaesupWorld } from '../../../src/world';
import { renderWithR3f } from '../../utils/r3fTestUtils';

// 간단한 자식 컴포넌트
const TestChild = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

describe('GaesupWorld Tests', () => {
  it('renders with children', async () => {
    // 자식 컴포넌트를 포함하여 GaesupWorld 렌더링
    const mounted = await renderWithR3f(
      <Physics>
        <GaesupWorld>
          <TestChild />
        </GaesupWorld>
      </Physics>,
    );

    // 렌더링 확인
    expect(mounted).toBeDefined();
    expect(mounted.scene).toBeDefined();

    // 자식 컴포넌트(mesh)가 렌더링 되었는지 확인
    const mesh = mounted.scene.findByType('mesh');
    expect(mesh).toBeDefined();
  });

  it('accepts startPosition prop', async () => {
    // 시작 위치 설정
    const startPosition = new THREE.Vector3(10, 0, 10);

    // 시작 위치를 지정하여 GaesupWorld 렌더링
    const mounted = await renderWithR3f(
      <Physics>
        <GaesupWorld startPosition={startPosition}>
          <TestChild />
        </GaesupWorld>
      </Physics>,
    );

    // 렌더링 확인
    expect(mounted).toBeDefined();
    expect(mounted.scene).toBeDefined();

    // 세부 검증은 컴포넌트 구조에 따라 달라질 수 있음
  });

  it('accepts mode prop', async () => {
    // 모드 설정
    const mode = {
      type: 'character',
      controller: 'clicker',
      control: 'normal',
    };

    // 모드를 지정하여 GaesupWorld 렌더링
    const mounted = await renderWithR3f(
      <Physics>
        <GaesupWorld mode={mode}>
          <TestChild />
        </GaesupWorld>
      </Physics>,
    );

    // 렌더링 확인
    expect(mounted).toBeDefined();
    expect(mounted.scene).toBeDefined();

    // 세부 검증은 컴포넌트 구조에 따라 달라질 수 있음
  });

  it('accepts camera options', async () => {
    // 카메라 옵션 설정
    const cameraOption = {
      maxDistance: 10,
      position: new THREE.Vector3(0, 5, 5),
      focus: true,
    };

    // 카메라 옵션을 지정하여 GaesupWorld 렌더링
    const mounted = await renderWithR3f(
      <Physics>
        <GaesupWorld cameraOption={cameraOption}>
          <TestChild />
        </GaesupWorld>
      </Physics>,
    );

    // 렌더링 확인
    expect(mounted).toBeDefined();
    expect(mounted.scene).toBeDefined();

    // 세부 검증은 컴포넌트 구조에 따라 달라질 수 있음
  });
});
