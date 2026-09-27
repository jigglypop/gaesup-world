import { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import {
  CascadedSun,
  ContactShadows,
  createRenderer,
  GaesupController,
  GaesupWorldContent,
  GameplayArea,
  IdleFrameRate,
  InteractionTracker,
  LightingZone,
  Nameplates,
  SkyEnvironment,
  WorldPhysics,
  type LightingProfile,
  type WorldQuality,
} from 'gaesup-world';
import { BuildingController } from 'gaesup-world/building';

import { SPAWN } from './village';
import { AREAS } from './world';

const MINIROOM = AREAS.find((area) => area.id === 'miniroom')!;
/** Inside the miniroom most daylight stays out; a warm fill and the ceiling lamp light the room. */
const ROOM_LIGHT: LightingProfile = { sun: 0.3, fill: 0.72, sky: '#ffe8d2', ground: '#8a6d58', environment: 0.45 };
const ROOM_LAMP = { color: '#ffcf8f', intensity: 9, distance: 10, height: 3 };

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
          <LightingZone center={MINIROOM.center} size={MINIROOM.size} profile={ROOM_LIGHT} lamp={ROOM_LAMP} />
          <ContactShadows />
          <Nameplates />
        </GaesupWorldContent>
      </Suspense>
    </Canvas>
  );
}
