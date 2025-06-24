import { useFrame, useThree } from '@react-three/fiber';
import { useGaesupStore } from '../../stores/gaesupStore';

export function PerformanceTracker() {
  const { gl } = useThree();
  const setPerformance = useGaesupStore((state) => state.setPerformance);

  useFrame(() => {
    setPerformance({
      render: {
        calls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        points: gl.info.render.points,
        lines: gl.info.render.lines,
      },
      engine: {
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
      },
    });
  });

  return null;
} 