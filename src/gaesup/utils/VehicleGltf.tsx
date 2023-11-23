import { colliderAtom, useColliderInit } from '@gaesup/stores/collider';
import { controllerType } from '@gaesup/type';
import { useLoader } from '@react-three/fiber';
import { useAtom } from 'jotai';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let url = '';
let wheelsUrl = '/wheel.glb';
export default function VehicleGltf(props: controllerType) {
  url = props.url;
  const gltf = useLoader(GLTFLoader, '/kart.glb');
  const { materials, nodes, scene } = gltf;
  // const collider = useAtomValue(colliderAtom);
  const [collider, setcollider] = useAtom(colliderAtom);
  useColliderInit(scene, props.character);

  return (
    <>
      {nodes && materials && (
        <group receiveShadow castShadow>
          {Object.keys(nodes).map((name: string, key: number) => {
            if (
              nodes[name].type === 'Mesh' ||
              nodes[name].type === 'SkinnedMesh'
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
    </>
  );
}

// useLoader.preload(GLTFLoader, url);
