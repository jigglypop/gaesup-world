import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useGraph } from '@react-three/fiber';
import { Text, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { SkeletonUtils } from 'three-stdlib';
import { PlayerState, MultiplayerConfig } from '../types';

interface RemotePlayerProps {
  playerId: string;
  state: PlayerState;
  characterUrl?: string;
  config?: MultiplayerConfig;
}

export function RemotePlayer({ playerId, state, characterUrl, config }: RemotePlayerProps) {
  const bodyRef = useRef<any>(null);
  const meshRef = useRef<THREE.Group>(null);
  
  // 목표 위치와 회전
  const targetPosition = useRef(new THREE.Vector3());
  const targetRotation = useRef(new THREE.Quaternion());
  const currentVelocity = useRef(new THREE.Vector3());
  
  // URL 가져오기 - props에서 먼저, 없으면 state에서
  const modelUrl = characterUrl || state.modelUrl || '';
  
  // 설정값 가져오기
  const interpolationSpeed = config?.tracking?.interpolationSpeed || 0.15;
  const characterScale = config?.rendering?.characterScale || 0.5;
  const nameTagHeight = config?.rendering?.nameTagHeight || 3.5;
  const nameTagSize = config?.rendering?.nameTagSize || 0.5;
  
  // 모델 로드
  const { scene, animations } = useGLTF(modelUrl);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  const { actions, ref: animationRef } = useAnimations(animations, meshRef);
  
  // 애니메이션 업데이트
  useEffect(() => {
    if (!actions) return;
    
    const animationName = state.animation || 'idle';
    
    // 모든 애니메이션 정지
    Object.values(actions).forEach(action => action?.stop());
    
    // 새 애니메이션 재생
    const action = actions[animationName];
    if (action) {
      action.reset().fadeIn(0.2).play();
    } else {
      // 애니메이션이 없을 경우 대체 처리
      console.log(`Animation '${animationName}' not found for gorani model`)
    }
  }, [state.animation, actions]);

  // 상태 업데이트 시 목표값 설정
  useEffect(() => {
    targetPosition.current.set(
      state.position[0],
      state.position[1], 
      state.position[2]
    );
    
    // W, X, Y, Z 순서로 Quaternion 생성
    targetRotation.current.set(
      state.rotation[1],
      state.rotation[2],
      state.rotation[3],
      state.rotation[0]
    );
    
    // 속도 업데이트
    if (state.velocity) {
      currentVelocity.current.set(
        state.velocity[0],
        state.velocity[1],
        state.velocity[2]
      );
    }
  }, [state.position, state.rotation, state.velocity]);

  // 부드러운 보간
  useFrame((_, delta) => {
    if (!bodyRef.current || !meshRef.current) return;

    // RigidBody의 현재 위치와 회전
    const pos = bodyRef.current.translation();
    const rot = bodyRef.current.rotation();
    
    // 위치 보간
    const newPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    newPos.lerp(targetPosition.current, interpolationSpeed);
    
    // 회전 보간
    const newRot = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
    newRot.slerp(targetRotation.current, interpolationSpeed);

    // RigidBody 업데이트
    bodyRef.current.setTranslation({ x: newPos.x, y: newPos.y, z: newPos.z }, true);
    bodyRef.current.setRotation(newRot, true);
    
    // 움직임 애니메이션 자동 전환
    if (!state.animation && actions) {
      const speed = currentVelocity.current.length();
      if (speed > 0.1) {
        const runAction = actions['run'] || actions['walk'];
        const idleAction = actions['idle'];
        
        if (runAction && idleAction) {
          idleAction.fadeOut(0.2);
          runAction.fadeIn(0.2).play();
        }
      } else {
        const runAction = actions['run'] || actions['walk'];
        const idleAction = actions['idle'];
        
        if (runAction && idleAction) {
          runAction.fadeOut(0.2);
          idleAction.fadeIn(0.2).play();
        }
      }
    }
  });

  return (
    <group>
      <RigidBody
        ref={bodyRef}
        type="kinematicPosition"
        position={state.position}
        colliders={false}
      >
        <CapsuleCollider args={[0.5, 0.5]} position={[0, 1.5, 0]} />
        <group ref={meshRef}>
          <group ref={animationRef} scale={[characterScale, characterScale, characterScale]}>
            <primitive object={clone} />
          </group>
        </group>
      </RigidBody>
      
      {/* 이름표 */}
      <Text
        position={[
          state.position[0],
          state.position[1] + nameTagHeight,
          state.position[2]
        ]}
        fontSize={nameTagSize}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        {state.name}
      </Text>
    </group>
  );
} 