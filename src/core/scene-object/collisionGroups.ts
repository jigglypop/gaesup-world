import type { ProjectPhysicsSettings } from '../project-settings';
import { canSceneLayersCollide, type SceneLayerDefinition, type SceneLayerTagRegistry } from './layers';
import type { SceneLayerId } from './types';

const COLLISION_GROUP_COUNT = 16;
const MEMBERSHIP_SHIFT = 16;

type IndexedCollisionLayer = SceneLayerDefinition & { index: number };

function isIndexedCollisionLayer(layer: SceneLayerDefinition): layer is IndexedCollisionLayer {
  return layer.purposes.includes('collision') && layer.index !== undefined && layer.index < COLLISION_GROUP_COUNT;
}

export function createSceneCollisionGroups(
  registry: SceneLayerTagRegistry,
  physics: Pick<ProjectPhysicsSettings, 'collisionMatrix'>,
): Map<SceneLayerId, number> {
  const layers = registry.layers.filter(isIndexedCollisionLayer);
  const groups = new Map<SceneLayerId, number>();
  layers.forEach((layer) => {
    let filter = 0;
    layers.forEach((other) => {
      if (canSceneLayersCollide(physics, layer.id, other.id)) filter |= 1 << other.index;
    });
    groups.set(layer.id, (((1 << layer.index) << MEMBERSHIP_SHIFT) | filter) >>> 0);
  });
  return groups;
}
