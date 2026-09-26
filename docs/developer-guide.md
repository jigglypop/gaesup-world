# gaesup-world 개발자 가이드

엔진 코드를 고치는 사람을 위한 문서다. 엔진을 쓰는 방법은 [사용자 가이드](user-guide.md), 지금 하는 일과 순서는 루트 [`PRD.md`](../PRD.md)에 있다. 작업 규칙은 루트 `CLAUDE.md`를 따른다.

## 원칙

1. **웹판 Unity/Unreal**: 코어는 월드 모델, 렌더링, 물리 캐릭터, 카메라, 입력, 건축, NPC, 저장, 멀티플레이, 에디터다. 게임 장르 로직(인벤토리, 퀘스트, 경제 등)은 코어에 두지 않고, 대화·게임플레이 규칙의 `custom` 확장점으로 게임이 붙인다.
2. **WebGPU 전면**: `WebGPURenderer`와 TSL만 쓴다. WebGL2는 `WebGPURenderer` 내장 fallback으로만 지원하고, GLSL·`WebGLRenderer` 전용 경로는 새로 만들지 않는다.
3. **upstream 우선**: three(r186)·R3F가 제공하는 기능은 자체 구현하지 않는다.
4. **예제는 증명 수단**: `examples/minihome`은 공개 API로만 만든다. 예제가 막히면 엔진을 고친다.
5. **측정으로 판단**: 성능 변경은 같은 장면·장치의 전후 수치로 말한다.
6. **공개 API 삭제는 승인 후**: export snapshot과 소비자 검증을 같은 커밋에서 갱신한다.

## 저장소

| 경로 | 내용 |
|---|---|
| `src/core/*` | 엔진 모듈. 모듈마다 `index.ts`가 공개 표면이다 |
| `src/*.ts` | 패키지 진입점(`index`, `building`, `editor`, `runtime`, `navigation`, `network`, `postprocessing`, `assets`, `avatar`, `plugins`, `gameplay`, `server-contracts`, `blueprints`). 목록의 원본은 `package.json` `exports`다 |
| `src/core/wasm` | Rust WASM(잔디 데이터, 눈 입자, 가중 A*). 빌드 결과는 `public/wasm` |
| `examples/` | Vite 예제. `main.tsx`가 `minihome/Minihome.tsx`를 lazy로 연다 |
| `scripts/` | 검증·릴리스·자산 파이프라인 도구 |
| `test/accept` | headless 수용 시나리오. 정의·예산은 `budgets.json` 한 곳 |

## 아키텍처

### 런타임과 store 범위

- `createGaesupRuntime()`이 월드 하나의 합성 루트다. 도메인 store, 입력, 클록, 내비게이션, NPC 시뮬레이션, 플러그인, 저장을 만들고 `setup()`/`dispose()`로 수명을 관리한다(`src/core/runtime/createGaesupRuntime.ts`).
- 도메인 store는 `lazyScopedStore(name, create, () => useGaesupRuntime()?.xStore)`로 내보낸다. React hook은 가장 가까운 런타임의 store를 읽는다. 정적 API(`getState` 등)와 런타임 밖 사용은 처음 쓸 때 만들어지는 legacy 전역 store로 간다.
- 새 도메인 store는 `createXStore()` 팩토리와 이 패턴을 쓴다. 모듈 전역 가변 상태(예: 로드 세대 토큰)는 팩토리 클로저 안에 둔다.

### 프레임과 시간

- 캔버스마다 `FrameScheduler`가 있고 `FRAME_PHASES` 순서로 콜백을 부른다(`src/core/runtime/frame`). 컴포넌트는 `useEngineFrame`으로 등록하고 raw `useFrame`은 쓰지 않는다(품질 래칫이 센다).
- 시뮬레이션은 `FixedStepClock`(60Hz)과 `AnimationClockLoop`가 돌린다. 런타임마다 하나다(`getTimeClock(timeStore)`).
- 콜백 오류는 `reportThrottled`로 콜백당 초당 한 번 보고한다.

### 렌더링

- `createRenderer`(`src/core/rendering/webgpu.ts`)는 `<Canvas gl>`에 넘기는 비동기 팩토리다. `rendererKind(gl)`은 `webgpu`·`webgpu-fallback`·`webgl`을 돌려준다.
- TSL 재질은 `src/core/rendering/tsl`와 건축 메시의 `Node*` 컴포넌트에 있다. GLSL 짝은 GPU-1에서 지운다.
- `CompileGate`는 새 콘텐츠의 파이프라인을 `compileAsync`로 먼저 만들어 첫 프레임 멈춤을 없앤다. `GpuBatchBridge`는 `building-batch:` 인스턴스를 compute로 컬링하고 간접 draw한다.
- 후처리 `WorldPostProcessing`은 TSL `RenderPipeline`(TRAA, GTAO, Bloom)이며 켤 때만 lazy로 로드된다.

### 플러그인과 서비스

`createPluginRegistry`가 플러그인의 서비스·입력·저장 바인딩·확장을 등록한다. 런타임은 자기 store를 서비스 키(`runtimeStoreServiceKey`)로 등록해 플러그인이 월드 store에 닿게 한다.

### 저장

`SaveSystem`은 도메인 바인딩(`key`, `serialize`, `hydrate`, 선택 `prepareHydrate`·`revision`)을 모아 슬롯 단위로 저장·복원한다. 복원 중에는 restore guard가 NPC·시네마틱·장면 전환을 멈춘다.

## 모듈 상태

| 상태 | 모듈 |
|---|---|
| 코어 | `rendering`, `perf`, `runtime`, `simulation`, `motions`, `camera`, `input`, `interactions`, `navigation`, `npc`, `building`, `save`, `assets`, `plugins`, `scene`, `scene-object`, `world`, `time`, `weather`, `dialog`, `ui` |
| 고쳐서 유지 | `runtime`(서브시스템 즉시 생성, 수명 목록 중복), `networks`(서버 없는 클라이언트, 1,006줄 `PlayerNetworkManager`), 방문 스냅샷, 자산 store(전역), 오류 sink(전역), `editor`(루트에서 재수출) |
| 합칠 대상 | `DynamicSky`+`CascadedSun` → three `SunLight`, `OutfitAvatar` → `AvatarRuntime`, WebGL 후처리 → TSL, `PerformancePanel` 자체 측정 → `PerformanceCollector` |
| 삭제 예정 | GLSL·WebGL 경로(GPU-1), `World` 별칭(`GaesupWorld`와 같은 컴포넌트) |
| 유지(선택 진입점) | `blueprints`, `server-contracts`, `gameplay`(규칙 엔진) |

## 검증

| 명령 | 내용 |
|---|---|
| `pnpm run verify` | 하네스, 타입체크(앱·테스트·빌드), lint(경고 0), 계층·진입점 격리, 품질 래칫, 자산 도구 테스트, jest, 빌드, publint |
| `pnpm run verify:full` | `verify` + 메모리 테스트 + 설치형 ESM/CJS 소비자 검증 + 예제 라우트 검사 |
| `pnpm check:quality --update` | 품질 지표가 좋아졌을 때 기준선을 고정한다. 나빠지면 실패한다 |
| `pnpm exec jest src/__tests__/exportSnapshot.test.ts -u` | 공개 export 목록 snapshot 갱신. 의도한 변경인지 diff로 확인한다 |

- 품질 래칫은 interface 선언 수, `console` 호출, `any`, raw `useFrame`, 200줄 넘는 컴포넌트(`.tsx`), 500줄 넘는 모듈(`.ts`), 데코레이터를 센다. 파일이 기준을 넘으면 줄을 합치지 말고 중복을 걷어낸다.
- `test:demo`는 예제 라우트가 lazy이고 초기 UI 그래프에 three가 없으며, 월드 라우트가 에디터·후처리를 미리 싣지 않는지 본다.

## 측정 방법

| 대상 | 방법 |
|---|---|
| 프레임 | 예제를 dev 서버로 띄우고 Playwright Chrome(WebGPU)에서 CDP `Performance.getMetrics`로 스크립트·태스크 시간, rAF 간격, 월드 store의 `performance`(draw·삼각형·프로그램)와 `framePhases`를 5초 창으로 읽는다. `navigator.gpu`를 지워 WebGL2 fallback도 잰다 |
| 번들 | 빌드된 `dist`에 import 모양별 진입 파일을 만들어 Vite(rolldown)로 묶는다. 피어는 external, `preserveEntrySignatures: 'strict'`, 엔트리와 정적 import 폐포의 min·gzip 크기 |
| 운영 라우트 | `vite build --manifest` 결과에서 예제 라우트 청크의 정적 import 폐포 크기 |

기준선(2026-09-27): 작은 마을에서 스크립트 2.3ms/프레임, draw 81, 삼각형 230만, 유휴 CPU 15%. 소비자 번들은 `createSceneDocument` 712KB, 최소 월드 848KB, 전체 1,495KB. 운영 월드 라우트 3,913KB min / 1,311KB gz.

## 2026년 9월 웹 3D 동향과 대응

| 동향 | 대응 |
|---|---|
| WebGPU가 모든 주요 브라우저 기본(Safari 26, Firefox 141+/145+, Android Chrome) | WebGPU 전면(GPU-1) |
| three r186: `SunLight` CSM, `PCFSoftShadowMap` 제거, `compileComputeAsync`. r185 클러스터 조명·WebGPU XR·TSL 컴파일 3배, r184 TAAU/FSR·`LightProbeGrid`, r183 `RenderPipeline`·`Timer` | 자체 CSM·라이트 풀 삭제, 업스케일로 품질 tier(UP-1) |
| R3F 9.8 안정, v10 alpha: WebGPU·TSL 1급, 새 `useFrame` 스케줄러, 다중 캔버스, `useRenderPipeline` | 자체 스케줄러·렌더러 팩토리·후처리를 v10 전환에 맞춰 얇게 유지 |
| GPU compute(파티클·컬링·절차 생성) | `GpuBatchBridge`를 일반 소품으로 확대 |
| Gaussian splat 표준화(`KHR_gaussian_splatting`, Spark 2.0 LoD) | 선택 플러그인 후보 |
| WebTransport 약 91%(Safari 26.4) | 멀티플레이 transport 추상화(WebSocket → WebTransport) |
| AI 제작(text/image→3D 자동 리깅, vibe coding, `llms.txt`) | 자산 파이프라인(Meshy) 유지, 공개 API 축소, 문서의 기계 판독성 |
| 브라우저 협업 에디터·UGC | 에디터 + 멀티플레이 동시 편집을 차별점으로 |

출처: [three.js 2026 변화](https://www.utsubo.com/blog/threejs-2026-what-changed), [three.js releases](https://github.com/mrdoob/three.js/releases), [R3F v10 alpha](https://github.com/pmndrs/react-three-fiber/discussions/3665), [WebGPU 지원 현황](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status), [Spark 2.0](https://www.worldlabs.ai/blog/spark-2.0), [WebTransport 동향](https://bloggeek.me/webrtc-predictions-2026/), [웹 게임 엔진 비교 2026](https://app.cinevva.com/blog/2026-06-09-web-game-engines-2026-comparison)

## 작업 흐름

1. `PRD.md`에 slice를 적는다(내용, 완료 기준).
2. 구현하고 `verify:full`을 통과시킨다.
3. 커밋 제목 끝에 slice ID를 붙인다. 끝난 slice는 PRD에서 지운다.
4. 바뀐 사용법·구조를 이 문서들에 반영한다.
