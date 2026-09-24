import { getDefaultWorldInputScope } from './WorldInputScope';
import { useGaesupRuntime } from '../runtime/runtimeContext';

export function useWorldInputScope() {
  return useGaesupRuntime()?.inputScope ?? getDefaultWorldInputScope();
}
