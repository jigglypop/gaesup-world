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
    message: '저장하지 않은 변경 사항',
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
    message: '저장 중',
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
    message: '저장 완료',
  };
}

export function markEditorSaveError(status: EditorSaveStatus, error: string): EditorSaveStatus {
  return {
    ...status,
    state: 'error',
    dirty: true,
    message: '저장 실패',
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
  if (status.state === 'saving') return '저장 중';
  if (status.state === 'error') return status.error ? `저장 실패: ${status.error}` : '저장 실패';
  if (!status.dirty) {
    if (status.lastSavedAt) return `${formatRelativeSeconds(now - status.lastSavedAt)} 전 저장됨`;
    return status.state === 'saved' ? '저장 완료' : '변경 사항 없음';
  }
  if (status.autosaveEnabled && status.nextAutosaveAt) {
    const remainingMs = Math.max(0, status.nextAutosaveAt - now);
    return `저장 대기 · ${formatRelativeSeconds(remainingMs)} 후 자동 저장`;
  }
  return '저장하지 않은 변경 사항';
}

function formatRelativeSeconds(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes}분`;
}
