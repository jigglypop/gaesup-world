import { CapsuleCollider, RapierRigidBody, RigidBody } from '@react-three/rapier';
import { forwardRef } from 'react';
import * as THREE from 'three';
import { EntityProps } from '../../types';

export const Entity = forwardRef<RapierRigidBody, EntityProps>((props, rigidBodyRef) => {
  const safeRotationY = props.rotation instanceof THREE.Euler ? props.rotation.y : 0;
  const size = props.size || { x: 1, y: 1, z: 1 }; // Default size if not provided

  return (
    <group ref={props.outerGroupRef} userData={{ intangible: true }}>
      <RigidBody
        ref={rigidBodyRef}
        name={props.name}
        position={props.position}
        rotation={new THREE.Euler(0, safeRotationY, 0)}
        userData={props.userData}
        type={props.rigidbodyType || (props.isActive ? 'dynamic' : 'fixed')}
        sensor={props.sensor}
        onIntersectionEnter={props.onIntersectionEnter}
        onIntersectionExit={props.onIntersectionExit}
        onCollisionEnter={props.onCollisionEnter}
        canSleep={false}
        ccd={true}
        colliders={false}
        {...props.rigidBodyProps}
      >
        {!props.isNotColliding && (
          <CapsuleCollider
            ref={props.colliderRef as any}
            args={[(size.y / 2 - size.x) * 1.2, size.x * 1.2]}
            position={[0, size.x * 1.2, 0]}
          />
        )}
        <group ref={props.innerGroupRef} frustumCulled={false}>
          {props.children}
        </group>
      </RigidBody>
    </group>
  );
});

Entity.displayName = 'Entity'; 