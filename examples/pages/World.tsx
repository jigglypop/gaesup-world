import React, { Suspense, useEffect, useState } from 'react';

import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { WorldPageProps } from './types';
import {
  Billboard, BugSpot,
  BuildingController, CatalogUI, Clicker, CraftingUI, CropPlot, DialogBox, Editor,
  FishSpot, Fire, GaesupController, GaesupWorld, GrassDriver,
  GaesupWorldContent, GroundClicker, HotbarUI, HousePlot, InteractionPrompt,
  InteractionTracker, InventoryUI,
  MailboxUI, MiniMap, QuestLogUI, SakuraBatch, SandBatch, ShopUI, Snow, SnowfieldBatch,
  ToastHost, ToolUseController, TreeObject, Water,
  WeatherEffect,
  CharacterCreator, ColorGrade, DynamicFog, DynamicSky, Footprints, Footsteps, HouseDoor, OutfitAvatar, SceneRoot,
  RoomPortal, RoomRoot, RoomVisibilityDriver,
  TouchControls, useSceneStore,
  getNPCScheduler, getSaveSystem, registerSeedCrops, registerSeedEvents, registerSeedItems,
  setDefaultToonMode,
  useAmbientBgm, useAutoSave, useCatalogStore, useCatalogTracker, useCharacterStore,
  useCraftingStore, useDayChange,
  useDecorationScore, useEventsStore, useEventsTicker, useFriendshipStore, useGameClock,
  useHotbarKeyboard, useI18nStore, useInventoryStore, useMailStore,
  usePerfStore, usePlotStore, useQuestObjectiveTracker, useQuestStore, useShopStore,
  useTimeStore, useTownStore,
  useWalletStore, useWeatherStore, useWeatherTicker, useAudioStore,
  usePlayerPosition, useStateSystem, SpeechBalloon,
  type CameraOptionType, type SakuraTreeEntry, type SandEntry, type SnowfieldEntry,
  useBuildingStore, useGaesupStore,
} from '../../src';
import { registerSeedDialogs } from '../components/dialog/seedDialogs';
import { HudShell } from '../components/hud/HudShell';
import { registerSeedI18n } from '../components/i18n/seedI18n';
import { NPCBeacon } from '../components/npc/NPCBeacon';
import { Pickup } from '../components/pickup';
import { registerSeedContent } from '../components/seedContent';
import { AIRPLANE_URL, CHARACTER_URL, EXAMPLE_CONFIG, S3, VEHICLE_URL } from '../config/constants';
import '../style.css';

registerSeedItems();
registerSeedDialogs();
registerSeedContent();
registerSeedCrops();
registerSeedEvents();
registerSeedI18n();

if (typeof window !== 'undefined') {
  usePerfStore.getState().detect();
}

// NPC daily schedules — Tommy hangs at shop / sleeps at home; Mei wanders meadow; Ryu near workbench
getNPCScheduler().register({
  npcId: 'tommy',
  defaultEntry: { position: [0, 0, -8], activity: 'idle' },
  entries: [
    { startHour: 6,  endHour: 9,  position: [-2, 0, -8],  activity: 'idle'  },
    { startHour: 9,  endHour: 18, position: [0, 0, -8],   activity: 'shop'  },
    { startHour: 18, endHour: 22, position: [4, 0, -6],   activity: 'idle'  },
    { startHour: 22, endHour: 6,  position: [-1, 0, -10], activity: 'sleep' },
  ],
});
getNPCScheduler().register({
  npcId: 'mei',
  defaultEntry: { position: [6, 0, 0], activity: 'idle' },
  entries: [
    { startHour: 7,  endHour: 11, position: [6, 0, 0],   activity: 'idle'  },
    { startHour: 11, endHour: 16, position: [10, 0, 14], activity: 'work'  },
    { startHour: 16, endHour: 21, position: [6, 0, 0],   activity: 'idle'  },
    { startHour: 21, endHour: 7,  position: [4, 0, -2],  activity: 'sleep' },
  ],
});
getNPCScheduler().register({
  npcId: 'ryu',
  defaultEntry: { position: [-6, 0, 0], activity: 'idle' },
  entries: [
    { startHour: 8,  endHour: 19, position: [-6, 0, 0],  activity: 'work'  },
    { startHour: 19, endHour: 23, position: [-4, 0, 4],  activity: 'idle'  },
    { startHour: 23, endHour: 8,  position: [-7, 0, -2], activity: 'sleep' },
  ],
});

export { S3 };

// Kept for documentation: this is the "rich" camera option shape used
// elsewhere in the codebase. The simpler shape consumed by `<GaesupWorld>`
// is provided inline at the call site.
export const RICH_CAMERA_OPTION: CameraOptionType = {
  xDistance: -7, yDistance: 10, zDistance: -13,
  offset: new THREE.Vector3(0, 0, 0),
  enableCollision: true,
  smoothing: { position: 0.25, rotation: 0.3, fov: 0.2 },
  fov: 75, zoom: 1,
  enableZoom: true, zoomSpeed: 0.001, minZoom: 0.5, maxZoom: 2.0,
  enableFocus: true, focusDistance: 15, focusDuration: 1, focusLerpSpeed: 5.0,
  maxDistance: 50, distance: 10, bounds: { minY: 2, maxY: 50 },
};

const TOON_STORAGE_KEY = 'gaesup:toonMode';
const DEFAULT_WORLD_TIME_MINUTES = 18 * 60;
const WORLD_WEATHER_ENABLED = false;
const _initialToon = (() => {
  if (typeof window === 'undefined') return true;
  const v = window.localStorage.getItem(TOON_STORAGE_KEY);
  return v === null ? true : v === '1';
})();
setDefaultToonMode(_initialToon);

const SAKURA_TREES: SakuraTreeEntry[] = [
  { position: [-22, 0, -10], size: 4.4, blossomColor: '#ffb6c1' },
  { position: [22, 0, -8], size: 4.0, blossomColor: '#ffc4d6' },
  { position: [-26, 0, 6], size: 4.8, blossomColor: '#ffb0c8' },
  { position: [26, 0, 10], size: 4.0, blossomColor: '#ffd0e0' },
  { position: [-18, 0, 22], size: 3.6, blossomColor: '#ffc8db' },
  { position: [18, 0, 24], size: 4.4, blossomColor: '#ffb6c1' },
  { position: [-30, 0, -22], size: 3.2, blossomColor: '#ffc4d6' },
  { position: [30, 0, -20], size: 3.6, blossomColor: '#ffb0c8' },
  { position: [-12, 0, -28], size: 3.2, blossomColor: '#ffd0e0' },
  { position: [14, 0, -26], size: 4.0, blossomColor: '#ffb6c1' },
];

const SAND_TILES: SandEntry[] = [
  { position: [40, 0, 0], size: 6 },
  { position: [46, 0, 0], size: 6 },
  { position: [40, 0, 6], size: 6 },
  { position: [46, 0, 6], size: 6 },
  { position: [40, 0, -6], size: 6 },
  { position: [46, 0, -6], size: 6 },
];

const SNOWFIELD_TILES: SnowfieldEntry[] = [
  { position: [-40, 0, 0], size: 6 },
  { position: [-46, 0, 0], size: 6 },
  { position: [-40, 0, 6], size: 6 },
  { position: [-46, 0, 6], size: 6 },
  { position: [-40, 0, -6], size: 6 },
  { position: [-46, 0, -6], size: 6 },
];

const CAMP_FIRES: Array<[number, number, number]> = [
  [8, 0.2, 8],
  [-8, 0.2, -8],
];

const CHOPPABLE_TREES: Array<{
  id: string;
  pos: [number, number, number];
  trunk?: string;
  foliage?: string;
  scale?: number;
}> = [
  { id: 'oak-1', pos: [10, 0, -14], trunk: '#6b4a2a', foliage: '#3f8a3a', scale: 1.0 },
  { id: 'oak-2', pos: [-10, 0, -16], trunk: '#6b4a2a', foliage: '#4ea052', scale: 1.1 },
  { id: 'oak-3', pos: [16, 0, 4], trunk: '#5d3f24', foliage: '#3a8a3a', scale: 1.2 },
  { id: 'oak-4', pos: [-16, 0, 4], trunk: '#5d3f24', foliage: '#65a558', scale: 0.9 },
  { id: 'pine-1', pos: [-32, 0, 18], trunk: '#4a3220', foliage: '#2e6e3a', scale: 1.3 },
  { id: 'pine-2', pos: [32, 0, 16], trunk: '#4a3220', foliage: '#2e6e3a', scale: 1.4 },
];

const NPCS: Array<{
  id: string;
  name: string;
  pos: [number, number, number];
  color?: string;
  hatColor?: string;
  dialogTreeId: string;
  isShopkeeper?: boolean;
  isCraftsman?: boolean;
}> = [
  { id: 'tommy', name: '토미', pos: [0, 0, -8], color: '#f5d199', hatColor: '#a85a5a', dialogTreeId: 'npc.shopkeeper', isShopkeeper: true },
  { id: 'mei',   name: '메이', pos: [6, 0, 0],  color: '#ffe4c8', hatColor: '#5a8acf', dialogTreeId: 'npc.villager' },
  { id: 'ryu',   name: '류',   pos: [-6, 0, 0], color: '#ffd0b8', hatColor: '#3a8a3a', dialogTreeId: 'npc.craftsman', isCraftsman: true },
];

const FISH_SPOTS: Array<[number, number, number]> = [
  [55, 0.06, 4],
  [55, 0.06, -4],
  [50, 0.06, 0],
];

const BUG_SPOTS: Array<[number, number, number]> = [
  [-22, 0, -10],
  [22, 0, -8],
  [0, 0, 50],
];

const CROP_PLOTS: Array<{ id: string; pos: [number, number, number] }> = [
  { id: 'plot-a', pos: [12, 0, 12] },
  { id: 'plot-b', pos: [13.6, 0, 12] },
  { id: 'plot-c', pos: [12, 0, 13.6] },
  { id: 'plot-d', pos: [13.6, 0, 13.6] },
  { id: 'plot-e', pos: [10.4, 0, 12] },
  { id: 'plot-f', pos: [10.4, 0, 13.6] },
];

const HOUSE_PLOTS: Array<{ id: string; pos: [number, number, number] }> = [
  { id: 'house-1', pos: [-18, 0, 18] },
  { id: 'house-2', pos: [-12, 0, 18] },
  { id: 'house-3', pos: [-6,  0, 18] },
];

const PICKUPS: Array<{ id: string; itemId: string; count: number; pos: [number, number, number] }> = [
  { id: 'apple-1', itemId: 'apple', count: 1, pos: [3, 0, 3] },
  { id: 'apple-2', itemId: 'apple', count: 1, pos: [-3, 0, 3] },
  { id: 'apple-3', itemId: 'apple', count: 1, pos: [0, 0, 5] },
  { id: 'wood-1', itemId: 'wood', count: 2, pos: [-20, 0, -10] },
  { id: 'wood-2', itemId: 'wood', count: 2, pos: [20, 0, -8] },
  { id: 'flower-1', itemId: 'flower-pink', count: 1, pos: [4, 0, -4] },
  { id: 'shell-1', itemId: 'shell', count: 1, pos: [44, 0, 2] },
  { id: 'stone-1', itemId: 'stone', count: 1, pos: [-44, 0, -2] },
];

function Lighting() {
  return (
    <>
      <Environment background preset="sunset" backgroundBlurriness={1} />
      <DynamicSky rigDistance={60} shadowMapSize={1024} />
    </>
  );
}

function Ground() {
  return (
    <>
      <Grid
        renderOrder={-1}
        position={[0, -0.005, 0]}
        infiniteGrid
        cellSize={2}
        cellThickness={1}
        cellColor="#1d1d1d"
        sectionSize={5}
        sectionThickness={0}
        fadeDistance={400}
        fadeStrength={3}
        userData={{ intangible: true }}
      />
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -1.01, 0]}>
          <boxGeometry args={[1000, 2, 1000]} />
          <meshStandardMaterial color="#3d3d3d" polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
        </mesh>
      </RigidBody>
    </>
  );
}

function HomeInterior({ returnPosition }: { returnPosition: [number, number, number] }) {
  // Split the home into three compact rooms so indoor portal visibility can
  // cull furniture/floors that are not near the player or a visible doorway.
  return (
    <>
      {/* Outer shell */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.4, -4]} castShadow receiveShadow>
          <boxGeometry args={[8, 2.8, 0.2]} />
          <meshStandardMaterial color="#f0e0c8" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-4, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 2.8, 8]} />
          <meshStandardMaterial color="#f0e0c8" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[4, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 2.8, 8]} />
          <meshStandardMaterial color="#f0e0c8" />
        </mesh>
      </RigidBody>

      {/* Divider walls with centered portal openings */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-2.55, 1.4, 1.2]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 2.8, 0.2]} />
          <meshStandardMaterial color="#ead8bf" />
        </mesh>
        <mesh position={[2.55, 1.4, 1.2]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 2.8, 0.2]} />
          <meshStandardMaterial color="#ead8bf" />
        </mesh>
        <mesh position={[-2.55, 1.4, -1.4]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 2.8, 0.2]} />
          <meshStandardMaterial color="#ead8bf" />
        </mesh>
        <mesh position={[2.55, 1.4, -1.4]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 2.8, 0.2]} />
          <meshStandardMaterial color="#ead8bf" />
        </mesh>
      </RigidBody>

      <RoomPortal
        id="home-foyer-living"
        sceneId="home-interior"
        fromRoomId="home-foyer"
        toRoomId="home-living"
        position={[0, 1.1, 1.2]}
        revealDistance={3.1}
      />
      <RoomPortal
        id="home-living-studio"
        sceneId="home-interior"
        fromRoomId="home-living"
        toRoomId="home-studio"
        position={[0, 1.1, -1.4]}
        revealDistance={3.1}
      />

      <RoomRoot
        sceneId="home-interior"
        roomId="home-foyer"
        bounds={{ min: [-3.9, -0.2, 1.2], max: [3.9, 3.2, 4.0] }}
      >
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0, 2.6]} receiveShadow>
            <boxGeometry args={[8, 0.2, 2.8]} />
            <meshStandardMaterial color="#caa57a" roughness={0.85} />
          </mesh>
        </RigidBody>
        <mesh position={[-2.4, 0.35, 3.0]} castShadow>
          <boxGeometry args={[1.1, 0.6, 0.8]} />
          <meshStandardMaterial color="#8f5b39" />
        </mesh>
        <mesh position={[2.3, 0.5, 2.7]} castShadow>
          <cylinderGeometry args={[0.45, 0.55, 0.9, 18]} />
          <meshStandardMaterial color="#d7c7a2" />
        </mesh>
        <HouseDoor
          position={[0, 0.05, 3.6]}
          sceneId="outdoor"
          entry={{ position: returnPosition, rotationY: 0 }}
          color="#ffd24a"
          radius={1}
          label="EXIT"
        />
      </RoomRoot>

      <RoomRoot
        sceneId="home-interior"
        roomId="home-living"
        bounds={{ min: [-3.9, -0.2, -1.4], max: [3.9, 3.2, 1.2] }}
      >
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0, -0.1]} receiveShadow>
            <boxGeometry args={[8, 0.2, 2.6]} />
            <meshStandardMaterial color="#caa57a" roughness={0.85} />
          </mesh>
        </RigidBody>
        <mesh position={[1.9, 0.45, -0.2]} castShadow>
          <boxGeometry args={[2.1, 0.8, 1.1]} />
          <meshStandardMaterial color="#7a4a2a" />
        </mesh>
        <mesh position={[-2.1, 0.3, 0.2]} castShadow>
          <boxGeometry args={[1.3, 0.5, 1.0]} />
          <meshStandardMaterial color="#9a6a43" />
        </mesh>
      </RoomRoot>

      <RoomRoot
        sceneId="home-interior"
        roomId="home-studio"
        bounds={{ min: [-3.9, -0.2, -4.0], max: [3.9, 3.2, -1.4] }}
      >
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0, -2.7]} receiveShadow>
            <boxGeometry args={[8, 0.2, 2.6]} />
            <meshStandardMaterial color="#caa57a" roughness={0.85} />
          </mesh>
        </RigidBody>
        <mesh position={[2.4, 0.4, -2.8]} castShadow>
          <boxGeometry args={[1.6, 0.7, 1.2]} />
          <meshStandardMaterial color="#7a4a2a" />
        </mesh>
        <mesh position={[-2.6, 0.25, -2.6]} castShadow>
          <boxGeometry args={[1.0, 0.45, 1.0]} />
          <meshStandardMaterial color="#a05030" />
        </mesh>
        <mesh position={[0, 0.85, -3.2]} castShadow>
          <boxGeometry args={[2.1, 1.5, 0.45]} />
          <meshStandardMaterial color="#c8d4e5" />
        </mesh>
      </RoomRoot>
    </>
  );
}

function Scenery({ onOpenShop, onOpenCrafting }: { onOpenShop: () => void; onOpenCrafting: () => void }) {
  return (
    <>
      <SakuraBatch trees={SAKURA_TREES} />

      {CHOPPABLE_TREES.map((t) => (
        <TreeObject
          key={t.id}
          id={t.id}
          position={t.pos}
          {...(t.trunk !== undefined ? { trunkColor: t.trunk } : {})}
          {...(t.foliage !== undefined ? { foliageColor: t.foliage } : {})}
          {...(t.scale !== undefined ? { scale: t.scale } : {})}
        />
      ))}

      {NPCS.map((n) => (
        <NPCBeacon
          key={n.id}
          id={n.id}
          name={n.name}
          position={n.pos}
          dialogTreeId={n.dialogTreeId}
          {...(n.color !== undefined ? { color: n.color } : {})}
          {...(n.hatColor !== undefined ? { hatColor: n.hatColor } : {})}
          {...(n.isShopkeeper ? { onOpenShop } : {})}
          {...(n.isCraftsman ? { onCustomEffect: (key: string) => { if (key === 'openCrafting') onOpenCrafting(); } } : {})}
        />
      ))}

      {FISH_SPOTS.map((p, i) => (
        <FishSpot key={`fish-${i}`} position={p} />
      ))}
      {BUG_SPOTS.map((p, i) => (
        <BugSpot key={`bug-${i}`} position={p} />
      ))}

      {CROP_PLOTS.map((p) => (
        <CropPlot key={p.id} id={p.id} position={p.pos} />
      ))}

      <group position={[12, 0.06, 13]}>
        <Billboard text="Farm" width={2.4} height={0.9} color="#fff7e0" toon />
      </group>

      {HOUSE_PLOTS.map((h) => (
        <HousePlot key={h.id} id={h.id} position={h.pos} size={[3.2, 3.2]} />
      ))}

      <SceneRoot scene={{ id: 'outdoor', name: 'Town', interior: false }}>
        {/* Door pad next to the first plot opens the player's home interior. */}
        <HouseDoor
          position={[HOUSE_PLOTS[0]?.pos[0] ?? -8, 0.05, (HOUSE_PLOTS[0]?.pos[2] ?? -4) + 2.4]}
          sceneId="home-interior"
          entry={{ position: [0, 0, 2.6], rotationY: 0 }}
          color="#7fc6ff"
          radius={1.2}
          label="HOME"
        />
      </SceneRoot>

      <SceneRoot
        scene={{
          id: 'home-interior',
          name: 'Home',
          interior: true,
          entry: { position: [0, 0, 0] },
        }}
      >
        <HomeInterior
          returnPosition={[
            HOUSE_PLOTS[0]?.pos[0] ?? -8,
            0.05,
            (HOUSE_PLOTS[0]?.pos[2] ?? -4) + 3.4,
          ]}
        />
      </SceneRoot>

      <group position={[-12, 0.06, 22]}>
        <Billboard text="Town" width={3} height={1} color="#fff7e0" toon />
      </group>

      {WORLD_WEATHER_ENABLED && <WeatherEffect area={120} height={22} count={1500} />}

      <group position={[55, 0.02, 0]}>
        <Water size={40} toon />
      </group>
      <SandBatch entries={SAND_TILES} />

      <SnowfieldBatch entries={SNOWFIELD_TILES} />
      <group position={[-43, 0, 0]}>
        <Snow gpu />
      </group>

      {CAMP_FIRES.map((p, i) => (
        <group key={`fire-${i}`} position={p}>
          <Fire intensity={2.0} width={1.4} height={2.0} color="#ffd49a" />
        </group>
      ))}

      <group position={[0, 0, -45]} rotation={[0, Math.PI, 0]}>
        <Billboard text="Welcome to Gaesup World" width={6} height={2} color="#fff7e0" toon />
      </group>
      <group position={[42, 0, -42]} rotation={[0, Math.PI * 0.75, 0]}>
        <Billboard text="Beach" width={4} height={1.6} color="#fff2c8" toon />
      </group>
      <group position={[-42, 0, -42]} rotation={[0, -Math.PI * 0.75, 0]}>
        <Billboard text="Snowland" width={4} height={1.6} color="#e6f3ff" toon />
      </group>
      <group position={[0, 0, 50]} rotation={[0, 0, 0]}>
        <Billboard text="Meadow" width={4} height={1.6} color="#e6ffd6" toon />
      </group>

      {PICKUPS.map((p) => (
        <Pickup key={p.id} id={p.id} itemId={p.itemId} count={p.count} position={p.pos} />
      ))}
    </>
  );
}

function GameSystems() {
  useGameClock(false);
  useHotbarKeyboard(true);
  useAutoSave({ intervalMs: 60_000 });
  useQuestObjectiveTracker(true);
  useCatalogTracker(true);
  useWeatherTicker(WORLD_WEATHER_ENABLED);
  useEventsTicker(true);
  useDecorationScore(true);
  useAmbientBgm(true);

  useDayChange((time) => {
    const day = Math.floor(time.totalMinutes / (60 * 24));
    useShopStore.getState().rollDailyStock(day);
    useFriendshipStore.getState().resetDaily();
    useWeatherStore.getState().rollForDay(day, time.season);
    if (day > 0 && useMailStore.getState().messages.length < 3) {
      useMailStore.getState().send({
        from: '메이',
        subject: `${time.month}월 ${time.day}일의 편지`,
        body: '오늘도 평화로운 하루예요. 한번 들러주세요!\n\n— 메이 드림',
        sentDay: day,
        attachments: [{ bells: 100 }],
      });
    }
  });

  useEffect(() => {
    const sys = getSaveSystem();
    const offTime = sys.register({
      key: 'time',
      serialize: () => useTimeStore.getState().serialize(),
      hydrate: (data: unknown) => useTimeStore.getState().hydrate(data as never),
    });
    const offInv = sys.register({
      key: 'inventory',
      serialize: () => useInventoryStore.getState().serialize(),
      hydrate: (data: unknown) => useInventoryStore.getState().hydrate(data as never),
    });
    const offWallet = sys.register({
      key: 'wallet',
      serialize: () => useWalletStore.getState().serialize(),
      hydrate: (data: unknown) => useWalletStore.getState().hydrate(data as never),
    });
    const offShop = sys.register({
      key: 'shop',
      serialize: () => useShopStore.getState().serialize(),
      hydrate: (data: unknown) => useShopStore.getState().hydrate(data as never),
    });
    const offRel = sys.register({
      key: 'relations',
      serialize: () => useFriendshipStore.getState().serialize(),
      hydrate: (data: unknown) => useFriendshipStore.getState().hydrate(data as never),
    });
    const offQuest = sys.register({
      key: 'quests',
      serialize: () => useQuestStore.getState().serialize(),
      hydrate: (data: unknown) => useQuestStore.getState().hydrate(data as never),
    });
    const offMail = sys.register({
      key: 'mail',
      serialize: () => useMailStore.getState().serialize(),
      hydrate: (data: unknown) => useMailStore.getState().hydrate(data as never),
    });
    const offCatalog = sys.register({
      key: 'catalog',
      serialize: () => useCatalogStore.getState().serialize(),
      hydrate: (data: unknown) => useCatalogStore.getState().hydrate(data as never),
    });
    const offCraft = sys.register({
      key: 'crafting',
      serialize: () => useCraftingStore.getState().serialize(),
      hydrate: (data: unknown) => useCraftingStore.getState().hydrate(data as never),
    });
    const offFarm = sys.register({
      key: 'farming',
      serialize: () => usePlotStore.getState().serialize(),
      hydrate: (data: unknown) => usePlotStore.getState().hydrate(data as never),
    });
    const offWeather = sys.register({
      key: 'weather',
      serialize: () => useWeatherStore.getState().serialize(),
      hydrate: (data: unknown) => useWeatherStore.getState().hydrate(data as never),
    });
    const offEvents = sys.register({
      key: 'events',
      serialize: () => useEventsStore.getState().serialize(),
      hydrate: (data: unknown) => useEventsStore.getState().hydrate(data as never),
    });
    const offTown = sys.register({
      key: 'town',
      serialize: () => useTownStore.getState().serialize(),
      hydrate: (data: unknown) => useTownStore.getState().hydrate(data as never),
    });
    const offAudio = sys.register({
      key: 'audio',
      serialize: () => useAudioStore.getState().serialize(),
      hydrate: (data: unknown) => useAudioStore.getState().hydrate(data as never),
    });
    const offChar = sys.register({
      key: 'character',
      serialize: () => useCharacterStore.getState().serialize(),
      hydrate: (data: unknown) => useCharacterStore.getState().hydrate(data as never),
    });
    const offI18n = sys.register({
      key: 'i18n',
      serialize: () => useI18nStore.getState().serialize(),
      hydrate: (data: unknown) => useI18nStore.getState().hydrate(data as never),
    });
    const offScene = sys.register({
      key: 'scene',
      serialize: () => useSceneStore.getState().serialize(),
      hydrate: (data: unknown) => useSceneStore.getState().hydrate(data as never),
    });
    void sys.load().then(() => {
      useTimeStore.getState().setTotalMinutes(DEFAULT_WORLD_TIME_MINUTES);
      useWeatherStore.setState((state) => ({
        ...state,
        current: null,
      }));

      const inv = useInventoryStore.getState();
      if (!inv.has('axe'))         inv.add('axe', 1);
      if (!inv.has('shovel'))      inv.add('shovel', 1);
      if (!inv.has('water-can'))   inv.add('water-can', 1);
      if (!inv.has('seed-turnip')) inv.add('seed-turnip', 5);
      const timeState = useTimeStore.getState();
      const today = Math.floor(timeState.totalMinutes / (60 * 24));
      useShopStore.getState().rollDailyStock(today);
      useEventsStore.getState().refresh(timeState.time);

      const town = useTownStore.getState();
      if (Object.keys(town.residents).length === 0) {
        town.registerResident({ id: 'r-mei',   name: '메이',   bodyColor: '#ffe4c8', hatColor: '#5a8acf' });
        town.registerResident({ id: 'r-tommy', name: '토미',   bodyColor: '#f5d199', hatColor: '#a85a5a' });
        town.registerResident({ id: 'r-ryu',   name: '류',     bodyColor: '#ffd0b8', hatColor: '#3a8a3a' });
      }
      const futureDay = today + 3;
      const houseList = Object.values(town.houses);
      if (houseList[0] && houseList[0].state === 'empty') town.moveIn(houseList[0].id, 'r-mei', today);
      if (houseList[1] && houseList[1].state === 'empty') town.reserveHouse(houseList[1].id, 'r-tommy', futureDay);
      if (houseList[2] && houseList[2].state === 'empty') town.reserveHouse(houseList[2].id, 'r-ryu',   futureDay + 2);
      if (useMailStore.getState().messages.length === 0) {
        useMailStore.getState().send({
          from: '운영팀',
          subject: '환영합니다, 가에섭월드에 오신 것을!',
          body: '도끼 [F], 인벤토리 [I], 퀘스트 [J], 우편 [M], 도감 [K], 제작 [C].\n\n농장에서 [삽]으로 땅을 갈고 [씨앗]을 핫바에 장착해 [삽]을 사용해 심으세요. [물뿌리개]로 매일 물을 주세요.\n\n첫 시작용 자금을 보내드려요.',
          sentDay: today,
          attachments: [{ bells: 500 }],
        });
      }
    });
    return () => {
      offTime();
      offInv();
      offWallet();
      offShop();
      offRel();
      offQuest();
      offMail();
      offCatalog();
      offCraft();
      offFarm();
      offWeather();
      offEvents();
      offTown();
      offAudio();
      offChar();
      offI18n();
      offScene();
    };
  }, []);

  return null;
}

function Player() {
  const isInBuildingMode = useBuildingStore((s) => s.isInEditMode());
  const mode = useGaesupStore((s) => s.mode);
  const { gameStates } = useStateSystem();
  const bodyColor = useCharacterStore((s) => s.appearance.colors.body);
  if (isInBuildingMode || gameStates?.isRiding) return null;
  return (
    <>
      <GaesupController
        key={`controller-${mode.type}`}
        controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
        rigidBodyProps={{}}
        parts={[]}
        rotation={euler({ x: 0, y: Math.PI, z: 0 })}
        baseColor={bodyColor}
      />
      <OutfitAvatar />
    </>
  );
}

function PostFX() {
  const enabled = usePerfStore((s) => s.profile.postprocess);
  if (!enabled) return null;
  return (
    <EffectComposer multisampling={0}>
      <ColorGrade />
    </EffectComposer>
  );
}

function CharacterSpeechBalloon() {
  const [visible, setVisible] = useState(true);
  const { position } = usePlayerPosition({ updateInterval: 16 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') setVisible((v) => !v);
    };
    window.addEventListener('keypress', onKey);
    return () => window.removeEventListener('keypress', onKey);
  }, []);

  if (!visible) return null;
  return (
    <SpeechBalloon
      text="안녕"
      position={position}
      offset={new THREE.Vector3(0, 5, 0)}
      visible
    />
  );
}

export const WorldPage = ({ showEditor = false, children }: WorldPageProps) => {
  const [shopOpen, setShopOpen] = useState(false);
  const [craftOpen, setCraftOpen] = useState(false);
  return (
    <>
      <GaesupWorld
        urls={{ characterUrl: CHARACTER_URL, vehicleUrl: VEHICLE_URL, airplaneUrl: AIRPLANE_URL }}
        debug={EXAMPLE_CONFIG.debug}
        cameraOption={{ type: 'thirdPerson', distance: 13, height: 10, fov: 75, smoothness: 0.25 }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}
          frameloop="always"
        >
          <Lighting />
          <Suspense>
            <GaesupWorldContent showGrid={EXAMPLE_CONFIG.showGrid} showAxes={EXAMPLE_CONFIG.showAxes}>
              <Physics debug interpolate>
                <Player />
                <Ground />
                <Scenery
                  onOpenShop={() => setShopOpen(true)}
                  onOpenCrafting={() => setCraftOpen(true)}
                />
                <Clicker />
                <GroundClicker />
                <BuildingController />
                <CharacterSpeechBalloon />
                <InteractionTracker />
                <ToolUseController useKey="f" />
                <Footprints />
                <Footsteps />
                <GrassDriver />
                <RoomVisibilityDriver />
              </Physics>
              <DynamicFog color="#cfd8e3" near={45} far={260} />
              <PostFX />
            </GaesupWorldContent>
          </Suspense>
        </Canvas>

        <GameSystems />

        <HudShell toonInitial={_initialToon} toonStorageKey={TOON_STORAGE_KEY} />

        <InteractionPrompt />
        <DialogBox />
        <ToastHost />

        <ShopUI open={shopOpen} onClose={() => setShopOpen(false)} title="토미네 상점" />
        <CraftingUI open={craftOpen} onClose={() => setCraftOpen(false)} title="류의 작업대" />
        <QuestLogUI toggleKey="j" />
        <MailboxUI toggleKey="m" />
        <CatalogUI toggleKey="k" />
        <InventoryUI toggleKey="i" />

        <HotbarUI />
        <MiniMap position="bottom-left" scale={5} showZoom={false} showCompass={false} />

        <CharacterCreator toggleKey="o" />
        <TouchControls />
      </GaesupWorld>
      {showEditor && <Editor />}
      {children}
    </>
  );
};
