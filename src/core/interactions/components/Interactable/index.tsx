import React, { useEffect, useId, useRef } from 'react';

import * as THREE from 'three';

import type { RuntimeRecord } from '@core/boilerplate/types';

import { useInteractablesStore, type InteractableKind } from '../../stores/interactablesStore';

export type InteractableProps = {
  id?: string;
  kind?: InteractableKind;
  label: string;
  range?: number;
  activationKey?: string;
  data?: RuntimeRecord;
  onActivate: () => void;
  position: [number, number, number];
  children?: React.ReactNode;
};

export function Interactable({
  id,
  kind = 'misc',
  label,
  range = 2.2,
  activationKey = 'e',
  data,
  onActivate,
  position,
  children,
}: InteractableProps) {
  const auto = useId();
  const realId = id ?? auto;
  const register = useInteractablesStore((s) => s.register);
  const updatePosition = useInteractablesStore((s) => s.updatePosition);

  const groupRef = useRef<THREE.Group>(null);
  const positionRef = useRef(new THREE.Vector3());
  const worldPositionRef = useRef(new THREE.Vector3());
  const [x, y, z] = position;
  positionRef.current.set(x, y, z);

  useEffect(() => {
    return register({
      id: realId,
      kind,
      label,
      position: positionRef.current.clone(),
      getPosition: () => groupRef.current?.getWorldPosition(worldPositionRef.current) ?? positionRef.current,
      range,
      key: activationKey,
      ...(data ? { data } : {}),
      onActivate,
    });
  }, [realId, kind, label, range, activationKey, data, onActivate, register]);

  useEffect(() => {
    updatePosition(realId, positionRef.current);
  }, [realId, x, y, z, updatePosition]);

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}

export default Interactable;
