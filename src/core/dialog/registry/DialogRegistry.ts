import type { DialogTree, DialogTreeId } from '../types';

class DialogRegistry {
  private trees = new Map<DialogTreeId, DialogTree>();

  register(tree: DialogTree): void {
    this.trees.set(tree.id, tree);
  }

  registerAll(trees: DialogTree[]): void {
    for (const t of trees) this.register(t);
  }

  get(id: DialogTreeId): DialogTree | undefined { return this.trees.get(id); }

  require(id: DialogTreeId): DialogTree {
    const t = this.trees.get(id);
    if (!t) throw new Error(`Unknown DialogTreeId: ${id}`);
    return t;
  }

  has(id: DialogTreeId): boolean { return this.trees.has(id); }
  clear(): void { this.trees.clear(); }
}

let _instance: DialogRegistry | null = null;
export function getDialogRegistry(): DialogRegistry {
  if (!_instance) _instance = new DialogRegistry();
  return _instance;
}
export type { DialogRegistry };
