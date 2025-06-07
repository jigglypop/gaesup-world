import * as THREE from 'three';
import {
  createVectorCache,
  getCachedTrig,
  clearTrigCache,
  normalizeAngle,
  shouldUpdate,
  shouldUpdateVector3,
  MemoizationManager,
} from '../memoization';

describe('memoization utils', () => {
  describe('createVectorCache', () => {
    it('should create a vector cache', () => {
      const cache = createVectorCache();
      expect(cache).toBeDefined();
    });

    it('should provide temp vectors', () => {
      const cache = createVectorCache();
      const vec = cache.getTempVector(0);
      expect(vec).toBeInstanceOf(THREE.Vector3);
      vec.set(1, 2, 3);
      const vec2 = cache.getTempVector(10);
      expect(vec2).toBe(vec); // same object due to modulo
      expect(vec2.x).toBe(0); // should be reset
    });

    it('should cache vectors', () => {
      const cache = createVectorCache();
      const factory = jest.fn(() => new THREE.Vector3(1, 2, 3));
      const vec1 = cache.getCached('key1', factory);
      const vec2 = cache.getCached('key1', factory);
      expect(factory).toHaveBeenCalledTimes(1);
      expect(vec1).toBe(vec2);
    });
  });

  describe('trig cache', () => {
    afterEach(() => {
      clearTrigCache();
    });

    it('should cache sin/cos values', () => {
      const angle = Math.PI / 4;
      const originalMathSin = Math.sin;
      const mathSinSpy = jest.spyOn(Math, 'sin');
      const trig1 = getCachedTrig(angle);
      const trig2 = getCachedTrig(angle);
      expect(mathSinSpy).toHaveBeenCalledTimes(1);
      expect(trig1).toBe(trig2);
      expect(trig1.sin).toBeCloseTo(originalMathSin(angle));
      mathSinSpy.mockRestore();
    });
  });

  describe('normalizeAngle', () => {
    it('should normalize angles to be within -PI and PI', () => {
      expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
      expect(normalizeAngle(-3 * Math.PI)).toBeCloseTo(-Math.PI);
      expect(normalizeAngle(Math.PI / 2)).toBeCloseTo(Math.PI / 2);
    });
  });

  describe('shouldUpdate', () => {
    it('should return true if value difference is above threshold', () => {
      expect(shouldUpdate(1.0, 1.02, 0.01)).toBe(true);
    });
    it('should return false if value difference is below threshold', () => {
      expect(shouldUpdate(1.0, 1.005, 0.01)).toBe(false);
    });
  });

  describe('shouldUpdateVector3', () => {
    const v1 = new THREE.Vector3(1, 1, 1);
    it('should return true if vector distance is above threshold', () => {
      const v2 = new THREE.Vector3(1.1, 1.1, 1.1);
      expect(shouldUpdateVector3(v1, v2, 0.1)).toBe(true);
    });
    it('should return false if vector distance is below threshold', () => {
      const v2 = new THREE.Vector3(1.01, 1.01, 1.01);
      expect(shouldUpdateVector3(v1, v2, 0.1)).toBe(false);
    });
  });

  describe('MemoizationManager', () => {
    it('should be a singleton', () => {
      const instance1 = MemoizationManager.getInstance();
      const instance2 = MemoizationManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should manage multiple vector caches', () => {
      const manager = MemoizationManager.getInstance();
      const cache1 = manager.getVectorCache('id1');
      const cache2 = manager.getVectorCache('id2');
      expect(cache1).not.toBe(cache2);
    });
  });
});
