# PRD-22 런타임 스코프와 전역 상태

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch |
| 선행 PRD | 20(kernel 분리), 23(DI 정리) |
| 담당 agent | architect |

## 1. 배경과 문제

runtime별 store factory와 `createScopedStoreHook`/Provider로 world를 격리하는 구조가 이미 있다(`runtime/context.tsx:38`에서 context value memo). 하지만 legacy 전역 경로가 함께 살아 있고, 어느 쪽을 쓰는지가 호출 방식에 따라 조용히 달라진다.

- React hook은 runtime store를 읽는데 `useXStore.getState()/setState()`는 전역 legacy store를 가리킨다.
- runtime이 없으면 조용히 전역으로 fallback한다.
- 서비스 키가 문자열 템플릿과 literal로 따로 쓰여, 이름이 어긋나도 컴파일 에러 없이 legacy store로 떨어진다.

결과적으로 여러 runtime·canvas 사이에 상태가 새고, SSR/HMR 뒤에 이전 상태가 남으며, 테스트마다 전역 reset이 필요하다.

## 2. 목표 / 비목표

**목표**
- 영속·세션 상태의 소유자를 runtime 하나로 만든다.
- legacy fallback을 명시적이고 관측 가능하게 만든 뒤 도메인별로 제거한다.
- import 시점 부수효과를 없앤다.

**비목표**
- 전역 registry 전부 제거. 불변 정의(컴포넌트 스키마, 애니메이터 컨트롤러 정의)는 전역 registry로 남길 수 있다. 가변 인스턴스 상태만 대상이다.

## 3. 현재 상태

**22-F01 hook과 `getState`가 서로 다른 store를 가리킴** [확인]
- `core/stores/scopedStore.ts:14` `Object.assign(useScoped, legacy)`.

**22-F02 import 시점 store 싱글턴** [실측]
- module-level store 인스턴스 37~40개(scoped legacy 17, `const legacy*` 8, 순수 전역 `create` 12~14).
- runtime 스코프가 없는 순수 전역: auth, admin toast, asset, i18n, networkConfig, networkState, perf, editor, `stores/domain/*` 4개, ui toast, UIConfig. 이 중 `assetStore`, `toastStore`(quest/farming/mail/town/crafting의 `notify()` 대상), `useEditorStore`, `UIConfigStore`는 world마다 분리되지 않는다.

**22-F03 legacy fallback과 우회 경로** [실측]
- `?? useXStore` 31곳, `BridgeFactory.getOrCreate*` 7곳.
- 우회: `npc/core/blueprint.ts:24-27` `legacyConditionStores`, `building/components/mesh/grass/manager.ts:61-68` `legacySources`(전역 MotionBridge에서 trample 조회), `motions/entities/ManagedMotionEntity.ts:23-28`, `InteractionBridge.getGlobal()` 2곳.

**22-F04 문자열 서비스 키** [확인]
- runtime은 `` `gaesup.runtime.${name}-store` ``(`createGaesupRuntime.ts:398`), plugin은 literal(`weather/plugin.ts:13`).

**22-F05 전역 가변 상태** [확인]
- `motions/core/system/groundContacts.ts:1` entityId 키 전역 Map(D-17).
- `save/core/autoSaveSuspension.ts` 모듈 전역 카운터.
- `frameScheduler` 전역 fallback(`runtime/frame/react/canvasScheduler.ts:21`), `gltfAssetCache`, `rendering/toon.ts` `_gradientCache`(dispose 경로 미검증).
- `MultiplayerCanvas.tsx:86-88` `window.CHARACTER_URL` 기록.
- `SystemRegistry` 전역 Map이 마지막 인스턴스를 붙잡고 `WorldSystem` 생성마다 `'world'` 키를 덮어씀(23 PRD).

**22-F07 `GaesupRuntime`이 닫힌 struct이고 게임플레이를 항상 생성** [확인, 2026-09-24 2차]
- `runtime/types.ts`가 33개 도메인을 import하고, `GaesupRuntime`(`:82-147`)은 모든 store를 필드로 가진다. `runtimeContext.ts`를 import하는 모듈 47개가 이 타입에 의존해, 런타임을 읽는 도메인은 모두 다른 모든 도메인에 타입 의존한다. 20-F05 타입 수준 SCC의 주원인이다.
- `createGaesupRuntime.ts:80-103`은 inventory, wallet, shop, friendship, farming, quests, dialog, crafting, mail, town, catalog, events store를 옵션과 무관하게 모두 만들고 서로 연결한다. 도메인 `plugin.ts`는 이미 만들어진 store를 노출·저장할 뿐이라(`weather/plugin.ts:33`) 어떤 도메인도 뺄 수 없다.
- 정의 registry 6개(crafting `RecipeRegistry`, dialog `DialogRegistry`, events `EventRegistry`, farming `CropRegistry`, items `ItemRegistry`, quests `QuestRegistry`)가 runtime 스코프가 아닌 전역 싱글턴이다(24 PRD 3.2).

**22-F06 import 부수효과** [확인]
- `interactions/stores/slices.ts:141-160` `ensureSystemListeners`, `:196` `subscribeDefaultAutomation(...)`: legacy gaesupStore import 시 전역 입력·automation 구독 등록, 해제 없음.
- `building/stores/presets.ts:55-60,132` import 시점 localStorage 읽기.
- 엔트리 `initializeBridges()`, `enableMapSet()`, `registerAnimatorController`, `registerDefaultReinforcementAdapter`, R3F `extend` 4곳(15 PRD 15-F02).

## 4. 요구사항

**FR**
- FR-22-01: 서비스 키는 `defineService<T>(id)`로 만든 typed key로 한다. 키 모듈은 kernel(20 PRD)에 두고 runtime과 plugin이 같이 import한다. 문자열 literal 키를 금지한다.
- FR-22-02: legacy fallback이 발생하면 dev에서 1회 경고한다(키, 호출 위치).
- FR-22-03: legacy store는 import 시점이 아니라 첫 접근 시 `??=` lazy 생성한다(`worldObjectStore.ts:16` 방식).
- FR-22-04: `useXStore.getState/setState`를 store 모듈 밖에서 쓰지 못하게 lint(`no-restricted-syntax`)로 막고, runtime API(`runtime.stores.x.getState()`)를 쓰게 한다.
- FR-22-05: `groundContacts`를 MotionBridge 인스턴스 필드로, `autoSaveSuspension`을 SaveSystem 인스턴스 필드로 옮긴다.
- FR-22-06: `assetStore`, `toastStore`, `editorStore`, `UIConfigStore`를 runtime 스코프로 옮긴다.
- FR-22-07: `subscribeDefaultAutomation`, `ensureSystemListeners`를 runtime 생성 시 등록하고 dispose 시 해제한다.
- FR-22-08: `window.CHARACTER_URL` 같은 전역 기록을 runtime 옵션으로 바꾼다.
- FR-22-09: 도메인별로 legacy store를 제거한다(npc blueprint는 store를 인자로 주입).
- FR-22-10: 도메인은 `runtime.get(key)`로 서비스를 얻는다. `GaesupRuntime`의 store 필드는 `runtime.get` 위임 getter로 바꾸고 `@deprecated`를 붙인다. `runtimeContext`는 kernel 타입만 참조한다.
- FR-22-11: 게임플레이 kit은 plugin `setup(ctx)`에서 자기 store와 정의 registry를 만들어 등록한다. `createGaesupRuntime`은 kernel과 engine 서비스만 만든다. kit 간 의존(quests → inventory 등)은 plugin `requires`로 선언한다. 기본 kit 묶음은 기존 동작 호환용 preset으로 제공한다.

**NFR**
- NFR-22-01: 같은 페이지에 runtime 2개를 만들면 상태가 섞이지 않는다(통합 테스트).
- NFR-22-02: runtime dispose 후 전역 listener·timer·구독 0.
- NFR-22-03: 모듈 import만으로 전역 구독·저장소 읽기가 발생하지 않는다.

## 5. 설계

```
createGaesupRuntime(options)
  ├─ services: runtime.get(key)                  ← key는 defineService<T>(id), kit은 setup(ctx)에서 등록
  ├─ stores:   per-runtime store 인스턴스
  ├─ bridges:  per-runtime bridge 인스턴스 (BridgeFactory 전역 캐시 대신)
  └─ dispose(): 구독·타이머·listener 해제
legacy 경로 = getDefaultRuntime() (lazy, dev 경고)
```

`getDefaultRuntime()`은 과도기 호환용이다. 기존 전역 hook·`getState`는 이 기본 runtime으로 위임하고, 도메인별로 호출처를 명시적 runtime 접근으로 바꾼다.

## 6. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 22-a | typed 서비스 키(`defineService<T>`), fallback dev 경고 | 문자열 literal 서비스 키 0 |

22-a 진행(2026-09-24): `plugins/serviceKey.ts`(`ServiceKey<T>`, `defineService`, `runtimeStoreServiceKey`, import 0)와 registry·`runtime.getService` 키 overload를 추가했다. 도메인 store 18종이 자기 모듈에서 키를 export하고 runtime 등록과 plugin 조회가 같은 키를 쓴다(`runtime/__tests__/serviceKeys.test.ts`). 키를 kernel 한 곳에 모으면 그 모듈이 모든 도메인 store 타입을 import해 SCC가 커지므로 도메인별로 둔다. 남은 literal: runtime 내부 비-store 서비스 13개, world·time store 상수(이미 단일 상수). fallback dev 경고는 plugin 단독 사용이 정상 경로라 보류.
| 22-b | D-17 groundContacts, autoSaveSuspension 인스턴스화 | runtime 2개 접지 상태 분리 테스트 |
| 22-c | legacy store lazy 생성, import 부수효과 제거(구독 등록을 runtime 생성으로) | 모듈 import 후 전역 구독 0 테스트 |
| 22-d | 순수 전역 store 4종 runtime 스코프 이동 | runtime 2개 toast·editor 상태 분리 |
| 22-e | `getState/setState` 외부 사용 lint, 호출처 이전(도메인별) | lint 위반 0 |
| 22-f | legacy store 제거(도메인별, major) | `?? useXStore` fallback 0 |
| 22-g | `runtime.get(key)`, `GaesupRuntime` store 필드 getter화(FR-22-10) | `runtime/types.ts` 도메인 import 수 감소 기록, 타입 수준 SCC 감소 |
| 22-h | 게임플레이 kit 자체 등록, 기본 preset(FR-22-11). 의존이 적은 kit(mail, town, catalog)부터 | kit 없이 만든 runtime에서 해당 store 0, preset runtime은 기존 테스트 통과 |

## 7. 공개 API 영향

- `useXStore.getState()` 직접 사용은 외부 소비자도 쓸 수 있으므로 `@deprecated` 후 major 제거(열린 질문 1).
- runtime 옵션에 `characterUrl` 등 추가(추가만).

## 8. 검증과 완료 기준

```bash
corepack pnpm test -- src/core/runtime src/core/stores src/core/motions src/core/save --runInBand
corepack pnpm test:memory
```

완료 기준: NFR-22-01~03 충족. 통합 테스트: 한 문서에 `GaesupWorld` 두 개를 마운트하고 각 world의 store, 접지, toast, autosave가 독립적인지 확인.

## 9. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 외부 소비자가 전역 `getState`에 의존 | `getDefaultRuntime` 위임으로 동작 유지, deprecation 기간 |
| lazy 생성 순서 변경으로 초기화 누락 | runtime 생성 시 명시 초기화, 초기화 순서 테스트 |

## 10. 열린 질문

1. 공개 hook의 `.getState()`/`.setState()` 정적 접근을 major에서 제거해도 되는가.
2. 여러 world를 한 페이지에 두는 시나리오를 공식 지원 범위로 둘 것인가.
3. `createGaesupRuntime()` 기본값을 모든 kit preset으로 유지할 것인가, engine만 만들고 kit은 명시 등록하게 할 것인가(major).
