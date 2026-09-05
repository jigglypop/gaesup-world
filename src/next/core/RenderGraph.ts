import type { RenderPassDescriptor } from '../types';

export class RenderGraph<TContext> {
  private passes = new Map<string, RenderPassDescriptor<TContext>>();
  private compiled: RenderPassDescriptor<TContext>[] | null = null;

  addPass(pass: RenderPassDescriptor<TContext>): void {
    if (this.passes.has(pass.id)) {
      throw new Error(`[RenderGraph Error]: duplicate pass id "${pass.id}"`);
    }
    this.passes.set(pass.id, pass);
    this.compiled = null;
  }

  removePass(id: string): boolean {
    const removed = this.passes.delete(id);
    if (removed) {
      this.compiled = null;
    }
    return removed;
  }

  compile(): readonly string[] {
    const writers = new Map<string, string>();
    for (const pass of this.passes.values()) {
      for (const resource of pass.writes ?? []) {
        const existing = writers.get(resource);
        if (existing) {
          throw new Error(
            `[RenderGraph Error]: resource "${resource}" written by both "${existing}" and "${pass.id}"`,
          );
        }
        writers.set(resource, pass.id);
      }
    }
    const states = new Map<string, 'visiting' | 'done'>();
    const ordered: RenderPassDescriptor<TContext>[] = [];
    const visit = (pass: RenderPassDescriptor<TContext>): void => {
      const state = states.get(pass.id);
      if (state === 'done') {
        return;
      }
      if (state === 'visiting') {
        throw new Error(`[RenderGraph Error]: pass dependency cycle at "${pass.id}"`);
      }
      states.set(pass.id, 'visiting');
      for (const resource of pass.reads ?? []) {
        const writerId = writers.get(resource);
        if (!writerId) {
          throw new Error(
            `[RenderGraph Error]: pass "${pass.id}" reads unwritten resource "${resource}"`,
          );
        }
        const writerPass = this.passes.get(writerId);
        if (writerPass && writerPass.id !== pass.id) {
          visit(writerPass);
        }
      }
      states.set(pass.id, 'done');
      ordered.push(pass);
    };
    for (const pass of this.passes.values()) {
      visit(pass);
    }
    this.compiled = ordered;
    return ordered.map((pass) => pass.id);
  }

  execute(context: TContext): void {
    if (!this.compiled) {
      this.compile();
    }
    const compiled = this.compiled;
    if (!compiled) {
      return;
    }
    for (const pass of compiled) {
      pass.execute(context);
    }
  }
}
