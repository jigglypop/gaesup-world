'use client';

import { Environment } from '@react-three/drei';
import { Physics, euler, RigidBody } from '@react-three/rapier';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GaesupController, GaesupWorld, GamePad, MiniMap, MinimapPlatform, MinimapObject, V3 } from '../../src';
import { Clicker } from '../../src/gaesup/tools/clicker';
import { InnerHtml } from '../../src/gaesup/utils/innerHtml';
import { FocusModal } from '../../src/gaesup/tools/FocusModal';
import { ObjectInfoPanel } from '../../src/gaesup/tools/ObjectInfoPanel';
import { useFocus } from '../../src/gaesup/hooks/useFocus';
import { useTeleport } from '../../src/gaesup/hooks/useTeleport';
import Info from '../info';
import Passive from '../passive';
import Floor from './Floor';
import * as style from './style.css';

function FocusHandler({ onObjectFocused, onCenterFocused }: { 
  onObjectFocused: (obj: any) => void;
  onCenterFocused: (obj: any) => void;
}) {
  const { focusOn } = useFocus();

  // 발판 포커싱 (기존)
  (window as any).handlePlatformFocus = async (platformData: any, clickPosition: any) => {
    const targetPosition = V3(clickPosition.x, clickPosition.y + 5, clickPosition.z + 8);
    const lookAtPosition = V3(platformData.position[0], platformData.position[1], platformData.position[2]);
    
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
        z: platformData.position[2]
      },
      color: platformData.color,
      type: platformData.type,
    });
  };

  // 중앙 오브젝트 포커싱 (새로운)
  (window as any).handleCenterFocus = async (objectData: any) => {
    const objectPosition = V3(objectData.position[0], objectData.position[1], objectData.position[2]);
    
    // 오브젝트를 화면 중앙에 배치하는 카메라 위치 계산 (더 가까이)
    const distance = objectData.focusDistance || 5;
    const targetPosition = V3(
      objectPosition.x + distance * 0.5,
      objectPosition.y + distance * 0.3,
      objectPosition.z + distance * 0.5
    );
    
    // 확실한 포커싱을 위해 연속으로 실행
    const focusParams = {
      zoom: 4.0,
      target: objectPosition,
      position: targetPosition,
    };
    
    // 첫 번째 포커싱
    await focusOn(focusParams);
    
    // 추가 포커싱들로 확실하게 완료
    setTimeout(() => focusOn(focusParams), 50);
    setTimeout(() => focusOn(focusParams), 150);
    setTimeout(() => focusOn(focusParams), 300);
    
    onCenterFocused({
      name: objectData.name,
      position: {
        x: objectData.position[0],
        y: objectData.position[1],
        z: objectData.position[2]
      },
      color: objectData.color,
      type: objectData.type,
      description: objectData.description,
      properties: objectData.properties,
    });
  };

  return null;
}

// 발판과 계단 컴포넌트 - 자동 미니맵 등록 포함
function Platforms() {
  const platforms = [
    { name: "갈색 발판 A", position: [10, 2, 0], size: [8, 1, 8], color: "#8B4513", type: "큰 발판", label: "A" },
    { name: "갈색 발판 B", position: [-10, 3, 5], size: [6, 1, 6], color: "#A0522D", type: "중간 발판", label: "B" },
    { name: "갈색 발판 C", position: [0, 4, 15], size: [10, 1, 6], color: "#CD853F", type: "긴 발판", label: "C" },
    { name: "갈색 발판 D", position: [20, 5, -10], size: [8, 1, 8], color: "#DEB887", type: "높은 발판", label: "D" },
    { name: "갈색 발판 E", position: [-15, 6, -8], size: [6, 1, 10], color: "#F4A460", type: "최고 발판", label: "E" },
    { name: "계단 1단", position: [25, 1, 5], size: [4, 1, 4], color: "#D2691E", type: "계단", label: "1" },
    { name: "계단 2단", position: [25, 2, 10], size: [4, 1, 4], color: "#D2691E", type: "계단", label: "2" },
    { name: "계단 3단", position: [25, 3, 15], size: [4, 1, 4], color: "#D2691E", type: "계단", label: "3" },
    { name: "계단 4단", position: [25, 4, 20], size: [4, 1, 4], color: "#D2691E", type: "계단", label: "4" },
    { name: "연결 발판 A", position: [0, 7, -20], size: [15, 1, 4], color: "#B22222", type: "연결 발판", label: "RA" },
    { name: "연결 발판 B", position: [-20, 8, -15], size: [8, 1, 12], color: "#800080", type: "연결 발판", label: "RB" },
  ];

  const handlePlatformClick = (e: any, platformData: any) => {
    e.stopPropagation();
    
    // 전역 함수 호출 (GaesupWorld 내부에서 사용 가능)
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
              onPointerOver={(e) => (e.object.material.emissive.setHex(0x222222))}
              onPointerOut={(e) => (e.object.material.emissive.setHex(0x000000))}
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

// 중앙 포커싱용 오브젝트들 - 자동 미니맵 등록 포함
function FocusObjects() {
  const objects = [
    {
      name: "신비한 크리스탈",
      position: [5, 3, 10],
      geometry: "dodecahedron",
      args: [2],
      color: "#FF6B9D",
      focusDistance: 4,
      emoji: "💎",
      description: "고대 문명의 유물로 추정되는 신비한 크리스탈입니다. 내부에서 미약한 에너지가 감지됩니다.",
      properties: {
        material: "미지의 크리스탈",
        energy: "87%",
        origin: "고대 문명",
        rarity: "전설급"
      }
    },
    {
      name: "마법의 오브",
      position: [-8, 4, 12],
      geometry: "sphere",
      args: [1.5],
      color: "#4ECDC4",
      focusDistance: 3,
      emoji: "🔮",
      description: "마법사들이 사용하던 신비한 구슬입니다. 만지면 따뜻한 기운이 느껴집니다.",
      properties: {
        material: "마법석",
        temperature: "28°C",
        mana: "충전됨",
        enchantment: "치유의 오라"
      }
    },
    {
      name: "고대 기둥",
      position: [15, 3, -5],
      geometry: "cylinder",
      args: [0.8, 6],
      color: "#F7B731",
      focusDistance: 6,
      emoji: "🏛️",
      description: "수천 년 전 건설된 것으로 보이는 석조 기둥입니다. 표면에 알 수 없는 문자가 새겨져 있습니다.",
      properties: {
        material: "고대 석재",
        age: "3,000년 추정",
        inscriptions: "고대 룬 문자",
        condition: "양호"
      }
    },
    {
      name: "에너지 큐브",
      position: [-12, 2.5, -10],
      geometry: "box",
      args: [2, 2, 2],
      color: "#A55EEA",
      focusDistance: 4,
      emoji: "⚡",
      description: "미래 기술로 만들어진 에너지 저장 장치입니다. 표면이 부드럽게 빛나고 있습니다.",
      properties: {
        material: "나노 합금",
        energy: "95%",
        technology: "미래형",
        status: "활성"
      }
    },
    {
      name: "우주 파편",
      position: [8, 5, -15],
      geometry: "octahedron",
      args: [2.5],
      color: "#FF6B35",
      focusDistance: 5,
      emoji: "☄️",
      description: "운석으로 추정되는 우주 파편입니다. 지구에서는 발견되지 않는 원소가 포함되어 있습니다.",
      properties: {
        material: "우주 광물",
        origin: "외계",
        composition: "미지의 원소",
        radioactivity: "안전"
      }
    },
  ];

  const handleObjectClick = (e: any, objectData: any) => {
    e.stopPropagation();
    
    if ((window as any).handleCenterFocus) {
      (window as any).handleCenterFocus(objectData);
    }
  };

  const createGeometry = (object: any) => {
    switch (object.geometry) {
      case "sphere":
        return <sphereGeometry args={object.args} />;
      case "box":
        return <boxGeometry args={object.args} />;
      case "cylinder":
        return <cylinderGeometry args={object.args} />;
      case "dodecahedron":
        return <dodecahedronGeometry args={object.args} />;
      case "octahedron":
        return <octahedronGeometry args={object.args} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <>
      {objects.map((object, index) => (
        <MinimapObject
          key={index}
          id={`object_${index}`}
          position={object.position as [number, number, number]}
          emoji={object.emoji}
        >
          <RigidBody type="fixed" colliders="cuboid">
            <mesh 
              position={object.position as [number, number, number]}
              castShadow 
              receiveShadow
              onClick={(e) => handleObjectClick(e, object)}
              onPointerOver={(e) => {
                e.object.material.emissive.setHex(0x444444);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.object.material.emissive.setHex(0x000000);
                document.body.style.cursor = 'default';
              }}
            >
              {createGeometry(object)}
              <meshStandardMaterial 
                color={object.color}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
            
            {/* 물체 위에 떠있는 라벨 */}
            <mesh position={[object.position[0], object.position[1] + 4, object.position[2]]}>
              <planeGeometry args={[3, 0.8]} />
              <meshBasicMaterial 
                color="rgba(0, 0, 0, 0.7)" 
                transparent 
                opacity={0.8}
              />
            </mesh>
          </RigidBody>
        </MinimapObject>
      ))}
    </>
  );
}

// 텔레포트 핸들러
function TeleportHandler() {
  const { Teleport } = useTeleport();

  // 전역 텔레포트 함수 등록
  (window as any).teleportTo = (x: number, y: number, z: number) => {
    Teleport(V3(x, y, z));
  };

  return null;
}

export const S3 = 'https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf';
export const keyBoardMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'], label: 'FORWARD' },
  { name: 'backward', keys: ['KeyS', 'ArrowDown'], label: 'BACKWARD' },
  { name: 'leftward', keys: ['KeyA', 'ArrowLeft'], label: 'LEFT' },
  { name: 'rightward', keys: ['KeyD', 'ArrowRight'], label: 'RIGHT' },
  { name: 'space', keys: ['Space'], label: 'JUMP' },
  { name: 'shift', keys: ['Shift'], label: 'SPRINT' },
  { name: 'keyZ', keys: ['KeyZ'], label: 'GREET' },
  { name: 'keyR', keys: ['KeyR'], label: 'RIDE' },
  { name: 'keyF', keys: ['KeyF'], label: 'INTERACT' },
  { name: 'keyE', keys: ['KeyE'], label: 'USE' },
];

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

  const [centerFocusedObject, setCenterFocusedObject] = useState<{
    name: string;
    position: { x: number; y: number; z: number };
    color: string;
    type: string;
    description: string;
    properties: Record<string, string>;
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
        smoothing: {
          position: 0.25,
          rotation: 0.3,
          fov: 0.2,
        },
        fov: 75,
        bounds: {
          minY: 2,
          maxY: 50,
          minX: -100,
          maxX: 100,
          minZ: -100,
          maxZ: 100,
        },
      }}
    >
      {/* 포커싱 핸들러 - GaesupWorld 내부에서 context 사용 가능 */}
      <FocusHandler 
        onObjectFocused={setFocusedObject} 
        onCenterFocused={setCenterFocusedObject}
      />
      
      {/* 텔레포트 핸들러 - GaesupWorld 내부에서 context 사용 가능 */}
      <TeleportHandler />
      
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [0, 10, 20],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
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
        <directionalLight
          castShadow
          shadow-normalBias={0.06}
          position={[-200, 30, -100]}
          intensity={0.7}
          shadow-mapSize={[5000, 5000]}
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
                subscribe({
                  tag: 'greet',
                  condition: () => control?.keyZ,
                });
              }}
              controllerOptions={{
                lerp: {
                  cameraTurn: 0.1,
                  cameraPosition: 0.08,
                },
              }}
              rigidBodyProps={{}}
              parts={[{ url: 'gltf/ally_cloth_rabbit.glb', color: '#ffe0e0' }]}
            ></GaesupController>
            <Floor />
            <Platforms />
            <FocusObjects />
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
            ></Clicker>
          </Physics>
        </Suspense>
      </Canvas>
      <Info />

      {/* 미니맵 - 좌하단에 배치 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
      }}>
        <MiniMap
          scale={0.3}
          blockRotate={false}
          minimapStyle={{
            position: 'relative',
          }}
          scaleStyle={{
            marginTop: '10px',
          }}
        />
      </div>

      {/* 텔레포트 포인트들 */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <button
          onClick={() => (window as any).teleportTo && (window as any).teleportTo(10, 3, 0)}
          style={{
            padding: '8px 12px',
            background: 'rgba(139, 69, 19, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          🟫 발판 A
        </button>
        <button
          onClick={() => (window as any).teleportTo && (window as any).teleportTo(-10, 4, 5)}
          style={{
            padding: '8px 12px',
            background: 'rgba(160, 82, 45, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          🟫 발판 B
        </button>
        <button
          onClick={() => (window as any).teleportTo && (window as any).teleportTo(0, 5, 15)}
          style={{
            padding: '8px 12px',
            background: 'rgba(205, 133, 63, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          🟫 발판 C
        </button>
        <button
          onClick={() => (window as any).teleportTo && (window as any).teleportTo(5, 4, 10)}
          style={{
            padding: '8px 12px',
            background: 'rgba(255, 107, 157, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          💎 크리스탈
        </button>
        <button
          onClick={() => (window as any).teleportTo && (window as any).teleportTo(-8, 5, 12)}
          style={{
            padding: '8px 12px',
            background: 'rgba(78, 205, 196, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          🔮 마법 오브
        </button>
        <button
          onClick={() => (window as any).teleportTo && (window as any).teleportTo(0, 2, 0)}
          style={{
            padding: '8px 12px',
            background: 'rgba(70, 130, 180, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          🏠 시작점
        </button>
      </div>

      {/* 포커싱 모달 - Canvas 외부에 위치 */}
      <FocusModal 
        focusedObject={focusedObject} 
        onClose={() => setFocusedObject(null)} 
      />

      {/* 중앙 포커싱 모달 */}
      <ObjectInfoPanel 
        focusedObject={centerFocusedObject} 
        onClose={() => setCenterFocusedObject(null)} 
      />

      <div className={style.helpPanel}>
        <h3>🎯 오브젝트 포커싱 & 발판 점프 데모</h3>
        <div className={style.helpContent}>
          <div className={style.helpSection}>
            <h4>🔮 중앙 포커싱 기능:</h4>
            <ul>
              <li><strong>신비한 오브젝트들:</strong> 다양한 3D 오브젝트들이 월드에 배치됨</li>
              <li><strong>오브젝트 클릭:</strong> 오브젝트를 클릭하면 화면 중앙에 포커싱</li>
              <li><strong>자세한 정보:</strong> 오브젝트의 설명, 속성, 위치 정보 표시</li>
              <li><strong>자연스러운 전환:</strong> 부드러운 카메라 이동과 줌</li>
              <li><strong>캐릭터 복귀:</strong> "캐릭터로 돌아가기" 버튼으로 원래 시점 복원</li>
            </ul>
          </div>
          <div className={style.helpSection}>
            <h4>🎯 발판 포커싱 기능:</h4>
            <ul>
              <li><strong>발판 클릭:</strong> 마우스로 발판을 클릭하면 해당 발판에 줌인</li>
              <li><strong>호버 효과:</strong> 발판에 마우스를 올리면 하이라이트 표시</li>
              <li><strong>모달 창:</strong> 클릭한 발판의 정보와 카메라 상태 표시</li>
              <li><strong>줌아웃:</strong> 모달 창에서 "줌아웃하고 닫기" 버튼으로 원래 시점 복원</li>
            </ul>
          </div>
          <div className={style.helpSection}>
            <h4>🌟 특별한 오브젝트들:</h4>
            <ul>
              <li><strong>신비한 크리스탈:</strong> 12면체 모양의 핑크 크리스탈 (고대 문명 유물)</li>
              <li><strong>마법의 오브:</strong> 구체 모양의 청록색 마법석 (치유의 오라)</li>
              <li><strong>고대 기둥:</strong> 원통형 황금색 석조 기둥 (룬 문자 새겨짐)</li>
              <li><strong>에너지 큐브:</strong> 정육면체 보라색 미래 기술 장치</li>
              <li><strong>우주 파편:</strong> 8면체 주황색 운석 (외계 광물)</li>
            </ul>
          </div>
          <div className={style.helpSection}>
            <h4>조작법:</h4>
            <ul>
              <li><strong>🎮 하이브리드 조작:</strong> 키보드와 마우스 동시 사용 가능!</li>
              <li><strong>W/↑:</strong> 앞으로 이동</li>
              <li><strong>S/↓:</strong> 뒤로 이동</li>
              <li><strong>A/←:</strong> 왼쪽으로 이동</li>
              <li><strong>D/→:</strong> 오른쪽으로 이동</li>
              <li><strong>🖱️ 마우스 클릭:</strong> 바닥 클릭으로 이동 / 발판&오브젝트 클릭으로 포커싱</li>
              <li><strong>스페이스:</strong> 점프 (지면이나 발판에서만 가능)</li>
              <li><strong>Shift:</strong> 달리기 (이동 중에 누르기)</li>
              <li><strong>Z:</strong> 인사</li>
              <li><strong>R:</strong> 탑승 (차량 근처에서)</li>
              <li><strong>F:</strong> 상호작용</li>
              <li><strong>E:</strong> 사용</li>
            </ul>
          </div>
          <div className={style.helpSection}>
            <h4>시스템 특징:</h4>
            <ul>
              <li><strong>🎯 듀얼 포커싱:</strong> 발판 포커싱 + 오브젝트 중앙 포커싱</li>
              <li><strong>🔮 오브젝트 탐색:</strong> 다양한 신비한 오브젝트들과 상호작용</li>
              <li><strong>📖 상세 정보:</strong> 각 오브젝트의 배경 스토리와 속성 표시</li>
              <li><strong>🗺️ 자동 미니맵 등록:</strong> MinimapPlatform, MinimapObject 컴포넌트로 자동 등록</li>
              <li><strong>🎮 성능 최적화:</strong> 미니맵 wheel 이벤트 개선, 자동 언마운트 시 제거</li>
              <li><strong>🚀 즉시 텔레포트:</strong> 우상단 버튼들로 주요 위치에 순간이동</li>
              <li><strong>📍 미니맵 위치:</strong> 좌하단으로 이동해서 게임패드와 겹치지 않음</li>
              <li><strong>발판 점프:</strong> 모든 발판에서 점프 가능</li>
              <li><strong>연속 점프 방지:</strong> 착지 후에만 다시 점프 가능</li>
              <li><strong>물리 기반:</strong> Rapier 물리 엔진으로 자연스러운 점프</li>
              <li><strong>카메라 추적:</strong> 3인칭 카메라가 부드럽게 따라감</li>
              <li><strong>높이 감지:</strong> 개선된 Y velocity 기반 지면/발판 감지</li>
              <li><strong>실시간 설정:</strong> 카메라 옵션 실시간 조정 가능 (⚙️ 버튼)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={style.footerUpper}>
        <div className={style.gamePad}>
          <GamePad
            label={{
              keyZ: 'GREET',
              shift: 'SPRINT',
              space: 'JUMP',
            }}
          />
        </div>
      </div>
    </GaesupWorld>
  );
}
