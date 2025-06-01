'use client';

import { Environment, Trail } from '@react-three/drei';
import { Physics, euler } from '@react-three/rapier';

import { Canvas, useFrame } from '@react-three/fiber';

import { Suspense, useRef } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import * as THREE from 'three';
import { GaesupController, GaesupWorld, GamePad, MiniMap, V3 } from '../../src';
import { Clicker } from '../../src/gaesup/tools/clicker';
import { InnerHtml } from '../../src/gaesup/utils/innerHtml';
import Info from '../info';
import Passive from '../passive';
import Floor from './Floor';
import * as style from './style.css';

function Electron({ radius = 2.75, speed = 6, ...props }) {
  const ref = useRef<THREE.Mesh>();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (!ref.current) return;
    ref.current.position.set(
      Math.sin(t) * radius,
      (Math.cos(t) * radius * Math.atan(t)) / Math.PI / 1.25,
      0,
    );
  });
  return (
    <group {...props}>
      <Trail
        local
        width={5}
        length={6}
        color={new THREE.Color(2, 1, 10)}
        attenuation={(t) => t * t}
      >
        <mesh ref={ref}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial color={[10, 1, 10]} toneMapped={false} />
        </mesh>
      </Trail>
    </group>
  );
}

function DemoObjects() {
  return (
    <>
      <mesh position={[10, 2, 0]} castShadow>
        <boxGeometry args={[2, 4, 2]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <mesh position={[-10, 1.5, 5]} castShadow>
        <cylinderGeometry args={[1, 1, 3]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      <mesh position={[0, 1, 15]} castShadow>
        <sphereGeometry args={[2]} />
        <meshStandardMaterial color="purple" />
      </mesh>
      <mesh position={[20, 1, -10]} castShadow>
        <coneGeometry args={[2, 4]} />
        <meshStandardMaterial color="green" />
      </mesh>
      <mesh position={[-15, 2, -8]} castShadow>
        <dodecahedronGeometry args={[2]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </>
  );
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
          position: 0.08,
          rotation: 0.1,
          fov: 0.1,
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
            <DemoObjects />
            <Passive />
            <Electron />
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

      <div className={style.helpPanel}>
        <h3>카메라 데모 조작법</h3>
        <div className={style.helpContent}>
          <div className={style.helpSection}>
            <h4>카메라 모드:</h4>
            <ul>
              <li><strong>1인칭:</strong> 캐릭터 눈으로 보는 시점</li>
              <li><strong>3인칭:</strong> 충돌 감지가 있는 뒤따라가기 카메라</li>
              <li><strong>3인칭 궤도:</strong> 캐릭터 주변을 도는 카메라</li>
              <li><strong>탑다운:</strong> 전략 게임용 위에서 내려다보는 시점</li>
              <li><strong>사이드 스크롤:</strong> 클래식 2D 플랫폼 게임 스타일</li>
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
              <li><strong>🖱️ 마우스 클릭:</strong> 바닥 클릭으로 이동</li>
              <li><strong>스페이스:</strong> 점프</li>
              <li><strong>Shift:</strong> 달리기 (이동 중에 누르기)</li>
              <li><strong>Z:</strong> 인사</li>
              <li><strong>R:</strong> 탑승 (차량 근처에서)</li>
              <li><strong>F:</strong> 상호작용</li>
              <li><strong>E:</strong> 사용</li>
            </ul>
          </div>
          <div className={style.helpSection}>
            <h4>테스트 기능:</h4>
            <ul>
              <li><strong>컨트롤러 전환:</strong> 클리커와 키보드 모드 체험</li>
              <li>카메라 충돌 감지 (3인칭)</li>
              <li>모드 간 부드러운 전환</li>
              <li>시야각(FOV) 조정</li>
              <li>경계 제한</li>
              <li>실시간 설정 조정 (⚙️ 버튼)</li>
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
      <div className={style.footerLower}>
        <div className={style.joystickOuter}>
          <MiniMap />
        </div>
      </div>
    </GaesupWorld>
  );
}
