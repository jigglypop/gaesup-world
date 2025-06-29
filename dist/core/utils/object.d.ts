import * as THREE from 'three';
/**
 * Splits the node's name by "_" and returns the first part (the tag).
 * @param node The THREE.Mesh object.
 * @returns The tag string or undefined.
 */
export declare const getTag: (node?: THREE.Object3D) => string | undefined;
/**
 * Checks if the tag from the node's name is equal to the given tag.
 * @param tag The tag to compare against.
 * @param node The THREE.Mesh object.
 * @returns True if the tags are equal, false otherwise.
 */
export declare const isEqualTag: (tag: string, node?: THREE.Object3D) => boolean;
