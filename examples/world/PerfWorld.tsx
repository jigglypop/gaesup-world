import { lazy, Suspense, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';

import { Canvas, type RootState } from '@react-three/fiber';
import * as THREE from 'three';

import { CascadedSun, createRenderer, GaesupController, GaesupWorld, GaesupWorldContent, useNPCStore, WorldPhysics, type WorldQuality } from 'gaesup-world';
import { BuildingController, useBuildingStore } from 'gaesup-world/building';
import { RemotePlayer, type PlayerState } from 'gaesup-world/network';

import { createPerfWorld, parsePerfWorldSize, type PerfWorldOptions, type PerfWorldSize } from './seed';

const spawn = new THREE.Vector3(0, 2, 0);
const FULL_SCREEN: CSSProperties = { width: '100vw', height: '100vh' };
const CHARACTER_URL = `${import.meta.env.BASE_URL}gltf/ally_body.glb`;
const NPC_TEMPLATE = 'perf-npc';
// PlayerNetworkManager's default update rate; each update is a new state object, as the network path delivers it.
export const REMOTE_UPDATE_HZ = 20;
const REMOTE_ANGULAR_SPEED = 0.4;
// Only scenes that ask for postprocessing load its chunk.
const WorldPostProcessing = lazy(() => import('gaesup-world/postprocessing').then((module) => ({ default: module.WorldPostProcessing })));

export type PerfWorldSceneProps = {
  size: PerfWorldSize;
  /** Wandering NPCs with the character model: one skinned mesh and one animation mixer each. */
  npcs?: number;
  /** Mock remote players circling the spawn through the public RemotePlayer component. */
  remotes?: number;
  /** Bloom and color grading through the library's WorldPostProcessing. */
  postprocessing?: boolean;
  /** Quality tier (pixel ratio, shadow map size); examples and acceptance scenes default to `auto`. */
  quality?: WorldQuality;
  seed?: PerfWorldOptions;
  style?: CSSProperties;
  onCreated?: (state: RootState) => void;
};

/** Adds `count` wandering NPCs on rings around the spawn, inside the NPC mount range. */
function PerfNpcs({ count }: { count: number }) {
  useLayoutEffect(() => {
    const store = useNPCStore.getState();
    store.addTemplate({
      id: NPC_TEMPLATE, name: 'perf', category: 'humanoid', defaultAnimation: 'idle', clothingParts: [],
      baseParts: [{ id: `${NPC_TEMPLATE}-body`, type: 'body', url: CHARACTER_URL, position: [0, 0, 0] }],
    });
    const ids = Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      const radius = 8 + (index % 3) * 6;
      const id = `${NPC_TEMPLATE}-${index}`;
      store.addInstance({
        id, templateId: NPC_TEMPLATE, name: id, position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius], rotation: [0, 0, 0], scale: [1, 1, 1],
        brain: { mode: 'scripted' },
        behavior: { mode: 'wander', speed: 1.4, wanderRadius: 6, waitSeconds: 2, moveAnimation: 'walk', idleAnimation: 'idle' },
      });
      return id;
    });
    return () => {
      const current = useNPCStore.getState();
      for (const id of ids) current.removeInstance(id);
      current.removeTemplate(NPC_TEMPLATE);
    };
  }, [count]);
  return null;
}

function remoteState(index: number, count: number, seconds: number): PlayerState {
  const radius = 14 + (index % 4) * 4;
  const angle = seconds * REMOTE_ANGULAR_SPEED + (index / count) * Math.PI * 2;
  const yaw = -angle; // facing along the counter-clockwise tangent
  return {
    name: `remote-${index}`, color: '#6fa8dc',
    position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
    rotation: [Math.cos(yaw / 2), 0, Math.sin(yaw / 2), 0],
    velocity: [-Math.sin(angle) * radius * REMOTE_ANGULAR_SPEED, 0, Math.cos(angle) * radius * REMOTE_ANGULAR_SPEED],
  };
}

/** Remote players without a server: states arrive at the network update rate like PlayerNetworkManager delivers them. */
function PerfRemotes({ count }: { count: number }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const started = performance.now();
    const timer = setInterval(() => setSeconds((performance.now() - started) / 1000), 1000 / REMOTE_UPDATE_HZ);
    return () => clearInterval(timer);
  }, []);
  return Array.from({ length: count }, (_, index) => (
    <RemotePlayer key={index} playerId={`perf-remote-${index}`} state={remoteState(index, count, seconds)} characterUrl={CHARACTER_URL} />
  ));
}

/** The real R3F world with a seeded build; the /world route and the /accept scenarios render the same scene. */
export function PerfWorldScene({ size, npcs = 0, remotes = 0, postprocessing = false, quality = 'auto', seed, style = FULL_SCREEN, onCreated }: PerfWorldSceneProps) {
  const waterSide = seed?.waterSide;
  const windows = seed?.windows;
  useLayoutEffect(() => {
    useBuildingStore.getState().hydrate(createPerfWorld(size, {
      ...(waterSide !== undefined ? { waterSide } : {}),
      ...(windows !== undefined ? { windows } : {}),
    }));
  }, [size, waterSide, windows]);
  return (
    <GaesupWorld urls={{ characterUrl: CHARACTER_URL }} cameraOption={{ type: 'thirdPerson' }}>
      <Canvas shadows gl={(props) => createRenderer(props)} camera={{ position: [0, 10, 20], fov: 60, near: 0.1, far: 1000 }} style={style} {...(onCreated ? { onCreated } : {})}>
        <color attach="background" args={['#9cc6e0']} />
        <ambientLight intensity={1.4} />
        <Suspense fallback={null}>
          <GaesupWorldContent quality={quality}>
            <CascadedSun position={[30, 50, 20]} intensity={2.4} />
            <WorldPhysics>
              <GaesupController parts={[]} position={spawn} />
              <BuildingController />
              {npcs > 0 && <PerfNpcs count={npcs} />}
              {remotes > 0 && <PerfRemotes count={remotes} />}
            </WorldPhysics>
          </GaesupWorldContent>
        </Suspense>
        {/* Its own boundary: loading the effect chunk must not hide the world. */}
        {postprocessing && <Suspense fallback={null}><WorldPostProcessing /></Suspense>}
      </Canvas>
    </GaesupWorld>
  );
}

const count = (value: string | null, max: number) => Math.min(max, Math.max(0, Math.floor(Number(value) || 0)));

/** `/world?size=s|m|l&npcs=30&remotes=24&post=1&water=8&windows=0`; also the `scripts/frame-harness.cjs --route` target. */
export default function PerfWorld() {
  const params = new URLSearchParams(location.search);
  const water = params.get('water');
  return <PerfWorldScene size={parsePerfWorldSize(params.get('size'))} npcs={count(params.get('npcs'), 200)} remotes={count(params.get('remotes'), 64)} postprocessing={params.get('post') === '1'}
    seed={{ ...(water !== null ? { waterSide: count(water, 25) } : {}), windows: params.get('windows') !== '0' }} />;
}
