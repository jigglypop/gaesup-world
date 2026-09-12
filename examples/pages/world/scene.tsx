import { useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { LegacyGrid, useBuildingStore } from 'gaesup-world';
import { Water } from 'gaesup-world/building';

export function Lighting() {
  return (
    <>
      <color attach="background" args={['#d5ebed']} />
      <hemisphereLight args={['#f3fbff', '#85a46b', 2]} />
      <directionalLight castShadow position={[18, 30, 16]} intensity={2} color="#fff2df"
        shadow-mapSize={[2048, 2048]} shadow-camera-near={1} shadow-camera-far={90}
        shadow-camera-top={35} shadow-camera-right={35} shadow-camera-bottom={-35}
        shadow-camera-left={-35} shadow-bias={-0.0002} shadow-normalBias={0.03} />
    </>
  );
}

const WORLD_SURFACE_SIZE = 1000;
const WORLD_WATER_SHORE = { north: false, south: false, east: false, west: false };
export function Ground({ showGrid = false }: { showGrid?: boolean }) {
  const worldSurface = useBuildingStore((state) => state.worldSurface);
  const showWaterSurface = worldSurface === 'water';
  return (
    <>
      {showWaterSurface ? (
        <Water width={WORLD_SURFACE_SIZE} depth={WORLD_SURFACE_SIZE} center={[0, 0, 0]} shore={WORLD_WATER_SHORE} followCamera />
      ) : showGrid ? (
        <LegacyGrid position={[0, -0.005, 0]} infiniteGrid cellSize={2} cellThickness={1}
          cellColor="#6b8061" sectionSize={10} fadeDistance={100} userData={{ intangible: true }} />
      ) : null}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider position={[0, -1.01, 0]} args={[WORLD_SURFACE_SIZE / 2, 1, WORLD_SURFACE_SIZE / 2]} />
        <mesh receiveShadow position={[0, -.01, 0]} rotation-x={-Math.PI / 2} visible={!showWaterSurface}>
          <planeGeometry args={[WORLD_SURFACE_SIZE, WORLD_SURFACE_SIZE]} />
          <meshStandardMaterial color="#9cc77a" roughness={1} />
        </mesh>
      </RigidBody>
    </>
  );
}

type Tree = { x: number; z: number; size: number; yaw: number };
const OAK_TREES: Tree[] = [
  { x: -9, z: 4, size: .8, yaw: .4 }, { x: 8, z: -5, size: .9, yaw: 1.5 },
  { x: -8, z: 11, size: 1, yaw: 2 }, { x: 11, z: 5, size: .8, yaw: .8 },
  { x: -16, z: -8, size: .9, yaw: 2.4 }, { x: 4, z: 13, size: .85, yaw: 1 },
];
const PINE_TREES: Tree[] = [
  { x: -13, z: 1, size: 1, yaw: .2 }, { x: 14, z: -4, size: 1.1, yaw: 2.8 },
  { x: -5, z: 17, size: 1.1, yaw: 1.2 }, { x: 14, z: 12, size: .9, yaw: 2.2 },
  { x: -14, z: 13, size: 1, yaw: 0 }, { x: 15, z: 18, size: 1.1, yaw: 1.8 },
];

function scatterPlants(count: number, seed: number, scale: number): Tree[] {
  const result: Tree[] = [];
  let state = seed;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  for (let index = 0; index < count; index++) {
    const x = (random() - .5) * 46;
    const z = (random() - .5) * 46;
    if (Math.abs(x) < 5.8 && Math.abs(z) < 5.8) continue;
    result.push({ x, z, size: scale * (.7 + random() * .6), yaw: random() * Math.PI * 2 });
  }
  return result;
}
const GRASS = scatterPlants(1600, 83, .36);
const BUSHES = scatterPlants(36, 46, .7);
const FERNS = scatterPlants(90, 101, .36);
const FLOWERS = scatterPlants(85, 323, .35);

// Flyweight: cached geometry/materials are shared. Only instance transforms vary.
// The cache owns source GPU resources; instances never dispose them.
function TreeMeshBatch({ source, trees, solid }: { source: THREE.Mesh; trees: Tree[]; solid: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const transform = new THREE.Object3D();
    for (let index = 0; index < trees.length; index++) {
      const tree = trees[index]!;
      transform.position.set(tree.x, 0, tree.z);
      transform.rotation.set(0, tree.yaw, 0);
      transform.scale.setScalar(tree.size);
      transform.updateMatrix();
      mesh.setMatrixAt(index, transform.matrix.multiply(source.matrixWorld));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [source, trees]);
  return <instancedMesh ref={ref} args={[source.geometry, source.material, trees.length]}
    name={solid ? 'world-tree-batch' : 'world-plant-batch'} castShadow={solid} receiveShadow dispose={null} />;
}

function TreeBatch({ assetId, trees, solid = false }: { assetId: string; trees: Tree[]; solid?: boolean }) {
  const { scene } = useGLTF('gltf/nature/nature-library.glb');
  const meshes = useMemo(() => {
    scene.updateMatrixWorld(true);
    const result: THREE.Mesh[] = [];
    scene.getObjectByName(assetId)?.traverse((node) => { if (node instanceof THREE.Mesh) result.push(node); });
    return result;
  }, [assetId, scene]);
  return (
    <group>
      {meshes.map((mesh) => <TreeMeshBatch key={mesh.uuid} source={mesh} trees={trees} solid={solid} />)}
      {solid && trees.map((tree, index) => (
        <RigidBody key={index} type="fixed" colliders={false} position={[tree.x, 0, tree.z]}>
          <CuboidCollider args={[.3 * tree.size, 1.5 * tree.size, .3 * tree.size]} position={[0, 1.5 * tree.size, 0]} />
        </RigidBody>
      ))}
    </group>
  );
}

export function Scenery() {
  return (
    <group name="world-forest">
      <TreeBatch assetId="oak-a" trees={OAK_TREES} solid />
      <TreeBatch assetId="pine" trees={PINE_TREES} solid />
      <TreeBatch assetId="grass" trees={GRASS} />
      <TreeBatch assetId="bush" trees={BUSHES} />
      <TreeBatch assetId="fern" trees={FERNS} />
      <TreeBatch assetId="flowers" trees={FLOWERS} />
    </group>
  );
}
