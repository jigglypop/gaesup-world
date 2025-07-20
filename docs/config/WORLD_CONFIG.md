# World Settings

> 언리얼 엔진의 World Settings와 유니티의 Scene Settings를 참고한 월드 환경 설정

## Core Settings

### Environment Settings (언리얼: World Settings)
```typescript
interface EnvironmentSettings {
  // Lighting Settings
  ambientLightColor: Color;         // 기본: #404040 (Ambient Light Color)
  ambientLightIntensity: number;    // 기본: 0.3 (Ambient Intensity)
  directionalLightColor: Color;     // 기본: #ffffff (Directional Light)
  directionalLightIntensity: number; // 기본: 1.0 (Light Intensity)
  
  // Sky Settings
  skyType: 'color' | 'gradient' | 'skybox' | 'procedural';
  skyColor: Color;                  // 기본: #87CEEB (Sky Blue)
  horizonColor: Color;              // 기본: #ffffff (Horizon)
  zenithColor: Color;               // 기본: #0077be (Zenith)
  
  // Fog Settings (언리얼: Exponential Height Fog)
  enableFog: boolean;               // 안개 활성화
  fogColor: Color;                  // 기본: #c0c0c0 (Fog Color)
  fogDensity: number;               // 기본: 0.01 (Fog Density)
  fogNear: number;                  // 기본: 1.0 (Fog Start Distance)
  fogFar: number;                   // 기본: 1000.0 (Fog End Distance)
}
```

### Time & Weather Settings
```typescript
interface TimeWeatherSettings {
  // Time of Day (언리얼: Time of Day System)
  enableTimeOfDay: boolean;         // 시간 시스템 활성화
  currentTime: number;              // 기본: 12.0 (24시간 형식)
  timeScale: number;                // 기본: 1.0 (시간 배율)
  sunriseTime: number;              // 기본: 6.0 (일출 시간)
  sunsetTime: number;               // 기본: 18.0 (일몰 시간)
  
  // Weather System
  weatherType: 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm';
  cloudCoverage: number;            // 기본: 0.3 (구름 덮개 0-1)
  windStrength: number;             // 기본: 1.0 (바람 강도)
  windDirection: Vector3;           // 바람 방향
  
  // Precipitation
  precipitationIntensity: number;   // 기본: 0.0 (강수 강도)
  temperatureRange: {               // 온도 범위
    min: number;                    // 기본: -10
    max: number;                    // 기본: 35
    current: number;                // 기본: 20
  };
}
```

### Terrain Settings (언리얼: Landscape)
```typescript
interface TerrainSettings {
  // Terrain Generation
  terrainType: 'flat' | 'hills' | 'mountains' | 'custom';
  terrainSize: number;              // 기본: 2048 (Terrain Size)
  heightScale: number;              // 기본: 100 (Height Scale)
  detailDistance: number;           // 기본: 200 (Detail Distance)
  
  // Texturing
  baseTexture: string;              // 기본 텍스처
  detailTextures: string[];         // 디테일 텍스처 배열
  textureBlending: 'height' | 'slope' | 'noise' | 'painted';
  
  // Vegetation
  enableVegetation: boolean;        // 식생 활성화
  grassDensity: number;             // 기본: 1.0 (풀 밀도)
  treeDensity: number;              // 기본: 0.1 (나무 밀도)
  vegetationDistance: number;       // 기본: 500 (식생 렌더 거리)
  
  // Water
  enableWater: boolean;             // 물 시스템 활성화
  waterLevel: number;               // 기본: 0.0 (해수면)
  waterColor: Color;                // 기본: #006994 (물 색상)
  waveHeight: number;               // 기본: 1.0 (파도 높이)
}
```

### Audio Environment Settings
```typescript
interface AudioEnvironmentSettings {
  // Ambient Audio
  enableAmbientAudio: boolean;      // 환경 오디오 활성화
  ambientVolume: number;            // 기본: 0.5 (환경음 볼륨)
  reverbPreset: 'none' | 'forest' | 'cave' | 'hall' | 'city';
  
  // 3D Audio Settings
  dopplerEffect: number;            // 기본: 1.0 (도플러 효과)
  audioOcclusion: boolean;          // 오디오 차폐
  maxAudioDistance: number;         // 기본: 500 (최대 오디오 거리)
  
  // Weather Audio
  weatherAudioIntensity: number;    // 기본: 1.0 (날씨 소음 강도)
  windAudioVolume: number;          // 기본: 0.3 (바람 소음)
}
```

## Quality Settings

### Rendering Quality
```typescript
interface WorldRenderingSettings {
  // Overall Quality
  renderQuality: 'low' | 'medium' | 'high' | 'ultra';
  
  // Shadows (언리얼: Shadow Settings)
  enableShadows: boolean;           // 그림자 활성화
  shadowQuality: 'low' | 'medium' | 'high' | 'ultra';
  shadowDistance: number;           // 기본: 100 (그림자 거리)
  cascadedShadowMaps: boolean;      // CSM 활성화
  
  // Post-Processing Effects
  enablePostProcessing: boolean;    // 포스트 프로세싱
  bloomIntensity: number;           // 기본: 0.5 (블룸 강도)
  colorGrading: boolean;            // 컬러 그레이딩
  screenSpaceReflections: boolean;  // SSR 활성화
  
  // Performance
  levelOfDetail: boolean;           // LOD 시스템
  occlusionCulling: boolean;        // 오클루전 컬링
  frustumCulling: boolean;          // 절두체 컬링
  maxDrawDistance: number;          // 기본: 1000 (최대 렌더 거리)
}
```

### World Streaming Settings
```typescript
interface WorldStreamingSettings {
  // Level Streaming (언리얼: World Partition)
  enableStreaming: boolean;         // 월드 스트리밍 활성화
  streamingRadius: number;          // 기본: 500 (스트리밍 반지름)
  unloadRadius: number;             // 기본: 800 (언로드 반지름)
  
  // Memory Management
  maxLoadedChunks: number;          // 기본: 25 (최대 로드된 청크)
  memoryPoolSize: number;           // 기본: 512 (MB)
  preloadDistance: number;          // 기본: 200 (프리로드 거리)
  
  // Performance
  asyncLoading: boolean;            // 비동기 로딩
  loadingPriority: 'distance' | 'direction' | 'manual';
  backgroundStreaming: boolean;     // 백그라운드 스트리밍
}
```

## User Controls

### Player World Preferences
```typescript
interface PlayerWorldSettings {
  // Visual Preferences
  preferredTimeOfDay: number;       // 선호 시간
  weatherPreference: 'realistic' | 'clear' | 'dramatic';
  fogVisibility: 'full' | 'reduced' | 'none';
  
  // Performance Preferences
  dynamicLighting: boolean;         // 동적 조명
  realTimeReflections: boolean;     // 실시간 반사
  particleEffects: boolean;         // 파티클 효과
  
  // Accessibility
  highContrast: boolean;            // 고대비 모드
  reducedMotion: boolean;           // 모션 감소
  colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // Debug
  showDebugInfo: boolean;           // 디버그 정보 표시
  showPerformanceStats: boolean;    // 성능 통계 표시
  showWorldBounds: boolean;         // 월드 경계 표시
}
```

## Default Configuration

```typescript
export const DEFAULT_ENVIRONMENT_SETTINGS: EnvironmentSettings = {
  ambientLightColor: '#404040',
  ambientLightIntensity: 0.3,
  directionalLightColor: '#ffffff',
  directionalLightIntensity: 1.0,
  skyType: 'gradient',
  skyColor: '#87CEEB',
  horizonColor: '#ffffff',
  zenithColor: '#0077be',
  enableFog: true,
  fogColor: '#c0c0c0',
  fogDensity: 0.01,
  fogNear: 1.0,
  fogFar: 1000.0,
};

export const DEFAULT_TIME_WEATHER: TimeWeatherSettings = {
  enableTimeOfDay: true,
  currentTime: 12.0,
  timeScale: 1.0,
  sunriseTime: 6.0,
  sunsetTime: 18.0,
  weatherType: 'clear',
  cloudCoverage: 0.3,
  windStrength: 1.0,
  windDirection: { x: 1, y: 0, z: 0 },
  precipitationIntensity: 0.0,
  temperatureRange: { min: -10, max: 35, current: 20 },
};

export const DEFAULT_TERRAIN_SETTINGS: TerrainSettings = {
  terrainType: 'hills',
  terrainSize: 2048,
  heightScale: 100,
  detailDistance: 200,
  baseTexture: 'grass',
  detailTextures: ['dirt', 'rock', 'sand'],
  textureBlending: 'height',
  enableVegetation: true,
  grassDensity: 1.0,
  treeDensity: 0.1,
  vegetationDistance: 500,
  enableWater: true,
  waterLevel: 0.0,
  waterColor: '#006994',
  waveHeight: 1.0,
};
```

## Settings Overview

### Environment Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| ambientLightIntensity | 0.3 | 0.0 - 2.0 | 환경광 강도 |
| directionalLightIntensity | 1.0 | 0.0 - 5.0 | 직사광 강도 |
| skyType | 'gradient' | color/gradient/skybox/procedural | 하늘 타입 |
| enableFog | true | true/false | 안개 활성화 |
| fogDensity | 0.01 | 0.001 - 0.1 | 안개 밀도 |
| fogNear | 1.0 | 0.1 - 100 | 안개 시작 거리 |
| fogFar | 1000.0 | 100 - 10000 | 안개 끝 거리 |

### Time & Weather Settings
| 설정 | 기본값 | 범위/옵션 | 설명 |
|------|--------|-----------|------|
| enableTimeOfDay | true | true/false | 시간 시스템 활성화 |
| currentTime | 12.0 | 0.0 - 24.0 | 현재 시간 (24시간 형식) |
| timeScale | 1.0 | 0.1 - 100.0 | 시간 배율 |
| sunriseTime | 6.0 | 0.0 - 12.0 | 일출 시간 |
| sunsetTime | 18.0 | 12.0 - 24.0 | 일몰 시간 |
| weatherType | 'clear' | clear/cloudy/rain/snow/storm | 날씨 타입 |
| cloudCoverage | 0.3 | 0.0 - 1.0 | 구름 덮개 |
| windStrength | 1.0 | 0.0 - 10.0 | 바람 강도 |
| precipitationIntensity | 0.0 | 0.0 - 1.0 | 강수 강도 |

### Terrain Settings
| 설정 | 기본값 | 범위/옵션 | 설명 |
|------|--------|-----------|------|
| terrainType | 'hills' | flat/hills/mountains/custom | 지형 타입 |
| terrainSize | 2048 | 512 - 8192 | 지형 크기 |
| heightScale | 100 | 10 - 1000 | 높이 스케일 |
| detailDistance | 200 | 50 - 1000 | 디테일 거리 |
| enableVegetation | true | true/false | 식생 활성화 |
| grassDensity | 1.0 | 0.0 - 5.0 | 풀 밀도 |
| treeDensity | 0.1 | 0.0 - 1.0 | 나무 밀도 |
| enableWater | true | true/false | 물 시스템 활성화 |
| waterLevel | 0.0 | -100 - 100 | 해수면 높이 |
| waveHeight | 1.0 | 0.0 - 10.0 | 파도 높이 |

### Audio Environment Settings
| 설정 | 기본값 | 범위/옵션 | 설명 |
|------|--------|-----------|------|
| enableAmbientAudio | true | true/false | 환경 오디오 활성화 |
| ambientVolume | 0.5 | 0.0 - 1.0 | 환경음 볼륨 |
| reverbPreset | 'none' | none/forest/cave/hall/city | 리버브 프리셋 |
| dopplerEffect | 1.0 | 0.0 - 2.0 | 도플러 효과 강도 |
| maxAudioDistance | 500 | 100 - 2000 | 최대 오디오 거리 |

### Rendering Quality
| 품질 레벨 | 그림자 품질 | 포스트 프로세싱 | 최대 렌더 거리 | 권장 환경 |
|----------|-------------|----------------|----------------|-----------|
| low | low | false | 500 | 저사양 디바이스 |
| medium | medium | basic | 750 | 일반 PC |
| high | high | enabled | 1000 | 고사양 PC |
| ultra | ultra | full | 1500 | 최고사양 PC |

### World Streaming Settings
| 설정 | 기본값 | 범위 | 설명 |
|------|--------|------|------|
| enableStreaming | true | true/false | 월드 스트리밍 활성화 |
| streamingRadius | 500 | 100 - 2000 | 스트리밍 반지름 |
| unloadRadius | 800 | 200 - 3000 | 언로드 반지름 |
| maxLoadedChunks | 25 | 5 - 100 | 최대 로드된 청크 |
| memoryPoolSize | 512 | 128 - 2048 | 메모리 풀 크기 (MB) |

### World Presets Comparison
| 프리셋 | 시간 | 날씨 | 구름 덮개 | 환경광 | 안개 | 사용 용도 |
|--------|------|------|----------|--------|------|-----------|
| sunny | 14:00 | clear | 0.1 | 0.4 | false | 밝고 쾌적한 환경 |
| dramatic | 19:00 | storm | 0.9 | 0.2 | 0.03 | 드라마틱한 분위기 |
| peaceful | 08:00 | cloudy | 0.5 | 0.3 | 0.01 | 평화로운 아침 |

## Usage Example

```typescript
// 월드 설정 변경
const { updateWorldSettings } = useWorldStore();

updateWorldSettings({
  currentTime: 18.0,                // 저녁 시간으로 설정
  weatherType: 'rain',              // 비오는 날씨
  fogDensity: 0.02,                 // 더 짙은 안개
  renderQuality: 'high'             // 고품질 렌더링
});
```

## World Presets

```typescript
// 미리 정의된 월드 프리셋
export const WORLD_PRESETS = {
  sunny: {
    currentTime: 14.0,
    weatherType: 'clear',
    cloudCoverage: 0.1,
    ambientLightIntensity: 0.4,
    enableFog: false,
  },
  
  dramatic: {
    currentTime: 19.0,
    weatherType: 'storm',
    cloudCoverage: 0.9,
    ambientLightIntensity: 0.2,
    fogDensity: 0.03,
  },
  
  peaceful: {
    currentTime: 8.0,
    weatherType: 'cloudy',
    cloudCoverage: 0.5,
    windStrength: 0.3,
    enableVegetation: true,
  }
};
``` 