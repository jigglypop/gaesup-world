import React, { useEffect, useState } from 'react';

import { describeObjectiveProgress, describeReward } from './helpers';
import type { QuestLogUIProps, QuestRowProps, QuestSectionProps } from './types';
import {
  OVERLAY_ACCENT_COLOR,
  OVERLAY_BACKDROP_STYLE,
  OVERLAY_CARD_STYLE,
  OVERLAY_COOL_COLOR,
  OVERLAY_GOOD_COLOR,
  OVERLAY_HEADER_STYLE,
  OVERLAY_PANEL_STYLE,
  OVERLAY_TEXT_DIM_COLOR,
  overlayButtonStyle,
} from '../../../ui/overlayStyles';
import { getQuestRegistry } from '../../registry/QuestRegistry';
import { useQuestStore } from '../../stores/questStore';

const PANEL_WIDTH = 560;
const SINGLE_STEP = 1;

export function QuestLogUI({ toggleKey = 'j' }: QuestLogUIProps) {
  const [open, setOpen] = useState(false);
  const state = useQuestStore((s) => s.state);
  const complete = useQuestStore((s) => s.complete);
  const isObjectiveComplete = useQuestStore((s) => s.isObjectiveComplete);
  const isAllObjectivesComplete = useQuestStore((s) => s.isAllObjectivesComplete);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (event.key.toLowerCase() === toggleKey.toLowerCase()) setOpen((value) => !value);
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleKey]);

  if (!open) return null;

  const active = Object.values(state).filter((progress) => progress.status === 'active');
  const completed = Object.values(state).filter((progress) => progress.status === 'completed');

  return (
    <div style={OVERLAY_BACKDROP_STYLE} onClick={() => setOpen(false)}>
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          ...OVERLAY_PANEL_STYLE,
          width: PANEL_WIDTH,
          maxHeight: '76vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={OVERLAY_HEADER_STYLE}>
          <strong style={{ fontSize: 15 }}>퀘스트 로그</strong>
          <button onClick={() => setOpen(false)} style={overlayButtonStyle()}>
            닫기 [{toggleKey.toUpperCase()}]
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 10 }}>
          <Section title={`진행 중 (${active.length})`}>
            {active.length === 0 ? (
              <Empty>진행 중인 퀘스트가 없습니다.</Empty>
            ) : (
              active.map((progress) => (
                <QuestRow
                  key={progress.questId}
                  progress={progress}
                  renderObjective={(objective) =>
                    isObjectiveComplete(
                      getQuestRegistry().require(progress.questId),
                      progress,
                      objective,
                    )
                  }
                  {...(isAllObjectivesComplete(progress.questId)
                    ? {
                        onComplete: () => {
                          void complete(progress.questId);
                        },
                      }
                    : {})}
                />
              ))
            )}
          </Section>
          {completed.length > 0 && (
            <Section title={`완료 (${completed.length})`}>
              {completed.map((progress) => (
                <QuestRow
                  key={progress.questId}
                  progress={progress}
                  renderObjective={() => true}
                  muted
                />
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: QuestSectionProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ padding: '6px 6px 4px', color: OVERLAY_COOL_COLOR, fontSize: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '8px 10px', color: OVERLAY_TEXT_DIM_COLOR }}>{children}</div>;
}

function QuestRow({ progress, renderObjective, onComplete, muted }: QuestRowProps) {
  const def = getQuestRegistry().get(progress.questId);
  if (!def) return null;

  return (
    <div style={{ ...OVERLAY_CARD_STYLE, padding: 10, marginBottom: 6, opacity: muted ? 0.6 : 1 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <strong>{def.name}</strong>
        {onComplete && (
          <button onClick={onComplete} style={overlayButtonStyle(true)}>
            완료 보고
          </button>
        )}
      </div>
      <div style={{ color: OVERLAY_TEXT_DIM_COLOR, marginBottom: 6 }}>{def.summary}</div>
      <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
        {def.objectives.map((objective) => {
          const done = renderObjective(objective);
          const { label, count, needed } = describeObjectiveProgress(objective, progress);
          return (
            <li
              key={objective.id}
              style={{ color: done ? OVERLAY_GOOD_COLOR : '#ddd', listStyle: 'square' }}
            >
              {label} {needed > SINGLE_STEP ? `(${count}/${needed})` : ''}
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: 6, fontSize: 11, color: OVERLAY_ACCENT_COLOR }}>
        보상: {def.rewards.map((reward) => describeReward(reward)).join(', ')}
      </div>
    </div>
  );
}

export type { QuestLogUIProps };
export default QuestLogUI;
