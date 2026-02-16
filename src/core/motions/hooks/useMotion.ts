import { useEffect, useMemo } from 'react';

import { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { BridgeFactory } from '@core/boilerplate';

import { MotionBridge } from '../bridge/MotionBridge';
import { MotionConfig } from '../bridge/types';
import { MotionType } from '../core/system/types';
import { ManagedMotionEntity } from '../entities/ManagedMotionEntity';

export type UseMotionOptions = {
  motionType: MotionType;
  rigidBodyRef: React.RefObject<RapierRigidBody | null>;
  position?: THREE.Vector3;
  autoStart?: boolean;
};

export type UseMotionReturn = {
  entity: ManagedMotionEntity | null;
  move: (movement: THREE.Vector3) => void;
  jump: () => void;
  stop: () => void;
  turn: (direction: number) => void;
  reset: () => void;
  setConfig: (config: MotionConfig) => void;
  enableAutomation: (targetPosition: THREE.Vector3) => void;
  disableAutomation: () => void;
  isGrounded: boolean;
  isMoving: boolean;
  speed: number;
  position: THREE.Vector3 | null;
  velocity: THREE.Vector3 | null;
};

export function useMotion(
  id: string,
  options: UseMotionOptions
): UseMotionReturn {
  const { motionType, rigidBodyRef, position, autoStart = true } = options;
  const bridge = useMemo(
    () => (BridgeFactory.getOrCreate('motion') as MotionBridge | null),
    [],
  );
  const entity = useMemo(
    () => (bridge ? new ManagedMotionEntity(id, motionType, bridge) : null),
    [bridge, id, motionType],
  );

  useEffect(() => {
    if (!entity) return undefined;
    entity.initialize();
    return () => entity.dispose();
  }, [entity]);

  useEffect(() => {
    const rigidBody = rigidBodyRef.current;
    if (!entity || !rigidBody || !autoStart) return;

    entity.setRigidBody(rigidBody);
    if (position) {
      rigidBody.setTranslation(position, true);
    }
  }, [entity, rigidBodyRef, position, autoStart]);

  const move = (movement: THREE.Vector3) => {
    entity?.move(movement);
  };

  const jump = () => {
    entity?.jump();
  };

  const stop = () => {
    entity?.stop();
  };

  const turn = (direction: number) => {
    entity?.turn(direction);
  };

  const reset = () => {
    entity?.reset();
  };

  const setConfig = (config: MotionConfig) => {
    entity?.setConfig(config);
  };

  const enableAutomation = (targetPosition: THREE.Vector3) => {
    entity?.enableAutomation(targetPosition);
  };

  const disableAutomation = () => {
    entity?.disableAutomation();
  };

  const snapshot = entity?.getSnapshot();

  return {
    entity,
    move,
    jump,
    stop,
    turn,
    reset,
    setConfig,
    enableAutomation,
    disableAutomation,
    isGrounded: entity?.isGrounded() ?? false,
    isMoving: entity?.isMoving() ?? false,
    speed: entity?.getSpeed() ?? 0,
    position: snapshot?.position ?? null,
    velocity: snapshot?.velocity ?? null
  };
} 