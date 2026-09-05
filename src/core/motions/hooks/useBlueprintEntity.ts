import { useRef, useEffect, useState, RefObject } from 'react';

import { useFrame } from '@react-three/fiber';
import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';

import { BlueprintEntity, BlueprintDefinition, registerDefaultComponents, IComponent } from '../../../blueprints/core';
import type { BlueprintAnimationClips, BlueprintMovementInput } from '../../../blueprints/core/types';
import { BlueprintFactory } from '../../../blueprints/factory/BlueprintFactory';
import { blueprintRegistry } from '../../../blueprints/registry';
import { logger } from '../../utils/logger';

export interface UseBlueprintEntityProps {
  blueprint: BlueprintDefinition | string;
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<Group>;
  outerGroupRef?: RefObject<Group>;
  animationClips?: BlueprintAnimationClips;
  enabled?: boolean;
  getMovementInput?: () => BlueprintMovementInput | undefined;
}

export function useBlueprintEntity({
  blueprint,
  rigidBodyRef,
  innerGroupRef,
  outerGroupRef,
  animationClips,
  enabled = true,
  getMovementInput,
}: UseBlueprintEntityProps) {
  const entityRef = useRef<BlueprintEntity | null>(null);
  const [entity, setEntity] = useState<BlueprintEntity | null>(null);

  useEffect(() => {
    if (!enabled || !rigidBodyRef.current) return;
    registerDefaultComponents();
    const factory = BlueprintFactory.getInstance();
    const config = {
      rigidBodyRef,
      ...(innerGroupRef ? { innerGroupRef } : {}),
      ...(outerGroupRef ? { outerGroupRef } : {}),
      ...(animationClips ? { animationClips } : {}),
    };
    let ownedEntity: BlueprintEntity;
    if (typeof blueprint === 'string') {
      const registered = blueprintRegistry.get(blueprint);
      if (!registered) {
        logger.error(`Blueprint not found: ${blueprint}`);
        return;
      }
      ownedEntity = factory.createEntity(registered, config);
    } else {
      ownedEntity = factory.createFromDefinition(blueprint, config);
    }
    entityRef.current = ownedEntity;
    setEntity(ownedEntity);

    return () => {
      entityRef.current = null;
      setEntity(null);
      ownedEntity.dispose();
    };
  }, [blueprint, rigidBodyRef, innerGroupRef, outerGroupRef, animationClips, enabled]);

  useFrame((state, delta) => {
    void state;
    if (enabled && entityRef.current) {
      entityRef.current.update(delta, getMovementInput?.());
    }
  });

  return {
    entity,
    getComponent: <T extends IComponent>(type: string) =>
      entityRef.current?.getComponent<T>(type),
    addComponent: (component: IComponent) => entityRef.current?.addComponent(component),
    removeComponent: (type: string) => entityRef.current?.removeComponent(type),
  };
}
