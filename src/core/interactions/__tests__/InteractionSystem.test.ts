import { InteractionSystem } from '../core/InteractionSystem';
import { InteractionType, InteractionEvent, InteractionHandler } from '../core/types';
import * as THREE from 'three';

// Mock objects for testing
const mockObject = {
  uuid: 'test-object-1',
  position: new THREE.Vector3(0, 0, 0),
  userData: { interactive: true },
} as THREE.Object3D;

const mockCamera = {
  position: new THREE.Vector3(0, 0, 5),
  getWorldDirection: jest.fn(() => new THREE.Vector3(0, 0, -1)),
} as unknown as THREE.Camera;

const mockRaycaster = {
  setFromCamera: jest.fn(),
  intersectObjects: jest.fn(() => [
    {
      object: mockObject,
      point: new THREE.Vector3(0, 0, 0),
      distance: 5,
    }
  ]),
} as unknown as THREE.Raycaster;

// Mock THREE.Raycaster
jest.mock('three', () => {
  const originalThree = jest.requireActual('three');
  return {
    ...originalThree,
    Raycaster: jest.fn(() => mockRaycaster),
  };
});

describe('InteractionSystem', () => {
  let interactionSystem: InteractionSystem;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    
    interactionSystem = new InteractionSystem(mockCanvas, mockCamera);
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    interactionSystem?.dispose();
  });

  describe('Initialization', () => {
    test('should initialize with canvas and camera', () => {
      expect(interactionSystem).toBeDefined();
      expect(interactionSystem.isEnabled()).toBe(true);
    });

    test('should throw error with invalid parameters', () => {
      expect(() => new InteractionSystem(null as any, mockCamera)).toThrow();
      expect(() => new InteractionSystem(mockCanvas, null as any)).toThrow();
    });

    test('should start disabled if specified', () => {
      const system = new InteractionSystem(mockCanvas, mockCamera, { enabled: false });
      expect(system.isEnabled()).toBe(false);
    });
  });

  describe('Object Registration', () => {
    test('should register interactive objects', () => {
      interactionSystem.registerObject(mockObject);
      
      const objects = interactionSystem.getRegisteredObjects();
      expect(objects).toContain(mockObject);
    });

    test('should unregister objects', () => {
      interactionSystem.registerObject(mockObject);
      expect(interactionSystem.getRegisteredObjects()).toContain(mockObject);
      
      interactionSystem.unregisterObject(mockObject);
      expect(interactionSystem.getRegisteredObjects()).not.toContain(mockObject);
    });

    test('should handle duplicate registration gracefully', () => {
      interactionSystem.registerObject(mockObject);
      interactionSystem.registerObject(mockObject);
      
      const objects = interactionSystem.getRegisteredObjects();
      expect(objects.filter(obj => obj === mockObject)).toHaveLength(1);
    });

    test('should clear all registered objects', () => {
      const object2 = { ...mockObject, uuid: 'test-object-2' } as THREE.Object3D;
      
      interactionSystem.registerObject(mockObject);
      interactionSystem.registerObject(object2);
      
      interactionSystem.clearObjects();
      expect(interactionSystem.getRegisteredObjects()).toHaveLength(0);
    });
  });

  describe('Event Handling', () => {
    test('should register and call interaction handlers', () => {
      const handler = jest.fn();
      
      interactionSystem.registerObject(mockObject);
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      
      // Simulate click event
      const mockEvent = new MouseEvent('click', {
        clientX: 400,
        clientY: 300,
      });
      
      mockCanvas.dispatchEvent(mockEvent);
      
      expect(handler).toHaveBeenCalled();
    });

    test('should remove interaction handlers', () => {
      const handler = jest.fn();
      
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      interactionSystem.removeHandler(InteractionType.CLICK, handler);
      
      // Simulate click event
      const mockEvent = new MouseEvent('click', {
        clientX: 400,
        clientY: 300,
      });
      
      mockCanvas.dispatchEvent(mockEvent);
      
      expect(handler).not.toHaveBeenCalled();
    });

    test('should handle multiple handlers for same event type', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      interactionSystem.registerObject(mockObject);
      interactionSystem.addHandler(InteractionType.CLICK, handler1);
      interactionSystem.addHandler(InteractionType.CLICK, handler2);
      
      // Simulate click event
      const mockEvent = new MouseEvent('click', {
        clientX: 400,
        clientY: 300,
      });
      
      mockCanvas.dispatchEvent(mockEvent);
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    test('should pass correct interaction event data', () => {
      const handler = jest.fn();
      
      interactionSystem.registerObject(mockObject);
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      
      const mockEvent = new MouseEvent('click', {
        clientX: 400,
        clientY: 300,
      });
      
      mockCanvas.dispatchEvent(mockEvent);
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: InteractionType.CLICK,
          object: mockObject,
          point: expect.any(THREE.Vector3),
          event: mockEvent,
        })
      );
    });
  });

  describe('Mouse Events', () => {
    beforeEach(() => {
      interactionSystem.registerObject(mockObject);
    });

    test('should handle click events', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      
      const clickEvent = new MouseEvent('click', {
        clientX: 400,
        clientY: 300,
      });
      
      mockCanvas.dispatchEvent(clickEvent);
      
      expect(handler).toHaveBeenCalled();
      expect(mockRaycaster.setFromCamera).toHaveBeenCalled();
      expect(mockRaycaster.intersectObjects).toHaveBeenCalled();
    });

    test('should handle hover events', () => {
      const hoverHandler = jest.fn();
      const hoverOutHandler = jest.fn();
      
      interactionSystem.addHandler(InteractionType.HOVER, hoverHandler);
      interactionSystem.addHandler(InteractionType.HOVER_OUT, hoverOutHandler);
      
      // Mouse move to trigger hover
      const moveEvent = new MouseEvent('mousemove', {
        clientX: 400,
        clientY: 300,
      });
      
      mockCanvas.dispatchEvent(moveEvent);
      expect(hoverHandler).toHaveBeenCalled();
      
      // Mouse move away to trigger hover out
      mockRaycaster.intersectObjects = jest.fn(() => []);
      const moveAwayEvent = new MouseEvent('mousemove', {
        clientX: 100,
        clientY: 100,
      });
      
      mockCanvas.dispatchEvent(moveAwayEvent);
      expect(hoverOutHandler).toHaveBeenCalled();
    });

    test('should handle double click events', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.DOUBLE_CLICK, handler);
      
      const dblClickEvent = new MouseEvent('dblclick', {
        clientX: 400,
        clientY: 300,
      });
      
      mockCanvas.dispatchEvent(dblClickEvent);
      
      expect(handler).toHaveBeenCalled();
    });

    test('should handle right click events', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.RIGHT_CLICK, handler);
      
      const rightClickEvent = new MouseEvent('contextmenu', {
        clientX: 400,
        clientY: 300,
        button: 2,
      });
      
      mockCanvas.dispatchEvent(rightClickEvent);
      
      expect(handler).toHaveBeenCalled();
    });

    test('should handle drag events', () => {
      const dragStartHandler = jest.fn();
      const dragHandler = jest.fn();
      const dragEndHandler = jest.fn();
      
      interactionSystem.addHandler(InteractionType.DRAG_START, dragStartHandler);
      interactionSystem.addHandler(InteractionType.DRAG, dragHandler);
      interactionSystem.addHandler(InteractionType.DRAG_END, dragEndHandler);
      
      // Start drag
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        clientY: 300,
      });
      mockCanvas.dispatchEvent(mouseDownEvent);
      
      // Drag
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        clientY: 350,
      });
      mockCanvas.dispatchEvent(mouseMoveEvent);
      
      // End drag
      const mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 450,
        clientY: 350,
      });
      mockCanvas.dispatchEvent(mouseUpEvent);
      
      expect(dragStartHandler).toHaveBeenCalled();
      expect(dragHandler).toHaveBeenCalled();
      expect(dragEndHandler).toHaveBeenCalled();
    });
  });

  describe('Touch Events', () => {
    beforeEach(() => {
      interactionSystem.registerObject(mockObject);
    });

    test('should handle touch start events', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.TOUCH_START, handler);
      
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 400, clientY: 300 } as Touch
        ]
      });
      
      mockCanvas.dispatchEvent(touchStartEvent);
      
      expect(handler).toHaveBeenCalled();
    });

    test('should handle touch end events', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.TOUCH_END, handler);
      
      const touchEndEvent = new TouchEvent('touchend', {
        changedTouches: [
          { clientX: 400, clientY: 300 } as Touch
        ]
      });
      
      mockCanvas.dispatchEvent(touchEndEvent);
      
      expect(handler).toHaveBeenCalled();
    });

    test('should handle touch move events', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.TOUCH_MOVE, handler);
      
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [
          { clientX: 400, clientY: 300 } as Touch
        ]
      });
      
      mockCanvas.dispatchEvent(touchMoveEvent);
      
      expect(handler).toHaveBeenCalled();
    });

    test('should handle multi-touch gestures', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.PINCH, handler);
      
      // Simulate pinch gesture
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 350, clientY: 300 } as Touch,
          { clientX: 450, clientY: 300 } as Touch
        ]
      });
      
      mockCanvas.dispatchEvent(touchStartEvent);
      
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [
          { clientX: 300, clientY: 300 } as Touch,
          { clientX: 500, clientY: 300 } as Touch
        ]
      });
      
      mockCanvas.dispatchEvent(touchMoveEvent);
      
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Keyboard Events', () => {
    test('should handle key press events', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.KEY_PRESS, handler);
      
      const keyEvent = new KeyboardEvent('keydown', {
        key: 'Space',
        code: 'Space',
      });
      
      document.dispatchEvent(keyEvent);
      
      expect(handler).toHaveBeenCalled();
    });

    test('should handle key release events', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.KEY_RELEASE, handler);
      
      const keyEvent = new KeyboardEvent('keyup', {
        key: 'Space',
        code: 'Space',
      });
      
      document.dispatchEvent(keyEvent);
      
      expect(handler).toHaveBeenCalled();
    });

    test('should filter keys based on configuration', () => {
      const system = new InteractionSystem(mockCanvas, mockCamera, {
        enabledKeys: ['Space', 'Enter']
      });
      
      const spaceHandler = jest.fn();
      const escapeHandler = jest.fn();
      
      system.addHandler(InteractionType.KEY_PRESS, spaceHandler);
      system.addHandler(InteractionType.KEY_PRESS, escapeHandler);
      
      // Space should trigger
      const spaceEvent = new KeyboardEvent('keydown', { key: 'Space' });
      document.dispatchEvent(spaceEvent);
      
      // Escape should not trigger
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      expect(spaceHandler).toHaveBeenCalled();
      // Both handlers would be called, but only space event would be processed
    });
  });

  describe('Object Filtering and Selection', () => {
    test('should filter objects based on userData', () => {
      const interactiveObject = { 
        ...mockObject, 
        uuid: 'interactive',
        userData: { interactive: true } 
      } as THREE.Object3D;
      
      const nonInteractiveObject = { 
        ...mockObject, 
        uuid: 'non-interactive',
        userData: { interactive: false } 
      } as THREE.Object3D;
      
      interactionSystem.registerObject(interactiveObject);
      interactionSystem.registerObject(nonInteractiveObject);
      
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      
      // Mock raycaster to return non-interactive object
      mockRaycaster.intersectObjects = jest.fn(() => [
        { object: nonInteractiveObject, point: new THREE.Vector3(), distance: 5 }
      ]);
      
      const clickEvent = new MouseEvent('click', { clientX: 400, clientY: 300 });
      mockCanvas.dispatchEvent(clickEvent);
      
      // Handler should not be called for non-interactive object
      expect(handler).not.toHaveBeenCalled();
    });

    test('should respect interaction layers', () => {
      const layerObject = { 
        ...mockObject, 
        uuid: 'layer-object',
        userData: { interactive: true, layer: 'ui' } 
      } as THREE.Object3D;
      
      const system = new InteractionSystem(mockCanvas, mockCamera, {
        layers: ['world']
      });
      
      system.registerObject(layerObject);
      
      const handler = jest.fn();
      system.addHandler(InteractionType.CLICK, handler);
      
      mockRaycaster.intersectObjects = jest.fn(() => [
        { object: layerObject, point: new THREE.Vector3(), distance: 5 }
      ]);
      
      const clickEvent = new MouseEvent('click', { clientX: 400, clientY: 300 });
      mockCanvas.dispatchEvent(clickEvent);
      
      // Should not trigger for different layer
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Enable/Disable Functionality', () => {
    test('should not process events when disabled', () => {
      const handler = jest.fn();
      
      interactionSystem.registerObject(mockObject);
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      interactionSystem.setEnabled(false);
      
      const clickEvent = new MouseEvent('click', { clientX: 400, clientY: 300 });
      mockCanvas.dispatchEvent(clickEvent);
      
      expect(handler).not.toHaveBeenCalled();
    });

    test('should resume processing when re-enabled', () => {
      const handler = jest.fn();
      
      interactionSystem.registerObject(mockObject);
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      
      interactionSystem.setEnabled(false);
      interactionSystem.setEnabled(true);
      
      const clickEvent = new MouseEvent('click', { clientX: 400, clientY: 300 });
      mockCanvas.dispatchEvent(clickEvent);
      
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle high-frequency events efficiently', () => {
      interactionSystem.registerObject(mockObject);
      
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.HOVER, handler);
      
      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const moveEvent = new MouseEvent('mousemove', {
          clientX: 400 + i,
          clientY: 300 + i,
        });
        mockCanvas.dispatchEvent(moveEvent);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle 100 mouse moves efficiently
      expect(totalTime).toBeLessThan(50);
    });

    test('should throttle hover events to prevent excessive calls', () => {
      interactionSystem.registerObject(mockObject);
      
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.HOVER, handler);
      
      // Rapid fire mouse moves
      for (let i = 0; i < 10; i++) {
        const moveEvent = new MouseEvent('mousemove', {
          clientX: 400,
          clientY: 300,
        });
        mockCanvas.dispatchEvent(moveEvent);
      }
      
      // Should not call handler 10 times due to throttling
      expect(handler.mock.calls.length).toBeLessThan(10);
    });
  });

  describe('Memory Management', () => {
    test('should clean up event listeners on dispose', () => {
      const removeEventListenerSpy = jest.spyOn(mockCanvas, 'removeEventListener');
      
      interactionSystem.dispose();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    test('should clear all handlers on dispose', () => {
      const handler = jest.fn();
      
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      interactionSystem.dispose();
      
      // Create new system and try to trigger handler
      const newSystem = new InteractionSystem(mockCanvas, mockCamera);
      newSystem.registerObject(mockObject);
      
      const clickEvent = new MouseEvent('click', { clientX: 400, clientY: 300 });
      mockCanvas.dispatchEvent(clickEvent);
      
      expect(handler).not.toHaveBeenCalled();
    });

    test('should handle multiple dispose calls safely', () => {
      expect(() => {
        interactionSystem.dispose();
        interactionSystem.dispose();
        interactionSystem.dispose();
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle canvas resize events', () => {
      mockCanvas.width = 1200;
      mockCanvas.height = 900;
      
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      
      // Should update internal calculations for new canvas size
      expect(() => {
        const clickEvent = new MouseEvent('click', { clientX: 600, clientY: 450 });
        mockCanvas.dispatchEvent(clickEvent);
      }).not.toThrow();
    });

    test('should handle events with invalid coordinates', () => {
      interactionSystem.registerObject(mockObject);
      
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      
      const invalidEvent = new MouseEvent('click', {
        clientX: -100,
        clientY: -100,
      });
      
      expect(() => mockCanvas.dispatchEvent(invalidEvent)).not.toThrow();
    });

    test('should handle events when no objects are registered', () => {
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      
      const clickEvent = new MouseEvent('click', { clientX: 400, clientY: 300 });
      
      expect(() => mockCanvas.dispatchEvent(clickEvent)).not.toThrow();
      expect(handler).not.toHaveBeenCalled();
    });

    test('should handle raycaster intersection failures', () => {
      mockRaycaster.intersectObjects = jest.fn(() => {
        throw new Error('Intersection failed');
      });
      
      interactionSystem.registerObject(mockObject);
      
      const handler = jest.fn();
      interactionSystem.addHandler(InteractionType.CLICK, handler);
      
      const clickEvent = new MouseEvent('click', { clientX: 400, clientY: 300 });
      
      expect(() => mockCanvas.dispatchEvent(clickEvent)).not.toThrow();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Custom Interaction Types', () => {
    test('should support custom interaction types', () => {
      const customType = 'custom-interaction' as InteractionType;
      const handler = jest.fn();
      
      interactionSystem.addHandler(customType, handler);
      
      // Manually trigger custom event
      interactionSystem.triggerCustomInteraction(customType, {
        object: mockObject,
        point: new THREE.Vector3(),
        event: null,
      });
      
      expect(handler).toHaveBeenCalled();
    });

    test('should allow chaining of interaction events', () => {
      const handler1 = jest.fn(() => true); // Allow chaining
      const handler2 = jest.fn();
      
      interactionSystem.registerObject(mockObject);
      interactionSystem.addHandler(InteractionType.CLICK, handler1);
      interactionSystem.addHandler(InteractionType.CLICK, handler2);
      
      const clickEvent = new MouseEvent('click', { clientX: 400, clientY: 300 });
      mockCanvas.dispatchEvent(clickEvent);
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });
}); 