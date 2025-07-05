import { ManagedEntity } from '../ManagedEntity';
import { AbstractBridge, IDisposable } from '../AbstractBridge';

// Mock Bridge 클래스
const mockBridge = {
  register: jest.fn(),
  unregister: jest.fn(),
  execute: jest.fn(),
  snapshot: jest.fn(),
  subscribe: jest.fn(),
  notifyListeners: jest.fn(),
  dispose: jest.fn(),
};

// Mock Engine
const mockEngine: IDisposable = {
  dispose: jest.fn(),
};

const mockId = 'test-entity';

describe('ManagedEntity', () => {
  let managedEntity: ManagedEntity<IDisposable, unknown, unknown>;

  beforeEach(() => {
    // 각 테스트 전에 mock 함수들을 초기화
    jest.clearAllMocks();
    managedEntity = new ManagedEntity(
      mockBridge as any,
      mockId,
      mockEngine
    );
  });

  it('생성 시 bridge.register를 호출해야 합니다', () => {
    expect(mockBridge.register).toHaveBeenCalledTimes(1);
    expect(mockBridge.register).toHaveBeenCalledWith(mockId, mockEngine);
  });

  it('dispose 호출 시 bridge.unregister를 호출해야 합니다', () => {
    managedEntity.dispose();
    expect(mockBridge.unregister).toHaveBeenCalledTimes(1);
    expect(mockBridge.unregister).toHaveBeenCalledWith(mockId);
  });

  it('execute 호출 시 bridge.execute를 호출해야 합니다', () => {
    const command = { type: 'test' };
    managedEntity.execute(command);
    expect(mockBridge.execute).toHaveBeenCalledTimes(1);
    expect(mockBridge.execute).toHaveBeenCalledWith(mockId, command);
  });

  it('snapshot 호출 시 bridge.snapshot을 호출해야 합니다', () => {
    managedEntity.snapshot();
    expect(mockBridge.snapshot).toHaveBeenCalledTimes(1);
    expect(mockBridge.snapshot).toHaveBeenCalledWith(mockId);
  });
}); 