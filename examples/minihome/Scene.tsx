import { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import {
  CascadedSun,
  ContactShadows,
  createRenderer,
  GaesupController,
  GaesupWorldContent,
  GameplayArea,
  hexToLinearRgb,
  IdleFrameRate,
  InteractionTracker,
  LightingZone,
  Nameplates,
  SkyEnvironment,
  useRendererRecovery,
  WorldGi,
  WorldPhysics,
  type GiEnvironment,
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
/** Daylight from the sky and the grass it bounces off; world GI takes this over when it is on. */
const SKY = { color: '#eaf6ff', ground: '#6f8a57', intensity: 1.22 };
const scaled = (hex: string) => hexToLinearRgb(hex).map((channel) => channel * SKY.intensity) as [number, number, number];
const GI_SKY: Partial<GiEnvironment> = {
  skyZenith: scaled(SKY.color),
  skyHorizon: scaled('#c4d9d0'),
  skyGround: scaled(SKY.ground),
};
/**
 * Cinematic lighting on WebGPU devices: the world GI probes bounce the sun and sky off the island, and the post-process
 * adds reflections and contact shadows. Its own screen-space GI stays off so the bounce is not counted twice.
 */
const CINEMATIC = { quality: 'cinematic', globalIllumination: false } as const;

export type SceneSettings = {
  quality: WorldQuality;
  postProcessing: boolean;
  /** With post-processing on, light the island with bounced light and reflections (`cinematic` preset). */
  cinematic?: boolean;
  /** Draw 30 frames a second after two idle seconds. */
  idleThrottle: boolean;
  /** What hides the player turns see-through instead of pulling the camera in front of it (on when unset). */
  cameraFade?: boolean;
};

/** The island canvas: the player, the village, its residents and the rule engine's trigger areas. */
export function Scene({ quality, postProcessing, cinematic, idleThrottle }: SceneSettings) {
  // A lost GPU device remounts the canvas with a fresh renderer; the island's state lives outside it.
  const canvasKey = useRendererRecovery();
  const worldGi = postProcessing && !!cinematic;
  return (
    <Canvas key={canvasKey} shadows="percentage" gl={createRenderer} camera={{ position: [SPAWN[0], 14, SPAWN[2] + 12], fov: 38 }}>
      <color attach="background" args={['#8fd3ee']} />
      {/* Daylight: sky and bounced ground fill, a warm sun, and a small sky map for PBR reflections. */}
      <hemisphereLight args={[SKY.color, SKY.ground, worldGi ? 0 : SKY.intensity]} />
      <SkyEnvironment intensity={0.32} />
      <Suspense fallback={null}>
        <GaesupWorldContent quality={quality} postProcessing={postProcessing && (cinematic ? CINEMATIC : true)}>
          <CascadedSun position={[18, 36, 22]} intensity={2.55} color="#fff3da" />
          {worldGi && <WorldGi environment={GI_SKY} />}
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
