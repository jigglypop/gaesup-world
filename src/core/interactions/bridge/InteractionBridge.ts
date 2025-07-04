import * as THREE from 'three';
import { InteractionEngine, KeyboardState, MouseState } from '../core/InteractionEngine';
import { AutomationEngine } from '../core/AutomationEngine';
import { InteractionSnapshot, InteractionCommand } from './types';

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
  private interactionEngine: InteractionEngine;
  private automationEngine: AutomationEngine;
  private state: BridgeState;
  private eventSubscribers: Map<string, Function[]>;
  private eventQueue: BridgeEvent[];
  private syncInterval: number | null;
  private readonly MAX_COMMAND_HISTORY = 1000;
  private readonly MAX_EVENT_QUEUE = 500;
  private engineListenerCleanups: Array<() => void> = [];
  private eventListeners: Set<(state: { keyboard: KeyboardState; mouse: MouseState }) => void>;

  constructor() {
    this.interactionEngine = InteractionEngine.getInstance();
    this.automationEngine = new AutomationEngine();
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

    this.automationEngine.addEventListener('moveRequested', moveListener);
    this.automationEngine.addEventListener('clickRequested', clickListener);
    this.automationEngine.addEventListener('keyRequested', keyListener);
    
    this.engineListenerCleanups.push(
      () => this.automationEngine.removeEventListener('moveRequested', moveListener),
      () => this.automationEngine.removeEventListener('clickRequested', clickListener),
      () => this.automationEngine.removeEventListener('keyRequested', keyListener)
    );
  }

  executeCommand(command: Omit<BridgeCommand, 'timestamp'>): void {
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
        this.handleInputCommand(command);
        break;
      case 'automation':
        this.handleAutomationCommand(command);
        break;
    }
  }

  private handleInputCommand(command: BridgeCommand): void {
    const { action, data } = command;
    
    switch (action) {
      case 'updateKeyboard':
        this.interactionEngine.updateKeyboard(data as Partial<KeyboardState>);
        this.notifyListeners();
        break;
      case 'updateMouse':
        this.interactionEngine.updateMouse(data as Partial<MouseState>);
        this.notifyListeners();
        break;
      case 'updateGamepad':
        this.interactionEngine.updateGamepad(data as any);
        break;
      case 'updateTouch':
        this.interactionEngine.updateTouch(data as any);
        break;
      case 'setConfig':
        this.interactionEngine.setConfig(data as any);
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

  private handleAutomationCommand(command: BridgeCommand): void {
    const { action, data } = command;
    
    switch (action) {
      case 'addAction':
        this.automationEngine.addAction(data as any);
        break;
      case 'removeAction':
        this.automationEngine.removeAction(data as string);
        break;
      case 'start':
        this.automationEngine.start();
        break;
      case 'pause':
        this.automationEngine.pause();
        break;
      case 'resume':
        this.automationEngine.resume();
        break;
      case 'stop':
        this.automationEngine.stop();
        break;
      case 'clearQueue':
        this.automationEngine.clearQueue();
        break;
      case 'updateSettings':
        this.automationEngine.updateSettings(data as any);
        break;
    }
  }

  snapshot(): InteractionSnapshot {
    const state = this.interactionEngine.getState();
    const config = this.interactionEngine.getConfig();
    const metrics = this.interactionEngine.getMetrics();

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

  private notifyListeners(): void {
    const keyboard = this.interactionEngine.getKeyboardRef();
    const mouse = this.interactionEngine.getMouseRef();
    this.eventListeners.forEach(listener => listener({ keyboard, mouse }));
  }

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

  private updateMetrics(): void {
    const interactionMetrics = this.interactionEngine.getMetrics();
    const automationMetrics = this.automationEngine.getMetrics();
    
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

  getInteractionEngine(): InteractionEngine {
    return this.interactionEngine;
  }

  getAutomationEngine(): AutomationEngine {
    return this.automationEngine;
  }

  reset(): void {
    this.interactionEngine.reset();
    this.automationEngine.reset();
    this.state.commandHistory = [];
    this.state.lastCommand = null;
    this.eventQueue = [];
    this.notifyListeners();
  }

  dispose(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.engineListenerCleanups.forEach(cleanup => cleanup());
    this.engineListenerCleanups = [];
    
    this.interactionEngine.dispose();
    this.automationEngine.dispose();
    this.eventSubscribers.clear();
    this.eventQueue = [];
    this.state.commandHistory = [];
    this.eventListeners.clear();
  }

  getKeyboardState(): KeyboardState {
    return this.interactionEngine.getKeyboardRef();
  }

  getMouseState(): MouseState {
    return this.interactionEngine.getMouseRef();
  }
}
