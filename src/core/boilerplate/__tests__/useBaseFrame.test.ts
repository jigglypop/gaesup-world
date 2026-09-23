import { act, renderHook } from '@testing-library/react';

import { frameScheduler } from '../../runtime/frame';
import type { AbstractBridge } from '../bridge/AbstractBridge';
import { useBaseFrame } from '../hooks/useBaseFrame';

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
    frameScheduler.tick(0, 0);
  });
};

describe('useBaseFrame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    frameScheduler.clear();
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
