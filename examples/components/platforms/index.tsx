import { RigidBody } from '@react-three/rapier';
import { MinimapPlatform } from '../../../src';
import { PLATFORMS } from './constants';
import { PlatformData } from './types';
import './styles.css';
import { Html } from '@react-three/drei';

export function Platforms() {
  const handlePlatformClick = (e: any, platformData: PlatformData) => {
    e.stopPropagation();
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
              onClick={(e) => handlePlatformClick(e, platform)}
              onPointerOver={(e) => e.object.material.emissive.setHex(0x222222)}
              onPointerOut={(e) => e.object.material.emissive.setHex(0x000000)}
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
