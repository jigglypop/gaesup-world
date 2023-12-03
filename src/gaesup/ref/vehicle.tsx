import { S3 } from "@/components/main";
import { Collider } from "@dimforge/rapier3d-compat";
import { colliderAtom } from "@gaesup/stores/collider";
import { optionsAtom } from "@gaesup/stores/options";
import { Gltf } from "@react-three/drei";
import {
  CuboidCollider,
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { useAtom, useAtomValue } from "jotai";
import { ReactNode, Ref, RefObject, forwardRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFResult, groundRayType } from "../type";

export const VehicleRigidBody = forwardRef(
  (
    {
      groundRay,
      children,
    }: {
      groundRay: groundRayType;
      children: ReactNode;
    },
    ref: Ref<RapierRigidBody>
  ) => {
    const options = useAtomValue(optionsAtom);
    console.log("vehicle");

    return (
      <RigidBody colliders={false} ref={ref}>
        {options.debug && (
          <mesh visible={options.debug}>
            <arrowHelper
              args={[groundRay.dir, groundRay.origin, groundRay.length]}
            />
          </mesh>
        )}
        {children}
      </RigidBody>
    );
  }
);

export const VehicleCollider = forwardRef(
  (
    {
      gltf,
      wheelGltf,
    }: {
      gltf: GLTFResult;
      wheelGltf: GLTFResult;
    },
    ref: Ref<Collider>
  ) => {
    const { scene } = gltf;
    const { scene: wheelScene } = wheelGltf;
    const [collider, setCollider] = useAtom(colliderAtom);
    const { sizeX, sizeY, sizeZ } = collider;
    const box = new THREE.Box3().setFromObject(scene);
    const wheelBox = new THREE.Box3().setFromObject(wheelScene);

    const size = box.getSize(new THREE.Vector3());
    const wheelsize = wheelBox.getSize(new THREE.Vector3());

    useEffect(() => {
      if (
        size.x !== 0 &&
        size.y !== 0 &&
        size.z !== 0 &&
        wheelsize.x !== 0 &&
        wheelsize.y !== 0 &&
        wheelsize.z !== 0
      ) {
        setCollider({
          ...collider,
          sizeX: size.x,
          sizeY: wheelsize.y,
          sizeZ: size.z,
          wheelSizeX: wheelsize.x,
          wheelSizeY: wheelsize.y,
          wheelSizeZ: wheelsize.z,
          x: size.x / 2,
          y: wheelsize.y / 2,
          z: size.z / 2,
        });
      }
    }, [size.x, size.y, size.z]);

    return (
      <CuboidCollider
        ref={ref}
        args={[sizeX / 2, sizeY / 2, sizeZ / 2]}
        position={[0, sizeY / 2, 0]}
      />
    );
  }
);

export const VehicleGroup = forwardRef(
  (
    {
      children,
    }: {
      children: ReactNode;
    },
    ref: Ref<THREE.Group>
  ) => {
    return (
      <group ref={ref} userData={{ intangible: true }}>
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
    const { wheelSizeX, wheelSizeY } = useAtomValue(colliderAtom);
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

//
// export const GaesupSlopeRay = forwardRef(
//   (
//     {
//       groundRay,
//       slopeRay,
//     }: {
//       groundRay: groundRayType;
//       slopeRay: slopeRayType;
//     },
//     ref: Ref<THREE.Mesh>
//   ) => {
//     const options = useAtomValue(optionsAtom);
//     return (
//       <mesh
//         position={[
//           groundRay.offset.x,
//           groundRay.offset.y,
//           groundRay.offset.z + slopeRay.offset.z,
//         ]}
//         ref={ref}
//         visible={false}
//         userData={{ intangible: true }}
//       >
//         {options.debug && (
//           <mesh>
//             <arrowHelper
//               args={[slopeRay.dir, slopeRay.origin, slopeRay.length, "#ff0000"]}
//             />
//           </mesh>
//         )}
//         <boxGeometry args={[0.15, 0.15, 0.15]} />
//       </mesh>
//     );
//   }
// );
