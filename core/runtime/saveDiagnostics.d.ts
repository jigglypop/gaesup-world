import type { SaveDiagnostic } from '../save';
export declare const DEFAULT_RUNTIME_SAVE_DIAGNOSTICS_SERVICE_ID = "runtime.saveDiagnostics";
export declare const RUNTIME_SAVE_DIAGNOSTIC_EVENT = "runtime:saveDiagnostic";
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
export declare function createRuntimeSaveDiagnostics(options?: RuntimeSaveDiagnosticsOptions): RuntimeSaveDiagnosticsService;
export declare function formatRuntimeSaveDiagnostic(diagnostic: SaveDiagnostic, errorMessage?: string): string;
