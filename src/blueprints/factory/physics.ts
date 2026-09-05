import type { BlueprintDefinition } from '../core/types';
import type { AnyBlueprint } from '../types';

export function getBlueprintPhysics(blueprint?: AnyBlueprint): NonNullable<BlueprintDefinition['physics']> {
  const mass = blueprint && 'physics' in blueprint ? blueprint.physics.mass : undefined;
  switch (blueprint?.type ?? 'character') {
    case 'character':
      return { mass: mass ?? 1, friction: 0.5, restitution: 0, linearDamping: 4, angularDamping: 10 };
    case 'vehicle':
      return { mass: mass ?? 150, friction: 0.8, restitution: 0.2, linearDamping: 0.5, angularDamping: 1 };
    case 'airplane':
      return { mass: mass ?? 500, friction: 0.1, restitution: 0.1, linearDamping: 0.2, angularDamping: 0.5 };
    default:
      return { mass: 1, friction: 0.5, restitution: 0.5 };
  }
}
