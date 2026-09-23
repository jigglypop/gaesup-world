import { defaultCharacterAnimator } from './defaultCharacterAnimator';
import type { AnimatorControllerDefinition } from './types';
import { validateAnimatorController } from './validate';

const controllers = new Map<string, AnimatorControllerDefinition>();

export function registerAnimatorController(definition: AnimatorControllerDefinition): () => void {
  const validation = validateAnimatorController(definition);
  if (!validation.valid) {
    const first = validation.issues[0];
    throw new Error(
      `[AnimatorRegistry Error]: 잘못된 컨트롤러 ${definition.id} (${first?.path}: ${first?.message})`,
    );
  }
  controllers.set(definition.id, definition);
  return () => {
    if (controllers.get(definition.id) === definition) controllers.delete(definition.id);
  };
}

export function getAnimatorController(id: string): AnimatorControllerDefinition | undefined {
  return controllers.get(id);
}

export function listAnimatorControllers(): AnimatorControllerDefinition[] {
  return Array.from(controllers.values());
}

registerAnimatorController(defaultCharacterAnimator);
