import { fireEvent, renderHook } from '@testing-library/react';

import { useCamera } from '../hooks/useCamera';

const mockCanvas = document.createElement('canvas');
const mockSetCameraOption = jest.fn();
const mockUpdateConfig = jest.fn();
const mockBackend = { updateMouse: jest.fn() };
const mockOptions = { enableZoom: true, zoom: 1, zoomSpeed: 0.01 };
jest.mock('@react-three/fiber', () => ({ useThree: () => ({ gl: { domElement: mockCanvas } }), useFrame: jest.fn() }));
jest.mock('../../building/stores/buildingStore', () => ({ useBuildingStore: () => false }));
jest.mock('../../interactions/hooks', () => ({ useInputBackend: () => mockBackend }));
jest.mock('../../motions/hooks/useStateSystem', () => ({ useStateSystem: () => ({ activeState: {} }) }));
jest.mock('../../stores/gaesupStore', () => ({
  useGaesupStore: (select: (state: object) => unknown) => select({ cameraOption: mockOptions, setCameraOption: mockSetCameraOption, mode: {} }),
}));
jest.mock('../bridge/useCameraBridge', () => ({ useCameraBridge: () => ({ system: null, updateConfig: mockUpdateConfig }) }));

beforeEach(() => { jest.clearAllMocks(); mockOptions.zoomSpeed = 0.01; });

test('mouse setting removes wheel input, restores it, and cleans up on unmount', () => {
  const view = renderHook(({ enabled }) => useCamera(enabled), { initialProps: { enabled: true } });
  fireEvent.wheel(mockCanvas, { deltaY: 10 });
  expect(mockSetCameraOption).toHaveBeenLastCalledWith({ zoom: 1.1 });
  mockSetCameraOption.mockClear();
  view.rerender({ enabled: false });
  fireEvent.wheel(mockCanvas, { deltaY: 10 });
  expect(mockSetCameraOption).not.toHaveBeenCalled();
  view.rerender({ enabled: true });
  fireEvent.wheel(mockCanvas, { deltaY: 10 });
  expect(mockSetCameraOption).toHaveBeenCalledTimes(1);
  view.unmount();
  fireEvent.wheel(mockCanvas, { deltaY: 10 });
  expect(mockSetCameraOption).toHaveBeenCalledTimes(1);
});

test('explicit zero zoom speed is preserved', () => {
  mockOptions.zoomSpeed = 0;
  const view = renderHook(() => useCamera());
  fireEvent.wheel(mockCanvas, { deltaY: 10 });
  expect(mockSetCameraOption).toHaveBeenLastCalledWith({ zoom: 1 });
  view.unmount();
});
