import { Euler, Quaternion } from 'three';

import type { NPCBrainConditionStores } from './blueprint';
import { resolveNPCBrainDecision, type NPCBrainAdapterRegistry } from './brain';
import { NPCPerceptionIndex } from './NPCPerceptionIndex';
import { npcDecisionPhase } from './wander';
import type { NavigationSystem } from '../../navigation/NavigationSystem';
import { createNPCNavigationRoute } from '../../navigation/NPCNavigationAdapter';
import type { AnimationClockLoop } from '../../simulation/AnimationClockLoop';
import type { FixedTick } from '../../simulation/FixedStepClock';
import type { NPCDecisionEntry, NPCInstance } from '../types';
import type { NPCBodyPort, NPCSimulationStore } from '../types/simulation';

type Point = [number, number, number];
type Pose = {
  position: Point; rotation: Point;
  sourcePosition: Point; sourceRotation: Point;
  /** Where the NPC was placed; wandering without `behavior.home` stays around it. */
  home: Point;
  /** Next decision time; negative until the first decision is placed at the NPC's phase of its interval. */
  nextDecision: number;
  /** Kinematic bodies keep their last target, so they are written only after the pose changes. */
  moved: boolean;
  /** Advances with every pose change; perception rebuilds an NPC's view only after it moves. */
  revision: number;
};
type View = { source: NPCInstance; revision: number; view: NPCInstance };
/** Points left to walk toward one waypoint of a navigation. */
type Route = { waypoints: Point[]; index: number; steps: Point[] };

/** Only decisions with actions reach the store; a tick where no NPC acts changes nothing there. */
function applyDecisions(store: NPCSimulationStore, entries: NPCDecisionEntry[]): void {
  if (!entries.some((entry) => entry.decision)) return;
  const state = store.getState();
  if (state.applyNPCDecisions) {
    state.applyNPCDecisions(entries);
    return;
  }
  for (const { instanceId, decision } of entries) if (decision) state.executeInstanceActions(instanceId, decision.actions);
}
const simulations = new WeakMap<NPCSimulationStore, NPCSimulation>();
export function findNPCSimulation(store: NPCSimulationStore): NPCSimulation | undefined { return simulations.get(store); }

/** Authoritative NPC motion and decisions outlive presentation/LOD. Pose writes never notify React per tick. */
export class NPCSimulation {
  private poses = new Map<string, Pose>();
  private routes = new Map<string, Route>();
  private bodies = new Map<string, Set<NPCBodyPort>>();
  private unsubscribe: (() => void) | undefined;
  private releaseClock: (() => void) | undefined;
  private releaseSystem: (() => void) | undefined;
  private dirty = true;
  private owners = 0;
  private active = false;
  private euler = new Euler();
  private rotation = new Quaternion();
  private translation = { x: 0, y: 0, z: 0 };
  private perception = new NPCPerceptionIndex();
  private views = new Map<string, View>();
  private records = new Map<string, NPCDecisionEntry>();
  private recordListeners = new Set<() => void>();

  private movedPoses = 0;
  /** Advances whenever a simulated pose moves; saves use it because moved poses are not in the store. */
  get poseRevision(): number { return this.movedPoses; }

  constructor(private readonly store: NPCSimulationStore, private readonly loop: AnimationClockLoop,
    private readonly options: {
      conditions?: NPCBrainConditionStores; adapters?: NPCBrainAdapterRegistry; scoped?: boolean;
      /** Routes NPC movement around walls once its grid is ready. */
      navigation?: NavigationSystem;
    } = {}) {
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
      if (!this.store.getState().instances.size) { this.poses.clear(); this.views.clear(); this.records.clear(); this.perception.refresh(new Map()); }
    }
  }

  private reconcile(): void {
    if (!this.dirty) return;
    this.dirty = false;
    const instances = this.store.getState().instances;
    for (const id of this.poses.keys()) if (!instances.has(id)) { this.poses.delete(id); this.routes.delete(id); this.views.delete(id); this.records.delete(id); }
    for (const instance of instances.values()) {
      let pose = this.poses.get(instance.id);
      if (!pose) {
        pose = { position: [...instance.position], rotation: [...instance.rotation], sourcePosition: instance.position, sourceRotation: instance.rotation, home: [...instance.position], nextDecision: -1, moved: true, revision: 0 };
        this.poses.set(instance.id, pose);
      }
      if (pose.sourcePosition !== instance.position) {
        pose.position = [...instance.position]; pose.home = [...instance.position]; pose.sourcePosition = instance.position; pose.nextDecision = -1; pose.moved = true;
        this.routes.delete(instance.id);
      }
      if (pose.sourceRotation !== instance.rotation) { pose.rotation = [...instance.rotation]; pose.sourceRotation = instance.rotation; pose.moved = true; }
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

  /** The NPC's last observation and decision. Neither is stored or saved; editors read them here. */
  getRecord(id: string): Readonly<NPCDecisionEntry> | undefined { return this.records.get(id); }

  subscribeRecords(listener: () => void): () => void {
    this.recordListeners.add(listener);
    return () => { this.recordListeners.delete(listener); };
  }

  /** Store instances at their live poses, rebuilt only for NPCs that moved or changed since the last decision tick. */
  private perceptionView(): Map<string, NPCInstance> {
    const view = new Map<string, NPCInstance>();
    for (const instance of this.store.getState().instances.values()) {
      const pose = this.poses.get(instance.id);
      if (!pose) { view.set(instance.id, instance); continue; }
      let entry = this.views.get(instance.id);
      if (!entry || entry.source !== instance || entry.revision !== pose.revision) {
        entry = { source: instance, revision: pose.revision, view: { ...instance, position: [...pose.position], rotation: [...pose.rotation] } };
        this.views.set(instance.id, entry);
      }
      view.set(instance.id, entry.view);
    }
    return view;
  }

  bindBody(id: string, body: NPCBodyPort): () => void {
    let entries = this.bodies.get(id);
    if (!entries) { entries = new Set(); this.bodies.set(id, entries); }
    entries.add(body);
    const pose = this.getPose(id);
    if (pose && body.isValid()) {
      body.setTranslation(this.writeTranslation(pose), true);
      body.setRotation(this.writeRotation(pose), true);
    }
    return () => { entries.delete(body); if (!entries.size && this.bodies.get(id) === entries) this.bodies.delete(id); };
  }

  private writeTranslation(pose: Readonly<{ position: Point }>): { x: number; y: number; z: number } {
    const [x, y, z] = pose.position;
    this.translation.x = x; this.translation.y = y; this.translation.z = z;
    return this.translation;
  }

  private writeRotation(pose: Readonly<{ rotation: Point }>): Quaternion {
    const [x, y, z] = pose.rotation;
    return this.rotation.setFromEuler(this.euler.set(x, y, z));
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
        if (body.isKinematic()) {
          if (!pose.moved) continue;
          body.setNextKinematicTranslation(this.writeTranslation(pose));
          body.setNextKinematicRotation(this.writeRotation(pose));
        } else {
          body.setTranslation(this.writeTranslation(pose), true);
          body.setRotation(this.writeRotation(pose), true);
        }
      }
      if (pose.moved) { this.movedPoses++; pose.revision++; }
      pose.moved = false;
    }
    let observed: Map<string, NPCInstance> | undefined;
    const entries: NPCDecisionEntry[] = [];
    for (const instance of this.store.getState().instances.values()) {
      const pose = this.poses.get(instance.id);
      if (!pose || (instance.brain?.mode ?? 'none') === 'none') continue;
      const interval = Math.max(0.5, instance.behavior?.waitSeconds ?? 1);
      if (pose.nextDecision < 0) pose.nextDecision = tick.elapsedSeconds + interval * npcDecisionPhase(instance.id);
      if (tick.elapsedSeconds + 1e-9 < pose.nextDecision) continue;
      pose.nextDecision = tick.elapsedSeconds + interval;
      if (!observed) { observed = this.perceptionView(); this.perception.refresh(observed); }
      const observation = this.perception.observe(observed.get(instance.id)!, tick.elapsedSeconds);
      observation.home = instance.behavior?.home ?? pose.home;
      entries.push({ instanceId: instance.id, observation });
    }
    if (!observed) return;
    for (const entry of entries) {
      const current = observed.get(entry.instanceId)!;
      const owner = this.store.getState().instances.get(entry.instanceId);
      if (!owner || owner.brain !== current.brain || owner.templateId !== current.templateId) continue;
      const decision = resolveNPCBrainDecision(current, entry.observation, this.options.scoped ? this.store.getState().brainBlueprints : undefined, this.options.conditions, this.options.adapters);
      if (!this.active) return;
      // An adapter that rewrote this NPC while deciding owns the result; the stale decision is dropped.
      if (this.store.getState().instances.get(entry.instanceId) !== owner) continue;
      if (decision?.actions.length) entry.decision = decision;
    }
    for (const entry of entries) this.records.set(entry.instanceId, entry);
    applyDecisions(this.store, entries);
    for (const listener of this.recordListeners) listener();
  }

  /**
   * The points to walk toward waypoint `index`: the grid's route around walls once navigation is ready, the straight
   * segment before that, and none when the grid cannot reach the waypoint, which is then skipped.
   */
  private route(instance: NPCInstance, pose: Pose, waypoints: Point[], index: number): Point[] {
    const cached = this.routes.get(instance.id);
    if (cached && cached.waypoints === waypoints && cached.index === index) return cached.steps;
    const target = waypoints[index]!;
    const navigation = this.options.navigation;
    let steps: Point[] = [[...target]];
    if (navigation?.isReady) {
      const agentRadius = instance.volume ? instance.volume.radius * Math.max(instance.scale[0], instance.scale[2]) : undefined;
      const path = createNPCNavigationRoute(navigation, {
        id: instance.id, position: [...pose.position], ...(agentRadius !== undefined ? { agentRadius } : {}),
      }, target, { includeStart: true });
      steps = path.slice(1).map(([x, y, z]): Point => [x, y, z]);
      const end = steps[steps.length - 1] ?? path[0];
      if (end && Math.hypot(end[0] - target[0], end[2] - target[2]) > 1e-6) steps.push([...target]);
    }
    this.routes.set(instance.id, { waypoints, index, steps });
    return steps;
  }

  private move(instance: NPCInstance, pose: Pose, delta: number): void {
    const nav = instance.navigation;
    if (nav?.state !== 'moving' || !Number.isFinite(nav.speed) || nav.speed <= 0) return;
    let remaining = nav.speed * delta;
    for (let index = nav.currentIndex; index < nav.waypoints.length; index++) {
      const steps = this.route(instance, pose, nav.waypoints, index);
      while (steps.length > 0) {
        const target = steps[0]!;
        const dx = target[0] - pose.position[0], dy = target[1] - pose.position[1], dz = target[2] - pose.position[2];
        const distance = Math.hypot(dx, dy, dz);
        if (distance > 0) {
          const fraction = Math.min(1, remaining / distance);
          pose.position[0] += dx * fraction; pose.position[1] += dy * fraction; pose.position[2] += dz * fraction;
          if (Math.hypot(dx, dz) > 1e-9) pose.rotation[1] = Math.atan2(dx, dz);
          pose.moved = true;
        }
        if (distance > remaining + 1e-9) return;
        remaining = Math.max(0, remaining - distance);
        steps.shift();
        if (remaining === 0 && steps.length > 0) return;
      }
      this.routes.delete(instance.id);
      const state = this.store.getState();
      state.updateNavigationPosition(instance.id, [...pose.position]);
      pose.sourcePosition = this.store.getState().instances.get(instance.id)!.position;
      state.advanceNavigation(instance.id);
      if (remaining === 0) break;
    }
  }
}
