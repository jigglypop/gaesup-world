import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import type { MotionBridge } from '../../bridge/MotionBridge';
import type { MotionCommand, MotionSnapshot } from '../../bridge/types';
import { ManagedMotionEntity } from '../ManagedMotionEntity';

type SnapshotListener = (snapshot: MotionSnapshot, id: string) => void;

const MAX_SPEED = 5;

function createBridge(position: THREE.Vector3) {
  const listeners = new Set<SnapshotListener>();
  const snapshot = { position, config: { maxSpeed: MAX_SPEED } } as unknown as MotionSnapshot;
  const notify = () => listeners.forEach((listener) => listener(snapshot, 'entity'));
  const execute = jest.fn((id: string, command: MotionCommand) => {
    void id;
    void command;
    notify();
  });
  const bridge = {
    subscribe: (listener: SnapshotListener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    execute,
    register: jest.fn(),
  } as unknown as MotionBridge;
  return { bridge, execute, notify };
}

describe('ManagedMotionEntity 자동 이동', () => {
  it('이동 명령이 다시 알림을 일으켜도 재귀하지 않고 프레임당 한 번만 명령한다', () => {
    const { bridge, execute, notify } = createBridge(new THREE.Vector3(10, 0, 0));
    const entity = new ManagedMotionEntity('entity', 'character', bridge);
    entity.initialize();
    entity.setRigidBody({} as RapierRigidBody);
    entity.enableAutomation(new THREE.Vector3(0, 0, 0));

    expect(() => notify()).not.toThrow();

    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0]?.[1]).toMatchObject({ type: 'move' });
  });

  it('목표에 도착하면 정지 명령을 한 번 보내고 자동 이동을 끈다', () => {
    const { bridge, execute, notify } = createBridge(new THREE.Vector3(0.1, 0, 0));
    const entity = new ManagedMotionEntity('entity', 'character', bridge);
    entity.initialize();
    entity.setRigidBody({} as RapierRigidBody);
    entity.enableAutomation(new THREE.Vector3(0, 0, 0));

    notify();
    notify();

    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0]?.[1]).toMatchObject({ type: 'stop' });
  });

  it('프레임 알림마다 자동 이동을 계속 진행한다', () => {
    const { bridge, execute, notify } = createBridge(new THREE.Vector3(10, 0, 0));
    const entity = new ManagedMotionEntity('entity', 'character', bridge);
    entity.initialize();
    entity.setRigidBody({} as RapierRigidBody);
    entity.enableAutomation(new THREE.Vector3(0, 0, 0));

    notify();
    notify();
    notify();

    expect(execute).toHaveBeenCalledTimes(3);
  });
});
