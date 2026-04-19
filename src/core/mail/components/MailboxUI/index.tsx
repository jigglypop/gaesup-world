import React, { useEffect, useState } from 'react';

import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import { useMailStore } from '../../stores/mailStore';
import type { MailMessage } from '../../types';

export type MailboxUIProps = {
  toggleKey?: string;
};

export function MailboxUI({ toggleKey = 'm' }: MailboxUIProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const messages = useMailStore((s) => s.messages);
  const markRead = useMailStore((s) => s.markRead);
  const claim = useMailStore((s) => s.claim);
  const del = useMailStore((s) => s.delete);

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
  const sorted = messages.slice().sort((a, b) => b.sentDay - a.sentDay);
  const selected = selectedId ? sorted.find((m) => m.id === selectedId) ?? null : null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 720, height: 460, display: 'flex',
          background: '#1a1a1a', color: '#fff', borderRadius: 12,
          boxShadow: '0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(207,154,255,0.35)',
          fontFamily: 'monospace', fontSize: 13, overflow: 'hidden',
        }}
      >
        <div style={{ width: 260, borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
            <strong>우편함</strong>
            <span style={{ fontSize: 12, opacity: 0.7 }}>{sorted.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sorted.length === 0 ? <Empty>우편이 없습니다.</Empty> : sorted.map((m) => (
              <div
                key={m.id}
                onClick={() => { setSelectedId(m.id); if (!m.read) markRead(m.id); }}
                style={{
                  padding: '8px 12px', cursor: 'pointer',
                  background: selectedId === m.id ? '#262626' : 'transparent',
                  borderBottom: '1px solid #2a2a2a',
                  opacity: m.read ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!m.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#cf9aff' }} />}
                  <strong style={{ fontSize: 13 }}>{m.subject}</strong>
                </div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{m.from} · day {m.sentDay}</div>
                {m.attachments && m.attachments.length > 0 && !m.claimed && (
                  <div style={{ fontSize: 11, color: '#ffd84a' }}>* 첨부물</div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
            <span>{selected ? selected.subject : '메시지를 선택하세요'}</span>
            <button onClick={() => setOpen(false)} style={btn()}>닫기 [{toggleKey.toUpperCase()}]</button>
          </div>
          <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
            {selected ? (
              <MailDetail msg={selected} onClaim={() => claim(selected.id)} onDelete={() => { del(selected.id); setSelectedId(null); }} />
            ) : (
              <div style={{ opacity: 0.6 }}>왼쪽에서 메시지를 선택하세요.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MailDetail({ msg, onClaim, onDelete }: { msg: MailMessage; onClaim: () => void; onDelete: () => void }) {
  return (
    <div>
      <div style={{ marginBottom: 6, opacity: 0.75 }}>From. {msg.from}</div>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 12 }}>{msg.body}</div>
      {msg.attachments && msg.attachments.length > 0 && (
        <div style={{ padding: 10, background: '#222', borderRadius: 8, marginBottom: 8 }}>
          <div style={{ marginBottom: 6, color: '#ffd84a', fontSize: 12 }}>첨부물</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {msg.attachments.map((a, i) => {
              if ('itemId' in a) {
                const def = getItemRegistry().get(a.itemId);
                return <li key={i}>{def?.name ?? a.itemId} x{a.count ?? 1}</li>;
              }
              return <li key={i}>{a.bells} B</li>;
            })}
          </ul>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            {!msg.claimed ? (
              <button onClick={onClaim} style={btn(true)}>받기</button>
            ) : (
              <span style={{ fontSize: 12, opacity: 0.6 }}>수령 완료</span>
            )}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onDelete} style={btn()}>삭제</button>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 14, opacity: 0.6 }}>{children}</div>;
}

function btn(primary?: boolean): React.CSSProperties {
  return {
    padding: '6px 10px',
    background: primary ? '#cf9aff' : '#444',
    color: primary ? '#1a0d24' : '#fff',
    border: 'none', borderRadius: 6, cursor: 'pointer',
    fontFamily: 'monospace', fontSize: 12, fontWeight: primary ? 700 : 400,
  };
}

export default MailboxUI;
