import { resolveScriptProps } from './props';
import { getScript } from './registry';
import type {
  ScriptContext,
  ScriptDefinition,
  ScriptEventListener,
  ScriptEventPayload,
  ScriptFindQuery,
  ScriptHooks,
  ScriptInteractionPayload,
  ScriptObjectHandle,
  ScriptPhysicsEventKind,
  ScriptRuntimeError,
  ScriptServiceLocator,
} from './types';
import { SCENE_COMPONENT_TYPES } from '../scene-object/components';
import type {
  SceneComponent,
  SceneDocument,
  SceneDocumentController,
  SceneJsonObject,
  SceneObject,
  SceneObjectId,
  SceneTransform,
} from '../scene-object/types';
import { logger } from '../utils/logger';

const MAX_RECORDED_ERRORS = 100;

type ObjectHandleState = {
  handle: ScriptObjectHandle;
  object: SceneObject;
  sourceTransform: SceneTransform;
};

type ScriptInstance = {
  key: string;
  objectId: SceneObjectId;
  componentId: string;
  definition: ScriptDefinition;
  data: SceneJsonObject;
  hooks: ScriptHooks;
  enabled: boolean;
  started: boolean;
  failed: boolean;
  subscriptions: Array<() => void>;
};

export type ScriptRuntimeOptions = {
  controller: SceneDocumentController;
  services?: ScriptServiceLocator;
};

const EMPTY_SERVICES: ScriptServiceLocator = { get: () => undefined };

function copyVector(target: { x: number; y: number; z: number }, source: readonly [number, number, number]): void {
  target.x = source[0];
  target.y = source[1];
  target.z = source[2];
}

function matchesQuery(object: SceneObject, query: ScriptFindQuery): boolean {
  if (query.id !== undefined && object.id !== query.id) return false;
  if (query.name !== undefined && object.name !== query.name) return false;
  if (query.tag !== undefined && !object.tags.includes(query.tag)) return false;
  if (query.componentType !== undefined && !object.components.some((component) => component.type === query.componentType)) {
    return false;
  }
  return true;
}

export class ScriptRuntime {
  private readonly controller: SceneDocumentController;
  private readonly services: ScriptServiceLocator;
  private readonly instances = new Map<string, ScriptInstance>();
  private readonly handles = new Map<SceneObjectId, ObjectHandleState>();
  private readonly listeners = new Map<string, Set<ScriptEventListener>>();
  private readonly errors: ScriptRuntimeError[] = [];
  private readonly time = { delta: 0, elapsed: 0, frame: 0 };
  private updateList: ScriptInstance[] = [];
  private fixedList: ScriptInstance[] = [];
  private lateList: ScriptInstance[] = [];
  private document: SceneDocument | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(options: ScriptRuntimeOptions) {
    this.controller = options.controller;
    this.services = options.services ?? EMPTY_SERVICES;
  }

  start(): void {
    if (this.unsubscribe) return;
    this.sync(this.controller.getSnapshot());
    this.unsubscribe = this.controller.subscribe((snapshot) => this.sync(snapshot));
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    Array.from(this.instances.values()).forEach((instance) => this.destroyInstance(instance));
    this.instances.clear();
    this.handles.clear();
    this.listeners.clear();
    this.rebuildLists();
    this.document = null;
    this.time.delta = 0;
    this.time.elapsed = 0;
    this.time.frame = 0;
  }

  isRunning(): boolean {
    return this.unsubscribe !== null;
  }

  update(delta: number): void {
    this.time.delta = delta;
    this.time.elapsed += delta;
    this.time.frame++;
    const list = this.updateList;
    for (let i = 0; i < list.length; i++) {
      const instance = list[i]!;
      if (!this.ensureStarted(instance)) continue;
      const hook = instance.hooks.onUpdate;
      if (hook) this.runHook(instance, 'onUpdate', () => hook(delta));
    }
  }

  fixedUpdate(delta: number): void {
    const list = this.fixedList;
    for (let i = 0; i < list.length; i++) {
      const instance = list[i]!;
      if (!this.ensureStarted(instance)) continue;
      const hook = instance.hooks.onFixedUpdate;
      if (hook) this.runHook(instance, 'onFixedUpdate', () => hook(delta));
    }
  }

  lateUpdate(delta: number): void {
    const list = this.lateList;
    for (let i = 0; i < list.length; i++) {
      const instance = list[i]!;
      if (!this.ensureStarted(instance)) continue;
      const hook = instance.hooks.onLateUpdate;
      if (hook) this.runHook(instance, 'onLateUpdate', () => hook(delta));
    }
  }

  dispatchInteract(objectId: SceneObjectId, payload: ScriptInteractionPayload = {}): number {
    let handled = 0;
    this.instances.forEach((instance) => {
      if (instance.objectId !== objectId || !this.isLive(instance)) return;
      const hook = instance.hooks.onInteract;
      if (!hook) return;
      handled++;
      this.runHook(instance, 'onInteract', () => hook(payload));
    });
    return handled;
  }

  dispatchPhysicsEvent(kind: ScriptPhysicsEventKind, objectId: SceneObjectId, otherId: SceneObjectId): void {
    this.instances.forEach((instance) => {
      if (instance.objectId !== objectId || !this.isLive(instance)) return;
      const hook =
        kind === 'triggerEnter' ? instance.hooks.onTriggerEnter
        : kind === 'triggerExit' ? instance.hooks.onTriggerExit
        : kind === 'collisionEnter' ? instance.hooks.onCollisionEnter
        : instance.hooks.onCollisionExit;
      if (hook) this.runHook(instance, kind, () => hook(otherId));
    });
  }

  emit(name: string, payload: ScriptEventPayload = {}): void {
    this.listeners.get(name)?.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        logger.error(`[ScriptRuntime Error]: 이벤트 리스너 실패 ${name}`, error instanceof Error ? error : String(error));
      }
    });
  }

  getObjectHandle(objectId: SceneObjectId): ScriptObjectHandle | undefined {
    return this.handles.get(objectId)?.handle;
  }

  getInstanceCount(): number {
    return this.instances.size;
  }

  getErrors(): readonly ScriptRuntimeError[] {
    return this.errors;
  }

  private isLive(instance: ScriptInstance): boolean {
    return instance.enabled && !instance.failed;
  }

  private ensureStarted(instance: ScriptInstance): boolean {
    if (!this.isLive(instance)) return false;
    if (instance.started) return true;
    instance.started = true;
    const hook = instance.hooks.onStart;
    if (hook) this.runHook(instance, 'onStart', hook);
    return this.isLive(instance);
  }

  private runHook(instance: ScriptInstance, hook: string, run: () => void): void {
    try {
      run();
    } catch (error) {
      instance.failed = true;
      const message = error instanceof Error ? error.message : String(error);
      if (this.errors.length >= MAX_RECORDED_ERRORS) this.errors.shift();
      this.errors.push({
        objectId: instance.objectId,
        componentId: instance.componentId,
        scriptId: instance.definition.id,
        hook,
        message,
      });
      logger.error(`[ScriptRuntime Error]: ${instance.definition.id}.${hook} 실패 (${instance.objectId})`, message);
      this.rebuildLists();
    }
  }

  private sync(document: SceneDocument): void {
    this.document = document;
    const seen = new Set<string>();
    const liveObjects = new Set<SceneObjectId>();
    for (const object of document.objects) {
      liveObjects.add(object.id);
      this.syncHandle(object);
      for (const component of object.components) {
        if (component.type !== SCENE_COMPONENT_TYPES.script) continue;
        const key = `${object.id}/${component.id}`;
        seen.add(key);
        this.syncInstance(key, object, component);
      }
    }
    this.instances.forEach((instance, key) => {
      if (seen.has(key)) return;
      this.destroyInstance(instance);
      this.instances.delete(key);
    });
    this.handles.forEach((_, objectId) => {
      if (!liveObjects.has(objectId)) this.handles.delete(objectId);
    });
    this.rebuildLists();
  }

  private syncHandle(object: SceneObject): void {
    const existing = this.handles.get(object.id);
    if (existing) {
      existing.object = object;
      if (existing.sourceTransform !== object.transform) {
        existing.sourceTransform = object.transform;
        copyVector(existing.handle.position, object.transform.position);
        copyVector(existing.handle.rotation, object.transform.rotation);
        copyVector(existing.handle.scale, object.transform.scale);
      }
      return;
    }
    const state: ObjectHandleState = {
      object,
      sourceTransform: object.transform,
      handle: undefined as unknown as ScriptObjectHandle,
    };
    const position = { x: 0, y: 0, z: 0 };
    const rotation = { x: 0, y: 0, z: 0 };
    const scale = { x: 1, y: 1, z: 1 };
    copyVector(position, object.transform.position);
    copyVector(rotation, object.transform.rotation);
    copyVector(scale, object.transform.scale);
    state.handle = {
      id: object.id,
      get name() {
        return state.object.name;
      },
      get tags() {
        return state.object.tags;
      },
      position,
      rotation,
      scale,
      hasComponent: (type) => state.object.components.some((component) => component.type === type),
      getComponentData: (type) => state.object.components.find((component) => component.type === type)?.data,
    };
    this.handles.set(object.id, state);
  }

  private syncInstance(key: string, object: SceneObject, component: SceneComponent): void {
    const scriptId = component.data['scriptId'];
    const definition = typeof scriptId === 'string' ? getScript(scriptId) : undefined;
    const existing = this.instances.get(key);
    if (existing && (existing.definition !== definition || existing.data !== component.data)) {
      this.destroyInstance(existing);
      this.instances.delete(key);
    } else if (existing) {
      this.setEnabled(existing, component.enabled);
      return;
    }
    if (!definition) {
      if (typeof scriptId === 'string') logger.warn(`[ScriptRuntime] 등록되지 않은 스크립트: ${scriptId} (${object.id})`);
      return;
    }
    const instance = this.createInstance(key, object.id, component, definition);
    if (instance) this.instances.set(key, instance);
  }

  private createInstance(
    key: string,
    objectId: SceneObjectId,
    component: SceneComponent,
    definition: ScriptDefinition,
  ): ScriptInstance | null {
    const rawProps = component.data['props'];
    const propData = rawProps && typeof rawProps === 'object' && !Array.isArray(rawProps) ? (rawProps as SceneJsonObject) : undefined;
    const { props, issues } = resolveScriptProps(definition.props, propData);
    issues.forEach((issue) => logger.warn(`[ScriptRuntime] ${definition.id}.${issue.prop}: ${issue.message}`));
    const instance: ScriptInstance = {
      key,
      objectId,
      componentId: component.id,
      definition,
      data: component.data,
      hooks: {},
      enabled: false,
      started: false,
      failed: false,
      subscriptions: [],
    };
    this.runHook(instance, 'create', () => {
      instance.hooks = definition.create(this.createContext(instance), props);
    });
    if (instance.failed) return instance;
    const awake = instance.hooks.onAwake;
    if (awake) this.runHook(instance, 'onAwake', awake);
    this.setEnabled(instance, component.enabled);
    return instance;
  }

  private setEnabled(instance: ScriptInstance, enabled: boolean): void {
    if (instance.enabled === enabled || instance.failed) return;
    instance.enabled = enabled;
    const hook = enabled ? instance.hooks.onEnable : instance.hooks.onDisable;
    if (hook) this.runHook(instance, enabled ? 'onEnable' : 'onDisable', hook);
  }

  private destroyInstance(instance: ScriptInstance): void {
    if (instance.enabled && !instance.failed) this.setEnabled(instance, false);
    const hook = instance.hooks.onDestroy;
    if (hook && !instance.failed) this.runHook(instance, 'onDestroy', hook);
    instance.subscriptions.forEach((unsubscribe) => unsubscribe());
    instance.subscriptions.length = 0;
    instance.enabled = false;
  }

  private rebuildLists(): void {
    const update: ScriptInstance[] = [];
    const fixed: ScriptInstance[] = [];
    const late: ScriptInstance[] = [];
    this.instances.forEach((instance) => {
      if (instance.failed) return;
      if (instance.hooks.onUpdate || instance.hooks.onStart) update.push(instance);
      if (instance.hooks.onFixedUpdate) fixed.push(instance);
      if (instance.hooks.onLateUpdate) late.push(instance);
    });
    this.updateList = update;
    this.fixedList = fixed;
    this.lateList = late;
  }

  private find(query: ScriptFindQuery): ScriptObjectHandle[] {
    const objects = this.document?.objects ?? [];
    const result: ScriptObjectHandle[] = [];
    for (const object of objects) {
      if (!matchesQuery(object, query)) continue;
      const handle = this.handles.get(object.id)?.handle;
      if (handle) result.push(handle);
    }
    return result;
  }

  private createContext(instance: ScriptInstance): ScriptContext {
    const handle = this.handles.get(instance.objectId)?.handle;
    if (!handle) throw new Error(`[ScriptRuntime Error]: 객체 핸들이 없습니다 ${instance.objectId}`);
    return {
      objectId: instance.objectId,
      object: handle,
      time: this.time,
      find: (query) => this.find(query),
      findOne: (query) => this.find(query)[0],
      emit: (name, payload) => this.emit(name, payload),
      on: (name, listener) => {
        const set = this.listeners.get(name) ?? new Set<ScriptEventListener>();
        set.add(listener);
        this.listeners.set(name, set);
        const unsubscribe = () => {
          set.delete(listener);
        };
        instance.subscriptions.push(unsubscribe);
        return unsubscribe;
      },
      services: this.services,
      commit: (command) => this.controller.dispatch(command),
    };
  }
}
