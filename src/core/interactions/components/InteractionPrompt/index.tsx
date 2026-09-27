import { useCurrentInteraction, useInteractionKey } from '../../hooks/useInteractionTarget';

export type InteractionPromptProps = {
  enabled?: boolean;
};

export function InteractionPrompt({ enabled = true }: InteractionPromptProps) {
  const target = useCurrentInteraction();
  useInteractionKey(enabled);

  if (!enabled || !target) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 96,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--gaesup-z-hud, 60)',
        padding: '8px 14px',
        background: 'var(--gaesup-ui-surface, rgba(18,20,28,0.55))',
        color: 'var(--gaesup-ui-text, #f3f4f8)',
        fontFamily: "var(--gaesup-ui-font, 'Pretendard', system-ui, sans-serif)",
        fontSize: 13,
        fontWeight: 500,
        borderRadius: 999,
        border: '1px solid var(--gaesup-ui-border, rgba(255,255,255,0.12))',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: 'var(--gaesup-ui-shadow, 0 8px 22px rgba(0,0,0,0.32))',
        backdropFilter: 'var(--gaesup-ui-blur, blur(18px) saturate(140%))',
        WebkitBackdropFilter: 'var(--gaesup-ui-blur, blur(18px) saturate(140%))',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 22,
          height: 22,
          padding: '0 6px',
          borderRadius: 6,
          background: 'var(--gaesup-ui-accent, #ffd84a)',
          color: 'var(--gaesup-ui-accent-text, #222)',
          fontWeight: 700,
        }}
      >
        {target.key.toUpperCase()}
      </span>
      <span>{target.label}</span>
      <span style={{ opacity: 0.5, fontSize: 11 }}>{target.distance.toFixed(1)}m</span>
    </div>
  );
}

export default InteractionPrompt;
