# PRD-00 현황 진단과 기준선

| 항목 | 값 |
|---|---|
| 우선순위 | P0 |
| 트랙 | Fast |
| 선행 PRD | 없음 |
| 담당 agent | reviewer |

## 1. 배경

2026-09-24에 코드 전체를 6개 영역으로 나눠 정독하고 검증 명령을 실행했다. 이 문서는 그 결과를 기록한다. 이후 모든 PRD는 이 문서의 수치를 비교 기준으로 쓰고, 이 문서의 정확성 결함(D-xx)을 추적한다.

## 2. 규모 [실측]

| 항목 | 값 |
|---|---|
| src 비테스트 ts/tsx | 1,027파일, 110,305줄 |
| src 테스트 | 60,730~62,538줄(집계 방식에 따라 다름) |
| examples | 88파일, 8,257줄 |
| 테스트 파일(src + examples) | 399 |
| `src/core` 도메인 | 57 |
| 큰 도메인(비테스트 줄) | building 17,654 / editor 12,946 / networks 8,591 / motions 5,680 / camera 4,465 / world 4,431 |
| 공개 엔트리 | 루트 + 서브패스 15개 + `style.css` |
| 루트 runtime export | 1,082개(export snapshot 기준) |
| 배포 패키지(`npm pack --dry-run`) | 압축 2.76MB, 해제 14.17MB, 2,263항목. 이 중 `public/gltf` 8.36MB(59%) |
| scripts 최상위 파일 | 61개. 이 중 36개는 package.json, 다른 스크립트, workflow 어디에서도 참조되지 않음 |

## 3. 검증 명령 기준선 [실측]

| 지표 | 명령 | 결과 | 비고 |
|---|---|---|---|
| 타입(build) | `pnpm exec tsc -p tsconfig.build.json --noEmit` | 에러 0, 약 3초 | tsc 7.0.2(native) |
| 타입(examples 포함) | `pnpm exec tsc --noEmit` | 에러 0, 약 3초 | 같은 설정을 tsc 6으로 돌리면 14.2초 |
| 린트 | `pnpm exec eslint src examples` | 1,509파일, 에러 0, 경고 0, 약 19초 | |
| 전체 테스트(병렬) | `pnpm exec jest` | 399 suites 중 2 실패, 1 skip / 3,244 tests 중 10 실패, 175초 | 다른 분석 작업과 동시 실행해 부하가 있던 상태 |
| 전체 테스트(`--runInBand`) | 같은 명령 + `--runInBand` | 캐시 있음 140초, `--no-cache` 170초, 1 suite(9 tests) 실패 | |
| 실패 원인 1 | `src/__tests__/packageFiles.test.ts` | 9건 | `package.json` `files`의 docs 7개 패턴과 README 링크가 작업 트리에서 삭제된 `docs/*.md`를 가리킴 |
| 실패 원인 2 | `useBaseLifecycle.test.ts:420` | 1건 | 벽시계 1,000ms 임계값. 부하 상태에서 1,567ms. 환경 의존 flaky |
| 품질 ratchet | `node scripts/check-quality-ratchet.cjs` | 통과 | interface 494, console 27, any 0, raw useFrame 5, 초과 컴포넌트 48, 초과 모듈 16 |
| harness | `node scripts/check-harness.mjs` | **실패**(ENOENT `.codex/config.toml`) | `pnpm verify`의 첫 단계 |
| publint | `publint --pack false` | All good | |
| 가장 느린 테스트 파일 | `examplePackageConsumption.test.ts` | 38.0초(전체의 28%) | TS6 `createProgram`을 두 번 생성 |

### 3.1 dist 크기 [실측]

기존 `dist/`를 측정했다(재빌드하지 않음). "폐포"는 정적 import로 도달하는 청크의 합이고, gz는 청크별 gzip -9의 합이다.

| 엔트리 | own raw | 폐포 raw | 폐포 gz |
|---|---|---|---|
| index | 299,281 | 1,810,767 | 468,915 |
| editor | 8,723 | 1,135,021 | 282,654 |
| runtime | 3,151 | 691,741 | 191,413 |
| building | 5,461 | 686,462 | 176,957 |
| network | 1,599 | 519,472 | 143,206 |
| server-contracts | 1,945 | 43,518 | 13,979 |

ESM 70파일 1.95MB, CJS 70파일 1.55MB, d.ts+d.cts 2,052파일 2.08MB이다. dist 36MB 중 약 25.6MB는 `publicDir`를 복사한 것이다.

소비자 관점에서 tree-shake한 결과(peer 제외, minify)는 다음과 같다.

| import | raw | gz |
|---|---|---|
| `{ createSceneDocument, createSceneDocumentController }` from 루트 | 403,030 | 115,357 |
| `{ GaesupWorld }` from 루트 | 232,844 | 66,173 |
| `*` from `runtime` | 500,665 | 146,708 |
| `{ createGameCommand }` from `network` | 491 | 277 |

직렬화 가능한 문서 API 두 개가 115KB gz이고 `@xyflow/react`를 끌고 온다. 상세는 [15](15-bundle-package.md)에 있다.

### 3.1.1 2차 재측정(2026-09-24, 작업 트리 171파일 변경 상태)

| 지표 | 결과 |
|---|---|
| harness | 통과 |
| 타입(`tsc -p tsconfig.json`, `tsconfig.test.json`) | 에러 0 |
| 린트(`eslint . --max-warnings 0`) | 에러 0, 경고 0 |
| 전체 테스트(병렬) | 406 suites 중 405 통과, 1 skip / 3,261 tests 중 3,260 통과, 1 skip, 77초. `packageFiles` 실패 해소 |
| 품질 ratchet | 통과. interface 493, console 27, any 0, raw useFrame 5, 초과 컴포넌트 47, 초과 모듈 16 |
| `check:layer1` | 위반 5(npc/core → questStore), 변화 없음 |
| jest 로그 | `THREE_CJS_DEPRECATED` 경고가 계속 대량 출력됨(jest가 three CJS 빌드를 로드, D-21과 같은 뿌리) |

### 3.2 미측정 기준선

아래 수치는 이번 분석에서 얻지 못했다. [10](10-perf-budget.md) slice 10-a에서 측정해 이 표를 채운다.

| 지표 | 측정 방법 |
|---|---|
| 기준 장면 frame time p50/p95/p99 | `scripts/frame-harness.cjs` + seeded 월드 |
| 프레임당 heap 할당, GC 횟수 | frame-harness의 precise memory |
| draw call, programs, geometries, textures | `readRendererStats` (`src/core/perf/rendererStats.ts`) |
| 섀도 pass draw call | Spector.js 또는 renderer info 분리 계측 |
| 정지 카메라와 이동 카메라의 React commit 수 | React Profiler API |
| 원격 플레이어 1명당 송신 바이트/초 | ws mock 계측 |
| 10k 타일 저장/로드 ms | jest 벤치 |
| 라이브러리 빌드 시간 | `pnpm build` (이번 분석에서 권한상 미실행) |
| `test:package:built`, `test:demo`, `test:browser` | 기존 스크립트 |

## 4. 정확성 결함

성능보다 먼저 처리한다. 확인 수준은 README 5절의 표기를 따른다.

| ID | 결함 | 근거 | 영향 | 처리 |
|---|---|---|---|---|
| D-01 | automation 모드의 무한 재귀 | `motions/entities/ManagedMotionEntity.ts:34-41`, `:96-110` listener가 `move()`를 부르고, `AbstractBridge.execute`(`boilerplate/bridge/AbstractBridge.ts:87-94`)가 `notifyListeners`로 같은 listener를 다시 부른다. `move`는 `applyForce`만 하므로 위치가 동기적으로 바뀌지 않아 거리 조건을 벗어나지 못한다. [확인] | 공개 API `useMotion().enableAutomation` 호출 시 stack overflow. 런타임 재현은 하지 않았다 | 11 |
| D-02 | `ManagedEntity`/`useManagedEntity`가 항상 throw | `boilerplate/di/container.ts:90,125`가 `design:paramtypes`/`design:type`을 읽지만 `tsconfig.json:62`가 `emitDecoratorMetadata: false`. `ManagedEntity.ts:10`의 `@Autowired`가 주입되지 않는다. 테스트(`useManagedEntity.test.ts:45,62`)는 DI와 `ManagedEntity`를 모두 mock해 이를 가린다 [확인] | 문서상 경로를 쓰면 반드시 에러 | 23 |
| D-03 | WebGL 경로 가시성 컬링이 collider를 제거 | `building/components/BuildingSystem/index.tsx:166-175`가 보이는 그룹만 `TileSystem`/`WallSystem`으로 렌더한다. 두 컴포넌트가 `RigidBody` collider를 소유한다(`TileSystem/index.tsx:921-931`, `WallSystem/index.tsx:334-343`) [확인] | 화면 밖 지면·벽의 collider가 사라짐. 카메라 밖 NPC나 원격 플레이어가 지면을 통과할 수 있다 [미검증: 재현] | 12 |
| D-04 | `@HandleError`가 예외를 삼키고 production에서 흔적이 없음 | `boilerplate/decorators/system.ts:30-49`가 catch 후 `defaultReturn`(기본 `undefined`)을 반환한다. `utils/logger.ts:17`은 production과 test에서 logger를 끈다. 67개 메서드에 적용되어 있고 `PhysicsSystem.calculateJump(): THREE.Vector3` 같은 반환 타입을 거짓으로 만든다 [확인] | 물리·카메라 오류가 원인과 무관한 위치에서 터짐. 운영에서 진단 불가 | 23 |
| D-05 | 원격 `modelUrl`의 `useGLTF`가 격리 없이 world Suspense를 멈춤 | `networks/components/RemotePlayer.tsx:117` Suspense/ErrorBoundary 없음. `MultiplayerCanvas.tsx:129`의 Suspense 하나가 world 전체를 감싼다. `remoteInputLimits.ts:24`는 같은 origin 임의 경로를 허용한다 [확인] | `characterUrl` 없이 `RemotePlayers`를 쓰는 소비자에서 피어 1명이 world 전체를 fallback으로 만들거나 404로 루트까지 throw | 14 |
| D-06 | authority router 동시성·재시도 결함 | `networks/adapter/authority.ts:177-186` revision 검사 후 `await handler`(TOCTOU). `:213-218` 거부 결과도 60초 replay 캐시. `:207` `verifyActor` 미지정 시 actor 검증 생략 [확인] | 동시 명령이 둘 다 통과. 충돌로 거부된 명령을 같은 id로 재시도하면 계속 거부 | 14 |
| D-07 | visit room에서 임의 피어가 격리를 종료 | `networks/visit/useVisitRoom.ts:156-157`가 `VisitLeave{hostId}`의 발신자를 확인하지 않는다 [확인] | 방문 세션 강제 종료 | 14 |
| D-08 | 저장 슬롯이 무한 증가 | `world/persistence/SaveLoadManager.ts:301`, `world/stores/persistenceSlice.ts:259`가 `${worldId}_${timestamp}` 키로 저장하고 정리하지 않는다 [확인] | localStorage 5MB quota 소진, IndexedDB 증가. `listSaves`가 전부 parse | 14 |
| D-09 | canonical 경로 밖 in-place mutation | `world/stores/persistenceSlice.ts:137-142`가 npcStore `instances`를 `set` 없이 `clear()` [확인]. immer로 freeze된 Map이면 throw할 수 있다 [미검증] | 구독자 미통지, 또는 hydrate 실패 | 21 |
| D-10 | `FixedStepClock` 이월 누적기 상한 없음 | `simulation/FixedStepClock.ts:73-81`이 `maxSubSteps` 도달 후 남은 accumulator를 버리지 않는다. 프로젝트 설정 `maxSubSteps: 4`(`project-settings/defaults.ts:11-12`)도 연결되지 않는다 [확인] | 7.5fps 미만이 지속되면 이월분이 계속 늘고, 회복 후 연쇄 hitch | 11 |
| D-11 | 입력 객체를 store state 안에서 in-place 변경 | `interactions/core/InteractionSystem.ts:206-213`, `adapter.ts:431-441`의 `Object.assign(state.keyboard, input)` [확인] | `s.interaction.keyboard`를 구독한 React 소비자가 값 변경을 받지 못함 | 13 |
| D-12 | `BridgeFactory.dispose()` 후 dispose된 인스턴스 재사용 | `DIContainer.singletons`와 `BridgeFactory.instances` 두 캐시 중 후자만 지운다 [확인] [미검증: 런타임 영향] | 재생성 시 해제된 bridge 사용 | 23 |
| D-13 | wasm 로드 실패를 영구 캐시 | `core/wasm/loader.ts:175`가 실패 결과 `null`을 캐시한다 [확인] | 일시적 네트워크 오류 후 가속이 세션 내내 꺼짐 | 14 |
| D-14 | 에셋 파이프라인 산출물과 로더 디코더 불일치 | `scripts/assets/build.mjs:88-89`는 `lod*-meshopt.glb`를 만들고 `assets/production/index.ts:277`이 이를 URL로 쓴다. `GLTFAssetCache.ts:18-19`의 `GLTFLoader`는 meshopt/Draco/KTX2 미설정 [확인] [미검증: 실제 manifest 경로] | `gltfAssetCache` 경로에서 로드 실패 | 14 |
| D-15 | 배치 InstancedMesh의 bounding sphere가 갱신되지 않음 | FireBatch/SakuraBatch가 인스턴스 변경 후 `computeBoundingSphere`를 호출하지 않는다 [확인] | 잘못된 frustum culling(깜빡임, 누락) | 12 |
| D-16 | `@Timeout`이 타이머를 해제하지 않고 원 작업도 취소하지 않음 | `boilerplate/decorators/monitoring.ts:346-354` [확인] | 호출자는 timeout 오류를 받는데 저장은 뒤늦게 완료될 수 있음 | 23 |
| D-17 | 접지 상태가 entityId 키 전역 Map | `motions/core/system/groundContacts.ts:1` [확인] | 캔버스·runtime이 여럿이면 같은 id가 충돌 | 22 |
| D-18 | `WorldSystem`이 position 참조를 그대로 저장 | `world/core/WorldSystem.ts:81-84`가 SpatialGrid에만 복제본을 넣는다 [확인] | 외부에서 벡터를 바꾸면 인덱스와 객체 위치가 어긋남 | 21 |
| D-19 | 검증 파이프라인이 작업 트리에서 실패 | 3절의 harness ENOENT와 packageFiles 9건 [실측] | 삭제를 커밋하면 `verify`, `verify:full`, CI release job이 항상 실패 | 25 |
| D-20 | 벽시계 임계값 테스트 | `boilerplate/hooks/__tests__/useBaseLifecycle.test.ts:420` [실측] | 부하 상태에서 무작위 실패 | 25 |
| D-21 | CJS 빌드가 `three/webgpu`, `three/tsl`을 `require` | three 0.186 exports에서 두 서브패스는 ESM 전용이다. dist CJS가 `require("three")` 26회, 각 서브패스 6회를 호출한다. jest 로그에 `THREE_CJS_DEPRECATED` 141회 [실측] | CJS 소비자에서 three 코어 이중 로드, `instanceof` 불일치 가능 [미검증] | 15 |
| D-22 | 자동 ID가 모듈 카운터라 새로고침 후 충돌 | `scene-object/core.ts:26-27,55,64` `object-${++n}`/`component-${++n}`, `prefab/instantiate.ts:4,10`, `prefab/overrides.ts:24,68`. 새로고침하면 카운터가 0부터 시작하고, 저장본 load 후 `editor/shell.ts:290` `createObject`가 기존 ID를 만들면 `duplicate-object-id`(`core.ts:120`)로 거부된다 [확인: 코드 경로] [미검증: 재현] | 저장된 씬에 객체를 추가할 수 없음. minihome은 UUID를 직접 넘겨 회피 | 32 |
| D-23 | NPC 파츠 toon 재질 누수 | `npc/components/NPCInstance/index.tsx:93-94`가 `applyToonToScene`만 하고 `releaseToonFromScene`을 호출하지 않는다(`PhysicsEntity.tsx:108`, `RiderRef.tsx:34`는 해제) [확인] | 파츠 mount마다 `MeshToonMaterial`이 쌓임. NPC LOD 재마운트(12-F16)로 증폭 | 12 |

### 4.1 처리 기록

| ID | 상태 | 변경 | 검증 |
|---|---|---|---|
| D-03 | 수정 (2026-09-24) | collider 계산을 순수 함수(`TileSystem/layout.ts`, `WallSystem/colliders.ts`, `BlockSystem/layout.ts`)로 분리. `BuildingColliders`가 가시성과 무관하게 모든 그룹의 collider를 소유하고, `BuildingSystem`은 System 컴포넌트에 `colliders={false}`를 전달. 단독 사용 System은 기존대로 collider 생성 | `BuildingColliders.test.ts`(계산 동일성), `BuildingSystem.test.tsx`(숨김 그룹 collider 유지, 벽 편집 모드 collider 없음). building 397 tests 통과 |
| D-15 | 수정 (2026-09-24) | FireBatch(log, charcoal, glow)와 SakuraBatch가 인스턴스 갱신 후 `computeBoundingSphere()` | `mesh/__tests__/batchBounds.test.tsx`. 수정 전 코드에서 2건 실패 확인 |
| D-01 | 수정 (2026-09-24) | `ManagedMotionEntity` listener 재진입 guard(`isSteering`) | `entities/__tests__/ManagedMotionEntity.test.ts`. 수정 전 `RangeError: Maximum call stack size exceeded` 재현. motions 199 tests 통과 |
| D-05 | 수정 (2026-09-24) | `RemotePlayer`가 모델 콘텐츠를 `GaesupErrorBoundary`(key=modelUrl, fallback 빈 group, logger 경고)와 로컬 `Suspense`로 감쌈. `RemotePlayers`의 `allowedModelOrigins` 전달은 공개 prop 추가라 14-a 잔여 | `RemotePlayer.test.tsx` 신규 2건(로드 실패·대기 시 world 유지). 격리 제거 시 2건 실패 확인. networks 328 tests 통과 |
| D-06 | 부분 수정 (2026-09-24) | 도메인별 직렬 실행 큐로 revision 검사와 handler를 원자화. 거부 결과는 replay 캐시에서 제거해 같은 id 재시도 허용. `verifyActor` 기본 deny는 기존 소비자 동작을 바꾸므로 결정됨(90 PRD G4) | `authority.test.ts` 신규 2건. 수정 전 2건 실패 확인 |
| D-07 | 결정됨(90 PRD G4, 2026-09-24) | visit wire(`channel.ts` `WireLeave`, snapshot)에 인증된 발신자 id가 없어 클라이언트만으로 해결 불가. channel 계약에 transport가 붙이는 `senderId` 추가 필요 | - |
| D-08 | 결정됨(90 PRD G5, 2026-09-24) | 자동 정리는 저장 데이터를 지우는 동작. 월드당 보존 개수 N 결정 후 진행 | - |
| D-14 | 부분 수정 (2026-09-24) | 공용 `createGLTFLoader()`(meshopt 디코더 설정, 내부 모듈)를 `GLTFAssetCache` 기본 로더로 사용. Draco 로컬 디코더 경로와 KTX2는 소비자 자산 호스팅 방식 결정이 필요해 14-c 잔여 | `assets/__tests__/gltfLoader.test.ts`(메모리 GLB). 공개 export 변경을 피하려고 팩토리는 barrel 밖 `assets/gltfLoader.ts`에 둠. 디코더 제거 시 `setMeshoptDecoder must be called` 실패 확인 |
| D-18 | 결정됨(90 PRD G6, 2026-09-24) | 복제 저장으로 고치면 기존 테스트가 고정한 identity 계약(`getAllObjects()`가 입력 객체를 그대로 반환, position 없는 객체 허용)이 바뀐다. `boundingBox` JSDoc은 `updateObject` 경유를 계약으로 명시. 복제 저장 또는 계약 문서화 중 선택 필요. 시도한 변경은 되돌림 | - |
| D-02 | 결정됨(90 PRD G3, 2026-09-24) | `ManagedEntity`/`useManagedEntity`는 공개 API가 아니고 사용처 0. 수정보다 삭제(23-b) 권장 | - |
| D-04 | 결정됨(90 PRD G2, 2026-09-24) | `@HandleError`를 걷어내면 `FrameScheduler`가 실패 entry를 영구 비활성화하므로 물리 루프 전체가 멈출 수 있다. 예외 전파/삼킴 정책과 production error sink(logger가 production에서 꺼짐)를 먼저 정해야 함 | - |
| D-13 | 수정 (2026-09-24) | 네트워크 오류·5xx는 30초 뒤 재시도, 404·잘못된 모듈은 계속 캐시 | `wasm/__tests__/loader.test.ts`(wasm 도메인 첫 테스트). 수정 전 1건 실패 확인 |
| D-09 | 수정 (2026-09-24) | 수정 전 immer로 freeze된 zustand store에서 `Map.clear()`가 throw하고 `loadWorld`가 조용히 `null`을 반환하는 것을 재현. `GaesupStores`의 building/npc store에 선택 `setState`를 추가(비파괴)하고, 있으면 새 Map으로 교체해 구독자에게 통지. getState 전용 adapter는 기존 in-place 경로 유지 | `persistenceSlice.test.ts` 신규 1건. world·save 185 tests 통과 |
| D-12 | 수정 (2026-09-24) | `DIContainer.releaseSingleton()` 추가. `BridgeFactory.dispose/disposeAll`이 DI singleton 캐시도 해제 | `boilerplate/__tests__/bridgeFactoryDispose.test.ts`. 수정 전 2건 실패 재현 |
| D-16 | 수정 (2026-09-24) | `@Timeout`이 settle 시 `clearTimeout`. 원 작업 취소는 AbortSignal이 없어 불가하므로 JSDoc에 명시 | `decorators/__tests__/timeout.test.ts`. 수정 전 타이머 1개 잔존 재현 |
| D-20 | 부분 수정 (2026-09-24) | 실패가 관측된 `useBaseLifecycle` 성능 테스트를 등록/해제 호출 수 단언으로 교체. 같은 벽시계 패턴 9곳(`useBaseFrame`, `useCollisionHandler`, `useEntityLifecycle`, `advanced`, `Autowired`, `container`, `SystemRegistry`)은 10-b 잔여. 이번 검증 중에도 병렬 부하에서 원인 불명 2건이 1회 실패 후 재현되지 않음 | `useBaseLifecycle.test.ts` 26 tests 통과 |
| D-17 | **구조 작업 필요** | 쓰는 쪽(`usePhysicsBridge`)과 읽는 쪽(`MotionBridge`)이 서로 모르는 인스턴스이고 `MotionBridge` 자체가 `BridgeFactory` 전역 singleton이라 단독 수정 불가. 22-b에서 runtime 스코프 bridge와 함께 처리 | - |
| D-11 | **설계 작업 필요** | 불변 갱신으로 바꾸면 60Hz 할당이 생겨 11-F04와 충돌. 13-h(입력 경로를 store 밖으로 분리)에서 처리 | - |
| D-19 | 작업 트리에서 해소 (2026-09-24 2차 확인) | `check-harness.mjs`, `package.json` `files`, README 참조가 작업 트리에서 정리됨. 삭제와 참조 정리를 같은 커밋에 묶어야 한다 | harness 통과, `packageFiles.test.ts` 통과 |
| D-22 | 수정 (2026-09-24) | 공용 `utils/id.ts` `createUniqueId`(crypto.randomUUID, 세션 prefix fallback). scene object·component, prefab 인스턴스·링크, play snapshot, 건설 scope id, 네트워크 계약 id, runtime worldId에 적용 | `sceneObjectIds.test.ts`(모듈 재로드 후 저장본과 충돌 0). 수정 전 `object-1` 중복 재현 |
| D-23 | 미착수 | 12-p. layout effect 적용·cleanup 해제, toon 재질 refcount 공유 | - |
| D-21 | 결정됨(90 PRD G10, 2026-09-24) | CJS 제거는 major 변경(15-h) | - |
| D-10 | 부분 수정 (2026-09-24) | 이월분을 `maxFrameSeconds`로 제한하고 초과분을 `discardedSeconds`로 보고. 기존 "이월 틱 보존" 계약 유지. 프로젝트 설정(`maxSubSteps: 4`) 연결은 기본 동작 변경이라 11-f로 이관 | `FixedStepClock.test.ts` 신규 케이스. 수정 전 이월분 8초 재현 |

## 5. 구조 지표 [실측]

| 지표 | 값 | 목표 | 처리 |
|---|---|---|---|
| `interface` 선언 | 494 | 신규 0, 수정 파일부터 감소 | 24 |
| `console.*`(logger 제외) | 27 | 0, `no-console` 규칙 | 24 |
| `any` | 0 | 0 유지 | - |
| raw `useFrame`(ratchet) | 5 | 0. drei `useAnimations`, rapier 내부, 별도 rAF 3개도 포함해 집계 | 11 |
| `useEngineFrame` 호출 | 45(42파일) | 인스턴스별 등록을 채널로 통합 | 11 |
| 200줄 초과 컴포넌트 / 500줄 초과 모듈 | 48 / 16 | 30 / 10 | 24 |
| 800줄 초과 파일 | 9 | 0 | 24 |
| `as unknown as` / non-null `!` | 33 / 258 | 감소 ratchet | 24 |
| zustand store 생성 | 43(모듈 최상위 싱글턴 37~40) | runtime 스코프로 이동 | 22 |
| `@HandleError` / `@ManageRuntime` | 67 / 6 | 0 | 23 |
| `reflect-metadata` import | 13모듈 + 엔트리 3곳 | 0 | 23 |
| 도메인 간 강결합 요소(SCC) | 45개 도메인이 단일 SCC | 감소 ratchet | 20 |
| `export *` | 148개 index 파일에 401개 | 도메인 경계 barrel만 | 20 |
| 도메인 간 barrel import | 298 | 감소 | 20 |
| 테스트 없는 도메인 | effects, wasm, ops, error, items | 0 | 25 |
| `plugin.ts` 복제 | 13개 도메인, 약 550줄 | 테이블 기반 1개 | 24 |
| Layer1 전이 누수(`check:layer1`) | 5(npc/core → zustand) | 0 | 20 |
| 엔진 → 게임플레이 import(composition root 밖) | 18(2차) | 0 | 20 |
| Layer 1 검사 대상 비율 | 11%(77파일, 2차) | React-free 폴더 전체 | 20 |
| `runtime` 엔트리 폐포 | 427파일 48,737줄 50도메인(2차) | kernel + engine + world shell | 15 |
| 엔티티 개념 / 스케줄러 / 모드 출처 | 8 / 4 / 4(2차) | 1 / 1(2 lane) / 1 | 30, 31 |
| 파일 전체 미사용 / 미사용 export | 28파일 1,394줄 / 270(2차) | 0 / knip baseline 감소 | 24 |
| `@Profile` | 67(2차) | 0 | 23 |

## 6. 보존 자산

아래 구현은 개선 PRD에서 **교체하지 않고 확장**한다.

| 자산 | 위치 | 이유 |
|---|---|---|
| FrameScheduler, `useEngineFrame`, `useSharedFrame` | `runtime/frame/` | phase 배열, 지연 compaction, 예외 격리, 채널 그룹화. 프레임 중 할당 없음 |
| raw `useFrame` 제한 lint와 quality ratchet | `eslint.config.js:10-17,151-167`, `scripts/check-quality-ratchet.cjs` | 회귀 방지 장치 |
| `FixedStepClock`, `AnimationClockLoop` 참조 카운트 | `simulation/` | 무할당 tick, 단일 rAF |
| scratch Vector/Quaternion 재사용 | 물리·방향·임펄스·카메라 컨트롤러 | 핫패스 할당 규칙 준수 |
| `AnimatorRuntime` track pool | `animation/core/animator/AnimatorRuntime.ts:437-476` | 변경 시에만 notify |
| `BuildingRenderSnapshot` SoA와 dirty-range `writeBuffer` | `building/render/core.ts:33-45`, `render/gpu.ts:70-101` | GPU 업로드 기반 |
| readback 없는 GPU-driven 인스턴스 | `next/backend/gpuDrivenInstances.ts`, `next/core/culling.ts` | 다른 GPU 경로가 수렴할 대상 |
| `SpatialGrid`(숫자 키, `out` 재사용), `BoundsIndex` | `world/core/` | NPCPerceptionIndex가 재사용하는 모범 사례 |
| `GLTFAssetCache` 참조 카운트 | `assets/` | 캐시 통일의 기준 |
| `SaveSystem` prepareHydrate/rollback, 슬롯별 큐 | `save/core/SaveSystem.ts:154-267` | canonical 저장 경로 |
| `SceneDocument` 순수 command, migration, saveBinding | `scene-object/` | canonical world model 후보 |
| `server-contracts` 격리(35파일, framework import 0) | `src/server-contracts.ts`, `check-entry-isolation.cjs` | 서버 번들 경계 |
| 수신 데이터 방어 | `PlayerNetworkManager.ts:231,518-531,832-854` | 크기 제한, finite 검증, whitelist 복사 |
| runtime별 store factory와 owner 키 WeakMap | `runtime/`, 약 25곳 | 전역 상태 제거의 기준 |
| export snapshot, packageExports, architectureBoundaries 테스트 | `src/__tests__/` | 공개 API·경계 가드 |
| strict TS 플래그 | `tsconfig.json`(`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) | 유지 |

## 7. 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 00-a | D-01~D-23을 해당 PRD 첫 slice에 배정하고 재현 테스트를 먼저 추가 | 결함마다 실패하는 테스트 또는 재현 스크립트 존재 |
| 00-b | 3.2절 미측정 지표를 10-a로 측정해 이 문서에 기록 | 3.2절 표에 값과 측정일, 커밋 기록 |

## 8. 열린 질문

1. 작업 트리에서 삭제된 `docs/*.md`, `.codex/*`, 기존 `prd/*.md`는 의도된 삭제인가. 의도라면 D-19를 참조 정리로, 아니라면 복원으로 처리한다.
2. D-03은 WebGL 경로의 물리 정확성 문제다. 성능 PRD(12)보다 먼저 별도 핫픽스로 처리할지 결정이 필요하다.
