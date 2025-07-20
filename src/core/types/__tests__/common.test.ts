import * as THREE from 'three';
import {
  Vector3Tuple,
  QuaternionTuple,
  ThreeEvent,
  ClickEvent,
  CollisionEvent,
  ConfigValue,
  GenericConfig,
  DebugValue,
  PayloadData,
  CallbackFunction,
  CleanupFunction,
} from '../common';

describe('Common Types', () => {
  describe('Vector3Tuple', () => {
    test('should accept valid vector tuple', () => {
      const validVector: Vector3Tuple = [1, 2, 3];
      expect(validVector).toEqual([1, 2, 3]);
    });

    test('should validate tuple length', () => {
      const validVector: Vector3Tuple = [0, 0, 0];
      expect(validVector.length).toBe(3);
    });

    test('should accept negative values', () => {
      const negativeVector: Vector3Tuple = [-1, -2, -3];
      expect(negativeVector).toEqual([-1, -2, -3]);
    });

    test('should accept floating point values', () => {
      const floatVector: Vector3Tuple = [1.5, 2.7, 3.14159];
      expect(floatVector).toEqual([1.5, 2.7, 3.14159]);
    });
  });

  describe('QuaternionTuple', () => {
    test('should accept valid quaternion tuple', () => {
      const validQuaternion: QuaternionTuple = [0, 0, 0, 1];
      expect(validQuaternion).toEqual([0, 0, 0, 1]);
    });

    test('should validate tuple length', () => {
      const validQuaternion: QuaternionTuple = [0, 0, 0, 1];
      expect(validQuaternion.length).toBe(4);
    });

    test('should accept normalized quaternion', () => {
      const normalizedQuaternion: QuaternionTuple = [0.5, 0.5, 0.5, 0.5];
      expect(normalizedQuaternion).toEqual([0.5, 0.5, 0.5, 0.5]);
    });
  });

  describe('ThreeEvent', () => {
    test('should extend THREE.Event with optional properties', () => {
      const mockObject = new THREE.Mesh();
      const mockPoint = new THREE.Vector3(1, 2, 3);

      const threeEvent: ThreeEvent = {
        type: 'click',
        object: mockObject,
        point: mockPoint,
        distance: 10,
        delta: 0.5,
        stopPropagation: jest.fn(),
      };

      expect(threeEvent.type).toBe('click');
      expect(threeEvent.object).toBe(mockObject);
      expect(threeEvent.point).toBe(mockPoint);
      expect(threeEvent.distance).toBe(10);
      expect(threeEvent.delta).toBe(0.5);
      expect(typeof threeEvent.stopPropagation).toBe('function');
    });

    test('should work with minimal properties', () => {
      const minimalEvent: ThreeEvent = {
        type: 'hover',
      };

      expect(minimalEvent.type).toBe('hover');
      expect(minimalEvent.object).toBeUndefined();
      expect(minimalEvent.point).toBeUndefined();
    });
  });

  describe('ClickEvent', () => {
    test('should extend ThreeEvent with click-specific properties', () => {
      const clickEvent: ClickEvent = {
        type: 'click',
        button: 0,
        ctrlKey: true,
        shiftKey: false,
        altKey: false,
        point: new THREE.Vector3(5, 10, 15),
      };

      expect(clickEvent.type).toBe('click');
      expect(clickEvent.button).toBe(0);
      expect(clickEvent.ctrlKey).toBe(true);
      expect(clickEvent.shiftKey).toBe(false);
      expect(clickEvent.altKey).toBe(false);
    });

    test('should handle right-click events', () => {
      const rightClickEvent: ClickEvent = {
        type: 'contextmenu',
        button: 2,
        ctrlKey: false,
        shiftKey: false,
        altKey: true,
      };

      expect(rightClickEvent.button).toBe(2);
      expect(rightClickEvent.altKey).toBe(true);
    });
  });

  describe('CollisionEvent', () => {
    test('should contain collision information', () => {
      const collisionEvent: CollisionEvent = {
        objectId: 'player-1',
        position: new THREE.Vector3(0, 0, 0),
        normal: new THREE.Vector3(0, 1, 0),
        impulse: 25.5,
        other: {
          objectId: 'wall-1',
          type: 'static',
        },
      };

      expect(collisionEvent.objectId).toBe('player-1');
      expect(collisionEvent.position).toBeInstanceOf(THREE.Vector3);
      expect(collisionEvent.normal).toBeInstanceOf(THREE.Vector3);
      expect(collisionEvent.impulse).toBe(25.5);
      expect(collisionEvent.other?.objectId).toBe('wall-1');
      expect(collisionEvent.other?.type).toBe('static');
    });

    test('should work without optional properties', () => {
      const simpleCollision: CollisionEvent = {
        objectId: 'box-1',
        position: new THREE.Vector3(1, 2, 3),
        normal: new THREE.Vector3(0, 0, 1),
      };

      expect(simpleCollision.objectId).toBe('box-1');
      expect(simpleCollision.impulse).toBeUndefined();
      expect(simpleCollision.other).toBeUndefined();
    });
  });

  describe('ConfigValue', () => {
    test('should accept string values', () => {
      const stringConfig: ConfigValue = 'test-value';
      expect(stringConfig).toBe('test-value');
    });

    test('should accept number values', () => {
      const numberConfig: ConfigValue = 42;
      expect(numberConfig).toBe(42);
    });

    test('should accept boolean values', () => {
      const booleanConfig: ConfigValue = true;
      expect(booleanConfig).toBe(true);
    });

    test('should accept Vector3Tuple', () => {
      const vectorConfig: ConfigValue = [1, 2, 3];
      expect(vectorConfig).toEqual([1, 2, 3]);
    });

    test('should accept QuaternionTuple', () => {
      const quaternionConfig: ConfigValue = [0, 0, 0, 1];
      expect(quaternionConfig).toEqual([0, 0, 0, 1]);
    });

    test('should accept object values', () => {
      const objectConfig: ConfigValue = { nested: 'value', count: 10 };
      expect(objectConfig).toEqual({ nested: 'value', count: 10 });
    });
  });

  describe('GenericConfig', () => {
    test('should accept configuration object', () => {
      const config: GenericConfig = {
        name: 'test-config',
        enabled: true,
        position: [0, 1, 2],
        rotation: [0, 0, 0, 1],
        metadata: {
          version: '1.0.0',
          author: 'test',
        },
      };

      expect(config.name).toBe('test-config');
      expect(config.enabled).toBe(true);
      expect(config.position).toEqual([0, 1, 2]);
      expect(config.rotation).toEqual([0, 0, 0, 1]);
      expect(config.metadata).toEqual({ version: '1.0.0', author: 'test' });
    });

    test('should handle empty configuration', () => {
      const emptyConfig: GenericConfig = {};
      expect(Object.keys(emptyConfig)).toHaveLength(0);
    });

    test('should handle mixed value types', () => {
      const mixedConfig: GenericConfig = {
        stringValue: 'hello',
        numberValue: 123,
        booleanValue: false,
        tupleValue: [1, 2, 3],
        objectValue: { key: 'value' },
      };

      expect(typeof mixedConfig.stringValue).toBe('string');
      expect(typeof mixedConfig.numberValue).toBe('number');
      expect(typeof mixedConfig.booleanValue).toBe('boolean');
      expect(Array.isArray(mixedConfig.tupleValue)).toBe(true);
      expect(typeof mixedConfig.objectValue).toBe('object');
    });
  });

  describe('DebugValue', () => {
    test('should accept primitive values', () => {
      const stringDebug: DebugValue = 'debug info';
      const numberDebug: DebugValue = 42;
      const booleanDebug: DebugValue = true;

      expect(stringDebug).toBe('debug info');
      expect(numberDebug).toBe(42);
      expect(booleanDebug).toBe(true);
    });

    test('should accept THREE.js objects', () => {
      const vectorDebug: DebugValue = new THREE.Vector3(1, 2, 3);
      const quaternionDebug: DebugValue = new THREE.Quaternion(0, 0, 0, 1);
      const eulerDebug: DebugValue = new THREE.Euler(0, Math.PI, 0);

      expect(vectorDebug).toBeInstanceOf(THREE.Vector3);
      expect(quaternionDebug).toBeInstanceOf(THREE.Quaternion);
      expect(eulerDebug).toBeInstanceOf(THREE.Euler);
    });
  });

  describe('PayloadData', () => {
    test('should contain type and optional data', () => {
      const payload: PayloadData = {
        type: 'user-action',
        data: {
          action: 'click',
          target: 'button-1',
          coordinates: { x: 100, y: 200 },
        },
        timestamp: Date.now(),
      };

      expect(payload.type).toBe('user-action');
      expect(payload.data?.action).toBe('click');
      expect(payload.data?.target).toBe('button-1');
      expect(typeof payload.timestamp).toBe('number');
    });

    test('should work with minimal data', () => {
      const minimalPayload: PayloadData = {
        type: 'simple-event',
      };

      expect(minimalPayload.type).toBe('simple-event');
      expect(minimalPayload.data).toBeUndefined();
      expect(minimalPayload.timestamp).toBeUndefined();
    });

    test('should handle complex nested data', () => {
      const complexPayload: PayloadData = {
        type: 'state-update',
        data: {
          entity: {
            id: 'player-1',
            position: { x: 10, y: 20, z: 30 },
            inventory: ['item1', 'item2'],
          },
          metadata: {
            source: 'game-engine',
            version: 2,
          },
        },
        timestamp: 1234567890,
      };

      expect(complexPayload.type).toBe('state-update');
      expect(complexPayload.data?.entity).toBeDefined();
      expect(complexPayload.timestamp).toBe(1234567890);
    });
  });

  describe('CallbackFunction', () => {
    test('should accept function with no return value', () => {
      const voidCallback: CallbackFunction = (arg1: string, arg2: number) => {
        console.log(arg1, arg2);
      };

      expect(typeof voidCallback).toBe('function');
    });

    test('should accept function with return value', () => {
      const returningCallback: CallbackFunction<string> = (name: string) => {
        return `Hello, ${name}!`;
      };

      expect(typeof returningCallback).toBe('function');
      expect(returningCallback('World')).toBe('Hello, World!');
    });

    test('should accept function with multiple arguments', () => {
      const multiArgCallback: CallbackFunction<number> = (...numbers: number[]) => {
        return numbers.reduce((sum, num) => sum + num, 0);
      };

      expect(multiArgCallback(1, 2, 3, 4, 5)).toBe(15);
    });

    test('should accept async functions', () => {
      const asyncCallback: CallbackFunction<Promise<string>> = async (delay: number) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return 'completed';
      };

      expect(typeof asyncCallback).toBe('function');
      expect(asyncCallback(10)).toBeInstanceOf(Promise);
    });
  });

  describe('CleanupFunction', () => {
    test('should accept cleanup function', () => {
      const cleanup: CleanupFunction = () => {
        console.log('Cleaning up resources');
      };

      expect(typeof cleanup).toBe('function');
    });

    test('should work with resource cleanup', () => {
      let resourceCleaned = false;

      const cleanup: CleanupFunction = () => {
        resourceCleaned = true;
      };

      cleanup();
      expect(resourceCleaned).toBe(true);
    });

    test('should handle complex cleanup scenarios', () => {
      const resources: Array<{ cleanup: () => void }> = [
        { cleanup: jest.fn() },
        { cleanup: jest.fn() },
        { cleanup: jest.fn() },
      ];

      const cleanup: CleanupFunction = () => {
        resources.forEach(resource => resource.cleanup());
      };

      cleanup();

      resources.forEach(resource => {
        expect(resource.cleanup).toHaveBeenCalled();
      });
    });
  });

  describe('Type Compatibility', () => {
    test('should work with type unions', () => {
      const mixedValues: Array<ConfigValue> = [
        'string',
        42,
        true,
        [1, 2, 3],
        [0, 0, 0, 1],
        { key: 'value' },
      ];

      expect(mixedValues).toHaveLength(6);
      expect(typeof mixedValues[0]).toBe('string');
      expect(typeof mixedValues[1]).toBe('number');
      expect(typeof mixedValues[2]).toBe('boolean');
      expect(Array.isArray(mixedValues[3])).toBe(true);
      expect(Array.isArray(mixedValues[4])).toBe(true);
      expect(typeof mixedValues[5]).toBe('object');
    });

    test('should work with nested configurations', () => {
      const nestedConfig: GenericConfig = {
        physics: {
          gravity: -9.81,
          enabled: true,
        },
        graphics: {
          resolution: [1920, 1080],
          fullscreen: false,
        },
      };

      expect(nestedConfig.physics).toBeDefined();
      expect(nestedConfig.graphics).toBeDefined();
    });
  });

  describe('Real-world Usage Scenarios', () => {
    test('should handle click event processing', () => {
      const processClickEvent = (event: ClickEvent): PayloadData => {
        return {
          type: 'click-processed',
          data: {
            button: event.button,
            modifiers: {
              ctrl: event.ctrlKey,
              shift: event.shiftKey,
              alt: event.altKey,
            },
            position: event.point ? [event.point.x, event.point.y, event.point.z] : null,
          },
          timestamp: Date.now(),
        };
      };

      const clickEvent: ClickEvent = {
        type: 'click',
        button: 0,
        ctrlKey: true,
        shiftKey: false,
        altKey: false,
        point: new THREE.Vector3(10, 20, 30),
      };

      const payload = processClickEvent(clickEvent);
      expect(payload.type).toBe('click-processed');
      expect(payload.data?.button).toBe(0);
      expect(payload.data?.modifiers).toEqual({
        ctrl: true,
        shift: false,
        alt: false,
      });
    });

    test('should handle collision event processing', () => {
      const handleCollision = (event: CollisionEvent): void => {
        const damage = event.impulse ? Math.min(event.impulse * 0.1, 100) : 0;
        console.log(`Object ${event.objectId} collided with damage: ${damage}`);
      };

      const collisionEvent: CollisionEvent = {
        objectId: 'player-1',
        position: new THREE.Vector3(0, 0, 0),
        normal: new THREE.Vector3(0, 1, 0),
        impulse: 500,
      };

      expect(() => handleCollision(collisionEvent)).not.toThrow();
    });

    test('should handle configuration management', () => {
      const defaultConfig: GenericConfig = {
        physics: true,
        graphics: 'high',
        sound: 0.8,
        controls: {
          mouse: 1.0,
          keyboard: true,
        },
      };

      const userConfig: GenericConfig = {
        sound: 0.5,
        controls: {
          mouse: 1.5,
        },
      };

      const mergedConfig: GenericConfig = { ...defaultConfig, ...userConfig };

      expect(mergedConfig.physics).toBe(true);
      expect(mergedConfig.sound).toBe(0.5);
      expect(mergedConfig.controls).toEqual({ mouse: 1.5 });
    });
  });
}); 