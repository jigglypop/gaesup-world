import * as THREE from 'three';
import { MinimapSystem } from '../MinimapSystem';
import { MinimapMarker } from '../types';
import { SystemContext } from '@/core/boilerplate/entity/BaseSystem';

describe('MinimapSystem', () => {
  let minimapSystem: MinimapSystem;
  let mockContext: SystemContext;

  beforeEach(() => {
    // Reset singleton instance
    (MinimapSystem as any).instance = null;
    minimapSystem = MinimapSystem.getInstance();
    mockContext = {
      deltaTime: 16.67,
      totalTime: 1000,
      frameCount: 60
    };
  });

  afterEach(() => {
    minimapSystem.dispose();
    (MinimapSystem as any).instance = null;
  });

  describe('Singleton Pattern', () => {
    test('should return same instance when calling getInstance multiple times', () => {
      const instance1 = MinimapSystem.getInstance();
      const instance2 = MinimapSystem.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(minimapSystem);
    });

    test('should create new instance after disposal', () => {
      const originalInstance = MinimapSystem.getInstance();
      originalInstance.dispose();
      
      const newInstance = MinimapSystem.getInstance();
      expect(newInstance).not.toBe(originalInstance);
    });
  });

  describe('Marker Management', () => {
    test('should add marker successfully', () => {
      const center = new THREE.Vector3(10, 5, 15);
      const size = new THREE.Vector3(2, 2, 2);
      
      minimapSystem.addMarker('test-marker', 'normal', 'Test Marker', center, size);
      
      const marker = minimapSystem.getMarker('test-marker');
      expect(marker).toBeDefined();
      expect(marker?.id).toBe('test-marker');
      expect(marker?.type).toBe('normal');
      expect(marker?.text).toBe('Test Marker');
      expect(marker?.center).toEqual(center);
      expect(marker?.size).toEqual(size);
    });

    test('should remove marker successfully', () => {
      const center = new THREE.Vector3(1, 2, 3);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('remove-test', 'ground', 'Remove Test', center, size);
      expect(minimapSystem.getMarker('remove-test')).toBeDefined();
      
      minimapSystem.removeMarker('remove-test');
      expect(minimapSystem.getMarker('remove-test')).toBeUndefined();
    });

    test('should update existing marker', () => {
      const center = new THREE.Vector3(5, 5, 5);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('update-test', 'normal', 'Original Text', center, size);
      
      const newCenter = new THREE.Vector3(10, 10, 10);
      minimapSystem.updateMarker('update-test', {
        text: 'Updated Text',
        center: newCenter,
        type: 'ground'
      });
      
      const updatedMarker = minimapSystem.getMarker('update-test');
      expect(updatedMarker?.text).toBe('Updated Text');
      expect(updatedMarker?.center).toEqual(newCenter);
      expect(updatedMarker?.type).toBe('ground');
      expect(updatedMarker?.id).toBe('update-test'); // ID should remain unchanged
    });

    test('should not update non-existent marker', () => {
      const initialMarkerCount = minimapSystem.getMarkers().size;
      
      minimapSystem.updateMarker('non-existent', { text: 'New Text' });
      
      expect(minimapSystem.getMarkers().size).toBe(initialMarkerCount);
      expect(minimapSystem.getMarker('non-existent')).toBeUndefined();
    });

    test('should get all markers', () => {
      const center1 = new THREE.Vector3(1, 1, 1);
      const center2 = new THREE.Vector3(2, 2, 2);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('marker1', 'normal', 'Marker 1', center1, size);
      minimapSystem.addMarker('marker2', 'ground', 'Marker 2', center2, size);
      
      const markers = minimapSystem.getMarkers();
      expect(markers.size).toBe(2);
      expect(markers.has('marker1')).toBe(true);
      expect(markers.has('marker2')).toBe(true);
    });

    test('should return independent copy of markers map', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('test', 'normal', 'Test', center, size);
      
      const markers1 = minimapSystem.getMarkers();
      const markers2 = minimapSystem.getMarkers();
      
      expect(markers1).not.toBe(markers2);
      expect(markers1.size).toBe(markers2.size);
      
      // Modifying returned map should not affect system
      markers1.clear();
      expect(minimapSystem.getMarkers().size).toBe(1);
    });

    test('should clear all markers', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('marker1', 'normal', 'Marker 1', center, size);
      minimapSystem.addMarker('marker2', 'ground', 'Marker 2', center, size);
      
      expect(minimapSystem.getMarkers().size).toBe(2);
      
      minimapSystem.clear();
      
      expect(minimapSystem.getMarkers().size).toBe(0);
      expect(minimapSystem.getMarker('marker1')).toBeUndefined();
      expect(minimapSystem.getMarker('marker2')).toBeUndefined();
    });
  });

  describe('Subscription System', () => {
    test('should notify listeners when marker is added', () => {
      const listener = jest.fn();
      const unsubscribe = minimapSystem.subscribe(listener);
      
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('notify-test', 'normal', 'Notify Test', center, size);
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(expect.any(Map));
      
      const calledWith = listener.mock.calls[0][0] as Map<string, MinimapMarker>;
      expect(calledWith.has('notify-test')).toBe(true);
      
      unsubscribe();
    });

    test('should notify listeners when marker is removed', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('remove-notify', 'normal', 'Remove Notify', center, size);
      
      const listener = jest.fn();
      minimapSystem.subscribe(listener);
      
      minimapSystem.removeMarker('remove-notify');
      
      expect(listener).toHaveBeenCalledTimes(1);
      const calledWith = listener.mock.calls[0][0] as Map<string, MinimapMarker>;
      expect(calledWith.has('remove-notify')).toBe(false);
    });

    test('should notify listeners when marker is updated', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('update-notify', 'normal', 'Original', center, size);
      
      const listener = jest.fn();
      minimapSystem.subscribe(listener);
      
      minimapSystem.updateMarker('update-notify', { text: 'Updated' });
      
      expect(listener).toHaveBeenCalledTimes(1);
      const calledWith = listener.mock.calls[0][0] as Map<string, MinimapMarker>;
      expect(calledWith.get('update-notify')?.text).toBe('Updated');
    });

    test('should notify listeners when markers are cleared', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('clear-notify', 'normal', 'Clear Notify', center, size);
      
      const listener = jest.fn();
      minimapSystem.subscribe(listener);
      
      minimapSystem.clear();
      
      expect(listener).toHaveBeenCalledTimes(1);
      const calledWith = listener.mock.calls[0][0] as Map<string, MinimapMarker>;
      expect(calledWith.size).toBe(0);
    });

    test('should support multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      minimapSystem.subscribe(listener1);
      minimapSystem.subscribe(listener2);
      
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('multi-listener', 'normal', 'Multi Listener', center, size);
      
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    test('should unsubscribe listener correctly', () => {
      const listener = jest.fn();
      const unsubscribe = minimapSystem.subscribe(listener);
      
      // First operation should trigger listener
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('unsubscribe-test', 'normal', 'Unsubscribe Test', center, size);
      expect(listener).toHaveBeenCalledTimes(1);
      
      // Unsubscribe
      unsubscribe();
      
      // Second operation should not trigger listener
      minimapSystem.removeMarker('unsubscribe-test');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('System Lifecycle', () => {
    test('should initialize with empty markers', () => {
      expect(minimapSystem.getMarkers().size).toBe(0);
      expect(minimapSystem.getMetrics().markerCount).toBe(0);
    });

    test('should handle update calls', () => {
      expect(() => {
        minimapSystem.update(mockContext);
      }).not.toThrow();
    });

    test('should update metrics correctly', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      expect(minimapSystem.getMetrics().markerCount).toBe(0);
      
      minimapSystem.addMarker('metrics-test', 'normal', 'Metrics Test', center, size);
      expect(minimapSystem.getMetrics().markerCount).toBe(1);
      
      minimapSystem.addMarker('metrics-test2', 'ground', 'Metrics Test 2', center, size);
      expect(minimapSystem.getMetrics().markerCount).toBe(2);
      
      minimapSystem.removeMarker('metrics-test');
      expect(minimapSystem.getMetrics().markerCount).toBe(1);
      
      minimapSystem.clear();
      expect(minimapSystem.getMetrics().markerCount).toBe(0);
    });

    test('should dispose correctly', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('dispose-test', 'normal', 'Dispose Test', center, size);
      
      const listener = jest.fn();
      minimapSystem.subscribe(listener);
      
      expect(minimapSystem.getMarkers().size).toBe(1);
      
      minimapSystem.dispose();
      
      expect(minimapSystem.getMarkers().size).toBe(0);
      expect((MinimapSystem as any).instance).toBeNull();
      
      // Listener should not be called after disposal
      const newInstance = MinimapSystem.getInstance();
      newInstance.addMarker('new-test', 'normal', 'New Test', center, size);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Marker Types', () => {
    test('should handle normal type markers', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('normal-marker', 'normal', 'Normal Marker', center, size);
      
      const marker = minimapSystem.getMarker('normal-marker');
      expect(marker?.type).toBe('normal');
    });

    test('should handle ground type markers', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('ground-marker', 'ground', 'Ground Marker', center, size);
      
      const marker = minimapSystem.getMarker('ground-marker');
      expect(marker?.type).toBe('ground');
    });

    test('should preserve marker properties correctly', () => {
      const center = new THREE.Vector3(10, 20, 30);
      const size = new THREE.Vector3(5, 10, 15);
      const text = 'Detailed Test Marker';
      
      minimapSystem.addMarker('detailed-marker', 'ground', text, center, size);
      
      const marker = minimapSystem.getMarker('detailed-marker');
      expect(marker?.center.x).toBe(10);
      expect(marker?.center.y).toBe(20);
      expect(marker?.center.z).toBe(30);
      expect(marker?.size.x).toBe(5);
      expect(marker?.size.y).toBe(10);
      expect(marker?.size.z).toBe(15);
      expect(marker?.text).toBe(text);
    });
  });

  describe('Performance', () => {
    test('should handle large number of markers efficiently', () => {
      const startTime = performance.now();
      
      // Add 1000 markers
      for (let i = 0; i < 1000; i++) {
        const center = new THREE.Vector3(i, i, i);
        const size = new THREE.Vector3(1, 1, 1);
        minimapSystem.addMarker(`marker-${i}`, 'normal', `Marker ${i}`, center, size);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      
      expect(minimapSystem.getMarkers().size).toBe(1000);
      expect(minimapSystem.getMetrics().markerCount).toBe(1000);
    });

    test('should handle frequent updates efficiently', () => {
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      minimapSystem.addMarker('perf-test', 'normal', 'Performance Test', center, size);
      
      const startTime = performance.now();
      
      // Perform 1000 updates
      for (let i = 0; i < 1000; i++) {
        minimapSystem.updateMarker('perf-test', {
          center: new THREE.Vector3(i, i, i),
          text: `Updated ${i}`
        });
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid marker operations gracefully', () => {
      expect(() => {
        minimapSystem.removeMarker('non-existent');
      }).not.toThrow();
      
      expect(() => {
        minimapSystem.updateMarker('non-existent', { text: 'New Text' });
      }).not.toThrow();
      
      expect(() => {
        minimapSystem.getMarker('non-existent');
      }).not.toThrow();
    });

    test('should handle listener errors gracefully', () => {
      const faultyListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      
      minimapSystem.subscribe(faultyListener);
      
      const center = new THREE.Vector3(1, 1, 1);
      const size = new THREE.Vector3(1, 1, 1);
      
      expect(() => {
        minimapSystem.addMarker('error-test', 'normal', 'Error Test', center, size);
      }).toThrow();
    });
  });
}); 