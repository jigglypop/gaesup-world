# PRD-14 네트워크·저장·에셋 로딩

| 항목 | 값 |
|---|---|
| 우선순위 | P1(D-05~D-08, D-13, D-14는 P0) |
| 트랙 | Fast |
| 선행 PRD | 00, 10 |
| 담당 agent | platform |

## 1. 배경과 문제

수신 데이터 방어(parse 전 크기 제한, finite 검증, whitelist 복사), `SaveSystem`의 트랜잭션식 복원, 빌딩 cell 예산, minihome 서버의 body·rate 제한은 잘 되어 있다. 문제는 **데이터 양에 비례하는 반복 비용**과 **격리되지 않은 실패**다.

1. 플레이어 동기화가 식별 필드를 포함한 전체 상태를 매 틱 JSON으로 보낸다. 정지 상태에서도 사실상 매 틱 송신한다.
2. 원격 `modelUrl` 로드 실패나 지연이 world 전체를 멈춘다(D-05).
3. 저장 1회에 전체 순회가 5~6회 일어나고, 변경이 없어도 autosave가 전체를 직렬화한다.
4. 에셋 파이프라인 산출물(meshopt)과 런타임 로더 설정이 맞지 않고, GLTF 캐시가 두 개다.
5. `src` 전체에서 Worker 사용이 0건이다.

## 2. 목표 / 비목표

**목표**
- 정지 플레이어 송신 ≤ 2Hz, Update 메시지 크기를 identity 분리 후 절반 이하로 줄인다.
- 원격 입력으로 생긴 실패를 해당 아바타에 가둔다.
- 저장·로드의 전체 순회를 경계당 1회로 줄이고 dirty 기반으로 건너뛴다.
- GLTF 로더와 캐시를 하나로 합친다.
- D-05~D-08, D-13, D-14를 수정한다.

**비목표**
- 서버 구현. 라이브러리는 engine-neutral contract와 client adapter만 소유한다(AGENTS.md product boundary).
- 프로토콜 통합 자체는 21 PRD에서 다룬다. 이 문서는 wire 비용과 견고성을 다룬다.

## 3. 현재 상태

### 3.1 네트워크

**14-F01 플레이어 Update가 전체 상태를 매 틱 JSON 송신** [확인]
- `networks/core/PlayerNetworkManager.ts:376` `ws.send(JSON.stringify({ type: 'Update', state: payload }))`.
- `PlayerPositionTracker.ts:124-137` name/color/modelUrl/animation을 transform과 함께 매번 채운다.
- `PlayerPositionTracker.ts:109-114` `!lastPosition.equals(tempPos)` 정확 비교 + linvel 노이즈로 정지 중에도 송신.
- `defaultConfig.ts:66-68` 20Hz.
- 비용 [추정]: 메시지 250~350B. 24명 룸 서버 egress 24×23×20×300B ≈ 3.3MB/s(N²). 수신 측 메시지마다 `JSON.parse`, 검증, 객체 3~5개(`:488-492` copy+spread, `:527-529` 배열 3개).
- rate limit이 3중이다: `useMultiplayer.ts:337` 50ms interval, `PlayerPositionTracker.ts:54`, `PlayerNetworkManager.ts:371`. 타이머 지터로 실제 송신이 10~20Hz로 불규칙해질 수 있다 [미검증].

**14-F02 원격 modelUrl 로드가 world 전체를 멈춤(D-05)** [확인]
- `remoteInputLimits.ts:24` 같은 origin 임의 경로 허용, `RemotePlayer.tsx:492-494` `characterUrl` 없으면 원격 URL 사용, `:117` `useGLTF(modelUrl)` Suspense/ErrorBoundary 없음, `MultiplayerCanvas.tsx:129` Suspense 하나가 world 전체를 감쌈, `RemotePlayers.tsx:72-77` `allowedModelOrigins` 미전달.
- URL마다 useLoader 캐시에 영구 적재되어 세션이 길어지면 메모리가 는다.

**14-F03 원격 아바타가 메시지마다 React 재렌더** [확인]
- `RemotePlayers.tsx:64-69` 플레이어별 `useSyncExternalStore`가 메시지마다 `RemotePlayerContent` 재렌더. Text, RigidBody, 새 배열 `CapsuleCollider args`(`RemotePlayer.tsx:453`), effect 2개(`:253-301`, `:304-346`) 재실행.
- `LivePlayerMap.ts:75` 알림마다 `[...listeners]`. 아바타마다 `useEngineFrame`(`RemotePlayer.tsx:349`).
- 영향 [추정]: 24명 × 20Hz ≈ 초당 480 commit.

**14-F04 연결 생존 감지와 재연결** [확인]
- `PlayerNetworkManager.ts:432-440` Pong은 RTT 계산에만 쓰고 타임아웃 없음. half-open 연결 방치(ping 30s).
- `:651-652` 지수 백오프에 jitter 없음. `:300` `onclose`에서 `players.clear()`로 모든 원격 아바타 unmount/remount.

**14-F05 효과 없는 설정 knob** [확인]
- `enableRateLimit`, `maxMessagesPerSecond`, `compressionLevel`, `enableEncryption`은 `defaultConfig.ts:18,49-51`와 검증에만 등장하고 읽는 곳 0.
- 원격 Chat은 `useMultiplayer.ts:232-239` 메시지마다 `new Map` + `setState`, 피어별 제한 없음.

**14-F06 authority router(D-06)** [확인] `authority.ts:177-186,207,213-218`. 00 문서 참조.

**14-F07 visit room(D-07)과 대용량 동기 적용** [확인]
- `useVisitRoom.ts:156-157` `VisitLeave` 발신자 미확인.
- `channel.ts:93-99` 최대 5MB JSON을 메인 스레드 parse. building hydrate는 op당 65,536 cell 제한(`placement.ts:26`)만 있고 스냅샷 전체 예산이 없다(`persistence.ts:148-153`).

**14-F08 minihome 서버·클라이언트 fan-out** [확인]
- `scripts/minihome-room-service.mjs:14` 수신자마다 `JSON.stringify` 재실행(world 메시지 최대 512KB × 24). `write()` 반환값 무시로 SSE backpressure 없음.
- `examples/minihome/roomVisitors.ts:78` 렌더마다 world 전체 stringify, `:55` presence(10Hz × 피어)마다 `setConnection`.

### 3.2 저장

**14-F09 저장·로드의 반복 전체 직렬화, dirty tracking 없음** [확인]
- 저장: `scene-object/saveBinding.ts:36` `cloneSceneDocument`(validate 2회 + clone + stringify + parse + validate, `serialization.ts:24-47`), `SaveSystem.ts:103` `cloneDomain(b.serialize())` structuredClone 1회 추가, building은 serialize 내부에서 이미 clone(`persistence.ts:67-78`), IndexedDB `put`이 structured clone 1회 더.
- 로드: `SaveSystem.ts:155` `cloneDomain(raw)`, `:173` 롤백용 `serializeBlob` 전체, `persistenceSlice.ts:298` 전 도메인 재직렬화, `buildingStore.ts:1375` `produce(get(), ...)`로 전체 재구성 + deep freeze.
- `saveHookCoordinator.ts:122-135,153` interval과 visibility hidden마다 변경 여부 무관 전체 저장. `IndexedDBAdapter.ts:29` 연산마다 open/close.
- 영향 [추정]: 저장 1회에 전체 순회 5~6회, 메모리 피크 blob의 3~4배. 대형 월드에서 autosave마다 hitch.

**14-F10 저장 슬롯 무한 증가(D-08)** [확인] `SaveLoadManager.ts:174-181,301`, `persistenceSlice.ts:259`.

**14-F11 SceneDocument 명령 O(N)** [확인]
- create/delete/move/component 명령이 `scene-object/commands.ts:97` `parseSceneDocument(candidate)`로 모든 객체 deep clone + validate. update도 `objects.map`(`:162`) + `find`.
- `hasParentCycle`이 객체마다 `new Set`(`core.ts:189,476-486`), O(N·depth). 대량 생성 O(N²).

**14-F12 기타 저장 견고성** [확인]
- `beforeunload`에서 비동기 IndexedDB 저장(`saveHookCoordinator.ts:157`), 완료 보장 없음.
- `autoSaveSuspension.ts` 모듈 전역 카운터로 여러 월드·SaveSystem이 서로 간섭(22 PRD).
- `WorldBridge.executeCommand`가 no-op 명령에도 `revision++`(`:63`).

### 3.3 에셋과 wasm

**14-F13 로더 디코더 불일치(D-14)** [확인]
- `scripts/assets/build.mjs:88-89` `lod${level}-meshopt.glb`, `assets/production/index.ts:277` 해당 경로를 url로 사용.
- `GLTFAssetCache.ts:18-19` `new GLTFLoader().loadAsync(uri)`, meshopt/Draco/KTX2 미설정.
- drei `useGLTF`는 Draco 디코더를 `https://www.gstatic.com/draco/...`에서 받는다. `public/draco/`가 있는데 `setDecoderPath` 호출 0. `KTX2Loader` 사용 0.
- GLTFLoader 구현 두 벌(three-stdlib, three/examples)이 번들에 중복.

**14-F14 GLTF 캐시 이원화와 즉시 dispose** [확인]
- `useGaesupGltf.ts:91-95` `preloadSizes`가 acquire → 크기 계산 → release, refcount 0이면 `disposeGLTFAsset`(`GLTFAssetCache.ts:44-46`). 이후 `useGLTF(safeUrl)`(`:28`)이 같은 URL을 다른 캐시로 다시 fetch·parse.
- grace 기간, LRU, 동시 요청 제한 없음. 캐릭터 URL 이중 파싱, 장비 교체마다 재다운로드.

**14-F15 wasm 로더** [확인]
- `core/wasm/loader.ts:158-189` `document.baseURI` 기준 fetch → arrayBuffer → instantiate. `instantiateStreaming` 미사용. `:175` 실패 결과 영구 캐시(D-13). exports에 `./wasm/*` 없음(15 PRD).

**14-F16 메인 스레드 대형 작업** [확인]
- `NavigationSystem.ts:470` 동기 A*, 요청마다 traversal grid 생성. JS 경로(`:538-540`)는 grid 크기 typed array 3개를 호출마다 할당.
- visit/save JSON 처리, SceneDocument 검증, GLTF 디코딩도 메인 스레드.

**14-F17 공개 selector가 호출마다 새 배열** [확인]
- `assetStore.ts:160-166,182-183`. `useAssetStore(selectAssetsByKind('tile'))`로 쓰면 zustand v5에서 무한 렌더 위험. 내부 사용 0, 공개 export.

## 4. 요구사항

**FR — 네트워크**
- FR-14-01: Update에는 transform과 animation만 담는다. name/color/modelUrl은 Join과 변경 시에만 보낸다.
- FR-14-02: 위치 1cm, 회전 1e-3 epsilon 비교로 송신을 결정하고, idle은 1~2Hz keepalive만 보낸다.
- FR-14-03: rate limit은 송신 경로 한 곳에서만 적용한다.
- FR-14-04: adapter 경계에 버전 필드가 있는 codec 인터페이스를 둔다. 1단계 JSON(자릿수 축소), 2단계 binary(Int16/Float32 양자화, smallest-three quaternion).
- FR-14-05: 아바타마다 `<ErrorBoundary><Suspense fallback={capsule}>`를 둔다(building `ModelObject` 패턴 재사용). URL 대신 asset id 또는 path prefix allowlist를 쓰고 `allowedModelOrigins`를 전달한다. 퇴장 후 참조 0이면 캐시에서 해제한다.
- FR-14-06: 원격 transform은 listener에서 scratch target에 직접 쓰고, React 렌더는 name/color/animation/modelUrl 변경 시에만 한다. 보간은 채널 하나에서 SoA로 일괄 처리한다(wasm `batch_smooth_damp` 재사용).
- FR-14-07: `lastPongAt` 기반 half-open 감지, jitter 백오프, 짧은 끊김 동안 원격 플레이어 유지 후 Welcome으로 reconcile.
- FR-14-08: 효과 없는 knob는 제거하거나 `client_id`별 token bucket으로 구현한다. Chat 피어별 rate limit.
- FR-14-09: authority router는 `verifyActor`를 필수로 하거나 기본 deny, domain/target별 직렬 큐, 거부 결과 비캐시(D-06).
- FR-14-10: visit room의 sender id는 서버가 붙인 값만 신뢰한다(D-07). hydrate 전 스냅샷 총 cell 예산을 검사한다.
- FR-14-11: minihome 서버는 fan-out 문자열을 한 번만 만들고 `write()` false면 drop 또는 disconnect.

**FR — 저장**
- FR-14-12: clone은 경계에서 한 번만 한다. binding에 `owned` 플래그를 두어 이미 복제된 스냅샷은 재복제하지 않는다. 검증된 스냅샷은 재검증하지 않는다.
- FR-14-13: 도메인 revision 기반 dirty 판정으로 변경 없는 autosave를 건너뛴다.
- FR-14-14: 롤백 스냅샷은 적용 대상 도메인만 lazy로 만든다.
- FR-14-15: IndexedDB 연결을 캐시한다. `beforeunload`는 동기 가능한 최소 저장(마지막 dirty 도메인 키만)으로 제한하고 나머지는 `visibilitychange`에서 처리한다.
- FR-14-16: 저장 슬롯은 월드당 최근 N개만 유지하고 메타데이터를 별도 인덱스 키에 둔다(D-08).
- FR-14-17: SceneDocument 명령은 신규 객체만 normalize하고 부모 체인만 검사한다. id → index를 캐시한다.

**FR — 에셋**
- FR-14-18: 공용 로더 팩토리 하나에서 MeshoptDecoder, 로컬 `/draco/`, KTX2(renderer 필요)를 설정하고 `useGLTF`와 `GLTFAssetCache`가 공유한다(D-14).
- FR-14-19: GLTF 캐시를 `GLTFAssetCache` 하나로 합치고, release 후 idle grace(예: 30초)를 둔 LRU와 동시 로드 제한(4~6)을 둔다.
- FR-14-20: wasm은 `new URL('./wasm/gaesup_core.wasm', import.meta.url)` + `instantiateStreaming`으로 로드하고 실패를 영구 캐시하지 않는다(D-13).
- FR-14-21: pathfinding과 대형 JSON parse/stringify는 워커로 옮길 수 있는 인터페이스를 둔다. grid는 transfer하고 revision으로 재전송을 줄인다.
- FR-14-22: 공개 selector는 쿼리별 memo를 한다(14-F17).

**NFR**
- NFR-14-01: 정지 플레이어 송신 ≤ 2Hz, Update JSON ≤ 120B, binary ≤ 32B(10 PRD).
- NFR-14-02: 원격 입력 하나의 실패가 다른 아바타와 world 렌더에 영향을 주지 않는다.
- NFR-14-03: 저장 1회 전체 순회 ≤ 2, 변경 없는 autosave 직렬화 0.
- NFR-14-04: 같은 GLTF URL의 네트워크 요청은 세션당 1회(evict 전까지).

## 5. 설계

### 5.1 네트워크 codec 경계

```
PlayerNetworkManager(transport) ─ codec.encode/decode ─ WebSocket
      ▲                                   │
LivePlayerMap(SoA transforms) ◄───────────┘
```

codec은 21 PRD의 canonical 프로토콜(`adapter/contracts`) 버전을 따른다. JSON codec과 binary codec은 같은 인터페이스를 구현하고 handshake에서 협상한다.

### 5.2 저장 경로

```
domain.serialize() ──(owned snapshot)──► SaveSystem ──► adapter.put(blob)
       ▲ revision                         │ dirty 판정, clone 1회
```

`SaveSystem`이 canonical이다(21 PRD). `SaveLoadManager`와 `persistenceSlice`는 이 경로 위의 adapter로 바꾼다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 14-a | D-05: 아바타별 ErrorBoundary/Suspense, allowlist 전달 | 404 modelUrl 주입 시 나머지 아바타와 world 유지 |
| 14-b | D-06 authority 직렬 큐·거부 비캐시·actor 검증, D-07 sender 검증 | 동시 `handle` 2건 테스트, 위조 `VisitLeave` 무시 테스트 |
| 14-c | D-08 슬롯 보존 정책, D-13 wasm 재시도, D-14 공용 로더 팩토리. D-08 완료(2026-09-25, G5): `SaveLoadManager`·`createPersistenceSlice`가 저장 성공 후 같은 월드의 `${worldId}_${timestamp}` 슬롯을 최신 10개만 남긴다(`maxSlotsPerWorld`, `Infinity`면 전부 보존). 20회 저장 후 키 20→10. 메타데이터 인덱스 키(FR-14-16 후반)는 잔여 | 20회 저장 후 키 ≤ N. `lod0-meshopt.glb` fixture를 `gltfAssetCache.acquire`로 로드. gstatic 요청 0 |
| 14-d | Update identity 분리, epsilon 비교, idle keepalive, rate limit 단일화 | ws mock에서 바이트/메시지, 메시지/s 계측 |
| 14-e | 원격 아바타 React 재렌더 제거, 보간 일괄 채널 | mock 24명 commit 수와 frame time |
| 14-f | half-open 감지, jitter, 재연결 시 플레이어 유지 | fake timers 테스트 |
| 14-g | 저장 clone 1회, dirty skip, 롤백 lazy, IDB 연결 캐시. 완료(2026-09-25): `DomainBinding`에 `owned`·`revision`을, `save(slot, { skipUnchanged })`를 추가했다. owned 스냅샷은 재복제하지 않고, 변경 없는 autosave는 직렬화·쓰기 0회다(scene-document·building revision 연결, 나머지 도메인은 revision이 없어 항상 쓴다). 롤백 스냅샷은 전 도메인 검증 후에만 만들고 IndexedDB 연결을 재사용한다(연산마다 close를 단언하던 테스트는 재연결 계약으로 바꿈). 씬 저장 validate 3→0, JSON 왕복 2→1, 저장당 전체 순회 약 9→2, 10k 객체 저장 약 740→40ms(jest) | `serialize` spy 호출 수, 10k 객체 `save()` 시간 |
| 14-h | SceneDocument 명령 증분 검증. 완료(2026-09-25): 신뢰 스냅샷(검증·deep-freeze된 것만)에서 명령은 새·변경 객체만 정규화하고, 부모 변경은 새 부모 체인만 검사하며, id→index를 다음 스냅샷에 넘긴다. 검사가 실패하면 기존 전체 검증으로 같은 이슈를 보고한다. 2k create 정규화 2,001,000→0회, 52.8s→86ms(jest). 객체 배열 복사(O(N) native)는 남는다 | 2k 객체 create 벤치가 선형 |
| 14-i | GLTF 캐시 통합, LRU grace, 동시 로드 제한 | 네트워크 탭 중복 요청 0 |
| 14-j | 효과 없는 knob 정리 또는 구현, Chat rate limit, 공개 selector memo | chat 1000/s 주입 시 `setState` ≤ 제한값 |
| 14-k | binary codec(버전 협상) | codec 왕복 테스트, 메시지 ≤ 32B |
| 14-l | 워커 인터페이스(pathfinding, 대형 JSON), minihome 서버 fan-out·backpressure | 256² grid 100회 요청 시 long task 감소. SSE 클라이언트 24개 부하 스크립트 |

## 7. 공개 API 영향

- `RemotePlayers`에 `allowedModelOrigins` 전달, `resolveModel(assetId)` 옵션 추가(추가만).
- 네트워크 config의 효과 없는 필드 제거는 타입 변경이다(열린 질문 1).
- `SaveLoadManager`, `createPersistenceSlice`는 `@deprecated`(21 PRD).
- `selectAssetsByKind` 등 공개 selector는 시그니처 유지, 반환값 memo.

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/networks src/core/save src/core/scene-object src/core/assets src/core/wasm --runInBand
corepack pnpm test:minihome:service
node scripts/probe-multiplayer-panel.cjs
```

완료 기준: NFR-14-01~04 충족, D-05~D-08·D-13·D-14 재현 테스트 통과.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| Update 포맷 변경으로 구버전 서버·클라이언트 비호환 | 메시지에 버전 필드, 서버가 구버전 Update도 수용하는 기간을 둠 |
| dirty 판정 누락으로 저장 누락 | revision 증가를 canonical write path 한 곳에서만 수행(21 PRD), 누락 검출 테스트 |
| GLTF LRU evict 후 재사용 시 hitch | grace 기간과 preload API 제공 |

## 10. 열린 질문

1. 효과 없는 네트워크 config 필드(`enableEncryption`, `compressionLevel` 등)를 제거할 것인가, 구현할 것인가.
2. binary codec 도입 시 서버 측(Rust/Python 등) 구현은 누가 소유하는가.
3. 저장 슬롯 보존 개수 N의 기본값.
