'use client';

import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GaesupController, GaesupWorld, MiniMap, PerfMonitor, V3 } from '../../src';
import { InnerHtml } from '../../src/gaesup/component/InnerHtml';
import { Clicker } from '../../src/gaesup/tools/clicker';
import { FocusModal } from './commons/FocusModal';
import Info from '../info';
import Passive from '../passive';
import Floor from './Floor';
import { InfoTabs } from './components/InfoTabs';
import { Platforms } from './components/Platforms';
import { RideableUIRenderer } from './components/RideableUIRenderer';
import { RideableVehicles } from './components/RideableVehicles';
import { TeleportButtons } from './components/TeleportButtons';
import { TeleportHandler } from './components/TeleportHandler';
import { CHARACTER_URL, VEHICLE_URL, AIRPLANE_URL, S3 } from './constants';
import { FocusableProvider, useFocusable } from './context/FocusContext';
export { S3 };

function AppContent() {
  const { focusedObject, clearFocus } = useFocusable();

  return (
    <>
      <TeleportHandler />
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
              onAnimate={({ control, subscribe }) => {
                subscribe({ tag: 'greet', condition: () => control?.keyZ });
              }}
              controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
              rigidBodyProps={{}}
              parts={[{ url: 'gltf/ally_cloth_rabbit.glb', color: '#ffe0e0' }]}
              rotation={euler({ x: 0, y: Math.PI, z: 0 })}
            />
            <Floor />
            <Platforms />
            <Passive />
            <Clicker
              onMarker={
                <group rotation={euler({ x: 0, y: Math.PI / 2, z: 0 })}>
                  <InnerHtml position={V3(0, 1, 0)}>
                    <FaMapMarkerAlt style={{ color: '#f4ffd4', fontSize: '5rem' }} />
                  </InnerHtml>
                </group>
              }
              runMarker={
                <InnerHtml position={V3(0, 1, 0)}>
                  <FaMapMarkerAlt style={{ color: '#ffac8e', fontSize: '5rem' }} />
                </InnerHtml>
              }
            />
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
      <TeleportButtons />
      <InfoTabs />
      <FocusModal focusedObject={focusedObject} onClose={clearFocus} />
    </>
  );
}

export default function MainComponent() {
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
      cameraOption={{
        xDistance: 15,
        yDistance: 8,
        zDistance: 15,
        enableCollision: true,
        smoothing: { position: 0.25, rotation: 0.3, fov: 0.2 },
        fov: 75,
        bounds: { minY: 2, maxY: 50, minX: -100, maxX: 100, minZ: -100, maxZ: 100 },
      }}
    >
      <FocusableProvider>
        <AppContent />
      </FocusableProvider>
    </GaesupWorld>
  );
}
