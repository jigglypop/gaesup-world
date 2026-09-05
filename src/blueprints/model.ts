import type { AnyBlueprint } from './types';

export function getBlueprintModelUrl(blueprint: AnyBlueprint): string {
  if (blueprint.type === 'character') {
    const model = blueprint.visuals?.model?.trim();
    if (model) return model;
    const body = blueprint.visuals?.parts?.find(part => part.type === 'body' && part.url.trim());
    if (body) return body.url.trim();
  }
  const model = blueprint.metadata?.['modelUrl'];
  return typeof model === 'string' ? model.trim() : '';
}
