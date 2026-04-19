import React, { useEffect } from 'react';

import { useToastStore, type ToastKind } from './toastStore';

export { notify, useToastStore } from './toastStore';
export type { Toast, ToastKind } from './toastStore';

const KIND_STYLE: Record<ToastKind, { bg: string; ring: string; icon: string }> = {
  info:    { bg: 'rgba(20,30,50,0.92)',  ring: '#7aa6ff', icon: 'i' },
  success: { bg: 'rgba(20,40,30,0.92)',  ring: '#7adf90', icon: '+' },
  warn:    { bg: 'rgba(50,40,20,0.92)',  ring: '#ffd84a', icon: '!' },
  error:   { bg: 'rgba(50,20,20,0.92)',  ring: '#ff7a7a', icon: 'x' },
  reward:  { bg: 'rgba(40,30,10,0.92)',  ring: '#ffc24a', icon: '*' },
  mail:    { bg: 'rgba(30,20,40,0.92)',  ring: '#cf9aff', icon: 'M' },
};

export type ToastHostProps = {
  position?: 'top-right' | 'top-center';
  max?: number;
};

export function ToastHost({ position = 'top-right', max = 5 }: ToastHostProps) {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      window.setTimeout(() => dismiss(t.id), Math.max(500, t.durationMs)),
    );
    return () => { timers.forEach((id) => window.clearTimeout(id)); };
  }, [toasts, dismiss]);

  const layout = position === 'top-center'
    ? { top: 12, left: '50%', transform: 'translateX(-50%)' as const }
    : { top: 12, right: 12 };

  const visible = toasts.slice(-max);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 110,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
        ...layout,
      }}
    >
      {visible.map((t) => {
        const s = KIND_STYLE[t.kind];
        return (
          <div
            key={t.id}
            style={{
              minWidth: 220,
              maxWidth: 360,
              padding: '8px 12px',
              borderRadius: 8,
              background: s.bg,
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: `0 6px 18px rgba(0,0,0,0.4), inset 0 0 0 1px ${s.ring}55`,
              animation: 'gaesup-toast-in 220ms ease-out both',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22, height: 22,
                borderRadius: 6,
                background: s.ring,
                color: '#1a1a1a',
                fontWeight: 700,
              }}
            >{t.icon ?? s.icon}</span>
            <span>{t.text}</span>
          </div>
        );
      })}
      <style>{`@keyframes gaesup-toast-in {
        0% { opacity: 0; transform: translateY(-6px); }
        100% { opacity: 1; transform: translateY(0); }
      }`}</style>
    </div>
  );
}

export default ToastHost;
