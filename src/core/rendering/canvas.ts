import { version as reactVersion } from 'react';

import type { CanvasProps } from '@react-three/fiber';

import { createLegacyRenderer, createRenderer } from './webgpu';

type CanvasRendererFactory = Extract<
  NonNullable<CanvasProps['gl']>,
  (...args: never[]) => unknown
>;

function supportsAsyncCanvasRenderer(): boolean {
  const major = Number.parseInt(reactVersion.split('.')[0] ?? '', 10);
  return Number.isFinite(major) && major >= 19;
}

/**
 * Canvas renderer factory for the supported React/R3F compatibility matrix.
 * R3F 8 on React 18 requires a renderer synchronously; R3F 9 on React 19 accepts
 * the async WebGPU-first factory.
 */
export const createCanvasRenderer = (
  supportsAsyncCanvasRenderer() ? createRenderer : createLegacyRenderer
) as CanvasRendererFactory;
