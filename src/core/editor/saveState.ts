export type EditorSaveState = 'clean' | 'dirty' | 'saving' | 'saved' | 'error';

export interface EditorSaveStatus {
  state: EditorSaveState;
  dirty: boolean;
  autosaveEnabled: boolean;
  autosaveIntervalMs?: number;
  lastChangedAt?: number;
  lastSavedAt?: number;
  nextAutosaveAt?: number;
  message?: string;
  error?: string;
}

export interface EditorSaveStatusInput {
  state?: EditorSaveState;
  dirty?: boolean;
  autosaveEnabled?: boolean;
  autosaveIntervalMs?: number;
  lastChangedAt?: number;
  lastSavedAt?: number;
  nextAutosaveAt?: number;
  message?: string;
  error?: string;
}

export function createEditorSaveStatus(input: EditorSaveStatusInput = {}): EditorSaveStatus {
  const state = input.state ?? (input.dirty ? 'dirty' : 'clean');
  return {
    state,
    dirty: input.dirty ?? state === 'dirty',
    autosaveEnabled: input.autosaveEnabled ?? true,
    ...(input.autosaveIntervalMs !== undefined ? { autosaveIntervalMs: input.autosaveIntervalMs } : {}),
    ...(input.lastChangedAt !== undefined ? { lastChangedAt: input.lastChangedAt } : {}),
    ...(input.lastSavedAt !== undefined ? { lastSavedAt: input.lastSavedAt } : {}),
    ...(input.nextAutosaveAt !== undefined ? { nextAutosaveAt: input.nextAutosaveAt } : {}),
    ...(input.message !== undefined ? { message: input.message } : {}),
    ...(input.error !== undefined ? { error: input.error } : {}),
  };
}

export function markEditorDirty(status: EditorSaveStatus, now = Date.now()): EditorSaveStatus {
  const nextAutosaveAt = getNextAutosaveAt(status, now);
  const rest = { ...status };
  delete rest.error;
  return {
    ...rest,
    state: 'dirty',
    dirty: true,
    lastChangedAt: now,
    message: 'Unsaved changes',
    ...(nextAutosaveAt !== undefined ? { nextAutosaveAt } : {}),
  };
}

export function markEditorSaving(status: EditorSaveStatus): EditorSaveStatus {
  const rest = { ...status };
  delete rest.error;
  return {
    ...rest,
    state: 'saving',
    dirty: true,
    message: 'Saving',
  };
}

export function markEditorSaved(status: EditorSaveStatus, now = Date.now()): EditorSaveStatus {
  const rest = { ...status };
  delete rest.nextAutosaveAt;
  delete rest.error;
  return {
    ...rest,
    state: 'saved',
    dirty: false,
    lastSavedAt: now,
    message: 'Saved',
  };
}

export function markEditorSaveError(status: EditorSaveStatus, error: string): EditorSaveStatus {
  return {
    ...status,
    state: 'error',
    dirty: true,
    message: 'Save failed',
    error,
  };
}

export function getNextAutosaveAt(status: Pick<EditorSaveStatus, 'autosaveEnabled' | 'autosaveIntervalMs'>, now = Date.now()): number | undefined {
  if (!status.autosaveEnabled) return undefined;
  return now + (status.autosaveIntervalMs ?? 30000);
}

export function shouldRunEditorAutosave(status: EditorSaveStatus, now = Date.now()): boolean {
  return Boolean(
    status.autosaveEnabled &&
    status.dirty &&
    status.state !== 'saving' &&
    status.nextAutosaveAt !== undefined &&
    status.nextAutosaveAt <= now,
  );
}

export function getEditorSaveStatusLabel(status: EditorSaveStatus, now = Date.now()): string {
  if (status.state === 'saving') return 'Saving';
  if (status.state === 'error') return status.error ? `Error: ${status.error}` : 'Save failed';
  if (!status.dirty) {
    if (status.lastSavedAt) return `Saved ${formatRelativeSeconds(now - status.lastSavedAt)} ago`;
    return status.state === 'saved' ? 'Saved' : 'Clean';
  }
  if (status.autosaveEnabled && status.nextAutosaveAt) {
    const remainingMs = Math.max(0, status.nextAutosaveAt - now);
    return `Unsaved, autosave in ${formatRelativeSeconds(remainingMs)}`;
  }
  return 'Unsaved changes';
}

function formatRelativeSeconds(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes}m`;
}
