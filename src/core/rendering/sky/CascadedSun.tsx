import { useEffect, useMemo, useRef, useState } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { CSMShadowNode } from 'three/addons/csm/CSMShadowNode.js';

import { skipNearOnlyCasters } from './nearShadow';
import { placeShadowLight, shadowFocus } from './shadowFollow';
import { createShadowSchedule, type ShadowRefreshRate } from './shadowSchedule';
import { useQualityProfile } from '../../perf/quality';
import { useEngineFrame } from '../../runtime/frame';
import { useGaesupStore } from '../../stores/gaesupStore';
import { logger } from '../../utils/logger';
import { rendererKind } from '../webgpu';

/** Half-size of the single-map fallback shadow box. */
const FALLBACK_SHADOW_RANGE = 70;
/** A camera move longer than this in one frame (a teleport or a cut) redraws every cascade. */
const CAMERA_JUMP = 6;
/** A sun turn larger than about 0.25° redraws every cascade. */
const SUN_TURN_COS = Math.cos(THREE.MathUtils.degToRad(0.25));

export type CascadedSunQuality = 'low' | 'medium' | 'high';
type CascadedSunMode = 'uniform' | 'logarithmic' | 'practical';

type ShadowQuality = {
  cascades: number;
  mapSize: number;
  maxFar: number;
  lightMargin: number;
  updateHz: ShadowRefreshRate;
};

/**
 * Every cascade redraw is another pass over the casters, and a WebGPU draw costs CPU time. At 30 Hz a walking
 * character's shadow trails by a few centimetres at most, so no tier redraws every frame; the farther cascades take
 * turns at a lower rate.
 */
const SHADOW_QUALITY: Record<CascadedSunQuality, ShadowQuality> = {
  low: { cascades: 2, mapSize: 512, maxFar: 80, lightMargin: 60, updateHz: { near: 20, far: 5 } },
  medium: { cascades: 3, mapSize: 1024, maxFar: 140, lightMargin: 100, updateHz: { near: 30, far: 10 } },
  high: { cascades: 4, mapSize: 2048, maxFar: 220, lightMargin: 140, updateHz: { near: 30, far: 15 } },
};

type ShadowNodeSlot = { shadowNode?: CSMShadowNode };
type CascadeLights = { lights?: { shadow: THREE.LightShadow }[] };

function resolveUpdateHz(value: number | Partial<ShadowRefreshRate> | undefined, preset: ShadowRefreshRate): ShadowRefreshRate {
  if (typeof value === 'number') return { near: value, far: value };
  return { near: value?.near ?? preset.near, far: value?.far ?? preset.far };
}

export type CascadedSunProps = {
  position?: THREE.Vector3Tuple;
  color?: THREE.ColorRepresentation;
  intensity?: number;
  /** Defaults to the world quality profile's tier, else `medium`. */
  quality?: CascadedSunQuality;
  castShadow?: boolean;
  cascades?: number;
  maxFar?: number;
  mode?: CascadedSunMode;
  lightMargin?: number;
  fade?: boolean;
  shadowMapSize?: number;
  shadowBias?: number;
  shadowNormalBias?: number;
  shadowRadius?: number;
  /**
   * Shadow redraws a second for the nearest cascade (also the single WebGL map) and for each farther one. A number sets
   * both; `Infinity` redraws every frame. Defaults to the quality tier's rates.
   */
  updateHz?: number | Partial<ShadowRefreshRate>;
};

async function createCascadedShadow(
  light: THREE.DirectionalLight,
  options: {
    cascades: number;
    maxFar: number;
    mode: CascadedSunMode;
    lightMargin: number;
    fade: boolean;
  },
): Promise<CSMShadowNode> {
  const { CSMShadowNode: CSMShadowNodeConstructor } = await import(
    'three/addons/csm/CSMShadowNode.js'
  );
  const node = new CSMShadowNodeConstructor(light, {
    cascades: options.cascades,
    maxFar: options.maxFar,
    mode: options.mode,
    lightMargin: options.lightMargin,
  });
  node.fade = options.fade;
  // three creates the cascades when the node first builds. All but the nearest leave the near-only casters out, and each
  // cascade redraws only when the sun's schedule asks for it.
  const cascaded = node as unknown as CascadeLights & { _init?: (...args: unknown[]) => void; _shadowNodes?: Parameters<typeof skipNearOnlyCasters>[0][] };
  const init = cascaded._init;
  if (typeof init === 'function') {
    cascaded._init = function (this: unknown, ...args: unknown[]) {
      init.apply(this, args);
      cascaded._shadowNodes?.slice(1).forEach(skipNearOnlyCasters);
      cascaded.lights?.forEach(({ shadow }) => {
        shadow.autoUpdate = false;
        shadow.needsUpdate = true;
      });
    };
  }
  return node;
}

/**
 * Directional sunlight with native WebGPU cascaded shadows and a single-map WebGL fallback.
 */
export function CascadedSun({
  position = [28, 36, 18],
  color = '#ffffff',
  intensity = 1.8,
  quality: qualityProp,
  castShadow = true,
  cascades,
  maxFar,
  mode = 'practical',
  lightMargin,
  fade = true,
  shadowMapSize,
  shadowBias = -0.00015,
  shadowNormalBias = 0.04,
  shadowRadius = 1,
  updateHz,
}: CascadedSunProps) {
  const profile = useQualityProfile();
  const quality = qualityProp ?? profile?.tier ?? 'medium';
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const sunOffset = useMemo(() => new THREE.Vector3(...position), [position]);
  const focus = useMemo(() => new THREE.Vector3(), []);
  const shadowNodeRef = useRef<CSMShadowNode | null>(null);
  const lastSunDirection = useMemo(() => new THREE.Vector3(), []);
  const lastCamera = useMemo(() => new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN), []);
  const [shadowReady, setShadowReady] = useState(false);
  const renderer = useThree((state) => state.gl) as unknown as object;
  const camera = useThree((state) => state.camera);
  const projectionElements = useMemo(() => new Float64Array(16), []);
  const projectionInitialized = useRef(false);
  const preset = SHADOW_QUALITY[quality];
  const resolvedCascades = cascades ?? preset.cascades;
  const resolvedMaxFar = maxFar ?? preset.maxFar;
  const resolvedLightMargin = lightMargin ?? preset.lightMargin;
  const resolvedMapSize = shadowMapSize ?? preset.mapSize;
  const { near: nearHz, far: farHz } = resolveUpdateHz(updateHz, preset.updateHz);
  const webgpu = rendererKind(renderer) === 'webgpu';
  const mapCount = webgpu ? resolvedCascades : 1;
  const schedule = useMemo(() => createShadowSchedule(mapCount, { near: nearHz, far: farHz }), [mapCount, nearHz, farHz]);
  const setShadow = useGaesupStore((state) => state.setShadow);
  useEffect(() => {
    if (!castShadow) return undefined;
    setShadow({ maps: mapCount, mapSize: resolvedMapSize, nearHz, farHz });
    return () => setShadow(null);
  }, [castShadow, farHz, mapCount, nearHz, resolvedMapSize, setShadow]);

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    setShadowReady(false);
    light.shadow.radius = shadowRadius;
    if (!castShadow || rendererKind(renderer) !== 'webgpu') return;

    let cancelled = false;
    const shadow = light.shadow as unknown as ShadowNodeSlot;
    void createCascadedShadow(light, {
      cascades: resolvedCascades,
      maxFar: resolvedMaxFar,
      mode,
      lightMargin: resolvedLightMargin,
      fade,
    })
      .then((node) => {
        if (cancelled) {
          node.dispose();
          return;
        }
        shadow.shadowNode = node;
        shadowNodeRef.current = node;
        setShadowReady(true);
        const elements = camera.projectionMatrix.elements;
        for (let index = 0; index < 16; index += 1) {
          projectionElements[index] = elements[index] ?? 0;
        }
        projectionInitialized.current = true;
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setShadowReady(true);
        logger.error(
          'Cascaded sun shadow initialization failed',
          error instanceof Error ? error : String(error),
        );
      });

    return () => {
      cancelled = true;
      const node = shadowNodeRef.current;
      if (!node) return;
      if (shadow.shadowNode === node) delete shadow.shadowNode;
      shadowNodeRef.current = null;
      projectionInitialized.current = false;
      node.dispose();
    };
  }, [
    camera,
    castShadow,
    fade,
    mode,
    projectionElements,
    renderer,
    resolvedCascades,
    resolvedLightMargin,
    resolvedMaxFar,
    resolvedMapSize,
    shadowBias,
    shadowNormalBias,
    shadowRadius,
  ]);

  // After the camera phase, so the shadow follows this frame's camera and projection.
  useEngineFrame('effects', (delta) => {
    const light = lightRef.current;
    if (!light || !castShadow) return;
    // Without native cascades the single map follows the view, snapped to texels, instead of staying at the origin.
    if (!webgpu) {
      placeShadowLight(light, shadowFocus(camera, FALLBACK_SHADOW_RANGE, focus), sunOffset, (FALLBACK_SHADOW_RANGE * 2) / resolvedMapSize);
      light.shadow.autoUpdate = false;
    }

    // A turned sun, a cut or a new projection leaves every map stale at once.
    let redrawAll = false;
    const direction = focus.copy(light.position).sub(light.target.position).normalize();
    if (!(direction.dot(lastSunDirection) >= SUN_TURN_COS)) {
      lastSunDirection.copy(direction);
      redrawAll = true;
    }
    const cameraPosition = camera.getWorldPosition(focus);
    if (!(cameraPosition.distanceTo(lastCamera) <= CAMERA_JUMP)) redrawAll = true;
    lastCamera.copy(cameraPosition);

    const node = shadowNodeRef.current;
    if (node && node.camera !== null && projectionInitialized.current) {
      const elements = camera.projectionMatrix.elements;
      for (let index = 0; index < 16; index += 1) {
        if (projectionElements[index] === elements[index]) continue;
        for (let copyIndex = 0; copyIndex < 16; copyIndex += 1) {
          projectionElements[copyIndex] = elements[copyIndex] ?? 0;
        }
        node.updateFrustums();
        redrawAll = true;
        break;
      }
    }

    const due = schedule.tick(delta, redrawAll);
    if (!webgpu) {
      if (due[0]) light.shadow.needsUpdate = true;
      return;
    }
    (node as CascadeLights | null)?.lights?.forEach(({ shadow }, index) => {
      if (due[index]) shadow.needsUpdate = true;
    });
  }, { label: 'rendering:cascaded-sun' });

  return (
    <directionalLight
      key={`${camera.uuid}:${resolvedCascades}:${resolvedMapSize}:${resolvedMaxFar}:${resolvedLightMargin}:${mode}:${fade}:${shadowBias}:${shadowNormalBias}:${shadowRadius}`}
      ref={lightRef}
      castShadow={castShadow && (rendererKind(renderer) !== 'webgpu' || shadowReady)}
      position={position}
      intensity={intensity}
      color={color}
      shadow-mapSize={[resolvedMapSize, resolvedMapSize]}
      shadow-camera-near={1}
      shadow-camera-far={resolvedMaxFar}
      shadow-camera-top={FALLBACK_SHADOW_RANGE}
      shadow-camera-right={FALLBACK_SHADOW_RANGE}
      shadow-camera-bottom={-FALLBACK_SHADOW_RANGE}
      shadow-camera-left={-FALLBACK_SHADOW_RANGE}
      shadow-bias={shadowBias}
      shadow-normalBias={shadowNormalBias}
    />
  );
}

export default CascadedSun;
