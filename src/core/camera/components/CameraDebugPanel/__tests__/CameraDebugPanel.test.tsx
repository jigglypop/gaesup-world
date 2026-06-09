import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';

import { useStateSystem } from '../../../../motions/hooks/useStateSystem';
import { useGaesupStore } from '../../../../stores/gaesupStore';
import { CameraDebugPanel } from '../index';

type MockCameraStoreState = {
  mode: { control: string };
  cameraOption: {
    mode: string;
    fov: number;
    zoom: number;
    target: { x: number; y: number; z: number };
    xDistance: number;
    yDistance: number;
    zDistance: number;
  };
};
type StoreSelector = (state: MockCameraStoreState) => unknown;
type StoreMock = {
  mockImplementation: (implementation: (selector?: StoreSelector) => unknown) => void;
  mock: { calls: unknown[][] };
};
type StateSystemMock = {
  mockReturnValue: (value: {
    activeState: {
      position: { x: number; y: number; z: number };
      velocity: { x: number; y: number; z: number };
      euler: { x: number; y: number; z: number };
    };
  }) => void;
};

jest.mock('../../../../stores/gaesupStore', () => ({
  useGaesupStore: jest.fn(),
}));
jest.mock('../../../../motions/hooks/useStateSystem', () => ({
  useStateSystem: jest.fn(),
}));
function getUseStoreMock(): StoreMock {
  return useGaesupStore as unknown as StoreMock;
}
function getStateSystemMock(): StateSystemMock {
  return useStateSystem as unknown as StateSystemMock;
}
describe('CameraDebugPanel', () => {
  afterEach(() => {
    cleanup();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    const state: MockCameraStoreState = {
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
    getUseStoreMock().mockImplementation((selector) => {
      return selector ? selector(state) : state;
    });
    getStateSystemMock().mockReturnValue({
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
    expect(useGaesupStore).toHaveBeenCalledWith(expect.any(Function));
    expect(getUseStoreMock().mock.calls.length).toBeGreaterThanOrEqual(2);
  });
  test('visible이 false면 패널을 렌더링하지 않는다', () => {
    render(<CameraDebugPanel visible={false} />);
    expect(screen.queryByText('Mode')).not.toBeInTheDocument();
  });
  test('필드와 renderer를 커스텀하고 custom field를 표시한다', () => {
    render(
      <CameraDebugPanel
        fields={[{ key: 'fov', label: 'Lens', enabled: true, format: 'angle', precision: 0 }]}
        customFields={[
          { key: 'custom', label: 'Custom', getValue: () => 7, format: 'number', precision: 0 },
        ]}
        renderers={{
          field: (_, field) => (
            <div key={field.key} data-testid="debug-field">
              <span>{field.label}</span>
              <strong>{field.formattedValue}</strong>
            </div>
          ),
        }}
      />,
    );
    expect(screen.getByText('Lens')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getAllByTestId('debug-field')).toHaveLength(2);
  });
});
