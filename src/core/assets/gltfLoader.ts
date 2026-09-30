import { DefaultLoadingManager, LoaderUtils } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { DRACOLoader as ThreeDRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three-stdlib';

/** Seconds of shown page a model download may take before it is abandoned; time in a hidden tab does not count. */
export const GLTF_TIMEOUT_SECONDS = 30;
/**
 * Where a Draco-compressed model finds its decoder, as with drei's `useGLTF`, whose three-stdlib loader this is (three's
 * own points its bundle at decoder files beside it); nothing is fetched for other models.
 */
const DRACO_DECODERS = 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/';

/** Loader configured for the asset pipeline output (`lod*-meshopt.glb`). */
export function createGLTFLoader(): GLTFLoader {
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
}

let shared: GLTFLoader | undefined;

/**
 * Downloads and parses the model at `uri`. Loading shows in three's default loading manager, as a loader's own `load`
 * does, and a download still running after `GLTF_TIMEOUT_SECONDS` of shown page is aborted.
 */
export async function loadGLTF(uri: string): Promise<GLTF> {
  shared ??= createGLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath(DRACO_DECODERS) as unknown as ThreeDRACOLoader);
  const manager = DefaultLoadingManager;
  const url = manager.resolveURL(uri);
  const abort = new AbortController();
  let shown = 0;
  const clock = setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    if (++shown >= GLTF_TIMEOUT_SECONDS) abort.abort(new Error(`no response in ${GLTF_TIMEOUT_SECONDS}s`));
  }, 1000);
  manager.itemStart(url);
  try {
    const response = await fetch(url, { signal: abort.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await shared.parseAsync(await response.arrayBuffer(), LoaderUtils.extractUrlBase(url));
  } catch (error) {
    manager.itemError(url);
    throw new Error(`Could not load ${uri}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  } finally {
    clearInterval(clock);
    manager.itemEnd(url);
  }
}
