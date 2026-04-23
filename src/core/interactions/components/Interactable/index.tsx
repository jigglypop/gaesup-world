import React, { useEffect, useId, useMemo, useRef } from 'react';

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
  const unregister = useInteractablesStore((s) => s.unregister);
  const updatePosition = useInteractablesStore((s) => s.updatePosition);

  const groupRef = useRef<THREE.Group>(null);
  const posVec = useMemo(() => new THREE.Vector3(...position), [position]);

  useEffect(() => {
    register({
      id: realId,
      kind,
      label,
      position: posVec.clone(),
      range,
      key: activationKey,
      ...(data ? { data } : {}),
      onActivate,
    });
    return () => unregister(realId);
  }, [realId, kind, label, range, activationKey, data, onActivate, register, unregister, posVec]);

  useEffect(() => {
    updatePosition(realId, posVec);
  }, [realId, posVec, updatePosition]);

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}

export default Interactable;
