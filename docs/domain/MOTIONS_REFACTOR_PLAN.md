# Motions 도메인 리팩토링 계획

## 1. 목표

-   **단순성**: `useManagedEntity` 팩토리 훅을 중심으로 API를 단순화하여 보일러플레이트를 최소화합니다.
-   **명확성**: `LAYER_GUIDE.md`에 정의된 **단방향 데이터 흐름** 아키텍처를 `motions` 도메인에 완벽하게 적용합니다.
-   **분리**: `ref`와 `Zustand` 상태를 `MotionBridge`를 통해 명확히 분리합니다.
-   **데이터 기반**: `Blueprint`를 소비하여 엔티티를 생성하는 `Factory` 패턴을 구현합니다.

## 2. 목표 폴더 구조

```
src/core/motions/
├── bridge/
│   ├── MotionBridge.ts
│   └── types.ts
│
├── components/
│   ├── GaesupController.tsx  # 메인 컨트롤러 컴포넌트
│   └── PhysicsEntity.tsx       # 물리적 실체 렌더링
│
├── hooks/
│   ├── useGaesupPlayer.ts      # 조작 API 훅
│   ├── useGaesupState.ts       # 상태 구독 API 훅
│   └── useManagedEntity.ts     # 내부용 팩토리 훅
│
├── stores/
│   └── motionSlice.ts
│
├── core/
│   └── ... (엔진, 힘 계산 등)
│
└── types/
```

## 3. 리팩토링 단계별 계획

### **Phase 1: 기반 구조 생성**

1.  **폴더 생성**: 위의 "목표 폴더 구조"에 따라 `motions` 내에 폴더들을 생성 및 정리합니다.
2.  **`MotionBridge` 구현**: `boilerplate/AbstractBridge.ts`를 상속받아 `motions/bridge/`에 구체적인 `MotionBridge`를 구현합니다.
3.  **`motionSlice` 구현**: `stores/`에 `Zustand` 슬라이스를 생성합니다. `snapshot` 데이터를 저장할 상태와 `updateEntitySnapshot` 액션을 정의합니다.

### **Phase 2: 핵심 훅 구현**

1.  **`useManagedEntity` 팩토리 훅 구현**:
    -   `boilerplate`의 `useBaseLifecycle`과 `useBaseFrame` 로직을 이 훅 내부에 통합하거나 호출합니다.
    -   `Blueprint`를 받아 `ManagedEntity` 인스턴스를 생성하고, 생명주기 및 프레임 업데이트를 모두 관리합니다.
    -   `motions/hooks/`에 위치시킵니다.

2.  **API 훅 구현**:
    -   **`useGaesupPlayer`**: `getGlobalMotionBridge().execute`를 사용하여 `move`, `jump` 등의 명령을 보내는 함수들을 반환하는 훅을 구현합니다.
    -   **`useGaesupState`**: `useMotionStore`를 사용하여 특정 ID의 스냅샷을 구독하고 반환하는 훅을 구현합니다.

### **Phase 3: 컴포넌트 재구성**

1.  **`PhysicsEntity` 단순화**:
    -   내부 로직을 모두 제거하고, `useManagedEntity` 훅을 호출하여 `prop`을 받아 렌더링하는 역할만 하도록 수정합니다.

2.  **`<GaesupController>` 컴포넌트 생성**:
    -   `blueprint`를 `prop`으로 받습니다.
    -   내부적으로 `<PhysicsEntity>`와 캐릭터 모델을 렌더링합니다.
    -   사용자가 가장 먼저 접하게 될 최상위 인터페이스 역할을 합니다.

### **Phase 4: 정리 및 테스트**

1.  **기존 파일 삭제**: 더 이상 사용하지 않는 구 `usePhysics.ts` 및 관련 파일들을 삭제합니다.
2.  **단위 테스트**: `MotionBridge`와 새로 작성된 훅들에 대한 단위 테스트를 작성합니다.
3.  **통합 테스트**: `<GaesupController>`를 사용하여 캐릭터를 생성하고, `useGaesupPlayer`로 조작했을 때 `useGaesupState`로 상태 변화가 올바르게 감지되는지 통합 테스트를 작성합니다.

---

이 계획에 따라 리팩토링을 진행하면, `motions` 도메인은 가이드에 맞는 명확하고 확장 가능한 구조를 갖게 될 것입니다. 