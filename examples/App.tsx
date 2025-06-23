import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import { Suspense } from 'react';
import * as THREE from 'three';
import { Clicker, GaesupController, GaeSupProps, GaesupWorld, MiniMap, PerfMonitor, CameraUI, AnimationUI, MotionUI } from '../src';
import { CameraOptionType } from '../src/core/types/camera';
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
      <CameraUI
        debugPanelProps={{
          position: 'top-right',
          visible: false,
          theme: 'glass',
          precision: 3,
          fields: [
            { key: 'mode', label: 'Camera Mode', enabled: true, format: 'text' },
            { key: 'position', label: 'Player Position', enabled: true, format: 'vector3', precision: 2 },
            { key: 'velocity', label: 'Velocity', enabled: true, format: 'vector3', precision: 3 },
            { key: 'distance', label: 'Camera Distance', enabled: true, format: 'vector3', precision: 1 },
            { key: 'fov', label: 'Field of View', enabled: true, format: 'angle', precision: 0 },
            { key: 'rotation', label: 'Rotation', enabled: false, format: 'vector3', precision: 2 },
            { key: 'zoom', label: 'Zoom Level', enabled: false, format: 'number', precision: 2 },
            { key: 'activeController', label: 'Active Controller', enabled: true, format: 'text' },
          ]
        }}
        controllerProps={{
          position: 'top-left',
          visible: true
        }}
        presetsProps={{
          position: 'bottom-right', 
          visible: true
        }}
      />
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
      <AnimationUI
        showController={true}
        showPlayer={true}
        showDebugPanel={true}
        controllerProps={{
          position: 'top-right',
          showLabels: true,
          compact: false
        }}
        playerProps={{
          position: 'bottom-left',
          showControls: true,
          compact: false
        }}
        debugPanelProps={{
          position: 'top-left',
          compact: false,
          precision: 2,
          fields: [
            { key: 'currentAnimation', label: '현재 애니메이션', format: 'text', enabled: true },
            { key: 'animationType', label: '애니메이션 타입', format: 'text', enabled: true },
            { key: 'isPlaying', label: '재생 상태', format: 'text', enabled: true },
            { key: 'weight', label: '가중치', format: 'number', enabled: true },
            { key: 'speed', label: '속도', format: 'number', enabled: true },
            { key: 'activeActions', label: '활성 액션', format: 'number', enabled: true }
          ]
        }}
      />
      <MotionUI
        showController={true}
        showDebugPanel={true}
        controllerProps={{
          position: 'bottom-left',
          showLabels: true,
          compact: false
        }}
        debugPanelProps={{
          position: 'bottom-right',
          updateInterval: 100,
          precision: 2,
          compact: false,
          customFields: [
            { key: 'frameRate', label: 'Frame Rate', type: 'number' },
            { key: 'physicsDelta', label: 'Physics Delta', type: 'number' }
          ]
        }}
      />
    </GaesupWorld>
  );
}
