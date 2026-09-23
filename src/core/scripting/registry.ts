import type { ScriptDefinition, ScriptPropSchema } from './types';

const scripts = new Map<string, ScriptDefinition>();

export function defineScript<TSchema extends ScriptPropSchema>(
  definition: ScriptDefinition<TSchema>,
): ScriptDefinition<TSchema> {
  if (!definition.id.trim()) throw new Error('[ScriptRegistry Error]: 스크립트 id가 비어 있습니다');
  return definition;
}

export function registerScript<TSchema extends ScriptPropSchema>(definition: ScriptDefinition<TSchema>): () => void {
  const stored = definition as unknown as ScriptDefinition;
  scripts.set(definition.id, stored);
  return () => {
    if (scripts.get(definition.id) === stored) scripts.delete(definition.id);
  };
}

export function getScript(id: string): ScriptDefinition | undefined {
  return scripts.get(id);
}

export function listScripts(): ScriptDefinition[] {
  return Array.from(scripts.values());
}
