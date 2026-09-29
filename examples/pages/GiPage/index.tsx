import { useEffect, useState } from 'react';

import { Canvas } from '@react-three/fiber';

import { createRenderer, isWebGPUAvailable } from 'gaesup-world';

import { GiScene } from './GiScene';
import type { GiControls } from './types';
import './styles.css';

const DEFAULT_CONTROLS: GiControls = {
  giEnabled: true,
  giStrength: 1,
  azimuth: 60,
  elevation: 22,
  roof: true,
};
const CAMERA = { position: [0, 3, 14] as [number, number, number], fov: 55 };

export function GiPage() {
  const [controls, setControls] = useState(DEFAULT_CONTROLS);
  const [webgpu, setWebgpu] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void isWebGPUAvailable().then((available) => {
      if (!cancelled) setWebgpu(available);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (patch: Partial<GiControls>) =>
    setControls((current) => ({ ...current, ...patch }));

  return (
    <main className="gi-example">
      <aside className="gi-example__panel">
        <h1>동적 전역 조명</h1>
        <p>
          건물을 복셀로 추적해 프로브에 간접광을 쌓습니다. 창으로 들어온 햇빛이 바닥과 벽에 튕겨
          붉은 벽과 초록 벽의 색을 주변에 옮기는 것을 확인하세요.
        </p>
        <label className="gi-example__row">
          <input
            type="checkbox"
            checked={controls.giEnabled}
            onChange={(event) => update({ giEnabled: event.target.checked })}
          />
          간접광 사용
        </label>
        <label className="gi-example__row">
          간접광 강도 {controls.giStrength.toFixed(1)}
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={controls.giStrength}
            onChange={(event) => update({ giStrength: Number(event.target.value) })}
          />
        </label>
        <label className="gi-example__row">
          태양 방위 {controls.azimuth}도
          <input
            type="range"
            min={0}
            max={360}
            step={5}
            value={controls.azimuth}
            onChange={(event) => update({ azimuth: Number(event.target.value) })}
          />
        </label>
        <label className="gi-example__row">
          태양 고도 {controls.elevation}도
          <input
            type="range"
            min={5}
            max={80}
            step={1}
            value={controls.elevation}
            onChange={(event) => update({ elevation: Number(event.target.value) })}
          />
        </label>
        <label className="gi-example__row">
          <input
            type="checkbox"
            checked={controls.roof}
            onChange={(event) => update({ roof: event.target.checked })}
          />
          지붕
        </label>
        <output className="gi-example__status" role="status">
          {webgpu === null
            ? '렌더러 확인 중…'
            : webgpu
              ? 'WebGPU 렌더링'
              : 'WebGPU를 사용할 수 없습니다'}
        </output>
      </aside>
      {webgpu === false ? (
        <p className="gi-example__fallback" role="alert">
          이 예제는 WebGPU가 필요합니다. WebGPU를 지원하는 브라우저에서 다시 열어 주세요.
        </p>
      ) : (
        webgpu && (
          <Canvas className="gi-example__canvas" shadows gl={createRenderer} camera={CAMERA}>
            <GiScene controls={controls} />
          </Canvas>
        )
      )}
    </main>
  );
}
