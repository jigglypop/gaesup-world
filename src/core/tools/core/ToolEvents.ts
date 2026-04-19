import type { ToolKind, ToolUseEvent, ToolUseHandler } from '../types';

class ToolEventBus {
  private byKind = new Map<ToolKind, Set<ToolUseHandler>>();
  private global = new Set<ToolUseHandler>();

  on(kind: ToolKind, handler: ToolUseHandler): () => void {
    let set = this.byKind.get(kind);
    if (!set) { set = new Set(); this.byKind.set(kind, set); }
    set.add(handler);
    return () => { set!.delete(handler); };
  }

  onAny(handler: ToolUseHandler): () => void {
    this.global.add(handler);
    return () => { this.global.delete(handler); };
  }

  emit(event: ToolUseEvent): void {
    const set = this.byKind.get(event.kind);
    if (set) {
      for (const h of set) {
        const consumed = h(event);
        if (consumed === true) return;
      }
    }
    for (const h of this.global) h(event);
  }

  clear(): void { this.byKind.clear(); this.global.clear(); }
}

let _instance: ToolEventBus | null = null;
export function getToolEvents(): ToolEventBus {
  if (!_instance) _instance = new ToolEventBus();
  return _instance;
}
export type { ToolEventBus };
