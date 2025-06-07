import * as THREE from 'three';

export const calcCharacterColliderProps = (characterSize: THREE.Vector3) => {
  const heightPlusDiameter = characterSize.y / 2;
  const diameter = Math.max(characterSize.x, characterSize.z);
  const radius = diameter / 2;
  const height = heightPlusDiameter - radius;
  const halfHeight = height / 2;
  return {
    height,
    halfHeight,
    radius,
    diameter,
  };
};
