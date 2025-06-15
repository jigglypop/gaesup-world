### 리팩토링 계획: `camera` 및 `motions` 모듈 통합

#### 1. 개요 (Overview)

- **목표**: `camera`와 `motions` 모듈을 `motions`이라는 단일 통합 모듈로 리팩토링하여 코드의 응집도를 높이고, 역할을 명확히 하며, 유지보수성을 향상시킨다.
- **핵심 원칙**:
  - **저수준 엔진 분리**: `motions` 모듈은 물리 계산과 카메라 제어를 담당하는 저수준(low-level) 엔진으로 정의한다. 이 엔진은 `ref`를 통해 3D 객체와 직접 상호작용하고, 계산된 최종 상태를 `zustand` 스토어로 전달하는 역할만 수행한다.
  - **상위 계층과의 분리**: UI 렌더링을 담당하는 React 컴포넌트나, 애플리케이션 상태를 관리하는 Hooks (`useGaesupController` 등)는 `motions` 모듈 외부의 상위 계층에 위치시켜 의존성 방향을 명확히 한다.
  - **범용적이고 명확한 네이밍**: `controllers`, `components`와 같이 역할이 모호한 이름을 `behaviors`, `entities` 등 역할이 명확히 드러나는 범용적인 이름으로 변경한다.

#### 2. 문제 분석 (Problem Analysis)

- **`camera`와 `motions`의 강한 결합도**: 카메라의 충돌 감지(`SmartCollisionSystem`)나 캐릭터 추적 기능은 물리 세계의 정보 없이는 구현이 불가능하다. 두 모듈이 분리되어 있어 코드 추적이 어렵고 불필요한 의존성 관계가 형성될 수 있다.
- **모호한 폴더 구조 및 네이밍**:
  - `motions/controllers`: 실제로는 특정 입력을 기반으로 객체의 다음 상태를 계산하는 순수 로직에 가까우나, '컨트롤러'라는 이름은 MVC 패턴의 컨트롤러와 혼동을 줄 수 있다.
  - `motions/components`: React 컴포넌트가 아닌 물리 세계의 '개체(Entity)'를 정의하는 로직이 포함되어 있어 이름이 역할과 불일치한다.
  - `motionsEngine.ts`: 물리 계산을 총괄하는 핵심 로직이지만, 폴더 최상위에 위치하여 다른 모듈과의 관계가 명확하지 않다.
- **잘못된 위치의 파일**: `camera/collision/SmartCollisionSystem.ts`는 카메라 로직이라기보다는 물리 시스템의 일부로, 잘못된 위치에 존재한다.

#### 3. 새로운 폴더 구조 제안 (`motions`)

```
src/core/motions/
├── index.ts                 # motions 모듈의 public API export
├── types.ts                 # motions 모듈 전역에서 사용되는 타입
│
├── core/                    # 엔진의 핵심 로직 및 zustand와 연결부
│   ├── Engine.ts            # (구 motionsEngine.ts) 물리/카메라 계산 총괄 및 상태 업데이트
│   ├── index.ts             # (구 connectors/index.ts)
│   ├── motions.ts           # (구 connectors/motions.ts)
│   └── types.ts             # (구 connectors/types.ts)
│
├── systems/                 # 여러 엔티티/컴포넌트에 걸쳐 동작하는 전역 시스템
│   └── SmartCollisionSystem.ts # (구 camera/collision/SmartCollisionSystem.ts)
│
├── behaviors/               # (구 controllers) 객체의 개별 동작 로직
│   ├── updateDirection.ts   # (구 DirectionController.ts)
│   ├── applyGravity.ts      # (구 GravityController.ts)
│   ├── applyImpulse.ts      # (구 ImpulseController.ts)
│   └── checkState.ts        # (구 StateChecker.ts)
│
├── entities/                # (구 components) 물리 세계를 구성하는 개체(Entity) 관련 로직
│   ├── motionsEntity.tsx
│   ├── EntityController.tsx
│   └── ...
│
└── camera/                  # 카메라 관련 로직 하위 모듈
    ├── index.tsx
    ├── utils.ts
    ├── control/
    ├── effects/
    ├── debug/
    └── blend/
```

#### 4. 실행 계획 (Execution Plan)

1.  **폴더 생성 및 이동 (Directory Creation & Move)**

    1.  `src/core/motions` 폴더를 생성한다.
    2.  `src/core/motions`의 모든 내용을 `src/core/motions`으로 이동한다.
    3.  `src/core/camera`의 모든 내용을 `src/core/motions/camera`로 이동한다.

2.  **구조 재편 및 이름 변경 (Restructure & Rename)**

    1.  `motions/controllers` 폴더 이름을 `motions/behaviors`로 변경한다.
    2.  `motions/components` 폴더 이름을 `motions/entities`로 변경한다.
    3.  `motions/connectors` 폴더 이름을 `motions/core`로 변경한다.
    4.  `motions/systems` 폴더를 새로 생성한다.
    5.  `motions/motionsEngine.ts` 파일을 `motions/core/Engine.ts`로 이동하고 이름을 변경한다.
    6.  `motions/camera/collision/SmartCollisionSystem.ts` 파일을 `motions/systems/SmartCollisionSystem.ts`로 이동한다.
    7.  `motions/behaviors` 폴더 내 파일들의 이름을 역할에 맞게 변경한다.
        - `DirectionController.ts` -> `updateDirection.ts`
        - `GravityController.ts` -> `applyGravity.ts`
        - `ImpulseController.ts` -> `applyImpulse.ts`
        - `StateChecker.ts` -> `checkState.ts`

3.  **정리 (Clean-up)**

    1.  비어있는 `motions/camera/collision` 폴더를 삭제한다.
    2.  리팩토링 완료 후, 최상위의 `src/core/camera`와 `src/core/motions` 폴더를 삭제한다.

4.  **경로 수정 (Update Imports)**
    - 프로젝트 전역에서 변경된 경로를 반영하여 모든 `import` 구문을 수정한다. (e.g., `rg`나 VSCode의 전체 검색/바꾸기 기능 활용)
    - **주요 변경 규칙:**
      - `gaesup/motions/*` -> `gaesup/motions/*`
      - `gaesup/camera/*` -> `gaesup/motions/camera/*`
      - `gaesup/motions/controllers/DirectionController` -> `gaesup/motions/behaviors/updateDirection`

#### 5. 기대 효과 (Expected Outcomes)

- **명확한 역할 분리**: `motions` 엔진은 계산, 상위 계층은 상태 사용 및 렌더링으로 역할이 명확해진다.
- **응집도 향상**: 물리와 카메라 로직이 하나의 모듈(`motions`) 안에서 관리되어 관련 코드 수정이 용이해진다.
- **유지보수성 증대**: 일관된 네이밍과 폴더 구조는 새로운 개발자가 코드를 이해하는 시간을 단축시키고, 버그 발생 가능성을 줄인다.
- **코드 재사용성 증대** : 코드 재사용성을 증가시킨다

## 금지사항

### 1. 코드에 작동되는 기존 로직이 망가지면 절대 안됨

### 2.ref의 커넥션 부분 외 다른 부분에서 zustand의 로직 사용 지양
