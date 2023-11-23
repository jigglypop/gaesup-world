import { colliderAtom } from '@gaesup/stores/collider';
import { controllerType } from '@gaesup/type';
import { useLoader } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let url = '';

export default function WheelGltf(props: controllerType) {
  url = props.wheelsUrl || url;
  const gltf = useLoader(GLTFLoader, props.url);
  const { materials, nodes } = gltf;
  const collider = useAtomValue(colliderAtom);

  return (
    <>
      <group
        receiveShadow
        castShadow
        {...props.character}
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
      <group
        receiveShadow
        castShadow
        {...props.character}
        position={[0, -collider.height, 0]}
      >
        <primitive
          object={nodes!.walk}
          visible={false}
          receiveShadow
          castShadow
        />
      </group>
    </>
  );
}

useLoader.preload(GLTFLoader, url);
