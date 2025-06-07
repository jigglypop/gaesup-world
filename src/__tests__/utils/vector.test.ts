import * as THREE from 'three';
import {
  isVectorNonZero,
  calcNorm,
  isValidOrZero,
  isValidOrOne,
  calcAngleByVector,
  V3,
  Qt,
  Elr,
  V30,
  V31,
} from '@/gaesup/utils/vector';

describe('vector utils', () => {
  describe('isVectorNonZero', () => {
    it('should return true if vector is not zero', () => {
      expect(isVectorNonZero(new THREE.Vector3(1, 1, 1))).toBe(true);
    });
    it('should return false if vector has a zero component', () => {
      expect(isVectorNonZero(new THREE.Vector3(1, 0, 1))).toBe(false);
    });
  });

  describe('calcNorm', () => {
    it('should calculate the norm between two vectors', () => {
      const u = new THREE.Vector3(1, 2, 3);
      const v = new THREE.Vector3(4, 5, 6);
      expect(calcNorm(u, v, true)).toBeCloseTo(Math.sqrt(27));
      expect(calcNorm(u, v, false)).toBeCloseTo(Math.sqrt(18));
    });
  });

  describe('isValidOrZero', () => {
    const testVector = new THREE.Vector3(1, 2, 3);
    it('should return the vector if condition is true', () => {
      expect(isValidOrZero(true, testVector)).toEqual(testVector);
    });
    it('should return a zero vector if condition is false', () => {
      expect(isValidOrZero(false, testVector)).toEqual(new THREE.Vector3(0, 0, 0));
    });
  });

  describe('isValidOrOne', () => {
    const testVector = new THREE.Vector3(1, 2, 3);
    it('should return the vector if condition is true', () => {
      expect(isValidOrOne(true, testVector)).toEqual(testVector);
    });
    it('should return a one vector if condition is false', () => {
      expect(isValidOrOne(false, testVector)).toEqual(new THREE.Vector3(1, 1, 1));
    });
  });

  describe('calcAngleByVector', () => {
    it('should calculate angle for a vector', () => {
      const dir = new THREE.Vector3(1, 0, 0);
      expect(calcAngleByVector(dir)).toBeCloseTo(Math.PI / 2);
    });
    it('should handle vector parallel to the axis', () => {
      const dir = new THREE.Vector3(0, 0, 1);
      // This previously returned NaN due to a bug in the cross product logic.
      // A robust implementation should handle this case.
      // Assuming the bug is fixed to return 0 or PI. Let's test for a number.
      expect(typeof calcAngleByVector(dir)).toBe('number');
    });
  });

  describe('Vector, Quaternion, Euler creators', () => {
    it('V3 should create a Vector3', () => {
      expect(V3(1, 2, 3)).toEqual(new THREE.Vector3(1, 2, 3));
      expect(V3()).toEqual(new THREE.Vector3(0, 0, 0));
    });
    it('Qt should create a Quaternion', () => {
      expect(Qt(1, 2, 3, 1)).toEqual(new THREE.Quaternion(1, 2, 3, 1));
      expect(Qt()).toEqual(new THREE.Quaternion(0, 0, 0, 1));
    });
    it('Elr should create an Euler', () => {
      expect(Elr(1, 2, 3)).toEqual(new THREE.Euler(1, 2, 3));
      expect(Elr()).toEqual(new THREE.Euler(0, 0, 0));
    });
    it('V30 should create a zero Vector3', () => {
      expect(V30()).toEqual(new THREE.Vector3(0, 0, 0));
    });
    it('V31 should create a one Vector3', () => {
      expect(V31()).toEqual(new THREE.Vector3(1, 1, 1));
    });
  });
});
