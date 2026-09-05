import React, { Suspense, useEffect, useMemo } from 'react';

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import type { BuildingModelFallbackKind } from '../../../types';

type ModelObjectProps = {
  url?: string;
  label?: string;
  fallbackKind?: BuildingModelFallbackKind;
  scale?: number;
  color?: string;
};

type ModelObjectState = {
  failed: boolean;
};

class ModelErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  ModelObjectState
> {
  override state: ModelObjectState = { failed: false };

  static getDerivedStateFromError(): ModelObjectState {
    return { failed: true };
  }

  override componentDidUpdate(prevProps: { children: React.ReactNode }): void {
    if (prevProps.children !== this.props.children && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  override render(): React.ReactNode {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function LoadedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url) as { scene: THREE.Object3D };
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  return <primitive object={clone} />;
}

function boxGeometry(args: [number, number, number], position: [number, number, number], color: string, key: string) {
  return (
    <mesh key={key} position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.75} metalness={0.04} />
    </mesh>
  );
}

function cylinderGeometry(args: [number, number, number, number], position: [number, number, number], color: string, key: string) {
  return (
    <mesh key={key} position={position} castShadow receiveShadow>
      <cylinderGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />
    </mesh>
  );
}

function FallbackModel({
  kind = 'generic',
  color = '#9b7653',
}: {
  kind?: BuildingModelFallbackKind | undefined;
  color?: string | undefined;
}) {
  const dark = new THREE.Color(color).multiplyScalar(0.72).getStyle();
  const light = new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35).getStyle();

  if (kind === 'door') {
    return (
      <group>
        {boxGeometry([0.9, 1.9, 0.12], [0, 0.95, 0], color, 'panel')}
        {boxGeometry([0.08, 2.05, 0.16], [-0.5, 1.02, 0], dark, 'left-frame')}
        {boxGeometry([0.08, 2.05, 0.16], [0.5, 1.02, 0], dark, 'right-frame')}
        {cylinderGeometry([0.045, 0.045, 0.06, 12], [0.32, 0.95, 0.08], '#f3c969', 'knob')}
      </group>
    );
  }

  if (kind === 'window') {
    return (
      <group>
        {boxGeometry([1.1, 0.08, 0.12], [0, 1.3, 0], dark, 'top')}
        {boxGeometry([1.1, 0.08, 0.12], [0, 0.55, 0], dark, 'bottom')}
        {boxGeometry([0.08, 0.82, 0.12], [-0.55, 0.92, 0], dark, 'left')}
        {boxGeometry([0.08, 0.82, 0.12], [0.55, 0.92, 0], dark, 'right')}
        {boxGeometry([0.9, 0.62, 0.04], [0, 0.92, 0.02], color, 'glass')}
      </group>
    );
  }

  if (kind === 'fence') {
    return (
      <group>
        {boxGeometry([0.16, 1.0, 0.16], [-0.65, 0.5, 0], dark, 'post-a')}
        {boxGeometry([0.16, 1.0, 0.16], [0.65, 0.5, 0], dark, 'post-b')}
        {boxGeometry([1.5, 0.16, 0.12], [0, 0.72, 0], color, 'rail-a')}
        {boxGeometry([1.5, 0.16, 0.12], [0, 0.36, 0], color, 'rail-b')}
      </group>
    );
  }

  if (kind === 'lamp') {
    return (
      <group>
        {cylinderGeometry([0.06, 0.08, 1.5, 12], [0, 0.75, 0], dark, 'pole')}
        {cylinderGeometry([0.28, 0.18, 0.35, 16], [0, 1.55, 0], color, 'shade')}
        <pointLight position={[0, 1.55, 0]} intensity={0.65} distance={5} color={light} />
      </group>
    );
  }

  if (kind === 'chair') {
    return (
      <group>
        {boxGeometry([0.8, 0.12, 0.75], [0, 0.55, 0], color, 'seat')}
        {boxGeometry([0.8, 0.9, 0.12], [0, 1.0, 0.33], dark, 'back')}
        {boxGeometry([0.09, 0.55, 0.09], [-0.3, 0.28, -0.25], dark, 'leg-a')}
        {boxGeometry([0.09, 0.55, 0.09], [0.3, 0.28, -0.25], dark, 'leg-b')}
        {boxGeometry([0.09, 0.55, 0.09], [-0.3, 0.28, 0.25], dark, 'leg-c')}
        {boxGeometry([0.09, 0.55, 0.09], [0.3, 0.28, 0.25], dark, 'leg-d')}
      </group>
    );
  }

  if (kind === 'table' || kind === 'crafting') {
    return (
      <group>
        {boxGeometry([1.4, 0.16, 0.9], [0, 0.8, 0], color, 'top')}
        {boxGeometry([0.12, 0.75, 0.12], [-0.52, 0.38, -0.3], dark, 'leg-a')}
        {boxGeometry([0.12, 0.75, 0.12], [0.52, 0.38, -0.3], dark, 'leg-b')}
        {boxGeometry([0.12, 0.75, 0.12], [-0.52, 0.38, 0.3], dark, 'leg-c')}
        {boxGeometry([0.12, 0.75, 0.12], [0.52, 0.38, 0.3], dark, 'leg-d')}
        {kind === 'crafting' && boxGeometry([0.55, 0.12, 0.12], [0.22, 0.96, 0], light, 'tool')}
      </group>
    );
  }

  if (kind === 'bed') {
    return (
      <group>
        {boxGeometry([1.3, 0.35, 2.0], [0, 0.35, 0], color, 'base')}
        {boxGeometry([1.25, 0.18, 1.45], [0, 0.62, 0.2], light, 'blanket')}
        {boxGeometry([1.25, 0.55, 0.14], [0, 0.72, 0.92], dark, 'headboard')}
      </group>
    );
  }

  if (kind === 'storage' || kind === 'mailbox') {
    return (
      <group>
        {boxGeometry([1.0, 0.8, 0.7], [0, 0.4, 0], color, 'body')}
        {boxGeometry([1.08, 0.12, 0.78], [0, 0.86, 0], dark, 'lid')}
        {boxGeometry([0.38, 0.08, 0.04], [0, 0.46, 0.37], light, 'handle')}
      </group>
    );
  }

  if (kind === 'shop') {
    return (
      <group>
        {boxGeometry([1.7, 0.18, 0.9], [0, 0.72, 0], color, 'counter')}
        {boxGeometry([1.9, 0.16, 1.0], [0, 1.55, 0], light, 'awning')}
        {boxGeometry([0.08, 1.45, 0.08], [-0.82, 0.8, -0.35], dark, 'post-a')}
        {boxGeometry([0.08, 1.45, 0.08], [0.82, 0.8, -0.35], dark, 'post-b')}
      </group>
    );
  }

  return boxGeometry([1, 1, 1], [0, 0.5, 0], color, 'generic');
}

export default function ModelObject({ url, label, fallbackKind, scale = 1, color }: ModelObjectProps) {
  const fallback = <FallbackModel kind={fallbackKind} color={color} />;

  useEffect(() => {
    if (url) useGLTF.preload(url);
  }, [url]);

  return (
    <group name={label ?? 'building-model-object'} scale={[scale, scale, scale]}>
      {url ? (
        <ModelErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <LoadedModel url={url} />
          </Suspense>
        </ModelErrorBoundary>
      ) : fallback}
    </group>
  );
}
