import { logger } from '@/core/utils/logger';

import { InteractionSystem } from './InteractionSystem';
import type { GamepadState, KeyboardState, MouseState, TouchState } from './types';
import {
  notifyInputStateListener,
  type InputAdapter,
  type InputBackend,
  type InputBackendSnapshot,
  type InputStateListener,
} from '../../input/core/backend';

export { createMemoryInputBackend } from '../../input/core/backend';
export type {
  InputAdapter,
  InputBackend,
  InputBackendExtension,
  InputBackendSnapshot,
  InputStateListener,
  MemoryInputBackendInitialState,
} from '../../input/core/backend';

export const DEFAULT_INTERACTION_INPUT_EXTENSION_ID = 'interaction.input';

export type InteractionSystemResolver = () => InteractionSystem;

let defaultInteractionSystemResolver: InteractionSystemResolver = () => InteractionSystem.getInstance();

export function resolveDefaultInteractionSystem(): InteractionSystem {
  return defaultInteractionSystemResolver();
}

export function setDefaultInteractionSystemResolver(
  resolver: InteractionSystemResolver,
): () => void {
  const previousResolver = defaultInteractionSystemResolver;
  defaultInteractionSystemResolver = resolver;
  defaultInteractionInputBackend.invalidate();

  return () => {
    defaultInteractionSystemResolver = previousResolver;
    defaultInteractionInputBackend.invalidate();
  };
}

export function createInteractionSystemInputBackend(
  system: InteractionSystem,
): InputBackend {
  const snapshot = (): InputBackendSnapshot => {
    const state = system.getState();
    return {
      keyboard: system.getKeyboardRef(),
      mouse: system.getMouseRef(),
      gamepad: state.gamepad,
      touch: state.touch,
    };
  };

  return {
    getKeyboard: () => system.getKeyboardRef(),
    getMouse: () => system.getMouseRef(),
    getGamepad: () => system.getState().gamepad,
    getTouch: () => system.getState().touch,
    updateKeyboard: (input) => system.updateKeyboard(input),
    updateMouse: (input) => system.updateMouse(input),
    updateGamepad: (input) => system.updateGamepad(input),
    updateTouch: (input) => system.updateTouch(input),
    subscribe: (listener) => {
      const emit = () => notifyInputStateListener(listener, snapshot());
      system.addEventListener('keyboard', emit);
      system.addEventListener('mouse', emit);
      system.addEventListener('gamepad', emit);
      system.addEventListener('touch', emit);
      system.addEventListener('reset', emit);
      emit();
      return () => {
        system.removeEventListener('keyboard', emit);
        system.removeEventListener('mouse', emit);
        system.removeEventListener('gamepad', emit);
        system.removeEventListener('touch', emit);
        system.removeEventListener('reset', emit);
      };
    },
  };
}

class DefaultInteractionInputBackend implements InputBackend {
  private system: InteractionSystem | null = null;
  private backend: InputBackend | null = null;
  private unsubscribeFromBackend: (() => void) | null = null;
  private readonly listeners = new Map<InputStateListener, number>();
  private listenerGeneration = 0;
  private isBindingBackend = false;

  invalidate(): void {
    this.unsubscribeFromBackend?.();
    this.unsubscribeFromBackend = null;
    this.backend = null;
    this.system = null;
  }

  getKeyboard(): KeyboardState {
    return this.resolveBackend().getKeyboard();
  }

  getMouse(): MouseState {
    return this.resolveBackend().getMouse();
  }

  getGamepad(): GamepadState {
    return this.resolveBackend().getGamepad?.() ?? this.resolveDefaultGamepad();
  }

  getTouch(): TouchState {
    return this.resolveBackend().getTouch?.() ?? this.resolveDefaultTouch();
  }

  updateKeyboard(input: Partial<KeyboardState>): void {
    this.resolveSubscribedBackend().updateKeyboard(input);
  }

  updateMouse(input: Partial<MouseState>): void {
    this.resolveSubscribedBackend().updateMouse(input);
  }

  updateGamepad(input: Partial<GamepadState>): void {
    this.resolveSubscribedBackend().updateGamepad?.(input);
  }

  updateTouch(input: Partial<TouchState>): void {
    this.resolveSubscribedBackend().updateTouch?.(input);
  }

  subscribe(listener: InputStateListener): () => void {
    const registeredGeneration = this.listeners.get(listener);
    if (registeredGeneration !== undefined) {
      return this.createListenerCleanup(listener, registeredGeneration);
    }

    const generation = ++this.listenerGeneration;
    this.listeners.set(listener, generation);
    const emittedInitialState = this.ensureSubscription();
    if (!emittedInitialState) {
      notifyInputStateListener(listener, this.snapshot());
    }

    return this.createListenerCleanup(listener, generation);
  }

  private resolveBackend(): InputBackend {
    const nextSystem = resolveDefaultInteractionSystem();
    if (this.system !== nextSystem || !this.backend) {
      this.unsubscribeFromBackend?.();
      this.unsubscribeFromBackend = null;
      this.system = nextSystem;
      this.backend = createInteractionSystemInputBackend(nextSystem);
    }
    return this.backend;
  }

  private resolveSubscribedBackend(): InputBackend {
    const backend = this.resolveBackend();
    if (this.listeners.size > 0) {
      this.bindBackend(backend);
    }
    return backend;
  }

  private ensureSubscription(): boolean {
    const backend = this.resolveBackend();
    return this.bindBackend(backend);
  }

  private bindBackend(backend: InputBackend): boolean {
    if (this.unsubscribeFromBackend || this.isBindingBackend || !backend.subscribe) {
      return false;
    }

    this.isBindingBackend = true;
    try {
      const unsubscribe = backend.subscribe((state) => {
        this.notifyListeners(state);
      });
      if (this.listeners.size === 0) {
        unsubscribe();
      } else {
        this.unsubscribeFromBackend = unsubscribe;
      }
      return true;
    } catch (error) {
      logger.error(
        '[InteractionInputBackend] Failed to bind backend subscriber',
        error instanceof Error ? error : String(error),
      );
      return false;
    } finally {
      this.isBindingBackend = false;
    }
  }

  private notifyListeners(state: InputBackendSnapshot): void {
    const dispatchGeneration = this.listenerGeneration;
    this.listeners.forEach((generation, listener) => {
      if (generation > dispatchGeneration) return;
      if (this.listeners.get(listener) !== generation) return;
      notifyInputStateListener(listener, state);
    });
  }

  private createListenerCleanup(
    listener: InputStateListener,
    generation: number,
  ): () => void {
    return () => {
      if (this.listeners.get(listener) !== generation) return;
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.unsubscribeFromBackend?.();
        this.unsubscribeFromBackend = null;
      }
    };
  }

  private snapshot(): InputBackendSnapshot {
    const backend = this.resolveBackend();
    const snapshot: InputBackendSnapshot = {
      keyboard: backend.getKeyboard(),
      mouse: backend.getMouse(),
    };
    const gamepad = backend.getGamepad?.();
    const touch = backend.getTouch?.();
    if (gamepad) snapshot.gamepad = gamepad;
    if (touch) snapshot.touch = touch;
    return snapshot;
  }

  private resolveDefaultGamepad(): GamepadState {
    return resolveDefaultInteractionSystem().getState().gamepad;
  }

  private resolveDefaultTouch(): TouchState {
    return resolveDefaultInteractionSystem().getState().touch;
  }
}

const defaultInteractionInputBackend = new DefaultInteractionInputBackend();

export function getDefaultInteractionInputBackend(): InputBackend {
  return defaultInteractionInputBackend;
}

export function createDefaultInteractionInputBackend(): InputBackend {
  return getDefaultInteractionInputBackend();
}

export function createInteractionInputAdapter(system?: InteractionSystem): InputAdapter {
  if (system) return createInteractionSystemInputBackend(system);
  return createDefaultInteractionInputBackend();
}
