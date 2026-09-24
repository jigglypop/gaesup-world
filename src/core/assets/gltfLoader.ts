import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Loader configured for the asset pipeline output (`lod*-meshopt.glb`). */
export function createGLTFLoader(): GLTFLoader {
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
}
