# Epoch: Spatial Runtime Foundations

## 목표와 범위

공용 spatial application에서 재사용할 placement/avatar/spatial-resource/portal/pet/presence capability의 경계를 고정하고, 첫 migration slice로 building-specific placement에서 generic placement seam을 추출한다.

현재 source of truth:
- placement: building domain의 editor/store/placed-object 흐름
- avatar: character controller + animation/cinematic equipment/expression 기능에 분산
- portal: gameplay/cinematic teleport action 중심
- presence: network의 Ephemeral state 원칙은 존재
- pet: 전용 runtime 없음
- spatial resource binding: 전용 generic contract 없음

목표 source of truth:
- generic placement primitive를 building 아래의 중복 기능으로 새로 만드는 것이 아니라 기존 building path를 보존하며 공용 seam으로 추출
- avatar/pet/portal/presence/resource binding은 제품 business domain을 모르는 engine-neutral contract

제외:
- 미니홈 frontend
- friend/guestbook/feed
- backend DB/authorization
- AI memory/personality/planner
- 기존 building 전체 재작성
- 대규모 multiplayer 재설계

리스크:
- building placement를 성급하게 일반화하면 기존 editor UX와 save schema가 깨질 수 있다.
- 새 abstraction이 기존 registry/store/event와 중복될 수 있다.

## 현재 코드 대조

### Placement

상태: PARTIAL / HIGH REUSE

근거:
- building domain에 placed object와 placement UI/store가 이미 존재한다.
- editor command stack과 selection/play-mode 자산도 존재한다.

결정:
- 새 PlacementStore부터 만들지 않는다.
- 먼저 building의 순수 placement calculation/validation seam을 식별한다.

### Avatar

상태: PARTIAL / REUSE CHARACTER STACK

근거:
- character movement/model/animation path가 존재한다.
- cinematic action에서 expression/equipment/animation capability가 존재한다.

결정:
- 새 avatar engine을 만들지 않는다.
- model adapter와 appearance/equipment/emote public boundary만 추후 통합한다.

### Portal

상태: PARTIAL

근거:
- teleport gameplay/cinematic action이 존재한다.

결정:
- teleport를 보존하고 destination descriptor + lifecycle이 필요한 시점에 얇은 portal abstraction을 추가한다.

### Presence

상태: PARTIAL / CONTRACT EXISTS

근거:
- `.codex/context/networking.md`에서 avatar transform, typing, cursor, presence를 Ephemeral로 분류한다.
- network contract는 engine-neutral primitive 원칙을 가진다.

결정:
- 새 network stack을 만들지 않는다.
- 기존 adapter 위에 presence bridge가 필요한지 소비 앱 요구와 함께 검증한다.

### Pet Runtime

상태: MISSING

결정:
- AI brain은 외부.
- bounded PetIntent를 실행하는 body runtime만 gaesup-world 후보로 둔다.
- placement foundation 이후 별도 slice로 진행한다.

### Spatial Resource Binding

상태: MISSING AS GENERIC CONTRACT

결정:
- billboard/interaction/content 유사 기능을 먼저 검색한다.
- objectId/resourceId/resourceType 수준의 최소 contract만 고려한다.

## Slice 1: Generic Placement Seam

### Discovery

1. `src/core/building`의 placement calculation, store, editor UI, serialization 흐름을 추적한다.
2. placement와 building-specific rule을 분류한다.
3. 기존 command/selection/scene object infrastructure와 겹치는 책임을 확인한다.
4. 새 domain 생성 없이 기존 building 내부 seam으로 먼저 추출 가능한지 판단한다.

### 목표

- generic transform/validation logic과 building-specific placement rule의 경계를 명확히 한다.
- public API는 실제 consumer requirement가 생기기 전까지 최소화한다.
- 기존 save payload와 editor behavior를 유지한다.

### 검증

- `corepack pnpm test -- src/core/building --runInBand`
- `corepack pnpm exec tsc -p tsconfig.build.json --noEmit`
- public API 변경 시 publicApi/packageExports tests
- examples의 building/editor scenario 확인

## 완료 조건

- [ ] product boundary 문서가 AGENTS routing에 연결됨
- [ ] spatial runtime contract가 AGENTS routing에 연결됨
- [ ] reviewer가 product-domain leakage와 AI brain leakage를 검사함
- [ ] Slice 1 구현 전 building placement ownership map 작성
- [ ] 기존 building save/editor behavior를 보존하는 migration path 확정
- [ ] 필요한 검증 실행·결과 기록
