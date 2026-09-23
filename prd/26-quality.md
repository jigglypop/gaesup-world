# PRD-26 품질과 검증

| 항목 | 값 |
|---|---|
| 우선순위 | P0 (26-a~c) |
| 트랙 | Fast |
| 선행 PRD | 00 |

## 1. 배경과 문제

| ID | 내용 | 근거 |
|---|---|---|
| Q-01 | 계층 경계 린트 없음. CLAUDE.md는 `eslint-plugin-boundaries` 강제를 서술하지만 설정과 lock에 없음. 실제 규칙은 `src/core/**/core/**`의 `no-restricted-imports` 하나 | `eslint.config.js:139-155` |
| Q-02 | 간접 의존(스토어 모듈 경유 zustand, 훅 모듈 경유 React)을 잡지 못함 | `npc/core/blueprint.ts`, `PhysicsSystem.ts:7` |
| Q-03 | 린트 현황 기록 불일치: CLAUDE.md "약 3,457건 실패", todolist "0 errors" | 실측 필요 (PRD-00) |
| Q-04 | HARNESS 기록에 "전체 Jest 미실행", "native GPU/FPS 검증 미완료" 반복 | `HARNESS.md` 2026-09-05 섹션들 |
| Q-05 | `interface` 494건, 크기 초과 58개 파일, `console.*` 약 10곳 | 정적 측정 |
| Q-06 | 테스트 없는 도메인: effects, error, input, items, ops, tools, types, wasm | 정적 측정 |
| Q-07 | 커밋 메시지 `new`/`jew` 27건 (최근 50개 중) | git log |
| Q-08 | 테스트가 핵심 결함을 mock으로 가림 | `useManagedEntity.test.ts:24-47` |

## 2. 목표

1. 아키텍처 규칙을 도구로 강제한다.
2. 기존 위반은 한 번에 고치지 않고 **늘어나지 않게(ratchet)** 한다.
3. 브라우저에서 실제 프레임과 렌더를 검증하는 경로를 만든다.
4. 완료 선언에 필요한 검증 사다리를 CI에서 돌린다.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | `eslint-plugin-boundaries` 도입: 요소 타입(core, bridge, hooks, components, stores, editor, kits), 허용 규칙표 |
| FR-2 | 간접 의존 검사: `dependency-cruiser` 또는 자체 스크립트로 `src/core/**/core/**`에서 react, zustand, @react-three/fiber 도달 여부 검사 |
| FR-3 | ratchet: 규칙별 현재 위반 수를 `quality-baseline.json`에 기록, CI에서 증가 시 실패, 감소 시 갱신 요구 |
| FR-4 | `interface`, `console`, 파일 크기, raw `useFrame` 규칙을 ratchet 대상에 포함 |
| FR-5 | 브라우저 E2E(`test:browser` 확장): 데모 World 로드, 이동, 점프, 카메라, 건설 배치, 저장·복원 |
| FR-6 | 프레임 측정 하네스: 고정 시드, 60초 스크립트 주행(PRD-17 입력 재생), 평균·p95 프레임 시간, 프레임당 GC 추정, draw call 기록 |
| FR-7 | 백엔드별 스크린샷 비교(PRD-19) |
| FR-8 | CI 파이프라인: PR마다 타입, 변경 도메인 테스트, ratchet, 패키지 가드. main 병합 시 전체 테스트, memory, 브라우저 E2E |
| FR-9 | mock 규칙: DI, 브리지, 스토어를 전부 mock한 테스트만으로는 기능 완료로 보지 않음. 도메인당 실제 연결 통합 테스트 최소 1개 |
| FR-10 | 커밋 메시지 규칙: conventional commits, commitlint 훅 (사용자 확인) |

## 4. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 26-a | PRD-00 기준선 측정 결과로 `quality-baseline.json` 생성 | 파일 커밋 |
| 26-b | `eslint-plugin-boundaries` 도입, 현재 위반은 baseline에 기록 | 새 위반 시 린트 실패 |
| 26-c | 간접 의존 검사 스크립트 | Layer 1 → React 도달 목록 출력 |
| 26-d | ratchet CI | PR 체크 |
| 26-e | 테스트 없는 도메인 최소 테스트 | 8개 도메인 각 1개 이상 |
| 26-f | 브라우저 E2E 시나리오 | 5개 시나리오 통과 |
| 26-g | 프레임 측정 하네스 | 기준선 수치 기록 |
| 26-h | commitlint (사용자 확인) | 훅 동작 |
| 26-i | `CLAUDE.md`, `AGENTS.md`에서 실제와 다른 서술 교정 (사용자 확인) | 문서와 설정 일치 |

## 5. 검증과 완료 기준

- CI에서 ratchet과 경계 린트가 동작하고, 의도적 위반 PR이 실패하는 것을 확인
- 프레임 하네스로 PRD-11, 13, 14, 15, 19의 전후 비교 수치 기록

## 6. 열린 질문

1. CI 환경(GitHub Actions) 사용 여부와 브라우저 E2E를 CI에서 GPU 없이 돌릴 방법(WebGL2 소프트웨어 렌더, WebGPU는 로컬 전용 등).
2. commitlint 도입 여부.

## 구현 현황 (2026-09-23, 2차)

| Slice | 상태 | 내용 |
|---|---|---|
| 26-c | 완료 | `scripts/check-entry-isolation.cjs`: 엔트리 격리 검사(`pnpm check:entries`)와 Layer 1 간접 의존 검사(`pnpm check:layer1`, 현재 3건 기준 ratchet) |
| 26-e | 부분 | input 도메인에 첫 테스트 추가(미실행) |
| 나머지 | 미착수 | |

아키텍처 경계 기준선은 사라진 위반 2건을 반영해 16에서 14로 줄였다(PhysicsSystem → AnimationController, DirectionComponent → stores/mode/types).

검증: 타입체크(src, examples)와 변경 파일 린트 통과. 새 테스트는 메모리 제약으로 실행하지 않았다.
