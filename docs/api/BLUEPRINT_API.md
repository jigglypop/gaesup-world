# Blueprint API

이 문서는 현재 코드 기준의 블루프린트 도메인 API를 정리합니다.

블루프린트는 현재 캐릭터, 차량 같은 엔티티 생성 API를 중심으로 제공됩니다. 장기적으로는 NPC 행동 에이전트, 조건 기반 자동 행동, 사건/퀘스트/대화 흐름처럼 게임 제작자가 편집해야 하는 설계 데이터까지 포함하는 방향으로 확장합니다.

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

## Gameplay Event Blueprint

게임플레이 이벤트 블루프린트는 `trigger`, `conditions`, `actions`, `policy`를 가진 사건 설계 데이터입니다. 현재 런타임 타입과 엔진은 `gaesup-world` 루트 API를 통해 사용할 수 있습니다.

```ts
import {
  GameplayEventEngine,
  createGameplayEventActionTemplate,
  createGameplayEventConditionTemplate,
  createGameplayEventTriggerTemplate,
  createNpcTalkStartsQuestEventBlueprint,
} from 'gaesup-world';
```

현재 트리거 타입:

- `manual`
- `interaction`
- `enterArea`
- `itemCollected`
- `timeChanged`
- `calendarEventStarted`
- `questChanged`
- `custom`

현재 조건 타입:

- `always`
- `hasItem`
- `questStatus`
- `eventActive`
- `flagEquals`
- `custom`

현재 액션 타입:

- `giveItem`
- `removeItem`
- `startQuest`
- `completeQuest`
- `showDialog`
- `toast`
- `setFlag`
- `notifyQuestFlag`
- `emit`
- `custom`

`GameplayEventPanel`은 이 타입 목록과 템플릿 생성 함수를 사용해 새 조건/액션의 기본 필드를 채웁니다. 데모 월드 고유 데이터는 `SEED_GAMEPLAY_EVENTS`에 두고, 에디터의 새 블루프린트 생성 기본값은 도메인 템플릿을 기준으로 유지합니다.

`createNpcTalkStartsQuestEventBlueprint`는 `interaction(talk)` 트리거 + `questStatus(available)` 조건 + `startQuest/showDialog` 액션을 한 번에 묶은 프리셋으로, NPC 브레인 조건(`questStatus`)과 바로 연결되는 기본 흐름을 제공합니다.

## NPC Behavior Blueprint

NPC 행동 블루프린트는 NPC 인스턴스에서 재사용 가능한 행동 설계만 분리한 데이터입니다.

```ts
import {
  applyNPCBehaviorBlueprint,
  createNPCBehaviorBlueprintFromInstance,
  type NPCBehaviorBlueprint,
} from 'gaesup-world';
```

포함하는 값:

- `behavior`: idle, patrol, wander 같은 행동 모드와 속도/웨이포인트
- `brain`: scripted/llm 정책과 brain blueprint 연결
- `perception`: 시야/청각 감지 범위
- `events`: 클릭, 호버, 상호작용, 근접 이벤트

포함하지 않는 값:

- `position`, `rotation`, `scale`
- `currentAnimation`
- `navigation`
- `lastObservation`, `lastDecision`

즉, NPC 행동 블루프린트는 “현재 어디에 배치된 NPC인가”가 아니라 “이 NPC가 어떤 규칙으로 행동하는가”를 저장합니다.

`NPCBrainBlueprintCondition`은 기본 조건 외에 아래 조건을 지원합니다.

- `questStatus`: 특정 퀘스트 상태(`available`, `active`, `completed`, `failed`) 확인
- `friendshipAtLeast`: NPC 친밀도 점수가 기준 이상인지 확인

## Agent Behavior Blueprint

Agent 행동 블루프린트는 NPC 전용 이름을 제거한 공통 행동 설계 타입입니다.

```ts
import {
  applyAgentBehaviorBlueprint,
  createAgentBehaviorBlueprintFromNPCBehaviorBlueprint,
  createNPCBehaviorBlueprintFromAgentBehaviorBlueprint,
  type AgentBehaviorBlueprint,
} from 'gaesup-world';
```

핵심 필드:

- `ownerType`: `npc` | `animal` | `vendor` | `service` | `custom`
- `behavior`
- `brain`
- `perception`
- `events`

권장 흐름:

1. 기존 NPC 설계를 `createAgentBehaviorBlueprintFromNPCBehaviorBlueprint`로 공통 에이전트 형식으로 변환합니다.
2. 에이전트 공통 규칙을 편집하거나 재사용합니다.
3. NPC 런타임에 적용할 때는 `createNPCBehaviorBlueprintFromAgentBehaviorBlueprint` 또는 `applyAgentBehaviorBlueprint`를 사용합니다.

이 구조는 NPC 전용 런타임을 유지하면서도, 동물/상인/가이드 같은 자동 캐릭터로 행동 설계를 확장할 수 있게 합니다.

## Quest / Dialog Link

현재 블루프린트에서 퀘스트/대화를 연결하는 핵심 경로는 두 가지입니다.

1. `Gameplay Event Blueprint` 액션:
   - `startQuest`
   - `completeQuest`
   - `showDialog`
2. `NPCBrainBlueprintCondition`:
   - `questStatus`
   - `friendshipAtLeast`

이 조합으로 “대화 후 퀘스트 시작”, “친밀도 이상일 때만 대화 분기”, “퀘스트 활성 상태에서만 NPC 행동 변경” 흐름을 코드 수정 없이 데이터 중심으로 구성할 수 있습니다.

## Content Bundle Blueprint Payload

`StudioPanel`의 번들 export는 블루프린트 섹션에 행동 설계 데이터를 함께 포함할 수 있습니다.

- `bundle.blueprints.npcBehavior`: `NPCBehaviorBlueprint[]`
- `bundle.blueprints.agentBehavior`: `AgentBehaviorBlueprint[]`

즉, 월드/에셋/이벤트와 함께 NPC/에이전트 행동 템플릿까지 하나의 콘텐츠 번들로 저장하고 복원하는 경로를 지원합니다.
