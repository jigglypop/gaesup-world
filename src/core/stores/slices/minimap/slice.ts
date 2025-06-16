import { StateCreator } from 'zustand';
import { MinimapSlice, MinimapMarkerProps } from './types';

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
