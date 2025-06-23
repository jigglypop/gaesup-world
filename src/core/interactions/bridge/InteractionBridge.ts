import * as THREE from 'three';
import { InteractionEngine } from '../core/InteractionEngine';
import { AutomationEngine } from '../core/AutomationEngine';

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

  constructor() {
    this.interactionEngine = new InteractionEngine();
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
    
    this.setupEngineListeners();
    this.startSync();
  }

  private setupEngineListeners(): void {
    this.automationEngine.addEventListener('moveRequested', (target: THREE.Vector3) => {
      this.executeCommand({
        type: 'input',
        action: 'moveTo',
        data: { target }
      });
    });

    this.automationEngine.addEventListener('clickRequested', (target: THREE.Vector3) => {
      this.executeCommand({
        type: 'input',
        action: 'clickAt',
        data: { target }
      });
    });

    this.automationEngine.addEventListener('keyRequested', (key: string) => {
      this.executeCommand({
        type: 'input',
        action: 'keyPress',
        data: { key }
      });
    });
  }

  executeCommand(command: Omit<BridgeCommand, 'timestamp'>): void {
    const fullCommand: BridgeCommand = {
      ...command,
      timestamp: Date.now()
    };

    this.state.lastCommand = fullCommand;
    this.state.commandHistory.push(fullCommand);
    
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
        this.interactionEngine.updateKeyboard(data as any);
        break;
      case 'updateMouse':
        this.interactionEngine.updateMouse(data as any);
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

  snapshot(): {
    interaction: any;
    automation: any;
    bridge: BridgeState;
  } {
    return {
      interaction: {
        state: this.interactionEngine.getState(),
        config: this.interactionEngine.getConfig(),
        metrics: this.interactionEngine.getMetrics()
      },
      automation: {
        state: this.automationEngine.getState(),
        config: this.automationEngine.getConfig(),
        metrics: this.automationEngine.getMetrics()
      },
      bridge: { ...this.state }
    };
  }

  subscribe(event: string, callback: Function): void {
    if (!this.eventSubscribers.has(event)) {
      this.eventSubscribers.set(event, []);
    }
    this.eventSubscribers.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function): void {
    const callbacks = this.eventSubscribers.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emitEvent(event: BridgeEvent): void {
    this.eventQueue.push(event);
    
    const callbacks = this.eventSubscribers.get(event.event);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }
    
    const allCallbacks = this.eventSubscribers.get('*');
    if (allCallbacks) {
      allCallbacks.forEach(callback => callback(event));
    }
  }

  private startSync(): void {
    this.syncInterval = window.setInterval(() => {
      this.state.syncStatus = 'syncing';
      
      this.processEventQueue();
      this.updateMetrics();
      
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
  }

  dispose(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.interactionEngine.dispose();
    this.automationEngine.dispose();
    this.eventSubscribers.clear();
    this.eventQueue = [];
  }
}
