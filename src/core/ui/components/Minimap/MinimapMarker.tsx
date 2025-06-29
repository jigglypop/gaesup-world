import { useEffect } from 'react';
import * as THREE from 'three';
import { useGaesupStore } from '@stores/gaesupStore';
import { InternalMinimapMarkerProps } from './types';

function MinimapMarker({
  id,
  position,
  size = [2, 2, 2],
  text = '',
  type = 'normal',
  children,
}: InternalMinimapMarkerProps) {
  const addMinimapMarker = useGaesupStore((state) => state.addMinimapMarker);
  const removeMinimapMarker = useGaesupStore((state) => state.removeMinimapMarker);

  useEffect(() => {
    const pos = Array.isArray(position) ? position : [position.x, position.y, position.z];
    const sizeVec = Array.isArray(size) ? size : [size.x, size.y, size.z];
    
    addMinimapMarker(id, {
      type,
      text: text || '',
      center: new THREE.Vector3(pos[0], pos[1], pos[2]),
      size: new THREE.Vector3(sizeVec[0], sizeVec[1], sizeVec[2]),
    });

    return () => {
      removeMinimapMarker(id);
    };
  }, [id, position, size, type, text, addMinimapMarker, removeMinimapMarker]);

  return <>{children}</>;
}

export function MinimapPlatform({
  id,
  position,
  size,
  label,
  children,
}: {
  id: string;
  position: THREE.Vector3 | [number, number, number];
  size: THREE.Vector3 | [number, number, number];
  label: string;
  children?: React.ReactNode;
}) {
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
}: {
  id: string;
  position: THREE.Vector3 | [number, number, number];
  emoji: string;
  size?: THREE.Vector3 | [number, number, number];
  children?: React.ReactNode;
}) {
  return (
    <MinimapMarker id={id} position={position} size={size} text={emoji} type="special">
      {children}
    </MinimapMarker>
  );
}
