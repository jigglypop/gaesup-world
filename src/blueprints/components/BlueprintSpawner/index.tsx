import React, { useRef, useEffect } from 'react';

import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';

import { BlueprintSpawnerProps } from './types';
import { BlueprintFactory } from '../../factory/BlueprintFactory';

export function BlueprintSpawner({
  blueprint,
  blueprintId,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onSpawn,
  onDestroy,
  children
}: BlueprintSpawnerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null!);
  const innerGroupRef = useRef<Group>(null!);
  const outerGroupRef = useRef<Group>(null!);
  const entityRef = useRef<any>(null);

  useEffect(() => {
    const factory = BlueprintFactory.getInstance();
    
    const spawnEntity = async () => {
      let entity = null;
      
      if (blueprint) {
        entity = factory.createEntity(blueprint, {
          rigidBodyRef,
          innerGroupRef,
          outerGroupRef,
          position,
          rotation,
          scale
        });
      } else if (blueprintId) {
        entity = await factory.createFromId(blueprintId, {
          rigidBodyRef,
          innerGroupRef,
          outerGroupRef,
          position,
          rotation,
          scale
        });
      }
      
      if (entity) {
        entityRef.current = entity;
        onSpawn?.(entity);
      }
    };
    
    spawnEntity();
    
    return () => {
      if (entityRef.current) {
        entityRef.current.dispose();
        onDestroy?.();
      }
    };
  }, [blueprint, blueprintId]);

  const blueprintType = blueprint?.type || 'character';
  const physicsConfig = getPhysicsConfig(blueprintType);

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={position}
      rotation={rotation}
      scale={scale}
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

function getPhysicsConfig(type: string) {
  switch (type) {
    case 'character':
      return {
        mass: 1,
        friction: 0.5,
        restitution: 0,
        linearDamping: 4,
        angularDamping: 10,
        enabledRotations: [false, false, false] as [boolean, boolean, boolean]
      };
    case 'vehicle':
      return {
        mass: 150,
        friction: 0.8,
        restitution: 0.2,
        linearDamping: 0.5,
        angularDamping: 1
      };
    case 'airplane':
      return {
        mass: 500,
        friction: 0.1,
        restitution: 0.1,
        linearDamping: 0.2,
        angularDamping: 0.5
      };
    default:
      return {
        mass: 1,
        friction: 0.5,
        restitution: 0.5
      };
  }
} 