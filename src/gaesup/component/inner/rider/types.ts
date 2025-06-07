import { ReactNode } from 'react';
import * as THREE from 'three';

export type riderRefType = {
  url: string;
  children?: ReactNode;
  offset?: THREE.Vector3;
  euler?: THREE.Euler;
  currentAnimation?: string;
};
