import { type RuntimeSaveDiagnostic } from '../../../runtime';
import { type ToastKind } from '../Toast';
export type RuntimeSaveDiagnosticsToastKind = ToastKind | ((diagnostic: RuntimeSaveDiagnostic) => ToastKind);
export type RuntimeSaveDiagnosticsToastIcon = string | ((diagnostic: RuntimeSaveDiagnostic) => string | undefined);
export interface RuntimeSaveDiagnosticsToasterProps {
    enabled?: boolean;
    includeExisting?: boolean;
    durationMs?: number;
    kind?: RuntimeSaveDiagnosticsToastKind;
    icon?: RuntimeSaveDiagnosticsToastIcon;
    formatMessage?: (diagnostic: RuntimeSaveDiagnostic) => string;
}
export declare function formatRuntimeSaveDiagnosticToastMessage(diagnostic: RuntimeSaveDiagnostic): string;
export declare function RuntimeSaveDiagnosticsToaster({ enabled, includeExisting, durationMs, kind, icon, formatMessage, }: RuntimeSaveDiagnosticsToasterProps): null;
