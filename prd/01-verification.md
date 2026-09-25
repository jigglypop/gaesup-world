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

엔진이 운영 빌드에서도 유지하는 정수 카운터다(`kernel/stats.ts` `EngineStats`). 다른 곳에 이미 있는 값(고정 시계 틱 수, 스케줄러 프레임 번호)은 source로 등록해 조회할 때만 읽고, 없는 값만 counter 핸들을 증가시킨다. 수집·표시 UI는 운영 번들에 넣지 않는다. `runtime.stats.snapshot()`으로 읽고 `reset()`으로 측정 구간을 새로 시작한다. 지금 등록된 것은 `fixedTicks`, `clockSystems`, `frames`(`FrameSchedulerHost`가 있을 때)다.

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

시나리오는 한 번만 정의한다. headless는 `test/accept/*.test.ts`, browser는 PerformanceLab 수용 모음(`examples/performance/accept/suite.ts`)이다. 정의는 준비(장면·규모), 단계(입력·명령), 단언(카운터 예산·동작)으로 이루어진다. 예산 수치는 `test/accept/budgets.json`에 두고 PR에서 이유와 함께만 바꾼다.

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
| S-H14 | 공개 엔트리가 도달하는 우리 모듈의 최상위 부수효과(TypeScript 구문 트리로 정적 측정) | 결과를 버리는 최상위 호출 0, 클래스 decorator 0, 모듈 최상위 store 0. 그 밖의 최상위 호출은 기록만 | COR-09, COR-12, PKG-01 |
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

jest project `accept`(`test/accept/*.test.ts`, 기본 node 환경)로 돈다. `pnpm test:accept`로 따로 돌리고, `pnpm verify`와 CI jest 잡에는 자동으로 포함된다.

- 시나리오 상태와 예산은 `test/accept/budgets.json` 하나에 둔다. 상태는 green, known-red, pending 셋이다.
- `catalog.test.ts`가 이 파일과 이 문서의 시나리오 표가 같은지 검사한다. pending 시나리오는 매 실행에 todo로 표시한다.
- 시나리오는 공개 엔트리(`gaesup-world`, `gaesup-world/network` 등)로만 작성한다. 코어를 바꾸는 동안에도 깨지지 않게 하기 위해서다.
- 결과는 `.artifacts/accept/headless/<id>.json`(측정값, 위반 목록)에 남는다.
- 할당 측정은 `--expose-gc`와 heap delta를 쓰는 `measureAllocations`(`test/perf/`, 첫 할당 시나리오와 함께 추가)로 한다.
- 순수 Node 수치가 필요한 벤치(00 문서 4.3 참고)는 jest 밖에서 돈다.

### 5.2 `pnpm accept`(VER-03)

`scripts/accept.mjs`가 다음 순서로 돈다. `--no-build`는 기존 `demo-dist`를 쓰고, `--only=S-B02,S-B11`은 일부만 돈다.

1. `scripts/build-demo.mjs`로 배포 데모와 같은 운영 빌드를 만든다(수용 페이지 포함, 5.3).
2. `vite preview`로 `/gaesup-world/` 아래에 서빙하고 Playwright로 `/accept`를 연다. 로컬은 Chrome 채널의 실제 GPU(WebGPU)다. CI는 `--software`(SwiftShader)다.
3. 브라우저 시나리오는 페이지의 `window.performanceLab.run`으로 실행한다. 판정도 페이지가 같은 예산표로 한다(`accept.verdict`). 러너는 시나리오가 판정한 직후 살아 있는 장면을 스크린샷으로 남긴다.
4. S-B01(경로별 첫 로드)만 러너가 잰다. 경로마다 로드한 청크의 gzip 크기를 합하고, 청크 sourcemap의 원본 경로로 rapier·editor·postprocessing 포함 여부를 본다. 판정은 페이지의 `accept.judge`로 한다.
5. 결과를 터미널 표, `.artifacts/accept/<시각>/report.json`, `report.html`(스크린샷 포함)로 낸다. CI에서는 같은 표를 job summary에 쓴다. green이 예산을 넘거나 known-red가 예산 안으로 들어오거나 측정이 오류면 실패한다.
6. `--timing`(VER-03b)이면 ms 지표를 기기별 기준 파일(`test/accept/timing/<기기>.json`)과 비교해 경고한다. 그때 `perf:check`·`perf:world`(frame harness, dev 서버 측정)를 이 러너로 대체한다.

### 5.3 `/accept` 페이지(VER-04)

`/accept`는 PerformanceLab(`examples/performance`)의 수용 모음(`suite="accept"`)이다. Lab의 시나리오 계약, 실행 기록, IndexedDB 저장, JSON 입출력, 자동화 API를 그대로 쓴다.

- 보드: 전체 시나리오의 상태, 판정, 위반. 브라우저 시나리오는 개별·전체 실행이 되고, 보고서 JSON으로 내보낸다. headless 시나리오와 S-B01은 판정하는 곳(`pnpm test:accept`, `pnpm accept`)을 표시한다.
- 마일스톤 체크리스트: 6절 표를 문서에서 직접 읽는다(`examples/performance/accept/milestones.ts`). 형식은 `catalog.test.ts`가 지킨다.
- 실시간 HUD: fps, 최악 프레임, draw, 삼각형, program, React commit, long task, 요청, 기기 등급(auto). React commit은 devtools hook 스텁으로 센다. 이 스텁은 `index.html`이 앱보다 먼저 실행하는 모듈(`accept/counters.ts`)이 설치한다. HUD는 DOM에 직접 쓰므로 commit을 만들지 않는다.
- 브라우저 시나리오는 기준 장면(`examples/world`의 `PerfWorldScene`)과 minihome 엔진 위에서 돈다. 입력이 장면에 닿지 않았거나 캐릭터가 떨어지는 등 측정이 무효면 오류로 판정한다.
- 운영 빌드에 들어가므로 배포 데모(GitHub Pages)에서도 열린다. 휴대폰에서 같은 표를 본다.

### 5.4 CI(VER-06)

| job | 내용 | 실패 조건 |
|---|---|---|
| verify | typecheck, lint, 계층·엔트리·품질 검사, jest(accept 프로젝트 포함), build, publint, 패키지 소비자 검증 | 기존과 같음. known-red가 예산 안으로 들어오면 실패 |
| accept-browser | 운영 빌드 + SwiftShader로 S-B 결정적 지표 | 예산 초과, known-red가 통과함 |
| nightly(선택) | self-hosted GPU runner의 `pnpm accept --timing` | 경고만 |

accept-browser 잡은 `pnpm accept --software`로 돈다. `ci/**` push에서 연속으로 녹색이 된 뒤 릴리스 관문(needs)에 넣는다. 배포 후에는 `release/browser.mjs`가 WebGL 환경에서 minihome 저장·재로드를 확인한다.

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
| VER-01b | 도메인 카운터 연결(저장, 네트워크, 에셋, 오류). batch·엔티티 카운터는 해당 항목이 생길 때 추가. `PerformanceCollector`는 4Hz store 쓰기 대신 `runtime.stats`를 읽는 HUD로 바꾸고 dev에서도 기본 마운트하지 않는다(editor 경로 re-export는 `@deprecated`) | S-H10·S-H11이 카운터로 판정, 기본 설정 월드에서 성능 store 쓰기 0 |
| VER-03b | `--timing`과 기기별 기준 파일, 3회 중앙값 | 같은 기기 3회 편차 기록 |
| VER-05b | 에디터 기준 경로: 예제에 에디터 셸(NPC 패널, BlueprintPreview)을 여는 경로와 그 조작 스크립트 | S-B13이 이 경로에서 실행 |
| VER-06a | 기본 브랜치를 하나로(GitHub 기본 브랜치는 `master`, 작업은 `main`, 사용자 결정), `accept-browser`를 릴리스 관문에 추가 | PR과 `ci/**` push에서 브라우저 잡까지 녹색, 릴리스가 accept-browser를 기다림 |
| VER-07a | S-B12 A/B 스크린샷 비교(렌더 경로 플래그) | 옛 경로끼리 비교 시 차이 0 |
| VER-08c | 1.x 표면 동결 게이트(5.5): BrowserSmoke 브라우저 실행, React 18/R3F 8 매트릭스 | 매트릭스 두 조합 통과 |

## 8. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| SwiftShader에서 결정적 지표가 실제 GPU와 다름 | draw·batch·commit·바이트는 GPU와 무관한 CPU 측 값이다. GPU 종속 지표(program 수 등)는 CI와 로컬 예산을 따로 둔다 |
| 카운터가 핫패스를 느리게 함 | 정수 증가만 한다. 문자열·객체를 만들지 않는다. 수집 UI는 운영 번들 밖 |
| 예산을 슬쩍 올려 통과 | budgets.json 변경은 PR 설명에 이유 필수. 증가 변경은 리뷰 체크리스트 항목 |
| 시나리오가 실제 사용과 다름 | minihome과 `/world` 두 장면을 쓰고, 버그 제보를 시나리오로 추가한다 |
