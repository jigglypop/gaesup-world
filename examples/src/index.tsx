'use client';

import { Environment } from '@react-three/drei';
import { Physics, euler, RigidBody } from '@react-three/rapier';

import { Canvas } from '@react-three/fiber';

import { Suspense } from 'react';
import { GaesupController, GaesupWorld, GamePad, MiniMap } from '../../src';
import Info from '../info';
import Passive from '../passive';
import Floor from './Floor';
import * as style from './style.css';

// 발판과 계단 컴포넌트 - Rapier fixed body 사용
function Platforms() {
  return (
    <>
      {/* 큰 발판들 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[10, 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[8, 1, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-10, 3, 5]} castShadow receiveShadow>
          <boxGeometry args={[6, 1, 6]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 4, 15]} castShadow receiveShadow>
          <boxGeometry args={[10, 1, 6]} />
          <meshStandardMaterial color="#CD853F" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[20, 5, -10]} castShadow receiveShadow>
          <boxGeometry args={[8, 1, 8]} />
          <meshStandardMaterial color="#DEB887" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-15, 6, -8]} castShadow receiveShadow>
          <boxGeometry args={[6, 1, 10]} />
          <meshStandardMaterial color="#F4A460" />
        </mesh>
      </RigidBody>

      {/* 계단형 발판들 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[25, 1, 5]} castShadow receiveShadow>
          <boxGeometry args={[4, 1, 4]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[25, 2, 10]} castShadow receiveShadow>
          <boxGeometry args={[4, 1, 4]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[25, 3, 15]} castShadow receiveShadow>
          <boxGeometry args={[4, 1, 4]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[25, 4, 20]} castShadow receiveShadow>
          <boxGeometry args={[4, 1, 4]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
      </RigidBody>

      {/* 긴 연결 발판 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 7, -20]} castShadow receiveShadow>
          <boxGeometry args={[15, 1, 4]} />
          <meshStandardMaterial color="#B22222" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-20, 8, -15]} castShadow receiveShadow>
          <boxGeometry args={[8, 1, 12]} />
          <meshStandardMaterial color="#800080" />
        </mesh>
      </RigidBody>
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
            <Platforms />
            <Passive />
          </Physics>
        </Suspense>
      </Canvas>
      <Info />

      <div className={style.helpPanel}>
        <h3>발판 점프 데모 조작법</h3>
        <div className={style.helpContent}>
          <div className={style.helpSection}>
            <h4>발판과 계단:</h4>
            <ul>
              <li><strong>갈색 발판들:</strong> Rapier fixed body로 구현된 점프 가능한 발판</li>
              <li><strong>계단형 발판:</strong> 오른쪽에 있는 단계별 올라갈 수 있는 계단</li>
              <li><strong>높은 발판들:</strong> 점프해서 도달할 수 있는 다양한 높이의 발판</li>
              <li><strong>연결 발판:</strong> 긴 형태의 발판으로 플랫폼 간 이동 가능</li>
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
              <li><strong>스페이스:</strong> 점프 (지면이나 발판에서만 가능)</li>
              <li><strong>Shift:</strong> 달리기 (이동 중에 누르기)</li>
              <li><strong>Z:</strong> 인사</li>
              <li><strong>R:</strong> 탑승 (차량 근처에서)</li>
              <li><strong>F:</strong> 상호작용</li>
              <li><strong>E:</strong> 사용</li>
            </ul>
          </div>
          <div className={style.helpSection}>
            <h4>점프 시스템 특징:</h4>
            <ul>
              <li><strong>발판 점프:</strong> 모든 발판에서 점프 가능</li>
              <li><strong>연속 점프 방지:</strong> 착지 후에만 다시 점프 가능</li>
              <li><strong>물리 기반:</strong> Rapier 물리 엔진으로 자연스러운 점프</li>
              <li><strong>카메라 추적:</strong> 3인칭 카메라가 부드럽게 따라감</li>
              <li><strong>높이 감지:</strong> Y velocity 기반 지면/발판 감지</li>
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
      <div className={style.footerLower}>
        <div className={style.joystickOuter}>
          <MiniMap />
        </div>
      </div>
    </GaesupWorld>
  );
}
