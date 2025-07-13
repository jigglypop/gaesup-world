import * as THREE from 'three';

export interface MinimapMarker {
  id: string;
  type: 'normal' | 'ground';
  text: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
}

export interface MinimapSystemState {
  markers: Map<string, MinimapMarker>;
} 