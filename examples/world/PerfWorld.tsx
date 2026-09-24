import { Suspense, useLayoutEffect } from 'react';

import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { createRenderer, GaesupController, GaesupWorld, GaesupWorldContent, WorldPhysics } from 'gaesup-world';
import { BuildingController, useBuildingStore } from 'gaesup-world/building';

import { createPerfWorld, parsePerfWorldSize } from './seed';

const size = parsePerfWorldSize(new URLSearchParams(location.search).get('size'));
const spawn = new THREE.Vector3(0, 2, 0);

/** Benchmark route for `scripts/frame-harness.cjs --route=/world?size=s|m|l`: the real R3F world with a seeded build. */
export default function PerfWorld() {
  useLayoutEffect(() => {
    useBuildingStore.getState().hydrate(createPerfWorld(size));
  }, []);
  return (
    <GaesupWorld urls={{ characterUrl: `${import.meta.env.BASE_URL}gltf/ally_body.glb` }} cameraOption={{ type: 'thirdPerson' }}>
      <Canvas shadows gl={(props) => createRenderer(props)} camera={{ position: [0, 10, 20], fov: 60, near: 0.1, far: 1000 }} style={{ width: '100vw', height: '100vh' }}>
        <color attach="background" args={['#9cc6e0']} />
        <ambientLight intensity={1.4} />
        <directionalLight castShadow position={[30, 50, 20]} intensity={2.4} />
        <Suspense fallback={null}>
          <GaesupWorldContent>
            <WorldPhysics>
              <GaesupController parts={[]} position={spawn} />
              <BuildingController />
            </WorldPhysics>
          </GaesupWorldContent>
        </Suspense>
      </Canvas>
    </GaesupWorld>
  );
}
