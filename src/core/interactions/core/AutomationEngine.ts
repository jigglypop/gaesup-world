import * as THREE from 'three';

export interface AutomationAction {
  id: string;
  type: 'move' | 'click' | 'wait' | 'key' | 'custom';
  target?: THREE.Vector3;
  key?: string;
  duration?: number;
  delay?: number;
  beforeCallback?: () => void;
  afterCallback?: () => void;
  data?: Record<string, unknown>;
  timestamp?: number;
}

export interface AutomationQueue {
  actions: AutomationAction[];
  currentIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  loop: boolean;
  maxRetries: number;
}

export interface AutomationState {
  isActive: boolean;
  queue: AutomationQueue;
  currentAction: AutomationAction | null;
  executionStats: {
    totalExecuted: number;
    successRate: number;
    averageTime: number;
    errors: string[];
  };
  settings: {
    throttle: number;
    autoStart: boolean;
    trackProgress: boolean;
    showVisualCues: boolean;
  };
}

export interface AutomationConfig {
  maxConcurrentActions: number;
  defaultDelay: number;
  retryDelay: number;
  timeoutDuration: number;
  enableLogging: boolean;
  visualCues: {
    showPath: boolean;
    showTargets: boolean;
    lineColor: string;
    targetColor: string;
  };
}

export interface AutomationMetrics {
  queueLength: number;
  executionTime: number;
  performance: number;
  memoryUsage: number;
  errorRate: number;
}

export class AutomationEngine {
  private state: AutomationState;
  private config: AutomationConfig;
  private metrics: AutomationMetrics;
  private executionTimer: number | null;
  private eventCallbacks: Map<string, Function[]>;

  constructor() {
    this.state = this.createDefaultState();
    this.config = this.createDefaultConfig();
    this.metrics = this.createDefaultMetrics();
    this.executionTimer = null;
    this.eventCallbacks = new Map();
  }

  private createDefaultState(): AutomationState {
    return {
      isActive: false,
      queue: {
        actions: [],
        currentIndex: 0,
        isRunning: false,
        isPaused: false,
        loop: false,
        maxRetries: 3
      },
      currentAction: null,
      executionStats: {
        totalExecuted: 0,
        successRate: 100,
        averageTime: 0,
        errors: []
      },
      settings: {
        throttle: 100,
        autoStart: false,
        trackProgress: true,
        showVisualCues: true
      }
    };
  }

  private createDefaultConfig(): AutomationConfig {
    return {
      maxConcurrentActions: 1,
      defaultDelay: 100,
      retryDelay: 1000,
      timeoutDuration: 5000,
      enableLogging: true,
      visualCues: {
        showPath: true,
        showTargets: true,
        lineColor: '#00ff00',
        targetColor: '#ff0000'
      }
    };
  }

  private createDefaultMetrics(): AutomationMetrics {
    return {
      queueLength: 0,
      executionTime: 0,
      performance: 100,
      memoryUsage: 0,
      errorRate: 0
    };
  }

  addAction(action: Omit<AutomationAction, 'id' | 'timestamp'>): string {
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullAction: AutomationAction = {
      ...action,
      id,
      timestamp: Date.now()
    };
    
    this.state.queue.actions.push(fullAction);
    this.updateMetrics();
    this.emit('actionAdded', fullAction);
    
    if (this.state.settings.autoStart && !this.state.queue.isRunning) {
      this.start();
    }
    
    return id;
  }

  removeAction(id: string): boolean {
    const index = this.state.queue.actions.findIndex(action => action.id === id);
    if (index > -1) {
      this.state.queue.actions.splice(index, 1);
      this.updateMetrics();
      this.emit('actionRemoved', id);
      return true;
    }
    return false;
  }

  clearQueue(): void {
    this.state.queue.actions = [];
    this.state.queue.currentIndex = 0;
    this.updateMetrics();
    this.emit('queueCleared');
  }

  start(): void {
    if (this.state.queue.actions.length === 0) return;
    
    this.state.queue.isRunning = true;
    this.state.queue.isPaused = false;
    this.emit('automationStarted');
    this.executeNext();
  }

  pause(): void {
    this.state.queue.isPaused = true;
    if (this.executionTimer) {
      clearTimeout(this.executionTimer);
      this.executionTimer = null;
    }
    this.emit('automationPaused');
  }

  resume(): void {
    if (this.state.queue.isPaused) {
      this.state.queue.isPaused = false;
      this.emit('automationResumed');
      this.executeNext();
    }
  }

  stop(): void {
    this.state.queue.isRunning = false;
    this.state.queue.isPaused = false;
    this.state.currentAction = null;
    if (this.executionTimer) {
      clearTimeout(this.executionTimer);
      this.executionTimer = null;
    }
    this.emit('automationStopped');
  }

  private async executeNext(): Promise<void> {
    if (!this.state.queue.isRunning || this.state.queue.isPaused) return;
    
    if (this.state.queue.currentIndex >= this.state.queue.actions.length) {
      if (this.state.queue.loop) {
        this.state.queue.currentIndex = 0;
      } else {
        this.stop();
        this.emit('automationCompleted');
        return;
      }
    }
    
    const action = this.state.queue.actions[this.state.queue.currentIndex];
    if (!action) return;
    
    this.state.currentAction = action;
    this.emit('actionStarted', action);
    
    try {
      await this.executeAction(action);
      this.state.executionStats.totalExecuted++;
      this.state.queue.currentIndex++;
      this.emit('actionCompleted', action);
      
      const delay = action.delay || this.state.settings.throttle;
      this.executionTimer = window.setTimeout(() => this.executeNext(), delay);
      
    } catch (error) {
      this.handleExecutionError(action, error as Error);
    }
  }

  private async executeAction(action: AutomationAction): Promise<void> {
    if (action.beforeCallback) {
      action.beforeCallback();
    }
    
    const startTime = Date.now();
    
    switch (action.type) {
      case 'move':
        if (action.target) {
          this.emit('moveRequested', action.target);
        }
        break;
      case 'click':
        if (action.target) {
          this.emit('clickRequested', action.target);
        }
        break;
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, action.duration || 1000));
        break;
      case 'key':
        if (action.key) {
          this.emit('keyRequested', action.key);
        }
        break;
      case 'custom':
        this.emit('customActionRequested', action.data);
        break;
    }
    
    const executionTime = Date.now() - startTime;
    this.updateExecutionStats(executionTime);
    
    if (action.afterCallback) {
      action.afterCallback();
    }
  }

  private handleExecutionError(action: AutomationAction, error: Error): void {
    this.state.executionStats.errors.push(`${action.id}: ${error.message}`);
    this.emit('actionError', { action, error });
    
    const retryCount = (action.data?.retryCount as number) || 0;
    if (retryCount < this.state.queue.maxRetries) {
      action.data = { ...action.data, retryCount: retryCount + 1 };
      this.executionTimer = window.setTimeout(() => this.executeNext(), this.config.retryDelay);
    } else {
      this.state.queue.currentIndex++;
      this.executionTimer = window.setTimeout(() => this.executeNext(), this.state.settings.throttle);
    }
  }

  private updateExecutionStats(executionTime: number): void {
    const stats = this.state.executionStats;
    stats.averageTime = (stats.averageTime * stats.totalExecuted + executionTime) / (stats.totalExecuted + 1);
  }

  private updateMetrics(): void {
    this.metrics.queueLength = this.state.queue.actions.length;
    this.metrics.errorRate = this.state.executionStats.errors.length / Math.max(this.state.executionStats.totalExecuted, 1) * 100;
  }

  private emit(event: string, data?: unknown): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  addEventListener(event: string, callback: Function): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  getState(): AutomationState {
    return { ...this.state };
  }

  getConfig(): AutomationConfig {
    return { ...this.config };
  }

  getMetrics(): AutomationMetrics {
    return { ...this.metrics };
  }

  setConfig(updates: Partial<AutomationConfig>): void {
    Object.assign(this.config, updates);
  }

  updateSettings(updates: Partial<AutomationState['settings']>): void {
    Object.assign(this.state.settings, updates);
  }

  reset(): void {
    this.stop();
    this.clearQueue();
    this.state = this.createDefaultState();
    this.metrics = this.createDefaultMetrics();
  }

  dispose(): void {
    this.stop();
    this.eventCallbacks.clear();
  }
}
