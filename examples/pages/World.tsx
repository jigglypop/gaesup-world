import { Suspense, useMemo, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

import {
  deleteWorldGameplayEventBlueprint,
  dispatchWorldGameplayEvent,
  getWorldGameplayBlueprints,
  registerWorldGameplayEventBlueprint,
} from './runtime';
import { WorldPageProps } from './types';
import { DEFAULT_TOON_MODE } from './world/data';
import { DEFAULT_CHARACTER_URL, CharacterSpeechBalloon, Player } from './world/player';
import { Ground, Lighting, Scenery } from './world/scene';
import { WorldSystems } from './world/useWorldSystems';
import {
  BuildingController,
  CatalogUI,
  CharacterCreator,
  Clicker,
  CraftingUI,
  DialogBox,
  DynamicFog,
  Editor,
  Footprints,
  GaesupWorld,
  GaesupWorldContent,
  GameplayEventPanel,
  GrassDriver,
  GroundClicker,
  HotbarUI,
  InteractionPrompt,
  InteractionTracker,
  InventoryUI,
  MailboxUI,
  MiniMap,
  QuestLogUI,
  RoomVisibilityDriver,
  setDefaultToonMode,
  ShopUI,
  StudioPanel,
  ToastHost,
  ToolUseController,
  TouchControls,
  WeatherEffect,
  createEditorShell,
  useBuildingStore,
  usePerfStore,
} from '../../src';
import { HudShell } from '../components/hud/HudShell';
import { AIRPLANE_URL, EXAMPLE_CONFIG, S3, VEHICLE_URL } from '../config/constants';
import '../style.css';

if (typeof window !== 'undefined') {
  usePerfStore.getState().detect();
}

export { RICH_CAMERA_OPTION } from './world/data';
export { S3 };

setDefaultToonMode(DEFAULT_TOON_MODE);

export const WorldPage = ({ showEditor = false, showHud = true, children }: WorldPageProps) => {
  const [shopOpen, setShopOpen] = useState(false);
  const [craftOpen, setCraftOpen] = useState(false);
  const fogEnabled = useBuildingStore((s) => s.showFog);
  const fogColor = useBuildingStore((s) => s.fogColor);
  const weatherEffect = useBuildingStore((s) => s.weatherEffect);
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
    defaultActivePanels: ['building', 'camera'],
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
          <DynamicFog enabled={fogEnabled} color={fogColor} />
          {(weatherEffect === 'rain' || weatherEffect === 'storm' || weatherEffect === 'wind') && (
            <WeatherEffect
              kind={weatherEffect}
              area={110}
              height={26}
              count={weatherEffect === 'wind' ? 900 : 1800}
              followCamera
            />
          )}
          <Suspense>
            <GaesupWorldContent showGrid={EXAMPLE_CONFIG.showGrid} showAxes={EXAMPLE_CONFIG.showAxes}>
              <Physics debug interpolate>
                <Player />
                <Ground />
                <Scenery
                  onOpenShop={() => setShopOpen(true)}
                  onOpenCrafting={() => setCraftOpen(true)}
                />
                {!showEditor && <Clicker />}
                {!showEditor && <GroundClicker />}
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

        <WorldSystems />

        {showHud && (
          <>
            <HudShell
              onOpenCrafting={() => setCraftOpen(true)}
              showEnvironmentControls={!showEditor}
            />

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
