import {
  CollisionEnterPayload,
  RapierRigidBody,
  RigidBody,
  RigidBodyTypeString,
  euler,
} from "@react-three/rapier";
import {
  MutableRefObject,
  ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";
import * as THREE from "three";

export const RigidBodyRef = forwardRef(
  (
    {
      children,
      name,
      position,
      rotation,
      userData,
      onCollisionEnter,
      positionLerp,
      type,
    }: {
      children: ReactNode;
      name?: string;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
      userData?: { intangible: boolean };
      onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
      positionLerp?: number;
      type?: RigidBodyTypeString;
    },
    ref: MutableRefObject<RapierRigidBody>
  ) => {
    const [newPosition, setNewPosition] = useState<THREE.Vector3>(position);
    useEffect(() => {
      if (!positionLerp) return;
      setNewPosition((ordPosition) => {
        return ordPosition.lerp(position.clone(), positionLerp);
      });
    }, [position, positionLerp]);

    return (
      <RigidBody
        colliders={false}
        ref={ref}
        name={name}
        position={positionLerp ? newPosition?.clone() : position}
        rotation={euler().set(0, rotation?.clone().y || 0, 0)}
        userData={userData}
        onCollisionEnter={onCollisionEnter}
        type={type || "dynamic"}
      >
        {children}
      </RigidBody>
    );
  }
);
