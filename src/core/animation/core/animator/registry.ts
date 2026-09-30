import { defaultCharacterAnimator } from './defaultCharacterAnimator';
import type { AnimatorControllerDefinition } from './types';
import { validateAnimatorController } from './validate';

const controllers = new Map<string, AnimatorControllerDefinition>();
let defaultRegistered = false;

/** The default controller joins on first use rather than at import, still ahead of any caller's controller. */
function registry(): Map<string, AnimatorControllerDefinition> {
  if (!defaultRegistered) {
    defaultRegistered = true;
    registerAnimatorController(defaultCharacterAnimator);
  }
  return controllers;
}

export function registerAnimatorController(definition: AnimatorControllerDefinition): () => void {
  const validation = validateAnimatorController(definition);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(
      `[AnimatorRegistry Error]: 잘못된 컨트롤러 ${definition.id} (${first?.path}: ${first?.message})`,
    );
  }
  registry().set(definition.id, definition);
  return () => {
    if (controllers.get(definition.id) === definition) controllers.delete(definition.id);
  };
}

export function getAnimatorController(id: string): AnimatorControllerDefinition | undefined {
  return registry().get(id);
}

export function listAnimatorControllers(): AnimatorControllerDefinition[] {
  return Array.from(registry().values());
}
