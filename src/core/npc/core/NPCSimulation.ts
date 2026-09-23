import { Euler, Quaternion } from 'three';

import type { NPCBrainConditionStores } from './blueprint';
import { resolveNPCBrainDecision, type NPCBrainAdapterRegistry } from './brain';
import { NPCPerceptionIndex } from './NPCPerceptionIndex';
import type { AnimationClockLoop } from '../../simulation/AnimationClockLoop';
import type { FixedTick } from '../../simulation/FixedStepClock';
import type { NPCInstance, NPCObservation } from '../types';
import type { NPCBodyPort, NPCSimulationStore } from '../types/simulation';

type Point = [number, number, number];
type Pose = {
  position: Point; rotation: Point;
  sourcePosition: Point; sourceRotation: Point;
  nextDecision: number;
};
const simulations = new WeakMap<NPCSimulationStore, NPCSimulation>();
export function findNPCSimulation(store: NPCSimulationStore): NPCSimulation | undefined { return simulations.get(store); }

/** Authoritative NPC motion and decisions outlive presentation/LOD. Pose writes never notify React per tick. */
export class NPCSimulation {
  private poses = new Map<string, Pose>();
  private bodies = new Map<string, Set<NPCBodyPort>>();
  private unsubscribe: (() => void) | undefined;
  private releaseClock: (() => void) | undefined;
  private releaseSystem: (() => void) | undefined;
  private dirty = true;
  private owners = 0;
  private active = false;
  private euler = new Euler();
  private rotation = new Quaternion();
  private perception = new NPCPerceptionIndex();

  constructor(private readonly store: NPCSimulationStore, private readonly loop: AnimationClockLoop,
    private readonly options: { conditions?: NPCBrainConditionStores; adapters?: NPCBrainAdapterRegistry; scoped?: boolean } = {}) {
    if (simulations.has(store)) throw new Error('NPC store already has a simulation owner');
    simulations.set(store, this);
  }

  /** Compatibility ownership for legacy components without a runtime provider. */
  acquire(): () => void {
    if (++this.owners === 1) this.resume();
    let released = false;
    return () => { if (!released) { released = true; if (--this.owners === 0) this.suspend(); } };
  }

  resume(): void {
    if (this.active) return;
    this.active = true; this.dirty = true;
    this.unsubscribe = this.store.subscribe(() => { this.dirty = true; this.syncClock(); });
    this.syncClock();
  }

  suspend(): void {
    this.active = false; this.unsubscribe?.(); this.unsubscribe = undefined;
    this.releaseSystem?.(); this.releaseSystem = undefined;
    this.releaseClock?.(); this.releaseClock = undefined;
  }

  private syncClock(): void {
    if (this.active && this.store.getState().instances.size > 0) {
      if (this.releaseSystem) return;
      this.releaseSystem = this.loop.clock.addSystem({ id: 'npc-simulation', phase: 'simulation', priority: -10, update: tick => this.update(tick) });
      this.releaseClock = this.loop.acquire();
    } else {
      this.releaseSystem?.(); this.releaseSystem = undefined;
      this.releaseClock?.(); this.releaseClock = undefined;
      if (!this.store.getState().instances.size) { this.poses.clear(); this.perception.refresh(new Map()); }
    }
  }

  private reconcile(): void {
    if (!this.dirty) return;
    this.dirty = false;
    const instances = this.store.getState().instances;
    for (const id of this.poses.keys()) if (!instances.has(id)) this.poses.delete(id);
    for (const instance of instances.values()) {
      let pose = this.poses.get(instance.id);
      if (!pose) {
        pose = { position: [...instance.position], rotation: [...instance.rotation], sourcePosition: instance.position, sourceRotation: instance.rotation, nextDecision: 0 };
        this.poses.set(instance.id, pose);
      }
      if (pose.sourcePosition !== instance.position) { pose.position = [...instance.position]; pose.sourcePosition = instance.position; pose.nextDecision = 0; }
      if (pose.sourceRotation !== instance.rotation) { pose.rotation = [...instance.rotation]; pose.sourceRotation = instance.rotation; }
    }
  }

  getPose(id: string): Readonly<{ position: Point; rotation: Point }> | undefined {
    if (!this.active) this.dirty = true;
    this.reconcile(); return this.poses.get(id);
  }

  /** Owned snapshot for perception and persistence; callers cannot mutate live pose buffers. */
  snapshotInstances(): Map<string, NPCInstance> {
    if (!this.active) this.dirty = true;
    this.reconcile();
    return new Map(Array.from(this.store.getState().instances, ([id, instance]) => {
      const pose = this.poses.get(id);
      return [id, pose ? { ...instance, position: [...pose.position], rotation: [...pose.rotation] } : instance];
    }));
  }

  bindBody(id: string, body: NPCBodyPort): () => void {
    let entries = this.bodies.get(id);
    if (!entries) { entries = new Set(); this.bodies.set(id, entries); }
    entries.add(body);
    const pose = this.getPose(id);
    if (pose && body.isValid()) {
      body.setTranslation({ x: pose.position[0], y: pose.position[1], z: pose.position[2] }, true);
      body.setRotation(this.rotation.setFromEuler(this.euler.set(...pose.rotation)), true);
    }
    return () => { entries.delete(body); if (!entries.size && this.bodies.get(id) === entries) this.bodies.delete(id); };
  }

  private update(tick: FixedTick): void {
    if (!this.active) return;
    this.reconcile();
    const instances = this.store.getState().instances;
    for (const instance of instances.values()) {
      const pose = this.poses.get(instance.id)!;
      this.move(instance, pose, tick.deltaSeconds);
      const bodies = this.bodies.get(instance.id);
      if (bodies) for (const body of bodies) {
        if (!body.isValid()) continue;
        const [x, y, z] = pose.position;
        if (body.isKinematic()) body.setNextKinematicTranslation({ x, y, z });
        else body.setTranslation({ x, y, z }, true);
        this.rotation.setFromEuler(this.euler.set(...pose.rotation));
        if (body.isKinematic()) body.setNextKinematicRotation(this.rotation);
        else body.setRotation(this.rotation, true);
      }
    }
    let observed: Map<string, NPCInstance> | undefined;
    const observations: [string, NPCObservation][] = [];
    for (const instance of this.store.getState().instances.values()) {
      const pose = this.poses.get(instance.id);
      if (!pose || (instance.brain?.mode ?? 'none') === 'none' || tick.elapsedSeconds + 1e-9 < pose.nextDecision) continue;
      pose.nextDecision = tick.elapsedSeconds + Math.max(0.5, instance.behavior?.waitSeconds ?? 1);
      if (!observed) { observed = this.snapshotInstances(); this.perception.refresh(observed); }
      const current = observed.get(instance.id)!;
      observations.push([instance.id, this.perception.observe(current, tick.elapsedSeconds)]);
    }
    if (!observed) return;
    this.store.getState().setInstanceObservations(observations);
    for (const [id, observation] of observations) {
      if (!this.active) return;
      const current = observed.get(id)!;
      const instance = this.store.getState().instances.get(id);
      if (!instance || instance.brain !== current.brain || instance.templateId !== current.templateId) continue;
      const decisionOwner = this.store.getState().instances.get(instance.id);
      const decision = resolveNPCBrainDecision(current, observation, this.options.scoped ? this.store.getState().brainBlueprints : undefined, this.options.conditions, this.options.adapters);
      if (!this.active) return;
      if (this.store.getState().instances.get(instance.id) !== decisionOwner) continue;
      if (decision?.actions.length) {
        this.store.getState().setInstanceDecision(instance.id, decision);
        this.store.getState().executeInstanceActions(instance.id, decision.actions);
      }
    }
  }

  private move(instance: NPCInstance, pose: Pose, delta: number): void {
    const nav = instance.navigation;
    if (nav?.state !== 'moving' || !Number.isFinite(nav.speed) || nav.speed <= 0) return;
    let remaining = nav.speed * delta;
    for (let index = nav.currentIndex; index < nav.waypoints.length; index++) {
      const target = nav.waypoints[index]!;
      const dx = target[0] - pose.position[0], dy = target[1] - pose.position[1], dz = target[2] - pose.position[2];
      const distance = Math.hypot(dx, dy, dz);
      if (distance > 0) {
        const fraction = Math.min(1, remaining / distance);
        pose.position[0] += dx * fraction; pose.position[1] += dy * fraction; pose.position[2] += dz * fraction;
        if (Math.hypot(dx, dz) > 1e-9) pose.rotation[1] = Math.atan2(dx, dz);
      }
      if (distance > remaining + 1e-9) break;
      remaining = Math.max(0, remaining - distance);
      const state = this.store.getState();
      state.updateNavigationPosition(instance.id, [...pose.position]);
      pose.sourcePosition = this.store.getState().instances.get(instance.id)!.position;
      state.advanceNavigation(instance.id);
      if (remaining === 0) break;
    }
  }
}
