import type { NPCAction, NPCBrainBlueprint, NPCBrainDecision, NPCInstance, NPCObservation } from './index';

type Point = [number, number, number];
type Vector = { x: number; y: number; z: number };
type Rotation = Vector & { w: number };

/** Minimal physics port; simulation does not import a React renderer or a physics binding. */
export interface NPCBodyPort {
  isValid(): boolean;
  isKinematic(): boolean;
  setTranslation(position: Vector, wakeUp: boolean): void;
  setRotation(rotation: Rotation, wakeUp: boolean): void;
  setNextKinematicTranslation(position: Vector): void;
  setNextKinematicRotation(rotation: Rotation): void;
}

/** Store port for simulation and adapters, independent of Zustand/React. */
export interface NPCSimulationStore {
  getState(): {
    instances: Map<string, NPCInstance>;
    brainBlueprints: Map<string, NPCBrainBlueprint>;
    updateNavigationPosition(id: string, position: Point): void;
    advanceNavigation(id: string): void;
    setInstanceObservations(observations: ReadonlyArray<readonly [string, NPCObservation]>): void;
    setInstanceDecision(id: string, decision: NPCBrainDecision): void;
    executeInstanceActions(id: string, actions: NPCAction[]): void;
  };
  subscribe(listener: () => void): () => void;
}
