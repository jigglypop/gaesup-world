import type { GiRuntimeParams } from './types';
import type { GiEnvironment, ProbeAtlasUpload, VoxelSourceBox } from '../../types';
import GiWorker from '../../worker/giWorker?worker&inline';
import type { GiWorkerRequest, GiWorkerResponse } from '../../worker/protocol';

type Handlers = {
  onAtlas: (levels: ProbeAtlasUpload[], usesWasm: boolean) => void;
  onError: (error: unknown) => void;
};

/** Whether this page can run the GI worker at all (browsers; not SSR or plain test environments). */
export function canUseGiWorker(): boolean {
  return typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined';
}

/**
 * The page's side of the GI worker: forwards the voxel scene and the light, hands packed atlases to `onAtlas` and
 * reports a worker that could not start or stopped. Construction throws when the worker cannot be created (for
 * example a content security policy without blob: workers); callers then keep the main-thread path.
 */
export class GiWorkerClient {
  private readonly worker: Worker;
  private closed = false;

  constructor(
    module: WebAssembly.Module | null,
    options: { probesPerTick: number; uploadIntervalMs: number },
    handlers: Handlers,
  ) {
    this.worker = new GiWorker({ name: 'gaesup-gi' });
    this.worker.onmessage = (event: MessageEvent<GiWorkerResponse>) => {
      if (this.closed) return;
      const message = event.data;
      if (message.type === 'atlas') handlers.onAtlas(message.levels, message.usesWasm);
      else this.fail(handlers, new Error(message.message));
    };
    this.worker.onerror = (event) => {
      event.preventDefault();
      this.fail(handlers, new Error(event.message || 'GI worker failed to start'));
    };
    this.worker.onmessageerror = () => this.fail(handlers, new Error('GI worker message could not be read'));
    this.send({ type: 'init', module, ...options });
  }

  setScene(boxes: readonly VoxelSourceBox[], params: GiRuntimeParams, environment: GiEnvironment): void {
    this.send({ type: 'scene', boxes, params, environment });
  }

  setEnvironment(environment: GiEnvironment): void {
    this.send({ type: 'environment', environment });
  }

  /** Stops tracing while nothing is drawn (a hidden page) and picks it up again. */
  setPaused(paused: boolean): void {
    this.send({ type: 'pause', paused });
  }

  /** Hands arrays the renderer stopped using back to the worker, which packs later uploads into them. */
  recycle(atlases: Uint16Array[]): void {
    if (atlases.length === 0) return;
    this.send({ type: 'recycle', atlases }, atlases.map((atlas) => atlas.buffer as ArrayBuffer));
  }

  dispose(): void {
    if (this.closed) return;
    this.send({ type: 'dispose' });
    this.closed = true;
    this.worker.terminate();
  }

  private send(message: GiWorkerRequest, transfer: Transferable[] = []): void {
    if (this.closed) return;
    this.worker.postMessage(message, transfer);
  }

  private fail(handlers: Handlers, error: Error): void {
    if (this.closed) return;
    this.closed = true;
    this.worker.terminate();
    handlers.onError(error);
  }
}
