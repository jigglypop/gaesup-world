import {
  createEditorSaveStatus,
  getEditorSaveStatusLabel,
  markEditorDirty,
  markEditorSaveError,
  markEditorSaved,
  markEditorSaving,
  shouldRunEditorAutosave,
} from '../saveState';

describe('editor save state', () => {
  test('tracks dirty, saving, saved, and error states', () => {
    const clean = createEditorSaveStatus({ autosaveIntervalMs: 10000 });
    const dirty = markEditorDirty(clean, 1000);

    expect(dirty.dirty).toBe(true);
    expect(dirty.state).toBe('dirty');
    expect(dirty.nextAutosaveAt).toBe(11000);

    const saving = markEditorSaving(dirty);
    expect(saving.state).toBe('saving');

    const saved = markEditorSaved(saving, 2000);
    expect(saved.dirty).toBe(false);
    expect(saved.lastSavedAt).toBe(2000);

    const failed = markEditorSaveError(saved, 'Disk full');
    expect(failed.state).toBe('error');
    expect(failed.error).toBe('Disk full');
  });

  test('detects autosave due time', () => {
    const status = createEditorSaveStatus({
      state: 'dirty',
      dirty: true,
      autosaveEnabled: true,
      nextAutosaveAt: 5000,
    });

    expect(shouldRunEditorAutosave(status, 4999)).toBe(false);
    expect(shouldRunEditorAutosave(status, 5000)).toBe(true);
  });

  test('formats visible save labels', () => {
    expect(getEditorSaveStatusLabel(createEditorSaveStatus({ state: 'saved', lastSavedAt: 1000 }), 4000)).toBe('Saved 3s ago');
    expect(getEditorSaveStatusLabel(createEditorSaveStatus({ state: 'dirty', dirty: true, nextAutosaveAt: 9000 }), 4000)).toBe('Unsaved, autosave in 5s');
  });
});
