import { lazy, Suspense, useState } from 'react';

import type { EngineSettings, EngineStats } from './types';
import '../showcase.css';

const EngineCanvas = lazy(() => import('./EngineCanvas'));
const PackageInspector = lazy(() => import('./PackageInspector'));
const DEFAULTS: EngineSettings = {
  count: 4096,
  mode: 'gpu',
  orbit: true,
  sunset: false,
  view: 'overview',
};

export default function EngineShowcase() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [stats, setStats] = useState<EngineStats | null>(null);
  const [developer, setDeveloper] = useState(false);
  const [error, setError] = useState('');
  function change(update: Partial<EngineSettings>) {
    setSettings((previous) => ({ ...previous, ...update }));
  }
  return (
    <div className="showcase">
      <header className="topbar">
        <a className="brand" href="/">
          g<span>↟</span>
          <b>
            gaesup<span>world</span>
          </b>
        </a>
        <nav aria-label="주 메뉴">
          <a className="active" href="#world">
            Explore
          </a>
          <button onClick={() => setDeveloper(!developer)}>Engine lab</button>
          <span>v1.0.2</span>
        </nav>
        <span className="live">
          <i /> LIVE PLAYGROUND
        </span>
      </header>
      <main id="world" className="workspace">
        <aside className="story">
          <span className="eyebrow">WORLD NO. 01 / THE LIVING FOREST</span>
          <h1>
            작은 숲에서,
            <br />
            <em>커다란 세계로.</em>
          </h1>
          <p>
            수천 그루의 나무 사이를 여행하세요.
            <br />웹 브라우저에서 시작하는 당신의 3D 월드.
          </p>
          <div className="scene-picker">
            <span className="section-label">어디로 떠날까요?</span>
            {(
              [
                {
                  id: 'overview',
                  number: '01',
                  title: '숲의 중심',
                  subtitle: 'A quiet place to begin',
                },
                {
                  id: 'trail',
                  number: '02',
                  title: '호숫가 산책',
                  subtitle: 'A little closer to the world',
                },
                {
                  id: 'sky',
                  number: '03',
                  title: '하늘에서 보기',
                  subtitle: 'See the bigger picture',
                },
              ] as const
            ).map((view) => (
              <button
                key={view.id}
                className={settings.view === view.id ? 'scene-card selected' : 'scene-card'}
                onClick={() => change({ view: view.id })}
              >
                <span>{view.number}</span>
                <div>
                  <b>{view.title}</b>
                  <small>{view.subtitle}</small>
                </div>
                <span>↗</span>
              </button>
            ))}
          </div>
          <div className="world-note">
            <span>✳</span>
            <p>
              <b>하나의 세계, 세 가지 렌더링 방식</b>
              <br />
              동일한 데이터로 CPU와 GPU의 차이를 직접 경험하세요.
            </p>
          </div>
          <button
            className="lab-toggle"
            onClick={() => setDeveloper(!developer)}
            aria-expanded={developer}
          >
            엔진 살펴보기 <span>{developer ? '−' : '+'}</span>
          </button>
        </aside>
        <section className="viewport" aria-label="실시간 3D 숲">
          <div className="canvas-wrap">
            <Suspense fallback={<div className="loading">숲을 불러오는 중…</div>}>
              <EngineCanvas settings={settings} onStats={setStats} onError={setError} />
            </Suspense>
          </div>
          <div className="world-title">
            <span>GAESUP FOREST</span>
            <b>숲의 정원</b>
            <small>A WORLD BUILT FROM DATA · SEED 271828</small>
          </div>
          <span className="backend" data-backend={stats?.backend ?? 'loading'}>
            <i /> {stats?.backend ?? 'Starting renderer'}
          </span>
          {error && (
            <div role="alert" className="error">
              렌더러를 시작하지 못했습니다. {error}
              <button onClick={() => location.reload()}>다시 시도</button>
            </div>
          )}
          <div className="viewport-toolbar">
            <div>
              <button
                aria-pressed={settings.orbit}
                onClick={() => change({ orbit: !settings.orbit })}
              >
                {settings.orbit ? 'Ⅱ' : '▶'} 자동 탐험
              </button>
              <button
                aria-pressed={settings.sunset}
                onClick={() => change({ sunset: !settings.sunset })}
              >
                {settings.sunset ? '◐ 노을' : '☀ 낮'}
              </button>
            </div>
            <span>드래그로 둘러보기 · 스크롤로 확대</span>
          </div>
        </section>
        {developer && (
          <aside className="lab" aria-label="엔진 실험실">
            <div className="lab-heading">
              <span className="eyebrow">DEVELOPER / ENGINE LAB</span>
              <button aria-label="엔진 실험실 닫기" onClick={() => setDeveloper(false)}>
                ×
              </button>
            </div>
            <h2>같은 숲, 다른 경로.</h2>
            <p>
              실제 실행 중인 엔진 수치입니다. 카메라와 나무 수를 고정하면 방식을 비교하기 쉽습니다.
            </p>
            <label>
              나무 수
              <select
                value={settings.count}
                onChange={(event) => {
                  setStats(null);
                  change({ count: Number(event.target.value) });
                }}
              >
                <option value={4096}>4,096 · 산책</option>
                <option value={16384}>16,384 · 넓은 숲</option>
                <option value={65536}>65,536 · 스트레스 테스트</option>
              </select>
            </label>
            <fieldset>
              <legend>컬링 방식</legend>
              {(
                [
                  {
                    mode: 'gpu',
                    title: 'GPU 간접 드로우',
                    detail: 'Compute → compact → indirect draw',
                  },
                  { mode: 'cpu', title: 'CPU 컬링', detail: '한 번의 순회로 보이는 인덱스 추출' },
                  { mode: 'all', title: '전체 렌더링', detail: '비교 기준 · 모든 인스턴스 제출' },
                ] as const
              ).map((item) => (
                <button
                  key={item.mode}
                  aria-pressed={settings.mode === item.mode}
                  onClick={() => change({ mode: item.mode })}
                >
                  <b>{item.title}</b>
                  <small>{item.detail}</small>
                </button>
              ))}
            </fieldset>
            <dl className="metrics">
              <div>
                <dt>표시 인스턴스</dt>
                <dd data-testid="visible-count">{stats?.visible.toLocaleString() ?? '—'}</dd>
              </div>
              <div>
                <dt>프레임 간격</dt>
                <dd>{stats ? `${stats.frameMs.toFixed(1)} ms` : '—'}</dd>
              </div>
              <div>
                <dt>컬링 CPU / 제출 시간</dt>
                <dd>{stats ? `${stats.cullMs.toFixed(2)} ms` : '—'}</dd>
              </div>
              <div>
                <dt>드로우 호출</dt>
                <dd>{stats?.drawCalls ?? '—'}</dd>
              </div>
              <div>
                <dt>실제 경로</dt>
                <dd data-testid="active-mode">{stats?.mode ?? '—'}</dd>
              </div>
            </dl>
            <p className="metric-note">
              GPU 시간은 CPU 제출 시간에 포함되지 않습니다. 표시 수는 0.75초마다 비동기로 읽습니다.
              WebGPU 미지원 환경은 CPU 컬링으로 전환합니다.
            </p>
            <div className="code-card">
              <span>PUBLIC PACKAGE API</span>
              <code>
                import {'{ NextWorld, TaskGraph,\n  createGpuDrivenInstances }'}
                <br />
                {"from 'gaesup-world/next';"}
              </code>
            </div>
            <Suspense fallback={null}>
              <PackageInspector />
            </Suspense>
          </aside>
        )}
      </main>
      <footer>
        <span>
          <i /> YOUR BROWSER IS THE ENGINE
        </span>
        <p>
          Data-oriented world <b>·</b> WebGPU compute <b>·</b> React + Three.js
        </p>
        <span>{settings.count.toLocaleString()} trees / one shared geometry</span>
      </footer>
    </div>
  );
}
