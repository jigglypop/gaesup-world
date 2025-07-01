import { extend, Object3DNode, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Water } from "three-stdlib";

extend({ Water });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      water: Object3DNode<Water, typeof Water>;
    }
  }
}

export default function Ocean() {
  const waterRef = useRef<Water>(null);
  const waterNormals = useTexture("/resources/waternormals.jpeg");
  
  useMemo(() => {
    if (waterNormals) {
      waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
      waterNormals.repeat.set(4, 4);
    }
  }, [waterNormals]);
  
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(0.1, 0.7, 0.2),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
    }),
    [waterNormals]
  );
  
  const geom = useMemo(() => new THREE.PlaneGeometry(16, 16), []);
  
  useFrame((_, delta) => {
    if (waterRef.current) {
      waterRef.current.material.uniforms.time.value += delta * 0.3;
    }
  });

  return (
    <water
      ref={waterRef}
      args={[geom, config as any]}
      rotation-x={-Math.PI / 2}
      position={[0, 0.1, 0]}
    />
  );
}
