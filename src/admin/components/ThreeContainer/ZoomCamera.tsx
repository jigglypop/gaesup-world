import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export function ZoomCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.zoom = 1;
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
} 