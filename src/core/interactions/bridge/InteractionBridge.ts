import * as THREE from 'three';

import { HandleError, LogSnapshot, Profile } from '@/core/boilerplate/decorators';
import { logger } from '@/core/utils/logger';

import type {
  AutomationAction,
  AutomationSettings,
  BridgeCommand,
  BridgeEvent,
  BridgeState,
  BridgeSnapshot,
  GamepadState,
  InteractionConfig,
  TouchState,
} from './types';
import { AutomationSystem } from '../core/AutomationSystem';
import { InteractionSystem, KeyboardState, MouseState } from '../core/InteractionSystem';

export class InteractionBridge {
  private static globalInstance: InteractionBridge | null = null;

  static getGlobal(): InteractionBridge {
    if (!InteractionBridge.globalInstance) {
      InteractionBridge.globalInstance = new InteractionBridge();
    }
    return InteractionBridge.globalInstance;
  }

  static disposeGlobal(): void {
    InteractionBridge.globalInstance?.dispose();
    InteractionBridge.globalInstance = null;
  }

  private interactionSystem: InteractionSystem;
  private automationSystem: AutomationSystem;
  private state: BridgeState;
  private eventSubscribers: Map<string, Array<(event: BridgeEvent) => void>>;
  private eventQueue: BridgeEvent[];
  private syncTimer: number | null;
  private visibilityCleanup: (() => void) | null;
  private readonly MAX_COMMAND_HISTORY = 1000;
  private readonly MAX_EVENT_QUEUE = 500;
  private readonly SYNC_DELAY_MS = 16;
  private engineListenerCleanups: Array<() => void> = [];
  private eventListeners: Set<(state: { keyboard: KeyboardState; mouse: MouseState }) => void>;
  private interactables: Map<string, { id: string; active?: boolean; onPointerOver?: () => void; onPointerOut?: () => void; onClick?: () => void }>;
  private hoveredInteractableIds: Set<string>;

  constructor() {
    this.interactionSystem = InteractionSystem.getInstance();
    this.automationSystem = new AutomationSystem();
    this.state = {
      isActive: true,
      lastCommand: null,
      commandHistory: [],
      syncStatus: 'idle'
    };
    this.eventSubscribers = new Map();
    this.eventQueue = [];
    this.syncTimer = null;
    this.visibilityCleanup = null;
    this.eventListeners = new Set();
    this.interactables = new Map();
    this.hoveredInteractableIds = new Set();
    
    this.setupEngineListeners();
    this.setupVisibilityListener();
  }

  private setupEngineListeners(): void {
    const moveListener = (data: unknown) => {
      if (!(data instanceof THREE.Vector3)) return;
      const target = data;
      this.executeCommand({
        type: 'input',
        action: 'moveTo',
        data: { target }
      });
    };
    
    const clickListener = (data: unknown) => {
      if (!(data instanceof THREE.Vector3)) return;
      const target = data;
      this.executeCommand({
        type: 'input',
        action: 'clickAt',
        data: { target }
      });
    };
    
    const keyListener = (data: unknown) => {
      if (typeof data !== 'string') return;
      const key = data;
      this.executeCommand({
        type: 'input',
        action: 'keyPress',
        data: { key }
      });
    };

    this.automationSystem.addEventListener('moveRequested', moveListener);
    this.automationSystem.addEventListener('clickRequested', clickListener);
    this.automationSystem.addEventListener('keyRequested', keyListener);
    
    this.engineListenerCleanups.push(
      () => this.automationSystem.removeEventListener('moveRequested', moveListener),
      () => this.automationSystem.removeEventListener('clickRequested', clickListener),
      () => this.automationSystem.removeEventListener('keyRequested', keyListener)
    );
  }

  @HandleError()
  @Profile()
  executeCommand(command: Omit<BridgeCommand, 'timestamp'>): void {
    // 명령어 검증
    if (!command || typeof command !== 'object') {
      logger.warn(`[${this.constructor.name}] Invalid command passed to executeCommand`);
      return;
    }
    
    if (!command.type || !command.action) {
      logger.warn(`[${this.constructor.name}] Command missing required fields: type or action`);
      return;
    }

    const fullCommand: BridgeCommand = {
      ...command,
      timestamp: Date.now()
    };

    this.state.lastCommand = fullCommand;
    this.state.commandHistory.push(fullCommand);
    
    if (this.state.commandHistory.length > this.MAX_COMMAND_HISTORY) {
      this.state.commandHistory = this.state.commandHistory.slice(-this.MAX_COMMAND_HISTORY);
    }
    
    this.emitEvent({
      type: fullCommand.type,
      event: 'commandExecuted',
      data: fullCommand,
      timestamp: Date.now()
    });

    switch (command.type) {
      case 'input':
        this.handleInputCommand(fullCommand);
        break;
      case 'automation':
        this.handleAutomationCommand(fullCommand);
        break;
    }
  }

  @HandleError()
  private handleInputCommand(command: BridgeCommand): void {
    const { action, data } = command;
    
    switch (action) {
      case 'updateKeyboard':
        this.interactionSystem.updateKeyboard(data as Partial<KeyboardState>);
        this.notifyListeners();
        break;
      case 'updateMouse':
        this.interactionSystem.updateMouse(data as Partial<MouseState>);
        this.notifyListeners();
        break;
      case 'updateGamepad':
        this.interactionSystem.updateGamepad(data as Partial<GamepadState>);
        break;
      case 'updateTouch':
        this.interactionSystem.updateTouch(data as Partial<TouchState>);
        break;
      case 'setConfig':
        this.interactionSystem.setConfig(data as Partial<InteractionConfig>);
        break;
      case 'moveTo':
        this.emitEvent({
          type: 'input',
          event: 'moveToRequested',
          data,
          timestamp: Date.now()
        });
        break;
      case 'clickAt':
        this.emitEvent({
          type: 'input',
          event: 'clickAtRequested',
          data,
          timestamp: Date.now()
        });
        break;
      case 'keyPress':
        this.emitEvent({
          type: 'input',
          event: 'keyPressRequested',
          data,
          timestamp: Date.now()
        });
        break;
    }
  }

  @HandleError()
  private handleAutomationCommand(command: BridgeCommand): void {
    const { action, data } = command;
    
    switch (action) {
      case 'addAction':
        this.automationSystem.addAction(data as Omit<AutomationAction, 'id' | 'timestamp'>);
        break;
      case 'removeAction':
        this.automationSystem.removeAction(data as string);
        break;
      case 'start':
        this.automationSystem.start();
        break;
      case 'pause':
        this.automationSystem.pause();
        break;
      case 'resume':
        this.automationSystem.resume();
        break;
      case 'stop':
        this.automationSystem.stop();
        break;
      case 'clearQueue':
        this.automationSystem.clearQueue();
        break;
      case 'updateSettings':
        this.automationSystem.updateSettings(data as Partial<AutomationSettings>);
        break;
    }
  }

  @LogSnapshot()
  snapshot(): BridgeSnapshot {
    const state = this.interactionSystem.getState();
    const config = this.interactionSystem.getConfig();
    const metrics = this.interactionSystem.getMetrics();
    const automationState = this.automationSystem.getState();
    const automationConfig = this.automationSystem.getConfig();
    const automationMetrics = this.automationSystem.getMetrics();

    return {
      interaction: {
        state,
        config,
        metrics,
      },
      automation: {
        state: automationState,
        config: automationConfig,
        metrics: automationMetrics,
      },
      bridge: this.state,
    };
  }

  subscribe(listener: (state: { keyboard: KeyboardState; mouse: MouseState }) => void): () => void;
  subscribe(event: string, callback: (event: BridgeEvent) => void): () => void;
  subscribe(
    arg1: string | ((state: { keyboard: KeyboardState; mouse: MouseState }) => void),
    arg2?: (event: BridgeEvent) => void,
  ): () => void {
    if (typeof arg1 === 'string') {
      const event = arg1;
      const callback = arg2;
      if (typeof callback !== 'function') return () => {};

      const list = this.eventSubscribers.get(event) ?? [];
      list.push(callback);
      this.eventSubscribers.set(event, list);
      this.scheduleSync();
      return () => this.unsubscribe(event, callback);
    }

    const listener = arg1;
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  unsubscribe(event: string, callback: (event: BridgeEvent) => void): void {
    const list = this.eventSubscribers.get(event);
    if (!list) return;
    const idx = list.indexOf(callback);
    if (idx === -1) return;
    list.splice(idx, 1);
    if (list.length === 0) {
      this.eventSubscribers.delete(event);
    } else {
      this.eventSubscribers.set(event, list);
    }

    if (this.eventSubscribers.size === 0) {
      this.cancelSync();
    }
  }

  @Profile()
  private notifyListeners(): void {
    const keyboard = this.interactionSystem.getKeyboardRef();
    const mouse = this.interactionSystem.getMouseRef();
    this.eventListeners.forEach(listener => listener({ keyboard, mouse }));
  }

  registerInteractable(entity: { id: string; active?: boolean; onPointerOver?: () => void; onPointerOut?: () => void; onClick?: () => void }): void {
    if (!entity?.id) return;
    this.interactables.set(entity.id, entity);
  }

  unregisterInteractable(id: string): void {
    if (!id) return;
    this.interactables.delete(id);
    this.hoveredInteractableIds.delete(id);
  }

  getInteractable(id: string) {
    return this.interactables.get(id);
  }

  updateHoveredObjects(hitObjects: Array<{ object?: { userData?: { id?: string } } }>): void {
    const nextHovered = new Set<string>();
    for (const hit of hitObjects) {
      const id = hit?.object?.userData?.id;
      if (typeof id === 'string') nextHovered.add(id);
    }

    // Pointer out
    for (const prevId of this.hoveredInteractableIds) {
      if (nextHovered.has(prevId)) continue;
      const entity = this.interactables.get(prevId);
      if (!entity || entity.active === false) continue;
      entity.onPointerOut?.();
    }

    // Pointer over
    for (const nextId of nextHovered) {
      if (this.hoveredInteractableIds.has(nextId)) continue;
      const entity = this.interactables.get(nextId);
      if (!entity || entity.active === false) continue;
      entity.onPointerOver?.();
    }

    this.hoveredInteractableIds = nextHovered;
  }

  handleClick(event: { object?: { userData?: { id?: string } } }): void {
    const id = event?.object?.userData?.id;
    if (typeof id !== 'string') return;
    const entity = this.interactables.get(id);
    if (!entity || entity.active === false) return;
    entity.onClick?.();
  }

  @HandleError()
  private emitEvent(event: BridgeEvent): void {
    // If no one is subscribed to bridge events, avoid queueing/scheduling work.
    if (this.eventSubscribers.size === 0) return;
    this.eventQueue.push(event);
    
    if (this.eventQueue.length > this.MAX_EVENT_QUEUE) {
      this.eventQueue = this.eventQueue.slice(-this.MAX_EVENT_QUEUE);
    }
    this.scheduleSync();
  }

  private dispatchEvent(event: BridgeEvent): void {
    const keys = [event.event, event.type, '*'];
    for (const key of keys) {
      const callbacks = this.eventSubscribers.get(key);
      if (!callbacks || callbacks.length === 0) continue;
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('Event callback error:', error);
        }
      });
    }
  }

  @HandleError()
  private setupVisibilityListener(): void {
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
    const onVisibilityChange = () => {
      if (document.hidden) {
        this.cancelSync();
        return;
      }
      if (this.eventQueue.length > 0) {
        this.scheduleSync();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    this.visibilityCleanup = () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }

  private cancelSync(): void {
    if (this.syncTimer === null) return;
    clearTimeout(this.syncTimer);
    this.syncTimer = null;
  }

  private scheduleSync(): void {
    if (this.syncTimer !== null) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    if (this.eventSubscribers.size === 0) return;

    this.syncTimer = window.setTimeout(() => {
      this.syncTimer = null;
      this.state.syncStatus = 'syncing';

      try {
        this.processEventQueue();
        this.updateMetrics();
      } catch (error) {
        this.state.syncStatus = 'error';
        console.error('Sync error:', error);
      }

      this.state.syncStatus = 'idle';

      // If more work is queued, continue on the next tick.
      if (this.eventQueue.length > 0 && this.eventSubscribers.size > 0) {
        this.scheduleSync();
      }
    }, this.SYNC_DELAY_MS);
  }

  @Profile()
  private processEventQueue(): void {
    const batchSize = 10;
    const processed = this.eventQueue.splice(0, batchSize);
    
    for (const event of processed) {
      this.dispatchEvent(event);
    }

    if (processed.length > 0) {
      this.dispatchEvent({
        type: 'sync',
        event: 'batchProcessed',
        data: { count: processed.length },
        timestamp: Date.now(),
      });
    }
  }

  @Profile()
  private updateMetrics(): void {
    const interactionMetrics = this.interactionSystem.getMetrics();
    const automationMetrics = this.automationSystem.getMetrics();
    
    this.dispatchEvent({
      type: 'sync',
      event: 'metricsUpdated',
      data: {
        interaction: interactionMetrics,
        automation: automationMetrics
      },
      timestamp: Date.now()
    });
  }

  getInteractionSystem(): InteractionSystem {
    return this.interactionSystem;
  }

  getAutomationSystem(): AutomationSystem {
    return this.automationSystem;
  }

  @HandleError()
  reset(): void {
    this.interactionSystem.reset();
    this.automationSystem.reset();
    this.state.commandHistory = [];
    this.state.lastCommand = null;
    this.eventQueue = [];
    this.notifyListeners();
  }

  @HandleError()
  dispose(): void {
    this.cancelSync();
    this.visibilityCleanup?.();
    this.visibilityCleanup = null;
    
    this.engineListenerCleanups.forEach(cleanup => cleanup());
    this.engineListenerCleanups = [];
    
    this.interactionSystem.dispose();
    this.automationSystem.dispose();
    this.eventSubscribers.clear();
    this.eventQueue = [];
    this.state.commandHistory = [];
    this.eventListeners.clear();
    this.interactables.clear();
    this.hoveredInteractableIds.clear();
  }

  cleanup(): void {
    this.dispose();
  }

  getKeyboardState(): KeyboardState {
    return this.interactionSystem.getKeyboardRef();
  }

  getMouseState(): MouseState {
    return this.interactionSystem.getMouseRef();
  }
}
