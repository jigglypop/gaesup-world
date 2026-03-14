import React, { Suspense, useEffect, useRef } from 'react';

import { Environment, Sparkles } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { WorldPageProps } from './types';
import {
  Clicker, GroundClicker, GaesupController, GaesupWorld,
  GaesupWorldContent, useNPCStore, useGaesupStore,
} from '../../src';
import Fire from '../../src/core/building/components/mesh/fire/index';
import { NPCSystem } from '../../src/core/npc/components/NPCSystem';
import { useStateSystem } from '../../src/core/motions/hooks/useStateSystem';
import { CameraOptionType } from '../../src/core/types/camera';
import { CHARACTER_URL, VEHICLE_URL, AIRPLANE_URL } from '../config/constants';
import '../style.css';

const CAMERA_OPT: CameraOptionType = {
  xDistance: 50, yDistance: 35, zDistance: 50,
  offset: new THREE.Vector3(0, 2, 0),
  enableCollision: false,
  smoothing: { position: 0.1, rotation: 0.15, fov: 0.2 },
  fov: 35, zoom: 1,
  enableZoom: true, zoomSpeed: 0.001, minZoom: 0.3, maxZoom: 2.5,
  enableFocus: false, focusDistance: 25, focusDuration: 1, focusLerpSpeed: 5.0,
  maxDistance: 200, distance: 80, bounds: { minY: 8, maxY: 100 },
};

const W = 120;
const D = 90;
const WH = 14;

const MARBLE = '#f0ece4';
const MARBLE_DARK = '#d8d0c4';
const WALL_CREAM = '#faf5ec';
const WALL_WARM = '#f2ebe0';
const GOLD = '#d4a84a';
const GOLD_DARK = '#b8902a';
const VELVET = '#8b1a2b';
const VELVET_DARK = '#6a1020';
const WOOD_RICH = '#5c3a1e';
const WOOD_MAHOGANY = '#6b2a1a';
const CARPET_RED = '#9c2030';
const IVORY = '#fffff0';

function Floor() {
  return (
    <RigidBody type="fixed">
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={MARBLE} roughness={0.4} metalness={0.05} />
      </mesh>
    </RigidBody>
  );
}

function Walls() {
  const hw = W / 2, hd = D / 2, hy = WH / 2;
  return (
    <group>
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, hy, -hd]}>
          <boxGeometry args={[W, WH, 0.5]} />
          <meshStandardMaterial color={WALL_CREAM} roughness={0.85} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh receiveShadow position={[-hw, hy, 0]}>
          <boxGeometry args={[0.5, WH, D]} />
          <meshStandardMaterial color={WALL_WARM} roughness={0.85} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh receiveShadow position={[hw, hy, 0]}>
          <boxGeometry args={[0.5, WH, D]} />
          <meshStandardMaterial color={WALL_WARM} roughness={0.85} />
        </mesh>
      </RigidBody>
      {/* wainscoting */}
      <mesh position={[0, 1.5, -hd + 0.3]}>
        <boxGeometry args={[W - 1, 3, 0.15]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[-hw + 0.4, 1.5, 0]}>
        <boxGeometry args={[0.15, 3, D - 1]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[hw - 0.4, 1.5, 0]}>
        <boxGeometry args={[0.15, 3, D - 1]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.6} />
      </mesh>
      {/* crown molding */}
      <mesh position={[0, WH - 0.2, -hd + 0.3]}>
        <boxGeometry args={[W - 0.5, 0.4, 0.3]} />
        <meshStandardMaterial color={GOLD} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[-hw + 0.4, WH - 0.2, 0]}>
        <boxGeometry args={[0.3, 0.4, D - 0.5]} />
        <meshStandardMaterial color={GOLD} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[hw - 0.4, WH - 0.2, 0]}>
        <boxGeometry args={[0.3, 0.4, D - 0.5]} />
        <meshStandardMaterial color={GOLD} roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Column({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.6, 12]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, WH / 2, 0]}>
        <cylinderGeometry args={[0.6, 0.6, WH - 1.2, 12]} />
        <meshStandardMaterial color={MARBLE} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, WH - 0.6, 0]}>
        <cylinderGeometry args={[1.0, 0.8, 0.6, 12]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Columns() {
  const positions: [number, number, number][] = [
    [-45, 0, -30], [-45, 0, 0], [-45, 0, 30],
    [45, 0, -30], [45, 0, 0], [45, 0, 30],
    [-20, 0, -42], [20, 0, -42],
  ];
  return <>{positions.map((p, i) => <Column key={i} position={p} />)}</>;
}

function Chandelier({ position }: { position: [number, number, number] }) {
  const arms = 8;
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2, 6]} />
        <meshStandardMaterial color={GOLD_DARK} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh>
        <torusGeometry args={[3, 0.08, 8, 24]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <torusGeometry args={[1.8, 0.06, 8, 20]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.7} />
      </mesh>
      {Array.from({ length: arms }, (_, i) => {
        const a = (i / arms) * Math.PI * 2;
        const x = Math.cos(a) * 3;
        const z = Math.sin(a) * 3;
        return (
          <group key={i}>
            <mesh position={[x * 0.5, -0.3, z * 0.5]} rotation={[0, 0, a + Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 3, 4]} />
              <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[x, -0.5, z]}>
              <sphereGeometry args={[0.2, 6, 4]} />
              <meshStandardMaterial color="#ffe8a0" emissive="#ffe8a0" emissiveIntensity={3} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color="#e8f0ff" emissive="#ffe8b0" emissiveIntensity={1.5} transparent opacity={0.7} />
      </mesh>
      <pointLight position={[0, -1, 0]} color="#ffe8c0" intensity={12} distance={35} decay={2} />
    </group>
  );
}

function Fireplace() {
  return (
    <group position={[0, 0, -43]}>
      <mesh castShadow receiveShadow position={[0, 0.15, 0.5]}>
        <boxGeometry args={[8, 0.3, 3]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 3.5, -0.3]}>
        <boxGeometry args={[6, 6.5, 0.4]} />
        <meshStandardMaterial color="#1a1210" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[-3.5, 3, 0.3]}>
        <boxGeometry args={[1.0, 6, 1.5]} />
        <meshStandardMaterial color={MARBLE} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[3.5, 3, 0.3]}>
        <boxGeometry args={[1.0, 6, 1.5]} />
        <meshStandardMaterial color={MARBLE} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 6.3, 0.3]}>
        <boxGeometry args={[9, 0.5, 2]} />
        <meshStandardMaterial color={MARBLE} roughness={0.35} />
      </mesh>
      <mesh position={[0, 5.8, 0.9]}>
        <boxGeometry args={[7, 0.15, 0.1]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.6} />
      </mesh>
      <group position={[0, 0.35, 0.2]}>
        <Fire intensity={2.0} width={3.0} height={3.0} />
      </group>
      <pointLight position={[0, 2, 1.5]} color="#ff6820" intensity={6} distance={20} decay={2} />
      <mesh castShadow position={[-3, 6.8, 0.3]}>
        <cylinderGeometry args={[0.3, 0.25, 1.2, 8]} />
        <meshStandardMaterial color={GOLD_DARK} roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh castShadow position={[3, 6.8, 0.3]}>
        <cylinderGeometry args={[0.3, 0.25, 1.2, 8]} />
        <meshStandardMaterial color={GOLD_DARK} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* mirror above */}
      <group position={[0, 9.5, 0.3]}>
        <mesh>
          <boxGeometry args={[4.5, 3.5, 0.15]} />
          <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[4, 3]} />
          <meshStandardMaterial color="#b8c8e0" roughness={0.05} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function GrandStaircase() {
  const steps = 14;
  const stepW = 12;
  const stepH = 0.35;
  const stepD = 0.8;
  return (
    <group position={[42, 0, -15]}>
      {Array.from({ length: steps }, (_, i) => (
        <mesh key={i} castShadow receiveShadow position={[0, i * stepH + stepH / 2, -i * stepD]}>
          <boxGeometry args={[stepW, stepH, stepD]} />
          <meshStandardMaterial color={MARBLE} roughness={0.35} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          {Array.from({ length: 7 }, (_, i) => (
            <mesh key={i} castShadow position={[side * (stepW / 2 + 0.15), i * stepH * 2 + 1.2, -i * stepD * 2]}>
              <cylinderGeometry args={[0.08, 0.08, 1.8, 6]} />
              <meshStandardMaterial color={GOLD_DARK} roughness={0.3} metalness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh castShadow receiveShadow position={[0, steps * stepH + 0.1, -steps * stepD - 1.5]}>
        <boxGeometry args={[stepW + 2, 0.2, 4]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.35} />
      </mesh>
    </group>
  );
}

function GrandPiano() {
  return (
    <group position={[-42, 0, -28]} rotation={[0, Math.PI / 6, 0]}>
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 0.3, 6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.15} metalness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 2.0, -1]}>
        <boxGeometry args={[4, 0.08, 4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.15} metalness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 2.6, -2.9]}>
        <boxGeometry args={[4, 1.2, 0.08]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.15} metalness={0.3} />
      </mesh>
      {[[-1.5, 2], [1.5, 2], [0, -2.5]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.7, z]}>
          <cylinderGeometry args={[0.12, 0.15, 1.4, 8]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.15} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.68, 2.6]}>
        <boxGeometry args={[3.2, 0.06, 0.5]} />
        <meshStandardMaterial color={IVORY} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.8, 4.5]}>
        <boxGeometry args={[2.5, 0.12, 0.8]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.88, 4.5]}>
        <boxGeometry args={[2.3, 0.06, 0.6]} />
        <meshStandardMaterial color={VELVET} roughness={0.95} />
      </mesh>
    </group>
  );
}

function DiningTable() {
  return (
    <group position={[-10, 0, 15]}>
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[16, 0.2, 5]} />
        <meshStandardMaterial color={WOOD_MAHOGANY} roughness={0.5} />
      </mesh>
      {[[-7, -2], [7, -2], [-7, 2], [7, 2]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.7, z]}>
          <cylinderGeometry args={[0.18, 0.22, 1.4, 8]} />
          <meshStandardMaterial color={WOOD_RICH} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[16.5, 0.02, 1.5]} />
        <meshStandardMaterial color={GOLD} roughness={0.7} />
      </mesh>
      {[-4, 4].map((x) => (
        <group key={x} position={[x, 1.62, 0]}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.08, 0.15, 1.0, 8]} />
            <meshStandardMaterial color={GOLD_DARK} roughness={0.3} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <sphereGeometry args={[0.06, 6, 4]} />
            <meshStandardMaterial emissive="#ffe080" emissiveIntensity={5} color="#ffe080" />
          </mesh>
        </group>
      ))}
      {Array.from({ length: 7 }, (_, i) => {
        const x = -6 + i * 2;
        return (
          <React.Fragment key={i}>
            <DiningChair position={[x, 0, -3.5]} rotation={0} />
            <DiningChair position={[x, 0, 3.5]} rotation={Math.PI} />
          </React.Fragment>
        );
      })}
    </group>
  );
}

function DiningChair({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[1.0, 0.08, 1.0]} />
        <meshStandardMaterial color={WOOD_MAHOGANY} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.85, 0.04, 0.85]} />
        <meshStandardMaterial color={VELVET} roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 1.6, -0.45]}>
        <boxGeometry args={[1.0, 1.4, 0.1]} />
        <meshStandardMaterial color={WOOD_MAHOGANY} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.6, -0.38]}>
        <boxGeometry args={[0.85, 1.1, 0.04]} />
        <meshStandardMaterial color={VELVET_DARK} roughness={0.95} />
      </mesh>
      {[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].map(([lx, lz], i) => (
        <mesh key={i} castShadow position={[lx, 0.4, lz]}>
          <cylinderGeometry args={[0.05, 0.06, 0.8, 6]} />
          <meshStandardMaterial color={WOOD_RICH} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function SofaSet() {
  return (
    <group position={[-30, 0, -15]}>
      <mesh castShadow receiveShadow position={[0, 0.9, -5]}>
        <boxGeometry args={[10, 1.0, 3]} />
        <meshStandardMaterial color={VELVET} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 1.8, -6.2]}>
        <boxGeometry args={[10, 1.5, 0.5]} />
        <meshStandardMaterial color={VELVET_DARK} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[-4.8, 1.5, -5]}>
        <boxGeometry args={[0.5, 1, 3]} />
        <meshStandardMaterial color={VELVET_DARK} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[4.8, 1.5, -5]}>
        <boxGeometry args={[0.5, 1, 3]} />
        <meshStandardMaterial color={VELVET_DARK} roughness={0.92} />
      </mesh>
      {[-2.5, 0, 2.5].map((x) => (
        <mesh key={x} castShadow position={[x, 1.5, -4.8]}>
          <boxGeometry args={[2.2, 0.4, 2.2]} />
          <meshStandardMaterial color={VELVET} roughness={0.95} />
        </mesh>
      ))}
      <mesh castShadow receiveShadow position={[0, 0.8, -1.5]}>
        <boxGeometry args={[5, 0.12, 3]} />
        <meshStandardMaterial color={MARBLE} roughness={0.3} />
      </mesh>
      {[[-2, -2.7], [2, -2.7], [-2, -0.3], [2, -0.3]].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 0.38, z]}>
          <cylinderGeometry args={[0.1, 0.12, 0.76, 8]} />
          <meshStandardMaterial color={GOLD_DARK} roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Curtain({ position, height = 12 }: { position: [number, number, number]; height?: number }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[3, height, 0.3]} />
        <meshStandardMaterial color={VELVET} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, height - 0.3, 0.2]}>
        <boxGeometry args={[3.5, 0.6, 0.1]} />
        <meshStandardMaterial color={GOLD} roughness={0.4} metalness={0.5} />
      </mesh>
    </group>
  );
}

function Bookshelf({ position }: { position: [number, number, number] }) {
  const bookColors = ['#8b2020', '#1a3a6b', '#2a5a2a', '#6b4a1a', '#4a1a5a', '#1a5a5a'];
  return (
    <group position={position}>
      <mesh castShadow position={[0, 4.5, 0]}>
        <boxGeometry args={[4, 9, 1.2]} />
        <meshStandardMaterial color={WOOD_RICH} roughness={0.6} />
      </mesh>
      {[0.2, 1.8, 3.4, 5.0, 6.6].map((y) => (
        <mesh key={y} position={[0, y, 0.05]}>
          <boxGeometry args={[3.6, 0.1, 1.1]} />
          <meshStandardMaterial color={WOOD_MAHOGANY} roughness={0.5} />
        </mesh>
      ))}
      {[0.2, 1.8, 3.4, 5.0].map((shelfY, si) =>
        Array.from({ length: 8 }, (_, bi) => {
          const c = bookColors[(si * 3 + bi) % bookColors.length]!;
          const h = 1.0 + Math.sin(si * 3 + bi) * 0.3;
          const w = 0.15 + Math.sin(bi * 2 + si) * 0.05;
          return (
            <mesh key={`${si}-${bi}`} castShadow position={[-1.4 + bi * 0.4, shelfY + 0.1 + h / 2, 0.1]}>
              <boxGeometry args={[w, h, 0.7]} />
              <meshStandardMaterial color={c} roughness={0.85} />
            </mesh>
          );
        })
      )}
      <mesh position={[0, 8.7, 0]}>
        <boxGeometry args={[4.4, 0.4, 1.4]} />
        <meshStandardMaterial color={GOLD_DARK} roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

function Painting({ position, size, color }: { position: [number, number, number]; size: [number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[size[0] + 0.4, size[1] + 0.4, 0.12]} />
        <meshStandardMaterial color={GOLD_DARK} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

function WallSconce({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshStandardMaterial color={GOLD_DARK} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.5, 0.3]}>
        <coneGeometry args={[0.2, 0.35, 8]} />
        <meshStandardMaterial color="#fff8e0" emissive="#ffe080" emissiveIntensity={2} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Fountain() {
  return (
    <group position={[28, 0, 18]}>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[3, 3.5, 0.8, 16]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.7, 24]} />
        <meshStandardMaterial color="#4080c0" roughness={0.1} metalness={0.3} transparent opacity={0.6} />
      </mesh>
      <mesh castShadow position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 3, 10]} />
        <meshStandardMaterial color={MARBLE} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 3.2, 0]}>
        <cylinderGeometry args={[1.2, 0.8, 0.6, 12]} />
        <meshStandardMaterial color={MARBLE_DARK} roughness={0.35} />
      </mesh>
      <mesh position={[0, 3.8, 0]}>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshStandardMaterial color={GOLD} roughness={0.2} metalness={0.7} />
      </mesh>
    </group>
  );
}

function Decorations() {
  const hd = D / 2, hw = W / 2;
  return (
    <group>
      <Painting position={[-25, 7, -hd + 0.4]} size={[5, 3.5]} color="#3a2818" />
      <Painting position={[25, 7, -hd + 0.4]} size={[4, 5]} color="#2a1a30" />
      <Painting position={[-hw + 0.5, 7, -20]} size={[3, 4]} color="#1a2a1a" />
      <Painting position={[-hw + 0.5, 7, 10]} size={[4, 3]} color="#2a1818" />
      <Painting position={[hw - 0.5, 7, -10]} size={[5, 3.5]} color="#18202a" />
      <Painting position={[hw - 0.5, 7, 20]} size={[3, 4.5]} color="#1a1828" />

      <WallSconce position={[-15, 6, -hd + 0.5]} />
      <WallSconce position={[15, 6, -hd + 0.5]} />
      <WallSconce position={[-hw + 0.5, 6, -15]} rotation={Math.PI / 2} />
      <WallSconce position={[-hw + 0.5, 6, 15]} rotation={Math.PI / 2} />
      <WallSconce position={[hw - 0.5, 6, 0]} rotation={-Math.PI / 2} />

      <Curtain position={[-hw + 0.6, 0, -30]} />
      <Curtain position={[-hw + 0.6, 0, 0]} />
      <Curtain position={[-hw + 0.6, 0, 25]} />
      <Curtain position={[hw - 0.6, 0, -30]} />
      <Curtain position={[hw - 0.6, 0, 0]} />
      <Curtain position={[hw - 0.6, 0, 25]} />

      {/* carpets */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -12]}>
        <planeGeometry args={[40, 25]} />
        <meshStandardMaterial color={CARPET_RED} roughness={1} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-10, 0.02, 15]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial color={CARPET_RED} roughness={1} />
      </mesh>

      {/* plants */}
      {([[-55, 0, -40], [55, 0, -40], [-55, 0, 40], [55, 0, 40], [20, 0, 38]] as [number, number, number][]).map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.5, 0.4, 1.2, 8]} />
            <meshStandardMaterial color={GOLD_DARK} roughness={0.6} />
          </mesh>
          <mesh castShadow position={[0, 1.8, 0]}>
            <sphereGeometry args={[1.0, 8, 6]} />
            <meshStandardMaterial color="#4a8a3a" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const WAYPOINTS: [number, number, number][][] = [
  [[-35, 0, 10], [-35, 0, -20], [-15, 0, -20], [-15, 0, 10], [5, 0, 10], [5, 0, -12], [-35, 0, -12], [-35, 0, 10]],
  [[35, 0, 30], [35, 0, 5], [20, 0, -20], [5, 0, 5], [5, 0, 30], [20, 0, 30], [35, 0, 30]],
  [[-45, 0, 30], [-45, 0, 10], [-25, 0, 10], [-25, 0, 30], [0, 0, 30], [0, 0, 10], [-45, 0, 10], [-45, 0, 30]],
  [[15, 0, -5], [40, 0, -5], [40, 0, 25], [15, 0, 25], [15, 0, 35], [35, 0, 35], [35, 0, -5], [15, 0, -5]],
  [[-50, 0, -30], [-30, 0, -30], [-30, 0, 0], [-50, 0, 0], [-50, 0, 20], [-30, 0, 20], [-30, 0, -30], [-50, 0, -30]],
];

function useRoomNPCs() {
  useEffect(() => {
    const n = useNPCStore.getState();
    if (!n.initialized) n.initializeDefaults();
    if (n.instances.has('mansion-npc-0')) return;

    const npcs = [
      { id: 'mansion-npc-0', name: 'Butler', template: 'ally', pos: [-35, 0, 10] as [number, number, number], clothing: 'basic-suit' },
      { id: 'mansion-npc-1', name: 'Maid', template: 'oneyee', pos: [35, 0, 30] as [number, number, number], clothing: 'formal-suit' },
      { id: 'mansion-npc-2', name: 'Guest A', template: 'ally', pos: [-45, 0, 30] as [number, number, number], clothing: 'rabbit-outfit' },
      { id: 'mansion-npc-3', name: 'Guest B', template: 'oneyee', pos: [15, 0, -5] as [number, number, number], clothing: 'basic-suit' },
      { id: 'mansion-npc-4', name: 'Guest C', template: 'ally', pos: [-50, 0, -30] as [number, number, number], clothing: 'formal-suit' },
    ];

    npcs.forEach((npc, i) => {
      n.addInstance({
        id: npc.id, templateId: npc.template, name: npc.name,
        position: npc.pos, rotation: [0, 0, 0], scale: [1, 1, 1],
        currentAnimation: 'walk', events: [],
        currentClothingSetId: npc.clothing,
      });
      const waypoints = WAYPOINTS[i];
      if (waypoints) n.setNavigation(npc.id, waypoints, 1.2 + Math.random() * 0.6);
    });

    return () => {
      const store = useNPCStore.getState();
      npcs.forEach((npc) => store.removeInstance(npc.id));
    };
  }, []);
}

export function MiniRoomPage({ children }: WorldPageProps) {
  const mode = useGaesupStore((state) => state.mode);
  const { gameStates } = useStateSystem();
  useRoomNPCs();

  return (
    <>
      <GaesupWorld
        urls={{ characterUrl: CHARACTER_URL, vehicleUrl: VEHICLE_URL, airplaneUrl: AIRPLANE_URL }}
        debug={false}
        cameraOption={CAMERA_OPT}
      >
        <Canvas
          shadows
          dpr={[1, 1.2]}
          camera={{ position: [60, 45, 60], fov: 35 }}
          style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}
          frameloop="always"
        >
          <color attach="background" args={['#1a1510']} />
          <fog attach="fog" args={['#1a1510', 80, 250]} />
          <Environment preset="apartment" />

          <ambientLight intensity={0.35} color="#ffe8d0" />
          <hemisphereLight intensity={0.2} color="#ffe0c0" groundColor="#2a1a10" />
          <directionalLight
            castShadow position={[25, 45, 30]} intensity={1.0} color="#fff0d8"
            shadow-mapSize={2048} shadow-bias={-0.0003}
          >
            <orthographicCamera attach="shadow-camera" args={[-65, 65, 65, -65, 1, 120]} />
          </directionalLight>

          <Suspense>
            <GaesupWorldContent showGrid={false} showAxes={false}>
              <Physics interpolate>
                {!gameStates?.isRiding && (
                  <GaesupController
                    key={`controller-${mode.type}`}
                    controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
                    rigidBodyProps={{}} parts={[]}
                    rotation={euler({ x: 0, y: Math.PI, z: 0 })}
                  />
                )}

                <Floor />
                <Walls />
                <Columns />
                <Chandelier position={[0, WH - 1, -12]} />
                <Chandelier position={[-25, WH - 1, 15]} />
                <Chandelier position={[25, WH - 1, 15]} />
                <Fireplace />
                <GrandStaircase />
                <GrandPiano />
                <DiningTable />
                <SofaSet />
                <Bookshelf position={[55, 0, -15]} />
                <Bookshelf position={[55, 0, 5]} />
                <Fountain />
                <Decorations />

                <Sparkles count={60} speed={0.3} size={1.5} color="#ffe8a0" opacity={0.2} scale={[100, 12, 80]} position={[0, 7, 0]} />

                <Clicker />
                <GroundClicker />
                <NPCSystem />
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>

        <div style={{
          position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, pointerEvents: 'none', textAlign: 'center',
        }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(212,168,74,0.4)', fontWeight: 300 }}>
            GAESUP WORLD
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: GOLD }}>
            Grand Mansion
          </div>
        </div>

        <a href="/" style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, display: 'inline-block', padding: '10px 24px',
          background: 'rgba(30,20,10,0.5)', border: '1px solid rgba(212,168,74,0.2)',
          borderRadius: 24, color: GOLD, fontSize: 12, fontWeight: 500,
          textDecoration: 'none', backdropFilter: 'blur(10px)',
        }}>
          Home
        </a>
      </GaesupWorld>
      {children}
    </>
  );
}
