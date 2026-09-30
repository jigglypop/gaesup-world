// Worker entry: GiVolume starts it from an inline bundle (`?worker&inline`), so it ships inside the package's JS.
import { GiWorkerHost } from './host';
import type { GiWorkerRequest, GiWorkerResponse } from './protocol';

type WorkerScope = {
  postMessage: (message: GiWorkerResponse, transfer: Transferable[]) => void;
  onmessage: ((event: MessageEvent<GiWorkerRequest>) => void) | null;
};

const scope = self as unknown as WorkerScope;
const host = new GiWorkerHost((message, transfer) => scope.postMessage(message, transfer));

scope.onmessage = (event) => {
  try {
    host.handle(event.data);
  } catch (error) {
    scope.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) }, []);
  }
};
