# Building Domain Config Classification

## Store Config (유저 설정값)

초기 설정 또는 유저가 설정 페이지에서 변경하는 값들입니다.

```typescript
type BuildingConfig = {
  gridSize: number
  snapToGrid: boolean
  enablePhysics: boolean
  autoSave: boolean
  maxUndoStack: number
  renderDistance: number
  lodEnabled: boolean
  shadows: boolean
  lighting: boolean
  showGrid: boolean
  showBlockOutlines: boolean
  enableCollisionPreview: boolean
  autoSaveInterval: number
  chunkSize: number
  maxBuildHeight: number
  enableMultiselect: boolean
  doubleClickToBuild: boolean
  confirmDestructiveActions: boolean
}
```

**언제 변경되는가:**
- 유저가 Building Settings에서 조정
- 게임 시작 시 초기 설정
- 성능 설정 변경 시
- 디버그 모드 토글 시

**데이터 플로우:**
```
Building Settings UI → Store → Bridge → Core BuildingSystem (1회성 전달)
```

## Constants (절대 불변값)

건축 시스템에서 절대 변하지 않는 상수들입니다.

```typescript
export const BUILDING_CONSTANTS = {
  MIN_GRID_SIZE: 0.1,
  MAX_GRID_SIZE: 10.0,
  MAX_BLOCKS_PER_CHUNK: 4096,
  DEFAULT_CHUNK_SIZE: 16,
  MAX_BUILD_HEIGHT: 256,
  MIN_BUILD_HEIGHT: -64,
  BLOCK_RAYCAST_DISTANCE: 100,
  MAX_UNDO_STACK_SIZE: 1000,
  COLLISION_EPSILON: 0.01,
  MESH_COMBINE_THRESHOLD: 100,
  INSTANCED_MESH_LIMIT: 1000,
  OCTREE_MAX_DEPTH: 8,
  SPATIAL_HASH_CELL_SIZE: 16
} as const
```

**특징:**
- 메모리 한계값
- WebGL 인스턴싱 제약
- 공간 분할 최적화 값

## Realtime State (매 프레임 변화)

Core Layer에서 관리하며 Store에 절대 저장하면 안 되는 값들입니다.

```typescript
type BuildingState = {
  blocks: Map<string, Block>
  chunks: Map<string, Chunk>
  visibleChunks: Set<string>
  selectedBlocks: Set<string>
  hoveredBlock: string | null
  activeTool: BuildingTool
  clipboard: Block[]
  undoStack: BuildAction[]
  redoStack: BuildAction[]
  currentSelection: BoundingBox | null
  buildPreview: Block | null
  toolPreview: THREE.Object3D | null
  spatialGrid: SpatialGrid<Block>
  dirtyChunks: Set<string>
  meshCombineQueue: Set<string>
}

type Block = {
  id: string
  position: THREE.Vector3
  type: BlockType
  rotation: THREE.Euler
  scale: THREE.Vector3
  chunkId: string
  mesh: THREE.Mesh | null
  collider: any
  properties: BlockProperties
  metadata: Record<string, unknown>
  timestamp: number
}

type BuildingMetrics = {
  totalBlocks: number
  visibleBlocks: number
  activeChunks: number
  memoryUsage: number
  renderTime: number
  buildTime: number
  undoStackSize: number
  meshCombineCount: number
}
```

**특징:**
- 매 프레임 또는 사용자 액션마다 업데이트
- 공간 분할 구조에서 관리
- 메시 최적화 큐 관리
- React 상태 관리 절대 금지

## 잘못된 분류 예시

```typescript
// ❌ 잘못된 분류 - 이런 값들이 Store에 있으면 안됨
type WrongConfig = {
  currentBlocks: Block[]              // 실시간 데이터 → Realtime State
  selectedBlocks: string[]            // 실시간 선택 → Realtime State  
  hoveredPosition: THREE.Vector3      // 실시간 상태 → Realtime State
  MAX_BLOCKS: number                  // 절대 불변 → Constants
}
```

## 올바른 구현 패턴

### Config 변경 시 (1회성)
```typescript
// Settings에서 grid size 변경
const updateGridSize = (size: number) => {
  buildingStore.setConfig({ gridSize: size })
}

// Hook에서 감지하여 Core로 전달
useEffect(() => {
  buildingSystem.updateConfig(buildingStore.config)
}, [buildingStore.config.gridSize])

// Core에서 적용
class BuildingSystem {
  updateConfig(config: BuildingConfig) {
    this.gridSize = config.gridSize
    this.snapToGrid = config.snapToGrid
    this.chunkSize = config.chunkSize
    
    if (config.lodEnabled) {
      this.enableLOD()
    }
    
    this.updateGrid()
  }
  
  private updateGrid() {
    this.gridHelper.setSize(this.gridSize)
    this.gridHelper.visible = this.showGrid
  }
}
```

### 실시간 건축 처리 (이벤트 드리븐)
```typescript
// Core Layer - Store 접근 없이 기존 설정값 사용
class BuildingSystem {
  placeBlock(position: THREE.Vector3, blockType: BlockType): Block | null {
    const snappedPosition = this.snapToGrid 
      ? this.snapPositionToGrid(position, this.gridSize)
      : position
    
    if (!this.canPlaceBlockAt(snappedPosition)) {
      return null
    }
    
    const block = this.createBlock(snappedPosition, blockType)
    this.addBlockToChunk(block)
    this.addToUndoStack('place', block)
    
    if (this.enablePhysics) {
      this.createPhysicsBody(block)
    }
    
    this.markChunkDirty(block.chunkId)
    return block
  }
  
  private snapPositionToGrid(position: THREE.Vector3, gridSize: number): THREE.Vector3 {
    return new THREE.Vector3(
      Math.round(position.x / gridSize) * gridSize,
      Math.round(position.y / gridSize) * gridSize,
      Math.round(position.z / gridSize) * gridSize
    )
  }
  
  private addBlockToChunk(block: Block) {
    const chunkKey = this.getChunkKey(block.position, this.chunkSize)
    let chunk = this.chunks.get(chunkKey)
    
    if (!chunk) {
      chunk = this.createChunk(chunkKey)
      this.chunks.set(chunkKey, chunk)
    }
    
    chunk.blocks.set(block.id, block)
    this.blocks.set(block.id, block)
    this.spatialGrid.insert(block, block.position)
  }
}
```

### 청크 기반 렌더링 최적화
```typescript
// Core Layer - 청크 기반 메시 최적화
class ChunkMeshOptimizer {
  optimizeChunk(chunkId: string) {
    const chunk = this.chunks.get(chunkId)
    if (!chunk || chunk.blocks.size === 0) return
    
    if (chunk.blocks.size >= BUILDING_CONSTANTS.MESH_COMBINE_THRESHOLD) {
      this.combineChunkMeshes(chunk)
    } else {
      this.useInstancedMeshes(chunk)
    }
  }
  
  private combineChunkMeshes(chunk: Chunk) {
    const geometries: THREE.BufferGeometry[] = []
    const materials: THREE.Material[] = []
    
    chunk.blocks.forEach(block => {
      if (block.mesh) {
        geometries.push(block.mesh.geometry)
        materials.push(block.mesh.material)
      }
    })
    
    const combinedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
    const combinedMesh = new THREE.Mesh(combinedGeometry, materials[0])
    
    chunk.combinedMesh = combinedMesh
    chunk.isOptimized = true
  }
  
  private useInstancedMeshes(chunk: Chunk) {
    const blocksByType = new Map<BlockType, Block[]>()
    
    chunk.blocks.forEach(block => {
      if (!blocksByType.has(block.type)) {
        blocksByType.set(block.type, [])
      }
      blocksByType.get(block.type)!.push(block)
    })
    
    blocksByType.forEach((blocks, blockType) => {
      const instancedMesh = this.createInstancedMesh(blockType, blocks.length)
      
      blocks.forEach((block, index) => {
        const matrix = new THREE.Matrix4()
        matrix.compose(block.position, new THREE.Quaternion().setFromEuler(block.rotation), block.scale)
        instancedMesh.setMatrixAt(index, matrix)
      })
      
      instancedMesh.instanceMatrix.needsUpdate = true
      chunk.instancedMeshes.set(blockType, instancedMesh)
    })
  }
}
```

### 공간 쿼리 시스템 (성능 최적화)
```typescript
// Core Layer - 공간 분할을 통한 빠른 쿼리
class SpatialGrid<T> {
  private grid = new Map<string, Set<T>>()
  private itemToCell = new Map<T, string>()
  
  insert(item: T, position: THREE.Vector3) {
    const cellKey = this.getCellKey(position)
    
    if (!this.grid.has(cellKey)) {
      this.grid.set(cellKey, new Set())
    }
    
    this.grid.get(cellKey)!.add(item)
    this.itemToCell.set(item, cellKey)
  }
  
  query(bounds: BoundingBox): T[] {
    const results: T[] = []
    const minCell = this.getCellKey(bounds.min)
    const maxCell = this.getCellKey(bounds.max)
    
    const [minX, minY, minZ] = this.parseCellKey(minCell)
    const [maxX, maxY, maxZ] = this.parseCellKey(maxCell)
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const cellKey = `${x}_${y}_${z}`
          const cell = this.grid.get(cellKey)
          
          if (cell) {
            results.push(...Array.from(cell))
          }
        }
      }
    }
    
    return results
  }
  
  private getCellKey(position: THREE.Vector3): string {
    const x = Math.floor(position.x / BUILDING_CONSTANTS.SPATIAL_HASH_CELL_SIZE)
    const y = Math.floor(position.y / BUILDING_CONSTANTS.SPATIAL_HASH_CELL_SIZE)
    const z = Math.floor(position.z / BUILDING_CONSTANTS.SPATIAL_HASH_CELL_SIZE)
    return `${x}_${y}_${z}`
  }
}
```

### 실행 취소/다시 실행 시스템
```typescript
// Core Layer - 메모리 효율적인 실행 취소
class UndoRedoManager {
  private undoStack: BuildAction[] = []
  private redoStack: BuildAction[] = []
  
  executeAction(action: BuildAction) {
    action.execute()
    this.addToUndoStack(action)
    this.redoStack.length = 0
  }
  
  undo(): boolean {
    if (this.undoStack.length === 0) return false
    
    const action = this.undoStack.pop()!
    action.undo()
    this.redoStack.push(action)
    
    return true
  }
  
  redo(): boolean {
    if (this.redoStack.length === 0) return false
    
    const action = this.redoStack.pop()!
    action.execute()
    this.undoStack.push(action)
    
    return true
  }
  
  private addToUndoStack(action: BuildAction) {
    this.undoStack.push(action)
    
    if (this.undoStack.length > this.maxUndoStack) {
      this.undoStack.shift()
    }
  }
}
```

이 분류를 통해 대규모 건축 작업에서도 안정적인 성능과 메모리 효율성을 보장합니다. 