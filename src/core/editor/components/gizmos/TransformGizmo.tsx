import React, { useCallback, useEffect, useRef } from 'react';

import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';

import type { SceneObject, SceneObjectId, SceneTransform, SceneVector3 } from '../../../scene-object';

export type TransformGizmoMode = 'translate' | 'rotate' | 'scale';
export type TransformGizmoSpace = 'local' | 'world';

export interface SceneObjectTransformGizmoProps {
  object?: Pick<SceneObject, 'id' | 'transform'>;
  enabled?: boolean;
  visible?: boolean;
  mode?: TransformGizmoMode;
  space?: TransformGizmoSpace;
  translationSnap?: number;
  rotationSnap?: number;
  scaleSnap?: number;
  children?: React.ReactNode;
  onTransformChange?: (objectId: SceneObjectId, transform: SceneTransform) => void;
  onDraggingChange?: (dragging: boolean) => void;
}

export function SceneObjectTransformGizmo({
  object,
  enabled = true,
  visible = true,
  mode = 'translate',
  space = 'world',
  translationSnap,
  rotationSnap,
  scaleSnap,
  children,
  onTransformChange,
  onDraggingChange,
}: SceneObjectTransformGizmoProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current || !object) return;
    applySceneTransform(groupRef.current, object.transform);
  }, [object]);

  const emitTransformChange = useCallback(() => {
    if (!groupRef.current || !object) return;
    onTransformChange?.(object.id, object3DToSceneTransform(groupRef.current));
  }, [object, onTransformChange]);

  if (!object || !visible) return null;

  const snapProps = {
    ...(translationSnap !== undefined ? { translationSnap } : {}),
    ...(rotationSnap !== undefined ? { rotationSnap } : {}),
    ...(scaleSnap !== undefined ? { scaleSnap } : {}),
  };

  return (
    <TransformControls
      enabled={enabled}
      mode={mode}
      space={space}
      {...snapProps}
      onObjectChange={emitTransformChange}
      onMouseDown={() => onDraggingChange?.(true)}
      onMouseUp={() => onDraggingChange?.(false)}
    >
      <group ref={groupRef} name={`scene-object-gizmo-${object.id}`}>
        {children}
      </group>
    </TransformControls>
  );
}

export function applySceneTransform(object: THREE.Object3D, transform: SceneTransform): void {
  object.position.set(...transform.position);
  object.rotation.set(...transform.rotation);
  object.scale.set(...transform.scale);
  object.updateMatrixWorld();
}

export function object3DToSceneTransform(object: THREE.Object3D): SceneTransform {
  return {
    position: vectorToSceneVector(object.position),
    rotation: vectorToSceneVector(object.rotation),
    scale: vectorToSceneVector(object.scale),
  };
}

export function snapSceneTransform(transform: SceneTransform, options: {
  translationSnap?: number;
  rotationSnap?: number;
  scaleSnap?: number;
}): SceneTransform {
  return {
    position: snapVector(transform.position, options.translationSnap),
    rotation: snapVector(transform.rotation, options.rotationSnap),
    scale: snapVector(transform.scale, options.scaleSnap),
  };
}

function vectorToSceneVector(vector: THREE.Vector3 | THREE.Euler): SceneVector3 {
  return [vector.x, vector.y, vector.z];
}

function snapVector(vector: SceneVector3, snap?: number): SceneVector3 {
  if (!snap || snap <= 0) return vector;
  return vector.map((value) => Math.round(value / snap) * snap) as unknown as SceneVector3;
}
