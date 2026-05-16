import type { ToolKind, ToolUseHandler } from '../types';
export declare function useToolUse(kind: ToolKind, handler: ToolUseHandler, enabled?: boolean): void;
export declare function useEquippedToolKind(): ToolKind | null;
