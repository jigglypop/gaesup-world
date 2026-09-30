import { useEffect } from 'react';

import { reportError } from '../../utils/reportError';
import { shouldRunEditorAutosave, type EditorSaveStatus } from '../saveState';

export type UseEditorAutosaveOptions = {
  status?: EditorSaveStatus;
  onAutosave?: () => void | Promise<void>;
  enabled?: boolean;
};

export function useEditorAutosave({ status, onAutosave, enabled = true }: UseEditorAutosaveOptions): void {
  useEffect(() => {
    if (!enabled || !status || !onAutosave || !status.autosaveEnabled || !status.dirty || !status.nextAutosaveAt) {
      return undefined;
    }

    const delay = Math.max(0, status.nextAutosaveAt - Date.now());
    const timeout = window.setTimeout(() => {
      if (!shouldRunEditorAutosave(status)) return;
      // Sync throws and rejections alike reach the error sink instead of escaping the timer.
      void Promise.resolve().then(onAutosave).catch((error: unknown) => reportError(error, { source: 'save:editor-autosave' }));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [enabled, onAutosave, status]);
}
