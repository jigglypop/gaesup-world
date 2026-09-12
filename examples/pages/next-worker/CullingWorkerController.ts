export type CullingWorkerResult = {
  requestId: number;
  visibleCount: number;
  computeMs: number;
  matrices: Float32Array;
};

type WorkerResultMessage = {
  type: 'result';
  requestId: number;
  visibleCount: number;
  computeMs: number;
  matrixBuffer: ArrayBuffer;
};

type WorkerLike = Pick<Worker, 'terminate' | 'onmessage' | 'onerror'> & {
  postMessage: (message: {
    type: 'cull';
    requestId: number;
    viewProjection: Float32Array;
    clipDepthZeroToOne: boolean;
    matrixBuffer: ArrayBuffer;
  }, transfer: Transferable[]) => void;
};

export class CullingWorkerController {
  private readonly worker: WorkerLike;
  private readonly buffers: ArrayBuffer[];
  private readonly pendingViewProjection = new Float32Array(16);
  private readonly handleResult: (result: CullingWorkerResult) => void;
  private readonly handleError: (error: unknown) => void;
  private latestRequestId = 0;
  private pendingRequestId = 0;
  private pendingClipDepthZeroToOne = false;
  private inFlight = false;
  private inFlightRequestId = 0;
  private disposed = false;

  constructor(
    worker: WorkerLike,
    instanceCount: number,
    handleResult: (result: CullingWorkerResult) => void,
    handleError: (error: unknown) => void,
  ) {
    this.worker = worker;
    this.buffers = [
      new ArrayBuffer(instanceCount * 16 * Float32Array.BYTES_PER_ELEMENT),
      new ArrayBuffer(instanceCount * 16 * Float32Array.BYTES_PER_ELEMENT),
    ];
    this.handleResult = handleResult;
    this.handleError = handleError;
    worker.onmessage = (event: MessageEvent<WorkerResultMessage>) => this.receive(event.data);
    worker.onerror = (event) => this.fail(event);
  }

  request(viewProjection: ArrayLike<number>, clipDepthZeroToOne: boolean): number {
    if (this.disposed) return this.latestRequestId;
    this.latestRequestId += 1;
    this.pendingRequestId = this.latestRequestId;
    this.pendingClipDepthZeroToOne = clipDepthZeroToOne;
    for (let index = 0; index < 16; index += 1) {
      this.pendingViewProjection[index] = viewProjection[index] ?? 0;
    }
    this.dispatchPending();
    return this.latestRequestId;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.worker.terminate();
    this.buffers.length = 0;
  }

  private dispatchPending(): void {
    if (this.disposed || this.inFlight || this.pendingRequestId === 0) return;
    const matrixBuffer = this.buffers.pop();
    if (!matrixBuffer) return;
    const requestId = this.pendingRequestId;
    this.pendingRequestId = 0;
    this.inFlight = true;
    this.inFlightRequestId = requestId;
    try {
      this.worker.postMessage(
      {
        type: 'cull',
        requestId,
        viewProjection: this.pendingViewProjection,
        clipDepthZeroToOne: this.pendingClipDepthZeroToOne,
        matrixBuffer,
      },
      [matrixBuffer],
      );
    } catch (error) {
      this.fail(error);
    }
  }

  private receive(message: WorkerResultMessage): void {
    if (this.disposed || !this.inFlight || message.type !== 'result' || message.requestId !== this.inFlightRequestId) return;
    this.inFlight = false;
    try {
      // Publish each completed frame; comparing with pending requests would starve slow workers.
      this.handleResult({
        requestId: message.requestId,
        visibleCount: message.visibleCount,
        computeMs: message.computeMs,
        matrices: new Float32Array(message.matrixBuffer),
      });
    } finally {
      this.dispatchPending();
      if (!this.disposed) this.buffers.push(message.matrixBuffer);
    }
  }

  private fail(error: unknown): void {
    if (this.disposed) return;
    this.inFlight = false;
    this.pendingRequestId = 0;
    this.dispose();
    this.handleError(error);
  }
}
