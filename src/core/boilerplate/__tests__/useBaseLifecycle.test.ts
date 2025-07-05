import { renderHook } from '@testing-library/react-hooks';
import { useBaseLifecycle } from '../useBaseLifecycle';
import { IDisposable } from '../AbstractBridge';

const mockBridge = {
  register: jest.fn(),
  unregister: jest.fn(),
};

const mockEngine: IDisposable = {
  dispose: jest.fn(),
};

const mockId = 'test-id';

describe('useBaseLifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('마운트 시 bridge.register를 호출해야 합니다', () => {
    renderHook(() => useBaseLifecycle(mockBridge as any, mockId, mockEngine));
    expect(mockBridge.register).toHaveBeenCalledTimes(1);
    expect(mockBridge.register).toHaveBeenCalledWith(mockId, mockEngine);
  });

  it('언마운트 시 bridge.unregister를 호출해야 합니다', () => {
    const { unmount } = renderHook(() =>
      useBaseLifecycle(mockBridge as any, mockId, mockEngine)
    );
    unmount();
    expect(mockBridge.unregister).toHaveBeenCalledTimes(1);
    expect(mockBridge.unregister).toHaveBeenCalledWith(mockId);
  });

  it('브릿지나 엔진이 null이면 아무것도 호출하지 않아야 합니다', () => {
    renderHook(() => useBaseLifecycle(null, mockId, mockEngine));
    expect(mockBridge.register).not.toHaveBeenCalled();

    renderHook(() => useBaseLifecycle(mockBridge as any, mockId, null));
    expect(mockBridge.register).not.toHaveBeenCalled();
  });
}); 