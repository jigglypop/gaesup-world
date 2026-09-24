import { useEffect, useMemo, useRef, useState } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import type * as THREE from 'three';
import type { CSMShadowNode } from 'three/addons/csm/CSMShadowNode.js';

import { logger } from '../../utils/logger';

export type CascadedSunQuality = 'low' | 'medium' | 'high';
type CascadedSunMode = 'uniform' | 'logarithmic' | 'practical';

type ShadowQuality = {
  cascades: number;
  mapSize: number;
  maxFar: number;
  lightMargin: number;
};

const SHADOW_QUALITY: Record<CascadedSunQuality, ShadowQuality> = {
  low: { cascades: 2, mapSize: 512, maxFar: 80, lightMargin: 60 },
  medium: { cascades: 3, mapSize: 1024, maxFar: 140, lightMargin: 100 },
  high: { cascades: 4, mapSize: 2048, maxFar: 220, lightMargin: 140 },
};

type RendererBackend = {
  isWebGPUBackend?: boolean;
};

type RendererWithBackend = {
  backend?: RendererBackend;
  isWebGPURenderer?: boolean;
};

type ShadowNodeSlot = { shadowNode?: CSMShadowNode };

export type CascadedSunProps = {
  position?: THREE.Vector3Tuple;
  color?: THREE.ColorRepresentation;
  intensity?: number;
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
};

function isNativeWebGPURenderer(renderer: object): boolean {
  const candidate = renderer as RendererWithBackend;
  return candidate.isWebGPURenderer === true && candidate.backend?.isWebGPUBackend === true;
}

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
  return node;
}

/**
 * Directional sunlight with native WebGPU cascaded shadows and a single-map WebGL fallback.
 */
export function CascadedSun({
  position = [28, 36, 18],
  color = '#ffffff',
  intensity = 1.8,
  quality = 'medium',
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
}: CascadedSunProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const shadowNodeRef = useRef<CSMShadowNode | null>(null);
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

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    setShadowReady(false);
    light.shadow.radius = shadowRadius;
    if (!castShadow || !isNativeWebGPURenderer(renderer)) return;

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

  useFrame(() => {
    const node = shadowNodeRef.current;
    if (!node || node.camera === null || !projectionInitialized.current) return;

    const elements = camera.projectionMatrix.elements;
    for (let index = 0; index < 16; index += 1) {
      if (projectionElements[index] === elements[index]) continue;
      for (let copyIndex = 0; copyIndex < 16; copyIndex += 1) {
        projectionElements[copyIndex] = elements[copyIndex] ?? 0;
      }
      node.updateFrustums();
      break;
    }
  });

  return (
    <directionalLight
      key={`${camera.uuid}:${resolvedCascades}:${resolvedMapSize}:${resolvedMaxFar}:${resolvedLightMargin}:${mode}:${fade}:${shadowBias}:${shadowNormalBias}:${shadowRadius}`}
      ref={lightRef}
      castShadow={castShadow && (!isNativeWebGPURenderer(renderer) || shadowReady)}
      position={position}
      intensity={intensity}
      color={color}
      shadow-mapSize={[resolvedMapSize, resolvedMapSize]}
      shadow-camera-near={1}
      shadow-camera-far={resolvedMaxFar}
      shadow-camera-top={70}
      shadow-camera-right={70}
      shadow-camera-bottom={-70}
      shadow-camera-left={-70}
      shadow-bias={shadowBias}
      shadow-normalBias={shadowNormalBias}
    />
  );
}

export default CascadedSun;
