# Building System Settings

> 언리얼 엔진의 Construction Script와 유니티의 ProBuilder를 참고한 건축 시스템 설정

## Core Settings

### Construction Settings
```typescript
interface ConstructionSettings {
  // Grid Settings (유니티: ProBuilder Grid)
  gridSize: number;                 // 기본: 100 (Grid Unit Size)
  snapToGrid: boolean;              // 그리드 스냅 활성화
  showGrid: boolean;                // 그리드 표시
  gridOpacity: number;              // 기본: 0.3 (그리드 투명도)
  
  // Snap Settings
  snapDistance: number;             // 기본: 10 (Snap Distance)
  enableVertexSnap: boolean;        // 버텍스 스냅
  enableEdgeSnap: boolean;          // 엣지 스냅
  enableFaceSnap: boolean;          // 면 스냅
  
  // Precision
  positionPrecision: number;        // 기본: 0.01 (Position Precision)
  rotationPrecision: number;        // 기본: 1.0 (degrees)
  scalePrecision: number;           // 기본: 0.01 (Scale Precision)
}
```

### Material Settings (언리얼: Material Instance)
```typescript
interface BuildingMaterialSettings {
  // Rendering
  defaultMaterial: 'standard' | 'glass' | 'metal' | 'wood' | 'concrete';
  enablePBR: boolean;               // PBR 렌더링 활성화
  textureResolution: 'low' | 'medium' | 'high' | 'ultra';
  
  // Lighting
  receiveShadows: boolean;          // 그림자 받기
  castShadows: boolean;             // 그림자 투사
  enableEmission: boolean;          // 발광 활성화
  
  // Performance
  enableLOD: boolean;               // LOD 활성화
  lodDistance: number;              // 기본: 100 (LOD Distance)
  occlusionCulling: boolean;        // 오클루전 컬링
}
```

### Building Tools Settings
```typescript
interface BuildingToolSettings {
  // Tool Modes
  defaultTool: 'wall' | 'floor' | 'door' | 'window' | 'stairs';
  enableMultiSelect: boolean;       // 다중 선택
  enableGroupSelect: boolean;       // 그룹 선택
  
  // Construction Assistance
  enableGuidelines: boolean;        // 가이드라인 표시
  enableMeasurement: boolean;       // 측정 도구
  enableCollisionCheck: boolean;    // 충돌 검사
  
  // Undo/Redo
  maxUndoSteps: number;             // 기본: 50 (최대 되돌리기 단계)
  autoSave: boolean;                // 자동 저장
  autoSaveInterval: number;         // 기본: 300 (초)
}
```

### Wall System Settings
```typescript
interface WallSystemSettings {
  // Default Dimensions
  defaultWallHeight: number;        // 기본: 300 (Wall Height)
  defaultWallThickness: number;     // 기본: 20 (Wall Thickness)
  defaultWallLength: number;        // 기본: 400 (Wall Length)
  
  // Connection Settings
  enableAutoConnect: boolean;       // 자동 연결
  connectionTolerance: number;      // 기본: 5.0 (Connection Tolerance)
  enableCornerGeneration: boolean;  // 코너 자동 생성
  
  // Door/Window Settings
  enableAutoOpenings: boolean;      // 문/창문 자동 생성
  doorWidth: number;                // 기본: 90 (Door Width)
  doorHeight: number;               // 기본: 200 (Door Height)
  windowWidth: number;              // 기본: 120 (Window Width)
  windowHeight: number;             // 기본: 100 (Window Height)
}
```

### Floor System Settings
```typescript
interface FloorSystemSettings {
  // Default Settings
  defaultFloorThickness: number;    // 기본: 10 (Floor Thickness)
  defaultTileSize: number;          // 기본: 100 (Tile Size)
  
  // Tiling
  enableAutoTiling: boolean;        // 자동 타일링
  tilePattern: 'square' | 'hexagon' | 'triangle' | 'custom';
  groutWidth: number;               // 기본: 2 (Grout Width)
  
  // Surface
  enableTextureTiling: boolean;     // 텍스처 타일링
  textureScale: number;             // 기본: 1.0 (Texture Scale)
  enableNormalMap: boolean;         // 노말맵 활성화
}
```

## Quality Settings

### Rendering Quality Settings
```typescript
interface BuildingRenderQuality {
  // Geometry Quality
  geometryComplexity: 'low' | 'medium' | 'high' | 'ultra';
  enableDetailMeshes: boolean;      // 디테일 메시
  maxTrianglesPerChunk: number;     // 기본: 10000
  
  // Lighting Quality
  lightmapResolution: number;       // 기본: 1024
  enableRealTimeLighting: boolean;  // 실시간 조명
  shadowQuality: 'low' | 'medium' | 'high';
  
  // Performance
  enableInstancing: boolean;        // 인스턴싱 활성화
  enableBatching: boolean;          // 배칭 활성화
  cullingDistance: number;          // 기본: 1000
}
```

## User Controls

### Editor Preferences
```typescript
interface BuildingEditorSettings {
  // Interface
  showToolbar: boolean;             // 툴바 표시
  showPropertyPanel: boolean;       // 속성 패널 표시
  showMaterialLibrary: boolean;     // 재질 라이브러리 표시
  
  // Workflow
  enableQuickAccess: boolean;       // 빠른 액세스
  enableHotkeys: boolean;           // 단축키 활성화
  enableContextMenu: boolean;       // 컨텍스트 메뉴
  
  // Visual Aids
  showBoundingBoxes: boolean;       // 바운딩 박스 표시
  showNormals: boolean;             // 노말 벡터 표시
  showWireframe: boolean;           // 와이어프레임 모드
  
  // Assistance
  enableSmartSnap: boolean;         // 스마트 스냅
  enablePredictiveText: boolean;    // 예측 텍스트
  showTips: boolean;                // 팁 표시
}
```

## Default Configuration

```typescript
export const DEFAULT_CONSTRUCTION_SETTINGS: ConstructionSettings = {
  gridSize: 100,
  snapToGrid: true,
  showGrid: true,
  gridOpacity: 0.3,
  snapDistance: 10,
  enableVertexSnap: true,
  enableEdgeSnap: true,
  enableFaceSnap: true,
  positionPrecision: 0.01,
  rotationPrecision: 1.0,
  scalePrecision: 0.01,
};

export const DEFAULT_MATERIAL_SETTINGS: BuildingMaterialSettings = {
  defaultMaterial: 'standard',
  enablePBR: true,
  textureResolution: 'high',
  receiveShadows: true,
  castShadows: true,
  enableEmission: false,
  enableLOD: true,
  lodDistance: 100,
  occlusionCulling: true,
};

export const DEFAULT_WALL_SETTINGS: WallSystemSettings = {
  defaultWallHeight: 300,
  defaultWallThickness: 20,
  defaultWallLength: 400,
  enableAutoConnect: true,
  connectionTolerance: 5.0,
  enableCornerGeneration: true,
  enableAutoOpenings: false,
  doorWidth: 90,
  doorHeight: 200,
  windowWidth: 120,
  windowHeight: 100,
};
```

## Settings Overview

### Construction Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| gridSize | 100 | 1 - 1000 | 그리드 단위 크기 |
| snapToGrid | true | true/false | 그리드 스냅 활성화 |
| showGrid | true | true/false | 그리드 표시 |
| gridOpacity | 0.3 | 0.0 - 1.0 | 그리드 투명도 |
| snapDistance | 10 | 1 - 100 | 스냅 거리 |
| positionPrecision | 0.01 | 0.001 - 1.0 | 위치 정밀도 |
| rotationPrecision | 1.0 | 0.1 - 45.0 | 회전 정밀도 (degrees) |

### Material Settings
| 설정 | 기본값 | 옵션 | 설명 |
|------|--------|------|------|
| defaultMaterial | 'standard' | standard/glass/metal/wood/concrete | 기본 재질 |
| enablePBR | true | true/false | PBR 렌더링 활성화 |
| textureResolution | 'high' | low/medium/high/ultra | 텍스처 해상도 |
| receiveShadows | true | true/false | 그림자 받기 |
| castShadows | true | true/false | 그림자 투사 |
| enableLOD | true | true/false | LOD 활성화 |
| lodDistance | 100 | 10 - 1000 | LOD 거리 |

### Wall System Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| defaultWallHeight | 300 | 50 - 1000 | 기본 벽 높이 |
| defaultWallThickness | 20 | 5 - 100 | 기본 벽 두께 |
| defaultWallLength | 400 | 100 - 2000 | 기본 벽 길이 |
| connectionTolerance | 5.0 | 1.0 - 50.0 | 연결 허용 오차 |
| doorWidth | 90 | 60 - 150 | 문 너비 |
| doorHeight | 200 | 150 - 300 | 문 높이 |
| windowWidth | 120 | 80 - 200 | 창문 너비 |
| windowHeight | 100 | 60 - 150 | 창문 높이 |

### Building Tool Settings
| 설정 | 기본값 | 옵션 | 설명 |
|------|--------|------|------|
| defaultTool | 'wall' | wall/floor/door/window/stairs | 기본 도구 |
| maxUndoSteps | 50 | 10 - 200 | 최대 되돌리기 단계 |
| autoSave | true | true/false | 자동 저장 |
| autoSaveInterval | 300 | 60 - 1800 | 자동 저장 간격 (초) |

### Rendering Quality
| 품질 레벨 | 지오메트리 복잡도 | 라이트맵 해상도 | 그림자 품질 | 권장 환경 |
|----------|------------------|----------------|-------------|-----------|
| low | 단순화된 메시 | 256 | low | 저사양 디바이스 |
| medium | 기본 메시 | 512 | medium | 일반 PC |
| high | 디테일 메시 | 1024 | high | 고사양 PC |
| ultra | 최고 디테일 | 2048 | ultra | 최고사양 PC |

### Building Presets Comparison
| 프리셋 | 그리드 크기 | 위치 정밀도 | PBR | 지오메트리 | 사용 용도 |
|--------|-------------|-------------|-----|------------|-----------|
| architectural | 100 | 0.01 | true | ultra | 건축 설계 |
| gameLevel | 200 | 0.1 | false | medium | 게임 레벨 |
| prototype | 500 | 1.0 | false | low | 프로토타입 |

## Usage Example

```typescript
// 건축 설정 변경
const { updateBuildingSettings } = useBuildingStore();

updateBuildingSettings({
  gridSize: 50,                     // 더 세밀한 그리드
  enableAutoConnect: true,          // 자동 연결 활성화
  textureResolution: 'ultra',       // 고해상도 텍스처
  geometryComplexity: 'high'        // 고품질 지오메트리
});
```

## Building Presets

```typescript
// 미리 정의된 건축 프리셋
export const BUILDING_PRESETS = {
  architectural: {
    gridSize: 100,
    positionPrecision: 0.01,
    enablePBR: true,
    geometryComplexity: 'ultra',
    shadowQuality: 'high',
  },
  
  gameLevel: {
    gridSize: 200,
    positionPrecision: 0.1,
    enablePBR: false,
    geometryComplexity: 'medium',
    shadowQuality: 'medium',
  },
  
  prototype: {
    gridSize: 500,
    positionPrecision: 1.0,
    enablePBR: false,
    geometryComplexity: 'low',
    shadowQuality: 'low',
  }
};
``` 