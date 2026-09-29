import * as THREE from 'three';

import { rideableType } from '@hooks/useRideable/types';

export type RideableState = {
  [key: string]: rideableType;
};

export type RideableSlice = {
  rideable: RideableState;
  setRideable: (key: string, value: Partial<rideableType>) => void;
  removeRideable: (key: string) => void;
};

export type RideableType = {
  offset?: THREE.Vector3;
  visible?: boolean;
  isOccupied?: boolean;
};
