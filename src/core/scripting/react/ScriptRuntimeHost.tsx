import type { ScriptRuntimeHostProps } from './types';
import { useScriptRuntime } from './useScriptRuntime';

export function ScriptRuntimeHost(props: ScriptRuntimeHostProps) {
  useScriptRuntime(props);
  return null;
}
