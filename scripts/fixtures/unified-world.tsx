import React, { useEffect, useState } from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { createRoot } from 'react-dom/client';
import { Matrix4, Raycaster, Vector3 } from 'three';
import { BuildingSystem } from '/src/core/building/components/BuildingSystem/index.tsx';
import { BuildingController } from '/src/core/building/components/BuildingController/index.tsx';
import { useBuildingStore } from '/src/core/building/stores/buildingStore.ts';
import { createRenderer, createLegacyRenderer } from '/src/core/rendering/webgpu.ts';
import { WorldPostProcessing } from '/src/core/rendering/postprocess/WorldPostProcessing.tsx';

useBuildingStore.getState().initializeDefaults();
const initial = useBuildingStore.getState();
const wallTemplate = [...initial.wallGroups.values()][0];
const walls = wallTemplate ? new Map([[wallTemplate.id, { ...wallTemplate, frontMeshId: 'brick-wall', backMeshId: 'concrete-wall', sideMeshId: 'concrete-wall', walls: Array.from({ length: 12 }, (_, i) => ({ id: `wall-${i}`, wallGroupId: wallTemplate.id, position: { x: (i - 6) * 4, y: 0, z: -12 }, rotation: { x: 0, y: 0, z: 0 } })) }]]) : new Map();
const blocks = Array.from({ length: 100 }, (_, i) => ({ id: `block-${i}`, name: `Block ${i}`, materialId: i % 2 ? 'brick-wall' : 'concrete-wall', position: { x: (i % 10 - 5) * 4, y: 0, z: (Math.floor(i / 10) - 5) * 4 }, size: { x: 1, y: 1 + i % 3, z: 1 } }));
const tiles = new Map([['probe-tiles', { id: 'probe-tiles', name: 'Tiles', floorMeshId: 'concrete-wall', tiles: Array.from({ length: 12 }, (_, i) => ({ id: `tile-${i}`, tileGroupId: 'probe-tiles', shape: 'box', size: 1, position: { x: (i - 6) * 4, y: 0, z: 24 } })) }]]);
useBuildingStore.setState({ blocks, wallGroups: walls, tileGroups: tiles, objects: [], showGrid: false, editMode: 'none', showSnow: false, weatherEffect: 'none' });

function Probe() {
  const state = useThree();
  useEffect(() => {
    window.worldState = state;
    let readbacks = 0;
    const originalRead = state.gl.getArrayBufferAsync;
    if (state.gl.getArrayBufferAsync) {
      const read = state.gl.getArrayBufferAsync.bind(state.gl);
      state.gl.getArrayBufferAsync = (...args) => { readbacks++; return read(...args); };
    }
    window.worldProbe = async (read = false) => {
      const sources = [], gpu = [];
      state.scene.traverse(object => {
        if (object.isInstancedMesh && object.name.startsWith('building-batch:')) sources.push(object);
        if (object.name.startsWith('gpu-resident:')) gpu.push(object);
      });
      const counts = read ? await Promise.all(gpu.map(async mesh => new Uint32Array(await state.gl.getArrayBufferAsync(mesh.geometry.indirect))[1])) : [];
      return { native: state.gl.backend?.isWebGPUBackend === true, sources: sources.length, gpu: gpu.length, counts, readbacks,
        textures: state.gl.info.memory.textures, storage: state.gl.info.memory.storageAttributes, indirect: state.gl.info.memory.indirectStorageAttributes, computeCalls: state.gl.info.compute?.calls, frames: window.worldFrames ?? 0, shadows: window.worldShadows ?? 0,
        projection: state.camera.projectionMatrix.toArray(), view: state.camera.view };
    };
    window.pickWorld = () => {
      let source;
      state.scene.traverse(object => { if (!source && object.isInstancedMesh && object.name.startsWith('building-batch:block:')) source = object; });
      const local = new Matrix4(); source.getMatrixAt(0, local);
      const target = new Vector3().setFromMatrixPosition(local).applyMatrix4(source.matrixWorld);
      const origin = target.clone().add(new Vector3(0, 30, 0));
      return new Raycaster(origin, target.clone().sub(origin).normalize()).intersectObject(source, false).map(hit => hit.instanceId);
    };
    window.moveWorld = () => { state.camera.position.set(0, 18, -50); state.camera.lookAt(0, 0, -80); };
    window.restoreWorld = () => { state.camera.position.set(0, 25, 48); state.camera.lookAt(0, 0, 0); };
    window.editWorld = () => useBuildingStore.setState({ blocks: [...blocks.slice(1).map(block => ({ ...block, position: { ...block.position, x: block.position.x + 1 } })), { ...blocks[0], id: 'added-block', position: { x: 0, y: 4, z: 0 } }] });
    window.editMaterial = transparent => {
      const meshes = new Map(useBuildingStore.getState().meshes);
      meshes.set('brick-wall', { ...meshes.get('brick-wall'), color: '#486ed1', transparent, opacity: transparent ? 0.65 : 1 });
      useBuildingStore.setState({ meshes });
    };
    state.camera.lookAt(0, 0, 0);
    return () => { if (originalRead) state.gl.getArrayBufferAsync = originalRead; };
  }, [state.gl, state.scene, state.camera]);
  useFrame(() => {
    window.worldFrames = (window.worldFrames ?? 0) + 1;
    state.scene.traverse(object => {
      if (object.isInstancedMesh && object.name.startsWith('building-batch:') && !object.userData.shadowProbe) {
        object.userData.shadowProbe = true;
        object.onBeforeShadow = () => { window.worldShadows = (window.worldShadows ?? 0) + 1; };
      }
    });
  });
  return null;
}
function App() {
  const [quality, setQuality] = useState('balanced');
  const [enabled, setEnabled] = useState(true);
  const [resident, setResident] = useState(true);
  const [historyVersion, setHistoryVersion] = useState(0);
  const legacy = new URLSearchParams(location.search).has('legacy');
  useEffect(() => { Object.assign(window, { setWorldQuality: setQuality, setWorldEnabled: setEnabled, setResident, resetHistory: () => setHistoryVersion(value => value + 1) }); }, []);
  return <Canvas shadows gl={legacy ? createLegacyRenderer : createRenderer} camera={{ position: [0, 25, 48], fov: 55, near: 0.1, far: 300 }} dpr={1}>
    <color attach="background" args={['#859aaa']} />
    <ambientLight intensity={1.8} />
    <directionalLight position={[15, 35, 20]} intensity={3} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-50} shadow-camera-right={50} shadow-camera-top={50} shadow-camera-bottom={-50} shadow-camera-far={150} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[180,180]} /><meshStandardMaterial color="#a2b59d" /></mesh>
    <Physics>{enabled && (resident ? <BuildingController showGrid={false} /> : <BuildingSystem showGrid={false} />)}</Physics>
    <Probe />
    {!legacy && <WorldPostProcessing quality={quality} historyVersion={historyVersion} />}
  </Canvas>;
}
const root = createRoot(document.getElementById('root'));
window.unmountWorld = () => root.unmount();
root.render(<App />);
