import { lazy, Suspense } from 'react';

import type { GridProps } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

import { Grid } from '../legacyDrei';
import { isWebGPURenderer } from '../tsl/grass';

const NodeGrid = lazy(() => import('./NodeGrid'));

export type WorldGridProps = Omit<GridProps, 'ref'>;

/** Renderer-aware grid; the WebGPU facade also supports TSL on its WebGL backend. */
export function WorldGrid(props: WorldGridProps) {
  const webgpu = useThree((state) => isWebGPURenderer(state.gl));
  return webgpu ? <Suspense fallback={null}><NodeGrid {...props} /></Suspense> : <Grid {...props} />;
}
