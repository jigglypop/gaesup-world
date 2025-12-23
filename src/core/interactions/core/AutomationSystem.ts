import { RegisterSystem, ManageRuntime, Profile, HandleError } from '@/core/boilerplate/decorators';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import type { BaseState, BaseMetrics, SystemUpdateArgs } from '@/core/boilerplate/types';

import { AutomationState, AutomationConfig, AutomationMetrics, AutomationAction } from '../bridge/types';

interface AutomationSystemState extends BaseState, AutomationState {}
interface AutomationSystemMetrics extends BaseMetrics, AutomationMetrics {}

@RegisterSystem('automation')
@ManageRuntime({ autoStart: false })
export class AutomationSystem extends AbstractSystem<AutomationSystemState, AutomationSystemMetrics> {
  private config: AutomationConfig;
  private executionTimer: number | null;
  private eventCallbacks: Map<string, Function[]>;

  constructor() {
    super(
      {
        isActive: false,
        queue: { actions: [], currentIndex: 0, isRunning: false, isPaused: false, loop: false, maxRetries: 3 },
        currentAction: null,
        executionStats: { totalExecuted: 0, successRate: 100, averageTime: 0, errors: [] },
        settings: { throttle: 100, autoStart: false, trackProgress: true, showVisualCues: true },
        lastUpdate: Date.now()
      },
      {
        queueLength: 0,
        executionTime: 0,
        performance: 100,
        memoryUsage: 0,
        errorRate: 0,
        frameTime: 0
      }
    );
    this.config = this.createDefaultConfig();
    this.executionTimer = null;
    this.eventCallbacks = new Map();
  }

  protected performUpdate(args: SystemUpdateArgs): void {
    void args;
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

  @HandleError()
  @Profile()
  addAction(action: Omit<AutomationAction, 'id' | 'timestamp'>): string {
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullAction: AutomationAction = {
      ...action,
      id,
      timestamp: Date.now()
    };
    
    this.state.queue.actions.push(fullAction);
    this.updateMetrics(0);
    this.emit('actionAdded', fullAction);
    
    if (this.state.settings.autoStart && !this.state.queue.isRunning) {
      this.start();
    }
    
    return id;
  }

  @HandleError()
  removeAction(id: string): boolean {
    const index = this.state.queue.actions.findIndex(action => action.id === id);
    if (index > -1) {
      this.state.queue.actions.splice(index, 1);
      this.updateMetrics(0);
      this.emit('actionRemoved', id);
      return true;
    }
    return false;
  }

  @HandleError()
  clearQueue(): void {
    this.state.queue.actions = [];
    this.state.queue.currentIndex = 0;
    this.updateMetrics(0);
    this.emit('queueCleared');
  }

  @HandleError()
  @Profile()
  override async start(): Promise<void> {
    if (this.state.queue.actions.length === 0) return;
    
    this.state.queue.isRunning = true;
    this.state.queue.isPaused = false;
    this.emit('automationStarted');
    await this.executeNext();
  }

  override pause(): void {
    this.state.queue.isPaused = true;
    if (this.executionTimer) {
      clearTimeout(this.executionTimer);
      this.executionTimer = null;
    }
    this.emit('automationPaused');
  }

  override resume(): void {
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

  @HandleError()
  @Profile()
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

  @HandleError()
  @Profile()
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
    
    const retryCount = (action.data?.['retryCount'] as number | undefined) ?? 0;
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

  protected override updateMetrics(deltaTime: number): void {
    super.updateMetrics(deltaTime);
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

  updateSettings(updates: Partial<AutomationState['settings']>): void {
    Object.assign(this.state.settings, updates);
  }

  protected override onReset(): void {
    this.stop();
    this.clearQueue();
    super.onReset();
  }

  protected override onDispose(): void {
    this.stop();
    this.eventCallbacks.clear();
    super.onDispose();
  }
}
