import { useCallback, useEffect, useReducer } from 'react';

import { useDialogStore } from '../../stores/dialogStore';
import type { DialogChoice } from '../../types';

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
  const [, refreshChoices] = useReducer((revision: number) => revision + 1, 0);

  const choices = runner?.visibleChoices() ?? [];
  const handleChoose = useCallback((choice: DialogChoice) => {
    if (!runner || useDialogStore.getState().runner !== runner) return;
    const index = runner.visibleChoices().indexOf(choice);
    if (index >= 0) choose(index);
    else refreshChoices();
  }, [runner, choose]);

  useEffect(() => {
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target;
      if (target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable)) return;
      const idx = /^[1-9]$/.test(e.key) ? Number(e.key) : 0;
      const isAdvance = e.key.toLowerCase() === advanceKey.toLowerCase();
      if (e.key !== closeKey && !isAdvance && !(idx >= 1 && idx <= choices.length)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.repeat) return;
      if (e.key === closeKey) {
        close();
        return;
      }
      if (choices.length === 0 && isAdvance) {
        advance();
        return;
      }
      if (idx >= 1 && idx <= choices.length) {
        const choice = choices[idx - 1];
        if (choice) handleChoose(choice);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [node, choices, advance, handleChoose, close, advanceKey, closeKey]);

  if (!node) return null;

  return (
    <div
      role="dialog"
      aria-label={node.speaker ? `${node.speaker} 대화` : '대화'}
      data-world-overlay
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 110,
        transform: 'translateX(-50%)',
        width: 'min(720px, 92vw)',
        boxSizing: 'border-box',
        maxHeight: 'calc(100dvh - var(--app-header-height, 64px) - 130px)',
        overflowY: 'auto',
        overflowWrap: 'anywhere',
        zIndex: 'var(--gaesup-z-panel, 90)',
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
        <button type="button" onClick={advance} style={{ marginTop: 10, marginRight: 8, padding: '9px 12px', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'inherit', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}>
          [{advanceKey.toUpperCase()}] 다음
        </button>
      ) : (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {choices.map((c, i) => (
            <button
              type="button"
              key={i}
              onClick={() => handleChoose(c)}
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
      <button type="button" onClick={close} style={{ marginTop: 10, marginRight: 8, padding: '9px 12px', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'inherit', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8 }}>
        대화 닫기
      </button>
    </div>
  );
}

export default DialogBox;
