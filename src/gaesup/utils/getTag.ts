import * as THREE from 'three';

export const getTag = (node?: THREE.Mesh) => node?.name?.split('_')?.[0];
export const isEqual = (tag: string, node?: THREE.Mesh) => node?.name?.split('_')?.[0] === tag;
