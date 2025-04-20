import React from 'react';
import { cleanup } from '@testing-library/react';
import * as THREE from 'three';
import { renderWithGaesup } from '../utils/testUtils';
import { GaesupController } from '../../src/controller';

// 테스트 후 정리
afterEach(cleanup);

describe('GaesupController', () => {
  it('renders without crashing', () => {
    const { container } = renderWithGaesup(<GaesupController />);

    expect(container).toBeTruthy();
  });

  it('accepts debug prop', () => {
    const { container } = renderWithGaesup(<GaesupController debug={true} />);

    expect(container).toBeTruthy();
  });

  it('accepts controller options', () => {
    const controllerOptions = {
      lerp: {
        cameraTurn: 0.5,
        cameraPosition: 0.3,
      },
    };

    const { container } = renderWithGaesup(
      <GaesupController controllerOptions={controllerOptions} />,
    );

    expect(container).toBeTruthy();
  });

  it('accepts character configuration', () => {
    const character = {
      jumpSpeed: 10,
      turnSpeed: 5,
      walkSpeed: 3,
      runSpeed: 6,
    };

    const { container } = renderWithGaesup(<GaesupController character={character} />);

    expect(container).toBeTruthy();
  });

  // 실제 환경에서는 컨트롤러 동작과 콜백 함수 테스트가 필요
});
