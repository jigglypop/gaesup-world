import { useEffect, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import type { RenderPipeline, WebGPURenderer } from 'three/webgpu';

import { ColorGrade } from './ColorGrade';
import { logger } from '../../utils/logger';
import { ToonOutlines } from '../outline';
import { isWebGPURenderer } from '../tsl/grass';

export type WorldPostProcessingProps = {
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  saturation?: number;
};

function NodeWorldPostProcessing({
  bloomStrength = 0.18,
  bloomRadius = 0.4,
  bloomThreshold = 1,
  saturation = 1.08,
}: WorldPostProcessingProps) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const pipelineRef = useRef<RenderPipeline | null>(null);

  useEffect(() => {
    let cancelled = false;
    let release: (() => void) | undefined;
    void Promise.all([
      import('three/webgpu'), import('three/tsl'), import('three/addons/tsl/display/BloomNode.js'),
    ]).then(([three, tsl, nodes]) => {
      if (cancelled) return;
      const scenePass = tsl.pass(scene, camera);
      let bloom: ReturnType<typeof nodes.bloom> | undefined;
      let pipeline: RenderPipeline | undefined;
      release = () => {
        if (pipelineRef.current === pipeline) pipelineRef.current = null;
        try { pipeline?.dispose(); } finally {
          try { bloom?.dispose(); } finally { scenePass.dispose(); }
        }
      };
      try {
        const sceneColor = scenePass.getTextureNode('output');
        bloom = nodes.bloom(sceneColor, bloomStrength, bloomRadius, bloomThreshold);
        pipeline = new three.RenderPipeline(gl as unknown as WebGPURenderer);
        pipeline.outputNode = tsl.vec4(tsl.saturation(sceneColor.rgb.add(bloom.rgb), saturation), sceneColor.a);
        pipelineRef.current = pipeline;
      } catch (error) {
        const cleanup = release;
        release = undefined;
        cleanup();
        throw error;
      }
    }).catch((error: unknown) => {
      logger.error('WebGPU postprocessing initialization failed', error instanceof Error ? error : String(error));
    });
    return () => {
      cancelled = true;
      release?.();
    };
  }, [gl, scene, camera, bloomStrength, bloomRadius, bloomThreshold, saturation]);

  useFrame(() => {
    if (pipelineRef.current) pipelineRef.current.render();
    else gl.render(scene, camera);
  }, 1);

  return null;
}

/** One render owner per canvas; TSL bloom/color on WebGPU and the existing effects on WebGL. */
export function WorldPostProcessing(props: WorldPostProcessingProps = {}) {
  const webgpu = useThree((state) => isWebGPURenderer(state.gl));
  return webgpu ? <NodeWorldPostProcessing {...props} /> : (
    <ToonOutlines edgeStrength={4} extraEffects={<ColorGrade intensity={0.8} />}>
      <group />
    </ToonOutlines>
  );
}
