import type { ProjectPhysicsSettings } from '../project-settings';
import type { SceneDocument, SceneLayerId, SceneObject, SceneTag } from './types';

export type SceneLayerPurpose = 'collision' | 'rendering' | 'editor' | 'selection';

export interface SceneLayerDefinition {
  id: SceneLayerId;
  name?: string;
  index?: number;
  purposes: SceneLayerPurpose[];
  visible: boolean;
  selectable: boolean;
}

export interface SceneTagDefinition {
  id: SceneTag;
  name?: string;
  color?: string;
}

export interface SceneLayerTagRegistry {
  layers: SceneLayerDefinition[];
  tags: SceneTagDefinition[];
}

export interface SceneLayerTagIssue {
  code:
    | 'duplicate-layer'
    | 'duplicate-layer-index'
    | 'duplicate-tag'
    | 'invalid-layer'
    | 'invalid-tag'
    | 'unknown-collision-layer'
    | 'unknown-object-layer'
    | 'unknown-object-tag';
  path: string;
  message: string;
}

export interface SceneLayerTagValidationResult {
  valid: boolean;
  issues: SceneLayerTagIssue[];
}

export interface CreateSceneLayerDefinitionInput {
  id: SceneLayerId;
  name?: string;
  index?: number;
  purposes?: SceneLayerPurpose[];
  visible?: boolean;
  selectable?: boolean;
}

export interface CreateSceneTagDefinitionInput {
  id: SceneTag;
  name?: string;
  color?: string;
}

export interface CreateSceneLayerTagRegistryInput {
  layers?: CreateSceneLayerDefinitionInput[];
  tags?: CreateSceneTagDefinitionInput[];
}

export const DEFAULT_SCENE_LAYERS: SceneLayerDefinition[] = [
  createSceneLayerDefinition({ id: 'default', index: 0, purposes: ['collision', 'rendering', 'editor', 'selection'] }),
  createSceneLayerDefinition({ id: 'environment', index: 1, purposes: ['collision', 'rendering', 'editor'] }),
  createSceneLayerDefinition({ id: 'player', index: 2, purposes: ['collision', 'rendering', 'selection'] }),
  createSceneLayerDefinition({ id: 'npc', index: 3, purposes: ['collision', 'rendering', 'selection'] }),
  createSceneLayerDefinition({ id: 'interactable', index: 4, purposes: ['collision', 'rendering', 'editor', 'selection'] }),
  createSceneLayerDefinition({ id: 'editor', index: 5, purposes: ['editor'], selectable: false }),
];

export const DEFAULT_SCENE_TAGS: SceneTagDefinition[] = [
  createSceneTagDefinition({ id: 'player' }),
  createSceneTagDefinition({ id: 'npc' }),
  createSceneTagDefinition({ id: 'resource' }),
  createSceneTagDefinition({ id: 'interactable' }),
  createSceneTagDefinition({ id: 'spawn' }),
];

export const DEFAULT_SCENE_LAYER_TAG_REGISTRY: SceneLayerTagRegistry = {
  layers: DEFAULT_SCENE_LAYERS,
  tags: DEFAULT_SCENE_TAGS,
};

export function createSceneLayerDefinition(input: CreateSceneLayerDefinitionInput): SceneLayerDefinition {
  return {
    id: input.id,
    ...(input.name ? { name: input.name } : {}),
    ...(input.index !== undefined ? { index: input.index } : {}),
    purposes: input.purposes ?? ['collision', 'rendering', 'editor', 'selection'],
    visible: input.visible ?? true,
    selectable: input.selectable ?? true,
  };
}

export function createSceneTagDefinition(input: CreateSceneTagDefinitionInput): SceneTagDefinition {
  return {
    id: input.id,
    ...(input.name ? { name: input.name } : {}),
    ...(input.color ? { color: input.color } : {}),
  };
}

export function createSceneLayerTagRegistry(
  input: CreateSceneLayerTagRegistryInput = {},
): SceneLayerTagRegistry {
  return {
    layers: input.layers?.map(createSceneLayerDefinition) ?? [...DEFAULT_SCENE_LAYERS],
    tags: input.tags?.map(createSceneTagDefinition) ?? [...DEFAULT_SCENE_TAGS],
  };
}

export function validateSceneLayerTagRegistry(
  registry: SceneLayerTagRegistry,
): SceneLayerTagValidationResult {
  const issues: SceneLayerTagIssue[] = [];
  const layerIds = new Set<SceneLayerId>();
  const layerIndexes = new Set<number>();
  const tagIds = new Set<SceneTag>();

  registry.layers.forEach((layer, index) => {
    if (!isValidId(layer.id)) {
      issues.push(issue('invalid-layer', `layers.${index}.id`, 'Layer id must be a non-empty string.'));
    }
    if (layerIds.has(layer.id)) {
      issues.push(issue('duplicate-layer', `layers.${index}.id`, `Duplicate layer "${layer.id}".`));
    }
    layerIds.add(layer.id);

    if (layer.index !== undefined) {
      if (!Number.isInteger(layer.index) || layer.index < 0) {
        issues.push(issue('invalid-layer', `layers.${index}.index`, 'Layer index must be a non-negative integer.'));
      } else if (layerIndexes.has(layer.index)) {
        issues.push(issue('duplicate-layer-index', `layers.${index}.index`, `Duplicate layer index ${layer.index}.`));
      }
      layerIndexes.add(layer.index);
    }
  });

  registry.tags.forEach((tag, index) => {
    if (!isValidId(tag.id)) {
      issues.push(issue('invalid-tag', `tags.${index}.id`, 'Tag id must be a non-empty string.'));
    }
    if (tagIds.has(tag.id)) {
      issues.push(issue('duplicate-tag', `tags.${index}.id`, `Duplicate tag "${tag.id}".`));
    }
    tagIds.add(tag.id);
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function validateSceneObjectLayersAndTags(
  document: SceneDocument,
  registry: SceneLayerTagRegistry,
): SceneLayerTagValidationResult {
  const issues: SceneLayerTagIssue[] = [...validateSceneLayerTagRegistry(registry).issues];
  const layerIds = new Set(registry.layers.map((layer) => layer.id));
  const tagIds = new Set(registry.tags.map((tag) => tag.id));

  document.objects.forEach((object) => {
    if (object.layer && !layerIds.has(object.layer)) {
      issues.push(issue('unknown-object-layer', objectPath(object, 'layer'), `Unknown layer "${object.layer}".`));
    }
    object.tags.forEach((tag, index) => {
      if (!tagIds.has(tag)) {
        issues.push(issue('unknown-object-tag', objectPath(object, `tags.${index}`), `Unknown tag "${tag}".`));
      }
    });
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function validateProjectCollisionLayers(
  physics: Pick<ProjectPhysicsSettings, 'collisionMatrix'>,
  registry: SceneLayerTagRegistry,
): SceneLayerTagValidationResult {
  const issues: SceneLayerTagIssue[] = [];
  const layerIds = new Set(registry.layers.map((layer) => layer.id));

  Object.entries(physics.collisionMatrix).forEach(([layer, collisions]) => {
    if (!layerIds.has(layer)) {
      issues.push(issue('unknown-collision-layer', `collisionMatrix.${layer}`, `Unknown collision layer "${layer}".`));
    }
    collisions.forEach((target, index) => {
      if (!layerIds.has(target)) {
        issues.push(issue('unknown-collision-layer', `collisionMatrix.${layer}.${index}`, `Unknown collision target "${target}".`));
      }
    });
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

export function canSceneLayersCollide(
  physics: Pick<ProjectPhysicsSettings, 'collisionMatrix'>,
  source: SceneLayerId,
  target: SceneLayerId,
): boolean {
  return Boolean(
    physics.collisionMatrix[source]?.includes(target) ||
    physics.collisionMatrix[target]?.includes(source),
  );
}

export function isSceneLayerVisible(registry: SceneLayerTagRegistry, layerId: SceneLayerId): boolean {
  return registry.layers.find((layer) => layer.id === layerId)?.visible ?? true;
}

export function isSceneLayerSelectable(registry: SceneLayerTagRegistry, layerId: SceneLayerId): boolean {
  return registry.layers.find((layer) => layer.id === layerId)?.selectable ?? true;
}

export function getSceneLayersByPurpose(
  registry: SceneLayerTagRegistry,
  purpose: SceneLayerPurpose,
): SceneLayerDefinition[] {
  return registry.layers.filter((layer) => layer.purposes.includes(purpose));
}

function objectPath(object: SceneObject, property: string): string {
  return `objects.${object.id}.${property}`;
}

function isValidId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function issue(code: SceneLayerTagIssue['code'], path: string, message: string): SceneLayerTagIssue {
  return { code, path, message };
}
