import 'reflect-metadata';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { MotionBridge } from '../../bridge/MotionBridge';
import { ManagedMotionEntity } from '../ManagedMotionEntity';

const ENTITY_ID = 'automated-entity';

function createRigidBody(): RapierRigidBody {
  const translation = { x: 0, y: 0, z: 0 };
  const velocity = { x: 0, y: 0, z: 0 };
  return {
    translation: jest.fn(() => translation),
    linvel: jest.fn(() => velocity),
    rotation: jest.fn(() => ({ x: 0, y: 0, z: 0, w: 1 })),
    setTranslation: jest.fn(),
    setLinvel: jest.fn(),
    applyImpulse: jest.fn(),
  } as unknown as RapierRigidBody;
}

describe('ManagedMotionEntity automation', () => {
  let bridge: MotionBridge;
  let entity: ManagedMotionEntity;

  beforeEach(() => {
    bridge = new MotionBridge();
    entity = new ManagedMotionEntity(ENTITY_ID, 'character', bridge);
    entity.initialize();
    entity.setRigidBody(createRigidBody());
  });

  afterEach(() => {
    entity.dispose();
    bridge.dispose();
  });

  it('issues one move per bridge notification instead of re-entering its own listener', () => {
    entity.enableAutomation(new THREE.Vector3(100, 0, 0));
    const execute = jest.spyOn(bridge, 'execute');

    expect(() => bridge.notifyListeners(ENTITY_ID)).not.toThrow();
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenLastCalledWith(ENTITY_ID, expect.objectContaining({ type: 'move' }));
  });

  it('keeps tracking snapshots produced by its own commands', () => {
    entity.enableAutomation(new THREE.Vector3(100, 0, 0));
    bridge.notifyListeners(ENTITY_ID);

    expect(entity.getSnapshot()).toBe(bridge.getCachedSnapshot(ENTITY_ID));
  });
});
