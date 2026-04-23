import React, { useEffect, useState } from 'react';

import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { getQuestRegistry } from '../../registry/QuestRegistry';
import { useQuestStore } from '../../stores/questStore';
import type { QuestObjective, QuestProgress, QuestReward } from '../../types';

export type QuestLogUIProps = {
  toggleKey?: string;
};

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 560,
          maxHeight: '76vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#1a1a1a',
          color: '#fff',
          borderRadius: 12,
          boxShadow: '0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(122,166,255,0.35)',
          fontFamily: "'Pretendard', system-ui, sans-serif",
          fontSize: 13,
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <strong style={{ fontSize: 15 }}>Quest Log</strong>
          <button onClick={() => setOpen(false)} style={btn()}>
            Close [{toggleKey.toUpperCase()}]
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: 10 }}>
          <Section title={`Active (${active.length})`}>
            {active.length === 0 ? (
              <Empty>No active quests.</Empty>
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
                    )}
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
            <Section title={`Completed (${completed.length})`}>
              {completed.map((progress) => (
                <QuestRow key={progress.questId} progress={progress} renderObjective={() => true} muted />
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ padding: '6px 6px 4px', color: '#7aa6ff', fontSize: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '8px 10px', opacity: 0.6 }}>{children}</div>;
}

function QuestRow({
  progress,
  renderObjective,
  onComplete,
  muted,
}: {
  progress: QuestProgress;
  renderObjective: (objective: QuestObjective) => boolean;
  onComplete?: () => void;
  muted?: boolean;
}) {
  const def = getQuestRegistry().get(progress.questId);
  if (!def) return null;

  return (
    <div
      style={{
        padding: 10,
        marginBottom: 6,
        background: '#222',
        borderRadius: 8,
        opacity: muted ? 0.6 : 1,
      }}
    >
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
          <button onClick={onComplete} style={btn(true)}>
            Report Complete
          </button>
        )}
      </div>
      <div style={{ opacity: 0.75, marginBottom: 6 }}>{def.summary}</div>
      <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
        {def.objectives.map((objective) => {
          const complete = renderObjective(objective);
          const current = progress.progress[objective.id] ?? 0;
          const needed =
            objective.type === 'collect' || objective.type === 'deliver'
              ? objective.count
              : 1;
          const count =
            objective.type === 'collect'
              ? Math.min(useInventoryStore.getState().countOf(objective.itemId), needed)
              : current;
          const itemName =
            objective.type === 'collect' || objective.type === 'deliver'
              ? getItemRegistry().get(objective.itemId)?.name ?? objective.itemId
              : '';

          return (
            <li
              key={objective.id}
              style={{ color: complete ? '#7adf90' : '#ddd', listStyle: 'square' }}
            >
              {objective.description ?? describeObjective(objective, itemName)}{' '}
              {needed > 1 ? `(${count}/${needed})` : ''}
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: 6, fontSize: 11, color: '#ffd84a' }}>
        Rewards: {def.rewards.map((reward) => describeReward(reward)).join(', ')}
      </div>
    </div>
  );
}

function describeObjective(objective: QuestObjective, itemName?: string): string {
  switch (objective.type) {
    case 'collect':
      return `Collect ${itemName ?? objective.itemId}`;
    case 'deliver':
      return `Deliver ${itemName ?? objective.itemId} to ${objective.npcId}`;
    case 'talk':
      return `Talk to ${objective.npcId}`;
    case 'visit':
      return `Visit ${objective.tag}`;
    case 'flag':
      return 'Meet the required condition';
    default:
      return '';
  }
}

function describeReward(reward: QuestReward): string {
  switch (reward.type) {
    case 'item':
      return `${reward.itemId} x${reward.count ?? 1}`;
    case 'bells':
      return `${reward.amount} B`;
    case 'friendship':
      return `Friendship +${reward.amount}`;
    default:
      return '';
  }
}

function btn(primary?: boolean): React.CSSProperties {
  return {
    padding: '4px 10px',
    background: primary ? '#7aa6ff' : '#444',
    color: primary ? '#0d1424' : '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: "'Pretendard', system-ui, sans-serif",
    fontSize: 12,
    fontWeight: primary ? 700 : 400,
  };
}

export default QuestLogUI;
