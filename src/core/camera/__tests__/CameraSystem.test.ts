import * as THREE from 'three';
import { CameraSystem } from '../core/CameraSystem';
import { CameraMode, CameraOptions } from '../core/types';

// Mock Three.js objects
const mockCamera = {
  position: new THREE.Vector3(0, 0, 5),
  quaternion: new THREE.Quaternion(),
  lookAt: jest.fn(),
  updateProjectionMatrix: jest.fn(),
  getWorldDirection: jest.fn(() => new THREE.Vector3(0, 0, -1)),
} as unknown as THREE.PerspectiveCamera;

const mockControls = {
  enabled: true,
  enableDamping: true,
  dampingFactor: 0.1,
  target: new THREE.Vector3(),
  update: jest.fn(),
  dispose: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
} as any;

// Mock OrbitControls
jest.mock('three/examples/jsm/controls/OrbitControls', () => {
  return {
    OrbitControls: jest.fn().mockImplementation(() => mockControls)
  };
});

describe('CameraSystem', () => {
  let cameraSystem: CameraSystem;
  let mockRenderer: THREE.WebGLRenderer;
  let mockDomElement: HTMLElement;

  beforeEach(() => {
    mockDomElement = document.createElement('div');
    mockRenderer = {
      domElement: mockDomElement,
      getSize: jest.fn(() => ({ width: 800, height: 600 })),
    } as unknown as THREE.WebGLRenderer;

    jest.clearAllMocks();

    const options: CameraOptions = {
      fov: 75,
      near: 0.1,
      far: 1000,
      initialPosition: new THREE.Vector3(0, 0, 5),
      initialTarget: new THREE.Vector3(0, 0, 0),
    };

    cameraSystem = new CameraSystem(mockRenderer, options);
  });

  afterEach(() => {
    cameraSystem?.dispose();
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      const system = new CameraSystem(mockRenderer);
      
      expect(system.getCamera()).toBeDefined();
      expect(system.getCurrentMode()).toBe(CameraMode.ORBIT);
      expect(system.isEnabled()).toBe(true);
    });

    test('should initialize with custom options', () => {
      const options: CameraOptions = {
        fov: 60,
        near: 0.5,
        far: 500,
        initialPosition: new THREE.Vector3(10, 10, 10),
        initialTarget: new THREE.Vector3(5, 0, 0),
        enableControls: false,
      };

      const system = new CameraSystem(mockRenderer, options);
      
      expect(system.isEnabled()).toBe(false);
      expect(system.getCamera().fov).toBe(60);
      expect(system.getCamera().near).toBe(0.5);
      expect(system.getCamera().far).toBe(500);
    });

    test('should set initial camera position and target', () => {
      const position = new THREE.Vector3(5, 5, 5);
      const target = new THREE.Vector3(1, 1, 1);
      
      const options: CameraOptions = {
        initialPosition: position,
        initialTarget: target,
      };

      const system = new CameraSystem(mockRenderer, options);
      const camera = system.getCamera();
      
      expect(camera.position).toEqual(position);
    });
  });

  describe('Camera Modes', () => {
    test('should switch camera modes correctly', () => {
      expect(cameraSystem.getCurrentMode()).toBe(CameraMode.ORBIT);
      
      cameraSystem.setMode(CameraMode.FIRST_PERSON);
      expect(cameraSystem.getCurrentMode()).toBe(CameraMode.FIRST_PERSON);
      
      cameraSystem.setMode(CameraMode.FREE);
      expect(cameraSystem.getCurrentMode()).toBe(CameraMode.FREE);
    });

    test('should handle invalid camera mode gracefully', () => {
      const currentMode = cameraSystem.getCurrentMode();
      
      expect(() => cameraSystem.setMode('invalid' as CameraMode)).not.toThrow();
      expect(cameraSystem.getCurrentMode()).toBe(currentMode);
    });

    test('should apply mode-specific settings', () => {
      cameraSystem.setMode(CameraMode.FIRST_PERSON);
      
      // First person mode should disable controls
      expect(mockControls.enabled).toBe(false);
      
      cameraSystem.setMode(CameraMode.ORBIT);
      
      // Orbit mode should enable controls
      expect(mockControls.enabled).toBe(true);
    });
  });

  describe('Camera Controls', () => {
    test('should enable and disable controls', () => {
      cameraSystem.setControlsEnabled(true);
      expect(cameraSystem.isEnabled()).toBe(true);
      expect(mockControls.enabled).toBe(true);
      
      cameraSystem.setControlsEnabled(false);
      expect(cameraSystem.isEnabled()).toBe(false);
      expect(mockControls.enabled).toBe(false);
    });

    test('should update controls on each frame', () => {
      cameraSystem.update(0.016);
      
      expect(mockControls.update).toHaveBeenCalled();
    });

    test('should not update controls when disabled', () => {
      cameraSystem.setControlsEnabled(false);
      mockControls.update.mockClear();
      
      cameraSystem.update(0.016);
      
      expect(mockControls.update).not.toHaveBeenCalled();
    });
  });

  describe('Camera Positioning', () => {
    test('should set camera position', () => {
      const newPosition = new THREE.Vector3(10, 5, 0);
      
      cameraSystem.setPosition(newPosition);
      
      expect(cameraSystem.getCamera().position).toEqual(newPosition);
    });

    test('should set camera target', () => {
      const newTarget = new THREE.Vector3(2, 3, 4);
      
      cameraSystem.setTarget(newTarget);
      
      expect(mockControls.target).toEqual(newTarget);
    });

    test('should look at specific point', () => {
      const lookAtPoint = new THREE.Vector3(1, 2, 3);
      
      cameraSystem.lookAt(lookAtPoint);
      
      expect(cameraSystem.getCamera().lookAt).toHaveBeenCalledWith(lookAtPoint);
    });

    test('should get current position and target', () => {
      const position = new THREE.Vector3(5, 5, 5);
      const target = new THREE.Vector3(1, 1, 1);
      
      cameraSystem.setPosition(position);
      cameraSystem.setTarget(target);
      
      expect(cameraSystem.getPosition()).toEqual(position);
      expect(cameraSystem.getTarget()).toEqual(target);
    });
  });

  describe('Camera Animation', () => {
    test('should animate to position smoothly', () => {
      const targetPosition = new THREE.Vector3(10, 10, 10);
      const duration = 1000; // 1 second
      
      cameraSystem.animateToPosition(targetPosition, duration);
      
      // Simulate animation frames
      const frameTime = 16; // ~60fps
      const frames = duration / frameTime;
      
      for (let i = 0; i < frames; i++) {
        cameraSystem.update(frameTime / 1000);
      }
      
      // Position should be close to target after animation
      const finalPosition = cameraSystem.getPosition();
      expect(finalPosition.distanceTo(targetPosition)).toBeLessThan(0.1);
    });

    test('should animate camera and target together', () => {
      const targetPosition = new THREE.Vector3(5, 5, 5);
      const targetLookAt = new THREE.Vector3(0, 2, 0);
      
      cameraSystem.animateToPositionAndTarget(
        targetPosition,
        targetLookAt,
        500
      );
      
      // Check that animation is running
      expect(cameraSystem.isAnimating()).toBe(true);
    });

    test('should stop animation when requested', () => {
      const targetPosition = new THREE.Vector3(10, 10, 10);
      
      cameraSystem.animateToPosition(targetPosition, 1000);
      expect(cameraSystem.isAnimating()).toBe(true);
      
      cameraSystem.stopAnimation();
      expect(cameraSystem.isAnimating()).toBe(false);
    });

    test('should call animation complete callback', () => {
      const onComplete = jest.fn();
      const targetPosition = new THREE.Vector3(1, 1, 1);
      
      cameraSystem.animateToPosition(targetPosition, 100, onComplete);
      
      // Fast-forward animation
      cameraSystem.update(0.2); // 200ms > 100ms duration
      
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('Camera Properties', () => {
    test('should update field of view', () => {
      const newFov = 90;
      
      cameraSystem.setFov(newFov);
      
      expect(cameraSystem.getCamera().fov).toBe(newFov);
      expect(cameraSystem.getCamera().updateProjectionMatrix).toHaveBeenCalled();
    });

    test('should update near and far planes', () => {
      const near = 0.5;
      const far = 2000;
      
      cameraSystem.setNearFar(near, far);
      
      expect(cameraSystem.getCamera().near).toBe(near);
      expect(cameraSystem.getCamera().far).toBe(far);
      expect(cameraSystem.getCamera().updateProjectionMatrix).toHaveBeenCalled();
    });

    test('should handle aspect ratio changes', () => {
      const newAspect = 16 / 9;
      
      cameraSystem.setAspectRatio(newAspect);
      
      expect(cameraSystem.getCamera().aspect).toBe(newAspect);
      expect(cameraSystem.getCamera().updateProjectionMatrix).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    test('should register event listeners correctly', () => {
      const onModeChange = jest.fn();
      
      cameraSystem.addEventListener('modechange', onModeChange);
      cameraSystem.setMode(CameraMode.FIRST_PERSON);
      
      expect(onModeChange).toHaveBeenCalledWith({
        type: 'modechange',
        previousMode: CameraMode.ORBIT,
        currentMode: CameraMode.FIRST_PERSON,
      });
    });

    test('should remove event listeners', () => {
      const onModeChange = jest.fn();
      
      cameraSystem.addEventListener('modechange', onModeChange);
      cameraSystem.removeEventListener('modechange', onModeChange);
      cameraSystem.setMode(CameraMode.FREE);
      
      expect(onModeChange).not.toHaveBeenCalled();
    });

    test('should handle multiple listeners for same event', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      cameraSystem.addEventListener('modechange', listener1);
      cameraSystem.addEventListener('modechange', listener2);
      cameraSystem.setMode(CameraMode.FIRST_PERSON);
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Raycasting and World Interaction', () => {
    test('should perform raycasting from camera', () => {
      const mousePosition = new THREE.Vector2(0, 0); // Center of screen
      const objects = [new THREE.Mesh()];
      
      const intersections = cameraSystem.raycast(mousePosition, objects);
      
      expect(Array.isArray(intersections)).toBe(true);
    });

    test('should convert screen coordinates to world coordinates', () => {
      const screenPoint = new THREE.Vector2(0.5, 0.5);
      const distance = 10;
      
      const worldPoint = cameraSystem.screenToWorld(screenPoint, distance);
      
      expect(worldPoint).toBeInstanceOf(THREE.Vector3);
    });

    test('should convert world coordinates to screen coordinates', () => {
      const worldPoint = new THREE.Vector3(0, 0, -5);
      
      const screenPoint = cameraSystem.worldToScreen(worldPoint);
      
      expect(screenPoint).toBeInstanceOf(THREE.Vector2);
      expect(screenPoint.x).toBeGreaterThanOrEqual(-1);
      expect(screenPoint.x).toBeLessThanOrEqual(1);
      expect(screenPoint.y).toBeGreaterThanOrEqual(-1);
      expect(screenPoint.y).toBeLessThanOrEqual(1);
    });
  });

  describe('Camera State Management', () => {
    test('should save and restore camera state', () => {
      const originalPosition = new THREE.Vector3(5, 5, 5);
      const originalTarget = new THREE.Vector3(1, 1, 1);
      
      cameraSystem.setPosition(originalPosition);
      cameraSystem.setTarget(originalTarget);
      cameraSystem.setMode(CameraMode.FIRST_PERSON);
      
      const state = cameraSystem.saveState();
      
      // Change camera state
      cameraSystem.setPosition(new THREE.Vector3(0, 0, 0));
      cameraSystem.setTarget(new THREE.Vector3(0, 0, 0));
      cameraSystem.setMode(CameraMode.ORBIT);
      
      // Restore state
      cameraSystem.restoreState(state);
      
      expect(cameraSystem.getPosition()).toEqual(originalPosition);
      expect(cameraSystem.getTarget()).toEqual(originalTarget);
      expect(cameraSystem.getCurrentMode()).toBe(CameraMode.FIRST_PERSON);
    });

    test('should handle invalid state restoration gracefully', () => {
      const invalidState = { invalid: 'state' } as any;
      
      expect(() => cameraSystem.restoreState(invalidState)).not.toThrow();
    });
  });

  describe('Performance and Optimization', () => {
    test('should not update when not necessary', () => {
      cameraSystem.setControlsEnabled(false);
      mockControls.update.mockClear();
      
      // Multiple updates with no changes
      cameraSystem.update(0.016);
      cameraSystem.update(0.016);
      cameraSystem.update(0.016);
      
      expect(mockControls.update).not.toHaveBeenCalled();
    });

    test('should handle high-frequency updates efficiently', () => {
      const iterations = 1000;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        cameraSystem.update(0.016);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle 1000 updates efficiently
      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('Memory Management and Cleanup', () => {
    test('should dispose resources properly', () => {
      cameraSystem.dispose();
      
      expect(mockControls.dispose).toHaveBeenCalled();
    });

    test('should remove all event listeners on dispose', () => {
      const listener = jest.fn();
      cameraSystem.addEventListener('modechange', listener);
      
      cameraSystem.dispose();
      cameraSystem.setMode(CameraMode.FREE);
      
      expect(listener).not.toHaveBeenCalled();
    });

    test('should handle multiple dispose calls safely', () => {
      expect(() => {
        cameraSystem.dispose();
        cameraSystem.dispose();
        cameraSystem.dispose();
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle null renderer gracefully', () => {
      expect(() => new CameraSystem(null as any)).toThrow();
    });

    test('should handle invalid positions', () => {
      const invalidPosition = new THREE.Vector3(NaN, Infinity, -Infinity);
      
      expect(() => cameraSystem.setPosition(invalidPosition)).not.toThrow();
    });

    test('should handle very large distances', () => {
      const farPosition = new THREE.Vector3(1e6, 1e6, 1e6);
      
      cameraSystem.setPosition(farPosition);
      cameraSystem.update(0.016);
      
      expect(cameraSystem.getPosition().length()).toBeGreaterThan(1e6);
    });

    test('should handle zero delta time', () => {
      expect(() => cameraSystem.update(0)).not.toThrow();
    });

    test('should handle negative delta time', () => {
      expect(() => cameraSystem.update(-0.016)).not.toThrow();
    });
  });
}); 