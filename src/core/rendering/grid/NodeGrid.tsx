import { useEffect, useMemo } from 'react';

import { Color, DoubleSide, PlaneGeometry } from 'three';
import { abs, cameraPosition, float, fract, fwidth, max, min, mix, positionLocal, positionWorld, pow, vec3 } from 'three/tsl';
import { MeshBasicNodeMaterial } from 'three/webgpu';

import type { WorldGridProps } from './WorldGrid';

export default function NodeGrid({
  args,
  cellSize = 0.5,
  cellThickness = 0.5,
  cellColor = '#000000',
  sectionSize = 1,
  sectionThickness = 1,
  sectionColor = '#2080ff',
  fadeDistance = 100,
  fadeStrength = 1,
  fadeFrom = 1,
  infiniteGrid = false,
  followCamera = false,
  side = DoubleSide,
  ...props
}: WorldGridProps) {
  const width = infiniteGrid ? Math.max(1, fadeDistance) * 4 : (args?.[0] ?? 1);
  const height = infiniteGrid ? Math.max(1, fadeDistance) * 4 : (args?.[1] ?? 1);
  const geometry = useMemo(() => new PlaneGeometry(width, height).rotateX(-Math.PI / 2), [width, height]);
  const material = useMemo(() => {
    const nodeMaterial = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side });
    if (followCamera) {
      nodeMaterial.positionNode = positionLocal.add(vec3(cameraPosition.x, 0, cameraPosition.z));
    }
    const line = (size: number, thickness: number) => {
      const coordinate = positionWorld.xz.div(Math.max(size, 0.0001));
      const distance = abs(fract(coordinate.sub(0.5)).sub(0.5)).div(max(fwidth(coordinate), 0.0001));
      return float(thickness).sub(min(distance.x, distance.y)).clamp(0, 1);
    };
    const cell = line(cellSize, cellThickness);
    const section = line(sectionSize, sectionThickness);
    const cameraOnGrid = vec3(cameraPosition.x, 0, cameraPosition.z);
    const origin = mix(vec3(0), cameraOnGrid, fadeFrom);
    const fade = pow(float(1).sub(positionWorld.xz.sub(origin.xz).length().div(Math.max(0.0001, fadeDistance))).clamp(0, 1), fadeStrength);
    nodeMaterial.colorNode = mix(
      new Color(cellColor),
      new Color(sectionColor),
      min(1, section.mul(sectionThickness)),
    );
    const opacity = cell.add(section).mul(fade);
    nodeMaterial.opacityNode = mix(opacity.mul(0.75), opacity, section);
    return nodeMaterial;
  }, [cellColor, cellSize, cellThickness, fadeDistance, fadeFrom, fadeStrength, followCamera, infiniteGrid, sectionColor, sectionSize, sectionThickness, side]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh {...props} geometry={geometry} material={material} frustumCulled={false} dispose={null} />;
}
