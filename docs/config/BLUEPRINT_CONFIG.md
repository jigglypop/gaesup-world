# Blueprint 설정

이 문서는 현재 코드 기준의 블루프린트 설정 상태를 정리합니다.

## 현재 구조

블루프린트 도메인은 아래 요소로 구성됩니다.

- `blueprintRegistry`: 등록/조회용 singleton registry
- `BlueprintLoader`: fetch 또는 JSON 객체 기반 loader
- `BlueprintFactory`: singleton factory
- `ComponentRegistry`: component factory registry
- `BlueprintSpawner`: React/R3F 스폰 컴포넌트
- `BlueprintEditor`: 별도 editor subpath UI

## Loader

현재 `BlueprintLoader`는 static map 기반의 단순 loader입니다.

```ts
BlueprintLoader.load(path);
BlueprintLoader.loadFromJSON(json);
BlueprintLoader.get(id);
BlueprintLoader.getAll();
BlueprintLoader.clear();
```

## Factory

`BlueprintFactory`는 `getInstance()`로 얻은 인스턴스를 통해 사용합니다.

```ts
const factory = BlueprintFactory.getInstance();
```

주요 메서드:

- `createEntity(blueprint, config)`
- `createFromId(blueprintId, config)`
- `createFromDefinition(definition, config)`
- `registerComponentFactory(type, factory)`
- `getAvailableComponentTypes()`

## 현재 없는 설정/기능

아래 항목은 현재 구현된 설정 API가 아닙니다.

- `BlueprintConfig`
- `maxEntitiesPerBlueprint`
- lazy loading toggle
- validation level
- cache size 설정
- object pool 설정
- schema validation timeout
- `loadMultipleBlueprints`
- `preloadBlueprints`
- entity type registry

필요하면 실제 factory/loader에 구현한 뒤 문서화합니다.

## 공개 import

런타임 API:

```ts
import { BlueprintFactory, BlueprintSpawner, blueprintRegistry } from 'gaesup-world';
```

편집 UI:

```tsx
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';
```
