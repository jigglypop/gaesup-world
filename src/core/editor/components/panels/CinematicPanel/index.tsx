import { useMemo, useState } from 'react';

import {
  playCameraCinematic,
  type CameraCinematicBeat,
  type CameraCinematicOptions,
} from '../../../../camera';
import type { EditorPanelBaseProps } from '../types';
import './styles.css';

type CinematicPanelStatus = {
  kind: 'idle' | 'success' | 'error';
  message: string;
};

export type CinematicPanelProps = EditorPanelBaseProps & {
  beats?: CameraCinematicBeat[];
  defaultBeats?: CameraCinematicBeat[];
  playbackOptions?: CameraCinematicOptions;
  onChange?: (beats: CameraCinematicBeat[]) => void;
  onPreview?: (beats: CameraCinematicBeat[]) => void | Promise<void>;
};

const DEFAULT_BEATS: CameraCinematicBeat[] = [
  { kind: 'fade', direction: 'in', durationMs: 180 },
  { kind: 'lookAt', target: [0, 1.4, 0], focusDistance: 4.5, durationMs: 520, fov: 44 },
  {
    kind: 'dolly',
    target: [0, 1.2, -2],
    fromDistance: 6,
    toDistance: 3.4,
    durationMs: 640,
    fov: 40,
  },
  {
    kind: 'orbit',
    target: [0, 1.2, 0],
    radius: 5,
    angleDeg: 35,
    height: 0.4,
    durationMs: 640,
    fov: 48,
  },
  { kind: 'expression', face: 'smile', durationMs: 120 },
  { kind: 'equip', slot: 'weapon', itemId: 'starter-sword', durationMs: 120 },
  { kind: 'shake', intensity: 0.08, durationMs: 120 },
  { kind: 'fade', direction: 'out', durationMs: 180 },
  { kind: 'restore' },
];

const PRESET_BEATS: Record<string, CameraCinematicBeat> = {
  'Look At': { kind: 'lookAt', target: [0, 1.4, 0], focusDistance: 4.5, durationMs: 520, fov: 44 },
  Dolly: {
    kind: 'dolly',
    target: [0, 1.2, -2],
    fromDistance: 6,
    toDistance: 3.4,
    durationMs: 640,
    fov: 40,
  },
  Orbit: {
    kind: 'orbit',
    target: [0, 1.2, 0],
    radius: 5,
    angleDeg: 35,
    height: 0.4,
    durationMs: 640,
    fov: 48,
  },
  Fade: { kind: 'fade', direction: 'inOut', durationMs: 180 },
  Expression: { kind: 'expression', face: 'smile', durationMs: 120 },
  Equip: { kind: 'equip', slot: 'weapon', itemId: 'starter-sword', durationMs: 120 },
  Teleport: { kind: 'teleport', position: [0, 0, -1.5], durationMs: 120 },
  Event: {
    kind: 'event',
    name: 'cinematic.preview',
    payload: { source: 'CinematicPanel' },
    durationMs: 20,
  },
  Restore: { kind: 'restore' },
};

function cloneBeat(beat: CameraCinematicBeat): CameraCinematicBeat {
  return JSON.parse(JSON.stringify(beat)) as CameraCinematicBeat;
}

const BEAT_LABELS: Record<CameraCinematicBeat['kind'], string> = {
  closeUp: '가까이 보기',
  lookAt: '대상 바라보기',
  dolly: '카메라 이동',
  orbit: '주변 회전',
  shake: '화면 흔들기',
  fade: '화면 전환',
  expression: '표정',
  equip: '장비 착용',
  dialog: '대화',
  teleport: '순간 이동',
  animation: '애니메이션',
  npcMove: 'NPC 이동',
  event: '이벤트',
  restore: '원래 시점 복원',
};

function describeBeat(beat: CameraCinematicBeat): string {
  const label = BEAT_LABELS[beat.kind];
  if ('durationMs' in beat && typeof beat.durationMs === 'number')
    return `${label} / ${beat.durationMs}ms`;
  return label;
}

export function CinematicPanel({
  beats,
  defaultBeats = DEFAULT_BEATS,
  playbackOptions,
  onChange,
  onPreview,
  className = '',
  style,
  children,
}: CinematicPanelProps) {
  const controlled = beats !== undefined;
  const [localBeats, setLocalBeats] = useState<CameraCinematicBeat[]>(() =>
    defaultBeats.map(cloneBeat),
  );
  const [selectedPreset, setSelectedPreset] = useState(Object.keys(PRESET_BEATS)[0] ?? 'Look At');
  const [status, setStatus] = useState<CinematicPanelStatus>({ kind: 'idle', message: '준비됨' });
  const currentBeats = controlled ? beats : localBeats;
  const serialized = useMemo(() => JSON.stringify(currentBeats, null, 2), [currentBeats]);

  const commit = (nextBeats: CameraCinematicBeat[]) => {
    if (!controlled) setLocalBeats(nextBeats);
    onChange?.(nextBeats);
  };

  const addPreset = () => {
    const preset = PRESET_BEATS[selectedPreset];
    if (!preset) return;
    commit([...currentBeats, cloneBeat(preset)]);
    setStatus({ kind: 'success', message: `${BEAT_LABELS[preset.kind]} 추가됨` });
  };

  const moveBeat = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= currentBeats.length) return;
    const nextBeats = [...currentBeats];
    const [beat] = nextBeats.splice(index, 1);
    if (!beat) return;
    nextBeats.splice(nextIndex, 0, beat);
    commit(nextBeats);
  };

  const removeBeat = (index: number) => {
    commit(currentBeats.filter((_, beatIndex) => beatIndex !== index));
  };

  const resetBeats = () => {
    commit(defaultBeats.map(cloneBeat));
    setStatus({ kind: 'success', message: '타임라인을 초기화했습니다' });
  };

  const preview = async () => {
    try {
      if (onPreview) {
        await onPreview(currentBeats);
      } else {
        await playCameraCinematic(currentBeats, playbackOptions).finished;
      }
      setStatus({ kind: 'success', message: '미리 보기가 끝났습니다' });
    } catch (error) {
      setStatus({
        kind: 'error',
        message:
          error instanceof Error ? `미리 보기 실패: ${error.message}` : '미리 보기에 실패했습니다',
      });
    }
  };

  return (
    <div className={`cinematic-panel ${className}`} style={style}>
      <section className="cinematic-panel__section">
        <div className="cinematic-panel__title">연출 타임라인</div>
        <div className="cinematic-panel__hint">
          카메라와 게임플레이 연출을 추가하고 순서를 바꿔 미리 볼 수 있습니다.
        </div>
        <div className="cinematic-panel__toolbar">
          <select
            aria-label="연출 프리셋"
            value={selectedPreset}
            onChange={(event) => setSelectedPreset(event.target.value)}
          >
            {Object.entries(PRESET_BEATS).map(([name, beat]) => (
              <option key={name} value={name}>
                {BEAT_LABELS[beat.kind]}
              </option>
            ))}
          </select>
          <button type="button" onClick={addPreset}>
            추가
          </button>
          <button type="button" onClick={resetBeats}>
            초기화
          </button>
          <button
            type="button"
            className="cinematic-panel__primary"
            onClick={() => {
              void preview();
            }}
          >
            미리 보기
          </button>
        </div>
      </section>

      <section className="cinematic-panel__section">
        <div className="cinematic-panel__title">연출 단계</div>
        <div className="cinematic-panel__list">
          {currentBeats.map((beat, index) => (
            <article key={`${beat.kind}-${index}`} className="cinematic-panel__card">
              <div>
                <div className="cinematic-panel__card-title">{describeBeat(beat)}</div>
              </div>
              <div className="cinematic-panel__card-actions">
                <button type="button" disabled={index === 0} onClick={() => moveBeat(index, -1)}>
                  위로
                </button>
                <button
                  type="button"
                  disabled={index === currentBeats.length - 1}
                  onClick={() => moveBeat(index, 1)}
                >
                  아래로
                </button>
                <button type="button" onClick={() => removeBeat(index)}>
                  삭제
                </button>
              </div>
            </article>
          ))}
          {currentBeats.length === 0 && (
            <div className="cinematic-panel__empty">
              연출 단계가 없습니다. 프리셋을 추가해 시작하세요.
            </div>
          )}
        </div>
      </section>

      <details className="cinematic-panel__section">
        <summary className="cinematic-panel__title">개발자용 저장 데이터</summary>
        <textarea aria-label="연출 저장 데이터" readOnly value={serialized} />
      </details>

      <section className="cinematic-panel__section">
        <div className={`cinematic-panel__status cinematic-panel__status--${status.kind}`}>
          {status.message}
        </div>
      </section>
      {children}
    </div>
  );
}
