import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import type { AssetRecord } from '../../types';

export type AssetPreviewCanvasProps = {
  asset?: AssetRecord;
  size?: number;
  className?: string;
};

type PreviewBoundaryProps = { children: ReactNode; source: string; name: string };

class PreviewBoundary extends Component<PreviewBoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidUpdate(previous: PreviewBoundaryProps) {
    if (this.state.failed && previous.source !== this.props.source) this.setState({ failed: false });
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div
        role="img"
        aria-label={`${this.props.name} 미리보기를 불러오지 못했습니다`}
        style={{ display: 'grid', placeItems: 'center', height: '100%', padding: 8, boxSizing: 'border-box', fontSize: 11, textAlign: 'center', background: 'rgba(255,255,255,0.05)' }}
      >
        미리보기 없음
      </div>
    );
  }
}

function ModelPreview({ url }: { url: string }) {
  const { scene } = useGLTF(url) as { scene: THREE.Object3D };
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  useEffect(() => () => {
    clone.traverse((object) => {
      if (object instanceof THREE.SkinnedMesh) object.skeleton.dispose();
    });
  }, [clone]);

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

function VisiblePreview({ asset, size, className }: { asset: AssetRecord; size: number; className: string | undefined }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const element = container.current;
    if (!element) return;
    let active = true;
    const observer = new IntersectionObserver((entries) => {
      if (active) setVisible(entries.at(-1)?.isIntersecting ?? false);
    });
    observer.observe(element);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={container} className={className} style={{ width: size, height: size, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
      <PreviewBoundary source={JSON.stringify([asset.kind, asset.previewUrl ?? asset.url ?? asset.id])} name={asset.name}>
        {visible && (
          <Canvas camera={{ position: [0, 0.65, 2.4], fov: 42 }} dpr={[1, 1.5]}>
            <Suspense fallback={null}>
              <PreviewScene asset={asset} />
            </Suspense>
          </Canvas>
        )}
      </PreviewBoundary>
    </div>
  );
}

export function AssetPreviewCanvas({ asset, size = 84, className }: AssetPreviewCanvasProps) {
  const [failedThumbnail, setFailedThumbnail] = useState<string | undefined>();
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

  const thumbnailUrl = asset.thumbnailUrl;
  if (thumbnailUrl && thumbnailUrl !== failedThumbnail) {
    return (
      <img
        className={className}
        src={thumbnailUrl}
        alt={asset.name}
        loading="lazy"
        onError={() => setFailedThumbnail(thumbnailUrl)}
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

  return <VisiblePreview asset={asset} size={size} className={className} />;
}
