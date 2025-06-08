import { useEffect } from 'react';
import * as THREE from 'three';
import { gameStore } from '../../store/gameStore';

interface MinimapMarkerProps {
  id: string;
  position: THREE.Vector3 | [number, number, number];
  size?: THREE.Vector3 | [number, number, number];
  text?: string;
  type?: 'normal' | 'ground';
  children?: React.ReactNode;
}

// 미니맵 마커 자동 등록 컴포넌트
export function MinimapMarker({
  id,
  position,
  size = [2, 2, 2],
  text = '',
  type = 'normal',
  children,
}: MinimapMarkerProps) {
  useEffect(() => {
    // 위치와 크기를 Vector3로 변환
    const pos = Array.isArray(position) ? new THREE.Vector3(...position) : position;
    const sizeVec = Array.isArray(size) ? new THREE.Vector3(...size) : size;

    // 미니맵에 등록
    gameStore.minimap.props[id] = {
      type,
      text,
      center: pos,
      size: sizeVec,
    };

    // 컴포넌트 언마운트 시 제거
    return () => {
      delete gameStore.minimap.props[id];
    };
  }, [id, position, size, text, type]);

  return <>{children}</>;
}

// 편의를 위한 특별한 마커들
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
    <MinimapMarker id={id} position={position} size={size} text={emoji} type="normal">
      {children}
    </MinimapMarker>
  );
}
