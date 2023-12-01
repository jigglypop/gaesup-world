import { S3 } from "@/components/main";
import { callbackType, groundRayType, propType, refsType } from "@gaesup/type";
import { Box, Gltf } from "@react-three/drei";
import { GroupProps, useLoader } from "@react-three/fiber";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useAtom } from "jotai";
import { createRef, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { colliderAtom } from "../stores/collider";
import WheelJoint from "./WheelJoint";

let preloadUrl = "";

export type VehicleGltfType = {
  prop: propType;
  url: string;
  wheelsUrl?: string;
  character?: GroupProps;
  groundRay: groundRayType;
  refs: refsType;
  callbacks?: callbackType;
};

export default function VehicleGltf({
  prop,
  url,
  wheelsUrl,
  character,
  groundRay,
  refs,
  callbacks,
}: VehicleGltfType) {
  preloadUrl = url;
  const gltf = useLoader(GLTFLoader, url);
  const wheelGltf = useLoader(GLTFLoader, wheelsUrl || S3 + "/wheel.glb");
  const { materials, nodes, scene } = gltf;
  // const collider = useAtomValue(colliderAtom);
  const [collider, setCollider] = useAtom(colliderAtom);
  const { sizeX, sizeY, sizeZ } = collider;
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const wheelsize = new THREE.Box3()
    .setFromObject(wheelGltf.scene)
    .getSize(new THREE.Vector3());
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
        x: size.x / 2,
        y: wheelsize.y / 2,
        z: size.z / 2,
      });
    }
  }, [size.x, size.y, size.z]);

  const { rigidBodyRef } = refs;
  const wheelPositions: [number, number, number][] = [
    [-sizeX, 0, sizeZ],
    [-sizeX, 0, -sizeZ],
    [sizeX, 0, sizeZ],
    [sizeX, 0, -sizeZ],
  ];
  const wheelRefs = useRef(
    wheelPositions.map(() => createRef<RapierRigidBody>())
  );
  return (
    <>
      <Gltf src={url} />
      <RigidBody colliders="cuboid" ref={rigidBodyRef} type="dynamic">
        <Box
          args={[sizeX, sizeY, sizeZ]}
          position={[0, sizeY / 2, 0]}
          castShadow
          receiveShadow
          name="chassis"
        >
          <meshStandardMaterial visible={false} />
        </Box>
      </RigidBody>
      {wheelPositions.map((wheelPosition, index) => (
        <RigidBody
          position={wheelPosition}
          colliders="hull"
          type="dynamic"
          key={index}
          ref={wheelRefs.current[index]}
        >
          {/* <Cylinder
            rotation={[Math.PI / 2, 0, 0]}
            args={[1, 1, 1, 32]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={"grey"} />
          </Cylinder> */}
          <Gltf src={wheelsUrl || S3 + "/wheel.glb"} />
        </RigidBody>
      ))}
      {wheelPositions.map((wheelPosition, index) => (
        <WheelJoint
          key={index}
          refs={refs}
          wheel={wheelRefs.current[index]}
          bodyAnchor={wheelPosition}
          wheelAnchor={[0, 0, 0]}
          rotationAxis={[1, 0, 0]}
        />
      ))}
      {/* <Gltf src={url} />

      {wheelPositions.map((wheelPosition, index) => (
        <RigidBody
          position={wheelPosition}
          colliders="hull"
          type="dynamic"
          key={index}
          ref={wheelRefs.current[index]}
        >
          <Gltf src={wheelsUrl || S3 + "/wheel.glb"} />
        </RigidBody>
      ))}
      {wheelPositions.map((wheelPosition, index) => (
        <WheelJoint
          key={index}
          jointRefs={refs.jointRefs}
          refs={rigidBodyRef}
          wheel={wheelRefs.current[index]}
          bodyAnchor={wheelPosition}
          wheelAnchor={[0, 0, 0]}
          rotationAxis={[0, 0, 1]}
        />
      ))} */}
    </>
  );
}

// useLoader.preload(GLTFLoader, preloadUrl);
