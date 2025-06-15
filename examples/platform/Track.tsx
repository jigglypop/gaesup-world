import { Gltf } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { GaeSupProps } from '../../src';
import { S3 } from '../constants';

export default function Track() {
  return (
    <GaeSupProps text="track" type="normal">
      <RigidBody type="fixed" colliders="trimesh">
        <group receiveShadow castShadow scale={0.6} position={[-100, -0.5, -100]}>
          <Gltf src={S3 + '/track.glb'} receiveShadow castShadow />
        </group>
      </RigidBody>
    </GaeSupProps>
  );
}
