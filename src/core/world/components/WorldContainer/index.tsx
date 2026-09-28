import { lazy, Suspense, useEffect, useLayoutEffect, ReactNode, useMemo } from 'react';

import { Camera } from '@/core/camera';
import type { CameraOptionType } from '@/core/camera';
import { CAMERA_DEFAULTS } from '@/core/camera/core/constants';
import { PerformanceCollector } from '@/core/perf/PerformanceCollector';
import { QualityProfileProvider, useQualityProfile, type WorldQuality } from '@/core/perf/quality';
import { CompileGate } from '@/core/rendering/CompileGate';
import type { WorldPostProcessingProps } from '@/core/rendering/postprocess/WorldPostProcessing';
import { ShadowDepthMaterials } from '@/core/rendering/shadow/ShadowDepthMaterials';
import { GaesupRuntimeProvider } from '@/core/runtime';
import { FrameSchedulerHost } from '@/core/runtime/frame/react/FrameSchedulerHost';
import type { UrlsState } from '@/core/stores/slices/urls/types';
import { isProductionEnv } from '@/core/utils/env';
import { useGaesupStore, useGaesupStoreApi } from '@stores/gaesupStore';

import { WorldContainerProps } from './types';
export type { WorldAssetUrls, WorldCameraOption, WorldContainerProps } from './types';

// Worlds without post-processing never download its effect stack.
const WorldPostProcessing = lazy(() =>
  import('@/core/rendering/postprocess/WorldPostProcessing').then((module) => ({ default: module.WorldPostProcessing })),
);

/** Each URL field with its legacy short alias; the full name wins when both are set. */
const URL_KEYS = ['characterUrl', 'vehicleUrl', 'airplaneUrl', 'ridingUrl'] as const;
const URL_ALIASES: Partial<Record<(typeof URL_KEYS)[number], 'character' | 'vehicle' | 'airplane'>> = {
  characterUrl: 'character', vehicleUrl: 'vehicle', airplaneUrl: 'airplane',
};

/** The world compiles in slices before its first draw, instead of building every material in one frame. */
function WorldContent({ children, showGrid, showAxes }: { children?: ReactNode; showGrid?: boolean; showAxes?: boolean }) {
  return (
    <group name="gaesup-world">
      {showGrid && <gridHelper args={[100, 100, '#888888', '#444444']} />}
      {showAxes && <axesHelper args={[10]} />}
      <CompileGate>{children}</CompileGate>
    </group>
  );
}

/**
 * Applies world-related configuration into the shared stores and renders children unchanged.
 */
export function WorldConfigProvider(props: WorldContainerProps) {
  return <GaesupRuntimeProvider runtime={props.runtime} revision={props.runtimeRevision}><WorldConfiguration {...props} /></GaesupRuntimeProvider>;
}

function WorldConfiguration(props: WorldContainerProps) {
  const store = useGaesupStoreApi();
  const setMode = useGaesupStore((state) => state.setMode);
  const setUrls = useGaesupStore((state) => state.setUrls);
  const replaceCameraOption = useGaesupStore((state) => state.replaceCameraOption);

  const urlUpdates = useMemo(() => {
    const urls = props.urls;
    if (!urls) return null;
    const mapped: Partial<UrlsState> = {};
    for (const key of URL_KEYS) {
      const alias = URL_ALIASES[key];
      const url = urls[key] ?? (alias ? urls[alias] : undefined);
      if (url !== undefined) mapped[key] = url;
    }
    return Object.keys(mapped).length > 0 ? mapped : null;
  }, [props.urls]);

  useEffect(() => {
    if (urlUpdates) setUrls(urlUpdates);
  }, [urlUpdates, setUrls]);

  const cameraOptionUpdates = useMemo(() => {
    const option = props.cameraOption;
    if (!option) return null;

    const distance = option.distance ?? 15;
    const topDown = option.type === 'topDown';
    // First person reads these as eye offsets from the feet, not as an orbit around the character.
    const firstPerson = option.type === 'firstPerson';
    const nextOption: Partial<CameraOptionType> = {
      xDistance: option.xDistance ?? (topDown || firstPerson ? 0 : distance),
      yDistance: option.yDistance ?? option.height
        ?? (topDown ? distance : firstPerson ? CAMERA_DEFAULTS.FIRST_PERSON_EYE_HEIGHT : CAMERA_DEFAULTS.Y_DISTANCE),
      zDistance: option.zDistance ?? (topDown ? 0 : firstPerson ? CAMERA_DEFAULTS.FIRST_PERSON_FORWARD : distance),
    };

    if (option.fov !== undefined) nextOption.fov = option.fov;
    nextOption.zoom = option.zoom ?? CAMERA_DEFAULTS.ZOOM;
    nextOption.focus = CAMERA_DEFAULTS.FOCUS;
    if (option.enableZoom !== undefined) nextOption.enableZoom = option.enableZoom;
    if (option.minZoom !== undefined) nextOption.minZoom = option.minZoom;
    if (option.maxZoom !== undefined) nextOption.maxZoom = option.maxZoom;
    if (option.zoomSpeed !== undefined) nextOption.zoomSpeed = option.zoomSpeed;
    if (option.enableCollision !== undefined) nextOption.enableCollision = option.enableCollision;
    if (option.collisionMode !== undefined) nextOption.collisionMode = option.collisionMode;
    if (option.collisionFadeOpacity !== undefined) nextOption.collisionFadeOpacity = option.collisionFadeOpacity;
    if (option.dragOrbit !== undefined) nextOption.dragOrbit = option.dragOrbit;
    if (option.smoothness !== undefined) {
      nextOption.smoothing = {
        position: option.smoothness,
        rotation: option.smoothness,
        fov: option.smoothness,
      };
    }

    return nextOption;
  }, [props.cameraOption]);

  useLayoutEffect(() => {
    if (props.mode) {
      setMode(props.mode);
    }
    if (props.cameraOption) {
      setMode({ control: props.cameraOption.type });
    }
    if (cameraOptionUpdates) {
      const cameraOption = store.getState().cameraOption;
      const nextOption: CameraOptionType = {
        ...cameraOption,
        ...cameraOptionUpdates,
      };
      delete nextOption.offset;
      delete nextOption.focusTarget;
      replaceCameraOption(nextOption);
    }
  }, [cameraOptionUpdates, props.cameraOption, props.mode, props.runtimeRevision, replaceCameraOption, setMode, store]);

  return props.children;
}

export function GaesupWorldContent({ children, showGrid, showAxes, postProcessing, performance, quality }: {
  children?: ReactNode;
  showGrid?: boolean;
  showAxes?: boolean;
  /** Owns the canvas render loop. Use instead of mounting a second effect composer. */
  postProcessing?: boolean | WorldPostProcessingProps;
  /** Samples renderer stats into the store. Defaults to on outside production; `retainPerformanceSampling` also turns it on. */
  performance?: boolean;
  /**
   * Applies a quality profile: canvas pixel ratio (at most 1.5), shadow map size and post-processing preset, and
   * `postProcessing` stays off on tiers without it. Omit to keep each component's own defaults.
   */
  quality?: WorldQuality;
}) {
  const sampled = useGaesupStore((state) => state.performanceSamplers > 0);
  // The provider stays mounted without `quality` so turning it on or off does not remount the world.
  return (
    <QualityProfileProvider quality={quality}>
      <FrameSchedulerHost metrics={!isProductionEnv()} />
      <Suspense fallback={null}>
        <Camera/>
        {((performance ?? !isProductionEnv()) || sampled) && <PerformanceCollector />}
        <ShadowDepthMaterials />
        {/* Its own boundary: loading the effect chunk must not hide the world. */}
        {postProcessing && <Suspense fallback={null}><ProfiledPostProcessing props={typeof postProcessing === 'object' ? postProcessing : {}} /></Suspense>}
        <WorldContent showGrid={showGrid ?? false} showAxes={showAxes ?? false}>
          {children}
        </WorldContent>
      </Suspense>
    </QualityProfileProvider>
  );
}

const POST_PROCESSING_QUALITY = { low: 'performance', medium: 'balanced', high: 'quality' } as const;

/** The profile picks the preset unless the caller set one, and tiers without post-processing skip it. */
function ProfiledPostProcessing({ props }: { props: WorldPostProcessingProps }) {
  const profile = useQualityProfile();
  if (profile && !profile.postprocess) return null;
  const quality = props.quality ?? (profile ? POST_PROCESSING_QUALITY[profile.tier] : undefined);
  return <WorldPostProcessing {...props} {...(quality ? { quality } : {})} />;
}

