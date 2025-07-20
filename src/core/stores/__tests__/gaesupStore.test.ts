import { useGaesupStore } from '../gaesupStore';
import { act, renderHook } from '@testing-library/react';

// Mock all the slice modules
jest.mock('../slices', () => ({
  createModeSlice: jest.fn(),
  createUrlsSlice: jest.fn(),
  createRideableSlice: jest.fn(),
  createPerformanceSlice: jest.fn(),
  createPhysicsSlice: jest.fn(),
  createSizesSlice: jest.fn(),
}));

jest.mock('@core/camera/stores/slices/cameraOption', () => ({
  createCameraOptionSlice: jest.fn(),
}));

jest.mock('../../animation/stores/slices', () => ({
  createAnimationSlice: jest.fn(),
}));

jest.mock('../../interactions/stores/slices', () => ({
  createInteractionSlice: jest.fn(),
}));

jest.mock('../../world/stores/slices/worldStates/slice', () => ({
  createWorldSlice: jest.fn(),
}));

describe('GaesupStore', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    const {
      createModeSlice,
      createUrlsSlice,
      createRideableSlice,
      createPerformanceSlice,
      createPhysicsSlice,
      createSizesSlice,
    } = require('../slices');
    
    const { createCameraOptionSlice } = require('@core/camera/stores/slices/cameraOption');
    const { createAnimationSlice } = require('../../animation/stores/slices');
    const { createInteractionSlice } = require('../../interactions/stores/slices');
    const { createWorldSlice } = require('../../world/stores/slices/worldStates/slice');
    
    // Mock mode slice
    createModeSlice.mockImplementation((set: any) => ({
      mode: {
        type: 'character',
        controller: 'keyboard',
        control: 'thirdPerson',
      },
      controllerOptions: {
        lerp: {
          cameraTurn: 1,
          cameraPosition: 1,
        },
      },
      setMode: jest.fn((update) => set((state: any) => ({ mode: { ...state.mode, ...update } }))),
      setControllerOptions: jest.fn((update) => set((state: any) => ({ controllerOptions: { ...state.controllerOptions, ...update } }))),
    }));
    
    // Mock urls slice
    createUrlsSlice.mockImplementation((set: any) => ({
      urls: {
        baseUrl: 'http://localhost:3000',
        apiUrl: '/api',
      },
      setUrls: jest.fn((update) => set((state: any) => ({ urls: { ...state.urls, ...update } }))),
    }));
    
    // Mock sizes slice
    createSizesSlice.mockImplementation((set: any) => ({
      sizes: {
        width: 1920,
        height: 1080,
        pixelRatio: 1,
      },
      setSizes: jest.fn((update) => set((state: any) => ({ sizes: { ...state.sizes, ...update } }))),
    }));
    
    // Mock rideable slice
    createRideableSlice.mockImplementation((set: any) => ({
      rideable: {
        isRiding: false,
        currentVehicle: null,
      },
      setRideable: jest.fn((update) => set((state: any) => ({ rideable: { ...state.rideable, ...update } }))),
    }));
    
    // Mock performance slice
    createPerformanceSlice.mockImplementation((set: any) => ({
      performance: {
        fps: 60,
        memory: 0,
        renderTime: 0,
      },
      setPerformance: jest.fn((update) => set((state: any) => ({ performance: { ...state.performance, ...update } }))),
    }));
    
    // Mock physics slice
    createPhysicsSlice.mockImplementation((set: any) => ({
      physics: {
        enabled: true,
        gravity: -9.81,
      },
      setPhysics: jest.fn((update) => set((state: any) => ({ physics: { ...state.physics, ...update } }))),
    }));
    
    // Mock camera slice
    createCameraOptionSlice.mockImplementation((set: any) => ({
      cameraOption: {
        type: 'perspective',
        fov: 75,
      },
      setCameraOption: jest.fn((update) => set((state: any) => ({ cameraOption: { ...state.cameraOption, ...update } }))),
    }));
    
    // Mock animation slice
    createAnimationSlice.mockImplementation((set: any) => ({
      animation: {
        isPlaying: false,
        currentAnimation: null,
      },
      setAnimation: jest.fn((update) => set((state: any) => ({ animation: { ...state.animation, ...update } }))),
    }));
    
    // Mock interaction slice
    createInteractionSlice.mockImplementation((set: any) => ({
      interaction: {
        isEnabled: true,
        selectedObject: null,
      },
      setInteraction: jest.fn((update) => set((state: any) => ({ interaction: { ...state.interaction, ...update } }))),
    }));
    
    // Mock world slice
    createWorldSlice.mockImplementation((set: any) => ({
      world: {
        isLoaded: false,
        currentLevel: null,
      },
      setWorld: jest.fn((update) => set((state: any) => ({ world: { ...state.world, ...update } }))),
    }));
  });

  describe('Store Initialization', () => {
    test('should initialize with all slices', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.mode).toBeDefined();
      expect(result.current.controllerOptions).toBeDefined();
      expect(result.current.urls).toBeDefined();
      expect(result.current.sizes).toBeDefined();
      expect(result.current.rideable).toBeDefined();
      expect(result.current.performance).toBeDefined();
      expect(result.current.physics).toBeDefined();
      expect(result.current.cameraOption).toBeDefined();
      expect(result.current.animation).toBeDefined();
      expect(result.current.interaction).toBeDefined();
      expect(result.current.world).toBeDefined();
    });
    
    test('should have all setter functions', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(typeof result.current.setMode).toBe('function');
      expect(typeof result.current.setControllerOptions).toBe('function');
      expect(typeof result.current.setUrls).toBe('function');
      expect(typeof result.current.setSizes).toBe('function');
      expect(typeof result.current.setRideable).toBe('function');
      expect(typeof result.current.setPerformance).toBe('function');
      expect(typeof result.current.setPhysics).toBe('function');
      expect(typeof result.current.setCameraOption).toBe('function');
      expect(typeof result.current.setAnimation).toBe('function');
      expect(typeof result.current.setInteraction).toBe('function');
      expect(typeof result.current.setWorld).toBe('function');
    });
  });

  describe('Mode Slice', () => {
    test('should have correct initial mode state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.mode).toEqual({
        type: 'character',
        controller: 'keyboard',
        control: 'thirdPerson',
      });
    });
    
    test('should have correct initial controller options', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.controllerOptions).toEqual({
        lerp: {
          cameraTurn: 1,
          cameraPosition: 1,
        },
      });
    });
    
    test('should update mode state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setMode({ type: 'vehicle' });
      });
      
      expect(result.current.setMode).toHaveBeenCalledWith({ type: 'vehicle' });
    });
    
    test('should update controller options', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setControllerOptions({ 
          lerp: { cameraTurn: 0.5, cameraPosition: 0.8 } 
        });
      });
      
      expect(result.current.setControllerOptions).toHaveBeenCalledWith({
        lerp: { cameraTurn: 0.5, cameraPosition: 0.8 }
      });
    });
  });

  describe('URLs Slice', () => {
    test('should have correct initial URLs state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.urls).toEqual({
        baseUrl: 'http://localhost:3000',
        apiUrl: '/api',
      });
    });
    
    test('should update URLs state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setUrls({ baseUrl: 'https://example.com' });
      });
      
      expect(result.current.setUrls).toHaveBeenCalledWith({ baseUrl: 'https://example.com' });
    });
  });

  describe('Sizes Slice', () => {
    test('should have correct initial sizes state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.sizes).toEqual({
        width: 1920,
        height: 1080,
        pixelRatio: 1,
      });
    });
    
    test('should update sizes state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setSizes({ width: 1024, height: 768 });
      });
      
      expect(result.current.setSizes).toHaveBeenCalledWith({ width: 1024, height: 768 });
    });
  });

  describe('Rideable Slice', () => {
    test('should have correct initial rideable state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.rideable).toEqual({
        isRiding: false,
        currentVehicle: null,
      });
    });
    
    test('should update rideable state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setRideable({ isRiding: true, currentVehicle: 'car' });
      });
      
      expect(result.current.setRideable).toHaveBeenCalledWith({ 
        isRiding: true, 
        currentVehicle: 'car' 
      });
    });
  });

  describe('Performance Slice', () => {
    test('should have correct initial performance state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.performance).toEqual({
        fps: 60,
        memory: 0,
        renderTime: 0,
      });
    });
    
    test('should update performance state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setPerformance({ fps: 30, memory: 100 });
      });
      
      expect(result.current.setPerformance).toHaveBeenCalledWith({ fps: 30, memory: 100 });
    });
  });

  describe('Physics Slice', () => {
    test('should have correct initial physics state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.physics).toEqual({
        enabled: true,
        gravity: -9.81,
      });
    });
    
    test('should update physics state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setPhysics({ enabled: false, gravity: -5 });
      });
      
      expect(result.current.setPhysics).toHaveBeenCalledWith({ enabled: false, gravity: -5 });
    });
  });

  describe('Camera Options Slice', () => {
    test('should have correct initial camera option state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.cameraOption).toEqual({
        type: 'perspective',
        fov: 75,
      });
    });
    
    test('should update camera option state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setCameraOption({ type: 'orthographic', fov: 60 });
      });
      
      expect(result.current.setCameraOption).toHaveBeenCalledWith({ 
        type: 'orthographic', 
        fov: 60 
      });
    });
  });

  describe('Animation Slice', () => {
    test('should have correct initial animation state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.animation).toEqual({
        isPlaying: false,
        currentAnimation: null,
      });
    });
    
    test('should update animation state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setAnimation({ isPlaying: true, currentAnimation: 'walk' });
      });
      
      expect(result.current.setAnimation).toHaveBeenCalledWith({ 
        isPlaying: true, 
        currentAnimation: 'walk' 
      });
    });
  });

  describe('Interaction Slice', () => {
    test('should have correct initial interaction state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.interaction).toEqual({
        isEnabled: true,
        selectedObject: null,
      });
    });
    
    test('should update interaction state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setInteraction({ isEnabled: false, selectedObject: 'cube' });
      });
      
      expect(result.current.setInteraction).toHaveBeenCalledWith({ 
        isEnabled: false, 
        selectedObject: 'cube' 
      });
    });
  });

  describe('World Slice', () => {
    test('should have correct initial world state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(result.current.world).toEqual({
        isLoaded: false,
        currentLevel: null,
      });
    });
    
    test('should update world state', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setWorld({ isLoaded: true, currentLevel: 'level1' });
      });
      
      expect(result.current.setWorld).toHaveBeenCalledWith({ 
        isLoaded: true, 
        currentLevel: 'level1' 
      });
    });
  });

  describe('Store Integration', () => {
    test('should support multiple state updates', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        result.current.setMode({ type: 'vehicle' });
        result.current.setSizes({ width: 800, height: 600 });
        result.current.setPerformance({ fps: 30 });
      });
      
      expect(result.current.setMode).toHaveBeenCalledWith({ type: 'vehicle' });
      expect(result.current.setSizes).toHaveBeenCalledWith({ width: 800, height: 600 });
      expect(result.current.setPerformance).toHaveBeenCalledWith({ fps: 30 });
    });
    
    test('should handle rapid state updates', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.setPerformance({ fps: 60 - i });
        }
      });
      
      expect(result.current.setPerformance).toHaveBeenCalledTimes(10);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid state updates gracefully', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(() => {
        act(() => {
          // This should not throw even with invalid data
          result.current.setMode({} as any);
        });
      }).not.toThrow();
    });
    
    test('should handle null/undefined updates', () => {
      const { result } = renderHook(() => useGaesupStore());
      
      expect(() => {
        act(() => {
          result.current.setSizes(null as any);
          result.current.setUrls(undefined as any);
        });
      }).not.toThrow();
    });
  });

  describe('State Persistence', () => {
    test('should maintain state across multiple hook renders', () => {
      const { result: result1 } = renderHook(() => useGaesupStore());
      const { result: result2 } = renderHook(() => useGaesupStore());
      
      act(() => {
        result1.current.setMode({ type: 'airplane' });
      });
      
      // Both hooks should see the same state
      expect(result1.current.mode.type).toBe('airplane');
      expect(result2.current.mode.type).toBe('airplane');
    });
  });

  describe('Subscription and Updates', () => {
    test('should notify subscribers of state changes', () => {
      const { result } = renderHook(() => useGaesupStore());
      const callback = jest.fn();
      
      // Subscribe to store changes
      const unsubscribe = useGaesupStore.subscribe(callback);
      
      act(() => {
        result.current.setMode({ type: 'vehicle' });
      });
      
      expect(callback).toHaveBeenCalled();
      unsubscribe();
    });
  });
}); 