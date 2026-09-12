import { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import {
  BuildingController, DynamicFog, GaesupWorld, GaesupWorldContent,
  GaesupRuntimeProvider, RuntimeSaveDiagnosticsToaster, TouchControls, ToastHost,
  setDefaultToonMode, useBuildingStore, usePerfStore,
  type WorldCameraOption, type WorldContainerProps,
} from 'gaesup-world';
import { GrassDriver } from 'gaesup-world/building';
import { ColorGrade, ToonOutlines } from 'gaesup-world/postprocessing';
import { createWorldRuntime } from './runtime';
import { WorldPageProps } from './types';
import { DEFAULT_TOON_MODE } from './world/data';
import { Player, useWorldCharacterUrl } from './world/player';
import { Ground, Lighting, Scenery } from './world/scene';
import { getWorldSceneDocumentSession, WorldSceneDocumentRootMarkers } from './world/sceneDocument';
import { WorldSystems } from './world/useWorldSystems';
import { WorldMenu } from './world/WorldMenu';
import { PerformanceOverlay } from '../components/performance/PerformanceOverlay';
import { EXAMPLE_CONFIG, S3 } from '../config/constants';
import '../style.css';

if (typeof window !== 'undefined') usePerfStore.getState().detect();
export { RICH_CAMERA_OPTION } from './world/data';
export { S3 };
setDefaultToonMode(DEFAULT_TOON_MODE);

const WorldEditorSurface = lazy(() => import('./WorldEditorSurface'));
const DEFAULT_EDITOR_SHELL_OPTIONS: NonNullable<WorldPageProps['editorShellOptions']> = {};
const EDITOR_WORLD_MODE = {
  type: 'character', controller: 'clicker', control: 'topDown',
} satisfies NonNullable<WorldContainerProps['mode']>;
const DEFAULT_WORLD_MODE = {
  type: 'character', controller: 'keyboard', control: 'thirdPerson',
} satisfies NonNullable<WorldContainerProps['mode']>;
const EDITOR_WORLD_CAMERA_OPTION = {
  type: 'topDown', distance: 34, height: 52, fov: 52, smoothness: 0.14,
  enableCollision: false, enableZoom: true, minZoom: 0.3, maxZoom: 2.8, zoomSpeed: 0.001,
} satisfies WorldCameraOption;
const DEFAULT_WORLD_CAMERA_OPTION = {
  type: 'thirdPerson', distance: 9, height: 7, fov: 52, smoothness: 0.25,
  enableCollision: false, enableZoom: true, minZoom: 0.6, maxZoom: 1.8, zoomSpeed: 0.001,
} satisfies WorldCameraOption;

export const WorldPage = ({
  showEditor = false, showEditorShell = true, showHud = true,
  includeEditorAuxPanels = true, showDiagnostics = false, onRuntimeReady,
  sceneChildren, overlayChildren, editorShellOptions = DEFAULT_EDITOR_SHELL_OPTIONS, children,
}: WorldPageProps) => {
  const sceneDocumentSession = useMemo(() => getWorldSceneDocumentSession(), []);
  const runtime = useMemo(() => createWorldRuntime({ sceneDocumentSession }), [sceneDocumentSession]);
  const [runtimeRevision, setRuntimeRevision] = useState(0);
  const characterUrl = useWorldCharacterUrl();
  const urls = useMemo(() => ({ characterUrl }), [characterUrl]);
  const fogEnabled = useBuildingStore((state) => state.showFog);
  const fogColor = useBuildingStore((state) => state.fogColor);
  const [postprocessingEnabled, setPostprocessingEnabled] = useState(false);
  const handleRuntimeReady = useCallback(() => {
    setRuntimeRevision((revision) => revision + 1);
    onRuntimeReady?.();
  }, [onRuntimeReady]);

  return (
    <>
      <GaesupWorld
        urls={urls} mode={showEditor ? EDITOR_WORLD_MODE : DEFAULT_WORLD_MODE}
        runtime={runtime} runtimeRevision={runtimeRevision} debug={EXAMPLE_CONFIG.debug}
        cameraOption={showEditor ? EDITOR_WORLD_CAMERA_OPTION : DEFAULT_WORLD_CAMERA_OPTION}
      >
        <Canvas shadows dpr={[1, 1.5]} style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
          <Suspense fallback={null}>
            <Lighting />
            <DynamicFog enabled={fogEnabled} color={fogColor} />
            {postprocessingEnabled && (
              <ToonOutlines edgeStrength={4} extraEffects={<ColorGrade intensity={0.8} />}><group /></ToonOutlines>
            )}
            <GaesupWorldContent showGrid={EXAMPLE_CONFIG.showGrid} showAxes={EXAMPLE_CONFIG.showAxes}>
              <WorldSceneDocumentRootMarkers session={sceneDocumentSession} />
              <Physics debug={showDiagnostics} interpolate>
                {!showEditor && <Player />}
                {sceneChildren}
                <Ground showGrid={showDiagnostics && !showEditor} />
                <Scenery />
                <BuildingController showGrid={showEditor ? undefined : false} />
                <GrassDriver />
              </Physics>
            </GaesupWorldContent>
          </Suspense>
        </Canvas>
        <WorldSystems runtime={runtime} onRuntimeReady={handleRuntimeReady} />
        {overlayChildren}
        {showHud && (
          <>
            <RuntimeSaveDiagnosticsToaster />
            <ToastHost position="top-right" />
            {!showEditor && <WorldMenu runtime={runtime} ready={runtimeRevision > 0} />}
            {showDiagnostics && <PerformanceOverlay />}
            {showDiagnostics && (
              <button type="button" className="world-postprocessing-toggle" onClick={() => setPostprocessingEnabled((enabled) => !enabled)}>
                {postprocessingEnabled ? '후처리 끄기' : '후처리 켜기'}
              </button>
            )}
            {!showEditor && <TouchControls />}
          </>
        )}
      </GaesupWorld>
      {showEditor && (
        <Suspense fallback={null}>
          <GaesupRuntimeProvider runtime={runtime} revision={runtimeRevision}>
            <WorldEditorSurface showEditorShell={showEditorShell} includeEditorAuxPanels={includeEditorAuxPanels}
              editorShellOptions={editorShellOptions} sceneDocumentSession={sceneDocumentSession} />
          </GaesupRuntimeProvider>
        </Suspense>
      )}
      {children}
    </>
  );
};
