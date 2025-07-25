import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import React, { Suspense, useState } from 'react';
import * as THREE from 'three';
import { Clicker, GroundClicker, GaesupController, GaeSupProps, GaesupWorld, GaesupWorldContent, Editor, useGaesupStore, FocusableObject, MiniMap } from '../../src';
import { BuildingController, useBuildingStore } from '../../src';
import { BlueprintUI } from '../../src/blueprints';
import { CameraOptionType } from '../../src/core/types/camera';
import { Platforms } from '../components/platforms';
import { RideableUIRenderer, RideableVehicles } from '../components/rideable';
import { BuildingExample } from '../components/building';
import { AIRPLANE_URL, CHARACTER_URL, S3, VEHICLE_URL, EXAMPLE_CONFIG } from '../config/constants';
import '../style.css';
import { useStateSystem } from '../../src/core/motions/hooks/useStateSystem';
import { usePlayerPosition } from '../../src/core/motions/hooks/usePlayerPosition';
import { WorldPageProps } from './types';
import { SpeechBalloon } from '../../src/core/ui/components/SpeechBalloon';

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
  
  // Use motion bridge for real-time position updates
  const { position: playerPosition } = usePlayerPosition({ updateInterval: 16 }); // ~60fps
  
  // Toggle speech balloon with 'T' key
  React.useEffect(() => {
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
          offset={new THREE.Vector3(0, 5, 0)} // 고정 높이로 캐릭터 훨씬 위에
          visible={showBalloon}
        />
      )}
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
            shadow-camera-far={50}
            shadow-camera-top={50}
            shadow-camera-right={50}
            shadow-camera-bottom={-50}
            shadow-camera-left={-50}
          />
          <Suspense>
            <GaesupWorldContent showGrid={EXAMPLE_CONFIG.showGrid} showAxes={EXAMPLE_CONFIG.showAxes}>
              <Physics debug interpolate={true}>
                {!isInBuildingMode && !gameStates?.isRiding && (
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
                <GroundClicker />
                <RideableVehicles />
                <BuildingController />
                
                {/* Character Speech Balloon */}
                <CharacterWithSpeechBalloon />
                
                <GaeSupProps type="normal" text="Orange Box" position={[10, 1, 0]} showMinimap={true}>
                  <FocusableObject position={[0, 0, 0]} focusDistance={10}>
                    <mesh castShadow>
                      <boxGeometry args={[2, 2, 2]} />
                      <meshStandardMaterial color="orange" />
                    </mesh>
                  </FocusableObject>
                </GaeSupProps>
                
                <GaeSupProps type="normal" text="Purple Sphere" position={[-10, 2, -10]} showMinimap={true}>
                  <FocusableObject position={[0, 0, 0]} focusDistance={15}>
                    <mesh castShadow>
                      <sphereGeometry args={[1.5, 32, 32]} />
                      <meshStandardMaterial color="purple" />
                    </mesh>
                  </FocusableObject>
                </GaeSupProps>
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
        

      </GaesupWorld>
      {showEditor && <Editor />}
      {children}
    </>
  );
}; 