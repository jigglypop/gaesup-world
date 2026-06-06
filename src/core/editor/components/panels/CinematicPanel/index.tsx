import React, { useMemo, useState } from 'react';

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
  { kind: 'dolly', target: [0, 1.2, -2], fromDistance: 6, toDistance: 3.4, durationMs: 640, fov: 40 },
  { kind: 'orbit', target: [0, 1.2, 0], radius: 5, angleDeg: 35, height: 0.4, durationMs: 640, fov: 48 },
  { kind: 'expression', face: 'smile', durationMs: 120 },
  { kind: 'equip', slot: 'weapon', itemId: 'starter-sword', durationMs: 120 },
  { kind: 'shake', intensity: 0.08, durationMs: 120 },
  { kind: 'fade', direction: 'out', durationMs: 180 },
  { kind: 'restore' },
];

const PRESET_BEATS: Record<string, CameraCinematicBeat> = {
  'Look At': { kind: 'lookAt', target: [0, 1.4, 0], focusDistance: 4.5, durationMs: 520, fov: 44 },
  Dolly: { kind: 'dolly', target: [0, 1.2, -2], fromDistance: 6, toDistance: 3.4, durationMs: 640, fov: 40 },
  Orbit: { kind: 'orbit', target: [0, 1.2, 0], radius: 5, angleDeg: 35, height: 0.4, durationMs: 640, fov: 48 },
  Fade: { kind: 'fade', direction: 'inOut', durationMs: 180 },
  Expression: { kind: 'expression', face: 'smile', durationMs: 120 },
  Equip: { kind: 'equip', slot: 'weapon', itemId: 'starter-sword', durationMs: 120 },
  Teleport: { kind: 'teleport', position: [0, 0, -1.5], durationMs: 120 },
  Event: { kind: 'event', name: 'cinematic.preview', payload: { source: 'CinematicPanel' }, durationMs: 20 },
  Restore: { kind: 'restore' },
};

function cloneBeat(beat: CameraCinematicBeat): CameraCinematicBeat {
  return JSON.parse(JSON.stringify(beat)) as CameraCinematicBeat;
}

function describeBeat(beat: CameraCinematicBeat): string {
  if ('durationMs' in beat && typeof beat.durationMs === 'number') return `${beat.kind} / ${beat.durationMs}ms`;
  return beat.kind;
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
  const [localBeats, setLocalBeats] = useState<CameraCinematicBeat[]>(() => defaultBeats.map(cloneBeat));
  const [selectedPreset, setSelectedPreset] = useState(Object.keys(PRESET_BEATS)[0] ?? 'Look At');
  const [status, setStatus] = useState<CinematicPanelStatus>({ kind: 'idle', message: 'Ready' });
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
    setStatus({ kind: 'success', message: `Added ${preset.kind}` });
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
    setStatus({ kind: 'success', message: 'Timeline reset' });
  };

  const preview = async () => {
    try {
      if (onPreview) {
        await onPreview(currentBeats);
      } else {
        await playCameraCinematic(currentBeats, playbackOptions).finished;
      }
      setStatus({ kind: 'success', message: 'Preview completed' });
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Preview failed',
      });
    }
  };

  return (
    <div className={`cinematic-panel ${className}`} style={style}>
      <section className="cinematic-panel__section">
        <div className="cinematic-panel__title">Cinematic Timeline</div>
        <div className="cinematic-panel__hint">Create, reorder, serialize, and preview camera/gameplay beats.</div>
        <div className="cinematic-panel__toolbar">
          <select value={selectedPreset} onChange={(event) => setSelectedPreset(event.target.value)}>
            {Object.keys(PRESET_BEATS).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button type="button" onClick={addPreset}>Add</button>
          <button type="button" onClick={resetBeats}>Reset</button>
          <button type="button" className="cinematic-panel__primary" onClick={() => { void preview(); }}>
            Preview
          </button>
        </div>
      </section>

      <section className="cinematic-panel__section">
        <div className="cinematic-panel__title">Beats</div>
        <div className="cinematic-panel__list">
          {currentBeats.map((beat, index) => (
            <article key={`${beat.kind}-${index}`} className="cinematic-panel__card">
              <div>
                <div className="cinematic-panel__card-title">{describeBeat(beat)}</div>
                <code>{JSON.stringify(beat)}</code>
              </div>
              <div className="cinematic-panel__card-actions">
                <button type="button" onClick={() => moveBeat(index, -1)}>Up</button>
                <button type="button" onClick={() => moveBeat(index, 1)}>Down</button>
                <button type="button" onClick={() => removeBeat(index)}>Delete</button>
              </div>
            </article>
          ))}
          {currentBeats.length === 0 && (
            <div className="cinematic-panel__empty">No beats. Add a preset to start the timeline.</div>
          )}
        </div>
      </section>

      <section className="cinematic-panel__section">
        <div className="cinematic-panel__title">Serialized</div>
        <textarea readOnly value={serialized} />
      </section>

      <section className="cinematic-panel__section">
        <div className={`cinematic-panel__status cinematic-panel__status--${status.kind}`}>
          {status.message}
        </div>
      </section>
      {children}
    </div>
  );
}

