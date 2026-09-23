import { CoreBridge, DomainBridge, EnableEventLog } from '@core/boilerplate';
import { ValidateCommand } from '@core/boilerplate';

import type { PhysicsConfigType } from '../core/config';
import { EntityStateManager } from '../core/system/EntityStateManager';
import { PhysicsSystem } from '../core/system/PhysicsSystem';
import { PhysicsUpdateArgs } from '../core/system/PhysicsSystem';

export type PhysicsBridgeEntity = {
  system: PhysicsSystem;
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
  private readonly entitySnapshots = new WeakMap<PhysicsBridgeEntity, PhysicsSnapshot>();

  protected buildEngine(
    _: string,
    config: PhysicsConfigType,
    stateManager?: EntityStateManager,
  ): PhysicsBridgeEntity | null {
    void _;
    const system = new PhysicsSystem(config, {}, stateManager);
    return { system, dispose: () => system.dispose() };
  }

  @ValidateCommand()
  protected executeCommand(entity: PhysicsBridgeEntity, command: PhysicsCommand, _id: string): void {
    void _id;
    switch (command.type) {
      case 'updateConfig':
        entity.system.updateConfig(command.data);
        break;
    }
  }

  protected createSnapshot(entity: PhysicsBridgeEntity): PhysicsSnapshot {
    const state = entity.system.getState();
    const metrics = entity.system.getMetrics();
    let snapshot = this.entitySnapshots.get(entity);
    if (!snapshot) {
      snapshot = { ...state, metrics: { ...metrics } };
      this.entitySnapshots.set(entity, snapshot);
      return snapshot;
    }
    const target = snapshot;
    Object.assign(target, state);
    target.metrics = Object.assign(snapshot.metrics, metrics);
    return target;
  }

  updateEntity(id: string, args: PhysicsUpdateArgs): void {
    const entity = this.getEngine(id);
    if (!entity) return;
    entity.system.updateWithArgs(args);
    this.notifyListeners(id);
  }
}
