import { useEffect, useRef, useState } from 'react';

import type { KeyboardState } from '../../../../interactions/bridge';
import { useInputBackend } from '../../../../interactions/hooks';

export type TouchControlsProps = {
  /** Force visibility regardless of pointer detection. */
  forceVisible?: boolean;
  /** Joystick radius in px. */
  radius?: number;
  /** Joystick deadzone (0..1). Below this, no movement is dispatched. */
  deadzone?: number;
  /** Run-threshold (0..1). Above this, the run flag is also set. */
  runThreshold?: number;
  /** Optional action buttons rendered next to the right cluster. */
  actions?: TouchActionButton[];
};

export type TouchActionButton = {
  id: string;
  label: string;
  /** Single key character to dispatch on press / release (eg. 'F', ' '). */
  key?: string;
  onPress?: () => void;
  onRelease?: () => void;
};

const DEFAULT_ACTIONS: TouchActionButton[] = [
  { id: 'jump', label: '점프', key: ' ' },
  { id: 'use',  label: '사용', key: 'F' },
];

type TouchKeyboardUpdate = Partial<
  Pick<KeyboardState, 'forward' | 'backward' | 'leftward' | 'rightward' | 'shift'>
>;

function isCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

function dispatchKey(type: 'keydown' | 'keyup', key: string): void {
  if (typeof window === 'undefined') return;
  const code = /^[a-zA-Z]$/.test(key) ? `Key${key.toUpperCase()}` : key === ' ' ? 'Space' : key;
  const event = new KeyboardEvent(type, {
    key: key === ' ' ? ' ' : key.toLowerCase(),
    code,
    bubbles: true,
  });
  window.dispatchEvent(event);
}

/**
 * Mobile / coarse-pointer overlay: virtual joystick on the left, action
 * buttons on the right. The joystick drives the active input backend with
 * `forward/backward/leftward/rightward/shift`, action buttons
 * dispatch synthetic keyboard events so existing key-bound systems pick them up.
 */
export function TouchControls({
  forceVisible = false,
  radius = 60,
  deadzone = 0.18,
  runThreshold = 0.8,
  actions = DEFAULT_ACTIONS,
}: TouchControlsProps = {}) {
  const [visible, setVisible] = useState(false);
  const inputBackend = useInputBackend();
  const padRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    pointerId: -1,
    cx: 0,
    cy: 0,
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    run: false,
  });

  useEffect(() => {
    setVisible(forceVisible || isCoarsePointer());
  }, [forceVisible]);

  useEffect(() => {
    if (!visible) return;
    const pad = padRef.current;
    const knob = knobRef.current;
    if (!pad || !knob) return;
    const reset = () => {
      const s = stateRef.current;
      const upd: TouchKeyboardUpdate = {};
      if (s.forward) upd.forward = false;
      if (s.backward) upd.backward = false;
      if (s.leftward) upd.leftward = false;
      if (s.rightward) upd.rightward = false;
      if (s.run) upd.shift = false;
      s.forward = s.backward = s.leftward = s.rightward = s.run = false;
      if (Object.keys(upd).length > 0) inputBackend.updateKeyboard(upd);
      knob.style.transform = 'translate(-50%, -50%)';
      stateRef.current.pointerId = -1;
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      const rect = pad.getBoundingClientRect();
      stateRef.current.cx = rect.left + rect.width / 2;
      stateRef.current.cy = rect.top + rect.height / 2;
      stateRef.current.pointerId = e.pointerId;
      pad.setPointerCapture(e.pointerId);
      onMove(e);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== stateRef.current.pointerId) return;
      const dx = e.clientX - stateRef.current.cx;
      const dy = e.clientY - stateRef.current.cy;
      const dist = Math.hypot(dx, dy);
      const clamped = Math.min(dist, radius);
      const angle = Math.atan2(dy, dx);
      const knobX = Math.cos(angle) * clamped;
      const knobY = Math.sin(angle) * clamped;
      knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

      const norm = clamped / radius;
      const s = stateRef.current;
      const upd: TouchKeyboardUpdate = {};
      if (norm < deadzone) {
        if (s.forward)   { upd.forward   = false; s.forward   = false; }
        if (s.backward)  { upd.backward  = false; s.backward  = false; }
        if (s.leftward)  { upd.leftward  = false; s.leftward  = false; }
        if (s.rightward) { upd.rightward = false; s.rightward = false; }
        if (s.run)       { upd.shift     = false; s.run       = false; }
      } else {
        const ax = Math.cos(angle);
        const ay = Math.sin(angle);
        const f = ay < -0.35;
        const b = ay > 0.35;
        const l = ax < -0.35;
        const r = ax > 0.35;
        const run = norm >= runThreshold;
        if (s.forward !== f)   { upd.forward   = f;   s.forward   = f; }
        if (s.backward !== b)  { upd.backward  = b;   s.backward  = b; }
        if (s.leftward !== l)  { upd.leftward  = l;   s.leftward  = l; }
        if (s.rightward !== r) { upd.rightward = r;   s.rightward = r; }
        if (s.run !== run)     { upd.shift     = run; s.run       = run; }
      }
      if (Object.keys(upd).length > 0) inputBackend.updateKeyboard(upd);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== stateRef.current.pointerId) return;
      reset();
    };

    pad.addEventListener('pointerdown', onDown);
    pad.addEventListener('pointermove', onMove);
    pad.addEventListener('pointerup', onUp);
    pad.addEventListener('pointercancel', onUp);
    pad.addEventListener('pointerleave', onUp);
    return () => {
      pad.removeEventListener('pointerdown', onDown);
      pad.removeEventListener('pointermove', onMove);
      pad.removeEventListener('pointerup', onUp);
      pad.removeEventListener('pointercancel', onUp);
      pad.removeEventListener('pointerleave', onUp);
      reset();
    };
  }, [visible, radius, deadzone, runThreshold, inputBackend]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        pointerEvents: 'none',
        fontFamily: "'Pretendard', system-ui, sans-serif",
      }}
    >
      <div
        ref={padRef}
        style={{
          position: 'absolute',
          left: 24,
          bottom: 24,
          width: radius * 2,
          height: radius * 2,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.25)',
          background: 'rgba(20,22,30,0.32)',
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          touchAction: 'none',
          pointerEvents: 'auto',
        }}
      >
        <div
          ref={knobRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: radius * 0.85,
            height: radius * 0.85,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.55)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.28)',
            transform: 'translate(-50%, -50%)',
            transition: 'transform 0.04s linear',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          right: 20,
          bottom: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, auto)',
          gap: 12,
          pointerEvents: 'auto',
        }}
      >
        {actions.map((action) => (
          <ActionPad key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}

type ActionPadProps = { action: TouchActionButton };

function ActionPad({ action }: ActionPadProps) {
  const [pressed, setPressed] = useState(false);

  const press = () => {
    setPressed(true);
    if (action.key) dispatchKey('keydown', action.key);
    action.onPress?.();
  };
  const release = () => {
    setPressed(false);
    if (action.key) dispatchKey('keyup', action.key);
    action.onRelease?.();
  };

  return (
    <button
      type="button"
      onPointerDown={(e) => { e.preventDefault(); press(); }}
      onPointerUp={(e) => { e.preventDefault(); release(); }}
      onPointerCancel={release}
      onPointerLeave={() => { if (pressed) release(); }}
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.22)',
        background: pressed ? 'rgba(255,216,74,0.32)' : 'rgba(20,22,30,0.42)',
        color: '#f3f4f8',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {action.label}
    </button>
  );
}

export default TouchControls;
