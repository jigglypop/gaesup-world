import { CullingWorkerController } from '../next-worker/CullingWorkerController';

type PostedMessage = {
  requestId: number;
  matrixBuffer: ArrayBuffer;
};

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  readonly posts: { message: PostedMessage; transfer: Transferable[] }[] = [];
  readonly terminate = jest.fn();

  postMessage(message: PostedMessage, transfer: Transferable[]): void {
    this.posts.push({ message, transfer });
  }

  emitResult(requestId: number, matrixBuffer: ArrayBuffer, visibleCount = 1): void {
    new Float32Array(matrixBuffer)[12] = requestId;
    this.onmessage?.({
      data: { type: 'result', requestId, visibleCount, computeMs: requestId / 10, matrixBuffer },
    } as MessageEvent);
  }
}

test('worker culling keeps one request in flight without starving results while the camera moves', () => {
  const worker = new FakeWorker();
  const results: number[] = [];
  const controller = new CullingWorkerController(
    worker,
    4,
    (result) => results.push(result.matrices[12] ?? -1),
    () => undefined,
  );
  const matrix = new Float32Array(16);

  expect(controller.request(matrix, false)).toBe(1);
  matrix[0] = 2;
  expect(controller.request(matrix, false)).toBe(2);
  matrix[0] = 3;
  expect(controller.request(matrix, true)).toBe(3);
  expect(worker.posts).toHaveLength(1);
  expect(worker.posts[0]?.transfer).toEqual([worker.posts[0]?.message.matrixBuffer]);

  const firstBuffer = worker.posts[0]!.message.matrixBuffer;
  worker.emitResult(1, firstBuffer);
  expect(results).toEqual([1]);
  expect(worker.posts).toHaveLength(2);
  expect(worker.posts[1]?.message.requestId).toBe(3);
  expect(worker.posts[1]?.message.matrixBuffer).not.toBe(firstBuffer);

  worker.emitResult(1, firstBuffer);
  expect(results).toEqual([1]);

  worker.emitResult(3, worker.posts[1]!.message.matrixBuffer);
  expect(results).toEqual([1, 3]);
});

test('disposing worker culling terminates its worker and ignores late results', () => {
  const worker = new FakeWorker();
  const handleResult = jest.fn();
  const controller = new CullingWorkerController(worker, 2, handleResult, () => undefined);
  controller.request(new Float32Array(16), false);
  const buffer = worker.posts[0]!.message.matrixBuffer;

  controller.dispose();
  expect(worker.terminate).toHaveBeenCalledTimes(1);
  expect(worker.onmessage).toBeNull();
  worker.emitResult(1, buffer);
  expect(handleResult).not.toHaveBeenCalled();
});

test('a failed transfer terminates the worker and stops further requests', () => {
  const worker = new FakeWorker();
  const failure = new Error('worker transfer failed');
  jest.spyOn(worker, 'postMessage').mockImplementation(() => { throw failure; });
  const handleError = jest.fn();
  const controller = new CullingWorkerController(worker, 2, () => undefined, handleError);
  controller.request(new Float32Array(16), false);
  controller.request(new Float32Array(16), false);
  expect(handleError).toHaveBeenCalledWith(failure);
  expect(worker.postMessage).toHaveBeenCalledTimes(1);
  expect(worker.terminate).toHaveBeenCalledTimes(1);
});
