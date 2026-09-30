import { Euler, Quaternion } from 'three';

import { resolveNPCBrainDecision, type NPCBrainAdapterRegistry } from './brain';
import { NPCPerceptionIndex } from './NPCPerceptionIndex';
import { routeSteps, type Point } from './routing';
import { npcDecisionPhase, npcUnit } from './wander';
import type { NavigationSystem } from '../../navigation/NavigationSystem';
import type { AnimationClockLoop } from '../../simulation/AnimationClockLoop';
import type { FixedTick } from '../../simulation/FixedStepClock';
import type { NPCAction, NPCDecisionEntry, NPCInstance } from '../types';
import type { NPCBodyPort, NPCSimulationStore } from '../types/simulation';

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
  /** Yaw it turns toward: along its path while walking, else where it stopped or was last turned. */
  heading: number;
  /** Clock seconds until which it stands facing whoever interacted with it. */
  attentionUntil: number;
  /** Next idle gesture time; negative until the NPC first stands. */
  nextGesture: number;
  gestures: number;
};
type View = { source: NPCInstance; revision: number; view: NPCInstance };
/** Speech lasts this long, in seconds, when a speak action names no duration. */
const DEFAULT_SPEECH_SECONDS = 3;
/** An interaction holds the NPC this long, or until its speech ends. */
const ATTENTION_SECONDS = 3;
/** Turning to whoever interacts takes at most about 0.3 s, whatever the NPC's own turn speed. */
const ATTENTION_TURN_SPEED = Math.PI / 0.3;
/** Glances swing on a period of about 18 s, looking to one side while the swing passes ±0.55. */
const GLANCE_RATE = 0.35;
const GLANCE_SWING = 0.55;
/** Salts of an NPC's deterministic draws. */
const GESTURE_TIME = 1;
const GESTURE_CLIP = 2;
/** Points left to walk toward one waypoint of a navigation. */
type Route = { waypoints: Point[]; index: number; steps: Point[] };
/** A one-shot the NPC's model plays; `at` is the clock time it started, which tells repeats apart. */
export type NPCGesture = { clip: string; at: number; greeting: boolean };

/** The shortest signed turn from `from` to `to`, in radians. */
function turnBetween(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

/** Actions the simulation applies itself: speech is transient and a turn uses the live pose, not the stored one. */
const SIMULATION_ACTIONS: ReadonlySet<NPCAction['type']> = new Set(['speak', 'lookAt']);

/** Only store actions reach the store; a tick where no NPC acts on it changes nothing there. */
function applyDecisions(store: NPCSimulationStore, entries: NPCDecisionEntry[]): void {
  const stored: NPCDecisionEntry[] = [];
  for (const entry of entries) {
    const actions = entry.decision?.actions.filter((action) => !SIMULATION_ACTIONS.has(action.type));
    if (actions?.length) stored.push({ ...entry, decision: { ...entry.decision!, actions } });
  }
  if (!stored.length) return;
  const state = store.getState();
  if (state.applyNPCDecisions) {
    state.applyNPCDecisions(stored);
    return;
  }
  for (const { instanceId, decision } of stored) state.executeInstanceActions(instanceId, decision!.actions);
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
  private speech = new Map<string, { text: string; until: number }>();
  private speechChanges = 0;
  private gestures = new Map<string, NPCGesture>();
  private gestureChanges = 0;
  private now = 0;
  /** Non-NPC targets NPCs perceive, such as the player; never decided for, stored or saved. */
  private actors = new Map<string, NPCInstance>();
  private navigation: NavigationSystem | undefined;

  private movedPoses = 0;
  /** Advances whenever a simulated pose moves; saves use it because moved poses are not in the store. */
  get poseRevision(): number { return this.movedPoses; }

  constructor(private readonly store: NPCSimulationStore, private readonly loop: AnimationClockLoop,
    private readonly options: {
      adapters?: NPCBrainAdapterRegistry; scoped?: boolean;
      /** Routes NPC movement around walls once its grid is ready. */
      navigation?: NavigationSystem;
    } = {}) {
    if (simulations.has(store)) throw new Error('NPC store already has a simulation owner');
    simulations.set(store, this);
    this.navigation = options.navigation;
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
      if (!this.store.getState().instances.size) { this.poses.clear(); this.views.clear(); this.records.clear(); this.speech.clear(); this.gestures.clear(); this.perception.refresh(new Map()); }
    }
  }

  private reconcile(): void {
    if (!this.dirty) return;
    this.dirty = false;
    const instances = this.store.getState().instances;
    for (const id of this.poses.keys()) {
      if (instances.has(id)) continue;
      this.poses.delete(id); this.routes.delete(id); this.views.delete(id); this.records.delete(id); this.gestures.delete(id);
      if (this.speech.delete(id)) this.speechChanges++;
    }
    for (const instance of instances.values()) {
      let pose = this.poses.get(instance.id);
      if (!pose) {
        pose = {
          position: [...instance.position], rotation: [...instance.rotation], sourcePosition: instance.position, sourceRotation: instance.rotation,
          home: [...instance.position], nextDecision: -1, moved: true, revision: 0,
          heading: instance.rotation[1], attentionUntil: -Infinity, nextGesture: -1, gestures: 0,
        };
        this.poses.set(instance.id, pose);
      }
      if (pose.sourcePosition !== instance.position) {
        pose.position = [...instance.position]; pose.home = [...instance.position]; pose.sourcePosition = instance.position; pose.nextDecision = -1; pose.moved = true;
        this.routes.delete(instance.id);
      }
      if (pose.sourceRotation !== instance.rotation) {
        pose.rotation = [...instance.rotation]; pose.heading = instance.rotation[1]; pose.sourceRotation = instance.rotation; pose.moved = true;
      }
    }
  }

  private livePose(id: string): Pose | undefined {
    if (!this.active) this.dirty = true;
    this.reconcile();
    return this.poses.get(id);
  }

  getPose(id: string): Readonly<{ position: Point; rotation: Point }> | undefined {
    return this.livePose(id);
  }

  /** Advances whenever this NPC's pose moves or turns, so a view redraws or wakes only then. */
  getPoseRevision(id: string): number {
    return this.poses.get(id)?.revision ?? 0;
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

  /** Routes later movement on `navigation`. Call it again after the grid changes, so routes are planned anew. */
  setNavigation(navigation: NavigationSystem | undefined): void {
    this.navigation = navigation;
    this.routes.clear();
  }

  /** Clock seconds of the next decision, gesture, or end of speech or attention; a paused presentation may sleep until then. */
  nextEventAt(): number | undefined {
    let next = Infinity;
    for (const instance of this.store.getState().instances.values()) {
      const pose = this.poses.get(instance.id);
      if ((instance.brain?.mode ?? 'none') !== 'none') next = Math.min(next, pose && pose.nextDecision >= 0 ? pose.nextDecision : this.now);
      if (!pose) continue;
      if (instance.behavior?.gestures?.clips.length && pose.nextGesture >= 0) next = Math.min(next, pose.nextGesture);
      if (pose.attentionUntil > this.now) next = Math.min(next, pose.attentionUntil);
    }
    for (const speech of this.speech.values()) next = Math.min(next, speech.until);
    return Number.isFinite(next) ? next : undefined;
  }

  /** Adds or moves an actor NPCs can see, such as the player. Its id must not be an NPC id. */
  setActor(id: string, name: string, position: readonly [number, number, number]): void {
    const current = this.actors.get(id);
    if (current && current.name === name && current.position[0] === position[0] && current.position[1] === position[1] && current.position[2] === position[2]) return;
    this.actors.set(id, { id, templateId: 'actor', name, position: [position[0], position[1], position[2]], rotation: [0, 0, 0], scale: [1, 1, 1] });
  }

  removeActor(id: string): void { this.actors.delete(id); }

  /** The NPC's last observation and decision. Neither is stored or saved; editors read them here. */
  getRecord(id: string): Readonly<NPCDecisionEntry> | undefined { return this.records.get(id); }

  /** Shows `text` above the NPC for `duration` seconds of simulation time. Speech is never stored or saved. */
  speak(id: string, text: string, duration = DEFAULT_SPEECH_SECONDS): void {
    this.speech.set(id, { text, until: this.now + Math.max(0, duration) });
    this.speechChanges++;
  }

  /** What the NPC is saying now; `until` is in the clock's elapsed seconds. */
  getSpeech(id: string): Readonly<{ text: string; until: number }> | undefined { return this.speech.get(id); }

  /** Advances whenever speech starts or ends, so presentation redraws bubbles only then. */
  get speechRevision(): number { return this.speechChanges; }

  /** Has the NPC's model play the one-shot `clip`. Gestures are never stored or saved. */
  gesture(id: string, clip: string, greeting = false): void {
    this.gestures.set(id, { clip, at: this.now, greeting });
    this.gestureChanges++;
  }

  /** The NPC's latest gesture; a model shows each one once, telling repeats apart by `at`. */
  getGesture(id: string): Readonly<NPCGesture> | undefined { return this.gestures.get(id); }

  /** Advances with every gesture, so presentation looks for new ones only then. */
  get gestureRevision(): number { return this.gestureChanges; }

  /**
   * Someone at `from` interacts with the NPC. Unless its behavior turns `faceOnInteract` off, it stops and turns to
   * them within about 0.3 s, staying so for a few seconds or until it finishes speaking; it plays its `greetAnimation`.
   */
  greet(id: string, from?: readonly [number, number, number]): void {
    const pose = this.livePose(id);
    const behavior = this.store.getState().instances.get(id)?.behavior;
    if (!pose) return;
    if (from && behavior?.faceOnInteract !== false) {
      pose.attentionUntil = Math.max(this.now + ATTENTION_SECONDS, this.speech.get(id)?.until ?? -Infinity);
      const dx = from[0] - pose.position[0], dz = from[2] - pose.position[2];
      if (Math.hypot(dx, dz) > 1e-9) pose.heading = Math.atan2(dx, dz);
    }
    if (behavior?.greetAnimation) this.gesture(id, behavior.greetAnimation, true);
  }

  /** Whether the NPC stands turned to whoever last interacted with it, its route on hold. */
  isAttending(id: string): boolean {
    return (this.poses.get(id)?.attentionUntil ?? -Infinity) > this.now;
  }

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
    for (const actor of this.actors.values()) if (!view.has(actor.id)) view.set(actor.id, actor);
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
    this.now = tick.elapsedSeconds;
    for (const [id, speech] of this.speech) if (speech.until <= this.now) { this.speech.delete(id); this.speechChanges++; }
    this.reconcile();
    const instances = this.store.getState().instances;
    for (const instance of instances.values()) {
      const pose = this.poses.get(instance.id)!;
      const attending = pose.attentionUntil > this.now;
      if (!attending) this.move(instance, pose, tick.deltaSeconds);
      // Arriving this tick changed the stored instance.
      const current = this.store.getState().instances.get(instance.id) ?? instance;
      const standing = !attending && current.navigation?.state !== 'moving';
      this.turn(current, pose, tick.deltaSeconds, attending, standing);
      if (standing) this.idleGesture(current, pose);
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
      const previous = this.records.get(instance.id)?.observation.perceived;
      observation.entered = [];
      for (const target of observation.perceived) {
        if (this.actors.has(target.instanceId)) target.actor = true;
        if (!previous?.some((seen) => seen.instanceId === target.instanceId)) observation.entered.push(target.instanceId);
      }
      entries.push({ instanceId: instance.id, observation });
    }
    if (!observed) return;
    for (const entry of entries) {
      const current = observed.get(entry.instanceId)!;
      const owner = this.store.getState().instances.get(entry.instanceId);
      if (!owner || owner.brain !== current.brain || owner.templateId !== current.templateId) continue;
      const decision = resolveNPCBrainDecision(current, entry.observation, this.options.scoped ? this.store.getState().brainBlueprints : undefined, this.options.adapters);
      if (!this.active) return;
      // An adapter that rewrote this NPC while deciding owns the result; the stale decision is dropped.
      if (this.store.getState().instances.get(entry.instanceId) !== owner) continue;
      if (decision?.actions.length) entry.decision = decision;
    }
    for (const entry of entries) {
      this.records.set(entry.instanceId, entry);
      for (const action of entry.decision?.actions ?? []) {
        if (action.type === 'speak') this.speak(entry.instanceId, action.text, action.duration);
        else if (action.type === 'lookAt') this.face(entry.instanceId, action.target);
      }
    }
    applyDecisions(this.store, entries);
    for (const listener of this.recordListeners) listener();
  }

  /** Turns the NPC toward `target` from where it stands, at its turn speed; walking turns it again toward its next step. */
  face(id: string, target: readonly [number, number, number]): void {
    const pose = this.poses.get(id);
    if (!pose) return;
    const dx = target[0] - pose.position[0], dz = target[2] - pose.position[2];
    if (Math.hypot(dx, dz) <= 1e-9) return;
    pose.heading = Math.atan2(dx, dz);
    if (this.store.getState().instances.get(id)?.behavior?.turnSpeed !== undefined) return;
    pose.rotation[1] = pose.heading;
    pose.moved = true;
  }

  /** Turns toward the heading, glancing aside now and then while it stands, at its turn speed; without one it snaps. */
  private turn(instance: NPCInstance, pose: Pose, delta: number, attending: boolean, standing: boolean): void {
    const behavior = instance.behavior;
    let target = pose.heading;
    if (standing && behavior?.glance) {
      const swing = Math.sin(this.now * GLANCE_RATE + npcDecisionPhase(instance.id) * Math.PI * 2);
      target += swing > GLANCE_SWING ? behavior.glance : swing < -GLANCE_SWING ? -behavior.glance : 0;
    }
    const turn = turnBetween(pose.rotation[1], target);
    if (Math.abs(turn) < 1e-6) return;
    const speed = behavior?.turnSpeed === undefined ? Infinity : attending ? Math.max(behavior.turnSpeed, ATTENTION_TURN_SPEED) : behavior.turnSpeed;
    pose.rotation[1] = turnBetween(0, pose.rotation[1] + Math.sign(turn) * Math.min(Math.abs(turn), speed * delta));
    pose.moved = true;
  }

  /** While it stands, now and then plays one of its `gestures`, at times and in an order every client draws alike. */
  private idleGesture(instance: NPCInstance, pose: Pose): void {
    const gestures = instance.behavior?.gestures;
    if (!gestures?.clips.length) return;
    const every = Math.max(1, gestures.everySeconds ?? 20);
    if (pose.nextGesture < 0) {
      pose.nextGesture = this.now + every * (0.5 + npcUnit(instance.id, GESTURE_TIME));
      return;
    }
    if (this.now < pose.nextGesture) return;
    const count = pose.gestures++;
    this.gesture(instance.id, gestures.clips[Math.floor(npcUnit(instance.id, GESTURE_CLIP, count) * gestures.clips.length)]!);
    pose.nextGesture = this.now + every * (0.75 + 0.5 * npcUnit(instance.id, GESTURE_TIME, pose.gestures));
  }

  /** The points to walk toward waypoint `index` (`routeSteps`), kept until the NPC moves on; a waypoint without any is skipped. */
  private route(instance: NPCInstance, pose: Pose, waypoints: Point[], index: number): Point[] {
    const cached = this.routes.get(instance.id);
    if (cached && cached.waypoints === waypoints && cached.index === index) return cached.steps;
    const steps = routeSteps(this.navigation, instance, pose.position, waypoints[index]!);
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
          if (Math.hypot(dx, dz) > 1e-9) pose.heading = Math.atan2(dx, dz);
          pose.moved = true;
        }
        if (distance > remaining + 1e-9) return;
        remaining = Math.max(0, remaining - distance);
        steps.shift();
        if (remaining === 0 && steps.length > 0) return;
      }
      this.routes.delete(instance.id);
      this.store.getState().advanceNavigation(instance.id, [...pose.position]);
      pose.sourcePosition = this.store.getState().instances.get(instance.id)!.position;
      // The end of the route: the next decision, which starts the next one, waits out the rest.
      const pause = instance.behavior?.pauseSeconds;
      if (index === nav.waypoints.length - 1 && pause !== undefined) pose.nextDecision = this.now + Math.max(0, pause);
      if (remaining === 0) break;
    }
  }
}
