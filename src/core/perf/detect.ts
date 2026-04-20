import type { DeviceCapabilities, PerfProfile, PerfTier } from './types';

const LOW_GPU_HINTS = ['intel', 'mali', 'adreno 3', 'adreno 4', 'powervr'];
const SOFTWARE_GPU_HINTS = ['swiftshader', 'llvmpipe', 'software'];
const HIGH_GPU_HINTS = ['rtx', 'radeon rx', 'apple m', 'apple a1', 'apple a2'];

export function detectCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      webgl2: false,
      maxTextureSize: 0,
      rendererName: '',
      vendorName: '',
      cores: 4,
      memory: 4,
      isMobile: false,
      pixelRatio: 1,
    };
  }

  const canvas = document.createElement('canvas');
  const gl =
    (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
    (canvas.getContext('webgl') as WebGLRenderingContext | null);

  let rendererName = '';
  let vendorName = '';
  let maxTextureSize = 0;
  let webgl2 = false;

  if (gl) {
    webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    maxTextureSize = (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) || 0;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      rendererName = String(gl.getParameter((dbg as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL) || '');
      vendorName = String(gl.getParameter((dbg as { UNMASKED_VENDOR_WEBGL: number }).UNMASKED_VENDOR_WEBGL) || '');
    }
  }

  const cores = (navigator.hardwareConcurrency as number | undefined) ?? 4;
  const memory = ((navigator as unknown as { deviceMemory?: number }).deviceMemory) ?? 4;
  const isMobile = /android|iphone|ipad|ipod|mobile|opera mini/i.test(navigator.userAgent);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  return {
    webgl2,
    maxTextureSize,
    rendererName,
    vendorName,
    cores,
    memory,
    isMobile,
    pixelRatio,
  };
}

export function classifyTier(caps: DeviceCapabilities): PerfTier {
  const renderer = caps.rendererName.toLowerCase();
  if (SOFTWARE_GPU_HINTS.some((h) => renderer.includes(h))) return 'low';
  if (caps.isMobile) {
    if (HIGH_GPU_HINTS.some((h) => renderer.includes(h))) return 'medium';
    return 'low';
  }
  if (LOW_GPU_HINTS.some((h) => renderer.includes(h))) {
    if (caps.cores >= 8 && caps.memory >= 8) return 'medium';
    return 'low';
  }
  if (HIGH_GPU_HINTS.some((h) => renderer.includes(h))) return 'high';
  if (caps.cores >= 8 && caps.memory >= 8 && caps.webgl2) return 'high';
  if (caps.cores >= 4 && caps.memory >= 4) return 'medium';
  return 'low';
}

export function profileForTier(tier: PerfTier): PerfProfile {
  if (tier === 'high') {
    return {
      tier,
      instanceScale: 1.0,
      pixelRatio: 2.0,
      shadowMapSize: 2048,
      postprocess: true,
      outline: true,
    };
  }
  if (tier === 'medium') {
    return {
      tier,
      instanceScale: 0.7,
      pixelRatio: 1.5,
      shadowMapSize: 1024,
      postprocess: true,
      outline: true,
    };
  }
  return {
    tier,
    instanceScale: 0.4,
    pixelRatio: 1.0,
    shadowMapSize: 512,
    postprocess: false,
    outline: false,
  };
}

export function autoDetectProfile(): { profile: PerfProfile; capabilities: DeviceCapabilities } {
  const capabilities = detectCapabilities();
  const tier = classifyTier(capabilities);
  return { profile: profileForTier(tier), capabilities };
}
