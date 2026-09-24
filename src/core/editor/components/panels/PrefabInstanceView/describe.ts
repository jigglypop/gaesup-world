import type { PrefabDocument, PrefabOverride } from '../../../../prefab';

export function describePrefabOverride(prefab: PrefabDocument, override: PrefabOverride): string {
  const nameOf = (objectId: string) =>
    prefab.objects.find((object) => object.id === objectId)?.name || objectId;
  switch (override.kind) {
    case 'property':
      return `${nameOf(override.objectId)} · ${override.path}`;
    case 'componentData':
      return `${nameOf(override.objectId)} · ${override.componentId} 데이터`;
    case 'addedComponent':
      return `${nameOf(override.objectId)} · ${override.component.type} 추가`;
    case 'removedComponent':
      return `${nameOf(override.objectId)} · ${override.componentId} 삭제`;
    case 'addedObject':
      return `${override.object.name || override.object.id} 추가`;
    case 'removedObject':
      return `${nameOf(override.objectId)} 삭제`;
  }
}
