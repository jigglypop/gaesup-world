import { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import {
  CascadedSun,
  createRenderer,
  GaesupController,
  GaesupWorldContent,
  GameplayArea,
  IdleFrameRate,
  InteractionTracker,
  SkyEnvironment,
  WorldPhysics,
  type WorldQuality,
} from 'gaesup-world';
import { BuildingController } from 'gaesup-world/building';

import { SPAWN } from './village';
import { AREAS } from './world';

export type SceneSettings = {
  quality: WorldQuality;
  postProcessing: boolean;
  /** Draw 30 frames a second after two idle seconds. */
  idleThrottle: boolean;
};

/** The island canvas: the player, the village, its residents and the rule engine's trigger areas. */
export function Scene({ quality, postProcessing, idleThrottle }: SceneSettings) {
  return (
    <Canvas shadows="percentage" gl={createRenderer} camera={{ position: [SPAWN[0], 14, SPAWN[2] + 12], fov: 38 }}>
      <color attach="background" args={['#8fd3ee']} />
      {/* Daylight: sky and bounced ground fill, a warm sun, and a small sky map for PBR reflections. */}
      <hemisphereLight args={['#eaf6ff', '#6f8a57', 1.22]} />
      <SkyEnvironment intensity={0.32} />
      <Suspense fallback={null}>
        <GaesupWorldContent quality={quality} postProcessing={postProcessing}>
          <CascadedSun position={[18, 36, 22]} intensity={2.55} color="#fff3da" />
          {idleThrottle && <IdleFrameRate />}
          <WorldPhysics>
            <GaesupController position={SPAWN} materialPolicy="figure" clickToMove />
            <BuildingController />
          </WorldPhysics>
          <InteractionTracker />
          {AREAS.map((area) => <GameplayArea key={area.id} {...area} />)}
        </GaesupWorldContent>
      </Suspense>
    </Canvas>
  );
}
