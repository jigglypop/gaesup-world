import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Grid } from '@react-three/drei';
import { Physics, euler, RigidBody } from '@react-three/rapier';
import { 
  GaesupController, 
  GaesupWorld, 
  GaesupWorldContent, 
  Clicker, 
  GroundClicker
} from '../../../index';
import { RemotePlayer } from './RemotePlayer';
import { PlayerState, MultiplayerConfig } from '../types';

interface MultiplayerCanvasProps {
  players: Map<string, PlayerState>;
  characterUrl: string;
  vehicleUrl: string;
  airplaneUrl: string;
  playerRef: React.RefObject<any>;
  config: MultiplayerConfig;
}

export function MultiplayerCanvas({ 
  players, 
  characterUrl, 
  vehicleUrl, 
  airplaneUrl, 
  playerRef, 
  config 
}: MultiplayerCanvasProps) {
  
  // CHARACTER_URL을 window에 설정
  useEffect(() => {
    (window as any).CHARACTER_URL = characterUrl;
  }, [characterUrl]);

  return (
    <GaesupWorld
      urls={{
        character: characterUrl,
        vehicle: vehicleUrl,
        airplane: airplaneUrl,
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 10, 20], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
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
        
        <Suspense fallback={null}>
          <GaesupWorldContent>
            <Physics>
              {/* 로컬 플레이어 */}
              <GaesupController
                innerRef={playerRef}
                rotation={euler({ x: 0, y: Math.PI, z: 0 })}
                parts={[{ url: characterUrl }]}
              />
              
              {/* 원격 플레이어들 */}
              {Array.from(players.entries()).map(([playerId, state]) => (
                <RemotePlayer 
                  key={playerId} 
                  playerId={playerId} 
                  state={state} 
                  characterUrl={characterUrl}
                  config={config}
                />
              ))}
              
              {/* 그리드 */}
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
              />
              
              {/* 바닥 */}
              <RigidBody type="fixed">
                <mesh receiveShadow position={[0, -1, 0]}>
                  <boxGeometry args={[1000, 2, 1000]} />
                  <meshStandardMaterial color="#3d3d3d" />
                </mesh>
              </RigidBody>
              
              <Clicker />
              <GroundClicker />
            </Physics>
          </GaesupWorldContent>
        </Suspense>
      </Canvas>
    </GaesupWorld>
  );
} 