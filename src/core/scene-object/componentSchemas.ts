import type { SceneComponentType, SceneJsonObject } from './types';

export type SceneComponentDataValidator = (data: SceneJsonObject) => string | null;

const validators = new Map<SceneComponentType, SceneComponentDataValidator>();

export function registerSceneComponentSchema(
  type: SceneComponentType,
  validator: SceneComponentDataValidator,
): () => void {
  validators.set(type, validator);
  return () => {
    if (validators.get(type) === validator) validators.delete(type);
  };
}

export function validateSceneComponentData(type: SceneComponentType, data: SceneJsonObject): string | null {
  const validator = validators.get(type);
  if (!validator) return null;
  try {
    return validator(data);
  } catch (error) {
    return error instanceof Error ? error.message : 'Component data validator failed.';
  }
}
