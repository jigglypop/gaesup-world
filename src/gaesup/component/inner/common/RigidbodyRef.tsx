import {
  CollisionEnterPayload,
  RapierRigidBody,
  RigidBody,
  euler,
} from "@react-three/rapier";
import {
  MutableRefObject,
  ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";

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
    }: {
      children: ReactNode;
      name?: string;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
      userData?: { intangible: boolean };
      onCollisionEnter?: (e: CollisionEnterPayload) => Promise<void>;
      positionLerp?: number;
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
      >
        {children}
      </RigidBody>
    );
  }
);
