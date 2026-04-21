# 애니메이션 도메인

## 개요

Gaesup World의 애니메이션 도메인은 엔티티 타입별 애니메이션 재생을 공통 방식으로 다루기 위한 계층입니다. 현재 구조는 대체로 아래 흐름을 따릅니다.

- 코어 시스템: `AnimationSystem`
- 브리지: `AnimationBridge`
- 훅: `useAnimationBridge`
- UI 컴포넌트: `AnimationController`, `AnimationPlayer`, `AnimationDebugPanel`

즉, 실제 애니메이션 액션 관리는 시스템에서 하고, 외부에서는 브리지와 훅을 통해 제어합니다.

## 관련 경로

- `src/core/animation/core/`
- `src/core/animation/bridge/`
- `src/core/animation/hooks/`
- `src/core/animation/components/`
- `src/core/animation/stores/`

## 주요 구성 요소

### `AnimationSystem`

애니메이션 도메인의 실제 실행 엔진 역할입니다.

- 엔티티 타입별 애니메이션 상태 관리
- `THREE.AnimationAction` 등록
- 현재 애니메이션 재생/정지
- 가중치, 시간 배율, 믹서 시간 추적
- 메트릭 생성

브리지에서 명령을 받으면 실제 처리는 `AnimationSystem`에서 수행합니다.

### `AnimationBridge`

애니메이션 시스템을 외부와 연결하는 진입점입니다.

특징:

- 도메인 이름은 `animation`
- 기본 엔진 타입으로 `character`, `vehicle`, `airplane`를 등록
- `play`, `stop`, `setWeight`, `setSpeed` 명령 지원
- snapshot 기반 상태 제공
- 리스너 구독 지원

핵심 역할:

- 외부에서 들어온 애니메이션 명령을 `AnimationSystem`으로 전달
- 시스템 상태를 snapshot으로 변환
- store/UI가 읽기 쉬운 형태로 동기화

### `useAnimationBridge`

React 쪽에서 가장 직접적으로 쓰는 진입점입니다.

제공 기능:

- `playAnimation(type, animation)`
- `stopAnimation(type)`
- `executeCommand(type, command)`
- `registerAnimations(type, actions)`
- `currentType`
- `currentAnimation`

이 훅은 브리지 구독을 통해 현재 애니메이션 상태를 `gaesupStore`의 animation 상태와 동기화합니다.

### `AnimationController`

간단한 프리셋 버튼 UI입니다.

- `idle`
- `walk`
- `run`
- `jump`
- `fall`
- `dance`
- `wave`

선택한 애니메이션을 현재 타입에 바로 재생합니다.

### `AnimationPlayer`

재생 가능한 애니메이션 목록을 보여주고, 선택/재생/정지 흐름을 제공하는 UI 컴포넌트입니다.

### `AnimationDebugPanel`

현재 재생 상태와 디버그 정보를 확인하는 패널입니다.

## 동작 흐름

애니메이션 도메인의 기본 흐름은 아래와 같습니다.

1. 모델 로더 또는 엔티티 쪽에서 `THREE.AnimationAction` 목록을 확보합니다.
2. `useAnimationBridge().registerAnimations()`로 브리지에 액션을 등록합니다.
3. UI나 게임 로직에서 `playAnimation()` 또는 `executeCommand()`를 호출합니다.
4. `AnimationBridge`가 해당 타입의 `AnimationSystem`에 명령을 전달합니다.
5. 시스템 상태가 바뀌면 snapshot이 갱신됩니다.
6. 훅과 UI가 snapshot을 기준으로 현재 상태를 반영합니다.

## 타입 단위 관점

현재 구조상 애니메이션은 엔티티 ID 단위라기보다 엔티티 타입 단위로 먼저 관리됩니다.

- `character`
- `vehicle`
- `airplane`

이 때문에 공통 캐릭터 계열 제어에는 편하지만, 개별 인스턴스별로 독립적인 애니메이션 풀을 세밀하게 나누는 방향으로 확장하려면 추가 설계가 필요할 수 있습니다.

## 사용 예시

```tsx
import { useAnimationBridge } from 'gaesup-world';

export function DanceButton() {
  const { playAnimation, currentType } = useAnimationBridge();

  return (
    <button onClick={() => playAnimation(currentType, 'dance')}>
      춤추기
    </button>
  );
}
```

## 현재 강점

- 애니메이션 제어 진입점이 비교적 단순합니다.
- 시스템, 브리지, 훅, UI가 분리되어 있어 재사용이 쉽습니다.
- 타입별 애니메이션 상태를 공통 흐름으로 관리할 수 있습니다.
- snapshot 기반이라 디버그 패널/플레이어 UI 연결이 쉽습니다.

## 현재 한계

- 개별 개체 단위보다 타입 단위 관리 성격이 강합니다.
- 애니메이션 프리셋 이름이 UI에 일부 하드코딩되어 있습니다.
- 실제 GLTF 클립 이름과 도메인 명령 이름 사이의 매핑 전략은 더 정교해질 수 있습니다.

## 함께 보면 좋은 파일

- `src/core/animation/bridge/AnimationBridge.ts`
- `src/core/animation/hooks/useAnimationBridge.ts`
- `src/core/animation/core/AnimationSystem.ts`
- `src/core/animation/components/AnimationController/index.tsx`
- `src/core/animation/components/AnimationPlayer/index.tsx`
- `src/core/animation/components/AnimationDebugPanel/index.tsx`
