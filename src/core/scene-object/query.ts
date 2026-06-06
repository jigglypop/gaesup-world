import type { SceneRuntime } from './runtime';
import type {
  SceneComponent,
  SceneComponentType,
  SceneLayerId,
  SceneObject,
  SceneObjectId,
  SceneTag,
} from './types';

export interface SceneObjectQuery {
  id?: SceneObjectId;
  name?: string;
  parentId?: SceneObjectId;
  tag?: SceneTag;
  tags?: SceneTag[];
  layer?: SceneLayerId;
  componentType?: SceneComponentType;
  componentTypes?: SceneComponentType[];
}

export function findSceneObjects(runtime: SceneRuntime, query: SceneObjectQuery = {}): SceneObject[] {
  return Array.from(runtime.objects.values()).filter((object) => matchesSceneObjectQuery(object, query));
}

export function findSceneObject(runtime: SceneRuntime, query: SceneObjectQuery): SceneObject | undefined {
  return findSceneObjects(runtime, query)[0];
}

export function findSceneObjectsByTag(runtime: SceneRuntime, tag: SceneTag): SceneObject[] {
  return findSceneObjects(runtime, { tag });
}

export function findSceneObjectsByLayer(runtime: SceneRuntime, layer: SceneLayerId): SceneObject[] {
  return findSceneObjects(runtime, { layer });
}

export function findSceneObjectsWithComponent(
  runtime: SceneRuntime,
  componentType: SceneComponentType,
): SceneObject[] {
  return findSceneObjects(runtime, { componentType });
}

export function getSceneObjectComponent<TComponent extends SceneComponent = SceneComponent>(
  object: SceneObject,
  componentType: SceneComponentType,
): TComponent | undefined {
  return object.components.find((component) => component.type === componentType) as TComponent | undefined;
}

export function getSceneObjectComponents<TComponent extends SceneComponent = SceneComponent>(
  object: SceneObject,
  componentType: SceneComponentType,
): TComponent[] {
  return object.components.filter((component) => component.type === componentType) as TComponent[];
}

export function hasSceneObjectComponent(object: SceneObject, componentType: SceneComponentType): boolean {
  return object.components.some((component) => component.type === componentType);
}

export function matchesSceneObjectQuery(object: SceneObject, query: SceneObjectQuery): boolean {
  if (query.id !== undefined && object.id !== query.id) return false;
  if (query.name !== undefined && object.name !== query.name) return false;
  if (query.parentId !== undefined && object.parentId !== query.parentId) return false;
  if (query.layer !== undefined && object.layer !== query.layer) return false;
  if (query.tag !== undefined && !object.tags.includes(query.tag)) return false;
  if (query.tags !== undefined && !query.tags.every((tag) => object.tags.includes(tag))) return false;
  if (query.componentType !== undefined && !hasSceneObjectComponent(object, query.componentType)) return false;
  if (
    query.componentTypes !== undefined &&
    !query.componentTypes.every((componentType) => hasSceneObjectComponent(object, componentType))
  ) {
    return false;
  }
  return true;
}
