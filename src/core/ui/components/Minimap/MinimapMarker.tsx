import { useEffect } from 'react';
import * as THREE from 'three';
import { InternalMinimapMarkerProps, MinimapObjectProps, MinimapPlatformProps } from './types';
import { MinimapSystem } from '../../core/MinimapSystem';

function MinimapMarker({
  id,
  position,
  size = [2, 2, 2],
  text = '',
  type = 'normal',
  children,
}: InternalMinimapMarkerProps) {
  useEffect(() => {
    const engine = MinimapSystem.getInstance();
    const pos = Array.isArray(position) ? position : [position.x, position.y, position.z];
    const sizeVec = Array.isArray(size) ? size : [size.x, size.y, size.z];
    
    engine.addMarker(
      id,
      type,
      text || '',
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      new THREE.Vector3(sizeVec[0], sizeVec[1], sizeVec[2])
    );

    return () => {
      engine.removeMarker(id);
    };
  }, [id, position, size, type, text]);

  return <>{children}</>;
}

export function MinimapPlatform({
  id,
  position,
  size,
  label,
  children,
}: MinimapPlatformProps) {
  return (
    <MinimapMarker id={id} position={position} size={size} text={label} type="ground">
      {children}
    </MinimapMarker>
  );
}

export function MinimapObject({
  id,
  position,
  emoji,
  size = [3, 3, 3],
  children,
}: MinimapObjectProps) {
  return (
    <MinimapMarker id={id} position={position} size={size} text={emoji} type="normal">
      {children}
    </MinimapMarker>
  );
}
