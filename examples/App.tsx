import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import { Suspense } from 'react';
import { BrowserRouter, Route, Routes, NavLink } from 'react-router-dom';
import * as THREE from 'three';
import { Clicker, GaesupController, GaeSupProps, GaesupWorld, GaesupWorldContent, Editor } from '../src';
import { GaesupAdmin } from '../src/admin';
import { CameraOptionType } from '../src/core/types/camera';
import { Platforms } from './components/platforms';
import { RideableVehicles } from './components/rideable';
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

const WorldPage = ({ showEditor = false }) => (
  <>
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
      debug={EXAMPLE_CONFIG.debug}
      cameraOption={cameraOption}
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
          </GaesupWorldContent>
        </Suspense>
      </Canvas>
    </GaesupWorld>
    {showEditor && <Editor />}
  </>
);

const Navigation = () => (
  <nav className="app-navigation">
    <NavLink
      to="/"
      className={({ isActive }) => (isActive ? 'app-nav-link active' : 'app-nav-link')}
    >
      World
    </NavLink>
    <NavLink
      to="/admin"
      className={({ isActive }) => (isActive ? 'app-nav-link active' : 'app-nav-link')}
    >
      Admin
    </NavLink>
  </nav>
);

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
