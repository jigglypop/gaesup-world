import React, { Suspense, useEffect, useState } from 'react';

import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { WorldPageProps } from './types';
import {
  BuildingController, Clicker, Editor, GaesupController, GaesupWorld,
  GaesupWorldContent, GroundClicker, MiniMap, SakuraBatch, Snow,
  setDefaultToonMode,
  type SakuraTreeEntry, useBuildingStore, useGaesupStore,
} from '../../src';
import { usePlayerPosition } from '../../src/core/motions/hooks/usePlayerPosition';
import { useStateSystem } from '../../src/core/motions/hooks/useStateSystem';
import { CameraOptionType } from '../../src/core/camera/core/types';
import { SpeechBalloon } from '../../src/core/ui/components/SpeechBalloon';
import Info from '../components/info';
import { Teleport } from '../components/teleport';
import { AIRPLANE_URL, CHARACTER_URL, EXAMPLE_CONFIG, S3, VEHICLE_URL } from '../config/constants';
import '../style.css';

export { S3 };

const CAMERA_OPTION: CameraOptionType = {
  xDistance: -7, yDistance: 10, zDistance: -13,
  offset: new THREE.Vector3(0, 0, 0),
  enableCollision: true,
  smoothing: { position: 0.25, rotation: 0.3, fov: 0.2 },
  fov: 75, zoom: 1,
  enableZoom: true, zoomSpeed: 0.001, minZoom: 0.5, maxZoom: 2.0,
  enableFocus: true, focusDistance: 15, focusDuration: 1, focusLerpSpeed: 5.0,
  maxDistance: 50, distance: 10, bounds: { minY: 2, maxY: 50 },
};

const TOON_STORAGE_KEY = 'gaesup:toonMode';
const _initialToon = (() => {
  if (typeof window === 'undefined') return true;
  const v = window.localStorage.getItem(TOON_STORAGE_KEY);
  return v === null ? true : v === '1';
})();
setDefaultToonMode(_initialToon);

const SAKURA_TREES: SakuraTreeEntry[] = [
  { position: [-22, 0, -10], size: 4.4, blossomColor: '#ffb6c1' },
  { position: [22, 0, -8], size: 4.0, blossomColor: '#ffc4d6' },
  { position: [-26, 0, 6], size: 4.8, blossomColor: '#ffb0c8' },
  { position: [26, 0, 10], size: 4.0, blossomColor: '#ffd0e0' },
  { position: [-18, 0, 22], size: 3.6, blossomColor: '#ffc8db' },
  { position: [18, 0, 24], size: 4.4, blossomColor: '#ffb6c1' },
  { position: [-30, 0, -22], size: 3.2, blossomColor: '#ffc4d6' },
  { position: [30, 0, -20], size: 3.6, blossomColor: '#ffb0c8' },
  { position: [-12, 0, -28], size: 3.2, blossomColor: '#ffd0e0' },
  { position: [14, 0, -26], size: 4.0, blossomColor: '#ffb6c1' },
];

function Lighting() {
  return (
    <>
      <Environment background preset="sunset" backgroundBlurriness={1} />
      <directionalLight
        castShadow
        shadow-normalBias={0.06}
        position={[20, 30, 10]}
        intensity={0.5}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-top={90}
        shadow-camera-right={90}
        shadow-camera-bottom={-90}
        shadow-camera-left={-90}
      />
    </>
  );
}

function Ground() {
  return (
    <>
      <Grid
        renderOrder={-1}
        position={[0, -0.005, 0]}
        infiniteGrid
        cellSize={2}
        cellThickness={1}
        cellColor="#1d1d1d"
        sectionSize={5}
        sectionThickness={0}
        fadeDistance={400}
        fadeStrength={3}
        userData={{ intangible: true }}
      />
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -1.01, 0]}>
          <boxGeometry args={[1000, 2, 1000]} />
          <meshStandardMaterial color="#3d3d3d" polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
      </RigidBody>
    </>
  );
}

function Scenery() {
  return (
    <>
      <SakuraBatch trees={SAKURA_TREES} />
      <Snow gpu />
    </>
  );
}

function Player() {
  const isInBuildingMode = useBuildingStore((s) => s.isInEditMode());
  const mode = useGaesupStore((s) => s.mode);
  const { gameStates } = useStateSystem();
  if (isInBuildingMode || gameStates?.isRiding) return null;
  return (
    <GaesupController
      key={`controller-${mode.type}`}
      controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
      rigidBodyProps={{}}
      parts={[]}
      rotation={euler({ x: 0, y: Math.PI, z: 0 })}
    />
  );
}

function CharacterSpeechBalloon() {
  const [visible, setVisible] = useState(true);
  const { position } = usePlayerPosition({ updateInterval: 16 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') setVisible((v) => !v);
    };
    window.addEventListener('keypress', onKey);
    return () => window.removeEventListener('keypress', onKey);
  }, []);

  if (!visible) return null;
  return (
    <SpeechBalloon
      text="안녕"
      position={position}
      offset={new THREE.Vector3(0, 5, 0)}
      visible
    />
  );
}

function HUD() {
  const [showInfo, setShowInfo] = useState(true);
  const [showTeleport, setShowTeleport] = useState(false);
  const [toon, setToon] = useState(_initialToon);

  const onToggleToon = () => {
    const next = !toon;
    setToon(next);
    setDefaultToonMode(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOON_STORAGE_KEY, next ? '1' : '0');
      window.location.reload();
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed', top: 10, right: 10,
        zIndex: 90, pointerEvents: 'auto', display: 'flex', gap: 6,
      }}>
        <button
          className={`app-nav-button${toon ? ' active' : ''}`}
          onClick={onToggleToon}
          title="Toggle toon shading (reloads scene)"
        >
          {toon ? 'Toon: ON' : 'Toon: OFF'}
        </button>
        <button className={`app-nav-button${showInfo ? ' active' : ''}`} onClick={() => setShowInfo((v) => !v)}>
          {showInfo ? 'Hide Info' : 'Info'}
        </button>
        <button className={`app-nav-button${showTeleport ? ' active' : ''}`} onClick={() => setShowTeleport((v) => !v)}>
          {showTeleport ? 'Hide Teleport' : 'Teleport'}
        </button>
      </div>
      {showInfo && <Info />}
      {showTeleport && <Teleport />}
    </>
  );
}

export const WorldPage = ({ showEditor = false, children }: WorldPageProps) => {
  return (
    <>
      <GaesupWorld
        urls={{ characterUrl: CHARACTER_URL, vehicleUrl: VEHICLE_URL, airplaneUrl: AIRPLANE_URL }}
        debug={EXAMPLE_CONFIG.debug}
        cameraOption={CAMERA_OPTION}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}
          frameloop="always"
        >
          <Lighting />
          <Suspense>
            <GaesupWorldContent showGrid={EXAMPLE_CONFIG.showGrid} showAxes={EXAMPLE_CONFIG.showAxes}>
              <Physics debug interpolate>
                <Player />
                <Ground />
                <Scenery />
                <Clicker />
                <GroundClicker />
                <BuildingController />
                <CharacterSpeechBalloon />
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>

        <MiniMap position="bottom-left" scale={5} showZoom={false} showCompass={false} />
        <HUD />
      </GaesupWorld>
      {showEditor && <Editor />}
      {children}
    </>
  );
};
