# PRD-01 검증 체계

| 항목 | 값 |
|---|---|
| 우선순위 | P0(모든 작업의 전제) |
| 마일스톤 | M0 |
| 선행 | 없음 |

## 1. 목적

"제대로 된다"를 사람의 느낌이 아니라 같은 판정을 내는 장치로 확인한다. 모든 작업 항목은 이 문서의 수용 시나리오 하나 이상으로 완료를 판정한다. 시나리오가 없는 항목은 착수하지 않는다(README 원칙 2).

소유자가 확인하는 방법은 세 가지이고, 셋은 같은 시나리오 정의를 쓴다.

| 방법 | 언제 | 무엇을 보나 |
|---|---|---|
| PR 체크 | PR마다 자동 | `verify`, `accept-headless`, `accept-browser` 세 체크의 녹색/적색, 시나리오 표(job summary) |
| `pnpm accept` | 로컬, 원할 때 | 운영 빌드를 내 GPU(WebGPU)로 돌린 시나리오 표와 HTML 보고서(스크린샷, 카운터, ms) |
| `/accept` 페이지 | 브라우저에서 직접 | 시나리오를 눌러 실행하고 예산 대비 결과를 표로 본다. 실시간 HUD(카운터). 휴대폰에서도 연다 |

## 2. 판정 원칙

1. **결정적 지표로 판정한다.** 생성 수, 호출 수, 바이트, draw call, commit 수는 GPU·부하와 무관하게 같은 값이 나온다. 이 지표가 예산을 넘으면 실패다. 허용치는 0%다.
2. **ms는 기록하고 기준 기기에서만 판정한다.** 프레임 시간, long task 길이, 할당 KB는 `pnpm accept --timing`에서 기기별 기준 대비 20% 초과 시 경고한다. CI는 ms로 실패하지 않는다.
3. **운영 빌드를 잰다.** 브라우저 시나리오는 `vite build` 결과를 `vite preview`로 서빙해 잰다. dev 서버(development React, dev 전용 수집기) 측정은 판정에 쓰지 않는다.
4. **동작은 이진 단언으로 판정한다.** "Stop 후 문서가 Play 전과 같다", "로딩 중 월드가 사라지지 않는다" 같은 항목이다.
5. **빨간 항목을 숨기지 않는다.** 아직 해결하지 않은 시나리오는 `known-red`로 등록해 CI를 통과시키되 보드에 빨간색으로 남긴다. known-red 시나리오가 통과하기 시작하면 러너가 실패시키고 목록에서 지우라고 알린다(jest `test.failing`과 같은 방식). 진행률은 녹색 시나리오 수다.

## 3. 엔진 카운터(VER-01)

엔진이 운영 빌드에서도 유지하는 정수 카운터다. 증가 연산만 하고 수집·표시 UI는 운영 번들에 넣지 않는다. `runtime.stats.snapshot()`으로 읽고 `reset()`으로 0으로 만든다.

| 분류 | 카운터 | 출처 |
|---|---|---|
| 프레임 | frames, fixedTicks, systemRuns, 스케줄러 밖 per-frame 콜백 수 | FrameScheduler, FixedStepClock, R3F subscribers |
| 렌더 | drawCalls, renderPasses, triangles, programs(누적 컴파일 수), geometries/textures 생성·해제 | `perf/rendererStats.ts` `readRendererStats` 확장 |
| batch | batchesCreated, batchesResized, instanceWrites, bufferBytesUploaded | RenderWorld(20 PRD REN-01) |
| 엔티티 | entities, componentWrites, projectorProcessed, transformsRecomputed | EntityWorld, SceneProjector, TransformSystem(10 PRD) |
| 물리 | bodies, colliders, physicsSteps | PhysicsSystem |
| React | commits(월드 루트 Profiler 또는 devtools hook 스텁), 도메인 store별 알림 수 | 수용 러너가 주입 |
| 저장 | serializeCalls(도메인별), bytesWritten | SaveSystem |
| 네트워크 | messagesSent/Received, bytesSent/Received, 외부 fetch 수 | transport, fetch 래퍼 |
| 에셋 | requests, duplicateRequests, bytesDownloaded | 로더 캐시, PerformanceObserver resource |
| 오류 | errorsReported | `reportError` |

브라우저 러너는 `PerformanceObserver`(longtask, resource)로 long task와 요청을 함께 수집한다.

## 4. 수용 시나리오

시나리오는 `test/accept/scenarios/`에 한 번 정의한다. 정의는 준비(장면·규모), 단계(입력·명령), 단언(카운터 예산·동작)으로 이루어진다. 예산 수치는 `test/accept/budgets.json`에 두고 PR에서 이유와 함께만 바꾼다.

### 4.1 headless(S-H, Node, 캔버스·React 없음)

| ID | 시나리오 | 통과 조건 | 판정 대상 |
|---|---|---|---|
| S-H01 | 10k 객체 문서에서 객체 1개 이동 | projectorProcessed = 1 + 자손 수, 전체 순회 0 | COR-04 |
| S-H02 | 깊이 8, 1k 엔티티. 루트 하나 이동 후 정지 틱 100회 | transformsRecomputed = 서브트리 크기, 정지 틱 재계산 0, 틱당 할당 0 | COR-03 |
| S-H03 | 같은 시스템 집합을 무작위 등록 순서로 10회 | 실행 순서 10회 동일 | COR-05 |
| S-H04 | 60Hz와 144Hz 프레임 시퀀스 10초 | fixedTicks 600으로 동일, `fixedUpdate` 호출 수 동일 | COR-05, COR-11 |
| S-H05 | Play 중 이동·생성·삭제 후 Stop | 저작 문서 해시가 Play 전과 동일, Play 중 저장 호출 0 | COR-06 |
| S-H06 | Pause 5초 | physicsSteps 0, presentation lane 동작 | COR-06 |
| S-H07 | 헤드리스 물리: 캡슐 캐릭터 입력 재생 10초 2회 | 지면 위 정지, 두 번의 최종 위치 해시 동일 | COR-07, COR-08 |
| S-H08 | runtime 2개 생성·조작 후 dispose | 상태 공유 0, dispose 후 listener·timer·rAF 0 | COR-09 |
| S-H09 | 10k 타일 월드에 타일 1개 추가 | 영향 그룹 1, 인덱스 갱신 O(1), delta 1건, 내비게이션 재래스터가 변경 영역만 | DOM-01 |
| S-H10 | 변경 없는 autosave, 이어서 도메인 1개 변경 후 autosave | 첫 저장 serialize 0, 두 번째는 바뀐 도메인만 | AST-06 |
| S-H11 | 기본 runtime + NPC 30체 60초 | 외부 fetch 0 | DOM-03 |
| S-H12 | save → load, legacy 포맷 load | 문서 해시 동일, legacy load 성공 | AST-06 |
| S-H13 | mock 원격 24명, 로컬 정지 | 송신 ≤ 2Hz, Update ≤ 120B | DOM-08 |
| S-H14 | 각 공개 엔트리 import만 실행 | 전역 구독·타이머·저장소 읽기·레지스트리 등록 0 | COR-09, PKG-01 |
| S-H15 | 에셋 URL 변경 후 저장본 load, prefab base 변경 | 저장본 정상 load, 인스턴스·variant에 base 변경 반영(override 보존) | AST-03, AST-04 |
| S-H16 | 2k 객체 문서에서 편집 후 undo | undo 비용이 변경 객체 수에 비례, reset delta 0 | AST-07 |

### 4.2 browser(S-B, 운영 빌드)

| ID | 시나리오 | 통과 조건(결정적) | 기록(ms 등) | 판정 대상 |
|---|---|---|---|---|
| S-B01 | 경로별 첫 로드 | 초기 JS gz ≤ 예산, 경로가 쓰지 않는 청크(rapier, editor, postprocessing) 미포함 | 첫 표시 ms | PKG-01, DOM-11 |
| S-B02 | 입력 없이 5초 대기 | demand 모드 렌더 0, commit 0, store 알림 0, 요청 0 | GPU 사용률 | REN-11, DOM-03 |
| S-B03 | `/world?size=m` WASD 20초 | draw ≤ 예산, warm-up 후 program 증가 0 | frame p95, 할당 KB/frame, long task | REN-01, REN-05 |
| S-B04 | 3인칭 궤도 360° | geometry 생성·해제 0, commit ≤ 2/s | frame p95 | REN-03 |
| S-B05 | 10k 타일 월드에서 타일 칠하기 20회 | batchesCreated 0, bufferBytesUploaded ≤ 변경분 × 상수, 편집 1회당 commit ≤ 1 | 편집 프레임 ms | REN-01, REN-10, DOM-01 |
| S-B06 | 편집 모드 진입 | 오버레이 draw ≤ 재질 수 + 상수(타일 수와 무관) | | REN-04 |
| S-B07 | NPC·오브젝트 신규 모델 로드 | 로딩 중 월드 표시 인스턴스 감소 0, 동기 컴파일 프레임 0 | 로드 ms | REN-06, REN-05 |
| S-B08 | 후처리 켠 월드 로드와 신규 객체 배치 | warm-up 후 program 증가 0 | 첫 pass 프레임 ms | REN-05 |
| S-B09 | NPC 30체 | mixer 수 = NPC 수, 화면 밖 mixer 갱신 0 | animation phase ms | REN-09, DOM-03 |
| S-B10 | 품질 등급 low/medium/high/auto | 등급별 DPR·후처리·섀도 적용, 리사이즈·스크롤 후 DPR 유지 | dpr별 GPU ms | REN-07 |
| S-B11 | minihome 대기와 칠하기 | 대기 rAF 0, 칠하기 1회 업로드 ≤ 예산 | | DOM-11 |
| S-B12 | 같은 seed 장면을 옛 경로와 새 경로로 렌더 | 스크린샷 차이 ≤ 임계(같은 브라우저 안 A/B 비교) | | 이전 기간의 모든 REN·DOM |
| S-B13 | 에디터 NPC 패널을 연 채 10초, BlueprintPreview 열기 | 패널 commit 0(결정 틱 무관), 메인 월드 store 변경 0 | | EDT-03, EDT-05 |
| S-B14 | mock 원격 24명 이동 | 원격 메시지당 commit 0 | frame p95 | DOM-08 |

S-B12는 이전 기간에만 둔다. 옛 경로를 지우면 시나리오도 지운다. 기준 이미지를 저장하지 않고 한 실행 안에서 두 경로를 비교하므로 GPU가 달라도 흔들리지 않는다.

## 5. 실행 경로

### 5.1 `accept-headless`(VER-02)

jest project `accept`(node 환경)로 돈다. `pnpm verify`에 포함한다. 할당 측정은 `--expose-gc`와 heap delta를 쓰는 `measureAllocations`(`test/perf/`)로 한다. 순수 Node 수치가 필요한 벤치(00 문서 4.3 참고)는 jest 밖에서 돈다.

### 5.2 `pnpm accept`(VER-03)

1. `vite build`로 examples 운영 빌드를 만든다(수용 페이지 포함, 5.3).
2. `vite preview`로 서빙하고 Playwright로 연다(`@playwright/test` 1.63, chromium 채널). 로컬은 실제 GPU(WebGPU), CI는 `--software`(SwiftShader)다. Windows headless shell은 WebGPU device를 만들지 못하므로 chromium 채널을 쓴다. 기존 `scripts/frame-harness.cjs`의 브라우저 인자, `__THREE_DEVTOOLS__` renderer 포착, rAF당 draw 합산, CDP 수집, 3회 중앙값을 재사용한다. 지금 `perf:check`는 minihome `/`를 재고 `perf:world`에는 기준 파일이 없다. 두 명령을 이 러너로 대체한다.
3. 시나리오마다 카운터를 reset하고 단계를 실행한 뒤 snapshot을 읽는다.
4. 결과를 터미널 표, `.artifacts/accept/<시각>/report.json`, `report.html`(스크린샷 포함)로 낸다. CI에서는 같은 표를 job summary에 쓴다.
5. `--timing`이면 ms 지표를 기기별 기준 파일(`test/accept/timing/<기기>.json`)과 비교해 경고한다.

### 5.3 `/accept` 페이지(VER-04)

새 페이지를 만들지 않고 기존 PerformanceLab(`examples/performance`)을 확장한다. PerformanceLab에는 이미 다음이 있다.
- 시나리오 계약(`assert`/`sample`/`unavailable`, `scenarios/types.ts:5-25`)
- 실행 기록과 소스 identity
- IndexedDB 저장, JSON 입출력, baseline 비교
- 자동화 API(`window.performanceLab.run`, `PerformanceLab.tsx:12-20`)

`/accept`는 Lab의 수용 모음(suite)을 여는 경로다. 요구사항 표(`requirements.ts` R01~R31)는 마일스톤 체크리스트(6절)로 바꾼다.

- 시나리오 목록, 개별·전체 실행, 예산·결과·판정 표, JSON 내보내기.
- 실시간 HUD: fps, frame ms, draw, triangles, programs, batch 재생성, 업로드 바이트, commit, long task. 렌더 카운터는 `readRendererStats`로 읽는다. 브라우저 React commit은 devtools hook 스텁(`onCommitFiberRoot` 카운터)으로 센다. 지금은 jest `<Profiler>`에서만 센다.
- 운영 빌드에 들어가므로 배포 데모(GitHub Pages)에서도 열린다. 휴대폰에서 같은 표를 본다(`pnpm dev --host` 또는 배포 데모). 기기 등급 자동 감지 결과도 표시한다.

`pnpm accept`(5.2)는 이 페이지를 Playwright로 열어 `window.performanceLab.run`으로 같은 시나리오를 실행한다. 페이지와 러너가 시나리오 코드를 공유하므로 두 결과가 갈라지지 않는다.

### 5.4 CI(VER-06)

| job | 내용 | 실패 조건 |
|---|---|---|
| verify | typecheck, lint, 계층·엔트리·품질 검사, jest(accept-headless 포함), build, publint, 패키지 소비자 검증 | 기존과 같음 |
| accept-browser | 운영 빌드 + SwiftShader로 S-B 결정적 지표 | 예산 초과, known-red가 통과함 |
| nightly(선택) | self-hosted GPU runner의 `pnpm accept --timing` | 경고만 |

CI가 실제로 도는지 확인하는 것이 VER-06의 첫 완료 조건이다. 로컬 main은 origin보다 28커밋 앞서 있어 새 workflow가 GitHub에서 실행된 적이 없다. 지금 PR 단계에는 브라우저 검사가 없고, 배포 후 `release/browser.mjs`가 WebGL 환경에서 minihome 저장·재로드만 확인한다.

### 5.5 1.x 표면 동결

공개 API가 새 코어로 옮겨 가는 동안 다음 네 가지를 함께 게이트로 쓴다.
- `exportSnapshot`: 값 export 1,765개. 루트 1,088개
- `packageExports`: 타입 표면
- `examplePackageConsumption`: 예제는 공개 서브패스만 쓰고, 모든 서브패스를 소비한다
- `verify-package-consumer`: pack 결과를 소비자로 설치해 확인한다
  - tsc 4종
  - runtime smoke
  - 헤드리스 Rapier 접지·고정 틱 grounding smoke
  - BrowserSmoke 빌드

추가로 두 가지를 한다.
- BrowserSmoke를 실제 브라우저로 연다. 지금은 빌드만 한다.
- React 18/R3F 8 피어 조합을 매트릭스에 넣는다. 지금은 React 19/R3F 9만 설치한다.

## 6. 마일스톤 확인 방법

소유자는 마일스톤마다 아래 두 가지로 완료를 확인한다. 시나리오 표가 녹색이고, 손으로 해 보는 확인이 기대대로 된다.

| 마일스톤 | 녹색이어야 할 시나리오 | 손으로 확인 |
|---|---|---|
| M0 | 모든 시나리오가 green 또는 known-red로 분류됨. S-H10, S-H11, S-B11 green | `/accept`에서 전체 실행 → 표가 나오고 빨간 항목이 PRD의 남은 항목과 일치 |
| M1 | S-H01~S-H08 | 에디터에서 Play → 이동·생성·삭제 → Stop → 씬이 Play 전과 같음 |
| M2 | S-B03~S-B08, S-B12, S-H09 | 1만 타일 월드에서 칠하기를 연타해도 HUD의 long task 0, 가만히 두면 렌더 0/s |
| M3 | S-B09, S-B13, S-B14, S-H13, S-B11 | minihome이 새 코어 위에서 기능 체크리스트 통과, NPC 30체가 예산 안 |
| M4 | S-H12, S-H15, S-H16 | 저장 → 새로고침 → 로드가 같고, 에셋 경로를 바꿔도 저장본이 열림 |
| M5 | S-B13 | Hierarchy가 플레이어·NPC·건설을 모두 보여주고, 인스펙터로 필드를 고치고 undo가 그 변경만 되돌림 |
| M6 | S-B10 | 등급별 스크린샷과 GPU ms 비교표, 저사양 기기에서 auto가 low를 고름 |

## 7. 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| VER-01a | kernel `EngineStats`(정수 카운터, snapshot/reset)와 `runtime.stats`. 렌더 카운터는 `readRendererStats` 확장, 프레임 카운터는 FrameScheduler·FixedStepClock | 카운터 단위 테스트, 운영 번들에 수집 UI 0 |
| VER-01b | 도메인 카운터 연결(저장, 네트워크, 에셋, 오류). batch·엔티티 카운터는 해당 항목이 생길 때 추가. `PerformanceCollector`는 4Hz store 쓰기 대신 `runtime.stats`를 읽는 HUD로 바꾸고 dev에서도 기본 마운트하지 않는다(editor 경로 re-export는 `@deprecated`) | S-H10·S-H11이 카운터로 판정, 기본 설정 월드에서 성능 store 쓰기 0 |
| VER-02a | jest project `accept`, 시나리오 정의 형식, `measureAllocations`, budgets.json·known-red 처리 | 지금 코드로 S-H10, S-H11, S-H13, S-H14를 실행해 green/known-red 판정 |
| VER-03a | `pnpm accept`: 운영 빌드, preview 서버, Playwright 러너, 카운터 수집, 보고서(터미널·JSON·HTML) | 지금 코드로 S-B01~S-B05, S-B11을 실행해 판정 |
| VER-03b | `--timing`과 기기별 기준 파일, 3회 중앙값 | 같은 기기 3회 편차 기록 |
| VER-04a | `/accept` 페이지와 HUD | 로컬·배포 데모에서 전체 실행 표 |
| VER-05a | 기준 장면 확장(`examples/world`): NPC, 원격 mock, window 벽, water patch 규모 파라미터, 정지·궤도·편집 경로, 라이브러리 조명(`DynamicSky` 또는 `CascadedSun`) 사용 | S-B03~S-B09가 이 장면에서 실행 |
| VER-06a | 커밋 push, PR에서 세 체크 실행 확인, 트리거 브랜치 정리(main/master), pnpm store 캐시 | PR 화면에 세 체크와 시나리오 표 |
| VER-07a | S-B12 A/B 스크린샷 비교(렌더 경로 플래그) | 옛 경로끼리 비교 시 차이 0 |
| VER-08a | 깨진 probe 정리: 삭제된 라우트를 여는 8개를 수용 시나리오로 옮기거나 `scripts/archive`로. 대상은 `browser-smoke`(`/minimal`), `probe-webgpu-world`(`/showcase`, `/minimal`), `probe-social-world`·`probe-editor-return`(`/world`에 없는 저장 버튼), `probe-creator-menu`(`/creator`), `probe-multiplayer-panel`(`/multiplayer`), `probe-toon-water`(`/water-comparison`), `probe-avatar`(`/avatar`). 남는 probe는 공용 서버(`startProbeServer`)와 오류 수집(`collectPageErrors`)을 쓰고 포트를 vite 설정에서 읽는다 | 남은 probe 전부 실행 성공, `test:browser` 통과 |
| VER-08b | 내부 경로(`/src/core/...`)를 import하는 fixture(`rendering-performance.tsx`, `unified-world.tsx`)와 `benchmark-*.cjs`를 공개 API나 수용 시나리오로 옮김. 코어 재작성 중 깨지지 않게 하기 위해서다. minihome `apiChecks`의 라이브러리 검사 9개는 jest로 | fixture·벤치의 내부 경로 import 0 |
| VER-08c | 1.x 표면 동결 게이트(5.5): BrowserSmoke 브라우저 실행, React 18/R3F 8 매트릭스 | 매트릭스 두 조합 통과 |

## 8. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| SwiftShader에서 결정적 지표가 실제 GPU와 다름 | draw·batch·commit·바이트는 GPU와 무관한 CPU 측 값이다. GPU 종속 지표(program 수 등)는 CI와 로컬 예산을 따로 둔다 |
| 카운터가 핫패스를 느리게 함 | 정수 증가만 한다. 문자열·객체를 만들지 않는다. 수집 UI는 운영 번들 밖 |
| 예산을 슬쩍 올려 통과 | budgets.json 변경은 PR 설명에 이유 필수. 증가 변경은 리뷰 체크리스트 항목 |
| 시나리오가 실제 사용과 다름 | minihome과 `/world` 두 장면을 쓰고, 버그 제보를 시나리오로 추가한다 |
