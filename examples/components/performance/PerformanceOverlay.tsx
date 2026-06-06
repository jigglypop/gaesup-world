import { lazy, Suspense, useState, type CSSProperties } from 'react';

const PerformancePanel = lazy(() =>
  import('gaesup-world/editor').then((module) => ({ default: module.PerformancePanel })),
);

export function PerformanceOverlay() {
  const [open, setOpen] = useState(false);

  return (
    <div style={wrapStyle}>
      <button type="button" style={toggleStyle} onClick={() => setOpen((value) => !value)}>
        성능 {open ? '숨기기' : '보기'}
      </button>
      {open && (
        <Suspense fallback={null}>
          <PerformancePanel
            className="gp-performance-overlay"
            style={panelStyle}
          />
        </Suspense>
      )}
    </div>
  );
}

const wrapStyle: CSSProperties = {
  position: 'fixed',
  right: 16,
  top: 124,
  zIndex: 86,
  width: 320,
  maxWidth: 'calc(100vw - 32px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: 8,
  pointerEvents: 'auto',
};

const toggleStyle: CSSProperties = {
  minHeight: 34,
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 6,
  background: 'rgba(18, 20, 28, 0.84)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 800,
  boxShadow: '0 12px 28px rgba(0,0,0,0.24)',
};

const panelStyle: CSSProperties = {
  maxHeight: 'calc(100vh - 176px)',
  overflowY: 'auto',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 8,
  background: 'rgba(18, 20, 28, 0.9)',
  boxShadow: '0 18px 44px rgba(0,0,0,0.3)',
};
