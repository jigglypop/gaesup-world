import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import { Suspense } from 'react';
import * as THREE from 'three';
import { Clicker, GaesupController, GaeSupProps, GaesupWorld, MiniMap, PerfMonitor } from '../src';
import { CameraOptionType } from '../src/core/component/types';
import Info from './components/info';
import { InfoTabs } from './components/infoTabs';
import { Platforms } from './components/platforms';
import { RideableUIRenderer, RideableVehicles } from './components/rideable';
import { Teleport } from './components/teleport';
import { AIRPLANE_URL, CHARACTER_URL, S3, VEHICLE_URL } from './config/constants';

export { S3 };

const cameraOption: CameraOptionType = {
  xDistance: 15,
  yDistance: 8,
  zDistance: 15,
  offset: new THREE.Vector3(0, 0, 0),
  enableCollision: true,
  smoothing: { position: 0.25, rotation: 0.3, fov: 0.2 },
  fov: 75,
  zoom: 1,
  maxDistance: 50,
  minDistance: 1,
  distance: 10,
  bounds: { minY: 2, maxY: 50 },
};

export default function App() {
  return (
    <GaesupWorld
      urls={{
        characterUrl: CHARACTER_URL,
        vehicleUrl: VEHICLE_URL,
        airplaneUrl: AIRPLANE_URL,
      }}
      mode={{
        type: 'character',
        controller: 'keyboard',
        control: 'thirdPerson',
      }}
      debug={false}
      cameraOption={cameraOption}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 10, 20], fov: 75, near: 0.1, far: 1000 }}
        style={{ width: '100vw', height: '100vh', position: 'fixed' }}
        frameloop="demand"
      >
        <Environment background preset="sunset" backgroundBlurriness={1} />
        <directionalLight
          castShadow
          shadow-normalBias={0.06}
          position={[20, 30, 10]}
          intensity={0.5}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-top={50}
          shadow-camera-right={50}
          shadow-camera-bottom={-50}
          shadow-camera-left={-50}
        />
        <Suspense>
          <Physics debug interpolate={true}>
            <GaesupController
              controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
              rigidBodyProps={{}}
              parts={[{ url: 'gltf/ally_cloth_rabbit.glb', color: '#ffe0e0' }]}
              rotation={euler({ x: 0, y: Math.PI, z: 0 })}
            />
            <>
              <Grid
                renderOrder={-1}
                position={[0, 0.2, 0]}
                infiniteGrid
                cellSize={2}
                cellThickness={1}
                cellColor={'#1d1d1d'}
                sectionSize={5}
                sectionThickness={0}
                fadeDistance={1000}
                userData={{ intangible: true }}
              />
              <RigidBody type="fixed" userData={{ intangible: true }}>
                <mesh receiveShadow position={[0, -1, 0]}>
                  <boxGeometry args={[1000, 2, 1000]} />
                </mesh>
                <GaeSupProps type="ground">
                  <mesh receiveShadow position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[1000, 1000]} />
                    <meshStandardMaterial color="#3d3d3d" />
                  </mesh>
                </GaeSupProps>
              </RigidBody>
            </>
            <Platforms />
            <Clicker />
            <RideableVehicles />
          </Physics>
          <PerfMonitor position="bottom-right" updateInterval={500} visible={true} zIndex={10001} />
        </Suspense>
      </Canvas>
      <Info />
      <RideableUIRenderer />
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
        }}
      >
        <MiniMap scale={0.3} blockRotate={false} />
      </div>
      <Teleport />
      <InfoTabs />
    </GaesupWorld>
  );
}
