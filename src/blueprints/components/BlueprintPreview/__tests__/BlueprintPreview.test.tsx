import { fireEvent, render, screen } from '@testing-library/react';
import { Children, isValidElement, StrictMode } from 'react';
import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';

import { BlueprintPreview } from '..';
import { WARRIOR_BLUEPRINT } from '../../../characters/warrior';
import { BASIC_KART_BLUEPRINT } from '../../../vehicles/kart';
import { Camera, GaesupController, useKeyboard } from '../../../../core';

const mockSetUrls = jest.fn();
const mockSetMode = jest.fn();
const mockSetCameraOption = jest.fn();
const mockReplaceCameraOption = jest.fn();
const mockSetPhysics = jest.fn();
const mockStore = {
  setUrls: mockSetUrls, setMode: mockSetMode, setCameraOption: mockSetCameraOption,
  replaceCameraOption: mockReplaceCameraOption,
  setPhysics: mockSetPhysics,
  physics: { walkSpeed: 10, runSpeed: 20 } as { walkSpeed: number; runSpeed: number; jumpSpeed?: number },
  mode: { type: 'vehicle', control: 'chase', controller: 'keyboard' },
  cameraOption: { fov: 65, xDistance: 42 } as Record<string, unknown>,
  urls: { characterUrl: '/world.glb' },
};
jest.mock('../../../../core', () => ({
  useGaesupStore: Object.assign((selector: (state: unknown) => unknown) => selector(mockStore), {
    getState: () => mockStore,
    setState: (update: (state: typeof mockStore) => Partial<typeof mockStore>) => {
      Object.assign(mockStore, update(mockStore));
    },
  }),
  useKeyboard: jest.fn(),
  GaesupController: () => null, Camera: () => null, Clicker: () => null, GroundClicker: () => null,
}));
jest.mock('@react-three/fiber', () => ({ Canvas: jest.fn(() => <div data-testid="preview-canvas" />) }));
jest.mock('@react-three/drei', () => ({ Environment: () => null }));
jest.mock('@react-three/rapier', () => ({ Physics: () => null, RigidBody: () => null, euler: () => [0, 0, 0] }));
jest.mock('@/core/rendering/legacyDrei', () => ({ Grid: () => null }));
jest.mock('../../../../core/interactions/components/Gamepad', () => ({ GamePad: () => <button>앞으로</button> }));

beforeEach(() => {
  jest.clearAllMocks();
  mockStore.urls = { characterUrl: '/world.glb' };
  mockStore.physics = { walkSpeed: 10, runSpeed: 20 };
  mockSetPhysics.mockImplementation((physics: Partial<typeof mockStore.physics>) => {
    mockStore.physics = { ...mockStore.physics, ...physics };
  });
  mockStore.mode = { type: 'vehicle', control: 'chase', controller: 'keyboard' };
  mockStore.cameraOption = { fov: 65, xDistance: 42 };
  mockSetUrls.mockImplementation((urls: { characterUrl: string }) => { mockStore.urls = urls; });
  mockSetMode.mockImplementation((mode: Partial<typeof mockStore.mode>) => { mockStore.mode = { ...mockStore.mode, ...mode }; });
  mockSetCameraOption.mockImplementation((options: Record<string, unknown>) => { mockStore.cameraOption = { ...mockStore.cameraOption, ...options }; });
  mockReplaceCameraOption.mockImplementation((options: Record<string, unknown>) => { mockStore.cameraOption = options; });
});

test('forwards the keyboard setting to the controller without a duplicate preview subscription', () => {
  function findKeyboardSetting(node: ReactNode): boolean | undefined {
    for (const child of Children.toArray(node)) {
      if (!isValidElement<{ children?: ReactNode; enableKeyboard?: boolean }>(child)) continue;
      if (child.type === GaesupController) return child.props.enableKeyboard;
      const found = findKeyboardSetting(child.props.children);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  const blueprint = { ...WARRIOR_BLUEPRINT, controls: { ...WARRIOR_BLUEPRINT.controls, enableKeyboard: false } };
  const view = render(<BlueprintPreview blueprint={blueprint} />);
  view.rerender(<BlueprintPreview blueprint={blueprint} />);
  expect(findKeyboardSetting(jest.mocked(Canvas).mock.lastCall?.[0].children)).toBe(false);
  view.rerender(<BlueprintPreview blueprint={WARRIOR_BLUEPRINT} />);
  expect(findKeyboardSetting(jest.mocked(Canvas).mock.lastCall?.[0].children)).toBe(true);
  expect(useKeyboard).not.toHaveBeenCalled();
});

test('unsupported or missing models show an explanation without mounting a canvas or changing world settings', () => {
  const view = render(<BlueprintPreview blueprint={BASIC_KART_BLUEPRINT} />);
  expect(screen.getByRole('status')).toHaveTextContent('이 유형의 3D 미리보기는 아직 지원하지 않습니다');
  view.rerender(<BlueprintPreview blueprint={{ ...WARRIOR_BLUEPRINT, visuals: { parts: [] } }} />);
  expect(screen.getByRole('status')).toHaveTextContent('몸체 모델을 지정하면');
  view.rerender(<BlueprintPreview blueprint={null} />);
  expect(screen.getByRole('status')).toHaveTextContent('블루프린트를 선택하면');
  expect(Canvas).not.toHaveBeenCalled();
  expect(mockSetUrls).not.toHaveBeenCalled();
  expect(mockSetMode).not.toHaveBeenCalled();
  expect(mockSetCameraOption).not.toHaveBeenCalled();
});

test('forwards disabled mouse input and ignores preview wheel changes', () => {
  const view = render(<BlueprintPreview blueprint={{ ...WARRIOR_BLUEPRINT,
    controls: { ...WARRIOR_BLUEPRINT.controls, enableMouse: false },
  }} />);
  const camera = Children.toArray(jest.mocked(Canvas).mock.lastCall?.[0].children)
    .find(child => isValidElement(child) && child.type === Camera);
  expect(isValidElement<{ enableMouse: boolean }>(camera) && camera.props.enableMouse).toBe(false);
  mockSetCameraOption.mockClear();
  fireEvent.wheel(screen.getByTestId('preview-canvas'), { deltaY: 100 });
  expect(mockSetCameraOption).not.toHaveBeenCalled();
  view.unmount();
});

test('gamepad controls follow the blueprint setting and restore the previous controller', () => {
  const originalMode = { ...mockStore.mode };
  const blueprint = { ...WARRIOR_BLUEPRINT, controls: { ...WARRIOR_BLUEPRINT.controls, enableGamepad: true, enableKeyboard: false } };
  const view = render(<StrictMode><BlueprintPreview blueprint={blueprint} /></StrictMode>);
  expect(screen.getByRole('group', { name: '화면 조작 버튼' })).toBeInTheDocument();
  expect(mockStore.mode.controller).toBe('gamepad');
  view.rerender(<StrictMode><BlueprintPreview blueprint={WARRIOR_BLUEPRINT} /></StrictMode>);
  expect(screen.queryByRole('group', { name: '화면 조작 버튼' })).not.toBeInTheDocument();
  expect(mockStore.mode.controller).toBe('keyboard');
  view.rerender(<StrictMode><BlueprintPreview blueprint={blueprint} /></StrictMode>);
  view.unmount();
  expect(mockStore.mode).toEqual(originalMode);
});

test('switching from a character to a vehicle removes the previous character preview', () => {
  const view = render(<BlueprintPreview blueprint={WARRIOR_BLUEPRINT} />);
  expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
  expect(mockSetUrls).toHaveBeenCalledWith({ characterUrl: 'gltf/ally_body.glb' });
  view.rerender(<BlueprintPreview blueprint={BASIC_KART_BLUEPRINT} />);
  expect(screen.queryByTestId('preview-canvas')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('기본 카트');
  expect(mockStore.urls.characterUrl).toBe('/world.glb');
});

test('closing the preview preserves a newer model selected outside the preview', () => {
  const view = render(<BlueprintPreview blueprint={WARRIOR_BLUEPRINT} />);
  mockStore.urls = { characterUrl: '/new-world.glb' };
  view.unmount();
  expect(mockStore.urls.characterUrl).toBe('/new-world.glb');
});

test('previews edited movement speeds and restores only settings still owned by the preview', () => {
  const view = render(<StrictMode><BlueprintPreview blueprint={WARRIOR_BLUEPRINT} /></StrictMode>);
  expect(mockStore.physics).toEqual({ walkSpeed: 5, runSpeed: 10, jumpSpeed: 350 / 80 });
  view.rerender(<StrictMode><BlueprintPreview blueprint={{
    ...WARRIOR_BLUEPRINT,
    physics: { ...WARRIOR_BLUEPRINT.physics, moveSpeed: 7, runSpeed: 14 },
  }} /></StrictMode>);
  expect(mockStore.physics).toEqual({ walkSpeed: 7, runSpeed: 14, jumpSpeed: 350 / 80 });
  mockStore.physics = { ...mockStore.physics, runSpeed: 30 };
  view.unmount();
  expect(mockStore.physics).toEqual({ walkSpeed: 10, runSpeed: 30 });
});

test('name and movement edits preserve the current camera without rewriting its settings', () => {
  const view = render(<BlueprintPreview blueprint={WARRIOR_BLUEPRINT} />);
  mockStore.cameraOption = { ...mockStore.cameraOption, zoom: 1.5 };
  mockSetCameraOption.mockClear();
  mockReplaceCameraOption.mockClear();
  mockSetMode.mockClear();
  view.rerender(<BlueprintPreview blueprint={{ ...WARRIOR_BLUEPRINT, name: '이름 변경',
    physics: { ...WARRIOR_BLUEPRINT.physics, moveSpeed: 7 },
  }} />);
  expect(mockStore.cameraOption.zoom).toBe(1.5);
  expect(mockSetCameraOption).not.toHaveBeenCalled();
  expect(mockReplaceCameraOption).not.toHaveBeenCalled();
  expect(mockSetMode).not.toHaveBeenCalled();
  expect(mockStore.physics.walkSpeed).toBe(7);
  view.unmount();
});

test('projects jump impulse and mass into jump speed and restores the previous setting', () => {
  mockStore.physics.jumpSpeed = 15;
  const view = render(<StrictMode><BlueprintPreview blueprint={WARRIOR_BLUEPRINT} /></StrictMode>);
  expect(mockStore.physics.jumpSpeed).toBe(350 / 80);
  for (const [mass, jumpForce, expected] of [[40, 400, 10], [0, 400, 0], [80, -10, 0], [80, 0, 0]]) {
    view.rerender(<StrictMode><BlueprintPreview blueprint={{ ...WARRIOR_BLUEPRINT,
      physics: { ...WARRIOR_BLUEPRINT.physics, mass: mass!, jumpForce: jumpForce! },
    }} /></StrictMode>);
    expect(mockStore.physics.jumpSpeed).toBe(expected);
  }
  view.unmount();
  expect(mockStore.physics.jumpSpeed).toBe(15);
});

test('closing restores camera and mode including removal of preview-only options', () => {
  const mode = { ...mockStore.mode };
  const camera = { ...mockStore.cameraOption };
  const view = render(<BlueprintPreview blueprint={WARRIOR_BLUEPRINT} />);
  expect(mockStore.mode.type).toBe('character');
  expect(mockStore.cameraOption.fov).toBe(50);
  view.unmount();
  expect(mockStore.mode).toEqual(mode);
  expect(mockStore.cameraOption).toEqual(camera);
});

test('preserves zero camera offsets and zoom speed from the blueprint', () => {
  const view = render(<BlueprintPreview blueprint={{
    ...WARRIOR_BLUEPRINT,
    camera: { ...WARRIOR_BLUEPRINT.camera, distance: { x: 0, y: 0, z: 12 }, zoomSpeed: 0 },
  }} />);
  expect(mockStore.cameraOption).toMatchObject({ xDistance: 0, yDistance: 0, zDistance: 12, zoomSpeed: 0 });
  view.unmount();
});

test('cleanup retains external field edits and restores the other preview settings', () => {
  const view = render(<BlueprintPreview blueprint={WARRIOR_BLUEPRINT} />);
  mockStore.mode = { ...mockStore.mode, control: 'topDown' };
  mockStore.cameraOption = { ...mockStore.cameraOption, fov: 80, externalOption: true };
  view.unmount();
  expect(mockStore.mode).toEqual({ type: 'vehicle', control: 'topDown', controller: 'keyboard' });
  expect(mockStore.cameraOption).toEqual({ fov: 80, xDistance: 42, externalOption: true });
});

test('StrictMode and blueprint replacement restore the original settings when closed', () => {
  const mode = { ...mockStore.mode };
  const camera = { ...mockStore.cameraOption };
  const view = render(<StrictMode><BlueprintPreview blueprint={WARRIOR_BLUEPRINT} /></StrictMode>);
  view.rerender(<StrictMode><BlueprintPreview blueprint={{ ...WARRIOR_BLUEPRINT, camera: { mode: 'firstPerson', fov: 75 } }} /></StrictMode>);
  expect(mockStore.mode.control).toBe('firstPerson');
  expect(mockStore.cameraOption.fov).toBe(75);
  view.unmount();
  expect(mockStore.mode).toEqual(mode);
  expect(mockStore.cameraOption).toEqual(camera);
  expect(mockStore.urls.characterUrl).toBe('/world.glb');
});
