import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import {
  WebGPURenderer, WGSLNodeBuilder, GLSLNodeBuilder, Mesh, InstancedMesh, InstancedBufferAttribute,
  PlaneGeometry, InstancedBufferGeometry, Scene, PerspectiveCamera, OrthographicCamera, Texture, Sprite, PointsMaterial,
} from 'three/webgpu';

async function loadMaterial(name) {
  const source = await readFile(new URL(`../src/core/rendering/tsl/${name}.ts`, import.meta.url), 'utf8');
  let js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  for (const moduleName of ['three/webgpu', 'three/tsl']) js = js.replaceAll(`'${moduleName}'`, JSON.stringify(import.meta.resolve(moduleName)));
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const { createToonWaterMaterial } = await loadMaterial('toonWater');
const { FlagNodeMaterial } = await loadMaterial('flag');
const { GrassNodeMaterial } = await loadMaterial('grassMaterial');
const { SnowNodeMaterial } = await loadMaterial('snow');
const { WeatherNodeMaterial } = await loadMaterial('weather');
const geometry = new PlaneGeometry(2, 2);
const results = [];
for (const Builder of [WGSLNodeBuilder, GLSLNodeBuilder]) {
  const renderer = new WebGPURenderer({ forceWebGL: Builder === GLSLNodeBuilder, canvas: {
    width: 64, height: 64, style: {}, addEventListener() {}, removeEventListener() {},
  } });
  renderer.hasFeature = () => false;
  for (const Camera of [PerspectiveCamera, OrthographicCamera]) {
    const weatherSource = new PointsMaterial({ color: 0x9ad9ff, size: 0.12, opacity: 0.6 });
    const weather = new WeatherNodeMaterial(weatherSource);
    const weatherSprite = new Sprite(weather);
    weatherSprite.geometry = weatherSprite.geometry.clone();
    weatherSprite.count = 2;
    weatherSprite.geometry.setAttribute('weatherPosition', new InstancedBufferAttribute(new Float32Array([0, 1, 2, 3, 4, 5]), 3));
    const weatherBuilder = new Builder(weatherSprite, renderer);
    weatherBuilder.scene = new Scene();
    weatherBuilder.camera = new Camera();
    weatherBuilder.getUniformBufferLimit = () => 65536;
    weatherBuilder.build();
    assert.ok(weatherBuilder.vertexShader.includes('weatherPosition'));
    assert.ok(!/undefined|NaN/.test(weatherBuilder.vertexShader + weatherBuilder.fragmentShader));
    assert.equal(weather.size, 0.12);
    assert.equal(weather.opacity, 0.6);
    assert.equal(weather.color.getHex(), 0x9ad9ff);
    results.push({ builder: Builder.name, effect: 'weather', camera: Camera.name, vertexBytes: weatherBuilder.vertexShader.length, fragmentBytes: weatherBuilder.fragmentShader.length });
    weatherSprite.geometry.dispose();
    weather.dispose();
    weatherSource.dispose();
    const snow = new SnowNodeMaterial(20, 20);
    const snowSprite = new Sprite(snow);
    snowSprite.geometry = snowSprite.geometry.clone();
    snowSprite.count = 2;
    snowSprite.geometry.setAttribute('snowParticle', new InstancedBufferAttribute(new Float32Array([0, 1, 2, 1, 0.5, 3, 4, 2]), 4));
    snowSprite.geometry.setAttribute('snowDrift', new InstancedBufferAttribute(new Float32Array([0.1, 0.2]), 1));
    const snowBuilder = new Builder(snowSprite, renderer);
    snowBuilder.scene = new Scene();
    snowBuilder.camera = new Camera();
    snowBuilder.getUniformBufferLimit = () => 65536;
    snowBuilder.build();
    assert.ok(snowBuilder.vertexShader.includes('sin('));
    assert.ok(snowBuilder.fragmentShader.includes('exp('));
    assert.ok(!/undefined|NaN/.test(snowBuilder.vertexShader + snowBuilder.fragmentShader));
    assert.equal(snow.sizeAttenuation, false);
    snow.pixelScale = 300;
    assert.equal(snow.pixelScale, 300);
    snow.time = 12;
    assert.equal(snow.time, 12);
    snow.origin.set(1, 2, 3);
    assert.deepEqual(snow.origin.toArray(), [1, 2, 3]);
    results.push({ builder: Builder.name, effect: 'snow', camera: Camera.name, vertexBytes: snowBuilder.vertexShader.length, fragmentBytes: snowBuilder.fragmentShader.length });
    snowSprite.geometry.dispose();
    snow.dispose();
  }
  const { material, time } = createToonWaterMaterial();
  const builder = new Builder(new Mesh(geometry, material), renderer);
  builder.scene = new Scene();
  builder.camera = new PerspectiveCamera();
  builder.build();
  assert.ok(builder.vertexShader.includes('sin('));
  assert.ok(builder.fragmentShader.includes('smoothstep('));
  assert.ok(!/undefined|NaN/.test(builder.vertexShader + builder.fragmentShader));
  assert.equal(material.opacity, 0.88);
  assert.equal(material.depthWrite, false);
  time.value = 12;
  assert.equal(time.value, 12);
  results.push({ builder: Builder.name, vertexBytes: builder.vertexShader.length, fragmentBytes: builder.fragmentShader.length });
  material.dispose();
  const grassGeometry = new InstancedBufferGeometry();
  grassGeometry.index = geometry.index;
  grassGeometry.setAttribute('position', geometry.attributes.position);
  grassGeometry.setAttribute('uv', geometry.attributes.uv);
  for (const [name, itemSize, data] of [
    ['offset', 3, [0, 0, 0, 1, 0, 1]], ['orientation', 4, [0, 0, 0, 1, 0, 0, 0, 1]],
    ['stretch', 1, [1, 1]], ['halfRootAngleSin', 1, [0, 0]], ['halfRootAngleCos', 1, [1, 1]],
  ]) grassGeometry.setAttribute(name, new InstancedBufferAttribute(new Float32Array(data), itemSize));
  grassGeometry.instanceCount = 2;
  const grassMap = new Texture();
  const grass = new GrassNodeMaterial(grassMap, grassMap);
  const grassBuilder = new Builder(new Mesh(grassGeometry, grass), renderer);
  grassBuilder.scene = new Scene();
  grassBuilder.camera = new PerspectiveCamera();
  grassBuilder.build();
  assert.ok(grassBuilder.vertexShader.includes('cross('));
  assert.ok(grassBuilder.fragmentShader.includes('discard'));
  assert.ok(!/undefined|NaN/.test(grassBuilder.vertexShader + grassBuilder.fragmentShader));
  results.push({ builder: Builder.name, effect: 'grass', vertexBytes: grassBuilder.vertexShader.length,
    fragmentBytes: grassBuilder.fragmentShader.length });
  grass.dispose();
  grassMap.dispose();
  grassGeometry.dispose();
  for (const instanced of [false, true]) {
    const map = new Texture();
    const flag = new FlagNodeMaterial(map, instanced);
    const flagGeometry = new PlaneGeometry(2, 2);
    flagGeometry.setAttribute('flagMotion', new InstancedBufferAttribute(new Float32Array([0, 1, 2, 1]), 2));
    const mesh = instanced ? new InstancedMesh(flagGeometry, flag, 2) : new Mesh(flagGeometry, flag);
    const flagBuilder = new Builder(mesh, renderer);
    flagBuilder.scene = new Scene();
    flagBuilder.camera = new PerspectiveCamera();
    flagBuilder.getUniformBufferLimit = () => 65536;
    flagBuilder.build();
    assert.ok(flagBuilder.vertexShader.includes('sin('));
    assert.ok(flagBuilder.fragmentShader.includes('discard'));
    assert.ok(!/undefined|NaN/.test(flagBuilder.vertexShader + flagBuilder.fragmentShader));
    flag.time = 12;
    flag.windStrength = 0.5;
    assert.equal(flag.time, 12);
    assert.equal(flag.windStrength, 0.5);
    results.push({ builder: Builder.name, effect: 'flag', instanced,
      vertexBytes: flagBuilder.vertexShader.length, fragmentBytes: flagBuilder.fragmentShader.length });
    flag.dispose();
    flagGeometry.dispose();
    map.dispose();
  }
}
geometry.dispose();
process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
