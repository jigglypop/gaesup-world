import { useEffect } from 'react';

import {
  useGaesupRuntime,
  useGaesupRuntimeRevision,
  type RuntimeSaveDiagnostic,
} from '../../../runtime';
import { notify, type ToastKind } from '../Toast';

export type RuntimeSaveDiagnosticsToastKind =
  | ToastKind
  | ((diagnostic: RuntimeSaveDiagnostic) => ToastKind);

export type RuntimeSaveDiagnosticsToastIcon =
  | string
  | ((diagnostic: RuntimeSaveDiagnostic) => string | undefined);

export interface RuntimeSaveDiagnosticsToasterProps {
  enabled?: boolean;
  includeExisting?: boolean;
  durationMs?: number;
  kind?: RuntimeSaveDiagnosticsToastKind;
  icon?: RuntimeSaveDiagnosticsToastIcon;
  formatMessage?: (diagnostic: RuntimeSaveDiagnostic) => string;
}

export function formatRuntimeSaveDiagnosticToastMessage(
  diagnostic: RuntimeSaveDiagnostic,
): string {
  const phase = diagnostic.phase === 'serialize' ? '저장' : '불러오기';
  return `${phase} 실패: ${diagnostic.key} - ${diagnostic.errorMessage}`;
}

export function RuntimeSaveDiagnosticsToaster({
  enabled = true,
  includeExisting = false,
  durationMs = 6500,
  kind = 'error',
  icon,
  formatMessage = formatRuntimeSaveDiagnosticToastMessage,
}: RuntimeSaveDiagnosticsToasterProps) {
  const runtime = useGaesupRuntime();
  const revision = useGaesupRuntimeRevision();

  useEffect(() => {
    if (!enabled || !runtime) return undefined;

    const seenIds = new Set<number>();
    const emitToast = (diagnostic: RuntimeSaveDiagnostic) => {
      if (seenIds.has(diagnostic.id)) return;
      seenIds.add(diagnostic.id);

      const resolvedKind = resolveDiagnosticOption(kind, diagnostic);
      const resolvedIcon = icon ? resolveDiagnosticOption(icon, diagnostic) : undefined;

      notify(resolvedKind, formatMessage(diagnostic), {
        durationMs,
        ...(resolvedIcon ? { icon: resolvedIcon } : {}),
      });
    };

    const existingDiagnostics = runtime.saveDiagnostics.getDiagnostics();
    if (includeExisting) {
      existingDiagnostics.forEach(emitToast);
    } else {
      existingDiagnostics.forEach((diagnostic) => seenIds.add(diagnostic.id));
    }

    return runtime.saveDiagnostics.subscribe(emitToast);
  }, [durationMs, enabled, formatMessage, icon, includeExisting, kind, revision, runtime]);

  return null;
}

function resolveDiagnosticOption<TValue>(
  value: TValue | ((diagnostic: RuntimeSaveDiagnostic) => TValue),
  diagnostic: RuntimeSaveDiagnostic,
): TValue {
  if (typeof value === 'function') {
    return (value as (diagnostic: RuntimeSaveDiagnostic) => TValue)(diagnostic);
  }
  return value;
}
