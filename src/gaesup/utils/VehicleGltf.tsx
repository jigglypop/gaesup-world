import { callbackType, groundRayType, propType, refsType } from "@gaesup/type";
import { Cylinder } from "@react-three/drei";
import { GroupProps, useLoader } from "@react-three/fiber";
import {
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { useAtom } from "jotai";
import { RefObject, createRef, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { colliderAtom } from "../stores/collider";

const WheelJoint = ({
  body,
  wheel,
  bodyAnchor,
  wheelAnchor,
  rotationAxis,
}: {
  body: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: THREE.Vector3Tuple;
  wheelAnchor: THREE.Vector3Tuple;
  rotationAxis: THREE.Vector3Tuple;
}) => {
  const joint = useRevoluteJoint(body, wheel, [
    bodyAnchor,
    wheelAnchor,
    rotationAxis,
  ]);

  // useFrame(() => {
  //   if (joint.current) {
  //     joint.current.configureMotorVelocity(20, 10);
  //   }
  // });

  return null;
};

let preloadUrl = "";

export type characterGltfType = {
  prop: propType;
  url: string;
  character?: GroupProps;
  groundRay: groundRayType;
  refs: refsType;
  callbacks?: callbackType;
};

export default function VehicleGltf({
  prop,
  url,
  character,
  groundRay,
  refs,
  callbacks,
}: characterGltfType) {
  preloadUrl = url;
  const gltf = useLoader(GLTFLoader, url);

  // useColliderInit(scene, character);
  // initCallback({
  //   prop,
  //   callbacks,
  //   animations,
  // });
  // playActions({
  //   outerGroupRef: refs.outerGroupRef,
  //   groundRay: groundRay,
  //   animations,
  // });

  const { materials, nodes, scene } = gltf;
  // const collider = useAtomValue(colliderAtom);
  const [collider, setcollider] = useAtom(colliderAtom);
  // useColliderInit(scene, character);
  const bodyRef = useRef<RapierRigidBody>(null);
  const wheelPositions: [number, number, number][] = [
    [-1, 0, 1],
    [-1, 0, -1],
    [1, 0, 1],
    [1, 0, -1],
  ];
  const wheelRefs = useRef(
    wheelPositions.map(() => createRef<RapierRigidBody>())
  );
  return (
    <>
      {nodes && materials && (
        <group receiveShadow castShadow>
          {/* {Object.keys(nodes).map((name: string, key: number) => {
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
          })} */}
        </group>
      )}
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
        {/* <RigidBody colliders="cuboid" ref={bodyRef} type="dynamic">
          <Box scale={[1, 1, 1]} castShadow receiveShadow name="chassis"></Box>
        </RigidBody> */}
        {wheelPositions.map((wheelPosition, index) => (
          <RigidBody
            position={wheelPosition}
            colliders="hull"
            type="dynamic"
            key={index}
            ref={wheelRefs.current[index]}
          >
            <Cylinder
              rotation={[Math.PI / 2, 0, Math.PI / 2]}
              args={[1, 1, 1, 32]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={"grey"} />
            </Cylinder>
          </RigidBody>
        ))}
        {/* {wheelPositions.map((wheelPosition, index) => (
          <WheelJoint
            key={index}
            body={bodyRef}
            wheel={wheelRefs.current[index]}
            bodyAnchor={wheelPosition}
            wheelAnchor={[0, 0, 0]}
            rotationAxis={[0, 0, 1]}
          />
        ))} */}
      </group>
    </>
  );
}

// useLoader.preload(GLTFLoader, preloadUrl);
