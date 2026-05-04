import type { MotionsTeleportPayload } from '../plugin';

export type TeleportEventHandler = (payload: MotionsTeleportPayload) => void;

function isTeleportPayload(value: unknown): value is MotionsTeleportPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Partial<MotionsTeleportPayload>;
  const position = payload.position;
  return (
    !!position &&
    typeof position.x === 'number' &&
    typeof position.y === 'number' &&
    typeof position.z === 'number'
  );
}

function readCustomEventPayload(event: Event): MotionsTeleportPayload | null {
  if (!('detail' in event)) return null;
  const detail = (event as CustomEvent<unknown>).detail;
  return isTeleportPayload(detail) ? detail : null;
}

export function subscribeLegacyTeleportEvents(handler: TeleportEventHandler): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const payload = readCustomEventPayload(event);
    if (payload) handler(payload);
  };

  window.addEventListener('gaesup:teleport', listener);
  document.addEventListener('teleport-request', listener);

  return () => {
    window.removeEventListener('gaesup:teleport', listener);
    document.removeEventListener('teleport-request', listener);
  };
}
