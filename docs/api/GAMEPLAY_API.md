# Gameplay API

이 문서는 `gaesup-world/gameplay` subpath로 공개되는 게임플레이 이벤트(트리거→조건→액션) API를 정리합니다.

## 관련 경로

- `src/core/gameplay/events/engine.ts`
- `src/core/gameplay/events/registry.ts`
- `src/core/gameplay/events/templates.ts`
- `src/core/gameplay/events/data/seedEvents.ts`
- `src/core/gameplay/events/types.ts`

## 공개 export

```ts
import {
  GameplayEventEngine,
  GameplayEventRegistry,
  createDefaultGameplayEventRegistry,
  getGameplayEventRegistry,
  SEED_GAMEPLAY_EVENTS,
  GAMEPLAY_EVENT_ACTION_TYPES,
  GAMEPLAY_EVENT_CONDITION_TYPES,
  GAMEPLAY_EVENT_TRIGGER_TYPES,
  createGameplayEventActionTemplate,
  createGameplayEventConditionTemplate,
  createGameplayEventTriggerTemplate,
  createManualToastEventBlueprint,
  createNpcTalkStartsQuestEventBlueprint,
} from 'gaesup-world/gameplay';
import type {
  GameplayEventBlueprint,
  GameplayEventTrigger,
  GameplayEventCondition,
  GameplayEventAction,
  GameplayTriggerEvent,
  GameplayEventExecution,
  GameplayEventRuntimeState,
} from 'gaesup-world/gameplay';
```

## GameplayEventEngine

트리거를 받아 등록된 블루프린트의 조건을 확인하고 액션을 실행하는 엔진입니다.

```ts
new GameplayEventEngine(options?: {
  blueprints?: GameplayEventBlueprint[];
  registry?: GameplayEventRegistry; // 기본값: getGameplayEventRegistry()
  state?: GameplayEventRuntimeState;
})
```

메서드:

- `setBlueprints(blueprints: GameplayEventBlueprint[]): void`
- `getBlueprints(): GameplayEventBlueprint[]`
- `dispatch(trigger: GameplayTriggerEvent): Promise<GameplayEventExecution[]>`

`examples/pages/runtime.ts`의 실제 사용 예:

```ts
import { GameplayEventEngine, SEED_GAMEPLAY_EVENTS } from 'gaesup-world/gameplay';
import type { GameplayEventBlueprint, GameplayTriggerEvent } from 'gaesup-world/gameplay';

let gameplayEngine: GameplayEventEngine | null = null;
const gameplayBlueprints: GameplayEventBlueprint[] = [...SEED_GAMEPLAY_EVENTS];

export function getWorldGameplayEngine(): GameplayEventEngine {
  if (!gameplayEngine) {
    gameplayEngine = new GameplayEventEngine({ blueprints: gameplayBlueprints });
  }
  return gameplayEngine;
}

export async function dispatchWorldGameplayEvent(trigger: GameplayTriggerEvent): Promise<void> {
  await getWorldGameplayEngine().dispatch(trigger);
}
```

## GameplayEventRegistry

조건(condition)/액션(action) 타입 문자열을 핸들러에 매핑하는 레지스트리입니다.

- `createDefaultGameplayEventRegistry()`: `always`, `hasItem`, `questStatus`, `eventActive`, `flagEquals`, `custom` 조건과 `giveItem` 등 기본 액션이 등록된 레지스트리를 반환합니다.
- `getGameplayEventRegistry()`: 프로세스 전역 싱글턴 레지스트리를 반환합니다(엔진 기본값으로 사용됨).
- `registry.registerCondition(type, handler)` / `registry.registerAction(type, handler)`로 커스텀 트리거 로직을 추가합니다.

## 블루프린트 템플릿 헬퍼

`createGameplayEventTriggerTemplate`, `createGameplayEventConditionTemplate`, `createGameplayEventActionTemplate`는 에디터의 GameplayEventPanel(`gaesup-world/editor`)에서 트리거/조건/액션 UI를 구성할 때 기본값을 만드는 헬퍼입니다. `createManualToastEventBlueprint`, `createNpcTalkStartsQuestEventBlueprint`는 자주 쓰는 블루프린트를 즉석에서 만드는 팩토리입니다.

## 트리거 종류

`GameplayEventTrigger`는 `type` 판별 유니언입니다: `manual`, `interaction`, `enterArea`, `itemCollected`, `timeChanged`, `calendarEventStarted`, `questChanged`, `custom`. 자세한 필드는 `src/core/gameplay/events/types.ts`를 참고하세요.

## 에디터 연동

`gaesup-world/editor`의 `GameplayEventPanel`은 이 블루프린트 배열을 편집하는 UI입니다(패널 자체 문서는 향후 EDITOR_API 작성 시 추가 예정).
