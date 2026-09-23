import { useEffect, useMemo, useState } from 'react';

import {
  createSceneCollisionGroups,
  DEFAULT_PROJECT_SETTINGS,
  DEFAULT_SCENE_LAYER_TAG_REGISTRY,
  getSceneObjectComponent,
  hasSceneObjectComponent,
  loadSceneRuntime,
  SCENE_COMPONENT_TYPES,
  SceneObjectBody,
  type SceneDocument,
  type SceneObject,
  type ScriptRuntime,
} from 'gaesup-world';

const COLLISION_GROUPS = createSceneCollisionGroups(
  DEFAULT_SCENE_LAYER_TAG_REGISTRY,
  DEFAULT_PROJECT_SETTINGS.physics,
);
const DEFAULT_BODY_SIZE: [number, number, number] = [1, 1, 1];
const ZONE_IDLE_COLOR = '#74c0fc';
const ZONE_ACTIVE_COLOR = '#ffd43b';
const ZONE_OPACITY = 0.35;
const ZONE_ENTER_EVENT = 'zone:enter';
const ZONE_EXIT_EVENT = 'zone:exit';

export function projectWorldSceneDocumentBodies(document: SceneDocument): SceneObject[] {
  const roots = loadSceneRuntime(document).runtime?.roots ?? [];
  return roots.filter((object) => hasSceneObjectComponent(object, SCENE_COMPONENT_TYPES.collider));
}

function readBoxSize(object: SceneObject): [number, number, number] {
  const size = getSceneObjectComponent(object, SCENE_COMPONENT_TYPES.collider)?.data['size'];
  if (!Array.isArray(size) || size.length !== DEFAULT_BODY_SIZE.length) return DEFAULT_BODY_SIZE;
  const [x, y, z] = size;
  return typeof x === 'number' && typeof y === 'number' && typeof z === 'number' ? [x, y, z] : DEFAULT_BODY_SIZE;
}

function WorldSceneDocumentBody({ object, runtime }: { object: SceneObject; runtime: ScriptRuntime }) {
  const [occupants, setOccupants] = useState(0);

  useEffect(() => {
    const offEnter = runtime.on(ZONE_ENTER_EVENT, (payload) => {
      if (payload['zoneId'] === object.id) setOccupants((count) => count + 1);
    });
    const offExit = runtime.on(ZONE_EXIT_EVENT, (payload) => {
      if (payload['zoneId'] === object.id) setOccupants((count) => Math.max(0, count - 1));
    });
    return () => {
      offEnter();
      offExit();
    };
  }, [object.id, runtime]);

  return (
    <SceneObjectBody
      object={object}
      collisionGroups={COLLISION_GROUPS}
      onPhysicsEvent={(kind, objectId, otherId) => runtime.dispatchPhysicsEvent(kind, objectId, otherId)}
    >
      <mesh name={`scene-document-body:${object.id}`} userData={{ sceneDocumentObjectId: object.id }}>
        <boxGeometry args={readBoxSize(object)} />
        <meshStandardMaterial
          color={occupants > 0 ? ZONE_ACTIVE_COLOR : ZONE_IDLE_COLOR}
          transparent
          opacity={ZONE_OPACITY}
          depthWrite={false}
        />
      </mesh>
    </SceneObjectBody>
  );
}

export function WorldSceneDocumentBodies({ document, runtime }: { document: SceneDocument; runtime: ScriptRuntime }) {
  const bodies = useMemo(() => projectWorldSceneDocumentBodies(document), [document]);

  return (
    <group name="scene-document-bodies">
      {bodies.map((object) => (
        <WorldSceneDocumentBody key={object.id} object={object} runtime={runtime} />
      ))}
    </group>
  );
}
