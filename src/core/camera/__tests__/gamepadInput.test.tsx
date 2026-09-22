import { renderHook } from '@testing-library/react';
import * as THREE from 'three';

import { createMemoryInputBackend } from '../../interactions/core/adapter';
import { useCamera } from '../hooks/useCamera';

const mockCanvas = document.createElement('canvas'); const mockCamera = new THREE.PerspectiveCamera(); const mockScene = new THREE.Scene();
const mockBackend = createMemoryInputBackend(); let mockFocused = true; let mockEditing = false;
const mockOptions = { enableFocus: true, focus: false }; const mockMode = { controller: 'gamepad', control: 'thirdPerson' };
const mockSetCameraOption = jest.fn(); const mockCancel = jest.fn(); const mockRuntime = { gamepad: { lookSpeed: 2.5 }, cinematics: { cancel: mockCancel } };
const mockRegisterAction = jest.fn(() => jest.fn()); const mockUpdateOrbit = jest.fn(); const mockSystem = { updateOrbit: mockUpdateOrbit, calculate: jest.fn() }; const mockUpdateConfig = jest.fn();
let mockFrame: (state: { camera: THREE.Camera; scene: THREE.Scene }, delta: number) => void;
jest.mock('@react-three/fiber', () => ({ useThree: () => ({ gl: { domElement: mockCanvas }, camera: mockCamera, scene: mockScene }), useFrame: (frame: typeof mockFrame) => { mockFrame = frame; } }));
jest.mock('../../input/useWorldInputScope', () => ({ useWorldInputScope: () => ({ isFocused: () => mockFocused, registerSurface: () => () => {}, onBlur: () => () => {}, listen: () => () => {} }) }));
jest.mock('../../input/useWorldInputActions', () => ({ useWorldInputActions: () => ({ register: mockRegisterAction }) }));
jest.mock('../../runtime/runtimeContext', () => ({ useGaesupRuntime: () => mockRuntime }));
jest.mock('../../building/stores/buildingStore', () => ({ useBuildingStore: () => mockEditing }));
jest.mock('../../interactions/hooks', () => ({ useInputBackend: () => mockBackend }));
jest.mock('../../motions/hooks/useStateSystem', () => ({ useStateSystem: () => ({ activeState: {} }) }));
jest.mock('../../stores/gaesupStore', () => ({ useGaesupStore: (select: (state: object) => unknown) => select({ cameraOption: { ...mockOptions }, setCameraOption: mockSetCameraOption, mode: { ...mockMode } }) }));
jest.mock('../bridge/useCameraBridge', () => ({ useCameraBridge: () => ({ system: mockSystem, updateConfig: mockUpdateConfig }) }));

beforeEach(() => { jest.clearAllMocks(); mockFocused = true; mockEditing = false; mockOptions.focus = false; mockMode.controller = 'gamepad'; mockRuntime.gamepad.lookSpeed = 2.5; mockBackend.updateGamepad!({ connected: true, rightStick: new THREE.Vector2(1, 0) }); });
const tick = (delta: number) => mockFrame({ camera: mockCamera, scene: mockScene }, delta);

test.each([30, 60, 144])('one second of stick input at %i Hz produces the same orbit target after damping settles', rate => {
  const hook = renderHook(() => useCamera(false));
  try {
    for (let frame = 0; frame < rate; frame++) tick(1 / rate);
    mockBackend.updateGamepad!({ rightStick: new THREE.Vector2() }); for (let frame = 0; frame < rate * 2; frame++) tick(1 / rate);
    const yaw = mockUpdateOrbit.mock.calls.at(-1)![0] as number; expect(yaw).toBeCloseTo(-2.5, 2); expect(mockSystem.calculate).toHaveBeenCalledTimes(rate * 3);
  } finally { hook.unmount(); }
});

test('focus, edit mode and controller selection gate orbit; zero look speed is preserved', () => {
  mockFocused = false; const hook = renderHook(() => useCamera(false));
  try {
    tick(1 / 60); mockFocused = true; mockOptions.focus = true; hook.rerender(); tick(1 / 60);
    mockOptions.focus = false; mockEditing = true; hook.rerender(); tick(1 / 60);
    mockEditing = false; mockMode.controller = 'keyboard'; hook.rerender(); tick(1 / 60);
    mockMode.controller = 'gamepad'; mockRuntime.gamepad.lookSpeed = 0; hook.rerender(); tick(1 / 60); expect(mockUpdateOrbit).not.toHaveBeenCalled();
    mockRuntime.gamepad.lookSpeed = 2.5; tick(1 / 60); expect(mockUpdateOrbit).toHaveBeenCalled();
  } finally { hook.unmount(); }
});

test('the shared escape action cancels the owned cinematic before releasing camera focus', () => {
  mockOptions.focus = true; const hook = renderHook(() => useCamera(false));
  try {
    const [, action] = (mockRegisterAction.mock.calls as unknown as Array<[string, { execute: () => boolean }]>).at(-1)!;
    expect(action.execute()).toBe(true); expect(mockCancel).toHaveBeenCalledTimes(1); expect(mockSetCameraOption).toHaveBeenLastCalledWith({ focus: false });
  } finally { hook.unmount(); }
});
