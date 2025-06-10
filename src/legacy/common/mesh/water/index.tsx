import { extend, Object3DNode, useFrame, useLoader } from "@react-three/fiber";
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

// 전역 캐시 객체
let cachedWaterNormals: THREE.Texture | null = null;

export default function Ocean() {
  const waterRef = useRef<Water>(null);

  // 텍스처 로딩 (캐싱 적용)
  const waterNormals = useMemo(() => {
    if (!cachedWaterNormals) {
      cachedWaterNormals = useLoader(
        THREE.TextureLoader,
        "public/resources/water_normal_map.jpeg"
      );
    } else {
      cachedWaterNormals.wrapS = cachedWaterNormals.wrapT =
        THREE.RepeatWrapping;
      cachedWaterNormals.repeat.set(4, 4); // 텍스처 반복 설정
    }

    return cachedWaterNormals;
  }, []);

  // 물 효과 설정
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

  // 물 지오메트리 생성
  const geom = useMemo(() => new THREE.PlaneGeometry(16, 16), []);

  // 시간 업데이트 최적화
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
      position={[0, 0, 0]}
    />
  );
}
