import { useFrame, createRoot, extend, type RootState } from '@react-three/fiber';
import { Group, Scene, Mesh, Points, PlaneGeometry, MeshStandardMaterial, InstancedBufferGeometry, InstancedBufferAttribute, TextureLoader, RepeatWrapping, PCFShadowMap, type InstancedBufferGeometry as GrassGeometry, type WebGLRenderer } from 'three';

import { WeatherEffect, type createRenderer } from 'gaesup-world';
import { Grass, GrassDriver, GrassManagerProvider, Water, createGrassManager } from 'gaesup-world/building';

import type { RoomLighting, RoomQuality, RoomSettings } from './roomTypes';
import { tilePosition, type RoomTerrain } from './terrain';

type Camera = RootState['camera'];
type Cell = readonly [number, number, number?];

// Blade density steps: a paint stroke that moves the grass cell count slightly keeps every other chunk's buffers.
const DENSITY_STEP = 20;
const sameCells = (a: readonly Cell[], b: readonly Cell[]) => a.length === b.length && a.every((cell, index) => cell[0] === b[index]![0] && cell[1] === b[index]![1] && (cell[2] ?? 0) === (b[index]![2] ?? 0));

extend({ Group, Points, Mesh, PlaneGeometry, MeshStandardMaterial, InstancedBufferGeometry, InstancedBufferAttribute });

// The room owns rendering and postprocessing. R3F only advances scenery hooks.
function ManualRender() { useFrame(() => {}, 1); return null; }

export async function createRoomEnvironment(renderer: Awaited<ReturnType<typeof createRenderer>>, parent: Scene, camera: Camera, invalidate: () => void) {
  const scene = new Scene(); scene.name = '바람과 바다'; parent.add(scene);
  const manager = createGrassManager({ weather: () => null, trample: () => null });
  // A distinct root key and a borrowed renderer keep delayed R3F teardown from
  // destroying the room's context or a replacement room after a quick remount.
  const key = document.createElement('canvas');
  const methods = new Map<PropertyKey, unknown>();
  const borrowed = new Proxy(renderer, { get(target, property) {
    // The host owns canvas sizing as well as context lifetime. R3F's size
    // subscription otherwise pins inline pixel dimensions on the real canvas.
    if (property === 'forceContextLoss' || property === 'dispose' || property === 'setSize' || property === 'setPixelRatio') return () => {};
    if (property === 'renderLists') return { dispose() {} };
    const value: unknown = Reflect.get(target, property, target);
    if (typeof value !== 'function') return value;
    if (!methods.has(property)) methods.set(property, value.bind(target));
    return methods.get(property);
  } });
  const root = createRoot(key);
  let state: RootState | undefined;
  let disposed = false; let elapsed = 0; let cells: Cell[] = [];
  // Grass rebuilds blades when a chunk's cells array changes identity, so unchanged chunks keep their previous array.
  let chunkCells = new Map<string, Cell[]>();
  let terrainSize = 24; let weather: RoomSettings['weather'] = 'clear'; let lighting: RoomLighting = 'day';
  let previousTerrain: RoomTerrain | undefined; let previousQuality: RoomQuality | undefined;
  const waterNormals = new TextureLoader().load(`${import.meta.env.BASE_URL}resources/waternormals.jpeg`, () => { if (!disposed) invalidate(); });
  waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping;
  await root.configure({ gl: borrowed as unknown as WebGLRenderer, scene, camera, frameloop: 'never', shadows: { enabled: true, type: PCFShadowMap },
    size: { width: renderer.domElement.clientWidth || 1, height: renderer.domElement.clientHeight || 1, top: 0, left: 0 },
    onCreated: value => { state = value; value.set({ invalidate: () => { if (!disposed) invalidate(); } }); invalidate(); },
  });
  return {
    update(terrain: RoomTerrain, quality: RoomQuality, nextWeather: RoomSettings['weather'], nextLighting: RoomLighting = lighting) {
      if (disposed || (previousTerrain === terrain && previousQuality === quality && weather === nextWeather && lighting === nextLighting)) return;
      previousTerrain = terrain; previousQuality = quality; weather = nextWeather; lighting = nextLighting; terrainSize = terrain.size;
      cells = [];
      const chunkSize = terrain.size <= 32 ? terrain.size : 16;
      const chunks = new Map<string, { x: number; z: number; cells: Cell[] }>();
      terrain.tiles.forEach((kind, index) => {
        if (kind !== 'grass' || terrain.stairs?.[index]) return;
        const [x, , z] = tilePosition(index, terrain.size); cells.push([x, z, terrain.heights?.[index] ?? 0]);
        const cx = Math.floor((x + terrain.size / 2) / chunkSize) * chunkSize + chunkSize / 2 - terrain.size / 2;
        const cz = Math.floor((z + terrain.size / 2) / chunkSize) * chunkSize + chunkSize / 2 - terrain.size / 2; const id = `${cx}:${cz}`;
        let chunk = chunks.get(id); if (!chunk) { chunk = { x: cx, z: cz, cells: [] }; chunks.set(id, chunk); }
        chunk.cells.push([x - cx, z - cz, terrain.heights?.[index] ?? 0]);
      });
      for (const [id, chunk] of chunks) {
        const previous = chunkCells.get(id);
        if (previous && sameCells(previous, chunk.cells)) chunk.cells = previous;
      }
      chunkCells = new Map([...chunks].map(([id, chunk]) => [id, chunk.cells]));
      const budget = quality === 'economy' ? 80000 : quality === 'high' ? 240000 : 140000;
      const density = Math.max(DENSITY_STEP, Math.floor(Math.min(quality === 'economy' ? 240 : quality === 'high' ? 700 : 460, budget / Math.max(1, cells.length)) / DENSITY_STEP) * DENSITY_STEP);
      root.render(<GrassManagerProvider value={manager}>
        <ManualRender /><GrassDriver />
        <group position={[0, -0.42, 0]}>
          <Water width={terrain.size + 64} depth={terrain.size + 64} normalMap={waterNormals} toon brightness={lighting === 'evening' ? 0.42 : 1} shore={{ north: false, south: false, east: false, west: false }} />
        </group>
        {[...chunks].map(([id, chunk]) => <Grass key={id} width={chunkSize} cells={chunk.cells} ground={false} position={[chunk.x, 0.015, chunk.z]}
          density={density} maxInstances={Math.ceil(density * chunk.cells.length)} lod={{ near: 48, far: 160, strength: 3 }}
          options={{ bW: 0.14, bH: 0.24, joints: 2 }} bladeTipColor="#b9cf7e" bladeBottomColor="#6b8a3f" toon />)}
        {weather !== 'clear' && <WeatherEffect kind="snow" area={terrain.size} height={10}
          count={quality === 'economy' ? 600 : weather === 'blizzard' ? 2600 : 1000} wind={weather === 'blizzard' ? 5 : 0.35} />}
      </GrassManagerProvider>);
      invalidate();
    },
    tick(delta: number, animate: boolean, nextCamera: Camera) {
      if (!state || disposed) return;
      if (state.camera !== nextCamera) state.set({ camera: nextCamera });
      if (animate) elapsed += delta;
      state.advance(elapsed, false);
    },
    diagnostics() {
      let grassInstances = 0; scene.traverse(object => { if (object instanceof Mesh && object.visible && (object.geometry as GrassGeometry).isInstancedBufferGeometry) grassInstances += (object.geometry as GrassGeometry).instanceCount; });
      return { grassCells: cells.length, grassBatches: manager.size(), grassInstances, oceanSize: terrainSize + 64, elapsed, weather };
    },
    dispose() { if (disposed) return; disposed = true; scene.removeFromParent(); root.unmount(); waterNormals.dispose(); manager.dispose(); methods.clear(); },
  };
}
