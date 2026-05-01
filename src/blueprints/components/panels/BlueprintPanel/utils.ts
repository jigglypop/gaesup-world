import { BlueprintItem, BlueprintType } from './types';
import type { AnyBlueprint } from '../../../types';

const getBlueprintItemType = (blueprint: AnyBlueprint): BlueprintType => {
  switch (blueprint.type) {
    case 'animation-sequence':
      return 'animation';
    case 'behavior-tree':
      return 'behavior';
    default:
      return blueprint.type;
  }
};

export const convertBlueprintToItem = (blueprint: AnyBlueprint): BlueprintItem => {
  return {
    id: blueprint.id,
    name: blueprint.name,
    type: getBlueprintItemType(blueprint),
    version: blueprint.version,
    tags: blueprint.tags || [],
    description: blueprint.description ?? '',
    lastModified: new Date().toISOString().split('T')[0] ?? '',
  };
};
