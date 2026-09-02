# Epoch 2m: Interaction Reset Lifecycle

## 목표

`InteractionSystem.reset()`이 mutated raw input, aggregate scalars, metrics와 config를 fresh defaults로 복원하도록 교정하되, 외부 adapter·hook·store가 보유한 raw quartet top-level identity와 backend subscriptions는 유지한다.

## 현재 상태

- `InteractionSystem`은 literal state/metrics를 `AbstractSystem`에 전달한다.
- legacy object-initializer reset은 현재 state/metrics를 shallow-copy하므로 keyboard, mouse, gamepad, touch, `eventCount`, `activeInputs`, `metrics.lastUpdate`와 config mutation이 reset 뒤에도 남는다.
- `onReset()`은 no-op이고 raw field event를 발행하지 않아 default backend와 Zustand projection이 reset 결과를 관찰하지 못한다.
- raw update는 caller의 nested Vector, array와 object reference를 `Object.assign`으로 채택할 수 있다.
- adapter, default backend, hook와 store는 raw quartet top-level reference를 장기 보유하므로 reset에서 quartet 자체를 교체하면 stale reference가 생긴다.

## 범위

- interaction raw quartet, aggregate state, metrics와 config의 local default creators를 둔다.
- constructor는 factory를 `AbstractSystem` initializer로 넘기지 않고 한 번 생성된 default object를 전달해 legacy base reset 계약을 보존한다.
- `onReset()`에서 quartet top-level object identity를 유지하며 own properties를 fresh defaults로 완전히 교체한다.
- nested Vector, array, map-like object와 gesture/button structures는 fresh-owned 값으로 교체해 caller-owned payload를 역변이하지 않는다.
- `lastUpdate`, `isActive`, metrics와 config를 defaults로 복원하되 metrics hot-path scratch인 `activeInputs` 배열 identity는 유지하고 in-place clear한다.
- 등록된 callbacks는 reset에서 유지하고 state→metrics→config 복원이 모두 끝난 뒤 단일 내부 `reset` event로 projection을 알린다.
- system-backed adapter가 단일 `reset` event를 구독하고 완성된 snapshot을 정확히 한 번 전달한다.
- reset callback의 재진입은 system-local guard로 차단한다.
- reset observer dispatch는 시작 시점의 listener snapshot으로 한정해 dispatch 중 add/remove가 같은 reset을 되살리지 않게 한다.
- system/default backend observer 예외를 listener별 project logger 경계에 격리해 나머지 listener, unsubscribe handle과 backend binding을 보존한다.
- raw quartet에 non-configurable own property가 있거나 retained object가 non-extensible이면 base reset 전에 검출해 partial reset 없이 원자적 no-op 처리한다. symbol과 non-enumerable을 포함한 configurable pollution 및 prototype pollution은 제거한다.
- `activeInputs`의 clearability도 base reset 전에 검증하고 identity와 배열 prototype을 유지·복원하면서 index, string과 symbol pollution을 모두 제거한다.
- dispose에서만 callbacks를 제거하는 기존 ownership을 유지한다.
- System, system-backed adapter, default Zustand projection과 default/system-backed Bridge reset 회귀 테스트를 추가한다.

## 제외 범위

- `AbstractSystem.reset()`과 다른 system의 legacy object/factory initializer 의미를 변경하지 않는다.
- raw quartet top-level object를 교체하거나 constructor에 factory initializer를 전달하지 않는다.
- `metrics.lastUpdate`의 dormant 의미나 frame/input update timestamp 정책을 변경하지 않는다.
- Zustand의 config, metrics, `isActive`와 System state source of truth를 통합하지 않는다.
- `systemListenersBound` 전역 binding, object-selector 반응성, default resolver rebind를 이 slice에서 교정하지 않는다.
- injected/memory `InputBackend`에 reset API를 추가하지 않고 injected backend의 Bridge reset을 지원 계약으로 만들지 않는다.
- Bridge가 injected/shared systems를 dispose하는 ownership과 snapshot live-ref 의미를 변경하지 않는다.
- public 타입, export, package declaration과 architecture baseline을 변경하지 않는다.

## Source of Truth

- `InteractionSystem` local default creators가 System-owned state, metrics와 config reset defaults의 canonical source다.
- raw quartet top-level object는 System이 소유하고 identity를 유지한다. reset 뒤 nested values는 fresh System-owned defaults다.
- metrics의 `activeInputs`는 System-owned hot-path scratch이며 reset에서 identity를 유지한 채 비운다.
- event callback registry는 backend subscription resource이며 reset을 넘어 유지되고 dispose가 최종 cleanup path다.
- default backend와 Zustand는 단일 internal reset event를 통해 완성된 System reset 결과를 projection한다.
- injected backend는 계속 외부 source of truth이며 System reset의 적용 대상이 아니다.

## 호환성 계약

- public methods, types, exports와 raw update behavior를 유지한다.
- `getKeyboardRef()`, `getMouseRef()`, `getState().gamepad`와 `getState().touch`에서 이미 반환된 top-level reference는 reset 뒤에도 유효하다.
- reset은 update eventCount를 증가시키지 않고 updateCount를 0으로 유지한다.
- callbacks는 단일 reset notification과 이후 updates를 계속 수신하며 unsubscribe와 dispose cleanup은 유지된다.
- reset notification callback이 다시 reset을 호출해도 중첩 reset이나 무한 재귀가 발생하지 않는다.
- reset dispatch 중 listener add/remove와 observer 예외가 현재 dispatch의 정확히 한 번 의미나 다른 listener delivery를 깨지 않는다.
- reset은 caller가 전달한 nested Vector, array 또는 object를 mutate하지 않는다.
- configurable extra own property와 inherited prototype pollution은 제거되고 non-configurable/non-extensible pollution은 state/metrics를 일부만 초기화하지 않는다.
- Bridge default/system-backed snapshot과 raw listeners는 reset defaults를 관찰한다.

## 리스크

- quartet을 통째로 교체하면 adapter, store와 hook의 held reference가 stale해진다.
- nested objects를 in-place zeroing하면 caller-owned payload를 역변이한다.
- `Object.assign`만 사용하면 runtime-added own property가 reset 뒤 남을 수 있다.
- reset notification에 update methods나 raw field event 네 개를 재사용하면 metrics가 오염되거나 backend와 Zustand가 중복 갱신된다.
- callbacks를 clear하면 default backend와 store subscription이 조용히 끊긴다.
- callback에서 reset을 재호출하면 guard가 없을 때 무한 재귀할 수 있다.
- live callback collection을 순회하면 callback의 self-registration이 같은 reset에서 무한히 재호출될 수 있다.
- observer 예외를 fanout 밖에서 처리하면 뒤 listener를 막고 initial subscription cleanup handle을 잃을 수 있다.
- 삭제 불가능한 own property, non-extensible target과 inherited setter/non-writable descriptor를 무시하면 뒤 assign 실패가 partial normalization을 만들 수 있다.
- `activeInputs.length = 0`만 사용하면 configurable string/symbol pollution이 reset 뒤 남는다.
- injected backend reset까지 확장하면 ownership이 없는 외부 state를 임의로 변경하게 된다.

## 검증

- 변경 source/test ESLint와 `git diff --check`.
- `InteractionSystem`에서 full mutation→reset defaults, quartet identity, nested ownership, extra-property 제거, `activeInputs` identity, metrics/config, listener lifetime과 reset 재진입을 검증한다.
- `InteractionSystem`에서 listener self-registration/removal/throw 격리, configurable symbol/non-enumerable/prototype pollution 제거와 non-configurable/non-extensible atomic no-op을 검증한다.
- frozen/sealed scratch의 atomic no-op과 정상 `activeInputs`의 index/string/symbol pollution 제거를 검증한다.
- adapter에서 복원 완료 뒤 정확히 한 번의 reset notification, observer throw 격리, initial subscription handle, backend identity, 이후 update와 unsubscribe를 검증한다.
- input single-source에서 System reset 뒤 quartet defaults와 Zustand subscription notification을 검증한다.
- motions `useInteractionSystem`에서 held raw identity와 무관하게 reset notification이 새 wrapper state를 만들고 primitive default를 다시 render하는지 검증한다.
- `InteractionBridge`에서 default/system-backed raw listener와 snapshot의 state/config/metrics reset을 검증하고 injected backend exclusion을 유지한다.
- `AbstractSystem`, architecture/public/package focused Jest와 interactions domain Jest.
- build/root TypeScript, 전체 Jest와 fresh package consumer 검증.
- runtime lifecycle/identity/resource reviewer 감사.

## 완료 조건

- [x] mutated raw quartet, state scalars, metrics와 config가 reset 뒤 defaults다.
- [x] raw quartet top-level identity는 유지되고 nested values는 fresh-owned defaults다.
- [x] caller-owned nested payload와 runtime-added properties가 reset 경계를 넘지 않는다.
- [x] callbacks와 system-backed backend subscription이 reset 뒤 유지되고 완성된 reset projection을 정확히 한 번 알린다.
- [x] reset callback 재진입은 무한 재귀나 중첩 lifecycle mutation 없이 차단된다.
- [x] observer add/remove/throw가 정확히 한 번 delivery, 뒤 listener와 subscription cleanup을 깨지 않는다.
- [x] configurable own-property pollution은 제거되고 non-configurable pollution은 partial reset을 만들지 않는다.
- [x] Zustand와 default/system-backed Bridge가 reset defaults를 관찰한다.
- [x] public API, architecture baseline과 update/timestamp/injected-backend 계약에 회귀가 없다.
- [x] focused/domain/type/full/package 검증과 reviewer 결과를 기록한다.
- [x] `HARNESS.md`를 append하고 plan을 completed로 이동한다.

## 구현 결과

- local state, metrics와 config default creators가 `InteractionSystem` reset defaults의 canonical source가 됐다.
- legacy object initializer를 유지하면서 state/metrics top-level 교체, raw quartet와 `activeInputs` retained identity를 동시에 보존한다.
- raw reset은 fresh source의 prototype과 own descriptors로 재구성해 caller nested alias, configurable string/symbol/non-enumerable과 inherited prototype pollution을 제거한다.
- non-configurable/non-extensible raw object와 clear할 수 없는 `activeInputs`는 `super.reset()` 전에 검출해 state, metrics, config, updateCount와 listeners를 건드리지 않는 atomic no-op이다.
- reset은 state→metrics→config 복원 완료 뒤 internal reset event를 한 번 발행하고, reentrant reset과 dispatch 중 listener add/remove/throw를 격리한다.
- system/default backend는 project logger observer boundary와 generation-gated fanout을 사용해 추가·재등록·중복 구독과 initial binding cleanup을 안정화했다.
- default backend, Zustand, motions hook와 default/explicit Bridge는 reset defaults를 관찰하며 injected memory backend raw state는 외부 authority로 유지된다.
- raw update와 explicit frame update의 기존 timestamp, eventCount와 dormant `metrics.lastUpdate` 의미는 바꾸지 않았다.

## 검증 결과

- 변경 source/test ESLint `--no-ignore`와 `git diff --check`: 통과.
- focused: 9 suites / 97 tests, interactions: 8 suites / 126 tests 통과.
- build/root TypeScript: 통과.
- 전체 Jest: 196 suites / 1,813 tests 통과, 1 suite / 1 test skipped.
- fresh package: ESM/CJS 각각 916 modules, npm consumer 95 packages, strict declarations와 ESM/CJS runtime smoke 통과.
- Vite package consumer bundle: 648 modules 통과.
- 독립 최종 리뷰: blocker 0 / major 0 / minor 0.

## 실패·경고·미실행과 다음 slice

- 리뷰가 재현한 live reset callback, subscriber throw, non-configurable/non-extensible raw state, frozen/sealed scratch, inherited setter와 hidden pollution 문제는 회귀 테스트와 함께 모두 수정했다.
- duplicate Three, React 19 test renderer deprecation, BridgeRegistry overwrite와 Vite large-chunk warning은 기존 non-failing debt다.
- Node 20/22, 비-Windows와 renderer/examples surface가 바뀌지 않아 demo gate는 미실행했다.
- 다음 slice는 R3F/WebGPU renderer와 GPU resource ownership·dispose 경계를 감사해 가장 작은 leak 또는 compatibility correction을 선택한다.
