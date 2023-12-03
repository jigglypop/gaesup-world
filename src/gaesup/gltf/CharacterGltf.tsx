import {
  GLTFResult,
  callbackType,
  groundRayType,
  propType,
  refsType,
} from "@gaesup/type";
import { GroupProps, useLoader } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import playActions from "../animation/actions";
import initCallback from "../initial/initCallback";
import { colliderAtom } from "../stores/collider";

let preloadUrl = "";

export type characterGltfType = {
  prop: propType;
  url: string;
  character?: GroupProps;
  groundRay: groundRayType;
  refs: refsType;
  callbacks?: callbackType;
  gltf: GLTFResult;
};

export default function CharacterGltf({
  gltf,
  prop,
  url,
  character,
  groundRay,
  refs,
  callbacks,
}: characterGltfType) {
  preloadUrl = url;
  const { materials, nodes, animations } = gltf;
  const collider = useAtomValue(colliderAtom);

  initCallback({
    prop,
    callbacks,
    animations,
  });
  playActions({
    outerGroupRef: refs.outerGroupRef,
    groundRay: groundRay,
    animations,
  });

  return (
    <group
      receiveShadow
      castShadow
      {...character}
      position={[0, -collider.height, 0]}
    >
      <primitive
        object={nodes!.walk}
        visible={false}
        receiveShadow
        castShadow
      />
      {Object.keys(nodes!).map((name: string, key: number) => {
        if (nodes[name].type === "SkinnedMesh") {
          return (
            <skinnedMesh
              castShadow
              receiveShadow
              material={materials[name]}
              geometry={nodes[name].geometry}
              skeleton={(nodes[name] as THREE.SkinnedMesh).skeleton}
              key={key}
            />
          );
        }
      })}
    </group>
  );
}

useLoader.preload(GLTFLoader, preloadUrl);
