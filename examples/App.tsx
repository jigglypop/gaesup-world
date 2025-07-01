import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as THREE from 'three';
import { Clicker, GaesupController, GaeSupProps, GaesupWorld, GaesupWorldContent, Editor, useGaesupStore } from '../src';
import { BuildingController, useBuildingStore } from '../src';
import { GaesupAdmin, useAuthStore } from '../src/admin';
import { CameraOptionType } from '../src/core/types/camera';
import { Platforms } from './components/platforms';
import { RideableUIRenderer, RideableVehicles } from './components/rideable';
import { BuildingExample } from './components/building';
import { AIRPLANE_URL, CHARACTER_URL, S3, VEHICLE_URL, EXAMPLE_CONFIG } from './config/constants';
import './style.css';

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

const WorldPage = ({ showEditor = false }) => {
  const isInBuildingMode = useBuildingStore((state) => state.isInEditMode());
  const mode = useGaesupStore((state) => state.mode);
  const states = useGaesupStore((state) => state.states);
  
  return (
    <>
      <GaesupWorld
        urls={{
          characterUrl: CHARACTER_URL,
          vehicleUrl: VEHICLE_URL,
          airplaneUrl: AIRPLANE_URL,
        }}
        debug={EXAMPLE_CONFIG.debug}
        cameraOption={cameraOption}
        airplane={{
          maxSpeed: 30,
          accelRatio: 2,
          linearDamping: 0.8,
          gravityScale: 0.3,
          angleDelta: { x: 0.02, y: 0.02, z: 0.02 },
          maxAngle: { x: Math.PI / 6, y: Math.PI, z: Math.PI / 6 }
        }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 10, 20], fov: 75, near: 0.1, far: 1000 }}
          style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}
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
            <GaesupWorldContent showGrid={EXAMPLE_CONFIG.showGrid} showAxes={EXAMPLE_CONFIG.showAxes}>
              <Physics debug interpolate={true}>
                {!isInBuildingMode && !states?.isRiding && (
                  <GaesupController
                    key={`controller-${mode.type}`}
                    controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
                    rigidBodyProps={{}}
                    parts={mode?.type === 'character' ? [{ url: 'gltf/ally_cloth_rabbit.glb', color: '#ffe0e0' }] : []}
                    rotation={euler({ x: 0, y: Math.PI, z: 0 })}
                  />
                )}
                <>
                  <Grid
                    renderOrder={-1}
                    position={[0, 0.01, 0]}
                    infiniteGrid
                    cellSize={2}
                    cellThickness={1}
                    cellColor={'#1d1d1d'}
                    sectionSize={5}
                    sectionThickness={0}
                    fadeDistance={1000}
                    userData={{ intangible: true }}
                  />
                  <RigidBody type="fixed">
                    <mesh receiveShadow position={[0, -1, 0]}>
                      <boxGeometry args={[1000, 2, 1000]} />
                      <meshStandardMaterial color="#3d3d3d" />
                    </mesh>
                  </RigidBody>
                </>
                <Platforms />
                <Clicker />
                <RideableVehicles />
                <BuildingController />
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>
      </GaesupWorld>
      {showEditor && <Editor />}
      <BuildingExample />
    </>
  );
};

const Navigation = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };
  
  return (
    <nav className="app-navigation">
      {isLoggedIn && user ? (
        <>
          <span className="app-nav-user">Welcome, {user.username}</span>
          <button className="app-nav-button" onClick={handleLogout}>
            Logout
          </button>
          <a href="/admin" className="app-nav-button">
            Admin Panel
          </a>
        </>
      ) : (
        <a href="/admin" className="app-nav-button">
          Login
        </a>
      )}
    </nav>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<WorldPage showEditor={false} />} />
        <Route
          path="/admin/*"
          element={
            <GaesupAdmin>
              <WorldPage showEditor={true} />
            </GaesupAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
