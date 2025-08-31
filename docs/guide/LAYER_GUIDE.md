# Gaesup 아키텍처 가이드

## 1. 핵심 목표

1.  **관심사 분리 (Separation of Concerns)**: 3D 렌더링, 물리 계산, 상태 관리를 명확히 분리하여 복잡성을 낮춥니다.
2.  **성능 최적화**: 60FPS를 유지하기 위해 React 리렌더링을 최소화하고, 무거운 계산은 프레임 루프에서 독립적으로 처리합니다.
3.  **재사용성 및 확장성**: Blueprint 시스템을 통해 엔티티를 데이터 기반으로 정의하고, 새로운 기능을 쉽게 추가할 수 있도록 합니다.

## 2. 핵심 아키텍처 패턴: 단방향 데이터 흐름

본 프로젝트는 `ref`의 세계와 `Zustand`의 세계를 엄격히 분리하기 위해 **단방향 데이터 흐름**과 **스냅샷 패턴**을 사용합니다.

-   **`ref`의 세계 (Layer 1)**: `useFrame` 루프 내에서 매 프레임 변화하는 실시간 데이터 (e.g., `THREE.Object3D`, `Rapier.RigidBody`). React 렌더링과 무관하게 동작합니다.
-   **`Zustand`의 세계 (Layer 2)**: React 컴포넌트의 렌더링을 유발하는 상태 데이터. 불변성을 유지하며, UI 표시에 필요한 최소한의 데이터만 저장합니다.

### 데이터 흐름

```
Layer 3 (UI)        Layer 2 (Hooks/Zustand)       Bridge        Layer 1 (Rapier/Three.js ref)
────────────        ───────────────────────       ──────        ─────────────────────────────
(Click) ──────────> | handleJump()          |
                    |                       |
                    | bridge.execute(JUMP)──+──────────────────> | ref.applyImpulse()          |
                                                                |                             |
(useFrame) ~~~~~~~> | const snap =          |                    |                             |
                    | bridge.snapshot() <───+─────────────────── | ref.translation()           |
                    |                       |                    |                             |
                    | zustand.set(snap)     |                    |                             |
                    |                       |                    |                             |
(UI Update) <───────+──(subscribe to store) |                    |                             |
```

1.  **명령 (Command)**: UI 이벤트(입력 등)는 `Hook`을 통해 `Bridge`에 **명령 객체**를 전달하여 Layer 1의 `ref`를 조작합니다. (Layer 2 → 1)
2.  **스냅샷 (Snapshot)**: `useFrame` 루프에서 `Hook`은 `Bridge`를 통해 Layer 1 `ref`의 현재 상태를 **읽기 전용 스냅샷**으로 가져와 `Zustand` 스토어를 업데이트합니다. (Layer 1 → 2)

이 구조를 통해 `ref`와 `Zustand`는 절대 직접 통신하지 않으며, `Zustand` 스토어는 매 프레임이 아닌, UI에 표시될 필요가 있을 때만 업데이트됩니다.

## 3. 레이어 정의

### **Layer 1: Core Layer (순수 로직)**

-   **역할**: 물리 계산, 3D 객체 조작, 네트워크 통신 등 React와 무관한 모든 핵심 로직.
-   **구성 요소**: `core/`, `behavior/`
-   **허용**: 순수 TS/JS 클래스, `THREE.js`, `Rapier`, `WebSocket`, `ref` 조작, `useFrame` 로직.
-   **금지**: **React Hooks, Zustand Store 직접 접근, React 컴포넌트 import.**

### **Layer 2: State Management Layer (상태 관리)**

-   **역할**: 상태 관리 및 비즈니스 로직. Layer 1과 Layer 3를 중재.
-   **구성 요소**: `controllers/`, `stores/`, `hooks/`
-   **허용**: React Hooks, Zustand Store, `useRef`로 Layer 1 객체 관리, `Bridge`를 통한 통신.
-   **금지**: `useFrame` 내부에서 직접 `setState` 호출 (대신 스냅샷 비교 후 필요시 업데이트).

### **Layer 3: Integration Layer (UI)**

-   **역할**: UI 렌더링 및 사용자 이벤트 처리.
-   **구성 요소**: `components/`
-   **허용**: 모든 React 패턴, UI 컴포넌트, 사용자 이벤트 처리.
-   **주의**: 성능에 민감한 로직은 반드시 하위 레이어로 위임.

## 4. 최상위 폴더 구조

```
src/
├── blueprints/              # 🏛️ Blueprint Layer: 도메인 독립적인 순수 데이터
│   ├── characters/
│   └── ...
│
├── core/                    # ❤️ Domain Layer: 각 도메인의 핵심 로직
│   ├── motions/
│   ├── animation/
│   ├── networks/
│   └── ...
│
├── admin/
├── legacy/
└── utils/
```

-   **`blueprints/`**: 캐릭터 스탯, 애니메이션 목록 등 게임의 모든 데이터를 정의하는 순수 TS 객체.
-   **`core/`**: 각 도메인(모션, 애니메이션, 네트워크 등)이 `blueprints`의 데이터를 "소비"하여 실제 로직을 구현하는 곳.

(상세한 가이드는 `BLUEPRINT_GUIDE.md`, `BRIDGE_GUIDE.md`, `HOOK_GUIDE.md` 참조)
