# Building Domain API Reference

## 개요

Building Domain은 **실시간 건축 시스템, 블록 배치, 구조물 관리, 건축 도구**를 제공하는 도메인입니다. 마인크래프트 스타일의 블록 기반 건축부터 고급 구조물 설계까지 다양한 건축 기능을 지원하며, 물리 시뮬레이션과 통합된 건축 시스템을 제공합니다.

**경로**: `src/core/building/`

## 핵심 시스템

### BuildingBridge

건축 시스템의 메인 브릿지입니다.

```typescript
@DomainBridge('building')
@EnableEventLog()
class BuildingBridge extends CoreBridge<
  BuildingSystem,
  BuildingSnapshot,
  BuildingCommand
> {
  constructor()
  
  // 건축 시스템 생성
  protected buildEngine(id: string, config: BuildingConfig): BuildingSystem | null
  
  // 명령 실행
  protected executeCommand(system: BuildingSystem, command: BuildingCommand, id: string): void
  
  // 상태 스냅샷
  protected createSnapshot(system: BuildingSystem, id: string): BuildingSnapshot | null
  
  // 블록 관리
  placeBlock(position: THREE.Vector3, blockType: BlockType): void
  removeBlock(position: THREE.Vector3): void
  getBlock(position: THREE.Vector3): Block | null
  
  // 구조물 관리
  saveStructure(name: string, bounds: BoundingBox): void
  loadStructure(name: string, position: THREE.Vector3): void
  
  // 그리드 관리
  setGridSize(size: number): void
  getGridSize(): number
  enableSnap(enabled: boolean): void
}
```

### BuildingSystem

개별 건축 시스템을 관리하는 클래스입니다.

```typescript
class BuildingSystem {
  constructor(config: BuildingConfig)
  
  // 블록 관리
  placeBlock(position: THREE.Vector3, blockType: BlockType): Block | null
  removeBlock(position: THREE.Vector3): boolean
  getBlock(position: THREE.Vector3): Block | null
  getBlocksInArea(bounds: BoundingBox): Block[]
  
  // 도구 관리
  setActiveTool(tool: BuildingTool): void
  getActiveTool(): BuildingTool | null
  
  // 재료 관리
  addMaterial(material: BuildingMaterial, quantity: number): void
  removeMaterial(material: BuildingMaterial, quantity: number): boolean
  getMaterialCount(material: BuildingMaterial): number
  
  // 선택 영역
  setSelection(start: THREE.Vector3, end: THREE.Vector3): void
  getSelection(): BoundingBox | null
  clearSelection(): void
  
  // 실행 취소/다시 실행
  undo(): boolean
  redo(): boolean
  canUndo(): boolean
  canRedo(): boolean
  
  // 구조물 관리
  saveStructure(name: string): StructureData
  loadStructure(data: StructureData, position: THREE.Vector3): void
  
  // 설정
  updateConfig(config: Partial<BuildingConfig>): void
  getConfig(): BuildingConfig
  
  // 상태 조회
  getState(): BuildingSystemState
  getMetrics(): BuildingSystemMetrics
  
  // 생명주기
  update(deltaTime: number): void
  dispose(): void
}
```

## Hook APIs

### useBuildingSystem

**메인 Building 훅** - 건축 시스템과 연동합니다.

```typescript
function useBuildingSystem(config?: Partial<BuildingConfig>): UseBuildingSystemResult

interface UseBuildingSystemResult {
  system: BuildingSystem | null
  placeBlock: (position: THREE.Vector3, blockType: BlockType) => void
  removeBlock: (position: THREE.Vector3) => void
  setActiveTool: (tool: BuildingTool) => void
  activeTool: BuildingTool | null
  selectedArea: BoundingBox | null
  setSelection: (start: THREE.Vector3, end: THREE.Vector3) => void
  clearSelection: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  materials: Record<BuildingMaterial, number>
  addMaterial: (material: BuildingMaterial, quantity: number) => void
}
```

**사용 예제**:
```typescript
function BuildingInterface() {
  const {
    placeBlock,
    removeBlock,
    setActiveTool,
    activeTool,
    setSelection,
    undo,
    redo,
    canUndo,
    canRedo,
    materials
  } = useBuildingSystem({
    gridSize: 1,
    snapToGrid: true,
    enablePhysics: true
  })
  
  const handleBlockPlace = (position: THREE.Vector3) => {
    placeBlock(position, 'stone')
  }
  
  const handleToolChange = (tool: BuildingTool) => {
    setActiveTool(tool)
  }
  
  return (
    <div>
      <div>Active Tool: {activeTool}</div>
      
      <div>
        <button onClick={() => handleToolChange('place')}>Place</button>
        <button onClick={() => handleToolChange('remove')}>Remove</button>
        <button onClick={() => handleToolChange('select')}>Select</button>
        <button onClick={() => handleToolChange('paint')}>Paint</button>
      </div>
      
      <div>
        <button onClick={undo} disabled={!canUndo}>Undo</button>
        <button onClick={redo} disabled={!canRedo}>Redo</button>
      </div>
      
      <div>
        Materials:
        {Object.entries(materials).map(([material, count]) => (
          <div key={material}>{material}: {count}</div>
        ))}
      </div>
    </div>
  )
}
```

### useBlockInteraction

블록과의 상호작용을 처리하는 훅입니다.

```typescript
function useBlockInteraction(): UseBlockInteractionResult

interface UseBlockInteractionResult {
  hoveredBlock: THREE.Vector3 | null
  selectedBlocks: THREE.Vector3[]
  raycast: (origin: THREE.Vector3, direction: THREE.Vector3) => THREE.Vector3 | null
  selectBlock: (position: THREE.Vector3, multi?: boolean) => void
  clearSelection: () => void
}
```

### useGridHelper

그리드 헬퍼 시스템을 관리하는 훅입니다.

```typescript
function useGridHelper(config: GridConfig): UseGridHelperResult

interface UseGridHelperResult {
  gridRef: RefObject<THREE.GridHelper>
  snapToGrid: (position: THREE.Vector3) => THREE.Vector3
  setGridSize: (size: number) => void
  setGridVisible: (visible: boolean) => void
  gridSize: number
  isVisible: boolean
}
```

## 컴포넌트 APIs

### BuildingController

건축 제어 UI 컴포넌트입니다.

```typescript
function BuildingController(): JSX.Element
```

**기능**:
- 건축 도구 선택
- 블록 타입 선택
- 재료 인벤토리 표시
- 실행 취소/다시 실행 버튼

### BuildingSystem 컴포넌트

3D 건축 시스템 렌더링 컴포넌트입니다.

```typescript
function BuildingSystem(props: BuildingSystemProps): JSX.Element

interface BuildingSystemProps {
  config?: Partial<BuildingConfig>
  onBlockPlace?: (position: THREE.Vector3, blockType: BlockType) => void
  onBlockRemove?: (position: THREE.Vector3) => void
  children?: React.ReactNode
}
```

### GridHelper

3D 그리드 표시 컴포넌트입니다.

```typescript
function GridHelper(props: GridHelperProps): JSX.Element

interface GridHelperProps {
  size?: number
  divisions?: number
  color?: string
  visible?: boolean
  position?: THREE.Vector3
}
```

### BuildingUI

건축 인터페이스 UI 컴포넌트입니다.

```typescript
function BuildingUI(): JSX.Element
```

**기능**:
- 도구 팔레트
- 블록 선택기
- 재료 인벤토리
- 구조물 브라우저

## 타입 정의

### BlockType

사용 가능한 블록 타입입니다.

```typescript
type BlockType = 
  | 'stone' 
  | 'wood' 
  | 'brick' 
  | 'glass' 
  | 'metal' 
  | 'concrete' 
  | 'dirt' 
  | 'grass' 
  | 'sand' 
  | 'water'
```

### BuildingTool

건축 도구 타입입니다.

```typescript
type BuildingTool = 
  | 'place' 
  | 'remove' 
  | 'select' 
  | 'paint' 
  | 'copy' 
  | 'paste' 
  | 'fill' 
  | 'line' 
  | 'rectangle' 
  | 'circle'
```

### BuildingMaterial

건축 재료 타입입니다.

```typescript
type BuildingMaterial = 
  | 'stone' 
  | 'wood' 
  | 'brick' 
  | 'glass' 
  | 'metal' 
  | 'concrete'
```

### Block

개별 블록의 정의입니다.

```typescript
interface Block {
  id: string
  position: THREE.Vector3
  type: BlockType
  rotation: THREE.Euler
  scale: THREE.Vector3
  properties: BlockProperties
  metadata: Record<string, any>
  timestamp: number
}

interface BlockProperties {
  solid: boolean
  transparent: boolean
  flammable: boolean
  durability: number
  hardness: number
  resistance: number
}
```

### BuildingCommand

건축 시스템에 전송되는 명령입니다.

```typescript
interface BuildingCommand {
  type: 'place' | 'remove' | 'select' | 'paint' | 'copy' | 'paste' | 'fill' | 'undo' | 'redo'
  data?: {
    position?: THREE.Vector3
    blockType?: BlockType
    area?: BoundingBox
    blocks?: Block[]
    tool?: BuildingTool
  }
}
```

### BuildingSnapshot

건축 시스템의 현재 상태 스냅샷입니다.

```typescript
interface BuildingSnapshot {
  blocks: Block[]
  activeTool: BuildingTool | null
  selectedArea: BoundingBox | null
  materials: Record<BuildingMaterial, number>
  config: BuildingConfig
  undoStack: number
  redoStack: number
  metrics: {
    blockCount: number
    memoryUsage: number
    renderTime: number
    lastUpdate: number
  }
}
```

### BuildingConfig

건축 시스템 설정입니다.

```typescript
interface BuildingConfig {
  gridSize: number
  snapToGrid: boolean
  enablePhysics: boolean
  autoSave: boolean
  maxUndoStack: number
  renderDistance: number
  lodEnabled: boolean
  shadows: boolean
  lighting: boolean
  materials: {
    [key in BuildingMaterial]: MaterialConfig
  }
}

interface MaterialConfig {
  texture: string
  color: string
  roughness: number
  metalness: number
  transparent: boolean
  opacity: number
}
```

### BoundingBox

3D 경계 상자 정의입니다.

```typescript
interface BoundingBox {
  min: THREE.Vector3
  max: THREE.Vector3
}
```

### StructureData

저장된 구조물 데이터입니다.

```typescript
interface StructureData {
  name: string
  blocks: Block[]
  bounds: BoundingBox
  metadata: {
    created: number
    modified: number
    author: string
    description: string
    tags: string[]
  }
}
```

## 건축 도구 시스템

### PlaceTool

블록 배치 도구입니다.

```typescript
class PlaceTool implements IBuildingTool {
  name = 'place'
  
  onMouseDown(position: THREE.Vector3, system: BuildingSystem): void
  onMouseMove(position: THREE.Vector3, system: BuildingSystem): void
  onMouseUp(position: THREE.Vector3, system: BuildingSystem): void
  
  getPreview(position: THREE.Vector3): THREE.Object3D
  canUse(position: THREE.Vector3, system: BuildingSystem): boolean
}
```

### RemoveTool

블록 제거 도구입니다.

```typescript
class RemoveTool implements IBuildingTool {
  name = 'remove'
  
  onMouseDown(position: THREE.Vector3, system: BuildingSystem): void
  getPreview(position: THREE.Vector3): THREE.Object3D
}
```

### SelectTool

영역 선택 도구입니다.

```typescript
class SelectTool implements IBuildingTool {
  name = 'select'
  
  private startPosition: THREE.Vector3 | null = null
  
  onMouseDown(position: THREE.Vector3, system: BuildingSystem): void
  onMouseMove(position: THREE.Vector3, system: BuildingSystem): void
  onMouseUp(position: THREE.Vector3, system: BuildingSystem): void
  
  getSelectionPreview(start: THREE.Vector3, end: THREE.Vector3): THREE.Object3D
}
```

### FillTool

영역 채우기 도구입니다.

```typescript
class FillTool implements IBuildingTool {
  name = 'fill'
  
  onMouseDown(position: THREE.Vector3, system: BuildingSystem): void
  
  private floodFill(
    startPosition: THREE.Vector3, 
    blockType: BlockType, 
    system: BuildingSystem,
    maxBlocks: number = 1000
  ): Block[]
}
```

## 고급 사용법

### 커스텀 블록 타입 생성

```typescript
function useCustomBlocks() {
  const [customBlocks, setCustomBlocks] = useState<Map<string, CustomBlockType>>(new Map())
  
  const registerBlock = useCallback((
    id: string,
    config: CustomBlockConfig
  ) => {
    const blockType: CustomBlockType = {
      id,
      geometry: config.geometry || new THREE.BoxGeometry(1, 1, 1),
      material: config.material || new THREE.MeshStandardMaterial({ color: config.color }),
      properties: {
        solid: config.solid ?? true,
        transparent: config.transparent ?? false,
        flammable: config.flammable ?? false,
        durability: config.durability ?? 100,
        hardness: config.hardness ?? 1,
        resistance: config.resistance ?? 1
      }
    }
    
    setCustomBlocks(prev => new Map(prev).set(id, blockType))
  }, [])
  
  const getBlockType = useCallback((id: string): CustomBlockType | null => {
    return customBlocks.get(id) || null
  }, [customBlocks])
  
  return {
    registerBlock,
    getBlockType,
    customBlocks: Array.from(customBlocks.values())
  }
}

interface CustomBlockConfig {
  geometry?: THREE.BufferGeometry
  material?: THREE.Material
  color?: string
  solid?: boolean
  transparent?: boolean
  flammable?: boolean
  durability?: number
  hardness?: number
  resistance?: number
}

interface CustomBlockType {
  id: string
  geometry: THREE.BufferGeometry
  material: THREE.Material
  properties: BlockProperties
}
```

### 구조물 템플릿 시스템

```typescript
function useStructureTemplates() {
  const [templates, setTemplates] = useState<Map<string, StructureTemplate>>(new Map())
  
  const createTemplate = useCallback((
    name: string,
    generator: (config: any) => Block[]
  ) => {
    const template: StructureTemplate = {
      name,
      generator,
      category: 'custom',
      parameters: []
    }
    
    setTemplates(prev => new Map(prev).set(name, template))
  }, [])
  
  const generateStructure = useCallback((
    templateName: string,
    position: THREE.Vector3,
    config: any = {}
  ): Block[] => {
    const template = templates.get(templateName)
    if (!template) return []
    
    const blocks = template.generator(config)
    
    // 위치 오프셋 적용
    return blocks.map(block => ({
      ...block,
      position: block.position.clone().add(position)
    }))
  }, [templates])
  
  // 기본 템플릿들
  useEffect(() => {
    // 집 템플릿
    createTemplate('house', (config) => {
      const { width = 5, height = 3, depth = 5 } = config
      const blocks: Block[] = []
      
      // 바닥
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          blocks.push({
            id: `floor_${x}_${z}`,
            position: new THREE.Vector3(x, 0, z),
            type: 'wood',
            rotation: new THREE.Euler(),
            scale: new THREE.Vector3(1, 1, 1),
            properties: defaultBlockProperties,
            metadata: {},
            timestamp: Date.now()
          })
        }
      }
      
      // 벽
      for (let y = 1; y <= height; y++) {
        // 앞뒤 벽
        for (let x = 0; x < width; x++) {
          if (y === 1 && x === Math.floor(width / 2)) continue // 문
          
          blocks.push({
            id: `wall_front_${x}_${y}`,
            position: new THREE.Vector3(x, y, 0),
            type: 'stone',
            rotation: new THREE.Euler(),
            scale: new THREE.Vector3(1, 1, 1),
            properties: defaultBlockProperties,
            metadata: {},
            timestamp: Date.now()
          })
          
          blocks.push({
            id: `wall_back_${x}_${y}`,
            position: new THREE.Vector3(x, y, depth - 1),
            type: 'stone',
            rotation: new THREE.Euler(),
            scale: new THREE.Vector3(1, 1, 1),
            properties: defaultBlockProperties,
            metadata: {},
            timestamp: Date.now()
          })
        }
        
        // 좌우 벽
        for (let z = 1; z < depth - 1; z++) {
          blocks.push({
            id: `wall_left_${z}_${y}`,
            position: new THREE.Vector3(0, y, z),
            type: 'stone',
            rotation: new THREE.Euler(),
            scale: new THREE.Vector3(1, 1, 1),
            properties: defaultBlockProperties,
            metadata: {},
            timestamp: Date.now()
          })
          
          blocks.push({
            id: `wall_right_${z}_${y}`,
            position: new THREE.Vector3(width - 1, y, z),
            type: 'stone',
            rotation: new THREE.Euler(),
            scale: new THREE.Vector3(1, 1, 1),
            properties: defaultBlockProperties,
            metadata: {},
            timestamp: Date.now()
          })
        }
      }
      
      // 지붕
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          blocks.push({
            id: `roof_${x}_${z}`,
            position: new THREE.Vector3(x, height + 1, z),
            type: 'wood',
            rotation: new THREE.Euler(),
            scale: new THREE.Vector3(1, 1, 1),
            properties: defaultBlockProperties,
            metadata: {},
            timestamp: Date.now()
          })
        }
      }
      
      return blocks
    })
    
    // 타워 템플릿
    createTemplate('tower', (config) => {
      const { height = 10, radius = 3 } = config
      const blocks: Block[] = []
      
      for (let y = 0; y < height; y++) {
        for (let x = -radius; x <= radius; x++) {
          for (let z = -radius; z <= radius; z++) {
            const distance = Math.sqrt(x * x + z * z)
            if (distance <= radius && (distance >= radius - 1 || y === 0)) {
              blocks.push({
                id: `tower_${x}_${y}_${z}`,
                position: new THREE.Vector3(x, y, z),
                type: 'stone',
                rotation: new THREE.Euler(),
                scale: new THREE.Vector3(1, 1, 1),
                properties: defaultBlockProperties,
                metadata: {},
                timestamp: Date.now()
              })
            }
          }
        }
      }
      
      return blocks
    })
  }, [createTemplate])
  
  return {
    templates: Array.from(templates.values()),
    generateStructure,
    createTemplate
  }
}

interface StructureTemplate {
  name: string
  generator: (config: any) => Block[]
  category: string
  parameters: TemplateParameter[]
}

interface TemplateParameter {
  name: string
  type: 'number' | 'string' | 'boolean'
  default: any
  min?: number
  max?: number
}
```

### 물리 통합 건축

```typescript
function usePhysicsBuilding() {
  const { placeBlock, removeBlock } = useBuildingSystem({
    enablePhysics: true
  })
  
  const placePhysicsBlock = useCallback((
    position: THREE.Vector3,
    blockType: BlockType,
    physics: {
      mass?: number
      friction?: number
      restitution?: number
      kinematic?: boolean
    } = {}
  ) => {
    const block = placeBlock(position, blockType)
    
    if (block) {
      // 물리 속성 적용
      const physicsProps = {
        mass: physics.mass ?? 1,
        friction: physics.friction ?? 0.7,
        restitution: physics.restitution ?? 0.3,
        kinematic: physics.kinematic ?? false
      }
      
      // 물리 시스템에 등록
      registerPhysicsBlock(block, physicsProps)
    }
    
    return block
  }, [placeBlock])
  
  const createPhysicsStructure = useCallback((
    blocks: Block[],
    basePosition: THREE.Vector3
  ) => {
    blocks.forEach((block, index) => {
      setTimeout(() => {
        const worldPosition = block.position.clone().add(basePosition)
        placePhysicsBlock(worldPosition, block.type, {
          mass: 1,
          kinematic: index === 0 // 첫 번째 블록은 고정
        })
      }, index * 100) // 순차적 배치
    })
  }, [placePhysicsBlock])
  
  return {
    placePhysicsBlock,
    createPhysicsStructure
  }
}

function registerPhysicsBlock(block: Block, physics: any) {
  // 물리 시스템과 연동하는 로직
  const motionBridge = BridgeFactory.get('motion')
  if (motionBridge) {
    motionBridge.execute(block.id, {
      type: 'addPhysicsBody',
      data: {
        position: block.position,
        mass: physics.mass,
        friction: physics.friction,
        restitution: physics.restitution,
        kinematic: physics.kinematic
      }
    })
  }
}
```

### 자동 건축 시스템

```typescript
function useAutoBuild() {
  const { placeBlock } = useBuildingSystem()
  
  const buildAsync = useCallback(async (
    blocks: Block[],
    basePosition: THREE.Vector3,
    options: {
      delay?: number
      batchSize?: number
      onProgress?: (progress: number) => void
    } = {}
  ) => {
    const { delay = 50, batchSize = 10, onProgress } = options
    
    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize)
      
      // 배치 단위로 블록 배치
      batch.forEach(block => {
        const worldPosition = block.position.clone().add(basePosition)
        placeBlock(worldPosition, block.type)
      })
      
      // 진행률 업데이트
      if (onProgress) {
        onProgress((i + batch.length) / blocks.length)
      }
      
      // 다음 배치까지 대기
      if (i + batchSize < blocks.length) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }, [placeBlock])
  
  const buildAnimated = useCallback((
    blocks: Block[],
    basePosition: THREE.Vector3,
    animationType: 'sequential' | 'radial' | 'random' = 'sequential'
  ) => {
    let sortedBlocks = [...blocks]
    
    switch (animationType) {
      case 'radial':
        const center = basePosition.clone()
        sortedBlocks.sort((a, b) => 
          a.position.distanceTo(center) - b.position.distanceTo(center)
        )
        break
        
      case 'random':
        for (let i = sortedBlocks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[sortedBlocks[i], sortedBlocks[j]] = [sortedBlocks[j], sortedBlocks[i]]
        }
        break
        
      case 'sequential':
      default:
        // 기본 순서 유지
        break
    }
    
    return buildAsync(sortedBlocks, basePosition, { delay: 100 })
  }, [buildAsync])
  
  return {
    buildAsync,
    buildAnimated
  }
}
```

## 성능 최적화

### 1. 청크 기반 렌더링

```typescript
function useChunkedBuilding(chunkSize: number = 16) {
  const [chunks, setChunks] = useState<Map<string, Chunk>>(new Map())
  const [visibleChunks, setVisibleChunks] = useState<Set<string>>(new Set())
  
  const getChunkKey = useCallback((position: THREE.Vector3): string => {
    const chunkX = Math.floor(position.x / chunkSize)
    const chunkZ = Math.floor(position.z / chunkSize)
    return `${chunkX}_${chunkZ}`
  }, [chunkSize])
  
  const addBlockToChunk = useCallback((block: Block) => {
    const chunkKey = getChunkKey(block.position)
    
    setChunks(prev => {
      const newChunks = new Map(prev)
      const chunk = newChunks.get(chunkKey) || createChunk(chunkKey)
      chunk.blocks.set(block.id, block)
      newChunks.set(chunkKey, chunk)
      return newChunks
    })
  }, [getChunkKey])
  
  const removeBlockFromChunk = useCallback((position: THREE.Vector3, blockId: string) => {
    const chunkKey = getChunkKey(position)
    
    setChunks(prev => {
      const newChunks = new Map(prev)
      const chunk = newChunks.get(chunkKey)
      if (chunk) {
        chunk.blocks.delete(blockId)
        if (chunk.blocks.size === 0) {
          newChunks.delete(chunkKey)
        } else {
          newChunks.set(chunkKey, chunk)
        }
      }
      return newChunks
    })
  }, [getChunkKey])
  
  const updateVisibility = useCallback((cameraPosition: THREE.Vector3, renderDistance: number) => {
    const visibleChunkKeys = new Set<string>()
    
    const chunkRadius = Math.ceil(renderDistance / chunkSize)
    const cameraChunk = getChunkKey(cameraPosition)
    const [centerX, centerZ] = cameraChunk.split('_').map(Number)
    
    for (let x = centerX - chunkRadius; x <= centerX + chunkRadius; x++) {
      for (let z = centerZ - chunkRadius; z <= centerZ + chunkRadius; z++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (z - centerZ) ** 2)
        if (distance <= chunkRadius) {
          visibleChunkKeys.add(`${x}_${z}`)
        }
      }
    }
    
    setVisibleChunks(visibleChunkKeys)
  }, [chunkSize, getChunkKey])
  
  return {
    chunks,
    visibleChunks,
    addBlockToChunk,
    removeBlockFromChunk,
    updateVisibility
  }
}

interface Chunk {
  key: string
  blocks: Map<string, Block>
  mesh?: THREE.InstancedMesh
  needsUpdate: boolean
}

function createChunk(key: string): Chunk {
  return {
    key,
    blocks: new Map(),
    needsUpdate: true
  }
}
```

### 2. 인스턴스드 렌더링

```typescript
function useInstancedBlocks() {
  const instancedMeshes = useRef<Map<BlockType, THREE.InstancedMesh>>(new Map())
  const instanceData = useRef<Map<BlockType, InstanceData[]>>(new Map())
  
  const updateInstances = useCallback((blocks: Block[]) => {
    // 블록 타입별로 그룹화
    const blocksByType = new Map<BlockType, Block[]>()
    
    blocks.forEach(block => {
      if (!blocksByType.has(block.type)) {
        blocksByType.set(block.type, [])
      }
      blocksByType.get(block.type)!.push(block)
    })
    
    // 각 타입별로 인스턴스드 메시 업데이트
    blocksByType.forEach((typeBlocks, blockType) => {
      let instancedMesh = instancedMeshes.current.get(blockType)
      
      if (!instancedMesh) {
        const geometry = getBlockGeometry(blockType)
        const material = getBlockMaterial(blockType)
        instancedMesh = new THREE.InstancedMesh(geometry, material, typeBlocks.length)
        instancedMeshes.current.set(blockType, instancedMesh)
      }
      
      // 인스턴스 매트릭스 업데이트
      typeBlocks.forEach((block, index) => {
        const matrix = new THREE.Matrix4()
        matrix.compose(block.position, new THREE.Quaternion().setFromEuler(block.rotation), block.scale)
        instancedMesh!.setMatrixAt(index, matrix)
      })
      
      instancedMesh.instanceMatrix.needsUpdate = true
    })
  }, [])
  
  return {
    instancedMeshes: instancedMeshes.current,
    updateInstances
  }
}

interface InstanceData {
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: THREE.Vector3
}

function getBlockGeometry(blockType: BlockType): THREE.BufferGeometry {
  // 블록 타입에 따른 지오메트리 반환
  switch (blockType) {
    case 'stone':
    case 'wood':
    case 'brick':
    default:
      return new THREE.BoxGeometry(1, 1, 1)
  }
}

function getBlockMaterial(blockType: BlockType): THREE.Material {
  // 블록 타입에 따른 재질 반환
  const materialConfigs = {
    stone: { color: 0x808080 },
    wood: { color: 0x8B4513 },
    brick: { color: 0xB22222 },
    glass: { color: 0x87CEEB, transparent: true, opacity: 0.7 },
    metal: { color: 0xC0C0C0, metalness: 0.8 },
    concrete: { color: 0x696969 }
  }
  
  const config = materialConfigs[blockType as keyof typeof materialConfigs] || { color: 0xFFFFFF }
  return new THREE.MeshStandardMaterial(config)
}
```

## 디버깅 도구

### 건축 상태 모니터

```typescript
function BuildingDebugPanel() {
  const [buildingState, setBuildingState] = useState<any>()
  const { system } = useBuildingSystem()
  
  useEffect(() => {
    if (!system) return
    
    const interval = setInterval(() => {
      setBuildingState({
        blockCount: system.getState().blockCount,
        activeTool: system.getActiveTool(),
        materials: system.getState().materials,
        memory: system.getMetrics().memoryUsage,
        renderTime: system.getMetrics().renderTime
      })
    }, 100)
    
    return () => clearInterval(interval)
  }, [system])
  
  if (!buildingState) return null
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: 10,
      fontFamily: 'monospace'
    }}>
      <h3>Building Debug</h3>
      <div>Blocks: {buildingState.blockCount}</div>
      <div>Tool: {buildingState.activeTool}</div>
      <div>Memory: {(buildingState.memory / 1024 / 1024).toFixed(2)} MB</div>
      <div>Render: {buildingState.renderTime.toFixed(2)}ms</div>
      
      <h4>Materials:</h4>
      {Object.entries(buildingState.materials || {}).map(([material, count]) => (
        <div key={material}>{material}: {count as number}</div>
      ))}
    </div>
  )
}
```

이 API 가이드는 Building Domain의 모든 기능을 상세히 다루며, 기본 블록 건축부터 복잡한 구조물 생성 시스템까지 완전한 건축 시스템을 구축할 수 있는 레퍼런스를 제공합니다. 