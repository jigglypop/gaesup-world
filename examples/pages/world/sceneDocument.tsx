import { useMemo, useSyncExternalStore } from 'react';

import {
  createSceneDocument,
  createSceneDocumentController,
  createSceneDocumentSaveBinding,
  loadSceneRuntime,
  logger,
  SCENE_DOCUMENT_SAVE_KEY,
  type CreateSceneComponentInput,
  type CreateSceneObjectInput,
  type GaesupPlugin,
  type SceneComponentId,
  type SceneDocument,
  type SceneDocumentController,
  type SceneObjectId,
} from 'gaesup-world';
import {
  createEditorCommandStack,
  createSceneObjectEditorCommands,
  type EditorShellCommand,
  type SceneObjectEditorPatch,
} from 'gaesup-world/editor';

const WORLD_SCENE_DOCUMENT_PLUGIN_ID = 'example.world.scene-document';
const CREATOR_MARKER_ID_PREFIX = 'creator-marker';

export const WORLD_SCENE_DOCUMENT_SAVE_KEY = SCENE_DOCUMENT_SAVE_KEY;

export type WorldSceneDocumentSession = {
  controller: SceneDocumentController;
  getSnapshot: () => SceneDocument;
  subscribe: (listener: () => void) => () => void;
  createObjectId: () => SceneObjectId;
  createObject: (input: CreateSceneObjectInput) => Promise<boolean>;
  updateObject: (objectId: SceneObjectId, patch: SceneObjectEditorPatch) => Promise<boolean>;
  deleteObject: (objectId: SceneObjectId) => Promise<boolean>;
  moveObject: (objectId: SceneObjectId, parentId: SceneObjectId | undefined) => Promise<boolean>;
  addComponent: (objectId: SceneObjectId, component: CreateSceneComponentInput) => Promise<boolean>;
  removeComponent: (objectId: SceneObjectId, componentId: SceneComponentId) => Promise<boolean>;
};

export type WorldSceneDocumentRootMarker = {
  id: SceneObjectId;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

export function createInitialWorldSceneDocument(): SceneDocument {
  return createSceneDocument({
    id: 'example-world-scene',
    name: '예제 월드 장면',
    objects: [
      {
        id: 'world-origin-marker',
        name: '월드 기준 표식',
        tags: ['example', 'runtime-marker'],
        transform: { position: [8, 1, -6] },
        components: [
          {
            id: 'world-origin-marker-component',
            type: 'example.runtime-marker',
            data: { color: '#63e6be' },
          },
        ],
      },
      {
        id: 'world-origin-marker-detail',
        name: '하위 장면 표식',
        parentId: 'world-origin-marker',
        transform: { position: [2, 0, 0] },
      },
    ],
  });
}

export function createWorldSceneDocumentSession(
  initialDocument: SceneDocument = createInitialWorldSceneDocument(),
): WorldSceneDocumentSession {
  const controller = createSceneDocumentController(initialDocument);
  const commandStack = createEditorCommandStack();
  const commands = createSceneObjectEditorCommands(controller);
  let objectSequence = 1;

  const execute = async (
    fallbackLabel: string,
    createCommand: () => EditorShellCommand,
  ): Promise<boolean> => {
    let label = fallbackLabel;
    try {
      const command = createCommand();
      label = command.label;
      await commandStack.execute(command);
      return true;
    } catch (error) {
      try {
        logger.error(
          `[WorldSceneDocument] ${label} rejected.`,
          error instanceof Error ? error : String(error),
        );
      } catch {
        // A logger failure must not turn a handled editor rejection into an unhandled promise.
      }
      return false;
    }
  };

  return {
    controller,
    getSnapshot: () => controller.getSnapshot(),
    subscribe: (listener) => controller.subscribe(() => listener()),
    createObjectId: () => {
      let id: SceneObjectId;
      do {
        id = `${CREATOR_MARKER_ID_PREFIX}-${objectSequence}`;
        objectSequence += 1;
      } while (controller.getSnapshot().objects.some((object) => object.id === id));
      return id;
    },
    createObject: (input) => execute('Create scene object', () => commands.createObject(input)),
    updateObject: (objectId, patch) =>
      execute('Update scene object', () => commands.updateObject(objectId, patch)),
    deleteObject: (objectId) =>
      execute('Delete scene object', () => commands.deleteObject(objectId)),
    moveObject: (objectId, parentId) =>
      execute('Move scene object', () => commands.moveObject(objectId, parentId)),
    addComponent: (objectId, component) =>
      execute('Add scene component', () => commands.addComponent(objectId, component)),
    removeComponent: (objectId, componentId) =>
      execute('Remove scene component', () => commands.removeComponent(objectId, componentId)),
  };
}

let defaultWorldSceneDocumentSession: WorldSceneDocumentSession | null = null;

export function getWorldSceneDocumentSession(): WorldSceneDocumentSession {
  if (!defaultWorldSceneDocumentSession) {
    defaultWorldSceneDocumentSession = createWorldSceneDocumentSession();
  }
  return defaultWorldSceneDocumentSession;
}

export function resetWorldSceneDocumentSession(
  initialDocument: SceneDocument = createInitialWorldSceneDocument(),
): WorldSceneDocumentSession {
  defaultWorldSceneDocumentSession = createWorldSceneDocumentSession(initialDocument);
  return defaultWorldSceneDocumentSession;
}

export function createWorldSceneDocumentPlugin(session: WorldSceneDocumentSession): GaesupPlugin {
  const binding = createSceneDocumentSaveBinding(session.controller);
  if (binding.key !== WORLD_SCENE_DOCUMENT_SAVE_KEY) {
    throw new Error(`Unexpected scene document save key: ${binding.key}`);
  }
  return {
    id: WORLD_SCENE_DOCUMENT_PLUGIN_ID,
    name: '예제 월드 장면 문서',
    version: '1.0.0',
    runtime: 'client',
    capabilities: ['world.scene-document'],
    setup: (context) => {
      context.save.register(binding.key, binding, WORLD_SCENE_DOCUMENT_PLUGIN_ID);
    },
  };
}

export function useWorldSceneDocumentSnapshot(session: WorldSceneDocumentSession): SceneDocument {
  return useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
}

export function projectWorldSceneDocumentRootMarkers(
  document: SceneDocument,
): WorldSceneDocumentRootMarker[] {
  const roots = loadSceneRuntime(document).runtime?.roots ?? [];
  return roots.map((object) => ({
    id: object.id,
    name: object.name,
    position: [...object.transform.position],
    rotation: [...object.transform.rotation],
    scale: [...object.transform.scale],
  }));
}

export function WorldSceneDocumentRootMarkers({ session }: { session: WorldSceneDocumentSession }) {
  const document = useWorldSceneDocumentSnapshot(session);
  const markers = useMemo(() => projectWorldSceneDocumentRootMarkers(document), [document]);

  return (
    <group name="scene-document-root-markers">
      {markers.map((marker) => (
        <mesh
          key={marker.id}
          name={`scene-document-marker:${marker.id}`}
          position={marker.position}
          rotation={marker.rotation}
          scale={marker.scale}
          userData={{ sceneDocumentObjectId: marker.id }}
          castShadow
        >
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="#63e6be" emissive="#153f38" roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}
