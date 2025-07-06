import { CoreBridge, DomainBridge, EnableEventLog } from '@core/boilerplate';
import { PhysicsSystem } from '../core/system/PhysicsSystem';
import { PhysicsConfigType } from '@/core/stores/slices/physics/types';
import { PhysicsUpdateArgs } from '../core/system/PhysicsSystem';
import { BridgeFactory } from '@core/boilerplate';

export type PhysicsBridgeEntity = {
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

@DomainBridge('physics')
@EnableEventLog()
export class PhysicsBridge extends CoreBridge<PhysicsBridgeEntity, PhysicsSnapshot, PhysicsCommand> {
  protected buildEngine(_: string, config: PhysicsConfigType): PhysicsBridgeEntity | null {
    const engine = new PhysicsSystem(config);
    return { engine, dispose: () => engine.dispose() };
  }

  protected executeCommand(entity: PhysicsBridgeEntity, command: PhysicsCommand, _id: string): void {
    switch (command.type) {
      case 'updateConfig':
        entity.engine.updateConfig(command.data);
        break;
    }
  }

  protected createSnapshot(entity: PhysicsBridgeEntity): PhysicsSnapshot {
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