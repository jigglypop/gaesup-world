import React, { Suspense, useEffect, useMemo, useState } from 'react';

import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics, euler, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { RemotePlayer } from './RemotePlayer';
import { 
  GaesupController, 
  GaesupWorld, 
  GaesupWorldContent, 
  Clicker, 
  GroundClicker
} from '../../../index';
import { SpeechBalloon } from '../../ui/components/SpeechBalloon';
import { PlayerState, MultiplayerConfig } from '../types';

declare global {
  interface Window {
    CHARACTER_URL?: string;
  }
}

interface MultiplayerCanvasProps {
  players: Map<string, PlayerState>;
  characterUrl: string;
  vehicleUrl: string;
  airplaneUrl: string;
  playerRef: React.RefObject<RapierRigidBody>;
  config: MultiplayerConfig;
  proximityRange?: number;
  speechByPlayerId?: Map<string, string>;
  localSpeechText?: string | null;
}

export function MultiplayerCanvas({ 
  players, 
  characterUrl, 
  vehicleUrl, 
  airplaneUrl, 
  playerRef, 
  config,
  proximityRange,
  speechByPlayerId,
  localSpeechText,
}: MultiplayerCanvasProps) {
  
  // CHARACTER_URL을 window에 설정
  useEffect(() => {
    window.CHARACTER_URL = characterUrl;
  }, [characterUrl]);

  const [localPosition, setLocalPosition] = useState<[number, number, number]>([0, 0, 0]);
  const localSpeechPos = useMemo(() => new THREE.Vector3(), []);

  // local player position을 너무 자주 setState 하지 않도록 간단한 메모이즈
  useEffect(() => {
    const id = window.setInterval(() => {
      const body = playerRef.current;
      if (!body) return;
      const p = body.translation();
      setLocalPosition((prev) => {
        const dx = p.x - prev[0];
        const dy = p.y - prev[1];
        const dz = p.z - prev[2];
        if (dx * dx + dy * dy + dz * dz < 0.0001) return prev;
        return [p.x, p.y, p.z];
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [playerRef]);

  useEffect(() => {
    localSpeechPos.set(localPosition[0], localPosition[1], localPosition[2]);
  }, [localPosition, localSpeechPos]);

  const visiblePlayers = useMemo(() => {
    const range = proximityRange;
    if (!range || range <= 0) return players;
    const [lx, ly, lz] = localPosition;
    const next = new Map<string, PlayerState>();
    players.forEach((state, id) => {
      const [x, y, z] = state.position;
      const dx = x - lx;
      const dy = y - ly;
      const dz = z - lz;
      if (dx * dx + dy * dy + dz * dz <= range * range) {
        next.set(id, state);
      }
    });
    return next;
  }, [players, proximityRange, localPosition]);

  return (
    <GaesupWorld
      urls={{
        characterUrl: characterUrl,
        vehicleUrl: vehicleUrl,
        airplaneUrl: airplaneUrl,
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 10, 20], fov: 75, near: 0.1, far: 1000 }}
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
                rigidBodyRef={playerRef}
                rotation={euler({ x: 0, y: Math.PI, z: 0 })}
                // `urls.characterUrl` is already set via <GaesupWorld urls={...} />.
                // Passing the same model as a "part" duplicates the render and can skew perceived scale.
                parts={[]}
              />

              {/* 로컬 말풍선 */}
              {localSpeechText ? (
                <SpeechBalloon
                  text={localSpeechText}
                  position={localSpeechPos}
                />
              ) : null}
              
              {/* 원격 플레이어들 */}
              {Array.from(visiblePlayers.entries()).map(([playerId, state]) => (
                <RemotePlayer
                  key={playerId}
                  playerId={playerId}
                  state={state}
                  characterUrl={characterUrl}
                  config={config}
                  {...(() => {
                    const speechText = speechByPlayerId?.get(playerId);
                    return speechText ? { speechText } : {};
                  })()}
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