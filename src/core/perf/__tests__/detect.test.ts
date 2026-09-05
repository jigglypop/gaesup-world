import { classifyTier, profileForTier } from '../detect';
import type { DeviceCapabilities } from '../types';

function caps(over: Partial<DeviceCapabilities> = {}): DeviceCapabilities {
  return {
    webgl2: true,
    maxTextureSize: 4096,
    rendererName: '',
    vendorName: '',
    cores: 8,
    memory: 8,
    isMobile: false,
    pixelRatio: 1,
    ...over,
  };
}

describe('perf/detect', () => {
  test('classifies high-end desktop GPUs as high', () => {
    expect(classifyTier(caps({ rendererName: 'NVIDIA GeForce RTX 4080' }))).toBe('high');
    expect(classifyTier(caps({ rendererName: 'Apple M2 Max' }))).toBe('high');
  });

  test('low-end integrated GPUs classify down', () => {
    expect(classifyTier(caps({ rendererName: 'Intel(R) HD Graphics', cores: 2, memory: 2 }))).toBe('low');
    expect(classifyTier(caps({ rendererName: 'SwiftShader' }))).toBe('low');
  });

  test('mobile devices default to low or medium', () => {
    expect(classifyTier(caps({ isMobile: true, rendererName: 'Mali-G77' }))).toBe('low');
    expect(classifyTier(caps({ isMobile: true, rendererName: 'Apple A17 Pro' }))).toBe('medium');
  });

  test('mid spec desktops classify as medium', () => {
    expect(classifyTier(caps({ rendererName: 'GeForce GTX 1050', cores: 4, memory: 4 }))).toBe('medium');
  });

  test('profileForTier scales instances and pixel ratio', () => {
    const low = profileForTier('low');
    const med = profileForTier('medium');
    const hi  = profileForTier('high');
    expect(low.instanceScale).toBeLessThan(med.instanceScale);
    expect(med.instanceScale).toBeLessThan(hi.instanceScale);
    expect(low.pixelRatio).toBeLessThanOrEqual(med.pixelRatio);
    expect(med.pixelRatio).toBeLessThanOrEqual(hi.pixelRatio);
    expect(low.postprocess).toBe(false);
    expect(hi.postprocess).toBe(true);
  });
});
