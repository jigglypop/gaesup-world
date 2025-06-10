import { useFrame, useThree } from "@react-three/fiber";
import { zoomAtom } from "@store/zoom/atom";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ZoomCamera() {
  const [{ zoom }] = useAtom(zoomAtom);
  const targetZoom = useRef(zoom);
  const { camera } = useThree();

  useEffect(() => {
    targetZoom.current = zoom;
  }, [zoom]);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
  }, []);

  useFrame(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.zoom = THREE.MathUtils.lerp(camera.zoom, targetZoom.current, 0.1);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
