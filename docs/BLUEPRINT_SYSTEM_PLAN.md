# Gaesup World Visual Scripting System (Blueprint) 계획서

## 개요

Gaesup World에 언리얼 엔진의 블루프린트와 유사한 비주얼 스크립팅 시스템을 구현하여, 코드 작성 없이 시각적으로 게임 로직을 구성할 수 있게 합니다.

## 목표

1. **노코드 게임 로직 구성**: 개발자가 아닌 사용자도 복잡한 게임 로직을 구현
2. **기존 시스템 통합**: 현재의 애니메이션, 모션, 상호작용 시스템과 완벽한 연동
3. **실시간 디버깅**: 노드 그래프의 실행 흐름을 실시간으로 확인
4. **확장 가능한 구조**: 커스텀 노드를 쉽게 추가할 수 있는 플러그인 시스템

## 시스템 아키텍처

### 1. 계층 구조 (Layer Architecture)

```
Layer 3: Visual Components
├── BlueprintEditor (React 컴포넌트)
├── NodeCanvas (노드 그래프 렌더링)
└── PropertyPanel (노드 속성 편집)

Layer 2: State Management & Controllers
├── BlueprintStore (Zustand)
├── NodeController (노드 상태 관리)
└── ConnectionController (연결 상태 관리)

Layer 1: Core Engine
├── BlueprintEngine (실행 엔진)
├── NodeCompiler (노드->코드 변환)
└── RuntimeExecutor (런타임 실행)
```

### 2. 핵심 컴포넌트

#### 2.1 Node System
- **BaseNode**: 모든 노드의 기본 클래스
- **NodePin**: 입력/출력 연결 포인트
- **NodeConnection**: 노드 간 연결
- **NodeRegistry**: 사용 가능한 노드 타입 관리

#### 2.2 Execution System
- **ExecutionContext**: 실행 컨텍스트 및 변수 관리
- **FlowController**: 실행 흐름 제어
- **DataFlowEngine**: 데이터 전달 및 타입 검증

#### 2.3 Visual Editor
- **GraphCanvas**: React Flow 기반 캔버스
- **NodeLibrary**: 드래그 앤 드롭 가능한 노드 목록
- **MiniMap**: 전체 그래프 오버뷰
- **DebugOverlay**: 실행 상태 시각화

## 노드 카테고리

### 1. Event Nodes
```
- Begin Play: 게임 시작 시 실행
- Tick: 매 프레임 실행
- On Key Press: 키보드 입력 이벤트
- On Mouse Click: 마우스 클릭 이벤트
- On Collision: 충돌 이벤트
- Timer Event: 시간 기반 이벤트
- Custom Event: 사용자 정의 이벤트
```

### 2. Flow Control Nodes
```
- Branch (If/Else): 조건 분기
- Switch: 다중 분기
- For Loop: 반복문
- While Loop: 조건 반복
- Sequence: 순차 실행
- Parallel: 병렬 실행
- Gate: 실행 흐름 제어
```

### 3. Variable Nodes
```
- Get Variable: 변수 읽기
- Set Variable: 변수 쓰기
- Cast To: 타입 변환
- Is Valid: 유효성 검사
- Make Array: 배열 생성
- Get Array Element: 배열 요소 접근
```

### 4. Math Nodes
```
- Add/Subtract/Multiply/Divide: 기본 연산
- Vector Math: 벡터 연산
- Quaternion Math: 회전 연산
- Lerp: 선형 보간
- Clamp: 값 제한
- Random: 랜덤 값 생성
```

### 5. Animation Nodes
```
- Play Animation: 애니메이션 재생
- Stop Animation: 애니메이션 정지
- Set Animation Speed: 속도 조절
- Blend Animations: 애니메이션 블렌딩
- Animation State Machine: FSM 제어
```

### 6. Physics Nodes
```
- Apply Force: 힘 적용
- Set Velocity: 속도 설정
- Raycast: 레이캐스트
- Overlap Check: 오버랩 검사
- Set Gravity: 중력 설정
```

### 7. World Nodes
```
- Spawn Actor: 액터 생성
- Destroy Actor: 액터 제거
- Get Actor Location: 위치 가져오기
- Set Actor Location: 위치 설정
- Find Actors: 액터 검색
```

### 8. UI Nodes
```
- Show UI Element: UI 표시
- Hide UI Element: UI 숨기기
- Update Text: 텍스트 업데이트
- Button Event: 버튼 이벤트
```

## 구현 단계

### Phase 1: 기반 시스템 구축 (2-3주)
1. **BlueprintEngine 구현**
   - 노드 실행 엔진
   - 실행 컨텍스트 관리
   - 타입 시스템

2. **기본 노드 시스템**
   - BaseNode 클래스
   - NodePin 시스템
   - NodeConnection 관리

3. **노드 레지스트리**
   - 노드 타입 등록
   - 카테고리 관리
   - 메타데이터 시스템

### Phase 2: 비주얼 에디터 (3-4주)
1. **React Flow 통합**
   - 커스텀 노드 컴포넌트
   - 연결 시스템
   - 줌/팬 컨트롤

2. **노드 라이브러리 UI**
   - 드래그 앤 드롭
   - 검색 기능
   - 카테고리 필터

3. **프로퍼티 패널**
   - 노드 속성 편집
   - 실시간 미리보기
   - 타입별 에디터

### Phase 3: 노드 구현 (4-5주)
1. **핵심 노드 구현**
   - Event 노드
   - Flow Control 노드
   - Variable 노드

2. **도메인 특화 노드**
   - Animation 노드
   - Physics 노드
   - World 노드

3. **고급 노드**
   - Math 노드
   - UI 노드
   - Custom 노드

### Phase 4: 컴파일러 및 런타임 (3-4주)
1. **노드 컴파일러**
   - 노드 그래프 → JavaScript 변환
   - 최적화 패스
   - 에러 검증

2. **런타임 실행기**
   - 실행 스케줄러
   - 성능 모니터링
   - 메모리 관리

3. **디버깅 시스템**
   - 브레이크포인트
   - 스텝 실행
   - 변수 감시

### Phase 5: 통합 및 최적화 (2-3주)
1. **기존 시스템 통합**
   - AnimationBridge 연동
   - MotionBridge 연동
   - InteractionBridge 연동

2. **성능 최적화**
   - 노드 실행 최적화
   - 렌더링 최적화
   - 메모리 사용 최적화

3. **문서화 및 예제**
   - API 문서
   - 튜토리얼
   - 샘플 블루프린트

## 기술 스택

### Frontend
- **React Flow**: 노드 에디터 UI
- **Zustand**: 상태 관리
- **React DnD**: 드래그 앤 드롭
- **Monaco Editor**: 코드 미리보기

### Core
- **TypeScript**: 타입 안정성
- **Web Workers**: 백그라운드 실행
- **IndexedDB**: 블루프린트 저장

### Integration
- **Three.js**: 3D 통합
- **Rapier**: 물리 엔진 연동

## 파일 구조

```
src/core/blueprint/
├── bridge/
│   ├── BlueprintBridge.ts
│   ├── index.ts
│   └── types.ts
├── components/
│   ├── BlueprintEditor/
│   │   ├── index.tsx
│   │   ├── styles.css
│   │   └── types.ts
│   ├── NodeCanvas/
│   │   ├── index.tsx
│   │   ├── styles.css
│   │   └── types.ts
│   ├── NodeLibrary/
│   │   ├── index.tsx
│   │   ├── styles.css
│   │   └── types.ts
│   └── PropertyPanel/
│       ├── index.tsx
│       ├── styles.css
│       └── types.ts
├── core/
│   ├── BlueprintEngine.ts
│   ├── NodeCompiler.ts
│   ├── RuntimeExecutor.ts
│   ├── index.ts
│   └── types.ts
├── nodes/
│   ├── base/
│   │   ├── BaseNode.ts
│   │   ├── NodePin.ts
│   │   └── NodeConnection.ts
│   ├── event/
│   ├── flow/
│   ├── variable/
│   ├── math/
│   ├── animation/
│   ├── physics/
│   └── world/
├── stores/
│   ├── blueprintSlice.ts
│   ├── nodeSlice.ts
│   └── types.ts
├── hooks/
│   ├── useBlueprintEngine.ts
│   ├── useNodeEditor.ts
│   └── index.ts
└── utils/
    ├── nodeRegistry.ts
    ├── typeSystem.ts
    └── validator.ts
```

## 주요 인터페이스

```typescript
interface BlueprintNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  inputs: NodePin[];
  outputs: NodePin[];
}

interface NodePin {
  id: string;
  name: string;
  type: DataType;
  connected: boolean;
  connections: string[];
}

interface BlueprintGraph {
  id: string;
  name: string;
  nodes: BlueprintNode[];
  connections: Connection[];
  variables: Variable[];
}

interface ExecutionContext {
  graph: BlueprintGraph;
  variables: Map<string, any>;
  currentNode: string;
  stack: string[];
}
```

## 예상 결과물

1. **비주얼 노드 에디터**
   - 드래그 앤 드롭으로 노드 배치
   - 노드 간 연결로 로직 구성
   - 실시간 미리보기

2. **실행 가능한 블루프린트**
   - 컴파일된 JavaScript 코드
   - 최적화된 실행 성능
   - 에러 처리 및 검증

3. **디버깅 도구**
   - 실행 흐름 시각화
   - 브레이크포인트 지원
   - 변수 상태 모니터링

4. **확장 가능한 시스템**
   - 커스텀 노드 플러그인
   - 외부 라이브러리 통합
   - 커뮤니티 노드 공유

## 성공 지표

1. **사용성**
   - 5분 내 첫 블루프린트 생성
   - 직관적인 UI/UX
   - 충분한 문서화

2. **성능**
   - 60 FPS 유지
   - 1000+ 노드 처리 가능
   - 빠른 컴파일 시간

3. **확장성**
   - 새 노드 타입 추가 용이
   - 기존 시스템과 원활한 통합
   - 버전 호환성

## 위험 요소 및 대응 방안

1. **성능 이슈**
   - 위험: 복잡한 그래프의 실행 속도 저하
   - 대응: Web Worker 활용, 노드 실행 최적화

2. **타입 시스템 복잡도**
   - 위험: 다양한 데이터 타입 간 호환성 문제
   - 대응: 강력한 타입 검증 시스템, 자동 타입 변환

3. **UI 복잡도**
   - 위험: 너무 많은 기능으로 인한 사용성 저하
   - 대응: 단계별 UI, 초급/고급 모드 분리

4. **기존 시스템 통합**
   - 위험: 레거시 코드와의 충돌
   - 대응: Bridge 패턴 활용, 점진적 마이그레이션

## 결론

이 비주얼 스크립팅 시스템은 Gaesup World의 접근성을 크게 향상시키고, 더 많은 사용자가 복잡한 3D 월드 로직을 구성할 수 있게 할 것입니다. 단계별 구현을 통해 리스크를 최소화하면서도 강력한 기능을 제공할 수 있을 것으로 예상됩니다. 