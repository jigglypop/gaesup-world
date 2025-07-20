import { renderHook, act } from '@testing-library/react';
import { useKeyboard } from '../useKeyboard';
import { useGaesupStore } from '@stores/gaesupStore';
import { InteractionBridge } from '../../interactions/bridge/InteractionBridge';

// Mock dependencies
jest.mock('@stores/gaesupStore');
jest.mock('../../interactions/bridge/InteractionBridge');

const mockUseGaesupStore = useGaesupStore as jest.MockedFunction<typeof useGaesupStore>;
const MockInteractionBridge = InteractionBridge as jest.MockedClass<typeof InteractionBridge>;

describe('useKeyboard', () => {
  let mockExecuteCommand: jest.Mock;
  let mockAutomation: any;
  let mockStopAutomation: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockExecuteCommand = jest.fn();
    mockStopAutomation = jest.fn();
    mockAutomation = {
      isActive: false,
      mode: 'manual'
    };

    // Mock InteractionBridge
    MockInteractionBridge.mockImplementation(() => ({
      executeCommand: mockExecuteCommand,
      dispose: jest.fn(),
    } as any));

    // Mock store
    mockUseGaesupStore.mockImplementation((selector) => {
      const mockState = {
        automation: mockAutomation,
        stopAutomation: mockStopAutomation,
      };
      return typeof selector === 'function' ? selector(mockState) : mockState;
    });

    // Mock DOM events
    Object.defineProperty(document, 'addEventListener', {
      value: jest.fn(),
      writable: true,
    });
    Object.defineProperty(document, 'removeEventListener', {
      value: jest.fn(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Hook Initialization', () => {
    test('should initialize with default parameters', () => {
      const { result } = renderHook(() => useKeyboard());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.pushKey).toBe('function');
      expect(typeof result.current.pullKey).toBe('function');
      expect(MockInteractionBridge).toHaveBeenCalled();
    });

    test('should initialize with custom parameters', () => {
      const { result } = renderHook(() => 
        useKeyboard(false, false, { fov: 60 })
      );
      
      expect(result.current).toBeDefined();
      expect(MockInteractionBridge).toHaveBeenCalled();
    });

    test('should reuse same bridge instance across renders', () => {
      const { result, rerender } = renderHook(() => useKeyboard());
      
      const firstBridge = (result.current as any).bridgeRef?.current;
      
      rerender();
      
      const secondBridge = (result.current as any).bridgeRef?.current;
      expect(firstBridge).toBe(secondBridge);
    });
  });

  describe('Key Mapping', () => {
    test('should map standard movement keys correctly', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      
      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'input',
        action: 'updateKeyboard',
        data: expect.objectContaining({
          key: 'forward',
          pressed: true,
        })
      });
    });

    test('should map all defined keys correctly', () => {
      const { result } = renderHook(() => useKeyboard());
      
      const keyMappings = [
        ['KeyW', 'forward'],
        ['KeyA', 'leftward'],
        ['KeyS', 'backward'],
        ['KeyD', 'rightward'],
        ['ShiftLeft', 'shift'],
        ['Space', 'space'],
        ['KeyZ', 'keyZ'],
        ['KeyR', 'keyR'],
        ['KeyF', 'keyF'],
        ['KeyE', 'keyE'],
        ['Escape', 'escape'],
      ];

      keyMappings.forEach(([code, expectedKey]) => {
        act(() => {
          result.current.pushKey(code, true);
        });
        
        expect(mockExecuteCommand).toHaveBeenCalledWith({
          type: 'input',
          action: 'updateKeyboard',
          data: expect.objectContaining({
            key: expectedKey,
            pressed: true,
          })
        });
      });
    });

    test('should handle unmapped keys', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        result.current.pushKey('KeyX', true);
      });
      
      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'input',
        action: 'updateKeyboard',
        data: expect.objectContaining({
          key: 'KeyX',
          pressed: true,
        })
      });
    });
  });

  describe('Key State Management', () => {
    test('should handle key press events', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        const success = result.current.pushKey('KeyW', true);
        expect(success).toBe(true);
      });
      
      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'input',
        action: 'updateKeyboard',
        data: expect.objectContaining({
          key: 'forward',
          pressed: true,
        })
      });
    });

    test('should handle key release events', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        result.current.pushKey('KeyW', false);
      });
      
      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'input',
        action: 'updateKeyboard',
        data: expect.objectContaining({
          key: 'forward',
          pressed: false,
        })
      });
    });

    test('should handle pullKey method', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        const success = result.current.pullKey('KeyW');
        expect(success).toBe(true);
      });
      
      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'input',
        action: 'updateKeyboard',
        data: expect.objectContaining({
          key: 'forward',
          pressed: false,
        })
      });
    });

    test('should track pressed keys internally', () => {
      const { result } = renderHook(() => useKeyboard());
      
      // Press key
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      
      // Release key
      act(() => {
        result.current.pullKey('KeyW');
      });
      
      expect(mockExecuteCommand).toHaveBeenCalledTimes(2);
      expect(mockExecuteCommand).toHaveBeenLastCalledWith({
        type: 'input',
        action: 'updateKeyboard',
        data: expect.objectContaining({
          key: 'forward',
          pressed: false,
        })
      });
    });
  });

  describe('Automation Integration', () => {
    test('should stop automation when key is pressed during automation', () => {
      mockAutomation.isActive = true;
      
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      
      expect(mockStopAutomation).toHaveBeenCalled();
    });

    test('should not stop automation when automation is not active', () => {
      mockAutomation.isActive = false;
      
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      
      expect(mockStopAutomation).not.toHaveBeenCalled();
    });

    test('should check automation state from store', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      
      expect(mockUseGaesupStore).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('Bridge Command Execution', () => {
    test('should execute commands with correct structure', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      
      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'input',
        action: 'updateKeyboard',
        data: {
          key: 'forward',
          pressed: true,
          timestamp: expect.any(Number),
          metadata: expect.any(Object),
        }
      });
    });

    test('should include timestamp in command data', () => {
      const { result } = renderHook(() => useKeyboard());
      
      const beforeTime = Date.now();
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      const afterTime = Date.now();
      
      const call = mockExecuteCommand.mock.calls[0][0];
      expect(call.data.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(call.data.timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('should include metadata in command data', () => {
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      
      const call = mockExecuteCommand.mock.calls[0][0];
      expect(call.data.metadata).toBeDefined();
      expect(typeof call.data.metadata).toBe('object');
    });
  });

  describe('Error Handling', () => {
    test('should handle bridge command errors gracefully', () => {
      mockExecuteCommand.mockImplementation(() => {
        throw new Error('Bridge error');
      });
      
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        const success = result.current.pushKey('KeyW', true);
        expect(success).toBe(false);
      });
    });

    test('should return false when bridge command fails', () => {
      mockExecuteCommand.mockReturnValue(false);
      
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        const success = result.current.pushKey('KeyW', true);
        expect(success).toBe(false);
      });
    });

    test('should handle null/undefined key codes', () => {
      const { result } = renderHook(() => useKeyboard());
      
      expect(() => {
        act(() => {
          result.current.pushKey(null as any, true);
        });
      }).not.toThrow();
    });

    test('should handle invalid pressed values', () => {
      const { result } = renderHook(() => useKeyboard());
      
      expect(() => {
        act(() => {
          result.current.pushKey('KeyW', null as any);
        });
      }).not.toThrow();
    });
  });

  describe('Hook Configuration', () => {
    test('should accept enableDiagonal parameter', () => {
      const { result } = renderHook(() => useKeyboard(false));
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.pushKey).toBe('function');
    });

    test('should accept enableClicker parameter', () => {
      const { result } = renderHook(() => useKeyboard(true, false));
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.pushKey).toBe('function');
    });

    test('should accept cameraOption parameter', () => {
      const cameraOption = { fov: 75, distance: 15 };
      const { result } = renderHook(() => useKeyboard(true, true, cameraOption));
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.pushKey).toBe('function');
    });
  });

  describe('Memory Management', () => {
    test('should maintain bridge reference across re-renders', () => {
      const { result, rerender } = renderHook(() => useKeyboard());
      
      const initialCallCount = MockInteractionBridge.mock.calls.length;
      
      rerender();
      rerender();
      rerender();
      
      // Should not create additional bridge instances
      expect(MockInteractionBridge.mock.calls.length).toBe(initialCallCount);
    });

    test('should handle hook unmounting gracefully', () => {
      const { unmount } = renderHook(() => useKeyboard());
      
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle rapid key events efficiently', () => {
      const { result } = renderHook(() => useKeyboard());
      
      const startTime = performance.now();
      
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.pushKey('KeyW', i % 2 === 0);
        }
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(mockExecuteCommand).toHaveBeenCalledTimes(100);
    });

    test('should maintain key mapping object reference', () => {
      const { result, rerender } = renderHook(() => useKeyboard());
      
      const initialKeyMapping = (result.current as any).keyMapping;
      
      rerender();
      
      const secondKeyMapping = (result.current as any).keyMapping;
      expect(initialKeyMapping).toBe(secondKeyMapping);
    });
  });

  describe('Integration', () => {
    test('should work with store state changes', () => {
      const { result, rerender } = renderHook(() => useKeyboard());
      
      // Change automation state
      mockAutomation.isActive = true;
      rerender();
      
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      
      expect(mockStopAutomation).toHaveBeenCalled();
    });

    test('should handle store selector changes', () => {
      let selectorCallCount = 0;
      mockUseGaesupStore.mockImplementation((selector) => {
        selectorCallCount++;
        const mockState = {
          automation: mockAutomation,
          stopAutomation: mockStopAutomation,
        };
        return typeof selector === 'function' ? selector(mockState) : mockState;
      });
      
      const { result } = renderHook(() => useKeyboard());
      
      act(() => {
        result.current.pushKey('KeyW', true);
      });
      
      expect(selectorCallCount).toBeGreaterThan(0);
    });
  });
}); 