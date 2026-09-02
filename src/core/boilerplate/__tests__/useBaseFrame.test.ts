import type { RootState } from '@react-three/fiber';
import { act, renderHook } from '@testing-library/react';

import type { AbstractBridge } from '../bridge/AbstractBridge';
import { useBaseFrame } from '../hooks/useBaseFrame';

// @react-three/fiber의 useFrame을 모킹합니다.
const frameCallbacks: Array<(state: RootState, delta: number) => void> = [];
jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual<typeof import('@react-three/fiber')>('@react-three/fiber'),
  useFrame: (callback: (state: RootState, delta: number) => void) => {
    frameCallbacks.push(callback);
  },
}));

type MockEngine = {
  dispose: () => void;
};

type MockSnapshot = Record<string, never>;
type MockCommand = Record<string, never>;

const bridgeSpies = {
  notifyListeners: jest.fn(),
};
const mockBridge = bridgeSpies as unknown as AbstractBridge<
  MockEngine,
  MockSnapshot,
  MockCommand
>;

const mockId = 'test-id';

// 프레임을 시뮬레이션하는 함수
const simulateFrame = () => {
  act(() => {
    frameCallbacks.forEach((callback) => callback({} as RootState, 0));
  });
};

describe('useBaseFrame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    frameCallbacks.length = 0; // 각 테스트 전에 콜백 배열 초기화
  });

  it('매 프레임마다 bridge.notifyListeners를 호출해야 합니다', () => {
    renderHook(() => useBaseFrame(mockBridge, mockId));
    
    expect(bridgeSpies.notifyListeners).not.toHaveBeenCalled();

    simulateFrame();
    expect(bridgeSpies.notifyListeners).toHaveBeenCalledTimes(1);
    expect(bridgeSpies.notifyListeners).toHaveBeenCalledWith(mockId);
    
    simulateFrame();
    expect(bridgeSpies.notifyListeners).toHaveBeenCalledTimes(2);
  });

  it('브릿지가 null이면 아무것도 호출하지 않아야 합니다', () => {
    renderHook(() => useBaseFrame(null, mockId));
    simulateFrame();
    expect(bridgeSpies.notifyListeners).not.toHaveBeenCalled();
  });
});
