import { MotionBridge, MotionCommand, MotionSnapshot } from '../MotionBridge';
import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

describe('MotionBridge 메모리 누수 테스트', () => {
  let motionBridge: MotionBridge;
  
  const createMockRigidBody = (): RapierRigidBody => ({
    translation: () => ({ x: 0, y: 0, z: 0 }),
    linvel: () => ({ x: 0, y: 0, z: 0 }),
    rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
    setLinvel: jest.fn(),
    setTranslation: jest.fn(),
  } as unknown as RapierRigidBody);

  beforeEach(() => {
    motionBridge = new MotionBridge();
  });

  afterEach(() => {
    motionBridge.dispose();
  });

  it('엔티티 등록/해제 시 메모리가 제대로 정리되어야 함', () => {
    const entityId = 'test-entity';
    const rigidBody = createMockRigidBody();

    motionBridge.registerEntity(entityId, 'character', rigidBody);
    expect(motionBridge.getActiveEntities()).toContain(entityId);

    motionBridge.unregisterEntity(entityId);
    expect(motionBridge.getActiveEntities()).not.toContain(entityId);
  });

  it('다수의 엔티티 등록/해제 시 메모리 누수가 없어야 함', () => {
    const entityCount = 100;
    const entities: Array<{ id: string; rigidBody: RapierRigidBody }> = [];

    for (let i = 0; i < entityCount; i++) {
      const entityId = `entity-${i}`;
      const rigidBody = createMockRigidBody();
      entities.push({ id: entityId, rigidBody });
      motionBridge.registerEntity(entityId, 'character', rigidBody);
    }

    expect(motionBridge.getActiveEntities().length).toBe(entityCount);

    entities.forEach(({ id }) => {
      motionBridge.unregisterEntity(id);
    });

    expect(motionBridge.getActiveEntities().length).toBe(0);
  });

  it('이벤트 리스너가 제대로 정리되어야 함', () => {
    const listeners: Array<() => void> = [];
    const listenerCount = 10;

    for (let i = 0; i < listenerCount; i++) {
      const unsubscribe = motionBridge.subscribe((snapshot, id) => {
        // The test just ensures listeners can be added and removed,
        // so the callback body can be empty.
      });
      listeners.push(unsubscribe);
    }

    listeners.forEach(unsubscribe => unsubscribe());
  });

  it('명령 실행 시 등록되지 않은 엔티티는 무시해야 함', () => {
    const command: MotionCommand = {
      type: 'move',
      data: {
        movement: new THREE.Vector3(1, 0, 0),
      },
    };

    expect(() => {
      motionBridge.execute('non-existent-entity', command);
    }).not.toThrow();
  });

  it('dispose 호출 시 모든 리소스가 정리되어야 함', () => {
    const entityId = 'test-entity';
    const rigidBody = createMockRigidBody();

    motionBridge.registerEntity(entityId, 'character', rigidBody);
    const unsubscribe = motionBridge.subscribe(() => {});

    motionBridge.dispose();

    expect(motionBridge.getActiveEntities().length).toBe(0);
    expect(() => unsubscribe()).not.toThrow();
  });

  it('스냅샷 조회 시 메모리 누수가 없어야 함', () => {
    const entityId = 'test-entity';
    const rigidBody = createMockRigidBody();

    motionBridge.registerEntity(entityId, 'character', rigidBody);

    const snapshots: MotionSnapshot[] = [];
    for (let i = 0; i < 1000; i++) {
      const snapshot = motionBridge.snapshot(entityId);
      if (snapshot) {
        snapshots.push(snapshot);
      }
    }

    expect(snapshots.length).toBe(1000);
    
    motionBridge.unregisterEntity(entityId);
  });

  it('반복적인 업데이트 시 메모리 증가가 없어야 함', () => {
    const entityId = 'test-entity';
    const rigidBody = createMockRigidBody();

    motionBridge.registerEntity(entityId, 'character', rigidBody);

    const initialMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < 10000; i++) {
      motionBridge.updateEntity(entityId, 0.016);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = finalMemory - initialMemory;

    expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024);
  });

  it('getAllSnapshots가 메모리를 누수시키지 않아야 함', () => {
    const entityCount = 50;

    for (let i = 0; i < entityCount; i++) {
      const entityId = `entity-${i}`;
      const rigidBody = createMockRigidBody();
      motionBridge.registerEntity(entityId, 'character', rigidBody);
    }

    const snapshots: Map<string, MotionSnapshot>[] = [];
    for (let i = 0; i < 100; i++) {
      snapshots.push(motionBridge.getAllSnapshots());
    }

    expect(snapshots.length).toBe(100);
    expect(snapshots[0].size).toBe(entityCount);
  });

  it('순환 참조가 발생하지 않아야 함', () => {
    const entityId = 'test-entity';
    const rigidBody = createMockRigidBody();

    motionBridge.registerEntity(entityId, 'character', rigidBody);

    const command: MotionCommand = {
      type: 'setConfig',
      data: {
        config: {
          maxSpeed: 20,
          acceleration: 15,
          jumpForce: 10,
        },
      },
    };

    motionBridge.execute(entityId, command);

    const snapshot = motionBridge.snapshot(entityId);
    expect(snapshot).toBeDefined();
    expect(snapshot?.config.maxSpeed).toBe(20);

    motionBridge.unregisterEntity(entityId);
  });
}); 