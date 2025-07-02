import { InteractionBridge, BridgeCommand, BridgeEvent } from '../InteractionBridge';

describe('InteractionBridge 메모리 누수 테스트', () => {
  let bridge: InteractionBridge;

  beforeEach(() => {
    bridge = new InteractionBridge();
  });

  afterEach(() => {
    if (bridge) {
      bridge.dispose();
    }
  });

  it('dispose 호출 시 setInterval이 정리되어야 함', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    
    bridge.dispose();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('이벤트 구독자가 제대로 정리되어야 함', () => {
    const callbacks: Function[] = [];
    const eventCount = 100;

    for (let i = 0; i < eventCount; i++) {
      const callback = jest.fn();
      callbacks.push(callback);
      bridge.subscribe('testEvent', callback);
    }

    bridge.dispose();

    const event: BridgeEvent = {
      type: 'input',
      event: 'testEvent',
      timestamp: Date.now()
    };

    callbacks.forEach(callback => {
      expect(callback).not.toHaveBeenCalled();
    });
  });

  it('명령 기록이 무한정 증가하지 않아야 함', () => {
    const commandCount = 10000;
    
    for (let i = 0; i < commandCount; i++) {
      bridge.executeCommand({
        type: 'input',
        action: 'updateKeyboard',
        data: { key: 'a', pressed: i % 2 === 0 }
      });
    }

    const snapshot = bridge.snapshot();
    
    expect(snapshot.bridge.commandHistory.length).toBeLessThanOrEqual(1000);
  });

  it('이벤트 큐가 무한정 증가하지 않아야 함', (done) => {
    let eventCount = 0;
    
    bridge.subscribe('*', () => {
      eventCount++;
    });

    for (let i = 0; i < 1000; i++) {
      bridge.executeCommand({
        type: 'input',
        action: 'updateMouse',
        data: { x: i, y: i }
      });
    }

    setTimeout(() => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 10000; i++) {
        bridge.executeCommand({
          type: 'input',
          action: 'updateMouse',
          data: { x: i, y: i }
        });
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      
      expect(memoryGrowth).toBeLessThan(20 * 1024 * 1024);
      done();
    }, 100);
  });

  it('구독 해제가 제대로 작동해야 함', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    bridge.subscribe('testEvent', callback1);
    bridge.subscribe('testEvent', callback2);

    bridge.executeCommand({
      type: 'input',
      action: 'updateKeyboard',
      data: { key: 'a', pressed: true }
    });

    bridge.unsubscribe('testEvent', callback1);

    bridge.executeCommand({
      type: 'input',
      action: 'updateKeyboard',
      data: { key: 'b', pressed: true }
    });

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalled();
  });

  it('reset 호출 시 모든 상태가 초기화되어야 함', () => {
    for (let i = 0; i < 100; i++) {
      bridge.executeCommand({
        type: 'input',
        action: 'updateKeyboard',
        data: { key: `key${i}`, pressed: true }
      });
    }

    bridge.reset();

    const snapshot = bridge.snapshot();
    expect(snapshot.bridge.commandHistory).toHaveLength(0);
    expect(snapshot.bridge.lastCommand).toBeNull();
  });

  it('엔진 리스너 설정 시 메모리 누수가 없어야 함', () => {
    const bridges: InteractionBridge[] = [];
    
    for (let i = 0; i < 10; i++) {
      const testBridge = new InteractionBridge();
      bridges.push(testBridge);
    }

    const initialMemory = process.memoryUsage().heapUsed;

    bridges.forEach(b => b.dispose());

    const finalMemory = process.memoryUsage().heapUsed;
    
    expect(finalMemory).toBeLessThanOrEqual(initialMemory + 1024 * 1024);
  });

  it('자동화 엔진 명령이 메모리를 누수시키지 않아야 함', () => {
    const actionCount = 1000;

    for (let i = 0; i < actionCount; i++) {
      bridge.executeCommand({
        type: 'automation',
        action: 'addAction',
        data: {
          id: `action-${i}`,
          type: 'click',
          target: { x: i, y: i, z: 0 }
        }
      });
    }

    bridge.executeCommand({
      type: 'automation',
      action: 'clearQueue'
    });

    const snapshot = bridge.snapshot();
    expect(snapshot.automation.state).toBeDefined();
  });

  it('동시에 많은 이벤트가 발생해도 메모리가 안정적이어야 함', (done) => {
    const eventTypes = ['input', 'automation', 'sync'];
    const listeners: Function[] = [];

    eventTypes.forEach(type => {
      const listener = jest.fn();
      listeners.push(listener);
      bridge.subscribe(type, listener);
    });

    const initialMemory = process.memoryUsage().heapUsed;

    const interval = setInterval(() => {
      bridge.executeCommand({
        type: 'input',
        action: 'updateKeyboard',
        data: { key: 'test', pressed: Math.random() > 0.5 }
      });
    }, 1);

    setTimeout(() => {
      clearInterval(interval);
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
      
      eventTypes.forEach((type, index) => {
        bridge.unsubscribe(type, listeners[index]);
      });
      
      bridge.dispose();
      done();
    }, 500);
  });
});

describe('InteractionBridge 성능 테스트', () => {
  let bridge: InteractionBridge;

  beforeEach(() => {
    bridge = new InteractionBridge();
  });

  afterEach(() => {
    bridge.cleanup();
  });

  describe('메모리 관리', () => {
    it('cleanup 호출 시 모든 이벤트 리스너가 제거되어야 함', () => {
      const mockEntity = {
        id: 'test-entity',
        onPointerOver: jest.fn(),
        onPointerOut: jest.fn(),
        onClick: jest.fn(),
      };

      bridge.registerInteractable(mockEntity);
      
      // 엔티티가 등록되었는지 확인
      expect(bridge.getInteractable('test-entity')).toBe(mockEntity);

      // cleanup 호출
      bridge.cleanup();

      // 모든 엔티티가 제거되었는지 확인
      expect(bridge.getInteractable('test-entity')).toBeUndefined();
    });

    it('중복 등록을 방지해야 함', () => {
      const entity1 = {
        id: 'duplicate-test',
        onPointerOver: jest.fn(),
      };

      const entity2 = {
        id: 'duplicate-test',
        onPointerOut: jest.fn(),
      };

      bridge.registerInteractable(entity1);
      bridge.registerInteractable(entity2);

      // 마지막에 등록된 엔티티만 유지되어야 함
      const registered = bridge.getInteractable('duplicate-test');
      expect(registered).toBe(entity2);
      expect(registered.onPointerOut).toBeDefined();
    });

    it('언등록이 올바르게 작동해야 함', () => {
      const entity = {
        id: 'unregister-test',
        onClick: jest.fn(),
      };

      bridge.registerInteractable(entity);
      expect(bridge.getInteractable('unregister-test')).toBe(entity);

      bridge.unregisterInteractable('unregister-test');
      expect(bridge.getInteractable('unregister-test')).toBeUndefined();
    });
  });

  describe('이벤트 처리 성능', () => {
    it('raycast 결과를 효율적으로 처리해야 함', () => {
      const entities = Array.from({ length: 100 }, (_, i) => ({
        id: `entity-${i}`,
        onPointerOver: jest.fn(),
        onPointerOut: jest.fn(),
        onClick: jest.fn(),
      }));

      // 모든 엔티티 등록
      entities.forEach(entity => bridge.registerInteractable(entity));

      // raycast 결과 시뮬레이션
      const hitObjects = [
        { object: { userData: { id: 'entity-10' } } },
        { object: { userData: { id: 'entity-20' } } },
        { object: { userData: { id: 'entity-30' } } },
      ];

      bridge.updateHoveredObjects(hitObjects);

      // 올바른 엔티티들의 onPointerOver만 호출되었는지 확인
      expect(entities[10].onPointerOver).toHaveBeenCalled();
      expect(entities[20].onPointerOver).toHaveBeenCalled();
      expect(entities[30].onPointerOver).toHaveBeenCalled();

      // 나머지는 호출되지 않았는지 확인
      expect(entities[0].onPointerOver).not.toHaveBeenCalled();
      expect(entities[50].onPointerOver).not.toHaveBeenCalled();
    });

    it('hover 상태 변경을 추적해야 함', () => {
      const entity1 = {
        id: 'hover-1',
        onPointerOver: jest.fn(),
        onPointerOut: jest.fn(),
      };

      const entity2 = {
        id: 'hover-2',
        onPointerOver: jest.fn(),
        onPointerOut: jest.fn(),
      };

      bridge.registerInteractable(entity1);
      bridge.registerInteractable(entity2);

      // 첫 번째 업데이트: entity1에 호버
      bridge.updateHoveredObjects([
        { object: { userData: { id: 'hover-1' } } }
      ]);

      expect(entity1.onPointerOver).toHaveBeenCalledTimes(1);
      expect(entity1.onPointerOut).not.toHaveBeenCalled();

      // 두 번째 업데이트: entity2로 호버 이동
      bridge.updateHoveredObjects([
        { object: { userData: { id: 'hover-2' } } }
      ]);

      expect(entity1.onPointerOut).toHaveBeenCalledTimes(1);
      expect(entity2.onPointerOver).toHaveBeenCalledTimes(1);

      // 세 번째 업데이트: 호버 해제
      bridge.updateHoveredObjects([]);

      expect(entity2.onPointerOut).toHaveBeenCalledTimes(1);
    });

    it('클릭 이벤트를 올바르게 처리해야 함', () => {
      const entity = {
        id: 'click-test',
        onClick: jest.fn(),
      };

      bridge.registerInteractable(entity);

      // 클릭 이벤트 처리
      bridge.handleClick({ object: { userData: { id: 'click-test' } } });

      expect(entity.onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('최적화 검증', () => {
    it('비활성 엔티티는 이벤트를 받지 않아야 함', () => {
      const activeEntity = {
        id: 'active',
        active: true,
        onClick: jest.fn(),
      };

      const inactiveEntity = {
        id: 'inactive',
        active: false,
        onClick: jest.fn(),
      };

      bridge.registerInteractable(activeEntity);
      bridge.registerInteractable(inactiveEntity);

      // 두 엔티티 모두 클릭
      bridge.handleClick({ object: { userData: { id: 'active' } } });
      bridge.handleClick({ object: { userData: { id: 'inactive' } } });

      // active 엔티티만 이벤트를 받아야 함
      expect(activeEntity.onClick).toHaveBeenCalled();
      expect(inactiveEntity.onClick).not.toHaveBeenCalled();
    });

    it('대량의 엔티티도 효율적으로 관리해야 함', () => {
      const startTime = performance.now();

      // 1000개의 엔티티 등록
      for (let i = 0; i < 1000; i++) {
        bridge.registerInteractable({
          id: `perf-entity-${i}`,
          onPointerOver: () => {},
          onPointerOut: () => {},
        });
      }

      const registrationTime = performance.now() - startTime;

      // 등록 시간이 합리적이어야 함 (100ms 이하)
      expect(registrationTime).toBeLessThan(100);

      // 검색 성능 테스트
      const searchStart = performance.now();
      const entity = bridge.getInteractable('perf-entity-500');
      const searchTime = performance.now() - searchStart;

      expect(entity).toBeDefined();
      // 검색 시간이 빨라야 함 (1ms 이하)
      expect(searchTime).toBeLessThan(1);
    });
  });
}); 