import type { ToolKind, ToolUseEvent, ToolUseHandler } from '../types';
declare class ToolEventBus {
    private byKind;
    private global;
    on(kind: ToolKind, handler: ToolUseHandler): () => void;
    onAny(handler: ToolUseHandler): () => void;
    emit(event: ToolUseEvent): void;
    clear(): void;
}
export declare function getToolEvents(): ToolEventBus;
export type { ToolEventBus };
