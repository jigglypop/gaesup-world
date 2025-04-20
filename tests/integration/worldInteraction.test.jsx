import React from 'react';
import { cleanup, act } from '@testing-library/react';
import * as THREE from 'three';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { createPointerEvent } from '../utils/testUtils';
import { GaesupWorld } from '../../src/world';
import { GaesupComponent } from '../../src/component';
import { GaesupController } from '../../src/controller';
import { Clicker } from '../../src/tools/clicker';

// 테스트 후 정리
afterEach(cleanup);

// 전체 시스템 렌더링
const renderFullSystem = () => {
  return render(
    <Canvas>
      <Physics>
        <GaesupWorld>
          <GaesupController />
          <GaesupComponent url="/models/character.glb" componentType="character" />
          <Clicker />
          <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[100, 1, 100]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        </GaesupWorld>
      </Physics>
    </Canvas>,
  );
};

describe('Gaesup World Integration', () => {
  it('renders the full system without crashing', () => {
    const { container } = renderFullSystem();
    expect(container).toBeTruthy();
  });

  it('simulates user interaction', () => {
    const { container } = renderFullSystem();

    // 캔버스 요소 찾기
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();

    // 클릭 이벤트 시뮬레이션
    act(() => {
      if (canvas) {
        canvas.dispatchEvent(createPointerEvent('pointerdown', 400, 300));

        // 실제 환경에서는 애니메이션 프레임 타이밍으로 업데이트
        setTimeout(() => {
          canvas.dispatchEvent(createPointerEvent('pointerup', 400, 300));
        }, 100);
      }
    });

    // 통합 테스트에서는 실제 결과 확인이 어려움
    // 실제 환경에서는 상태 변경 확인 로직 추가
  });

  // 이 테스트는 예시이며, 실제 환경에서는 물리 시뮬레이션 및 시간 경과에 따른 상태 변화를 테스트해야 함
});
