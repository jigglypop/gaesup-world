import { useEffect, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import { Matrix4, Quaternion, Vector3 } from 'three';
import type { Texture } from 'three';
import type { RenderPipeline, WebGPURenderer } from 'three/webgpu';

import { ColorGrade } from './ColorGrade';
import { logger } from '../../utils/logger';
import { ToonOutlines } from '../outline';
import { getRenderHistoryRevision } from '../renderHistory';
import { isWebGPURenderer } from '../tsl/grass';

export type WorldPostProcessingProps = {
  quality?: 'performance' | 'balanced' | 'quality';
  antialias?: 'none' | 'traa';
  ambientOcclusion?: boolean;
  aoRadius?: number;
  aoSamples?: number;
  aoResolutionScale?: number;
  /** Increment after teleport, world replacement, or authoritative network correction. */
  historyVersion?: number;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  saturation?: number;
};

function NodeWorldPostProcessing({
  quality = 'balanced',
  antialias = quality === 'performance' ? 'none' : 'traa',
  ambientOcclusion = quality !== 'performance',
  aoRadius = 2,
  aoSamples = quality === 'quality' ? 16 : 8,
  aoResolutionScale = quality === 'quality' ? 1 : 0.5,
  historyVersion = 0,
  bloomStrength = 0.18,
  bloomRadius = 0.4,
  bloomThreshold = 1,
  saturation = 1.08,
}: WorldPostProcessingProps) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
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
  const settingsRef = useRef({
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    saturation,
    aoRadius,
    aoSamples,
    aoResolutionScale,
  });
  const updateSettingsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    temporalRef.current?.setSize(1, 1);
    cameraHistory.current.initialized = false;
  }, [historyVersion]);

  useEffect(() => {
    settingsRef.current = {
      bloomStrength,
      bloomRadius,
      bloomThreshold,
      saturation,
      aoRadius,
      aoSamples,
      aoResolutionScale,
    };
    updateSettingsRef.current?.();
  }, [
    bloomStrength,
    bloomRadius,
    bloomThreshold,
    saturation,
    aoRadius,
    aoSamples,
    aoResolutionScale,
  ]);

  useEffect(() => {
    let cancelled = false;
    let release: (() => void) | undefined;
    void Promise.all([
      import('three/webgpu'),
      import('three/tsl'),
      import('three/addons/tsl/display/BloomNode.js'),
      antialias === 'traa' ? import('three/addons/tsl/display/TRAANode.js') : null,
      ambientOcclusion ? import('three/addons/tsl/display/GTAONode.js') : null,
    ])
      .then(([three, tsl, nodes, temporalModule, aoModule]) => {
        if (cancelled) return;
        const scenePass = tsl.pass(scene, camera);
        let bloom: ReturnType<typeof nodes.bloom> | undefined;
        let pipeline: RenderPipeline | undefined;
        let temporal: import('three/addons/tsl/display/TRAANode.js').default | undefined;
        let ao: import('three/addons/tsl/display/GTAONode.js').default | undefined;
        // r185 addon dispose() omits these privately owned auxiliary textures.
        const auxiliaryTextures: Texture[] = [];
        release = () => {
          if (pipelineRef.current === pipeline) {
            pipelineRef.current = null;
            updateSettingsRef.current = null;
            temporalRef.current = null;
          }
          try {
            pipeline?.dispose();
          } finally {
            try {
              bloom?.dispose();
            } finally {
              try {
                temporal?.dispose();
              } finally {
                try {
                  ao?.dispose();
                } finally {
                  for (const texture of auxiliaryTextures) texture.dispose();
                  scenePass.dispose();
                }
              }
            }
          }
        };
        try {
          if (antialias === 'traa' || ambientOcclusion) {
            scenePass.setMRT(
              tsl.mrt({
                output: tsl.output,
                ...(antialias === 'traa' ? { velocity: tsl.velocity } : {}),
                ...(ambientOcclusion ? { normal: tsl.normalView } : {}),
              }),
            );
            // TRAA requires non-MSAA depth/velocity inputs.
            (scenePass as unknown as { options: { samples?: number } }).options.samples = 0;
          }
          let sceneColor = scenePass.getTextureNode('output');
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
          const settings = settingsRef.current;
          bloom = nodes.bloom(
            sceneColor,
            settings.bloomStrength,
            settings.bloomRadius,
            settings.bloomThreshold,
          );
          const saturationValue = tsl.uniform(settings.saturation);
          const activeBloom = bloom;
          pipeline = new three.RenderPipeline(gl as unknown as WebGPURenderer);
          pipeline.outputNode = tsl.vec4(
            tsl.saturation(gradedColor.add(bloom.rgb), saturationValue),
            sceneColor.a,
          );
          pipelineRef.current = pipeline;
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
  }, [gl, scene, camera, antialias, ambientOcclusion]);

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
  const webgpu = useThree((state) => isWebGPURenderer(state.gl));
  return webgpu ? (
    <NodeWorldPostProcessing {...props} />
  ) : (
    <ToonOutlines edgeStrength={4} extraEffects={<ColorGrade intensity={0.8} />}>
      <group />
    </ToonOutlines>
  );
}
