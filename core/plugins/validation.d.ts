import type { GaesupPlugin, PluginContextOptions, PluginDiagnostic, PluginManifest, PluginRuntime } from './types';
export type PluginValidationIssueCode = 'dependency' | 'diagnostic' | 'manifest' | 'runtime' | 'save-namespace' | 'setup';
export interface PluginValidationIssue {
    code: PluginValidationIssueCode;
    message: string;
    pluginId: string;
    details?: unknown;
}
export interface PluginValidationOptions {
    dependencies?: GaesupPlugin[];
    expectedRuntime?: PluginRuntime | PluginRuntime[];
    requiredSaveNamespaces?: string[];
    allowedSaveNamespaces?: string[];
    registry?: PluginContextOptions;
}
export interface PluginValidationResult {
    ok: boolean;
    pluginId: string;
    manifest: PluginManifest | null;
    issues: PluginValidationIssue[];
    diagnostics: PluginDiagnostic[];
    saveNamespaces: string[];
}
export declare class PluginValidationAssertionError extends Error {
    readonly result: PluginValidationResult;
    constructor(result: PluginValidationResult);
}
export declare function validateGaesupPlugin(plugin: GaesupPlugin, options?: PluginValidationOptions): Promise<PluginValidationResult>;
export declare function assertValidGaesupPlugin(plugin: GaesupPlugin, options?: PluginValidationOptions): Promise<PluginValidationResult>;
