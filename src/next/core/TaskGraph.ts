import type { TaskDescriptor, TaskPhase } from '../types';

export const TASK_PHASE_ORDER: readonly TaskPhase[] = ['input', 'simulate', 'physics', 'render'];

export class TaskGraph {
  private tasks = new Map<string, TaskDescriptor>();
  private compiled: TaskDescriptor[] | null = null;

  add(task: TaskDescriptor): void {
    if (this.tasks.has(task.id)) {
      throw new Error(`[TaskGraph Error]: duplicate task id "${task.id}"`);
    }
    this.tasks.set(task.id, task);
    this.compiled = null;
  }

  remove(id: string): boolean {
    const removed = this.tasks.delete(id);
    if (removed) {
      this.compiled = null;
    }
    return removed;
  }

  has(id: string): boolean {
    return this.tasks.has(id);
  }

  compile(): readonly string[] {
    const ordered: TaskDescriptor[] = [];
    for (const phase of TASK_PHASE_ORDER) {
      this.sortPhase(phase, ordered);
    }
    this.compiled = ordered;
    return ordered.map((task) => task.id);
  }

  run(deltaTime: number): void {
    if (!this.compiled) {
      this.compile();
    }
    const compiled = this.compiled;
    if (!compiled) {
      return;
    }
    for (const task of compiled) {
      task.run(deltaTime);
    }
  }

  private sortPhase(phase: TaskPhase, ordered: TaskDescriptor[]): void {
    const phaseIndex = TASK_PHASE_ORDER.indexOf(phase);
    const states = new Map<string, 'visiting' | 'done'>();
    const visit = (task: TaskDescriptor): void => {
      const state = states.get(task.id);
      if (state === 'done') {
        return;
      }
      if (state === 'visiting') {
        throw new Error(`[TaskGraph Error]: dependency cycle at "${task.id}"`);
      }
      states.set(task.id, 'visiting');
      for (const dep of task.deps ?? []) {
        const depTask = this.tasks.get(dep);
        if (!depTask) {
          throw new Error(`[TaskGraph Error]: unknown dependency "${dep}" of "${task.id}"`);
        }
        const depPhaseIndex = TASK_PHASE_ORDER.indexOf(depTask.phase);
        if (depPhaseIndex > phaseIndex) {
          throw new Error(`[TaskGraph Error]: "${task.id}" depends on later phase task "${dep}"`);
        }
        if (depPhaseIndex === phaseIndex) {
          visit(depTask);
        }
      }
      states.set(task.id, 'done');
      ordered.push(task);
    };
    for (const task of this.tasks.values()) {
      if (task.phase === phase) {
        visit(task);
      }
    }
  }
}
