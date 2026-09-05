import { useRef, useEffect } from 'react';

import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';

import { logger } from '@/core/utils/logger';

import { BlueprintSpawnerProps } from './types';
import { BlueprintEntity } from '../../core/BlueprintEntity';
import { BlueprintFactory } from '../../factory/BlueprintFactory';
import { getBlueprintPhysics } from '../../factory/physics';
import { blueprintRegistry } from '../../registry';

export function BlueprintSpawner({
  blueprint,
  blueprintId,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onSpawn,
  onDestroy,
  getMovementInput,
  animationClips,
  children
}: BlueprintSpawnerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null!);
  const innerGroupRef = useRef<Group>(null!);
  const outerGroupRef = useRef<Group>(null!);
  const entityRef = useRef<BlueprintEntity | null>(null);
  const callbacksRef = useRef({ onSpawn, onDestroy });

  useEffect(() => {
    callbacksRef.current = { onSpawn, onDestroy };
  }, [onSpawn, onDestroy]);

  useFrame((_, delta) => {
    entityRef.current?.update(delta, getMovementInput?.());
  });

  useEffect(() => {
    const factory = BlueprintFactory.getInstance();
    let cancelled = false;
    let ownedEntity: BlueprintEntity | null = null;
    
    const spawnEntity = async () => {
      let entity = null;
      
      if (blueprint) {
        entity = factory.createEntity(blueprint, {
          rigidBodyRef,
          innerGroupRef,
          outerGroupRef,
          ...(animationClips ? { animationClips } : {}),
          position,
          rotation,
          scale
        });
      } else if (blueprintId) {
        entity = await factory.createFromId(blueprintId, {
          rigidBodyRef,
          innerGroupRef,
          outerGroupRef,
          ...(animationClips ? { animationClips } : {}),
          position,
          rotation,
          scale
        });
      }
      
      if (entity) {
        if (cancelled) {
          entity.dispose();
          return;
        }
        ownedEntity = entity;
        entityRef.current = entity;
        callbacksRef.current.onSpawn?.(entity);
      }
    };
    
    void spawnEntity().catch((error: unknown) => {
      logger.error('Blueprint spawn failed', error instanceof Error ? error : String(error));
    });
    
    return () => {
      cancelled = true;
      const entity = ownedEntity;
      ownedEntity = null;
      if (!entity) return;
      if (entityRef.current === entity) entityRef.current = null;
      try {
        entity.dispose();
      } finally {
        callbacksRef.current.onDestroy?.();
      }
    };
  }, [blueprint, blueprintId, animationClips]);

  const resolvedBlueprint = blueprint ?? (blueprintId ? blueprintRegistry.get(blueprintId) : undefined);
  const rotationEnabled = (resolvedBlueprint?.type ?? 'character') !== 'character';
  const physicsConfig = getBlueprintPhysics(resolvedBlueprint);

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={position}
      rotation={rotation}
      scale={scale}
      enabledRotations={[rotationEnabled, rotationEnabled, rotationEnabled]}
      {...physicsConfig}
    >
      <group ref={outerGroupRef}>
        <group ref={innerGroupRef}>
          {children}
        </group>
      </group>
    </RigidBody>
  );
}
