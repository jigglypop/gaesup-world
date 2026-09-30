import type { ReactElement } from 'react';

import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { Footsteps } from '../../../audio/components/Footsteps';
import { useAudioStore } from '../../../audio/stores/audioStore';
import { Footprints } from '../../../effects/components/Footprints';
import { Clicker } from '../../../interactions/components/Clicker';
import { FrameSchedulerHost } from '../../../runtime/frame';
import { HouseDoor } from '../../../scene/components/HouseDoor';
import { RoomVisibilityDriver } from '../../../scene/components/RoomVisibilityDriver';
import { useRoomVisibilityStore } from '../../../scene/stores/roomVisibilityStore';
import { useSceneStore } from '../../../scene/stores/sceneStore';
import { useGaesupStore } from '../../../stores/gaesupStore';
import type { UsePlayerPositionOptions, UsePlayerPositionResult } from '../usePlayerPosition';

const player: UsePlayerPositionResult = {
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  rotation: new THREE.Euler(),
  isMoving: false,
  isGrounded: false,
  speed: 0,
  height: 2,
};
const requestedOptions: UsePlayerPositionOptions[] = [];

jest.mock('../usePlayerPosition', () => ({
  usePlayerPosition: (options: UsePlayerPositionOptions = {}) => {
    requestedOptions.push(options);
    return player;
  },
}));

const withFrames = (element: ReactElement) => <><FrameSchedulerHost />{element}</>;

function resetPlayer(): void {
  player.position.set(0, 0, 0);
  player.isMoving = false;
  player.isGrounded = false;
  player.speed = 0;
  requestedOptions.length = 0;
}

beforeEach(resetPlayer);

describe('frame-driven player position consumers', () => {
  test.each([
    ['HouseDoor', () => <HouseDoor position={[0, 0, 0]} sceneId="interior" entry={{ position: [0, 0, 0] }} />],
    ['Footsteps', () => <Footsteps resolveSurface={() => 'grass'} />],
    ['Footprints', () => <Footprints />],
    ['RoomVisibilityDriver', () => <RoomVisibilityDriver />],
    ['Clicker', () => <Clicker />],
  ])('%s subscribes without React re-renders', async (_name, element) => {
    const renderer = await ReactThreeTestRenderer.create(withFrames(element()));
    expect(requestedOptions.length).toBeGreaterThan(0);
    expect(requestedOptions.every((options) => options.reactive === false)).toBe(true);
    await renderer.unmount();
  });

  test('HouseDoor enters the scene when the mutable player position reaches the pad', async () => {
    const goTo = jest.fn(async () => {});
    const original = useSceneStore.getState().goTo;
    useSceneStore.setState({ goTo });
    player.position.set(5, 0, 0);

    const renderer = await ReactThreeTestRenderer.create(withFrames(<HouseDoor position={[0, 0, 0]} sceneId="interior" entry={{ position: [0, 0, 0] }} radius={1} />));
    try {
      await renderer.advanceFrames(2, 1 / 60);
      expect(goTo).not.toHaveBeenCalled();

      player.position.set(0.5, 0, 0);
      await renderer.advanceFrames(1, 1 / 60);
      expect(goTo).toHaveBeenCalledWith('interior', expect.objectContaining({ entry: { position: [0, 0, 0] } }));
    } finally {
      await renderer.unmount();
      useSceneStore.setState({ goTo: original });
    }
  });

  test('Footsteps reads grounded/moving state at frame time, not render time', async () => {
    const playSfx = jest.fn();
    const original = useAudioStore.getState().playSfx;
    useAudioStore.setState({ playSfx });

    const renderer = await ReactThreeTestRenderer.create(withFrames(<Footsteps resolveSurface={() => 'grass'} strideMeters={0.5} />));
    try {
      player.isGrounded = true;
      player.isMoving = true;
      player.speed = 4;
      player.position.set(0.6, 0, 0);
      await renderer.advanceFrames(1, 1 / 60);

      expect(playSfx).toHaveBeenCalledTimes(1);
      expect(playSfx).toHaveBeenCalledWith(expect.objectContaining({ id: 'footstep-grass' }));
    } finally {
      await renderer.unmount();
      useAudioStore.setState({ playSfx: original });
    }
  });

  test('Footprints lays a print once the player walks a full step', async () => {
    const renderer = await ReactThreeTestRenderer.create(withFrames(<Footprints step={0.5} />));
    try {
      const mesh = renderer.scene.children[0]?.instance;
      expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
      await renderer.advanceFrames(1, 1 / 60);
      expect((mesh as THREE.InstancedMesh).count).toBe(0);

      player.isGrounded = true;
      player.isMoving = true;
      await renderer.advanceFrames(1, 1 / 60);
      player.position.set(0.6, 0, 0);
      await renderer.advanceFrames(1, 1 / 60);
      expect((mesh as THREE.InstancedMesh).count).toBe(2);
    } finally {
      await renderer.unmount();
    }
  });

  test('RoomVisibilityDriver follows the player between rooms', async () => {
    const sceneId = useSceneStore.getState().current;
    const rooms = useRoomVisibilityStore.getState();
    rooms.registerRoom({ id: 'hall', sceneId, bounds: { min: [-2, -1, -2], max: [2, 3, 2] } });
    rooms.registerRoom({ id: 'kitchen', sceneId, bounds: { min: [8, -1, -2], max: [12, 3, 2] } });

    const renderer = await ReactThreeTestRenderer.create(withFrames(<RoomVisibilityDriver />));
    try {
      await renderer.advanceFrames(20, 1 / 60);
      expect(useRoomVisibilityStore.getState().currentRoomId).toBe('hall');

      player.position.set(10, 0, 0);
      await renderer.advanceFrames(20, 1 / 60);
      expect(useRoomVisibilityStore.getState().currentRoomId).toBe('kitchen');
    } finally {
      await renderer.unmount();
      rooms.unregisterRoom('hall');
      rooms.unregisterRoom('kitchen');
    }
  });

  test('Clicker hides the target marker once the player arrives', async () => {
    useGaesupStore.getState().updateMouse({ target: new THREE.Vector3(10, 0, 0), isActive: true });
    const renderer = await ReactThreeTestRenderer.create(withFrames(<Clicker />));
    const markerVisible = () => renderer.scene.findAll((node) => node.instance instanceof THREE.Group
      && (node.instance as THREE.Group).position.x === 10 && node.instance.visible).length > 0;
    try {
      await renderer.advanceFrames(1, 1 / 60);
      expect(markerVisible()).toBe(true);

      player.position.set(9.5, 0, 0);
      await ReactThreeTestRenderer.act(async () => {
        await renderer.advanceFrames(1, 1 / 60);
      });
      expect(markerVisible()).toBe(false);
    } finally {
      await renderer.unmount();
      useGaesupStore.getState().updateMouse({ isActive: false });
    }
  });
});
