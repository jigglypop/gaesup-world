import React, { memo, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaveEffectProps {
  active?: boolean;
  color?: string;
  intensity?: number;
}

export const WaveEffect = memo(({ 
  active = true, 
  color = "#00ff88", 
  intensity = 0.5 
}: WaveEffectProps) => {
  const waveRefs = useRef<THREE.Mesh[]>([]);
  const waveTimers = useRef<number[]>([]);
  const lastWaveTime = useRef<number>(0);
  
  // 파동 생성 간격 (초)
  const WAVE_INTERVAL = 0.8;
  // 파동 지속 시간 (초)
  const WAVE_DURATION = 2.0;
  // 최대 파동 개수
  const MAX_WAVES = 3;
  
  useFrame((state) => {
    if (!active) return;
    
    const currentTime = state.clock.elapsedTime;
    
    // 새로운 파동 생성
    if (currentTime - lastWaveTime.current > WAVE_INTERVAL) {
      createWave(currentTime);
      lastWaveTime.current = currentTime;
    }
    
    // 기존 파동들 업데이트
    updateWaves(currentTime);
  });
  
  const createWave = (startTime: number) => {
    // 오래된 파동 제거
    if (waveTimers.current.length >= MAX_WAVES) {
      waveTimers.current.shift();
    }
    
    waveTimers.current.push(startTime);
  };
  
  const updateWaves = (currentTime: number) => {
    // 만료된 파동 제거
    waveTimers.current = waveTimers.current.filter(
      startTime => currentTime - startTime < WAVE_DURATION
    );
  };
  
  const getWaveProps = (startTime: number, currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = elapsed / WAVE_DURATION;
    
    // 파동 크기 (0에서 2까지 확장)
    const scale = progress * 2;
    
    // 파동 투명도 (1에서 0으로 감소)
    const opacity = Math.max(0, 1 - progress);
    
    return { scale, opacity };
  };

  return (
    <group>
      {waveTimers.current.map((startTime, index) => {
        const { scale, opacity } = getWaveProps(startTime, Date.now() / 1000);
        
        return (
          <mesh
            key={`wave-${startTime}`}
            ref={el => {
              if (el) waveRefs.current[index] = el;
            }}
            position={[0, 0.05, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[scale, scale, 1]}
          >
            <ringGeometry args={[0.8, 1.0, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={intensity * opacity}
              transparent
              opacity={opacity * 0.6}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}); 