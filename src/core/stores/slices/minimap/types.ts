import * as THREE from 'three';

export interface MinimapMarkerProps {
  type: 'normal' | 'ground' | string;
  text: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
}

export interface MinimapState {
  props: Record<string, MinimapMarkerProps>;
}

export interface MinimapSlice {
  minimap: MinimapState;
  addMinimapMarker: (id: string, marker: MinimapMarkerProps) => void;
  removeMinimapMarker: (id: string) => void;
}
