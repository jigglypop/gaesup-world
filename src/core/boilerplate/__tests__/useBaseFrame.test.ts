import { renderHook, act } from '@testing-library/react-hooks';
import { useBaseFrame } from '../useBaseFrame';

// @react-three/fiber의 useFrame을 모킹합니다.
const frameCallbacks: ((...args: any[]) => void)[] = [];
jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual('@react-three/fiber'),
  useFrame: (callback: (...args: any[]) => void) => {
    frameCallbacks.push(callback);
  },
}));

const mockBridge = {
  notifyListeners: jest.fn(),
};

const mockId = 'test-id';

// 프레임을 시뮬레이션하는 함수
const simulateFrame = () => {
  act(() => {
    frameCallbacks.forEach((cb) => cb());
  });
};

describe('useBaseFrame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    frameCallbacks.length = 0; // 각 테스트 전에 콜백 배열 초기화
  });

  it('매 프레임마다 bridge.notifyListeners를 호출해야 합니다', () => {
    renderHook(() => useBaseFrame(mockBridge as any, mockId));
    
    expect(mockBridge.notifyListeners).not.toHaveBeenCalled();

    simulateFrame();
    expect(mockBridge.notifyListeners).toHaveBeenCalledTimes(1);
    expect(mockBridge.notifyListeners).toHaveBeenCalledWith(mockId);
    
    simulateFrame();
    expect(mockBridge.notifyListeners).toHaveBeenCalledTimes(2);
  });

  it('브릿지가 null이면 아무것도 호출하지 않아야 합니다', () => {
    renderHook(() => useBaseFrame(null, mockId));
    simulateFrame();
    expect(mockBridge.notifyListeners).not.toHaveBeenCalled();
  });
}); 