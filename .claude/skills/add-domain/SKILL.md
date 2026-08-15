---
name: add-domain
description: src/core에 새 도메인(기능 영역)을 추가하거나 기존 도메인에 브리지/시스템/스토어/플러그인을 확장할 때의 표준 절차. 실제 커널 API 시그니처와 플러그인/저장 배선 계약 포함.
---

# 도메인 추가/확장 절차

참조 구현: `src/core/motions/` (가장 완성도 높은 도메인 — PhysicsSystem, MotionSystem, MotionBridge). 새 코드를 쓰기 전에 대응되는 motions 파일을 먼저 읽고 패턴을 복제할 것.

## 폴더 템플릿

```
src/core/<domain>/
  core/        # Layer 1: 순수 엔진. react/zustand/@react-three/fiber import 금지(ESLint 차단). three/rapier 허용.
  bridge/      # Layer 2: CoreBridge 상속. types.ts에 Entity/Snapshot/Command 타입.
  hooks/       # Layer 3: use<Thing>.ts
  components/  # Layer 3: <Name>/{index.tsx, styles.css, types.ts}
  stores/      # <name>Store.ts 또는 slices/<name>/{slice.ts,types.ts}
  __tests__/   # 테스트명 한글, 코드 옆 배치
  types.ts  index.ts  plugin.ts
```

## Layer 2 브리지 계약 (실제 시그니처)

`CoreBridge<EngineType extends IDisposable, SnapshotType, CommandType>` 상속 후 추상 메서드 3개만 구현:

```ts
@DomainBridge('<domain>')
@EnableEventLog()
export class FooBridge extends CoreBridge<FooEntity, FooSnapshot, FooCommand> {
  private tempQuaternion = new THREE.Quaternion();
  protected buildEngine(id: string, ...args: RuntimeValue[]): FooEntity | null { /* null 반환 = 등록 거부 */ }
  @ValidateCommand()
  protected executeCommand(entity: FooEntity, command: FooCommand, id: string): void { /* command.type별 switch */ }
  protected createSnapshot(entity: FooEntity, id: string): FooSnapshot | null { /* 아래 할당 규칙 필수 */ }
}
```

- **스냅샷 할당 규칙**: `getCachedSnapshot(id)`로 가져와 **in-place 갱신**(`snapshot.position.set(...)`), 없을 때만 생성 후 `cacheSnapshot(id, s)`. `createSnapshot`은 프레임마다 불리므로 내부에서 `new THREE.*` 금지 — 임시 객체는 클래스 필드로 재사용(`MotionBridge.tempQuaternion` 참조).
- System 인스턴스 생성 시 DI 주입: `DIContainer.getInstance().injectProperties(system)`. `buildEngine`이 반환하는 엔티티는 `dispose()`를 반드시 포함.
- 브리지가 앱 시작 시 필요하면 `src/core/initializeBridges.ts`에 import 한 줄 추가(등록만 — `BridgeFactory`가 lazy `getOrCreate`).
- 사용 가능한 데코레이터: `@DomainBridge(name)`, `@EnableEventLog()`, `@ValidateCommand()`, `@LogSnapshot()`, `@Profile()`, `@HandleError()`, `@ManageRuntime({ autoStart })` (boilerplate/decorators).

## Layer 3 소비 계약

```ts
const entity = useManagedEntity(bridge, id, rigidBodyRef, {
  onInit, onDispose, frameCallback, priority, throttle, skipWhenHidden, enabled, dependencies,
});
```

`useManagedEntity`가 생성 + DI 주입 + lifecycle(register/unregister) + `useBaseFrame` 구독을 전부 처리한다. raw `useFrame`을 직접 쓰지 말 것. 저빈도 갱신은 `throttle`(ms) 또는 `useThrottledFrame(bridge, id, fps)`.

## 스토어 + 플러그인 계약

영속 상태가 있는 스토어는 state에 `serialize(): TSerialized`와 `hydrate(data: TSerialized | null | undefined): void`를 구현해야 한다 — 이것이 `createStoreDomainPlugin`의 타입 계약(`SerializableStore`)이다.

```ts
export function createFooPlugin(options: FooPluginOptions = {}) {
  return createStoreDomainPlugin({
    id: options.id ?? 'gaesup.foo',            // 관례: 'gaesup.<domain>'
    name: 'GaeSup Foo',
    saveExtensionId: 'foo',                     // SaveSystem domain key — 중복 등록 시 차단됨
    storeServiceId: 'foo.store',
    store: useFooStore,
    readyEvent: 'foo:ready',
    capabilities: ['foo'],
    serialize: serializeFooState,
    hydrate: hydrateFooState,
  });
}
export const fooPlugin = createFooPlugin();
```

`PluginRegistry`는 중복 id(`DuplicatePluginError`), 누락/버전 불일치 의존성, 순환 의존성을 throw로 거부한다. 저장은 legacy `SaveLoadManager`가 아니라 **SaveSystem** 경로를 쓰고, 월드 스냅샷 포함 여부는 `src/core/platform/`의 `WORLD_SNAPSHOT_DOMAINS`/`PLAYER_PROGRESS_DOMAINS`에서 확인.

## 배선 체크리스트 (examples까지 가야 완료)

1. `src/core/index.ts`(또는 subpath 엔트리)와 `src/index.ts`에 공개 심볼 명시적 export → `src/__tests__/publicApi.test.ts` 갱신.
2. `examples/pages/runtime.ts`의 `createWorldRuntime()`에 `createFooPlugin()` 등록 (기존 20개 `create*Plugin` 목록에 합류).
3. UI 기능이면 `examples/pages/World.tsx`(showcase), editor 패널, 또는 `examples/App.tsx` 라우트 중 한 곳에서 실제 접근 가능하게. examples는 `gaesup-world[/subpath]` import만 사용.
4. plugin API 자체를 바꿨으면 외부 패키지 예제 `examples/plugins/cozy-life-package`도 함께 갱신.

## 검증

```
pnpm test -- src/core/<domain> --runInBand
pnpm test -- src/__tests__/publicApi.test.ts --runInBand
pnpm exec tsc -p tsconfig.build.json --noEmit
pnpm exec eslint <변경 파일들>
```

hydrate/serialize를 추가했으면 중복 key·null 입력·round-trip 테스트를 `__tests__`에 반드시 포함(테스트명 한글).
