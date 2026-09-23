import { useMemo, useSyncExternalStore } from 'react';

import {
  applyInstanceToPrefab,
  collectPrefabSubtreeIds,
  createPrefabFromSceneObjects,
  findPrefabInstanceLink,
  getPrefabInstanceObjects,
  readPrefabInstanceLink,
  type PrefabDocument,
  type PrefabOverride,
  type SceneDocumentController,
  type SceneObjectId,
} from 'gaesup-world';
import type {
  EditorShellCommand,
  InspectorPrefabActions,
  SceneObjectEditorCommandFactory,
} from 'gaesup-world/editor';

const PREFAB_ID_PREFIX = 'example-prefab';
const PLACEMENT_OFFSET = 2;

export type WorldScenePrefabLibrary = {
  getPrefabs: () => readonly PrefabDocument[];
  subscribe: (listener: () => void) => () => void;
  create: (objectId: SceneObjectId) => Promise<SceneObjectId | null>;
  place: (prefabId: string) => Promise<boolean>;
  revertOverride: (rootObjectId: SceneObjectId, prefab: PrefabDocument, override: PrefabOverride) => Promise<boolean>;
  revertAll: (rootObjectId: SceneObjectId, prefab: PrefabDocument) => Promise<boolean>;
  apply: (rootObjectId: SceneObjectId, prefab: PrefabDocument) => Promise<boolean>;
};

type WorldScenePrefabLibraryDeps = {
  controller: SceneDocumentController;
  commands: SceneObjectEditorCommandFactory;
  execute: (label: string, createCommand: () => EditorShellCommand) => Promise<boolean>;
};

export function createWorldScenePrefabLibrary({
  controller,
  commands,
  execute,
}: WorldScenePrefabLibraryDeps): WorldScenePrefabLibrary {
  let prefabs: readonly PrefabDocument[] = [];
  let prefabSequence = 1;
  let instanceSequence = 1;
  const listeners = new Set<() => void>();
  const setPrefabs = (next: readonly PrefabDocument[]) => {
    prefabs = next;
    listeners.forEach((listener) => listener());
  };
  const withLibrary = (
    command: EditorShellCommand,
    after: readonly PrefabDocument[],
  ): EditorShellCommand => {
    const before = prefabs;
    return {
      ...command,
      run: async () => {
        await command.run();
        setPrefabs(after);
      },
      undo: async () => {
        await command.undo?.();
        setPrefabs(before);
      },
    };
  };
  const nextInstancePrefix = (prefab: PrefabDocument) => `${prefab.id}-${instanceSequence++}`;

  return {
    getPrefabs: () => prefabs,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    create: async (objectId) => {
      const document = controller.getSnapshot();
      const root = document.objects.find((object) => object.id === objectId);
      if (!root || findPrefabInstanceLink(document, objectId)) return null;
      const ids = collectPrefabSubtreeIds(document.objects, [objectId]);
      const objects = document.objects.filter((object) => ids.has(object.id)).map((object) => {
        if (object.id !== objectId) return object;
        const detached = { ...object };
        delete detached.parentId;
        return detached;
      });
      const prefab = createPrefabFromSceneObjects({ id: `${PREFAB_ID_PREFIX}-${prefabSequence++}`, name: root.name, objects });
      const idPrefix = nextInstancePrefix(prefab);
      const created = await execute('Create prefab', () =>
        withLibrary(commands.convertToPrefabInstance(objectId, prefab, idPrefix), [...prefabs, prefab]),
      );
      return created ? `${idPrefix}:${objectId}` : null;
    },
    place: (prefabId) => {
      const prefab = prefabs.find((candidate) => candidate.id === prefabId);
      if (!prefab) return Promise.resolve(false);
      const placed = controller
        .getSnapshot()
        .objects.filter((object) => readPrefabInstanceLink(object)?.prefabId === prefabId).length;
      const origin = prefab.objects.find((object) => object.id === prefab.rootObjectIds[0])?.transform.position;
      const [x, y, z] = origin ?? [0, 0, 0];
      return execute('Place prefab', () =>
        commands.instantiatePrefab(prefab, {
          idPrefix: nextInstancePrefix(prefab),
          rootTransform: { position: [x + PLACEMENT_OFFSET * placed, y, z] },
        }),
      );
    },
    revertOverride: (rootObjectId, prefab, override) =>
      execute('Revert prefab override', () => commands.revertPrefabOverride(rootObjectId, prefab, override)),
    revertAll: (rootObjectId, prefab) =>
      execute('Revert prefab instance', () => commands.revertPrefabInstance(rootObjectId, prefab)),
    apply: (rootObjectId, prefab) => {
      const document = controller.getSnapshot();
      const link = findPrefabInstanceLink(document, rootObjectId);
      if (!link) return Promise.resolve(false);
      const next = applyInstanceToPrefab(prefab, getPrefabInstanceObjects(document.objects, link), link);
      return execute('Apply prefab', () =>
        withLibrary(
          commands.propagatePrefab(prefab, next),
          prefabs.map((candidate) => (candidate.id === next.id ? next : candidate)),
        ),
      );
    },
  };
}

export function useWorldScenePrefabActions(
  library: WorldScenePrefabLibrary,
  onSelect: (objectId: SceneObjectId) => void,
): InspectorPrefabActions {
  const prefabs = useSyncExternalStore(library.subscribe, library.getPrefabs, library.getPrefabs);
  return useMemo(
    () => ({
      prefabs,
      onCreate: (objectId) => {
        void library.create(objectId).then((rootId) => {
          if (rootId) onSelect(rootId);
        });
      },
      onRevertOverride: (rootObjectId, prefab, override) => {
        void library.revertOverride(rootObjectId, prefab, override);
      },
      onRevertAll: (rootObjectId, prefab) => {
        void library.revertAll(rootObjectId, prefab);
      },
      onApply: (rootObjectId, prefab) => {
        void library.apply(rootObjectId, prefab);
      },
    }),
    [library, onSelect, prefabs],
  );
}
