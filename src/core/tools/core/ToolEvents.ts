import type { ToolKind, ToolUseEvent, ToolUseHandler } from '../types';

class ToolEventBus {
  private active = true;
  private generation = 0;
  private byKind = new Map<ToolKind, Map<ToolUseHandler, number>>();
  private global = new Map<ToolUseHandler, number>();

  private subscribe(handlers: Map<ToolUseHandler, number>, handler: ToolUseHandler): () => void {
    handlers.set(handler, (handlers.get(handler) ?? 0) + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const owners = handlers.get(handler) ?? 0;
      if (owners <= 1) handlers.delete(handler);
      else handlers.set(handler, owners - 1);
    };
  }

  on(kind: ToolKind, handler: ToolUseHandler): () => void {
    let set = this.byKind.get(kind);
    if (!set) { set = new Map(); this.byKind.set(kind, set); }
    return this.subscribe(set, handler);
  }

  onAny(handler: ToolUseHandler): () => void {
    return this.subscribe(this.global, handler);
  }

  emit(event: ToolUseEvent): void {
    if (!this.active) return;
    const generation = this.generation;
    const set = this.byKind.get(event.kind);
    if (set) {
      for (const h of Array.from(set.keys())) {
        if (!set.has(h)) continue;
        const consumed = h(event);
        if (consumed === true || !this.active || generation !== this.generation) return;
      }
    }
    for (const h of Array.from(this.global.keys())) {
      if (!this.active || generation !== this.generation) break;
      if (this.global.has(h)) h(event);
    }
  }

  clear(): void { this.generation++; this.byKind.clear(); this.global = new Map(); }
  suspend(): void { this.active = false; this.clear(); }
  resume(): void { this.active = true; }
}

export function createToolEvents(): ToolEventBus { return new ToolEventBus(); }

let _instance: ToolEventBus | null = null;
export function getToolEvents(): ToolEventBus {
  if (!_instance) _instance = createToolEvents();
  return _instance;
}
export type { ToolEventBus };
