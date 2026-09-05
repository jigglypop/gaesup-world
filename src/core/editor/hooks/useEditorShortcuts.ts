import { useEffect, useMemo } from 'react';

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
      internalRegistry.handleKeyDown(event as KeyboardEvent);
    };
    eventTarget.addEventListener('keydown', onKeyDown);
    return () => eventTarget.removeEventListener('keydown', onKeyDown);
  }, [enabled, internalRegistry, target]);

  return internalRegistry;
}
