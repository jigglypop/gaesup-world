import React, { Suspense, useEffect, useState } from 'react';

import { Environment, Grid } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { euler, Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

import { WorldPageProps } from './types';
import {
  Billboard, BugSpot,
  BuildingController, CatalogUI, Clicker, CraftingUI, DialogBox, Editor, FishSpot,
  Fire, GaesupController, GaesupWorld,
  GaesupWorldContent, Grass, GroundClicker, HotbarUI, InteractionPrompt, InteractionTracker, InventoryUI,
  MailboxUI, MiniMap, QuestLogUI, SakuraBatch, SandBatch, ShopUI, Snow, SnowfieldBatch,
  TimeHUD, ToastHost, ToolUseController, TreeObject, WalletHUD, Water,
  getSaveSystem, registerSeedItems, setDefaultToonMode,
  useAutoSave, useCatalogStore, useCatalogTracker, useCraftingStore, useDayChange,
  useFriendshipStore, useGameClock, useHotbarKeyboard, useInventoryStore, useMailStore,
  useQuestObjectiveTracker, useQuestStore, useShopStore, useTimeStore, useWalletStore,
  type SakuraTreeEntry, type SandEntry, type SnowfieldEntry,
  useBuildingStore, useGaesupStore,
} from '../../src';
import { registerSeedDialogs } from '../components/dialog/seedDialogs';
import { NPCBeacon } from '../components/npc/NPCBeacon';
import { registerSeedContent } from '../components/seedContent';
import { usePlayerPosition } from '../../src/core/motions/hooks/usePlayerPosition';
import { useStateSystem } from '../../src/core/motions/hooks/useStateSystem';
import { CameraOptionType } from '../../src/core/camera/core/types';
import { SpeechBalloon } from '../../src/core/ui/components/SpeechBalloon';
import Info from '../components/info';
import { Pickup } from '../components/pickup';
import { Teleport } from '../components/teleport';
import { AIRPLANE_URL, CHARACTER_URL, EXAMPLE_CONFIG, S3, VEHICLE_URL } from '../config/constants';
import '../style.css';

registerSeedItems();
registerSeedDialogs();
registerSeedContent();

export { S3 };

const CAMERA_OPTION: CameraOptionType = {
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
      <directionalLight
        castShadow
        shadow-normalBias={0.06}
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

      <group position={[0, 0, 40]}>
        <Grass width={60} instances={6000} lod={{ near: 20, far: 80, strength: 0.6 }} />
      </group>

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
  useGameClock(true);
  useHotbarKeyboard(true);
  useAutoSave({ intervalMs: 60_000 });
  useQuestObjectiveTracker(true);
  useCatalogTracker(true);

  useDayChange((time) => {
    const day = Math.floor(time.totalMinutes / (60 * 24));
    useShopStore.getState().rollDailyStock(day);
    useFriendshipStore.getState().resetDaily();
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
    void sys.load().then(() => {
      const inv = useInventoryStore.getState();
      if (!inv.has('axe')) inv.add('axe', 1);
      const today = Math.floor(useTimeStore.getState().totalMinutes / (60 * 24));
      useShopStore.getState().rollDailyStock(today);
      if (useMailStore.getState().messages.length === 0) {
        useMailStore.getState().send({
          from: '운영팀',
          subject: '환영합니다, 가에섭월드에 오신 것을!',
          body: '도끼 [F], 인벤토리 [I], 퀘스트 [J], 우편 [M], 도감 [K], 제작 [C].\n\n첫 시작용 자금을 보내드려요.',
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
    };
  }, []);

  return null;
}

function Player() {
  const isInBuildingMode = useBuildingStore((s) => s.isInEditMode());
  const mode = useGaesupStore((s) => s.mode);
  const { gameStates } = useStateSystem();
  if (isInBuildingMode || gameStates?.isRiding) return null;
  return (
    <GaesupController
      key={`controller-${mode.type}`}
      controllerOptions={{ lerp: { cameraTurn: 0.1, cameraPosition: 0.08 } }}
      rigidBodyProps={{}}
      parts={[]}
      rotation={euler({ x: 0, y: Math.PI, z: 0 })}
    />
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

function HUD() {
  const [showInfo, setShowInfo] = useState(true);
  const [showTeleport, setShowTeleport] = useState(false);
  const [toon, setToon] = useState(_initialToon);

  const onToggleToon = () => {
    const next = !toon;
    setToon(next);
    setDefaultToonMode(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOON_STORAGE_KEY, next ? '1' : '0');
      window.location.reload();
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed', top: 10, right: 10,
        zIndex: 90, pointerEvents: 'auto', display: 'flex', gap: 6,
      }}>
        <button
          className={`app-nav-button${toon ? ' active' : ''}`}
          onClick={onToggleToon}
          title="Toggle toon shading (reloads scene)"
        >
          {toon ? 'Toon: ON' : 'Toon: OFF'}
        </button>
        <button className={`app-nav-button${showInfo ? ' active' : ''}`} onClick={() => setShowInfo((v) => !v)}>
          {showInfo ? 'Hide Info' : 'Info'}
        </button>
        <button className={`app-nav-button${showTeleport ? ' active' : ''}`} onClick={() => setShowTeleport((v) => !v)}>
          {showTeleport ? 'Hide Teleport' : 'Teleport'}
        </button>
      </div>
      {showInfo && <Info />}
      {showTeleport && <Teleport />}
    </>
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
        cameraOption={CAMERA_OPTION}
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
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>

        <GameSystems />
        <TimeHUD />
        <WalletHUD position="top-center" />
        <InteractionPrompt />
        <DialogBox />
        <ToastHost />
            <ShopUI open={shopOpen} onClose={() => setShopOpen(false)} title="토미네 상점" />
            <CraftingUI open={craftOpen} onClose={() => setCraftOpen(false)} title="류의 작업대" />
            <QuestLogUI toggleKey="j" />
            <MailboxUI toggleKey="m" />
            <CatalogUI toggleKey="k" />
        <HotbarUI />
        <InventoryUI toggleKey="i" />
        <MiniMap position="bottom-left" scale={5} showZoom={false} showCompass={false} />
        <HUD />
      </GaesupWorld>
      {showEditor && <Editor />}
      {children}
    </>
  );
};
