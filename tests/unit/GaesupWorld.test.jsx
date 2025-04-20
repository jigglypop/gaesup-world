import React from 'react';
import { cleanup } from '@testing-library/react';
import * as THREE from 'three';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld } from '../../src/world';

// 테스트 후 정리
afterEach(cleanup);

// GaesupWorld는 자체적으로 Context를 사용하므로 별도 렌더링
const renderWorld = (ui) => {
  return render(
    <Canvas>
      <Physics>{ui}</Physics>
    </Canvas>,
  );
};

describe('GaesupWorld', () => {
  it('renders without crashing', () => {
    const { container } = renderWorld(
      <GaesupWorld>
        <mesh />
      </GaesupWorld>,
    );

    expect(container).toBeTruthy();
  });

  it('accepts start position prop', () => {
    const startPosition = new THREE.Vector3(10, 0, 10);

    const { container } = renderWorld(
      <GaesupWorld startPosition={startPosition}>
        <mesh />
      </GaesupWorld>,
    );

    expect(container).toBeTruthy();
  });

  it('accepts mode prop', () => {
    const mode = {
      type: 'character',
      controller: 'clicker',
      control: 'normal',
    };

    const { container } = renderWorld(
      <GaesupWorld mode={mode}>
        <mesh />
      </GaesupWorld>,
    );

    expect(container).toBeTruthy();
  });

  it('accepts camera options', () => {
    const cameraOption = {
      maxDistance: 10,
      position: new THREE.Vector3(0, 5, 5),
      focus: true,
    };

    const { container } = renderWorld(
      <GaesupWorld cameraOption={cameraOption}>
        <mesh />
      </GaesupWorld>,
    );

    expect(container).toBeTruthy();
  });

  // 실제 환경에서는 context 값과 자식 컴포넌트 상호작용 테스트가 필요
});
