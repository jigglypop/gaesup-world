# Gaesup 레이어 아키텍처 가이드라인

## 목표

**성능 최적화**와 **코드 분리**를 통해 복잡한 3D 웹 애플리케이션의 안정성과 유지보수성을 확보합니다.

## 3레이어 아키텍처

### **레이어 원칙**

```
┌─────────────────────────────────────────┐
│  3레이어 (Integration Layer)            │ ← React 컴포넌트, UI 로직
│  ├─ React Components                   │
│  ├─ User Interface Logic               │
│  └─ Integration & Event Handling       │
├─────────────────────────────────────────┤
│  2레이어 (State Management Layer)      │ ← 상태관리, 리렌더링 제어
│  ├─ controllers/                       │
│  ├─ store/ (zustand)                   │
│  ├─ hooks/ (domain-specific)           │
│  └─ React State Management             │
├─────────────────────────────────────────┤
│  1레이어 (Core Layer)                  │ ← 순수 로직, 성능 중심
│  ├─ core/                              │
│  ├─ behavior/ (optional)               │
│  └─ Pure Computation Logic             │
└─────────────────────────────────────────┘
```

## 📋 레이어별 상세 규칙

### **1레이어 (Core Layer)**

#### **허용 사항**
- ✅ 순수 JavaScript/TypeScript 클래스
- ✅ THREE.js, Rapier, 등 성능 중심 라이브러리
- ✅ ref 기반 객체 조작
- ✅ useFrame 내부에서 실행되는 로직
- ✅ 수학적 계산, 알고리즘
- ✅ 동기적 함수/메서드

#### **금지 사항**
- ❌ React hooks (`useState`, `useEffect`, `useMemo` 등)
- ❌ Zustand store 직접 접근
- ❌ React 컴포넌트 import
- ❌ 비동기 상태 변경
- ❌ 리렌더링을 유발하는 모든 작업

#### **예시**
```typescript
// ✅ 올바른 1레이어 코드
export class PhysicsEngine {
  private world: RAPIER.World;
  
  update(deltaTime: number): void {
    this.world.step();
  }
  
  addRigidBody(body: RAPIER.RigidBody): void {
    this.world.addRigidBody(body);
  }
}

// ❌ 잘못된 1레이어 코드
export class BadEngine {
  update(): void {
    const [state, setState] = useState();  // React hook 사용
    const store = usePhysicsStore();       // Store 접근
  }
}
```

### **2레이어 (State Management Layer)**

#### **허용 사항**
- ✅ React hooks (useState, useEffect, useMemo 등)
- ✅ Zustand store 접근
- ✅ 1레이어 객체/클래스 인스턴스 생성
- ✅ useRef로 1레이어 객체 관리
- ✅ 상태 변경 및 리렌더링 제어
- ✅ 이벤트 핸들링

#### **금지 사항**
- ❌ useFrame 내부에서 setState 호출
- ❌ 1레이어에서 상태 변경 유발
- ❌ 불필요한 리렌더링 유발
- ❌ 직접적인 DOM 조작

#### **예시**
```typescript
// ✅ 올바른 2레이어 코드
export function usePhysics() {
  const engineRef = useRef<PhysicsEngine>();
  const [isRunning, setIsRunning] = useState(false);
  
  useEffect(() => {
    engineRef.current = new PhysicsEngine();
  }, []);
  
  useFrame((state, delta) => {
    if (engineRef.current) {
      engineRef.current.update(delta);  // 1레이어 호출
    }
  });
  
  return { engine: engineRef.current, isRunning };
}

// ❌ 잘못된 2레이어 코드
export function badUsePhysics() {
  useFrame(() => {
    setIsRunning(true);  // 60fps로 setState 호출!
  });
}
```

### **3레이어 (Integration Layer)**

#### **허용 사항**
- ✅ 모든 React 패턴
- ✅ UI 컴포넌트
- ✅ 사용자 이벤트 처리
- ✅ 라우팅, 데이터 페칭
- ✅ 외부 API 연동

#### **주의 사항**
- ⚠️ 하위 레이어를 올바르게 호출
- ⚠️ 성능에 민감한 로직은 하위 레이어로 위임

## 🗂️ 도메인별 폴더 구조

### **표준 도메인 구조**
```
domain/
├── core/                    # 1레이어
│   ├── Engine.ts           # 메인 엔진
│   ├── types.ts            # 타입 정의
│   └── algorithms/         # 알고리즘 (옵션)
├── controllers/             # 2레이어
│   ├── BaseController.ts   # 공통 로직
│   ├── SpecificController.ts
│   └── index.ts
├── store/                   # 2레이어 (옵션)
│   ├── slices.ts            # Zustand slice
│   └── types.ts
├── hooks/                   # 2레이어
│   ├── useDomain.ts        # 메인 훅
│   └── types.ts
├── behavior/                # 1레이어 (옵션)
│   ├── BaseBehavior.ts
│   └── specific/
├── Component.tsx            # 3레이어
└── index.ts                 # 공개 API
```

### **도메인 예시들**

#### **Camera Domain** ✅ (구현 완료)
```
camera/
├── core/
│   ├── CameraEngine.ts
│   └── types.ts
├── controllers/
│   ├── BaseController.ts
│   ├── ThirdPersonController.ts
│   └── ... (7개 컨트롤러)
├── hooks/
│   └── useCamera.ts
├── Camera.tsx
└── index.ts
```

#### **Physics Domain** (예정)
```
physics/
├── core/
│   ├── PhysicsEngine.ts
│   └── types.ts
├── controllers/
│   ├── RigidBodyController.ts
│   └── CollisionController.ts
├── store/
│   └── physicsSlice.ts
├── hooks/
│   └── usePhysics.ts
└── Physics.tsx
```

#### **Animation Domain** (예정)
```
animation/
├── core/
│   ├── AnimationEngine.ts
│   └── types.ts
├── controllers/
│   ├── StateController.ts
│   └── BlendController.ts
├── hooks/
│   └── useAnimation.ts
└── Animation.tsx
```

## 🔄 레이어 간 통신 규칙

### **허용된 통신 방향**
```
3레이어 → 2레이어 ✅
2레이어 → 1레이어 ✅
1레이어 → utils    ✅
```

### **금지된 통신 방향**
```
1레이어 → 2레이어 ❌
1레이어 → 3레이어 ❌
2레이어 → 3레이어 ❌ (컴포넌트 의존성)
```

### **통신 패턴**

#### **올바른 패턴**
```typescript
// 3레이어 → 2레이어 → 1레이어
function Scene() {
  const { engine } = useCamera();  // 2레이어 호출
  return <Camera />;               // 컴포넌트 렌더링
}

function useCamera() {
  const engineRef = useRef<CameraEngine>();  // 1레이어 객체
  
  useFrame(() => {
    engineRef.current?.calculate();  // 1레이어 메서드 호출
  });
}

class CameraEngine {  // 1레이어
  calculate() {
    // 순수 계산 로직
  }
}
```

#### **잘못된 패턴**
```typescript
// ❌ 1레이어에서 2레이어 접근
class BadEngine {
  calculate() {
    const store = useStore();  // 금지!
    this.doSomething();
  }
}

// ❌ 1레이어에서 상태 변경
class BadEngine {
  calculate() {
    setState(newValue);  // 금지!
  }
}
```

## 📊 성능 최적화 원칙

### **1레이어 최적화**
- **메모리 풀링**: 객체 재사용
- **프레임 독립적 계산**: deltaTime 기반
- **불변성**: 상태 변경 없음
- **동기적 실행**: 비동기 작업 금지

### **2레이어 최적화**
- **useMemo/useCallback**: 적절한 메모이제이션
- **의존성 배열**: 정확한 deps 설정
- **useRef**: 인스턴스 유지
- **zustand 최적화**: 구독 최소화

### **3레이어 최적화**
- **React.memo**: 컴포넌트 메모이제이션
- **lazy loading**: 필요시 로딩
- **suspense**: 로딩 상태 관리

## 🧪 테스트 전략

### **1레이어 테스트**
```typescript
// 순수 함수 테스트
describe('CameraEngine', () => {
  it('should calculate correct position', () => {
    const engine = new CameraEngine();
    const result = engine.calculate(mockProps);
    expect(result.position).toEqual(expectedPosition);
  });
});
```

### **2레이어 테스트**
```typescript
// Hook 테스트
describe('useCamera', () => {
  it('should update config on mount', () => {
    const { result } = renderHook(() => useCamera());
    expect(result.current.engine).toBeDefined();
  });
});
```

### **3레이어 테스트**
```typescript
// 컴포넌트 테스트
describe('Camera', () => {
  it('should render without crash', () => {
    render(<Camera />);
    expect(screen.getByTestId('camera')).toBeInTheDocument();
  });
});
```

## 🚀 마이그레이션 가이드

### **기존 코드를 레이어 구조로 변경**

#### **Step 1: 순수 로직 분리**
```typescript
// Before
function usePhysics() {
  const [position, setPosition] = useState();
  
  useFrame(() => {
    const newPos = calculatePhysics();  // 계산과 상태가 섞임
    setPosition(newPos);
  });
}

// After - 1레이어 분리
class PhysicsEngine {
  calculate(): Vector3 {
    return this.calculatePhysics();  // 순수 계산
  }
}

function usePhysics() {
  const engineRef = useRef<PhysicsEngine>();
  const [position, setPosition] = useState();
  
  useFrame(() => {
    const newPos = engineRef.current?.calculate();  // 계산만
    if (newPos) setPosition(newPos);                 // 상태 변경은 별도
  });
}
```

#### **Step 2: 상태 관리 정리**
```typescript
// Before
const someGlobalState = createGlobalState();

// After - 2레이어 store
const usePhysicsStore = create((set) => ({
  position: new Vector3(),
  setPosition: (pos) => set({ position: pos }),
}));
```

#### **Step 3: 컨트롤러 패턴 적용**
```typescript
// After - Controller 추가
abstract class BasePhysicsController {
  abstract update(engine: PhysicsEngine): void;
}

class RigidBodyController extends BasePhysicsController {
  update(engine: PhysicsEngine): void {
    // 특화된 물리 로직
  }
}
```

## 📋 체크리스트

### **새 도메인 생성 시**
- [ ] 3레이어 구조로 폴더 생성
- [ ] 1레이어에 React 의존성 없음 확인
- [ ] 2레이어에서 상태 관리 로직 분리
- [ ] 3레이어에서 UI 로직만 포함
- [ ] 레이어 간 통신 방향 준수
- [ ] 성능 최적화 원칙 적용

### **코드 리뷰 시**
- [ ] import 문에서 레이어 위반 확인
- [ ] useFrame 내부 useState 호출 없음
- [ ] 1레이어에서 React hook 사용 없음
- [ ] 적절한 메모이제이션 적용
- [ ] 타입 안정성 확보
