import React, { Suspense, useState, useEffect } from 'react';

import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { WorldPageProps } from './types';
import { Clicker, GroundClicker, GaesupController, GaesupWorld, GaesupWorldContent, Editor, useGaesupStore, FocusableObject, MiniMap } from '../../src';
import { BuildingController, useBuildingStore } from '../../src';
import { usePlayerPosition } from '../../src/core/motions/hooks/usePlayerPosition';
import { useStateSystem } from '../../src/core/motions/hooks/useStateSystem';
import { CameraOptionType } from '../../src/core/types/camera';
import { SpeechBalloon } from '../../src/core/ui/components/SpeechBalloon';
import Info from '../components/info';
import { Platforms } from '../components/platforms';
import { RideableUIRenderer, RideableVehicles } from '../components/rideable';
import { Teleport } from '../components/teleport';
import { AIRPLANE_URL, CHARACTER_URL, S3, VEHICLE_URL, EXAMPLE_CONFIG } from '../config/constants';
import '../style.css';

export { S3 };

const cameraOption: CameraOptionType = {
  xDistance: 15,
  yDistance: 20,
  zDistance: 15,
  offset: new THREE.Vector3(0, 0, 0),
  enableCollision: true,
  smoothing: { position: 0.25, rotation: 0.3, fov: 0.2 },
  fov: 75,
  zoom: 1,
  enableZoom: true,
  zoomSpeed: 0.001,
  minZoom: 0.5,
  maxZoom: 2.0,
  enableFocus: true,
  focusDistance: 15,
  focusDuration: 1,
  focusLerpSpeed: 5.0,
  maxDistance: 50,
  distance: 10,
  bounds: { minY: 2, maxY: 50 },
};

function CharacterWithSpeechBalloon() {
  const [showBalloon, setShowBalloon] = useState(true);
  const { position: playerPosition } = usePlayerPosition({ updateInterval: 16 }); // ~60fps
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        setShowBalloon(!showBalloon);
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [showBalloon]);
  
  return (
    <>
      {showBalloon && (
        <SpeechBalloon
          text="안녕"
          position={playerPosition}
          offset={new THREE.Vector3(0, 5, 0)} 
          visible={showBalloon}
        />
      )}
    </>
  );
}

function MainPageTools() {
  const [showInfo, setShowInfo] = useState(true);
  const [showTeleport, setShowTeleport] = useState(false);
  return (
    <>
      <div style={{
        position: 'fixed', top: 10, right: 10,
        zIndex: 90, pointerEvents: 'auto', display: 'flex', gap: 6,
      }}>
        <button className="app-nav-button active" onClick={() => setShowInfo((v) => !v)}>
          {showInfo ? 'Hide Info' : 'Info'}
        </button>
        <button className="app-nav-button" onClick={() => setShowTeleport((v) => !v)}>
          {showTeleport ? 'Hide Teleport' : 'Teleport'}
        </button>
      </div>
      {showInfo ? <Info /> : null}
      {showTeleport ? <Teleport /> : null}
    </>
  );
}

export const WorldPage = ({ showEditor = false, children }: WorldPageProps) => {
  const isInBuildingMode = useBuildingStore((state) => state.isInEditMode());
  const mode = useGaesupStore((state) => state.mode);
  const { gameStates } = useStateSystem();
  
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

      >
        <Canvas
          shadows
          dpr={[1, 2]}
          style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}
          frameloop="always"
        >
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
          <Suspense>
            <GaesupWorldContent showGrid={EXAMPLE_CONFIG.showGrid} showAxes={EXAMPLE_CONFIG.showAxes}>
              <Physics debug interpolate={true}>
                {!isInBuildingMode && !gameStates?.isRiding && (
                  <GaesupController
                    key={`controller-${mode.type}`}
                    controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
                    rigidBodyProps={{}}
                    parts={[]}
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
                <GroundClicker />
                <RideableVehicles />
                <BuildingController />
                <CharacterWithSpeechBalloon />
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>
        <MiniMap 
          position="bottom-left"
          scale={5}
          showZoom={false}
          showCompass={false}
        />
        <RideableUIRenderer />
        <MainPageTools />
      </GaesupWorld>
      {showEditor && <Editor />}
      {children}
    </>
  );
}; 