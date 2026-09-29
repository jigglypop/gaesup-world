import { useEffect, useState, type ReactNode } from 'react';

import {
  FRAME_PHASES,
  useGameTime,
  useNPCStore,
  usePerformanceReport,
  type FramePhase,
  type WorldQuality,
} from 'gaesup-world';
import { useBuildingStore } from 'gaesup-world/building';

import type { SceneSettings } from './Scene';

const HISTORY = 60;
const BACKEND = { webgpu: 'WebGPU', 'webgpu-fallback': 'WebGL2 대체', webgl: 'WebGL' } as const;
const PHASE: Record<FramePhase, string> = {
  input: '입력', script: '스크립트', prePhysics: '물리 전', postPhysics: '물리 후', animation: '애니메이션',
  lateUpdate: '후반 갱신', camera: '카메라', effects: '이펙트', snapshot: '스냅샷',
};
const QUALITY: { value: WorldQuality & string; label: string }[] = [
  { value: 'auto', label: '자동' }, { value: 'high', label: '높음' }, { value: 'medium', label: '보통' }, { value: 'low', label: '낮음' },
];
const TIER = { high: '높음', medium: '보통', low: '낮음' } as const;
const SEASON: Record<string, string> = { spring: '봄', summer: '여름', autumn: '가을', fall: '가을', winter: '겨울' };

const number = (value: number, digits = 0) => value.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const rate = (hz: number) => (Number.isFinite(hz) ? `${number(hz)}Hz` : '매 프레임');
const compact = (value: number) => (value >= 1e6 ? `${number(value / 1e6, 1)}M` : value >= 1e4 ? `${number(value / 1e3, 1)}K` : number(value));

type Grade = 'good' | 'warn' | 'bad';
/** Green below `good`, amber below `warn`, red above; `higher` flips it for rates. */
const grade = (value: number, good: number, warn: number, higher = false): Grade =>
  higher ? (value >= good ? 'good' : value >= warn ? 'warn' : 'bad') : value <= good ? 'good' : value <= warn ? 'warn' : 'bad';

function Metric({ label, value, unit, tone, hint }: { label: string; value: ReactNode; unit?: string; tone?: Grade | undefined; hint?: string }) {
  return (
    <div className="mh-metric" title={hint}>
      <span className="mh-metric-label">{tone && <i className={`mh-dot is-${tone}`} />}{label}</span>
      <span className="mh-metric-value">{value}{unit && <small>{unit}</small>}</span>
    </div>
  );
}

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="mh-status-section">
      <header><h4>{title}</h4>{aside}</header>
      {children}
    </section>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const top = Math.max(65, ...values);
  const y = (fps: number) => 44 - (fps / top) * 40;
  const points = values.map((fps, i) => `${(i / (HISTORY - 1)) * 200},${y(fps).toFixed(1)}`).join(' ');
  return (
    <svg className="mh-spark" viewBox="0 0 200 46" preserveAspectRatio="none" aria-hidden>
      <line x1="0" x2="200" y1={y(60)} y2={y(60)} className="mh-spark-guide" />
      <line x1="0" x2="200" y1={y(30)} y2={y(30)} className="mh-spark-guide is-low" />
      {values.length > 1 && <polyline points={points} />}
    </svg>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="mh-toggle">
      <span><b>{label}</b><small>{hint}</small></span>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

/** Every number the engine reports about this world, plus the switches that move them. */
export function StatusPanel({ settings, onChange }: { settings: SceneSettings; onChange: (next: Partial<SceneSettings>) => void }) {
  const report = usePerformanceReport(500);
  const { frames, render, engine, phases, memory, shadow, resolution, gpuMs, cpuBound } = report;
  const [history, setHistory] = useState<number[]>([]);
  useEffect(() => {
    if (frames.fps > 0) setHistory((previous) => [...previous.slice(1 - HISTORY), frames.fps]);
  }, [frames]);

  const npcs = useNPCStore((state) => state.instances.size);
  const tiles = useBuildingStore((state) => [...state.tileGroups.values()].reduce((sum, group) => sum + group.tiles.length, 0));
  const walls = useBuildingStore((state) => [...state.wallGroups.values()].reduce((sum, group) => sum + group.walls.length, 0));
  const objects = useBuildingStore((state) => state.objects.length);
  const time = useGameTime();

  const fpsTone = grade(frames.fps, 55, 30, true);
  const phaseTotal = phases ? FRAME_PHASES.reduce((sum, phase) => sum + phases[phase], 0) : 0;
  const phaseMax = phases ? Math.max(0.5, ...FRAME_PHASES.map((phase) => phases[phase])) : 1;

  return (
    <div className="mh-status">
      <header className="mh-status-head">
        <div>
          <h3>상태 체크</h3>
          <p><i className="mh-live" />0.5초마다 갱신</p>
        </div>
        <div className="mh-badges">
          <span className="mh-badge is-accent">{render.backend ? BACKEND[render.backend] : '측정 중'}</span>
          <span className="mh-badge">품질 {TIER[report.tier]}</span>
        </div>
      </header>

      <div className={`mh-fps is-${fpsTone}`}>
        <div className="mh-fps-main">
          <strong>{number(frames.fps)}</strong>
          <span>FPS</span>
        </div>
        <Sparkline values={history} />
        <dl className="mh-fps-stats">
          <div><dt>평균</dt><dd>{number(frames.avgMs, 1)}ms</dd></div>
          <div><dt>p50</dt><dd>{number(frames.p50Ms, 1)}ms</dd></div>
          <div><dt>p95</dt><dd>{number(frames.p95Ms, 1)}ms</dd></div>
          <div><dt>최대</dt><dd>{number(frames.maxMs, 1)}ms</dd></div>
        </dl>
      </div>

      <Section title="프레임">
        <div className="mh-metrics">
          <Metric label="캔버스 그리기" value={report.drawnFps === null ? '–' : number(report.drawnFps)} unit="/s" hint="캔버스가 실제로 그린 프레임 수. 절전 모드에서는 FPS보다 낮아요." />
          <Metric label="고정 물리 틱" value={report.fixedTicksPerSecond === null ? '–' : number(report.fixedTicksPerSecond)} unit="/s" hint="시뮬레이션은 초당 60틱으로 돌아요." />
          <Metric label="p95 프레임" value={number(frames.p95Ms, 1)} unit="ms" tone={grade(frames.p95Ms, 20, 34)} hint="느린 프레임 5%의 경계. 끊김 체감에 가장 가까운 값이에요." />
          <Metric label="JS 힙" value={memory ? number(memory.usedMB) : '–'} unit={memory ? 'MB' : ''} tone={memory ? grade(memory.usedMB, 300, 600) : undefined} hint="Chromium에서만 보고돼요." />
        </div>
      </Section>

      <Section title="렌더링">
        <div className="mh-metrics">
          <Metric label="Draw call" value={number(render.calls)} tone={grade(render.calls, 250, 600)} hint="한 프레임의 그리기 명령 수." />
          <Metric
            label="GPU 시간"
            value={gpuMs === null ? '–' : number(gpuMs, 1)}
            unit={gpuMs === null ? '' : 'ms'}
            tone={gpuMs === null ? undefined : grade(gpuMs, 12, 16.7)}
            hint="GPU가 한 프레임을 그린 시간(WebGPU 타임스탬프). 16.7ms를 넘으면 60fps를 못 지켜요."
          />
          <Metric
            label="해상도"
            value={resolution ? `${number(resolution.pixelRatio, 2)}×` : '–'}
            tone={resolution && resolution.pixelRatio < resolution.maxPixelRatio ? 'warn' : undefined}
            hint={resolution?.adaptive ? `자동 품질: 프레임이 밀리면 픽셀 비율을 낮추고, 여유가 생기면 ${number(resolution.maxPixelRatio, 1)}×까지 되돌려요.` : '품질 설정이 정한 픽셀 비율이에요.'}
          />
          <Metric
            label="CPU 여유"
            value={cpuBound ? '부족' : '충분'}
            tone={cpuBound ? 'warn' : 'good'}
            hint="GPU는 한가한데 프레임이 밀리면 CPU 병목이에요. 그동안 그림자를 덜 자주 다시 그리고 가까운 주민 8명만 그려요."
          />
          <Metric label="삼각형" value={compact(render.triangles)} tone={grade(render.triangles, 1.5e6, 4e6)} />
          <Metric label="지오메트리" value={number(engine.geometries)} />
          <Metric label="텍스처" value={number(engine.textures)} />
          <Metric label="셰이더 프로그램" value={number(engine.programs)} />
          <Metric label="GPU 메모리 추정" value={engine.allocatedBytesEstimate ? number(engine.allocatedBytesEstimate / 1048576) : '–'} unit={engine.allocatedBytesEstimate ? 'MB' : ''} />
        </div>
      </Section>

      <Section title="그림자">
        {shadow ? (
          <div className="mh-metrics">
            <Metric label="맵" value={`${shadow.maps}장 · ${number(shadow.mapSize)}px`} hint="WebGPU는 cascade 수, WebGL은 1장이에요." />
            <Metric label="가까운 맵 갱신" value={rate(shadow.nearHz)} />
            <Metric label="먼 맵 갱신" value={shadow.maps > 1 ? rate(shadow.farHz) : '–'} hint="먼 cascade는 한 프레임에 하나씩 돌아가며 다시 그려요." />
            <Metric label="근거리 전용 캐스터" value={number(shadow.nearOnlyCasters)} hint="작은 소품·주민·잔디는 가장 가까운 cascade에만 그림자를 넣어요." />
          </div>
        ) : (
          <p className="mh-muted">그림자를 만드는 해가 없어요.</p>
        )}
      </Section>

      <Section title="CPU 단계" aside={phases && <span className="mh-muted">합계 {number(phaseTotal, 2)}ms</span>}>
        {phases ? (
          <ul className="mh-phases">
            {FRAME_PHASES.map((phase) => (
              <li key={phase}>
                <span>{PHASE[phase]}</span>
                <i style={{ width: `${Math.min(100, (phases[phase] / phaseMax) * 100)}%` }} />
                <b>{number(phases[phase], 2)}</b>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mh-muted">단계별 측정은 개발 빌드에서만 켜져요.</p>
        )}
      </Section>

      <Section title="월드">
        <div className="mh-metrics">
          <Metric label="주민 NPC" value={number(npcs)} unit="명" />
          <Metric label="바닥 타일" value={number(tiles)} />
          <Metric label="벽" value={number(walls)} />
          <Metric label="배치 오브젝트" value={number(objects)} />
          <Metric label="게임 시각" value={`${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`} />
          <Metric label="계절" value={`${SEASON[time.season] ?? time.season} ${time.day}일`} />
        </div>
      </Section>

      <Section title="설정">
        <div className="mh-segment" role="radiogroup" aria-label="렌더 품질">
          {QUALITY.map((option) => (
            <button key={option.value} role="radio" aria-checked={settings.quality === option.value} onClick={() => onChange({ quality: option.value })}>
              {option.label}
            </button>
          ))}
        </div>
        <Toggle label="절전 모드" hint="입력이 2초 없으면 30fps로 그려요" checked={settings.idleThrottle} onChange={(idleThrottle) => onChange({ idleThrottle })} />
        <Toggle label="후처리" hint="블룸·톤매핑. 필요할 때만 불러와요" checked={settings.postProcessing} onChange={(postProcessing) => onChange({ postProcessing })} />
        <Toggle label="가리면 반투명" hint="앞을 가린 물체를 반투명하게 해요. 끄면 카메라가 앞으로 당겨져요" checked={settings.cameraFade ?? true} onChange={(cameraFade) => onChange({ cameraFade })} />
        <Toggle label="시네마틱 조명" hint="월드 GI 프로브의 튄 빛과 반사를 더해요(WebGPU)" checked={settings.cinematic ?? false} onChange={(cinematic) => onChange({ cinematic })} />
      </Section>
    </div>
  );
}
