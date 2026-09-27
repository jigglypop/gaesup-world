# API 지도

패키지 `gaesup-world`의 진입점(`package.json` `exports`)마다 무엇이 들어 있고 어떤 일에 어느 진입점을 쓰는지, import 비용에서 주의할 점을 정리한다. 무엇을 어디서 가져와야 할지 찾는 개발자와, 다음 작업 세션이 공개 표면을 빠르게 파악하는 용도다. 목록은 export snapshot(`src/__tests__/__snapshots__/exportSnapshot.test.ts.snap`, 값 export만 센다)과 각 진입점 소스로 확인했다. 타입은 같은 진입점의 `.d.ts`로 함께 나간다.

## 진입점

| import | 소스 | 값 export | 용도 |
|---|---|---:|---|
| `gaesup-world` | `src/index.ts` = `core/editor` + `core` 전체 | 952 | 모든 기능. NPC·대화·카메라·입력·캐릭터는 여기에만 있다 |
| `gaesup-world/runtime` | `src/runtime.ts` = `core/runtime` + `core/world` + `core/save` | 73 | 런타임, 프레임 단계, 물리 시계, 월드 컴포넌트, 저장 |
| `gaesup-world/building` | `src/building.ts` = `core/building` | 142 | 건축 데이터·store·렌더·편집 |
| `gaesup-world/editor` | `src/editor.ts` = `core/editor` + `core/building` + `core/content` | 220 | 에디터 셸·패널, 콘텐츠 번들 |
| `gaesup-world/gameplay` | `src/gameplay.ts` | 18 | 규칙 엔진(클라이언트 서비스 포함) |
| `gaesup-world/navigation` | `src/navigation.ts` | 11 | 격자 길찾기 |
| `gaesup-world/network` | `src/network.ts` = `core/networks` | 27 | 멀티플레이 클라이언트, 방문 스냅샷, 네트워크 계약 |
| `gaesup-world/server-contracts` | `src/server-contracts.ts` | 41 | 서버용 계약. React·Zustand·R3F 없음 |
| `gaesup-world/assets` | `src/assets.ts` | 25 | 자산 카탈로그, GLTF 캐시, 생산 매니페스트 검증 |
| `gaesup-world/avatar` | `src/avatar.ts` | 18 | 공유 스켈레톤 아바타 런타임 |
| `gaesup-world/plugins` | `src/plugins.ts` | 22 | 플러그인 정의·레지스트리 |
| `gaesup-world/postprocessing` | `src/postprocessing.ts` | 9 | 후처리 컴포넌트 |
| `gaesup-world/blueprints` | `src/blueprints/index.ts` | 19 | 블루프린트(캐릭터·탈것 정의, 컴포넌트 엔티티) |
| `gaesup-world/blueprints/editor` | `src/blueprints/editor.ts` | 3 | 블루프린트 편집 UI |
| `gaesup-world/style.css` | `dist/index.css` | | 에디터·UI 스타일 |

ESM(`import`)과 CJS(`require`) 둘 다 있다. 진입점 목록의 원본은 `package.json` `exports`이고, 빌드·export snapshot·소비자 검증이 이 목록을 읽는다(`scripts/lib/packageEntries.cjs`).

## 진입점별 주요 export

### `gaesup-world`

| 영역 | 주요 이름 |
|---|---|
| 월드 조립 | `GaesupWorld`(= `WorldConfigProvider`, 별칭 `World`), `GaesupWorldContent`, `WorldPhysics`, `GaesupController`(= `ControllerWrapper`), `createRenderer`, `isWebGPUAvailable`, `CascadedSun`, `DynamicSky`, `DynamicFog`, `LightingZone`, `ContactShadows`, `useContactShadow`, `IdleFrameRate`, `QualityProfileProvider`, `useQualityProfile`, `useWorldLoadProgress` |
| 런타임·프레임 | `createGaesupRuntime`, `GaesupRuntimeProvider`, `useGaesupRuntime`, `useEngineFrame`, `FRAME_PHASES`, `useWorldPhysicsStep` |
| 월드 store | `useGaesupStore`, `useGaesupStoreApi`, `createGaesupStore` |
| 캐릭터·탈것 | `useStateSystem`, `usePlayerPosition`, `useGaesupController`, `Rideable`, `RideableUI`, `useRideable`, `useTeleport`, `TeleportMarker`, `TeleportOnClick` |
| 입력 | `TouchControls`, `useWorldInputActions`, `useInputActions`, `createDefaultInputActions`, `WorldInputSurface`, `WorldGamepadInput` |
| 상호작용 | `Interactable`, `InteractionPrompt`, `InteractionTracker`, `useCurrentInteraction`, `useInteractablesStoreApi` |
| 카메라 | `CameraController`, `CameraPresets`, `CAMERA_CONTROLLER_MODE_OPTIONS`, `CAMERA_COLLIDER_LAYER`, `invalidateCollisionCache`, `requestCameraCloseUp`, `playCameraCinematic` |
| 건축 | `gaesup-world/building`의 전부 |
| NPC | `NPCSystem`, `NPCSimulation`, `useNPCStore`, `useNPCStoreApi`, `DEFAULT_NPC_SCALE`, `registerNPCBrainAdapter`, `registerNPCBrainBlueprint`, `createReinforcementAdapter`, `npcPlugin` |
| 대화 | `DialogBox`, `DialogRunner`, `useDialogRegistry`, `createDialogRegistry`, `getDialogRegistry`(legacy), `useDialogStore`, `useDialogStoreApi` |
| 규칙 | `gaesup-world/gameplay`의 전부, `GameplayArea`(영역 트리거 컴포넌트) |
| 저장·스냅샷 | `SaveSystem`, `createDefaultSaveSystem`, `getSaveSystem`, `useAutoSave`, `useLoadOnMount`, 어댑터 3종, `createWorldSnapshot`, `createPlayerProgress`, `WORLD_SNAPSHOT_DOMAINS` |
| 멀티플레이 | `gaesup-world/network`의 전부 |
| 도메인 플러그인 | `buildingPlugin`, `npcPlugin`, `cameraPlugin`, `timePlugin`, `weatherPlugin`, `characterPlugin`, `audioPlugin`, `scenePlugin`, `i18nPlugin`, `motionsPlugin`과 각 `create*Plugin` |
| UI | `ToastHost`, `notify`, `SpeechBalloon`, `MiniMap`, `RuntimeSaveDiagnosticsToaster`, `Nameplates`, `useNameplate`, `placeNameplates` |
| 시간·날씨·오디오·언어 | `useGameTime`, `TimeHUD`, `useWeatherStore`, `WeatherEffect`, `useAudioStore`, `useI18nStore`, `useTranslate` |

오디오의 `playBgm`은 이전 곡을 1초에 걸쳐 줄이며 새 곡을 올리고(`stopBgm` 액션도 1초에 걸쳐 줄인다), 반복 곡은 마지막으로 멈춘 자리에서 이어 튼다. 브라우저가 제스처 전이라 오디오를 멈춰 둔 경우 첫 입력(포인터·키·터치)에서 다시 켠다.
| 저작 모델 | `createSceneDocument`, `SceneRoot`, `createPrefabDocument`, `ScriptRuntime`, `defineScript` |
| 에디터 | `gaesup-world/editor`의 에디터 부분(`Editor`, `EditorLayout`, `BuildingPanel` 등) |
| 성능 | `PerformancePanel`, `usePerfStore`, `readRendererStats`, `autoDetectProfile` |
| 기타 | toon 재질 도우미(`createToonMaterial`, `setDefaultToonMode`), `loadCoreWasm`, WebGL 후처리(`ColorGrade`, `LutOverlay`, `ToonOutlines`, `Outlined`) |

이름 주의:
- NPC 인스턴스 **데이터 타입**은 루트에서 `NPCInstanceData`로 가져온다. `NPCInstance`라는 이름은 컴포넌트가 쓴다.
- `GaeSupProps`는 타입이 아니라 `WorldProps` 컴포넌트의 별칭이다. `LegacyGrid`는 drei `Grid`(WebGL 헬퍼)다.
- `ControllerWrapperProps` 타입은 `GaesupController`의 실제 prop 타입이 아니다. `React.ComponentProps<typeof GaesupController>`를 쓴다.
- `World`는 `GaesupWorld`와 같은 컴포넌트이며 삭제 후보다.

### `gaesup-world/runtime`

`createGaesupRuntime`, `GaesupRuntimeProvider`, `useGaesupRuntime`, `useGaesupRuntimeRevision`, `WorldConfigProvider`, `World`, `GaesupWorldContent`, `WorldPhysics`, `useWorldPhysicsStep`, `useWorldPhysicsInterpolation`, `useEngineFrame`, `useSharedFrame`, `useCanvasFrameScheduler`, `FRAME_PHASES`, `FrameScheduler`, `FrameSchedulerHost`, `FixedStepClock`, `AnimationClockLoop`, `SIMULATION_PHASES`, `SaveSystem`, `createDefaultSaveSystem`, `getSaveSystem`, `IndexedDBAdapter`, `LocalStorageAdapter`, `NamespacedSaveAdapter`, `useAutoSave`, `useLoadOnMount`, `suspendAutoSave`, `createRuntimeSaveDiagnostics`, `RUNTIME_SAVE_DIAGNOSTIC_EVENT`, `Rideable`, `RideableUI`, `ActiveObjects`, `PassiveObjects`.

이 진입점에는 `GaesupWorld`라는 이름이 없고(같은 컴포넌트가 `WorldConfigProvider`), `GaesupController`, `createRenderer`, `useGaesupStore`도 없다. 최소 월드는 결국 루트에서 가져온다.

### `gaesup-world/building`

- 컴포넌트: `BuildingController`, `BuildingSystem`, `TileSystem`, `WallSystem`, `BlockSystem`, `BuildingUI`, `GridHelper`, `BuildingNavigationObstacleDriver`, 메시 `Grass`, `Water`, `Sand`, `Snowfield`, `Sakura`, `Fire`, `Billboard`, `Snow`
- store: `useBuildingStore`, `useBuildingStoreApi`, `createBuildingStore`, `useBuildingEditor`, `buildingPlugin`, `createBuildingPlugin`
- 좌표: `edgeToWallTransform`, `wallTransformToEdge`, `worldToBuildingCell`, `buildingCellToWorld`, `tilePositionToCell`, `snapBuildingPosition`, `createTileFootprint`, `createBlockFootprint`, `applyBuildingNavigationObstacles`
- 표·카탈로그: `DEFAULT_BUILDING_OBJECT_CATALOG`, `getDefaultBuildingObject`, `BUILDING_TILE_PRESETS`, `BUILDING_WALL_PRESETS`, `BUILDING_*_OPTIONS`, `FLAG_STYLE_META`
- 그리기 내부: `GpuBatchBridge`, `supportsGpuInstanceBatches`, `MaterialManager`, 컬링·가시성·GPU 업로드 드라이버와 store, `DRAW_CLUSTER_*`

사용법은 [building.md](building.md).

### `gaesup-world/editor`

- 셸: `Editor`, `EditorLayout`, `CommandPalette`, `ResizablePanel`, `SceneObjectTransformGizmo`, `createEditorShell`, `createEditorCommandStack`, `createEditorTransaction`, `createSceneObjectEditorCommands`, `createEditorPlayModeController`, `DEFAULT_EDITOR_SHORTCUTS`, `useEditor`, `useEditorStore`, `useEditorShortcuts`, `useEditorAutosave`
- 패널: `BuildingPanel`, `CameraPanel`, `CameraSettingsTab`, `AnimationPanel`, `MotionPanel`, `PerformancePanel`, `ProjectAssetsPanel`, `HierarchyPanel`, `InspectorPanel`, `GameplayEventPanel`, `CinematicPanel`, `StudioPanel`, `VehiclePanel`
- 콘텐츠 번들: `createContentBundleFromSaveSystem`, `loadContentBundleFromManifest`, `validateContentBundle`, `validateContentBundleManifest`, `HttpContentBundleSource`, `CONTENT_SCHEMA_VERSION`
- 그리고 `gaesup-world/building`의 전부

스타일은 `import 'gaesup-world/style.css'`. NPC 두뇌 그래프 편집기가 `@xyflow/react`(패키지 의존성)를 쓴다.

### `gaesup-world/gameplay`

`GameplayEventEngine`, `GameplayEventRegistry`, `createDefaultGameplayEventRegistry`, `getGameplayEventRegistry`, `setDefaultGameplayEventServices`, `installClientGameplayEventServices`, `createClientGameplayEventServices`, `commitGameplayEffect`, `SEED_GAMEPLAY_EVENTS`, `createManualToastEventBlueprint`, `createNpcTalkEventBlueprint`, `createGameplayEvent{Trigger,Condition,Action}Template`, `GAMEPLAY_EVENT_{TRIGGER,CONDITION,ACTION}_TYPES`. 이 진입점과 루트의 `GameplayEventEngine`은 만들 때 브라우저 서비스(대화 store, 토스트)를 설치한다. 사용법은 [npc-dialog-gameplay.md](npc-dialog-gameplay.md#게임플레이-규칙-엔진).

### `gaesup-world/navigation`

`NavigationSystem`, `useNavigationSystem`, `useClickNavigationRoute`, `useNavigationObstacleRegistry`, `createNPCNavigationRoute`, `applyNPCNavigationRoute`, `createClickNavigationRoute`, `createNavigationObstacleRegistry`, `registerNavigationObstacles`, `getNavigationObstacles`, `applyRegisteredNavigationObstacles`.

### `gaesup-world/network`

- 클라이언트: `useMultiplayer`, `usePlayerNetwork`, `PlayerNetworkManager`, `PlayerPositionTracker`, `RemotePlayer`, `ConnectionForm`, `PlayerInfoOverlay`, `MultiplayerCanvas`, `defaultMultiplayerConfig`, `DEFAULT_NETWORK_CONFIG`
- 방문: `serializeVisit`, `applyVisitSnapshot`, `captureVisitRestorePoint`, `visitProviderFromSaveSystem`, `createLocalVisitChannel`, `createWebSocketVisitChannel`, `useVisitRoom`, `DEFAULT_VISIT_DOMAINS`
- 계약: `createCommandAuthorityRouter`, `createCommandAcceptedResult`, `createCommandRejectedResult`, `createGameCommand`, `createServerEvent`, `createStateDelta`, `createSnapshotAck`, `createNetworkEnvelope`, `MockNetworkAdapter`

사용법은 [save-network.md](save-network.md).

### `gaesup-world/server-contracts`

콘텐츠 번들 함수, 규칙 엔진(`GameplayEventEngine`, `GameplayEventRegistry`, `createDefaultGameplayEventRegistry` 등, 브라우저 서비스를 설치하지 않는 판), 네트워크 계약(위 "계약" 전부와 `MockNetworkAdapter`), 플랫폼(`createServerPluginHost`, `DEFAULT_SERVER_COMMAND_AUTHORITY_SERVICE_ID`, `createWorldSnapshot`, `createWorldSnapshotFromSaveSystem`, `createPlayerProgress`, `createPlayerProgressFromSaveSystem`, `collectSaveDomains`, `pickDomains`, `WORLD_SNAPSHOT_DOMAINS`, `PLAYER_PROGRESS_DOMAINS`). 이 진입점의 런타임 import가 `react`, `react-dom`, `zustand`, `@react-three/*`에 닿지 않는지 `pnpm run check:entries`가 검사한다.

### `gaesup-world/assets`

`useAssetStore`, `useAssetStoreApi`, `createAssetStore`, `selectAssetsByKind`, `selectAssetsBySlot`, `GLTFAssetCache`, `gltfAssetCache`(코어가 모든 GLB를 받는 공유 캐시: 임대, 최근 24개 보존, 동시 3개, 실패 뒤 재시도, [rendering.md](rendering.md)), `useGLTFAsset`, `disposeGLTFAsset`, `GLTF_RETAINED`, `GLTF_CONCURRENCY`, `GLTF_RETRY_MS`, `HttpAssetSource`, `ManifestAssetSource`, `SEED_ASSETS`, `AssetPreviewCanvas`, `inspectModel`, `validateModelStats`, `DEFAULT_ASSET_IMPORT_LIMITS`, `inspectFigure`(리그 인물 검사: 핵심 뼈, 가중치, +Z 방향, 움직이는 클립, idle·걷기에서 팔 내림, 예산), `DEFAULT_FIGURE_LIMITS`, `smoothSeamNormals`(UV 이음선에서 갈라진 법선을 주름 각도 안에서 평균), `validateAssetManifest`, `assetPublicationBlockers`, `assetManifestToRecord`, `ASSET_BUDGET_PROFILES`, `collectAssetReferences`, `findMissingAssetReferences`, `buildAssetDependencyGraph`, `assetToMeshConfig`, `createScopedAssetMeshConfig`, `createScopedBuildingMeshId`, `assetApprovalSubject`. 자산 카탈로그 store는 지금 모듈 전역이다(PRD ISO-1).

### `gaesup-world/avatar`

`Avatar`, `AvatarProvider`, `AvatarRuntime`, `useAvatar`, `useAvatarEquipment`, `createAvatarStore`, `createAvatarPlugin`, `createAvatarSaveBinding`, `parseAvatarManifest`, `avatarManifestFromRecord`, `parseAvatarState`, `resolveAvatarEquipment`, `AVATAR_SLOTS`, `AVATAR_SOCKETS`, `CANONICAL_AVATAR_RIG`, `HUMANOID_BONES`, `BODY_REGIONS`, `AvatarCompatibilityError`.

### `gaesup-world/plugins`

`defineGaesupPlugin`, `createPluginRegistry`, `PluginRegistry`, `createStoreDomainPlugin`, `defineService`, `runtimeStoreServiceKey`, `createPluginContext`, `createPluginLogger`, `validateGaesupPlugin`, `assertValidGaesupPlugin`, `filterPluginsForRuntime`, `shouldSetupPluginForRuntime`, `InMemoryEventBus`, `InMemoryExtensionRegistry`, 오류 클래스(`DuplicatePluginError`, `MissingPluginDependencyError`, `CircularPluginDependencyError`, `PluginVersionMismatchError`, `PluginManifestValidationError`, `PluginValidationAssertionError`, `DuplicateExtensionError`, `MissingExtensionError`). 플러그인 작성은 [world-runtime.md](world-runtime.md).

### `gaesup-world/postprocessing`

`WorldPostProcessing`(TSL `RenderPipeline`: TRAA, GTAO, Bloom), `ColorGrade`, `LutOverlay`, `ToonOutlines`, `Outlined`, `parseCubeLut`, `createLutTexture`, `loadCubeLut`, `loadCubeLutTexture`. `ColorGrade`, `LutOverlay`, `ToonOutlines`, `Outlined`는 `@react-three/postprocessing`(WebGL 경로)을 쓰며 삭제 예정이다(PRD GPU-1). 자세한 내용은 [rendering.md](rendering.md).

### `gaesup-world/blueprints`, `gaesup-world/blueprints/editor`

`BlueprintFactory`, `BlueprintConverter`, `BlueprintSpawner`, `BlueprintEntity`, `BlueprintLoader`, `ComponentRegistry`, `registerDefaultComponents`, `BaseComponent`, `GravityForceComponent`, `blueprintRegistry`, `WARRIOR_BLUEPRINT`, `FIRE_MAGE_BLUEPRINT`, `BASIC_KART_BLUEPRINT`, `useBlueprint`, `useCharacterBlueprint`, `useVehicleBlueprint`, `useAirplaneBlueprint`, `useBlueprintsByType`, `useSpawnFromBlueprint`. 편집 UI: `BlueprintEditor`, `BlueprintPanel`, `BlueprintPreview`. 루트는 이 모듈을 재수출하지 않는다.

## 일에 맞는 진입점

| 할 일 | import |
|---|---|
| 월드를 띄운다 | 루트: `GaesupWorld`, `GaesupWorldContent`, `WorldPhysics`, `GaesupController`, `createRenderer`, `CascadedSun` |
| 런타임을 만들고 저장한다 | `gaesup-world/runtime`(도메인 플러그인은 루트나 `building`) |
| 건축 데이터를 만들거나 읽는다 | `gaesup-world/building`(타입 `BuildingSerializedState` 포함) |
| 에디터를 붙인다 | `gaesup-world/editor` + `gaesup-world/style.css` |
| NPC·대화·카메라·입력·상호작용 | 루트(서브패스 없음) |
| 게임 규칙 | 브라우저 `gaesup-world/gameplay`, 서버 `gaesup-world/server-contracts` |
| 길찾기·장애물 | `gaesup-world/navigation` |
| 멀티플레이·방문 | `gaesup-world/network` |
| Node 서버 | `gaesup-world/server-contracts`만 |
| 자산 매니페스트·GLTF 검사 | `gaesup-world/assets` |
| 아바타 | `gaesup-world/avatar` |
| 플러그인을 만든다 | `gaesup-world/plugins` |
| 후처리를 직접 조합한다 | `gaesup-world/postprocessing` |

## import 비용

- **루트는 에디터를 재수출한다.** `gaesup-world`는 `core/editor`와 `core` 전체를 내보내므로, 쓰지 않는 에디터·저작·네트워크 코드를 걸러 내는 일은 소비자 번들러의 트리셰이킹에 달려 있다. 에디터 분리는 PRD LIB-1에 잡혀 있다.
- **배포 빌드에서는 트리셰이킹이 약하다.** 라이브러리 빌드가 모듈을 큰 공유 청크로 합쳐, 함수 하나만 가져와도 수백 KB가 딸려 올 수 있다. PRD의 측정(피어 제외, DEL-1 전): `GaesupWorld` 하나 57KB, `createSceneDocument` 하나 712KB, 최소 월드 이름 6개 848KB, 전체 1,495KB([../dev/measurement.md](../dev/measurement.md)). 서브패스 크기는 제각각이다. 현재 `dist`에서 import 폐포(동적 import 포함, 압축 전)를 더하면 `navigation`·`plugins`·`gameplay`·`server-contracts`는 수십 KB지만 `network`·`runtime`·`building`은 공유 청크를 거쳐 수백 KB다. `preserveModules` 빌드로 고치는 일이 PRD LIB-1이다. 저장소 예제처럼 소스에서 번들하면 트리셰이킹이 잘 되어, 월드 라우트에 에디터·후처리 모듈이 들어가지 않는다(`pnpm run test:demo`가 검사).
- **후처리는 켤 때만 받는다.** `GaesupWorldContent postProcessing`을 켜면 `WorldPostProcessing`을 동적 import로 불러오고, 끄면 받지 않는다. 다만 루트가 `ColorGrade`·`LutOverlay`·`ToonOutlines`·`Outlined`를 정적으로 export하므로 `@react-three/postprocessing`은 피어로 설치되어 있어야 한다.
- 무거운 화면(에디터, 월드)은 앱에서 `React.lazy`로 나눈다. 예제(`examples/main.tsx`)는 월드 라우트를 lazy로 열고, 검증(`pnpm run test:demo`)이 초기 UI 청크에 three가 없고 월드 라우트가 에디터·후처리를 미리 싣지 않는지 본다.
- 피어 의존성: `react`, `react-dom`(18/19), `three`(0.168/0.178/0.185/0.186), `three-stdlib`, `@react-three/fiber`(8/9), `@react-three/drei`(9/10), `@react-three/rapier`(1/2), `@react-three/postprocessing`(2/3). README 설치 줄은 three 0.186 · R3F 9 · drei 10 · rapier 2이고, `GpuBatchBridge`·`CompileGate`는 three r185·r186에서만 켜진다. `zustand`, `immer`, `@xyflow/react`, `simplex-noise`는 일반 의존성으로 함께 설치된다.

## 스타일과 정적 파일

- 라이브러리 빌드는 컴포넌트 CSS를 모두 `dist/index.css` 하나로 뽑고, 배포 JS는 CSS를 import하지 않는다. DOM UI(에디터 셸·패널, `BuildingUI`, `RideableUI`, `ConnectionForm`, `CameraController`, `CameraPresets`, `GamePad` 등)를 쓰면 앱에서 `import 'gaesup-world/style.css'`를 한 번 넣는다. `DialogBox`, `InteractionPrompt`, `TouchControls`는 인라인 스타일이라 없어도 된다.
- 패키지에 들어 있는 정적 파일: `public/gltf/trainer_green.glb`, `public/gltf/trainer_red.glb`(기본 NPC 템플릿이 `/gltf/trainer_*.glb`로 찾는다), `public/gltf/avatars/**`, `public/gltf/props/**`(건축 카탈로그가 `gltf/props/*.glb`로 찾는다), `dist/wasm/*.wasm`, `integrations/unity/**`. 앱이 GLB와 WASM을 그 경로로 서빙해야 한다(예: `public/gltf`를 앱의 `/gltf`로, `dist/wasm`을 `/wasm`으로 복사).
- WASM(`gaesup_core.wasm`: 잔디 데이터, 가중 A* 등)은 `document.baseURI` 기준 `wasm/gaesup_core.wasm`에서 받는다. 다른 곳에 두면 `globalThis.__GAESUP_WASM_BASE_URL__`에 기준 URL을 넣는다(그 아래 `wasm/gaesup_core.wasm`을 찾는다). 못 받으면 길찾기는 JS 경로로 대신한다.

## 관련 문서

- [getting-started.md](getting-started.md) · [world-runtime.md](world-runtime.md) · [rendering.md](rendering.md)
- [character-camera-input.md](character-camera-input.md) · [building.md](building.md) · [npc-dialog-gameplay.md](npc-dialog-gameplay.md) · [save-network.md](save-network.md)
- [performance.md](performance.md)
- [../dev/architecture.md](../dev/architecture.md) · [../dev/module-status.md](../dev/module-status.md)
