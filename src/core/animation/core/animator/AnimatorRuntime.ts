import type {
  AnimatorBlend1DMotion,
  AnimatorClipBinding,
  AnimatorCondition,
  AnimatorControllerDefinition,
  AnimatorEventListener,
  AnimatorLayerDefinition,
  AnimatorLayerStatus,
  AnimatorParameterType,
  AnimatorParameterValue,
  AnimatorStateDefinition,
  AnimatorTransitionDefinition,
} from './types';
import { ANIMATOR_ANY_STATE, validateAnimatorController } from './validate';
import { logger } from '../../../utils/logger';

export const ANIMATOR_DEFAULT_TRANSITION_DURATION = 0.25;
const FALLBACK_MOTION_DURATION = 1;
const EVENT_TIME_EPSILON = 1e-6;
const FLOAT_EQUALITY_EPSILON = 1e-6;
const MAX_EVENT_LOOPS_PER_UPDATE = 4;

type StateRuntime = {
  definition: AnimatorStateDefinition;
  loop: boolean;
  speed: number;
};

type TransitionRuntime = {
  to: StateRuntime;
  duration: number;
  exitTime: number | undefined;
  canTransitionToSelf: boolean;
  conditions: readonly AnimatorCondition[];
};

type Track = {
  state: StateRuntime;
  normalizedTime: number;
  previousNormalizedTime: number;
  weight: number;
  target: number;
  fadeRate: number;
};

type LayerRuntime = {
  index: number;
  name: string;
  weight: number;
  states: Map<string, StateRuntime>;
  anyTransitions: TransitionRuntime[];
  stateTransitions: Map<string, TransitionRuntime[]>;
  current: StateRuntime;
  logicTime: number;
  tracks: Track[];
  outputTrack: Track | null;
  override: StateRuntime | null;
  overrideStates: Map<string, StateRuntime>;
};

type ParameterSlot = {
  type: AnimatorParameterType;
  value: AnimatorParameterValue;
};

function createStateRuntime(definition: AnimatorStateDefinition): StateRuntime {
  return {
    definition,
    loop: definition.motion.loop ?? true,
    speed: definition.motion.speed ?? 1,
  };
}

function blendChildWeight(motion: AnimatorBlend1DMotion, value: number, childIndex: number): number {
  const children = motion.children;
  const last = children.length - 1;
  const first = children[0];
  const final = children[last];
  if (!first || !final) return 0;
  if (value <= first.threshold) return childIndex === 0 ? 1 : 0;
  if (value >= final.threshold) return childIndex === last ? 1 : 0;
  for (let i = 0; i < last; i++) {
    const low = children[i];
    const high = children[i + 1];
    if (!low || !high || value >= high.threshold) continue;
    const factor = (value - low.threshold) / (high.threshold - low.threshold);
    if (childIndex === i) return 1 - factor;
    if (childIndex === i + 1) return factor;
    return 0;
  }
  return 0;
}

export class AnimatorRuntime {
  readonly controllerId: string;
  private readonly binding: AnimatorClipBinding;
  private readonly layers: LayerRuntime[];
  private readonly parameters = new Map<string, ParameterSlot>();
  private readonly trackPool: Track[] = [];
  private readonly listeners = new Set<AnimatorEventListener>();
  private readonly warnedParameters = new Set<string>();
  private enabled = true;
  private speed = 1;
  private dominantClip = '';
  private disposed = false;

  constructor(definition: AnimatorControllerDefinition, binding: AnimatorClipBinding) {
    const validation = validateAnimatorController(definition);
    if (!validation.valid) {
      const first = validation.issues[0];
      throw new Error(
        `[AnimatorRuntime Error]: 잘못된 컨트롤러 ${definition.id} (${first?.path}: ${first?.message})`,
      );
    }
    this.controllerId = definition.id;
    this.binding = binding;
    Object.entries(definition.parameters ?? {}).forEach(([name, parameter]) => {
      const fallback = parameter.type === 'float' ? 0 : false;
      this.parameters.set(name, { type: parameter.type, value: parameter.default ?? fallback });
    });
    this.layers = definition.layers.map((layer, index) => this.createLayer(layer, index));
    this.layers.forEach((layer) => this.enterState(layer, layer.current, 0));
    this.dominantClip = this.computeDominantClip();
  }

  private createLayer(definition: AnimatorLayerDefinition, index: number): LayerRuntime {
    const states = new Map<string, StateRuntime>();
    definition.states.forEach((state) => states.set(state.name, createStateRuntime(state)));
    const toRuntime = (transition: AnimatorTransitionDefinition): TransitionRuntime => ({
      to: states.get(transition.to)!,
      duration: transition.duration ?? ANIMATOR_DEFAULT_TRANSITION_DURATION,
      exitTime: transition.exitTime,
      canTransitionToSelf: transition.canTransitionToSelf ?? false,
      conditions: transition.conditions ?? [],
    });
    const anyTransitions: TransitionRuntime[] = [];
    const stateTransitions = new Map<string, TransitionRuntime[]>();
    definition.transitions?.forEach((transition) => {
      if (transition.from === ANIMATOR_ANY_STATE) {
        anyTransitions.push(toRuntime(transition));
        return;
      }
      const list = stateTransitions.get(transition.from) ?? [];
      list.push(toRuntime(transition));
      stateTransitions.set(transition.from, list);
    });
    return {
      index,
      name: definition.name,
      weight: index === 0 ? 1 : definition.weight ?? 1,
      states,
      anyTransitions,
      stateTransitions,
      current: states.get(definition.defaultState)!,
      logicTime: 0,
      tracks: [],
      outputTrack: null,
      override: null,
      overrideStates: new Map(),
    };
  }

  setFloat(name: string, value: number): void {
    const slot = this.getSlot(name, 'float');
    if (slot) slot.value = value;
  }

  setBool(name: string, value: boolean): void {
    const slot = this.getSlot(name, 'bool');
    if (slot) slot.value = value;
  }

  setTrigger(name: string): void {
    const slot = this.getSlot(name, 'trigger');
    if (slot) slot.value = true;
  }

  resetTrigger(name: string): void {
    const slot = this.getSlot(name, 'trigger');
    if (slot) slot.value = false;
  }

  setParameter(name: string, value: AnimatorParameterValue): void {
    const slot = this.parameters.get(name);
    if (!slot) {
      this.warnUnknownParameter(name);
      return;
    }
    if (slot.type === 'float' && typeof value === 'number') slot.value = value;
    else if (slot.type !== 'float' && typeof value === 'boolean') slot.value = value;
  }

  getParameter(name: string): AnimatorParameterValue | undefined {
    return this.parameters.get(name)?.value;
  }

  getParameterNames(): string[] {
    return Array.from(this.parameters.keys());
  }

  private getSlot(name: string, type: AnimatorParameterType): ParameterSlot | null {
    const slot = this.parameters.get(name);
    if (!slot || slot.type !== type) {
      this.warnUnknownParameter(name);
      return null;
    }
    return slot;
  }

  private warnUnknownParameter(name: string): void {
    if (this.warnedParameters.has(name)) return;
    this.warnedParameters.add(name);
    logger.warn(`[AnimatorRuntime] ${this.controllerId}: 파라미터 ${name}가 없거나 형식이 다릅니다`);
  }

  onEvent(listener: AnimatorEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setSpeed(speed: number): void {
    if (Number.isFinite(speed) && speed >= 0) this.speed = speed;
  }

  getSpeed(): number {
    return this.speed;
  }

  setLayerWeight(layerIndex: number, weight: number): void {
    const layer = this.layers[layerIndex];
    if (layer && Number.isFinite(weight)) layer.weight = Math.min(1, Math.max(0, weight));
  }

  getLayerWeight(layerIndex: number): number {
    return this.layers[layerIndex]?.weight ?? 0;
  }

  setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    if (!enabled) {
      this.binding.beginFrame();
      this.binding.endFrame();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getCurrentState(layerIndex = 0): string {
    return this.layers[layerIndex]?.current.definition.name ?? '';
  }

  getDominantClip(): string {
    return this.dominantClip;
  }

  getLayerStatus(): AnimatorLayerStatus[] {
    return this.layers.map((layer) => ({
      name: layer.name,
      state: layer.current.definition.name,
      normalizedTime: layer.logicTime,
      weight: layer.weight,
      override: layer.override?.definition.name ?? null,
    }));
  }

  play(name: string, duration = ANIMATOR_DEFAULT_TRANSITION_DURATION, layerIndex = 0): boolean {
    const layer = this.layers[layerIndex];
    if (!layer) return false;
    const state = layer.states.get(name);
    if (state) {
      this.enterState(layer, state, duration);
      return true;
    }
    if (!this.binding.hasClip(layer.index, name)) {
      logger.warn(`[AnimatorRuntime] ${this.controllerId}: 상태나 클립이 없습니다: ${name}`);
      return false;
    }
    let overrideState = layer.overrideStates.get(name);
    if (!overrideState) {
      overrideState = createStateRuntime({ name, motion: { kind: 'clip', clip: name } });
      layer.overrideStates.set(name, overrideState);
    }
    layer.override = overrideState;
    this.crossFadeTo(layer, overrideState, duration);
    return true;
  }

  update(deltaTime: number): boolean {
    if (this.disposed) return false;
    if (!this.enabled) return false;
    const scaled = Math.max(0, deltaTime) * this.speed;
    let changed = false;
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i]!;
      layer.logicTime += (scaled * layer.current.speed) / this.getMotionDuration(layer, layer.current);
      this.advanceTracks(layer, scaled);
      if (this.evaluateTransitions(layer)) changed = true;
      this.updateFades(layer, scaled);
    }
    this.apply();
    const dominant = this.computeDominantClip();
    if (dominant !== this.dominantClip) {
      this.dominantClip = dominant;
      changed = true;
    }
    return changed;
  }

  private advanceTracks(layer: LayerRuntime, scaled: number): void {
    for (let i = 0; i < layer.tracks.length; i++) {
      const track = layer.tracks[i]!;
      track.normalizedTime += (scaled * track.state.speed) / this.getMotionDuration(layer, track.state);
      if (!track.state.loop && track.normalizedTime > 1) track.normalizedTime = 1;
      if (track === layer.outputTrack) this.fireEvents(layer, track);
      track.previousNormalizedTime = track.normalizedTime;
    }
  }

  private fireEvents(layer: LayerRuntime, track: Track): void {
    const events = track.state.definition.events;
    if (!events || events.length === 0 || this.listeners.size === 0) return;
    const previous = track.previousNormalizedTime;
    const current = track.normalizedTime;
    for (let i = 0; i < events.length; i++) {
      const event = events[i]!;
      let cycle = Math.floor(previous - event.time) + 1;
      let fired = 0;
      while (cycle + event.time <= current && fired < MAX_EVENT_LOOPS_PER_UPDATE) {
        if (track.state.loop || cycle === 0) this.emit(layer, track.state, event.name);
        cycle++;
        fired++;
      }
    }
  }

  private emit(layer: LayerRuntime, state: StateRuntime, name: string): void {
    const event = { controllerId: this.controllerId, layer: layer.name, state: state.definition.name, name };
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        logger.error(
          `[AnimatorRuntime Error]: 이벤트 리스너 실패 ${name}`,
          error instanceof Error ? error : String(error),
        );
      }
    });
  }

  private evaluateTransitions(layer: LayerRuntime): boolean {
    const transition =
      this.findTransition(layer, layer.anyTransitions) ??
      this.findTransition(layer, layer.stateTransitions.get(layer.current.definition.name));
    if (!transition) return false;
    this.consumeTriggers(transition.conditions);
    this.enterState(layer, transition.to, transition.duration);
    return true;
  }

  private findTransition(
    layer: LayerRuntime,
    transitions: TransitionRuntime[] | undefined,
  ): TransitionRuntime | null {
    if (!transitions) return null;
    for (let i = 0; i < transitions.length; i++) {
      const transition = transitions[i]!;
      if (transition.to === layer.current && !transition.canTransitionToSelf) continue;
      if (transition.exitTime !== undefined && layer.logicTime < transition.exitTime) continue;
      if (this.conditionsMet(transition.conditions)) return transition;
    }
    return null;
  }

  private conditionsMet(conditions: readonly AnimatorCondition[]): boolean {
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i]!;
      const value = this.parameters.get(condition.parameter)?.value;
      const target = condition.value ?? 0;
      let met = false;
      switch (condition.operator) {
        case 'greater':
          met = typeof value === 'number' && value > target;
          break;
        case 'less':
          met = typeof value === 'number' && value < target;
          break;
        case 'equals':
          met = typeof value === 'number' && Math.abs(value - target) <= FLOAT_EQUALITY_EPSILON;
          break;
        case 'notEquals':
          met = typeof value === 'number' && Math.abs(value - target) > FLOAT_EQUALITY_EPSILON;
          break;
        case 'true':
        case 'trigger':
          met = value === true;
          break;
        case 'false':
          met = value === false;
          break;
      }
      if (!met) return false;
    }
    return true;
  }

  private consumeTriggers(conditions: readonly AnimatorCondition[]): void {
    for (let i = 0; i < conditions.length; i++) {
      const condition = conditions[i]!;
      if (condition.operator !== 'trigger') continue;
      const slot = this.parameters.get(condition.parameter);
      if (slot) slot.value = false;
    }
  }

  private enterState(layer: LayerRuntime, state: StateRuntime, duration: number): void {
    layer.current = state;
    layer.logicTime = 0;
    layer.override = null;
    if (!this.isPlayable(layer, state)) return;
    this.crossFadeTo(layer, state, duration);
  }

  private crossFadeTo(layer: LayerRuntime, state: StateRuntime, duration: number): void {
    const immediate = !(duration > 0);
    const rate = immediate ? Infinity : 1 / duration;
    for (let i = 0; i < layer.tracks.length; i++) {
      const track = layer.tracks[i]!;
      track.target = 0;
      track.fadeRate = rate;
      if (immediate) track.weight = 0;
    }
    const track = this.trackPool.pop() ?? {
      state,
      normalizedTime: 0,
      previousNormalizedTime: 0,
      weight: 0,
      target: 1,
      fadeRate: rate,
    };
    track.state = state;
    track.normalizedTime = 0;
    track.previousNormalizedTime = -EVENT_TIME_EPSILON;
    track.weight = immediate || layer.tracks.length === 0 ? 1 : 0;
    track.target = 1;
    track.fadeRate = rate;
    layer.tracks.push(track);
    layer.outputTrack = track;
    this.removeSilentTracks(layer);
  }

  private updateFades(layer: LayerRuntime, scaled: number): void {
    for (let i = 0; i < layer.tracks.length; i++) {
      const track = layer.tracks[i]!;
      if (track.weight === track.target) continue;
      const step = track.fadeRate * scaled;
      track.weight =
        track.weight < track.target
          ? Math.min(track.target, track.weight + step)
          : Math.max(track.target, track.weight - step);
    }
    this.removeSilentTracks(layer);
  }

  private removeSilentTracks(layer: LayerRuntime): void {
    for (let i = layer.tracks.length - 1; i >= 0; i--) {
      const track = layer.tracks[i]!;
      if (track.target > 0 || track.weight > 0) continue;
      layer.tracks.splice(i, 1);
      this.trackPool.push(track);
    }
  }

  private isPlayable(layer: LayerRuntime, state: StateRuntime): boolean {
    const motion = state.definition.motion;
    if (motion.kind === 'clip') return this.binding.hasClip(layer.index, motion.clip);
    for (let i = 0; i < motion.children.length; i++) {
      if (this.binding.hasClip(layer.index, motion.children[i]!.clip)) return true;
    }
    return false;
  }

  private getBlendValue(motion: AnimatorBlend1DMotion): number {
    const value = this.parameters.get(motion.parameter)?.value;
    return typeof value === 'number' ? value : 0;
  }

  private getBlendNormalization(layer: LayerRuntime, motion: AnimatorBlend1DMotion, value: number): number {
    let total = 0;
    for (let i = 0; i < motion.children.length; i++) {
      if (this.binding.hasClip(layer.index, motion.children[i]!.clip)) {
        total += blendChildWeight(motion, value, i);
      }
    }
    return total;
  }

  private getMotionDuration(layer: LayerRuntime, state: StateRuntime): number {
    const motion = state.definition.motion;
    if (motion.kind === 'clip') {
      if (!this.binding.hasClip(layer.index, motion.clip)) return FALLBACK_MOTION_DURATION;
      const duration = this.binding.getClipDuration(layer.index, motion.clip);
      return duration > 0 ? duration : FALLBACK_MOTION_DURATION;
    }
    const value = this.getBlendValue(motion);
    const total = this.getBlendNormalization(layer, motion, value);
    if (total <= 0) return FALLBACK_MOTION_DURATION;
    let duration = 0;
    for (let i = 0; i < motion.children.length; i++) {
      const child = motion.children[i]!;
      if (!this.binding.hasClip(layer.index, child.clip)) continue;
      duration += (blendChildWeight(motion, value, i) / total) * this.binding.getClipDuration(layer.index, child.clip);
    }
    return duration > 0 ? duration : FALLBACK_MOTION_DURATION;
  }

  private clipTime(layer: LayerRuntime, track: Track, clip: string): number {
    const duration = this.binding.getClipDuration(layer.index, clip);
    if (!(duration > 0)) return 0;
    const phase = track.state.loop
      ? track.normalizedTime - Math.floor(track.normalizedTime)
      : Math.min(1, Math.max(0, track.normalizedTime));
    return phase * duration;
  }

  private apply(): void {
    this.binding.beginFrame();
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i]!;
      if (layer.weight <= 0) continue;
      for (let t = 0; t < layer.tracks.length; t++) {
        const track = layer.tracks[t]!;
        if (track.weight <= 0) continue;
        this.writeTrack(layer, track);
      }
    }
    this.binding.endFrame();
  }

  private writeTrack(layer: LayerRuntime, track: Track): void {
    const motion = track.state.definition.motion;
    if (motion.kind === 'clip') {
      if (!this.binding.hasClip(layer.index, motion.clip)) return;
      this.binding.writeClip(layer.index, motion.clip, this.clipTime(layer, track, motion.clip), track.weight, layer.weight);
      return;
    }
    const value = this.getBlendValue(motion);
    const total = this.getBlendNormalization(layer, motion, value);
    if (total <= 0) return;
    for (let i = 0; i < motion.children.length; i++) {
      const child = motion.children[i]!;
      if (!this.binding.hasClip(layer.index, child.clip)) continue;
      const weight = (blendChildWeight(motion, value, i) / total) * track.weight;
      if (weight <= 0) continue;
      this.binding.writeClip(layer.index, child.clip, this.clipTime(layer, track, child.clip), weight, layer.weight);
    }
  }

  private computeDominantClip(): string {
    const layer = this.layers[0];
    if (!layer) return '';
    let best = '';
    let bestWeight = 0;
    for (let t = 0; t < layer.tracks.length; t++) {
      const track = layer.tracks[t]!;
      const motion = track.state.definition.motion;
      if (motion.kind === 'clip') {
        if (track.weight > bestWeight && this.binding.hasClip(0, motion.clip)) {
          best = motion.clip;
          bestWeight = track.weight;
        }
        continue;
      }
      const value = this.getBlendValue(motion);
      const total = this.getBlendNormalization(layer, motion, value);
      if (total <= 0) continue;
      for (let i = 0; i < motion.children.length; i++) {
        const child = motion.children[i]!;
        if (!this.binding.hasClip(0, child.clip)) continue;
        const weight = (blendChildWeight(motion, value, i) / total) * track.weight;
        if (weight > bestWeight) {
          best = child.clip;
          bestWeight = weight;
        }
      }
    }
    return best;
  }

  refreshBindings(): void {
    this.layers.forEach((layer) => {
      if (layer.tracks.length === 0 && this.isPlayable(layer, layer.current)) {
        this.crossFadeTo(layer, layer.current, 0);
      }
    });
    this.dominantClip = this.computeDominantClip();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.listeners.clear();
    this.binding.dispose();
  }
}
