import * as THREE from 'three';
import {
  addVectors,
  subtractVectors,
  multiplyVector,
  dotProduct,
  crossProduct,
  normalizeVector,
  vectorLength,
  vectorDistance,
  vectorLerp,
  vectorSlerp,
  vectorEquals,
  clampVector,
  vectorToArray,
  arrayToVector,
  vectorToString,
  angleBetweenVectors,
  projectVector,
  reflectVector,
  rotateVector,
  isZeroVector,
  getRandomVector,
  getRandomUnitVector
} from '../vector';

describe('Vector Utilities', () => {
  describe('Basic Vector Operations', () => {
    test('addVectors should add two vectors correctly', () => {
      const v1 = new THREE.Vector3(1, 2, 3);
      const v2 = new THREE.Vector3(4, 5, 6);
      const result = addVectors(v1, v2);
      
      expect(result).toEqual(new THREE.Vector3(5, 7, 9));
      // Should not modify original vectors
      expect(v1).toEqual(new THREE.Vector3(1, 2, 3));
      expect(v2).toEqual(new THREE.Vector3(4, 5, 6));
    });

    test('subtractVectors should subtract vectors correctly', () => {
      const v1 = new THREE.Vector3(5, 7, 9);
      const v2 = new THREE.Vector3(1, 2, 3);
      const result = subtractVectors(v1, v2);
      
      expect(result).toEqual(new THREE.Vector3(4, 5, 6));
    });

    test('multiplyVector should multiply vector by scalar', () => {
      const v = new THREE.Vector3(1, 2, 3);
      const result = multiplyVector(v, 2);
      
      expect(result).toEqual(new THREE.Vector3(2, 4, 6));
    });

    test('dotProduct should calculate dot product correctly', () => {
      const v1 = new THREE.Vector3(1, 2, 3);
      const v2 = new THREE.Vector3(4, 5, 6);
      const result = dotProduct(v1, v2);
      
      expect(result).toBe(32); // 1*4 + 2*5 + 3*6 = 32
    });

    test('crossProduct should calculate cross product correctly', () => {
      const v1 = new THREE.Vector3(1, 0, 0);
      const v2 = new THREE.Vector3(0, 1, 0);
      const result = crossProduct(v1, v2);
      
      expect(result).toEqual(new THREE.Vector3(0, 0, 1));
    });
  });

  describe('Vector Properties', () => {
    test('vectorLength should calculate magnitude correctly', () => {
      const v = new THREE.Vector3(3, 4, 0);
      const length = vectorLength(v);
      
      expect(length).toBe(5);
    });

    test('normalizeVector should create unit vector', () => {
      const v = new THREE.Vector3(3, 4, 0);
      const normalized = normalizeVector(v);
      
      expect(vectorLength(normalized)).toBeCloseTo(1, 5);
      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
      expect(normalized.z).toBe(0);
    });

    test('vectorDistance should calculate distance between points', () => {
      const v1 = new THREE.Vector3(0, 0, 0);
      const v2 = new THREE.Vector3(3, 4, 0);
      const distance = vectorDistance(v1, v2);
      
      expect(distance).toBe(5);
    });

    test('isZeroVector should detect zero vectors', () => {
      expect(isZeroVector(new THREE.Vector3(0, 0, 0))).toBe(true);
      expect(isZeroVector(new THREE.Vector3(0.0001, 0, 0), 0.001)).toBe(true);
      expect(isZeroVector(new THREE.Vector3(1, 0, 0))).toBe(false);
    });
  });

  describe('Vector Interpolation', () => {
    test('vectorLerp should interpolate linearly', () => {
      const v1 = new THREE.Vector3(0, 0, 0);
      const v2 = new THREE.Vector3(10, 10, 10);
      
      const result1 = vectorLerp(v1, v2, 0);
      const result2 = vectorLerp(v1, v2, 0.5);
      const result3 = vectorLerp(v1, v2, 1);
      
      expect(result1).toEqual(v1);
      expect(result2).toEqual(new THREE.Vector3(5, 5, 5));
      expect(result3).toEqual(v2);
    });

    test('vectorSlerp should interpolate spherically', () => {
      const v1 = new THREE.Vector3(1, 0, 0);
      const v2 = new THREE.Vector3(0, 1, 0);
      
      const result = vectorSlerp(v1, v2, 0.5);
      
      expect(vectorLength(result)).toBeCloseTo(1);
      expect(result.x).toBeCloseTo(result.y);
    });
  });

  describe('Vector Comparison and Equality', () => {
    test('vectorEquals should compare vectors with tolerance', () => {
      const v1 = new THREE.Vector3(1, 2, 3);
      const v2 = new THREE.Vector3(1, 2, 3);
      const v3 = new THREE.Vector3(1.0001, 2, 3);
      
      expect(vectorEquals(v1, v2)).toBe(true);
      expect(vectorEquals(v1, v3, 0.001)).toBe(true);
      expect(vectorEquals(v1, v3, 0.00001)).toBe(false);
    });

    test('clampVector should clamp vector components', () => {
      const v = new THREE.Vector3(-5, 10, 2);
      const result = clampVector(v, -2, 5);
      
      expect(result).toEqual(new THREE.Vector3(-2, 5, 2));
    });
  });

  describe('Vector Conversion', () => {
    test('vectorToArray should convert vector to array', () => {
      const v = new THREE.Vector3(1, 2, 3);
      const array = vectorToArray(v);
      
      expect(array).toEqual([1, 2, 3]);
    });

    test('arrayToVector should convert array to vector', () => {
      const array = [1, 2, 3];
      const vector = arrayToVector(array);
      
      expect(vector).toEqual(new THREE.Vector3(1, 2, 3));
    });

    test('vectorToString should format vector as string', () => {
      const v = new THREE.Vector3(1.234, 2.567, 3.891);
      const str = vectorToString(v, 2);
      
      expect(str).toBe('(1.23, 2.57, 3.89)');
    });
  });

  describe('Advanced Vector Operations', () => {
    test('angleBetweenVectors should calculate angle correctly', () => {
      const v1 = new THREE.Vector3(1, 0, 0);
      const v2 = new THREE.Vector3(0, 1, 0);
      const angle = angleBetweenVectors(v1, v2);
      
      expect(angle).toBeCloseTo(Math.PI / 2);
    });

    test('projectVector should project vector onto another', () => {
      const v = new THREE.Vector3(3, 4, 0);
      const onto = new THREE.Vector3(1, 0, 0);
      const projection = projectVector(v, onto);
      
      expect(projection).toEqual(new THREE.Vector3(3, 0, 0));
    });

    test('reflectVector should reflect vector across normal', () => {
      const v = new THREE.Vector3(1, -1, 0);
      const normal = new THREE.Vector3(0, 1, 0);
      const reflected = reflectVector(v, normal);
      
      expect(reflected).toEqual(new THREE.Vector3(1, 1, 0));
    });

    test('rotateVector should rotate vector around axis', () => {
      const v = new THREE.Vector3(1, 0, 0);
      const axis = new THREE.Vector3(0, 0, 1);
      const rotated = rotateVector(v, axis, Math.PI / 2);
      
      expect(rotated.x).toBeCloseTo(0, 5);
      expect(rotated.y).toBeCloseTo(1, 5);
      expect(rotated.z).toBeCloseTo(0, 5);
    });
  });

  describe('Random Vector Generation', () => {
    test('getRandomVector should generate random vector in range', () => {
      const random = getRandomVector(-1, 1);
      
      expect(random.x).toBeGreaterThanOrEqual(-1);
      expect(random.x).toBeLessThanOrEqual(1);
      expect(random.y).toBeGreaterThanOrEqual(-1);
      expect(random.y).toBeLessThanOrEqual(1);
      expect(random.z).toBeGreaterThanOrEqual(-1);
      expect(random.z).toBeLessThanOrEqual(1);
    });

    test('getRandomUnitVector should generate unit vector', () => {
      const random = getRandomUnitVector();
      const length = vectorLength(random);
      
      expect(length).toBeCloseTo(1, 5);
    });

    test('multiple random vectors should be different', () => {
      const v1 = getRandomVector();
      const v2 = getRandomVector();
      
      expect(vectorEquals(v1, v2)).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle zero vectors gracefully', () => {
      const zero = new THREE.Vector3(0, 0, 0);
      
      expect(normalizeVector(zero)).toEqual(zero);
      expect(vectorLength(zero)).toBe(0);
    });

    test('should handle very small vectors', () => {
      const tiny = new THREE.Vector3(1e-10, 1e-10, 1e-10);
      const normalized = normalizeVector(tiny);
      
      expect(isFinite(normalized.x)).toBe(true);
      expect(isFinite(normalized.y)).toBe(true);
      expect(isFinite(normalized.z)).toBe(true);
    });

    test('should handle extreme values', () => {
      const large = new THREE.Vector3(1e6, 1e6, 1e6);
      const result = normalizeVector(large);
      
      expect(vectorLength(result)).toBeCloseTo(1);
    });
  });

  describe('Performance Tests', () => {
    test('vector operations should be performant', () => {
      const v1 = new THREE.Vector3(1, 2, 3);
      const v2 = new THREE.Vector3(4, 5, 6);
      const iterations = 10000;
      
      const startTime = performance.now();
      for (let i = 0; i < iterations; i++) {
        addVectors(v1, v2);
        subtractVectors(v1, v2);
        multiplyVector(v1, 2);
        dotProduct(v1, v2);
      }
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete in <100ms
    });
  });
}); 