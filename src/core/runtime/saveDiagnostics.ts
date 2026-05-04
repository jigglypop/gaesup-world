import type { SaveDiagnostic } from '../save';

export const DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID = 'runtime.saveDiagnostics';
export const RUNTIME_SAVE_DIAGNOSTIC_EVENT = 'runtime:saveDiagnostic';

export interface RuntimeSaveDiagnostic extends SaveDiagnostic {
  id: number;
  reportedAt: number;
  errorMessage: string;
  message: string;
}

export type RuntimeSaveDiagnosticListener = (diagnostic: RuntimeSaveDiagnostic) => void;

export interface RuntimeSaveDiagnosticsOptions {
  maxEntries?: number;
}

export interface RuntimeSaveDiagnosticsService {
  report(diagnostic: SaveDiagnostic): RuntimeSaveDiagnostic;
  getDiagnostics(): RuntimeSaveDiagnostic[];
  getLatest(): RuntimeSaveDiagnostic | undefined;
  clear(): void;
  subscribe(listener: RuntimeSaveDiagnosticListener): () => void;
}

export function createRuntimeSaveDiagnostics(
  options: RuntimeSaveDiagnosticsOptions = {},
): RuntimeSaveDiagnosticsService {
  const maxEntries = Math.max(1, options.maxEntries ?? 50);
  const diagnostics: RuntimeSaveDiagnostic[] = [];
  const listeners = new Set<RuntimeSaveDiagnosticListener>();
  let nextId = 1;

  return {
    report(diagnostic) {
      const errorMessage = toErrorMessage(diagnostic.error);
      const record: RuntimeSaveDiagnostic = {
        ...diagnostic,
        id: nextId,
        reportedAt: Date.now(),
        errorMessage,
        message: formatRuntimeSaveDiagnostic(diagnostic, errorMessage),
      };
      nextId += 1;
      diagnostics.push(record);
      if (diagnostics.length > maxEntries) {
        diagnostics.splice(0, diagnostics.length - maxEntries);
      }
      for (const listener of listeners) {
        listener(record);
      }
      return record;
    },
    getDiagnostics() {
      return diagnostics.map((diagnostic) => ({ ...diagnostic }));
    },
    getLatest() {
      const latest = diagnostics[diagnostics.length - 1];
      return latest ? { ...latest } : undefined;
    },
    clear() {
      diagnostics.length = 0;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function formatRuntimeSaveDiagnostic(
  diagnostic: SaveDiagnostic,
  errorMessage = toErrorMessage(diagnostic.error),
): string {
  return `Save domain "${diagnostic.key}" failed during ${diagnostic.phase} for slot "${diagnostic.slot}": ${errorMessage}`;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown save error';
}
