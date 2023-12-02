import { S3 } from "@/components/main";
import { Collider } from "@dimforge/rapier3d-compat";
import { callbackType, groundRayType, propType, refsType } from "@gaesup/type";
import { Gltf } from "@react-three/drei";
import { GroupProps, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
  vec3,
} from "@react-three/rapier";
import { useAtom, useAtomValue } from "jotai";
import { createRef, useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { colliderAtom } from "../stores/collider";
import { currentAtom } from "../stores/current";
import { optionsAtom } from "../stores/options";
import WheelJoint from "./WheelJoint";
import { V3 } from "./vector";

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

  // const { rigidBodyRef } = refs;
  const wheelPositions: [number, number, number][] = [
    [-sizeX, 0, sizeZ],
    [-sizeX, 0, -sizeZ],
    [sizeX, 0, sizeZ],
    [sizeX, 0, -sizeZ],
  ];
  const wheelRefs = useRef(
    wheelPositions.map(() => createRef<RapierRigidBody>())
  );

  const { rigidBodyRef } = refs;
  const outerGroupRef = useRef<THREE.Group>(null);

  const options = useAtomValue(optionsAtom);
  const current = useAtomValue(currentAtom);
  const { camera } = useThree();
  const { XZDistance, YDistance } = options.perspectiveCamera;

  useEffect(() => {
    if (rigidBodyRef.current) {
      const cameraPosition = vec3(rigidBodyRef.current.translation())
        .clone()
        .add(
          current.dir
            .clone()
            .multiplyScalar(XZDistance)
            .add(V3(0, YDistance, 50))
        );
      camera.position.lerp(cameraPosition, 1);
    }
  }, []);

  useFrame(() => {
    if (
      // !rigidBodyRef ||
      // !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current ||
      !carRigidBodyRef ||
      !carRigidBodyRef.current
    )
      return null;
    carRigidBodyRef.current.setLinvel(V3(0.1, 0, 0.1), false);
  });

  //   useFrame(({ camera }) => {
  //     if (
  //       !rigidBodyRef ||
  //       !rigidBodyRef.current ||
  //       !outerGroupRef ||
  //       !outerGroupRef.current
  //     )
  //       return null;
  //
  //     camera.quaternion.copy(outerGroupRef.current.quaternion);
  //     camera.lookAt(vec3(rigidBodyRef.current.translation()));
  //   });

  const colliderRef = useRef<Collider>(null);
  const carRigidBodyRef = useRef<RapierRigidBody>(null);
  console.log(nodes);
  return (
    <group ref={outerGroupRef}>
      {/* <RigidBody ref={rigidBodyRef}>
        <Gltf src={url} />
      </RigidBody>
 */}

      <RigidBody ref={carRigidBodyRef} colliders={false}>
        <CuboidCollider
          args={[sizeX / 2, sizeY / 2, sizeZ / 2]}
          position={[0, sizeY / 2, 0]}
          name="chassis"
        />
        {nodes && materials && (
          <group receiveShadow castShadow>
            {Object.keys(nodes).map((name: string, key: number) => {
              if (
                nodes[name].type === "Mesh" ||
                nodes[name].type === "SkinnedMesh"
              ) {
                return (
                  <mesh
                    castShadow
                    receiveShadow
                    material={materials[name]}
                    geometry={nodes[name].geometry}
                    key={key}
                  />
                );
              }
            })}
          </group>
        )}
      </RigidBody>
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
          bodyRef={carRigidBodyRef}
          wheel={wheelRefs.current[index]}
          bodyAnchor={wheelPosition}
          wheelAnchor={[0, 0, 0]}
          rotationAxis={[1, 0, 0]}
        />
      ))}
    </group>
  );
}
