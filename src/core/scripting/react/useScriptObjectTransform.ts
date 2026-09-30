import { useRef, type RefObject } from 'react';

import type * as THREE from 'three';

import type { SharedFrameChannel } from '../../runtime/frame/react/types';
import { useSharedFrame } from '../../runtime/frame/react/useSharedFrame';
import type { SceneTransform } from '../../scene-object/types';
import type { ScriptRuntime } from '../ScriptRuntime';

const SCRIPT_TRANSFORM_PROJECTION_ORDER = 1;
const SCRIPT_TRANSFORM_FRAME: SharedFrameChannel = {
  phase: 'lateUpdate',
  label: 'scripts:transform-projection',
  order: SCRIPT_TRANSFORM_PROJECTION_ORDER,
};

export function useScriptObjectTransform(
  runtime: ScriptRuntime | null,
  objectId: string,
  target: RefObject<THREE.Object3D | null>,
  source: SceneTransform,
): void {
  const projectedRef = useRef(false);
  const sourceRef = useRef(source);
  sourceRef.current = source;

  useSharedFrame(SCRIPT_TRANSFORM_FRAME, () => {
    const object = target.current;
    if (!object) return;
    const handle = runtime?.getObjectHandle(objectId);
    if (handle) {
      object.position.set(handle.position.x, handle.position.y, handle.position.z);
      object.rotation.set(handle.rotation.x, handle.rotation.y, handle.rotation.z);
      object.scale.set(handle.scale.x, handle.scale.y, handle.scale.z);
      projectedRef.current = true;
      return;
    }
    if (!projectedRef.current) return;
    const { position, rotation, scale } = sourceRef.current;
    object.position.set(position[0], position[1], position[2]);
    object.rotation.set(rotation[0], rotation[1], rotation[2]);
    object.scale.set(scale[0], scale[1], scale[2]);
    projectedRef.current = false;
  }, runtime !== null);
}
