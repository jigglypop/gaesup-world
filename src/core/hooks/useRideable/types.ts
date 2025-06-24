import * as THREE from 'three';
import { NearbyRideable } from '../../world/components/Rideable/types';

export type rideableType = {
  objectkey: string;
  objectType?: 'vehicle' | 'airplane';
  enableRiding?: boolean;
  isRiderOn?: boolean;
  url?: string;
  characterUrl?: string;
  ridingUrl?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  landingOffset?: THREE.Vector3;
  visible?: boolean;
  isOccupied?: boolean;
  vehicleSize?: THREE.Vector3;
  wheelSize?: THREE.Vector3;
  airplaneSize?: THREE.Vector3;
  rideMessage?: string;
  exitMessage?: string;
  displayName?: string;
};

export type RideStateChangeData = {
  shouldEnterRideable?: boolean;
  shouldExitRideable?: boolean;
  canRide?: boolean;
  isRiding?: boolean;
};

export type NearbyRideableType = NearbyRideable;
