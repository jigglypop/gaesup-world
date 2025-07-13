import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Grid } from '@react-three/drei';
import { Physics, RigidBody, euler } from "@react-three/rapier";
import { BlueprintPreviewProps } from './types';
import './styles.css';
import { 
  GaesupController, 
  Camera, 
  useGaesupStore, 
  useKeyboard,
  Clicker,
  GroundClicker 
} from '../../../core';
import * as THREE from 'three';
import { CharacterBlueprint } from '../../types';

export function BlueprintPreview({ blueprint }: BlueprintPreviewProps) {
  const setUrls = useGaesupStore((state) => state.setUrls);
  const setCameraOption = useGaesupStore((state) => state.setCameraOption);
  const setMode = useGaesupStore((state) => state.setMode);
  const mode = useGaesupStore((state) => state.mode);
  
  const [cameraDistance, setCameraDistance] = useState(20);
  
  // Type guard for CharacterBlueprint
  const isCharacterBlueprint = (bp: any): bp is CharacterBlueprint => {
    return bp?.type === 'character';
  };
  
  // Get control settings from blueprint
  const enableClickToMove = isCharacterBlueprint(blueprint) ? (blueprint.controls?.clickToMove ?? true) : false;
  const enableKeyboard = isCharacterBlueprint(blueprint) ? (blueprint.controls?.enableKeyboard ?? true) : false;
  const enableMouse = isCharacterBlueprint(blueprint) ? (blueprint.controls?.enableMouse ?? true) : false;
  
  // Enable keyboard controls based on blueprint settings
  useKeyboard(enableKeyboard, enableKeyboard);

  useEffect(() => {
    // Set preview mode
    setMode({
      type: 'character',
      control: isCharacterBlueprint(blueprint) ? (blueprint.camera?.mode || 'thirdPerson') : 'thirdPerson'
    });
    
    // Set camera options from blueprint or defaults
    const cameraConfig = isCharacterBlueprint(blueprint) ? (blueprint.camera || {}) : {};
    setCameraOption({
      xDistance: cameraConfig.distance?.x || cameraDistance,
      yDistance: cameraConfig.distance?.y || cameraDistance * 0.5,
      zDistance: cameraConfig.distance?.z || cameraDistance,
      offset: new THREE.Vector3(0, 0, 0),
      enableCollision: cameraConfig.enableCollision ?? false,
      smoothing: cameraConfig.smoothing || { position: 0.25, rotation: 0.3, fov: 0.2 },
      fov: cameraConfig.fov || 50,
      zoom: 1,
      enableZoom: cameraConfig.enableZoom ?? true,
      zoomSpeed: cameraConfig.zoomSpeed || 0.001,
      minZoom: cameraConfig.minZoom || 0.5,
      maxZoom: cameraConfig.maxZoom || 3.0,
      enableFocus: false,
      maxDistance: 50,
      distance: 10,
      bounds: { minY: 2, maxY: 50 },
    });
  }, [setMode, setCameraOption, cameraDistance, blueprint]);

  useEffect(() => {
    if (isCharacterBlueprint(blueprint)) {
      // Handle legacy model property
      if (blueprint.visuals?.model) {
        setUrls({ characterUrl: blueprint.visuals.model });
      }
      // Handle parts - use the first part as character URL
      else if (blueprint.visuals?.parts && blueprint.visuals.parts.length > 0) {
        const bodyPart = blueprint.visuals.parts.find((p: any) => p.type === 'body');
        if (bodyPart) {
          setUrls({ characterUrl: bodyPart.url });
        }
      }
    }
  }, [blueprint, setUrls]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isCharacterBlueprint(blueprint) && blueprint.camera?.enableZoom === false) return;
      e.preventDefault();
      const delta = e.deltaY * 0.01;
      setCameraDistance(prev => Math.max(10, Math.min(40, prev + delta)));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [blueprint]);

  // Get parts for character
  const getParts = () => {
    if (!isCharacterBlueprint(blueprint) || !blueprint.visuals?.parts) return [];
    
    return blueprint.visuals.parts
      .filter((p: any) => p.type !== 'body')
      .map((p: any) => ({ url: p.url, color: p.color }));
  };

  return (
    <div className="blueprint-preview">
      <Canvas 
        shadows
        camera={{ position: [0, 10, 20], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Camera />
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
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
        
        <Physics debug={false} gravity={[0, -9.81, 0]}>
          {blueprint && mode?.type === 'character' && (
            <GaesupController
              key={`preview-${blueprint.id}`}
              controllerOptions={{ 
                lerp: { 
                  cameraTurn: 0.1, 
                  cameraPosition: 0.08 
                },
                disableKeyboard: !enableKeyboard,
                disableMouse: !enableMouse
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
          {enableClickToMove && (
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
      
      {/* UI Overlay */}
      {blueprint && (
        <div className="blueprint-preview__info">
          <h4 className="blueprint-preview__name">{blueprint.name}</h4>
          <p className="blueprint-preview__type">{blueprint.type}</p>
          {isCharacterBlueprint(blueprint) && blueprint.physics && (
            <div className="blueprint-preview__stats">
              <div>Move Speed: {blueprint.physics.moveSpeed}</div>
              <div>Jump Force: {blueprint.physics.jumpForce}</div>
            </div>
          )}
          <div className="blueprint-preview__controls">
            <div>Camera: {isCharacterBlueprint(blueprint) ? (blueprint.camera?.mode || 'thirdPerson') : 'N/A'}</div>
            <div>Keyboard: {enableKeyboard ? 'Enabled' : 'Disabled'}</div>
            <div>Mouse: {enableMouse ? 'Enabled' : 'Disabled'}</div>
            <div>Click to Move: {enableClickToMove ? 'Enabled' : 'Disabled'}</div>
          </div>
        </div>
      )}
    </div>
  );
} 