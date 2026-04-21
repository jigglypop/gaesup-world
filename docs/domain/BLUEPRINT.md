# 블루프린트 도메인

## 개요

블루프린트 도메인은 엔티티를 데이터 중심으로 정의하고, 이를 런타임 객체로 연결하기 위한 계층입니다. 캐릭터, 차량 같은 대상을 코드 안에서 직접 하드코딩하기보다, 블루프린트 정의와 팩토리 흐름을 통해 생성하는 방향을 담당합니다.

현재 블루프린트 관련 기능은 `src/blueprints` 아래에 모여 있습니다.

## 관련 경로

- `src/blueprints/types.ts`
- `src/blueprints/registry.ts`
- `src/blueprints/characters/`
- `src/blueprints/vehicles/`
- `src/blueprints/factory/`
- `src/blueprints/core/`
- `src/blueprints/hooks/`
- `src/blueprints/components/`

## 주요 구성 요소

### `types.ts`

블루프린트 도메인의 기본 타입 정의가 들어 있습니다.

- 캐릭터 블루프린트
- 차량 블루프린트
- 공통 블루프린트 타입
- 기타 블루프린트 관련 타입

새 블루프린트 계열을 추가할 때는 보통 여기서 타입 체계를 먼저 확장하게 됩니다.

### `registry.ts`

중앙 블루프린트 저장소입니다.

현재 특징:

- 싱글턴 형태
- 기본 블루프린트 자동 등록
- `register`, `get`, `getByType`, `getAll`, `has`, `remove`, `clear` 제공

기본 등록 대상:

- `WARRIOR_BLUEPRINT`
- `FIRE_MAGE_BLUEPRINT`
- `BASIC_KART_BLUEPRINT`

즉, 코드 시작 시점에 일부 대표 블루프린트는 바로 사용할 수 있습니다.

### `characters/`, `vehicles/`

실제 블루프린트 데이터가 놓이는 위치입니다.

예:

- `characters/warrior.ts`
- `characters/mage.ts`
- `vehicles/kart.ts`

이 파일들은 실제 게임 로직이 아니라 “엔티티를 어떻게 정의할지”에 가까운 정적 데이터 역할을 합니다.

### `BlueprintFactory`

블루프린트 정의를 실제 엔티티 객체로 연결하는 팩토리입니다.

주요 기능:

- `createEntity(blueprint, config)`
- `createFromId(blueprintId, config)`
- `createFromDefinition(definition, config)`
- `registerComponentFactory(type, factory)`
- `getAvailableComponentTypes()`

내부적으로는:

- `BlueprintConverter`
- `ComponentRegistry`
- `BlueprintEntity`

와 연결됩니다.

즉, 블루프린트 정의를 받아서 실제 런타임 엔티티 껍데기로 바꾸는 흐름의 중심입니다.

### `BlueprintConverter`

도메인별 블루프린트 타입을 런타임에서 쓰는 공통 정의 형식으로 변환하는 역할을 맡습니다.

### `BlueprintEntity`

팩토리에서 만들어지는 런타임 엔티티 래퍼입니다. 블루프린트 정의, 그룹 ref, rigid body ref 등을 묶어서 관리합니다.

### `BlueprintLoader`

외부 JSON 또는 경로 기반으로 블루프린트를 읽어오는 도구입니다.

- `load(path)`
- `loadFromJSON(json)`
- `get(id)`
- `getAll()`
- `clear()`

즉, 정적 TS 파일 외에도 JSON 기반 블루프린트 흐름을 열어두고 있습니다.

### `ComponentRegistry`

블루프린트 엔티티를 구성하는 컴포넌트 팩토리를 등록하는 저장소입니다. `BlueprintFactory`는 초기화 시점에 캐릭터, 차량, 비행기 계열 기본 컴포넌트 팩토리를 등록합니다.

## 주요 훅과 컴포넌트

### `useBlueprint`

레지스트리에서 블루프린트를 조회하기 위한 훅입니다.

대표 제공:

- `useBlueprint`
- `useCharacterBlueprint`
- `useVehicleBlueprint`
- `useAirplaneBlueprint`
- `useBlueprintsByType`

### `useSpawnFromBlueprint`

블루프린트를 기준으로 월드에 엔티티를 배치하는 훅입니다.

주요 기능:

- `spawnEntity(blueprintId, options)`
- `spawnAtCursor(blueprintId)`
- `spawnMultiple(blueprintId, count, options)`
- `isSpawning`
- `lastSpawnedEntity`

이 훅은 내부적으로:

- `blueprintRegistry`
- `WorldBridge`
- `gaesupStore`

를 함께 사용합니다.

즉, 단순 조회 훅이 아니라 실제 월드 배치 흐름과 연결된 훅입니다.

### `BlueprintSpawner`

지정한 블루프린트 또는 블루프린트 ID를 기준으로 RigidBody와 Group 안에 런타임 엔티티를 생성하는 React 컴포넌트입니다.

역할:

- `BlueprintFactory` 호출
- `RigidBody` 생성
- `innerGroupRef`, `outerGroupRef`, `rigidBodyRef` 연결
- 언마운트 시 엔티티 dispose

### 기타 UI

현재 블루프린트 도메인에는 아래 UI도 포함됩니다.

- `BlueprintEditor`
- `BlueprintPreview`
- `BlueprintPanel`
- 에디터용 노드 컴포넌트들

즉, 블루프린트는 단순 데이터 저장소가 아니라 편집 UI까지 같이 포함한 비교적 큰 도메인입니다.

## 동작 흐름

기본 흐름은 아래처럼 볼 수 있습니다.

1. 블루프린트 데이터를 `characters/`, `vehicles/` 등에서 정의합니다.
2. `blueprintRegistry`에 등록합니다.
3. 필요할 때 `useBlueprint()` 또는 `useBlueprintsByType()`로 조회합니다.
4. `BlueprintFactory` 또는 `BlueprintSpawner`를 통해 런타임 엔티티를 만듭니다.
5. `useSpawnFromBlueprint()`를 쓰는 경우 `WorldBridge`를 통해 월드 오브젝트로 추가합니다.

## 현재 강점

- 데이터 정의와 런타임 생성 흐름이 분리되어 있습니다.
- 중앙 레지스트리 구조라 조회와 확장이 쉽습니다.
- 팩토리와 컴포넌트 레지스트리 구조 덕분에 확장 가능성이 높습니다.
- 훅, 스포너, 에디터 UI까지 이미 연결되어 있습니다.

## 현재 한계

- 일부 구현은 아직 얇은 래퍼 수준이라 실제 게임 로직과 더 강하게 결합될 여지가 있습니다.
- 블루프린트 정의, 월드 오브젝트 메타데이터, 런타임 컴포넌트 사이의 경계가 더 명확해질 필요가 있습니다.
- 타입과 런타임 필드 이름이 장기적으로 더 정리되어야 합니다.

## 사용 예시

### 레지스트리 조회

```ts
import { blueprintRegistry } from 'gaesup-world';

const warrior = blueprintRegistry.get('warrior');
```

### 훅으로 스폰

```tsx
import { useSpawnFromBlueprint } from 'gaesup-world';

export function SpawnButton() {
  const { spawnEntity, isSpawning } = useSpawnFromBlueprint();

  return (
    <button
      disabled={isSpawning}
      onClick={() => spawnEntity('warrior', { position: [0, 0, 0] })}
    >
      전사 스폰
    </button>
  );
}
```

### 컴포넌트로 스폰

```tsx
import { BlueprintSpawner } from 'gaesup-world';

<BlueprintSpawner blueprintId="warrior" position={[0, 0, 0]}>
  {/* 실제 렌더링 children */}
</BlueprintSpawner>
```

## 함께 보면 좋은 파일

- `src/blueprints/registry.ts`
- `src/blueprints/factory/BlueprintFactory.ts`
- `src/blueprints/factory/BlueprintConverter.ts`
- `src/blueprints/hooks/useBlueprint.ts`
- `src/blueprints/hooks/useSpawnFromBlueprint.ts`
- `src/blueprints/components/BlueprintSpawner/index.tsx`
- `src/blueprints/components/BlueprintEditor/index.tsx`
