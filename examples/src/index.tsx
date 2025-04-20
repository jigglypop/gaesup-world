'use client';

import { Environment } from '@react-three/drei';
import { Physics, euler } from '@react-three/rapier';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { GaesupController, GaesupWorld, GamePad, V3 } from '../../src';
import { Clicker } from '../../src/tools/clicker';
import { InnerHtml } from '../../src/utils/innerHtml';
import Info from '../info';
import Passive from '../passive';
import Floor from './Floor';
import * as style from './style.css';
import DirectMiniMap from './DirectMiniMap';
import DemoObjects from './DemoObjects';

export const S3 = 'https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/gltf';
export const keyBoardMap = [
  { name: 'forward', keys: ['ArrowUp'] },
  { name: 'backward', keys: ['ArrowDown'] },
  { name: 'leftward', keys: ['ArrowLeft'] },
  { name: 'rightward', keys: ['ArrowRight'] },
  { name: 'space', keys: ['Space'], label: 'JUMP' },
  { name: 'shift', keys: ['Shift'], label: 'SPLINT' },
  { name: 'keyZ', keys: ['KeyZ'], label: 'GREET' },
  { name: 'keyR', keys: ['KeyR'], label: 'RIDE' },
  { name: 'keyS', keys: ['KeyS'], label: 'STOP' },
];

function CameraRotationTest() {
  const rotationRef = useRef({ time: 0 });
  
  useFrame((state, delta) => {
    rotationRef.current.time += delta * 0.2; 
  });
  
  return null; 
}

export default function MainComponent() {
  const CHARACTER_URL = 'gltf/ally_body.glb';
  const AIRPLANE_URL = S3 + '/gaebird.glb';
  const VEHICLE_URL = S3 + '/gorani.glb';

  const [cameraOption, setCameraOption] = useState({
    XDistance: 20,
    YDistance: 20,
    ZDistance: 20,
  });
  

  const [rotationAngle, setRotationAngle] = useState(Math.PI * 1.5); 
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.5;
  const ZOOM_SPEED = 0.1;
  
  // 카메라 회전 핸들러
  const handleRotation = (angle) => {
    setRotationAngle(angle);
    
    // 카메라 위치 계산 (원형 궤도)
    updateCameraPosition(angle, zoomLevel);
  };
  
  // 카메라 위치 업데이트 함수
  const updateCameraPosition = (angle, zoom) => {
    const baseDistance = Math.sqrt(400 + 400); // 20^2 + 20^2의 제곱근
    const distance = baseDistance / zoom;
    const xDistance = distance * Math.sin(angle);
    const zDistance = distance * Math.cos(angle);
 
    setCameraOption({
      XDistance: xDistance,
      YDistance: 20 / zoom, // Y 거리도 줌 레벨에 따라 조정
      ZDistance: zDistance,
      rotationY: angle,
    });
    
    console.log('카메라 업데이트:', {
      angle: angle.toFixed(2),
      zoom: zoom.toFixed(2),
      distance: distance.toFixed(2),
    });
  };
  
  // 마우스 휠 핸들러
  const handleWheel = (e) => {
    let newZoom = zoomLevel;
    if (e.deltaY < 0) {
      newZoom = Math.min(MAX_ZOOM, zoomLevel + ZOOM_SPEED);
    } else {
      newZoom = Math.max(MIN_ZOOM, zoomLevel - ZOOM_SPEED);
    }

    setZoomLevel(newZoom);
    updateCameraPosition(rotationAngle, newZoom);
  
  };

  const [enableCameraRotation, setEnableCameraRotation] = useState(false);
  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [zoomLevel, rotationAngle]); // 줌 레벨과 회전 각도가 변경될 때마다 핸들러 업데이트
  
  const buttonStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '10px 20px',
    background: '#333',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    zIndex: 1000,
  } as React.CSSProperties;
  
  // 줌 레벨 디스플레이 스타일
  const zoomDisplayStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    padding: '10px 20px',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    zIndex: 1000,
  } as React.CSSProperties;
  
  // 외부 미니맵 스타일
  const externalMiniMapStyle = {
    position: 'fixed',
    bottom: '30px',
    left: '30px',
    zIndex: 1000,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'block',
    width: '200px',
    height: '200px',
  } as React.CSSProperties;

  return (
    <>
      <button 
        style={buttonStyle}
        onClick={() => setEnableCameraRotation(!enableCameraRotation)}
      >
        {enableCameraRotation ? '카메라 회전 중지' : '카메라 회전 시작'}
      </button>
      
      {/* 줌 레벨 표시 */}
      <div style={zoomDisplayStyle}>
        줌 레벨: {zoomLevel.toFixed(2)}x
      </div>
      
      <div style={externalMiniMapStyle}>
        <DirectMiniMap 
          onRotate={handleRotation}
          currentAngle={rotationAngle}
        />
      </div>

      
      <GaesupWorld
        urls={{
          characterUrl: CHARACTER_URL,
          vehicleUrl: VEHICLE_URL,
          airplaneUrl: AIRPLANE_URL,
        }}
        mode={{
          type: 'character',
          controller: 'clicker',
          control: 'normal',
        }}
        debug={false}
        cameraOption={cameraOption}
        keyMap={keyBoardMap}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{
            position: [0, 10, 20],
            fov: 45,
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
                    cameraPosition: 1,
                  },
                }}
                rigidBodyProps={{}}
                parts={[{ url: 'gltf/ally_cloth_rabbit.glb', color: '#ffe0e0' }]}
              >


              </GaesupController>
              <Floor />
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
              <DemoObjects />
            </Physics>
          </Suspense>
        </Canvas>
        <Info />

        <div className={style.footerUpper}>
          <div className={style.gamePad} style={{position: 'fixed', bottom: '20px', right: '20px', zIndex: 10000}}>
            <GamePad
              label={{
                space: 'JUMP',
                shift: 'SPLINT',
                keyZ: 'GREET',
                keyR: 'RIDE',
                keyS: 'STOP'
              }}
              gamePadStyle={{
                background: 'rgba(0,0,0,0.5)',
                padding: '10px',
                borderRadius: '10px',
                border: '2px solid yellow',
                zIndex: 10000
              }}
              gamePadButtonStyle={{
                background: 'rgba(255,255,255,0.7)',
                margin: '5px',
                padding: '10px',
                borderRadius: '5px',
                color: 'black',
                fontWeight: 'bold'
              }}
            />
          </div>
        </div>
      </GaesupWorld>
    </>
  );
}
