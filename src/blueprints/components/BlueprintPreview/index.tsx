import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { BlueprintPreviewProps } from './types';
import './styles.css';
import { CHARACTER_URL } from '../../../../examples/config/constants';

function cloneScene(scene: THREE.Group) {
  const clonedScene = scene.clone(true);
  const skinnedMeshes: Record<string, THREE.SkinnedMesh> = {};

  scene.traverse(node => {
    if (node instanceof THREE.SkinnedMesh) {
      skinnedMeshes[node.name] = node;
    }
  });

  clonedScene.traverse(node => {
    if (node instanceof THREE.SkinnedMesh && skinnedMeshes[node.name]) {
      const originalSkinnedMesh = skinnedMeshes[node.name];
      const newSkinnedMesh = node as THREE.SkinnedMesh;
      newSkinnedMesh.skeleton = originalSkinnedMesh.skeleton;
    }
  });

  return clonedScene;
}

function PreviewModel({ blueprint }: { blueprint: any }) {
  const group = useRef<THREE.Group>(null);
  
  if (!blueprint) return null;

  if (blueprint.type === 'character') {
    return <CharacterPreview blueprint={blueprint} group={group} />;
  } else if (blueprint.type === 'vehicle') {
    return <VehiclePreview blueprint={blueprint} group={group} />;
  } else if (blueprint.type === 'airplane') {
    return <AirplanePreview blueprint={blueprint} group={group} />;
  }
  
  return null;
}

function CharacterPreview({ blueprint, group }: { blueprint: any; group: React.RefObject<THREE.Group> }) {
  const { scene: characterScene, animations } = useGLTF(CHARACTER_URL);
  const { scene: clothingScene } = useGLTF('gltf/ally_cloth_rabbit.glb');

  const characterModel = useMemo(() => cloneScene(characterScene), [characterScene]);
  const clothingModel = useMemo(() => cloneScene(clothingScene), [clothingScene]);
  
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions?.idle) {
      actions.idle.reset().play();
    }
    return () => {
      if (actions?.idle) {
        actions.idle.stop();
      }
    };
  }, [actions, blueprint]);

  useEffect(() => {
    if (characterModel && clothingModel) {
      const characterSkeleton = (characterModel.children[0] as THREE.SkinnedMesh)?.parent?.children.find(
        (child) => child instanceof THREE.SkeletonHelper
      )?.parent?.children.find((child) => (child as THREE.SkinnedMesh).isSkinnedMesh) as THREE.SkinnedMesh | undefined;

      if(characterSkeleton) {
        clothingModel.traverse((object) => {
          if ((object as THREE.SkinnedMesh).isSkinnedMesh) {
            (object as THREE.SkinnedMesh).bind(characterSkeleton.skeleton, characterSkeleton.matrixWorld);
          }
        });
        if (group.current) {
          group.current.add(clothingModel);
        }
      }
    }
  }, [characterModel, clothingModel]);
  
  return (
    <Suspense fallback={null}>
      <group ref={group}>
        <primitive object={characterModel} scale={1.5} position-y={0} />
      </group>
    </Suspense>
  );
}

function VehiclePreview({ blueprint, group }: { blueprint: any; group: React.RefObject<THREE.Group> }) {
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={group}>
      <mesh scale={[2, 1, 1.5]} position-y={0.5}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh scale={[0.8, 0.8, 0.8]} position={[-1.2, 0.4, 1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh scale={[0.8, 0.8, 0.8]} position={[1.2, 0.4, 1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh scale={[0.8, 0.8, 0.8]} position={[-1.2, 0.4, -1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh scale={[0.8, 0.8, 0.8]} position={[1.2, 0.4, -1]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function AirplanePreview({ blueprint, group }: { blueprint: any; group: React.RefObject<THREE.Group> }) {
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.005;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3 + 1;
    }
  });

  return (
    <group ref={group}>
      <mesh scale={[3, 0.5, 0.5]} position-y={0}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4ecdc4" />
      </mesh>
      <mesh scale={[0.2, 0.2, 2]} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4ecdc4" />
      </mesh>
      <mesh scale={[2, 0.1, 0.5]} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#45b7aa" />
      </mesh>
      <mesh scale={[0.5, 0.1, 1]} position={[0, 0, -1.5]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#45b7aa" />
      </mesh>
    </group>
  );
}

export function BlueprintPreview({ blueprint }: BlueprintPreviewProps) {
  return (
    <div className="blueprint-preview">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="sunset" />
        
        <Grid 
          args={[10, 10]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#6e6e6e" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#9e9e9e" 
          fadeDistance={20} 
          fadeStrength={1} 
          followCamera={false} 
        />
        
        {blueprint && <PreviewModel blueprint={blueprint} />}
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
      
      {blueprint && (
        <div className="blueprint-preview__info">
          <h4 className="blueprint-preview__name">{blueprint.name}</h4>
          <p className="blueprint-preview__type">{blueprint.type}</p>
          {blueprint.physics && (
            <div className="blueprint-preview__stats">
              <div className="blueprint-preview__stat">
                <span>Mass:</span>
                <span>{blueprint.physics.mass}kg</span>
              </div>
              {blueprint.physics.maxSpeed && (
                <div className="blueprint-preview__stat">
                  <span>Max Speed:</span>
                  <span>{blueprint.physics.maxSpeed}m/s</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 