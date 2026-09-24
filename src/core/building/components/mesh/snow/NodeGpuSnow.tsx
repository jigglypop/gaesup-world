import { useEffect, useMemo } from 'react';

import { InstancedBufferAttribute, Sprite } from 'three/webgpu';

import { SnowNodeMaterial } from '../../../../rendering/tsl/snow';
import { useSharedFrame, type SharedFrameChannel } from '../../../../runtime/frame';

const NODE_SNOW_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:snow-node' };

export default function NodeGpuSnow({ followCamera, count, halfRange, height }: {
  followCamera: boolean; count: number; halfRange: number; height: number;
}) {
  const sprite = useMemo(() => {
    const object = new Sprite(new SnowNodeMaterial(halfRange, height));
    object.geometry = object.geometry.clone();
    const particles = new Float32Array(count * 4);
    const drift = new Float32Array(count);
    for (let index = 0; index < count; index++) {
      const offset = index * 4;
      particles[offset] = Math.random();
      particles[offset + 1] = (Math.random() - 0.5) * halfRange * 2;
      particles[offset + 2] = (Math.random() - 0.5) * halfRange * 2;
      particles[offset + 3] = 0.5 + Math.random() * 1.5;
      drift[index] = 0.05 + Math.random() * 0.25;
    }
    object.geometry.setAttribute('snowParticle', new InstancedBufferAttribute(particles, 4));
    object.geometry.setAttribute('snowDrift', new InstancedBufferAttribute(drift, 1));
    object.count = count;
    object.frustumCulled = false;
    return object;
  }, [count, halfRange, height]);
  useEffect(() => () => { sprite.geometry.dispose(); sprite.material.dispose(); }, [sprite]);
  useSharedFrame(NODE_SNOW_FRAME, (_delta, _elapsedSeconds, three) => {
    if (sprite.parent && !sprite.parent.visible) return;
    const material = sprite.material as SnowNodeMaterial;
    material.pixelScale = three.gl.domElement.height * 0.5;
    if (followCamera) material.origin.copy(three.camera.position);
  });
  return <primitive object={sprite} />;
}
