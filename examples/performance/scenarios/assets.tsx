import { Component, Suspense, useEffect, type ReactNode } from 'react';

import { useGLTF } from '@react-three/drei';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, type Object3D } from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

import { useGaesupGltf, useGltfAndSize, useGaesupStore } from 'gaesup-world';

import { mountScene } from './scene';
import { nextFrame, type Scenario, type ScenarioContext } from './types';

class AssetBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override componentDidCatch() { this.props.onError(); }
  override render() { return this.state.failed ? <p>GLTF 오류가 재현되었습니다.</p> : this.props.children; }
}

async function fixture(width: number, height: number, depth: number) {
  const scene = new Group();
  const mesh = new Mesh(new BoxGeometry(width, height, depth), new MeshStandardMaterial({ color: '#74e1c2' }));
  scene.add(mesh);
  try {
    const data = await new GLTFExporter().parseAsync(scene);
    return URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'model/gltf+json' }));
  } finally { mesh.geometry.dispose(); mesh.material.dispose(); }
}

async function assetSwitch(ctx: ScenarioContext) {
  const urls = await Promise.all([fixture(1, 2, 3), fixture(4, 5, 6), fixture(7, 8, 9)]);
  const loaded = new Set<Object3D>();
  const state: {
    value: { url: string | undefined; result: ReturnType<typeof useGltfAndSize> } | null;
    utils: ReturnType<typeof useGaesupGltf> | null; errors: number; committed: string | undefined | null;
  } = { value: null, utils: null, errors: 0, committed: null };
  function Utilities() { state.utils = useGaesupGltf(); return null; }
  function Asset({ url }: { url: string | undefined }) {
    const result = useGltfAndSize(url === undefined ? {} : { url });
    useEffect(() => { state.committed = url; }, [url]);
    state.value = { url, result }; loaded.add(result.gltf.scene);
    return <p>GLTF 크기: {result.size.toArray().join(' × ')}</p>;
  }
  const root = createRoot(ctx.host);
  const show = async (url: string | undefined) => {
    root.render(<><Utilities /><AssetBoundary onError={() => { state.errors++; }}><Suspense fallback={<p>실제 GLTF 로드 중</p>}><Asset url={url} /></Suspense></AssetBoundary></>);
    for (let i = 0; i < 240 && state.committed !== url && !state.errors; i++) await nextFrame(ctx.signal);
    for (let i = 0; i < 3; i++) await nextFrame(ctx.signal);
  };
  let display: Object3D | undefined;
  try {
    await show(urls[0]);
    ctx.assert('initial-size', '1,2,3', state.value?.result.size.toArray().join(',') ?? 'missing');
    await show(urls[1]);
    ctx.assert('switched-size', '4,5,6', state.value?.result.size.toArray().join(',') ?? 'missing');
    ctx.sample('size-switch-misses', Number(state.value?.result.size.toArray().join(',') !== '4,5,6'), 'count', 'same-hook-url-switch');
    display = state.value?.result.gltf.scene.clone(true);
    await state.utils?.preloadSizes([urls[2]!]);
    const preloaded = state.utils?.getSizesByUrls({ preload: urls[2] })['preload'];
    ctx.assert('preloaded-size', '7,8,9', preloaded?.toArray().join(',') ?? 'missing');
    ctx.sample('preload-size-misses', Number(preloaded?.toArray().join(',') !== '7,8,9'), 'count', 'await-preload-sizes');
    await show(undefined);
    ctx.assert('empty-url-errors', 0, state.errors);
    ctx.sample('empty-url-errors', state.errors, 'count', 'empty-url-hook');
  } finally {
    flushSync(() => root.unmount());
    try {
      if (display) {
        const view = await mountScene(ctx, [display]);
        try { for (let i = 0; i < 8; i++) await view.frame(); } finally { view.dispose(); }
      }
    } finally {
      for (const url of urls) { useGLTF.clear(url); URL.revokeObjectURL(url); }
      for (const scene of loaded) scene.traverse(object => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
      });
      const sizes = { ...useGaesupStore.getState().sizes };
      for (const url of urls) delete sizes[url];
      useGaesupStore.getState().setSizes(() => sizes);
    }
  }
}

export const assetScenarios: Scenario[] = [
  { id: 'asset-switch', title: 'GLTF 교체·빈 URL·preload', description: '실제 GLTF를 같은 훅에서 교체하고 크기 갱신과 preload, 빈 URL을 검사합니다.', version: 1, run: assetSwitch },
];
