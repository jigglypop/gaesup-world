import { useState, useEffect, useRef } from 'react';

import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody, euler } from "@react-three/rapier";
import * as THREE from 'three';

import { Grid } from '@/core/rendering/legacyDrei';

import { BlueprintPreviewProps } from './types';
import './styles.css';
import { 
  GaesupController, 
  Camera, 
  useGaesupStore, 
  Clicker,
  GroundClicker 
} from '../../../core';
import { CAMERA_CONTROLLER_DEFAULT_MODES } from '../../../core/camera/components/CameraController/defaults';
import { GamePad } from '../../../core/interactions/components/Gamepad';
import { getBlueprintModelUrl } from '../../model';
import { AnyBlueprint, CharacterBlueprint } from '../../types';

const isCharacterBlueprint = (
  blueprint: AnyBlueprint | null | undefined,
): blueprint is CharacterBlueprint => blueprint?.type === 'character';

function restorePreviewFields<T extends object>(previous: T, applied: T, current: T): T {
  const restored = { ...current };
  for (const key of Object.keys(applied) as (keyof T)[]) {
    if (Object.is(previous[key], applied[key]) || !Object.is(current[key], applied[key])) continue;
    if (Object.prototype.hasOwnProperty.call(previous, key)) restored[key] = previous[key];
    else delete restored[key];
  }
  return restored;
}

export function BlueprintPreview({ blueprint }: BlueprintPreviewProps) {
  const modelUrl = blueprint ? getBlueprintModelUrl(blueprint) : '';
  if (!isCharacterBlueprint(blueprint) || !modelUrl) {
    return (
      <div className="blueprint-preview blueprint-preview--empty" role="status">
        <strong>{blueprint?.name ?? '미리보기'}</strong>
        <p>{!blueprint
          ? '블루프린트를 선택하면 미리보기가 표시됩니다.'
          : !isCharacterBlueprint(blueprint)
            ? '이 유형의 3D 미리보기는 아직 지원하지 않습니다. 속성은 편집할 수 있습니다.'
            : '몸체 모델을 지정하면 3D 미리보기가 표시됩니다.'}</p>
      </div>
    );
  }
  return <CharacterBlueprintPreview blueprint={blueprint} modelUrl={modelUrl} />;
}

function CharacterBlueprintPreview({ blueprint, modelUrl }: { blueprint: CharacterBlueprint; modelUrl: string }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const setUrls = useGaesupStore((state) => state.setUrls);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const setMode = useGaesupStore((state) => state.setMode);
  const mode = useGaesupStore((state) => state.mode);
  
  const [cameraDistance, setCameraDistance] = useState(20);
  
  // Get control settings from blueprint
  const enableClickToMove = isCharacterBlueprint(blueprint) ? (blueprint.controls?.clickToMove ?? true) : false;
  const enableKeyboard = isCharacterBlueprint(blueprint) ? (blueprint.controls?.enableKeyboard ?? true) : false;
  const enableMouse = isCharacterBlueprint(blueprint) ? (blueprint.controls?.enableMouse ?? true) : false;
  const enableGamepad = blueprint.controls?.enableGamepad ?? false;
  const cameraSettings = blueprint.camera;

  useEffect(() => {
    const { physics, setPhysics } = useGaesupStore.getState();
    const jumpSpeed = blueprint.physics.mass > 0 ? blueprint.physics.jumpForce / blueprint.physics.mass : 0;
    const applied = {
      walkSpeed: blueprint.physics.moveSpeed,
      runSpeed: blueprint.physics.runSpeed,
      jumpSpeed: Number.isFinite(jumpSpeed) ? Math.max(0, jumpSpeed) : 0,
    };
    setPhysics(applied);
    const appliedPhysics = useGaesupStore.getState().physics;
    return () => {
      useGaesupStore.setState((current) => ({
        physics: restorePreviewFields(physics, appliedPhysics, current.physics),
      }));
    };
  }, [blueprint.physics.moveSpeed, blueprint.physics.runSpeed, blueprint.physics.jumpForce, blueprint.physics.mass]);

  useEffect(() => {
    const { mode: previousMode, cameraOption: previousCamera } = useGaesupStore.getState();
    const cameraConfig = cameraSettings ?? {};
    // Set preview mode
    setMode({
      type: 'character',
      controller: enableGamepad ? 'gamepad' : 'keyboard',
      control: cameraConfig.mode || 'thirdPerson'
    });
    
    // Set camera options from blueprint or defaults
    setCameraOption({
      xDistance: cameraConfig.distance?.x ?? cameraDistance,
      yDistance: cameraConfig.distance?.y ?? cameraDistance * 0.5,
      zDistance: cameraConfig.distance?.z ?? cameraDistance,
      offset: new THREE.Vector3(0, 0, 0),
      enableCollision: cameraConfig.enableCollision ?? false,
      smoothing: cameraConfig.smoothing || { position: 0.25, rotation: 0.3, fov: 0.2 },
      fov: cameraConfig.fov || 50,
      zoom: 1,
      enableZoom: cameraConfig.enableZoom ?? true,
      zoomSpeed: cameraConfig.zoomSpeed ?? 0.001,
      minZoom: cameraConfig.minZoom || 0.5,
      maxZoom: cameraConfig.maxZoom || 3.0,
      enableFocus: false,
      maxDistance: 50,
      distance: 10,
      bounds: { minY: 2, maxY: 50 },
    });
    const { mode: appliedMode, cameraOption: appliedCamera } = useGaesupStore.getState();
    return () => {
      const current = useGaesupStore.getState();
      current.setMode(restorePreviewFields(previousMode, appliedMode, current.mode));
      current.replaceCameraOption(restorePreviewFields(previousCamera, appliedCamera, current.cameraOption));
    };
  }, [setMode, setCameraOption, cameraDistance, cameraSettings, enableGamepad]);

  useEffect(() => {
    const previousUrl = useGaesupStore.getState().urls.characterUrl ?? '';
    setUrls({ characterUrl: modelUrl });
    return () => {
      if (useGaesupStore.getState().urls.characterUrl === modelUrl) {
        setUrls({ characterUrl: previousUrl });
      }
    };
  }, [modelUrl, setUrls]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;
    const handleWheel = (e: WheelEvent) => {
      if (!enableMouse || blueprint.camera?.enableZoom === false) return;
      e.preventDefault();
      const delta = e.deltaY * 0.01;
      setCameraDistance(prev => Math.max(10, Math.min(40, prev + delta)));
    };

    preview.addEventListener('wheel', handleWheel, { passive: false });
    return () => preview.removeEventListener('wheel', handleWheel);
  }, [blueprint, enableMouse]);

  // Get parts for character
  const getParts = () => {
    if (!isCharacterBlueprint(blueprint) || !blueprint.visuals?.parts) return [];
    
    return blueprint.visuals.parts
      .filter((part) => part.type !== 'body')
      .map((part) => (part.color ? { url: part.url, color: part.color } : { url: part.url }));
  };

  return (
    <div ref={previewRef} className="blueprint-preview">
      <Canvas 
        shadows
        camera={{ position: [0, 10, 20], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Camera enableMouse={enableMouse} />
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
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
        
        <Physics debug={false} gravity={[0, -9.81, 0]}>
          {blueprint && mode?.type === 'character' && (
            <GaesupController
              enableKeyboard={enableKeyboard}
              key={`preview-${blueprint.id}`}
              controllerOptions={{ 
                lerp: { 
                  cameraTurn: 0.1, 
                  cameraPosition: 0.08 
                }
              }}
              rigidBodyProps={{
                lockRotations: true,
              }}
              parts={getParts()}
              position={[0, 1, 0]}
              rotation={euler({ x: 0, y: Math.PI, z: 0 })}
            />
          )}
          
          {/* Click to move controls */}
          {enableMouse && enableClickToMove && (
            <>
              <Clicker />
              <GroundClicker />
            </>
          )}
          
          {/* Ground */}
          <RigidBody type="fixed">
            <mesh receiveShadow position={[0, -0.5, 0]}>
              <boxGeometry args={[100, 1, 100]} />
              <meshStandardMaterial color="#303030" />
            </mesh>
          </RigidBody>
          
          {/* Grid */}
          <Grid
            renderOrder={-1}
            position={[0, 0.01, 0]}
            infiniteGrid
            cellSize={1}
            cellThickness={0.5}
            cellColor={'#404040'}
            sectionSize={5}
            sectionThickness={1}
            sectionColor={'#606060'}
            fadeDistance={50}
            fadeStrength={1}
            followCamera={false}
            userData={{ intangible: true }}
          />
        </Physics>
      </Canvas>
      {enableGamepad && <div className="blueprint-preview__gamepad" role="group" aria-label="화면 조작 버튼"><GamePad /></div>}
      
      {/* UI Overlay */}
      {blueprint && (
        <div className="blueprint-preview__info">
          <h4 className="blueprint-preview__name">{blueprint.name}</h4>
          {isCharacterBlueprint(blueprint) && blueprint.physics && (
            <div className="blueprint-preview__stats">
              <div>이동 속도: {blueprint.physics.moveSpeed}</div>
              <div>점프 힘: {blueprint.physics.jumpForce}</div>
            </div>
          )}
          <div className="blueprint-preview__controls">
            <div>카메라: {isCharacterBlueprint(blueprint) ? CAMERA_CONTROLLER_DEFAULT_MODES.find((mode) => mode.value === (blueprint.camera?.mode ?? 'thirdPerson'))?.label ?? '사용자 지정' : '해당 없음'}</div>
            <div>키보드: {enableKeyboard ? '켜짐' : '꺼짐'}</div>
            <div>마우스: {enableMouse ? '켜짐' : '꺼짐'}</div>
            <div>클릭 이동: {enableClickToMove ? '켜짐' : '꺼짐'}</div>
          </div>
        </div>
      )}
    </div>
  );
} 
