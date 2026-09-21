import { useEffect, useLayoutEffect, useMemo } from 'react';

import { DoubleSide, ShaderMaterial } from 'three';

import type { GrassMaterialInstance } from './type';
import vertexShader from './vert.glsl';

/** The depth pass uses the exact blade deformation and cutout of the color pass. */
export function GrassDepthMaterial({ source }: { source: React.RefObject<GrassMaterialInstance | null> }) {
  const material = useMemo(() => new ShaderMaterial({
    vertexShader, side: DoubleSide, defines: { GRASS_DEPTH: 1 },
    fragmentShader: `
      #include <packing>
      uniform sampler2D alphaMap;
      varying vec2 vUv;
      void main() {
        if (texture2D(alphaMap, vUv).r < 0.15) discard;
        gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
      }`,
  }), []);
  useLayoutEffect(() => { if (source.current) material.uniforms = source.current.uniforms; }, [material, source]);
  useEffect(() => () => material.dispose(), [material]);
  return <primitive object={material} attach="customDepthMaterial" />;
}
