import type { PrefabDocument, PrefabOverride } from '../../../../prefab';
import type { SceneDocument, SceneObject, SceneObjectId } from '../../../../scene-object';

export type InspectorPrefabActions = {
  prefabs: readonly PrefabDocument[];
  onCreate?: (objectId: SceneObjectId) => void;
  onRevertOverride?: (rootObjectId: SceneObjectId, prefab: PrefabDocument, override: PrefabOverride) => void;
  onRevertAll?: (rootObjectId: SceneObjectId, prefab: PrefabDocument) => void;
  onApply?: (rootObjectId: SceneObjectId, prefab: PrefabDocument) => void;
};

export type PrefabInstanceViewProps = InspectorPrefabActions & {
  document: SceneDocument;
  object: SceneObject;
};
