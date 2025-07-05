import { AbstractBridge, IDisposable } from '../AbstractBridge';

type MockEngine = { value: number } & IDisposable;
type MockSnapshot = { value: number };
type MockCommand = { type: 'set'; value: number };

class MockBridge extends AbstractBridge<MockEngine, MockSnapshot, MockCommand> {
  execute(id: string, command: MockCommand): void {
    const engine = this.getEngine(id);
    if (engine) {
      engine.value = command.value;
    }
  }
  snapshot(id: string): Readonly<MockSnapshot> | null {
    const engine = this.getEngine(id);
    return engine ? { value: engine.value } : null;
  }
}

describe('AbstractBridge', () => {
  let bridge: MockBridge;
  let mockEngine: MockEngine;
  const mockId = 'test-id';

  beforeEach(() => {
    bridge = new MockBridge();
    mockEngine = { value: 10, dispose: jest.fn() };
  });

  it('엔진을 등록하고 가져올 수 있어야 합니다', () => {
    bridge.register(mockId, mockEngine);
    expect(bridge.getEngine(mockId)).toBe(mockEngine);
  });

  it('엔진을 등록 해제하고 dispose를 호출해야 합니다', () => {
    bridge.register(mockId, mockEngine);
    bridge.unregister(mockId);
    expect(bridge.getEngine(mockId)).toBeUndefined();
    expect(mockEngine.dispose).toHaveBeenCalledTimes(1);
  });

  it('상태 변경을 구독하고 알림을 받을 수 있어야 합니다', () => {
    const listener = jest.fn();
    bridge.register(mockId, mockEngine);
    const unsubscribe = bridge.subscribe(listener);
    bridge.notifyListeners(mockId);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ value: 10 }, mockId);
    unsubscribe();
    bridge.notifyListeners(mockId);
    expect(listener).toHaveBeenCalledTimes(1); 
  });

  it('브릿지 dispose 시 모든 엔진을 정리해야 합니다', () => {
    bridge.register(mockId, mockEngine);
    bridge.dispose();
    expect(bridge.getEngine(mockId)).toBeUndefined();
    expect(mockEngine.dispose).toHaveBeenCalledTimes(1);
  });
}); 