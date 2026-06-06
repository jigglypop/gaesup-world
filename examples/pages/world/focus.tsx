import { useEffect } from 'react';

import {
  requestCameraCloseUp,
  restoreCameraCloseUp,
  useGaesupStore,
  useInputBackend,
} from 'gaesup-world';

export type WorldFocusInfo = {
  id: string;
  category: string;
  title: string;
  description: string;
  target: [number, number, number];
  details?: string[];
  focusDistance?: number;
  focusLerpSpeed?: number;
  fov?: number;
};

type WorldFocusModalProps = {
  focus: WorldFocusInfo | null;
  onClose: () => void;
};

const CLEAR_KEYBOARD = {
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
  shift: false,
  space: false,
  keyZ: false,
  keyR: false,
  keyF: false,
  keyE: false,
  escape: false,
};

const CLEAR_MOUSE = {
  isActive: false,
  shouldRun: false,
  isLookAround: false,
  buttons: {
    left: false,
    right: false,
    middle: false,
  },
};

export function WorldFocusModal({ focus, onClose }: WorldFocusModalProps) {
  const inputBackend = useInputBackend();

  useEffect(() => {
    if (!focus) return;

    const store = useGaesupStore.getState();
    const wasInteractionActive = store.interaction.isActive;

    store.setInteractionActive(false);
    inputBackend.updateKeyboard(CLEAR_KEYBOARD);
    inputBackend.updateMouse(CLEAR_MOUSE);

    requestCameraCloseUp(focus.target, {
      focusDistance: focus.focusDistance ?? 4.2,
      focusLerpSpeed: focus.focusLerpSpeed ?? 8,
      fov: focus.fov ?? 44,
      enableCollision: false,
    });

    const blockKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    window.addEventListener('keydown', blockKeyboard, true);
    window.addEventListener('keyup', blockKeyboard, true);

    return () => {
      window.removeEventListener('keydown', blockKeyboard, true);
      window.removeEventListener('keyup', blockKeyboard, true);
      inputBackend.updateKeyboard(CLEAR_KEYBOARD);
      inputBackend.updateMouse(CLEAR_MOUSE);
      useGaesupStore.getState().setInteractionActive(wasInteractionActive);
      restoreCameraCloseUp();
    };
  }, [focus, inputBackend, onClose]);

  if (!focus) return null;

  return (
    <div
      className="world-focus-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="world-focus-modal-title"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <section className="world-focus-modal__panel">
        <div className="world-focus-modal__eyebrow">{focus.category}</div>
        <h2 id="world-focus-modal-title">{focus.title}</h2>
        <p>{focus.description}</p>
        {focus.details && focus.details.length > 0 && (
          <ul className="world-focus-modal__details">
            {focus.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
        <button type="button" className="world-focus-modal__close" onClick={onClose}>
          닫기
        </button>
      </section>
    </div>
  );
}
