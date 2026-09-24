# PRD-10 성능 예산과 측정 체계

| 항목 | 값 |
|---|---|
| 우선순위 | P0 |
| 트랙 | Fast |
| 선행 PRD | 00 |
| 담당 agent | runtime |

## 1. 배경과 문제

측정 도구는 이미 많다. `scripts/frame-harness.cjs`, `scripts/performance/probe.mjs`, `benchmark-{runtime,scene-commands,culling,camera-collision}.cjs`, `probe-rendering-performance.cjs`, `examples/performance`의 시나리오 35개, `perf/rendererStats.ts`의 `readRendererStats`, `FrameScheduler` metrics가 있다. 부족한 것은 다음 세 가지다.

1. **실장면 기준선이 없다.** `examples/performance/scenarios/rendering.ts:8-25`는 InstancedMesh 하나만 측정한다. `probe-rendering-performance.cjs`는 날씨, 후처리, gpu-driven fixture만 본다. 12·13 PRD의 주요 비용(그룹 수에 비례하는 draw call, 편집 시 O(N) 복사, 카메라 회전 중 React commit)을 재현하는 장면이 없다.
2. **예산이 없다.** "느리지 않아야 한다"는 기준만 있고, 프레임·할당·draw call·commit·번들·네트워크 바이트의 수치 상한이 없다.
3. **회귀 게이트가 없다.** 벤치마크 결과를 기준과 비교해 실패시키는 단계가 `verify`와 CI에 없다. 반대로 `useBaseLifecycle.test.ts:420`처럼 벽시계 임계값을 unit test에 넣어 환경에 따라 실패한다(D-20).

## 2. 목표 / 비목표

**목표**
- 성능 PRD(11~15)가 공유하는 예산과 측정 방법을 한 곳에 정의한다.
- 파라미터로 규모를 조절하는 seeded 기준 장면을 만든다.
- 결정적 지표(호출 수, 할당 수, draw call, 바이트)는 CI에서, 비결정적 지표(ms)는 로컬·nightly에서 판정한다.

**비목표**
- 새로운 프로파일러 개발. 기존 harness와 `readRendererStats`를 확장한다.
- 모든 기기에서의 성능 보장. 기준 기기 1~2종으로 판정한다.

## 3. 현재 상태

| ID | 발견 | 근거 |
|---|---|---|
| 10-F01 | 기준 장면 부재 | 위 1절 |
| 10-F02 | 품질 프로파일이 렌더러에 연결되지 않음 | `perf/detect.ts:81-110`이 tier별 `pixelRatio`, `shadowMapSize`를 계산하지만 소비처가 없다. `instanceScale`만 `Grass.tsx:320`에서 쓴다 [확인] |
| 10-F03 | 벽시계 unit test | `useBaseLifecycle.test.ts:420` `expect(endTime - startTime).toBeLessThan(1000)` [실측: 1,567ms로 실패] |
| 10-F04 | 벤치 결과가 판정에 쓰이지 않음 | `benchmark:*`, `bench:frame`, `test:performance:browser`가 `verify`/CI에 없다 [확인] |
| 10-F05 | 계측이 스케줄러 밖 루프를 못 봄 | drei `useAnimations`의 내부 `useFrame`, rapier `UseFrameStepper`, 별도 rAF(`AnimationClockLoop`, `BrowserGamepadHub`, `useEntityLifecycle`)는 `FrameScheduler` metrics에 잡히지 않는다 [확인] |
| 10-F06 | PerformanceLab이 baseline JSON 28개(16.7MB)를 한꺼번에 로드 | `examples/performance/baselines/index.ts`의 `Promise.all`. 최대 파일 2.9MB [실측] |

## 4. 요구사항

**FR**
- FR-10-01: seeded 기준 장면 `perf-world`를 `examples/performance`에 추가한다. 파라미터는 tile group 수, 타일 수, grass 타일 수, window 벽 수, water patch 수, 모델 배치 수, NPC 수, 원격 플레이어 수(mock)다.
- FR-10-02: 장면은 고정 카메라 경로 세 가지를 제공한다. 정지, 360° 궤도, 편집 hover sweep.
- FR-10-03: 샘플러는 매 프레임 다음을 기록한다. frame interval, `FrameScheduler` phase별 ms, `readRendererStats`(calls, triangles, programs, geometries, textures), React commit 수(Profiler `onRender`), rapier collider 수, `performance.memory.usedJSHeapSize`.
- FR-10-04: jest 벤치 도구 `measureCalls`(spy 기반 호출 수)와 `measureAllocations`(가능한 경우 `--expose-gc` + heap delta)를 `test/perf/`에 둔다.
- FR-10-05: 결과를 `.artifacts/performance/<timestamp>/summary.json`에 저장하고, 기준 파일과 비교하는 `scripts/performance/compare.mjs`를 만든다.
- FR-10-06: `perf/detect.ts`의 프로파일을 Canvas `dpr`, 섀도 맵 크기, 후처리 품질에 연결하는 단일 적용 지점을 만든다(12 PRD와 공유).

**NFR**
- NFR-10-01: CI 판정은 결정적 지표만 쓴다(호출 수, draw call, commit 수, 바이트, 생성된 geometry 수). ms는 CI에서 경고만 낸다.
- NFR-10-02: 벽시계 임계값은 unit test에 두지 않는다. 기존 것은 호출 수 기준으로 바꾸거나 벤치로 옮긴다.
- NFR-10-03: 측정 코드는 production 번들에 포함되지 않는다(`import.meta.env.DEV` 또는 별도 엔트리).

## 5. 성능 예산

수치는 **초기 목표**다. 10-a에서 현재값을 측정한 뒤 확정한다. 기준 장면 규모는 `M`(tile group 50, 타일 5k, grass 타일 200, window 벽 40, water 10, 모델 100, NPC 30, 원격 플레이어 24)이다.

| 영역 | 지표 | 목표 | 판정 위치 | 관련 PRD |
|---|---|---|---|---|
| 프레임 | 기준 기기 p95 frame interval, 정지·궤도 | ≤ 16.7ms | nightly | 11, 12 |
| 프레임 | 엔진 phase 합계(스케줄러 metrics) | ≤ 4ms | nightly | 11 |
| 프레임 | steady state 프레임당 JS 할당 | 0에 근접(목표 < 1KB/frame) | nightly | 11 |
| 프레임 | 스케줄러 밖 per-frame 콜백 수 | 0(허용 목록 제외) | CI | 11 |
| React | 정지 카메라 1초당 commit | 0 | CI | 13 |
| React | 궤도 카메라 1초당 commit | ≤ 2 | CI | 12, 13 |
| React | hover sweep 5초 동안 `BuildingPanel` render | ≤ hover 셀 변경 수 × 0(패널 불변) | CI | 13 |
| 렌더 | 궤도 중 geometry 생성·해제 | 0 | CI | 12 |
| 렌더 | 메인 pass draw call(M) | 측정 후 50% 감소 | CI | 12 |
| 렌더 | warm-up 이후 새 program 컴파일 | 0 | CI | 12 |
| 편집 | 타일 1개 추가 `set` 시간(타일 10k) | O(1), < 1ms | nightly | 13 |
| 편집 | hover 1회당 placement engine 생성 | 0 | CI | 13 |
| 네트워크 | 정지 플레이어 송신률 | ≤ 2Hz | CI | 14 |
| 네트워크 | Update 메시지 크기 | JSON 단계 ≤ 120B, binary 단계 ≤ 32B | CI | 14 |
| 저장 | 타일 10k 저장 시 전체 순회 횟수 | ≤ 2 | CI | 14 |
| 저장 | 변경 없는 autosave 직렬화 | 0 | CI | 14 |
| 번들 | 루트에서 scene 문서 API import | < 20KB gz, `@xyflow/react` 없음 | CI | 15 |
| 번들 | `network` 프로토콜 import 폐포 | React·R3F 없음 | CI | 15 |
| 테스트 | 전체 jest 병렬 | ≤ 60초 | CI 경고 | 25 |

## 6. 설계

### 6.1 기준 장면

`examples/performance/scenarios/perfWorld.tsx`에 seeded 생성기를 둔다. 월드 데이터는 공개 API(`gaesup-world`, `gaesup-world/building`)로만 만든다(AGENTS.md examples 규칙). 규모 파라미터는 URL query로 받는다(`/performance?scene=perf-world&size=M`).

### 6.2 샘플러

- 프레임 지표는 `FrameScheduler`의 metrics를 켜고 `late` phase에서 한 번 읽어 링 버퍼(Float64Array)에 쓴다. 샘플러 자체가 프레임 중 할당하지 않는다.
- React commit은 월드 루트를 `<Profiler>`로 감싸 카운터만 증가시킨다.
- 스케줄러 밖 콜백은 R3F store의 `internal.subscribers.length`와 `FrameScheduler.count()`를 비교해 차이를 보고한다(10-F05).

### 6.3 비교와 게이트

`compare.mjs`는 기준 파일(`examples/performance/baselines/<scene>-<size>.json`)과 결과를 지표별 허용 오차로 비교한다. 결정적 지표는 증가 시 실패, ms 지표는 20% 초과 시 경고를 낸다. 기준 파일은 PR에서 명시적으로 갱신해야 바뀐다(quality ratchet과 같은 방식).

### 6.4 PerformanceLab 로딩

baseline JSON은 시나리오를 선택할 때 lazy로 `import()`한다(10-F06).

## 7. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 10-a | 기준 장면 `perf-world`(S/M/L), 궤도·hover 경로, 샘플러 추가. 현재값을 00 문서 3.2절에 기록 | M 장면에서 5절 지표 전부가 JSON으로 출력 |
| 10-b | `test/perf/measureCalls`, `measureAllocations` 추가. D-20 테스트를 호출 수 기준으로 교체. 완료(2026-09-25, 25-b): 교체는 `jest.fn` 호출 수로 충분해 별도 헬퍼는 만들지 않았다 | `useBaseLifecycle` 성능 테스트가 벽시계를 쓰지 않음 |
| 10-c | `compare.mjs`와 기준 파일, `pnpm perf:check` 스크립트 | 결정적 지표 회귀를 인위로 넣으면 실패 |
| 10-d | `perf:check`를 CI job으로 추가(25 PRD의 CI 분리와 함께) | PR에서 자동 실행 |
| 10-e | PerformanceLab baseline lazy import | 초기 로드에서 baseline JSON 요청 0 |

## 8. 공개 API 영향

없음. 측정 도구는 examples와 scripts, test 경로에만 둔다. FR-10-06의 품질 프로파일 적용 지점은 12 PRD에서 공개 API로 다룬다.

## 9. 검증과 완료 기준

- `pnpm perf:check --scene=perf-world --size=M`이 로컬에서 성공하고 summary JSON을 남긴다.
- 인위적 회귀(예: `TileSystem`에서 `React.memo` 제거)를 넣으면 commit 지표로 실패한다.
- 00 문서 3.2절이 채워진다.

## 10. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| headless Chromium의 GPU 수치가 실기기와 다름 | CI는 결정적 지표만 판정. ms는 기준 기기 nightly에서 판정 |
| 기준 장면이 실제 사용과 다름 | minihome 장면을 두 번째 기준 장면으로 추가(열린 질문 2) |
| 측정 코드가 핫패스를 오염 | 샘플러를 typed array 링 버퍼로 만들고 DEV 전용으로 둠 |

## 11. 열린 질문

1. 기준 기기는 무엇으로 정하는가(예: 내장 GPU 노트북 1종, 중급 안드로이드 1종).
2. minihome을 두 번째 기준 장면으로 삼을 것인가.
3. 5절의 목표 수치를 10-a 측정 후 조정할 권한을 누가 가지는가.
