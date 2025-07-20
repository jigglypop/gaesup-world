# Blueprint Domain Config Classification

## Store Config (유저 설정값)

초기 설정 또는 유저가 설정 페이지에서 변경하는 값들입니다.

```typescript
type BlueprintConfig = {
  maxEntitiesPerBlueprint: number
  enableLazyLoading: boolean
  cacheEnabled: boolean
  maxCacheSize: number
  autoSave: boolean
  compressionEnabled: boolean
  validationLevel: 'strict' | 'normal' | 'lenient'
  poolingEnabled: boolean
  maxPoolSize: number
  debugMode: boolean
  showComponentBounds: boolean
  enableVersioning: boolean
  backupEnabled: boolean
  maxBackups: number
  batchSize: number
  loadTimeout: number
  enableHotReload: boolean
  schemaValidation: boolean
}
```

**언제 변경되는가:**
- 유저가 Blueprint Settings에서 조정
- 게임 시작 시 초기 설정
- 개발 모드 토글 시
- 성능 설정 변경 시

**데이터 플로우:**
```
Blueprint Settings UI → Store → Bridge → Core BlueprintSystem (1회성 전달)
```

## Constants (절대 불변값)

블루프린트 시스템에서 절대 변하지 않는 상수들입니다.

```typescript
export const BLUEPRINT_CONSTANTS = {
  MAX_COMPONENT_COUNT: 100,
  MAX_BLUEPRINT_SIZE: 1000000,
  MIN_ENTITY_ID_LENGTH: 8,
  MAX_ENTITY_ID_LENGTH: 64,
  SCHEMA_VERSION: '1.0.0',
  VALIDATION_TIMEOUT: 5000,
  SERIALIZATION_CHUNK_SIZE: 1024,
  MAX_DEPTH_LEVEL: 10,
  COMPONENT_POOL_INITIAL_SIZE: 50,
  ENTITY_POOL_INITIAL_SIZE: 100,
  BLUEPRINT_CACHE_TTL: 300000,
  MAX_CONCURRENT_LOADS: 10,
  JSON_PARSE_MEMORY_LIMIT: 10000000
} as const
```

**특징:**
- JSON 파싱 메모리 제약
- 스키마 버전 관리
- 풀링 시스템 제약

## Realtime State (매 프레임 변화)

Core Layer에서 관리하며 Store에 절대 저장하면 안 되는 값들입니다.

```typescript
type BlueprintState = {
  loadedBlueprints: Map<string, BlueprintEntity>
  entityPool: ObjectPool<BlueprintEntity>
  componentPools: Map<string, ObjectPool<BaseComponent>>
  activeEntities: Set<string>
  pendingLoads: Map<string, Promise<BlueprintEntity>>
  cache: LRUCache<string, BlueprintData>
  validationQueue: ValidationTask[]
  serializationQueue: SerializationTask[]
  loadingProgress: Map<string, number>
  errorLog: BlueprintError[]
  dependencyGraph: DependencyGraph
  hotReloadWatchers: Map<string, FileWatcher>
}

type BlueprintEntity = {
  id: string
  name: string
  version: string
  components: Map<string, BaseComponent>
  children: BlueprintEntity[]
  parent: BlueprintEntity | null
  metadata: BlueprintMetadata
  loadTime: number
  lastModified: number
  isDirty: boolean
  isActive: boolean
  transformMatrix: THREE.Matrix4
}

type BlueprintMetrics = {
  totalBlueprints: number
  loadedEntities: number
  pooledEntities: number
  cacheHitRate: number
  averageLoadTime: number
  memoryUsage: number
  validationTime: number
  serializationTime: number
  errorCount: number
}
```

**특징:**
- 동적 로딩 및 언로딩
- 객체 풀링으로 메모리 최적화
- 파일 시스템 감시
- React 상태 관리 절대 금지

## 잘못된 분류 예시

```typescript
// ❌ 잘못된 분류 - 이런 값들이 Store에 있으면 안됨
type WrongConfig = {
  loadedBlueprints: BlueprintEntity[]  // 실시간 데이터 → Realtime State
  isLoading: boolean                   // 실시간 상태 → Realtime State
  loadingProgress: number              // 실시간 계산 → Realtime State
  SCHEMA_VERSION: string               // 절대 불변 → Constants
}
```

## 올바른 구현 패턴

### Config 변경 시 (1회성)
```typescript
// Settings에서 max cache size 변경
const updateCacheSize = (size: number) => {
  blueprintStore.setConfig({ maxCacheSize: size })
}

// Hook에서 감지하여 Core로 전달
useEffect(() => {
  blueprintSystem.updateConfig(blueprintStore.config)
}, [blueprintStore.config.maxCacheSize])

// Core에서 적용
class BlueprintSystem {
  updateConfig(config: BlueprintConfig) {
    this.maxEntitiesPerBlueprint = config.maxEntitiesPerBlueprint
    this.enableLazyLoading = config.enableLazyLoading
    this.validationLevel = config.validationLevel
    
    if (config.cacheEnabled) {
      this.cache.setMaxSize(config.maxCacheSize)
    }
    
    if (config.poolingEnabled) {
      this.updatePoolSizes(config.maxPoolSize)
    }
  }
  
  private updatePoolSizes(maxSize: number) {
    this.entityPool.setMaxSize(maxSize)
    this.componentPools.forEach(pool => pool.setMaxSize(maxSize))
  }
}
```

### 블루프린트 로딩 시스템 (비동기)
```typescript
// Core Layer - Store 접근 없이 기존 설정값 사용
class BlueprintLoader {
  async loadBlueprint(blueprintId: string): Promise<BlueprintEntity> {
    if (this.pendingLoads.has(blueprintId)) {
      return this.pendingLoads.get(blueprintId)!
    }
    
    const cachedBlueprint = this.cache.get(blueprintId)
    if (cachedBlueprint && this.cacheEnabled) {
      return this.deserializeBlueprint(cachedBlueprint)
    }
    
    const loadPromise = this.performLoad(blueprintId)
    this.pendingLoads.set(blueprintId, loadPromise)
    
    try {
      const blueprint = await loadPromise
      this.loadedBlueprints.set(blueprintId, blueprint)
      
      if (this.cacheEnabled) {
        this.cache.set(blueprintId, this.serializeBlueprint(blueprint))
      }
      
      return blueprint
    } finally {
      this.pendingLoads.delete(blueprintId)
    }
  }
  
  private async performLoad(blueprintId: string): Promise<BlueprintEntity> {
    const blueprintData = await this.fetchBlueprintData(blueprintId)
    
    if (this.schemaValidation) {
      await this.validateSchema(blueprintData)
    }
    
    return this.createBlueprintEntity(blueprintData)
  }
  
  private async validateSchema(data: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Validation timeout'))
      }, this.loadTimeout)
      
      try {
        const isValid = this.schemaValidator.validate(data)
        if (!isValid) {
          reject(new Error('Schema validation failed'))
        } else {
          resolve()
        }
      } finally {
        clearTimeout(timeout)
      }
    })
  }
}
```

### 객체 풀링 시스템 (메모리 최적화)
```typescript
// Core Layer - 엔티티 풀링으로 GC 압박 감소
class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (item: T) => void
  private maxSize: number
  
  constructor(createFn: () => T, resetFn: (item: T) => void, initialSize: number) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = initialSize * 2
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }
  
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    
    return this.createFn()
  }
  
  release(item: T) {
    if (this.pool.length < this.maxSize) {
      this.resetFn(item)
      this.pool.push(item)
    }
  }
  
  clear() {
    this.pool.length = 0
  }
}

class BlueprintEntityFactory {
  private entityPool: ObjectPool<BlueprintEntity>
  private componentPools: Map<string, ObjectPool<BaseComponent>>
  
  constructor() {
    this.entityPool = new ObjectPool(
      () => new BlueprintEntity(),
      (entity) => entity.reset(),
      BLUEPRINT_CONSTANTS.ENTITY_POOL_INITIAL_SIZE
    )
    
    this.componentPools = new Map()
  }
  
  createEntity(blueprintData: BlueprintData): BlueprintEntity {
    const entity = this.entityPool.acquire()
    entity.initialize(blueprintData)
    
    blueprintData.components.forEach(componentData => {
      const component = this.createComponent(componentData.type)
      component.deserialize(componentData)
      entity.addComponent(component)
    })
    
    return entity
  }
  
  destroyEntity(entity: BlueprintEntity) {
    entity.components.forEach(component => {
      this.releaseComponent(component)
    })
    
    this.entityPool.release(entity)
  }
  
  private createComponent(type: string): BaseComponent {
    if (!this.componentPools.has(type)) {
      this.componentPools.set(type, new ObjectPool(
        () => ComponentRegistry.create(type),
        (component) => component.reset(),
        BLUEPRINT_CONSTANTS.COMPONENT_POOL_INITIAL_SIZE
      ))
    }
    
    return this.componentPools.get(type)!.acquire()
  }
  
  private releaseComponent(component: BaseComponent) {
    const pool = this.componentPools.get(component.type)
    if (pool) {
      pool.release(component)
    }
  }
}
```

### 의존성 관리 시스템
```typescript
// Core Layer - 블루프린트 간 의존성 해결
class DependencyGraph {
  private dependencies = new Map<string, Set<string>>()
  private dependents = new Map<string, Set<string>>()
  
  addDependency(blueprintId: string, dependencyId: string) {
    if (!this.dependencies.has(blueprintId)) {
      this.dependencies.set(blueprintId, new Set())
    }
    this.dependencies.get(blueprintId)!.add(dependencyId)
    
    if (!this.dependents.has(dependencyId)) {
      this.dependents.set(dependencyId, new Set())
    }
    this.dependents.get(dependencyId)!.add(blueprintId)
  }
  
  async loadWithDependencies(blueprintId: string): Promise<BlueprintEntity[]> {
    const loadOrder = this.getLoadOrder(blueprintId)
    const loadedBlueprints: BlueprintEntity[] = []
    
    for (const id of loadOrder) {
      if (!this.loadedBlueprints.has(id)) {
        const blueprint = await this.loadBlueprint(id)
        loadedBlueprints.push(blueprint)
      }
    }
    
    return loadedBlueprints
  }
  
  private getLoadOrder(blueprintId: string): string[] {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const result: string[] = []
    
    const visit = (id: string) => {
      if (visiting.has(id)) {
        throw new Error(`Circular dependency detected: ${id}`)
      }
      
      if (visited.has(id)) return
      
      visiting.add(id)
      
      const deps = this.dependencies.get(id) || new Set()
      deps.forEach(depId => visit(depId))
      
      visiting.delete(id)
      visited.add(id)
      result.push(id)
    }
    
    visit(blueprintId)
    return result
  }
}
```

### 핫 리로드 시스템 (개발 모드)
```typescript
// Core Layer - 파일 변경 감지 및 자동 리로드
class HotReloadManager {
  private watchers = new Map<string, FileWatcher>()
  
  watchBlueprint(blueprintId: string, filePath: string) {
    if (!this.enableHotReload) return
    
    const watcher = new FileWatcher(filePath)
    watcher.onChange = async () => {
      try {
        await this.reloadBlueprint(blueprintId)
        console.log(`Hot reloaded blueprint: ${blueprintId}`)
      } catch (error) {
        console.error(`Failed to hot reload blueprint ${blueprintId}:`, error)
      }
    }
    
    this.watchers.set(blueprintId, watcher)
  }
  
  private async reloadBlueprint(blueprintId: string) {
    const existingBlueprint = this.loadedBlueprints.get(blueprintId)
    if (!existingBlueprint) return
    
    this.cache.delete(blueprintId)
    
    const newBlueprint = await this.loadBlueprint(blueprintId)
    
    this.transferState(existingBlueprint, newBlueprint)
    
    this.loadedBlueprints.set(blueprintId, newBlueprint)
    this.destroyEntity(existingBlueprint)
  }
  
  private transferState(oldEntity: BlueprintEntity, newEntity: BlueprintEntity) {
    newEntity.transformMatrix.copy(oldEntity.transformMatrix)
    newEntity.isActive = oldEntity.isActive
    
    oldEntity.components.forEach((oldComponent, type) => {
      const newComponent = newEntity.getComponent(type)
      if (newComponent && oldComponent.canTransferState) {
        newComponent.transferStateFrom(oldComponent)
      }
    })
  }
}
```

이 분류를 통해 복잡한 블루프린트 시스템에서도 높은 성능과 메모리 효율성을 보장합니다. 