import { useRef, useEffect, RefObject } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { BlueprintEntity, BlueprintDefinition, registerDefaultComponents } from '../core/blueprint';

export interface UseBlueprintEntityProps {
  blueprint: BlueprintDefinition | string;
  rigidBodyRef: RefObject<RapierRigidBody>;
  innerGroupRef?: RefObject<Group>;
  outerGroupRef?: RefObject<Group>;
  enabled?: boolean;
}

export function useBlueprintEntity({
  blueprint,
  rigidBodyRef,
  innerGroupRef,
  outerGroupRef,
  enabled = true
}: UseBlueprintEntityProps) {
  const entityRef = useRef<BlueprintEntity | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      registerDefaultComponents();
      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !rigidBodyRef.current) return;

    const blueprintDef = typeof blueprint === 'string' 
      ? { id: blueprint, name: blueprint, type: 'character' as const, components: [] }
      : blueprint;

    entityRef.current = new BlueprintEntity(
      blueprintDef,
      rigidBodyRef,
      innerGroupRef,
      outerGroupRef
    );

    return () => {
      if (entityRef.current) {
        entityRef.current.dispose();
        entityRef.current = null;
      }
    };
  }, [blueprint, rigidBodyRef, innerGroupRef, outerGroupRef, enabled]);

  useFrame((state, delta) => {
    if (enabled && entityRef.current) {
      entityRef.current.update(delta);
    }
  });

  return {
    entity: entityRef.current,
    getComponent: <T>(type: string) => entityRef.current?.getComponent<T>(type),
    addComponent: (component: any) => entityRef.current?.addComponent(component),
    removeComponent: (type: string) => entityRef.current?.removeComponent(type),
  };
} 