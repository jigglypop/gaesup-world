import { Collider } from "@dimforge/rapier3d-compat";
import { Gltf } from "@react-three/drei";
import {
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { Ref, RefObject, forwardRef, useRef } from "react";

export type wheelRegidBodyType = {
  wheelPosition: [number, number, number];
  bodyRef: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: THREE.Vector3Tuple;
  wheelAnchor: THREE.Vector3Tuple;
  rotationAxis: THREE.Vector3Tuple;
  wheelSize: THREE.Vector3;
  url: string;
};

export const WheelRegidBodyRef = forwardRef(
  ({ props }: { props: wheelRegidBodyType }, ref: Ref<RapierRigidBody>) => {
    const {
      bodyRef,
      wheel,
      bodyAnchor,
      wheelAnchor,
      rotationAxis,
      wheelPosition,
      wheelSize,
      url,
    } = props;
    useRevoluteJoint(bodyRef, wheel, [
      bodyAnchor,
      wheelAnchor,
      rotationAxis,
      [0, 0],
    ]);

    const refs = useRef<Collider>(null);

    return (
      <RigidBody position={wheelPosition} colliders={false} ref={ref}>
        <CylinderCollider
          args={[wheelSize.x / 2, wheelSize.y / 2]}
          rotation={[0, 0, Math.PI / 2]}
          ref={refs}
        />
        <Gltf src={url} />
      </RigidBody>
    );
  }
);
