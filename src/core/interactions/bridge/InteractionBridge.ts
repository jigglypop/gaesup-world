import * as THREE from 'three';
import { InteractionSystem, KeyboardState, MouseState } from '../core/InteractionSystem';
import { AutomationSystem } from '../core/AutomationSystem';
import { InteractionSnapshot } from './types';
import { Profile, HandleError, LogSnapshot, ValidateCommand, TrackCalls } from '@/core/boilerplate/decorators';
import { logger } from '@/core/utils/logger';

export interface BridgeCommand {
  type: 'input' | 'automation';
  action: string;
  data?: unknown;
  timestamp?: number;
}

export interface BridgeState {
  isActive: boolean;
  lastCommand: BridgeCommand | null;
  commandHistory: BridgeCommand[];
  syncStatus: 'idle' | 'syncing' | 'error';
}

export interface BridgeEvent {
  type: 'input' | 'automation' | 'sync';
  event: string;
  data?: unknown;
  timestamp: number;
}

export class InteractionBridge {
  private interactionSystem: InteractionSystem;
  private automationSystem: AutomationSystem;
  private state: BridgeState;
  private eventSubscribers: Map<string, Function[]>;
  private eventQueue: BridgeEvent[];
  private syncInterval: number | null;
  private readonly MAX_COMMAND_HISTORY = 1000;
  private readonly MAX_EVENT_QUEUE = 500;
  private engineListenerCleanups: Array<() => void> = [];
  private eventListeners: Set<(state: { keyboard: KeyboardState; mouse: MouseState }) => void>;

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
    this.syncInterval = null;
    this.eventListeners = new Set();
    
    this.setupEngineListeners();
    this.startSync();
  }

  private setupEngineListeners(): void {
    const moveListener = (target: THREE.Vector3) => {
      this.executeCommand({
        type: 'input',
        action: 'moveTo',
        data: { target }
      });
    };
    
    const clickListener = (target: THREE.Vector3) => {
      this.executeCommand({
        type: 'input',
        action: 'clickAt',
        data: { target }
      });
    };
    
    const keyListener = (key: string) => {
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
      type: 'sync',
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
        this.interactionSystem.updateGamepad(data as any);
        break;
      case 'updateTouch':
        this.interactionSystem.updateTouch(data as any);
        break;
      case 'setConfig':
        this.interactionSystem.setConfig(data as any);
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
        this.automationSystem.addAction(data as any);
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
        this.automationSystem.updateSettings(data as any);
        break;
    }
  }

  @LogSnapshot()
  snapshot(): InteractionSnapshot {
    const state = this.interactionSystem.getState();
    const config = this.interactionSystem.getConfig();
    const metrics = this.interactionSystem.getMetrics();

    return {
      keyboard: state.keyboard,
      mouse: state.mouse,
      gamepad: state.gamepad,
      touch: state.touch,
      isActive: state.isActive,
      config,
      metrics
    };
  }

  subscribe(listener: (state: { keyboard: KeyboardState; mouse: MouseState }) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  @Profile()
  private notifyListeners(): void {
    const keyboard = this.interactionSystem.getKeyboardRef();
    const mouse = this.interactionSystem.getMouseRef();
    this.eventListeners.forEach(listener => listener({ keyboard, mouse }));
  }

  @HandleError()
  private emitEvent(event: BridgeEvent): void {
    this.eventQueue.push(event);
    
    if (this.eventQueue.length > this.MAX_EVENT_QUEUE) {
      this.eventQueue = this.eventQueue.slice(-this.MAX_EVENT_QUEUE);
    }
    
    const callbacks = this.eventSubscribers.get(event.event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Event callback error:', error);
        }
      });
    }
    
    const allCallbacks = this.eventSubscribers.get('*');
    if (allCallbacks) {
      allCallbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Event callback error:', error);
        }
      });
    }
  }

  @HandleError()
  private startSync(): void {
    this.syncInterval = window.setInterval(() => {
      this.state.syncStatus = 'syncing';
      
      try {
        this.processEventQueue();
        this.updateMetrics();
      } catch (error) {
        this.state.syncStatus = 'error';
        console.error('Sync error:', error);
      }
      
      this.state.syncStatus = 'idle';
    }, 16);
  }

  @Profile()
  private processEventQueue(): void {
    const batchSize = 10;
    const processed = this.eventQueue.splice(0, batchSize);
    
    if (processed.length > 0) {
      this.emitEvent({
        type: 'sync',
        event: 'batchProcessed',
        data: { count: processed.length },
        timestamp: Date.now()
      });
    }
  }

  @Profile()
  private updateMetrics(): void {
    const interactionMetrics = this.interactionSystem.getMetrics();
    const automationMetrics = this.automationSystem.getMetrics();
    
    this.emitEvent({
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
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.engineListenerCleanups.forEach(cleanup => cleanup());
    this.engineListenerCleanups = [];
    
    this.interactionSystem.dispose();
    this.automationSystem.dispose();
    this.eventSubscribers.clear();
    this.eventQueue = [];
    this.state.commandHistory = [];
    this.eventListeners.clear();
  }

  getKeyboardState(): KeyboardState {
    return this.interactionSystem.getKeyboardRef();
  }

  getMouseState(): MouseState {
    return this.interactionSystem.getMouseRef();
  }
}
