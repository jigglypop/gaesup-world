import { Gltf } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { S3 } from '../src/constants';

export default function Stair() {
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <group receiveShadow castShadow scale={15} position={[0, -2, -15]}>
        <Gltf src={S3 + '/stair.glb'} receiveShadow castShadow />
      </group>
    </RigidBody>
  );
}
