# Harness Gates

비단순 spatial runtime 변경은 구현 완료와 검증 완료를 분리한다.

## Discovery Gate

- [ ] owning domain을 확인했다.
- [ ] 기존 service, manager, registry, store, hook, event를 검색했다.
- [ ] 재사용 가능한 기존 path를 기록했다.
- [ ] 제품 business concept가 core로 새지 않는지 확인했다.

## Architecture Gate

- [ ] Layer 1/2/3 dependency 방향을 지킨다.
- [ ] React/Zustand가 simulation hot path에 침투하지 않는다.
- [ ] Three/Rapier runtime object가 canonical persistent state에 들어가지 않는다.
- [ ] backend/AI SDK가 core에 직접 들어가지 않는다.
- [ ] 새 global singleton/event bus/registry가 꼭 필요한지 검토했다.
- [ ] old/new path가 공존하면 canonical path를 명시했다.

## Public API Gate

public surface 영향이 있을 때:

- [ ] root 또는 적절한 subpath export가 있다.
- [ ] package exports를 확인했다.
- [ ] vite entry/alias를 확인했다.
- [ ] tsconfig path를 확인했다.
- [ ] CJS declaration copy를 확인했다.
- [ ] publicApi/packageExports test를 확인했다.
- [ ] examples는 public package import만 쓴다.

## Persistence Gate

저장 상태가 있을 때:

- [ ] SaveSystem key 충돌이 없다.
- [ ] serialize/hydrate가 plain serializable data를 사용한다.
- [ ] migration/version 필요성을 검토했다.
- [ ] dispose/unregister가 있다.
- [ ] server canonical state와 local runtime save가 혼동되지 않는다.

## Runtime/Performance Gate

- [ ] useFrame에 불필요한 allocation을 추가하지 않는다.
- [ ] frame마다 React state update하지 않는다.
- [ ] store 전체 구독을 추가하지 않는다.
- [ ] subscription/listener/resource cleanup이 있다.
- [ ] geometry/material/texture/GPU ownership이 명확하다.

## Example Gate

public 또는 user-visible capability는:

- [ ] examples에서 실제 접근 가능하다.
- [ ] private src import가 없다.
- [ ] plugin/runtime registration이 필요하면 실제 showcase에 연결된다.

## Completion Gate

DONE은 다음을 모두 만족할 때만 사용한다.

- requested behavior implemented
- architecture review pass
- related tests pass
- affected type/public/package verification pass
- required example integration pass
- 실행한 검증과 미실행 검증을 구분해 기록
- unrelated changes 없음

검증 실패를 숨기거나 실행하지 않은 검증을 통과했다고 기록하지 않는다.
