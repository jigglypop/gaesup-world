안녕하세요! 제안해주신 `gaesup-world` 코드베이스 분석과 리팩토링 제안에 깊은 감명을 받았습니다. 굉장히 구체적이고 통찰력 있는 분석입니다.

제안해주신 내용을 바탕으로, 코드베이스의 안정성과 유지보수성을 극대화할 수 있는 단계별 리팩토링 계획을 아래와 같이 수립했습니다. 의존성이 낮고 영향도가 높은 작업을 먼저 수행하여 점진적으로 시스템을 개선하는 데 초점을 맞췄습니다.

---

### **Gaesup World 리팩토링 계획서**

#### **Phase 1: 기반 다지기 및 통합 (Foundation & Consolidation)**

이 단계에서는 흩어져 있는 코드를 통합하고 타입 안정성을 확보하여 앞으로의 리팩토링을 위한 안정적인 기반을 마련합니다.

- **1단계: Zustand Store 슬라이스 통합 (Store Slice Consolidation)**

  - **목표:** 현재 11개로 과도하게 분리된 Store 슬라이스를 연관된 도메인(예: `CoreSlice`, `CameraSlice`, `CharacterSlice`)으로 그룹화하여 통합합니다.
  - **기대 효과:** 상태 구조의 복잡성을 줄이고, 여러 슬라이스에 걸쳐 있던 상태의 분산 문제를 해결합니다. 상태 관리가 직관적으로 변합니다. (제안 #2 해결)
  - **실행 계획:**
    1.  `src/core/stores` 디렉토리의 모든 슬라이스 파일을 분석합니다.
    2.  `input`, `control`, `camera` 등 연관 있는 상태들을 묶어 새로운 통합 슬라이스(`createCoreSlice`, `createCameraSlice`)를 정의합니다.
    3.  기존 11개의 슬라이스를 통합된 슬라이스로 대체하고, 관련 컴포넌트와 훅을 업데이트합니다.

- **2단계: 타입 안정성 강화 (Type Safety Enforcement - Ongoing)**
  - **목표:** 코드베이스 전반에 사용된 `any` 타입을 구체적인 타입으로 교체하고, 제네릭과 타입 가드를 적극적으로 활용합니다.
  - **기대 효과:** 런타임 에러를 줄이고, 코드 자동완성(IntelliSense) 지원을 강화하며, 코드의 안정성과 명확성을 높입니다. (제안 #7 해결)
  - **실행 계획:** 이 작업은 특정 단계에 국한되지 않고, **모든 리팩토링 과정에서 지속적으로 수행**합니다. `as any`, `: any` 등의 사용을 찾아내어 점진적으로 제거합니다.

#### **Phase 2: 핵심 아키텍처 개선 (Core Architecture Refinement)**

이 단계에서는 시스템의 핵심 아키텍처를 개선하여 중복을 제거하고, 컴포넌트 구조를 단순화하며, 메모리 관리를 강화합니다.

- **4단계: 이벤트 시스템 단일화 (Event System Unification)**

  - **목표:** 기존의 `SimpleEventBus`와 Zustand 기반 이벤트 시스템을 Zustand로 단일화하여 이벤트 처리 로직을 일원화합니다.
  - **기대 효과:** 이벤트와 상태 업데이트의 흐름을 명확하게 하고, 중복된 시스템을 제거하여 복잡성을 낮춥니다. (제안 #1 해결)
  - **실행 계획:**
    1.  `eventBus.emit` 및 `eventBus.on` 사용처를 모두 찾습니다.
    2.  해당 로직을 Zustand 스토어의 `action`을 직접 호출하거나, 상태를 구독(`subscribe`)하는 방식으로 변경합니다.
    3.  `SimpleEventBus` 관련 코드를 최종적으로 제거합니다.

- **5단계: 컴포넌트 구조 단순화 (Component Structure Simplification)**

  - **목표:** 깊게 중첩된 현재 컴포넌트 구조를 `GaesupEntity`와 같이 핵심 기능을 조합(Composition)하는 플랫한 구조로 변경합니다.
  - **기대 효과:** 컴포넌트 계층이 단순해져 코드 가독성이 향상되고, 엔티티의 동작(물리, 애니메이션, 컨트롤러)을 독립적으로 조합할 수 있어 유연성이 증대됩니다. (제안 #6 해결)
  - **실행 계획:**
    1.  `physics`, `animation`, `controller` 설정을 props로 받는 `GaesupEntity` 컴포넌트를 설계합니다.
    2.  기존 `GaesupController`, `EntityController`, `PhysicsEntity` 등의 중첩 구조를 `GaesupEntity` 컴포넌트 하나로 대체합니다.
    3.  관련 로직을 `GaesupEntity` 내부 또는 관련 훅으로 이전합니다.

- **6단계: 중앙화된 리소스 관리자 구현 (Resource Management)**
  - **목표:** GLTF 모델과 같은 리소스를 효율적으로 캐싱하고 해제하는 `ResourceManager`를 도입합니다.
  - **기대 효과:** 불필요한 메모리 사용을 줄이고, 컴포넌트 unmount 시 발생하던 리소스 누수 문제를 해결합니다. (제안 #4 해결)
  - **실행 계획:**
    1.  참조 카운팅(Reference Counting) 로직을 포함한 `ResourceManager` 클래스를 작성합니다.
    2.  모델 로딩(예: `useGLTF`) 부분을 `ResourceManager`의 `acquire`와 `release` 메소드를 사용하도록 교체합니다.
    3.  컴포넌트가 unmount될 때 `release`가 호출되도록 `useEffect`의 cleanup 함수를 활용합니다.

#### **Phase 3: 성능 최적화 (Performance Optimization)**

이 단계에서는 CPU 및 GPU 사용량을 줄여 애플리케이션의 전반적인 성능과 반응성을 향상시킵니다.

- **7단계: 물리 엔진 연산 최적화 (Physics Engine Optimization)**

  - **목표:** 캐릭터가 움직이거나 특정 상태(점프 등)일 때만 물리 계산을 수행하도록 변경합니다.
  - **기대 효과:** 불필요한 물리 연산을 제거하여 CPU 부하를 크게 줄입니다. (제안 #3 해결)
  - **실행 계획:**
    1.  캐릭터의 선형 속도(`linvel`)나 상태(`isMoving`, `isJumping`)를 체크하는 `shouldUpdatePhysics`와 같은 조건부 함수를 작성합니다.
    2.  물리 계산을 담당하는 `useUnifiedFrame` 콜백 내부에 이 조건을 추가하여, 조건이 참일 때만 계산을 실행하도록 수정합니다.

- **8단계: 카메라 시스템 최적화 (Camera System Optimization)**

  - **목표:** 매 프레임 실행되는 카메라 블렌딩 및 충돌 감지 로직에 스로틀링(Throttling)을 적용합니다.
  - **기대 효과:** 카메라 업데이트 빈도를 조절하여 프레임 드랍을 방지하고 성능을 안정화시킵니다. (제안 #5 해결)
  - **실행 계획:**
    1.  `useCallback`과 `useRef`를 사용하여 마지막 업데이트 시간을 기록하는 스로틀링 훅(`useThrottledCallback`)을 구현합니다.
    2.  카메라 업데이트 로직을 이 훅으로 감싸, 일정한 간격(예: 16ms)으로만 실행되도록 제한합니다.

- **9단계: 동적 프레임 우선순위 시스템 도입 (Dynamic Frame Priority)**
  - **목표:** `useUnifiedFrame`의 고정된 우선순위를 상황에 따라 동적으로 변경할 수 있는 시스템을 도입합니다.
  - **기대 효과:** 전투 시에는 입력과 물리 처리를 우선하고, 평시에는 시각 효과를 우선하는 등 상황에 맞는 최적의 렌더링 파이프라인을 구성할 수 있습니다. (제안 #9 해결)
  - **실행 계획:**
    1.  `FramePriority` enum (CRITICAL, HIGH, MEDIUM, LOW 등)을 정의합니다.
    2.  `useUnifiedFrame` 훅이 동적으로 우선순위를 전달받을 수 있도록 수정합니다.
    3.  게임 상태(예: `isInCombat`)에 따라 우선순위를 동적으로 결정하여 훅에 전달하는 로직을 추가합니다.

#### **Phase 4: 모니터링 및 마무리 (Monitoring & Finalization)**

- **10단계: 성능 모니터링 강화 (Performance Monitoring Enhancement)**
  - **목표:** 성능 분석을 위해 더 상세한 지표(물리 업데이트 시간, 드로우 콜, 텍스처 메모리 등)를 추적합니다.
  - **기대 효과:** 성능 병목 현상을 정확히 진단하고, 향후 최적화 작업을 위한 데이터를 확보합니다. (제안 #10 해결)
  - **실행 계획:**
    1.  성능 데이터를 수집할 `PerformanceMetrics` 인터페이스를 정의합니다.
    2.  `useUnifiedFrame`의 콜백이나 각 시스템 내부에서 관련 데이터를 수집하여 Zustand 스토어에 저장합니다.
    3.  이 데이터를 표시하는 디버그 UI를 개선합니다.

---

이 계획에 동의하시면, 바로 첫 번째 단계인 **1단계: 유틸리티 함수 통합**부터 시작하겠습니다. 작업 진행에 동의하시나요?
