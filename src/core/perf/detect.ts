import type { DeviceCapabilities, PerfProfile, PerfTier } from './types';

declare global {
  interface Navigator {
    deviceMemory?: number;
  }
}

const LOW_GPU_HINTS = ['intel', 'mali', 'adreno 3', 'adreno 4', 'powervr'];
const SOFTWARE_GPU_HINTS = ['swiftshader', 'llvmpipe', 'software'];
const HIGH_GPU_HINTS = ['rtx', 'radeon rx', 'apple m', 'apple a1', 'apple a2'];

/** GPU identity read from a renderer that already exists, so detection needs no context of its own. */
export type RendererIdentity = Pick<DeviceCapabilities, 'webgl2' | 'maxTextureSize' | 'rendererName' | 'vendorName'>;

type AdapterInfo = { vendor?: string; architecture?: string; device?: string; description?: string };
type IdentitySource = {
  backend?: { isWebGPUBackend?: boolean; device?: { adapterInfo?: AdapterInfo; limits?: { maxTextureDimension2D?: number } }; gl?: unknown };
  getContext?: () => unknown;
};

function readWebGLIdentity(gl: WebGLRenderingContext | WebGL2RenderingContext): RendererIdentity {
  const dbg = gl.getExtension('WEBGL_debug_renderer_info') as { UNMASKED_RENDERER_WEBGL: number; UNMASKED_VENDOR_WEBGL: number } | null;
  return {
    webgl2: typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext,
    maxTextureSize: (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) || 0,
    rendererName: dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '',
    vendorName: dbg ? String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '') : '',
  };
}

function isWebGLContext(value: unknown): value is WebGLRenderingContext | WebGL2RenderingContext {
  return typeof value === 'object' && value !== null && typeof (value as WebGLRenderingContext).getParameter === 'function';
}

/** Reads the GPU identity from a WebGPU or WebGL renderer, or null when the renderer does not expose it. */
export function readRendererIdentity(renderer: unknown): RendererIdentity | null {
  const source = renderer as IdentitySource | null;
  if (!source) return null;
  const info = source.backend?.isWebGPUBackend ? source.backend.device?.adapterInfo : undefined;
  if (info) {
    return {
      webgl2: true,
      maxTextureSize: source.backend?.device?.limits?.maxTextureDimension2D ?? 0,
      rendererName: [info.vendor, info.architecture, info.device, info.description].filter(Boolean).join(' '),
      vendorName: info.vendor ?? '',
    };
  }
  const gl = source.backend?.gl ?? (typeof source.getContext === 'function' ? source.getContext() : null);
  return isWebGLContext(gl) ? readWebGLIdentity(gl) : null;
}

function probeIdentity(): RendererIdentity {
  const canvas = document.createElement('canvas');
  const gl =
    (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
    (canvas.getContext('webgl') as WebGLRenderingContext | null);
  if (!gl) return { webgl2: false, maxTextureSize: 0, rendererName: '', vendorName: '' };
  const identity = readWebGLIdentity(gl);
  // Browsers cap live contexts; a probe that is never released can push out the world's own canvas.
  (gl.getExtension('WEBGL_lose_context') as { loseContext(): void } | null)?.loseContext();
  return identity;
}

export function detectCapabilities(identity?: RendererIdentity | null): DeviceCapabilities {
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

  const { webgl2, maxTextureSize, rendererName, vendorName } = identity ?? probeIdentity();
  const cores = (navigator.hardwareConcurrency as number | undefined) ?? 4;
  const memory = navigator.deviceMemory ?? 4;
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

export function autoDetectProfile(identity?: RendererIdentity | null): { profile: PerfProfile; capabilities: DeviceCapabilities } {
  const capabilities = detectCapabilities(identity);
  const tier = classifyTier(capabilities);
  return { profile: profileForTier(tier), capabilities };
}
