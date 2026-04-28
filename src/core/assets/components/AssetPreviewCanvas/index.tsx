import { Suspense, useMemo } from 'react';

import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import type { AssetRecord } from '../../types';

export type AssetPreviewCanvasProps = {
  asset?: AssetRecord;
  size?: number;
  className?: string;
};

function ModelPreview({ url }: { url: string }) {
  const { scene } = useGLTF(url) as { scene: THREE.Object3D };
  const clone = useMemo(() => scene.clone(true), [scene]);

  return (
    <group scale={0.85} position={[0, -0.65, 0]}>
      <primitive object={clone} />
    </group>
  );
}

function SamplePreview({ color }: { color?: string }) {
  return (
    <mesh rotation={[-0.35, 0.55, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.05, 1.05, 1.05]} />
      <meshStandardMaterial color={color ?? '#7bd3a7'} roughness={0.72} metalness={0.05} />
    </mesh>
  );
}

function PreviewScene({ asset }: { asset: AssetRecord }) {
  const src = asset.previewUrl ?? asset.url;
  const canLoadModel = Boolean(src && (asset.kind === 'characterPart' || asset.kind === 'weapon' || asset.kind === 'object3d'));

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 3]} intensity={1.2} />
      {canLoadModel && src ? (
        <ModelPreview url={src} />
      ) : (
        <SamplePreview {...(asset.colors?.primary ? { color: asset.colors.primary } : {})} />
      )}
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.5} />
    </>
  );
}

export function AssetPreviewCanvas({ asset, size = 84, className }: AssetPreviewCanvasProps) {
  if (!asset) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
        }}
      />
    );
  }

  if (asset.thumbnailUrl) {
    return (
      <img
        className={className}
        src={asset.thumbnailUrl}
        alt={asset.name}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.05)',
        }}
      />
    );
  }

  return (
    <div className={className} style={{ width: size, height: size, borderRadius: 10, overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0.65, 2.4], fov: 42 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <PreviewScene asset={asset} />
        </Suspense>
      </Canvas>
    </div>
  );
}
