import React, { useEffect } from 'react';

import { useDialogStore } from '../../stores/dialogStore';

export type DialogBoxProps = {
  advanceKey?: string;
  closeKey?: string;
};

export function DialogBox({ advanceKey = 'e', closeKey = 'Escape' }: DialogBoxProps) {
  const node = useDialogStore((s) => s.node);
  const runner = useDialogStore((s) => s.runner);
  const advance = useDialogStore((s) => s.advance);
  const choose = useDialogStore((s) => s.choose);
  const close = useDialogStore((s) => s.close);

  const choices = runner?.visibleChoices() ?? [];

  useEffect(() => {
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === closeKey) {
        close();
        return;
      }
      if (choices.length === 0 && e.key.toLowerCase() === advanceKey.toLowerCase()) {
        advance();
        return;
      }
      const idx = parseInt(e.key, 10);
      if (!Number.isNaN(idx) && idx >= 1 && idx <= choices.length) {
        choose(idx - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [node, choices.length, advance, choose, close, advanceKey, closeKey]);

  if (!node) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 110,
        transform: 'translateX(-50%)',
        width: 'min(720px, 92vw)',
        zIndex: 120,
        background: 'rgba(18,20,28,0.62)',
        color: '#f3f4f8',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        fontFamily: "'Pretendard', system-ui, sans-serif",
        fontSize: 14,
        padding: 14,
      }}
    >
      {node.speaker && (
        <div style={{
          display: 'inline-block',
          padding: '3px 8px',
          background: '#ffd84a',
          color: '#1a1a1a',
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 12,
          marginBottom: 6,
        }}>{node.speaker}</div>
      )}
      <div style={{ lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{node.text}</div>
      {choices.length === 0 ? (
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65, textAlign: 'right' }}>
          [{advanceKey.toUpperCase()}] 다음
        </div>
      ) : (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              style={{
                textAlign: 'left',
                padding: '9px 12px',
                background: 'rgba(255,255,255,0.06)',
                color: '#f3f4f8',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                cursor: 'pointer',
                fontFamily: "'Pretendard', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <span style={{
                display: 'inline-block', width: 18, color: '#ffd84a', marginRight: 6,
              }}>{i + 1}.</span>
              {c.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DialogBox;
