# Blueprint API

이 문서는 현재 코드 기준의 블루프린트 도메인 API를 정리합니다.

## 엔트리

런타임 블루프린트 API는 루트 엔트리와 `gaesup-world/blueprints`에서 사용할 수 있습니다.

```ts
import { BlueprintFactory, BlueprintSpawner, blueprintRegistry } from 'gaesup-world';
```

블루프린트 편집 UI는 별도 subpath를 사용합니다.

```tsx
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';
```

## Registry

`blueprintRegistry`는 등록된 블루프린트를 조회하고 추가하는 singleton registry입니다.

```ts
import { blueprintRegistry } from 'gaesup-world';

const all = blueprintRegistry.getAll();
const warrior = blueprintRegistry.get('warrior');
```

## BlueprintLoader

`BlueprintLoader`는 `src/blueprints/core/BlueprintLoader.ts`에 있는 간단한 static loader입니다.

현재 메서드:

- `load(path)`: fetch로 JSON을 읽고 registry map에 저장
- `loadFromJSON(json)`: JSON 문자열 또는 객체를 `BlueprintDefinition`으로 등록
- `get(id)`: 로더 내부 map에서 조회
- `getAll()`: 로더 내부 map 전체 조회
- `clear()`: 로더 내부 map 초기화

```ts
import { BlueprintLoader } from 'gaesup-world';

const blueprint = await BlueprintLoader.load('/blueprints/house.json');
const inline = BlueprintLoader.loadFromJSON({ id: 'custom', components: [] });
```

`loadBlueprintFromUrl`, `enableCache`, `loadMultipleBlueprints` 같은 API는 현재 구현되어 있지 않습니다.

## BlueprintFactory

`BlueprintFactory`는 static factory가 아니라 singleton instance를 통해 사용합니다.

```ts
import { BlueprintFactory } from 'gaesup-world';

const factory = BlueprintFactory.getInstance();
```

현재 주요 메서드:

- `createEntity(blueprint, config)`
- `createFromId(blueprintId, config)`
- `createFromDefinition(definition, config)`
- `registerComponentFactory(type, factory)`
- `getAvailableComponentTypes()`

`createBatch`, entity type registry, object pool API는 현재 공개 구현이 아닙니다.

## BlueprintSpawner

`BlueprintSpawner`는 React/R3F 환경에서 블루프린트 기반 엔티티를 생성하는 컴포넌트입니다.

```tsx
import { BlueprintSpawner } from 'gaesup-world';

<BlueprintSpawner blueprintId="warrior" position={[0, 0, 0]} />
```

## Hooks

대표 훅:

- `useBlueprint`
- `useCharacterBlueprint`
- `useVehicleBlueprint`
- `useAirplaneBlueprint`
- `useBlueprintsByType`
- `useSpawnFromBlueprint`

```tsx
import { useSpawnFromBlueprint } from 'gaesup-world';

function SpawnButton() {
  const { spawnAtCursor, isSpawning } = useSpawnFromBlueprint();

  return (
    <button onClick={() => spawnAtCursor('warrior')} disabled={isSpawning}>
      Spawn
    </button>
  );
}
```

## Editor API

`BlueprintEditor`, `BlueprintPreview`, `BlueprintPanel`, node editor components는 `gaesup-world/blueprints/editor`에서 가져옵니다.

```tsx
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';

<BlueprintEditor onClose={() => setOpen(false)} />
```
