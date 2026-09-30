import type { RapierRigidBody } from '@react-three/rapier';
import { renderHook } from '@testing-library/react';

import { BridgeFactory } from '../../../boilerplate/bridge/BridgeFactory';
import { MotionBridge } from '../../bridge/MotionBridge';
import { useMotionSetup } from '../setup/useMotionSetup';

const body = {
  translation: () => ({ x: 0, y: 0, z: 0 }),
  linvel: () => ({ x: 0, y: 0, z: 0 }),
  rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
} as unknown as RapierRigidBody;
const ref = { current: body };

afterEach(() => BridgeFactory.dispose(MotionBridge));

test('only the body the player drives takes a motion engine and stands for the player', () => {
  const bridge = BridgeFactory.getOrCreateFor(MotionBridge);
  const npc = renderHook(() => useMotionSetup('npc', ref, 'character', false));
  const vehicle = renderHook(({ active }) => useMotionSetup('vehicle', ref, 'vehicle', active), { initialProps: { active: false } });
  const player = renderHook(() => useMotionSetup('player', ref, 'character', true));
  expect(bridge.getActiveEntities()).toEqual(['player']);
  expect(bridge.getPlayerEntityId()).toBe('player');

  // Edit mode unmounts the player; no NPC or parked vehicle stands in for it.
  player.unmount();
  expect(bridge.getPlayerEntityId()).toBeNull();

  // Getting into a vehicle makes it the driven body.
  vehicle.rerender({ active: true });
  expect(bridge.getPlayerEntityId()).toBe('vehicle');
  vehicle.unmount();
  npc.unmount();
});
