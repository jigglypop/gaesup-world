# Blueprint 아키텍처 가이드

이 문서는 `src/blueprints`에 위치한 데이터 중심 설계와 `src/core`의 각 도메인이 이 데이터를 어떻게 활용하여 상호작용하는지에 대한 가이드입니다.

## 1. 핵심 철학: 데이터 중심 설계 (Data-Driven Design)

-   **"코드가 아닌 데이터를 수정하라"**: 게임의 동작(캐릭터 스탯, 애니메이션, 물리 속성 등)을 변경할 때 코드를 수정하는 대신, **순수 데이터 파일(`Blueprint`)**을 수정하는 것을 원칙으로 합니다.
-   **명확한 역할 분리**:
    -   `src/blueprints`: 게임의 모든 것을 정의하는 **"설계도"**. 순수 TypeScript 객체로만 구성됩니다.
    -   `src/core`: 설계도를 읽어 실제 로직을 실행하는 **"엔진"**.

## 2. Blueprint 시스템의 구성 요소

### 가. `blueprints/types.ts`
-   모든 Blueprint 타입(e.g., `CharacterBlueprint`, `VehicleBlueprint`)을 정의하는 중앙 허브입니다.
-   새로운 종류의 엔티티를 추가하고 싶다면, 먼저 이곳에 타입을 정의해야 합니다.

### 나. `blueprints/characters`, `blueprints/vehicles` 등
-   실제 데이터 파일이 위치하는 곳입니다.
-   예: `warrior.ts`는 `CharacterBlueprint` 타입에 맞는 전사 캐릭터의 모든 데이터를 정의합니다.

    ```typescript
    // src/blueprints/characters/warrior.ts
    export const WARRIOR_BLUEPRINT: CharacterBlueprint = {
      id: 'warrior',
      type: 'character',
      physics: { mass: 80, moveSpeed: 5 },
      animations: { idle: 'warrior_idle.glb' },
      // ...
    };
    ```

### 다. `blueprints/registry.ts`
-   프로젝트 내의 모든 Blueprint를 한곳에 모아 등록하는 **중앙 등록소**입니다.
-   엔진이 특정 Blueprint를 찾을 때 이 등록소를 사용합니다. `BlueprintRegistry.get('warrior')`와 같이 ID로 쉽게 조회할 수 있습니다.

### 라. `blueprints/factory/BlueprintFactory.ts`
-   Blueprint 데이터를 기반으로 실제 게임 엔티티(Three.js 객체, Rapier Body 등)를 생성하는 **팩토리 클래스**입니다.
-   `createCharacter(blueprint)`와 같은 메서드를 통해 데이터와 실제 월드 객체를 연결합니다.

## 3. 작동 흐름

```mermaid
graph TD
    subgraph "1. Data Definition (blueprints)"
        A[Blueprint Types<br/>(types.ts)] --> B{Character & Vehicle<br/>Blueprints};
        B --> C[Blueprint Registry<br/>(registry.ts)];
    end

    subgraph "2. Entity Creation (core)"
        D[useSpawnFromBlueprint<br/>(hook)] -- requests --> E[BlueprintFactory];
        C -- provides data --> E;
        E -- creates --> F[Character/Vehicle<br/>Entity];
    end

    subgraph "3. World"
        F -- is added to --> G[3D World];
    end

    style B fill:#cde4ff
    style C fill:#cde4ff
    style E fill:#d5e8d4
    style F fill:#d5e8d4
```

1.  **정의 (Definition)**: `blueprints` 폴더에서 캐릭터, 차량 등의 속성을 데이터로 정의하고 `BlueprintRegistry`에 등록합니다.
2.  **생성 요청 (Request)**: React 컴포넌트에서 `useSpawnFromBlueprint` 같은 훅을 사용하여 'warrior' ID를 가진 엔티티 생성을 요청합니다.
3.  **팩토리 작동 (Factory)**: `BlueprintFactory`는 `BlueprintRegistry`에서 'warrior' 데이터를 조회합니다.
4.  **인스턴스화 (Instantiation)**: 조회된 데이터를 바탕으로 `MotionSystem`, `AnimationSystem` 등에 필요한 컴포넌트와 설정을 포함한 실제 게임 엔티티를 생성하여 월드에 추가합니다.

## 4. 왜 이 구조를 사용하는가?

-   **생산성**: 기획자나 디자이너가 코드 베이스를 깊이 이해하지 않고도 `blueprints` 폴더의 데이터만 수정하여 게임 밸런스를 맞추거나 콘텐츠를 추가할 수 있습니다.
-   **유지보수**: 로직과 데이터가 분리되어 있어, 특정 캐릭터의 움직임을 수정하고 싶을 때 `motions` 코드를 건드리는 대신 해당 캐릭터의 `Blueprint` 파일만 변경하면 됩니다.
-   **확장성**: 새로운 종류의 자동차를 추가하고 싶다면, `VehicleBlueprint` 형식에 맞는 데이터 파일을 추가하고 `registry`에 등록하기만 하면 됩니다. 코어 로직 변경이 필요 없습니다.
-   **협업**: 프론트엔드 개발자는 코어 로직에, 게임 디자이너는 데이터에 집중하여 효율적인 협업이 가능합니다.

이 아키텍처는 프로젝트가 커지고 복잡해지더라도 일관성과 유지보수 용이성을 유지하는 핵심적인 역할을 합니다. 