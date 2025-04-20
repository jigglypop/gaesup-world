import React from 'react';
import { cleanup } from '@testing-library/react';
import * as THREE from 'three';
import { renderWithGaesup } from '../utils/testUtils';
import { GaesupComponent } from '../../src/component';

// 테스트 후 정리
afterEach(cleanup);

describe('GaesupComponent', () => {
  it('renders without crashing', () => {
    // 가장 기본적인 렌더링 테스트
    const { container } = renderWithGaesup(<GaesupComponent url="/models/character.glb" />);

    expect(container).toBeTruthy();
  });

  it('accepts position prop', () => {
    const position = new THREE.Vector3(1, 2, 3);

    const { container } = renderWithGaesup(
      <GaesupComponent url="/models/character.glb" position={position} />,
    );

    expect(container).toBeTruthy();
    // 실제 환경에서는 포지션 검증을 추가할 수 있음
  });

  it('handles component type prop', () => {
    const { container } = renderWithGaesup(
      <GaesupComponent url="/models/character.glb" componentType="character" />,
    );

    expect(container).toBeTruthy();
  });

  // 실제 환경에서는 더 많은 props와 상호작용 테스트가 필요
});
