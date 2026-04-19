import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { Environment, Grid } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
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
  localPlayerColor?: string;
  proximityRange?: number;
  speechByPlayerId?: Map<string, string>;
  localSpeechText?: string | null;
}

const POSITION_SAMPLE_INTERVAL_FRAMES = 6;
const POSITION_EPSILON_SQ = 0.0001;

function LocalPositionTracker({
  playerRef,
  onChange,
}: {
  playerRef: React.RefObject<RapierRigidBody>;
  onChange: (x: number, y: number, z: number) => void;
}) {
  const lastRef = useRef({ x: 0, y: 0, z: 0 });
  const frameRef = useRef(0);

  useFrame(() => {
    frameRef.current++;
    if (frameRef.current % POSITION_SAMPLE_INTERVAL_FRAMES !== 0) return;
    const body = playerRef.current;
    if (!body) return;
    const p = body.translation();
    const last = lastRef.current;
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    const dz = p.z - last.z;
    if (dx * dx + dy * dy + dz * dz < POSITION_EPSILON_SQ) return;
    last.x = p.x;
    last.y = p.y;
    last.z = p.z;
    onChange(p.x, p.y, p.z);
  });

  return null;
}

export const MultiplayerCanvas = React.memo(function MultiplayerCanvas({ 
  players, 
  characterUrl, 
  vehicleUrl, 
  airplaneUrl, 
  playerRef, 
  config,
  localPlayerColor,
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

  const handleLocalPositionChange = useMemo(
    () => (x: number, y: number, z: number) => {
      localSpeechPos.set(x, y, z);
      setLocalPosition([x, y, z]);
    },
    [localSpeechPos],
  );

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
          shadow-camera-far={120}
          shadow-camera-top={90}
          shadow-camera-right={90}
          shadow-camera-bottom={-90}
          shadow-camera-left={-90}
        />
        
        <Suspense fallback={null}>
          <GaesupWorldContent>
            <Physics>
              <LocalPositionTracker
                playerRef={playerRef}
                onChange={handleLocalPositionChange}
              />

              {/* 로컬 플레이어 */}
              <GaesupController
                rigidBodyRef={playerRef}
                rotation={euler({ x: 0, y: Math.PI, z: 0 })}
                // `urls.characterUrl` is already set via <GaesupWorld urls={...} />.
                // Passing the same model as a "part" duplicates the render and can skew perceived scale.
                parts={[]}
                {...(localPlayerColor ? { baseColor: localPlayerColor } : {})}
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
}); 