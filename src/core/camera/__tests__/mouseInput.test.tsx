import { fireEvent, renderHook } from '@testing-library/react';

import { createWorldInputScope } from '../../input/WorldInputScope';
import { GaesupRuntimeContext } from '../../runtime/runtimeContext';
import type { GaesupRuntime } from '../../runtime/types';
import { WorldViews } from '../../world/core/WorldViews';
import { useCamera } from '../hooks/useCamera';

const mockCanvas = document.createElement('canvas');
const mockCamera = {}; const mockScene = {};
const mockSetCameraOption = jest.fn();
const mockUpdateConfig = jest.fn();
const mockBackend = { updateMouse: jest.fn() };
const mockOptions = { enableZoom: true, zoom: 1, zoomSpeed: 0.01 };
const mockMode = { control: 'thirdPerson' };
jest.mock('@react-three/fiber', () => ({ useThree: () => ({ gl: { domElement: mockCanvas }, camera: mockCamera, scene: mockScene }), useFrame: jest.fn() }));
jest.mock('../../building/stores/buildingStore', () => ({ useBuildingStore: () => false }));
jest.mock('../../interactions/hooks', () => ({ useInputBackend: () => mockBackend }));
jest.mock('../../motions/hooks/useStateSystem', () => ({ useStateSystem: () => ({ activeState: {} }) }));
jest.mock('../../stores/gaesupStore', () => ({
  useGaesupStore: (select: (state: object) => unknown) => select({ cameraOption: { ...mockOptions }, setCameraOption: mockSetCameraOption, mode: { ...mockMode } }),
}));
jest.mock('../bridge/useCameraBridge', () => ({ useCameraBridge: () => ({ system: null, updateConfig: mockUpdateConfig }) }));

beforeEach(() => { jest.clearAllMocks(); mockOptions.zoomSpeed = 0.01; mockOptions.zoom = 1; mockMode.control = 'thirdPerson'; });

test('the camera registers its native canvas as a focus surface and suspended worlds reject pointer zoom', () => {
  const scope = createWorldInputScope(); const other = createWorldInputScope(); const ownKeys = jest.fn(); const otherKeys = jest.fn();
  const off = scope.listen('keydown', ownKeys); const offOther = other.listen('keydown', otherKeys);
  const worldViews = new WorldViews();
  document.body.append(mockCanvas);
  const view = renderHook(() => useCamera(), { wrapper: ({ children }) => <GaesupRuntimeContext.Provider value={{ runtime: { inputScope: scope, worldViews } as GaesupRuntime, revision: 0 }}>{children}</GaesupRuntimeContext.Provider> });
  try {
    expect(worldViews.current()).toEqual({ camera: mockCamera, scene: mockScene, surface: mockCanvas });
    expect(mockCanvas.tabIndex).toBe(0); mockCanvas.focus(); fireEvent.keyDown(mockCanvas, { code: 'KeyW', key: 'w' });
    expect(ownKeys).toHaveBeenCalledTimes(1); expect(otherKeys).not.toHaveBeenCalled();
    scope.suspend(); mockSetCameraOption.mockClear(); fireEvent.wheel(mockCanvas, { deltaY: 10 }); expect(mockSetCameraOption).not.toHaveBeenCalled();
  } finally { view.unmount(); off(); offOther(); mockCanvas.remove(); }
  expect(mockCanvas.hasAttribute('tabindex')).toBe(false);
  expect(worldViews.current()).toBeNull();
});

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

test('camera configuration uses this commit, not stale passive-effect refs', () => {
  const hook = renderHook(() => useCamera());
  mockMode.control = 'topDown';
  mockOptions.zoom = 0.65;
  hook.rerender();
  expect(mockUpdateConfig).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'topDown', zoom: 0.65 }));
  mockMode.control = 'thirdPerson';
  mockOptions.zoom = 1;
  hook.rerender();
  expect(mockUpdateConfig).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'thirdPerson', zoom: 1 }));
  hook.unmount();
});
