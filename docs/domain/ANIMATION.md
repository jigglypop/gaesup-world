# Gaesup 애니메이션 시스템

이 문서는 Gaesup 프로젝트의 3레이어 아키텍처 기반 애니메이션 시스템을 설명합니다.

## 1. 아키텍처 개요

애니메이션 시스템은 `레이어 가이드`를 철저히 준수하여 **성능**과 **유지보수성**을 확보합니다.

```
┌─────────────────────────────────────────┐
│  3레이어: Animation Components        │ ← UI, 사용자 입력
│  - AnimationController, AnimationPlayer │
│  - AnimationDebugPanel                  │
├─────────────────────────────────────────┤
│  2레이어: Animation Hooks               │ ← 상태 동기화, 제어 로직
│  - useAnimationBridge                   │
│  - useAnimationPlayer                   │
├─────────────────────────────────────────┤
│  1레이어: Animation Core                │ ← 순수 계산, THREE.js
│  - AnimationEngine                      │
│  - AnimationBridge                      │
└─────────────────────────────────────────┘
```

## 2. 레이어별 상세 설명

### **1레이어 (Core)**: 순수 로직

-   **`AnimationEngine.ts`**:
    -   하나의 `AnimationMixer`를 관리하는 순수 클래스입니다.
    -   애니메이션 재생, 정지, 페이드 인/아웃 등 실제 THREE.js 액션을 직접 제어합니다.
    -   React에 대한 의존성이 전혀 없습니다.

-   **`AnimationBridge.ts`**:
    -   `character`, `vehicle` 등 각 `AnimationType`에 대한 `AnimationEngine` 인스턴스들을 관리하는 중앙 통제실입니다.
    -   2레이어의 `useAnimationBridge` 훅에 의해 생성되며, 모든 애니메이션 제어 명령(`AnimationCommand`)을 받아 적절한 엔진에 전달합니다.
    -   `subscribe` 메서드를 통해 엔진의 상태 변화를 외부(UI 컴포넌트)에 알립니다.

### **2레이어 (Hooks)**: 상태 관리 및 제어

-   **`useAnimationBridge.ts`**:
    -   UI 컴포넌트(3레이어)와 애니메이션 코어(1레이어)를 연결하는 핵심 훅입니다.
    -   **글로벌 `AnimationBridge` 인스턴스**를 참조하여, 애플리케이션 전체에서 동일한 애니메이션 상태를 공유하도록 보장합니다.
    -   `playAnimation`, `stopAnimation` 등의 제어 함수를 UI 컴포넌트에 제공합니다.
    -   `useEffect` 내부에서 브리지를 **구독**하여, 엔진의 상태(`currentAnimation`, `isPlaying` 등)가 변경되면 Zustand 스토어의 상태를 업데이트하여 동기화합니다.

-   **`useAnimationPlayer.ts`**:
    -   키보드, 마우스 입력에 따라 캐릭터의 상태(`walk`, `run`, `jump` 등)를 판단하고, `useAnimationBridge`를 통해 적절한 애니메이션을 **자동으로 재생**하는 역할을 합니다.
    -   패널에서 수동으로 애니메이션을 지정하면, 캐릭터가 움직이지 않는 한 해당 애니메이션을 유지합니다.

### **3. 레이어 (Components)**: UI

-   **`AnimationController.tsx`**:
    -   'walk', 'run', 'dance' 등 특정 애니메이션을 즉시 실행하는 버튼들을 제공하는 UI 컴포넌트입니다.
    -   `useAnimationBridge` 훅의 `playAnimation` 함수를 호출하여 애니메이션을 재생합니다.

-   **`AnimationPlayer.tsx`**:
    -   애니메이션 목록을 보여주는 드롭다운과 재생/정지 버튼을 제공합니다.
    -   `useEffect` 내부에서 브리지를 구독하여, `isPlaying`, `availableAnimations` 등 실제 엔진의 상태가 변경될 때마다 UI를 실시간으로 갱신합니다.

-   **`AnimationDebugPanel.tsx`**:
    -   현재 재생 중인 애니메이션, 활성 액션 수 등 상세한 디버깅 정보를 실시간으로 보여줍니다.
    -   `AnimationPlayer`와 마찬가지로 브리지를 구독하여 데이터를 동기화합니다.

## 3. 사용 예시

### 컴포넌트에서 애니메이션 재생하기

`useAnimationBridge` 훅을 사용하면 어떤 컴포넌트에서든 쉽게 애니메이션을 제어할 수 있습니다.

```typescript
import { useAnimationBridge } from '@hooks/animation';

function MyComponent() {
  // 2레이어 훅 호출
  const { playAnimation, currentType } = useAnimationBridge();

  const handleDanceClick = () => {
    // 1레이어 엔진에 'dance' 애니메이션 재생 명령 전달
    playAnimation(currentType, 'dance');
  };

  return (
    <button onClick={handleDanceClick}>춤추기</button>
  );
}
```

## 4. 애니메이션 등록 과정

애니메이션은 별도로 등록할 필요 없이 `PhysicsEntity`가 로드될 때 자동으로 브리지에 등록됩니다.

1.  **`PhysicsEntity.tsx`**: `useAnimations` 훅을 통해 GLTF 파일에 포함된 모든 애니메이션 액션을 가져옵니다.
2.  `useEffect` 내부에서 `getGlobalAnimationBridge()`를 호출하여 글로벌 브리지 인스턴스를 가져옵니다.
3.  브리지의 `registerAnimations(type, actions)` 메서드를 호출하여 로드된 액션들을 해당 타입의 엔진에 등록합니다.
4.  등록이 완료되면, `AnimationPlayer`나 `AnimationDebugPanel`에서 사용 가능한 애니메이션 목록이 자동으로 업데이트됩니다. 