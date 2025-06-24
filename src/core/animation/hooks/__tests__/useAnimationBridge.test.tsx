import { renderHook, act } from '@testing-library/react';
import { useAnimationBridge } from '../useAnimationBridge';
import { useGaesupStore } from '../../../stores/gaesupStore';
import { getGlobalAnimationBridge } from '../useAnimationBridge';

jest.mock('../../../stores/gaesupStore');
jest.mock('../useAnimationBridge', () => ({
  ...jest.requireActual('../useAnimationBridge'),
  getGlobalAnimationBridge: jest.fn(),
}));

const mockUseGaesupStore = useGaesupStore as jest.Mock;
const mockGetGlobalAnimationBridge = getGlobalAnimationBridge as jest.Mock;

describe('useAnimationBridge', () => {
  const mockBridgeInstance = {
    subscribe: jest.fn(),
    execute: jest.fn(),
  };
  const mockSetAnimation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGlobalAnimationBridge.mockReturnValue(mockBridgeInstance);
    mockUseGaesupStore.mockImplementation((selector) => {
      const state = {
        mode: { type: 'character' },
        animationState: { character: { current: 'idle' } },
        setAnimation: mockSetAnimation,
      };
      return selector(state);
    });
    mockBridgeInstance.subscribe.mockReturnValue(jest.fn());
  });

  it('should subscribe and unsubscribe correctly', () => {
    const mockUnsubscribe = jest.fn();
    mockBridgeInstance.subscribe.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useAnimationBridge());
    
    expect(mockBridgeInstance.subscribe).toHaveBeenCalledTimes(1);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should call bridge.execute with a "play" command', () => {
    const { result } = renderHook(() => useAnimationBridge());
    act(() => {
      result.current.playAnimation('character', 'walk');
    });
    expect(mockBridgeInstance.execute).toHaveBeenCalledWith('character', {
      type: 'play',
      animation: 'walk',
    });
  });

  it('should update store when bridge notifies of a different state', () => {
    const { unmount } = renderHook(() => useAnimationBridge());
    const bridgeCallback = mockBridgeInstance.subscribe.mock.calls[0][0];

    act(() => {
      bridgeCallback({ currentAnimation: 'run' }, 'character');
    });

    expect(mockSetAnimation).toHaveBeenCalledWith('character', 'run');
    unmount();
  });
}); 