import { StateCreator } from 'zustand';
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

export const createMinimapSlice: StateCreator<MinimapSlice, [], [], MinimapSlice> = (set) => ({
  minimap: {
    props: {},
  },
  addMinimapMarker: (id, marker) =>
    set((state) => ({
      minimap: {
        props: {
          ...state.minimap.props,
          [id]: marker,
        },
      },
    })),
  removeMinimapMarker: (id) =>
    set((state) => {
      const newProps = { ...state.minimap.props };
      delete newProps[id];
      return {
        minimap: {
          props: newProps,
        },
      };
    }),
});
