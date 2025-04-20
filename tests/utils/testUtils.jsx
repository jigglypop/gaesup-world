import React from 'react';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupProvider } from '../../src/context';

// Three.js 렌더링 환경이 포함된 React 테스트 렌더러
export function renderWithR3F(ui) {
  return render(<Canvas>{ui}</Canvas>);
}

// Physics를 포함한 환경을 제공하는 렌더러
export function renderWithPhysics(ui) {
  return render(
    <Canvas>
      <Physics>{ui}</Physics>
    </Canvas>,
  );
}

// 전체 Gaesup 환경을 포함한 렌더러
export function renderWithGaesup(ui) {
  return render(
    <Canvas>
      <Physics>
        <GaesupProvider>{ui}</GaesupProvider>
      </Physics>
    </Canvas>,
  );
}

// 모의 이벤트 생성 유틸리티
export function createPointerEvent(type, x = 0, y = 0) {
  return new PointerEvent(type, {
    clientX: x,
    clientY: y,
    button: 0,
  });
}

// 3D 위치 비교 헬퍼
export function vectorsAreClose(a, b, epsilon = 0.001) {
  if (!a || !b) return false;
  return (
    Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon && Math.abs(a.z - b.z) < epsilon
  );
}

// 쿼터니언 비교 헬퍼
export function quaternionsAreClose(a, b, epsilon = 0.001) {
  if (!a || !b) return false;
  return (
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon &&
    Math.abs(a.w - b.w) < epsilon
  );
}
