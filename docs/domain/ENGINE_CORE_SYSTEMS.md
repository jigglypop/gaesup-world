# 게임 엔진 핵심 시스템 상세 분석

## 1. Gameplay Ability System (GAS) - 언리얼 스타일

### 1.1 개요
Gameplay Ability System은 게임의 스킬, 능력, 상태 효과를 관리하는 모듈식 시스템입니다.

### 1.2 핵심 구성 요소

```typescript
// src/core/engine/abilities/AbilitySystemComponent.ts
class AbilitySystemComponent extends ActorComponent {
  private grantedAbilities: Map<string, GameplayAbility>;
  private activeAbilities: Set<AbilityHandle>;
  private attributes: Map<string, AttributeSet>;
  private gameplayEffects: Map<string, ActiveGameplayEffect>;
  private tags: GameplayTagContainer;
  
  // 능력 부여/제거
  giveAbility(abilityClass: typeof GameplayAbility): AbilityHandle;
  removeAbility(handle: AbilityHandle): void;
  
  // 능력 실행
  tryActivateAbility(handle: AbilityHandle): boolean;
  tryActivateAbilityByClass(abilityClass: typeof GameplayAbility): boolean;
  tryActivateAbilityByTag(tag: GameplayTag): boolean;
  
  // 효과 적용
  applyGameplayEffect(effect: GameplayEffect, source: Actor): ActiveGameplayEffectHandle;
  removeActiveGameplayEffect(handle: ActiveGameplayEffectHandle): void;
  
  // 태그 시스템
  hasMatchingGameplayTag(tag: GameplayTag): boolean;
  hasAllMatchingGameplayTags(tags: GameplayTagContainer): boolean;
  hasAnyMatchingGameplayTags(tags: GameplayTagContainer): boolean;
}

// 게임플레이 능력
abstract class GameplayAbility extends GObject {
  abilityTags: GameplayTagContainer;
  cancelAbilitiesWithTag: GameplayTagContainer;
  blockAbilitiesWithTag: GameplayTagContainer;
  activationOwnedTags: GameplayTagContainer;
  
  cooldown?: GameplayEffect;
  cost?: GameplayEffect;
  
  // 능력 라이프사이클
  canActivateAbility(handle: AbilityHandle, actorInfo: AbilityActorInfo): boolean;
  activateAbility(handle: AbilityHandle, actorInfo: AbilityActorInfo): void;
  commitAbility(handle: AbilityHandle): boolean;
  endAbility(handle: AbilityHandle, wasCancelled: boolean): void;
  
  // 비용과 쿨다운
  checkCost(handle: AbilityHandle): boolean;
  checkCooldown(handle: AbilityHandle): boolean;
  applyCost(handle: AbilityHandle): void;
  applyCooldown(handle: AbilityHandle): void;
}

// 게임플레이 효과
class GameplayEffect {
  duration: DurationType; // Instant, Duration, Infinite
  period?: number; // 주기적 효과
  modifiers: GameplayModifier[];
  conditionalEffects: ConditionalGameplayEffect[];
  applicationTagRequirements: GameplayTagRequirements;
  
  // 스택
  stackingType: StackingType;
  stackLimitCount: number;
  
  // 이벤트
  onApplicationGameplayEffect: GameplayEffectExecutionCalculation;
  onPeriodGameplayEffect: GameplayEffectExecutionCalculation;
  onRemovalGameplayEffect: GameplayEffectExecutionCalculation;
}

// 속성 시스템
class AttributeSet extends GObject {
  protected attributes: Map<string, Attribute>;
  
  // 속성 변경
  preAttributeChange(attribute: Attribute, newValue: number): void;
  postGameplayEffectExecute(data: GameplayEffectModCallbackData): void;
  
  // 속성 접근
  getAttribute(name: string): Attribute;
  setAttributeBaseValue(name: string, value: number): void;
  getAttributeCurrentValue(name: string): number;
}

// 게임플레이 태그
class GameplayTag {
  tagName: string;
  parent?: GameplayTag;
  
  matches(other: GameplayTag): boolean;
  matchesAny(tags: GameplayTag[]): boolean;
  hasTag(tag: GameplayTag): boolean;
}
```

### 1.3 능력 실행 플로우

```typescript
// 예제: 화염구 능력
class FireballAbility extends GameplayAbility {
  constructor() {
    super();
    
    // 태그 설정
    this.abilityTags.addTag("Ability.Spell.Fireball");
    this.blockAbilitiesWithTag.addTag("Ability.Movement");
    
    // 비용 설정 (마나 30)
    this.cost = new GameplayEffect({
      duration: DurationType.Instant,
      modifiers: [{
        attribute: "Mana",
        operation: ModifierOperation.Add,
        magnitude: -30
      }]
    });
    
    // 쿨다운 설정 (5초)
    this.cooldown = new GameplayEffect({
      duration: DurationType.Duration,
      durationMagnitude: 5.0
    });
  }
  
  activateAbility(handle: AbilityHandle, actorInfo: AbilityActorInfo): void {
    // 몽타주 재생
    const task = new PlayMontageAndWaitTask(this, "AM_CastFireball");
    
    task.onCompleted.bind(() => {
      // 발사체 스폰
      this.spawnProjectile(actorInfo);
      this.endAbility(handle, false);
    });
    
    task.onCancelled.bind(() => {
      this.endAbility(handle, true);
    });
    
    task.readyForActivation();
  }
  
  private spawnProjectile(actorInfo: AbilityActorInfo): void {
    const world = actorInfo.owner.getWorld();
    const transform = actorInfo.owner.getActorTransform();
    
    const projectile = world.spawnActor(FireballProjectile, transform);
    projectile.setInstigator(actorInfo.owner);
    projectile.setDamageEffect(this.createDamageEffect());
  }
}
```

## 2. Entity Component System (ECS) & Job System - 유니티 DOTS 스타일

### 2.1 ECS 아키텍처

```typescript
// src/core/engine/ecs/World.ts
class ECSWorld {
  private entities: Map<EntityId, Entity>;
  private componentPools: Map<ComponentType, ComponentPool>;
  private systems: System[];
  private queries: Map<string, Query>;
  
  // 엔티티 관리
  createEntity(): Entity;
  destroyEntity(entity: Entity): void;
  
  // 컴포넌트 관리
  addComponent<T extends IComponentData>(entity: Entity, component: T): void;
  removeComponent<T extends IComponentData>(entity: Entity, type: ComponentType<T>): void;
  getComponent<T extends IComponentData>(entity: Entity, type: ComponentType<T>): T;
  
  // 시스템 관리
  registerSystem(system: System): void;
  update(deltaTime: number): void;
  
  // 쿼리
  query(components: ComponentType[]): Entity[];
}

// 컴포넌트 (순수 데이터)
interface IComponentData {
  // 순수 데이터만, 메서드 없음
}

// 예제 컴포넌트들
struct Position implements IComponentData {
  x: number;
  y: number;
  z: number;
}

struct Velocity implements IComponentData {
  x: number;
  y: number; 
  z: number;
}

struct Health implements IComponentData {
  current: number;
  max: number;
}

// 시스템 (로직)
abstract class System {
  protected world: ECSWorld;
  abstract requiredComponents: ComponentType[];
  
  abstract update(entities: Entity[], deltaTime: number): void;
  
  // Job 시스템 통합
  protected scheduleJob<T extends IJob>(job: T, entities: Entity[]): JobHandle;
}

// 예제 시스템: 이동 시스템
class MovementSystem extends System {
  requiredComponents = [Position, Velocity];
  
  update(entities: Entity[], deltaTime: number): void {
    // Job으로 병렬 처리
    const job = new MovementJob(deltaTime);
    const handle = this.scheduleJob(job, entities);
    handle.complete();
  }
}

// Job System
interface IJob {
  execute(index: number): void;
}

class MovementJob implements IJob {
  deltaTime: number;
  positions: NativeArray<Position>;
  velocities: NativeArray<Velocity>;
  
  constructor(deltaTime: number) {
    this.deltaTime = deltaTime;
  }
  
  execute(index: number): void {
    const pos = this.positions[index];
    const vel = this.velocities[index];
    
    pos.x += vel.x * this.deltaTime;
    pos.y += vel.y * this.deltaTime;
    pos.z += vel.z * this.deltaTime;
  }
}

// Burst 컴파일러 힌트 (웹어셈블리용)
@BurstCompile()
class PhysicsJob implements IJob {
  @ReadOnly positions: NativeArray<Position>;
  @WriteOnly forces: NativeArray<Force>;
  
  execute(index: number): void {
    // 고성능 물리 계산
  }
}
```

### 2.2 Archetype 시스템

```typescript
// 메모리 최적화를 위한 Archetype
class Archetype {
  private componentTypes: Set<ComponentType>;
  private chunks: Chunk[];
  private entityMap: Map<EntityId, ChunkLocation>;
  
  // 청크 기반 메모리 레이아웃
  allocateEntity(): ChunkLocation;
  deallocateEntity(location: ChunkLocation): void;
  
  // 컴포넌트 데이터 접근
  getComponentArray<T>(type: ComponentType<T>): ComponentArray<T>;
}

class Chunk {
  static readonly SIZE = 16384; // 16KB
  private data: ArrayBuffer;
  private count: number;
  private capacity: number;
  
  // 데이터 레이아웃
  // [Entity1_Comp1][Entity1_Comp2]...[Entity2_Comp1][Entity2_Comp2]...
}
```

## 3. 렌더링 파이프라인

### 3.1 언리얼 스타일 렌더링 파이프라인

```typescript
// src/core/engine/rendering/RenderingPipeline.ts
class RenderingPipeline {
  private passes: Map<string, RenderPass>;
  private renderTargets: Map<string, RenderTarget>;
  private postProcessVolumes: PostProcessVolume[];
  
  // 렌더링 패스
  addPass(name: string, pass: RenderPass): void;
  
  // 렌더링 실행
  render(scene: Scene, view: SceneView): void {
    // 1. 섀도우 패스
    this.shadowPass(scene, view);
    
    // 2. Z-Prepass
    this.depthPrepass(scene, view);
    
    // 3. 베이스 패스
    this.basePass(scene, view);
    
    // 4. 라이팅 패스
    this.lightingPass(scene, view);
    
    // 5. 반투명 패스
    this.translucentPass(scene, view);
    
    // 6. 포스트 프로세싱
    this.postProcessPass(scene, view);
  }
}

// 렌더 패스
abstract class RenderPass {
  protected renderTarget?: RenderTarget;
  protected material?: Material;
  
  abstract execute(scene: Scene, view: SceneView): void;
  
  // 렌더 상태 설정
  setRenderState(state: RenderState): void;
  setStencilState(state: StencilState): void;
}

// 머티리얼 시스템
class Material {
  private shaderProgram: ShaderProgram;
  private parameters: Map<string, MaterialParameter>;
  private renderState: RenderState;
  
  // 셰이더 파라미터
  setScalarParameter(name: string, value: number): void;
  setVectorParameter(name: string, value: Vector4): void;
  setTextureParameter(name: string, texture: Texture): void;
  
  // 렌더링
  bind(): void;
  unbind(): void;
}

// 포스트 프로세싱
class PostProcessVolume extends Actor {
  settings: PostProcessSettings;
  priority: number;
  blendRadius: number;
  blendWeight: number;
  
  // 포스트 프로세싱 효과들
  bloom?: BloomSettings;
  colorGrading?: ColorGradingSettings;
  tonemapping?: TonemappingSettings;
  motionBlur?: MotionBlurSettings;
  depthOfField?: DepthOfFieldSettings;
  screenSpaceReflections?: SSRSettings;
}
```

### 3.2 유니티 스타일 Scriptable Render Pipeline

```typescript
// src/core/engine/rendering/ScriptableRenderPipeline.ts
abstract class ScriptableRenderPipeline {
  protected renderer: Renderer;
  
  // 파이프라인 구현
  abstract render(context: ScriptableRenderContext, cameras: Camera[]): void;
  
  // 컬링
  protected cull(camera: Camera, context: ScriptableRenderContext): CullingResults;
  
  // 렌더링 명령
  protected drawRenderers(
    cullingResults: CullingResults, 
    drawingSettings: DrawingSettings,
    filteringSettings: FilteringSettings
  ): void;
}

// Universal Render Pipeline 구현
class UniversalRenderPipeline extends ScriptableRenderPipeline {
  private forwardRenderer: ForwardRenderer;
  private deferredRenderer: DeferredRenderer;
  
  render(context: ScriptableRenderContext, cameras: Camera[]): void {
    for (const camera of cameras) {
      // 카메라별 렌더링
      this.renderCamera(context, camera);
    }
  }
  
  private renderCamera(context: ScriptableRenderContext, camera: Camera): void {
    // 컬링
    const cullingResults = this.cull(camera, context);
    
    // 렌더러 선택
    const renderer = camera.renderingPath === RenderingPath.Forward 
      ? this.forwardRenderer 
      : this.deferredRenderer;
    
    // 렌더링 실행
    renderer.setup(cullingResults, camera);
    renderer.execute(context);
  }
}

// 렌더 피처
abstract class ScriptableRendererFeature {
  abstract create(): void;
  abstract addRenderPasses(renderer: ScriptableRenderer): void;
}

// 예제: SSAO 렌더 피처
class ScreenSpaceAmbientOcclusion extends ScriptableRendererFeature {
  private ssaoPass: SSAOPass;
  
  create(): void {
    this.ssaoPass = new SSAOPass();
  }
  
  addRenderPasses(renderer: ScriptableRenderer): void {
    renderer.enqueuePass(this.ssaoPass);
  }
}
```

## 4. 물리 엔진 통합

### 4.1 물리 추상화 레이어

```typescript
// src/core/engine/physics/PhysicsAbstraction.ts
interface IPhysicsEngine {
  // 월드 관리
  createWorld(gravity: Vector3): PhysicsWorld;
  destroyWorld(world: PhysicsWorld): void;
  
  // 강체
  createRigidBody(desc: RigidBodyDesc): RigidBody;
  destroyRigidBody(body: RigidBody): void;
  
  // 콜라이더
  createCollider(desc: ColliderDesc): Collider;
  attachCollider(body: RigidBody, collider: Collider): void;
  
  // 시뮬레이션
  stepSimulation(world: PhysicsWorld, deltaTime: number): void;
  
  // 쿼리
  raycast(world: PhysicsWorld, ray: Ray, maxDistance: number): RaycastHit;
  overlap(world: PhysicsWorld, shape: Shape, position: Vector3): Collider[];
}

// Rapier 물리 엔진 통합
class RapierPhysicsEngine implements IPhysicsEngine {
  private RAPIER: typeof import('@dimforge/rapier3d');
  
  async initialize(): Promise<void> {
    this.RAPIER = await import('@dimforge/rapier3d');
  }
  
  createWorld(gravity: Vector3): PhysicsWorld {
    const world = new this.RAPIER.World(gravity);
    return new RapierPhysicsWorld(world);
  }
  
  createRigidBody(desc: RigidBodyDesc): RigidBody {
    let rbDesc: RAPIER.RigidBodyDesc;
    
    switch (desc.type) {
      case RigidBodyType.Dynamic:
        rbDesc = this.RAPIER.RigidBodyDesc.dynamic();
        break;
      case RigidBodyType.Kinematic:
        rbDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;
      case RigidBodyType.Static:
        rbDesc = this.RAPIER.RigidBodyDesc.fixed();
        break;
    }
    
    return new RapierRigidBody(rbDesc);
  }
}

// 물리 컴포넌트 통합
class RigidBodyComponent extends SceneComponent {
  private physicsBody?: RigidBody;
  private colliders: Collider[] = [];
  
  // 물리 속성
  mass: number = 1.0;
  drag: number = 0.0;
  angularDrag: number = 0.05;
  useGravity: boolean = true;
  isKinematic: boolean = false;
  
  // 충돌 이벤트
  onCollisionEnter: CollisionDelegate;
  onCollisionStay: CollisionDelegate;
  onCollisionExit: CollisionDelegate;
  
  beginPlay(): void {
    super.beginPlay();
    this.setupPhysicsBody();
  }
  
  private setupPhysicsBody(): void {
    const world = this.getWorld();
    const physicsWorld = world.getSubsystem(PhysicsWorldSubsystem);
    
    const desc = new RigidBodyDesc();
    desc.type = this.isKinematic ? RigidBodyType.Kinematic : RigidBodyType.Dynamic;
    desc.mass = this.mass;
    desc.linearDamping = this.drag;
    desc.angularDamping = this.angularDrag;
    
    this.physicsBody = physicsWorld.createRigidBody(desc);
    this.physicsBody.setTransform(this.getWorldTransform());
  }
}
```

## 5. 에디터 아키텍처

### 5.1 에디터 서브시스템

```typescript
// src/core/engine/editor/EditorSubsystem.ts
class EditorSubsystem extends EngineSubsystem {
  private editorModes: Map<string, IEditorMode>;
  private toolkits: Map<string, IToolkit>;
  private viewports: EditorViewport[];
  private selectedActors: Set<Actor>;
  
  // 에디터 모드
  activateMode(modeName: string): void;
  deactivateMode(): void;
  
  // 선택 시스템
  selectActor(actor: Actor, addToSelection: boolean = false): void;
  deselectActor(actor: Actor): void;
  clearSelection(): void;
  
  // 툴킷
  openToolkit(toolkitName: string, target?: GObject): void;
  closeToolkit(toolkitName: string): void;
  
  // 뷰포트
  createViewport(config: ViewportConfig): EditorViewport;
  
  // Gizmo
  drawTransformGizmo(actor: Actor): void;
}

// 에디터 모드
interface IEditorMode {
  name: string;
  icon: string;
  
  enter(): void;
  exit(): void;
  tick(deltaTime: number): void;
  
  handleClick(hit: HitResult): void;
  handleKey(key: KeyEvent): void;
  
  drawHUD(viewport: EditorViewport): void;
}

// 레벨 에디터 모드
class LevelEditorMode implements IEditorMode {
  name = "LevelEditor";
  private transformTool: TransformTool;
  private selectedActors: Actor[] = [];
  
  enter(): void {
    this.transformTool = new TransformTool();
  }
  
  handleClick(hit: HitResult): void {
    if (hit.actor) {
      EditorSubsystem.get().selectActor(hit.actor);
    }
  }
  
  drawHUD(viewport: EditorViewport): void {
    for (const actor of this.selectedActors) {
      this.transformTool.draw(actor, viewport);
    }
  }
}

// 에디터 툴킷
abstract class AssetEditorToolkit implements IToolkit {
  protected asset: Asset;
  protected viewport?: EditorViewport;
  protected propertyEditor?: PropertyEditor;
  
  abstract getToolkitName(): string;
  abstract createToolkitWidget(): Widget;
  
  // 에셋 편집
  setEditingAsset(asset: Asset): void;
  saveAsset(): void;
  
  // UI 생성
  protected createMenuBar(): MenuBar;
  protected createToolBar(): ToolBar;
}

// 블루프린트 에디터
class BlueprintEditor extends AssetEditorToolkit {
  private blueprint: Blueprint;
  private graphEditor: GraphEditor;
  private compilerResults: CompilerResults;
  
  getToolkitName(): string {
    return "BlueprintEditor";
  }
  
  createToolkitWidget(): Widget {
    return new TabManager([
      { name: "Graph", content: this.createGraphEditor() },
      { name: "Viewport", content: this.createViewport() },
      { name: "Details", content: this.createDetailsPanel() },
      { name: "Compiler", content: this.createCompilerResults() }
    ]);
  }
  
  compile(): void {
    const compiler = new BlueprintCompiler();
    this.compilerResults = compiler.compile(this.blueprint);
    
    if (this.compilerResults.success) {
      this.blueprint.generatedClass = this.compilerResults.generatedClass;
    }
  }
}
```

## 6. 플러그인 시스템

### 6.1 플러그인 아키텍처

```typescript
// src/core/engine/plugins/PluginSystem.ts
interface IPlugin {
  name: string;
  version: string;
  dependencies: string[];
  
  // 플러그인 라이프사이클
  onLoad(): void;
  onEnable(): void;
  onDisable(): void;
  onUnload(): void;
  
  // 모듈 등록
  registerModules(): IModule[];
}

// 플러그인 관리자
class PluginManager {
  private plugins: Map<string, IPlugin>;
  private modules: Map<string, IModule>;
  
  // 플러그인 로딩
  async loadPlugin(path: string): Promise<void> {
    const plugin = await import(path);
    this.validatePlugin(plugin);
    this.registerPlugin(plugin);
  }
  
  // 의존성 해결
  private resolveDependencies(plugin: IPlugin): void {
    for (const dep of plugin.dependencies) {
      if (!this.plugins.has(dep)) {
        throw new Error(`Missing dependency: ${dep}`);
      }
    }
  }
  
  // 모듈 시스템
  getModule<T extends IModule>(moduleName: string): T {
    return this.modules.get(moduleName) as T;
  }
}

// 모듈 인터페이스
interface IModule {
  name: string;
  
  startupModule(): void;
  shutdownModule(): void;
}

// 예제 플러그인: 고급 AI 시스템
class AdvancedAIPlugin implements IPlugin {
  name = "AdvancedAI";
  version = "1.0.0";
  dependencies = ["Core", "Navigation"];
  
  registerModules(): IModule[] {
    return [
      new BehaviorTreeModule(),
      new UtilityAIModule(),
      new GOAPModule(),
      new HTNPlannerModule()
    ];
  }
  
  onEnable(): void {
    // AI 서브시스템 등록
    const world = GEngine.getWorld();
    world.registerSubsystem(AIWorldSubsystem);
  }
}
```

## 7. 메모리 관리 & 최적화

### 7.1 오브젝트 풀링

```typescript
// src/core/engine/memory/ObjectPool.ts
class ObjectPool<T extends IPoolable> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private maxSize: number;
  
  constructor(factory: () => T, initialSize: number = 10, maxSize: number = 100) {
    this.factory = factory;
    this.maxSize = maxSize;
    
    // 초기 오브젝트 생성
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createObject());
    }
  }
  
  acquire(): T {
    let obj: T;
    
    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else if (this.inUse.size < this.maxSize) {
      obj = this.createObject();
    } else {
      throw new Error("Object pool exhausted");
    }
    
    this.inUse.add(obj);
    obj.onAcquire();
    return obj;
  }
  
  release(obj: T): void {
    if (this.inUse.delete(obj)) {
      obj.onRelease();
      this.available.push(obj);
    }
  }
  
  private createObject(): T {
    const obj = this.factory();
    obj.pool = this;
    return obj;
  }
}

// 풀링 가능한 오브젝트
interface IPoolable {
  pool?: ObjectPool<any>;
  onAcquire(): void;
  onRelease(): void;
}

// 예제: 파티클 풀링
class Particle implements IPoolable {
  position: Vector3 = new Vector3();
  velocity: Vector3 = new Vector3();
  lifetime: number = 0;
  
  onAcquire(): void {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.lifetime = 1.0;
  }
  
  onRelease(): void {
    // 정리 작업
  }
}
```

### 7.2 가비지 컬렉션 최적화

```typescript
// src/core/engine/memory/GarbageCollector.ts
class GarbageCollector {
  private objectRegistry: WeakMap<GObject, ObjectMetadata>;
  private pendingKill: Set<GObject>;
  private gcInterval: number = 60; // 프레임
  private frameCounter: number = 0;
  
  // 증분 가비지 컬렉션
  incrementalCollect(maxTime: number = 2): void {
    const startTime = performance.now();
    
    for (const obj of this.pendingKill) {
      if (performance.now() - startTime > maxTime) {
        break;
      }
      
      if (this.canBeCollected(obj)) {
        this.collectObject(obj);
        this.pendingKill.delete(obj);
      }
    }
  }
  
  // 참조 카운팅
  addReference(obj: GObject, referencer: GObject): void {
    const metadata = this.getMetadata(obj);
    metadata.references.add(referencer);
  }
  
  removeReference(obj: GObject, referencer: GObject): void {
    const metadata = this.getMetadata(obj);
    metadata.references.delete(referencer);
    
    if (metadata.references.size === 0) {
      this.markForCollection(obj);
    }
  }
}
```

이 문서는 언리얼 엔진과 유니티의 핵심 시스템들을 웹 환경에 맞게 재구성한 상세 설계입니다. 각 시스템은 모듈화되어 있어 필요에 따라 선택적으로 구현할 수 있습니다. 