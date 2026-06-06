import React from 'react';

import { getEditorSaveStatusLabel, type EditorSaveStatus } from '../saveState';

export interface SaveStatusIndicatorProps {
  status: EditorSaveStatus;
  onSave?: () => void | Promise<void>;
  onToggleAutosave?: (enabled: boolean) => void;
}

export function SaveStatusIndicator({ status, onSave, onToggleAutosave }: SaveStatusIndicatorProps): React.ReactElement {
  const label = getEditorSaveStatusLabel(status);
  const canSave = Boolean(onSave) && status.state !== 'saving' && status.dirty;

  return (
    <div className={`editor-save-status editor-save-status--${status.state}`} aria-label="Editor save status">
      <div className="editor-save-status__main">
        <span className="editor-save-status__dot" aria-hidden="true" />
        <span className="editor-save-status__label">{label}</span>
      </div>
      <div className="editor-save-status__actions">
        {onToggleAutosave && (
          <button
            type="button"
            className={status.autosaveEnabled ? 'active' : ''}
            onClick={() => onToggleAutosave(!status.autosaveEnabled)}
            title="Toggle autosave"
          >
            Auto
          </button>
        )}
        {onSave && (
          <button type="button" onClick={() => { void onSave(); }} disabled={!canSave}>
            Save
          </button>
        )}
      </div>
    </div>
  );
}
