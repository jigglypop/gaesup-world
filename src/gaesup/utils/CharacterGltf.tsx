import playActions from '@gaesup/animation/actions';
import initCallback from '@gaesup/initial/initCallback';
import { colliderAtom, useColliderInit } from '@gaesup/stores/collider';
import { callbackType, groundRayType, propType, refsType } from '@gaesup/type';
import { GroupProps, useLoader } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let preloadUrl = '';

export type characterGltfType = {
  prop: propType;
  url: string;
  character?: GroupProps;
  groundRay: groundRayType;
  refs: refsType;
  callbacks?: callbackType;
};

export default function CharacterGltf({
  prop,
  url,
  character,
  groundRay,
  refs,
  callbacks
}: characterGltfType) {
  preloadUrl = url;
  const gltf = useLoader(GLTFLoader, url);
  const { materials, nodes, scene, animations } = gltf;
  const collider = useAtomValue(colliderAtom);

  useColliderInit(scene, character);
  initCallback({
    prop,
    callbacks,
    animations
  });
  playActions({
    outerGroupRef: refs.outerGroupRef,
    groundRay: groundRay,
    animations
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
        if (nodes[name].type === 'SkinnedMesh') {
          return (
            <skinnedMesh
              castShadow
              receiveShadow
              material={materials!![name]}
              geometry={nodes![name].geometry}
              skeleton={nodes![name].skeleton}
              key={key}
            />
          );
        }
      })}
    </group>
  );
}

useLoader.preload(GLTFLoader, preloadUrl);
