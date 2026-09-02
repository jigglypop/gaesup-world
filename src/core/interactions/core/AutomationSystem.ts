import type { Vector3 } from 'three';

import { HandleError, ManageRuntime, Profile, RegisterSystem } from '@/core/boilerplate/decorators';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import type { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import type { BaseMetrics, BaseState, SystemUpdateArgs } from '@/core/boilerplate/types';
import { logger } from '@/core/utils/logger';

import type {
  AutomationAction,
  AutomationConfig,
  AutomationMetrics,
  AutomationState,
} from './types';

type AutomationSystemState = BaseState & AutomationState;
type AutomationSystemMetrics = BaseMetrics & AutomationMetrics;
type AutomationEventPayload =
  | AutomationAction
  | AutomationAction['data']
  | Vector3
  | string
  | { action: AutomationAction; error: Error }
  | undefined;
type AutomationEventListener = (data: AutomationEventPayload) => void;

const createAutomationState = (): AutomationSystemState => ({
  isActive: false,
  queue: {
    actions: [],
    currentIndex: 0,
    isRunning: false,
    isPaused: false,
    loop: false,
    maxRetries: 3,
  },
  currentAction: null,
  executionStats: {
    totalExecuted: 0,
    successRate: 100,
    averageTime: 0,
    errors: [],
  },
  settings: {
    throttle: 100,
    autoStart: false,
    trackProgress: true,
    showVisualCues: true,
  },
  lastUpdate: Date.now(),
});

const createAutomationMetrics = (): AutomationSystemMetrics => ({
  queueLength: 0,
  executionTime: 0,
  performance: 100,
  memoryUsage: 0,
  errorRate: 0,
  frameTime: 0,
});

const createDefaultConfig = (): AutomationConfig => ({
  maxConcurrentActions: 1,
  defaultDelay: 100,
  retryDelay: 1000,
  timeoutDuration: 5000,
  enableLogging: true,
  visualCues: {
    showPath: true,
    showTargets: true,
    lineColor: '#00ff00',
    targetColor: '#ff0000',
  },
});

@RegisterSystem('automation')
@ManageRuntime({ autoStart: false })
export class AutomationSystem extends AbstractSystem<AutomationSystemState, AutomationSystemMetrics> {
  private config: AutomationConfig;
  private executionGeneration = 0;
  private executionRunId = 0;
  private executionTimer: ReturnType<typeof setTimeout> | null = null;
  private executionDelaySettler: (() => void) | null = null;
  private eventCallbacks = new Map<string, AutomationEventListener[]>();
  private isDisposing = false;
  private isResetting = false;
  private stoppedDispatchRunIds = new Set<number>();

  constructor() {
    super(createAutomationState, createAutomationMetrics);
    this.config = createDefaultConfig();
  }

  protected performUpdate(args: SystemUpdateArgs): void {
    void args;
  }

  protected createUpdateArgs(context: SystemContext): SystemUpdateArgs {
    return this.createDefaultUpdateArgs(context);
  }

  getConfig(): AutomationConfig {
    return {
      ...this.config,
      visualCues: { ...this.config.visualCues },
    };
  }

  @HandleError()
  @Profile()
  addAction(action: Omit<AutomationAction, 'id' | 'timestamp'>): string {
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullAction: AutomationAction = {
      ...action,
      id,
      timestamp: Date.now(),
    };

    this.state.queue.actions.push(fullAction);
    this.updateMetrics(0);
    this.emit('actionAdded', fullAction);

    if (this.state.settings.autoStart && !this.state.queue.isRunning) {
      this.runDetached(() => this.start());
    }

    return id;
  }

  @HandleError()
  removeAction(id: string): boolean {
    const index = this.state.queue.actions.findIndex((action) => action.id === id);
    if (index === -1) return false;

    this.state.queue.actions.splice(index, 1);
    this.updateMetrics(0);
    this.emit('actionRemoved', id);
    return true;
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
    if (
      this.isDisposed ||
      this.isDisposing ||
      this.isResetting ||
      this.state.queue.actions.length === 0 ||
      this.state.queue.isRunning
    ) {
      return;
    }

    this.state.queue.isRunning = true;
    this.state.queue.isPaused = false;
    const generation = this.beginExecution();
    this.emit('automationStarted');
    if (!this.isExecutionActive(generation)) return;

    try {
      await this.executeNext(generation);
    } catch (error) {
      this.logUnexpectedError(error);
    }
  }

  override pause(): void {
    if (
      this.isDisposed ||
      this.isDisposing ||
      !this.state.queue.isRunning ||
      this.state.queue.isPaused
    ) {
      return;
    }

    this.state.queue.isPaused = true;
    this.invalidateExecution();
    this.emit('automationPaused');
  }

  override resume(): void {
    if (
      this.isDisposed ||
      this.isDisposing ||
      !this.state.queue.isRunning ||
      !this.state.queue.isPaused
    ) {
      return;
    }

    this.state.queue.isPaused = false;
    const generation = this.beginExecution();
    this.emit('automationResumed');
    if (!this.isExecutionActive(generation)) return;
    this.runDetached(() => this.executeNext(generation));
  }

  stop(): void {
    if (this.isDisposed || this.isDisposing) return;
    this.stopExecution(false);
  }

  override reset(): void {
    if (this.isDisposed || this.isDisposing || this.isResetting) return;

    this.isResetting = true;
    try {
      super.reset();
    } finally {
      this.isResetting = false;
    }
  }

  @Profile()
  private async executeNext(generation: number): Promise<void> {
    if (!this.isExecutionActive(generation)) return;

    if (this.state.queue.currentIndex >= this.state.queue.actions.length) {
      if (this.state.queue.loop) {
        this.state.queue.currentIndex = 0;
      } else {
        this.completeExecution(generation);
        return;
      }
    }

    if (!this.isExecutionActive(generation)) return;
    const action = this.state.queue.actions[this.state.queue.currentIndex];
    if (!action) return;

    this.state.currentAction = action;
    this.emit('actionStarted', action);
    if (!this.isExecutionActive(generation)) return;

    try {
      const completed = await this.executeAction(action, generation);
      if (!completed || !this.isExecutionActive(generation)) return;

      this.state.executionStats.totalExecuted++;
      this.state.queue.currentIndex++;
      this.emit('actionCompleted', action);
      if (!this.isExecutionActive(generation)) return;

      const delay = action.delay || this.state.settings.throttle;
      this.scheduleExecution(generation, delay);
    } catch (error) {
      if (!this.isExecutionActive(generation)) return;
      this.handleExecutionError(
        action,
        error instanceof Error ? error : new Error(String(error)),
        generation,
      );
    }
  }

  @Profile()
  private async executeAction(
    action: AutomationAction,
    generation: number,
  ): Promise<boolean> {
    if (action.beforeCallback) {
      action.beforeCallback();
      if (!this.isExecutionActive(generation)) return false;
    }

    const startTime = Date.now();

    switch (action.type) {
      case 'move':
        if (action.target) {
          this.emit('moveRequested', action.target);
          if (!this.isExecutionActive(generation)) return false;
        }
        break;
      case 'click':
        if (action.target) {
          this.emit('clickRequested', action.target);
          if (!this.isExecutionActive(generation)) return false;
        }
        break;
      case 'wait': {
        const elapsed = await this.waitForDelay(action.duration || 1000);
        if (!elapsed || !this.isExecutionActive(generation)) return false;
        break;
      }
      case 'key':
        if (action.key) {
          this.emit('keyRequested', action.key);
          if (!this.isExecutionActive(generation)) return false;
        }
        break;
      case 'custom':
        this.emit('customActionRequested', action.data);
        if (!this.isExecutionActive(generation)) return false;
        break;
    }

    const executionTime = Date.now() - startTime;
    if (action.afterCallback) {
      action.afterCallback();
      if (!this.isExecutionActive(generation)) return false;
    }

    this.updateExecutionStats(executionTime);
    return true;
  }

  private handleExecutionError(
    action: AutomationAction,
    error: Error,
    generation: number,
  ): void {
    if (!this.isExecutionActive(generation)) return;

    this.state.executionStats.errors.push(`${action.id}: ${error.message}`);
    this.emit('actionError', { action, error });
    if (!this.isExecutionActive(generation)) return;

    const storedRetryCount = action.data?.['retryCount'];
    const retryCount = typeof storedRetryCount === 'number' ? storedRetryCount : 0;
    if (retryCount < this.state.queue.maxRetries) {
      action.data = { ...action.data, retryCount: retryCount + 1 };
      this.scheduleExecution(generation, this.config.retryDelay);
      return;
    }

    this.state.queue.currentIndex++;
    this.scheduleExecution(generation, this.state.settings.throttle);
  }

  private scheduleExecution(generation: number, delay: number): void {
    this.runDetached(async () => {
      const elapsed = await this.waitForDelay(delay);
      if (!elapsed || !this.isExecutionActive(generation)) return;
      await this.executeNext(generation);
    });
  }

  private waitForDelay(delay: number): Promise<boolean> {
    this.cancelExecutionDelay();

    return new Promise((resolve) => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      let cancellationSettler: (() => void) | null = null;
      const settle = (elapsed: boolean) => {
        if (settled) return;
        settled = true;
        if (timer !== null && this.executionTimer === timer) {
          this.executionTimer = null;
        }
        if (
          cancellationSettler !== null &&
          this.executionDelaySettler === cancellationSettler
        ) {
          this.executionDelaySettler = null;
        }
        resolve(elapsed);
      };

      timer = setTimeout(() => settle(true), delay);
      cancellationSettler = () => {
        if (timer !== null) clearTimeout(timer);
        settle(false);
      };
      this.executionTimer = timer;
      this.executionDelaySettler = cancellationSettler;
    });
  }

  private beginExecution(): number {
    this.executionGeneration++;
    this.executionRunId++;
    this.cancelExecutionDelay();
    return this.executionGeneration;
  }

  private invalidateExecution(): number {
    this.executionGeneration++;
    this.cancelExecutionDelay();
    return this.executionGeneration;
  }

  private cancelExecutionDelay(): void {
    const settler = this.executionDelaySettler;
    if (settler) {
      settler();
      return;
    }

    const timer = this.executionTimer;
    if (timer !== null) {
      clearTimeout(timer);
      if (this.executionTimer === timer) {
        this.executionTimer = null;
      }
    }
  }

  private stopExecution(forceEvent: boolean): number {
    const shouldStop =
      forceEvent ||
      this.state.queue.isRunning ||
      this.state.queue.isPaused ||
      this.state.currentAction !== null ||
      this.executionTimer !== null ||
      this.executionDelaySettler !== null;
    if (!shouldStop) return this.executionGeneration;

    const generation = this.invalidateExecution();
    this.state.queue.isRunning = false;
    this.state.queue.isPaused = false;
    this.state.currentAction = null;
    this.emitAutomationStopped();
    return generation;
  }

  private emitAutomationStopped(): void {
    const runId = this.executionRunId;
    if (this.stoppedDispatchRunIds.has(runId)) return;

    this.stoppedDispatchRunIds.add(runId);
    try {
      this.emit('automationStopped');
    } finally {
      this.stoppedDispatchRunIds.delete(runId);
    }
  }

  private completeExecution(generation: number): void {
    if (!this.isExecutionActive(generation)) return;
    const stoppedGeneration = this.stopExecution(true);
    if (!this.isStoppedGeneration(stoppedGeneration)) return;
    this.emit('automationCompleted');
  }

  private isExecutionActive(generation: number): boolean {
    return (
      generation === this.executionGeneration &&
      this.state.queue.isRunning &&
      !this.state.queue.isPaused &&
      !this.isDisposed &&
      !this.isDisposing
    );
  }

  private isStoppedGeneration(generation: number): boolean {
    return (
      generation === this.executionGeneration &&
      !this.state.queue.isRunning &&
      !this.state.queue.isPaused &&
      !this.isDisposed &&
      !this.isDisposing
    );
  }

  private runDetached(task: () => Promise<void>): void {
    try {
      const promise = task();
      void promise.catch((error) => this.logUnexpectedError(error));
    } catch (error) {
      this.logUnexpectedError(error);
    }
  }

  private logUnexpectedError(error: unknown): void {
    logger.error(
      `[${this.constructor.name}] Unexpected automation execution error:`,
      error instanceof Error ? error : String(error),
    );
  }

  private updateExecutionStats(executionTime: number): void {
    const stats = this.state.executionStats;
    stats.averageTime =
      (stats.averageTime * stats.totalExecuted + executionTime) /
      (stats.totalExecuted + 1);
  }

  protected override updateMetrics(deltaTime: number): void {
    super.updateMetrics(deltaTime);
    this.metrics.queueLength = this.state.queue.actions.length;
    this.metrics.errorRate =
      (this.state.executionStats.errors.length /
        Math.max(this.state.executionStats.totalExecuted, 1)) *
      100;
  }

  private emit(event: string, data?: AutomationEventPayload): void {
    const callbacks = this.eventCallbacks.get(event);
    if (!callbacks) return;

    for (const callback of [...callbacks]) {
      try {
        callback(data);
      } catch (error) {
        logger.error(
          `[${this.constructor.name}] Error in ${event} event listener:`,
          error instanceof Error ? error : String(error),
        );
      }
    }
  }

  addEventListener(event: string, callback: AutomationEventListener): void {
    const callbacks = this.eventCallbacks.get(event) ?? [];
    callbacks.push(callback);
    this.eventCallbacks.set(event, callbacks);
  }

  removeEventListener(event: string, callback: AutomationEventListener): void {
    const callbacks = this.eventCallbacks.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  updateSettings(updates: Partial<AutomationState['settings']>): void {
    Object.assign(this.state.settings, updates);
  }

  private restoreResetDefaults(): void {
    Object.assign(this.state, createAutomationState(), { lastUpdate: 0 });
    Object.assign(this.metrics, createAutomationMetrics(), { frameTime: 0 });
    this.config = createDefaultConfig();
  }

  protected override onReset(): void {
    this.config = createDefaultConfig();
    this.stopExecution(true);
    this.clearQueue();
    this.restoreResetDefaults();
    super.onReset();
  }

  protected override onDispose(): void {
    if (this.isDisposing) return;

    this.isDisposing = true;
    this.stopExecution(true);
    this.eventCallbacks.clear();
    super.onDispose();
  }
}
