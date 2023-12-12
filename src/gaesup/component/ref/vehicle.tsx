import { Collider } from "@dimforge/rapier3d-compat";
import { Gltf } from "@react-three/drei";
import {
  CuboidCollider,
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { ReactNode, Ref, RefObject, forwardRef, useContext } from "react";
import * as THREE from "three";
import { controllerType, propType } from "../../controller/type";
import { GaesupWorldContext } from "../../stores/context/gaesupworld";
import { S3 } from "../../utils/constant";

export const VehicleRigidBody = forwardRef(
  (
    {
      controllerProps,
      children,
    }: {
      controllerProps: propType;
      children: ReactNode;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    return (
      <RigidBody
        colliders={false}
        ref={ref}
        {...controllerProps.rigidBodyProps}
      >
        {controllerProps.debug && (
          <mesh visible={controllerProps.debug}>
            <arrowHelper
              args={[
                controllerProps.groundRay.dir,
                controllerProps.groundRay.origin,
                controllerProps.groundRay.length,
              ]}
            />
          </mesh>
        )}
        {children}
      </RigidBody>
    );
  }
);

export const VehicleCollider = forwardRef((_, ref: Ref<Collider>) => {
  const { vehicleCollider: collider } = useContext(GaesupWorldContext);
  const { vehicleSizeX, vehicleSizeY, vehicleSizeZ } = collider;
  return (
    <CuboidCollider
      ref={ref}
      args={[vehicleSizeX / 2, vehicleSizeY / 2, vehicleSizeZ / 2]}
      position={[0, vehicleSizeY / 2, 0]}
    />
  );
});

export const VehicleGroup = forwardRef(
  (
    {
      controllerProps,
      children,
    }: {
      controllerProps: controllerType;
      children: ReactNode;
    },
    ref: Ref<THREE.Group>
  ) => {
    return (
      <group
        ref={ref}
        userData={{ intangible: true }}
        {...controllerProps.vehicle}
      >
        {children}
      </group>
    );
  }
);

export type wheelRegidBodyType = {
  wheelPosition: [number, number, number];
  wheelsUrl?: string;
  bodyRef: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: THREE.Vector3Tuple;
  wheelAnchor: THREE.Vector3Tuple;
  rotationAxis: THREE.Vector3Tuple;
};

export const WheelRegidBodyRef = forwardRef(
  (
    {
      wheelPosition,
      wheelsUrl,
      bodyRef,
      wheel,
      bodyAnchor,
      wheelAnchor,
      rotationAxis,
    }: wheelRegidBodyType,
    ref: Ref<RapierRigidBody>
  ) => {
    const { vehicleCollider: collider } = useContext(GaesupWorldContext);
    const { wheelSizeX, wheelSizeY } = collider;
    useRevoluteJoint(bodyRef, wheel, [bodyAnchor, wheelAnchor, rotationAxis]);

    return (
      <RigidBody position={wheelPosition} colliders={false} ref={ref}>
        <CylinderCollider
          args={[wheelSizeX / 2, wheelSizeY / 2]}
          rotation={[0, 0, Math.PI / 2]}
        />
        <Gltf src={wheelsUrl || S3 + "/wheel.glb"} />
      </RigidBody>
    );
  }
);