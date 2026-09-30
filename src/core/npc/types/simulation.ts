import type { NPCAction, NPCBrainBlueprint, NPCDecisionEntry, NPCInstance } from './index';

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
    /** Moves to the next waypoint and records where the NPC stands, in one update. */
    advanceNavigation(id: string, position: Point): void;
    executeInstanceActions(id: string, actions: NPCAction[]): void;
    /** Applies the actions of a whole decision tick in one update; stores without it get per-NPC updates. */
    applyNPCDecisions?(entries: ReadonlyArray<NPCDecisionEntry>): void;
  };
  subscribe(listener: () => void): () => void;
}
