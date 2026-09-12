import { useEffect, useMemo } from 'react';

import { InstancedBufferAttribute, Sprite } from 'three/webgpu';

import { BloomSpriteNodeMaterial } from '../../../rendering/tsl/fire';

export type NodeBloomEntry = { x: number; y: number; z: number; intensity: number };

export default function NodeBloomGlow({ entries, color }: {
  entries: NodeBloomEntry[];
  color: string;
}) {
  const sprite = useMemo(() => {
    const object = new Sprite(new BloomSpriteNodeMaterial(color));
    object.geometry = object.geometry.clone();
    const positions = new Float32Array(entries.length * 3);
    const scales = new Float32Array(entries.length * 2);
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index]!;
      const scale = 1.1 + entry.intensity * 0.18;
      positions[index * 3] = entry.x;
      positions[index * 3 + 1] = entry.y + 0.6;
      positions[index * 3 + 2] = entry.z;
      scales[index * 2] = scale;
      scales[index * 2 + 1] = scale;
    }
    object.geometry.setAttribute('bloomPosition', new InstancedBufferAttribute(positions, 3));
    object.geometry.setAttribute('bloomScale', new InstancedBufferAttribute(scales, 2));
    object.count = entries.length;
    object.frustumCulled = false;
    return object;
  }, [color, entries]);

  useEffect(() => () => {
    sprite.geometry.dispose();
    sprite.material.dispose();
  }, [sprite]);
  return <primitive object={sprite} />;
}
