import 'reflect-metadata';
import React, { useEffect, useState } from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { createRoot } from 'react-dom/client';

import { CameraSystem } from '/src/core/camera/core/CameraSystem.ts';
import { createRenderer, createLegacyRenderer } from '/src/core/rendering/webgpu.ts';
import { WorldPostProcessing } from '/src/core/rendering/postprocess/WorldPostProcessing.tsx';
import { WeatherEffect } from '/src/core/weather/components/WeatherEffect/index.tsx';

const config = { mode: 'thirdPerson', distance: { x: 15, y: 8, z: 15 }, smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 }, fov: 75, zoom: 1, enableCollision: true };
window.benchmarkOrbit = () => {
  const systems = [new CameraSystem(config), new CameraSystem(config)];
  const run = [() => { for (let i = 0; i < 100000; i++) systems[0].updateConfig({ orbitYaw: i * 0.001, orbitPitch: i * 0.0005 }); },
    () => { for (let i = 0; i < 100000; i++) systems[1].updateOrbit(i * 0.001, i * 0.0005); }];
  try {
    for (let i = 0; i < 10; i++) { run[0](); run[1](); }
    const samples = [[], []];
    for (let i = 0; i < 40; i++) for (const index of i % 2 ? [0, 1] : [1, 0]) {
      const start = performance.now(); run[index](); samples[index].push(performance.now() - start);
    }
    if (JSON.stringify(systems[0].getConfig()) !== JSON.stringify(systems[1].getConfig())) throw new Error('Orbit config mismatch');
    return samples.map(values => { values.sort((a, b) => a - b); return { medianMs: values[20], p95Ms: values[38], updatesPerSample: 100000, samples: 40, warmup: 10 }; });
  } finally { systems.forEach(system => system.destroy()); }
};

function Probe() {
  const state = useThree();
  useEffect(() => {
    window.renderState = state;
    window.readRenderProbe = () => {
      const particles = [];
      state.scene.traverse(object => {
        const position = object.geometry?.getAttribute('weatherPosition') ?? (object.isPoints && object.geometry.getAttribute('position'));
        if (!position) return;
        particles.push({ kind: object.type, count: position.count, version: position.version, time: object.material.time,
          sample: Array.from(position.array.slice(0, 12)), position: object.position.toArray(), uuid: object.uuid });
      });
      return { native: state.gl.backend?.isWebGPUBackend === true, particles, textures: state.gl.info.memory.textures,
        geometries: state.gl.info.memory.geometries, frames: window.renderFrames ?? 0 };
    };
    window.moveCamera = () => { state.camera.position.x += 2; state.camera.lookAt(0, 6, 0); };
  }, [state]);
  useFrame(() => { window.renderFrames = (window.renderFrames ?? 0) + 1; });
  return null;
}

function Demo() {
  const [kind, setKind] = useState('rain');
  const [enabled, setEnabled] = useState(true);
  const [settings, setSettings] = useState({ bloomStrength: 0.18, saturation: 1.08 });
  useEffect(() => { Object.assign(window, { setWeatherKind: setKind, setWeatherEnabled: setEnabled, setPostSettings: setSettings }); }, []);
  const legacy = new URLSearchParams(location.search).has('legacy');
  return <Canvas gl={legacy ? createLegacyRenderer : createRenderer} camera={{ position: [0, 8, 24], fov: 60 }} dpr={1}>
    <color attach="background" args={['#101622']} />
    <ambientLight intensity={2} />
    {enabled && <WeatherEffect kind={kind} count={5000} area={30} height={18} followCamera />}
    <Probe />
    {!legacy && <WorldPostProcessing {...settings} />}
  </Canvas>;
}
const root = createRoot(document.getElementById('root'));
window.unmountProbe = () => root.unmount();
root.render(<Demo />);
