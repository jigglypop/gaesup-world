import { useEffect, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import { Matrix4, Quaternion, Vector3 } from 'three';
import type { PerspectiveCamera, Texture } from 'three';
import type { RenderPipeline, WebGPURenderer } from 'three/webgpu';

import { ColorGrade } from './ColorGrade';
import {
  createScreenSpaceLighting,
  disposeAll,
  loadScreenSpaceLighting,
  surfaceOutputs,
  type ScreenSpaceLighting,
  type ScreenSpaceLightingSettings,
} from './screenSpaceLighting';
import { logger } from '../../utils/logger';
import { compileSceneAsync, setSceneRenderTarget } from '../CompileGate';
import { ToonOutlines } from '../outline';
import { getRenderHistoryRevision } from '../renderHistory';
import { hasWebGPUFeature, rendererKind } from '../webgpu';

export type WorldPostProcessingProps = {
  /** Preset for the defaults below. `cinematic` is `quality` plus screen-space GI and reflections. */
  quality?: 'performance' | 'balanced' | 'quality' | 'cinematic';
  antialias?: 'none' | 'traa';
  ambientOcclusion?: boolean;
  aoRadius?: number;
  aoSamples?: number;
  aoResolutionScale?: number;
  /**
   * Screen-space global illumination: one bounce of indirect diffuse light with its own occlusion, which takes the
   * place of `ambientOcclusion`. Needs a WebGPU device and a perspective camera; elsewhere it stays off.
   */
  globalIllumination?: boolean;
  /** World units a surface gathers bounced light and occlusion from. */
  giRadius?: number;
  /** Samples along each gathering direction, 1–32. Cost grows with it. */
  giSteps?: number;
  /** Strength of the bounced light. */
  giIntensity?: number;
  /** Fraction of the canvas resolution GI renders at, 0.25–1. */
  giResolutionScale?: number;
  /** Screen-space reflections on metals and glossy surfaces. Needs a WebGPU device; elsewhere it stays off. */
  reflections?: boolean;
  /** World units a reflected ray travels. */
  reflectionDistance?: number;
  /** Ray-march density, 0.05–1. Cost grows with it. */
  reflectionQuality?: number;
  reflectionIntensity?: number;
  /** Fraction of the canvas resolution reflections render at, 0.25–1. */
  reflectionResolutionScale?: number;
  /** Surfaces rougher than this reflect nothing and march no rays. */
  reflectionMaxRoughness?: number;
  /** Increment after teleport, world replacement, or authoritative network correction. */
  historyVersion?: number;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  saturation?: number;
};

type PipelineSettings = ScreenSpaceLightingSettings & {
  bloomStrength: number;
  bloomRadius: number;
  bloomThreshold: number;
  saturation: number;
  aoRadius: number;
  aoSamples: number;
  aoResolutionScale: number;
};

/** SSGI writes its bounced light to RG11B10 float targets. */
const GI_TARGET_FEATURE = 'rg11b10ufloat-renderable';

const fullAo = (quality: WorldPostProcessingProps['quality']) => quality === 'quality' || quality === 'cinematic';

function NodeWorldPostProcessing({
  quality = 'balanced',
  antialias = quality === 'performance' ? 'none' : 'traa',
  ambientOcclusion = quality !== 'performance',
  aoRadius = 2,
  aoSamples = fullAo(quality) ? 16 : 8,
  aoResolutionScale = fullAo(quality) ? 1 : 0.5,
  globalIllumination = quality === 'cinematic',
  giRadius = 4,
  giSteps = 8,
  giIntensity = 8,
  giResolutionScale = 0.5,
  reflections = quality === 'cinematic',
  reflectionDistance = 8,
  reflectionQuality = 0.5,
  reflectionIntensity = 1,
  reflectionResolutionScale = 0.5,
  reflectionMaxRoughness = 0.5,
  historyVersion = 0,
  bloomStrength = 0.18,
  bloomRadius = 0.4,
  bloomThreshold = 1,
  saturation = 1.08,
}: WorldPostProcessingProps) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  // Screen-space GI and reflections run on WebGPU devices only; the WebGL2 backend keeps the other effects.
  const gi = globalIllumination && (camera as PerspectiveCamera).isPerspectiveCamera === true && hasWebGPUFeature(gl, GI_TARGET_FEATURE);
  const ssr = reflections && rendererKind(gl) === 'webgpu';
  const gtao = ambientOcclusion && !gi;
  const pipelineRef = useRef<RenderPipeline | null>(null);
  const temporalRef = useRef<{ setSize(width: number, height: number): void } | null>(null);
  const cameraHistory = useRef({
    position: new Vector3(),
    quaternion: new Quaternion(),
    projection: new Matrix4(),
    revision: -1,
    initialized: false,
  });
  const savedProjection = useRef(new Matrix4());
  const savedInverse = useRef(new Matrix4());
  const settings: PipelineSettings = {
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    saturation,
    aoRadius,
    aoSamples,
    aoResolutionScale,
    giRadius,
    giSteps,
    giIntensity,
    giResolutionScale,
    reflectionDistance,
    reflectionQuality,
    reflectionIntensity,
    reflectionResolutionScale,
    reflectionMaxRoughness,
  };
  const settingsRef = useRef(settings);
  const updateSettingsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    temporalRef.current?.setSize(1, 1);
    cameraHistory.current.initialized = false;
  }, [historyVersion]);

  // Numeric controls only move uniforms, so each render applies them without rebuilding the pipeline.
  useEffect(() => {
    settingsRef.current = settings;
    updateSettingsRef.current?.();
  });

  useEffect(() => {
    let cancelled = false;
    let release: (() => void) | undefined;
    const temporalAa = antialias === 'traa';
    void Promise.all([
      import('three/webgpu'),
      import('three/tsl'),
      import('three/addons/tsl/display/BloomNode.js'),
      temporalAa ? import('three/addons/tsl/display/TRAANode.js') : null,
      gtao ? import('three/addons/tsl/display/GTAONode.js') : null,
      gi || ssr ? loadScreenSpaceLighting(gi, ssr) : null,
    ])
      .then(([three, tsl, nodes, temporalModule, aoModule, lightingModules]) => {
        if (cancelled) return;
        const scenePass = tsl.pass(scene, camera);
        let bloom: ReturnType<typeof nodes.bloom> | undefined;
        let pipeline: RenderPipeline | undefined;
        let temporal: import('three/addons/tsl/display/TRAANode.js').default | undefined;
        let ao: import('three/addons/tsl/display/GTAONode.js').default | undefined;
        let lighting: ScreenSpaceLighting | undefined;
        // r185 addon dispose() omits these privately owned auxiliary textures.
        const auxiliaryTextures: Texture[] = [];
        release = () => {
          if (pipelineRef.current === pipeline) {
            setSceneRenderTarget(gl as unknown as WebGPURenderer, null);
            pipelineRef.current = null;
            updateSettingsRef.current = null;
            temporalRef.current = null;
          }
          disposeAll([pipeline, bloom, temporal, ao, lighting, ...auxiliaryTextures, scenePass]);
        };
        try {
          if (temporalAa || gtao || lightingModules) {
            scenePass.setMRT(
              tsl.mrt({
                output: tsl.output,
                ...(temporalAa ? { velocity: tsl.velocity } : {}),
                ...(lightingModules ? surfaceOutputs(tsl) : gtao ? { normal: tsl.normalView } : {}),
              }),
            );
            // TRAA requires non-MSAA depth/velocity inputs.
            (scenePass as unknown as { options: { samples?: number } }).options.samples = 0;
          }
          let sceneColor = scenePass.getTextureNode('output');
          if (lightingModules) {
            lighting = createScreenSpaceLighting(tsl, lightingModules, scenePass, camera, temporalAa);
            sceneColor = lighting.color;
          }
          if (temporalModule) {
            temporal = temporalModule.traa(
              sceneColor,
              scenePass.getTextureNode('depth'),
              scenePass.getTextureNode('velocity'),
              camera,
            );
            const previousDepth = (
              temporal as unknown as { _previousDepthNode?: { value: Texture } }
            )._previousDepthNode?.value;
            if (previousDepth) auxiliaryTextures.push(previousDepth);
            const temporalApi = temporal as typeof temporal & {
              setSize(width: number, height: number): void;
              getTextureNode(): typeof sceneColor;
            };
            sceneColor = temporalApi.getTextureNode();
          }
          let gradedColor = sceneColor.rgb;
          if (aoModule) {
            ao = aoModule.ao(
              scenePass.getTextureNode('depth'),
              scenePass.getTextureNode('normal'),
              camera,
            );
            const noise = (ao as unknown as { _noiseNode?: { value: Texture } })._noiseNode?.value;
            if (noise) auxiliaryTextures.push(noise);
            gradedColor = gradedColor.mul(ao.getTextureNode().r);
          }
          if (cancelled) {
            release?.();
            release = undefined;
            return;
          }
          const initial = settingsRef.current;
          bloom = nodes.bloom(
            sceneColor,
            initial.bloomStrength,
            initial.bloomRadius,
            initial.bloomThreshold,
          );
          const saturationValue = tsl.uniform(initial.saturation);
          const activeBloom = bloom;
          pipeline = new three.RenderPipeline(gl as unknown as WebGPURenderer);
          pipeline.outputNode = tsl.vec4(
            tsl.saturation(gradedColor.add(bloom.rgb), saturationValue),
            sceneColor.a,
          );
          // New content compiles for the pass that draws the scene and its outputs, not for the canvas it never renders to.
          setSceneRenderTarget(gl as unknown as WebGPURenderer, { renderTarget: scenePass.renderTarget, mrt: scenePass.getMRT() });
          // The pass takes over drawing once the scene's pipelines for it and for its shadows are built; switching first
          // would build all of them on the frames after. Until then the scene keeps drawing directly.
          const takeOver = pipeline;
          const compiling = compileSceneAsync(gl, scene, camera);
          if (compiling) void compiling.catch(() => undefined).then(() => { if (!cancelled) pipelineRef.current = takeOver; });
          else pipelineRef.current = pipeline;
          temporalRef.current =
            (temporal as typeof temporal & { setSize(width: number, height: number): void }) ??
            null;
          updateSettingsRef.current = () => {
            const next = settingsRef.current;
            activeBloom.strength.value = next.bloomStrength;
            activeBloom.radius.value = next.bloomRadius;
            activeBloom.threshold.value = next.bloomThreshold;
            saturationValue.value = next.saturation;
            if (ao) {
              ao.radius.value = Math.max(0.01, next.aoRadius);
              ao.samples.value = Math.max(1, Math.round(next.aoSamples));
              ao.resolutionScale = Math.min(1, Math.max(0.25, next.aoResolutionScale));
            }
            lighting?.update(next);
          };
          updateSettingsRef.current();
        } catch (error) {
          const cleanup = release;
          release = undefined;
          cleanup?.();
          throw error;
        }
      })
      .catch((error: unknown) => {
        logger.error(
          'WebGPU postprocessing initialization failed',
          error instanceof Error ? error : String(error),
        );
      });
    return () => {
      cancelled = true;
      release?.();
    };
  }, [gl, scene, camera, antialias, gtao, gi, ssr]);

  useFrame(() => {
    const history = cameraHistory.current;
    const revision = getRenderHistoryRevision(scene);
    if (
      history.initialized &&
      (history.revision !== revision ||
        history.position.distanceToSquared(camera.position) > 25 ||
        Math.abs(history.quaternion.dot(camera.quaternion)) < 0.8 ||
        !history.projection.equals(camera.projectionMatrix))
    )
      temporalRef.current?.setSize(1, 1);
    history.position.copy(camera.position);
    history.quaternion.copy(camera.quaternion);
    history.projection.copy(camera.projectionMatrix);
    history.revision = revision;
    history.initialized = true;
    if (pipelineRef.current) {
      savedProjection.current.copy(camera.projectionMatrix);
      savedInverse.current.copy(camera.projectionMatrixInverse);
      const view = 'view' in camera && camera.view ? { ...camera.view } : null;
      try {
        pipelineRef.current.render();
      } finally {
        camera.projectionMatrix.copy(savedProjection.current);
        camera.projectionMatrixInverse.copy(savedInverse.current);
        if ('view' in camera) camera.view = view;
      }
    } else gl.render(scene, camera);
  }, 1);

  return null;
}

/** One render owner per canvas; TSL bloom/color on WebGPU and the existing effects on WebGL. */
export function WorldPostProcessing(props: WorldPostProcessingProps = {}) {
  const webgpu = useThree((state) => rendererKind(state.gl) !== 'webgl');
  return webgpu ? (
    <NodeWorldPostProcessing {...props} />
  ) : (
    <ToonOutlines edgeStrength={4} extraEffects={<ColorGrade intensity={0.8} />}>
      <group />
    </ToonOutlines>
  );
}
