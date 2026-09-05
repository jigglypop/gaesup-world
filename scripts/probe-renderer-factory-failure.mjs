import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { WebGPURenderer } from 'three/webgpu';

const canvasFailure = new Error('Injected fallback context failure');
const nextBackend = process.argv.includes('--next');
const canvas = { width: 100, height: 100, style: {}, getContext() { throw canvasFailure; } };
const backendPrototype = Object.getPrototypeOf(new WebGPURenderer({ canvas }).backend);
const originalUpdateSize = backendPrototype.updateSize;
const originalGpu = Object.getOwnPropertyDescriptor(navigator, 'gpu');
let created = 0;
let destroyed = 0;
let failedAfterDevice = 0;
const adapter = {
  features: new Set(),
  async requestDevice() {
    created++;
    return { features: new Set(), lost: new Promise(() => {}), destroy() { destroyed++; } };
  },
};
Object.defineProperty(navigator, 'gpu', { configurable: true, value: { requestAdapter: async () => adapter } });
backendPrototype.updateSize = function () {
  assert.ok(this.device, 'Failure must occur after device assignment');
  failedAfterDevice++;
  throw new Error('Injected backend setup failure after device creation');
};
const server = await createServer({ configFile: false, server: { middlewareMode: true }, logLevel: 'silent' });
try {
  const { logger } = await server.ssrLoadModule('/src/core/utils/logger.ts');
  const cleanupErrors = [];
  logger.error = (...args) => cleanupErrors.push(args);
  if (nextBackend) {
    const { createThreeWebGpuBackend } = await server.ssrLoadModule('/src/next/backend/threeWebGpuBackend.ts');
    assert.equal(await createThreeWebGpuBackend({ canvas, width: 100, height: 100 }), null);
  } else {
    const { createRenderer } = await server.ssrLoadModule('/src/core/rendering/webgpu.ts');
    await assert.rejects(createRenderer({ canvas }), error => error === canvasFailure);
  }
  assert.equal(failedAfterDevice, 1);
  assert.equal(created, 1);
  assert.equal(destroyed, 1);
  if (!nextBackend) {
    assert.equal(cleanupErrors.length, 1, 'Uninitialized WebGL cleanup failure must be reported');
    assert.equal(cleanupErrors[0][0], 'Renderer backend cleanup failed');
  }
  process.stdout.write(JSON.stringify({ actualFactory: true, actualThreeBackend: true, simulatedDevicesCreated: created,
    simulatedDevicesDestroyed: destroyed, failureContract: nextBackend ? 'null' : 'original-error', cleanupErrorsReported: cleanupErrors.length }) + '\n');
} finally {
  backendPrototype.updateSize = originalUpdateSize;
  if (originalGpu) Object.defineProperty(navigator, 'gpu', originalGpu);
  else Reflect.deleteProperty(navigator, 'gpu');
  await server.close();
}
