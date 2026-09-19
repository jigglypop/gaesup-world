import { getGrassManager, type GrassManagerType } from './manager';
import { useGaesupRuntime } from '../../../../runtime/runtimeContext';

export function useGrassManager(): GrassManagerType {
  return useGaesupRuntime()?.grassManager ?? getGrassManager();
}
