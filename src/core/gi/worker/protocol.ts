import type { GiRuntimeParams } from '../components/GiVolume/types';
import type { GiEnvironment, ProbeAtlasUpload, VoxelSourceBox } from '../types';

/** What the page tells the GI worker. The module is compiled once on the page and cloned into the worker. */
export type GiWorkerRequest =
  | { type: 'init'; module: WebAssembly.Module | null; probesPerTick: number; uploadIntervalMs: number }
  | { type: 'scene'; boxes: readonly VoxelSourceBox[]; params: GiRuntimeParams; environment: GiEnvironment }
  | { type: 'environment'; environment: GiEnvironment }
  /** Atlas arrays the renderer stopped drawing with, transferred back for the next upload. */
  | { type: 'recycle'; atlases: Uint16Array[] }
  /** The page is hidden: nothing is drawn, so tracing waits until it shows again. */
  | { type: 'pause'; paused: boolean }
  | { type: 'dispose' };

/** What the GI worker sends back: packed atlases (their buffers transferred) or the reason it stopped. */
export type GiWorkerResponse =
  | { type: 'atlas'; levels: ProbeAtlasUpload[]; usesWasm: boolean }
  | { type: 'error'; message: string };
