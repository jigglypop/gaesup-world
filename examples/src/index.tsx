'use client';

import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useContext, useState } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import {
  GaesupController,
  GaesupWorld,
  MiniMap,
  MinimapPlatform,
  PerfMonitor,
  Rideable,
  V3,
} from '../../src';
import { InnerHtml } from '../../src/gaesup/component/InnerHtml';
import { GaesupContext } from '../../src/gaesup/context';
import { useFocus } from '../../src/gaesup/hooks/useFocus';
import { useTeleport } from '../../src/gaesup/hooks/useInputControls';
import { Clicker } from '../../src/gaesup/tools/clicker';
import { FocusModal } from '../../src/gaesup/tools/FocusModal';
import { RideableUI } from '../../src/gaesup/tools/rideable';
import Info from '../info';
import Passive from '../passive';
import Floor from './Floor';
import * as style from './style.css';

function FocusHandler({ onObjectFocused }: { onObjectFocused: (obj: any) => void }) {
  const { focusOn } = useFocus();

  // 발판 포커싱
  (window as any).handlePlatformFocus = async (platformData: any, clickPosition: any) => {
    const targetPosition = V3(clickPosition.x, clickPosition.y + 5, clickPosition.z + 8);
    const lookAtPosition = V3(
      platformData.position[0],
      platformData.position[1],
      platformData.position[2],
    );

    await focusOn({
      zoom: 1.5,
      target: lookAtPosition,
      position: targetPosition,
    });

    onObjectFocused({
      name: platformData.name,
      position: {
        x: platformData.position[0],
        y: platformData.position[1],
        z: platformData.position[2],
      },
      color: platformData.color,
      type: platformData.type,
    });
  };

  return null;
}

// 발판들 - 더 깔끔하게 정리
function Platforms() {
  const platforms = [
    // 기본 발판들
    {
      name: '발판 A',
      position: [40, 2, 0],
      size: [8, 1, 8],
      color: '#8B4513',
      type: '기본',
      label: 'A',
    },
    {
      name: '발판 B',
      position: [-40, 3, 20],
      size: [6, 1, 6],
      color: '#8B4513',
      type: '기본',
      label: 'B',
    },
    {
      name: '발판 C',
      position: [0, 4, 60],
      size: [10, 1, 6],
      color: '#8B4513',
      type: '긴 발판',
      label: 'C',
    },
    {
      name: '발판 D',
      position: [80, 5, -40],
      size: [8, 1, 8],
      color: '#8B4513',
      type: '높은 발판',
      label: 'D',
    },

    // 계단 시리즈
    {
      name: '계단 1',
      position: [100, 1, 20],
      size: [4, 1, 4],
      color: '#D2691E',
      type: '계단',
      label: '1',
    },
    {
      name: '계단 2',
      position: [100, 2, 30],
      size: [4, 1, 4],
      color: '#D2691E',
      type: '계단',
      label: '2',
    },
    {
      name: '계단 3',
      position: [100, 3, 40],
      size: [4, 1, 4],
      color: '#D2691E',
      type: '계단',
      label: '3',
    },
    {
      name: '계단 4',
      position: [100, 4, 50],
      size: [4, 1, 4],
      color: '#D2691E',
      type: '계단',
      label: '4',
    },
  ];

  const handlePlatformClick = (e: any, platformData: any) => {
    e.stopPropagation();
    if ((window as any).handlePlatformFocus) {
      const clickedPosition = e.point || platformData.position;
      (window as any).handlePlatformFocus(platformData, clickedPosition);
    }
  };

  return (
    <>
      {platforms.map((platform, index) => (
        <MinimapPlatform
          key={index}
          id={`platform_${index}`}
          position={platform.position as [number, number, number]}
          size={platform.size as [number, number, number]}
          label={platform.label}
        >
          <RigidBody type="fixed" colliders="cuboid">
            <mesh
              position={platform.position as [number, number, number]}
              castShadow
              receiveShadow
              onClick={(e) => handlePlatformClick(e, platform)}
              onPointerOver={(e) => e.object.material.emissive.setHex(0x222222)}
              onPointerOut={(e) => e.object.material.emissive.setHex(0x000000)}
            >
              <boxGeometry args={platform.size as [number, number, number]} />
              <meshStandardMaterial color={platform.color} />
            </mesh>
          </RigidBody>
        </MinimapPlatform>
      ))}
    </>
  );
}

// 텔레포트 핸들러
function TeleportHandler() {
  const { Teleport } = useTeleport();
  (window as any).teleportTo = (x: number, y: number, z: number) => {
    Teleport(V3(x, y, z));
  };
  return null;
}

// 탈것들 - 깔끔하게 정리
function RideableVehicles() {
  return (
    <>
      {/* 차량 */}
      <Rideable
        objectkey="vehicle_main"
        url={S3 + '/gorani.glb'}
        objectType="vehicle"
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(-70, 2, 30)}
        controllerOptions={{ lerp: { cameraPosition: 1, cameraTurn: 1 } }}
      />

      {/* 비행기 1 */}
      <Rideable
        objectkey="airplane_main"
        url={S3 + '/gaebird.glb'}
        objectType="airplane"
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(70, 2, 40)}
        controllerOptions={{ lerp: { cameraPosition: 1, cameraTurn: 1 } }}
      />

      {/* 비행기 2 */}
      <Rideable
        objectkey="airplane_advanced"
        url={S3 + '/orri.glb'}
        objectType="airplane"
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(-30, 2, 80)}
        controllerOptions={{ lerp: { cameraPosition: 1, cameraTurn: 1 } }}
      />
    </>
  );
}

// 탭 컴포넌트
function InfoTabs() {
  const [activeTab, setActiveTab] = useState<'controls' | 'features' | 'locations'>('controls');

  const tabs = [
    { id: 'controls', label: '조작법', emoji: '🎮' },
    { id: 'features', label: '기능', emoji: '✨' },
    { id: 'locations', label: '위치', emoji: '📍' },
  ];

  return (
    <div className={style.helpPanel}>
      {/* 탭 헤더 */}
      <div className={style.tabHeader}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${style.tabButton} ${activeTab === tab.id ? style.tabButtonActive : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div className={style.tabContent}>
        {activeTab === 'controls' && (
          <div>
            <h3>🎮 기본 조작</h3>
            <ul>
              <li>
                <strong>W/↑:</strong> 앞으로 이동
              </li>
              <li>
                <strong>S/↓:</strong> 뒤로 이동
              </li>
              <li>
                <strong>A/←:</strong> 왼쪽 이동
              </li>
              <li>
                <strong>D/→:</strong> 오른쪽 이동
              </li>
              <li>
                <strong>Space:</strong> 점프
              </li>
              <li>
                <strong>Shift:</strong> 달리기
              </li>
              <li>
                <strong>R:</strong> 탑승
              </li>
            </ul>
            <h4>🖱️ 마우스 조작</h4>
            <ul>
              <li>
                <strong>클릭:</strong> 이동 및 상호작용
              </li>
              <li>
                <strong>발판 클릭:</strong> 포커싱
              </li>
            </ul>
          </div>
        )}

        {activeTab === 'features' && (
          <div>
            <h3>✨ 주요 기능</h3>
            <ul>
              <li>
                <strong>🎯 발판 포커싱:</strong> 발판 클릭으로 카메라 줌
              </li>
              <li>
                <strong>🚗 탈것 시스템:</strong> 차량/비행기 탑승
              </li>
              <li>
                <strong>🗺️ 미니맵:</strong> 실시간 위치 표시
              </li>
              <li>
                <strong>📍 텔레포트:</strong> 즉시 이동
              </li>
              <li>
                <strong>🎮 물리 엔진:</strong> Rapier 기반
              </li>
            </ul>
            <h4>🔧 시스템</h4>
            <ul>
              <li>
                <strong>성능 최적화:</strong> 리렌더링 최소화
              </li>
              <li>
                <strong>연속 점프 방지:</strong> 지면 착지 후 점프
              </li>
              <li>
                <strong>카메라 추적:</strong> 부드러운 3인칭 시점
              </li>
            </ul>
          </div>
        )}

        {activeTab === 'locations' && (
          <div>
            <h3>📍 주요 위치</h3>
            <ul>
              <li>
                <strong>🏠 시작점:</strong> (0, 0, 0)
              </li>
              <li>
                <strong>🟫 발판 A:</strong> 기본 연습용
              </li>
              <li>
                <strong>🟫 발판 B~D:</strong> 점프 연습
              </li>
              <li>
                <strong>📐 계단:</strong> 높이 변화 체험
              </li>
              <li>
                <strong>🚗 차량:</strong> 좌측 구역
              </li>
              <li>
                <strong>✈️ 비행기:</strong> 우측/상단 구역
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// 탈것 UI 렌더러 - GaesupWorldContext 사용
function RideableUIRenderer() {
  const { states } = useContext(GaesupContext);
  return <RideableUI states={states} />;
}

export const S3 = 'https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf';

export default function MainComponent() {
  const CHARACTER_URL = 'gltf/ally_body.glb';
  const AIRPLANE_URL = S3 + '/gaebird.glb';
  const VEHICLE_URL = S3 + '/gorani.glb';

  const [focusedObject, setFocusedObject] = useState<{
    name: string;
    position: { x: number; y: number; z: number };
    color: string;
    type: string;
  } | null>(null);

  return (
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
      debug={false}
      cameraOption={{
        xDistance: 15,
        yDistance: 8,
        zDistance: 15,
        enableCollision: true,
        smoothing: { position: 0.25, rotation: 0.3, fov: 0.2 },
        fov: 75,
        bounds: { minY: 2, maxY: 50, minX: -100, maxX: 100, minZ: -100, maxZ: 100 },
      }}
    >
      <FocusHandler onObjectFocused={setFocusedObject} />
      <TeleportHandler />

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 10, 20], fov: 75, near: 0.1, far: 1000 }}
        style={{ width: '100vw', height: '100vh', position: 'fixed' }}
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
          <Physics debug interpolate={true}>
            <GaesupController
              onAnimate={({ control, subscribe }) => {
                subscribe({ tag: 'greet', condition: () => control?.keyZ });
              }}
              controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
              rigidBodyProps={{}}
              parts={[{ url: 'gltf/ally_cloth_rabbit.glb', color: '#ffe0e0' }]}
              rotation={euler({ x: 0, y: Math.PI, z: 0 })}
            />
            <Floor />
            <Platforms />
            <Passive />
            <Clicker
              onMarker={
                <group rotation={euler({ x: 0, y: Math.PI / 2, z: 0 })}>
                  <InnerHtml position={V3(0, 1, 0)}>
                    <FaMapMarkerAlt style={{ color: '#f4ffd4', fontSize: '5rem' }} />
                  </InnerHtml>
                </group>
              }
              runMarker={
                <InnerHtml position={V3(0, 1, 0)}>
                  <FaMapMarkerAlt style={{ color: '#ffac8e', fontSize: '5rem' }} />
                </InnerHtml>
              }
            />
            <RideableVehicles />
          </Physics>
          <PerfMonitor position="bottom-right" updateInterval={500} visible={true} zIndex={10001} />
        </Suspense>
      </Canvas>

      <Info />

      {/* 탈것 탑승 UI - Canvas 밖에서 렌더링 */}
      <RideableUIRenderer />

      {/* 미니맵 */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
        }}
      >
        <MiniMap scale={0.3} blockRotate={false} />
      </div>

      {/* 통일된 텔레포트 버튼들 */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '360px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <button
          onClick={() => (window as any).teleportTo?.(0, 2, 0)}
          className={style.teleportButton}
        >
          🏠 시작점
        </button>
        <button
          onClick={() => (window as any).teleportTo?.(40, 3, 0)}
          className={style.teleportButton}
        >
          🟫 발판 A
        </button>
        <button
          onClick={() => (window as any).teleportTo?.(-40, 4, 20)}
          className={style.teleportButton}
        >
          🟫 발판 B
        </button>
        <button
          onClick={() => (window as any).teleportTo?.(100, 2, 20)}
          className={style.teleportButton}
        >
          📐 계단
        </button>
        <button
          onClick={() => (window as any).teleportTo?.(-70, 3, 30)}
          className={style.teleportButton}
        >
          🚗 차량
        </button>
        <button
          onClick={() => (window as any).teleportTo?.(70, 3, 40)}
          className={style.teleportButton}
        >
          ✈️ 비행기1
        </button>
        <button
          onClick={() => (window as any).teleportTo?.(-30, 3, 80)}
          className={style.teleportButton}
        >
          🛩️ 비행기2
        </button>
      </div>

      {/* 탭 기반 정보 패널 */}
      <InfoTabs />

      {/* 포커싱 모달 */}
      <FocusModal focusedObject={focusedObject} onClose={() => setFocusedObject(null)} />
    </GaesupWorld>
  );
}
