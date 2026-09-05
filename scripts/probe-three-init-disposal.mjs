import assert from 'node:assert/strict';
import Renderer from 'three/src/renderers/common/Renderer.js';
import Backend from 'three/src/renderers/common/Backend.js';
import { REVISION } from 'three';
import WebGPUBackend from 'three/src/renderers/webgpu/WebGPUBackend.js';
import WebGLBackend from 'three/src/renderers/webgl-fallback/WebGLBackend.js';

const failure = new Error('Injected backend failure after allocation');
class FailingBackend extends Backend {
  allocated = false;
  disposals = 0;
  async init(renderer) {
    await super.init(renderer);
    this.allocated = true;
    throw failure;
  }
  dispose() {
    this.disposals++;
    this.allocated = false;
  }
}

const backend = new FailingBackend({ canvas: { width: 100, height: 100, style: {} } });
const renderer = new Renderer(backend);
await assert.rejects(renderer.init(), error => error === failure);
const rejection = new Promise((resolve, reject) => {
  const handleRejection = error => {
    clearTimeout(timeout);
    resolve(error);
  };
  const timeout = setTimeout(() => {
    process.removeListener('unhandledRejection', handleRejection);
    reject(new Error('Expected dispose to expose the rejected initialization promise'));
  }, 1000);
  process.once('unhandledRejection', handleRejection);
});
renderer.dispose();
assert.equal(await rejection, failure);
assert.equal(backend.disposals, 0);
assert.equal(backend.allocated, true);
process.stdout.write(JSON.stringify({ threeRevision: REVISION, backendDisposed: false, allocationRetained: true, disposeRejectedWithOriginalFailure: true }) + '\n');
backend.dispose();
assert.equal(backend.allocated, false);
assert.doesNotThrow(() => new WebGPUBackend().dispose());
assert.throws(() => new WebGLBackend().dispose(), TypeError);
let deviceDisposals = 0;
const device = { destroy() { deviceDisposals++; } };
const ownedBackend = new WebGPUBackend();
ownedBackend.device = device;
ownedBackend.dispose();
assert.equal(deviceDisposals, 1);
const borrowedBackend = new WebGPUBackend({ device });
borrowedBackend.device = device;
borrowedBackend.dispose();
assert.equal(deviceDisposals, 1);
process.stdout.write('WebGPU disposal accepts uninitialized state and preserves borrowed devices; uninitialized WebGL disposal throws.\n');
