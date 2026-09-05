import { useEffect } from 'react';

import { shouldRunEditorAutosave, type EditorSaveStatus } from '../saveState';

export interface UseEditorAutosaveOptions {
  status?: EditorSaveStatus;
  onAutosave?: () => void | Promise<void>;
  enabled?: boolean;
}

export function useEditorAutosave({ status, onAutosave, enabled = true }: UseEditorAutosaveOptions): void {
  useEffect(() => {
    if (!enabled || !status || !onAutosave || !status.autosaveEnabled || !status.dirty || !status.nextAutosaveAt) {
      return undefined;
    }

    const delay = Math.max(0, status.nextAutosaveAt - Date.now());
    const timeout = window.setTimeout(() => {
      if (shouldRunEditorAutosave(status)) {
        void onAutosave();
      }
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [enabled, onAutosave, status]);
}
