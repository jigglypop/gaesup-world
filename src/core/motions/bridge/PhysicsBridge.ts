import { AbstractBridge } from '@core/boilerplate';
import { IDisposable } from '@core/boilerplate';
import { PhysicsSystem } from '../core/engine/PhysicsSystem';
import { PhysicsConfigType } from '@/core/stores/slices/mode copy/types';
import { PhysicsUpdateArgs } from '../core/engine/PhysicsSystem';

export type PhysicsEntity = {
  engine: PhysicsSystem;
  dispose: () => void;
};

export type PhysicsCommand = {
  type: 'updateConfig';
  data: Partial<PhysicsConfigType>;
};

export type PhysicsSnapshot = ReturnType<PhysicsSystem['getState']> & {
  metrics: ReturnType<PhysicsSystem['getMetrics']>;
};

export class PhysicsBridge extends AbstractBridge<PhysicsEntity, PhysicsSnapshot, PhysicsCommand> {
  protected buildEngine(_: string, config: PhysicsConfigType): PhysicsEntity | null {
    const engine = new PhysicsSystem(config);
    return { engine, dispose: () => engine.dispose() };
  }

  protected executeCommand(entity: PhysicsEntity, command: PhysicsCommand, _id: string): void {
    switch (command.type) {
      case 'updateConfig':
        entity.engine.updateConfig(command.data);
        break;
    }
  }

  protected createSnapshot(entity: PhysicsEntity): PhysicsSnapshot {
    return {
      ...entity.engine.getState(),
      metrics: { ...entity.engine.getMetrics() },
    };
  }

  updateEntity(id: string, args: PhysicsUpdateArgs): void {
    const entity = this.getEngine(id);
    if (!entity) return;
    entity.engine.update(args);
    this.notifyListeners(id);
  }
}

let globalPhysicsBridge: PhysicsBridge | null = null;

export function getGlobalPhysicsBridge(): PhysicsBridge {
  if (!globalPhysicsBridge) {
    globalPhysicsBridge = new PhysicsBridge();
  }
  return globalPhysicsBridge;
} 