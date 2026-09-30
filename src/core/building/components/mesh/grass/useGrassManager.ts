import { createContext, useContext } from 'react';

import { getGrassManager, type GrassManagerType } from './manager';
import { useGaesupRuntime } from '../../../../runtime/runtimeContext';

const GrassManagerContext = createContext<GrassManagerType | null>(null);
/** Ownership for standalone R3F scenery that does not mount a complete world runtime. */
export const GrassManagerProvider = GrassManagerContext.Provider;

export function useGrassManager(): GrassManagerType {
  const explicit = useContext(GrassManagerContext);
  const runtime = useGaesupRuntime();
  return explicit ?? runtime?.grassManager ?? getGrassManager();
}
