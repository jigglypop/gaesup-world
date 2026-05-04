import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { PLATFORMS } from './constants';
import { MinimapPlatform } from '../../../src';

import './styles.css';

export function Platforms() {
  const setHover = (object: THREE.Object3D, emissive: number): void => {
    if (!(object instanceof THREE.Mesh)) return;
    const material = object.material;
    if (!(material instanceof THREE.MeshStandardMaterial)) return;
    material.emissive.setHex(emissive);
  };

  return (
    <>
      {PLATFORMS.map((platform, index) => (
        <MinimapPlatform
          key={index}
          id={`platform_${index}`}
          position={platform.position as [number, number, number]}
          size={platform.size as [number, number, number]}
          label={platform.label}
        >
          <RigidBody type="fixed" colliders="cuboid">
            <mesh
              position={platform.position as [number, number, number]}
              castShadow
              receiveShadow
              onClick={(e) => e.stopPropagation()}
              onPointerOver={(e) => setHover(e.object, 0x222222)}
              onPointerOut={(e) => setHover(e.object, 0x000000)}
            >
              <boxGeometry args={platform.size as [number, number, number]} />
              <meshStandardMaterial color={platform.color} />
            </mesh>
          </RigidBody>
        </MinimapPlatform>
      ))}
    </>
  );
}
