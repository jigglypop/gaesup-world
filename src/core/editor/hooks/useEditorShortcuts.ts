import { useEffect, useMemo } from 'react';

import { useWorldInputScope } from '../../input/useWorldInputScope';
import {
  createEditorShortcutRegistry,
  type EditorShortcutBinding,
  type EditorShortcutRegistry,
} from '../shortcuts';

export interface UseEditorShortcutsOptions {
  enabled?: boolean;
  target?: Window | Document | HTMLElement | null;
  registry?: EditorShortcutRegistry;
}

export function useEditorShortcuts(
  bindings: EditorShortcutBinding[],
  options: UseEditorShortcutsOptions = {},
): EditorShortcutRegistry {
  const inputScope = useWorldInputScope();
  const { enabled = true, target, registry } = options;
  const internalRegistry = useMemo(() => registry ?? createEditorShortcutRegistry(), [registry]);

  useEffect(() => {
    const unregister = bindings.map((binding) => internalRegistry.register(binding));
    return () => {
      unregister.forEach((dispose) => dispose());
    };
  }, [bindings, internalRegistry]);

  useEffect(() => {
    if (!enabled) return undefined;
    const eventTarget = target ?? (typeof window !== 'undefined' ? window : undefined);
    if (!eventTarget) return undefined;

    const onKeyDown = (event: Event) => {
      if (inputScope.acceptsKeyboard(event as KeyboardEvent)) internalRegistry.handleKeyDown(event as KeyboardEvent);
    };
    if (!target || target === window || target === document) return inputScope.listen('keydown', onKeyDown);
    const offSurface = target instanceof HTMLElement ? inputScope.registerSurface(target) : undefined;
    eventTarget.addEventListener('keydown', onKeyDown);
    return () => { eventTarget.removeEventListener('keydown', onKeyDown); offSurface?.(); };
  }, [enabled, internalRegistry, target, inputScope]);

  return internalRegistry;
}
