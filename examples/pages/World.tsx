import React, { Suspense, useEffect, useMemo, useState } from 'react';

import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import {
  createWorldRuntime,
  deleteWorldGameplayEventBlueprint,
  dispatchWorldGameplayEvent,
  getWorldGameplayBlueprints,
  loadWorldRuntime,
  registerWorldGameplayEventBlueprint,
} from './runtime';
import { WorldPageProps } from './types';
import {
  BugSpot,
  BuildingController, CatalogUI, Clicker, CraftingUI, CropPlot, DialogBox, Editor,
  createEditorShell,
  GaesupController, GaesupWorld, GrassDriver,
  GaesupWorldContent, GroundClicker, HotbarUI, HousePlot, InteractionPrompt,
  GameplayEventPanel, InteractionTracker, InventoryUI,
  MailboxUI, MiniMap, QuestLogUI, SandBatch, ShopUI, Snow, SnowfieldBatch,
  StudioPanel, ToastHost, ToolUseController,
  WeatherEffect,
  CharacterCreator, Footprints, HouseDoor, SakuraBatch, SceneRoot,
  RoomPortal, RoomRoot, RoomVisibilityDriver,
  TouchControls,
  setDefaultToonMode,
  useAutoSave, useCatalogTracker, useCharacterStore,
  useDayChange,
  useDecorationScore, useEventsTicker, useFriendshipStore, useGameClock,
  useHotbarKeyboard, useMailStore,
  usePerfStore, useQuestObjectiveTracker, useShopStore,
  useWeatherStore, useWeatherTicker, useAudioStore,
  usePlayerPosition, useStateSystem, SpeechBalloon,
  type CameraOptionType, type SakuraTreeEntry, type SandEntry, type SnowfieldEntry,
  resolveCharacterParts, useAssetStore, useBuildingStore, useGaesupStore, WARRIOR_BLUEPRINT,
} from '../../src';
import { HudShell } from '../components/hud/HudShell';
import { NPCBeacon } from '../components/npc/NPCBeacon';
import { Pickup } from '../components/pickup';
import { AIRPLANE_URL, CHARACTER_URL, EXAMPLE_CONFIG, S3, VEHICLE_URL } from '../config/constants';
import '../style.css';

if (typeof window !== 'undefined') {
  usePerfStore.getState().detect();
}

export { S3 };

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

const WORLD_WEATHER_ENABLED = false;
const DEFAULT_TOON_MODE = false;

setDefaultToonMode(DEFAULT_TOON_MODE);

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

const DEFAULT_CHARACTER_BLUEPRINT_PARTS = WARRIOR_BLUEPRINT.visuals?.parts ?? [];
const DEFAULT_CHARACTER_BODY = DEFAULT_CHARACTER_BLUEPRINT_PARTS.find((part) => part.type === 'body');
const DEFAULT_CHARACTER_URL = DEFAULT_CHARACTER_BODY?.url ?? CHARACTER_URL;
const DEFAULT_CHARACTER_PARTS = DEFAULT_CHARACTER_BLUEPRINT_PARTS
  .filter((part) => part.id !== DEFAULT_CHARACTER_BODY?.id)
  .map((part) => ({ id: part.id, slot: part.type, url: part.url, ...(part.color ? { color: part.color } : {}) }));

function Lighting() {
  return (
    <>
      <Environment background preset="sunset" backgroundBlurriness={1} />
      <ambientLight intensity={0.45} color="#ffffff" />
      <directionalLight
        castShadow
        position={[28, 36, 18]}
        intensity={1.8}
        color="#ffffff"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-top={70}
        shadow-camera-right={70}
        shadow-camera-bottom={-70}
        shadow-camera-left={-70}
        shadow-bias={-0.00015}
      />
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
  return (
    <>
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
          onInteract={(id) => {
            void dispatchWorldGameplayEvent({ type: 'interaction', targetId: `npc:${id}`, action: 'talk' });
          }}
        />
      ))}

      {BUG_SPOTS.map((p, i) => (
        <BugSpot key={`bug-${i}`} position={p} />
      ))}

      {CROP_PLOTS.map((p) => (
        <CropPlot key={p.id} id={p.id} position={p.pos} />
      ))}

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

      {WORLD_WEATHER_ENABLED && <WeatherEffect area={120} height={22} count={1500} />}

      <SandBatch entries={SAND_TILES} />

      <SnowfieldBatch entries={SNOWFIELD_TILES} />
      <group position={[-43, 0, 0]}>
        <Snow gpu />
      </group>

      {PICKUPS.map((p) => (
        <Pickup key={p.id} id={p.id} itemId={p.itemId} count={p.count} position={p.pos} />
      ))}
    </>
  );
}

function GameSystems() {
  const runtime = useMemo(() => createWorldRuntime(), []);
  useGameClock(false);
  useHotbarKeyboard(true);
  useAutoSave({ intervalMs: 60_000 });
  useQuestObjectiveTracker(true);
  useCatalogTracker(true);
  useWeatherTicker(WORLD_WEATHER_ENABLED);
  useEventsTicker(true, {
    onStarted: (ids) => {
      for (const id of ids) {
        void dispatchWorldGameplayEvent({ type: 'calendarEventStarted', eventId: id });
      }
    },
  });
  useDecorationScore(true);
  useEffect(() => {
    useAudioStore.setState({
      masterMuted: true,
      bgmMuted: true,
      sfxMuted: true,
      currentBgmId: null,
    });
    useAudioStore.getState().stopBgm();
    useAudioStore.getState().apply();
  }, []);

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
    void loadWorldRuntime(runtime);
    return () => {
      void runtime.dispose();
    };
  }, [runtime]);

  return null;
}

function Player() {
  const isInBuildingMode = useBuildingStore((s) => s.isInEditMode());
  const mode = useGaesupStore((s) => s.mode);
  const outfits = useCharacterStore((s) => s.outfits);
  const assetRecords = useAssetStore((s) => s.records);
  const { gameStates } = useStateSystem();
  const parts = useMemo(
    () => resolveCharacterParts({
      baseParts: DEFAULT_CHARACTER_PARTS,
      outfits,
      assets: assetRecords,
    }),
    [assetRecords, outfits],
  );
  if (isInBuildingMode || gameStates?.isRiding) return null;
  return (
    <>
      <GaesupController
        key={`controller-${mode.type}`}
        controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
        rigidBodyProps={{}}
        parts={parts}
        rotation={euler({ x: 0, y: Math.PI, z: 0 })}
      />
    </>
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

export const WorldPage = ({ showEditor = false, showHud = true, children }: WorldPageProps) => {
  const [shopOpen, setShopOpen] = useState(false);
  const [craftOpen, setCraftOpen] = useState(false);
  const [gameplayBlueprints, setGameplayBlueprints] = useState(() => getWorldGameplayBlueprints());
  const editorShell = useMemo(() => createEditorShell({
    panels: [
      {
        id: 'gameplay-events',
        title: '이벤트',
        component: (
          <GameplayEventPanel
            blueprints={gameplayBlueprints}
            onCreate={(blueprint) => {
              registerWorldGameplayEventBlueprint(blueprint);
              setGameplayBlueprints(getWorldGameplayBlueprints());
            }}
            onUpdate={(blueprint) => {
              registerWorldGameplayEventBlueprint(blueprint);
              setGameplayBlueprints(getWorldGameplayBlueprints());
            }}
            onDelete={(id) => {
              deleteWorldGameplayEventBlueprint(id);
              setGameplayBlueprints(getWorldGameplayBlueprints());
            }}
            onRun={(trigger) => dispatchWorldGameplayEvent(trigger)}
          />
        ),
        defaultSide: 'right',
        pluginId: 'gaesup.gameplay-events',
      },
      {
        id: 'studio',
        title: '스튜디오',
        component: <StudioPanel gameplayEvents={gameplayBlueprints} />,
        defaultSide: 'right',
        pluginId: 'gaesup.studio',
      },
    ],
    defaultActivePanels: ['building', 'character', 'gameplay-events', 'studio', 'camera'],
  }), [gameplayBlueprints]);
  return (
    <>
      <GaesupWorld
        urls={{ characterUrl: DEFAULT_CHARACTER_URL, vehicleUrl: VEHICLE_URL, airplaneUrl: AIRPLANE_URL }}
        mode={{ type: 'character', controller: 'keyboard', control: 'thirdPerson' }}
        debug={EXAMPLE_CONFIG.debug}
        cameraOption={{ type: 'thirdPerson', distance: 13, height: 10, fov: 75, smoothness: 0.25, enableCollision: false }}
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
                <GrassDriver />
                <RoomVisibilityDriver />
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>

        <GameSystems />

        {showHud && (
          <>
            <HudShell />

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
          </>
        )}
      </GaesupWorld>
      {showEditor && <Editor shell={editorShell} />}
      {children}
    </>
  );
};
