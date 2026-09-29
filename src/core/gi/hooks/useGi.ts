import { createContext, useContext } from 'react';

import type { GiIrradiance } from '../../rendering/tsl/types';

export const GiContext = createContext<GiIrradiance | null>(null);

export function useGi(): GiIrradiance | null {
  return useContext(GiContext);
}
