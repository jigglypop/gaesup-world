import { Suspense, useCallback, useMemo, useState } from 'react';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';

import {
  createWorldRuntime,
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
  DialogBox,
  DynamicFog,
  Footprints,
  GaesupWorld,
  GaesupWorldContent,
  GroundClicker,
  HotbarUI,
  InteractionPrompt,
  InteractionTracker,
  InventoryUI,
  MailboxUI,
  MiniMap,
  QuestLogUI,
  RoomVisibilityDriver,
  RuntimeSaveDiagnosticsToaster,
  setDefaultToonMode,
  ToolUseController,
  TouchControls,
  ToastHost,
  WeatherEffect,
  useBuildingStore,
  usePerfStore,
} from '../../src';
import { GrassDriver } from '../../src/core/building';
import {
  Editor,
  GameplayEventPanel,
  StudioPanel,
  createEditorShell,
  type EditorShellOptions,
} from '../../src/editor';
import { HudShell } from '../components/hud/HudShell';
import { AIRPLANE_URL, EXAMPLE_CONFIG, S3, VEHICLE_URL } from '../config/constants';
import '../style.css';

if (typeof window !== 'undefined') {
  usePerfStore.getState().detect();
}

export { RICH_CAMERA_OPTION } from './world/data';
export { S3 };

setDefaultToonMode(DEFAULT_TOON_MODE);

const DEFAULT_EDITOR_SHELL_OPTIONS: EditorShellOptions = {};

export const WorldPage = ({
  showEditor = false,
  showEditorShell = true,
  showHud = true,
  compactHud = false,
  includeEditorAuxPanels = true,
  editorShellOptions = DEFAULT_EDITOR_SHELL_OPTIONS,
  children,
}: WorldPageProps) => {
  const runtime = useMemo(() => createWorldRuntime(), []);
  const [runtimeRevision, setRuntimeRevision] = useState(0);
  const fogEnabled = useBuildingStore((s) => s.showFog);
  const fogColor = useBuildingStore((s) => s.fogColor);
  const weatherEffect = useBuildingStore((s) => s.weatherEffect);
  const [gameplayBlueprints, setGameplayBlueprints] = useState(() => getWorldGameplayBlueprints());
  const worldMode = showEditor
    ? { type: 'character' as const, controller: 'clicker' as const, control: 'topDown' as const }
    : { type: 'character' as const, controller: 'keyboard' as const, control: 'thirdPerson' as const };
  const worldCameraOption = showEditor
    ? {
        type: 'topDown' as const,
        distance: 34,
        height: 52,
        fov: 52,
        smoothness: 0.14,
        enableCollision: false,
        enableZoom: true,
        minZoom: 0.3,
        maxZoom: 2.8,
        zoomSpeed: 0.001,
      }
    : {
        type: 'thirdPerson' as const,
        distance: 13,
        height: 10,
        fov: 75,
        smoothness: 0.25,
        enableCollision: false,
      };
  const handleRuntimeReady = useCallback(() => {
    setRuntimeRevision((revision) => revision + 1);
  }, []);
  const editorShell = useMemo(() => {
    const auxiliaryPanels = includeEditorAuxPanels
      ? [
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
            defaultSide: 'right' as const,
            pluginId: 'gaesup.gameplay-events',
          },
          {
            id: 'studio',
            title: '스튜디오',
            component: <StudioPanel gameplayEvents={gameplayBlueprints} />,
            defaultSide: 'right' as const,
            pluginId: 'gaesup.studio',
          },
        ]
      : [];

    return createEditorShell({
      ...editorShellOptions,
      panels: [...auxiliaryPanels, ...(editorShellOptions.panels ?? [])],
      defaultActivePanels: editorShellOptions.defaultActivePanels ?? ['tile'],
      hiddenBuiltInPanels: editorShellOptions.hiddenBuiltInPanels ?? ['character', 'vehicle', 'animation', 'motion', 'performance'],
      panelOrder: editorShellOptions.panelOrder ?? ['world', 'wall', 'tile', 'block', 'object', 'npc', 'camera', 'gameplay-events', 'studio'],
    });
  }, [editorShellOptions, gameplayBlueprints, includeEditorAuxPanels]);

  return (
    <>
      <GaesupWorld
        urls={{ characterUrl: DEFAULT_CHARACTER_URL, vehicleUrl: VEHICLE_URL, airplaneUrl: AIRPLANE_URL }}
        mode={worldMode}
        runtime={runtime}
        runtimeRevision={runtimeRevision}
        debug={EXAMPLE_CONFIG.debug}
        cameraOption={worldCameraOption}
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
                {!showEditor && <Player />}
                <Ground />
                <Scenery />
                {!showEditor && <Clicker />}
                {!showEditor && <GroundClicker />}
                <BuildingController />
                {!showEditor && <CharacterSpeechBalloon />}
                <InteractionTracker />
                {!showEditor && <ToolUseController useKey="f" />}
                <Footprints />
                <GrassDriver />
                <RoomVisibilityDriver />
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>

        <WorldSystems runtime={runtime} onRuntimeReady={handleRuntimeReady} />

        {showHud && (
          <>
            <RuntimeSaveDiagnosticsToaster />
            <ToastHost position="top-right" />

            <HudShell showEnvironmentControls={!showEditor} compact={compactHud} />

            <InteractionPrompt enabled={!showEditor} />
            <DialogBox />
            <QuestLogUI toggleKey="j" />
            <MailboxUI toggleKey="m" />
            <CatalogUI toggleKey="k" />
            <InventoryUI toggleKey="i" />

            <HotbarUI />
            <MiniMap position="bottom-left" scale={5} showZoom={false} showCompass={false} />

            <CharacterCreator toggleKey="o" />
            {!showEditor && <TouchControls />}
          </>
        )}
      </GaesupWorld>
      {showEditor && showEditorShell && <Editor shell={editorShell} />}
      {children}
    </>
  );
};
