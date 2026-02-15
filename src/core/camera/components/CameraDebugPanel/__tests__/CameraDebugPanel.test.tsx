import React from 'react';
import { render, screen } from '@testing-library/react';

import { CameraDebugPanel } from '../index';
import { useGaesupStore } from '../../../../stores/gaesupStore';
import { useStateSystem } from '../../../../motions/hooks/useStateSystem';

jest.mock('../../../../stores/gaesupStore', () => ({
  useGaesupStore: jest.fn(),
}));

jest.mock('../../../../motions/hooks/useStateSystem', () => ({
  useStateSystem: jest.fn(),
}));

describe('CameraDebugPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useGaesupStore as unknown as jest.Mock).mockImplementation((selector: unknown) => {
      const state = {
        mode: { control: 'chase' },
        cameraOption: {
          mode: 'orbit',
          fov: 75,
          zoom: 10,
          target: { x: 0, y: 0, z: 0 },
          xDistance: 0,
          yDistance: 5,
          zDistance: 10,
        },
      };
      return typeof selector === 'function' ? (selector as any)(state) : state;
    });

    (useStateSystem as unknown as jest.Mock).mockReturnValue({
      activeState: {
        position: { x: 1, y: 2, z: 3 },
        velocity: { x: 0, y: 0, z: 0 },
        euler: { x: 0, y: 0, z: 0 },
      },
    });
  });

  test('기본 라벨들이 렌더링되어야 함', () => {
    render(<CameraDebugPanel />);

    expect(screen.getByText('Mode')).toBeInTheDocument();
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('FOV')).toBeInTheDocument();
    expect(screen.getByText('Controller')).toBeInTheDocument();
  });

  test('store selector를 사용해야 함', () => {
    render(<CameraDebugPanel />);

    // mode + cameraOption
    expect(useGaesupStore).toHaveBeenCalledWith(expect.any(Function));
    expect((useGaesupStore as unknown as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});