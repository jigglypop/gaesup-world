import type { SceneComponent, SceneObject, SceneObjectId, SceneTransform } from '../scene-object';
import type { InstantiatePrefabOptions, PrefabDocument } from './types';

let prefabInstanceCounter = 0;

export function instantiatePrefabObjects(
  prefab: PrefabDocument,
  options: InstantiatePrefabOptions = {},
): SceneObject[] {
  const idPrefix = options.idPrefix ?? `${prefab.id}-${++prefabInstanceCounter}`;
  const idMap = new Map<SceneObjectId, SceneObjectId>();
  for (const object of prefab.objects) {
    idMap.set(object.id, `${idPrefix}:${object.id}`);
  }

  return prefab.objects.map((object) => {
    const id = idMap.get(object.id) ?? `${idPrefix}:${object.id}`;
    const parentId = object.parentId === undefined
      ? options.parentId
      : idMap.get(object.parentId);
    const isRoot = prefab.rootObjectIds.includes(object.id);
    const objectWithoutParent = { ...object };
    delete objectWithoutParent.parentId;
    return {
      ...objectWithoutParent,
      id,
      name: options.nameSuffix ? `${object.name}${options.nameSuffix}` : object.name,
      ...(parentId !== undefined ? { parentId } : {}),
      transform: isRoot && options.rootTransform
        ? mergeSceneTransform(object.transform, options.rootTransform)
        : cloneSceneTransform(object.transform),
      components: object.components.map((component) => clonePrefabComponent(component, idPrefix)),
      tags: [...object.tags],
    };
  });
}

function clonePrefabComponent(component: SceneComponent, idPrefix: string): SceneComponent {
  return {
    ...component,
    id: `${idPrefix}:${component.id}`,
    data: JSON.parse(JSON.stringify(component.data)) as SceneComponent['data'],
  };
}

function mergeSceneTransform(transform: SceneTransform, patch: Partial<SceneTransform>): SceneTransform {
  return {
    position: patch.position ? [...patch.position] : [...transform.position],
    rotation: patch.rotation ? [...patch.rotation] : [...transform.rotation],
    scale: patch.scale ? [...patch.scale] : [...transform.scale],
  };
}

function cloneSceneTransform(transform: SceneTransform): SceneTransform {
  return {
    position: [...transform.position],
    rotation: [...transform.rotation],
    scale: [...transform.scale],
  };
}
