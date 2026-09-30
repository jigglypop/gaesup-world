import { collectPrefabSubtreeIds } from './core';
import { instantiatePrefabObjects } from './instantiate';
import type {
  ComputePrefabOverridesOptions,
  InstantiatePrefabOptions,
  PrefabDocument,
  PrefabInstanceLink,
  PrefabInstanceResult,
  PrefabOverride,
  PrefabPropertyPath,
} from './types';
import { SCENE_COMPONENT_TYPES } from '../scene-object/components';
import type {
  SceneComponent,
  SceneJsonObject,
  SceneJsonValue,
  SceneObject,
  SceneObjectId,
  SceneVector3,
} from '../scene-object/types';
import { createUniqueId } from '../utils/id';

type IdMapper = (sourceId: string) => string;

const TRANSFORM_PATHS: Array<{ path: PrefabPropertyPath; key: 'position' | 'rotation' | 'scale' }> = [
  { path: 'transform.position', key: 'position' },
  { path: 'transform.rotation', key: 'rotation' },
  { path: 'transform.scale', key: 'scale' },
];

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function prefixMapper(idPrefix: string): IdMapper {
  return (sourceId) => `${idPrefix}:${sourceId}`;
}

function isLinkComponent(component: SceneComponent): boolean {
  return component.type === SCENE_COMPONENT_TYPES.prefabInstance;
}

function createLinkComponent(link: PrefabInstanceLink, objectId: SceneObjectId): SceneComponent {
  return {
    id: `${objectId}:prefab-link`,
    type: SCENE_COMPONENT_TYPES.prefabInstance,
    enabled: true,
    data: { prefabId: link.prefabId, idPrefix: link.idPrefix },
  };
}

export function readPrefabInstanceLink(object: SceneObject): PrefabInstanceLink | null {
  const component = object.components.find(isLinkComponent);
  const prefabId = component?.data['prefabId'];
  const idPrefix = component?.data['idPrefix'];
  return typeof prefabId === 'string' && typeof idPrefix === 'string' ? { prefabId, idPrefix } : null;
}

export function createPrefabInstance(
  prefab: PrefabDocument,
  options: InstantiatePrefabOptions = {},
): PrefabInstanceResult {
  const idPrefix = options.idPrefix ?? createUniqueId(`${prefab.id}-instance`);
  const link: PrefabInstanceLink = { prefabId: prefab.id, idPrefix };
  const mapId = prefixMapper(idPrefix);
  const rootIds = new Set(prefab.rootObjectIds.map(mapId));
  const objects = instantiatePrefabObjects(prefab, { ...options, idPrefix }).map((object) =>
    rootIds.has(object.id)
      ? { ...object, components: [...object.components, createLinkComponent(link, object.id)] }
      : object,
  );
  return { objects, link };
}

function readProperty(object: SceneObject, path: PrefabPropertyPath): SceneJsonValue {
  switch (path) {
    case 'name':
      return object.name;
    case 'tags':
      return [...object.tags];
    case 'layer':
      return object.layer ?? null;
    case 'transform.position':
      return [...object.transform.position];
    case 'transform.rotation':
      return [...object.transform.rotation];
    case 'transform.scale':
      return [...object.transform.scale];
  }
}

function writeProperty(object: SceneObject, path: PrefabPropertyPath, value: SceneJsonValue): SceneObject {
  switch (path) {
    case 'name':
      return typeof value === 'string' ? { ...object, name: value } : object;
    case 'tags':
      return Array.isArray(value) ? { ...object, tags: value.filter((tag): tag is string => typeof tag === 'string') } : object;
    case 'layer': {
      if (typeof value === 'string') return { ...object, layer: value };
      const withoutLayer = { ...object };
      delete withoutLayer.layer;
      return withoutLayer;
    }
    default: {
      const entry = TRANSFORM_PATHS.find((candidate) => candidate.path === path);
      if (!entry || !Array.isArray(value) || value.length !== 3) return object;
      return { ...object, transform: { ...object.transform, [entry.key]: [...value] as unknown as SceneVector3 } };
    }
  }
}

export function computePrefabOverrides(
  prefab: PrefabDocument,
  instanceObjects: readonly SceneObject[],
  link: PrefabInstanceLink,
  options: ComputePrefabOverridesOptions = {},
): PrefabOverride[] {
  const mapId = prefixMapper(link.idPrefix);
  const instanceById = new Map(instanceObjects.map((object) => [object.id, object]));
  const mappedIds = new Set<string>();
  const overrides: PrefabOverride[] = [];
  const rootIds = new Set(prefab.rootObjectIds);

  for (const source of prefab.objects) {
    const instanceId = mapId(source.id);
    mappedIds.add(instanceId);
    const instance = instanceById.get(instanceId);
    if (!instance) {
      overrides.push({ kind: 'removedObject', objectId: source.id });
      continue;
    }
    const paths: PrefabPropertyPath[] = ['name', 'tags', 'layer'];
    if (!rootIds.has(source.id) || options.includeRootTransform) paths.push(...TRANSFORM_PATHS.map((entry) => entry.path));
    for (const path of paths) {
      const value = readProperty(instance, path);
      if (!sameJson(readProperty(source, path), value)) overrides.push({ kind: 'property', objectId: source.id, path, value });
    }
    const componentIds = new Set<string>();
    for (const component of source.components) {
      const componentId = mapId(component.id);
      componentIds.add(componentId);
      const instanceComponent = instance.components.find((entry) => entry.id === componentId);
      if (!instanceComponent) {
        overrides.push({ kind: 'removedComponent', objectId: source.id, componentId: component.id });
      } else if (!sameJson(component.data, instanceComponent.data) || component.enabled !== instanceComponent.enabled) {
        overrides.push({
          kind: 'componentData',
          objectId: source.id,
          componentId: component.id,
          data: cloneJson(instanceComponent.data) as SceneJsonObject,
          enabled: instanceComponent.enabled,
        });
      }
    }
    for (const component of instance.components) {
      if (componentIds.has(component.id) || isLinkComponent(component)) continue;
      overrides.push({ kind: 'addedComponent', objectId: source.id, component: cloneJson(component) });
    }
  }

  for (const object of instanceObjects) {
    if (!mappedIds.has(object.id)) overrides.push({ kind: 'addedObject', object: cloneJson(object) });
  }
  return overrides;
}

function applyOverridesToObjects(
  objects: SceneObject[],
  overrides: readonly PrefabOverride[],
  mapId: IdMapper,
): SceneObject[] {
  let result = objects;
  const replace = (objectId: string, update: (object: SceneObject) => SceneObject) => {
    const targetId = mapId(objectId);
    result = result.map((object) => (object.id === targetId ? update(object) : object));
  };
  for (const override of overrides) {
    switch (override.kind) {
      case 'property':
        replace(override.objectId, (object) => writeProperty(object, override.path, override.value));
        break;
      case 'componentData':
        replace(override.objectId, (object) => ({
          ...object,
          components: object.components.map((component) =>
            component.id === mapId(override.componentId)
              ? { ...component, data: cloneJson(override.data), enabled: override.enabled }
              : component,
          ),
        }));
        break;
      case 'addedComponent':
        replace(override.objectId, (object) =>
          object.components.some((component) => component.id === override.component.id)
            ? object
            : { ...object, components: [...object.components, cloneJson(override.component)] },
        );
        break;
      case 'removedComponent':
        replace(override.objectId, (object) => ({
          ...object,
          components: object.components.filter((component) => component.id !== mapId(override.componentId)),
        }));
        break;
      case 'addedObject':
        if (!result.some((object) => object.id === override.object.id)) result = [...result, cloneJson(override.object)];
        break;
      case 'removedObject': {
        const removed = collectPrefabSubtreeIds(result, [mapId(override.objectId)]);
        result = result.filter((object) => !removed.has(object.id));
        break;
      }
    }
  }
  return result;
}

export function applyPrefabOverrides(
  prefab: PrefabDocument,
  overrides: readonly PrefabOverride[],
  link: PrefabInstanceLink,
): SceneObject[] {
  const { objects } = createPrefabInstance(prefab, { idPrefix: link.idPrefix });
  return applyOverridesToObjects(objects, overrides, prefixMapper(link.idPrefix));
}

export function propagatePrefabChanges(
  previousPrefab: PrefabDocument,
  nextPrefab: PrefabDocument,
  instanceObjects: readonly SceneObject[],
  link: PrefabInstanceLink,
): SceneObject[] {
  const overrides = computePrefabOverrides(previousPrefab, instanceObjects, link, { includeRootTransform: true });
  return applyPrefabOverrides(nextPrefab, overrides, link);
}

function isSameOverride(a: PrefabOverride, b: PrefabOverride): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'property':
      return b.kind === 'property' && a.objectId === b.objectId && a.path === b.path;
    case 'componentData':
      return b.kind === 'componentData' && a.objectId === b.objectId && a.componentId === b.componentId;
    case 'addedComponent':
      return b.kind === 'addedComponent' && a.objectId === b.objectId && a.component.id === b.component.id;
    case 'removedComponent':
      return b.kind === 'removedComponent' && a.objectId === b.objectId && a.componentId === b.componentId;
    case 'addedObject':
      return b.kind === 'addedObject' && a.object.id === b.object.id;
    case 'removedObject':
      return b.kind === 'removedObject' && a.objectId === b.objectId;
  }
}

export function revertPrefabOverride(
  prefab: PrefabDocument,
  instanceObjects: readonly SceneObject[],
  link: PrefabInstanceLink,
  target: PrefabOverride,
): SceneObject[] {
  const remaining = computePrefabOverrides(prefab, instanceObjects, link, { includeRootTransform: true })
    .filter((override) => !isSameOverride(override, target));
  return applyPrefabOverrides(prefab, remaining, link);
}

export function applyInstanceToPrefab(
  prefab: PrefabDocument,
  instanceObjects: readonly SceneObject[],
  link: PrefabInstanceLink,
): PrefabDocument {
  const prefix = `${link.idPrefix}:`;
  const strip = (id: string) => (id.startsWith(prefix) ? id.slice(prefix.length) : id);
  const overrides = computePrefabOverrides(prefab, instanceObjects, link).map((override): PrefabOverride => {
    if (override.kind === 'addedComponent') {
      return { ...override, component: { ...override.component, id: strip(override.component.id) } };
    }
    if (override.kind === 'addedObject') {
      return {
        kind: 'addedObject',
        object: {
          ...override.object,
          id: strip(override.object.id),
          ...(override.object.parentId !== undefined ? { parentId: strip(override.object.parentId) } : {}),
          components: override.object.components.filter((component) => !isLinkComponent(component)),
        },
      };
    }
    return override;
  });
  return {
    ...prefab,
    objects: applyOverridesToObjects(cloneJson(prefab.objects), overrides, (id) => id),
    metadata: { ...prefab.metadata, updatedAt: new Date().toISOString() },
  };
}

export function createPrefabVariant(
  base: PrefabDocument,
  input: { id: string; name?: string; overrides: readonly PrefabOverride[] },
): PrefabDocument {
  return {
    ...base,
    id: input.id,
    name: input.name ?? `${base.name} Variant`,
    objects: applyOverridesToObjects(cloneJson(base.objects), input.overrides, (id) => id),
    metadata: { ...base.metadata, tags: [...base.metadata.tags], sourceSceneId: base.id },
  };
}
