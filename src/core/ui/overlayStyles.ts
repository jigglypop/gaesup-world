import type { CSSProperties } from 'react';

export const OVERLAY_FONT_FAMILY = "'Pretendard', system-ui, sans-serif";
export const OVERLAY_TEXT_COLOR = '#f3f4f8';
export const OVERLAY_TEXT_DIM_COLOR = 'rgba(243, 244, 248, 0.7)';
export const OVERLAY_ACCENT_COLOR = '#ffd84a';
export const OVERLAY_ACCENT_TEXT_COLOR = '#1a1a1a';
export const OVERLAY_GOOD_COLOR = '#7adf90';
export const OVERLAY_COOL_COLOR = '#9ad9ff';
export const OVERLAY_BORDER_COLOR = 'rgba(255, 255, 255, 0.12)';
export const OVERLAY_SURFACE_COLOR = 'rgba(255, 255, 255, 0.05)';
export const OVERLAY_SURFACE_ACTIVE_COLOR = 'rgba(255, 255, 255, 0.1)';
const PANEL_BLUR = 'blur(18px) saturate(140%)';
const BACKDROP_BLUR = 'blur(6px) saturate(120%)';

export const OVERLAY_BACKDROP_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 'var(--gaesup-z-overlay, 130)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(5, 8, 12, 0.56)',
  backdropFilter: BACKDROP_BLUR,
  WebkitBackdropFilter: BACKDROP_BLUR,
};

export const OVERLAY_PANEL_STYLE: CSSProperties = {
  background: 'rgba(18, 20, 28, 0.9)',
  color: OVERLAY_TEXT_COLOR,
  border: `1px solid ${OVERLAY_BORDER_COLOR}`,
  borderRadius: 14,
  boxShadow: '0 18px 44px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  backdropFilter: PANEL_BLUR,
  WebkitBackdropFilter: PANEL_BLUR,
  fontFamily: OVERLAY_FONT_FAMILY,
  fontSize: 13,
  overflow: 'hidden',
};

export const OVERLAY_HEADER_STYLE: CSSProperties = {
  padding: '10px 14px',
  borderBottom: `1px solid ${OVERLAY_BORDER_COLOR}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
};

export const OVERLAY_CARD_STYLE: CSSProperties = {
  background: OVERLAY_SURFACE_COLOR,
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 10,
};

export function overlayButtonStyle(primary = false): CSSProperties {
  return {
    padding: '6px 10px',
    background: primary ? OVERLAY_ACCENT_COLOR : 'rgba(255, 255, 255, 0.06)',
    color: primary ? OVERLAY_ACCENT_TEXT_COLOR : OVERLAY_TEXT_COLOR,
    border: primary ? '1px solid transparent' : `1px solid ${OVERLAY_BORDER_COLOR}`,
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: OVERLAY_FONT_FAMILY,
    fontSize: 12,
    fontWeight: primary ? 700 : 500,
  };
}
