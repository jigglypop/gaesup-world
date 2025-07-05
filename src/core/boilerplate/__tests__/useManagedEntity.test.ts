import { renderHook } from '@testing-library/react-hooks';
import * as useManagedEntityModule from '../useManagedEntity';
import { ManagedEntity } from '../ManagedEntity';
import { AbstractBridge, IDisposable } from '../AbstractBridge';
import { createRef, RefObject } from 'react';
import { useBaseLifecycle } from '../useBaseLifecycle';
import { useBaseFrame } from '../useBaseFrame';
// 내부 훅들을 모킹합니다.
jest.mock('../useBaseLifecycle', () => ({
  useBaseLifecycle: jest.fn(),
}));
jest.mock('../useBaseFrame', () => ({
  useBaseFrame: jest.fn(),
}));
// ManagedEntity 클래스를 생성자 로직을 포함하여 모킹합니다.
jest.mock('../ManagedEntity', () => ({
  ManagedEntity: jest.fn().mockImplementation((bridge, id, engine) => ({
    engine,
    bridge,
    id,
    dispose: jest.fn(),
    execute: jest.fn(),
    snapshot: jest.fn(),
  })),
}));

// 테스트용 타입 정의
interface TestEngine extends IDisposable {
  dispose: jest.Mock;
  someMethod?: () => void;
}

interface TestSnapshot {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
}

interface TestCommand {
  type: 'move' | 'jump' | 'stop';
  data?: any;
}

class MockBridge extends AbstractBridge<TestEngine, TestSnapshot, TestCommand> {
  execute(id: string, command: TestCommand): void {
    // 실제 구현에서는 command에 따라 engine을 조작
  }
  
  snapshot(id: string): Readonly<TestSnapshot> | null {
    const engine = this.getEngine(id);
    if (!engine) return null;
    
    // 실제 구현에서는 engine 상태를 읽어서 스냅샷 생성
    return {
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    };
  }
}

const mockBridge = new MockBridge();
const mockEngine: TestEngine = { 
  dispose: jest.fn(),
  someMethod: jest.fn(),
};
const mockRef: RefObject<TestEngine> = createRef<TestEngine>();
(mockRef).current = mockEngine;
const mockId = 'test-id';

const MockedManagedEntity = ManagedEntity as jest.MockedClass<typeof ManagedEntity>;

describe('useManagedEntity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockedManagedEntity.mockClear();
  });

  it('ManagedEntity 인스턴스를 생성하고 반환해야 합니다', () => {
    const spy = jest.spyOn(useManagedEntityModule, 'useManagedEntity');
    const { result } = renderHook(() =>
      useManagedEntityModule.useManagedEntity<TestEngine, TestSnapshot, TestCommand>(
        mockBridge, 
        mockId, 
        mockRef
      )
    );

    expect(MockedManagedEntity).toHaveBeenCalledTimes(1);
    expect(MockedManagedEntity).toHaveBeenCalledWith(mockBridge, mockId, mockEngine);
    expect(result.current?.engine).toBe(mockEngine);
    spy.mockRestore();
  });

  it('내부적으로 useBaseLifecycle과 useBaseFrame을 호출해야 합니다', () => {
    const spy = jest.spyOn(useManagedEntityModule, 'useManagedEntity');
    renderHook(() =>
      useManagedEntityModule.useManagedEntity<TestEngine, TestSnapshot, TestCommand>(
        mockBridge, 
        mockId, 
        mockRef
      )
    );

    const instance = MockedManagedEntity.mock.instances[0];
    expect(useBaseLifecycle).toHaveBeenCalledTimes(1);
    expect(useBaseLifecycle).toHaveBeenCalledWith(mockBridge, mockId, instance.engine);
    expect(useBaseFrame).toHaveBeenCalledTimes(1);
    expect(useBaseFrame).toHaveBeenCalledWith(mockBridge, mockId);
    spy.mockRestore();
  });

  it('브릿지나 ref가 null일 때 null을 반환해야 합니다', () => {
    const spy = jest.spyOn(useManagedEntityModule, 'useManagedEntity');
    const { result: result1 } = renderHook(() =>
      useManagedEntityModule.useManagedEntity<TestEngine, TestSnapshot, TestCommand>(
        null, 
        mockId, 
        mockRef
      )
    );
    expect(result1.current).toBeNull();
    
    const nullRef: RefObject<TestEngine> = createRef<TestEngine>();
    const { result: result2 } = renderHook(() =>
      useManagedEntityModule.useManagedEntity<TestEngine, TestSnapshot, TestCommand>(
        mockBridge, 
        mockId, 
        nullRef
      )
    );
    expect(result2.current).toBeNull();
    expect(MockedManagedEntity).not.toHaveBeenCalled();
    spy.mockRestore();
  });
}); 