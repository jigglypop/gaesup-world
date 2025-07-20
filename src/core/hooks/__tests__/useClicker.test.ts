import { renderHook, act } from '@testing-library/react';
import * as THREE from 'three';
import { useClicker } from '../useClicker';
import { useStateSystem } from '../../motions/hooks/useStateSystem';
import { InteractionBridge } from '../../interactions/bridge/InteractionBridge';

// Mock dependencies
jest.mock('../../motions/hooks/useStateSystem');
jest.mock('../../interactions/bridge/InteractionBridge');

const mockUseStateSystem = useStateSystem as jest.MockedFunction<typeof useStateSystem>;
const MockInteractionBridge = InteractionBridge as jest.MockedClass<typeof InteractionBridge>;

describe('useClicker', () => {
  let mockExecuteCommand: jest.Mock;
  let mockActiveState: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockExecuteCommand = jest.fn();
    mockActiveState = {
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
    };

    // Mock InteractionBridge
    MockInteractionBridge.mockImplementation(() => ({
      executeCommand: mockExecuteCommand,
      dispose: jest.fn(),
    } as any));

    // Mock useStateSystem
    mockUseStateSystem.mockReturnValue({
      activeState: mockActiveState,
      gameStates: {
        isOnTheGround: true,
        isFalling: false,
        isJumping: false,
        isFlying: false,
        isRiding: false,
        isRunning: false,
        isMoving: false,
        isFloating: false,
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Hook Initialization', () => {
    test('should initialize with default options', () => {
      const { result } = renderHook(() => useClicker());
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.moveClicker).toBe('function');
      expect(result.current.isReady).toBe(true);
      expect(MockInteractionBridge).toHaveBeenCalled();
    });

    test('should initialize with custom options', () => {
      const options = { minHeight: 1.0, offsetY: 1.5 };
      const { result } = renderHook(() => useClicker(options));
      
      expect(result.current).toBeDefined();
      expect(typeof result.current.moveClicker).toBe('function');
      expect(MockInteractionBridge).toHaveBeenCalled();
    });

    test('should check if ready based on active state position', () => {
      const { result } = renderHook(() => useClicker());
      
      expect(result.current.isReady).toBe(true);
      
      // Test without position
      mockActiveState.position = null;
      const { result: result2 } = renderHook(() => useClicker());
      expect(result2.current.isReady).toBe(false);
    });
  });

  describe('Move Clicker Functionality', () => {
    test('should handle ground type clicks successfully', () => {
      const { result } = renderHook(() => useClicker());
      
      const mockEvent = {
        point: new THREE.Vector3(10, 2, 15),
        object: new THREE.Mesh(),
        stopPropagation: jest.fn(),
      } as any;

      act(() => {
        const success = result.current.moveClicker(mockEvent, false, 'ground');
        expect(success).toBe(true);
      });

      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'input',
        action: 'updateMouse',
        data: expect.objectContaining({
          target: expect.any(THREE.Vector3),
          angle: expect.any(Number),
          position: expect.any(THREE.Vector2),
          isActive: true,
          shouldRun: false,
        })
      });
    });

    test('should reject non-ground type clicks', () => {
      const { result } = renderHook(() => useClicker());
      
      const mockEvent = {
        point: new THREE.Vector3(10, 2, 15),
        object: new THREE.Mesh(),
      } as any;

      act(() => {
        const success = result.current.moveClicker(mockEvent, false, 'normal');
        expect(success).toBe(false);
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });

    test('should handle running mode correctly', () => {
      const { result } = renderHook(() => useClicker());
      
      const mockEvent = {
        point: new THREE.Vector3(10, 2, 15),
        object: new THREE.Mesh(),
      } as any;

      act(() => {
        const success = result.current.moveClicker(mockEvent, true, 'ground');
        expect(success).toBe(true);
      });

      expect(mockExecuteCommand).toHaveBeenCalledWith({
        type: 'input',
        action: 'updateMouse',
        data: expect.objectContaining({
          shouldRun: true,
        })
      });
    });

    test('should return false when no active state position', () => {
      mockActiveState.position = null;
      const { result } = renderHook(() => useClicker());
      
      const mockEvent = {
        point: new THREE.Vector3(10, 2, 15),
        object: new THREE.Mesh(),
      } as any;

      act(() => {
        const success = result.current.moveClicker(mockEvent, false, 'ground');
        expect(success).toBe(false);
      });

      expect(mockExecuteCommand).not.toHaveBeenCalled();
    });
  });

  describe('Position Calculations', () => {
    test('should calculate angle correctly', () => {
      const { result } = renderHook(() => useClicker());
      
      // Set current position at origin
      mockActiveState.position = new THREE.Vector3(0, 0, 0);
      
      const mockEvent = {
        point: new THREE.Vector3(10, 0, 0), // Directly to the right
        object: new THREE.Mesh(),
      } as any;

      act(() => {
        result.current.moveClicker(mockEvent, false, 'ground');
      });

      const call = mockExecuteCommand.mock.calls[0][0];
      expect(call.data.angle).toBeCloseTo(0); // 0 radians for rightward movement
    });

    test('should apply offset Y correctly', () => {
      const offsetY = 2.0;
      const { result } = renderHook(() => useClicker({ offsetY }));
      
      const mockEvent = {
        point: new THREE.Vector3(10, 5, 15),
        object: new THREE.Mesh(),
      } as any;

      act(() => {
        result.current.moveClicker(mockEvent, false, 'ground');
      });

      const call = mockExecuteCommand.mock.calls[0][0];
      expect(call.data.target.y).toBe(5 + offsetY); // original Y + offset
    });

    test('should respect minimum height', () => {
      const minHeight = 3.0;
      const { result } = renderHook(() => useClicker({ minHeight }));
      
      const mockEvent = {
        point: new THREE.Vector3(10, 1, 15), // Low Y position
        object: new THREE.Mesh(),
      } as any;

      act(() => {
        result.current.moveClicker(mockEvent, false, 'ground');
      });

      const call = mockExecuteCommand.mock.calls[0][0];
      expect(call.data.target.y).toBeGreaterThanOrEqual(minHeight);
    });
  });

  describe('Error Handling', () => {
    test('should handle bridge command errors gracefully', () => {
      mockExecuteCommand.mockImplementation(() => {
        throw new Error('Bridge error');
      });
      
      const { result } = renderHook(() => useClicker());
      
      const mockEvent = {
        point: new THREE.Vector3(10, 5, 15),
        object: new THREE.Mesh(),
      } as any;

      act(() => {
        const success = result.current.moveClicker(mockEvent, false, 'ground');
        expect(success).toBe(false);
      });
    });
  });
}); 