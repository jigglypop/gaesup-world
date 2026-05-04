import { useEffect, useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { KeyboardState } from '../bridge';
import { useInputBackend } from './useInputBackend';
import { usePlayerPosition } from '../../motions/hooks/usePlayerPosition';
import { useInteractablesStore } from '../stores/interactablesStore';

const _tmpVec = new THREE.Vector3();

export type CurrentInteraction = {
  id: string;
  label: string;
  key: string;
  distance: number;
} | null;

export function useCurrentInteraction(): CurrentInteraction {
  return useInteractablesStore((s) => s.current);
}

export function useInteractionKey(enabled: boolean = true): void {
  const current = useCurrentInteraction();
  const activate = useInteractablesStore((s) => s.activateCurrent);
  const inputBackend = useInputBackend();
  const wasPressedRef = useRef(false);

  useEffect(() => {
    wasPressedRef.current = false;
    if (!enabled || !current) return;

    const activateOnce = (pressed: boolean) => {
      if (pressed && !wasPressedRef.current) {
        activate();
      }
      wasPressedRef.current = pressed;
    };

    const backendKey = getBackendInteractionKey(current.key);
    if (backendKey && inputBackend.subscribe) {
      activateOnce(Boolean(inputBackend.getKeyboard()[backendKey]));
      return inputBackend.subscribe(({ keyboard }) => {
        activateOnce(Boolean(keyboard[backendKey]));
      });
    }

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key.toLowerCase() === current.key.toLowerCase()) {
        activate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, enabled, activate, inputBackend]);
}

function getBackendInteractionKey(key: string): keyof KeyboardState | null {
  switch (key.toLowerCase()) {
    case 'w':
      return 'forward';
    case 'a':
      return 'leftward';
    case 's':
      return 'backward';
    case 'd':
      return 'rightward';
    case 'shift':
      return 'shift';
    case ' ':
    case 'space':
      return 'space';
    case 'z':
      return 'keyZ';
    case 'r':
      return 'keyR';
    case 'f':
      return 'keyF';
    case 'e':
      return 'keyE';
    case 'escape':
      return 'escape';
    default:
      return null;
  }
}

export type InteractionTrackerProps = {
  throttleMs?: number;
};

export function InteractionTracker({ throttleMs = 80 }: InteractionTrackerProps = {}): null {
  const { position } = usePlayerPosition({ updateInterval: 16 });
  const entries = useInteractablesStore((s) => s.entries);
  const setCurrent = useInteractablesStore((s) => s.setCurrent);
  const accumRef = useRef(0);

  useFrame((_, delta) => {
    accumRef.current += delta * 1000;
    if (accumRef.current < throttleMs) return;
    accumRef.current = 0;

    let bestId: string | null = null;
    let bestDist2 = Infinity;
    let bestLabel = '';
    let bestKey = 'e';
    for (const e of entries.values()) {
      _tmpVec.copy(e.position).sub(position);
      const d2 = _tmpVec.lengthSq();
      const r2 = e.range * e.range;
      if (d2 > r2) continue;
      if (d2 < bestDist2) {
        bestDist2 = d2;
        bestId = e.id;
        bestLabel = e.label;
        bestKey = e.key;
      }
    }

    if (!bestId) {
      setCurrent(null);
      return;
    }
    setCurrent({
      id: bestId,
      label: bestLabel,
      key: bestKey,
      distance: Math.sqrt(bestDist2),
    });
  });

  return null;
}
