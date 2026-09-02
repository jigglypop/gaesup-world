import React, { useEffect, useState } from 'react';

import { getItemRegistry } from '../../../items/registry/ItemRegistry';
import {
  OVERLAY_ACCENT_COLOR,
  OVERLAY_BACKDROP_STYLE,
  OVERLAY_BORDER_COLOR,
  OVERLAY_CARD_STYLE,
  OVERLAY_HEADER_STYLE,
  OVERLAY_PANEL_STYLE,
  OVERLAY_SURFACE_ACTIVE_COLOR,
  OVERLAY_TEXT_DIM_COLOR,
  overlayButtonStyle,
} from '../../../ui/overlayStyles';
import { useMailStore } from '../../stores/mailStore';
import type { MailMessage } from '../../types';

export type MailboxUIProps = {
  toggleKey?: string;
};

const PANEL_WIDTH = 720;
const PANEL_HEIGHT = 460;
const LIST_WIDTH = 260;
const UNREAD_COLOR = '#cf9aff';
const SINGLE_ITEM = 1;

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
  const selected = selectedId ? (sorted.find((m) => m.id === selectedId) ?? null) : null;

  return (
    <div style={OVERLAY_BACKDROP_STYLE} onClick={() => setOpen(false)}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...OVERLAY_PANEL_STYLE,
          width: PANEL_WIDTH,
          height: PANEL_HEIGHT,
          display: 'flex',
        }}
      >
        <div
          style={{
            width: LIST_WIDTH,
            borderRight: `1px solid ${OVERLAY_BORDER_COLOR}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={OVERLAY_HEADER_STYLE}>
            <strong style={{ fontSize: 15 }}>우편함</strong>
            <span style={{ fontSize: 12, color: OVERLAY_TEXT_DIM_COLOR }}>{sorted.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sorted.length === 0 ? (
              <Empty>우편이 없습니다.</Empty>
            ) : (
              sorted.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedId(m.id);
                    if (!m.read) markRead(m.id);
                  }}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    background: selectedId === m.id ? OVERLAY_SURFACE_ACTIVE_COLOR : 'transparent',
                    borderBottom: `1px solid ${OVERLAY_BORDER_COLOR}`,
                    opacity: m.read ? 0.7 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {!m.read && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: UNREAD_COLOR,
                        }}
                      />
                    )}
                    <strong style={{ fontSize: 13 }}>{m.subject}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: OVERLAY_TEXT_DIM_COLOR }}>
                    {m.from} · {m.sentDay}일차
                  </div>
                  {m.attachments && m.attachments.length > 0 && !m.claimed && (
                    <div style={{ fontSize: 11, color: OVERLAY_ACCENT_COLOR }}>* 첨부물</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={OVERLAY_HEADER_STYLE}>
            <span>{selected ? selected.subject : '메시지를 선택하세요'}</span>
            <button onClick={() => setOpen(false)} style={overlayButtonStyle()}>
              닫기 [{toggleKey.toUpperCase()}]
            </button>
          </div>
          <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
            {selected ? (
              <MailDetail
                msg={selected}
                onClaim={() => claim(selected.id)}
                onDelete={() => {
                  del(selected.id);
                  setSelectedId(null);
                }}
              />
            ) : (
              <div style={{ color: OVERLAY_TEXT_DIM_COLOR }}>왼쪽에서 메시지를 선택하세요.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MailDetail({
  msg,
  onClaim,
  onDelete,
}: {
  msg: MailMessage;
  onClaim: () => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <div style={{ marginBottom: 6, color: OVERLAY_TEXT_DIM_COLOR }}>보낸 사람: {msg.from}</div>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 12 }}>{msg.body}</div>
      {msg.attachments && msg.attachments.length > 0 && (
        <div style={{ ...OVERLAY_CARD_STYLE, padding: 10, marginBottom: 8 }}>
          <div style={{ marginBottom: 6, color: OVERLAY_ACCENT_COLOR, fontSize: 12 }}>첨부물</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {msg.attachments.map((a, i) => {
              if ('itemId' in a) {
                const def = getItemRegistry().get(a.itemId);
                return (
                  <li key={i}>
                    {def?.name ?? a.itemId} x{a.count ?? SINGLE_ITEM}
                  </li>
                );
              }
              return <li key={i}>{a.bells} 벨</li>;
            })}
          </ul>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            {!msg.claimed ? (
              <button onClick={onClaim} style={overlayButtonStyle(true)}>
                받기
              </button>
            ) : (
              <span style={{ fontSize: 12, color: OVERLAY_TEXT_DIM_COLOR }}>수령 완료</span>
            )}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onDelete} style={overlayButtonStyle()}>
          삭제
        </button>
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: 14, color: OVERLAY_TEXT_DIM_COLOR }}>{children}</div>;
}

export default MailboxUI;
