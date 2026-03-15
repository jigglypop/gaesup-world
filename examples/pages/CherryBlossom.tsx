import React, { Suspense } from 'react';

import { Environment, Stars, Float, SoftShadows, MeshReflectorMaterial, Sparkles } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { WorldPageProps } from './types';
import {
  Clicker, GroundClicker, GaesupController, GaesupWorld,
  GaesupWorldContent, Editor, MiniMap, BuildingController,
  useBuildingStore, useNPCStore, useGaesupStore,
} from '../../src';
import { useStateSystem } from '../../src/core/motions/hooks/useStateSystem';
import { CameraOptionType } from '../../src/core/types/camera';
import { Teleport } from '../components/teleport';
import { CHARACTER_URL, VEHICLE_URL, AIRPLANE_URL } from '../config/constants';
import '../style.css';

const CAMERA_OPT: CameraOptionType = {
  xDistance: 12, yDistance: 6, zDistance: 12,
  offset: new THREE.Vector3(0, 1, 0),
  enableCollision: true,
  smoothing: { position: 0.2, rotation: 0.25, fov: 0.2 },
  fov: 60, zoom: 1,
  enableZoom: true, zoomSpeed: 0.001, minZoom: 0.4, maxZoom: 2.5,
  enableFocus: true, focusDistance: 12, focusDuration: 1, focusLerpSpeed: 5.0,
  maxDistance: 60, distance: 10, bounds: { minY: 2, maxY: 40 },
};

const BRIDGES = [
  { z: -80 }, { z: -50 }, { z: -20 }, { z: 10 }, { z: 40 }, { z: 70 },
];

const TREES: { x: number; z: number; s: number }[] = [
  { x: -13, z: -18, s: 1.1 }, { x: 11, z: -15, s: 1.0 },
  { x: -11, z: -8, s: 0.9 },  { x: 13, z: -5, s: 1.2 },
  { x: -14, z: 0, s: 1.0 },   { x: 10, z: 3, s: 1.1 },
  { x: -12, z: 8, s: 1.3 },   { x: 12, z: 12, s: 0.9 },
  { x: -10, z: 18, s: 1.0 },  { x: 14, z: 20, s: 1.1 },
  { x: -13, z: 26, s: 1.2 },  { x: 11, z: 30, s: 1.0 },
  { x: -11, z: 35, s: 0.8 },  { x: 13, z: 38, s: 1.1 },
  { x: -12, z: 45, s: 1.0 },  { x: 12, z: 48, s: 0.9 },
  { x: -13, z: 58, s: 0.8 },  { x: 11, z: 55, s: 1.0 },
  { x: -11, z: 68, s: 0.9 },  { x: 13, z: 65, s: 0.8 },
  { x: -12, z: 78, s: 0.7 },  { x: 12, z: -35, s: 0.6 },
  { x: -14, z: -45, s: 0.7 }, { x: 10, z: -60, s: 0.5 },
];

const LANTERN_STRING_Z = [-10, 5, 20, 35, 55];
const LANTERN_COLORS = ['#ff3020', '#ff5535', '#ff7040', '#ffaa50', '#ff6040', '#ff4530', '#ff8050'];

function SakuraTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.2, 3, 8]} />
        <meshStandardMaterial color="#2a1510" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.5, 2.5, 0.3]} rotation={[0.2, 0, 0.6]}>
        <cylinderGeometry args={[0.04, 0.08, 1.8, 5]} />
        <meshStandardMaterial color="#2a1510" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-0.4, 2.8, -0.2]} rotation={[-0.1, 0, -0.5]}>
        <cylinderGeometry args={[0.03, 0.06, 1.5, 5]} />
        <meshStandardMaterial color="#2a1510" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.8, 0]}>
        <dodecahedronGeometry args={[2.2, 1]} />
        <meshStandardMaterial color="#FFB0C0" emissive="#FF4080" emissiveIntensity={0.45} transparent opacity={0.55} />
      </mesh>
      <mesh position={[1.3, 3.2, 0.6]}>
        <dodecahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial color="#FFC0D0" emissive="#FF5090" emissiveIntensity={0.35} transparent opacity={0.5} />
      </mesh>
      <mesh position={[-0.9, 3.5, -0.7]}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial color="#FFD0E0" emissive="#FF60A0" emissiveIntensity={0.3} transparent opacity={0.45} />
      </mesh>
      <mesh position={[0.3, 4.5, -0.3]}>
        <icosahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial color="#FFE0F0" emissive="#FF70B0" emissiveIntensity={0.25} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <sphereGeometry args={[1.0, 8, 6]} />
        <meshStandardMaterial color="#FF90B0" emissive="#FF3070" emissiveIntensity={0.8} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function PaperLantern({ position, color = '#ff4020' }: { position: [number, number, number]; color?: string }) {
  return (
    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
      <group position={position}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.5, 3]} />
          <meshStandardMaterial color="#444" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.2, 12, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={0.9} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.35, 8, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.08} />
        </mesh>
      </group>
    </Float>
  );
}

function LanternString({ z }: { z: number }) {
  const count = 7;
  const span = 14;
  return (
    <group position={[0, 0, z]}>
      {Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1);
        const x = -span / 2 + t * span;
        const sag = Math.sin(t * Math.PI) * 1.2;
        const y = 4.8 - sag;
        return <PaperLantern key={i} position={[x, y, 0]} color={LANTERN_COLORS[i]} />;
      })}
    </group>
  );
}

function PathLantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 2.6, 4]} />
        <meshStandardMaterial color="#111" roughness={0.8} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#FFF5E6" emissive="#FFD080" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color="#FFE0A0" emissive="#FFD080" emissiveIntensity={0.5} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function StreamBridge({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[20, 0.25, 2.8]} />
        <meshStandardMaterial color="#252018" roughness={0.85} />
      </mesh>
      {[-9, -4.5, 0, 4.5, 9].map((x) => (
        <React.Fragment key={x}>
          <mesh position={[x, 0.65, 1.2]}>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#3a3025" roughness={0.9} />
          </mesh>
          <mesh position={[x, 0.65, -1.2]}>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#3a3025" roughness={0.9} />
          </mesh>
        </React.Fragment>
      ))}
      <mesh position={[0, 1.1, 1.2]}>
        <boxGeometry args={[20, 0.06, 0.06]} />
        <meshStandardMaterial color="#3a3025" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.1, -1.2]}>
        <boxGeometry args={[20, 0.06, 0.06]} />
        <meshStandardMaterial color="#3a3025" roughness={0.9} />
      </mesh>
    </group>
  );
}

function FestivalStage() {
  return (
    <group position={[-15, 0, 10]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.7, 6]} />
        <meshStandardMaterial color="#15101a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.5, -2.7]}>
        <boxGeometry args={[8.5, 4.5, 0.15]} />
        <meshStandardMaterial color="#0d0818" emissive="#FF2060" emissiveIntensity={0.06} />
      </mesh>
      <mesh position={[-3, 4.5, -2.5]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial emissive="#FF3080" emissiveIntensity={8} />
      </mesh>
      <mesh position={[3, 4.5, -2.5]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial emissive="#4060FF" emissiveIntensity={8} />
      </mesh>
      <mesh position={[0, 4.8, -2.5]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial emissive="#FFD030" emissiveIntensity={6} />
      </mesh>
      <pointLight position={[-3, 4, 1]} color="#FF3080" intensity={1.5} distance={20} decay={2} />
      <pointLight position={[3, 4, 1]} color="#4060FF" intensity={1} distance={16} decay={2} />
    </group>
  );
}

function CourseGlow() {
  const mat = (c: string, o: number) => (
    <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent opacity={o} side={THREE.DoubleSide} />
  );
  return (
    <>
      <mesh position={[9, 0.02, 50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 80]} />
        {mat('#FF6B9D', 0.2)}
      </mesh>
      <mesh position={[-9, 0.02, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 60]} />
        {mat('#FF6B9D', 0.2)}
      </mesh>
      <mesh position={[9, 0.02, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 60]} />
        {mat('#FF6B9D', 0.12)}
      </mesh>
      <mesh position={[-7, 0.02, 50]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 80]} />
        {mat('#4ECDC4', 0.2)}
      </mesh>
    </>
  );
}

const PATH_LANTERNS: [number, number, number][] = [];
for (let z = -80; z <= 90; z += 12) {
  PATH_LANTERNS.push([-7, 0, z]);
  PATH_LANTERNS.push([7, 0, z]);
}

export function CherryBlossomPage({ showEditor = true, children }: WorldPageProps) {
  const isInBuildingMode = useBuildingStore((state) => state.isInEditMode());
  const mode = useGaesupStore((state) => state.mode);
  const { gameStates } = useStateSystem();

  React.useEffect(() => {
    const s = useBuildingStore.getState();
    if (!s.initialized) s.initializeDefaults();
    s.setShowSnow(false);
    s.setShowRain(false);
    s.setShowGrid(false);

    const n = useNPCStore.getState();
    if (!n.initialized) n.initializeDefaults();
    if (n.instances.size === 0) {
      n.addInstance({
        id: 'stage-mc', templateId: 'ally', name: 'MC',
        position: [-15, 0.7, 12], rotation: [0, Math.PI, 0],
        scale: [1, 1, 1], currentAnimation: 'idle', events: [],
      });
      n.addInstance({
        id: 'guide', templateId: 'ally', name: '\uAC00\uC774\uB4DC',
        position: [-8, 0, 70], rotation: [0, 0, 0],
        scale: [1, 1, 1], currentAnimation: 'walk', events: [],
      });
      n.setNavigation('guide', [
        [-8, 0, 70], [-8, 0, 40], [-8, 0, 10], [-8, 0, 40], [-8, 0, 70],
      ], 1.5);
    }
  }, []);

  return (
    <>
      <GaesupWorld
        urls={{ characterUrl: CHARACTER_URL, vehicleUrl: VEHICLE_URL, airplaneUrl: AIRPLANE_URL }}
        debug={false}
        cameraOption={CAMERA_OPT}
      >
        <Canvas
          shadows
          dpr={[1, 1.15]}
          camera={{ position: [12, 10, 15], fov: 60, near: 0.1, far: 400 }}
          style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}
          frameloop="always"
        >
          <color attach="background" args={['#030508']} />
          <fog attach="fog" args={['#030508', 40, 180]} />
          <Environment preset="night" />
          <Stars radius={180} depth={80} count={3000} factor={3} saturation={0.1} fade speed={0.3} />
          <SoftShadows size={25} focus={0.5} samples={10} />

          <ambientLight intensity={0.04} color="#8899bb" />
          <hemisphereLight intensity={0.06} color="#99aad0" groundColor="#060810" />
          <directionalLight
            castShadow position={[20, 30, 10]} intensity={0.15} color="#b8c9ff"
            shadow-mapSize={[1024, 1024]} shadow-camera-near={1} shadow-camera-far={260}
            shadow-camera-top={120} shadow-camera-right={60}
            shadow-camera-bottom={-120} shadow-camera-left={-60} shadow-bias={-0.0002}
          />

          <Suspense>
            <GaesupWorldContent showGrid={false} showAxes={false}>
              <Physics interpolate>
                {!isInBuildingMode && !gameStates?.isRiding && (
                  <GaesupController
                    key={`controller-${mode.type}`}
                    controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
                    rigidBodyProps={{}} parts={[]}
                    rotation={euler({ x: 0, y: Math.PI, z: 0 })}
                  />
                )}

                <RigidBody type="fixed">
                  <mesh receiveShadow position={[0, -1, 0]}>
                    <boxGeometry args={[200, 2, 300]} />
                    <meshStandardMaterial color="#080b10" />
                  </mesh>
                </RigidBody>

                <mesh receiveShadow position={[-8, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[5, 210]} />
                  <meshStandardMaterial color="#10141a" roughness={0.95} />
                </mesh>
                <mesh receiveShadow position={[8, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[5, 210]} />
                  <meshStandardMaterial color="#10141a" roughness={0.95} />
                </mesh>

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
                  <planeGeometry args={[8, 210]} />
                  <MeshReflectorMaterial
                    blur={[200, 80]}
                    resolution={512}
                    mixBlur={1}
                    mixStrength={60}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#020810"
                    metalness={0.6}
                    mirror={0.5}
                  />
                </mesh>

                {BRIDGES.map((b, i) => <StreamBridge key={i} z={b.z} />)}
                {TREES.map((t, i) => <SakuraTree key={i} position={[t.x, 0, t.z]} scale={t.s} />)}
                {PATH_LANTERNS.map((pos, i) => <PathLantern key={i} position={pos} />)}
                {LANTERN_STRING_Z.map((z) => <LanternString key={z} z={z} />)}

                <FestivalStage />
                <CourseGlow />

                <Sparkles count={300} speed={0.4} size={3} color="#FFB6C1" opacity={0.5} scale={[30, 10, 70]} position={[0, 5, 10]} />
                <Sparkles count={100} speed={0.3} size={2} color="#FFD0E0" opacity={0.4} scale={[30, 8, 40]} position={[0, 4, 55]} />
                <Sparkles count={60} speed={0.2} size={2.5} color="#FFC0D0" opacity={0.3} scale={[20, 6, 30]} position={[0, 3, -30]} />

                <Clicker />
                <GroundClicker />
                <BuildingController />
              </Physics>
            </GaesupWorldContent>
          </Suspense>

          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.4} intensity={0.75} />
          </EffectComposer>
        </Canvas>

        <MiniMap position="bottom-left" scale={5} showZoom={false} showCompass={false} />
        <Teleport />

        <div style={{
          position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, pointerEvents: 'none', textAlign: 'center',
        }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(255,182,193,0.35)', fontWeight: 300 }}>
            2026 MENSA KOREA
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#FFB6C1' }}>
            양재천 앵화야행
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,182,193,0.25)', fontWeight: 300, marginTop: 2 }}>
            4/4(토) 16:20 ~ 18:55
          </div>
        </div>

        <div style={{
          position: 'fixed', bottom: 14, right: 14, zIndex: 90, pointerEvents: 'none',
          background: 'rgba(0,0,0,0.55)', borderRadius: 10, padding: '10px 14px',
          border: '1px solid rgba(255,182,193,0.08)', backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontSize: 8, color: 'rgba(255,182,193,0.3)', letterSpacing: 2, marginBottom: 6 }}>COURSE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B9D', boxShadow: '0 0 6px #FF6B9D' }} />
            <span style={{ fontSize: 11, color: '#FF6B9D', fontWeight: 500 }}>A 2.45km / 37min</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ECDC4', boxShadow: '0 0 6px #4ECDC4' }} />
            <span style={{ fontSize: 11, color: '#4ECDC4', fontWeight: 500 }}>B 1.1km / 17min</span>
          </div>
        </div>
      </GaesupWorld>
      {showEditor && <Editor />}
      {children}
    </>
  );
}
