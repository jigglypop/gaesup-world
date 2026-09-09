# Spatial Runtime Feature

공용 spatial runtime 기능을 추가하거나 구조를 바꿀 때 사용한다.

## 먼저 읽기

1. `AGENTS.md`
2. `.codex/context/engineering.md`
3. `.codex/context/invariants.md`
4. `.codex/context/product-boundary.md`
5. `.codex/context/spatial-runtime.md`
6. `.codex/context/harness-gates.md`
7. 관련 domain context
8. `.codex/plans/active/`의 관련 epoch

## Discovery

구현 전에 반드시 다음을 검색한다.

- 동일 목적 service/manager
- registry
- store
- hook/controller
- event
- public export
- examples consumer
- save/network binding

새 abstraction을 만들기 전에 기존 것과 왜 합칠 수 없는지 설명한다.

## Decision

다음을 한 번에 보고한다.

- owner domain
- current source of truth
- target source of truth
- existing reuse
- product boundary 판정
- smallest migration slice
- compatibility strategy
- verification ladder

architecture boundary, public API contract 또는 source of truth가 바뀌면 epoch track으로 전환한다.

## Implementation Rules

- full rewrite 금지
- existing building placement, character stack, teleport action, network adapter를 먼저 재사용
- Layer 1/2/3 boundary 준수
- persistent/network contract는 engine-neutral serializable primitive 사용
- product SNS/backend/AI brain logic core 침투 금지
- public 기능은 examples에서 public package import로 접근 가능해야 함

## Completion

`.codex/context/harness-gates.md`를 검사한다.

실행한 검증만 기록하고 실패/미실행을 분리한다. required gate 실패 시 완료로 보고하지 않는다.
