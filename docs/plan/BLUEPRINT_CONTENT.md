# Blueprint Content Plan

블루프린트 계획의 목표는 “무엇을 블루프린트로 만들 것인가”를 먼저 고정하는 것입니다. 현재 구현은 캐릭터, 차량 같은 엔티티 생성 중심이지만, 장기적으로는 NPC 행동, 자동 캐릭터 에이전트, 사건/퀘스트/대화 흐름까지 편집 가능한 설계 데이터로 확장합니다.

## 원칙

- 블루프린트는 런타임 시스템 자체가 아니라 시스템이 읽어 실행하는 설계 데이터입니다.
- 사람이 에디터에서 편집해야 하는 규칙, 조건, 행동, 결과를 우선 대상으로 둡니다.
- 매 프레임 계산되는 카메라, 물리, 렌더링 로직은 블루프린트로 만들지 않습니다.
- React 컴포넌트나 특정 페이지 UI는 블루프린트 범위에 넣지 않습니다.
- 저장 파일 전체를 블루프린트로 대체하지 않습니다.

## 1차 범위

### 1. NPC Behavior Blueprint

NPC 행동 블루프린트는 NPC가 언제, 어디서, 어떤 조건으로 무엇을 하는지 정의합니다.

포함할 콘텐츠:

- 하루 스케줄
- 이동 목적지
- 대화 가능 조건
- 플레이어와의 거리 기반 반응
- 친밀도 기반 행동 변화
- 날씨, 시간, 퀘스트 상태에 따른 행동 전환

예시:

```txt
아침에는 광장으로 이동한다.
비가 오면 실내에 머문다.
플레이어가 사과를 가지고 있으면 선물 대화를 연다.
친밀도 3 이상이면 특별 퀘스트를 시작한다.
```

### 2. Agent Behavior Blueprint

자동 캐릭터 에이전트 블루프린트는 NPC보다 더 일반적인 자동 행동 규칙입니다. NPC뿐 아니라 동물, 상인, 가이드, 월드 오브젝트 관리자에도 적용할 수 있습니다.

포함할 콘텐츠:

- 순찰
- 추적
- 도망
- 상점 운영
- 농사 돕기
- 플레이어 따라오기
- 조건 만족 시 상태 전환

기본 구조:

```txt
State
- idle
- patrol
- interact
- return

Condition
- time
- distance
- flag
- quest status
- inventory item

Action
- moveTo
- say
- startDialog
- startQuest
- giveItem
- setFlag
```

### 3. Gameplay Event Blueprint

게임플레이 이벤트 블루프린트는 트리거, 조건, 액션으로 구성되는 사건 설계입니다.

포함할 콘텐츠:

- 구역 진입 이벤트
- 아이템 획득 이벤트
- 특정 시간 이벤트
- NPC 대화 후 이벤트
- 퀘스트 시작/완료 이벤트
- 계절, 날씨, 축제 이벤트

기본 구조:

```txt
Trigger
- 언제 실행되는가

Condition
- 실행 가능한 상태인가

Action
- 무엇을 바꾸는가

State
- 재실행 여부와 진행 상태를 어떻게 기억하는가
```

### 4. Quest Flow Blueprint

퀘스트 블루프린트는 이벤트 블루프린트 위에서 조금 더 긴 흐름을 정의합니다.

포함할 콘텐츠:

- 시작 조건
- 목표 목록
- 진행 조건
- 완료 조건
- 보상
- 실패 조건
- 분기 조건

1차에서는 별도 시스템으로 크게 만들기보다, `Gameplay Event Blueprint`와 연결되는 상위 콘텐츠로 봅니다.

### 5. Dialog Blueprint

대화 블루프린트는 NPC와 플레이어의 상호작용을 데이터로 정의합니다.

포함할 콘텐츠:

- 기본 대사
- 선택지
- 조건부 대사
- 호감도별 대사
- 퀘스트 상태별 분기
- 대화 종료 후 액션

1차에서는 NPC 행동과 이벤트를 연결하는 접점으로 둡니다.

## 우선순위

### 1단계: Gameplay Event Blueprint 정리

이미 `GameplayEventPanel`이 있으므로 가장 먼저 정리할 수 있습니다.

완료 기준:

- 트리거, 조건, 액션 타입이 문서화됨
- 샘플 하드코딩 값이 실제 예제 데이터와 구분됨
- 이벤트 실행 결과가 퀘스트, 대화, 보상, 플래그와 연결될 수 있음

### 2단계: NPC Behavior Blueprint 정의

`npcStore`에 있는 NPC 템플릿, 인스턴스, 브레인 관련 필드를 기준으로 행동 블루프린트 범위를 잡습니다.

완료 기준:

- NPC 성격/역할/행동 규칙이 분리됨
- NPC 인스턴스 상태와 NPC 설계 데이터가 구분됨
- `BuildingPanel` 안의 NPC 편집 UI가 블루프린트 기반으로 정리될 수 있음

1차 코드 기준:

- `NPCBehaviorBlueprint`는 NPC 인스턴스 전체가 아니라 `behavior`, `brain`, `perception`, `events`만 담습니다.
- `position`, `rotation`, `scale`, `currentAnimation`, `navigation`, `lastObservation`, `lastDecision`은 런타임 인스턴스 상태로 둡니다.
- `createNPCBehaviorBlueprintFromInstance`로 선택된 NPC의 행동 설계를 저장 가능한 형태로 뽑고, `applyNPCBehaviorBlueprint`로 다른 NPC 인스턴스에 적용합니다.

### 3단계: Agent Behavior Blueprint 일반화

NPC에 묶이지 않는 자동 행동 규칙으로 확장합니다.

완료 기준:

- NPC 외 자동 캐릭터에도 재사용 가능
- 상태, 조건, 액션 모델이 NPC 전용 필드에 묶이지 않음
- 순찰, 따라오기, 상호작용 같은 기본 행동이 공통 액션으로 표현됨

1차 코드 기준:

- `AgentBehaviorBlueprint`를 추가하고 `ownerType` (`npc`, `animal`, `vendor`, `service`, `custom`)로 대상을 분리합니다.
- `createAgentBehaviorBlueprintFromNPCBehaviorBlueprint`로 NPC 행동 설계를 에이전트 공통 형식으로 변환합니다.
- `createNPCBehaviorBlueprintFromAgentBehaviorBlueprint`와 `applyAgentBehaviorBlueprint`로 기존 NPC 런타임에 즉시 적용 가능합니다.
- 기존 `NPCBehaviorBlueprint`는 유지해 호환성을 깨지 않습니다.

### 4단계: Quest/Dialog 연결

퀘스트와 대화는 별도 큰 시스템으로 키우기 전에 이벤트와 NPC 행동의 결과로 연결합니다.

완료 기준:

- 이벤트 액션에서 대화 시작 가능
- 이벤트 액션에서 퀘스트 시작/진행/완료 가능
- NPC 조건에서 퀘스트 상태와 친밀도를 사용할 수 있음

1차 코드 기준:

- `Gameplay Event Blueprint` 액션(`startQuest`, `completeQuest`, `showDialog`)으로 퀘스트/대화를 바로 연결합니다.
- `NPCBrainBlueprintCondition`에 `questStatus`, `friendshipAtLeast`를 추가해 NPC 행동 분기에 퀘스트/친밀도를 사용할 수 있습니다.
- 퀘스트와 친밀도는 기존 store(`useQuestStore`, `useFriendshipStore`)를 그대로 사용해 중복 상태를 만들지 않습니다.

## 하지 않을 일

- 블루프린트로 물리 시스템을 재작성하지 않습니다.
- 블루프린트로 카메라 컨트롤러를 대체하지 않습니다.
- 모든 store 상태를 블루프린트로 옮기지 않습니다.
- 임시 더미 블루프린트 파일을 만들지 않습니다.
- 이름만 다른 중복 타입을 만들지 않습니다.

## 관련 구현 후보

- `src/blueprints`
- `src/core/gameplay`
- `src/core/npc`
- `src/core/dialog`
- `src/core/quests`
- `src/core/editor/components/panels/GameplayEventPanel`
- `src/core/editor/components/panels/BuildingPanel`

## 판단 기준

어떤 콘텐츠를 블루프린트로 넣을지 애매하면 아래 질문으로 판단합니다.

1. 게임 제작자가 에디터에서 수정해야 하는가?
2. 조건과 액션이 있는가?
3. 여러 NPC, 이벤트, 월드에서 재사용할 수 있는가?
4. 런타임 코드 수정 없이 데이터 교체로 결과가 바뀌어야 하는가?

위 질문에 대부분 해당하면 블루프린트 후보입니다. 해당하지 않으면 일반 코드, store, asset, save data로 두는 편이 낫습니다.
