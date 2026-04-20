import React, { useEffect, useState } from 'react';

import { useInventoryStore } from '../../../inventory/stores/inventoryStore';
import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { getQuestRegistry } from '../../registry/QuestRegistry';
import { useQuestStore } from '../../stores/questStore';
import type { QuestObjective, QuestProgress } from '../../types';

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
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key.toLowerCase() === toggleKey.toLowerCase()) setOpen((v) => !v);
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleKey]);

  if (!open) return null;

  const active = Object.values(state).filter((p) => p.status === 'active');
  const completed = Object.values(state).filter((p) => p.status === 'completed');

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560, maxHeight: '76vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          background: '#1a1a1a', color: '#fff', borderRadius: 12,
          boxShadow: '0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(122,166,255,0.35)',
          fontFamily: "'Pretendard', system-ui, sans-serif", fontSize: 13,
        }}
      >
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
          <strong style={{ fontSize: 15 }}>퀘스트 로그</strong>
          <button onClick={() => setOpen(false)} style={btn()}>닫기 [{toggleKey.toUpperCase()}]</button>
        </div>
        <div style={{ overflowY: 'auto', padding: 10 }}>
          <Section title={`진행중 (${active.length})`}>
            {active.length === 0 ? (
              <Empty>활성 퀘스트가 없습니다.</Empty>
            ) : active.map((p) => (
              <QuestRow
                key={p.questId}
                progress={p}
                renderObjective={(o) => isObjectiveComplete(getQuestRegistry().require(p.questId), p, o)}
                onComplete={isAllObjectivesComplete(p.questId) ? () => complete(p.questId) : undefined}
              />
            ))}
          </Section>
          {completed.length > 0 && (
            <Section title={`완료 (${completed.length})`}>
              {completed.map((p) => (
                <QuestRow key={p.questId} progress={p} renderObjective={() => true} muted />
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
  progress, renderObjective, onComplete, muted,
}: {
  progress: QuestProgress;
  renderObjective: (o: QuestObjective) => boolean;
  onComplete?: () => void;
  muted?: boolean;
}) {
  const def = getQuestRegistry().get(progress.questId);
  if (!def) return null;
  return (
    <div style={{
      padding: 10, marginBottom: 6,
      background: '#222', borderRadius: 8, opacity: muted ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <strong>{def.name}</strong>
        {onComplete && <button onClick={onComplete} style={btn(true)}>완료 보고</button>}
      </div>
      <div style={{ opacity: 0.75, marginBottom: 6 }}>{def.summary}</div>
      <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
        {def.objectives.map((o) => {
          const ok = renderObjective(o);
          const cur = progress.progress[o.id] ?? 0;
          const need = o.type === 'collect' || o.type === 'deliver' ? o.count : 1;
          const cnt = o.type === 'collect'
            ? Math.min(useInventoryStore.getState().countOf(o.itemId), need)
            : cur;
          const itemName = (o.type === 'collect' || o.type === 'deliver')
            ? getItemRegistry().get(o.itemId)?.name ?? o.itemId
            : '';
          return (
            <li key={o.id} style={{ color: ok ? '#7adf90' : '#ddd', listStyle: 'square' }}>
              {o.description ?? describeObjective(o, itemName)} {need > 1 ? `(${cnt}/${need})` : ''}
            </li>
          );
        })}
      </ul>
      <div style={{ marginTop: 6, fontSize: 11, color: '#ffd84a' }}>
        보상: {def.rewards.map((r) => describeReward(r)).join(', ')}
      </div>
    </div>
  );
}

function describeObjective(o: QuestObjective, itemName?: string): string {
  switch (o.type) {
    case 'collect': return `${itemName ?? o.itemId} 수집`;
    case 'deliver': return `${o.npcId}에게 ${itemName ?? o.itemId} 전달`;
    case 'talk': return `${o.npcId}와 대화`;
    case 'visit': return `${o.tag} 방문`;
    case 'flag': return `조건 충족`;
  }
}

function describeReward(r: { type: string } & Record<string, unknown>): string {
  if (r.type === 'item') return `${r.itemId} x${(r as { count?: number }).count ?? 1}`;
  if (r.type === 'bells') return `${(r as { amount: number }).amount} B`;
  if (r.type === 'friendship') return `친밀도 +${(r as { amount: number }).amount}`;
  return '';
}

function btn(primary?: boolean): React.CSSProperties {
  return {
    padding: '4px 10px',
    background: primary ? '#7aa6ff' : '#444',
    color: primary ? '#0d1424' : '#fff',
    border: 'none', borderRadius: 6, cursor: 'pointer',
    fontFamily: "'Pretendard', system-ui, sans-serif", fontSize: 12, fontWeight: primary ? 700 : 400,
  };
}

export default QuestLogUI;
