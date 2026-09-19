import { getDefaultWorldInputActions } from './WorldInputActions';
import { useGaesupRuntime } from '../runtime/runtimeContext';

export function useWorldInputActions() { return useGaesupRuntime()?.inputActions ?? getDefaultWorldInputActions(); }
