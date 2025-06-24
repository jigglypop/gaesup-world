네, 알겠습니다. 지금까지 논의한 '도킹 레이아웃'과 '노드 에디터'를 `gaesup-world`의 `core` 라이브러리 기능으로 통합하기 위한 공식적인 계획서를 Markdown 형식으로 작성해 드리겠습니다.

이 문서는 새로운 `editor` 도메인을 구축하기 위한 청사진 역할을 할 것입니다.

-----

# **`gaesup-world`: 차세대 에디터 도입 계획서**

## 1\. 개요

### 1.1. 목표

본 계획의 목표는 `gaesup-world`의 에디터 기능을 단순한 UI의 집합에서 벗어나, 유니티(Unity)나 언리얼(Unreal) 엔진과 같이 **생산적이고 확장 가능한 전문 에디터 환경**으로 발전시키는 데 있다. 이를 통해 사용자(개발자, 기획자, 아티스트)는 자신만의 작업 공간을 구성하고, 복잡한 게임 로직과 에셋을 시각적으로 제작할 수 있게 된다.

### 1.2. 핵심 기능

1.  **도킹 레이아웃 시스템 (Docking Layout System)**: 사용자가 에디터의 각 패널(창)을 드래그앤드롭으로 자유롭게 이동, 분리(팝업), 결합(탭)할 수 있는 동적인 작업 환경을 제공한다.
2.  **노드 기반 에디터 (Node-based Editor)**: 코딩 없이 로직(게임 플레이, 재질 등)을 시각적으로 설계하고 구현할 수 있는 노드 그래프 시스템을 제공한다.

### 1.3. 주요 기술 스택

  - **도킹 레이아웃**: `rc-dock`
  - **노드 에디터**: `React Flow` (`@reactflow/core`)
  - **상태 관리**: `Zustand`

-----

## 2\. 아키텍처 설계

### 2.1. 신규 `editor` 도메인

모든 에디터 관련 기능(UI, 상태, 로직)은 `core` 내에 신설되는 **`editor` 도메인**으로 완전히 캡슐화한다. 이는 '게임 런타임'과 '에디터'의 관심사를 명확히 분리하여, 런타임의 독립성과 에디터의 유연성을 동시에 확보하는 핵심적인 설계 원칙이다.

### 2.2. `editor` 도메인 디렉토리 구조

```
src/core/editor/
├── components/
│   ├── EditorLayout/          # 도킹 시스템의 메인 레이아웃 (rc-dock)
│   ├── panels/
│   │   ├── AssetBrowserPanel.tsx  # 에셋 브라우저
│   │   ├── GameSettingsPanel.tsx  # 게임 전역 설정
│   │   ├── HierarchyPanel.tsx     # 씬 계층 구조
│   │   ├── InspectorPanel.tsx     # 선택 오브젝트 속성창
│   │   └── NodeEditorPanel.tsx    # 노드 에디터 (React Flow)
│   └── nodes/
│       └── custom/              # 커스텀 노드 컴포넌트 (예: MathNode.tsx)
├── compiler/
│   └── materialCompiler.ts    # 노드 그래프 -> 재질(JSON) 변환 로직
├── hooks/
│   └── useEditor.ts           # 에디터 관련 편의 훅
├── stores/
│   └── editorSlice.ts         # 에디터 전용 Zustand 슬라이스
└── index.ts                   # editor 도메인의 Public API
```

### 2.3. `editorSlice` 상태 관리

`editor` 도메인의 상태는 `editorSlice.ts`에서 중앙 관리한다.

```typescript
export interface EditorState {
  // --- 선택 관련 ---
  selectedObjectIds: string[]; // 다중 선택 지원
  setSelectedObjectIds: (ids: string[]) => void;

  // --- 레이아웃 관련 ---
  layoutConfig: object | null; // rc-dock 레이아웃 설정
  setLayoutConfig: (config: object) => void;

  // --- 노드 에디터 관련 ---
  activeNodeGraph: object | null; // 현재 활성화된 노드 그래프 데이터(JSON)
  setActiveNodeGraph: (graph: object | null) => void;

  // --- 기타 ---
  clipboard: object | null; // 복사/붙여넣기 기능 지원
}
```

-----

## 3\. 세부 실행 계획 (Phase별)

### **Phase 1: 기반 시스템 구축 (Foundation)**

1.  **`editor` 도메인 생성**: 위 제안된 디렉토리 구조를 `src/core/` 하위에 생성한다.
2.  **라이브러리 설치**: `package.json`에 `rc-dock`, `@reactflow/core` 의존성을 추가한다.
3.  **`editorSlice` 초기 구현**: `Zustand`를 사용하여 `selectedObjectIds` 등 기본 상태와 액션을 포함하는 `editorSlice.ts`를 작성한다.
4.  **`EditorLayout` 컴포넌트 구현**: `rc-dock`을 사용하여 비어 있는 각 패널(`HierarchyPanel`, `InspectorPanel` 등)을 포함하는 기본 도킹 레이아웃을 구현한다.

### **Phase 2: 핵심 패널 기능 구현 (Core Panels)**

1.  **`HierarchyPanel` 구현**:
      - `world` 도메인의 상태를 참조하여 씬에 존재하는 오브젝트 목록을 트리 형태로 렌더링한다.
      - 항목 클릭 시 `editor.setSelectedObjectIds` 액션을 호출하여 선택 상태를 업데이트한다.
2.  **`InspectorPanel` 구현**:
      - `editor.selectedObjectIds` 상태를 구독한다.
      - 선택된 오브젝트가 있으면, 해당 오브젝트의 데이터(이름, 위치, 회전 값 등)를 가져와 속성 편집 UI를 동적으로 렌더링한다.
      - 속성 값 변경 시, 해당 `world` 또는 다른 도메인의 상태를 직접 변경하는 액션을 호출한다. (UI와 데이터 로직 분리)
3.  **`AssetBrowserPanel` 구현**:
      - 프로젝트 내 사용 가능한 에셋 목록(3D 모델, 텍스처 등)을 표시한다.
      - `react-dnd` 등의 라이브러리를 활용하여 에셋을 뷰포트로 드래그앤드롭하여 씬에 추가하는 기능을 구현한다.

### **Phase 3: 노드 에디터 v1 구현 (Node Editor - Material)**

가장 먼저 구체적이고 달성 가능한 목표로 \*\*재질 에디터(Material Editor)\*\*를 구현한다.

1.  **`NodeEditorPanel` 설정**: `React Flow`를 사용하여 노드 편집을 위한 캔버스를 렌더링한다.
2.  **커스텀 재질 노드 개발**:
      - `ColorNode`: 색상 값을 출력하는 노드
      - `TextureNode`: 텍스처 에셋을 선택하고 출력하는 노드
      - `NumberNode`: `metalness`, `roughness` 같은 숫자 값을 출력하는 노드
      - `MaterialOutputNode`: 모든 입력을 받아 최종 재질을 정의하는 마지막 노드
3.  **재질 컴파일러 v1 구현**:
      - `compiler/materialCompiler.ts` 파일을 생성한다.
      - `compileMaterialGraph(nodes, edges)` 함수를 구현한다. 이 함수는 `MaterialOutputNode`에서부터 역으로 그래프를 순회하여, 각 속성 값을 계산하고 최종적으로 재질 정보를 담은 JSON 객체를 반환한다.
4.  **런타임 연동**:
      - `world` 도메인에서 오브젝트가 특정 재질 그래프를 사용하도록 설정되었을 경우, 컴파일된 JSON을 받아 `THREE.MeshStandardMaterial`과 같은 실제 재질을 생성하여 메시에 적용하는 로직을 구현한다.

-----

## 4\. 향후 과제

  - **레이아웃 저장/복원**: `editorSlice`에 저장된 `layoutConfig`를 `localStorage`와 연동하여 사용자별 레이아웃을 영구적으로 보존하는 기능.
  - **노드 에디터 확장**: 재질 에디터의 성공적인 구현 후, 비주얼 스크립팅(게임 로직), 애니메이션 상태 머신 등으로 기능 확장.
  - **실행 취소/다시 실행 (Undo/Redo)**: 에디터의 모든 액션을 스택으로 관리하여 Undo/Redo를 지원하는 시스템 구축.
  - **에디터 모드 전환**: '플레이 모드'와 '에디터 모드'를 명확히 분리하고, 에디터에서 즉시 테스트할 수 있는 기능.
네, FSM(Finite State Machine, 유한 상태 기계) 구현은 노드 기반 에디터의 가장 강력하고 대표적인 활용 사례입니다. 캐릭터 AI, 퀘스트 진행, 상호작용 오브젝트의 동작 등 게임의 동적인 요소를 만드는 핵심 기능이죠.

이전 계획서에 FSM 설계를 구체적으로 반영하여 업데이트하겠습니다.

-----

# **`gaesup-world`: 차세대 에디터 도입 계획서 (v1.1)**

## 1\. 개요

### 1.1. 목표

`gaesup-world`의 에디터를 전문적인 통합 개발 환경으로 발전시켜, **FSM(유한 상태 기계)** 기반의 동적인 월드 콘텐츠를 시각적으로 설계하고 구현할 수 있는 기반을 마련한다.

### 1.2. 핵심 기능

1.  **도킹 레이아웃 시스템 (Docking Layout System)**: 사용자가 자유롭게 작업 환경을 구성할 수 있는 동적 패널 시스템.
2.  **노드 기반 FSM 에디터 (Node-based FSM Editor)**: 캐릭터 AI, 퀘스트, 상호작용 등을 위한 \*\*상태 머신(State Machine)\*\*을 시각적으로 설계하는 노드 그래프 시스템.

### 1.3. 주요 기술 스택

  - **도킹 레이아웃**: `rc-dock`
  - **노드 에디터**: `React Flow` (`@reactflow/core`)
  - **상태 관리**: `Zustand`

-----

## 2\. 아키텍처 설계

### 2.1. 도메인 역할 정의

  - **`editor` 도메인**: FSM 그래프를 시각적으로 생성, 편집하고 **실행 가능한 데이터(JSON)로 컴파일**하는 역할.
  - **`ai` 또는 `motions` 도메인**: `editor`가 만들어낸 FSM 데이터를 받아, 게임 런타임에서 **실제로 상태를 전환하고 액션을 실행**하는 역할.

### 2.2. `editor` 도메인 상세 구조

FSM 구현을 위해 디렉토리 구조를 구체화한다.

```
src/core/editor/
├── components/
│   ├── EditorLayout/
│   ├── panels/
│   │   ├── ...
│   │   └── NodeEditorPanel.tsx    # FSM 그래프를 편집하는 캔버스
│   └── nodes/
│       └── custom/
│           ├── fsm/
│           │   ├── StateNode.tsx      # FSM의 '상태'를 표현하는 노드
│           │   └── TransitionEdge.tsx # '전환 조건'을 표현하는 엣지
│           └── common/
│               ├── ConditionNode.tsx  # 조건(예: 거리 체크) 노드
│               └── ActionNode.tsx     # 액션(예: 애니메이션 재생) 노드
├── compiler/
│   └── fsmCompiler.ts         # FSM 그래프 -> 실행용 JSON으로 변환
...
```

### 2.3. `runtime` FSM 엔진 설계

  - `core`단에 범용적으로 사용될 `FsmRunner` 클래스 또는 훅을 구현한다.
  - **파일 위치**: `src/core/ai/FsmRunner.ts` (신규 `ai` 도메인 생성 추천)
  - **역할**: 컴파일된 FSM (JSON) 데이터를 입력받아, 게임 루프 내에서 현재 상태를 업데이트하고, 조건에 따라 상태를 전환하며, 각 상태에 맞는 액션을 실행한다.

-----

## 3\. 세부 실행 계획 (Phase별)

### **Phase 1 & 2: (이전 계획서와 동일)**

  - 에디터 기반 시스템 구축 및 핵심 패널(Hierarchy, Inspector 등) 기능 구현을 선행한다.

### **Phase 3: FSM 노드 에디터 구현**

#### 3.1. 목표: 간단한 NPC AI 설계

  - `대기 (Idle)`, `순찰 (Patrolling)`, `상호작용 (Interacting)` 3가지 상태를 가지는 NPC를 위한 FSM 에디터 구현을 1차 목표로 설정한다.

#### 3.2. 커스텀 FSM 노드 및 엣지 개발

  - **`StateNode`**: 상태를 나타내는 핵심 노드. '진입 시(OnEnter)', '업데이트 중(OnUpdate)', '종료 시(OnExit)'에 실행될 액션들을 연결할 수 있는 입/출력 소켓을 가진다.
  - **`TransitionEdge`**: 두 `StateNode`를 연결하는 엣지. 전환을 발생시키는 '조건(Condition)'을 참조할 수 있다.
  - **`ConditionNode`**: `isPlayerNearby(distance)` 와 같이 특정 조건을 평가하여 `true/false`를 반환하는 노드.
  - **`ActionNode`**: `playAnimation("walk")` 와 같이 실제 게임 월드에 영향을 주는 액션 노드.

#### 3.3. FSM 컴파일러 구현

  - `compiler/fsmCompiler.ts`를 작성한다.
  - **입력**: `React Flow`의 노드, 엣지 배열.
  - **출력**: `FsmRunner`가 즉시 실행할 수 있는 구조화된 JSON 데이터.
  - **출력 JSON 예시**:
    ```json
    {
      "initialState": "idle",
      "states": {
        "idle": {
          "onEnter": [{ "action": "playAnimation", "args": ["idle_anim"] }],
          "transitions": [{ "to": "patrolling", "condition": "isTimerDone(5000)" }]
        },
        "patrolling": {
          "onEnter": [{ "action": "startPatrol" }],
          "transitions": [
            { "to": "interacting", "condition": "isPlayerNearby(3)" },
            { "to": "idle", "condition": "isPatrolFinished" }
          ]
        },
        "interacting": {
          "onEnter": [{ "action": "lookAtPlayer" }, { "action": "showDialogue", "args": ["Hello!"] }],
          "transitions": [{ "to": "idle", "condition": "isDialogueClosed" }]
        }
      }
    }
    ```

#### 3.4. `FsmRunner` (런타임 엔진) 구현

  - `FsmRunner`는 컴파일된 JSON을 받아 내부 상태를 초기화한다.
  - 게임 루프에서 `fsmRunner.update(deltaTime, targetEntity)`가 호출되면 다음을 수행한다:
    1.  현재 상태의 `transitions` 목록을 순회하며 `condition`을 평가한다.
    2.  `condition`이 `true`가 되면, 현재 상태의 `onExit` 액션을 실행하고, 상태를 `to`에 지정된 다음 상태로 변경한 뒤, 새 상태의 `onEnter` 액션을 실행한다.
    3.  상태 전환이 없다면, 현재 상태의 `onUpdate` 액션을 실행한다.
  - `FsmRunner`는 `condition`과 `action` 문자열을 실제 실행 가능한 함수와 매핑하는 \*\*레지스트리(Registry)\*\*를 참조해야 한다.
    ```typescript
    // 예시: 액션 레지스트리
    const actionRegistry = {
      playAnimation: (entity, args) => entity.animation.play(args[0]),
      showDialogue: (entity, args) => entity.dialogue.show(args[0]),
    };
    ```

-----

## 4\. 향후 과제

  - **FSM 디버거**: 게임 실행 중 에디터의 노드 그래프에 현재 NPC가 어떤 상태에 있는지 실시간으로 하이라이트하여 표시하는 기능.
  - **중첩 FSM (Nested FSMs)**: 하나의 상태 노드가 또 다른 FSM 그래프를 가지는 복합 상태 기능. (예: `Battle` 상태 안에 `Attack`, `Defend`, `Evade` 상태가 있는 하위 FSM)
  - **데이터 바인딩**: 노드의 입력 값을 다른 오브젝트의 속성이나 변수에서 직접 가져오는 기능.
  - 실행 취소/다시 실행 (Undo/Redo) 시스템.