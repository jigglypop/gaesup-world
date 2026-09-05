const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const THREE = require('three');
const { chromium } = require('@playwright/test');

(async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/core/building/components/BuildingGpuCullingDriver/index.tsx'), 'utf8');
  const template = source.match(/code: `([\s\S]*?)`/)[1];
  const workgroup = Number(source.match(/const WORKGROUP_SIZE = (\d+)/)[1]);
  const shader = template.replace('${WORKGROUP_SIZE}', String(workgroup));
  const camera = new THREE.PerspectiveCamera(20, 1, 10, 100);
  camera.coordinateSystem = THREE.WebGPUCoordinateSystem;
  camera.position.x = 25;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse), camera.coordinateSystem);
  const uniform = new Float32Array(32);
  frustum.planes.forEach((plane, i) => {
    plane.normal.toArray(uniform, i * 4);
    uniform[i * 4 + 3] = plane.constant;
  });
  const spheres = [25, 0, -7, 1, 25, 0, -20, 1, 29, 0, -20, 1, 32, 0, -20, 1, 25, 0, -110, 1];
  uniform.set([25, 0, 0, 140, spheres.length / 4], 24);
  const server = http.createServer((_request, response) => response.end('<!doctype html><title>GPU culling verification</title>'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const software = process.argv.includes('--software');
  try {
    browser = await chromium.launch({ headless: true, args: software ? ['--enable-unsafe-webgpu', '--use-angle=swiftshader'] : [] });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    const result = await page.evaluate(async ({ shader, uniform, spheres }) => {
      const adapter = await navigator.gpu?.requestAdapter();
      if (!adapter) return { available: false };
      const device = await adapter.requestDevice();
      const owned = [];
      const errors = [];
      device.addEventListener('uncapturederror', event => errors.push(event.error.message));
      try {
        device.pushErrorScope('validation');
        const module = device.createShaderModule({ code: shader });
        const compilation = await module.getCompilationInfo();
        const messages = compilation.messages.map(message => ({ type: message.type, message: message.message }));
        const pipeline = await device.createComputePipelineAsync({ layout: 'auto', compute: { module, entryPoint: 'main' } });
        const create = (size, usage) => {
          const buffer = device.createBuffer({ size, usage });
          owned.push(buffer);
          return buffer;
        };
        const spatial = create(spheres.length * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
        const params = create(uniform.length * 4, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
        const output = create(spheres.length, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC);
        const read = create(spheres.length, GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST);
        device.queue.writeBuffer(spatial, 0, new Float32Array(spheres));
        device.queue.writeBuffer(params, 0, new Float32Array(uniform));
        const bindGroup = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [
          { binding: 0, resource: { buffer: spatial } },
          { binding: 2, resource: { buffer: output } },
          { binding: 3, resource: { buffer: params } },
        ] });
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.dispatchWorkgroups(1);
        pass.end();
        encoder.copyBufferToBuffer(output, 0, read, 0, spheres.length);
        device.queue.submit([encoder.finish()]);
        await read.mapAsync(GPUMapMode.READ);
        const flags = [...new Uint32Array(read.getMappedRange())];
        read.unmap();
        const validation = await device.popErrorScope();
        return { available: true, adapter: { vendor: adapter.info?.vendor, architecture: adapter.info?.architecture, description: adapter.info?.description, isFallbackAdapter: adapter.info?.isFallbackAdapter }, flags, messages, validation: validation?.message ?? null, errors };
      } finally {
        for (const buffer of owned) buffer.destroy();
        device.destroy();
      }
    }, { shader, uniform: [...uniform], spheres });
    process.stdout.write(JSON.stringify({ software, ...result }) + '\n');
    assert.equal(result.available, true, 'No WebGPU adapter available');
    assert.deepEqual(result.flags, [0, 1, 1, 0, 0]);
    assert.equal(result.validation, null);
    assert.deepEqual(result.errors, []);
    assert.equal(result.messages.filter(message => message.type === 'error').length, 0);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
